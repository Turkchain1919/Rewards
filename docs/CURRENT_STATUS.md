# Mevcut durum, ilk Telegram görevi hazırlığı ve bekleyen onaylar

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
