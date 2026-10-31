import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {digest} from '../apps/api/src/security';
test('task lifecycle, exact budgets, concurrent allocation, review and duplicate rewards',{skip:process.env.RUN_INTEGRATION!=='true'},async()=>{
 assert.equal(process.env.APP_ENV,'test');
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:5})}),marker=randomBytes(8).toString('hex'),created:string[]=[];
 const token=randomBytes(32).toString('hex'),reviewToken=randomBytes(32).toString('hex'),userTokens=[randomBytes(32).toString('hex'),randomBytes(32).toString('hex')];
 const email='engine-'+marker+'@example.invalid';
 const admin=await db.admin.create({data:{email,passwordHash:'unusable-fixture',role:'OWNER'}});
 const reviewer=await db.admin.create({data:{email:'reviewer-'+email,passwordHash:'unusable-fixture',role:'REVIEWER'}});
 const users=await Promise.all(userTokens.map((_,i)=>db.user.create({data:{wallet:'engine-'+marker+'-'+i}})));
 for(const [id,adminId,userId]of [[token,admin.id,null],[reviewToken,reviewer.id,null],...userTokens.map((t,i)=>[t,null,users[i].id])]){
  await db.authSession.create({data:{id:digest(id!),adminId,userId,mfaVerified:!!adminId,expiresAt:new Date(Date.now()+60000)}});
 }
 async function api(path:string,method='GET',body?:unknown,t=token,kind='admin'){
  const r=await fetch('http://127.0.0.1:'+process.env.API_PORT+'/api/'+path,{method,headers:{Origin:process.env.APP_URL!,'Content-Type':'application/json',Cookie:'rewards_test_'+kind+'='+t},body:body?JSON.stringify(body):undefined});
  return {status:r.status,data:await r.json() as Record<string,unknown>};
 }
 try{
  assert.equal((await api('admin/campaigns','POST',{title:'Test campaign '+marker,description:'Independent integration campaign',budgetWei:'15'},reviewToken)).status,403);
  const c=await api('admin/campaigns','POST',{title:'Test campaign '+marker,description:'Independent integration campaign',budgetWei:'15'});
  assert.equal(c.status,201);const id=c.data.id as string;created.push(id);
  const taskBody={campaignId:id,title:'Educational task '+marker,platform:'TURKCHAIN',kind:'EDUCATION',rewardWei:'10',policyReviewed:true,verification:{type:'MANUAL',instructions:'Explain the ecosystem concepts in your own words.',minLength:30}};
  const task=await api('admin/tasks','POST',taskBody);assert.equal(task.status,201);const taskId=task.data.id as string;
  assert.equal((await api('tasks/'+taskId+'/submit','POST',{proof:'A sufficiently detailed educational response.'},userTokens[0],'user')).status,409);
  assert.equal((await api('admin/tasks/'+taskId+'/publish','POST')).status,201);
  assert.equal((await api('admin/campaigns/'+id+'/publish','POST')).status,201);
  assert.equal((await api('tasks/'+taskId+'/submit','POST',{proof:'Too short for rule only.'},userTokens[0],'user')).status,400);
  const proof='An independent educational response explaining Turkchain concepts.';
  const race=await Promise.all(userTokens.map(t=>api('tasks/'+taskId+'/submit','POST',{proof},t,'user')));
  assert.deepEqual(race.map(x=>x.status).sort(),[201,409]);
  const winner=race.findIndex(x=>x.status===201),submissionId=race[winner].data.id as string;
  assert.equal((await db.campaign.findUniqueOrThrow({where:{id}})).allocatedWei.toFixed(),'10');
  assert.equal((await api('tasks/'+taskId+'/submit','POST',{proof},userTokens[winner],'user')).data.id,submissionId);
  assert.equal(await db.ledgerEntry.count({where:{campaignId:id}}),1);
  const approved=await Promise.all([api('admin/submissions/'+submissionId+'/review','POST',{action:'APPROVE',note:'Evidence reviewed and verified.'}),api('admin/submissions/'+submissionId+'/review','POST',{action:'APPROVE',note:'Repeated approval is idempotent.'},reviewToken)]);
  assert.deepEqual(approved.map(x=>x.status),[201,201]);
  assert.equal(await db.ledgerEvent.count({where:{ledger:{submissionId},toStatus:'AVAILABLE'}}),1);
  assert.equal((await api('admin/submissions/'+submissionId+'/review','POST',{action:'REJECT',note:'Must not reverse an approval.'})).status,409);
  assert.equal((await api('admin/campaigns/'+id,'PUT',{title:'Test campaign '+marker,description:'Budget may not fall below committed rewards.',budgetWei:'9'})).status,409);
  const ledger=await api('me/ledger','GET',undefined,userTokens[winner],'user');
  assert.equal((ledger.data.balances as Record<string,string>).AVAILABLE,'10');
  assert.equal((ledger.data.balances as Record<string,string>).PENDING,'0');
  const social=await api('admin/tasks','POST',{...taskBody,title:'Disabled social task',platform:'YOUTUBE',kind:'SOCIAL_INTERACTION',rewardWei:'1'});
  assert.equal(social.status,201);assert.equal((await api('admin/tasks/'+social.data.id+'/publish','POST')).status,403);
  const second=await api('admin/tasks','POST',{...taskBody,title:'Second education task',rewardWei:'4'});assert.equal(second.status,201);
  assert.equal((await api('admin/tasks/'+second.data.id+'/publish','POST')).status,201);
  const submitted=await api('tasks/'+second.data.id+'/submit','POST',{proof},userTokens[1-winner],'user');assert.equal(submitted.status,201);
  assert.equal((await db.campaign.findUniqueOrThrow({where:{id}})).allocatedWei.toFixed(),'14');
  assert.equal((await api('admin/submissions/'+submitted.data.id+'/review','POST',{action:'REJECT',note:'Educational evidence not sufficient.'},reviewToken)).status,201);
  assert.equal((await db.campaign.findUniqueOrThrow({where:{id}})).allocatedWei.toFixed(),'10');
  assert.equal((await api('admin/campaigns/'+id+'/pause','POST')).status,201);
  const taskRows=(await api('tasks')).data as unknown as {id:string}[];assert.equal(taskRows.some(t=>t.id===taskId),false);
  assert.equal((await api('admin/summary')).status,200);
  assert.equal((await api('me/ledger','GET',undefined,'invalid','user')).status,401);
 }finally{
  const actors=[admin.id,reviewer.id,...users.map(u=>u.id)];
  await db.ledgerEvent.deleteMany({where:{ledger:{campaignId:{in:created}}}});
  await db.ledgerEntry.deleteMany({where:{campaignId:{in:created}}});
  await db.submission.deleteMany({where:{task:{campaignId:{in:created}}}});
  await db.task.deleteMany({where:{campaignId:{in:created}}});await db.campaign.deleteMany({where:{id:{in:created}}});
  await db.auditEvent.deleteMany({where:{actor:{in:actors}}});await db.admin.deleteMany({where:{id:{in:[admin.id,reviewer.id]}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});await db.$disconnect();
 }
});
