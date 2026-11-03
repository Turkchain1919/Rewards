import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {maintainSocialTasks} from './social-maintenance';
import {validateTwitchConnections} from './social-token-maintenance';
import {Worker,Queue} from 'bullmq';
import Redis from 'ioredis';
if(!['test','production'].includes(process.env.APP_ENV || '')) throw new Error('Invalid environment');
if(process.env.REWARD_CLAIMS_PAUSED!=='true'&&process.env.MASTER_PAYOUTS_AUTHORIZED!=='true') throw new Error('Claims must remain paused');
const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:2})});
const connection=new Redis(process.env.REDIS_URL!,{maxRetriesPerRequest:null});
const prefix='rewards-'+process.env.APP_ENV;
const queue=new Queue('maintenance',{connection,prefix});
const worker=new Worker('maintenance',async job=>{
 if(job.name!=='heartbeat') throw new Error('Unknown job');
 await connection.set('worker:heartbeat',String(Date.now()),'EX',45);
 await maintainSocialTasks(db);
 return {environment:process.env.APP_ENV};
},{connection,prefix,concurrency:1});
const tokenQueue=new Queue('social-credentials',{connection,prefix});
const tokenWorker=new Worker('social-credentials',async job=>{if(job.name!=='validate-twitch')throw new Error('Unknown credentials job');return validateTwitchConnections(db,connection);},{connection,prefix,concurrency:1});
tokenWorker.on('error',()=>console.error('Social credential worker dependency failure'));
worker.on('error',()=>console.error('Worker dependency failure'));
awaitStart();
function awaitStart(){
 void tokenQueue.upsertJobScheduler('validate-twitch',{every:300000},{name:'validate-twitch',data:{}}).catch(()=>{console.error('Credential scheduler failed');process.exit(1);});
 void queue.upsertJobScheduler('heartbeat',{every:15000},{name:'heartbeat',data:{}}).catch(()=>{console.error('Scheduler failed');process.exit(1);});
}
process.on('SIGTERM',()=>{void worker.close().then(()=>tokenWorker.close()).then(()=>tokenQueue.close()).then(()=>queue.close()).then(()=>db.$disconnect()).then(()=>connection.quit()).then(()=>process.exit(0));});
