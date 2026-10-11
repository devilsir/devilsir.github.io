/* ORBITAL! 2.0 | Sistemas opcionais integrados ao motor original.
   Eventos, sinergias, decisões, didática, relatório local e desafios. */
const Expansion=(()=>{
 const $=id=>document.getElementById(id)
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
 const perks=[
  {id:'precision',name:'Ótica de precisão',icon:'◎',text:'Todas as construções ofensivas causam +15% de dano.',science:'Concentrar energia aumenta a eficiência de um disparo.'},
  {id:'orbit',name:'Janela orbital',icon:'◌',text:'Alcance dos defensores +18%.',science:'Mudar a geometria da missão altera zonas de influência.'},
  {id:'rhythm',name:'Ressonância',icon:'✦',text:'Torres disparam 14% mais rápido.',science:'Cadência é o tempo entre disparos; menor intervalo significa maior frequência.'},
  {id:'fusion',name:'Fusão estável',icon:'☼',text:'Produção dos Mini Sóis +25%.',science:'Fusão nuclear é a origem da energia das estrelas reais.'},
  {id:'reserve',name:'Reserva de emergência',icon:'◇',text:'Receba 240 de energia imediatamente.',science:'Gerenciar recursos é tão importante quanto construir defesas.'},
  {id:'shield',name:'Campo de proteção',icon:'⬡',text:'Todas as construções recebem cura de 22% da vida máxima.',science:'Barreiras e campos de defesa no jogo são representações simplificadas.'},
  {id:'tide',name:'Maré estabilizadora',icon:'☾',text:'Inimigos se movem 12% mais lentamente nesta missão.',science:'Interações gravitacionais reais podem perturbar trajetórias orbitais.'},
  {id:'spark',name:'Bateria de manobras',icon:'ϟ',text:'Recupere uma Erupção Solar e uma Manobra.',science:'Observe o momento ideal para liberar energia concentrada.'}
 ]
 const eventDefs=[
  {id:'storm',name:'Tempestade solar',icon:'☼',warn:'Fluxo solar instável a caminho',active:'Mini Sóis produzem 30% menos energia por 11 s.',help:'Prepare sua reserva antes da tempestade. Não é uma previsão solar real.',duration:11},
  {id:'meteors',name:'Chuva de micrometeoritos',icon:'✧',warn:'Micrometeoritos detectados',active:'Impactos leves atingirãO construções aleatórias.',help:'Distribua as defesas; construções já danificadas estão vulneráveis.',duration:10},
  {id:'tide',name:'Maré gravitacional',icon:'◉',warn:'Perturbação orbital detectada',active:'Inimigos perdem 18% de velocidade por 12 s.',help:'Aproveite a janela para lidar com escudos e blindagem.',duration:12},
  {id:'ion',name:'Aurora ionizada',icon:'ϟ',warn:'Campo de partículas carregadas',active:'Dano elétrico recebe bônus de 20% por 10 s.',help:'Alinhe Netuno e defesas elétricas para aproveitar a descarga.',duration:10}
 ]
 const challenges=[
  {id:'lean',label:'Frota mínima',icon:'◇',modifier:'lean',desc:'Vença com no máximo sete construções simultâneas.',tip:'Escolha alcance e combos; vender libera uma vaga.'},
  {id:'noSun',label:'Energia limitada',icon:'☼',modifier:'noSun',desc:'Sem Mini Sóis; reserva extra inicial de +220 energia.',tip:'Concentre o investimento nas rotas de maior pressão.'},
  {id:'noUpgrades',label:'Engenharia inicial',icon:'✦',modifier:'noUpgrades',desc:'Sem upgrades durante a missão.',tip:'Trabalhe com combinação de tipos e posicionamento.'},
  {id:'fast',label:'Corrida de cometas',icon:'↗',modifier:'fast',desc:'Inimigos 45% mais velozes.',tip:'Barreiras e desaceleração ganham prioridade.'},
  {id:'fragile',label:'Núcleo vulnerável',icon:'⬡',modifier:'fragile',desc:'Comece com três pontos de núcleo.',tip:'Evite vazamentos: cubra a rota mais arriscada.'},
  {id:'inner',label:'Duas rotas',icon:'◎',modifier:'inner',desc:'Defenda somente as duas primeiras rotas.',tip:'Use sinergias concentradas em um espaço menor.'}
 ]
 let chosen=[],physicsEffects=[],event={id:null,phase:'waiting',clock:0,next:22,index:0,hits:0},prevPaused=false,activeView='',undo=null,undoTimer=null,attempts={},offering=false,stageSaved=false,pendingPerks=0
 const defaults=()=>({assessment:false,allowPenalty:false,questionMode:'mixed',questions:[],results:[],history:[],records:{}})
 function teacher(){
  const d=Progress.data
  if(!d.orbitalClass||typeof d.orbitalClass!=='object')d.orbitalClass=defaults()
  d.orbitalClass={...defaults(),...d.orbitalClass}
  for(const id of ['questions','results','history'])if(!Array.isArray(d.orbitalClass[id]))d.orbitalClass[id]=[]
  if(!d.orbitalClass.records||typeof d.orbitalClass.records!=='object')d.orbitalClass.records={}
  if(typeof TeacherConsole!=='undefined'){const config=TeacherConsole.settings();d.orbitalClass.assessment=config.assessment;d.orbitalClass.allowPenalty=config.allowPenalty;d.orbitalClass.questionMode=config.questionMode;d.orbitalClass.questions=[]}
  return d.orbitalClass
 }
 function reset(){chosen=[];physicsEffects=[];event={id:null,phase:'waiting',clock:0,next:22,index:0,hits:0};attempts={};stageSaved=false;offering=false;pendingPerks=0;invalidateUndo();updateEvent()}
 function exportState(){return {chosen:[...chosen],physicsEffects:[...physicsEffects],event:{...event},attempts:{...attempts},pendingPerks,stageSaved}}
 function importState(r){reset();if(!r||typeof r!=='object')return;chosen=Array.isArray(r.chosen)?r.chosen.filter(id=>perks.some(p=>p.id===id)):[];physicsEffects=Array.isArray(r.physicsEffects)?r.physicsEffects:[];if(r.event&&typeof r.event==='object')event={...event,...r.event};attempts=r.attempts||{};pendingPerks=Math.max(0,Math.min(3,Number(r.pendingPerks)||0));stageSaved=!!r.stageSaved;updateEvent()}
 function prepareWave(){event={id:null,phase:'waiting',clock:0,next:24,index:0,hits:0};offering=false;updateEvent();if(randomModifier==='fragile'){health=Math.min(health,3);initialHealth=Math.min(initialHealth,3)}}
 function canAddTower(){return randomModifier!=='lean'||defenders.length<7}
 function stat(key){
  let val=1
  for(const id of chosen){
   if(key==='damage'&&id==='precision')val*=1.15
   if(key==='range'&&id==='orbit')val*=1.18
   if(key==='rate'&&id==='rhythm')val*=.86
   if(key==='energy'&&id==='fusion')val*=1.25
   if(key==='speed'&&id==='tide')val*=.88
  }
  if(event.phase==='active'&&event.id==='storm'&&key==='energy')val*=.70
  if(event.phase==='active'&&event.id==='ion'&&key==='electric')val*=1.20
  return val
 }
 function enemySpeed(){return amplifiedStat('speed')*(event.phase==='active'&&event.id==='tide'?.82:1)}
 function updateEvent(){
  const el=$('spaceEvent');if(!el)return
  if(event.phase==='waiting'||event.phase==='cooldown'){el.classList.add('hidden');el.textContent='';return}
  const e=eventDefs.find(x=>x.id===event.id);if(!e)return
  const warn=event.phase==='warning',sec=Math.max(0,Math.ceil(event.clock))
  el.className='space-event '+(warn?'event-warning':'event-active')
  el.innerHTML=`<span class="event-symbol">${e.icon}</span><span><strong>${esc(warn?e.warn:e.name)}</strong><small>${esc(warn?e.help:e.active)}</small></span><b>${sec}s</b>`
 }
 function tick(dt){
  if(pendingPerks&&!offering&&running&&!paused&&!checkpointInProgress){pendingPerks--;offerPerks();return}
  if(event.phase==='waiting'||event.phase==='cooldown'){
   event.next-=dt
   if(event.next<=0){
    if(event.phase==='cooldown'&&event.index>=3)return
    const next=eventDefs[(waveIndex+event.index)%eventDefs.length];event.id=next.id;event.phase='warning';event.clock=4;event.index++;AudioSystem.play('event');updateEvent()
   }
   return
  }
  event.clock-=dt
  if(event.phase==='warning'&&event.clock<=0){const e=eventDefs.find(x=>x.id===event.id);event.phase='active';event.clock=e.duration;event.hits=0;AudioSystem.play('event');updateEvent()}
  else if(event.phase==='active'){
   if(event.id==='meteors'&&defenders.length&&event.hits<10){event.hits+=dt; if(event.hits>=2.5){event.hits=0;const targets=defenders.filter(x=>x.hp>0);const d=targets[Math.floor(Math.random()*targets.length)];if(d){const amount=Math.max(3,Math.min(18,d.maxHp*.065));damageTower(d,amount);burst(d.x,d.y,'#ffc388',14);addText(d.x,d.y-55,'METEORITO −'+Math.ceil(amount),'#ffc28a')}}}
   if(event.clock<=0){event.phase='cooldown';event.next=30;event.id=null;updateEvent()}
  }
  if(Math.floor(event.clock*2)!==Math.floor((event.clock+dt)*2))updateEvent()
 }
 function drawField(g){
  if(event.phase!=='active')return
  g.save();g.globalAlpha=.14;g.lineWidth=1.4;g.setLineDash([8,18]);g.strokeStyle=event.id==='tide'?'#bdb3ff':event.id==='ion'?'#70e5ff':event.id==='storm'?'#ffbd6e':'#eab5ff'
  for(let lane of waves[waveIndex].lanes){g.beginPath();g.moveTo(220,curveY(lane,220));for(let x=240;x<W;x+=30)g.lineTo(x,curveY(lane,x)+Math.sin(simTime*2+lane+x*.014)*5);g.stroke()}
  g.setLineDash([]);g.restore()
 }
 function drawRange(g,d,stats){
  if(stats.range<=0)return
  const right=Math.min(W,d.x+stats.range),left=d.type==='janus'?Math.max(160,d.x-stats.range):d.x
  g.save();g.strokeStyle='#cce6ff';g.lineWidth=2;g.setLineDash([9,7]);g.beginPath();g.moveTo(left,curveY(d.lane,left)-20);for(let x=left;x<=right;x+=18)g.lineTo(x,curveY(d.lane,x)-20);g.stroke();g.setLineDash([]);g.fillStyle='#a68cff12';g.beginPath();g.moveTo(left,curveY(d.lane,left)-19);for(let x=left;x<=right;x+=15)g.lineTo(x,curveY(d.lane,x)-19);for(let x=right;x>=left;x-=15)g.lineTo(x,curveY(d.lane,x)+20);g.closePath();g.fill();g.restore()
 }
 function comboDescription(d){
  const combos=[]
  const has=(id,r)=>defenders.some(t=>t!==d&&t.type===id&&Math.hypot(d.x-t.x,d.y-t.y)<r)
  if(d.type==='mercury'&&has('uranus',380))combos.push('Fratura criogênica · impacto adicional contra alvos lentos')
  if(d.type==='venus'&&has('jupiter',270))combos.push('Atmosfera em chamas · queima ampliada')
  if(d.type==='mars'&&has('earth',260))combos.push('Plasma gravitacional · dano reforçado em alvos lentos')
  if(d.type==='neptune'&&has('uranus',290))combos.push('Tempestade crioelétrica · descarga ampliada')
  return combos.length?' · COMBOS: '+combos.join(' / '):''
 }
 function drawPreview(g,cell,type){
  const u=unitDefs[type];if(u.kind==='harvest'||u.kind==='barrier'||u.kind==='moon'||u.kind==='collector')return
  const distance=Math.min(u.range||0,W-cell.x)
  if(distance<10)return
  g.save();g.setLineDash([6,8]);g.lineWidth=1.5;g.strokeStyle='#d0b6fa99';g.beginPath();g.moveTo(cell.x+20,cell.y-14);g.lineTo(cell.x+distance,curveY(cell.lane,cell.x+distance)-14);g.stroke();g.restore()
 }
 function onHit(p,target){
  if(!p.owner||!target||target.hp<=0)return
  const d=p.owner,near=(id,range=220)=>defenders.some(t=>t!==d&&t.type===id&&Math.hypot(d.x-t.x,d.y-t.y)<range)
  if((target.comboCooldown||0)>simTime)return
  let name='',color='#cdeaff'
  if(d.type==='mercury'&&(target.slow<.7||target.freeze>0)&&near('uranus',380)){
   applyDamage(target,p.damage*.38,'pierce',true);name='FRATURA CRIOGÊNICA';color='#8befff'
  }else if(d.type==='venus'&&near('jupiter',270)){
   target.burnTimer=Math.max(target.burnTimer,4.3);target.burnDps=Math.max(target.burnDps,13);name='ATMOSFERA EM CHAMAS';color='#ffbb7a'
  }else if(d.type==='mars'&&near('earth',260)&&target.slow<.95){
   applyDamage(target,p.damage*.25,'plasma',true);name='PLASMA GRAVITACIONAL';color='#fbb7f0'
  }else if(d.type==='neptune'&&near('uranus',290)&&(target.slow<.9||target.freeze>0)){
   applyDamage(target,p.damage*.27,'electric',true);name='TEMPESTADE CRIOELÉTRICA';color='#91edff'
  }else if(d.type==='venus'&&near('mars',250)){
   target.burnTimer=Math.max(target.burnTimer,4.8);name='ESTUFA DE PLASMA';color='#ffcc83'
  }
  if(name){target.comboCooldown=simTime+3.2;burst(target.x,target.y,color,16);addText(target.x,target.y-55,'✧ '+name,color);runStats.score+=10;AudioSystem.play('combo')}
 }
 function onEnemyDefeated(e){
  if(e.type==='cometBoss'&&!e.fragmented&&e.x>sun.x+210&&enemies.length<72){e.fragmented=true;for(const offset of [-42,50]){const shard=createEnemy('ice',e.lane,{x:e.x+offset,hp:95,maxHp:95,speed:35,reward:10,size:47,tag:'FRAGMENTO',splitOnDeath:0});enemies.push(shard)}burst(e.x,e.y,'#a5f5ff',25);showToast('Cometa fragmentado: duas ameaças menores!')}
 }
 function bossWarning(b){
  const bar=$('bossBar');if(bar){bar.classList.add('imminent');setTimeout(()=>bar.classList.remove('imminent'),1800)}
  AudioSystem.play('event');if(b.hp>0)showToast(`${b.name}: ataque iminente! Proteja sua formação.`)
 }
 function attempt(cp){return Math.max(1,Number(attempts[cp]||1))}
 function nextAttempt(cp){attempts[cp]=attempt(cp)+1}
 function question(phase,cp){
  const custom=typeof TeacherConsole!=='undefined'?TeacherConsole.questionFor(phase,cp):null
  if(custom)return {...custom,kind:'choice',skill:custom.skill||'Questão personalizada'}
  return questions[Math.min(7,phase)][cp]
 }
 function penaltyEnabled(){return !teacher().assessment||!!teacher().allowPenalty}
 function recordAnswer(q,correct,attempt,record={}){
  const r=teacher().results;r.push({...record,result:correct?'Acerto':'Erro'});if(r.length>1000)r.splice(0,r.length-1000);Progress.persist()
 }
 function physicsBonus(q){
  const effects={'eccentricity':['Trajetória estratégica','range',1.08],'focus':['Foco identificado','damage',1.08],'gravity':['Campo calculado','speed',.92],'mass':['Massa e força','damage',1.06],'period':['Janela temporal','rate',.94],'speed':['Periélio observado','rate',.96],'areas':['Áreas iguais','range',1.06],'escape':['Energia de escape','damage',1.08],'order':['Distâncias estimadas','range',1.07]}
  const item=effects[q.kind]||['Conhecimento aplicado','damage',1.04];physicsEffects.push({key:item[1],factor:item[2],name:item[0]});return `✦ Aplicação na missão: ${item[0]} · ${item[1]==='rate'?'cadência melhorada':item[1]==='speed'?'inimigos mais lentos':item[1]==='range'?'alcance ampliado':'ataques fortalecidos'}.`
 }
 function effectsStat(key){return physicsEffects.reduce((n,x)=>x.key===key?n*x.factor:n,1)}
 // Buffs das descobertas são multiplicados pelas melhorias de escolha.
 function amplifiedStat(key){return stat(key)*effectsStat(key)}
 function registerPlacement(d,type,cost){
  undo={id:d.id,type,cost,at:Date.now(),health:d.hp,max:d.maxHp,host:type==='moon'}
  refreshUndo();if(undoTimer)clearTimeout(undoTimer);undoTimer=setTimeout(refreshUndo,8500)
 }
 function invalidateUndo(){undo=null;refreshUndo();if(undoTimer)clearTimeout(undoTimer)}
 function refreshUndo(){const b=$('undoBuildBtn');if(!b)return;b.classList.toggle('hidden',!undo||Date.now()-undo.at>8000||gameOver)}
 function undoBuild(){
  if(!undo||Date.now()-undo.at>8000||gameOver)return invalidateUndo()
  if(typeof TutorialGuide!=='undefined'&&TutorialGuide.locksSimulation()){showToast('Conclua o tutorial antes de desfazer a construção.');return}
  const d=defenders.find(t=>t.id===undo.id)
  if(!d)return invalidateUndo()
  if(undo.host){if(!d.moon||d.moon.level>1)return invalidateUndo();d.moon=null}
  else {if(d.level>1||d.hp<d.maxHp-.5)return invalidateUndo();defenders=defenders.filter(x=>x!==d);if(selectedTower===d)hideTowerPanel()}
  energy=Math.min(9999,energy+undo.cost);showToast('Construção desfeita · reembolso integral.');AudioSystem.play('undo');burst(d.x,d.y,'#bfeaff',10);invalidateUndo();buildDeck();updateHud();saveRun()
 }
 function afterCheckpoint(){
  attempts[checkpointIndex-1]=1
  if(gameOver||waveIndex===0&&!tutorialDone)return
  if(typeof TutorialGuide!=='undefined'&&TutorialGuide.locksSimulation()){pendingPerks++;return}
  offerPerks()
 }
 function offerPerks(){
  if(offering||gameOver||!running)return
  offering=true
  const pool=[...perks].sort(()=>Math.random()-.5).slice(0,3)
  open('Escolha de estratégia','Uma decisão que transforma esta batalha.','Escolha uma melhoria. O efeito vale até o fim da missão.',false)
  $('expansionEyebrow').textContent=`RECOMPENSA · CHECKPOINT ${checkpointIndex}/3`
  $('expansionClose').classList.add('hidden')
  $('expansionBody').innerHTML=`<div class="expansion-options">${pool.map(p=>`<button class="expansion-option" data-perk="${p.id}"><span class="expansion-icon">${p.icon}</span><strong>${p.name}</strong><span>${p.text}</span><small>${p.science}</small></button>`).join('')}</div><p class="muted-notice">Melhorias acumuláveis. Sem escolha errada: avalie sua defesa e escolha de acordo com as ameaças.</p>`
  $('expansionBody').querySelectorAll('[data-perk]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.perk;chosen.push(id)
   if(id==='reserve')energy=Math.min(9999,energy+240)
   if(id==='shield')defenders.forEach(d=>d.hp=Math.min(d.maxHp,d.hp+d.maxHp*.22))
   if(id==='spark'){powerCharges.flare++;powerCharges.shift++}
   offering=false;AudioSystem.play('perk');$('expansionClose').classList.remove('hidden');close(true);updateHud();saveRun();showToast('Estratégia adquirida: '+perks.find(x=>x.id===id).name)
  })
 }
 function finishStage(win=true){
  if(stageSaved)return
  const log=teacher().history
  log.push({date:new Date().toISOString(),chapter:waveIndex+1,mode:gameMode,challenge:randomModifier||'',victory:win===true?'Sim':win===false?'Não':'Concluída',score:runStats.score,correct:runStats.correct,kills:runStats.kills,health})
  if(log.length>300)log.splice(0,log.length-300)
  if(win!==false&&gameMode==='challenge'&&randomModifier)teacher().records[randomModifier]=Math.max(teacher().records[randomModifier]||0,runStats.score)
  stageSaved=true;Progress.persist()
 }
 function open(title,intro,subtitle,allowClose=true){
  if(checkpointInProgress)return showToast('Conclua o checkpoint antes de abrir outro painel.')
  if(!$('expansionModal').classList.contains('hidden'))return
  prevPaused=paused;paused=true;hideTowerPanel()
  $('expansionModal').classList.remove('hidden');$('expansionEyebrow').textContent='ORBITAL! 2.0';$('expansionTitle').textContent=title;$('expansionIntro').textContent=intro+(subtitle?' · '+subtitle:'');$('expansionClose').classList.toggle('hidden',!allowClose)
  $('expansionBody').innerHTML='';activeView=title; if(allowClose)$('expansionClose').focus()
 }
 function close(force=false){
  if(offering&&!force)return
  $('expansionModal').classList.add('hidden');$('expansionClose').classList.remove('hidden');activeView='';paused=prevPaused
  if(typeof TutorialGuide!=='undefined'&&TutorialGuide.locksSimulation())paused=true
  updateHud()
 }
 function challengeView(){
  open('Desafios orbitais','Missões opcionais com regras próprias.','O progresso principal permanece preservado.')
  const saved=teacher().records
  $('expansionBody').innerHTML=`<div class="expansion-subhead"><label>Capítulo desbloqueado <select id="specialChapter">${waves.slice(0,Progress.data.unlocked).map((w,i)=>`<option value="${i}" ${i===waveIndex?'selected':''}>${esc(w.short||w.title)}</option>`).join('')}</select></label><span>Cada desafio é uma missão separada.</span></div><div class="expansion-grid">${challenges.map(c=>`<article class="mission-card"><span class="expansion-icon">${c.icon}</span><h3>${c.label}</h3><p>${c.desc}</p><small>${c.tip}</small><div class="challenge-bottom"><span>${saved[c.modifier]?'Recorde: '+saved[c.modifier]+' pts':'Ainda não concluído'}</span><button data-special="${c.modifier}">Jogar ↗</button></div></article>`).join('')}</div>`
  $('expansionBody').querySelectorAll('[data-special]').forEach(b=>b.onclick=()=>{
   const chapter=Number($('specialChapter').value),modifier=b.dataset.special
   close(true);startStage(chapter,'challenge',modifier)
   if(modifier==='noSun')energy=Math.min(9999,energy+220)
   if(modifier==='fragile'){health=3;initialHealth=3}
   updateHud();saveRun();showToast('Desafio iniciado: '+challenges.find(x=>x.modifier===modifier).label)
  })
 }
 function csvDownload(rows,file){
  if(!rows.length)return showToast('Ainda não há registros para exportar.')
  const cols=[...new Set(rows.flatMap(Object.keys))],csv='\ufeff'+[cols.join(';'),...rows.map(r=>cols.map(k=>'"'+String(r[k]??'').replace(/"/g,'""')+'"').join(';'))].join('\r\n')
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=file;a.click();setTimeout(()=>URL.revokeObjectURL(url),1800)
 }
 function teacherView(){document.getElementById('frontTeacherAccess')?.click()}
 function observatory(){
  open('Atlas do Sistema Solar','Explore proporções, distâncias e propriedades reais.','Os poderes de combate dos planetas são fictícios.')
  const planets=[['Mercúrio',.383,.39,88,'Planeta rochoso, quase sem atmosfera.'],['Vênus',.949,.72,225,'Atmosfera densa, rica em dióxido de carbono.'],['Terra',1,1,365,'Único planeta com vida confirmada.'],['Marte',.532,1.52,687,'Possui a maior montanha vulcânica conhecida do Sistema Solar.'],['Júpiter',11.2,5.20,4333,'Gigante gasoso com uma enorme tempestade.'],['Saturno',9.45,9.58,10759,'Seus anéis são feitos sobretudo de gelo e fragmentos.'],['Urano',4.01,19.2,30688,'Seu eixo de rotação é muito inclinado.'],['Netuno',3.88,30.1,60182,'Possui ventos muito intensos na atmosfera.']]
  $('expansionBody').innerHTML=`<div class="science-note"><strong>Modelo comparativo</strong><span>Raio em unidades do raio terrestre (R⊕), distância média ao Sol em UA e período orbital em dias terrestres. Tamanhos e distâncias não estão na mesma escala visual.</span></div><label class="atlas-control">Escolha um planeta <select id="atlasSelect">${planets.map((p,i)=>`<option value="${i}">${p[0]}</option>`).join('')}</select></label><div id="atlasDetails" class="atlas-details"></div><div class="atlas-rule"><strong>3ª lei de Kepler — aproximação</strong><p>Para órbitas ao redor do Sol, T² ≈ a³ quando T está em anos e a em unidades astronômicas. A relação não descreve velocidade constante ao longo de uma órbita elíptica.</p><label>Semieixo maior (UA) <input id="atlasDistance" type="range" min="0.4" max="30" step="0.1" value="1"><output id="atlasDistanceOut">1 UA</output></label><strong id="atlasPeriod">T ≈ 1 ano</strong></div>`
  const show=()=>{const [name,r,a,T,fact]=planets[+$('atlasSelect').value];$('atlasDetails').innerHTML=`<div class="atlas-orbit-visual"><div class="atlas-earth"></div><div class="atlas-planet" style="width:${Math.min(150,Math.max(12,r*13))}px;height:${Math.min(150,Math.max(12,r*13))}px"></div></div><div><span class="panel-kicker">${esc(name.toUpperCase())}</span><h3>R = ${r} R⊕</h3><p>Distância média ≈ ${a} UA</p><p>Período orbital ≈ ${T.toLocaleString('pt-BR')} dias</p><small>${esc(fact)}</small></div>`}
  $('atlasSelect').onchange=show;show()
  $('atlasDistance').oninput=e=>{const a=+e.target.value;$('atlasDistanceOut').textContent=a.toFixed(1)+' UA';$('atlasPeriod').textContent=`T ≈ ${Math.pow(a,1.5).toFixed(2)} anos`}
 }
 function init(){
  const nav=document.querySelector('.main-nav')
  if(nav){const anchor=$('settingsBtn');for(const [id,name,fn] of [['challengeBtn','Desafios',challengeView],['teacherBtn','Professor',()=>teacherView()],['atlasBtn','Atlas',observatory]]){
    const b=document.createElement('button');b.id=id;b.textContent=name;b.onclick=fn;nav.insertBefore(b,anchor)
  }}
  $('expansionClose').onclick=()=>close()
  $('quizRetry').onclick=()=>{if(!checkpointInProgress)return;showCheckpoint(waveIndex,checkpointIndex);$('quizRetry').classList.add('hidden')}
  $('undoBuildBtn').onclick=undoBuild
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('expansionModal').classList.contains('hidden')&&!offering){e.preventDefault();close()};if(e.ctrlKey&&e.key.toLowerCase()==='z'&&!['INPUT','TEXTAREA'].includes(e.target.tagName)&&$('expansionModal').classList.contains('hidden')){e.preventDefault();undoBuild()}})
  const caption=document.createElement('p');caption.className='science-game-caption';caption.textContent='SIMULAÇÃO DIDÁTICA · Rotas, poderes e colisões são abstrações de jogo. As leis físicas são discutidas nos checkpoints e no Atlas.';document.querySelector('.deck-foot')?.appendChild(caption)
  teacher();refreshUndo();updateEvent()
  const resume=Progress.data.resume
  if(resume?.expansion)importState(resume.expansion)
 }
 return {init,reset,exportState,importState,prepareWave,safeText:esc,stat:amplifiedStat,enemySpeed,onHit,onEnemyDefeated,bossWarning,tick,drawField,drawRange,drawPreview,comboDescription,registerPlacement,invalidateUndo,canAddTower,question,attempt,nextAttempt,penaltyEnabled,recordAnswer,physicsBonus,afterCheckpoint,finishStage}
})()
