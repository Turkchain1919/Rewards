import {createHmac,timingSafeEqual,verify} from 'node:crypto';
import {SocialApiFailure} from './social-http';
export type WebhookHeaders=Record<string,string|string[]|undefined>;
export function header(headers:WebhookHeaders,name:string){const value=headers[name.toLowerCase()];return typeof value==='string'?value:'';}
function match(a:string,b:string){const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right);}
export function verifySocialWebhook(platform:string,headers:WebhookHeaders,raw:Buffer,secret:string,publicKey='',now=Date.now()){
 if(!raw.length||raw.length>65536)throw new SocialApiFailure('WEBHOOK_BODY_LIMIT');
 if(platform==='TELEGRAM'){
  if(!/^[A-Za-z0-9_-]{1,256}$/.test(secret)||!match(header(headers,'x-telegram-bot-api-secret-token'),secret))throw new SocialApiFailure('WEBHOOK_SIGNATURE_INVALID');
  return;
 }
 if(platform==='TWITCH'||platform==='KICK'){
  const prefix=platform==='TWITCH'?'twitch-eventsub-':'kick-event-',id=header(headers,prefix+'message-id'),stamp=header(headers,prefix+'message-timestamp'),timestamp=Date.parse(stamp);
  if(!/^[A-Za-z0-9_.:-]{1,200}$/.test(id)||!Number.isFinite(timestamp)||timestamp>now+60000||timestamp<now-600000)throw new SocialApiFailure('WEBHOOK_TIMESTAMP_INVALID');
  if(platform==='TWITCH'){
   if(secret.length<10||secret.length>100)throw new SocialApiFailure('WEBHOOK_SECRET_REQUIRED');
   const expected='sha256='+createHmac('sha256',secret).update(id+stamp).update(raw).digest('hex');if(!match(expected,header(headers,'twitch-eventsub-message-signature')))throw new SocialApiFailure('WEBHOOK_SIGNATURE_INVALID');
  }else{
   const signature=header(headers,'kick-event-signature');if(!publicKey||signature.length>2048)throw new SocialApiFailure('WEBHOOK_SIGNATURE_INVALID');
   let valid=false;try{valid=verify('RSA-SHA256',Buffer.concat([Buffer.from(id+'.'+stamp+'.'),raw]),publicKey,Buffer.from(signature,'base64'));}catch{valid=false;}if(!valid)throw new SocialApiFailure('WEBHOOK_SIGNATURE_INVALID');
  }
  return;
 }
 if(platform==='FACEBOOK'||platform==='INSTAGRAM'){
  if(!secret)throw new SocialApiFailure('WEBHOOK_SECRET_REQUIRED');const expected='sha256='+createHmac('sha256',secret).update(raw).digest('hex');if(!match(expected,header(headers,'x-hub-signature-256')))throw new SocialApiFailure('WEBHOOK_SIGNATURE_INVALID');return;
 }
 throw new SocialApiFailure('WEBHOOK_NOT_SUPPORTED');
}
