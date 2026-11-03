export const officialPlatforms=['X','TELEGRAM','FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK','KICK','TWITCH','DISCORD','GITHUB'] as const;
export type OfficialPlatform=typeof officialPlatforms[number];
const fields:Record<OfficialPlatform,{name:string[];id:string[];url:string[];target:string[];client:string[];secret:string[];callback:string[];enabled:string[];api:string[]}> = {
 X:{name:['X_USERNAME'],id:['X_USER_ID'],url:['X_PROFILE_URL'],target:['X_DEFAULT_TARGET_URL','X_DEFAULT_POST_URL','X_PROFILE_URL'],client:['X_CLIENT_ID'],secret:['X_CLIENT_SECRET'],callback:['X_CALLBACK_URL','X_REDIRECT_URI'],enabled:['X_ENABLED','X_OAUTH_ENABLED'],api:['X_BEARER_TOKEN']},
 TELEGRAM:{name:['TELEGRAM_CHANNEL_USERNAME','TELEGRAM_GROUP_USERNAME','TELEGRAM_BOT_USERNAME'],id:['TELEGRAM_CHANNEL_ID','TELEGRAM_GROUP_ID'],url:['TELEGRAM_CHANNEL_URL','TELEGRAM_GROUP_URL'],target:['TELEGRAM_DEFAULT_TARGET_URL','TELEGRAM_CHANNEL_URL','TELEGRAM_GROUP_URL'],client:['TELEGRAM_CLIENT_ID'],secret:['TELEGRAM_CLIENT_SECRET'],callback:['TELEGRAM_CALLBACK_URL','TELEGRAM_REDIRECT_URI'],enabled:['TELEGRAM_ENABLED','TELEGRAM_OAUTH_ENABLED'],api:['TELEGRAM_BOT_TOKEN']},
 FACEBOOK:{name:['FACEBOOK_PAGE_NAME'],id:['FACEBOOK_PAGE_ID'],url:['FACEBOOK_PAGE_URL'],target:['FACEBOOK_DEFAULT_TARGET_URL','FACEBOOK_PAGE_URL'],client:['FACEBOOK_APP_ID','FACEBOOK_CLIENT_ID'],secret:['FACEBOOK_APP_SECRET','FACEBOOK_CLIENT_SECRET'],callback:['FACEBOOK_CALLBACK_URL','FACEBOOK_REDIRECT_URI'],enabled:['FACEBOOK_ENABLED','FACEBOOK_OAUTH_ENABLED'],api:['FACEBOOK_PAGE_ACCESS_TOKEN']},
 INSTAGRAM:{name:['INSTAGRAM_USERNAME'],id:['INSTAGRAM_ACCOUNT_ID'],url:['INSTAGRAM_PROFILE_URL'],target:['INSTAGRAM_DEFAULT_TARGET_URL','INSTAGRAM_PROFILE_URL'],client:['INSTAGRAM_APP_ID','INSTAGRAM_CLIENT_ID'],secret:['INSTAGRAM_APP_SECRET','INSTAGRAM_CLIENT_SECRET'],callback:['INSTAGRAM_CALLBACK_URL','INSTAGRAM_REDIRECT_URI'],enabled:['INSTAGRAM_ENABLED','INSTAGRAM_OAUTH_ENABLED'],api:['INSTAGRAM_ACCESS_TOKEN']},
 YOUTUBE:{name:['YOUTUBE_CHANNEL_NAME'],id:['YOUTUBE_CHANNEL_ID'],url:['YOUTUBE_CHANNEL_URL'],target:['YOUTUBE_DEFAULT_TARGET_URL','YOUTUBE_CHANNEL_URL'],client:['YOUTUBE_CLIENT_ID'],secret:['YOUTUBE_CLIENT_SECRET'],callback:['YOUTUBE_CALLBACK_URL','YOUTUBE_REDIRECT_URI'],enabled:['YOUTUBE_ENABLED','YOUTUBE_OAUTH_ENABLED'],api:['YOUTUBE_API_KEY']},
 TIKTOK:{name:['TIKTOK_USERNAME'],id:['TIKTOK_USER_ID'],url:['TIKTOK_PROFILE_URL'],target:['TIKTOK_DEFAULT_TARGET_URL','TIKTOK_PROFILE_URL'],client:['TIKTOK_CLIENT_KEY','TIKTOK_CLIENT_ID'],secret:['TIKTOK_CLIENT_SECRET'],callback:['TIKTOK_CALLBACK_URL','TIKTOK_REDIRECT_URI'],enabled:['TIKTOK_ENABLED','TIKTOK_OAUTH_ENABLED'],api:['TIKTOK_ACCESS_TOKEN']},
 KICK:{name:['KICK_CHANNEL_NAME'],id:['KICK_CHANNEL_ID'],url:['KICK_CHANNEL_URL'],target:['KICK_DEFAULT_TARGET_URL','KICK_CHANNEL_URL'],client:['KICK_CLIENT_ID'],secret:['KICK_CLIENT_SECRET'],callback:['KICK_CALLBACK_URL'],enabled:['KICK_ENABLED'],api:['KICK_ACCESS_TOKEN']},
 TWITCH:{name:['TWITCH_CHANNEL_NAME'],id:['TWITCH_CHANNEL_ID'],url:['TWITCH_CHANNEL_URL'],target:['TWITCH_DEFAULT_TARGET_URL','TWITCH_CHANNEL_URL'],client:['TWITCH_CLIENT_ID'],secret:['TWITCH_CLIENT_SECRET'],callback:['TWITCH_CALLBACK_URL'],enabled:['TWITCH_ENABLED'],api:['TWITCH_ACCESS_TOKEN']},
 DISCORD:{name:['DISCORD_GUILD_NAME'],id:['DISCORD_GUILD_ID'],url:['DISCORD_INVITE_URL'],target:['DISCORD_DEFAULT_TARGET_URL','DISCORD_INVITE_URL'],client:['DISCORD_CLIENT_ID'],secret:['DISCORD_CLIENT_SECRET'],callback:['DISCORD_CALLBACK_URL'],enabled:['DISCORD_ENABLED'],api:['DISCORD_BOT_TOKEN']},
 GITHUB:{name:['GITHUB_ORGANIZATION','GITHUB_ORG_NAME'],id:['GITHUB_ORGANIZATION','GITHUB_ORG_NAME'],url:['GITHUB_PROFILE_URL'],target:['GITHUB_DEFAULT_TARGET_URL','GITHUB_PROFILE_URL'],client:['GITHUB_CLIENT_ID'],secret:['GITHUB_CLIENT_SECRET'],callback:['GITHUB_CALLBACK_URL'],enabled:['GITHUB_ENABLED','GITHUB_TASKS_ENABLED'],api:[]}
};
export const value=(names:string[])=>names.map(k=>process.env[k]?.trim()).find(v=>v)||'';
export function safeTarget(input:string){
 if(!input)return null;
 try{const u=new URL(input);if(u.protocol!=='https:'||u.username||u.password||input.length>2048||[...u.searchParams.keys()].some(k=>/(api.?key|access.?token|refresh.?token|secret|authorization|password)/i.test(k)))return null;return u.toString();}catch{return null;}
}
export function credentials(platform:OfficialPlatform){
 const f=fields[platform];
 return {clientId:value(f.client),clientSecret:value(f.secret),callback:value(f.callback),enabled:value(f.enabled)==='true',clientField:f.client[0],secretField:f.secret[0],callbackField:f.callback[0],enabledField:f.enabled[0]};
}
export function officialAccount(platform:OfficialPlatform){
 const f=fields[platform],c=credentials(platform),errors:string[]=[];
 let profileUrl=value(f.url),defaultTarget=value(f.target);
 if(platform==='GITHUB'&&!profileUrl){const org=value(['GITHUB_ORGANIZATION','GITHUB_ORG_NAME']),repo=value(['GITHUB_REPOSITORY','GITHUB_REPO_NAME']);if(/^[A-Za-z0-9_.-]+$/.test(org)&&/^[A-Za-z0-9_.-]+$/.test(repo))profileUrl=defaultTarget='https://github.com/'+org+'/'+repo;}
 if(profileUrl&&!safeTarget(profileUrl))errors.push(f.url[0]+'_INVALID');
 if(defaultTarget&&!safeTarget(defaultTarget))errors.push(f.target[0]+'_INVALID');
 const links=platform==='TELEGRAM'?['TELEGRAM_CHANNEL_URL','TELEGRAM_GROUP_URL'].map(k=>({label:k.includes('CHANNEL')?'Telegram channel':'Telegram group',url:safeTarget(process.env[k]||'')})).filter(x=>x.url):[];
 return {platform,name:value(f.name),accountId:value(f.id),profileUrl:safeTarget(profileUrl),defaultTargetUrl:safeTarget(defaultTarget),enabled:c.enabled,links,configurationErrors:errors,apiMissing:f.api.filter(k=>!process.env[k])};
}
