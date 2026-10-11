const SLANGS = [
  {term:'FOMO',meaning:'Fear of missing out — medo de ficar de fora de algo.',example:'Everyone is going to the party and I have serious FOMO.',tag:'social'},
  {term:'GG',meaning:'Good game — usado após uma partida; às vezes também de forma irônica.',example:'That was close. GG!',tag:'gaming'},
  {term:'WP',meaning:'Well played — “bem jogado”.',example:'GG WP, that comeback was wild.',tag:'gaming'},
  {term:'OP',meaning:'Overpowered — forte demais ou desequilibrado.',example:'That character is so OP.',tag:'gaming'},
  {term:'nerf',meaning:'Reduzir a força/eficácia de algo, geralmente em jogos.',example:'They need to nerf this weapon.',tag:'gaming'},
  {term:'buff',meaning:'Aumentar a força/eficácia de algo.',example:'They finally buffed my main.',tag:'gaming'},
  {term:'main',meaning:'Personagem, classe ou opção principal que alguém usa.',example:'Mercy is my main.',tag:'gaming'},
  {term:'alt',meaning:'Conta ou personagem alternativo.',example:'I’m playing on my alt today.',tag:'gaming'},
  {term:'NPC',meaning:'Non-player character; online, pode descrever alguém agindo de forma automática/genérica.',example:'Bro answered like an NPC.',tag:'internet'},
  {term:'loot',meaning:'Itens/recompensas coletados em um jogo.',example:'We got rare loot from the boss.',tag:'gaming'},
  {term:'noob',meaning:'Pessoa inexperiente; pode soar provocativo ou ofensivo dependendo do contexto.',example:'I’m still a noob at this game.',tag:'gaming'},
  {term:'newbie',meaning:'Iniciante; geralmente mais neutro que “noob”.',example:'I’m a newbie, any tips?',tag:'internet'},
  {term:'rage quit',meaning:'Sair de um jogo/conversa por raiva ou frustração.',example:'He lost once and rage quit.',tag:'gaming'},
  {term:'LMK',meaning:'Let me know — “me avisa/me fala”.',example:'LMK if you want to join.',tag:'chat'},
  {term:'GL/HF',meaning:'Good luck / have fun — “boa sorte / divirta-se”.',example:'GLHF everyone!',tag:'gaming'},
  {term:'POV',meaning:'Point of view — usado para apresentar uma situação do ponto de vista de alguém.',example:'POV: you studied for the wrong test.',tag:'social'},
  {term:'IYKYK',meaning:'If you know, you know — referência que só quem entende o contexto pega.',example:'That cafeteria pizza… IYKYK.',tag:'social'},
  {term:'TL;DR',meaning:'Too long; didn’t read — resumo de um texto longo ou reação a ele.',example:'TL;DR: we missed the bus.',tag:'internet'},
  {term:'rent free',meaning:'Quando algo/alguém fica ocupando seus pensamentos sem parar.',example:'That song lives rent free in my head.',tag:'social'},
  {term:'cooked',meaning:'Em apuros, sem saída, exausto ou “acabado”, dependendo do contexto.',example:'I didn’t study. I’m cooked.',tag:'internet'}
];

const QUESTIONS = [
  {chapter:0,mode:'Decode the Chat',prompt:'O que a pessoa quer dizer?',chat:'“LMK if you want to join the call later.”',answers:['Me avise se quiser entrar na chamada mais tarde.','Saia da chamada imediatamente.','Eu não sei quem está na chamada.','Grave a chamada para mim.'],correct:0,explain:'LMK = “Let me know”, usado para pedir que alguém avise ou responda depois.',slang:'LMK'},
  {chapter:0,mode:'Decode the Chat',prompt:'Qual é o sentido de FOMO aqui?',chat:'“Everyone posted photos from the festival. Now I have FOMO.”',answers:['Ela está com medo de ter perdido uma experiência legal.','Ela esqueceu a senha das redes sociais.','Ela está irritada com as fotos.','Ela não gosta de festivais.'],correct:0,explain:'FOMO descreve o medo/sensação de estar perdendo algo que outras pessoas estão vivendo.',slang:'FOMO'},
  {chapter:0,mode:'Build the Reply',prompt:'Qual resposta combina melhor com a mensagem?',chat:'“LMK if you need the notes from class.”',answers:['Sure, thanks! I’ll text you if I need them.','GG, your notes are OP.','IYKYK.','Please nerf the notes.'],correct:0,explain:'A resposta mostra que a pessoa entendeu “let me know” e responde naturalmente.',slang:'LMK'},
  {chapter:0,mode:'Slang Emergency',prompt:'BOOMER.EXE usou a expressão errada. Qual seria a melhor correção?',chat:'“My friend invited me to study together. I said: TL;DR!”',answers:['“Sure, LMK what time.”','“GG WP!”','“You are OP.”','“I have loot.”'],correct:0,explain:'LMK funciona para combinar horário; TL;DR não faz sentido nesse contexto.',slang:'LMK'},
  {chapter:0,mode:'Impostor Slang',prompt:'Em qual frase a slang está usada de forma estranha?',chat:'Encontre o impostor.',answers:['“LMK when you get home.”','“I missed the concert and now I have FOMO.”','“TL;DR: the trip was cancelled.”','“My sandwich is LMK.”'],correct:3,explain:'LMK é uma abreviação de ação comunicativa; não descreve um objeto.',slang:'LMK'},
  {chapter:0,mode:'Context Check',prompt:'Qual alternativa mostra melhor o sentido de TL;DR?',chat:'“TL;DR: We tried to fix the computer for two hours, but the cable was unplugged.”',answers:['Um resumo rápido do texto anterior.','Uma saudação para começar uma conversa.','Um elogio a alguém.','Um aviso de que a pessoa está online.'],correct:0,explain:'TL;DR costuma introduzir um resumo curto de uma explicação longa.',slang:'TL;DR'},

  {chapter:1,mode:'Gaming Lobby',prompt:'O que “OP” quer dizer aqui?',chat:'“This new character is OP. Nobody can beat them.”',answers:['Forte demais/desequilibrado.','Muito fraco.','Muito raro.','Muito engraçado.'],correct:0,explain:'OP = overpowered, usado quando algo parece forte demais.',slang:'OP'},
  {chapter:1,mode:'Gaming Lobby',prompt:'Qual palavra completa melhor a ideia?',chat:'“This weapon is too strong. The developers should ____ it.”',answers:['nerf','buff','loot','main'],correct:0,explain:'Nerf = reduzir a força/eficácia de algo.',slang:'nerf'},
  {chapter:1,mode:'Gaming Lobby',prompt:'Qual palavra completa melhor a ideia?',chat:'“This character is too weak. Please ____ them next patch.”',answers:['buff','rage quit','TL;DR','alt'],correct:0,explain:'Buff = aumentar a força/eficácia.',slang:'buff'},
  {chapter:1,mode:'Impostor Slang',prompt:'Qual uso de “main” está correto no contexto gamer?',chat:'Escolha a mensagem natural.',answers:['“Kiriko is my main; I play her almost every match.”','“I main my homework at 7 p.m.”','“My sandwich is my main.”','“I bought a main yesterday.”'],correct:0,explain:'“Main” é o personagem/classe principal que alguém costuma usar.',slang:'main'},
  {chapter:1,mode:'Gaming Lobby',prompt:'O que aconteceu?',chat:'“He lost the match, yelled, closed the game and left the call.”',answers:['He rage quit.','He got loot.','He buffed the game.','He said GLHF.'],correct:0,explain:'Rage quit = sair por raiva/frustração.',slang:'rage quit'},
  {chapter:1,mode:'Tone Check',prompt:'Qual opção é mais neutra para dizer que alguém está começando?',chat:'“I’m new to this game. I’m a ____.”',answers:['newbie','NPC','OP','nerf'],correct:0,explain:'“Newbie” costuma ser mais neutro; “noob” pode ter tom provocativo dependendo do contexto.',slang:'newbie'},

  {chapter:2,mode:'Social Feed',prompt:'O que significa “rent free” aqui?',chat:'“That embarrassing moment still lives rent free in my head.”',answers:['A pessoa não consegue parar de pensar nisso.','A pessoa não paga aluguel.','A pessoa mudou de casa.','A pessoa esqueceu o momento completamente.'],correct:0,explain:'“Live rent free in my head” = ocupar seus pensamentos constantemente.',slang:'rent free'},
  {chapter:2,mode:'Social Feed',prompt:'Qual legenda usa POV de forma coerente?',chat:'Escolha a opção que apresenta uma situação do ponto de vista de alguém.',answers:['“POV: you open the test and forgot everything.”','“POV means pizza on vacation.”','“I POV my backpack every day.”','“This phone is very POV.”'],correct:0,explain:'POV introduz uma cena/situação a partir de um ponto de vista.',slang:'POV'},
  {chapter:2,mode:'Decode the Chat',prompt:'Qual é a intenção de IYKYK?',chat:'“That one school hallway after lunch… IYKYK.”',answers:['Fazer uma referência que só quem conhece a situação entende.','Pedir uma tradução.','Encerrar uma partida.','Dizer que algo está forte demais.'],correct:0,explain:'IYKYK = “If you know, you know”.',slang:'IYKYK'},
  {chapter:2,mode:'Context Check',prompt:'Qual interpretação é mais provável?',chat:'“I have three tests tomorrow and I haven’t studied. I’m cooked.”',answers:['Estou em apuros.','Estou preparando comida.','Estou muito rico.','Estou com sorte.'],correct:0,explain:'Nesse contexto, “cooked” indica que a pessoa está em uma situação ruim.',slang:'cooked'},
  {chapter:2,mode:'Slang Emergency',prompt:'Qual legenda está mais natural?',chat:'BOOMER.EXE escreveu: “POV: my phone is OP because it has a blue case.”',answers:['“POV: you realize the homework was due yesterday.”','“POV: I buffed my breakfast.”','“POV: this chair is LMK.”','“POV: GG WP homework.”'],correct:0,explain:'A primeira usa POV para colocar o leitor dentro de uma situação.',slang:'POV'},
  {chapter:2,mode:'Meaning Match',prompt:'Qual situação combina com “cooked”?',chat:'Escolha o melhor contexto.',answers:['Você esqueceu completamente de estudar para uma prova importante.','Você ganhou uma partida facilmente.','Você pediu para alguém te avisar depois.','Você encontrou um item raro.'],correct:0,explain:'“Cooked” pode indicar estar ferrado/em apuros.',slang:'cooked'},

  {chapter:3,mode:'Stream Chat',prompt:'Qual é o significado de GLHF?',chat:'“Match starting in 10 seconds. GLHF!”',answers:['Good luck, have fun.','Go left, hide fast.','Get loot, have food.','Good level, high fame.'],correct:0,explain:'GLHF = Good luck, have fun.',slang:'GL/HF'},
  {chapter:3,mode:'Stream Chat',prompt:'Qual resposta é adequada após uma boa partida?',chat:'“That final round was intense!”',answers:['GG WP!','TL;DR!','Nerf school!','LMK the loot!'],correct:0,explain:'GG WP = good game, well played.',slang:'WP'},
  {chapter:3,mode:'Context Check',prompt:'O que “loot” significa aqui?',chat:'“We defeated the boss and got legendary loot.”',answers:['Itens/recompensas.','Uma punição.','Uma conta alternativa.','Um jogador iniciante.'],correct:0,explain:'Loot = itens/recompensas obtidos no jogo.',slang:'loot'},
  {chapter:3,mode:'Gaming Lobby',prompt:'O que é uma “alt” nesse contexto?',chat:'“My main account is level 80, but I’m using my alt today.”',answers:['Uma conta alternativa.','Um personagem super forte.','Uma mensagem curta.','Uma atualização do jogo.'],correct:0,explain:'Alt = alternate account/character.',slang:'alt'},
  {chapter:3,mode:'Tone Check',prompt:'Qual frase mostra um uso figurado comum de NPC?',chat:'Escolha a mais natural.',answers:['“He repeated the same answer three times like an NPC.”','“Please NPC this weapon next patch.”','“I got an NPC from the boss loot.”','“LMK your NPC tomorrow.”'],correct:0,explain:'Online, “NPC” pode ser usado figurativamente para alguém que parece agir de modo automático/genérico.',slang:'NPC'},
  {chapter:3,mode:'Impostor Slang',prompt:'Qual mensagem NÃO combina com o contexto gamer?',chat:'Encontre o impostor.',answers:['“GG WP!”','“They need to nerf that weapon.”','“This skin dropped as loot.”','“IYKYK means increase damage by 20%.”'],correct:3,explain:'IYKYK não é uma mecânica de jogo; significa “If you know, you know”.',slang:'IYKYK'}
];

const BOSS_QUESTIONS = [
  {chat:'“GLHF. Their main is OP. We’re cooked. GG.”',answers:['“Boa sorte e divirta-se. O personagem principal deles está forte demais. Estamos em apuros. Bom jogo.”','“Vá para a esquerda. O personagem deles é original. Estamos cozinhando. Vá embora.”','“Pegue loot. O personagem deles é fraco. Estamos vencendo. Boa noite.”','“Boa sorte. A conta alternativa deles é iniciante. Estamos tranquilos. Me avise.”'],correct:0,explain:'A mensagem mistura quatro slangs: GLHF, main, OP, cooked e GG.'},
  {chat:'“LMK if you wanna join. My alt needs loot before the boss.”',answers:['“Me avisa se quiser entrar. Minha conta/personagem alternativo precisa de itens antes do boss.”','“Leia meu texto longo. Meu personagem principal precisa ser enfraquecido.”','“Boa partida. Minha conta foi deletada.”','“Se você sabe, você sabe. Meu personagem é forte demais.”'],correct:0,explain:'LMK = me avisa; alt = conta/personagem alternativo; loot = itens.'},
  {chat:'“POV: you said ‘one more match’ and now it’s 2 a.m. IYKYK.”',answers:['“Ponto de vista: você disse ‘só mais uma partida’ e agora são 2 da manhã. Quem sabe, sabe.”','“Programa online de vídeo: você venceu e recebeu loot.”','“Boa sorte: você precisa enfraquecer a partida.”','“Resumo: você saiu por raiva.”'],correct:0,explain:'POV cria a situação; IYKYK cria cumplicidade com quem reconhece a experiência.'},
  {chat:'“They buffed my main and nerfed the boss. Finally!”',answers:['“Aumentaram a força do meu personagem principal e reduziram a força do boss.”','“Apagaram minha conta e duplicaram o boss.”','“Meu iniciante ficou irritado e saiu.”','“Ganhei itens e perdi minha conta alternativa.”'],correct:0,explain:'Buff = fortalecer; main = escolha principal; nerf = enfraquecer.'},
  {chat:'“TL;DR: I had FOMO, went to the event, and it was mid. Now that song lives rent free in my head.”',answers:['“Resumindo: fiquei com medo de perder o evento, fui, achei mediano e agora aquela música não sai da minha cabeça.”','“Boa partida: fui ao evento porque estava com raiva e aluguei uma casa.”','“Me avisa: perdi minha conta e agora preciso de loot.”','“Ponto de vista: o evento estava forte demais e foi nerfado.”'],correct:0,explain:'A frase combina TL;DR, FOMO e “rent free” em um contexto social.'}
];

const CHAPTERS = [
  {name:'Group Chat',icon:'💬',desc:'Abreviações de conversa, contexto e intenção.',modes:'LMK • FOMO • TL;DR'},
  {name:'Gaming Lobby',icon:'🎮',desc:'Slangs de gameplay, balanceamento e comunidade.',modes:'OP • nerf • buff • main'},
  {name:'Social Feed',icon:'📱',desc:'Linguagem de posts, memes e situações sociais.',modes:'POV • IYKYK • cooked'},
  {name:'Stream Chat',icon:'⚡',desc:'Misture tudo em conversas mais rápidas.',modes:'GG • WP • loot • NPC'},
  {name:'BOOMER.EXE',icon:'👾',desc:'Traduza mensagens completas e derrote o boss.',modes:'FINAL BOSS'}
];

let setupIntent = 'campaign';

let state = {
  teams:[], teamCount:2, currentTeam:0, currentChapter:0, questionIndex:0, chapterQuestions:[], completed:[false,false,false,false,false],
  timerEnabled:true, powersEnabled:true, tutorialEnabled:true, timer:20, timerMax:20, timerId:null, answered:false,
  currentQuestion:null, bossIndex:0, bossHp:100, startedAt:0, totalAnswered:0, totalCorrect:0, quickPlay:false
};

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function showScreen(id){$$('.screen').forEach(s=>s.classList.remove('active'));$('#'+id).classList.add('active');$('#topbar').classList.toggle('hidden',id==='screen-home'||id==='screen-setup'||id==='screen-results');window.scrollTo({top:0,behavior:'smooth'});}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function escapeHTML(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

function boot(){const lines=['> initializing chat-chaos.exe',`> scanning slang database... <span class="cyan">${SLANGS.length} entries found</span>`,'> connecting to classroom network... OK','> warning: semantic corruption detected','> source identified: <span class="err">BOOMER.EXE</span>','> “LOL = lots of love” ... <span class="err">CRITICAL ERROR</span>','> requesting human intervention_'];let i=0;const el=$('#bootTerminal');const tick=()=>{if(i<lines.length){el.innerHTML+=lines[i++]+'<br>';setTimeout(tick,260)}};tick();renderTeamForm();renderGlossary();}

function renderTeamForm(){const icons=['⚡','🔥','🧠','👾'];const defaults=['Team Alpha','Team Beta','Team Gamma','Team Delta'];$('#teamForm').innerHTML=Array.from({length:state.teamCount},(_,i)=>`<label class="team-field"><span class="team-icon">${icons[i]}</span><input value="${defaults[i]}" data-team-input="${i}" maxlength="18" /></label>`).join('');}
$$('.count-btn').forEach(b=>b.onclick=()=>{$$('.count-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.teamCount=+b.dataset.count;renderTeamForm()});

function initGame(quick=false){
 state.quickPlay=quick; state.timerEnabled=$('#optTimer')?.checked??true;state.powersEnabled=$('#optHints')?.checked??true;state.tutorialEnabled=$('#optTutorial')?.checked??false;
 const inputs=$$('[data-team-input]');
 state.teams=Array.from({length:state.teamCount},(_,i)=>({name:inputs[i]?.value.trim()||`Team ${i+1}`,score:0,streak:0,bestStreak:0,correct:0,answered:0,powers:{fifty:1,freeze:1,double:1}}));
 state.currentTeam=0;state.completed=[false,false,false,false,false];state.totalAnswered=0;state.totalCorrect=0;state.startedAt=Date.now();
 if(quick){startQuickPlay();return}
 renderMap();showScreen('screen-map'); if(state.tutorialEnabled) openTutorial();
}

function renderMap(){
 $('#globalScore').textContent=state.teams.reduce((a,t)=>a+t.score,0);
 $('#chapterGrid').innerHTML=CHAPTERS.map((c,i)=>{const unlocked=i===0||state.completed[i-1];const done=state.completed[i];return `<article class="chapter-card ${!unlocked?'locked':''} ${done?'completed':''}" data-chapter="${i}"><div class="chapter-number">0${i+1} // ${i===4?'BOSS':'ZONE'}</div><div class="chapter-icon">${c.icon}</div><h3>${c.name}</h3><p>${c.desc}</p><div class="chapter-status">${done?'✓ RESTORED':unlocked?'CLICK TO ENTER':'🔒 LOCKED'}<br>${c.modes}</div></article>`}).join('');
 $$('.chapter-card:not(.locked)').forEach(c=>c.onclick=()=>startChapter(+c.dataset.chapter));
 $('#mapTeamStrip').innerHTML=state.teams.map(t=>`<div class="team-mini"><span>${escapeHTML(t.name)}</span><strong>${t.score} XP</strong></div>`).join('');
}

function startQuickPlay(){state.currentChapter=99;state.chapterQuestions=shuffle(QUESTIONS).slice(0,12);state.questionIndex=0;showScreen('screen-game');renderTeamRail();loadQuestion()}
function startChapter(i){if(i===4){startBoss();return}state.currentChapter=i;state.chapterQuestions=shuffle(QUESTIONS.filter(q=>q.chapter===i));state.questionIndex=0;showScreen('screen-game');$('#chapterPill').textContent=CHAPTERS[i].name.toUpperCase();renderTeamRail();loadQuestion()}
function renderTeamRail(){
 $('#teamRail').innerHTML=state.teams.map((t,i)=>`<div class="rail-team ${i===state.currentTeam?'active':''}"><div class="rtop"><b>${escapeHTML(t.name)}</b><strong>${t.score}</strong></div><div class="streak">STREAK x${t.streak} ${t.streak>=3?'🔥':''}</div></div>`).join('');
 renderPowerbar();
}
function renderPowerbar(){const t=state.teams[state.currentTeam];$('#powerbar').innerHTML=state.powersEnabled?`<span class="power-label">TEAM POWERS</span><button class="power" data-power="fifty" ${!t.powers.fifty?'disabled':''}>◐ 50/50 <small>x${t.powers.fifty}</small></button><button class="power" data-power="freeze" ${!t.powers.freeze?'disabled':''}>❄ FREEZE <small>x${t.powers.freeze}</small></button><button class="power" data-power="double" ${!t.powers.double?'disabled':''}>×2 DOUBLE XP <small>x${t.powers.double}</small></button>`:`<span class="power-label">POWERS DISABLED</span>`;$$('.power').forEach(b=>b.onclick=()=>usePower(b.dataset.power));}

let doubleActive=false, freezeActive=false;
function usePower(p){if(state.answered)return;const t=state.teams[state.currentTeam];if(!t.powers[p])return;t.powers[p]--;
 if(p==='fifty'){const qs=$$('.answer-btn');const wrong=qs.filter((_,i)=>i!==state.currentQuestion.correct);shuffle(wrong).slice(0,2).forEach(b=>{b.disabled=true;b.style.opacity=.18});toast('50/50 ativado');}
 if(p==='freeze'){freezeActive=true;clearInterval(state.timerId);toast('Cronômetro congelado');}
 if(p==='double'){doubleActive=true;toast('Próximo acerto vale XP em dobro');}
 renderPowerbar();}

function loadQuestion(){clearInterval(state.timerId);state.answered=false;freezeActive=false;doubleActive=false;$('#feedback').classList.remove('show');
 if(state.questionIndex>=state.chapterQuestions.length){finishChapter();return}
 const q=state.currentQuestion=state.chapterQuestions[state.questionIndex];$('#modeBadge').textContent=q.mode.toUpperCase();$('#contextChip').textContent=state.currentChapter===99?'QUICK PLAY':CHAPTERS[state.currentChapter].name.toUpperCase();$('#questionPrompt').textContent=q.prompt;$('#chatBubble').innerHTML=highlightSlang(q.chat,q.slang);$('#speakerName').textContent=['user_404','pixelPanda','ghost_typing','lagQueen','teacherAFK'][Math.floor(Math.random()*5)];$('#speakerAvatar').textContent=['👾','🦊','🐸','👻','🦝'][Math.floor(Math.random()*5)];
 const letters=['A','B','C','D'];$('#answers').innerHTML=q.answers.map((a,i)=>`<button class="answer-btn" data-i="${i}"><span class="letter">${letters[i]}</span><span>${escapeHTML(a)}</span></button>`).join('');$$('.answer-btn').forEach(b=>b.onclick=()=>answerQuestion(+b.dataset.i));
 $('#progressText').textContent=`${state.questionIndex+1} / ${state.chapterQuestions.length}`;$('#progressFill').style.width=`${(state.questionIndex/state.chapterQuestions.length)*100}%`;startTimer();renderTeamRail();}
function highlightSlang(text,slang){let safe=escapeHTML(text);if(slang){const r=new RegExp(`(${slang.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'ig');safe=safe.replace(r,'<span class="highlight">$1</span>')}return safe}
function startTimer(){state.timer=state.timerMax;updateTimerUI();$('#timerWrap').style.display=state.timerEnabled?'grid':'none';if(!state.timerEnabled)return;state.timerId=setInterval(()=>{state.timer--;updateTimerUI();if(state.timer<=0){clearInterval(state.timerId);answerQuestion(-1)}},1000)}
function updateTimerUI(){ $('#timerText').textContent=state.timer;const off=107*(1-state.timer/state.timerMax);$('#timerRing').style.strokeDashoffset=off;$('#timerRing').style.stroke=state.timer<=5?'var(--red)':state.timer<=10?'var(--yellow)':'var(--cyan)'; }
function answerQuestion(i){if(state.answered)return;state.answered=true;clearInterval(state.timerId);const q=state.currentQuestion;const t=state.teams[state.currentTeam];t.answered++;state.totalAnswered++;const correct=i===q.correct;$$('.answer-btn').forEach((b,idx)=>{b.disabled=true;if(idx===q.correct)b.classList.add('correct');if(idx===i&&!correct)b.classList.add('wrong')});
 if(correct){state.totalCorrect++;t.correct++;t.streak++;t.bestStreak=Math.max(t.bestStreak,t.streak);let base=100+(state.timerEnabled?state.timer*5:0)+(t.streak>=3?50:0);if(doubleActive)base*=2;t.score+=base;$('#feedbackIcon').textContent='✓';$('#feedbackIcon').style.color='var(--green)';$('#feedbackTitle').textContent='SLANG RESTORED';$('#feedbackTitle').style.color='var(--green)';$('#feedbackText').textContent=`+${base} XP · ${q.explain}`;}else{t.streak=0;$('#feedbackIcon').textContent=i===-1?'⌛':'×';$('#feedbackIcon').style.color='var(--red)';$('#feedbackTitle').textContent=i===-1?'TIMEOUT':'TRANSLATION ERROR';$('#feedbackTitle').style.color='var(--red)';$('#feedbackText').textContent=q.explain;}
 $('#feedback').classList.add('show');renderTeamRail();}
$('#btnNext').onclick=()=>{state.questionIndex++;state.currentTeam=(state.currentTeam+1)%state.teams.length;loadQuestion()};
function finishChapter(){if(state.currentChapter===99){showResults();return}state.completed[state.currentChapter]=true;renderMap();showScreen('screen-map');toast(`${CHAPTERS[state.currentChapter].name} restaurado!`)}

function startBoss(){state.currentChapter=4;state.bossIndex=0;state.bossHp=100;showScreen('screen-boss');$('#chapterPill').textContent='FINAL BOSS';loadBossQuestion()}
function loadBossQuestion(){if(state.bossHp<=0||state.bossIndex>=BOSS_QUESTIONS.length){state.completed[4]=true;showResults();return}const q=BOSS_QUESTIONS[state.bossIndex];$('#bossPrompt').textContent=q.chat;$('#bossAnswers').innerHTML=q.answers.map((a,i)=>`<button class="answer-btn" data-bi="${i}"><span class="letter">${String.fromCharCode(65+i)}</span><span>${escapeHTML(a)}</span></button>`).join('');$$('[data-bi]').forEach(b=>b.onclick=()=>answerBoss(+b.dataset.bi));$('#bossFeedback').classList.remove('show');$('#bossHpFill').style.width=state.bossHp+'%';$('#bossHpText').textContent=state.bossHp+'%'}
function answerBoss(i){const q=BOSS_QUESTIONS[state.bossIndex];const t=state.teams[state.currentTeam];const correct=i===q.correct;$$('[data-bi]').forEach((b,idx)=>{b.disabled=true;if(idx===q.correct)b.classList.add('correct');if(idx===i&&!correct)b.classList.add('wrong')});t.answered++;state.totalAnswered++;if(correct){t.correct++;state.totalCorrect++;t.score+=300;state.bossHp=Math.max(0,state.bossHp-20);$('#bossFeedbackIcon').textContent='⚡';$('#bossFeedbackTitle').textContent='CRITICAL HIT!';$('#bossFeedbackTitle').style.color='var(--green)';$('#bossFeedbackText').textContent=`+300 XP · ${q.explain}`;$('#bossMonster').animate([{filter:'brightness(1)'},{filter:'brightness(2.8)'},{filter:'brightness(1)'}],{duration:350})}else{t.streak=0;$('#bossFeedbackIcon').textContent='×';$('#bossFeedbackTitle').textContent='ATTACK BLOCKED';$('#bossFeedbackTitle').style.color='var(--red)';$('#bossFeedbackText').textContent=q.explain}$('#bossHpFill').style.width=state.bossHp+'%';$('#bossHpText').textContent=state.bossHp+'%';$('#bossFeedback').classList.add('show')}
$('#btnBossNext').onclick=()=>{state.bossIndex++;state.currentTeam=(state.currentTeam+1)%state.teams.length;loadBossQuestion()};

function showResults(){clearInterval(state.timerId);showScreen('screen-results');const ranked=[...state.teams].sort((a,b)=>b.score-a.score);const order=ranked.length===2?[ranked[1],ranked[0]]:ranked.length>=3?[ranked[1],ranked[0],ranked[2],...ranked.slice(3)]:ranked;$('#podium').innerHTML=order.slice(0,3).map((t,i)=>{const rank=ranked.indexOf(t)+1;return `<div class="podium-card ${rank===1?'first':rank===2?'second':'third'}"><div class="podium-rank">${rank===1?'🏆':rank===2?'🥈':'🥉'}</div><h3>${escapeHTML(t.name)}</h3><div class="podium-score">${t.score} XP</div><small>${t.correct}/${t.answered} acertos</small></div>`}).join('');const acc=state.totalAnswered?Math.round(state.totalCorrect/state.totalAnswered*100):0;const mins=Math.max(1,Math.round((Date.now()-state.startedAt)/60000));const best=Math.max(...state.teams.map(t=>t.bestStreak));$('#resultStats').innerHTML=`<div class="stat-card"><small>ACCURACY</small><strong>${acc}%</strong></div><div class="stat-card"><small>BEST STREAK</small><strong>x${best}</strong></div><div class="stat-card"><small>SESSION</small><strong>${mins} min</strong></div>`}

const TUTORIAL = [
 {title:'A internet foi corrompida',body:'BOOMER.EXE está interpretando slangs literalmente. Cada equipe precisa escolher a interpretação mais adequada ao contexto para restaurar a mensagem.',visual:'“I’m cooked.” ≠ “Eu fui cozinhado.”'},
 {title:'Contexto > tradução literal',body:'Algumas slangs mudam de sentido dependendo da situação. Leia sempre a conversa inteira antes de escolher.',visual:'COOKED → em apuros / exausto / sem saída'},
 {title:'Turnos por equipe',body:'Cada questão pertence a uma equipe. Depois de responder, o turno passa automaticamente para a próxima. Acertos rápidos valem mais XP.',visual:'TEAM ALPHA → TEAM BETA → TEAM ALPHA'},
 {title:'Streak e bônus',body:'Três ou mais acertos consecutivos aumentam a pressão e dão bônus de XP. Um erro quebra a sequência.',visual:'STREAK x3 🔥 = +50 XP'},
 {title:'Poderes',body:'Cada equipe começa com 50/50, Freeze e Double XP. Eles só podem ser usados uma vez, então vale guardar para uma questão difícil.',visual:'◐ 50/50   ❄ FREEZE   ×2 DOUBLE XP'},
 {title:'Final Boss',body:'Depois de restaurar as quatro zonas, BOOMER.EXE aparece. No boss, vocês precisam interpretar mensagens completas com várias slangs juntas.',visual:'GLHF + OP + COOKED + GG = COMBO TRANSLATION'}
];
let tutorialPage=0;function openTutorial(){tutorialPage=0;renderTutorial();$('#modalTutorial').classList.add('open')}function renderTutorial(){const p=TUTORIAL[tutorialPage];$('#tutorialTitle').textContent=p.title;$('#tutorialBody').innerHTML=`<p>${p.body}</p><div class="tutorial-visual">${p.visual}</div>`;$('#tutorialDots').innerHTML=TUTORIAL.map((_,i)=>`<span class="${i===tutorialPage?'active':''}"></span>`).join('');$('#tutorialPrev').style.visibility=tutorialPage===0?'hidden':'visible';$('#tutorialNext').textContent=tutorialPage===TUTORIAL.length-1?'COMEÇAR':'PRÓXIMO →'}
$('#tutorialPrev').onclick=()=>{if(tutorialPage>0){tutorialPage--;renderTutorial()}};$('#tutorialNext').onclick=()=>{if(tutorialPage<TUTORIAL.length-1){tutorialPage++;renderTutorial()}else $('#modalTutorial').classList.remove('open')};

function renderGlossary(filter=''){const f=filter.toLowerCase();$('#glossaryGrid').innerHTML=SLANGS.filter(s=>s.term.toLowerCase().includes(f)||s.meaning.toLowerCase().includes(f)).map(s=>`<article class="glossary-item"><b>${s.term}</b><p>${s.meaning}</p><small>EX: ${s.example}</small></article>`).join('')}
$('#glossarySearch').oninput=e=>renderGlossary(e.target.value);

$('#btnStartCampaign').onclick=()=>{setupIntent='campaign';showScreen('screen-setup');$('#btnLaunch').textContent='ENTRAR NA INTERNET →'};$('#btnQuickPlay').onclick=()=>{setupIntent='quick';showScreen('screen-setup');$('#btnLaunch').textContent='INICIAR QUICK PLAY →';setTimeout(()=>toast(`Quick Play: ${$('#questionCount')?.value||16} questões misturadas.`),150)};$('#btnHowTo').onclick=openTutorial;$('#btnBackHome').onclick=()=>showScreen('screen-home');$('#btnLaunch').onclick=()=>initGame(setupIntent==='quick');
$('#btnGlossary').onclick=()=>$('#modalGlossary').classList.add('open');$('#btnPause').onclick=()=>{clearInterval(state.timerId);$('#modalPause').classList.add('open')};$('#btnResume').onclick=()=>{$('#modalPause').classList.remove('open');if($('#screen-game').classList.contains('active')&&!state.answered&&!freezeActive)startTimer()};$('#btnHome').onclick=()=>{clearInterval(state.timerId);showScreen('screen-home')};$('#btnReplay').onclick=()=>showScreen('screen-setup');$('#btnReturnHome').onclick=()=>showScreen('screen-home');
$$('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).classList.remove('open'));

