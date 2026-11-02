#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
test "$target" = "$TEST"
load_env
npm run typecheck
npm run lint
RUN_INTEGRATION=true npm test
test -d "$TEST/.runtime/browser-tools/node_modules/playwright"
node -e "require('node:fs').writeFileSync('$TEST/.runtime/hero-fixture.gif',Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64'))"
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-hero.e2e.mts
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-lifecycle.e2e.mts
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-earning-guide.e2e.mts
(cd packages/contracts && forge test -vv)
npm audit --omit=dev --audit-level=high
npx prisma migrate status
