# Architecture — foundation 0.1

Next.js App Router serves the public landing page, read-only campaign dashboard, wallet network connection and an explicitly unavailable administration screen. NestJS exposes read-only campaign/configuration/integration endpoints and real PostgreSQL/Redis/worker health. Prisma stores users, draft campaigns, disabled tasks, exact integer-wei ledger records and audit events. BullMQ runs environment-local maintenance jobs; it cannot issue rewards or sign claims.

Each environment has a dedicated PostgreSQL role and database, a dedicated authenticated Redis process/port, its own OS user, runtime configuration and processes. TEST ports: web18190/api18290/Redis18390. Production: web18191/api18291/Redis18391. Only production is reverse-proxied by Nginx. No cross-environment sessions exist.

NativeTURKClaims implements EIP-712 recipient/amount/nonce/deadline authorization, chain and contract domain separation, replay protection, reentrancy protection, owner controls and a paused initial state. It has no production deployment script. No signer key is configured.

## Pending modules

Wallet signature authentication and secure sessions; admin authentication and authorization; campaign/task CRUD with budgets and lifecycle; submission verification; transactional reward ledger service; official social OAuth adapters and encrypted token storage; WalletConnect; claim signing and reconciliation; abuse/rate-limit controls and full user/admin journeys. These are not represented as implemented.

All external social reward actions are denied by default, regardless of credentials. A reviewed policy matrix and actual provider credentials/app approvals are required. YouTube explicitly prohibits rewarded engagement: https://developers.google.com/youtube/terms/developer-policies . X automation guidance: https://help.x.com/en/rules-and-policies/x-automation .

The referenced original master task is unavailable in this conversation. Detailed reward economics, roles, campaign approval rules and provider requirements remain unresolved; this foundation does not replace that specification.
