function parts(timestamp:number,zone:string){const data=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(timestamp));return Object.fromEntries(data.map(p=>[p.type,p.value]));}
export function utcToLocalInput(instant:string|null|undefined,zone:string){if(!instant)return '';const p=parts(Date.parse(instant),zone);return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;}
export function localInputToUtc(value:string,zone:string){
 if(!value)return null;if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))throw new Error('INVALID_LOCAL_DATE');
 const [year,month,day,hour,minute]=value.split(/[-T:]/).map(Number),seed=Date.UTC(year,month-1,day,hour,minute),offsets=new Set<number>();
 for(const delta of [-36,-12,0,12,36]){const at=seed+delta*3600000,p=parts(at,zone);offsets.add(Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day),Number(p.hour),Number(p.minute),Number(p.second))-at);}
 const candidates=[...offsets].map(offset=>seed-offset).filter(at=>utcToLocalInput(new Date(at).toISOString(),zone)===value);
 if(candidates.length!==1)throw new Error(candidates.length?'AMBIGUOUS_LOCAL_TIME':'INVALID_LOCAL_DATE');return new Date(candidates[0]).toISOString();
}
