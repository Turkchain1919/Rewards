# Yönetici kullanıcı bağlantı detayları — v0.5.4

Sunucu138.226.246.138. TEST /var/www/rewards.turkscan.com/REWARDSTEST; production /var/www/rewards.turkscan.com/rewards. Önceki canlı5074fb3. Kesin yayın SHA current/deploymentmanifest/Git ve .runtime/admin-user-details-v053/ raporundan doğrulanır (runtime klasör adı geçmiş çalışma adıdır).

## Ekran
AdminCenter → Kullanıcılar → Detayları görüntüle. Kullanıcı listesindeki adres sütunu artık Kayıtlı cüzdan / Registered wallet olarak adlandırılır. Detayda kayıtlıadres, profil/kayıttarihi, geçerlisiteoturumu sayısı/tarihleri/sonlogin, Telegramhesapbağı/sonbağlantı/kaldırma/tokenexpiry, sonTelegramgörevkontrolü ve isteğe bağlı güncelüyelik sorgusu vardır. Seçilen kullanıcıID'si yalnıztabsessionStorage'da tutulur; kimliktokenı veya kullanıcıdetayları burada saklanmaz. Yenileme/dil değişiminde aynıkullanıcı seçimi korunur; veriler her zaman yetkiliAPI'den gelir.

Cüzdan adresi kalıcı kullanıcı kaydıdır. GeçerliAuthSession, kullanıcının çevrimiçi olduğunu veya MetaMask'ın hâlâ bağlı olduğunu kanıtlamaz. Anlıkprovider bağlantısı sunucudanölçülmüyor olarak açıkça gösterilir. Bu sürüm otomatikwalletdisconnectlogout davranışı eklemez.

Telegramhesapbağı ile gruptakiüyelik ayrı alanlardır. Görevdoğrulamasınıngeçmiş sonucu MEMBER/NOT_MEMBER/RESULT_NOT_RECORDED ve zamanı gösterilir; bağlantısonradan değişti/kaldırıldıysa eski sonuçstale olarak etiketlenir. Üyelik sürekli izlenmez. Güncelkontrol yalnız seçilen resmî hedef için BotAPIgetChatMember okur; sonuçkontrolanınaaittir.

## API
GET /api/admin/users/:id/connection-details — OWNER/ADMIN ve MFAgerektirir; user/wallet/sessions/telegram/observedAt DTO döner. Token,cookie,AuthSessionID,credentialId,encryptedTokens,TelegramrawuserID döndürülmez. Sorgu veritabanını değiştirmez.
POST /api/admin/users/:id/telegram-membership-check — aynıRBAC/MFA + Origin + adminbaşına30/15dk limit. Bodyyalnız {targetId}; kişiselhesap canonicalID'si ve hedefaktif/CONNECTED TelegramGROUP/CHANNEL olması sunucuda doğrulanır. MEMBER,NOT_MEMBER,CONNECTION_REQUIRED,NOT_CONFIGURED,PROVIDER_UNAVAILABLE döner. Providerhatası üyedeğil/success diye gösterilmez. Sonuç için ADMIN_TELEGRAM_MEMBERSHIP_CHECK audit kaydı oluşur; resource userId:targetId:status. Ödül/submission/ledger veya kullanıcıbakiyesi yazılmaz. Silinmiş/olmayan kullanıcı/hedef404; izinsiz401/403; ekalanlıbody400.

## Dosyalar
apps/api/src/admin-user-details.ts — güvenli DTO, sonolaylar/oturumlar ve saltokumaBotkontrolü.
apps/api/src/management.ts — iki yeni yetkili endpoint.
apps/web/app/admin/user-details.tsx — detaypaneli, yükleniyor/hata/yenileme/kontrol.
apps/web/app/admin/modules.tsx — mevcutusers/details route ve kullanıcıseçimi.
apps/web/app/translations.json — TR/EN.
tests/admin-user-details.integration.test.ts — gerçekTESTDB/HTTP RBAC, secretsprojection, expiredsession, canonicalID, providerfailure, unlink/sessionlogout veledgerkoruması; BotAPIbaşarılı/başarısız cevapları mock'tur.
tests/browser-admin-user-details.e2e.mts — TR/EN1440/834/390 seçim/yenileme,readonlyPOST,unlinked/APIerror durumu,overflow ve ekran görüntüleri. Mevcut adminredesignfixture yeniDTO'ya uyarlandı.

## Korunanlar
Prismaşeması/migration, wallet/OAuth/SIWE,7günadminoturumu,MF A, görev/kampanya/ödülbütçeleri,claim/kontrat değişmez. REWARD_CLAIMS_PAUSED=true. Üyeliktençıkmak veya bağlantıyıkaldırmak geçmişödülü otomatikgerialmaz; detaykontrolü ödemevermez. Production deploy öncesiDBbackuprestoreprovası ve23tablohash kontrolü yapılır; Nginx/unit/dependency değişikliği gerekmez. GerçekAPIanahtarları dokümanda bulunmaz.
