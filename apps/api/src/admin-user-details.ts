import {NotFoundException} from '@nestjs/common';
import type {PrismaClient} from '@prisma/client';
import type {IntegrationSettings} from './integration-settings';
import {telegramUserId} from './telegram-identity';
import {telegramMembership} from './telegram-verifier';
const membershipActions=['TELEGRAM_VERIFICATION_STARTED','TELEGRAM_VERIFICATION_FAILED','TELEGRAM_MEMBERSHIP_REWARD'];
export async function userConnectionDetails(db:PrismaClient,userId:string){
 const user=await db.user.findUnique({where:{id:userId},select:{id:true,wallet:true,displayName:true,createdAt:true,_count:{select:{submissions:true,entries:true}}}});if(!user)throw new NotFoundException('User not found');
 const event=(actions:string[],resource?:string)=>db.auditEvent.findFirst({where:{actor:userId,action:{in:actions},...(resource?{resource}:{})},select:{action:true,resource:true,createdAt:true},orderBy:{createdAt:'desc'}});
 const [sessions,social,events,checks,targets]=await Promise.all([
  db.authSession.findMany({where:{userId,expiresAt:{gt:new Date()}},select:{createdAt:true,expiresAt:true},orderBy:{createdAt:'desc'}}),
  db.socialAccount.findUnique({where:{userId_provider:{userId,provider:'TELEGRAM'}},select:{providerAccountId:true,accountName:true,createdAt:true,expiresAt:true,lastError:true}}),
  Promise.all([event(['USER_LOGIN']),event(['SOCIAL_LINK'],'TELEGRAM'),event(['SOCIAL_UNLINK'],'TELEGRAM'),event(membershipActions)]).then(rows=>rows.filter(row=>row!==null)),
  db.auditEvent.findFirst({where:{action:'ADMIN_TELEGRAM_MEMBERSHIP_CHECK',resource:{startsWith:userId+':'}},select:{resource:true,createdAt:true},orderBy:{createdAt:'desc'}}),
  db.officialSocialAccount.findMany({where:{platform:'TELEGRAM',accountType:{in:['GROUP','CHANNEL']},enabled:true,deletedAt:null,connectionStatus:'CONNECTED'},select:{id:true,name:true,accountType:true,profileUrl:true},take:50})
 ]);
 const lastLink=events.find(e=>e.action==='SOCIAL_LINK'&&e.resource==='TELEGRAM')?.createdAt||social?.createdAt||null,lastUnlink=events.find(e=>e.action==='SOCIAL_UNLINK'&&e.resource==='TELEGRAM')?.createdAt||null,last=events.find(e=>membershipActions.includes(e.action));
 const lastTaskVerification=last?{checkedAt:last.createdAt,status:last.action==='TELEGRAM_MEMBERSHIP_REWARD'?'MEMBER':last.action==='TELEGRAM_VERIFICATION_FAILED'?'NOT_MEMBER':'RESULT_NOT_RECORDED',historical:true,stale:!social||!!lastLink&&lastLink>last.createdAt}:null;
 const parts=checks?.resource.split(':'),status=parts?.[2];const lastMembershipCheck=checks&&parts?.length===3&&['MEMBER','NOT_MEMBER','CONNECTION_REQUIRED','NOT_CONFIGURED','PROVIDER_UNAVAILABLE'].includes(status||'')?{targetId:parts[1],status:status!,checkedAt:checks.createdAt,stale:!social||!!lastLink&&lastLink>checks.createdAt}:null;
 return {user,wallet:{address:user.wallet,liveConnection:'NOT_OBSERVED'},sessions:{validCount:sessions.length,items:sessions,lastLoginAt:events.find(e=>e.action==='USER_LOGIN')?.createdAt||null},telegram:{linked:!!social,accountName:social?.accountName||null,reconnectRequired:!!social&&(!telegramUserId(social.providerAccountId)||social.lastError==='REAUTH_REQUIRED'),linkedAt:lastLink,unlinkedAt:lastUnlink,tokenExpiresAt:social?.expiresAt||null,lastTaskVerification,lastMembershipCheck,targets},observedAt:new Date()};
}
export async function checkUserTelegramMembership(db:PrismaClient,settings:IntegrationSettings,userId:string,targetId:string,fetcher:typeof fetch=fetch){
 if(!await db.user.findUnique({where:{id:userId},select:{id:true}}))throw new NotFoundException('User not found');
 const account=await db.socialAccount.findUnique({where:{userId_provider:{userId,provider:'TELEGRAM'}},select:{providerAccountId:true}}),identity=telegramUserId(account?.providerAccountId);
 const target=await db.officialSocialAccount.findFirst({where:{id:targetId,platform:'TELEGRAM',accountType:{in:['GROUP','CHANNEL']},enabled:true,deletedAt:null,connectionStatus:'CONNECTED'},select:{id:true,name:true,accountId:true}});if(!target)throw new NotFoundException('Telegram target not found');
 const finish=(status:string)=>({status,targetId:target.id,targetName:target.name,checkedAt:new Date()});if(!identity)return finish('CONNECTION_REQUIRED');
 try{const token=(await settings.secretValues('TELEGRAM')).botToken;if(!token)return finish('NOT_CONFIGURED');return finish(await telegramMembership(token,target.accountId,identity,fetcher)?'MEMBER':'NOT_MEMBER');}catch{return finish('PROVIDER_UNAVAILABLE');}
}
