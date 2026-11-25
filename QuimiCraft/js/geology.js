"use strict";

globalThis.QuimiCraftGeology=(()=>{
  const cellSize=5;
  const tiers=[
    {chance:.34,size:4,ores:[
      ["COAL",7,55,6],["IRON",5,37,5],["COPPER",8,44,5],["SULFUR",5,32,3],
    ]},
    {chance:.17,size:3,ores:[
      ["TIN",7,35,3],["ZINC",6,31,3],["MAGNETITE",5,29,3],
      ["NITER",8,37,4,"dry"],["BAUXITE",13,40,3,"dry"],["MALACHITE",9,32,3,"forest coast"],
      ["PYRITE",5,31,3],["$regional",6,38,7],
    ]},
    {chance:.085,size:2,ores:[
      ["GOLD",4,19,4],["SILVER_ORE",5,25,4],["COBALT_ORE",6,26,3,"snow"],
      ["AMETHYST",4,18,3],["CRYSTAL",4,20,3],["$habitat",6,34,5],
    ]},
    {chance:.026,size:1,ores:[
      ["DIAMOND_ORE",3,11,2],["AQUAMARINE_ORE",4,17,3],["GARNET_ORE",4,25,3],
      ["EMERALD_ORE",5,23,4,"snow"],["RUBY_ORE",4,22,4,"volcanic"],
      ["SAPPHIRE_ORE",4,22,4,"snow"],["OPAL_ORE",6,26,4,"coast dry volcanic"],
    ]},
  ];
  const bedrockTypes={
    "cânion calcário":"LIMESTONE","termas minerais":"LIMESTONE",
    deserto:"AMBER_SHALE",badlands:"AMBER_SHALE","chapadas ocres":"AMBER_SHALE",
    "bosque de cristais":"QUARTZITE","campina de aurora":"QUARTZITE",
    montanha:"SLATE","prado alpino":"SLATE",tundra:"SLATE","fiordes glaciais":"GNEISS",
    vulcânico:"BASALT","caldeira vítrea":"BASALT",
  };
  function create({blocks,seed,hash,noise,culture,region,habitats}){
    const salt=seed%4093;
    const candidates=new Map();
    function ore(x,y,z,biome,habitat){
      if(y<3||y>55)return 0;
      const cx=Math.floor(x/cellSize),cy=Math.floor(y/cellSize),cz=Math.floor(z/cellSize);
      const lx=x-cx*cellSize,ly=y-cy*cellSize,lz=z-cz*cellSize;
      const roll=hash(cx+119,cy+salt,cz-861);
      let limit=0;
      const tier=tiers.find(entry=>roll<(limit+=entry.chance));
      if(!tier)return 0;
      const offset=hash(cx-673,cy+59,cz+salt);
      const innerX=1+Math.floor(offset*3),innerY=1+Math.floor(offset*9)%3,innerZ=1+Math.floor(offset*27)%3;
      const dx=lx-innerX,dy=ly-innerY,dz=lz-innerZ;
      if(Math.abs(dx)+Math.abs(dy)+Math.abs(dz)>2)return 0;
      const direction=Math.floor(hash(cx+953,cy-316,cz+salt)*4);
      const along=direction<2?dx:dz,across=direction<2?dz:dx,sign=direction%2===0?1:-1;
      const shape=dx===0&&dy===0&&dz===0||
        tier.size>=2&&along===sign&&across===0&&dy===0||
        tier.size>=3&&along===-sign&&across===0&&dy===0||
        tier.size>=4&&along===sign&&across===0&&dy===1;
      if(!shape)return 0;

      const depth=cy*cellSize+innerY;
      const key=biome+"|"+(habitat||"")+"|"+depth+"|"+tier.size;
      let options=candidates.get(key);
      if(!options){
        const climate=culture(biome),local=habitats.profile(habitat);
        const entries=[];
        let weight=0;
        for(const [name,min,max,chance,climates] of tier.ores){
          if(depth<min||depth>max||climates&&!climates.split(" ").includes(climate))continue;
          const id=name==="$regional"?region(biome).ore:name==="$habitat"?blocks[local?.vein]:blocks[name];
          if(id)entries.push([id,weight+=chance]);
        }
        options={entries,weight};
        candidates.set(key,options);
      }
      const pick=hash(cx+234,cy+salt-72,cz+504)*options.weight;
      return options.entries.find(([,end])=>pick<end)?.[0]||0;
    }
    function rock(x,y,z,surfaceY,biome){
      const folds=noise.n2(x*.019+247,z*.019-612);
      const deepTop=10+folds*3;
      if(y<=deepTop)return blocks.DEEPSTONE;
      const local=blocks[bedrockTypes[biome]]||blocks.STONE;
      if(y>surfaceY-9+folds*4)return local;
      const seam=deepTop+4+noise.n2(x*.039-81,z*.039+330)*2;
      if(y<=seam){
        if(local===blocks.BASALT)return blocks.BASALT;
        if(local===blocks.LIMESTONE)return blocks.SLATE;
        if([blocks.SLATE,blocks.GNEISS,blocks.QUARTZITE].includes(local))return blocks.GNEISS;
        return blocks.GRANITE;
      }
      return local;
    }
    return {ore,rock};
  }
  return {create};
})();
