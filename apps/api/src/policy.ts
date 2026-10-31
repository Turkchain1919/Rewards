export const platforms = ['X','TELEGRAM','FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK'] as const;
export function canEnableTask(platform:string, kind:string, reviewed:boolean):boolean {
 // All rewarded third-party social actions remain disabled until a documented policy review.
 return platform === 'TURKCHAIN' && kind === 'EDUCATION' && reviewed;
}
export function validateReward(value:string): bigint {
 if (!/^[0-9]+$/.test(value)) throw new Error('Reward must be integer wei');
 const amount=BigInt(value);
 if (amount <= 0n || amount >= 2n ** 256n) throw new Error('Reward out of range');
 return amount;
}
