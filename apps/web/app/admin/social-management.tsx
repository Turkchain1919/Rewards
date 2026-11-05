'use client';
import SocialFieldHelp from './social-field-help';
import {T,useLanguage,translateText} from "../i18n";
import { useEffect, useState } from 'react';
type Platform = {
    platform: string;
    name: string;
    accountId: string;
    profileUrl: string | null;
    defaultTargetUrl: string | null;
    enabled: boolean;
    status: string;
    oauthStatus: string;
    apiStatus: string;
    missing: string[];
    apiMissing: string[];
    version: number;
    disabledOverride: boolean;
    lastSuccessfulConnection: string | null;
    lastApiError: string | null;
    availableTaskTypes: string[];
};
type Account = {
    id: string;
    platform: string;
    accountType: string;
    name: string;
    username: string;
    accountId: string;
    profileUrl: string;
    defaultTargetUrl: string;
    enabled: boolean;
    isDefault: boolean;
    connectionStatus: string;
    hasCredential: boolean;
    lastSuccessAt: string | null;
    lastError: string | null;
};
type Row = Record<string, unknown>;
export default function SocialManagement({ role,view }: {
    role: string;view?:string;
}) {
    const language=useLanguage(),text=(value:string)=>translateText(value,language);
    const [platforms, setPlatforms] = useState<Platform[]>([]), [accounts, setAccounts] = useState<Account[]>([]), [registry, setRegistry] = useState<{
        key: string;
        name: string;
        connector: string;
    }[]>([]), [personal, setPersonal] = useState<Row[]>([]), [edit, setEdit] = useState<Account | null>(null), [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [options, setOptions] = useState<Record<string, {
        accountId: string;
        name: string;
    }[]>>({});
    const [fieldPlatform,setFieldPlatform]=useState('');
    useEffect(()=>{setFieldPlatform(edit?.platform||'');},[edit?.id,edit?.platform]);
    const accountHelpPlatform=fieldPlatform||edit?.platform||registry[0]?.key||'TELEGRAM';
    async function api(path: string, method = 'GET', body?: unknown) { const r = await fetch('/api/admin/' + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }); const d = await r.json(); if (!r.ok)
        throw new Error([text(d.message || 'İşlem tamamlanamadı'), ...(Array.isArray(d.errors) ? d.errors.map((x: {field?: string; message?: string}) => (x.field ? x.field + ': ' : '') + text(x.message || 'Geçersiz değer')) : [])].join(' — ')); return d; }
    async function load() { const [p, a, r] = await Promise.all([api('integrations'), api('official-accounts'), api('social-platforms')]); setPlatforms(p); setAccounts(a); setRegistry(r); }
    useEffect(() => { const refresh=()=>void load().catch(e=>setError(e.message));refresh();window.addEventListener('admin-refresh',refresh);return()=>window.removeEventListener('admin-refresh',refresh); }, []);
    async function act(fn: () => Promise<unknown>) { setBusy(true); setError(''); setMessage(''); try {
        await fn();
        await load();
        setMessage('İşlem tamamlandı.');
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'İşlem tamamlanamadı');
    }
    finally {
        setBusy(false);
    } }
    return <section><h2><T value="Settings → Social Media Accounts & Integrations"/></h2><p><T value="Resmî proje hesapları ile kullanıcıların bağladığı kişisel hesaplar ayrı tutulur. API ve OAuth izinleri ayrı doğrulanır."/></p>{error && <div className="notice" role="alert">{error}</div>}{message && <p role="status">{message}</p>}<div className="actions"><button disabled={busy} onClick={() => void act(() => api('official-accounts/import-env', 'POST'))}><T value="Import ENV Accounts"/></button><button disabled={busy} onClick={() => void act(async () => setPersonal(await api('social-connections')))}><T value="View Connected Accounts"/></button></div>
 {view!=='platforms'&&<> <details className="panel"><summary><T value="Add Social Platform"/></summary><form onSubmit={e => { e.preventDefault(); const body = Object.fromEntries(new FormData(e.currentTarget)); void act(() => api('social-platforms', 'POST', body)); }}><label><T value="Platform anahtarı"/><input name="key" pattern="[A-Z][A-Z0-9_]{1,39}" required/></label><label><T value="Platform adı"/><input name="name" minLength={2} maxLength={100} required/></label><p><T value="Yeni platformlar metadata kaydı olarak eklenir. Resmî connector olmadan API veya OAuth doğrulanmış sayılmaz."/></p><button disabled={busy}><T value="Add Social Platform"/></button></form></details>
 <details className="panel" open={!!edit}><summary><T value={edit?'Edit Official Account':'Add Official Account'}/></summary><section><h3><T value={edit ? 'Edit Official Account' : 'Add Official Account'}/></h3><form key={edit?.id || 'new'} onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget), b = { platform: String(f.get('platform')), accountType: String(f.get('accountType')), name: String(f.get('name')), username: String(f.get('username')), accountId: String(f.get('accountId')), profileUrl: String(f.get('profileUrl')), defaultTargetUrl: String(f.get('defaultTargetUrl')), enabled: f.get('enabled') === 'on' }; void act(async () => { await api('official-accounts' + (edit ? '/' + edit.id : ''), edit ? 'PUT' : 'POST', b); setEdit(null); }); }}><label><T value="Platform"/><select name="platform" defaultValue={edit?.platform} onChange={e=>setFieldPlatform(e.target.value)}>{registry.map(p => <option key={p.key} value={p.key}>{p.name}</option>)}</select></label><div className="social-guided-field" data-social-field><label><T value="Hesap türü"/><select name="accountType" defaultValue={edit?.accountType || 'PROFILE'}>{['PROFILE', 'ACCOUNT', 'PROFESSIONAL_ACCOUNT', 'PAGE', 'CHANNEL', 'GROUP', 'BOT', 'GUILD', 'ORGANIZATION', 'REPOSITORY'].map(k => <option key={k}>{k}</option>)}</select></label><SocialFieldHelp platform={accountHelpPlatform} field="accountType"/></div>{[['name', 'Resmî hesap adı'], ['username', 'Kullanıcı adı'], ['accountId', 'Hesap / kanal / sunucu ID'], ['profileUrl', 'Profil URL'], ['defaultTargetUrl', 'Varsayılan görev hedefi']].map(([key, label]) => <div className="social-guided-field" data-social-field key={key}><label><T value={label}/><input name={key} aria-describedby={'official-help-'+key} defaultValue={edit?.[key as keyof Account] as string || ''} required={key === 'name'} maxLength={key.endsWith('Url') ? 2048 : 200}/></label><SocialFieldHelp platform={accountHelpPlatform} field={key} id={'official-help-'+key}/></div>)}<label className="checkbox"><input type="checkbox" name="enabled" defaultChecked={edit?.enabled}/><T value="Resmî hesap metadata kaydı etkin"/></label><button disabled={busy} className="button"><T value={edit ? 'Kaydet' : 'Add Official Account'}/></button>{edit && <button type="button" onClick={() => setEdit(null)}><T value="İptal"/></button>}</form></section></details>
 {accounts.map(a => <article className="panel" key={a.id}><h3>{a.name} · {a.platform}</h3><p>{a.accountType} · {a.accountId || 'ID bekleniyor'} · {a.connectionStatus} · <T value={a.isDefault ? 'Varsayılan hesap' : ''}/></p><p>{a.profileUrl && <a href={a.profileUrl} rel="noreferrer" target="_blank">{a.profileUrl} ↗</a>}</p><p><T value="Son bağlantı: "/>{a.lastSuccessAt || 'Henüz doğrulanmadı'}<T value=" · Son hata: "/>{a.lastError || 'Yok'}</p><small className="break"><T value="Hesap referansı: "/>{a.id}</small><div className="actions"><button onClick={() => setEdit(a)}><T value="Edit Account"/></button><button disabled={busy || !platforms.find(p => p.platform === a.platform)?.enabled} onClick={() => void act(async () => { const result=await api('official-accounts/' + a.id + '/connect', 'POST'); if(typeof result.url==='string')window.location.assign(result.url); })}><T value={a.hasCredential ? 'Reconnect Account' : 'Connect Account'}/></button><button disabled={busy || !a.hasCredential} onClick={() => void act(() => api('official-accounts/' + a.id + '/refresh', 'POST'))}><T value="Refresh Token"/></button><button disabled={busy} onClick={() => void act(() => api('official-accounts/' + a.id + '/disconnect', 'POST'))}><T value="Disconnect Account"/></button><button disabled={busy} onClick={() => {if(window.confirm(text('Bu sosyal hesabı kaldırmak istiyor musunuz?')))void act(() => api('official-accounts/' + a.id, 'DELETE'));}}><T value="Remove Account"/></button><button disabled={busy || a.isDefault} onClick={() => void act(() => api('official-accounts/' + a.id + '/default', 'POST'))}><T value="Change Default Account"/></button><button disabled={busy} onClick={() => void act(() => api('official-accounts/' + a.id + '/test', 'POST'))}><T value="Test API"/></button><button disabled={busy} onClick={() => void act(async () => { const result = await api('official-accounts/' + a.id + '/connection-options'); setOptions(o => ({ ...o, [a.id]: result })); })}><T value="View Permissions / Targets"/></button></div>{options[a.id]?.map(o => <button key={o.accountId} disabled={busy} onClick={() => void act(() => api('official-accounts/' + a.id + '/select-target', 'POST', { accountId: o.accountId }))}>{o.name}<T value=" · Seç"/></button>)}</article>)}
 </>}{view==='platforms'&&<><h3><T value="Settings → Social Integrations"/></h3>{platforms.map(p => <article className="panel" key={p.platform}><h3>{p.platform}</h3><p><T value="Entegrasyon: "/>{p.status}<T value=" · OAuth: "/>{p.oauthStatus}<T value=" · API: "/>{p.apiStatus}</p><p><T value="Resmî hesap: "/>{p.name || 'Tanımlanmamış'}<T value=" · ID: "/>{p.accountId || 'Tanımlanmamış'}</p><p><T value="Eksik yapılandırmalar: "/>{[...(p.missing || []), ...(p.apiMissing || [])].join(', ') || 'Yok'}</p><p><T value="Kullanılabilir ödüllü görev türleri: "/>{p.availableTaskTypes.length ? p.availableTaskTypes.join(', ') : 'Politika onayı olmadan etkin değil'}</p><p><T value="Son API hatası: "/>{p.lastApiError || 'Yok'}<T value=" · Son başarılı bağlantı: "/>{p.lastSuccessfulConnection || 'Henüz doğrulanmadı'}</p><button disabled={busy} onClick={() => void act(() => api('integrations/' + p.platform + '/test', 'POST'))}><T value="Test Connection"/></button>
 <details><summary><T value="Configure OAuth / Integration"/></summary><form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); void act(() => api('integrations/' + p.platform, 'PATCH', { version: p.version, disabled: false, enabledOverride: f.get('enabled') === 'on', callbackUrl: String(f.get('callbackUrl')) || null, graphVersion: String(f.get('graphVersion')) || null, name: null, profileUrl: null, accountId: null, defaultTargetUrl: null })); }}><label className="checkbox"><input type="checkbox" name="enabled" defaultChecked={p.enabled}/><T value="Entegrasyon etkin"/></label><div className="social-guided-field" data-social-field><label><T value="Callback URL (boş = ENV varsayılanı)"/><input name="callbackUrl" type="url"/></label><SocialFieldHelp platform={p.platform} field="callbackUrl"/></div><div className="social-guided-field" data-social-field><label><T value="Meta Graph version"/><input name="graphVersion" placeholder="vXX.X"/></label><SocialFieldHelp platform={p.platform} field="graphVersion"/></div><button disabled={busy}><T value="Apply Configuration"/></button></form></details>
 {role === 'OWNER' && <details><summary><T value="Configure API Credentials (şifreli)"/></summary><form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget), credentials = Object.fromEntries([...f].filter(([, v]) => String(v).trim())); e.currentTarget.reset(); void act(() => fetch('/api/admin/settings/credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scope: 'SOCIAL_PLATFORM', ownerId: p.platform, kind: 'OAUTH_CONFIG', value: JSON.stringify(credentials) }) }).then(async (r) => { const d = await r.json(); if (!r.ok)
            throw new Error(d.message); return d; })); }}>{['clientId', 'clientSecret', 'apiKey', 'apiSecret', 'accessToken', 'refreshToken', 'bearerToken', 'botToken', 'webhookSecret', 'pageAccessToken'].map(key => <div className="social-guided-field" data-social-field key={key}><label>{key}<T value=" (boş = değiştirme)"/><input name={key} aria-describedby={'legacy-help-'+p.platform+'-'+key} type="password" autoComplete="new-password"/></label><SocialFieldHelp platform={p.platform} field={key} id={'legacy-help-'+p.platform+'-'+key}/></div>)}<button disabled={busy}><T value="Şifreli kaydet"/></button></form></details>}
 </article>)}
 </>}{personal.length > 0 && <section className="panel"><h3><T value="Connected Personal Accounts"/></h3>{personal.map(p => <div className="row" key={String(p.id)}><span>{String(p.provider)} · {String(p.accountName)}</span><small className="break">{String(p.userId)} · {JSON.stringify(p.scopes)}</small></div>)}</section>}
 </section>;
}
