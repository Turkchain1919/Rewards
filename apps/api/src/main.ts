import 'reflect-metadata';
import {Controller, Get, Module} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import helmet from 'helmet';
import {EngineService} from './engine';
import {MissionController,ManagementController} from './management';
import {SafeErrors} from './errors';
import {platforms} from './policy';
import {DataService} from './data';
import {AuthService,UserAuthController,AdminAuthController} from './auth';

@Controller('api')
class Api {
 constructor(private readonly services:DataService){}
 @Get('health') health(){return this.services.health();}
 @Get('campaigns') campaigns(){return this.services.db.campaign.findMany({where:{status:'ACTIVE'},include:{tasks:{where:{enabled:true}}},orderBy:{createdAt:'desc'},take:50});}
 @Get('integrations') integrations(){return platforms.map(platform=>({platform,status:'awaiting_credentials',rewardedActionsEnabled:false}));}
 @Get('config') config(){return {chainId:1919,rpcUrl:'https://rpc.turkscan.com',explorerUrl:'https://turkscan.com',claimsPaused:true,release:process.env.RELEASE_SHA || 'development'};}
}
@Module({controllers:[Api,UserAuthController,AdminAuthController,MissionController,ManagementController],providers:[DataService,AuthService,EngineService]})
class AppModule {}
async function bootstrap(){
 if(!['test','production'].includes(process.env.APP_ENV || '')) throw new Error('Invalid APP_ENV');
 if(!/^[a-f0-9]{64}$/.test(process.env.DATA_ENCRYPTION_KEY||''))throw new Error('DATA_ENCRYPTION_KEY required');
 if(process.env.REWARD_CLAIMS_PAUSED !== 'true') throw new Error('Claims activation not authorized');
 const app=await NestFactory.create(AppModule,{logger:['error','warn','log']});
 app.use(helmet());
 app.useGlobalFilters(new SafeErrors());
 app.getHttpAdapter().getInstance().set("trust proxy","loopback");
 app.use((req: {path:string},res: {setHeader:(k:string,v:string)=>void},next:()=>void)=>{if(req.path.startsWith("/api/"))res.setHeader("Cache-Control","no-store");next();});
 app.enableShutdownHooks();
 await app.listen(Number(process.env.API_PORT),'127.0.0.1');
}
void bootstrap();
