#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
load_env
umask 077
mkdir -p backups
file="$target/backups/${APP_ENV}-$(date -u +%Y%m%dT%H%M%S)-$$.dump"
export PGPASSWORD
PGPASSWORD="$(node -e 'console.log(new URL(process.env.DATABASE_URL).password)')"
pg_dump -h 127.0.0.1 -U "rewards_${APP_ENV}" -d "rewards_${APP_ENV}" -Fc -f "$file"
pg_restore --list "$file" >/dev/null
printf '%s\n' "$file"
