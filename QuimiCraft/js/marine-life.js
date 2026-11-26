"use strict";

globalThis.QuimiCraftMarineLife=(()=>{
  const reef=["reef"],temperate=["temperate_coast","temperate_open"],polar=["polar_coast","polar_open","subantarctic"];
  const coastal=["reef","estuary","temperate_coast"];
  const sea=[...coastal,"tropical_open","temperate_open",...polar,"arctic_coast","arctic_open"];
  const foundation={speed:0,extent:.21,swim:.96,mode:"attached",minDepth:2,small:true,damage:0,hp:8,anchored:true};
  const producer={...foundation,stock:12,photosynthesis:true};
  const drifter={mode:"drift",hp:8,damage:0,extent:.21,small:true,minDepth:2,swim:.35,current:.62};
  const profiles={
    phytoplankton:{...drifter,name:"Fitoplâncton",habitat:"Camada iluminada do mar e de águas doces",zones:[...sea,"fresh"],
      speed:.11,swim:.14,stock:16,photosynthesis:true,bodySize:1.55},
    zooplankton:{...drifter,name:"Zooplâncton",habitat:"Águas superficiais com fitoplâncton",zones:[...sea,"fresh"],
      speed:.22,swim:.32,stock:15,diet:["phytoplankton"],feeding:"filter",feedRange:3.2,bodySize:1.38},
    antarctic_krill:{...drifter,name:"Krill-antártico",scientific:"Euphausia superba",habitat:"Águas polares e subpolares em enxames",
      zones:polar,speed:.54,swim:.43,stock:22,diet:["phytoplankton"],feeding:"filter",feedRange:3.4,bodySize:1.12},
    moon_jelly:{...drifter,name:"Água-viva-da-lua",scientific:"Aurelia spp.",habitat:"Baías tranquilas e águas costeiras temperadas",
      zones:["temperate_coast","estuary"],speed:.43,swim:.42,diet:["zooplankton"],feeding:"filter",feedRange:2.3,bodySize:.65},
    sea_nettle:{...drifter,name:"Urtiga-do-mar-do-Pacífico",scientific:"Chrysaora fuscescens",habitat:"Costas temperadas e mar aberto",
      zones:temperate,speed:.52,swim:.56,hp:13,diet:["zooplankton","moon_jelly","raw_sardine"],feeding:"filter",feedRange:2.7,bodySize:1.07,
      damage:3,attack:{kind:"sting",range:.76,notice:1.15,windup:.29,strike:.26,recover:.43,cooldown:2.1}},
    common_octopus:{name:"Polvo-comum",scientific:"Octopus vulgaris",habitat:"Fundo rochoso de águas temperadas e quentes",
      zones:[...reef,"temperate_coast","tropical_open"],substrate:"rock",small:true,minDepth:3,speed:1.38,extent:.37,swim:.91,mode:"bottom",
      hp:24,damage:0,diet:["rock_mussel","shrimp_pink","shrimp_seabob","shrimp_white","raw_shrimp"],bodySize:.85,solo:true},
    coastal_squid:{name:"Lula-da-costa",scientific:"Doryteuthis spp.",habitat:"Meia-água na plataforma marinha",
      zones:["temperate_open","temperate_coast","tropical_open","reef"],small:true,minDepth:4,speed:1.98,extent:.30,swim:.46,
      mode:"school",group:[2,4],hp:21,damage:0,diet:["raw_sardine","raw_mullets","raw_fish","zooplankton","shrimp_pink"],bodySize:.45},
    harbor_seal:{name:"Foca-comum",scientific:"Phoca vitulina",habitat:"Costas temperadas e bancos costeiros",
      zones:["temperate_coast","temperate_open"],minDepth:3,speed:1.85,extent:.62,swim:.46,mode:"cruise",
      hp:43,damage:0,shore:"coast",diet:["coastal_squid","raw_mullets","raw_sardine","raw_seabass","raw_fish"],bodySize:1.37,catalogLength:1.75},
    leopard_seal:{name:"Foca-leopardo",scientific:"Hydrurga leptonyx",habitat:"Borda do gelo marinho antártico",
      zones:["polar_coast"],minDepth:4,speed:2.64,extent:.79,swim:.43,mode:"cruise",hp:65,damage:0,shore:"ice",
      diet:["adelie_penguin","antarctic_krill","antarctic_toothfish"],bodySize:1.91,catalogLength:3.1,solo:true},
    ringed_seal:{name:"Foca-anelada",scientific:"Pusa hispida",habitat:"Plataformas de gelo ártico e canais costeiros",
      zones:["arctic_coast"],minDepth:3,speed:1.91,extent:.57,swim:.43,mode:"cruise",hp:38,damage:0,shore:"ice",
      diet:["raw_char","raw_whitefish","raw_fish"],bodySize:1.26,catalogLength:1.50},
    adelie_penguin:{name:"Pinguim-de-adélia",scientific:"Pygoscelis adeliae",habitat:"Costas antárticas rochosas e bordas do gelo",
      zones:["polar_coast"],small:true,minDepth:2,speed:2.04,extent:.28,swim:.40,mode:"school",group:[3,5],hp:23,damage:0,
      shore:"ice",diet:["antarctic_krill"],feeding:"filter",feedRange:1.3,bodySize:.67,catalogLength:.71},
    sea_star:{name:"Estrela-do-mar-ocre",scientific:"Pisaster ochraceus",habitat:"Costas rochosas temperadas, perto de mexilhões",
      zones:["temperate_coast"],substrate:"rock",small:true,minDepth:2,speed:.24,extent:.22,swim:.99,mode:"bottom",benthic:true,
      hp:12,damage:0,diet:["rock_mussel"],feeding:"graze",feedRange:.72,bodySize:.69,solo:true},
    rock_mussel:{...foundation,name:"Banco de mexilhões",habitat:"Rocha submersa em águas costeiras",zones:["temperate_coast","estuary"],
      substrate:"rock",stock:14,diet:["phytoplankton"],feeding:"filter",feedRange:3.1,bodySize:.66},
    branching_coral:{...foundation,name:"Coral ramificado",scientific:"Acropora spp.",habitat:"Recifes rasos, quentes e iluminados",
      zones:reef,substrate:"rock",stock:10,photosynthesis:true,diet:["zooplankton"],feeding:"filter",feedRange:3.3,refuge:true,bodySize:.80},
    brain_coral:{...foundation,name:"Coral-cérebro",scientific:"Diploria labyrinthiformis",habitat:"Recifes rasos e iluminados",zones:reef,substrate:"rock",
      stock:11,photosynthesis:true,diet:["zooplankton"],feeding:"filter",feedRange:3.3,refuge:true,bodySize:.82},
    sea_anemone:{...foundation,name:"Anêmona-do-mar",habitat:"Recifes e poças rochosas costeiras",zones:["reef","temperate_coast"],
      substrate:"rock",stock:10,diet:["zooplankton"],feeding:"filter",feedRange:2.4,refuge:true,bodySize:.59},
    eelgrass:{...producer,name:"Erva-marinha",scientific:"Zostera marina",habitat:"Fundos rasos de areia ou lodo em águas temperadas",
      zones:["temperate_coast","estuary"],substrate:"soft",refuge:true,bodySize:.82},
    kelp:{...producer,name:"Laminária",habitat:"Fundos rochosos de águas marinhas frias ou temperadas",
      zones:["temperate_coast","subpolar_coast"],substrate:"rock",refuge:true,bodySize:1.52},
    waterweed:{...producer,name:"Elódea",scientific:"Elodea spp.",habitat:"Margens submersas e iluminadas de lagos de água doce",
      zones:["fresh"],substrate:"soft",refuge:true,bodySize:.77}
  };
  const warm=new Set(["savana","selva tropical","manguezal","delta salobro"]);
  const brackish=new Set(["manguezal","delta salobro","salinas"]);
  function habitat(biome,lake,water,depth,zone){
    if(water==="cold"&&zone==="arctic")return [depth<=7||lake?.radius>=.29?"arctic_coast":"arctic_open"];
    if(water==="cold"&&(zone==="glacial"||zone==="subantarctic")){
      if(zone==="subantarctic")return depth<=6?["subpolar_coast","subantarctic"]:["subantarctic"];
      return [depth<=7||lake?.radius>=.29?"polar_coast":"polar_open"];
    }
    if(water==="fresh"||water==="tannin"||water==="cold"&&!zone)return depth<=6?["fresh"]:[];
    if(water!=="salt")return [];
    if(brackish.has(biome)&&(!lake||lake.radius>.72))return ["estuary"];
    if(warm.has(biome))return [depth<=6?"reef":"tropical_open"];
    return [depth<=6?"temperate_coast":"temperate_open"];
  }
  const residents=Object.entries(profiles);
  function eligible(biome,lake,water,depth,zone){
    const zones=habitat(biome,lake,water,depth,zone);
    return residents.filter(([,p])=>depth>=p.minDepth&&(!p.anchored||depth<=(p.zones.includes("reef")?6:7))&&
      p.zones.some(local=>zones.includes(local))).map(([id])=>id);
  }
  function renewal(profile,stock,{light,weather},dt){
    if(profile.photosynthesis){
      const cloud=weather==="storm"?.30:weather==="rain"||weather==="snow"?.55:1;
      return Math.max(0,Math.min(profile.stock,stock+dt*(light*cloud*.30-.018)));
    }
    return Math.max(0,Math.min(profile.stock,stock+dt*(profile.feeding==="filter"?-.022:.027)));
  }
  return {profiles,habitat,eligible,renewal};
})();
