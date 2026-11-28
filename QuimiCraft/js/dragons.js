"use strict";

globalThis.QuimiCraftDragons=(()=>{
  const breath=(element,params)=>({kind:"shot",dragon:true,element,...params});
  const species=Object.freeze({
    ice_dragon:{
      name:"Dragão Azul de Gelo",element:"Gelo",temperament:"neutral",scale:1.24,width:.93,height:2.58,hover:3.0,
      coat:0x427da6,back:0x223e74,belly:0x9bcdd6,wing:0x5b9fca,horn:0xc6ecfd,eye:0x9ff5ff,crest:"crystal",
      form:{length:1.13,girth:.88,neck:1.08,skull:[.89,1.03,1.13],span:1.12,chord:.88,lift:1.04,tail:1.15,flap:.94,tailWave:.95},
      silhouette:"Corpo esguio, asas pontiagudas, coroa de gelo e lâmina na cauda",
      regions:["taiga","tundra","fiordes glaciais","campina de aurora","prado alpino"],
      hp:93,walk:2.2,run:4.7,sense:17,loot:[["dragon_saliva_ice",1,2],["crystal_shard",2,4]],
      strike:breath("ice",{effect:"thermal",color:0x83d5ff,damage:13,range:10,windup:.89,cooldown:3.8,speed:13,slow:2.4})
    },
    fire_dragon:{
      name:"Dragão Vermelho de Fogo",element:"Fogo",temperament:"hostile",scale:1.48,width:1.08,height:2.88,hover:3.6,
      coat:0xa33232,back:0x612935,belly:0xe9aa68,wing:0xd16242,horn:0x432e36,eye:0xffce66,crest:"ember",
      form:{length:1.02,girth:1.13,neck:.92,skull:[1.14,1.11,1.01],span:1.05,chord:1.07,lift:1.34,tail:1.04,flap:1.22,tailWave:1.17},
      silhouette:"Peito largo, chifres curvos, vela serrilhada e cauda bifurcada",
      regions:["vulcânico","caldeira vítrea","badlands","savana","chapadas ocres"],
      hp:133,walk:2.73,run:5.75,sense:20,loot:[["dragon_saliva_fire",1,2],["SULFUR",2,4],["crystal_shard",1,2]],
      strike:breath("fire",{effect:"fire",color:0xff7e39,damage:22,range:12,windup:.92,cooldown:4.1,speed:15})
    },
    nature_dragon:{
      name:"Dragão Verde da Natureza",element:"Natureza",temperament:"calm",scale:1.16,width:.87,height:2.46,hover:2.95,
      coat:0x527949,back:0x28584b,belly:0xb4bb6e,wing:0x62966a,horn:0xaa8c5f,eye:0xb6ed82,crest:"leaf",
      form:{length:.97,girth:.92,neck:1.25,skull:[.88,.84,1.04],span:1.04,chord:1.24,lift:.72,tail:1.24,flap:.86,tailWave:1.42},
      silhouette:"Pescoço alongado, galhadas ramificadas e asas em forma de folhas",
      regions:["floresta","selva tropical","floresta de sequoias","manguezal","bosque de cerejeiras","bosque lilás","planície florida"],
      hp:77,walk:2.34,run:5.12,sense:15,loot:[["dragon_saliva_nature",1,2],["hide",1,3]],strike:null
    },
    time_dragon:{
      name:"Dragão Bronze do Tempo",element:"Tempo",temperament:"neutral",scale:1.29,width:.96,height:2.72,hover:3.62,
      coat:0x9a653a,back:0x5b4247,belly:0xddaa62,wing:0xb18751,horn:0xf5d39f,eye:0xffe3a5,crest:"hourglass",
      form:{length:1.08,girth:.96,neck:1.08,skull:[.91,1.17,.94],span:1.10,chord:.84,lift:1.17,tail:1.13,flap:.79,tailWave:.79},
      silhouette:"Máscara estriada, asas estreitas e anéis em torno da coroa e da cauda",
      regions:["deserto","salinas","chapadas ocres","cânion calcário","termas minerais","planície"],
      hp:108,walk:2.56,run:5.48,sense:20,loot:[["dragon_saliva_time",1,2],["bronze_ingot",1,3],["crystal_shard",1,2]],
      strike:breath("time",{effect:"electric",color:0xffcf7e,damage:12,range:12,windup:1.12,cooldown:4.8,speed:11,slow:3.5})
    },
    earth_dragon:{
      name:"Dragão Negro da Terra",element:"Terra",temperament:"hostile",scale:1.44,width:1.11,height:2.81,hover:2.88,
      coat:0x3d3a49,back:0x262732,belly:0x797264,wing:0x54475b,horn:0xb0987b,eye:0xe7b459,crest:"stone",
      form:{length:.99,girth:1.27,neck:.83,skull:[1.25,.97,.86],span:.89,chord:1.09,lift:.64,tail:.82,flap:.73,tailWave:.57},
      silhouette:"Focinho largo, carapaça de pedra, asas baixas e martelo na cauda",
      regions:["montanha","cânion calcário","vulcânico","bosque de cristais","badlands"],
      hp:152,walk:2.05,run:4.76,sense:18,loot:[["dragon_saliva_earth",1,2],["OBSIDIAN",1,4],["crystal_shard",1,2]],
      strike:breath("earth",{effect:"physical",color:0xbba07f,damage:19,range:9,windup:1.08,cooldown:4.45,speed:16})
    },
    time_lost_protodrake:{
      name:"Protodraco Perdido no Tempo",element:"Tempo",temperament:"neutral",bodyPlan:"proto",scale:1.54,width:1.12,height:3.12,hover:4.1,
      coat:0xa58931,back:0x484420,belly:0xb4b2a0,wing:0x50413f,horn:0x343626,eye:0x8dfff0,mouthGlow:0x41efdc,crest:"proto",
      form:{length:1.03,girth:1.20,neck:1.00,skull:[1.25,1.15,1.18],span:1.30,chord:1.22,lift:1.45,tail:1.21,flap:.92,tailWave:.92},
      silhouette:"Protodraco bípede de escamas douradas, maxilar largo com brilho ciano e asas arqueadas de membrana escura",
      regions:["prado alpino","fiordes glaciais","montanha","tundra","campina de aurora"],
      hp:185,walk:2.7,run:6.1,sense:24,loot:[["dragon_saliva_time",2,3],["bronze_ingot",2,4],["crystal_shard",3,5]],
      strike:breath("time",{effect:"electric",color:0x72fff5,damage:18,range:13,windup:.98,cooldown:4.2,speed:13.5,slow:3.6})
    },
    elemental_lizard_fire:{
      name:"Lagarto Elemental do Fogo",element:"Fogo",temperament:"hostile",bodyPlan:"elemental",scale:1.38,width:1.04,height:2.75,hover:3.4,
      coat:0x42221c,back:0x1d1416,belly:0xb64218,wing:0xeb5e1a,horn:0xff9d3b,eye:0xffb338,glow:0xff6218,crest:"elem_fire",
      form:{length:1.10,girth:1.15,neck:.84,skull:[1.18,1.08,1.18],span:1.16,chord:1.02,lift:1.18,tail:1.34,flap:1.08,tailWave:1.16},
      silhouette:"Lagarto bípede vulcânico com juba de chamas, fendas de lava e asas flamejantes",
      regions:["vulcânico","caldeira vítrea","badlands","chapadas ocres"],
      hp:158,walk:2.65,run:5.8,sense:21,loot:[["dragon_saliva_fire",1,2],["SULFUR",2,4],["MAGMA_ROCK",2,3]],
      strike:breath("fire",{effect:"fire",color:0xff6b24,damage:24,range:12,windup:.88,cooldown:3.9,speed:15.5})
    },
    elemental_lizard_ice:{
      name:"Lagarto Elemental do Gelo",element:"Gelo",temperament:"hostile",bodyPlan:"elemental",scale:1.34,width:1.00,height:2.70,hover:3.3,
      coat:0x457eb8,back:0x1a386b,belly:0xc2f6ff,wing:0x428fd6,horn:0xdffbff,eye:0xb8ffff,glow:0x6ce8ff,crest:"elem_ice",
      form:{length:1.12,girth:1.04,neck:.86,skull:[1.08,1.02,1.24],span:1.18,chord:.98,lift:1.14,tail:1.36,flap:.98,tailWave:1.08},
      silhouette:"Lagarto bípede glacial coberto por espinhos translúcidos de gelo e asas cristalinas",
      regions:["fiordes glaciais","tundra","taiga","campina de aurora"],
      hp:146,walk:2.55,run:5.5,sense:20,loot:[["dragon_saliva_ice",1,2],["ICE",2,4],["SAPPHIRE_ORE",1,2]],
      strike:breath("ice",{effect:"thermal",color:0x8ae8ff,damage:18,range:12,windup:.86,cooldown:3.7,speed:14.5,slow:3.0})
    },
    elemental_lizard_earth:{
      name:"Lagarto Elemental da Terra",element:"Terra",temperament:"hostile",bodyPlan:"elemental",scale:1.44,width:1.16,height:2.86,hover:2.95,
      coat:0x7a6c53,back:0x4c4435,belly:0x9c8b68,wing:0x8d6e36,horn:0x2a2420,eye:0xffcf54,glow:0xffbc38,crest:"elem_earth",
      form:{length:1.06,girth:1.28,neck:.78,skull:[1.26,1.14,1.14],span:1.12,chord:1.08,lift:1.04,tail:1.28,flap:.84,tailWave:.86},
      silhouette:"Lagarto bípede rochoso com cauda de blocos flutuantes ligados por raios dourados e asas de pedra",
      regions:["montanha","cânion calcário","badlands","deserto","bosque de cristais"],
      hp:174,walk:2.30,run:5.1,sense:19,loot:[["dragon_saliva_earth",1,2],["OBSIDIAN",2,4],["crystal_shard",2,3]],
      strike:breath("earth",{effect:"physical",color:0xf4bd56,damage:22,range:10.5,windup:1.02,cooldown:4.3,speed:16})
    },
    elemental_lizard_storm:{
      name:"Lagarto Elemental da Tempestade",element:"Tempestade",temperament:"hostile",bodyPlan:"elemental",scale:1.36,width:1.00,height:2.74,hover:3.85,
      coat:0x5c6e8c,back:0x2b364d,belly:0xd0e3f6,wing:0x5183cc,horn:0xeaf7ff,eye:0x9cf0ff,glow:0x7fdcff,crest:"elem_storm",
      form:{length:1.14,girth:1.00,neck:.92,skull:[1.06,1.02,1.20],span:1.22,chord:.96,lift:1.24,tail:1.38,flap:1.14,tailWave:1.28},
      silhouette:"Lagarto bípede tempestuoso com galhadas elétricas, arcos voltaicos e asas de relâmpago",
      regions:["prado alpino","montanha","campina de aurora","planície","termas minerais"],
      hp:150,walk:2.85,run:6.3,sense:23,loot:[["dragon_saliva_time",1,2],["wind_essence",2,4],["crystal_shard",2,3]],
      strike:breath("storm",{effect:"electric",color:0x8de6ff,damage:19,range:13,windup:.82,cooldown:3.6,speed:17,slow:1.6})
    },
    emerald_drake:{
      name:"Draco Esmeralda",element:"Natureza",temperament:"calm",bodyPlan:"drake",scale:1.28,width:.96,height:2.66,hover:3.35,
      coat:0x2c8c42,back:0x1b5229,belly:0xc2a266,wing:0xd98632,horn:0x9e7442,eye:0xc6ff7a,tailAccent:0xe6842c,crest:"drake_green",
      form:{length:1.08,girth:.96,neck:1.18,skull:[.94,.92,1.08],span:1.18,chord:1.08,lift:1.12,tail:1.22,flap:.92,tailWave:1.24},
      silhouette:"Draco esmeralda com asas âmbar-alaranjadas, placas dorsais e clava espinhosa na cauda",
      regions:["floresta","selva tropical","floresta de sequoias","planície florida","bosque lilás"],
      hp:108,walk:2.50,run:5.5,sense:18,loot:[["dragon_saliva_nature",1,2],["EMERALD_ORE",1,2]],strike:null
    },
    ruby_drake:{
      name:"Draco Rubi",element:"Fogo",temperament:"neutral",bodyPlan:"drake",scale:1.36,width:1.02,height:2.78,hover:3.55,
      coat:0xaa2e1c,back:0x5c1812,belly:0xe6d7b8,wing:0xe6c89a,horn:0x7c5334,eye:0xffd25a,tailAccent:0xf29f38,crest:"drake_red",
      form:{length:1.08,girth:1.04,neck:1.16,skull:[.98,.96,1.08],span:1.18,chord:1.06,lift:1.16,tail:1.20,flap:1.02,tailWave:1.15},
      silhouette:"Draco rubi de escamas carmesim, membranas claras, crista laranja e clava flamejante",
      regions:["vulcânico","chapadas ocres","savana","badlands"],
      hp:138,walk:2.65,run:5.75,sense:20,loot:[["dragon_saliva_fire",1,2],["RUBY_ORE",1,2]],
      strike:breath("fire",{effect:"fire",color:0xff843d,damage:21,range:12,windup:.90,cooldown:4.0,speed:15})
    },
    azure_drake:{
      name:"Draco Lazúli",element:"Arcano",temperament:"neutral",bodyPlan:"drake",scale:1.34,width:1.00,height:2.74,hover:3.65,
      coat:0x1c8496,back:0x114c5e,belly:0xd8ebe8,wing:0xebd9be,horn:0xd8b882,eye:0x9ef8ff,tailAccent:0xdfbe7e,crest:"drake_blue",
      form:{length:1.10,girth:.98,neck:1.18,skull:[.95,.94,1.10],span:1.20,chord:1.05,lift:1.16,tail:1.22,flap:.96,tailWave:1.12},
      silhouette:"Draco turquesa-lazúli com asas luminosas de marfim, chifre nasal e clava dourada",
      regions:["fiordes glaciais","campina de aurora","taiga","prado alpino","bosque de cristais"],
      hp:132,walk:2.55,run:5.65,sense:21,loot:[["dragon_saliva_ice",1,2],["SAPPHIRE_ORE",1,2]],
      strike:breath("arcane",{effect:"electric",color:0x78dcff,damage:19,range:12.5,windup:.88,cooldown:3.9,speed:15.5,slow:1.8})
    },
    obsidian_drake:{
      name:"Draco Obsidiana",element:"Fogo",temperament:"hostile",bodyPlan:"drake",scale:1.40,width:1.06,height:2.84,hover:3.45,
      coat:0x261717,back:0x140d0f,belly:0xd19449,wing:0xc9521e,horn:0x3b231e,eye:0xffa638,tailAccent:0xff7b26,crest:"drake_black",
      form:{length:1.08,girth:1.08,neck:1.14,skull:[1.04,1.00,1.08],span:1.18,chord:1.08,lift:1.16,tail:1.18,flap:1.00,tailWave:1.06},
      silhouette:"Draco negro-obsidiana com asas cor de brasa, ventre dourado e clava vulcânica",
      regions:["vulcânico","caldeira vítrea","montanha","cânion calcário","badlands"],
      hp:154,walk:2.58,run:5.7,sense:21,loot:[["dragon_saliva_earth",1,2],["OBSIDIAN",2,4]],
      strike:breath("fire",{effect:"fire",color:0xff621e,damage:23,range:12,windup:.90,cooldown:4.0,speed:15})
    },
    bronze_drake:{
      name:"Draco de Bronze",element:"Tempo",temperament:"neutral",bodyPlan:"drake",scale:1.34,width:1.00,height:2.75,hover:3.70,
      coat:0xa67c26,back:0x5c4717,belly:0xebe0b5,wing:0xe5d9a8,horn:0x458059,eye:0xffe488,tailAccent:0xf2cb62,crest:"drake_bronze",
      form:{length:1.10,girth:1.00,neck:1.18,skull:[.96,.95,1.09],span:1.22,chord:1.04,lift:1.18,tail:1.22,flap:.88,tailWave:1.02},
      silhouette:"Draco de bronze polido com crista esverdeada, asas de ouro claro e clava solar",
      regions:["deserto","salinas","chapadas ocres","cânion calcário","planície"],
      hp:136,walk:2.62,run:5.8,sense:21,loot:[["dragon_saliva_time",1,2],["bronze_ingot",2,4]],
      strike:breath("time",{effect:"electric",color:0xffd578,damage:17,range:12.5,windup:1.02,cooldown:4.3,speed:12.5,slow:3.4})
    },
    aspect_time:{
      name:"Aspecto do Tempo",element:"Tempo",temperament:"neutral",bodyPlan:"aspect",scale:2.43,width:1.80,height:4.86,hover:5.2,
      coat:0xc29224,back:0x664916,belly:0xeee2bc,wing:0x706c7a,horn:0xf2cd74,eye:0x5ce8ff,ornament:0xdca846,crest:"aspect_time",
      form:{length:1.12,girth:1.10,neck:1.14,skull:[1.08,1.10,1.12],span:1.26,chord:1.06,lift:1.22,tail:1.22,flap:.82,tailWave:.90},
      silhouette:"Dragão ancião dourado de barba solar, ombreiras de bronze, olhos ciano e anel temporal",
      regions:["deserto","salinas","chapadas ocres"],
      hp:630,walk:2.75,run:6.1,sense:32,loot:[["dragon_saliva_time",2,3],["GOLD",2,4],["crystal_shard",3,5]],
      strike:breath("time",{effect:"electric",color:0xffe084,damage:42,range:19,windup:1.0,cooldown:4.3,speed:16,slow:5.2})
    },
    aspect_dream:{
      name:"Aspecto do Sonho",element:"Natureza",temperament:"calm",bodyPlan:"aspect",scale:2.34,width:1.71,height:4.68,hover:5.0,
      coat:0x33a36d,back:0x1b5c42,belly:0x9ce3b4,wing:0x5cc486,horn:0xd0e8d6,eye:0xb8ffdb,ornament:0x9a5ab8,crest:"aspect_dream",
      form:{length:1.10,girth:1.02,neck:1.24,skull:[1.00,1.02,1.10],span:1.26,chord:1.14,lift:1.12,tail:1.28,flap:.86,tailWave:1.32},
      silhouette:"Dragão ancião esmeralda com diadema prateado, crina violeta e asas luminosas do sonho",
      regions:["floresta de sequoias","bosque lilás","bosque de cerejeiras","selva tropical"],
      hp:585,walk:2.65,run:5.9,sense:30,loot:[["dragon_saliva_nature",2,3],["EMERALD_ORE",2,3],["crystal_shard",2,4]],
      strike:breath("nature",{effect:"biological",color:0x92d65b,damage:36,range:17,windup:1.0,cooldown:4.0,speed:16,slow:2.4})
    },
    aspect_life:{
      name:"Aspecto da Vida",element:"Fogo",temperament:"neutral",bodyPlan:"aspect",scale:2.46,width:1.80,height:4.92,hover:5.2,
      coat:0xa8201e,back:0x5c1112,belly:0xe6b97a,wing:0xd43b24,horn:0xecc16a,eye:0xffdb6e,ornament:0xc278f5,crest:"aspect_life",
      form:{length:1.10,girth:1.12,neck:1.18,skull:[1.08,1.08,1.12],span:1.28,chord:1.10,lift:1.26,tail:1.22,flap:.96,tailWave:1.12},
      silhouette:"Dragão ancião carmesim de chifres dourados, colar real e orbe vital violeta sob a garganta",
      regions:["vulcânico","chapadas ocres","planície florida","savana"],
      hp:675,walk:2.8,run:6.2,sense:32,loot:[["dragon_saliva_fire",2,3],["RUBY_ORE",2,3],["GOLD",2,4]],
      strike:breath("fire",{effect:"fire",color:0xff7538,damage:52,range:19,windup:.92,cooldown:4.0,speed:18})
    },
    aspect_magic:{
      name:"Aspecto da Magia",element:"Arcano",temperament:"neutral",bodyPlan:"aspect",scale:2.40,width:1.74,height:4.80,hover:5.25,
      coat:0x2448ab,back:0x13225e,belly:0x9cbbe8,wing:0x3b6ee0,horn:0xc4e2ff,eye:0xc6a8ff,ornament:0x8ef2ff,crest:"aspect_magic",
      form:{length:1.14,girth:1.06,neck:1.18,skull:[1.04,1.08,1.14],span:1.28,chord:1.04,lift:1.24,tail:1.24,flap:.90,tailWave:1.05},
      silhouette:"Dragão ancião safira com cristas cristalinas, barba arcana e runas luminosas",
      regions:["fiordes glaciais","campina de aurora","bosque de cristais","tundra"],
      hp:615,walk:2.7,run:6.1,sense:33,loot:[["dragon_saliva_ice",2,3],["SAPPHIRE_ORE",2,3],["OPAL_ORE",1,2]],
      strike:breath("arcane",{effect:"electric",color:0x9b82ff,damage:48,range:20,windup:.90,cooldown:3.9,speed:19,slow:3.4})
    },
    aspect_cataclysm:{
      name:"Aspecto do Cataclismo",element:"Fogo",temperament:"hostile",bodyPlan:"aspect",scale:2.58,width:1.95,height:5.16,hover:4.9,
      coat:0x292528,back:0x141216,belly:0x702612,wing:0x45221d,horn:0x565258,eye:0xff8c24,ornament:0xff5a14,crest:"aspect_cataclysm",
      form:{length:1.14,girth:1.28,neck:1.02,skull:[1.28,1.18,1.18],span:1.26,chord:1.14,lift:1.24,tail:1.18,flap:.86,tailWave:.86},
      silhouette:"Colosso de obsidiana e ferro rebitado com mandíbula blindada e fissuras incandescentes de magma",
      regions:["vulcânico","caldeira vítrea","montanha","badlands"],
      hp:780,walk:2.6,run:5.9,sense:34,loot:[["dragon_saliva_earth",2,3],["dragon_saliva_fire",2,3],["OBSIDIAN",3,6]],
      strike:breath("fire",{effect:"fire",color:0xff5218,damage:58,range:20,windup:.96,cooldown:4.1,speed:19})
    }
  });
  const flightStyles={
    crystal:{turn:2.25,lift:4.15,dive:3.6,cruise:1.42,glide:.78},
    ember:{turn:1.65,lift:5.15,dive:4.2,cruise:1.52,glide:.43},
    leaf:{turn:2.7,lift:3.45,dive:3.2,cruise:1.21,glide:.61},
    hourglass:{turn:2.05,lift:3.9,dive:3.7,cruise:1.36,glide:.87},
    stone:{turn:1.42,lift:3.6,dive:3.0,cruise:1.19,glide:.29},
    proto:{turn:1.85,lift:4.9,dive:4.3,cruise:1.55,glide:.72},
    elem_fire:{turn:1.95,lift:4.8,dive:4.1,cruise:1.48,glide:.48},
    elem_ice:{turn:2.15,lift:4.3,dive:3.8,cruise:1.44,glide:.70},
    elem_earth:{turn:1.55,lift:3.85,dive:3.4,cruise:1.26,glide:.38},
    elem_storm:{turn:2.55,lift:5.1,dive:4.4,cruise:1.62,glide:.82},
    drake_green:{turn:2.50,lift:3.85,dive:3.5,cruise:1.34,glide:.72},
    drake_red:{turn:1.90,lift:4.85,dive:4.1,cruise:1.48,glide:.55},
    drake_blue:{turn:2.25,lift:4.45,dive:3.8,cruise:1.46,glide:.78},
    drake_black:{turn:1.80,lift:4.65,dive:4.0,cruise:1.44,glide:.52},
    drake_bronze:{turn:2.15,lift:4.25,dive:3.8,cruise:1.42,glide:.86},
    aspect_time:{turn:1.95,lift:4.45,dive:4.0,cruise:1.50,glide:.88},
    aspect_dream:{turn:2.30,lift:4.15,dive:3.6,cruise:1.40,glide:.78},
    aspect_life:{turn:1.85,lift:5.10,dive:4.3,cruise:1.56,glide:.64},
    aspect_magic:{turn:2.15,lift:4.75,dive:4.1,cruise:1.54,glide:.84},
    aspect_cataclysm:{turn:1.50,lift:4.70,dive:4.2,cruise:1.46,glide:.44}
  };
  const breathStyles={
    fire:{light:0xff632b,trim:0xffdc83,mist:0x9d2852,radius:.25,gravity:0,range:1.7},
    ice:{light:0x53bdff,trim:0xdaf6ff,mist:0x5168c6,radius:.18,gravity:0,range:1.8},
    time:{light:0xffa742,trim:0xffebad,mist:0x8061c5,radius:.26,gravity:0,range:1.65},
    earth:{light:0xf79b5a,trim:0xecbe83,mist:0x8b4a51,radius:.25,gravity:8.5,range:1.7},
    nature:{light:0x75c842,trim:0xe1fca4,mist:0x26877b,radius:.22,gravity:0,range:1.6},
    storm:{light:0x66dcff,trim:0xf0fcff,mist:0x3f58a8,radius:.21,gravity:0,range:1.85},
    arcane:{light:0x8f74ff,trim:0xe4dcff,mist:0x2a69c4,radius:.23,gravity:0,range:1.8}
  };
  const natureBreath=breath("nature",{effect:"biological",color:0x92d65b,damage:14,slow:1.15,speed:15,cooldown:2.7,range:11});
  const burstRules=Object.freeze({chance:.10,charge:1.15,duration:3,interval:.25});
  function rollBurst(strike,random=Math.random){
    return random()<burstRules.chance?{chargeLeft:burstRules.charge,remaining:burstRules.duration,sincePulse:0,
      damage:strike.damage,range:strike.range+.65}:null;
  }
  function advanceCharge(burst,dt){
    const spent=Math.min(dt,burst.chargeLeft);
    burst.chargeLeft-=spent;
    return dt-spent;
  }
  function advanceBurst(burst,dt,pulse){
    const elapsed=Math.min(dt,burst.remaining);
    burst.remaining=Math.max(0,burst.remaining-elapsed);
    burst.sincePulse+=elapsed;
    while(burst.sincePulse+1e-8>=burstRules.interval){
      burst.sincePulse-=burstRules.interval;
      pulse(burst.damage);
    }
    return burst.remaining>1e-8;
  }
  function burstProtection(shieldId,broken){
    return shieldId==="shield_dragon"&&!broken;
  }
  const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
  const approach=(a,b,rate,dt)=>a+(b-a)*(1-Math.exp(-rate*dt));
  const turn=(from,to)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
  const heading=(from,to)=>Math.atan2(to.x-from.x,to.z-from.z);
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const restModes=new Set(["idle","wander","return","patrol","guard","greet"]);
  function shotDirection(T,origin,target,strike){
    const delta=target.clone().sub(origin),gravity=breathStyles[strike.element].gravity;
    if(gravity){
      const horizontal=Math.hypot(delta.x,delta.z),speed2=strike.speed**2;
      if(horizontal>.01){
        const discriminant=speed2**2-gravity*(gravity*horizontal**2+2*delta.y*speed2);
        if(discriminant>=0)delta.y=(gravity*horizontal**2+2*delta.y*speed2)/(speed2+Math.sqrt(discriminant));
      }
    }
    return delta.normalize();
  }
  function fly(e,d,behavior,dt,{ground,clear,wingClear,ceiling}){
    const style=flightStyles[d.crest]||flightStyles.ember;
    const f=e.dragonFlight??={clock:e.phase*2.3,vx:0,vy:0,vz:0,heading:e.angle,plan:0,bank:0,glide:0,landing:0};
    f.clock+=dt;
    const calm=restModes.has(behavior.mode);
    const rest=behavior.rest||calm&&f.clock%33<9.4;
    const aim=behavior.aim;
    const bracing=behavior.mode==="windup"||behavior.mode==="strike"||behavior.mode==="breath"||behavior.mode==="breathCharge";
    let goal=behavior.goal,pace=behavior.speed;
    const home=e.ai.home,side=Math.sin(e.phase)>=0?1:-1;
    if(aim&&behavior.mode==="recover"&&!e.onGround){
      const angle=heading(aim,e)+side*1.38;
      goal={x:e.x+Math.sin(angle)*6,y:aim.y,z:e.z+Math.cos(angle)*6};
      pace=d.walk*1.36;
    }
    if(!rest&&!goal&&!aim){
      const orbit=f.clock*.26*side+e.phase,radius=Math.min(e.profile.roam*.43,10);
      goal={x:home.x+Math.sin(orbit)*radius,y:home.y,z:home.z+Math.cos(orbit)*radius};
      pace=d.walk*1.33;
    }
    const fromX=e.x,fromY=e.y,fromZ=e.z;
    const floor=ground(e,e.x,e.z,e.y+.24,e.y-10);
    if(rest&&!e.onGround){
      if(!f.perch||f.perchTimer<=0){
        f.perchTimer=.65;
        f.perch=null;
        const a=goal?heading(e,goal):f.heading;
        for(const [offset,reach] of [[0,0],[0,3],[side*.93,3],[-side*.93,3],[side*1.80,4],[-side*1.80,4]]){
          const x=e.x+Math.sin(a+offset)*reach,z=e.z+Math.cos(a+offset)*reach;
          const y=ground(e,x,z,e.y+.20,e.y-8);
          if(y==null||!clear(e,x,e.y,z))continue;
          f.perch={x,y,z};break;
        }
      }
      f.perchTimer-=dt;
      goal=f.perch;pace=goal?d.walk:0;
    }else{f.perch=null;f.perchTimer=0}
    let travel=goal?distance(e,goal):0;
    const desired=travel>.12?heading(e,goal):f.heading;
    const grounded=rest&&e.onGround&&floor!=null;
    let targetY=grounded?floor:floor==null?e.y:floor+d.hover;
    if(!grounded&&!rest){
      if(calm)targetY+=.65+Math.sin(f.clock*.48)*.55;
      if(goal&&!calm)targetY=Math.max(targetY,Math.min(e.y+5.5,goal.y+(behavior.mode==="flee"?d.hover+1.0:d.hover*.8)));
      if(bracing&&aim&&floor!==null)targetY=Math.max(floor+.87,Math.min(targetY,aim.y+d.hover));
      if(floor===null&&goal&&goal.y<e.y-2)targetY=e.y-.85;
    }
    if(rest&&!grounded&&f.perch){
      targetY=travel<.8?f.perch.y:Math.max(e.y,f.perch.y+.88);
      if(travel<.55)travel=0;
    }
    let course=desired,holdForClimb=false;
    if(travel>.12&&!grounded&&!rest){
      f.plan-=dt;
      if(f.waypoint&&(distance(e,f.waypoint)<.70||(f.waypoint.left-=dt)<=0))f.waypoint=null;
      if(!f.waypoint&&f.plan<=0){
        f.plan=.24;
        const look=Math.min(travel+.40,clamp(pace*1.12,3.4,6.8));
        const preferred=Math.sign(turn(f.heading,desired))||side;
        const offsets=[0,preferred*.52,-preferred*.52,preferred*1.09,-preferred*1.09,preferred*1.61,-preferred*1.61];
        f.blocked=true;
        search: for(const lift of [0,2.4,4.5]){
          const y=Math.min(ceiling,Math.max(e.y,targetY)+lift);
          let open=true;
          for(let h=e.y+.78;h<y&&open;h+=.78)open=clear(e,e.x,h,e.z);
          if(!open||!clear(e,e.x,y,e.z))continue;
          for(const off of offsets){
            const a=desired+off,dx=Math.sin(a),dz=Math.cos(a);
            const x=e.x+dx*look,z=e.z+dz*look;
            const steps=Math.ceil(look/.78);
            let pass=true;
            for(let i=1;i<=steps&&pass;i++){
              const h=look*i/steps;
              pass=clear(e,e.x+dx*h,y,e.z+dz*h);
            }
            if(!pass||!wingClear(e,x,y,z,a))continue;
            f.blocked=false;
            if(off||lift||y-e.y>1.05)f.waypoint={x,y,z,left:4.2};
            break search;
          }
        }
      }
      if(f.waypoint){
        course=heading(e,f.waypoint);
        targetY=Math.max(targetY,f.waypoint.y);
        travel=distance(e,f.waypoint);
        holdForClimb=e.y<f.waypoint.y-.38&&f.waypoint.y>targetY-.15;
      }else if(f.blocked)targetY=Math.max(targetY,e.y+1.25);
    }else{
      f.plan=0;f.waypoint=null;f.blocked=false;
    }
    targetY=clamp(targetY,1,ceiling);
    const toCourse=turn(f.heading,course);
    f.heading+=clamp(toCourse,-style.turn*dt,style.turn*dt);
    const face=aim?heading(e,aim):f.heading;
    const yaw=turn(e.angle,face);
    e.angle+=clamp(yaw,-style.turn*(aim?2.4:1.45)*dt,style.turn*(aim?2.4:1.45)*dt);
    const goalSpeed=travel>.12&&!bracing&&!f.blocked&&!holdForClimb?
      Math.min(pace*(grounded?1:style.cruise),travel*(rest?1.15:1.55))*clamp(Math.cos(toCourse),.12,1):0;
    const slow=e.frostTime>0?.52:1;
    f.vx=approach(f.vx,Math.sin(f.heading)*goalSpeed*slow,goalSpeed?3.4:5.9,dt);
    f.vz=approach(f.vz,Math.cos(f.heading)*goalSpeed*slow,goalSpeed?3.4:5.9,dt);
    const fall=rest?Math.min(3.15,style.dive):style.dive;
    f.vy=approach(f.vy,clamp((targetY-e.y)*2.25,-fall,style.lift),5.3,dt);
    let nextY=clamp(e.y+f.vy*dt,1,ceiling);
    if(rest&&floor!==null&&targetY===floor&&nextY<=floor+.075){nextY=floor;f.vy=0}
    if(clear(e,e.x,nextY,e.z))e.y=nextY;
    else {f.vy=0;f.plan=0}
    const nx=e.x+(f.vx+(e.vx||0))*dt,nz=e.z+(f.vz+(e.vz||0))*dt;
    if(clear(e,nx,e.y,nz)&&(!grounded||ground(e,nx,nz,e.y+.1,e.y-.13)!=null)){
      e.x=nx;e.z=nz;
    }else{f.vx*=.47;f.vz*=.47;f.plan=0;f.waypoint=null}
    e.vx*=Math.pow(.045,dt);e.vz*=Math.pow(.045,dt);
    const speed=Math.hypot(e.x-fromX,e.z-fromZ)/dt,vertical=(e.y-fromY)/dt;
    e.onGround=floor!==null&&Math.abs(e.y-floor)<.085&&vertical<.44;
    f.bank=approach(f.bank,bracing?0:clamp(-toCourse*1.22,-1,1),5,dt);
    f.glide=approach(f.glide,!rest&&speed>d.walk*.8&&vertical<.85&&!bracing&&Math.sin(f.clock*1.3)>.02?style.glide:0,2.6,dt);
    f.climb=clamp(vertical/style.lift,-1,1);
    f.landing=approach(f.landing,rest&&!e.onGround&&f.perch&&travel<1.35?clamp(1-(e.y-f.perch.y)/2.3,0,1):0,6,dt);
    return speed;
  }
  const profile=d=>({temperament:d.temperament,hp:d.hp,walk:d.walk,run:d.run,sense:d.sense,roam:24,strike:d.strike,
    loot:[...d.loot,["dragon_hide",2,4]]});
  function regional(biome){return Object.keys(species).filter(id=>species[id].regions.includes(biome))}
  return {species,profile,regional,fly,breathStyles,natureBreath,shotDirection,burstRules,rollBurst,advanceCharge,advanceBurst,burstProtection};
})();
