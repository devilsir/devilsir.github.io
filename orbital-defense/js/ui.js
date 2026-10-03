var Interface=(()=>{
 const hub=document.getElementById('hubModal'),content=document.getElementById('hubContent'),title=document.getElementById('hubTitle'),intro=document.getElementById('hubIntro'),kicker=document.getElementById('hubKicker')
 let wasPaused=false,focusBefore=null,resetArmed=false,lastPreview=''
 const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
 function open(mode){
  if(checkpointInProgress){showToast('Conclua a descoberta antes de abrir outro painel.');return}
  if(hub.classList.contains('hidden')){wasPaused=paused;focusBefore=document.activeElement}
  hideTowerPanel();paused=true;hub.classList.remove('hidden');content.innerHTML='';resetArmed=false
  if(mode==='campaign')campaign();if(mode==='research')research();if(mode==='codex')codex();if(mode==='settings')settings();if(mode==='debug')debug()
  document.getElementById('hubClose').focus()
 }
 function close(){hub.classList.add('hidden');paused=wasPaused;if(gameOver)paused=true;focusBefore?.focus()}
 function heading(k,t,p){kicker.textContent=k;title.textContent=t;intro.textContent=p}
 function campaign(){
  heading('CAMPANHA · OITO CAPÍTULOS','Uma descoberta por órbita.','Kepler abre o caminho. Newton explica a força. Sua defesa cresce com o que você descobre.')
  const stars=Object.values(Progress.data.stars).reduce((a,b)=>a+Number(b),0)
  content.innerHTML=`<div class="campaign-summary"><div><strong>${stars}<small>/24</small></strong><span>estrelas</span></div><div><strong>${Progress.data.research}</strong><span>pontos de pesquisa</span></div><div><strong>${Progress.data.codex.length}</strong><span>corpos catalogados</span></div><img src="${assetPath((Progress.data.unlocked>=5?'newton':'kepler')+'.png')}" alt="Mentor"></div><div class="campaign-grid"></div><div class="extra-modes"><button id="endlessBtn" class="mode-card"><strong>Órbita infinita <span>∞</span></strong><p>${Progress.data.unlocked>=5?'Ondas crescentes, pesquisa contínua e defesa persistente.':'Complete o capítulo 4 para desbloquear.'}</p><small>Recorde: onda ${Progress.data.endlessBest}</small></button><button id="dailyBtn" class="mode-card"><strong>Desafio do dia <span>✧</span></strong><p>Uma missão com um modificador que muda a estratégia.</p><small id="dailyModifier"></small></button></div><div class="achievement-strip"></div>`
  const grid=content.querySelector('.campaign-grid')
  waves.forEach((w,i)=>{
   const unlocked=i<Progress.data.unlocked,star=Number(Progress.data.stars[i]||0),b=document.createElement('button');b.className='campaign-node'+(unlocked?'':' locked')+(i===waveIndex?' current':'');b.disabled=!unlocked;b.innerHTML=`<span class="chapter-index">${unlocked?String(i+1).padStart(2,'0'):'🔒'}</span><span class="chapter-topic">${w.topic}</span><strong>${w.short}</strong><span class="chapter-stars">${'★'.repeat(star)}${'☆'.repeat(3-star)}</span><small>${unlocked?(Progress.data.scores[i]||0)+' pts':'Capítulo anterior necessário'}</small>`;b.onclick=()=>{const fresh=()=>{close();modal.classList.add('hidden');startStage(i);showToast(w.dialogue)};if(running&&!gameOver){content.innerHTML=`<div class="switch-stage"><h3>Iniciar ${escape(w.short)}?</h3><p>A pesquisa e as estrelas continuam salvas. A batalha em andamento será substituída.</p><button id="confirmStage" class="primary-btn">Iniciar capítulo</button><button id="cancelStage" class="secondary-btn">Continuar batalha atual</button></div>`;document.getElementById('confirmStage').onclick=fresh;document.getElementById('cancelStage').onclick=campaign}else fresh()};grid.appendChild(b)
  })
  const modifiers=['inner','noSun','fast','noUpgrades','eccentric'],today=new Date().toLocaleDateString('sv-SE'),hash=[...today].reduce((s,c)=>s*31+c.charCodeAt(0),7)>>>0,modifier=modifiers[hash%modifiers.length],labels={inner:'Apenas rotas internas',noSun:'Sem Mini Sóis',fast:'Velocidade dos inimigos +45%',noUpgrades:'Sem upgrades',eccentric:'Alta excentricidade'}
  document.getElementById('dailyModifier').textContent=labels[modifier]+' · '+today
  const endless=document.getElementById('endlessBtn');endless.disabled=Progress.data.unlocked<5;endless.onclick=()=>{close();startStage(3,'endless');showToast('Defesas persistem entre as ondas. Prepare-se para escalar.')}
  document.getElementById('dailyBtn').onclick=()=>{close();startStage(Math.min(3,Progress.data.unlocked-1),'challenge',modifier);if(modifier==='noSun')energy+=220;if(modifier==='eccentric')orbitConfig.e=.8;updateHud();preview();saveRun();showToast(labels[modifier])}
  const achievements={muralha:'Muralha intacta','sem-superboss':'Órbita precisa',minimalista:'Defesa minimalista',reserva:'Reserva estelar',campanha:'Sistema defendido',tutorial:'Primeiros passos'}
  content.querySelector('.achievement-strip').innerHTML=Object.entries(achievements).map(([id,name])=>`<span class="${Progress.data.achievements.includes(id)?'earned':''}">✧ ${name}</span>`).join('')
 }
 function research(){
  heading('PESQUISA PERSISTENTE',`${Progress.data.research} pontos. Novas possibilidades.`,'Complete missões e acerte descobertas. As melhorias acompanham você em todos os capítulos.')
  const groups=[...new Set(Content.research.map(n=>n.category))]
  for(const group of groups){
   const section=document.createElement('section');section.className='research-category';section.innerHTML=`<h3>${group}</h3><div class="research-grid"></div>`;content.appendChild(section)
   for(const node of Content.research.filter(n=>n.category===group)){
    const owned=Progress.has(node.id),ready=node.needs.every(n=>Progress.has(n)),b=document.createElement('button');b.className='research-node'+(owned?' owned':'');b.disabled=owned||!ready||Progress.data.research<node.cost;b.innerHTML=`<span class="node-symbol">${owned?'✓':'✧'}</span><strong>${node.name}</strong><p>${node.desc}</p><small>${owned?'Pesquisado':!ready?'Requer: '+node.needs.map(id=>Content.research.find(n=>n.id===id).name).join(' + '):node.cost+' pontos'}</small>`;b.onclick=()=>{if(!node.needs.every(n=>Progress.has(n))||Progress.has(node.id)||Progress.data.research<node.cost)return;Progress.data.research-=node.cost;Progress.data.nodes.push(node.id);if(node.id==='defense')for(const d of defenders){const stats=getTowerStats(d);d.hp+=stats.maxHp-d.maxHp;d.maxHp=stats.maxHp}Progress.persist();AudioSystem.play('upgrade');buildDeck();updateHud();saveRun();research();document.getElementById('researchValue').textContent=Progress.data.research};section.querySelector('.research-grid').appendChild(b)
   }
  }
 }
 function codex(){
  heading('OBSERVATÓRIO','Todo encontro deixa uma descoberta.','Passe o cursor nos inimigos para ler a defesa. Os dados abaixo descrevem o combate; as notas distinguem ciência e ficção.')
  const known=Progress.data.codex,all={...enemyDefs}
  superBosses.forEach((b,i)=>all['super'+i]={...b,tag:'SUPERBOSS',behavior:['binaryBoss','cometBoss','rogueBoss','solarBoss','vortex'][i],resist:b.resist})
  content.innerHTML='<div class="codex-layout"><div class="codex-list"></div><article id="codexDetails" class="codex-details"><span class="panel-kicker">REGISTRO DE CAMPO</span><h3>Escolha um corpo catalogado.</h3><p>Novas entradas aparecem ao encontrar o corpo na batalha.</p></article></div>'
  const list=content.querySelector('.codex-list')
  for(const [id,d] of Object.entries(all)){
   const unlocked=known.includes(id),b=document.createElement('button');b.className='codex-item';b.disabled=!unlocked;b.innerHTML=`<img src="${assetPath(imageMap[d.img])}" alt=""><span>${unlocked?d.name:'Sinal desconhecido'}<small>${unlocked?d.tag:'Não encontrado'}</small></span><span>${unlocked?'↗':'🔒'}</span>`;b.onclick=()=>{
    const weak=Object.entries(d.resist).filter(([,v])=>v>1.15),resist=Object.entries(d.resist).filter(([,v])=>v<.85)
    document.getElementById('codexDetails').innerHTML=`<img class="codex-hero" src="${assetPath(imageMap[d.img])}" alt="${escape(d.name)}"><span class="panel-kicker">${d.tag}</span><h3>${d.name}</h3><div class="codex-stat-grid"><span>HP <strong>${d.hp}</strong></span><span>Armadura <strong>${d.armor}</strong></span><span>Escudo <strong>${d.shield}</strong></span><span>Velocidade <strong>${d.speed} px/s</strong></span></div><p><strong>Comportamento</strong><br>${behaviorLabel(d.behavior)}</p><p class="effective"><strong>↑ Dano eficaz</strong><br>${weak.map(([type,value])=>damageNames[type]+' ×'+value.toFixed(2)).join(' · ')||'Sem vulnerabilidade especial.'}</p><p class="resisted"><strong>↓ Resistências</strong><br>${resist.map(([type,value])=>damageNames[type]+' ×'+value.toFixed(2)).join(' · ')||'Sem resistência especial.'}</p><div class="scientific-note"><strong>NOTA CIENTÍFICA</strong><p>${Content.facts[id]||'Superboss ficcional. As habilidades de combate não representam um comportamento astronômico real.'}</p></div><small>Valores base, antes de dificuldade e escala da missão.</small>`;list.querySelectorAll('button').forEach(n=>n.classList.toggle('selected',n===b))};list.appendChild(b)
  }
 }
 function applySettings(){
  const s=Progress.data.settings;document.body.classList.toggle('high-contrast',!!s.contrast);document.body.classList.toggle('large-ui',!!s.large);document.body.classList.toggle('reduced-motion',!!s.reduced);document.getElementById('difficultyLabel').textContent=({student:'ESTUDANTE',standard:'PADRÃO',expert:'ASTROFÍSICO'})[s.difficulty]||'PADRÃO';AudioSystem.volumes()
 }
 function settings(){
  heading('CONFIGURAÇÕES','No seu ritmo.','Ajuste som, leitura e movimento. A dificuldade selecionada vale ao iniciar uma nova missão.')
  const s=Progress.data.settings
  content.innerHTML=`<div class="settings-grid"><label class="setting-row">Dificuldade<select id="difficultySelect"><option value="student">Estudante</option><option value="standard">Padrão</option><option value="expert">Astrofísico</option></select></label><div id="volumeControls"></div><div id="accessibilityControls"></div></div><div class="save-actions"><span>Progresso local · versão ${Progress.data.version}</span><button id="exportSave" class="secondary-control">Exportar progresso</button><label class="secondary-control file-label">Importar progresso<input id="importSave" type="file" accept=".json,application/json"></label><button id="resetSave" class="danger-control">Reiniciar progresso</button><p id="saveFeedback" role="status"></p></div><div class="controls-guide"><h3>Controles</h3><p>Clique em um cartão e em um espaço. Clique no defensor para inspecionar, evoluir ou vender. Lua: clique em um planeta existente.</p><p>1–0: selecionar · Espaço: pausar · Esc: cancelar poder/fechar painel · Tab: navegar · Campo com foco: setas e Enter · C: coletar energia · Roda do mouse: percorrer o deck.</p></div>`
  const difficulty=document.getElementById('difficultySelect');difficulty.value=s.difficulty;difficulty.onchange=()=>{s.difficulty=difficulty.value;Progress.persist();applySettings()}
  for(const [id,label] of [['master','Volume geral'],['music','Música'],['sfx','Efeitos']]){const l=document.createElement('label');l.className='setting-row';l.innerHTML=`${label}<input type="range" min="0" max="1" step="0.05" value="${s[id]}" aria-label="${label}">`;l.querySelector('input').oninput=e=>{s[id]=Number(e.target.value);Progress.persist();applySettings()};document.getElementById('volumeControls').appendChild(l)}
  for(const [id,label] of [['numbers','Números de dano'],['shake','Tremor de câmera'],['reduced','Movimento reduzido'],['contrast','Alto contraste'],['large','Interface ampliada']]){const l=document.createElement('label');l.className='setting-row';l.innerHTML=`${label}<input type="checkbox" ${s[id]?'checked':''}>`;l.querySelector('input').onchange=e=>{s[id]=e.target.checked;Progress.persist();applySettings()};document.getElementById('accessibilityControls').appendChild(l)}
  document.getElementById('exportSave').onclick=()=>{saveRun();const a=document.createElement('a'),url=URL.createObjectURL(new Blob([Progress.export()],{type:'application/json'}));a.href=url;a.download='orbital-progresso.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('saveFeedback').textContent='Progresso exportado.'}
  document.getElementById('importSave').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;Progress.import(await file.text());loadRun();applySettings();buildDeck();paused=true;wasPaused=running;document.getElementById('saveFeedback').textContent='Progresso importado. Feche este painel para continuar.'}catch(err){document.getElementById('saveFeedback').textContent='Arquivo inválido. Use um progresso exportado pelo ORBITAL.'}}
  document.getElementById('resetSave').onclick=()=>{if(!resetArmed){resetArmed=true;document.getElementById('resetSave').textContent='Confirmar reinício completo';document.getElementById('saveFeedback').textContent='Isso apaga capítulos, pesquisa, recordes e a batalha salva. Clique novamente para confirmar.';return}Progress.reset();wasPaused=false;close();startStage(0);applySettings();showToast('Progresso reiniciado.')}
 }
 function preview(){
  const w=waves[waveIndex],key=waveIndex+'-'+running+'-'+gameMode+'-'+randomModifier
  if(key===lastPreview)return;lastPreview=key
  document.getElementById('phaseBadge').textContent=running?'BATALHA':'PREPARAÇÃO';document.getElementById('incomingEnemies').innerHTML=w.spawns.map(([type,count])=>{const d=enemyDefs[type];return `<span class="incoming-item" title="${d.name}: ${behaviorLabel(d.behavior)}"><img src="${assetPath(imageMap[d.img])}" alt=""><span>${d.name}<b>×${count}</b></span></span>`}).join('');document.getElementById('laneInfo').textContent=w.lanes.length+' rotas · '+(randomModifier?({inner:'rotas 1 e 2',noSun:'sem Mini Sóis',fast:'velocidade +45%',noUpgrades:'sem upgrades',eccentric:'alta excentricidade'})[randomModifier]:w.topic);document.getElementById('wavePreview').classList.toggle('during-battle',running)
  document.getElementById('labMentor').src=waveIndex<4?assetPath('kepler.png'):assetPath('newton.png');document.getElementById('labTitle').textContent=waveIndex<4?'Laboratório de Kepler':'Laboratório orbital · Newton'
 }
 function tutorial(){
  const el=document.getElementById('tutorial');el.classList.toggle('hidden',tutorialDone||waveIndex!==0||gameMode!=='campaign')
  const hints=['Selecione Mini Sol e clique em um espaço da rota 1 ou 3. Ele financia sua defesa.','Posicione um Mercúrio em cada rota aberta. Barreiras devem ficar à frente.','Clique em Iniciar batalha. Energia e movimento só começam agora.','Quando o Mini Sol brilhar, clique na energia dourada para coletar.','Passe o cursor em um asteroide para descobrir seus atributos e fraquezas.','No checkpoint, experimente a simulação e confirme sua configuração.','Júpiter desbloqueado! Coloque uma barreira à direita dos atacantes.','Clique em um defensor e faça seu primeiro upgrade.']
  document.getElementById('tutorialText').textContent=hints[tutorialStep]||'Sistema pronto. Sua estratégia está em órbita.'
 }
 const powersData=[['flare','☼','Erupção','145 dano solar em todos os alvos'],['freeze','❄','Congelar','Reduz movimento por 6 segundos'],['shift','⇄','Manobra','Move uma construção para um espaço livre'],['slingshot','↗','Estilingue','Lança um inimigo para trás'],['eclipse','◐','Eclipse','Interrompe inimigos por 4 segundos'],['supernova','✹','Supernova','850 dano perfurante em todos os alvos']]
 function powers(){
  const rail=document.getElementById('powerRail')
  if(!rail.children.length)for(const [id,icon,name,desc] of powersData){const b=document.createElement('button');b.dataset.power=id;b.title=name+' · '+desc;b.setAttribute('aria-label',name+' · '+desc);b.innerHTML=`<span>${icon}</span><small>${name}</small><b></b>`;b.onclick=()=>usePower(id);rail.appendChild(b)}
  for(const b of rail.children){const id=b.dataset.power,unlocked=!['slingshot','eclipse','supernova'].includes(id)||(id==='supernova'?Progress.has('supernova'):Progress.has('powers'));b.classList.toggle('hidden',!unlocked);b.disabled=!running||paused||gameOver||!powerCharges[id];b.querySelector('b').textContent=powerCharges[id]||0}
  document.getElementById('researchValue').textContent=Progress.data.research
 }
 function bossBar(){
  const boss=enemies.find(e=>e.isSuperboss)||enemies.find(e=>e.tag==='BOSS'||['blackhole','binary'].includes(e.type)),bar=document.getElementById('bossBar');bar.classList.toggle('hidden',!boss);if(!boss)return;document.getElementById('bossName').textContent=boss.name;document.getElementById('bossPhaseLabel').textContent='Fase '+boss.bossPhase+' · '+Math.ceil(boss.hp)+' HP'+(boss.isSuperboss?' · reforços suspensos':'');document.getElementById('bossHP').style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';bar.classList.toggle('superboss',boss.isSuperboss)
 }
 function debug(){
  heading('DESENVOLVEDOR · F8','Laboratório de testes.','Controles locais para verificar combate, fases e checkpoints.')
  content.innerHTML=`<div class="debug-grid"><button id="debugEnergy">+1.000 energia</button><button id="debugKill">Eliminar todos os alvos</button><button id="debugCheckpoint">Abrir próximo checkpoint</button><button id="debugSuper">Invocar superboss</button><label>Inimigo<select id="debugEnemy">${Object.entries(enemyDefs).map(([id,d])=>`<option value="${id}">${d.name}</option>`).join('')}</select></label><button id="debugSpawn">Invocar na rota 3</button><label>Capítulo<select id="debugStage">${waves.map((w,i)=>`<option value="${i}">${w.short}</option>`).join('')}</select></label><button id="debugSetStage">Carregar capítulo</button><label><input id="debugInvincible" type="checkbox" ${debugState.invincible?'checked':''}>Invencibilidade</label><label><input id="debugHitboxes" type="checkbox" ${debugState.hitboxes?'checked':''}>Hitboxes</label><label><input id="debugFPS" type="checkbox" ${debugState.fps?'checked':''}>FPS</label><label><input id="debugSlow" type="checkbox" ${debugState.slow?'checked':''}>Câmera lenta</label></div>`
  document.getElementById('debugEnergy').onclick=()=>{energy=Math.min(9999,energy+1000);updateHud();showToast('+1.000 energia')}
  document.getElementById('debugKill').onclick=()=>{enemies.forEach(e=>e.hp=0);close();paused=false}
  document.getElementById('debugCheckpoint').onclick=()=>{if(checkpointIndex>=3)return;close();running=true;gameStarted=true;showCheckpoint(waveIndex,checkpointIndex)}
  document.getElementById('debugSuper').onclick=()=>{close();running=true;gameStarted=true;paused=false;spawnSuperboss(waveIndex,Math.min(2,checkpointIndex))}
  document.getElementById('debugSpawn').onclick=()=>{const type=document.getElementById('debugEnemy').value;enemies.push(createEnemy(type,2,{x:1100}));Progress.discover(type);close();running=true;gameStarted=true;paused=false}
  document.getElementById('debugSetStage').onclick=()=>{const phase=Number(document.getElementById('debugStage').value);close();startStage(phase)}
  for(const [id,property] of [['debugInvincible','invincible'],['debugHitboxes','hitboxes'],['debugFPS','fps'],['debugSlow','slow']])document.getElementById(id).onchange=e=>debugState[property]=e.target.checked
 }
 document.getElementById('campaignBtn').onclick=()=>open('campaign');document.getElementById('researchBtn').onclick=()=>open('research');document.getElementById('codexBtn').onclick=()=>open('codex');document.getElementById('settingsBtn').onclick=()=>open('settings');document.getElementById('hubClose').onclick=close
 document.getElementById('tutorialSkip').onclick=()=>{tutorialDone=true;tutorial();saveRun()}
 document.getElementById('speedBtn').onclick=()=>{speedScale=speedScale===1?2:speedScale===2&&Progress.has('supernova')?3:1;document.getElementById('speedBtn').textContent=speedScale+'×'}
 document.getElementById('resultCampaignBtn').onclick=()=>{phaseCompletePending=false;modal.classList.add('hidden');gameOver=true;Progress.data.resume=null;Progress.persist();open('campaign')}
 window.addEventListener('keydown',e=>{
  if(e.key==='F8'){e.preventDefault();if(hub.classList.contains('hidden'))open('debug');else close()}
  if(e.key==='Escape'&&!hub.classList.contains('hidden'))close()
  if(e.key==='Tab'){
   const active=[...document.querySelectorAll('.modal:not(.hidden)')].pop();if(!active)return
   const elements=[...active.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(n=>n.offsetParent!==null),first=elements[0],last=elements[elements.length-1]
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
  }
 })
 applySettings();loadRun();preview();tutorial();powers()
 return {open,close,preview,tutorial,powers,bossBar,applySettings}
})()
