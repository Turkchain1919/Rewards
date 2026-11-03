import {Controller,Get,Post,Body,Param,Query,Req,Res,BadRequestException,PayloadTooLargeException} from '@nestjs/common';
import type {Request,Response} from 'express';
import {z} from 'zod';
import {AuthService} from './auth';
import {SocialRewardsService,batchSocialInput} from './social-engine';
import {EngineService} from './engine';
import {officialPlatforms} from './social-config';
import {origin,parse} from './security';
@Controller('api')
export class SocialRewardsController{
 constructor(readonly auth:AuthService,readonly service:SocialRewardsService,readonly engine:EngineService){}
 @Get('social/task-catalog')catalog(@Query('platform')platform?:string){return this.service.catalog(platform?.toUpperCase());}
 @Get('admin/social/task-catalog')async adminCatalog(@Req()req:Request,@Query('platform')platform?:string){await this.auth.admin(req,['OWNER','ADMIN']);return this.service.catalog(platform?.toUpperCase());}
 @Post('admin/social/targets/resolve')async target(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.auth.admin(req,['OWNER','ADMIN']);await this.auth.limit(req,'social-target:'+admin.id,20);const b=parse(z.object({url:z.string().url().max(2048),officialAccountId:z.string().min(10).max(64)}).strict(),body);try{const result=await this.service.resolveTarget(b.url,b.officialAccountId);await this.auth.data.audit(admin.id,'SOCIAL_TARGET_RESOLVED',b.officialAccountId+':'+result.status);return result;}catch(error){await this.auth.data.audit(admin.id,'SOCIAL_TARGET_RESOLVE_FAILED',b.officialAccountId);throw error;}}
 @Post('admin/social/tasks/batch')async batch(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.auth.admin(req,['OWNER','ADMIN']);return this.service.createBatch(admin.id,parse(batchSocialInput,body));}
 @Get('me/social-tasks')async board(@Req()req:Request){const user=await this.auth.user(req);return this.engine.socialTaskStatusBoard(user.id,typeof req.query.network==='string'?req.query.network:undefined);}
 @Post('social/tasks/:id/challenge')async challenge(@Param('id')id:string,@Req()req:Request){origin(req);const user=await this.auth.user(req);await this.auth.limit(req,'social-challenge:'+user.id,5);return this.service.createChallenge(user.id,id,typeof req.query.network==='string'?req.query.network:undefined);}
 @Post('tasks/:id/verify')async verify(@Param('id')id:string,@Req()req:Request){origin(req);const user=await this.auth.user(req);await this.auth.limit(req,'social-verify:'+user.id,10);return this.service.verifyTask(user.id,id,typeof req.query.network==='string'?req.query.network:undefined);}
 @Post('admin/social/webhooks/telegram/install')async install(@Body()body:unknown,@Req()req:Request){origin(req);const {admin}=await this.auth.admin(req,['OWNER']);const b=parse(z.object({confirm:z.literal('REGISTER_TELEGRAM_WEBHOOK'),replaceExisting:z.boolean().default(false),mfaCode:z.string().regex(/^[0-9]{6}$/).optional()}).strict(),body);await this.auth.stepUp(req,b.mfaCode);return this.service.installTelegramWebhook(admin.id,b.replaceExisting);}
 @Get('social/webhooks/:platform')async webhookChallenge(@Param('platform')name:string,@Query()query:Record<string,string>,@Res()res:Response){const platform=parse(z.enum(officialPlatforms),name.toUpperCase());if(query['hub.mode']!=='subscribe')throw new BadRequestException('Invalid webhook verification mode');const challenge=await this.service.webhookChallenge(platform,query['hub.verify_token']||'',query['hub.challenge']||'');res.status(200).type('text/plain').send(challenge);}
 @Post('social/webhooks/:platform')async webhook(@Param('platform')name:string,@Req()req:Request&{rawBody?:Buffer},@Res()res:Response){const platform=parse(z.enum(officialPlatforms),name.toUpperCase());if((req.rawBody?.length||0)>65536)throw new PayloadTooLargeException();const result=await this.service.processWebhook(platform,req.headers,req.rawBody||Buffer.alloc(0));if(result.challenge)res.status(200).type('text/plain').send(result.challenge);else res.status(200).json({accepted:true,duplicate:result.duplicate});}
}
