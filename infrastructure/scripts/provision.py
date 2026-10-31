#!/usr/bin/env python3
import sys,os,secrets,subprocess
from pathlib import Path
env=sys.argv[1]
if env not in ('test','production'):raise SystemExit('Invalid target')
if os.geteuid()!=0:raise SystemExit('Root required')
base=Path('/var/www/rewards.turkscan.com')
root=base/('REWARDSTEST' if env=='test' else 'rewards')
if not root.is_dir():raise SystemExit('Missing target directory')
user='rewards-test' if env=='test' else 'rewards-prod'
db='rewards_test' if env=='test' else 'rewards_production'
offset=0 if env=='test' else 1
api=18290+offset;web=18190+offset;redis=18390+offset
subprocess.run(['id',user],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0 or subprocess.run(['useradd','--system','--home-dir',str(root),'--shell','/usr/sbin/nologin',user],check=True)
p=root/'.env'
values={}
if p.exists():
 for line in p.read_text().splitlines():
  if '=' in line and not line.startswith('#'):
   k,v=line.split('=',1);values[k]=v
if 'DATABASE_URL' not in values:
 password=secrets.token_hex(32)
 sql=f"CREATE ROLE {db} LOGIN PASSWORD '{password}';"
 query=subprocess.run(['runuser','-u','postgres','--','psql','-Atc',f"SELECT 1 FROM pg_roles WHERE rolname='{db}'"],capture_output=True,text=True,check=True)
 if query.stdout.strip():raise SystemExit('Existing role without env credentials; manual reconciliation required')
 subprocess.run(['runuser','-u','postgres','--','psql','-v','ON_ERROR_STOP=1'],input=sql,text=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,check=True)
 subprocess.run(['runuser','-u','postgres','--','createdb','-O',db,db],check=True)
 # Dedicated database, no CREATE privilege for other roles.
 subprocess.run(['runuser','-u','postgres','--','psql','-v','ON_ERROR_STOP=1','-c',f'REVOKE ALL ON DATABASE {db} FROM PUBLIC'],check=True,stdout=subprocess.DEVNULL)
 values['DATABASE_URL']=f'postgresql://{db}:{password}@127.0.0.1:5432/{db}?schema=public'
if 'REDIS_URL' not in values:values['REDIS_URL']=f'redis://:{secrets.token_hex(32)}@127.0.0.1:{redis}/0'
values.update(APP_ENV=env,NODE_ENV='production',API_PORT=str(api),PORT=str(web),INTERNAL_API_URL=f'http://127.0.0.1:{api}',REWARD_CLAIMS_PAUSED='true',REWARD_GAS_SPONSORSHIP_ENABLED='false',CHAIN_ID='1919',CHAIN_RPC_URL='https://rpc.turkscan.com',CHAIN_WSS_URL='wss://evm-ws.turkscan.com',CHAIN_EXPLORER_URL='https://turkscan.com')
if env=='test':values['REWARDS_ENABLED']='true';values['APP_URL']=f'http://127.0.0.1:{web}'
else:values.update(APP_URL='https://rewards.turkscan.com',APP_DOMAIN='rewards.turkscan.com',REWARDS_CURRENCY='TURK')
for platform in ['X','TELEGRAM','FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK']:
 for key in ['CLIENT_ID','CLIENT_SECRET','REDIRECT_URI']:
  values.setdefault(platform+'_'+key,'')
values.setdefault('TELEGRAM_BOT_TOKEN','')
values.setdefault('WALLETCONNECT_PROJECT_ID','')
values.setdefault('ADMIN_WALLETS','')
tmp=p.with_name('.env.setup.tmp')
fd=os.open(tmp,os.O_CREAT|os.O_TRUNC|os.O_WRONLY,0o600)
with os.fdopen(fd,'w') as f:f.write(''.join(k+'='+v+'\n' for k,v in values.items()))
os.replace(tmp,p);os.chmod(p,0o600)
data=Path('/var/lib')/user;data.mkdir(exist_ok=True)
logs=root/'logs';logs.mkdir(exist_ok=True)
for d in [data,logs]:subprocess.run(['chown',user+':'+user,str(d)],check=True)
password=values['REDIS_URL'].split(':',2)[2].split('@')[0]
config=Path('/etc')/(user+'-redis.conf')
config.write_text(f'bind 127.0.0.1\nport {redis}\nprotected-mode yes\nrequirepass {password}\ndir {data}\nappendonly yes\nmaxmemory 96mb\nmaxmemory-policy noeviction\n')
os.chmod(config,0o640);subprocess.run(['chown','root:'+user,str(config)],check=True)
unit=Path('/etc/systemd/system')/(user+'-redis.service')
unit.write_text(f'[Unit]\nDescription=Rewards {env} isolated Redis\nAfter=network.target\n[Service]\nUser={user}\nGroup={user}\nExecStart=/usr/bin/redis-server {config}\nRestart=on-failure\nNoNewPrivileges=true\nProtectSystem=strict\nReadWritePaths={data}\nProtectHome=true\nPrivateTmp=true\n[Install]\nWantedBy=multi-user.target\n')
subprocess.run(['systemctl','daemon-reload'],check=True)
subprocess.run(['systemctl','enable','--now',unit.name],check=True)
print(env+': dedicated database/role, Redis service, OS user and private env configured')
