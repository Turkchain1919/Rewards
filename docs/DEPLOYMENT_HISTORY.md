# Deployment history
## Foundation 0.1
Initial release candidate introduces public read-only foundation, isolated runtime services, paused/tested claim contract and safe release tooling. Exact timestamps and outcome are recorded outside Git in rewards/.runtime/deployment.json and /var/www/rewards.turkscan.com/CODEX_PROGRESS.md after health checks. No prior Rewards release exists.

## 2026-10-31 initial live foundation
Production revision 6f3e87265af413675daf50c00275eb47b36a187b served HTTPS200, dashboard/admin availability screens and real PostgreSQL/Redis/worker health successfully. Native claims remained paused. GitHub synchronization was safely held because upstream README commit 344bd6d had diverged from the original baseline.

## 0.1.1 release candidate
Preserves the upstream README, retries HTTPS probes during graceful Nginx reload and uses matched PostgreSQL14 backup/restore binaries. Follow the deployment manifest for this release's final outcome. No force push is permitted.

## Phase2 0.2.0 — authentication release
Adds secure admin authentication and signed user wallet authentication without replacing the existing infrastructure. The migration adds Admin/AuthSession tables and an optional profile name; the previous read-only application remains schema-compatible. Final deployed SHA and gate results are in rewards/.runtime/deployment.json.
