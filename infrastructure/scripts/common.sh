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
 set -a
 source "$target/.env"
 set +a
 case "$target:$APP_ENV" in "$TEST:test"|"$PROD:production") ;; *) echo 'Environment mismatch' >&2; exit 1;; esac
 test "$REWARD_CLAIMS_PAUSED" = true
}
