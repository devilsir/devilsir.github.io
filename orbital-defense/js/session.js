const Session=(()=>{
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=n=>(Number(n)||0).toLocaleString('pt-BR'),sec=n=>`${(Number(n)||0).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}s`;
 let inMenu=true,previousPaused=true,authBusy=false,unlockedId=null;
 const scoreData=()=>Progress.data.phaseRecords||{};
 const player=()=>!!(unlockedId&&Progress.data.playerName&&Progress.data.profileId===unlockedId);
 function total(){return Array.from({length:8},(_,i)=>Math.max(Number(scoreData()[i]?.bestScore)||0,Number(Progress.data.scores?.[i])||0)).reduce((a,b)=>a+b,0)}
 function countAnswers(){return (Progress.data.answerHistory||[]).length}
 function renderIntro(){
  $('frontMain').classList.remove('hidden');$('frontPanel').classList.add('hidden');$('frontPanelBody').replaceChildren();
  $('frontContinue').classList.toggle('hidden',!player());
  $('frontMetrics').innerHTML=player()?`<span><b>${esc(Progress.data.playerName)}</b> Explorador</span><span><b>${fmt(total())}</b> Pontos no placar</span><span><b>${fmt(countAnswers())}</b> Respostas</span>`:`<span><b>8</b> Capítulos</span><span><b>24</b> Descobertas</span><span><b>∞</b> Estratégias</span>`;
  $('frontNavigation').querySelectorAll('button').forEach(b=>{b.disabled=!player();b.title=player()?'':'Inicie ou carregue um jogo para acessar esta seção.'});
  $('frontScore').disabled=!player();
 }
 function showMenu(){
  if(checkpointInProgress){showToast('Conclua a pergunta antes de abrir o menu.');return}
  if(!inMenu){previousPaused=paused;paused=true;saveRun()}
  inMenu=true;document.body.classList.add('menu-visible');renderIntro();
  $('frontMenu').classList.remove('hidden');$('frontNew').focus();
 }
 function enterPlay(requestScreen=true){
  if(!player())return false;
  const hadMenu=inMenu;inMenu=false;document.body.classList.remove('menu-visible');$('frontMenu').classList.add('hidden');
  if(hadMenu&&gameStarted&&!gameOver&&!checkpointInProgress&&modal.classList.contains('hidden'))paused=previousPaused;
  if(requestScreen)fullscreen();
  return true;
 }
 function fullscreen(){
  if(document.fullscreenElement||!document.documentElement.requestFullscreen)return;
  try{const promise=document.documentElement.requestFullscreen({navigationUI:'hide'});promise?.then(()=>Mobile?.lock()).catch(()=>{});}catch{}
 }
 function panel(tag,title,lead,markup){$('frontMain').classList.add('hidden');$('frontPanel').classList.remove('hidden');$('frontPanelTag').textContent=tag;$('frontPanelTitle').textContent=title;$('frontPanelLead').textContent=lead;$('frontPanelBody').innerHTML=markup;$('frontBack').focus()}
 function validation(input,error){const name=input.value.trim().replace(/\s+/g,' ');if(name.length<2||name.length>48){error.textContent='Digite um nome de 2 a 48 caracteres.';input.focus();return null}return name}
 function viewNew(){
  const hasExisting=Object.keys(Progress.profiles()).length>0;
  panel('NOVA EXPEDIÇÃO','Crie seu perfil','Seu nome e sua senha serão necessários para continuar a campanha após fechar ou atualizar a página.',`<form id="newProfileForm" class="front-profile-form"><label>Nome do explorador<input id="newProfileName" name="player" maxlength="48" minlength="2" autocomplete="off" required placeholder="Seu nome aqui" aria-describedby="profileError"></label><label>Crie sua senha pessoal<input id="newProfilePassword" type="password" minlength="4" maxlength="64" required autocomplete="new-password" placeholder="Pelo menos 4 caracteres"></label><label>Confirme a senha<input id="newProfileConfirm" type="password" minlength="4" maxlength="64" required autocomplete="new-password" placeholder="Repita a mesma senha"></label><label class="password-visibility"><input id="newProfileShow" type="checkbox"> Mostrar as senhas enquanto digito</label><p class="front-hint">${hasExisting?'Os outros perfis e seus progressos serão preservados.':'A senha será solicitada sempre que abrir ou atualizar o jogo.'} O professor poderá consultá-la mediante autorização.</p><p id="profileError" class="profile-error" role="alert"></p><button class="primary-btn wide" type="submit">Criar perfil e iniciar ↗</button></form>`);
  $('newProfileName').focus();
  $('newProfileShow').onchange=e=>{for(const id of ['newProfilePassword','newProfileConfirm'])$(id).type=e.target.checked?'text':'password'};
  $('newProfileForm').onsubmit=async e=>{e.preventDefault();if(authBusy)return;const name=validation($('newProfileName'),$('profileError'));if(!name)return;
   const password=$('newProfilePassword').value;
   if(!StudentAccess.policy(password)){$('profileError').textContent='Crie uma senha de 4 a 64 caracteres.';return}
   if(password!==$('newProfileConfirm').value){$('profileError').textContent='As duas senhas não são iguais.';return}
   const duplicate=Object.values(Progress.profiles()).some(slot=>slot?.save?.playerName&&slot.save.playerName.trim().toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR'));
   if(duplicate){$('profileError').textContent='Já existe um jogo com este nome. Use Carregar jogo salvo.';return}
   authBusy=true;const submit=$('newProfileForm').querySelector('[type="submit"]');submit.disabled=true;
   try{const credentials=await StudentAccess.prepare(password);const profile=Progress.makeProfile(name);StudentAccess.store(profile.profileId,credentials);unlockedId=profile.profileId;startStage(0);previousPaused=false;enterPlay(true)}
   catch(err){$('profileError').textContent='Não foi possível criar o perfil: '+err.message}
   finally{authBusy=false;if(submit.isConnected)submit.disabled=false}
  }
 }
 function viewLoad(){
  const slots=Progress.profiles(),entries=Object.entries(slots).filter(([,v])=>v?.save?.playerName).sort((a,b)=>(b[1].updated||0)-(a[1].updated||0));
  const legacy=!Progress.data.profileId&&(Progress.data.unlocked>1||Progress.data.research>0||Object.keys(Progress.data.scores||{}).length>0||Progress.data.resume);
  panel('ACESSO DO EXPLORADOR','Carregar jogo salvo','Escolha seu nome e digite sua senha. Após F5 ou ao voltar ao jogo, será obrigatório entrar novamente.',`<div class="save-slot-list">${entries.map(([id,v])=>`<article class="save-slot"><div class="save-slot-avatar">✦</div><div><strong>${esc(v.name)}</strong><small>Capítulo ${Math.min(8,(Number(v.chapter)||0)+1)} · ${new Date(v.updated).toLocaleDateString('pt-BR')} · ${fmt(Object.values(v.save.phaseRecords||{}).reduce((sum,x)=>sum+(Number(x.bestScore)||0),0))} pts</small>${!StudentAccess.has(id)?'<small class="locked-notice">🔒 Senha pendente: solicite ao professor.</small>':''}</div><button class="primary-btn" data-load="${esc(id)}" ${!StudentAccess.has(id)?'disabled':''}>Entrar ↗</button></article>`).join('')}${legacy?'<p class="front-hint">Há um progresso antigo sem nome. Peça ao professor para recuperá-lo e cadastrar uma senha.</p>':''}${entries.length===0&&!legacy?'<p class="front-empty">Nenhum jogo salvo encontrado. Escolha “Novo jogo” para começar.</p>':''}</div><div id="studentLoginBox"></div><p class="front-hint">Esqueceu a senha? O professor pode consultá-la ou substituí-la em “Senhas dos alunos”, no menu principal.</p>`);
  $('frontPanelBody').querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>studentLogin(b.dataset.load,slots[b.dataset.load]?.name));
 }
 function studentLogin(id,name){
  if(!StudentAccess.has(id)){showToast('Somente o professor pode cadastrar a senha deste perfil.');return}
  const box=$('studentLoginBox');box.innerHTML=`<form id="studentLoginForm" class="front-profile-form login-form"><span class="panel-kicker">ACESSO INDIVIDUAL</span><h3>${esc(name||'Explorador')}</h3><label>Sua senha<input id="studentLoginPassword" type="password" maxlength="64" required autocomplete="off" placeholder="Digite sua senha"></label><label class="password-visibility"><input id="studentLoginShow" type="checkbox"> Mostrar senha</label><p id="studentLoginError" class="profile-error" role="alert"></p><button class="primary-btn wide" type="submit">Entrar na minha campanha ↗</button></form>`;
  $('studentLoginShow').onchange=e=>$('studentLoginPassword').type=e.target.checked?'text':'password';
  $('studentLoginPassword').focus();
  $('studentLoginForm').onsubmit=async e=>{e.preventDefault();if(authBusy)return;authBusy=true;const submit=$('studentLoginForm').querySelector('[type="submit"]');submit.disabled=true;
   try{const okay=await StudentAccess.verify(id,$('studentLoginPassword').value);$('studentLoginPassword').value='';
    if(!okay){$('studentLoginError').textContent='Senha incorreta. Confira e tente novamente.';return}
    Progress.restoreProfile(id);unlockedId=id;if(!loadRun())startStage(Progress.data.chapter||0);Interface.applySettings();buildDeck();updateHud();previousPaused=paused;enterPlay(true);
   }catch(err){$('studentLoginError').textContent=err.message}
   finally{authBusy=false;if(submit.isConnected)submit.disabled=false}
  };
 }
 function teacherDirectory(teacherPassword,container=null){
  const entries=Object.entries(Progress.profiles()).filter(([,v])=>v?.save?.playerName).sort((a,b)=>String(a[1].name).localeCompare(String(b[1].name),'pt-BR'));
  const listMarkup=`<div class="teacher-student-list">${entries.map(([id,v])=>`<article class="teacher-student" data-student="${esc(id)}"><div><strong>${esc(v.name)}</strong><small>${StudentAccess.has(id)?'Senha cadastrada':'Perfil antigo · senha ainda não cadastrada'}</small><p class="teacher-secret hidden" data-secret="${esc(id)}"></p></div><div class="teacher-student-actions"><button class="secondary-btn" data-reveal="${esc(id)}" ${StudentAccess.has(id)?'':'disabled'}>Ver senha</button><button class="secondary-btn" data-change="${esc(id)}">${StudentAccess.has(id)?'Trocar senha':'Cadastrar senha'}</button></div></article>`).join('')||'<p class="front-empty">Ainda não há alunos cadastrados.</p>'}</div><div id="teacherStudentEditor"></div><p id="teacherStudentError" class="profile-error" role="alert"></p>`;
  if(container)container.innerHTML=listMarkup;else panel('GESTÃO PROTEGIDA','Senhas dos alunos','Exclusivo do professor.',listMarkup);
  const target=container||$('frontPanelBody');
  target.querySelectorAll('[data-reveal]').forEach(btn=>btn.onclick=async()=>{
   const secret=target.querySelector(`[data-secret="${btn.dataset.reveal}"]`);
   if(!secret.classList.contains('hidden')){secret.textContent='';secret.classList.add('hidden');btn.textContent='Ver senha';return}
   btn.disabled=true;
   try{secret.textContent='Senha: '+await StudentAccess.reveal(btn.dataset.reveal,teacherPassword);secret.classList.remove('hidden');btn.textContent='Ocultar senha'}
   catch(err){$('teacherStudentError').textContent='Não foi possível consultar: '+err.message}
   finally{btn.disabled=false}
  });
  target.querySelectorAll('[data-change]').forEach(btn=>btn.onclick=()=>{
   const id=btn.dataset.change,entry=Progress.profiles()[id];
   $('teacherStudentEditor').innerHTML=`<form id="teacherStudentForm" class="front-profile-form"><span class="panel-kicker">SENHA DE ACESSO</span><h3>${esc(entry?.name||'Aluno')}</h3><label>Nova senha do aluno<input id="teacherStudentPassword" type="password" minlength="4" maxlength="64" autocomplete="new-password" required placeholder="4 a 64 caracteres"></label><label>Confirme a nova senha<input id="teacherStudentConfirm" type="password" minlength="4" maxlength="64" autocomplete="new-password" required></label><label class="password-visibility"><input id="teacherStudentShow" type="checkbox"> Mostrar senha</label><p id="teacherStudentFormError" class="profile-error" role="alert"></p><button class="primary-btn wide" type="submit">Salvar nova senha</button></form>`;
   $('teacherStudentShow').onchange=e=>{for(const field of ['teacherStudentPassword','teacherStudentConfirm'])$(field).type=e.target.checked?'text':'password'};
   $('teacherStudentPassword').focus();
   $('teacherStudentForm').onsubmit=async e=>{e.preventDefault();if(authBusy)return;
    const pw=$('teacherStudentPassword').value;if(!StudentAccess.policy(pw)){$('teacherStudentFormError').textContent='Crie uma senha de 4 a 64 caracteres.';return}
    if(pw!==$('teacherStudentConfirm').value){$('teacherStudentFormError').textContent='As senhas não são iguais.';return}
    authBusy=true;try{await StudentAccess.create(id,pw);teacherDirectory(teacherPassword,container);showToast('Senha atualizada. Progresso preservado.')}catch(err){$('teacherStudentFormError').textContent=err.message}finally{authBusy=false}
   }
  });
  if(legacyAvailable()){
   const recover=document.createElement('button');recover.className='secondary-btn';recover.textContent='Recuperar progresso antigo sem nome';recover.onclick=()=>legacyRecovery(teacherPassword);$('teacherStudentEditor').appendChild(recover);
  }
 }
 function legacyAvailable(){return !Progress.data.profileId&&(Progress.data.unlocked>1||Progress.data.research>0||Object.keys(Progress.data.scores||{}).length>0||Progress.data.resume)}
 function legacyRecovery(teacherPassword){
  panel('RECUPERAÇÃO AUTORIZADA','Recuperar perfil antigo','O professor deve informar o nome do aluno e definir uma senha para proteger o progresso existente.',`<form id="legacyRecoveryForm" class="front-profile-form"><label>Nome do aluno<input id="legacyRecoveryName" maxlength="48" minlength="2" required></label><label>Senha do aluno<input id="legacyRecoveryPassword" type="password" minlength="4" maxlength="64" required></label><label>Repita a senha<input id="legacyRecoveryConfirm" type="password" minlength="4" maxlength="64" required></label><p id="legacyRecoveryError" class="profile-error" role="alert"></p><button class="primary-btn wide" type="submit">Vincular e proteger progresso</button></form>`);
  $('legacyRecoveryForm').onsubmit=async e=>{e.preventDefault();if(authBusy)return;const name=validation($('legacyRecoveryName'),$('legacyRecoveryError'));if(!name)return;
   const pwd=$('legacyRecoveryPassword').value;
   if(!StudentAccess.policy(pwd)||pwd!==$('legacyRecoveryConfirm').value){$('legacyRecoveryError').textContent='Informe e confirme uma senha de 4 a 64 caracteres.';return}
   if(Object.values(Progress.profiles()).some(x=>x?.save?.playerName?.toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR'))){$('legacyRecoveryError').textContent='Esse nome já está vinculado a outro perfil.';return}
   authBusy=true;try{const credentials=await StudentAccess.prepare(pwd),profile=Progress.claimLegacy(name);StudentAccess.store(profile.profileId,credentials);teacherDirectory(teacherPassword);showToast('Progresso antigo protegido. O aluno já pode entrar com sua senha.')}catch(err){$('legacyRecoveryError').textContent=err.message}finally{authBusy=false}
  }
 }
 function instructions(){panel('GUIA DO EXPLORADOR','Como jogar','Um passo de cada vez: leia, experimente e descubra a estratégia.',`<div class="instruction-grid"><article><span>01</span><h3>Planeje sua órbita</h3><p>Antes da batalha, escolha um planeta no baralho à direita e toque ou clique num ponto vazio das rotas. Mini Sóis geram energia; Mercúrio ataca; Júpiter protege.</p></article><article><span>02</span><h3>Defenda o núcleo</h3><p>Clique em <b>Iniciar batalha</b>. Observe as ameaças e o alcance dos defensores. Você pode construir e melhorar torres mesmo pausado, se tiver energia.</p></article><article><span>03</span><h3>Aprenda com os checkpoints</h3><p>Cada capítulo tem três perguntas de Física. Acertos na 1ª tentativa valem mais pontos, energia e pesquisa. Erros oferecem explicações e novas oportunidades.</p></article><article><span>04</span><h3>Progrida e compare</h3><p>Use Pesquisa para melhorias permanentes, Observatório para estudar corpos celestes e Placar para conferir suas alternativas, tentativas e tempo de resposta.</p></article></div><div class="front-tip"><strong>Quanto vale cada descoberta?</strong><p>Uma mesma pergunta pode ser tentada até três vezes, mas a recompensa diminui a cada tentativa correta. Isso incentiva a atenção sem impedir o aprendizado:</p><div class="score-badges"><span>1ª tentativa: <b>250 pontos · +90 energia · +3 pesquisa</b></span><span>2ª tentativa: <b>160 pontos · +60 energia · +2 pesquisa</b></span><span>3ª tentativa: <b>100 pontos · +35 energia · +1 pesquisa</b></span></div><p>O score da fase reúne pontos de combate, combos e checkpoints. Para conquistar a 3ª estrela, é preciso acertar as três descobertas de primeira. O núcleo preservado também vale uma estrela.</p></div><div class="front-tip"><strong>Controles úteis</strong><p>1–0: escolher construção · Clique: construir/inspecionar · Espaço: pausar · C: coletar energia com o campo em foco · Esc: fechar painel · Menu principal: explorar os demais recursos.</p><p>No celular: jogue na horizontal, deslize o baralho de planetas, selecione uma carta e toque no círculo da rota. Toque em uma construção já colocada para melhorá-la. Use ☷ para voltar ao menu.</p><p>As habilidades espaciais são adaptações ficcionais: as relações científicas são explicadas no Atlas e nas descobertas.</p></div>`)}
 function credits(){panel('CRÉDITOS','Quem criou esta jornada','Ciência, design e ensino reunidos em uma experiência de aprendizagem.',`<div class="credit-grid"><article><span class="credit-symbol">✦</span><span class="panel-kicker">CRIAÇÃO E DESENVOLVIMENTO</span><h3>Lucas Xavier Nardelli</h3></article><article><span class="credit-symbol">◎</span><span class="panel-kicker">CRIAÇÃO E DESENVOLVIMENTO</span><h3>Thiago Teodoro</h3></article></div><p class="front-hint">ORBITAL! — uma experiência educativa de estratégia, astronomia e Física. Assets, trilha visual e sistemas de jogo integrados ao projeto.</p>`)}
 function stringifyAnswer(a){return a?.selectedAnswer||'Interação / simulação'}
 function scoring(){
  const scores=scoreData(),all=Progress.data.answerHistory||[];
  const correct=all.filter(x=>x.correct).length,attempt1=all.filter(x=>x.correct&&x.attempt===1).length;
  let html=`<div class="score-overview"><div><span>PONTUAÇÃO TOTAL</span><strong>${fmt(total())}</strong><small>Soma dos melhores resultados das oito fases</small></div><div><span>FASES CONCLUÍDAS</span><strong>${Array.from({length:8},(_,i)=>i).filter(i=>Number(scores[i]?.bestScore)>0||Progress.data.scores?.[i]!==undefined).length}/8</strong><small>Recordes por capítulo</small></div><div><span>RESPOSTAS</span><strong>${all.length}</strong><small>${correct} corretas · ${attempt1} de primeira</small></div><div><span>TEMPO DE RESPOSTA</span><strong>${sec(all.reduce((s,a)=>s+(a.responseSeconds||0),0))}</strong><small>Total acumulado em checkpoints</small></div></div>`;
  html+=`<div class="score-toolbar"><h3>Desempenho por fase</h3><button id="scoreCsv" class="secondary-btn">Exportar histórico CSV ↓</button></div><div class="score-phases">`;
  waves.forEach((w,i)=>{const d=scores[i],last=d?.latest,best=d?.best;html+=`<details class="score-phase"><summary><span class="score-phase-number">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(w.short||w.title)}</strong><small>${last?(last.status==='Derrota'?'Última tentativa: derrota · ':'Última conclusão: ')+new Date(last.completedAt).toLocaleDateString('pt-BR'):'Ainda não concluída'}</small></span><span class="score-phase-points">${fmt(d?.bestScore||Progress.data.scores?.[i]||0)} pts<small>melhor resultado</small></span><b>⌄</b></summary><div class="score-phase-detail">${last?`<div class="score-badges"><span>Última: <b>${fmt(last.score)} pts</b></span><span>Checkpoints: <b>${fmt(last.checkpointScore)} pts</b></span><span>Combate: <b>${fmt(last.combatScore)} pts</b></span><span>Acertos: <b>${last.correct}/3</b></span><span>Tempo da missão: <b>${sec(last.seconds)}</b></span><span>Estrelas: <b>${last.stars}/3</b></span>${[0,1,2].map(cp=>{const answers=(last.answers||[]).filter(x=>x.checkpoint===cp+1);const found=answers.find(x=>x.correct);return `<span>Checkpoint ${cp+1}: <b>${found?found.attempt+'ª tentativa':answers.length?'Não acertou':'Não respondido'}</b></span>`}).join('')}</div><p>Veja abaixo cada resposta da última missão, incluindo as tentativas erradas. Seu recorde pode ser de outra partida.</p>${answerTable(last.answers||[])}`:`<p>Quando terminar esta fase, os pontos e as respostas aparecerão aqui.</p>`}${(d?.history||[]).length>1?`<details class="score-history"><summary>Ver ${d.history.length} partidas registradas</summary><div>${d.history.slice().reverse().map(r=>`<p>${esc(new Date(r.completedAt).toLocaleString('pt-BR'))} · ${fmt(r.score)} pts · ${r.correct}/3 descobertas · ${sec(r.seconds)}</p>`).join('')}</div></details>`:''}</div></details>`});
  html+='</div><h3>Histórico de todas as respostas</h3><p class="score-explainer">A duração começa quando a pergunta aparece e termina quando você escolhe a resposta. Uma nova tentativa tem seu próprio tempo. Respostas interativas são identificadas como simulações.</p>'+answerTable(all.slice().reverse())
  return html
 }
 function answerTable(rows){
  if(!rows.length)return '<p class="front-empty">Nenhuma resposta registrada até agora.</p>';
  return `<div class="score-table-wrap"><table class="score-table"><thead><tr><th>Fase / checkpoint</th><th>Pergunta</th><th>Alternativa escolhida</th><th>Resposta correta</th><th>Tentativa</th><th>Tempo</th><th>Resultado</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${a.chapter} · ${a.checkpoint}</td><td title="${esc(a.question)}">${esc(a.question)}</td><td>${a.selectedIndex!==null&&a.selectedIndex!==undefined?String.fromCharCode(65+a.selectedIndex)+'. ':''}${esc(stringifyAnswer(a))}</td><td>${a.correctIndex!==null&&a.correctIndex!==undefined?String.fromCharCode(65+a.correctIndex)+'. ':''}${esc(a.correctAnswer||'Interação')}</td><td>${a.attempt}ª</td><td>${sec(a.responseSeconds)}</td><td><span class="score-status ${a.correct?'score-yes':'score-no'}">${a.correct?'Acerto':'Erro'}</span></td></tr>`).join('')}</tbody></table></div>`
 }
 function downloadScore(){
  const rows=Progress.data.answerHistory||[],keys=['player','chapter','chapterTitle','checkpoint','question','selectedAnswer','correctAnswer','attempt','responseSeconds','correct','date','mode'];const label=['Jogador','Capítulo','Fase','Checkpoint','Pergunta','Alternativa escolhida','Resposta correta','Tentativa','Tempo (s)','Acerto','Data','Modo'];
  const quote=v=>{let value=String(v??'');if(/^[=+\-@\t\r]/.test(value))value="'"+value;return '"'+value.replace(/"/g,'""')+'"'};const csv='\ufeff'+[label.map(quote).join(';'),...rows.map(a=>keys.map(k=>quote(k==='correct'?(a[k]?'Sim':'Não'):a[k])).join(';'))].join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`orbital-placar-${(Progress.data.playerName||'aluno').replace(/[^a-z0-9_-]+/gi,'_')}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
 }
 function viewScore(){if(!player())return viewNew();panel('PLACAR INDIVIDUAL',`Boletim de ${Progress.data.playerName}`,'Pontuação, respostas e evolução em cada capítulo. Os melhores resultados compõem o total.',scoring());$('scoreCsv').onclick=downloadScore}
 function sha256Local(input){
  const bytes=Array.from(new TextEncoder().encode(input)),bitLen=bytes.length*8,hi=Math.floor(bitLen/4294967296),lo=bitLen>>>0;
  bytes.push(128);while(bytes.length%64!==56)bytes.push(0);
  for(const v of [hi,lo])for(let shift=24;shift>=0;shift-=8)bytes.push((v>>>shift)&255);
  const primes=[];for(let candidate=2;primes.length<64;candidate++){let prime=true;for(let n=2;n*n<=candidate;n++)if(candidate%n===0){prime=false;break}if(prime)primes.push(candidate)}
  const fractional=x=>(x-Math.floor(x))*4294967296>>>0;
  const K=primes.map(p=>fractional(Math.cbrt(p))),H=primes.slice(0,8).map(p=>fractional(Math.sqrt(p)));
  const rotr=(v,n)=>(v>>>n)|(v<<(32-n));
  for(let offset=0;offset<bytes.length;offset+=64){
   const w=Array(64);for(let t=0;t<16;t++){const j=offset+t*4;w[t]=((bytes[j]<<24)|(bytes[j+1]<<16)|(bytes[j+2]<<8)|bytes[j+3])>>>0}
   for(let t=16;t<64;t++){const x=w[t-15],y=w[t-2];const s0=rotr(x,7)^rotr(x,18)^(x>>>3),s1=rotr(y,17)^rotr(y,19)^(y>>>10);w[t]=(w[t-16]+s0+w[t-7]+s1)>>>0}
   let [a,b,c,d,e,f,g,h]=H;
   for(let t=0;t<64;t++){
    const s1=rotr(e,6)^rotr(e,11)^rotr(e,25),choice=(e&f)^(~e&g),temp1=(h+s1+choice+K[t]+w[t])>>>0;
    const s0=rotr(a,2)^rotr(a,13)^rotr(a,22),majority=(a&b)^(a&c)^(b&c),temp2=(s0+majority)>>>0;
    h=g;g=f;f=e;e=(d+temp1)>>>0;d=c;c=b;b=a;a=(temp1+temp2)>>>0;
   }
   for(const [j,v] of [a,b,c,d,e,f,g,h].entries())H[j]=(H[j]+v)>>>0;
  }
  return H.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('');
 }
 const pepper='ORBITAL·PROFESSOR·2026·v2.1:';
 const passwordDigest='9ac4d62650eb13864cf783ece16918eb89ce126846d8233f5cab950b992aa327';
 async function digest(value){
  if(!globalThis.crypto?.subtle)return sha256Local(pepper+value);
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(pepper+value));
  return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
 }
 function guardTeacher(openTeacher){
  if(!player())return viewNew();
  panel('ACESSO RESTRITO','Área do professor','Digite a senha para acessar perguntas, configurações e relatórios da turma.',`<form id="teacherGateForm" class="front-profile-form"><label>Senha do professor<input id="teacherPass" type="password" required autocomplete="off" placeholder="Senha de acesso"></label><p id="teacherPassError" role="alert" class="profile-error"></p><button type="submit" class="primary-btn wide">Desbloquear área do professor ↗</button></form><p class="front-hint">A verificação usa SHA-256 com salt, localmente. Por ser um jogo sem servidor, essa proteção não impede análise avançada do código.</p>`);
  $('teacherPass').focus();$('teacherGateForm').onsubmit=async e=>{e.preventDefault();if(authBusy)return;authBusy=true;try{const valid=await digest($('teacherPass').value);if(valid!==passwordDigest){$('teacherPassError').textContent='Senha incorreta. Tente novamente.';$('teacherPass').value='';return}renderIntro();openTeacher();$('teacherPass').value='';}catch(err){$('teacherPassError').textContent=err.message}finally{authBusy=false}}
 }
 function openTeacherConsole(password,section='overview'){
  panel('ACESSO DOCENTE','Área do professor','Gerencie o conteúdo científico e acompanhe a aprendizagem com controle sobre as contas dos alunos.','');
  TeacherConsole.mount($('frontPanelBody'),{password,tab:section,students:el=>teacherDirectory(password,el)});
 }
 function authorizeChange(title,description,onApprove,onCancel){
  const existing=$('teacherConfirm');if(existing)existing.remove();
  const focusReturn=document.activeElement;
  const overlay=document.createElement('div');overlay.id='teacherConfirm';overlay.className='teacher-confirm-mask';overlay.setAttribute('role','presentation');
  overlay.innerHTML=`<section class="teacher-confirm-card" role="dialog" aria-modal="true" aria-labelledby="teacherConfirmTitle" aria-describedby="teacherConfirmDescription"><span class="panel-kicker">ÁREA RESTRITA · PROFESSOR</span><div class="teacher-confirm-heading"><span class="teacher-confirm-icon" aria-hidden="true">🔒</span><h2 id="teacherConfirmTitle"></h2></div><p id="teacherConfirmDescription"></p><form id="teacherConfirmForm"><label for="teacherConfirmPass">Senha do professor</label><input id="teacherConfirmPass" type="password" required autocomplete="off" spellcheck="false" placeholder="Digite a senha do professor"><p id="teacherConfirmError" class="profile-error" role="alert"></p><div class="teacher-confirm-buttons"><button class="secondary-btn" type="button" id="teacherConfirmCancel">Cancelar</button><button class="primary-btn" type="submit">Autorizar ação</button></div></form></section>`;
  document.body.appendChild(overlay);$('teacherConfirmTitle').textContent=title;$('teacherConfirmDescription').textContent=description;
  let busy=false;
  function dismiss(cancelled=false){document.removeEventListener('keydown',onKey,true);overlay.remove();if(cancelled)onCancel?.();if(focusReturn?.isConnected)focusReturn.focus()}
  function onKey(e){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(!busy)dismiss(true)}if(e.key==='Tab'){const controls=[...overlay.querySelectorAll('input,button')];const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}
  document.addEventListener('keydown',onKey,true);
  $('teacherConfirmCancel').onclick=()=>{if(!busy)dismiss(true)};
  $('teacherConfirmForm').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;const submit=overlay.querySelector('[type="submit"]');submit.disabled=true;try{
   if(await digest($('teacherConfirmPass').value)!==passwordDigest){$('teacherConfirmError').textContent='Senha incorreta. Nenhuma alteração foi feita.';$('teacherConfirmPass').value='';$('teacherConfirmPass').focus();return}
   const entered=$('teacherConfirmPass').value;dismiss();await onApprove(entered);
  }catch(err){if(overlay.isConnected)$('teacherConfirmError').textContent='Não foi possível autorizar: '+err.message;else showToast('Não foi possível concluir a alteração.')}finally{busy=false;if(overlay.isConnected)submit.disabled=false}}
  $('teacherConfirmPass').focus();
 }
 function enforceLock(){
  TeacherConsole.destroy();unlockedId=null;inMenu=true;paused=true;document.body.classList.add('menu-visible');$('frontMenu').classList.remove('hidden');renderIntro();
 }
 function initialize(){
  const nav=document.querySelector('.main-nav');if(nav)$('frontNavigation').appendChild(nav);
  $('frontNew').onclick=viewNew;$('frontLoad').onclick=viewLoad;$('frontContinue').onclick=()=>{if(!player())return viewLoad();enterPlay(true);if(!Progress.data.resume&&gameOver)startStage(Progress.data.chapter||0)};
  $('frontInstructions').onclick=instructions;$('frontCredits').onclick=credits;$('frontScore').onclick=viewScore;$('frontBack').onclick=()=>{TeacherConsole.destroy();renderIntro()};
  $('frontTeacherAccess').textContent='🔒 Área do professor';
  $('frontTeacherAccess').onclick=()=>authorizeChange('Área do professor','Digite a senha para administrar questões, relatórios, alunos e configurações.',password=>openTeacherConsole(password));
  $('menuHomeBtn').onclick=showMenu;
  const teacher=$('teacherBtn');if(teacher)teacher.onclick=()=>authorizeChange('Área do professor','Acesso exclusivo para administrar a turma.',password=>openTeacherConsole(password));
  const scoreLink=document.createElement('button');scoreLink.id='navScoreBtn';scoreLink.textContent='Placar';scoreLink.onclick=viewScore;nav?.insertBefore(scoreLink,$('settingsBtn'));
  const back=document.createElement('button');back.id='navPlayBtn';back.textContent='▶ Jogar';back.className='nav-play';back.onclick=()=>enterPlay(true);nav?.insertBefore(back,nav.firstChild);
  window.addEventListener('pagehide',()=>{unlockedId=null});
  window.addEventListener('pageshow',e=>{if(e.persisted)enforceLock()});
  $('frontMenu').classList.remove('hidden');document.body.classList.add('menu-visible');renderIntro();
 }
 initialize();
 return {showMenu,enterPlay,viewScore,fullscreen,authorizeChange,get authenticated(){return player()},get visible(){return inMenu}}
})();
