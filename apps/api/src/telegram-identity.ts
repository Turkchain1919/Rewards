// OIDC sub is a subject identifier, not Telegram Bot API user_id.
export function telegramUserId(value:unknown):string|null{
 const text=typeof value==='number'&&Number.isSafeInteger(value)?String(value):typeof value==='string'?value:'';
 if(!/^[1-9][0-9]{0,15}$/.test(text))return null;
 return BigInt(text)<=4503599627370495n?text:null;
}
