import {Injectable,ServiceUnavailableException} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import Redis from 'ioredis';
@Injectable()
export class DataService {
 db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:5000})});
 redis=new Redis(process.env.REDIS_URL!,{maxRetriesPerRequest:1});
 async health(){
  try{
   await this.db.campaign.count();await this.db.ledgerEntry.count();await this.redis.ping();
   const beat=await this.redis.get('worker:heartbeat');
   if(!beat||Date.now()-Number(beat)>45000)throw new Error();
   return {status:'ok',environment:process.env.APP_ENV,database:'ok',redis:'ok',worker:'ok',claimsPaused:true};
  }catch{throw new ServiceUnavailableException('Dependency unavailable');}
 }
 audit(actor:string,action:string,resource:string){return this.db.auditEvent.create({data:{actor,action,resource}});}
}
