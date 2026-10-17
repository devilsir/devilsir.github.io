(function(){
'use strict';
const V=window.V,D=V.AdventureData,esc=V.escape,T=48;
const S=V.Story={pulseTime:0,companion:null,clock:0,
ensure(){return V.Progress.ensure()?.story;},
intro(){
const slides=[['Nomes que desaparecem','No Museu das Vozes, retratos perdem nomes e documentos discordam de suas próprias datas. Você continua sendo '+V.state.name+', mas a cidade logo conhecerá outro nome: o Forasteiro.'],['O último portador','Um dispositivo de latão desperta entre as fichas: o Historiógrafo Ancestral. Ele guarda vestígios de séculos, incompletos e contraditórios. Você será seu último portador.'],['Escutar antes de concluir','A equipe do museu pede ajuda para investigar. Converse, leia, compare fontes e proteja o trabalho de quem vive aqui. A noite trará uma presença que reconhece o dispositivo.']];let i=0;
const show=()=>{V.UI.modal(slides[i][0],'VOICES · A ORDEM DA RASURA',`<div class="adv-story-intro"><img src="assets/adventure/historiograph-v2.png" alt="Historiógrafo Ancestral" width="180" height="180"><p>${esc(slides[i][1])}</p></div><p class="note">WASD / setas: andar · E: interagir · H: Historiógrafo · C: personagem · M: atlas · J: diário. O caminho verde pode ser ativado no diário.</p>`,`<button id="story-skip" class="secondary">Ir direto à investigação</button><button id="story-next" class="primary">${i===2?'Explorar o museu':'Continuar'} →</button>`);V.$('#story-skip').onclick=()=>{V.UI.close();V.UI.toast('Aproxime-se do sinal no corredor central do museu.');};V.$('#story-next').onclick=()=>{if(++i<slides.length)show();else{V.UI.close();V.UI.toast('Examine a primeira rasura no corredor central.');}};};show();
},
hydrate(m){
const add=(type,id,x,y,label,extra={})=>{if(m.objects.some(o=>o.id===id))return;const p=V.Rooms.safe(m,{x,y},11)||{x,y};m.objects.push({id,type,x:p.x,y:p.y,label,interactionRange:82,...extra});};
if(m.id==='museum'){add('story','historiograph-awakening',22*T,30*T,'Examinar: nomes apagados',{event:'awakening'});add('story','archive-epilogue',22*T,19*T,'Consultar o arquivo compartilhado',{event:'epilogue'});}
if(m.id==='chapter-2'){
const door=m.objects.find(o=>o.to==='museum'),p=door?{x:door.x+100,y:door.y+120}:{x:m.width*T/2,y:m.height*T*.65};add('zambeto','zambeto-first',p.x,p.y,'Encontrar Zambeto na primeira noite',{first:true});
}
for(const c of D.cases.filter(c=>c.map===m.id)){
const config=V.Architecture.design(m.design);config.triggers||=[];
for(let i=0;i<3;i++){
const id='rasura-'+c.id+'-'+i,old=config.triggers.find(t=>t.id===id);let p;
if(old)p={x:old.x,y:old.y};else if(m.id==='museum')p={x:22*T,y:[9,18,27][i]*T};else{const clue=m.objects.find(o=>o.id===V.content.chapters[c.id-1].clues[i].id);p=clue?{x:clue.x+78,y:clue.y+58}:{x:(12+i*5)*T,y:14*T};}
p=V.Rooms.safe(m,p,11)||p;
if(!old)config.triggers.push({id,type:'evidence',chapter:c.id,index:i,x:p.x,y:p.y});
add('rasura',id,p.x,p.y,'Investigar rasura: '+c.traces[i][0],{caseId:c.id,index:i});
}
}
for(const e of m.design.adventure?.encounters||[])add('encounter',e.id,e.x,e.y,e.name||'Manifestação da Rasura',{encounter:e});
for(const trigger of m.design.adventure?.triggers||[])if(trigger.type==='notice')add('custom-trigger',trigger.id,trigger.x,trigger.y,trigger.title,{title:trigger.title,text:trigger.text,flag:trigger.flag});
if(!m.objects.some(o=>o.id==='zambeto-companion-'+m.id)){const point=V.Rooms.safe(m,{x:m.width*T/2,y:m.height*T*.65},15)||{x:m.width*T/2,y:m.height*T*.65};m.objects.push({id:'zambeto-companion-'+m.id,type:'zambeto',...point,label:'Conversar com Zambeto',companion:true,interactionRange:100,hidden:true});}
},
objective(){
const s=this.ensure();if(!s)return null;
if(s.stage==='museum'){const o=V.ObjectiveGuide.find('historiograph-awakening','museum');return o?{...o,key:'awakening',label:'Examinar os nomes apagados no museu'}:null;}
if(s.stage==='night'||s.stage==='firstbattle'){const o=V.ObjectiveGuide.find('zambeto-first','chapter-2');return o?{...o,key:'first-watch',label:'Encontrar Zambeto no pátio · aguarde as 19h se necessário'}:null;}
return null;
},
awakening(){
const s=this.ensure();if(s.stage!=='museum'){this.device();return;}
V.UI.modal('A primeira rasura','MUSEU · DOCUMENTOS DA FICÇÃO',`<div class="adv-device-banner"><img src="assets/adventure/historiograph-v2.png" width="140" height="140" alt="Historiógrafo Ancestral"><div><h3>Um nome deixa de existir.</h3><p>A legenda perdeu a autoria; a ficha do arquivo ainda a preserva. Mara pede que você guarde as duas versões para investigar a alteração.</p></div></div><div class="two-cols"><article class="card"><small>DOCUMENTO FICCIONAL</small><h3>Ficha integral</h3><p>Cadernos da Praça · registro NH-014. Autoria: oficina de Cecília e grupo de leitura. Revisão assinada por Mara; caderno de origem disponível na biblioteca.</p></article><article class="card"><small>VERSÃO ADULTERADA · FICÇÃO</small><h3>Legenda exposta</h3><p>Cadernos da Praça · registro NH-014. Autoria: “Ordem da Rasura”. O nome da oficina, o grupo de leitura e o caderno de origem foram retirados.</p></article></div><p class="note">O dispositivo pulsa. O vestígio que você sente é uma experiência sobrenatural da aventura; as fichas são as evidências desta alteração ficcional.</p>`,`<button id="story-awaken" class="primary">Guardar versões e examinar o dispositivo</button>`);
V.$('#story-awaken').onclick=()=>{
s.stage='night';s.awakened=true;V.state.flags.prologueStarted=true;V.Progress.reward('awakening',100,{water:2,tea:1});V.Save.save();V.UI.close();
V.Dialogue.start([{speaker:'curator',en:"Keep both versions. I will check the cards with the team. Follow the signal to the courtyard and compare what you find.",pt:"Guarde as duas versões. Vou conferir as fichas com a equipe. Siga o sinal até o pátio e compare o que encontrar."},{speaker:'pix',en:"The device detects a trace near the museum entrance. We can wait until seven in the evening if it is still light outside.",pt:"O dispositivo detecta um vestígio perto da entrada do museu. Podemos esperar até as sete da noite se ainda estiver claro lá fora."}],()=>{V.ObjectiveGuide.invalidate();this.device();});
};
},
firstNight(){
const s=this.ensure();if(s.met){this.guide();return;}
if(s.stage==='museum'){V.UI.toast('Mara precisa que você examine primeiro a rasura no museu.');return;}
const hour=V.Environment.time();if(hour>=6&&hour<19){V.UI.modal('O pátio aguarda a noite','A VIGÍLIA · ENCONTRO PRINCIPAL',`<p>Uma presença responde ao Historiógrafo depois do anoitecer. Você pode aguardar aqui; esta investigação não se perde com o tempo.</p>`,`<button id="story-wait" class="primary">Aguardar no pátio até 19h</button>`);V.$('#story-wait').onclick=()=>{V.Environment.setHour(19);V.UI.close();this.firstNight();};return;}
V.UI.modal('Zambeto, Guardião da Vigília','UM ENCONTRO NA PRIMEIRA NOITE',`<div class="adv-guardian-intro"><img src="assets/adventure/zambeto-illustration.png" alt="Guardião ficcional coberto de fibras de ráfia, com base ampla e ornamento superior" width="240" height="240"><div><blockquote>“Reconheço o que você carrega. O último portador não precisa ser a última voz.”</blockquote><p>O Historiógrafo responde, faminto por mais fragmentos. Zambeto observa a falha nos nomes, sem reivindicar a história de ninguém.</p><p>“Mara e sua equipe conhecem as fichas. Eu posso ajudar a vigiar. Você precisa aprender a comparar.”</p></div></div><p class="note">A forma de Zambeto se inspira na referência cultural; este encontro e seus poderes são ficcionais.</p>`,`<button id="story-cultural" class="secondary">Contexto cultural · opcional</button><button id="story-disturbance" class="primary">Investigar a manifestação</button>`);
V.$('#story-cultural').onclick=()=>this.culture(()=>this.firstNight());
V.$('#story-disturbance').onclick=()=>{s.stage='firstbattle';V.UI.close();V.Combat.begin(0,false,{intro:true});};
},
completeVigilia(){
const a=V.Progress.ensure(),s=a.story;s.met=true;s.stage='awake';s.powers=['pulse','support'];
V.state.flags.prologueStarted=true;V.state.flags.prologueDone=true;
for(const id of ['sol','leo'])if(id!==V.state.character&&!a.companions.includes(id))a.companions.push(id);
if(a.companions.length<2&&V.state.character!=='nia'&&!a.companions.includes('nia'))a.companions.push('nia');
a.party=a.companions.slice(0,2);V.Quests.word('trace');V.Quests.word('source');V.Progress.reward('vigilia',140,{kit:2});V.Save.save();
V.Dialogue.start([{speaker:'zambeto',en:"You felt a fragment of the past, Forasteiro. The Order of Erasure wants to control which names remain visible. We must find out what it changed.",pt:"Você sentiu um fragmento do passado, Forasteiro. A Ordem da Rasura quer controlar quais nomes continuam visíveis. Precisamos descobrir o que ela alterou."},{speaker:'musician',en:"Sol and I are checking the festival credits. Bring the versions you found to the Rhythm District.",pt:"Sol e eu estamos conferindo os créditos do festival. Leve as versões que encontrou ao Distrito do Ritmo."},{speaker:'zambeto',en:"I will watch the path while you investigate. Speak to the people who live and work in each district; they know things the device cannot show you.",pt:"Vou vigiar o caminho enquanto você investiga. Converse com as pessoas que vivem e trabalham em cada distrito; elas sabem coisas que o dispositivo não pode mostrar."}],()=>{V.ObjectiveGuide.track(1);V.Game.updateHUD();});
},
trace(o){
const c=D.cases[o.caseId-1],s=this.ensure(),seen=(s.traces[c.id]||[]).includes(o.index),r=c.traces[o.index],source=V.content.sources.find(x=>x.id===c.source);
V.UI.modal(r[0],r[1].toLocaleUpperCase('pt-BR')+' · '+c.title,`<div class="adv-evidence-kind">${V.Progress.icon('notes',48)}<p>${esc(r[2])}</p></div><div class="note">${o.index===2&&source?`Referência para consulta: <a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.name)}</a>.`:'Este registro e os acontecimentos de New Harmony são ficcionais.'} Documentos, testemunhos, interpretações e ecos sobrenaturais precisam ser identificados; nenhum deles permite adivinhar tudo sozinho.</div><p class="muted">English in context: <b>${['record','testimony','context'][o.index]}</b> · ${['registro','testemunho','contexto'][o.index]}</p>`,`<button id="trace-register" class="primary">${seen?'Rever conexões':'Registrar e comparar'}</button>`);
V.$('#trace-register').onclick=()=>{s.traces[c.id]||=[];if(!s.traces[c.id].includes(o.index)){s.traces[c.id].push(o.index);V.Progress.reward('trace-'+c.id+'-'+o.index,55+V.Progress.bonus('investigation'),{fragments:1});}V.Save.save();V.ObjectiveGuide.invalidate();this.case(c.id);};
},
case(id){
const c=D.cases[id-1],s=this.ensure(),traces=s.traces[id]||[],done=s.interpreted.includes(id),choice=s.choices[id];
V.UI.modal(c.title,'HISTORIÓGRAFO · CONEXÕES DE EVIDÊNCIA',`<div class="adv-evidence-grid">${c.traces.map((r,i)=>`<article class="card ${traces.includes(i)?'':'adv-undiscovered'}"><small>${r[1]}</small><h3>${esc(r[0])}</h3><p>${traces.includes(i)?esc(r[2]):'Encontre este vestígio no cenário. O guardião pode indicar um caminho, mas não completar a investigação por você.'}</p>${!traces.includes(i)?`<button data-track-trace="${i}" class="secondary">Rastrear vestígio</button>`:''}</article>`).join('')}</div>${traces.length===3?`<h3>${esc(c.question)}</h3><div class="stack">${c.options.map((text,i)=>`<button class="choice-button" data-interpret="${i}">${String.fromCharCode(65+i)} · ${esc(text)}</button>`).join('')}</div><p id="interpret-feedback" class="feedback" ${done?'':'hidden'}>${done?'✓ '+esc(c.explanation):''}</p>${done?`<div class="separator"></div><h3>O conhecimento reunido pede uma decisão</h3><p>${choice===undefined?'A cidade precisa saber como você vai cuidar destes registros.':'Decisão atual: '+esc(c.choice[choice])+'. Você pode revê-la com a equipe, sem receber outra recompensa.'}</p><div class="stack">${c.choice.map((text,i)=>`<button class="secondary" data-story-choice="${i}">${choice===i?'✓ ':''}${esc(text)}</button>`).join('')}</div>`:''}`:'<p class="note">Reúna os três registros para comparar as conclusões. Você pode consultar tudo novamente, sem limite de tempo.</p>'}`,`<button id="case-back" class="secondary">Voltar ao Historiógrafo</button>` ,true);
V.$$('[data-track-trace]').forEach(b=>b.onclick=()=>{V.ObjectiveGuide.track(null,'rasura-'+id+'-'+b.dataset.trackTrace,c.map);V.UI.close();});
V.$$('[data-interpret]').forEach(b=>b.onclick=()=>{const correct=+b.dataset.interpret===c.correct,f=V.$('#interpret-feedback');f.hidden=false;f.className='feedback'+(correct?'':' error');f.textContent=(correct?'✓ ':'Vamos conferir: ')+c.explanation;if(correct){if(!s.interpreted.includes(id)){s.interpreted.push(id);V.Progress.reward('interpret-'+id,130,{tea:1});V.Progress.ensure().resonance=Math.min(100,V.Progress.ensure().resonance+15);V.Save.save();}this.case(id);}else V.Audio.sfx('wrong');});
V.$$('[data-story-choice]').forEach(b=>b.onclick=()=>{
const i=+b.dataset.storyChoice,a=V.Progress.ensure(),first=!Object.hasOwn(s.choices,id);s.choices[id]=i;
if(first){a.resonance=Math.min(100,a.resonance+(i?25:15));a.overload=V.clamp(a.overload+(i?12:-8),0,100);V.Progress.reward('choice-'+id,45);}
V.Save.save();V.ObjectiveGuide.track(id);V.UI.close();V.UI.toast(i?'O dispositivo guardou a chave. A equipe ainda pode pedir acesso.':'As fontes e as responsabilidades serão compartilhadas com a equipe.');
});
V.$('#case-back').onclick=()=>this.device();
},
device(tab='disturbances'){
const a=V.Progress.ensure(),s=a.story;if(!a)return;
const names={disturbances:'Rasuras',connections:'Conexões',memories:'Memórias',resonance:'Ressonância'};
let body=`<div class="adv-device-banner"><img src="assets/adventure/historiograph-v2.png" alt="Historiógrafo Ancestral" width="140" height="140"><div><h3>Historiógrafo Ancestral</h3><p>Último portador: ${esc(V.state.name)} · o Forasteiro</p><p>Ressonância ${Math.round(a.resonance)}/100 · Sobrecarga ${Math.round(a.overload)}/100</p><progress max="100" value="${a.resonance}"></progress><progress class="overload" max="100" value="${a.overload}"></progress></div></div><nav class="tabs">${Object.entries(names).map(([id,n])=>`<button data-device-tab="${id}" class="${tab===id?'active':''}">${n}</button>`).join('')}</nav>`;
if(tab==='disturbances')body+=`<div class="stack">${D.cases.filter(c=>V.Quests.isUnlocked(c.id)||V.state.completed.includes(c.id)).map(c=>`<article class="adv-case-row"><div><small>CAPÍTULO ${c.id} · ${(s.traces[c.id]||[]).length}/3 FONTES</small><h3>${esc(c.title)}</h3><p>${s.interpreted.includes(c.id)?'✓ Contexto confrontado. '+(V.state.completed.includes(c.id)?'Região restaurada.':'Restaure o sistema e resolva o confronto.'):'Uma alteração precisa de contexto e participação.'}</p></div><button data-open-case="${c.id}" class="secondary">Examinar</button></article>`).join('')}</div>`;
if(tab==='connections')body+=`<p>Um testemunho pode esclarecer uma ficha, sem ser uma perspectiva universal. Uma fonte institucional tem propósito e contexto. O vestígio sobrenatural é ficção, não comprovação histórica.</p><div class="adv-connections">${D.cases.map(c=>`<article class="card"><h3>${esc(c.title)}</h3><p>${c.traces.map((r,i)=>((s.traces[c.id]||[]).includes(i)?'✓ ':'○ ')+esc(r[0])).join(' → ')}</p><small>${s.interpreted.includes(c.id)?'Conclusão revista: '+esc(c.explanation):'Conexão ainda incompleta.'}</small><button data-open-case="${c.id}" class="quiet">Rever registros</button></article>`).join('')}</div>`;
if(tab==='memories')body+=`<div class="note">${s.met?'Zambeto reconheceu o dispositivo. Ele oferece vigília, não respostas infalíveis.':'Um sinal aguarda no museu e no pátio durante a primeira noite.'}</div><div class="stack">${D.cases.filter(c=>V.state.completed.includes(c.id)).map(c=>`<article class="card"><h3>Memória ${c.id} · restauração</h3><p>${esc(c.restored)}</p><p>Decisão: ${esc(c.choice[s.choices[c.id]]||'Ainda pode ser discutida com a equipe.')}</p></article>`).join('')}</div><button id="device-culture" class="secondary">Zambeto · contexto cultural</button>`;
if(tab==='resonance')body+=`<p>Investigar registros inéditos e comparar fontes fortalece a ressonância. O pulso ajuda a perceber uma alteração próxima; não interpreta a fonte por você.</p><p>A Sobrecarga cresce quando o dispositivo é usado para acumular poder sem contexto. Acima de 60, habilidades do Historiógrafo custam +4 de foco. Acima de 85, começam cada turno com corrupção leve. Descansar, cooperar e defender reduzem a Sobrecarga.</p><p class="note">Curiosidade e conhecimentos negros não são perigosos. A tensão está em dominar, apagar contexto e controlar as histórias dos outros.</p><div class="row"><button id="device-pulse" class="primary" ${s.awakened||s.met?'':'disabled'}>Pulso de investigação</button><button id="device-rest" class="secondary">Pausa com a equipe</button></div>`;
V.UI.modal('Historiógrafo Ancestral','VESTÍGIOS · FONTES · RESPONSABILIDADE',body,'',true);
V.$$('[data-device-tab]').forEach(b=>b.onclick=()=>this.device(b.dataset.deviceTab));V.$$('[data-open-case]').forEach(b=>b.onclick=()=>this.case(+b.dataset.openCase));V.$('#device-culture')?.addEventListener('click',()=>this.culture(()=>this.device('memories')));
V.$('#device-pulse')?.addEventListener('click',()=>{V.UI.close();this.pulse();});V.$('#device-rest')?.addEventListener('click',()=>{V.Progress.rest();this.device('resonance');});
},
pulse(){
const a=V.Progress.ensure();if(V.Game.mode!=='explore'||!a.story.awakened&&!a.story.met)return;const now=V.Engine.time;if((this.lastPulse??-99)+8>now){V.UI.toast('O dispositivo precisa de alguns segundos para estabilizar.');return;}
this.lastPulse=now;this.pulseTime=2;const range=230+V.Progress.bonus('investigation')*4,near=V.World.current.objects.filter(o=>o.type==='rasura'&&!(a.story.traces[o.caseId]||[]).includes(o.index)&&V.dist(o,V.Player.data)<range).sort((a,b)=>V.dist(a,V.Player.data)-V.dist(b,V.Player.data));
a.overload=V.clamp(a.overload+Math.max(0,6-V.Progress.bonus('overload')),0,100);
if(near.length){this.pulseTarget=near[0];if(!a.story.pulseClues.includes(near[0].id))a.story.pulseClues.push(near[0].id);V.UI.toast('Há uma alteração próxima: '+near[0].label+'. Observe o registro e seu contexto.');}else{this.pulseTarget=null;V.UI.toast('Nenhuma rasura inédita ao alcance. O pulso não substitui a exploração.');}V.Audio.sfx('observe');V.Save.save();
},
guide(){
const s=this.ensure(),o=V.ObjectiveGuide.main();V.UI.modal('A vigília continua','ZAMBETO · CONVERSA FICCIONAL',`<div class="adv-guardian-small"><img src="assets/adventure/zambeto-illustration.png" width="130" height="130" alt="Zambeto"><p>“${s.stage==='epilogue'?'O arquivo tem mais caminhos agora. Escutar continua sendo trabalho de todos.':s.interpreted.length?'Você reuniu fragmentos. Pergunte também o que eles ainda não mostram.':'Não transforme o primeiro sinal na última palavra. Há moradores que já estão investigando.'}”</p></div><p>${esc(o?.label||'A cidade ainda tem leituras, criações e encontros para conhecer.')}</p>`,`<button id="guardian-culture" class="secondary">Contexto cultural</button><button id="guardian-track" class="primary">Rastrear próximo passo</button>`);V.$('#guardian-culture').onclick=()=>this.culture(()=>this.guide());V.$('#guardian-track').onclick=()=>{V.ObjectiveGuide.track();V.UI.close();};
},
culture(back=null){V.UI.modal('Zangbeto · contextos vivos','FICHA CULTURAL OPCIONAL',`<p>${esc(D.culture)}</p>${D.sources.map(s=>`<article class="source-row"><h3>${esc(s.name)}</h3><p>${esc(s.note)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Consultar referência institucional</a></article>`).join('')}`,back?'<button id="culture-back" class="primary">Voltar à aventura</button>':'');if(back)V.$('#culture-back').onclick=back;},
onVictory(id){const a=V.Progress.ensure();if(id===0){this.completeVigilia();return;}if(id>=3&&!a.companions.includes('librarian'))a.companions.push('librarian');if(id>=4&&!a.story.powers?.includes('guardian'))(a.story.powers||=[]).push('guardian');V.Quests.complete(id);},
finale(){
const a=V.Progress.ensure(),s=a.story;if(s.ending){this.epilogue();return;}
const shared=Object.values(s.choices).filter(x=>x===0).length,strong=shared>=4&&s.interpreted.length===6;
V.UI.modal('Quem segura a chave?', 'O HISTORIÓGRAFO · DECISÃO FINAL',`<div class="adv-device-banner"><img src="assets/adventure/historiograph-v2.png" alt="Historiógrafo" width="150" height="150"><p>O Curador foi contido. O Historiógrafo oferece uma última tentação: “Posso guardar tudo. Ninguém mais precisará perguntar.”<br><br>Zambeto responde: “E quem poderá discordar de você?”</p></div><p>Você continua sendo o último portador. Pode decidir como o conhecimento permanece disponível, sem entregar às próximas gerações uma única versão incontestável.</p><div class="stack"><button data-ending="shared" class="choice-button" ${strong?'':'disabled'}>Abrir o arquivo com governança compartilhada, versões, acesso e responsabilidades. ${strong?'':'· Converse novamente sobre pelo menos 4 decisões de partilha.'}</button><button data-ending="review" class="choice-button">Criar um conselho provisório, publicar os limites do acervo e combinar uma revisão.</button><button data-ending="sealed" class="choice-button">Guardar a chave apenas comigo, prometendo reavaliar minha decisão.</button></div>`,`<button id="ending-revisit" class="secondary">Rever as decisões com a comunidade</button>`,true);
V.$$('[data-ending]').forEach(b=>b.onclick=()=>{s.ending=b.dataset.ending;s.stage='epilogue';V.state.finished=true;V.Progress.reward('main-ending',500,{badge:1});V.Save.save();this.epilogue();});V.$('#ending-revisit').onclick=()=>this.device();
},
epilogue(){
const s=this.ensure();if(!s.ending){this.finale();return;}
const text=s.ending==='shared'?'O dispositivo deixa de ser a única passagem para as memórias. Cópias, fontes e versões ficam em pontos de consulta. Um conselho com moradores, educadores, artistas e pesquisadores decide critérios públicos e permite correções. Você permanece portador, mas reconhece os limites de carregar o passado sozinho.':s.ending==='review'?'O conselho provisório começa a abrir as fichas. Critérios, responsabilidades e dúvidas são publicados. Nem todas as decisões de acesso foram resolvidas; uma revisão já tem data e espaço para participação.':'A chave permanece com você. As obras e as pessoas recuperam seus créditos, mas a cidade pede acesso. O Historiógrafo está forte; a confiança está em construção. Zambeto lembra que esta escolha ainda pode ser revista.';
V.UI.modal('O arquivo continua vivo','EPÍLOGO · '+({shared:'MUITAS CHAVES',review:'UMA PORTA EM CONSTRUÇÃO',sealed:'A CHAVE E A PERGUNTA'}[s.ending]),`<p>${esc(text)}</p><div class="two-cols">${D.cases.map(c=>`<article class="card"><h3>${esc(V.content.chapters[c.id-1].name)}</h3><p>${esc(c.restored)}</p></article>`).join('')}</div><p class="note">O desfecho pertence à ficção de New Harmony. Os fatos históricos e as referências da coleção continuam disponíveis para estudo e revisão.</p>`,`<button id="epilogue-choice" class="secondary">Rever a decisão final</button><button id="epilogue-explore" class="primary">Explorar a cidade restaurada</button>`,true);
V.$('#epilogue-choice').onclick=()=>{s.ending=null;this.finale();};V.$('#epilogue-explore').onclick=()=>{V.UI.close();V.World.load('museum');V.ObjectiveGuide.track();};
},
interact(o){if(o.type==='rasura'){this.trace(o);return true;}if(o.type==='zambeto'){o.first?this.firstNight():this.guide();return true;}if(o.type==='story'){if(o.event==='awakening')this.awakening();else this.ensure().ending?this.epilogue():this.ensure().stage==='epilogue'?this.finale():this.device();return true;}if(o.type==='encounter'){V.Combat.begin(o.encounter.chapter||1,false,{custom:o.encounter});return true;}return false;},
visible(o){const s=this.ensure();if(o.type==='zambeto')return o.first?s.stage==='night'||s.stage==='firstbattle':!!s.met;if(o.id==='historiograph-awakening')return s.stage==='museum'||s.awakened;if(o.id==='archive-epilogue')return !!s.met;return true;},
update(dt){
const a=V.Progress.ensure();if(!a||!V.World.current)return;this.clock+=dt;this.pulseTime=Math.max(0,this.pulseTime-dt);
const m=V.World.current,o=m.objects.find(o=>o.companion&&o.type==='zambeto');
const first=m.objects.find(o=>o.first&&o.type==='zambeto');if(first&&this.visible(first)&&!first.appeared){first.appeared=true;first.appearTime=.8;}if(first?.appearTime>0)first.appearTime=Math.max(0,first.appearTime-dt);
if(o&&a.story.met){const p=V.Player.data;if(!this.companion||this.companion.map!==m.id){const at=V.Rooms.safe(m,{x:p.x-64,y:p.y+52},14)||{x:p.x,y:p.y};Object.assign(o,at);o.appearTime=.8;this.companion={map:m.id};}
o.appearTime=Math.max(0,(o.appearTime||0)-dt);if(o.vanishTime>0){o.vanishTime-=dt;if(o.vanishTime<=0){const at=V.Rooms.safe(m,{x:p.x-64,y:p.y+55},15);if(at)Object.assign(o,at);o.appearTime=.8;}return;}
const desired={x:p.x-64,y:p.y+55},len=V.dist(o,desired),dx=desired.x-o.x,dy=desired.y-o.y,step=Math.min(len,120*dt);o.walking=len>18;
if(o.walking&&len>0){const x=o.x+dx/len*step,y=o.y+dy/len*step;if(!V.Living.blocked(m,x,y,15)){o.x=x;o.y=y;}else if(len>210)o.vanishTime=.75;}
o.dir=Math.abs(dx)>Math.abs(dy)?dx<0?1:2:dy<0?3:0;o.frame=V.settings.reducedMotion?0:o.walking?Math.floor(this.clock*5)%4:Math.floor(this.clock*1.1)%4;
}
},
draw(ctx,o,cam){
if(!this.visible(o))return true;const x=o.x-cam.x,y=o.y-cam.y;
if(o.type==='zambeto'){
ctx.save();ctx.fillStyle='#15262a44';ctx.beginPath();ctx.ellipse(x,y+4,34,9,0,0,Math.PI*2);ctx.fill();const img=V.Assets.images.zambeto;if(img){let row=o.first?0:o.dir||0,frame=o.frame||0;if(o.appearTime>0){row=5;frame=o.appearTime>.4?0:1;}if(o.vanishTime>0){row=5;frame=o.vanishTime>.35?2:3;}ctx.drawImage(img,frame*128,row*144,128,144,Math.round(x-59),Math.round(y-123),118,133);}if(V.World.nearest?.id===o.id){ctx.strokeStyle='#d9b65f';ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(x,y+5,42,12,0,0,Math.PI*2);ctx.stroke();V.Engine.text(ctx,'Zambeto · E',x,y-126,'#f2dfaa',12,'center');}ctx.restore();return true;
}
if(o.type==='rasura'||o.type==='story'||o.type==='custom-trigger'){
const done=o.type==='rasura'&&(this.ensure().traces[o.caseId]||[]).includes(o.index);ctx.save();ctx.fillStyle=done?'#84b9a3':'#d8bb72';ctx.fillRect(x-12,y-24,24,21);ctx.fillStyle='#39484b';for(let i=0;i<3;i++)ctx.fillRect(x-7,y-19+i*5,14-i*2,2);if(!done){ctx.strokeStyle='#7ddbd0';ctx.strokeRect(x-16,y-28,32,29);}if(V.World.nearest?.id===o.id||!done)V.Living.marker(ctx,x,y,done?'✓':'◇',done?'#9fc7ac':'#dfc78c');ctx.restore();return true;
}
if(o.type==='encounter'){V.Combat.drawManifestation(ctx,o,cam);return true;}return false;
},
drawPulse(ctx,cam){
if(this.pulseTime<=0)return;const p=V.Player.data,r=(2-this.pulseTime)*125;ctx.save();ctx.globalAlpha=this.pulseTime*.3;ctx.strokeStyle='#8ce5d7';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,r,0,Math.PI*2);ctx.stroke();if(this.pulseTarget){const o=this.pulseTarget;ctx.strokeRect(o.x-cam.x-21,o.y-cam.y-33,42,44);}ctx.restore();
const fx=V.Assets.images['historio-effects'];if(fx){const frame=Math.min(4,Math.floor((2-this.pulseTime)*3));ctx.drawImage(fx,frame*64,0,64,64,p.x-cam.x-48,p.y-cam.y-60,96,96);}
}
};
})();
