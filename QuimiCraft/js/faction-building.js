"use strict";

globalThis.QuimiCraftFactionBuilding=(()=>{
  const sets={
    light:{base:"DAWN_MARBLE",binder:"gold_nugget",colors:["ded4b9","bf985c","435479","d9b46a","a38753","dedbd4"],pieces:[
      ["DAWN_ASHLAR","Cantaria do Sol Nascente","Os pedreiros da Alvorada assentaram esta cantaria na entrada do Palácio da Luz.","Os chanfros dourados balizam a junta entre as pedras claras."],
      ["DAWN_LAPIS_PANEL","Painel de Lápis da Alvorada","Os primeiros arautos trouxeram o pigmento azul das minas do norte.","A moldura clara realça o campo azul usado nas paredes cerimoniais."],
      ["DAWN_GILDED_FRIEZE","Friso Dourado dos Arautos","Os arautos cercavam os salões com faixas metálicas antes das cerimônias.","As linhas do friso se prolongam entre blocos vizinhos."],
      ["DAWN_SUN_INLAY","Incrustação do Disco Solar","O símbolo marca o lugar onde os juramentos do Exército Dourado eram registrados.","A rosácea de pedra clara pode ser repetida em pisos e fachadas."],
      ["DAWN_FLUTED_PIER","Pilar Canelado da Vigília","Estes pilares sustentavam a galeria por onde marchava a guarda do palácio.","As estrias verticais destacam a altura de uma sequência de pilares."],
      ["DAWN_COURT_TILE","Lajota do Átrio Radiante","Os artesãos poliram o piso onde os guardas faziam a troca de turno ao nascer do sol.","Os cantos dourados se unem em um losango quando quatro lajotas se encontram."],
      ["DAWN_WINGED_STATUE","Estatueta Alada da Aurora","A primeira estatueta foi deixada no parapeito em memória dos sentinelas que guardavam o amanhecer.","As asas são feitas de penas metálicas sobrepostas.","wings","f2d58b","gold_nugget"],
      ["DAWN_WATCH_STANDARD","Estandarte da Primeira Vigília","O pavilhão azul era levantado para anunciar a troca da guarda.","O sol bordado fica acima da ponta central e das bordas douradas.","standard","3b57a0","wool"],
      ["DAWN_SOLAR_RELIQUARY","Relicário Solar","Uma pedra da primeira lanterna do palácio repousa no relicário original.","O cristal dourado ilumina o pedestal e o espaço ao redor.","reliquary","ffdc69","GLOWSTONE",7]
    ]},
    scourge:{base:"FROST_CITADEL",binder:"death_rune",colors:["849cad","344664","567991","92b6cd","445570","6d8caa"],pieces:[
      ["FROST_BASTION_ASHLAR","Cantaria da Muralha Invernal","A muralha mais antiga da Cidadela de Gelo foi refeita com pedra de pedreira glacial.","As bordas escuras deixam visíveis as fiadas da fortificação."],
      ["FROST_BONE_PANEL","Painel de Ossos Brancos","Os necromantes encaixavam placas de osso nas paredes das criptas.","Os relevos cinza-azulados lembram as tábuas das antigas tumbas."],
      ["FROST_CHAIN_BAND","Friso de Correntes Sepulcrais","O Flagelo esculpiu correntes sobre as entradas das prisões do Rei Lich.","O elo gravado volta a se fechar a cada bloco instalado lado a lado."],
      ["FROST_EIGHT_RUNE","Sigilo da Geada Oitavada","Os liches gravaram o sigilo no primeiro círculo de instrução da cidadela.","Oito raios se encontram em uma incrustação azul-clara."],
      ["FROST_OSSUARY_PIER","Pilar Estriado do Ossuário","Os responsáveis pelas criptas usavam pilares escuros para marcar as divisões do ossuário.","Os sulcos finos deixam o fuste visível mesmo sob iluminação azul."],
      ["FROST_CRYPT_TILE","Lajota do Corredor Sepulcral","As lajotas foram feitas para substituir o gelo escorregadio nos corredores das criptas.","As peças têm bordas que desenham losangos quando o piso é repetido."],
      ["FROST_FUNERAL_SPIRES","Pináculo de Cristais Fúnebres","Os guardiões cristalizavam a geada retirada dos túmulos para marcar seus acessos.","Três cristais crescem inclinados em torno de uma ponta central luminosa.","spires","83e6ff","GLOWSTONE",6],
      ["FROST_THRONE_STANDARD","Estandarte do Trono Gelado","O Flagelo carrega este pendão diante das fileiras do Rei Lich.","O tecido azul-escuro tem duas caudas finas sob o floco de geada.","standard","384866","wool"],
      ["FROST_SOUL_URN","Urna de Alma Fria","Os intendentes numeravam urnas de cinzas antes de levá-las aos nichos da cidadela.","Anéis metálicos selam a tampa e contornam as laterais da urna.","urn","a2bdca","CERAMIC"]
    ]},
    fel:{base:"FEL_BRICK",binder:"fel_ember",colors:["776c7e","7b454d","70518a","91b659","453749","78616e"],pieces:[
      ["FEL_CINDER_ASHLAR","Cantaria de Cinza Vil","Os construtores dos templos prensavam cinzas vulcânicas contra as fôrmas de basalto.","As juntas escuras destacam a cor arroxeada da rocha."],
      ["FEL_FORGED_PANEL","Painel de Ferro da Fenda","Os ferreiros estampavam placas para revestir os fornos da Legião.","A moldura espessa cerca um miolo avermelhado, usado nas câmaras de forja."],
      ["FEL_FANG_BAND","Friso das Presas de Basalto","As presas esculpidas indicavam as câmaras administradas pelos guardas da Legião.","O serrilhado do friso se repete ao longo das muralhas."],
      ["FEL_EMBER_INLAY","Incrustação de Escória Esmeralda","A Legião prensava sobras da forja no piso para marcar a rota até o altar.","Os veios verdes formam um losango polido no centro da pedra."],
      ["FEL_SEARED_PIER","Pilar da Obsidiana Chamuscada","Estes pilares começaram a ser usados nos fornos próximos à Brasa Vil.","Sulcos verticais e aros escuros diferenciam a peça da obsidiana comum."],
      ["FEL_SLAG_TILE","Lajota de Escória Forjada","As oficinas reutilizavam escória das fundições para ladrilhar o caminho até os depósitos.","Cada canto chanfrado compõe um losango quando encaixado aos demais."],
      ["FEL_EMERALD_HEARTH","Braseiro da Chama Esmeralda","A guarda acendia estes braseiros para apontar os acessos aos templos durante as tempestades de cinza.","A chama verde ilumina o receptáculo quadrado de pedra e as quatro pontas da fornalha.","brazier","a2f441","GLOWSTONE",8],
      ["FEL_PACT_STANDARD","Estandarte do Pacto Candente","O tecido rubro era fincado pelos intendentes da Legião ao tomar um pátio.","O tecido termina em pontas desiguais e traz presas verdes sob o mastro de chifres.","standard","983e50","wool"],
      ["FEL_HORN_IDOL","Ídolo de Chifres da Fenda","Os pedreiros deixavam um ídolo virado para cada uma das duas entradas da forja.","Os chifres curvados nascem de um pedestal com um núcleo verde.","horns","a8cb62","OBSIDIAN"]
    ]},
    druid:{base:"DRUID_RUNESTONE",binder:"elemental_core",colors:["5a7855","876849","6d9362","79a977","766146","8e9e6e"],pieces:[
      ["DRUID_MOSS_ASHLAR","Cantaria de Musgo Trançado","Os pedreiros do Círculo deixavam o musgo crescer nas pedras antes de montar as muretas.","A cantaria conserva o tom verde nas estradas de pedra do bosque."],
      ["DRUID_BARK_PANEL","Painel de Casca e Resina","O Círculo reaproveitava a casca de árvores caídas para fechar as cabanas de vigília.","A resina preenche os entalhes centrais sem cobrir a cor da casca."],
      ["DRUID_ROOT_BAND","Friso de Raízes Entrelaçadas","As raízes desenhadas no friso registram as trilhas que ligavam os primeiros alojamentos.","As faixas sinuosas podem percorrer uma parede inteira."],
      ["DRUID_SEED_INLAY","Incrustação do Broto Cerimonial","O desenho do primeiro broto era gravado nas mesas onde as sementes eram escolhidas.","O contorno esverdeado destaca o motivo vegetal no centro da peça."],
      ["DRUID_WOVEN_PIER","Pilar de Cipó e Cerne","Os druidas amarravam cipós ao cerne das vigas quando montavam as pérgolas.","O padrão estriado faz a madeira parecer trançada de cima a baixo."],
      ["DRUID_PATH_TILE","Lajota da Trilha do Carvalho","Os guias marcaram com estas lajes a rota entre o carvalho e o círculo ritual.","Cantos verdes assinalam o desenho dos cruzamentos quando quatro peças se tocam."],
      ["DRUID_OWL_TOTEM","Totem da Coruja Anciã","O Círculo dedicou o primeiro totem à coruja que guiou viajantes perdidos na mata.","A escultura tem olhos facetados, orelhas de madeira e asas curtas nas laterais.","owl","dbbb68","WOOD"],
      ["DRUID_ROOT_PLANTER","Jardineira das Raízes Cantantes","As guardiãs do bosque reuniam brotos nestas jardineiras antes da época de plantio.","Três brotos esculpidos se erguem sobre o canteiro de pedra.","planter","7dbe64","MOSS"],
      ["DRUID_WIND_CHIME","Sinos dos Quatro Ventos","Os xamãs penduravam um tubo para cada direção nos antigos marcos de trilha.","Os quatro tubos metálicos pendem sob uma travessa de madeira.","chimes","d4c585","bronze_ingot"]
    ]},
    alchemist:{base:"ALCHEMY_BRICK",binder:"bronze_ingot",colors:["467771","426e79","af8050","6daba7","9c724f","81a6a2"],pieces:[
      ["ALCHEMIST_CLINKER","Cantaria de Clínquer Alquímico","A Academia refez as paredes das fornalhas usando lotes de argila cozidos a alta temperatura.","A superfície verde-azulada contrasta com as juntas escuras da alvenaria."],
      ["ALCHEMIST_ENAMEL_PANEL","Painel de Esmalte Catalítico","As bancadas de ensino recebiam painéis esmaltados para identificar as estações de trabalho.","O acabamento azul emoldurado lembra a aparência de placas esmaltadas."],
      ["ALCHEMIST_COPPER_BAND","Friso de Cobre Calibrado","Os mestres instalaram frisos de cobre nas salas onde calibravam balanças e tubos.","Linhas finas entre as faixas marcam comprimentos regulares."],
      ["ALCHEMIST_FORMULA_INLAY","Incrustação do Solvente Universal","Um mosaico experimental na Academia preserva o símbolo de uma fórmula abandonada.","A gravação tem o mesmo azul-esverdeado das placas de laboratório."],
      ["ALCHEMIST_BRASS_PIER","Pilar Canelado de Latão","Os fundidores fizeram pilares metálicos para a ala de destilação da Academia.","As caneluras escurecidas contrastam com a cor de cobre do latão."],
      ["ALCHEMIST_CERAMIC_TILE","Lajota Vitrificada do Laboratório","As lajotas vitrificadas substituíram o piso poroso nas salas de reagentes.","O esmalte desenha losangos quando quatro peças são colocadas juntas."],
      ["ALCHEMIST_VIAL_RACK","Mostruário da Transmutação","O conselho conservava amostras coloridas das primeiras experiências em suportes de latão.","Três frascos facetados de tamanhos diferentes ficam presos à bandeja.","vials","75d9cf","GLASS"],
      ["ALCHEMIST_BRASS_RETORT","Retorta de Latão","As primeiras retortas da Academia condensavam vapores em um recipiente ao lado do bico.","O ornamento reproduz o balão e o gargalo curvo de uma retorta.","retort","c88c50","GLASS"],
      ["ALCHEMIST_HEX_SEAL","Selo Hexagonal da Ordem","O conselho deixava um selo de pé sobre o balcão da Academia nos dias de exame.","O desenho hexagonal é usado como ornamento sobre um pequeno suporte.","emblem","7ed3d2","BRONZE_BLOCK"]
    ]},
    villager:{base:"VILLAGE_BRICK",binder:"PLANK",colors:["ae6d55","c49161","a9784e","d4b16c","885937","b8885e"],pieces:[
      ["LEAGUE_HEARTH_ASHLAR","Cantaria de Barro da Liga","Os oleiros comunitários moldavam estes tijolos para os fornos compartilhados.","O barro cozido mantém a tonalidade vermelha entre as juntas largas."],
      ["LEAGUE_JOINERY_PANEL","Painel de Marcenaria da Feira","As barracas mais antigas usavam painéis emoldurados que podiam ser reaproveitados na feira seguinte.","Cada moldura cerca uma placa central de madeira clara."],
      ["LEAGUE_CARVED_BAND","Friso de Carvalho Entalhado","Os carpinteiros da Liga decoravam com este entalhe as fachadas dos entrepostos.","Faixas paralelas atravessam as juntas entre as peças."],
      ["LEAGUE_HARVEST_INLAY","Incrustação dos Campos Dourados","Os feirantes marcaram o primeiro salão de trocas com um desenho que lembrava as espigas.","O motivo em tom de mel se repete tanto no piso quanto na parede."],
      ["LEAGUE_MARKET_PIER","Pilar de Carvalho da Feira","A Liga padronizou os postes usados para sustentar as coberturas da praça.","Sulcos verticais mostram o veio da madeira em fileiras de pilares."],
      ["LEAGUE_SQUARE_TILE","Lajota da Praça Comunal","Voluntários assentaram as primeiras lajotas para evitar que a praça virasse lama depois da chuva.","As bordas se encontram em losangos claros nos cruzamentos."],
      ["LEAGUE_MARKET_CRATE","Caixote da Feira","Os aldeões empilhavam caixas de legumes junto às barracas no dia da feira.","O caixote decorativo tem ripas cruzadas e ferragens visíveis.","crate","bb875a","PLANK"],
      ["LEAGUE_HARVEST_SIGN","Placa das Três Colheitas","O primeiro quadro anunciava as feiras de cereais, legumes e frutas do posto.","Três marcas claras identificam as colheitas na tábua do cavalete.","sign","deb572","WOOD"],
      ["LEAGUE_WATCH_BELLS","Sinos da Vigília Comunitária","A Liga usava repiques curtos para chamar os moradores à praça quando os vigias mudavam de turno.","Três sinos de bronze de tamanhos diferentes ficam sob um telhado de madeira.","bells","e1a653","bronze_ingot"]
    ]},
    ancient:{base:"SCULK_CORRUPTION",binder:"corrupted_shard",colors:["34405e","54375d","493c72","8570a3","374367","635879"],pieces:[
      ["ABYSS_PRESSURE_ASHLAR","Cantaria das Profundezas","Fragmentos desta pedra foram encontrados junto às primeiras sondagens nas câmaras abissais.","As linhas claras contrastam com a matriz de rocha azul-escura."],
      ["ABYSS_WATCH_PANEL","Painel do Vigia Velado","Exploradores deram esse nome ao painel porque o relevo parecia mudar sob a luz de uma tocha.","A moldura violeta destaca um campo escuro usado nas paredes das câmaras."],
      ["ABYSS_VOICES_BAND","Friso dos Sussurros","As marcas do friso aparecem em sequências regulares na entrada dos recintos mais fundos.","O desenho estreito percorre as junções entre blocos."],
      ["ABYSS_ECHO_INLAY","Incrustação do Eco Antigo","Os primeiros mapas das cavernas reproduziam este símbolo junto às passagens de volta à superfície.","O desenho radial lembra uma onda se propagando na pedra."],
      ["ABYSS_VEINED_PIER","Pilar de Veios Abissais","As câmaras mais antigas apresentam pilares de pedra listrada perto do teto.","Estrias escuras cercam os veios da rocha do chão ao topo."],
      ["ABYSS_CHAMBER_TILE","Lajota das Câmaras Soterradas","Algumas lajotas estavam enterradas sob o cascalho dos corredores de acesso.","Marcas roxas nos cantos reaparecem em losangos no piso montado."],
      ["ABYSS_VOTIVE_EYE","Olho Votivo do Abismo","A primeira escultura intacta foi catalogada à entrada de uma câmara de sussurros.","O olho facetado emite luz violeta de dentro de uma armação de pedra.","eye","da7fff","GLOWSTONE",7],
      ["ABYSS_WHISPER_SPIRES","Espinhos do Leito das Vozes","Os batedores aprenderam a reconhecer as câmaras pelas pontas que emergiam do leito de pedra.","Os espinhos curvos nascem de uma crosta escura e se inclinam para o centro.","abyssThorns","947ccb","CORRUPTED_GEM"],
      ["ABYSS_SEALED_URN","Urna das Vozes Seladas","Urnas com a boca lacrada foram encontradas em nichos próximos aos aposentos antigos.","Quatro grampos de pedra prendem a tampa em torno de um selo roxo.","sealedUrn","bb8fc4","CERAMIC"]
    ]},
    elemental:{base:"MARBLE",binder:"elemental_core",colors:["567b93","5b698b","b58964","7bbab0","786894","a8b9b4"],pieces:[
      ["CONFLUX_TEMPERED_ASHLAR","Cantaria do Braseiro Elemental","O primeiro altar da Convergência contou com pedra temperada perto da fissura de fogo.","A superfície azulada conserva juntas escuras entre as pedras."],
      ["CONFLUX_TIDE_PANEL","Painel das Marés Suspensas","Os guardiões talharam em mármore a curva das águas ao redor do santuário.","O azul do painel foi escolhido para contrastar com pisos de pedra clara."],
      ["CONFLUX_STORM_BAND","Friso da Tempestade Espiral","O friso marca onde os caminhos do vento e do raio se encontram na Convergência.","As faixas cruzadas dão continuidade ao traçado entre blocos."],
      ["CONFLUX_ELEMENT_INLAY","Incrustação das Oito Correntes","Os guias traçaram oito direções para registrar os santuários elementais.","O motivo radial aponta para os quatro lados e os quatro cantos da peça."],
      ["CONFLUX_RESONANT_PIER","Pilar da Rocha Ressonante","Os construtores do bastião terrestre cederam o molde do pilar aos outros santuários.","O acabamento estriado realça a cor violeta da rocha."],
      ["CONFLUX_FROST_TILE","Lajota de Geada Prismática","A laje clara assinalava a primeira rota entre arcano e gelo.","Suas bordas formam losangos nas junções do piso."],
      ["CONFLUX_CURRENT_ORB","Orbe das Oito Correntes","A Convergência reuniu oito núcleos simbólicos ao redor de uma esfera central.","O cristal suspenso sobre a base emite luz azul-pálida.","orb","9de9f5","GLOWSTONE",8],
      ["CONFLUX_PRISM_GARDEN","Jardim de Prismas Vivos","Artesãos inspiraram-se nos cristais que brotam perto das fissuras para confeccionar esta peça.","Prismas de cores diferentes formam um círculo baixo em torno do cristal maior.","prismGarden","cbabff","AMETHYST"],
      ["CONFLUX_NEXUS_CROWN","Coroa da Convergência","A primeira coroa foi colocada sobre o marco do encontro entre os oito santuários.","As oito pontas se abrem em torno da borda dourada da coroa.","nexusCrown","f4be79","CRYSTAL"]
    ]}
  };

  // Keep these ranges and the order of existing entries stable for saved worlds.
  const firstId=1000,firstTile=288;
  const patterns=["masonry","panel","band","inlay","pier","tile"];
  const parseColor=shade=>[0,2,4].map(offset=>parseInt(shade.slice(offset,offset+2),16));
  const pieces=[], byGroup={};
  for(const [group,{base,binder,colors,pieces:rows}] of Object.entries(sets)){
    byGroup[group]=rows.map(([key,name,story,curiosity,model,color,ingredient,range],index)=>{
      const shade=color??colors[index];
      const piece={key,name,story,curiosity,group,model,ingredient,range,color:shade,
        rgb:parseColor(shade),pattern:patterns[index],index,
        id:firstId+pieces.length,tile:firstTile+pieces.length,base,binder};
      pieces.push(piece);
      return piece;
    });
  }
  const pierCaps=new Map(Object.values(byGroup).map((group,index)=>[firstTile+pieces.length+index,group[4]]));
  const capByPiece=new Map([...pierCaps].map(([tile,piece])=>[piece,tile]));
  const extraByGroup={};
  const extraPalettes={brasa:["BRASA_MASONRY","BRASA_SEAL"],farol:["FAROL_MASONRY","FAROL_SEAL"],tambor:["TAMBOR_MASONRY","TAMBOR_SEAL"],marco:["MARCO_MASONRY","MARCO_SEAL"],vento:["VENTO_MASONRY","VENTO_SEAL"],revoadas:["LAIR_TEMPO","RELIC_TEMPO"]};
  let newIndex=0;
  for(const [group,rows] of Object.entries(QuimiCraftFactionOrnaments.collections)){
    extraByGroup[group]=rows.map(([key,name,color,ingredient,story,sculpt,range],index)=>{
      const piece={key,name,color,ingredient,story,sculpt,range,group,index,model:"ornament",rgb:parseColor(color),
        id:byGroup[group]?firstId+pieces.length:1600+newIndex,tile:byGroup[group]?firstTile+pierCaps.size+pieces.length:600+newIndex++,
        curiosity:range?"A peça emite luz quando instalada no mundo.":null};
      pieces.push(piece);
      return piece;
    });
  }
  const byTile=new Map(pieces.map(piece=>[piece.tile,piece]));

  function register(B,defs){
    for(const piece of pieces){
      const {id,key,name,tile,color,group,model,story,curiosity,range,sculpt}=piece;
      if(defs[id])throw Error("ID de decoração duplicado: "+key+" / "+id);
      B[key]=id;
      const cap=capByPiece.get(piece);
      defs[id]={name,tex:cap===undefined?tile:[cap,tile,cap],icon:"#"+color,solid:!model,partial:!!model,hard:model ? .7 : 1.55,
        factionBuilding:{group,story,curiosity}};
      if(model){
        const palette=byGroup[group];
        const [wall,seal]=extraPalettes[group]??[];
        defs[id].factionDecor={model,group,tile,base:palette?palette[4].tile:defs[B[wall]]?.tex??3,trim:palette?palette[2].tile:defs[B[seal]]?.tex??13,range,sculpt};
      }
    }
  }

  function recipes(B){
    const resolve=key=>B[key]??key;
    return pieces.map(({name,key,model,base,binder,ingredient,group,index,sculpt})=>{
      const source=model?(byGroup[group]?.[sculpt?index%6:index-6]?.key??extraPalettes[group]?.[group==="revoadas"?0:index%2]):base;
      const accent=model?ingredient:[binder,"GLASS","STONE","CERAMIC","WOOD","CLAY"][index];
      return {name,need:[[resolve(source),model?1:3],[resolve(accent),1]],out:[B[key],model?1:4]};
    });
  }

  const motifs={
    light:(u,v)=>Math.abs(Math.hypot(u,v)-7)<1.2||Math.min(u,v)<1&&Math.max(u,v)<12,
    scourge:(u,v)=>Math.max(u,v)<11&&(Math.min(u,v)<1.2||Math.abs(u-v)<1),
    fel:(u,v)=>Math.abs(u+v-12)<1.3||Math.abs(u-3)<1.2&&v<7,
    druid:(u,v)=>Math.abs(Math.hypot(u*1.5,v)-8)<1.2||u<1.5&&v<12,
    alchemist:(u,v)=>Math.abs(Math.max(u,v*.58+u*.74)-8)<1.1||u+v<2,
    villager:(u,v)=>Math.abs(u-v*.65)<1.2&&v<10||u<1.1&&v<12,
    ancient:(u,v)=>Math.abs(Math.hypot(u,v*1.6)-10)<1.2||u<1.2&&v<4,
    elemental:(u,v)=>Math.abs(u+v-13)<1.3||Math.max(u,v)<9&&(Math.min(u,v)<1.1||Math.abs(u-v)<.8)
  };
  const finishes={
    light:{accent:[238,179,77],course:[16,16],ribs:5,band:(x,y,v)=>v<4&&(x%8<2||v<1)},
    scourge:{accent:[165,221,251],course:[20,12],ribs:4,band:(x,y,v)=>Math.abs(Math.hypot((x%10-4.5)*.8,v)-3.4)<1.25},
    fel:{accent:[153,188,62],course:[13,7],ribs:3,band:(x,y,v)=>Math.abs(v-(x%8)*.86)<1.1},
    druid:{accent:[139,186,90],course:[12,8],ribs:7,band:(x,y,v)=>Math.abs(v-4-Math.sin(x*Math.PI/8)*3)<1.25},
    alchemist:{accent:[220,163,89],course:[10,8],ribs:6,band:(x,y,v)=>x%4<1.2&&v<(x%8<2?7:4)||v<1.1},
    villager:{accent:[223,173,109],course:[23,8],ribs:3,band:(x,y,v)=>Math.abs(v-2-Math.abs(x%10-4.5)*.48)<1.2},
    ancient:{accent:[184,129,211],course:[14,10],ribs:8,band:(x,y,v)=>Math.abs(Math.hypot(x%9-4,v)-5.8)<1},
    elemental:{accent:[135,222,207],course:[16,12],ribs:4,band:(x,y,v)=>Math.abs(v-4-Math.sin(x*Math.PI/8)*2.8)<1.2}
  };

  function paint(tile,x,y,hash){
    const cap=pierCaps.get(tile),piece=cap??byTile.get(tile);
    if(!piece)return null;
    const {rgb,pattern,group}=piece, noise=(hash(x,y,tile)-.5)*14;
    const u=Math.abs(x-15.5),v=Math.abs(y-15.5),edge=Math.max(u,v),diamond=u+v;
    const {accent,course:[width,height],ribs,band}=finishes[group]??finishes.light;
    let shade=0,pigment=rgb;
    switch(cap?"cap":pattern){
      case "masonry": {
        const joint=(x+Math.floor(y/height)*Math.round(width*.5))%width;
        if(y%height===1||joint===1)pigment=group==="light"?accent:rgb;
        shade=y%height===0||joint===0?-47:y%height===1||joint===1?19:
          (hash(Math.floor(x/width),Math.floor(y/height),tile)-.5)*39;
        break;
      }
      case "panel":
        if(edge>10&&edge<13||edge<9&&motifs[group](u*1.3,v*1.3))pigment=accent;
        shade=edge>14?-45:edge>10?-20:Math.cos(y*.47+x*.20)*12;
        break;
      case "band":
        if(v>9&&v<11||band(x,y,v))pigment=accent;
        shade=v>11?-41:v<8?-28:0;
        break;
      case "inlay":
        if(edge<13&&motifs[group](u,v))pigment=accent;
        shade=edge>13?-44:diamond<5?15:-20;
        break;
      case "pier":
        if(v>12)pigment=accent;
        shade=v>14?-23:u>14?-46:Math.cos(x*Math.PI*ribs/16)*24;
        break;
      case "cap": {
        const ring=group==="villager"||group==="druid"?Math.hypot(u,v):Math.max(u,v);
        shade=Math.floor(ring/2)%2?20:-24;
        if(ring<4||ring>12)pigment=accent;
        break;
      }
      case "tile":
        if(diamond>22&&(group!=="scourge"||diamond>24)||group==="alchemist"&&u<1&&v<9)pigment=accent;
        shade=edge>14?-37:diamond>21?-14:Math.sin(x*.44-y*.41)*13;
        break;
      default:
        shade=(piece.range?12:0)+Math.cos((x+y)*.39)*11;
    }
    return [...pigment.map(channel=>channel+shade+noise),255];
  }

  function display(B,group){
    const [stone,panel,frieze,inlay,pier,tile,ornament,feature,relic]=byGroup[group].map(({key})=>B[key]);
    const cells=[];
    for(let u=-2;u<=2;u++){
      cells.push([u,0,-1,stone],[u,0,0,u%2===0?inlay:tile],[u,0,1,tile]);
      cells.push([u,1,-1,stone],[u,2,-1,u%2===0?pier:panel],[u,3,-1,frieze]);
    }
    cells.push([-2,1,0,ornament],[0,1,0,feature],[2,1,0,relic]);
    return cells;
  }
  const ornamentIds=(B,group)=>(extraByGroup[group]??[]).map(({key})=>B[key]);
  function courtyard(B,group,side){
    const ornaments=ornamentIds(B,group),start=side<0?0:5;
    return [[-2,1],[0,1],[2,1],[-1,3],[1,3]].map(([u,v],i)=>[u,v,ornaments[start+i]]);
  }
  const color=tile=>(pierCaps.get(tile)??byTile.get(tile))?.rgb;
  const lights=B=>pieces.filter(piece=>piece.range).map(({key,rgb,range})=>[B[key],{
    color:rgb[0]*65536+rgb[1]*256+rgb[2],range,height:.55,steady:true
  }]);

  return {register,recipes,paint,display,ornamentIds,courtyard,color,lights};
})();
