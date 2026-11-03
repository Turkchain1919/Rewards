import {socialTaskCatalog,catalogTask,RewardPlatform} from './social-catalog';
import {parseSocialTarget,ParsedSocialTarget} from './social-targets';
import {socialRequest,SocialApiFailure} from './social-http';
import {configuration,authorizationUrl,Platform,ProviderOverride} from './providers';
import {refreshOAuth,revokeOAuth} from './oauth-lifecycle';
import {verifySocialWebhook,WebhookHeaders} from './social-webhook-signatures';
type Json=Record<string,unknown>;
export type AdapterContext={accountId:string;accountType?:string;username:string;profileUrl:string;token:string;clientId:string;graphVersion:string;scopes:string[]};
export type TargetValidation=ParsedSocialTarget&{ownershipVerified:boolean;title:string;ownerAccountId:string|null;status:string};
export interface SocialAdapter{
 platform:RewardPlatform;
 connectAccount(state:string,verifier:string,nonce:string,override:ProviderOverride):string;
 disconnectAccount:typeof revokeOAuth;
 refreshCredentials:typeof refreshOAuth;
 getSupportedTasks():typeof socialTaskCatalog;
 checkPermissions(code:string,scopes:string[]):{allowed:boolean;missing:string[]};
 validateTarget(url:string,context:AdapterContext,fetcher?:typeof fetch):Promise<TargetValidation>;
 processWebhook(headers:WebhookHeaders,raw:Buffer,secret:string,publicKey?:string):void;
 verifyTask(code:string,verifiedProof:()=>Promise<unknown>):Promise<unknown>;
}
const array=(v:unknown)=>Array.isArray(v)?v as Json[]:[];
function string(v:unknown){return typeof v==='string'?v:typeof v==='number'&&Number.isSafeInteger(v)?String(v):'';}
function normalize(url:string){try{const u=new URL(url);u.search='';u.hash='';return u.toString().replace(/\/$/,'').toLowerCase();}catch{return '';}}
function makeAdapter(platform:RewardPlatform):SocialAdapter{return {
 platform,processWebhook:(headers,raw,secret,publicKey='')=>verifySocialWebhook(platform,headers,raw,secret,publicKey),connectAccount:(state,verifier,nonce,override)=>authorizationUrl(platform as Platform,state,verifier,nonce,override),disconnectAccount:revokeOAuth,refreshCredentials:refreshOAuth,
 getSupportedTasks:()=>socialTaskCatalog.filter(t=>t.platform===platform),
 checkPermissions:(code,scopes)=>{const row=catalogTask(code);const missing=row?.platform===platform?row.requiredScopes.filter(s=>!scopes.includes(s)):['INVALID_TASK'];return {allowed:missing.length===0,missing};},
 verifyTask:async(code,verifiedProof)=>{const row=catalogTask(code);if(!row||row.platform!==platform||!row.rewardEnabled||!row.implemented||row.policyStatus!=='ALLOWED')throw new SocialApiFailure('REWARD_POLICY_OR_VERIFIER_BLOCKED');return verifiedProof();},
 async validateTarget(url,context,fetcher=fetch){
  const target=parseSocialTarget(url,platform);if(!context.token)throw new SocialApiFailure('NOT_CONFIGURED');
  const get=(endpoint:string)=>socialRequest(endpoint,{headers:{Authorization:'Bearer '+context.token,...(platform==='TWITCH'?{'Client-Id':context.clientId}:{})}},fetcher);
  let owner='',title=target.objectId;
  if(platform==='X'){
   const endpoint=target.objectType==='POST'?'https://api.x.com/2/tweets/'+encodeURIComponent(target.objectId)+'?tweet.fields=author_id':'https://api.x.com/2/users/by/username/'+encodeURIComponent(target.objectId.replace(/^@/,''));
   const response=await get(endpoint),data=response.data as Json|undefined;owner=string(target.objectType==='POST'?data?.author_id:data?.id);title=string(data?.text||data?.name)||title;
  }else if(platform==='YOUTUBE'){
   const query=target.objectType==='VIDEO'?'videos?part=snippet&id='+encodeURIComponent(target.objectId):'channels?part=snippet&'+(target.objectId.startsWith('@')?'forHandle=':'id=')+encodeURIComponent(target.objectId);
   const response=await get('https://www.googleapis.com/youtube/v3/'+query),data=array(response.items)[0];owner=string(target.objectType==='VIDEO'?(data?.snippet as Json)?.channelId:data?.id);title=string((data?.snippet as Json)?.title)||title;
  }else if(platform==='TELEGRAM'){
   const response=await socialRequest('https://api.telegram.org/bot'+context.token+(context.accountType==='BOT'?'/getMe':'/getChat?chat_id='+encodeURIComponent(context.accountId)),{},fetcher);if(response.ok!==true)throw new SocialApiFailure('TELEGRAM_TARGET_UNAVAILABLE');const data=response.result as Json|undefined;owner=string(data?.id);title=string(data?.title||data?.username)||title;
   const expected=string(data?.username).replace(/^@/,'').toLowerCase();if(target.handle?.toLowerCase()!==expected&&normalize(url)!==normalize(string(data?.invite_link)))owner='';
  }else if(platform==='INSTAGRAM'){
   if(!/^v[0-9]+\.[0-9]+$/.test(context.graphVersion))throw new SocialApiFailure('GRAPH_VERSION_REQUIRED');
   if(target.objectType==='PROFILE') {const response=await get('https://graph.instagram.com/'+context.graphVersion+'/me?fields=user_id,username');if(string(response.username).toLowerCase()===target.objectId.toLowerCase())owner=string(response.user_id||response.id);}
   else {let after='';for(let page=0;page<3;page++){const response=await get('https://graph.instagram.com/'+context.graphVersion+'/'+encodeURIComponent(context.accountId)+'/media?fields=id,caption,permalink&limit=100'+(after?'&after='+encodeURIComponent(after):''));const match=array(response.data).find(d=>normalize(string(d.permalink))===normalize(url));if(match){owner=context.accountId;title=string(match.caption)||title;target.objectId=string(match.id);break;}after=string(((response.paging as Json)?.cursors as Json)?.after);if(!after)break;}}
  }else if(platform==='FACEBOOK'){
   if(!/^v[0-9]+\.[0-9]+$/.test(context.graphVersion))throw new SocialApiFailure('GRAPH_VERSION_REQUIRED');
   const response=await get('https://graph.facebook.com/'+context.graphVersion+'/'+encodeURIComponent(target.objectId)+'?fields=id,'+(target.objectType==='PAGE'?'name':'from,message'));
   owner=string(target.objectType==='PAGE'?response.id:(response.from as Json)?.id);title=string(response.name||response.message)||title;
  }else if(platform==='TWITCH'){
   if(!context.clientId)throw new SocialApiFailure('NOT_CONFIGURED');
   const response=await get(target.objectType==='VIDEO'?'https://api.twitch.tv/helix/videos?id='+encodeURIComponent(target.objectId):'https://api.twitch.tv/helix/users?login='+encodeURIComponent(target.objectId));const data=array(response.data)[0];owner=string(target.objectType==='VIDEO'?data?.user_id:data?.id);title=string(data?.title||data?.display_name)||title;
  }else if(platform==='KICK'){
   const response=await get('https://api.kick.com/public/v1/channels?slug='+encodeURIComponent(target.objectId));const data=array(response.data)[0];owner=string(data?.broadcaster_user_id||data?.user_id);title=string(data?.slug)||title;
  }else if(platform==='TIKTOK'){
   if(target.objectType==='VIDEO'){const response=await socialRequest('https://open.tiktokapis.com/v2/video/query/?fields=id,title,share_url',{method:'POST',headers:{Authorization:'Bearer '+context.token,'Content-Type':'application/json'},body:JSON.stringify({filters:{video_ids:[target.objectId]}})},fetcher);const video=array((response.data as Json)?.videos).find(v=>string(v.id)===target.objectId);if(video){owner=context.accountId;title=string(video.title)||title;}}
   else {const response=await get('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username');const user=(response.data as Json)?.user as Json;if(string(user?.username).toLowerCase()===target.objectId.toLowerCase())owner=string(user?.open_id);}
  }
  const ownershipVerified=!!owner&&owner===context.accountId;
  return {...target,ownerAccountId:owner||null,title:title.slice(0,300),ownershipVerified,status:ownershipVerified?'VERIFIED_SUPPORTED':'SUPPORTED_REQUIRES_PERMISSION'};
 }
};}
export const socialAdapters=Object.fromEntries((['X','YOUTUBE','INSTAGRAM','TELEGRAM','FACEBOOK','KICK','TWITCH','TIKTOK'] as const).map(p=>[p,makeAdapter(p)])) as Record<RewardPlatform,SocialAdapter>;
export function minimumProviderConfiguration(platform:RewardPlatform,override:ProviderOverride){return configuration(platform,override);}
