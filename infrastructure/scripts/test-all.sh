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
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-telegram-validation.e2e.mts
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-reward25.e2e.mts
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-instagram-setup.e2e.mts
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-admin-limits.e2e.mts
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-multi-social.e2e.mts
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-admin-redesign.e2e.mts
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-mobile-locale-hero.e2e.mts
for hero_browser in chromium firefox webkit; do
 HERO_BROWSER="$hero_browser" PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx tests/browser-hero-responsive.e2e.mts
done
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-telegram-session.e2e.mts
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" timeout 90s node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-walletconnect.e2e.mts
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx --tsconfig apps/api/tsconfig.json tests/browser-admin-user-details.e2e.mts
PLAYWRIGHT_BROWSERS_PATH="$TEST/.runtime/browsers" node_modules/.bin/tsx tests/browser-user-hub.e2e.mts
(cd packages/contracts && forge test -vv)
npm audit --omit=dev --audit-level=high
npx prisma migrate status
