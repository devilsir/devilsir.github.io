(function(){
  'use strict';
  const C=window.Cargas;
  const W=C.CONSTANTS.WIDTH,H=C.CONSTANTS.HEIGHT;
  C.data={};

  C.data.materials=[
    {name:'Vidro',rank:0,type:'isolante',polarizability:.28,description:'Tende a perder elétrons quando atritado com materiais abaixo na série.'},
    {name:'Pele',rank:1,type:'isolante',polarizability:.34,description:'Material orgânico próximo ao lado positivo da série triboelétrica.'},
    {name:'Seda',rank:2,type:'isolante',polarizability:.31,description:'Pode receber elétrons do vidro e perder para materiais mais negativos.'},
    {name:'Madeira',rank:3,type:'isolante',polarizability:.42,description:'Resposta moderada à polarização e à eletrização por atrito.'},
    {name:'Lã',rank:4,type:'isolante',polarizability:.48,description:'Frequentemente perde elétrons para plásticos como âmbar e Teflon.'},
    {name:'Âmbar',rank:5,type:'isolante',polarizability:.54,description:'Clássico material de demonstrações de eletrização por atrito.'},
    {name:'Poliestireno',rank:6,type:'isolante',polarizability:.58,description:'Tende a ganhar elétrons e ficar negativamente carregado.'},
    {name:'Teflon',rank:7,type:'isolante',polarizability:.62,description:'Forte tendência a ganhar elétrons na série triboelétrica.'},
    {name:'Alumínio',rank:4,type:'condutor',polarizability:.92,description:'Condutor: as cargas se redistribuem com facilidade pela superfície.'},
    {name:'Cobre',rank:4,type:'condutor',polarizability:1,description:'Excelente condutor, com alta redistribuição de cargas livres.'}
  ];

  C.data.glossary=[
    ['Carga elétrica','Propriedade da matéria associada ao excesso ou à falta de elétrons.'],
    ['Atração','Força que aproxima cargas de sinais opostos.'],
    ['Repulsão','Força que afasta cargas de mesmo sinal.'],
    ['Campo elétrico','Região em que uma carga sofreria força elétrica.'],
    ['Força elétrica','Interação entre cargas, dependente dos sinais, intensidades e distância.'],
    ['Lei de Coulomb','Modelo em que a força cresce com as cargas e diminui com o quadrado da distância.'],
    ['Força resultante','Soma vetorial de todas as forças que atuam sobre um corpo.'],
    ['Polarização','Separação interna de cargas em um corpo inicialmente neutro.'],
    ['Indução eletrostática','Redistribuição de cargas causada pela presença de uma carga próxima, sem contato direto.'],
    ['Dipolo','Par de regiões de sinais opostos separadas por uma pequena distância.'],
    ['Série triboelétrica','Ordenação de materiais pela tendência de perder ou ganhar elétrons por atrito.'],
    ['Transferência de elétrons','Movimento de elétrons de um material para outro durante o contato ou atrito.'],
    ['Material neutro','Corpo com quantidades totais equilibradas de cargas positivas e negativas.'],
    ['Condutor','Material em que cargas elétricas podem se mover com facilidade.'],
    ['Isolante','Material em que cargas permanecem mais localizadas.']
  ];

  const charge=(x,y,q,extra={})=>({type:'charge',x,y,q,intensity:Math.abs(q),fixed:extra.fixed??true,mass:extra.mass??2,...extra});
  const neutral=(x,y,material='Vidro',extra={})=>({type:extra.type||'neutral',x,y,r:extra.r||24,material,polarizability:extra.polarizability,staticCharge:extra.staticCharge||0,fixed:extra.fixed??true,...extra});
  const obstacle=(x,y,w,h,extra={})=>({type:'obstacle',x,y,w,h,solid:true,...extra});
  const scene=(test,target,objects=[],extra={})=>({test:{x:test[0],y:test[1],q:test[2]??1,vx:0,vy:0},target:{x:target[0],y:target[1],r:target[2]||25},objects,...extra});

  C.data.presets=[
    {id:'equal',title:'Cargas iguais se repelem',objective:'Observe uma carga-teste positiva sendo repelida por outra positiva.',instructions:'Inicie a simulação e altere a distância entre as cargas.',explanation:'Cargas de mesmo sinal produzem uma força de repulsão.',scene:scene([220,270,1],[790,270],[charge(420,270,2)])},
    {id:'opposite',title:'Cargas opostas se atraem',objective:'Veja a carga-teste positiva acelerar em direção a uma carga negativa.',instructions:'Compare a direção da seta resultante com o movimento.',explanation:'Sinais opostos produzem atração.',scene:scene([180,270,1],[735,270],[charge(550,270,-2)])},
    {id:'distance',title:'Efeito da distância',objective:'Compare forças para a mesma carga em duas distâncias.',instructions:'Arraste a carga azul e acompanhe o valor da força.',explanation:'A força cai rapidamente com o aumento da distância.',scene:scene([180,270,1],[790,270],[charge(360,270,-1.5,{name:'Perto'}),charge(720,120,-1.5,{name:'Longe'})])},
    {id:'intensity',title:'Efeito da intensidade',objective:'Compare cargas de intensidades diferentes.',instructions:'Ative forças individuais e compare o tamanho dos vetores.',explanation:'Para a mesma distância, cargas mais intensas geram forças maiores.',scene:scene([450,270,1],[790,270],[charge(230,270,-.8,{name:'Fraca'}),charge(670,270,-3,{name:'Forte'})])},
    {id:'twoforces',title:'Superposição de duas forças',objective:'Some duas forças perpendiculares.',instructions:'Ative componentes X/Y para visualizar a soma vetorial.',explanation:'A força resultante é a soma vetorial das contribuições individuais.',scene:scene([450,270,1],[735,95],[charge(230,270,1.7),charge(450,470,-1.7)])},
    {id:'equilibrium',title:'Equilíbrio com três forças',objective:'Encontre uma configuração de força resultante próxima de zero.',instructions:'Arraste as três cargas até equilibrar q.',explanation:'Em equilíbrio, os vetores se cancelam aproximadamente.',scene:scene([450,270,1],[800,80],[charge(260,160,1.4,{fixed:false}),charge(640,160,1.4,{fixed:false}),charge(450,460,-1.4,{fixed:false})])},
    {id:'polarization',title:'Polarização de um corpo neutro',objective:'Veja regiões positivas e negativas surgirem em um material neutro.',instructions:'Aproxime a carga positiva do corpo polarizável.',explanation:'O campo externo separa ligeiramente as cargas internas.',scene:scene([150,430,1],[790,430],[charge(250,200,2,{fixed:false}),neutral(530,250,'Madeira',{fixed:true})])},
    {id:'induction',title:'Eletrização por indução',objective:'Use uma carga próxima para redistribuir cargas sem contato.',instructions:'Mova a carga azul ao redor do condutor.',explanation:'No condutor, cargas livres se redistribuem em resposta ao campo externo.',scene:scene([130,430,1],[800,430],[charge(270,240,-2.5,{fixed:false}),neutral(560,240,'Alumínio',{type:'conductor',fixed:true,r:42})])},
    {id:'friction',title:'Eletrização por atrito',objective:'Encoste e mova vidro e Teflon para transferir elétrons.',instructions:'Arraste os materiais um contra o outro por alguns segundos.',explanation:'O vidro tende a perder elétrons e o Teflon a ganhar.',scene:scene([130,430,1],[790,430],[neutral(370,250,'Vidro',{fixed:false}),neutral(530,250,'Teflon',{fixed:false})],{friction:true})},
    {id:'tribo',title:'Comparação triboelétrica',objective:'Compare dois pares de materiais e a taxa de transferência.',instructions:'Encoste vidro/Teflon e lã/âmbar.',explanation:'Quanto maior a separação na série, mais clara tende a ser a transferência no modelo.',scene:scene([120,460,1],[810,460],[neutral(220,180,'Vidro',{fixed:false}),neutral(350,180,'Teflon',{fixed:false}),neutral(550,340,'Lã',{fixed:false}),neutral(680,340,'Âmbar',{fixed:false})],{friction:true})},
    {id:'dipole',title:'Interação entre dipolos',objective:'Observe dois corpos polarizados interagindo.',instructions:'Ative as linhas de campo e mova a carga externa.',explanation:'Dipolos induzidos podem se alinhar e interagir entre si.',scene:scene([120,460,1],[800,460],[charge(180,220,3,{fixed:false}),neutral(450,210,'Madeira',{fixed:false}),neutral(650,330,'Poliestireno',{fixed:false})])},
    {id:'shield',title:'Blindagem eletrostática',objective:'Compare o campo dentro e fora de uma região condutora.',instructions:'Ative o mapa de potencial e as setas de campo.',explanation:'Uma blindagem condutora ideal reduz o campo em seu interior; aqui usamos uma aproximação didática.',scene:scene([450,270,1],[800,450],[charge(160,270,3),obstacle(360,170,180,200,{conductive:true,hollow:true})])}
  ];

  const chapterDefs=[
    ['Atração e Repulsão','Sinais e direção da força','✦'],
    ['Distância e Intensidade','Como a força muda','↔'],
    ['Superposição Vetorial','Somando forças','↗'],
    ['Indução e Polarização','Neutros sob influência','◐'],
    ['Eletrização por Atrito','Transferência de elétrons','⚡'],
    ['Domínio Eletrostático','Tudo ao mesmo tempo','◆']
  ];
  C.data.chapters=chapterDefs.map((d,i)=>({id:i+1,title:d[0],subtitle:d[1],icon:d[2]}));
  const L=(chapter,index,title,objective,config)=>({id:(chapter-1)*5+index,chapter,index,title,objective,...config});
  C.data.levels=[
    L(1,1,'Primeiro impulso','Leve q até o alvo usando uma única carga positiva.',{maxCharges:1,allowed:'positive',scene:scene([150,270,1],[760,270],[]),hints:['Cargas iguais se repelem.','Coloque a carga atrás de q, no lado esquerdo.','A região útil fica próxima à borda esquerda, alinhada ao alvo.'],explanation:'Uma carga positiva atrás de q produz repulsão para a direita.'}),
    L(1,2,'Puxão azul','Use apenas uma carga negativa para atrair q.',{maxCharges:1,allowed:'negative',scene:scene([150,420,1],[760,120],[]),hints:['Sinais opostos se atraem.','Coloque a carga além do alvo.','Experimente o quadrante superior direito.'],explanation:'A carga negativa cria uma força diagonal em direção ao alvo.'}),
    L(1,3,'Curva simples','Faça q contornar a barreira central.',{maxCharges:2,allowed:'both',scene:scene([120,270,1],[780,270],[obstacle(400,175,90,190)]),hints:['Uma força pode iniciar a curva e outra corrigir a direção.','Use uma carga acima ou abaixo da barreira.','A primeira carga funciona bem antes da barreira; a segunda, depois.'],explanation:'Forças em momentos diferentes alteram a trajetória sem controle direto.'}),
    L(1,4,'Sinais limitados','Chegue ao alvo usando somente cargas positivas.',{maxCharges:2,allowed:'positive',scene:scene([145,110,1],[765,420],[obstacle(390,0,80,310)]),hints:['A repulsão empurra q para longe das cargas.','Use uma carga para empurrar para baixo e outra para a direita.','Posicione uma carga acima de q e outra à esquerda da saída.'],explanation:'Duas repulsões em regiões diferentes formam uma rota em L.'}),
    L(1,5,'Portão elétrico','Atravesse o vão sem tocar nas paredes.',{maxCharges:2,allowed:'both',scene:scene([120,270,1],[790,270],[obstacle(380,0,80,210),obstacle(380,330,80,210)]),moveLimit:5,hints:['O corredor central já aponta para o alvo.','Evite forças verticais intensas.','Alinhe uma carga atrás de q e ajuste uma segunda perto do alvo.'],explanation:'Um campo predominantemente horizontal mantém q dentro do corredor.'}),

    L(2,1,'Mais perto, mais forte','Use uma carga fraca colocada perto de q.',{maxCharges:1,allowed:'negative',chargeIntensity:.8,scene:scene([170,270,1],[760,270],[]),hints:['A distância pode compensar uma carga de menor intensidade.','Coloque a carga negativa perto do alvo, mas não exatamente sobre ele.','Teste entre x=650 e x=720.'],explanation:'A força aumenta muito quando a distância diminui.'}),
    L(2,2,'Potência controlada','Use uma carga intensa sem fazer q atravessar o alvo rápido demais.',{maxCharges:1,allowed:'negative',chargeIntensity:3.5,scene:scene([160,270,1],[720,270],[]),maxTargetSpeed:75,hints:['Força excessiva gera velocidade excessiva.','Aumente a distância da carga ao alvo.','Coloque a carga além do alvo, próxima à borda direita.'],explanation:'A posição da carga controla a intensidade efetiva ao longo do trajeto.'}),
    L(2,3,'Dois alcances','Combine uma carga próxima e outra distante.',{maxCharges:2,allowed:'both',scene:scene([150,430,1],[760,120],[obstacle(390,210,95,110)]),hints:['A carga próxima corrige a direção; a distante sustenta o movimento.','Use atração perto do destino e repulsão perto da origem.','Uma positiva abaixo de q e uma negativa acima do alvo funcionam bem.'],explanation:'Contribuições com diferentes distâncias dominam em diferentes partes da trajetória.'}),
    L(2,4,'Zona delicada','Pare q dentro de um alvo pequeno.',{maxCharges:2,allowed:'both',scene:scene([130,270,1],[770,270,18],[]),maxTargetSpeed:48,hints:['Você precisa acelerar e depois frear.','Use sinais opostos em lados diferentes.','Uma positiva à esquerda impulsiona; outra positiva à direita pode desacelerar por repulsão.'],explanation:'Forças opostas podem controlar aceleração e frenagem.'}),
    L(2,5,'Órbita quebrada','Escape da região central e alcance o canto.',{maxCharges:3,allowed:'both',scene:scene([450,270,1],[790,90],[charge(450,410,-1.2,{fixed:true})]),hints:['A carga fixa curva a trajetória para baixo.','Compense com uma força para cima e direita.','Posicione uma positiva abaixo/esquerda e uma negativa além do alvo.'],explanation:'O campo total muda ao longo da trajetória; planeje a curva completa.'}),

    L(3,1,'Diagonal perfeita','Produza uma resultante para cima e direita.',{maxCharges:2,allowed:'both',scene:scene([210,390,1],[710,120],[]),hints:['Duas forças perpendiculares podem formar uma diagonal.','Uma empurra para a direita; outra puxa para cima.','Use positiva à esquerda e negativa acima.'],explanation:'Componentes horizontal e vertical se somam vetorialmente.'}),
    L(3,2,'Canal em S','Guie q por dois corredores deslocados.',{maxCharges:3,allowed:'both',scene:scene([110,430,1],[790,100],[obstacle(280,0,85,300),obstacle(545,240,85,300)]),hints:['Divida a rota em três trechos.','Cada carga pode dominar um trecho.','Comece empurrando para cima, depois para a direita e finalize para cima.'],explanation:'A resultante precisa mudar de direção conforme q avança.'}),
    L(3,3,'Quase equilíbrio','Mantenha q na zona central por 1,5 s.',{maxCharges:3,allowed:'both',scene:scene([450,270,1],[450,270,30],[]),dwell:1.5,maxTargetSpeed:25,hints:['Procure vetores que se cancelem.','Distribua cargas ao redor do centro.','Três cargas em um triângulo com intensidades semelhantes aproximam o equilíbrio.'],explanation:'Em equilíbrio estável, a soma vetorial se mantém próxima de zero.'}),
    L(3,4,'Componente proibida','Alcance o alvo sem tocar nas faixas superior e inferior.',{maxCharges:2,allowed:'both',scene:scene([110,270,1],[790,270],[obstacle(0,0,900,105),obstacle(0,435,900,105)]),hints:['Minimize a componente vertical.','Coloque cargas alinhadas horizontalmente.','Uma positiva atrás e uma negativa à frente criam resultante horizontal.'],explanation:'Alinhamento reduz componentes indesejadas.'}),
    L(3,5,'Três vetores','Atravesse o triângulo de obstáculos.',{maxCharges:3,allowed:'both',scene:scene([100,440,1],[800,90],[obstacle(355,210,85,85),obstacle(510,95,75,100),obstacle(570,340,90,100)]),hints:['Observe os espaços livres entre obstáculos.','Use uma rota em diagonal, depois uma correção horizontal.','Distribua as cargas fora do caminho, não dentro dele.'],explanation:'Somar vetores é também controlar onde cada força deve atuar mais.'}),

    L(4,1,'Neutro que atrai','Use um corpo polarizável para curvar q.',{maxCharges:1,allowed:'positive',scene:scene([120,400,1],[790,150],[neutral(480,270,'Madeira',{fixed:true,r:35})]),hints:['Um neutro polarizado pode atrair.','A carga adicionada ativa o dipolo.','Coloque a carga perto do neutro, do lado oposto ao caminho desejado.'],explanation:'A polarização cria uma atração líquida porque a região oposta fica mais próxima.'}),
    L(4,2,'Ponte de dipolos','Passe entre dois materiais polarizáveis.',{maxCharges:2,allowed:'both',scene:scene([110,270,1],[790,270],[neutral(380,170,'Seda',{fixed:true,r:32}),neutral(520,370,'Poliestireno',{fixed:true,r:32})]),hints:['Os dipolos alteram o campo local.','Evite ativar os dois com intensidade máxima ao mesmo tempo.','Use uma carga moderada atrás de q e outra longe do alvo.'],explanation:'A indução pode auxiliar ou desviar, dependendo da geometria.'}),
    L(4,3,'Condutor central','Contorne o grande condutor sem colisão.',{maxCharges:2,allowed:'both',scene:scene([110,430,1],[790,110],[neutral(450,270,'Alumínio',{type:'conductor',fixed:true,r:70})]),hints:['O condutor responde fortemente ao campo.','Planeje uma rota pela borda superior ou inferior.','Uma carga acima do condutor pode puxar q pela rota superior.'],explanation:'Condutores apresentam polarização intensa e redistribuição rápida no modelo.'}),
    L(4,4,'Sinais induzidos','Use apenas cargas negativas e dois neutros.',{maxCharges:2,allowed:'negative',scene:scene([120,420,1],[780,120],[neutral(350,340,'Madeira',{fixed:true,r:34}),neutral(580,190,'Teflon',{fixed:true,r:34})]),hints:['Uma carga negativa atrai q positiva, mas também polariza os neutros.','Coloque as cargas além dos neutros para aproveitar a atração.','Use uma no centro-direita e outra acima do alvo.'],explanation:'O campo aplicado e os dipolos induzidos se somam.'}),
    L(4,5,'Blindagem parcial','Leve q para dentro da região protegida.',{maxCharges:3,allowed:'both',scene:scene([110,270,1],[675,270],[obstacle(540,120,270,35,{conductive:true}),obstacle(540,385,270,35,{conductive:true}),obstacle(775,120,35,300,{conductive:true})]),hints:['A abertura está à esquerda.','Evite chegar rápido demais à cavidade.','Use atração distante e uma carga de frenagem perto da entrada.'],explanation:'A geometria condutora altera a região acessível e aproxima a ideia de blindagem.'}),

    L(5,1,'Vidro e Teflon','Carregue os materiais por atrito antes de mover q.',{maxCharges:0,allowed:'none',scene:scene([110,270,1],[790,270],[neutral(300,220,'Vidro',{fixed:false}),neutral(420,220,'Teflon',{fixed:false})],{friction:true}),hints:['Materiais bem separados na série transferem elétrons.','Encoste e esfregue vidro e Teflon.','Depois posicione o Teflon negativo à frente de q.'],explanation:'O atrito cria as cargas necessárias sem adicionar cargas externas.'}),
    L(5,2,'Par correto','Escolha entre quatro materiais e forme uma carga negativa útil.',{maxCharges:0,allowed:'none',scene:scene([100,420,1],[790,120],[neutral(250,150,'Pele',{fixed:false}),neutral(390,150,'Seda',{fixed:false}),neutral(540,350,'Lã',{fixed:false}),neutral(680,350,'Poliestireno',{fixed:false})],{friction:true}),hints:['Procure o par com maior diferença na série.','Poliestireno tende a ganhar elétrons da lã.','Atrite lã e poliestireno; use o poliestireno perto do alvo.'],explanation:'A posição relativa na série prevê quem ganha elétrons.'}),
    L(5,3,'Carga sob medida','Produza carga sem saturar o material.',{maxCharges:0,allowed:'none',scene:scene([110,270,1],[760,270,20],[neutral(350,210,'Vidro',{fixed:false}),neutral(500,210,'Âmbar',{fixed:false})],{friction:true}),maxTargetSpeed:55,hints:['Atrito por mais tempo transfere mais carga.','Pare o contato antes da saturação.','Use contatos curtos e observe a carga estática no inspetor.'],explanation:'A transferência depende do tempo de contato, não do número de quadros.'}),
    L(5,4,'Duas etapas','Crie uma carga para lançar e outra para frear.',{maxCharges:0,allowed:'none',scene:scene([100,430,1],[790,120],[neutral(230,200,'Vidro',{fixed:false}),neutral(350,200,'Teflon',{fixed:false}),neutral(570,350,'Pele',{fixed:false}),neutral(690,350,'Poliestireno',{fixed:false})],{friction:true}),hints:['Você precisa de dois corpos com sinais úteis.','Forme dois pares e posicione os materiais carregados em lados diferentes.','Use um positivo atrás de q e um negativo além do alvo.'],explanation:'A eletrização por atrito pode substituir cargas externas em uma estratégia completa.'}),
    L(5,5,'Labirinto triboelétrico','Carregue, posicione e atravesse o corredor.',{maxCharges:0,allowed:'none',scene:scene([100,270,1],[800,270],[neutral(220,100,'Vidro',{fixed:false}),neutral(320,100,'Teflon',{fixed:false}),obstacle(380,0,70,220),obstacle(380,320,70,220),obstacle(610,150,70,390)],{friction:true}),hints:['Primeiro produza a carga; depois monte o campo.','Um Teflon negativo pode atrair q pelo primeiro vão.','Reposicione o corpo carregado conforme q avança.'],explanation:'O nível combina preparação material e controle de trajetória.'}),

    L(6,1,'Síntese','Combine atração, repulsão e um dipolo.',{maxCharges:2,allowed:'both',scene:scene([100,430,1],[800,100],[neutral(450,270,'Alumínio',{type:'conductor',fixed:true,r:48}),obstacle(260,0,60,300),obstacle(610,240,60,300)]),hints:['Planeje uma rota em S.','Use o condutor como parte da curva, não como obstáculo isolado.','Uma positiva abaixo à esquerda e uma negativa acima à direita podem funcionar.'],explanation:'A solução depende da superposição com o campo induzido.'}),
    L(6,2,'Elementos móveis','Desvie de dois obstáculos móveis.',{maxCharges:3,allowed:'both',scene:scene([100,270,1],[800,270],[obstacle(370,90,65,150,{moving:{axis:'y',range:170,speed:55}}),obstacle(570,300,65,150,{moving:{axis:'y',range:170,speed:70}})]),timeLimit:35,hints:['Observe o ritmo antes de iniciar.','Use cargas para controlar a velocidade de q.','Acelere no primeiro vão e freie antes do segundo.'],explanation:'Tempo e campo elétrico precisam ser coordenados.'}),
    L(6,3,'Recursos mínimos','Complete usando no máximo duas movimentações após colocar as cargas.',{maxCharges:3,allowed:'both',scene:scene([110,440,1],[790,100],[obstacle(300,170,80,370),neutral(560,240,'Madeira',{fixed:true,r:42})]),moveLimit:5,hints:['A colocação inicial precisa resolver quase toda a rota.','Combine repulsão inicial com atração final.','Coloque uma positiva abaixo/esquerda e uma negativa acima/direita.'],explanation:'Uma configuração bem planejada reduz correções durante o movimento.'}),
    L(6,4,'Sem dicas','Alcance o alvo com três estrelas e sem usar dicas.',{maxCharges:3,allowed:'both',scene:scene([100,270,1],[800,270],[obstacle(260,0,70,210),obstacle(260,330,70,210),neutral(500,270,'Alumínio',{type:'conductor',fixed:true,r:48}),obstacle(680,0,70,210),obstacle(680,330,70,210)]),timeLimit:45,hints:['Observe a simetria do cenário.','Uma força horizontal estável é essencial.','Use cargas alinhadas fora dos corredores.'],explanation:'O domínio aparece quando você reconhece padrões sem revelar a solução.'}),
    L(6,5,'Mestre das cargas','Use todos os conceitos e alcance o alvo final.',{maxCharges:3,allowed:'both',scene:scene([90,450,1],[815,85,18],[neutral(310,350,'Teflon',{fixed:false}),neutral(430,350,'Vidro',{fixed:false}),neutral(565,180,'Alumínio',{type:'conductor',fixed:true,r:42}),obstacle(230,0,60,250),obstacle(690,275,60,265)],{friction:true}),timeLimit:60,maxTargetSpeed:52,dwell:1.1,hints:['Prepare materiais antes de iniciar a corrida.','Use atrito para criar uma carga extra além do limite de cargas adicionadas.','Combine uma positiva de lançamento, uma negativa final e um material carregado para correção.'],explanation:'O desafio final integra atrito, indução, limites, obstáculos e controle de velocidade.'})
  ];

  C.data.minigames=[
    {id:'field',title:'Field Line Builder',icon:'⌁',description:'Reproduza um padrão de campo elétrico posicionando cargas limitadas.',concept:'Campo elétrico',bestLabel:'Precisão'},
    {id:'maze',title:'Labirinto Eletrostático',icon:'◇',description:'Guie q por portões sem controlá-la diretamente.',concept:'Trajetória',bestLabel:'Pontuação'},
    {id:'tribo',title:'Laboratório Triboelétrico',icon:'⚡',description:'Escolha materiais e produza o sinal solicitado por atrito.',concept:'Atrito',bestLabel:'Combo'},
    {id:'vector',title:'Vector Rush',icon:'↗',description:'Identifique rapidamente a direção da força resultante.',concept:'Vetores',bestLabel:'Pontuação'},
    {id:'coulomb',title:'Coulomb Target',icon:'◎',description:'Ajuste cargas para lançar q em alvos de precisão.',concept:'Lei de Coulomb',bestLabel:'Pontuação'}
  ];

  const q=(difficulty,topic,prompt,answers,correct,explanation,type='choice',visual=null)=>({difficulty,topic,prompt,answers,correct,explanation,type,visual});
  C.data.quiz=[
    q('basic','Sinais','Duas cargas positivas próximas uma da outra tendem a…',['atrair','repelir','ficar neutras','sumir'],1,'Cargas de mesmo sinal se repelem.'),
    q('basic','Sinais','Uma carga positiva e uma negativa tendem a…',['repelir','atrair','não interagir','trocar de massa'],1,'Sinais opostos produzem atração.'),
    q('basic','Campo elétrico','O campo elétrico indica…',['a cor da carga','a direção da força sobre uma carga-teste positiva','a temperatura','a massa do corpo'],1,'Por convenção, o campo aponta na direção da força sobre uma carga-teste positiva.'),
    q('basic','Materiais','Um corpo neutro possui…',['somente prótons','somente elétrons','carga total equilibrada','campo sempre nulo'],2,'Neutralidade significa equilíbrio da carga total, não ausência de partículas carregadas.'),
    q('basic','Atrito','Na eletrização por atrito, o que normalmente é transferido?',['prótons','elétrons','nêutrons','massa'],1,'Em materiais comuns, elétrons são as partículas móveis transferidas.'),
    q('basic','Sinais','Verdadeiro ou falso: cargas negativas sempre se atraem.',['Verdadeiro','Falso'],1,'Duas cargas negativas têm o mesmo sinal e se repelem.','truefalse'),
    q('basic','Distância','Ao aproximar duas cargas, a força elétrica geralmente…',['aumenta','diminui','não muda','vira gravidade'],0,'A força de Coulomb aumenta quando a distância diminui.'),
    q('basic','Condutores','Em um condutor, cargas elétricas…',['podem se redistribuir','ficam totalmente imóveis','deixam de existir','viram luz'],0,'Condutores permitem mobilidade maior das cargas.'),

    q('intermediate','Distância','Se a distância entre duas cargas dobra, a força ideal de Coulomb fica aproximadamente…',['duas vezes maior','metade','um quarto','igual'],2,'A força varia com 1/r²; dobrar r reduz a força para 1/4.'),
    q('intermediate','Intensidade','Dobrar apenas uma das cargas faz a força…',['dobrar','quadruplicar','cair pela metade','não mudar'],0,'A força é proporcional ao produto das cargas.'),
    q('intermediate','Polarização','Um corpo neutro próximo de uma carga pode ser atraído porque…',['ganha massa','suas cargas internas se separam ligeiramente','vira positivo por completo','perde todos os elétrons'],1,'A região de sinal oposto fica mais próxima, produzindo atração líquida.'),
    q('intermediate','Indução','Na indução eletrostática, é necessário contato direto?',['sempre','nunca há campo','não necessariamente','somente com água'],2,'A redistribuição pode ocorrer pela presença do campo, sem contato.'),
    q('intermediate','Vetores','Duas forças iguais, uma para a direita e outra para cima, geram resultante…',['para baixo','diagonal para cima e direita','zero','para a esquerda'],1,'A soma de componentes iguais forma uma diagonal de 45°.'),
    q('intermediate','Série triboelétrica','Ao atritar vidro e Teflon, o Teflon tende a…',['perder elétrons','ganhar elétrons','perder prótons','ficar sempre neutro'],1,'O Teflon está no lado de maior tendência a ganhar elétrons.'),
    q('intermediate','Campo elétrico','Linhas de campo saem, por convenção, de cargas…',['negativas e chegam às positivas','positivas e chegam às negativas','neutras','de qualquer sinal sem regra'],1,'A convenção gráfica é sair do positivo e entrar no negativo.'),
    q('intermediate','Vetores','Qual direção representa uma força para x positivo e y negativo?',['↖','↘','↙','↑'],1,'x positivo aponta à direita; y negativo, para baixo.','direction'),

    q('advanced','Lei de Coulomb','Se ambas as cargas dobram e a distância permanece, a força fica…',['2×','4×','8×','igual'],1,'O produto q₁q₂ fica quatro vezes maior.'),
    q('advanced','Resultante','Três forças podem produzir resultante zero quando…',['todas apontam para o mesmo lado','a soma vetorial se cancela','uma carga é vermelha','a velocidade é máxima'],1,'Equilíbrio exige cancelamento vetorial.'),
    q('advanced','Potencial','Regiões equipotenciais são regiões de…',['mesmo potencial elétrico','mesma cor','mesma massa','campo obrigatoriamente infinito'],0,'Equipotenciais conectam pontos com o mesmo potencial.'),
    q('advanced','Blindagem','Em equilíbrio eletrostático ideal, o campo dentro de uma cavidade condutora fechada tende a…',['ser reduzido ou nulo','ser infinito','trocar de sinal a cada segundo','depender da cor'],0,'A redistribuição superficial das cargas sustenta a blindagem eletrostática.'),
    q('advanced','Dipolos','Um dipolo elétrico possui…',['duas regiões de mesmo sinal','duas regiões de sinais opostos separadas','apenas nêutrons','carga total sempre positiva'],1,'Dipolos têm separação espacial entre polos opostos.'),
    q('advanced','Trajetória','Uma força perpendicular à velocidade instantânea tende a…',['curvar a trajetória','parar imediatamente','não ter efeito','apagar a carga'],0,'Ela altera principalmente a direção da velocidade.'),
    q('advanced','Indução','A região mais próxima de uma carga positiva em um condutor neutro tende a ficar…',['mais negativa','mais positiva','sem partículas','mais quente'],0,'Elétrons livres são atraídos para o lado mais próximo.'),
    q('advanced','Vetores','Qual sequência descreve melhor a soma vetorial?',['somar apenas módulos; ignorar direção','decompor em componentes; somar componentes; reconstruir a direção','multiplicar cores','subtrair massas'],1,'Componentes X e Y permitem somar forças corretamente.','order'),

    q('expert','Modelagem','Por que a simulação limita forças em distâncias muito pequenas?',['para evitar instabilidade numérica e velocidades infinitas','para mudar a lei física real','para ocultar cargas','para aumentar a massa'],0,'Modelos educacionais usam suavização e limites para manter estabilidade.'),
    q('expert','Integração','Um passo de tempo fixo ajuda porque…',['reduz a dependência da física em relação ao FPS','torna toda força zero','remove colisões','desliga o campo'],0,'Atualizações físicas com intervalos consistentes melhoram previsibilidade entre dispositivos.'),
    q('expert','Campo e potencial','O campo elétrico aponta aproximadamente na direção de…',['aumento máximo do potencial','redução mais rápida do potencial','temperatura constante','massa crescente'],1,'O campo é relacionado ao gradiente negativo do potencial.'),
    q('expert','Energia','Uma carga positiva liberada tende a mover-se espontaneamente para…',['maior potencial sempre','menor energia potencial elétrica','maior massa','campo nulo obrigatoriamente'],1,'Sistemas tendem a evoluir para configurações de menor energia potencial, respeitando as condições.'),
    q('expert','Superposição','A presença de uma terceira carga muda a força entre as duas primeiras na lei de Coulomb ideal?',['muda a interação de par','não; as forças de cada par são calculadas e somadas','apaga as cargas','só muda a cor'],1,'A superposição soma contribuições de pares sem alterar a lei aplicada a cada par.'),
    q('expert','Condutores','Em equilíbrio eletrostático, excesso de carga em um condutor ideal tende a ficar…',['no volume inteiro uniformemente','na superfície','somente no centro','fora do material como prótons'],1,'O excesso de carga se distribui pela superfície do condutor.'),
    q('expert','Atrito','A taxa de transferência no modelo deve depender de…',['quantidade de quadros renderizados','tempo físico de contato e materiais','resolução da tela','cor de fundo'],1,'Usar tempo de simulação evita diferenças entre dispositivos.'),
    q('expert','Validade do modelo','Por que valores são apresentados como aproximados?',['porque o modelo simplifica geometria, unidades e propriedades reais','porque a eletricidade não pode ser estudada','porque não existem cargas','porque a matemática não funciona'],0,'A ferramenta prioriza relações conceituais, não calibração laboratorial completa.')
  ];

  C.data.achievements=[
    {id:'first-attraction',icon:'🧲',title:'Primeira atração',description:'Faça q alcançar um alvo pela primeira vez.'},
    {id:'perfect-balance',icon:'⚖',title:'Equilíbrio perfeito',description:'Complete o desafio de equilíbrio.'},
    {id:'vector-master',icon:'↗',title:'Mestre dos vetores',description:'Acerte 10 direções seguidas.'},
    {id:'induction-expert',icon:'◐',title:'Especialista em indução',description:'Complete o capítulo de indução.'},
    {id:'tribo-scientist',icon:'⚡',title:'Cientista triboelétrico',description:'Realize 10 transferências por atrito.'},
    {id:'no-hints',icon:'💡',title:'Sem atalhos',description:'Complete um nível sem usar dicas.'},
    {id:'three-stars',icon:'★★★',title:'Três estrelas',description:'Ganhe três estrelas em um nível.'},
    {id:'chapter-complete',icon:'◇',title:'Capítulo completo',description:'Complete os cinco níveis de um capítulo.'},
    {id:'quiz-streak',icon:'🔥',title:'Sequência de 10',description:'Acerte dez questões consecutivas.'},
    {id:'all-experiments',icon:'🧪',title:'Laboratório completo',description:'Carregue todos os experimentos guiados.'},
    {id:'daily-first',icon:'☀',title:'Ritual científico',description:'Complete seu primeiro desafio diário.'},
    {id:'campaign-complete',icon:'◆',title:'Domínio eletrostático',description:'Complete os 30 desafios.'}
  ];
})();
