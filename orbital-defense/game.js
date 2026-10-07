const canvas=document.getElementById('gameCanvas')
const ctx=canvas.getContext('2d')
const energyValue=document.getElementById('energyValue')
const healthValue=document.getElementById('healthValue')
const waveValue=document.getElementById('waveValue')
const checkpointValue=document.getElementById('checkpointValue')
const cardDeck=document.getElementById('cardDeck')
const deckPanel=document.querySelector('.deck-panel')
const gameWrap=document.querySelector('.game-wrap')
const gameStage=document.getElementById('gameStage')
const towerPanel=document.getElementById('towerPanel')
const towerPanelClose=document.getElementById('towerPanelClose')
const towerPanelImg=document.getElementById('towerPanelImg')
const towerPanelName=document.getElementById('towerPanelName')
const towerPanelLevel=document.getElementById('towerPanelLevel')
const towerPanelStats=document.getElementById('towerPanelStats')
const towerUpgradePreview=document.getElementById('towerUpgradePreview')
const upgradeTowerBtn=document.getElementById('upgradeTowerBtn')
const sellTowerBtn=document.getElementById('sellTowerBtn')
const startWaveBtn=document.getElementById('startWaveBtn')
const pauseBtn=document.getElementById('pauseBtn')
const missionTitle=document.getElementById('missionTitle')
const missionProgress=document.getElementById('missionProgress')
const checkpointTrack=document.getElementById('checkpointTrack')
const statusText=document.getElementById('statusText')
const hintText=document.getElementById('hintText')
const toast=document.getElementById('toast')
const tooltip=document.getElementById('tooltip')
const modal=document.getElementById('modal')
const modalClose=document.getElementById('modalClose')
const modalAction=document.getElementById('modalAction')
const modalTitle=document.getElementById('modalTitle')
const modalText=document.getElementById('modalText')
const modalKicker=document.getElementById('modalKicker')
const mentorImg=document.getElementById('mentorImg')
const formulaBox=document.getElementById('formulaBox')
const quizModal=document.getElementById('quizModal')
const quizKicker=document.getElementById('quizKicker')
const quizPhase=document.getElementById('quizPhase')
const quizMentor=document.getElementById('quizMentor')
const quizQuestion=document.getElementById('quizQuestion')
const quizOptions=document.getElementById('quizOptions')
const quizFeedback=document.getElementById('quizFeedback')
const quizContinue=document.getElementById('quizContinue')
const pregameOverlay=document.getElementById('pregameOverlay')
const physicsTitle=document.getElementById('physicsTitle')
const physicsText=document.getElementById('physicsText')
const lawBadge=document.getElementById('lawBadge')
const labBtn=document.getElementById('labBtn')
const labModal=document.getElementById('labModal')
const labClose=document.getElementById('labClose')
const massSlider=document.getElementById('massSlider')
const distanceSlider=document.getElementById('distanceSlider')
const massOut=document.getElementById('massOut')
const distanceOut=document.getElementById('distanceOut')
const forceOut=document.getElementById('forceOut')
const gravityPulse=document.getElementById('gravityPulse')
const gravityPlanet=document.getElementById('gravityPlanet')

const W=1280,H=720
const laneY=[150,255,360,465,570]
const laneSpeed=[1.35,1.18,1,.86,.74]
const gridX=[300,410,520,630,740,850,960]
const sun={x:112,y:360,r:74}
const damageNames={kinetic:'Cinético',plasma:'Plasma',gravity:'Gravitacional',cryo:'Criogênico',pierce:'Perfurante',solar:'Solar',electric:'Elétrico'}
const damageShort={kinetic:'KIN',plasma:'PLA',gravity:'GRAV',cryo:'CRIO',pierce:'PERF',solar:'SOL',electric:'ELEC'}
const damageColors={kinetic:'#ffd05d',plasma:'#ff7656',gravity:'#b77cff',cryo:'#67eaff',pierce:'#eaf7ff',solar:'#ffe56d',electric:'#70f1ff'}

const imgs={}
const imageMap={
 sun:'sun_core.png',miniSun:'mini_sun.png',mercury:'mercury.png',venus:'venus.png',earth:'earth.png',mars:'mars.png',jupiter:'jupiter_barrier.png',saturn:'saturn_barrier.png',uranus:'uranus.png',neptune:'neptune.png',gravity:'gravity_well.png',asteroid:'asteroid_small.png',armored:'asteroid_medium.png',spiky:'asteroid_spiky.png',ice:'comet_ice.png',fire:'meteor_fire.png',shield:'asteroid_shield.png',swarm:'asteroid_swarm.png',crystal:'asteroid_crystal.png',boss:'boss_rogue.png',blackhole:'boss_blackhole.png',binary:'boss_binary.png',bossComet:'boss_comet.png',bossSolar:'boss_solar.png',bossSerpent:'boss_serpent.png',energy:'icon_energy.png',star:'icon_star.png',explosion:'effect_explosion.png'
}


const unitDefs={
 miniSun:{name:'Mini Sol',cost:60,img:'miniSun',desc:'Gera energia estelar',damage:0,rate:8.5,range:0,hp:110,kind:'harvest',damageType:'solar',color:'#ffd661',tip:'Gera energia periodicamente. Upgrades aumentam a produção e reduzem o intervalo.'},
 mercury:{name:'Mercúrio',cost:95,img:'mercury',desc:'Tiro cinético preciso',damage:33,rate:2.15,range:900,hp:110,kind:'shot',damageType:'kinetic',color:'#ffd05d',tip:'Cinético funciona bem contra rocha comum e cristal, mas perde eficiência em blindagem pesada.'},
 venus:{name:'Vênus',cost:175,img:'venus',desc:'Explosão solar em área',damage:58,rate:3.55,range:820,hp:155,kind:'solarburst',damageType:'solar',color:'#ffe56d',tip:'Energia solar explode em área. É ótima contra enxames e cristais, mas fraca contra anomalias solares.'},
 mars:{name:'Marte',cost:145,img:'mars',desc:'Plasma que deixa queimadura',damage:48,rate:3.0,range:850,hp:135,kind:'burn',damageType:'plasma',color:'#ff7152',tip:'Plasma derrete gelo e mantém dano por queimadura. Meteoros ígneos resistem bastante.'},
 earth:{name:'Terra',cost:165,img:'earth',desc:'Impacto gravitacional + lentidão',damage:35,rate:3.15,range:830,hp:150,kind:'slow',damageType:'gravity',color:'#aa7dff',tip:'Gravidade desacelera alvos rápidos e causa dano extra em escudos energéticos.'},
 uranus:{name:'Urano',cost:180,img:'uranus',desc:'Rajada criogênica',damage:40,rate:3.4,range:800,hp:145,kind:'cryo',damageType:'cryo',color:'#67eaff',tip:'Criogenia é a melhor resposta contra meteoros superaquecidos e reduz bastante a velocidade.'},
 neptune:{name:'Netuno',cost:205,img:'neptune',desc:'Raio elétrico encadeado',damage:42,rate:3.3,range:820,hp:150,kind:'chain',damageType:'electric',color:'#70f1ff',tip:'Eletricidade salta entre inimigos próximos e descarrega escudos, ideal para grupos protegidos.'},
 jupiter:{name:'Júpiter',cost:175,img:'jupiter',desc:'Barreira gasosa colossal',damage:0,rate:0,range:0,hp:1250,kind:'barrier',damageType:'gravity',color:'#d29c70',blockDamageMultiplier:.55,tip:'Júpiter funciona como uma muralha: não ataca, mas segura inimigos por muito tempo e recebe menos dano de contato.'},
 saturn:{name:'Saturno',cost:155,img:'saturn',desc:'Barreira gasosa de anéis',damage:0,rate:0,range:0,hp:930,kind:'barrier',damageType:'pierce',color:'#e8c8a0',blockDamageMultiplier:.68,tip:'Saturno é uma barreira resistente e mais barata. Use-o à frente das torres para ganhar tempo.'},
 gravity:{name:'Poço G',cost:205,img:'gravity',desc:'Controle extremo de trajetória',damage:14,rate:4.65,range:205,hp:175,kind:'well',damageType:'gravity',color:'#b46fff',tip:'O Poço G prende grupos por pulsos longos e aplica vulnerabilidade gravitacional.'}
}

const enemyDefs={
 asteroid:{name:'Asteroide',tag:'ROCHA',hp:105,speed:27,coreDamage:1,size:62,img:'asteroid',reward:18,armor:0,shield:0,contactDps:19,behavior:'normal',resist:{kinetic:1.2,plasma:1,gravity:1,cryo:.9,pierce:1,solar:1,electric:.95}},
 armored:{name:'Asteroide blindado',tag:'ARM',hp:230,speed:20,coreDamage:1,size:78,img:'armored',reward:31,armor:13,shield:0,contactDps:24,behavior:'armor',resist:{kinetic:.58,plasma:.82,gravity:1,cryo:.8,pierce:1.65,solar:.92,electric:.9}},
 spiky:{name:'Asteroide espinhoso',tag:'PESADO',hp:185,speed:23,coreDamage:1,size:82,img:'spiky',reward:28,armor:7,shield:0,contactDps:29,behavior:'rage',resist:{kinetic:.86,plasma:1,gravity:1.05,cryo:.86,pierce:1.28,solar:1.05,electric:.9}},
 ice:{name:'Cometa de gelo',tag:'GELO',hp:145,speed:39,coreDamage:1,size:76,img:'ice',reward:25,armor:1,shield:0,contactDps:18,behavior:'skater',resist:{kinetic:1,plasma:1.7,gravity:1.05,cryo:.25,pierce:.95,solar:1.25,electric:1}},
 fire:{name:'Meteoro ígneo',tag:'FOGO',hp:155,speed:51,coreDamage:1,size:86,img:'fire',reward:30,armor:2,shield:0,contactDps:25,behavior:'rage',resist:{kinetic:1,plasma:.28,gravity:1,cryo:1.85,pierce:.9,solar:.5,electric:.95}},
 shield:{name:'Asteroide escudado',tag:'ESCUDO',hp:165,speed:22,coreDamage:1,size:80,img:'shield',reward:40,armor:4,shield:145,contactDps:22,behavior:'shieldRegen',shieldRegen:7,resist:{kinetic:.86,plasma:1.05,gravity:1.55,cryo:.82,pierce:1,solar:1,electric:1.5}},
 swarm:{name:'Enxame orbital',tag:'ENXAME',hp:92,speed:44,coreDamage:1,size:88,img:'swarm',reward:25,armor:0,shield:0,contactDps:16,behavior:'split',splitOnDeath:2,resist:{kinetic:.88,plasma:1.3,gravity:1.55,cryo:1.05,pierce:.68,solar:1.55,electric:1.45}},
 crystal:{name:'Asteroide cristalino',tag:'CRISTAL',hp:205,speed:25,coreDamage:1,size:78,img:'crystal',reward:35,armor:4,shield:0,contactDps:21,behavior:'regen',regen:8,resist:{kinetic:1.45,plasma:.48,gravity:.85,cryo:1,pierce:1.18,solar:1.5,electric:.8}},
 phase:{name:'Fragmento de fase',tag:'FASE',hp:150,speed:30,coreDamage:1,size:74,img:'shield',reward:38,armor:2,shield:55,contactDps:20,behavior:'phase',resist:{kinetic:.62,plasma:.7,gravity:1.35,cryo:.7,pierce:1.3,solar:.82,electric:1.35}},
 boss:{name:'Planeta errante',tag:'BOSS',hp:1050,speed:14,coreDamage:3,size:142,img:'boss',reward:155,armor:11,shield:210,contactDps:34,behavior:'boss',shieldRegen:5,resist:{kinetic:.82,plasma:.88,gravity:1.2,cryo:.78,pierce:1.2,solar:.9,electric:1.1}},
 binary:{name:'Binário hostil',tag:'BINÁRIO',hp:1220,speed:13,coreDamage:3,size:150,img:'binary',reward:170,armor:8,shield:250,contactDps:32,behavior:'phase',resist:{kinetic:.9,plasma:.9,gravity:1.35,cryo:.85,pierce:1.05,solar:1,electric:1.2}},
 blackhole:{name:'Microburaco negro',tag:'VÓRTICE',hp:1520,speed:11,coreDamage:4,size:152,img:'blackhole',reward:220,armor:6,shield:340,contactDps:38,behavior:'vortex',resist:{kinetic:.5,plasma:.62,gravity:.4,cryo:.62,pierce:1.45,solar:.75,electric:.82}}
}

const waves=[
 {title:'Fase 1 · Geometria das órbitas',lesson:0,spawns:[['asteroid',7],['armored',3],['swarm',3],['spiky',3]]},
 {title:'Fase 2 · Periélio em alta velocidade',lesson:1,spawns:[['asteroid',3],['ice',5],['fire',5],['swarm',3],['phase',2]]},
 {title:'Fase 3 · Distância e período orbital',lesson:2,spawns:[['armored',4],['shield',4],['crystal',4],['phase',3],['fire',3]]},
 {title:'Fase 4 · A força invisível',lesson:3,spawns:[['shield',4],['armored',3],['swarm',4],['crystal',4],['phase',3],['boss',1]]},
 {title:'Fase 5 · Colapso gravitacional',lesson:4,spawns:[['fire',4],['ice',4],['shield',4],['crystal',3],['phase',3],['binary',1],['blackhole',1]]}
]

const lessons=[
 {kicker:'1ª LEI DE KEPLER',title:'Órbitas são elipses',text:'Kepler mostrou que os planetas descrevem órbitas elípticas, com o Sol ocupando um dos focos. Você acabou de atravessar três checkpoints sobre a geometria orbital.',formula:'Órbita planetária = elipse',mentor:assetPath('kepler.png')},
 {kicker:'2ª LEI DE KEPLER',title:'Mais perto do Sol, mais rápido',text:'Áreas iguais são varridas em tempos iguais. Por isso um corpo em órbita elíptica acelera ao se aproximar do Sol e desacelera quando se afasta.',formula:'ΔA / Δt = constante',mentor:assetPath('kepler.png')},
 {kicker:'3ª LEI DE KEPLER',title:'Distância muda o período',text:'Ao redor da mesma massa central, o quadrado do período é proporcional ao cubo do semieixo maior. A comparação usa planetas com massas desprezíveis frente à estrela.',formula:'T² ∝ a³',mentor:assetPath('kepler.png')},
 {kicker:'NEWTON',title:'Gravidade depende de massa e distância',text:'A força gravitacional cresce com as massas e cai com o quadrado da distância. Dobrar a distância reduz a força para um quarto.',formula:'F = G · M · m / r²',mentor:assetPath('newton.png')},
 {kicker:'SÍNTESE',title:'Kepler descreve. Newton explica.',text:'As leis de Kepler descrevem o comportamento das órbitas; a gravitação de Newton explica a interação que sustenta esse movimento. O sistema final mistura velocidade, distância, massa e resistência.',formula:'Kepler + Newton = estratégia',mentor:assetPath('newton.png')}
]

const questions=[
 [
  {q:'Segundo a 1ª Lei de Kepler, qual forma representa melhor a órbita de um planeta?',options:['Uma elipse','Um quadrado','Uma espiral que sempre fecha','Uma linha reta'],correct:0,why:'As órbitas planetárias são elipses, com o Sol em um dos focos.'},
  {q:'Em uma órbita elíptica, onde fica o Sol?',options:['Exatamente no centro geométrico','Em um dos focos da elipse','Na extremidade mais distante','Fora do plano da órbita'],correct:1,why:'A 1ª Lei coloca o Sol em um dos focos, não necessariamente no centro da elipse.'},
  {q:'Uma órbita perfeitamente circular pode ser usada como simplificação, mas o modelo de Kepler afirma que a trajetória real é...',options:['Elíptica','Triangular','Parabólica em todos os casos','Imóvel'],correct:0,why:'A elipse é a forma orbital descrita pela 1ª Lei de Kepler.'}
 ],
 [
  {q:'Quando um planeta se aproxima do periélio, sua velocidade orbital tende a...',options:['Aumentar','Diminuir','Zerar','Permanecer sempre idêntica'],correct:0,why:'Pela 2ª Lei, o planeta se move mais rápido quando está mais próximo do Sol.'},
  {q:'A 2ª Lei de Kepler afirma que a linha planeta–Sol varre...',options:['Áreas iguais em tempos iguais','Distâncias iguais em tempos iguais','Ângulos iguais apenas no periélio','Volumes iguais em tempos diferentes'],correct:0,why:'Essa é a chamada Lei das Áreas.'},
  {q:'No afélio, ponto mais distante do Sol, o planeta está geralmente...',options:['Mais lento','Mais rápido','Sem gravidade','Com velocidade infinita'],correct:0,why:'O planeta desacelera na região mais distante e acelera perto do periélio.'}
 ],
 [
  {q:'Comparando dois planetas, o mais distante do Sol tende a ter um período orbital...',options:['Maior','Menor','Sempre igual','Nulo'],correct:0,why:'Órbitas maiores exigem mais tempo para completar uma revolução.'},
  {q:'Qual relação resume a 3ª Lei de Kepler?',options:['T² ∝ a³','T ∝ 1/a²','F = m·a','v = d/t apenas'],correct:0,why:'O quadrado do período é proporcional ao cubo do semieixo maior.'},
  {q:'Se o semieixo maior de uma órbita aumenta, o período orbital tende a...',options:['Aumentar','Diminuir sempre pela metade','Virar zero','Não sofrer nenhuma mudança'],correct:0,why:'A 3ª Lei conecta diretamente órbitas maiores a períodos maiores.'}
 ],
 [
  {q:'Se a distância entre dois corpos dobra e as massas não mudam, a força gravitacional fica...',options:['1/4 do valor','2 vezes maior','4 vezes maior','Igual'],correct:0,why:'A gravidade varia com 1/r². Dobrar r significa dividir a força por 2² = 4.'},
  {q:'Se uma das massas dobra e a distância permanece a mesma, a força gravitacional...',options:['Dobra','Cai pela metade','Fica quatro vezes menor','Não muda'],correct:0,why:'Na Lei da Gravitação Universal, a força é diretamente proporcional às massas.'},
  {q:'Qual expressão representa a Gravitação Universal de Newton?',options:['F = G·M·m/r²','E = m·c','P = m·g²','T² = r²/G'],correct:0,why:'A força depende do produto das massas e do inverso do quadrado da distância.'}
 ],
 [
  {q:'Um cometa está chegando muito perto do Sol em uma órbita elíptica. O que você espera da velocidade dele nessa região?',options:['Ela aumenta','Ela diminui até zero','Ela independe da posição','Ela vira negativa'],correct:0,why:'Próximo do periélio, a velocidade orbital é maior.'},
  {q:'Para reduzir bastante a atração gravitacional sem alterar as massas, a mudança mais eficaz é...',options:['Aumentar a distância','Trocar a cor dos corpos','Diminuir o tempo','Aumentar a temperatura apenas'],correct:0,why:'Como a força depende de 1/r², a distância tem efeito quadrático.'},
  {q:'Qual combinação resume corretamente o conteúdo da missão?',options:['Kepler descreve as órbitas e Newton explica a gravidade','Newton criou as três leis de Kepler','Kepler afirmou que não existe gravidade','As órbitas não dependem de velocidade nem distância'],correct:0,why:'As leis de Kepler descrevem o movimento orbital; Newton fornece a explicação gravitacional clássica.'}
 ]
]

const superBosses=[
 {name:'SUPERBOSS · Colosso Binário',img:'binary',hp:1900,speed:10,size:178,armor:13,shield:420,coreDamage:3,contactDps:44,resist:{kinetic:.72,plasma:.78,gravity:1.05,cryo:.72,pierce:1.2,solar:.85,electric:1.05}},
 {name:'SUPERBOSS · Cometa Titã',img:'bossComet',hp:2300,speed:15,size:182,armor:10,shield:360,coreDamage:3,contactDps:48,resist:{kinetic:.82,plasma:.35,gravity:1,cryo:1.7,pierce:1.05,solar:.38,electric:.95}},
 {name:'SUPERBOSS · Planeta Errante Ω',img:'boss',hp:2800,speed:9.5,size:188,armor:17,shield:520,coreDamage:4,contactDps:54,resist:{kinetic:.62,plasma:.75,gravity:1.15,cryo:.68,pierce:1.42,solar:.82,electric:1.1}},
 {name:'SUPERBOSS · Anomalia Solar',img:'bossSolar',hp:3350,speed:10.5,size:186,armor:11,shield:650,coreDamage:4,contactDps:58,resist:{kinetic:.78,plasma:.25,gravity:1.12,cryo:1.8,pierce:1.12,solar:.22,electric:.9}},
 {name:'SUPERBOSS · Serpente do Vazio',img:'bossSerpent',hp:4100,speed:9,size:205,armor:19,shield:800,coreDamage:5,contactDps:64,resist:{kinetic:.58,plasma:.62,gravity:.55,cryo:.7,pierce:1.55,solar:.7,electric:.75}}
]

Content.install(unitDefs,enemyDefs,waves,lessons,questions,imageMap)
for(const [i,key] of ['binarySuper','bossComet','boss','bossSolar','bossSerpent'].entries())superBosses[i].img='enemy_'+key
imageMap.energy=imageMap.miniSun
const requiredImages=new Set(['sun','energy',...Object.values(unitDefs).map(u=>u.img),...Object.values(enemyDefs).map(e=>e.img),...superBosses.map(b=>b.img)])
for(const key of Object.keys(imageMap))if(!requiredImages.has(key))delete imageMap[key]
for(const [k,v] of Object.entries(imageMap)){const i=new Image();i.src=`${assetPath(v)}`;imgs[k]=i}

let selected='mercury'
let energy=520
let health=5
let waveIndex=0
let running=false
let paused=false
let gameOver=false
let gameStarted=false
let sunAppear=0
let defenders=[]
let enemies=[]
let projectiles=[]
let particles=[]
let energyOrbs=[]
let spawnQueue=[]
let spawnTimer=0
let waveSpawned=0
let waveTotal=0
let last=performance.now()
let passiveTimer=0
let orbTimer=0
let starfield=[]
let hoverCell=null
let checkpointIndex=0
let checkpointStates=[null,null,null]
let checkpointInProgress=false
let pendingSuperboss=null
let penaltyBossActive=false
let phaseCompletePending=false
let modalMode='lesson'
let selectedTower=null
let speedScale=1
let gameMode='campaign'
let endlessRound=1
let randomModifier=null
let orbitConfig={e:.45,v:1,bonus:false}
let runStats={kills:0,score:0,correct:0,superbosses:0,barriersLost:0,types:[],energyCollected:0}
let initialHealth=8
let powerCharges={flare:1,freeze:1,shift:2,slingshot:1,eclipse:1,supernova:1}
let powerMode=null
let simTime=0
let saveTimer=0
let globalFreeze=0
let temporaryBuff=0
let shake=0
let cinematic=0
let nextEntityId=1
let floatingTexts=[]
let fps=60
let debugState={invincible:false,hitboxes:false,fps:false,slow:false}
let tutorialStep=0
let tutorialDone=false
let keyboardCell={lane:0,col:0}
let lastUIUpdate=0
let snapshotPreview=''

function difficultyStats(){return ({student:{hp:.8,speed:.85,energy:1.15,health:12},standard:{hp:1,speed:1,energy:1,health:8},expert:{hp:1.3,speed:1.1,energy:.8,health:6}})[Progress.data.settings.difficulty]||{hp:1,speed:1,energy:1,health:8}}
function unitUnlockStage(id){return Content.unitUnlockStages?.[id]??99}
function isUnlocked(id){
 const stage=unitUnlockStage(id)
 if(id==='jupiter'&&waveIndex===0&&gameMode==='campaign')return checkpointIndex>=1||Progress.data.unlocked>1
 const reached=Math.max(0,(Progress.data.unlocked||1)-1)
 return stage<=reached
}
function unlockLabel(id){
 const stage=unitUnlockStage(id)
 if(id==='jupiter'&&Progress.data.unlocked<=1)return '🔒 Checkpoint'
 return stage<99?`🔒 Fase ${stage+1}`:'🔒'
}
function canPlace(id){return isUnlocked(id)&&!(randomModifier==='noSun'&&id==='miniSun')}
function nearby(d,type,radius=175){return defenders.some(n=>n!==d&&n.type===type&&Math.hypot(n.x-d.x,n.y-d.y)<=radius)}
function towerSynergies(d){return Content.synergies.filter(s=>s.a===d.type?(s.b==='moon'?!!d.moon:nearby(d,s.b)):s.b===d.type?nearby(d,s.a):false)}
function getBranch(d){return d.branch?Content.branches[d.type][d.branch==='a'?0:1][2]:{}}
function currentDamageType(d){return getBranch(d).type||unitDefs[d.type].damageType}
function addText(x,y,text,color){if(!Progress.data.settings.numbers)return;if(floatingTexts.length>70)floatingTexts.shift();floatingTexts.push({x,y,text,color,life:.85})}
function saveRun(){
 if(gameOver||phaseCompletePending)return
 Progress.data.chapter=Math.min(7,waveIndex)
 Progress.data.resume={version:2,waveIndex,energy,health,initialHealth,gameMode,endlessRound,randomModifier,orbitConfig,runStats,powerCharges,simTime,spawnQueue:[...spawnQueue],spawnTimer,waveSpawned,waveTotal,checkpointIndex,checkpointStates:[...checkpointStates],pendingSuperboss,penaltyBossActive,running,gameStarted,defenders:JSON.parse(JSON.stringify(defenders)),enemies:JSON.parse(JSON.stringify(enemies)),energyOrbs:JSON.parse(JSON.stringify(energyOrbs)),selected,tutorialStep,tutorialDone,nextEntityId}
 Progress.persist()
}
function loadRun(){
 const r=Progress.data.resume
 if(!r||r.version!==2||!Array.isArray(r.defenders)||!Array.isArray(r.enemies))return false
 waveIndex=Math.max(0,Math.min(7,r.waveIndex||0));energy=Math.max(0,Math.min(9999,r.energy||0));health=Math.max(1,r.health||8);initialHealth=r.initialHealth||8;gameMode=r.gameMode||'campaign';endlessRound=r.endlessRound||1;randomModifier=r.randomModifier||null;orbitConfig=r.orbitConfig||{e:.45,v:1,bonus:false};runStats={kills:0,score:0,correct:0,superbosses:0,barriersLost:0,types:[],energyCollected:0,...r.runStats};powerCharges={...powerCharges,...r.powerCharges};simTime=r.simTime||0;spawnQueue=(r.spawnQueue||[]).filter(t=>enemyDefs[t]);spawnTimer=r.spawnTimer||1;waveSpawned=r.waveSpawned||0;waveTotal=r.waveTotal||0;checkpointIndex=Math.min(3,r.checkpointIndex||0);checkpointStates=r.checkpointStates||[null,null,null];pendingSuperboss=r.pendingSuperboss||null;penaltyBossActive=!!r.penaltyBossActive;running=!!r.running;gameStarted=!!r.gameStarted;defenders=r.defenders.filter(d=>unitDefs[d.type]);enemies=r.enemies.filter(e=>e.type==='superboss'||enemyDefs[e.type]);energyOrbs=r.energyOrbs||[];selected=unitDefs[r.selected]?r.selected:'mercury';tutorialStep=r.tutorialStep||0;tutorialDone=!!r.tutorialDone;nextEntityId=r.nextEntityId||1000;projectiles=[];paused=running;gameOver=false;sunAppear=gameStarted?1:0;checkpointInProgress=false;phaseCompletePending=false
 for(const [i,mark] of [...checkpointTrack.children].entries())mark.className=checkpointStates[i]==='ok'?'active':checkpointStates[i]==='failed'?'failed':''
 startWaveBtn.disabled=false;startWaveBtn.textContent=running?'Continuar batalha':'Iniciar batalha';missionTitle.textContent=waves[waveIndex].title;pregameOverlay.classList.toggle('hidden-start',running);buildDeck();updateHud();updatePreparation();statusText.textContent=running?'Progresso retomado · pausado':'Preparação retomada';return true
}
function updatePreparation(){
 if(typeof Interface!=='undefined'){Interface.preview();Interface.tutorial();Interface.powers()}
}
function startStage(index,mode='campaign',modifier=null){
 modal.classList.add('hidden');quizModal.classList.add('hidden');labModal.classList.add('hidden')
 waveIndex=index;gameMode=mode;endlessRound=1;randomModifier=modifier;resetGame(index);saveRun();if(typeof TutorialGuide!=='undefined'){TutorialGuide.scanUnlocks('campaign');TutorialGuide.resumeUnlocks()}
}


function buildDeck(){
 const scrollX=cardDeck.scrollLeft,scrollY=cardDeck.scrollTop;cardDeck.innerHTML=''
 for(const [id,u] of Object.entries(unitDefs)){
  const el=document.createElement('button'),unlocked=canPlace(id)
  el.className='unit-card'+(id===selected?' selected':'')+(unlocked?'':' locked');el.dataset.unit=id;el.setAttribute('aria-pressed',id===selected);el.title=u.tip;el.setAttribute('aria-label',`${u.name}, ${u.desc}, ${u.cost} energia${unlocked?'':', ainda bloqueado'}`)
  const cycle=u.kind==='harvest'?`${u.rate.toFixed(1)}s / ciclo`:u.kind==='barrier'?`${u.hp} HP`:u.kind==='moon'?'anexar a planeta':u.kind==='probe'?'radar orbital':`${u.rate.toFixed(1)}s / tiro`
  el.innerHTML=`<img src="${assetPath(imageMap[u.img])}" alt=""><span class="unit-info"><strong>${u.name}</strong><span class="unit-meta"><span class="damage-tag" data-type="${u.damageType}">${u.kind==='barrier'?'BARREIRA':u.kind==='harvest'?'ECONOMIA':damageShort[u.damageType]}</span><p>${u.desc}</p></span></span><span class="cost-stack"><span class="cost">${unlocked?'✦ '+u.cost:unlockLabel(id)}</span><span class="rate-chip">${cycle}</span></span>`
  el.onclick=()=>{if(!unlocked){const st=unitUnlockStage(id);showToast(id==='jupiter'&&Progress.data.unlocked<=1?'Júpiter chega no primeiro checkpoint do tutorial.':`Esta construção é apresentada na fase ${st+1}.`);return}selected=id;powerMode=null;hideTowerPanel();document.querySelectorAll('.unit-card').forEach(c=>{c.classList.toggle('selected',c.dataset.unit===id);c.setAttribute('aria-pressed',c.dataset.unit===id)});physicsTitle.textContent=u.name+' · '+u.desc;physicsText.textContent=u.tip;lawBadge.textContent=u.kind==='barrier'?'Bloqueio orbital':u.kind==='harvest'?'Economia estelar':damageNames[u.damageType];showToast(`${u.name} selecionado`);if(typeof TutorialGuide!=='undefined')TutorialGuide.unitSelected?.(id);tutorialEvent(id==='miniSun'?'select-miniSun':id==='mercury'?'select-mercury':id==='jupiter'?'select-jupiter':'select-unit')}
  cardDeck.appendChild(el)
 }
 cardDeck.scrollLeft=scrollX;cardDeck.scrollTop=scrollY
}

function getTowerStats(tower,levelOverride=null){
 const u=unitDefs[tower.type],level=levelOverride||tower.level||1,branch=level>=3?getBranch(tower):{}
 let damage=u.damage*[1,1.3,1.7][level-1]*(branch.damage||1),rate=u.rate?u.rate*[1,.88,.75][level-1]*(branch.rate||1):0,range=u.range*[1,1.08,1.16][level-1]*(branch.range||1)
 if(Progress.has('precision')&&['mercury','pulsar'].includes(tower.type))damage*=1.15
 if(Progress.has('neutron')&&tower.type==='neutron')damage*=1.2
 if(Progress.has('gravity')&&['earth','gravity'].includes(tower.type))range*=1.2
 if(nearby(tower,'miniSun')){if(tower.type==='mars')damage*=1.2;if(tower.type==='mercury')damage*=1.15}
 if(tower.moon)range*=(tower.moon.branch==='b'?1.35:1.14+(tower.moon.level-1)*.04)*(Progress.has('moon')?1.08:1)
 if(nearby(tower,'probe',210)){range*=1.1;if(defenders.some(d=>d.type==='probe'&&d.branch==='b'&&Math.hypot(d.x-tower.x,d.y-tower.y)<210))rate*=.85}
 if(orbitConfig.bonus)damage*=1.1
 if(temporaryBuff>0)damage*=1.15
 return {level,damage,rate,range,maxHp:Math.round(u.hp*[1,1.4,1.9][level-1]*(branch.hp||1)*(Progress.has('defense')?1.2:1)),energyValue:Math.round(45*[1,1.35,1.8][level-1]*(branch.energy||1)*(Progress.has('economy')?1.2:1)*difficultyStats().energy),blockDamageMultiplier:Math.max(.23,(u.blockDamageMultiplier||1)-(u.kind==='barrier'?[0,.1,.18][level-1]:0)),damageType:currentDamageType(tower),branch}
}

function getUpgradeCost(tower){
 const u=unitDefs[tower.type]
 if((tower.level||1)>=3)return 0
 const mult=(tower.level||1)===1?.72:1.08
 return Math.max(25,Math.round(u.cost*mult/5)*5)
}

function towerStatsHtml(tower,stats){
 const u=unitDefs[tower.type]
 let html=`<span><b>HP</b>${Math.max(0,Math.ceil(tower.hp))}/${stats.maxHp}</span>`
 if(u.kind==='harvest')html+=`<span><b>Energia</b>+${stats.energyValue}</span><span><b>Próximo ciclo</b>${Math.max(0,tower.cooldown).toFixed(1)}s</span><span><b>Intervalo</b>${stats.rate.toFixed(1)}s</span>`
 else if(u.kind==='barrier')html+=`<span><b>Absorção</b>${Math.round((1-stats.blockDamageMultiplier)*100)}%</span><span><b>Função</b>Bloqueio</span><span><b>Contato</b>${tower.type==='saturn'?'Anéis':stats.branch.reflect?'Reflexão':'Campo'}</span>`
 else html+=`<span><b>Dano</b>${Math.round(stats.damage)} · ${damageShort[stats.damageType]}</span><span><b>Cadência</b>${stats.rate.toFixed(2)}s</span><span><b>Alcance</b>${Math.round(stats.range)}</span>`
 return html
}

function towerUpgradeText(tower){
 const level=tower.level||1
 if(level>=3)return 'Nível máximo alcançado.'
 const current=getTowerStats(tower,level)
 const next=getTowerStats(tower,level+1)
 const u=unitDefs[tower.type]
 if(u.kind==='harvest')return `Próximo nível: +${next.energyValue} energia a cada ${next.rate.toFixed(1)}s e ${next.maxHp} HP.`
 if(u.kind==='barrier')return `Próximo nível: ${next.maxHp} HP e ${Math.round((1-next.blockDamageMultiplier)*100)}% de absorção de dano de contato.`
 return `Próximo nível: ${Math.round(next.damage)} de dano, ${next.rate.toFixed(2)}s de cadência e ${Math.round(next.range)} de alcance.`
}

function showTowerPanel(tower){
 selectedTower=tower;const u=unitDefs[tower.type],stats=getTowerStats(tower)
 towerPanelImg.src=`${assetPath(imageMap[u.img])}`;towerPanelName.textContent=u.name;towerPanelLevel.textContent=`Nível ${tower.level||1}${tower.branch?' · '+Content.branches[tower.type][tower.branch==='a'?0:1][0]:''}`;towerPanelStats.innerHTML=towerStatsHtml(tower,stats)
 const synergies=towerSynergies(tower)
 towerUpgradePreview.textContent=(tower.level>=3?Content.branches[tower.type][tower.branch==='b'?1:0][1]:towerUpgradeText(tower))+(synergies.length?' · '+synergies.map(s=>'✧ '+s.name).join(' / '):'')
 const cost=getUpgradeCost(tower);upgradeTowerBtn.textContent=tower.level>=3?'Nível máximo':`Melhorar · ✦ ${cost}`;upgradeTowerBtn.disabled=tower.level>=3||energy<cost||randomModifier==='noUpgrades'
 const branchPanel=document.getElementById('branchOptions');if(branchPanel){branchPanel.innerHTML='';branchPanel.classList.toggle('hidden',tower.level!==2);if(tower.level===2){upgradeTowerBtn.classList.add('hidden');Content.branches[tower.type].forEach(([name,desc],i)=>{const b=document.createElement('button');b.className='branch-option';b.innerHTML=`<strong>${name}</strong><span>${desc} · ✦ ${cost}</span>`;b.disabled=energy<cost||randomModifier==='noUpgrades';b.onclick=()=>upgradeSelectedTower(i===0?'a':'b');branchPanel.appendChild(b)})}else upgradeTowerBtn.classList.remove('hidden')}
 const special=document.getElementById('towerSpecial');if(special)special.textContent=u.tip+(tower.moon?' · Lua anexada: intercepta dano e amplia alcance.':'')+(tower.disabled>0?' · Temporariamente desativado.':'')
 const moonPanel=document.getElementById('moonOptions');if(moonPanel){moonPanel.innerHTML='';if(tower.moon){const m=tower.moon;moonPanel.innerHTML=`<span>☾ Lua · Lv ${m.level} · ${Math.ceil(m.hp)}/${m.maxHp} HP</span>`;const branches=m.level===2?['a','b']:[null];for(const branch of branches)if(m.level<3){const b=document.createElement('button');b.className='moon-upgrade';b.textContent=m.level===2?(branch==='a'?'Escudo de maré':'Observatório lunar')+' · ✦ 80':'Evoluir Lua · ✦ 55';b.disabled=energy<(m.level===2?80:55)||randomModifier==='noUpgrades';b.onclick=()=>upgradeMoon(tower,branch);moonPanel.appendChild(b)}}}
 sellTowerBtn.textContent=`Vender · +✦ ${Math.round(((tower.spent||u.cost)+(tower.moon?.spent||0))*.65)}`;towerPanel.classList.remove('hidden')
}

function upgradeMoon(host,branch=null){
 if(paused||gameOver||randomModifier==='noUpgrades'||!host.moon||host.moon.level>=3)return
 const moon=host.moon,cost=moon.level===2?80:55;if(energy<cost||moon.level===2&&!branch)return
 energy-=cost;moon.spent+=cost;moon.level++;if(branch)moon.branch=branch;const old=moon.maxHp;moon.maxHp=Math.round(180*[1,1.4,1.9][moon.level-1]*(branch==='a'?1.3:1));moon.hp=Math.min(moon.maxHp,moon.hp+moon.maxHp-old);AudioSystem.play('upgrade');showTowerPanel(host);updateHud();saveRun()
}

function hideTowerPanel(){
 selectedTower=null
 towerPanel.classList.add('hidden')
}

function upgradeSelectedTower(branch=null){
 if(!selectedTower||!defenders.includes(selectedTower)||paused||gameOver)return
 if(randomModifier==='noUpgrades'){showToast('Este desafio não permite upgrades.');return}
 const level=selectedTower.level||1;if(level>=3)return
 if(level===2&&!branch){showToast('Escolha uma das duas especializações.');return}
 const cost=getUpgradeCost(selectedTower);if(energy<cost){showToast('Energia insuficiente');return}
 const oldStats=getTowerStats(selectedTower);energy-=cost;selectedTower.spent=(selectedTower.spent||unitDefs[selectedTower.type].cost)+cost;selectedTower.level=level+1;if(branch)selectedTower.branch=branch
 const stats=getTowerStats(selectedTower);selectedTower.maxHp=stats.maxHp;selectedTower.hp=Math.min(stats.maxHp,selectedTower.hp+stats.maxHp-oldStats.maxHp+stats.maxHp*.12);selectedTower.cooldown=Math.min(selectedTower.cooldown||0,stats.rate||0);burst(selectedTower.x,selectedTower.y,'#d88cff',20);AudioSystem.play('upgrade');tutorialEvent('upgrade');updateHud();showTowerPanel(selectedTower);saveRun()
}

function sellSelectedTower(){
 if(!selectedTower||!defenders.includes(selectedTower)||paused||gameOver)return
 const tower=selectedTower,refund=Math.round(((tower.spent||unitDefs[tower.type].cost)+(tower.moon?.spent||0))*.65);energy=Math.min(9999,energy+refund);burst(tower.x,tower.y,'#d88cff',12);defenders=defenders.filter(d=>d!==tower);hideTowerPanel();updateHud();showToast(`Vendido · +${refund} energia`);saveRun()
}

function seededStars(){
 let s=9431
 const rnd=()=>{s=(s*9301+49297)%233280;return s/233280}
 starfield=Array.from({length:115},()=>({x:rnd()*W,y:rnd()*H,r:.4+rnd()*1.5,a:.2+rnd()*.65}))
}

function resetCheckpointUI(){
 checkpointIndex=0
 checkpointStates=[null,null,null]
 checkpointInProgress=false
 pendingSuperboss=null
 penaltyBossActive=false
 checkpointValue.textContent='0/3'
 ;[...checkpointTrack.children].forEach(i=>i.className='')
}

function resetGame(stage=0){
 waveIndex=Math.max(0,Math.min(7,stage));energy=waves[waveIndex].start+(Progress.has('battery')?120:0);initialHealth=difficultyStats().health;health=initialHealth;running=false;paused=false;gameOver=false;gameStarted=false;sunAppear=0;defenders=[];enemies=[];projectiles=[];particles=[];energyOrbs=[];floatingTexts=[];spawnQueue=[];passiveTimer=0;orbTimer=0;phaseCompletePending=false;simTime=0;lastUIUpdate=0;saveTimer=0;penaltyBossActive=false;temporaryBuff=0;globalFreeze=0;cinematic=0;shake=0;powerMode=null;orbitConfig={e:.45,v:1,bonus:false};runStats={kills:0,score:0,correct:0,superbosses:0,barriersLost:0,types:[],energyCollected:0};powerCharges={flare:1,freeze:1,shift:2,slingshot:1,eclipse:1,supernova:1};tutorialStep=0;tutorialDone=waveIndex!==0||Progress.data.achievements.includes('tutorial')||!!Progress.data.tutorialDismissed;hideTowerPanel();resetCheckpointUI();updateHud();missionTitle.textContent=waves[waveIndex].title;startWaveBtn.textContent='Iniciar batalha';startWaveBtn.disabled=false;statusText.textContent='Preparação · simulação congelada';hintText.textContent=waves[waveIndex].dialogue;missionProgress.style.width='0%';pregameOverlay.classList.remove('hidden-start');modalClose.style.display='block';buildDeck();updatePreparation()
 if(!Progress.available)showToast('Salvamento local indisponível. Exporte o progresso pelas configurações.')
}

function updateHud(){
 energyValue.textContent=Math.floor(energy);healthValue.textContent=Math.max(0,health);waveValue.textContent=gameMode==='endless'?`${endlessRound} ∞`:`${Math.min(waveIndex+1,8)}/8`;checkpointValue.textContent=`${checkpointIndex}/3`
 if(selectedTower&&defenders.includes(selectedTower)&&!towerPanel.classList.contains('hidden'))showTowerPanel(selectedTower)
 if(typeof Interface!=='undefined')Interface.powers()
}

function beginPhase(){
 const w=waves[waveIndex];spawnQueue=[]
 const formations=w.spawns.filter(([type])=>!['boss','binary','blackhole','cometBoss','neutronBoss'].includes(type));const bosses=w.spawns.filter(([type])=>['boss','binary','blackhole','cometBoss','neutronBoss'].includes(type))
 for(const [type,count] of formations)for(let i=0;i<count+(gameMode==='endless'?Math.floor(endlessRound/3):0);i++)spawnQueue.push(type)
 const training=gameMode==='campaign'?[...(w.trainingWave||[])]:[]
 for(const type of training){const i=spawnQueue.indexOf(type);if(i>=0)spawnQueue.splice(i,1)}
 for(let i=spawnQueue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[spawnQueue[i],spawnQueue[j]]=[spawnQueue[j],spawnQueue[i]]}
 spawnQueue=[...training,...spawnQueue]
 if(waveIndex===0&&gameMode==='campaign'){const i=spawnQueue.indexOf('asteroid');if(i>0)[spawnQueue[0],spawnQueue[i]]=[spawnQueue[i],spawnQueue[0]]}
 for(const [type,count] of bosses)for(let i=0;i<count;i++)spawnQueue.push(type)
 waveTotal=spawnQueue.length;waveSpawned=0;running=true;paused=false;gameStarted=true;spawnTimer=2;resetCheckpointUI();startWaveBtn.disabled=true;missionTitle.textContent=w.title;statusText.textContent=gameMode==='endless'?`Órbita infinita · onda ${endlessRound}`:'Batalha · sistema ativo';hintText.textContent=w.fact;missionProgress.style.width='0%';pregameOverlay.classList.add('hidden-start');sunAppear=.01;tutorialEvent('start');updatePreparation();updateHud();saveRun()
}

function startWave(){
 AudioSystem.unlock()
 if(running&&paused&&!checkpointInProgress&&typeof TutorialGuide!=='undefined'&&TutorialGuide.locksSimulation()){showToast('Conclua a ação destacada do tutorial antes de retomar a batalha.');TutorialGuide.render();return}
 if(running&&paused&&!checkpointInProgress){paused=false;startWaveBtn.disabled=true;if(pendingSuperboss){spawnSuperboss(pendingSuperboss.phase,pendingSuperboss.checkpoint);pendingSuperboss=null}statusText.textContent='Batalha · sistema ativo';return}
 if(running||gameOver)return
 beginPhase();AudioSystem.play('place');showToast('Mini Sóis ativados. Colete as partículas douradas.')
}

function createEnemy(type,laneOverride=null,override={}){
 const d=enemyDefs[type],config=difficultyStats(),lane=laneOverride===null?waves[waveIndex].lanes[Math.floor(Math.random()*waves[waveIndex].lanes.length)]:laneOverride,scaling=gameMode==='endless'?1+(endlessRound-1)*.2:1+waveIndex*.08,bossScale=['boss','binary','blackhole','cometBoss','neutronBoss'].includes(type)?waves[waveIndex].bossScale||1:1
 const hp=Math.round(d.hp*config.hp*scaling*bossScale),shield=Math.round(d.shield*config.hp*scaling*bossScale)
 return {id:nextEntityId++,type,name:d.name,tag:d.tag,lane,x:W+55,y:curveY(lane,W+55),hp,maxHp:hp,speed:d.speed*config.speed,size:d.size,img:d.img,reward:Math.round(d.reward*config.energy),coreDamage:d.coreDamage,armor:d.armor,shield,maxShield:shield,contactDps:d.contactDps,resist:{...d.resist},behavior:d.behavior||'normal',regen:d.regen||0,shieldRegen:d.shieldRegen||0,splitOnDeath:d.splitOnDeath||0,slow:1,slowTimer:0,flash:0,phase:Math.random()*6.2,phaseClock:0,burnTimer:0,burnDps:0,vulnerableTimer:0,hitTimer:0,isSuperboss:false,bossPhase:1,abilityTimer:7,freeze:0,lastLaneSwitch:0,escaped:false,...override}
}

function spawnEnemy(type){
 const w=waves[waveIndex],lanes=randomModifier==='inner'?[0,1]:w.lanes;let lane=lanes[Math.floor(Math.random()*lanes.length)]
 if(gameMode==='campaign'&&w.trainingWave?.length&&waveSpawned<w.trainingWave.length)lane=w.trainingLanes?.[waveSpawned]??2
 else if(waveIndex===0&&gameMode==='campaign')lane=waveSpawned%2===0?0:2
 if(['boss','blackhole','binary','cometBoss','neutronBoss'].includes(type))lane=2
 const e=createEnemy(type,lane);enemies.push(e)
 if(type==='binaryObject'){const linked=createEnemy(type,lane,{x:e.x+70,size:55});e.link=linked.id;linked.link=e.id;enemies.push(linked)}
 if(Progress.discover(type))showToast(`Observatório: ${e.name} catalogado`)
 if(e.tag==='BOSS'||['blackhole','binary'].includes(type)){AudioSystem.play('boss');shake=.55;cinematic=.45}
}

function spawnSuperboss(phase,checkpoint){
 const index=phase%superBosses.length,b=superBosses[index],scale=(.48+phase*.065)*(1+checkpoint*.1)*difficultyStats().hp,lane=waveIndex===0?0:2
 const behaviors=['binaryBoss','cometBoss','rogueBoss','solarBoss','vortex']
 const enemy=createEnemy('boss',lane,{type:'superboss',name:b.name,tag:'SUPERBOSS',x:W+80,hp:Math.round(b.hp*scale),maxHp:Math.round(b.hp*scale),speed:b.speed,size:Math.min(168,b.size),img:b.img,reward:180+phase*40,coreDamage:b.coreDamage,armor:b.armor,shield:Math.round(b.shield*scale),maxShield:Math.round(b.shield*scale),contactDps:b.contactDps,resist:{...b.resist},behavior:behaviors[index],isSuperboss:true,abilityTimer:5})
 enemies.push(enemy);Progress.discover('super'+index);penaltyBossActive=true;runStats.superbosses++;AudioSystem.play('boss');shake=.6;cinematic=.7;showToast(`${b.name} · reforço de emergência +180 energia`);energy=Math.min(9999,energy+180);statusText.textContent='⚠ SUPERBOSS · progressão suspensa';updateHud();saveRun()
}

function behaviorLabel(kind){return ({normal:'trajetória estável',armor:'blindagem pesada',rage:'acelera abaixo de 50% de vida',skater:'trajetória acelerada',shieldRegen:'escudo regenera fora de combate',split:'divide-se ao ser destruído',regen:'regenera fora de combate',phase:'intangibilidade periódica',rogueBoss:'ruptura gravitacional · na fase 3 empurra construções próximas 1 casa para longe',binaryBoss:'escudo alternado entre fases',vortex:'distorce projéteis e bloqueia espaços',cometBoss:'acelera e deixa rastro térmico',neutronBoss:'pulsa e desativa construções',solarBoss:'explosões térmicas',heavy:'resiste a empurrões',magnetic:'reduz cadência de torres elétricas',leech:'suprime geração próxima',jumper:'troca de rota',parasite:'desativa Mini Sóis',runner:'acelera no trecho interno',dark:'resiste ao dano convencional',linked:'a perda do par fortalece o sobrevivente'})[kind]||kind}

function getCanvasPos(evt){
 const r=canvas.getBoundingClientRect()
 return {x:(evt.clientX-r.left)*W/r.width,y:(evt.clientY-r.top)*H/r.height}
}

function nearestCell(p){
 let cell=null,distance=Infinity
 for(let lane=0;lane<5;lane++)for(let col=0;col<gridX.length;col++){const x=gridX[col],y=curveY(lane,x),dist=Math.hypot((p.x-x),p.y-y);if(dist<distance&&Math.abs(p.x-x)<55&&Math.abs(p.y-y)<48){distance=dist;cell={lane,col,x,y}}}
 return cell
}
function enemyTooltip(hit){
 const entries=Object.entries(hit.resist),weak=entries.reduce((a,b)=>b[1]>a[1]?b:a),strong=entries.reduce((a,b)=>b[1]<a[1]?b:a)
 return `<strong>${hit.name}</strong><br>HP ${Math.max(0,Math.ceil(hit.hp))}/${hit.maxHp} · ARM ${hit.armor}<br>Escudo ${Math.ceil(hit.shield)} · ${Math.round(hit.speed*laneSpeed[hit.lane])} px/s<br>↑ Eficaz: ${damageNames[weak[0]]} ×${weak[1].toFixed(2)}<br>↓ Resistido: ${damageNames[strong[0]]} ×${strong[1].toFixed(2)}<br>${behaviorLabel(hit.behavior)}<br><small>${Content.facts[hit.type]||'Anomalia ficcional de combate.'}</small>`
}
canvas.addEventListener('pointermove',e=>{
 const p=getCanvasPos(e);hoverCell=nearestCell(p)
 const hit=enemies.find(en=>Math.hypot(p.x-en.x,p.y-en.y)<Math.max(28,en.size*.43))
 if(hit){const r=gameStage.getBoundingClientRect();tooltip.style.display='block';tooltip.style.left=`${Math.min(r.width-265,Math.max(8,e.clientX-r.left+16))}px`;tooltip.style.top=`${Math.min(r.height-185,Math.max(8,e.clientY-r.top+16))}px`;tooltip.innerHTML=enemyTooltip(hit)}else tooltip.style.display='none'
})
canvas.addEventListener('pointerleave',()=>{hoverCell=null;tooltip.style.display='none'})
function ensureTrainingHost(type='earth'){
 const eligible=defenders.find(d=>!['miniSun','gravity','probe','belt'].includes(d.type))
 if(eligible)return eligible
 const lane=2,col=2,x=gridX[col],y=curveY(lane,x),def=unitDefs[type]
 const tower={id:nextEntityId++,type,lane,col,x,y,level:1,hp:def.hp,maxHp:def.hp,cooldown:1,pulse:0,spent:0,disabled:0,hitTimer:0,trainingGift:true}
 const stats=getTowerStats(tower);tower.hp=stats.maxHp;tower.maxHp=stats.maxHp;defenders.push(tower)
 burst(x,y,def.color,12);AudioSystem.play('place');updateHud();saveRun();showToast(`${def.name} de treinamento posicionada sem custo`)
 return tower
}

function placeAt(p){
 const tutorialPausedAction=paused&&typeof TutorialGuide!=='undefined'?TutorialGuide.pausedCanvasAction():null
 // Pausar congela a SIMULAÇÃO, não a montagem da defesa. Durante uma pausa comum
 // o canvas continua aceitando posicionamento de construções; no tutorial, a ação
 // guiada (inspecionar/posicionar) continua tendo prioridade e pode restringir o tipo.
 const pausedBuildMode=paused&&!tutorialPausedAction
 if(gameOver||checkpointInProgress)return
 if(tutorialPausedAction==='placement'&&typeof TutorialGuide!=='undefined'){const expected=TutorialGuide.expectedPlacementType();if(expected&&selected!==expected){showToast(`Selecione ${unitDefs[expected]?.name||'a construção indicada'} para continuar o tutorial.`);return}}
 if(tutorialPausedAction==='inspect'){
  const hit=enemies.find(e=>Math.hypot(p.x-e.x,p.y-e.y)<e.size*.4)
  if(!hit)return
  showToast(`${hit.name}: ${behaviorLabel(hit.behavior)}`);const guided=tutorialEvent('inspect');if(guided&&typeof TutorialGuide!=='undefined')TutorialGuide.afterEnemyInspect(hit);return
 }
 // Com pausa manual, somente a construção permanece interativa: poderes, coleta
 // e inspeção comum esperam a batalha voltar. Isso evita ganhar recursos/efeitos
 // enquanto o relógio do combate está congelado.
 if(!pausedBuildMode&&powerMode&&usePowerAt(p))return
 if(!pausedBuildMode&&tutorialPausedAction!=='placement')for(let i=energyOrbs.length-1;i>=0;i--){const o=energyOrbs[i];if(Math.hypot(p.x-o.x,p.y-o.y)<34){collectOrb(i);return}}
 if(!pausedBuildMode&&tutorialPausedAction!=='placement'){const hit=enemies.find(e=>Math.hypot(p.x-e.x,p.y-e.y)<e.size*.4);if(hit){showToast(`${hit.name}: ${behaviorLabel(hit.behavior)}`);const guided=tutorialEvent('inspect');if(guided&&typeof TutorialGuide!=='undefined')TutorialGuide.afterEnemyInspect(hit);return}}
 const cell=nearestCell(p);if(!cell){if(tutorialPausedAction!=='placement')hideTowerPanel();return}
 if(!waves[waveIndex].lanes.includes(cell.lane)||(randomModifier==='inner'&&cell.lane>1)){showToast('Esta rota está fechada nesta missão.');return}
 if(slotBlocked(cell)){showToast('Espaço distorcido pelo horizonte. Aguarde o pulso terminar.');return}
 const occupied=defenders.find(d=>d.lane===cell.lane&&d.col===cell.col)
 if(tutorialPausedAction==='placement'&&occupied&&TutorialGuide.expectedPlacementType?.()!=='moon'){showToast('Use o espaço vazio destacado pelo tutorial.');return}
 if(selected==='moon'&&occupied&&!['miniSun','gravity','probe','belt'].includes(occupied.type)){
  if(occupied.moon){showToast('Este planeta já tem uma Lua.');showTowerPanel(occupied);return}if(!canPlace('moon')||energy<unitDefs.moon.cost){showToast('Lua bloqueada ou energia insuficiente.');return}energy-=unitDefs.moon.cost;occupied.moon={level:1,hp:180,maxHp:180,spent:75,phase:0};AudioSystem.play('place');showTowerPanel(occupied);updateHud();saveRun();if(typeof TutorialGuide!=='undefined')TutorialGuide.afterPlacement(occupied,'moon');return
 }
 if(occupied){showTowerPanel(occupied);tutorialEvent('tower-inspect');return}
 if(selected==='moon'){showToast('Selecione um planeta existente para anexar a Lua.');return}
 hideTowerPanel();const def=unitDefs[selected];if(!canPlace(selected)){showToast(`Esta construção é apresentada na fase ${unitUnlockStage(selected)+1}.`);return}if(energy<def.cost){showToast('Energia insuficiente');return}
 energy-=def.cost;const tower={id:nextEntityId++,type:selected,lane:cell.lane,col:cell.col,x:cell.x,y:cell.y,level:1,hp:def.hp,maxHp:def.hp,cooldown:def.kind==='harvest'?4:1,pulse:0,spent:def.cost,disabled:0,hitTimer:0};const stats=getTowerStats(tower);tower.hp=stats.maxHp;tower.maxHp=stats.maxHp;defenders.push(tower);if(!runStats.types.includes(selected))runStats.types.push(selected);updateHud();burst(cell.x,cell.y,def.color,12);AudioSystem.play('place');tutorialEvent(def.kind==='harvest'?'miniSun':def.kind==='barrier'?'barrier':'attacker');if(typeof TutorialGuide!=='undefined')TutorialGuide.afterPlacement(tower);saveRun()
}
function collectOrb(index){const o=energyOrbs[index];energy=Math.min(9999,energy+o.value);runStats.energyCollected+=o.value;energyOrbs.splice(index,1);addText(o.x,o.y,'+✦ '+o.value,'#ffdc77');AudioSystem.play('collect');tutorialEvent('collect');updateHud()}
canvas.addEventListener('click',e=>placeAt(getCanvasPos(e)))
function slotBlocked(cell){return enemies.some(e=>e.behavior==='vortex'&&e.bossPhase>=2&&e.phaseClock%9<3&&Math.abs(e.x-cell.x)<145&&Math.abs(e.lane-cell.lane)<=1)}
function tutorialEvent(event){
 if(tutorialDone||waveIndex!==0||gameMode!=='campaign')return false
 if(typeof TutorialGuide!=='undefined')return !!TutorialGuide.event(event)
 if(typeof Interface!=='undefined')Interface.tutorial()
 return false
}

function armorFactor(type){if(type==='pierce')return .08;if(type==='plasma')return .5;if(type==='gravity')return .65;if(type==='electric')return .7;if(type==='solar')return .55;if(type==='cryo')return .8;return 1}

function applyDamage(enemy,amount,type,quiet=false){
 if(enemy.hp<=0||enemy.escaped||amount<=0)return 0
 const resist=enemy.resist[type]??1,vulnerable=enemy.vulnerableTimer>0?enemy.vulnerability||1.18:1,phaseGuard=enemy.behavior==='phase'&&Math.sin(enemy.phaseClock*2.4)>.55&&!['gravity','pierce'].includes(type)?.35:1,frozenBonus=type==='electric'&&(enemy.freeze>0||enemy.cryoTimer>0)?1.45:1
 let raw=amount*resist*vulnerable*phaseGuard*frozenBonus
 enemy.hitTimer=2.5;let shieldDamage=0
 if(enemy.shield>0){const shieldMul=({gravity:1.55,electric:1.6,plasma:1.2,kinetic:.72,pierce:.75,solar:1.05})[type]||1,dealt=raw*shieldMul;shieldDamage=Math.min(enemy.shield,dealt);enemy.shield-=shieldDamage;raw=Math.max(0,dealt-shieldDamage)/shieldMul;if(enemy.shield===0){burst(enemy.x,enemy.y,'#83efff',8);AudioSystem.play('impact')}}
 const dealt=raw>0?Math.max(raw*.1,raw-(quiet?0:enemy.armor*armorFactor(type))):0;enemy.hp-=dealt
 if(!quiet){enemy.flash=.1;addText(enemy.x+(Math.random()-.5)*12,enemy.y-20,(resist>1.25?'↑ ':resist<.7?'↓ ':'')+Math.round(dealt+shieldDamage)+(shieldDamage>0?' ◇':''),shieldDamage>0?'#85edff':resist>1.25?'#baffca':resist<.7?'#b1a1c1':damageColors[type]);AudioSystem.play('impact')}
 return dealt+shieldDamage
}

function shoot(def,target,u,stats){
 if(projectiles.length>150)return
 projectiles.push({x:def.x+24,y:def.y-4,lane:def.lane,target,owner:def,damage:stats.damage,speed:u.kind==='pierce'?540:420,color:damageColors[stats.damageType]||u.color,type:u.kind,damageType:stats.damageType,life:5,hitsLeft:stats.branch.pierces||(u.kind==='pierce'?(3+(d.type==='pulsar'&&Progress.has('pulsar')?2:0)):1),hitIds:[],branch:stats.branch})
 def.cooldown=stats.rate;AudioSystem.play('shot')
}

function pulseDefender(d,u,stats){
 const targets=enemies.filter(e=>Math.abs(e.lane-d.lane)<=(u.kind==='probe'?1:0)&&Math.abs(e.x-d.x)<stats.range)
 if(!targets.length)return false
 for(const e of targets){
  if(u.kind==='probe'){e.vulnerableTimer=5.1;e.vulnerability=stats.branch.vulnerability?1.3:1.18;continue}
  applyDamage(e,stats.damage,u.damageType)
  if(u.kind==='well'){e.slow=Math.min(e.slow,stats.branch.slow||.36);e.slowTimer=3;e.vulnerableTimer=Math.max(e.vulnerableTimer,3.4);if(stats.branch.pull)e.x+=(d.x-e.x)*.18}
 }
 burst(d.x,d.y,u.color,12);d.cooldown=stats.rate;return true
}

function triggerCheckpointIfNeeded(){
 if(!running||checkpointInProgress||penaltyBossActive||checkpointIndex>=3||!waveTotal)return false
 const thresholds=[.25,.5,.75]
 const fraction=waveSpawned/waveTotal
 if(fraction+1e-6<thresholds[checkpointIndex])return false
 showCheckpoint(waveIndex,checkpointIndex)
 return true
}

function showCheckpoint(phase,cp){
 hideTowerPanel();checkpointInProgress=true;paused=true
 const q=questions[Math.min(7,phase)][cp]
 quizKicker.textContent=`CHECKPOINT ${cp+1}/3`;quizPhase.textContent=`CAPÍTULO ${phase+1} · 1º EM${q.skill?' · '+q.skill:''}`;quizMentor.src=phase<4?assetPath('kepler.png'):assetPath('newton.png');quizQuestion.textContent=q.q;quizOptions.innerHTML='';quizFeedback.className='quiz-feedback hidden';quizFeedback.textContent='';quizContinue.classList.add('hidden')
 const visual=document.getElementById('quizVisual');visual.innerHTML=''
 if(q.kind==='choice'){
  const order=q.options.map((text,index)=>({text,index}));for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
  order.forEach(({text,index})=>{const b=document.createElement('button');b.className='quiz-option';b.textContent=text;b.dataset.choice=index;b.onclick=()=>answerCheckpoint(index);quizOptions.appendChild(b)})
  const preview=document.createElement('canvas');preview.width=640;preview.height=130;preview.className='physics-canvas mini-context';visual.appendChild(preview);Physics.ellipse(preview,.4,Math.PI*.7,{sectors:phase===2||phase===6})
 }else Physics.renderChallenge(q,visual,answerCheckpoint)
 quizModal.classList.remove('hidden');statusText.textContent=`Checkpoint ${cp+1}/3 · simulação pausada`;if(typeof Interface!=='undefined')Interface.tutorial();quizModal.querySelector('button,input')?.focus();saveRun()
}

function answerCheckpoint(choice){
 if(!checkpointInProgress||!quizContinue.classList.contains('hidden'))return
 const phase=waveIndex,cp=checkpointIndex,q=questions[phase][cp],correct=q.kind==='choice'?choice===q.correct:choice===true
 quizOptions.querySelectorAll('button').forEach(b=>{b.disabled=true;if(Number(b.dataset.choice)===q.correct)b.classList.add('correct');else if(Number(b.dataset.choice)===choice)b.classList.add('wrong')})
 checkpointStates[cp]=correct?'ok':'failed';checkpointTrack.children[cp].classList.add(correct?'active':'failed');checkpointIndex++
 if(correct){energy=Math.min(9999,energy+90);runStats.correct++;runStats.score+=250;temporaryBuff=12;Progress.earn(2);AudioSystem.play('correct');quizFeedback.className='quiz-feedback good';quizFeedback.innerHTML=`<strong>✓ Estabilizado · +90 energia · +2 pesquisa · dano +15% por 12s.</strong><br>${q.why}`;pendingSuperboss=null}
 else{AudioSystem.play('wrong');quizFeedback.className='quiz-feedback bad';quizFeedback.innerHTML=`<strong>Configuração incorreta.</strong> ${q.why}<br><br>Um <strong>SUPERBOSS</strong> interromperá os reforços normais até ser derrotado. Se alcançar o núcleo, a missão termina. Você recebe 180 energia de emergência.`;pendingSuperboss={phase,checkpoint:cp}}
 quizContinue.classList.remove('hidden');quizContinue.focus();buildDeck();updateHud();saveRun();if(typeof TutorialGuide!=='undefined')TutorialGuide.scanUnlocks('checkpoint')
}

function closeCheckpoint(){
 if(quizContinue.classList.contains('hidden'))return
 quizModal.classList.add('hidden');paused=false;checkpointInProgress=false
 tutorialEvent('checkpoint');if(typeof TutorialGuide!=='undefined')TutorialGuide.resumeUnlocks()
 if(pendingSuperboss){const b=pendingSuperboss;pendingSuperboss=null;spawnSuperboss(b.phase,b.checkpoint)}else statusText.textContent='Batalha · sistema ativo'
 updatePreparation();if(typeof Interface!=='undefined')Interface.tutorial();saveRun()
}

function spawnEnergyOrb(x,y,value=35,life=18){
 if(!running||paused||gameOver||energyOrbs.length>=35)return
 energyOrbs.push({x,y,value,life,phase:Math.random()*6,vy:-8,source:'field'})
}
function damageTower(d,amount){
 if(debugState.invincible)return
 d.hitTimer=2.5
 if(d.moon&&d.moon.hp>0){const intercepted=amount*(d.moon.branch==='a'?.45:(Progress.has('moon')?.35:.3));d.moon.hp-=intercepted;amount-=intercepted;if(d.moon.hp<=0){burst(d.x,d.y,'#e6d9fa',7);d.moon=null}}
 d.hp-=amount
}
function defenderContactRadius(d){return d.type==='jupiter'?48:d.type==='saturn'?55:d.type==='gravity'?40:d.type==='miniSun'?32:d.type==='belt'?42:36}
function enemyContactRadius(e){return Math.max(25,e.size*.42)}
function contactGap(e,d){return enemyContactRadius(e)+defenderContactRadius(d)}
function displaceDefenderFromRogueBoss(e,d){
 // Only the rogue/errant-planet boss is allowed to move a defender.
 // Push AWAY from the boss so a defender cannot cross through it and ping-pong
 // between adjacent cells on consecutive gravity pulses.
 if(e.behavior!=='rogueBoss'||e.bossPhase<3)return false
 if(d.lastBossDisplaceId===e.id&&simTime-(d.lastBossDisplaceAt||0)<3.8)return false
 const direction=d.x<e.x?-1:1
 const col=d.col+direction
 if(col<0||col>=gridX.length)return false
 if(defenders.some(n=>n!==d&&n.lane===d.lane&&n.col===col))return false
 d.col=col;d.x=gridX[col];d.y=curveY(d.lane,d.x);d.lastBossDisplaceId=e.id;d.lastBossDisplaceAt=simTime
 burst(d.x,d.y,'#ca9aff',10);addText(d.x,d.y-52,'RUPTURA · 1 CASA','#e3bbff')
 return true
}

function updateBoss(e,dt){
 const ratio=e.hp/e.maxHp,phase=ratio<.33?3:ratio<.67?2:1
 if(phase>e.bossPhase){e.bossPhase=phase;shake=.3;AudioSystem.play('boss');showToast(e.behavior==='rogueBoss'&&phase===3?`${e.name} · fase 3 · ruptura gravitacional ativa`: `${e.name} · fase ${phase}`);if(e.behavior==='binaryBoss')e.shield=Math.min(e.maxShield,e.shield+e.maxShield*.45)}
 e.abilityTimer-=dt;if(e.abilityTimer>0)return;e.abilityTimer=phase===3?4:6
 const close=defenders.filter(d=>Math.hypot(d.x-e.x,d.y-e.y)<(phase>1?270:170))
 if(e.behavior==='rogueBoss'){
  let displaced=false
  for(const d of close){damageTower(d,12*phase);d.disabled=Math.max(d.disabled,1);if(phase===3&&displaceDefenderFromRogueBoss(e,d))displaced=true}
  if(displaced)showToast('Ruptura gravitacional · construção empurrada para longe')
  burst(e.x,e.y,'#ca9aff',15)
 }
 if(e.behavior==='neutronBoss'){for(const d of close){d.disabled=Math.max(d.disabled,1+phase*.5);damageTower(d,9*phase)}burst(e.x,e.y,'#8edcff',18)}
 if(e.behavior==='cometBoss'||e.behavior==='solarBoss'){for(const d of close)damageTower(d,(e.behavior==='solarBoss'?18:10)*phase);burst(e.x,e.y,'#ffa05e',18)}
 if(e.behavior==='vortex'){
  for(const d of close)d.disabled=Math.max(d.disabled,1.2)
  if(phase===3&&enemies.length<55){enemies.push(createEnemy('phase',e.lane,{x:e.x+60,hp:95,maxHp:95,reward:10}));Progress.discover('phase')}
  burst(e.x,e.y,'#b173ee',18)
 }
 if(e.behavior==='binaryBoss'){for(const d of close)damageTower(d,10*phase);e.vulnerableTimer=phase===3?3:0;burst(e.x,e.y,'#ffb9ec',14)}
}
function usePower(id){
 if(!running||paused||gameOver||!powerCharges[id])return
 if(['slingshot','eclipse'].includes(id)&&!Progress.has('powers')){showToast('Desbloqueie manobras gravitacionais na pesquisa.');return}
 if(id==='supernova'&&!Progress.has('supernova'))return
 if(id==='shift'||id==='slingshot'){powerMode={id,tower:null};showToast(id==='shift'?'Clique em uma construção, depois em um espaço livre.':'Clique no inimigo para lançá-lo para trás.');return}
 powerCharges[id]--;AudioSystem.play('power');shake=.2
 if(id==='flare')for(const e of enemies)applyDamage(e,145,'solar')
 if(id==='freeze')globalFreeze=6
 if(id==='eclipse')globalFreeze=4
 if(id==='supernova')for(const e of enemies)applyDamage(e,850,'pierce')
 burst(sun.x,sun.y,id==='freeze'?'#8cdfef':'#ffca74',45);updateHud();saveRun()
}
function usePowerAt(p){
 if(!powerMode||!running)return false
 const id=powerMode.id
 if(id==='slingshot'){const e=enemies.find(e=>Math.hypot(p.x-e.x,p.y-e.y)<e.size*.6);if(!e){showToast('Selecione um inimigo.');return true}e.x=Math.min(W+65,e.x+(e.behavior==='heavy'||e.tag==='BOSS'||e.isSuperboss?65:250));e.slow=.5;e.slowTimer=2;powerCharges[id]--;powerMode=null;AudioSystem.play('power');updateHud();saveRun();return true}
 const cell=nearestCell(p);if(!cell)return true
 if(!powerMode.tower){const d=defenders.find(d=>d.lane===cell.lane&&d.col===cell.col);if(d){powerMode.tower=d;showToast('Agora selecione um espaço livre.')}return true}
 if(defenders.some(d=>d.lane===cell.lane&&d.col===cell.col)||!waves[waveIndex].lanes.includes(cell.lane)||slotBlocked(cell)){showToast('Escolha um espaço livre e disponível.');return true}
 Object.assign(powerMode.tower,cell);powerCharges[id]--;powerMode=null;AudioSystem.play('power');updateHud();saveRun();return true
}

function update(dt){
 if(paused||gameOver||!running)return
 if(cinematic>0){cinematic=Math.max(0,cinematic-dt);return}
 simTime+=dt;sunAppear=Math.min(1,sunAppear+dt*1.45);globalFreeze=Math.max(0,globalFreeze-dt);temporaryBuff=Math.max(0,temporaryBuff-dt);shake=Math.max(0,shake-dt);saveTimer+=dt;orbTimer+=dt
 if(saveTimer>=5){saveTimer=0;saveRun()}
 if(orbTimer>=30){orbTimer=0;spawnEnergyOrb(270+Math.random()*650,100+Math.random()*510,20,20)}
 for(const o of energyOrbs){o.life-=dt;o.y+=o.vy*dt;o.vy*=Math.pow(.2,dt)}energyOrbs=energyOrbs.filter(o=>o.life>0)
 if(!penaltyBossActive){spawnTimer-=dt;if(spawnQueue.length&&spawnTimer<=0&&enemies.length<80){spawnEnemy(spawnQueue.shift());waveSpawned++;const trainingBurst=gameMode==='campaign'&&waves[waveIndex].trainingWave?.length&&waveSpawned<waves[waveIndex].trainingWave.length;spawnTimer=trainingBurst?.9:waveIndex===0?4.1:Math.max(1.5,3.2-waveIndex*.16)}if(triggerCheckpointIfNeeded())return}
 if(simTime-lastUIUpdate>.12){lastUIUpdate=simTime;missionProgress.style.width=`${Math.min(100,waveSpawned/Math.max(1,waveTotal)*100)}%`;updateHud();if(typeof Interface!=='undefined')Interface.bossBar()}
 const magnetic=enemies.filter(e=>e.behavior==='magnetic'),suppressors=enemies.filter(e=>e.behavior==='leech'||e.behavior==='parasite')
 for(const d of defenders){
  // Defenders live on orbital grid cells. Their render/physics position must always
  // derive from lane+column; only placement, Shift, or the explicit rogueBoss
  // displacement ability may change those grid coordinates.
  if(Number.isInteger(d.col)&&Number.isInteger(d.lane)&&gridX[d.col]!==undefined){d.x=gridX[d.col];d.y=curveY(d.lane,d.x)}
  d.disabled=Math.max(0,(d.disabled||0)-dt);d.hitTimer=Math.max(0,(d.hitTimer||0)-dt);if(d.moon)d.moon.phase=(d.moon.phase||0)+dt*1.5
  const u=unitDefs[d.type],stats=getTowerStats(d)
  if(stats.branch.regen&&d.hitTimer<=0)d.hp=Math.min(stats.maxHp,d.hp+stats.branch.regen*dt)
  if(d.disabled>0)continue
  if(u.kind==='harvest'&&suppressors.some(e=>Math.hypot(e.x-d.x,e.y-d.y)<180)){d.pulse=.6;continue}
  const interfered=stats.damageType==='electric'&&magnetic.some(e=>Math.hypot(e.x-d.x,e.y-d.y)<220);d.cooldown-=dt*(interfered?.5:1);d.pulse=Math.max(0,d.pulse-dt)
  if(u.kind==='barrier'){
   const field=d.type==='jupiter'&&(nearby(d,'earth')||stats.branch.field)?200:stats.branch.field?150:0
   if(field)for(const e of enemies)if(Math.abs(e.lane-d.lane)<=1&&Math.hypot(e.x-d.x,e.y-d.y)<field){e.slow=Math.min(e.slow,stats.branch.field||.78);e.slowTimer=.3}
   if(d.type==='saturn')for(const e of enemies){const trapped=nearby(d,'gravity',230)&&e.vulnerableTimer>0&&Math.hypot(e.x-d.x,e.y-d.y)<210;if(Math.hypot(e.x-d.x,e.y-d.y)<75||trapped)applyDamage(e,12*(stats.branch.ring||1)*dt,'pierce',true)}continue
  }
  // Economia também obedece à pausa: Mini Sol nunca completa ciclo nem gera
  // partículas enquanto a simulação está congelada.
  if(u.kind==='harvest'&&d.cooldown<=0){if(paused)continue;d.cooldown=stats.rate;spawnEnergyOrb(d.x+22,d.y-31,stats.energyValue,22);burst(d.x,d.y-10,'#ffd661',8);continue}
  if(['well','probe'].includes(u.kind)&&d.cooldown<=0){pulseDefender(d,u,stats);continue}
  if(d.cooldown<=0){const valid=enemies.filter(e=>e.hp>0&&e.lane===d.lane&&e.x>d.x-30&&e.x-d.x<stats.range).reduce((best,e)=>!best||e.x<best.x?e:best,null);if(valid)shoot(d,valid,u,stats)}
 }
 for(const p of projectiles){
  p.life-=dt;if(!p.target||p.target.hp<=0||!enemies.includes(p.target)){p.life=0;continue}
  const vortex=enemies.find(e=>e.behavior==='vortex'&&e.bossPhase>=2&&Math.hypot(e.x-p.x,e.y-p.y)<190);if(vortex&&p.target!==vortex&&p.damageType!=='pierce'){p.target=vortex;p.damage*=.96}
  const dx=p.target.x-p.x,dy=p.target.y-p.y,dist=Math.hypot(dx,dy)||1;const travel=p.speed*dt;p.x+=dx/dist*Math.min(dist,travel);p.y+=dy/dist*Math.min(dist,travel)
  if(dist<travel+20+p.target.size*.14){
   const target=p.target,branch=p.branch||{},owner=p.owner,thermal=owner&&((nearby(owner,'venus')&&p.type==='burn')||(owner.type==='venus'&&nearby(owner,'mars'))),frozenBonus=branch.fracture&&target.slow<.7?branch.fracture:1
   applyDamage(target,p.damage*frozenBonus*(p.type==='neutron'&&target.vulnerableTimer>0&&owner&&nearby(owner,'gravity')?1.35:1)*(target.shield>0?(branch.shield||1):1),p.damageType)
   if(branch.corrosion)target.armor=Math.max(0,target.armor-branch.corrosion)
   if(p.type==='burn'||branch.burn){target.burnTimer=Math.max(target.burnTimer,3.4*(thermal?1.5:1));target.burnDps=Math.max(target.burnDps,10*(branch.burnDps||1))}
   if(p.type==='solarburst'||branch.splash||p.type==='neutron'){const radius=(p.type==='neutron'?165:105)*(branch.area||1);for(const other of enemies)if(other!==target&&Math.hypot(other.x-target.x,other.y-target.y)<radius)applyDamage(other,p.damage*.55*(p.type==='neutron'&&other.vulnerableTimer>0?1.35:1),p.damageType,true)}
   if(p.type==='chain'){let jumps=0;for(const other of enemies.filter(e=>e!==target&&e.hp>0&&Math.hypot(e.x-target.x,e.y-target.y)<190).sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y))){applyDamage(other,p.damage*(jumps?.43:.68),'electric');burst(other.x,other.y,'#70f1ff',4);if(++jumps>=(branch.jumps||2))break}}
   if(p.type==='slow'){target.slow=Math.min(target.slow,branch.slow||(owner?.moon?.hp>0?.46:.63));target.slowTimer=2.8;target.vulnerableTimer=2;target.vulnerability=branch.vulnerability||1.18}
   if(p.type==='cryo'){target.slow=Math.min(target.slow,.43);target.slowTimer=2.8;target.freeze=Math.max(target.freeze,branch.freeze||.28);target.cryoTimer=2.8}
   if(branch.slow){target.slow=Math.min(target.slow,branch.slow);target.slowTimer=2.5}
   if(p.type==='pierce'){p.hitIds.push(target.id);p.hitsLeft--;const next=enemies.filter(e=>e.hp>0&&e.lane===p.lane&&!p.hitIds.includes(e.id)&&e.x>target.x-5&&e.x-target.x<250).reduce((best,e)=>!best||e.x<best.x?e:best,null);if(next&&p.hitsLeft>0){p.target=next;p.damage*=.86}else p.life=0}else p.life=0
   burst(p.x,p.y,p.color,5)
  }
 }projectiles=projectiles.filter(p=>p.life>0)
 for(const e of enemies){
  if(e.hp<=0)continue
  e.phase+=dt*2;e.phaseClock+=dt;e.flash=Math.max(0,e.flash-dt);e.vulnerableTimer=Math.max(0,e.vulnerableTimer-dt);e.hitTimer=Math.max(0,e.hitTimer-dt);e.freeze=Math.max(0,(e.freeze||0)-dt);e.cryoTimer=Math.max(0,(e.cryoTimer||0)-dt)
  if(e.burnTimer>0){e.burnTimer-=dt;applyDamage(e,e.burnDps*dt,'plasma',true)}else e.burnDps=0
  if(e.hp<=0)continue
  if(e.regen>0&&e.hitTimer<=0)e.hp=Math.min(e.maxHp,e.hp+e.regen*dt)
  if(e.shieldRegen>0&&e.hitTimer<=0)e.shield=Math.min(e.maxShield,e.shield+e.shieldRegen*dt)
  if(e.slowTimer>0)e.slowTimer-=dt;else e.slow=Math.min(1,e.slow+dt*.55)
  if(e.behavior==='jumper'&&e.phaseClock-e.lastLaneSwitch>7){const lanes=waves[waveIndex].lanes,newLane=lanes[(lanes.indexOf(e.lane)+1)%lanes.length];e.lane=newLane;e.lastLaneSwitch=e.phaseClock;burst(e.x,e.y,'#ae7df6',8)}
  if(e.behavior==='parasite')for(const d of defenders)if(d.type==='miniSun'&&Math.hypot(d.x-e.x,d.y-e.y)<150)d.disabled=Math.max(d.disabled,1)
  if(['rogueBoss','binaryBoss','neutronBoss','cometBoss','solarBoss','vortex'].includes(e.behavior))updateBoss(e,dt)
  let multiplier=1
  if(e.behavior==='rage'&&e.hp/e.maxHp<.5)multiplier=1.5
  if(e.behavior==='phase')multiplier=1+Math.max(0,Math.sin(e.phaseClock*1.9))*.35
  if(['runner','cometBoss'].includes(e.behavior))multiplier=1+(1-Math.min(1,(e.x-sun.x)/(W-sun.x)))*(e.behavior==='cometBoss'?1.1:.7)
  if(randomModifier==='fast')multiplier*=1.45
  if(e.freeze>0)multiplier=0
  if(globalFreeze>0)multiplier*=Progress.has('powers')?0:.3
  const step=e.speed*multiplier*laneSpeed[e.lane]*e.slow*dt;e.x-=step;e.y=curveY(e.lane,e.x)
  const blocker=defenders.filter(d=>d.lane===e.lane&&d.hp>0&&e.x>=d.x&&e.x-d.x<=contactGap(e,d)).sort((a,b)=>b.x-a.x)[0]
  if(blocker){e.x=blocker.x+contactGap(e,blocker);e.y=curveY(e.lane,e.x);const stats=getTowerStats(blocker);damageTower(blocker,e.contactDps*stats.blockDamageMultiplier*dt);if(stats.branch.reflect)applyDamage(e,stats.branch.reflect*dt,'electric',true)}
  if(e.x<sun.x+45){e.hp=0;e.escaped=true;if(!debugState.invincible)health-=e.isSuperboss?Math.max(health,e.coreDamage):e.coreDamage;burst(sun.x+20,e.y,'#ff6a55',15);AudioSystem.play('wrong');shake=.2;showToast(`Núcleo atingido · −${e.coreDamage}`);if(e.isSuperboss)penaltyBossActive=false;if(health<=0){endGame(false);return}}
 }
 const lost=defenders.filter(d=>d.hp<=0);for(const d of lost){if(unitDefs[d.type].kind==='barrier')runStats.barriersLost++;burst(d.x,d.y,'#bc9aff',15);if(selectedTower===d)hideTowerPanel()}defenders=defenders.filter(d=>d.hp>0)
 const dead=enemies.filter(e=>e.hp<=0)
 for(const e of dead){
  if(e.escaped){if(e.isSuperboss)showToast('O superboss atravessou a defesa. Reforços normais retomados.');continue}
  energy=Math.min(9999,energy+e.reward);runStats.kills++;runStats.score+=e.isSuperboss?800:Math.round(e.maxHp*.4);burst(e.x,e.y,e.isSuperboss?'#ff7896':'#ffbb62',e.isSuperboss?26:12)
  if(e.link){const partner=enemies.find(n=>n.id===e.link&&n.hp>0);if(partner){partner.speed*=1.35;partner.hp+=100;partner.maxHp+=100;partner.contactDps*=1.3;partner.tag='ENFURECIDO'}}
  if(e.splitOnDeath>0&&e.x>sun.x+130&&enemies.length<55)for(let i=0;i<e.splitOnDeath;i++){const lanes=waves[waveIndex].lanes,lane=lanes[(lanes.indexOf(e.lane)+i)%lanes.length];enemies.push(createEnemy('asteroid',lane,{x:e.x+30+i*20,hp:45,maxHp:45,speed:34,size:35,reward:6,tag:'FRAG',splitOnDeath:0}))}
  if(e.isSuperboss){penaltyBossActive=false;showToast('SUPERBOSS derrotado · reforços retomados');statusText.textContent='Batalha · sistema ativo';AudioSystem.play('correct')}
 }enemies=enemies.filter(e=>e.hp>0)
 if(dead.length||lost.length)updateHud()
 for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.4,dt);p.vy*=Math.pow(.4,dt)}particles=particles.filter(p=>p.life>0)
 for(const t of floatingTexts){t.life-=dt;t.y-=22*dt}floatingTexts=floatingTexts.filter(t=>t.life>0)
 if(!spawnQueue.length&&!enemies.length&&checkpointIndex>=3&&!checkpointInProgress&&!penaltyBossActive)finishPhase()
}

function finishPhase(){
 running=false;phaseCompletePending=true;missionProgress.style.width='100%';statusText.textContent='Sistema estabilizado';Progress.data.resume=null
 const stars=1+(health>=initialHealth*.6?1:0)+(checkpointStates.every(s=>s==='ok')?1:0),previous=Progress.data.stars[waveIndex]||0
 if(gameMode==='campaign'){
  const first=previous===0;Progress.data.unlocked=Math.max(Progress.data.unlocked,Math.min(8,waveIndex+2));Progress.data.stars[waveIndex]=Math.max(previous,stars);Progress.data.scores[waveIndex]=Math.max(Progress.data.scores[waveIndex]||0,runStats.score);Progress.earn(first?8+waveIndex*2:2)
  if(runStats.barriersLost===0&&!Progress.data.achievements.includes('muralha'))Progress.data.achievements.push('muralha')
  if(runStats.superbosses===0&&!Progress.data.achievements.includes('sem-superboss'))Progress.data.achievements.push('sem-superboss')
  if(runStats.types.length<=3&&!Progress.data.achievements.includes('minimalista'))Progress.data.achievements.push('minimalista')
  if(energy>=800&&!Progress.data.achievements.includes('reserva'))Progress.data.achievements.push('reserva')
  if(waveIndex===7&&!Progress.data.achievements.includes('campanha'))Progress.data.achievements.push('campanha')
 }else if(gameMode==='endless'){Progress.data.endlessBest=Math.max(Progress.data.endlessBest,endlessRound);Progress.earn(3)}else Progress.earn(4)
 Progress.persist();buildDeck();AudioSystem.play('victory');showLesson(waves[waveIndex].lesson);if(typeof TutorialGuide!=='undefined')TutorialGuide.scanUnlocks('campaign')
 formulaBox.innerHTML=`<div class="rating-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div><div class="result-stats"><span>${runStats.score}<small>pontos</small></span><span>${runStats.kills}<small>inimigos</small></span><span>${runStats.correct}/3<small>descobertas</small></span><span>${health}/${initialHealth}<small>núcleo</small></span></div><p class="result-law">${lessons[waves[waveIndex].lesson].formula}</p>`
 modalAction.textContent=gameMode==='endless'?'Preparar próxima onda':waveIndex===7?'Concluir campanha':'Próximo capítulo';updatePreparation()
}

function burst(x,y,color,count){
 const amount=Progress.data.settings.reduced?Math.min(3,count):count
 for(let i=0;i<amount&&particles.length<380;i++){const a=Math.random()*Math.PI*2,s=30+Math.random()*130;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.4+Math.random()*.7,max:1,color,r:2+Math.random()*3})}
}

function curveY(lane,x){const t=(x-220)/1060,amp=(lane-2)*18*(1+orbitConfig.e);return laneY[lane]+Math.sin(Math.max(0,Math.min(1,t))*Math.PI)*amp}

function drawBackground(){
 ctx.clearRect(0,0,W,H)
 const active=running||gameStarted,g=ctx.createRadialGradient(100,360,30,100,360,420);g.addColorStop(0,active?'#a052f525':'#56336315');g.addColorStop(1,'#00000000');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)
 for(const s of starfield){ctx.globalAlpha=s.a;ctx.fillStyle='#eadcff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1
 for(let lane=0;lane<5;lane++){
  const enabled=waves[waveIndex].lanes.includes(lane)&&!(randomModifier==='inner'&&lane>1)
  ctx.strokeStyle=enabled?'#bd93ee55':'#8b769f18';ctx.lineWidth=enabled?1.4:.7;ctx.setLineDash([5,10]);ctx.lineDashOffset=Progress.data.settings.reduced?0:-simTime*laneSpeed[lane]*12;ctx.beginPath();for(let x=205;x<1265;x+=7){const y=curveY(lane,x);if(x===205)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0
  ctx.fillStyle=enabled?'#c9b0e0':'#756a81';ctx.font='11px system-ui';ctx.fillText(`0${lane+1}  ${enabled?'v ×'+laneSpeed[lane].toFixed(2):'FECHADA'}`,202,laneY[lane]-42)
  if(enabled&&running){const x=230+((simTime*32*laneSpeed[lane]+lane*177)%980);ctx.fillStyle='#d2b6ff';ctx.beginPath();ctx.arc(x,curveY(lane,x),2,0,Math.PI*2);ctx.fill()}
  for(let col=0;col<gridX.length;col++){
   const x=gridX[col],y=curveY(lane,x),blocked=slotBlocked({lane,col,x,y}),occupied=defenders.some(d=>d.lane===lane&&d.col===col)
   ctx.beginPath();ctx.ellipse(x,y,36,23,0,0,Math.PI*2);ctx.fillStyle=blocked?'#ff628729':occupied?'#9a6cbe12':enabled?'#6c388218':'#291b3510';ctx.fill();ctx.strokeStyle=blocked?'#f77a9c88':enabled?'#b58ad333':'#48374f33';ctx.lineWidth=1;ctx.stroke()
   if(blocked){ctx.fillStyle='#ff9fbd';ctx.font='17px system-ui';ctx.textAlign='center';ctx.fillText('×',x,y+6);ctx.textAlign='left'}
  }
 }
 if(hoverCell&&!defenders.some(d=>d.lane===hoverCell.lane&&d.col===hoverCell.col)&&waves[waveIndex].lanes.includes(hoverCell.lane)){
  ctx.beginPath();ctx.ellipse(hoverCell.x,hoverCell.y,43,28,0,0,Math.PI*2);ctx.fillStyle='#d49cff15';ctx.fill();ctx.strokeStyle='#dda4ff';ctx.lineWidth=2;ctx.stroke();if(canPlace(selected))drawImageContain(imgs[unitDefs[selected].img],hoverCell.x,hoverCell.y-5,64,64,.4)
 }
 ctx.fillStyle='#a999bd';ctx.font='10px system-ui';ctx.fillText(running?'ROTAS ORBITAIS · modelo de defesa simplificado':'PREPARAÇÃO · construa, melhore e reorganize',24,H-26)
 if(debugState.fps){ctx.fillStyle='#bcffbe';ctx.font='13px monospace';ctx.fillText(`${Math.round(fps)} FPS · ${enemies.length} alvos · ${particles.length} partículas`,24,28)}
}

function drawImageContain(img,x,y,w,h,alpha=1,flip=false){
 if(!img||!img.complete||!img.naturalWidth)return
 const ratio=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*ratio,dh=img.naturalHeight*ratio
 ctx.save();ctx.globalAlpha=alpha;if(flip){ctx.translate(x,0);ctx.scale(-1,1);ctx.drawImage(img,-dw/2,y-dh/2,dw,dh)}else ctx.drawImage(img,x-dw/2,y-dh/2,dw,dh);ctx.restore()
}

function drawSun(){
 if(!gameStarted||sunAppear<=0){ctx.strokeStyle='#cc9fff33';ctx.lineWidth=1;ctx.beginPath();ctx.arc(sun.x,sun.y,60,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ad92bf';ctx.textAlign='center';ctx.font='10px system-ui';ctx.fillText('NÚCLEO EM REPOUSO',sun.x,sun.y+90);ctx.textAlign='left';return}
 const ease=1-Math.pow(1-sunAppear,3),pulse=Progress.data.settings.reduced?1:1+Math.sin(simTime*2)*.025
 ctx.save();ctx.globalAlpha=running?ease:.45;ctx.shadowColor='#ffbf38';ctx.shadowBlur=running?20:0;drawImageContain(imgs.sun,sun.x,sun.y,175*pulse,175*pulse);ctx.restore();ctx.fillStyle='#f2ce92';ctx.textAlign='center';ctx.font='10px system-ui';ctx.fillText('SOL · NÚCLEO',sun.x,sun.y+112);ctx.textAlign='left'
}

function drawDefenders(){
 for(const d of defenders){
  const u=unitDefs[d.type],stats=getTowerStats(d),size=d.type==='jupiter'?106:d.type==='saturn'?126:d.type==='gravity'?92:d.type==='miniSun'?76:d.type==='belt'?94:83,clock=Progress.data.settings.reduced?0:simTime
  ctx.save();ctx.translate(d.x,d.y-5);if(!['probe','saturn','pulsar','belt'].includes(d.type))ctx.rotate(Math.sin(clock*.12+d.id)*.055);ctx.shadowColor=u.color;ctx.shadowBlur=d.level>=3?16:6;drawImageContain(imgs[u.img],0,0,size,size,d.disabled>0?.35:1);ctx.restore()
  if(d.type==='miniSun'&&running){const ready=1-Math.max(0,d.cooldown)/stats.rate;ctx.beginPath();ctx.arc(d.x,d.y-5,36+ready*3,0,Math.PI*2*ready);ctx.strokeStyle='#ffd476a8';ctx.lineWidth=2;ctx.stroke()}
  if(d.level>1){ctx.beginPath();ctx.ellipse(d.x,d.y-3,size*.57,size*.34,clock*.14,0,Math.PI*2);ctx.strokeStyle=d.branch==='b'?'#7ae4ff77':'#d395ff77';ctx.lineWidth=d.level>=3?2:1;ctx.stroke();ctx.fillStyle='#e5c4ff';ctx.font='10px system-ui';ctx.textAlign='center';ctx.fillText('•'.repeat(d.level),d.x,d.y-54);ctx.textAlign='left'}
  if(d.moon){const angle=clock*1.5,moonX=d.x+Math.cos(angle)*46,moonY=d.y+Math.sin(angle)*24;drawImageContain(imgs.moon,moonX,moonY,23,23);ctx.strokeStyle='#c8caff22';ctx.beginPath();ctx.ellipse(d.x,d.y,46,24,0,0,Math.PI*2);ctx.stroke()}
  if(towerSynergies(d).length){ctx.fillStyle='#bce7ff';ctx.font='12px system-ui';ctx.fillText('✧',d.x+31,d.y-31)}
  if(d.disabled>0){ctx.fillStyle='#ffb0c8';ctx.font='15px system-ui';ctx.fillText('Ⅱ',d.x-6,d.y)}
  const w=u.kind==='barrier'?66:52;ctx.fillStyle='#000000b8';ctx.fillRect(d.x-w/2,d.y+40,w,4);ctx.fillStyle=u.kind==='barrier'?'#e6b77a':'#a4ddc7';ctx.fillRect(d.x-w/2,d.y+40,w*Math.max(0,d.hp/stats.maxHp),4)
  if(selectedTower===d){ctx.beginPath();ctx.ellipse(d.x,d.y-3,size*.6,size*.6,0,0,Math.PI*2);ctx.strokeStyle='#e4b0ff';ctx.lineWidth=2;ctx.stroke();if(stats.range>0){ctx.strokeStyle='#bb8bed25';ctx.setLineDash([4,8]);ctx.beginPath();ctx.moveTo(d.x,d.y+12);ctx.lineTo(Math.min(W,d.x+stats.range),d.y+12);ctx.stroke();ctx.setLineDash([])}}
  if(debugState.hitboxes){ctx.strokeStyle='#f7e37c';ctx.strokeRect(d.x-44,d.y-44,88,88)}
 }
}

function drawEnemies(){
 for(const e of enemies){
  const motion=Progress.data.settings.reduced?0:Math.sin(e.phase)*3
  ctx.save();if(e.isSuperboss){ctx.shadowColor='#ff5274';ctx.shadowBlur=18}if(['phase','dark'].includes(e.behavior))ctx.globalAlpha=.75;drawImageContain(imgs[e.img],e.x,e.y+motion,e.size*1.12,e.size*1.12,e.flash>0?.7:1);ctx.restore()
  const bw=Math.max(44,e.size*.75),top=e.y-e.size*.6
  if(e.maxShield>0){ctx.fillStyle='#040207cc';ctx.fillRect(e.x-bw/2,top-8,bw,3);ctx.fillStyle='#82d9ef';ctx.fillRect(e.x-bw/2,top-8,bw*Math.max(0,e.shield/e.maxShield),3);if(e.shield>0){ctx.strokeStyle='#7bccf055';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(e.x,e.y,e.size*.5,e.size*.47,e.phase*.15,0,Math.PI*2);ctx.stroke()}}
  ctx.fillStyle='#040207cc';ctx.fillRect(e.x-bw/2,top,bw,4);ctx.fillStyle=e.hp/e.maxHp>.5?'#bee3ca':'#ffa38d';ctx.fillRect(e.x-bw/2,top,bw*Math.max(0,e.hp/e.maxHp),4)
  ctx.font='9px system-ui';ctx.textAlign='center';ctx.fillStyle=e.isSuperboss?'#ff96ac':'#d0c1e0';ctx.fillText(e.tag+(e.tag==='BOSS'||e.isSuperboss?' · '+e.bossPhase:''),e.x,top-15);ctx.textAlign='left'
  const icons=[];if(e.slow<.8)icons.push('↓');if(e.freeze>0)icons.push('❄');if(e.burnTimer>0)icons.push('♨');if(e.vulnerableTimer>0)icons.push('G');if(icons.length){ctx.fillStyle='#e1c3ff';ctx.font='11px system-ui';ctx.fillText(icons.join(' '),e.x-16,e.y+e.size*.55)}
  if(debugState.hitboxes){ctx.strokeStyle='#ee668a';ctx.beginPath();ctx.arc(e.x,e.y,e.size*.42,0,Math.PI*2);ctx.stroke()}
 }
}

function drawProjectiles(){
 for(const p of projectiles){
  ctx.save();ctx.shadowBlur=18;ctx.shadowColor=p.color;ctx.fillStyle=p.color
  if(p.damageType==='cryo'){ctx.translate(p.x,p.y);ctx.rotate(Math.PI/4);ctx.fillRect(-6,-6,12,12)}else if(p.damageType==='electric'){ctx.fillRect(p.x-9,p.y-3,18,6)}else{ctx.beginPath();ctx.arc(p.x,p.y,p.damageType==='solar'?10:p.damageType==='plasma'?8:p.damageType==='pierce'?7:6,0,Math.PI*2);ctx.fill()}
  ctx.strokeStyle='#fff';ctx.globalAlpha=.7;ctx.beginPath();ctx.moveTo(p.x-25,p.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore()
 }
}

function drawParticles(){for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/.8);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}

function drawEnergyOrbs(){for(const o of energyOrbs){const s=44+Math.sin(performance.now()/280+o.phase)*4;ctx.save();ctx.shadowBlur=22;ctx.shadowColor='#ffcf4a';drawImageContain(imgs.energy,o.x,o.y,s,s);ctx.restore();ctx.fillStyle='#ffe681';ctx.font='800 12px system-ui';ctx.fillText(`+${o.value}`,o.x-13,o.y+30)}}

function render(){
 drawBackground();ctx.save();if(shake>0&&Progress.data.settings.shake&&!Progress.data.settings.reduced)ctx.translate((Math.random()-.5)*shake*10,(Math.random()-.5)*shake*8)
 drawSun();drawDefenders();drawProjectiles();drawEnemies();drawEnergyOrbs();drawParticles()
 for(const t of floatingTexts){ctx.globalAlpha=Math.max(0,t.life);ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillStyle=t.color;ctx.fillText(t.text,t.x,t.y)}ctx.globalAlpha=1;ctx.textAlign='left';ctx.restore()
 const overlayOpen=!quizModal.classList.contains('hidden')||!modal.classList.contains('hidden')||!labModal.classList.contains('hidden')||!document.getElementById('hubModal')?.classList.contains('hidden')
 if(paused&&!overlayOpen){ctx.fillStyle='#080312ab';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f4e6ff';ctx.font='800 32px system-ui';ctx.textAlign='center';ctx.fillText('PAUSADO',W/2,H/2);ctx.font='14px system-ui';ctx.fillText('Espaço para continuar',W/2,H/2+35);ctx.textAlign='left'}
 if(cinematic>0){ctx.fillStyle='#1f062955';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffbdd0';ctx.font='700 24px system-ui';ctx.textAlign='center';ctx.fillText('ANOMALIA DETECTADA',W/2,68);ctx.textAlign='left'}
}

function frame(t){
 const raw=Math.min(.05,(t-last)/1000);last=t;fps=fps*.95+(1/Math.max(.001,raw))*.05;const dt=raw*speedScale*(debugState.slow?.25:1)
 const steps=Math.max(1,Math.ceil(dt/.025));for(let i=0;i<steps;i++)update(dt/steps)
 if(!running&&!paused){for(const p of particles){p.life-=raw;p.x+=p.vx*raw;p.y+=p.vy*raw}particles=particles.filter(p=>p.life>0)}
 AudioSystem.tick(running&&!paused&&!document.hidden);Physics.tick(Progress.data.settings.reduced?0:raw);render();requestAnimationFrame(frame)
}

function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1800)}

function showLesson(idx){
 hideTowerPanel();const l=lessons[idx];modalMode='lesson';modalClose.style.display='block';modalKicker.textContent=l.kicker;modalTitle.textContent=l.title;modalText.textContent=l.text;formulaBox.textContent=l.formula;mentorImg.src=l.mentor;modal.classList.remove('hidden');modalAction.textContent=idx===4?'Concluir missão':'Continuar';paused=true
}

function handleModalAction(){
 modal.classList.add('hidden')
 if(modalMode==='end'){if(gameMode==='endless'){startStage(Progress.data.chapter,'endless')}else startStage(waveIndex);return}
 if(phaseCompletePending){
  phaseCompletePending=false
  if(gameMode==='endless'){endlessRound++;waveIndex=3+(endlessRound%5);running=false;paused=false;gameOver=false;gameStarted=false;sunAppear=0;energy=Math.min(9999,energy+300);initialHealth=Math.max(initialHealth,health);resetCheckpointUI();startWaveBtn.disabled=false;startWaveBtn.textContent='Iniciar próxima onda';missionTitle.textContent=`Órbita infinita · onda ${endlessRound}`;statusText.textContent='Preparação · próxima onda';pregameOverlay.classList.remove('hidden-start');buildDeck();updateHud();updatePreparation();saveRun();return}
  if(gameMode==='challenge'){endGame(true);return}
  if(waveIndex===7){endGame(true);return}
  waveIndex++;Progress.data.chapter=waveIndex;startStage(waveIndex);return
 }
 paused=false
}

function endGame(win){
 gameOver=true;running=false;paused=true;Progress.data.resume=null;Progress.persist();startWaveBtn.disabled=true;modalMode='end';modalClose.style.display='none';hideTowerPanel();quizModal.classList.add('hidden');checkpointInProgress=false;AudioSystem.play(win?'victory':'defeat')
 modalKicker.textContent=win?'SISTEMA ESTÁVEL':'NÚCLEO PERDIDO';modalTitle.textContent=win?(gameMode==='challenge'?'Desafio concluído!':'Campanha defendida!'):'O Sol foi atingido';modalText.textContent=win?'Geometria, áreas, períodos e gravitação transformaram a sua estratégia. Continue descobrindo no Observatório ou teste uma órbita infinita.':'Reconfigure a economia, escolha os tipos eficazes de dano e coloque barreiras à frente. Sua pesquisa e seus capítulos continuam salvos.';formulaBox.innerHTML=`<div class="rating-stars">${win?'★ ★ ★':'↻'}</div><p class="result-law">${runStats.score} pontos · ${runStats.kills} alvos · ${runStats.correct}/3 descobertas${gameMode==='endless'?' · onda '+endlessRound:''}</p>`;mentorImg.src=waveIndex<4?assetPath('kepler.png'):assetPath('newton.png');modalAction.textContent=win?'Jogar novamente':'Tentar novamente';modal.classList.remove('hidden');updatePreparation()
}

function syncDeckHeight(){
 if(!deckPanel||!gameStage)return
 if(window.matchMedia('(min-width:981px)').matches)deckPanel.style.height=Math.max(0,Math.round(gameStage.getBoundingClientRect().height))+'px'
 else deckPanel.style.height='auto'
}

function updateLab(){const m=+massSlider.value,r=+distanceSlider.value,f=m/(r*r);massOut.textContent=m;distanceOut.textContent=r;forceOut.textContent=f.toFixed(2);gravityPulse.style.width=`${Math.min(100,15+f*160)}%`;gravityPulse.style.opacity=Math.min(1,.25+f*1.5);gravityPlanet.style.transform=`scale(${.8+m*.035})`;document.querySelector('.gravity-line').style.margin=`0 ${Math.max(0,(r-1)*4)}px`}


function togglePause(){
 if(!gameStarted||gameOver||checkpointInProgress||!modal.classList.contains('hidden')||!labModal.classList.contains('hidden')||!document.getElementById('hubModal')?.classList.contains('hidden'))return
 if(typeof TutorialGuide!=='undefined'&&TutorialGuide.locksSimulation()){showToast('O tutorial está mantendo a simulação pausada até você concluir a ação destacada.');TutorialGuide.render();return}
 paused=!paused;statusText.textContent=paused?'Batalha pausada':'Batalha · sistema ativo';pauseBtn.textContent=paused?'▶':'Ⅱ';pauseBtn.setAttribute('aria-label',paused?'Continuar':'Pausar');startWaveBtn.disabled=!paused;startWaveBtn.textContent=paused?'Continuar batalha':'Batalha em curso';saveRun()
}
startWaveBtn.onclick=startWave
pauseBtn.onclick=togglePause
modalClose.onclick=handleModalAction
modalAction.onclick=handleModalAction
quizContinue.onclick=closeCheckpoint
towerPanelClose.onclick=hideTowerPanel
upgradeTowerBtn.onclick=()=>upgradeSelectedTower()
sellTowerBtn.onclick=sellSelectedTower
let labWasPaused=false
labBtn.onclick=()=>{labWasPaused=paused;hideTowerPanel();paused=true;labModal.classList.remove('hidden');updateLab();Physics.labOpen();tutorialEvent('lab')}
labClose.onclick=()=>{labModal.classList.add('hidden');paused=labWasPaused;if(typeof Interface!=='undefined')Interface.tutorial()}
massSlider.oninput=updateLab
distanceSlider.oninput=updateLab
cardDeck.addEventListener('wheel',e=>{if(window.matchMedia('(max-width:980px)').matches&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();cardDeck.scrollBy({left:e.deltaY,behavior:Progress.data.settings.reduced?'instant':'smooth'})}},{passive:false})
canvas.tabIndex=0;canvas.setAttribute('aria-label','Campo orbital. Setas navegam pelos espaços; Enter posiciona ou inspeciona; C coleta energia.')
window.addEventListener('keydown',e=>{
 if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return
 const overlayOpen=!quizModal.classList.contains('hidden')||!modal.classList.contains('hidden')||!labModal.classList.contains('hidden')||!document.getElementById('hubModal')?.classList.contains('hidden')
 if(e.code==='Space'&&!overlayOpen){e.preventDefault();togglePause()}
 if(e.key==='Escape'){powerMode=null;hideTowerPanel();if(!labModal.classList.contains('hidden'))labClose.click();return}
 if(overlayOpen)return
 const keys=['1','2','3','4','5','6','7','8','9','0'];if(keys.includes(e.key)){const idx=e.key==='0'?9:+e.key-1,id=Object.keys(unitDefs)[idx];if(id&&canPlace(id)){selected=id;buildDeck()}}
 if(e.target===canvas&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','c','C'].includes(e.key)){
  e.preventDefault();if(e.key==='ArrowUp')keyboardCell.lane=Math.max(0,keyboardCell.lane-1);if(e.key==='ArrowDown')keyboardCell.lane=Math.min(4,keyboardCell.lane+1);if(e.key==='ArrowLeft')keyboardCell.col=Math.max(0,keyboardCell.col-1);if(e.key==='ArrowRight')keyboardCell.col=Math.min(6,keyboardCell.col+1);hoverCell={...keyboardCell,x:gridX[keyboardCell.col],y:curveY(keyboardCell.lane,gridX[keyboardCell.col])};if(e.key==='Enter')placeAt(hoverCell);if(e.key.toLowerCase()==='c'&&running&&!paused)for(let i=energyOrbs.length-1;i>=0;i--)collectOrb(i)
 }
})
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused&&!checkpointInProgress){paused=true;statusText.textContent='Pausado ao trocar de aba';saveRun()}})
window.addEventListener('pagehide',saveRun)
window.addEventListener('resize',syncDeckHeight)
if(window.ResizeObserver)new ResizeObserver(syncDeckHeight).observe(gameStage)
buildDeck();seededStars();resetGame(Progress.data.chapter);syncDeckHeight();requestAnimationFrame(frame)
