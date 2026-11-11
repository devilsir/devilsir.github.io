/* Integration checks run the actual classic scripts with a native Canvas. */
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const {JSDOM}=require('jsdom');
const native=require('@napi-rs/canvas');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=require('./runtime-files.cjs').manifest(html).scripts.map(url=>url.split('?')[0]);
const timers=new Set();
async function environment(options={}){
 if(typeof options==='boolean')options={child:options};const child=options.child;
 const dom=new JSDOM(html,{url:'http://voices.local/'+(child?'?voices-duo='+options.token+'&player='+(options.index||0):''),runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,images=new WeakMap(),canvases=new WeakMap();
 if(options.ready)Object.defineProperty(w.document,'readyState',{configurable:true,value:'complete'});
 // This harness starts at runtime preparation; cold-title behavior has its own suite.
 w.document.querySelector('#loading').hidden=false;
 if(child)Object.defineProperty(w,'parent',{configurable:true,value:options.parent});
 w.requestAnimationFrame=callback=>callback.name==='frame'||/\.tick\(/.test(String(callback))?1:w.setTimeout(()=>callback(w.performance.now()),0);w.cancelAnimationFrame=id=>w.clearTimeout(id);
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.ResizeObserver=class{observe(){}disconnect(){}};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLElement.prototype.setPointerCapture=function(){};
 w.HTMLElement.prototype.hasPointerCapture=function(){return false;};
 w.HTMLElement.prototype.getBoundingClientRect=function(){const width=this.width||960,height=this.height||540;return{x:0,y:0,left:0,top:0,right:width,bottom:height,width,height};};
 w.HTMLElement.prototype.getClientRects=function(){return this.hidden?[]:[this.getBoundingClientRect()];};
 w.ImageData=native.ImageData;w.Path2D=native.Path2D;w.DOMMatrix=native.DOMMatrix;
 w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};
 w.Audio=class{constructor(){this.volume=0;this.muted=true;this.currentTime=0;this.paused=true;}play(){return Promise.resolve();}pause(){}load(){}canPlayType(){return'';}cloneNode(){return new w.Audio();}addEventListener(){}removeEventListener(){}};
 w.fetch=async url=>{const p=path.join(root,new URL(url,'http://voices.local/').pathname);const value=fs.readFileSync(p,'utf8');return{ok:true,json:async()=>JSON.parse(value),text:async()=>value};};
 const on=w.document.addEventListener.bind(w.document);w.document.addEventListener=(type,...args)=>{if(type!=='DOMContentLoaded')return on(type,...args);};
 const imageSrc=Object.getOwnPropertyDescriptor(w.HTMLImageElement.prototype,'src');
 Object.defineProperty(w.HTMLImageElement.prototype,'src',{configurable:true,get(){return this._source||'';},set(value){imageSrc.set.call(this,value);this._source=new URL(value,w.document.baseURI).href;const p=this._source.startsWith('data:')?Buffer.from(this._source.split(',')[1],this._source.includes(';base64,')?'base64':'utf8'):path.join(root,decodeURIComponent(new URL(this._source).pathname));native.loadImage(p).then(im=>{images.set(this,im);this.dispatchEvent(new w.Event('load'));}).catch(error=>{console.error('IMAGE',String(p).slice(0,150),error.message);this.dispatchEvent(new w.Event('error'));});}});
 for(const key of ['naturalWidth','naturalHeight','width','height','complete'])Object.defineProperty(w.HTMLImageElement.prototype,key,{configurable:true,get(){const im=images.get(this);return key==='complete'?!!im:(key.toLowerCase().includes('width')?im?.width:im?.height)||0;},set(){}});
 const canvasSize={width:Object.getOwnPropertyDescriptor(w.HTMLCanvasElement.prototype,'width'),height:Object.getOwnPropertyDescriptor(w.HTMLCanvasElement.prototype,'height')};
 for(const dim of ['width','height'])Object.defineProperty(w.HTMLCanvasElement.prototype,dim,{configurable:true,get(){return canvasSize[dim].get.call(this);},set(n){canvasSize[dim].set.call(this,n);const entry=canvases.get(this);if(entry)entry.canvas[dim]=n;}});
 w.HTMLCanvasElement.prototype.getContext=function(){if(!canvases.has(this)){const canvas=native.createCanvas(this.width||300,this.height||150),context=canvas.getContext('2d'),element=this;const proxy=new Proxy(context,{get(target,key){if(key==='canvas')return element;if(key==='drawImage'||key==='createPattern')return(img,...args)=>{const source=canvases.get(img)?.canvas||images.get(img)||img;if(!source)return;return target[key](source,...args);};const value=target[key];return typeof value==='function'?value.bind(target):value;},set(target,key,value){target[key]=value;return true;}});canvases.set(this,{canvas,context:proxy});}return canvases.get(this).context;};
 w.HTMLCanvasElement.prototype.toDataURL=function(){this.getContext('2d');return canvases.get(this).canvas.toDataURL('image/png');};
 const definition=require('./runtime-files.cjs').manifest(options.bundle?fs.readFileSync(path.join(root,'dist/index.html'),'utf8'):html);
 if(!options.bundle)w.eval(fs.readFileSync(path.join(root,definition.bootstrap),'utf8'));
 const entries=options.bundle?definition.scripts.map(url=>'dist/'+url.split('?')[0]):[...scripts];
 if(options.moduleOrder==='reverse')entries.reverse();
 for(const file of entries){try{w.eval(fs.readFileSync(path.join(root,file),'utf8')+'\n//# sourceURL='+file);}catch(e){throw Error(file+': '+e.stack);}}
 w.VoicesModules.start(options.moduleOrder==='reverse'?[...definition.modules].reverse():definition.modules);
 return{dom,w,V:w.V,canvases};
}
async function run(){
 const bundled=process.argv.includes('--bundle');
 const {dom,w,V,canvases}=await environment({bundle:bundled,ready:bundled});
 // Menus in duo mode must be queried from the viewer that owns their DOM.
 const results=[],check=(name,test)=>{try{if(V.DuoPanels?.enabled())V.DuoPanels.withOwner(0,test);else test();results.push({name,pass:true});}catch(error){results.push({name,pass:false,error:error.stack});console.error(name,error.stack);}};
 const surface=()=>{const el=w.document.createElement('canvas');el.width=960;el.height=540;const c=el.getContext('2d');return{c,canvas:canvases.get(el).canvas};};
 await V.Game.init();
 console.log('Runtime initialized',JSON.stringify({maps:Object.keys(V.World.maps).length,assets:V.AssetLoader.records.size,deferred:[...V.AssetLoader.records].filter(r=>r.state==='deferred').length}));
 if(bundled){const studio=V.ProfessorStudio,walk=studio.walkNodes;let observed=0;studio.walkNodes=function(...args){observed++;return walk.apply(this,args);};studio.editing=true;const marker=w.document.createElement('span');marker.textContent='Verificação de inicialização tardia';V.$('#app').append(marker);await Promise.resolve();check('professor tools observe content when scripts load after the document is ready',()=>{assert(V.$('#professor-studio'));assert(observed>0);});studio.walkNodes=walk;studio.editing=false;marker.remove();}
 check('new profiles offer two characters',()=>{V.PlayerProfiles.form();assert(w.document.querySelector('#profile-player-count'));const count=V.$('#profile-player-count');count.value='2';count.onchange();V.$('[data-profile-character="leo"]').click();assert.match(V.$('[data-profile-slot="leo"]').textContent,/Jogador 2/);});
 V.UI.close();V.settings.playerCharacters=['nia','leo'];V.settings.challengePlayers=2;V.Game.newState({name:'Teste da dupla',character:'nia'});V.state.flags.prologueDone=true;V.state.flags.prologueStarted=true;V.Game.startGame();
 const guard=setTimeout(()=>{console.error('MAP_TIMEOUT',JSON.stringify([...V.MapAssets.tasks].map(t=>({label:t.label,rows:t.rows.filter(r=>r.state!=='loaded').map(r=>({key:r.key,state:r.state,attempt:r.attempt}))}))));process.exit(1);},20000);
 await V.MapAssets.whenReady();clearTimeout(guard);V.UI.close();V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();
 check('two characters persist on state',()=>assert.deepEqual(Array.from(V.state.playerCharacters),['nia','leo']));
 check('phrase translation defaults on and retains words',()=>{V.Dialogue.lines=[{speaker:'pix',en:'Hello! I am PIX.',pt:'Olá! Eu sou PIX.'}];V.Dialogue.index=0;V.Dialogue.currentText='Hello! I am PIX.';V.$('#dialogue-root').innerHTML='<div id="dialogue-pt"></div>';V.Dialogue.translate();assert.match(V.$('#dialogue-pt').textContent,/Olá! Eu sou PIX/);assert(V.$('.pix-word-support')||V.$('.pix-words-empty'));V.settings.phraseTranslation=false;V.Dialogue.translate();assert(!V.$('.pix-phrase-support'));V.settings.phraseTranslation=true;});
 check('dialogue setting is editable',()=>{V.Game.settings();assert(V.$('#s-phrase-translation').checked);V.UI.close();});
 check('all catalog entries expose duo',()=>{for(const item of V.ChallengeCatalog.items()){if(item.kind==='fish')continue;V.ChallengeCatalog.detail(item.key);assert(V.$('#duo-choice'),item.key);V.UI.close();}});
 check('duo physical input is routed to one viewer only',()=>{const sent=[],send=V.DuoChallenges.send;V.DuoChallenges.send=(i,m)=>sent.push({i,m});V.DuoChallenges.active=true;V.DuoChallenges.physical('KeyW',true);V.DuoChallenges.physical('ArrowUp',true);V.DuoChallenges.physical('Enter',false);V.DuoChallenges.active=false;V.DuoChallenges.send=send;assert.deepEqual(sent.map(x=>x.i),[0,1,1]);});
 check('museum has separate cases and four nonplayable panels',()=>{const m=V.World.maps['play-museum'];assert.equal(m.height,44);assert.equal(m.objects.filter(o=>o.caseExhibit).length,6);assert.equal(m.objects.filter(o=>o.playHistory).length,4);assert.equal(V.AfricanPlayData.exhibits.length,6);V.PlayMuseum.catalog();assert.equal(V.$$('[data-play-history]').length,4);V.PlayMuseum.historyExhibit('peteca');assert(!V.$('#play-exhibit-start'));V.UI.close();});
 const outDir=path.join(root,'.qa/review');fs.mkdirSync(outDir,{recursive:true});
 for(const id of V.AfricanPlay.ids){
  await V.AfricanPlayArt.ensure();const controller=V.Playground.controllers[id],r={id:'test-'+id,game:id,training:false,score:0,moves:0,mistakes:0,combo:0,bestCombo:0,elapsed:1,calm:true,translations:true,hints:0,feedback:'',data:controller.create(false,0)};
  V.Playground.active=r;V.Game.mode='minigame';V.Playground.mount();controller.update(r,.02);
  check('native sprites and gameplay render · '+id,()=>{const{canvas,c}=surface();controller.draw(c,r);fs.writeFileSync(path.join(outDir,id+'.png'),canvas.toBuffer('image/png'));});
  if(id==='ampe')check('Ampe only reveals after foot choice',()=>{assert.equal(r.data.phase,'clap');controller.action(r,'ampe-clap');assert.equal(r.data.playerFoot,null);controller.action(r,'ampe-foot',0);assert.equal(r.data.phase,'reveal');assert.equal(r.data.reveal,2.4);const{c,canvas}=surface();controller.draw(c,r);fs.writeFileSync(path.join(outDir,'ampe-reveal.png'),canvas.toBuffer('image/png'));assert.equal(V.AfricanPlay.ampeResult(1,0,0).scorer,0);assert.equal(V.AfricanPlay.ampeResult(1,0,1).scorer,null);});
  if(id==='matacuzana')check('Matacuzana catch window matches the hand',()=>{controller.action(r,'stone-main');controller.action(r,'stone-pick');controller.update(r,2);assert(r.data.air/r.data.duration>=.9);controller.action(r,'stone-main');assert.equal(r.data.hits,1);});
  V.Playground.detach();V.UI.close();
 }
 check('home furniture interaction uses a real marker',()=>{const id=V.Homestead.data.offers[0].id,h=V.Homestead.ensure();if(!h.owned.includes(id))h.owned.push(id);const m=V.World.maps[id],item=V.Homestead.catalog.find(i=>i.solid!==false);h.placed[id]=[{id:'test-furniture',item:item.id,x:300,y:300,rotation:0}];const o={id:'test-furniture-object',type:'cozy',playerFurniture:'test-furniture',homeMap:id,furnitureItem:item.id,x:300,y:300,scene:{family:item.family,prop:item.prop}};V.World.nearest=o;V.Cozy.drawObject(surface().c,o,{x:0,y:0},0);});
 check('construction editor shows walls and add tools',()=>{const id=V.Homestead.data.offers[0].id;V.Homestead.organize(id);assert(V.$('#home-build'));V.$('#home-build').click();assert.equal(V.$$('[data-build-tool]').length,4);const canvas=V.$('#home-build-plan');assert(canvas);fs.writeFileSync(path.join(outDir,'home-plan.png'),canvases.get(canvas).canvas.toBuffer('image/png'));V.UI.close();});
 check('construction persists and restores',()=>{const id=V.Homestead.data.offers[0].id,original=V.HomeConstruction.snapshot(id),d=JSON.parse(JSON.stringify(V.Cozy.layouts[id]));assert(V.HomeConstruction.commit(id,d));V.HomeConstruction.restore();assert.equal(V.HomeConstruction.snapshot(id).construction.rooms.length,original.construction.rooms.length);});
 check('walls, windows and internal doors survive a save',()=>{const id=V.Homestead.data.offers[0].id,d=JSON.parse(JSON.stringify(V.Cozy.layouts[id])),r=d.construction.rooms[0],b=V.Rooms.box(r.polygon),wall={id:'test-home-wall',a:[b.x+48,b.y+48],b:[b.x+288,b.y+48]};r.walls.push(wall);const door=V.Rooms.doorAt(d,{x:b.x+228,y:b.y+48},{width:48,name:'Porta de teste',homeInternal:true});d.construction.doors.push(door);d.homeWindows=[{id:'test-home-window',room:r.id,wall:wall.id,u:.25,x:b.x+108,y:b.y+48,width:40}];V.HomeConstruction.commit(id,d);assert(V.Homestead.ensure().constructionEdits[id].windows.length===1);assert(V.World.maps[id].objects.some(o=>o.type==='home-window'));const installed=V.World.maps[id].objects.find(o=>o.door?.id===door.id);assert(installed);V.Rooms.transition(installed.door);assert(installed.door.openUntil>V.Rooms.clock);});
 check('image streaming defers other characters and battle art',()=>{assert([...V.AssetLoader.records].some(r=>r.group==='actor:sol'&&r.state==='deferred'));assert([...V.AssetLoader.records].some(r=>r.group==='combat'&&r.state==='deferred'));});
 fs.writeFileSync(path.join(outDir,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 V.MapAssets.cancel();dom.window.close();process.exitCode=results.some(r=>!r.pass)?1:0;
}
module.exports={environment};
if(require.main===module)run().then(()=>process.exit(process.exitCode||0)).catch(error=>{console.error(error.stack);process.exit(1);});
