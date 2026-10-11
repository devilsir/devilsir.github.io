/* CHAT CHAOS v0.6 · Classroom Academy
   Progressive teaching tools without external dependencies. Loaded after upgrade.js.
   The original scoring, LAN buzzer and Teacher Mode remain the source of truth. */
(() => {
'use strict';
const qs=(s)=>document.querySelector(s);
const qsa=(s)=>[...document.querySelectorAll(s)];
const safe=(v)=>escapeHTML(String(v??''));
const STORE='chatChaos.slangdex.v1';
const base = { initGame, startQuickPlay, startChapter, loadQuestion, answerQuestion, startTimer, renderTeamRail, renderMap, usePower, finishChapter, startBoss, loadBossQuestion, answerBoss, showResults };
let difficulty='newbie', grade=6, questionLimit=16, enableReview=true;
let helpShown=false, secondArmed=false, secondMiss=false;
let challengeHistory=[], guidedStep=0, guidedCompleted=false, afterGuide=null;
let unlocked={};
try{const x=JSON.parse(localStorage.getItem(STORE)||'{}');if(x&&typeof x==='object'&&!Array.isArray(x))unlocked=x;}catch{}
const levels={newbie:{label:'NEWBIE · fácil',time:30,hintPenalty:0,xp:1},pro:{label:'PRO · médio',time:20,hintPenalty:15,xp:1.1},legend:{label:'LEGEND · difícil',time:15,hintPenalty:35,xp:1.25}};
const readableModes={
 'Decode the Chat':'DECODIFIQUE A CONVERSA','Build the Reply':'ESCOLHA A RESPOSTA',
 'Slang Emergency':'CORRIJA A MENSAGEM','Impostor Slang':'ENCONTRE O IMPOSTOR',
 'Context Check':'ENTENDA O CONTEXTO','Gaming Lobby':'LOBBY DO JOGO',
 'Tone Check':'QUAL É O TOM?','Social Feed':'FEED DE MEMES',
 'Meaning Match':'COMBINE O SIGNIFICADO','Stream Chat':'CHAT AO VIVO',
 'Reply Simulator':'SIMULADOR DE RESPOSTAS','Fill the Blank':'COMPLETE A FRASE',
 'Detective Chat':'DETETIVE DO CHAT','Meme Caption':'LEGENDA DO MEME',
 'Speed Chat':'CHAT RÁPIDO'};
const meta=[
  {icon:'💬',name:'CHAT DE GRUPO',intro:'Descubra a intenção da mensagem, como num grupo de amigos.',format:'💬 Decifre o chat e responda'},
  {icon:'🎮',name:'LOBBY DE JOGO',intro:'Você entrou na partida! Complete a mensagem dos jogadores.',format:'🎮 Escolha a ação mais natural'},
  {icon:'📱',name:'FEED DE MEMES',intro:'Leia o post, descubra a legenda ou a reação certa.',format:'📱 Interprete o post ou meme'},
  {icon:'📺',name:'CHAT AO VIVO',intro:'As mensagens correm rápido! Entenda o comentário do stream.',format:'⚡ Decodifique o chat da live'}
];
const vocabulary={
  "i'm":'eu estou',"i’m":'eu estou',"i":'eu',"you":'você',"your":'seu/sua',"we":'nós',"we're":'nós estamos',"we’re":'nós estamos',"they":'eles/elas',"their":'deles/delas',"my":'meu/minha',"me":'me/mim',"he":'ele',"she":'ela',"her":'dela',"it":'isso',"it's":'isso é',"this":'este/isso',"that":'aquele/isso',"the":'o/a',"a":'um/uma',"an":'um/uma',"and":'e',"but":'mas',"or":'ou',"so":'então',"because":'porque',"when":'quando',"where":'onde',"what":'o que',"why":'por quê',"how":'como',"if":'se',"now":'agora',"later":'mais tarde',"today":'hoje',"tomorrow":'amanhã',"yesterday":'ontem',"after":'depois',"before":'antes',"soon":'em breve',"always":'sempre',"never":'nunca',"everyone":'todo mundo',"nobody":'ninguém',"someone":'alguém',"only":'apenas',"really":'realmente',"very":'muito',"too":'demais',"more":'mais',"less":'menos',"no":'não',"not":'não',"don't":'não',"didn't":'não',"can't":'não consigo',"can":'pode/consegue',"need":'preciso',"want":'quero',"please":'por favor',"thanks":'obrigado(a)',"good":'bom',"bad":'ruim',"great":'ótimo',"nice":'legal',"strong":'forte',"weak":'fraco',"new":'novo',"old":'velho',"best":'melhor',"worst":'pior',"right":'certo',"wrong":'errado',"fast":'rápido',"slow":'devagar',"hard":'difícil',"easy":'fácil',"rare":'raro',"free":'grátis',"friend":'amigo',"friends":'amigos',"class":'aula/turma',"test":'prova',"homework":'lição de casa',"school":'escola',"teacher":'professor(a)',"notes":'anotações',"help":'ajuda',"game":'jogo',"match":'partida',"player":'jogador',"players":'jogadores',"team":'equipe',"character":'personagem',"weapon":'arma',"boss":'chefão',"win":'ganhar',"won":'ganhou',"lost":'perdeu',"lose":'perder',"play":'jogar',"playing":'jogando',"join":'entrar/participar',"call":'chamada',"chat":'conversa',"message":'mensagem',"text":'mensagem de texto',"post":'publicação',"video":'vídeo',"photo":'foto',"photos":'fotos',"link":'link',"follow":'seguir',"like":'curtir',"comments":'comentários',"online":'conectado',"offline":'desconectado',"internet":'internet',"phone":'celular',"computer":'computador',"stream":'live',"live":'ao vivo',"watch":'assistir',"watching":'assistindo',"send":'enviar',"sent":'enviou',"got":'conseguiu/recebeu',"get":'obter',"have":'ter',"has":'tem',"had":'tinha',"say":'dizer',"said":'disse',"tell":'contar/avisar',"know":'saber',"think":'pensar',"look":'olhar',"see":'ver',"saw":'viu',"made":'fez',"make":'fazer',"do":'fazer',"doing":'fazendo',"going":'indo',"go":'ir',"went":'foi',"left":'saiu',"started":'começou',"start":'começar',"finished":'terminou',"missed":'perdeu/não conseguiu ir',"forgot":'esqueceu',"studied":'estudou',"study":'estudar',"tried":'tentou',"try":'tentar',"found":'encontrou',"find":'encontrar',"gotta":'preciso',"gonna":'vou',"is":'é/está',"was":'era/estava',"are":'são/estão',"were":'eram/estavam',"be":'ser/estar',"with":'com',"without":'sem',"from":'de',"to":'para',"in":'em',"on":'em',"at":'em',"for":'para',"about":'sobre',"up":'para cima',"down":'para baixo',"out":'fora',"all":'todos',"some":'alguns',"every":'cada',"this":'este/isso',"these":'estes',"those":'aqueles',"there":'lá',"here":'aqui',"our":'nosso',"their":'deles',"people":'pessoas',"thing":'coisa',"things":'coisas',"time":'tempo',"day":'dia',"night":'noite',"week":'semana',"year":'ano',"hour":'hora',"hours":'horas',"minute":'minuto',"minutes":'minutos',"again":'de novo',"together":'juntos',"still":'ainda',"already":'já',"just":'só/acabei de',"finally":'finalmente',"someone":'alguém',"nothing":'nada',"something":'algo',"everything":'tudo',"anything":'qualquer coisa',"been":'estado',"than":'do que',"even":'até mesmo',"outfit":'visual/roupa',"funny":'engraçado',"cool":'legal',"angry":'com raiva',"sad":'triste',"happy":'feliz',"tired":'cansado',"stuck":'preso',"kept":'continuou',"keep":'continuar',"talk":'conversar',"talking":'conversando',"coming":'chegando',"back":'de volta',"next":'próximo',"last":'último',"first":'primeiro',"round":'rodada',"level":'nível',"update":'atualização',"patch":'atualização do jogo',"developers":'desenvolvedores',"legendary":'lendário',"rare":'raro',"beat":'derrotar',"beaten":'derrotado'
};
const phrases=[
  [/everyone (?:is|was) going to/i,'todo mundo vai'],[/i (?:have|got) (?:three|two) tests? tomorrow/i,'tenho provas amanhã'],[/i (?:have|haven't) studied/i,'(não) estudei'],[/we (?:defeated|beat) the boss/i,'derrotamos o chefão'],[/nobody can beat (?:them|him|her)/i,'ninguém consegue derrotar'],[/let me know/i,'me avise'],[/you want to join/i,'quer participar'],[/in my head/i,'na minha cabeça'],[/look at this/i,'olhe isso'],[/that was close/i,'essa foi por pouco'],[/i don.t understand/i,'não entendo'],[/good luck/i,'boa sorte']
];
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()}
function pickTerm(q){
  if(!q)return null;
  const target=norm(q.slang).replace(/[^a-z0-9]/g,'');
  const exact=SLANGS.find(s=>norm(s.term).replace(/[^a-z0-9]/g,'')===target);
  if(exact)return exact;
  // Do not guess a keyword from an explanation: only find whole displayed terms.
  const hit=SLANGS.filter(s=>s.term.length>=3 && new RegExp('(^|[^a-z])'+s.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=[^a-z]|$)','i').test(q.chat||''));
  return hit[0]||null;
}
function termId(s){return norm(s).replace(/[^a-z0-9]+/g,'-')}
function rarity(term){const n=term.length;return n>=10?'LENDÁRIA':n>=5?'RARA':'COMUM'}
function visualTag(tag){return {gaming:'🎮',chat:'💬',social:'💜',internet:'⚡',stream:'📺',forum:'🗨️'}[tag]||'✨'}
function showCardCollection(){
  const all=SLANGS.map(s=>({...s,seen:!!unlocked[termId(s.term)]}));
  const total=all.filter(x=>x.seen).length;
  qs('#collectionStats').innerHTML=`<strong>${total} / ${SLANGS.length}</strong><span>cartas conhecidas • cada acerto pode desbloquear uma!</span>`;
  const active=qs('#collectionFilter').dataset.active||'all';
  const filters=[['all','Todas'],['collected','Desbloqueadas'],['missing','A descobrir']];
  qs('#collectionFilter').innerHTML=filters.map(([k,t])=>`<button class="filter-chip ${active===k?'active':''}" data-filter="${k}">${t}</button>`).join('');
  qsa('[data-filter]').forEach(b=>b.onclick=()=>{qs('#collectionFilter').dataset.active=b.dataset.filter;showCardCollection()});
  const shown=all.filter(s=>active==='all'||(active==='collected'?s.seen:!s.seen));
  qs('#cardGrid').innerHTML=shown.map(s=>`<article class="slang-card ${s.seen?'unlocked':'locked-card'} ${rarity(s.term).toLowerCase()}" tabindex="0">
    <div class="card-top"><span>${visualTag(s.tag)} ${safe(s.tag.toUpperCase())}</span><small>${rarity(s.term)}</small></div>
    <img loading="lazy" src="assets/cards/${termId(s.term)}.svg" alt="Ilustração de ${safe(s.term)}" />
    <strong>${s.seen?safe(s.term):'???'}</strong><p>${s.seen?safe(s.meaning):'Descubra esta expressão respondendo durante uma partida.'}</p>
    <small>${s.seen?'✓ DESBLOQUEADA':'🔒 NÃO DESCOBERTA'}</small></article>`).join('');
  qs('#modalCards').classList.add('open');
}
function unlockCard(q,team){
  const entry=pickTerm(q);if(!entry)return null;
  const id=termId(entry.term);team.cards=team.cards||[];
  if(!team.cards.includes(id))team.cards.push(id);
  const first=!unlocked[id];unlocked[id]=true;
  try{localStorage.setItem(STORE,JSON.stringify(unlocked))}catch{}
  if(first){toast('🃏 NOVA CARTA: '+entry.term.toUpperCase());return entry}
  return null;
}
function titleFor(score){return score>=2500?'🏆 Lenda da internet':score>=1200?'⚡ Mestre das slangs':score>=500?'🧩 Decodificador':'🌱 Aprendiz do chat'}
function levelFor(score){return 1+Math.floor(Math.sqrt(Math.max(0,score)/200))}
function renderLearningProgress(){
  if(!state.teams?.length)return;
  qs('#learningProgress').innerHTML=`<span>🎓 ${levels[difficulty].label} · ${grade}º ano</span><div class="learning-teams">${state.teams.map((t,i)=>`<div class="learning-team ${i===state.currentTeam?'turn':''}"><span>${t.avatar?.icon||'⚡'} ${safe(t.name)}</span><b>NÍVEL ${levelFor(t.score)}</b><small>🃏 ${(t.cards||[]).length} cartas · ${titleFor(t.score)}</small></div>`).join('')}</div>`;
}
function updateSetupHelp(){
  difficulty=qs('#difficulty').value;
  const text={newbie:'Vocabulário neutro em português · dicas grátis · revisão dos erros.',pro:'Pistas de leitura opcionais, sem revelar a gíria · XP bônus.',legend:'Questões mais complexas · pistas sem spoilers · XP extra.'}[difficulty];
  qs('#difficultySummary').textContent=`${qs('#responseTime').selectedOptions[0].textContent} por pergunta · ${text}`;
}
qs('#difficulty').addEventListener('change',updateSetupHelp);
qs('#responseTime').addEventListener('change',updateSetupHelp);
qs('#classGrade').addEventListener('change',e=>{grade=+e.target.value;if(grade===6)qs('#difficulty').value='newbie';if(grade===8||grade===9)qs('#difficulty').value='pro';updateSetupHelp()});
updateSetupHelp();
function collectSettings(){
  difficulty=qs('#difficulty').value; grade=+qs('#classGrade').value;questionLimit=+qs('#questionCount').value;
  enableReview=qs('#optReview').checked;state.responseTimeSeconds=+qs('#responseTime').value||60;challengeHistory=[];
}
initGame=function(quick=false){
  collectSettings();
  if(quick && qs('#optTutorial').checked && !guidedCompleted){
    afterGuide=()=>initGame(true);openGuided();return;
  }
  base.initGame(quick);
  state.academy={difficulty,grade,review:enableReview};
  state.questionAttempts={};
  state.teams.forEach(t=>{t.cards=[];t.secondChance=1;t.bossShield=1;t.assists=0;});
  if(quick){renderLearningProgress();if(state.currentQuestion)drawAidUI();}
};
startQuickPlay=function(){state._quickQuestionCount=questionLimit;base.startQuickPlay();};
startChapter=function(i){base.startChapter(i);};
function styleMap(){
  if(!qs('#chapterGrid'))return;
  qsa('.chapter-card').forEach((card,i)=>{
    card.setAttribute('aria-label',`${CHAPTERS[i].name}. ${i===0||state.completed[i-1]?'Disponível':'Bloqueado'}`);
    const status=card.querySelector('.chapter-status');
    if(status){status.innerHTML=status.innerHTML.replace('CLICK TO ENTER','ENTRAR NO MUNDO').replace('LOCKED','BLOQUEADO').replace('RESTORED','CONCLUÍDO');}
  });
  const coach=qs('#mapCoach');if(coach){const done=state.completed.slice(0,4).filter(Boolean).length;coach.querySelector('p').textContent=done===4?'Todas as zonas recuperadas! Hora de derrotar BOOMER.EXE.':`Zonas restauradas: ${done}/4. Leia a conversa, peça pistas e colecione cartas. Você está indo bem!`;}
}
renderMap=function(){base.renderMap();styleMap()};
renderTeamRail=function(){base.renderTeamRail();renderLearningProgress()};
function scrambleHint(q){
  const items=window.ChatChaosWords.tokens(q,difficulty==='newbie'?16:10);
  const chips=items.map(([en,pt])=>`<button type="button" class="word-chip" data-safe-word="${safe(en)}" title="Ver os diferentes sentidos desta palavra"><b>${safe(en)}</b><span>→ ${safe(pt)}</span></button>`).join('');
  return `<b>🧩 Monte o sentido palavra por palavra</b><p>Leia a mensagem e as alternativas em inglês. Use palavras soltas de ambos os textos; descubra quais sentidos fazem sentido. <strong>O significado da gíria investigada permanece oculto.</strong></p>${chips?`<div class="word-chips">${chips}</div>`:'<p>Não há palavras neutras disponíveis nesta frase. Observe o contexto.</p>'}<small>Toque numa palavra para ver exemplos no dicionário. Não mostramos a tradução da frase nem das respostas antes de você escolher.</small>`;
}
qs('#translationHelp').addEventListener('click',e=>{
  const chip=e.target.closest('[data-safe-word]');
  if(chip&&window.ChatChaosLanguageLab){window.ChatChaosLanguageLab.openDetail('word',chip.dataset.safeWord)}
});
function drawBilingual(q,isBoss=false){
  const container=qs(isBoss?'#bossAnswers':'#answers');
  if(!container||!q)return;
  container.innerHTML=q.answers.map((original,i)=>{
    const pair=window.ChatChaosBilingual.display(q,i);
    return `<button class="answer-btn bilingual-option" ${isBoss?`data-bi="${i}"`:`data-i="${i}"`}><span class="letter">${'ABCD'[i]}</span><span class="option-lines"><span class="option-en"><em>EN</em>${safe(pair.en)}</span></span></button>`;
  }).join('');
  qsa(isBoss?'[data-bi]':'[data-i]').forEach(b=>{b.onclick=()=>isBoss?answerBoss(+b.dataset.bi):answerQuestion(+b.dataset.i)});
}
function revealTranslation(q,isBoss=false){
  if(!q)return;
  const correct=window.ChatChaosBilingual.display(q,q.correct);
  const container=qs(isBoss?'#bossAnswers':'#answers');
  const label=container?.querySelector(`${isBoss?'[data-bi]':'[data-i]'}[${isBoss?'data-bi':'data-i'}="${q.correct}"]`);
  if(label&&correct.pt&&correct.pt!==correct.en){
    const lines=label.querySelector('.option-lines');
    if(lines&&!lines.querySelector('.option-pt'))lines.insertAdjacentHTML('beforeend',`<span class="option-pt"><em>PT</em>${safe(correct.pt)}</span>`);
  }
  const panel=qs(isBoss?'#bossFeedbackText':'#feedbackText');
  if(panel&&!panel.querySelector('.post-translation')){
    const answer=correct.pt&&correct.pt!==correct.en?correct.pt:correct.en;
    panel.insertAdjacentHTML('beforeend',`<div class="post-translation">📖 Agora podemos conferir a tradução: <strong>${'ABCD'[q.correct]}.</strong> ${safe(answer)}</div>`);
  }
}
function drawWorld(q){
  const ch=state.currentChapter===99?+q.chapter:state.currentChapter;
  const z=meta[ch]||meta[0];
  const type=String(q.mode||'').toLowerCase();
  let label='ESCOLHA UMA ALTERNATIVA';
  if(/reply|respond|resposta|complete|fill|missing/i.test(type+' '+q.prompt))label='✍️ Complete ou responda a mensagem';
  else if(/impostor|emergency|erro|estranha/i.test(type+' '+q.prompt))label='🔎 Encontre o impostor da conversa';
  else if(/tone|meaning|context/i.test(type+' '+q.prompt))label='🧠 Entenda o contexto';
  else if(ch===2)label='💟 Escolha a melhor legenda / reação';
  else if(ch===3)label='⚡ Responda antes de o chat passar';
  qs('#formatCallout').textContent=label;
  qs('#questionCard').dataset.world=String(ch);
  if(ch===0)qs('#worldStage').innerHTML='<div class="world-preview chat-preview"><span>● online · 💬 grupo da turma</span><div>📩 Nova mensagem recebida</div></div>';
  if(ch===1)qs('#worldStage').innerHTML='<div class="world-preview game-preview"><span>🎮 MATCH FOUND</span><strong>PIXEL QUEST // LOBBY</strong><div>🔋 HP ███████░░░ &nbsp; 🏆 RANKED</div></div>';
  if(ch===2)qs('#worldStage').innerHTML='<div class="world-preview social-preview"><span>📱 FOR YOU · @internet.news</span><strong>✦ TRENDING POST</strong><div>♥ 2.4k &nbsp; 💬 128 &nbsp; ↗ 36</div></div>';
  if(ch===3)qs('#worldStage').innerHTML='<div class="world-preview live-preview"><span>🔴 LIVE · 2,391 assistindo</span><div>⭐ mod_crew: chat ativo!</div><div>💜 xXuserXx: hype! hype!</div></div>';
  qs('#contextChip').textContent=z.name;
  qs('#modeBadge').textContent=`${z.icon} ${readableModes[q.mode]||q.mode||z.name}`;
}
function drawAidUI(){
  const t=state.teams[state.currentTeam];if(!t)return;
  qs('#translationHelp').classList.add('hidden');helpShown=false;secondArmed=false;secondMiss=false;
  qs('#btnTranslate').textContent=difficulty==='newbie'?'🧩 MONTAR COM PALAVRAS':'🧩 PISTAS DE PALAVRAS';
  qs('#btnTranslate').disabled=false;
  qs('#btnSecondChance').disabled=!t.secondChance;
  qs('#btnSecondChance').textContent=`💛 SEGUNDA CHANCE ×${t.secondChance}`;
  qs('#helpCounter').textContent=difficulty==='newbie'?'AJUDA GRATUITA':`PISTA: −${levels[difficulty].hintPenalty} XP SE ACERTAR`;
}
const setStageLabels=()=>{
  const fb=qs('#feedbackTitle');if(fb.textContent==='SLANG RESTORED')fb.textContent='ACERTOU! 🎉';
  if(fb.textContent==='TRANSLATION ERROR')fb.textContent='BOA TENTATIVA!';
  if(fb.textContent==='TIMEOUT')fb.textContent='TEMPO ESGOTADO';
};
loadQuestion=function(){
  // Original engine prepares the question, LAN round, event popup and active team.
  base.loadQuestion();
  if(!state.currentQuestion || state.questionIndex>=state.chapterQuestions.length)return;
  const q=state.currentQuestion;
  drawWorld(q);drawBilingual(q);drawAidUI();renderLearningProgress();
  if(difficulty==='newbie'){
    // Wait until the projector/voting wrapper has finished preparing its round.
    setTimeout(()=>{
      if(q!==state.currentQuestion||state.waitingForBuzz||state.playMode==='vote'||state.answered||state.paused)return;
      const box=qs('#translationHelp');
      if(box.classList.contains('hidden')){
        box.innerHTML=scrambleHint(q);box.classList.remove('hidden');helpShown=true;
        qs('#btnTranslate').disabled=true;state.teams[state.currentTeam].assists++;
      }
    },0);
  }
  if(q._review){qs('#formatCallout').innerHTML='🔁 REVISÃO INTELIGENTE: você já viu essa gíria. Tente de novo!';qs('#questionCard').classList.add('review-round');}
  else qs('#questionCard').classList.remove('review-round');
};
startTimer=function(){
  const chosen=state.responseTimeSeconds||60;
  const slowBonus=state.slowBonus||0;
  state.timerMax=chosen+slowBonus;
  base.startTimer();
};
qs('#btnTranslate').onclick=()=>{
  if(state.answered||state.waitingForBuzz||state.paused)return;
  helpShown=true;state.teams[state.currentTeam].assists++;
  qs('#translationHelp').innerHTML=scrambleHint(state.currentQuestion);
  qs('#translationHelp').classList.remove('hidden');qs('#btnTranslate').disabled=true;
};
qs('#btnSecondChance').onclick=()=>{
  if(state.answered||state.waitingForBuzz||state.paused||secondArmed)return;
  const team=state.teams[state.currentTeam];if(!team.secondChance)return;
  secondArmed=true;qs('#btnSecondChance').classList.add('active');
  toast('💛 Segunda Chance pronta! Você pode errar uma vez e tentar novamente.');
};
function scheduleReview(q){
  if(!enableReview||q._review||!state.chapterQuestions)return;
  const key=q.id||`${q.chapter}:${q.chat}`;
  if(state.questionAttempts[key])return;
  state.questionAttempts[key]=1;
  const insert=Math.min(state.chapterQuestions.length,state.questionIndex+4);
  state.chapterQuestions.splice(insert,0,{...q,_review:true});
}
answerQuestion=function(i){
  if(state.paused||state.answered||state.waitingForBuzz)return;
  const q=state.currentQuestion, t=state.teams[state.currentTeam];
  if(!q||!t)return;
  if(secondArmed&&!secondMiss&&i>=0&&i!==q.correct){
    t.secondChance=Math.max(0,t.secondChance-1);secondMiss=true;
    const b=qs(`[data-i="${i}"]`);if(b){b.disabled=true;b.classList.add('wrong');b.style.opacity='.4'}
    qs('#formatCallout').textContent='💛 Uma tentativa a mais! Essa opção não era a correta. Escolha outra.';
    if(state.timerEnabled&&Number.isFinite(state.timerDeadline))state.timerDeadline+=5000;
    qs('#btnSecondChance').disabled=true;qs('#btnSecondChance').classList.remove('active');
    return;
  }
  const wasCorrect=i===q.correct;
  const preScore=t.score;
  const oldLevel=levelFor(preScore);
  if(!wasCorrect&&difficulty==='newbie')t.cringe=Math.min(t.cringe||0,35);
  const usedHint=helpShown;
  const useRetry=secondMiss;
  base.answerQuestion(i);
  if(!state.answered)return;
  const questionSlug=pickTerm(q)?.term||q.slang||'expressão';
  const record={term:questionSlug,world:q.chapter,correct:wasCorrect,review:!!q._review,team:t.name,time:Date.now()};
  challengeHistory.push(record);
  if(wasCorrect){
    let gains=t.score-preScore;
    const expBoost=levels[difficulty].xp;
    const adjustment=Math.round(gains*(expBoost-1));
    const penalty=(usedHint?levels[difficulty].hintPenalty:0)+(useRetry&&difficulty!=='newbie'?15:0);
    const bonus=Math.max(0,adjustment-penalty);
    t.score=Math.max(preScore,t.score+adjustment-penalty);
    const newCard=unlockCard(q,t);
    if(levelFor(t.score)>oldLevel)toast(`🏅 NÍVEL ${levelFor(t.score)}! Nova moldura desbloqueada.`);
    const gained=t.score-preScore;
    qs('#feedbackTitle').textContent=q._review?'MEMÓRIA RESTAURADA! 🧠':'MANDOU BEM! 🎉';
    qs('#feedbackText').textContent=`+${gained} XP · ${q.explain}${q.custom&&q.contextPt?' · 🗺️ Nota: '+q.contextPt:''}${newCard?' · 🃏 Carta '+newCard.term+' desbloqueada!':''}`;
  }else{
    scheduleReview(q);
    qs('#feedbackTitle').textContent=i<0?'TEMPO ESGOTADO ⏰':'QUASE! VAMOS APRENDER 💡';
    qs('#feedbackText').textContent=`A resposta certa era ${String.fromCharCode(65+q.correct)}: ${q.answers[q.correct]}. ${q.explain}${q.custom&&q.contextPt?' · 🗺️ Nota: '+q.contextPt:''}${enableReview&&!q._review?' 🔁 Essa gíria voltará mais tarde para revisar.':''}`;
    if(difficulty==='newbie'&&t.cringe>=60)t.cringe=Math.min(60,t.cringe);
  }
  revealTranslation(q);
  renderTeamRail();
};
renderMap=function(){base.renderMap();styleMap()};
finishChapter=function(){const current=state.currentChapter;base.finishChapter();if(current<4){renderMap();}}
function refreshPowerbar(){
  qsa('.power-label').forEach(x=>{if(!state.waitingForBuzz)x.textContent='⚡ PODERES DA EQUIPE'});
  qsa('[data-power="fifty"]').forEach(x=>{x.title='Remove duas alternativas erradas.';x.innerHTML=`◐ 50/50 <small>×${state.teams[state.currentTeam]?.powers.fifty??0}</small>`});
  qsa('[data-power="freeze"]').forEach(x=>{x.title='Para o cronômetro até responder.';x.innerHTML=`❄ CONGELAR <small>×${state.teams[state.currentTeam]?.powers.freeze??0}</small>`;});
  qsa('[data-power="double"]').forEach(x=>{x.title='Dobra o XP da resposta correta.';x.innerHTML=`×2 XP EM DOBRO <small>×${state.teams[state.currentTeam]?.powers.double??0}</small>`;});
}
usePower=function(p){base.usePower(p);refreshPowerbar()};
// Integrate visual descriptions without interfering with click handlers from the previous engine.
const oldRail=renderTeamRail;renderTeamRail=function(){oldRail();refreshPowerbar();qsa('.rail-team').forEach((e,i)=>e.dataset.level=levelFor(state.teams[i]?.score||0));const t=state.teams[state.currentTeam];if(t){const c=t.cringe||0;qs('#cringeLabel').textContent=c<20?'CHAT TRANQUILO':c<45?'UM POUCO SUSPEITO':c<70?'CRINGE SUBINDO':c<90?'CRINGE ALTO':'CRINGE MÁXIMO';}};
function phase(){return state.bossHp<=20?3:state.bossHp<=60?2:1}
const phaseNames={1:'FASE 1 · DECIFRE O CONTEXTO',2:'FASE 2 · FIREWALL MALUCO',3:'FASE 3 · MODO RAGE'};
const taunts={1:['“LOL = Lots of Lasagna!”','“Não conseguem me traduzir!”','“Vou transformar tudo em erro 404!”'],2:['“FIREWALL ATIVADO: HA HA HA!”','“Minha CPU não aguenta esse português!”','“Ainda tenho mais slangs!”'],3:['“SISTEMA EM PÂNICO!”','“VOCÊS ESTÃO MUITO OP!”','“GLHF... SOCORRO!”']};
function showPhase(){
  const p=phase();
  qs('#bossPhaseBubble').textContent=`${p===1?'👾':p===2?'🧱':'🔥'} ${phaseNames[p]} — ${taunts[p][state.bossIndex%3]}`;
  qs('#bossMonster').dataset.phase=String(p);
  qs('#bossInstruction').textContent=p===1?'Interprete a mensagem sem tradução pronta. Cada acerto tira HP do BOOMER.EXE.':p===2?'BOOMER.EXE ativou o firewall! Pense no contexto para atravessá-lo.':'MODO RAGE! Mais glitches visuais, mas as respostas continuam justas.';
  qs('#btnBossShield').textContent=`🛡️ ESCUDO ×${state.teams[state.currentTeam]?.bossShield??1}`;
  qs('#btnBossShield').disabled=!state.teams[state.currentTeam]?.bossShield;
}
startBoss=function(){base.startBoss();state.teams.forEach(t=>t.bossShield=1);drawBilingual(BOSS_QUESTIONS[state.bossIndex%BOSS_QUESTIONS.length],true);showPhase()};
loadBossQuestion=function(){base.loadBossQuestion();if(state.bossHp>0){drawBilingual(BOSS_QUESTIONS[state.bossIndex%BOSS_QUESTIONS.length],true);showPhase();qs('#bossHintPanel').classList.add('hidden');qs('#btnBossHint').disabled=false}};
qs('#btnBossHint').onclick=()=>{
  if(state.bossAnswered||state.waitingForBuzz||state.paused)return;
  const q=BOSS_QUESTIONS[state.bossIndex%BOSS_QUESTIONS.length];
  const terms=SLANGS.filter(s=>s.term.length>=3&&new RegExp(s.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i').test(q.chat||'')).slice(0,3);
  qs('#bossHintPanel').innerHTML=`<b>💡 Dica sem spoilers</b><p>Leia a frase por partes. Compare a ordem das informações e elimine opções que mudam o sentido geral.</p><small>As traduções das gírias aparecem somente após a resposta.</small>`;
  qs('#bossHintPanel').classList.remove('hidden');qs('#btnBossHint').disabled=true;
};
qs('#btnBossShield').onclick=()=>{
  if(state.bossAnswered||state.waitingForBuzz||state.paused)return;
  const team=state.teams[state.currentTeam];if(!team.bossShield)return;
  team.bossShield--;team._bossShieldArmed=true;
  qs('#btnBossShield').textContent='🛡️ ESCUDO ATIVO';qs('#btnBossShield').disabled=true;toast('Escudo protege sua equipe do próximo erro no boss.');
};
answerBoss=function(i){
  if(state.paused||state.waitingForBuzz||state.bossAnswered||state.bossHp<=0)return;
  const team=state.teams[state.currentTeam],oldHp=state.bossHp,oldScore=team.score,oldCringe=team.cringe,oldStreak=team.streak;
  const q=BOSS_QUESTIONS[state.bossIndex%BOSS_QUESTIONS.length],correct=i===q.correct;
  base.answerBoss(i);
  if(!state.bossAnswered)return;
  const record={term:'BOSS · '+(q.slang||q.chat.slice(0,35)),world:4,correct,review:false,team:team.name,time:Date.now()};challengeHistory.push(record);
  if(correct){
    const boost=levels[difficulty].xp;
    const extra=Math.round((team.score-oldScore)*(boost-1));team.score+=extra;
    if(levelFor(team.score)>levelFor(oldScore))toast(`🏅 NÍVEL ${levelFor(team.score)}! Moldura melhorada.`);
    if(extra)qs('#bossFeedbackText').textContent+=` · +${extra} XP bônus ${levels[difficulty].label}`;
    if(oldHp>60&&state.bossHp<=60 || oldHp>20&&state.bossHp<=20){qs('#bossFeedbackText').textContent+=' · ⚡ BOOMER.EXE MUDOU DE FASE!';}
    qs('#bossFeedbackTitle').textContent='ATAQUE CRÍTICO! ⚡';
  }else{
    qs('#bossFeedbackTitle').textContent=i===-1?'TEMPO ESGOTADO':'BLOQUEADO! APRENDA E TENTE DE NOVO';
    qs('#bossFeedbackText').textContent=`Resposta: ${String.fromCharCode(65+q.correct)}. ${q.answers[q.correct]}. ${q.explain}`;
    if(team._bossShieldArmed){team.cringe=oldCringe;team.streak=oldStreak;qs('#bossFeedbackText').textContent+=' 🛡️ Seu escudo evitou a penalidade!';}
    else if(phase()>=2){team.cringe=Math.min(100,team.cringe+5);qs('#bossFeedbackText').textContent+=' 🔥 O boss aplicou +5 de Cringe!';}
  }
  team._bossShieldArmed=false;
  showPhase();revealTranslation(q,true);renderTeamRail();
};
showResults=function(){
  base.showResults();
  const wrong=challengeHistory.filter(r=>!r.correct),done=challengeHistory.filter(r=>r.correct);
  const missed=[...new Set(wrong.map(r=>r.term))].slice(0,14);
  const retries=done.filter(r=>r.review).length;
  qs('#resultLearning').innerHTML=`<div class="results-section-head"><div><div class="section-kicker">RELATÓRIO PEDAGÓGICO</div><h3>O que a turma aprendeu?</h3></div><span>🎓 ${grade}º ano · ${levels[difficulty].label}</span></div>
    <div class="result-insights"><div><strong>${done.length}</strong><small>respostas certas</small></div><div><strong>${retries}</strong><small>revisões acertadas</small></div><div><strong>${new Set(done.map(r=>r.term)).size}</strong><small>expressões praticadas</small></div></div>
    <div class="report-terms"><b>🧠 Revisar depois da aula:</b><p>${missed.length?missed.map(w=>`<span>${safe(w)}</span>`).join(''):'Nenhuma expressão pendente — excelente!'}</p></div>
    <div class="award-results">${state.teams.map(t=>`<div class="award"><span>${t.avatar?.icon||'⚡'}</span><strong>${safe(t.name)}</strong><b>NÍVEL ${levelFor(t.score)}</b><small>${titleFor(t.score)} · ${(t.cards||[]).length} cartas</small></div>`).join('')}</div>`;
};
qs('#btnExportReport').onclick=()=>{
  const headers=['equipe','expressao','zona','acertou','revisao','data'];
  const rows=challengeHistory.map(r=>[r.team,r.term,r.world===4?'Boss':(meta[r.world]?.name||''),r.correct?'Sim':'Não',r.review?'Sim':'Não',new Date(r.time).toLocaleString('pt-BR')]);
  const quote=s=>'"'+String(s??'').replaceAll('"','""')+'"';
  const csv='\uFEFF'+[headers,...rows].map(row=>row.map(quote).join(';')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='chat-chaos-relatorio-v06.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
qs('#btnCardsHome').onclick=showCardCollection;
qs('#btnCardsResults').onclick=showCardCollection;
// Visual tutorial with three executable practice steps; no XP or team consequences.
const guideData=[
 {head:'1. Descubra pelo contexto',message:'"GG! That was a fun game!"',help:'🧩 Fun = divertido; game = jogo. O que a pessoa quis comunicar com GG?',buttons:['Nice match!','I need a nap.','I dislike this game.','Message me tomorrow.'],correct:0,detail:'GG = Good Game (boa partida). A explicação aparece depois do acerto.'},
 {head:'2. Use uma pista',message:'"My friend is waiting outside."',help:'Apoio: friend = amigo(a); outside = fora / do lado de fora. Cada palavra ajuda a montar o sentido.',buttons:['◐ ENTENDI · USAR PISTAS'],correct:0,detail:'Na partida, as pistas mostram palavras isoladas, não traduções prontas.'},
 {head:'3. Ataque o chefão',message:'"I forgot to study and the test is tomorrow. I’m cooked!"',help:'🧩 Forgot = esqueci; study = estudar; tomorrow = amanhã. Qual reação faz sentido?',buttons:['I am in trouble.','I am preparing lunch.','I just won the game.','I have plenty of time.'],correct:0,detail:'Cooked pode significar estar em apuros. Compare o contexto para decidir.'}
];
function openGuided(){guidedStep=0;guidedCompleted=false;qs('#modalGuided').classList.add('open');renderGuide()}
function renderGuide(){
  const info=guideData[guidedStep];qs('#guideSteps').innerHTML=guideData.map((_,i)=>`<span class="${i===guidedStep?'active':i<guidedStep?'done':''}">${i<guidedStep?'✓':i+1}</span>`).join('');
  qs('#guideContent').innerHTML=`<h3>${info.head}</h3><div class="guide-chat">${safe(info.message)}</div><p>${info.help}</p><div class="guide-answers">${info.buttons.map((v,i)=>`<button data-guide-choice="${i}">${safe(v)}</button>`).join('')}</div><div class="guide-feedback" id="guideFeedback" role="status"></div>`;
  qs('#guideNext').disabled=true;qs('#guideNext').textContent=guidedStep===2?'COMEÇAR A JOGAR →':'PRÓXIMA ETAPA →';
  qsa('[data-guide-choice]').forEach(b=>b.onclick=()=>{
    const idx=+b.dataset.guideChoice;if(idx!==info.correct){b.classList.add('wrong');qs('#guideFeedback').textContent='Quase! Tente outra alternativa.';return}
    qsa('[data-guide-choice]').forEach(x=>x.disabled=true);b.classList.add('correct');qs('#guideFeedback').textContent='🎉 '+info.detail;qs('#guideNext').disabled=false;
  });
}
function endGuide(){qs('#modalGuided').classList.remove('open');guidedCompleted=true;const callback=afterGuide;afterGuide=null;if(callback)callback();}
qs('#guideSkip').onclick=endGuide;
qs('#guideNext').onclick=()=>{if(guidedStep<guideData.length-1){guidedStep++;renderGuide()}else endGuide()};
openTutorial=function(){afterGuide=null;openGuided()};
qs('#btnHowTo').onclick=openTutorial;
// Preserve the complete traditional instructions as optional in the original modal via shortcut.
// Closing the card modal is handled by the core data-close binding.
// Recommended labels for beginner-level students.
qs('#btnQuickPlay').textContent='⚡ AULA RÁPIDA';
qs('#btnCharactersStart').textContent='COMEÇAR A JOGAR →';
qs('#btnNext').textContent='PRÓXIMA →';
qs('#btnBossNext').textContent='PRÓXIMO ATAQUE →';
qs('#btnGlossary').title='Dicionário de gírias';
const showWords=()=>{
 const search=String(qs('#glossarySearch').value||'').toLowerCase().trim();
 const list=Object.entries(window.ChatChaosWords.entries).filter(([en,pt])=>!window.ChatChaosWords.blacklist.has(en)&&(en.includes(search)||pt.toLowerCase().includes(search)));
 qs('#glossaryGrid').innerHTML=list.slice(0,250).map(([en,pt])=>`<article class="glossary-item"><b>${safe(en)}</b><p>${safe(pt)}</p></article>`).join('')+(list.length>250?`<p class="dictionary-guidance">Mostrando 250 de ${list.length}. Digite para encontrar outras palavras.</p>`:'');
};
let showingWords=false;
qs('#dictionaryCount').textContent=Object.keys(window.ChatChaosWords.entries).filter(k=>!window.ChatChaosWords.blacklist.has(k)).length;
const baseRenderGlossary=renderGlossary;
renderGlossary=function(search=''){if(showingWords){showWords();return;}baseRenderGlossary(search)};
qs('#dictWords').onclick=()=>{showingWords=true;qs('#dictWords').classList.add('active');qs('#dictSlangs').classList.remove('active');qs('#dictWords').setAttribute('aria-selected','true');qs('#dictSlangs').setAttribute('aria-selected','false');qs('#glossarySearch').placeholder='Buscar palavra em inglês ou português...';showWords()};
qs('#btnWordBankHome').onclick=()=>{qs('#glossarySearch').value='';qs('#dictWords').click();qs('#modalGlossary').classList.add('open')};
qs('#dictSlangs').onclick=()=>{showingWords=false;qs('#dictWords').classList.remove('active');qs('#dictSlangs').classList.add('active');qs('#dictWords').setAttribute('aria-selected','false');qs('#dictSlangs').setAttribute('aria-selected','true');qs('#glossarySearch').placeholder='Buscar gíria...';baseRenderGlossary(qs('#glossarySearch').value)};
const baseSearch=qs('#glossarySearch').oninput;
qs('#glossarySearch').oninput=e=>{if(showingWords)showWords();else baseSearch(e)};
qs('#btnTeacher').textContent='✦ MODO PROFESSOR';
qs('#btnTeacherTop').title='Modo Professor';
qs('#btnHome').title='Menu principal';
// Exposed diagnostic surface for deterministic browser tests (no editing or network capabilities).
function chooseQuestions(pool,count,chapter){
  // The three levels differ in both timing and question complexity; retain custom questions.
  const randomized=shuffle(pool);
  const score=q=>{
    const answers=q.answers||[];
    const pts=answers.filter(a=>/\b(que|para|porque|com|quando|está|você|pessoa|alguém|jogo|muito|não|uma|sim|depois|esse|isso|quero|obrigado|aula|partida|nenhum|personagem|certo|errado|mensagem|time)\b/i.test(a)||/[àáâãéêíóôõúç]/i.test(a)).length;
    const brief=String(q.chat||'').length<125;
    const helpful=!!q.contextPt;
    const beginnerMode=/Fill the Blank|Reply Simulator|Meme Caption|Detective Chat|Build the Reply|Meaning Match/i.test(q.mode||'');
    const deepMode=/Context Check|Tone Check|Impostor Slang|Slang Emergency|Decode the Chat/i.test(q.mode||'');
    const complexity=(String(q.chat||'').length/50)+(answers.join(' ').length/160)+(deepMode?1:0);
    if(difficulty==='newbie')return pts*.82+(brief?1.3:0)+(helpful?1:0)+(beginnerMode?2:0)-complexity*.3+(Math.random()*1.3);
    if(difficulty==='legend')return complexity+(deepMode?2:0)+(pts<2?.75:0)+(Math.random()*2);
    return (helpful?1:0)+(deepMode?1:0)+(beginnerMode?1:0)+(Math.random()*3);
  };
  const ranked=randomized.map(q=>({q,weight:score(q)}));
  ranked.sort((a,b)=>b.weight-a.weight);
  return ranked.slice(0,Math.max(1,Math.min(count,ranked.length))).map(x=>x.q);
}
const countLabel=qs('.home-tags span:nth-child(2)');if(countLabel)countLabel.textContent=`${QUESTIONS.length+BOSS_QUESTIONS.length} QUESTÕES`;
function gradeMajority(results,isBoss){
  const q=isBoss?BOSS_QUESTIONS[state.bossIndex%BOSS_QUESTIONS.length]:state.currentQuestion;
  let winners=0,wrong=0;
  const items=[];
  for(const r of results){
    const t=state.teams[r.teamIndex];if(!t)continue;
    const choice=r.choice;
    const accepted=choice!==null&&Number.isInteger(choice);
    const correct=accepted&&choice===q.correct;
    const oldScore=t.score;
    let gain=0;
    let award='';
    if(accepted){
      t.answered++;state.totalAnswered++;
      if(correct){
        t.correct++;state.totalCorrect++;t.streak++;
        t.bestStreak=Math.max(t.bestStreak,t.streak);
        gain=Math.round((isBoss?300:100+Math.min(t.streak,5)*20)*levels[difficulty].xp);
        if(t.avatar?.id==='nova')gain=Math.round(gain*1.1);
        if(!isBoss&&q.mode==='Decode the Chat'&&t.avatar?.id==='pixel')gain+=25;
        t.score+=gain;t.cringe=Math.max(0,(t.cringe||0)-8);
        if(!isBoss){const c=unlockCard(q,t);if(c)award=' · 🃏 Nova carta!'}
        if(levelFor(t.score)>levelFor(oldScore))award+=' · 🏅 Subiu de nível!';
        winners++;
      }else{
        t.streak=0;t.cringe=Math.min(difficulty==='newbie'?60:100,(t.cringe||0)+12);wrong++;
      }
      challengeHistory.push({term:isBoss?'BOSS · '+q.chat.slice(0,30):(pickTerm(q)?.term||q.slang||'expressão'),world:isBoss?4:q.chapter,correct,review:!!q._review,team:t.name,time:Date.now()});
    }else if(r.tie)wrong++;
    const answer=accepted?'ABCD'[choice]:(r.tie?'EMPATE':'SEM VOTO');
    items.push(`<div class="vote-result-row ${correct?'vote-correct':accepted?'vote-wrong':'vote-neutral'}"><strong>${safe(t.avatar?.icon||'⚡')} ${safe(t.name)}</strong><span>${safe(answer)} ${correct?'✓':accepted?'✗':'–'}</span><small>${r.votes}/${r.members} votos ${r.tie?'· empate: sem ponto':''}${gain?' · +'+gain+' XP':''}${award}</small><div class="vote-result-counts">${r.counts.map((n,i)=>`<span>${'ABCD'[i]}: ${n}</span>`).join('')}</div></div>`);
  }
  if(!isBoss&&wrong)scheduleReview(q);
  if(isBoss){
    if(winners>0)state.bossHp=Math.max(0,state.bossHp-20);
    qs('#bossHpFill').style.width=state.bossHp+'%';qs('#bossHpText').textContent=state.bossHp+'%';
    qs('#bossFeedbackTitle').textContent=winners?'ATAQUE EM EQUIPE! ⚡':'BOSS BLOQUEOU O ATAQUE';
    qs('#bossFeedbackText').innerHTML=`<div class="vote-result-list">${items.join('')}</div><p><strong>Resposta correta: ${'ABCD'[q.correct]}.</strong> ${safe(q.explain)}${q.custom&&q.contextPt?' · 🗺️ '+safe(q.contextPt):''}</p>`;
    state.bossAnswered=true;qs('#bossFeedback').classList.add('show');showPhase();
  }else{
    qs('#feedbackTitle').textContent=winners?'VOTAÇÃO REVELADA! 🎉':'VAMOS REVISAR! 🧠';
    qs('#feedbackText').innerHTML=`<div class="vote-result-list">${items.join('')}</div><p><strong>Resposta correta: ${'ABCD'[q.correct]}.</strong> ${safe(q.explain)}${q.custom&&q.contextPt?' · 🗺️ '+safe(q.contextPt):''}</p>`;
    qs('#feedback').classList.add('show');state.answered=true;
  }
  renderTeamRail();
  return {winners,wrong,correct:q.correct};
}
window.ChatChaosAcademy={chooseQuestions,gradeMajority,get settings(){return {difficulty,grade,questionLimit,enableReview}},get rounds(){return challengeHistory.slice()},get collected(){return Object.keys(unlocked).filter(k=>unlocked[k])},get phase(){return phase()},get world(){return state.currentChapter}};
})();
