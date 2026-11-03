import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {EngineService,taskInput,taskLimitsInput} from '../apps/api/src/engine';
import type {DataService} from '../apps/api/src/data';
import type {ConfigurationService} from '../apps/api/src/configuration';
import type {IntegrationSettings} from '../apps/api/src/integration-settings';
import {digest} from '../apps/api/src/security';
test('admin limits lifecycle preserves earned rewards, pending reservations, removes optional limits and rejects stale edits',{skip:process.env.RUN_INTEGRATION!=='true'},async()=>{
 assert.equal(process.env.APP_ENV,'test');assert.match(process.env.DATABASE_URL||'',/rewards_test/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:6})}),nonce=randomBytes(8).toString('hex'),actor='limits-'+nonce;
 const network=await db.blockchainNetwork.findFirstOrThrow({where:{isActive:true}}),engine=new EngineService({db} as DataService,{selected:async()=>network} as unknown as ConfigurationService,{} as IntegrationSettings);
 const users:string[]=[];let cid='',tid='';
 const proof='A sufficiently detailed explanation of the Turkchain ecosystem.';
 try{
  for(let i=0;i<4;i++)users.push((await db.user.create({data:{wallet:actor+'-'+i}})).id);
  cid=(await engine.saveCampaign(actor,{title:actor,description:'Isolated admin limits lifecycle test',budgetWei:'100'})).id;
  tid=(await engine.saveTask(actor,taskInput.parse({campaignId:cid,title:actor,platform:'TURKCHAIN',kind:'EDUCATION',rewardWei:'10',policyReviewed:true,verification:{type:'MANUAL',instructions:proof,minLength:20,maxRewards:2}}))).id;
  await engine.taskState(actor,tid,true);await engine.campaignState(actor,cid,'ACTIVE');
  const first=await engine.submit(users[0],tid,proof,network.networkKey);assert.equal(first.reward?.amountWei.toFixed(),'10');
  const old=await engine.taskLimits(tid),entries=await db.ledgerEntry.findMany({where:{campaignId:cid}});
  const body=taskLimitsInput.parse({confirmId:tid,expectedRulesHash:old.expectedRulesHash,rewardWei:'20',campaignBudgetWei:'100',maxRewards:2,startsAt:null,endsAt:null});
  const updated=await engine.updateTaskLimits(actor,tid,body);assert.equal(updated.enabled,false);assert.equal(updated.usedRewards,1);
  assert.deepEqual(await db.ledgerEntry.findMany({where:{campaignId:cid}}),entries,'rules update must not rewrite pending/earned amounts');
  assert.equal((await engine.submit(users[0],tid,proof,network.networkKey)).reward?.amountWei.toFixed(),'10');
  await assert.rejects(()=>engine.updateTaskLimits(actor,tid,body),/Rules changed/);
  await engine.taskState(actor,tid,true);
  const second=await engine.submit(users[1],tid,proof,network.networkKey);assert.equal(second.reward?.amountWei.toFixed(),'20');
  assert.equal((await engine.taskLimits(tid)).enabled,false);assert.equal((await engine.taskLimits(tid)).usedRewards,2);
  let snapshot=await engine.taskLimits(tid);
  await assert.rejects(()=>engine.updateTaskLimits(actor,tid,{...body,expectedRulesHash:snapshot.expectedRulesHash,maxRewards:1}),/below committed users/);
  await assert.rejects(()=>engine.updateTaskLimits(actor,tid,{...body,expectedRulesHash:snapshot.expectedRulesHash,campaignBudgetWei:'29'}),/Budget below committed/);
  await engine.review(actor,first.id,'APPROVE','Accepted isolated fixture proof');await engine.review(actor,second.id,'REJECT','Rejected isolated fixture proof');
  assert.equal((await engine.balances(users[0],network.networkKey)).AVAILABLE,'10');assert.equal((await engine.taskLimits(tid)).usedRewards,1);
  snapshot=await engine.taskLimits(tid);
  const cleared=await engine.updateTaskLimits(actor,tid,{...body,expectedRulesHash:snapshot.expectedRulesHash,rewardWei:'15',campaignBudgetWei:'50',maxRewards:null});assert.equal(cleared.maxRewards,null);
  assert.equal((await engine.balances(users[0],network.networkKey)).AVAILABLE,'10');assert.equal((await db.campaign.findUniqueOrThrow({where:{id:cid}})).allocatedWei.toFixed(),'10');
  await engine.taskState(actor,tid,true);const third=await engine.submit(users[2],tid,proof,network.networkKey);assert.equal(third.reward?.amountWei.toFixed(),'15');await engine.review(actor,third.id,'APPROVE','Accepted isolated fixture proof');
  snapshot=await engine.taskLimits(tid);const future=new Date(Date.now()+86400000).toISOString(),later=new Date(Date.now()+172800000).toISOString();
  await engine.updateTaskLimits(actor,tid,{...body,expectedRulesHash:snapshot.expectedRulesHash,rewardWei:'15',campaignBudgetWei:'50',maxRewards:3,startsAt:future,endsAt:later});await engine.taskState(actor,tid,true);
  await assert.rejects(()=>engine.submit(users[3],tid,proof,network.networkKey),/not available/);
  assert.equal((await engine.publicTasks(network.networkKey)).some(t=>t.id===tid),false);
  snapshot=await engine.taskLimits(tid);await engine.updateTaskLimits(actor,tid,{...body,expectedRulesHash:snapshot.expectedRulesHash,rewardWei:'15',campaignBudgetWei:'50',maxRewards:null,startsAt:null,endsAt:null});await engine.taskState(actor,tid,true);
  assert.equal((await engine.submit(users[3],tid,proof,network.networkKey)).reward?.amountWei.toFixed(),'15');
  assert.equal((await engine.balances(users[0],network.networkKey)).AVAILABLE,'10');
  assert.equal(await db.auditEvent.count({where:{resource:tid,action:'TASK_LIMITS_EDIT'}}),4);
  const details=await db.auditEvent.findFirstOrThrow({where:{actor,action:'TASK_LIMITS_DETAIL'}});assert.equal(JSON.parse(details.resource).taskId,tid);
 }finally{
  const entries=await db.ledgerEntry.findMany({where:{campaignId:cid||'__none__'},select:{id:true}});await db.ledgerEvent.deleteMany({where:{ledgerId:{in:entries.map(r=>r.id)}}});await db.ledgerEntry.deleteMany({where:{id:{in:entries.map(r=>r.id)}}});await db.submission.deleteMany({where:{taskId:tid||'__none__'}});await db.task.deleteMany({where:{campaignId:cid||'__none__'}});await db.campaign.deleteMany({where:{id:cid||'__none__'}});await db.user.deleteMany({where:{id:{in:users}}});await db.auditEvent.deleteMany({where:{actor:{in:[actor,...users]}}});await db.$disconnect();
 }
});
test('task limits HTTP requires manager MFA, confirmation, valid values and current revision',{skip:process.env.RUN_INTEGRATION!=='true'},async()=>{
 assert.equal(process.env.APP_ENV,'test');assert.match(process.env.DATABASE_URL||'',/rewards_test/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})}),nonce=randomBytes(8).toString('hex'),tokens=Array.from({length:3},()=>randomBytes(32).toString('hex'));
 const owner=await db.admin.create({data:{email:nonce+'@limits.invalid',passwordHash:'fixture',role:'OWNER'}}),reviewer=await db.admin.create({data:{email:'review-'+nonce+'@limits.invalid',passwordHash:'fixture',role:'REVIEWER'}});
 const network=await db.blockchainNetwork.findFirstOrThrow({where:{isActive:true}});let cid='';
 for(let i=0;i<3;i++)await db.authSession.create({data:{id:digest(tokens[i]),adminId:i===1?reviewer.id:owner.id,mfaVerified:i!==2,expiresAt:new Date(Date.now()+600000)}});
 async function api(id:string,method='GET',body?:unknown,index=0){const r=await fetch('http://127.0.0.1:'+process.env.API_PORT+'/api/admin/tasks/'+id+'/limits',{method,headers:{Origin:process.env.APP_URL!,'Content-Type':'application/json',Cookie:'rewards_test_admin='+tokens[index]},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
 try{
  const campaign=await db.campaign.create({data:{title:nonce,description:'Limits authorization fixture',budgetWei:'100',networkId:network.id}});cid=campaign.id;
  const task=await db.task.create({data:{campaignId:cid,title:nonce,platform:'TURKCHAIN',kind:'EDUCATION',rewardWei:'10',verification:{type:'MANUAL',instructions:'Explain the ecosystem in detail.',minLength:20}}});
  const snapshot=await api(task.id);assert.equal(snapshot.status,200);
  const body={confirmId:task.id,expectedRulesHash:snapshot.data.expectedRulesHash,rewardWei:'15',campaignBudgetWei:'100',maxRewards:5,startsAt:null,endsAt:null};
  for(const index of [1,2])for(const method of ['GET','PATCH'])assert.ok([401,403].includes((await api(task.id,method,method==='PATCH'?body:undefined,index)).status));
  for(const extra of [{maxRewards:0},{maxRewards:1.5},{confirmId:'another-task-id'},{rewardWei:'0'},{rewardWei:'abc'},{rewardWei:'1.5'},{campaignBudgetWei:'abc'},{endsAt:'invalid'}])assert.equal((await api(task.id,'PATCH',{...body,...extra})).status,400);
  assert.equal((await api(task.id,'PATCH',body)).status,200);assert.equal((await api(task.id,'PATCH',body)).status,409);
  assert.equal((await db.task.findUniqueOrThrow({where:{id:task.id}})).enabled,false);
 }finally{await db.task.deleteMany({where:{campaignId:cid||'__none__'}});await db.campaign.deleteMany({where:{id:cid||'__none__'}});await db.auditEvent.deleteMany({where:{actor:{in:[owner.id,reviewer.id]}}});await db.admin.deleteMany({where:{id:{in:[owner.id,reviewer.id]}}});await db.$disconnect();}
});

test('serializable commit adapter conflicts retry and exhaust as HTTP409 without hiding unknown failures',async()=>{
 let attempts=0;const engine=new EngineService({db:{$transaction:async()=>{attempts++;if(attempts<3)throw {cause:{originalCode:'40001'}};return 'done';}}} as unknown as DataService,{} as ConfigurationService,{} as IntegrationSettings);
 assert.equal(await engine.transaction(async()=>''),'done');assert.equal(attempts,3);
 const busy=new EngineService({db:{$transaction:async()=>{throw {cause:{originalCode:'40001'}};}}} as unknown as DataService,{} as ConfigurationService,{} as IntegrationSettings);
 await assert.rejects(()=>busy.transaction(async()=>''),e=>(e as {getStatus:()=>number}).getStatus()===409);
 const unknown=new Error('unrelated');const broken=new EngineService({db:{$transaction:async()=>{throw unknown;}}} as unknown as DataService,{} as ConfigurationService,{} as IntegrationSettings);await assert.rejects(()=>broken.transaction(async()=>''),e=>e===unknown);
});

test('admin limits malformed wei inputs reject without throwing conversion errors',()=>{
 const body={confirmId:'fixture-task-id',expectedRulesHash:'a'.repeat(64),rewardWei:'1',campaignBudgetWei:'25',maxRewards:null,startsAt:null,endsAt:null};
 for(const rewardWei of ['abc','1.5','-1','1e18','','0','0x1'])assert.equal(taskLimitsInput.safeParse({...body,rewardWei}).success,false);
 for(const campaignBudgetWei of ['abc','1.5','-1','1e18',''])assert.equal(taskLimitsInput.safeParse({...body,campaignBudgetWei}).success,false);
});
