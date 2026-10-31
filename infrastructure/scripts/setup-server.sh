#!/usr/bin/env bash
set -euo pipefail
for cmd in node npm git nginx redis-server psql pg_dump python3 systemctl; do command -v "$cmd" >/dev/null; done
test "$(id -u)" = 0
echo 'Required server tools available; unrelated services unchanged.'
