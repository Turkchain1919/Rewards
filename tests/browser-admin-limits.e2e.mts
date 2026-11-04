import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../.runtime/browser-tools/package.json',import.meta.url)),{chromium}=require('playwright');
assert.equal(process.env.APP_ENV,'test');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const lang of ['tr','en'])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),captured=[];
  const task={id:'limits-preview-task',campaignId:'limits-preview-campaign',title:'Limits Preview',platform:'TELEGRAM',kind:'SOCIAL_INTERACTION',rewardWei:'1000000000000000000',verification:{type:'TELEGRAM_MEMBERSHIP',instructions:'Join the group and verify membership.',maxRewards:25},enabled:true,publishedAt:'2026-11-03T00:00:00Z',archivedAt:null};
  let limits={id:task.id,title:task.title,rewardWei:task.rewardWei,maxRewards:25,usedRewards:2,startsAt:'2026-11-01T00:00:00.000Z',endsAt:'2027-01-01T00:00:00.000Z',enabled:true,archived:false,campaignTitle:'TELEGRAM',campaignBudgetWei:'25000000000000000000',allocatedWei:'2000000000000000000',campaignTasks:1,expectedRulesHash:'a'.repeat(64)};
  await page.route('**/api/admin/**',async route=>{
   const request=route.request(),path=new URL(request.url()).pathname.replace('/api/admin/','');
   if(request.method()!=='GET'){assert.equal(request.method(),'PATCH');assert.equal(path,'tasks/'+task.id+'/limits');const body=request.postDataJSON();captured.push(body);assert.equal(body.confirmId,task.id);assert.equal(body.expectedRulesHash,limits.expectedRulesHash);limits={...limits,...body,enabled:false,expectedRulesHash:'b'.repeat(64)};return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(limits)});}
   const value=path==='me'?{email:'preview@example.invalid',role:'OWNER',mfaVerified:true,enrolled:true}:path==='setup-status'?{setupRequired:false}:path==='summary'?{users:1,campaigns:1,tasks:1,pending:0,rewards:{AVAILABLE:'0'}}:path==='campaigns'?[{id:task.campaignId,title:'TELEGRAM',status:'ACTIVE',description:'Preview campaign for UI only.',budgetWei:limits.campaignBudgetWei,allocatedWei:limits.allocatedWei,tasks:[task]}]:path==='tasks/'+task.id+'/limits'?limits:[];
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
  });
  await page.goto('http://127.0.0.1:18480/'+lang+'/admin#tasks',{waitUntil:'domcontentloaded'});
  const open=async()=>{const button=page.getByRole('button',{name:lang==='tr'?'Ödül ve sınırlar':'Reward and limits',exact:true});if(!await button.isVisible())await page.locator('.admin-row-actions>summary').first().click();await button.click();};await open();let dialog=page.getByRole('dialog');await dialog.waitFor();
  assert.equal(await dialog.locator('input[name="maxRewards"]').getAttribute('min'),'2');
  await dialog.locator('input[name="reward"]').fill('2');await dialog.locator('input[name="maxRewards"]').fill('30');await dialog.locator('input[name="budget"]').fill('60');
  const save=()=>dialog.getByRole('button',{name:lang==='tr'?'Değişiklikleri kaydet':'Save changes',exact:true}).click();await save();assert.equal(captured.length,0,'confirmation checkbox required');
  await dialog.locator('input[name="confirm"]').check();await save();await dialog.waitFor({state:'hidden'});assert.equal(captured[0].rewardWei,'2000000000000000000');assert.equal(captured[0].maxRewards,30);assert.equal(captured[0].campaignBudgetWei,'60000000000000000000');
  await open();dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:lang==='tr'?'Kontenjan sınırını kaldır':'Remove quota limit',exact:true}).click();await dialog.getByRole('button',{name:lang==='tr'?'Tarih sınırlarını kaldır':'Remove date limits',exact:true}).click();assert.equal(await dialog.locator('input[name="maxRewards"]').inputValue(),'');await dialog.locator('input[name="confirm"]').check();await save();await dialog.waitFor({state:'hidden'});assert.equal(captured[1].maxRewards,null);assert.equal(captured[1].startsAt,null);assert.equal(captured[1].endsAt,null);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await context.close();
 }
 console.log('PASS admin limits TR/EN desktop/mobile confirmation, future reward/budget/quota edit and remove quota/date actions; all writes intercepted');
}finally{await browser.close();}
