'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{environment}=require('./runtime-upgrade-test.cjs');
(async()=>{
 const e=await environment(),{V,w,canvases}=e,out=path.resolve(__dirname,'../.qa/review'),results=[];
 const check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(error){results.push({name,pass:false,error:error.stack});console.error('FAIL',name,error.stack);}};
 const surface=(width=192,height=192)=>{const canvas=w.document.createElement('canvas');canvas.width=width;canvas.height=height;return{canvas,c:canvas.getContext('2d')};};
 const pixels=canvas=>Buffer.from(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data);
 const crop=(image,row,col)=>{const s=surface();s.c.imageSmoothingEnabled=false;s.c.drawImage(image,col*192,row*192,192,192,0,0,192,192);return s;};
 await V.Game.init();const M=V.AncestralMask,D=V.DuoWorld,Q=V.DuoPanels;
 await check('all ten new animation sheets are deferred while both original atlases stay ready',()=>{
  assert(V.Assets.ready(M.images.atlas)&&V.Assets.ready(M.images.atlas2));
  for(const model of M.models){const record=V.AssetLoader.byImage.get(M.images['animation:'+model.id]);assert.equal(record.group,'mask-style:'+model.id);assert.equal(record.state,'deferred');}
 });
 V.settings.playerCharacters=['nia','leo'];V.settings.challengePlayers=2;V.Game.newState({name:'Animações das máscaras',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();
 await V.MapAssets.whenReady();V.DuoTutorial.finish(0,true);V.DuoTutorial.finish(1,true);Q.closeAll();V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();
 await check('choosing a model loads its own sheet once and leaves the other nine deferred',async()=>{
  Q.withOwner(1,()=>{V.Historio.panel();assert(M.choose('plumagem'));});
  const pending=M.ensureAnimation('plumagem');assert.strictEqual(M.ensureAnimation('plumagem'),pending);assert(await pending);
  assert(V.Assets.ready(M.images['animation:plumagem']));
  for(const model of M.models.slice(1))assert.equal(V.AssetLoader.byImage.get(M.images['animation:'+model.id]).state,'deferred');
 });
 await check('every model contains 32 drawn frames with clear borders, blinks, mouth articulation and two actual perspectives',async()=>{
  for(const model of M.models){
   assert(await M.ensureAnimation(model.id));const image=M.images['animation:'+model.id];assert.equal(image.naturalWidth,768);assert.equal(image.naturalHeight,1536);
   const signatures=[];
   for(let row=0;row<8;row++)for(let col=0;col<4;col++){
    const {canvas,c}=crop(image,row,col),rgba=pixels(canvas);signatures.push(rgba.toString('base64'));
    assert(rgba.some((value,index)=>index%4===3&&value>200),model.id+' nonempty pose');
    for(let edge=0;edge<192;edge++)for(const at of [edge,191*192+edge,edge*192,edge*192+191])assert.equal(rgba[at*4+3],0,model.id+' clear frame borders');
    // Facial changes must exist in actual bitmap pixels, independently of transforms.
    if(row===0&&col===2)assert(!Buffer.from(c.getImageData(55,75,82,65).data).equals(Buffer.from(crop(image,0,0).c.getImageData(55,75,82,65).data)),model.id+' painted blink');
    if(row===4&&col===2)assert(!Buffer.from(c.getImageData(55,105,82,65).data).equals(Buffer.from(crop(image,4,0).c.getImageData(55,105,82,65).data)),model.id+' painted speech');
   }
   assert(new Set(signatures).size>=24,model.id+' varied painted frames');assert.notEqual(signatures[4],signatures[8],model.id+' left/right perspectives');
  }
 });
 await check('all four palettes retain every painted pose and alpha, with a bounded recolor cache',()=>{
  for(const model of M.models){
   const image=M.images['animation:'+model.id],base=surface(768,1536);base.c.drawImage(image,0,0);const rgba=pixels(base.canvas),seen=new Set();
   for(const palette of M.palettes){
    const texture=M.animationTexture(model.id,palette.id),s=surface(768,1536);s.c.drawImage(texture.canvas,0,0);const recolored=pixels(s.canvas);seen.add(recolored.toString('base64'));
    for(let index=3;index<rgba.length;index+=4)assert.equal(recolored[index],rgba[index],model.id+' '+palette.id+' alpha');
    assert(!pixels(crop(texture.canvas,0,0).canvas).equals(pixels(crop(texture.canvas,0,2).canvas)));
    assert(!pixels(crop(texture.canvas,4,0).canvas).equals(pixels(crop(texture.canvas,4,2).canvas)));
    assert(M.animationTextures.size<=M.animationCacheLimit);
   }
   assert.equal(seen.size,4,model.id+' four animated palettes');
  }
 });
 await check('frame rendering samples the requested painted atlas cell without warping the face',()=>{
  for(const model of M.models)for(const palette of M.palettes){
   Q.withOwner(1,()=>M.choose(model.id,palette.id));const image=M.selectedAnimation(1).canvas;
   for(let row=0;row<8;row++)for(let col=0;col<4;col++){
    const actual=surface();actual.c.imageSmoothingEnabled=false;M.frame(actual.c,row,col,96,96,192,1);
    assert(pixels(actual.canvas).equals(pixels(crop(image,row,col).canvas)),model.id+' '+palette.id+' row '+row+' col '+col);
   }
  }
 });
 await check('the chosen atlas animates in the investigation panel and speaking portrait while the world clock is paused',()=>{
  Q.withOwner(1,()=>{M.choose('caveira','turquesa');V.Historio.panel();});const panel=Q.root(1).querySelector('.historio-mask-canvas');
  M.uiTime=1;M.paintPanels();const open=pixels(panel),worldTime=V.Engine.time;M.uiTime=4.14;M.paintPanels();assert(!pixels(panel).equals(open));assert.equal(V.Engine.time,worldTime);
  D.withActor(1,()=>V.Dialogue.start([{speaker:'historiograph',en:'A living memory needs questions.',pt:'Uma memória viva precisa de perguntas.'}]));
  M.uiTime=0;M.paintPortrait();const portrait=V.$('#dialogue-portrait'),first=pixels(portrait);M.uiTime=.26;M.paintPortrait();assert(!pixels(portrait).equals(first));
  fs.writeFileSync(path.join(out,'mask-animated-dialogue-caveira.png'),canvases.get(portrait).canvas.toBuffer('image/png'));V.Dialogue.finish();
 });
 await check('activation and reactions stay independent, and reduced flash or motion suppresses the appropriate frames',()=>{
  V.Engine.time=400;M.tracks=new WeakMap();V.Story.pulseTime=0;V.settings.reducedFlash=false;V.settings.reducedMotion=false;
  D.withActor(1,()=>{M.activate();assert.equal(M.point().row,3);V.settings.reducedFlash=true;assert.equal(M.point().row,0);V.settings.reducedFlash=false;});
  D.withActor(0,()=>assert.notEqual(M.point().row,3));V.Engine.time+=2;
  D.withActor(1,()=>{M.react('happy');assert.equal(M.point().row,7);});D.withActor(0,()=>assert.notEqual(M.point().row,7));
  V.settings.reducedMotion=true;const actual=surface();M.frame(actual.c,4,2,96,96,192,1);assert(pixels(actual.canvas).equals(pixels(crop(M.selectedAnimation(1).canvas,0,0).canvas)));V.settings.reducedMotion=false;
 });
 await check('saved cosmetics restore their animated sheet and both original companions remain unchanged',async()=>{
  V.Save.save();const state=V.Save.load();Q.closeAll();V.Game.toTitle();V.state=state;V.Game.startGame();await V.MapAssets.whenReady();
  assert.equal(M.appearance(1).model,'caveira');assert.equal(M.appearance(1).palette,'turquesa');assert(M.selectedAnimation(1));
  const first=surface();M.frame(first.c,0,0,96,96,192,0);assert(pixels(first.canvas).equals(pixels(crop(M.images.atlas,0,0).canvas)));
  Q.withOwner(1,()=>M.choose('default'));assert.equal(M.selectedAnimation(1),null);const second=surface();M.frame(second.c,0,0,96,96,192,1);assert(pixels(second.canvas).equals(pixels(crop(M.images.atlas2,0,0).canvas)));
 });
 fs.writeFileSync(path.join(out,'mask-animations-results.json'),JSON.stringify(results,null,2));V.MapAssets.cancel();e.dom.window.close();process.exit(results.some(result=>!result.pass)?1:0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
