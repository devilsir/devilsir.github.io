(function specialPresences(){
'use strict';
const V=window.V,esc=V.escape;
const definitions=[
 ['alzira','#efdfab','Luz, memória e escuta'],
 ['bento','#e7ddc6','Sabedoria que atravessa gerações'],
 ['jacira','#e9bc55','Alegria e caminhos compartilhados'],
 ['miguel','#cba36f','Firmeza e orientação'],
 ['exu','#d45c5c','Comunicação e proteção dos caminhos'],
 ['rosa','#e582a0','Autonomia e acolhimento'],
 ['folha','#91c27b','Mata, memória e observação'],
 ['lucia','#b5dbe0','Escuta, leitura e acolhimento'],
 ['dandara','#e8d3a0','Memória, convivência e orientação'],
 ['raquel','#9ec487','Cultivo, folhas e cuidado'],
 ['elias','#b1c78e','Pesquisa, plantas e descobertas'],
 ['ogum','#78aebe','Ferro, técnica e coragem'],
 ['iemanja','#acdce8','Águas, acolhimento e cuidado'],
 ['xango','#dca27d','Justiça e responsabilidade'],
 ['iansa','#de9979','Ventos e transformação'],
 ['oxossi','#95c89d','Matas, fartura e conhecimento']
];
const actions={
 idle:{name:'Repousar',fps:4,loop:true},walk:{name:'Caminhar',fps:6,loop:true},
 ready:{name:'Prontidão',fps:5,loop:true},attack:{name:'Atacar',fps:6,loop:false},
 dance:{name:'Dançar',fps:7,loop:true},spin:{name:'Rodopiar',fps:7,loop:true},
 guard:{name:'Proteger',fps:6,loop:false},cast:{name:'Conjurar',fps:6,loop:false},
 heal:{name:'Acolher e curar',fps:6,loop:false}
};
const P=V.Presences={
 actions,definitions,playback:new WeakMap(),selected:'iemanja',action:'idle',playing:true,speed:1,started:0,pausedAt:0,
 id(id){return String(id||'').replace(/^(ancestral-|presence-)/,'');},
 person(id){return V.Ancestral.person(this.id(id));},
 has(id){return definitions.some(d=>d[0]===this.id(id));},
 rig(id){return V.PresenceFrames?.[this.id(id)];},
 image(id){return V.Assets.images['presence-'+this.id(id)];},
 previewLayout(ctx,id,size=68){
  const rig=this.rig(id);let left=1,right=1,top=1,bottom=1;
  for(const row of rig.rows)for(const p of row){
   const [a,b]=p.anchor,[l,t,r,bt]=p.bounds,s=p.scale||1;
   left=Math.max(left,(a-l)*s);right=Math.max(right,(r-a)*s);top=Math.max(top,(b-t)*s);bottom=Math.max(bottom,(bt-b)*s);
  }
  const scale=Math.min(size/rig.unitHeight,(ctx.canvas.width/2-8)/left,(ctx.canvas.width/2-8)/right,(ctx.canvas.height-16)/(top+bottom));
  return {x:ctx.canvas.width/2,y:(ctx.canvas.height+(top-bottom)*scale)/2,size:scale*rig.unitHeight};
 },
 previewSize(canvas){
  const world=V.Engine.canvas,gameRect=world?.getBoundingClientRect?.(),rect=canvas.getBoundingClientRect?.();
  const gameScale=gameRect?.width&&gameRect?.height?Math.min(gameRect.width/world.width,gameRect.height/world.height):1;
  const previewScale=rect?.width&&rect?.height?Math.min(rect.width/canvas.width,rect.height/canvas.height):1;
  return 68*gameScale/previewScale;
 },
 frame(id,action='idle',time=0,loop=actions[action]?.loop!==false){
  const rig=this.rig(id);if(!rig)return null;
  const row=rig.actions[action]??rig.actions.idle,frames=rig.rows[row];if(!frames?.length)return null;
  const tick=Math.floor(Math.max(0,Number(time)||0)*(actions[action]?.fps||4));
  const index=V.settings.reducedMotion?0:loop?tick%frames.length:Math.min(frames.length-1,tick);
  return {rig,pose:frames[index],row,index};
 },
 draw(ctx,id,action,x,y,size=135,time=V.Engine.time,flip=false,fit=false,loop=actions[action]?.loop!==false,layer=null){
  id=this.id(id);const f=this.frame(id,action,time,loop);if(!f)return false;
  const {rig,pose}=f,source=pose.image?V.Assets.images[pose.image]:this.image(id);if(!source)return false;
  const img=layer?(pose.image?V.GuardianPresence.mask(source):layer):source;
  if(!img)return false;
  const [sx,sy,sw,sh]=pose.source,[ax,ay]=pose.anchor;let scale=size/rig.unitHeight;
  if(fit){
   // Reserve space for every movement: changing actions must not resize the character.
   let left=1,right=1,top=1,bottom=1;
   for(const row of rig.rows)for(const p of row){
    const [a,b]=p.anchor,[l,t,r,bt]=p.bounds,s=p.scale||1;
    left=Math.max(left,(flip?r-a:a-l)*s);right=Math.max(right,(flip?a-l:r-a)*s);
    top=Math.max(top,(b-t)*s);bottom=Math.max(bottom,(bt-b)*s);
   }
   scale=Math.max(0,Math.min(scale,(x-6)/left,(ctx.canvas.width-x-6)/right,(y-6)/top,(ctx.canvas.height-y-6)/bottom));
  }
  // Preserve the original sampling ratio across differently sized source rectangles.
  scale*=pose.scale||1;
  const dw=sw*scale,dh=sh*scale,dx=-Math.round(ax*scale),dy=-Math.round(ay*scale);
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(y));if(flip)ctx.scale(-1,1);
  for(const [ex,ey,ew,eh] of pose.exclude||[]){
   ctx.beginPath();ctx.rect(dx,dy,dw,dh);
   ctx.rect(dx+ex*dw/sw,dy+ey*dh/sh,ew*dw/sw,eh*dh/sh);ctx.clip('evenodd');
  }
  ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);ctx.restore();return true;
 },
 portrait(ctx,id){
  const rig=this.rig(id),img=this.image(id);if(!rig||!img)return false;const b=rig.portrait;
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.save();ctx.imageSmoothingEnabled=false;
  const ratio=Math.min((ctx.canvas.width-8)/b[2],(ctx.canvas.height-8)/b[3]),w=b[2]*ratio,h=b[3]*ratio;
  ctx.drawImage(img,...b,(ctx.canvas.width-w)/2,ctx.canvas.height-h-4,w,h);ctx.restore();return true;
 },
 mark(id,action){
  id=this.id(id);const m=V.World.current;if(!m||!this.has(id)||!actions[action])return false;
  const o=m.objects.find(o=>o.type==='roots-companion'&&o.companionId===id)||m.objects.find(o=>o.ancestral===id)||m.objects.find(o=>o.faithRepresentation&&o.character===id);
  if(!o)return false;o.presenceAction=action;o.presenceStart=V.Engine.time;
  o.presenceUntil=V.Engine.time+(actions[action].loop?3.2:Math.max(.85,this.rig(id).columns/actions[action].fps));
  o.walking=false;return true;
 },
 perform(id,action){
  if(V.Game.mode!=='explore'||V.SceneEditor.active)return false;
  if(!this.mark(id,action)){V.UI.toast('Encontre esta presença no cenário ou escolha-a como companhia.');return false;}
  V.UI.close();V.Audio.sfx('observe');return true;
 },
 motion(o){
  const active=o.presenceUntil>V.Engine.time,action=active?o.presenceAction:o.walking?'walk':'idle';
  let state=this.playback.get(o);
  if(!state||state.action!==action||state.explicit!==active||active&&state.start!==o.presenceStart){
   state={action,explicit:active,start:active?o.presenceStart:V.Engine.time};this.playback.set(o,state);
  }
  const rig=this.rig(o.ancestral||o.companionId||(o.faithRepresentation&&o.character));
  // Map steps to travelled distance: pausing or changing FPS cannot restart the stride.
  const time=!active&&action==='walk'&&Number.isFinite(o.walkDistance)?o.walkDistance/(rig?.stride||72)*rig.columns/actions.walk.fps:Math.max(0,V.Engine.time-state.start);
  return {action,time,loop:actions[action]?.loop!==false};
 },
 drawObject(ctx,o,cam){
  const id=o.ancestral||o.companionId||(o.faithRepresentation&&o.character);if(!this.has(id))return false;
  const x=o.x-cam.x,y=o.y-cam.y,definition=definitions.find(d=>d[0]===this.id(id));
  const {action,time,loop}=this.motion(o),size=(o.type==='roots-companion'?68:82)*(o.visualScale||1);
  ctx.save();ctx.fillStyle=definition[1]+'20';ctx.beginPath();ctx.ellipse(x,y+3,26,7,0,0,Math.PI*2);ctx.fill();
  if(o.type==='roots-companion'&&o.age<.65&&V.GuardianPresence&&this.image(id)){
   ctx.save();ctx.globalAlpha*=Math.sin(Math.PI*V.clamp(o.age/.65,0,1))*.8;
   ctx.shadowColor='#efd18a';ctx.shadowBlur=V.settings.reducedMotion?3:8;
   this.draw(ctx,id,action,x,y+3,size,time,o.dir===1,false,loop,V.GuardianPresence.mask(this.image(id)));ctx.restore();
  }
  const ok=this.draw(ctx,id,action,x,y+3,size,time,o.dir===1,false,loop);ctx.restore();return ok;
 },
 inspect(id=this.selected,action='idle'){
  id=this.id(id);if(!this.has(id))return;this.selected=id;this.action=actions[action]?action:'idle';
  this.started=performance.now()/1000;this.pausedAt=0;this.playing=true;this.speed=1;
  const p=this.person(id),definition=definitions.find(d=>d[0]===id),rig=this.rig(id);
  V.UI.modal(p.name,'PRESENÇAS DA ANCESTRALIDADE',`<div class="presence-studio"><section class="presence-stage"><canvas id="presence-motion-preview" width="720" height="590" aria-label="Animação de ${esc(p.name)}"></canvas><span id="presence-action-caption" role="status">${esc(actions[this.action].name)}</span></section><section class="presence-controls"><span class="roots-kicker">${esc(p.role)}</span><h3>${esc(definition[2])}</h3><label class="field">Presença<select id="presence-person">${definitions.map(([id])=>{const person=this.person(id);return `<option value="${id}" ${id===p.id?'selected':''}>${esc(person.name)}</option>`;}).join('')}</select></label><div class="presence-actions" role="group" aria-label="Movimentos">${Object.entries(actions).map(([id,d])=>`<button data-presence-action="${id}" aria-pressed="${id===this.action}">${esc(d.name)}</button>`).join('')}</div><div class="row"><button id="presence-play" class="secondary">Pausar prévia</button><label class="field">Velocidade<select id="presence-speed"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="1.5">1,5×</option></select></label></div><label class="field presence-timeline">Quadro <span id="presence-frame-number">1 / ${rig.columns}</span><input id="presence-frame" aria-label="Selecionar quadro da animação" type="range" min="0" max="${rig.columns-1}" step="1" value="0"></label><p class="presence-frame-count">${Object.keys(actions).length} movimentos · ${rig.frameCount} quadros de animação · escala do mapa</p></section></div>`,`<button id="presence-world-action" class="primary" ${V.Game.mode==='explore'?'':'disabled'}>Fazer este movimento no mapa</button><button id="presence-roster" class="secondary">Companheiros</button>`,true);
  const modal=V.$('.modal');modal.classList.add('roots-modal','presence-modal');modal.classList.remove('ui-notebook');
  V.$('#presence-person').onchange=e=>this.inspect(e.target.value,this.action);
  V.$$('[data-presence-action]').forEach(b=>b.onclick=()=>{
   this.action=b.dataset.presenceAction;this.started=performance.now()/1000;this.pausedAt=0;this.playing=true;
   V.$('#presence-play').textContent='Pausar prévia';
   V.$$('[data-presence-action]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
   V.$('#presence-action-caption').textContent=actions[this.action].name;this.paint();
  });
  V.$('#presence-play').onclick=()=>{
   const now=performance.now()/1000;if(this.playing)this.pausedAt=now-this.started;else{
    const duration=this.rig(this.selected).columns/actions[this.action].fps;
    if(!actions[this.action].loop&&this.pausedAt*this.speed>=duration)this.pausedAt=0;
    this.started=now-this.pausedAt;
   }
   this.playing=!this.playing;V.$('#presence-play').textContent=this.playing?'Pausar prévia':'Reproduzir prévia';
  };
  V.$('#presence-speed').onchange=e=>{
   const now=performance.now()/1000,elapsed=(this.playing?now-this.started:this.pausedAt)*this.speed;
   this.speed=+e.target.value;this.pausedAt=elapsed/this.speed;this.started=now-this.pausedAt;
  };
  V.$('#presence-frame').oninput=e=>{
   this.playing=false;this.pausedAt=(+e.target.value+.01)/actions[this.action].fps/this.speed;
   V.$('#presence-play').textContent='Reproduzir prévia';this.paint();
  };
  V.$('#presence-world-action').onclick=()=>this.perform(id,this.action);
  V.$('#presence-roster').onclick=()=>V.Companions.open();this.paint();
 },
 paint(){
  const c=V.$('#presence-motion-preview');if(!c)return;
  const ctx=c.getContext('2d'),duration=this.rig(this.selected).columns/actions[this.action].fps;
  let t=(this.playing?performance.now()/1000-this.started:this.pausedAt)*this.speed;
  if(this.playing&&!actions[this.action].loop&&t>=duration){
   t=duration;this.pausedAt=duration/this.speed;this.playing=false;V.$('#presence-play').textContent='Repetir prévia';
  }
  const layout=this.previewLayout(ctx,this.selected,this.previewSize(c)),shadow=layout.size/68;
  ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#162b2640';ctx.beginPath();ctx.ellipse(layout.x,layout.y+3*shadow,26*shadow,7*shadow,0,0,Math.PI*2);ctx.fill();
  this.draw(ctx,this.selected,this.action,layout.x,layout.y,layout.size,t,false,true);
  const f=this.frame(this.selected,this.action,t);
  if(f){V.$('#presence-frame').value=f.index;V.$('#presence-frame-number').textContent=`${f.index+1} / ${f.rig.columns}`;}
 }
};
V.AdventureArt['ancestral-characters']='assets/ancestral/characters.png?v=20261020';
for(const [id] of definitions)if(P.rig(id))V.AdventureArt['presence-'+id]='assets/ancestral/presences/'+id+'-actions.png?v=20261020-hd2';
for(const id of ['bento','ogum'])V.AdventureArt['presence-'+id+'-ready']='assets/ancestral/presences/'+id+'-ready.png?v=20261020-hd2';
const drawAnimation=V.Animations.draw.bind(V.Animations);
V.Animations.draw=function(ctx,id,...args){return P.has(id)?P.draw(ctx,P.id(id),...args):drawAnimation(ctx,id,...args);};
const drawArt=V.AncestralArt.draw.bind(V.AncestralArt);
V.AncestralArt.draw=function(ctx,sheet,index,x,y,size,flip=false){
 const p=sheet==='characters'&&V.AncestralData.people.find(p=>p.sprite===index);
 if(p&&P.has(p.id)&&P.draw(ctx,p.id,'idle',x,y,size,0,flip,true))return;return drawArt(ctx,sheet,index,x,y,size,flip);
};
const show=V.Dialogue.show.bind(V.Dialogue);
V.Dialogue.show=function(){const result=show(),p=V.Ancestral.person(this.lines[this.index]?.speaker),canvas=V.$('#dialogue-portrait');if(p&&P.has(p.id)&&canvas)P.portrait(canvas.getContext('2d'),p.id);return result;};
const profile=V.Ancestral.profile.bind(V.Ancestral);
V.Ancestral.profile=function(id){const result=profile(id);if(P.has(id)&&V.$('.roots-profile-actions')){const b=document.createElement('button');b.className='secondary';b.textContent='Ver presença e movimentos';b.onclick=()=>P.inspect(id);V.$('.roots-profile-actions').append(b);}return result;};
const render=V.Companions.render.bind(V.Companions);
V.Companions.render=function(...args){
 const result=render(...args);for(const [id] of definitions){
  const card=V.$('[data-companion-select="'+id+'"]')?.closest('.companion-card')||V.$('[data-companion-find="'+id+'"]')?.closest('.companion-card');
  if(!card)continue;const row=card.querySelector('.row'),b=document.createElement('button');b.className='quiet';b.textContent='Ver movimentos';b.onclick=()=>P.inspect(id);row.append(b);
 }return result;
};
const gameRender=V.Game.render.bind(V.Game);V.Game.render=function(ctx){gameRender(ctx);P.paint();};
const storyPerform=V.Story.perform.bind(V.Story);V.Story.perform=function(action){const p=V.Companions.selected();return p&&P.has(p.id)?P.perform(p.id,action):storyPerform(action);};
})();
