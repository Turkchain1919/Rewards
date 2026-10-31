import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.APP_URL||'http://localhost:18190';return ['','/en','/tr'].map(path=>({url:base+path,lastModified:new Date(),alternates:{languages:{en:base+'/en',tr:base+'/tr'}}}));}
