'use client';
import {useEffect,useState} from 'react';
import {T,useLanguage} from './i18n';
import Link from 'next/link';
import {useRuntime} from './runtime';
export default function Hero(){const {config}=useRuntime(),lang=useLanguage();const branding=config?.branding,title=(lang==='en'?branding?.homepageTitleEn:branding?.homepageTitleTr)||branding?.homepageTitle||'Community rewards';const [image,setImage]=useState<{url:string;width:number;height:number}|null>(null);
 useEffect(()=>{let active=true;void fetch('/api/hero',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(active&&d?.url)setImage(d);}).catch(()=>{});return()=>{active=false;};},[]);
 return <section className="hero"><div><h1>{title}</h1><p><T value="Topluluğa katıl. Kampanyaları keşfet. Doğrulanmış katkılarını tek bir yerden takip et."/></p><Link className="button" href={'/'+lang+'/dashboard'}><T value="Kampanyaları keşfet "/><span>↗</span></Link></div><div className="orb" aria-hidden="true">{image&&<img className="hero-gif" src={image.url} alt="" onError={()=>setImage(null)}/>}<div className="orb-fallback"><span>✦</span><small>{config?.currency.symbol||''} / {config?.chainId||''}</small></div></div></section>;
}