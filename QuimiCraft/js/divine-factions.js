"use strict";

globalThis.QuimiCraftDivineFactions=(()=>{
  const traditions={
    brasa:{god:"Návar, a Brasa Insurgente",name:"Pacto da Brasa Insurgente",short:"Brasa",form:"ember",peaceful:false,
      colors:[0x68212b,0xf6814e],place:"templo_da_brasa_insurgente",temple:"Templo da Brasa Insurgente",style:"ziggurat",
      biomes:["badlands","chapadas ocres","cânion calcário","vulcânico"],trim:"OBSIDIAN",floor:"BASALT",
      motto:"Toda coroa pode cair. Toda chama pode mudar de mãos.",
      lore:"General exilado que tomou o fogo dos reis e reuniu os vencidos. Para Návar, o conflito derruba tiranias e também pode erguer outras.",
      followers:[["cornifero","Capitão Cornífero","Reúne os exilados das forjas subterrâneas.","kharu","blade"],
        ["cinzas","Oficiante das Cinzas","Cultiva as leveduras que alimentam as brasas do templo.","mireli","staff"],
        ["ruptura","Cavaleira da Ruptura","Jurou romper as correntes dos reis das forjas.","noktil","shield"],
        ["fornalha","Carregador da Fornalha","Transporta as pedras incandescentes no dorso blindado.","dravik","blade"],
        ["escoria","Patrulheira da Escória","Rastreia fugitivos pelas fendas da rocha.","serev","bow"],
        ["pavio","Mensageiro do Pavio","Leva os primeiros sinais da rebelião aos mundos vizinhos.","velari","staff"]],
      attack:["Brasa da Ruptura","fire",0xf6814e],loot:"SULFUR"},
    farol:{god:"Elaris, o Farol Juramentado",name:"Concílio do Farol",short:"Farol",form:"lantern",peaceful:true,
      colors:[0x5479a5,0xf4d897],place:"basilica_do_farol",temple:"Basílica do Farol",style:"basilica",
      biomes:["planície","planície florida","prado alpino","bosque de cerejeiras"],trim:"MARBLE",floor:"TRAVERTINE",
      motto:"Uma lei, uma vigília, abrigo para quem pede passagem.",
      lore:"Fundou cidades de refúgio e entregou suas estradas a ordens de cavaleiros. A paz de Elaris cobra um juramento, e seus prelados discutem quem pode interpretá-lo.",
      followers:[["paladina","Paladina do Juramento","Defende os peregrinos no portão da basílica.","solvani","shield"],
        ["cantor","Cantor do Farol","Afina suas guelras com o canto dos órgãos da basílica.","ulmar","staff"],
        ["vigilia","Vigia Alada","Descende dos mensageiros que ajudaram a fundar as primeiras cidades.","sylfari","bow"],
        ["arquivo","Arquivista dos Votos","Usa quatro mãos para copiar textos em duas línguas ao mesmo tempo.","noktil","staff"],
        ["soleira","Sentinela da Soleira","Engasta os nomes de viajantes salvos na própria armadura.","orun","shield"],
        ["lume","Guardião das Lâmpadas","Leva lâmpadas acesas por corredores inacessíveis.","velari","staff"]],
      attack:["Clarão do Juramento","light",0xf4d897],loot:"gold_nugget"},
    tambor:{god:"Turog, o Tambor de Pedra",name:"Hostes do Tambor de Pedra",short:"Tambor",form:"drum",peaceful:false,
      colors:[0x625544,0xeaaf63],place:"templo_do_tambor_de_pedra",temple:"Fortim do Tambor de Pedra",style:"fortim",
      biomes:["montanha","chapadas ocres","savana","cânion calcário"],trim:"GNEISS",floor:"DEEPSTONE",
      motto:"Que o tambor reúna os clãs e o campo decida a liderança.",
      lore:"Unificou clãs rivais por meio de duelos e fez da guerra o centro do seu culto. Os clãs ainda disputam se a força serve para governar ou para proteger os seus.",
      followers:[["ariete","Capitã do Aríete","Comanda a vanguarda dos clãs com o peso de uma couraça viva.","orun","shield"],
        ["tamborileiro","Tamborileiro dos Clãs","Marca o avanço da hoste batendo as mandíbulas no tambor.","dravik","staff"],
        ["martelo","Campeão do Martelo","Disputa o comando da hoste no pátio do fortim.","kharu","blade"],
        ["estandarte","Portadora do Estandarte","Vê o campo de batalha por cima das muralhas.","sylfari","bow"],
        ["arena","Árbitro da Arena","Separa os duelistas com dois pares de braços.","noktil","blade"],
        ["trilha","Batedora dos Desfiladeiros","Segue a tropa pelas encostas de pedra nua.","serev","bow"]],
      attack:["Impacto do Tambor","physical",0xeaaf63],loot:"IRON"},
    marco:{god:"Iriom, o Guardião do Limiar",name:"Guardiões do Limiar",short:"Limiar",form:"antler",peaceful:true,
      colors:[0x4d765d,0xcbe092],place:"santuario_do_limiar",temple:"Santuário do Limiar",style:"circle",
      biomes:["floresta","floresta de sequoias","bosque lilás","taiga"],trim:"CANOPY_ROOT",floor:"MOSS",
      motto:"A terra tem o seu ritmo. Até os deuses precisam aprender a ouvi-lo.",
      lore:"Depois de ver sua terra destruída pela querela dos deuses, Iriom ergueu marcos que limitam seu poder. Seus guardiões vigiam as passagens entre o bosque e os lugares habitados.",
      followers:[["marcos","Druida dos Marcos","Mantém uma rede de micélio entre as pedras do pacto.","mireli","staff"],
        ["sentinela","Guardião de Casca","Enraíza sua carapaça junto às passagens para protegê-las.","orun","shield"],
        ["sementes","Custódia das Sementes","Guarda sementes que germinam às margens de rios distantes.","ulmar","staff"],
        ["passagem","Vigia das Passagens","Muda as listras do corpo para avisar quando uma trilha deve ser fechada.","serev","bow"],
        ["muda","Jardineira das Mudas","Areja o solo com seis patas e floresce junto com o santuário.","dravik","blade"],
        ["pedras","Leitora das Pedras","Escuta a vibração dos marcos nas facetas do próprio corpo.","solvani","staff"]],
      attack:["Raízes do Limiar","earth",0xcbe092],loot:"honey"},
    vento:{god:"Vaélis, a Juíza dos Ventos",name:"Vigília dos Ventos",short:"Vigília",form:"wing",peaceful:true,
      colors:[0x496b8f,0xa8e8f4],place:"templo_das_asas_abertas",temple:"Templo das Asas Abertas",style:"terrace",
      biomes:["prado alpino","montanha","campina de aurora","fiordes glaciais"],trim:"SLATE",floor:"LIMESTONE",
      motto:"Ouça os dois lados antes de soltar a flecha.",
      lore:"Vaélis levou seu povo alado às alturas depois de uma guerra entre deuses. Abriu seus terraços a refugiados e formou vigias que mediam disputas e defendem os pactos quando a palavra falha.",
      followers:[["batedor","Batedor das Alturas","Anuncia caravanas com o brilho das membranas que o sustentam.","velari","staff"],
        ["arbitra","Árbitra dos Terraços","Ouve os litigantes sem esconder as mãos usadas para assinar pactos.","noktil","staff"],
        ["arqueira","Arqueira da Vigília","Protege as rotas de peregrinação com tiros de longa distância.","sylfari","bow"],
        ["rota","Cartógrafa das Correntes","Lê mudanças de pressão nas guelras e mapeia as correntes de ar.","ulmar","staff"],
        ["pacto","Fiscal dos Pactos","Envia sinais coloridos por refração através de suas placas.","solvani","shield"],
        ["mirante","Sentinela do Mirante","Escala as torres para vigiá-las durante as tempestades.","serev","blade"]],
      attack:["Rajada da Vigília","wind",0xa8e8f4],loot:"feather"}
  };

  const species={
    kharu:{name:"Kharu",origin:"Lua de Khar",body:"carapaça vulcânica e presas",colors:[0x713c2d,0xf68047],size:1.16,height:2.24,radius:.45},
    mireli:{name:"Mireli",origin:"Florestas de Mirel",body:"corpo de micélio e leque de fungos",colors:[0x8a6355,0xf2ab97],size:1.03,height:2.32,radius:.39},
    noktil:{name:"Noktil",origin:"Planeta da Noite Longa",body:"quatro braços e três olhos",colors:[0x544472,0xc484fc],size:1.12,height:2.29,radius:.45},
    dravik:{name:"Dravik",origin:"Cinturão de Drava",body:"seis patas, mandíbulas e placas dorsais",colors:[0x4c6251,0x9bc858],size:1.10,height:1.48,radius:.53},
    serev:{name:"Serev",origin:"Cânions de Serev",body:"escamas, cauda e crista serrilhada",colors:[0x487f67,0xd4de78],size:1.06,height:2.12,radius:.39},
    velari:{name:"Velari",origin:"Gigante gasoso Vela",body:"membrana flutuante e tentáculos luminosos",colors:[0x5179a5,0x98e4ff],size:1.10,height:2.07,radius:.46},
    solvani:{name:"Solvani",origin:"Arquipélago cristalino de Solvan",body:"placas facetadas e núcleo prismático",colors:[0x6b97a5,0xc5fdf0],size:1.19,height:2.46,radius:.42},
    ulmar:{name:"Ulmar",origin:"Oceanos de Ulm",body:"seis guelras externas e pupilas largas",colors:[0x487a80,0xea88b7],size:1.02,height:2.04,radius:.41},
    sylfari:{name:"Sylfari",origin:"Ilhas aéreas de Sylfa",body:"bico, garras e asas de plumas",colors:[0x8c746c,0xf6e2bb],size:1.10,height:2.33,radius:.43},
    orun:{name:"Orun",origin:"Encostas de Oruna",body:"ombros rochosos e grandes membros",colors:[0x6c6658,0xe7a473],size:1.26,height:2.16,radius:.56}
  };
  const pantheon={
    brasa:{height:12.5,radius:3.25,hp:1450,range:23,phases:[
      ["Rasgo da Fornalha","line",36,"fire"],["Círculo de Cinzas","ring",43,"fire"],["Coroa em Erupção","spores",53,"fire"]]},
    farol:{height:13.5,radius:2.9,hp:1380,range:24,phases:[
      ["Feixe da Vigília","line",32,"light"],["Selo do Juramento","disk",40,"light"],["Sentença dos Seis Faróis","ring",49,"light"]]},
    tambor:{height:11,radius:3.65,hp:1670,range:20,phases:[
      ["Primeiro Toque","pulse",37,"physical"],["Marcha de Pedra","line",46,"physical"],["Ruptura da Arena","ring",57,"physical"]]},
    marco:{height:14.1,radius:3.05,hp:1490,range:23,phases:[
      ["Círculo dos Marcos","ring",32,"earth",1.5],["Raízes Errantes","line",40,"earth",2.5],["Retomada da Clareira","spores",48,"earth",3.0]]},
    vento:{height:13.2,radius:2.8,hp:1400,range:25,phases:[
      ["Corredor de Rajadas","line",33,"wind",1.2],["Espiral dos Terraços","ring",42,"wind",1.8],["Queda dos Céus","spores",51,"wind",2.3]]}
  };

  // The seven ranks of each temple are permanent residents, not random patrol troops.
  // Each row: type suffix, name, lineage, weapon, rank, individual lore, named attack.
  const clergy={
    brasa:[
      ["general","General Varkhan, o Estandarte Partido","kharu","blade","general","Comanda as legiões de Návar. Conserva no peito os elos da corrente que rompeu quando abandonou as forjas reais.","Lâmina da Coroa Partida"],
      ["acolito_fogo_cativo","Acólito do Fogo Cativo","velari","staff","acolyte","Estuda a chama aprisionada em um relicário e liberta suas centelhas durante os ritos de Návar.","Chama Liberta"],
      ["acolita_centelha","Acólita da Centelha","noktil","staff","acolyte","Aprende a preservar o fogo sem deixar que ele consuma os companheiros. Seus quatro braços carregam brasas rituais.","Centelha da Ruptura"],
      ["pregadora_correntes","Pregadora das Correntes Partidas","mireli","staff","preacher","Ensina aos exilados que libertar-se de um tirano não concede o direito de se tornar outro.","Sermão das Cinzas"],
      ["pregador_brasa","Pregador da Última Brasa","serev","staff","preacher","Recita as histórias dos vencidos ao pé das fornalhas. Afirma que a última brasa pertence a quem ainda resiste.","Veredito Incandescente"],
      ["fiel_exilados","Fiel dos Exilados","ulmar","blade","faithful","Abandonou as águas de Ulm para oferecer abrigo aos refugiados das antigas forjas.","Defesa dos Exilados"],
      ["fiel_forja","Fiel da Forja Livre","kharu","shield","faithful","Transporta minério e reparte ferramentas com quem perdeu a própria forja. Usa um pequeno escudo marcado com o selo de Návar.","Guarda da Forja"]],
    farol:[
      ["general","General Aurel, Escudo dos Juramentos","solvani","shield","general","Protege as cidades de refúgio de Elaris. Sua armadura prismática registra os juramentos dos que passaram pela basílica.","Égide da Primeira Lâmpada"],
      ["acolita_lampada","Acólita da Primeira Lâmpada","noktil","staff","acolyte","Acende as lâmpadas do refúgio ao anoitecer e aprende a registrar os votos em duas escritas.","Luz da Vigília"],
      ["acolito_sino","Acólito do Sino de Vigília","ulmar","staff","acolyte","Anuncia a chegada dos peregrinos por meio de um sino e estuda os votos de proteção.","Clarão do Sino"],
      ["pregadora_refugio","Pregadora do Refúgio","sylfari","staff","preacher","Recebe os viajantes na basílica e recorda aos cavaleiros que nenhum juramento vale sem acolhimento.","Palavra do Abrigo"],
      ["pregador_votos","Pregador dos Votos","mireli","staff","preacher","Interpreta os antigos textos do Concílio e orienta os fiéis que desejam prestar juramento.","Selo dos Votos"],
      ["fiel_estradas","Fiel das Estradas","serev","shield","faithful","Viaja pelas estradas protegidas pelo Concílio e repara os sinais deixados para os peregrinos.","Guarda da Estrada"],
      ["fiel_abrigo","Fiel do Abrigo","orun","blade","faithful","Ergue muros e distribui água aos viajantes. Seu pequeno emblema recorda o primeiro refúgio de Elaris.","Defesa do Refúgio"]],
    tambor:[
      ["general","General Gorath, Punho dos Clãs","orun","blade","general","Lidera a marcha de Turog e carrega um martelo moldado pelos clãs rivais. Só aceita um comando conquistado diante das hostes.","Martelo dos Sete Clãs"],
      ["acolito_toque","Acólito do Primeiro Toque","kharu","staff","acolyte","Aprende os ritmos que convocam os clãs e marca os ciclos de treino no pátio do fortim.","Primeiro Toque"],
      ["acolita_runas","Acólita das Pedras Rúnicas","noktil","staff","acolyte","Esculpe os nomes dos duelistas em pedras de memória para que a arena não esqueça suas vitórias.","Eco das Runas"],
      ["pregador_duelo","Pregador do Duelo Justo","orun","staff","preacher","Recorda aos guerreiros que a força sem regras transforma a arena em tirania. Preside os ritos antes dos duelos.","Sentença da Arena"],
      ["pregadora_clas","Pregadora dos Clãs","serev","staff","preacher","Canta as histórias da união dos clãs e discute a responsabilidade dos comandantes perante a hoste.","Voz dos Clãs"],
      ["fiel_arena","Fiel da Arena","sylfari","blade","faithful","Cuida dos equipamentos dos duelistas e honra os derrotados que lutaram com coragem.","Golpe da Arena"],
      ["fiel_tambor","Fiel do Tambor","dravik","shield","faithful","Transporta pedras de ressonância no dorso e acompanha as procissões ao som do tambor.","Impacto da Procissão"]],
    marco:[
      ["general","General Theryn, Escudo dos Marcos","mireli","staff","general","Comanda a defesa dos marcos de Iriom sem avançar sobre terras protegidas pelo pacto. Seu cajado abriga sementes do primeiro santuário.","Círculo das Raízes Antigas"],
      ["acolita_raizes","Acólita das Raízes","mireli","staff","acolyte","Aprende a reconhecer as redes de fungos que ligam os marcos e cultiva mudas ao redor do santuário.","Semente do Limiar"],
      ["acolito_nascentes","Acólito das Nascentes","ulmar","staff","acolyte","Zela pelas águas que atravessam o bosque e observa os sinais de mudança nas nascentes.","Pulso da Nascente"],
      ["pregadora_pacto","Pregadora do Pacto Vivo","noktil","staff","preacher","Ensina que nenhum poder, mortal ou divino, está acima dos limites da terra e dos pactos que a protegem.","Palavra dos Marcos"],
      ["pregador_limites","Pregador dos Limites","solvani","staff","preacher","Interpreta a vibração dos marcos e orienta as comunidades sobre o uso responsável das passagens.","Selo da Clareira"],
      ["fiel_clareira","Fiel da Clareira","serev","shield","faithful","Recolhe galhos caídos e indica as trilhas abertas sem ferir os bosques protegidos.","Guarda da Clareira"],
      ["fiel_sementes","Fiel das Sementes","dravik","shield","faithful","Espalha sementes nas áreas degradadas e leva pequenas mudas na carapaça durante os ritos.","Defesa das Sementes"]],
    vento:[
      ["general","General Aerion, Arco da Altura","sylfari","bow","general","Coordena a defesa dos terraços de Vaélis. Dispara apenas depois de ouvir os mensageiros dos dois lados de uma disputa.","Flecha das Correntes Celestes"],
      ["acolita_brisas","Acólita das Brisas","velari","staff","acolyte","Aprende a ler as correntes ascendentes e sinaliza mudanças do vento com as membranas luminosas.","Sopro da Altura"],
      ["acolito_ceu","Acólito do Céu Aberto","ulmar","staff","acolyte","Estuda a pressão do ar e mantém os instrumentos de orientação dos vigias.","Rajada da Iniciação"],
      ["pregadora_arbitragem","Pregadora dos Dois Lados","solvani","staff","preacher","Recebe litigantes nos terraços e recorda que uma sentença justa exige ouvir as partes antes de julgar.","Palavra da Juíza"],
      ["pregador_rotas","Pregador das Rotas","sylfari","staff","preacher","Preside os pactos de viagem e transmite as histórias dos refugiados acolhidos nas alturas.","Selo dos Ventos"],
      ["fiel_pactos","Fiel dos Pactos","noktil","shield","faithful","Guarda os acordos de passagem e ajuda a preparar as assembleias da Vigília.","Guarda dos Pactos"],
      ["fiel_viajantes","Fiel dos Viajantes","serev","blade","faithful","Mantém as escadas e os mirantes abertos aos peregrinos, mesmo durante as tempestades.","Defesa do Mirante"]]
  };
  const ranks={
    general:{name:"General",hp:340,damage:38,scale:1.25,walk:1.65,run:4.4,sense:21,roam:4,reach:3.3,shot:17,windup:.78,cooldown:2.65,loot:[3,5]},
    acolyte:{name:"Acólito",hp:100,damage:15,scale:1.02,walk:1.37,run:3.7,sense:15,roam:4,reach:2.35,shot:11,windup:.70,cooldown:2.55,loot:[1,2]},
    preacher:{name:"Pregador",hp:145,damage:23,scale:1.07,walk:1.25,run:3.6,sense:18,roam:3,reach:2.5,shot:14,windup:.90,cooldown:2.9,loot:[1,3]},
    faithful:{name:"Fiel",hp:78,damage:10,scale:.97,walk:1.45,run:3.9,sense:12,roam:4,reach:2.15,shot:9,windup:.60,cooldown:2.45,loot:[1,1]}
  };
  // Permanent slots are appended to preserve the siteActor IDs used by old saves.
  const clergySlots=[[0,1],[-3,2],[3,2],[-4,5],[4,5],[-3,9],[3,9]];

  const orders={},meta={},leaders={},rosters={},creatures={},places=[];
  const rgb=hex=>[hex>>16&255,hex>>8&255,hex&255];
  const hex=number=>"#"+number.toString(16).padStart(6,"0");
  const materials=new Map();
  const materialKeys=id=>[id.toUpperCase()+"_MASONRY",id.toUpperCase()+"_SEAL"];
  const factions=Object.entries(traditions);
  for(const [order,t] of factions){
    const [base,accent]=t.colors,leader="deus_"+order;
    orders[order]={name:t.name,body:rgb(base),accent:rgb(accent),peaceful:t.peaceful};
    meta[order]={name:t.name,short:t.short,color:hex(accent),leader:t.god,motto:t.motto,rallyCry:t.motto,lore:t.lore};
    leaders[order]={type:leader,home:t.place,deathless:true};
    const [attackName,effect,color]=t.attack;
    const createFollower=(id,name,race,role,lore,index)=>{
      const lineage=species[race],ranged=role==="staff"||role==="bow";
      const strike={kind:ranged?"shot":order==="tambor"?"slam":"bite",name:attackName,effect,color,
        ...(ranged?{elemental:effect,slow:order==="marco"?2.4:order==="vento"?1.25:0}:{}),
        speed:role==="bow"?19:15,range:ranged?12:2.6,windup:.63,cooldown:2.2,damage:15+index*3};
      const {size,height,radius}=lineage;
      creatures[id]={order,name,form:"divine",race,lineage,role,lore,size,height:height*size,radius:radius*size,
        profile:{hp:95+index*14,temperament:t.peaceful?"neutral":"hostile",walk:1.55,run:4.05,
          sense:16,roam:6,strike,loot:[[t.loot,1,2]]}};
    };
    const {height,radius,hp,range,phases}=pantheon[order];
    creatures[leader]={order,name:t.god,form:"divine",aspect:t.form,god:true,anchored:true,lore:t.lore,height,radius,range,
      phases:phases.map(([attack,pattern,damage,effect,slow])=>({attack,pattern,damage,effect,slow})),
      profile:{hp,temperament:t.peaceful?"neutral":"hostile",walk:0,run:1,sense:range,roam:0,strike:null,loot:[]}};
    rosters[order]=t.followers.map(([suffix,name,duty,race,role],i)=>{
      const id=order+"_"+suffix;createFollower(id,name,race,role,duty,i);return id;
    });
    const [a,b,c,d,e,f]=rosters[order];
    const clergyActors=[];
    const clergyExtra=[];
    for(const [i,[suffix,name,race,role,rank,lore,attack]] of clergy[order].entries()){
      const id=order+"_"+suffix,lineage=species[race],grade=ranks[rank];
      const ranged=role==="staff"||role==="bow",general=rank==="general",variant=i%2;
      const size=lineage.size*grade.scale;
      const strike={kind:ranged?"shot":order==="tambor"||general&&order==="farol"?"slam":"melee",
        name:attack,effect,color,speed:role==="bow"?22:15,range:ranged?grade.shot:grade.reach,
        windup:grade.windup,cooldown:grade.cooldown,damage:grade.damage+(general&&order==="tambor"?5:variant*2),
        ...(ranged?{elemental:effect,slow:order==="marco"?(general?2.8:1.7):order==="vento"?1.25:0}:{})};
      const modelHeight=race==="dravik"?1.57:race==="velari"?lineage.height:race==="ulmar"&&rank==="acolyte"?2.30:
        rank==="general"?2.75:rank==="preacher"?2.50:race==="kharu"?2.44:lineage.height;
      creatures[id]={order,name,form:"divine",aspect:t.form,race,lineage,role,rank,rankName:grade.name,
        rankVariant:variant,clergyDesign:order+":"+i,lore,size,height:Math.max(lineage.height,modelHeight)*size,
        radius:lineage.radius*size,profile:{hp:grade.hp+(general&&order==="tambor"?45:variant*8),
          temperament:t.peaceful?"neutral":"hostile",walk:grade.walk,run:grade.run,sense:grade.sense,
          roam:grade.roam,strike,loot:[[t.loot,...grade.loot]]}};
      // Preserve existing siteActor indices, append the new initiate after the prior six clergy.
      if(order==="brasa"&&i===1)clergyExtra.push([id,...clergySlots[i]]);
      else clergyActors.push([id,...clergySlots[i]]);
    }
    places.push({id:t.place,name:t.temple,order,divine:true,width:12,depth:13,height:19,
      aliases:[order,"templo_"+order,t.god.split(",")[0]],biomes:t.biomes,
      actors:[[leader,0,-6,1],[a,-6,3],[b,6,-1],[c,0,10],[a,5,8],[b,-6,-1],[c,-6,8],
        [d,6,3],[e,6,12],[f,-6,12],[d,-3,12],[e,3,12],[f,2,5],...clergyActors,...clergyExtra]});
  }

  function actorsForSite(layout,pick){
    const roster=rosters[layout.order].filter(type=>!creatures[type].rank),rotated=Math.floor(pick*roster.length);
    return layout.actors.map(([type,u,v,rise],i)=>{
      // Only the original three visitor slots rotate. All seven clerical ranks are unique.
      if(i<10||i>=13)return [type,u,v,rise];
      return [roster[(rotated+i-10)%roster.length],u,v,rise];
    });
  }

  function registerMaterial(B,defs,id,tile,key,label,color,style,group,story){
    B[key]=id;
    defs[id]={name:label,tex:tile,icon:hex(color),solid:true,hard:style==="seal"?1.35:1.95,
      ...(group?{factionBuilding:{group,story}}:{worldLore:story})};
    materials.set(tile,{style,color:rgb(color),identity:id%5});
  }
  function register(B,defs){
    factions.forEach(([id,t],i)=>{
      const [wall,seal]=materialKeys(id),story=`Usado em ${t.temple}. ${t.lore}`;
      registerMaterial(B,defs,1250+i*2,492+i*2,wall,"Cantaria · "+t.short,t.colors[0],"ashlar",id,story);
      registerMaterial(B,defs,1251+i*2,493+i*2,seal,"Selo · "+t.short,t.colors[1],"seal",id,story);
    });
  }
  function paint(tile,x,y,hash){
    const material=materials.get(tile);
    if(!material)return null;
    const {color,style,identity}=material,dx=Math.abs(x-15.5),dy=Math.abs(y-15.5),grain=(hash(x,y,tile)-.5)*22;
    const glyph=[Math.abs(dx-dy)<1.6,dx<2||dy<2,dy<2||Math.abs(dx-7)<1.4,
      Math.abs(dx+dy-10)<1.6,Math.abs(dy-dx*.65-2)<1.4][identity];
    const seam=y%8===0||(x+(y>>3)%2*8)%16===0;
    const shade=style==="seal"?(dx>13||dy>13?-47:glyph?43:-31):seam?-39:Math.sin(x*.37+y*.62)*8;
    return [...color.map(channel=>channel+shade+grain),255];
  }
  function supplies(order,B){
    const [wall,seal]=materialKeys(order);
    return [[B[wall],4],[B[seal],1],[B[traditions[order].loot]??traditions[order].loot,3]];
  }

  function buildTemple(B,site,platform,box){
    const {order}=site.layout,{style,trim:trimKey,floor:floorKey}=traditions[order];
    const [wallKey,sealKey]=materialKeys(order),wall=B[wallKey],seal=B[sealKey],trim=B[trimKey],floor=B[floorKey];
    const put=(u,h,v,id)=>box(u,h,v,u,h,v,id);
    for(let v=-13;v<=15;v++)for(let u=-12;u<=12;u++){
      if(style==="circle"&&u*u+v*v>193&&Math.abs(u)>2)continue;
      platform(u,v,site.y,Math.abs(u)<=2?trim:floor,wall);
    }
    for(let v=15;v<=24;v++)for(let u=-2;u<=2;u++)
      platform(u,v,site.y+Math.round((v-15)*(site.approach-site.y)/9),trim,wall);
    box(-8,1,-10,8,17,9,B.AIR);
    box(-4,1,-10,4,1,-2,wall);
    box(-3,1,-9,3,1,-3,trim);
    box(-2,1,-7,2,1,-5,seal);
    if(style==="circle"){
      for(let i=0;i<12;i++){
        const angle=i*Math.PI/6,u=Math.round(Math.cos(angle)*10),v=Math.round(Math.sin(angle)*9);
        if(Math.abs(u)<2&&v>0)continue;
        box(u,1,v,u,4,v,wall);put(u,5,v,seal);
      }
      for(const side of [-1,1]){
        box(side*7,1,-10,side*7,11,-10,trim);
        for(let i=0;i<4;i++)put(side*(7-i),11+i,-10,trim);
        box(Math.min(side*4,0),15,-10,Math.max(side*4,0),15,-10,trim);
      }
      put(0,16,-10,seal);
    }else if(style==="terrace"){
      for(const side of [-1,1]){
        const outer=side*11;
        box(outer,1,-11,outer,1,12,trim);
        for(const v of [-10,-4,2,8]){box(outer,2,v,outer,13,v,wall);put(outer,14,v,seal);}
        const left=Math.min(side*9,side*11),right=Math.max(side*9,side*11);
        box(left,13,-10,right,13,11,wall);
        box(left,14,-8,right,14,-8,trim);
      }
      box(-7,2,-12,7,4,-12,wall);box(-7,5,-12,7,5,-12,seal);
    }else{
      const ceiling=style==="basilica"?17:style==="ziggurat"?16:15;
      for(const side of [-1,1]){
        box(side*9,1,-11,side*9,ceiling,9,wall);
        for(const v of [-7,-2,3,7]){
          if(style==="basilica"){
            box(side*9,5,v,side*9,12,v+1,B.GLASS_COBALT);
            put(side*9,13,v,seal);
          }
          else if(style==="fortim")box(side*9,ceiling+1,v,side*9,ceiling+2,v+1,trim);
          else {box(side*7,1,v,side*7,5,v,trim);put(side*7,6,v,seal);}
        }
        box(Math.min(side*9,side*5),1,9,Math.max(side*9,side*5),ceiling,9,wall);
        if(style==="fortim")box(Math.min(side*12,side*8),ceiling,-11,Math.max(side*12,side*8),18,-8,wall);
      }
      box(-9,1,-11,9,ceiling,-11,wall);
      box(-4,10,9,4,ceiling,9,trim);
      box(-2,9,9,2,9,9,trim);
      box(-9,ceiling,-11,9,ceiling,9,trim);
      if(style!=="fortim")for(let tier=1;tier<=18-ceiling;tier++){
        const edge=9-tier*2,cut=style==="ziggurat"?tier:0;
        box(-edge,ceiling+tier,-11+cut,edge,ceiling+tier,9-cut,ceiling+tier===18?seal:wall);
      }
      box(-3,11,-11,3,11,-11,seal);
    }
    const ornaments=QuimiCraftFactionBuilding.ornamentIds(B,order);
    for(const [i,id] of ornaments.entries())put(i<5?-6:6,1,-5+(i%5)*3,id);
    for(const side of [-1,1]){
      box(side*4,1,13,side*4,3,13,wall);put(side*4,4,13,seal);
      put(side*5,2,-7,B.SPECTRAL);
    }
  }

  return {orders,meta,leaders,rosters,creatures,places,register,registerMaterial,paint,supplies,buildTemple,actorsForSite};
})();
