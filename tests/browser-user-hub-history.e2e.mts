import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../.runtime/browser-tools/package.json',import.meta.url)),{chromium}=require('playwright');
assert.equal(process.env.APP_ENV,'test');
const origin='http://127.0.0.1:18480',config=await(await fetch(origin+'/api/config')).json(),browser=await chromium.launch({headless:true,args:['--no-sandbox']}),page=await browser.newPage(),writes:string[]=[];
try{
 const task={id:'older-history',title:'Older reward fixture',platform:'TELEGRAM',rewardWei:'1000000000000000000',verification:{type:'TELEGRAM_MEMBERSHIP',instructions:'Admin instruction'},campaign:{title:'Fixture'},state:'REWARDED',available:true,history:{status:'APPROVED',reward:{status:'AVAILABLE',amountWei:'1000000000000000000'}}};
 await page.route('**/api/**',route=>{const request=route.request(),path=new URL(request.url()).pathname;if(request.method()!=='GET'){writes.push(path);return route.abort();}const data=path==='/api/config'?config:path==='/api/auth/me'?{id:'older-user',wallet:'0x1111111111111111111111111111111111111111'}:path==='/api/tasks'||path==='/api/me/social-tasks'?[task]:path==='/api/me/ledger'?{balances:{AVAILABLE:task.rewardWei},entries:[]}:path==='/api/social/accounts'?[{platform:'TELEGRAM',ready:true,status:'ready',account:{accountName:'Fixture',expiresAt:null,scopes:[]}}]:[];return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});});
 await page.goto(origin+'/tr/dashboard#view=tasks&platform=TELEGRAM&task=older-history&step=3');await page.locator('.hub-wizard p').filter({hasText:'İç ödül bakiyenize kaydedildi.'}).waitFor();assert.equal(await page.getByRole('button',{name:'Üyeliğimi doğrula',exact:true}).count(),0);assert.match(await page.locator('.hub-platform[aria-pressed=true]').innerText(),/1 görev\s*·\s*1 tamamlanan/);assert.equal(writes.length,0);
 console.log('PASS older reward remains read-only and counted from server task history when latest history page is empty; GET fixtures only');
}finally{await browser.close();}
