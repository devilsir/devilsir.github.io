
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
    holy_staff:{family:"staff",name:"Cajado da Luz Sagrada",damage:16,speed:25,cooldown:.61,mana:13,color:"#ffd875",trim:"#fff1bc",style:"holy",
      school:"light",special:"Consagração",altMana:30,altDelay:1.8,durability:480,
      ingredients:[["HOLY_LIGHT",1],["gold_nugget",2],["stick",2]],repair:[["gold_nugget",1],["stick",1]],
      detail:"Orbes de Luz Sagrada causam dano extra a mortos-vivos e demônios. Consagração cura 24 PV, remove até 65% de corrupção demoníaca e atinge inimigos próximos."},
    death_staff:{family:"staff",name:"Cajado de Magia da Morte",damage:18,speed:22,cooldown:.66,mana:15,color:"#61c7f3",trim:"#ad9afb",style:"death",
      school:"scourge",slow:1.5,special:"Colheita de Almas",altMana:31,altDelay:1.85,durability:480,
      ingredients:[["death_rune",3],["crystal_shard",1],["stick",2]],repair:[["death_rune",1],["stick",1]],
      detail:"Dispara um orbe que desacelera. Colheita de Almas drena vida dos inimigos próximos, com efeito reduzido sobre outros mortos-vivos."},
    fel_staff:{family:"staff",name:"Cajado de Fel",damage:19,speed:25,cooldown:.67,mana:14,color:"#a7f854",trim:"#f5ff90",style:"fel",
      school:"fel",special:"Rajada da Ruptura",altMana:32,altDelay:1.9,durability:490,
      ingredients:[["fel_ember",3],["OBSIDIAN",1],["stick",2]],repair:[["fel_ember",1],["stick",1]],
      detail:"Arremessa fogo vil. Rajada da Ruptura dispara três projéteis em leque. Conjurar Fel acumula corrupção demoníaca."},
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
      ingredients:[["stick",2],["OPAL_ORE",1],["FLUORITE",1]],repair:[["OPAL_ORE",1],["stick",1]],durability:560,detail:"Orbe forte e rajada em leque de três orbes."},
    silver_staff:{family:"staff",name:"Cajado de Prata",damage:17,speed:24,cooldown:.63,mana:15,color:"#bccddf",trim:"#f0f9ff",style:"silver",
      silver:true,special:"Pulso lunar",altMana:29,altDelay:1.75,durability:460,
      ingredients:[["silver_ingot",3],["stick",2],["crystal_shard",1]],repair:[["silver_ingot",1],["stick",1]],
      detail:"Dispara orbes de prata e lança um pulso lunar circular. Ambos ferem lobisomens."},
    spectral_sword:{family:"sword",name:"Espada fantasmagórica",damage:20,reach:3.45,cooldown:.49,style:"spectralBlade",
      spectralWeapon:true,color:"#63a7bb",trim:"#a2ffe9",durability:385,
      ingredients:[["iron_ingot",2],["ectoplasm",2],["stick",1]],repair:[["ectoplasm",1],["iron_ingot",1]],
      detail:"A lâmina de ectoplasma corta criaturas na forma fantasma."},
    spectral_bow:{family:"bow",name:"Arco fantasmagórico",damage:17,speed:29,cooldown:.57,style:"spectralBow",
      spectralWeapon:true,color:"#437f91",trim:"#9fffea",durability:350,
      ingredients:[["stick",3],["wool",2],["ectoplasm",2]],repair:[["ectoplasm",1],["wool",1]],
      detail:"Impregna de ectoplasma qualquer flecha disparada. Fere criaturas na forma fantasma."},
    spectral_staff:{family:"staff",name:"Cajado fantasmagórico",damage:16,speed:21,cooldown:.56,mana:14,style:"spectralStaff",
      special:"Orbes do véu",altMana:27,altDelay:1.68,spectralWeapon:true,color:"#56d3d4",trim:"#c1fff3",durability:405,
      ingredients:[["stick",2],["ectoplasm",3],["crystal_shard",1]],repair:[["ectoplasm",1],["stick",1]],
      detail:"Dispara um orbe ou três orbes em leque. Ambos ferem criaturas na forma fantasma."},
    corrupted_blade:{family:"sword",name:"Lâmina Sussurrante",damage:27,reach:3.75,cooldown:.41,style:"corruptedBlade",
      corrupted:true,lifesteal:2,slow:1.1,color:"#4a2568",trim:"#f187ff",durability:720,
      ingredients:[["corrupted_ingot",3],["corrupted_shard",2],["stick",1]],repair:[["corrupted_ingot",1],["corrupted_shard",1]],
      detail:"Lâmina forjada de minério corrompido com um olho vigilante na guarda. Causa 27 de dano, drena 2 PV por golpe e sussurra para quem a empunha."},
    corrupted_greatsword:{family:"sword",name:"Devoradora de Mentes",damage:36,reach:4.55,cooldown:.78,style:"corruptedGreatsword",
      corrupted:true,twoHanded:true,targets:3,arc:.46,knockback:7.4,lifesteal:3,slow:1.4,color:"#371950",trim:"#ff7cb8",durability:880,
      ingredients:[["corrupted_ingot",4],["CORRUPTED_GEM",2],["old_god_eye",1]],repair:[["corrupted_ingot",2],["corrupted_shard",1]],
      detail:"Montante abissal de 36 de dano que atinge até três alvos, drena 3 PV por acerto e murmura promessas sombrias em combate. Ocupa as duas mãos."},
    corrupted_staff:{family:"staff",name:"Cajado dos Mil Olhos",damage:23,speed:26,cooldown:.56,mana:15,style:"corruptedStaff",
      corrupted:true,school:"void",slow:1.6,special:"Olhar do Abismo",altMana:30,altDelay:1.75,color:"#6f35a6",trim:"#ffb3e6",durability:620,
      ingredients:[["corrupted_ingot",2],["CORRUPTED_GEM",2],["old_god_eye",1],["stick",2]],repair:[["corrupted_ingot",1],["corrupted_shard",1]],
      detail:"Canaliza energia dos Deuses Antigos. Olhar do Abismo dispara três orbes sombrios e libera uma onda psíquica que drena vida dos inimigos próximos."},
    corrupted_bow:{family:"bow",name:"Arco dos Sussurros",damage:24,speed:37,cooldown:.56,style:"corruptedBow",
      corrupted:true,slow:1.0,color:"#4b2266",trim:"#e58cff",durability:640,
      ingredients:[["corrupted_ingot",2],["CORRUPTED_GEM",1],["wool",2],["stick",1]],repair:[["corrupted_ingot",1],["wool",1]],
      detail:"Arco orgânico cravejado de olhos diminutos. Dispara flechas velozes de 24 de dano enquanto sussurra ao ouvido do arqueiro."},
    summon_staff:{family:"staff",name:"Cajado do Invocador",damage:15,speed:24,cooldown:.58,mana:14,style:"summon",
      school:"summon",special:"Conjurar Aliado",altMana:24,altDelay:1.6,color:"#56d4c4",trim:"#ffe688",durability:540,
      ingredients:[["elemental_core",2],["crystal_shard",2],["stick",2]],repair:[["elemental_core",1],["stick",1]],
      detail:"Cajado rúnico de invocação. Clique dispara orbe arcano; botão direito invoca o aliado selecionado no Grimório (K)."}
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
      repair:[["OBSIDIAN",1],["bronze_ingot",1]],detail:"Reduz em 61% o dano das baforadas comuns. É a única peça capaz de bloquear uma rajada dracônica enquanto tiver durabilidade."},
    shield_mirror:{name:"Escudo de Espelho",shape:"mirror",color:"#aac8d1",trim:"#b68b59",armor:.10,blockChance:.25,reduction:.47,
      mirrorGuard:true,protections:{physical:.12},durability:475,ingredients:[["GLASS",2],["silver_ingot",2],["bronze_ingot",1],["hide",1]],
      repair:[["silver_ingot",1],["bronze_ingot",1]],detail:"Levanta automaticamente com a mão secundária livre e reflete o olhar petrificante das medusas. Cada reflexo desgasta a prata."},
    shield_corrupted:{name:"Égide dos Olhos Antigos",shape:"corrupted",corrupted:true,color:"#381d4d",trim:"#e886ff",
      armor:.19,blockChance:.34,reduction:.34,protections:{physical:.24},durability:760,
      ingredients:[["corrupted_ingot",3],["CORRUPTED_GEM",1],["corrupted_shard",2]],
      repair:[["corrupted_ingot",1],["corrupted_shard",1]],
      detail:"Escudo vivo forjado com minério corrompido. Seu olho central observa os atacantes, amplia a defesa física e sussurra quando equipado."},
    shield_light:{name:"Égide da Primeira Luz",shape:"sacred",lightGear:true,color:"#394454",trim:"#efc66d",
      armor:.20,blockChance:.35,reduction:.35,sanityWard:.65,sanityRegen:2.5,protections:{physical:.24},durability:780,
      ingredients:[["DAWN_GOLD",3],["HOLY_LIGHT",1],["gold_nugget",3]],
      repair:[["DAWN_GOLD",1],["gold_nugget",1]],
      detail:"Escudo sagrado com asas de prata e o martelo do Sol em relevo. Reduz em 65% a perda de sanidade por sussurros, regenera sanidade e protege contra ataques físicos."}
  });
  const focuses=Object.freeze({
    grimoire:{name:"Grimório dos Selos",shape:"book",color:"#5f526d",trim:"#e8c894",
      special:"Círculo de selos",mana:17,cooldown:2.35,damage:8,reach:5.4,slow:1.9,
      ingredients:[["lab_note",1],["hide",1],["bronze_ingot",1]],repair:[["hide",1]],
      durability:305,detail:"Mão secundária. X conjura um círculo que empurra e desacelera criaturas próximas por 17 de mana."},
    resonant_orb:{name:"Orbe ressonante",shape:"orb",color:"#54af9a",trim:"#b9f9d8",
      special:"Pulso ressonante",mana:12,cooldown:1.42,damage:11,speed:25,slow:.75,
      ingredients:[["crystal_shard",2],["wind_essence",1],["copper_ingot",1]],repair:[["crystal_shard",1]],
      durability:420,detail:"Mão secundária. X dispara um pulso de 11 de dano por 12 de mana."},
    corrupted_grimoire:{name:"Tomo dos Sussurros Antigos",shape:"corruptedBook",corrupted:true,color:"#36184c",trim:"#ff84d4",
      special:"Tentáculos do Vazio",mana:16,cooldown:2.1,damage:16,reach:6.4,slow:2.2,
      ingredients:[["lab_note",1],["CORRUPTED_GEM",2],["corrupted_shard",2]],repair:[["corrupted_shard",1]],
      durability:480,detail:"Mão secundária. X libera uma onda sombria que fere, desacelera e drena vida de inimigos próximos enquanto sussurra em sua mente."},
    naaru_relic:{name:"Relíquia de Naaru",shape:"naaruOrb",lightGear:true,color:"#ffdf78",trim:"#9df8ff",
      sanityWard:.80,sanityRegen:4.0,
      special:"Pulso Purificador de Naaru",mana:15,cooldown:2.0,damage:18,reach:7.5,slow:1.2,
      ingredients:[["HOLY_LIGHT",2],["DAWN_GOLD",2],["crystal_shard",2]],repair:[["DAWN_GOLD",1],["crystal_shard",1]],
      detail:"Mão secundária de Luz Sagrada. Bloqueia 80% da perda de sanidade por sussurros, ilumina ao redor e com X dispara um pulso de Naaru que restaura sanidade e dissipa todas as visões."},
    summon_grimoire:{name:"Grimório de Invocação",shape:"summonBook",color:"#2d586e",trim:"#ffd974",
      special:"Invocar Aliado Selecionado",mana:20,cooldown:1.8,damage:12,reach:6.0,
      ingredients:[["lab_note",1],["elemental_core",2],["crystal_shard",2]],repair:[["crystal_shard",1]],
      detail:"Mão secundária de conjuração. Aperte X para invocar o aliado escolhido no menu de Invocações (K) — elementais, infernais, cães da fenda, golens, seres de luz ou do caos."}
  });
  const classGear=Object.freeze({
    mage_circlet:{name:"Diadema prismático",role:"Mago",shape:"circlet",slot:"head",color:"#6c518f",trim:"#9df0db",durability:300,
      stats:{magicPower:.12},ingredients:[["bronze_ingot",2],["crystal_shard",2]],repair:[["crystal_shard",1]],
      detail:"Mago. +12% de dano com magia."},
    mage_hat:{name:"Chapéu pontudo de mago",role:"Mago",shape:"wizardHat",slot:"head",color:"#32346a",trim:"#d4ad71",durability:320,
      stats:{magicPower:.09,manaDiscount:.06},ingredients:[["wool",4],["hide",1],["crystal_shard",1]],repair:[["wool",2]],
      detail:"Mago. Aba larga e copa de feltro. +9% de dano mágico e 6% a menos de mana por conjuração."},
    mage_vestment:{name:"Veste de conjurador",role:"Mago",shape:"vestment",slot:"chest",color:"#3e387a",trim:"#9dd9cf",durability:330,
      stats:{armor:.08,manaDiscount:.22},protections:{electric:.10},
      ingredients:[["wool",4],["hide",1],["crystal_shard",2]],repair:[["wool",2],["crystal_shard",1]],
      detail:"Mago. Reduz em 22% o custo de mana e oferece proteção elétrica."},
    mage_mantle:{name:"Manto do firmamento",role:"Mago",shape:"mageCape",slot:"back",color:"#423368",trim:"#c9aaff",durability:280,
      stats:{manaRegen:.24},ingredients:[["wool",3],["wind_essence",2],["crystal_shard",1]],repair:[["wool",1],["wind_essence",1]],
      detail:"Mago. Regenera mana 24% mais rápido."},
    mage_trousers:{name:"Calças do conjurador",role:"Mago",shape:"mageLegs",slot:"legs",color:"#3d356e",trim:"#a6dbd8",durability:295,
      stats:{armor:.05,manaDiscount:.08},ingredients:[["wool",3],["crystal_shard",1]],repair:[["wool",1]],
      detail:"Mago. Reduz em 8% o custo de mana."},
    mage_boots:{name:"Botas do conjurador",role:"Mago",shape:"mageBoots",slot:"feet",color:"#4b3d64",trim:"#a6dbd8",durability:285,
      stats:{armor:.04,manaRegen:.12},ingredients:[["hide",2],["wool",2],["wind_essence",1]],repair:[["hide",1]],
      detail:"Mago. Regenera mana 12% mais rápido."},
    archer_hood:{name:"Capuz do mateiro",role:"Arqueiro",shape:"hood",slot:"head",color:"#3e5d45",trim:"#c6b374",durability:310,
      stats:{archeryCycle:.12},ingredients:[["wool",2],["hide",2],["feather",1]],repair:[["hide",1],["wool",1]],
      detail:"Arqueiro. Reduz em 12% o intervalo do arco e o tempo de armar a balestra."},
    archer_jerkin:{name:"Gibão do arqueiro",role:"Arqueiro",shape:"jerkin",slot:"chest",color:"#496a47",trim:"#d8af73",durability:415,
      stats:{armor:.15,archeryPower:.15},ingredients:[["hide",4],["wool",2],["bronze_ingot",1]],repair:[["hide",2],["bronze_ingot",1]],
      detail:"Arqueiro. +15% de dano com flechas e virotes."},
    archer_quiver:{name:"Aljava reforçada",role:"Arqueiro",shape:"quiver",slot:"back",color:"#805437",trim:"#d1b17d",durability:360,
      stats:{archerySpeed:.20},ingredients:[["hide",3],["stick",2],["feather",3]],repair:[["hide",1],["stick",1]],
      detail:"Arqueiro. Flechas e virotes viajam 20% mais rápido."},
    archer_trousers:{name:"Calças do arqueiro",role:"Arqueiro",shape:"archerLegs",slot:"legs",color:"#45573c",trim:"#c8a877",durability:360,
      stats:{armor:.10,archerySpeed:.09},ingredients:[["hide",3],["wool",2],["feather",1]],repair:[["hide",1]],
      detail:"Arqueiro. Aumenta em 9% a velocidade de flechas e virotes."},
    archer_boots:{name:"Botas do arqueiro",role:"Arqueiro",shape:"archerBoots",slot:"feet",color:"#66503c",trim:"#b6ba77",durability:325,
      stats:{armor:.055,archeryCycle:.06},ingredients:[["hide",3],["wool",1]],repair:[["hide",1]],
      detail:"Arqueiro. Reduz em 6% o intervalo do arco e a recarga da balestra."},
    melee_helm:{name:"Elmo da vanguarda",role:"Corpo a corpo",shape:"helm",slot:"head",color:"#62717e",trim:"#e0b577",durability:640,
      stats:{armor:.13},protections:{physical:.09},ingredients:[["steel_ingot",3],["hide",1],["bronze_ingot",1]],
      repair:[["steel_ingot",1]],detail:"Corpo a corpo. Elmo pesado que reforça a defesa física."},
    melee_plate:{name:"Armadura da vanguarda",role:"Corpo a corpo",shape:"plate",slot:"chest",color:"#525c6b",trim:"#ddb576",durability:810,
      stats:{armor:.31,meleePower:.14},ingredients:[["steel_ingot",4],["bronze_ingot",2],["hide",2]],repair:[["steel_ingot",2],["hide",1]],
      detail:"Corpo a corpo. Armadura pesada e +14% de dano com lâminas e maças."},
    melee_mantle:{name:"Manto da vanguarda",role:"Corpo a corpo",shape:"warCape",slot:"back",color:"#793e45",trim:"#e0b282",durability:390,
      stats:{meleePower:.09},ingredients:[["wool",4],["bronze_ingot",1],["hide",1]],repair:[["wool",2]],
      detail:"Corpo a corpo. +9% de dano com lâminas e maças."},
    melee_trousers:{name:"Calças da vanguarda",role:"Corpo a corpo",shape:"meleeLegs",slot:"legs",color:"#556171",trim:"#d9aa70",
      finish:"metal",durability:690,stats:{armor:.18,meleePower:.08},ingredients:[["steel_ingot",3],["hide",2]],
      repair:[["steel_ingot",1],["hide",1]],detail:"Corpo a corpo. Perneiras de aço com +8% de dano com lâminas e maças."},
    melee_boots:{name:"Botas da vanguarda",role:"Corpo a corpo",shape:"meleeBoots",slot:"feet",color:"#4a5662",trim:"#d9aa70",
      finish:"metal",durability:610,stats:{armor:.115,fall:.78},ingredients:[["steel_ingot",2],["hide",2],["bronze_ingot",1]],
      repair:[["steel_ingot",1]],detail:"Corpo a corpo. Botas de placas que reduzem em 22% o dano de queda."}
  });
  const metalSets=[
    {id:"copper",name:"cobre",ingot:"copper_ingot",color:"#aa6347",trim:"#f0b079",durability:355,armor:[.17,.10,.06]},
    {id:"bronze",name:"bronze",ingot:"bronze_ingot",color:"#916a3b",trim:"#efc385",durability:520,armor:[.225,.14,.085]},
    {id:"steel",name:"aço",ingot:"steel_ingot",color:"#677c8b",trim:"#c6e3e8",durability:765,armor:[.31,.19,.12]}
  ];
  const metalApparel=Object.fromEntries(metalSets.flatMap(set=>[
    ["cuirass","chest","Peitoral","metalPlate",5,1],
    ["leggings","legs","Perneiras","metalLegs",4,.89],
    ["boots","feet","Botas","metalBoots",3,.81]
  ].map(([id,slot,name,shape,ingots,life],index)=>[set.id+"_"+id,{
    name:name+" de "+set.name,role:"Armaduras de metal",shape,slot,color:set.color,trim:set.trim,finish:"metal",
    durability:Math.round(set.durability*life),stats:{armor:set.armor[index]},
    ingredients:[[set.ingot,ingots],["hide",2]],repair:[[set.ingot,index===0?2:1],["hide",1]],
    detail:"Armadura de "+set.name+" com placas rebitadas e forro de couro."
  }])));
  const spectralApparel=Object.fromEntries([
    ["hood","head","Elmo fantasmagórico","helm",.18,2],
    ["coat","chest","Peitoral fantasmagórico","plate",.34,3],
    ["leggings","legs","Perneiras fantasmagóricas","metalLegs",.22,2],
    ["boots","feet","Botas fantasmagóricas","metalBoots",.16,2]
  ].map(([key,slot,name,shape,ward,amount])=>["spectral_"+key,{
    name,shape,slot,role:"Fantasmagórico",color:"#344f65",trim:"#79efda",finish:"spectral",
    durability:295,stats:{spectralWard:ward},ingredients:[["ectoplasm",amount],["wool",1]],
    repair:[["ectoplasm",1],["wool",1]],
    detail:"Reduz em "+Math.round(ward*100)+"% o dano de criaturas fantasma enquanto estiver íntegro."
  }]));
  const corruptedApparel=Object.freeze({
    corrupted_helm:{name:"Elmo dos Mil Olhos",role:"Corrompido",shape:"helm",slot:"head",color:"#361c4e",trim:"#eb82ff",
      finish:"corrupted",corrupted:true,durability:760,stats:{armor:.16,meleePower:.08,magicPower:.08},protections:{physical:.12},
      ingredients:[["corrupted_ingot",3],["corrupted_shard",2],["CORRUPTED_GEM",1]],repair:[["corrupted_ingot",1],["corrupted_shard",1]],
      detail:"Corrompido. Elmo vivo com olhos brilhantes. +8% de dano físico e mágico, alta defesa e sussurros antigos constantes."},
    corrupted_plate:{name:"Peitoral Corrompido",role:"Corrompido",shape:"plate",slot:"chest",color:"#2d1642",trim:"#f079cf",
      finish:"corrupted",corrupted:true,durability:940,stats:{armor:.36,meleePower:.14,magicPower:.12},protections:{physical:.16},
      ingredients:[["corrupted_ingot",5],["corrupted_shard",3],["CORRUPTED_GEM",1]],repair:[["corrupted_ingot",2],["corrupted_shard",1]],
      detail:"Corrompido. Armadura pesada de metal abissal. +14% de dano corpo a corpo, +12% de poder mágico e sussurros dos Deuses Antigos."},
    corrupted_leggings:{name:"Perneiras Corrompidas",role:"Corrompido",shape:"metalLegs",slot:"legs",color:"#321847",trim:"#d97aff",
      finish:"corrupted",corrupted:true,durability:820,stats:{armor:.22,meleePower:.08,archeryPower:.08},
      ingredients:[["corrupted_ingot",4],["corrupted_shard",2]],repair:[["corrupted_ingot",1],["corrupted_shard",1]],
      detail:"Corrompido. Placas sombrias articuladas. +8% de dano físico e à distância com sussurros abissais."},
    corrupted_boots:{name:"Botas Corrompidas",role:"Corrompido",shape:"metalBoots",slot:"feet",color:"#28133a",trim:"#d97aff",
      finish:"corrupted",corrupted:true,durability:740,stats:{armor:.14,fall:.72},
      ingredients:[["corrupted_ingot",3],["corrupted_shard",2]],repair:[["corrupted_ingot",1]],
      detail:"Corrompido. Botas pesadas do Império Negro que reduzem em 28% o dano de queda e ecoam sussurros a cada passo."},
    corrupted_mantle:{name:"Manto do Império Negro",role:"Corrompido",shape:"mageCape",slot:"back",color:"#311446",trim:"#ff84c8",
      finish:"corrupted",corrupted:true,durability:520,stats:{magicPower:.12,manaRegen:.28},
      ingredients:[["wool",3],["corrupted_ingot",1],["CORRUPTED_GEM",1],["corrupted_shard",2]],repair:[["corrupted_shard",1],["wool",1]],
      detail:"Corrompido. Manto encharcado de sombras antigas. +12% de dano mágico, +28% de regeneração de mana e sussurros constantes."}
  });
  const lightApparel=Object.freeze({
    light_halo_crown:{name:"Coroa Radiante da Luz",role:"Luz Sagrada",shape:"circlet",slot:"head",color:"#f3cc5a",trim:"#fff9d6",
      finish:"light",lightGear:true,durability:740,stats:{armor:.16,magicPower:.10,sanityWard:.75,sanityRegen:3.2},protections:{physical:.10},
      ingredients:[["DAWN_GOLD",3],["HOLY_LIGHT",1],["gold_nugget",2]],repair:[["DAWN_GOLD",1],["gold_nugget",1]],
      detail:"Equipamento de Luz. Emite claridade dourada, reduz em 75% a perda de sanidade causada por sussurros e restaura a mente continuamente."},
    light_aegis_plate:{name:"Couraça da Luz Sagrada",role:"Luz Sagrada",shape:"plate",slot:"chest",color:"#f0e5c8",trim:"#ffd966",
      finish:"light",lightGear:true,durability:920,stats:{armor:.35,meleePower:.10,sanityWard:.65,sanityRegen:2.6},protections:{physical:.18},
      ingredients:[["DAWN_GOLD",4],["DAWN_MARBLE",3],["HOLY_LIGHT",1]],repair:[["DAWN_GOLD",2],["DAWN_MARBLE",1]],
      detail:"Armadura abençoada pela Primeira Luz. Reduz em 65% a perda de sanidade e protege contra corrupção ancestral e golpes físicos."},
    light_dawn_mantle:{name:"Manto da Alvorada",role:"Luz Sagrada",shape:"mageCape",slot:"back",color:"#f5eed8",trim:"#ffe07a",
      finish:"light",lightGear:true,durability:540,stats:{manaRegen:.26,sanityWard:.55,sanityRegen:2.4},
      ingredients:[["wool",4],["DAWN_GOLD",2],["HOLY_LIGHT",1]],repair:[["wool",2],["DAWN_GOLD",1]],
      detail:"Manto tecido sob bênção de Naaru. Reduz em 55% a perda de sanidade por sussurros e regenera mana e lucidez."}
  });
  const apparel=Object.freeze({
    ...classGear,
    ...spectralApparel,
    ...corruptedApparel,
    ...lightApparel,
    buffer_armor:{name:"Armadura Tampônica",role:"Proteção",shape:"bufferSuit",slot:"chest",color:"#274849",trim:"#c9bd54",
      durability:160,stats:{armor:.19},ingredients:[["ceramic_plate",2],["bronze_ingot",2],["hide",2],["buffer_solution",2]],
      repair:[["buffer_solution",1],["ceramic_plate",1]],
      detail:"Reservatórios de solução tampão reduzem em 75% o dano de corrosão do Slime Ácido e de outras fontes. Recarregue na oficina de reparo."},
    ear_protectors:{name:"Protetores de ouvido",role:"Proteção",shape:"earProtectors",slot:"head",color:"#334657",trim:"#dca955",
      durability:225,stats:{hearingProtection:.86},ingredients:[["wool",2],["hide",1],["iron_ingot",1]],repair:[["wool",1],["hide",1]],
      detail:"Abafadores acolchoados. Reduzem em 86% o dano do grito do Gritador."},
    travel_tunic:{name:"Túnica de viagem",role:"Vestuário",shape:"tunic",slot:"chest",color:"#846749",trim:"#e5ca91",
      durability:245,stats:{armor:.045,insulation:.18,coldResistance:.12},protections:{thermal:.12},
      ingredients:[["wool",3],["hide",1]],repair:[["wool",1]],
      detail:"Túnica de lã com faixa de couro, forro leve e proteção térmica."},
    explorer_backpack:{name:"Mochila do Explorador",role:"Mochila",shape:"backpack",slot:"back",color:"#7c5334",trim:"#d9b25f",
      durability:900,stats:{backpackSlots:28,backpackMaxSlots:34},
      ingredients:[["hide",5],["wool",3],["iron_ingot",2]],repair:[["hide",2]],
      detail:"Equipada nas costas. Concede 28 slots extras de inventário (expansível até 34 slots com Bolsos de Expansão). Abra no Inventário (Tab) ou com B."},
    archmage_robe:{name:"Traje arcano de mago",role:"Mago",shape:"arcaneRobe",slot:"chest",color:"#2e4268",trim:"#9ce6d6",
      durability:400,stats:{armor:.08,magicPower:.20,manaDiscount:.14},protections:{electric:.12},
      ingredients:[["wool",5],["crystal_shard",3],["wind_essence",2]],repair:[["wool",2],["crystal_shard",1]],
      detail:"Traje longo bordado. +20% de dano mágico e 14% a menos de mana por conjuração."},
    dragonhide_coat:{name:"Casaco de couro de dragão",role:"Couro de dragão",shape:"dragonCoat",slot:"chest",color:"#563743",trim:"#e7a68a",
      finish:"dragon",durability:660,stats:{armor:.23,insulation:.24,heatResistance:.22,coldResistance:.15},
      protections:{fire:.24,thermal:.20},
      ingredients:[["dragon_hide",4],["hide",2],["bronze_ingot",1]],repair:[["dragon_hide",1],["hide",1]],
      detail:"Casaco de couro escamado com proteção contra fogo e temperaturas extremas."},
    dragonhide_trousers:{name:"Calças de couro de dragão",role:"Couro de dragão",shape:"dragonLegs",slot:"legs",color:"#5e3c48",trim:"#dc9d81",
      finish:"dragon",durability:545,stats:{armor:.145},protections:{fire:.14},
      ingredients:[["dragon_hide",3],["wool",2]],repair:[["dragon_hide",1]],
      detail:"Calças flexíveis com escamas sobre as coxas e proteção contra fogo."},
    dragonhide_boots:{name:"Botas de couro de dragão",role:"Couro de dragão",shape:"dragonBoots",slot:"feet",color:"#4a303a",trim:"#db9f85",
      finish:"dragon",durability:490,stats:{armor:.091,insulation:.10,heatResistance:.08,coldResistance:.08},
      protections:{fire:.12,thermal:.10},
      ingredients:[["dragon_hide",2],["hide",2]],repair:[["dragon_hide",1]],
      detail:"Botas forradas de couro dracônico que protegem contra fogo e temperaturas extremas."},
    ...metalApparel
  });
  const gauntlets=[
    ["fire","Fogo","#70322e","#ffc174",15,.32,"sulfur","Incendeia o alvo com brasas."],
    ["magma","Magma","#3f2c34","#ff724b",23,.59,"MAGMA_ROCK","Espalha respingos de magma e queima mais tempo."],
    ["stone","Pedra","#63625e","#d1af85",20,.48,"STONE","Empurra e atordoa com uma pancada de fragmentos."],
    ["ice","Gelo","#4e87a6","#aeeaff",14,.35,"ICE","Desacelera o alvo e solta estilhaços de gelo."],
    ["lightning","Raio","#514b7a","#f3e790",17,.30,"voltaic_cell","Solta faíscas e atordoa brevemente."],
    ["venom","Veneno","#354b38","#b7ee68",13,.29,"venom","Aplica veneno em contato e solta gotas verdes."]
  ];
  for(const [element,label,color,trim,damage,cooldown,ingredient,detail] of gauntlets){
    weapons["gauntlets_"+element]={
      name:"Luvas de "+label,family:"gauntlet",style:element,element,color,trim,damage,cooldown,
      reach:2.48,arc:.43,twoHanded:true,durability:365,ingredients:[["hide",3],["bronze_ingot",1],[ingredient,2]],
      repair:[["hide",1],[ingredient,1]],detail
    };
  }
  weapons.spectral_gauntlets={
    name:"Luvas fantasmagóricas",family:"gauntlet",style:"spectralGauntlets",element:"spectral",
    spectralWeapon:true,color:"#365b74",trim:"#8bffe6",damage:18,cooldown:.34,reach:2.52,arc:.43,
    twoHanded:true,durability:375,ingredients:[["ectoplasm",4],["hide",2],["silver_ingot",1]],
    repair:[["ectoplasm",1],["hide",1]],detail:"Um par de manoplas luminosas que permite atingir criaturas fantasma com socos."
  };
  weapons.corrupted_gauntlets={
    name:"Garras do Abismo",family:"gauntlet",style:"corruptedGauntlets",element:"void",
    corrupted:true,lifesteal:2,color:"#3c1b59",trim:"#f484ff",damage:25,cooldown:.30,reach:2.65,arc:.45,
    twoHanded:true,durability:560,ingredients:[["corrupted_ingot",3],["corrupted_shard",3],["hide",2]],
    repair:[["corrupted_ingot",1],["corrupted_shard",1]],
    detail:"Manoplas vivas cravejadas de olhos e garras. Golpes rápidos de 25 de dano drenam 2 PV e despertam sussurros antigos."
  };
  const melee=weapon=>Number.isFinite(weapon?.reach)&&weapon.family!=="staff";
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
  const classGearRecipes=B=>Object.entries(classGear).map(([id,item])=>recipe(B,id,item));
  const apparelRecipes=B=>Object.entries(apparel).map(([id,item])=>recipe(B,id,item));
  function equipment(){
    const abbr={sword:"LÂMINA",bow:"ARCO",crossbow:"BALESTRA",staff:"CAJADO",mace:"MAÇA",gauntlet:"LUVAS"};
    const tools=Object.fromEntries(variants.map(([id,w])=>[id,{
      slot:"tool",abbr:w.style==="wand"?"VARINHA":abbr[w.family],corrupted:!!w.corrupted,maxDurability:w.durability,protections:{},effect:w.detail,repair:w.repair
    }]));
    const guard=Object.fromEntries(Object.entries(shields).map(([id,s])=>[id,{
      slot:"offhand",abbr:"ESCUDO",corrupted:!!s.corrupted,lightGear:!!s.lightGear,armor:s.armor,blockChance:s.blockChance,blockReduction:s.reduction,dragonGuard:s.dragonGuard,mirrorGuard:s.mirrorGuard,
      sanityWard:s.sanityWard||0,sanityRegen:s.sanityRegen||0,
      protections:s.protections,maxDurability:s.durability,effect:s.detail,repair:s.repair
    }]));
    const held=Object.fromEntries(Object.entries(focuses).map(([id,item])=>[id,{
      slot:"offhand",abbr:item.shape==="book"||item.shape==="corruptedBook"||item.shape==="summonBook"?"LIVRO":"ORBE",corrupted:!!item.corrupted,lightGear:!!item.lightGear,
      sanityWard:item.sanityWard||0,sanityRegen:item.sanityRegen||0,maxDurability:item.durability,
      protections:{},effect:item.detail,repair:item.repair
    }]));
    const wearables=Object.fromEntries(Object.entries(apparel).map(([id,item])=>[id,{
      slot:item.slot,abbr:item.role==="Corpo a corpo"?"VANG.":item.role==="Corrompido"?"ABISMO":item.role==="Luz Sagrada"?"LUZ":item.role.toUpperCase(),
      corrupted:!!item.corrupted,lightGear:!!item.lightGear,maxDurability:item.durability,protections:item.protections??{},effect:item.detail,repair:item.repair,...item.stats
    }]));
    return {...tools,...guard,...held,...wearables};
  }
  const isCorrupted=id=>!!(weapons[id]?.corrupted||shields[id]?.corrupted||focuses[id]?.corrupted||apparel[id]?.corrupted);
  const isLightGear=id=>!!(weapons[id]?.lightGear||shields[id]?.lightGear||focuses[id]?.lightGear||apparel[id]?.lightGear||id==="holy_staff");
  return {weapons:Object.freeze(weapons),shields,focuses,classGear,apparel,recipes,shieldRecipes,focusRecipes,classGearRecipes,apparelRecipes,equipment,melee,isCorrupted,isLightGear};
})();

