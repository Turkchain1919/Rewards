# 1 TURK × 25 kullanıcı — yayın hazırlığı

Bu belge 2026-11-03 hazırlığını kapsar. Önceki 10 TURK görevi önerisi tarihsel taslaktır; güncel onay 1 TURK/kullanıcı, 25 kullanıcı ve toplam25TURK'dür. Kullanıcı TEST sonrası canlı yayını onayladı. Nihai çalışan SHA/backup/sağlık sonuçları dış `PROJECT_HANDOFF.md` ve `.runtime/deployment.json` ile doğrulanır; bu belge tek başına yayın kanıtı değildir.

## Mevcut veri ve etki

Production read-only envanteri: `.runtime/reward25-prep/inventory.json`. TELEGRAM campaign `cmvxx6wdg0007sqify4ei3lih` DRAFT, bütçe10TURK, allocated0, bağlı görev0, ödül geçmişi0. 10→25 artışı gelecekteki muhasebe kapasitesini15TURK artırır; mevcut kullanıcı bakiyesi veya ledger transferi değildir. Diğer iki PAUSED kampanya ve eski üç disabled görev değiştirilmez. Yeni kampanya gerekmez. Resmî GROUP `cmvxxbysj000isqifw90acmj0`: CONNECTED, negatif string `-1003676977941`, @Turkchain1919, bot @turkchainaibot yönetici.

Görev tam payload: [TELEGRAM_REWARD25_TASK.json](TELEGRAM_REWARD25_TASK.json). Başlık TR/EN, beşadım, 1TURK içAVAILABLE, ilk25, teködül, transfers/claims kapalı metinleri içerir. Eski3 görev korunarak yalnız bu görevin oluşturulması, mevcutcampaignbütçesi25 ve ACTIVE yapılması onaylanmıştır. Tarih zorunlu değil; asıl sonlandırma ilk25 ödüldür.

## Veritabanı güvenliği / migration

Yeni tablo/kolon/migration yok. `Task.verification` mevcut JSON'a isteğe bağlı `maxRewards:25`; eski uncapped görevler aynı davranır. Sunucu pozitif integer1..1000000 kabul eder. Kişi başına ödül mevcut Submission(userId,taskId) + LedgerEntry unique kısıtlarıyla korunur. Görev kullanıldıktan sonra verification/reward güncellenemez.

Başarılı dış getChatMember çağrısından SONRA SERIALIZABLE transaction Campaign→Task FOR UPDATE kilidi alır; görev/aktiflik/tarih yeniden kontrol edilir, ödüllü APPROVED submission sayısı denetlenir. Campaign allocated koşullu increment ve mevcut SQL `campaign_budget_bounds` CHECK ile bütçeyi aşamaz. Aynı transaction Submission+AVAILABLE Ledger+LedgerEvent+audit yazar. 25'inci ödülle task.enabled=false ve TASK_REWARD_LIMIT_REACHED audit atomiktir. Eski kazanan tekraristeği idempotent geçmiş yanıtıdır. Bütçe sonradan artırılsa da maxRewards dolu görev yeniden yayınlanamaz. Sayaç frontend/memory/Redis ile korunmaz. Ağ doğrulaması yapmayan veya kontenjan bittiğinde reddedilen istek ödül yazmaz. Dört serialization retry sonrası HTTP409 ile tekrar önerilir; SQL iç hata kullanıcıya taşınmaz.

UI kalan/max kontenjanını TR/EN gösterir; kapalı görev yeni listede görünmez, ledger/geçmiş ayrı endpointlerde korunur. Bütün aktif görevler tek seferliktir. Max25 ayarı aynı cüzdan/sosyal kimliğe birkezdir; birinsanı farklı kimliklerle ayırt eden KYC sistemi yoktur.

## Kontroller

`tests/telegram-quota.integration.test.ts`: hatalılimitler, uncappeduyumluluk, nonmember/APIhatası, ilk20 + sınırda10eşzamanlı ve winnerduplicate, 25ledger/25APPROVED/25TURK, otomatikdisable/audit, listedenkalkma, tekrarödülyok, SQL26TURKallocationCHECKreddi, bütçe30olsa bile yenidenyayınreddi. Yalnız TEST fixturelarını temizler; productionödül denemesi yapmaz. `tests/browser-reward25.e2e.mts`: TR/EN1440/390px 1TURK/25kontenjan/beşadım/içbakiyemetni. `test-all.sh` mevcutTelegram/OIDC/ledger/auth/lifecycle veFoundrytestlerini de içerir.

İlk odaklı2/2 test geçti. Nihai exactcommit build/typecheck/lint/fulltest/browser/audit/migrationstatus/diff/secret scan kanıtı `.runtime/reward25-prep/release-gate.log`, marker `.runtime/validated.json` olmalıdır. Tamgate başarısızsa productionyayını yok.

## Backup ve rollback

Yayından önce productionpg_dump custom/0600 + SHA256 + pg_restore --list ve ayrı geçiciDB'ye gerçekrestore/korunantablolarhashkarşılaştırması. Migration14current/no diff beklenir. Immutable eski currentcc61b966 ve önceki7e9704d korunur; env/unit/nginx/manifest rollback snapshot güvenli `.runtime/reward25-prep` altında. Yeni capkodunda migration yok; yalnız releasegeri dönüşü mümkündür.

**Eski cc61b966 motoru maxRewards'ü bilmez.** Yeni görev yayınlandıktan sonra rollback gerekirse önce YALNIZ bu görev ve TELEGRAMcampaign auditli transactionla PAUSED yapılır; sonra eskiartifact/env/unit/manifest döndürülür, nginx-t ve publichealth doğrulanır. Kullanıcılar ödül kazanmışsa DBdump geri yüklenmez, ledger/allocated/bakiyeler korunur. Backup forensic/acil bozulma kurtarması içindir; normal kodrollback eskiDBsnapshot'a dönüş değildir.

Yayın sonrası PostgreSQL/API/frontend/Redis/worker/SSL; publictask1TURK/max25/canonicalTelegramlink; claimsPausedtrue, masterfalse, networkclaimsfalse; eski3task/diğercampaign/user/ledgerhashbaseline karşılaştırılır. Yeni campaignupdate/task/audit dışındaki authorized veri değişimi yok; gerçek kullanıcının kendi hareketi ayrıca ayrıştırılır. getMe/getChat/getChatMember read-onlyprobeları yapılır. Sağlık sonrasıGitHubmain/tag exactSHA eşleştirilir.

## Aday test ve backup sonucu

İlk tam37/37 app,10/10Foundry, typecheck/lint/build, hero/lifecycle/guide/Telegramvalidator/1TURKquota browserları ve audit0, migration14current geçti. YeniInstagramsetup/maxRewardseditorbrowser TR/EN1440/390 geçti; ilkseçici yanlışlıkla Languagecombobox'a yöneldi, seçici adı daraltılarak düzeltildi ve başarısızlog saklandı (`instagram-browser-initial-failed.log`). Son exactcommitreleasegate ayrıca zorunludur.

Backup: `/var/www/rewards.turkscan.com/rewards/backups/production-20261103T093122-536975.dump`, SHA256 `4159ea991d0cba3a96f68aab55016f856e134448dd227904124233d15ac61ffe`; geçiciDB gerçekrestore20/20tablohash eşit. İlkrestorepostgres'inroot0600dosyayadoğrudanerişimiolmadığıiçinbaşarısızdı; izinlergevşetilmedenrootstdin üzerindenrestore başarıyla doğrulandı, tempDBsilindi. Yeni çalışırrollbackscript TEST `.runtime/reward25-prep/rollback.sh`, pause-before-old-engine koruması içerir. CanonicalID veusernamegetChat/getChatMember200/admin, getMe doğru@turkchainaibot, OIDCready,configfingerprintdeğişmedi.
