import {Injectable,BadRequestException,ForbiddenException,ConflictException,ServiceUnavailableException,UnauthorizedException} from '@nestjs/common';
import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import {DataService} from './data';
import {EngineService,taskInput} from './engine';
import {IntegrationSettings} from './integration-settings';
import {SecretStore} from './configuration';
import {configuration} from './providers';
import {OfficialPlatform} from './social-config';
import {catalogTask,socialTaskCatalog} from './social-catalog';
import {socialAdapters} from './social-adapters';
import {parseSocialTarget} from './social-targets';
import {socialIdentityHash} from './social-identity';
import {socialRequest,SocialApiFailure} from './social-http';
import {header,WebhookHeaders} from './social-webhook-signatures';
import {currentKickPublicKey} from './kick-public-key';
import type {RewardPlatform} from './social-catalog';
import {decrypt} from './security';
import {z} from 'zod';
export const batchSocialInput=z.object({campaignId:z.string().min(10).max(64),idempotencyKey:z.string().regex(/^[A-Za-z0-9_-]{16,100}$/),items:z.array(taskInput).min(1).max(20)}).strict();
const supportedWebhooks=new Set(['TELEGRAM','TWITCH','KICK','FACEBOOK','INSTAGRAM']);
const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
@Injectable()
export class SocialRewardsService{
 constructor(readonly data:DataService,readonly engine:EngineService,readonly settings:IntegrationSettings,readonly secrets:SecretStore){}
 async catalog(platform?:string){
  const integrations=await this.settings.list(),accounts=await this.data.db.officialSocialAccount.findMany({where:{deletedAt:null},select:{platform:true,accountType:true,connectionStatus:true,enabled:true}});
  return socialTaskCatalog.filter(row=>!platform||row.platform===platform).map(row=>{
   const configured=integrations.find(p=>p.platform===row.platform),account=accounts.some(a=>a.platform===row.platform&&row.requiredAccountTypes.includes(a.accountType)&&a.connectionStatus==='CONNECTED'&&a.enabled),botCode=row.code==='TELEGRAM_BOT_CODE'||row.code==='TELEGRAM_BOT_INTERACTION';
   const ready=!!configured?.enabled&&account&&(botCode?configured.configuredFields.includes('botToken')&&configured.configuredFields.includes('webhookSecret')&&configured.webhookEnabled&&!!configured.webhookVerifiedAt:row.platform==='TELEGRAM'?configured.configuredFields.includes('botToken'):configured.ready);
   return {...row,status:row.status==='POLICY_RESTRICTED'||row.status==='UNSUPPORTED'?row.status:!ready?'NOT_CONFIGURED':row.status,configurationStatus:ready?'CONFIGURED':'NOT_CONFIGURED',canPublish:row.rewardEnabled&&row.implemented&&ready,webhookUrl:process.env.APP_URL+'/api/social/webhooks/'+row.platform.toLowerCase()};
  });
 }
 async resolveTarget(url:string,officialAccountId:string,fetcher:typeof fetch=fetch){
  const target=parseSocialTarget(url),account=await this.data.db.officialSocialAccount.findUnique({where:{id:officialAccountId}});
  if(!account||account.deletedAt||account.platform!==target.platform)throw new BadRequestException('Select an official account for the target platform');
  const list=await this.settings.list(),setting=list.find(v=>v.platform===target.platform);
  const tasks=(await this.catalog(target.platform)).filter(t=>t.targetType===target.objectType||target.platform==='TELEGRAM'||t.targetType==='PROFILE'&&target.objectType==='CHANNEL');
  if(!account.enabled||account.connectionStatus!=='CONNECTED'||!setting?.enabled)return {...target,ownershipVerified:false,status:'NOT_CONFIGURED',availableTasks:tasks};
  if(await this.data.redis.exists('social-api-cooldown:'+target.platform))throw new ServiceUnavailableException('RATE_LIMITED');
  let tokens:Record<string,string>={};if(account.credentialId){const row=await this.data.db.credential.findUnique({where:{id:account.credentialId}});if(row?.ciphertext&&!row.revokedAt)try{tokens=JSON.parse(decrypt(row.ciphertext));}catch{throw new ServiceUnavailableException('REAUTH_REQUIRED');}}
  const values=await this.settings.secretValues(target.platform),runtime=configuration(target.platform,await this.settings.runtime(target.platform,'official'));
  const token=target.platform==='TELEGRAM'?values.botToken:tokens.accessToken||values.accessToken||values.pageAccessToken||values.bearerToken;
  try{const result=await socialAdapters[target.platform].validateTarget(url,{accountId:account.accountId,accountType:account.accountType,username:account.username,profileUrl:account.profileUrl||account.defaultTargetUrl,token:token||'',clientId:runtime.clientId,graphVersion:runtime.version,scopes:[]},fetcher);return {...result,availableTasks:tasks};}
  catch(error){if(error instanceof SocialApiFailure&&error.retryAfter)await this.data.redis.set('social-api-cooldown:'+target.platform,'1','EX',error.retryAfter);throw new ServiceUnavailableException(error instanceof SocialApiFailure?error.code:'API_UNAVAILABLE');}
 }
 async createBatch(actor:string,body:z.infer<typeof batchSocialInput>){
  for(const item of body.items){if(!item.socialTaskCode)throw new BadRequestException('Choose a catalog task');const definition=catalogTask(item.socialTaskCode);if(!definition||definition.platform!==item.platform)throw new BadRequestException('Task platform mismatch');}
  return this.engine.saveTaskBatch(actor,body.campaignId,body.items,body.idempotencyKey);
 }
 async verifyTask(userId:string,taskId:string,network?:string){
  try{
   const task=await this.data.db.task.findUnique({where:{id:taskId}});if(!task)throw new BadRequestException('Task not found');
   if(task.platform==='TELEGRAM'&&task.verification&&typeof task.verification==='object'&&(task.verification as {type?:string}).type==='TELEGRAM_MEMBERSHIP')return await this.engine.verifyTelegram(userId,taskId,network);
   const definition=task.socialTaskCode?catalogTask(task.socialTaskCode):null;if(!definition?.rewardEnabled)throw new ForbiddenException('Reward policy or verifier blocks this task');
   return await socialAdapters[definition.platform].verifyTask(definition.code,()=>this.engine.verifySocialChallenge(userId,taskId,network));
  }catch(error){await this.data.audit(userId,error instanceof ServiceUnavailableException||error instanceof SocialApiFailure?'SOCIAL_API_UNAVAILABLE':'SOCIAL_VERIFY_REJECTED',taskId);if(error instanceof SocialApiFailure)throw new ServiceUnavailableException(error.code);throw error;}
 }
 async createChallenge(userId:string,taskId:string,network?:string){
  const secrets=await this.settings.secretValues('TELEGRAM');if(!secrets.botToken||!secrets.webhookSecret)throw new ServiceUnavailableException('Bot API credentials not configured');
  const selected=await this.engine.config.selected(network),token=randomBytes(32).toString('base64url'),now=new Date(),expiresAt=new Date(now.getTime()+600000);
  return this.engine.transaction(async tx=>{
   const initial=await tx.task.findUnique({where:{id:taskId},select:{campaignId:true}});if(!initial)throw new BadRequestException('Task not found');await tx.$queryRaw`SELECT "id" FROM "Campaign" WHERE "id"=${initial.campaignId} FOR UPDATE`;await tx.$queryRaw`SELECT "id" FROM "Task" WHERE "id"=${taskId} FOR UPDATE`;
   const task=await tx.task.findUniqueOrThrow({where:{id:taskId},include:{campaign:true,officialAccount:true}}),rule=task.verification as {type?:string;code?:string}|null;
   if(!task.enabled||task.archivedAt||task.campaign.archivedAt||task.campaign.status!=='ACTIVE'||task.campaign.networkId!==selected.id||task.startsAt&&task.startsAt>now||task.endsAt&&task.endsAt<=now||task.campaign.startsAt&&task.campaign.startsAt>now||task.campaign.endsAt&&task.campaign.endsAt<=now||rule?.type!=='SOCIAL_API'||!['TELEGRAM_BOT_CODE','TELEGRAM_BOT_INTERACTION'].includes(rule.code||''))throw new ConflictException('Bot task is not available');
   const setting=await tx.integrationSetting.findUnique({where:{platform:'TELEGRAM'}}),official=task.officialAccount;
   if(!setting?.webhookEnabled||!setting.webhookVerifiedAt||!official?.enabled||official.deletedAt||official.connectionStatus!=='CONNECTED'||official.accountType!=='BOT'||!/^[A-Za-z0-9_]{5,32}$/.test(official.username.replace(/^@/,'')))throw new ServiceUnavailableException('Configure the bot and webhook first');
   const identity=await tx.socialAccount.findUnique({where:{userId_provider:{userId,provider:'TELEGRAM'}}});if(!identity)throw new ConflictException('Connect Telegram first');
   if(await tx.submission.findUnique({where:{userId_taskId:{userId,taskId}}}))throw new ConflictException('Task already processed');
   const challenge=await tx.socialChallenge.create({data:{userId,taskId,officialAccountId:official.id,officialVersion:official.version,providerAccountHash:socialIdentityHash('TELEGRAM',identity.providerAccountId),tokenHash:hash(token),expiresAt}});
   await tx.auditEvent.create({data:{actor:userId,action:'SOCIAL_CHALLENGE_CREATED',resource:taskId}});
   return {challengeId:challenge.id,url:'https://t.me/'+official.username.replace(/^@/,'')+'?start='+token,expiresAt};
  });
 }
 async webhookChallenge(platform:OfficialPlatform,token:string,challenge:string){
  if(!['FACEBOOK','INSTAGRAM'].includes(platform)||challenge.length>1000)throw new BadRequestException('Webhook challenge unsupported');
  const setting=await this.data.db.integrationSetting.findUnique({where:{platform}}),values=await this.settings.secretValues(platform);
  const actual=Buffer.from(token),expected=Buffer.from(values.webhookSecret||'');if(!setting?.webhookEnabled||!expected.length||actual.length!==expected.length||!timingSafeEqual(actual,expected))throw new UnauthorizedException('Webhook verification rejected');return challenge;
 }
 async processWebhook(platform:OfficialPlatform,headers:WebhookHeaders,raw:Buffer,fetcher:typeof fetch=fetch){
  if(!supportedWebhooks.has(platform))throw new BadRequestException('Webhook receiver not supported for this platform');
  const setting=await this.data.db.integrationSetting.findUnique({where:{platform}}),effective=(await this.settings.list()).find(p=>p.platform===platform);if(!setting?.webhookEnabled||!effective?.enabled)throw new ServiceUnavailableException('Webhook is not configured');
  const values=await this.settings.secretValues(platform),runtime=configuration(platform,await this.settings.runtime(platform));let publicKey='';
  if(platform==='KICK'){if(!header(headers,'kick-event-signature'))throw new UnauthorizedException('WEBHOOK_SIGNATURE_INVALID');publicKey=await currentKickPublicKey(fetcher);}
  try{socialAdapters[platform as RewardPlatform].processWebhook(headers,raw,['FACEBOOK','INSTAGRAM'].includes(platform)?runtime.clientSecret:values.webhookSecret||'',publicKey);}catch(error){if(platform==='KICK'){try{publicKey=await currentKickPublicKey(fetcher,true);socialAdapters.KICK.processWebhook(headers,raw,'',publicKey);}catch{throw new UnauthorizedException('WEBHOOK_SIGNATURE_INVALID');}}else throw new UnauthorizedException(error instanceof SocialApiFailure?error.code:'WEBHOOK_SIGNATURE_INVALID');}
  let payload:Record<string,unknown>;try{payload=JSON.parse(raw.toString('utf8'));}catch{throw new BadRequestException('Invalid webhook JSON');}
  const now=new Date(),message=payload.message as Record<string,unknown>|undefined,event=payload.event as Record<string,unknown>|undefined;
  const updateId=payload.update_id;let eventId=platform==='TELEGRAM'?(typeof updateId==='number'&&Number.isSafeInteger(updateId)?String(updateId):''):platform==='TWITCH'?header(headers,'twitch-eventsub-message-id'):platform==='KICK'?header(headers,'kick-event-message-id'):hash(raw);
  if(!eventId)throw new BadRequestException('Webhook event ID missing');eventId=eventId.slice(0,200);
  const subscription=payload.subscription as Record<string,unknown>|undefined;
  if(platform==='TWITCH'&&(!subscription||typeof subscription.type!=='string'||header(headers,'twitch-eventsub-subscription-type')&&header(headers,'twitch-eventsub-subscription-type')!==subscription.type))throw new BadRequestException('Webhook subscription type mismatch');
  const eventType=platform==='TELEGRAM'?'message':platform==='TWITCH'?String(subscription?.type||''):platform==='KICK'?header(headers,'kick-event-type'):'meta.change';
  const occurredRaw=platform==='TELEGRAM'&&typeof message?.date==='number'?new Date(message.date*1000):['TWITCH','KICK'].includes(platform)?new Date(header(headers,platform==='TWITCH'?'twitch-eventsub-message-timestamp':'kick-event-message-timestamp')):now;
  const actorId=platform==='TELEGRAM'?(message?.from as Record<string,unknown>)?.id:platform==='TWITCH'?event?.user_id:(payload.sender as Record<string,unknown>)?.user_id;
  const actor=typeof actorId==='string'?actorId:typeof actorId==='number'&&Number.isSafeInteger(actorId)?String(actorId):null;
  const target=platform==='TWITCH'?String(event?.broadcaster_user_id||''):platform==='KICK'?String((payload.broadcaster as Record<string,unknown>)?.user_id||''):null;
  const result=await this.engine.transaction(async tx=>{
   await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext(${'webhook:'+platform+':'+eventId}))`;
   const prior=await tx.socialWebhookReceipt.findUnique({where:{platform_eventId:{platform,eventId}}});if(prior){if(prior.bodyHash!==hash(raw))throw new ConflictException('Webhook replay payload mismatch');return {duplicate:true,receiptId:prior.id};}
   const receipt=await tx.socialWebhookReceipt.create({data:{platform,eventId,eventType:eventType.slice(0,120),bodyHash:hash(raw),actorHash:actor?socialIdentityHash(platform,actor):null,targetObjectId:target||null,occurredAt:Number.isFinite(occurredRaw.getTime())?occurredRaw:now,expiresAt:new Date(now.getTime()+7*86400000)}});
   if(platform==='TELEGRAM'&&actor&&message){const chat=message.chat as Record<string,unknown>|undefined,text=typeof message.text==='string'?message.text:'',match=text.match(/^\/start(?:@[A-Za-z0-9_]{5,32})? ([A-Za-z0-9_-]{43})$/);if(match&&chat?.type==='private'&&String(chat.id)===actor&&occurredRaw.getTime()>now.getTime()-600000&&occurredRaw.getTime()<=now.getTime()+60000){const proof=await tx.socialChallenge.findUnique({where:{tokenHash:hash(match[1])}});if(proof&&proof.providerAccountHash===socialIdentityHash('TELEGRAM',actor)&&proof.expiresAt>now&&!proof.consumedAt){const official=await tx.officialSocialAccount.findUnique({where:{id:proof.officialAccountId}});if(official&&!official.deletedAt&&official.enabled&&official.connectionStatus==='CONNECTED'&&official.version===proof.officialVersion)await tx.socialChallenge.updateMany({where:{id:proof.id,verifiedAt:null,consumedAt:null,expiresAt:{gt:now}},data:{verifiedAt:now,receiptId:receipt.id}});}}}
   await tx.integrationSetting.update({where:{platform},data:{webhookVerifiedAt:now}});
   await tx.auditEvent.create({data:{actor:'webhook:'+platform,action:'SOCIAL_WEBHOOK_RECEIVED',resource:eventId}});return {duplicate:false,receiptId:receipt.id};
  });
  const challenge=platform==='TWITCH'&&header(headers,'twitch-eventsub-message-type')==='webhook_callback_verification'&&typeof payload.challenge==='string'?payload.challenge:null;
  return {...result,challenge:challenge?.slice(0,1000)||null};
 }
 async installTelegramWebhook(actor:string,replaceExisting:boolean,fetcher:typeof fetch=fetch){
  const setting=await this.data.db.integrationSetting.findUnique({where:{platform:'TELEGRAM'}}),values=await this.settings.secretValues('TELEGRAM'),effective=(await this.settings.list()).find(p=>p.platform==='TELEGRAM');
  if(!effective?.enabled||!setting?.webhookEnabled||!values.botToken||!/^[A-Za-z0-9_-]{1,256}$/.test(values.webhookSecret||''))throw new BadRequestException('Enable Telegram webhook and configure its secret first');
  const expected=process.env.APP_URL+'/api/social/webhooks/telegram',base='https://api.telegram.org/bot'+values.botToken;
  const info=await socialRequest(base+'/getWebhookInfo',{},fetcher);if(info.ok!==true)throw new ServiceUnavailableException('Telegram webhook check failed');const current=(info.result as Record<string,unknown>)?.url;if(current&&current!==expected&&!replaceExisting)throw new ConflictException('Bot already uses another webhook; explicit replacement is required');
  const result=await socialRequest(base+'/setWebhook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:expected,secret_token:values.webhookSecret,allowed_updates:['message'],drop_pending_updates:false})},fetcher);if(result.ok!==true)throw new ServiceUnavailableException('Telegram webhook registration failed');
  const checked=await socialRequest(base+'/getWebhookInfo',{},fetcher);if(checked.ok!==true||(checked.result as Record<string,unknown>)?.url!==expected)throw new ServiceUnavailableException('Telegram webhook URL mismatch');
  await this.data.db.$transaction(async tx=>{await tx.integrationSetting.update({where:{platform:'TELEGRAM'},data:{webhookVerifiedAt:new Date()}});await tx.auditEvent.create({data:{actor,action:'SOCIAL_WEBHOOK_REGISTERED',resource:'TELEGRAM'}});});return {configured:true,url:expected};
 }
}
