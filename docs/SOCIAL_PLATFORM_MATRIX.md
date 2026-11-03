# Sosyal platform doğrulanabilirlik matrisi

## Canlı envanter düzeltmesi — 3 Kasım 2026, yayın sonrası doğrulama

11:28UTC envanterindeki3 kampanya/4 görev, yayından **önce**,12:29:00–12:29:18UTC (Türkiye15:29) arasında OWNER oturumundan silinmiştir. Audit kayıtlarında TASK_DELETE/CAMPAIGN_DELETE ve öncesinde OWNER MFA login vardır. Güncel yayın öncesi13:03UTC yedeğinde ve migration sonrasında **0 kampanya/0 görev** bulunur; eski sütun/row hashleri eşleşir. Silmeler bu deployment veya migration tarafından yapılmamıştır. İşlemi yapan gerçek kişi yalnız audit actoründen çıkarılamaz. Mevcut kullanıcı, ledger ve CONNECTED Telegram hesabı korunur. Yeni görev/kampanya oluşturulmamış, silinmiş kayıtlar geri yüklenmemiştir.

Aşağıdaki1TURK/25 kullanıcı/25TURK görevi referansları artık **tarihsel görev tanımıdır**, aktif canlı görev değildir. Görev motoru regression fixture'ları bu yapıyı test eder; güncel canlı panel doğru şekilde “Henüz yayınlanmış görev yok” gösterir. Yeni ödüllü görevin yayınlanması ayrı açık operatör işlemi gerektirir. Canlı kontrolün ilk denemesinde eski görevID'si bekleyen rapor scripti başarısız olmuştur; bu uygulama hatası değil, eski envanter varsayımıdır ve gizlenmeden raporlanır.


Kontrol tarihi2026-11-03; kaynak `apps/api/src/social-catalog.ts`. “Teknik” endpoint/webhook varlığını, “politika” ödüllü kullanım uygunluğunu gösterir. Endpoint bulunması izin değildir. Gerçek kimlik bilgisi ve appreview olmadan canlı bağlantı kanıtlanmış değildir. Meta Developer sayfaları429nedeniyle güncel kapsam doğrudan doğrulanamadı; aday endpointler kapalı tutuldu. Rate limitler provider/app/endpoint bazlıdır; ücretler burada sabit tahmin edilmez. Son kontrol tarihi doküman incelemesidir, canlı token test tarihi değildir.

Telegram mevcut authentic onboarding üyeliği korunur. Bot Developer Terms spam ve sosyal büyüme manipülasyonunu yasaklar; bu sınırlı destek tüm ödüllü büyüme senaryolarını izinli saymaz. Ürün harici web sitesidir, Telegram Mini App değildir. Yeni chat/forward/reaction/referral/poll görevleri kapalıdır.

## X_FOLLOW — Hesabı takip et / Follow account

| Alan | İncelenen durum |
|---|---|
| Platform | X |
| Açıklama TR | Hesabı takip et görevi için resmî API ve politika koşullarını kontrol edin. |
| Açıklama EN | Follow account. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /2/users/:id/following |
| Webhook | Yok |
| OAuth scopes | users.read, follows.read |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Pay-per-use; current developer console rates |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; no aggregate-count proof |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.x.com/x-api/posts/lookup/introduction |
| Resmî politika | https://help.x.com/en/rules-and-policies/authenticity |

## X_LIKE — Gönderiyi beğen / Like post

| Alan | İncelenen durum |
|---|---|
| Platform | X |
| Açıklama TR | Gönderiyi beğen görevi için resmî API ve politika koşullarını kontrol edin. |
| Açıklama EN | Like post. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /2/users/:id/liked_tweets |
| Webhook | Yok |
| OAuth scopes | tweet.read, users.read, like.read |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Pay-per-use; current developer console rates |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; no aggregate-count proof |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.x.com/x-api/posts/lookup/introduction |
| Resmî politika | https://help.x.com/en/rules-and-policies/authenticity |

## X_REPOST — Gönderiyi repost et / Repost post

| Alan | İncelenen durum |
|---|---|
| Platform | X |
| Açıklama TR | Gönderiyi repost et görevi için resmî API ve politika koşullarını kontrol edin. |
| Açıklama EN | Repost post. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /2/tweets/:id/retweeted_by |
| Webhook | Yok |
| OAuth scopes | tweet.read, users.read |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Pay-per-use; current developer console rates |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; no aggregate-count proof |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.x.com/x-api/posts/lookup/introduction |
| Resmî politika | https://help.x.com/en/rules-and-policies/authenticity |

## X_REPLY — Gönderiye yorum yaz / Reply to post

| Alan | İncelenen durum |
|---|---|
| Platform | X |
| Açıklama TR | Gönderiye yorum yaz görevi için resmî API ve politika koşullarını kontrol edin. |
| Açıklama EN | Reply to post. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /2/users/:id/tweets?tweet.fields=referenced_tweets |
| Webhook | Yok |
| OAuth scopes | tweet.read, users.read |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Pay-per-use; current developer console rates |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; no aggregate-count proof |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.x.com/x-api/posts/lookup/introduction |
| Resmî politika | https://help.x.com/en/rules-and-policies/authenticity |

## X_MENTION — Kullanıcı mention et / Mention user

| Alan | İncelenen durum |
|---|---|
| Platform | X |
| Açıklama TR | Kullanıcı mention et görevi için resmî API ve politika koşullarını kontrol edin. |
| Açıklama EN | Mention user. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /2/users/:id/tweets?tweet.fields=entities |
| Webhook | Yok |
| OAuth scopes | tweet.read, users.read |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Pay-per-use; current developer console rates |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; no aggregate-count proof |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.x.com/x-api/posts/lookup/introduction |
| Resmî politika | https://help.x.com/en/rules-and-policies/authenticity |

## X_HASHTAG_POST — Hashtag içeren gönderi oluştur / Create hashtag post

| Alan | İncelenen durum |
|---|---|
| Platform | X |
| Açıklama TR | Hashtag içeren gönderi oluştur görevi için resmî API ve politika koşullarını kontrol edin. |
| Açıklama EN | Create hashtag post. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /2/users/:id/tweets?tweet.fields=entities |
| Webhook | Yok |
| OAuth scopes | tweet.read, users.read |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Pay-per-use; current developer console rates |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; no aggregate-count proof |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.x.com/x-api/posts/lookup/introduction |
| Resmî politika | https://help.x.com/en/rules-and-policies/authenticity |

## X_QUOTE — Quote repost yap / Quote repost

| Alan | İncelenen durum |
|---|---|
| Platform | X |
| Açıklama TR | Quote repost yap görevi için resmî API ve politika koşullarını kontrol edin. |
| Açıklama EN | Quote repost. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /2/tweets/:id/quote_tweets |
| Webhook | Yok |
| OAuth scopes | tweet.read, users.read |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Pay-per-use; current developer console rates |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; no aggregate-count proof |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.x.com/x-api/posts/lookup/introduction |
| Resmî politika | https://help.x.com/en/rules-and-policies/authenticity |

## X_SPECIFIC_REPLY — Belirli gönderiye yanıt ver / Reply to specific post

| Alan | İncelenen durum |
|---|---|
| Platform | X |
| Açıklama TR | Belirli gönderiye yanıt ver görevi için resmî API ve politika koşullarını kontrol edin. |
| Açıklama EN | Reply to specific post. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /2/users/:id/tweets?tweet.fields=referenced_tweets |
| Webhook | Yok |
| OAuth scopes | tweet.read, users.read |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Pay-per-use; current developer console rates |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; no aggregate-count proof |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.x.com/x-api/posts/lookup/introduction |
| Resmî politika | https://help.x.com/en/rules-and-policies/authenticity |

## YOUTUBE_SUBSCRIBE — Kanala abone ol / Subscribe to channel

| Alan | İncelenen durum |
|---|---|
| Platform | YOUTUBE |
| Açıklama TR | YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Açıklama EN | Subscribe to channel. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /youtube/v3/subscriptions?mine=true&forChannelId=... |
| Webhook | Yok |
| OAuth scopes | https://www.googleapis.com/auth/youtube.readonly |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Daily project quota units and endpoint costs; inspect Google Cloud allocation |
| Güvenilirlik | Documented evidence with identity/target binding required; YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.google.com/youtube/v3/docs |
| Resmî politika | https://developers.google.com/youtube/terms/developer-policies |

## YOUTUBE_LIKE_VIDEO — Videoyu beğen / Like video

| Alan | İncelenen durum |
|---|---|
| Platform | YOUTUBE |
| Açıklama TR | YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Açıklama EN | Like video. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /youtube/v3/videos/getRating?id=... |
| Webhook | Yok |
| OAuth scopes | https://www.googleapis.com/auth/youtube.readonly |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Daily project quota units and endpoint costs; inspect Google Cloud allocation |
| Güvenilirlik | Documented evidence with identity/target binding required; YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.google.com/youtube/v3/docs |
| Resmî politika | https://developers.google.com/youtube/terms/developer-policies |

## YOUTUBE_COMMENT — Videoya yorum yaz / Comment on video

| Alan | İncelenen durum |
|---|---|
| Platform | YOUTUBE |
| Açıklama TR | YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Açıklama EN | Comment on video. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /youtube/v3/commentThreads?videoId=... |
| Webhook | Yok |
| OAuth scopes | https://www.googleapis.com/auth/youtube.readonly |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Daily project quota units and endpoint costs; inspect Google Cloud allocation |
| Güvenilirlik | Documented evidence with identity/target binding required; YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.google.com/youtube/v3/docs |
| Resmî politika | https://developers.google.com/youtube/terms/developer-policies |

## YOUTUBE_COMMENT_REPLY — Yoruma yanıt yaz / Reply to comment

| Alan | İncelenen durum |
|---|---|
| Platform | YOUTUBE |
| Açıklama TR | YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Açıklama EN | Reply to comment. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /youtube/v3/comments?parentId=... |
| Webhook | Yok |
| OAuth scopes | https://www.googleapis.com/auth/youtube.readonly |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Daily project quota units and endpoint costs; inspect Google Cloud allocation |
| Güvenilirlik | Documented evidence with identity/target binding required; YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.google.com/youtube/v3/docs |
| Resmî politika | https://developers.google.com/youtube/terms/developer-policies |

## YOUTUBE_WATCH — Video izle / Watch video

| Alan | İncelenen durum |
|---|---|
| Platform | YOUTUBE |
| Açıklama TR | YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Açıklama EN | Watch video. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | https://www.googleapis.com/auth/youtube.readonly |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Daily project quota units and endpoint costs; inspect Google Cloud allocation |
| Güvenilirlik | Documented evidence with identity/target binding required; YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.google.com/youtube/v3/docs |
| Resmî politika | https://developers.google.com/youtube/terms/developer-policies |

## YOUTUBE_LIVE_CHAT_JOIN — Canlı sohbetine katıl / Join live chat

| Alan | İncelenen durum |
|---|---|
| Platform | YOUTUBE |
| Açıklama TR | YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Açıklama EN | Join live chat. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | https://www.googleapis.com/auth/youtube.readonly |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Daily project quota units and endpoint costs; inspect Google Cloud allocation |
| Güvenilirlik | Documented evidence with identity/target binding required; YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.google.com/youtube/v3/docs |
| Resmî politika | https://developers.google.com/youtube/terms/developer-policies |

## YOUTUBE_LIVE_CHAT_MESSAGE — Canlı sohbette mesaj yaz / Send live chat message

| Alan | İncelenen durum |
|---|---|
| Platform | YOUTUBE |
| Açıklama TR | YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Açıklama EN | Send live chat message. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /youtube/v3/liveChat/messages?liveChatId=... |
| Webhook | Yok |
| OAuth scopes | https://www.googleapis.com/auth/youtube.readonly |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Daily project quota units and endpoint costs; inspect Google Cloud allocation |
| Güvenilirlik | Documented evidence with identity/target binding required; YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.google.com/youtube/v3/docs |
| Resmî politika | https://developers.google.com/youtube/terms/developer-policies |

## YOUTUBE_SHARE — Videoyu paylaş / Share video

| Alan | İncelenen durum |
|---|---|
| Platform | YOUTUBE |
| Açıklama TR | YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Açıklama EN | Share video. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | https://www.googleapis.com/auth/youtube.readonly |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Daily project quota units and endpoint costs; inspect Google Cloud allocation |
| Güvenilirlik | Documented evidence with identity/target binding required; YouTube Developer Policies III.E.4 kapsamında ödüllü etkileşim kapalıdır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.google.com/youtube/v3/docs |
| Resmî politika | https://developers.google.com/youtube/terms/developer-policies |

## INSTAGRAM_FOLLOW — Hesabı takip et / Follow account

| Alan | İncelenen durum |
|---|---|
| Platform | INSTAGRAM |
| Açıklama TR | Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Açıklama EN | Follow account. Restricted incentivized engagement; rewards disabled. |
| Endpoint | User Profile is_user_follow_business (eligible messaging context) |
| Webhook | Yok |
| OAuth scopes | instagram_business_manage_messages |
| Hesap türü | PROFESSIONAL_ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## INSTAGRAM_LIKE — Gönderiyi beğen / Like post

| Alan | İncelenen durum |
|---|---|
| Platform | INSTAGRAM |
| Açıklama TR | Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Açıklama EN | Like post. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | — |
| Hesap türü | PROFESSIONAL_ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## INSTAGRAM_COMMENT — Gönderiye yorum yap / Comment on post

| Alan | İncelenen durum |
|---|---|
| Platform | INSTAGRAM |
| Açıklama TR | Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Açıklama EN | Comment on post. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /:ig_media_id/comments |
| Webhook | Yok |
| OAuth scopes | instagram_business_manage_comments |
| Hesap türü | PROFESSIONAL_ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## INSTAGRAM_TAG_FRIEND — Yorumda arkadaş etiketle / Tag friend in comment

| Alan | İncelenen durum |
|---|---|
| Platform | INSTAGRAM |
| Açıklama TR | Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Açıklama EN | Tag friend in comment. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /:ig_media_id/comments |
| Webhook | Yok |
| OAuth scopes | instagram_business_manage_comments |
| Hesap türü | PROFESSIONAL_ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## INSTAGRAM_SHARE — Gönderiyi paylaş / Share post

| Alan | İncelenen durum |
|---|---|
| Platform | INSTAGRAM |
| Açıklama TR | Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Açıklama EN | Share post. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | — |
| Hesap türü | PROFESSIONAL_ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## INSTAGRAM_WATCH_REEL — Reels izle / Watch Reel

| Alan | İncelenen durum |
|---|---|
| Platform | INSTAGRAM |
| Açıklama TR | Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Açıklama EN | Watch Reel. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | — |
| Hesap türü | PROFESSIONAL_ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## INSTAGRAM_REEL_COMMENT — Reels yorum yap / Comment on Reel

| Alan | İncelenen durum |
|---|---|
| Platform | INSTAGRAM |
| Açıklama TR | Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Açıklama EN | Comment on Reel. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /:ig_media_id/comments |
| Webhook | Yok |
| OAuth scopes | instagram_business_manage_comments |
| Hesap türü | PROFESSIONAL_ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## INSTAGRAM_HASHTAG — Hashtag kullan / Use hashtag

| Alan | İncelenen durum |
|---|---|
| Platform | INSTAGRAM |
| Açıklama TR | Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Açıklama EN | Use hashtag. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /:ig_user_id/media?fields=id,caption |
| Webhook | Yok |
| OAuth scopes | instagram_business_basic |
| Hesap türü | PROFESSIONAL_ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## INSTAGRAM_MENTION — Hesabı mention et / Mention account

| Alan | İncelenen durum |
|---|---|
| Platform | INSTAGRAM |
| Açıklama TR | Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Açıklama EN | Mention account. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Mentions / tagged media; access-specific |
| Webhook | Yok |
| OAuth scopes | instagram_business_basic |
| Hesap türü | PROFESSIONAL_ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## INSTAGRAM_STORY_MENTION — Hikâyede mention et / Mention in Story

| Alan | İncelenen durum |
|---|---|
| Platform | INSTAGRAM |
| Açıklama TR | Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Açıklama EN | Mention in Story. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Messaging story_mention webhook |
| Webhook | Yok |
| OAuth scopes | instagram_business_manage_messages |
| Hesap türü | PROFESSIONAL_ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta dokümanlarına doğrudan erişim 429 nedeniyle sınırlı; izin ve politika doğrulanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## TELEGRAM_JOIN_GROUP — Gruba katıl / Join group

| Alan | İncelenen durum |
|---|---|
| Platform | TELEGRAM |
| Açıklama TR | Bot hedef grupta yönetici olmalı; aynı Telegram kimliğine görev başına bir ödül. |
| Açıklama EN | Join group. Requires the documented account, permissions and verified configuration. |
| Endpoint | Bot API getChatMember |
| Webhook | Yok |
| OAuth scopes | — |
| Hesap türü | GROUP |
| Bot / kullanıcı / yönetici bağlantısı | True / True / True |
| Teknik durum | VERIFIED_SUPPORTED |
| Katalog durum | VERIFIED_SUPPORTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | ALLOWED / True |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | No universal getChatMember quota published; honor 429 retry_after; outgoing message limits are separate |
| Güvenilirlik | Documented evidence with identity/target binding required; Bot hedef grupta yönetici olmalı; aynı Telegram kimliğine görev başına bir ödül. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://core.telegram.org/bots/api#getchatmember |
| Resmî politika | https://telegram.org/tos/bot-developers |

## TELEGRAM_JOIN_CHANNEL — Kanala katıl / Join channel

| Alan | İncelenen durum |
|---|---|
| Platform | TELEGRAM |
| Açıklama TR | Bot hedef kanalda yönetici olmalı; aynı Telegram kimliğine görev başına bir ödül. |
| Açıklama EN | Join channel. Requires the documented account, permissions and verified configuration. |
| Endpoint | Bot API getChatMember |
| Webhook | Yok |
| OAuth scopes | — |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | True / True / True |
| Teknik durum | VERIFIED_SUPPORTED |
| Katalog durum | VERIFIED_SUPPORTED |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | ALLOWED / True |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | No universal getChatMember quota published; honor 429 retry_after; outgoing message limits are separate |
| Güvenilirlik | Documented evidence with identity/target binding required; Bot hedef kanalda yönetici olmalı; aynı Telegram kimliğine görev başına bir ödül. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://core.telegram.org/bots/api#getchatmember |
| Resmî politika | https://telegram.org/tos/bot-developers |

## TELEGRAM_SEND_MESSAGE — Grupta mesaj gönder / Send group message

| Alan | İncelenen durum |
|---|---|
| Platform | TELEGRAM |
| Açıklama TR | Bot erişimi/privacy mode, hedef ve kullanıcı eşleştirmesi gerekir; spam teşvikine izin verilmez. |
| Açıklama EN | Send group message. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | message |
| OAuth scopes | — |
| Hesap türü | GROUP, CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | True / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | No universal getChatMember quota published; honor 429 retry_after; outgoing message limits are separate |
| Güvenilirlik | Documented evidence with identity/target binding required; Bot erişimi/privacy mode, hedef ve kullanıcı eşleştirmesi gerekir; spam teşvikine izin verilmez. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://core.telegram.org/bots/api |
| Resmî politika | https://telegram.org/tos/bot-developers |

## TELEGRAM_FORWARD_MESSAGE — Belirli mesajı ilet / Forward message

| Alan | İncelenen durum |
|---|---|
| Platform | TELEGRAM |
| Açıklama TR | Yalnız botun aldığı forward_origin kanıtı; dışarıdaki tüm iletimleri izleyen genel API yok. |
| Açıklama EN | Forward message. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | message.forward_origin |
| OAuth scopes | — |
| Hesap türü | GROUP, CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | True / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | No universal getChatMember quota published; honor 429 retry_after; outgoing message limits are separate |
| Güvenilirlik | Documented evidence with identity/target binding required; Yalnız botun aldığı forward_origin kanıtı; dışarıdaki tüm iletimleri izleyen genel API yok. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://core.telegram.org/bots/api |
| Resmî politika | https://telegram.org/tos/bot-developers |

## TELEGRAM_REACTION — Mesaja reaksiyon bırak / React to message

| Alan | İncelenen durum |
|---|---|
| Platform | TELEGRAM |
| Açıklama TR | Bot yönetici, allowed_updates gerekli; anonim aggregate reaction count kişisel kanıt değildir. |
| Açıklama EN | React to message. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | message_reaction |
| OAuth scopes | — |
| Hesap türü | GROUP, CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | True / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | No universal getChatMember quota published; honor 429 retry_after; outgoing message limits are separate |
| Güvenilirlik | Documented evidence with identity/target binding required; Bot yönetici, allowed_updates gerekli; anonim aggregate reaction count kişisel kanıt değildir. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://core.telegram.org/bots/api |
| Resmî politika | https://telegram.org/tos/bot-developers |

## TELEGRAM_BOT_INTERACTION — Bot ile etkileşim kur / Interact with bot

| Alan | İncelenen durum |
|---|---|
| Platform | TELEGRAM |
| Açıklama TR | İmzalı/secret-header doğrulamalı webhook ile tek kullanımlık, cüzdana ve Telegram kimliğine bağlı challenge. |
| Açıklama EN | Interact with bot. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | message /start challenge |
| OAuth scopes | — |
| Hesap türü | BOT |
| Bot / kullanıcı / yönetici bağlantısı | True / True / True |
| Teknik durum | VERIFIED_SUPPORTED |
| Katalog durum | VERIFIED_SUPPORTED |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | ALLOWED / True |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | No universal getChatMember quota published; honor 429 retry_after; outgoing message limits are separate |
| Güvenilirlik | Documented evidence with identity/target binding required; İmzalı/secret-header doğrulamalı webhook ile tek kullanımlık, cüzdana ve Telegram kimliğine bağlı challenge. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://core.telegram.org/bots/api |
| Resmî politika | https://telegram.org/tos/bot-developers |

## TELEGRAM_BOT_CODE — Bot üzerinden doğrulama kodu gönder / Send verification code to bot

| Alan | İncelenen durum |
|---|---|
| Platform | TELEGRAM |
| Açıklama TR | Tek kullanımlık challenge; kısa süreli; API yapılandırması ve webhook doğrulaması şart. |
| Açıklama EN | Send verification code to bot. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | message /start challenge |
| OAuth scopes | — |
| Hesap türü | BOT |
| Bot / kullanıcı / yönetici bağlantısı | True / True / True |
| Teknik durum | VERIFIED_SUPPORTED |
| Katalog durum | VERIFIED_SUPPORTED |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | ALLOWED / True |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | No universal getChatMember quota published; honor 429 retry_after; outgoing message limits are separate |
| Güvenilirlik | Documented evidence with identity/target binding required; Tek kullanımlık challenge; kısa süreli; API yapılandırması ve webhook doğrulaması şart. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://core.telegram.org/bots/api |
| Resmî politika | https://telegram.org/tos/bot-developers |

## TELEGRAM_INVITE — Davet bağlantısıyla arkadaş davet et / Invite friend

| Alan | İncelenen durum |
|---|---|
| Platform | TELEGRAM |
| Açıklama TR | Başvuru katılım değildir; özgün davet bağlama ve anti-Sybil olmadan ödül kapalı. |
| Açıklama EN | Invite friend. Requires the documented account, permissions and verified configuration. |
| Endpoint | Bot API createChatInviteLink |
| Webhook | chat_member / chat_join_request |
| OAuth scopes | — |
| Hesap türü | GROUP, CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | True / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | No universal getChatMember quota published; honor 429 retry_after; outgoing message limits are separate |
| Güvenilirlik | Documented evidence with identity/target binding required; Başvuru katılım değildir; özgün davet bağlama ve anti-Sybil olmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://core.telegram.org/bots/api |
| Resmî politika | https://telegram.org/tos/bot-developers |

## TELEGRAM_POLL — Ankete katıl / Answer poll

| Alan | İncelenen durum |
|---|---|
| Platform | TELEGRAM |
| Açıklama TR | Botun gönderdiği anonim olmayan ankette bireysel cevap; anonim anket kişiyi kanıtlamaz. |
| Açıklama EN | Answer poll. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | poll_answer |
| OAuth scopes | — |
| Hesap türü | GROUP, CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | True / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | No universal getChatMember quota published; honor 429 retry_after; outgoing message limits are separate |
| Güvenilirlik | Documented evidence with identity/target binding required; Botun gönderdiği anonim olmayan ankette bireysel cevap; anonim anket kişiyi kanıtlamaz. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://core.telegram.org/bots/api |
| Resmî politika | https://telegram.org/tos/bot-developers |

## FACEBOOK_FOLLOW_PAGE — Sayfayı takip et / Follow page

| Alan | İncelenen durum |
|---|---|
| Platform | FACEBOOK |
| Açıklama TR | Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Açıklama EN | Follow page. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | — |
| Hesap türü | PAGE |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/pages-api |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## FACEBOOK_LIKE_PAGE — Sayfayı beğen / Like page

| Alan | İncelenen durum |
|---|---|
| Platform | FACEBOOK |
| Açıklama TR | Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Açıklama EN | Like page. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /me/likes |
| Webhook | Yok |
| OAuth scopes | user_likes |
| Hesap türü | PAGE |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/pages-api |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## FACEBOOK_LIKE_POST — Gönderiyi beğen / Like post

| Alan | İncelenen durum |
|---|---|
| Platform | FACEBOOK |
| Açıklama TR | Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Açıklama EN | Like post. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /:post_id/reactions |
| Webhook | Yok |
| OAuth scopes | pages_read_engagement, pages_read_user_content |
| Hesap türü | PAGE |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/pages-api |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## FACEBOOK_COMMENT — Gönderiye yorum yap / Comment on post

| Alan | İncelenen durum |
|---|---|
| Platform | FACEBOOK |
| Açıklama TR | Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Açıklama EN | Comment on post. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /:post_id/comments |
| Webhook | Yok |
| OAuth scopes | pages_read_engagement, pages_read_user_content |
| Hesap türü | PAGE |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/pages-api |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## FACEBOOK_SHARE — Gönderiyi paylaş / Share post

| Alan | İncelenen durum |
|---|---|
| Platform | FACEBOOK |
| Açıklama TR | Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Açıklama EN | Share post. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /:post_id/sharedposts (limited visibility) |
| Webhook | Yok |
| OAuth scopes | pages_read_engagement |
| Hesap türü | PAGE |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/pages-api |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## FACEBOOK_TAG_FRIEND — Yorumda arkadaş etiketle / Tag friend in comment

| Alan | İncelenen durum |
|---|---|
| Platform | FACEBOOK |
| Açıklama TR | Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Açıklama EN | Tag friend in comment. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /:post_id/comments |
| Webhook | Yok |
| OAuth scopes | pages_read_user_content |
| Hesap türü | PAGE |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/pages-api |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## FACEBOOK_WATCH_VIDEO — Video izle / Watch video

| Alan | İncelenen durum |
|---|---|
| Platform | FACEBOOK |
| Açıklama TR | Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Açıklama EN | Watch video. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | — |
| Hesap türü | PAGE |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/pages-api |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## FACEBOOK_REELS — Reels etkileşimi / Reels engagement

| Alan | İncelenen durum |
|---|---|
| Platform | FACEBOOK |
| Açıklama TR | Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Açıklama EN | Reels engagement. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Aggregate insights only |
| Webhook | Yok |
| OAuth scopes | read_insights |
| Hesap türü | PAGE |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/pages-api |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## FACEBOOK_JOIN_GROUP — Gruba katıl / Join group

| Alan | İncelenen durum |
|---|---|
| Platform | FACEBOOK |
| Açıklama TR | Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Açıklama EN | Join group. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | — |
| Hesap türü | PAGE |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Meta erişim ve App Review şartları; aggregate sayaç / görünmeyen paylaşım kişisel kanıt değildir. Kısıtlı ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / False |
| Resmî API | https://developers.facebook.com/docs/pages-api |
| Resmî politika | https://transparency.meta.com/policies/community-standards/spam/ |

## KICK_FOLLOW — Kanalı takip et / Follow channel

| Alan | İncelenen durum |
|---|---|
| Platform | KICK |
| Açıklama TR | Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Açıklama EN | Follow channel. Restricted incentivized engagement; rewards disabled. |
| Endpoint | Yok |
| Webhook | channel.followed |
| OAuth scopes | events:subscribe |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.kick.com/events/event-types |
| Resmî politika | https://kick.com/community-guidelines |

## KICK_CHAT_MESSAGE — Canlı yayında mesaj gönder / Send live chat message

| Alan | İncelenen durum |
|---|---|
| Platform | KICK |
| Açıklama TR | Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Açıklama EN | Send live chat message. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | chat.message.sent |
| OAuth scopes | events:subscribe |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.kick.com/events/event-types |
| Resmî politika | https://kick.com/community-guidelines |

## KICK_CHAT_JOIN — Yayın sohbetine katıl / Join stream chat

| Alan | İncelenen durum |
|---|---|
| Platform | KICK |
| Açıklama TR | Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Açıklama EN | Join stream chat. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | events:subscribe |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | UNSUPPORTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.kick.com/events/event-types |
| Resmî politika | https://kick.com/community-guidelines |

## KICK_SUBSCRIBE — Kanala abone ol / Subscribe to channel

| Alan | İncelenen durum |
|---|---|
| Platform | KICK |
| Açıklama TR | Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Açıklama EN | Subscribe to channel. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | channel.subscription.new / channel.subscription.renewal |
| OAuth scopes | events:subscribe |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.kick.com/events/event-types |
| Resmî politika | https://kick.com/community-guidelines |

## KICK_INTERACTION — Yayın etkileşimi gerçekleştir / Perform stream interaction

| Alan | İncelenen durum |
|---|---|
| Platform | KICK |
| Açıklama TR | Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Açıklama EN | Perform stream interaction. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | events:subscribe |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | UNSUPPORTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.kick.com/events/event-types |
| Resmî politika | https://kick.com/community-guidelines |

## KICK_SPECIFIC_MESSAGE — Belirli mesajı gönder / Send specific chat message

| Alan | İncelenen durum |
|---|---|
| Platform | KICK |
| Açıklama TR | Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Açıklama EN | Send specific chat message. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | chat.message.sent |
| OAuth scopes | events:subscribe |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Provider endpoint/application/token quota; honor 429 and Retry-After, no universal rate assumed |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay etkileşim yasak; TURK teşvikine açık izin doğrulanmadığı için ödeme kapalı. Event geçmişi yalnız kurulumdan sonraki kanıttır. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://docs.kick.com/events/event-types |
| Resmî politika | https://kick.com/community-guidelines |

## TWITCH_FOLLOW — Kanalı takip et / Follow channel

| Alan | İncelenen durum |
|---|---|
| Platform | TWITCH |
| Açıklama TR | Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Açıklama EN | Follow channel. Restricted incentivized engagement; rewards disabled. |
| Endpoint | GET /helix/channels/followers |
| Webhook | channel.follow |
| OAuth scopes | moderator:read:followers |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | POLICY_RESTRICTED |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | RESTRICTED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Token bucket per client/user; read Ratelimit-Limit, Remaining and Reset; endpoint-specific costs |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/ |
| Resmî politika | https://help.twitch.tv/s/article/how-to-handle-view-follow-bots |

## TWITCH_SUBSCRIBE — Kanala abone ol / Subscribe to channel

| Alan | İncelenen durum |
|---|---|
| Platform | TWITCH |
| Açıklama TR | Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Açıklama EN | Subscribe to channel. Requires the documented account, permissions and verified configuration. |
| Endpoint | GET /helix/subscriptions/user |
| Webhook | channel.subscribe |
| OAuth scopes | user:read:subscriptions |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Token bucket per client/user; read Ratelimit-Limit, Remaining and Reset; endpoint-specific costs |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/ |
| Resmî politika | https://help.twitch.tv/s/article/how-to-handle-view-follow-bots |

## TWITCH_CHAT_MESSAGE — Canlı yayında mesaj gönder / Send live chat message

| Alan | İncelenen durum |
|---|---|
| Platform | TWITCH |
| Açıklama TR | Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Açıklama EN | Send live chat message. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | channel.chat.message |
| OAuth scopes | user:read:chat |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Token bucket per client/user; read Ratelimit-Limit, Remaining and Reset; endpoint-specific costs |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/ |
| Resmî politika | https://help.twitch.tv/s/article/how-to-handle-view-follow-bots |

## TWITCH_CHAT_COMMAND — Belirli sohbet komutunu kullan / Use chat command

| Alan | İncelenen durum |
|---|---|
| Platform | TWITCH |
| Açıklama TR | Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Açıklama EN | Use chat command. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | channel.chat.message |
| OAuth scopes | user:read:chat |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Token bucket per client/user; read Ratelimit-Limit, Remaining and Reset; endpoint-specific costs |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/ |
| Resmî politika | https://help.twitch.tv/s/article/how-to-handle-view-follow-bots |

## TWITCH_INTERACTION — Yayın sırasında etkileşim / Interact during stream

| Alan | İncelenen durum |
|---|---|
| Platform | TWITCH |
| Açıklama TR | Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Açıklama EN | Interact during stream. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | — |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | UNSUPPORTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Token bucket per client/user; read Ratelimit-Limit, Remaining and Reset; endpoint-specific costs |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/ |
| Resmî politika | https://help.twitch.tv/s/article/how-to-handle-view-follow-bots |

## TWITCH_CHANNEL_POINTS — Kanal puanı ödülü kullan / Redeem channel point reward

| Alan | İncelenen durum |
|---|---|
| Platform | TWITCH |
| Açıklama TR | Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Açıklama EN | Redeem channel point reward. Requires the documented account, permissions and verified configuration. |
| Endpoint | GET /helix/channel_points/custom_rewards/redemptions |
| Webhook | channel.channel_points_custom_reward_redemption.add |
| OAuth scopes | channel:read:redemptions |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Token bucket per client/user; read Ratelimit-Limit, Remaining and Reset; endpoint-specific costs |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/ |
| Resmî politika | https://help.twitch.tv/s/article/how-to-handle-view-follow-bots |

## TWITCH_RAID — Raid katılımını doğrula / Verify raid participation

| Alan | İncelenen durum |
|---|---|
| Platform | TWITCH |
| Açıklama TR | Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Açıklama EN | Verify raid participation. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | channel.raid (broadcaster only) |
| OAuth scopes | — |
| Hesap türü | CHANNEL |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | UNSUPPORTED |
| Otomatik / webhook / manuel | False / True / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | Token bucket per client/user; read Ratelimit-Limit, Remaining and Reset; endpoint-specific costs |
| Güvenilirlik | Documented evidence with identity/target binding required; Yapay kanal istatistiği yasak; TURK ödüllendirme izni doğrulanmadı, kapalı. Raid olayı bireysel izleyici listesini kanıtlamaz. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/ |
| Resmî politika | https://help.twitch.tv/s/article/how-to-handle-view-follow-bots |

## TIKTOK_FOLLOW — Hesabı takip et / Follow account

| Alan | İncelenen durum |
|---|---|
| Platform | TIKTOK |
| Açıklama TR | Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Açıklama EN | Follow account. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | user.info.basic |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | UNSUPPORTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | 600 requests/minute per endpoint for user/info, video/query and video/list (default; provider may vary) |
| Güvenilirlik | Documented evidence with identity/target binding required; Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.tiktok.com/doc/display-api-overview/ |
| Resmî politika | https://www.tiktok.com/community-guidelines/en/integrity-authenticity |

## TIKTOK_LIKE — Videoyu beğen / Like video

| Alan | İncelenen durum |
|---|---|
| Platform | TIKTOK |
| Açıklama TR | Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Açıklama EN | Like video. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | user.info.basic |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | UNSUPPORTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | 600 requests/minute per endpoint for user/info, video/query and video/list (default; provider may vary) |
| Güvenilirlik | Documented evidence with identity/target binding required; Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.tiktok.com/doc/display-api-overview/ |
| Resmî politika | https://www.tiktok.com/community-guidelines/en/integrity-authenticity |

## TIKTOK_COMMENT — Videoya yorum yap / Comment on video

| Alan | İncelenen durum |
|---|---|
| Platform | TIKTOK |
| Açıklama TR | Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Açıklama EN | Comment on video. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | user.info.basic |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | UNSUPPORTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | 600 requests/minute per endpoint for user/info, video/query and video/list (default; provider may vary) |
| Güvenilirlik | Documented evidence with identity/target binding required; Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.tiktok.com/doc/display-api-overview/ |
| Resmî politika | https://www.tiktok.com/community-guidelines/en/integrity-authenticity |

## TIKTOK_TAG_FRIEND — Yorumda arkadaş etiketle / Tag friend in comment

| Alan | İncelenen durum |
|---|---|
| Platform | TIKTOK |
| Açıklama TR | Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Açıklama EN | Tag friend in comment. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | user.info.basic |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | UNSUPPORTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | 600 requests/minute per endpoint for user/info, video/query and video/list (default; provider may vary) |
| Güvenilirlik | Documented evidence with identity/target binding required; Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.tiktok.com/doc/display-api-overview/ |
| Resmî politika | https://www.tiktok.com/community-guidelines/en/integrity-authenticity |

## TIKTOK_SHARE — Videoyu paylaş / Share video

| Alan | İncelenen durum |
|---|---|
| Platform | TIKTOK |
| Açıklama TR | Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Açıklama EN | Share video. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | user.info.basic |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | UNSUPPORTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | 600 requests/minute per endpoint for user/info, video/query and video/list (default; provider may vary) |
| Güvenilirlik | Documented evidence with identity/target binding required; Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.tiktok.com/doc/display-api-overview/ |
| Resmî politika | https://www.tiktok.com/community-guidelines/en/integrity-authenticity |

## TIKTOK_WATCH — Video izle / Watch video

| Alan | İncelenen durum |
|---|---|
| Platform | TIKTOK |
| Açıklama TR | Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Açıklama EN | Watch video. Requires the documented account, permissions and verified configuration. |
| Endpoint | Yok |
| Webhook | Yok |
| OAuth scopes | user.info.basic |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | UNSUPPORTED |
| Katalog durum | UNSUPPORTED |
| Otomatik / webhook / manuel | False / False / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | 600 requests/minute per endpoint for user/info, video/query and video/list (default; provider may vary) |
| Güvenilirlik | Documented evidence with identity/target binding required; Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.tiktok.com/doc/display-api-overview/ |
| Resmî politika | https://www.tiktok.com/community-guidelines/en/integrity-authenticity |

## TIKTOK_HASHTAG_VIDEO — Hashtag ile video yayınla / Publish hashtag video

| Alan | İncelenen durum |
|---|---|
| Platform | TIKTOK |
| Açıklama TR | Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Açıklama EN | Publish hashtag video. Requires the documented account, permissions and verified configuration. |
| Endpoint | POST /v2/video/query/ (authorized own videos) |
| Webhook | Yok |
| OAuth scopes | video.list |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | 600 requests/minute per endpoint for user/info, video/query and video/list (default; provider may vary) |
| Güvenilirlik | Documented evidence with identity/target binding required; Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.tiktok.com/doc/display-api-overview/ |
| Resmî politika | https://www.tiktok.com/community-guidelines/en/integrity-authenticity |

## TIKTOK_MENTION — Hesabı mention et / Mention account

| Alan | İncelenen durum |
|---|---|
| Platform | TIKTOK |
| Açıklama TR | Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Açıklama EN | Mention account. Requires the documented account, permissions and verified configuration. |
| Endpoint | POST /v2/video/query/ (authorized own videos) |
| Webhook | Yok |
| OAuth scopes | video.list |
| Hesap türü | ACCOUNT |
| Bot / kullanıcı / yönetici bağlantısı | False / True / True |
| Teknik durum | SUPPORTED_REQUIRES_PERMISSION |
| Katalog durum | SUPPORTED_REQUIRES_PERMISSION |
| Otomatik / webhook / manuel | True / False / False |
| Politika / ödül açık | REVIEW_REQUIRED / False |
| Ücret | Quota / provider terms; no fixed fee assumed |
| Rate limit | 600 requests/minute per endpoint for user/info, video/query and video/list (default; provider may vary) |
| Güvenilirlik | Documented evidence with identity/target binding required; Display API profil/kendi video metadatası sağlar; genel ticari etkileşim ispatı değildir. Research API kullanılmaz; politika incelemesi tamamlanmadan ödül kapalı. |
| Son kontrol / doğrudan kaynak erişimi | 2026-11-03 / True |
| Resmî API | https://developers.tiktok.com/doc/display-api-overview/ |
| Resmî politika | https://www.tiktok.com/community-guidelines/en/integrity-authenticity |

