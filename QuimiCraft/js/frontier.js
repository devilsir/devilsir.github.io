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

  const fruits=[
    {key:"STRAWBERRY",food:"strawberry",seed:"strawberry_runner",name:"Morango",plant:"Morangueiro",stock:"Muda de morangueiro",
      color:"#e94354",seconds:19,hunger:9,thirst:5,biomes:["planície florida","prado alpino","bosque de cerejeiras"],
      guide:"Plante uma muda enraizada de um estolão e deixe a coroa acima do solo. Os morangos se desenvolvem junto às folhas, perto do chão."},
    {key:"DRAGON_FRUIT",food:"dragon_fruit",seed:"dragon_fruit_cutting",name:"Pitaya",plant:"Pitaieira",stock:"Estaca de pitaya",
      color:"#df4391",seconds:32,hunger:14,thirst:7,support:true,biomes:["savana","chapadas ocres"],
      guide:"Plante uma estaca de cladódio, um segmento do caule do cacto, junto a um tutor. As flores e os frutos saem dos cladódios."},
    {key:"BLACKBERRY",food:"blackberry",seed:"blackberry_cutting",name:"Amora",plant:"Amoreira-preta",stock:"Muda de amoreira-preta",
      color:"#7a428e",seconds:23,hunger:9,thirst:4,biomes:["floresta","floresta de sequoias","bosque lilás"],
      guide:"Plante uma muda enraizada de amoreira-preta. As amoras aparecem nos ramos do arbusto e escurecem ao amadurecer."},
    {key:"JABUTICABA",food:"jabuticaba",seed:"jabuticaba_sapling",name:"Jabuticaba",plant:"Jabuticabeira",stock:"Muda de jabuticabeira",
      color:"#584076",seconds:43,hunger:11,thirst:6,biomes:["floresta","selva tropical"],
      guide:"Plante uma muda com raízes. As flores e as jabuticabas aparecem diretamente no tronco e nos ramos grossos, fenômeno chamado caulifloria."},
    {key:"ACEROLA",food:"acerola",seed:"acerola_sapling",name:"Acerola",plant:"Aceroleira",stock:"Muda de aceroleira",
      color:"#ef6551",seconds:29,hunger:8,thirst:5,biomes:["selva tropical","savana"],
      guide:"Plante uma muda enraizada em solo drenado. As flores rosadas crescem nos ramos e dão frutos vermelhos com três lobos."},
    {key:"LIME",food:"lime",seed:"lime_sapling",name:"Limão",plant:"Limoeiro",stock:"Muda de limoeiro",
      color:"#9cbd43",seconds:35,hunger:6,thirst:6,biomes:["selva tropical","planície"],
      guide:"Plante uma muda de limoeiro em local iluminado. Limoeiros são frequentemente propagados por enxertia. Os limões crescem nos ramos da copa."},
    {key:"POMEGRANATE",food:"pomegranate",seed:"pomegranate_cutting",name:"Romã",plant:"Romãzeira",stock:"Muda de romãzeira",
      color:"#c93d58",seconds:37,hunger:15,thirst:4,biomes:["savana","chapadas ocres"],
      guide:"Plante uma muda de romãzeira em local ensolarado. A romã cresce nos ramos e mantém o cálice da flor na forma de uma coroa."},
    {key:"GRAPES",food:"grapes",seed:"grape_cutting",name:"Uva",plant:"Videira",stock:"Muda de videira",
      color:"#8556b4",seconds:30,hunger:12,thirst:7,support:true,biomes:["planície florida","bosque lilás","bosque de cerejeiras"],
      guide:"Plante uma muda de videira e conduza seus ramos em um suporte. As uvas amadurecem em cachos que pendem dos ramos."},
    {key:"STARFRUIT",food:"starfruit",seed:"starfruit_sapling",name:"Carambola",plant:"Caramboleira",stock:"Muda de caramboleira",
      color:"#edb839",seconds:39,hunger:11,thirst:8,biomes:["selva tropical","planície"],
      guide:"Plante uma muda de caramboleira, que pode ser produzida por enxertia. Os frutos se formam nos ramos e têm cinco saliências que desenham uma estrela no corte."}
  ];
  const fruitPhases=["SPROUT","GROWING","RIPE"];
  const fruitYields={
    STRAWBERRY:[5,3],DRAGON_FRUIT:[4,3],BLACKBERRY:[6,4],JABUTICABA:[6,4],ACEROLA:[6,4],
    LIME:[4,3],POMEGRANATE:[4,3],GRAPES:[5,3],STARFRUIT:[4,3]
  };
  const rootCrops=[
    {key:"BEET",name:"Beterraba",seed:"beet_seed",food:"beet",color:"#ae4260",seconds:29,wildFood:true,
      guide:"Plante uma muda em terra arada. As folhas têm pecíolos avermelhados e a beterraba cresce sob o solo."},
    {key:"POTATO",name:"Batata",seed:"potato_seed",food:"potato",color:"#c69858",seconds:35,wildFood:true,
      guide:"Plante uma batata brotada. Os tubérculos crescem juntos debaixo das folhas e podem ser assados no fogão."}
  ];
  const fruitFoods=Object.fromEntries(fruits.map(({food,hunger,thirst})=>[food,{hunger,thirst}]));
  const fruitItems=Object.fromEntries(fruits.flatMap(({food,seed,name,stock,color})=>[[food,[name,color]],[seed,[stock,"#719a56"]]]));

  const items = Object.freeze({
    ...fruitItems,
    copper_pickaxe:["Picareta de cobre","#c88b67"], hoe:["Enxada de cultivo","#91a497"],
    fishing_rod:["Vara de pesca","#a98151"], bait:["Isca de grãos","#c4a06e"],
    wheat_seed:["Semente de trigo","#b99557"], carrot_seed:["Semente de cenoura","#8eaa59"], bean_seed:["Semente de feijão","#9a7959"],
    wheat:["Trigo","#d1af67"], carrot:["Cenoura","#e98d49"], beans:["Feijão","#ac805d"],
    beet_seed:["Muda de beterraba","#8b7359"],beet:["Beterraba","#a83e5b"],
    potato_seed:["Muda de batata","#a78d54"],potato:["Batata","#bf995e"],baked_potato:["Batata assada","#c17c40"],
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
    for(const [index,{key,plant,color}] of fruits.entries()){
      const phases=[...fruitPhases.map(phase=>key+"_"+phase),"WILD_"+key];
      const names=["Muda plantada de "+plant.toLowerCase(),plant+" em floração",plant+" com frutos",plant+" silvestre"];
      phases.forEach((phase,i)=>{
        const id=256+index*4+i;
        B[phase]=id;
        defs[id]={name:names[i],icon:i<2?"#719a56":color,hard:.12,tex:222,solid:false,plant:true};
      });
    }
    for(const [index,{key,name,color}] of rootCrops.entries()){
      const phases=[...fruitPhases.map(phase=>key+"_"+phase),"WILD_"+key];
      const names=["Muda plantada de "+name.toLowerCase(),name+" em crescimento",name+" pronta para colher",name+" silvestre"];
      phases.forEach((phase,i)=>{
        // Continue após os 36 blocos das nove frutíferas existentes.
        const id=292+index*4+i;
        B[phase]=id;
        defs[id]={name:names[i],icon:i<2?"#719a56":color,hard:.12,tex:222,solid:false,plant:true};
      });
    }
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
      {seed:"wheat_seed",food:"wheat",wild:B.WILD_WHEAT,stages:[B.WHEAT_SPROUT,B.WHEAT_GROWING,B.WHEAT_RIPE],seconds:26,
        guide:"Semeie os grãos. A planta cresce em hastes e os novos grãos amadurecem nas espigas."},
      {seed:"carrot_seed",food:"carrot",wild:B.WILD_CARROT,stages:[B.CARROT_SPROUT,B.CARROT_GROWING,B.CARROT_RIPE],seconds:30,
        guide:"Semeie direto no solo. As folhas ficam à vista, e a raiz que você colhe engrossa debaixo da terra."},
      {seed:"bean_seed",food:"beans",wild:B.WILD_BEAN,stages:[B.BEAN_SPROUT,B.BEAN_GROWING,B.BEAN_RIPE],seconds:34,
        guide:"Semeie um feijão. Após a floração, as vagens crescem nos ramos e guardam os grãos."},
      ...rootCrops.map(crop=>({...crop,wild:B["WILD_"+crop.key],stages:fruitPhases.map(phase=>B[crop.key+"_"+phase])})),
      ...fruits.map(fruit=>({...fruit,regrows:true,yield:fruitYields[fruit.key],
        wild:B["WILD_"+fruit.key],stages:fruitPhases.map(phase=>B[fruit.key+"_"+phase])}))
    ];
  }

  function plantingInstructions(crop){
    return "Use a enxada na terra. Selecione "+items[crop.seed][0].toLowerCase()+" e interaja com o canteiro."+
      (crop.support?" Tenha 1 cerca de madeira na mochila para montar o tutor.":"");
  }

  function cropStage(crop,id){
    if(id===crop.wild)return crop.regrows?"Frutos silvestres prontos para colher":"Cultivo silvestre";
    return (crop.regrows?["Muda","Floração","Frutos maduros"]:["Broto","Em crescimento","Pronto para colher"])[crop.stages.indexOf(id)];
  }

  function wildFruitPicker(B,hash,seed){
    const soils=new Set([B.GRASS,B.DIRT,B.MOSS,B.MEADOW_SOIL,B.FOREST_LOAM,B.PODZOL,B.LATERITE,B.LOESS,
      B.RED_EARTH,B.BLACK_EARTH,B.BROWN_EARTH,B.RED_SAND].filter(Number.isInteger));
    const byBiome=new Map();
    for(const {key,biomes} of fruits)for(const biome of biomes){
      if(!byBiome.has(biome))byBiome.set(biome,[]);
      byBiome.get(biome).push(B["WILD_"+key]);
    }
    const salt=seed%997;
    return (biome,top,x,z,density)=>{
      const options=byBiome.get(biome);
      if(!options||!soils.has(top)||hash(x,z,1501+salt)<(density===1?.981:.960))return 0;
      return options[Math.floor(hash(x,z,1502+salt)*options.length)];
    };
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
        ...crops(B).filter(crop=>!crop.regrows).map(({food,seed})=>({name:"Separar sementes",need:[[food,1]],out:[[seed,3]]})),
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
    return Number.isInteger(id)?defs.find(crop=>crop.wild===id||crop.stages.includes(id)):undefined;
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

  return {register,paint,items,fruitFoods,crops,plantingInstructions,cropStage,wildFruitPicker,recipes,stations,growClock,fishFor,cropAt,villageFor,safeInterior,roofScan,rainSpan};
})();
