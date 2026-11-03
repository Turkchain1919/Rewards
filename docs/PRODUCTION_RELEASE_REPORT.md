# v0.5.0 production yayın raporu / kanıt dizini

## Canlı envanter düzeltmesi — 3 Kasım 2026, yayın sonrası doğrulama

11:28UTC envanterindeki3 kampanya/4 görev, yayından **önce**,12:29:00–12:29:18UTC (Türkiye15:29) arasında OWNER oturumundan silinmiştir. Audit kayıtlarında TASK_DELETE/CAMPAIGN_DELETE ve öncesinde OWNER MFA login vardır. Güncel yayın öncesi13:03UTC yedeğinde ve migration sonrasında **0 kampanya/0 görev** bulunur; eski sütun/row hashleri eşleşir. Silmeler bu deployment veya migration tarafından yapılmamıştır. İşlemi yapan gerçek kişi yalnız audit actoründen çıkarılamaz. Mevcut kullanıcı, ledger ve CONNECTED Telegram hesabı korunur. Yeni görev/kampanya oluşturulmamış, silinmiş kayıtlar geri yüklenmemiştir.

Aşağıdaki1TURK/25 kullanıcı/25TURK görevi referansları artık **tarihsel görev tanımıdır**, aktif canlı görev değildir. Görev motoru regression fixture'ları bu yapıyı test eder; güncel canlı panel doğru şekilde “Henüz yayınlanmış görev yok” gösterir. Yeni ödüllü görevin yayınlanması ayrı açık operatör işlemi gerektirir. Canlı kontrolün ilk denemesinde eski görevID'si bekleyen rapor scripti başarısız olmuştur; bu uygulama hatası değil, eski envanter varsayımıdır ve gizlenmeden raporlanır.


Bu dosya commit öncesi hazırlanan aday kaydıdır; tamamlanmış deployment iddiası değildir. Kesin sonSHA/backuphash/restore/migration/health/datahash/GitHubsonucu TEST`.runtime/multi-social/final-release.json`, dış`PROJECT_HANDOFF.md` ve `/var/www/rewards.turkscan.com/MULTI_SOCIAL_RELEASE_REPORT.md` ile doğrulanır. Henüz bu artefactlar yoksa yayın tamamlanmış sayılmaz.

## Kapsam

8platform65görevkataloğu; şifreliAPI/çokluhedef/dinamiktaslak; gerçekkanıt/policygates; bağımsızbütçe/kalıcıkimlik/UTC/worker. Güncelyayınöncesi0kampanya/0görev,kullanıcı/bakiye/ledger ve CONNECTEDTelegramkorunur. Yeniücretligörev/campaignoluşturma/ödüldağıtımı/transfer yok. Claims paused. MinimumuserOAuthve OWNERMFA korunur.

## Yayın öncesi kanıtlar

- `.runtime/multi-social/full-tests.log`:52uygulama,8TR/ENdesktop/mobilebrowser,10Foundrytesti;audit0,15migrationcurrent. Mockprovider/browserfixture gerçekAPIonayıdeğildir.
- Exactcandidategate `.runtime/validated.json`; commit değişirse gate tekrar çalıştırılır.
- `.runtime/multi-social/preflight.json`: güncelPG14custombackup+SHA256,geçiciDBrestore ve eklemeli15.migrationprovasi.
- `.runtime/multi-social/snapshot-before.json` / `snapshot-after.json`: eski sütunhashleri/ledger/bakiyeler,3campaign/4task/TGhesabı karşılaştırması.
- Yeni SocialPlatformKICK/TWITCHregistry satırları ve yeni migration row beklenen eklemelerdir; eski satırhashleri ayrı korunur. Taskyeniscalarlar/IntegrationSettingekkolonları eskiwhole-rowhashile yanlışkarşılaştırılmaz.
- Rollbackeskiimmutableartifact; yeniözelliktasklarını öncepasifleştirmeguardı; DBdowngrade/ledgerdelete yok.

## Canlı doğrulanamayanlar / sınırlamalar

YeniKick/Twitch/Meta/X/YT/TikTok ownercredentials/consent/appreview yokken liveOAuth/görevkanıtı iddia edilmez. Meta doğrudan Developer429; politika kısıtlı görevler kapalı. Unsupported per-userwatch/share/raidkanıtı yok. Tekrarlanabilirödül etkin değil. Yeniwebhookproviderabonelikleri otomatik kurulmaz. MevcutTelegramread-onlygetChat/getChatMember sonuçları finalraporda gösterilir.
