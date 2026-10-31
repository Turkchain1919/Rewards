# Production status — Phase2
Public production: https://rewards.turkscan.com . Exact deployed SHA, health and GitHub synchronization are recorded in rewards/.runtime/deployment.json.
Last verified Phase1 commit: 3d378d5eee3a0ee213dcc206a64359efc30f8d5f.
Phase2 authentication release adds admin setup, password/TOTP/role/session controls and signed user wallet login. Production owner setup is intentionally unclaimed until performed with the protected bootstrap secret; no default password exists.
All social credentials remain absent. Claims stay paused; no mainnet vault, signer or funding is configured.

Task/ledger release0.3.0 adds real administration and user mission workflows. No demo users, fake campaigns, fabricated balances or production signer are seeded. API credentials remain absent. Earned balances represent platform liabilities, not confirmation that the native vault is funded.

0.4.0 introduces Owner-controlled Social API configuration and portable single-chain settings. Turkchain remains active and payouts paused. Provider configuration is intentionally disabled until Owner saves approved credentials. Production release status must be read from .runtime/deployment.json, not inferred from the existence of source code.

Verified0.4.0 live:603fe9c46ddcdb7128d8916768ac96eb2f125816, healthy and synchronized. Social API forms accept encrypted Owner configuration; real provider consent/validation still requires Owner-supplied credentials.0.4.1 corrects deployment-origin metadata generation; consult the manifest for its exact deployed SHA.
