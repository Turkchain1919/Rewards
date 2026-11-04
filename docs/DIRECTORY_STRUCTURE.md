# Klasör ve dosya haritası

## v0.5.1 — Admin arayüzü, 4Kasım2026

UI/UX dalı `feature/admin-ui-ux-v051`; taban `dc2e8ad` (v0.5.0). Yeni rol bazlı264/72sidebar, mobil drawer, URLfragment kalıcılığı, odaklanmış tablolar, tek girişli4adım görev akışı, aranabilirIANA, sekmeli8platformAPI ve scoped dark/light tasarım. Mevcut backend/API/15migration/OAuth/Telegram/ledger/claim/RBAC/MFA aynı; yeni bağımlılık yok. Aşağıdaki eski sürüm açıklamaları tarihsel bağlamdır.

Önce [ADMIN_UI_UX_STRUCTURE.md](ADMIN_UI_UX_STRUCTURE.md) okuyun: gerçek menü yolları, bütün işlev eşlemesi, UI bileşenleri, testler ve deployment kapsamı. `/tr/admin#tasks/new` örneği frontend fragmentidir, yeni API endpointi değildir. Source/backend farklılığı guard ile reddedilir; production migration yapılmaz. Son sağlıklı SHA ve gerçek kayıt sayıları deploymentmanifest/dış `ADMIN_UI_UX_RELEASE_REPORT.md` ile doğrulanır. `REWARD_CLAIMS_PAUSED=true`; yeni görev/kampanya/ödül/transfer oluşturulmaz.


## Canlı envanter düzeltmesi — 3 Kasım 2026, yayın sonrası doğrulama

11:28UTC envanterindeki3 kampanya/4 görev, yayından **önce**,12:29:00–12:29:18UTC (Türkiye15:29) arasında OWNER oturumundan silinmiştir. Audit kayıtlarında TASK_DELETE/CAMPAIGN_DELETE ve öncesinde OWNER MFA login vardır. Güncel yayın öncesi13:03UTC yedeğinde ve migration sonrasında **0 kampanya/0 görev** bulunur; eski sütun/row hashleri eşleşir. Silmeler bu deployment veya migration tarafından yapılmamıştır. İşlemi yapan gerçek kişi yalnız audit actoründen çıkarılamaz. Mevcut kullanıcı, ledger ve CONNECTED Telegram hesabı korunur. Yeni görev/kampanya oluşturulmamış, silinmiş kayıtlar geri yüklenmemiştir.

Aşağıdaki1TURK/25 kullanıcı/25TURK görevi referansları artık **tarihsel görev tanımıdır**, aktif canlı görev değildir. Görev motoru regression fixture'ları bu yapıyı test eder; güncel canlı panel doğru şekilde “Henüz yayınlanmış görev yok” gösterir. Yeni ödüllü görevin yayınlanması ayrı açık operatör işlemi gerektirir. Canlı kontrolün ilk denemesinde eski görevID'si bekleyen rapor scripti başarısız olmuştur; bu uygulama hatası değil, eski envanter varsayımıdır ve gizlenmeden raporlanır.


## v0.5.0 güncel kapsam — 3 Kasım 2026

Kaynak dalı `feature/multi-social-rewards-engine`; önceki canlı sürüm `3c85ac1a29b51d86d74d1fe7cc847ee391f7a4c0` (v0.4.5). Aşağıdaki eski envanterler tarihsel kanıttır; güncel modüller ve sınırlar bu bölüm ile sosyal dokümanlarda açıklanır. Çalışan tam SHA, `.runtime/deployment.json` ve `.runtime/validated.json` üzerinden doğrulanır; bu dosyanın bulunduğu commit kendi hashini içermez. Yayın sonucu [PRODUCTION_RELEASE_REPORT.md](PRODUCTION_RELEASE_REPORT.md).

8 platform ve 65 görev tanımı vardır. Katalogda bulunması gerçek API bağlantısı veya ödüllü yayın izni değildir. X/YouTube teşvikli etkileşimleri politika nedeniyle kapalı; Meta/TikTok normal ticari API yetenekleri sınırlı; Kick/Twitch ödüllü etkileşimleri izin incelemesi olmadan kapalıdır. Sadece mevcut Telegram üyelik doğrulaması ve açıkça yapılandırılacak özel bot kanıtları uygulanmıştır. Hiçbir yeni canlı görev/kampanya otomatik oluşturulmaz. Tekrarlanabilir görevler reddedilir. Claim ve gerçek transferler kapalıdır.

Silinmeden önceki Telegram görevi kullanıcı başına **1 TURK**, **25 kullanıcı**, ortak kampanya **25 TURK** bütçesidir; 10 TURK eski taslaktır. Önceki üç kampanya/dört görevin tarihsel durumu yukarıdaki canlı envanter düzeltmesinde açıklanır. `REWARD_CLAIMS_PAUSED=true`; master ödeme yetkisi tanımsızken etkin değer false olur. Telegram GROUP `-1003676977941` string olarak korunur. Gizli değerler dokümantasyona yazılmaz.

Yeni gerçek dosyalar (tam kök `/var/www/rewards.turkscan.com/REWARDSTEST`; production eşleri `/var/www/rewards.turkscan.com/rewards`):

| Göreli dosya | İşlev / bağlantı |
|---|---|
| apps/api/src/social-catalog.ts | 65 tanım, kapsam/politika/izin/kaynak matrisi |
| apps/api/src/social-controller.ts | Katalog, toplu taslak, hedef, kanıt, webhook API |
| apps/api/src/social-engine.ts | Adapter orkestrasyonu, private bot challenge, replay ve webhook install |
| apps/api/src/social-adapters.ts | Ortak connect/disconnect/refresh/target/verify/webhook/permissions arayüzü |
| apps/api/src/social-targets.ts | 8 platform HTTPS/domain URL allowlist ve nesne ayrıştırma |
| apps/api/src/social-http.ts | Sabit resmî API hostları, timeout, redirect reddi, 429, sınırlı backoff |
| apps/api/src/social-identity.ts | Platform kimliğinin SHA256 rezervasyon özeti |
| apps/api/src/social-webhook-signatures.ts | Telegram secret, Twitch/Meta HMAC, Kick RSA |
| apps/api/src/kick-public-key.ts | Resmî API'den dinamik RSA key/cache |
| apps/api/src/social-maintenance.ts | Süre/bütçe kapatma, geçici kanıt temizliği |
| apps/api/src/social-token-maintenance.ts | Twitch saatlik token doğrulama gerekliliği |
| apps/api/src/social-scopes.ts | Platform bazlı izin allowlist |
| apps/web/app/admin/social-task-builder.tsx | Dinamik görev/önizleme/toplu taslak/düzenleme |
| apps/web/app/dashboard/bot-task.tsx | Özel bot kanıtını kullanıcıya gösterme |
| apps/web/app/social-icons.tsx | 8 platform SVG simgesi |
| apps/web/app/timezones.ts | IANA↔UTC dönüşümü, DST belirsizlik reddi |
| prisma/migrations/202611030001_multi_social_engine/migration.sql | Eklemeli15. migration |
| tests/social-foundation.test.ts | Katalog/protokol/URL/saat birim testleri |
| tests/social-engine.integration.test.ts | Gerçek TEST DB bütçe/kimlik/kanıt transactionları |
| tests/social-api.integration.test.ts | Gerçek TEST HTTP yetki/şifreleme/webhook testleri |
| tests/browser-multi-social.e2e.mts | Mock API ile TR/EN masaüstü/mobil oluşturucu |


---

## Önceki sürüm envanteri (tarihsel)


Doğrulama anı: 2026-11-02T22:34:00.042Z. Production sürümü: **0.4.5 / `cc61b966bf684ad2f602b36100c3bf1de7f4d0a7`**. Bu doküman TEST dalında hazırlanmıştır; bu çalışmada production kodu/verisi/configuration değiştirilmez. Yollar sunucu `138.226.246.138` üzerindedir. Gerçek ENV/credential değerleri açıklanmaz.

## Kaynak kökleri

TEST kaynak: `/var/www/rewards.turkscan.com/REWARDSTEST`. Production Git kaynak: `/var/www/rewards.turkscan.com/rewards`. Çalışan production kaynak `/var/www/rewards.turkscan.com/rewards/current` → `/var/www/rewards.turkscan.com/rewards/.releases/cc61b966bf684ad2f602b36100c3bf1de7f4d0a7`. Runtime immutable release Git arşivi + doğrulanmış node_modules/API dist/Next .next kopyasıdır; `.env` release içine konmaz.

| Tam TEST yolu | Amaç |
|---|---|
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src` | Düz Nest controller/service/security/provider modülleri; derleme dist/ üretir. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app` | Next App Router frontend, SSR layout/home/runtime ve locale wrapper sayfaları. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin` | AdminModules, settings, social ve hero yönetimi. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard` | Cüzdan/sosyal/görev/ledger/claim/kazanım rehberi. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/tr` | TR locale home/admin/dashboard wrapper; ana bileşenleri tekrar kullanır. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/en` | EN locale home/admin/dashboard wrapper; ayrı backend yok. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/prisma` | schema.prisma; fiziksel PostgreSQL model ve migration kaynakları. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations` | 14 kronolojik SQL migration ve provider lock. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/packages/contracts/src` | NativeRewardVault.sol ve legacy NativeTURKClaims.sol alias. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/packages/contracts/test` | Foundry kontrat güvenlik/regresyon testleri. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/tests` | Node unit/HTTP PostgreSQL Redis integration ve Playwright e2e MTS. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/nginx` | TEST loopback ve production TLS Nginx kaynak şablonları. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts` | Provision/build/test/backup/deploy/rollback/secret/health/GitHub araçları. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/.github/workflows` | deno.yml adı tarihsel; mevcut içerik Node validation CI. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/docs` | Teknik dokümantasyon, tarihsel release raporları ve sanitize test evidence. |

## Backend dosyaları

| Tam yol | Görev ve modül bağlantısı |
|---|---|
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts` | AuthService + UserAuthController/AdminAuthController: SIWE challenge/session, scrypt parola, TOTP MFA, roller ve admin hesapları. security/data/configuration ile bağlı. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/claims.ts` | ClaimService/ClaimController; EIP-712 imza, AVAILABLE→RESERVED→CLAIMED, receipt/event/reorg/expiry denetimi; ABI burada inline. config/data/wallet/claims UI ile bağlı. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts` | OWNER ayar endpointleri: ağ/branding/runtime/ENV template/credential ve history. ConfigurationService/SecretStore kullanır. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/configuration.ts` | Network/branding Zod şemaları, single-chain lock, DB konfigürasyonu, RPC/WSS/contract doğrulama ve SecretStore AES-GCM erişimi. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/data.ts` | PrismaPg PostgreSQL ve ioredis bağlantıları; DB/Redis/worker heartbeat health; audit yazımı. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/engine.ts` | Görev/kampanya yaşam döngüsü, etki/silme/arşiv, tarihler, policy, Bot API üyeliği, submission ve ledger muhasebesi, serializable kilit/retry. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/errors.ts` | Global SafeErrors exception filter; alan bazlı VALIDATION_ERROR, güvenli Prisma hata dönüşümü; secret/log sızıntısını sınırlama. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/hero-media.ts` | GIF signature/boyut/frame doğrulama ve HeroVisual byte saklama; public metadata/image ve OWNER+step-up yönetimi. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/integration-settings.ts` | ENV + şifreli DB sosyal credential override; API testleri, safe hata/kota durumu ve masked ayar yönetimi. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/main.ts` | Nest AppModule, tüm controller/service kaydı, public health/config/campaigns/integrations; Helmet/no-store/trust-proxy/loopback bootstrap. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/oauth-lifecycle.ts` | Refresh/revoke provider adaptörleri, kimlik/scope kontrolü, Redis NX lease/cooldown, version guard; kişisel refresh controller. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts` | OfficialSocialAccount CRUD/default/import/connect/disconnect, Telegram Bot API grup bağlantısı, resmi OAuth hedef seçimi; yeni Chat ID şeması burada. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/policy.ts` | Sadece incelenmiş FIRST_PARTY/TURKCHAIN EDUCATION ve TELEGRAM_MEMBERSHIP sosyal görevlerini açan fail-closed politika. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/providers.ts` | 8 OAuth provider endpoint/scope/PKCE tanımı; Telegram JWKS issuer/audience/nonce OIDC; code exchange ve provider kimlik eşleme. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/security.ts` | scrypt hash, AES-256-GCM, APP_ENV AAD, SHA256 digest/constant-time compare, origin, cookie ve Zod parse yardımcıları. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/social-config.ts` | Platform ENV alias haritası, public resmî metadata, güvenli URL/credential hazır olma çözümleme. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/social.ts` | Kişisel OAuth connect/callback/disconnect; browser/session/state/PKCE/generation korumaları; resmi callback de burada işlenir. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/telegram-verifier.ts` | Sabit api.telegram.org hedefinde getMe/getChat/getChatMember; timeout/yanıt/ID safe integer sınırı; bot-admin ve kullanıcı üyelik kontrolü. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/worker.ts` | Ayrı BullMQ maintenance Worker/Queue; yalnız heartbeat job scheduler (15sn), Redis worker:heartbeat TTL45sn; ödül dağıtım workerı değildir. |

## Frontend dosyaları

| Tam yol | Görev ve bağlantı |
|---|---|
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/page.tsx` | Ana sayfa erken erişim/ödül kapalı açıklaması ve Hero; gerçek kampanya listesi fetch etmez. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/layout.tsx` | Server runtime branding/SEO + headers locale; RuntimeProvider/LocaleProvider, header/footer/dil seçici. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/hero.tsx` | Homepage hero ve yönetilebilir GIF; /api/hero metadata ve public asset. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/runtime.tsx` | PublicConfig tipi/context; /api/config refresh (30sn/focus), wallet provider context; tek-chain görünümü. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/server-config.ts` | SSR için INTERNAL_API_URL/api/config no-store/5sn fetch; deployment origin runtime çözümü. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/i18n.tsx` | LocaleProvider, useLanguage, T, yeni translateText; TR→EN sözlük ve ters eşleme; dil cookie/route seçimi. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/translations.json` | TR/EN arayüz sözlüğü; yeni Telegram ID ipucu ve alan hatası çevirileri. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/wallet.tsx` | MetaMask/WalletConnect EIP-1193; SIWE challenge/signature/session, profil ve network doğrulama. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/style.css` | Genel responsive tema, admin/modal/form/kart ve kazanım rehberi stilleri. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard/page.tsx` | Kazanım rehberi→Wallet→SocialAccounts→TaskBoard→Claims→OfficialAccounts bileşen düzeni. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard/board.tsx` | Public/auth görev listesi, localizedContent fallback, tarih/status/proof/Telegram doğrulama ve ledger/geçmiş. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard/earning-guide.tsx` | Altı adımlı cüzdan zorunlu/koşullu sosyal bağlantı, Telegram örneği ve iç bakiye açıklaması. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard/social.tsx` | Kişisel sosyal hesap listesi/connect/refresh/disconnect; yalnız oturum açmış kullanıcı. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard/official.tsx` | Public resmî hesap bağlantıları; kişisel OAuth hesabından ayrı. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard/claims.tsx` | Claim UI; prepare/imza transaction taslağı, EIP1193 gönderim, refresh/expire; mevcut pause durumunda transfer devre dışı. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin/page.tsx` | Parola login/bootstrap/MFA, AdminModules ve admin session/parola yönetimi. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin/modules.tsx` | Sekmeler/summary/users/campaigns/tasks/submissions/ledger/claims/audit/system; API çağrıları ve form editörleri. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin/lifecycle.tsx` | Durum filtresi, native dialog etki/onay, TR/EN content ve UTC tarih form yardımcıları. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin/social-management.tsx` | Resmî hesap ve registry CRUD/connect/default; yeni negatif Chat ID örneği ve lokalize API alan hataları. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin/social-api.tsx` | OWNER sosyal API credential/ayar formları; maskeli durum, kaydet/test akışı. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin/settings.tsx` | OWNER blockchain/branding/configuration/credential/effective/history ekranları. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin/hero-visual.tsx` | GIF upload/preview/publish/disable/remove ve step-up header akışı. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/robots.ts` | Runtime origin; admin indexing engeli. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/sitemap.ts` | Runtime production/test origin çözümleme. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/icon.svg` | Varsayılan vektör ikon. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/proxy.ts` | Next proxy: x-rewards-path/x-rewards-locale headerları; bir auth middleware değildir. |
| `/var/www/rewards.turkscan.com/REWARDSTEST/apps/web/next.config.ts` | poweredByHeader kapalı; build CPU1; ayrı API route proxy tanımı yok, Nginx kullanılır. |

`app/tr/page.tsx`, `app/tr/admin/page.tsx`, `app/tr/dashboard/page.tsx` ve EN karşılıkları ortak home/admin/dashboard export eder; locale RootLayout/proxy üzerinden belirlenir. `controllers/`, `services/`, `middleware/`, `models/`, `jobs/`, `queue/` diye olmayan dizinler bu haritada uydurulmamıştır. PostgreSQL modelleri tek `prisma/schema.prisma` dosyasındadır. API route dosyaları Next `app/api` altında değildir; Nest decoratorları ve Nginx `/api/` proxy kullanılır.

## Diğer önemli kök dosyalar

| Tam TEST yolu | Görev |
|---|---|
| /var/www/rewards.turkscan.com/REWARDSTEST/package.json | Monorepo sürüm0.4.5, npm workspace ve build/test komutları. |
| /var/www/rewards.turkscan.com/REWARDSTEST/package-lock.json | Bağımlılık çözümlemesi; npm ci için kaynak. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma.config.ts | Prisma datasource DATABASE_URL ve schema/migrations yolu. |
| /var/www/rewards.turkscan.com/REWARDSTEST/.env.example | Sadece güvenli template; gerçek secret dosyası değildir. |
| /var/www/rewards.turkscan.com/REWARDSTEST/.gitignore | ENV/runtime/build/node_modules/backups/logs/contract generated çıktıları Git dışında. |
| /var/www/rewards.turkscan.com/REWARDSTEST/eslint.config.mjs | TypeScript lint kapsamı; tests ve apps. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/api/tsconfig.json | Nest decorator/metadata ve tsc dist hedefi. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/tsconfig.json | Next/React typecheck; no-emit. |
| /var/www/rewards.turkscan.com/REWARDSTEST/packages/contracts/foundry.toml | Solidity kaynak/test/out/remapping ve optimizer ayarları. |

## Gerçekte mevcut runtime / sunucu dizinleri

| Yol | Amaç / gizlilik |
|---|---|
| /var/www/rewards.turkscan.com/REWARDSTEST/.env | TEST gerçek ENV; içerik belgelenmez, sadece isim envanteri ENV_CONFIGURATION içinde. |
| /var/www/rewards.turkscan.com/rewards/.env | Production gerçek ENV; release SHA burada runtime metadata olarak güncellenir; bu işte dokunulmaz. |
| /var/www/rewards.turkscan.com/REWARDSTEST/.runtime | Git dışı browser tools/screenshots/validated marker ve private inceleme kanıtları; secret taşıyan dosyalar rapora kopyalanmaz. |
| /var/www/rewards.turkscan.com/REWARDSTEST/.codex | Oturum/progress lock dosyaları. |
| /var/www/rewards.turkscan.com/REWARDSTEST/logs | TEST api/web/worker ve yeni validation test/build logları. |
| /var/www/rewards.turkscan.com/REWARDSTEST/backups | TEST dump/yedekler; production ile ayrı. |
| /var/www/rewards.turkscan.com/rewards/.runtime | Production deployment.json ve servis runtime state. |
| /var/www/rewards.turkscan.com/rewards/.releases | Immutable üretilmiş production artifactleri. |
| /var/www/rewards.turkscan.com/rewards/current | Aktif artifact symlink. |
| /var/www/rewards.turkscan.com/rewards/previous | Rollback artifact symlink; 7e9704d release korunuyor. |
| /var/www/rewards.turkscan.com/rewards/logs | Production api/web/worker logları. |
| /var/www/rewards.turkscan.com/rewards/backups | Korumalı production pg_dump ve deploy Nginx yedekleri. |
| /var/www/rewards.turkscan.com/REWARDSTEST/node_modules | npm workspace bağımlılıkları; Git dışı. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/api/dist | tsc backend derlemesi; Git dışı. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/.next | Next build/cache/artifact; Git dışı. |
| /var/www/rewards.turkscan.com/REWARDSTEST/packages/contracts/out | Foundry generated ABI/bytecode artifacts; deploy kanıtı değildir. |
| /var/www/rewards.turkscan.com/REWARDSTEST/packages/contracts/cache | Foundry compile cache. |
| /etc/systemd/system/rewards-*.service | Doğrulanmış Rewards systemd unit dosyaları. |
| /etc/nginx/sites-available/rewards.turkscan.com | Aktif production reverse proxy. |
| /etc/nginx/sites-available/rewards-test-loopback.conf | Aktif TEST reverse proxy; repo şablonundan dosya adı farklı. |
| /etc/rewards-test-redis.conf | TEST loopback Redis18390/AOF dizin ayarı. |
| /etc/rewards-prod-redis.conf | Production loopback Redis18391/AOF dizin ayarı. |
| /var/lib/rewards-test | TEST Redis AOF/veri yolu. |
| /var/lib/rewards-prod | Production Redis AOF/veri yolu. |
| /var/lib/postgresql/14/main | Rewards DBlerinin bulunduğu PostgreSQL14 cluster veri dizini. |
| /var/log/nginx | Rewards safe erişim/error logları. |
| /var/www/rewards.turkscan.com/PROJECT_HANDOFF.md | Kanonik operasyon devam notu; source dokümanlarıyla birlikte oku. |
| /root/frontend/CODEX_PROGRESS.md | Companion ilerleme kaydı; Rewards kaynak kodu değildir. |

## İncelenen kaynak dosya listesi

Aşağıdaki yollar TEST köküne göredir; tam yol elde etmek için `/var/www/rewards.turkscan.com/REWARDSTEST/` öneki kullanılır. Generated çıktılar, gerçek ENV ve bağımlılık dosya ağacı kasıtlı olarak kaynak listesine katılmaz.

```text
.env.example
.github/workflows/deno.yml
.gitignore
README.md
apps/api/package.json
apps/api/src/auth.ts
apps/api/src/claims.ts
apps/api/src/config-controller.ts
apps/api/src/configuration.ts
apps/api/src/data.ts
apps/api/src/engine.ts
apps/api/src/errors.ts
apps/api/src/hero-media.ts
apps/api/src/integration-settings.ts
apps/api/src/main.ts
apps/api/src/management.ts
apps/api/src/oauth-lifecycle.ts
apps/api/src/official-accounts.ts
apps/api/src/policy.ts
apps/api/src/providers.ts
apps/api/src/security.ts
apps/api/src/social-config.ts
apps/api/src/social.ts
apps/api/src/telegram-verifier.ts
apps/api/src/worker.ts
apps/api/tsconfig.json
apps/web/app/admin/hero-visual.tsx
apps/web/app/admin/lifecycle.tsx
apps/web/app/admin/modules.tsx
apps/web/app/admin/page.tsx
apps/web/app/admin/settings.tsx
apps/web/app/admin/social-api.tsx
apps/web/app/admin/social-management.tsx
apps/web/app/dashboard/board.tsx
apps/web/app/dashboard/claims.tsx
apps/web/app/dashboard/earning-guide.tsx
apps/web/app/dashboard/official.tsx
apps/web/app/dashboard/page.tsx
apps/web/app/dashboard/social.tsx
apps/web/app/en/admin/page.tsx
apps/web/app/en/dashboard/page.tsx
apps/web/app/en/page.tsx
apps/web/app/hero.tsx
apps/web/app/i18n.tsx
apps/web/app/icon.svg
apps/web/app/layout.tsx
apps/web/app/page.tsx
apps/web/app/robots.ts
apps/web/app/runtime.tsx
apps/web/app/server-config.ts
apps/web/app/sitemap.ts
apps/web/app/style.css
apps/web/app/tr/admin/page.tsx
apps/web/app/tr/dashboard/page.tsx
apps/web/app/tr/page.tsx
apps/web/app/translations.json
apps/web/app/wallet.tsx
apps/web/next-env.d.ts
apps/web/next.config.ts
apps/web/package.json
apps/web/proxy.ts
apps/web/tsconfig.json
eslint.config.mjs
infrastructure/nginx/rewards-test.conf
infrastructure/nginx/rewards.conf
infrastructure/scripts/backup-database.sh
infrastructure/scripts/build-test.sh
infrastructure/scripts/check-health.sh
infrastructure/scripts/check-services.sh
infrastructure/scripts/check-ssl.sh
infrastructure/scripts/common.sh
infrastructure/scripts/deploy-production.py
infrastructure/scripts/deploy-production.sh
infrastructure/scripts/install-services.py
infrastructure/scripts/progress.py
infrastructure/scripts/promote-to-production.sh
infrastructure/scripts/provision.py
infrastructure/scripts/prune-artifacts.py
infrastructure/scripts/restore-database.sh
infrastructure/scripts/rollback-production.sh
infrastructure/scripts/scan-secrets.py
infrastructure/scripts/setup-production.sh
infrastructure/scripts/setup-server.sh
infrastructure/scripts/setup-test.sh
infrastructure/scripts/ssh-check.sh
infrastructure/scripts/sync-github.sh
infrastructure/scripts/test-all.sh
infrastructure/scripts/validate-release.sh
package-lock.json
package.json
packages/contracts/foundry.toml
packages/contracts/src/NativeRewardVault.sol
packages/contracts/src/NativeTURKClaims.sol
packages/contracts/test/NativeTURKClaims.t.sol
prisma.config.ts
prisma/migrations/202610310001_foundation/migration.sql
prisma/migrations/202610310002_auth/migration.sql
prisma/migrations/202610310003_engine/migration.sql
prisma/migrations/202610310004_constraints/migration.sql
prisma/migrations/202610310005_social/migration.sql
prisma/migrations/202610310006_integration_settings/migration.sql
prisma/migrations/202610310007_network_configuration/migration.sql
prisma/migrations/202610310008_official_accounts/migration.sql
prisma/migrations/202610310009_platform_registry/migration.sql
prisma/migrations/202610310010_oauth_link_generations/migration.sql
prisma/migrations/202610310011_claim_authorizations/migration.sql
prisma/migrations/202610310012_social_configuration_status/migration.sql
prisma/migrations/202611010001_hero_visual/migration.sql
prisma/migrations/202611020001_task_content_lifecycle/migration.sql
prisma/migrations/migration_lock.toml
prisma/schema.prisma
tests/auth.integration.test.ts
tests/browser-earning-guide.e2e.mts
tests/browser-hero.e2e.mts
tests/browser-lifecycle.e2e.mts
tests/browser-telegram-validation.e2e.mts
tests/configuration.integration.test.ts
tests/engine.integration.test.ts
tests/integration.test.ts
tests/lifecycle.integration.test.ts
tests/policy.test.ts
tests/portable-security.test.ts
tests/security.test.ts
tests/telegram-mission.integration.test.ts
tests/telegram-target-validation.integration.test.ts
tests/telegram-target-validation.test.ts
tests/telegram-verifier.test.ts
```

Test dosyalarının tek tek kapsamı PROJECT_DOCUMENTATION ve API dokümanında, script komutlarının işlevi DEPLOYMENT_GUIDE içindedir.

## Her kaynak alt klasörünün tam yolu ve doğrudan dosyaları

| Tam yol | Doğrudan dosyalar | Görev / modül bağı |
|---|---|---|
| /var/www/rewards.turkscan.com/REWARDSTEST/.github | alt klasörler | Node GitHub Actions CI; test/build kaynaklarına bağlı, deploy yetkisi yok. |
| /var/www/rewards.turkscan.com/REWARDSTEST/.github/workflows | `deno.yml` | Node GitHub Actions CI; test/build kaynaklarına bağlı, deploy yetkisi yok. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps | alt klasörler | Monorepo parent; alt modüllerin kaynak kökü. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/api | `package.json`, `tsconfig.json` | Backend; flat controller/service bağımlılıkları ARCHITECTURE/API_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src | `auth.ts`, `claims.ts`, `config-controller.ts`, `configuration.ts`, `data.ts`, `engine.ts`, `errors.ts`, `hero-media.ts`, `integration-settings.ts`, `main.ts`, `management.ts`, `oauth-lifecycle.ts`, `official-accounts.ts`, `policy.ts`, `providers.ts`, `security.ts`, `social-config.ts`, `social.ts`, `telegram-verifier.ts`, `worker.ts` | Backend; flat controller/service bağımlılıkları ARCHITECTURE/API_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web | `next-env.d.ts`, `next.config.ts`, `package.json`, `proxy.ts`, `tsconfig.json` | Frontend; dosya görevleri yukarıda frontend tablosu ve PROJECT_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app | `hero.tsx`, `i18n.tsx`, `icon.svg`, `layout.tsx`, `page.tsx`, `robots.ts`, `runtime.tsx`, `server-config.ts`, `sitemap.ts`, `style.css`, `translations.json`, `wallet.tsx` | Frontend; dosya görevleri yukarıda frontend tablosu ve PROJECT_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin | `hero-visual.tsx`, `lifecycle.tsx`, `modules.tsx`, `page.tsx`, `settings.tsx`, `social-api.tsx`, `social-management.tsx` | Frontend; dosya görevleri yukarıda frontend tablosu ve PROJECT_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard | `board.tsx`, `claims.tsx`, `earning-guide.tsx`, `official.tsx`, `page.tsx`, `social.tsx` | Frontend; dosya görevleri yukarıda frontend tablosu ve PROJECT_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/en | `page.tsx` | Locale route wrapper; ortak App Router home/admin/dashboard bileşenlerine bağlanır. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/en/admin | `page.tsx` | Locale route wrapper; ortak App Router home/admin/dashboard bileşenlerine bağlanır. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/en/dashboard | `page.tsx` | Locale route wrapper; ortak App Router home/admin/dashboard bileşenlerine bağlanır. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/tr | `page.tsx` | Locale route wrapper; ortak App Router home/admin/dashboard bileşenlerine bağlanır. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/tr/admin | `page.tsx` | Locale route wrapper; ortak App Router home/admin/dashboard bileşenlerine bağlanır. |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/tr/dashboard | `page.tsx` | Locale route wrapper; ortak App Router home/admin/dashboard bileşenlerine bağlanır. |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs | `ADMIN_SETUP.md`, `API_DOCUMENTATION.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `CODEX_CONTEXT.md`, `CURRENT_STATUS.md`, `DATABASE_DOCUMENTATION.md`, `DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_HISTORY.md`, `DIRECTORY_STRUCTURE.md`, `ENV_CONFIGURATION.md`, `HERO_VISUAL.md`, `IMPLEMENTATION_STATUS.md`, `PORTABLE_CONFIGURATION.md`, `PRODUCTION_STATUS.md`, `PROJECT_DOCUMENTATION.md`, `REWARDS_V045_TEST_REPORT.md`, `RUNBOOK.md`, `SOCIAL_API_CONFIGURATION.md`, `TELEGRAM_MEMBERSHIP_MISSIONS.md`, `WORK_COMPLETION_REPORT.md` | Teknik referans, tarihsel rapor veya sanitize evidence; CODEX_CONTEXT başlangıç. |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/evidence | `v045-browser.json`, `v045-validation.json` | Teknik referans, tarihsel rapor veya sanitize evidence; CODEX_CONTEXT başlangıç. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure | alt klasörler | Operasyon/proxy; script işlevleri DEPLOYMENT_GUIDE içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/nginx | `rewards-test.conf`, `rewards.conf` | Operasyon/proxy; script işlevleri DEPLOYMENT_GUIDE içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts | `backup-database.sh`, `build-test.sh`, `check-health.sh`, `check-services.sh`, `check-ssl.sh`, `common.sh`, `deploy-production.py`, `deploy-production.sh`, `install-services.py`, `progress.py`, `promote-to-production.sh`, `provision.py`, `prune-artifacts.py`, `restore-database.sh`, `rollback-production.sh`, `scan-secrets.py`, `setup-production.sh`, `setup-server.sh`, `setup-test.sh`, `ssh-check.sh`, `sync-github.sh`, `test-all.sh`, `validate-release.sh` | Operasyon/proxy; script işlevleri DEPLOYMENT_GUIDE içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/packages | alt klasörler | Monorepo parent; alt modüllerin kaynak kökü. |
| /var/www/rewards.turkscan.com/REWARDSTEST/packages/contracts | `foundry.toml` | Solidity native claim kaynak/test/build config; claims.ts ABI ve Foundry ile bağlı. |
| /var/www/rewards.turkscan.com/REWARDSTEST/packages/contracts/src | `NativeRewardVault.sol`, `NativeTURKClaims.sol` | Solidity native claim kaynak/test/build config; claims.ts ABI ve Foundry ile bağlı. |
| /var/www/rewards.turkscan.com/REWARDSTEST/packages/contracts/test | `NativeTURKClaims.t.sol` | Solidity native claim kaynak/test/build config; claims.ts ABI ve Foundry ile bağlı. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma | `schema.prisma` | Prisma model/migration bağlantısı; PostgreSQL kaynakları. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations | `migration_lock.toml` | Prisma model/migration bağlantısı; PostgreSQL kaynakları. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310001_foundation | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310002_auth | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310003_engine | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310004_constraints | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310005_social | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310006_integration_settings | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310007_network_configuration | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310008_official_accounts | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310009_platform_registry | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310010_oauth_link_generations | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310011_claim_authorizations | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202610310012_social_configuration_status | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202611010001_hero_visual | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202611020001_task_content_lifecycle | `migration.sql` | Bu isimde tek SQL migration; etkilenen tablo/işlem DATABASE_DOCUMENTATION içinde. |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests | `auth.integration.test.ts`, `browser-earning-guide.e2e.mts`, `browser-hero.e2e.mts`, `browser-lifecycle.e2e.mts`, `browser-telegram-validation.e2e.mts`, `configuration.integration.test.ts`, `engine.integration.test.ts`, `integration.test.ts`, `lifecycle.integration.test.ts`, `policy.test.ts`, `portable-security.test.ts`, `security.test.ts`, `telegram-mission.integration.test.ts`, `telegram-target-validation.integration.test.ts`, `telegram-target-validation.test.ts`, `telegram-verifier.test.ts` | Unit/integration/browser doğrulama; modül kapsamı PROJECT_DOCUMENTATION test tablosu. |
