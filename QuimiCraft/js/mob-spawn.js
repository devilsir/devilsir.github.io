
"use strict";

globalThis.QuimiCraftMobSpawn=(()=>{
  const maxRadius=36,minRadius=12;
  const limits=[{natural:0,hostile:0},{natural:5,hostile:2},{natural:9,hostile:4},{natural:14,hostile:6}];
  const emitters={TORCH:13,SPECTRAL:12,VILLAGE_LANTERN:12,FIRE:14,LAVA:14,GLOW_FUNGUS:8,
    SUNKEN_BEACON:9,LIGHT_CRYSTAL:11,CAMPFIRE:14,ALCHEMY_LANTERN:12};
  const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
  function civilTwilight(day){
    const sun=Math.sin(day*Math.PI*2);
    return Math.max(2,Math.min(15,Math.round((sun+.22)*18)));
  }
  function lightLevel(point,day,exposure,lights,clear){
    let value=Math.round(civilTwilight(day)*exposure);
    for(const source of lights){
      const distance=gap(point,source);
      if(distance>source.power-5||source.power-distance<=value)continue;
      if(clear(point,source))value=Math.max(value,source.power-distance);
    }
    return value;
  }
  function create(chunkSize,random=Math.random){
    let age=0,nextNatural=1.9,nextHostile=6.5,nextCleanup=20;
    const areaClock=new Map();
    const cell=p=>Math.floor(p.x/chunkSize)+","+Math.floor(p.z/chunkSize);
    const active=actors=>actors.filter(e=>!e.persistent&&!e.dead&&!e.petsite&&!e.birth);
    function eligible(p,player,actors,quality){
      if(!limits[quality]?.hostile)return false;
      if(gap(p,player)<minRadius||gap(p,player)>maxRadius)return false;
      if(p.light>5||p.protected)return false;
      if((areaClock.get(cell(p))??0)>age)return false;
      const neighbors=active(actors);
      if(neighbors.some(e=>gap(e,p)<2.7))return false;
      return neighbors.filter(e=>e.hostile&&gap(e,p)<13).length<2;
    }
    function record(p){areaClock.set(cell(p),age+31+random()*16)}
    function tick(dt,quality,player,actors,attempt){
      age+=dt;
      const budget=limits[quality]||limits[0];
      if(age>=nextCleanup){
        nextCleanup=age+20;
        for(const [key,until] of areaClock)if(until<=age)areaClock.delete(key);
      }
      if(budget.hostile&&age>=nextHostile){
        nextHostile=age+7.1+random()*3.9;
        const count=active(actors).filter(e=>e.hostile).length;
        if(count<budget.hostile)attempt("hostile",p=>eligible(p,player,actors,quality),record);
      }
      if(budget.natural&&age>=nextNatural){
        nextNatural=age+2.7+random()*2.7;
        if(active(actors).filter(e=>!e.hostile).length<budget.natural)attempt("natural");
      }
    }
    return {tick,eligible,record};
  }
  return {create,limits,emitters,civilTwilight,lightLevel};
})();

