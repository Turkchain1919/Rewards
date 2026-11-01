export const platforms = ['X','TELEGRAM','FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK'] as const;
export function canEnableTask(platform:string, kind:string, reviewed:boolean, verification?:unknown):boolean {
 // Rewarded social engagement remains blocked except Telegram membership verified with Bot API.
 if(['FIRST_PARTY','TURKCHAIN'].includes(platform)) return kind === 'EDUCATION' && reviewed;
 if(platform==='TELEGRAM' && kind==='SOCIAL_INTERACTION' && reviewed && verification && typeof verification==='object')
  return (verification as {type?:unknown}).type==='TELEGRAM_MEMBERSHIP';
 return false;
}
export function validateReward(value:string): bigint {
 if (!/^[0-9]+$/.test(value)) throw new Error('Reward must be integer wei');
 const amount=BigInt(value);
 if (amount <= 0n || amount >= 2n ** 256n) throw new Error('Reward out of range');
 return amount;
}
