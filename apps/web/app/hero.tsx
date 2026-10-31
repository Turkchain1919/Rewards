'use client';
import {T} from "./i18n";
import Link from 'next/link';
import { useRuntime } from './runtime';
import { useLanguage } from './i18n';
export default function Hero() { const { config } = useRuntime(), lang = useLanguage(); const branding = config?.branding, title = (lang === 'en' ? branding?.homepageTitleEn : branding?.homepageTitleTr) || branding?.homepageTitle || 'Community rewards'; return <section className="hero"><div><h1>{title}</h1><p><T value="Topluluğa katıl. Kampanyaları keşfet. Doğrulanmış katkılarını tek bir yerden takip et."/></p><Link className="button" href={'/' + lang + '/dashboard'}><T value="Kampanyaları keşfet "/><span>↗</span></Link></div><div className="orb" aria-hidden="true"><span>✦</span><small>{config?.currency.symbol || ''} / {config?.chainId || ''}</small></div></section>; }
