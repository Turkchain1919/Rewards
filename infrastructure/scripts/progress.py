#!/usr/bin/env python3
import sys,datetime,os
from pathlib import Path
base=Path('/var/www/rewards.turkscan.com')
line=datetime.datetime.now(datetime.timezone.utc).isoformat()+' '+sys.argv[1]+'\n'
for p in [base/'CODEX_PROGRESS.md',Path('/root/frontend/CODEX_PROGRESS.md')]:
 tmp=p.with_name('.'+p.name+'.tmp')
 tmp.write_text((p.read_text() if p.exists() else '')+'\n'+line)
 os.replace(tmp,p)
