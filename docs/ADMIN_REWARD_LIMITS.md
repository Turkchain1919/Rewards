# Yönetici: ödül, kontenjan, bütçe ve tarih yönetimi

Görevler ekranında her kayıt için **Ödül ve sınırlar** düğmesi bulunur. OWNER ve ADMIN, mevcut MFA/oturum ve Origin kontrolleriyle kişi başı ödülü, kullanıcı kontenjanını, ortak kampanya bütçesini ve görevin UTC başlangıç/bitiş tarihlerini değiştirebilir. Kampanya tarihleri Kampanyalar → Düzenle üzerinden ayrıca yönetilir; hem kampanya hem görev tarihleri uygulanır.

**Kontenjan sınırını kaldır** ve **Tarih sınırlarını kaldır** düğmeleri ilgili alanları temizler. Boş kontenjan null olarak kaydedilir; verification JSON'dan maxRewards kaldırılır. Tarihler null olur. Kampanya bütçesi zorunlu ve sonludur. Tek seferlik ödül koruması, ledger ve denetim kayıtları kaldırılamaz. Görev/kampanya silme ayrı etki onayıyla yapılır; geçmiş varsa arşivleme uygulanır.

Kaydetmeden önce görev adı, mevcut taahhüt edilmiş ödül sayısı, ortak kampanya ve ayrılmış tutar gösterilir; onay kutusu zorunludur. Kaydetme görevi pasife alır. Yönetici TR/EN içerikteki eski tutar/kontenjan açıklamalarını kontrol ederek yeniden yayınlar. Eski kazanımlar ve bekleyen ledger tutarları değiştirilmez; yeni ödül tutarı yalnız sonraki başvurulara uygulanır. Eski kazananın tekrar isteği ilk ödülü döndürür. Telegram doğrulaması sürerken ödül değişip görev yeniden açılırsa eski doğrulama reddedilir; kullanıcı güncel tutarı görerek yeniden deneyebilir.

## Sunucu kontrolleri

- `GET /api/admin/tasks/:id/limits`: mevcut kurallar, usedRewards, allocatedWei, ortak kampanya görev sayısı ve expectedRulesHash.
- `PATCH /api/admin/tasks/:id/limits`: `{confirmId,expectedRulesHash,rewardWei,campaignBudgetWei,maxRewards,startsAt,endsAt}`. Miktarlar integer wei string; maxRewards pozitif integer1..1000000 veya null; tarih ISO UTC veya null.
- Yeni endpointler mevcut OWNER/ADMIN + MFA zorunluluğunu kullanır; REVIEWER ve kullanıcı yönetemez. CSRF Origin kontrolü korunur.
- Campaign → Task satır kilitleri ve SERIALIZABLE transaction. Bütçe ayrılmış toplamın, kontenjan taahhüt edilmiş ödül sayısının altına indirilemez. Kişi başı ödül pozitif olmalı ve kampanya bütçesini aşmamalı. Stale pencere expectedRulesHash ile HTTP409 alır.
- TASK_LIMITS_EDIT ve TASK_LIMITS_DETAIL önce/sonra audit kayıtları; ortak bütçe değişirse ayrıca CAMPAIGN_EDIT. Kayıtlar secret içermez.
- maxRewards artık hem TELEGRAM_MEMBERSHIP hem MANUAL için desteklenir. Manuel başvuruda PENDING ledger da bir slot ayırır; 25 bekleyen başvurudan sonra 26'ncıya yer verilmez. REJECTED ödül slot ayırmaz. Son slot aynı transaction içinde görevi kapatır. Manuel ret sonrası otomatik yeniden açma yoktur; yönetici uygun kontenjan varsa yayınlayabilir.
- PostgreSQL budget CHECK, conditional allocation, unique submission/ledger ve kullanıcı başına tek ödül korumaları sürer. Driver adapter'ın commit sırasında ürettiği ham40001/40P01 çatışmaları da bounded retry kapsamındadır; tükenirse HTTP409, alakasız hatalar gizlenmez.
- Arşivlenmiş görevde kural değişmez. Kontenjanı dolmuş veya bitiş tarihi geçmiş görev yeniden yayınlanamaz. Desteklenmeyen Instagram/X vb. etkileşim görevleri bu ekranla etkinleştirilemez; policy kapalı kalır.

## Veri ve yayın kapsamı

Yeni tablo, kolon veya migration yok. Yönetim özelliğinin deployment'ı mevcut canlı1TURK/25kullanıcı/25TURK Telegram ayarlarını değiştirmez; tarihleri boş bırakır. Yeni görev/kampanya/ödül oluşturulmaz. REWARD_CLAIMS_PAUSED=true ve gerçek transferler kapalı kalır. Gerçek çalışan SHA ve son test/health sonucu dış PROJECT_HANDOFF.md ve deployment manifest ile doğrulanır.

Kaynaklar: `apps/api/src/engine.ts`, `management.ts`, `apps/web/app/admin/reward-limits.tsx`, `modules.tsx`, `translations.json`. Testler: `admin-limits.integration.test.ts`, `telegram-mission.integration.test.ts`, `telegram-quota.integration.test.ts`, `browser-admin-limits.e2e.mts` ve mevcut tüm regresyonlar.
