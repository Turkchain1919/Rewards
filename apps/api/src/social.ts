import {Controller,Get,Post,Delete,Param,Query,Req,Res,ServiceUnavailableException,UnauthorizedException,ConflictException} from '@nestjs/common';
import type {Request,Response} from 'express';
import {randomBytes} from 'node:crypto';
import {z} from 'zod';
import {AuthService} from './auth';
import {origin,parse,digest,decrypt,cookie,readCookie,equal} from './security';
import {revokeOAuth} from './oauth-lifecycle';
import {OfficialAccountsService} from './official-accounts';
import {SecretStore} from './configuration';
import {IntegrationSettings} from './integration-settings';
import {socialPlatforms,Platform,configuration,authorizationUrl,exchange} from './providers';
@Controller(['api/social','api/oauth'])
export class SocialController {
 constructor(private readonly auth:AuthService,private readonly settings:IntegrationSettings,private readonly secrets:SecretStore,private readonly official:OfficialAccountsService){}
 platform(name:string):Platform{return parse(z.enum(socialPlatforms),name.toUpperCase());}
 @Get('accounts')async accounts(@Req()req:Request){
  const user=await this.auth.user(req);
  const accounts=await this.auth.data.db.socialAccount.findMany({where:{userId:user.id},select:{provider:true,accountName:true,expiresAt:true,createdAt:true,scopes:true}});
  return (await this.settings.list()).map(provider=>({...provider,account:accounts.find(a=>a.provider===provider.platform)||null}));
 }
 @Post(':provider/connect')async connect(@Param('provider')name:string,@Req()req:Request,@Res({passthrough:true})res:Response){
  origin(req);const user=await this.auth.user(req);await this.auth.limit(req,'oauth:'+user.id,12);
  const platform=this.platform(name),override=await this.settings.runtime(platform);const configured=configuration(platform,override);if(!configured.ready||!await this.settings.usable(platform))throw new ServiceUnavailableException('Social provider not configured');
  const link=await this.auth.data.db.socialLinkState.upsert({where:{userId_provider:{userId:user.id,provider:platform}},create:{userId:user.id,provider:platform},update:{}});
  const state=randomBytes(32).toString('hex'),binder=randomBytes(32).toString('hex'),verifier=randomBytes(32).toString('base64url'),nonce=randomBytes(24).toString('hex');
  await this.auth.data.redis.set('oauth:'+digest(state),JSON.stringify({platform,generation:link.generation,fingerprint:digest(configured.clientId+':'+configured.redirect),userId:user.id,sessionId:digest(readCookie(req,'user')),binder:digest(binder),verifier,nonce}),'EX',300);
  cookie(res,'oauth',binder,300000);return {url:authorizationUrl(platform,state,verifier,nonce,override)};
 }
 @Get(':provider/callback')async callback(@Param('provider')name:string,@Query()query:Record<string,unknown>,@Req()req:Request,@Res()res:Response){
  res.setHeader('Referrer-Policy','no-referrer');
  const platform=this.platform(name);
  const b=parse(z.object({state:z.string().regex(/^[a-f0-9]{64}$/),code:z.string().min(1).max(4096).optional(),error:z.string().max(200).optional()}).passthrough(),query);
  const raw=await this.auth.data.redis.getdel('oauth:'+digest(b.state));
  if(!raw)throw new UnauthorizedException('OAuth state expired');
  const state=JSON.parse(raw) as {mode?:string;officialAccountId?:string;adminId?:string;version?:number;generation?:number;fingerprint?:string;platform:Platform;userId:string;sessionId:string;binder:string;verifier:string;nonce:string};
  cookie(res,'oauth','',0);
  if(state.platform!==platform||!equal(state.binder,digest(readCookie(req,'oauth'))))throw new UnauthorizedException('OAuth browser binding rejected');
  const override=await this.settings.runtime(platform,state.mode==='official'?'official':'user'),configured=configuration(platform,override);
  if(state.fingerprint&&state.fingerprint!==digest(configured.clientId+':'+configured.redirect))throw new ConflictException('OAuth configuration changed; reconnect');
  if(state.mode==='official'){
   const session=await this.auth.data.db.authSession.findUnique({where:{id:state.sessionId},include:{admin:true}});
   if(!session?.admin||session.admin.id!==state.adminId||!session.admin.enabled||!session.mfaVerified||session.expiresAt.getTime()<Date.now()||!['OWNER','ADMIN'].includes(session.admin.role))throw new UnauthorizedException();
   if(b.error||!b.code)return res.redirect(303,process.env.APP_URL+'/admin?social=denied');
   if(!configured.ready)throw new ServiceUnavailableException('Provider unavailable');
   try{const profile=await exchange(platform,b.code,state.verifier,state.nonce,fetch,override);const result=await this.official.acceptOAuth(state.officialAccountId!,state.adminId!,profile,state.version);return res.redirect(303,process.env.APP_URL+'/admin?social='+(result.selectionRequired?'select_target':'connected'));}
   catch{await this.auth.data.db.officialSocialAccount.updateMany({where:{id:state.officialAccountId!,deletedAt:null},data:{lastError:'PROVIDER_OR_PERMISSION_REJECTED'}});await this.auth.data.audit(state.adminId!,'OFFICIAL_ACCOUNT_CONNECT_FAILED',state.officialAccountId!);return res.redirect(303,process.env.APP_URL+'/admin?social=error');}
  }
  const session=await this.auth.data.db.authSession.findUnique({where:{id:state.sessionId}});
  if(!session||session.userId!==state.userId||session.expiresAt.getTime()<Date.now())throw new UnauthorizedException();
  if(b.error||!b.code)return res.redirect(303,process.env.APP_URL+'/dashboard?social=denied');
  if(!configured.ready||!await this.settings.usable(platform))throw new ServiceUnavailableException('Social provider not configured');
  try{
   const profile=await exchange(platform,b.code,state.verifier,state.nonce,fetch,override);
   await this.auth.data.db.$transaction(async tx=>{
    await tx.$queryRaw`SELECT "userId" FROM "SocialLinkState" WHERE "userId"=${state.userId} AND "provider"=${platform} FOR UPDATE`;
    const generation=await tx.socialLinkState.findUniqueOrThrow({where:{userId_provider:{userId:state.userId,provider:platform}}});if(generation.generation!==state.generation)throw new ConflictException('Connection was cancelled');
    const existing=await tx.socialAccount.findUnique({where:{provider_providerAccountId:{provider:platform,providerAccountId:profile.accountId}}});
    if(existing&&existing.userId!==state.userId)throw new ConflictException('Account already linked');
    const credential=await this.secrets.write(tx,'PERSONAL_ACCOUNT',state.userId+':'+platform,'TOKENS',JSON.stringify(profile.tokens),state.userId);
    const data={providerAccountId:profile.accountId,accountName:profile.name,credentialId:credential.id,encryptedTokens:null,expiresAt:new Date(profile.tokens.expiresAt),scopes:profile.scopes};
    await tx.socialAccount.upsert({where:{userId_provider:{userId:state.userId,provider:platform}},create:{...data,userId:state.userId,provider:platform},update:data});
    await tx.auditEvent.create({data:{actor:state.userId,action:'SOCIAL_LINK',resource:platform}});
   });
   return res.redirect(303,process.env.APP_URL+'/dashboard?social=connected');
  }catch{await this.auth.data.audit(state.userId,'SOCIAL_LINK_FAILED',platform);return res.redirect(303,process.env.APP_URL+'/dashboard?social=error');}
 }
 @Delete(':provider')async disconnect(@Param('provider')name:string,@Req()req:Request){
  origin(req);const user=await this.auth.user(req),platform=this.platform(name);
  let providerRevoked=false;const existing=await this.auth.data.db.socialAccount.findUnique({where:{userId_provider:{userId:user.id,provider:platform}}});
  if(existing?.credentialId){try{const c=await this.auth.data.db.credential.findUnique({where:{id:existing.credentialId}});if(c?.ciphertext){const result=await revokeOAuth(platform,JSON.parse(decrypt(c.ciphertext)),await this.settings.runtime(platform));providerRevoked=result.revoked;}}catch{}}
  await this.auth.data.db.$transaction(async tx=>{
   await tx.socialLinkState.upsert({where:{userId_provider:{userId:user.id,provider:platform}},create:{userId:user.id,provider:platform,generation:1},update:{generation:{increment:1}}});
   const account=await tx.socialAccount.findUnique({where:{userId_provider:{userId:user.id,provider:platform}}});
   if(account?.credentialId)await tx.credential.update({where:{id:account.credentialId},data:{ciphertext:null,revokedAt:new Date(),version:{increment:1}}});
   await tx.socialAccount.deleteMany({where:{userId:user.id,provider:platform}});
   await tx.auditEvent.create({data:{actor:user.id,action:'SOCIAL_UNLINK',resource:platform}});
  });
  return {ok:true,providerRevocationRequired:!providerRevoked};
 }
}
