# Yönetici sosyal görev rehberi

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
