const Content={
 stages:[
  {title:'01 · O sistema silencioso',short:'O sistema silencioso',topic:'Primeiros sinais',lesson:0,lanes:[0,2],start:420,spawns:[['asteroid',7],['armored',2],['swarm',2],['boss',1]],mentor:'kepler',dialogue:'Duas rotas estão abertas. Um Mini Sol financia a defesa; Mercúrio enfrenta a rocha. Os outros corpos chegam com suas descobertas.',fact:'Nas rotas do jogo, a velocidade é inspirada em órbitas circulares ao redor da mesma estrela.',color:'#cc9aff',bossScale:.36},
  {title:'02 · A forma das órbitas',short:'A forma das órbitas',topic:'1ª Lei de Kepler',lesson:0,lanes:[0,1,2,3,4],start:670,spawns:[['asteroid',7],['armored',3],['swarm',3],['phase',2],['boss',1]],mentor:'kepler',dialogue:'Uma elipse tem dois focos. O Sol ocupa um deles. Escolha a geometria da missão no laboratório.',fact:'O círculo é um caso particular de elipse, com excentricidade zero.',color:'#b98aff',bossScale:.7,puzzle:'ellipse'},
  {title:'03 · Velocidade no periélio',short:'Velocidade no periélio',topic:'2ª Lei de Kepler',lesson:1,lanes:[0,1,2,3,4],start:760,spawns:[['ice',5],['fire',3],['runner',4],['swarm',3],['cometBoss',1]],mentor:'kepler',dialogue:'No periélio da mesma órbita elíptica, a velocidade é máxima. Calor contra gelo; criogenia contra fogo.',fact:'Áreas iguais são varridas em intervalos de tempo iguais.',color:'#71dbff',puzzle:'speed'},
  {title:'04 · O relógio do sistema',short:'O relógio do sistema',topic:'3ª Lei de Kepler',lesson:2,lanes:[0,1,2,3,4],start:850,spawns:[['shield',4],['crystal',4],['iron',3],['jumper',3],['binary',1]],mentor:'kepler',dialogue:'Ao redor da mesma estrela, T²/a³ é constante. Use o tempo de viagem das rotas externas a seu favor.',fact:'A relação entre período e semieixo maior depende também da massa do corpo central.',color:'#dbb2ff'},
  {title:'05 · A força invisível',short:'A força invisível',topic:'Gravitação de Newton',lesson:3,lanes:[0,1,2,3,4],start:920,spawns:[['iron',4],['magnetic',3],['rogueMoon',3],['leech',2],['shield',3],['boss',1]],mentor:'newton',dialogue:'Eu fico com a força invisível. Dobrar uma massa dobra a atração. Dobrar a distância a divide por quatro.',fact:'F = G·M·m/r²: a força depende das duas massas e da distância entre os centros.',color:'#eec579',puzzle:'gravity'},
  {title:'06 · Mundos errantes',short:'Mundos errantes',topic:'Massa e velocidade de escape',lesson:5,lanes:[0,1,2,3,4],start:1050,spawns:[['rogueMoon',4],['binaryObject',3],['parasite',3],['crystal',4],['boss',1],['binary',1]],mentor:'newton',dialogue:'Corpos de maior massa resistem ao empurrão no jogo. Na simulação, observe como a massa central altera a velocidade de escape.',fact:'A velocidade de escape ideal é √(2GM/r), sem resistência do ar e sem nova propulsão.',color:'#e2a083',puzzle:'escape'},
  {title:'07 · Tempestades gravitacionais',short:'Tempestades gravitacionais',topic:'Sinergias e marés',lesson:6,lanes:[0,1,2,3,4],start:1150,spawns:[['magnetic',4],['leech',3],['jumper',4],['dark',3],['neutronBoss',1]],mentor:'newton',dialogue:'Urano congela, Netuno amplifica. Um Poço G agrupa alvos para Saturno. Descubra o que funciona em conjunto.',fact:'Marés surgem da diferença da atração gravitacional entre regiões de um corpo.',color:'#8cdafa'},
  {title:'08 · Colapso',short:'Colapso',topic:'Astrofísica extrema',lesson:4,lanes:[0,1,2,3,4],start:1280,spawns:[['dark',4],['phase',4],['parasite',3],['runner',3],['neutronBoss',1],['blackhole',1]],mentor:'newton',dialogue:'Uma estrela de nêutrons pulsa; o horizonte bloqueia espaços. Perfuração e suas pesquisas serão decisivas.',fact:'Buracos negros exigem relatividade geral. Nossa defesa usa efeitos de gravidade simplificados.',color:'#ff87bd',puzzle:'stable'}
 ],
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
  {id:'moon',category:'Mecânica orbital',name:'Sistema lunar',cost:6,desc:'Desbloqueia a Lua e a sinergia de maré.',needs:[]},
  {id:'precision',category:'Mecânica orbital',name:'Balística orbital',cost:9,desc:'Mercúrio e Pulsar causam +15% de dano.',needs:[]},
  {id:'gravity',category:'Gravidade',name:'Campo ampliado',cost:10,desc:'Terra e Poço G ganham +20% de alcance.',needs:['moon']},
  {id:'pulsar',category:'Astrofísica avançada',name:'Observação de pulsares',cost:10,desc:'Desbloqueia o Pulsar perfurante.',needs:['precision']},
  {id:'neutron',category:'Astrofísica avançada',name:'Matéria degenerada',cost:16,desc:'Desbloqueia a estrela de nêutrons.',needs:['pulsar']},
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
  const choice=(q,options,correct,why)=>({kind:'choice',q,options,correct,why})
  const task=(kind,q,why,extra={})=>({kind,q,why,...extra})
  return [
   [task('focus','Posicione o Sol em um foco desta elipse.','O Sol ocupa um dos focos da órbita elíptica. O centro geométrico só coincide com os focos no caso circular.'),choice('Qual defesa derrete um cometa de gelo?',['Marte: plasma','Urano: criogenia','Uma barreira sem ataque'],0,'Neste jogo, plasma é eficaz contra gelo. Cometas reais sublimam quando recebem energia do Sol.'),task('speed','Marque o ponto de maior velocidade nesta mesma órbita.','A velocidade é máxima no periélio e mínima no afélio da mesma órbita elíptica.')],
   [task('focus','Arraste o Sol até um dos focos.','Os focos ficam no eixo maior. O Sol não precisa ocupar o centro geométrico.'),task('eccentricity','Ajuste a excentricidade para 0,60.','Excentricidade zero corresponde a uma circunferência; valores entre zero e um descrevem elipses.',{target:.6}),choice('Uma órbita circular é compatível com o modelo de elipse?',['Sim: é uma elipse com e = 0','Não: círculos nunca são órbitas','Só quando não há gravidade'],0,'A circunferência é um caso particular de elipse, com focos coincidentes.')],
   [task('speed','Escolha onde este planeta se move mais rápido.','Pela lei das áreas, a maior velocidade ocorre no periélio da mesma elipse.'),task('areas','Compare os setores: qual afirmação vale para tempos iguais?','Os setores varridos a partir do foco têm áreas iguais, mesmo com arcos de comprimentos diferentes.'),choice('No afélio desta mesma órbita, a velocidade é...',['A menor da órbita','A maior da órbita','Sempre zero'],0,'O corpo continua em movimento no afélio; sua velocidade é mínima ali.')],
   [task('order','Ordene as órbitas pelo período, do menor para o maior.','Ao redor da mesma massa central, T cresce como a³ᐟ².'),task('period','Ajuste o semieixo maior até o período ser 8 anos.','Com a em unidades astronômicas e massa central de um Sol, T = a³ᐟ² anos. Para T = 8, a = 4.',{target:8}),choice('Ao redor da mesma estrela, dobrar a muda T por...',['2√2 ≈ 2,83','2','4'],0,'T² ∝ a³. Quando a dobra, T é multiplicado por √8 = 2√2.')],
   [task('gravity','Dobre a distância e observe a força relativa.','Mantendo as massas, F cai a um quarto porque a distância está ao quadrado.',{target:.25}),task('mass','Ajuste a massa para dobrar a atração.','A força é diretamente proporcional a cada massa quando a distância permanece fixa.',{target:2}),choice('Qual expressão calcula a força gravitacional clássica?',['F = G·M·m/r²','F = G·M·m·r²','F = G/r'],0,'A força depende do produto das massas e do inverso do quadrado da distância.')],
   [task('escape','Selecione a velocidade mínima ideal para escapar.','vₑ = √(2GM/r). No modelo com G = M = r = 1, vₑ = √2 ≈ 1,414.',{target:Math.SQRT2}),task('mass','Dobre a massa central sem mudar a distância.','Uma massa central maior aumenta a atração na mesma distância.',{target:2}),choice('A massa de um planeta altera a velocidade de escape desse planeta?',['Sim: vₑ cresce com √M','Não: só a cor importa','Sim: ela diminui sempre'],0,'A velocidade de escape ideal da superfície depende de M e do raio r do planeta.')],
   [task('gravity','Configure a distância para obter F/F₀ = 0,25.','Dobrar a distância divide a força por quatro.',{target:.25}),choice('O que produz as marés?',['A diferença da gravidade entre partes de um corpo','A gravidade desaparecer durante a noite','A cor azul do planeta'],0,'O gradiente do campo gravitacional produz diferenças de atração entre regiões de um corpo.'),task('areas','Compare áreas varridas em intervalos iguais.','Conservar a taxa de área varrida exige acelerar perto do foco e desacelerar longe dele.')],
   [choice('Um pulsar é geralmente...',['Uma estrela de nêutrons em rotação','Um planeta gasoso','Um cometa metálico'],0,'A rotação faz os feixes de um pulsar cruzarem nossa linha de visão, produzindo pulsos.'),task('escape','Defina a velocidade de escape ideal para G = M = r = 1.','O valor ideal é √2, sem atmosfera e sem propulsão adicional.',{target:Math.SQRT2}),choice('Qual modelo é necessário para descrever o horizonte de um buraco negro?',['Relatividade geral','Apenas a lei das áreas','A escala de temperatura'],0,'A gravitação newtoniana é uma aproximação. Horizontes de eventos exigem relatividade geral.')]
  ]
 }
}
