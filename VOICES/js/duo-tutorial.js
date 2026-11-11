/* Registered module: duo-tutorial */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("duo-tutorial", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
/* Each person owns their introduction, practice actions and optional game training. */
(function(){
'use strict';
const V=window.V,D=V.DuoWorld,G=V.Onboarding;
if(!D||V.DuoChallenges?.isChild)return;
const W=V.World,H=V.Homestead,HOME='interior-player-cottage',steps=V.OnboardingData.steps,esc=V.escape,copy=x=>JSON.parse(JSON.stringify(x));
const C=V.DuoTutorial={bound:null,currentOwner:-1,eventOwner:-1,menuOwner:0,sessions:new Map(),tick:0,routeCache:[],
 enabled(){return D.enabled()&&V.Game.screen==='game';},
 owner(){return this.currentOwner>=0?this.currentOwner:this.eventOwner>=0?this.eventOwner:D.context>=0?D.context:this.menuOwner;},
 withOwner(i,fn){const old=this.currentOwner;this.currentOwner=i;try{return fn();}finally{this.currentOwner=old;}},
 ensure(){
  if(!this.enabled())return null;
  if(this.bound!==V.state){for(const i of [...this.sessions.keys()])this.closeTraining(i);this.bound=V.state;this.menuOwner=0;this.eventOwner=-1;this.routeCache=[];}
  const legacy=G.record();let state=V.state.duoTutorial;
  if(!state||state.version!==1||!Array.isArray(state.players))state=V.state.duoTutorial={version:1,players:[]};
  for(let i=0;i<2;i++){
   let r=state.players[i];if(!r||typeof r!=='object')r=state.players[i]={status:legacy.status==='complete'?'complete':legacy.status==='skipped'?'skipped':'running',step:legacy.step||0,ack:false,practice:copy(legacy.practice||{}),skippedSteps:[],folded:false};
   r.step=V.clamp(Math.floor(Number(r.step)||0),0,steps.length-1);r.practice||={};r.skippedSteps||=[];r.character=D.characters()[i];if(!['running','complete','skipped'].includes(r.status))r.status='running';
  }
  return state;
 },
 record(i){return this.ensure()?.players[i];},
 step(i){return steps[this.record(i)?.step||0];},
 stopCollective(){G.active=false;G.suspended=false;G.bound=V.state;V.GuideOverlay.hide('main');},
 start(replay=false,index=null){
  if(!this.enabled())return false;this.ensure();this.stopCollective();
  for(const i of index===null?[0,1]:[index]){const r=this.record(i);if(replay){Object.assign(r,{step:0,ack:false,practice:{},moveStart:null,skippedSteps:[],status:'running'});this.removeNote(i);}else if(r.status==='complete')continue;r.status='running';r.help=false;r.folded=false;this.prepare(i);}
  this.render();V.Save.save();return true;
 },
 open(i){const r=this.record(i);if(!r)return;r.help=true;r.folded=false;this.render(i);},
 prepare(i){const r=this.record(i),s=this.step(i),actor=D.actors[i];if(!r||!actor)return;
  if(s.id==='move'&&!r.moveStart)r.moveStart={map:W.current.id,x:actor.data.x,y:actor.data.y,moved:actor.moved};
  if(['route','interact'].includes(s.id)){r.practice.tracked=true;this.ensureNote(i);}
  if(s.id==='word'){r.practice.conversationIndex=0;r.practice.speaking=true;}
 },
 ack(i,event,detail){const r=this.record(i);if(!r||r.status!=='running'||r.ack||this.step(i).event!==event)return false;if(event==='word'&&String(detail).toLowerCase()!=='record')return false;r.ack=true;this.render(i);V.Save.save();return true;},
 next(i,skip=false){const r=this.record(i),s=this.step(i);if(!r||r.status!=='running'||s.event&&!r.ack&&!skip)return false;
  if(skip&&!r.skippedSteps.includes(s.id))r.skippedSteps.push(s.id);
  if(s.finish||r.step>=steps.length-1)return this.finish(i,false);
  r.step++;r.ack=false;r.folded=false;this.prepare(i);this.render(i);V.Save.save();return true;
 },
 finish(i,skipped=false){const r=this.record(i);if(!r)return;this.closeTraining(i);r.status=skipped?'skipped':'complete';r.completedAt=new Date().toISOString();r.help=false;this.removeNote(i);
  const records=this.ensure().players;if(records.every(p=>p.status!=='running'))G.record().status=records.every(p=>p.status==='complete')?'complete':'skipped';
  this.render(i);V.Save.save();
 },
 target(i){const key={missions:'journal','mission-tabs':'journal',pix:'pix',notebook:'notebook',challenges:'challenges',atlas:'map',homes:'home','visit-home':'home',furniture:'home',backpack:'inventory',save:'pause'}[this.step(i)?.id];return key&&D.root?.querySelector('[data-world-player="'+i+'"][data-world-menu="'+key+'"]');},
 text(i,s){
  if(s.id==='move')return 'Use '+(i?'as setas ↑ ← ↓ →':'W A S D')+' para mover seu personagem. Ele para quando você solta as teclas. A câmera da sua metade da tela acompanha você.';
  if(s.id==='route')return 'A linha '+(i?'dourada':'verde')+' do seu tutorial leva até o seu bilhete. Cada pessoa tem uma rota e um bilhete próprios.';
  if(s.id==='interact')return 'Seu bilhete de treino está marcado no chão. Aproxime-se até aparecer '+(i?'Enter':'E')+'. Essa indicação identifica o objeto ou a pessoa com quem você pode interagir.';
  if(s.id==='translation')return 'Na conversa de treino, mostre ou oculte sua tradução sem alterar a da outra pessoa. Nos diálogos da aventura, a opção Frase completa do PIX começa ativa e pode ser desligada nas configurações. As palavras individuais continuam disponíveis.';
  if(s.id==='visit-home')return 'A Casa das Sementes já pertence à dupla. Visitar leva seu personagem até a casa; rastrear marca sua entrada. Apenas quem fez a ação avança nesta etapa do tutorial.';
  if(s.id==='select-furniture')return 'Selecione um item do depósito para decorar. Se a outra pessoa já colocou a planta presenteada, escolha um móvel instalado e use Mover / girar.';
  if(s.id==='sleep')return 'Na casa, aproxime-se da cama e use '+(i?'Enter':'E')+'. Depois escolha Acordar de manhã. O descanso passa o horário da cidade para as 8h.';
  if(s.id==='save')return 'O perfil guarda a aventura da dupla e as etapas de cada tutorial. Na pausa, você pode exportar um arquivo de progresso para guardar ou levar a outro computador.';
  return s.text;
 },
 topicText(i,t){
  if(t.id==='controls')return 'Jogador '+(i+1)+': mova com '+(i?'as setas':'W A S D')+' e interaja com '+(i?'Enter':'E')+'. Use os ícones à esquerda da sua tela para abrir os menus. O livro abre sua ajuda individual.';
  if(t.id==='profiles')return 'O perfil da dupla guarda os dois personagens e a aventura compartilhada. As etapas, os treinos e a opção de pular ou rever esta introdução são individuais. Exporte um backup na pausa para levar o perfil a outro computador.';
  return t.text;
 },
 instruction(i,s){if(s.id==='move')return i?'Caminhe com ↑ ← ↓ →. Só o seu deslocamento conta nesta etapa.':'Caminhe com W A S D. Só o seu deslocamento conta nesta etapa.';
  if(s.id==='route')return 'Siga a linha da sua tela. O bilhete da outra pessoa não aparece no seu visualizador.';
  if(s.id==='interact')return'Chegue ao SEU bilhete e use '+(i?'Enter':'E')+' ou Interagir no seu menu.';
  if(s.id==='select-furniture')return'Selecione um móvel do depósito. Se ele já estiver instalado, use Mover / girar na lista.';
  if(s.id==='place-furniture')return'Coloque ou reposicione um móvel e confirme. A ação será registrada só no seu tutorial.';
  if(s.id==='translation')return 'Use Mostrar minha tradução ou Ocultar minha tradução nesta conversa.';
  if(s.id==='sleep')return 'Deite usando '+(i?'Enter':'E')+' e escolha Acordar de manhã. Você também pode pular esta etapa.';
  if(s.id==='ready')return 'Conclua seu tutorial e continue explorando. A outra pessoa pode terminar no próprio ritmo.';
  if(this.target(i))return'Use o ícone destacado no seu visualizador ou o botão abaixo. '+(s.manual?'Leia a orientação e continue quando quiser.':'');
  return s.instruction;
 },
 practiceHTML(i,s,r){const p=r.practice,button=(action,label,disabled=false)=>'<button class="secondary" data-duo-guide-action="'+action+'" '+(disabled?'disabled':'')+'>'+label+'</button>';
  if(s.id==='accept')return'<p>Pedido de treino: ler o bilhete e escutar PIX.</p>'+button('accept',p.accepted?'Pedido aceito':'Aceitar meu pedido',!!p.accepted);
  if(s.id==='track')return button('track','Rastrear meu bilhete');
  if(s.id==='interact')return p.read?'<blockquote>'+esc(p.noteText||'Mara: uma cidade se conhece ouvindo suas pessoas. Leia registros, escute PIX e compare as fontes.')+'</blockquote><p>✓ Seu bilhete foi lido.</p>':'<p>Seu bilhete está marcado no cenário. A outra pessoa tem um bilhete separado.</p>';
  if(['talk','word','translation','finish-talk'].includes(s.id)){
   if(s.id==='talk'&&!p.speaking)return button('talk','Conversar com PIX no meu tutorial');
   const lines=[['Hello! Please read the record.','Olá! Por favor, leia o registro.'],['Your house is in the residential district. Listen to the people before you decide.','Sua casa fica no bairro residencial. Escute as pessoas antes de decidir.']],line=lines[Math.min(1,p.conversationIndex||0)],english=esc(line[0]).replace('record','<button class="duo-guide-word" data-duo-guide-action="word">record</button>');
   return'<section class="duo-guide-conversation"><strong>PIX · conversa de treino</strong><p lang="en">'+english+'</p>'+((p.translation??V.settings.translation)?'<p lang="pt-BR">'+esc(line[1])+'</p>':'')+button('translation',(p.translation??V.settings.translation)?'Ocultar minha tradução':'Mostrar minha tradução')+(s.id==='finish-talk'?button('conversation',p.conversed?'Conversa concluída':'Continuar minha conversa',!!p.conversed):'')+'</section>';
  }
  if(s.id==='deliver')return'<p>'+(p.read?'✓':'○')+' Bilhete lido · '+(p.conversed?'✓':'○')+' PIX ouvido</p>'+button('deliver','Concluir minha acolhida',!p.read||!p.conversed);
  if(s.id==='try-challenge')return button('training',p.runnerGuide?.status==='running'?'Continuar meu treino da corrida':'Abrir meu treino da corrida');
  if(s.id==='buy-home'){const offer=H.data.offers.find(o=>o.id==='interior-player-loft'),price=offer?.price||900;return'<p>Carteira de treino: '+(p.purchase?.balance??price)+' moedas · preço: '+price+'</p>'+button('purchase',p.purchase?.bought?'Compra de treino concluída':'Comprar na minha simulação',!!p.purchase?.bought);}
  const action={missions:['missions','Abrir minhas missões'],'mission-tabs':['missions','Ver os tipos de missão'],pix:['pix','Abrir PIX'],notebook:['notebook','Abrir o Caderno'],challenges:['challenges','Abrir Desafios'],atlas:['map','Abrir Atlas'],homes:['home','Abrir Casas'],'visit-home':['visit','Visitar minha casa'],furniture:['arrange','Organizar a casa'],'select-furniture':['arrange','Abrir a organização'],'place-furniture':['arrange','Abrir a organização'],sleep:[W.current?.id===HOME?'sleep':'visit',W.current?.id===HOME?'Encontrar a cama':'Visitar a casa'],backpack:['inventory','Abrir Mochila'],save:['pause','Abrir a pausa e o backup']}[s.id];
  return action?button(...action):'';
 },
 render(index=null){
  if(!this.enabled()||!D.root)return;this.ensure();this.stopCollective();
  for(const i of index===null?[0,1]:[index]){
   const r=this.record(i),s=this.step(i),scene=D.root.querySelectorAll('.duo-world-scene')[i];if(!scene)continue;
   let card=scene.querySelector('[data-duo-guide-player]');if(!card){card=document.createElement('aside');card.className='duo-guide-card';card.dataset.duoGuidePlayer=i;card.setAttribute('aria-label','Tutorial individual do jogador '+(i+1));scene.append(card);}
   D.root.querySelectorAll('[data-world-player="'+i+'"].duo-guide-target').forEach(b=>b.classList.remove('duo-guide-target'));if(r.status==='running')this.target(i)?.classList.add('duo-guide-target');
   card.hidden=r.status!=='running'&&!r.help||!!this.training(i)||!!V.DuoSessions?.playing(i);if(card.hidden)continue;
   const stamp=JSON.stringify([r,D.actors[i]?.map]);if(card.dataset.stamp===stamp)continue;card.dataset.stamp=stamp;
   const name=V.content.characters[r.character]?.name||'Jogador '+(i+1);
   card.innerHTML='<header><div><small>PIX · JOGADOR '+(i+1)+'</small><strong>'+esc(name)+' · '+(r.help?'seu guia':s.id==='interact'?'Chegue perto e use '+(i?'Enter':'E'):s.title)+'</strong></div><button class="quiet" data-duo-guide-action="fold" aria-label="'+(r.folded?'Expandir':'Recolher')+' meu tutorial">'+(r.folded?'+':'−')+'</button></header>'+(r.folded?'':r.help?'<div class="duo-guide-body"><p>Seu progresso é individual. Você pode rever ou continuar a introdução sem reiniciar a outra pessoa.</p><button class="primary" data-duo-guide-action="resume">'+(r.status==='complete'?'Rever do início':'Continuar meu tutorial')+'</button><button class="secondary" data-duo-guide-action="restart">Recomeçar só o meu tutorial</button><details><summary>Consultar orientações</summary>'+V.OnboardingData.topics.map(t=>'<details><summary>'+esc(t.title)+'</summary><p>'+esc(this.topicText(i,t))+'</p></details>').join('')+'</details><button class="quiet" data-duo-guide-action="help-close">Fechar ajuda</button></div>':'<div class="duo-guide-body"><progress max="'+steps.length+'" value="'+r.step+'" aria-label="Progresso do tutorial do jogador '+(i+1)+'"></progress><small>ETAPA '+(r.step+1)+' / '+steps.length+' · '+esc(s.group)+'</small><p>'+esc(this.text(i,s))+'</p><p class="duo-guide-instruction">'+esc(r.ack?'✓ '+(s.after||'Ação concluída por você. Continue quando quiser.'):this.instruction(i,s))+'</p>'+this.practiceHTML(i,s,r)+'<footer><button class="primary" data-duo-guide-action="next" '+(s.event&&!r.ack?'disabled':'')+'>'+(s.finish?'Concluir meu tutorial':'Continuar')+'</button>'+(s.event&&!r.ack?'<button class="quiet" data-duo-guide-action="skip-step">Pular esta etapa</button>':'')+'<button class="quiet" data-duo-guide-action="skip">Pular meu tutorial</button></footer></div>');
   card.querySelectorAll('[data-duo-guide-action]').forEach(b=>b.onclick=()=>this.withOwner(i,()=>this.action(i,b.dataset.duoGuideAction)));
  }
 },
 action(i,action){const r=this.record(i),p=r.practice;
  if(action==='fold'){r.folded=!r.folded;this.render(i);return;}
  if(action==='next')return this.next(i);if(action==='skip-step')return this.next(i,true);if(action==='skip')return this.finish(i,true);
  if(action==='restart')return this.start(true,i);if(action==='resume')return this.start(r.status==='complete',i);
  if(action==='help-close'){r.help=false;this.render(i);return;}
  if(action==='accept'){p.accepted=true;return this.ack(i,'accept');}
  if(action==='track'){p.tracked=true;this.ensureNote(i);return this.ack(i,'track');}
  if(action==='talk'){p.speaking=true;p.conversationIndex=0;this.ack(i,'talk');}
  else if(action==='word'){V.PixCollection.collect('record','Tutorial individual · jogador '+(i+1));this.ack(i,'word','record');}
  else if(action==='translation'){p.translation=!(p.translation??V.settings.translation);this.ack(i,'translation');}
  else if(action==='conversation'){p.conversationIndex=(p.conversationIndex||0)+1;if(p.conversationIndex>=2){p.conversed=true;p.speaking=false;this.ack(i,'conversation-finished');}}
  else if(action==='deliver'&&p.read&&p.conversed){p.delivered=true;p.tracked=false;this.ack(i,'deliver');}
  else if(action==='purchase'){const price=H.data.offers.find(o=>o.id==='interior-player-loft')?.price||900;p.purchase||={balance:price,bought:false};if(!p.purchase.bought){p.purchase.balance-=price;p.purchase.bought=true;this.ack(i,'purchase-practice');}}
  else if(action==='visit'){p.visitPending=true;D.withActor(i,()=>V.FastTravel.travel(HOME));}
  else if(action==='arrange'){D.withActor(i,()=>H.organize(HOME));this.ack(i,'arrange');}
  else if(action==='sleep'){const bed=W.current.objects.find(H.isBed);if(bed){p.bed=bed.id;p.bedTracked=true;V.UI.toast('Jogador '+(i+1)+': aproxime-se da cama e use '+(i?'Enter.':'E.'));}}
  else if(action==='training')return this.startTraining(i);
  else if(action==='missions'){D.withActor(i,()=>V.CityMenus.board());this.ack(i,'missions');}
  else if(['pix','notebook','challenges','map','home','inventory','pause'].includes(action))D.menu(i,action);
  this.render(i);V.Save.save();
 },
 ensureNote(i){
  const r=this.record(i),m=W.current,actor=D.actors[i];if(!r||!actor||!m)return null;const id='duo-tutorial-note-'+i;let note=m.objects.find(o=>o.id===id);if(note)return note;
  const saved=r.practice.note;let at=saved?.map===m.id&&D.usable(saved)&&!V.Living.blocked(m,saved.x,saved.y,12)?saved:null;
  if(!at)for(const distance of [100,144,192])for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const point={x:actor.data.x+dx*distance,y:actor.data.y+dy*distance};if(!at&&!V.Living.blocked(m,point.x,point.y,14)&&!m.objects.some(o=>V.dist(o,point)<48))at=point;}
  at||=D.safe({x:actor.data.x+96,y:actor.data.y});r.practice.note={map:m.id,x:at.x,y:at.y};note={id,type:'duo-tutorial-note',duoGuide:i,x:at.x,y:at.y,label:'Meu bilhete de acolhida · jogador '+(i+1),interactionRange:82};m.objects.push(note);return note;
 },
 removeNote(i){for(const m of Object.values(W.maps))m.objects=m.objects.filter(o=>o.id!=='duo-tutorial-note-'+i);this.routeCache[i]=null;},
 drawNote(c,o,cam){if(D.context!==o.duoGuide)return true;V.Assets.prop(c,9,o.x-cam.x-22,o.y-cam.y-38,44);V.Living.marker(c,o.x-cam.x,o.y-cam.y-58,o.duoGuide?'Enter':'E','#f5ce7e');return true;},
 drawRoute(i,c,cam){const r=this.record(i);if(r?.status!=='running'||!['route','interact','sleep'].includes(this.step(i).id))return;const target=this.step(i).id==='sleep'?W.current.objects.find(H.isBed):r.practice.tracked&&this.ensureNote(i);if(!target)return;
  const p=D.actors[i].data,key=W.current.id+':'+Math.round(p.x/32)+':'+Math.round(p.y/32)+':'+target.id;let route=this.routeCache[i];if(route?.key!==key){route=this.routeCache[i]={key,path:V.Rooms.navigation(W.current,p,{x:target.x,y:target.y+20},9)};}
  c.save();c.strokeStyle=i?'#f0cc7c':'#8ed4b3';c.lineWidth=3;c.setLineDash([5,8]);c.beginPath();c.moveTo(p.x-cam.x,p.y-cam.y);for(const point of route.path||[]){const x=Array.isArray(point)?point[0]:point.x,y=Array.isArray(point)?point[1]:point.y;if(Number.isFinite(x)&&Number.isFinite(y))c.lineTo(x-cam.x,y-cam.y);}c.stroke();c.restore();
 },
 update(dt){if(!this.enabled())return;this.ensure();this.stopCollective();for(let i=0;i<2;i++){const r=this.record(i),actor=D.actors[i];if(r.status!=='running'||!actor||this.training(i))continue;
   if(this.step(i).id==='move'&&!r.ack){if(!r.moveStart||r.moveStart.map!==actor.map)r.moveStart={map:actor.map,x:actor.data.x,y:actor.data.y,moved:actor.moved};if((actor.moved-r.moveStart.moved)>=60||Math.hypot(actor.data.x-r.moveStart.x,actor.data.y-r.moveStart.y)>=65)this.ack(i,'move');}
   if(['route','interact'].includes(this.step(i).id))this.ensureNote(i);
  }this.tick+=dt;if(this.tick>.2){this.tick=0;this.render();}
 },
 training(i){return this.sessions.has(i);},
 send(session,message){session.frame.contentWindow?.postMessage({voicesDuo:session.token,...message},'*');},
 startTraining(i){
  if(this.training(i)||!D.root)return;const scene=D.root.querySelectorAll('.duo-world-scene')[i],box=document.createElement('section'),token='tutorial-'+i+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
  box.className='duo-guide-training';box.dataset.duoGuidePlayer=i;box.innerHTML='<header><strong>Treino individual · jogador '+(i+1)+'</strong><button class="secondary">Voltar ao meu mundo</button></header><iframe title="Treino da corrida · jogador '+(i+1)+'" allow="autoplay"></iframe><p>Preparando seu treino… A outra pessoa pode continuar explorando.</p>';
  scene.append(box);const frame=box.querySelector('iframe'),session={player:i,token,frame,box,snapshot:null};this.sessions.set(i,session);box.querySelector('button').onclick=()=>this.leaveTraining(i);const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('voices-duo',token);url.searchParams.set('player',i);frame.src=url.href;this.clearInput(i);this.render(i);
 },
 receive(e){const m=e.data;if(!m?.voicesDuo||!this.enabled())return;const session=[...this.sessions.values()].find(s=>s.token===m.voicesDuo&&s.frame.contentWindow===e.source);if(!session)return;const i=session.player,r=this.record(i);
  if(m.type==='ready'){const state=copy(V.state),character=D.characters()[i];for(const key of ['duoTutorial','duoWorld','duoChallenge','profileId'])delete state[key];state.character=character;state.name=V.content.characters[character].name;state.playerCharacters=[character];state.flags={...state.flags,prologueDone:true,prologueStarted:true};state.playground||={version:1,serial:0,runs:{},records:{},guides:{},ledger:{},current:null};state.playground.current=null;if(r.practice.runnerGuide)state.playground.guides.runner=copy(r.practice.runnerGuide);
   this.send(session,{type:'boot',state,key:'play:runner',options:{mode:'training',stage:0,difficulty:0},resume:r.practice.runnerGuide?.status==='running',settings:{...V.settings,muted:V.settings.muted||i===1,challengePlayers:1,playerCharacters:[character]}});
  }else if(m.type==='started'){session.box.querySelector('p').hidden=true;}
  else if(m.type==='snapshot'){session.snapshot=m.state;const guide=m.state?.playground?.guides?.runner;if(guide)r.practice.runnerGuide=copy(guide);V.Save.save();if(session.leaving)this.closeTraining(i);}
  else if(m.type==='physical'){if(m.code==='Escape'&&m.down&&!m.repeat)this.leaveTraining(i);else if(V.DuoSessions?.enabled())V.DuoSessions.physical(m.code,m.down,m.repeat);else if(!this.routeKey(m.code,m.down,m.repeat))this.worldKey(m.code,m.down,m.repeat);}
  else if(m.type==='exit')this.closeTraining(i,r.practice.runnerGuide?.status==='complete');
  else if(m.type==='error')session.box.querySelector('p').textContent='Não foi possível abrir seu treino: '+String(m.message||'tente novamente.');
 },
 clearInput(i){for(const key of i?['arrowleft','arrowright','arrowup','arrowdown','enter','shiftright']:['w','a','s','d','e','f','q','r',' ','1','2','3']){V.Input.keys.delete(key);V.Input.pressed.delete(key);}},
 leaveTraining(i){const session=this.sessions.get(i);if(!session||session.leaving)return;session.leaving=true;session.closeTimer=setTimeout(()=>this.closeTraining(i),1200);this.send(session,{type:'command',command:'save'});},
 closeTraining(i,complete=null){const session=this.sessions.get(i);if(!session)return;const current=this.bound===V.state;complete??=current&&V.state.duoTutorial?.players[i]?.practice.runnerGuide?.status==='complete';clearTimeout(session.closeTimer);session.box.remove();this.sessions.delete(i);this.clearInput(i);if(complete&&current)this.ack(i,'challenge-practice');if(current)this.render(i);},
 routeKey(code,down,repeat=false){let i=/^(Arrow|Numpad)/.test(code)||['Enter','ShiftRight','ControlRight','Slash','Period'].includes(code)?1:/^(Key[WASDEFQR]|Space|Digit[123])$/.test(code)?0:-1;const session=this.sessions.get(i);if(!session)return false;this.send(session,{type:'input',code,down,repeat});return true;},
 worldKey(code,down,repeat=false){const key={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',KeyE:'e',KeyQ:'q',ArrowLeft:'arrowleft',ArrowRight:'arrowright',ArrowUp:'arrowup',ArrowDown:'arrowdown',Enter:'enter',ShiftRight:'shiftright',Space:' '}[code];if(!key)return;const i=/^Arrow|Enter|ShiftRight/.test(code)?1:0;if(down){V.Input.keys.add(key);if(!repeat)V.Input.pressed.add(key);this.withOwner(i,()=>D.withActor(i,()=>V.Game.onKey(key,{repeat,preventDefault(){}})));}else V.Input.keys.delete(key);},
 handleKey(e,down){if(!this.enabled()||V.modal||/INPUT|SELECT|TEXTAREA/.test(e.target?.tagName||''))return false;
  const button=e.target?.closest?.('button'),scope=button?.closest('[data-world-player],[data-duo-guide-player]');if(scope&&['Enter','Space'].includes(e.code)){
   const owner=+(scope.dataset.worldPlayer??scope.dataset.duoGuidePlayer),player=e.code==='Enter'?1:0;
   if(owner===player){if(down&&!e.repeat)button.click();}
   else if(!this.routeKey(e.code,down,e.repeat)&&down&&!e.repeat&&player===1)D.use(1);
   return true;
  }
  if(e.code==='Escape'&&down){const frame=document.activeElement?.closest?.('.duo-guide-training'),i=frame?+frame.dataset.duoGuidePlayer:this.owner();if(this.training(i)){this.leaveTraining(i);return true;}}
  return this.routeKey(e.code,down,e.repeat);
 }
};

const start=G.start.bind(G),help=G.help.bind(G),ack=G.ack.bind(G),render=G.render.bind(G),paused=G.paused.bind(G);
G.start=function(replay=false){return C.enabled()?C.start(replay,C.currentOwner>=0||C.eventOwner>=0?C.owner():null):start(replay);};
G.help=function(...args){return C.enabled()?C.open(C.owner()):help(...args);};
G.ack=function(event,detail){return C.enabled()?C.ack(C.owner(),event,detail):ack(event,detail);};
G.render=function(...args){return C.enabled()?C.render():render(...args);};
V.Hooks.around(G, 'update', 'duo-tutorial:update:1', nextHook => function(dt){return C.enabled()?C.update(dt):nextHook(dt);});
G.paused=function(){return C.enabled()?false:paused();};
const gameStart=V.Game.startGame.bind(V.Game);V.Game.startGame=function(...args){const out=gameStart(...args);if(C.enabled()){C.ensure();C.stopCollective();for(let i=0;i<2;i++)if(C.record(i).status==='running')C.prepare(i);C.render();}return out;};
const menu=D.menu.bind(D);D.menu=function(i,key){return C.withOwner(i,()=>{C.menuOwner=i;const out=menu(i,key),event={journal:'missions',pix:'pix',notebook:'notebook',challenges:'challenges',home:'homes',inventory:'backpack'}[key];if(event)C.ack(i,event);return out;});};
const modal=V.UI.modal.bind(V.UI);V.UI.modal=function(...args){const i=C.enabled()?C.owner():null,out=modal(...args);if(i!==null){C.menuOwner=i;V.$('#modal-root').dataset.duoOwner=i;}return out;};
const ensureAssets=V.MapAssets.ensure.bind(V.MapAssets);V.MapAssets.ensure=function(groups,label,after,...args){const owner=C.enabled()?C.owner():null,state=V.state,guarded=after&&owner!==null?(...values)=>V.state===state&&C.enabled()?C.withOwner(owner,()=>D.withActor(owner,()=>after(...values))):after(...values):after;return ensureAssets(groups,label,guarded,...args);};
V.Hooks.around(V.Game, 'interact', 'duo-tutorial:interact:1', nextHook => function(o,...args){if(C.enabled()&&o?.type==='duo-tutorial-note'){const i=C.owner();if(i!==o.duoGuide||V.modal||V.Dialogue.active)return;C.record(i).practice.read=true;C.record(i).practice.noteText='Mara: uma cidade se conhece ouvindo suas pessoas. Leia registros, escute PIX e compare as fontes.';C.ack(i,'inspect');C.render(i);return;}return nextHook(o,...args);});
const interactables=W.interactables.bind(W);W.interactables=function(...args){const list=interactables(...args);return C.enabled()?list.filter(o=>o.type!=='duo-tutorial-note'||o.duoGuide===(D.context>=0?D.context:0)):list;};
const load=W.load.bind(W);W.load=function(...args){const out=load(...args);if(C.enabled()){const i=D.context>=0?D.context:0;if(C.record(i).practice.visitPending&&D.actors[i]?.map===HOME){C.record(i).practice.visitPending=false;C.record(i).practice.homeVisited=true;C.ack(i,'visit-home');}C.render();}return out;};
const travel=V.FastTravel.travel.bind(V.FastTravel);V.FastTravel.travel=function(id,...args){if(C.enabled()&&id===HOME&&C.step(C.owner()).id==='visit-home')C.record(C.owner()).practice.visitPending=true;return travel(id,...args);};
const wake=H.wake.bind(H);H.wake=function(...args){if(C.enabled()&&D.context!==C.owner())return D.withActor(C.owner(),()=>wake(...args));return wake(...args);};
const gameRender=V.Game.render.bind(V.Game);V.Game.render=function(...args){const out=gameRender(...args);if(C.enabled()&&D.visible&&!V.MapAssets.busy)for(let i=0;i<2;i++)D.withActor(i,()=>{const canvas=D.root.querySelector('[data-world-canvas="'+i+'"]');C.drawRoute(i,canvas.getContext('2d'),W.camera);});return out;};
const title=V.Game.toTitle.bind(V.Game);V.Game.toTitle=function(...args){for(const i of [...C.sessions.keys()])C.closeTraining(i);C.bound=null;return title(...args);};
const pause=V.Game.pause.bind(V.Game);V.Game.pause=function(reason,...args){const insideTraining=[...C.sessions.values()].some(s=>s.frame===document.activeElement);if(C.enabled()&&insideTraining&&document.hasFocus()&&/foco|janela/i.test(String(reason))){V.Input.clear();return;}return pause(reason,...args);};
for(const owner of [V.Cozy,V.World,V.AfricanMuseum,V.AfricanCuration,V.PlayMuseum]){const method=owner===V.PlayMuseum?'draw':'drawObject';if(!owner?.[method])continue;const draw=owner[method].bind(owner);owner[method]=function(c,o,cam,...args){return o?.type==='duo-tutorial-note'?C.drawNote(c,o,cam):draw(c,o,cam,...args);};}
document.addEventListener('click',e=>{if(!C.enabled())return;const element=e.target.closest?.('[data-world-player],[data-duo-guide-player],[data-duo-panel-player],#modal-root,#dialogue-root');let i=element?.dataset.worldPlayer??element?.dataset.duoGuidePlayer??element?.dataset.duoOwner;if(i===undefined)return;C.eventOwner=+i;queueMicrotask(()=>C.eventOwner=-1);
 const installed=e.target.closest?.('[data-home-edit]');if(installed){const item=H.ensure().placed[H.organizeId]?.find(p=>p.id===installed.dataset.homeEdit);if(item){C.record(+i).practice.furnitureItem=item.item;C.ack(+i,'select-furniture');}}
},true);
document.addEventListener('keydown',e=>{if(C.enabled()&&!e.ctrlKey&&!e.metaKey&&/^Key|^F1$/.test(e.code)&&!e.target.closest?.('#modal-root')){C.eventOwner=0;queueMicrotask(()=>C.eventOwner=-1);}},true);
document.addEventListener('change',e=>{if(C.enabled()&&e.target.id==='home-place-item'&&e.target.value){const i=C.owner();C.record(i).practice.furnitureItem=e.target.value;C.ack(i,'select-furniture');}});
V.Events.on('home-editor-opened',e=>{if(C.enabled()&&e.home===HOME)C.ack(C.owner(),'arrange');});
V.Events.on('home-furniture-committed',e=>{if(C.enabled()&&e.home===HOME)C.ack(C.owner(),'place-furniture');});
for(const key of ['prepare','practiceHTML','action','ensureNote']){const original=C[key].bind(C);C[key]=function(i,...args){return D.actors[i]?D.withActor(i,()=>original(i,...args)):original(i,...args);};}
window.addEventListener('message',e=>C.receive(e));
})();

});
