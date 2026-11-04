'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{environment}=require('./runtime-upgrade-test.cjs');
(async()=>{
 const e=await environment(),{V,w,canvases}=e,out=path.resolve(__dirname,'../.qa/review'),results=[];
 fs.mkdirSync(out,{recursive:true});
 const check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(error){results.push({name,pass:false,error:error.stack});console.error('FAIL',name,error.stack);}};
 const surface=(width=192,height=192)=>{const canvas=w.document.createElement('canvas');canvas.width=width;canvas.height=height;return{canvas,c:canvas.getContext('2d')};};
 const pixels=canvas=>Buffer.from(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data);
 const save=(canvas,name)=>fs.writeFileSync(path.join(out,name+'.png'),canvases.get(canvas).canvas.toBuffer('image/png'));
 const snapshot=name=>{
  const doc=w.document.documentElement.cloneNode(true),base=w.document.createElement('base');base.href='../../';doc.querySelector('head').prepend(base);
  const originals=[...w.document.querySelectorAll('canvas')];[...doc.querySelectorAll('canvas')].forEach((canvas,index)=>{const im=w.document.createElement('img');for(const attr of canvas.attributes)im.setAttribute(attr.name,attr.value);im.src=originals[index].toDataURL();canvas.replaceWith(im);});
  doc.querySelectorAll('script').forEach(script=>script.remove());fs.writeFileSync(path.join(out,name+'.html'),'<!doctype html>'+doc.outerHTML);
 };
 await V.Game.init();V.settings.playerCharacters=['nia','leo'];V.settings.challengePlayers=2;
 V.Game.newState({name:'Galeria de máscaras',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();
 await V.MapAssets.whenReady();V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();
 const M=V.AncestralMask,D=V.DuoWorld,Q=V.DuoPanels;V.DuoTutorial.finish(0,true);V.DuoTutorial.finish(1,true);Q.closeAll();
 await check('both duo menus and headers open the wardrobe belonging to that player',async()=>{
  for(const i of [0,1]){
   const button=D.root.querySelector('[data-world-menu="historio"][data-world-player="'+i+'"]');assert(button);assert(button.querySelector('img[data-menu-icon="historio"]'));
   button.click();const root=Q.root(i);assert(root.querySelector('.historio-shell'));assert(root.querySelector('.modal-heading img[data-menu-icon="historio"]'));
   const change=root.querySelector('[data-historio-change-mask]');assert(change&&!change.disabled);assert.match(change.textContent,/Trocar máscara/);
   change.click();assert(root.querySelector('.historio-wardrobe').open);assert(!Q.has(1-i));assert.equal(root.querySelector('.historio-wardrobe').dataset.maskPlayer,String(i));
   Q.closeAll();
  }
  await Promise.resolve();V.IllustratedInterface.refresh();
  assert.match(D.root.querySelector('[data-world-menu="historio"][data-world-player="0"] img').getAttribute('src'),/historio-mask\.webp/);
  assert.match(D.root.querySelector('[data-world-menu="historio"][data-world-player="1"] img').getAttribute('src'),/historio-mask-p2\.webp/);
 });
 await check('the redundant Mask menu item is removed while the Historiographer keeps direct access',()=>{
  assert.equal(D.root.querySelectorAll('[data-world-menu="mask"]').length,0);
  D.root.querySelector('[data-world-menu="historio"][data-world-player="1"]').click();Q.root(1).querySelector('[data-historio-change-mask]').click();assert(Q.has(1));assert(!Q.has(0));
  const details=Q.root(1).querySelector('.historio-wardrobe');assert(details.open);assert.equal(w.document.activeElement,details.querySelector('summary'));
  assert.equal(details.querySelectorAll('[data-mask-model]').length,11);D.sync();snapshot('mask-access-static');Q.closeAll();
 });
 await check('all ten models have four distinct cached palettes with identical transparent silhouettes',()=>{
  assert.equal(M.models.length,10);assert.equal(M.palettes.length,4);assert(V.Assets.ready(M.images.gallery));
  const sheet=surface(192*10,192*4);sheet.c.fillStyle='#243a32';sheet.c.fillRect(0,0,1920,768);
  for(const [index,model] of M.models.entries()){
   const original=pixels(M.texture(model.id).canvas),seen=new Set();
   for(const [row,palette] of M.palettes.entries()){
    const texture=M.texture(model.id,palette.id),rgba=pixels(texture.canvas);assert.strictEqual(M.texture(model.id,palette.id),texture);seen.add(rgba.toString('base64'));
    assert.equal(rgba[3],0);assert(rgba.some((value,i)=>i%4===3&&value>200));
    for(let i=3;i<rgba.length;i+=4)assert.equal(rgba[i],original[i],model.id+' '+palette.id+' alpha');
    for(let edge=0;edge<192;edge++)for(const at of [edge,191*192+edge,edge*192,edge*192+191])assert.equal(rgba[at*4+3],0,'transparent cell border');
    sheet.c.drawImage(texture.canvas,index*192,row*192);
   }
   assert.equal(seen.size,4,model.id+' palettes');
  }
  save(sheet.canvas,'mask-styles-all-palettes');
 });
 await check('both players have all models and their own selectable original mask',()=>{
  for(let i=0;i<2;i++)Q.withOwner(i,()=>V.Historio.panel());
  assert(Q.root(0).querySelector('.historio-wardrobe'));assert.match(Q.root(0).querySelector('[data-mask-model="default"]').textContent,/Ancestral original/);
  const root=Q.root(1);assert.equal(root.querySelectorAll('[data-mask-model]').length,11);assert.equal(root.querySelectorAll('[data-mask-palette]').length,4);
  assert.equal(root.querySelector('[data-mask-model="default"]').getAttribute('aria-pressed'),'true');
  assert([...root.querySelectorAll('[data-mask-palette]')].every(button=>button.disabled));
 });
 await check('changing model and palette updates the live preview without affecting player one or evidence',()=>{
  const first=Q.root(0).querySelector('.historio-mask-canvas'),before=pixels(first),traces=JSON.stringify(V.Story.ensure().traces);
  const root=Q.root(1),details=root.querySelector('.historio-wardrobe');details.open=true;
  root.querySelector('[data-mask-model="sol-e-lua"]').click();root.querySelector('[data-mask-palette="violeta"]').click();
  assert.equal(M.appearance(1).model,'sol-e-lua');assert.equal(M.appearance(1).palette,'violeta');assert(details.isConnected&&details.open);
  assert.equal(root.querySelectorAll('[data-mask-model][aria-pressed="true"]').length,1);assert.equal(root.querySelector('[data-mask-palette="violeta"]').getAttribute('aria-pressed'),'true');
  assert.match(root.querySelector('.historio-mask-selection').textContent,/Sol e lua · Violeta/);
  assert.match(root.querySelector('.historio-mask-canvas').getAttribute('aria-label'),/Sol e lua/);
  assert(pixels(first).equals(before));assert(!pixels(root.querySelector('.historio-mask-canvas')).equals(before));
  assert.equal(JSON.stringify(V.Story.ensure().traces),traces);
  assert.equal(D.root.querySelector('[data-world-menu="historio"][data-world-player="1"] img').getAttribute('src'),M.selectedTexture(1).url);
  save(root.querySelector('.historio-mask-canvas'),'mask-styles-panel-player-two');
  // A static copy of the real DOM lets browser layout QA skip unrelated map art.
  snapshot('mask-wardrobe-static');
 });
 await check('player one changes their own appearance without overwriting player two, and invalid choices are rejected',()=>{
  const before=JSON.stringify(M.appearance(1));Q.withOwner(0,()=>assert(M.choose('felino','rubi')));assert.equal(M.appearance(0).model,'felino');assert.equal(M.appearance(0).palette,'rubi');assert.equal(JSON.stringify(M.appearance(1)),before);Q.withOwner(0,()=>M.choose('default','original'));
  Q.withOwner(1,()=>{assert.equal(M.choose('../bad'),false);assert.equal(M.choose('felino','bad'),false);});assert.equal(JSON.stringify(M.appearance(1)),before);
 });
 await check('world rendering in both views uses the selected art only for the second companion',async()=>{
  Q.closeAll();await M.ensureAnimation(M.appearance(1).model,1);const texture=M.selectedAnimation(1).canvas;
  for(const i of [0,1])D.withActor(i,()=>{
   const {canvas,c}=surface(320,230),calls=[],proxy=new Proxy(c,{get(target,key){if(key==='drawImage')return(im,...args)=>{calls.push(im);return target.drawImage(im,...args);};const value=target[key];return typeof value==='function'?value.bind(target):value;},set(target,key,value){target[key]=value;return true;}});
   Object.assign(V.Player.data,{x:130,y:150});Object.assign(V.World.camera,{x:0,y:0});V.Player.render(proxy);assert.equal(calls.includes(texture),i===1);
   if(!i){calls.length=0;D.drawOther(proxy,1,V.World.camera);assert(calls.includes(texture));}
   save(canvas,'mask-styles-world-view-'+(i+1));
  });
 });
 await check('dialogue, inventory and panel images use the chosen palette while the shared toolbar stays original',async()=>{
  D.withActor(1,()=>V.Dialogue.start([{speaker:'historiograph',en:'Every memory invites a question.',pt:'Toda memória convida a uma pergunta.'}]));
  M.uiTime=.26;M.paintPortrait();const expected=surface(96,96);expected.c.imageSmoothingEnabled=false;M.frame(expected.c,4,2,48,48,96,1);
  assert(pixels(V.$('#dialogue-portrait')).equals(pixels(expected.canvas)));save(V.$('#dialogue-portrait'),'mask-styles-dialogue');V.Dialogue.finish();
  Q.withOwner(1,()=>{V.Historio.panel();assert.equal(V.$('.historio-object img').getAttribute('src'),M.selectedTexture(1).url);assert(V.Progress.icon('historiograph').includes(M.selectedTexture(1).url));});
  await Promise.resolve();V.IllustratedInterface.refresh();assert.match(w.document.querySelector('#historio-button img').getAttribute('src'),/historio-mask\.webp/);
 });
 await check('cosmetic selection survives a save, a restored duo and reopening the gallery',async()=>{
  const chosen=JSON.stringify(M.appearance(1));V.Save.save();const state=V.Save.load();assert.equal(JSON.stringify(state.maskAppearance.player2),chosen);
  V.Game.toTitle();V.state=state;V.Game.startGame();await V.MapAssets.whenReady();Q.closeAll();
  assert.equal(JSON.stringify(M.appearance(1)),chosen);D.root.querySelector('[data-world-menu="historio"][data-world-player="1"]').click();Q.root(1).querySelector('[data-historio-change-mask]').click();assert(Q.root(1).querySelector('.historio-wardrobe').open);
  assert.equal(Q.root(1).querySelector('[data-mask-model="sol-e-lua"]').getAttribute('aria-pressed'),'true');
  assert.equal(Q.root(1).querySelector('[data-mask-palette="violeta"]').getAttribute('aria-pressed'),'true');
 });
 await check('reduced motion preserves the exact selected static art and returning to the original restores the atlas',()=>{
  V.settings.reducedMotion=true;const actual=surface(),expected=surface();
  M.frame(actual.c,4,2,96,96,192,1);expected.c.drawImage(M.selectedTexture(1).canvas,0,0);assert(pixels(actual.canvas).equals(pixels(expected.canvas)));
  Q.withOwner(1,()=>assert(M.choose('default')));assert.equal(M.selectedTexture(1),null);assert.match(M.path('portrait',1),/historiograph-mask-p2\.webp/);V.settings.reducedMotion=false;
 });
 await check('two simultaneous custom masks render, speak and restore independently',async()=>{
  Q.withOwner(0,()=>M.choose('plumagem','turquesa'));Q.withOwner(1,()=>M.choose('caveira','violeta'));
  await Promise.all([M.ensureAnimation('plumagem',0),M.ensureAnimation('caveira',1)]);
  assert.equal(M.appearance(0).model,'plumagem');assert.equal(M.appearance(1).model,'caveira');
  for(const owner of [0,1]){
   const source=M.selectedAnimation(owner).canvas,actual=surface(),expected=surface();actual.c.imageSmoothingEnabled=expected.c.imageSmoothingEnabled=false;
   M.frame(actual.c,4,2,96,96,192,owner);expected.c.drawImage(source,384,768,192,192,0,0,192,192);assert(pixels(actual.canvas).equals(pixels(expected.canvas)));
   D.withActor(owner,()=>V.Dialogue.start([{speaker:'historiograph',en:'My own mask.',pt:'Minha própria máscara.'}]));M.uiTime=.26;M.paintPortrait();
   const portrait=V.$('#dialogue-portrait'),reference=surface(96,96);reference.c.imageSmoothingEnabled=false;M.frame(reference.c,4,2,48,48,96,owner);assert(pixels(portrait).equals(pixels(reference.canvas)));V.Dialogue.finish();
  }
  V.Save.save();const state=V.Save.load();assert.equal(state.maskAppearance.player1.model,'plumagem');assert.equal(state.maskAppearance.player2.model,'caveira');
  V.Game.toTitle();V.state=state;V.Game.startGame();await V.MapAssets.whenReady();for(const owner of [0,1]){Q.withOwner(owner,()=>V.Historio.panel());assert.equal(Q.root(owner).querySelector('.historio-wardrobe').dataset.maskPlayer,String(owner));assert(M.selectedAnimation(owner));}snapshot('mask-both-static');Q.closeAll();
 });
 await check('legacy cosmetics fall back safely and solo supports changing and saving a mask',async()=>{
  V.state.maskAppearance={player2:{model:'removed',palette:'removed'}};assert.equal(M.appearance(1).model,'default');assert.equal(M.appearance(1).palette,'original');
  V.Game.toTitle();V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;V.Game.newState({name:'Uma máscara',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});
  V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();V.Onboarding.active=false;V.Onboarding.suspended=true;V.Historio.panel();assert(V.$('.historio-wardrobe'));assert.equal(M.point().variant,0);assert(!V.$('[data-historio-change-mask]').disabled);
  V.$('[data-historio-change-mask]').click();assert(V.$('.historio-wardrobe').open);V.$('[data-mask-model="hibisco"]').click();V.$('[data-mask-palette="rubi"]').click();await M.ensureAnimation('hibisco',0);assert.equal(M.appearance(0).model,'hibisco');assert.equal(M.appearance(0).palette,'rubi');assert(M.selectedAnimation(0));assert(!V.state.maskAppearance.player2);V.Save.save();const state=V.Save.load();assert.equal(state.maskAppearance.player1.model,'hibisco');
  V.Game.toTitle();V.state=state;V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();V.Historio.panel();assert.equal(M.appearance(0).model,'hibisco');assert.equal(V.$('[data-mask-model="hibisco"]').getAttribute('aria-pressed'),'true');snapshot('mask-solo-static');
 });
 await check('Clara keeps her original appearance without a task block covering her face',async()=>{
  V.UI.close();V.World.load('harbor');await V.MapAssets.whenReady();
  const clara=V.World.current.objects.find(o=>o.person==='clara-port');assert.equal(clara.character,'viviane');assert(!clara.uniformSprite);
  Object.assign(clara,{action:'working',dir:0,walking:false,walkClock:0,greeting:0});
  const {canvas,c}=surface(384,256);c.fillStyle='#829363';c.fillRect(0,0,384,256);V.World.nearest=clara;V.Maritime.drawObject(c,clara,{x:clara.x-192,y:clara.y-200});save(canvas,'clara-fixed');
  const expected=surface(384,256);expected.c.fillStyle='#829363';expected.c.fillRect(0,0,384,256);V.Assets.sprite(expected.c,clara.character,192,200,4,0,64);
  assert(Buffer.from(c.getImageData(180,152,24,32).data).equals(Buffer.from(expected.c.getImageData(180,152,24,32).data)),'Clara face must remain unobscured by task decorations');
 });
 fs.writeFileSync(path.join(out,'mask-styles-results.json'),JSON.stringify(results,null,2));V.MapAssets.cancel();e.dom.window.close();process.exit(results.some(r=>!r.pass)?1:0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
