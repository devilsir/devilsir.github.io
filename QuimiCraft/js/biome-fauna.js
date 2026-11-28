
"use strict";

globalThis.QuimiCraftBiomeFauna=(()=>{
  const strike=(kind,damage,range,windup,cooldown,effect="")=>({
    kind,damage,range,
    windup:kind==="gaze"?Math.max(.85,windup*.78):Math.max(.18,Number((windup*.58).toFixed(2))),
    cooldown:kind==="gaze"?cooldown:Math.max(.95,Number((cooldown*.68).toFixed(2))),
    effect
  });
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
  const elementalKinds={
    fire:{name:"Fogo",tint:0x97443a,trim:0x471e2c,glow:0xffa343,loot:"SULFUR",walk:1.18,run:3.68,
      attack:{name:"Descarga de fogo",kind:"shot",damage:14,range:8.4,effect:"fire",speed:13}},
    wind:{name:"Vento",tint:0x76a6ae,trim:0x324d66,glow:0xb5fff1,loot:"wind_essence",walk:1.54,run:4.62,
      attack:{name:"Rajada que empurra",kind:"shot",damage:12,range:9.6,effect:"sonic",speed:16,push:1.8}},
    water:{name:"Água",tint:0x237fb1,trim:0x1c3a72,glow:0x81ecff,loot:"SALT",walk:1.28,run:3.94,
      attack:{name:"Projétil frio que desacelera",kind:"shot",damage:13,range:8.8,effect:"thermal",speed:12,slow:1.35}},
    earth:{name:"Terra",tint:0x9d7550,trim:0x483933,glow:0xe4bd79,loot:"IRON",walk:.97,run:2.96,
      attack:{name:"Impacto sísmico",kind:"slam",damage:20,range:2.7,effect:"physical"}},
    arcane:{name:"Arcano",tint:0x7946ab,trim:0x302043,glow:0xe2aaff,loot:"crystal_shard",walk:1.22,run:3.72,
      attack:{name:"Descarga prismática",kind:"shot",damage:17,range:10.2,effect:"electric",speed:15}},
    ice:{name:"Gelo",tint:0x5eaed8,trim:0x224a6e,glow:0xb8f6ff,loot:"ICE",walk:1.15,run:3.48,
      attack:{name:"Estilhaço glacial",kind:"shot",damage:14,range:9.0,effect:"thermal",speed:13,slow:1.8}},
    lightning:{name:"Raio",tint:0x4b5ca8,trim:0x212952,glow:0xfff078,loot:"voltaic_cell",walk:1.58,run:4.82,
      attack:{name:"Relâmpago arqueado",kind:"shot",damage:16,range:10.4,effect:"electric",speed:18}},
    nature:{name:"Natureza",tint:0x3f8c54,trim:0x264830,glow:0x8eff82,loot:"MOSS",walk:1.18,run:3.52,
      attack:{name:"Rajada de esporos vivos",kind:"shot",damage:13,range:8.8,effect:"biological",speed:13,slow:1.2}}
  };
  function elemental(name,element,regions,hp,variant="",ancestral=null){
    const base=elementalKinds[element];
    const {name:elementName,loot,walk,run,attack}=base;
    const {tint,trim,glow}={...base,...ancestral};
    const lord=variant==="lord",orb=variant==="orb",scale=lord?1.57:orb?.66:1;
    const combat={...attack,elemental:element,color:glow,windup:lord?.92:.60,cooldown:lord?3.3:2.25};
    if(lord){
      combat.damage=Math.round(combat.damage*2.15);
      combat.range+=combat.kind==="slam"?1.5:3.4;
      if(combat.kind==="slam")combat.vertical=2.9;
    }else if(orb)combat.damage=10;
    if(ancestral)Object.assign(combat,ancestral.attack);
    const drops=lord?[[loot,4,7],["crystal_shard",2,4],["gold_nugget",1,2],["elemental_core",1,2]]:
      loot==="crystal_shard"?[[loot,1,2]]:[[loot,1,3],["crystal_shard",1,1,.28]];
    const lordTitle=lord?(ancestral?.title??(ancestral?"Senhor elemental ancestral":"Senhor elemental")):null;
    return monster(name,"elemental",tint,regions,hp,walk,run,(orb?.51:ancestral&&element==="earth"?.93:.76)*scale,(orb?1.91:2.64)*scale,
      combat,{element,elementName,trim,glow,lord,lordTitle,orb,scale,ancestral:!!ancestral,flying:true,hover:element==="earth"?.26:orb?.73:.48,loot:drops});
  }
  const exterminationTools={
    fracture_hammer:{name:"Martelo de Fratura",color:"#8295a1",detail:"Rompe a placa carbonática da Sentinela de Travertino Fendido. O martelo é reutilizável."},
    osmotic_salt:{name:"Sachê Osmótico",color:"#e6dec3",consumable:true,detail:"Retira água do Limo de Maré por osmose. Consome um sachê por finalização."},
    brine_cold_pack:{name:"Bolsa de Gelo Salino",color:"#75c7e2",consumable:true,effect:"vapor",detail:"Resfria a Salamandra de Brasa. Consome uma bolsa por finalização."},
    copper_ampoule:{name:"Ampola Cúprica",color:"#54c3ad",consumable:true,effect:"vapor",detail:"Neutraliza o micélio do Fungo de Vidro. Consome uma ampola por finalização."},
    echo_fork:{name:"Diapasão de Ruptura",color:"#c2a4f1",detail:"Desfaz a carapaça do Escavador de Geodo e da variante Ressonante. O diapasão é reutilizável."},
    sealing_cartridge:{name:"Cartucho de Vedação",color:"#e5ac65",consumable:true,detail:"Veda os poros das tecelãs de Fuligem e da Fornalha. Consome um cartucho por finalização."}
  };
  function bird(name,shape,coat,trim,regions,hp,speed,width,height,flying=true,attack=null){
    return {...animal(name,shape,coat,trim,"",width,height,1,regions,"skittish",hp,.85,speed,9,attack),flying};
  }
  const finishFraction=.20;
  const species=Object.freeze({
    fractured_sentinel:monster("Sentinela de Travertino Fendido","fractured_sentinel",0xb39a78,
      ["cânion calcário","chapadas ocres","termas minerais"],78,.78,2.65,.70,1.99,strike("slam",17,2.38,.83,2.75),
      {finisher:"fracture_hammer",composition:"carbonato de cálcio (CaCO₃)",loot:[["sentinel_crust",1,2]]}),
    tide_ooze:monster("Limo de Maré","tide_ooze",0x627c43,
      ["manguezal","delta salobro","pântano"],41,.85,3.08,.56,.87,strike("lunge",8,1.76,.47,2.05),
      {finisher:"osmotic_salt",composition:"água e alginato de sódio",loot:[["tide_mucus",1,2],["SALT",1,2]]}),
    ember_salamander:monster("Salamandra de Brasa","ember_salamander",0x61403c,
      ["vulcânico","caldeira vítrea","badlands","deserto"],59,1.2,4.00,.58,.71,strike("lunge",13,2.12,.51,2.36,"fire"),
      {finisher:"brine_cold_pack",composition:"carbonato básico de cobre (Cu₂CO₃(OH)₂)",loot:[["ember_scale",1,2],["SCORIA",1,2]]}),
    glass_mycelium:monster("Fungo de Vidro","glass_mycelium",0x546d67,
      ["floresta","planície florida","bosque lilás","bosque de cristais","cânion calcário"],53,.84,2.79,.64,1.52,strike("shot",9,5.5,.71,2.80,"biological"),
      {finisher:"copper_ampoule",composition:"micélio luminescente e sílica",loot:[["GLOW_FUNGUS",1,2],["SILICA_SAND",1,2],["glass_myc_field_sample",1,2]]}),
    echo_burrower:monster("Escavador de Geodo","echo_burrower",0x57596c,
      ["montanha","cânion calcário","bosque de cristais","prado alpino","termas minerais"],72,1.12,3.67,.66,.91,strike("lunge",14,2.12,.46,2.32),
      {finisher:"echo_fork",composition:"carapaça de quartzo e ametista",loot:[["AMETHYST",1,2],["crystal_shard",1,2],["geode_carapace",1,2]]}),
    soot_weaver:monster("Tecelã de Fuligem","soot_weaver",0x38323e,
      ["vulcânico","caldeira vítrea","badlands","chapadas ocres","pântano"],65,1.08,3.40,.64,.88,strike("shot",12,6.2,.65,2.65,"smoke"),
      {finisher:"sealing_cartridge",composition:"seda com partículas de carbono e placas de quitina",loot:[["carbon_rod",1,2],["chitin",1,2],["soot_silk",1,2]]}),
    resonant_burrower:monster("Escavador de Geodo Ressonante","echo_burrower",0x615373,
      ["montanha","bosque de cristais","cânion calcário","termas minerais"],112,1.20,4.16,.80,1.16,strike("slam",23,2.70,.67,2.55),
      {finisher:"echo_fork",contractOnly:true,scale:1.25,glow:0xf09fea,composition:"quartzo, ametista e granada",
        loot:[["AMETHYST",2,3],["GARNET_ORE",1,2],["crystal_shard",2,3],["resonance_nodule",1,1]]}),
    furnace_weaver:monster("Tecelã da Fornalha","soot_weaver",0x5e413e,
      ["vulcânico","caldeira vítrea","badlands","pântano"],132,1.29,4.22,.83,1.13,strike("shot",23,8.3,.57,1.94,"fire"),
      {finisher:"sealing_cartridge",contractOnly:true,scale:1.26,glow:0xfeaf59,composition:"quitina, carbono e cerâmica aluminosa",
        loot:[["carbon_rod",2,4],["SCORIA",2,3],["chitin",2,3],["furnace_carapace",1,1]]}),
    grass_snake:monster("Serpente da Mata","serpent",0x59764c,["floresta","planície florida","bosque lilás","manguezal"],
      15,1.40,4.1,.38,.50,strike("lunge",5,1.41,.36,1.58),{glow:0xe5cb66,trim:0x99a663,loot:[["hide",1,1]]}),
    pit_viper:monster("Jararaca","serpent",0x996340,["selva tropical","floresta","pântano"],
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
    tiger:animal("Tigre","cat",0xcb5921,0xf3d0a0,"tiger",.61,1.53,1.23,["taiga","bosque de cerejeiras"], "neutral",58,1.22,6.2,12,strike("lunge",16,2.25,.49,2.35)),
    lion:animal("Leão","cat",0xb78346,0xe4ba81,"mane",.60,1.62,1.22,["savana","chapadas ocres","badlands"], "neutral",53,1.16,6.35,11,strike("lunge",15,2.35,.48,2.45)),
    wolf:animal("Lobo","dog",0x677381,0xbfc4c1,"saddle",.47,1.24,1.03,["taiga","floresta","montanha","prado alpino"], "neutral",35,1.25,6.0,13,strike("lunge",10,2.03,.34,1.7)),
    opossum:animal("Saruê","opossum",0x635e62,0xe7dccc,"mask",.30,.70,1,["floresta","selva tropical","manguezal","pântano","bosque lilás"],
      "neutral",19,1.25,4.65,8,strike("lunge",7,1.62,.46,1.85)),
    anteater:animal("Tamanduá-bandeira","anteater",0x727477,0xc2bcb1,"saddle",.47,1.17,1,["selva tropical","chapadas ocres"],
      "neutral",46,.99,4.12,10,strike("slam",14,2.02,.65,2.45)),
    brown_bear:animal("Urso-pardo","bear",0x795039,0xc39269,"shoulder",.72,1.60,1.16,["taiga","montanha","floresta de sequoias"], "neutral",82,.84,4.5,11,strike("slam",19,2.3,.81,2.95)),
    polar_bear:animal("Urso-polar","bear",0xd5ded8,0xf5ead7,"snow",.75,1.68,1.24,["tundra","campina de aurora"], "neutral",89,.92,4.65,12,strike("slam",20,2.42,.77,2.85)),
    black_bear:animal("Urso-negro","bear",0x30313a,0x886344,"muzzle",.65,1.43,1.06,["floresta","bosque de cerejeiras","floresta de sequoias"], "neutral",66,.95,4.95,10,strike("slam",14,2.12,.65,2.66)),
    fennec:animal("Feneco","dog",0xd4a775,0xf5dcaa,"ears",.31,.98,.62,["deserto","salinas","cânion calcário"], "skittish",14,1.4,5.9,8),
    lynx:animal("Lince das Geadas","cat",0xaf8d6b,0xe7cfae,"tufts",.43,1.16,.87,["taiga","campina de aurora","prado alpino"], "skittish",27,1.39,5.6,9),
    maned_wolf:animal("Lobo-guará","dog",0xb45b31,0xe7c29a,"blacklegs",.40,1.51,1,
      ["savana","chapadas ocres","planície florida"],"skittish",33,1.20,5.62,10,strike("lunge",8,1.66,.43,2)),
    hoary_fox:animal("Raposa-do-campo","dog",0x978378,0xd7bf91,"saddle",.29,.69,.66,
      ["savana","chapadas ocres","planície"],"skittish",18,1.15,4.9,8),
    elephant:animal("Elefante-africano","elephant",0x797473,0x9a8581,"",1.32,3.57,1,
      ["savana"],"neutral",146,.85,4.4,13,strike("slam",26,3.25,.82,3.2)),
    rhinoceros:animal("Rinoceronte-branco","rhinoceros",0x827f75,0xa69c8d,"",.90,1.84,1,
      ["savana"],"neutral",119,.90,4.68,11,strike("lunge",24,2.7,.64,2.8)),
    hippopotamus:animal("Hipopótamo","hippopotamus",0x7c646e,0xb18b8f,"",.99,1.68,1,
      ["pântano","savana"],"neutral",112,.88,4.2,10,strike("lunge",22,2.55,.61,2.8)),
    golden_lion_tamarin:animal("Mico-leão-dourado","tamarin",0xbb5716,0xe48f38,"",.24,.61,1,
      ["selva tropical","floresta"],"skittish",15,1.04,4.12,7),
    green_iguana:animal("Iguana-verde","iguana",0x628044,0xb2ad62,"",.29,.46,1,
      ["selva tropical","manguezal","pântano"],"skittish",23,1.03,3.4,7),
    toco_toucan:bird("Tucano-toco","toucan",0x292e37,0xf0e5bf,["selva tropical","pântano","chapadas ocres"],22,3.1,.26,.72),
    hyacinth_macaw:bird("Arara-azul","macaw",0x2d54a0,0x508dcc,["pântano","savana","selva tropical"],24,3.55,.27,.75),
    harpy_eagle:bird("Harpia","harpy",0x424750,0xd5d1c1,["selva tropical"],43,4.1,.47,1.09,true,strike("melee",15,1.76,.50,2.1)),
    jabiru:bird("Tuiuiú","jabiru",0xeee7d5,0x3a3540,["pântano","delta salobro"],32,3.2,.36,1.43),
    rufous_bellied_thrush:bird("Sabiá-laranjeira","thrush",0x716354,0xbd632f,["floresta","selva tropical","planície florida"],11,2.7,.18,.39),
    three_banded_armadillo:animal("Tatu-bola","tatu",0x706359,0x997f66,"",.27,.49,1,
      ["savana","chapadas ocres","badlands"],"skittish",23,.81,2.95,7),
    pampas_deer:animal("Veado-campeiro","pampas_deer",0xa37545,0xe3c89d,"",.42,1.30,1,
      ["savana","chapadas ocres","planície florida"],"skittish",31,1.20,5.7,9),
    greater_rhea:bird("Ema","rhea",0x82796e,0xc2afa0,["savana","chapadas ocres","planície"],38,6.15,.49,1.85,false),
    coati:animal("Quati","coati",0x88603f,0xd2ba8c,"",.32,.70,1,
      ["floresta","selva tropical","pântano","chapadas ocres"],"skittish",21,1.18,4.1,8),
    lumen_deer:{...animal("Cervo Bioluminescente","lumen_deer",0x1c3f59,0x7bf8ff,"biolum",.46,1.42,1.04,
      ["floresta","bosque lilás","bosque de cristais","bosque de cerejeiras","campina de aurora","pântano"],"skittish",36,1.25,5.9,10),
      glow:0x5ef8ff,biolum:true},
    lumen_fox:{...animal("Raposa Bioluminescente","dog",0x242e5c,0x8dfcff,"biolum",.31,.76,.72,
      ["floresta","bosque lilás","bosque de cerejeiras","bosque de cristais","taiga","campina de aurora"],"skittish",22,1.32,5.6,9),
      glow:0x9c7cff,biolum:true},
    lumen_frog:{...animal("Sapo Bioluminescente","lumen_frog",0x154b52,0x72ffb8,"biolum",.25,.35,1,
      ["pântano","manguezal","selva tropical","delta salobro","floresta","bosque lilás"],"skittish",14,.95,3.8,7),
      glow:0x58ffa8,biolum:true},
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
    fire_elemental:elemental("Elemental do Fogo","fire",["vulcânico","caldeira vítrea","badlands"],76),
    wind_elemental:elemental("Elemental do Vento","wind",["prado alpino","montanha","deserto","chapadas ocres"],62),
    water_elemental:elemental("Elemental da Água","water",["delta salobro","manguezal","fiordes glaciais","termas minerais"],70),
    earth_elemental:elemental("Elemental da Terra","earth",["cânion calcário","badlands","montanha","chapadas ocres"],104),
    fire_lord:elemental("Auvrasa, Senhor das Brasas","fire",["vulcânico","caldeira vítrea"],318,"lord"),
    wind_lord:elemental("Cisalva, Senhor dos Vendavais","wind",["prado alpino","montanha"],268,"lord"),
    water_lord:elemental("Refluor, Senhor das Marés","water",["delta salobro","fiordes glaciais"],294,"lord"),
    earth_lord:elemental("Estratão, Senhor dos Estratos","earth",["cânion calcário","chapadas ocres"],365,"lord"),
    forge_lord:elemental("Vulcrisol, Regente da Fornalha","fire",["vulcânico","caldeira vítrea"],390,"lord",
      {tint:0x823321,trim:0x2d232b,glow:0xffbe51,attack:{name:"Martelada de escória",kind:"slam",damage:36,range:4.0,vertical:3.2,windup:1.16}}),
    current_lord:elemental("Talassar, Regente das Correntes","water",["delta salobro","termas minerais","fiordes glaciais"],350,"lord",
      {tint:0x266b88,trim:0x163c53,glow:0x68f3dd,attack:{name:"Corrente glacial que desacelera",damage:30,slow:2.1}}),
    geode_matriarch:elemental("Basalta, Matriarca das Geodas","earth",["cânion calcário","bosque de cristais"],430,"lord",
      {title:"Senhora elemental ancestral",tint:0x665268,trim:0x35323b,glow:0xe6acfc,attack:{name:"Abalo de geodas",damage:38,range:4.65,vertical:3.1,windup:1.12}}),
    storm_lord:elemental("Siroco, Regente da Tormenta","wind",["prado alpino","montanha","campina de aurora"],326,"lord",
      {tint:0x53659a,trim:0x263550,glow:0xf8df9e,attack:{name:"Rajada de tormenta que empurra",damage:27,push:3.7,speed:18}}),
    arcane_wisp:elemental("Centelha Arcana","arcane",["bosque de cristais","campina de aurora","bosque lilás"],43,"orb"),
    arcane_sentinel:elemental("Sentinela Arcana do Prisma","arcane",["bosque de cristais","campina de aurora"],131),
    ice_elemental:elemental("Elemental do Gelo","ice",["fiordes glaciais","tundra","taiga"],74),
    ice_lord:elemental("Glacírius, Senhor do Gelo","ice",["fiordes glaciais","tundra"],310,"lord"),
    lightning_elemental:elemental("Elemental do Raio","lightning",["montanha","prado alpino","campina de aurora"],72),
    lightning_lord:elemental("Voltaris, Senhor dos Raios","lightning",["montanha","prado alpino"],322,"lord"),
    nature_elemental:elemental("Elemental da Natureza","nature",["floresta","planície florida","bosque de cerejeiras"],82),
    nature_lord:elemental("Sylvaron, Senhor da Natureza","nature",["floresta","planície florida"],335,"lord"),
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
    const local=entries.filter(([,p])=>p.shape==="fantasy"&&!p.contractOnly&&!p.lord&&p.regions.includes(biome)).map(([id])=>id);
    return underground?["cave_shade","cave_shade","slime","golem","cave_spider",...local]:["wisp","scorpion","slime",...local,...local];
  }
  function lords(biome){return entries.filter(([,p])=>p.lord&&p.regions.includes(biome)).map(([id])=>id)}
  function gazeProtection(guard,remaining){
    if(guard?.mirrorGuard&&!guard.broken)return "reflect";
    return remaining>0?"stoned":"petrify";
  }
  return {species,elementalKinds,pets,ambient,hostile,lords,gazeProtection,exterminationTools,finishFraction};
})();

