"use client";
import {useEffect,useRef,useState} from 'react';
import {T} from './i18n';
export default function HeroMedia({src,onError}:{src:string;onError?:()=>void}){
 const img=useRef<HTMLImageElement>(null),canvas=useRef<HTMLCanvasElement>(null),[paused,setPaused]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{const preference=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setPaused(preference.matches);change();preference.addEventListener('change',change);return()=>preference.removeEventListener('change',change);},[]);
 function paint(){const picture=img.current,target=canvas.current;if(!picture?.complete||!picture.naturalWidth||!target)return;const context=target.getContext('2d');if(!context)return;target.width=picture.naturalWidth;target.height=picture.naturalHeight;context.drawImage(picture,0,0);setReady(true);}
 useEffect(()=>{setReady(false);if(paused)paint();},[paused,src]);
 return <div className="hero-media"><div className="hero-media-picture"><img ref={img} className="hero-gif" data-paused={paused&&ready} src={src} alt="" onLoad={paint} onError={onError}/>{paused&&<canvas ref={canvas} className="hero-static" data-ready={ready} hidden={!ready} aria-hidden="true"/>}</div><label className="hero-motion-control"><input type="checkbox" checked={paused} onChange={e=>setPaused(e.target.checked)}/><T value="Animasyonu duraklat"/></label></div>;
}
