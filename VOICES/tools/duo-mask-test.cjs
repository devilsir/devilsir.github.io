'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{environment}=require('./runtime-upgrade-test.cjs');
(async()=>{
 const e=await environment(),{V,w,canvases}=e,root=path.resolve(__dirname,'..'),out=path.join(root,'.qa/review'),results=[];
 const check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(error){results.push({name,pass:false,error:error.stack});console.error('FAIL',name,error.stack);}};
 const surface=(width=320,height=230)=>{const canvas=w.document.createElement('canvas');canvas.width=width;canvas.height=height;return{canvas,c:canvas.getContext('2d')};};
 const pixels=(canvas)=>Buffer.from(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data);
 const save=(canvas,name)=>fs.writeFileSync(path.join(out,name+'.png'),canvases.get(canvas).canvas.toBuffer('image/png'));
 await V.Game.init();V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;V.Game.newState({name:'Retratos e máscaras',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();
 const M=V.AncestralMask,D=V.DuoWorld,Q=V.DuoPanels;
 await check('Mateus portrait contains only the character even while his world nameplate is active',async()=>{
  V.World.load('harbor');await V.MapAssets.whenReady();const mateus=V.World.current.objects.find(o=>o.id==='place-life-mateus');assert(mateus);
  const previous=V.World.nearest,sign=V.WorldSigns.draw;let portraitSigns=0;V.World.nearest=mateus;
  V.WorldSigns.draw=function(c,...args){if(c.canvas.id==='place-person-portrait')portraitSigns++;return sign.call(this,c,...args);};
  try{V.PlaceLife.talk(mateus);const canvas=V.$('#place-person-portrait'),near=pixels(canvas);assert.equal(portraitSigns,0);assert(near.filter((value,index)=>index%4===3&&value>100).length>1500);save(canvas,'mateus-portrait-fixed');V.World.nearest=null;V.PlaceLife.portrait(canvas.getContext('2d'),mateus);assert.deepEqual(pixels(canvas),near);V.UI.close();}finally{V.WorldSigns.draw=sign;V.World.nearest=previous;}
 });
 await check('Atlas artwork is optically centered after its transparent padding is compensated',()=>{
  const image=V.IllustratedInterface.images.map,{c}=surface(128,128);c.drawImage(image,0,0);const rgba=c.getImageData(0,0,128,128).data;let left=128,top=128,right=0,bottom=0;
  for(let y=0;y<128;y++)for(let x=0;x<128;x++)if(rgba[(y*128+x)*4+3]>32){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
  const css=fs.readFileSync(path.join(root,'css/illustrated-interface.css'),'utf8'),rule=css.match(/\.illustrated-icon\[data-menu-icon="map"\]\{[^}]+\}/)?.[0],style=w.document.createElement('style');if(rule){style.textContent=rule;w.document.head.append(style);}
  const icon=V.$('#map-button img'),transform=w.getComputedStyle(icon).transform,shift=Number(transform.match(/translateY\((-?[\d.]+)%\)/)?.[1]||0)/100*128;
  assert(Math.abs((left+right)/2-64)<.75);assert(Math.abs((top+bottom)/2+shift-64)<.75);style.remove();
 });
 await check('the second mask has 32 transparent poses and original colors distinct from player one',()=>{
  const image=M.images.atlas2;assert(V.Assets.ready(image));assert.equal(image.naturalWidth,768);assert.equal(image.naturalHeight,1536);const {canvas,c}=surface(768,1536);c.drawImage(image,0,0);
  for(let row=0;row<8;row++)for(let col=0;col<4;col++){assert.equal(c.getImageData(col*192+2,row*192+2,1,1).data[3],0);assert(c.getImageData(col*192,row*192,192,192).data.some((v,i)=>i%4===3&&v>200));}
  const p1=surface(192,192),p2=surface(192,192);M.frame(p1.c,0,0,96,96,192,0);M.frame(p2.c,0,0,96,96,192,1);assert.notDeepEqual(pixels(p1.canvas),pixels(p2.canvas));save(p2.canvas,'mask-player-two');
 });
 const startDuo=async()=>{V.Game.toTitle();V.settings.playerCharacters=['nia','leo'];V.settings.challengePlayers=2;V.Game.newState({name:'Duas máscaras',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();await V.MapAssets.whenReady();V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();Q.closeAll();};
 await check('player two uses the new mask in both their own view and the other player view',async()=>{
  await startDuo();for(let i=0;i<2;i++)D.withActor(i,()=>{Object.assign(V.Player.data,{x:140+i*15,y:170});Object.assign(V.World.camera,{x:0,y:0});assert.equal(M.point().variant,i);});
  const record=(canvas,c)=>{const calls=[],proxy=new Proxy(c,{get(target,key){if(key==='drawImage')return(im,...args)=>{calls.push(im);return target.drawImage(im,...args);};const value=target[key];return typeof value==='function'?value.bind(target):value;},set(target,key,value){target[key]=value;return true;}});return{calls,proxy};};
  for(let i=0;i<2;i++){const {canvas,c}=surface(),{calls,proxy}=record(canvas,c);c.fillStyle='#a3b183';c.fillRect(0,0,320,230);D.withActor(i,()=>V.Player.render(proxy));assert(calls.includes(i?M.images.atlas2:M.images.atlas));assert(!calls.includes(i?M.images.atlas:M.images.atlas2));save(canvas,'duo-mask-player-'+(i+1));}
  const {canvas,c}=surface(),{calls,proxy}=record(canvas,c);D.withActor(0,()=>D.drawOther(proxy,1,V.World.camera));assert(calls.includes(M.images.atlas2));assert(!calls.includes(M.images.atlas));
 });
 await check('each investigation panel and inventory icon shows its own mask without replacing the shared toolbar',async()=>{
  for(let i=0;i<2;i++)Q.withOwner(i,()=>{const before=M.variant();V.Historio.panel();const src=V.$('.historio-object img').getAttribute('src');assert.equal(src.includes('-p2.webp'),!!i,JSON.stringify({i,before,after:M.variant(),d:D.context,q:Q.context,owner:Q.owner(),src,panels:[...M.panels].map(p=>({variant:p.variant,owner:p.canvas.closest('[data-duo-panel-player]')?.dataset.duoPanelPlayer}))}));assert.equal(V.$('.historio-mask-canvas').dataset.maskVariant,String(i));assert.equal(V.Progress.icon('historiograph').includes('-p2.webp'),!!i);});
  await Promise.resolve();M.paintPanels();V.IllustratedInterface.refresh();assert(!w.document.querySelector('#historio-button img').getAttribute('src').includes('-p2.webp'));
  const first=Q.root(0).querySelector('.historio-mask-canvas'),second=Q.root(1).querySelector('.historio-mask-canvas');assert.notDeepEqual(pixels(first),pixels(second));save(second,'duo-mask-panel-player-two');Q.closeAll();
 });
 await check('player two keeps their speaking portrait and activation independent from player one',()=>{
  V.Story.pulseTime=0;V.Engine.time=400;V.settings.reducedFlash=false;V.settings.reducedMotion=false;V.Historio.ensure().motion=true;M.tracks=new WeakMap();D.withActor(1,()=>V.Dialogue.start([{speaker:'historiograph',en:'A second memory can raise another question.',pt:'Outra memória pode trazer outra pergunta.'}]));assert.equal(V.Dialogue.viewer,1);M.uiTime=.26;M.paintPortrait();
  const canvas=V.$('#dialogue-portrait'),expected=surface(96,96);expected.c.imageSmoothingEnabled=false;M.frame(expected.c,4,Math.floor(M.uiTime*8)%4,48,48,96,1);assert(pixels(canvas).equals(pixels(expected.canvas)),'Player 2 speech must use the second pixel atlas');save(canvas,'duo-mask-speaking-player-two');V.Dialogue.finish();
  D.withActor(0,()=>{M.activate();assert.equal(M.point().row,3);});D.withActor(1,()=>{assert.notEqual(M.point().row,3);M.react('happy');assert.equal(M.point().row,7);});D.withActor(0,()=>assert.equal(M.point().row,3));
 });
 await check('mask assignment survives restored duo positions and solo always keeps the original mask',async()=>{
  V.Save.save();const state=JSON.parse(JSON.stringify(V.state));V.Game.toTitle();V.state=state;V.Game.startGame();await V.MapAssets.whenReady();for(let i=0;i<2;i++)D.withActor(i,()=>assert.equal(M.point().variant,i));
  V.Game.toTitle();V.settings.playerCharacters=['leo'];V.settings.challengePlayers=1;V.Game.newState({name:'Uma máscara',character:'leo'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();await V.MapAssets.whenReady();assert.equal(M.point().variant,0);assert(!V.Progress.icon('historiograph').includes('-p2.webp'));
 });
 fs.writeFileSync(path.join(out,'duo-mask-results.json'),JSON.stringify(results,null,2));V.MapAssets.cancel();e.dom.window.close();process.exit(results.some(r=>!r.pass)?1:0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
