import {userConnectionDetails,checkUserTelegramMembership} from './admin-user-details';
import {Body,Controller,Get,Post,Put,Patch,Delete,Param,Query,Req} from '@nestjs/common';
import type {Request} from 'express';
import {z} from 'zod';
import {AuthService} from './auth';
import {EngineService,campaignInput,taskInput,taskContent,taskLimitsInput} from './engine';
import {origin,parse} from './security';
import {OfficialAccountsService} from './official-accounts';
import {IntegrationSettings,settingInput} from './integration-settings';
import {officialPlatforms} from './social-config';
@Controller('api')
export class MissionController {
 constructor(private readonly auth:AuthService,private readonly engine:EngineService,private readonly settings:IntegrationSettings,private readonly officialAccounts:OfficialAccountsService){}
 @Get('official-accounts')official(){return this.officialAccounts.public();}
 @Get('tasks')tasks(@Query('network')network?:string){return this.engine.publicTasks(network);}
 @Post('tasks/:id/submit')async submit(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const user=await this.auth.user(req);await this.auth.limit(req,'task-submit:'+user.id,20);const {proof}=parse(z.object({proof:z.string().trim().min(20).max(2000)}).strict(),body);return this.engine.submit(user.id,id,proof,typeof req.query.network==='string'?req.query.network:undefined);}
 @Post('tasks/:id/verify-telegram')async verifyTelegram(@Param('id')id:string,@Req()req:Request){origin(req);const user=await this.auth.user(req);await this.auth.limit(req,'telegram-verify:'+user.id,10);return this.engine.verifyTelegram(user.id,id,typeof req.query.network==='string'?req.query.network:undefined);}
 @Get('me/tasks')async board(@Req()req:Request){const u=await this.auth.user(req);return this.engine.userTaskBoard(u.id,typeof req.query.network==='string'?req.query.network:undefined);}
 @Get('me/history')async history(@Req()req:Request){const u=await this.auth.user(req);const network=await this.auth.config.selected(typeof req.query.network==='string'?req.query.network:undefined);return this.auth.data.db.submission.findMany({where:{userId:u.id,task:{campaign:{networkId:network.id}}},include:{task:{select:{title:true,platform:true}},reward:{select:{status:true,amountWei:true}}},orderBy:{createdAt:'desc'},take:100});}
 @Get('me/ledger')async ledger(@Req()req:Request){const u=await this.auth.user(req);const network=await this.auth.config.selected(typeof req.query.network==='string'?req.query.network:undefined);return {balances:await this.engine.balances(u.id,network.networkKey),entries:await this.auth.data.db.ledgerEntry.findMany({where:{userId:u.id,networkId:network.id},include:{events:true},orderBy:{createdAt:'desc'},take:100})};}
}
@Controller('api/admin')
export class ManagementController {
 constructor(private readonly auth:AuthService,private readonly engine:EngineService,private readonly settings:IntegrationSettings,private readonly officialAccounts:OfficialAccountsService){}
 async manage(req:Request){return this.auth.admin(req,['OWNER','ADMIN']);}
 @Get('summary')async summary(@Req()req:Request){await this.manage(req);const db=this.auth.data.db;const [users,campaigns,tasks,pending,rewards]=await Promise.all([db.user.count(),db.campaign.count(),db.task.count(),db.submission.count({where:{status:'PENDING'}}),this.engine.balances()]);return {users,campaigns,tasks,pending,rewards};}
 @Get('users')async users(@Req()req:Request){await this.manage(req);return this.auth.data.db.user.findMany({select:{id:true,wallet:true,displayName:true,createdAt:true,_count:{select:{submissions:true,entries:true}}},orderBy:{createdAt:'desc'},take:100});}
 @Get('users/:id/connection-details')async userDetails(@Param('id')id:string,@Req()req:Request){await this.manage(req);return userConnectionDetails(this.auth.data.db,parse(z.string().min(1).max(100),id));}
 @Post('users/:id/telegram-membership-check')async userMembership(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);await this.auth.limit(req,'admin-membership:'+admin.id,30);const {targetId}=parse(z.object({targetId:z.string().min(1).max(100)}).strict(),body);const result=await checkUserTelegramMembership(this.auth.data.db,this.settings,parse(z.string().min(1).max(100),id),targetId);await this.auth.data.audit(admin.id,'ADMIN_TELEGRAM_MEMBERSHIP_CHECK',id+':'+targetId+':'+result.status);return result;}
 @Get('campaigns')async campaigns(@Req()req:Request){await this.manage(req);return this.auth.data.db.campaign.findMany({include:{tasks:true},orderBy:{createdAt:'desc'},take:100});}
 @Post('campaigns')async createCampaign(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.engine.saveCampaign(admin.id,parse(campaignInput,body));}
 @Put('campaigns/:id')async editCampaign(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.engine.saveCampaign(admin.id,parse(campaignInput,body),id);}
 @Get('campaigns/:id/impact')async impactCampaign(@Param('id')id:string,@Req()req:Request){await this.manage(req);return this.engine.campaignImpact(id);}
 @Delete('campaigns/:id')async deleteCampaign(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);const b=parse(z.object({confirmId:z.literal(id)}).strict(),body);return this.engine.deleteCampaign(admin.id,b.confirmId);}
 @Post('campaigns/:id/:action')async campaignState(@Param('id')id:string,@Param('action')action:string,@Req()req:Request){origin(req);const {admin}=await this.manage(req);const valid=parse(z.enum(['publish','pause','archive']),action);if(valid==='archive')return this.engine.archiveCampaign(admin.id,id);return this.engine.campaignState(admin.id,id,valid==='publish'?'ACTIVE':'PAUSED');}
 @Post('tasks')async createTask(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.engine.saveTask(admin.id,parse(taskInput,body));}
 @Patch('tasks/:id/content')async editTaskContent(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);const b=parse(z.object({title:z.string().trim().min(3).max(160),localizedContent:taskContent,startsAt:z.string().datetime().nullable(),endsAt:z.string().datetime().nullable()}).strict().refine(v=>!v.startsAt||!v.endsAt||new Date(v.endsAt)>new Date(v.startsAt),{message:'Task end must follow start'}),body);return this.engine.updateTaskContent(admin.id,id,b);}
 @Put('tasks/:id')async editTask(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.engine.saveTask(admin.id,parse(taskInput,body),id);}
 @Get('tasks/:id/limits')async taskLimits(@Param('id')id:string,@Req()req:Request){await this.manage(req);return this.engine.taskLimits(id);}
 @Patch('tasks/:id/limits')async editTaskLimits(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.engine.updateTaskLimits(admin.id,id,parse(taskLimitsInput,body));}
 @Get('tasks/:id/impact')async impactTask(@Param('id')id:string,@Req()req:Request){await this.manage(req);return this.engine.taskImpact(id);}
 @Delete('tasks/:id')async deleteTask(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);const b=parse(z.object({confirmId:z.literal(id)}).strict(),body);return this.engine.deleteTask(admin.id,b.confirmId);}
 @Post('tasks/:id/:action')async taskState(@Param('id')id:string,@Param('action')action:string,@Req()req:Request){origin(req);const {admin}=await this.manage(req);const valid=parse(z.enum(['publish','pause','archive']),action);if(valid==='archive')return this.engine.archiveTask(admin.id,id);return this.engine.taskState(admin.id,id,valid==='publish');}
 @Get('submissions')async submissions(@Req()req:Request){await this.auth.admin(req);return this.auth.data.db.submission.findMany({include:{user:{select:{wallet:true}},task:{select:{title:true}},reward:{select:{amountWei:true,status:true}}},orderBy:{createdAt:'desc'},take:100});}
 @Post('submissions/:id/review')async review(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.auth.admin(req);const b=parse(z.object({action:z.enum(['APPROVE','REJECT']),note:z.string().trim().min(5).max(1000)}).strict(),body);return this.engine.review(admin.id,id,b.action,b.note);}
 @Get('ledger')async ledger(@Req()req:Request){await this.manage(req);return {balances:await this.engine.balances(),entries:await this.auth.data.db.ledgerEntry.findMany({include:{user:{select:{wallet:true}},events:true},orderBy:{createdAt:'desc'},take:100})};}
 @Get('integrations')async integrations(@Req()req:Request){await this.manage(req);return this.settings.list();}
 @Post('social-api/:platform')async socialConfigure(@Param('platform')platform:string,@Body()body:unknown,@Req()req:Request){
  origin(req);const {admin}=await this.auth.admin(req,['OWNER']);
  const b=parse(z.object({credentials:z.record(z.string().regex(/^(clientId|clientSecret|apiKey|apiSecret|accessToken|refreshToken|bearerToken|botToken|webhookSecret|pageAccessToken)$/),z.string().max(10000)),redirectUri:z.string().url().max(2048),enabled:z.boolean(),mode:z.enum(['oauth','api','bot','public']),graphVersion:z.string().max(20).optional(),version:z.number().int().optional(),requestedScopes:z.array(z.string().max(200)).max(40).optional(),webhookEnabled:z.boolean().optional(),mfaCode:z.string().regex(/^[0-9]{6}$/).optional()}).strict(),body);
  await this.auth.stepUp(req,b.mfaCode);
  return this.settings.configure(parse(z.enum(officialPlatforms),platform.toUpperCase()),admin.id,b);
 }
 @Patch('integrations/:platform')async setting(@Param('platform')platform:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.settings.save(parse(z.enum(officialPlatforms),platform.toUpperCase()),admin.id,parse(settingInput,body));}
 @Post('integrations/:platform/test')async testConnection(@Param('platform')platform:string,@Req()req:Request){origin(req);const {admin}=await this.manage(req);await this.auth.limit(req,'integration-test',30);return this.settings.test(parse(z.enum(officialPlatforms),platform.toUpperCase()),admin.id);}
 @Get('claims')async claims(@Req()req:Request){await this.manage(req);const network=await this.auth.config.selected();return this.auth.data.db.claimAuthorization.findMany({where:{networkId:network.id},select:{id:true,userId:true,recipient:true,amountWei:true,status:true,transactionHash:true,contractAddress:true,deadline:true,createdAt:true,lastError:true},orderBy:{createdAt:'desc'},take:100});}
 @Get('audit')async audit(@Req()req:Request){await this.manage(req);return this.auth.data.db.auditEvent.findMany({orderBy:{createdAt:'desc'},take:100});}
 @Get('system')async system(@Req()req:Request){await this.manage(req);return {...await this.auth.data.health(),release:process.env.RELEASE_SHA||'development',network:(await this.auth.config.selected()).networkKey,claimsPaused:true};}
}
