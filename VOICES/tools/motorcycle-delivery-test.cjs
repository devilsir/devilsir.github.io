'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{environment}=require('./runtime-upgrade-test.cjs');
(async()=>{
 const e=await environment({bundle:process.argv.includes('--bundle')}),{V,w,canvases}=e,P=V.Playground;
 await V.Game.init();V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;V.Game.newState({name:'Correio · verificação',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();
 const C=P.controllers.moto,out=path.resolve(__dirname,'../.qa/review');fs.mkdirSync(out,{recursive:true});
 let serial=0;function fresh(){P.detach();V.UI.close();P.ensure().guides.moto={status:'complete'};P.launch('moto',null,{kind:'stage',id:'delivery-test-'+(++serial),stage:0});const r=P.active;r.calm=false;V.Input.clear();return r;}
 function tick(r,n){for(let i=0;i<n;i++)C.update(r,.04);}
 function select(r){P.action('moto-select',r.data.house.options.indexOf(r.data.house.item));}
 const check=(name,fn)=>{fn();console.log('PASS '+name);};
 check('throttle reaches 80 km/h, braking and coasting never go below 15, and saved speeds are clamped',()=>{
  const r=fresh(),d=r.data;d.worldOrigin=100000;d.house=C.houseAt(r,0);d.speed=20;V.Input.keys.add('d');tick(r,25);assert(d.speed>34&&d.speed<39);V.Input.clear();const coast=d.speed;tick(r,20);assert(Math.abs(d.speed-coast)<2);tick(r,25);assert(d.speed<coast&&d.speed>coast-3);
  V.Input.keys.add('a');tick(r,50);assert.equal(d.speed,15);assert(C.roadSpeed(r)>0);assert(d.bikeX>250&&d.bikeX<300);V.Input.clear();V.Input.keys.add('d');tick(r,150);assert.equal(d.speed,80);V.Input.clear();V.Input.keys.add('a');tick(r,100);V.Input.clear();tick(r,100);assert.equal(d.speed,15);
  for(const route of [0,5]){d.route=route;assert.equal(C.maxSpeed(r),80);}d.speed=0;C.ready(r);assert.equal(d.speed,15);d.speed=120;C.ready(r);assert.equal(d.speed,80);
 });
 check('aiming slows the street while charge and angle remain responsive and bounded',()=>{
  const r=fresh(),d=r.data;select(r);d.speed=30;const start=d.scroll;tick(r,20);const normal=d.scroll-start;
  C.beginAim(r,'toggle');const before=d.scroll;V.Input.keys.add('w');tick(r,20);V.Input.clear();assert(d.scroll-before<normal*.65);assert(d.aim.power>.65);assert(d.aim.angle>70);tick(r,60);assert.equal(d.aim.power,1);assert(d.aim.angle<=75);
 });
 check('force and angle produce ballistic flights and launch momentum has a predictable effect',()=>{
  const r=fresh(),d=r.data;d.speed=15;const soft=C.shot(r,{power:.2,angle:52}),strong=C.shot(r,{power:.8,angle:52});assert(strong.land>soft.land+150);
  for(const f of [soft,strong,C.shot(r,{power:.8,angle:72})]){const end=C.point(f,f.duration);assert(Math.abs(end.y-384)<1e-8);assert(Math.abs(end.x-f.land)<1e-8);}
  d.speed=40;const moving=C.shot(r,{power:.8,angle:52});assert(Math.abs(moving.land-strong.land-25*4.4*.72*strong.duration)<1e-7);
 });
 check('pulling back sets force and angle directly; small pointer tremors do not change modes',()=>{
  const r=fresh();select(r);C.beginAim(r,'canvas',7,{x:700,y:220});C.aimPoint(r,{x:695,y:223});assert.equal(r.data.aim.dragged,false);
  C.aimPoint(r,{x:560,y:310});assert(r.data.aim.dragged);assert(r.data.aim.power>.9);assert(r.data.aim.angle>30&&r.data.aim.angle<35);const power=r.data.aim.power;tick(r,10);assert.equal(r.data.aim.power,power);
 });
 check('preview and impact agree exactly, and braking in flight never steers a parcel or pays twice',()=>{
  const r=fresh(),d=r.data;select(r);d.speed=24;C.beginAim(r,'toggle');d.aim.power=.65;d.aim.angle=50;const preview=C.shot(r);d.worldOrigin=preview.land;d.house=C.houseAt(r,0);const coins=V.Life.ensure().coins;
  C.release(r);const vx=d.flight.vx;V.Input.keys.add('a');tick(r,4);assert.equal(d.flight.vx,vx);for(let i=0;i<100&&d.phase==='flight';i++)C.update(r,.04);V.Input.clear();assert.equal(d.phase,'resolved');assert.equal(d.hits,1);assert.equal(d.perfects,1);assert(Math.abs(d.result.impact.x-preview.land)<1e-7);assert.equal(V.Life.ensure().coins,coins);assert(r.score>=180);
  const score=r.score;C.resolve(r,true,true,'ok');assert.equal(d.hits,1);assert.equal(V.Life.ensure().coins,coins);assert.equal(r.score,score);
 });
 check('a wrong parcel still fails even when the landing is perfect',()=>{
  const r=fresh(),d=r.data;d.selected=d.house.options.find(kind=>kind!==d.house.item);d.speed=15;C.beginAim(r,'toggle');d.aim.power=.6;d.worldOrigin=C.shot(r).land;d.house=C.houseAt(r,0);C.release(r);for(let i=0;i<100&&d.phase==='flight';i++)C.update(r,.04);assert.equal(d.result.reason,'item');assert.equal(d.hits,0);assert.equal(d.lives,3);
 });
 check('a passed doorway advances at minimum speed, leaving the next delivery reachable',()=>{
  const r=fresh(),d=r.data;d.speed=15;d.acceleration=0;d.worldOrigin=d.scroll+C.hand(r).x-50;d.house=C.houseAt(r,0);C.update(r,.04);assert.equal(d.result.reason,'missed');assert.equal(d.attempts,1);tick(r,30);assert.equal(d.house.index,1);assert(d.house.x>C.hand(r).x+300);assert.equal(d.phase,'ride');
 });
 check('completed routes keep phase rewards, advance once and preserve circuit and free sessions',()=>{
  const r=fresh();r.data.hits=6;r.data.attempts=10;const coins=V.Life.ensure().coins;C.finishRoute(r);V.ChallengeEconomy.flush();assert(V.$('#phase-continue'));assert.equal(r.rewards.coins,28);assert.equal(V.Life.ensure().coins-coins,28);assert.equal(r.data.route,1);C.finishRoute(r);assert.equal(r.rewards.coins,28);V.$('#phase-continue').click();
  for(const free of [false,true]){P.detach();V.UI.close();V.ArcadeExpansion.launch('moto',free,0);const run=P.active;run.data.hits=6;run.data.attempts=10;C.finishRoute(run);V.ChallengeEconomy.flush();assert.equal(run.arcade.leg,1);assert.equal(run.data.route,1);assert.equal(run.rewards.coins,28);assert(V.$('#phase-continue'));V.$('#phase-continue').click();assert(!run.finished);}
 });
 check('selection is separate from firing, pointer cancellation is safe and pause clears held throttle',()=>{
  const r=fresh(),d=r.data,slot=d.house.options.indexOf(d.house.item);V.$('#moto-box-'+slot).click();assert.equal(d.phase,'ride');assert.equal(d.selected,d.house.item);
  const button=V.$('#moto-throw'),event={button:0,pointerId:3,clientX:700,clientY:420,preventDefault(){},currentTarget:button};button.onpointerdown(event);assert.equal(d.phase,'aim');button.onpointercancel(event);assert.equal(d.phase,'ride');assert.equal(d.flight,null);assert.equal(r.moves,0);
  const throttle=V.$('#moto-forward');throttle.onpointerdown({...event,currentTarget:throttle,pointerId:5});P.pause();assert.equal(d.aim,null);assert.equal(d.phase,'ride');V.UI.close();const speed=d.speed;tick(r,12);assert(d.speed<=speed+1);
 });
 check('old saved routes retain their request, progress, rewards and in-flight trajectory',()=>{
  const r=fresh(),d=r.data;select(r);C.beginAim(r,'toggle');C.release(r);const flight=JSON.stringify(d.flight),house=JSON.stringify(d.house);d.version=4;d.hits=3;d.attempts=4;d.paid=19;d.perfects=2;d.lastAim={range:210,hang:.9};delete d.speed;delete d.acceleration;delete d.focus;
  C.ready(r);assert.equal(d.version,5);assert.equal(d.hits,3);assert.equal(d.attempts,4);assert.equal(d.paid,19);assert.equal(d.perfects,2);assert.equal(JSON.stringify(d.house),house);assert.equal(JSON.stringify(d.flight),flight);assert(Number.isFinite(d.speed));
  const saved=JSON.parse(JSON.stringify(r));P.attach(saved);assert.equal(saved.data.phase,'flight');assert.equal(saved.data.aim,null);assert.equal(saved.data.focus,1);
 });
 check('calm mode stays in motion and training completes without granting coins',()=>{
  const r=fresh();r.calm=true;r.data.worldOrigin=620;r.data.house=C.houseAt(r,0);tick(r,25);assert(r.data.house.x<620);assert(C.roadSpeed(r)>=15*4.4);
  P.detach();P.train('moto',{restart:true});const t=P.active;const coins=V.Life.ensure().coins;select(t);assert(t.ack);P.nextGuide();V.Input.keys.add('d');C.update(t,.04);V.Input.clear();assert(t.ack);P.nextGuide();C.beginAim(t,'toggle');t.data.aim.power=.6;t.data.worldOrigin=C.shot(t).land;t.data.house=C.houseAt(t,0);C.release(t);assert(t.ack);assert.equal(t.step,2);P.nextGuide();for(let i=0;i<100&&!t.ack;i++)C.update(t,.04);assert(t.ack);assert.equal(t.data.hits,1);assert.equal(V.Life.ensure().coins,coins);
 });
 check('the request says Encomenda: Water, updates once per delivery and respects reduced motion',()=>{
  const r=fresh();P.hud();const order=V.$('#moto-order');let animations=0;V.$('#moto-order-name').animate=()=>{animations++;};P.hud();P.hud();assert.equal(animations,0);
  r.data.house=C.houseAt(r,2);P.hud();assert.equal(order.textContent,'Encomenda: Water');assert.equal(C.model(r).request,'Encomenda: Water');assert.equal(animations,1);assert.equal(order.getAttribute('aria-live'),'polite');P.hud();assert.equal(animations,1);
  V.settings.reducedMotion=true;r.data.house=C.houseAt(r,3);P.hud();assert.equal(order.textContent,'Encomenda: Plant');assert.equal(animations,1);V.settings.reducedMotion=false;
  assert.equal(V.$('#moto-speed-meter').min,15);assert.equal(V.$('#moto-speed-meter').max,80);
 });
 check('the full 1280-wide scene is framed and pointer coordinates use the same transform',()=>{
  const r=fresh(),area=P.sceneBounds(),layout=P.layout(),bounds=V.Engine.canvas.getBoundingClientRect();
  assert(layout.x>=area.x);assert(layout.x+1280*layout.scale<=area.x+area.w+.01);
  const point={x:1190,y:400},event={clientX:bounds.left+(layout.x+point.x*layout.scale)*bounds.width/V.Engine.canvas.width,clientY:bounds.top+(layout.y+point.y*layout.scale)*bounds.height/V.Engine.canvas.height};
  const mapped=C.pointFromEvent(event);assert(Math.abs(mapped.x-point.x)<1e-7);assert(Math.abs(mapped.y-point.y)<1e-7);r.data.worldOrigin=1200;r.data.house=C.houseAt(r,0);assert(C.street(r).some(h=>h.index===0));
 });
 const rendered=fresh();await V.MapAssets.whenReady();
 check('the redesigned scene renders actual loaded artwork, charging, flight and reduced motion without leaking canvas state',()=>{
  const r=rendered;assert(V.ArcadeArt.images.get('delivery-rider-animated')?.naturalWidth>0);select(r);r.data.speed=28;r.data.worldOrigin=680;r.data.house=C.houseAt(r,0);C.beginAim(r,'toggle');r.data.aim.power=.68;P.hud();assert(V.$('#moto-power'));assert(V.$('#moto-speed-meter'));assert(V.$('#playground-root').classList.contains('moto-redesign'));
  for(const phase of ['aim','flight','reduced']){if(phase==='flight')C.release(r);if(phase==='reduced')V.settings.reducedMotion=true;const canvas=w.document.createElement('canvas');canvas.width=1280;canvas.height=540;const ctx=canvas.getContext('2d');C.draw(ctx,r);assert.equal(ctx.getTransform().a,1);assert.equal(ctx.getTransform().e,0);assert.equal(ctx.getImageData(1279,500,1,1).data[3],255);fs.writeFileSync(path.join(out,'moto-redesign-'+phase+'.png'),canvases.get(canvas).canvas.toBuffer('image/png'));}
  V.settings.reducedMotion=false;
 });
 V.MapAssets.cancel();e.dom.window.close();process.exit(0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
