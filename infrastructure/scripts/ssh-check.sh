#!/usr/bin/env bash
set -euo pipefail
test -n "${SSH_CONNECTION:-}"
test "$(hostname)" = bridge
echo 'Executing through SSH on the designated server.'
