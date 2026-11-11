'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{environment}=require('./runtime-upgrade-test.cjs');
const root=path.resolve(__dirname,'..');
async function run(){
 const e=await environment(),{V,w,canvases}=e,P=V.Performance,R=V.RenderView,results=[],reports=[];
 const check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS '+name);}catch(error){results.push({name,pass:false,error:error.stack});console.error('FAIL '+name,error.stack);}};
 const surface=(width=720,height=480)=>{const el=w.document.createElement('canvas');el.width=width;el.height=height;const c=el.getContext('2d');return{el,c,bitmap:canvases.get(el).canvas};};
 const setMobile=(memory=4,cores=4)=>{
  w.matchMedia=q=>({matches:q.includes('pointer: coarse'),addEventListener(){},removeEventListener(){}});
  for(const[key,value]of Object.entries({maxTouchPoints:5,deviceMemory:memory,hardwareConcurrency:cores}))Object.defineProperty(w.navigator,key,{configurable:true,value});
  P.detect();P.configure();
 };
 try{
  await check('desktop keeps the existing viewport and loading budgets',()=>{assert(!P.mobile);assert.equal(P.fps,60);assert.deepEqual({...P.canvasSize(1920,1080)},{width:1920,height:1080});});
  setMobile();
  await V.Game.init();V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;V.Game.newState({name:'Celular',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();
  await check('a low-memory touch device receives bounded decoding and cache budgets',()=>{assert(P.mobile);assert(P.lowMemory);assert.equal(P.fps,30);assert.equal(V.AssetLoader.limit,4);assert(V.AssetLoader.peak<=4);assert.equal(V.MapAssets.groundBudget,24*1024*1024);assert.equal(V.SceneShadows.budget,8*1024*1024);assert(w.document.documentElement.classList.contains('mobile-performance'));assert.equal(V.Assets.errors.length,0);});
  await check('portrait, landscape and both duo views obey the mobile pixel budget',()=>{for(const[width,height]of [[390,844],[844,390],[1024,1366],[2000,1800]]){const fit=V.Viewport.fit(width,height);assert(fit.width*fit.height<=P.canvasPixels);assert(Math.abs(fit.width/fit.height-width/height)<.02);const duo=P.canvasSize(width,height,true);assert(duo.width*duo.height<=P.canvasPixels/2);assert(duo.width>=2&&duo.height>=2);}});
  await check('visibility handles zoomed and translated atlas canvases and large edge objects',()=>{const{c}=surface(300,200);c.translate(20,10);c.scale(.1,.1);const b=R.bounds(c,{x:500,y:200});for(const[key,value]of Object.entries({left:300,top:100,right:3300,bottom:2100}))assert(Math.abs(b[key]-value)<.001);assert(R.visible({x:3200,y:2000},b));assert(!R.visible({x:7000,y:9000},b));assert(R.visible({x:3500,y:1100,w:400,h:600},b));assert(R.visible({x:-1000,y:-1000,bounds:{x:3100,y:1900,w:600,h:600}},b));});

  const{el,c,bitmap}=surface();let draws=0;
  const context=new Proxy(c,{get(t,k){if(k==='drawImage')return(...args)=>{draws++;return t.drawImage(...args);};return t[k];},set(t,k,value){t[k]=value;return true;}});
  for(const id of ['hub','nature-cerrado','nature-savanna','animal-museum']){
   await check('culling preserves visible artwork and depth in '+id,async()=>{
    V.World.load(id);await V.MapAssets.whenReady();V.UI.close();V.World.transition=0;V.World.camera=V.Viewport.target(V.World.current,V.Player.data);
    const objects=R.objects,decor=R.decor;
    try{R.objects=(ctx,m)=>m.objects;R.decor=(ctx,m)=>m.decor;V.Game.render(c);}finally{R.objects=objects;R.decor=decor;}
    const full=Buffer.from(bitmap.getContext('2d').getImageData(0,0,el.width,el.height).data);V.Game.render(c);
    const culled=Buffer.from(bitmap.getContext('2d').getImageData(0,0,el.width,el.height).data);assert.deepEqual(culled,full);
    const m=V.World.current,visible=R.objects(c,m,V.World.camera).length;assert(visible<m.objects.length);
    for(let i=0;i<3;i++){V.Engine.time+=1/60;V.Game.update(1/60);V.Game.render(context);}draws=0;let update=0,render=0;
    for(let i=0;i<20;i++){V.Engine.time+=1/60;let start=performance.now();V.Game.update(1/60);update+=performance.now()-start;start=performance.now();V.Game.render(context);render+=performance.now()-start;}
    reports.push({id,objects:m.objects.length,visible,drawsPerFrame:draws/20,updateMs:update/20,renderMs:render/20,groundMiB:m.cache.width*m.cache.height*4/1048576});
   });
  }
  await check('a complete zoomed biome preview retains every object',()=>{const m=V.World.maps['nature-cerrado'],s=surface(640,480);s.c.scale(s.el.width/(m.width*48),s.el.height/(m.height*48));assert.equal(R.objects(s.c,m,{x:0,y:0}).length,m.objects.length);});
  await check('lighting uses a quarter of the mask pixels and still covers the whole scene',()=>{const s=surface(640,360),E=V.Environment,preview=E.preview,blend=E.ambientBlend;try{E.preview={hour:22};E.ambientBlend=0;E.lighting(s.c,V.World.current,V.World.camera);assert.equal(E.mask.width,320);assert.equal(E.mask.height,180);const mask=canvases.get(E.mask).canvas.getContext('2d');assert(mask.getImageData(0,0,1,1).data[3]>0);assert(mask.getImageData(319,179,1,1).data[3]>0);assert.equal(s.c.getTransform().a,1);}finally{E.preview=preview;E.ambientBlend=blend;}});
  await check('the minimap avoids duplicate work and skips hidden HUDs',()=>{const A=V.Atlas,paint=A.paint,box=V.$('#minimap-box'),hidden=box.hidden;let count=0;try{box.hidden=false;A.paint=()=>count++;A.lastMini=0;for(let i=0;i<30;i++)A.minimap();assert.equal(count,1);box.hidden=true;A.lastMini=0;A.minimap();assert.equal(count,1);}finally{A.paint=paint;box.hidden=hidden;}});
  await check('map thumbnails and inactive ground canvases have bounded retention',()=>{
   const A=V.Atlas,ground=V.Cozy.ground,originalMap=V.World.current,maps=V.World.maps,budget=V.MapAssets.groundBudget,base=maps.hub;
   try{A.cache.clear();V.Cozy.ground=m=>{const s=surface(96,96);s.c.fillStyle='#829373';s.c.fillRect(0,0,96,96);m.cache=s.el;};for(let i=0;i<10;i++){const m={...base,id:'perf-'+i,width:2,height:2,objects:[],decor:[],buildings:[],pond:null,cache:null};A.snapshot(m);}assert.equal(A.cache.size,6);
    const a={id:'active',cache:surface(64,64).el},b={id:'recent',cache:surface(64,64).el},old=surface(64,64).el,d={id:'old',cache:old};V.World.maps={active:a,recent:b,old:d};V.World.current=a;V.MapAssets.visits.set(a,3);V.MapAssets.visits.set(b,2);V.MapAssets.visits.set(d,1);V.MapAssets.groundBudget=2*64*64*4;V.MapAssets.trim();assert(a.cache);assert(b.cache);assert.equal(d.cache,null);assert.equal(old.width,1);assert.equal(old.height,1);
   }finally{A.cache.clear();V.Cozy.ground=ground;V.World.maps=maps;V.World.current=originalMap;V.MapAssets.groundBudget=budget;}
  });

  await check('two active large grounds fit the mobile budget without changing world coordinates',()=>{
   const W=V.World,D=V.DuoWorld,saved={maps:W.maps,current:W.current,actors:D.actors,enabled:D.enabled};
   try{const a={id:'budget-a'},b={id:'budget-b'},old={id:'budget-old'};for(const m of [a,b,old])m.cache=V.GroundCache.create(m,4000,4000);assert.equal(V.GroundCache.width(a.cache),4000);assert.equal(V.GroundCache.height(a.cache),4000);assert(a.cache.width<4000);D.enabled=()=>true;D.actors=[{map:a.id},{map:b.id}];W.maps={a,b,old};W.current=a;V.MapAssets.trim();assert(a.cache&&b.cache);assert.equal(old.cache,null);assert(V.MapAssets.groundBytes<=V.MapAssets.groundBudget);}
   finally{W.maps=saved.maps;W.current=saved.current;D.actors=saved.actors;D.enabled=saved.enabled;}
  });

  const E=V.Engine,update=V.Game.update,render=V.Game.render,poll=V.Input.pollGamepad,screen=V.Game.screen,mode=V.Game.mode;
  let updates=0,renders=0,elapsed=0;
  const reset=()=>{P.invalidate();P.lastFPS=0;E.last=0;updates=renders=elapsed=0;V.modal=false;V.Dialogue.active=false;V.Game.screen='game';V.Game.mode='explore';};
  V.Game.update=dt=>{updates++;elapsed+=dt;};V.Game.render=()=>renders++;V.Input.pollGamepad=()=>{};
  try{
   await check('120 Hz callbacks produce 30 complete updates per second without slowing game time',()=>{reset();P.fps=30;for(let i=0;i<=240;i++)E.tick(1000+i*1000/120);assert(updates>=60&&updates<=61);assert.equal(renders,updates);assert(Math.abs(elapsed-2)<.04,elapsed);});
   await check('input taps survive skipped display frames',()=>{reset();P.fps=30;E.tick(1000);V.Input.pressed.add('e');assert.equal(E.tick(1008),false);assert(V.Input.pressed.has('e'));assert.equal(E.tick(1034),true);assert(!V.Input.pressed.has('e'));});
   await check('paused scenes render once while menu animation updates continue',()=>{reset();P.fps=30;V.modal=true;for(let i=0;i<5;i++)E.tick(1000+i*34);assert.equal(updates,5);assert.equal(renders,1);const task={};try{V.MapAssets.tasks.add(task);E.tick(1170);assert.equal(renders,2);V.MapAssets.tasks.delete(task);E.tick(1204);assert.equal(renders,3);}finally{V.MapAssets.tasks.delete(task);}const x=V.World.camera.x;V.World.camera.x=x+1;E.tick(1238);assert.equal(renders,4);V.World.camera.x=x;V.modal=false;E.tick(1272);assert.equal(renders,5);});
   await check('private duo panels do not freeze the other player',()=>{reset();const enabled=V.DuoWorld.enabled;try{V.DuoWorld.enabled=()=>true;V.modal=true;for(let i=0;i<3;i++)E.tick(1000+i*34);assert.equal(renders,3);}finally{V.DuoWorld.enabled=enabled;}});
   await check('background callbacks stop updates and resume without a time jump',()=>{reset();Object.defineProperty(w.document,'hidden',{configurable:true,value:true});assert.equal(E.tick(1000),false);assert.equal(updates,0);Object.defineProperty(w.document,'hidden',{configurable:true,value:false});assert(E.tick(9000));assert.equal(elapsed,0);});
   await check('faster touch devices adapt to sustained load and recover with hysteresis',()=>{setMobile(8,8);reset();assert.equal(P.fps,60);for(let i=0;i<90;i++)P.observe(23);assert.equal(P.fps,30);for(let i=0;i<599;i++)P.observe(5);assert.equal(P.fps,30);P.observe(5);assert.equal(P.fps,60);});
  }finally{V.Game.update=update;V.Game.render=render;V.Input.pollGamepad=poll;V.Game.screen=screen;V.Game.mode=mode;V.modal=false;P.invalidate();E.last=0;}
  await check('bursts cannot grow particles without bound and reduced motion is respected',()=>{const particles=E.particles,reduced=V.settings.reducedMotion;try{E.particles=[];V.settings.reducedMotion=false;E.burst(0,0,'#ffffff',2000);assert.equal(E.particles.length,96);E.burst(0,0,'#ffffff',2000);assert.equal(E.particles.length,96);E.particles=[];V.settings.reducedMotion=true;E.burst(0,0,'#ffffff',2000);assert.equal(E.particles.length,4);}finally{E.particles=particles;V.settings.reducedMotion=reduced;}});
  fs.writeFileSync(path.join(root,'.qa/mobile-after.json'),JSON.stringify(reports,null,2));fs.writeFileSync(path.join(root,'.qa/mobile-performance-results.json'),JSON.stringify(results,null,2));console.log('BENCHMARK '+JSON.stringify(reports));
 }finally{V.MapAssets.cancel();e.dom.window.close();}
 assert(results.every(r=>r.pass),results.filter(r=>!r.pass).map(r=>r.name).join(', '));console.log(results.length+' mobile performance checks passed');
}
run().then(()=>process.exit(0)).catch(error=>{console.error(error.stack);process.exit(1);});
