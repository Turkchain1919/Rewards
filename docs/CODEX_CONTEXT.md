# v0.5.3 Telegram / mobil WalletConnect /7gün admin oturumu

Önce [TELEGRAM_WALLET_SESSION_FIX.md](TELEGRAM_WALLET_SESSION_FIX.md) okuyun. Telegram JWT sub BotAPI ID değildir; doğrulanmış profile.id kullanılır. Eski hesap deployment tarafından yazılmaz; user reconnect gerekir. Mobil aynı tarayıcı WalletConnect akışı, tek namespace signing izni, app/Web/kopya grup hedefi; verified admin cookie+DBexpiry7gün, MFAstepup aynı. Yeni schema/migration/contract yok; claims paused. Kesin canlı SHA deploymentmanifest/current/Git ve .runtime/telegram-flow-v053/ son raporundan doğrulanır.

# v0.5.2 — Kullanıcı talebi: yalnız otomatik GIF

Duraklat/başlat kutusu ve yazısı ana sayfa/yönetici önizlemesinden kaldırıldı. HeroMedia yalnız doğrudan img gösterir; canvas veya uygulama düzeyinde hareket azaltma/duraklatma mekanizması yoktur. GIF her iki motion tercihinde kaynak döngüsüyle otomatik oynar. Önceki aşağıdaki pause/canvas açıklamaları tarihseldir. Yeni kanıtlar .runtime/hero-autoplay-v052/ altında tutulur. Backend/DB/claims değişmez.

# v0.5.2 Hero GIF doğal gösterim

Önceki canlı d7beec7 mobil cüzdan/dil düzeltmesi tamamlandı. Yeni hero düzeni: ortak hero-media.tsx, doğal oran/contain, yüklenen görselde maske yok, otomatik animasyon ve erişilebilir pause checkboxı; admin preview aynı. Bkz [HERO_VISUAL.md](HERO_VISUAL.md). Kesin son canlı SHA deployment manifest/current/Git ile ve .runtime/hero-responsive-v052/ raporuyla doğrulanır. Production kayıtlarına müdahale/migration yok; claims kapalı.

# v0.5.2 aday frontend düzeltmesi

Mobil MetaMask dapp yönlendirmesi, anlık TR/EN ve reduced-motion GIF görünürlüğü. Backend/DB/kontrat değişikliği yok. Ayrıntılar: [MOBILE_WALLET_LOCALE_HERO_FIX.md](MOBILE_WALLET_LOCALE_HERO_FIX.md). Yayın sonucu runtime kanıtıyla doğrulanmalıdır.

# CODEX_CONTEXT — Turkchain® Rewards

## v0.5.1 — Admin arayüzü, 4Kasım2026

UI/UX dalı `feature/admin-ui-ux-v051`; taban `dc2e8ad` (v0.5.0). Yeni rol bazlı264/72sidebar, mobil drawer, URLfragment kalıcılığı, odaklanmış tablolar, tek girişli4adım görev akışı, aranabilirIANA, sekmeli8platformAPI ve scoped dark/light tasarım. Mevcut backend/API/15migration/OAuth/Telegram/ledger/claim/RBAC/MFA aynı; yeni bağımlılık yok. Aşağıdaki eski sürüm açıklamaları tarihsel bağlamdır.

Önce [ADMIN_UI_UX_STRUCTURE.md](ADMIN_UI_UX_STRUCTURE.md) okuyun: gerçek menü yolları, bütün işlev eşlemesi, UI bileşenleri, testler ve deployment kapsamı. `/tr/admin#tasks/new` örneği frontend fragmentidir, yeni API endpointi değildir. Source/backend farklılığı guard ile reddedilir; production migration yapılmaz. Son sağlıklı SHA ve gerçek kayıt sayıları deploymentmanifest/dış `ADMIN_UI_UX_RELEASE_REPORT.md` ile doğrulanır. `REWARD_CLAIMS_PAUSED=true`; yeni görev/kampanya/ödül/transfer oluşturulmaz.


## Canlı envanter düzeltmesi — 3 Kasım 2026, yayın sonrası doğrulama

11:28UTC envanterindeki3 kampanya/4 görev, yayından **önce**,12:29:00–12:29:18UTC (Türkiye15:29) arasında OWNER oturumundan silinmiştir. Audit kayıtlarında TASK_DELETE/CAMPAIGN_DELETE ve öncesinde OWNER MFA login vardır. Güncel yayın öncesi13:03UTC yedeğinde ve migration sonrasında **0 kampanya/0 görev** bulunur; eski sütun/row hashleri eşleşir. Silmeler bu deployment veya migration tarafından yapılmamıştır. İşlemi yapan gerçek kişi yalnız audit actoründen çıkarılamaz. Mevcut kullanıcı, ledger ve CONNECTED Telegram hesabı korunur. Yeni görev/kampanya oluşturulmamış, silinmiş kayıtlar geri yüklenmemiştir.

Aşağıdaki1TURK/25 kullanıcı/25TURK görevi referansları artık **tarihsel görev tanımıdır**, aktif canlı görev değildir. Görev motoru regression fixture'ları bu yapıyı test eder; güncel canlı panel doğru şekilde “Henüz yayınlanmış görev yok” gösterir. Yeni ödüllü görevin yayınlanması ayrı açık operatör işlemi gerektirir. Canlı kontrolün ilk denemesinde eski görevID'si bekleyen rapor scripti başarısız olmuştur; bu uygulama hatası değil, eski envanter varsayımıdır ve gizlenmeden raporlanır.


Her yeni geliştirme öncesinde CODEX_CONTEXT.md ve ilgili teknik dokümantasyon dosyalarını oku. Önce mevcut mimariyi incele, ardından değişiklik yap. Dokümantasyonla mevcut kod arasında farklılık varsa önce mevcut kodu esas al ve dokümantasyonu güncelle.

## Proje, sürüm ve kayıtlar

Turkchain Rewards, cüzdanla giriş yapan kullanıcıların izinli topluluk görevlerini tamamlayıp TURK iç muhasebe bakiyesi kazandığı bir web uygulamasıdır. İç bakiye gerçek blockchain transferi değildir.

Bu kaynak v0.5.0 Multi-Social altyapısıdır; geliştirme dalı `feature/multi-social-rewards-engine`. Önceki production commit: `3c85ac1a29b51d86d74d1fe7cc847ee391f7a4c0` (v0.4.5). Eski `e74ac22` veya `cc61b966` referanslarını güncel canlı sürüm saymayın. Kesin çalışan SHA: production `.runtime/deployment.json`, `current` symlink ve Git HEAD birlikte kontrol edilir. Tamamlanmış yayın kanıtı `PRODUCTION_RELEASE_REPORT.md` içinde tarif edilen dış rapor/artefactlardadır; aday raporu tek başına yayın kanıtı değildir.

Sunucu `138.226.246.138`; TEST `/var/www/rewards.turkscan.com/REWARDSTEST`; production `/var/www/rewards.turkscan.com/rewards`; domain https://rewards.turkscan.com. GitHub `Turkchain1919/Rewards`. Dış ilerleme kaydı `/var/www/rewards.turkscan.com/PROJECT_HANDOFF.md`.

TurkScan companion sunucusu `138.226.240.16` üzerindeki `/root/frontend/CODEX_PROGRESS.md` ve uzak AGENTS.md ilk okunur; ayrı TurkScan kaynaklarına/containerlarına dokunulmaz. Ortak flock yolu `/root/frontend/.codex/session.lock`. İlerleme önemli adımlardan sonra, en geç5dakikada atomik kaydedilir. Yarım build/deploy başarı değildir. Sırlar, `.env` içerikleri ve tokenlar rapora yazılmaz.

## Ortamlar ve servisler

| Alan | TEST | PRODUCTION |
|---|---|---|
| Web / API | 18190 / 18290 | 18191 / 18291 |
| Redis | 18390 | 18391 |
| PostgreSQL14 DB | rewards_test | rewards_production |
| Origin | http://127.0.0.1:18480 | https://rewards.turkscan.com |
| systemd | rewards-test-{api,web,worker,redis} | rewards-prod-{api,web,worker,redis} |

PostgreSQL14 port5432 kullanılır. Nginx production HTTPS/Let's Encrypt, TEST yalnız loopback HTTP'dir. Kaynak, DB rolleri, Redis, ENV ve şifreleme anahtarları ayrıdır. Production `current → .releases/<SHA>` değişmez build artefactını çalıştırır; `previous` geri dönüş artefactıdır. Rewards PM2 veya Docker Compose ile çalışmaz. Diğer projelerin Docker servisleri kapsam dışıdır.

## Gerçek kaynak mimarisi

Next16/React19 (`apps/web/app`) → Nest12 (`apps/api/src`) → Prisma7/PostgreSQL14. Backend modülleri düz dosyalardadır; ayrı controllers/services/models klasörleri yoktur. Redis/BullMQ worker iki queue çalıştırır: maintenance15s ve social-credentials5min.

| Kaynak | Görev |
|---|---|
| apps/api/src/auth.ts, security.ts | SIWE kullanıcı oturumu; scrypt parola/TOTP admin; Origin, RBAC, şifreleme |
| apps/api/src/engine.ts, policy.ts | Kampanya/görev yönetimi; Telegram üyeliği; atomic bütçe, submission, ledger ve izin kapısı |
| apps/api/src/providers.ts, oauth-lifecycle.ts | OAuth/OIDC exchange, refresh, revoke ve kimlik denetimi |
| apps/api/src/integration-settings.ts, official-accounts.ts | Şifreli sağlayıcı ayarları ve çoklu resmî hedefler |
| apps/api/src/social-catalog.ts | 8 platform/65 görev için teknik/politika/izin/kaynak matrisi |
| apps/api/src/social-engine.ts, social-controller.ts | Yeni sosyal API, adapter orkestrasyonu, batch taslak ve private bot kanıtı |
| apps/api/src/social-adapters.ts | Ortak platform sözleşmesi; desteklenmeyen doğrulama fail-closed |
| apps/api/src/social-targets.ts, social-http.ts | URL/API host allowlist, sahiplik, timeout, redirect reddi, rate/backoff |
| apps/api/src/social-webhook-signatures.ts, kick-public-key.ts | Telegram secret, Twitch/Meta HMAC, dinamik Kick RSA anahtarı |
| apps/api/src/social-maintenance.ts, social-token-maintenance.ts | Süre/bütçe kapatma; geçici kanıt temizliği; Twitch token kontrolü |
| apps/web/app/admin/modules.tsx | Admin sekmelerinin temel yönetimi |
| apps/web/app/admin/social-task-builder.tsx | Dinamik platform/görev, owned hedef, TR/EN önizleme ve en çok20 atomik taslak |
| apps/web/app/admin/social-api.tsx, social-management.tsx | Anahtar/scopes/webhook ve resmî hesap ekranları |
| apps/web/app/admin/reward-limits.tsx | Onaylı, sürüm kontrollü gelecek ödül/bütçe/kota/tarih düzenleme |
| apps/web/app/dashboard/board.tsx, social.tsx, bot-task.tsx | Kullanıcı görevleri, ayrı sosyal hesaplar ve bot kanıt akışı |
| apps/web/app/translations.json, timezones.ts, social-icons.tsx | TR/EN, IANA↔UTC/DST ve platform simgeleri |
| prisma/schema.prisma |22 modelin gerçek alan/ilişki otoritesi |

## Veritabanı ve ödül güvenliği

19 eski modele ek olarak SocialRewardIdentity, SocialWebhookReceipt ve SocialChallenge vardır; migration `202611030001_multi_social_engine`15. sıradadır. `_prisma_migrations` ile23 fiziksel tablo.

LedgerEntry + LedgerEvent muhasebe otoritesidir. Decimal(78,0) integerwei kullanılır; float ile bakiye hesaplanmaz. Campaign→Task kilit sırası, serializable retry, kullanıcı/görev submission unique, ledger idempotency ve task/provider/accountHash unique korumaları birlikte uygulanır. Sosyal hesap başka cüzdana taşınsa da kalıcı ödül kimliği silinmez. Eski bağlantısı kaldırılmış bilinmeyen kimlikler migration sırasında uydurulmaz.

Eski Task.budgetWei null ise ortak kampanya bütçesi geçerlidir. Yeni katalog görevleri sonlu bağımsız bütçe ister. Task.allocatedWei DB CHECK ile bütçeyi aşamaz; global kampanya guardı ayrıca korunur. Manuel pending kayıt bütçeyi ayırır; rejection rezervi çözer. Yeni ödül miktarı önceki kazanılmış/pending tutarı değiştirmez. Limit düzenlemesi görevi pasife alır.

Webhook ledger yazmaz. İmzalı olayı receipt/short proof yapar; kullanıcı Verify isteği güncel kimlik/resmî hesap versionı/tarih/bütçe/policy kontrolleriyle atomic kredi üretir. Bot kanıtı10dk geçerlidir; geçici proof/receipt kayıtları7gün sonra temizlenir. Ledger, audit ve kimlik rezervasyonları otomatik silinmez.

## Tarihsel Telegram görevi, güncel bağlantı ve zincir

TELEGRAM kampanya `cmvxx6wdg0007sqify4ei3lih`; görev `cmw0i0bdw000039ifhpvwcfl1`. Kullanıcı başına1TURK, ilk25 kullanıcı, toplam25TURK. Eski10TURK taslağı güncel değildir. Önceki canlı envanter3kampanya/4görev/1kullanıcı/0ledger idi; güncel veri read-only snapshot ile doğrulanır.

Resmî GROUP `cmvxxbysj000isqifw90acmj0`, ChatID **string `-1003676977941`**, @Turkchain1919, bot @turkchainaibot. CONNECTED bağlantı korunur. GROUP/CHANNEL pozitif numeric ID reddedilir, @username desteklenir. Salt okuma kontrolünde normal connect endpointini çağırmayın: görev metadata/config durumunu değiştirebilir. BotAPI getChat/getChatMember ve OIDC state/nonce/audience/PKCE korumaları vardır.

Turkchain chainID1919, nativeTURK18decimals. Mainnet transferi yapılmaz. `REWARD_CLAIMS_PAUSED=true`; `MASTER_PAYOUTS_AUTHORIZED` tanımsızsa etkin değer false. Network/runtime claim ayrıca kapalıdır; deploy edilmiş claim kontratı olduğu varsayılmaz. Solidity/Foundry testleri mainnet deployment kanıtı değildir.

## Platformların gerçek durumu

X/YouTube teşvikli etkileşimleri politika nedeniyle kapalıdır. Meta doğrudan Developer belgelerine429 erişim sınırlaması oldu; koşullu izin/metadata adayları doğrulanmış canlı destek değildir. TikTok DisplayAPI per-user follow/like/watch kanıtı vermez; ResearchAPI genel ticari görev doğrulaması değildir.

Kick/Twitch OAuth/refresh/revoke protokol kodu ve signature alıcıları hazırdır. Gerçek ownercredentials/consent/appapproval/webhook aboneliği olmadan NOT_CONFIGURED kalırlar; mock testi canlı başarı saymayın. Twitch tokenlar exchange/refresh ve55dkTTL worker ile doğrulanır. Kısıtlı follow/chat/sub/redemption görevleri izin varmış gibi açılmaz.

Telegram mevcut sınırlı authentic onboarding üyeliği ve özel first-party bot kodları dışında ödüllü eylemler kapalıdır. Bot Developer Terms spam/sosyal metrik manipülasyonunu yasaklar. Ürün harici web sitesidir, Telegram Mini App değildir; TON kuralını aşan Mini App akışı eklenmez. Bot görevleri için OWNER ayrıca webhook opt-in/register ve hedef doğrulaması yapmalıdır. GROUP üyeliği webhook gerektirmez.

Tekrarlanabilir ödül bu sürümde uygulanmamıştır; repeatable:true reddedilir. Manuel inceleme platform yasağını aşmaz. Yeni sağlayıcılarda canlı credentials/appreview testleri bekler. Yönetici bilgileri daha sonra güvenli panelden girebilir.

## Kontroller, yayın ve devam

`infrastructure/scripts/validate-release.sh` temiz committe build/type/lint, uygulama testleri,8TR/ENdesktop/mobile tarayıcı paketi,10Foundry testi, audit, Prisma migrate/diff ve secret gate çalıştırır. SHA kanıtı `.runtime/validated.json`. Yeni Twitch worker testi sonrası toplam uygulama testi53 olmalıdır; kesin sonuç logdan okunur.

Production yedeği, gerçek restore ve izole migration provasından sonra `deploy-production.sh` çalıştırılır. `sync-github.sh` yalnız sağlıklı SHA'yı main/tag'e gönderir. Geri dönüşte eski engine yeni SOCIAL_API/bağımsızbütçe görevlerini anlayamayacağından bu görevler önce güvenli pasifleştirilir; DB downgrade/ledger delete yapılmaz.

Son kullanıcı onayı TEST sonrası güvenli production **altyapı** yayını içindir. Yeni ödüllü görev/kampanya otomatik yayınlamak, gerçek ödül dağıtmak veya transfer açmak kapsam dışıdır. Bir sonraki oturum dış handoff ve `PRODUCTION_RELEASE_REPORT.md` kanıtlarından son SHA/test/eksikleri doğrulayıp tamamlanan işleri tekrarlamadan devam eder.
