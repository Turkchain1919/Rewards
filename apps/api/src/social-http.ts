export class SocialApiFailure extends Error{constructor(readonly code:string,readonly retryAfter=0){super(code);}}
const allowedHosts=new Set(['api.x.com','www.googleapis.com','graph.instagram.com','graph.facebook.com','api.kick.com','api.twitch.tv','id.twitch.tv','open.tiktokapis.com','api.telegram.org']);
export async function socialRequest(url:string,init:RequestInit={},fetcher:typeof fetch=fetch){
 const u=new URL(url);if(u.protocol!=='https:'||!allowedHosts.has(u.hostname)||u.port&&u.port!=='443'||u.username||u.password)throw new SocialApiFailure('UNSAFE_PROVIDER_ENDPOINT');
 for(let attempt=0;attempt<3;attempt++){
  let response:Response;try{response=await fetcher(url,{...init,redirect:'error',signal:AbortSignal.timeout(8000)});}catch{throw new SocialApiFailure('API_UNAVAILABLE');}
  if(response.status===429){const after=response.headers.get('Retry-After')||'',reset=Number(response.headers.get('Ratelimit-Reset')),resetSeconds=reset>Date.now()/1000?Math.ceil(reset-Date.now()/1000):0,seconds=Number(after)||Math.max(0,Math.ceil((Date.parse(after)-Date.now())/1000))||resetSeconds||60;throw new SocialApiFailure('RATE_LIMITED',Math.min(3600,Math.max(1,seconds)));}
  if(response.status>=500&&attempt<2){await new Promise(resolve=>setTimeout(resolve,100*2**attempt));continue;}
  if(!response.ok)throw new SocialApiFailure(response.status===401?'REAUTH_REQUIRED':response.status===403?'PERMISSION_REQUIRED':'PROVIDER_REQUEST_FAILED');
  const raw=await response.text();if(raw.length>1000000)throw new SocialApiFailure('PROVIDER_RESPONSE_TOO_LARGE');
  let value:unknown;try{value=raw?JSON.parse(raw):{};}catch{throw new SocialApiFailure('INVALID_PROVIDER_RESPONSE');}
  if(!value||typeof value!=='object')throw new SocialApiFailure('INVALID_PROVIDER_RESPONSE');return value as Record<string,unknown>;
 }
 throw new SocialApiFailure('API_UNAVAILABLE');
}
