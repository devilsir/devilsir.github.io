/* Registered module: ancestral-mask */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("ancestral-mask", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,W=V.World,version='20261104-mask-files1';
const portrait='assets/adventure/historiograph-mask.webp',icon='assets/ui/illustrated/historio-mask.webp';
const variants=[
 {atlas:'assets/adventure/historiograph-mask-atlas.webp',portrait,icon,glow:'#a1d5b9'},
 {atlas:'assets/adventure/historiograph-mask-p2-atlas.webp',portrait:'assets/adventure/historiograph-mask-p2.webp',icon:'assets/ui/illustrated/historio-mask-p2.webp',glow:'#e6bd72'}
];
const rows={front:0,left:1,right:2,pulse:3,speaking:4,curious:5,surprised:6,happy:7};
const models=[['plumagem','Plumagem'],['coroa-solar','Coroa solar'],['totem','Totem'],['sol-e-lua','Sol e lua'],['felino','Felino'],['leque','Leque'],['chifres','Chifres'],['hibisco','Hibisco'],['mosaico','Mosaico'],['caveira','Caveira']].map(([id,name],index)=>({id,name,index}));
const palettes=[{id:'original',name:'Original',hue:0,color:'#e8ac37'},{id:'turquesa',name:'Turquesa',hue:140,color:'#4ddcc9'},{id:'violeta',name:'Violeta',hue:250,color:'#b59afa'},{id:'rubi',name:'Rubi',hue:325,color:'#ed657f'}];
const M=V.AncestralMask={images:{},tracks:new WeakMap(),panels:new Set(),textures:new Map(),animationTextures:new Map(),animationLoads:new Map(),animationCacheLimit:3,uiTime:0,rows,variants,models,palettes,
 appearance(owner=this.variant()){
  const saved=V.state?.maskAppearance?.[owner===1?'player2':'player1'];
  return{model:models.some(m=>m.id===saved?.model)?saved.model:'default',palette:palettes.some(p=>p.id===saved?.palette)?saved.palette:'original'};
 },
 texture(model,palette='original'){
  const entry=models.find(m=>m.id===model),color=palettes.find(p=>p.id===palette)||palettes[0];
  if(!entry)return null;
  const image=this.images['portrait:'+entry.id+'-'+color.id];if(!V.Assets.ready(image))return null;
  const key=entry.id+':'+color.id;if(this.textures.has(key))return this.textures.get(key);
  // Static images also work on file://, where drawing a local image taints a canvas.
  const texture={canvas:image,url:'assets/adventure/mask-styles/portraits/'+entry.id+'-'+color.id+'.webp?v='+version};this.textures.set(key,texture);return texture;
 },
 ensureAnimation(model=this.appearance().model,owner=this.variant(),palette=this.appearance(owner).palette){
  const entry=models.find(m=>m.id===model),color=palettes.find(p=>p.id===palette)||palettes[0],asset=model+(color.id==='original'?'':'-'+color.id),image=this.images['animation:'+asset];
  if(!entry||!image)return Promise.resolve(false);
  if(V.Assets.ready(image))return Promise.resolve(true);
  if(this.animationLoads.has(asset))return this.animationLoads.get(asset);
  const state=V.state,prepare=()=>V.MapAssets.ensure(['mask-style:'+asset],'Preparando animações · '+entry.name);
  const pending=(V.DuoPanels?.enabled()?V.DuoPanels.withOwner(owner,prepare):prepare()).then(ok=>{
   if(ok&&V.state===state){this.paintPanels();this.paintPortrait();}return ok;
  }).finally(()=>{if(this.animationLoads.get(asset)===pending)this.animationLoads.delete(asset);});
  this.animationLoads.set(asset,pending);return pending;
 },
 animationTexture(model,palette='original',owner=this.variant()){
  const entry=models.find(m=>m.id===model),color=palettes.find(p=>p.id===palette)||palettes[0],asset=model+(color.id==='original'?'':'-'+color.id),image=this.images['animation:'+asset];
  if(!entry||!image)return null;
  if(!V.Assets.ready(image)){this.ensureAnimation(model,owner,color.id);return null;}
  const key=model+':'+color.id;
  if(this.animationTextures.has(key)){const texture=this.animationTextures.get(key);this.animationTextures.delete(key);this.animationTextures.set(key,texture);return texture;}
  const texture={canvas:image,cell:192};this.animationTextures.set(key,texture);
  // Sheets load only when selected; no generated canvas or pixel readback is needed.
  while(this.animationTextures.size>this.animationCacheLimit)this.animationTextures.delete(this.animationTextures.keys().next().value);
  return texture;
 },
 selectedAnimation(variant){const style=this.appearance(variant);return this.animationTexture(style.model,style.palette,variant);},
 selectedTexture(variant){const style=this.appearance(variant);return this.texture(style.model,style.palette);},
 label(variant){const style=this.appearance(variant),model=models.find(m=>m.id===style.model);return model?'Máscara '+model.name+' · '+palettes.find(p=>p.id===style.palette).name+' · jogador '+(variant+1):variant?'Máscara ancestral azul e turquesa do jogador 2, com olhos âmbar':'Máscara ancestral colorida com penas, pintura geométrica e olhos turquesa';},
 choose(model,palette=this.appearance().palette){
  if(!V.state||!['default',...models.map(m=>m.id)].includes(model)||!palettes.some(p=>p.id===palette))return false;
  if(model!=='default'&&!this.texture(model,palette))return false;
  // Keep cosmetics outside the shared investigation/tutorial state.
  const owner=this.variant(),key=owner===1?'player2':'player1';
  V.state.maskAppearance={...V.state.maskAppearance,[key]:{model,palette}};V.Save.save();this.ensureAnimation(model,owner);this.refreshWardrobe();this.retrofit();this.paintPanels();this.paintPortrait();return true;
 },
 variant(player=V.Player.data,owner=-1){
  const d=V.DuoWorld;if(!d?.enabled())return 0;
  if(owner>=0)return owner===1?1:0;
  const index=d.actors.findIndex(actor=>actor.data===player);if(index>=0)return index===1?1:0;
  return (d.context>=0?d.context:V.DuoPanels?.owner())===1?1:0;
 },
 image(kind,variant=0){return this.images[kind+(variant===1?'2':'')];},
 path(kind,variant=this.variant()){return kind!=='atlas'&&this.selectedTexture(variant)?.url||variants[variant===1?1:0][kind]+'?v='+version;},
 publish(kind,index){
  const im=this.image(kind,index);if(!im?.naturalWidth)return;
  if(kind==='icon'){V.IllustratedInterface.images[index?'historio-p2':'historio']=im;V.Assets.images[index?'item-device-p2':'item-device']=im;}
  if(kind==='portrait'){V.Assets.images[index?'historiograph-p2':'historiograph']=im;if(!index)V.Assets.images['historiograph-v2']=im;}
 },
 load(){
  this.textures.clear();this.animationTextures.clear();this.animationLoads.clear();
  const portraits=[];
  for(const model of models)for(const palette of palettes){
   const asset=model.id+(palette.id==='original'?'':'-'+palette.id),im=this.images['animation:'+asset]=V.Assets.image();im.src='assets/adventure/mask-styles/'+asset+'-atlas.webp?v='+version;
   portraits.push(new Promise(resolve=>{const thumbnail=this.images['portrait:'+model.id+'-'+palette.id]=V.Assets.image();thumbnail.onload=resolve;thumbnail.onerror=resolve;thumbnail.src='assets/adventure/mask-styles/portraits/'+model.id+'-'+palette.id+'.webp?v='+version;V.AssetLoader.register(thumbnail,resolve);}));
  }
  const gallery=new Promise(resolve=>{const im=this.images.gallery=V.Assets.image();im.onload=()=>{this.textures.clear();this.retrofit();resolve();};im.onerror=resolve;im.src='assets/adventure/mask-styles/gallery.webp?v='+version;V.AssetLoader.register(im,resolve);});
  return Promise.all([gallery,...portraits,...variants.flatMap((skin,index)=>['atlas','portrait','icon'].map(kind=>[kind,index])).map(([kind,index])=>new Promise(resolve=>{
   const im=V.Assets.image();this.images[kind+(index?'2':'')]=im;
   im.onload=()=>{this.publish(kind,index);resolve();};
   im.onerror=resolve;im.src=variants[index][kind]+'?v='+version;V.AssetLoader.register(im,resolve);
  }))]);
 },
 visible(){return !!(V.state&&V.Game.screen==='game'&&V.Game.mode==='explore'&&!V.SceneEditor.active&&V.Progress.ensure().questItems.historiograph);},
 track(player=V.Player.data,map=W.current){
  if(!player||!map)return null;
  const time=V.Engine.time||0;let track=this.tracks.get(player);
  if(!track||track.map!==map.id||Math.hypot(track.x-player.x,track.y-player.y)>240){
   track={map:map.id,x:player.x,y:player.y,time,vx:0,idleSince:time,nextProbe:time,nearTrace:false};this.tracks.set(player,track);
  }else if(track.time!==time){
   const dt=V.clamp(time-track.time,0,.1),mix=V.settings.reducedMotion?1:1-Math.exp(-10*dt),oldX=track.x;
   track.x+=(player.x-track.x)*mix;track.y+=(player.y-track.y)*mix;
   track.vx=dt>0?V.clamp((track.x-oldX)/dt,-220,220):0;track.time=time;
   if(player.moving)track.idleSince=time;
  }
  // Probe infrequently; a curious look never reveals or collects evidence.
  if(time>=track.nextProbe){
   track.nextProbe=time+.75;
   const found=V.Story.ensure().traces;
   track.nearTrace=(map.objects||[]).some(o=>o.type==='rasura'&&!(found[o.caseId]||[]).includes(o.index)&&Math.hypot(o.x-player.x,o.y-player.y)<95);
  }
  return track;
 },
 blink(time){const phase=(time%4.3+4.3)%4.3;return phase<3.94?0:Math.min(3,Math.floor((phase-3.94)/.09));},
 speaking(){return !!(V.Dialogue.active&&V.Dialogue.lines[V.Dialogue.index]?.speaker==='historiograph'&&(V.Dialogue.viewer==null||V.Dialogue.viewer===(V.DuoWorld?.context??0)));},
 pose(player,track,time,cos){
  if(V.settings.reducedMotion)return{state:'front',row:0,col:0,tilt:0,lift:0,scale:1};
  const motion=V.Historio.ensure().motion!==false;
  let state=cos<-.22?'right':cos>.22?'left':'front',age=0;
  if(motion&&((!V.DuoWorld?.enabled()&&V.Story.pulseTime>0)||time<(track.pulseUntil||0)))state='pulse';
  else if(track.emote&&time<track.emoteUntil){state=track.emote;age=time-track.emoteAt;}
  else if(this.speaking())state='speaking';
  else if(player.celebrateTime>0)state='happy';
  else if(player.actionTime>0||track.nearTrace||(time-track.idleSince>4.5&&time%12>8))state='curious';
  let col=this.blink(time);
  if(state==='pulse')col=Math.floor(Math.max(0,time-(track.pulseAt||0))*7)%4;
  else if(state==='speaking')col=Math.floor(this.uiTime*8)%4;
  else if(state==='happy')col=Math.floor(time*5)%4;
  else if(state==='curious')col=Math.floor(time*1.8)%4;
  else if(state==='surprised')col=Math.min(3,Math.floor(age/Math.max(.1,track.emoteUntil-track.emoteAt)*4));
  // The painted activation frames contain bright eyes, so suppress those too.
  if(state==='pulse'&&V.settings.reducedFlash){state='front';col=0;}
  return{state,row:rows[state],col,tilt:V.clamp(-track.vx*.0005+Math.sin(time*2.1)*.035+(state==='happy'?Math.sin(time*8)*.09:0),-.17,.17),lift:state==='happy'?Math.sin(time*7)*2:0,scale:state==='pulse'?1+Math.sin(time*4)*.025:1};
 },
 point(player=V.Player.data,map=W.current){
  const track=this.track(player,map);if(!track)return null;
  const time=V.Engine.time||0,reduced=V.settings.reducedMotion,actor=this.variant(player),angle=reduced?0:time*.76+actor*.75,cos=Math.cos(angle),sin=Math.sin(angle);
  const pose=this.pose(player,track,time,cos),size=54;
  // Keep the enlarged feather silhouette outside the player's face and body.
  let x=(reduced?player.x:track.x)+cos*49,y=(reduced?player.y:track.y)-(reduced?42:30)+sin*63+(reduced?0:Math.sin(time*2.1)*2)-pose.lift;
  if(V.PixPresence.following()){
   const dx=x-(player.x-38),dy=y-(player.y-45),distance=Math.hypot(dx,dy);
   if(distance<35){const factor=(35-distance)/Math.max(distance,.01);x+=dx*factor;y+=dy*factor;}
  }
  x=V.clamp(x,27,map.width*48-27);y=V.clamp(y,28,map.height*48-32);
  return{x,y,groundY:y+31,back:!reduced&&sin<0,size,angle,variant:actor,...pose};
 },
 frame(c,row,col,x,y,size,variant=0){
  const animation=this.selectedAnimation(variant);
  if(animation){
   if(V.settings.reducedMotion){row=0;col=0;}
   const cell=animation.cell;c.drawImage(animation.canvas,col*cell,row*cell,cell,cell,Math.round(x-size/2),Math.round(y-size/2),size,size);return;
  }
  const texture=this.selectedTexture(variant);
  if(texture){
   // Show the selected neutral art while its deferred sheet is being decoded.
   c.drawImage(texture.canvas,Math.round(x-size/2),Math.round(y-size/2),size,size);return;
  }
  const image=this.image('atlas',variant);if(!V.Assets.ready(image))return;
  const cell=image.naturalWidth/4;
  c.drawImage(image,col*cell,row*cell,cell,cell,Math.round(x-size/2),Math.round(y-size/2),size,size);
 },
 draw(c,point,cam=W.camera){
  if(!point||!V.Assets.ready(this.image('atlas',point.variant)))return;
  const {x,y,size,row,col,tilt,scale,variant=0}=point,px=x-cam.x,py=y-cam.y;
  c.save();c.imageSmoothingEnabled=false;
  V.SceneShadows.contact(c,px,point.groundY-cam.y+3,8,3,.12);
  c.translate(px,py);c.rotate(tilt);c.scale(scale,scale);
  if(row===rows.pulse&&!V.settings.reducedFlash){c.shadowColor=variants[variant].glow;c.shadowBlur=5;}
  this.frame(c,row,col,0,0,size,variant);c.restore();
 },
 react(state,duration=1.6,player=V.Player.data){
  if(!['happy','surprised','curious'].includes(state))return;
  const track=this.track(player);if(!track)return;
  track.emote=state;track.emoteAt=V.Engine.time||0;track.emoteUntil=track.emoteAt+duration;
  track.uiEmoteAt=this.uiTime;track.uiEmoteUntil=this.uiTime+duration;
 },
 activate(){
  const track=this.track();if(!track)return;
  this.pulseUntil=track.pulseUntil=(V.Engine.time||0)+1.5;
  track.pulseAt=V.Engine.time||0;track.uiPulseAt=this.uiTime;track.uiPulseUntil=this.uiTime+1.5;
 },
 mountPanel(){
  const box=V.$('.historio-object'),fallback=box?.querySelector('img');if(!fallback)return;
  const variant=this.variant();fallback.dataset.maskKind='portrait';fallback.src=this.path('portrait',variant);fallback.alt=this.label(variant);
  let canvas=box.querySelector('.historio-mask-canvas');
  if(!canvas){canvas=document.createElement('canvas');canvas.width=240;canvas.height=240;canvas.className='historio-mask-canvas';canvas.dataset.maskVariant=variant;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',this.label(variant));fallback.insertAdjacentElement('afterend',canvas);this.panels.add({canvas,fallback,player:V.Player.data,variant,curious:V.Historio.tab==='compare'});}
  const heading=box.closest('.modal')?.querySelector('.modal-heading>.ui-art');if(heading&&heading.dataset.menuIcon!=='historio')heading.replaceWith(V.IllustratedInterface.element('historio'));
  let actions=box.closest('.historio-device')?.querySelector('.historio-mask-actions');
  if(!actions){actions=document.createElement('div');actions.className='historio-mask-actions';actions.innerHTML='<button type="button" class="primary historio-change-mask" data-historio-change-mask></button><small class="historio-mask-availability"></small>';box.append(actions);}
  const quick=box.closest('.historio-device')?.querySelector('.mask-quick');
  if(quick)quick.append(actions);
  const change=actions.querySelector('button');change.disabled=false;
  change.innerHTML=V.TurnArt.icon('style')+'<span>Trocar máscara</span>';
  change.onclick=()=>this.openWardrobe(variant);
  actions.querySelector('small').textContent='';
  this.mountWardrobe(box.closest('.historio-shell'),variant);
  this.paintPanels();
 },
 openWardrobe(owner=this.variant()){
  if(!V.state)return false;
  const open=()=>{
   let details=V.$('.historio-wardrobe');
   if(!details){V.Historio.panel();details=V.$('.historio-wardrobe');}
   if(!details)return false;
   details.open=true;
   details.querySelector('summary').focus({preventScroll:true});
   details.scrollIntoView({block:'nearest'});
   return true;
  };
  return V.DuoPanels?.enabled()?V.DuoPanels.withOwner(owner,open):open();
 },
 mountWardrobe(shell,owner=this.variant()){
  if(!shell||shell.querySelector('.historio-wardrobe'))return;
  const details=document.createElement('details');details.className='historio-wardrobe';details.dataset.maskPlayer=owner;
  details.innerHTML='<summary><span>Escolher visual da máscara</span><small data-mask-current></small></summary><div class="historio-wardrobe-body"><p>Jogador '+(owner+1)+' · escolha um modelo com bônus de batalha e uma paleta para o visual.</p><div class="historio-mask-models" role="group" aria-label="Modelos da máscara do jogador '+(owner+1)+'">'+[{id:'default',name:owner===1?'Ancestral azul':'Ancestral original'},...models].map(model=>'<button type="button" data-mask-model="'+model.id+'" aria-pressed="false"><img width="72" height="72" alt=""><span>'+model.name+'</span><b aria-hidden="true">✓</b></button>').join('')+'</div><fieldset class="historio-mask-palettes"><legend>Cores do modelo</legend>'+palettes.map(p=>'<button type="button" data-mask-palette="'+p.id+'" aria-pressed="false"><i style="--mask-swatch:'+p.color+'" aria-hidden="true"></i>'+p.name+'</button>').join('')+'</fieldset><p class="historio-mask-selection" role="status" aria-live="polite"></p></div>';
  shell.querySelector('.historio-device').after(details);
  // Capture ownership explicitly, including clicks before modal binding runs.
  for(const button of details.querySelectorAll('[data-mask-model]'))button.onclick=()=>V.DuoPanels.withOwner(owner,()=>this.choose(button.dataset.maskModel));
  for(const button of details.querySelectorAll('[data-mask-palette]'))button.onclick=()=>V.DuoPanels.withOwner(owner,()=>this.choose(this.appearance(owner).model,button.dataset.maskPalette));
  this.refreshWardrobe();
 },
 refreshWardrobe(){
  for(const details of document.querySelectorAll('.historio-wardrobe')){
   const owner=+details.dataset.maskPlayer===1?1:0,style=this.appearance(owner),name=models.find(m=>m.id===style.model)?.name||(owner?'Ancestral azul':'Ancestral original'),palette=palettes.find(p=>p.id===style.palette);
   details.querySelector('[data-mask-current]').textContent=name+(style.model==='default'?'':' · '+palette.name);
   for(const button of details.querySelectorAll('[data-mask-model]')){const id=button.dataset.maskModel,texture=id==='default'?null:this.texture(id,style.palette),im=button.querySelector('img'),src=texture?.url||variants[owner].portrait+'?v='+version;if(im.getAttribute('src')!==src)im.src=src;const bonus=V.FragmentData?.masks[id];if(bonus){button.title=bonus[1]+' · '+bonus[2];button.querySelector('span').textContent=(id==='default'?(owner?'Ancestral azul':'Ancestral original'):bonus[0])+' · '+bonus[1];}button.disabled=id!=='default'&&!texture;button.setAttribute('aria-pressed',String(id===style.model));}
   for(const button of details.querySelectorAll('[data-mask-palette]')){button.disabled=style.model==='default';button.setAttribute('aria-pressed',String(button.dataset.maskPalette===(style.model==='default'?'original':style.palette)));}
   details.querySelector('.historio-mask-selection').textContent='Visual equipado: '+name+(style.model==='default'?'':' · '+palette.name)+'. '+(V.FragmentData?.masks[style.model]?.[2]||'');
   const label=details.closest('.historio-shell')?.querySelector('[data-mask-equipped]');
   if(label)label.textContent=name+(style.model==='default'?'':' · '+palette.name);
  }
  for(const panel of this.panels)if(panel.canvas.isConnected){panel.canvas.setAttribute('aria-label',this.label(panel.variant));panel.fallback.src=this.path('portrait',panel.variant);}
 },
 paintPanels(){
  for(const panel of this.panels){
   const {canvas,fallback,player,curious,variant}=panel;if(!canvas.isConnected){this.panels.delete(panel);continue;}
   if(!V.Assets.ready(this.image('atlas',variant)))continue;
   fallback.hidden=true;
   const track=this.tracks.get(player),motion=!V.settings.reducedMotion&&V.Historio.ensure().motion!==false;
   let row=0,col=motion?this.blink(this.uiTime):0;
   if(motion&&this.uiTime<(track?.uiPulseUntil||0)&&!V.settings.reducedFlash){row=rows.pulse;col=Math.floor((this.uiTime-track.uiPulseAt)*7)%4;}
   else if(motion&&this.uiTime<(track?.uiEmoteUntil||0)){row=rows[track.emote];col=track.emote==='surprised'?Math.min(3,Math.floor((this.uiTime-track.uiEmoteAt)/(track.uiEmoteUntil-track.uiEmoteAt)*4)):Math.floor(this.uiTime*4)%4;}
   else if(motion&&curious){row=rows.curious;col=Math.floor(this.uiTime*1.8)%4;}
   const c=canvas.getContext('2d');c.clearRect(0,0,240,240);c.imageSmoothingEnabled=false;c.save();c.translate(120,120+(motion?Math.sin(this.uiTime*2)*2:0));
   this.frame(c,row,col,0,0,236,variant);c.restore();
  }
 },
 paintPortrait(){
  if(!V.Dialogue.active||V.Dialogue.lines[V.Dialogue.index]?.speaker!=='historiograph')return;
  const variant=this.variant(V.Player.data,V.Dialogue.viewer??-1),canvas=V.$('#dialogue-portrait');if(!canvas||!V.Assets.ready(this.image('atlas',variant)))return;
  const line=V.Dialogue.lines[V.Dialogue.index],talking=V.Dialogue.typing<V.Dialogue.currentText.length,reduced=V.settings.reducedMotion;
  const row=reduced?0:talking?rows.speaking:[0,rows.speaking,rows.curious,rows.happy][line.expression||0]||0;
  const col=reduced?0:row===0?this.blink(this.uiTime):Math.floor(this.uiTime*(talking?8:3))%4;
  const c=canvas.getContext('2d');c.clearRect(0,0,96,96);c.imageSmoothingEnabled=false;this.frame(c,row,col,48,48,96,variant);
 },
 update(dt){
  if(V.Game.screen!=='game'||!V.state)return;
  // Expressions keep playing in conversation and in the mask panel; the
  // world orbit still uses Engine.time, which pauses with the rest of the map.
  this.uiTime+=V.clamp(dt,0,.1);this.paintPortrait();this.paintPanels();
 },
 retrofit(root=document){
  for(const im of root.querySelectorAll('img[data-menu-icon="historio"],img[data-mask-kind],.historio-object>img,.adv-device-banner>img,.adv-story-intro>img,img.adv-icon[src*="/historiograph-mask"]')){
   if(!im.dataset.maskKind&&im.dataset.menuIcon!=='historio'&&!/\/historiograph-mask(?:-p2)?\.webp(?:[?#]|$)/.test(im.getAttribute('src')||''))continue;
   const owner=im.closest('[data-duo-panel-player],[data-world-player]'),variant=V.DuoWorld?.enabled()&&(owner?.dataset.duoPanelPlayer??owner?.dataset.worldPlayer)==='1'?1:0;
   const kind=im.dataset.menuIcon==='historio'?'icon':'portrait',path=this.path(kind,variant);im.dataset.maskKind=kind;if(kind==='portrait')im.alt=this.label(variant);
   if(im.getAttribute('src')!==path)im.src=path;
  }
 }
};
const assetGroup=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=function(key){const match=/^assets\/adventure\/mask-styles\/([\w-]+)-atlas\.webp$/.exec(key);return match?'mask-style:'+match[1]:assetGroup(key);};
const startGame=V.Game.startGame.bind(V.Game);V.Game.startGame=function(...args){const out=startGame(...args);if(V.DuoWorld?.enabled())for(let owner=0;owner<2;owner++)V.DuoWorld.withActor(owner,()=>M.ensureAnimation());else M.ensureAnimation();return out;};
V.AdventureArt.historiograph=portrait+'?v='+version;V.AdventureArt['historiograph-v2']=portrait+'?v='+version;V.AdventureArt['historiograph-portrait']='assets/adventure/historiograph-mask-portrait.webp?v='+version;
V.AdventureArt['historiograph-p2-portrait']='assets/adventure/historiograph-mask-p2-portrait.webp?v='+version;
V.content.characters.historiograph.role='Máscara ancestral ficcional · vestígios e perguntas';
Object.assign(V.AdventureData.items.historiograph,{description:'Máscara ancestral africana na ficção de VOICES, com penas coloridas, pintura geométrica e olhos turquesa. Flutua ao redor do portador e ajuda a relacionar vestígios, fontes e contextos.'});
const progressIcon=V.Progress.icon.bind(V.Progress);V.Progress.icon=(id,size=40)=>id==='historiograph'?'<img class="adv-icon" data-mask-kind="portrait" src="'+M.path('portrait')+'" alt="'+M.label(M.variant())+'" width="'+size+'" height="'+size+'">':progressIcon(id,size);
const path=V.IllustratedInterface.path.bind(V.IllustratedInterface);V.IllustratedInterface.path=id=>V.IllustratedInterface.canonical(id)==='historio'?M.path('icon'):path(id);
const refresh=V.IllustratedInterface.refresh.bind(V.IllustratedInterface);V.IllustratedInterface.refresh=function(...args){const out=refresh(...args);M.retrofit();return out;};M.retrofit();
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await Promise.all([load(...args),M.load()]);for(let index=0;index<variants.length;index++)for(const kind of ['portrait','icon'])M.publish(kind,index);};
// Shared player scope preserves depth and each companion's own state in duo.
const render=V.Player.render.bind(V.Player);V.Player.render=function(c){if(!M.visible()||!this.data)return render(c);const p=M.point(this.data),cam=W.camera;if(p.back)M.draw(c,p,cam);const out=render(c);if(!p.back)M.draw(c,p,cam);return out;};
const pulse=V.Story.pulse.bind(V.Story);V.Story.pulse=function(...args){const out=pulse(...args);if(out)M.activate();return out;};
const reward=V.Progress.reward.bind(V.Progress);V.Progress.reward=function(key,...args){const ok=reward(key,...args);if(ok&&/^trace-/.test(key))M.react('surprised',1.5);else if(ok&&/^(interpret|choice|chapter)-/.test(key))M.react('happy',2);return ok;};
const panel=V.Historio.panel.bind(V.Historio);V.Historio.panel=function(...args){const out=panel(...args);M.mountPanel();const button=V.$('#historio-activate');if(button){const activate=button.onclick;button.onclick=function(...values){M.activate();const out=activate?.apply(this,values);M.paintPanels();return out;};}return out;};
const dialogue=V.Dialogue.show.bind(V.Dialogue);V.Dialogue.show=function(...args){const out=dialogue(...args);M.paintPortrait();return out;};
V.Hooks.around(V.Game, 'update', 'ancestral-mask:update:1', nextHook => function(dt){const out=nextHook(dt);M.update(dt);return out;});
const lights=V.Environment.lights?.bind(V.Environment);if(lights)V.Environment.lights=function(...args){const list=lights(...args),point=M.visible()?M.point():null;for(const light of list)if(light.id==='historiograph-glow'&&point){light.x=point.x;light.y=point.y;light.radius=65;light.intensity=V.settings.reducedFlash ? .12 : .26;}return list;};
})();

});
