'use client';
import {T} from "../i18n";
import SocialIcon from '../social-icons';
import { useEffect, useState } from 'react';
type Social = {
    platform: string;
    ready: boolean;
    status: string;
    account: {
        accountName: string;lastError?:string|null;
        expiresAt: string | null;
        scopes: string[];
    } | null;
};
export default function SocialAccounts() {
    const [accounts, setAccounts] = useState<Social[]>([]), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    async function load() { const r = await fetch('/api/social/accounts'); if (r.ok)
        setAccounts(await r.json());
    else if (r.status === 401)
        setAccounts([]);
    else
        setError('Sosyal hesaplar yüklenemedi.'); }
    useEffect(() => { void load(); const listener = () => void load(); window.addEventListener('rewards-auth', listener); return () => window.removeEventListener('rewards-auth', listener); }, []);
    async function connect(p: string) { setBusy(true); setError(''); try {
        const r = await fetch('/api/social/' + p.toLowerCase() + '/connect', { method: 'POST' });
        const data = await r.json();
        if (!r.ok)
            throw new Error(data.message);
        window.location.assign(data.url);
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Bağlantı tamamlanamadı.');
        setBusy(false);
    } }
    async function disconnect(p: string) { setBusy(true); setError(''); try {
        const r = await fetch('/api/social/' + p.toLowerCase(), { method: 'DELETE' });
        if (!r.ok)
            throw new Error('Bağlantı kaldırılamadı.');
        await load();
        setError('Hesap bağlantısı kaldırıldı. Sağlayıcı ayarlarından uygulama iznini de kaldırabilirsiniz.');
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'İşlem tamamlanamadı.');
    }
    finally {
        setBusy(false);
    } }
    if (!accounts.length)
        return null;
    return <section><h2><T value="Sosyal hesaplar"/></h2><p><T value="Hesabınızı yalnızca görevin gerektirdiği platform için bağlayın. Telegram üyeliği sunucuda doğrulanır; bağlantı tek başına ödül kazandırmaz."/></p>{error && <div className="notice" role="status">{error}</div>}<p><T value="Hesap kaldırıldığında tokenlar iptal edilir. Tekrar ödülü önlemek için görevle ilişkili tek yönlü kimlik özeti korunur."/></p><div className="grid">{accounts.filter(a=>['X','YOUTUBE','INSTAGRAM','TELEGRAM','FACEBOOK','KICK','TWITCH','TIKTOK'].includes(a.platform)||!!a.account).map(a => <article key={a.platform}><h3><SocialIcon platform={a.platform}/>{a.platform}</h3>{a.account ? <><p>{a.account.accountName} · <T value={a.account.lastError==='REAUTH_REQUIRED'||a.account.expiresAt && new Date(a.account.expiresAt) < new Date() ? 'Yeniden bağlantı gerekli' : 'Bağlı'}/></p><button disabled={busy} onClick={() => void fetch('/api/social/' + a.platform.toLowerCase() + '/refresh', { method: 'POST' }).then(async (r) => { const d = await r.json(); if (!r.ok)
        throw new Error(d.message); await load(); }).catch(e => setError(e.message))}><T value="Token yenile"/></button><button disabled={busy||!a.ready} onClick={()=>void connect(a.platform)}><T value="Hesabı yeniden bağla"/></button><button disabled={busy} onClick={() => void disconnect(a.platform)}><T value="Bağlantıyı kaldır"/></button></> : <><p><T value={a.ready ? 'Bağlanmaya hazır' : 'API yapılandırması bekleniyor'}/></p><button disabled={busy || !a.ready} onClick={() => void connect(a.platform)}><T value="Hesabı bağla"/></button></>}</article>)}</div></section>;
}
