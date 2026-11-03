'use client';
import {useEffect,useState} from 'react';
import {T} from '../i18n';
type Config={platform:string;status:string;enabled:boolean;version:number;authMode:string;callbackUri:string;graphVersion:string;missing:string[];configuredFields:string[];lastSuccessfulConnection:string|null;lastApiError:string|null;apiStatus:string};
const fieldMap:Record<string,[string,string][]> = {
 X:[['clientId','OAuth 2.0 Client ID'],['clientSecret','OAuth 2.0 Client Secret'],['apiKey','API Key (OAuth 1.0 compatibility)'],['apiSecret','API Secret (OAuth 1.0 compatibility)'],['bearerToken','App Bearer Token'],['accessToken','User Access Token'],['refreshToken','Refresh Token']],
 TELEGRAM:[['clientId','BotFather OIDC Client ID'],['clientSecret','BotFather OIDC Client Secret'],['botToken','Telegram Bot Token'],['webhookSecret','Webhook Secret']],
 FACEBOOK:[['clientId','Facebook App ID'],['clientSecret','Facebook App Secret'],['pageAccessToken','Page Access Token'],['accessToken','User Access Token']],
 INSTAGRAM:[['clientId','Instagram App ID'],['clientSecret','Instagram App Secret'],['accessToken','Instagram Access Token']],
 YOUTUBE:[['clientId','Google OAuth Client ID'],['clientSecret','Google OAuth Client Secret'],['apiKey','YouTube Data API Key'],['accessToken','OAuth Access Token'],['refreshToken','Refresh Token']],
 TIKTOK:[['clientId','TikTok Client Key'],['clientSecret','TikTok Client Secret'],['accessToken','Access Token'],['refreshToken','Refresh Token']],
 DISCORD:[['clientId','Discord Client ID'],['clientSecret','Discord Client Secret'],['botToken','Discord Bot Token'],['accessToken','OAuth Access Token'],['refreshToken','Refresh Token']],
 GITHUB:[['clientId','GitHub OAuth Client ID'],['clientSecret','GitHub OAuth Client Secret'],['accessToken','Access Token'],['refreshToken','Refresh Token']]
};
export default function SocialApi({role}:{role:string}){
 const [platform,setPlatform]=useState('X'),[configs,setConfigs]=useState<Config[]>([]),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState<Record<string,unknown>|null>(null);
 async function api(path:string,method='GET',body?:unknown){const r=await fetch('/api/admin/'+path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.message||'Request failed');return d;}
 async function load(){setConfigs(await api('integrations'));}
 useEffect(()=>{void load().catch(e=>setError(e.message));},[]);
 const current=configs.find(c=>c.platform===platform);
 async function action(fn:()=>Promise<void>){setBusy(true);setError('');setMessage('');try{await fn();await load();}catch(e){setError(e instanceof Error?e.message:'Request failed');}finally{setBusy(false);}}
 return <section className="panel"><h2>Social API</h2><p><T value="Bilgiler şifreli PostgreSQL kaydından kullanılır. .env uyumluluk fallback kaynağıdır."/></p><label><T value="Platform seç"/><select value={platform} onChange={e=>{setPlatform(e.target.value);setError('');setResult(null);setMessage('');}}>{Object.keys(fieldMap).map(p=><option key={p}>{p}</option>)}</select></label>
 {error&&<div className="notice" role="alert">{error}</div>}{message&&<p role="status">{message}</p>}
 {platform==='INSTAGRAM'&&<aside className="notice" aria-label="Instagram"><h3><T value="Instagram kurulumu ve görev gereklilikleri"/></h3><ol><li><T value="Hesap sahibi Business veya Creator hesabının uygulama bilgilerini bu panelden kaydeder."/></li><li><T value="Callback adresini Meta uygulamasına ekleyin; ardından Official Social Accounts bölümünden hesabı OAuth ile bağlayın."/></li><li><T value="Görev hedefini resmî hesap ve gönderi bağlantısıyla belirleyin. Kullanıcıdan Instagram parolası istemeyin."/></li></ol><p><T value="API bilgilerini kaydetmek etkileşim görevlerini etkinleştirmez. Mevcut bağlantı yalnızca instagram_business_basic iznini ister."/></p><ul><li><T value="Yorum: hesap sahibinin gönderilerine erişim ve yorum izni gerekir; ödül doğrulayıcısı henüz uygulanmadı."/></li><li><T value="Takip: hesap bağlantısı takip kanıtı değildir; desteklenen API ve kullanıcı eşleştirmesi ayrıca doğrulanmalıdır."/></li><li><T value="Beğeni ve paylaşım: toplam sayaçlar bir kullanıcının eylemini kanıtlamaz; kullanıcı bazlı doğrulama hazır değil."/></li></ul><p><T value="Instagram ödül görevleri doğrulama ve platform kuralları incelemesi tamamlanana kadar kapalıdır."/></p></aside>}
 {current&&<><div className="notice"><strong>{current.status}</strong><p>API: {current.apiStatus}</p><p><T value="Son başarılı doğrulama:"/> {current.lastSuccessfulConnection?new Date(current.lastSuccessfulConnection).toLocaleString():'—'}</p><p><T value="Son API hatası:"/> {current.lastApiError||'—'}</p><p><T value="Eksik yapılandırmalar:"/> {(current.missing||[]).join(', ')||'—'}</p></div>
 {role==='OWNER'?<form key={platform+':'+current.version} className="wide-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget),credentials=Object.fromEntries((fieldMap[platform]||[]).map(([key])=>[key,String(f.get(key)||'')]).filter(([,v])=>v.trim())),body={credentials,redirectUri:String(f.get('redirectUri')),enabled:f.get('enabled')==='on',mode:String(f.get('mode')),graphVersion:String(f.get('graphVersion')||''),version:current.version,mfaCode:String(f.get('mfaCode')||'')||undefined};void action(async()=>{await api('social-api/'+platform,'POST',body);setMessage('Configuration saved. Provider authorization is still required before an account is connected.');});}}>
 <label><T value="Yetkilendirme türü"/><select name="mode" defaultValue={current.authMode||'oauth'}><option value="oauth">OAuth / OIDC</option><option value={platform==='TELEGRAM'?'bot':'api'}>{platform==='TELEGRAM'?'Bot API':'API Token / Key'}</option>{platform==='GITHUB'&&<option value="public">Public Repository API</option>}</select></label>
 <div className="form-grid">{fieldMap[platform].map(([key,label])=><label key={key}>{label}<input name={key} type="password" autoComplete="new-password" maxLength={10000} placeholder={current.configuredFields?.includes(key)?'•••••••• — stored; blank keeps current value':'New value'}/></label>)}</div>
 <label>Redirect URI<input name="redirectUri" type="url" required defaultValue={current.callbackUri}/></label>
 {['FACEBOOK','INSTAGRAM'].includes(platform)&&<label>Meta Graph API version<input name="graphVersion" defaultValue={current.graphVersion} placeholder="vXX.X"/></label>}
 <label className="checkbox"><input name="enabled" type="checkbox" defaultChecked={current.enabled}/><T value="Entegrasyon etkin"/></label>
 <label><T value="MFA kodu (oturum eskiyse gerekir)"/><input name="mfaCode" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code"/></label>
 <div className="actions"><button className="button" disabled={busy}><T value="Yapılandırmayı kaydet"/></button><button disabled={busy} type="reset"><T value="Girilen değerleri temizle"/></button></div>
 </form>:<p><T value="Kimlik bilgilerini yalnızca OWNER değiştirebilir."/></p>}
 <div className="actions"><button disabled={busy||!current.enabled} onClick={()=>void action(async()=>{setResult(await api('integrations/'+platform+'/test','POST'));})}><T value="Bağlantıyı test et"/></button><button disabled={busy} onClick={()=>void action(load)}><T value="Yapılandırmayı düzenle / yenile"/></button></div>
 <p><T value="Kaydetme işlemi hesap bağlantısı oluşturmaz. Resmî hesabı bağlamak için Official Social Accounts bölümünü kullanın."/></p><p><T value="Ödüllü sosyal etkileşim görevleri varsayılan olarak kapalıdır."/></p>
 {result&&<div className="notice" role="status"><strong>{String(result.status||'')}</strong><p>{String(result.error||result.scope||'')}</p></div>}
 </>}
 </section>;
}
