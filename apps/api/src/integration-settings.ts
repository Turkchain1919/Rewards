import {Injectable,ServiceUnavailableException,HttpException,ConflictException,BadRequestException} from '@nestjs/common';
import {SecretStore} from './configuration';
import {DataService} from './data';
import {OfficialPlatform,officialPlatforms,officialAccount,value} from './social-config';
import {configuration,Platform,ProviderOverride} from './providers';
import {z} from 'zod';
export const settingInput=z.object({version:z.number().int().min(0),enabledOverride:z.boolean().nullable().optional(),callbackUrl:z.string().url().max(2048).nullable().optional(),graphVersion:z.string().regex(/^v[0-9]+\.[0-9]+$/).nullable().optional(),disabled:z.boolean(),name:z.string().trim().max(100).nullable(),profileUrl:z.string().url().max(2048).nullable(),accountId:z.string().max(200).nullable(),defaultTargetUrl:z.string().url().max(2048).nullable()}).strict().refine(v=>[v.profileUrl,v.defaultTargetUrl].every(u=>!u||new URL(u).protocol==='https:'&&!new URL(u).username&&!new URL(u).password));
export class ProviderFailure extends Error{constructor(readonly reason:string,readonly retryAfter=0){super(reason);}}
async function request(url:string,headers:Record<string,string>={}){
 const r=await fetch(url,{headers,signal:AbortSignal.timeout(10000)});
 if(r.status===429)throw new ProviderFailure('RATE_LIMITED',Math.min(3600,Math.max(30,Number(r.headers.get('Retry-After'))||60)));
 if(!r.ok)throw new ProviderFailure('HTTP_'+r.status);
 const raw=await r.text();if(raw.length>1000000)throw new ProviderFailure('INVALID_RESPONSE');
 const obj=JSON.parse(raw) as Record<string,unknown>;if(!obj||typeof obj!=='object')throw new ProviderFailure('INVALID_RESPONSE');return obj;
}
@Injectable()
export class IntegrationSettings {
 constructor(readonly data:DataService,readonly secrets:SecretStore){}
 async secretValues(platform:OfficialPlatform){
  const raw=await this.secrets.get('SOCIAL_PLATFORM',platform,'OAUTH_CONFIG'),saved=raw?JSON.parse(raw) as Record<string,string>:{};
  return {
   apiKey:value([platform+'_API_KEY']),apiSecret:value([platform+'_API_SECRET']),accessToken:platform==='FACEBOOK'?value(['FACEBOOK_ACCESS_TOKEN','FACEBOOK_PAGE_ACCESS_TOKEN']):value([platform+'_ACCESS_TOKEN']),refreshToken:value([platform+'_REFRESH_TOKEN']),bearerToken:value([platform+'_BEARER_TOKEN']),botToken:value([platform+'_BOT_TOKEN']),pageAccessToken:value([platform+'_PAGE_ACCESS_TOKEN']),...saved
  };
 }
 async runtime(platform:Platform,purpose:'user'|'official'='user'):Promise<ProviderOverride>{
  const setting=await this.data.db.integrationSetting.findUnique({where:{platform}});
  const stored=await this.secrets.get('SOCIAL_PLATFORM',platform,'OAUTH_CONFIG');
  const values=stored?JSON.parse(stored) as Record<string,string>:{};
  return {purpose,...(values.clientId?{clientId:values.clientId}:{}),...(values.clientSecret?{clientSecret:values.clientSecret}:{}),...(setting?.callbackUrl?{callback:setting.callbackUrl}:{}),...(setting?.graphVersion?{graphVersion:setting.graphVersion}:{}),...(setting?.enabledOverride!==null&&setting?.enabledOverride!==undefined?{enabled:setting.enabledOverride&&!setting.disabled}:setting?.disabled?{enabled:false}:{})};
 }
 async list(){
  const overrides=await this.data.db.integrationSetting.findMany(),linked=await this.data.db.officialSocialAccount.findMany({where:{deletedAt:null,connectionStatus:'CONNECTED',credential:{ciphertext:{not:null},revokedAt:null}},select:{platform:true}}),oauth=await Promise.all(officialPlatforms.map(async platform=>{const runtime=await this.runtime(platform),c=configuration(platform,runtime),secret=await this.secretValues(platform);const fields=Object.entries({...secret,clientId:c.clientId,clientSecret:c.clientSecret}).filter(([,v])=>!!v).map(([k])=>k);return {platform,status:c.status,ready:c.ready,missing:c.missing,configuredFields:fields};}));
  return officialPlatforms.map(platform=>{
   const env=officialAccount(platform),setting=overrides.find(s=>s.platform===platform),connection=oauth.find(s=>s.platform===platform);
   const effectiveEnabled=(setting?.enabledOverride??env.enabled)&&!setting?.disabled;
   const connected=linked.some(a=>a.platform===platform),authenticatedFailure=!!setting?.lastError&&['HTTP_401','HTTP_403','AUTHENTICATION_FAILED'].includes(setting.lastError);
   const mode=setting?.authMode||'oauth';
   const apiFields=connection?.configuredFields||[];
   const apiMissing:Record<string,string[]>={X:apiFields.some(k=>['accessToken','bearerToken'].includes(k))?[]:['X_ACCESS_TOKEN_OR_BEARER_TOKEN'],TELEGRAM:apiFields.includes('botToken')?[]:['TELEGRAM_BOT_TOKEN'],FACEBOOK:apiFields.some(k=>['accessToken','pageAccessToken'].includes(k))?[]:['FACEBOOK_PAGE_ACCESS_TOKEN'],INSTAGRAM:apiFields.includes('accessToken')?[]:['INSTAGRAM_ACCESS_TOKEN'],YOUTUBE:apiFields.some(k=>['apiKey','accessToken'].includes(k))?[]:['YOUTUBE_API_KEY_OR_ACCESS_TOKEN'],TIKTOK:apiFields.includes('accessToken')?[]:['TIKTOK_ACCESS_TOKEN'],DISCORD:apiFields.some(k=>['botToken','accessToken'].includes(k))?[]:['DISCORD_BOT_TOKEN_OR_ACCESS_TOKEN'],GITHUB:mode==='public'||apiFields.includes('accessToken')?[]:['GITHUB_ACCESS_TOKEN']};
   const missing=mode==='oauth'?(connection?.missing||[]):apiMissing[platform];
   const configured=mode==='oauth'?!!connection?.ready:missing.length===0;
   const status=!effectiveEnabled?'disabled':authenticatedFailure?'authentication_failed':connected?'connected':configured?'configured':'awaiting_credentials';
   return {...env,authMode:setting?.authMode||'oauth',callbackUri:setting?.callbackUrl||process.env[platform+'_CALLBACK_URL']||process.env[platform+'_REDIRECT_URI']||process.env.APP_URL+'/api/oauth/'+platform.toLowerCase()+'/callback',graphVersion:setting?.graphVersion||process.env.META_GRAPH_VERSION||'',configured:!!configured,configuredFields:connection?.configuredFields||[],name:setting?.name??env.name,accountId:setting?.accountId??env.accountId,profileUrl:setting?.profileUrl??env.profileUrl,defaultTargetUrl:setting?.defaultTargetUrl??env.defaultTargetUrl,enabled:(setting?.enabledOverride??env.enabled)&&!setting?.disabled,
    status,ready:!!connection?.ready&&!setting?.disabled,
    oauthStatus:connection?.status||'not_implemented',apiStatus:setting?.lastTestStatus||'not_tested',
    missing:[...new Set([...missing,...env.configurationErrors])],availableTaskTypes:[],rewardedActionsEnabled:false,version:setting?.version||0,disabledOverride:!!setting?.disabled,lastSuccessfulConnection:setting?.lastSuccessAt||null,lastApiError:setting?.lastError||null,
    source:setting?'environment_with_audited_overrides':'environment'};
  });
 }
 async official(){return (await this.list()).map(({platform,name,profileUrl,defaultTargetUrl,links,enabled})=>({platform,name,profileUrl,defaultTargetUrl,links,enabled}));}
 async usable(platform:OfficialPlatform){return configuration(platform,await this.runtime(platform)).ready;}
 async save(platform:OfficialPlatform,actor:string,b:z.infer<typeof settingInput>){
  return this.data.db.$transaction(async tx=>{
   const old=await tx.integrationSetting.findUnique({where:{platform}});
   if((old?.version||0)!==b.version)throw new ConflictException('Configuration version changed');
   const data={disabled:b.disabled,...(b.enabledOverride!==undefined?{enabledOverride:b.enabledOverride}:{}),...(b.callbackUrl!==undefined?{callbackUrl:b.callbackUrl}:{}),...(b.graphVersion!==undefined?{graphVersion:b.graphVersion}:{}),name:b.name||null,profileUrl:b.profileUrl||null,accountId:b.accountId||null,defaultTargetUrl:b.defaultTargetUrl||null,version:b.version+1};
   const row=old?await tx.integrationSetting.updateMany({where:{platform,version:b.version},data}):await tx.integrationSetting.create({data:{...data,platform}});
   if('count'in row&&row.count!==1)throw new ConflictException('Configuration version changed');
   await tx.auditEvent.create({data:{actor,action:'INTEGRATION_CONFIG_UPDATE',resource:platform+':'+JSON.stringify(data)}});
   return {ok:true,version:b.version+1};
  },{isolationLevel:'Serializable'});
 }
 async configure(platform:OfficialPlatform,actor:string,body:{credentials:Record<string,string>;redirectUri:string;enabled:boolean;mode:string;graphVersion?:string;version?:number}){
  if((body.mode==='bot'&&platform!=='TELEGRAM')||(body.mode==='public'&&platform!=='GITHUB'))throw new BadRequestException('Unsupported provider authorization mode');
  const previous=await this.secrets.get('SOCIAL_PLATFORM',platform,'OAUTH_CONFIG'),stored=previous?JSON.parse(previous) as Record<string,string>:{};
  const entered=Object.fromEntries(Object.entries(body.credentials).filter(([,v])=>v.trim()));
  const values={...stored,...entered},runtime=await this.runtime(platform),base=configuration(platform,runtime);
  const c=configuration(platform,{...runtime,clientId:values.clientId||base.clientId,clientSecret:values.clientSecret||base.clientSecret,callback:body.redirectUri,enabled:true,graphVersion:body.graphVersion||base.version});
  let missing:string[]=[];
  if(body.mode==='oauth')missing=c.missing;
  else {
   const effective={...await this.secretValues(platform),...values};
   const required:Record<string,boolean>={X:!!(effective.bearerToken||effective.accessToken),TELEGRAM:!!effective.botToken,FACEBOOK:!!(effective.pageAccessToken||effective.accessToken),INSTAGRAM:!!effective.accessToken,YOUTUBE:!!(effective.apiKey||effective.accessToken),TIKTOK:!!effective.accessToken,DISCORD:!!(effective.botToken||effective.accessToken),GITHUB:body.mode==='public'||!!effective.accessToken};
   if(!required[platform])missing.push(platform+'_API_TOKEN_REQUIRED');
   if(['FACEBOOK','INSTAGRAM'].includes(platform)&&!/^v[0-9]+\.[0-9]+$/.test(body.graphVersion||base.version))missing.push('META_GRAPH_VERSION');
  }
  const canonical=process.env.APP_URL+'/api/oauth/'+platform.toLowerCase()+'/callback',legacy=process.env.APP_URL+'/api/social/'+platform.toLowerCase()+'/callback';
  if(body.redirectUri!==canonical&&body.redirectUri!==legacy)missing.push('CALLBACK_URI_MISMATCH');
  if(body.enabled&&missing.length)throw new BadRequestException('Missing or invalid: '+missing.join(', '));
  await this.data.db.$transaction(async tx=>{
   const old=await tx.integrationSetting.findUnique({where:{platform}});
   if(body.version!==undefined&&(old?.version||0)!==body.version)throw new ConflictException('Configuration version changed');
   if(Object.keys(entered).length)await this.secrets.write(tx,'SOCIAL_PLATFORM',platform,'OAUTH_CONFIG',JSON.stringify(values),actor);
   const data={authMode:body.mode,enabledOverride:body.enabled,disabled:!body.enabled,callbackUrl:body.redirectUri,graphVersion:body.graphVersion||null,credentialsUpdatedAt:new Date(),lastError:null,lastTestStatus:'not_tested',version:(old?.version||0)+1};
   await tx.integrationSetting.upsert({where:{platform},create:{platform,...data},update:data});
   await tx.auditEvent.create({data:{actor,action:'SOCIAL_API_CONFIGURATION_SAVE',resource:platform+':'+JSON.stringify({mode:body.mode,enabled:body.enabled,updatedFields:Object.keys(entered),version:data.version})}});
  },{isolationLevel:'Serializable'});
  return {ok:true,configurationSaved:true,connected:false,status:body.enabled?'configured':'disabled'};
 }
 async test(platform:OfficialPlatform,actor:string,account?:{accountId:string;accountType:string;name:string;tokens?:Record<string,string>}){
  const base=(await this.list()).find(s=>s.platform===platform)!;if(!base.enabled)throw new ServiceUnavailableException('Integration is disabled');
  const c={...base,...(account||{})};const secrets={...await this.secretValues(platform),...(account?.tokens||{})};
  if(c.missing.some(k=>k.endsWith('_INVALID')))throw new ServiceUnavailableException('Official account URL invalid');
  if(!await this.data.redis.set('api-test:'+platform,'1','EX',30,'NX'))throw new HttpException('Connection test cooldown',429);
  const setting=await this.data.db.integrationSetting.findUnique({where:{platform}});
  const hasProviderToken=!!(secrets.accessToken||secrets.bearerToken||secrets.botToken||secrets.pageAccessToken||secrets.apiKey);
  if(setting?.authMode==='oauth'&&!hasProviderToken){await this.data.db.integrationSetting.update({where:{platform},data:{lastTestAt:new Date(),lastTestStatus:'authorization_required',lastError:null}});await this.data.audit(actor,'INTEGRATION_TEST',platform+':authorization_required');return {status:'configured',error:null,scope:'authorization_required',connected:false};}
  let status='verified',failure:string|null=null,scope='official_account';
  try{
   let obj:Record<string,unknown>,id='';
   const version=(await this.data.db.integrationSetting.findUnique({where:{platform}}))?.graphVersion||process.env.META_GRAPH_VERSION||'';
   if(platform==='X'){
    const token=secrets.bearerToken,username=value(['X_USERNAME']);
    if(!(token||secrets.accessToken)||!c.accountId&&!username)throw new ProviderFailure('CONFIGURATION_MISSING');
    const path=secrets.accessToken?'users/me':c.accountId?'users/'+encodeURIComponent(c.accountId):'users/by/username/'+encodeURIComponent(username.replace(/^@/,''));
    obj=await request('https://api.x.com/2/'+path,{Authorization:'Bearer '+(secrets.accessToken||token)});id=String((obj.data as Record<string,unknown>)?.id||'');
   }else if(platform==='TELEGRAM'){
    const token=secrets.botToken;if(!token)throw new ProviderFailure('CONFIGURATION_MISSING');
    obj=await request('https://api.telegram.org/bot'+token+'/getMe');if(obj.ok!==true)throw new ProviderFailure('BOT_ACCESS_REJECTED');
    const bot=obj.result as Record<string,unknown>,expected=value(['TELEGRAM_BOT_USERNAME']).replace(/^@/,'');
    if(expected&&String(bot.username).toLowerCase()!==expected.toLowerCase())throw new ProviderFailure('ACCOUNT_MISMATCH');
    const rawTarget=account?.accountType==='BOT'?'':c.accountId||value(['TELEGRAM_CHANNEL_ID','TELEGRAM_CHANNEL_USERNAME','TELEGRAM_GROUP_ID','TELEGRAM_GROUP_USERNAME']);const target=rawTarget&&(!/^-?[0-9]+$/.test(rawTarget)&&!rawTarget.startsWith('@'))?'@'+rawTarget:rawTarget;
    if(target){obj=await request('https://api.telegram.org/bot'+token+'/getChat?chat_id='+encodeURIComponent(target));if(obj.ok!==true)throw new ProviderFailure('CHAT_ACCESS_REJECTED');id=String((obj.result as Record<string,unknown>)?.id||'');}
    else {id=String(bot.id||'');scope='bot_identity_only';}
   }else if(platform==='FACEBOOK'||platform==='INSTAGRAM'){
    if(!/^v[0-9]+\.[0-9]+$/.test(version))throw new ProviderFailure('GRAPH_VERSION_REQUIRED');
    const token=secrets.accessToken||secrets.pageAccessToken;if(!token||!c.accountId)throw new ProviderFailure('CONFIGURATION_MISSING');
    const url=platform==='FACEBOOK'?'https://graph.facebook.com/'+version+'/'+encodeURIComponent(c.accountId)+'?fields=id,name':'https://graph.instagram.com/'+version+'/me?fields=user_id,username';
    obj=await request(url,{Authorization:'Bearer '+token});id=String(obj.user_id||obj.id||'');
   }else if(platform==='YOUTUBE'){
    const key=secrets.apiKey,token=secrets.accessToken;if(!(key||token)||!token&&!c.accountId)throw new ProviderFailure('CONFIGURATION_MISSING');
    const query=token?'mine=true':'id='+encodeURIComponent(c.accountId)+'&key='+encodeURIComponent(key);
    obj=await request('https://www.googleapis.com/youtube/v3/channels?part=id,snippet&'+query,token?{Authorization:'Bearer '+token}:{});
    id=String(((obj.items as Record<string,unknown>[]|undefined)?.[0])?.id||'');
   }else if(platform==='TIKTOK'){
    const token=secrets.accessToken;if(!token||!c.accountId)throw new ProviderFailure('CONFIGURATION_MISSING');
    obj=await request('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name',{Authorization:'Bearer '+token});
    id=String(((obj.data as Record<string,unknown>)?.user as Record<string,unknown>)?.open_id||'');
   }else if(platform==='DISCORD'){
    const token=secrets.botToken;if(!token||!c.accountId)throw new ProviderFailure('CONFIGURATION_MISSING');
    obj=await request('https://discord.com/api/v10/guilds/'+encodeURIComponent(c.accountId),{Authorization:'Bot '+token});id=String(obj.id||'');
   }else{
    const org=value(['GITHUB_ORGANIZATION','GITHUB_ORG_NAME']),repo=value(['GITHUB_REPOSITORY','GITHUB_REPO_NAME']);if(!/^[A-Za-z0-9_.-]+$/.test(org)||!/^[A-Za-z0-9_.-]+$/.test(repo))throw new ProviderFailure('CONFIGURATION_MISSING');
    const token=secrets.accessToken;obj=await request('https://api.github.com/repos/'+org+'/'+repo,{'User-Agent':'Turkchain-Rewards',...(token?{Authorization:'Bearer '+token}:{})});
    if(String(obj.full_name).toLowerCase()!==(org+'/'+repo).toLowerCase())throw new ProviderFailure('ACCOUNT_MISMATCH');id=org;
   }
   if(!id||c.accountId&&scope!=='bot_identity_only'&&id!==c.accountId)throw new ProviderFailure('ACCOUNT_MISMATCH');
  }catch(e){status='failed';failure=e instanceof ProviderFailure?e.reason:'REQUEST_FAILED';if(e instanceof ProviderFailure&&e.retryAfter)await this.data.redis.set('api-test:'+platform,'1','EX',e.retryAfter);}
  await this.data.db.integrationSetting.upsert({where:{platform},create:{platform,lastTestAt:new Date(),lastTestStatus:status,lastError:failure,lastSuccessAt:failure?null:new Date()},update:{lastTestAt:new Date(),lastTestStatus:status,lastError:failure,...(failure?{}:{lastSuccessAt:new Date()})}});
  await this.data.audit(actor,'INTEGRATION_TEST',platform+':'+status+':'+(failure||scope));
  return {status,error:failure,scope};
 }
}
