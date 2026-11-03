'use client';
import {T,useLanguage} from "../i18n";
import { useEffect, useRef, useState } from 'react';
import { formatUnits } from 'ethers';
import { useRuntime } from '../runtime';
type Task = {
 localizedContent?:import("../admin/lifecycle").Content;startsAt?:string|null;endsAt?:string|null;userStatus?:string;available?:boolean;
 rewardQuota?:{maxRewards:number;rewardedUsers:number;remainingRewards:number};
 targetUrl?:string|null;
 platform:string;
    id: string;
    title: string;
    rewardWei: string;
    verification: {
        type:string;
        instructions: string;
        minLength?: number;
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
    const language=useLanguage();
    const [verifying,setVerifying]=useState<string|null>(null),[failed,setFailed]=useState<string|null>(null);
    const { config, query } = useRuntime(), requestVersion = useRef(0);
    const formatEther = (v: string) => formatUnits(v, config?.currency.decimals ?? 18);
    const symbol = config?.currency.symbol || '';
    const [tasks, setTasks] = useState<Task[]>([]), [history, setHistory] = useState<History[]>([]), [balances, setBalances] = useState<Record<string, string> | null>(null), [linkedTelegram,setLinkedTelegram]=useState(false), [error, setError] = useState(''), [busy, setBusy] = useState(false);
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
            const board=await fetch('/api/me/tasks'+query);if(board.ok&&version===requestVersion.current)setTasks(await board.json());
            const linked=await fetch('/api/social/accounts');
            if(linked.ok){const providers=await linked.json();setLinkedTelegram(!!providers.find((p:{platform:string;account?:unknown})=>p.platform==='TELEGRAM'&&p.account));}
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
            setLinkedTelegram(false);
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
    async function connectTelegram(){setBusy(true);setError('');try{const r=await fetch('/api/social/telegram/connect',{method:'POST'});const d=await r.json();if(!r.ok||!d.url)throw new Error(d.message||'Telegram bağlantısı başlatılamadı.');window.location.assign(d.url);}catch(e){setError(e instanceof Error?e.message:'Telegram bağlantısı başlatılamadı.');setBusy(false);}}
    async function verifyTelegram(id:string){setBusy(true);setVerifying(id);setFailed(null);setError('');try{const r=await fetch('/api/tasks/'+id+'/verify-telegram'+query,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});const d=await r.json();if(!r.ok)throw new Error(d.message||'Telegram üyeliği doğrulanamadı.');await load();}catch(e){setFailed(id);setError(e instanceof Error?e.message:'Telegram üyeliği doğrulanamadı.');}finally{setBusy(false);setVerifying(null);}}
    return <section>{error && <div className="notice" role="alert">{error}</div>}{balances && <><h2><T value="Ödül bakiyeleri"/></h2><div className="grid">{Object.entries(balances).map(([k, v]) => <article key={k}><span>{k}</span><h2>{formatEther(v)} {symbol}</h2></article>)}</div><p><T value="Bekleyen tutarlar onaylanana kadar kullanılabilir değildir. Ödül talepleri duraklatılmıştır."/></p></>}
 <p className="notice"><T value="Ödüller önce platform içi AVAILABLE bakiyenize kaydedilir. Gerçek cüzdan transferleri şu anda kapalıdır. Her görev yalnızca bir kez ödül kazandırır."/></p>
 <h2><T value="Topluluk görevleri"/></h2>{tasks.length === 0 && <div className="notice"><T value="Henüz yayınlanmış görev yok."/></div>}{tasks.map(t => {
 const content=t.localizedContent?.[language],previous=history.find(h=>h.taskId===t.id),telegram=t.verification.type==='TELEGRAM_MEMBERSHIP';
 const notAvailable=t.available===false||t.userStatus==='EXPIRED'||!!t.startsAt&&new Date(t.startsAt)>new Date();
 const state=verifying===t.id?'Doğrulanıyor':failed===t.id||t.userStatus==='FAILED'?'Başarısız':previous?.status==='APPROVED'?'Tamamlandı':previous?.status==='PENDING'?'Doğrulama bekleniyor':previous?.status==='REJECTED'?'Başarısız':!balances||telegram&&!linkedTelegram?'Bağlantı gerekli':notAvailable?'Başlamadı':telegram?'Doğrulama bekleniyor':'Başlamadı';
 const defaults=telegram?['Cüzdanınızı bağlayın.','Telegram hesabınızı bağlayın.','Hedef gruba veya kanala katılın.','Üyeliğimi doğrula düğmesine basın.','Başarılı doğrulama sonrası ödülünüz AVAILABLE bakiyesine kaydedilir.']:['Cüzdanınızı bağlayın.','Görev talimatlarını tamamlayın.','Kanıtınızı incelemeye gönderin.','Onay sonrası ödülünüz AVAILABLE bakiyesine kaydedilir.'];
 return <article className="panel" key={t.id}><div className="eyebrow">{t.campaign.title}</div><h2>{content?.title||t.title}</h2><p role="status"><T value={state}/></p><p>{content?.description||t.verification.instructions}</p><h3><T value="Nasıl kazanılır?"/></h3><ol>{content?.steps?.length?content.steps.map((step,i)=><li key={i}>{step}</li>):defaults.map(step=><li key={step}><T value={step}/></li>)}</ol><h3><T value="Ödül koşulları"/></h3><p>{content?.rewardCondition||<T value="Görevi başarıyla doğrulayın. Aynı görevden ikinci kez ödül kazanılamaz."/>}</p>{t.targetUrl&&<p><a href={t.targetUrl} rel="noreferrer" target="_blank"><T value="Görev hedefini aç ↗"/></a></p>}{t.rewardQuota&&<p><T value="Kalan ödül kontenjanı"/>: {t.rewardQuota.remainingRewards} / {t.rewardQuota.maxRewards}</p>}<p><T value="Ödül: "/>{formatEther(t.rewardWei)} {symbol} · <T value={telegram?'Telegram üyelik doğrulaması':'Manuel doğrulama'}/></p>{(t.startsAt||t.endsAt)&&<p><T value="Görev tarihleri"/>: {t.startsAt?new Date(t.startsAt).toLocaleString(language):'—'} → {t.endsAt?new Date(t.endsAt).toLocaleString(language):'—'}</p>}{previous?<p><T value={previous.status==='APPROVED'?'Tamamlandı':previous.status==='PENDING'?'Doğrulama bekleniyor':'Başarısız'}/></p>:notAvailable?<p><T value="Görev tarih aralığı dışında."/></p>:balances?telegram?linkedTelegram?<button className="button" disabled={busy} onClick={()=>void verifyTelegram(t.id)}><T value="Telegram üyeliğimi doğrula ve ödülü al"/></button>:<button className="button" disabled={busy} onClick={()=>void connectTelegram()}><T value="Telegram hesabımı bağla"/></button>:<form onSubmit={e=>{e.preventDefault();void submit(t.id,String(new FormData(e.currentTarget).get('proof')));}}><label><T value="Görev kanıtı"/><textarea name="proof" required minLength={t.verification.minLength||20} maxLength={2000}/></label><button className="button" disabled={busy}><T value="İncelemeye gönder"/></button></form>:<p><T value="Katılmak için yukarıdan cüzdanınızla giriş yapın."/></p>}</article>;
 })}

 {balances && <><h2><T value="Görev geçmişi"/></h2>{history.length === 0 && <p><T value="Henüz görev başvurusu yok."/></p>}{history.map(h => <article className="panel" key={h.id}><h3>{h.task.title}</h3><p>{h.status} · {h.reward?.status} · {h.reward ? formatEther(h.reward.amountWei) : '0'} {symbol}</p><p>{h.reviewNote || 'İnceleme bekliyor.'}</p></article>)}</>}</section>;
}
