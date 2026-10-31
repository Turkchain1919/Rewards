#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
if test "$(readlink /proc/$$/fd/9 2>/dev/null || true)" != /root/frontend/.codex/session.lock; then exec 9>/root/frontend/.codex/session.lock; fi
flock -n 9
python3 "$SCRIPT_DIR/deploy-production.py"
