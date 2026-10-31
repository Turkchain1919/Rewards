#!/usr/bin/env bash
set -euo pipefail
BASE=/var/www/rewards.turkscan.com
TEST="$BASE/REWARDSTEST"
PROD="$BASE/rewards"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
target="${REWARDS_TARGET:-$TEST}"
case "$target" in "$TEST"|"$PROD") ;; *) echo 'Invalid Rewards target' >&2; exit 1;; esac
export PATH="/root/.foundry/bin:$PATH"
cd "$target"
load_env() {
 test -f "$target/.env"
 local encoded
 encoded="$(node -e 'const fs=require("node:fs"),dotenv=require(process.argv[2]);const values=dotenv.parse(fs.readFileSync(process.argv[1]));const text=Object.entries(values).map(([k,v])=>{if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(k))throw new Error("Invalid env key");return k+"="+v}).join("\0")+"\0";process.stdout.write(Buffer.from(text).toString("base64"));' "$target/.env" "$TEST/node_modules/dotenv")"
 local item
 while IFS= read -r -d '' item; do export "$item"; done < <(printf '%s' "$encoded" | base64 --decode)
 case "$target:$APP_ENV" in "$TEST:test"|"$PROD:production") ;; *) echo 'Environment mismatch' >&2; exit 1;; esac
 test "$REWARD_CLAIMS_PAUSED" = true
}
