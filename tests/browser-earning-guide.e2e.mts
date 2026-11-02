import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../.runtime/browser-tools/package.json',import.meta.url)),{chromium}=require('playwright');
assert.equal(process.env.APP_ENV,'test');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const lang of ['tr','en'])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:18480/'+lang+'/dashboard',{waitUntil:'domcontentloaded'});
  const guide=page.getByRole('region',{name:lang==='tr'?'Nasıl TURK Kazanılır?':'How to Earn TURK?'});
  await guide.waitFor();assert.equal(await guide.locator('ol > li').count(),6);
  assert.ok((await guide.locator('ol > li').first().innerText()).includes(lang==='tr'?'zorunlu ilk':'required first'));
  assert.ok((await guide.locator('ol > li').nth(1).innerText()).includes(lang==='tr'?'yalnızca':'only when'));
  assert.ok((await guide.innerText()).includes('Turkchain1919'));
  assert.ok((await guide.innerText()).includes(lang==='tr'?'sunucunun belirlediği':'server-defined'));
  assert.ok((await guide.innerText()).includes(lang==='tr'?'claim işlemleri şu anda kapalıdır':'claims are currently disabled'));
  await guide.getByRole('link',{name:lang==='tr'?'İlk adım: cüzdanını bağla':'First step: connect your wallet'}).click();assert.ok(page.url().endsWith('#wallet-access'));
  assert.equal(await page.locator('#wallet-access').count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));assert.deepEqual(errors,[]);
  await page.screenshot({path:'.runtime/earning-guide-'+lang+'-'+width+'.png',fullPage:true});
  await context.close();
 }
 console.log('PASS: TR/EN six-step earning guide, wallet-first/conditional-social copy, Telegram example, internal-credit notice and mobile layout');
}finally{await browser.close();}
