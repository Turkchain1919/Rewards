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

## Phase2 0.4.0 — configuration and Social API candidate
Central single-chain registry, encrypted credential store, audited Social API Save/Edit/Enable/Test forms, official multi-account OAuth/connect/disconnect and dynamic task targets are implemented. Eight connectors resolve admin credentials over env; six primary provider forms were exercised in a real desktop/mobile browser. OAuth lifecycle tests cover PKCE, refresh rotation, identity failures, rate limits and revocation. EN/TR routes, configurable branding/metadata and wallet configuration are included.
Single installation stays locked to its configured chain. WALLETCONNECT_PROJECT_ID is canonical. Candidate network records cannot execute on a different chain.
Claim EIP712 preparation, reservation and receipt reconciliation code is present behind closed server authorization gates; real mainnet deployment/funding/activation and real payouts remain unperformed. Automatic claim reconciliation scheduling and a complete positive local-chain end-to-end payout drill remain follow-up work before enabling claims.
Live social authorization remains awaiting OWNER credentials, provider permissions and consent. No real connected account or successful API validation is invented.
See SOCIAL_API_CONFIGURATION.md and PORTABLE_CONFIGURATION.md. Exact release tests/deployment status are recorded by the release gate and manifest; this candidate is not successful until those pass.

0.4.0 was successfully deployed and GitHub synchronized with preserved production records.0.4.1 adds dynamic deployment-origin robots/sitemap generation and a build-artifact regression guard. No provider keys, mainnet deployment or payouts were enabled.

## Hero visual management release candidate0.4.2
OWNER-only homepage GIF upload/preview/publish/replace/enable/disable/remove implemented in TEST. GIF bytes and metadata persist in PostgreSQL; bounded content validation, audited operations, public current-image response, original design fallback and reduced-motion fallback are included. See HERO_VISUAL.md. Desktop/mobile browser persistence test, full test/build/security/release gates and production rollout pending.
