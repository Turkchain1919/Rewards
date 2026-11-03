import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../.runtime/browser-tools/package.json',import.meta.url)),{chromium}=require('playwright');
assert.equal(process.env.APP_ENV,'test');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const lang of ['tr','en'])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();
  await page.route('**/api/admin/**',async route=>{
   assert.equal(route.request().method(),'GET');const path=new URL(route.request().url()).pathname.replace('/api/admin/','');
   const value=path==='me'?{email:'preview@example.invalid',role:'OWNER',mfaVerified:true,enrolled:true}:path==='setup-status'?{setupRequired:false}:path==='summary'?{users:0,campaigns:0,tasks:0,pending:0,rewards:{AVAILABLE:'0'}}:path==='integrations'?[{platform:'INSTAGRAM',enabled:true,status:'awaiting_credentials',apiStatus:'unconfigured',version:0,authMode:'oauth',callbackUri:'https://rewards.turkscan.com/api/admin/official-accounts/instagram/callback',graphVersion:'',missing:['INSTAGRAM_APP_ID','INSTAGRAM_APP_SECRET','META_GRAPH_VERSION'],configuredFields:[]}]:[];
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
  });
  await page.goto('http://127.0.0.1:18480/'+lang+'/admin',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Social API',exact:true}).click();await page.getByRole('combobox',{name:lang==='tr'?'Platform seç':'Select platform',exact:true}).selectOption('INSTAGRAM');
  const info=page.getByRole('complementary',{name:'Instagram'});await info.waitFor();const text=await info.innerText();
  assert.ok(text.includes('Business'));assert.ok(text.includes('instagram_business_basic'));assert.ok(text.includes(lang==='tr'?'ödül görevleri':'reward missions'));
  for(const field of ['clientId','clientSecret','accessToken'])assert.equal(await page.locator('input[name="'+field+'"]').getAttribute('type'),'password');
  await page.getByRole('button',{name:lang==='tr'?'Görevler':'Missions',exact:true}).click();
  const cap=page.locator('input[name="maxRewards"]');await cap.waitFor();await cap.fill('25');assert.equal(await cap.inputValue(),'25');assert.equal(await cap.getAttribute('min'),'1');assert.equal(await cap.getAttribute('step'),'1');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  await context.close();
 }
 console.log('PASS: owner Instagram credential fields masked, TR/EN setup and unsupported-verifier requirements, maxRewards editor, desktop/mobile; all GET fixtures only');
}finally{await browser.close();}
