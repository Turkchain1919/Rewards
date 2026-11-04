"use client";
export default function HeroMedia({src,onError}:{src:string;onError?:()=>void}){
 return <div className="hero-media"><div className="hero-media-picture"><img className="hero-gif" src={src} alt="" onError={onError}/></div></div>;
}
