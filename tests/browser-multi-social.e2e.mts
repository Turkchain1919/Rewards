import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {socialTaskCatalog} from '../apps/api/src/social-catalog';
import {taskInput} from '../apps/api/src/engine';
const require=createRequire(new URL('../.runtime/browser-tools/package.json',import.meta.url)),{chromium}=require('playwright');
assert.equal(process.env.APP_ENV,'test');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const lang of ['tr','en'])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),captured=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  const account={id:'multi-ui-group-account',platform:'TELEGRAM',accountType:'GROUP',name:'Turkchain1919',accountId:'-1003676977941',username:'Turkchain1919',profileUrl:'https://t.me/Turkchain1919',defaultTargetUrl:'https://t.me/Turkchain1919',enabled:true,connectionStatus:'CONNECTED'},campaign={id:'multi-ui-campaign',title:'Preview Campaign',description:'UI-only campaign fixture; no database writes.',status:'DRAFT',budgetWei:'100000000000000000000',allocatedWei:'0',tasks:[]};
  const definitions=socialTaskCatalog.map(d=>({...d,canPublish:d.code==='TELEGRAM_JOIN_GROUP',configurationStatus:d.platform==='TELEGRAM'?'CONFIGURED':'NOT_CONFIGURED'}));
  await page.route('**/api/admin/**',async route=>{
   const request=route.request(),path=new URL(request.url()).pathname.replace('/api/admin/','');
   if(request.method()!=='GET'){
    const body=request.postDataJSON();captured.push({path,body});
    if(path==='social/targets/resolve')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({platform:'TELEGRAM',objectType:'CHANNEL',objectId:'Turkchain1919',ownerAccountId:account.accountId,ownershipVerified:true,status:'VERIFIED_SUPPORTED',title:account.name})});
    assert.equal(path,'social/tasks/batch');assert.equal(body.items.length,1);const parsed=taskInput.parse(body.items[0]);assert.equal(parsed.socialTaskCode,'TELEGRAM_JOIN_GROUP');return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({alreadyProcessed:false,tasks:[{...parsed,id:'multi-ui-saved-task',enabled:false}]})});
   }
   const value=path==='me'?{email:'preview@example.invalid',role:'OWNER',mfaVerified:true,enrolled:true}:path==='setup-status'?{setupRequired:false}:path==='summary'?{users:0,campaigns:1,tasks:0,pending:0,rewards:{AVAILABLE:'0'}}:path==='campaigns'?[campaign]:path==='official-accounts'?[account]:path==='social/task-catalog'?definitions:[];
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
  });
  await page.goto('http://127.0.0.1:18480/'+lang+'/admin#tasks/new',{waitUntil:'domcontentloaded'});
  const builder=page.locator('.social-task-builder');await builder.waitFor();const platform=builder.locator('select[name="social_platform"]'),tasks=builder.locator('select[name="social_task_code"]');assert.equal(await platform.locator('option').count(),8);
  for(const key of ['X','YOUTUBE','INSTAGRAM','TELEGRAM','FACEBOOK','KICK','TWITCH','TIKTOK']){await platform.selectOption(key);const values=await tasks.locator('option').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('value')).filter(Boolean));assert.ok(values.length>0&&values.every(v=>v.startsWith(key+'_')));}
  await platform.selectOption('YOUTUBE');await tasks.selectOption('YOUTUBE_SUBSCRIBE');assert.ok((await builder.innerText()).includes('POLICY_RESTRICTED'));await platform.selectOption('TELEGRAM');
  await builder.locator('select[name="social_account"]').selectOption(account.id);await tasks.selectOption('TELEGRAM_JOIN_GROUP');await builder.getByRole('button',{name:lang==='tr'?'Görevi taslak listesine ekle':'Add task to draft list',exact:true}).click();
  await builder.getByRole('button',{name:lang==='tr'?'İleri':'Next',exact:true}).click();await builder.getByRole('button',{name:lang==='tr'?'API ile hedefi ve sahipliğini doğrula':'Validate target and ownership through API',exact:true}).click();await builder.getByText(lang==='tr'?'Hedef sahipliği doğrulandı.':'Target ownership verified.',{exact:false}).waitFor();
  await builder.locator('textarea[name="social_titleTr_0"]').fill('Turkchain Telegram Topluluğuna Katıl');await builder.locator('textarea[name="social_titleEn_0"]').fill('Join the Turkchain Telegram Community');await builder.getByRole('button',{name:lang==='tr'?'İleri':'Next',exact:true}).click();await builder.locator('input[name="social_start_0"]').fill('2026-11-04T15:00');await builder.locator('input[name="social_end_0"]').fill('2026-11-05T15:00');
  await builder.getByRole('button',{name:lang==='tr'?'İleri':'Next',exact:true}).click();await builder.getByRole('button',{name:lang==='tr'?'Taslak olarak kaydet':'Save as draft',exact:true}).click();assert.equal(captured.filter(c=>c.path==='social/tasks/batch').length,0,'policy review confirmation required');
  await builder.locator('input[name="social_policy_reviewed"]').check();await builder.getByRole('button',{name:lang==='tr'?'Taslak olarak kaydet':'Save as draft',exact:true}).click();await builder.getByRole('heading',{name:lang==='tr'?'Kaydedilen taslaklar':'Saved drafts',exact:true}).waitFor();
  const saved=captured.find(c=>c.path==='social/tasks/batch').body.items[0];assert.equal(saved.rewardWei,'1000000000000000000');assert.equal(saved.budgetWei,'25000000000000000000');assert.equal(saved.verification.maxRewards,25);assert.equal(saved.startsAt,'2026-11-04T12:00:00.000Z');assert.equal(saved.endsAt,'2026-11-05T12:00:00.000Z');assert.equal(saved.repeatable,false);assert.equal(captured.some(c=>c.path.endsWith('/publish')),false);assert.equal(saved.targetObjectId,account.accountId);
  assert.deepEqual(errors,[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.screenshot({path:'.runtime/multi-social/builder-'+lang+'-'+width+'.png',fullPage:true});await context.close();
 }
 console.log('PASS eight-platform TR/EN1440/390 dynamic catalog, policy lock, owned-target preview, UTC conversion, independent budget and draft-only batch; all requests intercepted');
}finally{await browser.close();}
