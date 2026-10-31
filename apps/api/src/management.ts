import {Body,Controller,Get,Post,Put,Param,Req} from '@nestjs/common';
import type {Request} from 'express';
import {z} from 'zod';
import {AuthService} from './auth';
import {EngineService,campaignInput,taskInput} from './engine';
import {origin,parse} from './security';
import {platforms} from './policy';
@Controller('api')
export class MissionController {
 constructor(private readonly auth:AuthService,private readonly engine:EngineService){}
 @Get('tasks')tasks(){return this.engine.publicTasks();}
 @Post('tasks/:id/submit')async submit(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const user=await this.auth.user(req);await this.auth.limit(req,'task-submit:'+user.id,20);const {proof}=parse(z.object({proof:z.string().trim().min(20).max(2000)}).strict(),body);return this.engine.submit(user.id,id,proof);}
 @Get('me/history')async history(@Req()req:Request){const u=await this.auth.user(req);return this.auth.data.db.submission.findMany({where:{userId:u.id},include:{task:{select:{title:true}},reward:{select:{status:true,amountWei:true}}},orderBy:{createdAt:'desc'},take:100});}
 @Get('me/ledger')async ledger(@Req()req:Request){const u=await this.auth.user(req);return {balances:await this.engine.balances(u.id),entries:await this.auth.data.db.ledgerEntry.findMany({where:{userId:u.id},include:{events:true},orderBy:{createdAt:'desc'},take:100})};}
}
@Controller('api/admin')
export class ManagementController {
 constructor(private readonly auth:AuthService,private readonly engine:EngineService){}
 async manage(req:Request){return this.auth.admin(req,['OWNER','ADMIN']);}
 @Get('summary')async summary(@Req()req:Request){await this.manage(req);const db=this.auth.data.db;const [users,campaigns,tasks,pending,rewards]=await Promise.all([db.user.count(),db.campaign.count(),db.task.count(),db.submission.count({where:{status:'PENDING'}}),this.engine.balances()]);return {users,campaigns,tasks,pending,rewards};}
 @Get('users')async users(@Req()req:Request){await this.manage(req);return this.auth.data.db.user.findMany({select:{id:true,wallet:true,displayName:true,createdAt:true,_count:{select:{submissions:true,entries:true}}},orderBy:{createdAt:'desc'},take:100});}
 @Get('campaigns')async campaigns(@Req()req:Request){await this.manage(req);return this.auth.data.db.campaign.findMany({include:{tasks:true},orderBy:{createdAt:'desc'},take:100});}
 @Post('campaigns')async createCampaign(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.engine.saveCampaign(admin.id,parse(campaignInput,body));}
 @Put('campaigns/:id')async editCampaign(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.engine.saveCampaign(admin.id,parse(campaignInput,body),id);}
 @Post('campaigns/:id/:action')async campaignState(@Param('id')id:string,@Param('action')action:string,@Req()req:Request){origin(req);const {admin}=await this.manage(req);const valid=parse(z.enum(['publish','pause']),action);return this.engine.campaignState(admin.id,id,valid==='publish'?'ACTIVE':'PAUSED');}
 @Post('tasks')async createTask(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.engine.saveTask(admin.id,parse(taskInput,body));}
 @Put('tasks/:id')async editTask(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.manage(req);return this.engine.saveTask(admin.id,parse(taskInput,body),id);}
 @Post('tasks/:id/:action')async taskState(@Param('id')id:string,@Param('action')action:string,@Req()req:Request){origin(req);const {admin}=await this.manage(req);const valid=parse(z.enum(['publish','pause']),action);return this.engine.taskState(admin.id,id,valid==='publish');}
 @Get('submissions')async submissions(@Req()req:Request){await this.auth.admin(req);return this.auth.data.db.submission.findMany({include:{user:{select:{wallet:true}},task:{select:{title:true}},reward:{select:{amountWei:true,status:true}}},orderBy:{createdAt:'desc'},take:100});}
 @Post('submissions/:id/review')async review(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.auth.admin(req);const b=parse(z.object({action:z.enum(['APPROVE','REJECT']),note:z.string().trim().min(5).max(1000)}).strict(),body);return this.engine.review(admin.id,id,b.action,b.note);}
 @Get('ledger')async ledger(@Req()req:Request){await this.manage(req);return {balances:await this.engine.balances(),entries:await this.auth.data.db.ledgerEntry.findMany({include:{user:{select:{wallet:true}},events:true},orderBy:{createdAt:'desc'},take:100})};}
 @Get('integrations')async integrations(@Req()req:Request){await this.manage(req);return platforms.map(platform=>({platform,status:'awaiting_credentials',rewardedActionsEnabled:false,missing:[platform+'_CLIENT_ID',platform+'_CLIENT_SECRET',platform+'_REDIRECT_URI'].filter(k=>!process.env[k])}));}
 @Get('audit')async audit(@Req()req:Request){await this.manage(req);return this.auth.data.db.auditEvent.findMany({orderBy:{createdAt:'desc'},take:100});}
 @Get('system')async system(@Req()req:Request){await this.manage(req);return {...await this.auth.data.health(),release:process.env.RELEASE_SHA||'development',chainId:1919,claimsPaused:true};}
}
