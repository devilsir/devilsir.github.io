
"use strict";

globalThis.QuimiCraftArsenal=(()=>{
  const weapons={
    iron_sword:{family:"sword",name:"Espada curta de ferro",damage:15,reach:3.25,cooldown:.38,color:"#cdd7dc",
      detail:"Espada inicial. 15 de dano e 3,25 blocos de alcance."},
    dagger:{family:"sword",name:"Adaga",damage:9,reach:2.35,cooldown:.21,color:"#a3b8be",trim:"#d9f5eb",style:"dagger",
      ingredients:[["iron_ingot",1],["hide",1]],repair:[["iron_ingot",1]],durability:245,
      detail:"Lâmina curta e rápida. 9 de dano por golpe."},
    longsword:{family:"sword",name:"Espada longa",damage:20,reach:3.90,cooldown:.51,color:"#8faab5",trim:"#e2ebe2",style:"longsword",
      ingredients:[["iron_ingot",3],["stick",1],["hide",1]],repair:[["iron_ingot",1]],durability:460,
      detail:"Lâmina de uma mão com 3,9 blocos de alcance e 20 de dano."},
    greatsword:{family:"sword",name:"Espada de duas mãos",damage:29,reach:4.35,cooldown:.89,color:"#7291a0",trim:"#d7e9eb",style:"greatsword",
      twoHanded:true,targets:3,arc:.42,knockback:6.8,
      ingredients:[["steel_ingot",4],["hide",1],["bronze_ingot",1]],repair:[["steel_ingot",2]],durability:690,
      detail:"Golpe largo de 29 de dano que pode atingir até três alvos. Ocupa as duas mãos."},
    scimitar:{family:"sword",name:"Cimitarra",damage:16,reach:3.40,cooldown:.34,color:"#c5a377",trim:"#ffe6ae",style:"scimitar",
      targets:2,arc:.40,knockback:3.2,
      ingredients:[["iron_ingot",2],["bronze_ingot",1],["hide",1]],repair:[["iron_ingot",1]],durability:390,
      detail:"O corte curvo acerta até dois alvos à frente e causa 16 de dano."},
    mace:{family:"mace",name:"Maça de guerra",damage:23,reach:3.08,cooldown:.68,color:"#7e8797",trim:"#d7b889",style:"mace",
      slow:1.45,knockback:7.0,
      ingredients:[["iron_ingot",3],["bronze_ingot",1],["stick",1]],repair:[["iron_ingot",1]],durability:520,
      detail:"Cabeça flangeada de 23 de dano. O impacto empurra e desacelera o alvo."},
    wand:{family:"staff",name:"Varinha de centelha",damage:5,speed:31,cooldown:.24,mana:5,color:"#db8a6a",trim:"#f4e4ab",style:"wand",
      special:"Centelha dupla",altMana:13,altDelay:.86,
      ingredients:[["stick",1],["copper_ingot",1],["crystal_shard",1]],repair:[["copper_ingot",1]],durability:310,
      detail:"Centelhas velozes por 5 de mana. O botão direito dispara duas centelhas por 13 de mana."},
    bow:{family:"bow",name:"Arco comum",damage:13,speed:26,cooldown:.54,color:"#b4814c"},
    wind_staff:{family:"staff",name:"Cajado do Vento",damage:8,speed:17,cooldown:.42,mana:12,color:"#63dce7",special:"Ciclone expansivo",altMana:28,altDelay:1.45},
    bronze_sword:{family:"sword",name:"Espada de bronze",damage:13,reach:3.15,cooldown:.29,color:"#de9a58",trim:"#fdcf87",style:"bronze",
      ingredients:[["bronze_ingot",2],["stick",1]],repair:[["bronze_ingot",1]],durability:375,detail:"Golpes rápidos. 13 de dano."},
    obsidian_sword:{family:"sword",name:"Espada de obsidiana",damage:22,reach:3.45,cooldown:.62,color:"#77518f",trim:"#d0a7e3",style:"obsidian",
      ingredients:[["OBSIDIAN",2],["iron_ingot",1],["stick",1]],repair:[["OBSIDIAN",1]],durability:315,detail:"Lâmina pesada de maior alcance. 22 de dano."},
    bamboo_bow:{family:"bow",name:"Arco recurvo de bambu",damage:10,speed:25,cooldown:.37,color:"#b1b567",trim:"#e4d391",style:"bamboo",
      ingredients:[["BAMBOO",3],["wool",2]],repair:[["BAMBOO",1],["wool",1]],durability:295,detail:"Disparos rápidos. 10 de dano por flecha."},
    steel_bow:{family:"bow",name:"Arco de aço tensionado",damage:20,speed:35,cooldown:.82,color:"#73b3c6",trim:"#d3e9e7",style:"steel",
      ingredients:[["steel_ingot",2],["wool",2],["stick",1]],repair:[["steel_ingot",1],["wool",1]],durability:580,detail:"Flechas mais velozes e potentes. 20 de dano."},
    crossbow:{family:"crossbow",name:"Balestra",damage:26,speed:42,cooldown:.32,reload:1.06,ammo:"bolt",
      color:"#b58967",trim:"#c3d6dd",style:"crossbow",
      ingredients:[["PLANK",2],["iron_ingot",2],["wool",2],["stick",1]],repair:[["iron_ingot",1],["wool",1]],
      durability:490,detail:"Balestra com coronha reforçada, estribo e mira. Clique para armar e novamente para disparar um virote de 26 de dano."},
    frost_staff:{family:"staff",name:"Cajado de Geada",damage:9,speed:15,cooldown:.68,mana:14,color:"#78c9fe",trim:"#bbecff",style:"frost",
      special:"Pulso de geada",altMana:26,altDelay:1.52,slow:3.1,
      ingredients:[["stick",2],["SAPPHIRE_ORE",1],["ICE",1]],repair:[["stick",1],["SAPPHIRE_ORE",1]],durability:480,detail:"Orbe e pulso que desaceleram criaturas."},
    prism_staff:{family:"staff",name:"Cajado Prismático",damage:15,speed:23,cooldown:.84,mana:19,color:"#ce86f1",trim:"#8df0d8",style:"prism",
      special:"Rajada prismática",altMana:33,altDelay:1.84,
      ingredients:[["stick",2],["OPAL_ORE",1],["FLUORITE",1]],repair:[["OPAL_ORE",1],["stick",1]],durability:560,detail:"Orbe forte e rajada em leque de três orbes."}
  };
  const shields=Object.freeze({
    shield_oval:{name:"Escudo oval",shape:"oval",color:"#a3744a",trim:"#d3a55a",armor:.08,blockChance:.31,reduction:.53,
      protections:{physical:.13},durability:360,ingredients:[["PLANK",3],["bronze_ingot",2],["hide",1]],
      repair:[["plank",2],["bronze_ingot",1]],detail:"Escudo leve com ampla chance de aparar golpes."},
    shield_tower:{name:"Escudo retangular",shape:"tower",color:"#4b6574",trim:"#aebdc5",armor:.17,blockChance:.26,reduction:.31,
      protections:{physical:.22},durability:580,ingredients:[["PLANK",3],["iron_ingot",3],["hide",1]],
      repair:[["iron_ingot",2],["plank",1]],detail:"Placa reforçada para absorver impactos pesados."},
    shield_dragon:{name:"Escudo antidragão",shape:"dragon",color:"#4c364f",trim:"#dbb66d",
      armor:.11,blockChance:.23,reduction:.43,dragonGuard:.61,protections:{physical:.14},
      durability:640,ingredients:[["OBSIDIAN",2],["armor_plate",2],["bronze_ingot",2],["hide",1]],
      repair:[["OBSIDIAN",1],["bronze_ingot",1]],detail:"Reduz em 61% o dano das baforadas e protege contra efeitos de gelo e tempo."}
  });
  const focuses=Object.freeze({
    grimoire:{name:"Grimório dos Selos",shape:"book",color:"#5f526d",trim:"#e8c894",
      special:"Círculo de selos",mana:17,cooldown:2.35,damage:8,reach:5.4,slow:1.9,
      ingredients:[["lab_note",1],["hide",1],["bronze_ingot",1]],repair:[["hide",1]],
      durability:305,detail:"Mão secundária. X conjura um círculo que empurra e desacelera criaturas próximas por 17 de mana."},
    resonant_orb:{name:"Orbe ressonante",shape:"orb",color:"#54af9a",trim:"#b9f9d8",
      special:"Pulso ressonante",mana:12,cooldown:1.42,damage:11,speed:25,slow:.75,
      ingredients:[["crystal_shard",2],["wind_essence",1],["copper_ingot",1]],repair:[["crystal_shard",1]],
      durability:420,detail:"Mão secundária. X dispara um pulso de 11 de dano por 12 de mana."}
  });
  const entries=Object.entries(weapons),variants=entries.filter(([,w])=>w.style);
  const blockId=(id,B)=>Object.hasOwn(B,id)?B[id]:id;
  function recipes(B){
    return variants.map(([id,w])=>recipe(B,id,w));
  }
  const recipe=(B,id,item)=>({name:item.name,need:item.ingredients.map(([k,n])=>[blockId(k,B),n]),out:[id,1]});
  function shieldRecipes(B){
    return Object.entries(shields).map(([id,w])=>recipe(B,id,w));
  }
  const focusRecipes=B=>Object.entries(focuses).map(([id,item])=>recipe(B,id,item));
  function equipment(){
    const abbr={sword:"LÂMINA",bow:"ARCO",crossbow:"BALESTRA",staff:"CAJADO",mace:"MAÇA"};
    const tools=Object.fromEntries(variants.map(([id,w])=>[id,{
      slot:"tool",abbr:w.style==="wand"?"VARINHA":abbr[w.family],maxDurability:w.durability,protections:{},effect:w.detail,repair:w.repair
    }]));
    const guard=Object.fromEntries(Object.entries(shields).map(([id,s])=>[id,{
      slot:"offhand",abbr:"ESCUDO",armor:s.armor,blockChance:s.blockChance,blockReduction:s.reduction,dragonGuard:s.dragonGuard,
      protections:s.protections,maxDurability:s.durability,effect:s.detail,repair:s.repair
    }]));
    const held=Object.fromEntries(Object.entries(focuses).map(([id,item])=>[id,{
      slot:"offhand",abbr:item.shape==="book"?"LIVRO":"ORBE",maxDurability:item.durability,
      protections:{},effect:item.detail,repair:item.repair
    }]));
    return {...tools,...guard,...held};
  }
  return {weapons:Object.freeze(weapons),shields,focuses,recipes,shieldRecipes,focusRecipes,equipment};
})();

