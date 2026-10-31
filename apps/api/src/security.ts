import {createCipheriv,createDecipheriv,randomBytes,scrypt,timingSafeEqual,createHash} from 'node:crypto';
import {BadRequestException,ForbiddenException} from '@nestjs/common';
import {z} from 'zod';
import type {Request,Response} from 'express';
const derive=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N:131072,r:8,p:1,maxmem:256*1024*1024},(error,key)=>error?reject(error):resolve(key)));
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
export function equal(a:string,b:string){const x=Buffer.from(digest(a)),y=Buffer.from(digest(b));return timingSafeEqual(x,y);}
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const key=await derive(password,salt);return 'scrypt131072:'+salt+':'+key.toString('hex');}
export async function verifyPassword(password:string,stored:string){const [version,salt,hash]=stored.split(':');if(version!=='scrypt131072'||!salt||!hash)return false;const key=await derive(password,salt);const expected=Buffer.from(hash,'hex');return key.length===expected.length&&timingSafeEqual(key,expected);}
export function encrypt(value:string){
 const key=Buffer.from(process.env.DATA_ENCRYPTION_KEY || '','hex');if(key.length!==32)throw new Error('Encryption configuration missing');
 const iv=randomBytes(12);const c=createCipheriv('aes-256-gcm',key,iv);c.setAAD(Buffer.from(process.env.APP_ENV!));
 return Buffer.concat([iv,c.update(value,'utf8'),c.final(),c.getAuthTag()]).toString('base64');
}
export function decrypt(value:string){
 const data=Buffer.from(value,'base64');const key=Buffer.from(process.env.DATA_ENCRYPTION_KEY || '','hex');
 const c=createDecipheriv('aes-256-gcm',key,data.subarray(0,12));c.setAAD(Buffer.from(process.env.APP_ENV!));c.setAuthTag(data.subarray(-16));
 return Buffer.concat([c.update(data.subarray(12,-16)),c.final()]).toString('utf8');
}
export function parse<T extends z.ZodType>(schema:T,body:unknown):z.infer<T>{const result=schema.safeParse(body);if(!result.success)throw new BadRequestException('Invalid request fields');return result.data;}
export function origin(req:Request){if(req.headers.origin!==new URL(process.env.APP_URL!).origin)throw new ForbiddenException('Origin rejected');}
export function cookieName(kind:string){return 'rewards_'+process.env.APP_ENV+'_'+kind;}
export function readCookie(req:Request,kind:string){const name=cookieName(kind)+'=';return (req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name))?.slice(name.length)||'';}
export function cookie(res:Response,kind:string,value:string,maxAge:number){res.cookie(cookieName(kind),value,{httpOnly:true,secure:process.env.APP_ENV==='production',sameSite:kind==='oauth'?'lax':'strict',path:'/',maxAge});}
export const passwordSchema=z.string().min(14).max(128);
export const emailSchema=z.string().email().max(254).transform(x=>x.trim().toLowerCase());
