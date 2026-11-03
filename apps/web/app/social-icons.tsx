export default function SocialIcon({platform,size=24}:{platform:string;size?:number}){
 const colors:Record<string,string>={X:'#e5e7eb',YOUTUBE:'#ff0033',INSTAGRAM:'#e1306c',TELEGRAM:'#229ed9',FACEBOOK:'#1877f2',KICK:'#53fc18',TWITCH:'#9146ff',TIKTOK:'#25f4ee'};
 const paths:Record<string,string>={X:'M4 3h5l4 6 5-6h2l-6 8 7 10h-5l-5-7-6 7H3l7-9z',YOUTUBE:'M3 5h18v14H3z M10 9v6l6-3z',INSTAGRAM:'M5 3h14l2 2v14l-2 2H5l-2-2V5z M8 8v8h8V8z M17 5v2h2V5z',TELEGRAM:'M2 11 22 3l-4 19-7-6-4 4v-7l11-7-12 6z',FACEBOOK:'M15 3h4v4h-3v3h3l-1 4h-2v7h-4v-7H9v-4h3V7z',KICK:'M4 3h5v7l5-7h6l-7 9 7 9h-6l-5-7v7H4z',TWITCH:'M3 3h19v14l-6 5h-5v-3H7L3 15z M8 6v10h9l3-3V6z M11 8h2v5h-2z M16 8h2v5h-2z',TIKTOK:'M13 3h4c0 3 2 4 4 4v4c-2 0-4-1-4-2v9c-1 5-11 5-11-1 0-4 3-6 6-5v4c-3-1-3 3-1 3 1 0 2-1 2-2z'};
 return <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={platform}><path fill={colors[platform]||'#94a3b8'} fillRule="evenodd" d={paths[platform]||'M3 3h18v18H3z'}/></svg>;
}
