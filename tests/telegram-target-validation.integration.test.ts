import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {digest} from '../apps/api/src/security';
test('official Telegram target HTTP validation rejects positive groups and preserves connected negative identities',{skip:process.env.RUN_INTEGRATION!=='true'},async()=>{
 assert.equal(process.env.APP_ENV,'test');assert.match(process.env.DATABASE_URL||'',/rewards_test/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})}),nonce=randomBytes(8).toString('hex'),token=randomBytes(32).toString('hex'),ids:string[]=[];
 const admin=await db.admin.create({data:{email:'target-validation-'+nonce+'@example.invalid',passwordHash:'fixture',role:'OWNER'}});
 await db.authSession.create({data:{id:digest(token),adminId:admin.id,mfaVerified:true,expiresAt:new Date(Date.now()+600000)}});
 async function api(path:string,method:string,body:unknown){const response=await fetch('http://127.0.0.1:'+process.env.API_PORT+'/api/admin/'+path,{method,headers:{Origin:process.env.APP_URL!,Cookie:'rewards_test_admin='+token,'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:response.status,data:await response.json()};}
 try{
  for(const accountType of ['GROUP','CHANNEL']){
   const body={platform:'TELEGRAM',accountType,name:'Target validation '+nonce,username:'Turkchain1919',accountId:'-1003676977941',profileUrl:'https://t.me/Turkchain1919',defaultTargetUrl:'https://t.me/Turkchain1919',enabled:true};
   const rejected=await api('official-accounts','POST',{...body,accountId:'1003676977941'});assert.equal(rejected.status,400);assert.ok(rejected.data.errors.some((e:{field:string})=>e.field==='accountId'));
   const created=await api('official-accounts','POST',body);assert.equal(created.status,201);ids.push(created.data.id);assert.equal(created.data.accountId,body.accountId);
   await db.officialSocialAccount.update({where:{id:created.data.id},data:{connectionStatus:'CONNECTED'}});
   const badEdit=await api('official-accounts/'+created.data.id,'PUT',{...body,accountId:'1003676977941'});assert.equal(badEdit.status,400);assert.equal((await db.officialSocialAccount.findUniqueOrThrow({where:{id:created.data.id}})).accountId,body.accountId);
   const goodEdit=await api('official-accounts/'+created.data.id,'PUT',body);assert.equal(goodEdit.status,200);assert.equal(goodEdit.data.accountId,body.accountId);assert.equal(goodEdit.data.connectionStatus,'CONNECTED');
   assert.equal((await api('official-accounts','POST',{...body,defaultTargetUrl:'1003676977941'})).status,400);
  }
 }finally{await db.officialSocialAccount.deleteMany({where:{id:{in:ids}}});await db.auditEvent.deleteMany({where:{actor:admin.id}});await db.admin.delete({where:{id:admin.id}});await db.$disconnect();}
});
