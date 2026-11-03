import {createPublicKey} from 'node:crypto';
import {SocialApiFailure} from './social-http';
let cached:{key:string;fetchedAt:number}|null=null;
export function parseKickPublicKey(raw:string){
 if(raw.length>16000)throw new SocialApiFailure('KICK_PUBLIC_KEY_INVALID');let key=raw.trim();
 if(!key.startsWith('-----BEGIN PUBLIC KEY-----')){try{const value=JSON.parse(raw);key=value?.data?.public_key||value?.public_key||'';}catch{throw new SocialApiFailure('KICK_PUBLIC_KEY_INVALID');}}
 try{if(typeof key!=='string'||createPublicKey(key).asymmetricKeyType!=='rsa')throw new Error();}catch{throw new SocialApiFailure('KICK_PUBLIC_KEY_INVALID');}return key;
}
export async function currentKickPublicKey(fetcher:typeof fetch=fetch,refresh=false){
 const now=Date.now();if(cached&&(now-cached.fetchedAt<300000&&(!refresh||now-cached.fetchedAt<60000)))return cached.key;
 let response:Response;try{response=await fetcher('https://api.kick.com/public/v1/public-key',{redirect:'error',signal:AbortSignal.timeout(8000)});}catch{throw new SocialApiFailure('KICK_PUBLIC_KEY_UNAVAILABLE');}
 if(!response.ok)throw new SocialApiFailure('KICK_PUBLIC_KEY_UNAVAILABLE');const key=parseKickPublicKey(await response.text());cached={key,fetchedAt:now};return key;
}
