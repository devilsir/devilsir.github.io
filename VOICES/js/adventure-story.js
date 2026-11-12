/* Registered module: adventure-story */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("adventure-story", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,D=V.AdventureData,esc=V.escape,T=48;
const S=V.Story={pulses:new WeakMap(),companion:null,clock:0,
 pulseRecord(player=V.Player.data){
  if(!player)return null;
  if(!this.pulses.has(player))this.pulses.set(player,{last:-Infinity,until:0,map:null,target:null});
  return this.pulses.get(player);
 },
 get pulseTime(){return Math.max(0,(this.pulseRecord()?.until??0)-(V.Engine.time||0));},
 set pulseTime(value){const pulse=this.pulseRecord();if(pulse)pulse.until=(V.Engine.time||0)+Math.max(0,Number(value)||0);},
 get pulseTarget(){return this.echo();},
 pulseDelay(){return Math.max(0,8+(this.pulseRecord()?.last??-Infinity)-(V.Engine.time||0));},
 echo(){
  const pulse=this.pulseRecord(),m=V.World.current;
  if(!pulse?.target||pulse.map!==m?.id||!m.objects.includes(pulse.target))return null;
  const found=V.Progress.ensure()?.story?.traces||{};
  return (found[pulse.target.caseId]||[]).includes(pulse.target.index)?null:pulse.target;
 },
 trackEcho(){
  const target=this.echo();
  if(!target||V.Game.mode!=='explore')return false;
  V.ObjectiveGuide.track(null,target.id,V.World.current.id);
  return true;
 },
ensure(){return V.Progress.ensure()?.story;},
intro(){
const slides=[['Nomes que desaparecem','No Museu das Vozes, retratos perdem nomes e documentos discordam de suas próprias datas. Você continua sendo '+V.state.name+', mas a cidade logo conhecerá outro nome: o Forasteiro.'],['O último portador','Uma máscara ancestral de madeira, de origem marfinense, desperta entre as fichas: o Historiógrafo Ancestral. Ela guarda vestígios de séculos, incompletos e contraditórios. Você será seu último portador.'],['Escutar antes de concluir','A equipe do museu pede ajuda para investigar. Converse, leia, compare fontes e proteja o trabalho de quem vive aqui. A noite trará uma presença que reconhece a máscara.']];let i=0;
const show=()=>{V.UI.modal(slides[i][0],'VOICES · A ORDEM DA RASURA',`<div class="adv-story-intro"><img src="assets/adventure/historiograph-mask.webp?v=20261103-mask-duo2" alt="Historiógrafo Ancestral" width="180" height="180"><p>${esc(slides[i][1])}</p></div><p class="note">WASD / setas: andar · E: interagir · H: Historiógrafo · C: personagem · M: atlas · J: diário. O caminho verde pode ser ativado no diário.</p>`,`<button id="story-skip" class="secondary">Ir direto à investigação</button><button id="story-next" class="primary">${i===2?'Explorar o museu':'Continuar'} →</button>`);V.$('#story-skip').onclick=()=>{V.UI.close();V.UI.toast('Aproxime-se do sinal no corredor central do museu.');};V.$('#story-next').onclick=()=>{if(++i<slides.length)show();else{V.UI.close();V.UI.toast('Examine a primeira rasura no corredor central.');}};};show();
},
hydrate(m){
const add=(type,id,x,y,label,extra={})=>{if(m.objects.some(o=>o.id===id))return;const p=V.Rooms.safe(m,{x,y},11)||{x,y};m.objects.push({id,type,x:p.x,y:p.y,label,interactionRange:82,...extra});};
if(m.id==='museum'){add('story','historiograph-awakening',22*T,30*T,'Examinar: nomes apagados',{event:'awakening'});add('story','archive-epilogue',22*T,19*T,'Consultar o arquivo compartilhado',{event:'epilogue'});}
if(m.id==='chapter-2'){
const door=m.objects.find(o=>o.id==='campus-travel-chapter-2-museum')||m.objects.find(o=>o.to==='museum'||o.door?.to?.map==='museum');
const p=door?.door?V.Rooms.approach(m,door.door,125):door?V.Rooms.safe(m,{x:door.x+100,y:door.y+120},15):V.Rooms.safe(m,{x:m.width*T/2,y:m.height*T*.65},15);
if(p)add('zambeto','zambeto-first',p.x,p.y,'Conversar com Zambeto no pátio',{first:true});
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
guardianTarget(){
const s=this.ensure();if(!s)return null;
if(s.stage==='museum'&&!s.met){const m=V.World.maps.museum,o=m?.objects.find(o=>o.id==='historiograph-awakening');return o?{map:m.id,object:o}:null;}
const roster=V.Companions?.ensure?.(),following=s.met&&roster?.selected==='zambeto'&&roster.follow;
const m=following?V.World.current:V.World.maps['chapter-2'];
const o=m?.objects.find(o=>o.type==='zambeto'&&(following?o.companion:o.first));
return o?{map:m.id,object:o}:null;
},
objective(){
const s=this.ensure();if(!s)return null;
if(s.stage==='museum'){const o=V.ObjectiveGuide.find('historiograph-awakening','museum');return o?{...o,key:'awakening',label:'Examinar os nomes apagados no museu'}:null;}
if(s.stage==='night'||s.stage==='firstbattle'){const o=V.ObjectiveGuide.find('zambeto-first','chapter-2');return o?{...o,key:'first-watch',label:'Encontrar Zambeto no pátio · aguarde até as 19h se necessário'}:null;}
return null;
},
awakening(){
const s=this.ensure();if(s.stage!=='museum'){this.device();return;}
V.UI.modal('A primeira rasura','MUSEU · DOCUMENTOS DA FICÇÃO',`<div class="adv-device-banner"><img src="assets/adventure/historiograph-mask.webp?v=20261103-mask-duo2" width="140" height="140" alt="Historiógrafo Ancestral"><div><h3>O mesmo número em duas fichas</h3><p>Mara prepara uma mostra de cadernos escritos nos bairros. Na manhã da abertura, encontra uma legenda com o selo da Ordem da Rasura. A cópia que Cecília trouxe da oficina tem o mesmo número e guarda outros nomes.</p></div></div><div class="two-cols"><article class="card"><small>CÓPIA DA OFICINA · FICÇÃO</small><h3>Ficha integral</h3><p>Cadernos da Praça · NH-014. O grupo de leitura e a oficina de Cecília assinam o trabalho. Mara registrou a revisão. A biblioteca guarda o caderno emprestado.</p></article><article class="card"><small>VERSÃO ADULTERADA · FICÇÃO</small><h3>Legenda exposta</h3><p>Cadernos da Praça · NH-014. Assinatura da Ordem da Rasura. O espaço para indicar quem escreveu e onde consultar o caderno ficou vazio.</p></article></div><p class="note">Ao aproximar as fichas, o Historiógrafo pulsa. O sinal aponta para o pátio, onde a equipe pode procurar outro vestígio.</p>`,`<button id="story-chronicle" class="secondary">Ler a crônica do museu</button><button id="story-awaken" class="primary">Guardar versões e examinar a máscara</button>`);
V.$('#story-chronicle').onclick=()=>V.CityChronicle.open('museum',()=>this.awakening());
V.$('#story-awaken').onclick=()=>{
s.stage='night';s.awakened=true;V.state.flags.prologueStarted=true;V.Progress.reward('awakening',100,{water:2,tea:1});V.Save.save();V.UI.close();
V.Dialogue.start([{speaker:'curator',en:"Cecília and the reading group kept a copy. I’ll ask them to check the names with us. Take both versions to the courtyard.",pt:"Cecília e o grupo de leitura guardaram uma cópia. Vou convidá-los a conferir os nomes com a gente. Leve as duas versões ao pátio."},{speaker:'pix',en:"The mask detects a trace in the courtyard. If we get there before dark, we can wait until seven.",pt:"A máscara detecta um vestígio no pátio. Se chegarmos antes de escurecer, podemos esperar até as sete."}],()=>{V.ObjectiveGuide.invalidate();this.device();});
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
V.Dialogue.start([{speaker:'zambeto',en:"The same seal can appear on many papers. Carry the copies with you and ask who kept the originals.",pt:"O mesmo selo pode aparecer em muitos papéis. Leve as cópias com você e pergunte quem guardou os originais."},{speaker:'musician',en:"That seal is on our festival programme. Sol has the rehearsal list. Come to the Rhythm District and we’ll check what changed.",pt:"Esse selo está no programa do festival. Sol tem a lista de ensaio. Venha ao Distrito do Ritmo conferir com a gente o que mudou."},{speaker:'pix',en:"I’ll add a section for local stories to your notebook. We can follow a record from the person who kept it to the place where it was published.",pt:"Vou abrir uma seção de crônicas no caderno. Dá para seguir cada registro de quem o guardou até o lugar onde foi publicado."}],()=>{V.ObjectiveGuide.track(1);V.Game.updateHUD();});
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
V.Save.save();V.ObjectiveGuide.track(id);V.UI.close();V.UI.toast(i?'A máscara guardou a chave. A equipe ainda pode pedir acesso.':'As fontes e as responsabilidades serão compartilhadas com a equipe.');
});
V.$('#case-back').onclick=()=>this.device();
},
device(tab='disturbances'){
const a=V.Progress.ensure(),s=a.story;if(!a)return;
const names={disturbances:'Rasuras',connections:'Conexões',memories:'Memórias',resonance:'Ressonância'};
let body=`<div class="adv-device-banner"><img src="assets/adventure/historiograph-mask.webp?v=20261103-mask-duo2" alt="Historiógrafo Ancestral" width="140" height="140"><div><h3>Historiógrafo Ancestral</h3><p>Último portador: ${esc(V.state.name)} · o Forasteiro</p><p>Ressonância ${Math.round(a.resonance)}/100 · Sobrecarga ${Math.round(a.overload)}/100</p><progress max="100" value="${a.resonance}"></progress><progress class="overload" max="100" value="${a.overload}"></progress></div></div><nav class="tabs">${Object.entries(names).map(([id,n])=>`<button data-device-tab="${id}" class="${tab===id?'active':''}">${n}</button>`).join('')}</nav>`;
if(tab==='disturbances')body+=`<div class="stack">${D.cases.filter(c=>V.Quests.isUnlocked(c.id)||V.state.completed.includes(c.id)).map(c=>`<article class="adv-case-row"><div><small>CAPÍTULO ${c.id} · ${(s.traces[c.id]||[]).length}/3 FONTES</small><h3>${esc(c.title)}</h3><p>${s.interpreted.includes(c.id)?'✓ Contexto confrontado. '+(V.state.completed.includes(c.id)?'Região restaurada.':'Restaure o sistema e resolva o confronto.'):'Uma alteração precisa de contexto e participação.'}</p></div><button data-open-case="${c.id}" class="secondary">Examinar</button></article>`).join('')}</div>`;
if(tab==='connections')body+=`<p>Um testemunho pode esclarecer uma ficha, sem ser uma perspectiva universal. Uma fonte institucional tem propósito e contexto. O vestígio sobrenatural é ficção, não comprovação histórica.</p><div class="adv-connections">${D.cases.map(c=>`<article class="card"><h3>${esc(c.title)}</h3><p>${c.traces.map((r,i)=>((s.traces[c.id]||[]).includes(i)?'✓ ':'○ ')+esc(r[0])).join(' → ')}</p><small>${s.interpreted.includes(c.id)?'Conclusão revista: '+esc(c.explanation):'Conexão ainda incompleta.'}</small><button data-open-case="${c.id}" class="quiet">Rever registros</button></article>`).join('')}</div>`;
if(tab==='memories')body+=`<div class="note">${s.met?'Zambeto reconheceu a máscara. Ele oferece vigília, não respostas infalíveis.':'Um sinal aguarda no museu e no pátio durante a primeira noite.'}</div><div class="stack">${D.cases.filter(c=>V.state.completed.includes(c.id)).map(c=>`<article class="card"><h3>Memória ${c.id} · restauração</h3><p>${esc(c.restored)}</p><p>Decisão: ${esc(c.choice[s.choices[c.id]]||'Ainda pode ser discutida com a equipe.')}</p></article>`).join('')}</div><button id="device-culture" class="secondary">Zambeto · contexto cultural</button>`;
if(tab==='resonance')body+=`<p>Investigar registros inéditos e comparar fontes fortalece a ressonância. O pulso ajuda a perceber uma alteração próxima; não interpreta a fonte por você.</p><p>A Sobrecarga cresce quando o artefato é usado para acumular poder sem contexto. Acima de 60, habilidades do Historiógrafo custam +4 de foco. Acima de 85, começam cada turno com corrupção leve. Descansar, cooperar e defender reduzem a Sobrecarga.</p><p class="note">Curiosidade e conhecimentos negros não são perigosos. A tensão está em dominar, apagar contexto e controlar as histórias dos outros.</p><div class="row"><button id="device-pulse" class="primary" ${s.awakened||s.met?'':'disabled'}>Pulso de investigação</button><button id="device-rest" class="secondary">Pausa com a equipe</button></div>`;
V.UI.modal('Historiógrafo Ancestral','VESTÍGIOS · FONTES · RESPONSABILIDADE',body,'',true);
V.$$('[data-device-tab]').forEach(b=>b.onclick=()=>this.device(b.dataset.deviceTab));V.$$('[data-open-case]').forEach(b=>b.onclick=()=>this.case(+b.dataset.openCase));V.$('#device-culture')?.addEventListener('click',()=>this.culture(()=>this.device('memories')));
V.$('#device-pulse')?.addEventListener('click',()=>{V.UI.close();this.pulse();});V.$('#device-rest')?.addEventListener('click',()=>{V.Progress.rest();this.device('resonance');});
},
pulse(){
 const a=V.Progress.ensure(),m=V.World.current,pulse=this.pulseRecord();
 if(!a||!m||!pulse||V.Game.mode!=='explore'||!a.story.awakened&&!a.story.met)return false;
 if(this.pulseDelay()>0){V.UI.toast('A máscara precisa de alguns segundos para estabilizar.');return false;}
 const now=V.Engine.time,range=230+V.Progress.bonus('investigation')*4;
 const nearby=m.objects.filter(o=>o.type==='rasura'&&!(a.story.traces[o.caseId]||[]).includes(o.index)&&V.dist(o,V.Player.data)<range);
 nearby.sort((left,right)=>V.dist(left,V.Player.data)-V.dist(right,V.Player.data));
 const target=nearby[0]||null;
 Object.assign(pulse,{last:now,until:now+2,map:m.id,target});
 a.overload=V.clamp(a.overload+Math.max(0,6-V.Progress.bonus('overload')),0,100);
 if(target){
  a.story.pulseClues||=[];
  if(!a.story.pulseClues.includes(target.id))a.story.pulseClues.push(target.id);
  const owner=V.DuoWorld?.context??-1,state=V.state;
  V.UI.toast('Sinal próximo · '+target.label,'mask-signal-toast',{
   label:'Rastrear sinal',
   run:()=>{
    if(V.state!==state||V.modal||V.Dialogue.active)return;
    const track=()=>{if(this.echo()===target&&this.trackEcho())V.UI.toast('Rota marcada pela máscara.');};
    if(owner>=0&&V.DuoWorld?.exploring())V.DuoWorld.withActor(owner,track);
    else track();
   }
  });
 }else V.UI.toast('Nenhuma rasura inédita ao alcance.');
 V.Audio.sfx('observe');
 V.Save.save();
 return true;
},
guide(){
const s=this.ensure(),o=V.ObjectiveGuide.main();V.UI.modal('A vigília continua','ZAMBETO · CONVERSA FICCIONAL',`<div class="adv-guardian-small"><img src="assets/adventure/zambeto-illustration.png" width="130" height="130" alt="Zambeto"><p>“${s.stage==='epilogue'?'O arquivo tem mais caminhos agora. Escutar continua sendo trabalho de todos.':s.interpreted.length?'Você reuniu fragmentos. Pergunte também o que eles ainda não mostram.':'Não transforme o primeiro sinal na última palavra. Há moradores que já estão investigando.'}”</p></div><p>${esc(o?.label||'A cidade ainda tem leituras, criações e encontros para conhecer.')}</p>`,`<button id="guardian-culture" class="secondary">Contexto cultural</button><button id="guardian-track" class="primary">Rastrear próximo passo</button>`);V.$('#guardian-culture').onclick=()=>this.culture(()=>this.guide());V.$('#guardian-track').onclick=()=>{V.ObjectiveGuide.track();V.UI.close();};
},
culture(back=null){V.UI.modal('Zangbeto · contextos vivos','FICHA CULTURAL OPCIONAL',`<p>${esc(D.culture)}</p>${D.sources.map(s=>`<article class="source-row"><h3>${esc(s.name)}</h3><p>${esc(s.note)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Consultar referência institucional</a></article>`).join('')}`,back?'<button id="culture-back" class="primary">Voltar à aventura</button>':'');if(back)V.$('#culture-back').onclick=back;},
onVictory(id){const a=V.Progress.ensure();if(id===0){this.completeVigilia();return;}if(id>=3&&!a.companions.includes('librarian'))a.companions.push('librarian');if(id>=4&&!a.story.powers?.includes('guardian'))(a.story.powers||=[]).push('guardian');V.Quests.complete(id);},
finale(){
const a=V.Progress.ensure(),s=a.story;if(s.ending){this.epilogue();return;}
const shared=Object.values(s.choices).filter(x=>x===0).length,strong=shared>=4&&s.interpreted.length===6;
V.UI.modal('Quem segura a chave?', 'O HISTORIÓGRAFO · DECISÃO FINAL',`<div class="adv-device-banner"><img src="assets/adventure/historiograph-mask.webp?v=20261103-mask-duo2" alt="Historiógrafo" width="150" height="150"><p>Com o Curador contido, Mara abre a caixa de cópias dos bairros. O programa, a ficha do museu e as outras versões mostram quem fez cada trabalho e onde a Rasura agiu. Sobre a mesa, o Historiógrafo ainda pode concentrar o acesso às fichas centrais.</p></div><p>Zambeto olha a caixa e pergunta quem poderá corrigir o próximo erro. Cecília quer que sua oficina continue decidindo o que torna público. A cidade espera sua resposta sobre quem vai guardar as chaves do catálogo.</p><div class="stack"><button data-ending="shared" class="choice-button" ${strong?'':'disabled'}>Compartilhar a guarda do catálogo com a comunidade e publicar as regras de acesso. ${strong?'':'· Converse novamente sobre pelo menos 4 decisões de partilha.'}</button><button data-ending="review" class="choice-button">Criar um conselho provisório, publicar os limites do acervo e combinar uma revisão.</button><button data-ending="sealed" class="choice-button">Guardar a chave apenas comigo, prometendo reavaliar minha decisão.</button></div>`,`<button id="ending-revisit" class="secondary">Rever as decisões com a comunidade</button>`,true);
V.$$('[data-ending]').forEach(b=>b.onclick=()=>{s.ending=b.dataset.ending;s.stage='epilogue';V.state.finished=true;V.Progress.reward('main-ending',500,{badge:1});V.Save.save();this.epilogue();});V.$('#ending-revisit').onclick=()=>this.device();
},
epilogue(){
const s=this.ensure();if(!s.ending){this.finale();return;}
const text=s.ending==='shared'?'A biblioteca recebe a primeira cópia pública do índice. No festival, Lia lê os créditos recuperados antes da música. Na escola, estudantes aprendem a pedir uma correção, e o conselho de moradores, educadores, artistas e pesquisadores registra o que pode circular e o que depende de permissão.':s.ending==='review'?'Na praça, o conselho provisório afixa o primeiro índice. A escola recebe dúvidas por escrito e a biblioteca guarda as versões anteriores. A oficina de Cecília ainda discute o uso de suas gravações. A próxima reunião já tem data e um espaço reservado para essas respostas.':'Você guarda a chave do catálogo central. As cópias emprestadas voltam aos bairros, e os moradores continuam a cuidar de seus cadernos. A assembleia envia uma carta pedindo um modo de conferir a próxima edição. A pergunta fica com você até a próxima reunião.';
V.UI.modal('O arquivo continua vivo','EPÍLOGO · '+({shared:'MUITAS CHAVES',review:'UMA PORTA EM CONSTRUÇÃO',sealed:'A CHAVE E A PERGUNTA'}[s.ending]),`<p>${esc(text)}</p><div class="two-cols">${D.cases.map(c=>`<article class="card"><h3>${esc(V.content.chapters[c.id-1].name)}</h3><p>${esc(c.restored)}</p></article>`).join('')}</div>`,`<button id="epilogue-choice" class="quiet">Rever a decisão final</button><button id="epilogue-chronicles" class="secondary">Ler as crônicas da cidade</button><button id="epilogue-explore" class="primary">Explorar a cidade restaurada</button>`,true);
V.$('#epilogue-choice').onclick=()=>{s.ending=null;this.finale();};V.$('#epilogue-chronicles').onclick=()=>V.CityChronicle.index(()=>this.epilogue());V.$('#epilogue-explore').onclick=()=>{V.UI.close();V.World.load('museum');V.ObjectiveGuide.track();};
},
interact(o){if(o.type==='rasura'){this.trace(o);return true;}if(o.type==='zambeto'){o.first&&!this.ensure().met?this.firstNight():this.guide(o);return true;}if(o.type==='story'){if(o.event==='awakening')this.awakening();else this.ensure().ending?this.epilogue():this.ensure().stage==='epilogue'?this.finale():this.device();return true;}if(o.type==='encounter'){V.Combat.begin(o.encounter.chapter||1,false,{custom:o.encounter});return true;}return false;},
visible(o){const s=this.ensure();if(o.type==='zambeto')return o.first?s.stage==='night'||s.stage==='firstbattle'||!!s.met&&!(V.Companions?.ensure?.()?.selected==='zambeto'&&V.Companions.ensure().follow):!!s.met;if(o.id==='historiograph-awakening')return s.stage==='museum'||s.awakened;if(o.id==='archive-epilogue')return !!s.met;return true;},
update(dt){
const a=V.Progress.ensure();if(!a||!V.World.current)return;this.clock+=dt;
const m=V.World.current,o=m.objects.find(o=>o.companion&&o.type==='zambeto');
const first=m.objects.find(o=>o.first&&o.type==='zambeto');if(first&&this.visible(first)&&!first.appeared){first.appeared=true;first.appearTime=.8;}if(first?.appearTime>0)first.appearTime=Math.max(0,first.appearTime-dt);
if(o&&a.story.met){const p=V.Player.data;if(!this.companion||this.companion.map!==m.id||o.formationHidden){const at=V.FollowerPositions.ground('companion',p,m,14);if(!at){o.formationHidden=true;return;}o.formationHidden=false;Object.assign(o,at);o.appearTime=.8;o.walkDistance=0;this.companion={map:m.id};}
o.appearTime=Math.max(0,(o.appearTime||0)-dt);if(o.vanishTime>0){o.walking=false;o.vanishTime-=dt;if(o.vanishTime<=0){const at=V.FollowerPositions.ground('companion',p,m,15);if(at)Object.assign(o,at);else o.formationHidden=true;o.appearTime=.8;o.walkDistance=0;}return;}
if(o.animationUntil>V.Engine.time){o.walking=false;return;}
const desired=V.FollowerPositions.ground('companion',p,m,14);
if(!desired){o.walking=false;if(V.dist(o,p)<72)o.formationHidden=true;return;}
if(V.dist(o,p)<68)Object.assign(o,desired);
const len=V.dist(o,desired),dx=desired.x-o.x,dy=desired.y-o.y;
if(len>330){o.walking=false;o.vanishTime=.75;return;}
const maxSpeed=Math.max(155,180*(V.settings.speed||1)*(V.Life?.movementMultiplier()??1));
const step=len<.5?0:Math.min(len,maxSpeed*dt,len*(1-Math.exp(-6*dt)));
if(step>0){const x=o.x+dx/len*step,y=o.y+dy/len*step;if(!V.Living.blocked(m,x,y,15)){
 o.walking=step/Math.max(dt,.001)>(o.walking?6:12);
 if(o.walking){if(Math.abs(dx)>len*.12)o.dir=dx<0?1:2;o.walkDistance=(o.walkDistance||0)+step;}o.x=x;o.y=y;
}else{o.walking=false;if(len>210)o.vanishTime=.75;}}else o.walking=false;
o.frame=V.settings.reducedMotion?0:o.walking?Math.floor((o.walkDistance||0)/96*4)%4:Math.floor(this.clock*1.1)%4;
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
 const time=this.pulseTime,record=this.pulseRecord();
 if(time<=0||record?.map!==V.World.current?.id)return;
 const p=V.Player.data,target=this.echo(),still=V.settings.reducedFlash||V.settings.reducedMotion;
 ctx.save();
 ctx.globalAlpha=still?.66:time*.34;
 ctx.strokeStyle='#8ce5d7';ctx.lineWidth=3;
 if(!still){ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,(2-time)*125,0,Math.PI*2);ctx.stroke();}
 if(target)ctx.strokeRect(target.x-cam.x-21,target.y-cam.y-33,42,44);
 ctx.restore();
 const fx=V.Assets.images['historio-effects'];
 if(fx&&!still){
  const frame=Math.min(4,Math.floor((2-time)*3));
  ctx.drawImage(fx,frame*64,0,64,64,p.x-cam.x-48,p.y-cam.y-60,96,96);
 }
}
};
})();

});
