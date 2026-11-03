# Sosyal API entegrasyonları

## Canlı envanter düzeltmesi — 3 Kasım 2026, yayın sonrası doğrulama

11:28UTC envanterindeki3 kampanya/4 görev, yayından **önce**,12:29:00–12:29:18UTC (Türkiye15:29) arasında OWNER oturumundan silinmiştir. Audit kayıtlarında TASK_DELETE/CAMPAIGN_DELETE ve öncesinde OWNER MFA login vardır. Güncel yayın öncesi13:03UTC yedeğinde ve migration sonrasında **0 kampanya/0 görev** bulunur; eski sütun/row hashleri eşleşir. Silmeler bu deployment veya migration tarafından yapılmamıştır. İşlemi yapan gerçek kişi yalnız audit actoründen çıkarılamaz. Mevcut kullanıcı, ledger ve CONNECTED Telegram hesabı korunur. Yeni görev/kampanya oluşturulmamış, silinmiş kayıtlar geri yüklenmemiştir.

Aşağıdaki1TURK/25 kullanıcı/25TURK görevi referansları artık **tarihsel görev tanımıdır**, aktif canlı görev değildir. Görev motoru regression fixture'ları bu yapıyı test eder; güncel canlı panel doğru şekilde “Henüz yayınlanmış görev yok” gösterir. Yeni ödüllü görevin yayınlanması ayrı açık operatör işlemi gerektirir. Canlı kontrolün ilk denemesinde eski görevID'si bekleyen rapor scripti başarısız olmuştur; bu uygulama hatası değil, eski envanter varsayımıdır ve gizlenmeden raporlanır.


Kontrol: 3 Kasım2026. API bilgileri Admin Center → Social API'den OWNER/MFA ile girilir. Credential AES256GCM ve APP_ENV AAD ile şifrelenir; stored/configured bayrakları dışında secret döndürülmez. Gerçek anahtar girmeden bağlantı CONNECTED sayılmaz. Kullanıcı hesabı ve resmî hedef ayrı kayıtlardır. Yetki arttırımı yeniden OAuth izni gerektirir.

| Platform | Gerçek mekanizma / minimum kullanıcı kapsamı | Ek izin / kısıt |
|---|---|---|
| X | OAuth2 state+PKCE; users.read,tweet.read,offline.access | follows.read/like.read vb hedefe bağlı; pay-per-use; teşvikli etkileşimler kapalı |
| YouTube | Google OAuth+PKCE; youtube.readonly | youtube.force-ssl ve canlı sohbet scope/appreview; ödüllü view/like/sub/comment/share yasak |
| Instagram | Instagram Login profesyonel hesap; instagram_business_basic | comments/manage_messages için ayrı izin; normal kişisel hesap kimliği varsayılmaz; follow/like/share kişi kanıtı yok |
| Telegram | OAuth/OIDC kullanıcı; BotAPI resmî GROUP/CHANNEL; özel BOT getMe | GROUP/CHANNEL sayısal ID negatif string veya @username; getChat/getChatMember botun adminliği; OIDC state/nonce/audience/PKCE korunur |
| Facebook | Meta OAuth public_profile | Page user/page permissions ve appreview; kişi bazlı teşvikli etkileşim kapalı |
| Kick | OAuth2.1 zorunlu PKCE; user:read | channel:read/events:subscribe resmî hesap için; canlı event aboneliği operatör işlemi; rewarded follow kapalı |
| Twitch | OAuth confidential code grant; kimlik için ek scope gerekmez | user:read:chat/moderator:read:followers vb görev bağımlı; token /validate exchange+refresh ve55dkTTL; policyreview olmadan ödül yok |
| TikTok | LoginKit user.info.basic | video.list/video.publish ayrı appapproval; DisplayAPI takip/beğeni/izlenme kişi kanıtı sağlamaz; ResearchAPI genel ticari çözüm değildir |

Callbacklar `/api/oauth/:provider/callback`; admin resmî hesap bağlantısı aynı callbackte bağlanmış intent/state ile ayrılır. Legacy `/api/social/:provider/callback` alias korunur. Origin APP_URL ile eşleşir. Kick/Twitch için kod/fixture testi vardır, owner gerçekcredentials/consent yokken canlı başarı raporlanmaz. Mevcut ENV izin setlerinin otoritesi `social-config.ts`; yukarıdaki genel izinler gerçek appreview/sağlayıcı erişimini kanıtlamaz.

Refresh: mevcut X/YouTube/TikTok/legacyconnector ve yeni Kick/Twitch sağlayıcıları lifecycle kodunu kullanır. Telegram/Meta izin yenilemesi yeniden bağlantı isteyebilir; bütün sağlayıcılar aynı refresh davranışına sahip sayılmaz. Revocation/invalid credentials bağlantıyı REAUTH_REQUIRED yapar; resmî hedefe bağlı görevler güvenli pasifleştirilir. Twitch token403/401 işlemi credential versionı değişmemişse uygulanır.

## Webhook işletimi

- Telegram: OWNER explicit register, secret_token; mevcut başka webhook otomatik ezilmez, replaceExisting açık onay ister, pendingupdates drop edilmez. Sadece private `/start` challenge mesajı, actor/hash/account version/TTL bağı gerekir.
- Twitch: EventSub rawbody HMAC, message id ve timestamp,10dk pencere; signed subscription.type ile header eşleşmesi; challenge plaintext. Provider EventSub subscriptionını bu yayın otomatik kurmaz.
- Kick: RSA-SHA256 `id.timestamp.rawBody`, key resmî public-key API'den dinamik alınır ve5dk cachelenir; event aboneliği ayrı gerekir.
- Meta: X-Hub-Signature256 HMAC + verify_token handshake; appreview ve abonelik ayrıca gerekir. Meta doğrudan Developers429 sınırlaması açıkça kaydedilmiştir.
- X/YouTube/TikTok receiver burada desteklenmez; hata fail-closed. Bunlar için sahte webhook başarısı yoktur.

Ham payload/token receipt tablosuna yazılmaz. İmzalı olay almak görevödülü vermek değildir. Retry/timeout/rate kodu `social-http.ts`; 3deneme üst sınırı,8s timeout,redirecterror,429 RetryAfter/reset/cooldown. Networkhatası başarısız doğrulamadır.

## Resmî kaynaklar

- [X API](https://docs.x.com/x-api), [X authenticity](https://help.x.com/en/rules-and-policies/authenticity), [fiyatlandırma](https://docs.x.com/x-api/getting-started/pricing)
- [YouTube API](https://developers.google.com/youtube/v3/docs), [Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- [Instagram](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login), [Meta'nın Postman koleksiyonu](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api), [Pages](https://developers.facebook.com/docs/pages-api)
- [Telegram BotAPI](https://core.telegram.org/bots/api), [Bot terms](https://telegram.org/tos/bot-developers)
- [Kick OAuth](https://raw.githubusercontent.com/KickEngineering/KickDevDocs/main/getting-started/generating-tokens-oauth2-flow.md), [scopes](https://raw.githubusercontent.com/KickEngineering/KickDevDocs/main/scopes/scopes.md), [webhook security](https://raw.githubusercontent.com/KickEngineering/KickDevDocs/main/events/webhook-security.md), [event types](https://raw.githubusercontent.com/KickEngineering/KickDevDocs/main/events/event-types.md)
- [Twitch Helix](https://dev.twitch.tv/docs/api/reference/), [EventSub](https://dev.twitch.tv/docs/eventsub/handling-webhook-events/), [scopes](https://dev.twitch.tv/docs/authentication/scopes/)
- [TikTok Display](https://developers.tiktok.com/doc/display-api-overview/), [scopes](https://developers.tiktok.com/doc/tiktok-api-scopes/), [rate limits](https://developers.tiktok.com/doc/tiktok-api-v2-rate-limit/)
