import 'reflect-metadata';
import {Controller, Get, Query, Module} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import helmet from 'helmet';
import {ClaimService,ClaimController} from './claims';
import {OAuthLifecycle,OAuthLifecycleController} from './oauth-lifecycle';
import {OfficialAccountsService,OfficialAccountsController} from './official-accounts';
import {ConfigurationService,SecretStore} from './configuration';
import {ConfigurationController} from './config-controller';
import {IntegrationSettings} from './integration-settings';
import {SocialController} from './social';
import {readiness} from './providers';
import {EngineService} from './engine';
import {MissionController,ManagementController} from './management';
import {SafeErrors} from './errors';
import {DataService} from './data';
import {AuthService,UserAuthController,AdminAuthController} from './auth';

@Controller('api')
class Api {
 constructor(private readonly services:DataService,private readonly configuration:ConfigurationService){}
 @Get('health') health(){return this.services.health();}
 @Get('campaigns') async campaigns(@Query('network')key?:string){const network=await this.configuration.selected(key);return this.services.db.campaign.findMany({where:{status:'ACTIVE',networkId:network.id},include:{tasks:{where:{enabled:true}}},orderBy:{createdAt:'desc'},take:50});}
 @Get('integrations') integrations(){return readiness().map(({platform,status,ready})=>({platform,status,ready,rewardedActionsEnabled:false}));}
 @Get('config') config(@Query('network')network?:string){return this.configuration.publicConfig(network);}
}
@Module({controllers:[Api,UserAuthController,AdminAuthController,MissionController,ManagementController,SocialController,ConfigurationController,OfficialAccountsController,OAuthLifecycleController,ClaimController],providers:[DataService,AuthService,EngineService,IntegrationSettings,SecretStore,ConfigurationService,OfficialAccountsService,OAuthLifecycle,ClaimService]})
class AppModule {}
async function bootstrap(){
 if(!['test','production'].includes(process.env.APP_ENV || '')) throw new Error('Invalid APP_ENV');
 if(!/^[a-f0-9]{64}$/.test(process.env.DATA_ENCRYPTION_KEY||''))throw new Error('DATA_ENCRYPTION_KEY required');
 if(process.env.REWARD_CLAIMS_PAUSED !== 'true'&&process.env.MASTER_PAYOUTS_AUTHORIZED !== 'true') throw new Error('Claims activation not authorized');
 const app=await NestFactory.create(AppModule,{logger:['error','warn','log']});
 app.use(helmet());
 app.useGlobalFilters(new SafeErrors());
 app.getHttpAdapter().getInstance().set("trust proxy","loopback");
 app.use((req: {path:string},res: {setHeader:(k:string,v:string)=>void},next:()=>void)=>{if(req.path.startsWith("/api/"))res.setHeader("Cache-Control","no-store");next();});
 app.enableShutdownHooks();
 await app.listen(Number(process.env.API_PORT),'127.0.0.1');
}
void bootstrap();
