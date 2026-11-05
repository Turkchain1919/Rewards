# v0.5.5 — Kullanıcı sosyal ödül merkezi

Önce [USER_DASHBOARD_STRUCTURE.md](USER_DASHBOARD_STRUCTURE.md) okuyun. Taban v0.5.4 b3f49f0; mevcut admin, sekiz entegrasyon ve ödül motoru korunur. Yeni sekmeler, platform kartları ve üç aşamalı görev sihirbazı; history API projectionına platform eklendi, migration yok. Telegram gerçek sağlayıcı QR ekranı test edildi; fiziksel Desktop geçişi ve gerçek kullanıcı onayı/callback henüz doğrulanmadı. Kesin kök neden kanıtlanmadan çözülmüş kabul edilmez. Yayın durumu production `.runtime/deployment.json`, current symlink ve Git ile doğrulanmalıdır. Kanıt: .runtime/user-hub-v055/. Claims kapalı.

# Turkchain® Rewards — tam teknik proje dokümantasyonu

## Canlı envanter düzeltmesi — 3 Kasım 2026, yayın sonrası doğrulama

11:28UTC envanterindeki3 kampanya/4 görev, yayından **önce**,12:29:00–12:29:18UTC (Türkiye15:29) arasında OWNER oturumundan silinmiştir. Audit kayıtlarında TASK_DELETE/CAMPAIGN_DELETE ve öncesinde OWNER MFA login vardır. Güncel yayın öncesi13:03UTC yedeğinde ve migration sonrasında **0 kampanya/0 görev** bulunur; eski sütun/row hashleri eşleşir. Silmeler bu deployment veya migration tarafından yapılmamıştır. İşlemi yapan gerçek kişi yalnız audit actoründen çıkarılamaz. Mevcut kullanıcı, ledger ve CONNECTED Telegram hesabı korunur. Yeni görev/kampanya oluşturulmamış, silinmiş kayıtlar geri yüklenmemiştir.

Aşağıdaki1TURK/25 kullanıcı/25TURK görevi referansları artık **tarihsel görev tanımıdır**, aktif canlı görev değildir. Görev motoru regression fixture'ları bu yapıyı test eder; güncel canlı panel doğru şekilde “Henüz yayınlanmış görev yok” gösterir. Yeni ödüllü görevin yayınlanması ayrı açık operatör işlemi gerektirir. Canlı kontrolün ilk denemesinde eski görevID'si bekleyen rapor scripti başarısız olmuştur; bu uygulama hatası değil, eski envanter varsayımıdır ve gizlenmeden raporlanır.


## v0.5.0 güncel kapsam — 3 Kasım 2026

Kaynak dalı `feature/multi-social-rewards-engine`; önceki canlı sürüm `3c85ac1a29b51d86d74d1fe7cc847ee391f7a4c0` (v0.4.5). Aşağıdaki eski envanterler tarihsel kanıttır; güncel modüller ve sınırlar bu bölüm ile sosyal dokümanlarda açıklanır. Çalışan tam SHA, `.runtime/deployment.json` ve `.runtime/validated.json` üzerinden doğrulanır; bu dosyanın bulunduğu commit kendi hashini içermez. Yayın sonucu [PRODUCTION_RELEASE_REPORT.md](PRODUCTION_RELEASE_REPORT.md).

8 platform ve 65 görev tanımı vardır. Katalogda bulunması gerçek API bağlantısı veya ödüllü yayın izni değildir. X/YouTube teşvikli etkileşimleri politika nedeniyle kapalı; Meta/TikTok normal ticari API yetenekleri sınırlı; Kick/Twitch ödüllü etkileşimleri izin incelemesi olmadan kapalıdır. Sadece mevcut Telegram üyelik doğrulaması ve açıkça yapılandırılacak özel bot kanıtları uygulanmıştır. Hiçbir yeni canlı görev/kampanya otomatik oluşturulmaz. Tekrarlanabilir görevler reddedilir. Claim ve gerçek transferler kapalıdır.

Silinmeden önceki Telegram görevi kullanıcı başına **1 TURK**, **25 kullanıcı**, ortak kampanya **25 TURK** bütçesidir; 10 TURK eski taslaktır. Önceki üç kampanya/dört görevin tarihsel durumu yukarıdaki canlı envanter düzeltmesinde açıklanır. `REWARD_CLAIMS_PAUSED=true`; master ödeme yetkisi tanımsızken etkin değer false olur. Telegram GROUP `-1003676977941` string olarak korunur. Gizli değerler dokümantasyona yazılmaz.

Güncel okuma sırası: CODEX_CONTEXT → CURRENT_STATUS → ARCHITECTURE → ilgili DB/API/ENV belgesi → sosyal katalog/matris. Nest backend düz `apps/api/src` modülleridir; ayrı controllers/services/models dizinleri yoktur. `social-controller.ts` HTTP/RBAC, `social-engine.ts` orkestrasyon, `social-adapters.ts` platform arayüzü, `engine.ts` transaction ve ledger sınırlarını taşır. Next kullanıcı/admin bileşenleri mevcut mimariye eklenmiştir; eski endpointler korunur.

Yeni özellikler: platform bazlı dinamik katalog, şifreli API ayarları, çoklu resmî hedef, OAuth Kick/Twitch, sahiplik doğrulayan URL çözümleme, atomik/idempotent en çok20 taslak görevi, bağımsız görev bütçesi, IANA saat dilimi, imzalı webhook alıcısı, süreli özel bot kanıtı, sosyal kimlik tek ödül rezervasyonu ve otomatik süre/bütçe kapatma workerı. Desteklenmeyen platformlarda başarılı doğrulama taklit edilmez.

---

## Önceki sürüm envanteri (tarihsel)


> **2026-11-03 güncel çalışma:** Önceki 10 TURK taslağı yerine kullanıcı 1 TURK × ilk25 kullanıcı / toplam25TURK ve TEST sonrası productionyayınını onayladı. Güncel plan ve doğrulama koşulları [REWARD25_RELEASE_READINESS](REWARD25_RELEASE_READINESS.md), tam payload [TELEGRAM_REWARD25_TASK.json](TELEGRAM_REWARD25_TASK.json), Instagram açıklaması [INSTAGRAM_READINESS](INSTAGRAM_READINESS.md). Aşağıdaki bilgiler önceki snapshot olabilir; çalışanSHA ve gerçekyayınsonucu dış PROJECT_HANDOFF.md/deploymentmanifest esas alınarak doğrulanır.

Doğrulama anı: 2026-11-02T22:34:00.042Z. Production sürümü: **0.4.5 / `cc61b966bf684ad2f602b36100c3bf1de7f4d0a7`**. Bu doküman TEST dalında hazırlanmıştır; bu çalışmada production kodu/verisi/configuration değiştirilmez. Yollar sunucu `138.226.246.138` üzerindedir. Gerçek ENV/credential değerleri açıklanmaz.

## Okuma sırası ve kanıt kaynağı

Önce [CODEX_CONTEXT.md](CODEX_CONTEXT.md), sonra [CURRENT_STATUS.md](CURRENT_STATUS.md); değiştirilecek modülün mimari/API/DB/ENV dosyasını okuyun. Bu doküman source ve gerçek sunucu envanterinden hazırlanmıştır; eski `ARCHITECTURE.md` foundation0.1 açıklaması güncel uygulamayı temsil etmiyordu ve yenilendi. Geçmiş raporlar tarihsel kanıttır; güncel kodla çelişirse kod esas alınır.

İncelenenler: tracked npm/TypeScript/Next/Nest/Prisma/Solidity/test/operasyon kaynakları; READ ONLY production tablo/sütun/constraint/index/migration ve üç kampanya/üç görev; iki ortam ENV değişken isimleri/presence (değerler yok); gerçek systemd/Nginx/Redis dosyaları, pg_lsclusters, runtime manifestleri ve Git geçmişi. Bu çalışma bir pentest veya harici bağımsız akıllı kontrat denetimi değildir.

## Ürün ve teknik bileşenler

Turkchain Rewards; cüzdanla kimlik doğrulayan kullanıcıların policy-izinli görevlerini doğrular, kesin integer-wei iç muhasebe bakiyesine kaydeder. İç muhasebe kredisi otomatik mainnet transferi değildir. Mevcut izinli sınıflar first-party eğitim ve Bot API ile doğrulanan Telegram üyeliğidir; X/Meta/YouTube/TikTok beğeni/takip/paylaşım ödülleri kapalıdır. Tek seferlik görev; repeatable=false. Admin parola+TOTP MFA+RBAC ile yönetir.

| Bağımlılık | Lock dosyası / envanter sürümü |
|---|---|
| next | 16.4.3 |
| react | 19.3.1 |
| @nestjs/core | 12.3.2 |
| @prisma/client | 7.10.1 |
| @prisma/adapter-pg | 7.10.1 |
| ethers | 6.17.0 |
| bullmq | 5.81.5 |
| ioredis | 5.11.1 |
| jose | 6.2.14 |
| zod | 4.6.7 |
| siwe | 3.0.0 |
| otpauth | 9.5.2 |
| @openzeppelin/contracts | 5.6.1 |

Root package sürümü0.4.5; apps/api ve apps/web workspace package sürümleri0.1.0 kaldığından release kararını root package + runtime SHA ile verin. Sunucu Node26.10.0/npm11.19.1; runtime systemd, PostgreSQL14 ve iki bağımsız Redis. [DIRECTORY_STRUCTURE.md](DIRECTORY_STRUCTURE.md) tam source/runtime dosya haritasıdır.

## Backend modülleri ve bağlantıları

| Dosya | Gerçek görev |
|---|---|
| auth.ts | AuthService + UserAuthController/AdminAuthController: SIWE challenge/session, scrypt parola, TOTP MFA, roller ve admin hesapları. security/data/configuration ile bağlı. |
| claims.ts | ClaimService/ClaimController; EIP-712 imza, AVAILABLE→RESERVED→CLAIMED, receipt/event/reorg/expiry denetimi; ABI burada inline. config/data/wallet/claims UI ile bağlı. |
| config-controller.ts | OWNER ayar endpointleri: ağ/branding/runtime/ENV template/credential ve history. ConfigurationService/SecretStore kullanır. |
| configuration.ts | Network/branding Zod şemaları, single-chain lock, DB konfigürasyonu, RPC/WSS/contract doğrulama ve SecretStore AES-GCM erişimi. |
| data.ts | PrismaPg PostgreSQL ve ioredis bağlantıları; DB/Redis/worker heartbeat health; audit yazımı. |
| engine.ts | Görev/kampanya yaşam döngüsü, etki/silme/arşiv, tarihler, policy, Bot API üyeliği, submission ve ledger muhasebesi, serializable kilit/retry. |
| errors.ts | Global SafeErrors exception filter; alan bazlı VALIDATION_ERROR, güvenli Prisma hata dönüşümü; secret/log sızıntısını sınırlama. |
| hero-media.ts | GIF signature/boyut/frame doğrulama ve HeroVisual byte saklama; public metadata/image ve OWNER+step-up yönetimi. |
| integration-settings.ts | ENV + şifreli DB sosyal credential override; API testleri, safe hata/kota durumu ve masked ayar yönetimi. |
| main.ts | Nest AppModule, tüm controller/service kaydı, public health/config/campaigns/integrations; Helmet/no-store/trust-proxy/loopback bootstrap. |
| oauth-lifecycle.ts | Refresh/revoke provider adaptörleri, kimlik/scope kontrolü, Redis NX lease/cooldown, version guard; kişisel refresh controller. |
| official-accounts.ts | OfficialSocialAccount CRUD/default/import/connect/disconnect, Telegram Bot API grup bağlantısı, resmi OAuth hedef seçimi; yeni Chat ID şeması burada. |
| policy.ts | Sadece incelenmiş FIRST_PARTY/TURKCHAIN EDUCATION ve TELEGRAM_MEMBERSHIP sosyal görevlerini açan fail-closed politika. |
| providers.ts | 8 OAuth provider endpoint/scope/PKCE tanımı; Telegram JWKS issuer/audience/nonce OIDC; code exchange ve provider kimlik eşleme. |
| security.ts | scrypt hash, AES-256-GCM, APP_ENV AAD, SHA256 digest/constant-time compare, origin, cookie ve Zod parse yardımcıları. |
| social-config.ts | Platform ENV alias haritası, public resmî metadata, güvenli URL/credential hazır olma çözümleme. |
| social.ts | Kişisel OAuth connect/callback/disconnect; browser/session/state/PKCE/generation korumaları; resmi callback de burada işlenir. |
| telegram-verifier.ts | Sabit api.telegram.org hedefinde getMe/getChat/getChatMember; timeout/yanıt/ID safe integer sınırı; bot-admin ve kullanıcı üyelik kontrolü. |
| worker.ts | Ayrı BullMQ maintenance Worker/Queue; yalnız heartbeat job scheduler (15sn), Redis worker:heartbeat TTL45sn; ödül dağıtım workerı değildir. |

Tüm servisler AppModule'da dependency injection ile bağlanır. DataService her request'te DB oluşturmaz; singleton PrismaPg client ve Redis connection sağlar. ConfigurationService/OfficialAccountsService onModuleInit başlangıçta metadata/network varsayılanlarını yazabilir; production incelemesinde bu init fonksiyonları çalıştırılmadı. Salt okunur araçlar yalnız SELECT ve secretı bellekte okuyan helper kullandı.

## Admin Center — bütün gerçek sekmeler

Kaynak tab registry `apps/web/app/admin/modules.tsx`; giriş `admin/page.tsx`. Tablodaki relative dosyalar TEST kökü altındadır.

| Sekme | Frontend (apps/web/app/) | API | Tablolar | İşlem | Yetki | Eksik/sınır |
|---|---|---|---|---|---|---|
| Genel bakış | admin/modules.tsx | GET /api/admin/summary | User,Campaign,Task,Submission,LedgerEntry | Sayılar ve status aggregate; sayfa yönetimi yok | OWNER/ADMIN+MFA | Derin analytics/export yok |
| Kullanıcılar | admin/modules.tsx | GET /api/admin/users | User + submission/entry count | Read-only liste | OWNER/ADMIN+MFA | User delete/ban/balance edit yok |
| Kampanyalar | admin/modules.tsx, admin/lifecycle.tsx | GET/POST campaigns; PUT/:id; GET/:id/impact; DELETE/:id; POST/:id/publish\|pause\|archive | Campaign,Task,Submission,LedgerEntry,AuditEvent | Draft/edit/publish/pause/archive/safe delete, UTC date/status filter | OWNER/ADMIN+MFA+origin | Arşivden restore, pagination yok |
| Görevler | admin/modules.tsx, admin/lifecycle.tsx | POST tasks; PUT/:id; PATCH/:id/content; impact/delete/publish\|pause\|archive | Task,Campaign,OfficialSocialAccount,Submission,LedgerEntry,AuditEvent | TR/EN içerik/steps/condition/date/reward/verification; used content-only edit | OWNER/ADMIN+MFA+origin | Tekrarlanabilir görev açılmaz; used ekonomik edit yok |
| Doğrulamalar | admin/modules.tsx | GET submissions; POST submissions/:id/review | Submission,LedgerEntry,LedgerEvent,Campaign,AuditEvent | Manual APPROVE/REJECT+note; otomatik Telegram sonucu liste | OWNER/ADMIN/REVIEWER+MFA | Provider engagement verifier yok |
| Ödüller | admin/modules.tsx | GET /api/admin/ledger | LedgerEntry,LedgerEvent,User | Read-only balances/status/history | OWNER/ADMIN+MFA | Manuel bakiye düzeltme/distribution yok |
| Claim işlemleri | admin/modules.tsx | GET /api/admin/claims | ClaimAuthorization | Read-only authorization/tx/error listesi | OWNER/ADMIN+MFA | Otomatik payout, claim açma butonu yok |
| Social API | admin/social-api.tsx | GET integrations; POST social-api/:platform; POST integrations/:platform/test | IntegrationSetting,Credential,AuditEvent | Credential configure/masked status/provider test | Görüntüleme OWNER/ADMIN; secret save OWNER+MFA+step-up | Sağlayıcı credentials gerçek uygulama kaydı yerine geçmez |
| Official Social Accounts | admin/social-management.tsx | social-platforms,official-accounts CRUD/connect/default/test/connection-options/select-target,social-connections | OfficialSocialAccount,SocialPlatform,Credential,Task,SocialAccount,AuditEvent | Kişisel ve resmî hesap ayrı; metadata/import/connect/disconnect/soft remove; TEST negatif ID kontrolü | OWNER/ADMIN+MFA | Resmî connect/disconnect Task alanlarına yazabilir; görev-dokunma yasağı olan bakımda bu yol kullanılmaz |
| Sistem | admin/modules.tsx, admin/hero-visual.tsx | GET system; OWNER /api/admin/system/hero GET/POST/state/DELETE | HeroVisual,AuditEvent; dependency health | Health/release ve GIF preview/publish/enable/remove | Sistem OWNER/ADMIN; GIF OWNER+step-up | Worker dashboard/metrics UI yok |
| Denetim kayıtları | admin/modules.tsx | GET /api/admin/audit | AuditEvent | Actor/action/resource/time son100 kayıt | OWNER/ADMIN+MFA | Before/after payload/CSV/pagination yok |
| Yönetici hesapları | admin/modules.tsx, admin/page.tsx | GET/POST accounts; PATCH accounts/:id; sessions/password endpoints | Admin,AuthSession,AuditEvent | ADMIN/REVIEWER oluşturma/role/enabled, kendi parola/session yönetimi | Hesap yönetimi OWNER+MFA; kişisel session tüm admin roller | OWNER silme/role değiştirme engelli; email recovery yok |
| Settings / Blockchain Networks | admin/settings.tsx | /api/admin/settings/blockchains + test/activate | BlockchainNetwork,ConfigDocument,Credential,AuditEvent | Tek zincirli ağ CRUD/verify; config edit ledger varsa decimals korur | OWNER+MFA; activate fresh TOTP | Başka zincir aynı installationda açılamaz |
| Settings / Branding & SEO | admin/settings.tsx | GET/PUT /api/admin/settings/branding | ConfigDocument | TR/EN branding/SEO/logo/footer | OWNER+MFA | DB override ENVyi otomatik ezmez |
| Settings / Configuration | admin/settings.tsx | effective,runtime,env/validate,env/import,env/template,reload,history | ConfigDocument,BlockchainNetwork,AuditEvent | Doğrulama/template/DB apply ve geçmiş | OWNER+MFA | Gerçek .env yazma/restart endpointi yok; reload sadece event+audit |
| Settings / API Credentials | admin/settings.tsx | GET/POST/DELETE settings/credentials | Credential,IntegrationSetting,ConfigDocument,OfficialSocialAccount,AuditEvent | Encrypted store/revoke; plaintext response yok | OWNER+MFA; store step-up | Secret export/readback yok |

REVIEWER için sadece Doğrulamalar tabı gösterilir; UI gizleme tek başına güvenlik değildir, controller role kontrolleri de vardır. Temel görev/campaign işlemlerinde mevcut MFA zorunlu; her mutasyonun fresh TOTP istediği iddia edilmez. Hassas alanların step-up/fresh koşulları API referansında ayrıdır.

## Kullanıcı paneli — gerçek özellik haritası

| Özellik | Frontend apps/web/app/ | Backend/API ve veri | Durum / sınır |
|---|---|---|---|
| Kayıt/giriş | wallet.tsx | auth.ts challenge/verify; User/AuthSession/Redis | Wallet signature ile kayıt; user email/password yok |
| Cüzdan/ağ | wallet.tsx,runtime.tsx | configuration.ts publicConfig/SIWE network lock | MetaMask etkin; WalletConnect konfigürasyonda kapalı, kodu mevcut |
| Sosyal hesap | dashboard/social.tsx | social.ts + providers.ts + OAuthLifecycle; Credential/SocialAccount/LinkState | Yalnız görevin gerektirdiği hesap; hazır olmayan platform bağlanmaz |
| Kampanyalar | board.tsx içindeki campaign title | GET tasks/me/tasks; public GET campaigns ayrıca var | Dashboard bağımsız kampanya katalog sayfası değil; enabled görev kartları |
| Görev listesi | dashboard/board.tsx | Engine publicTasks/userTaskBoard, Task/Campaign/policy | TR/EN fallback, date/status, internal credit ve one-time uyarısı |
| Görev doğrulama | dashboard/board.tsx | POST tasks/:id/submit veya verify-telegram | Ödül/server-defined; manual review veya getChatMember |
| Ödül bakiyesi/ledger | dashboard/board.tsx | GET me/ledger, Engine.balances; LedgerEntry/Event | PENDING/AVAILABLE/RESERVED/CLAIMED status aggregate; transfer değildir |
| Geçmiş | dashboard/board.tsx | GET me/history; Submission + reward | Arşivli görev geçmişi korunur |
| Claim | dashboard/claims.tsx | ClaimController/ClaimService; ClaimAuthorization | UI+backend pause; gerçek kontrat/adres/transfer etkin değil |
| Profil | wallet.tsx | GET auth/me; POST auth/profile | displayName ve wallet; tam KYC/profil fotoğrafı/sosyal bildirim profili yok |
| Dil | i18n.tsx,proxy.ts,layout.tsx,tr/en wrappers | rewards_lang cookie, locale headers, translations.json | TR/EN UI; task localizedContent ayrı user/admin authored içerik |
| Resmî hesaplar | dashboard/official.tsx | GET official-accounts | Public links; kişisel OAuth kimliğinden ayrı |
| Bildirimler | notice/status/alert metinleri | Bağımsız notification controller/model/queue yok | Kalıcı inbox/push/email bildirim sistemi uygulanmamış |
| Nasıl TURK Kazanılır | dashboard/earning-guide.tsx | Statik TR/EN açıklama; task şartlarına yönlendirme | Wallet ilk adım; sosyal hesap yalnız ilgili görev için zorunlu |

## Sosyal entegrasyonlar — kod ve canlı konfigürasyon ayrı

Aşağıdaki durumlar şifreli DB override + runtime configuration değerlendirmesidir. Credentials hazır olması gerçek üçüncü taraf consent işleminin bu oturumda yapılmış olduğu anlamına gelmez. Production'da yalnız Telegram kişisel bağlantı kaydı vardır; bu çalışmada token refresh/consent yapılmadı. Genel sosyal engagement ödülleri policy tarafından kapalıdır; API profil erişimi beğeni/takip doğrulama anlamına gelmez.


### X

- OAuth runtime: `awaiting_credentials`, ready=false, provider enabled=true; API mode `oauth`, stored test status `failed`.
- Eksikler: `X_CLIENT_ID`, `X_CLIENT_SECRET`.
- Scope/izin: `tweet.read`, `users.read`, `offline.access`; PKCE=true.
- Kişisel callback: `/api/oauth/x/callback` (legacy `/api/social/x/callback`). Connect `/api/social/x/connect`; user session/binder/state/config fingerprint/generation koruması.
- Kişisel bağlı kayıt sayısı 0; resmi hesap durumları yok.
- Yönetici: OfficialAccountsController + official-accounts.ts hedef/role kontrolleri; token SecretStore; refresh/revoke OAuthLifecycle.
- OAuth2 kullanıcı kimliği /2/users/me; refresh/revoke kodu var. Access/bearer token API modu da konfigüre edilebilir. Tweet/like/follow/share ödül doğrulayıcısı yok; stored API test failed, credentials eksik.

### TELEGRAM

- OAuth runtime: `ready`, ready=true, provider enabled=true; API mode `oauth`, stored test status `not_tested`.
- Eksikler: yok; gerçek değerler belgelenmez.
- Scope/izin: `openid`, `profile`; PKCE=true.
- Kişisel callback: `/api/oauth/telegram/callback` (legacy `/api/social/telegram/callback`). Connect `/api/social/telegram/connect`; user session/binder/state/config fingerprint/generation koruması.
- Kişisel bağlı kayıt sayısı 1; resmi hesap durumları GROUP:CONNECTED.
- Yönetici: OfficialAccountsController + official-accounts.ts hedef/role kontrolleri; token SecretStore; refresh/revoke OAuthLifecycle.
- OAuth/OIDC JWKS issuer/audience/exp/iat/nonce ile kişisel numeric user kimliği; bot token farklı sorumluluktur. Resmî GROUP -1003676977941 / @Turkchain1919 CONNECTED; @turkchainaibot admin doğrulaması önceki onaylı bakımda ve salt okunur kontrol kanıtında mevcut. Bot API getChatMember üye/admin/creator veya restricted+is_member kabul eder; left/kicked/nonmember reddeder. Kişi ID pozitif olabilir; GROUP/CHANNEL hedef ID yeni TEST validatorunda negatif string veya @username olmalı. OAuth refresh/revoke adaptörü Telegram için otomatik refresh desteklemez; gerekirse yeniden bağlama/manual revoke. Aktif webhook endpointi yok; üyelik senkron doğrulanır.

### FACEBOOK

- OAuth runtime: `awaiting_credentials`, ready=false, provider enabled=true; API mode `oauth`, stored test status `not_tested`.
- Eksikler: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `META_GRAPH_VERSION`.
- Scope/izin: `public_profile`; PKCE=false.
- Kişisel callback: `/api/oauth/facebook/callback` (legacy `/api/social/facebook/callback`). Connect `/api/social/facebook/connect`; user session/binder/state/config fingerprint/generation koruması.
- Kişisel bağlı kayıt sayısı 0; resmi hesap durumları yok.
- Yönetici: OfficialAccountsController + official-accounts.ts hedef/role kontrolleri; token SecretStore; refresh/revoke OAuthLifecycle.
- Graph version zorunlu. Kişisel public_profile; resmi Page OAuth ayrıca pages_show_list/pages_read_engagement ve /me/accounts hedef seçimi ister. Appsecret proof ile profil okunur; seçilen Page access token encrypted saklanabilir. Beğeni/paylaşım ödül verifier yok; otomatik refresh destek listesinde değil.

### INSTAGRAM

- OAuth runtime: `awaiting_credentials`, ready=false, provider enabled=true; API mode `oauth`, stored test status `not_tested`.
- Eksikler: `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `META_GRAPH_VERSION`.
- Scope/izin: `instagram_business_basic`; PKCE=false.
- Kişisel callback: `/api/oauth/instagram/callback` (legacy `/api/social/instagram/callback`). Connect `/api/social/instagram/connect`; user session/binder/state/config fingerprint/generation koruması.
- Kişisel bağlı kayıt sayısı 0; resmi hesap durumları yok.
- Yönetici: OfficialAccountsController + official-accounts.ts hedef/role kontrolleri; token SecretStore; refresh/revoke OAuthLifecycle.
- Business login temel kimlik scope; token exchange FormData, graph.instagram.com /me. Meta Graph version beklenir. Profil bağlantısı var; takip/beğeni ödül doğrulayıcısı ve otomatik refresh adaptörü yok.

### YOUTUBE

- OAuth runtime: `awaiting_credentials`, ready=false, provider enabled=true; API mode `oauth`, stored test status `not_tested`.
- Eksikler: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`.
- Scope/izin: `https://www.googleapis.com/auth/youtube.readonly`; PKCE=true.
- Kişisel callback: `/api/oauth/youtube/callback` (legacy `/api/social/youtube/callback`). Connect `/api/social/youtube/connect`; user session/binder/state/config fingerprint/generation koruması.
- Kişisel bağlı kayıt sayısı 0; resmi hesap durumları yok.
- Yönetici: OfficialAccountsController + official-accounts.ts hedef/role kontrolleri; token SecretStore; refresh/revoke OAuthLifecycle.
- Google OAuth youtube.readonly, mine=true channels kimliği; required scope kontrolü, offline access/consent ve refresh/revoke var. Kanal profil erişimi video abone/like ödül verifierı değildir.

### TIKTOK

- OAuth runtime: `awaiting_credentials`, ready=false, provider enabled=true; API mode `oauth`, stored test status `not_tested`.
- Eksikler: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`.
- Scope/izin: `user.info.basic`; PKCE=false.
- Kişisel callback: `/api/oauth/tiktok/callback` (legacy `/api/social/tiktok/callback`). Connect `/api/social/tiktok/connect`; user session/binder/state/config fingerprint/generation koruması.
- Kişisel bağlı kayıt sayısı 0; resmi hesap durumları yok.
- Yönetici: OfficialAccountsController + official-accounts.ts hedef/role kontrolleri; token SecretStore; refresh/revoke OAuthLifecycle.
- client_key alias, user.info.basic/open_id/display_name; scope kontrolü/refresh/revoke var. PKCE bu tanımda false; video/like/follow ödül verifierı yok.

### DISCORD

- OAuth runtime: `awaiting_credentials`, ready=false, provider enabled=false; API mode `oauth`, stored test status `not_tested`.
- Eksikler: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`.
- Scope/izin: `identify`, `guilds`; PKCE=true.
- Kişisel callback: `/api/oauth/discord/callback` (legacy `/api/social/discord/callback`). Connect `/api/social/discord/connect`; user session/binder/state/config fingerprint/generation koruması.
- Kişisel bağlı kayıt sayısı 0; resmi hesap durumları yok.
- Yönetici: OfficialAccountsController + official-accounts.ts hedef/role kontrolleri; token SecretStore; refresh/revoke OAuthLifecycle.
- Kaynakta ayrıca mevcut; enabled=false/credentials eksik. Identify/guilds, resmi guild owner/admin permission bit kontrolü, hedef seçimi ve refresh/revoke kodu var; görev policy izin vermiyor.

### GITHUB

- OAuth runtime: `awaiting_credentials`, ready=false, provider enabled=false; API mode `oauth`, stored test status `not_tested`.
- Eksikler: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.
- Scope/izin: `read:user`, `read:org`; PKCE=true.
- Kişisel callback: `/api/oauth/github/callback` (legacy `/api/social/github/callback`). Connect `/api/social/github/connect`; user session/binder/state/config fingerprint/generation koruması.
- Kişisel bağlı kayıt sayısı 0; resmi hesap durumları yok.
- Yönetici: OfficialAccountsController + official-accounts.ts hedef/role kontrolleri; token SecretStore; refresh/revoke OAuthLifecycle.
- Kaynakta ayrıca mevcut; enabled=false/credentials eksik. User/org/repo admin hedef kontrolü, OAuth refresh/revoke kodu var; organization/repository metadata bağlantısı reward verifier değildir.

### Telegram akışının önemli bakım ayrımı

Resmî GROUP kaydı düzeltmesi sadece resmi hesap+2audit ile daha önce yapılmıştır. Standart connect/disconnect bağlı Task.configurationRequired/enabled alanlarına da yazabilir; görev değiştirmeme talimatında bunu çalıştırmayın. Yeni validation bu kayıt için migration veya reconnect istemez: negatif mevcut değer geçerlidir, production'a kod dağıtılmamıştır. Yeni görev hazırlanırken SOCIAL_INTERACTION + TELEGRAM_MEMBERSHIP + reviewed + connected official id kullanılmalı; mevcut Telegram EDUCATION/MANUAL kayıtları otomatik bu tipe çevrilmez.

## Blockchain, native TURK ve kontratlar

Production etkin network `network-1919`, EVM Mainnet chainId1919/hex0x77f, TURK18decimals; backend RPC https://rpc.turkscan.com, WSS wss://evm-ws.turkscan.com, explorer https://turkscan.com. Fallback listesi boş; gerçek RPC header/private key değerleri açıklanmaz. Mevcut ağ adı DB'de EVM Network1919'dur; branding değiştirmek chain ID'yi değiştirmez.

Reward vault adresi, signer adresi ve beklenen bytecode hash DB konfigürasyonunda boş. Dolayısıyla doğrulanmış deployed/funded Rewards kontratı veya gerçek claim transaction'ı bu proje için raporlanamaz. Başka yerde bir kontrat bulunmadığı iddia edilmez; mevcut installationda yapılandırma/kanıt yoktur.

`NativeRewardVault.sol`: EIP712, Ownable2Step, Pausable, ReentrancyGuard; constructor paused, msg.sender recipient, amount>0/deadline/nonce replay kontrolü, authorized signer, native call ve Claimed event. Signer rotation yalnız paused, owneronly. `NativeTURKClaims.sol` legacy domain constructor alias. Checked-in ABI JSON ayrı dosyası yok; gerçek backend `claims.ts` inline vaultABI kullanır. Foundry `packages/contracts/out/` generated ABI/bytecode üretir; out dosyası chain deployment kanıtı değildir.

İmza domain chainId+verifyingContract ayırır. Claim hazırlığı vault bytecode/signer/domain/balance/nonce/min-max/TTL ile bound; receipt canonical blockhash, doğru from/to, event amount/nonce ve confirmation sayısını doğrular. UI cüzdan chain/account değişimini kontrol eder. Mevcut MASTER false, env pause true, runtime pause true, network claimEnabled=false, gas sponsor=false. Gerçek ödemeler için ayrı güvenlik/deploy/funding/audit/onay çalışması gerekir; bu doküman aktivasyon yetkisi vermez.

## Güvenlik kontrolleri ve gerçek sınırlar

Scrypt N131072/r8/p1 saltlı parola; AES256GCM random12byte IV/APP_ENV AAD; HTTPOnly/Secure cookies; TOTP step replay engeli; rate limit; strict origin; SQL parametreleme; Prisma unique/FK/check; serializable reward allocation; EIP712/nonce/chain/receipt; URL safety/SSRF private endpoint reddi. No secrets in API error/log ve safe Nginx URI-only access logging amaçlanır. DB credential ciphertext/ENV dosyaları rapora taşınmaz.

Bağımsız security audit/pentest raporu yoktur. Bilinen sınırlar: tam pagination/export, persistent notifications, genel social engagement verification, archive restore ve multi-chain çalışması yok. Empty metadata draft ID kabul edilebilir ama CONNECTED gerektirir. GROUP validator formatı24digit'e kadar korur; harici API SafeInteger canonical ID denetimi ayrıca yapılır. Webhook secret adı bulunması webhook sistemi kurulduğu anlamına gelmez. CI integration/browser/Foundry yerine geçmez. TEST/prod proxy upload-size drift'i deployment rehberinde açıklandı.

## Test dosyaları ve son kanıt

| Tam yol | Kapsam | Çalıştırma | Kaynak test açıklamaları |
|---|---|---|---|
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/auth.integration.test.ts | HTTP admin bootstrap/MFA replay/roles/sessions/SIWE browser binder | RUN_INTEGRATION=true, TEST DB/Redis | admin bootstrap, MFA replay defense, roles, sessions and browser-bound wallet sign-in |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/browser-earning-guide.e2e.mts | TR/EN 6step wallet-first/conditional-social/disabled real transfer copy | Playwright + TEST frontend (bazı GET/PUT mock) | standalone assert e2e |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/browser-hero.e2e.mts | Owner GIF upload/preview/publish/remove/API restart persistence/mobile | Playwright + TEST frontend (bazı GET/PUT mock) | standalone assert e2e |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/browser-lifecycle.e2e.mts | TR/EN desktop/mobile impact/content edit/archive/filter/public hiding | Playwright + TEST frontend (bazı GET/PUT mock) | standalone assert e2e |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/browser-telegram-validation.e2e.mts | Yeni TR/EN 1440/390 local-intercept UI errors + negative string payload | Playwright + TEST frontend (bazı GET/PUT mock) | standalone assert e2e |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/configuration.integration.test.ts | Gerçek TEST network config/single-chain/credential redaction/hero APIs | RUN_INTEGRATION=true, TEST DB/Redis | real central configuration, single-chain lock, social targets and credential redaction |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/engine.integration.test.ts | HTTP task budgets/concurrent allocation/manual review/duplicates | RUN_INTEGRATION=true, TEST DB/Redis | task lifecycle, exact budgets, concurrent allocation, review and duplicate rewards |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/integration.test.ts | İzole PostgreSQL ledger+Redis+HTTP dependencies | RUN_INTEGRATION=true, TEST DB/Redis | isolated PostgreSQL ledger, campaigns, Redis and HTTP dependencies |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/lifecycle.integration.test.ts | Safe delete/archive, balances/history, dates/content, unauthorized/MFA, concurrency | RUN_INTEGRATION=true, TEST DB/Redis | v0.4.5 safe deletion, archive, dates, authorization, concurrency and accounting; unused task impact and confirmed permanent delete, repeated requests; rewarded task archives and AVAILABLE, history, ledger events remain unchanged; empty active campaign stops before deletion; campaign history archives its tasks; failed or in-flight verification alone prevents permanent deletion; reviewer, user and sessions without MFA cannot delete or archive; legacy fields stay compatible; localized content, task dates and merged date validation; concurrent submission and campaign archive never orphan rewards |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/policy.test.ts | Default deny social; reviewed education/Telegram exception; exact wei | Node unit | all social reward actions default to denied; education requires explicit review; wei arithmetic never uses floating point; only reviewed Telegram membership can use the automatic social verifier |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/portable-security.test.ts | Chain/URLs/WalletConnect canonical alias/EIP712/OAuth config+refresh/GIF validation | Node unit | portable EVM schemas reject mismatched hex IDs and unsafe endpoints; canonical WalletConnect project ID overrides the legacy alias; claim signatures are domain-separated across EVM chains and vault addresses; OAuth uses canonical callbacks, PKCE and encrypted-store runtime credentials without exposing secrets; OAuth refresh rotates tokens, verifies account identity and rejects provider failures; hero media validates GIF signatures, dimensions, frame structure and the 5 MB cap |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/security.test.ts | Scrypt/encryption APP_ENV/tamper/constant-time helper | Node unit | passwords salted and verified without plaintext storage; authenticated encryption rejects tampering and cross-environment use; constant-time token comparison does not accept length/prefix mismatch |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/telegram-mission.integration.test.ts | Fixture Bot API official connect/mission visibility/AVAILABLE once/in-flight archive | RUN_INTEGRATION=true, TEST DB/Redis | Telegram membership missions publish, appear to users and credit Available once |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/telegram-target-validation.integration.test.ts | Yeni official-account HTTP400 positive GROUP/CHANNEL, valid negative save/edit CONNECTED preservation | RUN_INTEGRATION=true, TEST DB/Redis | official Telegram target HTTP validation rejects positive groups and preserves connected negative identities |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/telegram-target-validation.test.ts | Yeni negative/@username/zero/positive/malformed/large-string/personal identity scope | Node unit | Telegram GROUP and CHANNEL keep negative IDs as strings and support @username targets; Telegram GROUP/CHANNEL reject positive, zero, signed-positive and malformed IDs with field-specific errors; Telegram target validation does not rewrite non-group platform identities or personal numeric IDs |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/telegram-verifier.test.ts | getChatMember status handling/provider sanitized errors/bot admin verification | Node unit | Telegram membership uses Bot API getChatMember and accepts real member statuses; Telegram membership rejects non-members and restricted users who are not members; Telegram API failures are sanitized and invalid identifiers are rejected; official Telegram connection verifies the bot itself is a chat administrator; official Telegram connection fails closed when bot is not an administrator |

Kontrat `packages/contracts/test/NativeTURKClaims.t.sol`:10 Foundry test (paused default, claim/replay, expiry, wrong recipient/chain/vault, insufficient funding nonce, admin-only, signer rotation, fuzz). Foundry vm test bakiyeleri gerçek TURK dağıtımı değildir.

Bu çalışma: **35/35 uygulama testi** (önceki31 +3unit+1HTTP), **10/10 Foundry**, TypeScript/lint/optimize API+web build ve dört browser grubu PASS; audit0 vulnerabilities; TEST migration current/schema diff none, health ok. İlk yeni browser koşusunda `getByRole(alert)` Next route announcer ile iki eleman eşleştirip failed oldu; uygulama alan hatası doğru görünüyordu. Seçici `.notice[role=alert]` ile düzeltildi ve dört TR/EN/viewport kombinasyonu geçti. İlk hata logu `logs/telegram-validation-tests.log`, final kanıt `logs/telegram-validation-browser-final.log`; başarısızlık gizlenmez.

Tarihsel v0.4.5 ilk concurrency koşusu iki alt test+parent başarısız olmuştu; adapter serialization 40001/40P01 retry metadata düzeltmesiyle release31/31 geçti. Rehberin networkidle bekleme timeout'u DOM readiness ile giderildi (cc61b96). Bu eski başarısızlıkların her ham logunun bugün mevcut olduğu varsayılmaz; Git ve PROJECT_HANDOFF kayıtları dayanak gösterilir. Gerçek kullanıcı MetaMask/Telegram consent ve diğer platformların canlı uçtan uca OAuth testleri bu oturumda yapılmadı. Production'a test fixture/ledger kaydı yazılmadı.

## Devam belgeleri

[ARCHITECTURE](ARCHITECTURE.md), [DIRECTORY_STRUCTURE](DIRECTORY_STRUCTURE.md), [DATABASE_DOCUMENTATION](DATABASE_DOCUMENTATION.md), [ENV_CONFIGURATION](ENV_CONFIGURATION.md), [DEPLOYMENT_GUIDE](DEPLOYMENT_GUIDE.md), [API_DOCUMENTATION](API_DOCUMENTATION.md), [CHANGELOG](CHANGELOG.md), [CURRENT_STATUS](CURRENT_STATUS.md), [CODEX_CONTEXT](CODEX_CONTEXT.md). Ödül görevi taslağı ve yayın önkoşulları CURRENT_STATUS'tadır. Ayrı sonuç raporu WORK_COMPLETION_REPORT.md.

## Durum alanlarını birbirine karıştırmayın

Telegram OfficialSocialAccount.connectionStatus=CONNECTED, OAuth runtime ready=true ve IntegrationSetting.lastTestStatus=not_tested aynı anda olabilir. Bot resmi bağlantısı ile genel API test durumu ayrı kayıtlardır. API test endpointi durum/audit yazar; read-only teşhis yerine çalıştırılmamalıdır. IntegrationSettings bağlantı listesi credential-backed OAuth hesaplarını farklı sayabildiğinden platform configured etiketi resmi GROUP CONNECTED bilgisini geçersiz kılmaz.
