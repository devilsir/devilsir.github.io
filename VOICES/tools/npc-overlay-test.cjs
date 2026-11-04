'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{environment}=require('./runtime-upgrade-test.cjs');
(async()=>{
 const e=await environment(),{V,w,canvases}=e,out=path.resolve(__dirname,'../.qa/review');fs.mkdirSync(out,{recursive:true});
 const results=[],check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(error){results.push({name,pass:false,error:error.stack});console.error('FAIL',name,error.stack);}};
 const surface=(width=256,height=192)=>{const canvas=w.document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;return{canvas,c};};
 const body=c=>Buffer.from(c.getImageData(88,80,80,64).data);
 await V.Game.init();V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;V.Game.newState({name:'NPCs sem quadrados',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();V.Onboarding.active=false;V.Onboarding.suspended=true;V.settings.reducedMotion=false;
 const N=V.NeighbourhoodLife,actors=Object.values(V.World.maps).flatMap(map=>map.objects.filter(o=>o.livingRoutine).map(o=>({map:map.id,o}))),keys=new Set(actors.flatMap(({o})=>[o.character,o.uniformSprite]).filter(Boolean));
 const records=[...V.AssetLoader.records].filter(r=>keys.has(r.key.split('/').pop().split('.')[0])&&/\/(?:characters|cooking)\//.test(r.key));
 for(const record of records)if(record.state==='deferred')V.AssetLoader.enqueue(record,true);await Promise.all(records.map(record=>record.promise));
 await check('Clara retains her original appearance and all work animation frames have no green block',()=>{
  const clara=actors.find(({o})=>o.person==='clara-port').o;assert.equal(clara.character,'viviane');assert(!clara.uniformSprite);
  const actual=surface(),expected=surface();V.World.nearest=null;
  for(let phase=0;phase<4;phase++){
   actual.c.clearRect(0,0,256,192);expected.c.clearRect(0,0,256,192);const o={...clara,x:128,y:144,action:'working',dir:0,walking:false,greeting:0,walkClock:(phase+.01)/1.6};
   assert(N.draw(actual.c,o,{x:0,y:0}));V.Assets.sprite(expected.c,clara.character,128,144,4,phase,64);assert(body(actual.c).equals(body(expected.c)),'Clara phase '+phase+' contains an extra rectangle');
  }
  const review=surface(384,256),o={...clara,x:192,y:200,action:'working',dir:0,walking:false,greeting:0,walkClock:0};review.c.fillStyle='#829363';review.c.fillRect(0,0,384,256);V.World.nearest=o;N.draw(review.c,o,{x:0,y:0});V.World.nearest=null;fs.writeFileSync(path.join(out,'clara-overlay-fixed.png'),canvases.get(review.canvas).canvas.toBuffer('image/png'));
 });
 await check('the shared routine draws every NPC without activity rectangles in any work/read frame or direction',()=>{
  assert(actors.length>20);const actual=surface(),expected=surface();let poses=0,pending=0;const maps=new Set();
  for(const {map,o:original} of actors){
   const character=V.Assets.ready(V.Assets.images[original.uniformSprite])?original.uniformSprite:original.character;maps.add(map);
   if(!V.Assets.ready(V.Assets.images[character])){actual.c.clearRect(0,0,256,192);N.draw(actual.c,{...original,x:128,y:144,action:'working',walking:false},{x:0,y:0});assert(!body(actual.c).some(Boolean),original.id+' pending sprite left an activity block');pending++;continue;}
   for(const action of ['working','reading'])for(const dir of [0,1,2,3])for(let phase=0;phase<4;phase++){
    actual.c.clearRect(0,0,256,192);expected.c.clearRect(0,0,256,192);const o={...original,x:128,y:144,action,dir,walking:false,greeting:0,frame:phase,walkClock:(phase+.01)/1.6};
    assert(N.draw(actual.c,o,{x:0,y:0}));V.Assets.sprite(expected.c,character,128,144,dir===3?3:4,phase,64);assert(body(actual.c).equals(body(expected.c)),map+'/'+original.id+' '+action+' dir '+dir+' phase '+phase);poses++;
   }
  }
  console.log(JSON.stringify({npcs:actors.length,maps:maps.size,poses,pendingSprites:pending}));fs.writeFileSync(path.join(out,'npc-overlay-coverage.json'),JSON.stringify({npcs:actors.length,maps:maps.size,poses,pendingSprites:pending},null,2));
 });
 await check('loading NPCs cannot leave activity squares or partial seated legs floating on screen',()=>{
  const saved=V.Assets.images.vendor;V.Assets.images.vendor=w.document.createElement('img');const actual=surface();
  try{for(const action of ['working','reading','writing','drawing','watering','sitting','conversing']){
   actual.c.clearRect(0,0,256,192);const o={id:'pending-overlay-fixture',type:'resident',character:'vendor',x:128,y:144,action,dir:0,frame:0,greeting:0,walking:false,destination:{object:{scene:{kind:'seat'}}}};
   V.Cozy.drawObject(actual.c,o,{x:0,y:0},{accent:'#abc'});assert(!body(actual.c).some(Boolean),action+' left a floating activity overlay');
  }}finally{V.Assets.images.vendor=saved;}
 });
 fs.writeFileSync(path.join(out,'npc-overlay-results.json'),JSON.stringify(results,null,2));V.MapAssets.cancel();e.dom.window.close();process.exit(results.some(r=>!r.pass)?1:0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
