"use strict";

globalThis.QuimiCraftFactions=(()=>{
  const grove=QuimiCraftGrove;
  const divine=QuimiCraftDivineFactions,dragonLairs=QuimiCraftDragonLairs;
  const orders={
    scourge:{name:"Flagelo da Geada",body:[54,77,113],accent:[132,224,255]},
    light:{name:"Exército Dourado",body:[215,161,64],accent:[255,235,156]},
    fel:{name:"Legião da Fenda Vil",body:[66,111,46],accent:[162,251,76]},
    druid:{name:"Círculo Druídico Xamânico",body:[48,122,74],accent:[118,248,162]},
    alchemist:{name:"Ordem dos Alquimistas",body:[44,126,134],accent:[114,242,224]},
    villager:{name:"Liga dos Aldeões",body:[168,118,70],accent:[248,208,128]},
    arvoroso:{name:grove.name,body:[92,129,62],accent:[225,216,141]},
    ...divine.orders
  };
  const orderMeta={
    light:{
      name:"Exército Dourado",short:"Luz",color:"#ffd866",leader:"Arconte da Primeira Luz",
      motto:"Pela Primeira Luz, purificaremos as trevas, o Flagelo e a Legião!",
      rallyCry:"Avante, campeões da Alvorada! A Luz marcha ao seu lado!"
    },
    scourge:{
      name:"Flagelo da Geada",short:"Flagelo",color:"#70e2ff",leader:"Varkel, o Rei Lich",
      motto:"Todos dobrarão os joelhos diante do Trono Gelado.",
      rallyCry:"Levantem-se, servos do gelo! O Flagelo reivindica este campo!"
    },
    fel:{
      name:"Legião da Fenda Vil",short:"Legião Vil",color:"#9cf94b",leader:"Zarveth, o Supremo da Fenda",
      motto:"Chamas de Fel reduzirão mundos e palácios a cinzas!",
      rallyCry:"Pela Fenda Vil! Queimem cada inimigo em fogo verde!"
    },
    druid:{
      name:"Círculo Druídico Xamânico",short:"Druidas",color:"#68f09c",leader:"Arquidruida Thoran",
      motto:"Ouvimos a voz do fogo, da água, da pedra e do vento — e assumimos sua forma em defesa da vida.",
      rallyCry:"Pelos espíritos dos elementos e das feras! O Círculo desperta!"
    },
    alchemist:{
      name:"Ordem dos Alquimistas",short:"Alquimistas",color:"#66ead6",leader:"Conselho dos Alquimistas",
      motto:"Ciência, extratos e transmutação protegem este mundo contra o caos abissal.",
      rallyCry:"Preparem os frascos e catalisadores! Pela Ordem dos Alquimistas!"
    },
    villager:{
      name:"Liga dos Aldeões",short:"Aldeões",color:"#f4c06c",leader:"Guardiã Íris e Conselho da Vila",
      motto:"Nossas vilas, oficinas e colheitas resistem unidas a qualquer ameaça.",
      rallyCry:"Pela Vila dos Elementos! Ergam os escudos e defendam o povo!"
    },
    arvoroso:{name:grove.name,short:"Arvorosos",color:"#cce17f",leader:"Anciã da Copa",
      motto:"Partilhamos a luz das copas e defendemos as raízes que nos alimentam.",
      rallyCry:"Guardem os viveiros! Que as raízes protejam a aldeia!"
    },
    ...divine.meta
  };
  const leaders={
    scourge:{type:"lich_king",home:"cidadela_de_gelo"},
    light:{type:"light_archon",home:"palacio_da_luz"},
    fel:{type:"fel_supreme",home:"templo_da_fenda_vil"},
    druid:{type:"druid_archdruid",home:"circulo_druidico"},
    alchemist:{type:"alchemist_master",home:"academia_dos_alquimistas"},
    villager:{type:"villager_captain",home:"posto_da_liga"},
    arvoroso:{type:"living_tree_elder",home:grove.place.id},
    ...divine.leaders
  };
  const patrolRosters={
    scourge:["scourge_deathknight","scourge_skeleton","scourge_ghoul","scourge_banshee","scourge_lich","scourge_necromancer","scourge_gargoyle"],
    light:["light_paladin","light_sentinel","light_seraph","light_valkyr","light_vindicator","light_crusader","light_naaru"],
    fel:["fel_guard","fel_felguard","fel_hound","fel_imp","fel_succubus","fel_doomguard","fel_inquisitor","fel_infernal"],
    druid:["druid_shaman","druid_shapeshifter","druid_totemist","druid_archdruid"],
    alchemist:["alchemist_pyromancer","alchemist_sentinel"],
    villager:["villager_ranger"],
    arvoroso:["living_tree_warden","living_tree_bloom","living_tree_amber","living_tree"],
    ...divine.rosters
  };
  const invasionRosters={
    scourge:["scourge_deathknight","scourge_nerubian","scourge_lich","scourge_abomination","scourge_wyrm","scourge_gargoyle","scourge_necromancer","scourge_banshee","scourge_skeleton","scourge_ghoul"],
    light:["light_paladin","light_vindicator","light_crusader","light_naaru","light_naaru_warden","light_valkyr","light_warframe","light_seraph","light_sentinel"],
    fel:["fel_abyssal_lord","fel_pitlord","fel_eredar","fel_doomlord","fel_doomguard","fel_infernal","fel_inquisitor","fel_felguard","fel_succubus","fel_master","fel_guard","fel_hound","fel_imp"],
    druid:["druid_shaman","druid_shapeshifter","druid_totemist","druid_shaman","druid_shapeshifter"],
    alchemist:["alchemist_sentinel","alchemist_pyromancer","alchemist_sentinel","alchemist_pyromancer"],
    villager:["villager_ranger","villager_ranger","villager_ranger","villager_ranger"],
    arvoroso:["living_tree_warden","living_tree_amber","living_tree_bloom","living_tree_pine","living_tree_fig"],
    ...divine.rosters
  };
  const orderRewards=B=>({
    light:[["gold_nugget",4],[B.DAWN_GOLD,2]],
    scourge:[["death_rune",4],[B.FROST_RUNE,1]],
    fel:[["fel_ember",4],[B.FEL_LANTERN,1]],
    druid:[["elemental_core",2],[B.DRUID_TOTEM,1]],
    alchemist:[["crystal_shard",4],["glow_solution",2]],
    villager:[["gold_nugget",3],["bread",4]],
    arvoroso:[["honey",4],[B.CANOPY_PLANK,4]],
    ...Object.fromEntries(Object.keys(divine.orders).map(order=>[order,divine.supplies(order,B)]))
  });
  const elementalDialogues=[
    "O espírito do fogo sussurra que uma fissura arde além das montanhas…",
    "Escuto a canção das marés: a água lembra de cada rocha que já moldou.",
    "Os ventos trazem notícias de tempestades elétricas e asas sobre os vales.",
    "A terra sob nossos pés respira calma — e nos empresta a força do urso e da pedra.",
    "Quando a corrupção ameaça a mata, assumimos a forma dos animais e dos elementos.",
    "Converse com os elementos com respeito, viajante, e eles responderão ao seu chamado.",
    "Os totens do Círculo acalmam a fúria das fissuras elementais ao redor do mundo.",
    "Na Convergência Elemental, todos os elementos dançam em equilíbrio primordial."
  ];
  const spiritReplies={
    fire:"A Forja Ígnea conserva brasas até quando a chuva cobre as chapadas.",
    water:"Nas marés baixas, os canais de mármore deixam à vista a fissura azul.",
    earth:"As pedras da Bastilha Telúrica vibram antes que seu guardião desperte.",
    wind:"O Pináculo dos Ventos tem torres que pairam sobre o pátio.",
    lightning:"Os condutores de cobre da Torre Tempestuosa brilham quando me aproximo.",
    nature:"Siga o brilho das flores entre as raízes para encontrar a Fissura Viva."
  };
  const places=[
    {id:"cidadela_de_gelo",name:"Cidadela de Gelo",order:"scourge",width:21,depth:19,height:31,
      aliases:["scourge","flagelo","rei_lich","lich_king"],biomes:["fiordes glaciais","tundra","taiga","campina de aurora","prado alpino"],
      actors:[["lich_king",0,-12,1],["scourge_lich",-9,-10],["scourge_nerubian",9,-10],["scourge_abomination",-8,-6],["scourge_abomination",8,-6],
        ["scourge_deathknight",-5,-1],["scourge_deathknight",5,-1],["scourge_wyrm",0,6,3],["scourge_gargoyle",-10,7,3],["scourge_gargoyle",10,7,3],
        ["scourge_necromancer",-6,9],["scourge_banshee",-11,3],["scourge_banshee",11,3],["scourge_skeleton",-4,12],["scourge_skeleton",4,12],
        ["scourge_ghoul",-7,23],["scourge_ghoul",7,23]]},
    {id:"palacio_da_luz",name:"Palácio da Luz",order:"light",width:30,depth:25,height:33,
      aliases:["luz","light","exercito_dourado","naaru"],biomes:["planície florida","planície","prado alpino","bosque de cerejeiras","bosque lilás","savana"],
      actors:[["light_archon",0,-17,1],["light_naaru_warden",0,-11,2],["light_naaru",-10,-9,2],["light_naaru",10,-9,2],
        ["light_seraph",-8,-11],["light_seraph",8,-11],["light_warframe",0,-5],
        ["light_vindicator",-7,-2],["light_crusader",7,-2],
        ["light_sentinel",-5,2],["light_sentinel",5,2],["light_paladin",-7,8],["light_paladin",7,8],["light_valkyr",0,11,2],
        ["light_sentinel",-12,17],["light_sentinel",12,17],
        ["light_aurin",-12,-1],["light_aurin",12,-1],["light_aurin",-7,19],["light_aurin",7,19]]},
    {id:"templo_da_brasa_vil",name:"Templo da Brasa Vil",order:"fel",width:16,depth:16,height:25,
      aliases:["templo_demoníaco","templo_da_brasa"],biomes:["vulcânico","caldeira vítrea","badlands","chapadas ocres","deserto"],
      actors:[["fel_master",0,-9,1],["fel_eredar",-6,-7],["fel_felguard",-5,-4],["fel_guard",5,-4],["fel_succubus",-6,1],["fel_infernal",6,1],["fel_doomguard",0,2],
        ["fel_inquisitor",6,-6,2],["fel_hound",-5,7],["fel_hound",5,7],["fel_imp",-8,11],["fel_imp",8,11]]},
    {id:"templo_da_fenda_vil",name:"Templo da Fenda Vil",order:"fel",width:19,depth:19,height:26,
      aliases:["fel","supremo_demoníaco","templo_do_supremo"],biomes:["caldeira vítrea","vulcânico","badlands","cânion calcário","chapadas ocres"],
      actors:[["fel_supreme",0,-11,1],["fel_abyssal_lord",0,-5],["fel_master",-7,-6],["fel_eredar",7,-6],["fel_pitlord",0,2],["fel_doomguard",-9,-1],["fel_doomlord",9,-1],
        ["fel_inquisitor",-8,-9,2],["fel_felguard",7,1],["fel_succubus",-8,2],["fel_infernal",8,2],
        ["fel_guard",-6,8],["fel_hound",6,8],["fel_imp",-10,13],["fel_imp",10,13]]},
    {id:"circulo_druidico",name:"Comunidade Druida Xamânica",order:"druid",width:18,depth:18,height:22,
      aliases:["druida","druidas","xama","xamanico","circulo_druidico"],biomes:["floresta","planície florida","bosque de cerejeiras","bosque lilás","taiga","prado alpino"],
      actors:[["druid_archdruid",0,-5,1],["druid_shaman",-6,-3],["druid_shaman",6,-3],
        ["druid_shapeshifter",-7,4],["druid_shapeshifter",7,4],["druid_totemist",-4,9],["druid_totemist",4,9],
        ["nature_elemental",0,3,1],["wind_elemental",-10,0,2],["water_elemental",10,0,1]]},
    {id:"santuario_xamanico",name:"Santuário Xamânico dos Elementos",order:"druid",width:17,depth:17,height:22,
      aliases:["santuario_xamanico","aldeia_xamanica","comunidade_xamanica"],biomes:["montanha","cânion calcário","chapadas ocres","manguezal","campina de aurora"],
      actors:[["druid_shaman",0,-5,1],["druid_totemist",-6,-4],["druid_totemist",6,-4],
        ["druid_shaman",-7,3],["druid_shaman",7,3],["druid_shapeshifter",0,8],
        ["fire_elemental",-9,-1,1],["earth_elemental",9,-1,1],["lightning_elemental",0,-10,2]]},
    {id:"academia_dos_alquimistas",name:"Academia dos Alquimistas",order:"alchemist",width:14,depth:14,height:16,
      aliases:["academia_alquimica","ordem_dos_alquimistas","alquimistas"],
      biomes:["termas minerais","bosque de cristais","cânion calcário","chapadas ocres","planície"],
      actors:[["alchemist_master",0,-4],["alchemist_sentinel",-4,0],["alchemist_sentinel",4,0],
        ["alchemist_pyromancer",-7,5],["alchemist_pyromancer",7,5]]},
    {id:"posto_da_liga",name:"Posto da Liga dos Aldeões",order:"villager",width:14,depth:14,height:16,
      aliases:["liga_dos_aldeoes","posto_dos_aldeoes","milicia"],
      biomes:["planície","planície florida","floresta","savana","bosque de cerejeiras"],
      actors:[["villager_captain",0,-4],["villager_ranger",-4,0],["villager_ranger",4,0],
        ["villager_ranger",-7,5],["villager_ranger",7,5]]},
    grove.place,...divine.places
  ];
  const strike=(kind,name,range,windup,cooldown,damage,effects={})=>({kind,name,range,windup,cooldown,damage,...effects});
  const shot=(order,name,damage,effects={})=>strike("shot",name,13,.83,2.8,damage,{
    elemental:order,speed:13.5,color:colorNumber(orders[order].accent),...effects
  });
  function creature(order,name,form,radius,height,hp,walk,run,attack,loot,lore,extra={}){
    const peaceful=order==="light"||order==="druid"||order==="alchemist"||order==="villager";
    const temperament=peaceful?(attack?"neutral":"calm"):"hostile";
    return {order,name,form,radius,height,lore,...extra,profile:{hp,temperament,walk,run,sense:attack?16:0,roam:5,strike:attack,loot}};
  }
  const creatures={
    ...divine.creatures,
    scourge_skeleton:creature("scourge","Esqueleto Rúnico","skeleton",.39,1.95,36,1.22,2.85,
      strike("bite","Corte Rúnico",2.1,.52,1.62,9),[["death_rune",1,2,.76]],"Guerreiro esquelético do Flagelo com chama gélida entre as costelas, elmo com chifres, lâmina rúnica e escudo de ferro."),
    scourge_ghoul:creature("scourge","Carniçal da Geada","ghoul",.47,1.44,44,1.48,3.72,
      strike("lunge","Salto do Carniçal",1.98,.34,1.40,11),[["death_rune",1,2,.68]],"Morto-vivo encurvado com espinha exposta, mandíbula cheia de presas e garras compridas que salta sobre quem se aproxima da cidadela."),
    scourge_banshee:creature("scourge","Banshee do Véu Frio","wraith",.42,1.88,58,1.14,2.8,
      shot("scourge","Lamento da Banshee",12,{slow:1.6}),[["death_rune",1,3,1]],"Espectro flutuante envolto em véus translúcidos e chamas de alma. Seu grito gélido congela inimigos à distância."),
    scourge_abomination:creature("scourge","Abominação Costurada","brute",.74,2.57,118,.90,2.26,
      strike("slam","Cutelo e Gancho da Cripta",3.0,.80,2.45,22),[["death_rune",2,4,1]],"Colosso costurado de três braços com ventre aberto, cutelo gigante e gancho de ferro — a guarda pesada do Flagelo."),
    scourge_deathknight:creature("scourge","Cavaleiro da Morte","deathknight",.54,2.38,122,1.20,3.05,
      strike("slam","Golpe da Lâmina Rúnica",2.7,.52,1.88,20,{slow:1.4}),[["death_rune",2,4,1]],"Campeão blindado em aço saronítico com ombros de crânios, manto sombrio e espada rúnica gélida do Flagelo."),
    scourge_lich:creature("scourge","Lich do Trono Gelado","lich",.56,2.74,145,1.04,2.65,
      shot("scourge","Nova de Gelo Profana",18,{slow:2.0}),[["death_rune",3,5,1]],"Arquimago esquelético flutuante envolto em correntes saroníticas e filactério gélido que lança tempestades necromânticas."),
    scourge_wyrm:creature("scourge","Serpe Gélida","wyrm",.92,2.72,195,1.15,3.18,
      shot("scourge","Sopro da Geada Eterna",21,{slow:2.4}),[["death_rune",3,6,1]],"Dragão esquelético reanimado pelo Rei Lich com costelas expostas, chama de alma ciano no tórax e sopro congelante.",{flying:true}),
    scourge_nerubian:creature("scourge","Lorde da Cripta Nerubiano","nerubian",.86,2.68,188,1.04,2.68,
      strike("slam","Empalamento da Cripta",3.1,.70,2.22,23,{slow:1.6}),[["death_rune",3,5,1],["chitin",2,4,1]],"Colosso aracnídeo-escaravelho do Flagelo com quatro patas blindadas, mandíbulas rúnicas de gelo e carapaça dourada-saronita."),
    scourge_necromancer:creature("scourge","Necromante do Flagelo","necromancer",.46,2.24,102,1.08,2.65,
      shot("scourge","Seta Necrótica",15,{slow:1.4}),[["death_rune",2,4,1]],"Cultista encapuzado do Culto dos Malditos que empunha cajado de ossos e canaliza gelo profano com crânio espectral orbitante."),
    scourge_gargoyle:creature("scourge","Gárgula de Ébano","gargoyle",.56,2.20,112,1.32,3.42,
      shot("scourge","Rajada de Obsidiana Fria",14,{slow:1.2}),[["death_rune",2,3,1],["OBSIDIAN",1,2,.5]],"Predador alado de pedra viva e ossos gélidos que patrulha os céus sobre as cidadelas do Flagelo.",{flying:true}),
    lich_king:creature("scourge","Varkel, o Rei Lich","king",.90,3.3,720,0,1,null,[["death_rune",8,12,1],["lich_sigil",1,1,1]],
      "Coroado pelo Elmo da Dominação e empunhando sua lâmina rúnica congelante, o Rei Lich comanda os mortos-vivos da Cidadela de Gelo sob uma tempestade de estilhaços de gelo.",{
        anchored:true,range:22,phases:[{attack:"Anel da Profanação",pattern:"ring",damage:32,slow:2.4},
          {attack:"Marcha das Agulhas",pattern:"line",damage:40,slow:3.0},
          {attack:"Fúria de Gelo Eterno",pattern:"spores",damage:48,slow:3.6}]}),
    light_aurin:creature("light","Aurino","orb",.46,1.65,42,.90,2.15,null,[],"Ser cristalino menor da Luz: estilhaços dourados flutuantes giram em harmonia ao redor de um coração radiante.",{sanityAura:true}),
    light_naaru:creature("light","Naaru Primevo (A'dalion)","naaru",.78,3.15,240,1.02,2.45,
      shot("light","Hino Radiante de Naaru",21),[["gold_nugget",2,4,.8],["crystal_shard",2,4,.8]],"Ser primordial de pura Luz cristalina em forma de sinos geométricos flutuantes. Sua canção restaura a sanidade de exploradores próximos e dissipa visões dos Deuses Antigos.",{flying:true,sanityAura:true}),
    light_naaru_warden:creature("light","Naaru da Aurora (X'erael)","naaruWarden",.92,3.62,310,.96,2.35,
      shot("light","Julgamento de Luz Primordial",26),[["gold_nugget",3,6,.9],["crystal_shard",3,5,.9]],"Naaru ancião de doze lâminas cristalinas e halos sagrados duplos. Protege o Palácio da Luz e anula completamente a loucura dos sussurros abissais ao seu redor.",{flying:true,sanityAura:true}),
    light_vindicator:creature("light","Vindicante Draeneico","vindicator",.60,2.48,155,1.16,2.92,
      strike("slam","Martelo dos Naaru",2.85,.56,1.95,22),[["gold_nugget",1,3,.65]],"Campeão blindado em cristal ametista e ouro sagrado empunhando o colossal Martelo de Cristal dos Naaru."),
    light_crusader:creature("light","Cruzado da Alvorada","crusader",.56,2.42,142,1.18,2.98,
      strike("slam","Alabarda Solar",2.95,.52,1.88,20),[["gold_nugget",1,3,.65]],"Templário alado de elmo solar, grande escudo-torre dourado e alabarda flamejante que marcha na linha de frente da Luz."),
    light_seraph:creature("light","Serafim de Âmbar","seraph",.54,2.61,84,1.08,2.58,
      shot("light","Lança da Aurora",15),[],"Guerreira alada do Exército Dourado com asas luminosas de energia sagrada, halo duplo e lança solar."),
    light_sentinel:creature("light","Sentinela Áurea","sentinel",.56,2.26,105,1.18,2.92,
      strike("slam","Julgamento Solar",2.7,.56,1.95,17),[],"Constructo cristalino forjado pela Luz com núcleo flutuante no peito, lâmina solar e égide dourada."),
    light_paladin:creature("light","Templário Forjado à Luz","paladin",.56,2.36,112,1.16,2.95,
      strike("slam","Martelo da Alvorada",2.65,.54,1.92,19),[["gold_nugget",1,2,.55]],"Paladino forjado à Luz em armadura dourada-marfim com chifres serenos, brasão frontal radiante e martelo de guerra sagrado."),
    light_valkyr:creature("light","Val'kyr da Alvorada","valkyr",.54,2.58,128,1.22,3.15,
      strike("slam","Lâmina do Julgamento",2.8,.48,1.82,18),[["gold_nugget",1,3,.65]],"Guerreira celestial flutuante de asas douradas translúcidas, elmo alado, espada solar e escudo radiante.",{flying:true}),
    light_warframe:creature("light","Exoesqueleto Forjado à Luz","warframe",.84,3.22,185,.94,2.42,
      shot("light","Canhão Solar Forjado",20),[["gold_nugget",2,4,.85]],"Colosso mecânico de mármore e ouro energizado pela Luz com núcleo cristalino no peito e canhões solares nos ombros."),
    light_archon:creature("light","Arconte da Primeira Luz","archon",.80,3.3,620,0,1,null,
      [["gold_nugget",18,25,1],["DAWN_GOLD",5,8,1],["light_sigil",1,1,1]],
      "Soberano celestial de seis asas luminosas que rege o Palácio da Luz. Destrói a linha inimiga com rajadas solares.",
      {sanityAura:true,anchored:true,range:22,phases:[
        {attack:"Estrela da Alvorada",pattern:"disk",damage:29},
        {attack:"Feixe do Meio-Dia",pattern:"line",damage:38},
        {attack:"Coroa Solar",pattern:"ring",damage:46}]}),
    fel_imp:creature("fel","Diabrete Vil","imp",.34,1.22,32,1.44,3.35,
      shot("fel","Bola de Fogo Vil",8,{fel:8}),[["fel_ember",1,2,.78]],"Demônio pequeno com chifres curvos, orelhas pontudas, cauda farpada e chamas verdes crepitando nas garras."),
    fel_hound:creature("fel","Cão da Fenda","hound",.50,1.31,62,1.52,3.78,
      strike("lunge","Mordida Devoradora de Mana",2.1,.32,1.52,13,{fel:11}),[["fel_ember",1,3,1]],"Fera demoníaca com mandíbula cheia de presas e dois longos tentáculos dorsais que farejam mana e espalham Fel."),
    fel_felguard:creature("fel","Guarda Vil (Mo'arg)","felguard",.62,2.62,138,1.16,3.02,
      strike("slam","Cutelo Duplo Vil",2.9,.58,2.05,21,{fel:14}),[["fel_ember",2,4,1]],"Soldado de choque da Legião de pele escarlate, ombreiras cravejadas de crânios e machado duplo flamejante de Fel."),
    fel_inquisitor:creature("fel","Inquisidor Vil","inquisitor",.50,2.35,130,1.15,2.85,
      shot("fel","Raio Ocular Vil",18,{fel:15}),[["fel_ember",2,5,1]],"Conjurador demoníaco flutuante em manto sombrio cercado por três globos oculares flamejantes que drenam energia vital.",{flying:true}),
    fel_eredar:creature("fel","Lorde Eredar (Man'ari)","eredar",.68,3.05,198,1.10,2.88,
      shot("fel","Chama Caótica Man'ari",23,{fel:19}),[["fel_ember",3,6,1]],"Bruxo demoníaco supremo de pele rubra, chifres arqueados, runas de Fel orbitando às costas e cajado de fogo caótico."),
    fel_abyssal_lord:creature("fel","Lorde Abissal (Supremus)","abyssalLord",.96,3.55,265,.92,2.42,
      strike("slam","Erupção Abissal",3.55,.78,2.45,29,{fel:22}),[["fel_ember",4,8,1],["OBSIDIAN",2,4,1]],"Titã vulcânico abissal envolto em chamas azul-esmeralda e fogo vil, com caixa torácica oca flamejante e monólitos flutuantes nos ombros."),
    fel_guard:creature("fel","Guardião Abissal","guard",.65,2.76,126,1.08,2.82,
      strike("slam","Cutelo da Legião",3.05,.72,2.30,21,{fel:16}),[["fel_ember",2,4,1]],"Brutamontes demoníaco de chifres taurinos, cascos blindados e machado colossal em chamas verdes de Fel."),
    fel_succubus:creature("fel","Inquisidora Shivarra","shivarra",.58,2.82,118,1.24,3.22,
      strike("lunge","Dança das Quatro Lâminas",2.65,.38,1.52,17,{fel:12}),[["fel_ember",2,4,1]],"Demônia guerreira de quatro braços e coroa de chifres que retalha o campo de batalha com quatro cimitarras de Fel."),
    fel_infernal:creature("fel","Infernal da Fenda","infernal",.78,2.96,165,.96,2.45,
      strike("slam","Punho de Rocha Vil",3.05,.74,2.32,24,{fel:16}),[["fel_ember",2,5,1]],"Golias de rochas vulcânicas negras que cai dos céus em um meteoro de chamas verdes de Fel para esmagar inimigos."),
    fel_doomguard:creature("fel","Demonarca da Legião","doomguard",.78,3.15,190,1.08,2.92,
      strike("slam","Lâmina da Ruína",3.25,.64,2.08,25,{fel:17}),[["fel_ember",3,5,1]],"Guerreiro demonarca alado de elite da Legião com chifres colossais, armadura de ferro negro acorrentada e lâmina curva da ruína em chamas de Fel."),
    fel_doomlord:creature("fel","Lorde Demonarca","doomlord",.86,3.42,235,1.02,2.75,
      shot("fel","Seta da Ruína",23,{fel:20}),[["fel_ember",4,7,1]],"Comandante demonarca supremo de asas flamejantes, quatro chifres e braseiros de Fel nos ombros que dispara setas da ruína."),
    fel_master:creature("fel","Maestra da Brasa Vil","master",.66,2.85,330,1.08,2.55,
      shot("fel","Raio da Legião Vil",29,{fel:22}),[["fel_ember",7,12,1],["FEL_LANTERN",2,3,1]],"Senhora demoníaca alada de gola pontiaguda e cajado ritual que canaliza chamas vis nos templos da Legião."),
    fel_pitlord:creature("fel","Senhor do Abismo","pitlord",.96,3.38,210,.92,2.55,
      strike("slam","Glaive do Aniquilador",3.35,.78,2.40,26,{fel:18}),[["fel_ember",3,6,1]],"Titã demoníaco quadrúpede de presas gigantes, asas rasgadas e glaive dupla de Fel — general implacável da Legião."),
    fel_supreme:creature("fel","Zarveth, o Supremo da Fenda","supreme",1.12,4.1,790,0,1,null,[["fel_ember",9,14,1],["fel_sigil",1,1,1]],
      "Soberano demoníaco colossal de chifres gigantes, asas de morcego em brasa verde e glaive vil que rasga fissuras da Legião pela câmara central.",{
        anchored:true,range:23,phases:[{attack:"Ruptura da Legião",pattern:"line",damage:35,fel:25},
          {attack:"Fenda Incandescente",pattern:"ring",damage:44,fel:30},
          {attack:"Chuva Infernal",pattern:"spores",damage:52,fel:38}]}),
    druid_archdruid:creature("druid","Arquidruida Xamã","archdruid",.58,2.52,480,1.25,3.35,
      shot("druid","Chamado Elemental",32,{slow:2}),[["elemental_core",8,12,1],["crystal_shard",6,10,1],["druid_sigil",1,1,1]],
      "Ancião do Círculo Druídico Xamânico coroado por galhadas luminosas. Conversa com os elementos e se transforma em urso ou elemental durante rituais e batalhas.",{
        communion:true,sanityAura:true,shapeshiftPool:["bear","nature_elemental","fire_elemental","wind_elemental"]}),
    druid_shaman:creature("druid","Xamã dos Elementos","shaman",.50,2.24,132,1.22,3.10,
      shot("druid","Raio Xamânico",16),[["elemental_core",1,1,.6],["wind_essence",1,2,.7]],
      "Mediador xamânico que dialoga com espíritos de fogo, água, raio e vento. Pode assumir a forma de lobo espiritual ou de um elemental furioso.",{
        communion:true,shapeshiftPool:["wolf","fire_elemental","water_elemental","lightning_elemental"]}),
    druid_shapeshifter:creature("druid","Druida Metamorfo","shapeshifter",.48,2.18,140,1.26,3.30,
      strike("lunge","Garra Selvagem",2.45,.42,1.55,18),[["hide",2,3,.7],["elemental_core",1,1,.45]],
      "Mestre da metamorfose natural do Círculo. Alterna livremente entre forma druídica, urso, lobo, onça, cervo ou coruja conforme o combate.",{
        communion:true,shapeshiftPool:["bear","wolf","jaguar","deer","owl"]}),
    druid_totemist:creature("druid","Totemista do Círculo","totemist",.54,2.30,152,1.12,2.78,
      strike("slam","Impacto do Totem Elemental",2.8,.56,1.95,21),[["elemental_core",1,2,.7]],
      "Guardião que carrega totens elementais talhados nas costas, comunga com a terra e o gelo e se funde em elementais sólidos para defender a comunidade.",{
        communion:true,shapeshiftPool:["earth_elemental","ice_elemental","water_elemental","nature_elemental"]}),
    alchemist_master:creature("alchemist","Mestre da Transmutação","alchemistGuard",.56,2.23,490,1.08,3.0,
      shot("alchemist","Ruptura Catalítica",34,{slow:2}),[["alchemy_sigil",1,1,1],["bronze_ingot",10,16,1],["glow_solution",6,10,1]],
      "Representante do Conselho dos Alquimistas. Defende a Academia lançando cápsulas de transmutação."),
    alchemist_pyromancer:creature("alchemist","Alquimista Pirotécnico","alchemistGuard",.48,2.15,124,1.18,2.95,
      shot("alchemist","Frasco Catalítico",17,{slow:1.1}),[["glow_solution",1,2,.75],["crystal_shard",1,2,.65]],
      "Defensor de campo da Ordem dos Alquimistas equipado com máscara filtrante e bandoleira de frascos reativos."),
    alchemist_sentinel:creature("alchemist","Constructo Alquímico","alchemistGolem",.70,2.55,175,.98,2.52,
      strike("slam","Êmbolo de Latão",2.85,.62,2.05,22),[["bronze_ingot",2,3,.8],["glow_solution",1,2,.7]],
      "Autômato de latão e vidro pressurizado movido por núcleo luminescente, construído pela Ordem dos Alquimistas."),
    villager_captain:creature("villager","Capitão da Milícia","villagerCaptain",.52,2.24,440,1.22,3.18,
      strike("slam","Alabarda da Vila",3.5,.54,1.66,35),[["village_sigil",1,1,1],["iron_ingot",10,16,1],["bread",8,12,1]],
      "Comandante blindado da Liga dos Aldeões que empunha alabarda de aço e escudo com o brasão da vila."),
    villager_ranger:creature("villager","Patrulheiro da Vila","villagerRanger",.46,2.10,115,1.28,3.25,
      shot("villager","Flecha do Patrulheiro",15),[["arrow",4,8,.85],["hide",1,2,.6]],
      "Batedor ágil da Liga dos Aldeões que vigia estradas, plantações e caravanas contra invasões.")
  };

  for(const [id,tree] of Object.entries(QuimiCraftMounts.trees)){
    const size=QuimiCraftMounts.treeDimensions(tree);
    creatures[id]={...tree,order:grove.order,form:"livingTree",radius:size.radius,height:size.height,
      profile:QuimiCraftMounts.treeProfile(tree),lore:tree.story??tree.line};
  }

  const materials=[
    ["FROST_CITADEL","Tijolo de Geada",[57,79,109],"iceBrick"],
    ["FROST_RUNE","Monólito de Morte",[21,209,248],"deathRune",8],
    ["FROST_SPIRE","Gelo das Agulhas",[126,218,251],"ice"],
    ["DAWN_MARBLE","Mármore da Alvorada",[246,232,189],"marble"],
    ["DAWN_GOLD","Liga Dourada",[215,151,46],"bullion"],
    ["HOLY_LIGHT","Farol de Luz Sagrada",[255,231,136],"beacon",12],
    ["FEL_BRICK","Basalto Vil",[58,47,65],"basalt"],
    ["FEL_GROUND","Crosta de Fel",[88,139,42],"crust"],
    ["FEL_LANTERN","Brasa Vil",[153,246,56],"ember",9],
    ["DRUID_RUNESTONE","Pedra Rúnica Druídica",[72,126,88],"runestone"],
    ["DRUID_TOTEM","Totem Elemental Vivo",[112,240,164],"totem",13]
  ];
  const finishes={
    scourge:[
      ["FROST_PILLAR","Coluna de Saronita Gélida",[73,113,151],"pillar"],
      ["FROST_MOSAIC","Mosaico do Trono Gelado",[106,160,190],"mosaic"],
      ["FROST_BRAZIER","Braseiro da Alma Fria",[111,212,255],"light",10,"frostBrazier"]
    ],
    light:[
      ["DAWN_PILLAR","Coluna de Mármore Solar",[239,204,137],"pillar"],
      ["DAWN_MOSAIC","Mosaico da Alvorada",[199,145,66],"mosaic"],
      ["DAWN_LANTERN","Lanterna da Primeira Luz",[255,203,100],"light",12,"dawnLantern"]
    ],
    fel:[
      ["FEL_PILLAR","Coluna de Obsidiana Vil",[70,52,74],"pillar"],
      ["FEL_MOSAIC","Mosaico da Fenda Vil",[102,134,57],"mosaic"],
      ["FEL_BRAZIER","Braseiro da Legião",[182,246,64],"light",12,"felTripod"]
    ],
    druid:[
      ["DRUID_PILLAR","Tronco Entalhado do Círculo",[119,94,64],"pillar"],
      ["DRUID_MOSAIC","Mosaico das Raízes",[91,132,78],"mosaic"],
      ["DRUID_LANTERN","Lanterna dos Espíritos",[121,246,151],"light",10,"spiritPod"]
    ],
    alchemist:[
      ["ALCHEMIST_PILLAR","Coluna de Latão Alquímico",[181,130,73],"pillar"],
      ["ALCHEMIST_MOSAIC","Mosaico da Transmutação",[56,142,145],"mosaic"],
      ["ALCHEMIST_LANTERN","Luminária Catalítica",[68,233,210],"light",11,"catalystLamp"]
    ],
    villager:[
      ["LEAGUE_PILLAR","Viga do Posto da Liga",[157,96,56],"pillar"],
      ["LEAGUE_MOSAIC","Brasão da Liga",[186,146,87],"mosaic"],
      ["LEAGUE_LANTERN","Lampião da Liga",[255,169,73],"light",10,"leagueLantern"]
    ]
  };
  const materialOrders=Object.fromEntries(Object.entries(finishes).flatMap(([order,rows])=>rows.map(([key])=>[key,order])));
  materials.push(...Object.values(finishes).flat());
  const items={
    death_rune:["Runa de Morte","#6cd6f5","Extraída dos monólitos da Cidadela de Gelo ou recolhida dos mortos-vivos do Flagelo."],
    lich_sigil:["Selo de Varkel","#9dbbff","Troféu concedido ao derrotar o Rei Lich na Cidadela de Gelo."],
    fel_ember:["Fragmento de Brasa Vil","#9ee852","Recolhido de demônios ou extraído das brasas dos templos. Usado para criar o Cajado de Fel."],
    fel_sigil:["Selo de Zarveth","#cdf85d","Troféu concedido ao derrotar o Supremo da Fenda."],
    light_sigil:["Selo da Primeira Luz","#ffdb7a","Troféu do Arconte no Palácio da Luz."],
    druid_sigil:["Selo do Círculo","#79e3a4","Troféu do Arquidruida na Comunidade Druida Xamânica."],
    alchemy_sigil:["Selo da Transmutação","#79eadd","Troféu do mestre na Academia dos Alquimistas."],
    village_sigil:["Selo da Liga","#eeb673","Troféu do capitão no Posto da Liga."]
  };
  const recipes=B=>[
    {name:"Runas de Morte",need:[[B.FROST_RUNE,1]],out:["death_rune",3]},
    {name:"Fragmentos de Brasa Vil",need:[[B.FEL_LANTERN,1]],out:["fel_ember",3]},
    ...Object.entries(finishes).flatMap(([order,rows])=>{
      const base={scourge:B.FROST_CITADEL,light:B.DAWN_MARBLE,fel:B.FEL_BRICK,
        druid:B.DRUID_RUNESTONE,alchemist:B.ALCHEMY_BRICK,villager:B.VILLAGE_BRICK}[order];
      return rows.map(([key,name,,,light])=>({name,need:light?[[base,2],[B.GLOWSTONE,1]]:[[base,4]],out:[B[key],light?2:4]}));
    })
  ];
  const tiles=new Map();
  const rgbHex=rgb=>"#"+colorNumber(rgb).toString(16).padStart(6,"0");
  function colorNumber([r,g,b]){return (r<<16)+(g<<8)+b}
  function register(B,defs){
    materials.forEach(([key,name,color,style,range,model],index)=>{
      const id=index<10?700+index:index===10?716:750+index-11;
      const tile=index<9?239+index:index<11?254+index-9:265+index-11;
      B[key]=id;
      defs[id]={name,icon:rgbHex(color),solid:!model,partial:!!model,tex:tile,hard:range?1.05:1.72};
      if(model){
        const base=265+Math.floor((index-11)/3)*3;
        defs[id].factionDecor={model,tile,base,trim:base+1,range};
      }
      tiles.set(tile,{color,style,group:materialOrders[key]});
    });
  }
  const tileColor=tile=>tiles.get(tile)?.color;
  const carvings={
    scourge:(x,y,u,v)=>Math.min(u,v)<1.6||Math.abs(u-v)<1.2&&u<11,
    light:(x,y,u,v)=>Math.abs(Math.hypot(u,v)-8)<1.5||Math.min(u,v)<1.7&&Math.max(u,v)<12,
    fel:(x,y,u,v)=>Math.abs(u+v-12)<1.3||v<7&&Math.abs(u-5)<1.4,
    druid:(x,y,u,v)=>Math.abs(Math.sin(x*.29+y*.24))*3<v*.18&&v<12||Math.min(u,v)<1,
    alchemist:(x,y,u,v)=>Math.abs(Math.max(v,u*.78+v*.48)-8)<1.6||u<2&&v<2,
    villager:(x,y,u,v)=>v<7&&Math.abs(u+v*.42-7)<1.6||u<8&&v<1
  };
  function paint(tile,x,y,hash){
    const entry=tiles.get(tile);
    if(!entry)return null;
    const {color,style,group}=entry,noise=(hash(x,y,tile)-.5)*16;
    const u=Math.abs(x-15.5),v=Math.abs(y-15.5),edge=Math.max(u,v);
    const vein=Math.abs(Math.sin(x*.31+y*.37+Math.sin(y*.29)*1.55));
    const facet=Math.sin((x+y*.6)*.51)*12+Math.sin((x-y*.3)*.23)*12;
    let shade=0,pigment=color;
    switch(style){
      case "iceBrick": {
        const seam=(x+Math.floor(y/16)*8)%16;
        shade=y%16<2||seam===0?-42:y%16<5||seam===1?29:facet*.55;
        break;
      }
      case "marble":
        shade=vein<.15?-58:vein<.31?-24:facet*.42;
        break;
      case "basalt": {
        const joint=(x+Math.floor(y/11)*13)%24;
        shade=y%11<2||joint===0?-36:y%11===2?17:facet+noise;
        break;
      }
      case "runestone":
        pigment=Math.abs(u+v-9)<1.3||u<1&&v<8?[143,179,116]:color;
        shade=edge>13?-25:vein<.2?19:facet*.72;
        break;
      case "ice":
        shade=Math.abs(Math.sin(x*.84+y*.4))<.24?46:facet*1.6;
        break;
      case "bullion":
        shade=edge>14?-49:edge>11?38:Math.abs(Math.sin(x*.39-y*.63))<.19?26:-8;
        break;
      case "crust":
        pigment=vein<.21?[158,181,67]:[50,82,38];
        shade=facet*.6;
        break;
      case "ember": {
        const seam=Math.abs(x-10-y*.30-Math.sin(y*.75)*2.6);
        const fork=Math.abs(x-22+y*.28-Math.sin(y*.42)*1.5);
        pigment=seam<1.2||y>9&&fork<1.25?[183,248,71]:seam<2.7||y>9&&fork<2.4?[62,112,27]:[26,21,32];
        shade=facet*.48;
        break;
      }
      case "deathRune":
        pigment=v<12&&(u<1.7||Math.abs(v-u-3)<1.3&&u<7)?color:[33,46,78];
        shade=edge>13?24:facet*.65;
        break;
      case "beacon": {
        const radii=Math.hypot(u,v);
        pigment=radii<6.5||Math.min(u,v)<1.3&&edge<11?[255,245,179]:radii<9?[184,111,34]:[91,60,48];
        shade=edge>13?43:facet;
        break;
      }
      case "totem":
        pigment=v<11&&Math.abs(Math.sin(y*.35+x*.65))*5<u*.42&&u<10?color:[48,67,47];
        shade=edge>13?32:Math.cos(x*.62)*18;
        break;
      case "pillar":
        shade=v>12?32:u>14?-37:Math.sin(x*(group==="light"?.91:.52))*17;
        break;
      case "mosaic":
        shade=edge>13?-50:carvings[group](x,y,u,v)?54:((x>>3)+(y>>3))%2?0:-22;
        break;
      default: shade=facet+(edge>13?-29:5);
    }
    return [...pigment.map(value=>value+noise+shade),255];
  }

  const vaultSupplies=B=>({
    scourge:[[B.FROST_CITADEL,20],[B.FROST_MOSAIC,12],["death_rune",8],[B.IRON,6],["crystal_shard",7]],
    light:[[B.DAWN_MARBLE,24],[B.DAWN_MOSAIC,12],["gold_nugget",12],[B.DAWN_GOLD,6],["crystal_shard",8]],
    fel:[[B.FEL_BRICK,24],[B.FEL_MOSAIC,12],["fel_ember",12],[B.OBSIDIAN,8],[B.SULFUR,6]],
    druid:[[B.DRUID_RUNESTONE,18],[B.DRUID_MOSAIC,12],["elemental_core",5],["honey",6],["wind_essence",7]],
    alchemist:[[B.ALCHEMY_BRICK,24],[B.ALCHEMIST_MOSAIC,12],["bronze_ingot",10],["glow_solution",7],["crystal_shard",8]],
    villager:[[B.VILLAGE_BRICK,24],[B.LEAGUE_MOSAIC,12],["iron_ingot",8],["bread",12],["arrow",30]]
  });
  const interiors={
    light:{
      hall:["DAWN_CANDLE_ALTAR","DAWN_HYMN_LECTERN","DAWN_MEDAL_RACK","DAWN_CHAIN_CENSER","DAWN_MORNING_FOUNTAIN"],
      quarters:["DAWN_COURT_BENCH","DAWN_HONOR_AMPHORA"],
      workshop:["DAWN_OATH_ASTROLABE","DAWN_SOLAR_DIAL","DAWN_SPEAR_DISPLAY"],station:"METAL_FORGE"
    },
    scourge:{
      hall:["FROST_CANDLE_TREE","FROST_CHAIN_POST","FROST_BONE_CLAW","FROST_CRYPT_OBELISK"],
      quarters:["FROST_ICEFUNERAL_CHEST","FROST_GRAVE_MARKER","FROST_HOURGLASS","FROST_OSSUARY_SKULL"],
      workshop:["FROST_BONE_RACK","FROST_CRYO_CAGE","FROST_CHAIN_POST"],station:"FURNACE"
    },
    fel:{
      hall:["FEL_OATH_TABLE","FEL_BROKEN_GATE","FEL_FANG_PLAQUE","FEL_METEOR_DISPLAY"],
      quarters:["FEL_EMBER_CAGE","FEL_FANG_PLAQUE","FEL_BRIMSTONE_COIL"],
      workshop:["FEL_INFERNAL_ANVIL","FEL_FORGE_BELLOWS","FEL_FURNACE_MANIFOLD","FEL_CHAIN_HOOK"],station:"METAL_FORGE"
    },
    druid:{
      hall:["DRUID_STAG_CARVING","DRUID_BIRCH_BENCH","DRUID_CAIRN_SPIRAL","DRUID_MOON_WELL"],
      quarters:["DRUID_MOON_SEED_POT","DRUID_WICKER_REFUGE","DRUID_BIRD_PERCH"],
      workshop:["DRUID_STONE_MORTAR","DRUID_HERB_DRYER","DRUID_WOVEN_HIVE"]
    },
    alchemist:{
      hall:["ALCHEMIST_ATOM_MODEL","ALCHEMIST_PRISM_READER","ALCHEMIST_MANOMETER"],
      quarters:["ALCHEMIST_LUMINOUS_CHAMBER","ALCHEMIST_INDICATOR_WHEEL"],
      workshop:["ALCHEMIST_DESK_MICROSCOPE","ALCHEMIST_COPPER_COIL","ALCHEMIST_TONG_CRUCIBLE","ALCHEMIST_PIPETTE_STAND","ALCHEMIST_TUBE_MANIFOLD"],
      station:"LAB"
    },
    villager:{
      hall:["LEAGUE_BAKERY_SHELF","LEAGUE_COURIER_BOX","LEAGUE_BARREL_STACK","LEAGUE_WATER_TROUGH"],
      quarters:["LEAGUE_WICKER_BASKET","LEAGUE_BARREL_STACK"],
      workshop:["LEAGUE_MARKET_LOOM","LEAGUE_COBBLER_STAND","LEAGUE_FISH_RACK","LEAGUE_FLOUR_SACKS","LEAGUE_SMALL_CART"],
      station:"FURNACE"
    }
  };
  const turns=[[0,1],[1,0],[0,-1],[-1,0]];
  function point(site,u,v){
    const [dx,dz]=turns[site.turn];
    return [site.x+u*dz+v*dx,site.z-u*dx+v*dz];
  }
  function create({B,seed,hash,terrain,biome,water,maxY,origin,blocked,overlap}){
    const sites=[],layouts=[...places,...dragonLairs.places];
    let initialized=false;
    const rand=(x,z,salt)=>hash(x,z,seed%15485863+salt);
    function makeSite(layout,x,z,turn,check,recordedExpansion){
      const {width:w,depth:d,height}=layout;
      const site={id:"faction:"+layout.id,layout,x,z,turn,actors:[],treasures:new Map()};
      function boundsFor(u1,v1,u2,v2){
        const corners=[u1,u2].flatMap(u=>[v1,v2].map(v=>point(site,u,v)));
        return {left:Math.min(...corners.map(p=>p[0])),right:Math.max(...corners.map(p=>p[0])),
          front:Math.min(...corners.map(p=>p[1])),rear:Math.max(...corners.map(p=>p[1]))};
      }
      function available(bounds){
        if(overlap(bounds,(bounds.left+bounds.right)/2,(bounds.front+bounds.rear)/2))return false;
        for(let px=bounds.left;px<=bounds.right;px+=5)for(let pz=bounds.front;pz<=bounds.rear;pz+=5){
          if(blocked(px,pz))return false;
        }
        return true;
      }
      const expanded=layout.order===grove.order||layout.divine||layout.flight?false:recordedExpansion??(check||
        [boundsFor(-w-16,-d-4,-w-5,d+10),boundsFor(w+5,-d-4,w+16,d+10),
          boundsFor(-w-4,-d-11,w+4,-d-5)].every(available));
      const bounds=layout.order===grove.order?boundsFor(-grove.reach,-grove.reach,grove.reach,d+12):
        expanded?boundsFor(-w-16,-d-11,w+16,d+12):boundsFor(-w-4,-d-4,w+4,d+12);
      const base=terrain(x,z),entrance=point(site,0,d+11),approach=terrain(...entrance);
      if(base<water+2||approach<water||base+height>=maxY-1||Math.abs(base-approach)>5)return null;
      const ground=Array.from({length:3},(_,i)=>[-1,0,1].map(side=>terrain(...point(site,side*(w-2),(i-1)*(d-2))))).flat();
      if(Math.min(...ground)<water||Math.max(...ground)-Math.min(...ground)>21)return null;
      if(check){
        if(sites.some(other=>Math.hypot(x-other.x,z-other.z)<220||
          (bounds.left<=other.bounds.right+24&&bounds.right>=other.bounds.left-24&&
          bounds.front<=other.bounds.rear+24&&bounds.rear>=other.bounds.front-24))||!available(bounds))return null;
      }
      const y=base;
      site.y=y;site.bounds=bounds;site.expanded=expanded;site.region=biome(x,z);site.approach=approach;
      const localLoot=layout.order===grove.order?grove.loot:[[-6,d-5],[6,d-5]];
      if(expanded){
        for(const side of [-1,1])localLoot.push([side*(w+10),-d+5],[side*(w+10),d-3]);
        localLoot.push([0,-d-7]);
      }
      const supplies=layout.flight?dragonLairs.supplies(layout.flight,B):layout.divine?divine.supplies(layout.order,B):
        layout.order===grove.order?[["honey",5],["berries",4],[B.CANOPY_PLANK,4],[B.CANOPY_LANTERN,1]]:vaultSupplies(B)[layout.order];
      for(const [index,[u,v]] of localLoot.entries()){
        const [tx,tz]=point(site,u,v),ty=y+1;
        const items=supplies.map(([id,count],i)=>[id,count+(index===localLoot.length-1?Math.ceil(count*.35):Math.floor(rand(tx,tz,i+390)*4))]);
        site.treasures.set(tx+"|"+ty+"|"+tz,{name:layout.flight?layout.name:`Baú de ${orders[layout.order].name}`,items,u,v});
      }
      site.mouth={x:entrance[0]+.5,y:approach+1,z:entrance[1]+.5};
      const actors=layout.divine?divine.actorsForSite(layout,rand(x,z,340)):layout.actors;
      for(const [index,[type,u,v,rise=0]] of actors.entries()){
        const [ax,az]=point(site,u,v);
        site.actors.push({id:site.id+":"+index,type,x:ax+.5,y:y+rise+1,z:az+.5});
      }
      const recruits=patrolRosters[layout.order]?.filter(type=>type!==leaders[layout.order].type);
      const guards=layout.order===grove.order||layout.divine||layout.flight?[]:expanded?[
        [-w-7,-d+7],[-w-11,-d+1],[-w-10,-4],[-w-7,4],[-w-10,d-2],[-w-6,d+5],
        [w+7,-d+7],[w+11,-d+1],[w+10,-4],[w+7,4],[w+10,d-2],[w+6,d+5],[-5,-d-7],[5,-d-7]
      ]:[[-8,d-3],[8,d-3],[-4,d],[4,d]];
      for(const [i,[u,v]] of guards.entries()){
        const [ax,az]=point(site,u,v),type=recruits[i%recruits.length];
        site.actors.push({id:site.id+":guard:"+i,type,x:ax+.5,y:y+1,z:az+.5});
      }
      return site;
    }
    function initialize(saved){
      if(initialized)return;
      initialized=true;
      for(const row of Array.isArray(saved)?saved:[]){
        if(!Array.isArray(row)||row.length<4||row.length>5)continue;
        const [id,x,z,turn,expanded]=row,layout=layouts.find(place=>place.id===id);
        if(!layout||sites.some(site=>site.layout===layout)||![x,z,turn].every(Number.isSafeInteger)||!turns[turn]||
          Math.abs(x-origin.x)>10500||Math.abs(z-origin.z)>10500)continue;
        const site=makeSite(layout,x,z,turn,false,typeof expanded==="boolean"?expanded:undefined);
        if(site)sites.push(site);
      }
      for(const layout of layouts){
        if(sites.some(site=>site.layout===layout))continue;
        // Prefer the appropriate biome, then use suitable terrain if the preferred biomes are too far away.
        for(let ring=6;ring<=128;ring++){
          const candidates=[];
          for(let i=-ring;i<ring;i++)for(const [gx,gz] of [[i,-ring],[ring,i],[-i,ring],[-ring,-i]]){
            const x=origin.x+gx*78+Math.floor(rand(gx,gz,47)*31)-15;
            const z=origin.z+gz*78+Math.floor(rand(gx,gz,68)*31)-15;
            const rank=layout.biomes.indexOf(biome(x,z));
            if(rank<0&&ring<26)continue;
            candidates.push({x,z,score:Math.hypot(gx,gz)+(rank<0?18:rank*.65)});
          }
          candidates.sort((a,b)=>a.score-b.score);
          let site=null;
          for(const {x,z} of candidates){
            const order=[0,1,2,3].sort((a,b)=>{
              const toward=([dx,dz])=>(origin.x-x)*dx+(origin.z-z)*dz;
              return toward(turns[b])-toward(turns[a]);
            });
            for(const turn of order){
              site=makeSite(layout,x,z,turn,true);
              if(site)break;
            }
            if(site){sites.push(site);break}
          }
          if(site)break;
        }
      }
    }
    function blueprint(site){
      const columns=new Map(),{layout,y}=site,{width:w,depth:d,order}=layout;
      const routines=QuimiCraftFactionRoutines;
      site.routineRooms=[];
      const ice=order==="scourge",holy=order==="light",fel=order==="fel",druid=order==="druid",alchemist=order==="alchemist",villager=order==="villager";
      const wallHeight=holy?11:ice?9:8;
      const [wall,trim,lamp,floor]=ice?[B.FROST_CITADEL,B.FROST_SPIRE,B.FROST_RUNE,B.SLATE]:holy?
        [B.DAWN_MARBLE,B.DAWN_GOLD,B.HOLY_LIGHT,B.DAWN_MARBLE]:druid?
        [B.DRUID_RUNESTONE,B.WOOD,B.DRUID_TOTEM,B.MOSS]:alchemist?
        [B.ALCHEMY_BRICK,B.BRONZE_BLOCK,B.GLOWSTONE,B.MARBLE]:villager?
        [B.VILLAGE_BRICK,B.WOOD,B.GLOWSTONE,B.PLANK]:order===grove.order?
          [B.CANOPY_BARK,B.CANOPY_ROOT,B.CANOPY_LANTERN,B.CANOPY_PLANK]:[B.FEL_BRICK,B.OBSIDIAN,B.FEL_LANTERN,B.BASALT];
      const key=(u,v)=>u+","+v;
      function column(u,v){
        const id=key(u,v);
        if(!columns.has(id))columns.set(id,{blocks:[],top:0});
        return columns.get(id);
      }
      function box(u1,a1,v1,u2,a2,v2,block){
        for(let v=v1;v<=v2;v++)for(let u=u1;u<=u2;u++){
          const c=column(u,v),top=y+a2;
          for(let at=Math.max(1,y+a1);at<=Math.min(maxY-2,top);at++)c.blocks[at]=block;
          c.top=Math.max(c.top,Math.min(maxY-2,top));
        }
      }
      function platform(u,v,level,block,foundation=wall){
        const ground=terrain(...point(site,u,v)),c=column(u,v);
        const top=Math.min(maxY-2,Math.max(ground,level+8));
        for(let at=Math.max(1,Math.min(ground,level-2));at<=top;at++)
          c.blocks[at]=at<level?foundation:at===level?block:B.AIR;
        c.top=Math.max(c.top,top);
      }
      if(layout.divine||layout.flight){
        if(layout.divine)divine.buildTemple(B,site,platform,box);
        else dragonLairs.build(B,site,platform,box);
        for(const {u,v} of site.treasures.values())box(u,1,v,u,1,v,B.EXPEDITION_CHEST);
        return columns;
      }
      if(order===grove.order){
        grove.build(B,site,point,platform,box);
        for(let v=27;v<=d+11;v++)for(let u=-2;u<=2;u++)
          platform(u,v,y+Math.round((site.approach-y)*(v-27)/(d+11-27)),B.CANOPY_PATH);
        for(const {u,v} of site.treasures.values())box(u,1,v,u,1,v,B.EXPEDITION_CHEST);
        return columns;
      }
      const [pillar,mosaic,sconce]=finishes[order].map(([key])=>B[key]);
      const roomSlots=[[-2,-2],[2,-2],[-2,2],[2,2],[-2,-1],[2,-1],[-2,1],[2,1],[-1,-2],[1,-2]];
      const occupied=new Set(site.actors.map(actor=>key(Math.floor(actor.x),Math.floor(actor.z))));
      function openForFurniture(u,v,level){
        const [x,z]=point(site,u,v),at=y+level,blocks=columns.get(key(u,v))?.blocks;
        return blocks?.[at]===B.AIR&&blocks[at+1]===B.AIR&&blocks[at-1]>B.AIR&&
          blocks[at-1]!==B.WATER&&blocks[at-1]!==B.LAVA&&
          !occupied.has(key(x,z))&&!site.treasures.has(x+"|"+at+"|"+z);
      }
      function decorate(slots,level,pieces){
        const free=slots.filter(([u,v])=>openForFurniture(u,v,level));
        const count=Math.min(free.length,pieces.length);
        for(let i=0;i<count;i++){
          const [u,v]=free[i];
          box(u,level,v,u,level,v,B[pieces[i]]);
        }
        return count;
      }
      function furnishRoom(u,v,level,kind,{hasStation=false,wing=0,entry=[u,v+4]}={}){
        const bedU=u-2;
        if(kind==="quarters"&&!ice&&openForFurniture(bedU,v+2,level)&&openForFurniture(bedU,v+1,level)){
          const [x,z]=point(site,bedU,v+2);
          const [foot,head]=QuimiCraftSurvival.bedParts(B,{x,y:y+level,z},3-site.turn);
          box(bedU,level,v+2,bedU,level,v+2,foot.id);
          box(bedU,level,v+1,bedU,level,v+1,head.id);
        }
        const station=B[interiors[order].station];
        if(kind==="workshop"&&station&&!hasStation&&openForFurniture(u,v-2,level))
          box(u,level,v-2,u,level,v-2,station);
        const pieces=interiors[order][kind];
        const displayed=alchemist&&hasStation&&kind==="workshop"?
          decorate([[u-2,v-2],[u+2,v-2]],level+1,pieces.slice(0,2)):0;
        decorate(roomSlots.map(([x,z])=>[u+x,v+z]),level,pieces.slice(displayed));
        const lighting=[[u+2,v-1],[u-2,v-1],[u+1,v-2]].find(([x,z])=>openForFurniture(x,z,level));
        if(lighting){
          const [x,z]=lighting;
          box(x,level+3,z,x,level+3,z,sconce);
        }
        routines.addChamber(site,point,kind,wing,u,y+level,v,entry);
      }
      function sideRoom(sign,kind){
        const u=sign*w,v=-2;
        for(let x=u-3;x<=u+3;x++)for(let z=v-3;z<=v+3;z++)
          platform(x,z,y,Math.abs(x-u)===3||Math.abs(z-v)===3?pillar:floor);
        box(u-3,1,v-3,u+3,4,v+3,wall);
        box(u-2,1,v-2,u+2,4,v+2,B.AIR);
        box(u-3,5,v-3,u+3,5,v+3,trim);
        const curtain=sign*(w-2);
        box(curtain,6,v-3,curtain,wallHeight,v+3,wall);
        const door=u-3*sign;
        box(door,1,v-1,door,3,v+1,B.AIR);
        box(door,4,v-1,door,4,v+1,pillar);
        const naveEdge=sign*(holy?12:ice?11:7);
        box(Math.min(door,naveEdge),1,v-1,Math.max(door,naveEdge),3,v+1,B.AIR);
        furnishRoom(u,v,1,kind,{entry:[u-4*sign,v]});
      }
      function finish(){
        if(site.expanded){
          for(const s of [-1,1]){
            const l=s<0?-w-14:w+1,r=s<0?-w-1:w+14,u=s*(w+9);
            for(let v=-d-1;v<=d+8;v++)for(let x=l;x<=r;x++){
              platform(x,v,y,Math.abs(x-u)<=1||v%8===0?mosaic:floor);
            }
            const outside=s*(w+14);
            box(outside,1,-d-1,outside,3,d+8,wall);
            for(let v=-d;v<=d+8;v+=5)box(outside,4,v,outside,4,v,pillar);
            for(const v of [-d+5,d-3]){
              const wide=ice||holy||fel,h=holy?11:ice?10:fel?9:7;
              const depth=wide?5:4;
              for(const x of [u-4,u+4])box(x,1,v-depth,x,h-1,v+depth,wall);
              box(u-4,1,v-depth,u+4,h-1,v-depth,wall);
              box(u-4,1,v+depth,u-2,h-1,v+depth,wall);
              box(u+2,1,v+depth,u+4,h-1,v+depth,wall);
              box(u-1,h-2,v+depth,u+1,h-1,v+depth,pillar);
              box(u-4,h,v-depth,u+4,h,v+depth,pillar);
              for(let tier=1;tier<=3;tier++)box(u-4+tier,h+tier,v-depth,u+4-tier,h+tier,v+depth,trim);
              box(u,h+4,v,u,h+4,v,sconce);
              for(const x of [u-3,u+3])box(x,2,v+depth+1,x,2,v+depth+1,sconce);
              if(alchemist)box(u-3,2,v-depth,u+3,4,v-depth,B.GLASS);
              if(druid)box(u-3,h+1,v-depth+1,u+3,h+1,v+depth-1,B.LEAVES);
              if(villager)box(u+2,1,v-2,u+2,1,v,B.FURNACE);
              furnishRoom(u,v,1,v===-d+5?"quarters":"workshop",{hasStation:villager,wing:s,entry:[u,v+depth+1]});
            }
            for(let x=Math.min(s*(w-1),u);x<=Math.max(s*(w-1),u);x++)for(let v=d+3;v<=d+5;v++)
              platform(x,v,y,mosaic);
            const passage=druid?3:alchemist||villager?0:5;
            const inside=s*(w-4),outsideEdge=s*(w+2);
            for(let x=Math.min(inside,outsideEdge);x<=Math.max(inside,outsideEdge);x++){
              for(let v=passage-1;v<=passage+1;v++){
                box(x,0,v,x,0,v,mosaic);
                box(x,1,v,x,3,v,B.AIR);
              }
            }
            routines.addPassage(site,point,s,s*(w+3),y+1,passage);
          }
          for(let v=-d-10;v<=-d-1;v++)for(let u=-8;u<=8;u++)platform(u,v,y,Math.abs(u)<3?mosaic:floor);
          for(const u of [-8,8]){
            box(u,1,-d-10,u,4,-d-1,wall);
            box(u,5,-d-9,u,7,-d-9,pillar);
            box(u,8,-d-9,u,8,-d-9,sconce);
          }
          box(-8,1,-d-10,8,4,-d-10,wall);
        }
        if(ice||holy||fel){
          sideRoom(-1,"quarters");
          sideRoom(1,"workshop");
        }
        const display=QuimiCraftFactionBuilding.display(B,order);
        for(const side of [-1,1]){
          const center=side*8;
          for(const [u,level,v,id] of display){
            const x=center+u,z=d+3+v;
            if(level===0)platform(x,z,y,id);
            else box(x,level,z,x,level,z,id);
          }
          for(let u=-2;u<=2;u++)for(let v=2;v<=3;v++)platform(center+u,d+3+v,y,floor);
          for(const [u,v,id] of QuimiCraftFactionBuilding.courtyard(B,order,side))
            box(center+u,1,d+3+v,center+u,1,d+3+v,id);
        }
        for(const {u,v} of site.treasures.values()){
          box(u,0,v,u,0,v,mosaic);
          box(u,1,v,u,1,v,B.EXPEDITION_CHEST);
          box(u,2,v,u,3,v,B.AIR);
        }
        return columns;
      }
      if(druid){
        // Organic Druid-Shaman Stone Circle, Elemental Totem Pillars & Timber/Moss Lodges!
        const R=w-2;
        for(let v=-R;v<=R;v++)for(let u=-R;u<=R;u++){
          const dist=Math.hypot(u,v);
          if(dist>R+.5)continue;
          const ring=Math.abs(dist-10)<1.1||Math.abs(dist-4.5)<.9;
          platform(u,v,y,ring?wall:dist<4?B.GRASS:floor);
        }
        for(let v=R+1;v<=d+11;v++)for(let u=-2;u<=2;u++){
          const level=y+Math.round((site.approach-y)*(v-R)/Math.max(1,d+11-R));
          platform(u,v,level,Math.abs(u)===2?wall:B.PLANK);
        }
        // Central Elemental Communion Altar (Fire/Water/Earth/Wind/Nature totems around glowing hearth!)
        box(-2,1,-2,2,1,2,wall);
        box(-1,2,-1,1,2,1,B.DRUID_TOTEM);
        box(0,3,0,0,5,0,B.DRUID_TOTEM);
        const elemRifts=[B.RIFT_FIRE,B.RIFT_WATER,B.RIFT_EARTH,B.RIFT_WIND,B.RIFT_NATURE,B.RIFT_LIGHTNING].filter(Number.isInteger);
        for(let i=0;i<6;i++){
          const ang=i*(Math.PI/3),tx=Math.round(Math.cos(ang)*10),tz=Math.round(Math.sin(ang)*10);
          box(tx,1,tz,tx,5,tz,wall);
          box(tx,6,tz,tx,7,tz,elemRifts[i%elemRifts.length]||lamp);
          // Arching timber pergola lintels on north side
          if(tz<0){box(tx,1,tz-1,tx,4,tz-1,B.WOOD);box(tx-1,5,tz-1,tx+1,6,tz+1,B.LEAVES)}
        }
        const lodges=[[-11,-9,"quarters"],[11,-9,"workshop"],[0,-13,"hall"]];
        for(const [lx,lz,kind] of lodges){
          for(let u=lx-3;u<=lx+3;u++)for(let v=lz-3;v<=lz+3;v++)platform(u,v,y,B.PLANK);
          for(const sx of [-3,3])box(lx+sx,1,lz-3,lx+sx,4,lz+3,B.WOOD);
          box(lx-3,1,lz-3,lx+3,4,lz-3,B.WOOD);
          box(lx-3,1,lz+3,lx+3,4,lz+3,B.PLANK);
          box(lx-1,1,lz+3,lx+1,3,lz+3,B.AIR);
          box(lx-3,5,lz-3,lx+3,5,lz+3,B.PLANK);
          box(lx-4,6,lz-4,lx+4,6,lz+4,B.LEAVES);
          box(lx-2,7,lz-2,lx+2,7,lz+2,B.MOSS);
          box(lx,8,lz,lx,8,lz,lamp);
          furnishRoom(lx,lz,1,kind);
        }
        // Bioluminescent flora accents inside the sacred grove
        for(const [fx,fz] of [[-5,5],[5,5],[-6,-1],[6,-1],[0,7]]){
          box(fx,1,fz,fx,1,fz,B.LUMEN_FLOWER||B.POPPY);
        }
        return finish();
      }
      for(let v=-d;v<=d+6;v++)for(let u=-w;u<=w;u++){
        const vein=fel&&v>d-3&&Math.abs(u)>3&&rand(site.x+u,site.z+v,79)>.48;
        const line=holy?Math.abs(u)===4:ice?Math.abs(u)===3:Math.abs(u)===4;
        platform(u,v,y,vein?B.FEL_GROUND:line?trim:floor);
      }
      for(let v=d+7;v<=d+11;v++)for(let u=-3;u<=3;u++){
        const level=y+Math.round((site.approach-y)*(v-d-6)/5);
        platform(u,v,level,Math.abs(u)===3?trim:floor);
      }
      if(alchemist||villager){
        for(const u of [-w,w])box(u,1,-d,u,2,d,wall);
        box(-w,1,-d,w,2,-d,wall);
        for(const u of [-8,0,8]){
          const v=-8;
          box(u-3,1,v-4,u+3,4,v+3,wall);
          box(u-2,1,v-3,u+2,3,v+2,B.AIR);
          box(u-1,1,v+3,u+1,3,v+3,B.AIR);
          box(u-4,5,v-5,u+4,5,v+4,trim);
          box(u-3,6,v-4,u+3,6,v+3,alchemist?B.GLASS:trim);
          box(u,7,v,u,7,v,lamp);
          if(alchemist){
            if(u>=0)box(u-2,1,v-2,u+2,1,v-2,B.LAB);
            else box(u-2,1,v-3,u-2,1,v-3,B.CHEST);
            box(u-1,2,v-4,u+1,3,v-4,B.GLASS);
          }else{
            box(u-2,1,v-2,u+2,1,v-2,B.CHEST);
            box(u-2,1,v-3,u+2,1,v-3,B.FURNACE);
          }
          furnishRoom(u,v,1,u<0?"quarters":u>0?"workshop":"hall",{hasStation:true});
        }
        for(const u of [-10,10]){
          box(u-2,0,7,u+2,0,12,alchemist?B.ALCHEMY_BRICK:B.DIRT);
          for(let v=7;v<=12;v+=2)box(u,1,v,u,1,v,alchemist?B.CRYSTAL:B.TALL_GRASS);
          box(u,1,15,u,4,15,trim);
          box(u,5,15,u,5,15,lamp);
        }
        return finish();
      }
      const gate=holy?4:3;
      const front=d-2,back=-d+2,side=w-2;
      for(const u of [-side,side])box(u,1,back,u,wallHeight,front,wall);
      for(const v of [back,front])box(-side,1,v,side,wallHeight,v,wall);
      box(-gate,1,front,gate,7,front,B.AIR);
      box(-gate-1,8,front,gate+1,8,front,trim);
      for(let u=-side;u<=side;u+=3){
        if(Math.abs(u)<=gate+1)continue;
        for(const v of [front,back])box(u,wallHeight+1,v,u,wallHeight+(holy?1:2),v,trim);
      }
      for(const sign of [-1,1]){
        const u=sign*(gate+1);
        box(u,1,front,u,7,front,trim);
        box(u,4,front+1,u,4,front+1,lamp);
        for(const at of [-1,1]){
          const tx=sign*(side-2),tz=at*(d-4),h=ice?18:holy?23:14;
          box(tx-2,1,tz-2,tx+2,h,tz+2,wall);
          box(tx-3,h-1,tz-3,tx+3,h,tz+3,trim);
          box(tx-1,h+1,tz-1,tx+1,h+3,tz+1,trim);
          box(tx,h+4,tz,tx,h+6,tz,lamp);
        }
      }

      const nave=holy?14:ice?13:11,entrance=holy?8:ice?6:5,ceiling=holy?19:ice?15:13;
      for(const u of [-nave,nave])box(u,1,back,u,ceiling,entrance,wall);
      box(-nave,1,back,nave,ceiling,back,wall);
      box(-nave,1,entrance,nave,ceiling,entrance,wall);
      box(-4,1,entrance,4,9,entrance,B.AIR);
      box(-5,10,entrance,5,10,entrance,trim);
      box(-nave,ceiling,back,nave,ceiling,entrance,trim);
      for(let level=1;level<=(holy?10:7);level++){
        const width=nave-level;
        box(-width,ceiling+level,back+level,width,ceiling+level,entrance-level,level%3===0?wall:trim);
      }
      const crown=holy?ceiling+10:ceiling+7,middle=ice?-11:holy?-14:-8;
      box(-2,crown+1,middle-2,2,crown+2,middle+2,wall);
      box(0,crown+3,middle,0,crown+(ice?8:holy?4:5),middle,lamp);
      for(const sign of [-1,1]){
        for(let v=back+3;v<entrance;v+=5){
          const u=sign*nave;
          box(u,4,v,u,ceiling-3,v,holy?B.AIR:trim);
          box(u,7,v,u,8,v,lamp);
          const col=sign*(nave-3);
          box(col,1,v,col,ceiling-1,v,wall);
          box(col,3,v,col,3,v,lamp);
          if(holy)box(sign*(nave-5),0,v,sign*(nave-5),0,v,lamp);
        }
        if(fel)for(let v=-5;v<=entrance+5;v+=4){
          for(let depth=-1;depth<=1;depth++)for(let side=-1;side<=1;side++){
            const u=sign*7+side;
            if(rand(site.x+u,site.z+v+depth,87)>.23)box(u,0,v+depth,u,0,v+depth,B.FEL_GROUND);
          }
          box(sign*9,1,v,sign*9,2,v,lamp);
        }
      }
      if(holy){
        for(const sign of [-1,1])for(let v=11;v<=21;v+=5){
          const u=sign*18;
          box(u-2,0,v-1,u+2,0,v+1,B.GRASS);
          box(u,1,v,u,1,v,B.POPPY);
          box(u,1,v+1,u,1,v+1,B.WHITE_FLOWER);
          const col=sign*23;
          box(col-1,1,v-1,col+1,1,v+1,trim);
          box(col,2,v,col,9,v,wall);
          box(col-1,10,v-1,col+1,10,v+1,trim);
          box(col,11,v,col,11,v,lamp);
        }
        box(-3,0,13,3,0,16,lamp);
      }else if(ice){
        for(const sign of [-1,1])for(const [u,v,h] of [[11,19,8],[14,21,6],[18,22,10]]){
          const x=sign*u;
          box(x-1,1,v-1,x+1,2,v+1,wall);
          box(x,3,v,x,h,v,trim);
          box(x,h+1,v,x,h+1,v,lamp);
        }
      }
      const throne=layout.actors[0][2];
      box(-4,1,throne-3,4,1,throne+2,holy?lamp:trim);
      box(-3,2,throne-3,3,4,throne-3,wall);
      box(-2,5,throne-3,2,5,throne-3,trim);
      box(0,6,throne-3,0,7,throne-3,lamp);
      for(const sign of [-1,1]){
        box(sign*4,2,throne-3,sign*4,3,throne-3,lamp);
        box(sign*8,1,entrance+3,sign*8,2,entrance+3,lamp);
      }
      if(layout.id==="templo_da_fenda_vil"){
        for(let a=2;a<=11;a++){
          const x=Math.round(Math.sin(a*1.13)*1.4);
          box(x-1,a,throne-4,x+1,a,throne-4,a%4===0?B.FEL_GROUND:lamp);
        }
        for(const sign of [-1,1]){
          box(sign*4,4,throne-4,sign*4,9,throne-4,trim);
          box(Math.min(sign*4,sign*2),10,throne-4,Math.max(sign*4,sign*2),10,throne-4,trim);
        }
      }
      const edge=nave-1,mid=Math.round((back+entrance)/2),rear=back+4;
      const hallSlots=[[-edge,entrance-2],[edge,entrance-3],[-edge,mid],[edge,mid-1],
        [-edge,rear],[edge,rear+1],[-edge,rear+2],[edge,entrance-4]];
      decorate(hallSlots,1,interiors[order].hall);
      routines.addRoom(site,point,"hall",0,y+1,[[-3,entrance-2],[3,entrance-2],[-3,mid],[3,mid],[0,entrance-3]],
        null,[0,entrance+1]);
      return finish();
    }
    function at(x,z,margin=0){
      return sites.find(({bounds:b})=>x>=b.left-margin&&x<=b.right+margin&&z>=b.front-margin&&z<=b.rear+margin);
    }
    function columnAt(x,z){
      const site=at(x,z);
      if(!site)return null;
      const [dx,dz]=turns[site.turn],rx=x-site.x,rz=z-site.z;
      site.columns??=blueprint(site);
      return site.columns.get((rx*dz-rz*dx)+","+(rx*dx+rz*dz))??null;
    }
    function treasureAt(x,y,z){return at(x,z)?.treasures.get(x+"|"+y+"|"+z)??null}
    function isLeaderHome(actor){
      const leader=leaders[actor.faction?.order],site=actor.factionSite;
      if(!leader||leader.type!==actor.type||!site||site.layout.id!==leader.home||actor.siteActor!==site.actors[0].id)return false;
      const [dx,dz]=turns[site.turn],rx=actor.x-site.x-.5,rz=actor.z-site.z-.5;
      return Math.abs(rx*dz-rz*dx)<=site.layout.width-2&&Math.abs(rx*dx+rz*dz)<=site.layout.depth-2&&
        actor.y>=site.y-.5&&actor.y<=site.y+site.layout.height;
    }
    return {initialize,column:columnAt,at,treasureAt,isLeaderHome,list:()=>sites.filter(site=>!site.layout.flight),
      lairs:()=>sites.filter(site=>site.layout.flight),
      save:()=>sites.map(({layout,x,z,turn,expanded})=>[layout.id,x,z,turn,expanded]),
      nearby:(x,z,radius)=>sites.filter(site=>!site.layout.flight&&Math.hypot(site.x-x,site.z-z)<=radius)};
  }

  function lights(B){
    return materials.filter(row=>row[4]).map(([key,,color,,range,model])=>[B[key],{color:colorNumber(color),range,height:model ? .57 : 1.05,steady:true}]);
  }
  return {orders,orderMeta,leaders,materialOrders,patrolRosters,invasionRosters,orderRewards,elementalDialogues,spiritReplies,places,creatures,items,recipes,register,paint,tileColor,create,lights};
})();
