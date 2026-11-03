import test from 'node:test';
import assert from 'node:assert/strict';
import type {PrismaClient} from '@prisma/client';
import type Redis from 'ioredis';
import {encrypt} from '../apps/api/src/security';
import {validateTwitchConnections} from '../apps/api/src/social-token-maintenance';
test('Twitch hourly validator binds token identity, throttles, retries outages and does not revoke rotated credentials',async()=>{
 const prior={key:process.env.DATA_ENCRYPTION_KEY,env:process.env.APP_ENV};process.env.DATA_ENCRYPTION_KEY='ab'.repeat(32);process.env.APP_ENV='test';
 try{
  let mode='valid',rotated=false,calls=0;const updates:unknown[]=[],audits:unknown[]=[],expires:unknown[]=[],seen=new Set<string>();
  const credential={id:'fixture-credential',version:1,revokedAt:null,ciphertext:encrypt(JSON.stringify({accessToken:'fixture-access'}))};
  const row={id:'fixture-personal',providerAccountId:'fixture-user',credential};
  const tx={credential:{findUnique:async()=>({...credential,version:rotated?2:1})},socialAccount:{updateMany:async(v:unknown)=>{updates.push(v);}},officialSocialAccount:{updateMany:async(v:unknown)=>{updates.push(v);}},task:{updateMany:async(v:unknown)=>{updates.push(v);}},auditEvent:{create:async(v:unknown)=>{audits.push(v);}}};
  const db={integrationSetting:{findUnique:async()=>({enabledOverride:true,disabled:false})},credential:{findUnique:async()=>({ciphertext:encrypt(JSON.stringify({clientId:'fixture-client'}))})},socialAccount:{findMany:async()=>[row]},officialSocialAccount:{findMany:async()=>[]},$transaction:async(fn:(t:typeof tx)=>Promise<void>)=>fn(tx)} as unknown as PrismaClient;
  const redis={set:async(key:string)=>{if(seen.has(key))return null;seen.add(key);return 'OK';},expire:async(...args:unknown[])=>{expires.push(args);}} as unknown as Redis;
  const fetcher:typeof fetch=async(input,init)=>{calls++;assert.equal(String(input),'https://id.twitch.tv/oauth2/validate');assert.equal(init?.redirect,'error');assert.equal((init?.headers as Record<string,string>).Authorization,'OAuth fixture-access');return mode==='outage'?new Response('{}',{status:503}):mode==='invalid'?new Response('{}',{status:401}):new Response(JSON.stringify({client_id:'fixture-client',user_id:mode==='mismatch'?'other-user':'fixture-user'}));};
  assert.deepEqual(await validateTwitchConnections(db,redis,fetcher),{checked:1,reauthRequired:0});assert.equal(updates.length,1);await validateTwitchConnections(db,redis,fetcher);assert.equal(calls,1);
  updates.length=0;seen.clear();mode='outage';await validateTwitchConnections(db,redis,fetcher);assert.equal(updates.length,0);assert.deepEqual(expires,[['social-token-check:fixture-credential',300]]);
  seen.clear();mode='invalid';assert.equal((await validateTwitchConnections(db,redis,fetcher)).reauthRequired,1);assert.equal(audits.length,1);assert.equal((updates[0]as{data:{lastError:string}}).data.lastError,'REAUTH_REQUIRED');
  updates.length=0;audits.length=0;seen.clear();rotated=true;await validateTwitchConnections(db,redis,fetcher);assert.equal(updates.length,0);assert.equal(audits.length,0);
  seen.clear();rotated=false;mode='mismatch';assert.equal((await validateTwitchConnections(db,redis,fetcher)).reauthRequired,1);
 }finally{if(prior.key===undefined)delete process.env.DATA_ENCRYPTION_KEY;else process.env.DATA_ENCRYPTION_KEY=prior.key;if(prior.env===undefined)delete process.env.APP_ENV;else process.env.APP_ENV=prior.env;}
});
