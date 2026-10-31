import {Injectable,ConflictException,Controller,Post,Param,Req,ServiceUnavailableException} from '@nestjs/common';
import type {Request} from 'express';
import {randomBytes} from 'node:crypto';
import {DataService} from './data';
import {SecretStore} from './configuration';
import {IntegrationSettings} from './integration-settings';
import {configuration,Platform,ProviderOverride,socialPlatforms} from './providers';
import {AuthService} from './auth';
import {origin,parse,encrypt,decrypt} from './security';
import {z} from 'zod';
type Tokens={accessToken:string;refreshToken?:string;expiresAt:number};
export class OAuthFailure extends Error{constructor(readonly reason:string,readonly retryAfter=0){super(reason);}}
async function request(fetcher:typeof fetch,url:string,init:RequestInit={}){
 const r=await fetcher(url,{...init,signal:AbortSignal.timeout(10000),redirect:'error'});
 if(r.status===429)throw new OAuthFailure('RATE_LIMITED',Math.max(30,Math.min(3600,Number(r.headers.get('Retry-After'))||60)));
 if(!r.ok)throw new OAuthFailure(r.status===401||r.status===403?'REAUTH_REQUIRED':'PROVIDER_ERROR');
 const text=await r.text();if(text.length>1000000)throw new OAuthFailure('INVALID_RESPONSE');
 return text?JSON.parse(text):{};
}
export async function refreshOAuth(platform:Platform,tokens:Tokens,priorScopes:string[],expected:string,accountType:string,override:ProviderOverride,fetcher:typeof fetch=fetch){
 if(!['X','YOUTUBE','TIKTOK','DISCORD','GITHUB'].includes(platform)||!tokens.refreshToken)throw new OAuthFailure('REAUTH_REQUIRED');
 const c=configuration(platform,override);if(!c.ready)throw new OAuthFailure('PROVIDER_DISABLED');
 const form=new URLSearchParams({grant_type:'refresh_token',refresh_token:tokens.refreshToken});
 form.set(platform==='TIKTOK'?'client_key':'client_id',c.clientId);
 const headers:Record<string,string>={'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'};
 if(platform==='X')headers.Authorization='Basic '+Buffer.from(c.clientId+':'+c.clientSecret).toString('base64');else form.set('client_secret',c.clientSecret);
 const result=await request(fetcher,c.definition.token,{method:'POST',headers,body:form}) as Record<string,unknown>;
 if(typeof result.access_token!=='string'||!result.access_token)throw new OAuthFailure('INVALID_RESPONSE');
 const accessToken=result.access_token,scopes=typeof result.scope==='string'?result.scope.split(/[ ,]+/).filter(Boolean):priorScopes;
 if(!c.definition.scopes.every(scope=>scopes.includes(scope)))throw new OAuthFailure('PERMISSION_REQUIRED');
 const read=(url:string)=>request(fetcher,url,{headers:{Authorization:'Bearer '+accessToken,Accept:'application/json','User-Agent':'Social-Rewards'}});
 let matches=false;
 if(platform==='X'){const p=await read('https://api.x.com/2/users/me');matches=String(p.data?.id)===expected;}
 else if(platform==='YOUTUBE'){const p=await read('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&maxResults=50');matches=Array.isArray(p.items)&&p.items.some((v:Record<string,unknown>)=>v.id===expected);}
 else if(platform==='TIKTOK'){const p=await read('https://open.tiktokapis.com/v2/user/info/?fields=open_id');matches=p.data?.user?.open_id===expected;}
 else if(platform==='DISCORD'&&accountType==='GUILD'){const p=await read('https://discord.com/api/v10/users/@me/guilds');matches=Array.isArray(p)&&p.some((v:Record<string,unknown>)=>v.id===expected&&(v.owner||!!(BigInt(String(v.permissions||'0'))&40n)));}
 else if(platform==='DISCORD'){const p=await read('https://discord.com/api/v10/users/@me');matches=p.id===expected;}
 else if(accountType==='ORGANIZATION'){const p=await read('https://api.github.com/user/memberships/orgs/'+encodeURIComponent(expected));matches=p.state==='active'&&p.role==='admin';}
 else if(accountType==='REPOSITORY'){if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(expected))throw new OAuthFailure('ACCOUNT_MISMATCH');const p=await read('https://api.github.com/repos/'+expected);matches=p.permissions?.admin===true;}
 else {const p=await read('https://api.github.com/user');matches=String(p.id)===expected;}
 if(!matches)throw new OAuthFailure('ACCOUNT_MISMATCH');
 const expires=Number(result.expires_in);
 return {tokens:{accessToken,refreshToken:typeof result.refresh_token==='string'?result.refresh_token:tokens.refreshToken,expiresAt:Date.now()+(Number.isFinite(expires)&&expires>0?Math.min(expires,86400):3600)*1000},scopes};
}
export async function revokeOAuth(platform:Platform,tokens:Tokens,override:ProviderOverride,fetcher:typeof fetch=fetch){
 const c=configuration(platform,override);if(!c.clientId||!c.clientSecret)return {revoked:false,reason:'CLIENT_CREDENTIALS_MISSING'};
 let endpoint='',method='POST',body:BodyInit;
 const headers:Record<string,string>={'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'};
 if(platform==='X'){endpoint='https://api.x.com/2/oauth2/revoke';headers.Authorization='Basic '+Buffer.from(c.clientId+':'+c.clientSecret).toString('base64');body=new URLSearchParams({token:tokens.accessToken,client_id:c.clientId,token_type_hint:'access_token'});}
 else if(platform==='YOUTUBE'){endpoint='https://oauth2.googleapis.com/revoke';body=new URLSearchParams({token:tokens.refreshToken||tokens.accessToken});}
 else if(platform==='DISCORD'){endpoint='https://discord.com/api/oauth2/token/revoke';body=new URLSearchParams({token:tokens.accessToken,client_id:c.clientId,client_secret:c.clientSecret,token_type_hint:'access_token'});}
 else if(platform==='TIKTOK'){endpoint='https://open.tiktokapis.com/v2/oauth/revoke/';body=new URLSearchParams({client_key:c.clientId,client_secret:c.clientSecret,token:tokens.accessToken});}
 else if(platform==='GITHUB'){endpoint='https://api.github.com/applications/'+encodeURIComponent(c.clientId)+'/token';method='DELETE';headers.Authorization='Basic '+Buffer.from(c.clientId+':'+c.clientSecret).toString('base64');headers['Content-Type']='application/json';body=JSON.stringify({access_token:tokens.accessToken});}
 else return {revoked:false,reason:'PROVIDER_MANUAL_REVOCATION_REQUIRED'};
 try{const result=await request(fetcher,endpoint,{method,headers,body});if(platform==='X'&&result.revoked!==true)return {revoked:false,reason:'PROVIDER_REVOCATION_PENDING'};if(result.error&&result.error.code!=='ok')return {revoked:false,reason:'PROVIDER_REVOCATION_PENDING'};return {revoked:true};}catch{return {revoked:false,reason:'PROVIDER_REVOCATION_PENDING'};}
}
@Injectable()
export class OAuthLifecycle {
 constructor(readonly data:DataService,readonly secrets:SecretStore,readonly settings:IntegrationSettings){}
 async personal(userId:string,platform:Platform){
  const account=await this.data.db.socialAccount.findUnique({where:{userId_provider:{userId,provider:platform}}});
  if(!account?.credentialId)throw new ConflictException('Reconnect account');
  return this.refresh(account.credentialId,platform,account.providerAccountId,'PROFILE',account.scopes,userId,account.id);
 }
 async refresh(credentialId:string,platform:Platform,expected:string,type:string,scopes:string[],actor:string,personalId?:string,officialId?:string){
  const lock='oauth-refresh:'+credentialId,lease=randomBytes(16).toString('hex');
  if(await this.data.redis.exists('oauth-cooldown:'+platform))throw new ServiceUnavailableException('RATE_LIMITED');
  if(!await this.data.redis.set(lock,lease,'EX',30,'NX'))throw new ConflictException('Refresh already running');
  try{
   const record=await this.data.db.credential.findUniqueOrThrow({where:{id:credentialId}});
   if(!record.ciphertext||record.revokedAt)throw new ConflictException('Credential revoked');
   const token=JSON.parse(decrypt(record.ciphertext)) as Tokens;
   const result=await refreshOAuth(platform,token,scopes,expected,type,await this.settings.runtime(platform,officialId?'official':'user'));
   await this.data.db.$transaction(async tx=>{
    const updated=await tx.credential.updateMany({where:{id:credentialId,version:record.version,revokedAt:null},data:{ciphertext:encrypt(JSON.stringify(result.tokens)),version:{increment:1}}});
    if(updated.count!==1)throw new ConflictException('Credential changed');
    if(personalId){const a=await tx.socialAccount.updateMany({where:{id:personalId,credentialId},data:{expiresAt:new Date(result.tokens.expiresAt),lastRefreshAt:new Date(),lastError:null,scopes:result.scopes}});if(a.count!==1)throw new ConflictException('Account disconnected');}
    if(officialId){const a=await tx.officialSocialAccount.updateMany({where:{id:officialId,credentialId,deletedAt:null},data:{lastSuccessAt:new Date(),lastError:null}});if(a.count!==1)throw new ConflictException('Account disconnected');}
    await tx.auditEvent.create({data:{actor,action:'OAUTH_TOKEN_REFRESH',resource:platform}});
   });return {ok:true,expiresAt:result.tokens.expiresAt};
  }catch(e){
   const reason=e instanceof OAuthFailure?e.reason:'REFRESH_REJECTED';
   if(personalId)await this.data.db.socialAccount.updateMany({where:{id:personalId,credentialId},data:{lastError:reason}});
   if(officialId)await this.data.db.officialSocialAccount.updateMany({where:{id:officialId,credentialId},data:{lastError:reason}});
   if(e instanceof OAuthFailure&&e.retryAfter)await this.data.redis.set('oauth-cooldown:'+platform,'1','EX',e.retryAfter);
   throw new ServiceUnavailableException(reason);
  }finally{await this.data.redis.eval("if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) else return 0 end",1,lock,lease);}
 }
}
@Controller('api/social')
export class OAuthLifecycleController {
 constructor(readonly auth:AuthService,readonly lifecycle:OAuthLifecycle){}
 @Post(':provider/refresh')async refresh(@Param('provider')name:string,@Req()req:Request){origin(req);const user=await this.auth.user(req);await this.auth.limit(req,'refresh:'+user.id,10);return this.lifecycle.personal(user.id,parse(z.enum(socialPlatforms),name.toUpperCase()));}
}
