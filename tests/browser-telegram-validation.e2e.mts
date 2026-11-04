import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {officialInput} from '../apps/api/src/official-accounts';
const require=createRequire(new URL('../.runtime/browser-tools/package.json',import.meta.url)),{chromium}=require('playwright');
assert.equal(process.env.APP_ENV,'test');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const lang of ['tr','en'])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),captured=[];
  const fixture={id:'validation-preview-account',platform:'TELEGRAM',accountType:'GROUP',name:'Telegram validation preview',username:'Turkchain1919',accountId:'-1003676977941',profileUrl:'https://t.me/Turkchain1919',defaultTargetUrl:'https://t.me/Turkchain1919',enabled:true,isDefault:true,connectionStatus:'CONNECTED',hasCredential:false,lastSuccessAt:null,lastError:null};
  await page.route('**/api/admin/**',async route=>{
   const request=route.request(),path=new URL(request.url()).pathname.replace('/api/admin/','');
   if(request.method()!=='GET'){
    assert.equal(request.method(),'PUT');assert.equal(path,'official-accounts/'+fixture.id);const body=request.postDataJSON();captured.push(body);const parsed=officialInput.safeParse(body);
    return route.fulfill({status:parsed.success?200:400,contentType:'application/json',body:JSON.stringify(parsed.success?{...fixture,...parsed.data}:{message:'Invalid request fields',errors:parsed.error.issues.map(i=>({field:i.path.join('.'),message:i.message}))})});
   }
   const value=path==='me'?{email:'preview@example.invalid',role:'OWNER',mfaVerified:true,enrolled:true}:path==='setup-status'?{setupRequired:false}:path==='summary'?{users:0,campaigns:0,tasks:0,pending:0,rewards:{AVAILABLE:'0'}}:path==='official-accounts'?[fixture]:path==='social-platforms'?[{key:'TELEGRAM',name:'Telegram',connector:'TELEGRAM'}]:path==='integrations'?[{platform:'TELEGRAM',name:'Telegram',enabled:true,status:'configured',oauthStatus:'ready',apiStatus:'ok',missing:[],apiMissing:[],availableTaskTypes:[],version:0}]:[];
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
  });
  await page.goto('http://127.0.0.1:18480/'+lang+'/admin#social/accounts',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:lang==='tr'?'Hesabı düzenle':'Edit Account',exact:true}).click();
  await page.locator('input[name="accountId"]').fill('1003676977941');await page.getByRole('button',{name:lang==='tr'?'Kaydet':'Save',exact:true}).click();const alert=page.locator('.notice[role="alert"]');await alert.waitFor();assert.ok((await alert.innerText()).includes(lang==='tr'?'negatif sayısal string':'negative numeric string'));
  await page.locator('input[name="accountId"]').fill('-1003676977941');const saved=page.waitForResponse(r=>r.request().method()==='PUT'&&r.url().includes(fixture.id));await page.getByRole('button',{name:lang==='tr'?'Kaydet':'Save',exact:true}).click();assert.equal((await saved).status(),200);assert.equal(captured.at(-1).accountId,'-1003676977941');assert.equal(typeof captured.at(-1).accountId,'string');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.screenshot({path:'.runtime/telegram-validation-'+lang+'-'+width+'.png',fullPage:true});await context.close();
 }
 console.log('PASS Telegram validation TR/EN desktop/mobile localized errors and negative string payload; browser writes intercepted only');
}finally{await browser.close();}
