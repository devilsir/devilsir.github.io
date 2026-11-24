"use strict";

globalThis.QuimiCraftDragons=(()=>{
  const breath=(element,params)=>({kind:"shot",dragon:true,element,...params});
  const species=Object.freeze({
    ice_dragon:{
      name:"Dragão Azul de Gelo",element:"Gelo",temperament:"neutral",scale:1.10,width:.82,height:2.22,hover:2.8,
      coat:0x427da6,back:0x223e74,belly:0x9bcdd6,wing:0x5b9fca,horn:0xc6ecfd,eye:0x9ff5ff,crest:"crystal",
      form:{length:1.13,girth:.88,neck:1.08,skull:[.89,1.03,1.13],span:1.12,chord:.88,lift:1.04,tail:1.15,flap:.94,tailWave:.95},
      silhouette:"Corpo esguio, asas pontiagudas, coroa de gelo e lâmina na cauda",
      regions:["taiga","tundra","fiordes glaciais","campina de aurora","prado alpino"],
      hp:93,walk:2.2,run:4.7,sense:17,loot:[["crystal_shard",2,4]],
      strike:breath("ice",{effect:"thermal",color:0x83d5ff,damage:13,range:10,windup:.89,cooldown:3.8,speed:13,slow:2.4})
    },
    fire_dragon:{
      name:"Dragão Vermelho de Fogo",element:"Fogo",temperament:"hostile",scale:1.30,width:.95,height:2.49,hover:3.38,
      coat:0xa33232,back:0x612935,belly:0xe9aa68,wing:0xd16242,horn:0x432e36,eye:0xffce66,crest:"ember",
      form:{length:1.02,girth:1.13,neck:.92,skull:[1.14,1.11,1.01],span:1.05,chord:1.07,lift:1.34,tail:1.04,flap:1.22,tailWave:1.17},
      silhouette:"Peito largo, chifres curvos, vela serrilhada e cauda bifurcada",
      regions:["vulcânico","caldeira vítrea","badlands","savana","chapadas ocres"],
      hp:133,walk:2.73,run:5.75,sense:20,loot:[["SULFUR",2,4],["crystal_shard",1,2]],
      strike:breath("fire",{effect:"fire",color:0xff7e39,damage:22,range:12,windup:.92,cooldown:4.1,speed:15})
    },
    nature_dragon:{
      name:"Dragão Verde da Natureza",element:"Natureza",temperament:"calm",scale:1.02,width:.77,height:2.12,hover:2.75,
      coat:0x527949,back:0x28584b,belly:0xb4bb6e,wing:0x62966a,horn:0xaa8c5f,eye:0xb6ed82,crest:"leaf",
      form:{length:.97,girth:.92,neck:1.25,skull:[.88,.84,1.04],span:1.04,chord:1.24,lift:.72,tail:1.24,flap:.86,tailWave:1.42},
      silhouette:"Pescoço alongado, galhadas ramificadas e asas em forma de folhas",
      regions:["floresta","selva tropical","floresta de sequoias","manguezal","bosque de cerejeiras","bosque lilás","planície florida"],
      hp:77,walk:2.34,run:5.12,sense:15,loot:[["hide",1,3]],strike:null
    },
    time_dragon:{
      name:"Dragão Bronze do Tempo",element:"Tempo",temperament:"neutral",scale:1.14,width:.85,height:2.35,hover:3.40,
      coat:0x9a653a,back:0x5b4247,belly:0xddaa62,wing:0xb18751,horn:0xf5d39f,eye:0xffe3a5,crest:"hourglass",
      form:{length:1.08,girth:.96,neck:1.08,skull:[.91,1.17,.94],span:1.10,chord:.84,lift:1.17,tail:1.13,flap:.79,tailWave:.79},
      silhouette:"Máscara estriada, asas estreitas e anéis em torno da coroa e da cauda",
      regions:["deserto","salinas","chapadas ocres","cânion calcário","termas minerais","planície"],
      hp:108,walk:2.56,run:5.48,sense:20,loot:[["bronze_ingot",1,3],["crystal_shard",1,2]],
      strike:breath("time",{effect:"electric",color:0xffcf7e,damage:12,range:12,windup:1.12,cooldown:4.8,speed:11,slow:3.5})
    },
    earth_dragon:{
      name:"Dragão Negro da Terra",element:"Terra",temperament:"hostile",scale:1.27,width:.98,height:2.44,hover:2.66,
      coat:0x3d3a49,back:0x262732,belly:0x797264,wing:0x54475b,horn:0xb0987b,eye:0xe7b459,crest:"stone",
      form:{length:.99,girth:1.27,neck:.83,skull:[1.25,.97,.86],span:.89,chord:1.09,lift:.64,tail:.82,flap:.73,tailWave:.57},
      silhouette:"Focinho largo, carapaça de pedra, asas baixas e martelo na cauda",
      regions:["montanha","cânion calcário","vulcânico","bosque de cristais","badlands"],
      hp:152,walk:2.05,run:4.76,sense:18,loot:[["OBSIDIAN",1,4],["crystal_shard",1,2]],
      strike:breath("earth",{effect:"physical",color:0xbba07f,damage:19,range:9,windup:1.08,cooldown:4.45,speed:16})
    }
  });
  const profile=d=>({temperament:d.temperament,hp:d.hp,walk:d.walk,run:d.run,sense:d.sense,roam:24,strike:d.strike,loot:d.loot});
  function regional(biome){return Object.keys(species).filter(id=>species[id].regions.includes(biome))}
  return {species,profile,regional};
})();
