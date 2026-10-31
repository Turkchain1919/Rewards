import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {Wallet} from 'ethers';
import * as OTPAuth from 'otpauth';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import Redis from 'ioredis';
import {digest,hashPassword} from '../apps/api/src/security';
test('admin bootstrap, MFA replay defense, roles, sessions and browser-bound wallet sign-in',{skip:process.env.RUN_INTEGRATION!=='true'},async()=>{
 assert.equal(process.env.APP_ENV,'test');
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:3})}),redis=new Redis(process.env.REDIS_URL!);
 const email='phase2-'+randomBytes(5).toString('hex')+'@example.invalid',reviewerEmail='reviewer-'+email,password=randomBytes(24).toString('hex');
 const wallet=Wallet.createRandom(),jar=new Map<string,string>(),userJar=new Map<string,string>(),reviewerJar=new Map<string,string>();
 const base='http://127.0.0.1:'+process.env.API_PORT;
 async function call(path:string,method='GET',body?:unknown,cookies=jar,requestOrigin=process.env.APP_URL){
  const r=await fetch(base+'/api/'+path,{method,headers:{'Content-Type':'application/json',Origin:requestOrigin!,'Cookie':Array.from(cookies).map(([k,v])=>k+'='+v).join('; ')},body:body===undefined?undefined:JSON.stringify(body)});
  for(const set of r.headers.getSetCookie()){const [pair]=set.split(';');const at=pair.indexOf('=');cookies.set(pair.slice(0,at),pair.slice(at+1));assert.match(set,/HttpOnly/i);}
  const data=await r.json() as Record<string,unknown>;return {r,data};
 }
 const rateKeys=['bootstrap','admin-login','mfa-enroll','mfa-verify','wallet','wallet-verify'].map(k=>'rate:'+k+':'+digest('127.0.0.1'));
 try{
  await redis.del(...rateKeys);
  assert.equal((await call('admin/bootstrap','POST',{token:process.env.ADMIN_BOOTSTRAP_TOKEN,email,password},jar,'https://attacker.invalid')).r.status,403);
  if(await db.admin.count()===0){
   assert.equal((await call('admin/bootstrap','POST',{token:process.env.ADMIN_BOOTSTRAP_TOKEN,email,password})).r.status,201);
  }else await db.admin.create({data:{email,passwordHash:await hashPassword(password),role:'OWNER'}});
  assert.equal((await call('admin/bootstrap','POST',{token:process.env.ADMIN_BOOTSTRAP_TOKEN,email:'duplicate@example.invalid',password})).r.status,409);
  assert.equal((await call('admin/login','POST',{email,password:'wrong'})).r.status,401);
  assert.equal((await call('admin/login','POST',{email,password})).r.status,201);
  assert.equal((await call('admin/accounts')).r.status,403);
  const enrolled=await call('admin/mfa/enroll','POST');assert.equal(enrolled.r.status,201);
  const secret=enrolled.data.secret as string;
  assert.equal((await call('admin/mfa/verify','POST',{code:'not-a-code'})).r.status,400);
  const code=new OTPAuth.TOTP({secret:OTPAuth.Secret.fromBase32(secret)}).generate();
  assert.equal((await call('admin/mfa/verify','POST',{code})).r.status,201);
  const me=await call('admin/me');assert.equal(me.data.mfaVerified,true);assert.equal(me.data.role,'OWNER');
  assert.equal((await call('admin/accounts')).r.status,200);
  const owner=await db.admin.findUniqueOrThrow({where:{email}});assert.ok(owner.totpEncrypted);assert.notEqual(owner.totpEncrypted,secret);
  assert.equal((await call('admin/accounts','POST',{email:reviewerEmail,password,role:'REVIEWER'})).r.status,201);
  assert.equal((await call('admin/login','POST',{email:reviewerEmail,password},reviewerJar)).r.status,201);
  const rev=await call('admin/mfa/enroll','POST',undefined,reviewerJar);
  const revCode=new OTPAuth.TOTP({secret:OTPAuth.Secret.fromBase32(rev.data.secret as string)}).generate();
  assert.equal((await call('admin/mfa/verify','POST',{code:revCode},reviewerJar)).r.status,201);
  assert.equal((await call('admin/accounts','GET',undefined,reviewerJar)).r.status,403);
  const ownerCookie=new Map(jar),secondBrowser=new Map<string,string>();
  assert.equal((await call('admin/login','POST',{email,password},secondBrowser)).r.status,201);
  assert.equal((await call('admin/mfa/verify','POST',{code},secondBrowser)).r.status,401);
  assert.equal((await call('admin/me','GET',undefined,ownerCookie)).data.mfaVerified,true);
  const sessions=await call('admin/sessions','GET',undefined,ownerCookie);
  assert.equal(sessions.r.status,200);
  const sessionList=sessions.data as unknown as {id:string;current:boolean}[];
  const current=sessionList.find(s=>s.current)!;
  assert.equal((await call('admin/sessions/'+current.id,'DELETE',undefined,ownerCookie)).r.status,200);
  assert.equal((await call('admin/me','GET',undefined,ownerCookie)).r.status,401);
  const challenge=await call('auth/challenge','POST',{address:wallet.address},userJar);
  const signature=await wallet.signMessage(challenge.data.message as string);
  assert.equal((await call('auth/verify','POST',{signature},new Map())).r.status,401);
  assert.equal((await call('auth/verify','POST',{signature},userJar)).r.status,201);
  assert.equal((await call('auth/verify','POST',{signature},userJar)).r.status,401);
  const profile=await call('auth/me','GET',undefined,userJar);assert.equal(profile.data.wallet,wallet.address.toLowerCase());assert.equal(profile.r.headers.get('Cache-Control'),'no-store');
  assert.equal((await call('auth/profile','POST',{displayName:'Community member'},userJar)).r.status,201);
  assert.equal((await call('auth/logout','POST',{},userJar)).r.status,201);
  assert.equal((await call('auth/me','GET',undefined,userJar)).r.status,401);
 }finally{
  const admins=await db.admin.findMany({where:{email:{in:[email,reviewerEmail]}},select:{id:true}});
  const users=await db.user.findMany({where:{wallet:wallet.address.toLowerCase()},select:{id:true}});
  await db.auditEvent.deleteMany({where:{actor:{in:[...admins,...users].map(x=>x.id)}}});
  await db.admin.deleteMany({where:{email:{in:[email,reviewerEmail]}}});await db.user.deleteMany({where:{wallet:wallet.address.toLowerCase()}});
  await redis.del(...rateKeys);await redis.quit();await db.$disconnect();
 }
});
