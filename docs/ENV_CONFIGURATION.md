# ENV ve konfigürasyon sözlüğü

## Canlı envanter düzeltmesi — 3 Kasım 2026, yayın sonrası doğrulama

11:28UTC envanterindeki3 kampanya/4 görev, yayından **önce**,12:29:00–12:29:18UTC (Türkiye15:29) arasında OWNER oturumundan silinmiştir. Audit kayıtlarında TASK_DELETE/CAMPAIGN_DELETE ve öncesinde OWNER MFA login vardır. Güncel yayın öncesi13:03UTC yedeğinde ve migration sonrasında **0 kampanya/0 görev** bulunur; eski sütun/row hashleri eşleşir. Silmeler bu deployment veya migration tarafından yapılmamıştır. İşlemi yapan gerçek kişi yalnız audit actoründen çıkarılamaz. Mevcut kullanıcı, ledger ve CONNECTED Telegram hesabı korunur. Yeni görev/kampanya oluşturulmamış, silinmiş kayıtlar geri yüklenmemiştir.

Aşağıdaki1TURK/25 kullanıcı/25TURK görevi referansları artık **tarihsel görev tanımıdır**, aktif canlı görev değildir. Görev motoru regression fixture'ları bu yapıyı test eder; güncel canlı panel doğru şekilde “Henüz yayınlanmış görev yok” gösterir. Yeni ödüllü görevin yayınlanması ayrı açık operatör işlemi gerektirir. Canlı kontrolün ilk denemesinde eski görevID'si bekleyen rapor scripti başarısız olmuştur; bu uygulama hatası değil, eski envanter varsayımıdır ve gizlenmeden raporlanır.


## v0.5.0 güncel kapsam — 3 Kasım 2026

Kaynak dalı `feature/multi-social-rewards-engine`; önceki canlı sürüm `3c85ac1a29b51d86d74d1fe7cc847ee391f7a4c0` (v0.4.5). Aşağıdaki eski envanterler tarihsel kanıttır; güncel modüller ve sınırlar bu bölüm ile sosyal dokümanlarda açıklanır. Çalışan tam SHA, `.runtime/deployment.json` ve `.runtime/validated.json` üzerinden doğrulanır; bu dosyanın bulunduğu commit kendi hashini içermez. Yayın sonucu [PRODUCTION_RELEASE_REPORT.md](PRODUCTION_RELEASE_REPORT.md).

8 platform ve 65 görev tanımı vardır. Katalogda bulunması gerçek API bağlantısı veya ödüllü yayın izni değildir. X/YouTube teşvikli etkileşimleri politika nedeniyle kapalı; Meta/TikTok normal ticari API yetenekleri sınırlı; Kick/Twitch ödüllü etkileşimleri izin incelemesi olmadan kapalıdır. Sadece mevcut Telegram üyelik doğrulaması ve açıkça yapılandırılacak özel bot kanıtları uygulanmıştır. Hiçbir yeni canlı görev/kampanya otomatik oluşturulmaz. Tekrarlanabilir görevler reddedilir. Claim ve gerçek transferler kapalıdır.

Silinmeden önceki Telegram görevi kullanıcı başına **1 TURK**, **25 kullanıcı**, ortak kampanya **25 TURK** bütçesidir; 10 TURK eski taslaktır. Önceki üç kampanya/dört görevin tarihsel durumu yukarıdaki canlı envanter düzeltmesinde açıklanır. `REWARD_CLAIMS_PAUSED=true`; master ödeme yetkisi tanımsızken etkin değer false olur. Telegram GROUP `-1003676977941` string olarak korunur. Gizli değerler dokümantasyona yazılmaz.

Kick/Twitch opsiyonel yeni ENV isimleri `KICK_*` ve `TWITCH_*`: CLIENT_ID, CLIENT_SECRET, CALLBACK_URL, ENABLED, ACCESS_TOKEN, REFRESH_TOKEN, CHANNEL_ID, CHANNEL_NAME, CHANNEL_URL, DEFAULT_TARGET_URL. OAuth için CLIENT_ID/CLIENT_SECRET ve kanonik callback zorunlu; ENABLED defaultfalse. Token/hedef aliasları yalnız legacy bootstrap fallbacktır; panelin şifreli Credential kayıtları tercih edilir. WEBHOOK_SECRET de mevcut ortak secretValues mekanizmasıyla okunur. `.env.example` boş örnekler içerir, gerçek değer içermez. Bu çalışma production ENV içine API anahtarı yazmaz.

`IntegrationSetting.requestedScopes`, `webhookEnabled`, `webhookVerifiedAt` DB ayarlarıdır, ENV değildir. Kullanıcı bağlantısı platformun minimum kimlik izinleriyle yapılır; yönetici seçili ilave scope yalnız resmî hesap OAuth akışına uygulanır. Webhook sırları encrypted Credential içinde saklanır. Redirect URI APP_URL originine bağlıdır. Panel API yanıtları secret yerine yalnız configured/stored/expiry durumları döndürür.

TEST ve production farklı DATABASE_URL,REDIS_URL,DATA_ENCRYPTION_KEY,session/port/origin kullanır; değerler burada listelenmez. Yeni Kick/Twitch canlı credentials yoksa NOT_CONFIGURED gösterilir. Aşağıdaki eski ENV varlık tablosu tarihsel snapshot olup yeni provider doluluğunu göstermez.

---

## Önceki sürüm envanteri (tarihsel)


Doğrulama anı: 2026-11-02T22:34:00.042Z. Production sürümü: **0.4.5 / `cc61b966bf684ad2f602b36100c3bf1de7f4d0a7`**. Bu doküman TEST dalında hazırlanmıştır; bu çalışmada production kodu/verisi/configuration değiştirilmez. Yollar sunucu `138.226.246.138` üzerindedir. Gerçek ENV/credential değerleri açıklanmaz.

## Kapsam ve öncelik

Gerçek `.env` dosyalarının **yalnız isim/dolu-boş/farklılık bilgileri** okundu; değerler burada yoktur. Liste `.env.example`, gerçek TEST/PRODUCTION anahtarları, kaynak literal referansları ve secretValues'ın gerçekten çalıştırdığı platform/suffix kombinasyonlarının birleşimidir. Bu yüzden bazı dinamik opsiyonlar template'te bulunmasa da aşağıda yer alır. `var` bir değer tanımlı demektir; secretın doğru/aktif olduğunu kanıtlamaz. `boş/yok`, encrypted DB override nedeniyle özellik kapalı demek değildir.

ConfigurationService ENV bootstrap'ı yalnız ilk DB kurulumunda varsayılan ağ/branding yaratır. Sonraki etkin değer BlockchainNetwork.config, ConfigDocument ve IntegrationSetting/şifreli Credential olabilir; `.env` değiştirmek var olan DB konfigürasyonunu otomatik ezmez. SecretStore scope/owner/kind; sosyal secretValues ENV + saved JSON override birleşimi; runtime client/callback/enabled override'ları ayrıca uygulanır. Doğru durumu `/api/admin/settings/effective`, integrations ve ilgili source fonksiyonuyla değerlendirin.

Installation single-chain lock zorunlu. WalletConnect kanonik `WALLETCONNECT_PROJECT_ID`, eski `BLOCKCHAIN_WALLETCONNECT_PROJECT_ID` sonradır. Callback kanonik `/api/oauth/:provider/callback`; `/api/social/:provider/callback` legacy alias kabul edilir. Callback origin APP_URL ile birebir eşleşmelidir.

`SESSION_COOKIE_NAME` cookie adını değiştirmez: source `rewards_${APP_ENV}_${kind}` kullanır. `ADMIN_WALLETS` admin yetkisi vermez: Admin DB role+MFA kullanır. Template `REWARDS_ENABLED`/`BLOCKCHAIN_MULTI_CHAIN_ENABLED` varlığı kodda feature açmaz; multiChainEnabled sabit false. Contract deployer address template anahtarı için mevcut tüketim bulunmadı.

## Bütün tespit edilen değişkenler

TEST/PROD sütunu değer içermeyen varlık bilgisidir. Fark sütunu secret değeri değil yalnız eşitlik sonucudur. Zorunluluk runtime kullanım koşuludur; opsiyonel provider'ın secretını tüm kurulum için zorunlu saymayın.

| Değişken | Amaç | Zorunluluk | Modül / referans | TEST/PROD doluluk | Ortam farkı |
|---|---|---|---|---|---|
| `ADMIN_BOOTSTRAP_TOKEN` | Yalnız ilk OWNER oluşturma yetkisi; admin mevcutsa bootstrap kapalı | İlk kurulumda | apps/api/src/auth.ts; tests/auth.integration.test.ts; tests/configuration.integration.test.ts | var/var | farklı |
| `ADMIN_WALLETS` | Legacy admin cüzdan listesi; güncel RBAC bunun yerine Admin DB role+MFA kullanır; mevcut uygulama kodunda tüketildiği bulunmadı, etkin bir güvenlik kontrolü sayılmaz | Template/legacy, kullanılmıyor | .env.example / runtime ENV; doğrudan tüketim bulunmadı | boş/yok/boş/yok | aynı/ikisi de boş |
| `ALLOW_LOCAL_EVM_TESTS` | TEST RPC localhost izni; production SSRF istisnası açmaz | Opsiyonel, yalnız TEST | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `API_PORT` | Nest loopback API listener portu | Zorunlu | apps/api/src/main.ts; tests/auth.integration.test.ts; tests/configuration.integration.test.ts; tests/engine.integration.test.ts; tests/integration.test.ts; tests/lifecycle.integration.test.ts; tests/telegram-target-validation.integration.test.ts | var/var | farklı |
| `APP_BRAND_NAME` | Marka etiketi | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `APP_DEFAULT_LANGUAGE` | Default tr/en locale | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `APP_DOMAIN` | Provision production metadata anahtarı; uygulama origin için APP_URL kullanır | Provision metadata | apps/api/src/configuration.ts (branding) | boş/yok/var | farklı |
| `APP_ENV` | test/production güvenlik alanı, AES AAD, cookie/worker namespace | Zorunlu | apps/api/src/configuration.ts; apps/api/src/data.ts; apps/api/src/main.ts; apps/api/src/security.ts; apps/api/src/worker.ts; tests/auth.integration.test.ts; tests/browser-earning-guide.e2e.mts; tests/browser-lifecycle.e2e.mts; tests/browser-telegram-validation.e2e.mts; tests/configuration.integration.test.ts; tests/engine.integration.test.ts; tests/integration.test.ts; tests/lifecycle.integration.test.ts; tests/portable-security.test.ts; tests/security.test.ts; tests/telegram-mission.integration.test.ts; tests/telegram-target-validation.integration.test.ts | var/var | farklı |
| `APP_FAVICON_URL` | Favicon URL | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | farklı |
| `APP_FOOTER` | Temel footer | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `APP_FOOTER_EN` | EN footer | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `APP_FOOTER_TR` | TR footer | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `APP_HOMEPAGE_TITLE` | Homepage temel başlığı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `APP_HOMEPAGE_TITLE_EN` | EN homepage başlık | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `APP_HOMEPAGE_TITLE_TR` | TR homepage başlık | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `APP_KEYWORDS` | SEO keyword listesi | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `APP_LOGO_URL` | Marka logosu URL | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | farklı |
| `APP_META_DESCRIPTION` | Temel SEO açıklaması | Opsiyonel/default veya DB override | apps/api/src/configuration.ts; apps/web/app/layout.tsx | var/boş/yok | farklı |
| `APP_META_DESCRIPTION_EN` | EN SEO açıklaması | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `APP_META_DESCRIPTION_TR` | TR SEO açıklaması | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `APP_NAME` | Uygulama adı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts; apps/web/app/layout.tsx | var/boş/yok | farklı |
| `APP_OFFICIAL_WEBSITE` | Resmî website metadata | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `APP_OG_IMAGE_URL` | OpenGraph görsel URL | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | farklı |
| `APP_SUPPORTED_LANGUAGES` | Desteklenen locale listesi | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `APP_SUPPORT_EMAIL` | Destek adresi metadata | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | farklı |
| `APP_THEME_PRIMARY_COLOR` | Tema HEX rengi | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `APP_URL` | Origin, SIWE domain/URI, OAuth callback ve metadata URL kökü | Zorunlu | apps/api/src/auth.ts; apps/api/src/integration-settings.ts; apps/api/src/providers.ts; apps/api/src/security.ts; apps/api/src/social.ts; apps/web/app/layout.tsx; apps/web/app/robots.ts; apps/web/app/sitemap.ts; tests/auth.integration.test.ts; tests/configuration.integration.test.ts; tests/engine.integration.test.ts; tests/lifecycle.integration.test.ts; tests/portable-security.test.ts; tests/telegram-target-validation.integration.test.ts | var/var | farklı |
| `BLOCKCHAIN_ACTIVE_NETWORK` | networkKey legacy fallback | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_AUTO_ADD_NETWORK` | Wallet ağ ekleme davranışı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_AUTO_PAUSE_ON_NETWORK_CHANGE` | Ağ değişiminde pause config flagı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_AUTO_SWITCH_NETWORK` | Wallet chain switch davranışı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_CHAIN_ID` | SIWE/RPC/kontrat domain chain ID; installation lock | Kanonik veya legacy aliasdan biri gerekli | apps/api/src/configuration.ts; tests/configuration.integration.test.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_CHAIN_ID_HEX` | Decimal ID ile uyumlu hex ID | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_CLAIM_ENABLED` | Ağ katmanında claim izni; tek başına yeterli değil | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_CLAIM_EXPIRY_SECONDS` | Claim authorization TTL saniye | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_CLAIM_MAX_AMOUNT` | Claim için maksimum integer wei, boş=kod üst sınırı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | farklı |
| `BLOCKCHAIN_CLAIM_MIN_AMOUNT` | Claim için minimum integer wei | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_CONFIRMATION_BLOCKS` | Claim receipt kesinleşme derinliği | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_CONTRACT_DEPLOYER_ADDRESS` | Template/konfigürasyon alanı; aşağıdaki kullanım notuna bakın; mevcut uygulama kodunda tüketildiği bulunmadı, etkin bir güvenlik kontrolü sayılmaz | Template/legacy, kullanılmıyor | .env.example / runtime ENV; doğrudan tüketim bulunmadı | boş/yok/boş/yok | farklı |
| `BLOCKCHAIN_CONTRACT_DEPLOYER_PRIVATE_KEY` | NETWORK deployer secret fallback; repo içinde çalışan deploy job yok | Opsiyonel/default veya DB override | apps/api/src/configuration.ts (alias/secret lookup) | boş/yok/boş/yok | farklı |
| `BLOCKCHAIN_CURRENCY_DECIMALS` | Native tutar gösterim/parse decimal sayısı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_CURRENCY_NAME` | Native para birimi adı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_CURRENCY_SYMBOL` | Native para birimi simgesi | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_EXPLORER_API_KEY` | Explorer secret fallback, mevcut explorer HEAD testinde token kullanımı sınırlı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts (alias/secret lookup) | boş/yok/boş/yok | farklı |
| `BLOCKCHAIN_EXPLORER_API_URL` | Explorer API metadata endpointi | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | farklı |
| `BLOCKCHAIN_EXPLORER_NAME` | Explorer etiketi | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_EXPLORER_URL` | Public explorer kökü | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_GAS_SPONSORSHIP_ENABLED` | Gaz sponsorluğu konfigürasyonu; mevcut workflow otomatik sponsor göndermez | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_METAMASK_ENABLED` | MetaMask/EIP1193 UI yeteneği | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_MULTI_CHAIN_ENABLED` | Template/konfigürasyon alanı; aşağıdaki kullanım notuna bakın; mevcut uygulama kodunda tüketildiği bulunmadı, etkin bir güvenlik kontrolü sayılmaz | Template/legacy, kullanılmıyor | .env.example / runtime ENV; doğrudan tüketim bulunmadı | var/boş/yok | farklı |
| `BLOCKCHAIN_NETWORK_KEY` | Installation network key | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_NETWORK_NAME` | Ağ görünen adı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_NETWORK_TYPE` | mainnet/testnet türü | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_NETWORK_VALIDATION` | Network konfigürasyon validation flagı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_PROVIDER` | EVM chainType (mevcut şema evm) | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_REQUIRE_CHAIN_ID_MATCH` | Chain eşleşme config flagı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_REWARD_BYTECODE_HASH` | İzin verilen deployed bytecode hash | Sadece ayrı onaylı claim etkinleşirse | apps/api/src/configuration.ts | boş/yok/boş/yok | farklı |
| `BLOCKCHAIN_REWARD_SIGNER_ADDRESS` | Beklenen EIP712 signer adresi | Sadece ayrı onaylı claim etkinleşirse | apps/api/src/configuration.ts | boş/yok/boş/yok | farklı |
| `BLOCKCHAIN_REWARD_SIGNER_PRIVATE_KEY` | NETWORK reward signer secret fallback | Sadece ayrı onaylı claim etkinleşirse | apps/api/src/configuration.ts (alias/secret lookup) | boş/yok/boş/yok | farklı |
| `BLOCKCHAIN_REWARD_VAULT_ADDRESS` | Native claim vault kontrat adresi; burada boş | Sadece ayrı onaylı claim etkinleşirse | apps/api/src/configuration.ts | boş/yok/boş/yok | farklı |
| `BLOCKCHAIN_RPC_FALLBACK_URLS` | Virgülle ayrılan RPC alternatifleri | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | farklı |
| `BLOCKCHAIN_RPC_HEADERS` | NETWORK secret fallback JSON authorization header; gizli değer | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `BLOCKCHAIN_RPC_HTTP` | Backend chain JSON-RPC HTTP(S) endpoint | Kanonik veya legacy aliasdan biri gerekli | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_RPC_RETRIES` | Her endpoint için RPC retry sayısı | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_RPC_TIMEOUT_MS` | RPC/WSS timeout ms | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_RPC_WSS` | WebSocket endpoint, verify(wss) | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_WALLETCONNECT_ENABLED` | WalletConnect UI yeteneği | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | var/boş/yok | farklı |
| `BLOCKCHAIN_WALLETCONNECT_PROJECT_ID` | Kanonik WALLETCONNECT_PROJECT_ID için legacy alias | Opsiyonel/default veya DB override | apps/api/src/configuration.ts; tests/portable-security.test.ts | boş/yok/boş/yok | farklı |
| `BLOCKCHAIN_WALLET_RPC_HTTP` | Cüzdana bildirilen RPC adresi | Opsiyonel/default veya DB override | apps/api/src/configuration.ts | boş/yok/boş/yok | farklı |
| `CHAIN_EXPLORER_URL` | BLOCKCHAIN_EXPLORER_URL legacy fallback | Kanonik alan yoksa alias | apps/api/src/configuration.ts | var/var | aynı/ikisi de boş |
| `CHAIN_ID` | BLOCKCHAIN_CHAIN_ID legacy fallback | Kanonik alan yoksa alias | apps/api/src/configuration.ts; tests/configuration.integration.test.ts | var/var | aynı/ikisi de boş |
| `CHAIN_RPC_URL` | BLOCKCHAIN_RPC_HTTP legacy fallback | Kanonik alan yoksa alias | apps/api/src/configuration.ts | var/var | aynı/ikisi de boş |
| `CHAIN_WSS_URL` | BLOCKCHAIN_RPC_WSS legacy fallback | Kanonik alan yoksa alias | apps/api/src/configuration.ts | var/var | aynı/ikisi de boş |
| `DATABASE_SCHEMA` | Legacy ENV anahtarı; güncel Prisma datasource DATABASE_URL schema parametresini kullanır, bu değişkeni tüketmez | Kullanılmıyor | .env.example / runtime ENV; doğrudan tüketim bulunmadı | var/var | farklı |
| `DATABASE_URL` | PrismaPg PostgreSQL datasource; secret içerir | Zorunlu | apps/api/src/data.ts; infrastructure/scripts/backup-database.sh; infrastructure/scripts/restore-database.sh; tests/auth.integration.test.ts; tests/browser-hero.e2e.mts; tests/browser-lifecycle.e2e.mts; tests/configuration.integration.test.ts; tests/engine.integration.test.ts; tests/integration.test.ts; tests/lifecycle.integration.test.ts; tests/telegram-mission.integration.test.ts; tests/telegram-target-validation.integration.test.ts | var/var | farklı |
| `DATA_ENCRYPTION_KEY` | AES256-GCM 32 byte anahtarının 64 hex stringi; bootstrap doğrular | Zorunlu | apps/api/src/main.ts; apps/api/src/security.ts; tests/configuration.integration.test.ts; tests/security.test.ts | var/var | farklı |
| `DISCORD_ACCESS_TOKEN` | DISCORD — API/OAuth access token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `DISCORD_API_KEY` | DISCORD — Provider API key secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `DISCORD_API_SECRET` | DISCORD — Provider API secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `DISCORD_BEARER_TOKEN` | DISCORD — Bearer token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `DISCORD_BOT_TOKEN` | DISCORD — Bot API token secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues); apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `DISCORD_CALLBACK_URL` | DISCORD — Kanonik OAuth callback URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `DISCORD_CLIENT_ID` | DISCORD — OAuth client id alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `DISCORD_CLIENT_SECRET` | DISCORD — OAuth client secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `DISCORD_DEFAULT_TARGET_URL` | DISCORD — Varsayılan görev hedef URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `DISCORD_ENABLED` | DISCORD — Resmî/provider enabled flagı | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `DISCORD_GUILD_ID` | DISCORD — Discord guild ID | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `DISCORD_GUILD_NAME` | DISCORD — Discord guild adı | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `DISCORD_INVITE_URL` | DISCORD — Discord public invite URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `DISCORD_PAGE_ACCESS_TOKEN` | DISCORD — Facebook page token / dynamic field secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `DISCORD_REFRESH_TOKEN` | DISCORD — Refresh token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `FACEBOOK_ACCESS_TOKEN` | FACEBOOK — API/OAuth access token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `FACEBOOK_API_KEY` | FACEBOOK — Provider API key secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `FACEBOOK_API_SECRET` | FACEBOOK — Provider API secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `FACEBOOK_APP_ID` | FACEBOOK — Meta OAuth app ID alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `FACEBOOK_APP_SECRET` | FACEBOOK — Meta OAuth app secret alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `FACEBOOK_BEARER_TOKEN` | FACEBOOK — Bearer token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `FACEBOOK_BOT_TOKEN` | FACEBOOK — Bot API token secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `FACEBOOK_CALLBACK_URL` | FACEBOOK — Kanonik OAuth callback URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `FACEBOOK_CLIENT_ID` | FACEBOOK — OAuth client id alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `FACEBOOK_CLIENT_SECRET` | FACEBOOK — OAuth client secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `FACEBOOK_DEFAULT_TARGET_URL` | FACEBOOK — Varsayılan görev hedef URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `FACEBOOK_ENABLED` | FACEBOOK — Resmî/provider enabled flagı | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `FACEBOOK_OAUTH_ENABLED` | FACEBOOK — OAuth enable fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | FACEBOOK — Facebook page token / dynamic field secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues); apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `FACEBOOK_PAGE_ID` | FACEBOOK — Facebook Page ID string | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `FACEBOOK_PAGE_NAME` | FACEBOOK — Page görünen adı | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `FACEBOOK_PAGE_URL` | FACEBOOK — Page public URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `FACEBOOK_REDIRECT_URI` | FACEBOOK — OAuth callback legacy alias | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `FACEBOOK_REFRESH_TOKEN` | FACEBOOK — Refresh token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `GITHUB_ACCESS_TOKEN` | GITHUB — API/OAuth access token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `GITHUB_API_KEY` | GITHUB — Provider API key secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `GITHUB_API_SECRET` | GITHUB — Provider API secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `GITHUB_BEARER_TOKEN` | GITHUB — Bearer token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `GITHUB_BOT_TOKEN` | GITHUB — Bot API token secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `GITHUB_CALLBACK_URL` | GITHUB — Kanonik OAuth callback URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `GITHUB_CLIENT_ID` | GITHUB — OAuth client id alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `GITHUB_CLIENT_SECRET` | GITHUB — OAuth client secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `GITHUB_DEFAULT_TARGET_URL` | GITHUB — Varsayılan görev hedef URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `GITHUB_ENABLED` | GITHUB — Resmî/provider enabled flagı | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `GITHUB_ORGANIZATION` | GITHUB — GitHub org admin kimlik doğrulama hedefi | Opsiyonel/provider özelliğine bağlı | apps/api/src/official-accounts.ts; apps/api/src/social-config.ts | var/boş/yok | farklı |
| `GITHUB_ORG_NAME` | GITHUB — GitHub organization legacy metadata | Opsiyonel/provider özelliğine bağlı | apps/api/src/official-accounts.ts; apps/api/src/social-config.ts | var/boş/yok | farklı |
| `GITHUB_PAGE_ACCESS_TOKEN` | GITHUB — Facebook page token / dynamic field secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `GITHUB_PROFILE_URL` | GITHUB — Public resmî profil URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `GITHUB_REFRESH_TOKEN` | GITHUB — Refresh token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `GITHUB_REPOSITORY` | GITHUB — GitHub repo admin kimlik doğrulama hedefi | Opsiyonel/provider özelliğine bağlı | apps/api/src/official-accounts.ts; apps/api/src/social-config.ts | var/boş/yok | farklı |
| `GITHUB_REPO_NAME` | GITHUB — GitHub repository legacy metadata | Opsiyonel/provider özelliğine bağlı | apps/api/src/official-accounts.ts; apps/api/src/social-config.ts | var/boş/yok | farklı |
| `GITHUB_TASKS_ENABLED` | GITHUB — GitHub enable legacy fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `INSTAGRAM_ACCESS_TOKEN` | INSTAGRAM — API/OAuth access token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues); apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `INSTAGRAM_ACCOUNT_ID` | INSTAGRAM — Resmî hesap ID string | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `INSTAGRAM_API_KEY` | INSTAGRAM — Provider API key secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `INSTAGRAM_API_SECRET` | INSTAGRAM — Provider API secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `INSTAGRAM_APP_ID` | INSTAGRAM — Meta OAuth app ID alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `INSTAGRAM_APP_SECRET` | INSTAGRAM — Meta OAuth app secret alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `INSTAGRAM_BEARER_TOKEN` | INSTAGRAM — Bearer token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `INSTAGRAM_BOT_TOKEN` | INSTAGRAM — Bot API token secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `INSTAGRAM_CALLBACK_URL` | INSTAGRAM — Kanonik OAuth callback URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `INSTAGRAM_CLIENT_ID` | INSTAGRAM — OAuth client id alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `INSTAGRAM_CLIENT_SECRET` | INSTAGRAM — OAuth client secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `INSTAGRAM_DEFAULT_TARGET_URL` | INSTAGRAM — Varsayılan görev hedef URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `INSTAGRAM_ENABLED` | INSTAGRAM — Resmî/provider enabled flagı | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `INSTAGRAM_OAUTH_ENABLED` | INSTAGRAM — OAuth enable fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `INSTAGRAM_PAGE_ACCESS_TOKEN` | INSTAGRAM — Facebook page token / dynamic field secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `INSTAGRAM_PROFILE_URL` | INSTAGRAM — Public resmî profil URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `INSTAGRAM_REDIRECT_URI` | INSTAGRAM — OAuth callback legacy alias | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `INSTAGRAM_REFRESH_TOKEN` | INSTAGRAM — Refresh token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `INSTAGRAM_USERNAME` | INSTAGRAM — Resmî kullanıcı adı metadata | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `INTERNAL_API_URL` | Next SSR server-config backend adresi | Zorunlu | apps/web/app/server-config.ts | var/var | farklı |
| `MASTER_PAYOUTS_AUTHORIZED` | Native payout için ayrı owner authorization; varsayılan kapalı | Kapalı kalmalı | apps/api/src/claims.ts; apps/api/src/configuration.ts; apps/api/src/main.ts; apps/api/src/worker.ts | var/boş/yok | farklı |
| `META_GRAPH_VERSION` | Facebook/Instagram graph sürümü biçimi vN.N | Bu providerlar etkinse | apps/api/src/integration-settings.ts; apps/api/src/providers.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `NODE_ENV` | Next/Node runtime/build modu | Framework/operasyon | framework / infrastructure/scripts | var/var | aynı/ikisi de boş |
| `PORT` | Next start web listener portu | Zorunlu | framework / infrastructure/scripts | var/var | farklı |
| `REDIS_KEY_PREFIX` | Legacy ENV anahtarı; worker prefix rewards-APP_ENV olarak kodda hesaplanır, bu değişkeni tüketmez | Kullanılmıyor | .env.example / runtime ENV; doğrudan tüketim bulunmadı | var/var | farklı |
| `REDIS_URL` | ioredis/BullMQ challenge/state/rate limit/heartbeat bağlantısı | Zorunlu | apps/api/src/data.ts; apps/api/src/worker.ts; tests/auth.integration.test.ts; tests/integration.test.ts | var/var | farklı |
| `RELEASE_SHA` | Runtime API release metadata; deployment script yazar | Operasyonel/opsiyonel | apps/api/src/configuration.ts; apps/api/src/management.ts | boş/yok/var | farklı |
| `REWARDS_CURRENCY` | Currency name/symbol legacy alias | Kanonik yoksa opsiyonel | apps/api/src/configuration.ts | boş/yok/var | farklı |
| `REWARDS_ENABLED` | Legacy feature flag; mevcut runtime kodunda tüketim yok; mevcut uygulama kodunda tüketildiği bulunmadı, etkin bir güvenlik kontrolü sayılmaz | Template/legacy, kullanılmıyor | .env.example / runtime ENV; doğrudan tüketim bulunmadı | var/boş/yok | farklı |
| `REWARD_CLAIMS_PAUSED` | API/worker/claims env emniyet kilidi; bu sürümde true korunur | Zorunlu güvenlik | apps/api/src/claims.ts; apps/api/src/configuration.ts; apps/api/src/main.ts; apps/api/src/worker.ts | var/var | aynı/ikisi de boş |
| `REWARD_CLAIM_CONTRACT_ADDRESS` | BLOCKCHAIN_REWARD_VAULT_ADDRESS legacy alias | Yalnız separately authorized claim | apps/api/src/configuration.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `REWARD_CLAIM_SIGNER_PRIVATE_KEY` | Signer secret için legacy fallback; secret | Yalnız authorized claims | apps/api/src/configuration.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `REWARD_GAS_SPONSORSHIP_ENABLED` | BLOCKCHAIN_GAS_SPONSORSHIP_ENABLED legacy fallback; otomatik gaz gönderimi uygulanmamış | Opsiyonel, kapalı | apps/api/src/configuration.ts | var/var | aynı/ikisi de boş |
| `RUN_INTEGRATION` | Node integration testlerini TEST için açar; production test datası için kullanılmaz | Yalnız TEST test runner | tests/auth.integration.test.ts; tests/configuration.integration.test.ts; tests/engine.integration.test.ts; tests/integration.test.ts; tests/lifecycle.integration.test.ts; tests/telegram-mission.integration.test.ts; tests/telegram-target-validation.integration.test.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `SESSION_COOKIE_NAME` | Legacy cookie adı ayarı; cookieName APP_ENV namespace kullanır; mevcut uygulama kodunda tüketildiği bulunmadı, etkin bir güvenlik kontrolü sayılmaz | Template/legacy, kullanılmıyor | .env.example / runtime ENV; doğrudan tüketim bulunmadı | var/var | farklı |
| `TELEGRAM_ACCESS_TOKEN` | TELEGRAM — API/OAuth access token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `TELEGRAM_API_KEY` | TELEGRAM — Provider API key secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `TELEGRAM_API_SECRET` | TELEGRAM — Provider API secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `TELEGRAM_BEARER_TOKEN` | TELEGRAM — Bearer token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `TELEGRAM_BOT_TOKEN` | TELEGRAM — Bot API token secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues); apps/api/src/official-accounts.ts; apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `TELEGRAM_BOT_USERNAME` | TELEGRAM — Bot public username metadata | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TELEGRAM_CALLBACK_URL` | TELEGRAM — Kanonik OAuth callback URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `TELEGRAM_CHANNEL_ID` | TELEGRAM — Kanal ID metadata string | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TELEGRAM_CHANNEL_URL` | TELEGRAM — Kanal public URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TELEGRAM_CHANNEL_USERNAME` | TELEGRAM — Kanal username metadata | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TELEGRAM_CLIENT_ID` | TELEGRAM — OAuth client id alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `TELEGRAM_CLIENT_SECRET` | TELEGRAM — OAuth client secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `TELEGRAM_DEFAULT_TARGET_URL` | TELEGRAM — Varsayılan görev hedef URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TELEGRAM_ENABLED` | TELEGRAM — Resmî/provider enabled flagı | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `TELEGRAM_GROUP_ID` | TELEGRAM — Telegram grup ID metadata string | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TELEGRAM_GROUP_URL` | TELEGRAM — Telegram grup public URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TELEGRAM_GROUP_USERNAME` | TELEGRAM — Telegram grup username metadata | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TELEGRAM_OAUTH_ENABLED` | TELEGRAM — OAuth enable fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `TELEGRAM_PAGE_ACCESS_TOKEN` | TELEGRAM — Facebook page token / dynamic field secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `TELEGRAM_REDIRECT_URI` | TELEGRAM — OAuth callback legacy alias | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `TELEGRAM_REFRESH_TOKEN` | TELEGRAM — Refresh token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `TELEGRAM_WEBHOOK_SECRET` | TELEGRAM — Saklanabilen secret metadata; aktif webhook controller yok | Opsiyonel/provider özelliğine bağlı | .env.example / runtime ENV; doğrudan tüketim bulunmadı | boş/yok/boş/yok | farklı |
| `TIKTOK_ACCESS_TOKEN` | TIKTOK — API/OAuth access token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues); apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TIKTOK_API_KEY` | TIKTOK — Provider API key secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `TIKTOK_API_SECRET` | TIKTOK — Provider API secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `TIKTOK_BEARER_TOKEN` | TIKTOK — Bearer token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `TIKTOK_BOT_TOKEN` | TIKTOK — Bot API token secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `TIKTOK_CALLBACK_URL` | TIKTOK — Kanonik OAuth callback URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `TIKTOK_CLIENT_ID` | TIKTOK — OAuth client id alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `TIKTOK_CLIENT_KEY` | TIKTOK — TikTok OAuth client key alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TIKTOK_CLIENT_SECRET` | TIKTOK — OAuth client secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `TIKTOK_DEFAULT_TARGET_URL` | TIKTOK — Varsayılan görev hedef URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TIKTOK_ENABLED` | TIKTOK — Resmî/provider enabled flagı | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `TIKTOK_OAUTH_ENABLED` | TIKTOK — OAuth enable fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `TIKTOK_PAGE_ACCESS_TOKEN` | TIKTOK — Facebook page token / dynamic field secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `TIKTOK_PROFILE_URL` | TIKTOK — Public resmî profil URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TIKTOK_REDIRECT_URI` | TIKTOK — OAuth callback legacy alias | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `TIKTOK_REFRESH_TOKEN` | TIKTOK — Refresh token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `TIKTOK_USERNAME` | TIKTOK — Resmî kullanıcı adı metadata | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `TIKTOK_USER_ID` | TIKTOK — Resmî user/account ID metadata string | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `WALLETCONNECT_PROJECT_ID` | WalletConnect kanonik project id; legacy aliasdan önce gelir | WalletConnect etkinse | apps/api/src/configuration.ts; tests/portable-security.test.ts | boş/yok/var | farklı |
| `X_ACCESS_TOKEN` | X — API/OAuth access token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `X_API_KEY` | X — Provider API key secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `X_API_SECRET` | X — Provider API secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `X_BEARER_TOKEN` | X — Bearer token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues); apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `X_BOT_TOKEN` | X — Bot API token secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `X_CALLBACK_URL` | X — Kanonik OAuth callback URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `X_CLIENT_ID` | X — OAuth client id alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `X_CLIENT_SECRET` | X — OAuth client secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `X_DEFAULT_POST_URL` | X — X hedef legacy URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `X_DEFAULT_TARGET_URL` | X — Varsayılan görev hedef URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `X_ENABLED` | X — Resmî/provider enabled flagı | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `X_OAUTH_ENABLED` | X — OAuth enable fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `X_PAGE_ACCESS_TOKEN` | X — Facebook page token / dynamic field secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `X_PROFILE_URL` | X — Public resmî profil URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `X_REDIRECT_URI` | X — OAuth callback legacy alias | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `X_REFRESH_TOKEN` | X — Refresh token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `X_USERNAME` | X — Resmî kullanıcı adı metadata | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `X_USER_ID` | X — Resmî user/account ID metadata string | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `YOUTUBE_ACCESS_TOKEN` | YOUTUBE — API/OAuth access token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |
| `YOUTUBE_API_KEY` | YOUTUBE — Provider API key secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues); apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `YOUTUBE_API_SECRET` | YOUTUBE — Provider API secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `YOUTUBE_BEARER_TOKEN` | YOUTUBE — Bearer token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `YOUTUBE_BOT_TOKEN` | YOUTUBE — Bot API token secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `YOUTUBE_CALLBACK_URL` | YOUTUBE — Kanonik OAuth callback URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `YOUTUBE_CHANNEL_ID` | YOUTUBE — Kanal ID metadata string | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `YOUTUBE_CHANNEL_NAME` | YOUTUBE — Kanal görünen adı metadata | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `YOUTUBE_CHANNEL_URL` | YOUTUBE — Kanal public URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `YOUTUBE_CLIENT_ID` | YOUTUBE — OAuth client id alias | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `YOUTUBE_CLIENT_SECRET` | YOUTUBE — OAuth client secret | İlgili özellik etkinse; encrypted DB override olabilir | apps/api/src/social-config.ts | boş/yok/boş/yok | aynı/ikisi de boş |
| `YOUTUBE_DEFAULT_TARGET_URL` | YOUTUBE — Varsayılan görev hedef URL | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | boş/yok/boş/yok | farklı |
| `YOUTUBE_ENABLED` | YOUTUBE — Resmî/provider enabled flagı | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/boş/yok | farklı |
| `YOUTUBE_OAUTH_ENABLED` | YOUTUBE — OAuth enable fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `YOUTUBE_PAGE_ACCESS_TOKEN` | YOUTUBE — Facebook page token / dynamic field secret | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | aynı/ikisi de boş |
| `YOUTUBE_REDIRECT_URI` | YOUTUBE — OAuth callback legacy alias | Opsiyonel/provider özelliğine bağlı | apps/api/src/social-config.ts | var/var | farklı |
| `YOUTUBE_REFRESH_TOKEN` | YOUTUBE — Refresh token secret fallback | Opsiyonel/provider özelliğine bağlı | apps/api/src/integration-settings.ts (dynamic secretValues) | boş/yok/boş/yok | farklı |

## Doğrulanmış sosyal eksikler

| Platform | OAuth hazır mı | Eksik anahtar/koşul | Encrypted configured alan adları |
|---|---|---|---|
| X | hayır | X_CLIENT_ID, X_CLIENT_SECRET | yok |
| TELEGRAM | evet | yok | botToken, clientId, clientSecret |
| FACEBOOK | hayır | FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, META_GRAPH_VERSION | yok |
| INSTAGRAM | hayır | INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, META_GRAPH_VERSION | yok |
| YOUTUBE | hayır | YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET | yok |
| TIKTOK | hayır | TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET | yok |
| DISCORD | hayır | DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET | yok |
| GITHUB | hayır | GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET | yok |

Telegram encrypted botToken/clientId/clientSecret hazır; gerçek değerleri açıklanmaz. Diğer altı platformdaki credential eksikleri API çağrısı veya gerçek OAuth consent başarısı varsayılarak giderilmiş sayılmaz. Claim vault/signer/hash boş ve transfer izni kapalıdır; private key üretmeyin/istemeyin/yazmayın.

ENV değişikliği ayrıcalıklı servis restart gerektirir; DB konfigürasyon değişimleri request sırasında çözülür. Bu işte hiçbir production ENV/DB config değişikliği, reload veya restart yapılmaz.
