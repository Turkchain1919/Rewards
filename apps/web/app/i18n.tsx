'use client';
import {createContext,useContext} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import dictionary from './translations.json';
const Locale=createContext<'en'|'tr'>('tr');
export function LocaleProvider({language,children}:{language:'en'|'tr';children:React.ReactNode}){return <Locale.Provider value={language}>{children}</Locale.Provider>;}
export function useLanguage(){return useContext(Locale);}
export function translateText(value:string,language:'en'|'tr'){
 const key=value.trim().replace(/\s+/g,' '),trToEn=dictionary as Record<string,string>;
 const enToTr=Object.fromEntries(Object.entries(trToEn).map(([tr,en])=>[en,tr]));
 const translated=language==='en'?trToEn[key]||key:enToTr[key]||key;
 return (/^\s/.test(value)?' ':'')+translated+(/\s$/.test(value)?' ':'');
}
export function T({value}:{value:string}){return <>{translateText(value,useLanguage())}</>;}
export function LanguageSwitcher(){const path=usePathname(),router=useRouter(),language=useLanguage();return <label className="language-switch"><span className="sr-only">Language</span><select aria-label="Language" value={language} onChange={e=>{const lang=e.target.value;document.cookie='rewards_lang='+lang+';Path=/;Max-Age=31536000;SameSite=Lax'+(location.protocol==='https:'?';Secure':'');const bare=path.replace(/^\/(en|tr)(?=\/|$)/,'')||'/';router.push('/'+lang+(bare==='/'?'':bare));}}><option value="tr">TR</option><option value="en">EN</option></select></label>;}
