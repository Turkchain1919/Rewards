import 'reflect-metadata';
import {Controller, Get, Module, Injectable, ServiceUnavailableException} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import Redis from 'ioredis';
import helmet from 'helmet';
import {platforms} from './policy';

@Injectable()
class Services {
 db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:5000})});
 redis=new Redis(process.env.REDIS_URL!,{maxRetriesPerRequest:1});
 async health() {
  try {
   await this.db.$queryRaw`SELECT 1`;
   await this.db.campaign.count();
   await this.db.ledgerEntry.count();
   await this.redis.ping();
   const heartbeat=await this.redis.get('worker:heartbeat');
   const worker=!!heartbeat && Date.now()-Number(heartbeat)<45000;
   if(!worker) throw new Error('worker unavailable');
   return {status:'ok',environment:process.env.APP_ENV,database:'ok',redis:'ok',worker:'ok',claimsPaused:true};
  } catch { throw new ServiceUnavailableException('Dependency unavailable'); }
 }
}
@Controller('api')
class Api {
 constructor(private readonly services:Services){}
 @Get('health') health(){return this.services.health();}
 @Get('campaigns') campaigns(){return this.services.db.campaign.findMany({where:{status:'ACTIVE'},include:{tasks:{where:{enabled:true}}},orderBy:{createdAt:'desc'},take:50});}
 @Get('integrations') integrations(){return platforms.map(platform=>({platform,status:'awaiting_credentials',rewardedActionsEnabled:false}));}
 @Get('config') config(){return {chainId:1919,rpcUrl:'https://rpc.turkscan.com',explorerUrl:'https://turkscan.com',claimsPaused:true,release:process.env.RELEASE_SHA || 'development'};}
}
@Module({controllers:[Api],providers:[Services]})
class AppModule {}
async function bootstrap(){
 if(!['test','production'].includes(process.env.APP_ENV || '')) throw new Error('Invalid APP_ENV');
 if(process.env.REWARD_CLAIMS_PAUSED !== 'true') throw new Error('Claims activation not authorized');
 const app=await NestFactory.create(AppModule,{logger:['error','warn','log']});
 app.use(helmet());
 app.enableShutdownHooks();
 await app.listen(Number(process.env.API_PORT),'127.0.0.1');
}
void bootstrap();
