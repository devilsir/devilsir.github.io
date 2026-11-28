"use strict";

globalThis.QuimiCraftAncients=(()=>{
  const profiles=[
    {id:"sarvaz",name:"Sarvaz, o Olho das Dunas",cave:"Fenda do Olho Âmbar",
      regions:["deserto","badlands","chapadas ocres","salinas","savana","cânion calcário"],rock:"RED_SAND",
      dark:[55,24,38],body:[152,72,52],accent:[255,183,79],corruption:"Crosta de âmbar",light:"Nódulo de âmbar vivo",
      form:"prism",hp:225,attack:"Olhar de Âmbar",pattern:"line",range:14,damage:19,reward:"gold_nugget",
      lore:"Inspirado nos antigos olhos abissais enterrados sob a areia: um globo colossal cercado de olhos vigias, uma boca circular cheia de dentes e tentáculos carnosos que corrompem criaturas e minérios ao redor.",
      whispers:[
        "Seu coração vai explodir sob o meu olhar…",
        "Você já está morto. Só ainda não percebeu.",
        "Cada grão de areia é um olho que observa seus passos.",
        "Seus aliados vão trair você antes do próximo amanhecer."
      ]},
    {id:"mormur",name:"Mormur, a Fera das Mil Bocas",cave:"Gruta das Mil Bocas",
      regions:["tundra","fiordes glaciais","taiga","campina de aurora","prado alpino"],rock:"SLATE",
      dark:[28,31,61],body:[68,94,158],accent:[157,211,255],corruption:"Geada murmurante",light:"Nódulo de gelo vivo",
      form:"chimes",hp:255,attack:"Coro das Mil Bocas",pattern:"ring",range:12,damage:21,slow:2.4,reward:"ICE",
      lore:"Um colosso de carne gélida coberto por bocas escancaradas cheias de presas, olhos azuis vigilantes e tentáculos trituradores. Seu sangue negro corrompe os veios de minério da gruta e sussurra nas armas forjadas com ele.",
      whispers:[
        "Eu sou o sonho lúcido… o monstro nos seus pesadelos.",
        "O demônio de mil faces ri enquanto você empunha meu sangue.",
        "Curve-se diante do deus da morte congelada.",
        "Nenhuma lâmina afiada calará o coro que vive dentro do metal."
      ]},
    {id:"nacreon",name:"Nacreon, o Corruptor da Maré",cave:"Galeria do Abismo Nacre",
      regions:["manguezal","delta salobro","termas minerais"],rock:"LIMESTONE",
      dark:[17,40,51],body:[48,118,122],accent:[106,255,208],corruption:"Nácar sombrio",light:"Nódulo de nácar vivo",
      form:"shell",hp:240,attack:"Maré dos Olhos",pattern:"disk",range:13,damage:19,slow:1.6,reward:"wind_essence",
      lore:"Sob uma carapaça abissal cravejada de olhos brilhantes, sua bocarra cheia de dentes afiados e seus longos tentáculos espalham a corrupção das profundezas por bestas e veios minerais.",
      whispers:[
        "Todos os lugares… todas as coisas têm almas. Todas podem ser devoradas.",
        "O círculo das estrelas foi tecido de carne viva.",
        "Abra os olhos. Deixe a maré negra remodelar sua mente.",
        "Apenas eu posso salvar você do que espreita além do véu."
      ]},
    {id:"veltrio",name:"Veltrio, o Coração de Sete Mandíbulas",cave:"Câmara do Coração Rubro",
      regions:["selva tropical","floresta de sequoias","bosque de cerejeiras","bosque lilás","floresta"],rock:"FOREST_LOAM",
      dark:[58,18,34],body:[154,44,72],accent:[255,98,126],corruption:"Raiz rubra",light:"Nódulo de seiva viva",
      form:"heart",hp:275,attack:"Fúria das Mandíbulas",pattern:"pulse",range:11,damage:26,reward:"AMETHYST",
      lore:"Um coração ancestral pulsante coroado por cabeças ferozes cheias de presas, dezenas de olhos carmesins e tentáculos enraizados. Sua pulsação fortalece e corrompe monstros próximos.",
      whispers:[
        "Com cada batimento, sua dúvida cresce e sua vontade enfraquece.",
        "Deixe a raiva guiar sua arma. Mate tudo o que respirar.",
        "Mesmo enterrado, meu coração ainda bombeia veneno nas veias da terra.",
        "A carne dos vivos é frágil… mas meu metal é eterno."
      ]},
    {id:"fermento",name:"Fermento, o Devorador Pútrido",cave:"Incubadora de Carne Viva",
      regions:["pântano","termas minerais","delta salobro","manguezal","selva tropical"],rock:"PEAT",
      dark:[39,43,23],body:[112,118,46],accent:[215,250,100],corruption:"Tapete de esporos",light:"Nódulo de esporos vivos",
      form:"caps",hp:215,attack:"Vômito de Esporos",pattern:"spores",range:13,damage:15,reward:"acid_gel",
      lore:"Uma abominação de bolsas carnudas, bocas circulares repletas de dentes serrilhados, cachos de olhos amarelados e tentáculos viscosos que transformam a pedra e a fauna em extensões da praga.",
      whispers:[
        "A podridão é apenas vida que recusou obedecer.",
        "Respire fundo… sinta os esporos abrindo novos olhos em você.",
        "Tudo apodrece, menos a fome que mastiga sob a terra.",
        "Sua armadura respira junto com a minha carne."
      ]}
  ];
  const family={
    sem_rosto:{name:"Sem-Rosto da Fenda",form:"faceless",radius:.53,height:2.38,
      lore:"Servo N'raqi sem rosto humano: tentáculos contorcidos brotam da boca dentada enquanto olhos abissais brilham na carapaça.",
      profile:{hp:52,walk:1.18,run:3.05,sense:14,roam:6,strike:{kind:"slam",name:"Golpe do Sem-Rosto",range:2.45,windup:.66,cooldown:2.3,damage:14},loot:[["corrupted_shard",1,2,.82],["crystal_shard",1,2,.55]]}},
    insectoide:{name:"Insetoide da Fenda",form:"beetle",radius:.46,height:1.12,
      lore:"Quitina negra, seis olhos cintilantes, mandíbulas serrilhadas e tentáculos dorsais que avançam sobre intrusos na área corrompida.",
      profile:{hp:32,walk:1.34,run:3.55,sense:13,roam:6,strike:{kind:"lunge",name:"Mordida de Quitina",range:1.72,windup:.32,cooldown:1.5,damage:9},loot:[["chitin",1,2,1],["corrupted_shard",1,1,.52]]}},
    tentaculo_ancestral:{name:"Tentáculo Ancestral",form:"tentacle",radius:.50,height:2.72,
      lore:"Tentáculo brotando de uma cratera dentada, cravejado de ventosas e encimado por um olho vigilante.",
      profile:{hp:36,loot:[["corrupted_shard",1,2,.75],["crystal_shard",1,1,.45]]},
      attack:"Chicotada Abissal",pattern:"pulse",range:3.8,damage:12},
    devorador_mente:{name:"Devorador de Mentes",form:"mindflayer",radius:.52,height:2.35,
      lore:"Conjurador C'Thraxxi flutuante com crânio enrugado, seis olhos brilhantes e seis tentáculos faciais que disparam rajadas psíquicas de corrupção.",
      profile:{hp:58,walk:1.12,run:2.75,sense:15,roam:6,strike:{kind:"shot",name:"Rajada Psíquica",range:13,windup:.74,cooldown:2.65,damage:12,elemental:"void",speed:13,color:0xd866ff,corrupted:12},
        loot:[["corrupted_shard",2,3,.90],["crystal_shard",1,2,.65]]}},
    olho_errante:{name:"Olho da Fenda",form:"gazer",radius:.56,height:2.15,flying:true,
      lore:"Globo ocular abissal flutuante com pupila vertical, boca inferior cheia de presas e tentáculos pendentes que vigia o território corrompido.",
      profile:{hp:46,walk:1.25,run:3.05,sense:16,roam:8,strike:{kind:"shot",name:"Raio Ocular",range:14,windup:.68,cooldown:2.45,damage:11,elemental:"void",speed:15,color:0xff7ad2,corrupted:10},
        loot:[["corrupted_shard",1,2,.85],["old_god_eye",1,1,.18]]}},
    bruto_abissal:{name:"Colosso C'Thraxxi",form:"cthraxxi",radius:.84,height:3.15,
      lore:"General colossal dos Deuses Antigos com bocas cheias de dentes nos ombros e no ventre, múltiplos olhos e garras esmagadoras.",
      profile:{hp:138,walk:.96,run:2.48,sense:14,roam:5,strike:{kind:"slam",name:"Esmagamento do Abismo",range:3.0,windup:.78,cooldown:2.55,damage:22,corrupted:15},
        loot:[["corrupted_shard",3,5,1],["CORRUPTED_ORE",1,2,.75],["old_god_eye",1,1,.30]]}},
    kthir_harbinger:{name:"Arauto K'thir",form:"kthir",radius:.56,height:2.55,
      lore:"Profeta abissal encapuzado de seis tentáculos faciais e coroa do vazio que entoa sussurros destruidores de sanidade.",
      profile:{hp:96,walk:1.12,run:2.72,sense:16,roam:6,strike:{kind:"shot",name:"Sussurro Sombrio",range:14,windup:.70,cooldown:2.45,damage:14,elemental:"void",speed:14,color:0xc968ff,corrupted:16},
        loot:[["corrupted_shard",2,4,.95],["old_god_eye",1,1,.25]]}},
    aqir_colossus:{name:"Colosso Aqir",form:"aqir",radius:.76,height:2.15,
      lore:"Escaravelho-guerreiro gigantesco do Império Negro com mandíbulas serrilhadas, quatro patas blindadas e espinhos venenosos.",
      profile:{hp:128,walk:1.14,run:2.95,sense:15,roam:6,strike:{kind:"slam",name:"Pinça do Império Negro",range:2.75,windup:.62,cooldown:2.15,damage:19,corrupted:14},
        loot:[["chitin",3,5,1],["corrupted_shard",2,4,.88]]}},
    void_horror:{name:"Horror do Vazio",form:"voidhorror",radius:.58,height:2.25,flying:true,
      lore:"Manifestação flutuante de vazio puro repleta de olhos que piscam, boca dentada central e tentáculos que drenam a lucidez.",
      profile:{hp:86,walk:1.22,run:3.02,sense:17,roam:8,strike:{kind:"shot",name:"Pulso de Loucura",range:13.5,windup:.66,cooldown:2.35,damage:13,elemental:"void",speed:15,color:0xb252ff,corrupted:18},
        loot:[["corrupted_shard",2,4,.9],["old_god_eye",1,1,.22]]}}
  };
  const items={
    corrupted_shard:["Fragmento Corrompido","#c96ef5","Estilhaço pulsante obtido de criaturas corrompidas, minérios profanados ou lacaios dos Deuses Antigos."],
    corrupted_ingot:["Lingote Corrompido","#7f48a8","Liga viva fundida a partir de Minério Corrompido. Pulsa com sussurros abissais e fortalece armas e armaduras."],
    old_god_eye:["Olho do Deus Antigo","#ff77b7","Globo ainda vigilante arrancado de um Deus Antigo. Embutido em armas e armaduras do Império Negro."]
  };
  const whispers={
    ambient:[
      "Os olhos no metal nunca piscam… e nunca esquecem.",
      "Você ouviu isso? Algo se mexeu atrás de você.",
      "O aço comum enferruja. O nosso sangue apenas desperta.",
      "Continue descendo… há bocas esperando sob a rocha.",
      "Quanto mais você usa este poder, mais parecido conosco você fica.",
      "Não tire a armadura. Sem nós, você é frágil demais.",
      "O mundo acima é uma casca fina sobre o nosso trono.",
      "Sussurramos porque você finalmente aprendeu a escutar."
    ],
    equip:[
      "Sim… vista a nossa carne. Sinta a força pulsar nas veias.",
      "Agora estamos ligados. Nenhum golpe será desperdiçado.",
      "Você escolheu o poder das profundezas. Nós aceitamos você.",
      "O metal vivo se molda ao seu corpo… e à sua mente."
    ],
    combat:[
      "Sim! Rasgue a carne deles!",
      "A lâmina tem fome… alimente-a!",
      "Eles sangram tão fácil… dê-nos mais!",
      "Sinta o poder correndo pelo seu braço!"
    ],
    kill:[
      "Mais uma alma devorada pelas profundezas…",
      "A morte deles fortalece o nosso império.",
      "Excelente… agora procure a próxima presa.",
      "O silêncio da presa é música para mil bocas."
    ],
    hurt:[
      "Sua casca racha… deixe a corrupção fechar a ferida.",
      "Você é fraco demais sozinho. Entregue o controle.",
      "A dor é apenas a velha mente resistindo ao despertar.",
      "Eles feriram você… faça-os pagar em dobro!"
    ],
    mine:[
      "Você escava o meu sangue petrificado…",
      "Quebre a rocha… liberte o que dorme lá dentro.",
      "Cada golpe de picareta ecoa nos nossos sonhos.",
      "Leve este minério à forja… deixe-nos ganhar forma."
    ]
  };
  const paletteKey=type=>type.toUpperCase();
  const rgbHex=rgb=>"#"+rgb.map(n=>n.toString(16).padStart(2,"0")).join("");
  const colorNumber=rgb=>rgb[0]*65536+rgb[1]*256+rgb[2];
  const tiles=new Map(),groundTypes=new Map();
  const CORRUPTED_ORE_ID=710,CORRUPTED_GEM_ID=711,CORRUPTED_ORE_TILE=248,CORRUPTED_GEM_TILE=249;
  const SCULK_BLOCK_ID=712,SCULK_VEIN_ID=713,SCULK_SENSOR_ID=714,SCULK_CATALYST_ID=715;
  const SCULK_BLOCK_TILE=250,SCULK_VEIN_TILE=251,SCULK_SENSOR_TILE=252,SCULK_CATALYST_TILE=253;
  const creatures=Object.fromEntries(profiles.map(p=>[p.id,{
    ...p,radius:2.15,height:4.95,profile:{hp:p.hp,loot:[[p.reward,3,5,1],["corrupted_shard",4,7,1],["CORRUPTED_ORE",3,5,1],["old_god_eye",1,2,1]]}
  }]));
  Object.assign(creatures,family);
  for(const data of Object.values(creatures)){
    data.anchored=!!data.pattern;
    data.profile={temperament:"hostile",walk:0,run:1,sense:0,roam:0,...data.profile};
  }
  function register(B,defs){
    profiles.forEach((p,i)=>{
      const key=paletteKey(p.id),crust=690+i*2,light=crust+1,tile=229+i*2;
      B["CORRUPCAO_"+key]=crust;
      B["NODULO_"+key]=light;
      defs[crust]={name:p.corruption,solid:true,tex:tile,hard:1.18,icon:rgbHex(p.body)};
      defs[light]={name:p.light,solid:true,tex:tile+1,hard:.75,icon:rgbHex(p.accent)};
      tiles.set(tile,{p,glow:false});tiles.set(tile+1,{p,glow:true});
      groundTypes.set(crust,p);groundTypes.set(light,p);
    });
    B.CORRUPTED_ORE=CORRUPTED_ORE_ID;
    B.CORRUPTED_GEM=CORRUPTED_GEM_ID;
    B.SCULK_CORRUPTION=SCULK_BLOCK_ID;
    B.SCULK_VEIN=SCULK_VEIN_ID;
    B.SCULK_SENSOR=SCULK_SENSOR_ID;
    B.SCULK_CATALYST=SCULK_CATALYST_ID;
    defs[CORRUPTED_ORE_ID]={name:"Minério Corrompido",solid:true,tex:CORRUPTED_ORE_TILE,hard:2.15,icon:"#8f4bc7"};
    defs[CORRUPTED_GEM_ID]={name:"Cristal Corrompido",solid:true,tex:CORRUPTED_GEM_TILE,hard:1.85,icon:"#e062c4"};
    defs[SCULK_BLOCK_ID]={name:"Crosta Abissal",solid:true,tex:SCULK_BLOCK_TILE,hard:.95,icon:"#102636"};
    defs[SCULK_VEIN_ID]={name:"Veio Abissal",solid:false,tex:SCULK_VEIN_TILE,hard:.25,icon:"#42d6d4",plant:true};
    defs[SCULK_SENSOR_ID]={name:"Broto-Tentáculo Abissal",solid:false,tex:SCULK_SENSOR_TILE,hard:.55,icon:"#9e5cf0",partial:true};
    defs[SCULK_CATALYST_ID]={name:"Catalisador Abissal",solid:true,tex:SCULK_CATALYST_TILE,hard:1.45,icon:"#562b70"};
    tiles.set(CORRUPTED_ORE_TILE,{ore:"metal"});
    tiles.set(CORRUPTED_GEM_TILE,{ore:"gem"});
    tiles.set(SCULK_BLOCK_TILE,{sculk:"block"});
    tiles.set(SCULK_VEIN_TILE,{sculk:"vein"});
    tiles.set(SCULK_SENSOR_TILE,{sculk:"sensor"});
    tiles.set(SCULK_CATALYST_TILE,{sculk:"catalyst"});
    groundTypes.set(SCULK_BLOCK_ID,profiles[2]);
    groundTypes.set(SCULK_CATALYST_ID,profiles[2]);
  }
  const noduleMarks={
    sarvaz:(u,v)=>Math.hypot(u*.69,v)<7.4,
    mormur:(u,v)=>u<10&&Math.abs(v-2.7-Math.sin(u*.77)*2.6)<1.85,
    nacreon:(u,v)=>Math.hypot(u*.85,v)<10&&Math.abs(Math.sin(Math.atan2(v,u)*7+v*.27))<.38,
    veltrio:(u,v)=>u+v<5||u<11&&Math.abs(v-u*.54-3.2)<1.4,
    fermento:(u,v)=>Math.min(Math.hypot(u-4,v-4),Math.hypot(u-9,v-3.2),Math.hypot(u-2.3,v-9))<2.7
  };
  function paint(tile,x,y,hash){
    const entry=tiles.get(tile);
    if(!entry)return null;
    if(entry.sculk){
      const grain=(hash(x,y,tile)-.5)*16;
      const w1=Math.sin(x*.35+Math.sin(y*.28)*1.8)+Math.cos(y*.33+Math.sin(x*.24)*1.6);
      const w2=Math.abs(Math.sin((x+y)*.26+Math.sin((x-y)*.22)*1.5));
      const star=hash(x>>1,y>>1,tile+91)>.915;
      if(entry.sculk==="block"){
        // Minecraft Sculk-inspired deep dark teal/obsidian speckled with bioluminescent cyan-violet tendrils
        const glowRim=w2<.12||star;
        const mid=w1>.75||w2<.24;
        const col=star?[116,252,238]:glowRim?[172,88,248]:mid?[20,76,94]:[10,16,28];
        return [...col.map(c=>c+grain*(glowRim?.5:.7)),255];
      }
      if(entry.sculk==="vein"){
        const net=w2<.22||Math.abs(Math.sin(x*.41-y*.37))<.16;
        if(!net&&!star)return [14,22,36,0];
        const col=star?[136,255,244]:w2<.11?[192,108,255]:[24,116,138];
        return [...col.map(c=>c+grain*.4),235];
      }
      if(entry.sculk==="sensor"){
        const pulse=Math.hypot(x-15.5,y-15.5)<8;
        const col=pulse?[142,248,242]:w2<.2?[182,84,250]:[28,24,48];
        return [...col.map(c=>c+grain*.5),255];
      }
      // catalyst: bone-rimmed dark abyssal sculk with eerie center eye-maw
      const border=x<3||x>28||y<3||y>28;
      const dist=Math.hypot(x-15.5,y-15.5);
      const col=border?[210,196,166]:dist<3.2?[16,6,24]:dist<6.4?[238,142,255]:w2<.18?[62,216,214]:[18,16,32];
      return [...col.map(c=>c+grain*.5),255];
    }
    if(entry.ore){
      const grain=(hash(x,y,tile)-.5)*20;
      const dx=x-15.5,dy=y-15.5,dist=Math.hypot(dx,dy);
      if(entry.ore==="metal"){
        const vein=Math.abs(Math.sin(x*.31+y*.27+Math.sin(y*.37)*1.5));
        const crack=Math.abs(Math.sin(y*.43-x*.29+Math.sin(x*.26)*1.4));
        const eye=Math.hypot((x-11)*.95,y-12)<3.1||Math.hypot((x-22)*.95,y-21)<2.7;
        const pupil=Math.hypot(x-11,y-12)<1.15||Math.hypot(x-22,y-21)<1.0;
        const color=pupil?[18,8,24]:eye?[255,192,102]:vein<.16&&crack<.46?[196,92,245]:vein<.25?[116,52,162]:[38,28,46];
        return [...color.map(c=>c+grain*(pupil?.2:.85)),255];
      }
      const facet=Math.abs(Math.sin(x*.39+y*.49))+Math.abs(Math.sin(x*.22-y*.35))*.5;
      const eye=dist<4.6&&Math.abs(dy)<3.1;
      const pupil=Math.abs(dx)<1.15&&Math.abs(dy)<2.6;
      const color=pupil?[16,6,22]:eye?[255,176,228]:facet>1.05?[228,104,214]:facet>.68?[138,54,176]:[46,21,62];
      return [...color.map(c=>c+grain*(pupil?.15:.75)),255];
    }
    const {p,glow}=entry;
    const vein=Math.abs(Math.sin(x*.34+y*.24+Math.sin(y*.39)*1.3+tile));
    const forks=Math.abs(Math.sin(y*.47-x*.26+Math.sin(x*.28)*1.6));
    const grain=(hash(x,y,tile)-.5)*22;
    const u=Math.abs(x-15.5),v=Math.abs(y-15.5),center=Math.hypot(u,v);
    const pupil=glow&&p.id==="sarvaz"&&u<1.4&&v<4.8;
    const mark=noduleMarks[p.id](u,v);
    const color=pupil?[16,8,20]:glow&&mark||vein<.12&&forks<.40?p.accent:
      vein<.25||glow&&center<11||!glow&&mark&&vein<.42?p.body:p.dark;
    return [...color.map(channel=>channel+grain*(pupil?.2:1)),255];
  }

  const gemOreKeys=new Set(["CRYSTAL","AMETHYST","DIAMOND_ORE","AQUAMARINE_ORE","GARNET_ORE","EMERALD_ORE","RUBY_ORE","SAPPHIRE_ORE","OPAL_ORE","FLUORITE","QUARTZ_VEIN","SULFUR"]);
  const metalOreKeys=new Set(["COAL","IRON","COPPER","GOLD","TIN","ZINC","NITER","SILVER_ORE","COBALT_ORE","NICKEL_ORE","MAGNETITE","BAUXITE","MALACHITE","PYRITE","HEMATITE","HEMATITE_VEIN","CASSITERITE","SPHALERITE"]);
  function buildOreTable(B,extraOres){
    const map=new Map();
    for(const key of metalOreKeys)if(Number.isInteger(B[key]))map.set(B[key],B.CORRUPTED_ORE);
    for(const key of gemOreKeys)if(Number.isInteger(B[key]))map.set(B[key],B.CORRUPTED_GEM);
    if(extraOres)for(const id of extraOres){
      if(!map.has(id)&&id!==B.CORRUPTED_ORE&&id!==B.CORRUPTED_GEM)map.set(id,B.CORRUPTED_ORE);
    }
    return map;
  }
  function recipes(B){
    return [
      {name:"Fundir lingote corrompido",need:[[B.CORRUPTED_ORE,2],[B.COAL,1]],out:["corrupted_ingot",2]},
      {name:"Forjar lingote corrompido",need:[["corrupted_shard",3],["iron_ingot",1]],out:["corrupted_ingot",1]},
      {name:"Estilhaçar cristal corrompido",need:[[B.CORRUPTED_GEM,1]],out:["corrupted_shard",3]}
    ];
  }
  function pickWhisper(context="ambient",profileId=null,lastText=""){
    const profile=profileId?profiles.find(p=>p.id===profileId):null;
    const base=whispers[context]||whispers.ambient;
    const pool=profile&&context!=="mine"?[...base,...profile.whispers]:
      context==="ambient"?[...base,...profiles.flatMap(p=>p.whispers)]:base;
    let choice=pool[Math.floor(Math.random()*pool.length)];
    if(choice===lastText&&pool.length>1)choice=pool[(pool.indexOf(choice)+1+Math.floor(Math.random()*(pool.length-1)))%pool.length];
    const speaker=profile?"SUSSURRO DE "+profile.name.split(",")[0].toUpperCase():"SUSSURRO ANTIGO";
    const color=profile?rgbHex(profile.accent):"#d48dff";
    return {speaker,text:choice,color};
  }

  const chamberRadius=10,reach=38,tunnelStart=36,searchRings=128,searchStep=64;
  const turns=[[0,1],[1,0],[0,-1],[-1,0]];
  function worldPoint(site,u,v){
    const [dx,dz]=turns[site.turn];
    return [site.x+u*dz+v*dx,site.z-u*dx+v*dz];
  }
  function localPoint(site,x,z){
    const [dx,dz]=turns[site.turn],wx=x-site.x,wz=z-site.z;
    return [wx*dz-wz*dx,wx*dx+wz*dz];
  }

  function create({B,seed,hash,terrain,biome,water,maxY,origin,blocked,overlap}){
    let sites=null;
    const rand=(x,z,salt)=>hash(x,z,(seed%15485863)+salt);
    function makeSite(p,x,z,turn,check){
      const region=biome(x,z),height=terrain(x,z);
      if(!p.regions.includes(region)||height<water+1||height>=maxY-7)return null;
      const site={id:"ancient:"+p.id,profile:p,x,z,turn,region,actors:[]};
      const [mx,mz]=worldPoint(site,0,tunnelStart+1),mouthHeight=terrain(mx,mz);
      if(mouthHeight<water+1||mouthHeight>=maxY-6||!p.regions.includes(biome(mx,mz)))return null;
      const shell=[[-8,0],[8,0],[0,-8],[-6,6],[6,6]].map(([u,v])=>terrain(...worldPoint(site,u,v)));
      // Old Gods dwell VERY deep underground right above bedrock (y = 4..6)
      const floor=4+Math.floor(rand(x,z,19)*3);
      if(height<floor+10||mouthHeight<floor+10||Math.min(...shell)<floor+9)return null;
      if(mouthHeight-floor>29)return null;
      if(check){
        if(overlap(x,z))return null;
        for(let v=-10;v<=tunnelStart+1;v+=6)for(const u of [-8,0,8]){
          const [px,pz]=worldPoint(site,u,v);
          if(blocked(px,pz)||v>8&&u===0&&terrain(px,pz)<water+1)return null;
        }
      }
      site.floor=floor;site.mouth={x:mx+.5,y:mouthHeight+1,z:mz+.5};site.mouthHeight=mouthHeight;
      site.crust=B["CORRUPCAO_"+paletteKey(p.id)];site.light=B["NODULO_"+paletteKey(p.id)];
      site.architecture=new Map();
      function addInterior(u,level,v,id){
        const [px,pz]=worldPoint(site,u,v),key=px+","+pz;
        if(!site.architecture.has(key))site.architecture.set(key,[]);
        site.architecture.get(key).push([floor+level,id]);
      }
      for(const [u,level,v,id] of QuimiCraftFactionBuilding.display(B,"ancient"))
        addInterior(u,level,v-7,id);
      const ritual=[[-7,-5,B.ABYSS_VOID_SHRINE],[-8,-3,B.ABYSS_TENTACLE_RELIEF],[-7,-2,B.ABYSS_WHISPER_TABLET]];
      const incubation=[[7,-5,B.ABYSS_VEILED_COCOON],[8,-3,B.ABYSS_SPORE_TRIPOD],[7,-2,B.ABYSS_CHITIN_MOLT]];
      const workshop=[[-8,1,B.ABYSS_ECHO_RIBS],[-7,4,B.ABYSS_NACRE_SHELL]];
      const reliquary=[[8,1,B.ABYSS_STEPPED_RELIC],[7,4,B.ABYSS_SPIRAL_COLUMN]];
      for(const alcove of [ritual,incubation,workshop,reliquary]){
        for(const [u,v,id] of alcove){
          addInterior(u,0,v,B.ABYSS_CHAMBER_TILE);
          addInterior(u,1,v,id);
        }
      }
      for(const side of [-1,1]){
        addInterior(side*8,0,-1,B.ABYSS_ECHO_INLAY);
        addInterior(side*8,1,-1,B.ABYSS_VEINED_PIER);
        addInterior(side*8,2,-1,site.light);
      }
      const routines=QuimiCraftFactionRoutines;
      const workSpots=[[-5,1],[-5,3],[-5,5]],restSpots=[[5,-4],[5,-6],[5,-1]];
      const hallSpots=[[-2,4],[2,4],[-2,-1],[2,-1],[0,2]];
      for(const [u,v] of [...workSpots,...restSpots,...hallSpots]){
        addInterior(u,0,v,B.ABYSS_CHAMBER_TILE);
        for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)
          for(let dy=1;dy<=3;dy++)addInterior(u+dx,dy,v+dz,B.AIR);
      }
      routines.addRoom(site,worldPoint,"workshop",0,floor+1,workSpots,[-8,1]);
      routines.addRoom(site,worldPoint,"quarters",0,floor+1,restSpots,[7,-5]);
      routines.addRoom(site,worldPoint,"hall",0,floor+1,hallSpots);
      const tunnelLevel=v=>floor+Math.round((mouthHeight-floor)*Math.max(0,v-8)/(tunnelStart+1-8));
      const actor=(type,u,v,surface=false,customY=null)=>{
        const [ax,az]=worldPoint(site,u,v);
        site.actors.push({id:site.id+":"+site.actors.length,type,x:ax+.5,z:az+.5,y:customY!==null?customY:(surface?terrain(ax,az):floor)+1,surface});
      };
      actor(p.id,0,-3);
      actor("sem_rosto",-4,2);
      actor("insectoide",4,2);
      actor("kthir_harbinger",-3,-6);
      actor("aqir_colossus",3,-6);
      actor("void_horror",0,1);
      actor("bruto_abissal",0,5);
      actor("tentaculo_ancestral",-5,-3);
      actor("tentaculo_ancestral",5,-3);
      // Mid-shaft deep tunnel sentinels
      actor("kthir_harbinger",0,18,false,tunnelLevel(18)+1);
      actor("void_horror",0,26,false,tunnelLevel(26)+1);
      // Surface abyssal entrance guards
      actor("tentaculo_ancestral",4,tunnelStart-4,true);
      actor("sem_rosto",-5,tunnelStart-1,true);
      actor("aqir_colossus",5,tunnelStart,true);
      actor("olho_errante",0,tunnelStart-2,true);
      if(rand(x,z,66)>.38)actor("devorador_mente",-4,tunnelStart-5,true);
      if(rand(x,z,112)>.52&&terrain(x,z)>water)actor("tentaculo_ancestral",0,0,true);
      return site;
    }

    function initialize(saved){
      if(sites)return sites;
      sites=[];
      for(const row of Array.isArray(saved)?saved:[]){
        if(!Array.isArray(row)||row.length!==4)continue;
        const [id,x,z,turn]=row,p=profiles.find(profile=>profile.id===id);
        if(!p||sites.some(site=>site.profile===p)||![x,z,turn].every(Number.isSafeInteger)||
          Math.abs(x-origin.x)>searchRings*searchStep+10||Math.abs(z-origin.z)>searchRings*searchStep+10||
          turn<0||turn>=turns.length)continue;
        const site=makeSite(p,x,z,turn,false);
        if(site)sites.push(site);
      }
      const remaining=profiles.filter(p=>!sites.some(site=>site.profile===p));
      for(let ring=5;remaining.length&&ring<=searchRings;ring++){
        const perimeter=[];
        for(let n=-ring;n<ring;n++)perimeter.push([n,-ring],[ring,n],[-n,ring],[-ring,-n]);
        const candidates=[];
        for(const [ix,iz] of perimeter){
          const x=origin.x+ix*searchStep+Math.floor(rand(ix,iz,29)*27)-13;
          const z=origin.z+iz*searchStep+Math.floor(rand(ix,iz,53)*27)-13;
          const region=biome(x,z),distance=Math.hypot(x-origin.x,z-origin.z);
          for(const p of remaining){
            const rank=p.regions.indexOf(region);
            if(rank>=0)candidates.push({p,x,z,score:distance+rank*95});
          }
        }
        candidates.sort((a,b)=>a.score-b.score);
        for(const {p,x,z} of candidates){
          const index=remaining.indexOf(p);
          if(index<0||sites.some(site=>Math.hypot(x-site.x,z-site.z)<165))continue;
          const first=Math.floor(rand(x,z,97)*4);
          for(let i=0;i<4;i++){
            const site=makeSite(p,x,z,(first+i)%4,true);
            if(!site)continue;
            sites.push(site);remaining.splice(index,1);break;
          }
          if(!remaining.length)break;
        }
      }
      return sites;
    }

    function column(x,z,h){
      const site=sites?.find(s=>Math.abs(x-s.x)<=reach&&Math.abs(z-s.z)<=reach);
      if(!site)return null;
      const [u,v]=localPoint(site,x,z),a=Math.abs(u),{floor,crust,light,mouthHeight,profile}=site;
      const radius=Math.hypot(u,v);
      const room=radius<chamberRadius+1;
      const passage=v>=6&&v<=tunnelStart&&a<=2;
      const rim=v>=9&&v<=tunnelStart&&a===3;
      const landing=v===tunnelStart+1&&a<=2;
      const surfaceDistance=Math.hypot(u,v-(tunnelStart-7));
      const patch=(surfaceDistance<11&&(surfaceDistance<5.6||rand(x,z,122)>.33+surfaceDistance*.042))||
        (radius<6.7&&(radius<2.6||rand(x,z,137)>.35+radius*.058))||
        (v>0&&v<tunnelStart-6&&Math.abs(u-Math.round(Math.sin(v*.46)*2))<=1);
      const scar=patch&&h>water&&profile.regions.includes(biome(x,z));
      const surfaceLamp=(a===4&&v===tunnelStart-1||a===0&&(v===tunnelStart-10||v===0))&&h>water;
      if(!room&&!passage&&!rim&&!scar&&!surfaceLamp&&!landing)return null;
      const blocks=[],rock=B[profile.rock]??B.DEEPSTONE;
      if(room){
        const roof=floor+Math.min(h-floor-3,Math.max(5,Math.round(10.5-radius*.45)));
        const floorRoll=rand(x,z,101);
        blocks[floor]=radius>6.8&&floorRoll>.89?B.CORRUPTED_ORE:radius<9.6&&floorRoll>.56?B.SCULK_CORRUPTION:radius<9.6&&floorRoll>.24?crust:rock;
        const wall=radius>9.55;
        for(let y=floor+1;y<=roof;y++){
          if(wall||y===roof){
            const wr=rand(x,y*7+z,41);
            blocks[y]=wall&&y<=floor+4&&wr>.86?(wr>.94?B.CORRUPTED_GEM:B.CORRUPTED_ORE):wr>.62?B.SCULK_CORRUPTION:wr>.34?crust:rock;
          }else blocks[y]=B.AIR;
        }
        if(a===7&&(v===0||v===-4)||a===0&&v===-8)blocks[floor+1]=light;
        else if(a>1||v<3){
          if(radius>2.4&&radius<8.2&&floorRoll>.86)blocks[floor+1]=floorRoll>.94?B.SCULK_CATALYST:B.SCULK_SENSOR;
          else if(radius>3.2&&radius<8.8&&floorRoll<.14)blocks[floor+1]=B.SCULK_VEIN;
        }
        for(const [y,id] of site.architecture.get(x+","+z)??[])if(y<roof)blocks[y]=id;
      }
      if(scar||surfaceLamp||landing){
        const sr=rand(x,z,219);
        blocks[h]=surfaceLamp?light:(scar&&sr>.93?B.CORRUPTED_ORE:scar&&sr>.52?B.SCULK_CORRUPTION:crust);
        if(scar&&!surfaceLamp&&!landing&&sr>.84&&sr<=.93)blocks[h+1]=sr>.90?B.SCULK_SENSOR:B.SCULK_VEIN;
      }
      if(passage||rim){
        const level=floor+Math.round((mouthHeight-floor)*Math.max(0,v-8)/(tunnelStart+1-8));
        blocks[level]=v%4===0?rock:(v%3===0?B.SCULK_CORRUPTION:crust);
        const roof=passage?Math.max(level+4,v>=tunnelStart-3?h+2:0):level+3;
        for(let y=level+1;y<=roof;y++){
          if(rim){
            const rr=rand(x,y*5+z,173);
            blocks[y]=y===roof&&v%5===0?light:(y<=level+2&&rr>.88?(rr>.95?B.CORRUPTED_GEM:B.CORRUPTED_ORE):rr>.68?B.SCULK_CORRUPTION:crust);
          }else blocks[y]=B.AIR;
        }
        if(passage&&v<tunnelStart-3&&h>roof&&v%5===0&&a===2)blocks[level+3]=light;
      }
      return {blocks,top:blocks.length-1,clearVegetation:scar||surfaceLamp||passage||rim||landing};
    }

    return {
      initialize,column,
      list:()=>sites??[],
      save:()=>sites?.map(({profile,x,z,turn})=>[profile.id,x,z,turn])??[],
      at:(x,z,radius)=>sites?.find(site=>(x-site.x)**2+(z-site.z)**2<=radius**2),
      nearby:(x,z,radius)=>sites?.filter(site=>Math.hypot(x-site.x,z-site.z)<=radius)??[]
    };
  }

  function attackZones(data,e,target,floor){
    const dx=target.x-e.x,dz=target.z-e.z,distance=Math.hypot(dx,dz)||1;
    const disk=(x,y,z,r,inner=0)=>({x,y,z,r,inner});
    if(data.pattern==="pulse")return [disk(e.x,e.y,e.z,data.range)];
    if(data.pattern==="ring")return [disk(e.x,e.y,e.z,10,4.4)];
    if(data.pattern==="line"){
      const x=e.x+dx/distance*data.range*.5,z=e.z+dz/distance*data.range*.5;
      return [{x,y:e.y,z,length:data.range,width:2.5,angle:Math.atan2(dx,dz)}];
    }
    if(data.pattern==="spores"){
      return [0,1,-1].map(side=>{
        const x=target.x+side*dz/distance*3.45,z=target.z-side*dx/distance*3.45;
        return disk(x,floor(x,z,target.y),z,2.05);
      });
    }
    return [disk(target.x,floor(target.x,target.z,target.y),target.z,3.25)];
  }
  function insideZone(zone,target){
    if(Math.abs(zone.y-target.y)>1.7)return false;
    const dx=target.x-zone.x,dz=target.z-zone.z;
    if(zone.r){
      const distance=Math.hypot(dx,dz);
      return distance<=zone.r&&distance>=zone.inner;
    }
    const s=Math.sin(zone.angle),c=Math.cos(zone.angle);
    return Math.abs(dx*c-dz*s)<=zone.width*.5&&Math.abs(dx*s+dz*c)<=zone.length*.5;
  }
  return {
    profiles,creatures,items,whispers,register,paint,create,
    attackZones,insideZone,colorNumber,groundTypes,buildOreTable,recipes,pickWhisper
  };
})();
