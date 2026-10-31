import test from 'node:test';
import assert from 'node:assert/strict';
import {Wallet,verifyTypedData} from 'ethers';
import {networkInput,environmentNetwork,validateEndpoint} from '../apps/api/src/configuration';
import {signClaim} from '../apps/api/src/claims';
import {authorizationUrl,configuration} from '../apps/api/src/providers';
import {refreshOAuth,revokeOAuth} from '../apps/api/src/oauth-lifecycle';
import {inspectHeroGif} from '../apps/api/src/hero-media';
test('portable EVM schemas reject mismatched hex IDs and unsafe endpoints',async()=>{
 const c=environmentNetwork();assert.equal(networkInput.safeParse({...c,chainIdHex:'0xdeadbeef'}).success,false);
 assert.equal(networkInput.safeParse({...c,chainId:'not-a-chain'}).success,false);
 const previous=process.env.APP_ENV;process.env.APP_ENV='production';try{await assert.rejects(()=>validateEndpoint('http://169.254.169.254/latest/meta-data'));await assert.rejects(()=>validateEndpoint('http://127.0.0.1:8545'));}finally{process.env.APP_ENV=previous;}
});
test('canonical WalletConnect project ID overrides the legacy alias',()=>{
 const primary=process.env.WALLETCONNECT_PROJECT_ID,legacy=process.env.BLOCKCHAIN_WALLETCONNECT_PROJECT_ID;
 process.env.WALLETCONNECT_PROJECT_ID='canonical-project';process.env.BLOCKCHAIN_WALLETCONNECT_PROJECT_ID='legacy-project';
 try{assert.equal(environmentNetwork().walletConnectProjectId,'canonical-project');}finally{if(primary===undefined)delete process.env.WALLETCONNECT_PROJECT_ID;else process.env.WALLETCONNECT_PROJECT_ID=primary;if(legacy===undefined)delete process.env.BLOCKCHAIN_WALLETCONNECT_PROJECT_ID;else process.env.BLOCKCHAIN_WALLETCONNECT_PROJECT_ID=legacy;}
});
test('claim signatures are domain-separated across EVM chains and vault addresses',async()=>{
 const wallet=Wallet.createRandom(),recipient=Wallet.createRandom().address;
 const domain={name:'Portable Rewards',version:'1',chainId:31337,verifyingContract:Wallet.createRandom().address},message={recipient,amount:'1000000000000000001',nonce:'5',deadline:'2000000000'};
 const a=await signClaim(wallet,domain,message);assert.equal(verifyTypedData(domain,a.types,message,a.signature),wallet.address);
 assert.notEqual(verifyTypedData({...domain,chainId:31338},a.types,message,a.signature),wallet.address);
 assert.notEqual(verifyTypedData({...domain,verifyingContract:Wallet.createRandom().address},a.types,message,a.signature),wallet.address);
 await assert.rejects(()=>signClaim(wallet,domain,{...message,amount:'-1'}));
});
test('OAuth uses canonical callbacks, PKCE and encrypted-store runtime credentials without exposing secrets',()=>{
 const options={clientId:'fixture-client',clientSecret:'fixture-secret',enabled:true,callback:process.env.APP_URL+'/api/oauth/x/callback'};
 const c=configuration('X',options);assert.equal(c.ready,true);
 const url=new URL(authorizationUrl('X','state','verifier','nonce',options));assert.equal(url.searchParams.get('code_challenge_method'),'S256');assert.equal(url.searchParams.get('redirect_uri'),options.callback);assert.ok(!url.toString().includes(options.clientSecret));
 assert.equal(configuration('X',{...options,callback:'https://attacker.invalid/callback'}).ready,false);
});
test('OAuth refresh rotates tokens, verifies account identity and rejects provider failures',async()=>{
 const options={clientId:'fixture-client',clientSecret:'fixture-secret',enabled:true,callback:process.env.APP_URL+'/api/oauth/x/callback'},scopes=['tweet.read','users.read','offline.access'];
 let mismatch=false;
 const fake=(async(url:RequestInfo|URL)=>new Response(JSON.stringify(String(url).endsWith('/token')?{access_token:'new-fixture-token',refresh_token:'rotated-fixture-token',scope:scopes.join(' '),expires_in:3600}:{data:{id:mismatch?'wrong':'123'}}),{status:200})) as typeof fetch;
 const result=await refreshOAuth('X',{accessToken:'old',refreshToken:'refresh',expiresAt:0},scopes,'123','PROFILE',options,fake);assert.equal(result.tokens.refreshToken,'rotated-fixture-token');
 mismatch=true;await assert.rejects(()=>refreshOAuth('X',{accessToken:'old',refreshToken:'refresh',expiresAt:0},scopes,'123','PROFILE',options,fake));
 const limited=(async()=>new Response('{}',{status:429,headers:{'Retry-After':'60'}})) as typeof fetch;
 await assert.rejects(()=>refreshOAuth('X',{accessToken:'old',refreshToken:'refresh',expiresAt:0},scopes,'123','PROFILE',options,limited));
 const revoke=(async()=>new Response('{"revoked":true}',{status:200})) as typeof fetch;
 assert.equal((await revokeOAuth('X',{accessToken:'fixture',expiresAt:0},options,revoke)).revoked,true);
});

test('hero media validates GIF signatures, dimensions, frame structure and the 5 MB cap',()=>{
 const gif=Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64');
 const meta=inspectHeroGif(gif);assert.equal(meta.width,1);assert.equal(meta.height,1);assert.equal(meta.frameCount,1);
 assert.throws(()=>inspectHeroGif(Buffer.from('<svg onload=alert(1)>')));
 const huge=Buffer.alloc(5*1024*1024+1);assert.throws(()=>inspectHeroGif(huge));
 const oversized=Buffer.from(gif);oversized[6]=0xb1;oversized[7]=0x04;assert.throws(()=>inspectHeroGif(oversized));
});
