
"use strict";

globalThis.QuimiCraftMobSpawn=(()=>{
  const hostileChunks=16,minRadius=18;
  const limits=[
    {natural:0,hostile:0,aquatic:0},
    {natural:22,hostile:2,aquatic:16},
    {natural:38,hostile:9,aquatic:28},
    {natural:56,hostile:15,aquatic:40}
  ];
  const emitters={TORCH:15,SPECTRAL:15,VILLAGE_LANTERN:14,FIRE:15,LAVA:14,GLOW_FUNGUS:10,
    LUMEN_FLOWER:10,GLOW_FERN:9,STAR_SHROOM:10,
    SUNKEN_BEACON:11,LIGHT_CRYSTAL:13,CAMPFIRE:15,ALCHEMY_LANTERN:14,MYCELIUM_LAMP:15};
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
    let age=0,nextNatural=.65,nextHostile=6.5,nextCleanup=20;
    const areaClock=new Map();
    const cell=p=>Math.floor(p.x/chunkSize)+","+Math.floor(p.z/chunkSize);
    const active=e=>!e.persistent&&!e.dead&&!e.petsite&&!e.bonded&&!e.siteActor&&!e.factionSquad&&!e.ancientSite&&!e.elementalRiftSite&&!e.playerSummon;
    const wildlifeCount=actors=>actors.filter(e=>active(e)&&!e.hostile&&!e.aquatic&&!e.plant&&!e.birth).length;
    const hostileCount=actors=>actors.filter(e=>active(e)&&e.hostile).length;
    const inRange=(p,player)=>Math.hypot(p.x-player.x,p.z-player.z)<=chunkSize*hostileChunks;
    function canSpawnHostile(p,player,actors,quality){
      return inRange(p,player)&&hostileCount(actors)<(limits[quality]?.hostile??0);
    }
    function eligible(p,player,actors,quality){
      if(!canSpawnHostile(p,player,actors,quality)||gap(p,player)<minRadius)return false;
      if(p.light>5||p.protected)return false;
      if((areaClock.get(cell(p))??0)>age)return false;
      const neighbors=actors.filter(active);
      if(neighbors.some(e=>gap(e,p)<6.2))return false;
      return neighbors.filter(e=>e.hostile&&gap(e,p)<24).length<2;
    }
    function record(p){areaClock.set(cell(p),age+36+random()*20)}
    function tick(dt,quality,player,actors,attempt){
      age+=dt;
      const budget=limits[quality]||limits[0];
      if(age>=nextCleanup){
        nextCleanup=age+20;
        for(const [key,until] of areaClock)if(until<=age)areaClock.delete(key);
      }
      if(budget.hostile&&age>=nextHostile){
        nextHostile=age+9.5+random()*5.2;
        const count=hostileCount(actors);
        if(count<budget.hostile)attempt("hostile",p=>eligible(p,player,actors,quality),record);
      }
      if(budget.natural&&age>=nextNatural){
        nextNatural=age+.8+random()*1.1;
        const remaining=budget.natural-wildlifeCount(actors);
        for(let i=0;i<Math.min(3,remaining);i++){
          if(wildlifeCount(actors)>=budget.natural)break;
          if(attempt("natural")===null)break;
        }
      }
    }
    return {tick,eligible,record,canSpawnHostile,inRange,wildlifeCount,hostileCount};
  }
  return {create,limits,hostileChunks,emitters,civilTwilight,lightLevel};
})();

