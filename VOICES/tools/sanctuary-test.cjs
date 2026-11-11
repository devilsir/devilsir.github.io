'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{environment}=require('./runtime-upgrade-test.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa/review');
(async()=>{const{V,w,dom,canvases}=await environment(),results=[],check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(e){results.push({name,pass:false,error:e.stack});console.error('FAIL',name,e.stack);}};
 await V.Game.init();V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;V.settings.worldHours=false;V.settings.npcHomeRoutines=false;V.Game.newState({name:'Recintos · revisão',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();const K=V.AnimalSanctuary,M=V.AnimalMuseum,H=V.Homestead,N=V.SanctuaryNeighbors,B=V.AnimalMuseumData,staff=()=>[...H.actors.values()].filter(a=>a.sanctuaryStaff);
 await check('all 34 species have individual enclosures, shelter and real perimeter collisions',()=>{const m=V.World.maps['animal-museum'],pens=m.objects.filter(o=>o.type==='animal-museum-pen');assert.equal(pens.length,34);assert.equal(pens.filter(o=>o.aviary).length,4);for(const p of pens){assert(m.solids.some(s=>s.owner===p.id));assert(V.NatureWorld.blocked(m,p.bounds.x+p.bounds.w/2,p.bounds.y+p.bounds.h/2));assert(m.objects.some(o=>o.id===p.animal));}assert(m.natureWater.length>=12);});
 await check('every animal walks or flies within its enclosure, with shared update protection',()=>{const m=V.World.maps['animal-museum'],animals=m.objects.filter(o=>o.type==='sanctuary-animal'),start=new Map(animals.map(o=>[o.id,{x:o.x,y:o.y}]));for(let i=0;i<600;i++){V.Engine.time+=.08;K.update(m,.08);for(const o of animals){assert(o.x>=o.bounds.x&&o.x<=o.bounds.x+o.bounds.w,o.id);assert(o.y>=o.bounds.y&&o.y<=o.bounds.y+o.bounds.h,o.id);}}for(const o of animals)assert(Math.hypot(o.x-start.get(o.id).x,o.y-start.get(o.id).y)>4,o.id);const a=animals[0],once=a.x;K.update(m,.08);assert.equal(a.x,once);});
 await check('sixteen fossils and the thirty-six declared anatomical groups stay distinct',()=>{assert.equal(B.fossils.length,16);assert.equal(B.anatomy.length,36);for(const id of [...V.SanctuaryData.africa,...V.SanctuaryData.brazil,...V.SanctuaryData.common])assert(B.anatomy.some(e=>e.animal===id));for(const s of V.fieldGuideContent.entries)assert(B.anatomy.some(e=>e.animal===s.id));for(const e of [...B.fossils,...B.anatomy]){assert(e.sources.length);assert(e.period);for(const id of e.sources)assert(V.NatureData.sources[id]?.url.startsWith('https:'));}M.catalog('fossils');assert.equal(V.$$('[data-animal-entry]').length,16);M.catalog('anatomy');assert.equal(V.$$('[data-animal-entry]').length,36);M.exhibit('anatomy-butterfly');assert.match(V.$('.modal-body').textContent,/exoesqueleto/i);assert.match(V.$('.modal-body').textContent,/Tipo de peça/);M.exhibit('hippo');assert(V.$('#animal-compare-bones'));V.$('#animal-compare-bones').click();assert.match(V.$('.modal-body').textContent,/anatomia comparada/i);V.UI.close();M.exhibit('rhea');assert(!V.$('#animal-compare-bones'));V.UI.close();});
 const reachable=(m,start,target)=>{const step=24,at=[Math.round(start.x/step),Math.round(start.y/step)],q=[at],seen=new Set([at.join(',')]);for(let i=0;i<q.length;i++){const[x,y]=q[i];if(Math.hypot(x*step-target.x,y*step-target.y)<(target.interactionRange||100)-15)return true;for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const p=[x+dx,y+dy],key=p.join(',');if(seen.has(key)||V.NatureWorld.blocked(m,p[0]*step,p[1]*step,12))continue;seen.add(key);q.push(p);}}return false;};
 await check('visitors can reach every enclosure, fossil, comparison and exit from the entrance',()=>{for(const id of K.ids){const m=V.World.maps[id],p={x:m.design.spawn[0]*48,y:m.design.spawn[1]*48};for(const o of m.objects.filter(o=>o.type!=='sanctuary-animal'))assert(reachable(m,p,o),id+' '+o.id);}});
 await check('twelve aquatic animals use intact replacement sprites and surrounding wave effects',async()=>{await V.MapAssets.ensure(['wildlife','sanctuary'],'Teste das animações');for(const s of V.NatureData.species.filter(s=>s.waterArt))assert(V.Wildlife.frame(s,'water',.2).sheet.startsWith('water-full-'));const el=w.document.createElement('canvas');el.width=320;el.height=256;V.Wildlife.preview(el.getContext('2d'),V.NatureData.species[0],'water',.2);fs.writeFileSync(path.join(out,'aquatic-whole-body.png'),canvases.get(el).canvas.toBuffer('image/png'));const a=canvases.get(el).canvas.toBuffer('image/png');V.Wildlife.preview(el.getContext('2d'),V.NatureData.species[0],'water',.7);assert.notDeepEqual(canvases.get(el).canvas.toBuffer('image/png'),a);});
 await check('three new staff, the curator and two rangers each have a furnished private home',()=>{assert.equal(staff().length,6);assert.equal(new Set(staff().map(a=>a.home)).size,6);for(const a of staff()){const m=V.World.maps[a.home];assert(m?.roomBuilder,a.home);assert(m.objects.some(o=>o.household&&H.isBed(o)),a.home+' bed');assert(m.objects.some(o=>o.household&&o.scene?.prop===19),a.home+' water');assert(H.home(a.home).residents.includes(a.name));assert(H.route(a.work,a.home,a.o)?.length,a.key+' home route');assert(H.route(a.home,a.work,a.o)?.length,a.key+' work route');}});
 await check('world-hours option sends the actual NPCs home at dusk and back at dawn',()=>{V.settings.worldHours=true;V.settings.npcHomeRoutines=false;const clock=V.Progress.ensure().clock;clock.daylight=false;clock.hour=19.1;H.reconcile();for(const a of staff())assert.equal(a.destination,a.home);for(let i=0;i<1600;i++){V.Engine.time+=.25;for(const a of staff())H.step(a,.25);V.CityCommutes.check();if(staff().every(a=>a.map===a.home&&!V.CityCommutes.pending.has(a.key)))break;}for(const a of staff())assert(a.map===a.home&&!V.CityCommutes.pending.has(a.key),a.key+' did not arrive: '+a.map+' '+JSON.stringify({x:a.o.x,y:a.o.y,path:a.path?.[0],target:a.destination,wait:a.wait}));clock.hour=7;H.reconcile();for(let i=0;i<1600;i++){V.Engine.time+=.25;for(const a of staff())H.step(a,.25);V.CityCommutes.check();if(staff().every(a=>a.map===a.work&&!V.CityCommutes.pending.has(a.key)))break;}for(const a of staff())assert(a.map===a.work&&!V.CityCommutes.pending.has(a.key),a.key+' did not return: '+a.map);});
 await check('turning both schedule options off keeps the staff at their workplaces',()=>{V.Progress.ensure().clock.hour=23;V.settings.worldHours=false;V.settings.npcHomeRoutines=false;V.WorldPreferences.sync();for(const a of staff()){assert.equal(a.map,a.work);assert.equal(a.destination,a.work);}assert.equal(H.commuting,false);});
 await check('the Cape reading lantern has natural proportions and opens without a ground caption',async()=>{
  const W=V.World,M=V.Maritime;
  W.load('cape-town');await V.MapAssets.whenReady();
  const note=W.current.objects.find(o=>o.id==='sea-note-fynbos');
  const canvas=w.document.createElement('canvas'),context=canvas.getContext('2d'),frames=[];
  const draw=new Proxy(context,{get(c,key){
   if(key==='drawImage')return (img,...args)=>{frames.push(args);return c.drawImage(img,...args);};
   return c[key];
  }});
  const label=M.label,oldNearest=W.nearest;
  try{
   M.label=()=>assert.fail('A reading lantern painted a caption.');
   W.nearest=note;
   M.drawObject(draw,note,{x:note.x-120,y:note.y-120});
  }finally{M.label=label;W.nearest=oldNearest;}
  assert.equal(frames.length,1);
  const [,,sw,sh,,,dw,dh]=frames[0];
  assert(Math.abs(sw/sh-dw/dh)<.001);
  assert(W.interactables().includes(note));
  V.Game.interact(note);
  assert.match(V.$('.modal-head h2').textContent,/Fynbos/);
  V.UI.close();
 });
 await check('the Rangers’ Village props, home entrances and four bilingual neighbors are usable',async()=>{
  const W=V.World,id='sanctuary-village-sa';
  W.load(id);await V.MapAssets.whenReady();
  const m=W.current;
  assert(V.MapAssets.groups(m).includes('guard-village'));
  assert.equal(V.NatureArt.images['sanctuary-village-props'].naturalWidth,640);
  assert.equal(V.NatureArt.images['sanctuary-village-people'].naturalWidth,256);
  const props=m.decor.filter(o=>o.family==='guard-village');
  assert(new Set(props.map(o=>o.prop)).size===8&&props.length>=20);
  for(const o of props)assert(m.solids.some(s=>s.owner===o.id),o.id);
  assert(V.SceneDesign.validate(m).ok);
  assert.equal(m.objects.filter(o=>o.door?.to?.map?.startsWith('interior-sanctuary-')).length,2);
  const canvas=w.document.createElement('canvas'),context=canvas.getContext('2d');
  for(const [name,destination] of [['bongani','interior-sanctuary-bongani'],['lindiwe','interior-sanctuary-ranger-lindiwe']]){
   const entry=m.objects.find(o=>o.door?.to?.map===destination);
   const building=m.buildings.find(b=>b.door===entry?.id);
   const image=V.NatureArt.images['sanctuary-village-'+name+'-home'];
   assert.equal(image.naturalWidth,1024);
   assert(building&&Math.abs(entry.x-(building.x+building.w/2))<1);
   const frames=[];
   const surface=new Proxy(context,{
    get(c,key){if(key==='drawImage')return (...args)=>{frames.push(args);return c.drawImage(...args);};return c[key];},
    set(c,key,value){c[key]=value;return true;}
   });
   V.World.drawBuilding(surface,building,{x:building.x,y:building.y});
   assert.equal(frames.length,1);
   const [source,x,y,width,height]=frames[0];
   assert.equal(source,image);
   assert(Math.abs(width/height-image.naturalWidth/image.naturalHeight)<.0001);
   assert(x>=0&&x+width<=building.w+.001);
   assert(Math.abs(y+height-building.h)<.001);
  }
  const actors=m.objects.filter(o=>o.type==='place-life'),moved=new Set();
  assert.deepEqual(Array.from(actors,o=>o.profile.name).sort(),['Karabo','Leeto','Nomsa','Sibusiso']);
  for(let i=0;i<550;i++){
   V.Engine.time+=.08;V.DailyWorld.update(m,.08);
   for(const o of actors){
    assert(!V.Living.blocked(m,o.x,o.y,9),o.id);
    if(o.walking)moved.add(o.id);
   }
  }
  assert.equal(moved.size,actors.length);
  for(const o of actors){
   V.Game.interact(o);
   assert.equal(V.$('.modal-head h2').textContent,o.profile.name);
   assert(V.$('.modal-body').textContent.includes(o.profile.en));
   assert(V.$('.modal-body').textContent.includes(o.profile.pt));
   V.UI.close();
  }
  const old=JSON.parse(JSON.stringify(m.design));
  delete old.guardVillageVersion;old.decor=[];old.scenes=[];old.anchors=[];old.adventure.lights=[];
  old.paths=[[2,14,30,3],[2,26,30,3],[15,3,4,27]];
  const upgraded=V.SceneDesign.normalise(V.SceneDesign.document({...V.Cozy.layouts,[id]:old}))[id];
  assert.equal(upgraded.guardVillageVersion,1);
  assert.equal(upgraded.decor.length,props.length);
  assert(upgraded.paths.length>old.paths.length);
 });
 await check('updated maps and homes render with their actual assets',async()=>{for(const[id,x,y]of [['animal-museum',12,11],['animal-fossil-hall',24,7],['sanctuary-village-br',11,15],['sanctuary-village-sa',17,15],['interior-sanctuary-iara',12,14]]){V.World.load(id);await V.MapAssets.whenReady();assert(V.World.current.name,id+' missing place name');V.World.transition=0;V.World.camera={x:x*48-480,y:y*48-270};const el=w.document.createElement('canvas');el.width=960;el.height=540;V.Cozy.render(el.getContext('2d'));fs.writeFileSync(path.join(out,id+'-sanctuary.png'),canvases.get(el).canvas.toBuffer('image/png'));}});
 await check('two visitors retain private staff menus, notes and independent map changes',async()=>{V.Game.toTitle();V.settings.playerCharacters=['nia','leo'];V.settings.challengePlayers=2;V.Game.newState({name:'Recintos em dupla',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();await V.MapAssets.whenReady();V.DuoTutorial.finish(0,true);V.DuoTutorial.finish(1,true);const P=V.DuoPanels,D=V.DuoWorld;P.closeAll();D.withActor(0,()=>V.World.load('animal-museum'));D.withActor(1,()=>V.World.load('animal-fossil-hall'));await V.MapAssets.whenReady();P.withOwner(1,()=>N.panel('cecilia'));assert(P.has(1));assert(!P.has(0));P.root(1).querySelector('#sanctuary-staff-collection').click();assert.equal(P.root(1).querySelectorAll('[data-animal-entry]').length,16);P.closeAll();D.withActor(1,()=>V.World.load('sanctuary-village-br'));await V.MapAssets.whenReady();assert.equal(D.actors[0].map,'animal-museum');assert.equal(D.actors[1].map,'sanctuary-village-br');});
 for(const[file,name,map,position]of [['preview-enclosures.json','Recintos · revisão','animal-museum',{x:12*48,y:11*48}],['preview-fossils-v2.json','Fósseis · revisão','animal-fossil-hall',{x:24*48,y:8*48}],['preview-staff-village.json','Vila das Acácias · revisão','sanctuary-village-br',{x:10*48,y:15*48}]]){V.Game.toTitle();V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;V.settings.worldHours=false;V.settings.npcHomeRoutines=false;V.Game.newState({name,character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.state.map=map;V.state.position=position;delete V.state.profileId;fs.writeFileSync(path.join(out,file),JSON.stringify({format:'voices-save',version:1,state:V.state,settings:V.settings}));}
 fs.writeFileSync(path.join(out,'sanctuary-results.json'),JSON.stringify(results,null,2));V.MapAssets.cancel();dom.window.close();process.exit(results.some(r=>!r.pass)?1:0);
})().catch(e=>{console.error(e.stack);process.exit(1);});
