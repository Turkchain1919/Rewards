import {Body,Controller,Get,Post,Patch,Delete,Param,Req,Res,Injectable,UnauthorizedException,ForbiddenException,ConflictException,HttpException} from '@nestjs/common';
import type {Request,Response} from 'express';
import {randomBytes} from 'node:crypto';
import {getAddress,verifyMessage} from 'ethers';
import {SiweMessage} from 'siwe';
import * as OTPAuth from 'otpauth';
import {z} from 'zod';
import {ConfigurationService} from './configuration';
import {DataService} from './data';
import {parse,origin,hashPassword,verifyPassword,encrypt,decrypt,digest,equal,cookie,readCookie,passwordSchema,emailSchema} from './security';
@Injectable()
export class AuthService {
 constructor(readonly data:DataService,readonly config:ConfigurationService){}
 async limit(req:Request,bucket:string,max=12){
  const key='rate:'+bucket+':'+digest(req.ip||'local');
  const count=Number(await this.data.redis.eval("local n=redis.call('INCR',KEYS[1]);if n==1 then redis.call('EXPIRE',KEYS[1],900) end;return n",1,key));
  if(count>max)throw new HttpException('Try again later',429);
 }
 async issue(res:Response,kind:'admin'|'user',subject:string,verified=false,replace?:string){
  const token=randomBytes(32).toString('hex'),id=digest(token),seconds=kind==='admin'?3600:86400;
  await this.data.db.$transaction(async tx=>{
   if(replace)await tx.authSession.deleteMany({where:{id:replace}});
   await tx.authSession.create({data:{id,adminId:kind==='admin'?subject:null,userId:kind==='user'?subject:null,mfaVerified:verified,expiresAt:new Date(Date.now()+seconds*1000)}});
  });
  cookie(res,kind,token,seconds*1000);
 }
 async admin(req:Request,roles:string[]=['OWNER','ADMIN','REVIEWER'],mfa=true){
  const id=digest(readCookie(req,'admin'));const session=await this.data.db.authSession.findUnique({where:{id},include:{admin:true}});
  if(!session?.admin||!session.admin.enabled||session.expiresAt.getTime()<Date.now())throw new UnauthorizedException();
  if(mfa&&!session.mfaVerified)throw new ForbiddenException('MFA required');
  if(!roles.includes(session.admin.role))throw new ForbiddenException('Role rejected');
  return {session,admin:session.admin};
 }
 async stepUp(req:Request,code?:string){
  const {session,admin}=await this.admin(req,['OWNER']);
  if(Date.now()-session.createdAt.getTime()<300000||await this.data.redis.exists('stepup:'+session.id))return;
  if(!code||!admin.totpEncrypted)throw new ForbiddenException('Step-up MFA required');
  await this.totp(admin.id,decrypt(admin.totpEncrypted),code);await this.data.redis.set('stepup:'+session.id,'1','EX',300);
 }
 async user(req:Request){
  const session=await this.data.db.authSession.findUnique({where:{id:digest(readCookie(req,'user'))},include:{user:true}});
  if(!session?.user||session.expiresAt.getTime()<Date.now())throw new UnauthorizedException();
  return session.user;
 }
 async totp(adminId:string,secret:string,token:string){
  const totp=new OTPAuth.TOTP({issuer:'Turkchain Rewards',algorithm:'SHA1',digits:6,period:30,secret:OTPAuth.Secret.fromBase32(secret)});
  const delta=totp.validate({token,window:1});if(delta===null)throw new UnauthorizedException('Invalid MFA code');
  const step=Math.floor(Date.now()/30000)+delta;
  const updated=await this.data.db.admin.updateMany({where:{id:adminId,lastTotpStep:{lt:step}},data:{lastTotpStep:step}});
  if(updated.count!==1)throw new UnauthorizedException('MFA code already used');
 }
}
@Controller('api/auth')
export class UserAuthController {
 constructor(private readonly auth:AuthService){}
 @Post('challenge')async challenge(@Body()body:unknown,@Req()req:Request,@Res({passthrough:true})res:Response){
  origin(req);await this.auth.limit(req,'wallet');
  const {address,networkKey}=parse(z.object({address:z.string().regex(/^0x[0-9a-fA-F]{40}$/),networkKey:z.string().max(40).optional()}).strict(),body);
  const network=await this.auth.config.selected(networkKey),branding=await this.auth.config.branding();
  const token=randomBytes(32).toString('hex'),nonce=randomBytes(16).toString('hex');
  const message=new SiweMessage({domain:new URL(process.env.APP_URL!).host,address:getAddress(address),statement:'Sign in to '+branding.appName.replace(/[\r\n]/g,' ')+'. No transaction or payment.',uri:process.env.APP_URL!,version:'1',chainId:Number(network.chainId),nonce,issuedAt:new Date().toISOString(),expirationTime:new Date(Date.now()+300000).toISOString()}).prepareMessage();
  await this.auth.data.redis.set('challenge:'+digest(token),JSON.stringify({message,address:getAddress(address),networkKey:network.networkKey}),'EX',300);
  cookie(res,'challenge',token,300000);return {message};
 }
 @Post('verify')async verify(@Body()body:unknown,@Req()req:Request,@Res({passthrough:true})res:Response){
  origin(req);await this.auth.limit(req,'wallet-verify');
  const {signature}=parse(z.object({signature:z.string().regex(/^0x[0-9a-fA-F]{130}$/)}).strict(),body);
  const raw=await this.auth.data.redis.getdel('challenge:'+digest(readCookie(req,'challenge')));
  cookie(res,'challenge','',0);if(!raw)throw new UnauthorizedException('Challenge expired');
  const challenge=JSON.parse(raw) as {message:string;address:string;networkKey?:string};
  await this.auth.config.selected(challenge.networkKey);
  try{if(verifyMessage(challenge.message,signature)!==challenge.address)throw new Error();}catch{throw new UnauthorizedException('Signature rejected');}
  const user=await this.auth.data.db.user.upsert({where:{wallet:challenge.address.toLowerCase()},create:{wallet:challenge.address.toLowerCase()},update:{}});
  await this.auth.issue(res,'user',user.id,false,digest(readCookie(req,'user')));
  await this.auth.data.audit(user.id,'USER_LOGIN',user.wallet);return {id:user.id,wallet:user.wallet};
 }
 @Get('me')async me(@Req()req:Request){const u=await this.auth.user(req);return {id:u.id,wallet:u.wallet,displayName:u.displayName,createdAt:u.createdAt};}
 @Post('profile')async profile(@Body()body:unknown,@Req()req:Request){origin(req);const u=await this.auth.user(req);const data=parse(z.object({displayName:z.string().trim().min(1).max(60)}).strict(),body);await this.auth.data.db.user.update({where:{id:u.id},data});return {ok:true};}
 @Post('logout')async logout(@Req()req:Request,@Res({passthrough:true})res:Response){origin(req);await this.auth.data.db.authSession.deleteMany({where:{id:digest(readCookie(req,'user'))}});cookie(res,'user','',0);return {ok:true};}
}
@Controller('api/admin')
export class AdminAuthController {
 constructor(private readonly auth:AuthService){}
 @Get('setup-status')async setupStatus(){return {setupRequired:(await this.auth.data.db.admin.count())===0};}
 @Post('bootstrap')async bootstrap(@Body()body:unknown,@Req()req:Request){
  origin(req);await this.auth.limit(req,'bootstrap',5);
  const b=parse(z.object({token:z.string().min(32).max(128),email:emailSchema,password:passwordSchema}).strict(),body);
  const expected=process.env.ADMIN_BOOTSTRAP_TOKEN;
  if(!expected||!equal(expected,b.token))throw new UnauthorizedException('Setup rejected');
  const passwordHash=await hashPassword(b.password);
  const admin=await this.auth.data.db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(1919, 2001)`;
   if(await tx.admin.count())throw new ConflictException('Setup already completed');
   const a=await tx.admin.create({data:{email:b.email,passwordHash,role:'OWNER'}});
   await tx.auditEvent.create({data:{actor:a.id,action:'ADMIN_BOOTSTRAP',resource:a.id}});return a;
  });
  return {id:admin.id,email:admin.email,mfaRequired:true};
 }
 @Post('login')async login(@Body()body:unknown,@Req()req:Request,@Res({passthrough:true})res:Response){
  origin(req);await this.auth.limit(req,'admin-login',10);
  const b=parse(z.object({email:emailSchema,password:z.string().min(1).max(128)}).strict(),body);
  const admin=await this.auth.data.db.admin.findUnique({where:{email:b.email}});
  const valid=admin?await verifyPassword(b.password,admin.passwordHash):await verifyPassword(b.password,'scrypt131072:00000000000000000000000000000000:'+ '00'.repeat(64));
  if(!admin||!valid||!admin.enabled)throw new UnauthorizedException('Login rejected');
  await this.auth.issue(res,'admin',admin.id,false,digest(readCookie(req,'admin')));
  return {mfaRequired:true,enrollmentRequired:!admin.totpEncrypted};
 }
 @Post('mfa/enroll')async enroll(@Req()req:Request){
  origin(req);await this.auth.limit(req,'mfa-enroll',8);const {admin,session}=await this.auth.admin(req,undefined,false);
  if(admin.totpEncrypted)throw new ConflictException('MFA already enrolled');
  const secret=new OTPAuth.Secret({size:20});
  const totp=new OTPAuth.TOTP({issuer:'Turkchain Rewards',label:admin.email,secret,algorithm:'SHA1',digits:6,period:30});
  await this.auth.data.redis.set('mfa-enroll:'+session.id,encrypt(secret.base32),'EX',300);
  return {secret:secret.base32,uri:totp.toString()};
 }
 @Post('mfa/verify')async verify(@Body()body:unknown,@Req()req:Request,@Res({passthrough:true})res:Response){
  origin(req);await this.auth.limit(req,'mfa-verify',12);
  const {code}=parse(z.object({code:z.string().regex(/^\d{6}$/)}).strict(),body);
  const {admin,session}=await this.auth.admin(req,undefined,false);
  const pending=admin.totpEncrypted||await this.auth.data.redis.get('mfa-enroll:'+session.id);
  if(!pending)throw new UnauthorizedException('MFA enrollment required');
  await this.auth.totp(admin.id,decrypt(pending),code);
  if(!admin.totpEncrypted){const updated=await this.auth.data.db.admin.updateMany({where:{id:admin.id,totpEncrypted:null},data:{totpEncrypted:pending}});if(updated.count!==1)throw new ConflictException('MFA enrollment changed');}
  await this.auth.data.redis.del('mfa-enroll:'+session.id);
  await this.auth.issue(res,'admin',admin.id,true,session.id);
  await this.auth.data.audit(admin.id,'ADMIN_MFA_LOGIN',admin.id);
  return {ok:true};
 }
 @Get('me')async me(@Req()req:Request){const {admin,session}=await this.auth.admin(req,undefined,false);return {id:admin.id,email:admin.email,role:admin.role,mfaVerified:session.mfaVerified,enrolled:!!admin.totpEncrypted};}
 @Get('sessions')async sessions(@Req()req:Request){const {admin,session}=await this.auth.admin(req);const rows=await this.auth.data.db.authSession.findMany({where:{adminId:admin.id,expiresAt:{gt:new Date()}},select:{id:true,createdAt:true,expiresAt:true,mfaVerified:true}});return rows.map(s=>({...s,current:s.id===session.id}));}
 @Delete('sessions/:id')async revoke(@Param('id')id:string,@Req()req:Request){origin(req);const {admin}=await this.auth.admin(req);await this.auth.data.db.authSession.deleteMany({where:{id,adminId:admin.id}});return {ok:true};}
 @Post('logout')async logout(@Req()req:Request,@Res({passthrough:true})res:Response){origin(req);await this.auth.data.db.authSession.deleteMany({where:{id:digest(readCookie(req,'admin'))}});cookie(res,'admin','',0);return {ok:true};}
 @Post('password')async password(@Body()body:unknown,@Req()req:Request,@Res({passthrough:true})res:Response){
  origin(req);const {admin}=await this.auth.admin(req);await this.auth.limit(req,'password:'+admin.id,5);
  const b=parse(z.object({currentPassword:z.string().max(128),newPassword:passwordSchema}).strict(),body);
  if(!await verifyPassword(b.currentPassword,admin.passwordHash))throw new UnauthorizedException('Password rejected');
  const passwordHash=await hashPassword(b.newPassword);
  await this.auth.data.db.$transaction(async tx=>{await tx.admin.update({where:{id:admin.id},data:{passwordHash}});await tx.authSession.deleteMany({where:{adminId:admin.id}});await tx.auditEvent.create({data:{actor:admin.id,action:'ADMIN_PASSWORD_CHANGE',resource:admin.id}});});
  await this.auth.issue(res,'admin',admin.id,true);return {ok:true};
 }
 @Patch('accounts/:id')async updateAccount(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){
  origin(req);const {admin}=await this.auth.admin(req,['OWNER']);
  const b=parse(z.object({role:z.enum(['ADMIN','REVIEWER']),enabled:z.boolean()}).strict(),body);
  const target=await this.auth.data.db.admin.findUnique({where:{id}});
  if(!target||target.role==='OWNER'||target.id===admin.id)throw new ForbiddenException('Owner account cannot be changed here');
  await this.auth.data.db.$transaction(async tx=>{await tx.admin.update({where:{id},data:b});await tx.authSession.deleteMany({where:{adminId:id}});await tx.auditEvent.create({data:{actor:admin.id,action:'ADMIN_ROLE_UPDATE',resource:id}});});return {ok:true};
 }
 @Get('accounts')async accounts(@Req()req:Request){await this.auth.admin(req,['OWNER']);return this.auth.data.db.admin.findMany({select:{id:true,email:true,role:true,enabled:true,createdAt:true}});}
 @Post('accounts')async createAccount(@Body()body:unknown,@Req()req:Request){
  origin(req);const {admin}=await this.auth.admin(req,['OWNER']);
  const b=parse(z.object({email:emailSchema,password:passwordSchema,role:z.enum(['ADMIN','REVIEWER'])}).strict(),body);
  const created=await this.auth.data.db.admin.create({data:{email:b.email,passwordHash:await hashPassword(b.password),role:b.role}});
  await this.auth.data.audit(admin.id,'ADMIN_ACCOUNT_CREATE',created.id);return {id:created.id,email:created.email,role:created.role};
 }
}
