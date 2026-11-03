import {PrismaClient,Prisma} from '@prisma/client';
export async function maintainSocialTasks(db:PrismaClient,now=new Date(),onlyTaskIds?:string[]){
 const candidates=await db.task.findMany({where:{enabled:true,...(onlyTaskIds?{id:{in:onlyTaskIds}}:{})},select:{id:true,campaignId:true},orderBy:[{campaignId:'asc'},{id:'asc'}],take:500});let closed=0;
 for(const item of candidates){
  try{const changed=await db.$transaction(async tx=>{await tx.$queryRaw`SELECT "id" FROM "Campaign" WHERE "id"=${item.campaignId} FOR UPDATE`;await tx.$queryRaw`SELECT "id" FROM "Task" WHERE "id"=${item.id} FOR UPDATE`;const task=await tx.task.findUnique({where:{id:item.id},include:{campaign:true}});if(!task?.enabled)return false;
   const expired=!!task.endsAt&&task.endsAt<=now||!!task.campaign.endsAt&&task.campaign.endsAt<=now;
   const amount=BigInt(task.rewardWei.toFixed()),full=amount>BigInt(task.campaign.budgetWei.toFixed())-BigInt(task.campaign.allocatedWei.toFixed())||!!task.budgetWei&&amount>BigInt(task.budgetWei.toFixed())-BigInt(task.allocatedWei.toFixed());
   if(!expired&&!full)return false;await tx.task.update({where:{id:task.id},data:{enabled:false}});await tx.auditEvent.create({data:{actor:'system:social-maintenance',action:expired?'TASK_EXPIRED':'TASK_BUDGET_LIMIT_REACHED',resource:task.id}});return true;
  },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable,timeout:10000});if(changed)closed++;}catch(error){const e=error as {code?:string;cause?:{originalCode?:string};meta?:{code?:string;driverAdapterError?:{cause?:{originalCode?:string}}}};const code=e.cause?.originalCode||e.meta?.code||e.meta?.driverAdapterError?.cause?.originalCode;if(e.code!=='P2034'&&!['40001','40P01'].includes(code||''))throw error;}
 }
 // Only temporary proofs expire; never delete reward identities, audits, ledger or user balances.
 await db.socialChallenge.deleteMany({where:{expiresAt:{lt:new Date(now.getTime()-7*86400000)}}});
 await db.socialWebhookReceipt.deleteMany({where:{expiresAt:{lt:now},challenges:{none:{}}}});
 return {closed};
}
