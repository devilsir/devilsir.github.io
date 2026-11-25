
"use strict";

globalThis.QuimiCraftRegions=(()=>{
  const blocks=[
    ["FIELDSTONE","Pedra aparelhada","#b4aa92","masonry"],["COBBLE_PATH","Seixos de caminho","#a09276","pavers"],
    ["CLAY_PLASTER","Reboco de argila","#d59b72","plaster"],["LIME_PLASTER","Reboco de cal","#e1d7bc","plaster"],
    ["OCHRE_PLASTER","Reboco ocre","#e1b159","plaster"],["TEAL_PLASTER","Reboco verde-petróleo","#73a69a","plaster"],
    ["WINE_PLASTER","Reboco vinho","#a26571","plaster"],
    ["ROOF_RED","Telhas de barro","#a95846","shingles"],["ROOF_BLUE","Telhas de ardósia","#637a91","shingles"],
    ["ROOF_MOSS","Telhas verdes","#738351","shingles"],["THATCH","Cobertura de palha","#b09758","straw"],
    ["WOVEN_AWNING","Toldo tecido","#d69373","cloth"],["WINDOW_LEADED","Janela com caixilho","#b6e0ed","window"],
    ["FENCE_WOOD","Cerca de madeira","#9c714e","fence"],["GARDEN_BOX","Floreira de madeira","#805d45","box"],
    ["VILLAGE_LANTERN","Lampião de vila","#d4a854","lantern"],
    ["BIRCH_LOG","Tronco de bétula","#d7c6a8","wood"],["BIRCH_LEAF","Folhas de bétula","#a3b658","leaves"],
    ["ACACIA_LOG","Tronco de acácia","#b17a51","wood"],["ACACIA_LEAF","Folhas de acácia","#82934a","leaves"],
    ["JACARANDA_LOG","Tronco de jacarandá","#715267","wood"],["JACARANDA_LEAF","Florada de jacarandá","#9e74b6","leaves"],
    ["LAVENDER","Lavanda","#ab88c2","plant"],["SALT_REED","Juncália salina","#94b677","plant"],
    ["WATER_LILY","Ninféia","#d998b7","lily"],["BERRY_BUSH","Arbusto de bagas","#dd537f","plant"],
    ["MALACHITE","Malaquita","#539975","vein"],["PYRITE","Pirita","#c1a356","vein"],
    ["BAUXITE","Bauxita","#b57962","vein"],["SILICA_SAND","Areia de sílica","#e3d5af","sand"],
    ["KITCHEN_STOVE","Fogão de pedra","#966653","station"],["GLASS_KILN","Forno de vidro","#8b8b96","station"],
    ["METAL_FORGE","Forja de ligas","#626c7b","station"],["GLASS_AMBER","Vidro âmbar","#d59d58","glass"],
    ["GLASS_COBALT","Vidro cobalto","#658cc0","glass"],["STEEL_BLOCK","Bloco de aço","#959eaa","metal"],
    ["BRASS_BLOCK","Bloco de latão","#bd9d56","metal"],["BIRCH_END","Topo de bétula","#baa381","rings"],
    ["ACACIA_END","Topo de acácia","#b78564","rings"],["JACARANDA_END","Topo de jacarandá","#a37a78","rings"],["COBALT_ORE","Minério de cobalto","#6a81b2","vein"],
    ["MEADOW_SOIL","Solo de campina","#819359","turf"],["FOREST_LOAM","Húmus florestal","#65573f","soil"],
    ["PODZOL","Podzol","#80654e","soil"],["LATERITE","Laterita","#a8603f","soil"],
    ["PEAT_MAT","Turfa encharcada","#645841","soil"],["LOESS","Loess","#c3a578","sediment"],
    ["SHELL_SAND","Areia de conchas","#e1d2b2","sediment"],["SALT_CRUST","Crosta salina","#d8d7be","sediment"],
    ["GLACIAL_MORAINE","Cascalho glacial","#a69ca0","gravel"],["FROST_CRUST","Solo com geada","#adbcc5","gravel"],
    ["CHALK","Giz calcário","#dfd6bb","sediment"],["TRAVERTINE","Travertino","#c9b18d","sediment"],
    ["SCORIA","Escória vulcânica","#736061","vesicles"],["PUMICE","Pedra-pomes","#b2a6a1","vesicles"],
    ["TUFF","Tufo vulcânico","#9a827b","gravel"],["QUARTZITE","Quartzito","#b7aab7","sediment"],
    ["AMBER_SHALE","Xisto âmbar","#a68455","sediment"],["HORNBLENDE_ROCK","Rocha de anfibólio","#6b8880","gravel"],
    ["HEMATITE","Hematita","#a36559","vein"],["CASSITERITE","Cassiterita","#945e47","vein"],
    ["SPHALERITE","Esfalerita","#bc9e6a","vein"],["NICKEL_ORE","Minério de níquel","#89a08f","vein"],
    ["RUTILE","Rutilo","#95666e","vein"],["DOLOMITE","Dolomita","#c3b8a4","vein"],["FLUORITE","Fluorita","#8ea9c6","vein"],
    ["NICKEL_BLOCK","Bloco de níquel","#a7b7ac","metal"],["PEWTER_BLOCK","Bloco de liga de estanho","#b2b0bc","metal"],
    ["CUPRONICKEL_BLOCK","Bloco de cuproníquel","#c0a597","metal"],
    ["MINT_PATCH","Hortelã silvestre","#80be8b","plant"],["ALPINE_BUSH","Frutos da serra","#aa6b91","plant"],
    ["RICE_REED","Arroz de várzea silvestre","#c6b972","plant"],["PRICKLY_PEAR","Palma frutífera","#da7c74","plant"],
    ["CACAO_BRANCH","Ramo de cacaueiro","#b38043","plant"],["CHERRY_BRANCH","Ramo de cerejeira com frutos","#c9516a","plant"],
    ["PINE_CONE","Pinha com pinhões","#ad8158","plant"],["SALTWORT","Salicórnia","#95b970","plant"],["FOREST_MUSHROOM","Cogumelo do bosque","#d19d71","plant"],
    ["COBALT_BLOCK","Bloco de cobalto","#8f9fb4","metal"]
  ];
  const skins={
    field:{tint:0x9c825b,trim:0xe5bd7c,wall:["LIME_PLASTER","CLAY_PLASTER","OCHRE_PLASTER"],roof:["ROOF_RED","THATCH","ROOF_MOSS"],wood:"PLANK"},
    forest:{tint:0x647b53,trim:0xe2c481,wall:["LIME_PLASTER","TEAL_PLASTER","CLAY_PLASTER"],roof:["THATCH","ROOF_MOSS","ROOF_RED"],wood:"BIRCH_LOG"},
    coast:{tint:0x498b87,trim:0xf8c691,wall:["TEAL_PLASTER","LIME_PLASTER","OCHRE_PLASTER"],roof:["ROOF_MOSS","ROOF_RED","THATCH"],wood:"MANGROVE_LOG"},
    dry:{tint:0xb38349,trim:0xffd89f,wall:["OCHRE_PLASTER","CLAY_PLASTER","LIME_PLASTER"],roof:["THATCH","ROOF_RED","ROOF_BLUE"],wood:"ACACIA_LOG"},
    snow:{tint:0x57708a,trim:0xd8e7ec,wall:["LIME_PLASTER","TEAL_PLASTER","WINE_PLASTER"],roof:["ROOF_BLUE","ROOF_RED","ROOF_MOSS"],wood:"PINE_LOG"},
    volcanic:{tint:0x77627a,trim:0xe4ab8c,wall:["WINE_PLASTER","CLAY_PLASTER","OCHRE_PLASTER"],roof:["ROOF_BLUE","ROOF_RED","ROOF_MOSS"],wood:"JACARANDA_LOG"}
  };
  const waters={
    fresh:{label:"Água doce",rgb:[.24,.62,.76],chem:{}},
    salt:{label:"Água salobra",rgb:[.53,.70,.66],chem:{salt:true}},
    cold:{label:"Água glacial",rgb:[.47,.77,.97],chem:{cold:true}},
    tannin:{label:"Água rica em matéria orgânica",rgb:[.57,.42,.24],chem:{contaminated:true}},
    thermal:{label:"Água termal",rgb:[.37,.78,.69],chem:{hot:true}},
    mineral:{label:"Água alcalina",rgb:[.50,.65,.86],chem:{alkaline:true}},
    acid:{label:"Água ácida",rgb:[.60,.76,.38],chem:{acidic:true}}
  };
  const groups={
    snow:["fiordes glaciais","tundra","taiga","prado alpino","montanha"],
    coast:["manguezal","salinas","pântano"],
    dry:["deserto","badlands","chapadas ocres","cânion calcário","savana"],
    forest:["floresta","bosque de cerejeiras","floresta de sequoias","selva tropical","bosque lilás"],
    volcanic:["vulcânico","caldeira vítrea","bosque de cristais","termas minerais"]
  };
  const waterByBiome={
    manguezal:"salt",salinas:"salt","delta salobro":"salt","pântano":"tannin","selva tropical":"tannin","bosque de sequoias":"tannin",
    "floresta de sequoias":"tannin",tundra:"cold",taiga:"cold","fiordes glaciais":"cold","prado alpino":"cold",
    "termas minerais":"thermal","cânion calcário":"mineral","bosque de cristais":"mineral","caldeira vítrea":"acid",vulcânico:"acid"
  };
  const cultureByBiome=new Map(Object.entries(groups).flatMap(([group,list])=>list.map(biome=>[biome,group])));
  cultureByBiome.set("delta salobro","coast");
  for(const [id,water] of Object.entries(waters))water.id=id;
  const culture=biome=>cultureByBiome.get(biome)||"field";
  const water=biome=>waters[waterByBiome[biome]||"fresh"];
  function register(B,defs){
    blocks.forEach(([key,name,icon,pattern],i)=>{
      const id=95+i,plant=pattern==="plant"||pattern==="lily";
      B[key]=id;
      defs[id]={name,icon,tex:id+1,hard:pattern==="vein"?2.1:plant?.12:["soil","turf","sediment","gravel"].includes(pattern)?.78:1.18,solid:!plant,plant,
        alpha:["leaves","window","glass"].includes(pattern),station:pattern==="station",detail:["lantern","fence","box"].includes(pattern)?pattern:null};
    });
    for(const tree of ["BIRCH","ACACIA","JACARANDA"])defs[B[tree+"_LOG"]].tex=[B[tree+"_END"]+1,B[tree+"_LOG"]+1,B[tree+"_END"]+1];
  }
  const toRgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const colors=blocks.map(row=>toRgb(row[2]));
  function paint(tile,x,y,hash){
    const row=blocks[tile-96];
    if(!row)return [75,85,89,255];
    const [key,,,style]=row;
    let color=colors[tile-96],light=(hash(x,y,tile)-.5)*21,alpha=255;
    if(style==="masonry"||style==="pavers"){
      const seam=(y+1)%8<1||(x+Math.floor(y/8)*5+1)%12<1;
      light+=seam?-33:(hash(x>>1,y>>2,tile)-.5)*20;
    }else if(style==="shingles"){
      const x2=(x+Math.floor(y/8)*5)%11;
      light+=y%8===0?-31:y%8===1?16:x2===0?-13:0;
    }else if(style==="wood"||style==="box"||style==="fence"){
      light+=16*Math.sin(x*.39+Math.sin(y*.11))+(x%9===0?-16:0);
      if(key==="BIRCH_LOG"&&hash(x>>3,y>>2,tile)>.81)light-=64;
    }else if(style==="rings")light+=Math.sin(Math.hypot(x-16,y-16)*.76)*24;
    else if(style==="straw")light+=Math.sin(x*.77+Math.floor(y/9)) * 23 - (y%8===0?20:0);
    else if(style==="cloth")light+=(x%16<8?21:-22)+(y%8===0?-14:0);
    else if(style==="leaves")alpha=hash(x,y,tile)>.86?0:255;
    else if(style==="glass"||style==="window"){
      const frame=x<3||x>28||y<3||y>28||style==="window"&&(Math.abs(x-15)<1||Math.abs(y-16)<1);
      if(frame){alpha=255;light-=46}else alpha=(x+y)%19===2?174:(x+y)%7<2?113:82;
    }else if(style==="plant"||style==="lily"){
      const mushroom=key==="FOREST_MUSHROOM";
      const fruitY=style==="lily"?25:key==="RICE_REED"?6:8;
      const flower=mushroom?Math.hypot((x-16)*.51,y-12)<5:Math.hypot(x-(16+Math.sin(y*.29)*4),y-fruitY)<5;
      const sideFruit=["ALPINE_BUSH","PRICKLY_PEAR","CHERRY_BRANCH","CACAO_BRANCH"].includes(key)&&
        (Math.hypot(x-10,y-15)<2.8||Math.hypot(x-24,y-19)<3.3);
      const stem=Math.abs(x-16+Math.sin(y*.19)*3)<1.7&&y>9;
      const leaf=y>13&&y<29&&Math.min(Math.abs(y-19-Math.abs(x-16)*.56),Math.abs(y-25+Math.abs(x-16)*.55))<2&&x>5&&x<26;
      alpha=flower||sideFruit||stem||leaf&&!mushroom?255:0;
      if(!flower&&!sideFruit)color=style==="lily"?[67,142,79]:[66,112,70];
    }else if(style==="vein"){
      const vein=hash(x>>2,y>>2,tile);
      if(vein<.67)color=[74,75,78];else light+=22*Math.sin((x+y)*.45)+23;
    }else if(style==="station"||style==="lantern"){
      if(x>7&&x<25&&y>12&&y<26)color=hash(x>>1,y>>1,tile)>.71?[240,147,65]:[53,39,37];
      if(y%8===0||x<3||x>28)light-=17;
    }else if(style==="soil"||style==="turf"){
      const root=hash(x>>1,y>>2,tile);
      light+=root<.26?-23:root>.83?26:0;
      if(style==="turf")light+=Math.sin(x*1.46+y*.65)*9;
    }else if(style==="gravel"){
      const fleck=hash(x>>2,y>>2,tile);
      light+=fleck<.43?-25:fleck>.71?29:8;
    }else if(style==="sediment"){
      light+=Math.sin(y*.74+Math.sin(x*.13)*2.8)*15+(hash(x,y,tile)>.87?12:0);
    }else if(style==="vesicles"){
      const a=x%8-4,b=y%7-3,r=1.6+hash(x>>3,y>>3,tile)*1.7;
      light+=a*a+b*b<r*r?-40:13;
    }else if(style==="metal")light+=Math.sin(y*.76)*5+(x<2||y<2?17:0);
    return [...color.map(v=>v+light),alpha];
  }

  const ecoregions={
    "planície":["MEADOW_SOIL","LOESS","MINT_PATCH","HEMATITE","pike","wild_boar"],
    "planície florida":["MEADOW_SOIL","CHALK","MINT_PATCH","DOLOMITE","bream","flower_hare"],
    "prado alpino":["FROST_CRUST","HORNBLENDE_ROCK","ALPINE_BUSH","NICKEL_ORE","whitefish","mountain_goat"],
    montanha:["GLACIAL_MORAINE","QUARTZITE","ALPINE_BUSH","HEMATITE","whitefish","mountain_goat"],
    tundra:["FROST_CRUST","GLACIAL_MORAINE","ALPINE_BUSH","NICKEL_ORE","whitefish","snow_hare"],
    taiga:["PODZOL","HORNBLENDE_ROCK","PINE_CONE","CASSITERITE","pike","snow_hare"],
    floresta:["FOREST_LOAM","LOESS","FOREST_MUSHROOM","SPHALERITE","bream","wild_boar"],
    "floresta de sequoias":["PODZOL","QUARTZITE","FOREST_MUSHROOM","NICKEL_ORE","loach","wild_boar"],
    "bosque de cerejeiras":["MEADOW_SOIL","AMBER_SHALE","CHERRY_BRANCH","CASSITERITE","bream","flower_hare"],
    "bosque lilás":["FOREST_LOAM","QUARTZITE","CHERRY_BRANCH","FLUORITE","bream","flower_hare"],
    "selva tropical":["LATERITE","TUFF","CACAO_BRANCH","RUTILE","pacu","cacao_tapir"],
    savana:["LATERITE","LOESS","PRICKLY_PEAR","HEMATITE","tilapia","savanna_gazelle"],
    deserto:["LOESS","AMBER_SHALE","PRICKLY_PEAR","CASSITERITE","tilapia","savanna_gazelle"],
    badlands:["LATERITE","AMBER_SHALE","PRICKLY_PEAR","HEMATITE","tilapia","savanna_gazelle"],
    "chapadas ocres":["LOESS","AMBER_SHALE","PRICKLY_PEAR","SPHALERITE","tilapia","mountain_goat"],
    "cânion calcário":["CHALK","TRAVERTINE","MINT_PATCH","DOLOMITE","loach","mountain_goat"],
    "bosque de cristais":["QUARTZITE","HORNBLENDE_ROCK","ALPINE_BUSH","FLUORITE","loach","crystal_heron"],
    "campina de aurora":["MEADOW_SOIL","QUARTZITE","ALPINE_BUSH","FLUORITE","pike","flower_hare"],
    manguezal:["PEAT_MAT","SHELL_SAND","SALTWORT","RUTILE","seabass","marsh_heron"],
    "delta salobro":["SHELL_SAND","PEAT_MAT","RICE_REED","SPHALERITE","sole","marsh_heron"],
    pântano:["PEAT_MAT","FOREST_LOAM","RICE_REED","HEMATITE","loach","marsh_heron"],
    salinas:["SALT_CRUST","SHELL_SAND","SALTWORT","DOLOMITE","sardine","marsh_heron"],
    "fiordes glaciais":["GLACIAL_MORAINE","FROST_CRUST","ALPINE_BUSH","RUTILE","whitefish","snow_hare"],
    "termas minerais":["TRAVERTINE","TUFF","MINT_PATCH","DOLOMITE","tilapia","crystal_heron"],
    "caldeira vítrea":["SCORIA","PUMICE","SALTWORT","NICKEL_ORE","emberfish","scoria_ram"],
    "vulcânico":["SCORIA","TUFF","SALTWORT","RUTILE","emberfish","scoria_ram"]
  };
  const produce={
    MINT_PATCH:"wild_mint",ALPINE_BUSH:"alpine_berries",RICE_REED:"wild_rice",PRICKLY_PEAR:"prickly_fruit",
    CACAO_BRANCH:"cacao",CHERRY_BRANCH:"wild_cherries",PINE_CONE:"pine_nuts",SALTWORT:"samphire",FOREST_MUSHROOM:"forest_mushroom"
  };
  const oreKeys=["HEMATITE","CASSITERITE","SPHALERITE","NICKEL_ORE","RUTILE","DOLOMITE","FLUORITE"];
  const fertileKeys=["MEADOW_SOIL","FOREST_LOAM","PODZOL","LATERITE","PEAT_MAT","LOESS"];
  const shoreBiomes=new Set(["manguezal","delta salobro","salinas","pântano","fiordes glaciais"]);
  function resourcePlan(B,hash,seed){
    const salt=seed%971;
    const rows=Object.fromEntries(Object.entries(ecoregions).map(([biome,[soil,rock,plant,ore]])=>
      [biome,{soil:B[soil],rock:B[rock],plant:B[plant],ore:B[ore]}]));
    const region=biome=>rows[biome]||rows["planície"];
    const patch=(x,z)=>hash(Math.floor(x/4),Math.floor(z/4),1141+salt);
    const surface=(biome,x,z,delta)=>{
      const roll=patch(x,z);
      if(delta<2&&shoreBiomes.has(biome))return roll>.68?region(biome).soil:0;
      if(delta<0)return 0;
      return roll>.79?region(biome).soil:0;
    };
    const cover=(biome,x,z)=>hash(x,z,1189+salt)>.972?region(biome).plant:0;
    const ore=(biome,x,y,z)=>{
      const roll=hash(Math.floor(x/2),Math.floor(y/2),Math.floor(z/2)+1461+salt);
      return roll>.981?region(biome).ore:0;
    };
    const stratum=(biome,x,y,z)=>hash(Math.floor(x/5),Math.floor(y/4),Math.floor(z/5)+1193+salt)>.72?region(biome).rock:0;
    return {surface,cover,ore,stratum,region,produce:new Map(Object.entries(produce).map(([block,item])=>[B[block],item])),
      ores:new Set(oreKeys.map(key=>B[key])),fertile:new Set(fertileKeys.map(key=>B[key]))};
  }
  const localFish=biome=>ecoregions[biome]?.[4];
  const localFauna=biome=>ecoregions[biome]?.[5];
  return {register,paint,culture,water,skins,resourcePlan,localFish,localFauna};
})();
