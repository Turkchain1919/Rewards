'use client';
import UserDetails from './user-details';
import {T,useLanguage} from "../i18n";
import { useEffect, useState, useRef } from 'react';
import { formatUnits, parseUnits } from 'ethers';
import { useRuntime } from '../runtime';
import SocialApi from './social-api';
import SocialTaskBuilder from './social-task-builder';
import RewardLimits from './reward-limits';
import SocialManagement from './social-management';
import AdminSettings from './settings';
import HeroVisualAdmin from './hero-visual';
import {DataTable,RowActions,StatusBadge,LegacyTaskWizard,uiError} from './ui';
import type {AdminRoute} from './navigation';
import {LifecycleActions,StatusFilter,stateOf,ContentFields,DateFields,readContent,readDates,type Content} from './lifecycle';
type Campaign = {
 archivedAt?:string|null;startsAt?:string|null;endsAt?:string|null;
    id: string;
    title: string;
    description: string;
    budgetWei: string;
    allocatedWei: string;
    status: string;
    tasks: Task[];
};
type Task = {
 socialTaskCode?:string|null;targetObjectId?:string|null;budgetWei?:string|null;allocatedWei?:string;timezone?:string;
 archivedAt?:string|null;publishedAt?:string|null;startsAt?:string|null;endsAt?:string|null;localizedContent?:Content;
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
        type: string;
        instructions: string;
        minLength?: number;maxRewards?:number;
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
export default function AdminModules({role,route,navigate}:{role:string;route:AdminRoute;navigate:(path:string)=>void}){
 const {config:runtime,query}=useRuntime(),language=useLanguage(),tab=route.module,view=route.view;
 const decimals=runtime?.currency.decimals??18,symbol=runtime?.currency.symbol||'TURK',formatEther=(v:string)=>formatUnits(v,decimals),parseEther=(v:string)=>parseUnits(v,decimals);
 const requestId=useRef(0);
 const [loadedTab,setLoadedTab]=useState('');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[message,setMessage]=useState(''),[summary,setSummary]=useState<Summary|null>(null),[campaigns,setCampaigns]=useState<Campaign[]>([]),[submissions,setSubmissions]=useState<Submission[]>([]),[rows,setRows]=useState<JsonRow[]>([]),[data,setData]=useState<unknown>(null),[officialTargets,setOfficialTargets]=useState<{id:string;platform:string;name:string;isDefault:boolean;defaultTargetUrl:string}[]>([]),[campaignEdit,setCampaignEdit]=useState<Campaign|null>(null),[taskEdit,setTaskEdit]=useState<Task|null>(null),[selectedUser,setSelectedUser]=useState<JsonRow|null>(()=>{try{const id=typeof window==='undefined'?null:sessionStorage.getItem('rewards-admin-user-detail');return id?{id}:null;}catch{return null;}}),[creationMode,setCreationMode]=useState('social'),[statusFilter,setStatusFilter]=useState('Tümü');
 async function api(path:string,method='GET',body?:unknown){const r=await fetch('/api/admin/'+path+query,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw new Error([uiError(typeof d.message==='string'?d.message:'İşlem tamamlanamadı',language),...(Array.isArray(d.errors)?d.errors.map((x:{field?:string;message?:string})=>(x.field?x.field+': ':'')+uiError(x.message||'Geçersiz değer',language)):[])].join(' — '));return d;}
 async function load(){const id=++requestId.current;setError('');setLoading(true);try{if(tab.startsWith('settings/'))return;const path=tab==='campaigns'||tab==='tasks'?'campaigns':tab==='catalog'?'social/task-catalog':['roles','claim-status'].includes(tab)?null:tab;const result=path?await api(path):null;if(id!==requestId.current)return;setLoadedTab(tab);if(tab==='summary')setSummary(result);else if(tab==='campaigns'||tab==='tasks')setCampaigns(result);else if(tab==='submissions')setSubmissions(result);else if(['users','accounts','claims','audit','catalog'].includes(tab))setRows(result);else setData(result);}catch(e){if(id===requestId.current)setError(e instanceof Error?e.message:'Yüklenemedi');}finally{if(id===requestId.current)setLoading(false);}}

 useEffect(()=>{void load();const refresh=()=>void load();window.addEventListener('admin-refresh',refresh);return()=>window.removeEventListener('admin-refresh',refresh);},[tab,query,language]);
 useEffect(()=>{setError('');setMessage('');setCampaignEdit(null);setTaskEdit(null);setStatusFilter(view==='drafts'?'Taslak':view==='archive'?'Arşivlenmiş':'Tümü');},[route.path]);
 useEffect(()=>{void fetch('/api/admin/official-accounts').then(r=>r.ok?r.json():[]).then(setOfficialTargets).catch(()=>{});},[]);
 async function act(path:string,method='POST',body?:unknown){setBusy(true);setError('');setMessage('');try{await api(path,method,body);setCampaignEdit(null);setTaskEdit(null);setMessage('İşlem tamamlandı.');if(view==='new')navigate(tab==='tasks'?'tasks':'campaigns');await load();}catch(e){setError(e instanceof Error?e.message:'İşlem tamamlanamadı');}finally{setBusy(false);}}
 function form(e:React.FormEvent<HTMLFormElement>){e.preventDefault();return new FormData(e.currentTarget);}
 const tasks=campaigns.flatMap(c=>c.tasks),show=(row:Campaign|Task)=>statusFilter==='Tümü'||stateOf(row)===statusFilter,ledger=tab==='ledger'&&loadedTab===tab&&data?data as Ledger:null,visibleRows=loadedTab===tab?rows:[];
 const taskActions=(t:Task)=><RowActions><button disabled={!!t.archivedAt} onClick={()=>setTaskEdit(t)}><T value="Düzenle"/></button><button disabled={busy||!!t.archivedAt} onClick={()=>void act('tasks/'+t.id+'/publish')}><T value="Yayınla"/></button><button disabled={busy||!!t.archivedAt} onClick={()=>void act('tasks/'+t.id+'/pause')}><T value="Pasifleştir"/></button><RewardLimits id={t.id} archived={!!t.archivedAt} api={api} onDone={load} decimals={decimals} symbol={symbol} busy={busy}/><LifecycleActions kind="tasks" row={t} api={api} onDone={load} onError={setError} busy={busy}/></RowActions>;
 const taskForm=(<section className="panel"><h2><T value={taskEdit ? 'Görevi düzenle' : 'Görev oluştur'}/></h2>{taskEdit?.socialTaskCode&&!taskEdit.publishedAt?<SocialTaskBuilder api={api} campaigns={campaigns} decimals={decimals} symbol={symbol} onDone={load} editTask={taskEdit} onCancel={()=>setTaskEdit(null)}/>:taskEdit?.publishedAt?<form key={taskEdit.id} onSubmit={e=>{const f=form(e);void act('tasks/'+taskEdit.id+'/content','PATCH',{title:f.get('title'),localizedContent:readContent(f),...readDates(f)});}}><p><T value="Bu form içerik ve tarihleri düzenler. Ödül kuralları için Ödül ve sınırlar düğmesini kullanın."/></p><label><T value="Başlık"/><input name="title" required minLength={3} maxLength={160} defaultValue={taskEdit.title}/></label><ContentFields content={taskEdit.localizedContent}/><DateFields row={taskEdit}/><button disabled={busy}><T value="Kaydet"/></button></form>:<form key={taskEdit?.id || 'new'} onSubmit={e => { const f = form(e); try {
        const verificationType=String(f.get('verificationType')||'MANUAL'),verification=verificationType==='TELEGRAM_MEMBERSHIP'?{type:verificationType,instructions:f.get('instructions'),...(String(f.get('maxRewards')||'').trim()?{maxRewards:Number(f.get('maxRewards'))}:{})}:{type:'MANUAL',instructions:f.get('instructions'),minLength:Number(f.get('minLength')),...(String(f.get('maxRewards')||'').trim()?{maxRewards:Number(f.get('maxRewards'))}:{})};
        void act('tasks' + (taskEdit ? '/' + taskEdit.id : ''), taskEdit ? 'PUT' : 'POST', { campaignId: f.get('campaignId'), title: f.get('title'), officialAccountId:String(f.get('officialAccountId')||'')||undefined,targetUrl:String(f.get('targetUrl')||'')||undefined,platform: f.get('platform'), kind: f.get('kind'), rewardWei: parseEther(String(f.get('reward'))).toString(), policyReviewed: f.get('policyReviewed') === 'on', verification,localizedContent:readContent(f),...readDates(f) });
    }
    catch {
        setError('Geçerli ' + symbol + ' tutarı girin.');
    } }}><label><T value="Kampanya"/><select name="campaignId" required defaultValue={taskEdit?.campaignId}>{campaigns.filter(c=>!c.archivedAt).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label><T value="Başlık"/><input name="title" required minLength={3} maxLength={160} defaultValue={taskEdit?.title}/></label><label><T value="Platform"/><select name="platform" defaultValue={taskEdit?.platform || 'TURKCHAIN'}>{['TURKCHAIN', 'X', 'TELEGRAM', 'FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK'].map(p => <option key={p}>{p}</option>)}</select></label><label><T value="Resmî hedef hesabı"/><select name="officialAccountId" defaultValue={taskEdit?.officialAccountId||''}><option value="">ENV / varsayılan hesap</option>{officialTargets.map(a=><option key={a.id} value={a.id}>{a.platform} · {a.name}{a.isDefault?' · default':''}</option>)}</select></label><label><T value="Göreve özel hedef URL (boş = varsayılan)"/><input name="targetUrl" type="url" defaultValue={taskEdit?.targetUrl||''}/></label><label><T value="Görev türü"/><select name="kind" defaultValue={taskEdit?.kind || 'EDUCATION'}><option value="EDUCATION"><T value="EDUCATION"/></option><option value="SOCIAL_INTERACTION"><T value="SOCIAL_INTERACTION"/></option></select></label><label><T value="Ödül · "/>{symbol}<input name="reward" required inputMode="decimal" defaultValue={taskEdit ? formatEther(taskEdit.rewardWei) : '0'}/></label><label><T value="Doğrulama yöntemi"/><select name="verificationType" defaultValue={taskEdit?.verification?.type||'MANUAL'}><option value="MANUAL"><T value="Manuel inceleme"/></option><option value="TELEGRAM_MEMBERSHIP"><T value="Telegram üyeliğini Bot API ile doğrula"/></option></select></label><label><T value="Görev talimatları"/><textarea name="instructions" required minLength={10} maxLength={2000} defaultValue={taskEdit?.verification?.instructions}/></label><label><T value="En fazla ödüllendirilecek kullanıcı (boş = sınır yok)"/><input name="maxRewards" type="number" min={1} max={1000000} step={1} defaultValue={taskEdit?.verification?.maxRewards}/></label><label><T value="En az kanıt uzunluğu (manuel görevler)"/><input name="minLength" type="number" min={20} max={500} defaultValue={taskEdit?.verification?.minLength || 20}/></label><ContentFields content={taskEdit?.localizedContent}/><DateFields row={taskEdit}/><label className="checkbox"><input name="policyReviewed" type="checkbox" defaultChecked={taskEdit?.policyReviewed}/><T value="Görev ve platform kuralları incelendi."/></label><p><T value="Telegram için yalnızca resmi Bot API ile grup/kanal üyeliği doğrulaması kullanılabilir. Bot hedef sohbette yönetici olmalı; kullanıcı Telegram hesabını bağlamalıdır. Beğeni, takip ve paylaşım ödülleri kapalıdır. Görev yayınlanabilmesi için bağlı Telegram hedefi ve API yapılandırması gerekir."/></p><button className="button" disabled={busy}><T value="Kaydet"/></button></form>}</section>);
 return <section className="admin-module" aria-busy={loading||busy}>{error&&<div role="alert" className="notice">{uiError(error,language)} <button onClick={()=>void load()}><T value="Tekrar dene"/></button></div>}{message&&<p role="status" className="admin-toast"><T value={message}/></p>}{loading&&<p role="status" className="admin-loading"><T value="Yükleniyor…"/></p>}
 {tab==='settings/social-api'?<SocialApi role={role} initialView={view} onAccounts={()=>navigate('social/accounts')}/>:tab==='settings/social'?<SocialManagement role={role} view={view}/>:tab.startsWith('settings/')&&<AdminSettings section={tab.split('/')[1]} focusGroup={view}/>}
 {tab==='summary'&&summary&&<><div className="admin-stat-grid">{[['Kullanıcılar',summary.users,'users'],['Kampanyalar',summary.campaigns,'campaigns'],['Görevler',summary.tasks,'tasks'],['İnceleme bekleyen',summary.pending,'verifications/pending']].map(([label,count,path])=><a className="admin-stat" href={'#'+path} key={String(label)} onClick={e=>{e.preventDefault();navigate(String(path));}}><span><T value={String(label)}/></span><strong>{count}</strong><small><T value="Görüntüle"/> ↗</small></a>)}</div><section className="panel"><h2><T value="İç ödül bakiyeleri"/></h2><div className="admin-stat-grid">{Object.entries(summary.rewards).map(([key,value])=><div key={key}><StatusBadge value={key}/><h3>{formatEther(value)} {symbol}</h3></div>)}</div><p><T value="Ödül önce platform içi bakiyeye kaydedilir. Gerçek cüzdan transferleri şu anda kapalıdır."/></p></section></>}
 {tab==='campaigns'&&(view==='new'||campaignEdit)?<><button onClick={()=>{setCampaignEdit(null);navigate('campaigns');}}><T value="Listeye dön"/></button><section className="panel"><h2><T value={campaignEdit ? 'Kampanyayı düzenle' : 'Kampanya oluştur'}/></h2><form key={campaignEdit?.id || 'new'} onSubmit={e => { const f = form(e); try {
        void act('campaigns' + (campaignEdit ? '/' + campaignEdit.id : ''), campaignEdit ? 'PUT' : 'POST', { title: f.get('title'), description: f.get('description'), budgetWei: parseEther(String(f.get('budget'))).toString(),...readDates(f) });
    }
    catch {
        setError('Geçerli ' + symbol + ' tutarı girin.');
    } }}><label><T value="Başlık"/><input name="title" required minLength={3} maxLength={160} defaultValue={campaignEdit?.title}/></label><label><T value="Açıklama"/><textarea name="description" required minLength={10} maxLength={5000} defaultValue={campaignEdit?.description}/></label><label><T value="Bütçe · "/>{symbol}<input name="budget" inputMode="decimal" required defaultValue={campaignEdit ? formatEther(campaignEdit.budgetWei) : '0'}/></label><DateFields row={campaignEdit}/><p><T value="Muhasebe bütçesi, fonlanmış bir kontrat bakiyesi değildir."/></p><button className="button" disabled={busy}><T value="Kaydet"/></button></form></section></>:tab==='campaigns'&&<><div className="admin-page-actions"><button className="button" onClick={()=>navigate('campaigns/new')}><T value="Yeni kampanya"/></button>{view==='budgets'&&<button onClick={()=>navigate('tasks')}><T value="Görev limitlerini yönet"/></button>}</div><DataTable rows={campaigns.filter(show)} id={c=>c.id} searchText={c=>c.title+' '+c.description} filters={<StatusFilter value={statusFilter} onChange={setStatusFilter}/>} columns={[{key:'name',label:'Kampanya',sort:c=>c.title,render:c=><><strong>{c.title}</strong><small className="admin-cell-note">{c.description}</small></>},{key:'status',label:'Durum',sort:stateOf,render:c=><StatusBadge value={stateOf(c)}/>},{key:'budget',label:'Bütçe',sort:c=>BigInt(c.budgetWei),render:c=><>{formatEther(c.budgetWei)} {symbol}<small className="admin-cell-note"><T value="Ayrılmış"/>: {formatEther(c.allocatedWei)}</small></>},{key:'tasks',label:'Görevler',sort:c=>c.tasks.length,render:c=>c.tasks.length},{key:'actions',label:'İşlemler',render:c=><RowActions><button disabled={!!c.archivedAt} onClick={()=>setCampaignEdit(c)}><T value="Düzenle"/></button><button disabled={busy||!!c.archivedAt} onClick={()=>void act('campaigns/'+c.id+'/publish')}><T value="Yayınla"/></button><button disabled={busy||!!c.archivedAt} onClick={()=>void act('campaigns/'+c.id+'/pause')}><T value="Durdur"/></button><LifecycleActions kind="campaigns" row={c} api={api} onDone={load} onError={setError} busy={busy}/></RowActions>} ]}/></>}
 {tab==='tasks'&&(view==='new'||view==='batch'||taskEdit)?<><button onClick={()=>{setTaskEdit(null);navigate('tasks');}}><T value="Listeye dön"/></button>{!taskEdit&&!loading&&!campaigns.length&&<div className="notice"><T value="Görev oluşturmak için önce bir kampanya hazırlayın."/> <button onClick={()=>navigate('campaigns/new')}><T value="Yeni kampanya"/></button></div>}{!taskEdit&&<div className="admin-mode-switch" role="group" aria-label={language==='tr'?'Görev oluşturma yöntemi':'Task creation method'}><button aria-pressed={creationMode==='social'} onClick={()=>setCreationMode('social')}><T value="Sosyal görev"/></button><button aria-pressed={creationMode==='classic'} onClick={()=>setCreationMode('classic')}><T value="Gelişmiş / klasik görev"/></button></div>}{!taskEdit&&creationMode==='social'?<SocialTaskBuilder api={api} campaigns={campaigns} decimals={decimals} symbol={symbol} onDone={load}/>:taskEdit?.socialTaskCode&&!taskEdit.publishedAt?taskForm:taskEdit?.publishedAt?taskForm:<LegacyTaskWizard>{taskForm}</LegacyTaskWizard>}</>:tab==='tasks'&&<><div className="admin-page-actions"><button className="button" onClick={()=>navigate('tasks/new')}><T value="Yeni görev oluştur"/></button><button onClick={()=>navigate('tasks/batch')}><T value="Toplu görev oluştur"/></button></div><DataTable rows={tasks.filter(show)} id={t=>t.id} searchText={t=>t.title+' '+t.platform} filters={<StatusFilter value={statusFilter} onChange={setStatusFilter}/>} columns={[{key:'title',label:'Görev',sort:t=>t.title,render:t=><><strong>{t.title}</strong><small className="admin-cell-note">{t.platform} · <T value={t.verification.type==='TELEGRAM_MEMBERSHIP'?'Otomatik Telegram üyelik doğrulaması':t.verification.type==='SOCIAL_API'?'Sosyal API doğrulaması':'Manuel doğrulama'}/></small></>},{key:'status',label:'Durum',sort:stateOf,render:t=><StatusBadge value={stateOf(t)}/>},{key:'reward',label:'Ödül',sort:t=>BigInt(t.rewardWei),render:t=><>{formatEther(t.rewardWei)} {symbol}<small className="admin-cell-note">{t.verification.maxRewards??'∞'} <T value="kullanıcı"/></small></>},{key:'dates',label:'Tarih aralığı',render:t=><small>{t.startsAt?new Date(t.startsAt).toLocaleString(language):'—'} → {t.endsAt?new Date(t.endsAt).toLocaleString(language):'—'}</small>},{key:'actions',label:'İşlemler',render:taskActions}]}/></>}
 {tab==='users'&&<>{view==='details'&&selectedUser?<UserDetails key={String(selectedUser.id)} id={String(selectedUser.id)} onBack={()=>navigate('users')}/>:<DataTable rows={visibleRows} id={r=>String(r.id)} searchText={r=>String(r.wallet)+' '+String(r.displayName||'')} columns={[{key:'wallet',label:'Kayıtlı cüzdan',sort:r=>String(r.wallet),render:r=><span className="break">{String(r.wallet)}</span>},{key:'profile',label:'Profil',sort:r=>String(r.displayName||''),render:r=>String(r.displayName||'—')},{key:'created',label:'Kayıt tarihi',sort:r=>String(r.createdAt),render:r=>new Date(String(r.createdAt)).toLocaleString(language)},{key:'actions',label:'İşlemler',render:r=><button onClick={()=>{setSelectedUser(r);try{sessionStorage.setItem('rewards-admin-user-detail',String(r.id));}catch{}navigate('users/details');}}><T value="Detayları görüntüle"/></button>}]}/>}</>}
 {tab==='submissions'&&<DataTable rows={submissions.filter(s=>!view||s.status===view)} id={s=>s.id} searchText={s=>s.task.title+' '+s.user.wallet+' '+s.status} empty="Henüz görev başvurusu yok." columns={[{key:'task',label:'Görev',sort:s=>s.task.title,render:s=><><strong>{s.task.title}</strong><small className="admin-cell-note break">{s.user.wallet}</small></>},{key:'status',label:'Durum',sort:s=>s.status,render:s=><StatusBadge value={s.status}/>},{key:'reward',label:'Ödül',render:s=><>{s.reward?formatEther(s.reward.amountWei):'0'} {symbol}</>},{key:'review',label:'İnceleme',render:s=><details><summary><T value="Başvuruyu incele"/></summary><blockquote>{s.proof}</blockquote>{s.status==='PENDING'?<form onSubmit={e=>{const f=form(e);void act('submissions/'+s.id+'/review','POST',{action:f.get('action'),note:f.get('note')});}}><label><T value="Karar"/><select name="action"><option value="APPROVE"><T value="Onayla"/></option><option value="REJECT"><T value="Reddet"/></option></select></label><label><T value="İnceleme notu"/><textarea name="note" minLength={5} maxLength={1000} required/></label><button disabled={busy}><T value="Kararı kaydet"/></button></form>:<p>{s.reviewNote}</p>}</details>} ]}/>}
  {tab === 'accounts' && <><details><summary><T value="Yönetici hesabı oluştur"/></summary><section className="panel"><h2><T value="Yönetici hesabı oluştur"/></h2><form onSubmit={e => { const f = form(e); void act('accounts', 'POST', Object.fromEntries(f)); }}><label><T value="E-posta"/><input name="email" type="email" required/></label><label><T value="İlk parola"/><input name="password" type="password" minLength={14} maxLength={128} autoComplete="new-password" required/></label><label><T value="Rol"/><select name="role"><option><T value="ADMIN"/></option><option><T value="REVIEWER"/></option></select></label><button className="button" disabled={busy}><T value="Hesap oluştur"/></button></form></section></details>{visibleRows.map(r => <div key={String(r.id)} className="row"><span>{String(r.email)} · {String(r.role)} · <T value={r.enabled ? 'Etkin' : 'Kapalı'}/></span>{r.role !== 'OWNER' && <div className="actions"><button disabled={busy} onClick={() => void act('accounts/' + r.id, 'PATCH', { role: r.role, enabled: !r.enabled })}><T value={r.enabled ? 'Devre dışı bırak' : 'Etkinleştir'}/></button><button disabled={busy} onClick={() => void act('accounts/' + r.id, 'PATCH', { role: r.role === 'ADMIN' ? 'REVIEWER' : 'ADMIN', enabled: !!r.enabled })}><T value="Rolü değiştir"/></button></div>}</div>)}</>}
 {tab==='roles'&&<section className="panel"><h2><T value="Mevcut rol modeli"/></h2><dl>{[['OWNER','Yönetici ve güvenli yapılandırma yönetimi.'],['ADMIN','Mevcut operasyon ve inceleme yetkileri.'],['REVIEWER','Görev başvurularını inceleme.']].map(([key,label])=><div className="row" key={key}><dt>{key}</dt><dd><T value={label}/></dd></div>)}</dl><p><T value="Yetkiler sunucuda uygulanır. Bu ekran yeni yetki tanımlamaz."/></p><button onClick={()=>navigate('security/admins')}><T value="Yönetici hesapları"/></button></section>}
 {tab==='claims'&&<DataTable rows={visibleRows.filter(r=>view!=='history'||!!r.transactionHash)} id={r=>String(r.id)} searchText={r=>String(r.recipient)+' '+String(r.status)+' '+String(r.transactionHash||'')} columns={[{key:'recipient',label:'Alıcı',render:r=><span className="break">{String(r.recipient)}</span>},{key:'amount',label:'Tutar',render:r=><>{formatEther(String(r.amountWei))} {symbol}</>},{key:'status',label:'Durum',sort:r=>String(r.status),render:r=><StatusBadge value={String(r.status)}/>},{key:'transaction',label:'İşlem',render:r=><><span className="break">{String(r.transactionHash||'—')}</span><small>{String(r.lastError||'')}</small></>} ]}/>}
 {tab==='claim-status'&&<section className="panel"><h2><T value="Claim durumu"/></h2><StatusBadge value={runtime?.claimsPaused?'Durduruldu':'Yapılandırma durumu'}/><p><T value="Bu sayfa mevcut yapılandırmayı gösterir; claim veya transfer yetkisini değiştirmez."/></p><p><T value="Ödül önce platform içi bakiyeye kaydedilir. Gerçek cüzdan transferleri şu anda kapalıdır."/></p></section>}
 {tab==='audit'&&<DataTable rows={visibleRows} id={r=>String(r.id)} searchText={r=>String(r.action)+' '+String(r.resource)} columns={[{key:'action',label:'İşlem',sort:r=>String(r.action),render:r=>String(r.action)},{key:'resource',label:'Kayıt',render:r=><span className="break">{String(r.resource)}</span>},{key:'date',label:'Tarih',sort:r=>String(r.createdAt),render:r=>new Date(String(r.createdAt)).toLocaleString(language)}]}/>}
 {ledger&&<>{view!=='history'&&<div className="admin-stat-grid">{Object.entries(ledger.balances).map(([key,value])=><article className="admin-stat" key={key}><StatusBadge value={key}/><strong>{formatEther(value)} {symbol}</strong></article>)}</div>}{view!=='balances'&&<DataTable rows={ledger.entries} id={r=>r.id} searchText={r=>r.user.wallet+' '+r.reason+' '+r.status} columns={[{key:'wallet',label:'Cüzdan',render:r=><span className="break">{r.user.wallet}</span>},{key:'amount',label:'Tutar',render:r=><>{formatEther(r.amountWei)} {symbol}</>},{key:'status',label:'Durum',sort:r=>r.status,render:r=><StatusBadge value={r.status}/>},{key:'history',label:'Durum geçmişi',render:r=><details><summary><T value="Durum geçmişi"/></summary><p>{r.reason}</p>{r.events.map(e=><p key={e.id}>{e.fromStatus||'—'} → {e.toStatus} · {e.reason}</p>)}</details>} ]}/>}</>}
 {tab==='catalog'&&<DataTable rows={visibleRows} id={r=>String(r.code)} searchText={r=>String(r.platform)+' '+String(r.code)+' '+String(r.nameTr)+' '+String(r.nameEn)} columns={[{key:'platform',label:'Platform',sort:r=>String(r.platform),render:r=>String(r.platform)},{key:'name',label:'Görev',sort:r=>String(r.nameTr),render:r=>String(language==='tr'?r.nameTr:r.nameEn)},{key:'policy',label:'Platform politikası',render:r=><StatusBadge value={String(r.policyStatus)}/>},{key:'status',label:'Durum',render:r=><StatusBadge value={String(r.status)}/>} ]}/>}
 {tab==='system'&&<>{role==='OWNER'&&<details className="panel"><summary><T value="Ana sayfa görselini yönet"/></summary><HeroVisualAdmin/></details>}{loadedTab===tab&&data!==null&&<section className="panel"><h2><T value="Üretim servis durumu"/></h2>{Object.entries(data as JsonRow).map(([key,value])=><div className="row" key={key}><span>{key}</span><strong>{String(value)}</strong></div>)}</section>}</>}
 </section>;
}
