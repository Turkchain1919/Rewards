# Production status — Phase2
Public production: https://rewards.turkscan.com . Exact deployed SHA, health and GitHub synchronization are recorded in rewards/.runtime/deployment.json.
Last verified Phase1 commit: 3d378d5eee3a0ee213dcc206a64359efc30f8d5f.
Phase2 authentication release adds admin setup, password/TOTP/role/session controls and signed user wallet login. Production owner setup is intentionally unclaimed until performed with the protected bootstrap secret; no default password exists.
All social credentials remain absent. Claims stay paused; no mainnet vault, signer or funding is configured.
