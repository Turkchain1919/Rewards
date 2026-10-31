#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
test "$target" = "$TEST"
load_env
test -z "$(git status --porcelain)"
bash "$SCRIPT_DIR/build-test.sh"
systemctl restart rewards-test-api rewards-test-worker rewards-test-web
for attempt in {1..20}; do
 if bash "$SCRIPT_DIR/check-health.sh" >/dev/null 2>&1; then break;fi
 sleep 2
done
bash "$SCRIPT_DIR/test-all.sh"
npx prisma migrate deploy
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
python3 "$SCRIPT_DIR/scan-secrets.py"
test -z "$(git status --porcelain)"
python3 - <<'PY'
import json,subprocess,datetime
from pathlib import Path
sha=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
Path('.runtime/validated.json').write_text(json.dumps({'sha':sha,'status':'passed','date':datetime.datetime.now(datetime.timezone.utc).isoformat()}))
print('Validated release '+sha)
PY
