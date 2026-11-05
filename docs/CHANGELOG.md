# v0.5.5

Kullanıcı merkezinde platform kartları, ayrı geçmiş/ledger/hesap sekmeleri ve üç aşamalı görev akışı. Bağlantı kaldırma onayı, hassas ödül özeti ve Telegram alternatif bağlantı açıklamaları. Backend yalnız history platform projectionı; migration/ödül/auth değişmez. Bkz USER_DASHBOARD_STRUCTURE.md.

# v0.5.4

Kullanıcıdetaylarında kayıtlıcüzdan/geçerlicit eoturumu/Telegrambağı/üyelikdurumu ayrıldı. Saltokumaüyelikkontrolü ve güvenliprojection/RBAC testleri eklendi. Backendödül/auth/şema aynı; bkz ADMIN_USER_CONNECTION_DETAILS.md.

# v0.5.3

Telegram OIDC id/sub ayrımı, legacy bağlantı için yeniden bağlama, native/Web/grup kopyalama; mobil original browser WalletConnect pairing ve signing namespace düzeltmesi; MFA sonrası7gün yönetici oturumu. Muhasebe/claims/kontrat aynı. Bkz TELEGRAM_WALLET_SESSION_FIX.md.

# v0.5.2 — Kullanıcı talebi: yalnız otomatik GIF

Duraklat/başlat kutusu ve yazısı ana sayfa/yönetici önizlemesinden kaldırıldı. HeroMedia yalnız doğrudan img gösterir; canvas veya uygulama düzeyinde hareket azaltma/duraklatma mekanizması yoktur. GIF her iki motion tercihinde kaynak döngüsüyle otomatik oynar. Önceki aşağıdaki pause/canvas açıklamaları tarihseldir. Yeni kanıtlar .runtime/hero-autoplay-v052/ altında tutulur. Backend/DB/claims değişmez.

# v0.5.2 Hero responsive düzeltmesi

Yüklenen GIF için dairesel kırpma kaldırıldı; doğal oranlı responsive görünüm, ortak admin önizlemesi ve duraklatma eklendi. Gerçek kare değişimi çoklu tarayıcı testiyle denetlenir.

# v0.5.2 aday frontend düzeltmesi

Mobil MetaMask dapp yönlendirmesi, anlık TR/EN ve reduced-motion GIF görünürlüğü. Backend/DB/kontrat değişikliği yok. Ayrıntılar: [MOBILE_WALLET_LOCALE_HERO_FIX.md](MOBILE_WALLET_LOCALE_HERO_FIX.md). Yayın sonucu runtime kanıtıyla doğrulanmalıdır.

# Sürüm ve dosya değişiklik geçmişi

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

## 0.5.0 — Multi-Social altyapısı, 2026-11-03

- Sekiz platform/65 gerçek yetenek+politika tanımı; kısıtlı ödüllü etkileşim kapısı.
- Kick/Twitch OAuth identity/refresh/revoke, minimum kullanıcı scopes, periyodik Twitch doğrulama.
- Şifreli yönetici API/scopes/webhook ayarları, çoklu resmî hedefler, dinamik taslak oluşturucu ve batch idempotency.
- Exactwei bağımsıztaskbudget, atomicglobalbudget, kalıcısocialidentityunique, UTC/IANA veexpiryworker.
- TG privatebotchallenge ve açıksetWebhook akışı; Twitch/MetaHMAC,KickRSA,replay/timeout/SSRF korumaları.
- Eklemeli15. migration; mevcutledger/bakiyeler değiştirilmez. EskiTG1/25/25görevikorunur.
- TR/ENdesktop/mobile ve API/DB/protokol testleri;16teknikdoküman güncellemesi.

Önceki doğrulanmış v0.4.5 commitleri: `589ce613` (Telegram1/25/25 veInstagramhazırlık), `3f493df` araaday, `3c85ac1` finaladminlimitvalidation. Son ikiaraadayın40/41testfarkı ve gerçekyayın ayrıntısı ADMIN_REWARD_LIMITS.md/dışhandoff'tadır. Kaynağı bulunmayan eski değişiklikler uydurulmaz. Bu sürümde tamdosyafarkı `git diff --name-status 3c85ac1 HEAD`; önceki işlev→yeni işlev ve testler SOCIAL_VERIFICATION_ENGINE/DIRECTORY_STRUCTURE tablolarında.

---

## Önceki sürüm envanteri (tarihsel)


## Yönetici ödül ve sınır yönetimi

- Onaylı GET/PATCH limits API, mevcut yönetici MFA/rol denetimi, stale edit koruması, önce/sonra audit.
- Gelecek ödül tutarı, kullanıcı kontenjanı ve görev tarihleri düzenleme/kaldırma; ortak bütçeyi ayrılmış tutarı koruyarak düzenleme.
- Manuel görevlerde bekleyen ödülleri de ayıran kontenjan; ham transaction commit çatışmaları için retry.
- Eski ledger/bakiye ve canlı Telegram görevinin ayarları korunur; migration yok.

## 2026-11-03 — Telegram 1TURK / 25kontenjan adayı

- Optional verification.maxRewards; SERIALIZABLE transactionda limit, sonödülle atomikpasifleştirme/audit, exhaustedrepublishreddi.
- TR/EN maxkullanıcıalanı/kalanödülkontenjanı; exact1TURK/25kullanıcı görevJSON'u.
- TEST quota/race/ledger/SQLCHECK ve mobilTR/EN browserregresyonları.
- Instagramcredentials sahipakışı panelrehberi; doğrulanmayan engagementödülleri kapalı.
- Yeni migration yok. Bu bölüm aday değişikliğidir; productionsonuçlarımanifest/handoff'tan okunur.

Doğrulama anı: 2026-11-02T22:34:00.042Z. Production sürümü: **0.4.5 / `cc61b966bf684ad2f602b36100c3bf1de7f4d0a7`**. Bu doküman TEST dalında hazırlanmıştır; bu çalışmada production kodu/verisi/configuration değiştirilmez. Yollar sunucu `138.226.246.138` üzerindedir. Gerçek ENV/credential değerleri açıklanmaz.

## Kanıt sınırı

Commit, tarih ve dosya durumları gerçek Git `log/show/diff` verisidir. İşlev özetleri incelenmiş source/diff ve önceki operasyon notlarıyla sınırlıdır. Git öncesi bilinmeyen değişiklik veya hangi istemcinin yanlış pozitif Chat ID girdiği uydurulmaz. Production DB'de önceki onaylı hesap düzeltmesi bir kod commit'i değildir; ayrıca kaydedilir.

## Erişilebilen sürüm/commit geçmişi

| Commit | Tarih | Root package sürümü | Gerçek commit başlığı |
|---|---|---|---|
| cc61b966bf68 | 2026-11-02T21:53:52+00:00 | 0.4.5 | test: wait for earning guide readiness without network-idle dependency |
| 3f1ea7cd4350 | 2026-11-02T21:49:45+00:00 | 0.4.5 | feat: explain wallet-first TURK earning flow in Turkish and English |
| c7e960218fe5 | 2026-11-02T21:43:54+00:00 | 0.4.5 | feat: add v0.4.5 localized missions and safe lifecycle controls |
| 7e9704d13b16 | 2026-11-01T13:24:36+00:00 | 0.4.4 | fix Telegram official account and campaign publishing |
| c7d3f8ca9bfe | 2026-11-01T12:14:19+00:00 | 0.4.3 | feat: add verifiable Telegram membership missions |
| 5097ac86ab61 | 2026-10-31T23:13:44+00:00 | 0.4.2 | test: fix GIF admin integration checks |
| b9826ad68aa6 | 2026-10-31T23:13:37+00:00 | 0.4.2 | feat: manage persistent homepage hero GIF in admin |
| 76e91024cd5d | 2026-10-31T17:41:05+00:00 | 0.4.1 | fix(seo): resolve sitemap and robots origins from deployment runtime |
| 603fe9c46ddc | 2026-10-31T17:34:22+00:00 | 0.4.0 | ci: validate Node application with its actual TypeScript toolchain |
| e94902ba9ac3 | 2026-10-31T17:34:09+00:00 | package yok / merge commit | Merge branch 'main' of github.com:Turkchain1919/Rewards into feature/phase2 |
| 0a9f76b62320 | 2026-10-31T17:34:09+00:00 | 0.4.0 | feat: add encrypted Social API administration and locked-chain configuration |
| 136cd2342b19 | 2026-10-31T18:31:00+03:00 | 0.3.0 | Add Deno workflow for linting and testing |
| 95b199ed37be | 2026-10-31T15:23:14+00:00 | 0.3.0 | feat(rewards): add real admin task workflows and transactional reward accounting |
| 29279e350ed4 | 2026-10-31T15:12:14+00:00 | 0.2.0 | feat(auth): add mandatory admin MFA, roles, sessions and signed wallet login |
| 3d378d5eee3a | 2026-10-31T14:55:00+00:00 | 0.1.1 | fix: retry graceful TLS cutovers and preserve upstream project overview |
| 067c662c8cd9 | 2026-10-31T14:54:58+00:00 | package yok / merge commit | Merge branch 'main' of github.com:Turkchain1919/Rewards into release/0.1.0 |
| 6f3e87265af4 | 2026-10-31T14:51:41+00:00 | 0.1.0 | fix: use matched PostgreSQL tools for verified release backups |
| 42891b0dcc7b | 2026-10-31T14:49:44+00:00 | 0.1.0 | fix: include schema migrations and verify application tables in health checks |
| 2e984451e060 | 2026-10-31T14:48:50+00:00 | 0.1.0 | feat: establish isolated Social Rewards foundation and release tooling |
| 344bd6d49247 | 2026-10-31T17:40:54+03:00 | package yok / merge commit | Revise README for Turkchain Social Rewards overview |
| 3afe945d835a | 2026-10-31T17:31:26+03:00 | package yok / merge commit | Initial commit |

### Production Git yerel tag kanıtı

```text
3d378d5eee3a0ee213dcc206a64359efc30f8d5f refs/tags/v0.1.0-3d378d5e
29279e350ed4a0bb56304d46ce456447ca00d163 refs/tags/v0.2.0-29279e35
95b199ed37bef3a527664d04863a07ab25435a47 refs/tags/v0.3.0-95b199ed
603fe9c46ddcdb7128d8916768ac96eb2f125816 refs/tags/v0.4.0-603fe9c4
76e91024cd5d79eefa5ee68b43d770eaa8aa8b11 refs/tags/v0.4.1-76e91024
5097ac86ab6193928231ca723ff77e92e574d5f5 refs/tags/v0.4.2-5097ac86
c7d3f8ca9bfedbef52d348aa399087e8c0a025af refs/tags/v0.4.3-c7d3f8ca
7e9704d13b162630009434f18b69586821f4cc2a refs/tags/v0.4.4-7e9704d1
cc61b966bf684ad2f602b36100c3bf1de7f4d0a7 refs/tags/v0.4.5-cc61b966
```

`v0.1.0-3d378d5e` etiketi root package sürümü0.1.1 olan committe; tag adıyla package sürümünü aynı varsaymayın. Etiket/source varlığı tek başına canlı deployment kanıtı değildir; current/manifest ayrıca doğrulanır. Önceki release raporları DEPLOYMENT_HISTORY içinde tarihsel olarak durur.

### Sürümlerin gözlenen gelişimi

0.1.x foundation izole runtime/PostgreSQL14 backup/migration/HTTPS grace;0.2.0 admin MFA+SIWE;0.3.0 gerçek görev/admin/transaction ledger;0.4.0 encrypted social/configuration/chain lock ve Node CI;0.4.1 SEO runtime origin;0.4.2 GIF yönetimi;0.4.3 resmi Bot API Telegram üyeliği+AVAILABLE once;0.4.4 hedef ID/URL ve field-error/campaign publication uyarısı;0.4.5 lifecycle/content/dates/safe archive ve wallet-first rehber. Bu özetler commit mesajı/source/operasyon raporuyla desteklenir; erişilemeyen harici tasarım/onay geçmişi eklenmez.

## v0.4.5 tamamı — 7e9704d → cc61b96

Aşağıdaki bütün22 source/doc/test yolu gerçek `git diff --name-status` sonucudur. Production kökü aynı relative yolları içerir; çalışan artifact current symlink altındadır. Tam yol sütunu TEST referansıdır.

| Tam dosya yolu | İşlem | Önceki durum | Yeni durum | Gerekçe | Bağlantılar | Test/kanıt |
|---|---|---|---|---|---|---|
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/engine.ts | Değiştirildi | Telegram/manual ödül motoru; content/date/archive/impact yaşam döngüsü yoktu | TR/EN content/date/board; safe task/campaign impact/delete/archive, attempt audit ve locks/retry | Kullanıcı açıklığı; ledger/history ve eşzamanlılık güvenliği | management,Task/Campaign/Submission/Ledger | lifecycle + Telegram/engine HTTP regressions |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts | Değiştirildi | Görev/kampanya create/edit/publish/pause; public tasks | GET me/tasks, impact, DELETE/archive ve PATCH content controller yolları | Güvenli yeni API davranışı ve RBAC/origin koruma | AuthService/Engine/AdminModules/TaskBoard | HTTP auth/MFA/delete/content/date tests |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin/lifecycle.tsx | Oluşturuldu | Yok | StatusFilter, lifecycle impact dialog, content/date form helpers | Etki onayı ve açık geri alınabilirlik/durum bilgisi | modules.tsx + impact API | TR/EN desktop/mobile lifecycle browser |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin/modules.tsx | Değiştirildi | Temel task/campaign formları ve yayın/durdur | TR/EN içerik/tarih/content-only edit; archive/delete/filter | Onaylı admin görev yönetimi | lifecycle.tsx/ManagementController | browser-lifecycle + HTTP |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard/board.tsx | Değiştirildi | Temel görev/proof/Telegram verify + ledger/history | İçerik fallback, kullanıcı durumları, adımlar/tarih/one-time/internal-credit uyarıları | Anlaşılır görev kazanım akışı | me/tasks/ledger/history + Engine | TR/EN mobile cards + ledger regressions |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard/earning-guide.tsx | Oluşturuldu | Yok | TR/EN altı adımlı wallet-first rehber ve Telegram örneği | Owner yeni kullanıcı akışı talebi | dashboard/page.tsx/i18n | browser-earning-guide |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard/page.tsx | Değiştirildi | Wallet/task/claims/official/social düzeni | EarningGuide, wallet/social anchorları ve koşullu social sırası | Rehberi kullanıcı paneline bağlama | earning-guide,Wallet,SocialAccounts | browser-earning-guide/lifecycle |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/dashboard/social.tsx | Değiştirildi | Tüm ödüllü social engagement kapalı genel metni | Yalnız görev gerektirirse bağlantı; Telegram server verify ve bağlantı tek başına ödül değildir | Telegram membership istisnasını doğru anlatma | SocialController | browser + OAuth regression |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/style.css | Değiştirildi | Mevcut tema/layout stilleri | Lifecycle dialog/fieldset ve earning-guide responsive stilleri | Mobil kullanılabilirlik | admin/lifecycle,earning-guide | 390px overflow/browser checks |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/translations.json | Değiştirildi | Mevcut arayüz sözlüğü | Yeni yaşam döngüsü/koşul/adım/rehber TR/EN anahtarları | İki dilde tamamlanmış yeni akış | T/useLanguage + UI | TR/EN browsers |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/REWARDS_V045_TEST_REPORT.md | Oluşturuldu | Yok | TEST v0.4.5 release davranış/API/test/inceleme raporu | İncelenebilir yayın adayı | docs/evidence | Test/build gate kayıtları |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/evidence/v045-browser.json | Oluşturuldu | Yok | TR/EN viewport ve archive/filter kanıtı | Tarayıcı doğrulama kaydı | browser-lifecycle | Browser assertion output |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/evidence/v045-validation.json | Oluşturuldu | Yok | Sürüm test/build/migration/safety ve source hashes | Release proof | runtime validated marker | Exact release gate |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/test-all.sh | Değiştirildi | Hero browser + temel gate | Lifecycle ve earning-guide browser release kapsamına eklendi | Manuel kanıtı standart doğrulamaya bağlama | tests/browser-* | Exact release gate |
| /var/www/rewards.turkscan.com/REWARDSTEST/package-lock.json | Değiştirildi | 0.4.4 root package lock metadata | 0.4.5 root metadata ile uyum | Reproducible dependency/sürüm tutarlılığı | npm workspaces | npm ci/build/audit |
| /var/www/rewards.turkscan.com/REWARDSTEST/package.json | Değiştirildi | Root sürüm0.4.4 | Root sürüm0.4.5 | Release sürümleme | deployment manifest | npm build/test/typecheck/lint |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/migrations/202611020001_task_content_lifecycle/migration.sql | Oluşturuldu | Yok | Additive ALTER/index ve publishedAt audit backfill | Mevcut kayıtları koruyarak genişletme | schema/engine/audit | Restore-copy migration drill + TEST/prod migration parity |
| /var/www/rewards.turkscan.com/REWARDSTEST/prisma/schema.prisma | Değiştirildi | Task content/date/publication/archive ve campaign archive alanları yok | Nullable alanlar + iki indeks | Geriye uyumlu yaşam döngüsü | engine/migration | Prisma status/diff + DB integration |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/browser-earning-guide.e2e.mts | Oluşturuldu | Yok | Rehber locale/6step/wallet-first/mobile test | Yeni rehber davranışını doğrulama | earning-guide.tsx | Playwright |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/browser-lifecycle.e2e.mts | Oluşturuldu | Yok | Dialog/content/archive/filter/visibility test | Canlı değişim öncesi TEST kanıtı | lifecycle/modules/board | Playwright |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/lifecycle.integration.test.ts | Oluşturuldu | Yok | HTTP safe lifecycle/accounting/date/MFA/concurrency kapsamı | Silme/arşiv veri koruma invariantları | Engine/Management/PostgreSQL | Node integration |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/telegram-mission.integration.test.ts | Değiştirildi | Telegram connect/membership/AVAILABLE once fixture | In-flight verify/archive, attempt history, balance retention/idempotency eklendi | Harici verify sırasında archive güvenliği | engine/telegram-verifier/ledger | Node PostgreSQL fixture tests |

## Bu çalışma — henüz production'a alınmamış TEST değişiklikleri

| Tam yol | İşlem | Önce | Sonra | Gerekçe | Bağlantılar | Doğrulama |
|---|---|---|---|---|---|---|
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts | Değiştirildi | GROUP/CHANNEL pozitif numeric ID kabul ediliyor | Sadece GROUP/CHANNEL negative string/@username kontrolü; raw default target da korunuyor | Yanlış işaretli ID tekrarını engelle; profil/kullanıcı IDleri kapsam dışı | officialInput/OfficialAccountsController/Bot API | 3unit+HTTP regression |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/admin/social-management.tsx | Değiştirildi | Chat ID örneği/özel TR-EN alan hatası yok | -1003676977941/@username ipucu; translateText ile alan hatası locale | Anlaşılır ve işareti koruyan admin save | i18n/official-accounts.ts | TR/EN1440/390 browser |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/i18n.tsx | Değiştirildi | Çeviri yalnız T React bileşeni içindeydi | Aynı semantiği export translateText ile plaintext hatalara açtı; T bunu kullanır | API hata metnini de locale çevirmek | social-management/translations | Mevcut ve yeni TR/EN browser regression |
| /var/www/rewards.turkscan.com/REWARDSTEST/apps/web/app/translations.json | Değiştirildi | Yeni hedef uyarıları yoktu | 3 yeni TR/EN mesaj; mevcut anahtarlar korundu | Alan hatası ve ipucu çevirisi | i18n/admin form | TR/EN error assertions |
| /var/www/rewards.turkscan.com/REWARDSTEST/infrastructure/scripts/test-all.sh | Değiştirildi | Hero/lifecycle/guide browser gate | Telegram validation browser dördüncü grubu eklendi | Tekrar edilebilir regression gate | tests/browser-telegram-validation | TEST remaining gates |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/telegram-target-validation.test.ts | Oluşturuldu | Yok | Negative/@username/positive/malformed/zero/scope testleri | Biçim ve geriye uyumluluk | officialInput | 3/3 unit assertions |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/telegram-target-validation.integration.test.ts | Oluşturuldu | Yok | Positive POST/PUT400 ve negative CONNECTED edit HTTP testi | Server/DB roundtrip güvenliği | Auth/OfficialAccounts/TEST PG | 1integration (35 toplam suite) |
| /var/www/rewards.turkscan.com/REWARDSTEST/tests/browser-telegram-validation.e2e.mts | Oluşturuldu | Yok | İki dil/viewport yerel GET/PUT intercept ile UI/payload testi | Eksi korunması ve anlaşılır uyarı | admin/social-management/i18n | İlk selector fail; düzeltilmiş4kombinasyon PASS |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/PROJECT_DOCUMENTATION.md | Oluşturuldu | Yok | Doğrulanmış Türkçe teknik referans/rapor | Gelecek geliştirme ve onaylı görev hazırlığı | Diğer teknik belgeler; gerçek source/service/schema/Git | Dosya/route/model/ENV/link/kapsam denetimi, secret scan |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/ARCHITECTURE.md | Değiştirildi | Foundation0.1 özeti | Doğrulanmış Türkçe teknik referans/rapor | Gelecek geliştirme ve onaylı görev hazırlığı | Diğer teknik belgeler; gerçek source/service/schema/Git | Dosya/route/model/ENV/link/kapsam denetimi, secret scan |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/DIRECTORY_STRUCTURE.md | Oluşturuldu | Yok | Doğrulanmış Türkçe teknik referans/rapor | Gelecek geliştirme ve onaylı görev hazırlığı | Diğer teknik belgeler; gerçek source/service/schema/Git | Dosya/route/model/ENV/link/kapsam denetimi, secret scan |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/DATABASE_DOCUMENTATION.md | Oluşturuldu | Yok | Doğrulanmış Türkçe teknik referans/rapor | Gelecek geliştirme ve onaylı görev hazırlığı | Diğer teknik belgeler; gerçek source/service/schema/Git | Dosya/route/model/ENV/link/kapsam denetimi, secret scan |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/ENV_CONFIGURATION.md | Oluşturuldu | Yok | Doğrulanmış Türkçe teknik referans/rapor | Gelecek geliştirme ve onaylı görev hazırlığı | Diğer teknik belgeler; gerçek source/service/schema/Git | Dosya/route/model/ENV/link/kapsam denetimi, secret scan |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/DEPLOYMENT_GUIDE.md | Oluşturuldu | Yok | Doğrulanmış Türkçe teknik referans/rapor | Gelecek geliştirme ve onaylı görev hazırlığı | Diğer teknik belgeler; gerçek source/service/schema/Git | Dosya/route/model/ENV/link/kapsam denetimi, secret scan |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/API_DOCUMENTATION.md | Oluşturuldu | Yok | Doğrulanmış Türkçe teknik referans/rapor | Gelecek geliştirme ve onaylı görev hazırlığı | Diğer teknik belgeler; gerçek source/service/schema/Git | Dosya/route/model/ENV/link/kapsam denetimi, secret scan |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/CHANGELOG.md | Oluşturuldu | Yok | Doğrulanmış Türkçe teknik referans/rapor | Gelecek geliştirme ve onaylı görev hazırlığı | Diğer teknik belgeler; gerçek source/service/schema/Git | Dosya/route/model/ENV/link/kapsam denetimi, secret scan |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/CURRENT_STATUS.md | Oluşturuldu | Yok | Doğrulanmış Türkçe teknik referans/rapor | Gelecek geliştirme ve onaylı görev hazırlığı | Diğer teknik belgeler; gerçek source/service/schema/Git | Dosya/route/model/ENV/link/kapsam denetimi, secret scan |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/CODEX_CONTEXT.md | Oluşturuldu | Yok | Doğrulanmış Türkçe teknik referans/rapor | Gelecek geliştirme ve onaylı görev hazırlığı | Diğer teknik belgeler; gerçek source/service/schema/Git | Dosya/route/model/ENV/link/kapsam denetimi, secret scan |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/WORK_COMPLETION_REPORT.md | Oluşturuldu | Yok | Doğrulanmış Türkçe teknik referans/rapor | Gelecek geliştirme ve onaylı görev hazırlığı | Diğer teknik belgeler; gerçek source/service/schema/Git | Dosya/route/model/ENV/link/kapsam denetimi, secret scan |
| /var/www/rewards.turkscan.com/REWARDSTEST/docs/evidence/telegram-validation-documentation.json | Oluşturuldu | Yok | Sanitize test/prod-readonly/doc coverage evidence | Tekrarlanabilir sonuç kanıtı | logs + private inventory | Hash/presence ve son test summary |

Bu source değişikliklerinde silinen dosya yoktur. Paket sürümü/root0.4.5, API endpoint sayısı, Prisma schema ve migration sayısı değişmedi. Production'a kod/doc dağıtımı, migration veya GitHub main push yapılmadı. Yeni10TURK görevi/campaign/ödül yok.

## Operasyonel DB değişikliği — önceki ayrı kullanıcı onayı

CHAT_NOT_FOUND teşhisi kayıtta pozitif1003676977941 bulundu; doğru -1003676977941 ve @Turkchain1919 getChat200/getChatMember administrator. Onaylı bakım yalnız mevcut OfficialSocialAccount id/status/version/lastSuccessAt/updatedAt ve iki AuditEvent yazdı. Username/URL/Task/Campaign/User/Ledger/OAuth değişmedi. Audit eylemleri OFFICIAL_ACCOUNT_CHAT_ID_REPAIR ve OFFICIAL_ACCOUNT_CONNECTED; operasyon raporu proje dış kökünde TELEGRAM_FIX_V045_REPORT.md. Bu işte aynı işlem tekrar edilmedi; kayıt artık CONNECTED'dır.

## Eski commitlerin dosya olayları — erişilebilen tam kayıt

Aşağıdaki liste Git show --name-status çıktısından türemiştir; tam yollar için TEST kökünü ekleyin. Önceki her dosyanın bütün satır içi davranışını görmeden hayali açıklama yazmak yerine gerçek dosya olayı korunur. Üstteki current/v0.4.5 tabloları işlev öncesi/sonrası açıklamalarını verir.

```text
COMMIT cc61b966bf684ad2f602b36100c3bf1de7f4d0a7
M	tests/browser-earning-guide.e2e.mts
```

```text
COMMIT 3f1ea7cd43506699c57b6b97986b875743f4e5b8
A	apps/web/app/dashboard/earning-guide.tsx
M	apps/web/app/dashboard/page.tsx
M	apps/web/app/dashboard/social.tsx
M	apps/web/app/style.css
M	apps/web/app/translations.json
M	infrastructure/scripts/test-all.sh
A	tests/browser-earning-guide.e2e.mts
```

```text
COMMIT c7e960218fe58e39117b5d3eedb9e12759b30804
M	apps/api/src/engine.ts
M	apps/api/src/management.ts
A	apps/web/app/admin/lifecycle.tsx
M	apps/web/app/admin/modules.tsx
M	apps/web/app/dashboard/board.tsx
M	apps/web/app/style.css
M	apps/web/app/translations.json
A	docs/REWARDS_V045_TEST_REPORT.md
A	docs/evidence/v045-browser.json
A	docs/evidence/v045-validation.json
M	package-lock.json
M	package.json
A	prisma/migrations/202611020001_task_content_lifecycle/migration.sql
M	prisma/schema.prisma
A	tests/browser-lifecycle.e2e.mts
A	tests/lifecycle.integration.test.ts
M	tests/telegram-mission.integration.test.ts
```

```text
COMMIT 7e9704d13b162630009434f18b69586821f4cc2a
M	apps/api/src/errors.ts
M	apps/api/src/official-accounts.ts
M	apps/api/src/security.ts
M	apps/api/src/telegram-verifier.ts
M	apps/web/app/admin/modules.tsx
M	apps/web/app/admin/social-management.tsx
M	docs/DEPLOYMENT_HISTORY.md
M	docs/IMPLEMENTATION_STATUS.md
M	docs/PRODUCTION_STATUS.md
M	package-lock.json
M	package.json
M	tests/configuration.integration.test.ts
M	tests/telegram-mission.integration.test.ts
```

```text
COMMIT c7d3f8ca9bfedbef52d348aa399087e8c0a025af
M	apps/api/src/engine.ts
M	apps/api/src/integration-settings.ts
M	apps/api/src/management.ts
M	apps/api/src/official-accounts.ts
M	apps/api/src/policy.ts
A	apps/api/src/telegram-verifier.ts
M	apps/web/app/admin/modules.tsx
M	apps/web/app/admin/social-management.tsx
M	apps/web/app/dashboard/board.tsx
M	docs/DEPLOYMENT_HISTORY.md
M	docs/IMPLEMENTATION_STATUS.md
A	docs/TELEGRAM_MEMBERSHIP_MISSIONS.md
M	package.json
M	tests/browser-hero.e2e.mts
M	tests/policy.test.ts
A	tests/telegram-mission.integration.test.ts
A	tests/telegram-verifier.test.ts
```

```text
COMMIT 5097ac86ab6193928231ca723ff77e92e574d5f5
M	tests/browser-hero.e2e.mts
M	tests/configuration.integration.test.ts
```

```text
COMMIT b9826ad68aa6362d1d8de676368a2e7172c5ac48
M	apps/api/package.json
A	apps/api/src/hero-media.ts
M	apps/api/src/main.ts
A	apps/web/app/admin/hero-visual.tsx
M	apps/web/app/admin/modules.tsx
M	apps/web/app/hero.tsx
M	apps/web/app/style.css
M	apps/web/app/translations.json
M	docs/DEPLOYMENT_HISTORY.md
A	docs/HERO_VISUAL.md
M	docs/IMPLEMENTATION_STATUS.md
M	docs/PRODUCTION_STATUS.md
M	infrastructure/nginx/rewards-test.conf
M	infrastructure/nginx/rewards.conf
M	infrastructure/scripts/test-all.sh
M	package-lock.json
M	package.json
A	prisma/migrations/202611010001_hero_visual/migration.sql
M	prisma/schema.prisma
A	tests/browser-hero.e2e.mts
M	tests/configuration.integration.test.ts
M	tests/portable-security.test.ts
```

```text
COMMIT 76e91024cd5d79eefa5ee68b43d770eaa8aa8b11
M	apps/web/app/robots.ts
M	apps/web/app/sitemap.ts
M	docs/DEPLOYMENT_HISTORY.md
M	docs/IMPLEMENTATION_STATUS.md
M	docs/PRODUCTION_STATUS.md
M	infrastructure/scripts/build-test.sh
M	package-lock.json
M	package.json
```

```text
COMMIT 603fe9c46ddcdb7128d8916768ac96eb2f125816
M	.github/workflows/deno.yml
```

```text
COMMIT 0a9f76b623209a9ff40fa71c97a93962baafbcf7
M	.env.example
M	apps/api/src/auth.ts
A	apps/api/src/claims.ts
A	apps/api/src/config-controller.ts
A	apps/api/src/configuration.ts
M	apps/api/src/engine.ts
A	apps/api/src/integration-settings.ts
M	apps/api/src/main.ts
M	apps/api/src/management.ts
A	apps/api/src/oauth-lifecycle.ts
A	apps/api/src/official-accounts.ts
M	apps/api/src/policy.ts
A	apps/api/src/providers.ts
A	apps/api/src/social-config.ts
A	apps/api/src/social.ts
M	apps/api/src/worker.ts
M	apps/web/app/admin/modules.tsx
M	apps/web/app/admin/page.tsx
A	apps/web/app/admin/settings.tsx
A	apps/web/app/admin/social-api.tsx
A	apps/web/app/admin/social-management.tsx
M	apps/web/app/dashboard/board.tsx
A	apps/web/app/dashboard/claims.tsx
A	apps/web/app/dashboard/official.tsx
M	apps/web/app/dashboard/page.tsx
A	apps/web/app/dashboard/social.tsx
A	apps/web/app/en/admin/page.tsx
A	apps/web/app/en/dashboard/page.tsx
A	apps/web/app/en/page.tsx
A	apps/web/app/hero.tsx
A	apps/web/app/i18n.tsx
A	apps/web/app/icon.svg
M	apps/web/app/layout.tsx
M	apps/web/app/page.tsx
A	apps/web/app/robots.ts
A	apps/web/app/runtime.tsx
A	apps/web/app/server-config.ts
A	apps/web/app/sitemap.ts
M	apps/web/app/style.css
A	apps/web/app/tr/admin/page.tsx
A	apps/web/app/tr/dashboard/page.tsx
A	apps/web/app/tr/page.tsx
A	apps/web/app/translations.json
M	apps/web/app/wallet.tsx
A	apps/web/proxy.ts
M	docs/DEPLOYMENT_HISTORY.md
M	docs/IMPLEMENTATION_STATUS.md
A	docs/PORTABLE_CONFIGURATION.md
M	docs/PRODUCTION_STATUS.md
A	docs/SOCIAL_API_CONFIGURATION.md
A	infrastructure/nginx/rewards-test.conf
M	infrastructure/nginx/rewards.conf
M	infrastructure/scripts/common.sh
M	infrastructure/scripts/deploy-production.py
M	infrastructure/scripts/provision.py
M	package-lock.json
M	package.json
A	packages/contracts/src/NativeRewardVault.sol
M	packages/contracts/src/NativeTURKClaims.sol
A	prisma/migrations/202610310005_social/migration.sql
A	prisma/migrations/202610310006_integration_settings/migration.sql
A	prisma/migrations/202610310007_network_configuration/migration.sql
A	prisma/migrations/202610310008_official_accounts/migration.sql
A	prisma/migrations/202610310009_platform_registry/migration.sql
A	prisma/migrations/202610310010_oauth_link_generations/migration.sql
A	prisma/migrations/202610310011_claim_authorizations/migration.sql
A	prisma/migrations/202610310012_social_configuration_status/migration.sql
M	prisma/schema.prisma
A	tests/configuration.integration.test.ts
A	tests/portable-security.test.ts
```

```text
COMMIT 136cd2342b195d08d92786da48c06152ef8a2627
A	.github/workflows/deno.yml
```

```text
COMMIT 95b199ed37bef3a527664d04863a07ab25435a47
M	apps/api/src/auth.ts
A	apps/api/src/engine.ts
A	apps/api/src/errors.ts
M	apps/api/src/main.ts
A	apps/api/src/management.ts
A	apps/web/app/admin/modules.tsx
M	apps/web/app/admin/page.tsx
A	apps/web/app/dashboard/board.tsx
M	apps/web/app/dashboard/page.tsx
M	apps/web/app/style.css
M	docs/DEPLOYMENT_HISTORY.md
M	docs/IMPLEMENTATION_STATUS.md
M	docs/PRODUCTION_STATUS.md
M	package-lock.json
M	package.json
A	prisma/migrations/202610310003_engine/migration.sql
A	prisma/migrations/202610310004_constraints/migration.sql
M	prisma/schema.prisma
M	tests/auth.integration.test.ts
A	tests/engine.integration.test.ts
```

```text
COMMIT 29279e350ed4a0bb56304d46ce456447ca00d163
M	.env.example
A	apps/api/src/auth.ts
A	apps/api/src/data.ts
M	apps/api/src/main.ts
A	apps/api/src/security.ts
M	apps/web/app/admin/page.tsx
M	apps/web/app/style.css
M	apps/web/app/wallet.tsx
A	docs/ADMIN_SETUP.md
M	docs/DEPLOYMENT_HISTORY.md
M	docs/IMPLEMENTATION_STATUS.md
M	docs/PRODUCTION_STATUS.md
M	infrastructure/nginx/rewards.conf
M	infrastructure/scripts/deploy-production.py
M	infrastructure/scripts/provision.py
A	infrastructure/scripts/prune-artifacts.py
M	infrastructure/scripts/sync-github.sh
M	package-lock.json
M	package.json
A	prisma/migrations/202610310002_auth/migration.sql
M	prisma/schema.prisma
A	tests/auth.integration.test.ts
A	tests/security.test.ts
```

```text
COMMIT 3d378d5eee3a0ee213dcc206a64359efc30f8d5f
M	docs/DEPLOYMENT_HISTORY.md
M	docs/PRODUCTION_STATUS.md
M	infrastructure/scripts/deploy-production.py
M	infrastructure/scripts/sync-github.sh
M	package-lock.json
M	package.json
```

```text
COMMIT 6f3e87265af413675daf50c00275eb47b36a187b
M	infrastructure/scripts/backup-database.sh
M	infrastructure/scripts/restore-database.sh
```

```text
COMMIT 42891b0dcc7bbb05d71b397eb5d62ff300b3f13d
M	.gitignore
M	apps/api/src/main.ts
M	infrastructure/scripts/check-health.sh
A	prisma/migrations/202610310001_foundation/migration.sql
```

```text
COMMIT 2e984451e060cccec784347865cacf046d508b04
A	.env.example
A	.gitignore
A	apps/api/package.json
A	apps/api/src/main.ts
A	apps/api/src/policy.ts
A	apps/api/src/worker.ts
A	apps/api/tsconfig.json
A	apps/web/app/admin/page.tsx
A	apps/web/app/dashboard/page.tsx
A	apps/web/app/layout.tsx
A	apps/web/app/page.tsx
A	apps/web/app/style.css
A	apps/web/app/wallet.tsx
A	apps/web/next-env.d.ts
A	apps/web/next.config.ts
A	apps/web/package.json
A	apps/web/tsconfig.json
A	docs/ARCHITECTURE.md
A	docs/DEPLOYMENT_HISTORY.md
A	docs/IMPLEMENTATION_STATUS.md
A	docs/PRODUCTION_STATUS.md
A	docs/RUNBOOK.md
A	eslint.config.mjs
A	infrastructure/nginx/rewards.conf
A	infrastructure/scripts/backup-database.sh
A	infrastructure/scripts/build-test.sh
A	infrastructure/scripts/check-health.sh
A	infrastructure/scripts/check-services.sh
A	infrastructure/scripts/check-ssl.sh
A	infrastructure/scripts/common.sh
A	infrastructure/scripts/deploy-production.py
A	infrastructure/scripts/deploy-production.sh
A	infrastructure/scripts/install-services.py
A	infrastructure/scripts/progress.py
A	infrastructure/scripts/promote-to-production.sh
A	infrastructure/scripts/provision.py
A	infrastructure/scripts/restore-database.sh
A	infrastructure/scripts/rollback-production.sh
A	infrastructure/scripts/scan-secrets.py
A	infrastructure/scripts/setup-production.sh
A	infrastructure/scripts/setup-server.sh
A	infrastructure/scripts/setup-test.sh
A	infrastructure/scripts/ssh-check.sh
A	infrastructure/scripts/sync-github.sh
A	infrastructure/scripts/test-all.sh
A	infrastructure/scripts/validate-release.sh
A	package-lock.json
A	package.json
A	packages/contracts/foundry.toml
A	packages/contracts/src/NativeTURKClaims.sol
A	packages/contracts/test/NativeTURKClaims.t.sol
A	prisma.config.ts
A	prisma/migrations/migration_lock.toml
A	prisma/schema.prisma
A	tests/integration.test.ts
A	tests/policy.test.ts
```

```text
COMMIT 344bd6d49247f811150dba99204d610d597ed984
M	README.md
```

```text
COMMIT 3afe945d835af05245699997bc55483792e0a17a
A	README.md
```
