# TURKCHAIN® Rewards v0.4.5 — TEST adayı

Kapsam yalnız `/var/www/rewards.turkscan.com/REWARDSTEST`. Production v0.4.4 / 7e9704d13b162630009434f18b69586821f4cc2a korunur. Production yayını ayrıca onay bekler. `REWARD_CLAIMS_PAUSED=true`; gerçek transfer kapalıdır.

## Davranış

- TR/EN başlık, açıklama, adımlar, ödül koşulları; eski kayıtlarda başlık/talimat fallback. Nullable UTC görev tarihleri. Yayınlanmış görevler için ödül/verification değiştirmeyen ayrı içerik/tarih editörü.
- Kullanıcı kartları cüzdan/Telegram bağlantısı, katılma/doğrulama, işlem durumu, tamamlanma/başarısızlık ve tek seferlik platform içi AVAILABLE ödülünü açıklar. Arşivlenmiş kayıtlar yeni görev listesinde görünmez; geçmiş korunur.
- Admin Aktif/Taslak/Pasif/Arşivlenmiş filtresi; etki analizinde ad, bağlı görevler, katılım, doğrulama girişimi ve ödül sayıları. Kalıcı silmenin geri alınamaz olduğu belirtilir. Bu sürümde arşivden geri alma yoktur.
- Kullanılmamış görev silinir. Katılım veya Telegram doğrulama girişimi varsa arşivlenir. Bağlı görevi/ödülü olan kampanya arşivlenir; boş kampanya silinir. Aktif kampanya aynı transaction içinde önce durdurulur.
- OWNER/ADMIN ve mevcut MFA/same-origin kuralları korunur. REVIEWER, kullanıcı ve MFA olmayan oturumlar reddedilir. DELETE gövdesinde eşleşen confirmId gerekir. Tekrarlanan silme audit tombstone ile idempotenttir.
- Serializable transaction ve kampanya→görev kilit sırası. Prisma adapter 40001/40P01 tekrar denemesi. Telegram çağrısı transaction dışında; çağrıdan önce girişim geçmişi yazılır ve ödülden önce kilit altında kullanılabilirlik tekrar kontrol edilir.
- Ledger otomatik silinmez; kontrolsüz cascade eklenmez. Bakiye ve tek ödül koruması korunur. Audit silme, arşivleme, durdurma, içerik düzenleme ve Telegram girişimlerini kaydeder.

## Yeni API

| Method | Endpoint | İşlev |
|---|---|---|
| GET | /api/me/tasks | Oturumlu görev durumu, kullanılabilirlik ve içerik |
| GET | /api/admin/tasks/:id/impact | Görev etki analizi |
| DELETE | /api/admin/tasks/:id | Güvenli sil veya geçmiş varsa arşivle |
| POST | /api/admin/tasks/:id/archive | Görev arşivle |
| PATCH | /api/admin/tasks/:id/content | Yalnız başlık, TR/EN içerik ve tarihler |
| GET | /api/admin/campaigns/:id/impact | Kampanya etki analizi |
| DELETE | /api/admin/campaigns/:id | Güvenli sil veya geçmiş varsa arşivle |
| POST | /api/admin/campaigns/:id/archive | Kampanya ve bağlı görevleri arşivle |

DELETE body: `{"confirmId":"route-id"}`. Mevcut endpointler korunur. Görev create/update: opsiyonel `localizedContent:{tr?,en?}` içindeki title/description/steps/rewardCondition ve nullable ISO startsAt/endsAt. Content PATCH title/localizedContent/startsAt/endsAt alanlarını zorunlu tutar; ödül veya verification alanı kabul etmez.

## Migration

`202611020001_task_content_lifecycle`: Campaign.archivedAt; Task.localizedContent/startsAt/endsAt/publishedAt/archivedAt; iki indeks; publishedAt eski audit geçmişinden doldurulur. Silici migration/ledger şema değişikliği yoktur. TEST'te 14 migration güncel ve schema diff boş. Production migrate çalıştırılmadı.

## Test ve kanıt

Son doğrulama `docs/evidence/v045-validation.json`; tarayıcı `docs/evidence/v045-browser.json`. Ayrıntılı TEST logları `logs/v045-*`, TR/EN 1440/390px ekran görüntüleri `.runtime/lifecycle-*.png`.

Senaryolar: kullanılmamış silme, ödüllü görev arşivleme, boş aktif kampanyayı durdurup silme, bağlı kampanya arşivleme, tekrarlı/eşzamanlı silme, kullanıcı/REVIEWER/MFA reddi, arşiv görünürlüğü, AVAILABLE/geçmiş/ledger event/allocation korunması, eski kayıtlar/TR-EN içerik/tarih, eşzamanlı başvuru-arşiv, Telegram doğrulama sürerken arşiv ve tek ödül. Tam mevcut OAuth/MFA/Telegram/ledger regresyonları ayrıca çalıştırılır.

## TEST kontrolü

TEST web listener `127.0.0.1:18480`. Yetkili SSH anahtarıyla localhost 18480→sunucu 127.0.0.1:18480 tüneli açıp `http://127.0.0.1:18480/tr/admin` veya `/en/admin` üzerinden kendi TEST yönetici hesabınız/MFA ile girin. Public rewards.turkscan.com production'dır; silme testini orada yapmayın. Kimlik bilgisi bu raporda bulunmaz.

1. Boş taslak kampanya/görev oluşturun; Sil etki analizini ve kalıcı silmeyi kontrol edin.
2. TR/EN içerik ve UTC tarihleri girin; iki dilde dashboard kartlarını kontrol edin. Oturumlu durumlar için TEST cüzdanı/Telegram bağlayın; payout kapalı kalır.
3. Kullanılmış görevde Sil→Arşivle; AVAILABLE ve geçmiş değişmez. Arşivlenmiş filtresinde bulun. Yayınlı görev içerik düzenlemesinde ödül miktarı değişmez.
4. Görevli kampanyayı silin; kampanya/bağlı görevler arşivlenir, kullanıcı listesinden kalkar. Audit Logs'u inceleyin.
5. 390px mobilde tekrar kontrol edin. Production kayıtlarını test fixture olarak kullanmayın.

## Değişen dosyalar

- apps/api/src/{engine,management}.ts
- apps/web/app/admin/{modules,lifecycle}.tsx
- apps/web/app/dashboard/board.tsx; apps/web/app/{style.css,translations.json}
- prisma/schema.prisma; prisma/migrations/202611020001_task_content_lifecycle/migration.sql
- tests/{lifecycle.integration.test.ts,telegram-mission.integration.test.ts,browser-lifecycle.e2e.mts}
- package.json; package-lock.json
- docs/REWARDS_V045_TEST_REPORT.md; docs/evidence/v045-{browser,validation}.json

## Nihai sonuç — TAMAMLANDI

31/31 uygulama testi; 10/10 Foundry; TR/EN 1440/390px lifecycle ve yayınlı içerik editörü tarayıcı testleri; mevcut admin/GIF regresyonu; TypeScript/lint; API/web optimize build; 0 bağımlılık açığı; gizli bilgi taraması; TEST health PASS. 14 migration güncel/schema diff yok. Son API değişikliğinden sonra build/typecheck/lint ve 31 test yeniden PASS. AVAILABLE, ledger event, geçmiş ve allocation korunması otomatik testte doğrulandı. Telegram provider testleri fixture Bot API yanıtları kullanır; gerçek kullanıcı Telegram/MetaMask oturumu bu otomasyonun parçası değildir.

TEST sürüm adayı yayın incelemesine hazırdır. Production deploy/migrate/push yapılmadı; ayrıca owner onayı gerekir. Production ve GitHub main 7e9704d olarak doğrulandı; production health ok/claimsPaused=true.
