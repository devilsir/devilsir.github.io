
"use strict";

globalThis.QuimiCraftWorkshops=(()=>{
  const fishSpecies={
    pike:["Lúcio","#889b66",0x829264,"long"],whitefish:["Coregono","#9bbfd6",0xa9c7d7,"slim"],
    bream:["Brema","#c8aa8e",0xc5a479,"deep"],loach:["Verdemã","#8c9674",0x79895e,"long"],
    pacu:["Pacu","#d7a481",0xd49a78,"deep"],tilapia:["Tilápia","#97a7b0",0x9fadb1,"deep"],
    seabass:["Robalo","#9aadaa",0x8eaba7,"slim"],sole:["Linguado","#ae906e",0xac8e65,"flat"],
    piranha:["Piranha","#c87351",0xc87351,"deep"],
    sardine:["Sardinha","#82adc6",0x7eabd0,"slim"],emberfish:["Peixe-brasa","#d98755",0xc86a44,"deep"]
  };
  const dishes={
    mint_fish:["Lúcio com hortelã","#9baf7a",34,3,5],alpine_compote:["Compota de frutos da serra","#c37ca8",24,8,5],
    bog_risotto:["Risoto de arroz silvestre","#d4b682",35,9,5],cacao_cake:["Bolo de cacau","#a2735b",31,0,6],
    prickly_jam:["Geleia de palma","#d58480",23,8,4],cherry_crumble:["Torta de cereja","#cc7779",30,0,6],
    pine_porridge:["Mingau de pinhão","#caad79",29,9,5],shellfish_broth:["Caldo de camarão e salicórnia","#d39373",33,10,5],
    mushroom_rice:["Arroz com cogumelos","#b99b70",32,3,6],grilled_game:["Carne de caça grelhada","#bd8a62",35,0,6]
  };
  const ingredients={
    wild_mint:["Hortelã","#81ac8a",2],alpine_berries:["Bagas da serra","#b66f97",8],
    wild_rice:["Arroz silvestre","#c3ae7c",0],prickly_fruit:["Fruto de palma","#da897d",9],
    cacao:["Cacau","#9c7751",0],wild_cherries:["Cerejas","#bc5d70",8],
    pine_nuts:["Pinhões","#b69268",0],samphire:["Salicórnia","#92a869",4],forest_mushroom:["Cogumelo do bosque","#ceaf81",0]
  };
  const itemData={
    ...Object.fromEntries(Object.entries(dishes).map(([id,row])=>[id,row.slice(0,2)])),
    ...Object.fromEntries(Object.entries(ingredients).map(([id,row])=>[id,row.slice(0,2)])),
    ...Object.fromEntries(Object.entries(fishSpecies).flatMap(([key,[name,color]])=>[
      ["raw_"+key,[name+" (cru)",color]],["cooked_"+key,["Porção de "+name.toLowerCase(),"#c28c69"]]
    ])),
    raw_game:["Carne de caça crua","#bb7864"],cobalt_ingot:["Lingote de cobalto","#929cb0"],nickel_ingot:["Lingote de níquel","#abb6ab"],
    pewter_ingot:["Lingote de liga de estanho","#aab2bf"],cupronickel_ingot:["Lingote de cuproníquel","#b3a19b"],
    pan:["Frigideira", "#72828e"], mallet:["Martelo de fundição","#876d56"],
    veggie_stew:["Ensopado de legumes","#c87e58"], fish_stew:["Caldeirada de peixe","#c48863"],
    fish_fillet:["Filé na frigideira","#ce9066"], carrot_loaf:["Pão de cenoura","#dba568"],
    berry_tart:["Torta de bagas","#cf7790"], grain_porridge:["Mingau de trigo","#d7b992"],
    tin_ingot:["Lingote de estanho","#b2b9c1"], zinc_ingot:["Lingote de zinco","#969db3"],
    steel_ingot:["Lingote de aço","#939fac"], brass_ingot:["Lingote de latão","#d6b361"],
    iron_ingot:["Lingote de ferro","#9ca9ae"], silver_ingot:["Lingote de prata","#c9d2da"],
    raw_eel:["Enguia crua","#71745c"], raw_mullets:["Tainha crua","#949fb0"], raw_char:["Salvelino cru","#a48491"],
    raw_carp:["Carpa crua","#c29465"], raw_shrimp:["Camarão cru","#de896c"],
    cooked_eel:["Enguia assada","#b98969"], cooked_mullets:["Tainha assada","#ab8f78"], cooked_char:["Salvelino assado","#bf8676"],
    cooked_carp:["Carpa assada","#d4a366"], cooked_shrimp:["Camarão salteado","#e89476"],
    mineral_lure:["Isca mineral","#7fbdb6"], herb_bait:["Isca aromática","#98a957"],
    reinforced_rod:["Vara reforçada","#aeb5b8"], fishing_junk:["Emaranhado de linha","#9a8277"]
  };
  const rawFish=["fish","trout","catfish","perch","eel","mullets","char","carp","shrimp",...Object.keys(fishSpecies)];
  const rawMap={...Object.fromEntries(rawFish.map(type=>["raw_"+type,"cooked_"+type])),raw_game:"grilled_game"};
  const food={
    veggie_stew:{hunger:31,thirst:12,health:5},fish_stew:{hunger:36,thirst:9,health:7},
    fish_fillet:{hunger:29,health:6},carrot_loaf:{hunger:28,health:4},berry_tart:{hunger:30,health:5},grain_porridge:{hunger:24,thirst:8},
    ...Object.fromEntries(Object.keys(rawMap).slice(4).map(id=>[id,{hunger:7,raw:true}])),
    ...Object.fromEntries(Object.values(rawMap).slice(4).map((id,i)=>[id,{hunger:23+(i%6)*2,health:3}])),
    ...Object.fromEntries(Object.entries(ingredients).filter(([,row])=>row[2]>0).map(([id,[,,hunger]])=>[id,{hunger,thirst:2}])),
    ...Object.fromEntries(Object.entries(dishes).map(([id,[,,hunger,thirst,health]])=>[id,{hunger,thirst,health}]))
  };
  function recipes(B){
    const row=(name,need,out)=>({name,need,out});
    return [
      row("Fogão de pedra",[[B.STONE,4],[B.CLAY,2]],[B.KITCHEN_STOVE,1]),
      row("Forno de vidro",[[B.FIELDSTONE,4],[B.CERAMIC,2],[B.IRON,1]],[B.GLASS_KILN,1]),
      row("Forja de ligas",[[B.STONE,4],[B.IRON,2],[B.CLAY,2]],[B.METAL_FORGE,1]),
      row("Frigideira",[[B.IRON,2],["stick",1]],["pan",1]),
      row("Martelo de fundição",[[B.IRON,2],["stick",2]],["mallet",1]),
      row("Vara reforçada",[[B.ACACIA_LOG,1],["wool",1],["brass_ingot",1]],["reinforced_rod",1]),
      ...["BIRCH","ACACIA","JACARANDA"].map(id=>row("Tábuas",[[B[id+"_LOG"],1]],[B.PLANK,4])),
      row("Reboco de cal",[[B.SAND,1],[B.LIMESTONE,1]],[B.LIME_PLASTER,4]),
      row("Reboco ocre",[[B.CLAY,1],[B.RED_SAND,1]],[B.OCHRE_PLASTER,4]),
      row("Pedra aparelhada",[[B.STONE,2]],[B.FIELDSTONE,3]),
      row("Telha cerâmica",[[B.CERAMIC,2]],[B.ROOF_RED,4]),
      row("Telha de ardósia",[[B.SLATE,2]],[B.ROOF_BLUE,4]),
      row("Telha verde",[[B.SLATE,1],[B.MOSS,1]],[B.ROOF_MOSS,4]),
      row("Cobertura de palha",[[B.TALL_GRASS,2],["wheat",1]],[B.THATCH,4]),
      row("Toldo tecido",[["wool",2],["stick",1]],[B.WOVEN_AWNING,3]),
      row("Caixilho",[[B.GLASS,2],[B.PLANK,1]],[B.WINDOW_LEADED,3]),
      row("Cerca de madeira",[[B.PLANK,2],["stick",1]],[B.FENCE_WOOD,3]),
      row("Floreira",[[B.PLANK,2],[B.DIRT,1]],[B.GARDEN_BOX,1]),
      row("Lampião",[[B.GLASS,1],[B.TORCH,1]],[B.VILLAGE_LANTERN,2]),
    ];
  }
  function stationJobs(B){
    const job=(name,need,out,kind,seconds)=>({name,need,out,kind,seconds});
    const cook=(name,need,id,count=1)=>job(name,[...need,[B.COAL,1]],[[id,count]],"cook",2.65);
    const forge=(name,need,out,count=1,section="smelt")=>{
      const seconds={smelt:3.45,alloy:5.2,mold:2.6}[section];
      return {...job(name,[...need,[B.COAL,1]],[[out,count]],"forge",seconds),section};
    };
    const glass=(name,need,out,count=1)=>job(name,[...need,[B.COAL,1]],[[out,count]],"glass",3.15);
    const kitchen=[
      cook("Ensopado de legumes",[["carrot",1],["beans",1]],"veggie_stew",2),
      cook("Caldeirada",[["raw_fish",1],["carrot",1]],"fish_stew",2),
      cook("Filé dourado",[["raw_trout",1],["wheat",1]],"fish_fillet",2),
      cook("Pão de cenoura",[["carrot",1],["wheat",2]],"carrot_loaf",2),
      cook("Torta de bagas",[["berries",2],["wheat",1]],"berry_tart",2),
      cook("Mingau",[["wheat",2],["honey",1]],"grain_porridge",2),
      cook("Lúcio com hortelã",[["raw_pike",1],["wild_mint",1]],"mint_fish",2),
      cook("Compota de frutos da serra",[["alpine_berries",2],["honey",1]],"alpine_compote",2),
      cook("Risoto de arroz silvestre",[["wild_rice",2],["beans",1]],"bog_risotto",2),
      cook("Bolo de cacau",[["cacao",1],["wheat",2]],"cacao_cake",2),
      cook("Geleia de palma",[["prickly_fruit",2],["honey",1]],"prickly_jam",2),
      cook("Torta de cereja",[["wild_cherries",2],["wheat",1]],"cherry_crumble",2),
      cook("Mingau de pinhão",[["pine_nuts",2],["wheat",1]],"pine_porridge",2),
      cook("Caldo de camarão e salicórnia",[["raw_shrimp",1],["samphire",1]],"shellfish_broth",2),
      cook("Arroz com cogumelos",[["wild_rice",1],["forest_mushroom",2]],"mushroom_rice",2),
      cook("Grelhar carne de caça",[["raw_game",1]],"grilled_game"),
      ...rawFish.map(id=>cook("Assar "+(fishSpecies[id]?.[0]||"pescado").toLowerCase(),[["raw_"+id,1]],"cooked_"+id))
    ];
    const smelter=[
      forge("Fundir ferro",[[B.IRON,2]],"iron_ingot",2),
      ...(Number.isInteger(B.MAGNETITE)?[forge("Reduzir magnetita",[[B.MAGNETITE,2]],"iron_ingot",2)]:[]),
      ...(Number.isInteger(B.HEMATITE_VEIN)?[forge("Processar veio de hematita",[[B.HEMATITE_VEIN,2]],"iron_ingot",2)]:[]),
      forge("Fundir cobre",[[B.COPPER,2]],"copper_ingot",2),
      forge("Recuperar cobre da malaquita",[[B.MALACHITE,2]],"copper_ingot",2),
      forge("Fundir estanho",[[B.TIN,2]],"tin_ingot",2),
      forge("Fundir zinco",[[B.ZINC,2]],"zinc_ingot",2),
      forge("Fundir prata",[[B.SILVER_ORE,1]],"silver_ingot",2),
      forge("Ligar bronze",[["copper_ingot",2],["tin_ingot",1]],"bronze_ingot",3,"alloy"),
      forge("Ligar latão",[["copper_ingot",2],["zinc_ingot",1]],"brass_ingot",3,"alloy"),
      forge("Produzir aço",[["iron_ingot",2]],"steel_ingot",2,"alloy"),
      forge("Recuperar ferro da hematita",[[B.HEMATITE,2]],"iron_ingot",2),
      forge("Recuperar estanho da cassiterita",[[B.CASSITERITE,2]],"tin_ingot",2),
      forge("Recuperar zinco da esfalerita",[[B.SPHALERITE,2]],"zinc_ingot",2),
      forge("Processar minério de cobalto",[[B.COBALT_ORE,2]],"cobalt_ingot",2),
      forge("Processar minério de níquel",[[B.NICKEL_ORE,2]],"nickel_ingot",2),
      forge("Ligar cuproníquel",[["copper_ingot",2],["nickel_ingot",1]],"cupronickel_ingot",3,"alloy"),
      forge("Ligar estanho e cobre",[["tin_ingot",3],["copper_ingot",1]],"pewter_ingot",4,"alloy"),
      forge("Moldar bloco de cobalto",[["cobalt_ingot",4]],B.COBALT_BLOCK,1,"mold"),
      forge("Moldar bloco de níquel",[["nickel_ingot",4]],B.NICKEL_BLOCK,1,"mold"),
      forge("Moldar bloco de cuproníquel",[["cupronickel_ingot",4]],B.CUPRONICKEL_BLOCK,1,"mold"),
      forge("Moldar bloco de liga de estanho",[["pewter_ingot",4]],B.PEWTER_BLOCK,1,"mold"),
      forge("Moldar bloco de bronze",[["bronze_ingot",4]],B.BRONZE_BLOCK,1,"mold"),
      forge("Moldar bloco de latão",[["brass_ingot",4]],B.BRASS_BLOCK,1,"mold"),
      forge("Moldar bloco de aço",[["steel_ingot",4]],B.STEEL_BLOCK,1,"mold")
    ];
    const kiln=[
      glass("Derreter areia",[[B.SAND,3]],B.GLASS,3),
      glass("Derreter sílica",[[B.SILICA_SAND,2]],B.GLASS,4),
      ...(Number.isInteger(B.RIVER_SAND)?[glass("Derreter areia de rio",[[B.RIVER_SAND,3]],B.GLASS,3)]:[]),
      glass("Colorir vidro âmbar",[[B.GLASS,2],[B.PYRITE,1]],B.GLASS_AMBER,2),
      glass("Colorir vidro cobalto",[[B.GLASS,2],[B.COBALT_ORE,1]],B.GLASS_COBALT,2),
      glass("Fundir vidro decorativo",[[B.GLASS,1],[B.SILICA_SAND,1]],"lab_glassware",2)
    ];
    return new Map([[B.KITCHEN_STOVE,kitchen],[B.METAL_FORGE,smelter],[B.GLASS_KILN,kiln]]);
  }
  const baitOptions=["mineral_lure","herb_bait","bait"];
  const fishingRods=new Set(["fishing_rod","reinforced_rod"]);
  function fishingYield(water,rod,bait,random=Math.random){
    const region=water.kind||QuimiCraftRegions.water(water.biome).id;
    const deep=water.depth>=3,roll=random(),bonus=rod==="reinforced_rod"?.08:0;
    if(bait==="mineral_lure"&&roll<.08+bonus)return [[region==="mineral"?"aquamarine":"silver_dust",1]];
    if(deep&&(region==="fresh"||region==="tannin")&&["selva tropical","savana"].includes(water.biome)&&roll>=.34&&roll<.46)return [["raw_piranha",1]];
    const regional=QuimiCraftRegions.localFish(water.biome);
    if(regional&&region!=="acid"&&roll>=.49&&roll<.73+(deep?.09:0))
      return [["raw_"+regional,regional==="sardine"&&deep?2:1]];
    if(regional==="emberfish"&&region==="acid"&&roll>=.53&&roll<.88)return [["raw_emberfish",1]];
    if(region==="salt"&&roll<.43)return [[roll<.19?"raw_shrimp":"raw_mullets",deep&&roll<.08?2:1]];
    if(region==="cold"&&deep&&roll<.40)return [["raw_char",1]];
    if(region==="thermal"&&roll<.59)return [["raw_carp",1]];
    if(region==="tannin"&&roll<.36&&water.biome!=="manguezal")return [["raw_eel",1]];
    if(region==="acid"&&roll<.53)return [[bait?"silver_dust":"fishing_junk",1]];
    if(roll>.97&&bait!=="herb_bait")return [["fishing_junk",1]];
    if(water.biome==="manguezal"&&deep&&!water.kind)return [["raw_catfish",1]];
    return [[QuimiCraftFrontier.fishFor(water.biome,water.depth,()=>roll),1]];
  }
  function createJobQueue({position,exchange,getBlock,play,finish,notice}){
    let active=null;
    function enqueue(target,job){
      if(active)return {ok:false,message:"Já há um preparo em andamento."};
      if(getBlock(target.x,target.y,target.z)!==target.id)return {ok:false,message:"A estação foi removida."};
      const check=exchange(job.need,job.out,true);
      if(!check.ok)return check;
      active={target:{...target},job,left:job.seconds};
      play(job.kind,job.seconds,target);
      return {ok:true};
    }
    function tick(dt){
      if(!active)return;
      const {target,job}=active,p=position();
      if(Math.hypot(p.x-target.x-.5,p.y-target.y,p.z-target.z-.5)>4.8||getBlock(target.x,target.y,target.z)!==target.id){
        active=null;notice("Preparo interrompido.");return;
      }
      active.left-=dt;
      if(active.left>0)return;
      active=null;
      const result=exchange(job.need,job.out,false);
      if(result.ok)finish(job,target);else notice(result.message);
    }
    return {enqueue,tick,get current(){return active}};
  }
  return {itemData,recipes,stationJobs,food,rawMap,fishSpecies,baitOptions,fishingRods,fishingYield,createJobQueue};
})();
