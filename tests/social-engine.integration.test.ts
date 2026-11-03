import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {EngineService,taskInput} from '../apps/api/src/engine';
import {SocialRewardsService} from '../apps/api/src/social-engine';
import {OfficialAccountsService} from '../apps/api/src/official-accounts';
import {socialIdentityHash} from '../apps/api/src/social-identity';
import {maintainSocialTasks} from '../apps/api/src/social-maintenance';
import type {DataService} from '../apps/api/src/data';
import type {ConfigurationService,SecretStore} from '../apps/api/src/configuration';
import type {IntegrationSettings} from '../apps/api/src/integration-settings';
const unit=1000000000000000000n;
test('signed bot proofs credit once, resist replay and cross-wallet social relink, and never reward invalid proofs',{skip:process.env.RUN_INTEGRATION!=='true'},async()=>{
 assert.equal(process.env.APP_ENV,'test');assert.match(process.env.DATABASE_URL||'',/rewards_test/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:6})}),marker=randomBytes(8).toString('hex'),actor='social-proof-'+marker,secret='fixture-webhook-'+marker;
 const network=await db.blockchainNetwork.findFirstOrThrow({where:{isActive:true}}),priorSetting=await db.integrationSetting.findUnique({where:{platform:'TELEGRAM'}}),users:string[]=[],events:string[]=[];let cid='',tid='',officialId='';
 const settings={secretValues:async()=>({botToken:'fixture-token',webhookSecret:secret}),runtime:async()=>({clientId:'fixture-client',clientSecret:'fixture-secret',enabled:true}),list:async()=>[{platform:'TELEGRAM',enabled:true,configuredFields:['botToken','webhookSecret'],webhookEnabled:true,webhookVerifiedAt:new Date(),ready:true}]} as unknown as IntegrationSettings;
 const data={db,audit:(actor:string,action:string,resource:string)=>db.auditEvent.create({data:{actor,action,resource}})} as unknown as DataService;
 const engine=new EngineService(data,{selected:async()=>network} as unknown as ConfigurationService,settings),service=new SocialRewardsService(data,engine,settings,{} as SecretStore);
 const providerId=String(700000000000+Math.floor(Math.random()*10000000));
 const botFetch:typeof fetch=async()=>new Response(JSON.stringify({ok:true,result:{id:9990001,is_bot:true,username:'fixture_rewards_bot'}}));
 try{
  for(let i=0;i<3;i++)users.push((await db.user.create({data:{wallet:actor+'-'+i}})).id);
  await db.integrationSetting.upsert({where:{platform:'TELEGRAM'},create:{platform:'TELEGRAM',webhookEnabled:true,webhookVerifiedAt:new Date()},update:{webhookEnabled:true,webhookVerifiedAt:new Date()}});
  officialId=(await db.officialSocialAccount.create({data:{platform:'TELEGRAM',accountType:'BOT',name:actor,username:'fixture_rewards_bot',accountId:'9990001',profileUrl:'https://t.me/fixture_rewards_bot',defaultTargetUrl:'https://t.me/fixture_rewards_bot',enabled:true,connectionStatus:'UNCONFIGURED'}})).id;
  assert.equal((await new OfficialAccountsService(data,settings,{} as SecretStore).connectTelegram(officialId,actor,botFetch)).connected,true);
  await db.socialAccount.create({data:{userId:users[0],provider:'TELEGRAM',providerAccountId:providerId,accountName:actor,scopes:[]}});
  cid=(await engine.saveCampaign(actor,{title:actor,description:'Temporary TEST private bot challenge fixture',budgetWei:(5n*unit).toString()})).id;
  const task=await engine.saveTask(actor,taskInput.parse({campaignId:cid,title:actor,platform:'TELEGRAM',kind:'SOCIAL_INTERACTION',socialTaskCode:'TELEGRAM_BOT_CODE',targetUrl:'https://t.me/fixture_rewards_bot',targetObjectId:'9990001',officialAccountId:officialId,policyReviewed:true,rewardWei:unit.toString(),budgetWei:(5n*unit).toString(),timezone:'Europe/Istanbul',verification:{type:'SOCIAL_API',code:'TELEGRAM_BOT_CODE',instructions:'Send your one-time code to the private bot.',maxRewards:3}}));tid=task.id;
  await engine.taskState(actor,tid,true,botFetch);await engine.campaignState(actor,cid,'ACTIVE');
  await assert.rejects(()=>engine.verifySocialChallenge(users[0],tid,network.networkKey),/Complete the bot challenge/);
  const challenge=await service.createChallenge(users[0],tid,network.networkKey),token=new URL(challenge.url).searchParams.get('start')!;
  function body(code:string,from=providerId){const event=String(Date.now()+events.length);events.push(event);return Buffer.from(JSON.stringify({update_id:Number(event),message:{date:Math.floor(Date.now()/1000),from:{id:Number(from)},chat:{type:'private',id:Number(from)},text:'/start '+code}}));}
  const raw=body(token);
  await assert.rejects(()=>service.processWebhook('TELEGRAM',{'x-telegram-bot-api-secret-token':'bad'},raw));assert.equal(await db.socialWebhookReceipt.count({where:{eventId:events.at(-1)}}),0);
  const wrong=body(token,String(Number(providerId)+1));await service.processWebhook('TELEGRAM',{'x-telegram-bot-api-secret-token':secret},wrong);assert.equal((await db.socialChallenge.findUniqueOrThrow({where:{id:challenge.challengeId}})).verifiedAt,null);
  const accepted=await service.processWebhook('TELEGRAM',{'x-telegram-bot-api-secret-token':secret},raw);assert.equal(accepted.duplicate,false);assert.equal((await service.processWebhook('TELEGRAM',{'x-telegram-bot-api-secret-token':secret},raw)).duplicate,true);
  await assert.rejects(()=>service.processWebhook('TELEGRAM',{'x-telegram-bot-api-secret-token':secret},Buffer.from(raw.toString().replace('/start ','changed /start '))),/replay payload mismatch/);
  const result=await engine.verifySocialChallenge(users[0],tid,network.networkKey);assert.equal(result.reward,unit.toString());assert.equal((await engine.verifySocialChallenge(users[0],tid,network.networkKey)).alreadyProcessed,true);
  assert.equal(await db.ledgerEntry.count({where:{campaignId:cid}}),1);assert.equal((await engine.balances(users[0],network.networkKey)).AVAILABLE,unit.toString());
  assert.ok((await db.socialChallenge.findUniqueOrThrow({where:{id:challenge.challengeId}})).consumedAt);
  // Disconnecting the first wallet cannot release the permanent task/provider identity reservation.
  await db.socialAccount.deleteMany({where:{userId:users[0],provider:'TELEGRAM'}});await db.socialAccount.create({data:{userId:users[1],provider:'TELEGRAM',providerAccountId:providerId,accountName:actor,scopes:[]}});
  const second=await service.createChallenge(users[1],tid,network.networkKey);await service.processWebhook('TELEGRAM',{'x-telegram-bot-api-secret-token':secret},body(new URL(second.url).searchParams.get('start')!));
  await assert.rejects(()=>engine.verifySocialChallenge(users[1],tid,network.networkKey),/social account already earned/);assert.equal(await db.ledgerEntry.count({where:{userId:users[1]}}),0);assert.equal((await db.campaign.findUniqueOrThrow({where:{id:cid}})).allocatedWei.toFixed(),unit.toString());
  const reservation=await db.socialRewardIdentity.findFirstOrThrow({where:{taskId:tid}});assert.equal(reservation.accountHash,socialIdentityHash('TELEGRAM',providerId));
  const sql=await db.$queryRaw<{hash:string}[]>`SELECT encode(sha256(convert_to(${'TELEGRAM:'+providerId},'UTF8')),'hex') AS hash`;assert.equal(sql[0].hash,reservation.accountHash);
  // An expired challenge cannot become proof even with a valid shared header.
  const expired=await service.createChallenge(users[1],tid,network.networkKey);await db.socialChallenge.update({where:{id:expired.challengeId},data:{expiresAt:new Date(Date.now()-1000)}});await service.processWebhook('TELEGRAM',{'x-telegram-bot-api-secret-token':secret},body(new URL(expired.url).searchParams.get('start')!));assert.equal((await db.socialChallenge.findUniqueOrThrow({where:{id:expired.challengeId}})).verifiedAt,null);
 }finally{
  await db.socialChallenge.deleteMany({where:{taskId:tid||'__none__'}});await db.socialWebhookReceipt.deleteMany({where:{platform:'TELEGRAM',eventId:{in:events}}});await db.socialRewardIdentity.deleteMany({where:{taskId:tid||'__none__'}});
  const ledger=await db.ledgerEntry.findMany({where:{campaignId:cid||'__none__'},select:{id:true}});await db.ledgerEvent.deleteMany({where:{ledgerId:{in:ledger.map(v=>v.id)}}});await db.ledgerEntry.deleteMany({where:{id:{in:ledger.map(v=>v.id)}}});await db.submission.deleteMany({where:{taskId:tid||'__none__'}});await db.task.deleteMany({where:{campaignId:cid||'__none__'}});await db.campaign.deleteMany({where:{id:cid||'__none__'}});await db.officialSocialAccount.deleteMany({where:{id:officialId||'__none__'}});await db.socialAccount.deleteMany({where:{userId:{in:users}}});await db.user.deleteMany({where:{id:{in:users}}});await db.auditEvent.deleteMany({where:{OR:[{actor:{in:[actor,...users]}},{actor:'webhook:TELEGRAM',resource:{in:events}}]}});
  if(priorSetting)await db.integrationSetting.update({where:{platform:'TELEGRAM'},data:{webhookEnabled:priorSetting.webhookEnabled,webhookVerifiedAt:priorSetting.webhookVerifiedAt,updatedAt:priorSetting.updatedAt}});else await db.integrationSetting.delete({where:{platform:'TELEGRAM'}});await db.$disconnect();
 }
});
test('atomic batches stay drafts and task budgets, expiry and economic edits preserve accounting',{skip:process.env.RUN_INTEGRATION!=='true'},async()=>{
 assert.equal(process.env.APP_ENV,'test');assert.match(process.env.DATABASE_URL||'',/rewards_test/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:6})}),actor='social-batch-'+randomBytes(8).toString('hex'),network=await db.blockchainNetwork.findFirstOrThrow({where:{isActive:true}}),user=await db.user.create({data:{wallet:actor}});
 const engine=new EngineService({db} as unknown as DataService,{selected:async()=>network} as unknown as ConfigurationService,{} as IntegrationSettings);let cid='';
 try{
  cid=(await engine.saveCampaign(actor,{title:actor,description:'Temporary TEST atomic draft batch fixture',budgetWei:'100'})).id;
  const payload=(title:string)=>taskInput.parse({campaignId:cid,title,platform:'TURKCHAIN',kind:'EDUCATION',rewardWei:'10',budgetWei:'10',policyReviewed:true,verification:{type:'MANUAL',instructions:'Provide a detailed ecosystem explanation.',minLength:20}});
  const key=randomBytes(16).toString('hex'),items=[payload(actor+' A'),payload(actor+' B')];const results=await Promise.all([engine.saveTaskBatch(actor,cid,items,key),engine.saveTaskBatch(actor,cid,items,key)]);assert.equal(results[0].tasks.length,2);assert.equal(await db.task.count({where:{campaignId:cid}}),2);assert.ok(results.every(r=>r.tasks.every(t=>t.enabled===false)));await assert.rejects(()=>engine.saveTaskBatch(actor,cid,[payload('Different payload')],key),/different tasks/);
  const first=results[0].tasks[0];await engine.taskState(actor,first.id,true);await engine.campaignState(actor,cid,'ACTIVE');const submission=await engine.submit(user.id,first.id,'A detailed independent ecosystem explanation.',network.networkKey);assert.equal((await db.task.findUniqueOrThrow({where:{id:first.id}})).allocatedWei.toFixed(),'10');assert.equal((await db.task.findUniqueOrThrow({where:{id:first.id}})).enabled,false);
  await assert.rejects(()=>db.$executeRaw`UPDATE "Task" SET "allocatedWei"=11 WHERE "id"=${first.id}`,/task_budget_bounds|check constraint/);
  await engine.review(actor,submission.id,'REJECT','Isolated fixture rejected');assert.equal((await db.task.findUniqueOrThrow({where:{id:first.id}})).allocatedWei.toFixed(),'0');assert.equal((await db.campaign.findUniqueOrThrow({where:{id:cid}})).allocatedWei.toFixed(),'0');
  const second=results[0].tasks[1];await engine.taskState(actor,second.id,true);await db.task.update({where:{id:second.id},data:{endsAt:new Date(Date.now()-1000)}});
  await assert.rejects(()=>engine.submit(user.id,second.id,'A detailed independent ecosystem explanation.',network.networkKey),/not available/);
  await db.task.update({where:{id:second.id},data:{enabled:true,endsAt:new Date(Date.now()+60000)}});const expired=await maintainSocialTasks(db,new Date(Date.now()+120000),[second.id]);assert.equal(expired.closed,1);assert.equal((await db.task.findUniqueOrThrow({where:{id:second.id}})).enabled,false);assert.equal(await db.auditEvent.count({where:{action:'TASK_EXPIRED',resource:second.id}})>=1,true);
  assert.equal((await engine.balances(user.id,network.networkKey)).AVAILABLE,'0');
 }finally{
  const taskIds=(await db.task.findMany({where:{campaignId:cid||'__none__'},select:{id:true}})).map(v=>v.id),ledger=await db.ledgerEntry.findMany({where:{campaignId:cid||'__none__'},select:{id:true}});await db.ledgerEvent.deleteMany({where:{ledgerId:{in:ledger.map(v=>v.id)}}});await db.ledgerEntry.deleteMany({where:{id:{in:ledger.map(v=>v.id)}}});await db.submission.deleteMany({where:{taskId:{in:taskIds}}});await db.task.deleteMany({where:{id:{in:taskIds}}});await db.campaign.deleteMany({where:{id:cid||'__none__'}});await db.user.delete({where:{id:user.id}});await db.auditEvent.deleteMany({where:{OR:[{actor:{in:[actor,user.id]}},{resource:{in:taskIds}}]}});await db.$disconnect();
 }
});
