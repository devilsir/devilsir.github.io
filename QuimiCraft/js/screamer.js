"use strict";

globalThis.QuimiCraftScreamer=(()=>{
  const plants={
    forest:{name:"Gritador da Mata",petal:0xbd6a9c,light:0xdf9cba,leaf:0x6faa44,bud:0x523656,shape:1},
    marsh:{name:"Gritador do Brejo",petal:0x659cbc,light:0xaae3d4,leaf:0x539852,bud:0x2e535d,shape:1.14},
    dry:{name:"Gritador da Chapada",petal:0xb44732,light:0xffa961,leaf:0x869448,bud:0x643735,shape:.84},
    cold:{name:"Gritador da Serra",petal:0xb2a6e4,light:0xe3f1eb,leaf:0x527a72,bud:0x44415f,shape:.94}
  };
  function variant(biome){
    if(/pântano|brejo|delta|manguezal/.test(biome))return "marsh";
    if(/chapada|savana|deserto|badlands|cânion/.test(biome))return "dry";
    if(/taiga|tundra|montanha|prado alpino|aurora/.test(biome))return "cold";
    if(/floresta|selva|bosque|planície/.test(biome))return "forest";
    return null;
  }
  const profile={temperament:"neutral",hp:42,walk:0,run:0,sense:0,roam:0,strike:null,loot:[["plant_oil",1,2]]};
  const sound={windup:.72,duration:3.25,cooldown:12,range:7.2,damage:17,pulse:.75};
  return {plants,variant,profile,sound};
})();
