"use strict";

globalThis.QuimiCraftFactionOrnaments=(()=>{
  // Entries are appended in catalog order. Their position determines their persistent block ID.
  const collections={
    light:[
      ["DAWN_OATH_ASTROLABE","Astrolábio dos Juramentos","dcb266","bronze_ingot","O observatório do palácio usava dois aros para alinhar a primeira luz da manhã.",m=>{
        m.base(.27);m.rod([.5,.10,.5],[.5,.48,.5],.05,"gold");
        m.ring(.5,.55,.5,.29,"z","main");m.ring(.5,.55,.5,.25,"y","gold");m.gem(.5,.55,.5,.10,.14,"sun");
      }],
      ["DAWN_CANDLE_ALTAR","Altar das Sete Velas","f3ddb6","candle","Sete velas marcam os turnos que precedem a cerimônia da aurora.",m=>{
        m.base(.38);m.box(.5,.22,.52,.54,.25,.38,"stand");m.box(.5,.36,.49,.81,.10,.57);
        for(let i=0;i<7;i++)m.candle(.18+i*.106,.41,i%2?.57:.42,.14+(i%3)*.05,"paper");
      }],
      ["DAWN_HONOR_AMPHORA","Ânfora das Honras","a55f2d","CERAMIC","Ânforas de cobre e cerâmica guardavam os nomes de sentinelas condecorados.",m=>{
        m.vessel(.5,.5,[[0,.16],[.16,.22],[.38,.24],[.62,.16],[.74,.11],[.8,.135]],"main");
        for(const x of [.27,.73])m.ring(x,.54,.5,.12,"z","gold",.72);
        m.ring(.5,.27,.5,.235,"y","gold");
      }],
      ["DAWN_SOLAR_DIAL","Relógio Solar do Pátio","edd49b","gold_nugget","O primeiro pátio marcava a troca da guarda pela sombra de um gnomon.",m=>{
        m.vessel(.5,.5,[[0,.34],[.08,.39],[.36,.17],[.43,.36],[.47,.38]],"main");
        for(let i=0;i<12;i++){const a=i*Math.PI/6;m.rod([.5+Math.cos(a)*.27,.474,.5+Math.sin(a)*.27],[.5+Math.cos(a)*.34,.474,.5+Math.sin(a)*.34],.012,"gold");}
        m.panel([[.45,.48],[.54,.79],[.53,.48]],.50,"gold",.04);
      }],
      ["DAWN_HYMN_LECTERN","Atril dos Cânticos","cbb27c","PLANK","Os cantores da Alvorada deixavam o livro coral aberto sobre este atril.",m=>{
        m.base(.30);m.box(.50,.34,.54,.24,.49,.26,"stand");m.box(.5,.63,.5,.65,.10,.47);
        m.book(.5,.70,.48,"paper");m.rod([.5,.75,.30],[.54,.80,.63],.012,"gold");
      }],
      ["DAWN_MEDAL_RACK","Medalheiro da Primeira Guarda","956630","gold_nugget","As três condecorações pendiam no salão de instrução do palácio.",m=>{
        m.frame(.17,.83,.80,.58,"stand");m.box(.5,.57,.625,.68,.45,.05,"night");
        for(let i=0;i<3;i++){const x=.27+i*.23;m.box(x,.65,.56,.075,.22,.025,"blue");m.gem(x,.49,.537,.055,.075,i===1?"sun":"main");}
      }],
      ["DAWN_COURT_BENCH","Banco de Mármore da Vigília","eadbbd","MARBLE","Os vigias se revezavam no banco de mármore sob as galerias.",m=>{
        m.bench("main","gold");m.box(.5,.54,.70,.73,.25,.09,"main");
        for(const x of [.22,.78])m.box(x,.54,.48,.08,.065,.36,"gold");
      }],
      ["DAWN_CHAIN_CENSER","Turíbulo de Correntes Douradas","e0a755","bronze_ingot","Os incensários passavam de mão em mão no primeiro cortejo da manhã.",m=>{
        m.base(.25);m.rod([.78,.09,.6],[.78,.86,.6],.045,"stand");
        m.rod([.78,.86,.60],[.46,.86,.47],.027,"gold");
        for(const a of [0,2.094,4.189])m.rod([.46,.84,.47],[.46+Math.cos(a)*.16,.45,.47+Math.sin(a)*.16],.017,"gold");
        m.vessel(.46,.47,[[.29,.07],[.35,.13],[.46,.18],[.51,.12]],"main");
      }],
      ["DAWN_SPEAR_DISPLAY","Suporte das Lanças de Cerimônia","c2944e","IRON","As armas de desfile ficavam cruzadas no salão dos arautos.",m=>{
        m.box(.5,.10,.56,.73,.18,.41,"stand");
        for(const s of [-1,1]){m.rod([.5-s*.24,.17,.60],[.5+s*.26,.81,.49],.032,"wood");m.gem(.5+s*.28,.83,.485,.067,.105,"main");}
        m.disk(.5,.48,.42,.14,.045,"blue","z");
      }],
      ["DAWN_MORNING_FOUNTAIN","Fonte do Alvorecer","79baca","GLOWSTONE","Uma taça de água azul reflete a primeira luz no pátio do palácio.",m=>{
        m.bowl(.5,.5,.06,.38,"stand","water");m.vessel(.5,.5,[[.12,.08],[.53,.072],[.56,.21],[.60,.19]],"gold");
        m.gem(.5,.68,.5,.10,.11);for(const x of [.31,.69])m.rod([x,.565,.5],[x,.20,.5],.017,"water");
      },5]
    ],
    scourge:[
      ["FROST_OSSUARY_SKULL","Crânio do Ossuário","cad5d8","STONE","O ossuário marcava seus nichos com crânios talhados em pedra.",m=>{
        m.base(.27);m.gem(.5,.53,.53,.22,.24);
        m.box(.5,.32,.39,.29,.12,.25);for(const x of [.415,.585])m.box(x,.54,.333,.099,.090,.041,"night");
        for(const x of [.43,.50,.57])m.box(x,.32,.255,.036,.11,.05,"bone");
      }],
      ["FROST_CHAIN_POST","Marco das Correntes Congeladas","8ea3ba","IRON","As correntes suspensas marcavam o limite dos calabouços da cidadela.",m=>{
        for(const x of [.17,.83]){m.box(x,.30,.54,.17,.60,.19,"stand");m.gem(x,.64,.54,.105,.12,"ice");}
        for(let i=0;i<5;i++)m.ring(.24+i*.13,.52-Math.sin(i*Math.PI/4)*.19,.48,.076,i%2?"x":"z","main");
      }],
      ["FROST_ICEFUNERAL_CHEST","Sarcófago Funerário de Gelo","91c5e4","ICE","Uma tampa chanfrada protege o túmulo cerimonial dos primeiros cavaleiros.",m=>{
        m.box(.5,.105,.5,.61,.21,.88,"stand");m.box(.5,.21,.5,.67,.06,.93,"metal");
        m.panel([[.22,.24],[.29,.39],[.71,.39],[.78,.24]],.50,"main",.76);
        for(const z of [.28,.72])m.box(.5,.405,z,.46,.035,.07,"ice");
      }],
      ["FROST_HOURGLASS","Ampulheta da Última Vigília","85c8de","GLASS","A ampulheta lembrava aos guardas a duração de uma noite na cripta.",m=>{
        m.frame(.23,.77,.88,.5,"metal");m.box(.5,.83,.5,.57,.07,.32,"stand");
        m.vessel(.5,.45,[[.17,.18],[.29,.14],[.45,.024],[.64,.14],[.74,.18]],"main",10);
        m.vessel(.5,.43,[[.18,.143],[.28,.049],[.30,.018]],"ice");
      }],
      ["FROST_BONE_CLAW","Garra do Túmulo Branco","c3cad6","STONE","A mão esculpida imita as garras que emergem da nevasca nas lendas do Flagelo.",m=>{
        m.base(.32);m.box(.5,.25,.54,.34,.29,.24,"stand");
        for(let i=0;i<4;i++){
          const x=.32+i*.115,h=.61+i*.055;
          m.rod([x,.34,.57],[x,h,.58],.04);m.rod([x,h,.58],[x+.03,h+.09,.40],.031);
          m.gem(x+.03,h+.03,.36,.039,.052,"bone");
        }
      }],
      ["FROST_CANDLE_TREE","Castiçal dos Mortos-Vivos","73b9ed","GLOWSTONE","As três chamas frias demarcavam os degraus que levam ao ossuário.",m=>{
        m.base(.27);m.rod([.5,.11,.5],[.5,.69,.5],.055,"metal");
        for(const [x,h] of [[.22,.35],[.5,.65],[.78,.35]]){
          m.rod([.5,.36,.5],[x,h+.04,.5],.028,"metal");m.bowl(x,.5,h+.01,.103,"stand","main");m.gem(x,h+.19,.5,.062,.12);
        }
      },6],
      ["FROST_CRYPT_OBELISK","Obelisco da Cripta Silenciosa","476e99","SLATE","Os arquitetos usavam obeliscos estreitos para marcar o lado leste dos túmulos.",m=>{
        m.base(.31);m.vessel(.5,.5,[[.10,.23],[.22,.19],[.78,.115],[.94,.022]],"main",4);
        for(const x of [.40,.60])m.rod([x,.26,.36],[.50,.71,.40],.023,"ice");
      }],
      ["FROST_GRAVE_MARKER","Lápide de Dupla Coroa","778dab","SLATE","Duas coroas partidas aparecem em lápides do antigo pátio sepulcral.",m=>{
        m.base(.34);m.panel([[.23,.1],[.23,.69],[.35,.83],[.65,.83],[.77,.69],[.77,.1]],.52,"main",.18);
        for(const x of [.41,.59])m.ring(x,.61,.415,.10,"z","ice",.75);m.box(.5,.38,.414,.35,.062,.025,"metal");
      }],
      ["FROST_BONE_RACK","Estante das Costelas Geladas","bac4d2","IRON","Arqueiros do Flagelo guardavam ossos longos nesta armação de ferro.",m=>{
        m.frame(.20,.80,.80,.60,"metal");
        for(let i=0;i<5;i++){const y=.18+i*.115;m.rod([.23,y,.58],[.50,y+.10,.39],.031);m.rod([.50,y+.10,.39],[.77,y,.58],.031);}
      }],
      ["FROST_CRYO_CAGE","Gaiola da Geada Presa","91dbfa","ICE","A geada cresceu no interior de uma gaiola esquecida nas ameias.",m=>{
        m.base(.34);m.disk(.5,.76,.5,.28,.08,"metal");
        for(let i=0;i<8;i++){const a=i*Math.PI/4,x=.5+Math.cos(a)*.26,z=.5+Math.sin(a)*.26;m.rod([x,.11,z],[x,.73,z],.024,"metal");}
        m.gem(.5,.46,.5,.11,.25);
      }]
    ],
    fel:[
      ["FEL_METEOR_DISPLAY","Fragmento de Meteoro Acorrentado","9ec54d","OBSIDIAN","Ferreiros mantêm a escória de uma queda infernal presa por correntes.",m=>{
        m.base(.36);m.vessel(.50,.54,[[.12,.28],[.38,.34],[.54,.22],[.74,.13]],"night",6);
        m.gem(.52,.47,.27,.116,.19);m.ring(.50,.37,.53,.33,"y","metal");
        m.rod([.26,.15,.24],[.70,.62,.32],.037,"metal");
      }],
      ["FEL_FURNACE_MANIFOLD","Distribuidor da Forja Vil","702f37","IRON","O metal avermelhado liga os respiradouros da forja aos depósitos de calor.",m=>{
        m.box(.5,.09,.51,.79,.18,.54,"night");m.box(.5,.22,.52,.61,.16,.31,"metal");
        for(const x of [.26,.5,.74]){m.rod([x,.27,.52],[x,.65,.52],.055);m.rod([x,.65,.52],[x,.75,.34],.052);m.disk(x,.76,.34,.073,.04,"metal");}
      }],
      ["FEL_EMBER_CAGE","Gaiola das Três Brasas","b5e637","GLOWSTONE","Os guardas trancavam três brasas acesas sob uma cúpula de ferro.",m=>{
        m.bowl(.5,.5,.045,.35,"night","metal");
        for(const x of [.23,.77]){
          m.rod([x,.22,.27],[x,.62,.27],.028,"metal");m.rod([x,.62,.27],[.50,.85,.51],.027,"metal");
          m.rod([x,.22,.75],[x,.62,.75],.028,"metal");m.rod([x,.62,.75],[.50,.85,.51],.027,"metal");
        }
        for(const [x,y,z] of [[.32,.46,.42],[.65,.51,.49],[.48,.61,.58]])m.gem(x,y,z,.075,.11);
      },7],
      ["FEL_OATH_TABLE","Mesa dos Pactos Gravados","8d6354","BASALT","Juramentos da Legião foram entalhados nas ranhuras do tampo.",m=>{
        m.bench("night","metal",.42);m.box(.5,.49,.52,.82,.16,.62,"main");
        for(const x of [.25,.5,.75])m.panel([[x-.06,.579],[x+.06,.579],[x,.69]],.278,"trim",.025);
        for(const z of [.32,.68])m.rod([.21,.58,z],[.79,.58,z],.012,"night");
      }],
      ["FEL_FORGE_BELLOWS","Fole das Brasas Negras","6c3642","hide","O fole decorativo reproduz as dobras de couro das oficinas da Legião.",m=>{
        m.box(.5,.065,.54,.58,.13,.74,"wood");
        m.vessel(.5,.52,[[.12,.24,.29],[.16,.27,.31],[.24,.21,.27],[.30,.26,.30],[.37,.21,.25],[.45,.25,.29]],"main");
        m.rod([.5,.25,.31],[.5,.24,.065],.07,"metal");m.rod([.50,.46,.54],[.50,.68,.78],.039,"wood");
      }],
      ["FEL_INFERNAL_ANVIL","Bigorna da Forja Rubra","74586a","IRON","O dorso da bigorna ficou marcado pelo calor constante dos fornos.",m=>{
        m.base(.36);m.box(.50,.26,.51,.32,.31,.40,"night");m.box(.53,.48,.51,.60,.18,.37);
        m.panel([[.11,.41],[.31,.41],[.31,.57],[.08,.53]],.51,"metal",.24);
        m.rod([.35,.57,.38],[.76,.57,.38],.014,"rust");
      }],
      ["FEL_BROKEN_GATE","Arco Rubro Partido","994456","OBSIDIAN","Um arco incompleto recorda a primeira fenda aberta na muralha.",m=>{
        m.box(.50,.075,.5,.86,.15,.42,"night");
        for(const [x,z,w] of [[.17,.56,.16],[.82,.56,.19]])m.box(x,.34,z,w,.48,.33);
        m.rod([.17,.55,.56],[.36,.88,.53],.107,"main");m.rod([.82,.55,.56],[.62,.77,.55],.105,"night");
        m.gem(.53,.64,.49,.081,.13,"green");
      }],
      ["FEL_CHAIN_HOOK","Gancho da Ala Infernal","946650","IRON","Os carregadores içavam cestos de escória com este gancho de pedestal.",m=>{
        m.box(.62,.08,.55,.62,.16,.52,"night");
        m.rod([.78,.15,.62],[.78,.89,.62],.074,"metal");m.rod([.77,.88,.62],[.38,.88,.52],.048,"metal");
        m.rod([.38,.88,.52],[.38,.51,.52],.017,"rust");m.ring(.38,.43,.53,.11,"z","main",1,10,.75);
      }],
      ["FEL_BRIMSTONE_COIL","Espiral de Enxofre da Legião","b1a842","SULFUR","A espiral amarela registra um método de ornamentar escória endurecida.",m=>{
        m.base(.35);m.rod([.5,.09,.5],[.5,.86,.5],.11,"night");
        m.path(Array.from({length:23},(_,i)=>[.5+Math.cos(i*.79)*.22,.15+i*.030,.5+Math.sin(i*.79)*.22]),.038);
      }],
      ["FEL_FANG_PLAQUE","Placa das Presas Juramentadas","9a495a","BASALT","Uma placa de presas sinalizava a entrada dos depósitos da Legião.",m=>{
        m.base(.32);m.panel([[.12,.42],[.18,.78],[.35,.84],[.65,.84],[.82,.78],[.88,.42],[.50,.20]],.54,"main",.17);
        for(const s of [-1,1])m.panel([[.5+s*.07,.67],[.5+s*.24,.69],[.5+s*.14,.34]],.446,"bone",.028);
      }]
    ],
    druid:[
      ["DRUID_STAG_CARVING","Entalhe do Cervo das Clareiras","a77a4c","WOOD","A escultura recorda a primeira forma animal ensinada no círculo.",m=>{
        m.box(.5,.135,.59,.67,.27,.31,"stand");m.gem(.50,.49,.46,.148,.20);m.box(.50,.40,.347,.17,.095,.13);
        for(const s of [-1,1]){m.path([[.5+s*.11,.58,.48],[.5+s*.24,.72,.51],[.5+s*.29,.93,.55]],.025,"wood");m.rod([.5+s*.20,.69,.50],[.5+s*.34,.81,.46],.021,"wood");}
      }],
      ["DRUID_MOON_SEED_POT","Vaso da Semente Lunar","a58cc9","MOSS","Uma muda crescia na pedra cinzenta onde os xamãs observavam a lua.",m=>{
        m.vessel(.5,.51,[[0,.22],[.24,.15],[.32,.22],[.39,.24]],"stone");
        m.path([[.49,.37,.52],[.45,.57,.52],[.56,.73,.51],[.59,.88,.49]],.025,"leaf");
        m.leaf(.46,.61,.52,-1,"leaf");m.leaf(.54,.72,.51,1,"leaf");m.gem(.59,.87,.49,.091,.095);
      }],
      ["DRUID_BIRCH_BENCH","Banco de Bétula do Bosque","c9ba8d","PLANK","Galhos claros foram reaproveitados pelos artesãos do bosque.",m=>{
        for(const x of [.20,.78])for(const z of [.35,.68])m.rod([x,.038,z],[x*.91+.045,.39,z],.052,"wood");
        for(let i=0;i<4;i++)m.box(.5,.39,.34+i*.099,.76,.065,.087);
        for(const x of [.20,.80])m.rod([x,.37,.70],[x,.68,.74],.033,"wood");
        m.rod([.17,.64,.72],[.83,.64,.72],.046);
      }],
      ["DRUID_WOVEN_HIVE","Colmeia de Junco","caa150","honey","Apicultores do Círculo trançavam juncos para proteger as colmeias.",m=>{
        m.vessel(.5,.53,[[0,.22],[.12,.33],[.25,.32],[.38,.28],[.52,.23],[.64,.14],[.69,.045]],"main",12);
        for(const [y,r] of [[.11,.30],[.23,.31],[.35,.28],[.45,.24],[.54,.19]])m.ring(.5,y,.53,r,"y","wood");
        m.box(.5,.19,.205,.13,.087,.049,"night");
      }],
      ["DRUID_CAIRN_SPIRAL","Espiral de Pedras do Círculo","79a688","STONE","A trilha sinuosa em miniatura lembra as caminhadas de iniciação.",m=>{
        m.disk(.50,.055,.50,.43,.10,"stand");
        for(let i=0;i<9;i++){const a=i*.89,r=.36-i*.031;m.gem(.5+Math.cos(a)*r,.13+i*.025,.5+Math.sin(a)*r,.066,.048+i*.009,i%3?"stone":"main");}
      }],
      ["DRUID_HERB_DRYER","Varal de Ervas do Xamã","719f5a","MOSS","O varal mantém os ramos acima da umidade do chão.",m=>{
        m.frame(.16,.84,.89,.54,"wood");
        for(let i=0;i<5;i++){const x=.24+i*.13,h=.42+(i%3)*.06;m.rod([x,.86,.52],[x,h,.52],.014,"wood");m.leaf(x,h+.05,.51,i%2?1:-1,i%2?"main":"leaf");}
      }],
      ["DRUID_WICKER_REFUGE","Abrigo de Vime do Bosque","9a7650","PLANK","O Círculo monta pequenos abrigos de galho nos caminhos da mata.",m=>{
        m.box(.5,.047,.5,.79,.09,.74,"wood");
        for(const z of [.28,.50,.72]){
          m.path([[.21,.07,z],[.24,.49,z],[.50,.76,z],[.76,.49,z],[.79,.07,z]],.038);
        }
        for(const x of [.26,.39,.61,.74])m.rod([x,.48,.26],[x,.48,.74],.026,"leaf");
      }],
      ["DRUID_MOON_WELL","Poço dos Reflexos Lunares","83bfb3","GLOWSTONE","À noite, o brilho da água do poço marca a entrada do santuário.",m=>{
        m.bowl(.5,.5,.045,.38,"stand","main");m.ring(.5,.22,.5,.36,"y","stone");
        m.rod([.76,.18,.62],[.76,.64,.60],.037,"wood");m.rod([.76,.64,.60],[.51,.72,.50],.031,"wood");
        m.gem(.51,.59,.50,.064,.097,"light");
      },5],
      ["DRUID_STONE_MORTAR","Pilão Rúnico de Raízes","889b73","STONE","O pilão de pedra era usado para prensar raízes e sementes na estação seca.",m=>{
        m.bowl(.5,.5,.024,.32,"main","night");
        m.rod([.41,.16,.48],[.68,.67,.60],.066,"wood");m.gem(.68,.67,.60,.079,.087,"wood");
        m.ring(.5,.15,.5,.30,"y","trim");
      }],
      ["DRUID_BIRD_PERCH","Poleiro dos Mensageiros","a8b35f","feather","O Círculo deixava os galhos livres para aves que traziam mensagens.",m=>{
        m.base(.27);m.path([[.46,.1,.54],[.52,.45,.58],[.50,.73,.54],[.31,.89,.52]],.052,"wood");
        m.rod([.52,.47,.58],[.76,.65,.39],.038,"wood");
        for(const [x,y,z] of [[.29,.84,.51],[.73,.65,.39]])m.leaf(x,y,z,x>.5?1:-1);
        m.ring(.49,.53,.44,.092,"z","trim");
      }]
    ],
    alchemist:[
      ["ALCHEMIST_DESK_MICROSCOPE","Microscópio de Bancada","83b4ad","GLASS","O tubo inclinado e a mesa de amostras reproduzem um microscópio da Academia.",m=>{
        m.box(.5,.07,.5,.77,.14,.64,"metal");m.path([[.68,.14,.60],[.71,.40,.59],[.65,.65,.54],[.49,.75,.49]],.053,"main");
        m.rod([.48,.48,.39],[.58,.79,.49],.079,"gold");m.rod([.47,.45,.38],[.49,.54,.40],.045,"night");
        m.box(.48,.33,.45,.30,.052,.22,"main");m.box(.48,.362,.45,.20,.018,.14,"glass");
      }],
      ["ALCHEMIST_PRISM_READER","Leitor de Prismas","68adba","CRYSTAL","Um prisma entre duas lentes lembra a bancada de análise da Ordem.",m=>{
        m.box(.5,.078,.52,.86,.15,.59,"stand");
        for(const x of [.23,.76]){m.box(x,.27,.5,.13,.28,.23,"metal");m.disk(x,.45,.5,.11,.06,"main","x");}
        m.gem(.50,.43,.50,.12,.16,"violet");m.rod([.32,.45,.47],[.67,.45,.47],.012,"sun");
      }],
      ["ALCHEMIST_COPPER_COIL","Serpentina de Condensação","cd8756","copper_ingot","Curvas de cobre dão à serpentina a forma dos primeiros condensadores.",m=>{
        m.frame(.19,.81,.83,.63,"stand");
        m.path(Array.from({length:27},(_,i)=>[.5+Math.cos(i*.72)*.21,.15+i*.024,.49+Math.sin(i*.72)*.16]),.033,"main");
        m.box(.5,.13,.49,.50,.07,.32,"metal");
      }],
      ["ALCHEMIST_ATOM_MODEL","Modelo de Liga em Órbita","bb6bd6","AMETHYST","As hastes e esferas eram usadas em aulas sobre a estrutura da matéria.",m=>{
        m.base(.28);m.rod([.5,.08,.5],[.5,.48,.5],.042,"gold");
        for(const [tilt,color] of [[.6,"main"],[-.8,"water"],[1.4,"metal"]]){
          const orbit=Array.from({length:17},(_,i)=>{
            const angle=i*Math.PI/8,x=.27*Math.cos(angle),y=.20*Math.sin(angle);
            return [.5+x*Math.cos(tilt)-y*Math.sin(tilt),.54+x*Math.sin(tilt)+y*Math.cos(tilt),.5+y*.85];
          });
          m.path(orbit,.012,color);m.gem(...orbit[tilt<0?6:2],.037,.042,color);
        }
        m.gem(.50,.54,.50,.112,.119,"sun");
      }],
      ["ALCHEMIST_TONG_CRUCIBLE","Cadinho e Pinça de Latão","a6a099","CERAMIC","O pequeno cadinho reproduz os recipientes levados à fornalha da Academia.",m=>{
        m.box(.47,.06,.5,.72,.12,.62,"stand");m.bowl(.37,.49,.13,.25,"main","night");
        m.path([[.66,.14,.38],[.56,.29,.47],[.71,.43,.63],[.80,.52,.76]],.035,"gold");
        m.path([[.69,.14,.56],[.57,.30,.50],[.73,.45,.61],[.80,.52,.76]],.035,"gold");
      }],
      ["ALCHEMIST_MANOMETER","Manômetro da Câmara Selada","d8bb77","bronze_ingot","O mostrador de pressão tem uma agulha fixa e uma conexão de cobre.",m=>{
        m.base(.25);m.path([[.33,.13,.56],[.33,.40,.56],[.50,.49,.55]],.056,"gold");
        m.disk(.50,.63,.51,.24,.12,"gold","z");m.disk(.50,.63,.44,.19,.035,"main","z");
        m.rod([.50,.63,.414],[.61,.74,.41],.017,"night");m.rod([.38,.63,.412],[.41,.63,.412],.01,"night");
      }],
      ["ALCHEMIST_INDICATOR_WHEEL","Carrossel de Indicadores","cf9f85","CERAMIC","Frascos coloridos representavam amostras de diferentes indicadores de bancada.",m=>{
        m.disk(.5,.10,.5,.37,.18,"stand");m.disk(.5,.24,.5,.33,.09,"gold");
        for(let i=0;i<6;i++){const a=i*Math.PI/3,x=.5+Math.cos(a)*.24,z=.5+Math.sin(a)*.24;m.vessel(x,z,[[.27,.064],[.44,.064],[.49,.04],[.54,.04]],["violet","rust","leaf","sun","water","main"][i],8);}
        m.rod([.5,.1,.5],[.5,.68,.50],.037,"gold");
      }],
      ["ALCHEMIST_PIPETTE_STAND","Suporte de Pipetas Graduadas","97d9da","GLASS","As marcas no suporte ajudam a organizar utensílios de comprimentos diversos.",m=>{
        m.frame(.18,.82,.93,.54,"metal");
        m.box(.5,.61,.56,.67,.051,.25,"gold");m.box(.5,.39,.56,.67,.051,.25,"gold");
        for(let i=0;i<4;i++){const x=.26+i*.16,y=.25+i*.075;m.rod([x,y,.46],[x,.85,.46],.022);m.gem(x,.87,.46,.041,.053,i%2?"violet":"main");}
      }],
      ["ALCHEMIST_LUMINOUS_CHAMBER","Câmara da Solução Luminosa","67f1ce","glow_solution","Uma amostra prismática fica suspensa na câmara de cobre e cerâmica.",m=>{
        m.box(.5,.08,.5,.72,.16,.64,"stand");m.box(.5,.77,.50,.62,.105,.52,"metal");
        for(const x of [.24,.76])for(const z of [.28,.72])m.rod([x,.15,z],[x,.75,z],.034,"gold");
        m.gem(.5,.46,.50,.18,.21);m.rod([.5,.61,.50],[.5,.76,.50],.036,"light");
      },6],
      ["ALCHEMIST_TUBE_MANIFOLD","Coletor de Tubos de Vidro","72aca3","GLASS","Tubos paralelos levavam o líquido das bancadas a uma saída comum.",m=>{
        m.box(.50,.09,.50,.82,.18,.68,"stand");
        for(let i=0;i<3;i++){const z=.28+i*.22;m.path([[.21,.16,z],[.26,.55,z],[.48,.69,z],[.65,.47,z],[.77,.22,z]],.043,i%2?"water":"main");}
        m.rod([.77,.22,.22],[.77,.22,.78],.058,"gold");
      }]
    ],
    villager:[
      ["LEAGUE_BARREL_STACK","Pilha de Barris da Feira","a3693b","PLANK","As barricas de diferentes tamanhos eram empilhadas atrás das barracas.",m=>{
        m.barrel(.30,.54,.21,.63);m.barrel(.72,.50,.165,.42);
        m.ring(.30,.64,.54,.15,"y","wood");
      }],
      ["LEAGUE_FISH_RACK","Varal de Peixes do Píer","829fa4","PLANK","Pescadores secavam os peixes à sombra das barracas da Liga.",m=>{
        m.frame(.15,.85,.86,.56,"wood");
        for(let i=0;i<3;i++){const x=.26+i*.24;m.rod([x,.84,.54],[x,.70,.51],.012,"wood");m.gem(x,.54,.49,.076,.14);m.panel([[x-.06,.37],[x+.07,.37],[x,.48]],.49,"main",.045);}
      }],
      ["LEAGUE_FLOUR_SACKS","Sacos do Moinho","d7bd82","wool","Sacos de pano grosso guardavam farinha para a padaria comunitária.",m=>{
        for(const [x,z,r,h] of [[.32,.57,.17,.70],[.61,.42,.18,.51],[.67,.7,.16,.35]]){
          m.vessel(x,z,[[0,r*.7],[h*.2,r],[h*.65,r],[h*.9,r*.57],[h,r*.46]],"main",8);
          m.ring(x,h*.89,z,r*.59,"y","wood");
        }
      }],
      ["LEAGUE_WATER_TROUGH","Bebedouro das Caravanas","9b8155","PLANK","Os aldeões punham água rasa junto aos caminhos de carga.",m=>{
        m.box(.50,.11,.5,.86,.22,.50,"main");m.box(.50,.25,.50,.71,.024,.32,"water");
        for(const z of [.27,.73])m.box(.5,.265,z,.88,.12,.065,"wood");
        for(const x of [.09,.91])m.box(x,.26,.50,.064,.13,.47,"wood");
      }],
      ["LEAGUE_MARKET_LOOM","Tear da Feira de Tecidos","b17658","wool","Tecelões exibiam no tear as primeiras faixas produzidas para a feira.",m=>{
        m.frame(.15,.85,.88,.57,"wood");
        for(const y of [.29,.73])m.rod([.18,y,.52],[.82,y,.52],.035,"main");
        for(let i=0;i<9;i++){const x=.26+i*.06;m.rod([x,.31,.50],[x,.70,.51],.012,i%3?"paper":"rust");}
        m.box(.5,.44,.49,.52,.16,.038,"blue");
      }],
      ["LEAGUE_COURIER_BOX","Caixa do Correio da Liga","ad5b4e","PLANK","Os mensageiros deixavam recados de feira nesta caixa pintada.",m=>{
        m.base(.22);m.box(.5,.28,.51,.13,.43,.15,"wood");
        m.box(.5,.575,.51,.50,.31,.43,"main");
        m.panel([[.19,.726],[.50,.895],[.81,.726]],.51,"wood",.57);
        m.panel([[.16,.724],[.50,.929],[.84,.724],[.81,.704],[.50,.885],[.19,.704]],.51,"stand",.59);
        m.box(.50,.62,.285,.36,.057,.028,"night");
        m.box(.764,.694,.51,.033,.16,.046,"rust");m.box(.765,.768,.547,.035,.048,.10,"main");
      }],
      ["LEAGUE_WICKER_BASKET","Cesto Trançado da Colheita","b78952","wool","Cestos de vime eram usados pelos vendedores de frutas e legumes.",m=>{
        m.bowl(.50,.53,.05,.32,"main","wood");m.ring(.50,.196,.53,.30,"y","wood");
        m.path([[.19,.20,.53],[.26,.42,.53],[.5,.55,.53],[.74,.42,.53],[.81,.20,.53]],.035);
        for(const [x,z,t] of [[.38,.49,"rust"],[.56,.60,"leaf"],[.63,.42,"sun"]])m.gem(x,.23,z,.072,.078,t);
      }],
      ["LEAGUE_SMALL_CART","Carrinho do Mercado","a26b3e","WOOD","O carrinho pequeno levava mercadorias entre as duas alas do mercado.",m=>{
        m.box(.48,.34,.52,.44,.12,.58);m.box(.49,.42,.74,.54,.12,.067,"wood");
        for(const x of [.22,.75]){
          const outer=x+(x<.5?-.038:.038);
          m.box(x,.43,.52,.07,.17,.56,"wood");m.disk(x,.205,.59,.205,.063,"main","x");
          m.ring(outer,.205,.59,.174,"x","metal",1,12,1,.012);
          m.disk(outer,.205,.59,.049,.026,"metal","x");
          m.rod([x,.38,.28],[x,.45,.075],.032,"wood");
        }
      }],
      ["LEAGUE_COBBLER_STAND","Banca do Sapateiro","956c52","hide","O sapateiro expunha dois moldes de couro sobre a bancada de conserto.",m=>{
        m.bench("wood","main",.37);
        for(const x of [.31,.67]){m.box(x,.45,.43,.165,.075,.31,"main");m.box(x,.51,.54,.15,.16,.135,"night");}
        m.rod([.77,.43,.63],[.90,.67,.68],.022,"metal");
      }],
      ["LEAGUE_BAKERY_SHELF","Prateleira de Pães da Praça","d4a063","bread","A vitrine da padaria da Liga mantém os pães empilhados em duas alturas.",m=>{
        m.frame(.12,.88,.81,.65,"wood");m.box(.5,.16,.53,.79,.084,.53,"main");m.box(.5,.46,.53,.79,.084,.53,"wood");
        for(const y of [.24,.55])for(const x of [.24,.5,.76])m.gem(x,y,.445,.102,.057,y>.5?"main":"sun");
      }]
    ],
    ancient:[
      ["ABYSS_TENTACLE_RELIEF","Relevo do Tentáculo Enrolado","ac659a","CORRUPTED_GEM","Uma espiral de pedra escura serpenteia pelo relevo encontrado na galeria.",m=>{
        m.base(.30);m.box(.5,.43,.58,.70,.66,.17,"stand");
        m.path(Array.from({length:17},(_,i)=>{const a=i*.46,r=.27-i*.013;return [.5+Math.cos(a)*r,.49+Math.sin(a)*r,.475];}),.032);
      }],
      ["ABYSS_CHITIN_MOLT","Carapaça da Galeria Abissal","8f688f","chitin","Exploradores encontraram placas vazias onde insetoides trocavam a carapaça.",m=>{
        m.box(.50,.11,.53,.30,.22,.55,"night");
        for(let i=0;i<4;i++){const z=.25+i*.16;m.disk(.50,.26+(i%2)*.03,z,.21-i*.025,.13,"main","z");}
        for(const s of [-1,1])for(const z of [.25,.50,.70])m.rod([.5+s*.15,.31,z],[.5+s*.31,.055,z+.09],.036,"trim");
      }],
      ["ABYSS_NACRE_SHELL","Concha das Marés Ocas","a3aab9","CORRUPTED_GEM","A pedra nacarada conserva as curvas das conchas vistas perto de Nacreon.",m=>{
        m.base(.24);m.vessel(.5,.51,[[.10,.12,.16],[.18,.34,.27],[.28,.37,.28]],"main",10);
        for(let i=0;i<5;i++)m.rod([.50,.21,.71],[.22+i*.14,.63+Math.sin(i*.78)*.13,.59],.043,"main");
        m.gem(.5,.29,.47,.102,.132,"violet");
      }],
      ["ABYSS_WHISPER_TABLET","Tábua dos Sussurros Partidos","775075","SCULK_CORRUPTION","Fendas desenham marcas descontínuas na tábua recuperada das profundezas.",m=>{
        m.base(.31);m.panel([[.19,.19],[.21,.69],[.41,.89],[.67,.82],[.80,.56],[.73,.17]],.54,"stand",.27);
        for(let i=0;i<3;i++)m.path([[.29,.64-i*.13,.385],[.47,.65-i*.13,.385],[.52,.58-i*.13,.385],[.69,.60-i*.13,.385]],.018);
      }],
      ["ABYSS_SPIRAL_COLUMN","Coluneta do Eco Espiral","8b74a7","DEEPSTONE","Um filete roxo acompanha a torção da pedra nas câmaras profundas.",m=>{
        m.vessel(.50,.50,[[0,.28],[.11,.30],[.26,.15],[.70,.13],[.82,.22],[.91,.20]],"stand");
        m.path(Array.from({length:22},(_,i)=>[.5+Math.cos(i*.64)*.18,.13+i*.032,.5+Math.sin(i*.64)*.18]),.031);
      }],
      ["ABYSS_SPORE_TRIPOD","Trípode de Esporos Abissais","a25eab","MOSS","As pequenas cápsulas sobre os pedúnculos aparecem junto à crosta escura.",m=>{
        m.disk(.5,.075,.5,.31,.15,"night");
        for(const [x,y,z] of [[.30,.56,.40],[.66,.47,.48],[.53,.76,.68]]){m.rod([.49,.12,.51],[x,y,z],.051,"stand");m.vessel(x,z,[[y-.12,.052],[y,.147],[y+.09,.10]],"main",8);}
      }],
      ["ABYSS_VOID_SHRINE","Altar do Vazio Velado","ab6fe3","GLOWSTONE","Um fragmento violeta paira no vão da pedra do altar.",m=>{
        m.base(.34);m.ring(.50,.48,.54,.30,"z","stand",1,12,1,.045);
        m.ring(.50,.48,.54,.23,"z","main");m.gem(.5,.48,.51,.105,.15);
        for(const x of [.22,.78])m.rod([x,.10,.60],[x,.48,.54],.040,"night");
      },6],
      ["ABYSS_VEILED_COCOON","Casulo da Câmara Rubra","a36286","SCULK_CORRUPTION","Filamentos escuros prendem uma massa rosada à base de pedra.",m=>{
        m.base(.29);m.vessel(.5,.51,[[.12,.08],[.32,.19],[.58,.21],[.81,.115],[.88,.048]],"main",10);
        for(let i=0;i<7;i++){const a=i*Math.PI*2/7;m.path([[.5,.13,.51],[.5+Math.cos(a)*.206,.47,.51+Math.sin(a)*.206],[.5,.88,.51]],.012,"stand");}
      }],
      ["ABYSS_STEPPED_RELIC","Relíquia da Câmara dos Degraus","7561a1","DEEPSTONE","Pedras menores empilhadas formam uma réplica dos degraus soterrados.",m=>{
        for(let i=0;i<4;i++)m.box(.50,.065+i*.125,.51,.86-i*.16,.13,.74-i*.132,i%2?"stand":"main");
        m.disk(.50,.52,.51,.14,.10,"trim");m.gem(.50,.67,.51,.089,.12,"violet");
      }],
      ["ABYSS_ECHO_RIBS","Arcos de Costelas do Abismo","ac92ae","STONE","O padrão em arco reaparece em paredes e fósseis próximos às cavernas.",m=>{
        m.box(.50,.075,.52,.77,.15,.79,"stand");
        for(let i=0;i<4;i++){const z=.24+i*.17;m.path([[.20,.14,z],[.22,.44,z],[.44,.73+i*.035,z],[.65,.58,z],[.78,.14,z]],.039,i%2?"bone":"main");}
      }]
    ],
    elemental:[
      ["CONFLUX_FIRE_VOLCANO","Miniatura da Caldeira de Fogo","e77f36","GLOWSTONE","O brilho no centro da miniatura imita a boca da caldeira ígnea.",m=>{
        m.vessel(.5,.50,[[0,.40],[.17,.37],[.42,.24],[.56,.17],[.58,.16],[.48,.10]],"night",10);
        m.vessel(.5,.50,[[.48,.125],[.56,.15],[.66,.11],[.84,.016]],"main",8);
        for(const x of [.30,.70])m.rod([x,.18,.31],[.5+(x-.5)*.4,.52,.36],.023);
      },7],
      ["CONFLUX_WATER_FLOW","Fonte da Água Suspensa","5bb6ea","GLASS","Três fios de água caem em uma bacia de pedra azulejada.",m=>{
        m.bowl(.5,.50,.04,.39,"stand","main");
        m.rod([.5,.10,.62],[.5,.71,.62],.045,"stone");m.bowl(.5,.59,.66,.19,"stone","water");
        for(const [x,z] of [[.34,.53],[.47,.42],[.63,.53]])m.rod([x,.69,z],[x,.25,z-.035],.026);
      }],
      ["CONFLUX_EARTH_GEODE","Geodo da Rocha Ressonante","ac76d8","AMETHYST","O corte geológico expõe pontas facetadas dentro de uma carapaça escura.",m=>{
        m.base(.30);m.disk(.5,.46,.56,.33,.29,"stone","z");m.disk(.5,.46,.405,.267,.042,"night","z");
        for(const [x,y,r] of [[.36,.38,.096],[.52,.51,.158],[.63,.34,.087]])m.gem(x,y,.369,r,r*1.15);
      }],
      ["CONFLUX_WIND_SPIRAL","Espiral dos Ventos do Pináculo","94d8cf","wind_essence","Anéis finos formam uma corrente de ar em torno do eixo em espiral.",m=>{
        m.disk(.50,.073,.50,.31,.146,"stand");
        m.path(Array.from({length:23},(_,i)=>[.5+Math.cos(i*.62)*(.30-i*.009),.11+i*.035,.5+Math.sin(i*.62)*(.30-i*.009)]),.024);
        m.gem(.50,.82,.50,.052,.087,"paper");
      }],
      ["CONFLUX_ARCANE_CUBES","Cubos Suspensos do Arcano","a06edb","AMETHYST","Os cubos menores mantêm o padrão dos selos em torno do prisma arcano.",m=>{
        m.base(.33);m.box(.50,.56,.50,.25,.25,.25);
        for(const [x,y,z] of [[.28,.42,.34],[.72,.67,.58],[.43,.79,.67],[.64,.35,.29]])m.box(x,y,z,.12,.12,.12,"violet");
        m.box(.5,.14,.50,.43,.07,.43,"trim");
      }],
      ["CONFLUX_ICE_FLAKE","Floco da Geada Perene","a2e5f4","ICE","Seis ramos de gelo formam uma estrela sustentada pelo pedestal.",m=>{
        m.base(.27);m.rod([.50,.12,.58],[.50,.55,.58],.04,"stone");
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3,dx=Math.cos(a),dy=Math.sin(a);
          m.rod([.5,.55,.46],[.5+dx*.34,.55+dy*.34,.46],.022);
          for(const s of [-1,1])m.rod([.5+dx*.20,.55+dy*.20,.46],[.5+dx*.27-s*dy*.094,.55+dy*.27+s*dx*.094,.46],.018,"ice");
        }
      }],
      ["CONFLUX_LIGHTNING_CONDUCTOR","Bobina do Raio Preso","efd66c","copper_ingot","Dois terminais enquadram um raio angular no topo de uma bobina.",m=>{
        m.base(.34);m.vessel(.5,.52,[[.11,.20],[.21,.16],[.44,.16],[.49,.20]],"gold");
        for(const y of [.23,.32,.41])m.ring(.5,y,.52,.18,"y","metal");
        m.panel([[.58,.92],[.36,.65],[.51,.65],[.42,.47],[.67,.74],[.54,.74]],.47,"main",.025);
      }],
      ["CONFLUX_NATURE_LEAF","Folha do Núcleo Vivo","8acf70","MOSS","A folha de pedra verde lembra os brotos próximos à Fissura da Natureza.",m=>{
        m.base(.25);m.path([[.47,.09,.54],[.51,.37,.54],[.54,.63,.52]],.037,"wood");
        m.panel([[.43,.34],[.24,.52],[.31,.75],[.71,.91],[.75,.61],[.63,.42]],.48,"main",.074);
        m.path([[.42,.39,.43],[.52,.57,.43],[.68,.84,.43]],.014,"leaf");
        m.rod([.53,.57,.43],[.35,.59,.43],.012,"leaf");m.rod([.58,.66,.43],[.67,.58,.43],.012,"leaf");
      }],
      ["CONFLUX_EIGHT_ALTAR","Estrado das Oito Essências","b585d1","elemental_core","Oito pedras de cores diferentes cercam a rosa gravada no piso.",m=>{
        m.disk(.5,.08,.5,.43,.16,"stand");m.disk(.5,.16,.5,.29,.08,"main");
        for(let i=0;i<8;i++){const a=i*Math.PI/4,x=.5+Math.cos(a)*.32,z=.5+Math.sin(a)*.32;m.gem(x,.25,z,.054,.074,["rust","water","wood","paper","violet","ice","sun","leaf"][i]);}
        m.ring(.5,.208,.5,.19,"y","trim");
      }],
      ["CONFLUX_EQUILIBRIUM_ARCH","Arco do Equilíbrio Elemental","9cb2df","elemental_core","Duas metades se encontram sob o cristal usado para representar a Convergência.",m=>{
        m.box(.50,.065,.52,.88,.13,.48,"stand");
        m.path([[.17,.11,.52],[.19,.41,.52],[.30,.70,.52],[.50,.87,.52]],.051,"water");
        m.path([[.83,.11,.52],[.81,.41,.52],[.70,.70,.52],[.50,.87,.52]],.051,"sun");
        m.gem(.50,.66,.52,.109,.149);m.ring(.50,.43,.52,.14,"z","trim");
      }]
    ]
  };

  // Additional collections use their own reserved ID/tile range in faction-building.js.
  Object.assign(collections,{
    brasa:[
      ["BRASA_BROKEN_CROWN","Coroa Partida de Návar","d58145","BRONZE_BLOCK","A coroa quebrada lembra a queda dos antigos reis.",m=>{m.base(.32);m.ring(.5,.30,.5,.28,"y","metal",1,12,.83,.045);for(let i=0;i<5;i++){const a=i*1.05;m.gem(.5+Math.cos(a)*.27,.46,.5+Math.sin(a)*.27,.09,.13,"main");}}],
      ["BRASA_CHAIN_ALTAR","Altar das Correntes Rompidas","83404b","IRON","Elos rompidos são depositados no altar dos exilados.",m=>{m.bench("night","main",.42);for(const [x,y,z] of [[.25,.55,.43],[.43,.56,.51],[.66,.56,.47]])m.ring(x,y,z,.13,"y","metal",.65,10,.78,.035);m.gem(.5,.67,.55,.07,.1,"rust");}],
      ["BRASA_REBEL_TORCH","Fanal da Insurreição","f99043","GLOWSTONE","O fanal aceso marca a primeira vigília dos rebeldes.",m=>{m.base(.25);m.rod([.5,.1,.5],[.5,.63,.5],.07,"metal");m.bowl(.5,.5,.59,.21,"night","main");for(const [x,y,z] of [[.44,.79,.5],[.58,.74,.53],[.5,.84,.44]])m.gem(x,y,z,.075,.13,"main");},8],
      ["BRASA_ASH_URN","Urna das Cinzas Juradas","a7553d","CERAMIC","A urna guarda as cinzas dos juramentos queimados.",m=>{m.vessel(.5,.5,[[0,.16],[.13,.25],[.38,.29],[.56,.19],[.64,.22]],"main",8);m.ring(.5,.55,.5,.20,"y","gold");m.gem(.5,.71,.5,.10,.08,"night");}],
      ["BRASA_REBEL_HAMMER","Martelo da Ruptura Exposto","ad5d47","IRON","O martelo simboliza a libertação das forjas.",m=>{m.base(.31);m.rod([.28,.15,.5],[.63,.73,.5],.045,"wood");m.box(.65,.75,.5,.36,.17,.23,"metal");m.box(.65,.84,.5,.19,.03,.18,"main");}],
      ["BRASA_EMBER_MAP","Mesa das Rotas de Fuga","9c533b","PLANK","Mapas de fuga eram desenhados nas mesas de campanha.",m=>{m.bench("wood","main",.36);m.box(.5,.44,.5,.75,.025,.51,"paper");m.path([[.24,.47,.35],[.41,.47,.61],[.62,.47,.43],[.76,.47,.58]],.022,"rust");m.gem(.76,.49,.58,.05,.05,"main");}],
      ["BRASA_FURNACE_IDOL","Ídolo da Fornalha Rebelde","cc6640","BASALT","O ídolo marca os pátios das antigas forjas libertadas.",m=>{m.base(.34);m.box(.5,.39,.55,.53,.54,.42,"night");m.panel([[.31,.24],[.69,.24],[.65,.56],[.5,.72],[.35,.56]],.315,"main",.07);m.gem(.5,.48,.27,.13,.20,"rust");}],
      ["BRASA_VOW_BELL","Sino do Motim","bb7955","BRONZE_BLOCK","Seu toque convocava os trabalhadores das forjas.",m=>{m.frame(.17,.83,.86,.5,"metal");m.vessel(.5,.5,[[.23,.28],[.36,.23],[.63,.16],[.74,.06]],"main",10);m.rod([.5,.25,.5],[.5,.14,.5],.035,"metal");}],
      ["BRASA_SCORIA_PILLAR","Marco da Escória Viva","783d37","OBSIDIAN","Pedras de escória marcam os locais de resistência.",m=>{m.base(.34);m.vessel(.5,.5,[[.12,.24],[.42,.21],[.77,.15],[.91,.04]],"night",5);m.path([[.39,.22,.36],[.58,.43,.34],[.44,.64,.38],[.5,.82,.42]],.039,"main");}],
      ["BRASA_REBEL_BANNER","Pendão das Chamas Livres","b94437","wool","O pendão rubro anuncia a união das forjas.",m=>{m.base(.23);m.rod([.25,.1,.54],[.25,.94,.54],.033,"metal");m.rod([.21,.87,.54],[.81,.87,.54],.027,"gold");m.panel([[.29,.84],[.8,.84],[.8,.37],[.62,.24],[.47,.42],[.29,.32]],.54,"main",.025);m.panel([[.47,.50],[.62,.71],[.72,.50]],.515,"sun",.015); }]
    ],
    farol:[
      ["FAROL_VOW_LANTERN","Lanterna dos Juramentos","efcc84","GLOWSTONE","A lanterna ilumina os votos dos peregrinos.",m=>{m.base(.28);for(const x of [.31,.69])for(const z of [.31,.69])m.rod([x,.12,z],[x,.76,z],.035,"gold");m.gem(.5,.46,.5,.15,.24,"sun");m.vessel(.5,.5,[[.76,.29],[.92,.04]],"main",8);},9],
      ["FAROL_VOW_LEDGER","Livro dos Votos","7693b5","PLANK","Os nomes dos acolhidos são registrados neste livro.",m=>{m.base(.25);m.box(.5,.32,.55,.22,.50,.25,"stand");m.box(.5,.61,.5,.72,.1,.53,"main");m.book(.5,.69,.5,"paper");}],
      ["FAROL_REFUGE_SHIELD","Escudo dos Refugiados","e7d2a1","IRON","O escudo representa a proteção dada aos viajantes.",m=>{m.base(.26);m.rod([.5,.12,.65],[.5,.69,.65],.045,"wood");m.panel([[.18,.73],[.82,.73],[.77,.42],[.5,.20],[.23,.42]],.43,"main",.11);m.box(.5,.5,.365,.08,.34,.025,"blue");m.box(.5,.53,.365,.39,.075,.025,"blue");}],
      ["FAROL_PILGRIM_FONT","Pia dos Peregrinos","a7c8d6","MARBLE","Água limpa é oferecida a quem chega à basílica.",m=>{m.vessel(.5,.5,[[0,.30],[.1,.34],[.4,.13],[.51,.27]],"stand");m.bowl(.5,.5,.50,.34,"main","water");}],
      ["FAROL_CHOIR_PIPES","Tubos do Coro da Vigília","c0ae86","BRONZE_BLOCK","Os tubos de bronze lembram o órgão da basílica.",m=>{m.box(.5,.11,.5,.86,.22,.45,"wood");for(let i=0;i<7;i++){const x=.20+i*.10,h=.37+(3-Math.abs(i-3))*.14;m.disk(x,.22+h/2,.51,.042,h,"main");m.box(x,.22+h*.35,.46,.056,.05,.025,"night");}}],
      ["FAROL_LAW_SCALES","Balança da Soleira","dfb968","gold_nugget","A balança recorda a igualdade perante os juramentos.",m=>{m.base(.28);m.rod([.5,.12,.5],[.5,.80,.5],.05,"gold");m.rod([.17,.73,.5],[.83,.73,.5],.025,"main");for(const x of [.21,.79]){m.rod([x,.72,.5],[x,.38,.5],.015,"gold");m.bowl(x,.5,.34,.15,"main","gold");}}],
      ["FAROL_VIGIL_SEAT","Banco dos Peregrinos","d8d2bd","MARBLE","Bancos acolhem quem espera a abertura do santuário.",m=>{m.bench("main","gold",.36);m.box(.5,.65,.76,.8,.43,.11,"main");for(const x of [.23,.77])m.box(x,.51,.51,.085,.10,.45,"blue");}],
      ["FAROL_STAR_RELIC","Relicário da Estrela do Norte","80afd0","CRYSTAL","Um cristal orienta os vigias nas noites nubladas.",m=>{m.base(.27);m.ring(.5,.56,.5,.31,"z","gold",1,12);for(let i=0;i<8;i++){const a=i*Math.PI/4;m.rod([.5,.56,.5],[.5+Math.cos(a)*.28,.56+Math.sin(a)*.28,.5],.023,"main");}m.gem(.5,.56,.5,.11,.14,"sun");},5],
      ["FAROL_TRAVEL_BELL","Campainha do Abrigo","d7bd83","BRONZE_BLOCK","Seu som anuncia a chegada de um peregrino.",m=>{m.frame(.24,.76,.83,.57,"stand");m.vessel(.5,.5,[[.29,.24],[.38,.2],[.65,.14],[.70,.05]],"main",12);m.gem(.5,.24,.5,.06,.10,"metal");}],
      ["FAROL_OATH_MOSAIC","Painel dos Caminhos Seguros","4f80ae","CERAMIC","O mosaico descreve as estradas mantidas pelo Concílio.",m=>{m.frame(.12,.88,.88,.60,"gold");m.box(.5,.49,.57,.68,.65,.07,"main");for(let i=0;i<5;i++){const x=.25+i*.12;m.path([[x,.22,.522],[.5,.46,.522],[x,.75,.522]],.014,"paper");}m.gem(.5,.46,.51,.085,.10,"sun");}]
    ],
    tambor:[
      ["TAMBOR_CLAN_DRUM","Tambor dos Clãs","b97b40","hide","O ritmo convoca os clãs para a assembleia.",m=>{m.vessel(.5,.5,[[0,.27],[.11,.31],[.54,.36],[.62,.31]],"wood");m.disk(.5,.63,.5,.32,.045,"main");for(let i=0;i<8;i++){const a=i*Math.PI/4,b=a+.35;m.rod([.5+Math.cos(a)*.30,.11,.5+Math.sin(a)*.30],[.5+Math.cos(b)*.34,.61,.5+Math.sin(b)*.34],.02,"bone");}}],
      ["TAMBOR_STONE_HORN","Trompa do Desfiladeiro","caa575","STONE","Trompas de pedra anunciam duelos no fortim.",m=>{m.base(.27);m.path([[.25,.25,.52],[.43,.33,.52],[.64,.48,.52],[.76,.72,.52]],.10,"main");m.ring(.76,.72,.52,.18,"x","gold");}],
      ["TAMBOR_CLAN_SHIELDS","Mural dos Escudos dos Clãs","8b6343","IRON","Escudos marcam a presença dos clãs aliados.",m=>{m.frame(.14,.86,.87,.66,"wood");for(const x of [.29,.71]){m.disk(x,.51,.52,.18,.09,"main","z");m.gem(x,.51,.45,.078,.08,"metal");}}],
      ["TAMBOR_DUEL_STONES","Pedras do Círculo de Duelo","786756","GNEISS","As pedras assinalam os limites do duelo ritual.",m=>{for(let i=0;i<8;i++){const a=i*Math.PI/4;m.gem(.5+Math.cos(a)*.34,.17,.5+Math.sin(a)*.34,.10,.17,i%2?"main":"stone");}m.disk(.5,.05,.5,.25,.08,"stand");}],
      ["TAMBOR_WAR_MAP","Mesa das Hostes","9e805b","PLANK","Peças de pedra registram os movimentos das hostes.",m=>{m.bench("wood","metal",.38);m.box(.5,.46,.5,.78,.06,.60,"main");for(const [x,z] of [[.27,.36],[.38,.56],[.67,.35],[.71,.63]])m.gem(x,.56,z,.062,.08,"bone");}],
      ["TAMBOR_RAM_IDOL","Ídolo do Aríete de Turog","907151","GNEISS","O ídolo representa a força do guardião do fortim.",m=>{m.base(.31);m.gem(.5,.48,.52,.22,.23,"main");for(const s of [-1,1])m.path([[.5+s*.13,.60,.5],[.5+s*.28,.72,.52],[.5+s*.32,.49,.38],[.5+s*.22,.40,.36]],.065,"bone");}],
      ["TAMBOR_TROPHY_SPEARS","Feixe de Lanças dos Vencedores","b88a54","IRON","Lanças de cerimônia celebram os campeões.",m=>{m.box(.5,.10,.5,.74,.20,.43,"wood");for(const x of [.24,.5,.76]){m.rod([x,.16,.60],[x,.79,.45],.029,"wood");m.gem(x,.84,.45,.075,.12,"metal");}}],
      ["TAMBOR_STONE_SEAT","Assento do Árbitro","8a7864","DEEPSTONE","O árbitro acompanha os duelos deste assento.",m=>{m.bench("stand","main",.38);m.box(.5,.66,.72,.65,.49,.16,"main");for(const x of [.18,.82])m.box(x,.52,.5,.12,.15,.47,"stone");}],
      ["TAMBOR_CLAN_MARKER","Marco dos Clãs Unidos","e0ae69","GNEISS","Os sinais dos clãs foram esculpidos no marco.",m=>{m.base(.34);m.vessel(.5,.5,[[.12,.23],[.72,.20],[.89,.06]],"main",4);for(const y of [.29,.48,.66])m.ring(.5,y,.5,.22,"y","gold",1,4,1,.027);}],
      ["TAMBOR_CAMP_BRAZIER","Braseiro das Hostes","eaa14c","GLOWSTONE","O braseiro aquece as vigílias do fortim.",m=>{for(const x of [.29,.71])for(const z of [.29,.71])m.rod([x,.03,z],[.5+(x-.5)*.7,.45,.5+(z-.5)*.7],.045,"metal");m.bowl(.5,.5,.41,.34,"stand","main");for(const x of [.35,.5,.65])m.gem(x,.67,.51,.09,.13,"sun");},7]
    ],
    marco:[
      ["MARCO_ROOT_ARCH","Arco das Raízes Juradas","74936a","CANOPY_ROOT","Raízes entrelaçadas simbolizam a passagem protegida.",m=>{m.base(.29);for(const s of [-1,1])m.path([[.5+s*.3,.09,.55],[.5+s*.29,.42,.55],[.5+s*.18,.72,.5],[.5,.89,.5]],.055,"wood");m.leaf(.36,.72,.48,-1);m.leaf(.65,.72,.48,1);}],
      ["MARCO_SEED_RELIQUARY","Relicário das Sementes","b9cc83","MOSS","O relicário guarda sementes recuperadas de bosques feridos.",m=>{m.base(.27);m.bowl(.5,.5,.15,.29,"wood","main");for(const [x,z] of [[.34,.4],[.61,.4],[.5,.62]])m.gem(x,.40,z,.09,.13,"leaf");m.ring(.5,.52,.5,.29,"y","gold");}],
      ["MARCO_SPRING_BOWL","Fonte da Nascente","85bcb4","CLAY","A fonte recorda o pacto de proteção das águas.",m=>{m.bowl(.5,.5,.04,.38,"stand","water");m.vessel(.5,.5,[[.1,.1],[.51,.07],[.59,.21]],"main");m.rod([.5,.59,.5],[.33,.22,.5],.022,"water");m.rod([.5,.59,.5],[.67,.22,.5],.022,"water");}],
      ["MARCO_ANTLER_STONE","Pedra dos Chifres de Iriom","a6c38c","FIELDSTONE","Chifres esculpidos vigiam a fronteira do bosque.",m=>{m.base(.34);m.gem(.5,.42,.55,.20,.29,"stone");for(const s of [-1,1]){m.path([[.5+s*.12,.50,.52],[.5+s*.23,.73,.5],[.5+s*.32,.89,.5]],.035,"main");m.rod([.5+s*.23,.73,.5],[.5+s*.34,.72,.42],.025,"main");}}],
      ["MARCO_HERB_DRYER","Secador das Ervas do Limiar","89ad64","stick","Ervas são secas antes das cerimônias de cura.",m=>{m.frame(.14,.86,.87,.55,"wood");for(let i=0;i<5;i++){const x=.22+i*.14;m.rod([x,.85,.54],[x,.45,.52],.015,"wood");m.leaf(x,.53,.52,i%2?1:-1,"main");m.leaf(x,.38,.53,i%2?-1:1,"leaf");}}],
      ["MARCO_MYCELIUM_LAMP","Lanterna do Micélio","c5db88","GLOWSTONE","Fungos luminosos guiam os guardiões na floresta.",m=>{m.base(.27);for(const [x,z,h] of [[.33,.38,.52],[.62,.55,.73],[.41,.67,.38]]){m.rod([x,.08,z],[x,h,z],.055,"wood");m.vessel(x,z,[[h,.17],[h+.12,.12],[h+.16,.03]],"main",8);}},7],
      ["MARCO_PACT_LECTERN","Atril do Pacto Vivo","9f9d65","PLANK","O pacto é lido diante dos marcos sagrados.",m=>{m.base(.26);m.rod([.5,.1,.5],[.5,.58,.5],.105,"wood");m.box(.5,.65,.5,.65,.11,.48,"main");m.book(.5,.73,.5,"paper");m.leaf(.77,.70,.5,1,"leaf");}],
      ["MARCO_NEST","Ninho dos Mensageiros","8a8150","LEAVES","Os guardiões deixam ninhos protegidos para pequenas aves.",m=>{for(let i=0;i<4;i++)m.ring(.5,.1+i*.065,.5,.24+i*.027,"y","wood",1,12,1,.046);for(const x of [.39,.60])m.gem(x,.31,.49,.08,.11,"paper");}],
      ["MARCO_BOUNDARY_STONE","Marco da Clareira Silenciosa","72916c","MOSS","A marca indica onde a intervenção deve terminar.",m=>{m.base(.33);m.panel([[.27,.12],[.73,.12],[.72,.62],[.50,.88],[.28,.62]],.53,"stone",.25);m.ring(.5,.55,.38,.17,"z","main",1,10,1,.035);m.leaf(.5,.50,.35,1,"leaf");}],
      ["MARCO_ROOT_BENCH","Banco da Clareira","8b9c64","CANOPY_PLANK","O banco permite observar a floresta sem perturbá-la.",m=>{m.bench("wood","main",.34);for(const x of [.20,.80]){m.path([[x,.04,.7],[x,.38,.7],[x,.69,.75]],.05,"wood");m.leaf(x,.72,.76,x>.5?1:-1,"leaf");}m.box(.5,.65,.74,.66,.11,.11,"main");}]
    ],
    vento:[
      ["VENTO_WIND_VANE","Biruta das Alturas","85b6d9","wool","A biruta mostra a direção das correntes celestes.",m=>{m.base(.27);m.rod([.5,.1,.5],[.5,.91,.5],.035,"metal");m.ring(.5,.81,.5,.13,"z","gold");m.vessel(.5,.5,[[.2,.07],[.65,.13]],"main",8);m.panel([[.50,.79],[.91,.70],[.91,.58],[.50,.65]],.5,"main",.025);}],
      ["VENTO_SKY_COMPASS","Rosa das Correntes","b7d5ea","BRONZE_BLOCK","A rosa orienta os vigias dos terraços.",m=>{m.base(.29);m.disk(.5,.48,.5,.31,.09,"main");for(let i=0;i<8;i++){const a=i*Math.PI/4;m.rod([.5,.54,.5],[.5+Math.cos(a)*.28,.54,.5+Math.sin(a)*.28],.021,i%2?"metal":"gold");}m.gem(.5,.59,.5,.09,.09,"sun");}],
      ["VENTO_FEATHER_HARP","Harpa das Brisas","c9d7e8","stick","As cordas vibram quando o vento muda.",m=>{m.base(.25);m.path([[.21,.11,.55],[.22,.65,.55],[.40,.88,.55],[.80,.60,.55],[.69,.12,.55]],.052,"wood");for(let i=0;i<6;i++){const x=.29+i*.075;m.rod([x,.14,.55],[x,.75-Math.abs(x-.4)*.4,.55],.011,"main");}}],
      ["VENTO_CLOUD_ORRERY","Orréria das Nuvens","85a9d0","CRYSTAL","Os aros representam correntes em alturas distintas.",m=>{m.base(.28);m.rod([.5,.1,.5],[.5,.59,.5],.04,"metal");m.ring(.5,.54,.5,.32,"y","main",.7);m.ring(.5,.54,.5,.25,"z","gold");m.gem(.5,.55,.5,.11,.11,"ice");m.gem(.77,.54,.5,.075,.08,"paper");}],
      ["VENTO_MESSENGER_PERCH","Poleiro dos Mensageiros","a2b4bd","PLANK","Mensageiros alados descansam no poleiro dos terraços.",m=>{m.base(.30);m.rod([.5,.1,.5],[.5,.78,.5],.06,"wood");m.rod([.15,.75,.5],[.85,.75,.5],.06,"main");m.bowl(.5,.5,.18,.19,"wood","water");}],
      ["VENTO_SKY_LAMP","Fanal do Céu Aberto","addaf5","GLOWSTONE","O fanal guia os viajantes nas noites de neblina.",m=>{m.base(.24);for(const x of [.25,.75])m.path([[x,.12,.5],[x,.61,.5],[.5,.88,.5]],.035,"metal");m.gem(.5,.50,.5,.18,.24,"main");m.ring(.5,.50,.5,.27,"y","gold");},8],
      ["VENTO_PRESSURE_GAUGE","Medidor de Pressão Celeste","97b4d1","IRON","Acólitos observam as variações da pressão do ar.",m=>{m.base(.25);m.rod([.5,.1,.57],[.5,.54,.57],.05,"metal");m.disk(.5,.59,.5,.28,.12,"main","z");m.disk(.5,.59,.42,.23,.035,"paper","z");m.rod([.5,.59,.39],[.64,.71,.39],.017,"rust");}],
      ["VENTO_CLOUD_VESSEL","Ânfora das Nuvens","d0dce3","CERAMIC","Vasos claros decoram as galerias dos vigias.",m=>{m.vessel(.5,.5,[[0,.16],[.12,.26],[.38,.29],[.63,.13],[.74,.18]],"main",12);m.ring(.5,.31,.5,.30,"y","blue");m.ring(.5,.49,.5,.24,"y","gold");}],
      ["VENTO_WING_RELIEF","Relevo das Asas de Vaélis","9ac9e6","MARBLE","Asas esculpidas lembram a liberdade dos céus.",m=>{m.base(.30);m.rod([.5,.1,.58],[.5,.66,.58],.045,"metal");for(const s of [-1,1])for(let i=0;i<4;i++){const x=.5+s*(.12+i*.07),y=.43+i*.085;m.panel([[.5,y-.13],[x,y+.14],[x+s*.08,y+.22],[x+s*.03,y-.05]],.46,"main",.04);}m.gem(.5,.61,.43,.075,.10,"sun");}],
      ["VENTO_WIND_CHIMES","Carrilhão dos Oito Ventos","b9d5ef","BRONZE_BLOCK","O carrilhão celebra os ventos de todos os quadrantes.",m=>{m.base(.24);m.rod([.5,.1,.5],[.5,.91,.5],.035,"metal");m.ring(.5,.83,.5,.30,"y","gold");for(let i=0;i<8;i++){const a=i*Math.PI/4,x=.5+Math.cos(a)*.27,z=.5+Math.sin(a)*.27,h=.19+(i%3)*.07;m.rod([x,.83,z],[x,.64,z],.012,"wood");m.disk(x,.64-h/2,z,.036,h,"main");}}]
    ],
    revoadas:[
      ["DRAGON_TIME_HOURGLASS","Ampulheta da Revoada do Tempo","d4ab65","BRONZE_BLOCK","Grãos dourados recordam os juramentos de cada era.",m=>{m.frame(.20,.80,.87,.5,"gold");m.vessel(.5,.5,[[.14,.22],[.33,.14],[.46,.025],[.60,.14],[.79,.22]],"main",10);m.gem(.5,.22,.5,.13,.08,"sun");}],
      ["DRAGON_TIME_RING","Anel das Eras Celestes","e0bf7c","OPAL_ORE","O anel representa o fluxo circular do tempo.",m=>{m.base(.31);m.rod([.5,.10,.5],[.5,.43,.5],.06,"metal");m.ring(.5,.57,.5,.31,"z","gold",1,16,1,.038);for(let i=0;i<8;i++){const a=i*Math.PI/4;m.gem(.5+Math.cos(a)*.31,.57+Math.sin(a)*.31,.5,.045,.05,"main");}}],
      ["DRAGON_DREAM_SEED","Semente do Sono Verde","8fbd76","EMERALD_ORE","As raízes protegem uma semente do Sonho.",m=>{m.base(.34);for(let i=0;i<5;i++){const a=i*1.257;m.path([[.5+Math.cos(a)*.30,.12,.5+Math.sin(a)*.30],[.5+Math.cos(a)*.19,.47,.5+Math.sin(a)*.19],[.5,.77,.5]],.04,"wood");}m.gem(.5,.48,.5,.16,.25,"main");}],
      ["DRAGON_DREAM_NEST","Ninho das Folhas Oníricas","70a581","LEAVES","Os ovos descansam em um ninho de raízes e folhas.",m=>{for(let i=0;i<4;i++)m.ring(.5,.1+i*.07,.5,.24+i*.035,"y","wood",1,12,1,.049);for(const [x,z] of [[.37,.42],[.62,.56]])m.gem(x,.35,z,.115,.17,"main");for(const s of [-1,1])m.leaf(.5+s*.31,.26,.5,s,"leaf");}],
      ["DRAGON_LIFE_EGG","Ovo Cerimonial da Vida","ed7957","RUBY_ORE","Ovos esculpidos celebram a proteção das crias.",m=>{m.bowl(.5,.5,.06,.34,"stand","gold");m.vessel(.5,.5,[[.21,.13],[.36,.24],[.57,.22],[.77,.12],[.85,.035]],"main",12);m.ring(.5,.40,.5,.24,"y","gold");}],
      ["DRAGON_LIFE_HEARTH","Taça Rubra da Vida","f59c68","GLOWSTONE","A taça aquece os recintos de incubação.",m=>{m.base(.30);m.vessel(.5,.5,[[.1,.15],[.40,.08],[.49,.30]],"main",10);m.bowl(.5,.5,.48,.32,"gold","rust");for(const x of [.36,.5,.64])m.gem(x,.69,.5,.08,.16,"sun");},8],
      ["DRAGON_MAGIC_PRISM","Prisma Orbital da Magia","8ab6f5","SAPPHIRE_ORE","Os arcos concentram a energia estudada pela revoada.",m=>{m.base(.29);m.gem(.5,.53,.5,.16,.33,"main");m.ring(.5,.53,.5,.32,"y","ice");m.ring(.5,.53,.5,.26,"z","blue");},6],
      ["DRAGON_MAGIC_RUNES","Painel das Runas Arcanas","a9a2e2","AMETHYST","O painel conserva diagramas dos primeiros Aspectos.",m=>{m.frame(.15,.85,.88,.60,"metal");m.box(.5,.49,.58,.62,.66,.08,"night");for(let i=0;i<3;i++){const x=.28+i*.22;m.ring(x,.57,.52,.09,"z","main",1,6,1,.025);m.rod([x,.47,.52],[x,.31,.52],.018,"ice");}}],
      ["DRAGON_CATACLYSM_MONOLITH","Monólito do Cataclismo","ab5942","OBSIDIAN","A fratura esculpida relembra os terremotos antigos.",m=>{m.base(.35);m.panel([[.24,.11],[.69,.11],[.82,.61],[.59,.91],[.36,.79]],.53,"night",.35);m.path([[.44,.18,.35],[.62,.39,.35],[.44,.61,.35],[.58,.83,.35]],.036,"main");}],
      ["DRAGON_CATACLYSM_CLAW","Garra da Rocha Partida","9e6a55","DEEPSTONE","Três garras de pedra celebram a força da terra.",m=>{m.base(.35);for(const [x,h] of [[.26,.61],[.5,.86],[.74,.67]]){m.path([[x,.11,.61],[x,h-.18,.58],[x,h,.37]],.085,"main");m.gem(x,h,.35,.07,.10,"bone");}}]
    ]
  });

  function build(draw,{tile,base,trim,sculpt},shared){
    const {add,box,shell,rod}=draw;
    const swatches={main:tile,stand:base,trim,...shared};
    const swatch=material=>swatches[material??"main"];
    const beam=(a,b,r,material,sides=6)=>rod(a,b,r,swatch(material),swatch(material),sides);
    function solid(x,y,z,w,h,d,material){
      box(swatch(material),x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);
    }
    function vessel(x,z,levels,material,sides=10){
      shell(levels.map(([y,rx,rz=rx])=>[x,y,z,rx,rz]),swatch(material),swatch(material),sides,Math.PI/sides);
    }
    function disk(x,y,z,r,h,material,axis="y"){
      const orient=axis==="x"?([a,b,c])=>[x+b,y-a,z+c]:
        axis==="z"?([a,b,c])=>[x+a,y-c,z+b]:([a,b,c])=>[x+a,y+b,z+c];
      shell([[0,-h/2,0,r,r],[0,h/2,0,r,r]],swatch(material),swatch(material),12,Math.PI/12,orient);
    }
    function path(points,r,material){
      for(let i=1;i<points.length;i++)beam(points[i-1],points[i],r,material);
    }
    function ring(x,y,z,r,axis,material,ratio=1,steps=12,arc=1,thickness=.018){
      const points=Array.from({length:steps+1},(_,i)=>{
        const a=i*Math.PI*2/steps*arc,c=r*Math.cos(a),s=r*Math.sin(a)*ratio;
        return axis==="y"?[x+c,y,z+s]:axis==="x"?[x,y+s,z+c]:[x+c,y+s,z];
      });
      path(points,thickness,material);
    }
    function panel(points,z,material,depth=.045){
      const surface=points.map(([x,y])=>[x,y,z-depth/2]);
      const back=surface.map(([x,y,z])=>[x,y,z+depth]);
      const mat=swatch(material);
      const area=points.reduce((sum,[x,y],i)=>{const [u,v]=points[(i+1)%points.length];return sum+x*v-y*u;},0);
      if(area>0){surface.reverse();back.reverse();}
      // Split the outline into triangles using ears so concave silhouettes keep their cut-outs.
      const order=surface.map((_,i)=>i);
      const turn=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
      while(order.length>2){
        const ear=order.findIndex((b,i)=>{
          const a=order.at(i-1),c=order[(i+1)%order.length],pa=surface[a],pb=surface[b],pc=surface[c];
          return turn(pa,pb,pc)<-1e-7&&!order.some(k=>k!==a&&k!==b&&k!==c&&
            turn(pa,pb,surface[k])<=1e-7&&turn(pb,pc,surface[k])<=1e-7&&turn(pc,pa,surface[k])<=1e-7);
        });
        if(ear<0)break;
        const a=order.at(ear-1),b=order[ear],c=order[(ear+1)%order.length];
        add([surface[a],surface[b],surface[c],surface[c]],mat);
        add([back[c],back[b],back[a],back[a]],mat);
        order.splice(ear,1);
      }
      for(let i=0;i<surface.length;i++){
        const j=(i+1)%surface.length;
        add([surface[i],back[i],back[j],surface[j]],mat);
      }
    }
    function gem(x,y,z,r,h,material){
      vessel(x,z,[[y-h,.014],[y-h*.24,r],[y+h*.37,r*.92],[y+h,.011]],material,6);
    }
    function bowl(x,z,y,r,material,contents){
      vessel(x,z,[[y,r*.55],[y+.09,r*.86],[y+.18,r],[y+.19,r*.94],[y+.136,r*.71]],material,12);
      disk(x,y+.14,z,r*.73,.018,contents);
    }
    function leaf(x,y,z,side,material){
      panel([[x,y],[x+side*.14,y+.012],[x+side*.19,y+.11],[x+side*.08,y+.135]],z,material??"main",.027);
    }
    function basePlate(r){
      solid(.50,.05,.50,r*2,.10,r*2,"stand");
      solid(.50,.105,.50,r*1.76,.043,r*1.76,"trim");
    }
    function frame(left,right,height,z,material){
      for(const x of [left,right]){solid(x,.045,z,.12,.09,.32,material);beam([x,.08,z],[x,height,z],.035,material);}
      beam([left,height-.02,z],[right,height-.02,z],.038,material);
    }
    function candle(x,y,z,h,material){
      vessel(x,z,[[y,.034],[y+h,.034]],material,8);
      beam([x,y+h,z],[x,y+h+.025,z],.008,"night");
      gem(x,y+h+.044,z,.024,.035,"sun");
    }
    function book(x,y,z,material){
      solid(x,y,z,.51,.041,.33,"night");
      solid(x-.118,y+.03,z,.217,.048,.30,material);solid(x+.118,y+.03,z,.217,.048,.30,material);
      for(const offset of [-.12,.12])for(const line of [-.07,0,.071])
        beam([x+offset-.072,y+.056,z+line],[x+offset+.072,y+.056,z+line],.005,"wood");
    }
    function bench(material,edge,height=.32){
      for(const x of [.20,.80])for(const z of [.35,.68])solid(x,height*.5,z,.105,height,.111,material);
      solid(.50,height,.51,.78,.11,.54,edge);
    }
    function barrel(x,z,r,h){
      vessel(x,z,[[0,r*.82],[h*.17,r*.95],[h*.5,r],[h*.83,r*.94],[h,r*.83]],"main",10);
      for(const y of [h*.17,h*.83])ring(x,y,z,r*.96,"y","metal",1,10);
    }
    sculpt({box:solid,rod:beam,vessel,disk,path,ring,panel,gem,bowl,leaf,base:basePlate,frame,candle,book,bench,barrel});
  }

  return {collections,build};
})();
