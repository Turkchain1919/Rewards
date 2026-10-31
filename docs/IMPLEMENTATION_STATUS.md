# Implementation status — foundation 0.1
Implemented: Next.js landing and read-only dashboard, MetaMask network connection, NestJS read-only API, Prisma schema/migration, isolated PostgreSQL/Redis/OS users, BullMQ maintenance worker, native claim contract and Foundry tests, TLS and dedicated deployment tooling.

Verified before release candidate: TypeScript, ESLint, application build, 4 automated tests including real DB/Redis/API integration; 10 Foundry tests including 256 fuzz runs; production dependency audit zero vulnerabilities.

Disabled/pending: authenticated user/admin operations, campaign and task management, reward accounting service, social OAuth and verification, WalletConnect, claim signing/reconciliation, full abuse controls. Social credentials are not configured. No mainnet deployment, funding or payouts.

Original master specification is unavailable. Missing business requirements remain open rather than inferred. The owner requested a visible first foundation release followed by sequential module completion.

Run validate-release.sh against the exact release commit before promotion. Runtime deployment manifest is rewards/.runtime/deployment.json; it records definitive SHA, health and GitHub synchronization result.
