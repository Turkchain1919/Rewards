# Operations

All commands execute over verified SSH on 138.226.246.138. Hold /root/frontend/.codex/session.lock with flock while mutating state. Never display env files or key material.

Run setup-server.sh, setup-test.sh and setup-production.sh to provision only dedicated Rewards resources. No global database or Redis configuration is changed. setup scripts refuse an existing role without matching configuration.

Build in TEST with build-test.sh. Start TEST services and run test-all.sh. Review migration SQL, run migration twice and compare schema. Validate dependency audit, tracked secret scan, public TLS and read-only RPC chain1919. No private keys required.

promote-to-production.sh requires a clean release commit and validation marker. Deployment creates an immutable source/build/dependency artifact below rewards/.releases, backs up the dedicated production database, applies forward migrations, switches current, restarts dedicated Rewards services, runs health checks and writes a deployment manifest. It can briefly interrupt service; zero downtime is not guaranteed.

rollback-production.sh switches to the previous application artifact and checks health. Only backward-compatible additive migrations are permitted for automatic rollback. A database restore is not automatic: stop dedicated Rewards API/worker, inspect backup with pg_restore --list, restore into an empty dedicated database, verify compatibility, then restart. restore-database.sh intentionally refuses to clean or drop an existing database. Always preserve the failed database before recovery.

sync-github.sh pushes only a healthy deployed production SHA, fast-forward only, to official main then adds a release tag. A failed push leaves synchronization pending; never force push.

No mainnet deploy, vault funding or real payouts are authorized.
