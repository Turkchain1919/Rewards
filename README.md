# Turkchain® Social Rewards

### Complete Missions. Explore the Ecosystem. Earn TURK.

**The official social engagement and blockchain rewards platform being developed for the Turkchain® ecosystem.**

Turkchain® Social Rewards is an independent, self-hosted Web3 rewards platform designed to connect community participation, educational missions, social activities, and blockchain-based rewards.

Users will be able to connect their wallets, participate in eligible missions, track verified rewards, and claim native **TURK** directly on Turkchain Mainnet through smart contracts.

---

## Project Overview

Turkchain® Social Rewards aims to create a transparent, accessible, and community-focused reward experience built exclusively for the Turkchain blockchain.

The platform is designed around four core principles:

- **Community Engagement:** Encourage meaningful participation in the Turkchain ecosystem.
- **Blockchain Integration:** Connect EVM-compatible wallets directly to Turkchain Mainnet.
- **Transparent Rewards:** Track eligible mission rewards with auditable accounting.
- **On-Chain Claims:** Enable users to claim native TURK through a secure smart contract.

## Planned Features

### User Dashboard

- MetaMask and compatible Web3 wallet connectivity
- Turkchain Mainnet network integration
- Available and completed missions
- Social account connections
- Reward balance tracking
- Mission verification status
- Native TURK claim functionality
- Blockchain transaction history
- English and Turkish language support

### Mission & Campaign System

- Educational blockchain missions
- Community onboarding activities
- Telegram community integration
- X integration
- Facebook and Instagram integrations
- YouTube and TikTok integrations
- On-chain activity verification
- Multi-step campaigns and achievements
- Configurable rewards and participation limits

Social integrations and reward eligibility will depend on official API availability, verification capabilities, and applicable platform policies.

### Administration Dashboard

- Campaign and mission management
- User and wallet management
- Mission verification workflows
- Reward budget management
- Native TURK claim monitoring
- Social API configuration
- Platform analytics
- Security and audit logs
- Website branding and SEO management

## Turkchain Mainnet

| Parameter | Value |
|---|---|
| Network | Turkchain Mainnet |
| Chain ID | 1919 |
| Chain ID (Hex) | 0x77f |
| Native Currency | TURK |
| Decimals | 18 |
| RPC | https://rpc.turkscan.com |
| WebSocket | wss://evm-ws.turkscan.com |
| Block Explorer | https://turkscan.com |

Turkchain® is an EVM-compatible blockchain ecosystem.

## Native TURK Rewards

The planned reward mechanism uses a smart contract designed for native TURK transfers.

**How it works:**

1. Connect a compatible Web3 wallet.
2. Complete an eligible mission.
3. Wait for mission verification.
4. Receive the approved reward in the platform's reward ledger.
5. Request a claim authorization.
6. Claim native TURK through the Turkchain smart contract.
7. Track the transaction using TurkScan.

The smart contract design includes EIP-712 authorization, replay protection, claim expiration, and on-chain transaction verification.

Smart contract deployment and live rewards require security validation and explicit activation.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | NestJS, Node.js |
| Database | PostgreSQL, Prisma |
| Background Jobs | Redis, BullMQ |
| Blockchain | Solidity, EVM |
| Wallet Integration | wagmi, viem |
| Smart Contract Testing | Foundry |
| Infrastructure | Nginx, Docker / systemd |
| Security | Signed wallet authentication, RBAC, EIP-712 |

## Development & Deployment

The project uses separate environments for development and production.

**TEST:** Development, integration testing, and validation.

**PRODUCTION:** Validated application releases serving the public website.

The GitHub `main` branch is intended to track validated production source code.

Sensitive credentials, private keys, database secrets, and production environment files are excluded from the repository.

## Project Status

**Status: Under Active Development**

The repository is being prepared for the initial implementation of the Turkchain® Social Rewards platform.

Features described in this README represent the planned platform architecture and are not necessarily available in the current release.

## Official Links

**Rewards Platform:** https://rewards.turkscan.com

**Blockchain Explorer:** https://turkscan.com

**Turkchain RPC:** https://rpc.turkscan.com

**Source Repository:** https://github.com/Turkchain1919/Rewards

## Security

Turkchain® Social Rewards is designed as a non-custodial rewards experience.

Users should never share their wallet recovery phrases or private keys.

Security issues should be reported privately to the project maintainers rather than disclosed through public issues before they can be assessed.

## License

License information will be published after the project licensing decision is finalized.

---

**Turkchain® — Building Technology. Empowering Community.**

© 2026 Turkchain®. All rights reserved.
