import {createHash} from 'node:crypto';
export function socialIdentityHash(platform:string,accountId:string){return createHash('sha256').update(platform+':'+accountId).digest('hex');}
