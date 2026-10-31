# Production status
Foundation release target: https://rewards.turkscan.com .
Source must match the immutable artifact linked by rewards/current.
No release is successful until public TLS and health pass. See rewards/.runtime/deployment.json for authoritative deployment status and exact SHA.
Claims remain paused. Admin/social/reward operations are intentionally unavailable in foundation 0.1.

Last verified live baseline: 6f3e87265af413675daf50c00275eb47b36a187b (2026-10-31). HTTPS200 and all dedicated runtime dependencies passed. Social OAuth credentials, WalletConnect and administrator wallet configuration remain absent. User/admin authentication modules are not implemented in foundation; no management/payout writes are exposed.
