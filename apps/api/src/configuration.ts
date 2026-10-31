import {Injectable,ConflictException,BadRequestException,ServiceUnavailableException,NotFoundException} from '@nestjs/common';
import {z} from 'zod';
import type {Prisma} from '@prisma/client';
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import {WebSocketProvider,keccak256,Contract} from 'ethers';
import {DataService} from './data';
import {encrypt,decrypt} from './security';
const cleanUrl=(value:string,protocols:string[])=>{try{const u=new URL(value);return protocols.includes(u.protocol)&&!u.username&&!u.password&&![...u.searchParams.keys()].some(k=>/(api.?key|access.?token|refresh.?token|secret|authorization|password)/i.test(k));}catch{return false;}};
const optionalUrl=z.string().max(2048).default('').refine(v=>!v||cleanUrl(v,['https:','http:']));
const integer=z.string().regex(/^[1-9][0-9]{0,15}$/).refine(v=>/^[1-9][0-9]{0,15}$/.test(v)&&BigInt(v)<=BigInt(Number.MAX_SAFE_INTEGER));
const address=z.string().default('').refine(v=>!v||/^0x[0-9a-fA-F]{40}$/.test(v));
export const networkInput=z.object({
 networkKey:z.string().regex(/^[a-z][a-z0-9-]{1,39}$/),networkName:z.string().trim().min(2).max(100),chainType:z.literal('evm').default('evm'),chainId:integer,chainIdHex:z.string().default(''),
 networkType:z.enum(['mainnet','testnet']).default('mainnet'),description:z.string().max(2000).default(''),logoUrl:optionalUrl,
 rpcHttp:z.string().url().max(2048).refine(v=>cleanUrl(v,['https:','http:'])),rpcFallbacks:z.array(z.string().url().max(2048).refine(v=>cleanUrl(v,['https:','http:']))).max(5).default([]),rpcWss:z.string().max(2048).default('').refine(v=>!v||cleanUrl(v,['wss:','ws:'])),rpcTimeoutMs:z.number().int().min(1000).max(30000).default(10000),rpcRetries:z.number().int().min(0).max(3).default(1),
 currencyName:z.string().min(1).max(80),currencySymbol:z.string().regex(/^[A-Za-z0-9]{1,12}$/),currencyDecimals:z.number().int().min(0).max(36),
 explorerName:z.string().max(80).default(''),explorerUrl:optionalUrl,explorerApiUrl:optionalUrl,transactionUrlPattern:z.string().max(2048).default('/tx/{hash}'),addressUrlPattern:z.string().max(2048).default('/address/{address}'),contractUrlPattern:z.string().max(2048).default('/address/{address}'),
 walletRpcHttp:optionalUrl,metamaskEnabled:z.boolean().default(true),walletConnectEnabled:z.boolean().default(false),walletConnectProjectId:z.string().max(128).default(''),autoAddNetwork:z.boolean().default(true),autoSwitchNetwork:z.boolean().default(true),
 rewardContractAddress:address,rewardSignerAddress:address,expectedBytecodeHash:z.string().default('').refine(v=>!v||/^0x[0-9a-fA-F]{64}$/.test(v)),claimEnabled:z.boolean().default(false),claimMinAmount:z.string().regex(/^[0-9]+$/).default('0'),claimMaxAmount:z.string().regex(/^[0-9]*$/).default(''),claimExpirySeconds:z.number().int().min(60).max(3600).default(900),confirmationBlocks:z.number().int().min(1).max(1000).default(12),gasSponsorshipEnabled:z.boolean().default(false),
 networkValidation:z.boolean().default(true),requireChainIdMatch:z.boolean().default(true),autoPauseOnNetworkChange:z.boolean().default(true)
}).strict().superRefine((v,c)=>{if(!/^[1-9][0-9]{0,15}$/.test(v.chainId))return;const hex='0x'+BigInt(v.chainId).toString(16);if(v.chainIdHex&&v.chainIdHex.toLowerCase()!==hex)c.addIssue({code:'custom',message:'Hex Chain ID mismatch'});for(const p of [v.transactionUrlPattern,v.addressUrlPattern,v.contractUrlPattern])if(!p.startsWith('/')&&!p.startsWith('https://')||p.startsWith('//'))c.addIssue({code:'custom',message:'Unsafe explorer pattern'});});
export type NetworkConfig=z.infer<typeof networkInput>;
export const brandingInput=z.object({appName:z.string().min(2).max(100),brandName:z.string().min(1).max(80),logoUrl:optionalUrl,faviconUrl:optionalUrl,ogImageUrl:optionalUrl,defaultLanguage:z.enum(['en','tr']),supportedLanguages:z.array(z.enum(['en','tr'])).min(1),primaryColor:z.string().regex(/^#[a-fA-F0-9]{6}$/),homepageTitle:z.string().min(2).max(150),metaDescription:z.string().min(10).max(300),homepageTitleEn:z.string().max(150).default('Your contribution matters.'),homepageTitleTr:z.string().max(150).default(''),metaDescriptionEn:z.string().max(300).default('Community missions and transparent native rewards.'),metaDescriptionTr:z.string().max(300).default(''),footerEn:z.string().max(500).default('Community rewards'),footerTr:z.string().max(500).default(''),keywords:z.string().max(500),footer:z.string().max(500),supportEmail:z.string().max(254).refine(v=>!v||z.string().email().safeParse(v).success),officialWebsite:optionalUrl}).strict();
export type BrandingConfig=z.infer<typeof brandingInput>;
const env=(key:string,legacy?:string,fallback='')=>process.env[key]||legacy&&process.env[legacy]||fallback;
const bool=(key:string,legacy?:string,fallback=false)=>env(key,legacy,String(fallback))==='true';
export function environmentNetwork():NetworkConfig{
 const id=env('BLOCKCHAIN_CHAIN_ID','CHAIN_ID');
 const value=networkInput.parse({
  networkKey:env('BLOCKCHAIN_NETWORK_KEY','BLOCKCHAIN_ACTIVE_NETWORK','network-'+id),networkName:env('BLOCKCHAIN_NETWORK_NAME',undefined,'EVM Network '+id),chainId:id,chainIdHex:env('BLOCKCHAIN_CHAIN_ID_HEX'),chainType:env('BLOCKCHAIN_PROVIDER',undefined,'evm'),networkType:env('BLOCKCHAIN_NETWORK_TYPE',undefined,'mainnet'),
  rpcHttp:env('BLOCKCHAIN_RPC_HTTP','CHAIN_RPC_URL'),rpcFallbacks:env('BLOCKCHAIN_RPC_FALLBACK_URLS').split(',').map(s=>s.trim()).filter(Boolean),rpcWss:env('BLOCKCHAIN_RPC_WSS','CHAIN_WSS_URL'),rpcTimeoutMs:Number(env('BLOCKCHAIN_RPC_TIMEOUT_MS',undefined,'10000')),rpcRetries:Number(env('BLOCKCHAIN_RPC_RETRIES',undefined,'1')),
  currencyName:env('BLOCKCHAIN_CURRENCY_NAME','REWARDS_CURRENCY','Native Currency'),currencySymbol:env('BLOCKCHAIN_CURRENCY_SYMBOL','REWARDS_CURRENCY','NATIVE'),currencyDecimals:Number(env('BLOCKCHAIN_CURRENCY_DECIMALS',undefined,'18')),
  explorerName:env('BLOCKCHAIN_EXPLORER_NAME',undefined,'Explorer'),explorerUrl:env('BLOCKCHAIN_EXPLORER_URL','CHAIN_EXPLORER_URL'),explorerApiUrl:env('BLOCKCHAIN_EXPLORER_API_URL'),
  walletRpcHttp:env('BLOCKCHAIN_WALLET_RPC_HTTP'),metamaskEnabled:bool('BLOCKCHAIN_METAMASK_ENABLED',undefined,true),walletConnectEnabled:bool('BLOCKCHAIN_WALLETCONNECT_ENABLED'),walletConnectProjectId:env('WALLETCONNECT_PROJECT_ID','BLOCKCHAIN_WALLETCONNECT_PROJECT_ID'),autoAddNetwork:bool('BLOCKCHAIN_AUTO_ADD_NETWORK',undefined,true),autoSwitchNetwork:bool('BLOCKCHAIN_AUTO_SWITCH_NETWORK',undefined,true),
  rewardContractAddress:env('BLOCKCHAIN_REWARD_VAULT_ADDRESS','REWARD_CLAIM_CONTRACT_ADDRESS'),rewardSignerAddress:env('BLOCKCHAIN_REWARD_SIGNER_ADDRESS'),expectedBytecodeHash:env('BLOCKCHAIN_REWARD_BYTECODE_HASH'),claimEnabled:bool('BLOCKCHAIN_CLAIM_ENABLED'),claimMinAmount:env('BLOCKCHAIN_CLAIM_MIN_AMOUNT',undefined,'0'),claimMaxAmount:env('BLOCKCHAIN_CLAIM_MAX_AMOUNT'),claimExpirySeconds:Number(env('BLOCKCHAIN_CLAIM_EXPIRY_SECONDS',undefined,'900')),confirmationBlocks:Number(env('BLOCKCHAIN_CONFIRMATION_BLOCKS',undefined,'12')),gasSponsorshipEnabled:bool('BLOCKCHAIN_GAS_SPONSORSHIP_ENABLED','REWARD_GAS_SPONSORSHIP_ENABLED'),
  networkValidation:bool('BLOCKCHAIN_NETWORK_VALIDATION',undefined,true),requireChainIdMatch:bool('BLOCKCHAIN_REQUIRE_CHAIN_ID_MATCH',undefined,true),autoPauseOnNetworkChange:bool('BLOCKCHAIN_AUTO_PAUSE_ON_NETWORK_CHANGE',undefined,true)
 });value.chainIdHex='0x'+BigInt(value.chainId).toString(16);return value;
}
export function environmentBranding():BrandingConfig{return brandingInput.parse({appName:env('APP_NAME',undefined,'Social Rewards'),brandName:env('APP_BRAND_NAME',undefined,'Rewards'),logoUrl:env('APP_LOGO_URL'),faviconUrl:env('APP_FAVICON_URL'),ogImageUrl:env('APP_OG_IMAGE_URL'),defaultLanguage:env('APP_DEFAULT_LANGUAGE',undefined,'en'),supportedLanguages:env('APP_SUPPORTED_LANGUAGES',undefined,'en,tr').split(','),primaryColor:env('APP_THEME_PRIMARY_COLOR',undefined,'#c6f57b'),homepageTitle:env('APP_HOMEPAGE_TITLE',undefined,'Contribute. Learn. Earn.'),metaDescription:env('APP_META_DESCRIPTION',undefined,'Community missions and transparent native rewards.'),homepageTitleEn:env('APP_HOMEPAGE_TITLE_EN',undefined,'Your contribution matters.'),homepageTitleTr:env('APP_HOMEPAGE_TITLE_TR'),metaDescriptionEn:env('APP_META_DESCRIPTION_EN',undefined,'Community missions and transparent native rewards.'),metaDescriptionTr:env('APP_META_DESCRIPTION_TR'),footerEn:env('APP_FOOTER_EN',undefined,'Community rewards'),footerTr:env('APP_FOOTER_TR'),keywords:env('APP_KEYWORDS',undefined,'rewards,blockchain,community'),footer:env('APP_FOOTER',undefined,'Community rewards'),supportEmail:env('APP_SUPPORT_EMAIL'),officialWebsite:env('APP_OFFICIAL_WEBSITE')});}
export async function validateEndpoint(url:string){
 const u=new URL(url);if(!['https:','http:','wss:','ws:'].includes(u.protocol)||u.username||u.password)throw new BadRequestException('Invalid network endpoint');
 const records=isIP(u.hostname)?[{address:u.hostname,family:isIP(u.hostname)}]:await lookup(u.hostname,{all:true});
 const local=process.env.APP_ENV==='test'&&process.env.ALLOW_LOCAL_EVM_TESTS==='true'&&['127.0.0.1','localhost','[::1]'].includes(u.hostname);
 for(const r of records){const a=r.address.toLowerCase();if(!local&&(/^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(a)||a==='::1'||a.startsWith('fc')||a.startsWith('fd')||a.startsWith('fe80')||a.startsWith('::ffff:127.')||a.startsWith('::ffff:10.')))throw new BadRequestException('Private RPC targets rejected');}
 if(!local&&['http:','ws:'].includes(u.protocol))throw new BadRequestException('Public network endpoints require TLS');
}
export async function rpc(config:NetworkConfig,method:string,params:unknown[]=[],headersFor:(url:string)=>Promise<Record<string,string>>=async()=>({})){
 let failure:unknown;
 for(const url of [config.rpcHttp,...config.rpcFallbacks]){await validateEndpoint(url);for(let i=0;i<=config.rpcRetries;i++)try{
  const headers=await headersFor(url);
  const call=async(name:string,args:unknown[])=>{const response=await fetch(url,{method:'POST',redirect:'error',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:name,params:args}),signal:AbortSignal.timeout(config.rpcTimeoutMs)});if(!response.ok)throw new Error();const raw=await response.text();if(raw.length>1000000)throw new Error();const data=JSON.parse(raw) as {error?:unknown;result?:unknown};if(data.error||data.result===undefined)throw new Error();return data.result;};
  if(method!=='eth_chainId'){const chain=await call('eth_chainId',[]);if(typeof chain!=='string'||!/^0x[0-9a-fA-F]+$/.test(chain)||BigInt(chain)!==BigInt(config.chainId))throw new ConflictException('RPC chain mismatch');}
  return await call(method,params);
 }catch(e){failure=e;}}
 throw new ServiceUnavailableException(failure instanceof BadRequestException?failure.message:'RPC unavailable');
}
@Injectable()
export class SecretStore {
 constructor(readonly data:DataService){}
 async get(scope:string,ownerId:string,kind:string){const c=await this.data.db.credential.findUnique({where:{scope_ownerId_kind:{scope,ownerId,kind}}});return c?.ciphertext?decrypt(c.ciphertext):null;}
 async write(tx:Prisma.TransactionClient,scope:string,ownerId:string,kind:string,value:string,actor:string){
  const row=await tx.credential.upsert({where:{scope_ownerId_kind:{scope,ownerId,kind}},create:{scope,ownerId,kind,ciphertext:encrypt(value)},update:{ciphertext:encrypt(value),version:{increment:1},revokedAt:null}});
  await tx.auditEvent.create({data:{actor,action:'CREDENTIAL_SET',resource:scope+':'+ownerId+':'+kind}});return {ok:true,id:row.id};
 }
 async set(scope:string,ownerId:string,kind:string,value:string,actor:string){return this.data.db.$transaction(tx=>this.write(tx,scope,ownerId,kind,value,actor));}
 async remove(scope:string,ownerId:string,kind:string,actor:string){await this.data.db.credential.updateMany({where:{scope,ownerId,kind},data:{ciphertext:null,revokedAt:new Date(),version:{increment:1}}});await this.data.audit(actor,'CREDENTIAL_REVOKE',scope+':'+ownerId+':'+kind);return {ok:true};}
}
@Injectable()
export class ConfigurationService {
 constructor(readonly data:DataService,readonly secrets:SecretStore){}
 async onModuleInit(){await this.initialize();}
 async initialize(){
  const config=environmentNetwork(),branding=environmentBranding();
  if(!await this.data.db.blockchainNetwork.count())await this.verify(config,'rpc');
  await this.data.db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(81732,2000)`;
   let active=await tx.blockchainNetwork.findFirst({where:{isActive:true}});
   if(!await tx.blockchainNetwork.count())active=await tx.blockchainNetwork.create({data:{networkKey:config.networkKey,networkName:config.networkName,chainId:config.chainId,config,enabled:true,isActive:true}});
   if(active&&active.chainId!==config.chainId)throw new ConflictException('Installation is locked to its configured chain; use an isolated database for another chain');
   if(active){await tx.campaign.updateMany({where:{networkId:null},data:{networkId:active.id}});await tx.ledgerEntry.updateMany({where:{networkId:null},data:{networkId:active.id}});}
   await tx.configDocument.upsert({where:{key:'branding'},create:{key:'branding',value:branding},update:{}});
   await tx.configDocument.upsert({where:{key:'runtime'},create:{key:'runtime',value:{multiChainEnabled:false,claimsPaused:true}},update:{}});
  },{timeout:15000});
 }
 async document(key:string){return (await this.data.db.configDocument.findUniqueOrThrow({where:{key}})).value as Record<string,unknown>;}
 async branding(){return brandingInput.parse(await this.document('branding'));}
 async selected(key?:string){
  const active=await this.data.db.blockchainNetwork.findFirst({where:{isActive:true}});
  if(!active)throw new ServiceUnavailableException('No active network');
  if(active.chainId!==environmentNetwork().chainId)throw new ConflictException('Installation chain lock mismatch');
  if(key&&key!==active.networkKey)throw new ConflictException('Multi-chain access is disabled');
  const record=key?await this.data.db.blockchainNetwork.findUnique({where:{networkKey:key}}):active;
  if(!record?.enabled)throw new ServiceUnavailableException('Network disabled');
  return {...record,settings:networkInput.parse(record.config)};
 }
 async list(){return this.data.db.blockchainNetwork.findMany({orderBy:{createdAt:'asc'}});}
 async publicConfig(key?:string){
  const network=await this.selected(key),c=network.settings,runtime=await this.document('runtime'),branding=await this.branding();
  const networks=(await this.list()).filter(n=>n.enabled&&(n.isActive)).map(n=>({id:n.id,key:n.networkKey,name:n.networkName,chainId:n.chainId,isActive:n.isActive}));
  return {networkId:network.id,networkKey:network.networkKey,networkName:c.networkName,chainId:Number(c.chainId),chainIdHex:c.chainIdHex,rpcUrl:c.walletRpcHttp||c.rpcHttp,wssUrl:c.rpcWss,explorerUrl:c.explorerUrl,currency:{name:c.currencyName,symbol:c.currencySymbol,decimals:c.currencyDecimals},
   wallet:{metamaskEnabled:c.metamaskEnabled,walletConnectEnabled:c.walletConnectEnabled,walletConnectProjectId:c.walletConnectProjectId||env('WALLETCONNECT_PROJECT_ID','BLOCKCHAIN_WALLETCONNECT_PROJECT_ID'),autoAdd:c.autoAddNetwork,autoSwitch:c.autoSwitchNetwork},networks,multiChainEnabled:false,claimsPaused:process.env.MASTER_PAYOUTS_AUTHORIZED!=='true'||process.env.REWARD_CLAIMS_PAUSED!=='false'||!!runtime.claimsPaused||!c.claimEnabled,claimContract:c.rewardContractAddress,branding,release:process.env.RELEASE_SHA||'development'};
 }
 async saveNetwork(input:NetworkConfig,actor:string,id?:string,version=0){
  const c=networkInput.parse(input);c.chainIdHex='0x'+BigInt(c.chainId).toString(16);
  const old=id?await this.data.db.blockchainNetwork.findUnique({where:{id}}):null;
  if(old&&networkInput.parse(old.config).currencyDecimals!==c.currencyDecimals&&await this.data.db.ledgerEntry.count({where:{networkId:old.id}}))throw new ConflictException('Currency decimals cannot change after rewards exist');
  if(id&&!old)throw new NotFoundException();
  if(old&&(old.networkKey!==c.networkKey||old.chainId!==c.chainId))throw new ConflictException('Network key/chain ID are immutable; add a separate network');
  if(old?.isActive)await this.verify(c,'rpc');
  return this.data.db.$transaction(async tx=>{
   if(old&&old.version!==version)throw new ConflictException('Network version changed');
   const data={networkKey:c.networkKey,networkName:c.networkName,chainId:c.chainId,config:c};
   const row=old?await tx.blockchainNetwork.update({where:{id:old.id,version},data:{...data,version:{increment:1}}}):await tx.blockchainNetwork.create({data:{...data,enabled:false}});
   if(old?.isActive)await tx.configDocument.update({where:{key:'runtime'},data:{value:{...await this.document('runtime'),claimsPaused:true}}});
   await tx.auditEvent.create({data:{actor,action:old?'NETWORK_EDIT':'NETWORK_ADD',resource:row.id}});return row;
  });
 }
 async networkSecret(networkId:string,kind:string){
  const record=await this.data.db.credential.findUnique({where:{scope_ownerId_kind:{scope:'NETWORK',ownerId:networkId,kind}}});
  if(record)return record.ciphertext?decrypt(record.ciphertext):null;
  const network=await this.data.db.blockchainNetwork.findUniqueOrThrow({where:{id:networkId}});
  if(network.networkKey!==environmentNetwork().networkKey)return null;
  const fields:Record<string,string>={RPC_HEADERS:'BLOCKCHAIN_RPC_HEADERS',EXPLORER_API_KEY:'BLOCKCHAIN_EXPLORER_API_KEY',REWARD_SIGNER_PRIVATE_KEY:'BLOCKCHAIN_REWARD_SIGNER_PRIVATE_KEY',DEPLOYER_PRIVATE_KEY:'BLOCKCHAIN_CONTRACT_DEPLOYER_PRIVATE_KEY'};
  return fields[kind]?(process.env[fields[kind]]||(kind==='REWARD_SIGNER_PRIVATE_KEY'?process.env.REWARD_CLAIM_SIGNER_PRIVATE_KEY:'')||null):null;
 }
 async rpcHeaders(c:NetworkConfig,url:string){
  const record=await this.data.db.blockchainNetwork.findUnique({where:{networkKey:c.networkKey}});
  const raw=record?await this.networkSecret(record.id,'RPC_HEADERS'):c.networkKey===environmentNetwork().networkKey?process.env.BLOCKCHAIN_RPC_HEADERS:null;
  if(!raw)return {};
  const parsed=JSON.parse(raw) as Record<string,unknown>;
  const selected=parsed.hosts?(parsed.hosts as Record<string,unknown>)[new URL(url).hostname]:new URL(url).hostname===new URL(c.rpcHttp).hostname?parsed:{};
  const safe=z.record(z.string().regex(/^(Authorization|X-[A-Za-z0-9-]+)$/i),z.string().max(10000)).safeParse(selected||{});
  if(!safe.success)throw new BadRequestException('RPC credential header configuration invalid');return safe.data;
 }
 async rpcCall(c:NetworkConfig,method:string,params:unknown[]=[]){return rpc(c,method,params,url=>this.rpcHeaders(c,url));}
 async verify(c:NetworkConfig,kind:'rpc'|'wss'|'explorer'|'contract'){
  if(kind==='rpc'){const actual=await this.rpcCall(c,'eth_chainId');if(typeof actual!=='string'||BigInt(actual)!==BigInt(c.chainId))throw new ConflictException('RPC Chain ID mismatch');return {status:'verified',chainId:c.chainId,checkedAt:new Date().toISOString()};}
  if(kind==='wss'){if(!c.rpcWss)throw new BadRequestException('WebSocket not configured');await validateEndpoint(c.rpcWss);const provider=new WebSocketProvider(c.rpcWss);try{const actual=await Promise.race([provider.getNetwork(),new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('timeout')),c.rpcTimeoutMs))]);if(actual.chainId!==BigInt(c.chainId))throw new ConflictException('WebSocket Chain ID mismatch');return {status:'verified',chainId:c.chainId};}finally{await provider.destroy();}}
  if(kind==='explorer'){if(!c.explorerUrl)throw new BadRequestException('Explorer not configured');await validateEndpoint(c.explorerUrl);const r=await fetch(c.explorerUrl,{method:'HEAD',redirect:'error',signal:AbortSignal.timeout(c.rpcTimeoutMs)});if(!r.ok)throw new ServiceUnavailableException('Explorer unavailable');return {status:'reachable'};}
  if(!c.rewardContractAddress)throw new BadRequestException('Reward contract not configured');
  const bytecode=await this.rpcCall(c,'eth_getCode',[c.rewardContractAddress,'latest']);if(typeof bytecode!=='string'||bytecode==='0x')throw new ConflictException('Reward contract has no bytecode');
  const hash=keccak256(bytecode);if(!c.expectedBytecodeHash||hash.toLowerCase()!==c.expectedBytecodeHash.toLowerCase())throw new ConflictException('Reward bytecode hash not approved');
  const signerData=await this.rpcCall(c,'eth_call',[{to:c.rewardContractAddress,data:new Contract(c.rewardContractAddress,['function signer() view returns(address)']).interface.encodeFunctionData('signer')},'latest']);
  const signer='0x'+String(signerData).slice(-40);if(!c.rewardSignerAddress||signer.toLowerCase()!==c.rewardSignerAddress.toLowerCase())throw new ConflictException('Reward signer mismatch');
  return {status:'verified',bytecodeHash:hash,signer};
 }
 async toggle(id:string,enabled:boolean,actor:string){
  const n=await this.data.db.blockchainNetwork.findUniqueOrThrow({where:{id}});
  if(enabled&&n.chainId!==environmentNetwork().chainId)throw new ConflictException('This installation is locked to another chain');
  if(n.isActive&&!enabled)throw new ConflictException('Activate another verified network before disabling the active network');
  const verification=enabled?await this.verify(networkInput.parse(n.config),'rpc'):n.verification;
  await this.data.db.blockchainNetwork.update({where:{id},data:{enabled,verification:verification||{}}});await this.data.audit(actor,enabled?'NETWORK_ENABLE':'NETWORK_DISABLE',id);return {ok:true};
 }
 async activate(id:string,actor:string,confirmation:string){
  const n=await this.data.db.blockchainNetwork.findUniqueOrThrow({where:{id}});if(!n.enabled)throw new ConflictException('Enable network first');
  if(n.chainId!==environmentNetwork().chainId)throw new ConflictException('Installation chain lock forbids activation');
  if(confirmation!=='ACTIVATE '+n.networkKey)throw new BadRequestException('Explicit owner confirmation required');
  const verification=await this.verify(networkInput.parse(n.config),'rpc');
  await this.data.db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(1919,2003)`;
   await tx.blockchainNetwork.updateMany({where:{isActive:true},data:{isActive:false}});
   await tx.blockchainNetwork.update({where:{id},data:{isActive:true,verification}});
   const previous=(await tx.configDocument.findUniqueOrThrow({where:{key:'runtime'}})).value as Record<string,unknown>;
   await tx.configDocument.update({where:{key:'runtime'},data:{value:{...previous,claimsPaused:true}}});
   await tx.auditEvent.create({data:{actor,action:'OWNER_NETWORK_ACTIVATION_APPROVED',resource:id+':claims_paused'}});
  });return {ok:true,claimsPaused:true};
 }
 async removeNetwork(id:string,actor:string){
  const n=await this.data.db.blockchainNetwork.findUniqueOrThrow({where:{id}});
  if(n.isActive||n.enabled||await this.data.db.campaign.count({where:{networkId:id}})||await this.data.db.ledgerEntry.count({where:{networkId:id}})||await this.data.db.claimAuthorization.count({where:{networkId:id}}))throw new ConflictException('Active/enabled/used networks cannot be deleted');
  await this.data.db.blockchainNetwork.delete({where:{id}});await this.data.audit(actor,'NETWORK_DELETE',id);return {ok:true};
 }
 async setDocument(key:'branding'|'runtime',value:unknown,actor:string){
  const validated=key==='branding'?brandingInput.safeParse(value):z.object({multiChainEnabled:z.literal(false),claimsPaused:z.literal(true)}).strict().safeParse(value);if(!validated.success)throw new BadRequestException('Invalid single-chain configuration');const clean=validated.data;
  const row=await this.data.db.configDocument.update({where:{key},data:{value:clean,version:{increment:1}}});await this.data.audit(actor,'CONFIGURATION_APPLY',key+':'+row.version);return {ok:true,version:row.version};
 }
}
