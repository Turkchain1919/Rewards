# CODEX_CONTEXT — yeni oturum başlangıç referansı

> Güncel yönetici geliştirmesi: [ADMIN_REWARD_LIMITS.md](ADMIN_REWARD_LIMITS.md). Yayınlanmış görevlerde ödül/kontenjan/tarih ve ortak bütçe onayla değiştirilebilir; kayıtlar korunur, görev pasife alınır. Bu özellik mevcut canlı Telegram1/25/25 ayarlarını kendiliğinden değiştirmez.

> **2026-11-03 güncel çalışma:** Önceki 10 TURK taslağı yerine kullanıcı 1 TURK × ilk25 kullanıcı / toplam25TURK ve TEST sonrası productionyayınını onayladı. Güncel plan ve doğrulama koşulları [REWARD25_RELEASE_READINESS](REWARD25_RELEASE_READINESS.md), tam payload [TELEGRAM_REWARD25_TASK.json](TELEGRAM_REWARD25_TASK.json), Instagram açıklaması [INSTAGRAM_READINESS](INSTAGRAM_READINESS.md). Aşağıdaki bilgiler önceki snapshot olabilir; çalışanSHA ve gerçekyayınsonucu dış PROJECT_HANDOFF.md/deploymentmanifest esas alınarak doğrulanır.

Doğrulama anı: 2026-11-02T22:34:00.042Z. Production sürümü: **0.4.5 / `cc61b966bf684ad2f602b36100c3bf1de7f4d0a7`**. Bu doküman TEST dalında hazırlanmıştır; bu çalışmada production kodu/verisi/configuration değiştirilmez. Yollar sunucu `138.226.246.138` üzerindedir. Gerçek ENV/credential değerleri açıklanmaz.

## Zorunlu okuma kuralı

"Her yeni geliştirme öncesinde CODEX_CONTEXT.md ve ilgili teknik dokümantasyon dosyalarını oku. Önce mevcut mimariyi incele, ardından değişiklik yap. Dokümantasyonla mevcut kod arasında farklılık varsa önce mevcut kodu esas al ve dokümantasyonu güncelle."

Bu dosya `/var/www/rewards.turkscan.com/REWARDSTEST/docs/CODEX_CONTEXT.md` konumundadır. [PROJECT_DOCUMENTATION](PROJECT_DOCUMENTATION.md) kapsamlı referans, [CURRENT_STATUS](CURRENT_STATUS.md) operasyon/görev kararı, [CHANGELOG](CHANGELOG.md) gerçek geçmiş, diğer belgeler API/DB/ENV/deployment ayrıntısıdır. Bilgi snapshot'tır; her oturum gerçek Git/runtime/DB durumuyla doğrulanır.

## Ne yapıyoruz?

Turkchain® Rewards; SIWE cüzdan kimliği, optional görev-gerektiren sosyal kimlik, policy-izinli görev doğrulaması ve exact wei iç Reward Ledger platformudur. Native TURK ödemesi ayrı claim katmanı; şu anda kapalı. FIRST_PARTY/TURKCHAIN eğitim ve TELEGRAM_MEMBERSHIP istisnası dışında sosyal engagement reward policy kapalı.

Production root sürüm **0.4.5**, SHA `cc61b966bf684ad2f602b36100c3bf1de7f4d0a7`; `.runtime/deployment.json` ve current artifact ile eşleşti. TEST bu SHA temelli `feature/telegram-validation-technical-docs` dalında yeni negatif hedef validation/dokümantasyon içerir; henüz production'da değildir. Root package version0.4.5 ve workspace0.1.0 ayrımını unutma. Production GitHub main eski yayın SHA'sında kalmalı; bu çalışmada push/deploy yok.

## Sunucu / ortamlar

- SSH uygulama sunucusu: root@138.226.246.138. Anahtar yalnız kullanıcı yetkilendirdiği güvenli SSH aracıyla; anahtar içeriğini/kopyasını/ENV secretlarını belgelere yazma.
- TEST `/var/www/rewards.turkscan.com/REWARDSTEST`; DB rewards_test PostgreSQL14/5432, Redis18390/DB0, web18190/API18290, Nginx loopback18480. Browser origin tam `http://127.0.0.1:18480`; localhost farklı origin olabilir.
- PRODUCTION `/var/www/rewards.turkscan.com/rewards`; runtime `/var/www/rewards.turkscan.com/rewards/current` → `.releases/<SHA>`, previous rollback; DB rewards_production PostgreSQL14/5432, ayrı Redis18391/DB0, web18191/API18291; domain https://rewards.turkscan.com, Nginx80/443 ve Let’s Encrypt.
- 8 systemd unit: rewards-test-{api,web,worker,redis}, rewards-prod-{api,web,worker,redis}. OS users rewards-test/rewards-prod. PostgreSQL16/5433 aynı hostta var ama Rewards değil. Docker kurulu; Rewards container/compose bulunmadı; başka projelere dokunma.
- ENVler ortam kökündeki .env; gerçek değerleri rapora çıkarma. Uygulama DB config/credential override kullanır; ENV doluluk tek başına provider readiness kanıtı değildir.
- Handoff `/var/www/rewards.turkscan.com/PROJECT_HANDOFF.md`; companion TurkScan host138.226.240.16 `/root/frontend/CODEX_PROGRESS.md` ve `/root/frontend/AGENTS.md` Rewards kaynak kodu değildir. Kullanıcının restart kuralı gereği önce oradaki kaydı SSH ile oku, Git/son dosya/servis/test-build kanıtlarıyla karşılaştır.
- Mutasyon için `/root/frontend/.codex/session.lock` flock; ilerleme her önemli işlem sonrası/en geç5dk fsync+replace ile atomik, secretsız. Çakışan aktif lock varsa yazma. Production gereksiz restart yapma.

## Nerede hangi kod?

- `apps/web/app/layout.tsx`, `proxy.ts`, `server-config.ts`, `runtime.tsx`: SSR runtime config/branding, TR/EN locale/header, public config/wallet context.
- `app/page.tsx`, `hero.tsx`: homepage ve DB GIF; admin `hero-visual.tsx` OWNER+step-up.
- `wallet.tsx`: MetaMask/WalletConnect, SIWE challenge/signature/session, profil.
- `dashboard/earning-guide.tsx`, `board.tsx`, `social.tsx`, `claims.tsx`, `official.tsx`: rehber/task/status/ledger/history/OAuth/native-claim/public links.
- `admin/page.tsx` login/MFA/session; `admin/modules.tsx` tabs; `admin/lifecycle.tsx` impact/filter/date/content; `admin/social-management.tsx` resmi hedefler; `social-api.tsx`, `settings.tsx` configuration/secrets.
- `i18n.tsx`, `translations.json`: T/useLanguage/translateText ve TR/EN sözlük. Task localizedContent ayrı admin authored data.
- `apps/api/src/main.ts`: Nest AppModule/public endpoints/loopback+Helmet/no-store. Flat dosyalarda service/controller birlikte; ayrı controllers/services klasörü yok.
- `auth.ts`, `security.ts`, `errors.ts`: SIWE/MFA/RBAC/session, AES-GCM/scrypt/cookie/origin, sanitized error.
- `engine.ts`, `management.ts`, `policy.ts`: kampanya/görev/content/date/archive/delete/impact, verification/budget/ledger; default-deny social policy.
- `official-accounts.ts`, `telegram-verifier.ts`: resmi metadata/Bot API bağlantısı, negatif Chat ID validation (yeni TEST), getMe/getChat/getChatMember.
- `providers.ts`, `social.ts`, `oauth-lifecycle.ts`, `integration-settings.ts`, `social-config.ts`: OAuth scopes/PKCE/OIDC/state/binder/generation, encrypted token/config override/refresh/revoke.
- `configuration.ts`, `config-controller.ts`, `data.ts`: single-chain config/SecretStore/RPC guard, OWNER routes, PrismaPg/Redis/health.
- `worker.ts`: sadece BullMQ maintenance heartbeat15sn; Redis heartbeatTTL45. Otomatik payout/claim/Telegram verification queue yok.
- `prisma/schema.prisma`19 model, `prisma/migrations`14 applied migration. Yeni validator migration gerektirmez.
- `packages/contracts/src/NativeRewardVault.sol` + legacy `NativeTURKClaims.sol`, `test/NativeTURKClaims.t.sol`; backend ABI claims.ts inline, Foundry out generated.

## DB ve muhasebe kısa özeti

User/AuthSession/Admin; Campaign→Task→Submission→LedgerEntry→LedgerEvent; SocialAccount/Credential/OfficialSocialAccount/SocialLinkState; BlockchainNetwork/ConfigDocument/IntegrationSetting/SocialPlatform; ClaimAuthorization; HeroVisual; AuditEvent. Ayrı Balance/Notification/Verification tablosu yok. Tutar Decimal(78,0)/BigInt integerwei;10TURK=10000000000000000000. Submission(userId,taskId) ve ledger idempotency/submission unique tek ödülü korur. Ledger auto-delete veya kontrolsüz cascade ekleme.

Manual proof PENDING→admin/reviewer approve AVAILABLE; Telegram membership başarılıysa doğrudan APPROVED+AVAILABLE. Budget allocation aynı serializable transaction içinde; Campaign→Task lock sırası ve adapter serialization retry. Dış getChatMember çağrısı sonrası lock altında archive/date/config/budget yeniden kontrol edilir. Arşivli görevler yeni listeden kalkar, geçmiş/bakiye korunur. Safe delete geçmiş yoksa; geçmiş/verification audit varsa archive. Campaign çocukları/ödülü varsa archive. Archive restore UI yok.

## Telegram ve sosyal durum

Production GROUP `cmvxxbysj000isqifw90acmj0`, -1003676977941, @Turkchain1919, https://t.me/Turkchain1919, CONNECTED/version1. Bot @turkchainaibot administrator doğrulandı. Önceki yanlış pozitif ID1003676977941 ayrı kullanıcı onayıyla account-only transaction+2audit ile düzeltildi; görev/kampanya/ledger/OAuth değişmedi. Normal connect/disconnect task configurationRequired/enabled da yazabilir; scope sınırlı bakımda dikkat.

Telegram kullanıcı login OIDC issuer/audience/JWKS/nonce/PKCE; user ID pozitif olabilir ve target ID negatif kuralı ona uygulanmaz. Resmî Bot API token encrypted Credential/ENV fallback; kullanıcı OAuth tokenı ile aynı şey değildir. Credential ciphertext/secret değerlerini dökme. X/Meta/YouTube/TikTok credentials eksik; Discord/GitHub disabled, adaptör kodları var ama canlı consent doğrulanmadı. Genel engagement reward verifier yok.

## Blockchain güvenliği

Chain1919/0x77f, native TURK18, RPC https://rpc.turkscan.com, WSS wss://evm-ws.turkscan.com. Current vault/signer/bytecode hash boş; deployed/funded kontrat kanıtı yok. MASTER_PAYOUTS_AUTHORIZED=false, REWARD_CLAIMS_PAUSED=true, runtime/network pause, gas sponsor false. Bunları değiştirme. Claim source gelecekte EIP712/domain/nonce/deadline, RESERVED ve confirmed canonical receipt/event kontrolü uygular; mevcut worker para göndermez.

## Son çalışma ve kanıt

Yeni TEST validator: GROUP/CHANNEL dolu target negatif1..24digit string veya @username; pozitif numeric/accountId/raw defaultTarget reddi; boş metadata draft geriye uyumlu. Text hint -1003676977941 ve localize TR/EN alan hatası eklendi; kişisel/provider IDs/OAuth scope aynı. Negative→positive dönüşümü güncel form/API'de üretilmedi; eksiklik pozitif GROUP ID kabulüydü.

35/35 app tests,10/10Foundry, typecheck/lint/build, hero/lifecycle/guide ve yeni validation TR/EN desktop/mobile, audit0/schema diff none/TEST health PASS. İlk yeni browser selector Next announcer ile çatıştı; daraltılmış selector sonrası PASS, eski failed log tutulur. Gerçek MetaMask/live sosyal consent veya production ödül testi yapılmadı. Tam kanıt paths WORK_COMPLETION_REPORT içinde.

## İlk görev hazırlığı ve sonraki adım

Mevcut3kampanya/3task READ ONLY incelendi. En uygun boş DRAFT `TELEGRAM` campaign cmvxx6wdg0007sqify4ei3lih; budget10/allocated0 TURK, yalnız1adet10TURK ödülü karşılar. Diğer iki PAUSED kampanya eskiX/manual Telegram EDUCATION görevleri içerir; birinin bütçesi5TURK. Yeni kampanya gerekmeden mevcut boşcampaign kullanılabilir **ama bu çalışmada hiçbiri değiştirilmedi ve yeni task yaratılmadı**.

CURRENT_STATUS JSON taslağı review-only: SOCIAL_INTERACTION/TELEGRAM_MEMBERSHIP, connected officialID,10TURK,TR/EN başlık/açıklama/5adım/tek ödül/internal AVAILABLE. Production deployment + task creation/publication + campaign activation + kaç kullanıcı/bütçe/tarih için ayrı explicit owner onayı beklenir. Önce exact TEST candidate/gates/docs incele, sonra onaylı productionbackup/rollback/deploy; daha sonra onaylı task publish ve campaignACTIVE. Varsayılan olarak otomatik hiçbir aşamaya geçme. Gerçek TURK transferi/claim kontratı açma kesinlikle bu kapsamda değil.

Ek doğrulanan fark: TEST networkKey=turkchain, production networkKey=network-1919; ikisi de chain1919/TURK18 mainnet. TEST ortamını testnet sanarak cüzdan işlemi gönderme. Certbot timer active/enabled; public sertifika2027-01-29'a kadar geçerli gözlendi, renewal zorlanmadı.

## Hedef alanı geriye uyumluluk notu

`accountId` negatif sayı stringi veya @username ister. URL alanı `defaultTargetUrl` ayrıca eski bare username (`Turkchain1919`) girdisini t.me URL'ye normalize etmeye devam eder; salt pozitif sayısal grup/kanal hedefi burada da reddedilir. Bu ayrım eski URL-normalizasyon API davranışını korur; kullanıcı Telegram kimliği OAuth akışını değiştirmez. Negative/@username/bare-URL-field regresyonları TEST kapsamındadır.
