import test from 'node:test';
import assert from 'node:assert/strict';
import {isMobileWalletBrowser,metaMaskDappLink,walletConnectionError} from '../apps/web/app/wallet-connection';
test('mobile wallet detection includes Android, iOS and desktop-UA iPad without assuming a desktop touchscreen is a phone',()=>{
 for(const hints of [{userAgent:'Mozilla/5.0 (Linux; Android 14)'},{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18)'},{userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X)',platform:'MacIntel',maxTouchPoints:5},{userAgent:'Custom mobile',userAgentData:{mobile:true}}])assert.equal(isMobileWalletBrowser(hints),true);
 assert.equal(isMobileWalletBrowser({userAgent:'Mozilla/5.0 (Windows NT 10.0)',maxTouchPoints:10}),false);assert.equal(isMobileWalletBrowser({userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X)',maxTouchPoints:0}),false);
});
test('official MetaMask link opens this localized dapp only, without forwarding query secrets, address or transfer parameters',()=>{
 assert.equal(metaMaskDappLink('https://rewards.turkscan.com/tr/dashboard?code=private&state=private#unsafe','en'),'https://link.metamask.io/dapp/rewards.turkscan.com/en/dashboard#wallet-access');
 assert.equal(metaMaskDappLink('http://127.0.0.1:18480/dashboard','tr'),'https://link.metamask.io/dapp/127.0.0.1:18480/tr/dashboard#wallet-access');
 for(const url of ['javascript:alert(1)','https://user:secret@rewards.turkscan.com/'])assert.throws(()=>metaMaskDappLink(url,'tr'));
});
test('wallet rejections and already-pending approvals have distinct actionable messages',()=>{
 assert.match(walletConnectionError({code:4001,message:'User rejected'}),/reddedildi/);assert.match(walletConnectionError({code:-32002}),/bekleyen/);assert.equal(walletConnectionError({message:'Chain mismatch'}),'Chain mismatch');assert.match(walletConnectionError(null),/tamamlanamadı/);
});
