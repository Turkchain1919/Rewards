'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import dictionary from './translations.json';
type Language='en'|'tr';
const Locale=createContext<{language:Language;select:(language:Language)=>void}>({language:'tr',select:()=>{}});
export function LocaleProvider({language,children}:{language:Language;children:React.ReactNode}){
 const path=usePathname(),[selected,setSelected]=useState<Language|null>(null),route=path.match(/^\/(en|tr)(?:\/|$)/)?.[1],active=selected||(route==='en'||route==='tr'?route:language);
 // Root layouts survive client navigation. URL changes and history must update the context too.
 useEffect(()=>{setSelected(null);},[path]);
 useEffect(()=>{document.documentElement.lang=active;},[active]);
 return <Locale.Provider value={{language:active,select:setSelected}}>{children}</Locale.Provider>;
}
export function useLanguage(){return useContext(Locale).language;}
export function translateText(value:string,language:Language){
 const key=value.trim().replace(/\s+/g,' '),trToEn=dictionary as Record<string,string>;
 const enToTr=Object.fromEntries(Object.entries(trToEn).map(([tr,en])=>[en,tr]));
 const translated=language==='en'?trToEn[key]||key:enToTr[key]||key;
 return (/^\s/.test(value)?' ':'')+translated+(/\s$/.test(value)?' ':'');
}
export function T({value}:{value:string}){return <>{translateText(value,useLanguage())}</>;}
export function LanguageSwitcher({preserveHash=true}:{preserveHash?:boolean}={}){
 const path=usePathname(),router=useRouter(),locale=useContext(Locale);
 return <label className="language-switch"><span className="sr-only">Language</span><select aria-label="Language" value={locale.language} onChange={e=>{const lang=e.target.value as Language;locale.select(lang);document.cookie='rewards_lang='+lang+';Path=/;Max-Age=31536000;SameSite=Lax'+(location.protocol==='https:'?';Secure':'');const bare=path.replace(/^\/(en|tr)(?=\/|$)/,'')||'/';router.push('/'+lang+(bare==='/'?'':bare)+location.search+(preserveHash?location.hash:''),{scroll:false});}}><option value="tr">TR</option><option value="en">EN</option></select></label>;
}
