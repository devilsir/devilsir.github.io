(function(){
'use strict';
const V=window.V,C=V.Cozy,W=V.World,D=V.SceneDesign,P=V.Progress,A=V.Architecture,E=V.Environment,N=V.ObjectiveGuide,S=V.Story,copy=x=>JSON.parse(JSON.stringify(x));
const old={assets:V.Assets.load.bind(V.Assets),compose:C.compose.bind(C),draw:C.drawObject.bind(C),interact:V.Game.interact.bind(V.Game),init:W.init.bind(W),load:W.load.bind(W),newState:V.Game.newState.bind(V.Game),start:V.Game.startGame.bind(V.Game),update:V.Game.update.bind(V.Game),key:V.Game.onKey.bind(V.Game),save:V.Save.save.bind(V.Save),loadSave:V.Save.load.bind(V.Save),normalise:D.normalise.bind(D),document:D.document.bind(D),blocked:V.Living.blocked.bind(V.Living),interactables:W.interactables.bind(W),ready:V.Quests.ready.bind(V.Quests),journal:V.Quests.journal.bind(V.Quests),hud:V.Game.updateHUD.bind(V.Game),pause:V.Game.pause.bind(V.Game),credits:V.Game.credits.bind(V.Game),settings:V.Game.settings.bind(V.Game),toTitle:V.Game.toTitle.bind(V.Game),apply:D.apply.bind(D)};
V.AdventureProps=[['zambeto','Zambeto · representação do guardião'],['historiograph','Historiógrafo Ancestral'],...Object.entries({street:'Poste de rua',wall:'Luz de parede',ceiling:'Luz de teto',spotlight:'Spot de galeria',desk:'Luz de mesa',lantern:'Lanterna',emissive:'Objeto luminoso'}).map(([key,name])=>['fixture-'+key,name])];
V.sceneAssets.push(...V.AdventureProps.map(([key,name],index)=>({family:'adventure',index,name,category:'expansão',layer:'object',solid:false,size:1.5})));
const prop=C.prop.bind(C);C.prop=function(ctx,family,index,x,y,size,materials){if(family!=='adventure')return prop(ctx,family,index,x,y,size,materials);const key=V.AdventureProps[index]?.[0],img=V.Assets.images[key];if(!img)return;if(key==='zambeto')ctx.drawImage(img,0,0,128,144,x,y,size,size);else ctx.drawImage(img,x,y,size,size);};
V.Assets.load=async function(){const entries=V.AdventureArt||{};await Promise.all([old.assets(),...Object.entries(entries).map(([key,path])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{this.images[key]=img;resolve();};img.onerror=()=>{this.errors.push(path);resolve();};img.src=path;}))]);return this.errors;};
C.compose=function(m){old.compose(m);A.hydrate(m);E.hydrate(m);S.hydrate(m);
for(const o of m.objects.filter(C.person.bind(C)))if(V.Living.blocked(m,o.x,o.y,12)){const p=V.Rooms.safe(m,{x:o.x,y:o.y},12,o);if(p){o.x=p.x;o.y=p.y;o.home={...p};const home=m.anchors?.get('home-'+o.id);if(home)Object.assign(home,p);}}
};
V.Living.blocked=function(m,x,y,r=11){return old.blocked(m,x,y,r)||A.blocked(m,x,y,r);};
W.collides=function(x,y,r=11){return!this.current||V.Living.blocked(this.current,x,y,r);};
W.init=function(){old.init();for(const m of Object.values(this.maps)){if(!m.archWalls){A.hydrate(m);E.hydrate(m);S.hydrate(m);}}N.invalidate();};
W.load=function(id,pos){const result=old.load(id,pos);if(!V.state)return result;const a=P.ensure();if(!a.story.visited.includes(this.current.id))a.story.visited.push(this.current.id);N.signature='';N.timer=0;E.ambientBlend=E.profile().indoor?1:0;S.companion=null;P.hud();E.hud();return result;};
W.interactables=function(){return old.interactables().filter(o=>S.visible(o));};
V.Game.interact=function(o){if(!o||V.modal||V.Dialogue.active||V.Game.mode!=='explore')return;if(S.interact(o))return;if(o.type==='mounted-art'){V.Campus.profile(o.mounted.portrait);return;}if(o.type==='custom-trigger'){V.UI.modal(o.title,'ENCONTRO DO CENÁRIO',`<p>${V.escape(o.text)}</p>`);if(o.flag)V.state.flags[o.flag]=true;V.Save.save();return;}return old.interact(o);};
C.drawObject=function(ctx,o,cam,t){if(o.mounted||!S.visible(o))return;if(S.draw(ctx,o,cam))return;if(o.type==='boss'){V.Combat.drawManifestation(ctx,o,cam);return;}return old.draw(ctx,o,cam,t);};
C.render=function(ctx){
const m=W.current;if(!m||!V.state)return;C.ensure();const cam=W.camera,t={accent:m.chapter?V.content.chapters[m.chapter-1].color:'#d1be93'};
if(V.Neighborhood)V.Neighborhood.bubbleDrawn=false;m.protestChantVisible=false;
if(!m.cache)C.ground(m);ctx.imageSmoothingEnabled=false;ctx.fillStyle=m.design.palette[0];ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.drawImage(m.cache,Math.round(-cam.x),Math.round(-cam.y));E.sky(ctx,m,cam);C.pond(ctx,m,cam);
if(!V.SceneEditor.active)N.draw(ctx,cam);
m.buildings.forEach(b=>W.drawBuilding(ctx,b,cam));if(m.id==='hub')C.fountain(ctx,cam);
const draws=m.decor.map(o=>({y:o.layer==='ground'?-10000:o.family==='room-wall'?Math.max(o.wall.a[1],o.wall.b[1])-1:o.y+o.size*.9,kind:'decor',o})).concat(m.objects.map(o=>({y:o.y,kind:'object',o})),[{y:V.Player.data.y,kind:'player'}],A.geometry(m.design).walls.map(o=>({y:Math.max(o.a[1],o.b[1]),kind:'wall',o})),(m.design.adventure.lights||[]).map(o=>({y:o.y,kind:'light',o}))).sort((a,b)=>a.y-b.y);
for(const d of draws){
if(d.kind==='player')V.Player.render(ctx);
else if(d.kind==='object')C.drawObject(ctx,d.o,cam,t);
else if(d.kind==='wall')A.drawWall(ctx,m,d.o,cam);
else if(d.kind==='light')E.drawFixture(ctx,d.o,cam,m);
else{const o=d.o,x=o.x-cam.x,y=o.y-cam.y;if(x>-o.size&&x<ctx.canvas.width+80&&y>-o.size&&y<ctx.canvas.height+100){if(m.id==='garden'&&o.family==='world'&&o.prop===1)C.gardenBed(ctx,o,cam);else D.drawDecor(ctx,o,cam);}}
}
A.drawSigns(ctx,m,cam);E.drawWindows(ctx,m,cam);C.progressDetails(ctx,m,cam);if(!V.SceneEditor.active)N.drawTarget(ctx,cam);const p=V.Player.data;
if(V.PixPresence.following())V.PixPresence.draw(ctx,p,cam);
const icon=V.Assets.images['item-device'];if(icon&&P.ensure().story.awakened)ctx.drawImage(icon,p.x-cam.x+11,p.y-cam.y-29,16,16);
V.Engine.drawParticles(ctx,cam);S.drawPulse(ctx,cam);
if(!V.SceneEditor.active||E.preview?.enabled){E.lighting(ctx,m,cam);E.weatherDraw(ctx,m,cam);}
const visible=m.objects.filter(o=>o.x-cam.x>-20&&o.x-cam.x<ctx.canvas.width+20&&o.y-cam.y>40&&o.y-cam.y<ctx.canvas.height+60);
visible.filter(o=>o.chatSpeaking).slice(0,1).forEach(o=>C.bubble(ctx,o,cam));visible.filter(o=>!o.chatSpeaking&&o.iconTime>0).slice(0,visible.some(o=>o.chatSpeaking)||m.protestChantVisible?1:2).forEach(o=>C.bubble(ctx,o,cam));
if(W.transition>0&&!V.SceneEditor.active){ctx.globalAlpha=W.transition;ctx.fillStyle='#23372f';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.globalAlpha=1;}W.drawMiniMap();
};
V.Game.newState=function(opts){old.newState(opts);const a=P.ensure();a.health=P.stats().health;a.focus=P.stats().focus;V.state.map='museum';V.state.position={x:22*48,y:32*48};};
V.Game.startGame=function(){
const a=P.ensure();
if(a.scenarios&&!this.adventureScenariosLoaded){this.adventureScenariosLoaded=true;try{const maps=D.normalise(a.scenarios);Object.assign(C.layouts,maps);D.saved=copy(maps);W.init();}catch(e){V.UI.toast('O cenário do backup precisa de revisão: '+e.message);}}
old.start();P.observe();P.hud();E.hud();
if(a.battle){const battle=copy(a.battle);if(V.Combat.resume(battle))V.UI.toast('Confronto retomado no último turno confirmado.');else{a.battle=null;V.UI.toast('O confronto foi encerrado com segurança. Você pode iniciá-lo novamente.');}}
};
V.Game.intro=()=>S.intro();
V.Game.ending=()=>S.finale();
V.Game.update=function(dt){
old.update(dt);if(this.screen!=='game'||!V.state)return;
const paused=V.modal||V.Dialogue.active||this.mode!=='explore'||V.SceneEditor.active;
E.update(dt,paused);if(!paused){S.update(dt);N.update(dt);}
if(['museum','night','firstbattle'].includes(P.ensure().story.stage))V.$('#tutorial-hint').hidden=true;
if(Math.floor(V.Engine.time*2)!==this.adventureTick){this.adventureTick=Math.floor(V.Engine.time*2);P.observe();P.hud();const objective=N.objective();if(this.lastAdventureObjective!==objective?.key){this.lastAdventureObjective=objective?.key;this.updateHUD();}}
if(V.Combat.active&&this.mode!=='combat'){V.Combat.active=null;V.$('#battle-root')?.remove();P.ensure().battle=null;}
};
V.Game.onKey=function(k,e){
if(this.screen==='game'&&!V.SceneEditor.active&&V.Combat.active&&V.Combat.key(k,e))return;
if(this.screen==='game'&&!V.modal&&!V.Dialogue.active&&!V.SceneEditor.active&&this.mode==='explore'){
if(k==='h'){e.preventDefault?.();S.device();return;}if(k==='c'){e.preventDefault?.();P.character();return;}if(k==='r'){e.preventDefault?.();S.pulse();return;}}
return old.key(k,e);
};
V.Game.updateHUD=function(){old.hud();if(!V.state)return;const a=P.ensure(),opening=S.objective();V.$('#player-grade').textContent='Forasteiro · nível '+a.level;if(opening){V.$('#chapter-chip').textContent='PRÓLOGO · A PRIMEIRA VIGÍLIA';V.$('#mission-name').textContent='O último portador';V.$('#mission-objective').textContent=opening.label;V.$('#tutorial-hint').hidden=true;}else if(a.story.stage==='epilogue'){V.$('#chapter-chip').textContent='EPÍLOGO';V.$('#mission-name').textContent='O arquivo continua vivo';V.$('#mission-objective').textContent='Revisite a cidade, suas fontes e suas vozes.';}else{const objective=N.objective();if(objective?.chapter){V.$('#chapter-chip').textContent='CAPÍTULO '+objective.chapter+' / 06';V.$('#mission-name').textContent=V.content.chapters[objective.chapter-1].name;V.$('#mission-objective').textContent=objective.label;}}P.hud();};
V.Quests.ready=function(id){return old.ready(id)&&P.ensure().story.interpreted.includes(id);};
V.Quests.objectives=function(id){const status=this.status(id),story=P.ensure().story;return[{label:'Investigue os 3 registros ('+status.clues+'/3)',done:status.clues===3},{label:'Escute os moradores ('+status.talked+'/2)',done:status.talked===2},{label:'Reúna os vestígios ('+(story.traces[id]||[]).length+'/3)',done:(story.traces[id]||[]).length===3},{label:'Compare fontes e contexto no Historiógrafo',done:story.interpreted.includes(id)},{label:'Restaure o sistema com a equipe',done:status.mini},{label:'Resolva o confronto por turnos ou contextualização',done:status.done}];};
V.Quests.inventory=()=>P.inventory();
V.Quests.journal=function(){
old.journal();const body=V.$('.modal-body');if(!body)return;const objective=N.objective(),top=document.createElement('div');top.className='adv-journal-tracker';top.innerHTML=`<p><strong>◇ ${V.escape(objective?.label||'Explore os registros disponíveis.')}</strong></p><div class="row"><button id="journal-track-current" class="primary">Rastrear objetivo</button><button id="journal-device" class="secondary">Abrir Historiógrafo</button><button id="journal-route-settings" class="quiet">Guia no chão</button></div>`;body.prepend(top);V.$('#journal-track-current').onclick=()=>{N.track();V.UI.close();};V.$('#journal-device').onclick=()=>S.device();V.$('#journal-route-settings').onclick=()=>N.panel();V.$$('.quest-card').forEach((card,i)=>{const b=document.createElement('button');b.className='secondary';b.textContent='Rastrear capítulo '+(i+1);b.disabled=!V.Quests.isUnlocked(i+1);b.onclick=()=>{N.track(i+1);V.UI.close();};card.appendChild(b);});
};
V.Game.map=()=>V.WorldAtlas.open();V.Atlas.regions=()=>V.WorldAtlas.open();
const snapshot=V.Atlas.snapshot.bind(V.Atlas);V.Atlas.snapshot=function(m){const canvas=snapshot(m),signature=m.id+':'+(m.geometryRevision||0);if(canvas.adventureSignature!==signature){const ctx=canvas.getContext('2d');ctx.save();ctx.scale(canvas.width/(m.width*48),canvas.height/(m.height*48));for(const wall of A.geometry(m.design).walls)A.drawWall(ctx,m,wall,{x:0,y:0});for(const light of m.design.adventure?.lights||[])E.drawFixture(ctx,light,{x:0,y:0},m);ctx.restore();canvas.adventureSignature=signature;}return canvas;};
D.document=function(maps){return{...old.document(maps),adventureVersion:3};};
D.normalise=function(doc){const clean=old.normalise(doc);for(const[id,d]of Object.entries(clean)){if(doc.maps[id]?.adventure)A.normalise(doc.maps[id].adventure,d);else if(id==='museum')A.rebuildMuseum(d);}return clean;};
D.apply=function(maps,persist=true){const result=old.apply(maps,persist);if(result.ok){N.invalidate();E.cache.clear();if(V.state)P.ensure().scenarios=D.document(this.saved);V.Save.save();}return result;};
V.Save.load=function(){const state=old.loadSave();if(state)P.migrate(state);return state;};
V.Save.save=function(){if(V.state){const a=P.ensure();if(V.Combat.active){const snap=copy(V.Combat.active);snap.effects=[];if(snap.phase==='resolving'){snap.phase='next';snap.timer=.05;}a.battle=snap;}if(Object.keys(D.saved||{}).length&&(!a.scenarios||this.adventureSceneRevision!==D.revision)){a.scenarios=D.document(D.saved);this.adventureSceneRevision=D.revision;}V.state.adventureSchema=3;}return old.save();};
V.Game.pause=function(reason=''){old.pause(reason);if(V.Combat.active){const abort=V.$('#pause-abort');if(abort){abort.textContent='Recuar deste confronto';abort.disabled=!V.Combat.active.canRetreat;abort.onclick=()=>{V.UI.close();V.Combat.cancel();};}}};
V.Game.toTitle=function(){V.$('#battle-root')?.remove();V.Access.authorized=false;S.companion=null;return old.toTitle();};
V.Game.credits=function(){old.credits();const body=V.$('.modal-body');if(body){const info=document.createElement('section');info.innerHTML=`<div class="separator"></div><h3>Historiógrafo e Guardião da Vigília</h3><p>${V.escape(V.AdventureData.culture)}</p><p>Novas ilustrações em pixel art criadas para o projeto com geração de imagens. Animações, interfaces, fontes e recortes do acervo respeitam seus manifestos locais. Áudios ambientais da expansão são sínteses originais.</p><button id="credits-zambeto" class="secondary">Ficha cultural e referências</button>`;body.prepend(info);V.$('#credits-zambeto').onclick=()=>S.culture(()=>this.credits());}};
V.Game.settings=function(){old.settings();const panel=V.$('.modal-body .two-cols');if(panel){const button=document.createElement('button');button.className='secondary';button.textContent='Iluminação, clima e relógio';button.onclick=()=>V.state?E.panel():V.UI.toast('Estas opções ficam disponíveis dentro da aventura.');panel.appendChild(button);}};
const init=V.Game.init.bind(V.Game);V.Game.init=async function(){await init();const tools=V.$('.game-toolbar .tools');if(tools){for(const[id,label,key,action]of [['historio-button','Historiógrafo','H',()=>S.device()],['character-button','Personagem','C',()=>P.character()]]){const b=document.createElement('button');b.id=id;b.innerHTML=`<img src="assets/adventure/icons/${id==='historio-button'?'device':'badge'}.png" width="28" height="28" alt=""><span>${label}</span><kbd>${key}</kbd>`;b.onclick=action;tools.appendChild(b);}}
const mini=V.$('#minimap-open');if(mini)mini.onclick=()=>V.WorldAtlas.open('local');
const tracker=V.$('#mission-tracker');if(tracker)tracker.onclick=()=>V.Quests.journal();
};
const render=V.Game.render.bind(V.Game);V.Game.render=function(ctx){if(this.screen==='game'&&this.mode==='combat'){V.Combat.render(ctx);return;}return render(ctx);};
})();
