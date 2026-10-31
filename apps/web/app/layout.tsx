import type {Metadata} from 'next';
import './style.css';
export const metadata:Metadata={title:'Turkchain® Social Rewards',description:'Turkchain topluluğu için şeffaf ödül platformu'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><body><header><a href="/" className="brand"><span>✦</span> TURKCHAIN<small>SOCIAL REWARDS</small></a><nav><a href="/dashboard">Kontrol paneli</a><a href="/admin">Yönetim</a><a href="https://turkscan.com" target="_blank" rel="noreferrer">TurkScan ↗</a></nav></header>{children}<footer>Turkchain® · Toplulukla büyür.<span>Chain 1919 · Native TURK</span></footer></body></html>;}
