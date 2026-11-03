import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,createHmac} from 'node:crypto';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import Redis from 'ioredis';
import {digest} from '../apps/api/src/security';
import {IntegrationSettings} from '../apps/api/src/integration-settings';
import {SecretStore} from '../apps/api/src/configuration';
import {configuration,authorizationUrl} from '../apps/api/src/providers';
import type {DataService} from '../apps/api/src/data';
test('multi-social HTTP catalog, encrypted configuration, minimum user scopes, RBAC, policy gates and raw webhook replay',{skip:process.env.RUN_INTEGRATION!=='true'},async()=>{
 assert.equal(process.env.APP_ENV,'test');assert.match(process.env.DATABASE_URL||'',/rewards_test/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:6})}),redis=new Redis(process.env.REDIS_URL!),nonce=randomBytes(8).toString('hex'),actor='social-http-'+nonce,tokens=Array.from({length:4},()=>randomBytes(32).toString('hex'));
 const owner=await db.admin.create({data:{email:actor+'@example.invalid',passwordHash:'fixture',role:'OWNER'}}),reviewer=await db.admin.create({data:{email:'review-'+actor+'@example.invalid',passwordHash:'fixture',role:'REVIEWER'}}),user=await db.user.create({data:{wallet:actor}}),events:string[]=[],createdAccounts:string[]=[],createdCampaigns:string[]=[];
 const before:Record<string,{setting:Awaited<ReturnType<typeof db.integrationSetting.findUnique>>;credential:Awaited<ReturnType<typeof db.credential.findUnique>>}>={};
 for(const platform of ['KICK','TWITCH'])before[platform]={setting:await db.integrationSetting.findUnique({where:{platform}}),credential:await db.credential.findUnique({where:{scope_ownerId_kind:{scope:'SOCIAL_PLATFORM',ownerId:platform,kind:'OAUTH_CONFIG'}}})};
 for(const [i,subject] of [owner,reviewer,user,owner].entries())await db.authSession.create({data:{id:digest(tokens[i]),adminId:i===2?null:subject.id,userId:i===2?subject.id:null,mfaVerified:i!==3,expiresAt:new Date(Date.now()+600000)}});
 const network=await db.blockchainNetwork.findFirstOrThrow({where:{isActive:true}}),origin=process.env.APP_URL!,base='http://127.0.0.1:'+process.env.API_PORT+'/api/';
 async function api(path:string,method='GET',body?:unknown,index=0){const r=await fetch(base+path,{method,headers:{Origin:origin,'Content-Type':'application/json',Cookie:'rewards_test_'+(index===2?'user':'admin')+'='+tokens[index]},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
 try{
  const catalog=await api('social/task-catalog');assert.equal(catalog.status,200);assert.equal(catalog.data.length,65);assert.ok(catalog.data.filter((r:{policyStatus:string})=>r.policyStatus==='RESTRICTED').every((r:{canPublish:boolean})=>!r.canPublish));
  for(const index of [1,2,3])assert.ok([401,403].includes((await api('admin/social/task-catalog','GET',undefined,index)).status));
  const campaign=await db.campaign.create({data:{title:actor,description:'Isolated multi-social HTTP fixture',budgetWei:'100',networkId:network.id}});createdCampaigns.push(campaign.id);
  const account=await db.officialSocialAccount.create({data:{platform:'X',accountType:'ACCOUNT',name:actor,accountId:'fixture-owner',profileUrl:'https://x.com/fixture',enabled:true}});createdAccounts.push(account.id);
  const task={campaignId:campaign.id,title:actor,platform:'X',kind:'SOCIAL_INTERACTION',socialTaskCode:'X_LIKE',targetUrl:'https://x.com/fixture/status/123',targetObjectId:'123',officialAccountId:account.id,policyReviewed:true,rewardWei:'1',budgetWei:'25',timezone:'Europe/Istanbul',verification:{type:'SOCIAL_API',code:'X_LIKE',instructions:'A restricted informational draft only.',maxRewards:25}};
  const body={campaignId:campaign.id,idempotencyKey:randomBytes(16).toString('hex'),items:[task]};const saved=await api('admin/social/tasks/batch','POST',body);assert.equal(saved.status,201);assert.equal(saved.data.tasks[0].enabled,false);const tid=saved.data.tasks[0].id;assert.equal((await api('admin/tasks/'+tid+'/publish','POST')).status,403);assert.equal((await api('tasks/'+tid+'/verify','POST',undefined,2)).status,403);
  const duplicate=await api('admin/social/tasks/batch','POST',body);assert.equal(duplicate.data.alreadyProcessed,true);assert.equal(await db.task.count({where:{campaignId:campaign.id}}),1);
  for(const index of [1,2,3])assert.ok([401,403].includes((await api('admin/social/tasks/batch','POST',{...body,idempotencyKey:randomBytes(16).toString('hex')},index)).status));
  assert.equal((await api('admin/social/targets/resolve','POST',{officialAccountId:account.id,url:'https://127.0.0.1/private'})).status,400);
  assert.equal((await api('admin/social/targets/resolve','POST',{officialAccountId:account.id,url:'https://x.com/fixture/status/123?access_token=forbidden'})).status,400);
  const credentialFixture='fixture-secret-'+nonce;
  const kickBody={credentials:{clientId:'fixture-client',clientSecret:credentialFixture},redirectUri:origin+'/api/oauth/kick/callback',enabled:true,mode:'oauth',graphVersion:'',requestedScopes:['user:read','events:subscribe'],version:before.KICK.setting?.version||0};
  assert.equal((await api('admin/social-api/KICK','POST',{...kickBody,requestedScopes:['not.a.real.scope']})).status,400);
  assert.equal((await api('admin/social-api/KICK','POST',kickBody)).status,201);
  const integrations=await api('admin/integrations');assert.ok(!JSON.stringify(integrations.data).includes(credentialFixture));const kick=integrations.data.find((r:{platform:string})=>r.platform==='KICK');assert.equal(kick.status,'configured');assert.notEqual(kick.status,'connected');
  const data={db,redis} as unknown as DataService,settings=new IntegrationSettings(data,new SecretStore(data));const personal=await settings.runtime('KICK','user'),official=await settings.runtime('KICK','official');
  assert.equal(new URL(authorizationUrl('KICK','state','verifier','nonce',personal)).searchParams.get('scope'),'user:read');assert.ok(configuration('KICK',official).definition.scopes.includes('events:subscribe'));
  const connect=await api('social/kick/connect','POST',undefined,2);assert.equal(connect.status,201);const state=new URL(connect.data.url).searchParams.get('state')!;await redis.del('oauth:'+digest(state));assert.equal(await db.socialAccount.count({where:{userId:user.id,provider:'KICK'}}),0,'an authorize URL must not create a connected account');
  const secret='fixture-webhook-'+nonce;
  assert.equal((await api('admin/social-api/TWITCH','POST',{credentials:{clientId:'fixture-client',clientSecret:credentialFixture,webhookSecret:secret},redirectUri:origin+'/api/oauth/twitch/callback',enabled:true,mode:'oauth',graphVersion:'',requestedScopes:[],webhookEnabled:true,version:before.TWITCH.setting?.version||0})).status,201);
  const id='http-event-'+nonce,stamp=new Date().toISOString(),raw=JSON.stringify({subscription:{type:'channel.chat.message',version:'1'},event:{broadcaster_user_id:'fixture-owner',user_id:'fixture-viewer',message:{text:'fixture'}}});events.push(id);
  const headers={Origin:origin,'Content-Type':'application/json','Twitch-Eventsub-Message-Id':id,'Twitch-Eventsub-Message-Timestamp':stamp,'Twitch-Eventsub-Subscription-Type':'channel.chat.message','Twitch-Eventsub-Message-Type':'notification','Twitch-Eventsub-Message-Signature':'sha256='+createHmac('sha256',secret).update(id+stamp+raw).digest('hex')};
  const webhook=()=>fetch(base+'social/webhooks/twitch',{method:'POST',headers,body:raw});assert.equal((await webhook()).status,200);const replay=await webhook();assert.equal(replay.status,200);assert.equal((await replay.json()).duplicate,true);assert.equal(await db.socialWebhookReceipt.count({where:{platform:'TWITCH',eventId:id}}),1);
  assert.equal((await fetch(base+'social/webhooks/twitch',{method:'POST',headers,body:raw+' '})).status,401);
  assert.equal((await fetch(base+'social/webhooks/twitch',{method:'POST',headers:{...headers,'Twitch-Eventsub-Subscription-Type':'channel.subscribe'},body:raw})).status,400);
  assert.equal((await fetch(base+'social/webhooks/twitch',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad json'})).status,400);
  assert.equal((await fetch(base+'social/webhooks/twitch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:'x'.repeat(70000)})})).status,413);
  assert.equal(await db.ledgerEntry.count({where:{userId:user.id}}),0,'collecting an event must never pay a policy-restricted task');
 }finally{
  for(const platform of ['KICK','TWITCH']){const old=before[platform];if(old.setting)await db.integrationSetting.upsert({where:{platform},create:old.setting,update:old.setting});else await db.integrationSetting.deleteMany({where:{platform}});const current=await db.credential.findUnique({where:{scope_ownerId_kind:{scope:'SOCIAL_PLATFORM',ownerId:platform,kind:'OAUTH_CONFIG'}}});if(old.credential)await db.credential.upsert({where:{id:old.credential.id},create:old.credential,update:old.credential});else if(current)await db.credential.delete({where:{id:current.id}});}
  await db.socialWebhookReceipt.deleteMany({where:{platform:'TWITCH',eventId:{in:events}}});await db.task.deleteMany({where:{campaignId:{in:createdCampaigns}}});await db.campaign.deleteMany({where:{id:{in:createdCampaigns}}});await db.officialSocialAccount.deleteMany({where:{id:{in:createdAccounts}}});await db.socialLinkState.deleteMany({where:{userId:user.id}});await db.authSession.deleteMany({where:{OR:[{adminId:{in:[owner.id,reviewer.id]}},{userId:user.id}]}});await db.user.delete({where:{id:user.id}});await db.admin.deleteMany({where:{id:{in:[owner.id,reviewer.id]}}});await db.auditEvent.deleteMany({where:{OR:[{actor:{in:[owner.id,reviewer.id,user.id]}},{actor:'webhook:TWITCH',resource:{in:events}}]}});await redis.del('api-test:KICK');await redis.quit();await db.$disconnect();
 }
});
