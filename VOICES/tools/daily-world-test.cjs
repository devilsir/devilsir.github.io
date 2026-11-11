'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {environment}=require('./runtime-upgrade-test.cjs');
const out=path.resolve(__dirname,'../.qa/review');
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

(async()=>{
 const {V,w,dom,canvases}=await environment({bundle:process.argv.includes('--bundle')}),checks=[];
 fs.mkdirSync(out,{recursive:true});
 const close=()=>{if(V.Dialogue.active)V.Dialogue.finish();V.UI.close();};
 const check=async(name,fn)=>{try{await fn();checks.push({name,pass:true});console.log('PASS',name);}catch(e){checks.push({name,pass:false,error:e.stack});console.error('FAIL',name,e.stack);}finally{close();}};
 const load=async id=>{V.World.load(id);await V.MapAssets.whenReady();V.World.transition=0;return V.World.current;};
 const surface=(width=800,height=520)=>{const el=w.document.createElement('canvas');el.width=width;el.height=height;return{c:el.getContext('2d'),save:n=>fs.writeFileSync(path.join(out,n+'.png'),canvases.get(el).canvas.toBuffer('image/png'))};};
 const start=async duo=>{V.settings.playerCharacters=duo?['nia','leo']:['nia'];V.settings.challengePlayers=duo?2:1;Object.assign(V.settings,{worldHours:false,npcHomeRoutines:false,npcMovement:true,npcChats:true,subtitles:true,reducedMotion:false});V.Game.newState({name:'Cotidiano e fauna',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();await V.MapAssets.whenReady();close();V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();if(duo){V.DuoTutorial.finish(0,true);V.DuoTutorial.finish(1,true);V.DuoPanels.closeAll();}};
 await V.Game.init();await start(false);
 const B=V.MarineLife,M=V.MarineBehavior,D=V.DailyWorld,E=V.Environment;
 const capture=(o,name)=>{const s=surface();V.World.camera={x:o.x-400,y:o.y-305};V.Cozy.render(s.c);s.save(name);};

 await check('illustrated poses are deferred until the corresponding coast',async()=>{
  const ids=Object.keys(V.MarinePoseData);
  assert.equal(ids.length,5);
  for(const id of ids)assert.equal(B.images[id].naturalWidth,0,id);
  await load('harbor');
  for(const id of ids.filter(id=>id!=='marine-poses-cape'))assert(B.images[id].naturalWidth,id);
  assert.equal(B.images['marine-poses-cape'].naturalWidth,0);
  await load('cape-town');
  assert(B.images['marine-poses-cape'].naturalWidth);
 });

 await check('coastal swimmers accelerate, stay in the water and visibly surface, dive and jump',async()=>{
  let whaleShot=false,dolphinShot=false;const states=new Map(),fx=new Set(),events=new Set();
  for(const id of Object.keys(V.MarineLifeData.regions)){
   const m=await load(id),animals=m.marineAnimals,initial=animals.map(a=>({...a}));let traveled=0;
   for(let i=0;i<1000;i++){
    const prev=animals.map(a=>({x:a.x,y:a.y}));
    B.updateMap(m,.08);
    animals.forEach((a,j)=>{const s=B.species(a.species),b=a.swimBrain,p=M.profiles[b.kind];assert(B.water(m,a.x,a.y,s.size*.39),id+'/'+a.id);assert(dist(a,prev[j])<=p.speed*.08*1.5+.01,'instant position change');traveled+=dist(a,prev[j]);if(!states.has(b.kind))states.set(b.kind,new Set());const seen=states.get(b.kind);seen.add(b.state);if(b.depth>=.94)seen.add('full-depth');if(b.depth>.25&&b.depth<.75)seen.add('partial');if(b.air>20)seen.add('airborne');});
    assert(m.marineEffects.length<=M.maxEffects&&m.marineSightings.length<=M.maxSightings);
    for(const f of m.marineEffects){fx.add(f.type);assert(f.age<f.duration);}
    for(const e of m.marineSightings){events.add(e.type);assert(m.marineTime-e.at<18);}
    const w=animals.find(a=>a.swimBrain.kind==='whale'&&a.swimBrain.state==='breathe'&&a.swimBrain.elapsed>.85&&a.swimBrain.elapsed<1);
    const d=animals.find(a=>a.swimBrain.air>50&&B.water(m,a.x,a.y,115));
    if(w&&!whaleShot){capture(w,'marine-whale-breath');whaleShot=true;}
    if(d&&!dolphinShot){capture(d,'marine-dolphin-leap');dolphinShot=true;}
   }
   assert(traveled>2500,id);assert(animals.some((a,i)=>dist(a,initial[i])>20),id);
  }
  for(const k of ['whale','dolphin','turtle','diver'])for(const state of ['dive','rise','full-depth','partial'])assert(states.get(k)?.has(state),k+'/'+state);
  assert(states.get('dolphin').has('airborne'));for(const f of ['spout','launch','splash','dive','bubbles'])assert(fx.has(f),f);
  assert(events.has('whale-blow')&&events.has('dolphin-leap'));assert(whaleShot&&dolphinShot);
 });

 await check('the illustrated dive stays below the surface and reduced motion freezes the simulation',async()=>{
  const m=await load('harbor'),a=m.marineAnimals.find(a=>a.swimBrain.kind==='whale'),s=surface(250,200);
  const draw=(state,depth)=>{
   Object.assign(a.swimBrain,{state,depth,air:0,turnScale:1});
   s.c.clearRect(0,0,250,200);
   M.body(s.c,a,125,100);
   const pixels=s.c.getImageData(0,0,250,200).data;
   let alpha=0,peak=0;
   for(let i=3;i<pixels.length;i+=4){alpha+=pixels[i];peak=Math.max(peak,pixels[i]);}
   return {alpha,peak};
  };
  const exposed=draw('breathe',0),partial=draw('dive',.5),deep=draw('submerged',1);
  assert(exposed.peak>220&&partial.alpha>2000);
  assert(deep.alpha>2000&&deep.peak<exposed.peak*.32,'deep animal should remain a faint underwater silhouette');
  const snap=()=>JSON.stringify([m.marineTime,m.marineAnimals,m.marineEffects,m.marineSightings]),before=snap();
  B.draw(s.c,m,{x:a.x-125,y:a.y-100});assert.equal(snap(),before,'render changed the simulation');
  for(const setting of ['reducedMotion','npcMovement']){V.settings[setting]=setting==='reducedMotion';for(let n=0;n<60;n++)B.updateMap(m,.04);assert.equal(snap(),before,setting);V.settings[setting]=setting!=='reducedMotion';}
  const paint=B.draw,objects=m.objects;let rendered=0;B.draw=function(c,map,cam){assert.equal(map,m);rendered++;return paint(c,map,cam);};
  try{m.objects=[];V.Cozy.render(s.c);assert.equal(rendered,1,'the water layer must not depend on the first visible object');}finally{m.objects=objects;B.draw=paint;}
 });

 await check('each species uses its own poses and each dolphin uses all four jump frames',()=>{
  const s=surface(880,500),sample=surface(220,200),calls=[];
  const draw=B.pose;
  B.pose=function(c,id,row,frame,...args){const result=draw.call(this,c,id,row,frame,...args);if(result)calls.push([id,row,frame]);return result;};
  const body=(species,state,depth,elapsed,air,x=110,y=105,size=150,c=sample.c)=>{
   const swimBrain={state,depth,elapsed,duration:1,air,turnScale:1};
   M.body(c,{species:species.id,facing:1,time:0,swimBrain},x,y,false,size);
  };
  try{
   for(const species of V.MarineLifeData.species){
    const id=species.sheet.replace('marine-','marine-poses-');
    for(const [state,depth,col] of [['breathe',0,0],['rise',.25,1],['dive',.25,2],['submerged',1,3]]){
     calls.length=0;
     body(species,state,depth,.5,0);
     assert(calls.some(([sheet,row,frame])=>sheet===id&&row===species.row&&frame===col),species.id+'/'+state);
    }
   }
   for(const [row,id] of ['guiana-dolphin','bottlenose'].entries()){
    const species=B.species(id),frames=new Set();
    for(const [column,t] of [.1,.3,.6,.9].entries()){
     sample.c.clearRect(0,0,220,200);
     calls.length=0;
     body(species,'leap',0,t,Math.sin(Math.PI*t)*64,110,138);
     assert.deepEqual(calls,[['marine-poses-leaps',row,column]]);
     frames.add(Buffer.from(sample.c.getImageData(0,0,220,200).data).toString('base64'));
    }
    assert.equal(frames.size,4,id);
   }
   for(const [row,type] of ['spout','splash','dive','bubbles'].entries()){
    for(const [frame,age] of [.08,.26,.51,.81].entries()){
     calls.length=0;
     M.effectDraw(sample.c,{type,x:110,y:120,age,duration:1,size:115},{x:0,y:0});
     assert.deepEqual(calls,[['marine-poses-effects',row,frame]]);
    }
   }
   s.c.fillStyle='#2e727b';s.c.fillRect(0,0,880,500);
   s.c.font='15px sans-serif';
   for(const [col,[state,depth,t,label]] of [['breathe',0,.5,'Semissubmersa'],['rise',.18,.8,'Subindo'],['dive',.41,.3,'Mergulhando'],['submerged',1,.5,'Submersa']].entries()){
    const x=110+col*220;
    body(B.species('humpback'),state,depth,t,0,x,144,190,s.c);
    if(col===0)M.effectDraw(s.c,{type:'spout',x:x+51,y:117,age:.6,duration:1.8,size:190},{x:0,y:0});
    s.c.fillStyle='#e8f6f0';s.c.fillText(label,x-62,237);
   }
   for(const [col,[t,label]] of [[.1,'Impulso'],[.3,'Subida'],[.6,'Descida'],[.9,'Reentrada']].entries()){
    const x=110+col*220;
    body(B.species('guiana-dolphin'),'leap',0,t,Math.sin(Math.PI*t)*68,x,401,158,s.c);
    if(col===3)M.effectDraw(s.c,{type:'splash',x,y:405,age:.61,duration:2.5,size:158},{x:0,y:0});
    s.c.fillStyle='#e8f6f0';s.c.fillText(label,x-38,468);
   }
   s.save('marine-poses-in-game');
  }finally{B.pose=draw;}
 });

 await check('clock, weather and real objects change work and rest without blocked steps or duplicate reservations',async()=>{
  const m=await load('market'),actors=m.objects.filter(o=>D.eligible(m,o));assert(actors.length>2);
  Object.assign(V.Player.data,{x:96,y:96});V.settings.npcChats=false;const k=D.context(m),activity=new Set(),origins=actors.map(o=>({...o}));
  for(const [hour,weather,phase]of [[8,'clear','opening'],[10.5,'clear','morning'],[12,'clear','lunch'],[16,'clear','afternoon'],[19,'clear','closing'],[23,'clear','quiet'],[15,'rain','rain']]){
   E.preview={hour,weather:{type:weather}};const picked=new Set();
   for(let n=0;n<280;n++){const before=actors.map(o=>({x:o.x,y:o.y}));V.Cozy.update(.08);assert.equal(k.phase,phase);
    actors.forEach((o,i)=>{const b=D.brains.get(o);assert(D.clear(m,o,o)||dist(o,before[i])<.01,o.id);assert(dist(o,before[i])<3.1,o.id);if(b?.state==='activity'){picked.add(b.activity);if(b.anchor?.object){assert(m.objects.includes(b.anchor.object));assert.equal(m.reservations.get(b.anchor.id),o.id);activity.add(b.activity);}}});
   }
   assert(picked.size>0,phase);
  }
  assert(actors.filter((o,i)=>dist(o,origins[i])>8).length>=3);assert(activity.size>=2,[...activity]);
  assert(k.events.some(e=>e.kind==='activity'&&e.target));assert(k.events.length<=D.maxEvents);
  const a=actors.find(o=>D.brains.get(o)?.anchor?.object),b=D.brains.get(a);assert(a&&b);const anchor=b.anchor.id;D.interrupt(m,a);assert(!m.reservations.has(anchor));assert.equal(b.state,'idle');
  V.settings.npcChats=true;E.preview={hour:10,weather:{type:'clear'}};
 });

 await check('encounters alternate speakers, react to a sighting and open a bilingual local diary',async()=>{
  const m=await load('harbor'),k=D.context(m),g=k.authored.find(g=>g.id.startsWith('community-chat-'));assert(g);
  Object.assign(V.Player.data,{x:96,y:96});const seen=new Set();let pause=false,didCapture=false;
  for(let n=0;n<2300;n++){
   const a=g.members[0],nextMarineTime=(m.marineTime||0)+.08;m.marineSightings=[{id:'test-sighting',type:'whale-blow',x:a.x,y:a.y,at:nextMarineTime}];V.Cozy.update(.08);
   if(g.phase!=='talk')continue;const talking=g.members.filter(o=>o.chatSpeaking);assert(talking.length<=1);
   if(!talking.length){pause=true;continue;}
   seen.add(talking[0].id);
   if(!didCapture){capture(talking[0],'daily-harbor-conversation');didCapture=true;}
   if(seen.size===2&&pause)break;
  }
  assert.equal(seen.size,2);assert(pause);assert(k.events.some(e=>e.title==='Um esguicho na baía'&&e.lines.every(([pt,en])=>pt&&en)));
  V.CityMenus.board('community');V.$('#daily-world-notes').click();assert(V.$('.daily-world-notes').textContent.includes('Um esguicho na baía'));assert(V.$('.daily-world-notes [lang=en]'));
  close();const a=g.members[0];D.interrupt(m,a);assert.equal(g.phase,'rest');assert(g.members.every(o=>!o.chatSpeaking&&D.brains.get(o).noChatUntil>=k.time+25));
  const earlier=k.events.filter(e=>e.kind==='encounter').length;let topics=[];
  for(let n=0;n<1800;n++){V.Cozy.update(.08);topics=k.events.filter(e=>e.kind==='encounter');if(topics.length>=earlier+2)break;}
  assert(topics.length>=earlier+2,'new encounters after the cooldown');assert.notEqual(topics[0].lines[0][0],topics[1].lines[0][0],'consecutive conversations should vary');
  V.settings.npcMovement=false;const p={x:a.x,y:a.y};for(let n=0;n<100;n++)V.Cozy.update(.08);assert.equal(dist(a,p),0);V.settings.npcMovement=true;E.preview=null;
 });

 await check('the 16 daily furnishings are paintable catalog items with native placement and object activities',async()=>{
  const H=V.Homestead,K=V.HomeDailyCollection,home='interior-player-villa';H.ensure().owned.push(home);V.Life.ensure().coins=10000;const m=await load(home);
  assert.equal(K.items.length,16);assert(V.HomeDesign.images['home-daily'].naturalWidth>0);
  for(const i of K.items){assert(H.catalog.includes(i));assert(V.sceneAssets.some(a=>a.id===i.id));assert.equal(V.HomeLiving.item({scene:{family:i.family,prop:i.prop}}),i);}
  const i=K.items.find(i=>i.id==='daily-potting'),s=surface(240,220);assert(H.buyFurniture(i.id));
  const room=V.Rooms.box(m.design.construction.rooms[0].polygon);let p;for(let y=room.y+100;y<room.y+room.h-30&&!p;y+=32)for(let x=room.x+80;x<room.x+room.w-50;x+=32)if(H.canArrange(home,i,x,y,0)){p={x,y};break;}
  assert(p);assert(H.placeFurniture(home,i.id,p.x,p.y,0));const o=m.objects.find(o=>o.furnitureItem===i.id&&o.playerFurniture);assert(o);assert.equal(D.objectAction(o),'watering');
  V.Cozy.prop(s.c,i.family,i.prop,120,160,145);assert(s.c.getImageData(0,0,240,220).data.some((v,i)=>i%4===3&&v>230));assert(H.storeObject(home,o.id));
 });

 await check('two viewers share one simulation per map and both are avoided by walkers',async()=>{
  V.Game.toTitle();await start(true);const duo=V.DuoWorld;assert(duo.enabled());for(const a of [0,1])duo.withActor(a,()=>V.World.load('harbor'));await V.MapAssets.whenReady();
  const m=V.World.maps.harbor,k=D.context(m),t=m.marineTime,before=k.time;V.Game.update(.04);assert(Math.abs(m.marineTime-t-.04)<1e-5);assert(Math.abs(k.time-before-.04)<1e-5);
  const players=D.players(m),actor=m.objects.find(o=>D.eligible(m,o));assert.equal(players.length,2);assert(actor);
  for(const [i,sign]of [[0,-1],[1,1]])Object.assign(players[i],{x:actor.x+sign*24,y:actor.y});
  for(const sign of [-1,1])assert.equal(D.canStep(m,actor,{x:actor.x+sign*2,y:actor.y},[],players),false);
  V.DuoPanels.withOwner(1,()=>duo.withActor(1,()=>D.panel()));assert(V.DuoPanels.has(1)&&!V.DuoPanels.has(0));V.DuoPanels.closeAll();
  duo.withActor(1,()=>V.World.load('muizenberg'));await V.MapAssets.whenReady();const other=V.World.maps.muizenberg,u=other.marineTime;V.Game.update(.04);assert(Math.abs(other.marineTime-u-.04)<1e-5);assert(Math.abs(m.marineTime-t-.08)<1e-5);
 });
 fs.writeFileSync(path.join(out,'daily-world-results.json'),JSON.stringify(checks,null,2));
 V.MapAssets.cancel();dom.window.close();process.exit(checks.some(x=>!x.pass)?1:0);
})().catch(e=>{console.error(e.stack);process.exit(1);});
