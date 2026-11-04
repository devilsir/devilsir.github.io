/* Shared story, independent places, positions and cameras. */
(function(){
'use strict';
const V=window.V;
if(V.DuoChallenges?.isChild)return;
const W=V.World,P=V.Player,copy=value=>JSON.parse(JSON.stringify(value));
const D=V.DuoWorld={owner:null,actors:[],context:-1,loading:false,starting:false,visible:false,root:null,
 characters(){const selected=V.state?.playerCharacters||V.settings?.playerCharacters||[];return selected.filter(id=>['nia','leo','taina','sol'].includes(id)).slice(0,2);},
 enabled(){return !!V.state&&this.characters().length===2&&!V.ProfessorStudio?.freePlay;},
 exploring(){return this.enabled()&&V.Game.screen==='game'&&V.Game.mode==='explore'&&!V.SceneEditor?.active&&!V.DuoChallenges?.active;},
 usable(point){return point&&Number.isFinite(point.x)&&Number.isFinite(point.y);},
 safe(point,other=null,m=W.current){
  if(!m)return point;
  for(const [dx,dy]of [[0,0],[48,0],[-48,0],[0,48],[0,-48],[48,48],[-48,48],[0,96]]){
   const x=point.x+dx,y=point.y+dy;
   if(!V.Living.blocked(m,x,y,11)&&(!other||Math.hypot(x-other.x,y-other.y)>28)&&!m.objects.some(o=>V.Cozy.person(o)&&Math.hypot(o.x-x,o.y-y)<26))return{x,y};
  }
  return V.Rooms.safe(m,point,11)||{x:point.x,y:point.y};
 },
 enterMap(restore=false){
  if(!this.enabled()||!P.data||!W.current)return;
  const characters=this.characters(),record=restore&&V.state.duoWorld,saved=record?.players;
  const source=P.data,first=this.usable(saved?.[0])?this.safe(saved[0]):{x:source.x,y:source.y};
  const second=this.usable(saved?.[1])?saved[1]:this.safe({x:first.x+48,y:first.y},first);
  this.owner=V.state;
  this.actors=characters.map((character,i)=>{const map=W.maps[saved?.[i]?.map||record?.map]?.id||W.current.id,m=W.maps[map],point=this.safe(i?second:first,null,m);return{character,map,data:{...copy(source),...point,dir:saved?.[i]?.dir??source.dir,moving:false,frame:0},camera:{...W.camera},walkTime:0,moved:0,nearest:null,transition:0,spatial:new Map()};});
  P.data=this.actors[0].data;W.current=W.maps[this.actors[0].map];W.camera=this.actors[0].camera;V.state.map=W.current.id;if(this.context<0)V.state.character=characters[0];
  this.mount();this.resize();this.center();this.prepareAssets();for(let i=0;i<2;i++)this.withActor(i,()=>V.MapAssets.schedule(W.current));
 },
 prepareAssets(){const groups=this.characters().map(id=>'actor:'+id),missing=V.MapAssets.rows(groups).some(r=>r.state!=='loaded');if(missing)V.MapAssets.ensure(groups,'Preparando os dois personagens');},
 center(){for(let i=0;i<this.actors.length;i++)this.withActor(i,()=>Object.assign(W.camera,V.Viewport.target(W.current,P.data)));},
 withActor(index,fn,{camera=true,viewport=true}={}){
  const actor=this.actors[index];if(!actor)return;
  if(this.context===index)return fn();
  const previous={data:P.data,character:V.state.character,camera:W.camera,walkTime:P.walkTime,moved:P.moved,context:this.context,canvas:V.Engine.canvas,ctx:V.Engine.ctx,width:V.Viewport.width,height:V.Viewport.height,nearest:W.nearest,seated:V.Cozy.seated,map:W.current};
  this.context=index;P.data=actor.data;P.walkTime=actor.walkTime;P.moved=actor.moved;V.state.character=actor.character;V.state.map=actor.map;W.current=W.maps[actor.map]||previous.map;const restoreSpatial=this.spatial(actor);V.Cozy.seated=actor.seat||null;W.transition=actor.transition||0;
  if(camera){W.camera=actor.camera;W.nearest=actor.nearest;}
  const canvas=this.root?.querySelector('[data-world-canvas="'+index+'"]');
  if(viewport&&canvas){V.Engine.canvas=canvas;V.Engine.ctx=canvas.getContext('2d');V.Viewport.width=canvas.width;V.Viewport.height=canvas.height;}
  try{return fn();}finally{
   if(this.actors[index]===actor){actor.data=P.data;actor.map=W.current.id;actor.walkTime=P.walkTime;actor.moved=P.moved;actor.seat=V.Cozy.seated;actor.transition=W.transition;if(camera){actor.camera=W.camera;actor.nearest=W.nearest;}}restoreSpatial();
   this.context=previous.context;const back=this.actors[previous.context>=0?previous.context:0];if(back&&V.state){P.data=back.data;P.walkTime=back.walkTime;P.moved=back.moved;V.state.character=back.character;V.state.map=back.map;W.current=W.maps[back.map];W.camera=previous.context===0||previous.context===1?previous.camera:back.camera;W.nearest=back.nearest;W.transition=back.transition||0;V.Cozy.seated=back.seat||null;}else{P.data=previous.data;W.current=previous.map;W.camera=previous.camera;}V.Engine.canvas=previous.canvas;V.Engine.ctx=previous.ctx;V.Viewport.width=previous.width;V.Viewport.height=previous.height;
  }
 },
 spatial(actor){const specs=[[V.Rooms,['cooldown','lastDoor','slideFrame','slideTime']],[V.ObjectiveGuide,['path','signature','timer','target','reason']],[V.Activities,['swimming','fishing']],[V.SeaNavigation,['boat','bound','course','waypoint','hudClock','notice','landingCache','touchAction']],[V.Companions,['position']],[V.Story,['companion']],[V.Environment,['ambientBlend']]],restores=[];actor.spatial||=new Map();for(const[obj,keys]of specs){if(!obj)continue;let own=actor.spatial.get(obj);if(!own){own={};for(const k of keys)own[k]=k==='path'?[]:k==='signature'||k==='reason'?'':k==='ambientBlend'?(V.Environment.profile(W.current).indoor?1:0):['timer','cooldown','slideTime','hudClock','notice'].includes(k)?0:null;actor.spatial.set(obj,own);}const before={};for(const k of keys){before[k]=obj[k];obj[k]=own[k];}restores.push(()=>{for(const k of keys){own[k]=obj[k];obj[k]=before[k];}});}return()=>restores.reverse().forEach(fn=>fn());},
 mount(){
  if(!this.enabled())return;
  if(this.root?.isConnected){this.labels();return;}
  const menus=[['interact','voice','Interagir'],['historio','historio','Historiógrafo'],['inventory','inventory','Mochila'],['journal','journal','Diário'],['notebook','notebook','Caderno'],['map','map','Atlas'],['home','homes','Casa'],['challenges','challenges','Desafios'],['pix','pix','PIX'],['archive','archive','Arquivo'],['help','book','Tutorial individual'],['pause','pause','Pausar']];
  const root=document.createElement('section');root.id='duo-world-root';root.hidden=true;root.setAttribute('aria-label','Exploração em dupla · duas telas');
  root.innerHTML=this.characters().map((id,i)=>`<section class="duo-world-view" aria-label="Tela do jogador ${i+1}"><header class="duo-world-head"><div><strong data-world-name="${i}">J${i+1} · ${V.escape(V.content.characters[id].name)}</strong><small>${i?'↑ ← ↓ → · Enter interage':'W A S D · E interage'}</small></div><span data-world-location="${i}"></span></header><nav class="duo-world-menu" aria-label="Menu do jogador ${i+1}"><button data-world-menu="character" data-world-player="${i}" title="Personagem" aria-label="Personagem do jogador ${i+1}"><canvas width="36" height="36" data-world-portrait="${i}"></canvas></button>${menus.map(([key,icon,label])=>`<button data-world-menu="${key}" data-world-player="${i}" title="${label}${key==='interact'?(i?' · Enter':' · E'):''}" aria-label="${label} · jogador ${i+1}">${V.Interface.icon(icon)}</button>`).join('')}</nav><div class="duo-world-scene"><canvas data-world-canvas="${i}" width="640" height="720" tabindex="0" aria-label="Mundo do jogador ${i+1}. ${i?'Mova com as setas e interaja com Enter.':'Mova com WASD e interaja com E.'}"></canvas><p class="duo-world-hint" data-world-hint="${i}"></p></div></section>`).join('');
  V.$('#stage').append(root);this.root=root;
  root.querySelectorAll('[data-world-menu]').forEach(button=>button.onclick=()=>this.menu(+button.dataset.worldPlayer,button.dataset.worldMenu));
  root.querySelectorAll('[data-world-canvas]').forEach(canvas=>canvas.addEventListener('pointerdown',e=>{canvas.focus();if(V.modal||V.Dialogue.active)return;const i=+canvas.dataset.worldCanvas,b=canvas.getBoundingClientRect(),point={x:(e.clientX-b.left)*canvas.width/b.width,y:(e.clientY-b.top)*canvas.height/b.height},actor=this.actors[i];const near=this.withActor(i,()=>W.interactables().filter(o=>V.dist(o,P.data)<(o.interactionRange||82)).map(o=>({o,d:Math.hypot(point.x-(o.x-actor.camera.x),point.y-(o.y-actor.camera.y-24))})).sort((a,b)=>a.d-b.d)[0]);if(near?.d<64)this.use(i,near.o);}));
  this.observer?.disconnect();this.observer=new ResizeObserver(()=>{this.resize();this.center();});this.observer.observe(root);this.labels();
 },
 labels(){
  if(!this.root)return;
  this.characters().forEach((id,i)=>{const name=this.root.querySelector('[data-world-name="'+i+'"]');if(name)name.textContent='J'+(i+1)+' · '+V.content.characters[id].name;const canvas=this.root.querySelector('[data-world-portrait="'+i+'"]'),im=V.Assets.images[id+'-portrait'];if(canvas&&im){const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,36,36);c.drawImage(im,0,0,96,96,0,0,36,36);}});
 },
 resize(){if(!this.root)return;for(const canvas of this.root.querySelectorAll('[data-world-canvas]')){const box=canvas.parentElement.getBoundingClientRect(),w=Math.max(240,Math.round(box.width||480)),h=Math.max(240,Math.round(box.height||540)),{width,height}=V.Performance?V.Performance.canvasSize(w,h,true):{width:w,height:h};if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;canvas.getContext('2d').imageSmoothingEnabled=false;}}},
 sync(){
  const characters=this.characters();if(this.enabled()&&V.Game.screen==='game'&&P.data&&W.current&&(this.owner!==V.state||this.actors.length!==2||this.actors.some((a,i)=>a.character!==characters[i])))this.enterMap(true);
  const visible=this.exploring();this.visible=visible;document.body.classList.toggle('duo-world-active',visible);if(this.root)this.root.hidden=!visible;
  if(!this.enabled()&&this.root)this.unmount();return visible;
 },
 unmount(){this.root?.remove();this.root=null;this.observer?.disconnect();this.visible=false;document.body.classList.remove('duo-world-active');},
 persist(){if(!this.enabled()||this.owner!==V.state||this.actors.length!==2)return;V.state.duoWorld={version:2,map:this.actors[0].map,players:this.actors.map(a=>({character:a.character,map:a.map,x:a.data.x,y:a.data.y,dir:a.data.dir}))};},
 use(index,object=null){
  if(!this.exploring()||V.modal||V.Dialogue.active||V.MapAssets.busy||V.DuoPanels?.has(index)||V.DuoSessions?.playing(index))return;
  this.withActor(index,()=>{const near=object||P.nearest();if(near){this.actors[index].nearest=near;W.nearest=near;V.Game.interact(near);}else V.UI.toast('Chegue perto de um objeto ou de uma pessoa para interagir.');});
 },
 menu(index,key){
  if(key==='interact')return this.use(index);
  const actions={character:()=>V.Progress.character(),historio:()=>V.Historio.panel(),inventory:()=>V.Quests.inventory(),journal:()=>V.Quests.journal(),notebook:()=>V.Living.journal('missions'),map:()=>V.Game.map(),home:()=>V.Homestead.panel(),challenges:()=>V.ChallengeCatalog.open(),pix:()=>V.Game.glossary(),archive:()=>V.Game.gallery(),help:()=>V.Onboarding.help(),pause:()=>V.Game.pause()};
  this.withActor(index,()=>actions[key]?.());
 },
 hud(){if(!this.root)return;const location=V.$('#location-name');if(location)location.textContent='Exploração em dupla · New Harmony';for(let i=0;i<2;i++){const actor=this.actors[i];if(!actor)continue;const near=this.withActor(i,()=>P.nearest());actor.nearest=near;const hint=this.root.querySelector('[data-world-hint="'+i+'"]');hint.textContent=near?(i?'Enter':'E')+' · '+near.label:'Explore com '+(i?'as setas':'WASD');this.root.querySelector('[data-world-location="'+i+'"]').textContent=W.maps[actor.map].name;const button=this.root.querySelector('[data-world-menu="interact"][data-world-player="'+i+'"]');button.disabled=!near;}},
 drawOther(c,index,cam){this.withActor(index,()=>P.render(c),{camera:false,viewport:false});},
 render(){
  if(V.MapAssets.busy)return;
  for(let i=0;i<2;i++)this.withActor(i,()=>{
   if(V.MapAssets.busy)return;const m=W.current;
   const canvas=this.root.querySelector('[data-world-canvas="'+i+'"]'),c=canvas.getContext('2d'),other=this.actors[1-i];
   const ghost={id:'duo-world-other',type:'duo-world-player',duoPlayer:1-i,x:other.data.x,y:other.data.y,character:other.character};
   const minimap=W.drawMiniMap;if(other.map===m.id)m.objects.push(ghost);W.drawMiniMap=()=>{};
   try{c.imageSmoothingEnabled=false;originalRender(c);}finally{const at=m.objects.indexOf(ghost);if(at>=0)m.objects.splice(at,1);W.drawMiniMap=minimap;}
  });
 }
};

const axis=V.Input.axis.bind(V.Input),tap=V.Input.tap.bind(V.Input);
V.Input.axis=function(){
 if(!D.exploring())return axis();
 if(V.DuoPanels?.has(D.context===1?1:0)||V.DuoPanels?.loading(D.context===1?1:0)||V.DuoSessions?.playing(D.context===1?1:0))return{x:0,y:0};
 if(V.DuoTutorial?.training(D.context===1?1:0))return{x:0,y:0};
 const second=D.context===1,keys=second?['arrowleft','arrowright','arrowup','arrowdown']:['a','d','w','s'];
 let x=(this.down(keys[1])?1:0)-(this.down(keys[0])?1:0),y=(this.down(keys[3])?1:0)-(this.down(keys[2])?1:0);
 if(!second){x+=this.touch.x+this.gamepad.x;y+=this.touch.y+this.gamepad.y;}const length=Math.hypot(x,y);return length>1?{x:x/length,y:y/length}:{x,y};
};
V.Input.tap=function(key){if(D.exploring()&&D.context!==1&&!V.Dialogue.active&&key.toLowerCase()==='enter')return false;return tap(key);};

const load=W.load.bind(W);W.load=function(...args){
 if(!D.enabled())return load(...args);
 if(!D.starting&&D.owner===V.state&&D.actors.length===2){if(D.context<0)return D.withActor(0,()=>W.load(...args));const actor=D.actors[D.context],before=D.loading;D.loading=true;try{return load(...args);}finally{actor.map=W.current.id;actor.data=P.data;actor.camera=W.camera;actor.nearest=null;actor.seat=V.Cozy.seated;actor.transition=W.transition;D.loading=before;if(!before){D.hud();V.Save.save();}}}
 D.loading=true;try{return load(...args);}finally{D.loading=false;D.enterMap(D.starting);}
};
const start=V.Game.startGame.bind(V.Game);V.Game.startGame=function(...args){D.starting=true;try{return start(...args);}finally{D.starting=false;if(D.enabled()){if(D.owner!==V.state)D.enterMap(true);D.sync();D.resize();D.center();D.hud();}}};
const save=V.Save.save.bind(V.Save);V.Save.save=function(...args){if(D.loading)return true;D.persist();if(D.enabled()&&D.owner===V.state&&D.actors.length===2)return D.withActor(0,()=>save(...args));return save(...args);};
const title=V.Game.toTitle.bind(V.Game);V.Game.toTitle=function(...args){D.persist();D.unmount();D.owner=null;D.actors=[];return title(...args);};

const update=V.Game.update.bind(V.Game),originalRender=V.Game.render.bind(V.Game);
V.Game.update=function(dt){
 const visible=D.sync();if(!visible)return update(dt);
 const canMove=!V.modal&&!V.Dialogue.active&&!V.MapAssets.busy;
 D.withActor(0,()=>update(dt));
 if(canMove&&D.exploring()&&!V.modal&&!V.Dialogue.active&&!V.MapAssets.busy){
  if(!V.DuoPanels?.has(1)&&!V.DuoSessions?.playing(1))D.withActor(1,()=>{if(V.MapAssets.busy)return;V.Rooms.cooldown=Math.max(0,(V.Rooms.cooldown||0)-dt);V.Rooms.slideTime=Math.max(0,(V.Rooms.slideTime||0)-dt);P.update(dt);if(D.actors[0].map!==D.actors[1].map||V.DuoPanels?.has(0))W.update(dt);else W.transition=Math.max(0,W.transition-dt*2);V.Rooms.auto(W.current,P.data);V.Activities?.crossings?.(dt);});
  if(tap('enter')||tap('shiftright'))D.use(1);
 }
 D.hud();D.persist();
};
V.Game.render=function(c){if(D.sync()){D.render();return;}return originalRender(c);};

// Arriving in an occupied place must preserve the visit already in progress.
const onLoad=V.Cozy.onLoad.bind(V.Cozy);V.Cozy.onLoad=function(...args){if(D.enabled()&&D.loading&&!D.starting&&D.actors.some((a,i)=>i!==D.context&&a.map===W.current.id)){this.seated=null;return;}return onLoad(...args);};
if(V.Companions){const clear=V.Companions.clearFollowers.bind(V.Companions);V.Companions.clearFollowers=function(){if(D.enabled()&&D.loading&&!D.starting){W.current.objects=W.current.objects.filter(o=>o.type!=='roots-companion');return;}return clear();};}

for(const owner of [V.Cozy,V.World,V.AfricanMuseum,V.AfricanCuration,V.PlayMuseum]){
 const method=owner===V.PlayMuseum?'draw':'drawObject';if(!owner?.[method])continue;const draw=owner[method].bind(owner);
 owner[method]=function(c,o,cam,...args){if(o?.type==='duo-world-player'){D.drawOther(c,o.duoPlayer,cam);return true;}return draw(c,o,cam,...args);};
}
document.addEventListener('keydown',e=>{
 if(V.DuoSessions?.handleKey(e,true)||V.DuoPanels?.handleKey(e,true)){e.preventDefault();e.stopImmediatePropagation();return;}
 if(V.DuoTutorial?.handleKey(e,true)){e.preventDefault();e.stopImmediatePropagation();return;}
 if(!D.visible||V.modal||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter','ShiftRight'].includes(e.code))return;
 e.preventDefault();e.stopImmediatePropagation();if(V.Dialogue.active){if(e.code==='Enter'&&!e.repeat)V.Dialogue.next();return;}
 const key=e.code==='ShiftRight'?'shiftright':e.key.toLowerCase();V.Input.keys.add(key);if(!e.repeat)V.Input.pressed.add(key);
},true);
document.addEventListener('keyup',e=>{if(V.DuoSessions?.handleKey(e,false)||V.DuoPanels?.handleKey(e,false)||V.DuoTutorial?.handleKey(e,false)){e.preventDefault();e.stopImmediatePropagation();return;}if(D.visible&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter','ShiftRight'].includes(e.code))V.Input.keys.delete(e.code==='ShiftRight'?'shiftright':e.key.toLowerCase());},true);
})();
