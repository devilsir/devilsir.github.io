(()=>{
'use strict';
const $=s=>document.querySelector(s);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=window.ChatChaosLanguageData,words=window.ChatChaosWords;
if(!data||!words)return;
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
let category='slang',currentDetail=null,slow=false;
const speed=()=>slow?.78:.96;
const voiceOk=!!window.speechSynthesis&&'SpeechSynthesisUtterance' in window;
function speechLang(text){return /\b(escolha|encontre|uma|aluno|aluna|colega|escreveu|jogada|partida|após|explicação|contexto|o streamer|a streamer|a pessoa|a atualização|questão|qual frase|quatro amigos|um servidor)\b/i.test(String(text))?'pt-BR':'en-US'}
function speak(text,lang='en-US'){
 if(!voiceOk){setAudioStatus('Este navegador não disponibilizou voz. Teste Chrome ou Edge com vozes instaladas.');return false}
 const value=String(text||'').replace(/[“”]/g,'"').trim();if(!value)return false;
 try{
  speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(value);utterance.lang=lang;utterance.rate=speed();utterance.pitch=1;
  const candidate=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase()===(lang.toLowerCase())&&v.localService) || speechSynthesis.getVoices().find(v=>v.lang.toLowerCase()===(lang.toLowerCase())) ||speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));
  if(candidate)utterance.voice=candidate;
  utterance.onerror=()=>setAudioStatus('Não foi possível reproduzir. Verifique o áudio e as vozes do navegador.');
  speechSynthesis.speak(utterance);setAudioStatus(`🔊 Reproduzindo em ${lang==='pt-BR'?'português':'inglês'}…`);return true;
 }catch{setAudioStatus('A reprodução não está disponível neste dispositivo.');return false}
}
function setAudioStatus(value){const el=$('#labAudioStatus');if(el)el.textContent=value}
window.ChatChaosPronunciation={speak,stop:()=>{if(voiceOk)speechSynthesis.cancel()}};
for(const [term,senses] of Object.entries(data.polysemy))if(!words.entries[term])words.entries[term]=senses[0][0];
words.count=Object.keys(words.entries).length;
const baselineSlang=SLANGS.length-data.slangs.filter(s=>SLANGS.some(a=>normalize(a.term)===normalize(s.term))).length;
function sensesFor(kind,key){
 if(kind==='word'){
  const known=data.polysemy[key];
  if(known)return known.map(s=>({meaning:s[0],example:s[1],translation:s[2]}));
  const pt=words.entries[key]||'';
  const usage=window.ChatChaosWordExamples?.[key.toLowerCase()];
  return [{meaning:pt,example:usage?.[0]||null,translation:usage?.[1]||null}];
 }
 if(kind==='phrase'){
  const p=data.phrases.find(s=>s.term===key);if(!p)return [];
  return [{meaning:p.meaning,example:p.example,translation:p.translation}];
 }
 if(slangSenses[key])return slangSenses[key];
 const s=SLANGS.find(s=>s.term===key);if(!s)return [];
 const t=s.translation||'';
 return [{meaning:s.meaning,example:s.example,translation:t}];
}
const legacyTranslations={
'FOMO':'Todo mundo vai à festa, e estou com muito medo de ficar de fora.','GG':'Essa foi por pouco. Bom jogo!',
'WP':'Bom jogo e bem jogado; aquela virada foi incrível.','OP':'Aquele personagem está forte demais.',
'nerf':'Eles precisam enfraquecer esta arma.','buff':'Finalmente fortaleceram meu personagem principal.',
'main':'Mercy é minha personagem principal.','alt':'Hoje estou jogando com minha conta alternativa.',
'NPC':'Cara, ele respondeu como se fosse um NPC.','loot':'Conseguimos itens raros do chefão.',
'noob':'Ainda sou iniciante nesse jogo.','newbie':'Sou iniciante. Alguma dica?',
'rage quit':'Ele perdeu uma vez e saiu do jogo irritado.','LMK':'Me avise se quiser participar.',
'GL/HF':'Boa sorte e divirtam-se, pessoal!','POV':'Imagine: você estudou para a prova errada.',
'IYKYK':'Aquela pizza do refeitório... quem sabe, sabe.','TL;DR':'Resumindo: perdemos o ônibus.',
'rent free':'Aquela música não sai da minha cabeça.','cooked':'Eu não estudei. Estou em apuros.'};
const moreTranslations={
'FYP':'Este vídeo apareceu na minha página Para Você.',
'trend':'Todo mundo está fazendo essa tendência nesta semana.',
'viral':'O vídeo dela viralizou de um dia para o outro.',
'it’s giving…':'Aquele look passa uma vibe de protagonista.',
'ate':'Você arrasou naquela apresentação!',
'slay':'Aquele visual? Arrasou.',
'DM':'Mande o link por mensagem privada depois.',
'story':'Publiquei a foto nos meus stories.',
'mutuals':'Nós nos seguimos há dois anos.',
'close friends':'Eu publiquei isso só para os amigos próximos.',
'soft launch':'Ela deu pistas do novo relacionamento com uma foto de dois cafés.',
'hard launch':'Eles anunciaram o relacionamento com uma foto do casal.',
'server':'Entre no servidor da nossa turma depois da escola.',
'VC':'Estamos em chamada de voz agora.',
'ping':'Me avise quando a aula começar. / Meu ping é de 180 ms.',
'AFK':'Vou ficar ausente por dois minutos. Já volto.',
'BRB':'Já volto, preciso pegar água.',
'@everyone':'Atenção, pessoal: a reunião começa em cinco minutos.',
'GGWP':'Bom jogo, bem jogado, pessoal. Essa foi por pouco.',
'meta':'Essa combinação é a estratégia dominante no momento.',
'clutch':'Aquela defesa no último segundo foi decisiva.',
'carry':'Ela carregou o time na rodada final.',
'grind':'Preciso repetir missões para conseguir equipamentos melhores.',
'spawn':'Os inimigos aparecem perto da ponte.',
'respawn':'Espere cinco segundos e seu personagem reaparecerá.',
'lag':'Não consigo me mover por causa do atraso.',
'sweat / sweaty':'É uma partida casual; por que eles estão tão competitivos?',
'toxic':'O chat ficou hostil depois da partida.',
'chat':'Pessoal do chat, devo tentar esta fase novamente?',
'mod':'O moderador removeu a mensagem de spam.',
'clip':'Salve aquele momento num clipe!',
'raid':'Vamos levar o público para outra live agora.',
'lurk':'Estou ocupado, então vou só assistir sem comentar.',
'W / L':'Aquela atualização foi uma vitória. / Perder o evento foi uma derrota.',
'thread':'Expliquei tudo naquela sequência de publicações.',
'ratio':'Aquela resposta recebeu muito mais engajamento do que o post original.',
'reply':'Eu deixei uma resposta abaixo da publicação.',
'mid':'O filme foi meio mediano.'
};
const slangSenses={
'2':[
 {meaning:'to — para / a',example:'I want 2 see you.',translation:'Quero ver você.'},
 {meaning:'too — também / demais',example:'I like it 2!',translation:'Eu também gosto!'},
 {meaning:'two — dois',example:'I have 2 notebooks.',translation:'Tenho dois cadernos.'}
],
'4':[
 {meaning:'for — para / por',example:'This gift is 4 u.',translation:'Este presente é para você.'},
 {meaning:'four — quatro',example:'There are 4 students here.',translation:'Há quatro estudantes aqui.'}
],
'ur':[
 {meaning:'your — seu / sua',example:'Ur photo looks great!',translation:'Sua foto ficou ótima!'},
 {meaning:"you're — você é / está",example:'Ur very kind!',translation:'Você é muito gentil!'}
],
'u':[{meaning:'you — você / vocês',example:'Do u want to join?',translation:'Você quer participar?'}],
'r':[{meaning:'are — é / está / são / estão',example:'R u ready?',translation:'Você está pronto?'}],
'b4':[{meaning:'before — antes',example:'Call me b4 the game.',translation:'Me ligue antes da partida.'}],
'l8r':[{meaning:'later — mais tarde',example:'See u l8r!',translation:'Até mais tarde!'}],
'gr8':[{meaning:'great — ótimo / excelente',example:'That was a gr8 movie!',translation:'Aquele filme foi ótimo!'}],
'w8':[{meaning:'wait — espere',example:'W8 for me!',translation:'Espere por mim!'}],
'2day':[{meaning:'today — hoje',example:'We have class 2day.',translation:'Temos aula hoje.'}],
'2night':[{meaning:'tonight — hoje à noite',example:'See u 2night!',translation:'Te vejo hoje à noite.'}],
'OP':[
 {meaning:'Overpowered — forte demais (jogos)',example:'This boss is OP.',translation:'Este chefão está forte demais.'},
 {meaning:'Original poster — autor da publicação (fórum)',example:'OP edited the original post.',translation:'O autor editou a publicação original.'}
],
'ping':[
 {meaning:'Marcar / avisar alguém em um chat',example:'Ping me when the teacher arrives.',translation:'Me avise quando o professor chegar.'},
 {meaning:'Latência da conexão, em milissegundos',example:'My ping is 240 ms today.',translation:'Meu ping está em 240 milissegundos hoje.'}
],
'server':[
 {meaning:'Servidor / comunidade online',example:'Join the class server.',translation:'Entre no servidor da turma.'},
 {meaning:'Garçom / atendente de restaurante (inglês comum)',example:'The server brought our food.',translation:'O garçom trouxe nossa comida.'}
],
'ate':[
 {meaning:'Arrasou, fez algo muito bem (gíria)',example:'You ate that performance!',translation:'Você arrasou naquela apresentação!'},
 {meaning:'Passado do verbo eat (comer)',example:'I ate breakfast early.',translation:'Tomei café da manhã cedo.'}
],
'main':[
 {meaning:'Personagem principal que o jogador usa',example:'Kiriko is my main.',translation:'Kiriko é minha personagem principal.'},
 {meaning:'Principal / mais importante (uso comum)',example:'This is my main goal.',translation:'Este é meu objetivo principal.'}
],
'raid':[
 {meaning:'Levar a audiência para outra live',example:'Let’s raid another streamer.',translation:'Vamos levar nossa audiência para outra live.'},
 {meaning:'Investida / missão coletiva em jogo',example:'Our team completed the raid.',translation:'Nossa equipe completou a incursão.'}
],
'clip':[
 {meaning:'Recorte curto de vídeo / live',example:'Clip that moment!',translation:'Salve aquele momento num clipe!'},
 {meaning:'Prendedor / clipe de papel (inglês comum)',example:'Use a clip to hold the pages.',translation:'Use um clipe para juntar as páginas.'}
],
'story':[
 {meaning:'Publicação temporária nas redes sociais',example:'I posted a story.',translation:'Publiquei um story.'},
 {meaning:'História / narrativa',example:'Tell me a story.',translation:'Conte-me uma história.'}
],
'W / L':[
 {meaning:'W = vitória / resultado positivo',example:'That update is a W.',translation:'Aquela atualização é uma vitória.'},
 {meaning:'L = derrota / resultado negativo',example:'Missing the event was an L.',translation:'Perder o evento foi uma derrota.'}
],
'POV':[
 {meaning:'Point of view — ponto de vista / perspectiva',example:'The story is told from her POV.',translation:'A história é contada pelo ponto de vista dela.'},
 {meaning:'Fórmula de meme que faz a pessoa imaginar uma situação',example:'POV: you forgot about the test.',translation:'Imagine: você esqueceu que tinha prova.'}
],
'chat':[
 {meaning:'Conversa por mensagens',example:'We have a group chat.',translation:'Temos um grupo de mensagens.'},
 {meaning:'Público de uma transmissão ao vivo',example:'Chat, should I try again?',translation:'Pessoal do chat, devo tentar de novo?'}
],
'NPC':[
 {meaning:'Personagem não jogável (jogos)',example:'The NPC gave me a quest.',translation:'O personagem não jogável me deu uma missão.'},
 {meaning:'Uso figurado para comportamento repetitivo; pode soar ofensivo',example:'He kept repeating the same line like an NPC.',translation:'Ele repetia a mesma frase como um NPC.'}
]
};
const phraseMap=new Map(data.phrases.map(s=>[normalize(s.term),s]));
function entryHtml(kind,key,label,desc,secondary=''){
 return `<button type="button" class="lab-entry" data-kind="${escape(kind)}" data-key="${escape(key)}" aria-label="Abrir significados e exemplos de ${escape(key)}"><span class="lab-entry-title">${escape(label)}<span aria-hidden="true">↗</span></span><span class="lab-entry-meaning">${escape(desc)}</span>${secondary?`<span class="lab-entry-sub">${escape(secondary)}</span>`:''}</button>`;
}
const tabs=$('.dictionary-tabs'),search=$('#glossarySearch'),grid=$('#glossaryGrid');
let platformFilter='all';
const platformOptions=[['all','Todas'],['instagram','📸 Instagram'],['tiktok','🎵 TikTok'],['facebook','👥 Facebook'],['chat','💬 Chat / SMS']];
const platformBar=document.createElement('div');platformBar.id='socialPlatformFilters';platformBar.className='social-platform-filters';
platformBar.setAttribute('aria-label','Filtrar gírias por plataforma');
search.before(platformBar);
function renderPlatformFilter(){platformBar.innerHTML=platformOptions.map(([value,label])=>`<button type="button" class="social-platform-filter ${value===platformFilter?'active':''}" data-platform="${value}" aria-pressed="${value===platformFilter}">${label}</button>`).join('')}
platformBar.onclick=e=>{const button=e.target.closest('[data-platform]');if(!button)return;platformFilter=button.dataset.platform;renderPlatformFilter();render()};
renderPlatformFilter();

const phraseBtn=document.createElement('button');phraseBtn.id='dictPhrases';phraseBtn.type='button';phraseBtn.className='dict-tab';phraseBtn.setAttribute('aria-selected','false');phraseBtn.textContent=`💬 Frases úteis (${data.phrases.length})`;tabs.appendChild(phraseBtn);
$('#dictionaryCount').textContent=Object.keys(words.entries).filter(w=>!words.blacklist.has(w)).length;
const countLabel=document.createElement('div');countLabel.id='labResultsCount';countLabel.className='lab-results-count';grid.before(countLabel);
const detail=document.createElement('div');detail.id='modalDictionaryEntry';detail.className='modal lab-modal';detail.setAttribute('role','dialog');detail.setAttribute('aria-modal','true');detail.setAttribute('aria-labelledby','labDetailTerm');
detail.innerHTML=`<div class="modal-card panel lab-detail"><button type="button" class="modal-x" id="labDetailClose" aria-label="Fechar verbete">×</button><div class="section-kicker">DICIONÁRIO INTERATIVO · EN / PT</div><div class="lab-detail-head"><div><div class="lab-kind" id="labDetailKind"></div><h2 id="labDetailTerm"></h2><p class="lab-description" id="labDetailDescription"></p></div><button type="button" class="lab-sound" id="labDetailSpeak">🔊 Ouvir palavra</button></div><label class="lab-slow"><input type="checkbox" id="labSlow"/> 🐢 Pronúncia lenta (0,78×)</label><div id="labSenses"></div><div id="labAudioStatus" role="status" aria-live="polite"></div><p class="lab-footnote">Áudio gerado pela voz do navegador. A qualidade e a disponibilidade da voz dependem do aparelho.</p></div>`;
document.body.appendChild(detail);
const oldFocus={node:null};
function openDetail(kind,key){
  currentDetail={kind,key};oldFocus.node=document.activeElement;
  const item=kind==='phrase'?data.phrases.find(x=>x.term===key):kind==='slang'?SLANGS.find(x=>x.term===key):null;
  $('#labDetailKind').textContent={word:'📖 PALAVRA',phrase:'💬 EXPRESSÃO / FRASE',slang:'🎮 GÍRIA DIGITAL'}[kind];
  $('#labDetailTerm').textContent=key;$('#labDetailDescription').textContent=item?.meaning||words.entries[key]||'';
  $('#labDetailSpeak').textContent=kind==='word'?'🔊 Ouvir palavra':'🔊 Ouvir expressão';
  $('#labSlow').checked=slow;
  const senses=sensesFor(kind,key);$('#labSenses').innerHTML=senses.map((s,i)=>`<section class="lab-sense"><div class="lab-sense-top"><span class="lab-sense-number">SIGNIFICADO ${i+1}</span><strong>${escape(s.meaning)}</strong></div>${s.example&&s.translation?`<div class="lab-example"><div class="lab-lang-line"><span class="lab-lang">EN</span><span>${escape(s.example)}</span></div><div class="lab-lang-line"><span class="lab-lang pt">PT</span><span>${escape(s.translation)}</span></div><div class="lab-audio-actions"><button type="button" class="lab-sound compact" data-speak-example="${i}">🔊 Ouvir exemplo (EN)</button><button type="button" class="lab-sound secondary compact" data-speak-translation="${i}">🔊 Ouvir tradução (PT)</button></div></div>`:'<div class="lab-example"><p>Exemplo contextual em revisão. Você ainda pode ouvir a pronúncia da palavra.</p></div>'}</section>`).join('');
  setAudioStatus('');detail.classList.add('open');$('#labDetailClose').focus();
}
function closeDetail(){detail.classList.remove('open');currentDetail=null;if(voiceOk)speechSynthesis.cancel();if(oldFocus.node?.isConnected)oldFocus.node.focus()}
$('#labDetailClose').onclick=closeDetail;
detail.addEventListener('click',e=>{if(e.target===detail)closeDetail()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&detail.classList.contains('open')){e.stopPropagation();closeDetail()}});
$('#labSlow').onchange=e=>{slow=e.target.checked};
$('#labDetailSpeak').onclick=()=>{if(currentDetail)speak(currentDetail.key,'en-US')};
$('#labSenses').addEventListener('click',e=>{const b=e.target.closest('[data-speak-example],[data-speak-translation]');if(!b||!currentDetail)return;const translated=b.hasAttribute('data-speak-translation');const i=+(translated?b.dataset.speakTranslation:b.dataset.speakExample);const selected=sensesFor(currentDetail.kind,currentDetail.key)[i];if(selected)speak(translated?(selected.translation||legacyTranslations[currentDetail.key]||moreTranslations[currentDetail.key]||selected.meaning):selected.example,translated?'pt-BR':'en-US')});
function setCategory(next){
 category=next;platformBar.hidden=next!=='slang';
 [['slang','#dictSlangs'],['word','#dictWords'],['phrase','#dictPhrases']].forEach(([v,id])=>{const b=$(id);b.classList.toggle('active',next===v);b.setAttribute('aria-selected',next===v?'true':'false')});
 search.value='';search.placeholder=next==='slang'?'Busque uma gíria ou significado...':next==='word'?'Busque uma palavra em inglês ou português...':'Busque uma frase em inglês ou português...';
 $('#dictionaryHelp').textContent=next==='slang'?'Toque numa gíria para estudar significado, tradução, exemplo e pronúncia. Durante a partida, pistas não revelam o termo avaliado.':next==='word'?'Toque na palavra para descobrir os significados e ouvir sua pronúncia. Palavras com vários sentidos mostram exemplos separados.':'Toque em uma frase para abrir a tradução, um exemplo contextualizado e ouvir ambas as pronúncias em inglês.';
 render();
}
function render(){
 const query=normalize(search.value);
 let list=[];
 if(category==='slang')list=SLANGS.filter(s=>(platformFilter==='all'||s.tag===platformFilter)&&normalize([s.term,s.meaning,s.example,s.tag].join(' ')).includes(query)).map(s=>entryHtml('slang',s.term,s.term,({'instagram':'📸 Instagram · ','tiktok':'🎵 TikTok · ','facebook':'👥 Facebook · ','chat':'💬 Chat / SMS · '}[s.tag]||'')+s.meaning,s.example));
 else if(category==='phrase')list=data.phrases.filter(s=>normalize([s.term,s.meaning,s.example].join(' ')).includes(query)).map(s=>entryHtml('phrase',s.term,s.term,s.meaning,s.example));
 else list=Object.entries(words.entries).filter(([term,pt])=>!words.blacklist.has(term)&&normalize(term+' '+pt).includes(query)).sort((a,b)=>a[0].localeCompare(b[0],'en')).map(([en,pt])=>entryHtml('word',en,en,pt,data.polysemy[en]?`${data.polysemy[en].length} significados + exemplos`:'Ver exemplo e ouvir pronúncia'));
 countLabel.textContent=`${list.length} ${category==='word'?'palavras':category==='phrase'?'frases':'gírias'} encontradas${list.length>160?' · mostrando as primeiras 160':''}`;
 grid.innerHTML=list.slice(0,160).join('')||'<p class="dictionary-guidance">Nenhum resultado. Tente outra palavra ou expressão.</p>';
}
$('#dictSlangs').onclick=()=>setCategory('slang');$('#dictWords').onclick=()=>setCategory('word');$('#dictPhrases').onclick=()=>setCategory('phrase');
search.oninput=render;
grid.onclick=e=>{const btn=e.target.closest('[data-kind][data-key]');if(btn)openDetail(btn.dataset.kind,btn.dataset.key)};
$('#btnWordBankHome').onclick=()=>{$('#modalGlossary').classList.add('open');setCategory('word')};
$('#btnGlossary').onclick=()=>{const active=($('#screen-game').classList.contains('active')&&!state.answered)||($('#screen-boss').classList.contains('active')&&!$('#bossFeedback').classList.contains('show'));if(active){toast('📚 O dicionário completo fica disponível após responder, para não revelar a gíria.');return}$('#modalGlossary').classList.add('open');setCategory('slang')};
const counts=$('#dictionaryCount');counts.textContent=Object.keys(words.entries).filter(w=>!words.blacklist.has(w)).length;
render();
function questionAudioControls(target,kind){
 const wrapper=document.createElement('div');wrapper.className='question-audio';wrapper.innerHTML=`<button type="button" class="lab-sound" data-read="${kind==='boss'?'boss':'context'}">🔊 Ouvir contexto</button><button type="button" class="lab-sound secondary" data-read="prompt">🔊 Ouvir enunciado (PT)</button><label class="lab-slow"><input type="checkbox" class="lab-audio-speed"/> 🐢 Lento</label>`;
 target.after(wrapper);return wrapper;
}
questionAudioControls($('#chatBubble'),'question');questionAudioControls($('#bossPrompt'),'boss');
document.addEventListener('click',e=>{
 const opt=e.target.closest('[data-read]');if(!opt)return;
 const kind=opt.dataset.read;
 if(kind==='context'){const v=state.currentQuestion?.chat||$('#chatBubble').textContent;speak(v,speechLang(v))}
 else if(kind==='boss'){const v=BOSS_QUESTIONS[state.bossIndex%BOSS_QUESTIONS.length]?.chat||$('#bossPrompt').textContent;speak(v,speechLang(v))}
 else if(kind==='prompt'){const v=$('#screen-boss')?.classList.contains('active')?BOSS_QUESTIONS[state.bossIndex%BOSS_QUESTIONS.length]?.prompt:state.currentQuestion?.prompt;speak(v||$('#questionPrompt').textContent,'pt-BR')}
});
document.addEventListener('change',e=>{if(e.target.matches('.lab-audio-speed')){slow=e.target.checked;document.querySelectorAll('.lab-audio-speed').forEach(x=>x.checked=slow)}});
const origDisplay=window.ChatChaosBilingual.display;
window.ChatChaosBilingual.display=(q,i)=>{
 const pair=origDisplay(q,i),source=String(q?.answers?.[i]||'').trim();
 const normalized=source.toLowerCase().replace(/[^a-z0-9]/g,'');
 const slangSingle=SLANGS.some(s=>s.term.toLowerCase().replace(/[^a-z0-9]/g,'')===normalized);
 if(slangSingle&&source.length<=34)return {en:source,pt:source};
 return pair;
};
window.ChatChaosLanguageLab={setCategory,openDetail,counts:()=>({slangs:SLANGS.length,words:Object.keys(words.entries).filter(w=>!words.blacklist.has(w)).length,phrases:data.phrases.length}),speechSupported:voiceOk};
})();
