import {cache} from 'react';
import type {PublicConfig} from './runtime';
export const serverConfig=cache(async():Promise<PublicConfig|null>=>{try{const response=await fetch(process.env.INTERNAL_API_URL+'/api/config',{cache:'no-store',signal:AbortSignal.timeout(5000)});if(!response.ok)return null;const data=await response.json();return data.branding?data:null;}catch{return null;}});
