# API referansı — doğrulanmış endpoint envanteri

> Güncel yönetici geliştirmesi: [ADMIN_REWARD_LIMITS.md](ADMIN_REWARD_LIMITS.md). Yayınlanmış görevlerde ödül/kontenjan/tarih ve ortak bütçe onayla değiştirilebilir; kayıtlar korunur, görev pasife alınır. Bu özellik mevcut canlı Telegram1/25/25 ayarlarını kendiliğinden değiştirmez.

> **2026-11-03 güncel çalışma:** Önceki 10 TURK taslağı yerine kullanıcı 1 TURK × ilk25 kullanıcı / toplam25TURK ve TEST sonrası productionyayınını onayladı. Güncel plan ve doğrulama koşulları [REWARD25_RELEASE_READINESS](REWARD25_RELEASE_READINESS.md), tam payload [TELEGRAM_REWARD25_TASK.json](TELEGRAM_REWARD25_TASK.json), Instagram açıklaması [INSTAGRAM_READINESS](INSTAGRAM_READINESS.md). Aşağıdaki bilgiler önceki snapshot olabilir; çalışanSHA ve gerçekyayınsonucu dış PROJECT_HANDOFF.md/deploymentmanifest esas alınarak doğrulanır.

Doğrulama anı: 2026-11-02T22:34:00.042Z. Production sürümü: **0.4.5 / `cc61b966bf684ad2f602b36100c3bf1de7f4d0a7`**. Bu doküman TEST dalında hazırlanmıştır; bu çalışmada production kodu/verisi/configuration değiştirilmez. Yollar sunucu `138.226.246.138` üzerindedir. Gerçek ENV/credential değerleri açıklanmaz.

Kaynak decoratorlarından çıkarılmış **108 HTTP method/path** aşağıdadır; yeni Chat ID kontrolü mevcut endpoint şemasını daraltır, yeni endpoint eklemez. Backend prefix Nginx üzerinden `/api`; controllerlar `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src` altındadır. OpenAPI/Swagger endpointi veya ayrı Next app/api route klasörü yoktur.

## Ortak protokol ve güvenlik

JSON body strict Zod şemaları; origin mutasyonlarda tam APP_URL origin eşleşmesi ister. GET OAuth callback özel browser/state/session bağlama denetimidir. Cookie HttpOnly, production Secure; OAuth binder SameSite=Lax, diğer auth cookie Strict. Cookie adları rewards_test_/rewards_production_ namespace'lerinde; ham session token DB'de tutulmaz. Rate limits Redis'te 900sn bucket; task-submit20 ve Telegram verify10/user, wallet/admin/OAuth bucketları source'dadır.

Genellikle GET/PUT/PATCH/DELETE HTTP200, POST Nest default201; explicit redirect303, image200, schema400, auth401, role/MFA/origin403, state/budget/concurrency409, rate429, unavailable503; unexpected error500 sanitized. Hero upload explicit201. Provider errors token/secret döndürmemelidir. Prisma Decimal JSON tutarları string; tüm amount/reward/budget integer wei stringidir, display TURK18decimals.

Yeni invalid GROUP/CHANNEL hedef örneği (yalnız TEST kodunda):

```json
{"statusCode":400,"code":"VALIDATION_ERROR","message":"Invalid request fields","errors":[{"field":"accountId","message":"Telegram GROUP/CHANNEL Chat ID must be a negative numeric string (for example -1003676977941) or a valid @username."}]}
```

Admin UI bu metni TR/EN gösterir. Server wire message İngilizce sabittir; istemci locale çevirir. Backend ve UI negatif stringi değiştirmez. Empty metadata draft accountId geçmiş uyumluluk için halen kabul edilir; CONNECTED için gerçek Bot API şarttır. Kişisel Telegram user ID'leri pozitif kalabilir.

## Endpointler


### OfficialAccountsController

| Method | Route | Yetki | İstek | Yanıt / yan etki | Kaynak |
|---|---|---|---|---|---|
| GET | `/api/admin/social-platforms` | OWNER/ADMIN+MFA | — | SocialPlatform registry listesi | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:169` |
| POST | `/api/admin/social-platforms` | OWNER/ADMIN+MFA | key uppercase,name | ok; connector METADATA_ONLY | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:170` |
| GET | `/api/admin/official-accounts` | OWNER/ADMIN+MFA | — | OfficialSocialAccount + hasCredential; ciphertext yok | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:171` |
| POST | `/api/admin/official-accounts` | OWNER/ADMIN+MFA | officialInput | resmî hesap; TASK veya ödül oluşturmaz | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:172` |
| PUT | `/api/admin/official-accounts/:id` | OWNER/ADMIN+MFA | officialInput; path id | resmî hesap/version; disabled ise bağlı tasks pause olabilir | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:173` |
| POST | `/api/admin/official-accounts/import-env` | OWNER/ADMIN+MFA | — | ok; environment metadata import/upsert | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:174` |
| POST | `/api/admin/official-accounts/:id/default` | OWNER/ADMIN+MFA | path id | ok; platform default tekleştirme | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:175` |
| POST | `/api/admin/official-accounts/:id/disconnect` | OWNER/ADMIN+MFA | path id | ok/providerRevocationRequired/dependentTasksPaused | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:176` |
| DELETE | `/api/admin/official-accounts/:id` | OWNER/ADMIN+MFA | path id | disconnect+deletedAt soft remove; tasks pause | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:177` |
| GET | `/api/admin/official-accounts/:id/connection-options` | OWNER/ADMIN+MFA | path id | Rediste seçilmiş authorized hedef metadata listesi | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:178` |
| POST | `/api/admin/official-accounts/:id/select-target` | OWNER/ADMIN+MFA | accountId | ok veya selectionRequired; authorized seçenek kontrolü | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:179` |
| POST | `/api/admin/official-accounts/:id/connect` | OWNER/ADMIN+MFA | path id | Telegram GROUP/CHANNEL verified connected veya diğer OAuth url | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:180` |
| POST | `/api/admin/official-accounts/:id/refresh` | OWNER/ADMIN+MFA | path id | ok/expiresAt veya reconnect hatası | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:191` |
| POST | `/api/admin/official-accounts/:id/test` | OWNER/ADMIN+MFA | path id | status/error; lastError/lastSuccessAt günceller | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:192` |
| GET | `/api/admin/social-connections` | OWNER/ADMIN+MFA | — | kişisel provider kimlik/scope/expiry/error metadata; token yok | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/official-accounts.ts:197` |

### SocialController

| Method | Route | Yetki | İstek | Yanıt / yan etki | Kaynak |
|---|---|---|---|---|---|
| GET | `/api/social/accounts` | USER session | — | platform effective config + kişinin account metadata | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/social.ts:16` |
| GET | `/api/oauth/accounts` | USER session | — | platform effective config + kişinin account metadata | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/social.ts:16` |
| POST | `/api/social/:provider/connect` | USER session | path provider | url + binder cookie; state/PKCE/nonce TTL300 | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/social.ts:21` |
| POST | `/api/oauth/:provider/connect` | USER session | path provider | url + binder cookie; state/PKCE/nonce TTL300 | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/social.ts:21` |
| GET | `/api/social/:provider/callback` | State+binder+session/generation; official mode MFA/RBAC | query state,code? veya error?; binder cookie | 303 dashboard/admin?social=connected/denied/error/select_target | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/social.ts:29` |
| GET | `/api/oauth/:provider/callback` | State+binder+session/generation; official mode MFA/RBAC | query state,code? veya error?; binder cookie | 303 dashboard/admin?social=connected/denied/error/select_target | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/social.ts:29` |
| DELETE | `/api/social/:provider` | USER session | path provider | ok/providerRevocationRequired; generation++/token revoke | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/social.ts:67` |
| DELETE | `/api/oauth/:provider` | USER session | path provider | ok/providerRevocationRequired; generation++/token revoke | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/social.ts:67` |

### UserAuthController

| Method | Route | Yetki | İstek | Yanıt / yan etki | Kaynak |
|---|---|---|---|---|---|
| POST | `/api/auth/challenge` | Public+origin/rate/challenge | address, networkKey? | message; challenge HttpOnly cookie, Redis TTL300 | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:56` |
| POST | `/api/auth/verify` | Public+origin/rate/challenge | signature; challenge cookie | id/wallet; user session cookie | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:65` |
| GET | `/api/auth/me` | USER session | — | id/wallet/displayName/createdAt | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:77` |
| POST | `/api/auth/profile` | USER session | displayName (1..60) | ok; User.displayName update | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:78` |
| POST | `/api/auth/logout` | Cookie varsa+origin | user cookie varsa | ok; session/cookie kaldırma | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:79` |

### AdminAuthController

| Method | Route | Yetki | İstek | Yanıt / yan etki | Kaynak |
|---|---|---|---|---|---|
| GET | `/api/admin/setup-status` | Public; count only | — | setupRequired boolean | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:84` |
| POST | `/api/admin/bootstrap` | Public; bootstrap token+one-time | token,email,password (14..128) | id/email/mfaRequired; ilk OWNER tek seferlik | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:85` |
| POST | `/api/admin/login` | Public; parola+rate limit | email/password | mfaRequired/enrollmentRequired; premfa cookie | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:99` |
| POST | `/api/admin/mfa/enroll` | Admin session (premfa izinli); verify TOTP | premfa session | secret/otpauth uri; yalnız enroll yanıtı, loglanmamalı | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:108` |
| POST | `/api/admin/mfa/verify` | Admin session (premfa izinli); verify TOTP | code 6 digit | ok; MFA-verified session cookie | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:116` |
| GET | `/api/admin/me` | Admin session (premfa izinli); verify TOTP | admin cookie | id/email/role/mfaVerified/enrolled | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:129` |
| GET | `/api/admin/sessions` | OWNER/ADMIN/REVIEWER+MFA | — | kişinin id/createdAt/expiresAt/current oturum listesi | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:130` |
| DELETE | `/api/admin/sessions/:id` | OWNER/ADMIN/REVIEWER+MFA | path session id | ok; yalnız kendi session kaydı | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:131` |
| POST | `/api/admin/logout` | Cookie varsa+origin | cookie varsa | ok; session/cookie kaldırma | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:132` |
| POST | `/api/admin/password` | OWNER/ADMIN/REVIEWER+MFA | currentPassword/newPassword | ok; tüm eski sessionları iptal eder, yeni cookie | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:133` |
| PATCH | `/api/admin/accounts/:id` | OWNER+MFA | role ADMIN/REVIEWER,enabled | ok; OWNER/kendi hesabını değiştiremez | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:141` |
| GET | `/api/admin/accounts` | OWNER+MFA | — | id/email/role/enabled/createdAt listesi | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:148` |
| POST | `/api/admin/accounts` | OWNER+MFA | email/password/role ADMIN veya REVIEWER | id/email/role | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/auth.ts:149` |

### HeroMediaController

| Method | Route | Yetki | İstek | Yanıt / yan etki | Kaynak |
|---|---|---|---|---|---|
| GET | `/api/hero` | Public | — | url:null veya url,width,height,size,updatedAt | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/hero-media.ts:27` |
| GET | `/api/hero/:sha` | Public | path sha256 | image/gif bytes, ETag/cache headers; max server validated upload | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/hero-media.ts:28` |
| GET | `/api/admin/system/hero` | OWNER+MFA | — | exists/dimensions/frameCount/enabled/published/sha256; bytes yok | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/hero-media.ts:29` |
| POST | `/api/admin/system/hero` | OWNER+MFA +step-up | Content-Type:image/gif raw binary; x-mfa-code? | uploaded metadata; max5MiB/1200px/frame sınırları | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/hero-media.ts:30` |
| POST | `/api/admin/system/hero/state` | OWNER+MFA +step-up | enabled boolean,published=true; x-mfa-code? | enabled/published | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/hero-media.ts:42` |
| DELETE | `/api/admin/system/hero` | OWNER+MFA +step-up | x-mfa-code? | restoredDefault:true; yalnız homepage GIF kaldırma | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/hero-media.ts:43` |

### MissionController

| Method | Route | Yetki | İstek | Yanıt / yan etki | Kaynak |
|---|---|---|---|---|---|
| GET | `/api/official-accounts` | Public | — | enabled resmî hesap public metadata listesi | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:13` |
| GET | `/api/tasks` | Public | query network? | yayında/available/policy+bot-config filtreli görev listesi | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:14` |
| POST | `/api/tasks/:id/submit` | OWNER/ADMIN+MFA | proof 20..2000; network? | existing veya yeni Submission+reward; manuel kanıt kuralları | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:15` |
| POST | `/api/tasks/:id/verify-telegram` | OWNER/ADMIN+MFA | path task id; network?; amount alınmaz | verified/alreadyProcessed/status/reward/ledgerStatus | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:16` |
| GET | `/api/me/tasks` | OWNER/ADMIN+MFA | query network? | repeatable=false/userStatus/available/history + task content | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:17` |
| GET | `/api/me/history` | OWNER/ADMIN+MFA | query network? | max100 Submission + task title/reward | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:18` |
| GET | `/api/me/ledger` | OWNER/ADMIN+MFA | query network? | balances(status→integer string), entries+events max100 | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:19` |

### ManagementController

| Method | Route | Yetki | İstek | Yanıt / yan etki | Kaynak |
|---|---|---|---|---|---|
| GET | `/api/admin/summary` | OWNER/ADMIN+MFA | — | users/campaigns/tasks/pending/rewards | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:25` |
| GET | `/api/admin/users` | OWNER/ADMIN+MFA | — | id/wallet/displayName/createdAt/counts max100 | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:26` |
| GET | `/api/admin/campaigns` | OWNER/ADMIN+MFA | — | Campaign+tasks max100; archived dahil | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:27` |
| POST | `/api/admin/campaigns` | OWNER/ADMIN+MFA | campaignInput | Campaign; audit CREATE | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:28` |
| PUT | `/api/admin/campaigns/:id` | OWNER/ADMIN+MFA | campaignInput; path id | Campaign; committed budget altına inemez | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:29` |
| GET | `/api/admin/campaigns/:id/impact` | OWNER/ADMIN+MFA | path id | name/status/tasks/participations/pending/verified/rewards/verificationAttempts/canDelete/action/willPause | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:30` |
| DELETE | `/api/admin/campaigns/:id` | OWNER/ADMIN+MFA | confirmId=path id | deleted veya archived; alreadyDeleted/alreadyArchived tekrar koruması | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:31` |
| POST | `/api/admin/campaigns/:id/:action` | OWNER/ADMIN+MFA | action publish/pause/archive | Campaign veya archive sonucu; ACTIVE doğrulama | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:32` |
| POST | `/api/admin/tasks` | OWNER/ADMIN+MFA | taskInput | Task; default draft/disabled | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:33` |
| PATCH | `/api/admin/tasks/:id/content` | OWNER/ADMIN+MFA | title,localizedContent,startsAt nullable,endsAt nullable | Task; ekonomik/verification alanı kabul etmez | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:34` |
| PUT | `/api/admin/tasks/:id` | OWNER/ADMIN+MFA | taskInput; path id | Task; yayımlanmış/kullanılmış ekonomik edit reddi | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:35` |
| GET | `/api/admin/tasks/:id/impact` | OWNER/ADMIN+MFA | path id | name/campaignName/participations/verificationAttempts/rewards/canDelete/action | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:36` |
| DELETE | `/api/admin/tasks/:id` | OWNER/ADMIN+MFA | confirmId=path id | deleted veya archived; idempotent result | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:37` |
| POST | `/api/admin/tasks/:id/:action` | OWNER/ADMIN+MFA | action publish/pause/archive | Task veya archive sonucu; policy/target/budget kontrolü | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:38` |
| GET | `/api/admin/submissions` | OWNER/ADMIN/REVIEWER+MFA | — | Submission+wallet/task/reward listesi max100 | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:39` |
| POST | `/api/admin/submissions/:id/review` | OWNER/ADMIN/REVIEWER+MFA | action APPROVE/REJECT,note 5..1000 | resolved Submission; ledger ve bütçe transaction | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:40` |
| GET | `/api/admin/ledger` | OWNER/ADMIN+MFA | — | network balances + ledger entries/events max100 | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:41` |
| GET | `/api/admin/integrations` | OWNER/ADMIN+MFA | — | IntegrationSettings etkili maskeli platform durumu | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:42` |
| POST | `/api/admin/social-api/:platform` | OWNER+MFA+step-up | credentials allowed fields,redirectUri,enabled,mode,graphVersion?,version?,mfaCode? | güvenli configuration sonucu; secret geri dönmez | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:43` |
| PATCH | `/api/admin/integrations/:platform` | OWNER/ADMIN+MFA | settingInput: version,disabled,name/profileUrl/accountId/defaultTargetUrl nullable,callbackUrl?,enabledOverride?,graphVersion? | effective ayar/version; audit | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:49` |
| POST | `/api/admin/integrations/:platform/test` | OWNER/ADMIN+MFA | path platform | status/error/retry metadata; provider test state kaydeder | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:50` |
| GET | `/api/admin/claims` | OWNER/ADMIN+MFA | — | ClaimAuthorization güvenli alanlar max100 | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:51` |
| GET | `/api/admin/audit` | OWNER/ADMIN+MFA | — | AuditEvent max100 desc; before/after payload yok | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:52` |
| GET | `/api/admin/system` | OWNER/ADMIN+MFA | — | health/release/network/claimsPaused | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/management.ts:53` |

### OAuthLifecycleController

| Method | Route | Yetki | İstek | Yanıt / yan etki | Kaynak |
|---|---|---|---|---|---|
| POST | `/api/social/:provider/refresh` | USER session | path provider | ok/expiresAt; lock/cooldown ve identity recheck | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/oauth-lifecycle.ts:93` |

### ClaimController

| Method | Route | Yetki | İstek | Yanıt / yan etki | Kaynak |
|---|---|---|---|---|---|
| GET | `/api/claims` | USER session | — | güvenli claim authorization listesi; kişiye ait | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/claims.ts:132` |
| POST | `/api/claims/prepare` | USER session | —; reward amount istemciden alınmaz | id/domain/types/message/signature/transaction; mevcut pause ile503 | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/claims.ts:133` |
| POST | `/api/claims/:id/transaction` | USER session | transactionHash 32byte hex | SUBMITTED/CONFIRMED receipt sonucu; ownership | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/claims.ts:134` |
| POST | `/api/claims/:id/refresh` | USER session | path id | status/confirmations/transactionHash; ownership | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/claims.ts:135` |
| POST | `/api/claims/:id/expire` | USER session | path id | status EXPIRED veya mevcut; güvenli chain expiry/unused nonce | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/claims.ts:136` |

### ConfigurationController

| Method | Route | Yetki | İstek | Yanıt / yan etki | Kaynak |
|---|---|---|---|---|---|
| GET | `/api/admin/settings/blockchains` | OWNER+MFA | — | BlockchainNetwork listesi | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:13` |
| POST | `/api/admin/settings/blockchains` | OWNER+MFA | networkInput | disabled yeni network; single-chain lock uygulanır | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:14` |
| PUT | `/api/admin/settings/blockchains/:id` | OWNER+MFA | config:networkInput,version | version guarded network | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:15` |
| POST | `/api/admin/settings/blockchains/:id/enable` | OWNER+MFA | path id | ok; RPC verify, installation chain eşleşme | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:16` |
| POST | `/api/admin/settings/blockchains/:id/disable` | OWNER+MFA | path id | ok; aktif ağ disable reddi | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:17` |
| DELETE | `/api/admin/settings/blockchains/:id` | OWNER+MFA | path id | ok; active/enabled/used network silinmez | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:18` |
| POST | `/api/admin/settings/blockchains/:id/test/:kind` | OWNER+MFA | kind rpc/wss/explorer/contract | verification sonucu; DB audit/verification yazar | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:19` |
| POST | `/api/admin/settings/blockchains/:id/activate` | OWNER+MFA +fresh TOTP | confirmation="ACTIVATE networkKey",mfaCode | ok/claimsPaused:true; fresh MFA ve chain lock | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:26` |
| GET | `/api/admin/settings/branding` | OWNER+MFA | — | BrandingConfig | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:32` |
| PUT | `/api/admin/settings/branding` | OWNER+MFA | brandingInput | ok/version | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:33` |
| GET | `/api/admin/settings/effective` | OWNER+MFA | — | selected network/runtime/branding + credential metadata | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:34` |
| POST | `/api/admin/settings/runtime` | OWNER+MFA | multiChainEnabled:false,claimsPaused:true | ok/version; gerçek ödeme açma kabul edilmez | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:35` |
| POST | `/api/admin/settings/env/validate` | OWNER+MFA | — | valid/networkKey/chainId/brandingName/privateValuesIncluded:false | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:36` |
| POST | `/api/admin/settings/env/import` | OWNER+MFA | section network veya branding | saved config; mevcut DB kaydına yazabilir | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:37` |
| GET | `/api/admin/settings/env/template` | OWNER+MFA | — | text/plain .env.example download; gerçek .env değil | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:43` |
| POST | `/api/admin/settings/reload` | OWNER+MFA | — | ok + configurationSource/restart metadata; Redis publish | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:44` |
| GET | `/api/admin/settings/history` | OWNER+MFA | — | configuration/network/integration/credential audit listesi | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:45` |
| GET | `/api/admin/settings/credentials` | OWNER+MFA | — | id/scope/ownerId/kind/version/revokedAt/updatedAt; secret yok | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:46` |
| POST | `/api/admin/settings/credentials` | OWNER+MFA +step-up | scope,ownerId,kind,value,mfaCode? | safe credential id/version metadata; encrypt at rest | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:47` |
| DELETE | `/api/admin/settings/credentials/:id` | OWNER+MFA | path id | ok veya account disconnect sonucu; runtime pause olabilir | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/config-controller.ts:57` |

### Api

| Method | Route | Yetki | İstek | Yanıt / yan etki | Kaynak |
|---|---|---|---|---|---|
| GET | `/api/health` | Public | — | status/environment/database/redis/worker/claimsPaused | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/main.ts:23` |
| GET | `/api/campaigns` | Public | query network? | ACTIVE kampanyalar + enabled tasks; max50 | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/main.ts:24` |
| GET | `/api/integrations` | Public | — | ENV-only platform status/ready; rewardedActionsEnabled=false | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/main.ts:25` |
| GET | `/api/config` | Public | query network? | PublicConfig: network/currency/wallet/branding/release/claimsPaused | `/var/www/rewards.turkscan.com/REWARDSTEST/apps/api/src/main.ts:26` |

## Şema sözleşmeleri

- **campaignInput**: title3..160, description10..5000, budgetWei uint256 integer string; startsAt/endsAt optional nullable ISO, end>start; edit committed budget altına inemez.
- **taskInput**: campaignId, title, platform uppercase, kind EDUCATION/SOCIAL_INTERACTION, rewardWei>0 string, policyReviewed bool, officialAccountId?/targetUrl?, verification MANUAL{instructions10..2000,minLength20..500} veya TELEGRAM_MEMBERSHIP{instructions10..2000}; localizedContent{tr?,en?:{title?,description?,steps?<=12,rewardCondition?}}, optional nullable dates. Telegram membership yalnız TELEGRAM + SOCIAL_INTERACTION + reviewed ile kabul edilir.
- **officialInput**: platform, accountType PROFILE/PAGE/CHANNEL/GROUP/BOT/GUILD/ORGANIZATION/REPOSITORY; name, username, accountId string, profileUrl/defaultTargetUrl, enabled. TEST GROUP/CHANNEL accountId doluysa negatif1..24digit veya @5..32alphanumeric_ zorunlu; pozitif sayısal ID accountId ve ham defaultTargetUrl alanında reddedilir. HTTPS hedefler halen safeTarget kontrolünden geçer. Numerik raw target public t.me URL'ye mevcut username/profile üzerinden normalize edilir; ID stringi normalize edilmez.
- **networkInput/brandingInput**: alanları configuration.ts; endpoint adı yerine request config tam şema ister, unknown key strict reddedilir. ENV_CONFIGURATION ve DB dokümanına bakın.
- **Credential**: sadece allowed scope/kind, encrypt-at-rest; response metadata, secret geri dönmez. Store sosyal credential JSON'ı allowed alanlarla merge eder; provider connection test provider'a çağrı yapar ve status kaydı **yazar**, salt okunur operation saymayın.

## Somut istek/yanıt örnekleri — çalıştırılmamış örnekler

```json
{"campaignId":"<onaylanan-kampanya-id>","title":"Turkchain Telegram Topluluğuna Katıl","platform":"TELEGRAM","kind":"SOCIAL_INTERACTION","rewardWei":"10000000000000000000","policyReviewed":true,"officialAccountId":"<connected-official-id>","targetUrl":"https://t.me/Turkchain1919","verification":{"type":"TELEGRAM_MEMBERSHIP","instructions":"Join the official group and verify your membership."}}
```

Bu create body yalnız inceleme içindir; yeni görev oluşturma onayı değildir. Tam TR/EN hazırlık planı CURRENT_STATUS içindedir. Başarılı Telegram verify yanıtı fixture testinde:

```json
{"verified":true,"alreadyProcessed":false,"status":"APPROVED","reward":"10000000000000000000","ledgerStatus":"AVAILABLE"}
```

Aynı istek tekrarında alreadyProcessed=true; ekstra ledger/bütçe artışı olmaz. Nonmember/yanlış tarihler/pause/archive/bütçe yetersizliği ödül üretmez. Balance örneği `{ "PENDING":"0", "AVAILABLE":"10000000000000000000", "RESERVED":"0", "CLAIMED":"0" }` yalnız TEST fixture gösterimidir, production ödülü değildir.

Delete body `{ "confirmId":"<route-id>" }`; id eşleşmesi zorunlu. Impact snapshot onay sırasında eskimiş olabilir, transaction yeniden kontrol eder. Geçmiş varsa arşiv uygulanır. Resmî hesabı bağlama/disconnect bazı Task.configurationRequired/enabled alanlarına da yazabilir; yalnız hesap düzeltme göreviyle bu yolu körlemesine çalıştırmayın.

## Limits, testler ve eksikler

Listeler genellikle take100; public campaigns take50. Tam sayfalama/search ve OpenAPI şeması yok. Public `/api/integrations` ENV-only readiness ile admin effective DB override sonucu farklı olabilir; yetkili effective/runtime veriyi esas alın. `/api/campaigns` enabled task metadata içerir, asıl görev kullanılabilirliği `/api/tasks` ve Engine submission/verify gate'leriyle belirlenir. Review/status/dates server tarafında kontrol edilir; UI state güvenlik sınırı değildir.

API/ledger/Telegram/auth/MFA/role test dosyaları PROJECT_DOCUMENTATION test tablosundadır. Yeni validation HTTP regression TEST DB'ye yalnız kendi fixture resmî hesabını yazar, CONNECTED negatif kimliğin edit sonrası korunmasını ve pozitif request400 reddini sınar; production üzerinde mutasyon testleri yapılmaz.

## Hedef alanı geriye uyumluluk notu

`accountId` negatif sayı stringi veya @username ister. URL alanı `defaultTargetUrl` ayrıca eski bare username (`Turkchain1919`) girdisini t.me URL'ye normalize etmeye devam eder; salt pozitif sayısal grup/kanal hedefi burada da reddedilir. Bu ayrım eski URL-normalizasyon API davranışını korur; kullanıcı Telegram kimliği OAuth akışını değiştirmez. Negative/@username/bare-URL-field regresyonları TEST kapsamındadır.
