'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{environment}=require('./runtime-upgrade-test.cjs');
const root=path.resolve(__dirname,'..'),wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<600;i++){if(fn())return;await wait(50);}throw Error('Timed out waiting for profile startup');}
async function run(){
 const env=await environment(),{V,w}=env;await V.Game.init();
 const results=[],check=(name,fn)=>{try{fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.stack});console.error(name,e.stack);}};
 V.PlayerProfiles.form();V.$('#profile-player-count').value='2';V.$('#profile-player-count').onchange();V.$('[data-profile-character="leo"]').click();V.$('#profile-name').value='Dupla · entrada pelo perfil';V.$('#profile-create').click();
 await until(()=>!V.PlayerProfiles.busy&&V.Game.screen==='game');await V.MapAssets.whenReady();
 const profile=V.PlayerProfiles.activeId,D=V.DuoWorld;
 V.UI.close();V.Dialogue.active=false;V.$('#dialogue-root').innerHTML='';V.Onboarding.active=false;V.Onboarding.suspended=true;V.Tutorials.active=null;V.GuideOverlay.hide();V.state.flags.prologueDone=true;
 check('creating a duo profile immediately shows two world viewers',()=>{assert(D.visible);assert(!V.$('#duo-world-root').hidden);assert.equal(V.$$('[data-world-canvas]').length,2);assert.equal(D.actors[0].character,'nia');assert.equal(D.actors[1].character,'leo');assert.equal(V.DuoChallenges.active,false);});
 check('each viewer has its own circular menu',()=>{assert.equal(V.$$('.duo-world-menu').length,2);assert.equal(V.$$('[data-world-menu="interact"]').length,2);assert.equal(V.$$('[data-world-menu="challenges"]').length,2);});
 let space=null;const m=V.World.current;
 for(let y=160;y<m.height*48-100&&!space;y+=48)for(let x=100;x<m.width*48-180&&!space;x+=48){const points=[[x,y],[x+48,y],[x,y-12],[x+60,y]];if(points.every(([a,b])=>!V.Living.blocked(m,a,b,15)&&!m.objects.some(o=>V.Cozy.person(o)&&Math.hypot(o.x-a,o.y-b)<40)))space={x,y};}
 assert(space,'Open area for the movement checks');Object.assign(D.actors[0].data,space);Object.assign(D.actors[1].data,{x:space.x+48,y:space.y});V.Input.clear();
 check('WASD moves only player one during actual world updates',()=>{const a=D.actors[0].data,b=D.actors[1].data,y=a.y,x2=b.x,y2=b.y;V.Input.keys.add('w');V.Game.update(.04);V.Input.clear();assert(a.y<y);assert.equal(b.x,x2);assert.equal(b.y,y2);});
 check('arrows move only player two during actual world updates',()=>{const a=D.actors[0].data,b=D.actors[1].data,x=a.x,y=a.y,x2=b.x;V.Input.keys.add('arrowright');V.Game.update(.04);V.Input.clear();assert(b.x>x2);assert.equal(a.x,x);assert.equal(a.y,y);});
 check('Enter interacts from player two instead of player one',()=>{const nearest=V.Player.nearest,interact=V.Game.interact;let actor=null;const object={id:'test-p2-object',type:'sign',label:'Interação do jogador 2',x:D.actors[1].data.x,y:D.actors[1].data.y};V.Player.nearest=function(){return this.data===D.actors[1].data?object:null;};V.Game.interact=()=>actor={character:V.state.character,data:V.Player.data};V.Input.pressed.add('enter');V.Game.update(.02);V.Player.nearest=nearest;V.Game.interact=interact;assert.equal(actor?.character,'leo');assert.equal(actor?.data,D.actors[1].data);});
 check('world render draws both avatars in each independent camera',()=>{D.center();const calls=[],render=V.Player.render;V.Player.render=function(c){calls.push(V.state.character);return render.call(this,c);};V.Game.render(V.Engine.ctx);V.Player.render=render;assert.equal(calls.filter(id=>id==='nia').length,2);assert.equal(calls.filter(id=>id==='leo').length,2);assert.notEqual(D.actors[0].camera,D.actors[1].camera);assert(!m.objects.some(o=>o.type==='duo-world-player'));});
 const directory=path.join(root,'.qa/review');fs.mkdirSync(directory,{recursive:true});
 for(let i=0;i<2;i++){const c=V.$('[data-world-canvas="'+i+'"]');fs.writeFileSync(path.join(directory,'world-player-'+i+'.png'),env.canvases.get(c).canvas.toBuffer('image/png'));}
 check('saving keeps both positions and the first character as profile owner',()=>{V.Save.save();const saved=V.Save.load();assert.equal(saved.character,'nia');assert.equal(saved.duoWorld.players.length,2);assert.equal(saved.duoWorld.players[1].x,D.actors[1].data.x);});
 const positions=D.actors.map(a=>({x:a.data.x,y:a.data.y}));await V.PlayerProfiles.leave();await V.PlayerProfiles.enter(profile);await V.MapAssets.whenReady();V.UI.close();V.Dialogue.active=false;
 check('continuing an existing duo profile restores both screens and actors',()=>{assert(D.visible);assert.equal(V.$$('[data-world-canvas]').length,2);for(let i=0;i<2;i++){assert.equal(D.actors[i].data.x,positions[i].x);assert.equal(D.actors[i].data.y,positions[i].y);}});
 V.World.load('library');await V.MapAssets.whenReady();
 check('a map change moves only the requesting player',()=>{assert.equal(V.World.current.id,'library');assert(D.visible);assert.equal(V.state.duoWorld.map,'library');assert.equal(D.actors[0].map,'library');assert.notEqual(D.actors[1].map,'library');for(let i=0;i<2;i++)assert(!V.Living.blocked(V.World.maps[D.actors[i].map],D.actors[i].data.x,D.actors[i].data.y,10));});
 await V.PlayerProfiles.create('Solo depois da dupla','sol',null,{playerCharacters:['sol'],challengePlayers:1});await V.MapAssets.whenReady();
 check('switching to a solo profile restores one viewer',()=>{assert(!D.enabled());assert(!V.$('#duo-world-root'));assert(!w.document.body.classList.contains('duo-world-active'));});
 fs.writeFileSync(path.join(directory,'duo-world-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));V.MapAssets.cancel();env.dom.window.close();process.exit(results.some(r=>!r.pass)?1:0);
}
run().catch(e=>{console.error(e.stack);process.exit(1);});
