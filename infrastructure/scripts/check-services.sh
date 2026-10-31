#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
load_env
name=rewards-test
if test "$APP_ENV" = production; then name=rewards-prod; fi
systemctl is-active "$name-redis" "$name-api" "$name-web" "$name-worker"
