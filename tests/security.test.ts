import test from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword,encrypt,decrypt,equal} from '../apps/api/src/security';
test('passwords salted and verified without plaintext storage',async()=>{
 const a=await hashPassword('correct horse battery 123'),b=await hashPassword('correct horse battery 123');
 assert.notEqual(a,b);assert.equal(await verifyPassword('correct horse battery 123',a),true);assert.equal(await verifyPassword('wrong',a),false);
});
test('authenticated encryption rejects tampering and cross-environment use',()=>{
 const original=process.env.APP_ENV,key=process.env.DATA_ENCRYPTION_KEY;
 process.env.DATA_ENCRYPTION_KEY='42'.repeat(32);process.env.APP_ENV='test';
 try{const sealed=encrypt('sensitive token');assert.equal(decrypt(sealed),'sensitive token');const buf=Buffer.from(sealed,'base64');buf[15]^=1;assert.throws(()=>decrypt(buf.toString('base64')));process.env.APP_ENV='production';assert.throws(()=>decrypt(sealed));}
 finally{if(original===undefined)delete process.env.APP_ENV;else process.env.APP_ENV=original;if(key===undefined)delete process.env.DATA_ENCRYPTION_KEY;else process.env.DATA_ENCRYPTION_KEY=key;}
});
test('constant-time token comparison does not accept length/prefix mismatch',()=>{assert.equal(equal('abc','abc'),true);assert.equal(equal('abc','abcd'),false);});
