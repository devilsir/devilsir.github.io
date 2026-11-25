
"use strict";

globalThis.QuimiCraftBiomeFauna=(()=>{
  const strike=(kind,damage,range,windup,cooldown,effect="")=>({kind,damage,range,windup,cooldown,effect});
  function animal(name,shape,coat,trim,pattern,width,height,scale,regions,temperament,hp,walk,run,sense,attack=null){
    return {name,shape,coat,trim,pattern,width,height,scale,regions,profile:{
      temperament,hp,walk,run,sense,roam:regions.length===0?5:shape==="bear"?17:15,strike:attack,loot:attack?[["hide",1,2]]:[]
    }};
  }
  function monster(name,model,tint,regions,hp,walk,run,width,height,attack,variant={}){
    return {name,model,tint,regions,width,height,scale:model==="golem"?.88:1,shape:"fantasy",...variant,profile:{
      temperament:"hostile",hp,walk,run,sense:12,roam:14,strike:attack,
      loot:variant.loot??(model==="wisp"?[["wind_essence",1,2],["crystal_shard",1,1,.28]]:[["OBSIDIAN",1,2],["crystal_shard",1,1,.24]])
    }};
  }
  function medusa(name,aspect,tint,glow,trim,regions,hp,windup,stoneSeconds,loot){
    const gaze={...strike("gaze",9,7.8,windup,7.8),color:glow,stoneSeconds};
    return monster(name,"medusa",tint,regions,hp,.95,3.18,.61,2.10,gaze,{aspect,glow,trim,loot:[["medusa_tear",1,2],...loot]});
  }
  const species=Object.freeze({
    grass_snake:monster("Serpente da Mata","serpent",0x59764c,["floresta","planície florida","bosque lilás","manguezal"],
      15,1.40,4.1,.38,.50,strike("lunge",5,1.41,.36,1.58),{glow:0xe5cb66,trim:0x99a663,loot:[["hide",1,1]]}),
    pit_viper:monster("Jararaca","serpent",0x996340,["selva tropical","savana","deserto","cânion calcário","chapadas ocres"],
      25,1.18,3.9,.42,.64,{...strike("lunge",8,1.65,.51,2.12,"toxicity"),venom:true},
      {glow:0xffd470,trim:0xe4a362,loot:[["venom",1,2],["hide",1,1]]}),
    cave_spider:monster("Aranha de Caverna","spider",0x58403d,["floresta","montanha","bosque de cristais","cânion calcário"],
      19,1.45,4.28,.47,.62,strike("lunge",7,1.56,.32,1.45),{glow:0xa4c8a1,trim:0x9f7560,loot:[["chitin",1,2]]}),
    venom_spider:monster("Aranha Venenosa","spider",0x3e354f,["selva tropical","pântano","caldeira vítrea","manguezal"],
      27,1.53,4.56,.48,.66,{...strike("lunge",8,1.72,.39,2.08,"toxicity"),venom:true},
      {glow:0xc5ed62,trim:0x9872a4,loot:[["venom",1,2],["chitin",1,1]]}),
    cat:animal("Gato","cat",0xc67842,0xf1d1a0,"tabby",.33,.91,.66,[], "calm",14,1.24,4.3,6),
    dog:animal("Cachorro","dog",0x9a663e,0xebd3a1,"saddle",.41,1.10,.82,[], "calm",22,1.36,4.7,7),
    jaguar:animal("Onça-pintada","cat",0xd79a39,0xf1d395,"rosette",.56,1.32,1.08,["selva tropical","pântano","manguezal"], "neutral",47,1.24,6.55,12,strike("lunge",13,2.18,.38,2.1)),
    tiger:animal("Tigre","cat",0xcb5921,0xf3d0a0,"tiger",.61,1.53,1.23,["floresta de sequoias","selva tropical","bosque de cerejeiras"], "neutral",58,1.22,6.2,12,strike("lunge",16,2.25,.49,2.35)),
    lion:animal("Leão","cat",0xb78346,0xe4ba81,"mane",.60,1.62,1.22,["savana","chapadas ocres","badlands"], "neutral",53,1.16,6.35,11,strike("lunge",15,2.35,.48,2.45)),
    wolf:animal("Lobo","dog",0x677381,0xbfc4c1,"saddle",.47,1.24,1.03,["taiga","floresta","montanha","prado alpino"], "neutral",35,1.25,6.0,13,strike("lunge",10,2.03,.34,1.7)),
    opossum:animal("Saruê","opossum",0x635e62,0xe7dccc,"mask",.30,.70,1,["floresta","selva tropical","manguezal","pântano","bosque lilás"],
      "neutral",19,1.25,4.65,8,strike("lunge",7,1.62,.46,1.85)),
    anteater:animal("Tamanduá-bandeira","anteater",0x727477,0xc2bcb1,"saddle",.47,1.17,1,["savana","planície","selva tropical","chapadas ocres"],
      "neutral",46,.99,4.12,10,strike("slam",14,2.02,.65,2.45)),
    brown_bear:animal("Urso-pardo","bear",0x795039,0xc39269,"shoulder",.72,1.79,1.16,["taiga","montanha","floresta de sequoias"], "neutral",82,.84,4.5,11,strike("slam",19,2.3,.81,2.95)),
    polar_bear:animal("Urso-polar","bear",0xd5ded8,0xf5ead7,"snow",.75,1.84,1.24,["fiordes glaciais","tundra","campina de aurora"], "neutral",89,.92,4.65,12,strike("slam",20,2.42,.77,2.85)),
    black_bear:animal("Urso-negro","bear",0x30313a,0x886344,"muzzle",.65,1.61,1.06,["floresta","bosque de cerejeiras","floresta de sequoias"], "neutral",66,.95,4.95,10,strike("slam",14,2.12,.65,2.66)),
    fennec:animal("Feneco","dog",0xd4a775,0xf5dcaa,"ears",.31,.98,.62,["deserto","salinas","cânion calcário"], "skittish",14,1.4,5.9,8),
    lynx:animal("Lince das Geadas","cat",0xaf8d6b,0xe7cfae,"tufts",.43,1.16,.87,["taiga","campina de aurora","prado alpino"], "skittish",27,1.39,5.6,9),
    bison:animal("Bisão das Pradarias","bison",0x725144,0x9c783f,"shoulder",.73,1.89,1.12,["planície","planície florida","prado alpino","savana"],"neutral",70,.81,4.1,8,strike("slam",13,2.24,.7,2.8)),
    badger:animal("Texugo-das-Pedras","bear",0x697077,0xcfcdc3,"mask",.41,.86,.60,["bosque lilás","floresta","cânion calcário","termas minerais"],"skittish",19,1.2,3.9,7),
    cave_shade:monster("Sombra de Mina","wisp",0x51467a,[],27,1.21,3.9,.37,1.32,strike("shot",8,7.2,.54,2.4,"electric")),
    basalt_husk:monster("Carcaça Basáltica","golem",0x835b51,["vulcânico","caldeira vítrea","badlands","chapadas ocres"],49,.98,2.75,.57,2.02,strike("slam",13,2.05,.75,2.5,"fire")),
    bog_revenant:monster("Vulto do Brejo","ghost",0x6bc79d,["pântano","manguezal","delta salobro","bosque lilás"],38,1.10,2.94,.46,1.69,strike("melee",10,1.9,.51,1.95,"corrosion"),
      {hover:.77,glow:0xadffc7,loot:[["unknown_residue",1,2],["wind_essence",1,1,.25]]}),
    salt_specter:monster("Espectro da Salmoura","ghost",0x77a7ee,["salinas","delta salobro","fiordes glaciais"],42,1.13,3.28,.45,1.67,strike("shot",10,7.45,.61,2.29,"thermal"),
      {hover:.88,glow:0xd5dcff,loot:[["SALT",2,4],["wind_essence",1,2]]}),
    amethyst_golem:monster("Golem de Ametista","golem",0x4e3a66,["bosque de cristais","montanha","cânion calcário"],83,.74,2.33,.69,2.16,strike("slam",19,2.42,.84,2.7),
      {gem:0xbe82ff,scale:1.12,loot:[["AMETHYST",1,2],["crystal_shard",1,2]]}),
    garnet_golem:monster("Golem de Granada","golem",0x573644,["chapadas ocres","badlands","termas minerais"],76,.80,2.52,.65,2.11,strike("slam",17,2.38,.79,2.68),
      {gem:0xf06478,scale:1.08,loot:[["GARNET_ORE",1,2],["crystal_shard",1,1,.25]]}),
    copper_golem:monster("Golem de Cobre","golem",0x70463a,["cânion calcário","termas minerais","chapadas ocres"],72,.88,2.7,.67,2.09,strike("slam",16,2.40,.72,2.41),
      {alloy:0xb97449,glow:0x8ff7d2,scale:1.07,loot:[["copper_ingot",1,3]]}),
    iron_golem:monster("Golem de Ferro","golem",0x59646f,["montanha","taiga","prado alpino"],91,.74,2.35,.69,2.16,strike("slam",20,2.43,.83,2.88),
      {alloy:0x9daab6,glow:0xffbd74,scale:1.12,loot:[["iron_ingot",1,3]]}),
    cobalt_elemental:monster("Elemental de Escória Azul","magma",0x304356,["caldeira vítrea","bosque de cristais","vulcânico"],55,.90,3.02,.63,2.09,strike("slam",15,2.25,.67,2.29,"fire"),
      {glow:0x6fdbff,hot:0x6f9bff,loot:[["SCORIA",1,3],["crystal_shard",1,1,.47]]}),
    salt_crab:monster("Caranguejo de Sal","crab",0xa2988d,["salinas","delta salobro","cânion calcário"],32,1.25,4.20,.58,.75,strike("lunge",9,1.85,.43,1.67),
      {glow:0xcad8d4,loot:[["SALT",2,4],["chitin",1,2]]}),
    rust_crab:monster("Caranguejo Ferrugem","crab",0xb45f46,["manguezal","termas minerais","chapadas ocres"],39,1.24,4.45,.63,.81,strike("lunge",11,1.94,.52,1.73,"corrosion"),
      {glow:0xe4a463,scale:1.10,loot:[["rust_pigment",1,2],["chitin",1,2]]}),
    ruin_medusa:medusa("Medusa das Ruínas","ruin",0x416955,0xb8ff76,0xa3985e,
      ["cânion calcário","floresta","bosque de cristais"],56,1.30,3.2,[["LIMESTONE",1,3],["crystal_shard",1,2]]),
    salt_medusa:medusa("Medusa de Sal","salt",0x7e9faa,0xa9ecff,0xd6c697,
      ["salinas","delta salobro","deserto"],50,1.12,2.8,[["SALT",2,5],["silver_dust",1,2]]),
    obsidian_medusa:medusa("Medusa de Obsidiana","obsidian",0x553447,0xff987b,0xa66545,
      ["vulcânico","caldeira vítrea","badlands"],72,1.43,3.8,[["OBSIDIAN",1,3],["crystal_shard",1,2]]),
    aurora_phantom:monster("Espectro da Aurora","wisp",0x60aabc,["fiordes glaciais","tundra","taiga","campina de aurora"],33,1.22,4.1,.39,1.34,strike("shot",9,7.7,.6,2.35))
  });
  const entries=Object.entries(species);
  const pets=["cat","dog"];
  function ambient(biome){return entries.filter(([,p])=>p.shape!=="fantasy"&&p.regions.includes(biome)).map(([id])=>id)}
  function hostile(biome,underground){
    const local=entries.filter(([,p])=>p.shape==="fantasy"&&p.regions.includes(biome)).map(([id])=>id);
    return underground?["cave_shade","cave_shade","slime","golem","cave_spider",...local]:["wisp","scorpion","slime",...local,...local];
  }
  function gazeProtection(guard,remaining){
    if(guard?.mirrorGuard&&!guard.broken)return "reflect";
    return remaining>0?"stoned":"petrify";
  }
  return {species,pets,ambient,hostile,gazeProtection};
})();

