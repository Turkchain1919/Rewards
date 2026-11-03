# Sosyal doğrulama ve ödül motoru

## Canlı envanter düzeltmesi — 3 Kasım 2026, yayın sonrası doğrulama

11:28UTC envanterindeki3 kampanya/4 görev, yayından **önce**,12:29:00–12:29:18UTC (Türkiye15:29) arasında OWNER oturumundan silinmiştir. Audit kayıtlarında TASK_DELETE/CAMPAIGN_DELETE ve öncesinde OWNER MFA login vardır. Güncel yayın öncesi13:03UTC yedeğinde ve migration sonrasında **0 kampanya/0 görev** bulunur; eski sütun/row hashleri eşleşir. Silmeler bu deployment veya migration tarafından yapılmamıştır. İşlemi yapan gerçek kişi yalnız audit actoründen çıkarılamaz. Mevcut kullanıcı, ledger ve CONNECTED Telegram hesabı korunur. Yeni görev/kampanya oluşturulmamış, silinmiş kayıtlar geri yüklenmemiştir.

Aşağıdaki1TURK/25 kullanıcı/25TURK görevi referansları artık **tarihsel görev tanımıdır**, aktif canlı görev değildir. Görev motoru regression fixture'ları bu yapıyı test eder; güncel canlı panel doğru şekilde “Henüz yayınlanmış görev yok” gösterir. Yeni ödüllü görevin yayınlanması ayrı açık operatör işlemi gerektirir. Canlı kontrolün ilk denemesinde eski görevID'si bekleyen rapor scripti başarısız olmuştur; bu uygulama hatası değil, eski envanter varsayımıdır ve gizlenmeden raporlanır.


## Sınırlar ve işlem sırası

1. Auth/Origin/rate/RBAC/MFA kontrolleri controller katmanındadır.
2. Görev kodu/platform/verifier eşleşmesi Zod ile doğrulanır; immutable policy closed ise provider çağrısı ve ödül reddedilir. Katalog aktiflik bayrağı yönetici tarafından policy bypass için değiştirilemez.
3. Görev yayını öncesi sabit resmî API hostundan hedef sahipliği doğrulanır. Kullanıcı URL'sine doğrudan fetch/redirect yoktur. Post ID / author ID resmî bağlı hesapla eşleşir; Instagram metadata adayları en çok3sayfa ile sınırlıdır.
4. Telegram getChatMember veya özel privatebotchallenge gerçek kanıtı alınır. İstek süresince değişmiş reward/officialversion/account identity tekrar kontrol edilir. API başarısızsa ödül yoktur.
5. Engine serializable transactionda Campaign→Task sırasıyla kilit alır. Güncel yayın/tarih/arşiv/policy/bağlantı/kimlik, quota ve bütçe tekrar kontrol edilir. Decimal78 integerwei üzerinde BigInt/Decimal kullanılır; bakiye float ile hesaplanmaz.
6. Kullanıcı+görev unique submission, task/provider/accountHash unique identity, ledger idempotency birlikte tek krediyi sağlar. Farklı cüzdana unlink/relink kimlik rezervasyonunu silmez. Challenge bir kez tüketilir.
7. Campaign.allocatedWei ve sonlu Task.allocatedWei artışı + Submission + LedgerEntry AVAILABLE + LedgerEvent + Audit aynı transactiondadır. DB CHECK görev bütçesinin aşılmasını engeller; global kampanya guardı da uygulanır. Manuel pending kredisi bütçeyi ayırır; rejection her iki rezervasyonu çözer, önceki kazanılmış miktar değişmez.
8. Sonkontenjan/bütçe kapatılır; backend süresi geçen göreve workerı beklemeden ödül vermez.15s worker UTCexpires/remainingbudget ile ek pasifleştirme yapar. Audit yazılır.

## Kanıt ve replay

Telegram secret / TwitchHMAC / KickRSA / MetaHMAC ham byte üzerinde doğrulanır; imza dışı webhook receipt üretilmez. EventID+platform unique ve bodyHash aynı ID/farklıbody saldırısını reddeder. ID advisorylock aynı anda duplicate alımını güvenli yapar. Telegram private challenge tokenının yalnız hash'i saklanır;10dksonra kullanılamaz, signedactor+officialversion bağı gerekir. Webhook doğrudan ledger oluşturmaz.7günlüksaklama sonunda geçici challenge/receipt temizlenebilir, rewardidentity/ledger/audit silinmez.

## Adapter sözleşmesi

`social-adapters.ts`: connectAccount/disconnectAccount/refreshCredentials/validateTarget/getSupportedTasks/verifyTask/processWebhook/checkPermissions. Gerçek provider verifierı olmayan görev verifyTask içinde fail-closed olur. Meta kaynak erişimi/izin ve Kick/Twitch incentivization belirsizliği ödül başarısına çevrilmez. Twitch credentials ayrı queue ile55dkTTL doğrulanır; geçici hata5dkretry,401versionkontrollüreauth. VarolanOAuthlifecycle iletokengüvenliği korunur.

## Değişiklik haritası / doğrulama

| Dosya grubu | Önceki → yeni işlev | Gerekçe | Kanıt |
|---|---|---|---|
| engine.ts/policy.ts | EskiTG/manual → katalogeşleşmesi, görevbütçesi, kalıcı sosyalidentity ve botproof | Atomiclimit/abuse/policy | social-engine.integration, telegram-quota, telegram-mission |
| providers/social-config/oauth-lifecycle/integration-settings | 6legacyplatform → Kick/Twitch + minimumuser/officialextras + storedmetadata | Güvenlicredential/izin | social-foundation, social-api.integration |
| social-*.ts/kick-public-key.ts (yeni) | Yok → katalog/adapter/URL/http/signature/proof/tokenmaintenance |8platform altyapı ve fail-closed | protocolfixtures ve gerçekTESTHTTP/DB |
| prisma/schema.prisma + migration (yeni) |19model →22, Task/IntegrationSetting ekalanlar |DBbütçe/identity/proof |migratediff ve restore/migrationdrill |
| admin builder/social-api/social-management/reward-limits | Sabit görev → dinamiktaslak ve bağımsızbütçe/scopes/webhook | Operatöryönetimi |TR/EN1440/390 Playwright fixture |
| dashboard board/social/bot-task | Legacyüyelik →8hesapkartı ve yeni states/privateproof | Kullanıcırehberi |browser regression/APItests; livecredentials eksik |
| worker.ts |heartbeat →maintenance+ayrıcredentialqueue | expiry/hourlyTwitchvalidate |TESTworkerhealth/tokenunit |
| translations/timezones/icons/styles |YeniTR/EN, IANA/DST,8SVG,mobilewrap | ErişilebilirUI |type/lint/browser/DSTunit |

Tam dosya listesi releasebase`3c85ac1` ile `git diff --name-status` çıktısıdır; testkanıtları TEST`.runtime/multi-social` altındadır. Fixturetestleri gerçek sağlayıcı credentials veya appreview kanıtı değildir. Bilinen eksikler: gerçekyeniOAuth/webhook izin testleri ownercredentials bekliyor; unsupportedview/share/raidperuserproof yok; repeatability yok;8platformda otomatik ödülverifierı varmış gibi raporlanmaz.
