import {Worker,Queue} from 'bullmq';
import Redis from 'ioredis';
if(!['test','production'].includes(process.env.APP_ENV || '')) throw new Error('Invalid environment');
if(process.env.REWARD_CLAIMS_PAUSED!=='true'&&process.env.MASTER_PAYOUTS_AUTHORIZED!=='true') throw new Error('Claims must remain paused');
const connection=new Redis(process.env.REDIS_URL!,{maxRetriesPerRequest:null});
const prefix='rewards-'+process.env.APP_ENV;
const queue=new Queue('maintenance',{connection,prefix});
const worker=new Worker('maintenance',async job=>{
 if(job.name!=='heartbeat') throw new Error('Unknown job');
 await connection.set('worker:heartbeat',String(Date.now()),'EX',45);
 return {environment:process.env.APP_ENV};
},{connection,prefix,concurrency:1});
worker.on('error',()=>console.error('Worker dependency failure'));
awaitStart();
function awaitStart(){
 void queue.upsertJobScheduler('heartbeat',{every:15000},{name:'heartbeat',data:{}}).catch(()=>{console.error('Scheduler failed');process.exit(1);});
}
process.on('SIGTERM',()=>{void worker.close().then(()=>queue.close()).then(()=>connection.quit()).then(()=>process.exit(0));});
