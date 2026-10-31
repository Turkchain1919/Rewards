#!/usr/bin/env python3
import sys,subprocess
from pathlib import Path
env=sys.argv[1]
if env not in ('test','production'):raise SystemExit('Invalid env')
base=Path('/var/www/rewards.turkscan.com')
root=base/('REWARDSTEST' if env=='test' else 'rewards')
name='rewards-test' if env=='test' else 'rewards-prod'
working=root if env=='test' else root/'current'
for component,command in {
 'api':'/usr/bin/node apps/api/dist/main.js',
 'web':'/usr/bin/node node_modules/next/dist/bin/next start apps/web -H 127.0.0.1',
 'worker':'/usr/bin/node apps/api/dist/worker.js'
}.items():
 unit=f"""[Unit]
Description=Turkchain Rewards {env} {component}
After=network.target postgresql.service {name}-redis.service
Requires={name}-redis.service
[Service]
Type=simple
User={name}
Group={name}
WorkingDirectory={working}
EnvironmentFile={root}/.env
ExecStart={command}
Restart=on-failure
RestartSec=5
TimeoutStopSec=30
KillSignal=SIGTERM
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ReadWritePaths={root}/logs {root}/.runtime
UMask=0077
StandardOutput=append:{root}/logs/{component}.log
StandardError=append:{root}/logs/{component}.error.log
[Install]
WantedBy=multi-user.target
"""
 (Path('/etc/systemd/system')/(name+'-'+component+'.service')).write_text(unit)
runtime=root/'.runtime';runtime.mkdir(exist_ok=True)
subprocess.run(['chown',name+':'+name,str(runtime)],check=True)
subprocess.run(['systemctl','daemon-reload'],check=True)
print(env+' service units installed')
