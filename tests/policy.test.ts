import test from 'node:test';
import assert from 'node:assert/strict';
import {canEnableTask,validateReward,platforms} from '../apps/api/src/policy';
test('all social reward actions default to denied',()=>{
 for(const p of platforms) for(const action of ['LIKE','FOLLOW','COMMENT','SHARE','VIEW','EDUCATION']) assert.equal(canEnableTask(p,action,true),false);
});
test('education requires explicit review',()=>{
 assert.equal(canEnableTask('TURKCHAIN','EDUCATION',false),false);
 assert.equal(canEnableTask('TURKCHAIN','EDUCATION',true),true);
});
test('wei arithmetic never uses floating point',()=>{
 assert.equal(validateReward('1000000000000000001'),1000000000000000001n);
 for(const n of ['-1','0','1.1','1e18','NaN',(2n**256n).toString()]) assert.throws(()=>validateReward(n));
});
