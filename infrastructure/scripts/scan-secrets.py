#!/usr/bin/env python3
import re,subprocess,sys
files=subprocess.check_output(['git','ls-files'],text=True).splitlines()
patterns=[rb'-----BEGIN (?:OPENSSH |RSA |EC )?PRIVATE KEY-----',rb'(?m)^PuTTY-User-Key-File-[23]:',rb'gh[pousr]_[A-Za-z0-9]{25,}',rb'github_pat_[A-Za-z0-9_]{30,}',rb'postgres(?:ql)?://[a-zA-Z0-9_]+:[a-zA-Z0-9%]{12,}@',rb'REWARD_CLAIM_SIGNER_PRIVATE_KEY\s*=\s*0x[a-fA-F0-9]{64}']
bad=[]
for name in files:
 if name.endswith('.env.example'):continue
 if re.search(r'(^|/)(\.env($|\.)|node_modules/|secrets/|private-keys/)',name) or name.endswith(('.ppk','.pem','.key','.dump')):bad.append(name);continue
 data=subprocess.check_output(['git','show',':'+name])
 if any(re.search(p,data) for p in patterns):bad.append(name)
if bad:
 print('Secret scan rejected paths:',','.join(sorted(set(bad))));sys.exit(1)
print('Tracked content secret scan passed')
