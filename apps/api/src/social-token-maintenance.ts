import {PrismaClient} from '@prisma/client';
import type Redis from 'ioredis';
import {decrypt} from './security';
export async function validateTwitchConnections(db:PrismaClient,redis:Redis,fetcher:typeof fetch=fetch){
 const setting=await db.integrationSetting.findUnique({where:{platform:'TWITCH'}});if(setting?.disabled||!(setting?.enabledOverride??(process.env.TWITCH_ENABLED==='true')))return {checked:0,reauthRequired:0};
 const app=await db.credential.findUnique({where:{scope_ownerId_kind:{scope:'SOCIAL_PLATFORM',ownerId:'TWITCH',kind:'OAUTH_CONFIG'}}});let clientId=process.env.TWITCH_CLIENT_ID||'';if(app?.ciphertext&&!app.revokedAt)try{clientId=JSON.parse(decrypt(app.ciphertext)).clientId||clientId;}catch{return {checked:0,reauthRequired:0};}if(!clientId)return {checked:0,reauthRequired:0};
 let checked=0,reauthRequired=0;
 for(const kind of ['personal','official'] as const){let cursor:string|undefined;for(;;){
  const rows=kind==='personal'?await db.socialAccount.findMany({where:{provider:'TWITCH',credentialId:{not:null}},include:{credential:true},orderBy:{id:'asc'},take:50,...(cursor?{cursor:{id:cursor},skip:1}:{})}):await db.officialSocialAccount.findMany({where:{platform:'TWITCH',deletedAt:null,credentialId:{not:null},connectionStatus:'CONNECTED'},include:{credential:true},orderBy:{id:'asc'},take:50,...(cursor?{cursor:{id:cursor},skip:1}:{})});
  if(!rows.length)break;
  for(let offset=0;offset<rows.length;offset+=5)await Promise.all(rows.slice(offset,offset+5).map(async account=>{
   const credential=account.credential;if(!credential?.ciphertext||credential.revokedAt||!await redis.set('social-token-check:'+credential.id,'1','EX',3300,'NX'))return;
   let invalid=false,unavailable=false;const expected='providerAccountId'in account?account.providerAccountId:account.accountId;
   try{const token=JSON.parse(decrypt(credential.ciphertext));const response=await fetcher('https://id.twitch.tv/oauth2/validate',{headers:{Authorization:'OAuth '+token.accessToken},redirect:'error',signal:AbortSignal.timeout(5000)});if(response.status===401||response.status===403)invalid=true;else if(!response.ok)unavailable=true;else{const raw=await response.text();if(raw.length>65536)unavailable=true;else{const value=JSON.parse(raw);invalid=value.client_id!==clientId||value.user_id!==expected;}}}catch{unavailable=true;}
   checked++;if(unavailable){await redis.expire('social-token-check:'+credential.id,300);return;}
   await db.$transaction(async tx=>{const fresh=await tx.credential.findUnique({where:{id:credential.id}});if(!fresh||fresh.revokedAt||fresh.version!==credential.version)return;if(kind==='personal'){await tx.socialAccount.updateMany({where:{id:account.id,credentialId:credential.id},data:{lastError:invalid?'REAUTH_REQUIRED':null}});}else{await tx.officialSocialAccount.updateMany({where:{id:account.id,credentialId:credential.id,deletedAt:null},data:invalid?{connectionStatus:'REAUTH_REQUIRED',lastError:'REAUTH_REQUIRED',version:{increment:1}}:{lastError:null,lastSuccessAt:new Date()}});if(invalid)await tx.task.updateMany({where:{officialAccountId:account.id},data:{enabled:false,configurationRequired:true}});}if(invalid)await tx.auditEvent.create({data:{actor:'system:social-oauth',action:'SOCIAL_TOKEN_REAUTH_REQUIRED',resource:account.id}});});if(invalid)reauthRequired++;
  }));
  cursor=rows.at(-1)!.id;if(rows.length<50)break;
 }}return {checked,reauthRequired};
}
