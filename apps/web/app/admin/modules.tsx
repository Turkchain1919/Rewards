'use client';
import {T} from "../i18n";
import { useEffect, useState } from 'react';
import { formatUnits, parseUnits } from 'ethers';
import { useRuntime } from '../runtime';
import SocialApi from './social-api';
import SocialManagement from './social-management';
import AdminSettings from './settings';
type Campaign = {
    id: string;
    title: string;
    description: string;
    budgetWei: string;
    allocatedWei: string;
    status: string;
    tasks: Task[];
};
type Task = {
 officialAccountId?:string|null;targetUrl?:string|null;
    id: string;
    campaignId: string;
    title: string;
    platform: string;
    kind: string;
    rewardWei: string;
    enabled: boolean;
    policyReviewed: boolean;
    verification: {
        instructions: string;
        minLength: number;
    };
};
type Submission = {
    id: string;
    proof: string;
    status: string;
    reviewNote: string | null;
    task: {
        title: string;
    };
    user: {
        wallet: string;
    };
    reward: {
        amountWei: string;
        status: string;
    } | null;
};
type Summary = {
    users: number;
    campaigns: number;
    tasks: number;
    pending: number;
    rewards: Record<string, string>;
};
type JsonRow = Record<string, unknown>;
type Ledger = {
    balances: Record<string, string>;
    entries: {
        id: string;
        amountWei: string;
        status: string;
        reason: string;
        user: {
            wallet: string;
        };
        events: {
            id: string;
            fromStatus: string;
            toStatus: string;
            reason: string;
        }[];
    }[];
};
type Integration = {
    platform: string;
    status: string;
    missing: string[];
    rewardedActionsEnabled: boolean;
};
export default function AdminModules({ role }: {
    role: string;
}) {
    const { config: runtime, query } = useRuntime();
    const decimals = runtime?.currency.decimals ?? 18, symbol = runtime?.currency.symbol || '';
    const formatEther = (v: string) => formatUnits(v, decimals), parseEther = (v: string) => parseUnits(v, decimals);
    const [tab, setTab] = useState(role === 'REVIEWER' ? 'submissions' : 'summary'), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const [summary, setSummary] = useState<Summary | null>(null), [campaigns, setCampaigns] = useState<Campaign[]>([]), [submissions, setSubmissions] = useState<Submission[]>([]), [rows, setRows] = useState<JsonRow[]>([]), [data, setData] = useState<unknown>(null);
    const [officialTargets,setOfficialTargets]=useState<{id:string;platform:string;name:string;isDefault:boolean;defaultTargetUrl:string}[]>([]);
    useEffect(()=>{void fetch('/api/admin/official-accounts').then(r=>r.ok?r.json():[]).then(setOfficialTargets);},[]);
    const [campaignEdit, setCampaignEdit] = useState<Campaign | null>(null), [taskEdit, setTaskEdit] = useState<Task | null>(null);
    async function api(path: string, method = 'GET', body?: unknown) { const r = await fetch('/api/admin/' + path + query, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); const d = await r.json(); if (!r.ok)
        throw new Error(d.message || 'İşlem tamamlanamadı'); return d; }
    async function load() { setError(''); if (tab.startsWith('settings/'))
        return; try {
        if (tab === 'claims')
            setRows(await api('claims'));
        else if (tab === 'summary')
            setSummary(await api('summary'));
        else if (tab === 'campaigns' || tab === 'tasks')
            setCampaigns(await api('campaigns'));
        else if (tab === 'submissions')
            setSubmissions(await api('submissions'));
        else if (['users', 'accounts', 'audit'].includes(tab))
            setRows(await api(tab));
        else
            setData(await api(tab));
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Yüklenemedi');
    } }
    useEffect(() => { void load(); }, [tab, query]); // deliberate tab-driven refresh
    async function act(path: string, method = 'POST', body?: unknown) { setBusy(true); setError(''); try {
        await api(path, method, body);
        setCampaignEdit(null);
        setTaskEdit(null);
        await load();
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'İşlem tamamlanamadı');
    }
    finally {
        setBusy(false);
    } }
    const tabs = role === 'REVIEWER' ? [['submissions', 'Doğrulamalar']] : [['summary', 'Genel bakış'], ['users', 'Kullanıcılar'], ['campaigns', 'Kampanyalar'], ['tasks', 'Görevler'], ['submissions', 'Doğrulamalar'], ['ledger', 'Ödüller'], ['claims', 'Claim işlemleri'], ['settings/social-api', 'Social API'], ['settings/social', 'Official Social Accounts'], ['system', 'Sistem'], ['audit', 'Denetim kayıtları'], ...(role === 'OWNER' ? [['accounts', 'Yönetici hesapları'], ['settings/blockchains', 'Settings / Blockchain Networks'], ['settings/branding', 'Settings / Branding & SEO'], ['settings/configuration', 'Settings / Configuration'], ['settings/credentials', 'Settings / API Credentials']] : [])];
    function form(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); return new FormData(e.currentTarget); }
    const tasks = campaigns.flatMap(c => c.tasks);
    const ledger = tab === 'ledger' && data ? data as Ledger : null;
    const integrations = tab === 'integrations' && Array.isArray(data) ? data as Integration[] : [];
    return <section><nav className="tabs" aria-label="Yönetim modülleri">{tabs.map(([key, label]) => <button className={tab === key ? 'selected' : ''} key={key} onClick={() => { setTab(key); setRows([]); setData(null); }}><T value={label}/></button>)}</nav><button disabled={busy} onClick={() => void load()}><T value="Verileri yenile"/></button>{error && <div role="alert" className="notice">{error}</div>}
 {tab === 'settings/social-api' ? <SocialApi role={role}/> : tab === 'settings/social' ? <SocialManagement role={role}/> : tab.startsWith('settings/') && <AdminSettings section={tab.split('/')[1]}/>}
 {tab === 'summary' && summary && <><div className="grid">{[['Kullanıcılar', summary.users], ['Kampanyalar', summary.campaigns], ['Görevler', summary.tasks], ['İnceleme bekleyen', summary.pending]].map(([k, v]) => <article key={k}><span>{k}</span><h2>{v}</h2></article>)}</div><div className="grid">{Object.entries(summary.rewards).map(([k, v]) => <article key={k}><span>{k}</span><h2>{formatEther(v)} {symbol}</h2></article>)}</div></>}
 {tab === 'campaigns' && <><section className="panel"><h2><T value={campaignEdit ? 'Kampanyayı düzenle' : 'Kampanya oluştur'}/></h2><form key={campaignEdit?.id || 'new'} onSubmit={e => { const f = form(e); try {
        void act('campaigns' + (campaignEdit ? '/' + campaignEdit.id : ''), campaignEdit ? 'PUT' : 'POST', { title: f.get('title'), description: f.get('description'), budgetWei: parseEther(String(f.get('budget'))).toString() });
    }
    catch {
        setError('Geçerli ' + symbol + ' tutarı girin.');
    } }}><label><T value="Başlık"/><input name="title" required minLength={3} maxLength={160} defaultValue={campaignEdit?.title}/></label><label><T value="Açıklama"/><textarea name="description" required minLength={10} maxLength={5000} defaultValue={campaignEdit?.description}/></label><label><T value="Bütçe · "/>{symbol}<input name="budget" inputMode="decimal" required defaultValue={campaignEdit ? formatEther(campaignEdit.budgetWei) : '0'}/></label><p><T value="Muhasebe bütçesi, fonlanmış bir kontrat bakiyesi değildir."/></p><button className="button" disabled={busy}><T value="Kaydet"/></button></form></section>{campaigns.map(c => <article className="panel" key={c.id}><h2>{c.title}</h2><p>{c.description}</p><p>{c.status}<T value=" · Bütçe "/>{formatEther(c.budgetWei)}<T value=" · Ayrılmış "/>{formatEther(c.allocatedWei)} {symbol}</p><div className="actions"><button onClick={() => setCampaignEdit(c)}><T value="Düzenle"/></button><button disabled={busy} onClick={() => void act('campaigns/' + c.id + '/publish')}><T value="Yayınla"/></button><button disabled={busy} onClick={() => void act('campaigns/' + c.id + '/pause')}><T value="Durdur"/></button></div></article>)}</>}
 {tab === 'tasks' && <><section className="panel"><h2><T value={taskEdit ? 'Görevi düzenle' : 'Görev oluştur'}/></h2><form key={taskEdit?.id || 'new'} onSubmit={e => { const f = form(e); try {
        void act('tasks' + (taskEdit ? '/' + taskEdit.id : ''), taskEdit ? 'PUT' : 'POST', { campaignId: f.get('campaignId'), title: f.get('title'), officialAccountId:String(f.get('officialAccountId')||'')||undefined,targetUrl:String(f.get('targetUrl')||'')||undefined,platform: f.get('platform'), kind: f.get('kind'), rewardWei: parseEther(String(f.get('reward'))).toString(), policyReviewed: f.get('policyReviewed') === 'on', verification: { type: 'MANUAL', instructions: f.get('instructions'), minLength: Number(f.get('minLength')) } });
    }
    catch {
        setError('Geçerli ' + symbol + ' tutarı girin.');
    } }}><label><T value="Kampanya"/><select name="campaignId" required defaultValue={taskEdit?.campaignId}>{campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label><T value="Başlık"/><input name="title" required minLength={3} maxLength={160} defaultValue={taskEdit?.title}/></label><label><T value="Platform"/><select name="platform" defaultValue={taskEdit?.platform || 'TURKCHAIN'}>{['TURKCHAIN', 'X', 'TELEGRAM', 'FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK'].map(p => <option key={p}>{p}</option>)}</select></label><label><T value="Resmî hedef hesabı"/><select name="officialAccountId" defaultValue={taskEdit?.officialAccountId||''}><option value="">ENV / varsayılan hesap</option>{officialTargets.map(a=><option key={a.id} value={a.id}>{a.platform} · {a.name}{a.isDefault?' · default':''}</option>)}</select></label><label><T value="Göreve özel hedef URL (boş = varsayılan)"/><input name="targetUrl" type="url" defaultValue={taskEdit?.targetUrl||''}/></label><label><T value="Görev türü"/><select name="kind" defaultValue={taskEdit?.kind || 'EDUCATION'}><option value="EDUCATION"><T value="EDUCATION"/></option><option value="SOCIAL_INTERACTION"><T value="SOCIAL_INTERACTION"/></option></select></label><label><T value="Ödül · "/>{symbol}<input name="reward" required inputMode="decimal" defaultValue={taskEdit ? formatEther(taskEdit.rewardWei) : '0'}/></label><label><T value="Doğrulama talimatları"/><textarea name="instructions" required minLength={10} maxLength={2000} defaultValue={taskEdit?.verification?.instructions}/></label><label><T value="En az kanıt uzunluğu"/><input name="minLength" type="number" min={20} max={500} defaultValue={taskEdit?.verification?.minLength || 20}/></label><label className="checkbox"><input name="policyReviewed" type="checkbox" defaultChecked={taskEdit?.policyReviewed}/><T value="Görev ve platform kuralları incelendi."/></label><p><T value="Harici platformlarda ödüllü etkileşim görevlerinin yayınlanması engellenir. İnceleme, yetkili yönetici tarafından manuel yapılır."/></p><button className="button" disabled={busy}><T value="Kaydet"/></button></form></section>{tasks.map(t => <article className="panel" key={t.id}><h2>{t.title}</h2><p>{t.platform} · {formatEther(t.rewardWei)} {symbol} · <T value={t.enabled ? 'Yayında' : 'Durduruldu'}/></p><div className="actions"><button disabled={t.enabled} onClick={() => setTaskEdit(t)}><T value="Düzenle"/></button><button disabled={busy} onClick={() => void act('tasks/' + t.id + '/publish')}><T value="Yayınla"/></button><button disabled={busy} onClick={() => void act('tasks/' + t.id + '/pause')}><T value="Durdur"/></button></div></article>)}</>}
 {tab === 'submissions' && <>{submissions.length === 0 && <p><T value="Henüz görev başvurusu yok."/></p>}{submissions.map(s => <article className="panel" key={s.id}><h2>{s.task.title}</h2><p className="break">{s.user.wallet}</p><blockquote>{s.proof}</blockquote><p>{s.status} · {s.reward ? formatEther(s.reward.amountWei) : '0'} {symbol}</p>{s.status === 'PENDING' ? <form onSubmit={e => { const f = form(e); void act('submissions/' + s.id + '/review', 'POST', { action: f.get('action'), note: f.get('note') }); }}><label><T value="Karar"/><select name="action"><option value="APPROVE"><T value="Onayla"/></option><option value="REJECT"><T value="Reddet"/></option></select></label><label><T value="İnceleme notu"/><textarea name="note" minLength={5} maxLength={1000} required/></label><button disabled={busy} className="button"><T value="Kararı kaydet"/></button></form> : <p>{s.reviewNote}</p>}</article>)}</>}
 {tab === 'users' && <div className="table-wrap"><table><thead><tr><th><T value="Cüzdan"/></th><th><T value="Profil"/></th><th><T value="Kayıt tarihi"/></th></tr></thead><tbody>{rows.map(r => <tr key={String(r.id)}><td className="break">{String(r.wallet)}</td><td>{String(r.displayName || '—')}</td><td>{new Date(String(r.createdAt)).toLocaleString()}</td></tr>)}</tbody></table></div>}
 {tab === 'accounts' && <><section className="panel"><h2><T value="Yönetici hesabı oluştur"/></h2><form onSubmit={e => { const f = form(e); void act('accounts', 'POST', Object.fromEntries(f)); }}><label><T value="E-posta"/><input name="email" type="email" required/></label><label><T value="İlk parola"/><input name="password" type="password" minLength={14} maxLength={128} autoComplete="new-password" required/></label><label><T value="Rol"/><select name="role"><option><T value="ADMIN"/></option><option><T value="REVIEWER"/></option></select></label><button className="button" disabled={busy}><T value="Hesap oluştur"/></button></form></section>{rows.map(r => <div key={String(r.id)} className="row"><span>{String(r.email)} · {String(r.role)} · <T value={r.enabled ? 'Etkin' : 'Kapalı'}/></span>{r.role !== 'OWNER' && <div className="actions"><button disabled={busy} onClick={() => void act('accounts/' + r.id, 'PATCH', { role: r.role, enabled: !r.enabled })}><T value={r.enabled ? 'Devre dışı bırak' : 'Etkinleştir'}/></button><button disabled={busy} onClick={() => void act('accounts/' + r.id, 'PATCH', { role: r.role === 'ADMIN' ? 'REVIEWER' : 'ADMIN', enabled: !!r.enabled })}><T value="Rolü değiştir"/></button></div>}</div>)}</>}
 {tab === 'claims' && rows.map(r => <article className="panel" key={String(r.id)}><h3>{formatEther(String(r.amountWei))} {symbol} · {String(r.status)}</h3><p className="break">{String(r.recipient)}</p><p className="break">{String(r.transactionHash || 'İşlem bekleniyor')}</p><p>{String(r.lastError || '')}</p></article>)}
 {tab === 'audit' && rows.map(r => <div className="row" key={String(r.id)}><span>{String(r.action)}</span><small className="break">{String(r.resource)} · {new Date(String(r.createdAt)).toLocaleString()}</small></div>)}
 {ledger && <><div className="grid">{Object.entries(ledger.balances).map(([k, v]) => <article key={k}><span>{k}</span><h2>{formatEther(v)} {symbol}</h2></article>)}</div>{ledger.entries.map(e => <article key={e.id} className="panel"><p className="break">{e.user.wallet}</p><h3>{formatEther(e.amountWei)} {symbol} · {e.status}</h3><p>{e.reason}</p><details><summary><T value="Durum geçmişi"/></summary>{e.events.map(event => <p key={event.id}>{event.fromStatus || '—'} → {event.toStatus} · {event.reason}</p>)}</details></article>)}</>}
 {integrations.map(i => <article className="panel" key={i.platform}><h2>{i.platform}</h2><p>{i.status}</p><p><T value="Eksik yapılandırma: "/>{i.missing.length ? i.missing.join(', ') : 'Yok'}</p><p><T value="Ödüllü etkileşim: "/><T value={i.rewardedActionsEnabled ? 'Etkin' : 'Kapalı'}/></p></article>)}
 {tab === 'system' && data !== null && <div className="panel"><h2><T value="Üretim servis durumu"/></h2>{Object.entries(data as JsonRow).map(([k, v]) => <div className="row" key={k}><span>{k}</span><strong className="break">{String(v)}</strong></div>)}</div>}
 </section>;
}
