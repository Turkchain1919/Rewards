import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {digest} from '../apps/api/src/security';
test('v0.4.5 safe deletion, archive, dates, authorization, concurrency and accounting',{skip:process.env.RUN_INTEGRATION!=='true'},async t=>{
 assert.equal(process.env.APP_ENV,'test');assert.match(process.env.DATABASE_URL||'',/rewards_test/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:6})}),marker=randomBytes(8).toString('hex');
 const admin=await db.admin.create({data:{email:'lifecycle-'+marker+'@example.invalid',passwordHash:'fixture',role:'OWNER'}}),reviewer=await db.admin.create({data:{email:'review-'+marker+'@example.invalid',passwordHash:'fixture',role:'REVIEWER'}}),user=await db.user.create({data:{wallet:'lifecycle-'+marker}});
 const tokens=Array.from({length:4},()=>randomBytes(32).toString('hex')),created:string[]=[];
 for(const [i,subject] of [admin,reviewer,user,admin].entries())await db.authSession.create({data:{id:digest(tokens[i]),adminId:i===2?null:subject.id,userId:i===2?subject.id:null,mfaVerified:i!==3,expiresAt:new Date(Date.now()+600000)}});
 async function api(path:string,method='GET',body?:unknown,index=0){const r=await fetch('http://127.0.0.1:'+process.env.API_PORT+'/api/'+path,{method,headers:{Origin:process.env.APP_URL!,'Content-Type':'application/json',Cookie:'rewards_test_'+(index===2?'user':'admin')+'='+tokens[index]},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
 async function campaign(){const r=await api('admin/campaigns','POST',{title:'Lifecycle '+marker,description:'Isolated lifecycle integration fixture',budgetWei:'100'});assert.equal(r.status,201);created.push(r.data.id);return r.data.id as string;}
 function body(id:string){return {campaignId:id,title:'Lifecycle task '+marker,platform:'TURKCHAIN',kind:'EDUCATION',rewardWei:'10',policyReviewed:true,verification:{type:'MANUAL',instructions:'Explain Turkchain ecosystem in your own words.',minLength:20}};}
 async function task(id:string,extra={}){const r=await api('admin/tasks','POST',{...body(id),...extra});assert.equal(r.status,201);return r.data.id as string;}
 const proof='A detailed independent explanation of the Turkchain ecosystem.';
 try{
 const c=await campaign(),unused=await task(c);
 await t.test('unused task impact and confirmed permanent delete, repeated requests',async()=>{
  const impact=await api('admin/tasks/'+unused+'/impact');assert.equal(impact.data.canDelete,true);assert.equal(impact.data.participations,0);
  assert.equal((await api('admin/tasks/'+unused,'DELETE',{})).status,400);
  const results=await Promise.all([api('admin/tasks/'+unused,'DELETE',{confirmId:unused}),api('admin/tasks/'+unused,'DELETE',{confirmId:unused})]);assert.deepEqual(results.map(r=>r.status),[200,200]);assert.equal(results.every(r=>r.data.deleted),true);
  assert.equal(await db.task.count({where:{id:unused}}),0);assert.equal(await db.auditEvent.count({where:{action:'TASK_DELETE',resource:unused}}),1);
 });
 const used=await task(c,{localizedContent:{tr:{title:'Türkçe görev',steps:['Birinci adım'],rewardCondition:'Bir kez'},en:{title:'English task',description:'Localized description',steps:['First step'],rewardCondition:'Once'}}});
 await api('admin/tasks/'+used+'/publish','POST');await api('admin/campaigns/'+c+'/publish','POST');
 const submission=await api('tasks/'+used+'/submit','POST',{proof},2);assert.equal(submission.status,201);await api('admin/submissions/'+submission.data.id+'/review','POST',{action:'APPROVE',note:'Verified test evidence'});
 const contentUpdate=await api('admin/tasks/'+used+'/content','PATCH',{title:'Updated task title',localizedContent:{tr:{title:'Türkçe görev'},en:{title:'Updated English task'}},startsAt:null,endsAt:null});assert.equal(contentUpdate.status,200);assert.equal((await db.task.findUniqueOrThrow({where:{id:used}})).rewardWei.toFixed(),'10');
 const before=await api('me/ledger','GET',undefined,2),allocated=(await db.campaign.findUniqueOrThrow({where:{id:c}})).allocatedWei.toFixed();
 await t.test('rewarded task archives and AVAILABLE, history, ledger events remain unchanged',async()=>{
  assert.equal((await api('admin/tasks/'+used+'/impact')).data.canDelete,false);
  const r=await api('admin/tasks/'+used,'DELETE',{confirmId:used});assert.equal(r.status,200);assert.equal(r.data.archived,true);
  assert.equal((await api('admin/tasks/'+used,'DELETE',{confirmId:used})).data.alreadyArchived,true);
  const after=await api('me/ledger','GET',undefined,2);assert.deepEqual(after.data,before.data);assert.equal(after.data.balances.AVAILABLE,'10');
  assert.equal((await db.campaign.findUniqueOrThrow({where:{id:c}})).allocatedWei.toFixed(),allocated);
  assert.equal((await api('me/history','GET',undefined,2)).data.some((r:{taskId:string})=>r.taskId===used),true);
  assert.equal((await api('tasks')).data.some((r:{id:string})=>r.id===used),false);assert.equal((await api('me/tasks','GET',undefined,2)).data.some((r:{id:string})=>r.id===used),false);
  assert.equal((await api('admin/tasks/'+used+'/publish','POST')).status,409);
 });
 await t.test('empty active campaign stops before deletion; campaign history archives its tasks',async()=>{
  const empty=await campaign();await db.campaign.update({where:{id:empty},data:{status:'ACTIVE'}});
  assert.equal((await api('admin/campaigns/'+empty+'/impact')).data.willPause,true);
  assert.equal((await api('admin/campaigns/'+empty,'DELETE',{confirmId:empty})).data.deleted,true);
  assert.equal((await api('admin/campaigns/'+empty,'DELETE',{confirmId:empty})).data.alreadyDeleted,true);
  assert.equal(await db.auditEvent.count({where:{resource:empty,action:'CAMPAIGN_PAUSE'}}),1);
  const pending=await task(c);await api('admin/tasks/'+pending+'/publish','POST');
  const r=await api('admin/campaigns/'+c,'DELETE',{confirmId:c});assert.equal(r.data.archived,true);
  assert.ok((await db.task.findUniqueOrThrow({where:{id:pending}})).archivedAt);
  assert.equal((await api('me/ledger','GET',undefined,2)).data.balances.AVAILABLE,'10');
  assert.equal((await api('tasks/'+pending+'/submit','POST',{proof},2)).status,409);
  assert.equal((await api('admin/campaigns/'+c+'/publish','POST')).status,409);
  assert.equal((await api('admin/tasks','POST',body(c))).status,409);
 });
 const c2=await campaign(),fresh=await task(c2);
 await t.test('failed or in-flight verification alone prevents permanent deletion',async()=>{
  const attempted=await task(c2);await db.auditEvent.create({data:{actor:user.id,action:'TELEGRAM_VERIFICATION_STARTED',resource:attempted}});
  const impact=await api('admin/tasks/'+attempted+'/impact');assert.equal(impact.data.canDelete,false);assert.equal(impact.data.verificationAttempts,1);
  assert.equal((await api('admin/tasks/'+attempted,'DELETE',{confirmId:attempted})).data.archived,true);assert.ok((await db.task.findUniqueOrThrow({where:{id:attempted}})).archivedAt);
 });

 await t.test('reviewer, user and sessions without MFA cannot delete or archive',async()=>{
  for(const index of [1,2,3])for(const [path,method,b] of [['admin/tasks/'+fresh,'DELETE',{confirmId:fresh}],['admin/tasks/'+fresh+'/archive','POST',{}],['admin/campaigns/'+c2,'DELETE',{confirmId:c2}],['admin/campaigns/'+c2+'/archive','POST',{}]] as const){const r=await api(path,method,b,index);assert.ok([401,403].includes(r.status));}
  assert.equal(await db.task.count({where:{id:fresh}}),1);
 });
 await t.test('legacy fields stay compatible; localized content, task dates and merged date validation',async()=>{
  const row=await db.task.findUniqueOrThrow({where:{id:fresh}});assert.equal(row.localizedContent,null);
  const future=new Date(Date.now()+86400000).toISOString(),later=new Date(Date.now()+172800000).toISOString();
  assert.equal((await api('admin/tasks/'+fresh,'PUT',{...body(c2),startsAt:future,endsAt:later})).status,200);
  assert.equal((await api('admin/tasks/'+fresh,'PUT',{...body(c2),endsAt:new Date().toISOString()})).status,400);
  await api('admin/tasks/'+fresh+'/publish','POST');await api('admin/campaigns/'+c2+'/publish','POST');
  assert.equal((await api('tasks')).data.some((r:{id:string})=>r.id===fresh),false);
  assert.equal((await api('tasks/'+fresh+'/submit','POST',{proof},2)).status,409);
  const board=await api('me/tasks','GET',undefined,2);assert.equal(board.data.find((r:{id:string})=>r.id===fresh).userStatus,'NOT_STARTED');
  const localized=await db.task.findUniqueOrThrow({where:{id:used}});assert.equal((localized.localizedContent as {tr:{title:string}}).tr.title,'Türkçe görev');
 });
 await t.test('concurrent submission and campaign archive never orphan rewards',async()=>{
  const raceTask=await task(c2);await api('admin/tasks/'+raceTask+'/publish','POST');
  const [submit,archive]=await Promise.all([api('tasks/'+raceTask+'/submit','POST',{proof},2),api('admin/campaigns/'+c2+'/archive','POST')]);assert.equal(archive.status,201);assert.ok([201,409].includes(submit.status));
  assert.ok((await db.task.findUniqueOrThrow({where:{id:raceTask}})).archivedAt);
  const entries=await db.ledgerEntry.findMany({where:{campaignId:c2}});assert.equal(entries.length,submit.status===201?1:0);
  assert.equal((await api('me/ledger','GET',undefined,2)).data.balances.AVAILABLE,'10');
 });
 }finally{
  // Only explicitly created TEST fixtures are cleaned. Application lifecycle never deletes ledger data.
  await db.ledgerEvent.deleteMany({where:{ledger:{campaignId:{in:created}}}});await db.ledgerEntry.deleteMany({where:{campaignId:{in:created}}});await db.submission.deleteMany({where:{task:{campaignId:{in:created}}}});await db.task.deleteMany({where:{campaignId:{in:created}}});await db.campaign.deleteMany({where:{id:{in:created}}});await db.auditEvent.deleteMany({where:{actor:{in:[admin.id,reviewer.id,user.id]}}});await db.admin.deleteMany({where:{id:{in:[admin.id,reviewer.id]}}});await db.user.delete({where:{id:user.id}});await db.$disconnect();
 }
});
