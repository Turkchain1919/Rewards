'use client';
import {useEffect,useState} from 'react';
import {T,useLanguage} from './i18n';
import Link from 'next/link';
import {useRuntime} from './runtime';
import HeroMedia from './hero-media';
type HeroImage={url:string;width:number;height:number};
export default function Hero(){
 const {config}=useRuntime(),lang=useLanguage(),branding=config?.branding,title=(lang==='en'?branding?.homepageTitleEn:branding?.homepageTitleTr)||branding?.homepageTitle||'Community rewards';
 const [image,setImage]=useState<HeroImage|null>(null);
 useEffect(()=>{let active=true,request=0;const controller=new AbortController();async function load(){const ticket=++request;try{const r=await fetch('/api/hero',{cache:'no-store',signal:controller.signal});if(!r.ok)return;const d=await r.json();if(active&&ticket===request)setImage(d?.url?d:null);}catch{}}
 const visible=()=>{if(document.visibilityState==='visible')void load();};const storage=(event:StorageEvent)=>{if(event.key==='rewards-hero-updated')visible();};void load();window.addEventListener('focus',visible);window.addEventListener('rewards-hero',visible);document.addEventListener('visibilitychange',visible);window.addEventListener('storage',storage);return()=>{active=false;controller.abort();window.removeEventListener('storage',storage);window.removeEventListener('focus',visible);window.removeEventListener('rewards-hero',visible);document.removeEventListener('visibilitychange',visible);};},[]);
 return <section className="hero"><div><h1>{title}</h1><p><T value="Topluluğa katıl. Kampanyaları keşfet. Doğrulanmış katkılarını tek bir yerden takip et."/></p><Link className="button" href={'/'+lang+'/dashboard'}><T value="Kampanyaları keşfet "/><span>↗</span></Link></div><div className="hero-visual">{image?<HeroMedia key={image.url} src={image.url} onError={()=>setImage(null)}/>:<div className="orb" aria-hidden="true"><div className="orb-fallback"><span>✦</span><small>{config?.currency.symbol||''} / {config?.chainId||''}</small></div></div>}</div></section>;
}
