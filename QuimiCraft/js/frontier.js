"use strict";

globalThis.QuimiCraftFrontier = (() => {
  const blocks = [
    ["FARMLAND","Terra arada","#855438",.46],["WET_FARMLAND","Terra irrigada","#5f4939",.46],
    ["WHEAT_SPROUT","Broto de trigo","#80a94c",.12,1],["WHEAT_GROWING","Trigo em crescimento","#b3a553",.12,1],
    ["WHEAT_RIPE","Trigo maduro","#d8ac57",.12,1],["CARROT_SPROUT","Broto de cenoura","#6b9c4b",.12,1],
    ["CARROT_GROWING","Cenoura em crescimento","#84a047",.12,1],["CARROT_RIPE","Cenoura madura","#db873f",.12,1],
    ["BEAN_SPROUT","Broto de feijão","#589450",.12,1],["BEAN_GROWING","Feijão em crescimento","#619753",.12,1],
    ["BEAN_RIPE","Feijão maduro","#9c704a",.12,1],["ASSAY_BENCH","Bancada de mineração","#728793",1.8,0,1],
    ["SEED_BENCH","Mesa de cultivo","#759858",1.1,0,1],["FISH_RACK","Estação de pesca","#719daa",1.05,0,1],
    ["SILVER_ORE","Minério de prata","#9cb4c5",2.45],["AQUAMARINE_ORE","Geodo de água-marinha","#60bcb6",3.05],
    ["OCHRE_STONE","Arenito ocre","#bc784d",1.38],["REDWOOD_LOG","Tronco de sequoia","#995b44",1.45],
    ["REDWOOD_LEAF","Copa de sequoia","#496d48",.38,0,0,1],["MANGROVE_LOG","Tronco de mangue","#74553f",1.32],
    ["MANGROVE_LEAF","Folhas de mangue","#4d815b",.38,0,0,1],["FERN","Samambaia","#4d8f5e",.12,1],
    ["REED","Junco","#879e53",.12,1],["ORCHID","Orquídea silvestre","#be73ae",.12,1],
    ["BLUE_MUSHROOM","Cogumelo índigo","#6462a3",.12,1],["WILD_WHEAT","Trigo silvestre","#bfaa58",.12,1],
    ["WILD_CARROT","Cenoura silvestre","#a6834d",.12,1],["WILD_BEAN","Feijão silvestre","#768b56",.12,1],
    ["BASALT_GLASS","Vidro basáltico","#526073",2.15],["LICHEN","Líquen dourado","#b2a268",.12,1],
    ["REDWOOD_END","Topo de sequoia","#b27958",1.45],["MANGROVE_END","Topo de mangue","#a37b59",1.32]
  ];

  const items = Object.freeze({
    copper_pickaxe:["Picareta de cobre","#c88b67"], hoe:["Enxada de cultivo","#91a497"],
    fishing_rod:["Vara de pesca","#a98151"], bait:["Isca de grãos","#c4a06e"],
    wheat_seed:["Semente de trigo","#b99557"], carrot_seed:["Semente de cenoura","#8eaa59"], bean_seed:["Semente de feijão","#9a7959"],
    wheat:["Trigo","#d1af67"], carrot:["Cenoura","#e98d49"], beans:["Feijão","#ac805d"],
    raw_trout:["Truta crua","#85a5a8"], raw_perch:["Perca crua","#a79f62"], raw_catfish:["Bagre cru","#767486"],
    cooked_trout:["Truta assada","#be8b61"], cooked_perch:["Perca assada","#bb9558"], cooked_catfish:["Bagre assado","#a58672"],
    aquamarine:["Água-marinha lapidada","#8ed2c7"], mineral_mix:["Composto de cultivo","#887351"]
  });

  function register(B, defs) {
    blocks.forEach(([key,name,color,hard,plant,station,alpha],index)=>{
      const id=63+index;
      B[key]=id;
      defs[id]={name,icon:color,hard,tex:id+1,solid:!plant,plant:!!plant,alpha:!!alpha,station:!!station};
    });
    defs[B.REDWOOD_LOG].tex=[B.REDWOOD_END+1,B.REDWOOD_LOG+1,B.REDWOOD_END+1];
    defs[B.MANGROVE_LOG].tex=[B.MANGROVE_END+1,B.MANGROVE_LOG+1,B.MANGROVE_END+1];
  }

  const color = hex => [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const palettes=blocks.map(row=>color(row[2]));
  function paint(tile,x,y,hash) {
    const row=blocks[tile-64];
    if(!row)return [91,103,105,255];
    const [id,,,,plant,station,alpha]=row;
    let value=palettes[tile-64];
    let light=(hash(x,y,tile)-.5)*(station?19:34);
    let opacity=255;
    if(plant){
      const maturity=id.includes("SPROUT")?.37:id.includes("GROWING")?.69:1;
      const realY=(32-y)/maturity;
      const stalk=realY<25&&realY>0&&Math.abs(x-16-Math.sin(realY*.19)*2.4)<1.5;
      const leaves=realY>3&&realY<21&&[7,13,18].some((line,index)=>{
        const sign=index%2===0?1:-1;
        const reach=(x-16)*sign;
        return reach>0&&reach<11&&Math.abs(realY-line-reach*.42)<1.6;
      });
      const fruit=(id.includes("RIPE")||id.includes("WILD")||id==="ORCHID")&&maturity===1&&
        Math.hypot((x-15.8)*.78,y-7.1)<4.9;
      const cap=id==="BLUE_MUSHROOM"&&Math.hypot((x-16)*.48,y-13)<5.2;
      opacity=stalk||leaves||fruit||cap?255:0;
      if(!fruit&&!cap)value=[66,115,62];
      if(id==="LICHEN"){opacity=y>23&&hash(Math.floor(x/2),Math.floor(y/2),tile)>.31?255:0;value=[177,153,90]}
    }else if(station){
      if(y<6||x<3||x>28||y>28)light-=31;
      if(y===7||y===25)light+=34;
      if(x>9&&x<23&&y>10&&y<22){value=[27,45,49];light+=hash(x>>2,y>>2,tile)*27}
      if(x>14&&x<19&&y>12&&y<18){value=palettes[tile-64];light+=48}
    }else if(id.endsWith("_ORE")){
      const grain=hash(x>>2,y>>2,tile);
      if(grain<.72)value=[56,64,74];
      else light+=grain>.94?52:13;
    }else if(id.includes("FARMLAND")){
      light+=Math.sin(x*.84)*24+(y>27?-11:0);
    }else if(id.endsWith("_END")){
      light+=Math.sin(Math.hypot(x-16,y-16)*.72)*24;
    }else if(id.endsWith("_LOG")){
      light+=Math.sin(x*.49+Math.sin(y*.15))*18;
    }else if(alpha&&hash(x,y,tile)>.82)opacity=0;
    return [...value.map(c=>c+light),opacity];
  }

  function crops(B) {
    return [
      {seed:"wheat_seed",food:"wheat",wild:B.WILD_WHEAT,stages:[B.WHEAT_SPROUT,B.WHEAT_GROWING,B.WHEAT_RIPE],seconds:26},
      {seed:"carrot_seed",food:"carrot",wild:B.WILD_CARROT,stages:[B.CARROT_SPROUT,B.CARROT_GROWING,B.CARROT_RIPE],seconds:30},
      {seed:"bean_seed",food:"beans",wild:B.WILD_BEAN,stages:[B.BEAN_SPROUT,B.BEAN_GROWING,B.BEAN_RIPE],seconds:34}
    ];
  }

  function recipes(B) {
    return [
      {name:"Tábuas de sequoia",desc:"1 tronco de sequoia",need:[[B.REDWOOD_LOG,1]],out:[B.PLANK,4]},
      {name:"Tábuas de mangue",desc:"1 tronco de mangue",need:[[B.MANGROVE_LOG,1]],out:[B.PLANK,4]},
      {name:"Picareta de cobre",desc:"3 cobres e 2 bastões",need:[[B.COPPER,3],["stick",2]],out:["copper_pickaxe",1]},
      {name:"Enxada de cultivo",desc:"2 pedras e 2 bastões",need:[[B.STONE,2],["stick",2]],out:["hoe",1]},
      {name:"Vara de pesca",desc:"3 bastões, 1 lã e 1 cobre",need:[["stick",3],["wool",1],[B.COPPER,1]],out:["fishing_rod",1]},
      {name:"Bancada de mineração",desc:"4 pedras e 2 tábuas",need:[[B.STONE,4],[B.PLANK,2]],out:[B.ASSAY_BENCH,1]},
      {name:"Mesa de cultivo",desc:"4 tábuas e 2 terras",need:[[B.PLANK,4],[B.DIRT,2]],out:[B.SEED_BENCH,1]},
      {name:"Estação de pesca",desc:"3 tábuas, 2 bastões e 1 cobre",need:[[B.PLANK,3],["stick",2],[B.COPPER,1]],out:[B.FISH_RACK,1]}
    ];
  }

  function stations(B) {
    return new Map([
      [B.ASSAY_BENCH,[
        {name:"Separar prata",need:[[B.SILVER_ORE,1]],out:[["silver_dust",2]]},
        {name:"Lapidar água-marinha",need:[[B.AQUAMARINE_ORE,1],[B.STONE,1]],out:[["aquamarine",1]]},
        {name:"Preparar cobre refinado",need:[[B.COPPER,2],[B.COAL,1]],out:[["copper_ingot",2]]}
      ]],
      [B.SEED_BENCH,[
        ...crops(B).map(({food,seed})=>({name:"Separar sementes",need:[[food,1]],out:[[seed,3]]})),
        {name:"Misturar composto",need:[[B.LEAVES,2],[B.DIRT,1]],out:[["mineral_mix",2]]},
        {name:"Preparar pão",need:[["wheat",3],[B.COAL,1]],out:[["bread",2]]}
      ]],
      [B.FISH_RACK,[
        {name:"Preparar iscas",need:[["wheat",1]],out:[["bait",4]]},
        {name:"Preparar iscas de emergência",need:[[B.TALL_GRASS,2]],out:[["bait",2]]},
        ...["trout","perch","catfish"].map(type=>({name:"Assar peixe",need:[["raw_"+type,1],[B.COAL,1]],out:[["cooked_"+type,1]]})),
        {name:"Assar peixe comum",need:[["raw_fish",1],[B.COAL,1]],out:[["cooked_fish",1]]}
      ]]
    ]);
  }

  function growClock(elapsed, {wet, sun, winter, fed}) {
    if(!sun)return 0;
    return elapsed*(wet?1:.38)*(winter?.41:1)*(fed?1.7:1);
  }

  function fishFor(biome,depth,random=Math.random) {
    const cold=/tundra|taiga|prado|geleira|fiordes/.test(biome);
    const warm=/manguezal|pântano|tropical/.test(biome);
    const roll=random();
    if(cold&&roll<.73)return "raw_trout";
    if(warm&&(depth>=2||roll<.42))return "raw_catfish";
    return roll<.75?"raw_perch":"raw_fish";
  }

  function cropAt(defs,id) {
    return defs.find(crop=>crop.wild===id||crop.stages.includes(id));
  }

  function villageFor(storage) {
    let version=Number(storage.qc_landscape);
    if(![1,2,3].includes(version))version=(storage.qc_village_v44||storage.qc_world_state_v70||storage.qc_world_state_v60)?1:3;
    return {version,x:version===1?48:176,z:version===1?-22:-70,base:18,spacing:10,half:3};
  }

  function safeInterior(layout,x,y,z) {
    return y>=layout.y-.04&&y<layout.y+layout.height&&
      x>layout.cx-layout.halfW&&x<layout.cx+layout.halfW+1&&
      z>layout.cz-layout.halfD+.38&&z<layout.cz+layout.halfD+1;
  }

  function roofScan(x,z,maxY,highest,getBlock,qualifies) {
    for(let y=Math.min(highest,maxY-1);y>=0;y--){
      if(qualifies(getBlock(x,y,z)))return y+1;
    }
    return 0;
  }

  function rainSpan(y,length,surface) {
    if(y<=surface+.015)return null;
    return Math.max(surface+.016,y-length);
  }

  return {register,paint,items,crops,recipes,stations,growClock,fishFor,cropAt,villageFor,safeInterior,roofScan,rainSpan};
})();
