import {Body,Controller,Get,Post,Param,Req,Injectable,ConflictException,ServiceUnavailableException,ForbiddenException} from '@nestjs/common';
import type {Request} from 'express';
import {Interface,Wallet,TypedDataEncoder,getAddress,keccak256} from 'ethers';
import {randomBytes} from 'node:crypto';
import {z} from 'zod';
import {DataService} from './data';
import {ConfigurationService,NetworkConfig} from './configuration';
import {AuthService} from './auth';
import {origin,parse} from './security';
export const claimTypes={Claim:[{name:'recipient',type:'address'},{name:'amount',type:'uint256'},{name:'nonce',type:'uint256'},{name:'deadline',type:'uint256'}]};
export const vaultABI=['function claim(uint256 amount,uint256 nonce,uint256 deadline,bytes signature)','function signer() view returns(address)','function paused() view returns(bool)','function usedNonces(address,uint256) view returns(bool)','function eip712Domain() view returns(bytes1 fields,string name,string version,uint256 chainId,address verifyingContract,bytes32 salt,uint256[] extensions)','event Claimed(address indexed recipient,uint256 indexed nonce,uint256 amount)'];
const abi=new Interface(vaultABI);
export async function signClaim(signer:Wallet,domain:{name:string;version:string;chainId:number;verifyingContract:string},message:{recipient:string;amount:string;nonce:string;deadline:string}){
 if(!/^0x[0-9a-fA-F]{40}$/.test(domain.verifyingContract)||!Number.isSafeInteger(domain.chainId)||domain.chainId<=0)throw new Error('Invalid domain');
 for(const value of [message.amount,message.nonce,message.deadline])if(!/^[0-9]{1,78}$/.test(value)||BigInt(value)>=2n**256n)throw new Error('Invalid claim value');
 if(BigInt(message.amount)<=0n)throw new Error('Invalid amount');
 return {domain,types:claimTypes,message,signature:await signer.signTypedData(domain,claimTypes,message),digest:TypedDataEncoder.hash(domain,claimTypes,message)};
}
@Injectable()
export class ClaimService {
 constructor(readonly data:DataService,readonly config:ConfigurationService){}
 async ready(){
  const network=await this.config.selected(),runtime=await this.config.document('runtime');
  if(process.env.MASTER_PAYOUTS_AUTHORIZED!=='true'||process.env.REWARD_CLAIMS_PAUSED!=='false'||runtime.claimsPaused!==false||!network.settings.claimEnabled)throw new ServiceUnavailableException('Claims are paused; owner authorization required');
  return network;
 }
 async call(c:NetworkConfig,name:string,args:unknown[]=[],block='latest'){
  const result=await this.config.rpcCall(c,'eth_call',[{to:c.rewardContractAddress,data:abi.encodeFunctionData(name,args)},block]);
  return abi.decodeFunctionResult(name,String(result));
 }
 async domain(c:NetworkConfig){
  const value=await this.call(c,'eip712Domain');
  if(BigInt(value[3])!==BigInt(c.chainId)||String(value[4]).toLowerCase()!==c.rewardContractAddress.toLowerCase())throw new ConflictException('Vault domain mismatch');
  return {name:String(value[1]),version:String(value[2]),chainId:Number(c.chainId),verifyingContract:getAddress(c.rewardContractAddress)};
 }
 async prepare(userId:string){
  const network=await this.ready(),c=network.settings;
  await this.config.verify(c,'contract');
  if((await this.call(c,'paused'))[0])throw new ConflictException('On-chain vault is paused');
  const key=await this.config.networkSecret(network.id,'REWARD_SIGNER_PRIVATE_KEY');if(!key)throw new ServiceUnavailableException('Signer not configured');
  let signer:Wallet;try{signer=new Wallet(key);}catch{throw new ServiceUnavailableException('Signer configuration invalid');}
  if(signer.address.toLowerCase()!==c.rewardSignerAddress.toLowerCase())throw new ConflictException('Signer address mismatch');
  const domain=await this.domain(c),user=await this.data.db.user.findUniqueOrThrow({where:{id:userId}});
  const block=await this.config.rpcCall(c,'eth_getBlockByNumber',['latest',false]) as {number:string;timestamp:string};
  const balance=BigInt(String(await this.config.rpcCall(c,'eth_getBalance',[c.rewardContractAddress,'latest'])));
  return this.data.db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(81732,2005)`;
   const existing=await tx.claimAuthorization.findFirst({where:{userId,networkId:network.id,status:{in:['PREPARED','SUBMITTED']}}});
   if(existing)return this.authorization(existing);
   const entries=await tx.ledgerEntry.findMany({where:{userId,networkId:network.id,status:'AVAILABLE',claimId:null},orderBy:{createdAt:'asc'},take:100});
   let amount=0n;const selected:typeof entries=[];const max=c.claimMaxAmount?BigInt(c.claimMaxAmount):2n**256n-1n;
   for(const entry of entries){const next=BigInt(entry.amountWei.toFixed());if(amount+next<=max){selected.push(entry);amount+=next;}}
   if(!amount||amount<BigInt(c.claimMinAmount)||amount>=2n**256n)throw new ConflictException('Available amount does not meet claim limits');
   const reserved=await tx.ledgerEntry.aggregate({where:{networkId:network.id,status:'RESERVED'},_sum:{amountWei:true}});
   if(balance<amount+BigInt(reserved._sum.amountWei?.toFixed()||'0'))throw new ConflictException('Vault funding is insufficient');
   const nonce=BigInt('0x'+randomBytes(32).toString('hex')).toString(),deadline=BigInt(block.timestamp)+BigInt(c.claimExpirySeconds);
   const authorization=await signClaim(signer,domain,{recipient:getAddress(user.wallet),amount:amount.toString(),nonce,deadline:deadline.toString()});
   const claim=await tx.claimAuthorization.create({data:{userId,networkId:network.id,recipient:user.wallet,amountWei:amount.toString(),nonce,deadline:new Date(Number(deadline)*1000),createdBlock:BigInt(block.number).toString(),contractAddress:c.rewardContractAddress,bytecodeHash:c.expectedBytecodeHash,authorization}});
   const changed=await tx.ledgerEntry.updateMany({where:{id:{in:selected.map(e=>e.id)},status:'AVAILABLE',claimId:null,networkId:network.id},data:{status:'RESERVED',claimId:claim.id}});
   if(changed.count!==selected.length)throw new ConflictException('Reward state changed');
   await tx.ledgerEvent.createMany({data:selected.map(e=>({ledgerId:e.id,fromStatus:'AVAILABLE' as const,toStatus:'RESERVED' as const,actor:userId,reason:'CLAIM:'+claim.id}))});
   await tx.auditEvent.create({data:{actor:userId,action:'CLAIM_PREPARE',resource:claim.id}});
   return this.authorization(claim);
  },{isolationLevel:'Serializable',timeout:15000});
 }
 authorization(claim:{id:string;authorization:unknown;contractAddress:string}){
  const a=claim.authorization as {domain:{chainId:number};message:{recipient:string;amount:string;nonce:string;deadline:string};signature:string};
  return {id:claim.id,...a,transaction:{to:claim.contractAddress,value:'0x0',chainId:'0x'+a.domain.chainId.toString(16),data:abi.encodeFunctionData('claim',[a.message.amount,a.message.nonce,a.message.deadline,a.signature])}};
 }
 async submitted(userId:string,id:string,hash:string){
  const claim=await this.data.db.claimAuthorization.findUniqueOrThrow({where:{id}});
  if(claim.userId!==userId)throw new ForbiddenException();if(!['PREPARED','SUBMITTED'].includes(claim.status))throw new ConflictException('Claim already resolved');
  await this.data.db.claimAuthorization.update({where:{id},data:{transactionHash:hash,status:'SUBMITTED'}});
  return this.reconcile(id);
 }
 async reconcile(id:string){
  const claim=await this.data.db.claimAuthorization.findUniqueOrThrow({where:{id}});
  if(!['PREPARED','SUBMITTED'].includes(claim.status))return {status:claim.status};
  const network=await this.config.selected();if(network.id!==claim.networkId)throw new ConflictException('Claim belongs to another installation network');
  const c={...network.settings,rewardContractAddress:claim.contractAddress,expectedBytecodeHash:claim.bytecodeHash};
  let hash=claim.transactionHash;
  const latest=BigInt(String(await this.config.rpcCall(c,'eth_blockNumber')));
  if(!hash){
   const from=BigInt(claim.lastScannedBlock||claim.createdBlock),end=latest>from+999n?from+999n:latest;
   const logs=await this.config.rpcCall(c,'eth_getLogs',[{address:claim.contractAddress,fromBlock:'0x'+from.toString(16),toBlock:'0x'+end.toString(16),topics:abi.encodeFilterTopics('Claimed',[claim.recipient,BigInt(claim.nonce)])}]) as {transactionHash:string}[];
   hash=logs[0]?.transactionHash||null;
   if(!hash){const next=end>BigInt(c.confirmationBlocks)?end-BigInt(c.confirmationBlocks):BigInt(claim.createdBlock);await this.data.db.claimAuthorization.update({where:{id},data:{lastScannedBlock:(next>BigInt(claim.createdBlock)?next:BigInt(claim.createdBlock)).toString(),checkedAt:new Date()}});}
   if(hash)await this.data.db.claimAuthorization.update({where:{id},data:{transactionHash:hash,status:'SUBMITTED'}});
  }
  if(!hash)return {status:'PREPARED'};
  const receipt=await this.config.rpcCall(c,'eth_getTransactionReceipt',[hash]) as null|{status:string;blockNumber:string;blockHash:string;from:string;to:string;logs:{address:string;topics:string[];data:string}[]};
  if(!receipt)return {status:'SUBMITTED'};
  if(BigInt(receipt.status)!==1n){await this.data.db.claimAuthorization.update({where:{id},data:{lastError:'TRANSACTION_REVERTED'}});return {status:'SUBMITTED',error:'TRANSACTION_REVERTED',fundsRemainReserved:true};}
  const confirmations=latest-BigInt(receipt.blockNumber)+1n;if(confirmations<BigInt(c.confirmationBlocks))return {status:'SUBMITTED',confirmations:confirmations.toString()};
  const block=await this.config.rpcCall(c,'eth_getBlockByNumber',[receipt.blockNumber,false]) as {hash:string};
  if(block.hash!==receipt.blockHash)throw new ConflictException('Receipt block was reorganized');
  if(receipt.from.toLowerCase()!==claim.recipient.toLowerCase()||receipt.to?.toLowerCase()!==claim.contractAddress.toLowerCase())throw new ConflictException('Transaction identity mismatch');
  const bytecode=await this.config.rpcCall(c,'eth_getCode',[claim.contractAddress,receipt.blockNumber]);if(keccak256(String(bytecode)).toLowerCase()!==claim.bytecodeHash.toLowerCase())throw new ConflictException('Receipt vault code mismatch');
  const matching=receipt.logs.some(log=>{if(log.address.toLowerCase()!==claim.contractAddress.toLowerCase())return false;try{const event=abi.parseLog(log);return event?.name==='Claimed'&&String(event.args.recipient).toLowerCase()===claim.recipient.toLowerCase()&&BigInt(event.args.nonce)===BigInt(claim.nonce)&&BigInt(event.args.amount)===BigInt(claim.amountWei.toFixed());}catch{return false;}});
  if(!matching)throw new ConflictException('Claim event mismatch');
  await this.data.db.$transaction(async tx=>{
   const changed=await tx.claimAuthorization.updateMany({where:{id,status:{in:['PREPARED','SUBMITTED']}},data:{status:'CONFIRMED',confirmedAt:new Date(),lastError:null}});
   if(changed.count!==1)return;
   const entries=await tx.ledgerEntry.findMany({where:{claimId:id,status:'RESERVED',networkId:claim.networkId}});
   if(entries.reduce((sum,e)=>sum+BigInt(e.amountWei.toFixed()),0n)!==BigInt(claim.amountWei.toFixed()))throw new ConflictException('Reserved ledger invariant failed');
   await tx.ledgerEntry.updateMany({where:{claimId:id,status:'RESERVED'},data:{status:'CLAIMED'}});
   await tx.ledgerEvent.createMany({data:entries.map(e=>({ledgerId:e.id,fromStatus:'RESERVED' as const,toStatus:'CLAIMED' as const,actor:'chain',reason:'CONFIRMED:'+hash}))});
   await tx.auditEvent.create({data:{actor:claim.userId,action:'CLAIM_CONFIRMED',resource:id}});
  });return {status:'CONFIRMED',transactionHash:hash};
 }
 async expire(userId:string,id:string){
  const claim=await this.data.db.claimAuthorization.findUniqueOrThrow({where:{id}});if(claim.userId!==userId)throw new ForbiddenException();
  if(!['PREPARED','SUBMITTED'].includes(claim.status))return {status:claim.status};
  const network=await this.config.selected();if(network.id!==claim.networkId)throw new ConflictException('Network mismatch');
  const c={...network.settings,rewardContractAddress:claim.contractAddress};
  const latest=BigInt(String(await this.config.rpcCall(c,'eth_blockNumber'))),height=latest>=BigInt(c.confirmationBlocks)?latest-BigInt(c.confirmationBlocks):0n;
  const blockTag='0x'+height.toString(16),block=await this.config.rpcCall(c,'eth_getBlockByNumber',[blockTag,false]) as {timestamp:string};
  if(BigInt(block.timestamp)*1000n<=BigInt(claim.deadline.getTime()))throw new ConflictException('Authorization not safely expired');
  if((await this.call(c,'usedNonces',[claim.recipient,BigInt(claim.nonce)],blockTag))[0])return this.reconcile(id);
  await this.data.db.$transaction(async tx=>{
   const changed=await tx.claimAuthorization.updateMany({where:{id,status:{in:['PREPARED','SUBMITTED']}},data:{status:'EXPIRED'}});if(changed.count!==1)return;
   const entries=await tx.ledgerEntry.findMany({where:{claimId:id,status:'RESERVED'}});
   await tx.ledgerEntry.updateMany({where:{claimId:id,status:'RESERVED'},data:{status:'AVAILABLE',claimId:null}});
   await tx.ledgerEvent.createMany({data:entries.map(e=>({ledgerId:e.id,fromStatus:'RESERVED' as const,toStatus:'AVAILABLE' as const,actor:userId,reason:'EXPIRED:'+id}))});
   await tx.auditEvent.create({data:{actor:userId,action:'CLAIM_EXPIRED',resource:id}});
  });return {status:'EXPIRED'};
 }
}
@Controller('api/claims')
export class ClaimController {
 constructor(readonly auth:AuthService,readonly claims:ClaimService){}
 @Get()async list(@Req()req:Request){const user=await this.auth.user(req),network=await this.auth.config.selected();return this.auth.data.db.claimAuthorization.findMany({where:{userId:user.id,networkId:network.id},select:{id:true,amountWei:true,recipient:true,nonce:true,status:true,deadline:true,contractAddress:true,transactionHash:true,confirmedAt:true,lastError:true},orderBy:{createdAt:'desc'},take:100});}
 @Post('prepare')async prepare(@Req()req:Request){origin(req);const user=await this.auth.user(req);await this.auth.limit(req,'claim:'+user.id,10);return this.claims.prepare(user.id);}
 @Post(':id/transaction')async submitted(@Param('id')id:string,@Body()body:unknown,@Req()req:Request){origin(req);const user=await this.auth.user(req),b=parse(z.object({transactionHash:z.string().regex(/^0x[0-9a-fA-F]{64}$/)}).strict(),body);return this.claims.submitted(user.id,id,b.transactionHash);}
 @Post(':id/refresh')async reconcile(@Param('id')id:string,@Req()req:Request){origin(req);const user=await this.auth.user(req),claim=await this.auth.data.db.claimAuthorization.findUniqueOrThrow({where:{id}});if(claim.userId!==user.id)throw new ForbiddenException();return this.claims.reconcile(id);}
 @Post(':id/expire')async expire(@Param('id')id:string,@Req()req:Request){origin(req);const user=await this.auth.user(req);return this.claims.expire(user.id,id);}
}
