import {Injectable,Controller,Get,Post,Put,Delete,Param,Body,Req,Res,ConflictException,NotFoundException,ServiceUnavailableException,BadRequestException,ForbiddenException} from '@nestjs/common';
import type {Request,Response} from 'express';
import {randomBytes} from 'node:crypto';
import {z} from 'zod';
import {OAuthLifecycle,revokeOAuth} from './oauth-lifecycle';
import {AuthService} from './auth';
import {DataService} from './data';
import {SecretStore} from './configuration';
import {IntegrationSettings} from './integration-settings';
import {officialPlatforms,officialAccount,safeTarget} from './social-config';
import {Platform,TokenProfile,configuration,authorizationUrl} from './providers';
import {telegramBotChat} from './telegram-verifier';
import {origin,parse,digest,encrypt,decrypt,cookie} from './security';
const url=z.string().max(2048);
const telegramGroupTarget=(v:string)=>/^-[1-9][0-9]{0,23}$/.test(v)||/^@[A-Za-z0-9_]{5,32}$/.test(v);
const telegramGroupDefaultTarget=(v:string)=>telegramGroupTarget(v)||(!/^[0-9]+$/.test(v)&&/^[A-Za-z0-9_]{5,32}$/.test(v));
const telegramGroupTargetMessage='Telegram GROUP/CHANNEL Chat ID must be a negative numeric string (for example -1003676977941) or a valid @username.';
const telegramTarget=(v:string)=>/^-?[0-9]{1,24}$/.test(v)||/^@?[A-Za-z0-9_]{5,32}$/.test(v);
export const officialInput=z.object({platform:z.string().regex(/^[A-Z][A-Z0-9_]{0,39}$/),accountType:z.enum(['PROFILE','PAGE','CHANNEL','GROUP','BOT','GUILD','ORGANIZATION','REPOSITORY']).default('PROFILE'),name:z.string().trim().min(2).max(100),username:z.string().max(100).default(''),accountId:z.string().max(200).default(''),profileUrl:url.default(''),defaultTargetUrl:url.default(''),enabled:z.boolean().default(false)}).strict().superRefine((v,ctx)=>{
 const telegramGroup=v.platform==='TELEGRAM'&&['GROUP','CHANNEL'].includes(v.accountType);
 if(telegramGroup&&v.accountId&&!telegramGroupTarget(v.accountId))ctx.addIssue({code:'custom',path:['accountId'],message:telegramGroupTargetMessage});
 if(v.profileUrl&&!safeTarget(v.profileUrl))ctx.addIssue({code:'custom',path:['profileUrl'],message:'Enter a safe HTTPS profile URL.'});
 if(v.defaultTargetUrl&&!safeTarget(v.defaultTargetUrl)&&!(v.platform==='TELEGRAM'&&(telegramGroup?telegramGroupDefaultTarget(v.defaultTargetUrl):telegramTarget(v.defaultTargetUrl))))ctx.addIssue({code:'custom',path:['defaultTargetUrl'],message:telegramGroup?telegramGroupTargetMessage:'Enter a safe HTTPS URL or a Telegram chat ID or username.'});
 if(v.platform==='TELEGRAM'&&/^-?[0-9]{1,24}$/.test(v.defaultTargetUrl)&&!v.username&&!v.profileUrl)ctx.addIssue({code:'custom',path:['defaultTargetUrl'],message:'A public Telegram username or profile URL is required to create a task link.'});
}).transform(v=>{
 if(v.platform!=='TELEGRAM'||!v.defaultTargetUrl||safeTarget(v.defaultTargetUrl))return v;
 const candidate=/^-?[0-9]{1,24}$/.test(v.defaultTargetUrl)?(v.username||v.profileUrl):v.defaultTargetUrl;
 const username=candidate.replace(/^@/,'').replace(/^https:\/\/t\.me\//i,'').replace(/\/$/,'');
 return {...v,defaultTargetUrl:/^[A-Za-z0-9_]{5,32}$/.test(username)?'https://t.me/'+username:v.defaultTargetUrl};
});
@Injectable()
export class OfficialAccountsService {
 constructor(readonly data:DataService,readonly settings:IntegrationSettings,readonly secrets:SecretStore){}
 async onModuleInit(){await this.importEnv('system');}
 async importEnv(actor:string){
  await this.data.db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(81732,2004)`;
   for(const platform of officialPlatforms){
    await tx.socialPlatform.upsert({where:{key:platform},create:{key:platform,name:platform,connector:platform},update:{}});
    const c=officialAccount(platform);if(!c.name&&!c.profileUrl&&!c.accountId)continue;
    const sourceKey='env:'+platform;
    const old=await tx.officialSocialAccount.findUnique({where:{sourceKey}});
    if(old?.deletedAt)continue;
    const metadata={name:c.name||platform+' official account',username:c.name,accountId:c.accountId,profileUrl:c.profileUrl||'',defaultTargetUrl:c.defaultTargetUrl||''};
    if(!old){const hasDefault=await tx.officialSocialAccount.findFirst({where:{platform,isDefault:true,deletedAt:null}});
     await tx.officialSocialAccount.create({data:{...metadata,platform,sourceKey,enabled:c.enabled,isDefault:!hasDefault}});
    }else if(!old.metadataOverride&&!old.credentialId)await tx.officialSocialAccount.update({where:{id:old.id},data:metadata});
   }
   if(actor!=='system')await tx.auditEvent.create({data:{actor,action:'OFFICIAL_ACCOUNTS_ENV_IMPORT',resource:'metadata_only'}});
  },{timeout:15000});return {ok:true};
 }
 async list(){const rows=await this.data.db.officialSocialAccount.findMany({where:{deletedAt:null},orderBy:{createdAt:'asc'}});return rows.map(row=>({...row,hasCredential:!!row.credentialId}));}
 async public(){return (await this.list()).filter(a=>a.enabled).map(({id,platform,accountType,name,username,profileUrl,defaultTargetUrl,isDefault,connectionStatus})=>({id,platform,accountType,name,username,profileUrl,defaultTargetUrl,isDefault,connectionStatus}));}
 async save(actor:string,b:z.infer<typeof officialInput>,id?:string){
  if(!await this.data.db.socialPlatform.findUnique({where:{key:b.platform}}))throw new BadRequestException('Register platform first');
  return this.data.db.$transaction(async tx=>{
   const old=id?await tx.officialSocialAccount.findUnique({where:{id}}):null;
   if(id&&(!old||old.deletedAt))throw new NotFoundException();
   if(old&&old.platform!==b.platform)throw new ConflictException('Account platform cannot change');
   const identityChanged=!!old&&old.accountId!==b.accountId;
   if(identityChanged&&old?.credentialId)throw new ConflictException('Disconnect before replacing account identity');
   const row=old?await tx.officialSocialAccount.update({where:{id:old.id},data:{...b,metadataOverride:true,version:{increment:1}}}):await tx.officialSocialAccount.create({data:{...b,metadataOverride:true,isDefault:!await tx.officialSocialAccount.findFirst({where:{platform:b.platform,isDefault:true,deletedAt:null}})}});
   if(!b.enabled)await tx.task.updateMany({where:{officialAccountId:row.id},data:{enabled:false,configurationRequired:true}});
   await tx.auditEvent.create({data:{actor,action:old?'OFFICIAL_ACCOUNT_EDIT':'OFFICIAL_ACCOUNT_ADD',resource:row.id}});return row;
  });
 }
 async setDefault(actor:string,id:string){
  const a=await this.data.db.officialSocialAccount.findUniqueOrThrow({where:{id}});if(a.deletedAt)throw new NotFoundException();
  await this.data.db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(81732,2004)`;
   await tx.officialSocialAccount.updateMany({where:{platform:a.platform,isDefault:true},data:{isDefault:false}});
   await tx.officialSocialAccount.update({where:{id},data:{isDefault:true}});
   await tx.auditEvent.create({data:{actor,action:'OFFICIAL_ACCOUNT_DEFAULT',resource:id}});
  });return {ok:true};
 }
 async connectTelegram(id:string,actor:string,fetcher:typeof fetch=fetch){
  const account=await this.data.db.officialSocialAccount.findUnique({where:{id}});
  if(!account||account.deletedAt)throw new NotFoundException();
  if(account.platform!=='TELEGRAM'||!['CHANNEL','GROUP'].includes(account.accountType))throw new BadRequestException('Telegram group or channel account required');
  const settings=await this.settings.secretValues('TELEGRAM'),token=settings.botToken;
  if(!token||!(await this.settings.list()).find(v=>v.platform==='TELEGRAM')?.enabled)throw new ServiceUnavailableException('Configure and enable the Telegram Bot API token first');
  const target=account.accountId||account.username;
  if(!target)throw new BadRequestException('Telegram chat ID or username required');
  let verified;
  try{verified=await telegramBotChat(token,target,account.accountType as 'GROUP'|'CHANNEL',fetcher);}catch{throw new ServiceUnavailableException('Telegram chat access or bot administrator verification failed');}
  await this.data.db.$transaction(async tx=>{
   await tx.$queryRawUnsafe('SELECT "id" FROM "OfficialSocialAccount" WHERE "id"=$1 FOR UPDATE',id);
   const fresh=await tx.officialSocialAccount.findUniqueOrThrow({where:{id}});
   if(fresh.deletedAt||fresh.version!==account.version)throw new ConflictException('Account configuration changed; retry connection');
   await tx.officialSocialAccount.update({where:{id},data:{...verified,connectionStatus:'CONNECTED',lastSuccessAt:new Date(),lastError:null,metadataOverride:true,version:{increment:1}}});
   await tx.task.updateMany({where:{officialAccountId:id,enabled:false},data:{configurationRequired:false}});
   await tx.auditEvent.create({data:{actor,action:'OFFICIAL_ACCOUNT_CONNECTED',resource:id}});
  });
  return {ok:true,connected:true,account:{id,platform:'TELEGRAM',accountType:verified.accountType,name:verified.name,username:verified.username,accountId:verified.accountId,profileUrl:verified.profileUrl}};
 }
 async acceptOAuth(id:string,actor:string,profile:TokenProfile,expectedVersion?:number,targetId?:string){
  const account=await this.data.db.officialSocialAccount.findUniqueOrThrow({where:{id}});
  if(account.deletedAt)throw new ConflictException('Account removed');
  if(expectedVersion!==undefined&&account.version!==expectedVersion)throw new ConflictException('Connection configuration changed');
  let targets=profile.targets;
  if(account.platform==='GITHUB'&&['ORGANIZATION','REPOSITORY'].includes(account.accountType)){
   const organization=process.env.GITHUB_ORGANIZATION||process.env.GITHUB_ORG_NAME||'';
   const repository=process.env.GITHUB_REPOSITORY||process.env.GITHUB_REPO_NAME||'';
   const target=account.accountId||(account.accountType==='REPOSITORY'?organization+'/'+repository:organization);
   if(!/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?$/.test(target))throw new BadRequestException('GitHub target missing');
   const endpoint=account.accountType==='REPOSITORY'?'https://api.github.com/repos/'+target:'https://api.github.com/user/memberships/orgs/'+target;
   const r=await fetch(endpoint,{headers:{Authorization:'Bearer '+profile.tokens.accessToken,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(10000)});
   if(!r.ok)throw new ForbiddenException('GitHub target administration permission required');
   const data=await r.json() as {state?:string;role?:string;permissions?:{admin?:boolean};full_name?:string;organization?:{login?:string}};
   if(account.accountType==='REPOSITORY'?!data.permissions?.admin:data.state!=='active'||data.role!=='admin')throw new ForbiddenException('GitHub administrator permission required');
   targets=[{accountId:account.accountType==='REPOSITORY'?data.full_name||target:data.organization?.login||target,name:target,accountType:account.accountType,profileUrl:'https://github.com/'+target}];
  }
  if(account.platform==='TELEGRAM'&&['CHANNEL','GROUP'].includes(account.accountType)){
   const raw=await this.secrets.get('SOCIAL_PLATFORM','TELEGRAM','OAUTH_CONFIG');
   const config=raw?JSON.parse(raw) as Record<string,string>:{};
   const token=config.botToken||process.env.TELEGRAM_BOT_TOKEN||'';
   if(!token)throw new ForbiddenException('TELEGRAM_BOT_TOKEN and administrator permissions required');
   const target=account.accountId||account.username;if(!target)throw new BadRequestException('Telegram chat ID required');
   const verified=await telegramBotChat(token,target,account.accountType as 'GROUP'|'CHANNEL');
   targets=[{accountId:verified.accountId,name:verified.name,accountType:verified.accountType,profileUrl:verified.profileUrl}];
  }
  if(!targets)targets=[{accountId:profile.accountId,name:profile.name,accountType:account.accountType,profileUrl:account.profileUrl}];
  if(!targets.length)throw new ForbiddenException('Required account permissions were not granted');
  const requested=targetId||account.accountId;
  const selected=requested?targets.find(t=>account.platform==='GITHUB'?t.accountId.toLowerCase()===requested.toLowerCase():t.accountId===requested):targets.length===1?targets[0]:null;
  if(requested&&!selected)throw new ConflictException('Authorized identity differs from configured account');
  if(!selected){
   await this.data.redis.set('official-choice:'+id+':'+actor,encrypt(JSON.stringify({profile,version:account.version})),'EX',300);
   await this.data.db.officialSocialAccount.update({where:{id},data:{connectionStatus:'SELECT_TARGET',lastError:null}});
   return {selectionRequired:true};
  }
  const tokenData=selected.tokens||profile.tokens;
  await this.data.db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT "id" FROM "OfficialSocialAccount" WHERE "id"=${id} FOR UPDATE`;
   const fresh=await tx.officialSocialAccount.findUniqueOrThrow({where:{id}});
   if(fresh.deletedAt||fresh.version!==account.version)throw new ConflictException('Connection configuration changed');
   const credential=await this.secrets.write(tx,'OFFICIAL_ACCOUNT',id,'TOKENS',JSON.stringify(tokenData),actor);
   await tx.officialSocialAccount.update({where:{id},data:{accountId:selected.accountId,name:selected.name,profileUrl:selected.profileUrl||account.profileUrl,credentialId:credential.id,connectionStatus:'CONNECTED',lastSuccessAt:new Date(),lastError:null,metadataOverride:true,version:{increment:1}}});
   await tx.task.updateMany({where:{officialAccountId:id,enabled:false},data:{configurationRequired:false}});
   await tx.auditEvent.create({data:{actor,action:'OFFICIAL_ACCOUNT_CONNECTED',resource:id}});
  });return {ok:true,selectionRequired:false};
 }
 async choices(id:string,actor:string){
  const raw=await this.data.redis.get('official-choice:'+id+':'+actor);if(!raw)throw new ConflictException('Connection selection expired');
  const payload=JSON.parse(decrypt(raw)) as {profile:TokenProfile;version:number};const a=await this.data.db.officialSocialAccount.findUniqueOrThrow({where:{id}});if(a.deletedAt||a.version!==payload.version)throw new ConflictException('Selection configuration changed');return (payload.profile.targets||[]).map(({accountId,name,accountType,profileUrl})=>({accountId,name,accountType,profileUrl}));
 }
 async choose(id:string,actor:string,accountId:string){
  const options=await this.choices(id,actor);if(!options.some(a=>a.accountId===accountId))throw new BadRequestException('Target rejected');
  const raw=await this.data.redis.getdel('official-choice:'+id+':'+actor);if(!raw)throw new ConflictException('Selection already consumed');
  const payload=JSON.parse(decrypt(raw)) as {profile:TokenProfile;version:number};
  return this.acceptOAuth(id,actor,payload.profile,payload.version,accountId);
 }
 async disconnect(id:string,actor:string,remove=false){
  const a=await this.data.db.officialSocialAccount.findUniqueOrThrow({where:{id}});if(a.deletedAt)throw new NotFoundException();
  let providerRevoked=false;
  if(a.credentialId){try{const c=await this.data.db.credential.findUnique({where:{id:a.credentialId}});if(c?.ciphertext){const result=await revokeOAuth(a.platform as Platform,JSON.parse(decrypt(c.ciphertext)),await this.settings.runtime(a.platform as Platform,'official'));providerRevoked=result.revoked;}}catch{}}
  await this.data.db.$transaction(async tx=>{
   if(a.credentialId)await tx.credential.update({where:{id:a.credentialId},data:{ciphertext:null,revokedAt:new Date(),version:{increment:1}}});
   await tx.officialSocialAccount.update({where:{id},data:{credentialId:null,enabled:false,isDefault:remove?false:a.isDefault,connectionStatus:'DISCONNECTED',lastError:providerRevoked?null:'PROVIDER_REVOCATION_REQUIRES_REVIEW',...(remove?{deletedAt:new Date()}:{}),version:{increment:1}}});
   await tx.task.updateMany({where:{officialAccountId:id},data:{enabled:false,configurationRequired:true}});
   await tx.auditEvent.create({data:{actor,action:remove?'OFFICIAL_ACCOUNT_REMOVED':'OFFICIAL_ACCOUNT_DISCONNECTED',resource:id}});
  });return {ok:true,providerRevocationRequired:!providerRevoked,dependentTasksPaused:true};
 }
}
@Controller('api/admin')
export class OfficialAccountsController {
 constructor(readonly auth:AuthService,readonly accounts:OfficialAccountsService,readonly lifecycle:OAuthLifecycle){}
 manage(req:Request){return this.auth.admin(req,['OWNER','ADMIN']);}
 @Get('social-platforms')async platforms(@Req()req:Request){await this.manage(req);return this.auth.data.db.socialPlatform.findMany();}
 @Post('social-platforms')async platform(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);const b=parse(z.object({key:z.string().regex(/^[A-Z][A-Z0-9_]{0,39}$/),name:z.string().min(2).max(100)}).strict(),body);await this.auth.data.db.socialPlatform.create({data:{...b,connector:'METADATA_ONLY'}});await this.auth.data.audit(admin.id,'SOCIAL_PLATFORM_ADD',b.key);return {ok:true};}
 @Get('official-accounts')async list(@Req()req:Request){await this.manage(req);return this.accounts.list();}
 @Post('official-accounts')async create(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.accounts.save(admin.id,parse(officialInput,body));}
 @Put('official-accounts/:id')async edit(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.accounts.save(admin.id,parse(officialInput,body),id);}
 @Post('official-accounts/import-env')async importEnv(@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.accounts.importEnv(admin.id);}
 @Post('official-accounts/:id/default')async setDefault(@Param('id')id:string,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.accounts.setDefault(admin.id,id);}
 @Post('official-accounts/:id/disconnect')async disconnect(@Param('id')id:string,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.accounts.disconnect(id,admin.id);}
 @Delete('official-accounts/:id')async remove(@Param('id')id:string,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.accounts.disconnect(id,admin.id,true);}
 @Get('official-accounts/:id/connection-options')async choices(@Param('id')id:string,@Req()req:Request){const {admin}=await this.manage(req);return this.accounts.choices(id,admin.id);}
 @Post('official-accounts/:id/select-target')async choose(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);const b=parse(z.object({accountId:z.string().min(1).max(200)}).strict(),body);return this.accounts.choose(id,admin.id,b.accountId);}
 @Post('official-accounts/:id/connect')async connect(@Param('id')id:string,@Req()req:Request,@Res({passthrough:true})res:Response){
  origin(req);const {admin,session}=await this.manage(req);const a=await this.auth.data.db.officialSocialAccount.findUniqueOrThrow({where:{id}});
  if(a.deletedAt)throw new NotFoundException();
  const platform=parse(z.enum(officialPlatforms),a.platform) as Platform;
  if(platform==='TELEGRAM'&&['CHANNEL','GROUP'].includes(a.accountType))return this.accounts.connectTelegram(id,admin.id);
  const override=await this.accounts.settings.runtime(platform,'official'),c=configuration(platform,override);
  if(!c.ready)throw new ServiceUnavailableException('OAuth credentials, activation or app permissions missing');
  const state=randomBytes(32).toString('hex'),binder=randomBytes(32).toString('hex'),verifier=randomBytes(32).toString('base64url'),nonce=randomBytes(24).toString('hex');
  await this.auth.data.redis.set('oauth:'+digest(state),JSON.stringify({mode:'official',platform,officialAccountId:id,version:a.version,adminId:admin.id,sessionId:session.id,binder:digest(binder),verifier,nonce,fingerprint:digest(c.clientId+':'+c.redirect)}),'EX',300);
  cookie(res,'oauth',binder,300000);return {url:authorizationUrl(platform,state,verifier,nonce,override)};
 }
 @Post('official-accounts/:id/refresh')async refresh(@Param('id')id:string,@Req()req:Request){origin(req);const {admin}=await this.manage(req);const a=await this.auth.data.db.officialSocialAccount.findUniqueOrThrow({where:{id}});if(!a.credentialId||a.deletedAt)throw new ConflictException('Reconnect account');const c=configuration(a.platform as Platform,await this.accounts.settings.runtime(a.platform as Platform,'official'));return this.lifecycle.refresh(a.credentialId,a.platform as Platform,a.accountId,a.accountType,c.definition.scopes,admin.id,undefined,a.id);}
 @Post('official-accounts/:id/test')async test(@Param('id')id:string,@Req()req:Request){origin(req);const {admin}=await this.manage(req);const a=await this.auth.data.db.officialSocialAccount.findUniqueOrThrow({where:{id}});const raw=a.credentialId?(await this.auth.data.db.credential.findUnique({where:{id:a.credentialId}}))?.ciphertext:null;
  const tokens=raw?JSON.parse(decrypt(raw)) as Record<string,string>:undefined;
  const result=await this.accounts.settings.test(parse(z.enum(officialPlatforms),a.platform),admin.id,{accountId:a.accountId,accountType:a.accountType,name:a.name,tokens});
  await this.auth.data.db.officialSocialAccount.update({where:{id},data:{lastError:result.error,...(result.status==='verified'?{lastSuccessAt:new Date()}:{})}});
  return result;}
 @Get('social-connections')async personalConnections(@Req()req:Request){await this.manage(req);return this.auth.data.db.socialAccount.findMany({select:{id:true,userId:true,provider:true,providerAccountId:true,accountName:true,scopes:true,expiresAt:true,lastRefreshAt:true,lastError:true}});}
}
