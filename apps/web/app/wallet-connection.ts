export type MobileBrowserHints={userAgent:string;maxTouchPoints?:number;platform?:string;userAgentData?:{mobile?:boolean}};
export function isMobileWalletBrowser(hints:MobileBrowserHints){return hints.userAgentData?.mobile===true||/Android|iPhone|iPad|iPod/i.test(hints.userAgent)||(/Macintosh|MacIntel/i.test(hints.userAgent+' '+(hints.platform||''))&&(hints.maxTouchPoints||0)>1);}
export function metaMaskDappLink(page:string,language:'tr'|'en'){
 const url=new URL(page);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error('Invalid application URL');
 // Send only this website's public address; never forward query strings, signatures or OAuth state.
 return 'https://link.metamask.io/dapp/'+url.host+'/'+language+'/dashboard#wallet-access';
}
export function walletConnectionError(error:unknown){const e=error as {code?:number|string;message?:string}|null;if(e?.code===4001||e?.code==='ACTION_REJECTED')return 'Cüzdan isteği reddedildi. Hazır olduğunuzda tekrar deneyin.';if(e?.code===-32002)return 'Cüzdanınızda bekleyen bağlantı isteğini açın.';return e?.message||'Cüzdan bağlantısı tamamlanamadı.';}

export function metaMaskPairingLink(uri:string){if(!/^wc:[a-f0-9]{64}@2\?/.test(uri)||uri.length>4096)throw new Error('Invalid pairing URI');return 'metamask://wc?uri='+encodeURIComponent(uri);}
