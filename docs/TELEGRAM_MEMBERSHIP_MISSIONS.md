# Telegram membership missions

The only third-party social mission enabled by default policy is a Telegram group/channel membership check. Follow, like, repost, view, and other incentivized engagement tasks remain blocked.

## Configuration prerequisites

1. In Administration Center → Social API → Telegram, save and enable a Telegram Bot API token using the bot mode. The token is encrypted at rest and never returned to the browser.
2. Configure the Telegram OAuth/OIDC client credentials and callback as well if users are to link their personal Telegram identity in the dashboard. The bot token alone cannot identify the user's Telegram account.
3. Add the official Telegram group/channel in Administration Center → Official Social Accounts. Use its @username or numeric chat ID, set its type to GROUP or CHANNEL, and click Connect Account. The connection flow resolves the real chat ID and verifies that the bot itself is an administrator.
4. Create a campaign with sufficient unallocated budget. Create a Telegram SOCIAL_INTERACTION task with verification type Telegram membership, select the connected group/channel, mark the platform-policy review, and enter a reward in the selected chain's native currency. Publish the task, then publish the campaign.
5. Users connect a wallet and link Telegram through the dashboard, join the target, and press Verify Telegram membership. The server calls Bot API getChatMember; only a positive result is credited.

## Accounting and payout

A successful membership check creates one approved submission and one AVAILABLE ledger credit inside a serializable database transaction. Campaign budget is allocated atomically, duplicate requests do not credit twice, and non-members receive no credit. Reward amount is stored in the selected network's native base units using the configured currency decimals.

AVAILABLE is an internal rewards balance. Mainnet claim and payout authorization remain paused until the owner separately authorizes contract deployment, funding, and activation. A 10 TURK ledger credit is therefore not an on-chain transfer.

## Failure states

The task cannot be published or shown to users without an enabled Telegram bot credential and a connected official group/channel. User verification additionally requires the user's personal Telegram OAuth link. Missing credentials, Telegram rate limits, API errors, invalid target IDs, and absent membership fail closed; no evidence string is accepted as a substitute.
