export const platforms=['X','YOUTUBE','INSTAGRAM','TELEGRAM','FACEBOOK','TIKTOK','KICK','TWITCH'] as const;
export type Social={platform:string;ready:boolean;status:string;account:null|{accountName:string;reconnectRequired?:boolean;lastError?:string|null;expiresAt:string|null;scopes:string[]}};
export function connectionState(s?:Social,now=Date.now()){
 if(s?.account){if(s.account.reconnectRequired||s.account.lastError==='REAUTH_REQUIRED')return 'CONNECTION_EXPIRED';if(s.account.lastError)return 'ERROR';if(s.platform!=='TELEGRAM'&&s.account.expiresAt&&Date.parse(s.account.expiresAt)<=now)return 'CONNECTION_EXPIRED';return 'CONNECTED';}
 return s?.ready?'CONNECTION_AVAILABLE':'NOT_CONFIGURED';
}
export function earnedBalance(b:Record<string,string>){return ['AVAILABLE','RESERVED','CLAIMED'].reduce((sum,k)=>sum+BigInt(b[k]||'0'),0n).toString();}
export type HubNavigation={view:'tasks'|'history'|'ledger'|'account';platform:string;task:string;step:number};
export function parseNavigation(hash:string):HubNavigation{const p=new URLSearchParams(hash.replace(/^#/,''));return {view:['tasks','history','ledger','account'].includes(p.get('view')||'')?p.get('view') as HubNavigation['view']:'tasks',platform:[...platforms,'OTHER'].includes(p.get('platform') as typeof platforms[number])?p.get('platform')!:'TELEGRAM',task:p.get('task')?.slice(0,100)||'',step:Math.max(1,Math.min(3,Math.trunc(Number(p.get('step')))||1))};}
