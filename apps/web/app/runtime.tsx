'use client';
import {T} from "./i18n";
import { useLanguage } from './i18n';
import { createContext, useContext, useEffect, useState } from 'react';
export type WalletProvider = {
    request: (args: {
        method: string;
        params?: unknown[];
    }) => Promise<unknown>;
    disconnect?: () => Promise<void>;
};
export type PublicConfig = {
    networkId: string;
    networkKey: string;
    networkName: string;
    chainId: number;
    chainIdHex: string;
    rpcUrl: string;
    wssUrl: string;
    explorerUrl: string;
    currency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    wallet: {
        metamaskEnabled: boolean;
        walletConnectEnabled: boolean;
        walletConnectProjectId: string;
        autoAdd: boolean;
        autoSwitch: boolean;
    };
    networks: {
        id: string;
        key: string;
        name: string;
        chainId: string;
        isActive: boolean;
    }[];
    multiChainEnabled: boolean;
    claimsPaused: boolean;
    claimContract: string;
    branding: {
        appName: string;
        brandName: string;
        logoUrl: string;
        faviconUrl: string;
        ogImageUrl: string;
        defaultLanguage: string;
        primaryColor: string;
        homepageTitle: string;
        metaDescription: string;
        keywords: string;
        homepageTitleEn: string;
        homepageTitleTr: string;
        metaDescriptionEn: string;
        metaDescriptionTr: string;
        footerEn: string;
        footerTr: string;
        footer: string;
        supportEmail: string;
        officialWebsite: string;
    };
};
const Context = createContext<{
    config: PublicConfig | null;
    refresh: () => Promise<void>;
    select: (key: string) => void;
    query: string;
    walletProvider: WalletProvider | null;
    setWalletProvider: (p: WalletProvider | null) => void;
}>({ config: null, refresh: async () => { }, select: () => { }, query: '', walletProvider: null, setWalletProvider: () => { } });
export function RuntimeProvider({ children, initialConfig }: {
    children: React.ReactNode;
    initialConfig?: PublicConfig | null;
}) {
    const [config, setConfig] = useState<PublicConfig | null>(initialConfig || null), [key, setKey] = useState('');
    const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(null);
    async function refresh() { try {
        const r = await fetch('/api/config' + (key ? '?network=' + encodeURIComponent(key) : ''), { cache: 'no-store' });
        if (r.ok) {
            const c = await r.json();
            setConfig(c);
            document.documentElement.style.setProperty('--accent', c.branding.primaryColor);
            window.dispatchEvent(new Event('rewards-config-ready'));
        }
        else if (key)
            setKey('');
    }
    catch { } }
    useEffect(() => { void refresh(); const listener = () => void refresh(); window.addEventListener('rewards-config', listener); window.addEventListener('focus', listener); const timer = setInterval(listener, 30000); return () => { window.removeEventListener('rewards-config', listener); window.removeEventListener('focus', listener); clearInterval(timer); }; }, [key]);
    return <Context.Provider value={{ config, refresh, select: setKey, walletProvider, setWalletProvider, query: config ? '?network=' + encodeURIComponent(config.networkKey) : '' }}>{children}</Context.Provider>;
}
export const useRuntime = () => useContext(Context);
export function NetworkSelector() { const { config } = useRuntime(); if (!config)
    return <p><T value="Yapılandırma yükleniyor…"/></p>; return <div className="network-select"><strong>{config.networkName}</strong><p>{config.currency.symbol}<T value=" · Chain "/>{config.chainId}<T value=" · Tek zincire kilitli"/></p></div>; }
export function DynamicBrand() { const { config } = useRuntime(); return <>{config?.branding.logoUrl ? <img src={config.branding.logoUrl} className="brand-image" alt=""/> : <span>✦</span>}{config?.branding.brandName || 'REWARDS'}<small>{config?.branding.appName || 'SOCIAL REWARDS'}</small></>; }
export function DynamicFooter() { const { config } = useRuntime(), language = useLanguage(); return <>{(language === 'en' ? config?.branding.footerEn : config?.branding.footerTr) || config?.branding.footer || 'Social Rewards'}<span>{config?.networkName || ''} · {config?.currency.symbol || ''}</span></>; }
