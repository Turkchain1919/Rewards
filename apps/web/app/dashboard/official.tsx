'use client';
import {T} from "../i18n";
import { useEffect, useState } from 'react';
type Account = {
    id: string;
    platform: string;
    name: string;
    profileUrl: string;
    defaultTargetUrl: string;
    isDefault: boolean;
};
export default function OfficialAccounts() { const [accounts, setAccounts] = useState<Account[]>([]); useEffect(() => { void fetch('/api/official-accounts').then(r => r.ok ? r.json() : []).then(setAccounts); }, []); if (!accounts.length)
    return null; return <section><h2><T value="Resmî proje hesapları"/></h2><div className="grid">{accounts.map(a => <article key={a.id}><span>{a.platform}</span><h3>{a.name}</h3>{a.profileUrl && <a className="button secondary" href={a.profileUrl} target="_blank" rel="noreferrer"><T value="Resmî hesabı aç ↗"/></a>}{a.defaultTargetUrl && a.defaultTargetUrl !== a.profileUrl && <p><a href={a.defaultTargetUrl} rel="noreferrer" target="_blank"><T value="Görev hedefini aç ↗"/></a></p>}</article>)}</div></section>; }
