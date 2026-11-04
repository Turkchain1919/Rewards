'use client';
import {useEffect,useRef,useState} from 'react';
import {T} from '../i18n';
import HeroMedia from '../hero-media';
type Meta={exists:boolean;published:boolean;enabled:boolean;width?:number;height?:number;size?:number;frameCount?:number;updatedAt?:string;sha256?:string};
export default function HeroVisualAdmin(){
 const [meta,setMeta]=useState<Meta>({exists:false,published:false,enabled:false}),[file,setFile]=useState<File|null>(null),[preview,setPreview]=useState(''),[error,setError]=useState(''),[ok,setOk]=useState(''),[busy,setBusy]=useState(false),[mfa,setMfa]=useState('');
 const input=useRef<HTMLInputElement>(null);
 async function load(){const r=await fetch('/api/admin/system/hero',{cache:'no-store'});if(!r.ok)throw Error('Ayarlar yüklenemedi');setMeta(await r.json());}
 useEffect(()=>{void load().catch(e=>setError(e.message));},[]);
 useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
 async function request(path:string,method='POST',body?:unknown){const r=await fetch('/api/admin/system/hero'+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(mfa?{'X-MFA-Code':mfa}:{})},body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw Error(d.message||'İşlem başarısız oldu');return d;}
 async function action(fn:()=>Promise<void>){setBusy(true);setError('');setOk('');try{await fn();await load();window.dispatchEvent(new Event('rewards-hero'));try{localStorage.setItem('rewards-hero-updated',String(Date.now()));}catch{}setFile(null);if(input.current)input.current.value='';setMfa('');}catch(e){setError(e instanceof Error?e.message:'İşlem başarısız oldu');}finally{setBusy(false);}}
 const human=(n:number)=>n<1024*1024?(n/1024).toFixed(1)+' KB':(n/1024/1024).toFixed(2)+' MB';
 return <section className="panel"><h2><T value="Ana sayfa Hero GIF görseli"/></h2><p><T value="GIF yükleyin, önizleyin ve hemen yayınlayın. GIF yoksa özgün ✦ TURK / 1919 tasarımı gösterilir."/></p>
 <div className="notice"><strong>{meta.enabled&&meta.published?'Published / Yayında':meta.exists?'Disabled / Kapalı':'Original design / Özgün tasarım'}</strong>{meta.exists&&<p>{meta.width}×{meta.height} px · {human(meta.size||0)} · {meta.frameCount} frames · {meta.updatedAt&&new Date(meta.updatedAt).toLocaleString()}</p>}</div>
 <label><T value="GIF dosyası (maksimum 5 MB; 1200 × 1200 px)"/><input ref={input} type="file" accept="image/gif,.gif" onChange={e=>{setError('');setFile(e.target.files?.[0]||null);}}/></label>
 {!file&&meta.exists&&meta.enabled&&meta.published&&meta.sha256&&<div className="hero-preview"><HeroMedia key={meta.sha256} src={'/api/hero/'+meta.sha256}/></div>}
 {file&&<><p>{file.name} · {human(file.size)}</p><div className="hero-preview">{preview&&<HeroMedia key={preview} src={preview}/>}</div></>}
 <label><T value="MFA kodu (eski yönetici oturumunda gerekir)"/><input value={mfa} onChange={e=>setMfa(e.target.value)} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code"/></label>
 <div className="actions"><button className="button" disabled={busy||!file} onClick={()=>void action(async()=>{if(!file)throw Error('Önce GIF seçin / Select a GIF first');if(file.size>5242880)throw Error('Dosya 5 MB sınırını aşıyor / File exceeds 5 MB');if(file.type!=='image/gif')throw Error('Yalnızca GIF kabul edilir / GIF files only');const r=await fetch('/api/admin/system/hero',{method:'POST',headers:{'Content-Type':'image/gif',...(mfa?{'X-MFA-Code':mfa}:{})},body:file});const d=await r.json();if(!r.ok)throw Error(d.message||'GIF doğrulanamadı');setMeta(d);setOk('GIF yayınlandı / GIF published');})}><T value="Kaydet ve yayınla"/></button>
 {meta.exists&&<><button disabled={busy} onClick={()=>void action(async()=>{await request('/state','POST',{enabled:!meta.enabled,published:true});setOk(meta.enabled?'GIF devre dışı bırakıldı / GIF disabled':'GIF enabled');})}>{meta.enabled?'Disable / Kapat':'Enable / Aç'}</button><button disabled={busy} onClick={()=>void action(async()=>{await request('','DELETE');setFile(null);setOk('Özgün görsel geri yüklendi / Original visual restored');})}><T value="GIF'i kaldır ve özgün tasarımı geri yükle"/></button></>}
 </div>{error&&<div role="alert" className="notice">{error}</div>}{ok&&<p role="status">{ok}</p>}
 </section>;
}