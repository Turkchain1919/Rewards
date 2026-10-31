import {NextRequest,NextResponse} from 'next/server';
export function proxy(request:NextRequest){const headers=new Headers(request.headers);headers.set('x-rewards-path',request.nextUrl.pathname);const route=request.nextUrl.pathname.match(/^\/(en|tr)(?:\/|$)/)?.[1],cookie=request.cookies.get('rewards_lang')?.value;headers.set('x-rewards-locale',route||(['en','tr'].includes(cookie||'')?cookie!:'default'));return NextResponse.next({request:{headers}});}
export const config={matcher:['/((?!_next/static|_next/image|icon.svg|api/).*)']};
