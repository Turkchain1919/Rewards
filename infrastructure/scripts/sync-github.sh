#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
if test "$(readlink /proc/$$/fd/9 2>/dev/null || true)" != /root/frontend/.codex/session.lock; then exec 9>/root/frontend/.codex/session.lock; fi
flock -n 9
REWARDS_TARGET="$PROD" bash "$SCRIPT_DIR/check-health.sh" >/dev/null
bash "$SCRIPT_DIR/check-ssl.sh" >/dev/null
sha="$(git -C "$PROD" rev-parse HEAD)"
test "$(basename "$(readlink -f "$PROD/current")")" = "$sha"
python3 - "$PROD/.runtime/deployment.json" "$sha" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
assert d['git_commit_sha']==sys.argv[2] and d['deployment_status']=='healthy'
PY
cd "$PROD"
python3 "$SCRIPT_DIR/scan-secrets.py"
git fetch git@github.com:Turkchain1919/Rewards.git main
git merge-base --is-ancestor FETCH_HEAD "$sha"
git push git@github.com:Turkchain1919/Rewards.git "$sha:refs/heads/main"
tag="v0.1.0-${sha:0:8}"
git tag "$tag" "$sha"
git push git@github.com:Turkchain1919/Rewards.git "refs/tags/$tag"
test "$(git ls-remote git@github.com:Turkchain1919/Rewards.git refs/heads/main | cut -f1)" = "$sha"
python3 - "$PROD/.runtime/deployment.json" <<'PY'
import json,sys,os
p=sys.argv[1];d=json.load(open(p));d['github_status']='synchronized';tmp=p+'.tmp'
open(tmp,'w').write(json.dumps(d,indent=2)+'\n');os.replace(tmp,p)
PY
echo "Production and GitHub main match: $sha"
