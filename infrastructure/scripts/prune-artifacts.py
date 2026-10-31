#!/usr/bin/env python3
from pathlib import Path
import json,re,shutil
prod=Path('/var/www/rewards.turkscan.com/rewards')
report=json.loads((prod/'.runtime/deployment.json').read_text())
assert report['deployment_status']=='healthy' and report['github_status']=='synchronized'
keep={p.resolve() for p in [prod/'current',prod/'previous'] if p.is_symlink()}
assert (prod/'current').resolve().name==report['git_commit_sha']
for p in (prod/'.releases').iterdir():
 if p.is_dir() and not p.is_symlink() and re.fullmatch('[0-9a-f]{40}',p.name) and p.resolve() not in keep:
  shutil.rmtree(p);print('Pruned unused generated artifact',p.name)
