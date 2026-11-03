import {createHash,createHmac} from 'node:crypto';
import {createRemoteJWKSet,jwtVerify} from 'jose';
import {credentials} from './social-config';
export const socialPlatforms=['X','TELEGRAM','FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK','KICK','TWITCH','DISCORD','GITHUB'] as const;
export type Platform=typeof socialPlatforms[number];
type Definition={authorize:string;token:string;scopes:string[];pkce:boolean};
const definitions:Record<Platform,Definition>={
 X:{authorize:'https://x.com/i/oauth2/authorize',token:'https://api.x.com/2/oauth2/token',scopes:['tweet.read','users.read','offline.access'],pkce:true},
 TELEGRAM:{authorize:'https://oauth.telegram.org/auth',token:'https://oauth.telegram.org/token',scopes:['openid','profile'],pkce:true},
 FACEBOOK:{authorize:'https://www.facebook.com/VERSION/dialog/oauth',token:'https://graph.facebook.com/VERSION/oauth/access_token',scopes:['public_profile'],pkce:false},
 INSTAGRAM:{authorize:'https://www.instagram.com/oauth/authorize',token:'https://api.instagram.com/oauth/access_token',scopes:['instagram_business_basic'],pkce:false},
 YOUTUBE:{authorize:'https://accounts.google.com/o/oauth2/v2/auth',token:'https://oauth2.googleapis.com/token',scopes:['https://www.googleapis.com/auth/youtube.readonly'],pkce:true},
 KICK:{authorize:'https://id.kick.com/oauth/authorize',token:'https://id.kick.com/oauth/token',scopes:['user:read'],pkce:true},
 TWITCH:{authorize:'https://id.twitch.tv/oauth2/authorize',token:'https://id.twitch.tv/oauth2/token',scopes:[],pkce:false},
 DISCORD:{authorize:'https://discord.com/oauth2/authorize',token:'https://discord.com/api/oauth2/token',scopes:['identify','guilds'],pkce:true},
 GITHUB:{authorize:'https://github.com/login/oauth/authorize',token:'https://github.com/login/oauth/access_token',scopes:['read:user','read:org'],pkce:true},
 TIKTOK:{authorize:'https://www.tiktok.com/v2/auth/authorize/',token:'https://open.tiktokapis.com/v2/oauth/token/',scopes:['user.info.basic'],pkce:false}
};
export type ProviderOverride={clientId?:string;clientSecret?:string;callback?:string;enabled?:boolean;graphVersion?:string;purpose?:'user'|'official';scopes?:string[]};
export function configuration(platform:Platform,override:ProviderOverride={}){
 const aliases={...credentials(platform),...override},missing:string[]=[];
 if(!aliases.clientId)missing.push(aliases.clientField);
 if(!aliases.clientSecret)missing.push(aliases.secretField);
 const version=override.graphVersion||process.env.META_GRAPH_VERSION||'';
 if(['FACEBOOK','INSTAGRAM'].includes(platform)&&!/^v[0-9]+\.[0-9]+$/.test(version))missing.push('META_GRAPH_VERSION');
 const expected=process.env.APP_URL+'/api/oauth/'+platform.toLowerCase()+'/callback';
 const redirect=aliases.callback||expected;
 const legacy=process.env.APP_URL+'/api/social/'+platform.toLowerCase()+'/callback';
 if(redirect!==expected&&redirect!==legacy)missing.push(aliases.callbackField+'_MATCH');
 return {platform,clientId:aliases.clientId,clientSecret:aliases.clientSecret,redirect,definition:{...definitions[platform],scopes:[...new Set([...definitions[platform].scopes,...(override.scopes||[]),...(override.purpose==='official'&&platform==='FACEBOOK'?['pages_show_list','pages_read_engagement']:[])])]},version,purpose:override.purpose||'user',ready:missing.length===0&&aliases.enabled,missing,status:missing.length?'awaiting_credentials':aliases.enabled?'ready':'disabled'};
}
export function readiness(){
 return socialPlatforms.map(platform=>{const c=configuration(platform);return {platform,status:c.status,ready:c.ready,missing:c.missing,scopes:c.definition.scopes,rewardedActionsEnabled:false};});
}
export function authorizationUrl(platform:Platform,state:string,verifier:string,nonce:string,override:ProviderOverride={}){
 const c=configuration(platform,override);if(!c.ready)throw new Error('Provider unavailable');
 const url=new URL(c.definition.authorize.replace('VERSION',c.version));
 url.searchParams.set(platform==='TIKTOK'?'client_key':'client_id',c.clientId);
 url.searchParams.set('response_type','code');url.searchParams.set('redirect_uri',c.redirect);
 url.searchParams.set('scope',c.definition.scopes.join(platform==='TIKTOK'||platform==='INSTAGRAM'?',':' '));url.searchParams.set('state',state);
 if(c.definition.pkce){url.searchParams.set('code_challenge',createHash('sha256').update(verifier).digest('base64url'));url.searchParams.set('code_challenge_method','S256');}
 if(platform==='TELEGRAM')url.searchParams.set('nonce',nonce);
 if(platform==='YOUTUBE'){url.searchParams.set('access_type','offline');url.searchParams.set('prompt','consent');}
 return url.toString();
}
type Json=Record<string,unknown>;
export type TokenProfile={accountId:string;name:string;tokens:{accessToken:string;refreshToken?:string;expiresAt:number};scopes:string[];targets?:{accountId:string;name:string;accountType:string;profileUrl:string;tokens?:{accessToken:string;refreshToken?:string;expiresAt:number}}[]};
async function json(fetcher:typeof fetch,url:string,init:RequestInit={}):Promise<Json>{
 const response=await fetcher(url,{...init,redirect:'error',signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Provider request rejected');
 const text=await response.text();if(text.length>1000000)throw new Error('Provider response too large');
 const value=JSON.parse(text);if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Provider response invalid');return value;
}
function text(value:unknown):string{if(typeof value!=='string'||!value||value.length>10000)throw new Error('Provider response field invalid');return value;}
const telegramKeys=createRemoteJWKSet(new URL('https://oauth.telegram.org/.well-known/jwks.json'));
export async function telegramIdentity(idToken:string,audience:string,nonce:string,verify=jwtVerify){
 const {payload}=await verify(idToken,telegramKeys,{issuer:'https://oauth.telegram.org',audience,algorithms:['RS256','ES256'],requiredClaims:['sub','exp','iat','nonce']});
 if(payload.nonce!==nonce)throw new Error('OIDC nonce rejected');
 return {accountId:text(payload.sub),name:typeof payload.preferred_username==='string'?payload.preferred_username:typeof payload.name==='string'?payload.name:'Telegram member'};
}
export async function exchange(platform:Platform,code:string,verifier:string,nonce:string,fetcher:typeof fetch=fetch,override:ProviderOverride={}):Promise<TokenProfile>{
 const c=configuration(platform,override);if(!c.ready)throw new Error('Provider unavailable');
 const body=new URLSearchParams({grant_type:'authorization_code',code,redirect_uri:c.redirect});
 body.set(platform==='TIKTOK'?'client_key':'client_id',c.clientId);
 if(c.definition.pkce)body.set('code_verifier',verifier);
 const headers:Record<string,string>={'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'};
 if(platform==='X'||platform==='TELEGRAM')headers.Authorization='Basic '+Buffer.from(c.clientId+':'+c.clientSecret).toString('base64');
 else body.set('client_secret',c.clientSecret);
 let requestBody:BodyInit=body;
 if(platform==='INSTAGRAM'){const form=new FormData();for(const [k,v]of body)form.set(k,v);requestBody=form;delete headers['Content-Type'];}
 const token=await json(fetcher,c.definition.token.replace('VERSION',c.version),{method:'POST',headers,body:requestBody});
 const accessToken=text(token.access_token),refreshToken=typeof token.refresh_token==='string'?token.refresh_token:undefined;
 const scopes=typeof token.scope==='string'?token.scope.split(/[ ,]+/).filter(Boolean):Array.isArray(token.scope)&&token.scope.every(s=>typeof s==='string')?token.scope as string[]:c.definition.scopes;
 if((['X','TIKTOK','YOUTUBE','KICK','TWITCH'].includes(platform))&&((typeof token.scope!=='string'&&!Array.isArray(token.scope))||!c.definition.scopes.every(scope=>scopes.includes(scope))))throw new Error('Required permissions not granted');
 const get=(url:string)=>json(fetcher,url,{headers:{Authorization:'Bearer '+accessToken}});
 let accountId='',name='';let targets:TokenProfile['targets'];
 if(platform==='TELEGRAM'){const identity=await telegramIdentity(text(token.id_token),c.clientId,nonce);accountId=identity.accountId;name=identity.name;}
 else if(platform==='X'){const profile=await get('https://api.x.com/2/users/me');const user=profile.data as Json;accountId=text(user?.id);name=text(user?.username||user?.name);}
 else if(platform==='YOUTUBE'){const profile=await get('https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true&maxResults=1');const channel=(profile.items as Json[]|undefined)?.[0];accountId=text(channel?.id);name=text((channel?.snippet as Json|undefined)?.title);}
 else if(platform==='TIKTOK'){const profile=await get('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name');const user=(profile.data as Json|undefined)?.user as Json|undefined;accountId=text(user?.open_id);name=text(user?.display_name);}
 else if(platform==='KICK'){const profile=await get('https://api.kick.com/public/v1/users');const user=(profile.data as Json[]|undefined)?.[0];const id=user?.user_id||user?.id;if(typeof id!=='string'&&!(typeof id==='number'&&Number.isSafeInteger(id)))throw new Error('Kick identity invalid');accountId=String(id);name=text(user?.name||user?.username);}
 else if(platform==='TWITCH'){const validation=await json(fetcher,'https://id.twitch.tv/oauth2/validate',{headers:{Authorization:'OAuth '+accessToken}});if(validation.client_id!==c.clientId)throw new Error('Twitch token client mismatch');const profile=await json(fetcher,'https://api.twitch.tv/helix/users',{headers:{Authorization:'Bearer '+accessToken,'Client-Id':c.clientId}});const user=(profile.data as Json[]|undefined)?.[0];accountId=text(user?.id);name=text(user?.login||user?.display_name);if(validation.user_id!==accountId)throw new Error('Twitch identity mismatch');}
 else if(platform==='DISCORD'){const profile=await get('https://discord.com/api/v10/users/@me');accountId=text(profile.id);name=text(profile.username);if(c.purpose==='official'){const result=await fetcher('https://discord.com/api/v10/users/@me/guilds',{headers:{Authorization:'Bearer '+accessToken},signal:AbortSignal.timeout(10000)});if(!result.ok)throw new Error('Guild permissions required');const guilds=await result.json() as {id:string;name:string;owner?:boolean;permissions?:string}[];targets=guilds.filter(g=>g.owner||!!(BigInt(g.permissions||'0')&40n)).map(g=>({accountId:g.id,name:g.name,accountType:'GUILD',profileUrl:''}));}}
 else if(platform==='GITHUB'){const profile=await get('https://api.github.com/user');accountId=String(profile.id);name=text(profile.login);}
 else if(platform==='FACEBOOK'){const proof=createHmac('sha256',c.clientSecret).update(accessToken).digest('hex');const profile=await get('https://graph.facebook.com/'+c.version+'/me?fields=id,name&appsecret_proof='+proof);accountId=text(profile.id);name=text(profile.name);if(c.purpose==='official'){const pages=await get('https://graph.facebook.com/'+c.version+'/me/accounts?fields=id,name,access_token');targets=((pages.data||[])as Json[]).map(page=>({accountId:text(page.id),name:text(page.name),accountType:'PAGE',profileUrl:'https://www.facebook.com/'+text(page.id),tokens:{accessToken:text(page.access_token),expiresAt:Date.now()+3600000}}));}}
 else {const profile=await get('https://graph.instagram.com/'+c.version+'/me?fields=user_id,username');accountId=text(profile.user_id||profile.id);name=text(profile.username);}
 if(accountId.length>200)throw new Error('Provider identity invalid');
 const expires=Number(token.expires_in);const seconds=Number.isFinite(expires)&&expires>0?Math.min(expires,86400):3600;
 return {accountId,name:name.slice(0,100),tokens:{accessToken,refreshToken,expiresAt:Date.now()+seconds*1000},scopes,targets};
}
