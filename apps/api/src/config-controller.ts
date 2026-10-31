import {Controller,Get,Post,Put,Delete,Param,Body,Req,Res,BadRequestException,ForbiddenException} from '@nestjs/common';
import type {Request,Response} from 'express';
import {readFile} from 'node:fs/promises';
import {z} from 'zod';
import {OfficialAccountsService} from './official-accounts';
import {AuthService} from './auth';
import {ConfigurationService,SecretStore,networkInput,brandingInput,environmentNetwork,environmentBranding} from './configuration';
import {origin,parse,decrypt} from './security';
@Controller('api/admin/settings')
export class ConfigurationController {
 constructor(readonly auth:AuthService,readonly config:ConfigurationService,readonly secrets:SecretStore,readonly accounts:OfficialAccountsService){}
 async owner(req:Request){return this.auth.admin(req,['OWNER']);}
 @Get('blockchains')async networks(@Req()req:Request){await this.owner(req);return this.config.list();}
 @Post('blockchains')async create(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.owner(req);return this.config.saveNetwork(parse(networkInput,body),admin.id);}
 @Put('blockchains/:id')async edit(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.owner(req);const b=parse(z.object({config:networkInput,version:z.number().int().min(0)}).strict(),body);return this.config.saveNetwork(b.config,admin.id,id,b.version);}
 @Post('blockchains/:id/enable')async enable(@Param('id')id:string,@Req()req:Request){origin(req);const {admin}=await this.owner(req);return this.config.toggle(id,true,admin.id);}
 @Post('blockchains/:id/disable')async disable(@Param('id')id:string,@Req()req:Request){origin(req);const {admin}=await this.owner(req);return this.config.toggle(id,false,admin.id);}
 @Delete('blockchains/:id')async remove(@Param('id')id:string,@Req()req:Request){origin(req);const {admin}=await this.owner(req);return this.config.removeNetwork(id,admin.id);}
 @Post('blockchains/:id/test/:kind')async test(@Param('id')id:string,@Param('kind')kind:string,@Req()req:Request){
  origin(req);const {admin}=await this.owner(req);await this.auth.limit(req,'rpc-test',30);
  const network=await this.auth.data.db.blockchainNetwork.findUniqueOrThrow({where:{id}});
  const result=await this.config.verify(networkInput.parse(network.config),parse(z.enum(['rpc','wss','explorer','contract']),kind));
  await this.auth.data.db.blockchainNetwork.update({where:{id},data:{verification:result}});
  await this.auth.data.audit(admin.id,'NETWORK_TEST_'+kind,id);return result;
 }
 @Post('blockchains/:id/activate')async activate(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){
  origin(req);const {admin}=await this.owner(req);const b=parse(z.object({confirmation:z.string().max(100),mfaCode:z.string().regex(/^[0-9]{6}$/)}).strict(),body);
  if(!admin.totpEncrypted)throw new ForbiddenException('Fresh MFA required');
  await this.auth.totp(admin.id,decrypt(admin.totpEncrypted),b.mfaCode);
  return this.config.activate(id,admin.id,b.confirmation);
 }
 @Get('branding')async branding(@Req()req:Request){await this.owner(req);return this.config.branding();}
 @Put('branding')async saveBranding(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.owner(req);return this.config.setDocument('branding',parse(brandingInput,body),admin.id);}
 @Get('effective')async effective(@Req()req:Request){await this.owner(req);return {network:await this.config.selected(),runtime:await this.config.document('runtime'),branding:await this.config.branding(),credentials:await this.auth.data.db.credential.findMany({select:{id:true,scope:true,ownerId:true,kind:true,version:true,revokedAt:true}})};}
 @Post('runtime')async runtime(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.owner(req);return this.config.setDocument('runtime',body,admin.id);}
 @Post('env/validate')async validateEnv(@Req()req:Request){origin(req);await this.owner(req);try{const network=environmentNetwork(),branding=environmentBranding();return {valid:true,networkKey:network.networkKey,chainId:network.chainId,brandingName:branding.appName,privateValuesIncluded:false};}catch{throw new BadRequestException('Environment configuration invalid');}}
 @Post('env/import')async importEnv(@Body()body:unknown,@Req()req:Request){
  origin(req);const {admin}=await this.owner(req);const {section}=parse(z.object({section:z.enum(['network','branding'])}).strict(),body);
  if(section==='branding')return this.config.setDocument('branding',environmentBranding(),admin.id);
  const network=environmentNetwork(),existing=await this.auth.data.db.blockchainNetwork.findUnique({where:{networkKey:network.networkKey}});
  return this.config.saveNetwork(network,admin.id,existing?.id,existing?.version||0);
 }
 @Get('env/template')async template(@Req()req:Request,@Res()res:Response){await this.owner(req);const text=await readFile('.env.example','utf8');res.type('text/plain').setHeader('Content-Disposition','attachment; filename="rewards.env.example"');res.send(text);}
 @Post('reload')async reload(@Req()req:Request){origin(req);const {admin}=await this.owner(req);await this.auth.data.redis.publish('configuration:changed',String(Date.now()));await this.auth.data.audit(admin.id,'CONFIGURATION_RELOAD','all');return {ok:true,configurationSource:'database + installation environment',restartRequiredForDatabaseChanges:false,environmentChangesRequirePrivilegedRestart:true};}
 @Get('history')async history(@Req()req:Request){await this.owner(req);return this.auth.data.db.auditEvent.findMany({where:{OR:[{action:{startsWith:'CONFIGURATION_'}},{action:{startsWith:'NETWORK_'}},{action:{startsWith:'OWNER_NETWORK_'}},{action:{startsWith:'INTEGRATION_'}},{action:{startsWith:'CREDENTIAL_'}}]},orderBy:{createdAt:'desc'},take:100});}
 @Get('credentials')async credentials(@Req()req:Request){await this.owner(req);return this.auth.data.db.credential.findMany({select:{id:true,scope:true,ownerId:true,kind:true,version:true,revokedAt:true,updatedAt:true}});}
 @Post('credentials')async storeCredential(@Body()body:unknown,@Req()req:Request){
  origin(req);const {admin}=await this.owner(req);
  const b=parse(z.object({scope:z.enum(['NETWORK','SOCIAL_PLATFORM','OFFICIAL_ACCOUNT']),ownerId:z.string().min(1).max(100),kind:z.enum(['OAUTH_CONFIG','TOKENS','RPC_HEADERS','EXPLORER_API_KEY','REWARD_SIGNER_PRIVATE_KEY','DEPLOYER_PRIVATE_KEY']),value:z.string().min(1).max(30000),mfaCode:z.string().regex(/^[0-9]{6}$/).optional()}).strict(),body);
  await this.auth.stepUp(req,b.mfaCode);
  if(b.scope==='NETWORK'){if(!await this.auth.data.db.blockchainNetwork.findUnique({where:{id:b.ownerId}}))throw new BadRequestException('Network not found');if(!['RPC_HEADERS','EXPLORER_API_KEY','REWARD_SIGNER_PRIVATE_KEY','DEPLOYER_PRIVATE_KEY'].includes(b.kind))throw new BadRequestException('Credential kind rejected');if(b.kind.endsWith('PRIVATE_KEY')&&!/^0x[0-9a-fA-F]{64}$/.test(b.value))throw new BadRequestException('Private key format invalid');}
  else if(b.scope==='SOCIAL_PLATFORM'){if(!['X','TELEGRAM','FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK','DISCORD','GITHUB'].includes(b.ownerId)||b.kind!=='OAUTH_CONFIG')throw new BadRequestException('Platform credential rejected');try{const obj=JSON.parse(b.value);if(!obj||typeof obj!=='object'||Array.isArray(obj))throw new Error();const allowed=['clientId','clientSecret','apiKey','apiSecret','accessToken','refreshToken','bearerToken','botToken','webhookSecret','pageAccessToken'];if(Object.entries(obj).some(([k,v])=>!allowed.includes(k)||typeof v!=='string'))throw new Error();}catch{throw new BadRequestException('Credential fields invalid');}}
  else {if(b.kind!=='TOKENS'||!await this.auth.data.db.officialSocialAccount.findUnique({where:{id:b.ownerId}}))throw new BadRequestException('Official account rejected');}
  let value=b.value;if(b.scope==='SOCIAL_PLATFORM'){const previous=await this.secrets.get(b.scope,b.ownerId,b.kind);value=JSON.stringify({...previous?JSON.parse(previous):{},...JSON.parse(b.value)});}
  return this.secrets.set(b.scope,b.ownerId,b.kind,value,admin.id);
 }
 @Delete('credentials/:id')async revokeCredential(@Param('id')id:string,@Req()req:Request){origin(req);const {admin}=await this.owner(req);const c=await this.auth.data.db.credential.findUniqueOrThrow({where:{id}});if(c.scope==='OFFICIAL_ACCOUNT')return this.accounts.disconnect(c.ownerId,admin.id);
  if(c.scope==='SOCIAL_PLATFORM')await this.auth.data.db.integrationSetting.upsert({where:{platform:c.ownerId},create:{platform:c.ownerId,disabled:true},update:{disabled:true}});
  if(c.scope==='NETWORK'){const runtime=await this.config.document('runtime');await this.config.setDocument('runtime',{...runtime,multiChainEnabled:false,claimsPaused:true},admin.id);}
  return this.secrets.remove(c.scope,c.ownerId,c.kind,admin.id);}
}
