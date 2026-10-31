#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
if test "$(readlink /proc/$$/fd/9 2>/dev/null || true)" != /root/frontend/.codex/session.lock; then exec 9>/root/frontend/.codex/session.lock; fi
flock -n 9
test -L "$PROD/previous"
dest="$(readlink -f "$PROD/previous")"
case "$dest" in "$PROD/.releases/"*) ;; *) echo 'Invalid rollback artifact';exit 1;; esac
test -f "$dest/apps/api/dist/main.js"
ln -s "$dest" "$PROD/.current.rollback"
mv -Tf "$PROD/.current.rollback" "$PROD/current"
systemctl restart rewards-prod-api rewards-prod-worker rewards-prod-web
for attempt in {1..20}; do
 if REWARDS_TARGET="$PROD" bash "$SCRIPT_DIR/check-health.sh"; then
  echo 'Previous application restored. Review database migration compatibility and manifest before GitHub synchronization.'
  exit 0
 fi
 sleep 2
done
exit 1
