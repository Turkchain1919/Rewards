import test from 'node:test';
import assert from 'node:assert/strict';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import Redis from 'ioredis';
const enabled=process.env.RUN_INTEGRATION==='true';
test('isolated PostgreSQL ledger, campaigns, Redis and HTTP dependencies',{skip:!enabled},async()=>{
 assert.equal(process.env.APP_ENV,'test');
 assert.match(process.env.DATABASE_URL || '',/rewards_test/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:5000})});const redis=new Redis(process.env.REDIS_URL!);
 const marker='integration-'+Date.now();
 try {
  await redis.set(marker,'test','EX',30);assert.equal(await redis.get(marker),'test');
  const user=await db.user.create({data:{wallet:marker}});
  const entry={userId:user.id,amountWei:'1000000000000000001',idempotencyKey:marker,reason:'integration'};
  await db.ledgerEntry.create({data:entry});
  await assert.rejects(()=>db.ledgerEntry.create({data:entry}));
  assert.equal((await db.ledgerEntry.findUniqueOrThrow({where:{idempotencyKey:marker}})).amountWei.toFixed(),'1000000000000000001');
  const draft=await db.campaign.create({data:{title:marker,description:'test draft'}});
  const response=await fetch('http://127.0.0.1:'+process.env.API_PORT+'/api/campaigns');
  assert.equal(response.status,200);
  const campaigns=await response.json() as {id:string}[];
  assert.equal(campaigns.some(c=>c.id===draft.id),false);
  const health=await fetch('http://127.0.0.1:'+process.env.API_PORT+'/api/health');assert.equal(health.status,200);
 } finally {
  await db.ledgerEntry.deleteMany({where:{idempotencyKey:marker}});
  await db.user.deleteMany({where:{wallet:marker}});
  await db.campaign.deleteMany({where:{title:marker}});
  await redis.del(marker);await redis.quit();await db.$disconnect();
 }
});
