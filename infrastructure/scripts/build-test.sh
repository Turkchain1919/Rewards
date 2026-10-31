#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
test "$target" = "$TEST"
load_env
npx prisma generate
npm run build

# The same validated artifact is promoted: deployment-specific metadata must
# resolve at runtime, never embed the TEST origin in production static output.
node - <<'JS'
const fs=require('node:fs'),assert=require('node:assert/strict');
const manifest=JSON.parse(fs.readFileSync('apps/web/.next/prerender-manifest.json','utf8'));
for(const route of ['/robots.txt','/sitemap.xml'])assert.ok(!manifest.routes[route],route+' must resolve deployment origin at runtime');
console.log('Runtime metadata origin guard passed');
JS
