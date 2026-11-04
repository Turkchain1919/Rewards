import SiteHeader from './site-header';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './style.css';
import { RuntimeProvider, DynamicFooter } from './runtime';
import { LocaleProvider } from './i18n';
import { serverConfig } from './server-config';
export async function generateMetadata(): Promise<Metadata> {
    const config = await serverConfig(), b = config?.branding;
    const h = await headers(), path = h.get('x-rewards-path') || '/', requested = h.get('x-rewards-locale'), locale = requested === 'en' || requested === 'tr' ? requested : b?.defaultLanguage || 'tr';
    const base = new URL(process.env.APP_URL || 'http://localhost:18190');
    return { metadataBase: base, title: b?.appName || process.env.APP_NAME || 'Social Rewards', description: (locale === 'en' ? b?.metaDescriptionEn : locale === 'tr' ? b?.metaDescriptionTr : '') || b?.metaDescription || process.env.APP_META_DESCRIPTION, keywords: b?.keywords?.split(',').map(k => k.trim()), alternates: { canonical: path, languages: { en: '/en', tr: '/tr' } }, icons: { icon: b?.faviconUrl || '/icon.svg' }, openGraph: { title: b?.appName || 'Social Rewards', description: b?.metaDescription, url: new URL(path, base), siteName: b?.brandName, locale: locale === 'en' ? 'en_US' : 'tr_TR', ...(b?.ogImageUrl ? { images: [b.ogImageUrl] } : {}) }, twitter: { card: b?.ogImageUrl ? 'summary_large_image' : 'summary', title: b?.appName, description: b?.metaDescription, ...(b?.ogImageUrl ? { images: [b.ogImageUrl] } : {}) }, robots: path.includes('/admin') ? { index: false, follow: false } : undefined };
}
export default async function RootLayout({ children }: {
    children: React.ReactNode;
}) {
    const config = await serverConfig(), h = await headers(), requested = h.get('x-rewards-locale'), language = (requested === 'en' || requested === 'tr' ? requested : config?.branding.defaultLanguage === 'en' ? 'en' : 'tr') as 'en' | 'tr';
    return <html lang={language}><body><RuntimeProvider initialConfig={config}><LocaleProvider language={language}><SiteHeader/>{children}<footer><DynamicFooter /></footer></LocaleProvider></RuntimeProvider></body></html>;
}
