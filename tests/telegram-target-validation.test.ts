import test from 'node:test';
import assert from 'node:assert/strict';
import {officialInput} from '../apps/api/src/official-accounts';
const base={platform:'TELEGRAM',accountType:'GROUP',name:'Turkchain1919',username:'Turkchain1919',accountId:'-1003676977941',profileUrl:'https://t.me/Turkchain1919',defaultTargetUrl:'https://t.me/Turkchain1919',enabled:true};
test('Telegram GROUP and CHANNEL keep negative IDs as strings and support @username targets',()=>{
 for(const accountType of ['GROUP','CHANNEL'])for(const accountId of ['-1003676977941','-42','-100000000000000000000001','@Turkchain1919']){
  const row=officialInput.parse({...base,accountType,accountId});assert.equal(row.accountId,accountId);assert.equal(typeof row.accountId,'string');
 }
 for(const defaultTargetUrl of ['-1003676977941','@Turkchain1919','Turkchain1919'])assert.equal(officialInput.parse({...base,defaultTargetUrl}).defaultTargetUrl,'https://t.me/Turkchain1919');
});
test('Telegram GROUP/CHANNEL reject positive, zero, signed-positive and malformed IDs with field-specific errors',()=>{
 for(const accountType of ['GROUP','CHANNEL'])for(const accountId of ['1003676977941','0','-0','+1003676977941','1.5','1e12','--100',' -1003676977941','@bad','@bad-name']){
  const parsed=officialInput.safeParse({...base,accountType,accountId});assert.equal(parsed.success,false,accountId);if(!parsed.success)assert.ok(parsed.error.issues.some(i=>i.path.join('.')==='accountId'));
 }
 for(const accountType of ['GROUP','CHANNEL']){const parsed=officialInput.safeParse({...base,accountType,defaultTargetUrl:'1003676977941'});assert.equal(parsed.success,false);if(!parsed.success)assert.ok(parsed.error.issues.some(i=>i.path.join('.')==='defaultTargetUrl'));}
});
test('Telegram target validation does not rewrite non-group platform identities or personal numeric IDs',()=>{
 for(const accountType of ['PROFILE','BOT'])assert.equal(officialInput.parse({...base,accountType,accountId:'987654321'}).accountId,'987654321');
 assert.equal(officialInput.parse({...base,platform:'X',accountType:'PROFILE',accountId:'123456789'}).accountId,'123456789');
 // Legacy metadata drafts with no ID remain allowed; Bot API verification remains mandatory before CONNECTED.
 assert.equal(officialInput.parse({...base,accountId:''}).accountId,'');
});
