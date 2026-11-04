import assert from 'node:assert/strict';
import {randomBytes,createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
const require=createRequire(new URL('../.runtime/browser-tools/package.json',import.meta.url)),{chromium}=require('playwright');
const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})}),token=randomBytes(32).toString('hex'),id=createHash('sha256').update(token).digest('hex');
const admin=await db.admin.create({data:{email:'hero-ui-'+randomBytes(7).toString('hex')+'@example.invalid',passwordHash:'unusable-fixture',role:'OWNER'}});
await db.authSession.create({data:{id,adminId:admin.id,mfaVerified:true,expiresAt:new Date(Date.now()+3600000)}});const original=await db.heroVisual.findUnique({where:{id:'homepage'}}),browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addCookies([{name:'rewards_test_admin',value:token,url:'http://127.0.0.1:18480',httpOnly:true,sameSite:'Lax'}]);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:18480/tr/admin#tasks/new',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Gelişmiş / klasik görev',exact:true}).click().catch(async error=>{console.error('HeroUI',errors,await page.locator('body').innerText());await page.screenshot({path:'.runtime/admin-ui-v051/hero-failure.png'});throw error;});await page.getByLabel('Doğrulama yöntemi').selectOption('TELEGRAM_MEMBERSHIP');assert.equal(await page.getByLabel('Doğrulama yöntemi').inputValue(),'TELEGRAM_MEMBERSHIP');await page.goto('http://127.0.0.1:18480/tr/admin#settings/system');await page.locator('summary').filter({hasText:'Ana sayfa görselini yönet'}).click();await page.getByLabel('GIF dosyası (maksimum 5 MB; 1200 × 1200 px)').setInputFiles('.runtime/hero-fixture.gif');await page.locator('.hero-preview img').waitFor();await page.screenshot({path:'.runtime/hero-admin-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Kaydet ve yayınla'}).click();await page.getByRole('status').filter({hasText:'GIF yayınlandı'}).waitFor({timeout:10000});
 let meta=await(await page.request.get('http://127.0.0.1:18480/api/hero')).json();assert.ok(meta.url);const sha=meta.url.split('/').pop();
 const before=await(await page.request.get('http://127.0.0.1:18480'+meta.url)).body();assert.ok(before.length>20);
 execFileSync('systemctl',['restart','rewards-test-api']);await new Promise(r=>setTimeout(r,3000));meta=await(await page.request.get('http://127.0.0.1:18480/api/hero')).json();assert.ok(meta.url.endsWith(sha));const after=await(await page.request.get('http://127.0.0.1:18480'+meta.url)).body();assert.deepEqual(after,before);
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.screenshot({path:'.runtime/hero-admin-mobile.png',fullPage:true});
 await page.getByRole('button',{name:/GIF.*geri yükle/}).click();await page.getByRole('status').filter({hasText:'özgün'}).waitFor();assert.equal((await(await page.request.get('http://127.0.0.1:18480/api/hero')).json()).url,null);assert.deepEqual(errors,[]);
 console.log('PASS: Owner upload/preview/publish/remove through admin UI; GIF remains available after API restart; mobile layout fits; original hero restored.');
}finally{
 await browser.close();await db.heroVisual.deleteMany({where:{id:'homepage'}});if(original)await db.heroVisual.create({data:original});await db.auditEvent.deleteMany({where:{actor:admin.id}});await db.admin.delete({where:{id:admin.id}});await db.$disconnect();
}