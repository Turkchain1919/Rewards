'use client';
import {QRCodeSVG} from 'qrcode.react';
import {T,useLanguage} from "./i18n";
import {isMobileWalletBrowser,metaMaskDappLink,metaMaskPairingLink,walletConnectionError} from './wallet-connection';
import { useEffect, useRef, useState } from 'react';
import { useRuntime, NetworkSelector } from './runtime';
type Provider = {
    request: (args: {
        method: string;
        params?: unknown[];
    }) => Promise<unknown>;
    disconnect?: () => Promise<void>;
};
type Profile = {
    wallet: string;
    displayName: string | null;
};
export default function Wallet() {
    const { config, setWalletProvider } = useRuntime(), provider = useRef<Provider | null>(null);
    const abortPairing=useRef<(()=>void)|null>(null);
    const attempt=useRef(0),discovered=useRef<Provider|null>(null);
    const language=useLanguage(),[mobile,setMobile]=useState(false),[hasInjected,setHasInjected]=useState(false),[ready,setReady]=useState(false);
    const mobileLink=typeof window==='undefined'?'':metaMaskDappLink(window.location.href,language);
    useEffect(()=>{setMobile(isMobileWalletBrowser(navigator));const detect=()=>{const p=(window as unknown as {ethereum?:Provider}).ethereum;if(p&&typeof p.request==='function'){discovered.current=p;setHasInjected(true);}};const announce=(event:Event)=>{const d=(event as CustomEvent<{info?:{rdns?:string};provider?:Provider}>).detail;if(d?.info?.rdns==='io.metamask'&&typeof d.provider?.request==='function'){discovered.current=d.provider;setHasInjected(true);}};detect();setReady(true);window.addEventListener('ethereum#initialized',detect);window.addEventListener('eip6963:announceProvider',announce);window.dispatchEvent(new Event('eip6963:requestProvider'));return()=>{attempt.current++;window.removeEventListener('ethereum#initialized',detect);window.removeEventListener('eip6963:announceProvider',announce);};},[]);
    const [uri,setUri]=useState('');
    const [status, setStatus] = useState(''), [profile, setProfile] = useState<Profile | null>(null), [busy, setBusy] = useState(false);
    useEffect(() => { void fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(setProfile); }, []);
    async function call(path: string, body: unknown) { const r = await fetch('/api/auth/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const d = await r.json(); if (!r.ok)
        throw new Error(d.message || 'İşlem tamamlanamadı'); return d; }
    async function connect(kind: 'metamask' | 'walletconnect') {
        const ticket=++attempt.current;
        setBusy(true);
        setStatus('Cüzdan onayı bekleniyor…');
        const current=()=>{if(ticket!==attempt.current)throw new Error('Connection cancelled');};
        try {
            if (!config)
                throw new Error('Ağ yapılandırması yüklenemedi.');
            if(kind==='metamask'&&mobile&&!discovered.current&&!(window as unknown as {ethereum?:Provider}).ethereum&&config.wallet.walletConnectEnabled)kind='walletconnect';
            let p: Provider;
            if (kind === 'walletconnect') {
                if (!config.wallet.walletConnectEnabled || !config.wallet.walletConnectProjectId)
                    throw new Error('WalletConnect Project ID bekleniyor.');
                const {default:UniversalProvider}=await import('@walletconnect/universal-provider');
                const wc=await UniversalProvider.init({logger:'silent',projectId:config.wallet.walletConnectProjectId,metadata:{name:config.branding.appName,description:config.branding.metaDescription,url:location.origin+'/'+language+'/dashboard',icons:config.branding.logoUrl?[config.branding.logoUrl]:[]}});
                abortPairing.current=()=>wc.abortPairingAttempt();
                wc.on('display_uri',(value:string)=>{if(ticket===attempt.current)setUri(value);});
                const session=await wc.connect({optionalNamespaces:{eip155:{chains:['eip155:'+config.chainId],methods:['personal_sign','wallet_switchEthereumChain','wallet_addEthereumChain'],events:['chainChanged','accountsChanged'],rpcMap:{[config.chainId]:config.rpcUrl}}}});
                if(!session||!Object.values(session.namespaces).some(namespace=>namespace.methods.includes('personal_sign')))throw new Error('Cüzdan giriş imzası iznini onaylamadı.');
                if(ticket!==attempt.current){await wc.disconnect().catch(()=>{});throw new Error('Connection cancelled');}
                setUri('');
                const accounts=Object.values(session?.namespaces||{}).flatMap(n=>n.accounts).filter(a=>a.startsWith('eip155:'+config.chainId+':')).map(a=>a.split(':').at(-1)!);
                if(!accounts.length)throw new Error('Wallet does not support the configured chain');
                p={request:async(args)=>{if(args.method==='eth_accounts'||args.method==='eth_requestAccounts')return accounts;const result=await wc.request(args,'eip155:'+config.chainId);return args.method==='eth_chainId'?'0x'+BigInt(String(result)).toString(16):result;},disconnect:()=>wc.disconnect()};
            }
            else {
                if (!config.wallet.metamaskEnabled)
                    throw new Error('MetaMask bu ağ için kapalı.');
                const injected = discovered.current||(window as unknown as {
                    ethereum?: Provider;
                }).ethereum;
                if (!injected){if(isMobileWalletBrowser(navigator)){setStatus('MetaMask uygulamasında bu sayfayı açıp giriş işlemini tamamlayın.');window.location.assign(metaMaskDappLink(window.location.href,language));return;}throw new Error('MetaMask veya uyumlu bir EVM cüzdanı yükleyin.');}
                p = injected;
            }
            current();
            const accounts = await p.request({ method: 'eth_requestAccounts' }) as string[];current();if(!Array.isArray(accounts)||!accounts.length)throw new Error('Cüzdan hesabı seçilmedi.');
            let chain = await p.request({ method: 'eth_chainId' });
            current();if (String(chain).toLowerCase() !== config.chainIdHex.toLowerCase()) {
                if (!config.wallet.autoSwitch)
                    throw new Error('Cüzdanı seçilen ağa geçirin.');
                try {
                    await p.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: config.chainIdHex }] });current();
                }
                catch (e) {
                    if ((e as {
                        code?: number;
                    }).code !== 4902 || !config.wallet.autoAdd)
                        throw e;
                    current();await p.request({ method: 'wallet_addEthereumChain', params: [{ chainId: config.chainIdHex, chainName: config.networkName, nativeCurrency: config.currency, rpcUrls: [config.rpcUrl], blockExplorerUrls: config.explorerUrl ? [config.explorerUrl] : [] }] });
                }
                chain = await p.request({ method: 'eth_chainId' });
            }
            current();if (String(chain).toLowerCase() !== config.chainIdHex.toLowerCase())
                throw new Error('Seçilen ağla cüzdan ağı eşleşmiyor.');
            const { message } = await call('challenge', { address: accounts[0], networkKey: config.networkKey });
            current();const hex = '0x' + Array.from(new TextEncoder().encode(message)).map(x => x.toString(16).padStart(2, '0')).join('');
            const signature = await p.request({ method: 'personal_sign', params: [hex, accounts[0]] });
            current();await call('verify', { signature });current();
            const r = await fetch('/api/auth/me');
            if(!r.ok)throw new Error('İmzalı oturum doğrulanamadı.');const me=await r.json();current();provider.current=p;setWalletProvider(p);setProfile(me);
            setStatus('İmzalı oturum açıldı. İşlem veya ödeme gönderilmedi.');
            window.dispatchEvent(new Event('rewards-auth'));
        }
        catch (e) {
            if(ticket===attempt.current)setStatus(walletConnectionError(e));
        }
        finally {
            if(ticket===attempt.current)setBusy(false);
        }
    }
    function cancel(){attempt.current++;abortPairing.current?.();abortPairing.current=null;setUri('');setBusy(false);setStatus('Cüzdan bağlantısı iptal edildi.');}
    async function logout() { await call('logout', {}); await provider.current?.disconnect?.(); provider.current = null; setWalletProvider(null); setProfile(null); setStatus('Oturum kapatıldı.'); window.dispatchEvent(new Event('rewards-auth')); }
    return <div className="wallet">{uri&&<div role="dialog" aria-modal="true" aria-label="WalletConnect QR" className="panel">{mobile?<><a className="button" href={metaMaskPairingLink(uri)}><T value="MetaMask'ta bağlantıyı onayla"/></a><p><T value="Onaydan sonra bu tarayıcıya dönün. Rewards burada açık kalır."/></p></>:<QRCodeSVG value={uri} size={240}/>}<p><T value="Cüzdanınızdan QR kodu okutun."/></p><button onClick={cancel}><T value="Bağlantıyı iptal et"/></button></div>}<NetworkSelector />{profile ? <><div className="notice break">{profile.displayName || <T value="Topluluk üyesi"/>} · {profile.wallet}</div><form onSubmit={e => { e.preventDefault(); const displayName = new FormData(e.currentTarget).get('displayName'); void call('profile', { displayName }).then(() => fetch('/api/auth/me')).then(r => r.json()).then(setProfile).catch(e => setStatus(e.message)); }}><label><T value="Profil adı"/><input name="displayName" minLength={1} maxLength={60} defaultValue={profile.displayName || ''} required/></label><button className="button"><T value="Profili kaydet"/></button></form><button className="button secondary" onClick={() => void logout()}><T value="Çıkış yap"/></button><button disabled={busy||!config?.wallet.walletConnectEnabled||!config?.wallet.walletConnectProjectId} onClick={()=>void connect('walletconnect')}><T value="WalletConnect yeniden bağla"/></button></> : <div className="actions">{mobile&&!hasInjected&&config?.wallet.metamaskEnabled&&!config.wallet.walletConnectEnabled?<a className="button" href={mobileLink} onClick={()=>setStatus('MetaMask uygulamasında bu sayfayı açıp giriş işlemini tamamlayın.')}><T value="MetaMask uygulamasında aç ↗"/></a>:<button disabled={busy || !ready || !config?.wallet.metamaskEnabled} className="button" onClick={() => void connect('metamask')}><T value={!ready?'Cüzdan hazırlanıyor…':busy?'Cüzdan onayı bekleniyor…':'MetaMask ile güvenli giriş ↗'}/></button>}<button disabled={busy || !ready || !config?.wallet.walletConnectEnabled || !config.wallet.walletConnectProjectId} className="button secondary" onClick={() => void connect('walletconnect')}><T value="WalletConnect"/></button></div>}{mobile&&!hasInjected&&<p className="wallet-mobile-help"><T value={config?.wallet.walletConnectEnabled?'MetaMask onayından sonra geldiğiniz tarayıcıya dönün; giriş burada tamamlanır.':'Mobilde MetaMask uygulamasında açın, ardından cüzdanınızı bağlayın.'}/></p>}{busy&&!uri&&mobile&&config?.wallet.walletConnectEnabled&&<a className="button secondary" href="metamask://"><T value="İmza isteği için MetaMask'ı aç"/></a>}{busy&&!uri&&<button onClick={cancel}><T value="Bağlantıyı iptal et"/></button>}<p role="status" aria-live="polite"><T value={status}/></p>{!mobile&&!hasInjected&&status&&<a href="https://metamask.io/download/" target="_blank" rel="noreferrer"><T value="MetaMask yükle / etkinleştir"/></a>}{(!config?.wallet.walletConnectEnabled||!config.wallet.walletConnectProjectId) && <small><T value="WalletConnect bağlantısı şu anda kullanılamıyor."/></small>}<p><small><T value="Giriş imzası ödeme yetkisi vermez. "/><T value={config?.claimsPaused ? 'Ödül talepleri kapalı.' : ''}/></small></p></div>;
}
