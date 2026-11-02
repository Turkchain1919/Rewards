import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {digest} from '../apps/api/src/security';
assert.equal(process.env.APP_ENV,'test');assert.match(process.env.DATABASE_URL||'',/rewards_test/);
const require=createRequire(new URL('../.runtime/browser-tools/package.json',import.meta.url)),{chromium}=require('playwright');
const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})}),nonce=randomBytes(7).toString('hex'),token=randomBytes(32).toString('hex');
const admin=await db.admin.create({data:{email:'lifecycle-ui-'+nonce+'@example.invalid',passwordHash:'fixture',role:'OWNER'}});
await db.authSession.create({data:{id:digest(token),adminId:admin.id,mfaVerified:true,expiresAt:new Date(Date.now()+600000)}});
const network=await db.blockchainNetwork.findFirstOrThrow({where:{isActive:true}});
const campaign=await db.campaign.create({data:{title:'UI fixture '+nonce,description:'UI-only test campaign',budgetWei:'100',networkId:network.id,status:'ACTIVE'}});
const task=await db.task.create({data:{campaignId:campaign.id,title:'UI task '+nonce,platform:'TURKCHAIN',kind:'EDUCATION',rewardWei:'10',policyReviewed:true,enabled:true,publishedAt:new Date(),localizedContent:{tr:{title:'Türkçe görev '+nonce,description:'Türkçe görev açıklaması',steps:['Türkçe adım'],rewardCondition:'Bir kez ödül'},en:{title:'English task '+nonce,description:'English task description',steps:['English step'],rewardCondition:'One reward'}},verification:{type:'MANUAL',instructions:'Explain the Turkchain ecosystem in your own words.',minLength:20}}});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']}),results=[];
try{
 for(const lang of ['tr','en'])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900}});await context.addCookies([{name:'rewards_test_admin',value:token,url:'http://127.0.0.1:18480',httpOnly:true,sameSite:'Lax'}]);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:18480/'+lang+'/admin');await page.getByRole('button',{name:lang==='tr'?'Görevler':'Missions',exact:true}).click();
  await page.getByLabel(lang==='tr'?'Durum filtresi':'Status filter').selectOption('Aktif');
  const card=page.locator('article.panel').filter({has:page.getByRole('heading',{name:task.title,exact:true})});
  await card.getByRole('button',{name:lang==='tr'?'Düzenle':'Edit',exact:true}).click();
  await page.getByText(lang==='tr'?'Yayınlanmış görevlerde yalnızca içerik ve tarihler düzenlenir; ödül kuralları korunur.':'Published tasks allow content and date edits; reward rules are preserved.',{exact:true}).waitFor();
  assert.equal(await page.locator('input[name="reward"]').count(),0);assert.equal(await page.locator('textarea[name="en_title"]').inputValue(),'English task '+nonce);
  const saved=page.waitForResponse(r=>r.url().includes('/tasks/'+task.id+'/content')&&r.request().method()==='PATCH');await page.getByRole('button',{name:lang==='tr'?'Kaydet':'Save',exact:true}).click();assert.equal((await saved).status(),200);
  await card.getByRole('button',{name:lang==='tr'?'Sil':'Delete',exact:true}).click();
  const dialog=page.getByRole('dialog');await dialog.waitFor();assert.ok((await dialog.innerText()).includes(task.title));assert.ok((await dialog.innerText()).includes(lang==='tr'?'Kalıcı silme geri alınamaz.':'Permanent deletion cannot be undone.'));
  await page.screenshot({path:'.runtime/lifecycle-'+lang+'-'+width+'.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  await dialog.getByRole('button',{name:lang==='tr'?'Vazgeç':'Cancel',exact:true}).click();
  await page.getByRole('button',{name:lang==='tr'?'Kampanyalar':'Campaigns',exact:true}).click();
  const campaignCard=page.locator('article.panel').filter({has:page.getByRole('heading',{name:campaign.title,exact:true})});await campaignCard.getByRole('button',{name:lang==='tr'?'Sil':'Delete',exact:true}).click();await dialog.waitFor();assert.ok((await dialog.innerText()).includes(lang==='tr'?'Arşivlemeyi onayla':'Confirm archive'));await dialog.getByRole('button',{name:lang==='tr'?'Vazgeç':'Cancel',exact:true}).click();
  await page.goto('http://127.0.0.1:18480/'+lang+'/dashboard');await page.getByRole('heading',{name:(lang==='tr'?'Türkçe görev ':'English task ')+nonce,exact:true}).waitFor();assert.ok((await page.locator('body').innerText()).includes(lang==='tr'?'Gerçek cüzdan transferleri şu anda kapalıdır.':'Transfers to real wallets are currently disabled.'));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));assert.deepEqual(errors,[]);
  results.push({lang,width,dialog:true,localizedTask:true,overflow:false,pageErrors:errors});await context.close();
 }
 // Execute a confirmed archive in the real browser and verify filtering.
 const context=await browser.newContext();await context.addCookies([{name:'rewards_test_admin',value:token,url:'http://127.0.0.1:18480'}]);const page=await context.newPage();await page.goto('http://127.0.0.1:18480/en/admin');await page.getByRole('button',{name:'Missions',exact:true}).click();const card=page.locator('article.panel').filter({has:page.getByRole('heading',{name:task.title,exact:true})});await card.getByRole('button',{name:'Archive',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirm archive',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await page.getByLabel('Status filter').selectOption('Arşivlenmiş');await card.waitFor();assert.ok((await card.innerText()).includes('Archived'));
 await page.goto('http://127.0.0.1:18480/en/dashboard');await page.getByRole('heading',{name:'Community missions',exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'English task '+nonce,exact:true}).count(),0);
 writeFileSync('docs/evidence/v045-browser.json',JSON.stringify({results,archiveAndFilter:true,archivedTaskHidden:true},null,2));console.log('PASS lifecycle TR/EN desktop/mobile dialogs, localized cards, archive/filter and user visibility');
}finally{await browser.close();await db.task.deleteMany({where:{campaignId:campaign.id}});await db.campaign.delete({where:{id:campaign.id}});await db.auditEvent.deleteMany({where:{actor:admin.id}});await db.admin.delete({where:{id:admin.id}});await db.$disconnect();}
