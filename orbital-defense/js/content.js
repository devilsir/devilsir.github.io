const Content={
 stages:[
  {title:'01 · Tutorial orbital',short:'Tutorial orbital',topic:'Primeiros passos',lesson:0,lanes:[0,2],start:420,spawns:[['asteroid',7],['armored',2],['swarm',2],['boss',1]],mentor:'kepler',dialogue:'Duas rotas estão abertas. Um Mini Sol financia a defesa; Mercúrio enfrenta a rocha. Os outros corpos chegam com suas descobertas.',fact:'Nas rotas do jogo, a velocidade é inspirada em órbitas circulares ao redor da mesma estrela.',color:'#cc9aff',bossScale:.36},
  {title:'02 · A forma das órbitas',short:'A forma das órbitas',topic:'1ª Lei de Kepler',lesson:0,lanes:[0,1,2,3,4],start:670,spawns:[['asteroid',7],['armored',3],['swarm',3],['phase',2],['boss',1]],mentor:'kepler',dialogue:'Uma elipse tem dois focos. O Sol ocupa um deles. Escolha a geometria da missão no laboratório.',fact:'O círculo é um caso particular de elipse, com excentricidade zero.',color:'#b98aff',bossScale:.7,puzzle:'ellipse',trainingWave:['swarm','swarm','armored'],trainingLanes:[2,2,2]},
  {title:'03 · Velocidade no periélio',short:'Velocidade no periélio',topic:'2ª Lei de Kepler',lesson:1,lanes:[0,1,2,3,4],start:760,spawns:[['ice',5],['fire',3],['runner',4],['swarm',3],['cometBoss',1]],mentor:'kepler',dialogue:'No periélio da mesma órbita elíptica, a velocidade é máxima. Calor contra gelo; criogenia contra fogo.',fact:'Áreas iguais são varridas em intervalos de tempo iguais.',color:'#71dbff',puzzle:'speed',trainingWave:['ice','fire','ice','fire'],trainingLanes:[1,3,1,3]},
  {title:'04 · O relógio do sistema',short:'O relógio do sistema',topic:'3ª Lei de Kepler',lesson:2,lanes:[0,1,2,3,4],start:850,spawns:[['shield',4],['crystal',4],['iron',3],['jumper',3],['binary',1]],mentor:'kepler',dialogue:'Ao redor da mesma estrela, T²/a³ é constante. Use o tempo de viagem das rotas externas a seu favor.',fact:'A relação entre período e semieixo maior depende também da massa do corpo central.',color:'#dbb2ff',trainingWave:['jumper','shield','shield'],trainingLanes:[2,1,1]},
  {title:'05 · A força invisível',short:'A força invisível',topic:'Gravitação de Newton',lesson:3,lanes:[0,1,2,3,4],start:920,spawns:[['iron',4],['magnetic',3],['rogueMoon',3],['leech',2],['shield',3],['boss',1]],mentor:'newton',dialogue:'Eu fico com a força invisível. Dobrar uma massa dobra a atração. Dobrar a distância a divide por quatro.',fact:'F = G·M·m/r²: a força depende das duas massas e da distância entre os centros.',color:'#eec579',puzzle:'gravity',trainingWave:['iron','magnetic','rogueMoon'],trainingLanes:[2,2,2]},
  {title:'06 · Mundos errantes',short:'Mundos errantes',topic:'Massa e velocidade de escape',lesson:5,lanes:[0,1,2,3,4],start:1050,spawns:[['rogueMoon',4],['binaryObject',3],['parasite',3],['crystal',4],['boss',1],['binary',1]],mentor:'newton',dialogue:'Corpos de maior massa resistem ao empurrão no jogo. Na simulação, observe como a massa central altera a velocidade de escape.',fact:'A velocidade de escape ideal é √(2GM/r), sem resistência do ar e sem nova propulsão.',color:'#e2a083',puzzle:'escape',trainingWave:['binaryObject','binaryObject','parasite'],trainingLanes:[2,2,2]},
  {title:'07 · Tempestades gravitacionais',short:'Tempestades gravitacionais',topic:'Sinergias e marés',lesson:6,lanes:[0,1,2,3,4],start:1150,spawns:[['magnetic',4],['leech',3],['jumper',4],['dark',3],['neutronBoss',1]],mentor:'newton',dialogue:'Urano congela, Netuno amplifica. Um Poço G agrupa alvos para Saturno. Descubra o que funciona em conjunto.',fact:'Marés surgem da diferença da atração gravitacional entre regiões de um corpo.',color:'#8cdafa',trainingWave:['dark','dark','jumper'],trainingLanes:[2,2,2]},
  {title:'08 · Colapso',short:'Colapso',topic:'Astrofísica extrema',lesson:4,lanes:[0,1,2,3,4],start:1280,spawns:[['dark',4],['phase',4],['parasite',3],['runner',3],['neutronBoss',1],['blackhole',1]],mentor:'newton',dialogue:'Uma estrela de nêutrons pulsa; o horizonte bloqueia espaços. Perfuração e suas pesquisas serão decisivas.',fact:'Buracos negros exigem relatividade geral. Nossa defesa usa efeitos de gravidade simplificados.',color:'#ff87bd',puzzle:'stable',trainingWave:['phase','dark','phase'],trainingLanes:[2,2,2]}
 ],
 unitUnlockStages:{
  miniSun:0,mercury:0,jupiter:0,
  belt:1,venus:1,
  mars:2,uranus:2,
  earth:3,neptune:3,
  saturn:4,gravity:4,
  moon:5,probe:5,
  pulsar:6,
  neutron:7
 },
 stageUnlocks:[
  ['miniSun','mercury','jupiter'],
  ['belt','venus'],
  ['mars','uranus'],
  ['earth','neptune'],
  ['saturn','gravity'],
  ['moon','probe'],
  ['pulsar'],
  ['neutron']
 ],
 trainingSituations:{
  jupiter:{title:'Segure a rota com uma barreira',scenario:'Júpiter tem muito HP e existe para receber o contato antes dos atacantes. Neste treino, ele deve ficar na frente da formação, na rota superior, criando tempo para Mercúrio continuar atirando.',instruction:'Posicione Júpiter no ponto destacado, mais à frente da rota. A simulação continua pausada enquanto você constrói.',point:[0.6641,0.1391,112],enemy:'inimigos de contato'},
  belt:{title:'Segure a linha',scenario:'A fase começa com enxames e rochas pressionando a mesma rota. O Cinturão existe para comprar alguns segundos sem gastar a energia de um gigante gasoso.',instruction:'Coloque o Cinturão mais à frente da rota para ele receber o contato primeiro.',point:[0.6641,0.5,112],enemy:'enxames rápidos'},
  venus:{title:'Ataque grupos, não indivíduos',scenario:'Logo no início chegam inimigos em grupo. Vênus transforma cada disparo em uma explosão solar, então rende muito mais quando vários alvos estão próximos.',instruction:'Posicione Vênus atrás da barreira para ele atacar o grupo enquanto o Cinturão segura a linha.',point:[0.4922,0.5,112],enemy:'enxames orbitais'},
  mars:{title:'Calor contra gelo',scenario:'Cometas de gelo entram cedo nesta fase. Marte aplica plasma e queimadura, causando dano contínuo justamente enquanto eles atravessam a rota.',instruction:'Coloque Marte numa rota em que os cometas de gelo terão bastante caminho pela frente.',point:[0.4063,0.3542,112],enemy:'cometas de gelo'},
  uranus:{title:'Frio contra fogo',scenario:'Meteoros ígneos são rápidos e resistem a plasma. Urano reduz sua velocidade com criogenia e ainda causa dano muito eficiente contra esse tipo de ameaça.',instruction:'Posicione Urano numa rota diferente da de Marte para comparar os dois matchups.',point:[0.4063,0.6458,112],enemy:'meteoros ígneos'},
  earth:{title:'Controle antes do dano',scenario:'Saltadores e alvos móveis começam a pressionar rotas diferentes. A Terra desacelera com gravidade, mantendo os inimigos mais tempo sob fogo das outras torres.',instruction:'Coloque a Terra numa posição central para controlar uma rota por mais tempo.',point:[0.4922,0.5,112],enemy:'saltadores orbitais'},
  neptune:{title:'Quebre escudos',scenario:'Asteroides escudados aparecem cedo. Netuno usa eletricidade, descarrega escudos e ainda encadeia o raio quando os inimigos ficam próximos.',instruction:'Posicione Netuno onde ele consiga pegar uma sequência de alvos na mesma aproximação.',point:[0.4063,0.3542,112],enemy:'asteroides escudados'},
  saturn:{title:'Barreira com função ofensiva',scenario:'Ameaças pesadas chegam em grupos. Saturno segura a linha e seus anéis podem punir inimigos que ficam presos perto dele.',instruction:'Coloque Saturno na frente da formação, deixando espaço logo atrás para controle gravitacional.',point:[0.6641,0.5,112],enemy:'corpos pesados'},
  gravity:{title:'Agrupe para multiplicar dano',scenario:'O Poço G não existe para matar sozinho: ele prende e vulnerabiliza grupos. Nesta fase, isso prepara os alvos para Saturno e para ataques em área.',instruction:'Coloque o Poço G logo atrás de Saturno para manter vários inimigos perto dos anéis.',point:[0.5781,0.5,112],enemy:'grupos densos'},
  moon:{title:'Proteja um planeta existente',scenario:'A Lua não ocupa uma casa vazia: ela orbita uma construção já colocada, intercepta parte do dano e amplia seu alcance. Para demonstrar isso, uma Terra de treinamento será posicionada sem custo.',instruction:'Selecione Lua e clique na Terra de treinamento para anexá-la.',point:[0.4063,0.5,112],enemy:'pressão prolongada',requiresHost:true},
  probe:{title:'Faça várias torres renderem mais',scenario:'A Sonda marca inimigos para receberem mais dano e aumenta o alcance de aliados próximos. Ela vale mais quando serve várias construções ao mesmo tempo.',instruction:'Posicione a Sonda no centro da formação para cobrir mais de uma rota e mais de um aliado.',point:[0.4922,0.5,112],enemy:'alvos resistentes'},
  pulsar:{title:'Perfure uma fila inteira',scenario:'Fragmentos escuros e ameaças blindadas aparecem em sequência. O Pulsar dispara pela rota e atravessa vários alvos, aproveitando filas longas.',instruction:'Coloque o Pulsar mais atrás: seu alcance enorme permite atravessar a fila antes que ela chegue à defesa.',point:[0.3203,0.5,112],enemy:'filas blindadas'},
  neutron:{title:'Poucos tiros, impacto enorme',scenario:'A última fase traz alvos extremos, incluindo o microburaco negro. A Estrela de Nêutrons é cara e lenta, mas cada impacto perfura armadura e explode em área.',instruction:'Proteja a Estrela de Nêutrons no fundo da formação; ela precisa de tempo para disparar.',point:[0.3203,0.5,112],enemy:'anomalias extremas'}
 },
 extras:{
  moon:{name:'Lua',cost:75,img:'moon',desc:'Satélite que protege e amplia',damage:7,rate:2.6,range:210,hp:180,kind:'moon',damageType:'kinetic',color:'#d9e4ff',tip:'Selecione Lua e clique em um planeta. Ela intercepta parte do dano e amplia o alcance; com a Terra, fortalece o controle de maré.'},
  belt:{name:'Cinturão',cost:65,img:'belt',desc:'Barreira rápida de emergência',damage:0,rate:0,range:0,hp:420,kind:'barrier',damageType:'kinetic',color:'#c0a796',blockDamageMultiplier:.82,tip:'Baixo custo e vida média. Uma segunda linha de defesa contra ameaças rápidas.'},
  neutron:{name:'Estrela de nêutrons',cost:490,img:'neutron',desc:'Impacto gravitacional maciço',damage:260,rate:6.5,range:950,hp:220,kind:'neutron',damageType:'pierce',color:'#a9e8ff',tip:'Ataque lento que atravessa armadura e explode em área. Perto de Poço G, os alvos presos recebem mais dano.'},
  pulsar:{name:'Pulsar',cost:290,img:'pulsar',desc:'Pulso que atravessa a rota',damage:77,rate:3.6,range:1100,hp:160,kind:'pierce',damageType:'pierce',color:'#acd4ff',tip:'O pulso atravessa até três inimigos. Pulsares reais são estrelas de nêutrons em rotação observadas em pulsos.'},
  probe:{name:'Sonda',cost:100,img:'probe',desc:'Revela e marca fraquezas',damage:0,rate:4.5,range:360,hp:100,kind:'probe',damageType:'electric',color:'#9bf2e5',tip:'Marca inimigos de rotas vizinhas: recebem +18% de dano. Amplia o alcance de aliados próximos.'}
 },
 branches:{
  miniSun:[['Fornalha solar','Mais energia por ciclo.',{energy:1.65,rate:1.1}],['Fusão rápida','Ciclos muito mais curtos.',{rate:.61,hp:1.2}]],
  mercury:[['Acelerador orbital','Intervalo de tiro −38%.',{rate:.62}],['Núcleo de impacto','Dano +40%, perfurante.',{damage:1.4,type:'pierce'}]],
  venus:[['Estufa extrema','Explosão 50% maior e queimadura.',{area:1.5,burn:true}],['Atmosfera corrosiva','Remove 6 de armadura por impacto.',{corrosion:6}]],
  earth:[['Maré travada','Lentidão mais forte e duradoura.',{slow:.4}],['Campo profundo','Amplifica o dano recebido.',{vulnerability:1.4}]],
  mars:[['Núcleo fundido','Queimadura +80%.',{burnDps:1.8}],['Reação em cadeia','O plasma explode nos alvos.',{area:1.4,splash:true}]],
  uranus:[['Congelamento profundo','Congela o alvo por 1,2s.',{freeze:1.2}],['Fratura de gelo','Dano +55% contra alvos lentos.',{fracture:1.55}]],
  neptune:[['Cadeia de tempestades','Até 5 saltos elétricos.',{jumps:5}],['Sobrecarga iônica','Dano +60% em escudos.',{shield:1.6}]],
  jupiter:[['Grande muralha','Vida máxima +65%.',{hp:1.65}],['Escudo da tempestade','Reflete contato e reduz movimento.',{reflect:8,field:.7}]],
  saturn:[['Anéis cortantes','Dano de contato dos anéis +70%.',{ring:1.7}],['Escudo orbital','Regenera 14 HP/s fora de contato.',{regen:14}]],
  gravity:[['Horizonte de eventos','Alcance +40%, lentidão profunda.',{range:1.4,slow:.24}],['Poço convergente','Atrai grupos ao centro do campo.',{pull:65}]],
  moon:[['Escudo de maré','Intercepção de dano +15%.',{intercept:.45}],['Observatório lunar','Alcance do planeta +25%.',{range:1.25}]],
  belt:[['Cinturão denso','Vida máxima +80%.',{hp:1.8}],['Fragmentação','Reflete 18 de dano de contato.',{reflect:18}]],
  neutron:[['Colapso compacto','Dano +55%.',{damage:1.55}],['Pulsos rápidos','Intervalo de tiro −32%.',{rate:.68}]],
  pulsar:[['Feixe coerente','Perfura até 6 alvos.',{pierces:6}],['Pulso magnético','Descarrega escudos e causa lentidão.',{type:'electric',slow:.55}]],
  probe:[['Radar de precisão','Marcação +30%, alcance +35%.',{vulnerability:1.3,range:1.35}],['Malha de comunicação','Diminui cadência de aliados próximos.',{allyRate:.85}]]
 },
 research:[
  {id:'economy',category:'Energia',name:'Fusão eficiente',cost:6,desc:'Mini Sóis produzem +20% de energia.',needs:[]},
  {id:'battery',category:'Energia',name:'Reserva estelar',cost:10,desc:'Comece missões com +120 energia.',needs:['economy']},
  {id:'defense',category:'Defesa planetária',name:'Atmosferas reforçadas',cost:7,desc:'Todas as construções têm +20% de HP.',needs:[]},
  {id:'moon',category:'Mecânica orbital',name:'Dinâmica de marés',cost:6,desc:'Luas interceptam +5% de dano e ampliam ainda mais o alcance do planeta hospedeiro.',needs:[]},
  {id:'precision',category:'Mecânica orbital',name:'Balística orbital',cost:9,desc:'Mercúrio e Pulsar causam +15% de dano.',needs:[]},
  {id:'gravity',category:'Gravidade',name:'Campo ampliado',cost:10,desc:'Terra e Poço G ganham +20% de alcance.',needs:['moon']},
  {id:'pulsar',category:'Astrofísica avançada',name:'Feixe coerente',cost:10,desc:'Pulsares atravessam +2 alvos por disparo.',needs:['precision']},
  {id:'neutron',category:'Astrofísica avançada',name:'Matéria degenerada',cost:16,desc:'Estrelas de nêutrons causam +20% de dano.',needs:['pulsar']},
  {id:'powers',category:'Gravidade',name:'Manobras gravitacionais',cost:10,desc:'Desbloqueia Estilingue e Eclipse.',needs:['gravity']},
  {id:'supernova',category:'Astrofísica avançada',name:'Supernova controlada',cost:18,desc:'Uma Supernova por missão e velocidade 3×.',needs:['neutron','powers']}
 ],
 facts:{asteroid:'Asteroides são corpos rochosos remanescentes da formação do Sistema Solar.',armored:'Alguns asteroides contêm metais e silicatos; a blindagem é uma mecânica do jogo.',iron:'Asteroides metálicos podem conter ferro e níquel e ter origem em corpos diferenciados.',spiky:'A forma irregular de um asteroide depende de sua história de impactos e rotação.',ice:'Cometas contêm gelo e poeira. Ao se aproximarem do Sol, a sublimação forma a coma e as caudas.',fire:'Meteoros são fenômenos luminosos da entrada atmosférica. O meteoro ígneo espacial é uma representação de combate.',shield:'Escudos de energia são ficção do jogo; asteroides reais não possuem campos defensivos.',swarm:'Colisões podem fragmentar asteroides e formar famílias de pequenos corpos.',crystal:'Minerais dos asteroides registram processos físicos e químicos de sua formação.',phase:'Intangibilidade periódica é ficção usada como desafio de estratégia.',rogueMoon:'Luas orbitam corpos planetários; capturas e ejeções podem mudar essas trajetórias.',magnetic:'Materiais ferromagnéticos podem responder a campos magnéticos. A interferência da unidade é ficcional.',leech:'Transferências de energia orbital podem ocorrer em encontros gravitacionais. Roubar energia estelar é ficção.',jumper:'Perturbações gravitacionais podem alterar órbitas. Saltos instantâneos entre rotas são uma simplificação.',parasite:'Estrelas convertem energia por fusão nuclear. O parasita solar é um inimigo ficcional.',runner:'Na mesma órbita elíptica, um cometa é mais rápido no periélio e mais lento no afélio.',dark:'Matéria escura não é um fragmento negro visível; esta unidade é ficcional.',binaryObject:'Sistemas binários orbitam um centro de massa comum. A ligação de combate é uma simplificação.',boss:'Planetas errantes não orbitam uma estrela hospedeira. Eles não atacam sistemas deliberadamente.',binary:'Corpos de um sistema binário se movem ao redor de seu centro de massa.',blackhole:'Um buraco negro tem um horizonte de eventos. O laboratório newtoniano não descreve seu interior.',cometBoss:'A gravidade acelera um cometa à medida que ele se aproxima do periélio da mesma órbita.',neutronBoss:'Estrelas de nêutrons são remanescentes estelares extremamente densos; algumas são observadas como pulsares.'},
 synergies:[
  {a:'earth',b:'moon',name:'Maré lunar',desc:'Lentidão da Terra fortalecida.'},
  {a:'mars',b:'miniSun',name:'Plasma aquecido',desc:'Marte causa +20% de dano.'},
  {a:'mercury',b:'miniSun',name:'Carga solar',desc:'Mercúrio causa +15% de dano.'},
  {a:'uranus',b:'neptune',name:'Choque térmico',desc:'Eletricidade +45% em inimigos congelados.'},
  {a:'saturn',b:'gravity',name:'Anéis convergentes',desc:'Anéis atingem alvos presos no Poço G.'},
  {a:'jupiter',b:'earth',name:'Gigante gravitacional',desc:'Júpiter desacelera inimigos em um campo maior.'},
  {a:'venus',b:'mars',name:'Estufa de plasma',desc:'Queimaduras duram 50% mais.'},
  {a:'neutron',b:'gravity',name:'Colapso conjunto',desc:'Impactos de nêutrons causam +35% em alvos presos.'}
 ],
 install(units,enemies,waves,lessons,questions,images){
  Object.assign(units,this.extras)
  images.mercury='mercury2.png';images.earth='earth2.png';images.mars='mars2.png'
  Object.assign(images,{moon:'moon_companions.png',belt:'asteroid_swarm.png',neutron:'earth.png',pulsar:'mercury.png',probe:'probe.png'})
  for(const id of ['miniSun','mercury','venus','earth','mars','uranus','neptune','jupiter','saturn','gravity','moon','belt','neutron','pulsar','probe','sun'])images[id]='defender_'+id+'.png'
  const make=(base,extra)=>({...enemies[base],resist:{...enemies[base].resist},...extra})
  Object.assign(enemies,{
   iron:make('armored',{name:'Asteroide de ferro',tag:'FERRO',hp:340,speed:16,armor:22,reward:40,resist:{...enemies.armored.resist,pierce:1.8}}),
   rogueMoon:make('armored',{name:'Lua errante',tag:'MASSA',hp:470,speed:17,armor:10,size:100,reward:45,behavior:'heavy',img:'moon'}),
   magnetic:make('shield',{name:'Asteroide magnético',tag:'MAGNÉTICO',hp:260,shield:70,behavior:'magnetic',reward:43}),
   leech:make('phase',{name:'Sanguessuga G',tag:'DRENAGEM',behavior:'leech',shield:0,hp:210,reward:42,img:'gravity'}),
   jumper:make('ice',{name:'Saltador orbital',tag:'SALTO',behavior:'jumper',hp:230,speed:34,reward:37,img:'crystal'}),
   parasite:make('fire',{name:'Parasita solar',tag:'PARASITA',behavior:'parasite',speed:28,hp:240,reward:40}),
   runner:make('ice',{name:'Cometa corredor',tag:'PERIÉLIO',behavior:'runner',hp:175,speed:36,reward:32}),
   dark:make('phase',{name:'Fragmento de matéria negra',tag:'FICCIONAL',behavior:'dark',hp:320,shield:0,reward:48,img:'blackhole',resist:{kinetic:.4,plasma:.6,gravity:1.35,cryo:.7,pierce:1.5,solar:.8,electric:.7}}),
   binaryObject:make('asteroid',{name:'Objeto binário',tag:'VÍNCULO',hp:180,speed:24,behavior:'linked',img:'binary',reward:24}),
   cometBoss:make('boss',{name:'Grande cometa',tag:'BOSS',hp:1550,speed:19,behavior:'cometBoss',img:'bossComet',armor:5,shield:90,resist:{...enemies.ice.resist,gravity:1.3}}),
   neutronBoss:make('boss',{name:'Pulsar hostil',tag:'BOSS',hp:1900,speed:13,behavior:'neutronBoss',img:'pulsar',armor:12,shield:250,reward:220})
  })
  enemies.boss.behavior='rogueBoss';enemies.binary.behavior='binaryBoss'
  for(const id of ['asteroid','armored','iron','crystal','ice','fire','swarm','phase','rogueMoon','magnetic','leech','jumper','parasite','runner','dark','binaryObject','boss','bossComet','binary','neutronBoss','blackhole','bossSolar','bossSerpent','binarySuper'])images['enemy_'+id]='enemy_'+id+'.png'
  for(const [id,d] of Object.entries(enemies))d.img='enemy_'+(id==='spiky'?'iron':id==='shield'?'magnetic':id==='cometBoss'?'bossComet':id)
  waves.splice(0,waves.length,...this.stages)
  lessons.push({kicker:'VELOCIDADE DE ESCAPE',title:'Energia para escapar',text:'Sem resistência do ar e sem propulsão adicional, a velocidade de escape ideal depende da massa central e da distância entre os centros. Dobrar a massa aumenta essa velocidade por √2.',formula:'vₑ = √(2GM/r)',mentor:assetPath('newton.png')})
  lessons.push({kicker:'MARÉS E CAMPOS',title:'Diferenças que fazem força',text:'As marés aparecem porque a gravidade não é igual em todo um corpo. No jogo, a parceria entre Terra e Lua traduz essa ideia em controle adicional.',formula:'F ∝ 1/r²',mentor:assetPath('newton.png')})
  questions.splice(0,questions.length,...this.challenges())
 },
 challenges(){
  const BNCC='BNCC EM13CNT204 · CRMG EM13CNT204X'
  const INVEST='BNCC EM13CNT301 · CRMG EM13CNT210MG'
  const MODELS='BNCC EM13CNT201 · CRMG EM13CNT210MG'
  const choice=(q,options,correct,why,skill=BNCC)=>({kind:'choice',q,options,correct,why,skill})
  const task=(kind,q,why,extra={},skill=BNCC)=>({kind,q,why,skill,...extra})
  return [
   [
    choice('Um asteroide descreve uma órbita aproximadamente circular com rapidez constante. Por que ainda existe aceleração?',[
     'Porque a direção do vetor velocidade muda continuamente',
     'Porque a rapidez aumenta a cada instante',
     'Porque a gravidade deixa de atuar em metade da órbita',
     'Porque todo movimento circular ocorre sem força resultante'
    ],0,'A aceleração pode existir mesmo sem mudança no módulo da velocidade: no movimento circular, a direção do vetor velocidade muda e a aceleração aponta para o centro.',BNCC),
    choice('Um satélite artificial permanece em órbita ao redor da Terra principalmente porque...',[
     'possui velocidade tangencial enquanto a gravidade curva continuamente sua trajetória',
     'está longe o bastante para a gravidade da Terra ser nula',
     'seus motores precisam empurrá-lo o tempo todo para cima',
     'a atmosfera o sustenta como uma asa'
    ],0,'Uma órbita pode ser entendida como uma queda livre contínua: a gravidade fornece a aceleração centrípeta, enquanto a velocidade tangencial impede uma queda radial direta.',BNCC),
    choice('Uma sonda desloca-se 1 200 km em linha reta, no mesmo sentido, durante 60 s. Qual é o módulo de sua velocidade média nesse intervalo?',[
     '20 km/s','72 km/s','1 260 km/s','0,05 km/s'
    ],0,'O módulo da velocidade média é o módulo do deslocamento dividido pelo intervalo de tempo: 1 200/60 = 20 km/s.',INVEST)
   ],
   [
    task('focus','Posicione o Sol em um dos focos da órbita elíptica.','Na 1ª Lei de Kepler, o Sol ocupa um dos focos da elipse, e não necessariamente o centro geométrico.',{},BNCC),
    task('eccentricity','Ajuste a excentricidade para e = 0,60.','A excentricidade mede o alongamento da órbita: e = 0 é circular e, para uma elipse, 0 < e < 1.',{target:.6},INVEST),
    choice('Mantendo o mesmo semieixo maior, o que acontece com a forma da órbita quando a excentricidade aumenta de 0,20 para 0,70?',[
     'A órbita fica mais alongada','A órbita se torna um círculo perfeito','O Sol passa obrigatoriamente para o centro','O período orbital torna-se zero'
    ],0,'Quanto maior a excentricidade de uma elipse, mais alongada é sua forma. Uma circunferência corresponde a e = 0.',BNCC)
   ],
   [
    task('speed','Na mesma órbita elíptica, marque a região em que o planeta apresenta maior velocidade.','Pela 2ª Lei de Kepler, o corpo se move mais rapidamente no periélio e mais lentamente no afélio.',{},BNCC),
    task('areas','Para dois intervalos de tempo iguais, escolha a relação correta entre as áreas varridas pelo raio vetor.','A 2ª Lei de Kepler estabelece que áreas iguais são varridas em tempos iguais.',{},INVEST),
    choice('Um planeta leva 30 dias para percorrer um trecho próximo ao periélio e outros 30 dias para percorrer um trecho próximo ao afélio. Comparando as áreas varridas pelo raio que liga o planeta ao Sol, espera-se que elas sejam...',[
     'aproximadamente iguais','maior no periélio porque a velocidade é maior','maior no afélio porque a distância é maior','nulas no afélio'
    ],0,'A velocidade e o comprimento dos arcos mudam, mas a área varrida por unidade de tempo permanece constante.',BNCC)
   ],
   [
    task('order','Ordene as órbitas de 1 UA, 2 UA e 3 UA pelo período, do menor para o maior.','Para corpos que orbitam a mesma estrela, T²/a³ é constante. Portanto, órbitas maiores têm períodos maiores.',{},BNCC),
    task('period','Ajuste o semieixo maior até obter um período de aproximadamente 8 anos.','Para uma estrela com massa igual à do Sol e usando anos e UA, T² = a³. Se T = 8 anos, a = 4 UA.',{target:8},INVEST),
    choice('Para um planeta orbitando uma estrela de 1 massa solar, use T² = a³, com T em anos e a em UA. Se a = 9 UA, qual é aproximadamente o período orbital?',[
     '27 anos','9 anos','81 anos','3 anos'
    ],0,'T² = 9³ = 729; portanto T = √729 = 27 anos.',BNCC)
   ],
   [
    task('gravity','Dobre a distância entre os corpos e ajuste a simulação até F/F₀ = 0,25.','Pela Lei da Gravitação Universal, mantendo as massas constantes, F ∝ 1/r². Dobrar r reduz F a um quarto.',{target:.25},BNCC),
    task('mass','Mantenha a distância fixa e ajuste uma das massas para que a força dobre.','A força gravitacional é diretamente proporcional a cada uma das massas: F ∝ M·m.',{target:2},INVEST),
    choice('Dois corpos atraem-se com força F. Se as duas massas forem duplicadas e a distância entre seus centros for triplicada, a nova força será...',[
     '4F/9','9F/4','4F','F/9'
    ],0,'Pela relação F ∝ M·m/r²: duplicar as duas massas multiplica a força por 4, enquanto triplicar a distância divide por 9. Resultado: 4F/9.',BNCC)
   ],
   [
    task('escape','No modelo ideal G = M = r = 1, ajuste a velocidade inicial para a velocidade mínima de escape.','A velocidade de escape é vₑ = √(2GM/r). Nesse modelo, vₑ = √2 ≈ 1,414.',{target:Math.SQRT2},BNCC),
    choice('Dois planetas têm a mesma massa, mas o planeta B tem raio quatro vezes maior. Comparando as velocidades de escape na superfície, vₑ = √(2GM/r), temos...',[
     'vₑ(B) = vₑ(A)/2','vₑ(B) = 2vₑ(A)','vₑ(B) = 4vₑ(A)','vₑ(B) = vₑ(A)'
    ],0,'Com a mesma massa, vₑ ∝ 1/√r. Se o raio aumenta por um fator 4, a velocidade de escape é dividida por √4 = 2.',BNCC),
    choice('Para um mesmo corpo central e a mesma distância r, a velocidade de escape é maior que a velocidade orbital circular por qual fator?',[
     '√2','2','1/√2','4'
    ],0,'v_orb = √(GM/r) e vₑ = √(2GM/r). Logo, vₑ = √2·v_orb.',INVEST)
   ],
   [
    choice('As marés terrestres estão ligadas principalmente...',[
     'à diferença da atração gravitacional entre diferentes regiões da Terra',
     'ao desaparecimento periódico da gravidade durante a noite',
     'à rotação da Lua produzir vento no espaço',
     'à força gravitacional ser exatamente igual em toda a Terra'
    ],0,'Marés são efeitos de gradiente gravitacional: a atração não tem exatamente o mesmo valor e direção em todos os pontos de um corpo extenso.',BNCC),
    task('gravity','Ajuste a distância até a força gravitacional ficar aproximadamente na metade do valor inicial.','Como F/F₀ = 1/r², obter metade da força exige r ≈ √2 vezes a distância inicial.',{target:.5},INVEST),
    choice('Se a Lua estivesse significativamente mais próxima da Terra, mantendo as demais condições, a tendência seria de marés...',[
     'mais intensas, porque o gradiente gravitacional aumentaria','mais fracas, porque a gravidade lunar diminuiria','iguais, pois marés não dependem de distância','nulas, pois a Lua deixaria de atrair os oceanos'
    ],0,'A diferença de atração gravitacional entre o lado próximo e o lado distante da Terra cresce fortemente quando a distância à Lua diminui.',BNCC)
   ],
   [
    choice('Uma estrela de nêutrons mantém grande massa concentrada em um raio muito pequeno. Em comparação com um corpo de mesma massa e raio maior, sua velocidade de escape na superfície tende a ser...',[
     'maior','menor','igual a zero','independente do raio'
    ],0,'Como vₑ = √(2GM/r), reduzir muito o raio mantendo a massa aumenta a velocidade de escape.',BNCC),
    choice('Um pulsar é interpretado atualmente como...',[
     'uma estrela de nêutrons em rotação cujos feixes podem cruzar nossa linha de visão',
     'um planeta gasoso que pisca porque entra na sombra de sua estrela',
     'um cometa que emite pulsos por combustão',
     'uma região do espaço sem gravidade'
    ],0,'Pulsares são estrelas de nêutrons altamente magnetizadas e em rotação, observadas como pulsos quando seus feixes varrem nossa direção.',MODELS),
    choice('Por que a Gravitação Universal de Newton não é suficiente para descrever o horizonte de eventos de um buraco negro?',[
     'Porque fenômenos gravitacionais extremos exigem a descrição relativística do espaço-tempo',
     'Porque a gravidade deixa de existir perto de um buraco negro',
     'Porque Newton só estudou movimentos sem aceleração',
     'Porque buracos negros não possuem massa'
    ],0,'A gravitação newtoniana funciona como aproximação em muitos casos, mas horizontes de eventos exigem a Relatividade Geral.',MODELS)
   ]
  ]
 }
}
