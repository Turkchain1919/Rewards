import {Injectable,BadRequestException,ConflictException,NotFoundException,ForbiddenException,ServiceUnavailableException} from '@nestjs/common';
import {Prisma,LedgerStatus} from '@prisma/client';
import {z} from 'zod';
import {ConfigurationService} from './configuration';
import {DataService} from './data';
import {officialAccount,officialPlatforms,OfficialPlatform,safeTarget} from './social-config';
import {canEnableTask} from './policy';
import {IntegrationSettings} from './integration-settings';
import {telegramMembership} from './telegram-verifier';
const manualVerification=z.object({type:z.literal('MANUAL'),instructions:z.string().trim().min(10).max(2000),minLength:z.number().int().min(20).max(500)}).strict();
const telegramVerification=z.object({type:z.literal('TELEGRAM_MEMBERSHIP'),instructions:z.string().trim().min(10).max(2000)}).strict();
export const wei=z.string().regex(/^(0|[1-9][0-9]{0,77})$/).refine(x=>/^(0|[1-9][0-9]{0,77})$/.test(x)&&BigInt(x)<2n**256n);
export const campaignInput=z.object({title:z.string().trim().min(3).max(160),description:z.string().trim().min(10).max(5000),budgetWei:wei,startsAt:z.string().datetime().nullable().optional(),endsAt:z.string().datetime().nullable().optional()}).strict();
export const taskInput=z.object({campaignId:z.string().min(10).max(64),title:z.string().trim().min(3).max(160),platform:z.string().regex(/^[A-Z][A-Z0-9_]{0,39}$/),kind:z.enum(['EDUCATION','SOCIAL_INTERACTION']),rewardWei:wei.refine(x=>/^[1-9][0-9]{0,77}$/.test(x)&&BigInt(x)>0n),policyReviewed:z.boolean(),officialAccountId:z.string().min(10).max(64).nullable().optional(),targetUrl:z.string().url().max(2048).refine(v=>!!safeTarget(v)).nullable().optional(),verification:z.discriminatedUnion('type',[manualVerification,telegramVerification])}).strict().superRefine((v,ctx)=>{if(v.verification.type==='TELEGRAM_MEMBERSHIP'&&(v.platform!=='TELEGRAM'||v.kind!=='SOCIAL_INTERACTION'||!v.policyReviewed))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Telegram membership verification requires a reviewed Telegram social task'});});
@Injectable()
export class EngineService {
 constructor(readonly data:DataService,readonly config:ConfigurationService,readonly settings:IntegrationSettings){}
 async transaction<T>(fn:(tx:Prisma.TransactionClient)=>Promise<T>):Promise<T>{
  for(let n=0;;n++){try{return await this.data.db.$transaction(fn,{isolationLevel:Prisma.TransactionIsolationLevel.Serializable,timeout:10000});}catch(e){if((e as {code?:string}).code==='P2034'&&n<4)continue;throw e;}}
 }
 async saveCampaign(actor:string,b:z.infer<typeof campaignInput>,id?:string){
  const network=await this.config.selected();
  const startsAt=b.startsAt?new Date(b.startsAt):null,endsAt=b.endsAt?new Date(b.endsAt):null;
  if(startsAt&&endsAt&&endsAt<=startsAt)throw new BadRequestException('Invalid campaign dates');
  return this.transaction(async tx=>{
   if(id){const old=await tx.campaign.findUnique({where:{id}});if(!old)throw new NotFoundException();if(old.networkId!==network.id)throw new ConflictException('Campaign network differs from selected network');if(BigInt(b.budgetWei)<BigInt(old.allocatedWei.toFixed()))throw new ConflictException('Budget below committed rewards');}
   const data={title:b.title,description:b.description,budgetWei:b.budgetWei,startsAt,endsAt,networkId:network.id};
   const row=id?await tx.campaign.update({where:{id},data}):await tx.campaign.create({data});
   await tx.auditEvent.create({data:{actor,action:id?'CAMPAIGN_EDIT':'CAMPAIGN_CREATE',resource:row.id}});return row;
  });
 }
 async campaignState(actor:string,id:string,status:'ACTIVE'|'PAUSED'){
  return this.transaction(async tx=>{
   const row=await tx.campaign.findUnique({where:{id},include:{tasks:true}});if(!row)throw new NotFoundException();
   if(status==='ACTIVE'&&(BigInt(row.budgetWei.toFixed())<=0n||!row.tasks.some(t=>t.enabled)||!!row.endsAt&&row.endsAt<=new Date()))throw new ConflictException('Budget, published task and valid dates required');
   await tx.auditEvent.create({data:{actor,action:'CAMPAIGN_'+status,resource:id}});
   return tx.campaign.update({where:{id},data:{status}});
  });
 }
 async saveTask(actor:string,b:z.infer<typeof taskInput>,id?:string){
  return this.transaction(async tx=>{
   const c=await tx.campaign.findUnique({where:{id:b.campaignId}});if(!c)throw new NotFoundException('Campaign not found');
   if(BigInt(b.rewardWei)>BigInt(c.budgetWei.toFixed()))throw new ConflictException('Reward exceeds campaign budget');
   if(id){
    await tx.$queryRaw`SELECT "id" FROM "Task" WHERE "id"=${id} FOR UPDATE`;
    const old=await tx.task.findUnique({where:{id},include:{_count:{select:{submissions:true}}}});
    if(!old)throw new NotFoundException();
    if(old.enabled||old._count.submissions>0||old.campaignId!==b.campaignId)throw new ConflictException('Published or used tasks cannot be edited; create a new task');
   }
   let officialAccountId=b.officialAccountId;
   if(officialAccountId===undefined)officialAccountId=(await tx.officialSocialAccount.findFirst({where:{platform:b.platform,isDefault:true,deletedAt:null}}))?.id||null;
   const official=officialAccountId?await tx.officialSocialAccount.findUnique({where:{id:officialAccountId}}):null;
   if(officialAccountId&&(!official||official.deletedAt||official.platform!==b.platform))throw new BadRequestException('Official target account mismatch');
   let targetUrl=b.targetUrl;
   if(targetUrl===undefined)targetUrl=official?.defaultTargetUrl||official?.profileUrl||null;
   if(!targetUrl&&b.targetUrl===undefined&&officialPlatforms.includes(b.platform as OfficialPlatform)){
    const setting=await tx.integrationSetting.findUnique({where:{platform:b.platform}});
    targetUrl=setting?.defaultTargetUrl||officialAccount(b.platform as OfficialPlatform).defaultTargetUrl;
   }
   const isTelegramMembership=b.verification.type==='TELEGRAM_MEMBERSHIP';
   if(isTelegramMembership&&(!official||!['CHANNEL','GROUP'].includes(official.accountType)))throw new BadRequestException('Select a connected Telegram channel or group as the task target');
   const configurationRequired=!['FIRST_PARTY','TURKCHAIN'].includes(b.platform)&&(!official?.enabled||official.connectionStatus!=='CONNECTED');
   if(targetUrl&&!safeTarget(targetUrl))throw new BadRequestException('Invalid target URL');
   const data={...b,officialAccountId:officialAccountId||null,targetUrl:targetUrl||null,configurationRequired};
   const row=id?await tx.task.update({where:{id},data}):await tx.task.create({data});
   await tx.auditEvent.create({data:{actor,action:id?'TASK_EDIT':'TASK_CREATE',resource:row.id}});return row;
  });
 }
 async taskState(actor:string,id:string,enabled:boolean){
  return this.transaction(async tx=>{
   const t=await tx.task.findUnique({where:{id},include:{campaign:true}});if(!t)throw new NotFoundException();
   if(enabled&&(!canEnableTask(t.platform,t.kind,t.policyReviewed,t.verification)||!t.verification))throw new ForbiddenException('Only reviewed first-party education and verified Telegram membership tasks may be published');
   if(enabled&&t.verification&&typeof t.verification==='object'&&(t.verification as {type?:string}).type==='TELEGRAM_MEMBERSHIP')await this.assertTelegramTaskReady(t.officialAccountId);
   if(enabled&&(BigInt(t.rewardWei.toFixed())<=0n||BigInt(t.rewardWei.toFixed())>BigInt(t.campaign.budgetWei.toFixed())))throw new ConflictException('Invalid task reward/budget');
   await tx.auditEvent.create({data:{actor,action:enabled?'TASK_PUBLISH':'TASK_PAUSE',resource:id}});
   const isTelegramVerifier=!!t.verification&&typeof t.verification==='object'&&(t.verification as {type?:string}).type==='TELEGRAM_MEMBERSHIP';
   return tx.task.update({where:{id},data:{enabled,...(enabled&&isTelegramVerifier?{configurationRequired:false}:{})}});
  });
 }
 async publicTasks(key?:string){
  const network=await this.config.selected(key);
  const now=new Date();
  const rows=await this.data.db.task.findMany({where:{enabled:true,configurationRequired:false,campaign:{networkId:network.id,status:'ACTIVE',AND:[{OR:[{startsAt:null},{startsAt:{lte:now}}]},{OR:[{endsAt:null},{endsAt:{gt:now}}]}]}},include:{campaign:{select:{id:true,title:true}}},take:100,orderBy:{id:'asc'}});
  const result=[];let telegramReady:boolean|undefined;
  for(const task of rows){
   if(!canEnableTask(task.platform,task.kind,task.policyReviewed,task.verification))continue;
   if(task.platform==='TELEGRAM'&&task.verification&&typeof task.verification==='object'&&(task.verification as {type?:string}).type==='TELEGRAM_MEMBERSHIP'){
    try{if(telegramReady===undefined)telegramReady=await this.telegramBotConfigured();if(!telegramReady)continue;const account=task.officialAccountId?await this.data.db.officialSocialAccount.findUnique({where:{id:task.officialAccountId}}):null;if(!account?.enabled||account.deletedAt||account.connectionStatus!=='CONNECTED'||!['CHANNEL','GROUP'].includes(account.accountType)||!this.validTelegramTarget(account.accountId))continue;}catch{continue;}
   }
   result.push(task);
  }
  return result;
 }
 async submit(userId:string,taskId:string,proof:string,key?:string){
  const network=await this.config.selected(key);
  return this.transaction(async tx=>{
   const existing=await tx.submission.findUnique({where:{userId_taskId:{userId,taskId}},include:{reward:true}});
   if(existing)return existing;
   const task=await tx.task.findUnique({where:{id:taskId},include:{campaign:true}});if(!task)throw new NotFoundException();
   const c=task.campaign,now=new Date();
   if(c.networkId!==network.id||!task.enabled||c.status!=='ACTIVE'||c.startsAt&&c.startsAt>now||c.endsAt&&c.endsAt<=now||!canEnableTask(task.platform,task.kind,task.policyReviewed,task.verification))throw new ConflictException('Task is not available');
   const rule=z.object({type:z.literal('MANUAL'),instructions:z.string(),minLength:z.number()}).safeParse(task.verification);
   if(!rule.success||proof.trim().length<rule.data.minLength)throw new BadRequestException('Evidence does not meet verification rules');
   const amount=BigInt(task.rewardWei.toFixed()),capacity=BigInt(c.budgetWei.toFixed())-amount;
   if(amount<=0n||capacity<0n)throw new ConflictException('Campaign budget exhausted');
   const allocated=await tx.campaign.updateMany({where:{id:c.id,status:'ACTIVE',allocatedWei:{lte:capacity.toString()}},data:{allocatedWei:{increment:amount.toString()}}});
   if(allocated.count!==1)throw new ConflictException('Campaign budget exhausted');
   const submission=await tx.submission.create({data:{userId,taskId,proof}});
   const reward=await tx.ledgerEntry.create({data:{userId,networkId:network.id,campaignId:c.id,submissionId:submission.id,amountWei:amount.toString(),status:'PENDING',idempotencyKey:'submission:'+userId+':'+taskId,reason:'Mission evidence submitted'}});
   await tx.ledgerEvent.create({data:{ledgerId:reward.id,toStatus:'PENDING',actor:userId,reason:'SUBMISSION'}});
   await tx.auditEvent.create({data:{actor:userId,action:'TASK_SUBMIT',resource:submission.id}});
   return {...submission,reward};
  });
 }
 private validTelegramTarget(chatId:string){return /^-?[0-9]{1,24}$/.test(chatId)||/^@[A-Za-z0-9_]{5,32}$/.test(chatId);}
 private async telegramBotConfigured(){
  const [items,secrets]=await Promise.all([this.settings.list(),this.settings.secretValues('TELEGRAM')]);
  return !!items.find(item=>item.platform==='TELEGRAM')?.enabled&&!!secrets.botToken;
 }
 private async assertTelegramTaskReady(accountId?:string|null){
  const account=accountId?await this.data.db.officialSocialAccount.findUnique({where:{id:accountId}}):null;
  if(!account||account.deletedAt||account.platform!=='TELEGRAM'||!account.enabled||account.connectionStatus!=='CONNECTED'||!['CHANNEL','GROUP'].includes(account.accountType)||!this.validTelegramTarget(account.accountId))throw new ServiceUnavailableException('Connect an enabled Telegram group or channel with a valid chat ID and bot administrator permissions first');
  if(!await this.telegramBotConfigured())throw new ServiceUnavailableException('Configure and enable the Telegram Bot API token in Administration → Social API');
  const secrets=await this.settings.secretValues('TELEGRAM');
  return {account,token:secrets.botToken};
 }
 async verifyTelegram(userId:string,taskId:string,key?:string,fetcher:typeof fetch=fetch){
  const network=await this.config.selected(key);
  const previous=await this.data.db.submission.findUnique({where:{userId_taskId:{userId,taskId}},include:{reward:true}});
  if(previous)return {verified:previous.status==='APPROVED',alreadyProcessed:true,status:previous.status,reward:previous.reward?.amountWei.toFixed()||'0',ledgerStatus:previous.reward?.status||null};
  const task=await this.data.db.task.findUnique({where:{id:taskId},include:{campaign:true,officialAccount:true}});
  if(!task||task.platform!=='TELEGRAM'||task.kind!=='SOCIAL_INTERACTION'||!task.policyReviewed||!task.enabled||!task.verification||typeof task.verification!=='object'||(task.verification as {type?:string}).type!=='TELEGRAM_MEMBERSHIP')throw new ConflictException('Telegram membership task is not available');
  const c=task.campaign,now=new Date();
  if(c.networkId!==network.id||c.status!=='ACTIVE'||c.startsAt&&c.startsAt>now||c.endsAt&&c.endsAt<=now)throw new ConflictException('Telegram membership task is not available');
  const identity=await this.data.db.socialAccount.findUnique({where:{userId_provider:{userId,provider:'TELEGRAM'}}});
  if(!identity||!/^[0-9]{1,24}$/.test(identity.providerAccountId))throw new ConflictException('Link your Telegram account in the user dashboard before verification');
  const {account,token}=await this.assertTelegramTaskReady(task.officialAccountId);
  if(!account.accountId)throw new ServiceUnavailableException('Telegram channel or group ID is not configured');
  let member:boolean;
  try{member=await telegramMembership(token,account.accountId,identity.providerAccountId,fetcher);}catch{throw new ServiceUnavailableException('Telegram could not verify membership right now; retry later');}
  if(!member)throw new ConflictException('Join the Telegram group or channel, then try again');
  return this.transaction(async tx=>{
   const old=await tx.submission.findUnique({where:{userId_taskId:{userId,taskId}},include:{reward:true}});
   if(old)return {verified:old.status==='APPROVED',alreadyProcessed:true,status:old.status,reward:old.reward?.amountWei.toFixed()||'0',ledgerStatus:old.reward?.status||null};
   const fresh=await tx.task.findUnique({where:{id:taskId},include:{campaign:true}});
   const checkedAt=new Date();
   if(!fresh||!fresh.enabled||fresh.campaign.status!=='ACTIVE'||fresh.campaign.networkId!==network.id||fresh.campaign.startsAt&&fresh.campaign.startsAt>checkedAt||fresh.campaign.endsAt&&fresh.campaign.endsAt<=checkedAt||fresh.configurationRequired)throw new ConflictException('Telegram membership task is no longer available');
   const amount=BigInt(fresh.rewardWei.toFixed()),capacity=BigInt(fresh.campaign.budgetWei.toFixed())-amount;
   if(amount<=0n||capacity<0n)throw new ConflictException('Campaign budget exhausted');
   const allocated=await tx.campaign.updateMany({where:{id:fresh.campaignId,status:'ACTIVE',networkId:network.id,allocatedWei:{lte:capacity.toString()}},data:{allocatedWei:{increment:amount.toString()}}});
   if(allocated.count!==1)throw new ConflictException('Campaign budget exhausted');
   const submission=await tx.submission.create({data:{userId,taskId,proof:'Telegram membership verified for configured target',status:'APPROVED',reviewNote:'Verified by Telegram Bot API getChatMember',reviewedAt:new Date()}});
   const reward=await tx.ledgerEntry.create({data:{userId,networkId:network.id,campaignId:fresh.campaignId,submissionId:submission.id,amountWei:amount.toString(),status:'AVAILABLE',idempotencyKey:'submission:'+userId+':'+taskId,reason:'Telegram membership verified'}});
   await tx.ledgerEvent.create({data:{ledgerId:reward.id,toStatus:'AVAILABLE',actor:userId,reason:'TELEGRAM_MEMBERSHIP_VERIFIED'}});
   await tx.auditEvent.create({data:{actor:userId,action:'TELEGRAM_MEMBERSHIP_REWARD',resource:submission.id}});
   return {verified:true,alreadyProcessed:false,status:'APPROVED',reward:amount.toString(),ledgerStatus:'AVAILABLE'};
  });
 }
 async review(actor:string,id:string,action:'APPROVE'|'REJECT',note:string){
  return this.transaction(async tx=>{
   const row=await tx.submission.findUnique({where:{id},include:{reward:true}});if(!row?.reward)throw new NotFoundException();
   const status=action==='APPROVE'?'APPROVED':'REJECTED';
   if(row.status!== 'PENDING'){if(row.status===status)return row;throw new ConflictException('Submission already resolved');}
   const next:LedgerStatus=action==='APPROVE'?'AVAILABLE':'REJECTED';
   const changed=await tx.ledgerEntry.updateMany({where:{id:row.reward.id,status:'PENDING'},data:{status:next}});
   if(changed.count!==1)throw new ConflictException('Reward state changed');
   if(action==='REJECT'&&row.reward.campaignId)await tx.campaign.update({where:{id:row.reward.campaignId},data:{allocatedWei:{decrement:row.reward.amountWei}}});
   await tx.ledgerEvent.create({data:{ledgerId:row.reward.id,fromStatus:'PENDING',toStatus:next,actor,reason:note}});
   await tx.auditEvent.create({data:{actor,action:'SUBMISSION_'+status,resource:id}});
   return tx.submission.update({where:{id},data:{status,reviewNote:note,reviewedAt:new Date()}});
  });
 }
 async balances(userId?:string,key?:string){
  const network=await this.config.selected(key);
  const rows=await this.data.db.ledgerEntry.groupBy({by:['status'],where:{networkId:network.id,...(userId?{userId}:{})},_sum:{amountWei:true}});
  const result:Record<string,string>={PENDING:'0',AVAILABLE:'0',RESERVED:'0',CLAIMED:'0'};
  for(const row of rows)if(row.status in result)result[row.status]=row._sum.amountWei?.toFixed()||'0';
  return result;
 }
}
