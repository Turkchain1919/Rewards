import {T} from '../i18n';
const steps=[
 ['Cüzdanını bağla.','MetaMask ile giriş yap. Cüzdan bağlantısı zorunlu ilk adımdır.'],
 ['Gerekli sosyal hesabı bağla.','Sosyal hesap bağlantısı yalnızca seçtiğin görev gerektiriyorsa zorunludur. Eğitim görevleri için gerekmeyebilir.'],
 ['Görevini seç ve talimatları oku.','Ödül miktarını, koşulları, tarihleri ve görev adımlarını kontrol et.'],
 ['Görevi tamamla.','Telegram görevinde belirtilen resmî gruba veya kanala katıl.'],
 ['Görevi doğrula.','Üyeliğini doğrula düğmesine bas veya görev kanıtını incelemeye gönder. Bağlantı tek başına ödül kazandırmaz.'],
 ['TURK ödülünü iç bakiyende gör.','Başarılı doğrulama veya onay sonrasında sunucunun belirlediği ödül AVAILABLE bakiyene bir kez eklenir.']
];
export default function EarningGuide({authenticated=false}:{authenticated?:boolean}={}){return <section className="panel earning-guide" aria-labelledby="earning-guide-title"><h2 id="earning-guide-title"><T value="Nasıl TURK Kazanılır?"/></h2><ol>{steps.filter((_,i)=>!authenticated||i>0).map(([title,detail])=><li key={title}><strong><T value={title}/></strong><p><T value={detail}/></p></li>)}</ol><p><strong><T value="Telegram örneği"/></strong>: <T value="MetaMask ile giriş → Telegram hesabını bağla → Turkchain1919 grubuna katıl → Üyeliğini doğrula → Belirlenen TURK ödülünü iç bakiyende gör."/></p><p className="notice"><T value="AVAILABLE platform içi bakiyedir. Gerçek cüzdan transferleri ve claim işlemleri şu anda kapalıdır."/></p>{!authenticated&&<a className="button" href="#wallet-access"><T value="İlk adım: cüzdanını bağla"/></a>}</section>;}
