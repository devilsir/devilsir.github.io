'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{environment}=require('./runtime-upgrade-test.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa/review');
(async()=>{const{V,w,dom,canvases}=await environment();await V.Game.init();V.settings.playerCharacters=['nia','leo'];V.settings.challengePlayers=2;V.settings.worldHours=false;V.settings.npcHomeRoutines=false;V.settings.muted=true;V.Game.newState({name:'Histórias e mar',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();await V.MapAssets.whenReady();V.DuoTutorial.finish(0,true);V.DuoTutorial.finish(1,true);V.DuoPanels.closeAll();V.UI.close();V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();
 const D=V.DuoWorld;D.withActor(0,()=>V.World.load('food-museum'));D.withActor(1,()=>V.World.load('harbor'));await V.MapAssets.whenReady();
 for(const[i,id]of [[0,'food-museum-curator'],[1,'marine-watch-harbor']])D.withActor(i,()=>{const o=V.World.current.objects.find(o=>o.id===id);Object.assign(V.Player.data,{x:o.x,y:o.y+55});});
 V.Progress.ensure().clock.hour=13.4;D.persist();const state=JSON.parse(JSON.stringify(V.state));delete state.profileId;state.map='food-museum';state.position={x:D.actors[0].data.x,y:D.actors[0].data.y};assert(V.Save.stateValid(state));
 fs.writeFileSync(path.join(out,'preview-community-stories.json'),JSON.stringify({format:'voices-save',version:1,state,settings:V.settings}));
 for(const[id,cam,file]of [['harbor',{x:34*T(),y:23*T()},'marine-harbor-world'],['cape-town',{x:36*T(),y:18*T()},'marine-cape-world']]){
  D.withActor(0,()=>V.World.load(id));await V.MapAssets.whenReady();D.withActor(0,()=>{const m=V.World.current;V.World.transition=0;V.World.camera=cam;const canvas=w.document.createElement('canvas');canvas.width=960;canvas.height=620;V.Cozy.render(canvas.getContext('2d'));fs.writeFileSync(path.join(out,file+'.png'),canvases.get(canvas).canvas.toBuffer('image/png'));});
 }
 V.MapAssets.cancel();dom.window.close();console.log('Created preview profile and two coastal views.');process.exit(0);
 function T(){return 48;}
})().catch(e=>{console.error(e.stack);process.exit(1);});
