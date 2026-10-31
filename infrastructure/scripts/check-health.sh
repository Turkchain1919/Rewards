#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
load_env
curl --fail --silent --show-error --max-time 20 "$INTERNAL_API_URL/api/health"
curl --fail --silent --show-error --max-time 20 "$INTERNAL_API_URL/api/campaigns" >/dev/null
for path in / /dashboard /admin; do curl --fail --silent --show-error --max-time 20 "http://127.0.0.1:$PORT$path" >/dev/null; done
