'use client';
import {useEffect,useState} from 'react';
type Provider={request:(args:{method:string;params?:unknown[]})=>Promise<unknown>};
type Profile={wallet:string;displayName:string|null};
export default function Wallet(){
 const [status,setStatus]=useState(''),[profile,setProfile]=useState<Profile|null>(null),[busy,setBusy]=useState(false);
 useEffect(()=>{void fetch('/api/auth/me').then(r=>r.ok?r.json():null).then(setProfile);},[]);
 async function call(path:string,body:unknown){const r=await fetch('/api/auth/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.message||'İşlem tamamlanamadı');return d;}
 async function connect(){setBusy(true);setStatus('');try{
  const p=(window as unknown as {ethereum?:Provider}).ethereum;
  if(!p)throw new Error('MetaMask veya uyumlu bir EVM cüzdanı yükleyin.');
  const accounts=await p.request({method:'eth_requestAccounts'}) as string[];let chain=await p.request({method:'eth_chainId'});
  if(chain!=='0x77f'){try{await p.request({method:'wallet_switchEthereumChain',params:[{chainId:'0x77f'}]});}catch(e){if((e as {code?:number}).code!==4902)throw e;await p.request({method:'wallet_addEthereumChain',params:[{chainId:'0x77f',chainName:'Turkchain',nativeCurrency:{name:'TURK',symbol:'TURK',decimals:18},rpcUrls:['https://rpc.turkscan.com'],blockExplorerUrls:['https://turkscan.com']}]});}chain=await p.request({method:'eth_chainId'});}
  if(chain!=='0x77f')throw new Error('Turkchain ağına geçiş gerekli.');
  const {message}=await call('challenge',{address:accounts[0]});
  const bytes=new TextEncoder().encode(message);const hex='0x'+Array.from(bytes).map(x=>x.toString(16).padStart(2,'0')).join('');
  const signature=await p.request({method:'personal_sign',params:[hex,accounts[0]]});
  await call('verify',{signature});const r=await fetch('/api/auth/me');setProfile(await r.json());setStatus('İmzalı oturum açıldı. İşlem veya ödeme gönderilmedi.');
  window.dispatchEvent(new Event('rewards-auth'));
 }catch(e){setStatus(e instanceof Error?e.message:'Cüzdan bağlantısı tamamlanamadı.');}finally{setBusy(false);}}
 async function logout(){await call('logout',{});setProfile(null);setStatus('Oturum kapatıldı.');window.dispatchEvent(new Event('rewards-auth'));}
 return <div className="wallet">{profile?<><div className="notice break">{profile.displayName||'Turkchain üyesi'} · {profile.wallet}</div><form onSubmit={e=>{e.preventDefault();const displayName=new FormData(e.currentTarget).get('displayName');void call('profile',{displayName}).then(()=>fetch('/api/auth/me')).then(r=>r.json()).then(setProfile).catch(e=>setStatus(e.message));}}><label>Profil adı<input name="displayName" minLength={1} maxLength={60} defaultValue={profile.displayName||''} required/></label><button className="button">Profili kaydet</button></form><button className="button secondary" onClick={()=>void logout()}>Çıkış yap</button></>:<button disabled={busy} className="button" onClick={()=>void connect()}>{busy?'Cüzdan bekleniyor…':'MetaMask ile güvenli giriş ↗'}</button>}<p role="status">{status}</p><small>Giriş imzası ödeme yetkisi vermez. Gerçek TURK talepleri kapalı.</small></div>;
}
