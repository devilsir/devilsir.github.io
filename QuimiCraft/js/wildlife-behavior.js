"use strict";

globalThis.QuimiCraftWildlifeBehavior=(()=>{
  const landDiets={
    maned_wolf:["rabbit","flower_hare","rufous_bellied_thrush","three_banded_armadillo","chicken"],
    hoary_fox:["rabbit","flower_hare","rufous_bellied_thrush","chicken"],
    harpy_eagle:["golden_lion_tamarin","coati","green_iguana","opossum","three_banded_armadillo"],
    wolf:["deer","forest_deer","pampas_deer","rabbit","snow_hare","flower_hare","wild_boar","sheep","mountain_goat"],
    lynx:["snow_hare","rabbit","flower_hare","lilac_songbird","rufous_bellied_thrush"],
    rime_fox:["snow_hare","rabbit"],
    fennec:["rabbit","salt_marsh_rabbit","chicken"],
    jaguar:["capivara","mangrove_capivara","cacao_tapir","wild_boar","three_banded_armadillo","green_iguana","caiman"],
    tiger:["forest_deer","deer","wild_boar","cacao_tapir"],
    lion:["savanna_gazelle","wild_boar","bison","greater_rhea","pampas_deer"],
    brown_bear:["deer","forest_deer","wild_boar","rabbit"],
    black_bear:["rabbit","forest_deer","wild_boar"],
    owl:["rabbit","flower_hare","salt_marsh_rabbit","lilac_songbird"],
    frost_owl:["snow_hare","rabbit"],
    polar_bear:["ringed_seal","harbor_seal","weddell_seal"],
    badger:["rabbit","salt_marsh_rabbit","grass_snake","pit_viper"],
    opossum:["pit_viper","grass_snake","chicken"],
    coati:["green_iguana","pit_viper","chicken"],
    pit_viper:["rabbit","flower_hare","salt_marsh_rabbit","rufous_bellied_thrush"],
    grass_snake:["rabbit","flower_hare","lilac_songbird"],
    cat:["rabbit","rufous_bellied_thrush","lilac_songbird"]
  };
  const landRivals={
    wolf:["brown_bear","black_bear","lynx"],
    brown_bear:["wolf","tiger","black_bear"],
    black_bear:["wolf","brown_bear"],
    lion:["hippopotamus","rhinoceros","tiger"],
    tiger:["brown_bear","lion"],
    jaguar:["caiman"],
    hippopotamus:["caiman","lion"],
    elephant:["rhinoceros","lion"]
  };
  const landResidents={
    "planície":["bison","rabbit","cow","sheep","chicken"],"planície florida":["flower_hare","bison","deer","cow","sheep"],
    "prado alpino":["mountain_goat","snow_hare","deer","frost_owl"],montanha:["mountain_goat","deer","brown_bear","lynx"],
    taiga:["deer","snow_hare","wolf","lynx","brown_bear"],tundra:["snow_hare","rime_fox","frost_owl"],
    "fiordes glaciais":["snow_hare","rime_fox","frost_owl"],"campina de aurora":["snow_hare","rime_fox","frost_owl","lynx"],
    floresta:["forest_deer","rabbit","wild_boar","owl","wolf","black_bear"],"bosque lilás":["lilac_songbird","forest_deer","rabbit","owl","opossum"],
    "bosque de cerejeiras":["forest_deer","wild_boar","rabbit","black_bear"],"floresta de sequoias":["forest_deer","wild_boar","owl","black_bear"],
    "selva tropical":["cacao_tapir","capivara","jaguar","anteater","opossum"],savana:["savanna_gazelle","lion"],
    "pântano":["capivara","jaguar","marsh_heron","opossum"],manguezal:["mangrove_capivara","marsh_heron","jaguar","opossum"],
    "delta salobro":["salt_marsh_rabbit","marsh_heron","amber_ibis","mangrove_capivara"],salinas:["salt_marsh_rabbit","amber_ibis","fennec"],
    deserto:["fennec"],"cânion calcário":["mountain_goat","badger","fennec"],"chapadas ocres":["mountain_goat","anteater","savanna_gazelle"],
    badlands:["fennec","savanna_gazelle"],"termas minerais":["badger","deer"],"bosque de cristais":["crystal_heron"],
    "caldeira vítrea":["scoria_ram"],vulcânico:["scoria_ram"]
  };
  const social={
    wolf:["Matilha",2,4],lion:["Bando",2,4],fennec:["Grupo familiar",2,3],pig:["Vara",2,4],wild_boar:["Vara",2,4],
    cow:["Rebanho",2,5],sheep:["Rebanho",2,5],bison:["Manada",3,5],chicken:["Bando",2,4],deer:["Manada",2,4],
    forest_deer:["Manada",2,4],savanna_gazelle:["Manada",3,5],capivara:["Grupo",3,5],mangrove_capivara:["Grupo",3,5],
    mountain_goat:["Rebanho",2,4],scoria_ram:["Rebanho",2,4],rabbit:["Colônia",2,4],lilac_songbird:["Bando",2,3],
    amber_ibis:["Bando",2,3],elephant:["Manada matriarcal",2,4],hippopotamus:["Grupo ribeirinho",2,4],
    golden_lion_tamarin:["Grupo familiar",2,4],toco_toucan:["Bando",2,3],hyacinth_macaw:["Casal",2,2],
    jabiru:["Casal",2,2],greater_rhea:["Bando",2,4],coati:["Bando",2,4],pampas_deer:["Grupo",2,3],
    hoary_fox:["Casal",2,2],lumen_moth:["Enxame",2,3]
  };
  const landFoods={
    cow:"Capim, trevos e brotos",sheep:"Gramíneas e ervas rasteiras",rabbit:"Ervas, raízes e brotos",
    flower_hare:"Flores campestres, ervas e brotos",snow_hare:"Brotos de tundra, cascas e líquens",
    salt_marsh_rabbit:"Vegetação costeira e gramíneas halófitas",bison:"Gramíneas de pradaria",
    savanna_gazelle:"Capim novo e folhas de arbustos",mountain_goat:"Líquens, musgos e arbustos alpinos",
    scoria_ram:"Gramíneas resistentes e líquens vulcânicos",capivara:"Gramíneas e plantas aquáticas",
    mangrove_capivara:"Brotos de mangue e gramíneas",deer:"Folhas, brotos e arbustos",
    forest_deer:"Folhas, brotos, fungos e cascas",brown_bear:"Peixes, frutos, raízes e pequenos mamíferos",
    black_bear:"Frutas, brotos, insetos e pequenos vertebrados",wild_boar:"Raízes, frutos, fungos e invertebrados",
    pig:"Raízes, frutos e invertebrados",cacao_tapir:"Folhas, ramos e frutos caídos",
    anteater:"Formigas e cupins",chicken:"Sementes, grãos e insetos",opossum:"Frutos, ovos, insetos e serpentes",
    dog:"Onívoro (carnes e vegetais)",cat:"Pequenos vertebrados",polar_bear:"Focas-aneladas e mamíferos marinhos",
    marsh_heron:"Peixes, camarões e anfíbios",crystal_heron:"Peixes e crustáceos rasos",
    amber_ibis:"Invertebrados do lodo e pequenos peixes",lilac_songbird:"Sementes, néctar e insetos",
    maned_wolf:"Frutos do cerrado (lobeira) e pequenos vertebrados",hoary_fox:"Cupins, frutos e pequenos vertebrados",
    toco_toucan:"Frutos, sementes, insetos e ovos",hyacinth_macaw:"Coquinhos de palmeiras e sementes duras",
    rufous_bellied_thrush:"Frutos maduros, minhocas e insetos",jabiru:"Peixes, moluscos e répteis aquáticos",
    golden_lion_tamarin:"Frutos, néctar, insetos e pequenos lagartos",coati:"Frutos, ovos, insetos e pequenos répteis",
    green_iguana:"Folhas, flores e brotos",three_banded_armadillo:"Formigas, cupins e larvas",
    greater_rhea:"Folhas, sementes, frutos e insetos",elephant:"Gramíneas, folhas, ramos e cascas",
    rhinoceros:"Gramíneas curtas da savana",hippopotamus:"Gramíneas ribeirinhas pastadas à noite",
    pampas_deer:"Ervas, gramíneas e brotos",badger:"Invertebrados, raízes, roedores e serpentes",
    iron_armadillo:"Insetos, larvas e raízes minerais",lumen_moth:"Néctar noturno e esporos de fungos",
    jaguar:"Capivaras, antas, javalis, tatus e jacarés",tiger:"Cervos, javalis e grandes herbívoros",
    lion:"Gazelas, bisões, javalis e grandes presas",wolf:"Cervos, javalis, lebres e ovelhas",
    lynx:"Lebres, coelhos e aves pequenas",rime_fox:"Lebres-da-neve, roedores e bagas",
    fennec:"Insetos, pequenos roedores, ovos e frutos",owl:"Roedores, coelhos e pequenas aves",
    frost_owl:"Lebres-da-neve e pequenos mamíferos",harpy_eagle:"Primatas arborícolas, quatis, iguanas e saruês",
    grass_snake:"Anfíbios, pequenos roedores e aves",pit_viper:"Roedores, coelhos e pequenos vertebrados",
    cave_spider:"Insetos e pequenos animais de caverna",venom_spider:"Insetos e presas paralisadas com peçonha",
    scorpion:"Insetos, aracnídeos e pequenos répteis",glass_scorpion:"Insetos e presas de rochas vulcânicas",
    pyrite_crawler:"Invertebrados de galeria e presas de emboscada"
  };
  const grazers=new Set(["cow","sheep","deer","forest_deer","bison","savanna_gazelle","mountain_goat",
    "scoria_ram","rabbit","snow_hare","flower_hare","salt_marsh_rabbit","capivara","mangrove_capivara",
    "cacao_tapir","elephant","rhinoceros","hippopotamus","pampas_deer","green_iguana"]);
  const herds=new Set(["cow","sheep","deer","forest_deer","bison","savanna_gazelle","mountain_goat","scoria_ram",
    "capivara","mangrove_capivara","elephant","hippopotamus","pampas_deer"]);
  const groundForagers=new Set(["chicken","pig","wild_boar","opossum","anteater","brown_bear","black_bear","badger",
    "amber_ibis","lilac_songbird","fennec","marsh_heron","crystal_heron","coati","three_banded_armadillo",
    "greater_rhea","rufous_bellied_thrush","iron_armadillo","jabiru","hoary_fox"]);
  const landRetaliators=new Set(["elephant","rhinoceros","hippopotamus","bison","wild_boar","anteater",
    "mountain_goat","scoria_ram","badger","brown_bear","black_bear","polar_bear","jaguar","tiger","lion",
    "wolf","opossum","iron_armadillo","maned_wolf","harpy_eagle","pit_viper","grass_snake","scorpion",
    "glass_scorpion","pyrite_crawler","cave_spider","venom_spider"]);
  const groupDefenders=new Set(["elephant","bison","hippopotamus","wild_boar","wolf","lion"]);
  const landPreyTypes=new Set(Object.values(landDiets).flat());

  const fishDiet=["raw_fish","raw_sardine","raw_mullets","raw_carp","raw_perch","raw_pacu","raw_tilapia",
    "raw_char","raw_whitefish","raw_pike","raw_trout","raw_seabass","raw_bream","raw_loach","raw_sole","piranha"];
  const smallFish=["raw_sardine","raw_mullets","raw_fish","raw_loach","raw_shrimp","shrimp_pink","shrimp_seabob","shrimp_white"];
  const waterDiets={
    dolphin:[...fishDiet,"coastal_squid"],
    pink_boto:fishDiet,
    reef_shark:[...fishDiet,"common_octopus","coastal_squid","ray","harbor_seal"],
    caiman:[...fishDiet,"piranha","raw_pacu","shrimp_pitu"],
    piranha:["raw_fish","raw_pacu","raw_tilapia","raw_loach","shrimp_pitu"],
    weddell_seal:["antarctic_toothfish","coastal_squid","raw_char","raw_whitefish"],
    minke:["antarctic_krill","raw_sardine"],
    humpback:["antarctic_krill","raw_sardine","raw_mullets"],
    leatherback:["moon_jelly","sea_nettle","jelly"],
    jelly:["zooplankton","antarctic_krill"],
    raw_pike:["raw_fish","raw_perch","raw_carp","raw_loach","raw_bream"],
    raw_seabass:["raw_sardine","raw_mullets","shrimp_pink","shrimp_white"],
    raw_trout:["raw_loach","raw_shrimp","zooplankton"],
    raw_catfish:["raw_loach","shrimp_pitu","raw_fish"],
    raw_eel:["raw_loach","raw_shrimp","shrimp_pink","raw_fish"],
    raw_perch:["raw_loach","raw_shrimp","zooplankton"],
    antarctic_toothfish:["antarctic_krill","coastal_squid","raw_whitefish"],
    patagonian_toothfish:["coastal_squid","antarctic_krill","raw_seabass"],
    ray:["shrimp_pink","shrimp_seabob","shrimp_white","rock_mussel"],
    venom_ray:["shrimp_pink","shrimp_seabob","shrimp_white","rock_mussel"],
    pufferfish:["rock_mussel","shrimp_seabob","zooplankton"],
    seahorse_red:["zooplankton","shrimp_seabob"],
    seahorse_gold:["zooplankton","shrimp_seabob"],
    raw_pacu:["waterweed"],
    raw_tilapia:["waterweed","phytoplankton"],
    raw_carp:["waterweed","zooplankton"]
  };
  const waterRivals={
    dolphin:["reef_shark"],
    humpback:["orca","orca_b"],
    sperm_whale:["orca"],
    caiman:["green_anaconda"],
    green_anaconda:["caiman"]
  };
  const planktonEaters=new Set(["minke","humpback","blue_whale","fin_whale","sei_whale","southern_right_whale",
    "common_minke","brydes_whale","jelly","moon_jelly","sea_nettle","raw_sardine","raw_mullets",
    "raw_whitefish","raw_char","raw_shrimp","raw_bream","raw_fish","raw_sole","raw_emberfish",
    "shrimp_pink","shrimp_seabob","shrimp_white","shrimp_pitu","seahorse_red","seahorse_gold"]);
  const inkDefenders=new Set(["giant_squid","colossal_squid","coastal_squid","common_octopus"]);

  // Intraspecific behavior: "peaceful", "territorial", or "cannibalistic"
  const sameSpeciesMap={
    // Solitary territorial predators & big herbivores (spar/chase rivals away)
    tiger:"territorial",jaguar:"territorial",brown_bear:"territorial",black_bear:"territorial",
    lynx:"territorial",badger:"territorial",rhinoceros:"territorial",anteater:"territorial",
    harpy_eagle:"territorial",owl:"territorial",frost_owl:"territorial",maned_wolf:"territorial",
    hippopotamus:"territorial",bison:"territorial",wild_boar:"territorial",mountain_goat:"territorial",
    scoria_ram:"territorial",lion:"territorial",green_iguana:"territorial",
    // Cannibalistic or aggressive toward smaller unrelated conspecifics
    polar_bear:"cannibalistic",scorpion:"cannibalistic",glass_scorpion:"cannibalistic",
    pyrite_crawler:"cannibalistic",cave_spider:"cannibalistic",venom_spider:"cannibalistic",
    pit_viper:"territorial",grass_snake:"peaceful",
    // Aquatic territorial & cannibalistic species
    giant_squid:"cannibalistic",colossal_squid:"cannibalistic",coastal_squid:"cannibalistic",
    common_octopus:"cannibalistic",reef_shark:"cannibalistic",caiman:"cannibalistic",
    green_anaconda:"cannibalistic",piranha:"cannibalistic",leopard_seal:"territorial",
    sperm_whale:"territorial",arapaima:"territorial",pufferfish:"territorial",raw_pike:"cannibalistic"
  };

  // Activity & Sleep circadian habits
  const activityMap={
    // Nocturnal (active at night, sleep by day)
    owl:"nocturnal",frost_owl:"nocturnal",opossum:"nocturnal",fennec:"nocturnal",badger:"nocturnal",
    three_banded_armadillo:"nocturnal",iron_armadillo:"nocturnal",maned_wolf:"nocturnal",
    hoary_fox:"nocturnal",hippopotamus:"nocturnal",lumen_moth:"nocturnal",
    scorpion:"nocturnal",glass_scorpion:"nocturnal",pyrite_crawler:"nocturnal",
    cave_spider:"nocturnal",venom_spider:"nocturnal",pit_viper:"nocturnal",
    common_octopus:"nocturnal",raw_catfish:"nocturnal",raw_eel:"nocturnal",
    // Crepuscular (dawn/dusk peak, nap midday & late night)
    deer:"crepuscular",forest_deer:"crepuscular",pampas_deer:"crepuscular",
    rabbit:"crepuscular",flower_hare:"crepuscular",snow_hare:"crepuscular",salt_marsh_rabbit:"crepuscular",
    wild_boar:"crepuscular",wolf:"crepuscular",lion:"crepuscular",jaguar:"crepuscular",tiger:"crepuscular",
    lynx:"crepuscular",rime_fox:"crepuscular",cacao_tapir:"crepuscular",capivara:"crepuscular",
    mangrove_capivara:"crepuscular",cat:"crepuscular",brown_bear:"crepuscular",black_bear:"crepuscular",
    anteater:"crepuscular",caiman:"crepuscular",green_anaconda:"crepuscular",reef_shark:"crepuscular",
    // Unihemispheric / cetacean logging sleep
    orca:"unihemispheric",orca_b:"unihemispheric",orca_c:"unihemispheric",orca_d:"unihemispheric",
    dolphin:"unihemispheric",sperm_whale:"unihemispheric",blue_whale:"unihemispheric",
    fin_whale:"unihemispheric",sei_whale:"unihemispheric",brydes_whale:"unihemispheric",
    southern_right_whale:"unihemispheric",humpback:"unihemispheric",minke:"unihemispheric",
    common_minke:"unihemispheric",pink_boto:"unihemispheric",amazon_manatee:"unihemispheric",
    // Deep-sea / continuous / drifting
    giant_squid:"continuous",colossal_squid:"continuous",coastal_squid:"continuous",
    jelly:"continuous",moon_jelly:"continuous",sea_nettle:"continuous",
    phytoplankton:"continuous",zooplankton:"continuous",antarctic_krill:"continuous",
    // Sessile benthic organisms
    brain_coral:"sessile",branching_coral:"sessile",sea_anemone:"sessile",rock_mussel:"sessile",
    eelgrass:"sessile",kelp:"sessile",waterweed:"sessile"
  };

  const sleepDescriptions={
    sperm_whale:"Sono uni-hemisférico e cochilos verticais breves (10–15 min) perto da superfície",
    orca:"Sono uni-hemisférico em grupo — descansa metade do cérebro por vez para respirar",
    orca_b:"Sono uni-hemisférico em grupo enquanto desliza devagar perto do gelo",
    orca_c:"Sono uni-hemisférico nadando lentamente nos canais gelados",
    orca_d:"Sono uni-hemisférico em deslocamento lento no mar subantártico",
    dolphin:"Sono uni-hemisférico — mantém um olho aberto e sobe para respirar",
    blue_whale:"Sono uni-hemisférico em mergulhos rasos e curtos",
    humpback:"Cochilos breves flutuando próximo à superfície com sono uni-hemisférico",
    lion:"Crepuscular e noturno — dorme até 16–20 horas por dia à sombra",
    elephant:"Diurno — dorme apenas 2 a 4 horas por noite, muitas vezes em pé",
    hippopotamus:"Noturno para pastar — cochila quase submerso durante o dia",
    tiger:"Crepuscular e noturno — descansa em matas densas nas horas mais quentes",
    jaguar:"Crepuscular e noturno — cochila em galhos baixos ou margens sombreadas de dia",
    polar_bear:"Ativo de dia e no crepúsculo — cava abrigos na neve para descansar",
    brown_bear:"Crepuscular — descansa em tocas ou matas densas e reduz atividade no frio extremo",
    black_bear:"Crepuscular — cochila ao pé de árvores ou sobre galhos altos",
    anteater:"Crepuscular — dorme encolhido cobrindo o corpo com a cauda espessa",
    three_banded_armadillo:"Noturno — dorme de dia abrigado e enrolado na carapaça",
    green_iguana:"Diurno — toma sol de manhã e dorme em galhos à noite",
    harpy_eagle:"Diurno — pousa no alto das copas para dormir à noite",
    owl:"Noturno — dorme camuflada em galhos durante o dia e caça no escuro",
    frost_owl:"Noturno e crepuscular — pousa abrigada do vento nas horas claras",
    opossum:"Noturno — passa o dia em ocos de árvores ou entre raízes",
    fennec:"Noturno — escapa do calor dormindo em tocas frescas na areia de dia",
    giant_squid:"Ativo nas profundezas escuras — alterna caçadas com deriva silenciosa",
    colossal_squid:"Ativo em águas abissais geladas — poupa energia flutuando entre emboscadas",
    common_octopus:"Noturno — descansa escondido em fendas rochosas durante o dia",
    weddell_seal:"Alterna mergulhos com cochilos sobre o gelo ou flutuando em aberturas",
    harbor_seal:"Cochila fora d’água em bancos costeiros ou boiando na vertical",
    leopard_seal:"Descansa sozinha sobre placas de gelo entre incursões de caça",
    ringed_seal:"Cochila sobre o gelo próximo a furos de respiração",
    adelie_penguin:"Diurno — faz dezenas de microcochilos curtos sobre o gelo e a costa",
    leatherback:"Nada quase continuamente, reduzindo o ritmo em águas calmas para descansar",
    reef_shark:"Crepuscular e noturno — patrulha continuamente em ritmo mais lento de dia",
    caiman:"Crepuscular e noturno — aquece-se ao sol nas margens durante o dia",
    green_anaconda:"Crepuscular e noturno — repousa imóvel em águas rasas após engolir uma presa",
    amazon_manatee:"Cochila no fundo calmo e sobe a cada poucos minutos para respirar",
    brain_coral:"Sem sono — estende pólipos à noite para filtrar zooplâncton e fotossintetiza de dia",
    branching_coral:"Sem sono — simbiontes aproveitam o sol de dia e pólipos capturam presas à noite",
    sea_anemone:"Sem sono — retrai os tentáculos em repouso e os abre nas correntes"
  };

  const defaultSleepByActivity={
    diurnal:"Diurno — ativo sob a luz do dia, dorme ao anoitecer",
    nocturnal:"Noturno — descansa abrigado de dia e sai para caçar à noite",
    crepuscular:"Crepuscular — mais ativo ao amanhecer e entardecer, cochila no meio do dia",
    unihemispheric:"Sono uni-hemisférico — descansa metade do cérebro por vez para respirar",
    continuous:"Ativo continuamente, reduzindo o ritmo em águas calmas para repousar",
    sessile:"Sem sono — responde à luz solar e às correntes marinhas"
  };

  const sameSpeciesLabels={
    peaceful:"Pacífico com a própria espécie",
    territorial:"Territorial — afasta rivais adultos da mesma espécie",
    cannibalistic:"Pode atacar ou canibalizar indivíduos menores da própria espécie"
  };

  const dietTypeOverrides={
    cow:"Herbívoro",sheep:"Herbívoro",bison:"Herbívoro",deer:"Herbívoro",forest_deer:"Herbívoro",
    pampas_deer:"Herbívoro",savanna_gazelle:"Herbívoro",mountain_goat:"Herbívoro",scoria_ram:"Herbívoro",
    rabbit:"Herbívoro",flower_hare:"Herbívoro",snow_hare:"Herbívoro",salt_marsh_rabbit:"Herbívoro",
    capivara:"Herbívoro",mangrove_capivara:"Herbívoro",cacao_tapir:"Herbívoro",elephant:"Herbívoro",
    rhinoceros:"Herbívoro",hippopotamus:"Herbívoro",green_iguana:"Herbívoro",amazon_manatee:"Herbívoro aquático",
    raw_pacu:"Herbívoro / frugívoro",raw_tilapia:"Herbívoro / onívoro",
    anteater:"Insetívoro",three_banded_armadillo:"Insetívoro",iron_armadillo:"Insetívoro",
    hyacinth_macaw:"Frugívoro / granívoro",toco_toucan:"Frugívoro / onívoro",lumen_moth:"Nectarívoro",
    rufous_bellied_thrush:"Onívoro / frugívoro",lilac_songbird:"Onívoro / granívoro",
    pig:"Onívoro",wild_boar:"Onívoro",chicken:"Onívoro",opossum:"Onívoro",coati:"Onívoro",
    brown_bear:"Onívoro",black_bear:"Onívoro",maned_wolf:"Onívoro",hoary_fox:"Onívoro",
    badger:"Onívoro",fennec:"Onívoro",rime_fox:"Onívoro / carnívoro",greater_rhea:"Onívoro",
    golden_lion_tamarin:"Onívoro",dog:"Onívoro",raw_carp:"Onívoro",
    marsh_heron:"Piscívoro",crystal_heron:"Piscívoro",jabiru:"Piscívoro",amber_ibis:"Insetívoro / piscívoro",
    dolphin:"Piscívoro / carnívoro",pink_boto:"Piscívoro",arapaima:"Piscívoro",
    harbor_seal:"Piscívoro / carnívoro",weddell_seal:"Piscívoro / carnívoro",ringed_seal:"Piscívoro",
    orca_c:"Piscívoro",orca_d:"Piscívoro / carnívoro",
    blue_whale:"Filtrador",fin_whale:"Filtrador",sei_whale:"Filtrador",brydes_whale:"Filtrador",
    southern_right_whale:"Filtrador",humpback:"Filtrador",minke:"Filtrador",common_minke:"Filtrador",
    adelie_penguin:"Carnívoro / filtrador de krill",rock_mussel:"Filtrador",zooplankton:"Filtrador",
    antarctic_krill:"Filtrador",moon_jelly:"Filtrador",sea_nettle:"Carnívoro / filtrador",jelly:"Filtrador",
    brain_coral:"Simbiose fotossintética e filtração",branching_coral:"Simbiose fotossintética e filtração",
    sea_anemone:"Carnívoro / filtrador",phytoplankton:"Fotossintetizante",eelgrass:"Fotossintetizante",
    kelp:"Fotossintetizante",waterweed:"Fotossintetizante",
    leatherback:"Carnívoro (águas-vivas)",sea_star:"Carnívoro bentônico",
    shrimp_pink:"Detritívoro / onívoro",shrimp_seabob:"Detritívoro / onívoro",
    shrimp_white:"Detritívoro / onívoro",shrimp_pitu:"Onívoro bentônico"
  };

  const smallBite={kind:"bite",range:1.43,notice:9,windup:.34,strike:.25,recover:.45,cooldown:2,damage:8};
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
  const dietOf=actor=>actor.profile?.diet??waterDiets[actor.id]??(planktonEaters.has(actor.id)?["zooplankton","phytoplankton"]:null);
  const feedsOnStock=actor=>actor.profile?.feeding||planktonEaters.has(actor.id);
  const sameSpeciesOf=id=>sameSpeciesMap[id]??"peaceful";
  const activityOf=id=>activityMap[id]??"diurnal";
  const retaliates=id=>landRetaliators.has(id);
  const hasInkDefense=id=>inkDefenders.has(id);

  const canHunt=(hunter,prey)=>hunter!==prey&&hunter.id!==prey.id&&!!dietOf(hunter)?.includes(prey.id)&&
    !hunter.dead&&!prey.dead&&!prey.spectral&&!hunter.spectral&&(prey.stock===undefined||prey.stock>.8);

  const canRivalWater=(a,b)=>a!==b&&!a.dead&&!b.dead&&!a.spectral&&!b.spectral&&
    !!waterRivals[a.id]?.includes(b.id);

  const canClashSameWater=(a,b)=>{
    if(a===b||a.id!==b.id||a.dead||b.dead||a.spectral||b.spectral)return false;
    if(a.pod&&a.pod===b.pod||a.school&&a.school===b.school)return false;
    if((a.clashRest??0)>0||(b.clashRest??0)>0)return false;
    const mode=sameSpeciesOf(a.id);
    if(mode==="peaceful")return false;
    if(mode==="territorial")return a.hp>a.maxHp*.62&&b.hp>b.maxHp*.62;
    return mode==="cannibalistic"&&a.hp>=b.hp*.95;
  };

  const canHuntLand=(hunter,prey)=>hunter!==prey&&!!landDiets[hunter.type]?.includes(prey.aquatic?prey.id:prey.type)&&
    !hunter.spectral&&!prey.spectral&&!hunter.dead&&!prey.dead&&
    (!prey.aquatic||prey.ashore||prey.id==="caiman"&&prey.water&&prey.water.top-prey.y<1.8)&&
    !prey.persistent&&!prey.birth&&!prey.bonded&&!hunter.bonded;

  const canRivalLand=(a,b)=>a!==b&&!a.dead&&!b.dead&&!a.spectral&&!b.spectral&&!a.bonded&&!b.bonded&&
    !a.persistent&&!b.persistent&&!a.young&&!b.young&&(a.clashRest??0)<=0&&(b.clashRest??0)<=0&&
    !!landRivals[a.type]?.includes(b.aquatic?b.id:b.type);

  const canClashSameLand=(a,b)=>{
    if(a===b||a.type!==b.type||a.dead||b.dead||a.spectral||b.spectral||a.bonded||b.bonded||a.persistent||b.persistent||a.young||b.young)return false;
    if(a.naturalGroup&&a.naturalGroup===b.naturalGroup)return false;
    if((a.clashRest??0)>0||(b.clashRest??0)>0)return false;
    const mode=sameSpeciesOf(a.type);
    if(mode==="peaceful")return false;
    if(mode==="territorial")return a.hp>a.maxHp*.62&&b.hp>b.maxHp*.62;
    return mode==="cannibalistic"&&a.hp>=b.hp*.95;
  };

  function isSleeping(id,dayTime,actor=null){
    if(actor&&(actor.hostile||actor.bonded||actor.persistent||actor.ai?.engagement||actor.ai?.fear>0||actor.feedingPause>0))return false;
    const act=activityOf(id);
    if(act==="diurnal")return dayTime>=.62&&dayTime<=.93;
    if(act==="nocturnal")return dayTime>=.13&&dayTime<=.44;
    if(act==="crepuscular"){
      if(id==="lion")return dayTime>=.16&&dayTime<=.44||dayTime>=.74&&dayTime<=.84;
      return dayTime>=.23&&dayTime<=.36||dayTime>=.74&&dayTime<=.83;
    }
    return false;
  }

  function aquaticResting(actor,dayTime){
    const act=activityOf(actor.id);
    if(act==="sessile"||act==="continuous")return false;
    if(act==="nocturnal")return dayTime>=.16&&dayTime<=.42;
    if(act==="crepuscular")return dayTime>=.24&&dayTime<=.36;
    if(act==="unihemispheric")return Math.sin(dayTime*Math.PI*16+actor.phase)>.82;
    return dayTime>=.64&&dayTime<=.90;
  }

  function choosePrey(hunters,animals,visible){
    const lead=hunters[0];
    let target=null,closest=lead.profile.anchored?(lead.profile.feedRange??2.2):
      lead.profile.forage?.notice??(feedsOnStock(lead)?11:lead.profile.attack?.notice??smallBite.notice);
    for(const candidate of animals){
      if(!canHunt(lead,candidate))continue;
      const gap=distance(lead,candidate);
      if(gap>=closest||!hunters.some(hunter=>visible(hunter,candidate)))continue;
      target=candidate;closest=gap;
    }
    return target;
  }

  function chooseAquaticRival(actor,animals,visible){
    if((actor.clashRest??0)>0||actor.profile.anchored)return null;
    const notice=actor.large?14:7;
    let best=null,closest=notice;
    for(const other of animals){
      const rival=canRivalWater(actor,other);
      const same=!rival&&canClashSameWater(actor,other);
      if(!rival&&!same)continue;
      const gap=distance(actor,other);
      const limit=same?(actor.large?10:5.2):notice;
      if(gap>=Math.min(closest,limit)||!visible(actor,other))continue;
      best=other;closest=gap;
    }
    return best;
  }

  function consumeStock(hunter,prey,amount){
    if(prey.stock===undefined)return false;
    prey.stock=Math.max(0,prey.stock-amount);
    if(hunter.stock!==undefined&&!hunter.profile.photosynthesis)hunter.stock=Math.min(hunter.profile.stock,hunter.stock+amount*.7);
    return true;
  }

  function refreshAquatic(animals,visible,dt,environment=()=>({light:1,weather:"clear",day:.25})){
    const pods=new Set();
    for(const actor of animals){
      actor.wildThreat=null;actor.wildCover=null;
      actor.clashRest=Math.max(0,(actor.clashRest??0)-dt);
      actor.inkCooldown=Math.max(0,(actor.inkCooldown??0)-dt);
      actor.inkBlinded=Math.max(0,(actor.inkBlinded??0)-dt);
      if(actor.grip?.predator.dead)actor.grip=null;
      if(actor.wildRival&&(actor.wildRival.dead||distance(actor,actor.wildRival)>20||
        (sameSpeciesOf(actor.id)==="territorial"&&actor.id===actor.wildRival.id&&(actor.hp<=actor.maxHp*.60||actor.wildRival.hp<=actor.wildRival.maxHp*.60)))){
        if(actor.wildRival&&!actor.wildRival.dead&&actor.id===actor.wildRival.id){
          actor.clashRest=32;actor.wildRival.clashRest=32;
        }
        actor.wildRival=null;
      }
      if(!actor.dead&&actor.stock!==undefined){
        actor.stock=QuimiCraftMarineLife.renewal(actor.profile,actor.stock,environment(actor),dt);
      }
    }
    for(const actor of animals){
      if(actor.dead)continue;
      actor.feedRest=Math.max(0,(actor.feedRest??0)-dt);
      if(actor.pod)pods.add(actor.pod);
      else if(dietOf(actor)){
        if(!actor.wildPrey||!canHunt(actor,actor.wildPrey)||distance(actor,actor.wildPrey)>Math.max(18,(actor.profile.forage?.notice??0)*1.35)){
          actor.wildPrey=actor.feedRest||actor.inkBlinded>0?null:choosePrey([actor],animals,visible);
        }
        const prey=actor.wildPrey;
        if(prey){
          const feeding=feedsOnStock(actor)&&prey.stock!==undefined;
          if(feeding&&distance(actor,prey)<(actor.profile.feedRange??(actor.large?3.6:1.6))){
            consumeStock(actor,prey,dt*(actor.large?1.9:.72));
            actor.feedRest=.9;
          }else if(!feeding&&!prey.profile.anchored&&prey.stock===undefined){
            if(!prey.wildThreat||distance(prey,actor)<distance(prey,prey.wildThreat))prey.wildThreat=actor;
          }
        }
      }
      // Check inter-species rivals (e.g. dolphins mobbing reef sharks, humpbacks vs orcas) and territorial/cannibalistic clashes
      if(!actor.wildPrey&&!actor.pod&&!actor.wildRival&&actor.inkBlinded<=0){
        const rival=chooseAquaticRival(actor,animals,visible);
        if(rival){
          actor.wildRival=rival;
          if(!rival.wildThreat||distance(rival,actor)<distance(rival,rival.wildThreat))rival.wildThreat=actor;
        }
      }else if(actor.wildRival&&!actor.wildRival.dead){
        if(!actor.wildRival.wildThreat||distance(actor.wildRival,actor)<distance(actor.wildRival,actor.wildRival.wildThreat)){
          actor.wildRival.wildThreat=actor;
        }
      }
    }
    for(const pod of pods){
      const members=pod.members.filter(member=>!member.dead);
      pod.rest=Math.max(0,pod.rest-dt);
      pod.pursuit-=dt;
      const previous=pod.prey;
      if(previous&&(previous.dead||members.length<2||distance(pod.home,previous)>62||pod.pursuit<=0)){
        pod.prey=null;
        pod.rest=previous.dead?22:7;
      }
      if(members.length<2)continue;
      if(!pod.prey&&!pod.rest){
        pod.prey=choosePrey(members,animals,visible);
        pod.pursuit=28;
      }
      if(pod.prey)pod.prey.wildThreat=members.reduce((nearest,member)=>distance(member,pod.prey)<distance(nearest,pod.prey)?member:nearest);
    }
    for(const actor of animals){
      const env=environment(actor);
      actor.wildSleeping=!actor.dead&&!actor.wildThreat&&!actor.wildPrey&&!actor.wildRival&&!actor.pod?.prey&&
        aquaticResting(actor,env.day??.25);
      actor.fleeTime=actor.wildThreat?Math.min(12,(actor.fleeTime??0)+dt):Math.max(0,(actor.fleeTime??0)-dt*2);
      if(actor.wildThreat&&!actor.large||actor.wildSleeping&&!actor.large&&!actor.profile.anchored&&actor.profile.mode!=="drift"){
        actor.wildCover=animals.find(cover=>cover.profile.refuge&&!cover.dead&&distance(actor,cover)<4.8&&
          (!actor.wildThreat||distance(actor.wildThreat,cover)>distance(actor.wildThreat,actor)+.55));
      }
    }
  }

  function huntGoal(hunter,prey){
    const gap=distance(hunter,prey),slot=hunter.pod?.members.indexOf(hunter)??0;
    if(!slot||gap<4.3)return prey;
    const side=slot%2===1?1:-1,lead=Math.min(5.5,gap*.53);
    const forwardX=Math.sin(prey.angle),forwardZ=Math.cos(prey.angle);
    return {x:prey.x+forwardX*lead*side+forwardZ*side*1.65,
      y:prey.y-(slot===2?.6:.12),z:prey.z+forwardZ*lead*side-forwardX*side*1.65};
  }

  function squidDefense(actor,predator){
    if(actor.grip?.predator===predator)return actor.grip.attack;
    const counter=actor.profile.counter;
    const attack=counter.gripChance&&Math.random()<counter.gripChance?
      {...counter,range:counter.range+.5,damage:counter.gripDamage,windup:.28,cooldown:1.85,lockedGrip:true}:counter;
    actor.grip={predator,attack};
    return attack;
  }

  function aquaticIntent(actor){
    if(actor.profile.anchored)return {mode:"attached",speed:0};
    const threat=actor.wildThreat;
    if(threat&&!threat.dead&&distance(actor,threat)<18){
      const counter=actor.profile.counter;
      if(counter&&distance(actor,threat)<counter.range+2.2){
        const attack=counter.kind==="grasp"?squidDefense(actor,threat):counter;
        if(attack.lockedGrip||actor.hp>=actor.profile.hp*.24||actor.strike!=null){
          return {mode:"counter",speed:.58,goal:threat,prey:threat,attack};
        }
      }
      // Predators with a bite/tail attack retaliate against non-apex rivals
      const defense=actor.profile.forage??actor.profile.attack;
      if(defense&&actor.hp>=actor.maxHp*.40&&(actor.id===threat.id||actor.large||threat.profile.extent<=actor.profile.extent*1.2)){
        return {mode:"counter",speed:1.22,goal:threat,prey:threat,attack:defense};
      }
      const away=Math.atan2(actor.x-threat.x,actor.z-threat.z);
      const requestDepth=actor.profile.mode==="bottom"?-.55:actor.id==="minke"||actor.id==="weddell_seal"?.46:0;
      const burst=Math.max(0,1-(actor.fleeTime??0)/8);
      const cover=actor.wildCover,goal=cover?{x:cover.x,y:cover.y+.42,z:cover.z}:
        {x:actor.x+Math.sin(away)*6,y:actor.y+requestDepth,z:actor.z+Math.cos(away)*6};
      return {mode:"flee",speed:1.12+.45*burst,goal};
    }
    const prey=actor.pod?.prey??actor.wildPrey??actor.wildRival;
    if(prey&&!prey.dead){
      if(feedsOnStock(actor)&&prey.stock!==undefined){
        const reach=actor.profile.feedRange??(actor.large?3.6:1.6);
        if(distance(actor,prey)<reach*.85)return {mode:"feed",speed:.12};
        return {mode:"feed",speed:1.10,goal:prey};
      }
      const attack=actor.profile.forage??actor.profile.counter??actor.profile.attack??smallBite;
      return {mode:"hunt",speed:actor.pod?1.84:1.64,goal:huntGoal(actor,prey),prey,attack};
    }
    if(actor.wildSleeping){
      if(actor.wildCover&&distance(actor,actor.wildCover)>1.3){
        return {mode:"sleep",speed:.45,goal:{x:actor.wildCover.x,y:actor.wildCover.y+.35,z:actor.wildCover.z}};
      }
      const logging=activityOf(actor.id)==="unihemispheric";
      return {mode:"sleep",speed:logging?.20:.08,verticalRest:actor.id==="sperm_whale"};
    }
    const group=actor.pod??actor.school;
    const lead=group?.members.find(member=>!member.dead);
    if(lead&&lead!==actor){
      const slot=group.members.indexOf(actor),side=slot%2?1:-1,spacing=actor.pod?2.65:.67;
      const dx=Math.sin(lead.angle),dz=Math.cos(lead.angle);
      return {mode:"school",speed:distance(actor,lead)>spacing*2.2?1.16:.86,goal:{
        x:lead.x-dx*spacing*(1+(slot-1)*.48)+dz*spacing*side*.72,y:lead.y,
        z:lead.z-dz*spacing*(1+(slot-1)*.48)-dx*spacing*side*.72}};
    }
    if(actor.pod&&distance(actor,actor.pod.home)>13)return {mode:"school",speed:.92,goal:actor.pod.home};
    return null;
  }

  function finishAquaticHunt(hunter,prey){
    if(!prey.dead)return;
    if(hunter.wildPrey===prey){
      hunter.wildPrey=null;
      hunter.feedRest=17;
    }
    if(hunter.wildRival===prey){
      hunter.wildRival=null;
      hunter.clashRest=26;
    }
    if(hunter.pod&&hunter.pod.prey===prey){
      hunter.pod.prey=null;
      hunter.pod.rest=25;
    }
  }

  // Build complete structured biological summary for the catalog inspector
  function ecologyOf(id,{profile=null,nameOf=k=>k,aquatic=false}={}){
    const dietIds=aquatic?(dietOf({id,profile})??[]):(landDiets[id]??[]);
    const rivalIds=aquatic?(waterRivals[id]??[]):(landRivals[id]??[]);
    // Compute natural predators across BOTH land and water webs!
    const predatorIds=[];
    for(const [pred,list] of Object.entries(landDiets))if(list.includes(id))predatorIds.push(pred);
    for(const [pred,list] of Object.entries(waterDiets))if(list.includes(id))predatorIds.push(pred);
    const depthsFauna=globalThis.QuimiCraftDepths?.fauna;
    if(depthsFauna){
      for(const [pred,p] of Object.entries(depthsFauna)){
        if(p.diet?.includes(id)&&!predatorIds.includes(pred))predatorIds.push(pred);
      }
    }
    // Social grouping
    let groupText="Solitário";
    if(aquatic){
      if(profile?.anchored)groupText="Fixo ao substrato (colônia ou banco)";
      else if(profile?.mode==="pod")groupText="Bando cooperativo (pod) de 2 a 4 indivíduos";
      else if(profile?.mode==="school")groupText=profile.group?`Em grupo / cardume (${profile.group[0]} a ${profile.group[1]}+)`: "Em cardume";
      else if(profile?.mode==="drift")groupText=profile.stock!==undefined?"Enxame / nuvem à deriva":"À deriva nas correntes";
      else if(profile?.solo)groupText="Solitário";
      else if(id==="humpback"||id==="blue_whale"||id==="fin_whale"||id==="sei_whale"||id==="brydes_whale"||id==="southern_right_whale"||id==="minke"||id==="common_minke")
        groupText="Solitário ou em pares/grupos temporários";
      else if(id==="sperm_whale")groupText="Machos adultos solitários; fêmeas e filhotes em grupos";
      else if(id==="weddell_seal"||id==="harbor_seal"||id==="ringed_seal")groupText="Solitário na água; descansa em pequenos grupos no gelo ou costa";
      else if(id==="caiman")groupText="Solitário na caça; reúne-se em margens para aquecer-se";
      else if(id==="reef_shark"||id==="green_anaconda"||id==="arapaima"||id==="leatherback"||id==="ray"||id==="venom_ray")
        groupText="Geralmente solitário";
      else groupText="Cardume ou pequenos grupos";
    }else{
      const s=social[id];
      groupText=s?`${s[0]} (${s[1]} a ${s[2]} indivíduos)`:"Geralmente solitário";
    }
    // Same-species aggression
    const same=sameSpeciesOf(id);
    const sameText=sameSpeciesLabels[same];
    // Diet
    const foodText=aquatic?
      [profile?.photosynthesis?"Simbiose fotossintética":null,dietIds.length?dietIds.map(nameOf).join(", "):null].filter(Boolean).join(" · ")||"Pequenos organismos e partículas":
      [landFoods[id],dietIds.length?"Caça: "+dietIds.map(nameOf).join(", "):null].filter(Boolean).join(" · ")||(grazers.has(id)?"Folhas, gramíneas e brotos":"Onívoro");
    const dietType=dietTypeOverrides[id]??(dietIds.length?(aquatic?"Carnívoro / predador":"Carnívoro"):grazers.has(id)?"Herbívoro":"Onívoro");
    // Sleep
    const sleepText=sleepDescriptions[id]??defaultSleepByActivity[activityOf(id)];
    // Enemies & interactions
    const uniquePreds=[...new Set(predatorIds)].filter(x=>x!==id);
    const uniqueRivals=[...new Set(rivalIds)].filter(x=>x!==id&&!uniquePreds.includes(x)&&!dietIds.includes(x));
    const enemiesParts=[];
    if(uniquePreds.length)enemiesParts.push("Predadores: "+uniquePreds.map(nameOf).join(", "));
    if(uniqueRivals.length)enemiesParts.push("Rivais: "+uniqueRivals.map(nameOf).join(", "));
    const enemiesText=enemiesParts.length?enemiesParts.join(" · "):
      (id==="orca"||id==="orca_b"||id==="blue_whale"||id==="elephant"||id==="tiger"||id==="lion"||id==="polar_bear"||id==="harpy_eagle")?
      "Predador ou gigante de topo — sem predadores adultos habituais":"Evita predadores maiores do habitat";
    // Defense
    let defenseText="Foge ou busca abrigo";
    if(hasInkDefense(id))defenseText=profile?.counter?"Contra-ataca com tentáculos e libera nuvem de tinta":"Foge e libera nuvem de tinta defensiva";
    else if(profile?.counter?.kind==="tail")defenseText="Defende-se com golpes poderosos de cauda";
    else if(profile?.counter?.kind==="bite")defenseText="Defende-se em grupo investindo contra predadores";
    else if(id==="three_banded_armadillo"||id==="iron_armadillo")defenseText="Fecha a carapaça como defesa";
    else if(id==="pufferfish")defenseText="Infla o corpo e libera espinhos tóxicos";
    else if(id==="anteater")defenseText="Ergue-se e revida com as garras dianteiras";
    else if(groupDefenders.has(id))defenseText="Revida e protege o grupo quando ameaçado";
    else if(retaliates(id)||profile?.attack||profile?.forage)defenseText="Revida quando ameaçado ou encurralado";
    else if(profile?.anchored)defenseText="Protegido por esqueleto calcário ou abrigo";
    return {
      social:groupText,
      sameSpecies:sameText,
      diet:`${dietType} — ${foodText}`,
      sleep:sleepText,
      enemies:enemiesText,
      defense:defenseText
    };
  }

  return {
    landDiets,landRivals,landPreyTypes,landResidents,social,landFoods,grazers,herds,groundForagers,
    landRetaliators,groupDefenders,waterDiets,waterRivals,
    sameSpeciesOf,activityOf,retaliates,hasInkDefense,isSleeping,aquaticResting,
    canHunt,canHuntLand,canRivalLand,canClashSameLand,canRivalWater,canClashSameWater,
    dietOf,consumeStock,refreshAquatic,aquaticIntent,finishAquaticHunt,ecologyOf
  };
})();
