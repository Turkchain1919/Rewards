type BotApiBody={ok?:boolean;result?:Record<string,unknown>;error_code?:number};
async function telegramApi(token:string,method:string,params:Record<string,string>,fetcher:typeof fetch){
 const url=new URL('https://api.telegram.org/bot'+token+'/'+method);
 for(const [key,value] of Object.entries(params))url.searchParams.set(key,value);
 let response:Response,raw:string;
 try{response=await fetcher(url,{method:'GET',redirect:'error',signal:AbortSignal.timeout(8000)});raw=await response.text();}catch{throw new Error('TELEGRAM_PROVIDER_UNAVAILABLE');}
 if(raw.length>65536)throw new Error('TELEGRAM_RESPONSE_TOO_LARGE');
 let body:BotApiBody;
 try{body=JSON.parse(raw) as BotApiBody;}catch{throw new Error('TELEGRAM_RESPONSE_INVALID');}
 if(response.status===429||body.error_code===429)throw new Error('TELEGRAM_RATE_LIMITED');
 if(!response.ok||body.ok!==true||!body.result)throw new Error('TELEGRAM_API_REJECTED');
 return body.result;
}
export async function telegramBotChat(token:string,target:string,expectedType:'GROUP'|'CHANNEL',fetcher:typeof fetch=fetch){
 if(!token||!(/^-?[0-9]{1,24}$/.test(target)||/^@[A-Za-z0-9_]{5,32}$/.test(target)))throw new Error('TELEGRAM_CONFIGURATION_INVALID');
 const bot=await telegramApi(token,'getMe',{},fetcher);
 if(typeof bot.id!=='number'||typeof bot.username!=='string')throw new Error('TELEGRAM_BOT_IDENTITY_INVALID');
 const chat=await telegramApi(token,'getChat',{chat_id:target},fetcher);
 if(typeof chat.id!=='number'||typeof chat.type!=='string')throw new Error('TELEGRAM_CHAT_INVALID');
 const allowed=expectedType==='CHANNEL'?chat.type==='channel':['group','supergroup'].includes(chat.type);
 if(!allowed)throw new Error('TELEGRAM_CHAT_TYPE_MISMATCH');
 const member=await telegramApi(token,'getChatMember',{chat_id:String(chat.id),user_id:String(bot.id)},fetcher);
 if(!['administrator','creator'].includes(String(member.status)))throw new Error('TELEGRAM_BOT_NOT_ADMIN');
 const username=typeof chat.username==='string'?chat.username:'';
 return {accountId:String(chat.id),accountType:expectedType,name:String(chat.title||chat.first_name||'Telegram chat'),username,profileUrl:username?'https://t.me/'+username:'',defaultTargetUrl:username?'https://t.me/'+username:''};
}
export async function telegramMembership(token:string,chatId:string,userId:string,fetcher:typeof fetch=fetch):Promise<boolean>{
 if(!token||!/^[0-9]{1,24}$/.test(userId)||!(/^-?[0-9]{1,24}$/.test(chatId)||/^@[A-Za-z0-9_]{5,32}$/.test(chatId)))throw new Error('TELEGRAM_CONFIGURATION_INVALID');
 const result=await telegramApi(token,'getChatMember',{chat_id:chatId,user_id:userId},fetcher);
 const status=result.status;
 return status==='creator'||status==='administrator'||status==='member'||(status==='restricted'&&result.is_member===true);
}
