
"use strict";

globalThis.QuimiCraftBiomeFauna=(()=>{
  const strike=(kind,damage,range,windup,cooldown,effect="")=>({kind,damage,range,windup,cooldown,effect});
  function animal(name,shape,coat,trim,pattern,width,height,scale,regions,temperament,hp,walk,run,sense,attack=null){
    return {name,shape,coat,trim,pattern,width,height,scale,regions,profile:{
      temperament,hp,walk,run,sense,roam:regions.length===0?5:shape==="bear"?17:15,strike:attack,loot:attack?[["hide",1,2]]:[]
    }};
  }
  function monster(name,model,tint,regions,hp,walk,run,width,height,attack){
    return {name,model,tint,regions,width,height,scale:model==="golem"?.88:1,shape:"fantasy",profile:{
      temperament:"hostile",hp,walk,run,sense:12,roam:14,strike:attack,
      loot:model==="wisp"?[["wind_essence",1,2],["crystal_shard",1,1,.28]]:[["OBSIDIAN",1,2],["crystal_shard",1,1,.24]]
    }};
  }
  const species=Object.freeze({
    cat:animal("Gato","cat",0xc67842,0xf1d1a0,"tabby",.33,.91,.66,[], "calm",14,1.24,4.3,6),
    dog:animal("Cachorro","dog",0x9a663e,0xebd3a1,"saddle",.41,1.10,.82,[], "calm",22,1.36,4.7,7),
    jaguar:animal("Onça-pintada","cat",0xd79a39,0xf1d395,"rosette",.56,1.32,1.08,["selva tropical","pântano","manguezal"], "neutral",47,1.24,6.55,12,strike("lunge",13,2.18,.38,2.1)),
    tiger:animal("Tigre","cat",0xcb5921,0xf3d0a0,"tiger",.61,1.53,1.23,["floresta de sequoias","selva tropical","bosque de cerejeiras"], "neutral",58,1.22,6.2,12,strike("lunge",16,2.25,.49,2.35)),
    lion:animal("Leão","cat",0xb78346,0xe4ba81,"mane",.60,1.62,1.22,["savana","chapadas ocres","badlands"], "neutral",53,1.16,6.35,11,strike("lunge",15,2.35,.48,2.45)),
    wolf:animal("Lobo","dog",0x677381,0xbfc4c1,"saddle",.47,1.24,1.03,["taiga","floresta","montanha","prado alpino"], "neutral",35,1.25,6.0,13,strike("lunge",10,2.03,.34,1.7)),
    brown_bear:animal("Urso-pardo","bear",0x795039,0xc39269,"shoulder",.72,1.79,1.16,["taiga","montanha","floresta de sequoias"], "neutral",82,.84,4.5,11,strike("slam",19,2.3,.81,2.95)),
    polar_bear:animal("Urso-polar","bear",0xd5ded8,0xf5ead7,"snow",.75,1.84,1.24,["fiordes glaciais","tundra","campina de aurora"], "neutral",89,.92,4.65,12,strike("slam",20,2.42,.77,2.85)),
    black_bear:animal("Urso-negro","bear",0x30313a,0x886344,"muzzle",.65,1.61,1.06,["floresta","bosque de cerejeiras","floresta de sequoias"], "neutral",66,.95,4.95,10,strike("slam",14,2.12,.65,2.66)),
    fennec:animal("Feneco","dog",0xd4a775,0xf5dcaa,"ears",.31,.98,.62,["deserto","salinas","cânion calcário"], "skittish",14,1.4,5.9,8),
    lynx:animal("Lince das Geadas","cat",0xaf8d6b,0xe7cfae,"tufts",.43,1.16,.87,["taiga","campina de aurora","prado alpino"], "skittish",27,1.39,5.6,9),
    bison:animal("Bisão das Pradarias","bison",0x725144,0x9c783f,"shoulder",.73,1.89,1.12,["planície","planície florida","prado alpino","savana"],"neutral",70,.81,4.1,8,strike("slam",13,2.24,.7,2.8)),
    badger:animal("Texugo-das-Pedras","bear",0x697077,0xcfcdc3,"mask",.41,.86,.60,["bosque lilás","floresta","cânion calcário","termas minerais"],"skittish",19,1.2,3.9,7),
    cave_shade:monster("Sombra de Mina","wisp",0x51467a,[],27,1.21,3.9,.37,1.32,strike("shot",8,7.2,.54,2.4,"electric")),
    basalt_husk:monster("Carcaça Basáltica","golem",0x835b51,["vulcânico","caldeira vítrea","badlands","chapadas ocres"],49,.98,2.75,.57,2.02,strike("slam",13,2.05,.75,2.5,"fire")),
    bog_revenant:monster("Vulto do Brejo","golem",0x638449,["pântano","manguezal","delta salobro","bosque lilás"],38,1.10,2.94,.56,2.01,strike("melee",10,1.72,.51,1.95,"corrosion")),
    aurora_phantom:monster("Espectro da Aurora","wisp",0x60aabc,["fiordes glaciais","tundra","taiga","campina de aurora"],33,1.22,4.1,.39,1.34,strike("shot",9,7.7,.6,2.35))
  });
  const entries=Object.entries(species);
  const pets=["cat","dog"];
  function ambient(biome){return entries.filter(([,p])=>p.shape!=="fantasy"&&p.regions.includes(biome)).map(([id])=>id)}
  function hostile(biome,underground){
    const local=entries.filter(([,p])=>p.shape==="fantasy"&&p.regions.includes(biome)).map(([id])=>id);
    return underground?["cave_shade","cave_shade","slime","golem",...local]:["wisp","scorpion","slime",...local,...local];
  }
  return {species,pets,ambient,hostile};
})();

