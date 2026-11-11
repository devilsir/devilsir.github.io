/* Registered module: duo-challenges */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("duo-challenges", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
/* Each viewer owns a game runtime, input state and camera. The profile owns saves. */
(function(){
'use strict';
const V=window.V,esc=V.escape,copy=x=>JSON.parse(JSON.stringify(x));
const params=new URLSearchParams(location.search),isChild=window.parent!==window&&params.has('voices-duo');
const characters=['nia','leo','taina','sol'];
const D=V.DuoChallenges={isChild,active:false,frames:[],paused:[false,false],ready:[false,false],session:null,
 players(){const list=V.state?.playerCharacters||V.settings?.playerCharacters||[V.state?.character||'nia','leo'];return[list[0]||'nia',list[1]||characters.find(x=>x!==list[0])||'leo'];},
 controls(game,index){
  const move=index?'↑ ← ↓ →':'W A S D',primary=index?'Enter / 0 numérico':'Espaço',use=index?'Shift direito':'E';
  if(game==='rhythm')return move+' · quatro batidas: '+(index?'← ↓ ↑ →':'A S W D');
  if(game==='fishing')return move+': mover anzol · '+primary+': lançar/fisgar/recolher · '+(index?'Shift direito':'X')+': afrouxar. Você também pode tocar na água e usar os botões.';
  if(game==='radio')return(index?'↑ / ↓: canal · ← / →: sintonia':'W / S: canal · A / D: sintonia')+' · '+primary+': transmitir';
  if(game==='fogo-montanha')return(index?'← parado · ↓ costas · → virar':'A parado · S costas · D virar');
  if(game==='ampe')return primary+': palmas · '+(index?'← esquerdo · → direito':'A esquerdo · D direito');
  if(game==='matacuzana')return primary+': lançar/apanhar · '+use+': recolher';
  if(game==='terra-mar')return(index?'← terra · → mar':'A terra · D mar')+' · '+primary+': mesmo lado';
  if(game==='roda-jo')return(index?'← voltar · → passar':'A voltar · D passar')+' · '+primary+': segurar';
  if(game==='platform')return move+' · '+primary+': pular · '+(index?'Shift direito: atacar · /: impulso · .: montar':'F: atacar · Q: impulso · R: montar');
  if(game==='moto')return(index?'→ acelerar · ← frear · ↑/↓ ângulo':'D acelerar · A frear · W/S ângulo')+' · segure '+primary+' para carregar e solte para lançar · '+(index?'1–3 numéricos: encomenda':'1–3: encomenda');
  return move+' · '+primary+': ação · '+use+': interagir/confirmar. Também é possível clicar nos controles de cada tela.';
 },
 choice(key){
  if(isChild)return;
  const g=V.ChallengeCatalog.item(key),button=V.$('#challenge-play')||V.$('#culture-start');if(!g||!button||V.$('#duo-choice'))return;
  const list=this.players(),host=document.createElement('section');host.id='duo-choice';host.className='duo-choice';
  host.innerHTML='<strong>Quem vai jogar?</strong><div class="row"><label><input type="radio" name="challenge-players" value="1" '+(V.settings.challengePlayers!==2?'checked':'')+'> Individual</label><label><input type="radio" name="challenge-players" value="2" '+(V.settings.challengePlayers===2?'checked':'')+'> Dupla · duas telas</label></div><div class="row" id="duo-character-choice">'+[0,1].map(i=>'<label class="field">Jogador '+(i+1)+' · '+(i?'setas':'WASD')+'<select data-duo-character="'+i+'">'+characters.map(id=>'<option value="'+id+'" '+(id===list[i]?'selected':'')+'>'+esc(V.content.characters[id].name)+'</option>').join('')+'</select></label>').join('')+'</div><p id="duo-choice-note">Cada pessoa ocupa metade da tela, com seus próprios controles e pontuação.</p>';
  V.$('.modal-body').append(host);
  const display=()=>V.$('#duo-character-choice').hidden=V.$('input[name="challenge-players"]:checked').value!=='2';display();V.$$('input[name="challenge-players"]').forEach(r=>r.addEventListener('change',display));
  const single=button.onclick;button.onclick=e=>{
   const count=+V.$('input[name="challenge-players"]:checked').value,players=V.$$('[data-duo-character]').map(s=>s.value);
   if(count===2&&players[0]===players[1]){V.$('#duo-choice-note').textContent='Escolha um personagem diferente para cada jogador.';return;}
   V.settings.challengePlayers=count;V.settings.playerCharacters=players;if(count===2)V.state.playerCharacters=players;else if(V.state.playerCharacters?.length!==2)V.state.playerCharacters=[players[0]];V.Save.applySettings();V.Save.save();
   if(count===1)return single?.(e);
   this.launch(key,{mode:V.$('input[name="challenge-mode"]:checked')?.value||'normal',stage:+(V.$('#challenge-level')?.value||0),difficulty:+(V.$('#challenge-difficulty')?.value||1)});
  };
 },
 launch(key,options={}){
  const g=V.ChallengeCatalog.item(key);if(!g||!V.state||isChild)return false;
  V.Save.save();V.UI.close();V.Input.clear();
  const previous=V.state.duoChallenge,players=this.players();
  const resume=previous?.key===key&&!previous.closed&&previous.players.join()===players.join()&&(options.mode==='resume'||previous.options.mode===options.mode&&previous.options.stage===options.stage);
  this.session=resume?previous:{id:'duo-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),key,options,players,snapshots:[null,null],closed:false};
  V.state.duoChallenge=this.session;this.active=true;this.paused=[false,false];this.ready=[false,false];V.$('#app').inert=true;
  const root=document.createElement('section');root.id='duo-root';root.setAttribute('aria-label','Desafio em dupla · duas telas');
  root.innerHTML='<header class="duo-header"><strong>DUAS PESSOAS · '+esc(g.title)+'</strong><div class="row"><button id="duo-pause" class="secondary">Pausar os dois · Esc</button><button id="duo-exit" class="secondary">Guardar e sair</button></div></header><div class="duo-views">'+players.map((id,i)=>'<section class="duo-view" aria-label="Tela do jogador '+(i+1)+'"><header class="duo-player-head"><div><strong>J'+(i+1)+' · '+esc(V.content.characters[id].name)+'</strong><br><small>'+(i?'SETAS · ENTER · SHIFT DIREITO':'WASD · ESPAÇO · E')+'</small></div><span class="duo-score" id="duo-score-'+i+'">Preparando…</span></header><nav class="duo-sidebar" aria-label="Menu do jogador '+(i+1)+'"><button data-duo-info="'+i+'" title="Personagem e controles" aria-label="Controles do jogador '+(i+1)+'"><img src="assets/characters/'+id+'-portrait.png" alt="'+esc(V.content.characters[id].name)+'"></button><button data-duo-hint="'+i+'" title="Dica" aria-label="Dica para jogador '+(i+1)+'">?</button><button data-duo-translation="'+i+'" aria-pressed="true" title="Tradução" aria-label="Alternar tradução do jogador '+(i+1)+'">PT</button><button data-duo-pause="'+i+'" title="Pausar esta tela" aria-label="Pausar jogador '+(i+1)+'">Ⅱ</button><button data-duo-retry="'+i+'" title="Recomeçar este desafio" aria-label="Recomeçar jogador '+(i+1)+'">↻</button></nav><iframe class="duo-frame" title="Desafio · jogador '+(i+1)+'" data-duo-frame="'+i+'" allow="autoplay"></iframe><div class="duo-loading" id="duo-loading-'+i+'"><strong>Preparando '+esc(V.content.characters[id].name)+'…</strong><p>As imagens são carregadas conforme o desafio precisa.</p></div><aside class="duo-key-help" id="duo-help-'+i+'"><strong>Jogador '+(i+1)+'</strong><p>'+esc(this.controls(g.id,i))+'</p><p>Nos tabuleiros: direções selecionam; a ação escolhe; interagir confirma. Os botões na tela também funcionam.</p><button data-duo-help-close="'+i+'" class="primary">Entendi · jogar</button></aside><div class="duo-session-paused" id="duo-paused-'+i+'" hidden><strong>Tela pausada</strong><button data-duo-unpause="'+i+'" class="primary">Continuar jogador '+(i+1)+'</button></div></section>').join('')+'</div>';
  document.body.append(root);this.frames=V.$$('[data-duo-frame]');
  V.$$('[data-duo-info] img').forEach(img=>{const i=+img.closest('[data-duo-info]').dataset.duoInfo,canvas=document.createElement('canvas');canvas.width=36;canvas.height=36;canvas.setAttribute('aria-label',V.content.characters[players[i]].name);const portrait=V.Assets.images[players[i]+'-portrait'];if(portrait){const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(portrait,0,0,96,96,0,0,36,36);}img.replaceWith(canvas);});
  this.frames.forEach((frame,i)=>{const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('voices-duo',this.session.id);url.searchParams.set('player',String(i));frame.src=url.href;});
  V.$('#duo-exit').onclick=()=>this.exit();V.$('#duo-pause').onclick=()=>this.pauseAll();
  V.$$('[data-duo-info]').forEach(b=>b.onclick=()=>{const help=V.$('#duo-help-'+b.dataset.duoInfo);help.hidden=!help.hidden;});
  V.$$('[data-duo-help-close]').forEach(b=>b.onclick=()=>{V.$('#duo-help-'+b.dataset.duoHelpClose).hidden=true;this.frames[+b.dataset.duoHelpClose]?.focus();});
  V.$$('[data-duo-hint]').forEach(b=>b.onclick=()=>this.send(+b.dataset.duoHint,{type:'command',command:'hint'}));
  V.$$('[data-duo-translation]').forEach(b=>b.onclick=()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));this.send(+b.dataset.duoTranslation,{type:'command',command:'translation',value:on});});
  V.$$('[data-duo-pause],[data-duo-unpause]').forEach(b=>b.onclick=()=>{const i=+(b.dataset.duoPause??b.dataset.duoUnpause);this.pause(i,!this.paused[i]);});
  V.$$('[data-duo-retry]').forEach(b=>b.onclick=()=>this.send(+b.dataset.duoRetry,{type:'command',command:'restart'}));
  V.Save.save();return true;
 },
 send(i,message){this.frames[i]?.contentWindow?.postMessage({voicesDuo:this.session?.id,...message},'*');},
 pause(i,value){this.paused[i]=value;V.$('#duo-paused-'+i).hidden=!value;this.send(i,{type:'command',command:'pause',value});const b=V.$('[data-duo-pause="'+i+'"]');b?.setAttribute('aria-pressed',String(value));},
 pauseAll(){const value=!this.paused.every(Boolean);[0,1].forEach(i=>this.pause(i,value));},
 physical(code,down,repeat=false){
  if(!this.active)return false;if(code==='Escape'){if(down&&!repeat)this.pauseAll();return true;}
  const player=/^(Arrow|Numpad)/.test(code)||['Enter','ShiftRight','ControlRight','Slash','Period'].includes(code)?1:/^(Key[WASDEFQR]|Space|Digit[123])$/.test(code)?0:-1;
  if(player<0)return false;this.send(player,{type:'input',code,down,repeat});return true;
 },
 receive(e){
  const m=e.data;if(!this.active||!m||m.voicesDuo!==this.session?.id)return;
  const index=this.frames.findIndex(f=>f.contentWindow===e.source);if(index<0)return;
  if(m.type==='ready'){
   this.ready[index]=true;const state=copy(this.session.snapshots[index]?.state||V.state);delete state.duoChallenge;delete state.profileId;
   state.playerCharacters=[this.session.players[index]];state.character=this.session.players[index];state.name=V.content.characters[state.character].name;state.flags={...state.flags,prologueDone:true,prologueStarted:true};
   this.send(index,{type:'boot',state,key:this.session.key,options:this.session.options,resume:!!this.session.snapshots[index],settings:{...V.settings,muted:V.settings.muted||index===1,challengePlayers:1,playerCharacters:[state.character]},checkpoint:this.session.snapshots[index]?.checkpoint});
  }else if(m.type==='started'){V.$('#duo-loading-'+index).hidden=true;}
  else if(m.type==='error'){const loading=V.$('#duo-loading-'+index);loading.hidden=false;loading.textContent='Não foi possível preparar esta tela: '+String(m.message||'tente reabrir o desafio.');}
  else if(m.type==='physical'){this.physical(m.code,m.down,m.repeat);}
  else if(m.type==='snapshot'&&m.state){
   this.session.snapshots[index]={state:m.state,checkpoint:m.checkpoint};
   if(this.session.snapshots.every(s=>s?.checkpoint?.finished))this.session.closed=true;
   if(V.state){for(const word of m.state.words||[])if(!V.state.words.includes(word))V.state.words.push(word);V.Save.save();}
   const score=V.$('#duo-score-'+index);if(score)score.textContent=(m.score||0)+' pts'+(m.finished?' · ✓':'');
   if(this.exitWaiting){this.exitWaiting.delete(index);if(!this.exitWaiting.size)this.finishExit();}
  }else if(m.type==='reward'&&Number.isFinite(m.amount)&&m.amount>0){
   if(m.kind==='coins')V.Life.award(this.session.id+'-j'+index+'-'+m.key,m.amount);
   else if(m.kind==='xp')V.Progress.reward(this.session.id+'-j'+index+'-'+m.key,m.amount);
  }else if(m.type==='exit'){this.pause(index,true);V.$('#duo-score-'+index).textContent='Concluído · ✓';}
 },
 exit(){
  if(!this.active||this.exitWaiting)return;const b=V.$('#duo-exit');if(b){b.disabled=true;b.textContent='Guardando…';}this.exitWaiting=new Set([0,1]);this.exitTimer=setTimeout(()=>this.finishExit(),1800);this.frames.forEach((_,i)=>this.send(i,{type:'command',command:'save'}));
 },
 finishExit(){
  if(!this.active)return;clearTimeout(this.exitTimer);this.exitWaiting=null;this.active=false;V.$('#app').inert=false;this.frames.forEach(f=>f.src='about:blank');this.frames=[];V.$('#duo-root')?.remove();V.Input.clear();V.Save.save();V.Game.updateHUD();V.ChallengeCatalog.open();
 }
};

const newState=V.Game.newState.bind(V.Game);V.Game.newState=function(...args){const out=newState(...args);if(V.state)V.state.playerCharacters=(V.settings.playerCharacters||[V.state.character]).slice(0,2);return out;};

if(!isChild){
 const paintProfiles=V.PlayerProfiles.paint.bind(V.PlayerProfiles);V.PlayerProfiles.paint=function(...args){const out=paintProfiles(...args);for(const b of V.$$('[data-profile-enter]')){const profile=this.items.find(p=>p.id===b.dataset.profileEnter);if(profile?.playerCharacters?.length>1){const label=b.closest('.profile-card').querySelector('p');if(label)label.textContent=profile.playerCharacters.map(id=>V.content.characters[id]?.name||id).join(' + ')+' · dupla · nível '+(profile.level||1);}}return out;};
 const detail=V.ChallengeCatalog.detail.bind(V.ChallengeCatalog);V.ChallengeCatalog.detail=function(key,...args){const out=detail(key,...args);D.choice(key);return out;};
 const fishOpen=V.FishingChallenge.open.bind(V.FishingChallenge);V.FishingChallenge.open=function(...args){const out=fishOpen(...args);const host=V.$('.modal-body');if(host&&!V.$('#duo-fishing')){const section=document.createElement('section');section.className='duo-choice';section.innerHTML='<strong>Pescaria em dupla · duas telas</strong><div class="row"><label class="field">Onde pescar<select id="duo-fishing-habitat"><option value="cape">Costa do Cabo · África do Sul</option><option value="volta">Lago Volta · Gana</option></select></label><button id="duo-fishing" class="secondary">Jogar em dupla</button></div>';host.prepend(section);V.$('#duo-fishing').onclick=()=>D.launch('fish:fishing',{habitat:V.$('#duo-fishing-habitat').value});}return out;};
 const update=V.Game.update.bind(V.Game);V.Hooks.around(V.Game, 'update', 'duo-challenges:update:1', nextHook => function(dt){if(!D.active)return nextHook(dt);});
 document.addEventListener('keydown',e=>{if(!D.active||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(D.physical(e.code,true,e.repeat)){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('keyup',e=>{if(D.physical(e.code,false)){e.preventDefault();e.stopImmediatePropagation();}},true);
 window.addEventListener('message',e=>D.receive(e));
 window.addEventListener('blur',()=>{if(D.active&&!document.activeElement?.matches('.duo-frame'))D.frames.forEach((_,i)=>D.send(i,{type:'command',command:'clear'}));});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&D.active)[0,1].forEach(i=>D.pause(i,true));});
 return;
}

document.body.classList.add('duo-child');
function resizeViewer(){const stage=V.$('#stage'),box=stage?.getBoundingClientRect(),canvas=V.$('#world-canvas');if(!box?.width||!box.height||!canvas)return;const width=Math.max(240,Math.round(box.width)),height=Math.max(240,Math.round(box.height));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;canvas.getContext('2d').imageSmoothingEnabled=false;}}
window.addEventListener('resize',resizeViewer);new ResizeObserver(resizeViewer).observe(V.$('#stage'));
const layout=V.Playground.layout.bind(V.Playground);V.Playground.layout=function(){let focus={'terra-mar':[145,142,670,382],'fogo-montanha':[170,171,620,355],matacuzana:[260,180,575,350],'roda-jo':[160,205,640,330],ampe:[278,160,635,365]}[this.active?.game];const player=this.active?.data?.player;if(['courier','garden'].includes(this.active?.game)&&player){const x=80+player.x*66,y=120+player.y*58;focus=[V.clamp(x-310,20,320),V.clamp(y-180,80,180),620,360];}if(!focus)return layout();const area=this.sceneBounds(),[x,y,w,h]=focus,scale=Math.max(.01,Math.min((area.w-12)/w,(area.h-12)/h));return{scale,x:area.x+(area.w-w*scale)/2-x*scale,y:area.y+(area.h-h*scale)/2-y*scale};};
const token=params.get('voices-duo'),index=+params.get('player'),memory={};let booted=false,localPause=false,lastSnapshot=0,started=false,clocked=false,randomSeed=null;
function resetRandom(){if(randomSeed===null)return;let n=randomSeed>>>0;Math.random=()=>{n+=0x6D2B79F5;let x=n;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296;};}
// A viewer only receives its owner's keys, including during the running lesson.
const runningGuide=V.PlaygroundData.guides.runner;
runningGuide[0].text='Seu personagem avança automaticamente. Escolha a faixa para pegar palavras ao atravessar os portais.';
runningGuide[0].instruction='Mude para a faixa da esquerda com '+(index?'←':'A')+' ou o botão da esquerda.';
runningGuide[1].instruction='Volte para a faixa do meio com '+(index?'→':'D')+' ou o botão da direita.';
runningGuide[2].instruction='Use '+(index?'→':'D')+' ou o botão da direita e atravesse book.';
const post=m=>window.parent.postMessage({voicesDuo:token,...m},'*');
// A child never writes localStorage or IndexedDB, even during initial boot.
V.Save.read=(key,fallback)=>copy(memory[key]??fallback);V.Save.write=(key,value)=>{memory[key]=copy(value);return true;};V.Save.remove=key=>delete memory[key];
V.PlayerProfiles.init=async()=>{V.PlayerProfiles.items=[];return[];};V.PlayerProfiles.title=()=>{};
const snapshot=()=>{
 if(!booted||!V.state)return;const state=copy(V.state);delete state.duoChallenge;
 const r=V.Playground.active,fish=V.FishingChallenge.run;
 const culture=V.CultureChallenges.run?.(),finished=!!r?.finished||!!culture?.finished;
 post({type:'snapshot',state,checkpoint:{runKey:r?.key,training:!!r?.training,fish:fish?copy(fish):null,finished},score:r?.score||fish?.score||0,finished});lastSnapshot=Date.now();
};
const childSave=V.Save.save.bind(V.Save);V.Save.save=function(...args){const out=childSave(...args);if(booted&&Date.now()-lastSnapshot>2200)snapshot();return out;};
const award=V.Life.award.bind(V.Life);V.Life.award=function(key,amount,...args){const out=award(key,amount,...args);if(started&&out)post({type:'reward',kind:'coins',key,amount});return out;};
const reward=V.Progress.reward.bind(V.Progress);V.Progress.reward=function(key,amount,...args){const out=reward(key,amount,...args);if(started&&out!==false)post({type:'reward',kind:'xp',key,amount});return out;};
let launchKey,launchOptions,settings;
async function launch(resume=false,checkpoint=null){
 const g=V.ChallengeCatalog.item(launchKey);if(!g)return;
 resetRandom();
 V.UI.onClose=null;V.UI.close();V.Dialogue.active=false;V.$('#dialogue-root').innerHTML='';V.Onboarding.active=false;V.Onboarding.suspended=true;V.Tutorials.active=null;V.GuideOverlay.hide();
 if(V.Playground.active)V.Playground.detach();V.FishingChallenge.cancel();
 V.Playground.selectDifficulty(launchOptions.difficulty??1);
 if(g.kind==='play'){
  const p=V.Playground,run=resume&&checkpoint?.runKey&&p.ensure().runs[checkpoint.runKey];
  if(launchOptions.mode==='training')p.train(g.id,{restart:!resume});
  else if(run&&!run.returned)p.attach(run);
  else{p.ensure().guides[g.id]={status:'complete'};if(['free','circuit'].includes(launchOptions.mode))V.ArcadeExpansion.launch(g.id,launchOptions.mode==='free',launchOptions.stage||0);else p.launch(g.id,null,{kind:'stage',id:g.id+'-'+(launchOptions.stage||0),stage:launchOptions.stage||0});}
 }else if(g.kind==='culture'){V.CultureChallenges.start(g.id);}
 else if(g.kind==='legacy'){V.LearningArcade.start(g.id);}
 else if(g.kind==='fish'){
  V.FishingChallenge.start(launchOptions.habitat||'cape');
  if(resume&&checkpoint?.fish){V.FishingChallenge.run=copy(checkpoint.fish);V.FishingChallenge.bound=V.state;V.FishingChallenge.panel();}
 }
 started=true;booted=true;await V.MapAssets.whenReady();post({type:'started'});snapshot();
}
const init=V.Game.init.bind(V.Game);V.Game.init=async function(...args){try{await init(...args);resizeViewer();post({type:'ready'});}catch(e){post({type:'error',message:e.message});throw e;}};
// Moving focus between viewers must not open the original lost-focus pause dialog.
V.Game.pause=function(){clearLocalInput();};
const update=V.Game.update.bind(V.Game);V.Hooks.around(V.Game, 'update', 'duo-challenges:update:2', nextHook => function(dt){if(!clocked&&!localPause)return nextHook(dt);});
const toTitle=V.Game.toTitle.bind(V.Game);V.Game.toTitle=function(...args){if(booted){snapshot();post({type:'exit'});return;}return toTitle(...args);};
V.ChallengeCatalog.open=()=>{snapshot();post({type:'exit'});};
function canonical(code){
 const game=V.ChallengeCatalog.item(launchKey)?.id;
 if(game==='rhythm'){const rhythm=index?{ArrowLeft:'d',ArrowDown:'f',ArrowUp:'j',ArrowRight:'k'}:{KeyA:'d',KeyS:'f',KeyW:'j',KeyD:'k'};if(rhythm[code])return rhythm[code];}
 const common={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ArrowUp:'w',ArrowLeft:'a',ArrowDown:'s',ArrowRight:'d',Space:' ',Enter:' ',Numpad0:' ',KeyE:'e',ControlRight:'e',ShiftRight:game==='platform'?'j':game==='fishing'?'x':'e',KeyF:game==='platform'?'j':game==='fishing'?'x':'f',KeyQ:game==='platform'?'k':game==='moto'?'b':'q',Slash:game==='platform'?'k':game==='moto'?'b':'q',KeyR:'q',Period:'q',Digit1:'1',Digit2:'2',Digit3:'3',Numpad1:['moto','radio'].includes(game)?'1':'e',Numpad2:'2',Numpad3:'3'};
 if(code==='KeyX'&&game==='fishing')return 'x';
 return common[code];
}
function boardInput(key,down){
 if(!down)return;const buttons=[...document.querySelectorAll('.modal-body button,.modal-footer button')].filter(b=>!b.disabled&&b.getClientRects().length&&!b.hidden);
 if(!buttons.length)return;
 if(['w','a','s','d'].includes(key)){
  const current=buttons.includes(document.activeElement)?document.activeElement:buttons[0],box=current.getBoundingClientRect(),cx=box.left+box.width/2,cy=box.top+box.height/2,dx=key==='d'?1:key==='a'?-1:0,dy=key==='s'?1:key==='w'?-1:0;
  const candidates=buttons.filter(b=>b!==current).map(b=>{const r=b.getBoundingClientRect(),x=r.left+r.width/2-cx,y=r.top+r.height/2-cy,forward=x*dx+y*dy;return{b,score:forward+Math.abs(x*dy-y*dx)*2,forward};}).filter(x=>x.forward>4).sort((a,b)=>a.score-b.score);
  (candidates[0]?.b||current).focus();
 }else if(key===' '){const active=buttons.includes(document.activeElement)?document.activeElement:buttons[0];active.click();}
 else if(key==='e'){
  const lesson=document.querySelector('#lesson-next:not(:disabled)'),main=document.querySelector('.modal .workshop-main:not(:disabled)'),next=document.querySelector('#culture-next:not(:disabled)'),footer=document.querySelector('.modal-footer .primary:not(:disabled)');
  (lesson||main||next||footer)?.click();
 }
}
const childHud=V.Playground.hud.bind(V.Playground);V.Playground.hud=function(...args){const out=childHud(...args);if(index===1)for(const button of V.$$('#pg-controls button'))if(!button.childElementCount)button.textContent=button.textContent.replace(/\bespaço\b/gi,'Enter').replace(/ · A\b/g,' · ←').replace(/ · D\b/g,' · →').replace(/ · W\b/g,' · ↑').replace(/ · S\b/g,' · ↓').replace(/ · E\b/g,' · Shift direito');return out;};
const fishingHud=V.FishingChallenge.hud.bind(V.FishingChallenge);V.FishingChallenge.hud=function(...args){
 const out=fishingHud(...args),action=V.$('#fish-game-action'),loosen=V.$('#fish-game-loosen'),help=V.$('.fish-game-tools>.sea-small'),pause=V.$('#fish-game-pause');
 if(index===1&&action)action.textContent=action.textContent.replace(/Espaço/gi,'Enter');
 if(loosen)loosen.textContent='Afrouxar · '+(index?'Shift direito':'X');
 if(help)help.textContent=D.controls('fishing',index);
 if(pause)pause.textContent=pause.textContent.replace(' · P','');
 return out;
};
function input(message){
 if(!booted||localPause||V.MapAssets.busy)return;const key=canonical(message.code);if(!key)return;
 if(message.down){if(!message.repeat)V.Input.pressed.add(key);V.Input.keys.add(key);}else{V.Input.keys.delete(key);const r=V.Playground.active;if(r)V.Playground.controllers[r.game]?.keyUp?.(r,key);}
 if(V.modal){if(V.FishingChallenge.run)V.Game.onKey(key,{preventDefault(){},repeat:message.repeat});else if(!message.repeat)boardInput(key,message.down);return;}
 if(message.down)V.Game.onKey(key,{preventDefault(){},repeat:message.repeat});
}
function clearLocalInput(){V.Input.clear();const r=V.Playground.active;if(r)V.Playground.controllers[r.game]?.cancelInput?.(r);}
window.addEventListener('message',async e=>{
 const m=e.data;if(e.source!==window.parent||m?.voicesDuo!==token)return;
 if(m.type==='boot'&&!booted){
  clocked=!!m.clocked;localPause=!!m.hold;randomSeed=Number.isFinite(m.seed)?m.seed:null;
  settings=m.settings;memory.settings=copy(settings);V.settings={...V.defaultSettings,...settings};V.Save.applySettings();launchKey=m.key;launchOptions=m.options||{};
  const game=V.ChallengeCatalog.item(launchKey);if(game?.kind==='play')V.Playground.game(game.id).keys=D.controls(game.id,index);
  const state=copy(m.state);if(state.playground)state.playground.current=null;V.state=state;V.Game.startGame();await V.MapAssets.whenReady();await launch(m.resume,m.checkpoint);
 }else if(m.type==='start'){localPause=false;if(Number.isFinite(m.time))V.Engine.time=m.time;}
 else if(m.type==='tick'&&clocked&&booted&&!localPause&&Number.isFinite(m.dt)&&m.dt>=0&&m.dt<=.1){if(Number.isFinite(m.time))V.Engine.time=m.time;update(m.dt);}
 else if(m.type==='input')input(m);
 else if(m.type==='command'){
  if(m.command==='clear'){clearLocalInput();return;}
  if(m.command==='save'){V.Save.save();snapshot();return;}
  if(m.command==='pause'){localPause=m.value;clearLocalInput();snapshot();return;}
  if(m.command==='translation'){V.settings.translation=m.value;if(V.Playground.active)V.Playground.active.translations=m.value;V.Playground.hud();V.Dialogue.translate();return;}
  if(m.command==='hint'){const r=V.Playground.active;if(r){r.hints++;V.Playground.controllers[r.game].hint?.(r);V.Playground.hud();}else V.$('#oware-hint')?.click();return;}
  if(m.command==='restart'){
   const g=V.ChallengeCatalog.item(launchKey);if(g.kind==='play'){for(const r of Object.values(V.Playground.ensure().runs))if(r.game===g.id)r.returned=true;const key=V.Playground.active?.key;if(key)delete V.Playground.ensure().runs[key];}
   if(g.kind==='culture')delete V.CultureChallenges.ensure().runs[g.id];localPause=clocked;await launch(false);
  }
 }
});
for(const type of ['keydown','keyup'])document.addEventListener(type,e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(['Tab'].includes(e.code))return;const ownPrimary=index===0?e.code==='Space':['Enter','Numpad0'].includes(e.code);if(ownPrimary&&e.target.closest?.('#guided-overlay button')){e.preventDefault();e.stopImmediatePropagation();if(type==='keydown'&&!e.repeat)e.target.click();return;}if(canonical(e.code)||e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();post({type:'physical',code:e.code,down:type==='keydown',repeat:e.repeat});}},true);
window.addEventListener('blur',()=>clearLocalInput());
window.addEventListener('beforeunload',snapshot);
})();

});
