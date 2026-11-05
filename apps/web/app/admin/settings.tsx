'use client';
import {uiError} from './ui';
import {socialCredentialFields} from './social-field-guides';
import {T,useLanguage} from "../i18n";
import { useEffect, useState } from 'react';
type Row = Record<string, unknown>;
type Network = {
    id: string;
    networkKey: string;
    networkName: string;
    chainId: string;
    enabled: boolean;
    isActive: boolean;
    version: number;
    config: Row;
    verification: unknown;
};
const groups: [
    string,
    [
        string,
        string,
        string
    ][]
][] = [
    ['General', [['networkKey', 'Ağ anahtarı', 'text'], ['networkName', 'Ağ adı', 'text'], ['chainType', 'Blockchain türü', 'text'], ['chainId', 'Chain ID', 'text'], ['chainIdHex', 'Hex Chain ID', 'text'], ['networkType', 'mainnet / testnet', 'text'], ['description', 'Açıklama', 'text'], ['logoUrl', 'Logo URL', 'text']]],
    ['RPC', [['rpcHttp', 'RPC HTTP URL', 'text'], ['rpcFallbacks', 'Yedek RPC URL’leri (satır başına bir URL)', 'array'], ['rpcWss', 'WebSocket URL', 'text'], ['rpcTimeoutMs', 'RPC timeout (ms)', 'number'], ['rpcRetries', 'RPC tekrar sayısı', 'number'], ['walletRpcHttp', 'Cüzdan için public RPC (isteğe bağlı)', 'text']]],
    ['Currency', [['currencyName', 'Para birimi adı', 'text'], ['currencySymbol', 'Para birimi simgesi', 'text'], ['currencyDecimals', 'Ondalık basamak', 'number']]],
    ['Explorer', [['explorerName', 'Explorer adı', 'text'], ['explorerUrl', 'Explorer URL', 'text'], ['explorerApiUrl', 'Explorer API URL', 'text'], ['transactionUrlPattern', 'İşlem URL kalıbı', 'text'], ['addressUrlPattern', 'Adres URL kalıbı', 'text'], ['contractUrlPattern', 'Kontrat URL kalıbı', 'text']]],
    ['Wallet', [['metamaskEnabled', 'MetaMask', 'boolean'], ['walletConnectEnabled', 'WalletConnect', 'boolean'], ['walletConnectProjectId', 'WalletConnect Project ID', 'text'], ['autoAddNetwork', 'Ağı otomatik ekle', 'boolean'], ['autoSwitchNetwork', 'Ağı otomatik değiştir', 'boolean']]],
    ['Rewards', [['rewardContractAddress', 'Ödül kontratı adresi', 'text'], ['rewardSignerAddress', 'Claim imzalayıcı adresi', 'text'], ['expectedBytecodeHash', 'Onaylanan kontrat bytecode hash', 'text'], ['claimEnabled', 'Claim talebi (ayrıca sahibi onayı gerekir)', 'boolean'], ['claimMinAmount', 'Minimum claim (base units)', 'text'], ['claimMaxAmount', 'Maksimum claim (base units, boş = sınırsız)', 'text'], ['claimExpirySeconds', 'Claim süresi (saniye)', 'number'], ['confirmationBlocks', 'Gerekli onay sayısı', 'number'], ['gasSponsorshipEnabled', 'Gas sponsorluğu talebi', 'boolean']]],
    ['Security', [['networkValidation', 'RPC doğrulama', 'boolean'], ['requireChainIdMatch', 'Chain ID eşleşmesi', 'boolean'], ['autoPauseOnNetworkChange', 'Ağ değişikliğinde claim durdur', 'boolean']]]
];
const brandFields: [
    string,
    string,
    string
][] = [['homepageTitleEn', 'Homepage title (EN)', 'text'], ['homepageTitleTr', 'Ana sayfa başlığı (TR)', 'text'], ['metaDescriptionEn', 'Meta description (EN)', 'text'], ['metaDescriptionTr', 'Meta açıklaması (TR)', 'text'], ['footerEn', 'Footer (EN)', 'text'], ['footerTr', 'Alt bilgi (TR)', 'text'], ['appName', 'Uygulama adı', 'text'], ['brandName', 'Marka adı', 'text'], ['logoUrl', 'Logo URL', 'text'], ['faviconUrl', 'Favicon URL', 'text'], ['ogImageUrl', 'Sosyal paylaşım görseli', 'text'], ['primaryColor', 'Ana renk (#RRGGBB)', 'text'], ['homepageTitle', 'Ana sayfa başlığı', 'text'], ['metaDescription', 'Meta açıklaması', 'text'], ['keywords', 'Anahtar kelimeler', 'text'], ['footer', 'Alt bilgi', 'text'], ['supportEmail', 'Destek e-postası', 'text'], ['officialWebsite', 'Resmî web sitesi', 'text'], ['defaultLanguage', 'Varsayılan dil (en/tr)', 'text'], ['supportedLanguages', 'Desteklenen diller (satır başına)', 'array']];
export default function AdminSettings({ section,focusGroup }: {
    section: string;focusGroup?:string;
}) {
    const language=useLanguage();
    const [networks, setNetworks] = useState<Network[]>([]), [form, setForm] = useState<Row | null>(null), [edit, setEdit] = useState<Network | null>(null), [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [details, setDetails] = useState<unknown>(null), [history, setHistory] = useState<Row[]>([]), [credentials, setCredentials] = useState<Row[]>([]);
    async function api(path: string, method = 'GET', body?: unknown) { const r = await fetch('/api/admin/settings/' + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }); const d = await r.json(); if (!r.ok)
        throw new Error(uiError(d.message || 'İşlem tamamlanamadı',language)); return d; }
    async function load() { setError(''); try {
        setNetworks(await api('blockchains'));
        if (section === 'branding')
            setForm(await api('branding'));
        if (section === 'configuration')
            setDetails(await api('effective'));
        if (section === 'credentials')
            setCredentials(await api('credentials'));
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Yüklenemedi');
    } }
    useEffect(() => { setForm(null); setEdit(null); setDetails(null); void load(); const refresh=()=>void load();window.addEventListener('admin-refresh',refresh);return()=>window.removeEventListener('admin-refresh',refresh); }, [section]);
    async function action(fn: () => Promise<unknown>) { setBusy(true); setError(''); setMessage(''); try {
        const d = await fn();
        setMessage('Yapılandırma işlemi tamamlandı.');
        if (d)
            setDetails(d);
        await load();
        window.dispatchEvent(new Event('rewards-config'));
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'İşlem tamamlanamadı');
    }
    finally {
        setBusy(false);
    } }
    function field([key, label, type]: [
        string,
        string,
        string
    ]) { const value = form?.[key]; const control=<label key={key} className={type === 'boolean' ? 'checkbox' : ''}>{type === 'boolean' ? <><input type="checkbox" checked={!!value} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}/>{label}</> : <><T value={label}/>{type === 'array' ? <textarea value={Array.isArray(value) ? value.join('\n') : ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))}/> : <input type={type} value={String(value ?? '')} disabled={!!edit && ['networkKey', 'chainId', 'chainType'].includes(key)} onChange={e => { const v = type === 'number' ? Number(e.target.value) : e.target.value; setForm(f => ({ ...f, [key]: v, ...(key === 'chainId' ? { chainIdHex: /^[1-9][0-9]{0,15}$/.test(String(v)) ? '0x' + BigInt(String(v)).toString(16) : '' } : {}) })); }}/>}</>}</label>; if(key!=='walletConnectProjectId')return control;return <div key={key} className="social-guided-field" data-social-field>{control}<div className="social-field-help" role="note"><div><p>{language==='tr'?'Project ID, Reown Dashboard içindeki projenizin kimliğidir. Mevcut değeri görmek için kayıtlı ağın Düzenle ekranını açın.':'Project ID identifies your project in Reown Dashboard. Open Edit on the existing network to view the stored value.'}</p><a href="https://dashboard.reown.com/" target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{language==='tr'?'Reown proje panelini aç':'Open Reown project dashboard'} ↗</a>{' · '}<a href="https://docs.reown.com/cloud/relay" target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{language==='tr'?'Project ID ve origin izinleri':'Project ID and allowed origins'} ↗</a></div></div></div>; }
    return <section className="panel"><h2>{section === 'blockchains' ? 'Blockchain Networks' : section === 'branding' ? 'Branding & SEO' : section === 'credentials' ? 'API Credentials' : 'Configuration Management'}</h2>{error && <div className="notice" role="alert">{error}</div>}{message && <p role="status">{message}</p>}<button onClick={() => void load()} disabled={busy}><T value="Yenile"/></button>
 {section === 'blockchains' && <><button className="button" onClick={() => { const template = networks.find(n => n.isActive)?.config || {}; setEdit(null); setForm({ ...template, networkKey: '', networkName: '', chainId: '', chainIdHex: '', rpcHttp: '', rpcFallbacks: [], rpcWss: '', rewardContractAddress: '', rewardSignerAddress: '', expectedBytecodeHash: '', claimEnabled: false }); }}><T value="Add Blockchain"/></button>{networks.map(n => <article className="panel" key={n.id}><h3>{n.networkName}</h3><p>{n.networkKey}<T value=" · Chain "/>{n.chainId} · {n.isActive ? 'Aktif' : n.enabled ? 'Etkin' : 'Kapalı'}</p><div className="actions"><button onClick={() => { setEdit(n); setForm(n.config); }}><T value="Edit Blockchain"/></button><button disabled={busy || n.isActive} onClick={() => void action(() => api('blockchains/' + n.id + (n.enabled ? '/disable' : '/enable'), 'POST'))}><T value={n.enabled ? 'Disable Blockchain' : 'Enable Blockchain'}/></button><button disabled={busy || n.isActive || !n.enabled} onClick={() => { const confirmation = window.prompt('Onay için ACTIVATE ' + n.networkKey + ' yazın. Claim işlemleri durdurulacaktır.'); if (!confirmation)
            return; const mfaCode = window.prompt('Yeni, kullanılmamış MFA kodunu girin.'); if (!mfaCode)
            return; void action(() => api('blockchains/' + n.id + '/activate', 'POST', { confirmation, mfaCode })); }}><T value="Set Active Blockchain"/></button><button disabled={busy || n.enabled || n.isActive} onClick={() => void action(() => api('blockchains/' + n.id, 'DELETE'))}><T value="Delete Blockchain"/></button>{[['rpc', 'Test RPC / Verify Chain ID'], ['wss', 'Test WebSocket'], ['explorer', 'Test Explorer'], ['contract', 'Verify Reward Contract']].filter(([kind])=>focusGroup==='RPC'?['rpc','wss'].includes(kind):focusGroup==='Rewards'?kind==='contract':true).map(([kind, label]) => <button disabled={busy} key={kind} onClick={() => void action(() => api('blockchains/' + n.id + '/test/' + kind, 'POST'))}><T value={label}/></button>)}<button onClick={() => setDetails(n)}><T value="View Blockchain Details"/></button></div></article>)}
 {form && <form className="wide-form" onSubmit={e => { e.preventDefault(); void action(() => api('blockchains' + (edit ? '/' + edit.id : ''), edit ? 'PUT' : 'POST', edit ? { config: form, version: edit.version } : form)); }}><h3><T value={edit ? 'Edit Blockchain' : 'Add Blockchain'}/></h3>{groups.map(([label, fields]) => <details key={label} className="panel" open={label===(focusGroup||'General')}><summary><T value={label}/></summary><fieldset><legend className="sr-only"><T value={label}/></legend><div className="form-grid">{fields.map(field)}</div></fieldset></details>)}<p><T value="Özel anahtarlar bu formda görüntülenmez. Kayıttan sonra API Credentials bölümünde şifreli olarak eklenebilir."/></p><button disabled={busy} className="button"><T value="Apply Configuration"/></button></form>}</>}
 {section === 'branding' && form && <form className="wide-form" onSubmit={e => { e.preventDefault(); void action(() => api('branding', 'PUT', form)); }}>{[['Marka kimliği',['appName','brandName','logoUrl','faviconUrl','ogImageUrl','primaryColor']],['İçerik ve SEO',['homepageTitleEn','homepageTitleTr','metaDescriptionEn','metaDescriptionTr','footerEn','footerTr','homepageTitle','metaDescription','keywords','footer']],['Dil ve destek',['supportEmail','officialWebsite','defaultLanguage','supportedLanguages']]].map(([title,keys],index)=><details className="panel" key={String(title)} open={index===0}><summary><T value={String(title)}/></summary><div className="form-grid">{brandFields.filter(([key])=>(keys as string[]).includes(key)).map(field)}</div></details>)}<button disabled={busy} className="button"><T value="Apply Configuration"/></button></form>}
 {section === 'configuration' && <><div className="actions">{[['env/validate', 'Validate ENV Configuration'], ['reload', 'Reload Configuration']].map(([path, label]) => <button disabled={busy} key={path} onClick={() => void action(() => api(path, 'POST'))}><T value={label}/></button>)}<a className="button" href="/api/admin/settings/env/template"><T value="Export ENV Template"/></a><button onClick={() => void action(async () => { setHistory(await api('history')); })}><T value="View Configuration History"/></button><button onClick={() => void action(() => api('effective'))}><T value="View Effective Configuration"/></button></div><form onSubmit={e => { e.preventDefault(); const section = String(new FormData(e.currentTarget).get('section')); void action(() => api('env/import', 'POST', { section })); }}><label><T value="ENV import bölümü"/><select name="section"><option value="network"><T value="Network"/></option><option value="branding"><T value="Branding"/></option></select></label><button disabled={busy}><T value="Import ENV Configuration"/></button></form><div className="notice"><T value="Bu kurulum .env içinde tanımlanan tek zincire kilitlidir. Çoklu zincir modu ve kullanıcı ağ seçimi kapalıdır. Başka bir zincir için ayrı kurulum ve veritabanı kullanın."/></div>{history.map(r => <div className="row" key={String(r.id)}><span>{String(r.action)}</span><small className="break">{String(r.resource)}</small></div>)}</>}
 {section === 'credentials' && <><p><T value="Yeni değerler şifrelenerek saklanır; kayıtlı anahtarlar veya tokenlar geri döndürülmez."/></p><form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget), b = Object.fromEntries(f); e.currentTarget.reset(); void action(() => api('credentials', 'POST', b)); }}><label><T value="Kapsam"/><select name="scope"><option><T value="NETWORK"/></option><option><T value="SOCIAL_PLATFORM"/></option><option><T value="OFFICIAL_ACCOUNT"/></option></select></label><div className="social-guided-field" data-social-field><label><T value="Ağ / hesap ID veya platform anahtarı"/><input name="ownerId" required list="network-ids"/><datalist id="network-ids">{networks.map(n => <option key={n.id} value={n.id}>{n.networkName}</option>)}{Object.keys(socialCredentialFields).map(key=><option key={key} value={key}>{key}</option>)}</datalist></label><div className="social-field-help" role="note"><div><p>{language==='tr'?'SOCIAL_PLATFORM için listeden platform anahtarını seçin (ör. TELEGRAM). OFFICIAL_ACCOUNT için Resmî sosyal hesaplar kartındaki hesap referansını kullanın; bu değer sağlayıcının Chat ID / kanal ID değeri değildir. NETWORK için kayıtlı ağ ID kullanılır.':'For SOCIAL_PLATFORM choose a platform key (for example TELEGRAM). For OFFICIAL_ACCOUNT use the account reference shown on the Official social accounts card, separate from the provider Chat ID / channel ID. NETWORK uses the registered network ID.'}</p><a href="#social/accounts">{language==='tr'?'Resmî hesap referanslarını gör':'View official account references'} →</a></div></div></div><label><T value="Tür"/><select name="kind">{['OAUTH_CONFIG', 'TOKENS', 'RPC_HEADERS', 'EXPLORER_API_KEY', 'REWARD_SIGNER_PRIVATE_KEY', 'DEPLOYER_PRIVATE_KEY'].map(k => <option key={k}>{k}</option>)}</select></label><label><T value="Yeni değer (gizli)"/><input name="value" type="password" autoComplete="new-password" required maxLength={30000}/></label><div className="social-field-help" role="note"><div><p>{language==='tr'?'Sosyal medya Client ID, API key ve token bilgilerini platforma özel alanlardan girmek daha kolaydır. Her alanın altında edinme adımları ve resmî bağlantılar bulunur.':'Use platform-specific fields to enter social Client IDs, API keys and tokens. Each field includes acquisition steps and official links.'}</p><a href="#social/api">{language==='tr'?'Sosyal API alan rehberlerini aç':'Open social API field guides'} →</a></div></div><button disabled={busy} className="button"><T value="Şifreli kaydet"/></button></form>{credentials.map(c => <div className="row" key={String(c.id)}><span className="break">{String(c.scope)} · {String(c.ownerId)} · {String(c.kind)} · <T value={c.revokedAt ? 'İptal edildi' : 'Yapılandırıldı'}/></span><button disabled={busy || !!c.revokedAt} onClick={() => void action(() => api('credentials/' + c.id, 'DELETE'))}><T value="İptal et"/></button></div>)}</>}
 {details !== null && <details className="panel"><summary><T value="Yapılandırma ayrıntıları (gizli değerler hariç)"/></summary><pre className="data-view">{JSON.stringify(details, null, 2)}</pre></details>}
 </section>;
}
