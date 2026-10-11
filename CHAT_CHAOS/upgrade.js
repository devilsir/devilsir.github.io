(() => {
  'use strict';

  const AVATARS = [
    {id:'pixel',icon:'🦊',name:'PIXEL',perk:'CONTEXT HUNTER',desc:'+25 XP em questões Decode the Chat.'},
    {id:'glitch',icon:'👾',name:'GLITCH',perk:'ANTI-CRINGE',desc:'Acertos removem mais Cringe.'},
    {id:'ghost',icon:'👻',name:'GHOST',perk:'TIME BUFFER',desc:'+3 segundos quando a equipe conquista o turno.'},
    {id:'byte',icon:'🐸',name:'BYTE',perk:'COMBO GUARD',desc:'1 erro por capítulo pode preservar o streak.'},
    {id:'nova',icon:'🐱',name:'NOVA',perk:'XP PULSE',desc:'+10% de XP em todos os acertos.'},
    {id:'raccoon',icon:'🦝',name:'RACCOON',perk:'POWER SCAVENGER',desc:'15% de chance de recuperar um poder após acertar.'}
  ];

  const RANDOM_EVENTS = [
    {id:'double',icon:'⚡',title:'DOUBLE DATA DROP',text:'A rede entrou em overdrive. Esta questão vale XP em dobro.',effect:'PRÓXIMO ACERTO ×2 XP'},
    {id:'slow',icon:'🐌',title:'SLOW MODE',text:'O chat ficou lento — uma raridade útil. Vocês ganharam mais tempo para interpretar.',effect:'+10 SEGUNDOS NESTA RODADA'},
    {id:'shield',icon:'🛡️',title:'STREAK FIREWALL',text:'Um firewall protege o combo da equipe ativa contra um erro.',effect:'1 ERRO NÃO QUEBRA O COMBO'},
    {id:'clean',icon:'✨',title:'CRINGE CLEANSE',text:'A moderação automática limpou parte do cringe acumulado.',effect:'−20 PONTOS DE CRINGE'},
    {id:'power',icon:'🎁',title:'POWER DROP',text:'Um pacote misterioso caiu no chat. Um poder usado pode voltar.',effect:'RECUPERE 1 PODER DA EQUIPE'}
  ];

  const CUSTOM_KEY = 'chatChaos.customQuestions.v2';
  const SOUND_KEY = 'chatChaos.sound.v2';
  let selectedAvatars = {};
  let selectingTeam = 0;
  let pendingQuick = false;
  let customQuestions = loadCustomQuestions();
  let editingQuestionId = null;
  let editingCoreIndex = null;
  let audioCtx = null;
  let soundEnabled = localStorage.getItem(SOUND_KEY) !== '0';
  let buzzerPollId = null;
  let currentRoundId = '';
  let eventContinueAction = null;
  let lastEventQuestionKey = '';

  function loadCustomQuestions(){
    try {
      const arr = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
      return Array.isArray(arr) ? arr.filter(validQuestion) : [];
    } catch { return []; }
  }
  function validQuestion(q){return q && Number.isInteger(+q.chapter) && +q.chapter>=0 && +q.chapter<=3 && Array.isArray(q.answers) && q.answers.length===4 && Number.isInteger(+q.correct) && +q.correct>=0 && +q.correct<=3}
  function normalizedQuestions(questions){
    const ids=new Set();
    return questions.filter(validQuestion).map((q,i)=>({
      id:String(q.id||`legacy_${i}`).slice(0,100), chapter:+q.chapter,
      mode:String(q.mode||'Decode the Chat').slice(0,4000),prompt:String(q.prompt||'').slice(0,4000),
      chat:String(q.chat||'').slice(0,4000),slang:String(q.slang||'').slice(0,4000),
      answers:q.answers.map(a=>String(a).slice(0,4000)),correct:+q.correct,
      explain:String(q.explain||'').slice(0,4000),
      contextPt:String(q.contextPt||'').slice(0,4000),
      ...(Number.isInteger(+q.replaces)&&q.replaces!==undefined?{replaces:+q.replaces}:{})
    })).filter(q=>{if(ids.has(q.id))return false;ids.add(q.id);return true});
  }
  customQuestions=normalizedQuestions(customQuestions);
  let teacherDirty=false;
  let teacherSyncing=false;
  let teacherServerReady=false;
  let teacherSaveQueue=Promise.resolve();
  let teacherChangeCounter=0;
  const teacherServerCandidate=/^https?:$/.test(location.protocol);
  function teacherStatus(message){const n=$('#teacherStorageNote');if(n)n.textContent=message}
  function saveLocalQuestions(){
    try{localStorage.setItem(CUSTOM_KEY,JSON.stringify(customQuestions));return true}
    catch{teacherStatus('Não foi possível salvar neste navegador. Use EXPORTAR para fazer backup.');return false}
  }
  function queueTeacherSave(){
    if(!teacherServerReady)return;
    const snapshot=normalizedQuestions(customQuestions);
    const generation=teacherChangeCounter;
    teacherSaveQueue=teacherSaveQueue.catch(()=>{}).then(async()=>{
      const response=await fetch('/api/questions',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({questions:snapshot})
      });
      if(!response.ok)throw new Error('Server save failed: '+response.status);
      if(generation===teacherChangeCounter){teacherDirty=false;teacherStatus('✓ Salvo no servidor em teacher-questions.json e neste navegador.');}
    }).catch(()=>{
      teacherDirty=true;
      teacherServerReady=false;
      teacherStatus('⚠ Servidor indisponível: cópia mantida neste navegador. Use EXPORTAR para backup.');
    });
  }
  function saveCustomQuestions(){
    customQuestions=normalizedQuestions(customQuestions);
    teacherChangeCounter++;teacherDirty=true;saveLocalQuestions();renderTeacherList();
    if(teacherServerReady){teacherStatus('Salvando no servidor…');queueTeacherSave()}
    else if(teacherServerCandidate)teacherStatus('Salvo no navegador; aguardando conexão com o servidor LAN…');
    else teacherStatus('✓ Salvo neste navegador (modo offline). Use EXPORTAR para levar a outro computador.');
  }
  async function syncTeacherFromServer(){
    if(!teacherServerCandidate||teacherSyncing||teacherServerReady)return;
    teacherSyncing=true;
    const priorChange=teacherChangeCounter;
    try{
      const response=await fetch('/api/questions',{cache:'no-store'});
      if(!response.ok)throw new Error('Server unavailable');
      const payload=await response.json();
      if(typeof payload.exists!=='boolean'||!Array.isArray(payload.questions))throw new Error('Unsupported server');
      teacherServerReady=true;
      if(teacherDirty || teacherChangeCounter!==priorChange || (!payload.exists&&customQuestions.length)){
        teacherStatus('Sincronizando personalizações com o servidor…');
        queueTeacherSave();
      } else if(payload.exists){
        customQuestions=normalizedQuestions(payload.questions);
        saveLocalQuestions();
        renderTeacherList();
        if($('#modalTeacher').classList.contains('open')){
          editingQuestionId=null;editingCoreIndex=null;
          const first=teacherEntries()[0];if(first)editQuestion(first.id);
        }
        teacherStatus('✓ Banco de questões carregado de teacher-questions.json. Salvamento LAN ativo.');
      } else teacherStatus('✓ Servidor LAN conectado. Próximas alterações serão salvas em teacher-questions.json.');
    }catch{
      teacherServerReady=false;
      teacherStatus('Modo local: alterações salvas neste navegador. Para salvar em arquivo, use server.py.');
    }finally{teacherSyncing=false}
  }
  function questionPool(){const replaced=new Set(customQuestions.filter(q=>Number.isInteger(+q.replaces)).map(q=>+q.replaces));const core=QUESTIONS.filter((_,i)=>!replaced.has(i));return core.concat(customQuestions.map(q=>({...q,chapter:+q.chapter,correct:+q.correct,custom:true})));}

  // ---------- Audio: generated locally, no audio assets ----------
  function ensureAudio(){
    if(!soundEnabled) return null;
    try { if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended') audioCtx.resume(); return audioCtx; } catch { return null; }
  }
  function tone(freq=440,dur=.09,type='sine',gain=.035,delay=0){
    const ctx=ensureAudio(); if(!ctx) return;
    const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type;o.frequency.value=freq;g.gain.value=0;
    o.connect(g);g.connect(ctx.destination);const t=ctx.currentTime+delay;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.start(t);o.stop(t+dur+.02);
  }
  function playSound(kind){
    if(!soundEnabled)return;
    if(kind==='click') tone(240,.04,'square',.012);
    if(kind==='correct'){tone(520,.08,'triangle',.035);tone(760,.11,'triangle',.03,.07);tone(980,.14,'sine',.025,.15)}
    if(kind==='wrong'){tone(170,.15,'sawtooth',.03);tone(115,.2,'square',.018,.08)}
    if(kind==='boss'){tone(120,.12,'sawtooth',.04);tone(520,.09,'square',.025,.08);tone(820,.14,'triangle',.03,.14)}
    if(kind==='event'){tone(330,.08,'triangle',.025);tone(495,.08,'triangle',.025,.09);tone(660,.12,'triangle',.025,.18)}
    if(kind==='buzz'){tone(880,.12,'square',.04);tone(1175,.12,'square',.025,.1)}
    if(kind==='win'){[440,554,659,880].forEach((f,i)=>tone(f,.22,'triangle',.025,i*.11))}
    if(kind==='tick') tone(900,.035,'square',.012);
  }
  document.addEventListener('click',e=>{if(e.target.closest('button,.btn,.avatar-card,.teacher-item'))playSound('click')},{passive:true});
  function updateSoundButton(){const b=$('#btnSound');if(b){b.textContent=soundEnabled?'♫':'♩';b.title=soundEnabled?'Som ligado':'Som desligado'}}
  $('#btnSound').onclick=()=>{soundEnabled=!soundEnabled;localStorage.setItem(SOUND_KEY,soundEnabled?'1':'0');updateSoundButton();toast(soundEnabled?'Som ligado':'Som desligado')};
  updateSoundButton();

  // ---------- Character Select ----------
  function openCharacterSelect(quick){
    pendingQuick=quick;selectingTeam=0;selectedAvatars={};
    const names=$$('[data-team-input]').slice(0,state.teamCount).map((x,i)=>x.value.trim()||`Team ${i+1}`);
    state._pendingNames=names;
    renderCharacterSelect();showScreen('screen-characters');
  }
  function renderCharacterSelect(){
    const names=state._pendingNames||[];
    $('#avatarTeamTabs').innerHTML=names.map((n,i)=>`<button class="avatar-team-tab ${i===selectingTeam?'active':''} ${selectedAvatars[i]?'ready':''}" data-team-avatar="${i}">${escapeHTML(n)}</button>`).join('');
    $$('[data-team-avatar]').forEach(b=>b.onclick=()=>{selectingTeam=+b.dataset.teamAvatar;renderCharacterSelect()});
    $('#avatarGrid').innerHTML=AVATARS.map(a=>{
      const usedBy=Object.keys(selectedAvatars).find(k=>+k!==selectingTeam && selectedAvatars[k]===a.id);
      const selected=selectedAvatars[selectingTeam]===a.id;
      return `<article class="avatar-card ${selected?'selected':''} ${usedBy!==undefined?'used':''}" data-avatar="${a.id}"><div class="avatar-big">${a.icon}</div><h3>${a.name}</h3><p>${a.desc}</p><div class="avatar-perk">HABILIDADE // ${a.perk}</div></article>`;
    }).join('');
    $$('.avatar-card').forEach(c=>c.onclick=()=>{
      if(c.classList.contains('used'))return;selectedAvatars[selectingTeam]=c.dataset.avatar;playSound('event');
      const next=names.findIndex((_,i)=>!selectedAvatars[i]);if(next!==-1) selectingTeam=next;renderCharacterSelect();
    });
    const chosen=AVATARS.find(a=>a.id===selectedAvatars[selectingTeam]);
    $('#characterPreview').innerHTML=chosen?`<div class="preview-icon">${chosen.icon}</div><div><b>${escapeHTML(names[selectingTeam]||'EQUIPE')} escolheu ${chosen.name}</b><small>${chosen.perk} — ${chosen.desc}</small></div>`:`<div class="preview-icon">?</div><div><b>${escapeHTML(names[selectingTeam]||'TEAM')}</b><small>Escolha um avatar para esta equipe.</small></div>`;
    const ready=Object.keys(selectedAvatars).length;$('#avatarSelectStatus').textContent=`${ready} / ${names.length} ESCOLHIDOS`;
    $('#btnCharactersStart').disabled=ready<names.length;$('#btnCharactersStart').style.opacity=ready<names.length?'.4':'1';
  }
  $('#btnLaunch').onclick=()=>openCharacterSelect(setupIntent==='quick');
  $('#btnCharactersBack').onclick=()=>showScreen('screen-setup');
  $('#btnCharactersStart').onclick=()=>initGame(pendingQuick);

  // ---------- Core state upgrade ----------
  initGame = function(quick=false){
    state.quickPlay=quick;
    state.timerEnabled=$('#optTimer')?.checked??true;
    state.powersEnabled=$('#optHints')?.checked??true;
    state.tutorialEnabled=$('#optTutorial')?.checked??false;
    state.eventsEnabled=$('#optEvents')?.checked??true;
    soundEnabled=$('#optSounds')?.checked??soundEnabled; localStorage.setItem(SOUND_KEY,soundEnabled?'1':'0');updateSoundButton();
    const wantsBuzzer=$('#optBuzzer')?.checked??false;
    state.buzzerEnabled=wantsBuzzer && /^https?:$/.test(location.protocol);
    if(wantsBuzzer&&!state.buzzerEnabled) setTimeout(()=>toast('Buzzer LAN precisa abrir o jogo pelo server.py.'),250);
    const names=state._pendingNames||$$('[data-team-input]').map((x,i)=>x.value.trim()||`Team ${i+1}`);
    state.teams=Array.from({length:state.teamCount},(_,i)=>{
      const avatar=AVATARS.find(a=>a.id===(selectedAvatars[i]||AVATARS[i].id))||AVATARS[i];
      return {name:names[i]||`Team ${i+1}`,avatar,score:0,streak:0,bestStreak:0,correct:0,answered:0,cringe:0,guardUsed:false,powers:{fifty:1,freeze:1,double:1}};
    });
    stopBuzzerPoll();haltTimer(false);state.paused=false;$('#modalPause').classList.remove('open');
    state.currentTeam=0;state.completed=[false,false,false,false,false];state.totalAnswered=0;state.totalCorrect=0;state.startedAt=Date.now();state.eventScoreMultiplier=1;state.eventShield=false;state.waitingForBuzz=false;
    if(quick){startQuickPlay();return}
    renderMap();showScreen('screen-map');if(state.tutorialEnabled)openTutorial();
  };

  startQuickPlay = function(){
    $('#chapterPill').textContent='QUICK PLAY';
    state.currentChapter=99;state.chapterQuestions=(window.ChatChaosAcademy?.chooseQuestions?.(questionPool(),state._quickQuestionCount||16,99)||shuffle(questionPool()).slice(0,Math.min(state._quickQuestionCount||16,questionPool().length)));state.questionIndex=0;showScreen('screen-game');renderTeamRail();loadQuestion();
  };
  startChapter = function(i){
    if(i===4){startBoss();return}
    state.currentChapter=i;state.chapterQuestions=(window.ChatChaosAcademy?.chooseQuestions?.(questionPool().filter(q=>+q.chapter===i),10,i)||shuffle(questionPool().filter(q=>+q.chapter===i)).slice(0,10));state.questionIndex=0;
    state.teams.forEach(t=>t.guardUsed=false);showScreen('screen-game');$('#chapterPill').textContent=CHAPTERS[i].name.toUpperCase();renderTeamRail();loadQuestion();
  };

  const baseRenderMap=renderMap;
  renderMap=function(){
    baseRenderMap();
    $('#mapTeamStrip').innerHTML=state.teams.map(t=>`<div class="team-mini"><span><span class="map-avatar">${t.avatar?.icon||'⚡'}</span>${escapeHTML(t.name)}</span><strong>${t.score} XP</strong></div>`).join('');
  };

  renderTeamRail = function(){
    $('#teamRail').innerHTML=state.teams.map((t,i)=>`<div class="rail-team ${i===state.currentTeam?'active':''}"><div class="rtop"><div class="rail-team-avatar"><span class="rail-avatar">${t.avatar?.icon||'⚡'}</span><b>${escapeHTML(t.name)}</b></div><strong>${t.score}</strong></div><div class="streak">STREAK x${t.streak} ${t.streak>=3?'🔥':''}</div><div class="mini-cringe"><i style="width:${t.cringe||0}%"></i></div></div>`).join('');
    renderPowerbar();renderCringeHud();
  };
  renderPowerbar = function(){
    if(state.waitingForBuzz){$('#powerbar').innerHTML='<span class="buzzer-wait"><i class="buzzer-dot"></i> WAITING FOR BUZZ...</span>';return}
    const t=state.teams[state.currentTeam];if(!t)return;
    $('#powerbar').innerHTML=state.powersEnabled?`<span class="power-label">${t.avatar?.icon||''} ${escapeHTML(t.name)} // TEAM POWERS</span><button class="power" data-power="fifty" ${!t.powers.fifty?'disabled':''}>◐ 50/50 <small>x${t.powers.fifty}</small></button><button class="power" data-power="freeze" ${!t.powers.freeze?'disabled':''}>❄ FREEZE <small>x${t.powers.freeze}</small></button><button class="power" data-power="double" ${!t.powers.double?'disabled':''}>×2 DOUBLE XP <small>x${t.powers.double}</small></button>`:`<span class="power-label">POWERS DISABLED</span>`;
    $$('.power').forEach(b=>b.onclick=()=>usePower(b.dataset.power));
  };
  function renderCringeHud(){
    const t=state.teams[state.currentTeam];if(!t)return;const c=t.cringe||0;$('#cringeValue').textContent=`${c}%`;$('#cringeFill').style.width=`${c}%`;
    const label=c<20?'CLEAN CHAT':c<45?'A LITTLE SUS':c<70?'CRINGE RISING':c<90?'EXTREME CRINGE':'NUCLEAR CRINGE';$('#cringeLabel').textContent=label;$('#cringeLabel').style.color=c<45?'var(--green)':c<70?'var(--yellow)':'var(--red)';
  }

  usePower = function(p){
    if(state.paused||state.answered||state.waitingForBuzz)return;const t=state.teams[state.currentTeam];if(!t||!t.powers[p])return;t.powers[p]--;
    if(p==='fifty'){const qs=$$('.answer-btn');const wrong=qs.filter((_,i)=>i!==state.currentQuestion.correct);shuffle(wrong).slice(0,2).forEach(b=>{b.disabled=true;b.dataset.fifty='1';b.style.opacity=.18});toast('50/50 ativado');playSound('event')}
    if(p==='freeze'){freezeActive=true;haltTimer(true);toast('Cronômetro congelado');playSound('event')}
    if(p==='double'){doubleActive=true;toast('Próximo acerto vale XP em dobro');playSound('event')}
    renderPowerbar();
  };

  // Cronômetro com duração real; não zera quando o jogo é pausado.
  function paintTimer(){
    const full=Math.max(1000,state.timerFullMs||20000);
    const remaining=Math.max(0,state.timerRemainingMs||0);
    state.timer=Math.ceil(remaining/1000);
    $('#timerText').textContent=`${String(Math.floor(state.timer/60)).padStart(2,'0')}:${String(state.timer%60).padStart(2,'0')}`;
    const bossTime=$('#bossTimeText');if(bossTime)bossTime.textContent=$('#timerText').textContent;
    $('#timerRing').style.strokeDashoffset=107*(1-remaining/full);
    $('#timerRing').style.stroke=state.timer<=5?'var(--red)':state.timer<=10?'var(--yellow)':'var(--cyan)';
  }
  function haltTimer(capture=true){
    if(capture&&state.timerDeadline!==null&&state.timerDeadline!==undefined){
      state.timerRemainingMs=Math.max(0,state.timerDeadline-performance.now());
    }
    clearInterval(state.timerId);state.timerId=null;state.timerDeadline=null;
    if(state.timerFullMs)paintTimer();
  }
  function tickTimer(){
    if(state.paused||freezeActive||state.answered||state.waitingForBuzz)return;
    state.timerRemainingMs=Math.max(0,state.timerDeadline-performance.now());
    const previous=state.timer;paintTimer();
    if(state.timer<=5&&state.timer>0&&state.timer!==previous)playSound('tick');
    if(state.timerRemainingMs<=0){haltTimer(false);if($('#screen-boss').classList.contains('active'))answerBoss(-1);else answerQuestion(-1)}
  }
  function resumeTimer(){
    if(!state.timerEnabled||state.paused||state.answered||state.bossAnswered&&$('#screen-boss').classList.contains('active')||state.waitingForBuzz||freezeActive)return;
    haltTimer(false);state.timerDeadline=performance.now()+state.timerRemainingMs;
    state.timerId=setInterval(tickTimer,100);
  }
  startTimer = function(){
    haltTimer(false);
    const t=state.teams[state.currentTeam];const bonus=t?.avatar?.id==='ghost'?3:0;
    state.timerFullMs=((state.timerMax||20)+bonus)*1000;
    state.timerRemainingMs=state.timerFullMs;
    $('#timerWrap').style.display=state.timerEnabled?'grid':'none';const bossTimer=$('#bossTimer');if(bossTimer)bossTimer.classList.toggle('hidden',!state.timerEnabled);paintTimer();
    resumeTimer();
  };

  function chooseEvent(){
    if(!state.eventsEnabled||state.questionIndex===0||Math.random()>.34)return null;
    const key=`${state.currentChapter}:${state.questionIndex}`;if(lastEventQuestionKey===key)return null;lastEventQuestionKey=key;
    const pool=state.buzzerEnabled?RANDOM_EVENTS.filter(e=>['double','slow'].includes(e.id)):RANDOM_EVENTS;return pool[Math.floor(Math.random()*pool.length)];
  }
  function applyEvent(ev){
    state.eventScoreMultiplier=1;state.eventShield=false;
    const t=state.teams[state.currentTeam];
    if(ev.id==='double')state.eventScoreMultiplier=2;
    if(ev.id==='slow')state.slowBonus=10;
    if(ev.id==='shield')state.eventShield=true;
    if(ev.id==='clean'&&t)t.cringe=Math.max(0,(t.cringe||0)-20);
    if(ev.id==='power'&&t){const used=Object.keys(t.powers).filter(k=>t.powers[k]===0);if(used.length)t.powers[used[Math.floor(Math.random()*used.length)]]=1;else t.score+=50;}
    $('#eventIcon').textContent=ev.icon;$('#eventTitle').textContent=ev.title;$('#eventText').textContent=ev.text;$('#eventEffect').textContent=ev.effect;$('#modalEvent').classList.add('open');playSound('event');renderTeamRail();
    $('#activeEventHud').classList.remove('hidden');$('#activeEventHud').textContent=`${ev.icon} ${ev.title} // ${ev.effect}`;
  }

  loadQuestion = function(){
    haltTimer(false);state.answered=false;state.waitingForBuzz=false;freezeActive=false;doubleActive=false;state.timerMax=20;state.slowBonus=0;state.eventScoreMultiplier=1;state.eventShield=false;
    $('#feedback').classList.remove('show');$('#activeEventHud').classList.add('hidden');
    if(state.questionIndex>=state.chapterQuestions.length){finishChapter();return}
    const q=state.currentQuestion=state.chapterQuestions[state.questionIndex];$('#modeBadge').textContent=q.mode.toUpperCase();$('#contextChip').textContent=state.currentChapter===99?'QUICK PLAY':CHAPTERS[state.currentChapter].name.toUpperCase();$('#questionPrompt').textContent=q.prompt;$('#chatBubble').innerHTML=highlightSlang(q.chat,q.slang);
    const speakers=['user_404','pixelPanda','ghost_typing','lagQueen','teacherAFK'];const avatars=['👾','🦊','🐸','👻','🦝'];const r=Math.floor(Math.random()*speakers.length);$('#speakerName').textContent=speakers[r];$('#speakerAvatar').textContent=avatars[r];
    $('#answers').innerHTML=q.answers.map((a,i)=>`<button class="answer-btn" data-i="${i}"><span class="letter">${String.fromCharCode(65+i)}</span><span>${escapeHTML(a)}</span></button>`).join('');$$('[data-i]').forEach(b=>b.onclick=()=>answerQuestion(+b.dataset.i));
    $('#progressText').textContent=`${state.questionIndex+1} / ${state.chapterQuestions.length}`;$('#progressFill').style.width=`${(state.questionIndex/state.chapterQuestions.length)*100}%`;renderTeamRail();
    const ev=chooseEvent();
    if(ev){applyEvent(ev);eventContinueAction=()=>afterQuestionReady();}
    else afterQuestionReady();
  };
  function afterQuestionReady(){
    if(state.buzzerEnabled)beginBuzzerRound('normal');else startTimer();
  }
  $('#btnEventContinue').onclick=()=>{playSound('click');$('#modalEvent').classList.remove('open');const fn=eventContinueAction;eventContinueAction=null;if(fn)fn();};

  answerQuestion = function(i){
    if(state.paused||state.answered||state.waitingForBuzz)return;state.answered=true;haltTimer(true);const q=state.currentQuestion;const t=state.teams[state.currentTeam];t.answered++;state.totalAnswered++;const correct=i===q.correct;
    $$('.answer-btn').forEach((b,idx)=>{b.disabled=true;if(idx===q.correct)b.classList.add('correct');if(idx===i&&!correct)b.classList.add('wrong')});
    if(correct){
      state.totalCorrect++;t.correct++;t.streak++;t.bestStreak=Math.max(t.bestStreak,t.streak);
      let base=100+(state.timerEnabled?Math.round(150*Math.max(0,state.timerRemainingMs||0)/Math.max(1,state.timerFullMs||1)):0)+(t.streak>=3?50:0);if(q.mode==='Decode the Chat'&&t.avatar?.id==='pixel')base+=25;if(doubleActive)base*=2;base*=state.eventScoreMultiplier||1;if(t.avatar?.id==='nova')base*=1.1;base=Math.round(base);t.score+=base;
      t.cringe=Math.max(0,(t.cringe||0)-(t.avatar?.id==='glitch'?15:8));
      if(t.avatar?.id==='raccoon'&&Math.random()<.15){const used=Object.keys(t.powers).filter(k=>t.powers[k]===0);if(used.length){const p=used[Math.floor(Math.random()*used.length)];t.powers[p]=1;toast('🦝 Power Scavenger recuperou um poder!')}}
      $('#feedbackIcon').textContent='✓';$('#feedbackIcon').style.color='var(--green)';$('#feedbackTitle').textContent='SLANG RESTORED';$('#feedbackTitle').style.color='var(--green)';$('#feedbackText').textContent=`+${base} XP · ${q.explain}`;playSound('correct');
    } else {
      const guardedByByte=t.avatar?.id==='byte'&&!t.guardUsed;const shield=state.eventShield||guardedByByte;if(guardedByByte)t.guardUsed=true;if(!shield)t.streak=0;
      t.cringe=Math.min(100,(t.cringe||0)+(i===-1?25:20));
      $('#feedbackIcon').textContent=i===-1?'⌛':'×';$('#feedbackIcon').style.color='var(--red)';$('#feedbackTitle').textContent=i===-1?'TIMEOUT':'TRANSLATION ERROR';$('#feedbackTitle').style.color='var(--red)';$('#feedbackText').textContent=`${shield?'🛡️ Streak protegido. ':''}${q.explain}`;playSound('wrong');
      if(t.cringe>=100){t.score=Math.max(0,t.score-150);t.cringe=60;setTimeout(()=>toast('💀 CRINGE OVERLOAD: −150 XP'),250)}
    }
    state.eventScoreMultiplier=1;state.eventShield=false;$('#feedback').classList.add('show');renderTeamRail();
  };

  $('#btnNext').onclick=()=>{state.questionIndex++;if(!state.buzzerEnabled)state.currentTeam=(state.currentTeam+1)%state.teams.length;loadQuestion()};

  // ---------- Boss upgrade ----------
  startBoss=function(){
    haltTimer(false);stopBuzzerPoll();
    state.currentChapter=4;state.bossIndex=0;state.bossHp=100;state.bossAnswered=false;
    showScreen('screen-boss');$('#chapterPill').textContent='FINAL BOSS';
    $('#bossMonster').classList.remove('rage1','rage2');
    loadBossQuestion();playSound('boss');
  };
  function currentBossQuestion(){return BOSS_QUESTIONS[state.bossIndex % BOSS_QUESTIONS.length]}
  loadBossQuestion = function(){
    if(state.bossHp<=0){state.completed[4]=true;showResults();return}
    if(!BOSS_QUESTIONS.length){toast('Banco de questões do boss vazio.');return}
    haltTimer(false);state.bossAnswered=false;state.answered=false;state.waitingForBuzz=false;state.slowBonus=0;freezeActive=false;doubleActive=false;
    const q=currentBossQuestion();$('#bossPrompt').textContent=q.chat;$('#bossAnswers').innerHTML=q.answers.map((a,i)=>`<button class="answer-btn" data-bi="${i}"><span class="letter">${String.fromCharCode(65+i)}</span><span>${escapeHTML(a)}</span></button>`).join('');$$('[data-bi]').forEach(b=>b.onclick=()=>answerBoss(+b.dataset.bi));$('#bossFeedback').classList.remove('show');$('#bossHpFill').style.width=state.bossHp+'%';$('#bossHpText').textContent=state.bossHp+'%';
    const cycle=Math.floor(state.bossIndex/BOSS_QUESTIONS.length)+1;
    $('#bossRoundStatus').textContent=`CICLO ${cycle} · PERGUNTA ${(state.bossIndex%BOSS_QUESTIONS.length)+1}/${BOSS_QUESTIONS.length} · Derrote o boss para terminar`;
    if(state.buzzerEnabled)beginBuzzerRound('boss');else startTimer();
  };
  function bossDamage(text,blocked=false){
    const layer=$('#damageLayer');const d=document.createElement('div');d.className='damage-number'+(blocked?' blocked':'');d.textContent=text;layer.appendChild(d);setTimeout(()=>d.remove(),800);
    if(!blocked)for(let i=0;i<12;i++){const p=document.createElement('i');p.className='particle';p.style.left=(45+Math.random()*10)+'%';p.style.top=(42+Math.random()*12)+'%';p.style.setProperty('--dx',`${(Math.random()-.5)*260}px`);p.style.setProperty('--dy',`${(Math.random()-.5)*220}px`);layer.appendChild(p);setTimeout(()=>p.remove(),700)}
  }
  answerBoss = function(i){
    if(state.paused||state.waitingForBuzz||state.bossAnswered||state.bossHp<=0)return;
    state.bossAnswered=true;haltTimer(true);
    const q=currentBossQuestion();const t=state.teams[state.currentTeam];const correct=i===q.correct;$$('[data-bi]').forEach((b,idx)=>{b.disabled=true;if(idx===q.correct)b.classList.add('correct');if(idx===i&&!correct)b.classList.add('wrong')});t.answered++;state.totalAnswered++;
    if(correct){t.correct++;state.totalCorrect++;t.score+=300;t.cringe=Math.max(0,(t.cringe||0)-10);state.bossHp=Math.max(0,state.bossHp-20);$('#bossFeedbackIcon').textContent='⚡';$('#bossFeedbackTitle').textContent='CRITICAL HIT!';$('#bossFeedbackTitle').style.color='var(--green)';$('#bossFeedbackText').textContent=`+300 XP · ${q.explain}`;bossDamage('−20 HP');$('#bossMonster').classList.remove('hit');void $('#bossMonster').offsetWidth;$('#bossMonster').classList.add('hit');playSound('boss')}
    else{t.streak=0;t.cringe=Math.min(100,(t.cringe||0)+15);$('#bossFeedbackIcon').textContent='×';$('#bossFeedbackTitle').textContent=i===-1?'TEMPO ESGOTADO':'ATTACK BLOCKED';$('#bossFeedbackTitle').style.color='var(--red)';$('#bossFeedbackText').textContent=q.explain;bossDamage('BLOCKED',true);$('#bossMonster').classList.remove('counter');void $('#bossMonster').offsetWidth;$('#bossMonster').classList.add('counter');playSound('wrong')}
    $('#bossMonster').classList.toggle('rage1',state.bossHp<=60);$('#bossMonster').classList.toggle('rage2',state.bossHp<=20);$('#bossHpFill').style.width=state.bossHp+'%';$('#bossHpText').textContent=state.bossHp+'%';$('#bossFeedback').classList.add('show');renderTeamRail();
  };
  $('#btnBossNext').onclick=()=>{
    if(state.paused||!state.bossAnswered)return;
    if(state.bossHp<=0){state.completed[4]=true;showResults();return}
    state.bossIndex++;if(!state.buzzerEnabled)state.currentTeam=(state.currentTeam+1)%state.teams.length;loadBossQuestion();
  };

  showResults = function(){
    haltTimer(false);stopBuzzerPoll();showScreen('screen-results');const ranked=[...state.teams].sort((a,b)=>b.score-a.score);const order=ranked.length===2?[ranked[1],ranked[0]]:ranked.length>=3?[ranked[1],ranked[0],ranked[2],...ranked.slice(3)]:ranked;
    $('#podium').innerHTML=order.slice(0,3).map(t=>{const rank=ranked.indexOf(t)+1;return `<div class="podium-card ${rank===1?'first':rank===2?'second':'third'}"><div class="podium-rank">${rank===1?'🏆':rank===2?'🥈':'🥉'}</div><div class="podium-avatar">${t.avatar?.icon||'⚡'}</div><h3>${escapeHTML(t.name)}</h3><div class="podium-score">${t.score} XP</div><small>${t.correct}/${t.answered} acertos · ${t.cringe||0}% cringe</small></div>`}).join('');
    const acc=state.totalAnswered?Math.round(state.totalCorrect/state.totalAnswered*100):0;const mins=Math.max(1,Math.round((Date.now()-state.startedAt)/60000));const best=Math.max(...state.teams.map(t=>t.bestStreak));$('#resultStats').innerHTML=`<div class="stat-card"><small>ACCURACY</small><strong>${acc}%</strong></div><div class="stat-card"><small>BEST STREAK</small><strong>x${best}</strong></div><div class="stat-card"><small>SESSION</small><strong>${mins} min</strong></div>`;playSound('win');
  };

  // ---------- Teacher Mode ----------
  function teacherEntries(){
    const overrides=new Map(customQuestions.filter(q=>Number.isInteger(+q.replaces)).map(q=>[+q.replaces,q]));
    const core=QUESTIONS.map((q,i)=>overrides.has(i)?{...overrides.get(i),_source:'override',_coreIndex:i}:{...q,id:`core_${i}`,_source:'core',_coreIndex:i});
    const custom=customQuestions.filter(q=>!Number.isInteger(+q.replaces)).map(q=>({...q,_source:'custom'}));
    return core.concat(custom);
  }
  function openTeacher(){
    syncTeacherFromServer();
    renderTeacherList();
    if(!editingQuestionId&&editingCoreIndex===null){const first=teacherEntries()[0];if(first)editQuestion(first.id)}
    $('#modalTeacher').classList.add('open');
  }
  $('#btnTeacher').onclick=openTeacher;$('#btnTeacherTop').onclick=openTeacher;$('#btnSetupEditor').onclick=openTeacher;
  $('#teacherSearch').addEventListener('input',renderTeacherList);$('#teacherZoneFilter').addEventListener('change',renderTeacherList);
  function renderTeacherList(){
    if(!$('#teacherList'))return;
    const term=$('#teacherSearch').value.trim().toLocaleLowerCase('pt-BR');const zone=$('#teacherZoneFilter').value;
    const entries=teacherEntries().filter(q=>(zone==='all'||zone==='custom'&&(q._source==='custom'||q._source==='override')||String(q.chapter)===zone)&&(!term||[q.prompt,q.chat,q.slang,q.mode,...q.answers].join(' ').toLocaleLowerCase('pt-BR').includes(term)));const overrides=customQuestions.filter(q=>Number.isInteger(+q.replaces)).length;const extras=customQuestions.length-overrides;
    $('#teacherCount').textContent=`${QUESTIONS.length} CORE · ${overrides} EDITED · ${extras} CUSTOM`;
    $('#teacherList').innerHTML=entries.length?entries.map(q=>{
      const active=(editingCoreIndex!==null&&q._coreIndex===editingCoreIndex)||(editingQuestionId&&q.id===editingQuestionId);
      const badge=q._source==='core'?'CORE':q._source==='override'?'EDITED':'CUSTOM';
      return `<div class="teacher-item ${active?'active':''}" data-qid="${q.id}"><b>${escapeHTML(q.prompt||'Untitled question')}</b><small>${badge} // ZONE ${+q.chapter+1} // ${escapeHTML(q.mode||'CUSTOM')}</small></div>`
    }).join(''):'<div class="teacher-note">Nenhuma questão disponível.</div>';
    $$('[data-qid]').forEach(x=>x.onclick=()=>editQuestion(x.dataset.qid));
  }
  function fillQuestionForm(q){
    $('#qChapter').value=q.chapter;$('#qMode').value=q.mode||'Decode the Chat';$('#qPrompt').value=q.prompt||'';$('#qChat').value=q.chat||'';$('#qSlang').value=q.slang||'';$('#qCorrect').value=q.correct??0;
    for(let i=0;i<4;i++){const shown=window.ChatChaosBilingual.display(q,i);$('#qEn'+i).value=shown.en||'';$('#qPt'+i).value=shown.pt||'';}$('#qExplain').value=q.explain||'';$('#qContextPt').value=q.contextPt||'';
    $$('input[name=correctAnswer]').forEach(b=>b.checked=+b.value===+(q.correct??0));renderEditorPreview();
  }
  function newQuestion(){
    editingQuestionId=null;editingCoreIndex=null;$('#qEditId').value='';$('#btnDeleteQuestion').textContent='EXCLUIR';fillQuestionForm({chapter:0,mode:'Decode the Chat',prompt:'',chat:'',slang:'',correct:0,answers:['','','',''],explain:''});renderTeacherList();$('#qPrompt').focus();
  }
  function editQuestion(id){
    if(String(id).startsWith('core_')){
      const i=+String(id).split('_')[1];const q=QUESTIONS[i];if(!q)return;editingCoreIndex=i;editingQuestionId=null;$('#qEditId').value=id;$('#btnDeleteQuestion').textContent='CORE PROTEGIDA';fillQuestionForm(q);renderTeacherList();return;
    }
    const q=customQuestions.find(x=>x.id===id);if(!q)return;editingQuestionId=id;editingCoreIndex=Number.isInteger(+q.replaces)?+q.replaces:null;$('#qEditId').value=id;$('#btnDeleteQuestion').textContent=editingCoreIndex!==null?'RESTAURAR ORIGINAL':'EXCLUIR';fillQuestionForm(q);renderTeacherList();
  }
  function readQuestionForm(){
    return {id:editingQuestionId||`custom_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,chapter:+$('#qChapter').value,mode:$('#qMode').value.trim()||'Custom',prompt:$('#qPrompt').value.trim(),chat:$('#qChat').value.trim(),slang:$('#qSlang').value.trim(),answers:[0,1,2,3].map(i=>`EN: ${$('#qEn'+i).value.trim()} || PT: ${$('#qPt'+i).value.trim()}`),correct:+$('#qCorrect').value,explain:$('#qExplain').value.trim(),contextPt:$('#qContextPt').value.trim()};
  }
  function renderEditorPreview(){
    const box=$('#teacherPreview');if(!box)return;
    const prompt=$('#qPrompt').value.trim()||'Enunciado da pergunta';
    const chat=$('#qChat').value.trim()||'Mensagem ou contexto da questão';
    const correct=+$('#qCorrect').value;
    const options=[0,1,2,3].map(i=>`<div class="teacher-preview-option ${i===correct?'answer-ok':''}"><b>${'ABCD'[i]}${i===correct?' ✓':''}</b><span><strong>${escapeHTML($('#qEn'+i).value||'Alternativa em inglês')}</strong><small>${escapeHTML($('#qPt'+i).value||'Tradução em português')}</small></span></div>`).join('');
    box.innerHTML=`<div class="teacher-preview-head">👁️ PRÉVIA DA PERGUNTA · ${escapeHTML(prompt)}</div><p>${escapeHTML(chat)}</p><div class="teacher-preview-options">${options}</div>`;
  }
  $$('#qPrompt,#qChat,#qCorrect,#qEn0,#qEn1,#qEn2,#qEn3,#qPt0,#qPt1,#qPt2,#qPt3').forEach(el=>el.addEventListener('input',renderEditorPreview));
  $$('input[name=correctAnswer]').forEach(el=>el.addEventListener('change',()=>{$('#qCorrect').value=el.value;renderEditorPreview()}));
  $('#qCorrect').addEventListener('change',()=>{$$('input[name=correctAnswer]').forEach(el=>el.checked=el.value===$('#qCorrect').value);renderEditorPreview()});
  $('#optTimer').addEventListener('change',()=>$('#responseTime').disabled=!$('#optTimer').checked);
  $('#btnNewQuestion').onclick=newQuestion;
  $('#btnSaveQuestion').onclick=()=>{
    const q=readQuestionForm();if(!q.prompt||!q.chat||[0,1,2,3].some(i=>!$('#qEn'+i).value.trim()||!$('#qPt'+i).value.trim())||!q.explain){toast('Preencha enunciado, contexto, quatro alternativas nos dois idiomas e a explicação.');return}
    if(editingCoreIndex!==null){q.id=`override_${editingCoreIndex}`;q.replaces=editingCoreIndex;const old=customQuestions.findIndex(x=>+x.replaces===editingCoreIndex);if(old>=0)customQuestions[old]=q;else customQuestions.push(q);editingQuestionId=q.id;}
    else{const ix=customQuestions.findIndex(x=>x.id===q.id);if(ix>=0)customQuestions[ix]=q;else customQuestions.push(q);editingQuestionId=q.id;}
    saveCustomQuestions();toast(editingCoreIndex!==null?'Questão original atualizada ✓':'Questão salva ✓');playSound('correct');
  };
  $('#btnDeleteQuestion').onclick=()=>{
    if(editingCoreIndex!==null){const before=customQuestions.length;customQuestions=customQuestions.filter(q=>+q.replaces!==editingCoreIndex);if(customQuestions.length===before){toast('Questões CORE não são apagadas. Edite ou duplique.');return}const i=editingCoreIndex;editingQuestionId=null;saveCustomQuestions();editQuestion(`core_${i}`);toast('Versão original restaurada');return}
    if(!editingQuestionId){newQuestion();return}customQuestions=customQuestions.filter(q=>q.id!==editingQuestionId);editingQuestionId=null;saveCustomQuestions();newQuestion();toast('Questão personalizada excluída');
  };
  $('#btnDuplicateQuestion').onclick=()=>{
    let q=null;if(editingCoreIndex!==null)q=customQuestions.find(x=>+x.replaces===editingCoreIndex)||QUESTIONS[editingCoreIndex];else q=customQuestions.find(x=>x.id===editingQuestionId);if(!q)return;
    const copy={...q,id:`custom_${Date.now()}`,prompt:q.prompt+' (cópia)',answers:[...q.answers]};delete copy.replaces;customQuestions.push(copy);editingCoreIndex=null;editingQuestionId=copy.id;saveCustomQuestions();editQuestion(copy.id);toast('Questão duplicada');
  };
  $('#btnExportQuestions').onclick=()=>{const blob=new Blob([JSON.stringify(customQuestions,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='chat-chaos-questions.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
  $('#importQuestions').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const arr=JSON.parse(await f.text());if(!Array.isArray(arr))throw 0;const clean=arr.filter(validQuestion).map((q,i)=>({...q,id:q.id||`import_${Date.now()}_${i}`,chapter:+q.chapter,correct:+q.correct}));customQuestions=clean;editingQuestionId=null;editingCoreIndex=null;saveCustomQuestions();const first=teacherEntries()[0];if(first)editQuestion(first.id);toast(`${clean.length} personalizações importadas`)}catch{toast('JSON inválido ou formato incompatível')}e.target.value=''};
  renderTeacherList();
  syncTeacherFromServer();

  // ---------- LAN buzzer ----------
  function lanAvailable(){return /^https?:$/.test(location.protocol)}
  function updateLanModal(data){
    const ok=lanAvailable();$('#lanStatus').className='lan-status '+(ok?'online':'offline');$('#lanStatus').textContent=ok?'● SERVER MODE AVAILABLE':'● FILE MODE — LAN OFF';$('#lanUrl').textContent=ok?`${location.origin}/buzzer.html`:'Execute server.py e abra o endereço LAN exibido no terminal.';
    if(data){const buzzes=data.buzzes||[];$('#buzzerMonitor').innerHTML=buzzes.length?buzzes.slice(0,8).map((b,i)=>`<div class="buzz-row ${i===0?'winner':''}"><span>${i===0?'⚡ ':''}${escapeHTML(b.teamName||'Team')} ${b.nickname?'· '+escapeHTML(b.nickname):''}</span><small>${Math.round(b.ms||0)} ms</small></div>`).join(''):'<div class="teacher-note">Nenhum buzz nesta rodada.</div>'}
  }
  $('#btnLan').onclick=async()=>{let d=null;if(lanAvailable())try{d=await fetch('/api/state').then(r=>r.json())}catch{}updateLanModal(d);$('#modalLan').classList.add('open')};
  async function beginBuzzerRound(type){
    if(!state.buzzerEnabled)return;stopBuzzerPoll();state.waitingForBuzz=true;haltTimer(false);renderPowerbar();
    const selector=type==='boss'?'[data-bi]':'[data-i]';$$(selector).forEach(b=>b.disabled=true);currentRoundId=`${type}-${Date.now()}-${state.currentChapter}-${state.questionIndex}-${state.bossIndex||0}`;
    try{await fetch('/api/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({round:currentRoundId,teams:state.teams.map((t,i)=>({index:i,name:t.name,avatar:t.avatar?.icon||'⚡'}))})});}
    catch{state.buzzerEnabled=false;state.waitingForBuzz=false;toast('Servidor do buzzer não respondeu. Modo por turnos ativado.');$$(selector).forEach(b=>b.disabled=false);if(type==='normal')startTimer();return}
    $('#activeEventHud').classList.remove('hidden');$('#activeEventHud').innerHTML='<span class="buzzer-wait"><i class="buzzer-dot"></i> PHONES ARMED // WAITING FOR FIRST BUZZ</span>';
    if(state.paused){setBuzzerPaused(true);return;}
    buzzerPollId=setInterval(()=>pollBuzzer(type),350);
  }
  async function pollBuzzer(type){
    if(state.paused)return;
    try{const d=await fetch('/api/state',{cache:'no-store'}).then(r=>r.json());if(state.paused)return;updateLanModal(d);if(d.round!==currentRoundId||!d.winner)return;stopBuzzerPoll();const idx=+d.winner.teamIndex;if(Number.isInteger(idx)&&state.teams[idx])state.currentTeam=idx;state.waitingForBuzz=false;playSound('buzz');toast(`⚡ ${state.teams[state.currentTeam].name} BUZZED FIRST!`);const selector=type==='boss'?'[data-bi]':'[data-i]';$$(selector).forEach(b=>b.disabled=false);$('#activeEventHud').classList.add('hidden');renderTeamRail();if(type==='normal')startTimer();}
    catch{}
  }
  function stopBuzzerPoll(){if(buzzerPollId){clearInterval(buzzerPollId);buzzerPollId=null}}
  let buzzerPauseQueue=Promise.resolve();
  function setBuzzerPaused(paused){
    if(!state.buzzerEnabled||!currentRoundId)return;
    const round=currentRoundId;
    // Serializa pause/resume para um clique rápido não inverter a ordem no servidor.
    buzzerPauseQueue=buzzerPauseQueue.catch(()=>{}).then(()=>fetch('/api/pause',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({round,paused})
    })).catch(()=>{});
  }

  // Centraliza o controle de pausa no módulo que gerencia o timer e o buzzer.
  $('#btnPause').onclick=()=>{
    if(state.paused||!$('#screen-game').classList.contains('active')&&!$('#screen-boss').classList.contains('active'))return;
    state.paused=true;haltTimer(true);stopBuzzerPoll();setBuzzerPaused(true);
    $('#modalPause').classList.add('open');
  };
  $('#btnResume').onclick=()=>{
    if(!state.paused)return;
    state.paused=false;$('#modalPause').classList.remove('open');
    setBuzzerPaused(false);
    if(state.waitingForBuzz){
      const type=$('#screen-boss').classList.contains('active')?'boss':'normal';
      stopBuzzerPoll();buzzerPollId=setInterval(()=>pollBuzzer(type),350);
    }else if($('#screen-game').classList.contains('active')||$('#screen-boss').classList.contains('active'))resumeTimer();
  };
  $('#btnHome').onclick=()=>{
    haltTimer(false);stopBuzzerPoll();state.paused=false;state.waitingForBuzz=false;
    $('#modalPause').classList.remove('open');showScreen('screen-home');
  };

  // add close behavior for dynamically-added modal close buttons (original binding ran before upgrade modals existed in DOM only if markup existed; it did, but ensure it)
  $$('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).classList.remove('open'));

  // keyboard classroom shortcuts: A-D answers; 1-4 simulated team buzz when LAN is off
  document.addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if($('#screen-game').classList.contains('active')&&!state.paused&&!state.answered&&!state.waitingForBuzz&&!$$('.modal.open').length){const n=['a','b','c','d'].indexOf(e.key.toLowerCase());if(n>=0)answerQuestion(n)}
  });

  // Tutorial upgrade
  TUTORIAL.push(
    {title:'Cringe Meter',body:'Erros aumentam o Cringe Meter da equipe; acertos reduzem. Ao chegar a 100%, acontece um CRINGE OVERLOAD e a equipe perde XP.',visual:'CLEAN CHAT → SUS → EXTREME CRINGE → 💀 OVERLOAD'},
    {title:'Eventos aleatórios',body:'Algumas rodadas recebem modificadores como XP em dobro, Slow Mode, Streak Firewall e Power Drop. Leia o evento antes de responder.',visual:'⚡ RANDOM INTERNET EVENT DETECTED'},
    {title:'Buzzer no celular',body:'No modo LAN, abra o jogo pelo server.py. Os alunos entram em /buzzer.html no mesmo Wi‑Fi; o primeiro buzz conquista o turno.',visual:'PHONE → BUZZ → TEAM LOCKED → ANSWER'},
    {title:'Teacher Mode',body:'No menu ✦ Teacher Mode você pode criar, editar, importar e exportar questões. Elas entram automaticamente na campanha.',visual:'NO CODE REQUIRED // CUSTOM QUESTION DATABASE'}
  );

  // keep setup sound checkbox in sync
  if($('#optSounds'))$('#optSounds').checked=soundEnabled;
})();
