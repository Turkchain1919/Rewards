import test from 'node:test';
import assert from 'node:assert/strict';
import {telegramMembership} from '../apps/api/src/telegram-verifier';
test('Telegram membership uses Bot API getChatMember and accepts real member statuses',async()=>{
 let target='';
 const fetcher:typeof fetch=async(input,init)=>{target=String(input);assert.equal(init?.method,'GET');return new Response(JSON.stringify({ok:true,result:{status:'member'}}),{status:200});};
 assert.equal(await telegramMembership('fixture-token','-1001234567890','987654321',fetcher),true);
 const url=new URL(target);assert.equal(url.pathname,'/botfixture-token/getChatMember');assert.equal(url.searchParams.get('chat_id'),'-1001234567890');assert.equal(url.searchParams.get('user_id'),'987654321');
});
test('Telegram membership rejects non-members and restricted users who are not members',async()=>{
 for(const result of [{status:'left'},{status:'kicked'},{status:'restricted',is_member:false}]){
  const fetcher:typeof fetch=async()=>new Response(JSON.stringify({ok:true,result}),{status:200});
  assert.equal(await telegramMembership('fixture-token','@fixture_channel','123456',fetcher),false);
 }
 const restricted:typeof fetch=async()=>new Response(JSON.stringify({ok:true,result:{status:'restricted',is_member:true}}),{status:200});
 assert.equal(await telegramMembership('fixture-token','@fixture_channel','123456',restricted),true);
});
test('Telegram API failures are sanitized and invalid identifiers are rejected',async()=>{
 const failure:typeof fetch=async()=>new Response(JSON.stringify({ok:false,error_code:403,description:'private provider details'}),{status:403});
 await assert.rejects(()=>telegramMembership('secret-token','@fixture_channel','123456',failure),e=>e instanceof Error&&e.message==='TELEGRAM_API_REJECTED');
 await assert.rejects(()=>telegramMembership('secret-token','@fixture_channel','not-a-numeric-id',failure),/TELEGRAM_CONFIGURATION_INVALID/);
});

test('official Telegram connection verifies the bot itself is a chat administrator',async()=>{
 const calls:string[]=[];
 const fetcher:typeof fetch=async(input)=>{const url=new URL(String(input));calls.push(url.pathname.split('/').pop()!);const method=url.pathname.split('/').pop();const result=method==='getMe'?{id:9001,username:'fixture_bot'}:method==='getChat'?{id:-1001234567890,type:'supergroup',title:'Fixture Telegram',username:'fixture_channel'}:{status:'administrator'};return new Response(JSON.stringify({ok:true,result}),{status:200});};
 const {telegramBotChat}=await import('../apps/api/src/telegram-verifier');
 const account=await telegramBotChat('fixture-token','@fixture_channel','GROUP',fetcher);
 assert.deepEqual(calls,['getMe','getChat','getChatMember']);assert.equal(account.accountId,'-1001234567890');assert.equal(account.name,'Fixture Telegram');assert.equal(account.defaultTargetUrl,'https://t.me/fixture_channel');
});
test('official Telegram connection fails closed when bot is not an administrator',async()=>{
 let calls=0;
 const fetcher:typeof fetch=async(input)=>{const method=new URL(String(input)).pathname.split('/').pop();calls++;const result=method==='getMe'?{id:1,username:'bot'}:method==='getChat'?{id:-1001,type:'supergroup',title:'Fixture'}:{status:'member'};return new Response(JSON.stringify({ok:true,result}),{status:200});};
 const {telegramBotChat}=await import('../apps/api/src/telegram-verifier');
 await assert.rejects(()=>telegramBotChat('fixture-token','-1001','GROUP',fetcher),/TELEGRAM_BOT_NOT_ADMIN/);assert.equal(calls,3);
});
