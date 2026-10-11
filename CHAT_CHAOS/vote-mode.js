/* v0.7 · Votação coletiva via servidor LAN. Sem dependências externas. */
(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const escape=s=>escapeHTML(String(s??''));
const LAN=/^https?:$/.test(location.protocol);
let mode='projector',newGame=false,roundId='',roundType='',roundStarting=false,revealing=false;
let registrations=[],lastState=null,reviewTimer=null;
let savedProjectorOptions=null;let voteTimerEnabled=true;let gradedRound='';
const GAME_SEL='#screen-game',BOSS_SEL='#screen-boss';
const originalInit=initGame, originalLoad=loadQuestion, originalBoss=loadBossQuestion;
function options(){return $$('input[name="classroomMode"]')}
function selected(){return options().find(x=>x.checked)?.value||'projector'}
function updateMode(){
 const vote=selected()==='vote';
 if(!vote&&savedProjectorOptions){
   for(const [key,value] of Object.entries(savedProjectorOptions))$(key).checked=value;
   savedProjectorOptions=null;
 }
 $('#memberConfig').classList.toggle('hidden',!vote);
 $('#optBuzzer').closest('label').classList.toggle('hidden',vote);
 $('#playmodeNote').textContent=vote?'Celulares: cada aluno vota. O cronômetro encerra a votação automaticamente, ou o professor pode revelar antes. Empate não pontua.': 'Projetor: uma resposta por turno, com buzzer opcional.';
 if(vote)updateMemberRows();
}
function updateMemberRows(){
 const box=$('#memberRows');
 const previous=Object.fromEntries($$('[data-member-index]').map(el=>[el.dataset.memberIndex,el.value]));
 box.innerHTML=Array.from({length:state.teamCount},(_,i)=>{
  const name=$$('[data-team-input]')[i]?.value?.trim()||`Equipe ${i+1}`;
  const v=previous[i]||6;
  return `<label><span>👥 ${escape(name)}</span><input type="number" min="1" max="40" step="1" data-member-index="${i}" value="${v}"/><small>integrantes (1–40)</small></label>`;
 }).join('');
}
options().forEach(b=>b.addEventListener('change',updateMode));
$('#teamCountButtons').addEventListener('click',()=>setTimeout(updateMemberRows,0));
$('#teamForm').addEventListener('input',()=>setTimeout(updateMemberRows,0));
updateMode();
// Captura configuração antes da engine montar o mapa ou a primeira questão.
initGame=function(quick=false){
 mode=selected();
 if(mode==='vote'&&!LAN){toast('📱 Votação precisa do servidor LAN. Execute START_LAN.bat e abra o endereço exibido.');return}
 if(mode==='vote'){
   if(!savedProjectorOptions)savedProjectorOptions={
     '#optBuzzer':$('#optBuzzer').checked,'#optEvents':$('#optEvents').checked,
     '#optTimer':$('#optTimer').checked,'#optHints':$('#optHints').checked
   };
   voteTimerEnabled=$('#optTimer').checked;
   const inputs=$$('[data-member-index]');
   if(inputs.length!==state.teamCount||inputs.some(x=>!Number.isInteger(+x.value)||+x.value<1||+x.value>40)){
     toast('Informe entre 1 e 40 integrantes para cada equipe.');return;
   }
   registrations=inputs.map(x=>+x.value);
   $('#optBuzzer').checked=false;
   $('#optEvents').checked=false;
   $('#optTimer').checked=false;
   $('#optHints').checked=false;
 }
 newGame=true;roundId='';roundStarting=false;revealing=false;gradedRound='';
 document.body.classList.toggle('vote-mode',mode==='vote');
 state.voteTimerEnabled=mode==='vote'&&voteTimerEnabled;
 originalInit(quick);
 state.playMode=mode;
 if(mode==='vote'){$('#optTimer').checked=voteTimerEnabled;}
 if(mode==='vote'){
   state.playMode='vote';
   state.buzzerEnabled=false;
   state.timerEnabled=false;state.voteTimerEnabled=voteTimerEnabled;state.powersEnabled=false;state.eventsEnabled=false;
   $('#btnLan').title='Ver endereço para os celulares';
   toast('📱 Votação coletiva ativa. Cada integrante entra pelo celular!');
 }
};
const baseSelect=$('#btnCharactersStart').onclick;
$('#btnCharactersStart').onclick=()=>{
 if(selected()==='vote'&&!LAN){toast('Inicie o servidor LAN (START_LAN.bat) para usar os celulares.');return}
 baseSelect();
};
async function api(path,data){
 const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 const payload=await response.json();if(!response.ok)throw new Error(payload.error||String(response.status));return payload;
}
function activePanel(){return $(roundType==='boss'?'#votePanelBoss':'#votePanelGame')}
function hidePanels(){['#votePanelGame','#votePanelBoss'].forEach(sel=>$(sel).classList.add('hidden'))}
function lockScreen(){
 const sel=roundType==='boss'?'[data-bi]':'[data-i]';
 $$(sel).forEach(b=>b.disabled=true);
 state.waitingForBuzz=true; // Prevent projector answers / keyboard while phones vote.
 if(roundType==='normal'){$('#helpTools').classList.add('hidden');$('#translationHelp').classList.add('hidden')}
 else $('#bossHelp').classList.add('hidden');
 $('#powerbar').classList.add('hidden');
}
function renderVotes(data){
 const box=activePanel();if(!box||!data)return;
 const joined=data.teams?.reduce((n,t)=>n+(t.registered||0),0)||0;
 const total=data.teams?.reduce((n,t)=>n+t.members,0)||0;
 const votes=data.teams?.reduce((n,t)=>n+(t.voted||0),0)||0;
 const remaining=typeof data.timeRemainingSeconds==='number'?Math.max(0,data.timeRemainingSeconds):null;
 const formatted=remaining===null?'SEM LIMITE':`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
 const rows=(data.teams||[]).map(t=>`<div class="vote-team"><strong>${escape(t.avatar||'⚡')} ${escape(t.name)}</strong><div class="vote-progress"><i style="width:${Math.min(100,Math.round(100*(t.voted||0)/t.members))}%"></i></div><span>${t.voted||0}/${t.members} votos · ${t.registered||0} conectados</span></div>`).join('');
 box.classList.remove('hidden');
 box.innerHTML=`<div class="vote-heading"><div><b>📱 VOTAÇÃO DAS EQUIPES</b><small>${votes}/${total} votos · ${joined}/${total} integrantes conectados</small></div><span class="vote-clock ${remaining!==null&&remaining<=10&&!data.voteClosed?'ending':''}">${data.voteClosed?'RESULTADO':data.paused?'⏸ '+formatted:'⏱ '+formatted}</span></div>
  <div class="vote-teams">${rows}</div>
  <div class="vote-footer"><div>📲 Acesse <strong>${escape(location.origin+'/buzzer.html')}</strong> no mesmo Wi‑Fi.</div><button class="btn primary vote-reveal" ${roundStarting||revealing||data.voteClosed||data.paused?'disabled':''}>🗳️ ENCERRAR E REVELAR VOTOS</button></div>
  <p class="vote-explainer">${data.paused?'⏸ Pausado: os alunos não podem votar.':data.voteClosed?'Votação encerrada; continue pelo botão PRÓXIMA.':'As escolhas individuais ficam secretas até revelar. Se houver empate, a equipe não pontua. Ao esgotar o tempo, os votos são revelados automaticamente.'}</p>`;
 const button=box.querySelector('.vote-reveal');if(button)button.onclick=reveal;
}
function queueVoteRound(type){
 if(mode!=='vote')return;
 hidePanels();roundType=type;state.waitingForBuzz=true;roundStarting=true;revealing=false;gradedRound='';
 lockScreen();
 roundId=`vote-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
 const rid=roundId;
 const question=type==='boss'?BOSS_QUESTIONS[state.bossIndex%BOSS_QUESTIONS.length]:state.currentQuestion;
 const payload={mode:'vote',round:rid,newGame,timeLimitSeconds:state.voteTimerEnabled?(state.responseTimeSeconds||60):0,teams:state.teams.map((t,i)=>({index:i,name:t.name,avatar:t.avatar?.icon||'⚡',members:registrations[i]})),
  question:{prompt:type==='boss'?'Escolha a melhor interpretação da mensagem.':question.prompt,chat:question.chat,answers:question.answers.map((_,i)=>window.ChatChaosBilingual.display(question,i).en),words:window.ChatChaosWords.tokens(question,14),type}};
 // Loading is allowed while the host displays the random event modal; no vote starts until the API resets.
 api('/api/reset',payload).then(data=>{
   if(roundId!==rid){api('/api/stop',{round:rid}).catch(()=>{});return;}
   newGame=false;roundStarting=false;lastState=data;
   if(state.paused)api('/api/pause',{round:rid,paused:true}).catch(()=>{});
   renderVotes(data);
 }).catch(()=>{
   if(roundId!==rid)return;
   roundStarting=false;toast('Servidor LAN desconectado. Veja o terminal e retome a rodada.');
   const panel=activePanel();panel.classList.remove('hidden');
   panel.innerHTML='<b>⚠️ Servidor indisponível.</b><p>Reconecte o servidor e clique em tentar novamente.</p><button class="btn primary" id="voteRetry">TENTAR NOVAMENTE</button>';
   $('#voteRetry').onclick=()=>queueVoteRound(type);
 });
}
loadQuestion=function(){
 originalLoad();
 if(mode==='vote'&&state.currentQuestion&&state.questionIndex<state.chapterQuestions.length){
  queueVoteRound('normal');
 }
};
loadBossQuestion=function(){
 originalBoss();
 if(mode==='vote'&&state.bossHp>0)queueVoteRound('boss');
};
async function reveal(){
 if(mode!=='vote'||roundStarting||revealing||state.paused||!roundId)return;
 revealing=true;
 try{
  const result=await api('/api/close-vote',{round:roundId});
  if(result.round!==roundId||gradedRound===roundId)return;gradedRound=roundId;
  state.waitingForBuzz=false;
  const grading=window.ChatChaosAcademy.gradeMajority(result.results,roundType==='boss');
  const question=roundType==='boss'?BOSS_QUESTIONS[state.bossIndex%BOSS_QUESTIONS.length]:state.currentQuestion;
  const sel=roundType==='boss'?'[data-bi]':'[data-i]';
  $$(sel).forEach((b,i)=>{b.disabled=true;if(i===question.correct)b.classList.add('correct')});
  const stateNow=await fetch('/api/state',{cache:'no-store'}).then(r=>r.json());
  if(roundId===result.round){lastState=stateNow;renderVotes(stateNow)}
  toast(`📊 Votos revelados: ${grading.winners} equipe(s) acertaram.`);
 }catch(e){toast('Falha ao revelar os votos: '+e.message);revealing=false}
}
reviewTimer=setInterval(async()=>{
 if(mode!=='vote'||!roundId||roundStarting||revealing&&lastState?.voteClosed)return;
 try{
  const response=await fetch('/api/state',{cache:'no-store'}).then(r=>r.json());
  if(response.mode==='vote'&&response.round===roundId){lastState=response;renderVotes(response);if(response.voteClosed&&!gradedRound&&!revealing&&!response.paused)reveal()}
 }catch{}
},800);
const pauseBase=$('#btnPause').onclick;
$('#btnPause').onclick=()=>{pauseBase();if(mode==='vote'&&roundId)api('/api/pause',{round:roundId,paused:true}).catch(()=>{})};
const resumeBase=$('#btnResume').onclick;
$('#btnResume').onclick=()=>{resumeBase();if(mode==='vote'&&roundId)api('/api/pause',{round:roundId,paused:false}).catch(()=>{})};
const homeBase=$('#btnHome').onclick;
$('#btnHome').onclick=()=>{homeBase();if(mode==='vote'){
  // Clear the current question on students' phones when class finishes.
  api('/api/stop',{round:roundId}).catch(()=>{});
  roundId='';mode='projector';document.body.classList.remove('vote-mode');hidePanels();
 }};
window.ChatChaosVoting={get mode(){return mode},get round(){return roundId},get state(){return lastState},reveal};
})();
