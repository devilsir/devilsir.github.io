'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const{environment}=require('./runtime-upgrade-test.cjs');
const root=path.resolve(__dirname,'..'),wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<400;i++){if(fn())return;await wait(50);}throw Error('Timed out waiting for duo startup');}
async function run(){
 const parent=await environment(),V=parent.V;await V.Game.init();V.settings.playerCharacters=['nia','leo'];V.settings.challengePlayers=2;V.Game.newState({name:'Dupla em teste',character:'nia'});V.state.flags.prologueDone=true;V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();V.GuideOverlay.hide();V.Onboarding.active=false;
 V.DuoChallenges.launch('play:terra-mar',{mode:'normal',stage:0,difficulty:1});
 const children=[];
 for(let i=0;i<2;i++){
  let child;const proxy={postMessage(data){child.w.dispatchEvent(new child.w.MessageEvent('message',{data,source:bridge}));}},bridge={postMessage(data){V.DuoChallenges.receive({data,source:proxy});}};
  Object.defineProperty(V.DuoChallenges.frames[i],'contentWindow',{configurable:true,value:proxy});
  child=await environment({child:true,parent:bridge,index:i,token:V.DuoChallenges.session.id});children.push(child);await child.V.Game.init();await until(()=>V.$('#duo-loading-'+i).hidden);child.V.Playground.update(.02);
 }
 const results=[],check=(name,fn)=>{try{fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.stack});console.error(name,e.stack);}};
 check('two viewers start with their selected characters',()=>{assert.equal(children[0].V.state.character,'nia');assert.equal(children[1].V.state.character,'leo');assert(children.every(c=>c.V.Playground.active.game==='terra-mar'));});
 check('WASD and arrows cannot control the other viewer',()=>{const left=children[0].V.Playground.active,right=children[1].V.Playground.active;const m0=left.moves,m1=right.moves;V.DuoChallenges.physical('KeyA',true);assert.equal(left.moves,m0+1);assert.equal(right.moves,m1);V.DuoChallenges.physical('ArrowRight',true);assert.equal(right.moves,m1+1);assert.equal(left.moves,m0+1);V.DuoChallenges.physical('KeyA',false);V.DuoChallenges.physical('ArrowRight',false);});
 check('each viewer has an independent input state and camera',()=>{assert.notEqual(children[0].V.Input,children[1].V.Input);assert.notEqual(children[0].V.World.camera,children[1].V.World.camera);V.DuoChallenges.physical('KeyW',true);assert(children[0].V.Input.down('w'));assert(!children[1].V.Input.down('w'));V.DuoChallenges.physical('KeyW',false);});
 check('pausing one viewer leaves the other running',()=>{const left=children[0].V.Playground.active,right=children[1].V.Playground.active;V.DuoChallenges.pause(0,true);const time=left.elapsed,time1=right.elapsed;children[0].V.Game.update(.03);children[1].V.Game.update(.03);assert.equal(left.elapsed,time);assert(right.elapsed>time1);V.DuoChallenges.pause(0,false);});
 check('focus changes do not open a blocking pause dialog',()=>{for(const child of children){child.V.Game.pause('A janela perdeu o foco.');assert.equal(child.V.modal,false);}});
 check('child runtimes never write profile storage',()=>{for(const child of children)assert.equal(child.w.localStorage.length,0);});
 check('both checkpoints are kept in the parent profile',()=>{for(let i=0;i<2;i++)V.DuoChallenges.send(i,{type:'command',command:'save'});assert(V.state.duoChallenge.snapshots.every(s=>s?.state&&s?.checkpoint?.runKey));assert.equal(V.state.duoChallenge.snapshots[1].state.character,'leo');assert(!V.state.duoChallenge.snapshots[0].state.duoChallenge);});
 check('restarting a viewer creates a new run',()=>{const old=children[0].V.Playground.active.id;V.DuoChallenges.send(0,{type:'command',command:'restart'});assert.notEqual(children[0].V.Playground.active.id,old);});
 // Native render at the focused half-screen viewport dimensions.
 for(const[i,child]of children.entries()){const canvas=child.w.document.createElement('canvas');canvas.width=500;canvas.height=560;child.V.Playground.sceneBounds=()=>({x:0,y:0,w:500,h:560});child.V.Playground.render(canvas.getContext('2d'));fs.writeFileSync(path.join(root,'.qa/review','duo-view-'+i+'.png'),child.canvases.get(canvas).canvas.toBuffer('image/png'));}
 children[0].V.Playground.active.data.hits=3;V.DuoChallenges.send(0,{type:'command',command:'save'});const savedRun=children[0].V.Playground.active.id;
 check('leaving waits for both checkpoint acknowledgements',()=>{V.DuoChallenges.exit();assert.equal(V.DuoChallenges.active,false);assert.equal(V.state.duoChallenge.snapshots[0].state.playground.runs[V.state.duoChallenge.snapshots[0].checkpoint.runKey].data.hits,3);assert.equal(V.$('#app').inert,false);});
 for(const child of children){child.V.MapAssets.cancel();child.dom.window.close();}children.length=0;
 V.DuoChallenges.launch('play:terra-mar',{mode:'normal',stage:0,difficulty:1});
 let resumed;const resumeProxy={postMessage(data){resumed.w.dispatchEvent(new resumed.w.MessageEvent('message',{data,source:resumeBridge}));}},resumeBridge={postMessage(data){V.DuoChallenges.receive({data,source:resumeProxy});}};
 Object.defineProperty(V.DuoChallenges.frames[0],'contentWindow',{configurable:true,value:resumeProxy});resumed=await environment({child:true,parent:resumeBridge,index:0,token:V.DuoChallenges.session.id});children.push(resumed);await resumed.V.Game.init();await until(()=>V.$('#duo-loading-0').hidden);
 check('reopening restores the saved run and its progress',()=>{assert.equal(resumed.V.Playground.active.id,savedRun);assert.equal(resumed.V.Playground.active.data.hits,3);});
 fs.writeFileSync(path.join(root,'.qa/review/duo-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 for(const child of children){child.V.MapAssets.cancel();child.dom.window.close();}V.DuoChallenges.active=false;V.MapAssets.cancel();parent.dom.window.close();process.exit(results.some(r=>!r.pass)?1:0);
}
run().catch(e=>{console.error(e.stack);process.exit(1);});
