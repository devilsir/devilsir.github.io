'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const {V,click,drainDialogue,native}=require('./runtime-test.js');
const report=[];
function close(){if(V.Dialogue.active)drainDialogue();V.UI.close();}
function at(map,predicate){close();V.World.load(map);const o=V.World.current.objects.find(predicate);assert(o,map+' has activity');return o;}
function step(seconds,fn){for(let i=0;i<Math.ceil(seconds/.06);i++){V.Engine.time+=.06;V.World.update(.06);fn?.();}}
function render(){V.World.transition=0;V.World.render(V.Engine.ctx);return V.Engine.canvas._canvas.toBuffer('image/png');}
async function main(){
 await V.Game.init();assert.equal(V.Assets.errors.length,0);click('#new-game');V.$$('[data-grade]')[0].onclick();click('#creation-next');click('#creation-begin');for(let i=0;i<3;i++)click('#intro-next');V.state.unlocked=6;V.state.flags.prologueDone=true;V.state.flags.prologueStarted=true;
 for(const a of V.cozyContent.activities){
  const o=at(a.map,o=>o.scene?.activity===a.id);V.Game.interact(o);assert(V.$('#cozy-activity-save').disabled);
  V.$$('[data-cozy-answer]').find(b=>+b.dataset.cozyAnswer===(a.correct+1)%a.options.length).onclick();assert(V.$('#cozy-activity-save').disabled);assert(V.$('#cozy-activity-feedback').textContent.includes(a.explanation));
  click('#cozy-activity-reading');assert(V.$('#reader-next')||V.$('#reader-save'));while(V.$('#reader-next'))click('#reader-next');click('#reader-save');assert(V.$('#cozy-activity-save'),'Consulting a source resumes this activity');
  V.$$('[data-cozy-answer]').find(b=>+b.dataset.cozyAnswer===a.correct).onclick();click('#cozy-activity-save');assert(V.state.cozy.activities.includes(a.id));
 }
 report.push('All six cultural activities support reading, explanations, retry and persistent completion.');
 let instrument=at('room-1',o=>o.scene?.kind==='instrument');V.Game.interact(instrument);V.$$('[data-timbre]')[1].onclick();click('#cozy-play');assert(V.$('#cozy-music-feedback').textContent.includes('dó'));click('#cozy-music-save');assert.equal(V.state.cozy.music[instrument.id].timbre,'sine');
 const sketch=at('park',o=>o.scene?.kind==='sketch');for(let i=0;i<3;i++){V.Game.interact(sketch);V.$$('[data-sketch]')[i].onclick();const image=V.$('#cozy-sketch-preview')._canvas.toBuffer('image/png');assert(image.length>500);click('#cozy-sketch-save');}assert.equal(V.state.cozy.sketches.length,3);
 const seeds=at('garden',o=>o.scene?.kind==='plant');V.Game.interact(seeds);V.$$('[data-seed-label]').forEach(b=>b.onclick());click('#cozy-seed-close');assert.equal(V.state.cozy.seedLabels.length,3);
 const before=render();V.Living.showMission('garden-care');click('#mission-start');const beds=V.World.current.objects.filter(o=>o.type==='water');beds.forEach(o=>V.Game.interact(o));assert.equal(V.state.watered.length,3);assert(!before.equals(render()),'Care changes the garden visually');
 const proposal=at('room-5',o=>o.scene?.kind==='proposal');V.Game.interact(proposal);click('#cozy-proposal-save');assert(V.$('#cozy-proposal-feedback').textContent.includes('pelo menos'));V.$$('[data-proposal]')[0].onclick();V.$$('[data-proposal]')[2].onclick();click('#cozy-proposal-save');assert.equal(V.state.cozy.proposal.join(','),'0,2');V.Game.interact(proposal);assert.equal(V.$$('[data-proposal]').filter(b=>b.classList.contains('selected')).length,2);close();
 report.push('Instrument timbre, three original scene sketches, seed labels, visibly improved garden and written assembly choices persist.');
 const seat=at('hub',o=>o.scene?.kind==='seat');const m=V.World.current,a=m.anchors.get(seat.scene.id);m.reservations.set(a.id,'test-occupied');V.Game.interact(seat);assert(!V.Cozy.seated,'Occupied seat is unavailable');m.reservations.clear();V.Game.interact(seat);assert(V.Cozy.seated);V.Input.keys.add('d');V.Player.update(.04);V.Input.keys.clear();assert(!V.Cozy.seated);assert(!m.reservations.has(a.id));
 V.Game.interact(seat);V.World.load('library');assert(!V.Cozy.seated);assert(!m.reservations.has(a.id),'Map transition releases player seat');
 const person=V.World.current.objects.find(o=>V.Cozy.person(o)&&o.character!=='pix');V.World.load('library',{x:person.x,y:person.y});assert(V.dist(person,V.Player.data)>=31,'Save position overlapping an NPC is moved safely');
 const free=V.World.current.objects.find(o=>V.Cozy.person(o)&&!V.World.collides(o.x-50,o.y,11));V.Player.data.x=free.x-50;V.Player.data.y=free.y;V.Input.keys.add('d');for(let i=0;i<30;i++)V.Player.update(.02);V.Input.keys.clear();assert(V.dist(free,V.Player.data)>=24,'Player cannot walk through residents');
 report.push('Occupied seating, standing, transition cleanup, safe saved spawns and player/NPC body collisions verified.');
 const conversations=[];const states=new Set();
 for(const map of Object.values(V.World.maps)){
  close();V.World.load(map.id);const group=map.chats[0],turns=new Set();let talkingFrames=0;
  const actors=map.objects.filter(o=>o.waypoints);
  for(const o of actors){assert(o.waypoints.length);if(V.Cozy.person(o))assert(o.tasks.every(id=>map.anchors.has(id)));}
  step(125,()=>{
   const speakers=actors.filter(o=>o.chatSpeaking);assert(speakers.length<=1,'One reciprocal speaker per map');if(speakers[0]){turns.add(speakers[0].id);talkingFrames++;assert(group.members.every((o,i)=>V.dist(o,group['anchor'+i])<10),'Speakers occupy the meeting place');}
   for(const o of actors){assert(Number.isFinite(o.x)&&Number.isFinite(o.y));assert(!V.Cozy.blocked(map,o,o.x,o.y),map.id+' '+o.id+' avoids furniture');states.add(o.action);}
   const people=actors.filter(o=>V.Cozy.person(o));for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++)assert(V.dist(people[i],people[j])>=22.9,map.id+' residents do not overlap');
   for(const [id,owner]of map.reservations){assert(map.anchors.has(id));assert(owner==='player'||actors.some(o=>o.id===owner));}
  });
  if(group){conversations.push({map:map.id,speakers:turns.size,talkingFrames});assert(turns.size>=2,map.id+' has reciprocal conversation');}
  const npc=actors.find(o=>V.Cozy.person(o)&&o.type==='resident');if(npc){V.Player.data.x=npc.x+30;V.Player.data.y=npc.y;V.Game.interact(npc);assert(V.Dialogue.active);assert(npc.responding>0);drainDialogue();close();step(8);assert(!npc.responding,'Routine resumes after interaction');}
 }
 assert(states.has('reading')&&states.has('watering')&&states.has('playing')&&states.has('sitting')&&states.has('writing'),'Activity states: '+[...states].join(', '));
 report.push('125 seconds simulated separately in all 18 maps: body separation, furniture collision, reserved spots, reciprocal turns and interruptions checked.');
 V.World.load('park');const mover=V.World.current.objects.find(o=>o.type==='resident');for(const setting of['npcMovement','reducedMotion']){V.settings[setting]=setting==='reducedMotion';const pos={x:mover.x,y:mover.y};step(5);assert.equal(pos.x,mover.x);assert.equal(pos.y,mover.y);V.settings[setting]=setting==='npcMovement';}
 V.settings.npcChats=false;render();V.Cozy.journal();assert(V.$('[data-notebook-tab="neighborhood"]'));close();V.settings.npcChats=true;
 report.push('Reduced motion, stationary population and persistent text access with ambient chatter disabled verified.');
 V.settings.muted=false;await V.Audio.unlock();V.World.load('hub');for(let i=0;i<5;i++)V.Audio.mix(.2);const outgoing=V.Audio.ambient;V.World.load('library');const incoming=V.Audio.ambient;assert.notEqual(incoming,outgoing);assert(V.Audio.ambientTracks.length===2);V.Audio.mix(.45);assert(incoming.volume>0&&outgoing.volume>0);for(let i=0;i<5;i++)V.Audio.mix(.2);assert(outgoing.paused);assert.equal(V.Audio.ambientTracks.length,1);
 const musicVolume=V.settings.music,effectsVolume=V.settings.effects;V.settings.ambience=.2;V.Audio.apply();assert.equal(V.settings.music,musicVolume);assert.equal(V.settings.effects,effectsVolume);assert(Math.abs(incoming.volume-.17)<.00001);V.settings.muted=true;V.Audio.apply();assert(incoming.paused&&incoming.volume===0);
 report.push('Environment crossfade keeps outgoing/incoming loops, removes old tracks, respects mute and independent volume; HTML audio is mocked.');
 V.Save.save();const saved=JSON.parse(JSON.stringify(V.Save.load()));V.Game.loadState(saved);close();assert.equal(V.state.cozy.activities.length,6);assert.equal(V.state.cozy.sketches.length,3);assert.equal(V.state.watered.length,3);assert.equal(V.state.cozy.proposal.join(','),'0,2');assert.equal(Object.keys(V.state.cozy.music).length,1);
 const legacy=JSON.parse(JSON.stringify(saved));delete legacy.cozy;V.Game.loadState(legacy);close();assert.equal(V.state.cozy.activities.length,0);assert.equal(V.state.unlocked,6);assert.equal(V.state.watered.length,3);
 const malformed=JSON.parse(JSON.stringify(saved));malformed.cozy={activities:[null,3,'good','good'],seedLabels:[-1,0,8],music:[]};V.Game.loadState(malformed);close();assert.equal(V.state.cozy.activities.join(','),'good');assert.equal(V.state.cozy.seedLabels.join(','),'0');V.Game.loadState(saved);close();
 report.push('New optional progress survives save/reload; previous saves migrate without losing campaign/garden data; malformed optional fields are normalized.');
 const output={date:new Date().toISOString(),environment:'Node DOM harness, native Canvas and mocked HTML Audio; no browser',passed:report,conversations,states:[...states],limitations:['Responsive CSS, actual browser sound, keyboard events, gamepad and touch require browser verification.']};fs.writeFileSync(path.join(__dirname,'cozy-results.json'),JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
}
main().catch(e=>{console.error(e.stack);process.exit(1);});
