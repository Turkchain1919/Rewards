#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
test "$target" = "$TEST"
load_env
npx prisma generate
npm run build
