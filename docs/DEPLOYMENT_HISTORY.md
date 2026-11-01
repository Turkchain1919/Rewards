# Deployment history
## Foundation 0.1
Initial release candidate introduces public read-only foundation, isolated runtime services, paused/tested claim contract and safe release tooling. Exact timestamps and outcome are recorded outside Git in rewards/.runtime/deployment.json and /var/www/rewards.turkscan.com/CODEX_PROGRESS.md after health checks. No prior Rewards release exists.

## 2026-10-31 initial live foundation
Production revision 6f3e87265af413675daf50c00275eb47b36a187b served HTTPS200, dashboard/admin availability screens and real PostgreSQL/Redis/worker health successfully. Native claims remained paused. GitHub synchronization was safely held because upstream README commit 344bd6d had diverged from the original baseline.

## 0.1.1 release candidate
Preserves the upstream README, retries HTTPS probes during graceful Nginx reload and uses matched PostgreSQL14 backup/restore binaries. Follow the deployment manifest for this release's final outcome. No force push is permitted.

## Phase2 0.2.0 — authentication release
Adds secure admin authentication and signed user wallet authentication without replacing the existing infrastructure. The migration adds Admin/AuthSession tables and an optional profile name; the previous read-only application remains schema-compatible. Final deployed SHA and gate results are in rewards/.runtime/deployment.json.

## 0.2.0 verified production
Commit 29279e350ed4a0bb56304d46ce456447ca00d163 deployed and synchronized to GitHub main. 8 application tests, 10 Foundry tests, TypeScript, lint, build, security audit and migration parity passed. Initial owner setup remains private to the owner.

## 0.3.0 administration/task/ledger release
Additive migrations introduce budgets, submissions, ledger states and transition events with budget bounds. Previous auth release remains schema-compatible. Current outcome/SHA is recorded in the deployment manifest after checks.

## 0.4.0 candidate
Configuration/Social API release based on95b199ed37bef3a527664d04863a07ab25435a47. Additive migrations005–012 preserve existing users, campaigns, tasks and rewards. Deployment backs up production database and retains previous immutable release. Exact deployed SHA, test/build/health results and GitHub synchronization are recorded in the protected deployment manifest. No production credentials are seeded from TEST.

## 0.4.0 deployed; 0.4.1 SEO follow-up
0.4.0 commit603fe9c46ddcdb7128d8916768ac96eb2f125816 deployed successfully, all preexisting production record IDs preserved, GitHub synchronized, RPC/WSS1919 and public/mobile checks passed. Fifteen application and ten Foundry tests passed.
Final robots/sitemap inspection found build-time TEST origins in static metadata.0.4.1 changes those routes to runtime generation and adds an artifact guard preventing this regression. Health, exact deployment revision and synchronization are recorded in .runtime/deployment.json.

## Hero visual management release candidate0.4.2
OWNER-only homepage GIF upload/preview/publish/replace/enable/disable/remove implemented in TEST. GIF bytes and metadata persist in PostgreSQL; bounded content validation, audited operations, public current-image response, original design fallback and reduced-motion fallback are included. See HERO_VISUAL.md. Desktop/mobile browser persistence test, full test/build/security/release gates and production rollout pending.

## 0.4.3 — Telegram membership missions (release candidate)
- Adds admin-configurable Telegram membership mission, user Telegram account link and official Bot API getChatMember verification.
- On successful verification: idempotent internal AVAILABLE credit and atomic campaign allocation. No mainnet token transfer; claim pause remains enabled.
- TEST validation passed: 23 app tests including isolated PostgreSQL/Redis-ledger integration and Bot API account connection, admin/browser and Hero regression, 10 Foundry tests, optimized build, lint, audit and migration checks. Deployment is pending exact clean-commit gate, production promotion and health verification.

## 0.4.4 Telegram account validation and campaign publication
The official Telegram account API now accepts the Supergroup Chat ID in the default-target field, retains account and chat identifiers as strings, and converts a numeric or @username target into a safe public t.me task link. HTTPS profile and target URL validation remains enforced; invalid inputs return sanitized field-specific errors. Telegram bot connect still verifies getChat and administrator status. Admin task-publish errors now show the safe server reason, and the campaigns view explains that an enabled task remains hidden until its campaign is also published. No reward accounting semantics changed; mainnet claims remain paused. Test suite and release health are recorded in the deployment manifest.
