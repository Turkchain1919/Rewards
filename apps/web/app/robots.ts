export const dynamic='force-dynamic';
import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/admin','/en/admin','/tr/admin']},sitemap:(process.env.APP_URL||'http://localhost:18190')+'/sitemap.xml'};}
