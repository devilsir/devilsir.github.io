'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{environment}=require('./runtime-upgrade-test.cjs');
const root=path.resolve(__dirname,'..'),wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<400;i++){if(fn())return;await wait(50);}throw Error('Challenge startup timeout');}
async function run(){
 const base=await environment();await base.V.Game.init();base.V.settings.playerCharacters=['nia'];base.V.Game.newState({name:'Adapter test',character:'nia'});base.V.state.flags.prologueDone=true;const seed=JSON.parse(JSON.stringify(base.V.state));base.dom.window.close();const results=[];
 for(const key of process.argv[2]?[process.argv[2]]:['play:platform','culture:oware','legacy:restoration','fish:fishing','play:radio','play:rhythm']){
  let child;const messages=[],bridge={postMessage(m){messages.push(m);if(m.type==='ready')child.w.dispatchEvent(new child.w.MessageEvent('message',{source:bridge,data:{voicesDuo:'test-adapter',type:'boot',key,state:seed,settings:{muted:true,challengePlayers:1},options:{mode:'normal',stage:0,difficulty:1}}}));}};
  child=await environment({child:true,token:'test-adapter',index:1,parent:bridge});await child.V.Game.init();await until(()=>messages.some(m=>m.type==='started'));await until(()=>!child.V.MapAssets.busy);
  const send=(code,down=true)=>child.w.dispatchEvent(new child.w.MessageEvent('message',{source:bridge,data:{voicesDuo:'test-adapter',type:'input',code,down,repeat:false}}));
  try{
   const V=child.V;
   if(key==='play:platform'){const r=V.Playground.active;assert.equal(r.game,'platform');send('ArrowRight');assert(V.Input.down('d'));send('ArrowRight',false);const moves=r.moves;send('Enter');if(r.moves===moves)console.log('PLATFORM_INPUT',JSON.stringify({training:r.training,ack:r.ack,modal:V.modal,busy:V.MapAssets.busy,phase:r.data.phase,grounded:r.data.grounded,buffer:r.data.jumpBuffer,keys:[...V.Input.keys]}));assert(r.moves>moves||r.data.jumpBuffer>0);}
   if(key==='culture:oware'){const r=V.CultureChallenges.run();assert.equal(r.game,'oware');const pit=V.CultureChallenges.game('oware').stages[r.stage].pit;V.$('[data-oware-pit="'+pit+'"]').focus();send('Enter');assert.equal(r.data.selected,pit);send('ShiftRight');send('ShiftRight',false);send('ShiftRight');assert(r.moves>0||r.data.pending);}
   if(key==='legacy:restoration'){assert.equal(V.LearningArcade.ensure().run.game,'restoration');assert(V.modal);send('ArrowRight');send('Enter');}
   if(key==='fish:fishing'){assert(V.FishingChallenge.run);assert.match(V.$('#fish-game-action').textContent,/Enter/);assert.match(V.$('#fish-game-loosen').textContent,/Shift direito/);assert.match(V.$('.fish-game-tools>.sea-small').textContent,/↑ ← ↓ →/);send('Enter');assert(V.FishingChallenge.run.castCount>0);}
   if(key==='play:radio'){const r=V.Playground.active,d=r.data;send('ArrowDown');assert.equal(d.selected,1);const before=d.frequency[1];send('ArrowRight');assert.equal(d.frequency[1],before+1);send('Numpad1');assert.equal(d.selected,0);}
   if(key==='play:rhythm'){const r=V.Playground.active,before=r.moves;send('ArrowLeft');assert.equal(r.moves,before+1);}
   results.push({key,pass:true});
  }catch(error){results.push({key,pass:false,error:error.stack});console.error(key,error.stack);}
  child.V.MapAssets.cancel();child.dom.window.close();
 }
 const report=process.argv[2]?'adapter-'+process.argv[2].replace(':','-')+'-results.json':'adapter-results.json';fs.writeFileSync(path.join(root,'.qa/review',report),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));process.exit(results.some(r=>!r.pass)?1:0);
}
run().catch(e=>{console.error(e.stack);process.exit(1);});
