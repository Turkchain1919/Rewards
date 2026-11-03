'use client';
import {useState} from 'react';
import {T} from '../i18n';
export default function BotTask({id,query,linked,onDone}:{id:string;query:string;linked:boolean;onDone:()=>Promise<void>}){
 const [url,setUrl]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function act(mode:'connect'|'challenge'|'verify'){setBusy(true);setError('');try{const path=mode==='connect'?'/api/social/telegram/connect':mode==='challenge'?'/api/social/tasks/'+id+'/challenge'+query:'/api/tasks/'+id+'/verify'+query;const response=await fetch(path,{method:'POST'}),body=await response.json();if(!response.ok)throw new Error(body.message||'Verification failed');if(mode==='connect')window.location.assign(body.url);if(mode==='challenge')setUrl(body.url);if(mode==='verify'){setUrl('');await onDone();}}catch(e){setError(e instanceof Error?e.message:'Verification failed');}finally{setBusy(false);}}
 return <><p><T value="Önce kişisel bot bağlantısını açıp Başlat düğmesine basın; sonra burada doğrulayın. Kod kısa süreli ve hesabınıza bağlıdır."/></p>{error&&<p role="alert"><T value={error}/></p>}{!linked?<button disabled={busy} onClick={()=>void act('connect')}><T value="Telegram hesabımı bağla"/></button>:<><button disabled={busy} onClick={()=>void act('challenge')}><T value="Kişisel bot doğrulamasını başlat"/></button>{url&&<p><a href={url} target="_blank" rel="noreferrer"><T value="Botu aç ve doğrulama kodunu gönder"/></a></p>}<button disabled={busy} onClick={()=>void act('verify')}><T value={busy?'Doğrulanıyor':'Doğrula'}/></button></>}</>;
}
