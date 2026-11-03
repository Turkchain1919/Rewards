import {BadRequestException} from '@nestjs/common';
import type {RewardPlatform} from './social-catalog';
const hosts:Record<RewardPlatform,string[]>={X:['x.com','www.x.com','twitter.com','www.twitter.com'],YOUTUBE:['youtube.com','www.youtube.com','m.youtube.com','youtu.be'],INSTAGRAM:['instagram.com','www.instagram.com'],TELEGRAM:['t.me','telegram.me'],FACEBOOK:['facebook.com','www.facebook.com','m.facebook.com','fb.watch'],KICK:['kick.com','www.kick.com'],TWITCH:['twitch.tv','www.twitch.tv'],TIKTOK:['tiktok.com','www.tiktok.com']};
export type ParsedSocialTarget={platform:RewardPlatform;url:string;objectId:string;objectType:string;handle:string|null};
export function parseSocialTarget(input:string,expected?:string):ParsedSocialTarget{
 let u:URL;try{u=new URL(input);}catch{throw new BadRequestException('Invalid social target URL');}
 if(u.protocol!=='https:'||u.port&&u.port!=='443'||u.username||u.password||input.length>2048||[...u.searchParams.keys()].some(k=>/token|secret|password|authorization|api.?key/i.test(k)))throw new BadRequestException('Unsafe social target URL');
 const platform=(Object.keys(hosts) as RewardPlatform[]).find(p=>hosts[p].includes(u.hostname.toLowerCase()));if(!platform||expected&&platform!==expected)throw new BadRequestException('Target platform does not match');
 const parts=u.pathname.split('/').filter(Boolean).map(v=>{try{return decodeURIComponent(v);}catch{throw new BadRequestException('Invalid URL encoding');}});
 if(parts.some(v=>!/^[A-Za-z0-9_.@+\-]+$/.test(v)))throw new BadRequestException('Invalid social target path');
 let objectId='',objectType='PROFILE',handle:string|null=null;
 if(platform==='X'){const index=parts.indexOf('status');if(index>=0){objectId=parts[index+1]||'';objectType='POST';handle=parts[0]||null;if(!/^[0-9]{1,24}$/.test(objectId))throw new BadRequestException('Invalid X post ID');}else{handle=parts[0]||null;objectId=handle||'';}}
 if(platform==='YOUTUBE'){if(u.hostname==='youtu.be'){objectId=parts[0]||'';objectType='VIDEO';}else if(['watch','shorts','live'].includes(parts[0])){objectId=parts[0]==='watch'?u.searchParams.get('v')||'':parts[1]||'';objectType='VIDEO';}else{objectId=parts[0]==='channel'?parts[1]||'':parts[0]||'';objectType='CHANNEL';handle=objectId;}}
 if(platform==='INSTAGRAM'){if(['p','reel','reels','tv'].includes(parts[0])){objectId=parts[1]||'';objectType=parts[0]==='p'?'POST':'VIDEO';}else{objectId=parts[0]||'';handle=objectId;}}
 if(platform==='TELEGRAM'){objectId=parts[0]||'';objectType=parts.length>1?'MESSAGE':'CHANNEL';handle=objectId;if(parts.length>1)objectId=parts.slice(0,2).join('/');}
 if(platform==='FACEBOOK'){const index=parts.indexOf('posts');if(index>0){objectId=parts[0]+'_'+(parts[index+1]||'');objectType='POST';handle=parts[0];}else if(['reel','watch'].includes(parts[0])){objectId=parts[1]||u.searchParams.get('v')||'';objectType='VIDEO';}else{objectId=parts[0]||'';objectType='PAGE';handle=objectId;}}
 if(platform==='KICK'||platform==='TWITCH'){objectId=parts[0]||'';objectType='CHANNEL';handle=objectId;if(platform==='TWITCH'&&parts[0]==='videos'){objectId=parts[1]||'';objectType='VIDEO';handle=null;}}
 if(platform==='TIKTOK'){handle=parts[0]?.replace(/^@/,'')||null;if(parts[1]==='video'){objectId=parts[2]||'';objectType='VIDEO';}else objectId=handle||'';}
 if(!objectId||objectId.length>200)throw new BadRequestException('Target object ID is missing');
 u.hash='';for(const key of [...u.searchParams.keys()])if(!(platform==='YOUTUBE'||platform==='FACEBOOK')||key!=='v')u.searchParams.delete(key);
 return {platform,url:u.toString(),objectId,objectType,handle};
}
