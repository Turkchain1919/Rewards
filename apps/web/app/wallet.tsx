'use client';
import {QRCodeSVG} from 'qrcode.react';
import {T} from "./i18n";
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
    const attempt=useRef(0);
    const [uri,setUri]=useState('');
    const [status, setStatus] = useState(''), [profile, setProfile] = useState<Profile | null>(null), [busy, setBusy] = useState(false);
    useEffect(() => { void fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(setProfile); }, []);
    async function call(path: string, body: unknown) { const r = await fetch('/api/auth/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const d = await r.json(); if (!r.ok)
        throw new Error(d.message || 'İşlem tamamlanamadı'); return d; }
    async function connect(kind: 'metamask' | 'walletconnect') {
        const ticket=++attempt.current;
        setBusy(true);
        setStatus('');
        try {
            if (!config)
                throw new Error('Ağ yapılandırması yüklenemedi.');
            let p: Provider;
            if (kind === 'walletconnect') {
                if (!config.wallet.walletConnectEnabled || !config.wallet.walletConnectProjectId)
                    throw new Error('WalletConnect Project ID bekleniyor.');
                const {default:UniversalProvider}=await import('@walletconnect/universal-provider');
                const wc=await UniversalProvider.init({projectId:config.wallet.walletConnectProjectId,metadata:{name:config.branding.appName,description:config.branding.metaDescription,url:location.origin,icons:config.branding.logoUrl?[config.branding.logoUrl]:[]}});
                wc.on('display_uri',(value:string)=>{if(ticket===attempt.current)setUri(value);});
                const session=await wc.connect({namespaces:{eip155:{chains:['eip155:'+config.chainId],methods:['personal_sign','eth_sendTransaction'],events:['chainChanged','accountsChanged'],rpcMap:{[config.chainId]:config.rpcUrl}}},optionalNamespaces:{eip155:{chains:['eip155:'+config.chainId],methods:['wallet_switchEthereumChain','wallet_addEthereumChain','eth_signTypedData_v4'],events:['chainChanged','accountsChanged'],rpcMap:{[config.chainId]:config.rpcUrl}}}});
                if(ticket!==attempt.current){await wc.disconnect().catch(()=>{});throw new Error('Connection cancelled');}
                setUri('');
                const accounts=Object.values(session?.namespaces||{}).flatMap(n=>n.accounts).filter(a=>a.startsWith('eip155:'+config.chainId+':')).map(a=>a.split(':').at(-1)!);
                if(!accounts.length)throw new Error('Wallet does not support the configured chain');
                p={request:async(args)=>{if(args.method==='eth_accounts'||args.method==='eth_requestAccounts')return accounts;const result=await wc.request(args,'eip155:'+config.chainId);return args.method==='eth_chainId'?'0x'+BigInt(String(result)).toString(16):result;},disconnect:()=>wc.disconnect()};
            }
            else {
                if (!config.wallet.metamaskEnabled)
                    throw new Error('MetaMask bu ağ için kapalı.');
                const injected = (window as unknown as {
                    ethereum?: Provider;
                }).ethereum;
                if (!injected)
                    throw new Error('MetaMask veya uyumlu bir EVM cüzdanı yükleyin.');
                p = injected;
            }
            provider.current = p;
            setWalletProvider(p);
            const accounts = await p.request({ method: 'eth_requestAccounts' }) as string[];
            let chain = await p.request({ method: 'eth_chainId' });
            if (String(chain).toLowerCase() !== config.chainIdHex.toLowerCase()) {
                if (!config.wallet.autoSwitch)
                    throw new Error('Cüzdanı seçilen ağa geçirin.');
                try {
                    await p.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: config.chainIdHex }] });
                }
                catch (e) {
                    if ((e as {
                        code?: number;
                    }).code !== 4902 || !config.wallet.autoAdd)
                        throw e;
                    await p.request({ method: 'wallet_addEthereumChain', params: [{ chainId: config.chainIdHex, chainName: config.networkName, nativeCurrency: config.currency, rpcUrls: [config.rpcUrl], blockExplorerUrls: config.explorerUrl ? [config.explorerUrl] : [] }] });
                }
                chain = await p.request({ method: 'eth_chainId' });
            }
            if (String(chain).toLowerCase() !== config.chainIdHex.toLowerCase())
                throw new Error('Seçilen ağla cüzdan ağı eşleşmiyor.');
            const { message } = await call('challenge', { address: accounts[0], networkKey: config.networkKey });
            const hex = '0x' + Array.from(new TextEncoder().encode(message)).map(x => x.toString(16).padStart(2, '0')).join('');
            const signature = await p.request({ method: 'personal_sign', params: [hex, accounts[0]] });
            await call('verify', { signature });
            const r = await fetch('/api/auth/me');
            setProfile(await r.json());
            setStatus('İmzalı oturum açıldı. İşlem veya ödeme gönderilmedi.');
            window.dispatchEvent(new Event('rewards-auth'));
        }
        catch (e) {
            if(ticket===attempt.current)setStatus(e instanceof Error ? e.message : 'Cüzdan bağlantısı tamamlanamadı.');
        }
        finally {
            if(ticket===attempt.current)setBusy(false);
        }
    }
    async function logout() { await call('logout', {}); await provider.current?.disconnect?.(); provider.current = null; setWalletProvider(null); setProfile(null); setStatus('Oturum kapatıldı.'); window.dispatchEvent(new Event('rewards-auth')); }
    return <div className="wallet">{uri&&<div role="dialog" aria-modal="true" aria-label="WalletConnect QR" className="panel"><QRCodeSVG value={uri} size={240}/><p><T value="Cüzdanınızdan QR kodu okutun."/></p><button onClick={()=>{attempt.current++;setUri('');setBusy(false);}}><T value="Bağlantıyı iptal et"/></button></div>}<NetworkSelector />{profile ? <><div className="notice break">{profile.displayName || 'Topluluk üyesi'} · {profile.wallet}</div><form onSubmit={e => { e.preventDefault(); const displayName = new FormData(e.currentTarget).get('displayName'); void call('profile', { displayName }).then(() => fetch('/api/auth/me')).then(r => r.json()).then(setProfile).catch(e => setStatus(e.message)); }}><label><T value="Profil adı"/><input name="displayName" minLength={1} maxLength={60} defaultValue={profile.displayName || ''} required/></label><button className="button"><T value="Profili kaydet"/></button></form><button className="button secondary" onClick={() => void logout()}><T value="Çıkış yap"/></button><button disabled={busy||!config?.wallet.walletConnectProjectId} onClick={()=>void connect('walletconnect')}><T value="WalletConnect yeniden bağla"/></button></> : <div className="actions"><button disabled={busy || !config?.wallet.metamaskEnabled} className="button" onClick={() => void connect('metamask')}><T value="MetaMask ile güvenli giriş ↗"/></button><button disabled={busy || !config?.wallet.walletConnectEnabled || !config.wallet.walletConnectProjectId} className="button secondary" onClick={() => void connect('walletconnect')}><T value="WalletConnect"/></button></div>}<p role="status">{status}</p>{!config?.wallet.walletConnectProjectId && <small><T value="WalletConnect Project ID yapılandırması bekleniyor."/></small>}<p><small><T value="Giriş imzası ödeme yetkisi vermez. "/><T value={config?.claimsPaused ? 'Ödül talepleri kapalı.' : ''}/></small></p></div>;
}
