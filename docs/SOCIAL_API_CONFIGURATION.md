# Social API administration
Open /admin, sign in as OWNER, complete MFA, then choose **Social API**.
Select a provider, choose its authorization mode, enter credentials, check Enabled, and Save Configuration. Blank credential inputs preserve existing values; stored values are never returned. Edit Configuration refreshes the current version. Concurrent stale changes are rejected.
Sessions older than five minutes must supply a fresh TOTP code for credential writes. ADMIN can inspect and test integrations; only OWNER can modify encrypted credentials.
## Provider requirements
- X: OAuth2 Client ID and secret for authorization; bearer token or authorized user token for API probes. OAuth1 key/secret fields are compatibility storage, not an implemented OAuth1 login flow.
- Telegram: BotFather OIDC client credentials for Login; Bot API uses the bot token, independently of OIDC. Channel/group permission checks require the bot to have appropriate administrator rights.
- Facebook: App ID/secret, configured Meta Graph version, approved permissions, and Page/User tokens as applicable. Connecting a managed Page requires page-list/read permissions.
- Instagram: Instagram App ID/secret, configured Graph version, professional account permissions and access token.
- YouTube: Google OAuth client ID/secret for account authorization; Data API key for public channel lookup or an authorized access token for the user's channel.
- TikTok: Client Key/secret and approved scopes/products. User info probes require an authorized access token.
Discord and GitHub connectors are also available; use bot/OAuth permissions appropriate to the target guild/repository.
App credentials alone do not connect an official account. Use **Official Social Accounts**, add the target account, and Connect Account to complete official authorization. Multiple accounts and an explicit default are supported. Disconnect revokes local credentials, attempts supported remote revocation, pauses dependent tasks and preserves historical rewards. Remote revocation that requires manual action is reported as such.
## Status semantics
- awaiting_credentials: selected authentication mode lacks required configuration.
- configured: required settings exist; authorization/verification is still pending.
- connected: an official account has a verified connection and active encrypted credential reference.
- authentication_failed: provider returned an authentication error.
- disabled: integration is off.
Save never records a successful provider validation. Test Connection makes an actual provider request when credentials permit it; OAuth-only app configuration returns authorization_required until a token is available. Provider tests have cooldowns and rate-limit handling. Last successful validation advances only on a successful provider response.
## Storage and precedence
PostgreSQL encrypted credential/configuration records override deployment environment defaults. Environment aliases including *_CLIENT_ID, *_CLIENT_SECRET, *_REDIRECT_URI, legacy *_CALLBACK_URL, Facebook/Instagram APP_ID/APP_SECRET and TikTok CLIENT_KEY remain supported. Frontend and API callbacks resolve configuration through the central service; no manual .env edit/restart is required for admin settings. The present worker handles maintenance heartbeats and does not execute social verification or payouts.
AES-256-GCM encryption is bound to APP_ENV. DATA_ENCRYPTION_KEY must be a protected deployment secret backed up separately from database backups. Losing it makes encrypted credentials unrecoverable. Audit records contain operation, actor, field names and versions, never credential values.
Production .env is not writable through HTTP. Optional legacy .env synchronization is deliberately disabled: current connectors read the central service, so synchronization is unnecessary. Use the documented protected deployment procedure for deployment-level changes.
Callbacks must match the installation APP_URL and /api/oauth/<provider>/callback (legacy /api/social is accepted). Register that exact URL in the provider portal. TEST uses its isolated origin, database, encryption key, Redis namespace and sessions.
Rewarded social interactions remain denied by default, independent of credentials.
## Validation boundary
Automated tests use isolated fixture accounts and mocked provider responses for refresh failures/rotation. Live provider authorization, consent and token validation require OWNER-supplied keys, provider approvals and real account consent; none are fabricated.
## Official references
- https://core.telegram.org/bots/telegram-login
- https://core.telegram.org/bots/api
- https://developers.google.com/youtube/v3/docs/channels/list
- https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info
