'use client';
import {T} from "../i18n";
import { useEffect, useRef, useState } from 'react';
import { formatUnits } from 'ethers';
import { useRuntime } from '../runtime';
type Task = {
 targetUrl?:string|null;
    id: string;
    title: string;
    rewardWei: string;
    verification: {
        instructions: string;
        minLength: number;
    };
    campaign: {
        title: string;
    };
};
type History = {
    id: string;
    taskId: string;
    createdAt: string;
    status: string;
    proof: string;
    reviewNote: string | null;
    task: {
        title: string;
    };
    reward: {
        status: string;
        amountWei: string;
    } | null;
};
export default function TaskBoard() {
    const { config, query } = useRuntime(), requestVersion = useRef(0);
    const formatEther = (v: string) => formatUnits(v, config?.currency.decimals ?? 18);
    const symbol = config?.currency.symbol || '';
    const [tasks, setTasks] = useState<Task[]>([]), [history, setHistory] = useState<History[]>([]), [balances, setBalances] = useState<Record<string, string> | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    async function load() { const version = ++requestVersion.current; try {
        const t = await fetch('/api/tasks' + query);
        if (!t.ok)
            throw new Error('Görevler yüklenemedi.');
        const tasks = await t.json();
        if (version !== requestVersion.current)
            return;
        setTasks(tasks);
        const l = await fetch('/api/me/ledger' + query);
        if (l.ok) {
            const ledger = await l.json();
            if (version !== requestVersion.current)
                return;
            setBalances(ledger.balances);
            const h = await fetch('/api/me/history' + query);
            if (!h.ok)
                throw new Error('Geçmiş yüklenemedi.');
            const history = await h.json();
            if (version !== requestVersion.current)
                return;
            setHistory(history);
        }
        else if (l.status === 401) {
            setBalances(null);
            setHistory([]);
        }
        else
            throw new Error('Ödül kayıtları yüklenemedi.');
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Yüklenemedi');
    } }
    useEffect(() => { setBalances(null); setTasks([]); setHistory([]); void load(); const listener = () => void load(); window.addEventListener('rewards-auth', listener); return () => window.removeEventListener('rewards-auth', listener); }, [query]);
    async function submit(id: string, proof: string) { setBusy(true); setError(''); try {
        const r = await fetch('/api/tasks/' + id + '/submit' + query, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proof }) });
        const d = await r.json();
        if (!r.ok)
            throw new Error(d.message || 'Başvuru gönderilemedi.');
        await load();
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Başvuru gönderilemedi.');
    }
    finally {
        setBusy(false);
    } }
    return <section>{error && <div className="notice" role="alert">{error}</div>}{balances && <><h2><T value="Ödül bakiyeleri"/></h2><div className="grid">{Object.entries(balances).map(([k, v]) => <article key={k}><span>{k}</span><h2>{formatEther(v)} {symbol}</h2></article>)}</div><p><T value="Bekleyen tutarlar onaylanana kadar kullanılabilir değildir. Ödül talepleri duraklatılmıştır."/></p></>}
 <h2><T value="Topluluk görevleri"/></h2>{tasks.length === 0 && <div className="notice"><T value="Henüz yayınlanmış görev yok."/></div>}{tasks.map(t => <article className="panel" key={t.id}><div className="eyebrow">{t.campaign.title}</div><h2>{t.title}</h2><p>{t.verification.instructions}</p>{t.targetUrl&&<p><a href={t.targetUrl} rel="noreferrer" target="_blank"><T value="Görev hedefini aç ↗"/></a></p>}<p><T value="Ödül: "/>{formatEther(t.rewardWei)} {symbol}<T value=" · Manuel doğrulama"/></p>{history.some(h => h.taskId === t.id) ? <p><T value="Başvurunuz geçmiş bölümünde."/></p> : balances ? <form onSubmit={e => { e.preventDefault(); const proof = String(new FormData(e.currentTarget).get('proof')); void submit(t.id, proof); }}><label><T value="Görev kanıtı"/><textarea name="proof" required minLength={t.verification.minLength} maxLength={2000}/></label><button className="button" disabled={busy}><T value="İncelemeye gönder"/></button></form> : <p><T value="Katılmak için yukarıdan cüzdanınızla giriş yapın."/></p>}</article>)}
 {balances && <><h2><T value="Görev geçmişi"/></h2>{history.length === 0 && <p><T value="Henüz görev başvurusu yok."/></p>}{history.map(h => <article className="panel" key={h.id}><h3>{h.task.title}</h3><p>{h.status} · {h.reward?.status} · {h.reward ? formatEther(h.reward.amountWei) : '0'} {symbol}</p><p>{h.reviewNote || 'İnceleme bekliyor.'}</p></article>)}</>}</section>;
}
