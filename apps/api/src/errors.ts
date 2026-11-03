import {ArgumentsHost,Catch,ExceptionFilter,HttpException} from '@nestjs/common';
import type {Response,Request} from 'express';
@Catch()
export class SafeErrors implements ExceptionFilter {
 catch(error:unknown,host:ArgumentsHost){
  const context=host.switchToHttp(),res=context.getResponse<Response>(),req=context.getRequest<Request>();
  const parserType=(error as {type?:string})?.type;if(parserType==='entity.too.large'){res.status(413).json({statusCode:413,message:'Request body too large'});return;}if(parserType==='entity.parse.failed'){res.status(400).json({statusCode:400,message:'Invalid JSON body'});return;}
  if(error instanceof HttpException){
   const response=error.getResponse();
   if(response&&typeof response==='object'&&(response as {code?:unknown}).code==='VALIDATION_ERROR'){
    const value=response as {errors?:unknown};
    res.status(error.getStatus()).json({statusCode:error.getStatus(),code:'VALIDATION_ERROR',message:'Invalid request fields',errors:Array.isArray(value.errors)?value.errors:[]});return;
   }
   const message=typeof response==='string'?response:response&&typeof response==='object'&&typeof (response as {message?:unknown}).message==='string'?(response as {message:string}).message:error.message;
   res.status(error.getStatus()).json({statusCode:error.getStatus(),message});return;
  }
  const code=(error as {code?:string})?.code;
  const status=code==='P2002'||code==='P2034'?409:code==='P2025'?404:500;
  if(status===500)console.error('API failure',{path:req.path,code:typeof code==='string'?code:'INTERNAL'});
  res.status(status).json({statusCode:status,message:status===409?'Concurrent or duplicate operation rejected':status===404?'Record not found':'Request could not be completed'});
 }
}
