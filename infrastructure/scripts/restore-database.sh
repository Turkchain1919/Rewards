#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
load_env
test "${REWARDS_RESTORE_CONFIRM:-}" = "$APP_ENV"
file="${1:?Backup path required}"
test -f "$file"
case "$(realpath "$file")" in "$target/backups/"*.dump) ;; *) echo 'Invalid backup path'; exit 1;; esac
echo 'Stop Rewards API and workers before restore; restore requires an empty dedicated database.'
export PGPASSWORD
PGPASSWORD="$(node -e 'console.log(new URL(process.env.DATABASE_URL).password)')"
/usr/lib/postgresql/14/bin/pg_restore -h 127.0.0.1 -U "rewards_${APP_ENV}" -d "rewards_${APP_ENV}" --no-owner --exit-on-error "$file"
