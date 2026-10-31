# Implementation status
## Phase2 release 0.2.0 — authentication
Implemented password login (scrypt N131072), exclusive first OWNER bootstrap, OWNER/ADMIN/REVIEWER roles, mandatory TOTP enrollment and verification with replay prevention, encrypted MFA secret, origin validation, rate limiting, hashed/rotating/revocable sessions, and user EIP4361 wallet sign-in, profile and logout.
Admin setup and session UI and signed MetaMask sign-in are implemented.
Verified: 8 application tests including real admin/MFA/role/session/wallet integration; TypeScript/lint/build and 10 Foundry tests are required by exact-commit release gate.
No production administrator is invented. Owner completes /admin setup using the private server bootstrap file; see ADMIN_SETUP.md.

Pending in Phase2: real administration dashboards, task/campaign engine, social OAuth adapters, stateful reward ledger, paused claim integration, TR/EN branding/SEO. All real TURK payouts and mainnet contract deployments remain prohibited.

## Phase2 0.3.0 — administration, tasks and ledger
Real-data admin screens now include summaries, users, campaigns, tasks, reviews, ledger transitions, integration readiness, system state, audit and OWNER-managed admin accounts. OWNER can change ADMIN/REVIEWER roles or disable accounts; sessions are revoked. Password changes revoke prior sessions.
Task/campaign creation/edit/publish/pause supports exact integer-wei budgets/rewards and explicit manual evidence rules. Only reviewed first-party educational tasks may publish. All external rewarded social interactions remain denied.
User dashboard contains signed profile access, public missions, authenticated evidence submission, task history and Pending/Available/Reserved/Claimed balance views.
Serializable transactions, database constraints, unique user/task keys and immutable transition records prevent overspending and repeated awards. Rejecting a pending submission releases budget. Reserved/Claimed transitions await the claim integration module; no actual payments are enabled.
Concurrency integration tests cover budget races, idempotent approvals, reward duplication, role controls, evidence rules, paused campaign visibility and forbidden social-task publication.
