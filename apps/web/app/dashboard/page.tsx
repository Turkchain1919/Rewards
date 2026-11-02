import EarningGuide from './earning-guide';
import {T} from "../i18n";
import Claims from './claims';
import Wallet from '../wallet';
import TaskBoard from './board';
import OfficialAccounts from './official';
import SocialAccounts from './social';
export default function Dashboard() { return <main><div className="eyebrow"><T value="TOPLULUK / KONTROL PANELİ"/></div><h1><T value="Hoş geldin."/></h1><p><T value="Profilini, topluluk görevlerini ve doğrulanmış ödüllerini tek yerden takip et."/></p><EarningGuide /><section id="wallet-access"><Wallet /></section><section id="social-accounts"><SocialAccounts /></section><section id="community-tasks"><TaskBoard /></section><Claims /><OfficialAccounts /></main>; }
