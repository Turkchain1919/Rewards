# Sosyal görev kataloğu

## Canlı envanter düzeltmesi — 3 Kasım 2026, yayın sonrası doğrulama

11:28UTC envanterindeki3 kampanya/4 görev, yayından **önce**,12:29:00–12:29:18UTC (Türkiye15:29) arasında OWNER oturumundan silinmiştir. Audit kayıtlarında TASK_DELETE/CAMPAIGN_DELETE ve öncesinde OWNER MFA login vardır. Güncel yayın öncesi13:03UTC yedeğinde ve migration sonrasında **0 kampanya/0 görev** bulunur; eski sütun/row hashleri eşleşir. Silmeler bu deployment veya migration tarafından yapılmamıştır. İşlemi yapan gerçek kişi yalnız audit actoründen çıkarılamaz. Mevcut kullanıcı, ledger ve CONNECTED Telegram hesabı korunur. Yeni görev/kampanya oluşturulmamış, silinmiş kayıtlar geri yüklenmemiştir.

Aşağıdaki1TURK/25 kullanıcı/25TURK görevi referansları artık **tarihsel görev tanımıdır**, aktif canlı görev değildir. Görev motoru regression fixture'ları bu yapıyı test eder; güncel canlı panel doğru şekilde “Henüz yayınlanmış görev yok” gösterir. Yeni ödüllü görevin yayınlanması ayrı açık operatör işlemi gerektirir. Canlı kontrolün ilk denemesinde eski görevID'si bekleyen rapor scripti başarısız olmuştur; bu uygulama hatası değil, eski envanter varsayımıdır ve gizlenmeden raporlanır.


65 görev; destek durumu API kabiliyetinden ve platform politikasından bağımsız olarak aşağıda gösterilir. Tam izin/ücret/rate/kaynak alanları SOCIAL_PLATFORM_MATRIX.md içinde. canPublish ayrıca canlı yapılandırma, hedef bağlantısı ve worker/backend koşullarına bağlıdır. NOT_CONFIGURED teknik/politika engelini kaldırmaz.

## X

| Kod | TR / EN | Durum | Politika | Ödül uygulanmış/açık aday |
|---|---|---|---|---|
| X_FOLLOW | Hesabı takip et / Follow account | POLICY_RESTRICTED | RESTRICTED | False / False |
| X_LIKE | Gönderiyi beğen / Like post | POLICY_RESTRICTED | RESTRICTED | False / False |
| X_REPOST | Gönderiyi repost et / Repost post | POLICY_RESTRICTED | RESTRICTED | False / False |
| X_REPLY | Gönderiye yorum yaz / Reply to post | POLICY_RESTRICTED | RESTRICTED | False / False |
| X_MENTION | Kullanıcı mention et / Mention user | POLICY_RESTRICTED | RESTRICTED | False / False |
| X_HASHTAG_POST | Hashtag içeren gönderi oluştur / Create hashtag post | POLICY_RESTRICTED | RESTRICTED | False / False |
| X_QUOTE | Quote repost yap / Quote repost | POLICY_RESTRICTED | RESTRICTED | False / False |
| X_SPECIFIC_REPLY | Belirli gönderiye yanıt ver / Reply to specific post | POLICY_RESTRICTED | RESTRICTED | False / False |

## YOUTUBE

| Kod | TR / EN | Durum | Politika | Ödül uygulanmış/açık aday |
|---|---|---|---|---|
| YOUTUBE_SUBSCRIBE | Kanala abone ol / Subscribe to channel | POLICY_RESTRICTED | RESTRICTED | False / False |
| YOUTUBE_LIKE_VIDEO | Videoyu beğen / Like video | POLICY_RESTRICTED | RESTRICTED | False / False |
| YOUTUBE_COMMENT | Videoya yorum yaz / Comment on video | POLICY_RESTRICTED | RESTRICTED | False / False |
| YOUTUBE_COMMENT_REPLY | Yoruma yanıt yaz / Reply to comment | POLICY_RESTRICTED | RESTRICTED | False / False |
| YOUTUBE_WATCH | Video izle / Watch video | POLICY_RESTRICTED | RESTRICTED | False / False |
| YOUTUBE_LIVE_CHAT_JOIN | Canlı sohbetine katıl / Join live chat | POLICY_RESTRICTED | RESTRICTED | False / False |
| YOUTUBE_LIVE_CHAT_MESSAGE | Canlı sohbette mesaj yaz / Send live chat message | POLICY_RESTRICTED | RESTRICTED | False / False |
| YOUTUBE_SHARE | Videoyu paylaş / Share video | POLICY_RESTRICTED | RESTRICTED | False / False |

## INSTAGRAM

| Kod | TR / EN | Durum | Politika | Ödül uygulanmış/açık aday |
|---|---|---|---|---|
| INSTAGRAM_FOLLOW | Hesabı takip et / Follow account | POLICY_RESTRICTED | RESTRICTED | False / False |
| INSTAGRAM_LIKE | Gönderiyi beğen / Like post | POLICY_RESTRICTED | RESTRICTED | False / False |
| INSTAGRAM_COMMENT | Gönderiye yorum yap / Comment on post | POLICY_RESTRICTED | RESTRICTED | False / False |
| INSTAGRAM_TAG_FRIEND | Yorumda arkadaş etiketle / Tag friend in comment | POLICY_RESTRICTED | RESTRICTED | False / False |
| INSTAGRAM_SHARE | Gönderiyi paylaş / Share post | POLICY_RESTRICTED | RESTRICTED | False / False |
| INSTAGRAM_WATCH_REEL | Reels izle / Watch Reel | POLICY_RESTRICTED | RESTRICTED | False / False |
| INSTAGRAM_REEL_COMMENT | Reels yorum yap / Comment on Reel | POLICY_RESTRICTED | RESTRICTED | False / False |
| INSTAGRAM_HASHTAG | Hashtag kullan / Use hashtag | POLICY_RESTRICTED | RESTRICTED | False / False |
| INSTAGRAM_MENTION | Hesabı mention et / Mention account | POLICY_RESTRICTED | RESTRICTED | False / False |
| INSTAGRAM_STORY_MENTION | Hikâyede mention et / Mention in Story | POLICY_RESTRICTED | RESTRICTED | False / False |

## TELEGRAM

| Kod | TR / EN | Durum | Politika | Ödül uygulanmış/açık aday |
|---|---|---|---|---|
| TELEGRAM_JOIN_GROUP | Gruba katıl / Join group | VERIFIED_SUPPORTED | ALLOWED | True / True |
| TELEGRAM_JOIN_CHANNEL | Kanala katıl / Join channel | VERIFIED_SUPPORTED | ALLOWED | True / True |
| TELEGRAM_SEND_MESSAGE | Grupta mesaj gönder / Send group message | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |
| TELEGRAM_FORWARD_MESSAGE | Belirli mesajı ilet / Forward message | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |
| TELEGRAM_REACTION | Mesaja reaksiyon bırak / React to message | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |
| TELEGRAM_BOT_INTERACTION | Bot ile etkileşim kur / Interact with bot | VERIFIED_SUPPORTED | ALLOWED | True / True |
| TELEGRAM_BOT_CODE | Bot üzerinden doğrulama kodu gönder / Send verification code to bot | VERIFIED_SUPPORTED | ALLOWED | True / True |
| TELEGRAM_INVITE | Davet bağlantısıyla arkadaş davet et / Invite friend | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |
| TELEGRAM_POLL | Ankete katıl / Answer poll | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |

## FACEBOOK

| Kod | TR / EN | Durum | Politika | Ödül uygulanmış/açık aday |
|---|---|---|---|---|
| FACEBOOK_FOLLOW_PAGE | Sayfayı takip et / Follow page | POLICY_RESTRICTED | RESTRICTED | False / False |
| FACEBOOK_LIKE_PAGE | Sayfayı beğen / Like page | POLICY_RESTRICTED | RESTRICTED | False / False |
| FACEBOOK_LIKE_POST | Gönderiyi beğen / Like post | POLICY_RESTRICTED | RESTRICTED | False / False |
| FACEBOOK_COMMENT | Gönderiye yorum yap / Comment on post | POLICY_RESTRICTED | RESTRICTED | False / False |
| FACEBOOK_SHARE | Gönderiyi paylaş / Share post | POLICY_RESTRICTED | RESTRICTED | False / False |
| FACEBOOK_TAG_FRIEND | Yorumda arkadaş etiketle / Tag friend in comment | POLICY_RESTRICTED | RESTRICTED | False / False |
| FACEBOOK_WATCH_VIDEO | Video izle / Watch video | POLICY_RESTRICTED | RESTRICTED | False / False |
| FACEBOOK_REELS | Reels etkileşimi / Reels engagement | POLICY_RESTRICTED | RESTRICTED | False / False |
| FACEBOOK_JOIN_GROUP | Gruba katıl / Join group | POLICY_RESTRICTED | RESTRICTED | False / False |

## KICK

| Kod | TR / EN | Durum | Politika | Ödül uygulanmış/açık aday |
|---|---|---|---|---|
| KICK_FOLLOW | Kanalı takip et / Follow channel | POLICY_RESTRICTED | RESTRICTED | False / False |
| KICK_CHAT_MESSAGE | Canlı yayında mesaj gönder / Send live chat message | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |
| KICK_CHAT_JOIN | Yayın sohbetine katıl / Join stream chat | UNSUPPORTED | REVIEW_REQUIRED | False / False |
| KICK_SUBSCRIBE | Kanala abone ol / Subscribe to channel | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |
| KICK_INTERACTION | Yayın etkileşimi gerçekleştir / Perform stream interaction | UNSUPPORTED | REVIEW_REQUIRED | False / False |
| KICK_SPECIFIC_MESSAGE | Belirli mesajı gönder / Send specific chat message | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |

## TWITCH

| Kod | TR / EN | Durum | Politika | Ödül uygulanmış/açık aday |
|---|---|---|---|---|
| TWITCH_FOLLOW | Kanalı takip et / Follow channel | POLICY_RESTRICTED | RESTRICTED | False / False |
| TWITCH_SUBSCRIBE | Kanala abone ol / Subscribe to channel | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |
| TWITCH_CHAT_MESSAGE | Canlı yayında mesaj gönder / Send live chat message | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |
| TWITCH_CHAT_COMMAND | Belirli sohbet komutunu kullan / Use chat command | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |
| TWITCH_INTERACTION | Yayın sırasında etkileşim / Interact during stream | UNSUPPORTED | REVIEW_REQUIRED | False / False |
| TWITCH_CHANNEL_POINTS | Kanal puanı ödülü kullan / Redeem channel point reward | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |
| TWITCH_RAID | Raid katılımını doğrula / Verify raid participation | UNSUPPORTED | REVIEW_REQUIRED | False / False |

## TIKTOK

| Kod | TR / EN | Durum | Politika | Ödül uygulanmış/açık aday |
|---|---|---|---|---|
| TIKTOK_FOLLOW | Hesabı takip et / Follow account | UNSUPPORTED | REVIEW_REQUIRED | False / False |
| TIKTOK_LIKE | Videoyu beğen / Like video | UNSUPPORTED | REVIEW_REQUIRED | False / False |
| TIKTOK_COMMENT | Videoya yorum yap / Comment on video | UNSUPPORTED | REVIEW_REQUIRED | False / False |
| TIKTOK_TAG_FRIEND | Yorumda arkadaş etiketle / Tag friend in comment | UNSUPPORTED | REVIEW_REQUIRED | False / False |
| TIKTOK_SHARE | Videoyu paylaş / Share video | UNSUPPORTED | REVIEW_REQUIRED | False / False |
| TIKTOK_WATCH | Video izle / Watch video | UNSUPPORTED | REVIEW_REQUIRED | False / False |
| TIKTOK_HASHTAG_VIDEO | Hashtag ile video yayınla / Publish hashtag video | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |
| TIKTOK_MENTION | Hesabı mention et / Mention account | SUPPORTED_REQUIRES_PERMISSION | REVIEW_REQUIRED | False / False |

## Manuel ve tekrar kuralları

MANUAL_REVIEW_ONLY etiketi platform yasağını aşmak için kullanılmaz. Bu katalogdaki kapalı eylemler ekran görüntüsü yükleyerek otomatik ödüllendirilemez. Tekrarlanabilir ödül döngüsü bu sürümde uygulanmamıştır; repeatable:true400 ile reddedilir. Bot/private code olayı kamuya açık metrik şişirmemelidir. Telegram authentic üyelik için mevcut yönetici bağlantısı ve gerçek getChatMember kanıtı gereklidir. Katalogdaki4 aday otomatik yayın anlamına gelmez.
