import {Injectable,BadRequestException,ConflictException,NotFoundException,ForbiddenException} from '@nestjs/common';
import {Prisma,LedgerStatus} from '@prisma/client';
import {z} from 'zod';
import {DataService} from './data';
import {canEnableTask} from './policy';
export const wei=z.string().regex(/^(0|[1-9][0-9]{0,77})$/).refine(x=>BigInt(x)<2n**256n);
export const campaignInput=z.object({title:z.string().trim().min(3).max(160),description:z.string().trim().min(10).max(5000),budgetWei:wei,startsAt:z.string().datetime().nullable().optional(),endsAt:z.string().datetime().nullable().optional()}).strict();
export const taskInput=z.object({campaignId:z.string().min(10).max(64),title:z.string().trim().min(3).max(160),platform:z.enum(['TURKCHAIN','X','TELEGRAM','FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK']),kind:z.enum(['EDUCATION','SOCIAL_INTERACTION']),rewardWei:wei.refine(x=>BigInt(x)>0n),policyReviewed:z.boolean(),verification:z.object({type:z.literal('MANUAL'),instructions:z.string().trim().min(10).max(2000),minLength:z.number().int().min(20).max(500)}).strict()}).strict();
@Injectable()
export class EngineService {
 constructor(readonly data:DataService){}
 async transaction<T>(fn:(tx:Prisma.TransactionClient)=>Promise<T>):Promise<T>{
  for(let n=0;;n++){try{return await this.data.db.$transaction(fn,{isolationLevel:Prisma.TransactionIsolationLevel.Serializable,timeout:10000});}catch(e){if((e as {code?:string}).code==='P2034'&&n<4)continue;throw e;}}
 }
 async saveCampaign(actor:string,b:z.infer<typeof campaignInput>,id?:string){
  const startsAt=b.startsAt?new Date(b.startsAt):null,endsAt=b.endsAt?new Date(b.endsAt):null;
  if(startsAt&&endsAt&&endsAt<=startsAt)throw new BadRequestException('Invalid campaign dates');
  return this.transaction(async tx=>{
   if(id){const old=await tx.campaign.findUnique({where:{id}});if(!old)throw new NotFoundException();if(BigInt(b.budgetWei)<BigInt(old.allocatedWei.toFixed()))throw new ConflictException('Budget below committed rewards');}
   const data={title:b.title,description:b.description,budgetWei:b.budgetWei,startsAt,endsAt};
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
   const row=id?await tx.task.update({where:{id},data:b}):await tx.task.create({data:b});
   await tx.auditEvent.create({data:{actor,action:id?'TASK_EDIT':'TASK_CREATE',resource:row.id}});return row;
  });
 }
 async taskState(actor:string,id:string,enabled:boolean){
  return this.transaction(async tx=>{
   const t=await tx.task.findUnique({where:{id},include:{campaign:true}});if(!t)throw new NotFoundException();
   if(enabled&&(!canEnableTask(t.platform,t.kind,t.policyReviewed)||!t.verification))throw new ForbiddenException('Rewarded social engagement is disabled; approved first-party education only');
   if(enabled&&(BigInt(t.rewardWei.toFixed())<=0n||BigInt(t.rewardWei.toFixed())>BigInt(t.campaign.budgetWei.toFixed())))throw new ConflictException('Invalid task reward/budget');
   await tx.auditEvent.create({data:{actor,action:enabled?'TASK_PUBLISH':'TASK_PAUSE',resource:id}});
   return tx.task.update({where:{id},data:{enabled}});
  });
 }
 publicTasks(){
  const now=new Date();
  return this.data.db.task.findMany({where:{enabled:true,campaign:{status:'ACTIVE',AND:[{OR:[{startsAt:null},{startsAt:{lte:now}}]},{OR:[{endsAt:null},{endsAt:{gt:now}}]}]}},include:{campaign:{select:{id:true,title:true}}},take:100,orderBy:{id:'asc'}});
 }
 async submit(userId:string,taskId:string,proof:string){
  return this.transaction(async tx=>{
   const existing=await tx.submission.findUnique({where:{userId_taskId:{userId,taskId}},include:{reward:true}});
   if(existing)return existing;
   const task=await tx.task.findUnique({where:{id:taskId},include:{campaign:true}});if(!task)throw new NotFoundException();
   const c=task.campaign,now=new Date();
   if(!task.enabled||c.status!=='ACTIVE'||c.startsAt&&c.startsAt>now||c.endsAt&&c.endsAt<=now||!canEnableTask(task.platform,task.kind,task.policyReviewed))throw new ConflictException('Task is not available');
   const rule=z.object({type:z.literal('MANUAL'),instructions:z.string(),minLength:z.number()}).safeParse(task.verification);
   if(!rule.success||proof.trim().length<rule.data.minLength)throw new BadRequestException('Evidence does not meet verification rules');
   const amount=BigInt(task.rewardWei.toFixed()),capacity=BigInt(c.budgetWei.toFixed())-amount;
   if(amount<=0n||capacity<0n)throw new ConflictException('Campaign budget exhausted');
   const allocated=await tx.campaign.updateMany({where:{id:c.id,status:'ACTIVE',allocatedWei:{lte:capacity.toString()}},data:{allocatedWei:{increment:amount.toString()}}});
   if(allocated.count!==1)throw new ConflictException('Campaign budget exhausted');
   const submission=await tx.submission.create({data:{userId,taskId,proof}});
   const reward=await tx.ledgerEntry.create({data:{userId,campaignId:c.id,submissionId:submission.id,amountWei:amount.toString(),status:'PENDING',idempotencyKey:'submission:'+userId+':'+taskId,reason:'Mission evidence submitted'}});
   await tx.ledgerEvent.create({data:{ledgerId:reward.id,toStatus:'PENDING',actor:userId,reason:'SUBMISSION'}});
   await tx.auditEvent.create({data:{actor:userId,action:'TASK_SUBMIT',resource:submission.id}});
   return {...submission,reward};
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
 async balances(userId?:string){
  const rows=await this.data.db.ledgerEntry.groupBy({by:['status'],where:userId?{userId}:undefined,_sum:{amountWei:true}});
  const result:Record<string,string>={PENDING:'0',AVAILABLE:'0',RESERVED:'0',CLAIMED:'0'};
  for(const row of rows)if(row.status in result)result[row.status]=row._sum.amountWei?.toFixed()||'0';
  return result;
 }
}
