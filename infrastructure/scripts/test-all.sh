#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
test "$target" = "$TEST"
load_env
npm run typecheck
npm run lint
RUN_INTEGRATION=true npm test
(cd packages/contracts && forge test -vv)
npm audit --omit=dev --audit-level=high
npx prisma migrate status
