import {catalogTask} from './social-catalog';
export const platforms = ['X','TELEGRAM','FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK','KICK','TWITCH'] as const;
export function canEnableTask(platform:string, kind:string, reviewed:boolean, verification?:unknown):boolean {
 // Rewarded social engagement remains blocked except Telegram membership verified with Bot API.
 if(['FIRST_PARTY','TURKCHAIN'].includes(platform)) return kind === 'EDUCATION' && reviewed;
 if(platform==='TELEGRAM' && kind==='SOCIAL_INTERACTION' && reviewed && verification && typeof verification==='object')
  {const rule=verification as {type?:unknown;code?:string};if(rule.type==='TELEGRAM_MEMBERSHIP')return true;const definition=rule.code?catalogTask(rule.code):null;return rule.type==='SOCIAL_API'&&!!definition&&definition.platform===platform&&definition.rewardEnabled&&definition.implemented&&definition.policyStatus==='ALLOWED';}
 return false;
}
export function validateReward(value:string): bigint {
 if (!/^[0-9]+$/.test(value)) throw new Error('Reward must be integer wei');
 const amount=BigInt(value);
 if (amount <= 0n || amount >= 2n ** 256n) throw new Error('Reward out of range');
 return amount;
}
