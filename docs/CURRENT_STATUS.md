# v0.5.5 sosyal alan rehberleri

[ADMIN_SOCIAL_FIELD_GUIDE.md](ADMIN_SOCIAL_FIELD_GUIDE.md): bütün mevcut sosyal credential/hesap/hedef formları için edinme adımları ve resmî kaynaklar. Backend/migration/veri değişikliği yok. Kesin yayın durumu manifest ve Git ile doğrulanır.

# v0.5.5 — Kullanıcı sosyal ödül merkezi

Önce [USER_DASHBOARD_STRUCTURE.md](USER_DASHBOARD_STRUCTURE.md) okuyun. Taban v0.5.4 b3f49f0; mevcut admin, sekiz entegrasyon ve ödül motoru korunur. Yeni sekmeler, platform kartları ve üç aşamalı görev sihirbazı; history API projectionına platform eklendi, migration yok. Telegram gerçek sağlayıcı QR ekranı test edildi; fiziksel Desktop geçişi ve gerçek kullanıcı onayı/callback henüz doğrulanmadı. Kesin kök neden kanıtlanmadan çözülmüş kabul edilmez. Yayın durumu production `.runtime/deployment.json`, current symlink ve Git ile doğrulanmalıdır. Kanıt: .runtime/user-hub-v055/. Claims kapalı.

# v0.5.2 aday frontend düzeltmesi

Mobil MetaMask dapp yönlendirmesi, anlık TR/EN ve reduced-motion GIF görünürlüğü. Backend/DB/kontrat değişikliği yok. Ayrıntılar: [MOBILE_WALLET_LOCALE_HERO_FIX.md](MOBILE_WALLET_LOCALE_HERO_FIX.md). Yayın sonucu runtime kanıtıyla doğrulanmalıdır.

# Mevcut durum, ilk Telegram görevi hazırlığı ve bekleyen onaylar

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

Tamamlanan altyapı:65görev/8platformkataloğu, Kick/Twitch OAuth protokolleri, güvenli credential/scopes paneli, çokluhedef, sahiplikURLresolver, batchdrafts, bağımsıztaskbudget/UTC/IANA/expiry, kimliktekrarödülengeli, imza/replay/proofworker, TR/ENUI. APIcredentials yokken CONNECTED uydurulmaz.

Canlı provider kanıtı: mevcut Telegram GROUP ve Bot API üyelik entegrasyonu önceki yayından korunur. Kick/Twitch ve diğer yeni dış OAuth izinleri gerçek ownercredentials/appapproval olmadan uçtanuca kanıtlanmış değildir. Mock protokol/Playwright testleri gerçek platform onayı değildir. Meta doğrudan Developer sayfaları429 döndürdü; doğrulanmış entegrasyon sayılmaz. Tekrarlanabilirödül bilerek devredışı; unsupported/providerpolicy görevleri kapalı. Yeni platformwebhook abonelikleri (Twitch/Kick/Meta) provider tarafında operatör ayarı ister; alıcı hazır olmak abonelik kurulmuş demek değildir.

Sıradaki işletim: OWNER SocialAPI'den anahtarları güvenli girer, hedefhesabı gerçekOAuth ile bağlar, gerekli izinleri ve platform politikasını kontrol eder. Ancak gerçekkanıt ve açık izin sonrası desteklenen görev yayınlanır. Bu iş otomatik yeni kampanya/görev/ödül dağıtımı yapmaz. Nihai test/yayın sonucu PRODUCTION_RELEASE_REPORT ve dış handoff kanıtında yer alır.

---

## Önceki sürüm envanteri (tarihsel)


> Güncel yönetici geliştirmesi: [ADMIN_REWARD_LIMITS.md](ADMIN_REWARD_LIMITS.md). Yayınlanmış görevlerde ödül/kontenjan/tarih ve ortak bütçe onayla değiştirilebilir; kayıtlar korunur, görev pasife alınır. Bu özellik mevcut canlı Telegram1/25/25 ayarlarını kendiliğinden değiştirmez.

> **2026-11-03 güncel çalışma:** Önceki 10 TURK taslağı yerine kullanıcı 1 TURK × ilk25 kullanıcı / toplam25TURK ve TEST sonrası productionyayınını onayladı. Güncel plan ve doğrulama koşulları [REWARD25_RELEASE_READINESS](REWARD25_RELEASE_READINESS.md), tam payload [TELEGRAM_REWARD25_TASK.json](TELEGRAM_REWARD25_TASK.json), Instagram açıklaması [INSTAGRAM_READINESS](INSTAGRAM_READINESS.md). Aşağıdaki bilgiler önceki snapshot olabilir; çalışanSHA ve gerçekyayınsonucu dış PROJECT_HANDOFF.md/deploymentmanifest esas alınarak doğrulanır.

Doğrulama anı: 2026-11-02T22:34:00.042Z. Production sürümü: **0.4.5 / `cc61b966bf684ad2f602b36100c3bf1de7f4d0a7`**. Bu doküman TEST dalında hazırlanmıştır; bu çalışmada production kodu/verisi/configuration değiştirilmez. Yollar sunucu `138.226.246.138` üzerindedir. Gerçek ENV/credential değerleri açıklanmaz.

## Çalışmanın sınırı

Production yalnız SELECT/public GET ve read-only Telegram/RPC gerektiren kontrollerle incelenir. Production'a kod dağıtımı, migration, ENV/config yazımı, servis restart, kullanıcı/kampanya/görev/ledger mutasyonu yoktur. TEST kaynaklarında doğrulama ve dokümanlar hazırlandı; çalışma dalı `feature/telegram-validation-technical-docs`. Root sürüm0.4.5; yeni değişiklikler production'daki cc61b96'ya henüz alınmadı.

Mevcut production resmî Telegram GROUP: `cmvxxbysj000isqifw90acmj0`, ID `-1003676977941`, username `Turkchain1919`, profile/defaultTargetUrl `https://t.me/Turkchain1919`, enabled=true, CONNECTED/version1. Önceki kullanıcı onaylı bakım yalnız hesap+2audit değiştirmiştir; bu çalışma kaydı değiştirmez. User1, Campaign3, Task3, Submission0, LedgerEntry0, LedgerEvent0; kişisel Telegram bağlantısı1. Hiçbir production bakiyesine yeni 10 TURK yazılmadı.

## Tamamlananlar / hazır olmayanlar

| Alan | Doğrulanmış durum |
|---|---|
| Production uygulama | v0.4.5 cc61b96; source/GitHub main önceki yayında eşleşmiş, DB14 migration. |
| Telegram grup bağlantısı | CONNECTED; correct negative ID; bot admin önceki onaylı bakımda HTTP200 ile doğrulandı. |
| Yeni Chat ID önlemi | Yalnız TEST: GROUP/CHANNEL positive/raw target reddi, negative/@username string koruma; bilingual form hint/error. |
| TEST doğrulama | 35app/10Foundry + mevcut ve yeni TR/EN mobile/desktop browser PASS; ilk selector hatası kayıtta. |
| İlk 10 TURK görevi | Hazırlık taslağı var; yeni kayıt/publish/reward yok. |
| Kontrat/transfer | Vault/signer/hash konfigürasyonu boş; claims/gas sponsor/master kapalı. |
| Diğer providerlar | X/Meta/YouTube/TikTok OAuth credentials eksik; Discord/GitHub disabled; generic engagement policy kapalı. |
| Dokümantasyon | 10 ana Türkçe teknik belge ve ayrı sonuç raporu TEST docs altında. |
| Production onayı | Yeni validation deployment ve ilk görev/campaign publication için ayrı açık onay bekleniyor. |

## Mevcut üç kampanya — gerçek production verisi

| Campaign ID / başlık | Durum | Bütçe / ayrılan / kalan TURK | Görev / ödül geçmişi | 10 TURK üyelik görevi için değerlendirme |
|---|---|---|---|---|
| cmvwm5nuz00020eifdsm40y36 / DESTESDT | PAUSED; dates=null, archived=null | 10 / 0 / 10 | 2 task; 0 reward | Tutar yeterli ama eski deneme içerikleri/X ve manual Telegram EDUCATION görevleri var; gereksiz mevcut kampanya yeniden canlandırma riski. |
| cmvxp9zij0003juifo3n3u5ed / 77767 | PAUSED; dates=null, archived=null | 5 / 0 / 5 | 1 task; 0 reward | 10 TURK ödülü karşılamaz; bütçe artırma ayrı mutation/onay gerektirir. |
| cmvxx6wdg0007sqify4ei3lih / TELEGRAM | DRAFT; dates=null, archived=null | 10 / 0 / 10 | 0 task; 0 reward | En uygun yeniden kullanım: boş/tematik/draft/geçmişsiz; yeni campaign yaratmak gerekmeyebilir. Mevcut 10 TURK bütçe sadece1 başarılı ödülü karşılar. |

## Mevcut üç görev

| Task ID / başlık | Campaign | Platform / kind / verifier | Ödül | Durum / hedef / geçmiş | Sonuç |
|---|---|---|---|---|---|
| cmvwm70ug00040eifsuhwguyc / 2222 | DESTESDT | X / SOCIAL_INTERACTION / MANUAL | 10 TURK | enabled=false, configurationRequired=true, officialAccountId=null, targetUrl=null, submissions0 | X social reward policy kapalı; ilk Telegram görevine uygun değil. |
| cmvxp9jir0001juifqpj4vy37 / 676767 | DESTESDT | TELEGRAM / EDUCATION / MANUAL | 5 TURK | disabled/configRequired, official=null,target=null,submissions0 | Telegram membership değil; mevcut kayıt dönüştürülmemeli. |
| cmvxpalwi0005juifdylsupl4 / TYRTFYTRYRTYTRY | 77767 | TELEGRAM / EDUCATION / MANUAL | 5 TURK | disabled/configRequired, official=null,target=null,submissions0 | Telegram membership değil; campaign bütçesi de10 ödül için yetersiz. |

Tüm mevcut task localizedContent/start/end/published/archive alanları null; policyReviewed=true olması tek başına publication izni vermez. canEnableTask platform/kind/verifier kombinasyonunu da kontrol eder. Hiçbir görev aktif/ödüllü Telegram görevi olarak sunulamaz; bu analiz hiçbir kaydı değiştirmez.

## Önerilen kampanya ve bütçe kararı

`TELEGRAM` / `cmvxx6wdg0007sqify4ei3lih` kampanyasını, **yalnız sonraki açık yayın onayında**, ilk yeni üyelik görevi için yeniden kullanmak uygundur. Yeni kampanya yaratmaya teknik ihtiyaç yok. 10 TURK bütçe 10 TURK ödülle **max1 kullanıcı**dır: floor((budget-allocated)/reward)=1. Daha geniş pilot için katılımcı üst sınırı ve karşılığı en az10×N TURK iç muhasebe bütçesi owner tarafından belirlenmeli; şu anda bütçe artırılmadı. Bu bütçe on-chain fon veya transfer yetkisi anlamına gelmez.

## İncelemeye hazır görev içeriği — kayıt oluşturulmadı

```json
{
  "campaignId": "cmvxx6wdg0007sqify4ei3lih",
  "title": "Turkchain Telegram Topluluğuna Katıl",
  "platform": "TELEGRAM",
  "kind": "SOCIAL_INTERACTION",
  "rewardWei": "10000000000000000000",
  "policyReviewed": true,
  "officialAccountId": "cmvxxbysj000isqifw90acmj0",
  "targetUrl": "https://t.me/Turkchain1919",
  "verification": {
    "type": "TELEGRAM_MEMBERSHIP",
    "instructions": "Resmî gruba katıl, Telegram hesabını bağla ve üyeliğini Bot API üzerinden doğrula."
  },
  "localizedContent": {
    "tr": {
      "title": "Turkchain Telegram Topluluğuna Katıl",
      "description": "Resmî Turkchain Telegram grubuna katıl, üyeliğini doğrula ve 10 TURK ödül kazan.",
      "steps": [
        "Cüzdanını bağla.",
        "Telegram hesabını bağla.",
        "Turkchain Telegram grubuna katıl.",
        "Üyeliğimi Doğrula düğmesine bas.",
        "Doğrulama başarılıysa 10 TURK iç ödül bakiyene eklenir."
      ],
      "rewardCondition": "Başarılı Telegram üyelik doğrulaması; kullanıcı başına tek ödül; tekrarlanan talep ikinci ödül üretmez. Ödül platform içi AVAILABLE bakiyedir, gerçek cüzdan transferi kapalıdır."
    },
    "en": {
      "title": "Join the Turkchain Telegram Community",
      "description": "Join the official Turkchain Telegram group, verify your membership, and earn 10 TURK.",
      "steps": [
        "Connect your wallet.",
        "Link your Telegram account.",
        "Join the Turkchain Telegram group.",
        "Press Verify My Membership.",
        "After successful verification, 10 TURK is credited to your internal reward balance."
      ],
      "rewardCondition": "Successful Telegram membership verification; one reward per user; repeated requests cannot award again. Rewards are internal AVAILABLE credits; real wallet transfers are disabled."
    }
  },
  "startsAt": null,
  "endsAt": null
}
```

Bu JSON yalnız dokümantasyon taslağıdır; otomatik seed, API POST veya planlanmış job değildir. Tarihler owner belirleyene kadar null örnek verilmiştir; yeni kayıt dahi oluşturulmadı. Başlığın eski `title` alanı TR fallback; iki locale detayları localizedContent içindedir.

## Ayrı onay sonrası gereken sıra

1. Hedef: yalnız validation deploy mu, ayrıca hangi kampanyada kaç kullanıcıya10 TURK görevi mi? Açık scope/bütçe/tarih onayı alın.
2. TEST exact code/commit/doküman+gates sonuçlarını inceleyin; production backup/rollback/health hazırlığıyla validation kaynaklarını yayınlayın. Schema değişmedi: yeni migration yok.
3. Mevcut production negatifID/CONNECTED, bot identity/admin, OAuth readiness, server policy ve claims pause tekrar salt okunur doğrulayın.
4. Onaylı yeni taskı taslak olarak oluşturun (mevcut üç taska dokunmayın). campaignId=boş TELEGRAM önerisi, connected official target,10TURK server reward, TR/EN steps/conditions, tek sefer.
5. Owner bütçeyi1ödüllük bırakacaksa sınırı açıkça kabul etsin; daha fazla kullanıcı için ayrıca bütçe kararı/uygulaması gereklidir.
6. Admin hedef taskı publish; campaign DRAFT olduğu için hâlâ kullanıcıya görünmez. Sonra yalnız onaylı campaign publish/ACTIVE yapılır. Mevcut diğer kampanya/görevler değiştirilmez.
7. Kullanıcı wallet+Telegram OAuth bağlar, gruba katılır, verify butonuna basar. İlk başarılı verify **gerçek production iç ledger kredisi yaratır**; bu adım da yayın onayı kapsamı ve ayrıca kullanıcı testi gerektirir, bu çalışmada yapılmadı.
8. Duplicate request/üyelik/bütçe/AVAILABLE geçmişi gözlenir; gerçek transfer/claims kapalı kalır. Gerektiğinde task/campaign pause; geçmiş veya ledger silinmez.

## Production'a alınması bekleyen dosyalar

`apps/api/src/official-accounts.ts`, `apps/web/app/admin/social-management.tsx`, `apps/web/app/i18n.tsx`, `apps/web/app/translations.json`; test/validation script güncellemesi ve yeni test dosyaları. Dokümanlar TEST docs altında yeni referanstır; production çalışma ağacına bu işte kopyalanmadı. Detaylı öncesi/sonrası/tam yol tablosu CHANGELOG içindedir. Endpoint veya DB model/migration değişmedi.

## Eksik/doğrulanamayanlar ve sıradaki işler

Tarihsel pozitif ID'nin ilk girdi aşamasında nasıl oluştuğu payload tutmayan AuditEvent'ten kesin çıkarılamıyor; güncel form/API negatif işareti koruyor. Yeni koruma format/doğrulama eksikliğini gideriyor. Diğer provider canlı OAuth consent/testleri, bağımsız smart-contract audit/deployed vault, production first reward, kullanıcı sayısı/bütçe/tarih kararı yapılmadı. Test Nginx max-body kaynak/live drift'i ayrı plan gerektirir. Contract ownership/funding/on-chain pause state adres olmadığı için doğrulanamaz. Bildirim/pagination/archive-restore/general-engagement modülleri henüz yok. Ek işler ayrı scope/onayla ele alınmalı.

Bir sonraki geliştirme CODEX_CONTEXT ve bu dosyadan başlamalıdır; production kaydını test amacıyla güncellemeyin. İlerleme/handoff notlarını Git+servis+DB kanıtıyla karşılaştırın.

## Hedef alanı geriye uyumluluk notu

`accountId` negatif sayı stringi veya @username ister. URL alanı `defaultTargetUrl` ayrıca eski bare username (`Turkchain1919`) girdisini t.me URL'ye normalize etmeye devam eder; salt pozitif sayısal grup/kanal hedefi burada da reddedilir. Bu ayrım eski URL-normalizasyon API davranışını korur; kullanıcı Telegram kimliği OAuth akışını değiştirmez. Negative/@username/bare-URL-field regresyonları TEST kapsamındadır.
