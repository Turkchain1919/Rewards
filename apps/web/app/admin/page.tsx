'use client';
import './admin.css';
import {T} from "../i18n";
import { useEffect, useState } from 'react';
import AdminModules from './modules';
import AdminShell,{useAdminRoute} from './shell';
type Admin = {
    email: string;
    role: string;
    mfaVerified: boolean;
    enrolled: boolean;
};
type Session = {
    id: string;
    createdAt: string;
    expiresAt: string;
    current: boolean;
};
export default function AdminPage() {
    const [me, setMe] = useState<Admin | null>(null), [setup, setSetup] = useState(false), [error, setError] = useState(''), [busy, setBusy] = useState(false), [mfa, setMfa] = useState<{
        secret: string;
        uri: string;
    } | null>(null), [sessions, setSessions] = useState<Session[]>([]);
    async function api(path: string, method = 'GET', body?: unknown) { const r = await fetch('/api/admin/' + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); const data = await r.json(); if (!r.ok)
        throw new Error(typeof data.message === 'string' ? data.message : 'İşlem tamamlanamadı'); return data; }
    async function refresh() { try {
        setMe(await api('me'));
    }
    catch {
        setMe(null);
    } try {
        setSetup((await api('setup-status')).setupRequired);
    }
    catch { } }
    useEffect(() => { void refresh(); }, []);
    async function action(fn: () => Promise<void>) { setBusy(true); setError(''); try {
        await fn();
        await refresh();
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'İşlem tamamlanamadı');
    }
    finally {
        setBusy(false);
    } }
    function values(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); return Object.fromEntries(new FormData(e.currentTarget)); }
    const {route,navigate}=useAdminRoute(me?.role||'ADMIN');
    if(me?.mfaVerified)return <AdminShell me={me} route={route} navigate={navigate} onRefresh={()=>{if(route.module==='security'&&route.view==='sessions')void action(async()=>setSessions(await api('sessions')));else if(route.module==='security')void refresh();else window.dispatchEvent(new Event('admin-refresh'));}} onLogout={()=>void action(async()=>{await api('logout','POST');setMe(null);setSessions([]);setMfa(null);})}>{error&&<p role="alert" className="notice">{error}</p>}{route.module==='security'?<>{route.view==='password'&&<section className="panel"><h2><T value="Parola değiştir"/></h2><form onSubmit={e => { const b = values(e); void action(async () => { await api('password', 'POST', b); }); }}><label><T value="Mevcut parola"/><input name="currentPassword" type="password" autoComplete="current-password" required/></label><label><T value="Yeni parola"/><input name="newPassword" type="password" minLength={14} maxLength={128} autoComplete="new-password" required/></label><button disabled={busy} className="button"><T value="Parolayı güncelle"/></button></form></section>}{route.view==='sessions'&&<section className="panel"><h2><T value="Oturum yönetimi"/></h2><button className="button" onClick={() => void action(async () => setSessions(await api('sessions')))}><T value="Oturumları getir"/></button>{sessions.map(s => <div key={s.id} className="row"><span>{new Date(s.createdAt).toLocaleString()} <T value={s.current ? '· Bu oturum' : ''}/></span><button onClick={() => void action(async () => { await api('sessions/' + s.id, 'DELETE'); setSessions(await api('sessions')); })}><T value="Sonlandır"/></button></div>)}</section>}{route.view==='mfa'&&<section className="panel"><h2>MFA</h2><p><T value="MFA doğrulandı"/></p><p>{me.role}</p><p><T value="Bu ekran mevcut oturum durumunu gösterir. MFA güvenlik kuralları korunur."/></p></section>}</>:<AdminModules role={me.role} route={route} navigate={navigate}/>}</AdminShell>;
    return <main className="admin-auth"><div className="eyebrow"><T value="ADMIN / GÜVENLİ YÖNETİM"/></div><h1><T value="Yönetim merkezi"/></h1><p><T value="Parola, zorunlu çok faktörlü doğrulama ve rol tabanlı erişim."/></p>{error && <div className="notice" role="alert">{error}</div>}
 {!me && <section className="grid auth-grid"><article><h2><T value="Yönetici girişi"/></h2><form onSubmit={e => { const b = values(e); void action(async () => { await api('login', 'POST', b); }); }}><label><T value="E-posta"/><input name="email" type="email" autoComplete="username" required/></label><label><T value="Parola"/><input name="password" type="password" autoComplete="current-password" required/></label><button className="button" disabled={busy}><T value="Giriş yap"/></button></form></article>{setup && <article><h2><T value="İlk yönetici kurulumu"/></h2><p><T value="Kurulum anahtarı sunucudaki korumalı dosyadadır. İlk hesap oluşturulduğunda bu yol kapanır."/></p><form onSubmit={e => { const b = values(e); void action(async () => { await api('bootstrap', 'POST', b); setError('Hesap oluşturuldu. Parolanızla giriş yapıp MFA kurulumunu tamamlayın.'); }); }}><label><T value="Kurulum anahtarı"/><input name="token" type="password" autoComplete="off" required/></label><label><T value="E-posta"/><input name="email" type="email" autoComplete="username" required/></label><label><T value="Parola (en az 14 karakter)"/><input name="password" type="password" minLength={14} maxLength={128} autoComplete="new-password" required/></label><button className="button" disabled={busy}><T value="İlk hesabı oluştur"/></button></form></article>}</section>}
 {me && !me.mfaVerified && <section className="panel"><h2><T value="İkinci doğrulama"/></h2>{!me.enrolled && <><p><T value="Authenticator uygulamanıza aşağıdaki kurulumu ekleyin."/></p><button className="button" disabled={busy} onClick={() => void action(async () => setMfa(await api('mfa/enroll', 'POST')))}><T value="MFA kurulumunu başlat"/></button>{mfa && <div className="notice"><p><T value="Kurulum anahtarı — güvenli saklayın:"/></p><code className="break">{mfa.secret}</code><p><a href={mfa.uri}><T value="Authenticator uygulamasında aç ↗"/></a></p></div>}</>}<form onSubmit={e => { const b = values(e); void action(async () => { await api('mfa/verify', 'POST', b); setMfa(null); }); }}><label><T value="6 haneli kod"/><input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required/></label><button className="button" disabled={busy}><T value="Doğrula"/></button></form></section>}

 {me && <button className="button secondary" disabled={busy} onClick={() => void action(async () => { await api('logout', 'POST'); setMe(null); setSessions([]); setMfa(null); })}><T value="Çıkış yap"/></button>}</main>;
}
