'use client';
import {T} from "../i18n";
import { useEffect, useState } from 'react';
import { formatUnits } from 'ethers';
import { useRuntime } from '../runtime';
type Provider = {
    request: (args: {
        method: string;
        params?: unknown[];
    }) => Promise<unknown>;
};
type Claim = {
    id: string;
    amountWei: string;
    status: string;
    deadline: string;
    transactionHash: string | null;
    lastError: string | null;
    recipient: string;
};
export default function Claims() {
    const { config, walletProvider } = useRuntime(), [claims, setClaims] = useState<Claim[]>([]), [user, setUser] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
    async function load() { const r = await fetch('/api/claims'); if (r.status === 401) {
        setUser(false);
        setClaims([]);
        return;
    } if (r.ok) {
        setUser(true);
        setClaims(await r.json());
    } }
    useEffect(() => { void load(); const listener = () => void load(); window.addEventListener('rewards-auth', listener); return () => window.removeEventListener('rewards-auth', listener); }, []);
    async function api(path: string, body?: unknown) { const r = await fetch('/api/claims/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); const d = await r.json(); if (!r.ok)
        throw new Error(d.message || 'İşlem tamamlanamadı'); return d; }
    async function action(fn: () => Promise<unknown>) { setBusy(true); setError(''); try {
        await fn();
        await load();
        window.dispatchEvent(new Event('rewards-auth'));
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'İşlem tamamlanamadı');
    }
    finally {
        setBusy(false);
    } }
    async function claim() {
        if (!config || config.claimsPaused)
            throw new Error('Ödül talepleri duraklatıldı.');
        const provider = walletProvider || (window as unknown as {
            ethereum?: Provider;
        }).ethereum;
        if (!provider)
            throw new Error('İşlem için EVM cüzdanını yeniden bağlayın.');
        const network = await provider.request({ method: 'eth_chainId' });
        if (String(network).toLowerCase() !== config.chainIdHex.toLowerCase())
            throw new Error('Cüzdan kurulum zinciriyle eşleşmiyor.');
        const authorization = await api('prepare');
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
        if (accounts[0]?.toLowerCase() !== authorization.message.recipient.toLowerCase())
            throw new Error('Cüzdan hesabı değişti; tekrar giriş yapın.');
        const hash = await provider.request({ method: 'eth_sendTransaction', params: [{ ...authorization.transaction, from: authorization.message.recipient }] });
        await api(authorization.id + '/transaction', { transactionHash: hash });
    }
    if (!user)
        return null;
    return <section><h2><T value="Native ödül talepleri"/></h2><div className="notice"><T value={config?.claimsPaused ? 'Ödül talepleri duraklatıldı. Mainnet kontrat dağıtımı ve gerçek ödemeler etkin değil.' : 'Ödül talebi cüzdanınızdan işlem onayı gerektirir. Ağ ücretini cüzdanınız öder.'}/></div>{error && <p role="alert">{error}</p>}<button className="button" disabled={busy || !config || config.claimsPaused} onClick={() => void action(claim)}><T value="Ödül talep et"/></button>{claims.map(c => <article className="panel" key={c.id}><h3>{formatUnits(c.amountWei, config?.currency.decimals ?? 18)} {config?.currency.symbol}</h3><p>{c.status} · {new Date(c.deadline).toLocaleString()}</p>{c.transactionHash && <p className="break">{config?.explorerUrl ? <a href={config.explorerUrl + '/tx/' + c.transactionHash} rel="noreferrer" target="_blank">{c.transactionHash} ↗</a> : c.transactionHash}</p>}{c.lastError && <p>{c.lastError}</p>}{['PREPARED', 'SUBMITTED'].includes(c.status) && <div className="actions"><button disabled={busy} onClick={() => void action(() => api(c.id + '/refresh'))}><T value="İşlemi kontrol et"/></button><button disabled={busy} onClick={() => void action(() => api(c.id + '/expire'))}><T value="Süresi dolan rezervi kontrol et"/></button></div>}</article>)}</section>;
}
