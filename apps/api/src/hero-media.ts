import {BadRequestException,Body,Controller,Delete,Get,Param,Post,Req,Res,ServiceUnavailableException} from '@nestjs/common';
import type {Request,Response} from 'express';
import {createHash,randomBytes} from 'node:crypto';
import {parseGIF,decompressFrames} from 'gifuct-js';
import {AuthService} from './auth';
import {DataService} from './data';
import {origin} from './security';
const LIMIT=5*1024*1024,PIXELS=60_000_000;
type Info={width:number;height:number;frameCount:number};
export function inspectHeroGif(bytes:Buffer):Info{
 if(bytes.length<14||bytes.length>LIMIT)throw new BadRequestException('GIF file must be between 14 bytes and 5 MB');
 if(!['GIF87a','GIF89a'].includes(bytes.toString('ascii',0,6)))throw new BadRequestException('Only valid GIF files are accepted');
 try{
  const parsed=parseGIF(Uint8Array.from(bytes).buffer);
  const width=Number(parsed.lsd?.width),height=Number(parsed.lsd?.height);
  if(!width||!height||width>1200||height>1200)throw new BadRequestException('GIF dimensions cannot exceed 1200 × 1200 pixels');
  const imageFrames=parsed.frames.map(f=>(f as {image?:{descriptor?:{width:number;height:number;left:number;top:number}}}).image?.descriptor).filter((f):f is {width:number;height:number;left:number;top:number}=>!!f);
  if(!imageFrames.length||imageFrames.length>300||imageFrames.reduce((n,f)=>n+f.width*f.height,0)>PIXELS)throw new BadRequestException('GIF animation contains too many frames');
  if(imageFrames.some(f=>!f.width||!f.height||f.width>width||f.height>height||f.left+f.width>width||f.top+f.height>height))throw new BadRequestException('GIF frame dimensions are invalid');
  const frames=decompressFrames(parsed,false);if(frames.length!==imageFrames.length)throw new BadRequestException('GIF file is corrupted or invalid');
  return {width,height,frameCount:frames.length};
 }catch(e){if(e instanceof BadRequestException)throw e;throw new BadRequestException('GIF file is corrupted or invalid');}
}
@Controller('api')
export class HeroMediaController{
 constructor(private readonly auth:AuthService,private readonly data:DataService){}
 @Get('hero')async publicMetadata(){const row=await this.data.db.heroVisual.findUnique({where:{id:'homepage'}});return row?.published&&row.enabled?{url:'/api/hero/'+row.sha256,width:row.width,height:row.height,size:row.size,updatedAt:row.updatedAt}:{url:null};}
 @Get('hero/:sha')async publicImage(@Param('sha')sha:string,@Res()res:Response){if(!/^[a-f0-9]{64}$/.test(sha))throw new BadRequestException('Invalid image');const row=await this.data.db.heroVisual.findUnique({where:{id:'homepage'}});if(!row?.published||!row.enabled||row.sha256!==sha)throw new ServiceUnavailableException('Hero image is unavailable');res.status(200).set({'Content-Type':'image/gif','Content-Length':String(row.size),'Cache-Control':'public, max-age=60, must-revalidate','ETag':'"'+row.sha256+'"' }).send(Buffer.from(row.bytes));}
 @Get('admin/system/hero')async adminMetadata(@Req()req:Request){await this.auth.admin(req,['OWNER']);const row=await this.data.db.heroVisual.findUnique({where:{id:'homepage'}});return row?{exists:true,width:row.width,height:row.height,size:row.size,frameCount:row.frameCount,published:row.published,enabled:row.enabled,updatedAt:row.updatedAt,sha256:row.sha256}:{exists:false,published:false,enabled:false};}
 @Post('admin/system/hero')async upload(@Req()req:Request,@Res()res:Response){
  origin(req);const {admin}=await this.auth.admin(req,['OWNER']);await this.auth.limit(req,'hero-upload:'+admin.id,10);
  if(req.headers['content-type']?.split(';')[0].toLowerCase()!=='image/gif')throw new BadRequestException('Upload a GIF image');
  const chunks:Buffer[]=[];let size=0;
  for await(const part of req){const b=Buffer.isBuffer(part)?part:Buffer.from(part);size+=b.length;if(size>LIMIT)throw new BadRequestException('GIF must be 5 MB or smaller');chunks.push(b);}
  const bytes=Buffer.concat(chunks),info=inspectHeroGif(bytes),sha256=createHash('sha256').update(bytes).digest('hex'),filename='hero-'+randomBytes(16).toString('hex')+'.gif';
  const previous=await this.data.db.heroVisual.findUnique({where:{id:'homepage'}});
  await this.auth.stepUp(req,String(req.headers['x-mfa-code']||''));
  const row=await this.data.db.heroVisual.upsert({where:{id:'homepage'},create:{id:'homepage',filename,bytes,sha256,size,width:info.width,height:info.height,frameCount:info.frameCount,published:true,enabled:true},update:{filename,bytes,sha256,size,width:info.width,height:info.height,frameCount:info.frameCount,published:true,enabled:true}});
  await this.data.audit(admin.id,previous?'HERO_GIF_REPLACE_PUBLISH':'HERO_GIF_PUBLISH',JSON.stringify({sha256,size,width:info.width,height:info.height,frameCount:info.frameCount}));
  res.status(201).json({exists:true,width:row.width,height:row.height,size:row.size,frameCount:row.frameCount,published:row.published,enabled:row.enabled,sha256:row.sha256,updatedAt:row.updatedAt});
 }
 @Post('admin/system/hero/state')async state(@Req()req:Request,@Body()body:unknown){origin(req);const {admin}=await this.auth.admin(req,['OWNER']);const b=body as {enabled?:unknown;published?:unknown};if(typeof b.enabled!=='boolean'||b.published!==true)throw new BadRequestException('Invalid publication state');await this.auth.stepUp(req,String(req.headers['x-mfa-code']||''));const row=await this.data.db.heroVisual.update({where:{id:'homepage'},data:{enabled:b.enabled,published:true}});await this.data.audit(admin.id,b.enabled?'HERO_GIF_ENABLE':'HERO_GIF_DISABLE','homepage');return {enabled:row.enabled,published:row.published};}
 @Delete('admin/system/hero')async remove(@Req()req:Request){origin(req);const {admin}=await this.auth.admin(req,['OWNER']);await this.auth.stepUp(req,String(req.headers['x-mfa-code']||''));const row=await this.data.db.heroVisual.findUnique({where:{id:'homepage'}});if(row){await this.data.db.heroVisual.delete({where:{id:'homepage'}});await this.data.audit(admin.id,'HERO_GIF_REMOVE',row.sha256);}return {restoredDefault:true};}
}