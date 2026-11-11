/* Registered module: motorcycle-delivery */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define('motorcycle-delivery', initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function () {
'use strict';
const V=window.V, P=V.Playground, D=V.PlaygroundData, A=V.ArcadeArt;
const art=['house-blue','house-red','house-yellow'], spacing=470, gravity=620, landingY=384, units=4.4, sceneWidth=1280, minSpeed=15, maxSpeed=80;
const items=[['light','Light','lâmpada'],['book','Book','livro'],['water','Water','água'],['plant','Plant','planta'],['clock','Clock','relógio'],['bread','Bread','pão'],['ball','Ball','bola'],['key','Key','chave'],['apple','Apple','maçã'],['umbrella','Umbrella','guarda-chuva'],['cup','Cup','xícara'],['backpack','Backpack','mochila']].map(([id,en,pt])=>({id,en,pt,asset:'delivery-'+id}));
const routes=['Orla tranquila','Rua das flores','Bairro das cores','Subida do mirante','Rota do mercado','Expresso da baía'];
const input={directions:new Map(),aimPointer:null};
const second=()=>V.DuoChallenges?.isChild&&new URLSearchParams(location.search).get('player')==='1';
function clearInput(){input.directions.clear();input.aimPointer=null;}
const game={id:'moto',title:'Correio sobre Rodas',tag:'RITMO · PRECISÃO · ENTREGA',color:'#eab48d',description:'Encontre o seu ritmo na orla. Acelere, freie e prepare um arremesso em foco: a força, o ângulo e o embalo da moto definem onde a encomenda chega.',goal:'Leia os pedidos em inglês e entregue o objeto certo em 6 das 10 casas. Acerte o centro da porta para ganhar mais pontos.',keys:'D / →: acelerar · A / ←: frear · 1–3: objeto · segure Espaço, ajuste com ↑/↓ e solte · no toque, puxe para trás e solte',icon:'courier',stages:6};
D.games.push(game);
const C=P.controllers.moto={
 create(training,start=0){return{version:5,route:start,stageReady:false,selected:null,house:null,worldOrigin:training?600:1020,phase:'ride',scroll:0,bikeX:275,bikeVx:0,speed:28,acceleration:0,focus:1,lastAim:{angle:52,power:.2},aim:null,hits:0,attempts:0,lives:4,flash:0,wait:0,throwPose:0,flight:null,paid:0,perfects:0,braking:false,result:null,effects:[]};},
 ready(r){
  const d=r.data;
  // Older saves keep their route, request, rewards and any package already in flight.
  if(d.version!==4&&d.version!==5){
   const old=d.house||{x:1080},index=Math.max(0,(d.attempts||0)-(d.phase==='resolved'?1:0)),flight=d.flight;
   d.worldOrigin=Number.isFinite(d.worldOrigin)?d.worldOrigin:(Number.isFinite(old.x)?old.x:1080)+(d.scroll||0)-index*spacing;
   d.scroll||=0;d.route||=0;d.bikeX=245;d.bikeVx=0;d.aim=null;d.house=old.options?old:this.houseAt(r,index);d.house.index??=index;d.perfects||=0;d.paid||=0;d.effects||=[];
   if(flight){const t=V.clamp((flight.time||0)/(flight.duration||.82),0,1),from=flight.from||{x:364,y:293},to=flight.to||{x:d.house.x,y:landingY},duration=Math.max(.12,(flight.duration||.82)-(flight.time||0)),x=d.scroll+from.x+(to.x-from.x)*t,y=from.y+(to.y-from.y)*t-Math.sin(t*Math.PI)*111,target=d.worldOrigin+d.house.index*spacing+(flight.valid?0:130);d.flight={time:0,duration,x0:x,y0:y,vx:(target-x)/duration,vy:(landingY-y-.5*gravity*duration*duration)/duration,kind:flight.kind??d.house.item,launchSpeed:flight.velocity||0,legacyValid:!!flight.valid,trail:[]};d.phase='flight';}
   if(d.result){d.result.reason=d.result.reason==='color'?'item':d.result.reason;d.result.impact||={x:d.worldOrigin+d.house.index*spacing,y:landingY};}
   if(r.training&&r.step>0)r.step=r.step===1?2:3;
  }
  if(d.version!==5){d.speed=V.clamp(((112+Math.min(5,d.route||0)*13+(r.difficulty||0)*9)*(d.braking?.44:1)+(d.bikeVx||0))/units,minSpeed,maxSpeed);d.acceleration=0;d.focus=1;d.lastAim={angle:52,power:.2};d.aim=null;d.braking=false;if(d.phase==='aim')d.phase='ride';d.version=5;}
  d.speed=V.clamp(Number.isFinite(d.speed)?d.speed:28,minSpeed,maxSpeed);
  if(!d.stageReady){d.route=r.arcade?(r.arcade.start+r.arcade.leg)%6:r.startStage||d.route||0;d.stageReady=true;d.house=this.houseAt(r,0);}
  if(!d.house)d.house=this.houseAt(r,d.attempts||0);
  return d;
 },
 order(index,route){return((index+route*2)%items.length+items.length)%items.length;},
 choices(index,route){const target=this.order(index,route),offset=1+(Math.floor(index/3)+route)%4,list=[target,(target+offset)%items.length,(target+offset+1)%items.length],shift=(index*2+route+1)%3;return list.slice(shift).concat(list.slice(0,shift));},
 kind(index,route=0){return((index*7+route+Math.floor(index/3))%3+3)%3;},
 houseAt(r,index){const d=r.data;return{index,x:d.worldOrigin+index*spacing-d.scroll,kind:this.kind(index,d.route),number:68+index*2,item:this.order(index,d.route),options:this.choices(index,d.route)};},
 street(r){const d=this.ready(r),first=Math.floor((d.scroll-d.worldOrigin-170)/spacing),out=[];for(let i=first;i<=first+Math.ceil(sceneWidth/spacing)+3;i++){const h=this.houseAt(r,i);if(h.x>=-170&&h.x<=sceneWidth+170)out.push(h);}return out;},
 advance(r,movement){const d=r.data;d.scroll+=movement;if(r.training&&!['flight','resolved'].includes(d.phase))d.worldOrigin+=movement;d.house.x=d.worldOrigin+d.house.index*spacing-d.scroll;},
 target(r){return r.training?1:10;},
 maxSpeed(){return maxSpeed;},
 speed(r){return V.clamp(r.data.speed,minSpeed,maxSpeed)*units;},
 roadSpeed(r){return this.speed(r);},
 velocity(r){return this.roadSpeed(r);},
 hand(r){return{x:r.data.bikeX-95+133*190/160,y:487-152+16*152/128};},
 shot(r,aim=r.data.aim||r.data.lastAim){
  const d=r.data,from=this.hand(r),power=V.clamp(aim.power??.2,0,1),angle=V.clamp(aim.angle??52,20,75),rad=angle*Math.PI/180,impulse=160+power*390,launchSpeed=this.velocity(r),vx=Math.cos(rad)*impulse+launchSpeed*.72,vy=-Math.sin(rad)*impulse;
  const duration=(-vy+Math.sqrt(vy*vy+2*gravity*(landingY-from.y)))/gravity,x0=d.scroll+from.x,y0=from.y,land=x0+vx*duration,error=land-(d.worldOrigin+d.house.index*spacing);
  return{time:0,duration,x0,y0,vx,vy,kind:d.selected,launchSpeed,land,error,power,angle,willHit:Math.abs(error)<=39,perfect:Math.abs(error)<=14,trail:[]};
 },
 point(f,t){return{x:f.x0+f.vx*t,y:f.y0+f.vy*t+.5*gravity*t*t};},
 aimPoint(r,p){
  const aim=r.data.aim;if(!aim?.origin)return;
  const dx=aim.origin.x-p.x,dy=p.y-aim.origin.y,distance=Math.hypot(dx,dy);
  aim.pointer={...p};
  if(distance<12&&!aim.dragged)return;
  aim.dragged=true;aim.power=V.clamp(distance/175,.06,1);aim.angle=V.clamp(Math.atan2(Math.max(0,dy),Math.max(8,dx))*180/Math.PI,20,75);
 },
 beginAim(r,source='keyboard',pointerId=null,p=null){
  const d=this.ready(r);if(r.finished||r.arcade?.break||V.modal||r.training&&r.ack||!['ride','aim'].includes(d.phase)||d.aim)return false;
  if(d.selected===null){r.feedback='Escolha uma encomenda antes de preparar o lançamento.';return false;}
  d.phase='aim';d.aim={angle:d.lastAim.angle||52,power:.12,held:0,source,pointerId,origin:p?{...p}:null,pointer:p?{...p}:null,dragged:false};return true;
 },
 cancelAim(r){const d=r?.data;if(!d)return;if(d.phase==='aim')d.phase='ride';d.aim=null;input.aimPointer=null;},
 cancelInput(r){this.cancelAim(r);clearInput();},
 keyUp(r,key){if(![' ','e','enter'].includes(key)||r.data.aim?.source!=='keyboard')return false;if(V.modal)this.cancelAim(r);else this.release(r);return true;},
 release(r){
  const d=this.ready(r);if(d.phase!=='aim'||!d.aim||r.finished||r.training&&r.ack||V.modal)return;
  const f=this.shot(r);d.lastAim={angle:d.aim.angle,power:d.aim.power};d.aim=null;input.aimPointer=null;d.phase='flight';d.flight=f;d.throwPose=.4;r.moves++;V.Audio.sfx('menu');
  if(r.training&&f.willHit&&f.kind===d.house.item)P.event('moto-throw');
 },
 action(r,name,arg){
  const d=this.ready(r);if(r.finished||r.arcade?.break||r.training&&r.ack)return;
  if(name==='moto-select'){if(!Number.isInteger(arg)||arg<0||arg>2||!['ride','aim'].includes(d.phase))return;d.selected=d.house.options[arg];V.Audio.sfx('menu');if(r.training&&r.step===0){if(d.selected===d.house.item)P.event('moto-select');else P.feedback('Light é uma lâmpada. Procure a imagem correspondente.',true);}return;}
  if(name==='moto-brake'){d.braking=!d.braking;V.Audio.sfx('menu');return;}
  if(name==='moto-aim')return this.beginAim(r);
  if(name==='moto-release')return this.release(r);
  if(name==='moto-cancel')return this.cancelAim(r);
 },
 resolve(r,valid,perfect,reason,impact){
  const d=this.ready(r);if(r.finished||d.phase==='resolved'||r.arcade?.break)return;
  const f=d.flight,item=items[d.house.item];d.phase='resolved';d.attempts++;d.flash=1.2;d.wait=1.05;d.result={valid,perfect,reason,kind:d.house.item,parcel:f?.kind??d.selected??d.house.item,number:d.house.number,coins:0,impact:impact||{x:d.worldOrigin+d.house.index*spacing,y:landingY},spin:f?Math.sign(f.vx):1};
  if(valid){d.hits++;if(perfect)d.perfects++;const before=r.score;P.hit(perfect?180:120);d.result.points=r.score-before;P.feedback((perfect?'Perfect delivery!':'Delivered!')+' '+item.en+' = '+item.pt+(r.training?'':' · +'+d.result.points+' pontos'));if(r.training)P.event('moto-land');}
  else{if(!r.training&&!r.arcade?.free)d.lives=Math.max(0,d.lives-1);P.feedback(({item:'O pedido era '+item.en+' ('+item.pt+'). Confira a imagem na próxima casa.',short:'Faltou alcance. Carregue mais força ou aproxime a moto.',long:'Passou da porta. Use menos força ou reduza a velocidade.',missed:'Esta casa ficou para trás. Prepare a próxima entrega.'})[reason]||'Ajuste o arremesso na próxima entrega.',true);}
  d.lastGood=valid;d.flight=null;d.effects=Array.from({length:valid?10:4},(_,i)=>({x:d.result.impact.x,y:d.result.impact.y,time:0,angle:i*Math.PI*2/(valid?10:4)}));P.save();
 },
 finishRoute(r){const d=r.data;if(r.training)return;if(d.attempts>=this.target(r)){if(d.hits>=6){P.stageClear(r,d.route);P.finish();}else this.failed(r);}else if(d.lives===0&&!r.arcade?.free)this.failed(r);},
 failed(r){
  if(r.finished)return;r.finished=true;r.failed=true;r.returned=true;if(r.arcade)V.ArcadeExpansion?.record(r);P.ensure().current=null;P.save();
  V.UI.modal('Vamos encontrar outro ritmo?','CORREIO SOBRE RODAS',`<div class="pg-result"><h3>${r.data.hits} entregas certas</h3><p>${r.data.perfects} entregas perfeitas · ${r.data.paid} moedas guardadas.</p><p>Freie na aproximação, prepare a força e solte quando a marca de queda estiver na porta.</p></div>`,'<button id="moto-retry" class="primary">Tentar novamente</button><button id="moto-calm" class="secondary">Modo tranquilo</button><button id="moto-exit" class="secondary">Voltar à cidade</button>');
  V.UI.onClose=()=>{P.ensure().current=null;P.detach();P.save();};const retry=calm=>{const context={...r.context};V.UI.onClose=null;V.UI.close();P.detach();const next=P.make('moto',r.key,context);next.calm=calm;P.attach(next);};V.$('#moto-retry').onclick=()=>retry(false);V.$('#moto-calm').onclick=()=>retry(true);V.$('#moto-exit').onclick=()=>V.UI.close();
 },
 update(r,dt){
  const d=this.ready(r);if(r.finished||r.arcade?.break||r.training&&r.ack)return;dt=V.clamp(dt,0,.04);
  d.flash=Math.max(0,d.flash-dt);d.throwPose=Math.max(0,d.throwPose-dt);for(const e of d.effects)e.time+=dt;d.effects=d.effects.filter(e=>e.time<1.1);
  const axis=V.clamp((V.Input.down('d')||V.Input.down('arrowright')?1:0)-(V.Input.down('a')||V.Input.down('arrowleft')?1:0)+(V.Input.touch?.x||0)+(V.Input.gamepad?.x||0)+([...input.directions.values()].at(-1)||0),-1,1);
  if(axis>0)d.braking=false;
  const acceleration=axis<0||d.braking?-42:axis>0?18:-.85;
  d.acceleration+=(acceleration-d.acceleration)*Math.min(1,dt*12);d.speed=V.clamp(d.speed+d.acceleration*dt,minSpeed,maxSpeed);
  d.bikeX+=(275+V.clamp(d.acceleration,-30,18)*.45-d.bikeX)*Math.min(1,dt*6);d.bikeVx=0;
  if(r.training&&r.step===1&&axis!==0){P.event('moto-move');if(r.ack)return;}
  if(d.aim){
   d.aim.held+=dt;
   if(!d.aim.dragged)d.aim.power=V.clamp(.12+d.aim.held/1.35,.12,1);
   const tilt=(V.Input.down('w')||V.Input.down('arrowup')?1:0)-(V.Input.down('s')||V.Input.down('arrowdown')?1:0);
   d.aim.angle=V.clamp(d.aim.angle+tilt*38*dt,20,75);
  }
  d.focus+=((d.aim ? (r.calm ? .28 : .38) : 1)-d.focus)*Math.min(1,dt*10);const worldDt=dt*d.focus;
  this.advance(r,this.roadSpeed(r)*worldDt);
  if(d.phase==='flight'){
   const f=d.flight;f.time=Math.min(f.duration,f.time+worldDt);const at=this.point(f,f.time);f.trail.push(at);f.trail=f.trail.slice(-9);
   if(f.time>=f.duration){const error=at.x-(d.worldOrigin+d.house.index*spacing),right=f.kind===d.house.item,valid=f.legacyValid??(right&&Math.abs(error)<=39);this.resolve(r,valid,valid&&Math.abs(error)<=14,valid?'ok':!right?'item':error<0?'short':'long',at);}return;
  }
  if(d.phase==='resolved'){
   d.wait=Math.max(0,d.wait-dt);if(d.wait>0)return;
   if(r.training){if(d.result?.valid)return;d.phase='ride';d.attempts=0;d.result=null;d.flash=0;return;}
   this.finishRoute(r);if(r.finished||r.arcade?.break)return;d.house=this.houseAt(r,d.house.index+1);d.selected=null;d.result=null;d.phase='ride';r.feedback='';P.hud();P.save();return;
  }
  if(d.house.x<this.hand(r).x-42){this.cancelAim(r);this.resolve(r,false,false,'missed');}
 },
 guideStep(r){const d=this.ready(r);clearInput();if(r.step<3){d.scroll=0;d.worldOrigin=600;d.house=this.houseAt(r,0);d.bikeX=275;d.speed=28;d.acceleration=0;d.focus=1;d.phase='ride';d.aim=null;d.flight=null;d.wait=0;d.result=null;d.selected=r.step===0?null:d.house.item;}},
 hint(r){r.calm=true;const d=this.ready(r);P.feedback('Foco tranquilo ativo. '+items[d.house.item].en+' é '+items[d.house.item].pt+'. A moto continua: solte quando a marca de queda estiver dentro da porta.');},
 spot(r){return{x:r.step===1?r.data.bikeX:600,y:385,w:230,h:180};},
 model(r){const d=this.ready(r);return{request:'Encomenda: '+items[d.house.item].en,support:'CASA '+d.house.number+' · '+routes[d.route%6],progress:d.attempts,total:this.target(r),hint:d.phase==='aim'?'Solte para lançar. '+(second()?'↑/↓':'W/S')+' ajustam o ângulo; arraste para controlar a força.':r.calm?'Modo tranquilo: mais tempo para mirar, sempre em movimento.':'Pilote entre 15 e 80 km/h. Segure para carregar ou puxe para trás e solte.'};},
 card(c,x,y,w,h,color='#183c46'){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,12);c.fill();},
 item(c,x,y,kind,size=36){if(Number.isInteger(kind)&&items[kind])A.draw(c,items[kind].asset,x-size/2,y-size/2,size,size);},
 house(c,r,h,active){
  const{x,kind,number}=h;if(x<-170||x>sceneWidth+170)return;
  V.SceneShadows.contact(c,x,438,120,9,.12);A.draw(c,art[kind],x-142,184,284,255);
  if(!active)return;
  const f=r.data.aim?this.shot(r):null,ready=f?.willHit,color=ready?'#83ddc5':'#f5c98d';
  c.save();c.fillStyle=ready?'#8eebcc30':'#fff4da24';c.fillRect(x-32,327,64,95);c.strokeStyle=color;c.lineWidth=2;c.setLineDash([5,5]);c.strokeRect(x-35,324,70,99);c.setLineDash([]);
  c.fillStyle=ready?'#c2f6e0':'#fff1ce';c.beginPath();c.ellipse(x,405,42,10,0,0,Math.PI*2);c.fill();c.strokeStyle=ready?'#246f62':'#a27b50';c.lineWidth=1.5;c.stroke();
  this.card(c,x-61,230,122,32,'#fff7e6');P.text(c,'CASA '+number,x,247,13,'#264b50');c.restore();
 },
 rider(c,r){
  const d=r.data,img=A.images.get('delivery-rider-animated'),fallback=A.images.get('delivery-rider'),pose=d.aim||d.throwPose>.24?2:d.throwPose>0?3:0,bob=V.settings.reducedMotion?0:Math.sin(d.scroll*.1)*Math.min(1,d.speed/50);
  V.SceneShadows.contact(c,d.bikeX,488,86,6,.2);
  c.save();c.translate(d.bikeX,480);if(!V.settings.reducedMotion)c.rotate(V.clamp(-d.acceleration*.001,-.018,.025));c.translate(-d.bikeX,-480);
  if(img)c.drawImage(img,pose*img.naturalWidth/4,0,img.naturalWidth/4,img.naturalHeight,d.bikeX-95,335+bob,190,152);else if(fallback)c.drawImage(fallback,pose===2?fallback.naturalWidth/2:0,0,fallback.naturalWidth/2,fallback.naturalHeight,d.bikeX-95,335+bob,190,152);
  if(d.aim){const hand=this.hand(r);this.item(c,hand.x,hand.y-3,d.selected,30);}c.restore();
  if(!V.settings.reducedMotion)for(const offset of [-54,68]){c.save();c.translate(d.bikeX+offset,463+bob);c.rotate(d.scroll*.07);c.strokeStyle='#e0e8dc65';c.lineWidth=1.3;for(let i=0;i<3;i++){c.rotate(Math.PI/3);c.beginPath();c.moveTo(-10,0);c.lineTo(10,0);c.stroke();}c.restore();}
 },
 trajectory(c,r){
  const d=r.data,f=d.aim?this.shot(r):d.flight;if(!f)return;
  if(d.aim){
   const color=f.willHit?'#b7f5d9':'#fff1cd';c.save();c.setLineDash([3,8]);c.beginPath();for(let i=0;i<=40;i++){const q=this.point(f,f.duration*i/40);if(!i)c.moveTo(q.x-d.scroll,q.y);else c.lineTo(q.x-d.scroll,q.y);}c.strokeStyle='#183d49b0';c.lineWidth=5;c.stroke();c.strokeStyle=color;c.lineWidth=2.4;c.stroke();c.setLineDash([]);
   const x=f.land-d.scroll;c.fillStyle=color;c.beginPath();c.ellipse(x,landingY+12,17,6,0,0,Math.PI*2);c.fill();c.strokeStyle='#234b51';c.lineWidth=2;c.beginPath();c.moveTo(x-6,landingY+12);c.lineTo(x+6,landingY+12);c.moveTo(x,landingY+7);c.lineTo(x,landingY+17);c.stroke();
   if(d.aim.dragged&&d.aim.origin.y<525){const{origin,pointer}=d.aim;c.strokeStyle='#fff4dd9c';c.lineWidth=1.5;c.beginPath();c.moveTo(origin.x,origin.y);c.lineTo(pointer.x,pointer.y);c.stroke();for(const p of [origin,pointer]){c.beginPath();c.arc(p.x,p.y,5,0,Math.PI*2);c.stroke();}}
   c.restore();return;
  }
  const p=this.point(f,f.time),progress=f.time/f.duration;
  if(!V.settings.reducedMotion){c.save();for(let i=0;i<f.trail.length;i++){const q=f.trail[i];c.globalAlpha=i/f.trail.length*.32;c.fillStyle='#fff0cb';c.beginPath();c.arc(q.x-d.scroll,q.y,1+i*.24,0,Math.PI*2);c.fill();}c.restore();}
  V.SceneShadows.contact(c,p.x-d.scroll,436,14*(1-progress*.25),3,.08);c.save();c.translate(p.x-d.scroll,p.y);c.rotate(V.settings.reducedMotion?0:Math.sin(progress*Math.PI)*.4);this.item(c,0,0,f.kind,36-5*progress);c.restore();
 },
 draw(c,r){
  const d=this.ready(r),scroll=d.scroll,reduced=V.settings.reducedMotion;c.save();c.beginPath();c.rect(0,0,sceneWidth,540);c.clip();c.imageSmoothingEnabled=false;
  const sky=c.createLinearGradient(0,0,0,410);sky.addColorStop(0,'#f5dfc7');sky.addColorStop(1,'#b4d9d0');c.fillStyle=sky;c.fillRect(0,0,sceneWidth,540);
  const bg=A.images.get('delivery-panorama');if(bg){const shift=reduced?0:scroll*.09%960;c.globalAlpha=.72;for(let i=0;i<=Math.ceil(sceneWidth/960);i++)c.drawImage(bg,i*960-shift,-15,960,360);c.globalAlpha=1;}
  c.fillStyle='#a4bc9e';c.fillRect(0,340,sceneWidth,80);c.fillStyle='#dce3bc';c.fillRect(0,341,sceneWidth,8);
  for(let i=-1;i<Math.ceil(sceneWidth/100)+1;i++){const x=i*100-(reduced?0:scroll)%100;c.fillStyle='#dbe2c4';c.fillRect(x,350,7,51);c.fillStyle='#809e8c';c.fillRect(x+7,352,2,49);}
  c.fillStyle='#e9d5b5';c.fillRect(0,418,sceneWidth,33);c.fillStyle='#f8e9ce';c.fillRect(0,418,sceneWidth,4);c.fillStyle='#2e4651';c.fillRect(0,451,sceneWidth,89);c.fillStyle='#d2c2a6';c.fillRect(0,449,sceneWidth,5);
  for(let i=-1;i<Math.ceil(sceneWidth/100)+1;i++){const x=i*100-(reduced?0:scroll)%100;c.fillStyle=i%2?'#f4e5bd':'#d1b89b';c.fillRect(x,451,48,5);c.fillStyle='#e1d7b8';c.fillRect(x,516,44,3);}
  for(const h of this.street(r))this.house(c,r,h,h.index===d.house.index);
  this.rider(c,r);this.trajectory(c,r);
  if(d.aim){this.card(c,24,190,96,28,'#1d424de8');P.text(c,'FOCO',72,205,12,'#c1f2df');}
  if(d.result&&d.flash>0){
   const res=d.result,p=1-d.flash/1.2,x=res.impact.x-d.scroll;c.save();c.globalAlpha=Math.max(0,1-p*1.4);
   if(res.valid)this.item(c,x,res.impact.y+p*13,res.parcel,31*(1-p*.95));else{c.translate(x+res.spin*p*22,res.impact.y+Math.min(1,p*3)*52);c.rotate(reduced?0:res.spin*p*.6);this.item(c,0,0,res.parcel,31);}c.restore();
   const center=V.clamp(d.house.x,435,sceneWidth-150);this.card(c,center-121,275,242,58,res.valid?'#fff4ddef':'#283e4aee');P.text(c,res.valid?(res.perfect?'ENTREGA PERFEITA':'ENTREGUE!'):'PRÓXIMA TENTATIVA',center,295,17,res.valid?'#235c51':'#ffe3c5');P.text(c,res.valid?(r.training?'Muito bem!':('+'+(res.points||0)+' pontos · '+items[res.kind].en)):res.reason==='item'?'Confira o objeto pedido':'Ajuste a força e o embalo',center,317,12,res.valid?'#52746a':'#f0cfaf');
  }
  if(!reduced)for(const e of d.effects){const p=e.time/1.1;c.fillStyle=d.lastGood?'#ffe4ad':'#ebb596';c.beginPath();c.arc(e.x-d.scroll+Math.cos(e.angle)*p*48,e.y+Math.sin(e.angle)*p*30-p*20,2.5*(1-p),0,Math.PI*2);c.fill();}
  c.restore();
 },
 hud(r){
  const d=this.ready(r),root=V.$('#playground-root');if(!root)return;root.classList.add('moto-playing','moto-redesign');root.dataset.motoPhase=d.phase;
  let order=V.$('#moto-order');if(!order){order=document.createElement('div');order.id='moto-order';order.setAttribute('role','status');order.setAttribute('aria-live','polite');order.setAttribute('aria-atomic','true');order.innerHTML='<span class="moto-order-label">Encomenda: </span><strong id="moto-order-name"></strong>';V.$('.pg-mission').prepend(order);}
  const request=d.route+':'+d.house.index+':'+d.house.item;if(order.dataset.request!==request){const name=V.$('#moto-order-name');name.textContent=items[d.house.item].en;order.dataset.request=request;if(!V.settings.reducedMotion&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)name.animate?.([{opacity:.4,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});}
  let status=V.$('#moto-drive-status');if(!status){status=document.createElement('div');status.id='moto-drive-status';status.innerHTML='<span class="moto-eyebrow">VELOCIDADE · 15–80</span><div class="moto-speed-value"><strong id="moto-speed"></strong><small>km/h</small></div><meter id="moto-speed-meter" min="15" max="80" aria-label="Velocidade da moto"></meter><span id="moto-drive-state"></span>';V.$('.pg-mission').append(status);}
  const displaySpeed=r.training?d.speed:this.roadSpeed(r)/units;V.$('#moto-speed').textContent=Math.round(displaySpeed);V.$('#moto-speed-meter').value=displaySpeed;
  V.$('#moto-drive-state').textContent=d.aim?'Foco · tempo desacelerado':r.training?'Treino guiado':d.speed<=minSpeed+.05?'Ritmo mínimo · 15 km/h':d.braking||d.acceleration< -4?'Freando':d.acceleration>4?'Acelerando':'No embalo';
  const shot=d.aim?this.shot(r):null,state=shot?(shot.willHit?(shot.perfect?'Centro da porta · solte!':'Na porta · pode soltar'):shot.error<0?'Queda antes da porta':'Queda depois da porta'):d.phase==='flight'?'Encomenda a caminho':d.phase==='resolved'?'Entrega registrada':'Segure para carregar';
  const aimState=V.$('#moto-aim-state');if(aimState){aimState.textContent=state;aimState.dataset.ready=String(!!shot?.willHit);}
  const power=V.$('#moto-power');if(power){power.value=Math.round((d.aim?.power||0)*100);power.setAttribute('aria-valuetext',Math.round((d.aim?.power||0)*100)+'% de força');}
  const angle=V.$('#moto-angle');if(angle)angle.textContent=Math.round(d.aim?.angle||d.lastAim.angle)+'°';
  if(!r.training)V.$('#pg-score').textContent=d.hits+'/6 certas · '+d.attempts+'/10 casas'+(r.arcade?.free?' · LIVRE':' · '+d.lives+' chances')+' · '+r.score+' pontos';
  for(let slot=0;slot<3;slot++){
   const b=V.$('#moto-box-'+slot),item=items[d.house.options[slot]];if(!b)continue;
   if(b.dataset.item!==item.id){b.dataset.item=item.id;b.replaceChildren();const img=document.createElement('img');img.src=A.asset(item.asset)+'?v=20261110-drive1';img.alt='';const k=document.createElement('kbd');k.textContent=second()?String(slot+1)+' num':String(slot+1);const label=document.createElement('span');label.textContent='ENCOMENDA';label.className='moto-object-action';b.append(k,img,label);b.setAttribute('aria-label','Escolher '+item.pt+' · '+(second()?'teclado numérico ':'tecla ')+(slot+1));}
   b.setAttribute('aria-pressed',String(d.selected===d.house.options[slot]));b.disabled=!['ride','aim'].includes(d.phase)||!!r.ack;
  }
  const launch=V.$('#moto-throw');if(launch){launch.disabled=!['ride','aim'].includes(d.phase)||d.selected===null||!!r.ack;launch.textContent=d.phase==='flight'?'Em voo':d.phase==='resolved'?'Próxima casa':d.phase==='aim'?'Solte para entregar':'Preparar lançamento';launch.dataset.ready=String(!!shot?.willHit);launch.setAttribute('aria-label',launch.textContent+' · '+(second()?'Enter':'Espaço')+' · segure ou arraste para trás');}
  for(const id of ['moto-back','moto-forward']){const b=V.$('#'+id);if(b)b.disabled=!!r.ack||r.finished;}
 },
 pointFromEvent(e){const c=V.Engine.canvas,b=c.getBoundingClientRect(),a=P.layout();return{x:((e.clientX-b.left)*c.width/b.width-a.x)/a.scale,y:((e.clientY-b.top)*c.height/b.height-a.y)/a.scale};}
};
D.guides.moto=[
 {title:'Um pedido, três imagens',text:'Light é uma lâmpada. Leia o pedido no bilhete e escolha a imagem correspondente.',instruction:'Escolha a lâmpada. As teclas 1, 2 e 3 também funcionam.',event:'moto-select',focus:'game'},
 {title:'Encontre o seu ritmo',text:'Segure D/→ para acelerar até 80 km/h e A/← para reduzir até 15 km/h. A moto está sempre em movimento. No treino, a casa acompanha a preparação.',instruction:'Experimente o acelerador ou o freio.',event:'moto-move',focus:'game'},
 {title:'Prepare, observe e solte',text:'Segure Espaço ou o botão para carregar força. Use W/S ou ↑/↓ para ajustar o ângulo. Com mouse ou toque, puxe para trás e solte. O foco desacelera a rua; a marca mostra a queda real.',instruction:'Solte quando a marca estiver na porta. O centro vale uma entrega perfeita.',event:'moto-throw',focus:'game'},
 {title:'A entrega segue seu próprio voo',text:'A encomenda leva o embalo da moto no instante do lançamento. Frear depois não muda o objeto que já está no ar.',instruction:'Acompanhe a encomenda até a porta.',event:'moto-land',focus:'game',after:'Faça 6 entregas certas em 10 casas. Frear na aproximação ajuda a encontrar a força certa.'}
];
function beginPointer(r,e,source){
 if(e.button!==undefined&&e.button!==0)return;e.preventDefault();V.Audio.unlock();
 if(!C.beginAim(r,source,e.pointerId,C.pointFromEvent(e)))return;
 input.aimPointer={id:e.pointerId};try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}P.hud();
}
function releasePointer(e,cancel=false){
 const r=P.active;if(r?.game!=='moto'||input.aimPointer?.id!==e.pointerId)return;
 if(cancel)C.cancelAim(r);else{C.aimPoint(r,C.pointFromEvent(e));C.release(r);}P.hud();P.save();
}
window.addEventListener('pointermove',e=>{const r=P.active;if(r?.game!=='moto'||input.aimPointer?.id!==e.pointerId||V.modal)return;C.aimPoint(r,C.pointFromEvent(e));P.hud();});
window.addEventListener('pointerup',e=>{input.directions.delete(e.pointerId);releasePointer(e);});
window.addEventListener('pointercancel',e=>{input.directions.delete(e.pointerId);releasePointer(e,true);});
window.addEventListener('lostpointercapture',e=>{input.directions.delete(e.pointerId);releasePointer(e,true);});
window.addEventListener('blur',()=>{if(P.active?.game==='moto')C.cancelAim(P.active);clearInput();});
window.addEventListener('keyup',e=>{const r=P.active;if(r?.game==='moto'&&C.keyUp(r,e.key.toLowerCase())){e.preventDefault();P.hud();P.save();}});
const controls=P.controls.bind(P);P.controls=function(){
 if(this.active?.game!=='moto')return controls();clearInput();const r=this.active,host=V.$('#pg-controls');host.replaceChildren();host.className='moto-controls';
 const parcels=document.createElement('div');parcels.className='moto-parcels';parcels.setAttribute('role','group');parcels.setAttribute('aria-label','Escolher encomenda');
 for(let slot=0;slot<3;slot++)parcels.append(this.button('moto-box-'+slot,'',()=>{this.action('moto-select',slot);V.$('#world-canvas')?.focus();},'secondary moto-object'));
 const drive=document.createElement('div');drive.className='moto-drive';drive.setAttribute('role','group');drive.setAttribute('aria-label','Pilotar a moto');
 for(const [dir,id,label,key]of [[-1,'moto-back','Frear',second()?'←':'A'],[1,'moto-forward','Acelerar',second()?'→':'D']]){
  const b=this.button(id,'',()=>{});b.innerHTML='<span class="moto-pedal-icon">'+(dir<0?'−':'+')+'</span><strong>'+label+'</strong><kbd>'+key+'</kbd>';b.setAttribute('aria-label',label+' · segure '+key);
  b.onpointerdown=e=>{if(e.button!==undefined&&e.button!==0||V.modal||r.ack)return;e.preventDefault();V.Audio.unlock();input.directions.set(e.pointerId,dir);try{b.setPointerCapture(e.pointerId);}catch(_){}};
  const stop=e=>input.directions.delete(e.pointerId);b.onpointerup=b.onpointercancel=b.onlostpointercapture=stop;
  b.onkeydown=e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();e.stopPropagation();input.directions.set(id,dir);}};
  b.onkeyup=e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();e.stopPropagation();input.directions.delete(id);}};b.onblur=()=>input.directions.delete(id);drive.append(b);
 }
 const launchGroup=document.createElement('div');launchGroup.className='moto-launch';launchGroup.innerHTML='<div class="moto-launch-readout"><span id="moto-aim-state">Segure para carregar</span><span id="moto-angle">52°</span></div><progress id="moto-power" max="100" value="0" aria-label="Força do lançamento"></progress>';
 const launch=this.button('moto-throw','Preparar lançamento',()=>{},'primary');launch.onpointerdown=e=>beginPointer(r,e,'control');launch.onpointerup=e=>releasePointer(e);launch.onpointercancel=e=>releasePointer(e,true);
 launch.onclick=e=>{if(e.detail===0&&!launch.disabled){if(r.data.aim)C.release(r);else C.beginAim(r,'toggle');P.hud();P.save();}};
 launchGroup.append(launch);host.append(parcels,drive,launchGroup);C.hud(r);
};
const key=P.key.bind(P);P.key=function(k,e={}){
 if(this.active?.game!=='moto'||V.modal)return key(k,e);const r=this.active;
 if(e.target?.closest?.('#pg-controls button'))return;
 if(k==='escape'&&r.data.aim){e.preventDefault?.();C.cancelAim(r);this.hud();return;}
 if(['escape','p'].includes(k))return key(k,e);
 if(['arrowleft','arrowright','a','d','arrowup','arrowdown','w','s'].includes(k)){e.preventDefault?.();return;}
 if(e.repeat)return;
 if(['1','2','3'].includes(k)){e.preventDefault?.();this.action('moto-select',+k-1);}
 else if([' ','e','enter'].includes(k)){e.preventDefault?.();this.action('moto-aim');}
 else if(k==='b'){e.preventDefault?.();this.action('moto-brake');}
};
const pointer=P.pointer.bind(P);P.pointer=function(type,e){
 if(this.active?.game!=='moto')return pointer(type,e);const r=this.active;if(r.finished||V.modal||r.training&&r.ack)return;
 if(type==='down'){const b=V.$('#pg-scene').getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)return;beginPointer(r,e,'canvas');}
 else if(type==='move'&&input.aimPointer?.id===e.pointerId){C.aimPoint(r,C.pointFromEvent(e));this.hud();}
 else if(type==='up'||type==='cancel')releasePointer(e,type==='cancel');
};
const attach=P.attach.bind(P);P.attach=function(r){if(r.game==='moto'){C.ready(r);C.cancelAim(r);r.data.focus=1;clearInput();}return attach(r);};
const detach=P.detach.bind(P);P.detach=function(){if(this.active?.game==='moto'){C.cancelAim(this.active);clearInput();}return detach();};
const pause=P.pause.bind(P);P.pause=function(...args){if(this.active?.game==='moto'){C.cancelAim(this.active);clearInput();}return pause(...args);};
const covers=P.covers.bind(P);P.covers=function(){covers();for(const el of V.$$('[data-pg-cover="moto"]')){const c=el.getContext('2d');A.draw(c,'delivery-panorama',0,0,360,156);c.fillStyle='#2e4651';c.fillRect(0,124,360,32);A.draw(c,'house-blue',236,22,119,126);const img=A.images.get('delivery-rider-animated');if(img)c.drawImage(img,0,0,img.naturalWidth/4,img.naturalHeight,44,67,101,81);C.card(c,208,22,128,30,'#fff1d8');P.text(c,'LIGHT → 68',272,39,14,'#2a5355');c.strokeStyle='#fff0cf';c.lineWidth=2;c.setLineDash([3,5]);c.beginPath();c.moveTo(127,90);c.quadraticCurveTo(195,14,278,105);c.stroke();c.setLineDash([]);C.item(c,198,60,0,26);}};
const layout=P.layout.bind(P);P.layout=function(){if(this.active?.game!=='moto')return layout();const a=this.sceneBounds(),rect=V.$('#pg-scene')?.getBoundingClientRect(),ratio=rect?rect.width/Math.max(1,rect.height):a.w/Math.max(1,a.h),top=ratio>3.2?180:80,h=540-top,scale=Math.max(.01,Math.min((a.w-8)/sceneWidth,(a.h-8)/h));return{scale,x:a.x+(a.w-sceneWidth*scale)/2,y:a.y+(a.h-h*scale)/2-top*scale};};
if(V.LearningArcade)V.LearningArcade.games.push({id:'moto',title:game.title,tag:game.tag,text:game.goal,subject:'language'});
})();
});
