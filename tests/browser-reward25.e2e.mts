import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../.runtime/browser-tools/package.json',import.meta.url)),{chromium}=require('playwright');
assert.equal(process.env.APP_ENV,'test');
const payload=JSON.parse(readFileSync(new URL('../docs/TELEGRAM_REWARD25_TASK.json',import.meta.url),'utf8'));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const lang of ['tr','en'])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();
  await page.route('**/api/tasks*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{...payload,id:'quota-browser-preview',campaign:{title:'TELEGRAM'},rewardQuota:{maxRewards:25,rewardedUsers:0,remainingRewards:25}}])}));
  await page.goto('http://127.0.0.1:18480/'+lang+'/dashboard',{waitUntil:'domcontentloaded'});
  const card=page.locator('article').filter({has:page.getByRole('heading',{name:payload.localizedContent[lang].title,exact:true})});
  await card.waitFor();assert.equal(await card.locator('ol li').count(),0);
  assert.match(await card.innerText(),/1(?:\.0)? TURK/);assert.ok((await card.innerText()).includes('25 / 25'));
  await card.getByRole('button',{name:lang==='tr'?'Görevi başlat':'Start task',exact:true}).click();await page.getByRole('button',{name:lang==='tr'?'Devam et':'Continue',exact:true}).waitFor();await page.goto('http://127.0.0.1:18480/'+lang+'/dashboard#view=tasks&platform=TELEGRAM&task=quota-browser-preview&step=2');const wizard=page.locator('.hub-wizard');await wizard.waitFor();assert.equal(await wizard.locator('section ol li').count(),5);assert.ok((await wizard.innerText()).includes(lang==='tr'?'yalnızca bir kez':'once per user'));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  await page.screenshot({path:'.runtime/reward25-prep/card-'+lang+'-'+width+'.png',fullPage:true});
  await context.close();
 }
 console.log('PASS: 1 TURK / 25 reward slots, TR/EN five-step cards, one-time/internal credit notice and mobile layout; GET-only fixture');
}finally{await browser.close();}
