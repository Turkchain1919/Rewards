import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac,generateKeyPairSync,sign} from 'node:crypto';
import {socialTaskCatalog,rewardPlatforms} from '../apps/api/src/social-catalog';
import {parseSocialTarget} from '../apps/api/src/social-targets';
import {socialRequest} from '../apps/api/src/social-http';
import {verifySocialWebhook} from '../apps/api/src/social-webhook-signatures';
import {parseKickPublicKey} from '../apps/api/src/kick-public-key';
import {exchange,authorizationUrl} from '../apps/api/src/providers';
import {refreshOAuth} from '../apps/api/src/oauth-lifecycle';
import {socialAdapters} from '../apps/api/src/social-adapters';
import {canEnableTask} from '../apps/api/src/policy';
import {taskInput} from '../apps/api/src/engine';
import {localInputToUtc,utcToLocalInput} from '../apps/web/app/timezones';
const override={clientId:'fixture-client',clientSecret:'fixture-client-secret',enabled:true};
test('65-action eight-platform catalog separates technical ability, missing configuration and immutable reward policy',()=>{
 assert.equal(socialTaskCatalog.length,65);assert.equal(new Set(socialTaskCatalog.map(d=>d.code)).size,65);assert.equal(rewardPlatforms.length,8);
 for(const platform of rewardPlatforms)assert.ok(socialTaskCatalog.some(d=>d.platform===platform));
 for(const d of socialTaskCatalog){assert.ok(d.documentationUrl.startsWith('https://'));assert.ok(d.policyUrl.startsWith('https://'));assert.equal(d.lastCheckedAt,'2026-11-03');assert.ok(d.nameTr&&d.nameEn&&d.descriptionTr&&d.descriptionEn&&d.rateLimit);if(d.policyStatus!=='ALLOWED')assert.equal(d.rewardEnabled,false);if(d.platform!=='TELEGRAM')assert.equal(canEnableTask(d.platform,'SOCIAL_INTERACTION',true,{type:'SOCIAL_API',code:d.code}),false);}
 assert.equal(socialTaskCatalog.filter(d=>d.rewardEnabled).length,4);
 assert.ok(socialTaskCatalog.filter(d=>d.platform==='YOUTUBE').every(d=>d.status==='POLICY_RESTRICTED'));
 assert.equal(canEnableTask('TELEGRAM','SOCIAL_INTERACTION',true,{type:'SOCIAL_API',code:'TELEGRAM_BOT_CODE'}),true);
});
test('social URLs are allowlisted, canonicalized and never redirect to private or credential-bearing targets',()=>{
 assert.equal(parseSocialTarget('https://x.com/owner/status/123456?utm_source=test').objectId,'123456');
 assert.equal(parseSocialTarget('https://youtu.be/abcd_123-45').objectType,'VIDEO');assert.equal(parseSocialTarget('https://t.me/Turkchain1919').platform,'TELEGRAM');
 for(const url of ['http://x.com/owner','https://127.0.0.1/post','https://x.com.evil.invalid/owner','https://x.com@evil.invalid/owner','https://x.com:8443/owner','https://instagram.com/p/abc?access_token=secret','https://vm.tiktok.com/code'])assert.throws(()=>parseSocialTarget(url));
 assert.throws(()=>parseSocialTarget('https://twitch.tv/owner','KICK'));
});
test('provider fetches reject redirects and unsafe hosts, handle 429 without retries, and bound server-error backoff',async()=>{
 let calls=0;await assert.rejects(()=>socialRequest('https://localhost/private',{},async()=>{calls++;return new Response('{}');}));assert.equal(calls,0);
 await assert.rejects(()=>socialRequest('https://api.x.com/2/users/me',{},async(_url,init)=>{calls++;assert.equal(init?.redirect,'error');return new Response('{}',{status:429,headers:{'Retry-After':'120'}});}),e=>(e as {retryAfter:number}).retryAfter===120);assert.equal(calls,1);
 await assert.rejects(()=>socialRequest('https://api.x.com/2/users/me',{},async()=>new Response('{}',{status:429})),e=>(e as {retryAfter:number}).retryAfter===60);
 calls=0;const result=await socialRequest('https://api.kick.com/public/v1/users',{},async()=>{calls++;return new Response(calls<3?'{}':'{"data":[]}',{status:calls<3?503:200});});assert.equal(calls,3);assert.deepEqual(result,{data:[]});
});
test('Twitch HMAC and Kick RSA bind exact raw body, timestamp and event ID; Telegram and Meta reject bad secrets',()=>{
 const now=Date.now(),stamp=new Date(now).toISOString(),raw=Buffer.from('{"event":{"user_id":"1"}}'),secret='fixture-webhook-secret',id='fixture-event-id';
 const twitch={'twitch-eventsub-message-id':id,'twitch-eventsub-message-timestamp':stamp,'twitch-eventsub-message-signature':'sha256='+createHmac('sha256',secret).update(id+stamp).update(raw).digest('hex')};
 verifySocialWebhook('TWITCH',twitch,raw,secret,'',now);assert.throws(()=>verifySocialWebhook('TWITCH',twitch,Buffer.from('{}'),secret,'',now));assert.throws(()=>verifySocialWebhook('TWITCH',twitch,raw,secret,'',now+700000));
 const pair=generateKeyPairSync('rsa',{modulusLength:2048}),publicKey=pair.publicKey.export({type:'spki',format:'pem'}).toString(),kick={'kick-event-message-id':id,'kick-event-message-timestamp':stamp,'kick-event-signature':sign('RSA-SHA256',Buffer.concat([Buffer.from(id+'.'+stamp+'.'),raw]),pair.privateKey).toString('base64')};assert.equal(parseKickPublicKey(publicKey),publicKey.trim());assert.equal(parseKickPublicKey(JSON.stringify({data:{public_key:publicKey}})),publicKey);assert.throws(()=>parseKickPublicKey('invalid key'));verifySocialWebhook('KICK',kick,raw,'',publicKey,now);assert.throws(()=>verifySocialWebhook('KICK',kick,Buffer.from('{}'),'',publicKey,now));
 verifySocialWebhook('TELEGRAM',{'x-telegram-bot-api-secret-token':secret},raw,secret);assert.throws(()=>verifySocialWebhook('TELEGRAM',{'x-telegram-bot-api-secret-token':'wrong'},raw,secret));
 const meta={'x-hub-signature-256':'sha256='+createHmac('sha256',secret).update(raw).digest('hex')};verifySocialWebhook('INSTAGRAM',meta,raw,secret);assert.throws(()=>verifySocialWebhook('FACEBOOK',meta,Buffer.from('{}'),secret));assert.throws(()=>verifySocialWebhook('X',{},raw,secret));
});
test('Kick confidential PKCE and Twitch validated OAuth identities use minimum scopes and no invented connection',async()=>{
 const kickUrl=new URL(authorizationUrl('KICK','state','verifier','nonce',override));assert.equal(kickUrl.searchParams.get('scope'),'user:read');assert.equal(kickUrl.searchParams.get('code_challenge_method'),'S256');
 const kick=await exchange('KICK','code','verifier','nonce',async(input,init)=>{if(String(input).includes('/oauth/token')){assert.equal((init?.body as URLSearchParams).get('code_verifier'),'verifier');return new Response(JSON.stringify({access_token:'fixture-token',refresh_token:'fixture-refresh',scope:'user:read',expires_in:3600}));}assert.equal(String(input),'https://api.kick.com/public/v1/users');return new Response(JSON.stringify({data:[{user_id:1234,name:'fixture_kick'}]}));},override);assert.equal(kick.accountId,'1234');
 const twitchFetch:typeof fetch=async(input,init)=>{const url=String(input);if(url.endsWith('/oauth2/token'))return new Response(JSON.stringify({access_token:'fixture-token',refresh_token:'fixture-refresh',scope:[],expires_in:3600}));if(url.endsWith('/oauth2/validate')){assert.equal((init?.headers as Record<string,string>).Authorization,'OAuth fixture-token');return new Response(JSON.stringify({client_id:'fixture-client',user_id:'1234'}));}assert.equal((init?.headers as Record<string,string>)['Client-Id'],'fixture-client');return new Response(JSON.stringify({data:[{id:'1234',login:'fixture_twitch'}]}));};
 const twitch=await exchange('TWITCH','code','verifier','nonce',twitchFetch,override);assert.equal(twitch.accountId,'1234');
 assert.equal((await refreshOAuth('TWITCH',twitch.tokens,[],'1234','CHANNEL',override,twitchFetch)).tokens.accessToken,'fixture-token');
 await assert.rejects(()=>exchange('TWITCH','code','verifier','nonce',async(input,init)=>String(input).endsWith('/oauth2/validate')?new Response(JSON.stringify({client_id:'wrong',user_id:'1234'})):twitchFetch(input,init),override),/client mismatch/);
});
test('target ownership uses provider author ID and cannot be claimed from a trusted-looking URL alone',async()=>{
 const context={accountId:'owner-id',username:'owner',profileUrl:'https://x.com/owner',token:'fixture',clientId:'fixture',graphVersion:'',scopes:[]};
 const owned=await socialAdapters.X.validateTarget('https://x.com/owner/status/123',context,async()=>new Response(JSON.stringify({data:{id:'123',author_id:'owner-id',text:'fixture'}})));assert.equal(owned.ownershipVerified,true);
 const alien=await socialAdapters.X.validateTarget('https://x.com/owner/status/123',context,async()=>new Response(JSON.stringify({data:{id:'123',author_id:'other-id'}})));assert.equal(alien.ownershipVerified,false);
 let proofCalled=false;await assert.rejects(()=>socialAdapters.X.verifyTask('X_LIKE',async()=>{proofCalled=true;return true;}));assert.equal(proofCalled,false);
});
test('catalog DTOs reject wrong platforms, repeatability and malformed budgets without conversion exceptions',()=>{
 const base={campaignId:'fixture-campaign-id',title:'Fixture catalog task',platform:'TELEGRAM',kind:'SOCIAL_INTERACTION',rewardWei:'100',budgetWei:'500',socialTaskCode:'TELEGRAM_BOT_CODE',policyReviewed:true,verification:{type:'SOCIAL_API',code:'TELEGRAM_BOT_CODE',instructions:'Send the private bot challenge.',maxRewards:5}};
 assert.equal(taskInput.safeParse(base).success,true);
 for(const extra of [{platform:'X'},{repeatable:true},{budgetWei:'abc'},{budgetWei:'1.5'},{budgetWei:'1'},{rewardWei:'abc'},{socialTaskCode:'X_LIKE'},{verification:{type:'MANUAL',instructions:'A manual bypass must never work.',minLength:20}},{verification:{type:'TELEGRAM_MEMBERSHIP',instructions:'A membership verifier cannot verify a bot challenge.'}}])assert.equal(taskInput.safeParse({...base,...extra}).success,false);
});
test('IANA conversion stores UTC and rejects nonexistent and ambiguous DST times',()=>{
 assert.equal(localInputToUtc('2026-11-03T15:00','Europe/Istanbul'),'2026-11-03T12:00:00.000Z');assert.equal(utcToLocalInput('2026-11-03T12:00:00Z','Europe/Istanbul'),'2026-11-03T15:00');assert.equal(localInputToUtc('2026-07-01T12:00','America/New_York'),'2026-07-01T16:00:00.000Z');assert.throws(()=>localInputToUtc('2026-03-08T02:30','America/New_York'),/INVALID_LOCAL_DATE/);assert.throws(()=>localInputToUtc('2026-11-01T01:30','America/New_York'),/AMBIGUOUS_LOCAL_TIME/);assert.throws(()=>localInputToUtc('2026-02-31T12:00','UTC'));assert.equal(localInputToUtc('','UTC'),null);
});
