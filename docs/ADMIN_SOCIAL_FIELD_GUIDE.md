# Yönetici sosyal medya alan rehberleri — v0.5.5

5 Kasım 2026. Bu ek, mevcut kullanıcı merkezi çalışmasına kullanıcının talebiyle dahil edilmiştir. API, şema, OAuth, MFA ve ödül kuralları değiştirilmez.

## Nerede görünür?

- `/tr/admin#social/api` / `/en/admin#social/api`: seçilen platformun OAuth, credentials, webhook ve izin alanları.
- `#social/accounts`: resmî hesap adı, kullanıcı adı, hesap kimliği, profil ve varsayılan görev URL alanları.
- `#social/status`: mevcut gelişmiş/legacy credential ve callback formları.
- `#tasks/new` / toplu oluşturma: platforma göre resmî hedef, hedef URL ve nesne kimliği.
- Klasik görev formu: sosyal platform seçilince hedef hesap ve URL rehberi. TURKCHAIN eğitim akışı değiştirilmez.
- Gelişmiş API credentials ekranı: sosyal platform anahtarları datalist içinde; scope/ownerId farkını açıklayan not ve platforma özel ekrana bağlantı.

Sekiz ana platformun tamamı kapsanır: X, YouTube, Instagram, Telegram, Facebook, Kick, Twitch, TikTok. Var olan Discord ve GitHub legacy formları da rehberlidir; yeni connector veya görev desteği eklenmez. Özel metadata platformlarında resmî connector/belge gerekliliği gösterilir; adres uydurulmaz.

## Alan davranışı

Alan altında kısa açıklama, resmî kaynak bağlantısı ve açılabilir edinme adımları vardır. Yardım linkleri statik HTTPS adresleridir; secret, token veya girilen form değeri URL parametresine eklenmez. Yeni sekme bağlantıları `noopener noreferrer` ve `no-referrer` kullanır.

Client ID/App ID, Client Secret/App Secret, API key/secret, uygulama Bearer Token, OAuth access/refresh token, Page token, bot token, callback, scopes, webhook, hesap kimliği ve görev nesne kimliği açıklanır. Sağlayıcının standart formunda kullanılmayan legacy genel alanlar açıkça belirtilir; hayalî bir Bot/API Key menüsü tarif edilmez.

- Access/refresh token için mevcut hesap sahibinin OAuth bağlantısı esas alınır. Sağlayıcı refresh token vermiyorsa boş kalır.
- Callback/webhook URL kopyası formdaki gerçek adresi kullanır. TEST ve production adresleri birbirine sabitlenmez.
- Telegram grup/kanal ID eksi işaretli string veya geçerli @username olmalıdır; mevcut doğrulama değiştirilmez.
- Instagram medya kısa kodu, Graph medya ID ile; YouTube @handle, UC kanal ID ile; TikTok kullanıcı adı, app-scoped open_id ile karıştırılmaz.
- Gelişmiş credentials scope alanındaki OFFICIAL_ACCOUNT ownerId, uygulamadaki hesap kayıt referansıdır; dış sağlayıcının Chat ID/kanal ID değeri değildir.

## Güvenli tek tık yardımcıları

1. Resmî uygulama/kimlik bilgisi kaynağını açma.
2. Gerekli yerden mevcut Resmî sosyal hesaplar akışına gitme.
3. Yalnız public callback/webhook adresini kopyalama.
4. Telegram, Meta Verify Token ve Twitch EventSub için yeni webhook secret adayını tarayıcıda Web Crypto ile üretme:32 rastgele byte,64 hex karakter.
5. Yalnız bu formda yeni üretilen ve değiştirilmemiş webhook secret adayını açık kullanıcı tıklamasıyla kopyalama.

Üretme/kopyalama API isteği yapmaz ve kayıtlı yapılandırmayı değiştirmez. Yeni aday password alanında maskeli kalır. Mevcut dolu taslak üzerine yazılmaz. Form reset/yeniden bağlama aday referansını temizler. Kayıtlı API key/token/secret değerleri okunmaz veya geri döndürülmez. Gerçek kayıt ancak mevcut Kaydet işlemi ve mevcut OWNER/MFA kontrolleriyle olur. API Client Secret, bot token veya OAuth tokenı yerel rastgele üretimle taklit edilmez. Kick RSA webhook doğrulaması için paylaşılan secret üretilmez.

## İncelenen resmî kaynaklar

| Platform | Panel | Belge |
|---|---|---|
| X | https://developer.x.com/ | https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code |
| YouTube | https://console.cloud.google.com/apis/credentials | https://developers.google.com/youtube/data/getting-started ; https://support.google.com/youtube/answer/3250431 |
| Instagram | https://developers.facebook.com/apps/ | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login |
| Telegram | https://t.me/BotFather | https://core.telegram.org/bots/telegram-login ; https://core.telegram.org/bots/api |
| Facebook | https://developers.facebook.com/apps/ | https://developers.facebook.com/docs/pages-api ; https://developers.facebook.com/docs/facebook-login/guides/access-tokens/ |
| Kick | https://kick.com/settings/developer | https://github.com/KickEngineering/KickDevDocs/blob/main/getting-started/kick-apps-setup.md |
| Twitch | https://dev.twitch.tv/console/apps | https://dev.twitch.tv/docs/authentication/register-app/ ; https://dev.twitch.tv/docs/eventsub/handling-webhook-events/ |
| TikTok | https://developers.tiktok.com/apps/ | https://developers.tiktok.com/docs/en/getting-started-create-an-app |
| Discord | https://discord.com/developers/applications | https://docs.discord.com/developers/topics/oauth2 |
| GitHub | https://github.com/settings/developers | https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app |

Meta dokümanlarına doğrudan erişimde429 sınırı görüldü. Meta'nın kendi [Postman koleksiyonu](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api) incelendi; resmî belge bağlantıları korunur. Gerçek owner hesabıyla özel app console ekranları ve bütün platformlarda credentials alma/izin onayı tamamlanmış sayılmaz. Panel başvurusu, sağlayıcı oturumu,2FA veya app review gerektiren adımlar kullanıcı tarafından yapılır. Rehber bağlantısı API erişimi veya ödüllü görev yayın izni kanıtı değildir.

## Gerçek dosyalar

Kökler TEST `/var/www/rewards.turkscan.com/REWARDSTEST`, production `/var/www/rewards.turkscan.com/rewards`.

- `apps/web/app/admin/social-field-guides.ts`: bilingual açıklamalar, ortak credential alan listesi ve resmî adresler.
- `apps/web/app/admin/social-field-help.tsx`: erişilebilir alan notu, details, statik linkler ve yerel yardımcılar.
- `apps/web/app/admin/social-api.tsx`: ana provider formuna bağlama.
- `apps/web/app/admin/social-management.tsx`: hesap/platform ve legacy alanlara bağlama.
- `apps/web/app/admin/social-task-builder.tsx`: dinamik görev hedeflerine bağlama.
- `apps/web/app/admin/modules.tsx`: klasik sosyal görev hedeflerine bağlama.
- `apps/web/app/admin/settings.tsx`: gelişmiş credential yönlendirmesi ve ID/scope ayrımı.
- `apps/web/app/admin/admin.css`: mevcut `--ad-*` theme değişkenleriyle responsive tasarım.
- `tests/social-field-guides.test.ts`: resmî HTTPS kaynakları, kimlik türleri ve güvenli üretim sınırları.
- `tests/browser-admin-field-help.e2e.mts`:10 connector, TR/EN, desktop/mobile, maskeli değer, copy/reset ve işlem yapmayan rehber kontrolleri.

Form alan adları, tipleri, submit payloadları, endpointler ve yetkiler korunur. Düğmeler `type=button` kullanır; veri alanı üretmez. `aria-describedby` kısa açıklamaya bağlanır; uzun adımlar ayrıca açılır. Mevcut açık/koyu tema ve mobil düzen kullanılır; yeni UI kütüphanesi yoktur.

## Test ve yayın kanıtı

Genel kullanıcı merkezi kanıtı `.runtime/user-hub-v055/`; son UI eklerinin yayın kanıtı `.runtime/user-hub-count-v055/` altında tutulur. Son kaynak SHA, current symlink, production manifesti ve GitHub main ile doğrulanmalıdır.

İlk rehber unit çalışmasında resmî `x.com` adresi test allowlistinde eksikti; teste eklendi. İlk browser denemesi yeni iç details öğeleri nedeniyle birden fazla summary buldu; dış summary seçilerek düzeltildi. Bunlar gerçek provider auth hatası gibi raporlanmaz. Browser fixture testleri gerçek credentials alma veya gerçek platform OAuth onayı değildir. Rehber/üretme/kopyalama testlerinde sunucuya yazma yapılmaz; production key veya kullanıcı/bakiye kaydı değiştirilmez.

## WalletConnect Project ID isteği

WalletConnect alanına Reown Dashboard ve resmî relay/origin belgesi bağlantıları eklendi. Verilen public Project ID production DB kaydı ve etkin public configte zaten aynıydı; production ayarı değiştirilmedi. TEST alanı boştu: yalnız aktif ağın walletConnectProjectId alanı/version ve audit kaydı transaction içinde güncellendi. Diğer ağ/claim ayarları karşılaştırılarak korundu. TEST audit etiketindeki operatör isimlendirme hatası, özgün kaydı değiştirmeden ayrı bir düzeltme işaretiyle kaydedildi. Project ID kaynak koda/GitHub’a sabitlenmedi. Runtime kanıtı .runtime/user-hub-v055/walletconnect-project-check.json.

Resmî kaynaklar: https://dashboard.reown.com/ ve https://docs.reown.com/cloud/relay . Alan değeri kayıtlı ağın Düzenle ekranından görülür; yeni form etkin ortamın mevcut kayıt değeriyle karıştırılmamalıdır.

## Tamamlanan son kontroller

- Son kaynakla TypeScript, lint, build ve tam test-all başarılı:66 uygulama testi,19 browser çalıştırması,10 kontrat testi; atlama yok, npm audit0,15 migration güncel.
- Ek gerçek Chrome156 görsel/işlev kontrolü:TR/EN×1440/390,10 mevcut connector formu,TR koyu/EN açık tema; kaynağa gitme adresleri, maskeli alanlar, public URL ve yalnız yeni webhook secret kopyası; sunucuya yazma yok.
- Production WalletConnect:gerçek sayfada QR ve Relay JSON-RPC abonelik yanıtı başarılı. Cüzdan onayı ve gerçek giriş yapılmadı; bütün production API POSTları testte engellenerek yeni kullanıcı/ödül kaydı oluşturulmadı.
- Gerçek provider credentials edinme veya bütün platformlarda OAuth rızası test edilmedi. Telegram Desktop/fiziksel telefon onayı ve başarılı gerçek Telegram callbacki ayrıca doğrulanamadı.
