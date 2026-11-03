import test from 'node:test';
import assert from 'node:assert/strict';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {EngineService,taskInput} from '../apps/api/src/engine';
import type {DataService} from '../apps/api/src/data';
import type {ConfigurationService} from '../apps/api/src/configuration';
import type {IntegrationSettings} from '../apps/api/src/integration-settings';
const unit='1000000000000000000';
const verification={type:'TELEGRAM_MEMBERSHIP',instructions:'Join Telegram and verify your membership.',maxRewards:25};
const payload={campaignId:'fixturecampaign',title:'Quota fixture mission',platform:'TELEGRAM',kind:'SOCIAL_INTERACTION',rewardWei:unit,policyReviewed:true,verification};
test('Telegram reward quota accepts optional positive integer only',()=>{
 assert.equal(taskInput.parse(payload).verification.type,'TELEGRAM_MEMBERSHIP');
 for(const maxRewards of [0,-1,1.5,1000001,'25',null])assert.equal(taskInput.safeParse({...payload,verification:{...verification,maxRewards}}).success,false);
 assert.equal(taskInput.safeParse({...payload,verification:{type:'TELEGRAM_MEMBERSHIP',instructions:verification.instructions}}).success,true);
 assert.equal(taskInput.safeParse({...payload,verification:{type:'MANUAL',instructions:verification.instructions,minLength:20,maxRewards:25}}).success,true);
});
test('25-user quota survives concurrent awards, closes atomically, preserves one-time ledger',{skip:process.env.RUN_INTEGRATION!=='true'},async()=>{
 assert.equal(process.env.APP_ENV,'test');assert.match(process.env.DATABASE_URL||'',/rewards_test/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:8})});
 const network=await db.blockchainNetwork.findFirstOrThrow({where:{isActive:true}}),nonce=Date.now().toString(36),actor='quota-test-'+nonce;
 const engine=new EngineService({db} as DataService,{selected:async()=>network} as unknown as ConfigurationService,{list:async()=>[{platform:'TELEGRAM',enabled:true}],secretValues:async()=>({botToken:'fixture-token'})} as unknown as IntegrationSettings);
 const users:string[]=[];let campaignId='',taskId='',accountId='';
 const joined:typeof fetch=async()=>new Response(JSON.stringify({ok:true,result:{status:'member'}}),{status:200});
 try{
  await db.socialPlatform.upsert({where:{key:'TELEGRAM'},create:{key:'TELEGRAM',name:'Telegram',connector:'TELEGRAM'},update:{}});
  const account=await db.officialSocialAccount.create({data:{platform:'TELEGRAM',accountType:'GROUP',name:actor,accountId:'-1003676977941',username:'Turkchain1919',profileUrl:'https://t.me/Turkchain1919',defaultTargetUrl:'https://t.me/Turkchain1919',enabled:true,connectionStatus:'CONNECTED'}});accountId=account.id;
  const campaign=await engine.saveCampaign(actor,{title:actor,description:'Temporary isolated TEST quota fixtures only.',budgetWei:(25n*BigInt(unit)).toString()});campaignId=campaign.id;
  const task=await engine.saveTask(actor,taskInput.parse({...payload,campaignId,officialAccountId:accountId}));taskId=task.id;
  await engine.taskState(actor,taskId,true);await engine.campaignState(actor,campaignId,'ACTIVE');
  for(let i=0;i<32;i++){
   const wallet='0x'+Buffer.from(nonce+':'+i).toString('hex').padEnd(40,'0').slice(0,40);
   const user=await db.user.create({data:{wallet}});users.push(user.id);
   await db.socialAccount.create({data:{userId:user.id,provider:'TELEGRAM',providerAccountId:String(Date.now())+String(i).padStart(2,'0'),accountName:actor,scopes:[]}});
  }
  const left:typeof fetch=async()=>new Response(JSON.stringify({ok:true,result:{status:'left'}}),{status:200});
  await assert.rejects(()=>engine.verifyTelegram(users[31],taskId,network.networkKey,left),/Join the Telegram/);
  const failed:typeof fetch=async()=>new Response('unavailable',{status:503});
  await assert.rejects(()=>engine.verifyTelegram(users[31],taskId,network.networkKey,failed),/could not verify/);
  for(const user of users.slice(0,20))await engine.verifyTelegram(user,taskId,network.networkKey,joined);
  const visible=(await engine.publicTasks(network.networkKey)).find(t=>t.id===taskId);
  assert.deepEqual(visible&&'rewardQuota' in visible?visible.rewardQuota:null,{maxRewards:25,rewardedUsers:20,remainingRewards:5});
  // Cross the cap with ten concurrent distinct users plus duplicate winner requests.
  const results=await Promise.allSettled([...users.slice(20,30),users[0],users[0]].map(user=>engine.verifyTelegram(user,taskId,network.networkKey,joined)));
  for(const r of results)if(r.status==='rejected')assert.match(String(r.reason),/no longer available|not available|reward limit|Concurrent operation/);
  // A serialization-conflict response is retryable; retry only if slots remain.
  for(const user of users.slice(20,30)){
   if(await db.ledgerEntry.count({where:{campaignId}})>=25)break;
   await engine.verifyTelegram(user,taskId,network.networkKey,joined);
  }
  assert.equal(await db.ledgerEntry.count({where:{campaignId}}),25);
  assert.equal(await db.submission.count({where:{taskId,status:'APPROVED'}}),25);
  assert.equal((await db.campaign.findUniqueOrThrow({where:{id:campaignId}})).allocatedWei.toFixed(),(25n*BigInt(unit)).toString());
  const ledger=await db.ledgerEntry.findMany({where:{campaignId}});assert.ok(ledger.every(r=>r.status==='AVAILABLE'&&r.amountWei.toFixed()===unit));
  assert.equal((await db.task.findUniqueOrThrow({where:{id:taskId}})).enabled,false);
  assert.equal(await db.auditEvent.count({where:{action:'TASK_REWARD_LIMIT_REACHED',resource:taskId}}),1);
  assert.equal((await engine.publicTasks(network.networkKey)).some(t=>t.id===taskId),false);
  assert.equal((await engine.userTaskBoard(users[31],network.networkKey)).some(t=>t.id===taskId),false);
  assert.equal((await engine.verifyTelegram(users[0],taskId,network.networkKey,joined)).alreadyProcessed,true);
  await assert.rejects(()=>engine.verifyTelegram(users[31],taskId,network.networkKey,joined),/not available/);
  await assert.rejects(()=>db.$executeRaw`UPDATE "Campaign" SET "allocatedWei"=${(26n*BigInt(unit)).toString()}::numeric WHERE "id"=${campaignId}`,/campaign_budget_bounds|check constraint/);
  // Raising campaign capacity cannot reopen the immutable per-task 25-user limit.
  await db.campaign.update({where:{id:campaignId},data:{budgetWei:(30n*BigInt(unit)).toString()}});
  await assert.rejects(()=>engine.taskState(actor,taskId,true),/reward limit reached/);
  assert.equal((await engine.balances(users[0],network.networkKey)).AVAILABLE,unit);
 }finally{
  // Only this test's isolated fixture rows; never production or real reward history.
  const entries=await db.ledgerEntry.findMany({where:{campaignId:campaignId||'__none__'},select:{id:true}});
  await db.ledgerEvent.deleteMany({where:{ledgerId:{in:entries.map(r=>r.id)}}});await db.ledgerEntry.deleteMany({where:{id:{in:entries.map(r=>r.id)}}});
  await db.submission.deleteMany({where:{taskId:taskId||'__none__'}});await db.task.deleteMany({where:{campaignId:campaignId||'__none__'}});await db.campaign.deleteMany({where:{id:campaignId||'__none__'}});
  await db.socialAccount.deleteMany({where:{userId:{in:users}}});await db.user.deleteMany({where:{id:{in:users}}});
  await db.officialSocialAccount.deleteMany({where:{id:accountId||'__none__'}});await db.auditEvent.deleteMany({where:{actor:{in:[actor,...users]}}});await db.$disconnect();
 }
});
