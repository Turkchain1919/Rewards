import {ArgumentsHost,Catch,ExceptionFilter,HttpException} from '@nestjs/common';
import type {Response,Request} from 'express';
@Catch()
export class SafeErrors implements ExceptionFilter {
 catch(error:unknown,host:ArgumentsHost){
  const context=host.switchToHttp(),res=context.getResponse<Response>(),req=context.getRequest<Request>();
  if(error instanceof HttpException){res.status(error.getStatus()).json({statusCode:error.getStatus(),message:error.message});return;}
  const code=(error as {code?:string})?.code;
  const status=code==='P2002'||code==='P2034'?409:code==='P2025'?404:500;
  if(status===500)console.error('API failure',{path:req.path,code:typeof code==='string'?code:'INTERNAL'});
  res.status(status).json({statusCode:status,message:status===409?'Concurrent or duplicate operation rejected':status===404?'Record not found':'Request could not be completed'});
 }
}
