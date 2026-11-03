# Yönetici sosyal görev rehberi

## Canlı envanter düzeltmesi — 3 Kasım 2026, yayın sonrası doğrulama

11:28UTC envanterindeki3 kampanya/4 görev, yayından **önce**,12:29:00–12:29:18UTC (Türkiye15:29) arasında OWNER oturumundan silinmiştir. Audit kayıtlarında TASK_DELETE/CAMPAIGN_DELETE ve öncesinde OWNER MFA login vardır. Güncel yayın öncesi13:03UTC yedeğinde ve migration sonrasında **0 kampanya/0 görev** bulunur; eski sütun/row hashleri eşleşir. Silmeler bu deployment veya migration tarafından yapılmamıştır. İşlemi yapan gerçek kişi yalnız audit actoründen çıkarılamaz. Mevcut kullanıcı, ledger ve CONNECTED Telegram hesabı korunur. Yeni görev/kampanya oluşturulmamış, silinmiş kayıtlar geri yüklenmemiştir.

Aşağıdaki1TURK/25 kullanıcı/25TURK görevi referansları artık **tarihsel görev tanımıdır**, aktif canlı görev değildir. Görev motoru regression fixture'ları bu yapıyı test eder; güncel canlı panel doğru şekilde “Henüz yayınlanmış görev yok” gösterir. Yeni ödüllü görevin yayınlanması ayrı açık operatör işlemi gerektirir. Canlı kontrolün ilk denemesinde eski görevID'si bekleyen rapor scripti başarısız olmuştur; bu uygulama hatası değil, eski envanter varsayımıdır ve gizlenmeden raporlanır.


1. `/tr/admin` veya `/en/admin` → OWNER oturumu/MFA. Social API'den platformu seçin. ClientID/Secret/callback/scopes ve varsa bot/webhook sırrını girin. Sır alanları password tipidir, geri okunmaz. Kaydet ve gerçek API testini çalıştırın; eksik yapılandırma NOT_CONFIGURED kalır.
2. Sosyal Hesaplar'dan birden fazla resmî hedef tanımlayın. Telegram GROUP/CHANNEL için negatif string ID (örnek`-1003676977941`) veya geçerli @username. Pozitif numericgroup/channel ID reddedilir. Kullanıcı hesabı bağlantısı bu resmî hedefin yerine geçmez.
3. Görevler → Dinamik sosyal görev oluşturucu. Kampanya/platform/resmîhedef seçin. Hedef URL'yi API ile çözümleyin; author/channel sahipliği doğrulansın. URL'ye güvenilir domain yazmak sahipliği kanıtlamaz.
4. Yalnız ilgili platformun görevleri listelenir. Katalog policy/endpoint/scopes/ücret/rate/kaynak bilgilerini inceleyin. POLICY_RESTRICTED/UNSUPPORTED/REVIEW_REQUIRED görevler ödüllü yayınlanamaz; taslak bilgi olarak kalabilir.
5. TR/ENbaşlık/açıklama, kişiödülü,kontenjan, bağımsıztaskbudget,başlangıç/bitiş/IANAzone girin. Bütçe kampanyanın kalan ortak bütçesiyle sınırlıdır. Örnek1TURK×25=25TURK sadeceörnektir; buiş yeni canlıtaskoluşturmaz.
6. Aynı hedef için birdençok uygun satır ekleyin (max20). Policyreview checkbox veönizleme sonrası Kaydet tümünü atomicDRAFT yapar. Ayrı Publish açıkonay ve serverpolicy/bağlantı/sahiplikkontrolü ister. Tekrarlanabilir görevetkinleştirilemez.
7. Taslakdüzenleme yeni formdan; yayınlanmışödül/tarih/limitler mevcut Rewardandlimitsmodalından optimistic hash/onay ile değişir, taskpasifealınır. Kazanılmış/pendingtutarlar eski miktarla korunur, bütçe/quotakullanımınaltına düşürülemez. Limit/tarihkaldırma butonları vardır; yeni katalogtaskınınsonlubütçesikaldırılamaz.
8. Pasifleştir/Arşivle/Sil mevcutetkianalizini kullanır. Katılım/ödül/kalıcıkimlik/aktifkanıtgeçmişli görev fiziksel silinmez. Bağlıgörevli kampanya arşivlenir. Ledger/bakiyeler korunur. AuditLogs üzerindenkontroledin.

Telegram özel BOT görevleri için önce BOThedefini getMe ile gerçekbağlayın; SocialAPIwebhook opt-in/secret sonra OWNER explicit install yapar. Mevcut GROUPüyelik için webhookkurulması gerekmez; mevcutçalışangrubu gereksizyere yenidenbağlamayın. Bot install mevcut webhooku otomatik ezmez. Kullanıcı wallet→TGhesabı→privatebotchallenge→Verify akışını izler; başarılıkanıt içbakiye olur, gerçektransferkapalıdır.

Eksik gerçekAPIcredentials olanplatformda UI bağlanabilmealtyapısı hazır olsa da bağlantıbekleniyor gösterilir. Hatalıtoken/izin/APIoutage görevbaşarısı değildir. Sahte test credentials production'a girilmez.
