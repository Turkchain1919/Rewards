'use client';
import Link from 'next/link';
import {DynamicBrand} from './runtime';
import {T,LanguageSwitcher,useLanguage} from './i18n';
export default function SiteHeader(){const language=useLanguage();return <header><Link href={'/'+language} className="brand"><DynamicBrand/></Link><nav><Link href={'/'+language+'/dashboard'}><T value="Kontrol paneli"/></Link><Link href={'/'+language+'/admin'}><T value="Yönetim"/></Link><LanguageSwitcher/></nav></header>;}
