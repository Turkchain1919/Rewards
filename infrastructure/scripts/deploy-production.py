#!/usr/bin/env python3
import os,json,subprocess,shutil,datetime,time
from pathlib import Path
base=Path('/var/www/rewards.turkscan.com')
test=base/'REWARDSTEST';prod=base/'rewards'
def run(args,**kw):return subprocess.run(args,check=True,**kw)
def git(path,*args):return subprocess.check_output(['git','-C',str(path),*args],text=True).strip()
sha=git(test,'rev-parse','HEAD')
if git(test,'status','--porcelain'):raise SystemExit('TEST worktree must be clean')
marker=json.loads((test/'.runtime/validated.json').read_text())
if marker.get('sha')!=sha or marker.get('status')!='passed':raise SystemExit('No matching validated release')
if shutil.disk_usage(base).free < 2*1024**3:raise SystemExit('At least 2 GiB free required')
release=prod/'.releases'/sha
if release.exists():raise SystemExit('Release already exists; inspect before retry')
release.mkdir(parents=True)
archive=run(['git','-C',str(test),'archive',sha],stdout=subprocess.PIPE).stdout
run(['tar','-x','-C',str(release)],input=archive)
for rel in ['node_modules','apps/api/dist','apps/web/.next']:
 shutil.copytree(test/rel,release/rel,symlinks=True)
current=prod/'current';previous=os.readlink(current) if current.is_symlink() else None
manifest=prod/'.runtime/deployment.json'
prior=json.loads(manifest.read_text()) if manifest.exists() else None
env=os.environ.copy();env['REWARDS_TARGET']=str(prod)
run(['bash',str(test/'infrastructure/scripts/backup-database.sh')],env=env)
if (prod/'.gitignore').exists() and not git(prod,'ls-files','.gitignore'):
 shutil.move(prod/'.gitignore',prod/'backups/bootstrap.gitignore')
run(['git','-C',str(prod),'fetch',str(test),sha],stdout=subprocess.DEVNULL)
run(['git','-C',str(prod),'merge','--ff-only',sha],stdout=subprocess.DEVNULL)
env.update(json.loads(subprocess.check_output(['node','-e','const fs=require("node:fs"),dotenv=require(process.argv[2]);process.stdout.write(JSON.stringify(dotenv.parse(fs.readFileSync(process.argv[1]))));',str(prod/'.env'),str(test/'node_modules/dotenv')],text=True)))
if env.get('APP_ENV')!='production' or env.get('REWARD_CLAIMS_PAUSED')!='true':raise SystemExit('Invalid production environment')
run([str(release/'node_modules/.bin/prisma'),'migrate','deploy'],cwd=release,env=env)
envpath=prod/'.env'
lines=[x for x in envpath.read_text().splitlines() if not x.startswith('RELEASE_SHA=')]
tmp=prod/'.env.release.tmp';tmp.write_text('\n'.join(lines)+'\nRELEASE_SHA='+sha+'\n');tmp.chmod(0o600);os.replace(tmp,envpath)
run(['python3',str(test/'infrastructure/scripts/install-services.py'),'production'])
def switch(dest):
 tmp=prod/'.current.next'
 if tmp.is_symlink():tmp.unlink()
 tmp.symlink_to(dest);os.replace(tmp,current)
def restart():run(['systemctl','restart','rewards-prod-api','rewards-prod-web','rewards-prod-worker'])
def health():
 for _ in range(20):
  r=subprocess.run(['bash',str(test/'infrastructure/scripts/check-health.sh')],env={**os.environ,'REWARDS_TARGET':str(prod)},stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  if r.returncode==0:return
  time.sleep(2)
 raise RuntimeError('Production health failed')
nginx=Path('/etc/nginx/sites-available/rewards.turkscan.com')
backup=prod/'backups'/('nginx-before-'+sha)
shutil.copy2(nginx,backup)
status='failed'
try:
 switch(str(release));restart();health()
 shutil.copyfile(test/'infrastructure/nginx/rewards.conf',nginx)
 run(['nginx','-t'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 run(['systemctl','reload','nginx'])
 for attempt in range(20):
  probes=[subprocess.run(['curl','--fail','--silent','--show-error','--max-time','5',url],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode for url in ['https://rewards.turkscan.com/api/health','https://rewards.turkscan.com/']]
  if probes==[0,0]:break
  time.sleep(1)
 else:raise RuntimeError('Public TLS/health failed after reload grace period')
 if previous:
  prev=prod/'previous'
  if prev.is_symlink():prev.unlink()
  prev.symlink_to(previous)
 run(['systemctl','enable','rewards-prod-api','rewards-prod-web','rewards-prod-worker'],stdout=subprocess.DEVNULL)
 status='healthy'
except Exception:
 shutil.copy2(backup,nginx)
 run(['nginx','-t'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 run(['systemctl','reload','nginx'])
 if previous:switch(previous);restart();health()
 else:run(['systemctl','stop','rewards-prod-api','rewards-prod-web','rewards-prod-worker'])
 raise
finally:
 report={'git_commit_sha':sha,'release_version':json.loads((test/'package.json').read_text())['version'],'deployment_date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'deployment_status':status,'build_result':'passed','test_result':'passed','database_migration_version':sorted(p.name for p in (test/'prisma/migrations').iterdir() if p.is_dir())[-1],'production_health_status':status,'previous_release':previous,'github_status':'pending'}
 manifest.parent.mkdir(exist_ok=True)
 tmp=manifest.with_suffix('.tmp');tmp.write_text(json.dumps(report,indent=2)+'\n');os.replace(tmp,manifest)
print('Production healthy at '+sha)
