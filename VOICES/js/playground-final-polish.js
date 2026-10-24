/* VOICES challenge refinements: scene rendering, encounters and accessibility. */
(function voicesChallengeFinalPolish(){
'use strict';
const V=window.V,P=V.Playground,D=V.PlaygroundData,C=P.controllers;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const box=(c,x,y,w,h,fill,stroke)=>{c.fillStyle=fill;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.strokeRect(Math.round(x)+1,Math.round(y)+1,Math.max(1,Math.round(w)-2),Math.max(1,Math.round(h)-2));}};
const label=(c,word,x,y,size=15,color='#234637')=>{c.save();c.font=`700 ${size}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(word,x,y);c.restore();};
const line=(c,x1,y1,x2,y2,color,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};

// Runner: one closed border per portal, a readable word and a more lived-in
// district with layered pixel-art facades, trees, streetlights and texture.
const districts=[
 {name:'SQUARE',sky:'#96c9bf',far:'#6caaa0',build:'#c2a27b',trees:'#416f59',ground:'#789477'},
 {name:'FAIR',sky:'#e0c49e',far:'#be9f7e',build:'#cd8c69',trees:'#4e7754',ground:'#a39d6b'},
 {name:'PARK',sky:'#9cbeab',far:'#7ea89a',build:'#afba95',trees:'#467d5e',ground:'#80a17a'},
 {name:'MARKET',sky:'#d0b59a',far:'#a2a79a',build:'#c98d68',trees:'#4e765d',ground:'#9a9b7a'},
 {name:'MUSEUM',sky:'#a6bac7',far:'#819eaa',build:'#cdbb97',trees:'#51756f',ground:'#8ea38d'},
 {name:'FESTIVAL',sky:'#968faf',far:'#686c98',build:'#b58aa4',trees:'#426c65',ground:'#777e92'}
];
// Every crossed portal is an attempt. A wrong word costs a shield, registers
// an error and advances to the next word, while only correct words give points.
const runner=C.runner,previousRunnerUpdate=runner.update.bind(runner),previousRunnerModel=runner.model.bind(runner);
runner.model=function(r){const m=previousRunnerModel(r);if(!r.training)m.support+=` · ${r.data.wrongChoices||0} wrong choices`;return m;};
runner.update=function(r,dt){
 const d=r.data,beforeRound=d.round,beforeMistakes=r.mistakes,calm=r.calm;
 // Calm mode may slow portals, but must not freeze a wrong choice forever.
 if(!r.training&&calm&&d.z>.90)r.calm=false;
 try{previousRunnerUpdate(r,dt);}finally{r.calm=calm;}
 if(r.training||r.finished||d.round!==beforeRound||r.mistakes<=beforeMistakes||d.z!==0||d.wait<.65)return;
 d.wrongChoices=(d.wrongChoices||0)+1;
 d.round++;
 if(d.round%4===0){
  P.stageClear(r,d.stage);
  if(d.round>=24){P.finish();return;}
  d.stage=Math.min(5,d.stage+1);
  d.shield=Math.min(3,d.shield+1);
 }
 r.feedback=`✕ Wrong word counted! ${d.wrongChoices} wrong choice(s). Next round: ${d.round+1}/24.`;
 P.hud();
};
C.runner.draw=function(c,r){
 const d=r.data,theme=districts[clamp(d.stage||0,0,5)],t=0;
 box(c,0,0,960,540,theme.sky);
 box(c,0,120,960,48,theme.far);box(c,0,170,960,370,theme.ground);
 for(let i=0;i<16;i++){const x=i*76-42;box(c,x,114+(i%3)*10,61,81,theme.far);box(c,x+12,124+(i%3)*10,11,13,'#d8dec0');}
 for(let i=0;i<9;i++){
  const x=(i*126-20-Math.floor(t*17)%126+126)%1120-60;
  const h=46+(i%3)*13,y=190-h;
  box(c,x-5,y-11,105,13,'#4e6459');box(c,x,y,96,h,i%2?theme.build:'#a5bdb2');
  for(let j=0;j<3;j++)box(c,x+9+j*27,y+13,15,16,(i+j)%2?'#f0d8a9':'#54736c');
  box(c,x+64,y+h-23,18,23,'#3a5b51');
  if(i%2===0){box(c,x+111,139,5,44,'#5a6655');box(c,x+95,126,34,17,'#497760');box(c,x+101,114,22,15,theme.trees);}
 }
 for(let i=0;i<10;i++){const x=i*116-20;box(c,x,206,7,65,'#506857');box(c,x-8,201,23,10,'#d8c68d');box(c,x-5,213,16,2,'#fff0c0');}
 // Road and its lane markings converge at the horizon.
 const top=187,bot=514;c.fillStyle='#344f4c';c.beginPath();c.moveTo(375,top);c.lineTo(585,top);c.lineTo(930,bot);c.lineTo(30,bot);c.closePath();c.fill();
 c.fillStyle='#3e5e56';c.beginPath();c.moveTo(388,top);c.lineTo(572,top);c.lineTo(821,bot);c.lineTo(139,bot);c.closePath();c.fill();
 for(let i=0;i<4;i++){const xt=375+i*70,xb=30+i*300;line(c,xt,top,xb,bot,i===0||i===3?'#e7d4a6':'#cbd0b6',i===0||i===3?5:2.5);}
 for(let n=0;n<13;n++){const z=(n/13+t*.25)%1,y=top+Math.pow(z,2)*318,w=210+z*670;line(c,480-w/2,y,480+w/2,y,'#b9c6a47a',2);}
 // The portal panels used to have a detached lower stroke and open corners.
 const w=D.words[(r.training?0:d.round)%D.words.length],correct=r.training?2:(d.round*2+Math.floor(d.round/3))%3,words=[...w.wrong];words.splice(correct,0,w.en);
 const z=.10+d.z*.90,y=top+z*z*245,spread=75+z*145,scale=.37+z*.72;
 words.forEach((word,i)=>{
  const cx=480+(i-1)*spread,pw=195*scale,ph=54*scale,x=Math.round(cx-pw/2),py=Math.round(y-ph);
  box(c,x+4,py+7,pw,ph+4,'#233e39aa');box(c,x,py,pw,ph,'#f4e6c7',i===correct&&r.training?'#f9cb6a':'#cbb78c');
  box(c,x+4,py+4,Math.max(2,pw-8),3,i===correct&&r.training?'#ecc66b':'#9fb5a0');
  c.save();c.font='700 20px system-ui,sans-serif';const measure=c.measureText(word).width;c.restore();
  label(c,word,cx,py+ph*.56,Math.floor(Math.max(12,Math.min(21*scale,20*scale*(pw-17)/Math.max(1,measure)))),'#183f37');
 });
 // Collectibles and hazards appear on the same projected lanes.
 if(!r.training){const fy=210+d.z*175,spreadBonus=75+d.z*145;
  if(!d.bonus){const x=480+(((d.round*2+d.stage+1)%3)-1)*spreadBonus;c.fillStyle='#f7d677';c.beginPath();c.arc(x,fy-19,9+d.z*9,0,Math.PI*2);c.fill();label(c,'✦',x,fy-19,18,'#876230');}
  if(d.stage>0&&d.round%3===1&&!d.barrier){const x=480+(((d.round+d.stage*2)%3)-1)*spreadBonus;box(c,x-19,fy-5,38,29,'#aa5d54','#f1c49c');label(c,'!',x,fy+9,18,'#fff1d1');}
  box(c,20,201,142,31,'#214c43','#e5d29f');label(c,theme.name,91,216,14,'#fff0cf');label(c,'✦ '+d.coins,848,232,18,'#fff0be');
 }
 line(c,145,455,815,455,'#f0d395',3);P.person(c,d.x,470,true,3,76);
 for(let i=0;i<3;i++){c.beginPath();c.arc(851+i*24,189,7,0,Math.PI*2);c.fillStyle=i<d.shield?'#f2d28c':'#5d776c';c.fill();}
 ['LANE 1','LANE 2','LANE 3'].forEach((s,i)=>label(c,s,260+i*220,499,13,'#e7ddbc'));
};

// Accessible map painter without down arrows, E placards, stars, or footnote.
const tile=p=>({x:90+p.x*60,y:197+p.y*38});
const streets=(c,r,places)=>{
 box(c,0,0,960,540,'#9dbb9a');box(c,51,154,858,320,'#b9c8a2','#e9dcb7');
 for(let y=0;y<7;y++)for(let x=0;x<14;x++){
  const p=tile({x,y}),shade=(x+y)%2===0?'#dfd4b7':'#d6cbaa';box(c,p.x-29,p.y-18,58,36,shade);box(c,p.x-27,p.y-16,54,32,'#e4d7b6');
  if(x===5&&y>=2&&y<=4||x===9&&y>=2&&y<=3){box(c,p.x-27,p.y-18,54,36,'#8da478');box(c,p.x-12,p.y-9,24,25,'#4c7c5c');box(c,p.x-6,p.y+6,13,7,'#b97b53');}
 }
 for(const [id,site] of Object.entries(places)){
  const p=tile(site),name=site.label||site.name||id,wide=name.length>13?126:Math.max(77,name.length*8+15);
  P.house(c,p.x-37,p.y-41,74,48,'',site.color||'#8eaf91');
  box(c,p.x-wide/2,p.y-71,wide,24,'#f0e3bc','#687f67');label(c,name,p.x,p.y-59,13,'#234739');
 }
 const route=r.data.route;if(route?.length){const points=[tile(r.data.player),...route.map(tile)];c.save();c.strokeStyle='#846b50';c.lineWidth=3;c.setLineDash([6,6]);c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.restore();}
};

for(const [id,p]of Object.entries(D.places)){p.pt={library:'Library',school:'School',museum:'Museum',garden:'Garden',community:'Community Center'}[id];p.label=p.pt;}
for(const p of D.deliveries)p.pt=`Deliver the ${p.item} to the ${D.places[p.to].name}.`;
const courier=C.courier,originalCourierModel=courier.model.bind(courier);
courier.model=function(r){const m=originalCourierModel(r),d=r.data,t=D.deliveries[d.stage%D.deliveries.length];m.support=`${d.cargo?'Carrying: '+d.cargo:'Collect your package at the Library'} · Delivery ${d.stage+1}/5`;m.action=m.disabled?'Move closer to a building':d.cargo?'Deliver package · E':'Pick up package · E';m.hint=d.cargo?'Deliver the '+d.cargo+' to the '+D.places[t.to].name+'.':'Every delivery begins at the Library.';return m;};
courier.draw=function(c,r){streets(c,r,D.places);const d=r.data,p=tile(d.player);P.person(c,p.x,p.y+11,d.walking,d.player.dir,54);if(d.cargo){box(c,p.x+17,p.y-24,21,17,'#d8b17e','#66513a');label(c,{book:'B',letter:'L',parcel:'P'}[d.cargo]||'P',p.x+27,p.y-16,12,'#203f36');}};
const garden=C.garden,originalGardenModel=garden.model.bind(garden),originalGardenHUD=garden.hud.bind(garden);
const beds=[{x:3,y:2},{x:7,y:3},{x:9,y:4}];
const gardenSites={seeds:{x:1,y:5,label:'Seed Cart',color:'#c5a16d'},water:{x:11,y:5,label:'Water Well',color:'#83adb7'},botica:{x:11,y:1,label:'Herb House',color:'#96ad84'}};
garden.model=function(r){const m=originalGardenModel(r),d=r.data;m.request=r.training?'Plant, water, harvest and deliver':`Stage ${d.cycle+1}/4 · ${['First Harvest','Dry Week','Wild Weeds','Community Harvest'][d.cycle]||'First Harvest'}`;m.support=`Seeds ${d.seeds} · Water ${d.water} · Harvest ${d.harvest} · Delivered ${d.delivered}`;m.hint='Visit Seed Cart, plant in a Garden Bed, fill up at Water Well, then bring crops to Herb House.';m.action=m.action.replaceAll('Pegar sementes','Collect seeds').replaceAll('Encher regador','Fill watering can').replaceAll('Entregar colheita','Deliver harvest').replaceAll('Plantar','Plant').replaceAll('Regar','Water').replaceAll('Colher','Harvest').replaceAll('Limpar folhas','Clear weeds').replaceAll('Chegue perto de um ponto','Move closer').replaceAll('Crescendo','Growing');return m;};
garden.hud=function(r){originalGardenHUD(r);V.$$('#pg-waypoints button').forEach(b=>{const id=b.id.slice('pg-route-'.length),n={seeds:'Seed Cart',water:'Water Well',botica:'Herb House',bed0:'Garden Bed 1',bed1:'Garden Bed 2',bed2:'Garden Bed 3'}[id];if(n){b.textContent=n;b.title='Walk to '+n;}});};
garden.draw=function(c,r){const d=r.data;streets(c,r,gardenSites);for(let i=0;i<(r.training?1:3);i++){
 const b=d.beds[i],p=tile(beds[i]);box(c,p.x-26,p.y-17,52,35,'#76583e','#a88660');for(let k=0;k<3;k++)line(c,p.x-18+k*17,p.y-12,p.x-18+k*17,p.y+12,'#59422e',2);
 if(['growing','ready'].includes(b.status)){box(c,p.x-5,p.y-12,10,28,'#5b7850');for(let k=0;k<4;k++)box(c,p.x-20+k*10,p.y-19-(k%2)*6,15,11,k%2?'#579765':'#69a16b');}
 if(b.status==='planted')box(c,p.x-4,p.y+2,8,5,'#e9c074');
 if(b.status==='growing'){box(c,p.x-22,p.y+23,44,5,'#596c52');box(c,p.x-22,p.y+23,44*Math.min(1,b.growth/3.5),5,'#b9d68e');}
 const status={empty:'Empty',planted:'Needs water',growing:'Growing',ready:'Harvest!',harvested:'Complete'}[b.status];
 const width=104;box(c,p.x-width/2,p.y+32,width,22,'#234d40','#b5c89b');label(c,'Bed '+(i+1)+' · '+status,p.x,p.y+43,11,'#fff1d4');
 }
 if(d.cycle>=2&&!r.training)for(let i=0;i<3;i++)if(d.beds[i].status==='ready'&&!d.care[i]?.clean){const p=tile(beds[i]);label(c,'WEEDS',p.x,p.y-33,13,'#8a4d37');}
 const p=tile(d.player);P.person(c,p.x,p.y+10,d.walking,d.player.dir,54);
};

// The patrol detection area is now an explicit visual mechanic, not a hidden
// near-pixel collision. Saved games do not need a data migration.
const memory=C.memory,originalMemoryModel=memory.model.bind(memory),originalMemoryUpdate=memory.update.bind(memory),originalMemoryDraw=memory.draw.bind(memory);
const memoryNames={book:'book',letter:'letter',photo:'photograph',record:'audio recording'};
memory.model=function(r){const m=originalMemoryModel(r),d=r.data,t=d.tasks[Math.min(d.done,d.tasks.length-1)];if(!t)return m;const target={library:'Library',museum:'Museum',square:'Town Square'}[t.to];m.request=`Stage ${d.stage+1} · ${d.carried?'Deliver the '+memoryNames[t.item]+' to the '+target:'Find the '+memoryNames[t.item]}`;m.support=`${d.done}/${d.tasks.length} deliveries · ${d.coins} coins · Avoid the visible patrol circles`;m.action=m.disabled?'Move closer':d.carried?'Deliver · E':'Pick up · E';m.hint='Guards see inside their colored circles. Time your movement to stay outside the radius.';return m;};
const guardRadius=1.9;
memory.update=function(r,dt){originalMemoryUpdate(r,dt);const d=r.data;if(r.training||d.invuln>0)return;const guard=d.guards.find(g=>Math.hypot(d.player.x-g.x,d.player.y-g.y)<guardRadius);if(guard){d.invuln=2.5;d.player={x:1,y:5};d.route=[];d.carried=false;r.combo=0;P.feedback('Spotted inside the patrol radius! The package returned to its pickup point.',true);}};
memory.draw=function(c,r){originalMemoryDraw(c,r);
 const d=r.data,item=d.tasks[Math.min(d.done,d.tasks.length-1)];
 if(item&&!d.carried){const x=154+item.at[0]*60,y=150+item.at[1]*43;box(c,x-51,y-33,102,27,'#f4dfae','#735943');label(c,memoryNames[item.item].toUpperCase(),x,y-20,item.item==='record'?10:12,'#29463b');}
 box(c,234,487,492,32,'#214b42','#b7ba93');label(c,'COMMUNITY ARCHIVE · FICTIONAL DELIVERIES',480,503,13,'#f4e6c5');
 for(const g of r.data.guards){const x=154+g.x*60,y=150+g.y*43;c.save();c.beginPath();c.ellipse(x,y,guardRadius*60,guardRadius*43,0,0,Math.PI*2);c.fillStyle='rgba(219,105,79,.10)';c.fill();c.strokeStyle='#ec9872';c.lineWidth=3;c.setLineDash([10,7]);c.stroke();c.setLineDash([]);box(c,x-19,y-51,38,13,'#833f35');label(c,'GUARD',x,y-45,10,'#ffedce');c.restore();}};

// A compact action-platformer layer: patrols, ranged attacks, energy dash,
// collectible power, checkpoints and two boss arenas. All data lives inside
// the existing stage run, so completed words and saves remain intact.
const platform=C.platform,platformCreate=platform.create.bind(platform),platformUpdate=platform.update.bind(platform),platformAction=platform.action.bind(platform),platformKey=platform.key.bind(platform),platformModel=platform.model.bind(platform);
function prepareStage(r){const d=r.data;if(r.training)return d;if(!Array.isArray(d.enemies)){
 d.enemies=[580,945,1320].slice(0,2+Math.min(1,d.stage)).map((x,i)=>({home:x,x,y:i%2&&d.stage>=2?348:423,hp:1+(d.stage>=3?1:0),alive:true,phase:i*1.6,type:i%2?'glider':'patroller'}));
 d.boss=d.stage===2||d.stage===5?{x:d.length-245,y:412,hp:d.stage===5?10:6,max:d.stage===5?10:6,alive:true,phase:0}:null;
 d.hearts=3;d.power=100;d.bolts=[];d.dashGlow=0;d.checkpoint=70;d.shards=[];d.defeated=0;
 }d.bolts||=[];d.shards||=[];d.hearts??=3;d.power??=100;return d;
}
platform.create=function(training,start=0){const d=platformCreate(training,start);if(!training)prepareStage({data:d,training:false});return d;};
platform.model=function(r){const d=prepareStage(r),m=platformModel(r);if(!r.training)m.support=`${d.wordIndex.length}/${d.required} words · ${d.hearts} hearts · Power ${Math.floor(d.power)}% · ${d.defeated} enemies${d.boss?.alive?' · BOSS '+d.boss.hp+'/'+d.boss.max:''}`;m.hint='Run, jump and collect words. Attack with J/X; dash with K/Shift. Defeat the boss before the portal opens.';return m;};
platform.controls=function(r,host){const left=P.button('pg-left','←',()=>{}),right=P.button('pg-right','→',()=>{}),jump=P.button('pg-action','Jump · ↑',()=>P.action('jump'),'primary'),attack=P.button('pg-attack','⚡ Attack · J',()=>P.action('attack')),dash=P.button('pg-dash','Dash · K',()=>P.action('dash'));
 for(const [b,n]of [[left,-1],[right,1]]){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);P.held={x:n,y:0};};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>P.held={x:0,y:0};}
 host.append(left,jump,right,attack,dash);
};
platform.key=function(r,k,e){if(['j','x'].includes(k)){P.action('attack');return true;}if(['k','shift','z'].includes(k)){P.action('dash');return true;}return platformKey(r,k,e);};
platform.action=function(r,name){const d=prepareStage(r);if(r.training||!['attack','dash'].includes(name))return platformAction(r,name);if(name==='attack'){
  if(d.power<8)return P.feedback('Energy low! Keep moving to recharge.');
  d.power-=8;d.bolts.push({x:d.x+22*(d.facing===1?-1:1),y:d.y-40,dir:d.facing===1?-1:1,life:.72});r.moves++;V.Audio.sfx('menu');
 }else if(d.power>=32){d.power-=32;d.x=clamp(d.x+(d.facing===1?-115:115),30,d.length-125);d.dashGlow=.5;d.invuln=Math.max(d.invuln,.55);r.moves++;P.feedback('Power dash! You can slip past enemies.');}
 else P.feedback('Collect energy before using the dash.');
};
platform.update=function(r,dt){let d=prepareStage(r);if(!r.training&&d.boss?.alive)d.x=Math.min(d.x,d.length-130);
 platformUpdate(r,dt);if(r.training||r.data!==d||r.finished)return;
 d.power=clamp(d.power+dt*3.7,0,100);d.dashGlow=Math.max(0,d.dashGlow-dt);d.checkpoint=Math.max(d.checkpoint,Math.floor(d.x/350)*350+70);
 for(const e of d.enemies){if(!e.alive)continue;e.phase+=dt*(1+d.stage*.11);e.x=e.home+Math.sin(e.phase)*42;
  if(d.invuln<=0&&Math.abs(d.x-e.x)<32&&Math.abs(d.y-34-e.y)<42){damage('An enemy caught you! Jump or use an attack.');}}
 if(d.boss?.alive){d.boss.phase+=dt;if(d.invuln<=0&&Math.abs(d.x-d.boss.x)<62&&Math.abs(d.y-34-d.boss.y)<61)damage('Boss hit! Stay mobile and fire from a distance.');}
 function damage(message){if(d.invuln>0)return;d.hearts--;d.invuln=1.7;r.combo=0;d.x=Math.max(70,d.x-85);d.y=440;d.vy=0;P.feedback(message,true);if(d.hearts<=0){d.hearts=3;d.x=Math.max(70,Math.min(d.checkpoint,d.length-240));P.feedback('Checkpoint restored · 3 hearts. Your collected words are safe.');}}
 for(const b of d.bolts){b.x+=b.dir*680*dt;b.life-=dt;const target=d.enemies.find(e=>e.alive&&Math.abs(e.x-b.x)<30&&Math.abs(e.y-b.y)<48)||null;
  if(target){target.hp--;b.life=0;if(target.hp<=0){target.alive=false;d.defeated++;d.power=clamp(d.power+24,0,100);P.hit(55);d.shards.push({x:target.x,y:target.y,t:1});P.feedback('Enemy defeated! +24 power.');}}
  if(d.boss?.alive&&Math.abs(d.boss.x-b.x)<53&&Math.abs(d.boss.y-b.y)<65){d.boss.hp--;b.life=0;if(d.boss.hp<=0){d.boss.alive=false;d.power=100;P.hit(450);P.feedback('BOSS DEFEATED! Run to the exit portal!');}else P.feedback('Boss hit! '+d.boss.hp+' HP remaining.');}
 }
 d.bolts=d.bolts.filter(b=>b.life>0&&b.x>=0&&b.x<=d.length);
 d.shards.forEach(s=>s.t-=dt);d.shards=d.shards.filter(s=>s.t>0);
 if(d.boss?.alive&&d.x>=d.length-170&&d.finishWait<=0){P.feedback('Boss battle! Use J/X to attack and K/Shift to dodge.');d.finishWait=1.4;}
};
platform.draw=function(c,r){const d=prepareStage(r),cam=clamp(d.x-310,0,Math.max(0,d.length-960)),time=V.settings.reducedMotion?0:r.elapsed,stage=d.stage;
 const sky=['#9cced0','#b8d0b6','#dec6a7','#a7c5d0','#a6acd0','#a5bea4'][stage],earth=['#629477','#658a70','#99856a','#638997','#707ca2','#558a74'][stage];d.cam=cam;
 box(c,0,0,960,540,sky);
 // Scrolling parallax silhouettes and clean pixel clouds.
 for(let i=0;i<12;i++){const x=(i*127-(cam*.18)%127+127)%1120-70,y=170+(i%3)*18;box(c,x,y,86,206,stage>=3?'#779da2':'#86afa0');for(let j=0;j<3;j++)box(c,x+15+j*24,y+27,15,20,'#ebdab4');box(c,x+6,y+110,14,50,'#617e79');}
 for(let i=0;i<5;i++){const x=(i*290-(cam*.07)%290+290)%1250-120,y=195+(i%2)*29;box(c,x+20,y,82,16,'#e4e6d2');box(c,x+40,y-13,45,18,'#eef0d8');box(c,x,y+8,128,13,'#dde4ce');}
 box(c,0,455,960,85,earth);box(c,0,455,960,12,'#d9c58d');
 for(let i=0;i<51;i++){const x=i*27-(cam%27),y=478+(i%3)*16;box(c,x,y,12,6,i%2?'#446d5f':'#7e9a77');}
 for(const p of d.platforms){const x=p.x-cam;if(x<-p.w-20||x>1000)continue;box(c,x,p.y+14,p.w,18,'#4f7766');box(c,x,p.y,p.w,17,'#d1bd8a','#fae5a8');for(let j=0;j<Math.ceil(p.w/24);j++)box(c,x+7+j*24,p.y+19,13,4,'#719081');box(c,x+6,p.y-3,p.w-12,4,'#f8e7b9');}
 for(let i=0;i<d.length/220;i++){if(d.coins.includes(i))continue;const x=200+i*220-cam;if(x<-25||x>985)continue;c.save();c.strokeStyle='#ffd87c';c.lineWidth=5;c.beginPath();c.ellipse(x,397+Math.sin(time*4+i)*3,10,15,0,0,Math.PI*2);c.stroke();c.restore();}
 for(const [i,n]of d.notes.entries()){if(d.wordIndex.includes(i))continue;const x=n.x-cam;if(x<-95||x>1050)continue;box(c,x-52,n.y-42,104,47,'#f1e7c3','#4c776a');box(c,x-48,n.y-39,96,4,'#a4c2a5');
  c.save();c.font='700 18px system-ui,sans-serif';const width=c.measureText(n.word).width;c.restore();label(c,n.word,x,n.y-19,Math.min(18,Math.floor(18*88/Math.max(1,width))),'#234739');
  for(let k=0;k<4;k++)box(c,x-55+k*32,n.y-46,4,4,'#fce8a0');}
 for(const hx of d.hazards){const x=hx-cam;if(x<-30||x>990)continue;box(c,x-20,441,40,14,'#864c49');c.fillStyle='#dfb792';for(let j=0;j<3;j++){c.beginPath();c.moveTo(x-19+j*14,443);c.lineTo(x-12+j*14,416);c.lineTo(x-5+j*14,443);c.fill();}}
 for(const e of d.enemies||[]){if(!e.alive)continue;const x=e.x-cam,y=e.y+Math.sin(time*7+e.phase)*3;if(x<-45||x>1005)continue;
  box(c,x-23,y-20,46,35,e.type==='glider'?'#8d729b':'#895e61','#e4d1ae');box(c,x-12,y-13,8,8,'#f7da82');box(c,x+5,y-13,8,8,'#f7da82');box(c,x-13,y+18,8,7,'#3e594c');box(c,x+6,y+18,8,7,'#3e594c');
  if(e.type==='glider'){box(c,x-31,y-5,9,7,'#cbb1b5');box(c,x+23,y-5,9,7,'#cbb1b5');}}
 if(d.boss?.alive){const b=d.boss,x=b.x-cam,y=b.y+Math.sin(time*3)*5;
  box(c,x-48,y-64,96,72,'#583d55','#efbf8d');box(c,x-33,y-45,66,43,'#9c6173');box(c,x-26,y-33,16,14,'#f9d38c');box(c,x+10,y-33,16,14,'#f9d38c');box(c,x-29,y-5,58,7,'#402f42');box(c,x-44,y+8,24,18,'#594b59');box(c,x+20,y+8,24,18,'#594b59');
  box(c,x-56,y-91,112,12,'#263b37','#f1d69e');box(c,x-53,y-88,106*b.hp/b.max,6,'#df866f');label(c,'ARCHIVE BOSS',x,y-102,14,'#fcdfb4');}
 for(const b of d.bolts||[]){const x=b.x-cam;box(c,x-9,b.y-9,18,18,'#e9d77b','#fff7c7');box(c,x-15,b.y-3,6,6,'#f5b866');}
 for(const s of d.shards||[]){const x=s.x-cam;c.fillStyle='#f8df84';c.beginPath();c.arc(x,s.y-20*s.t,11*s.t,0,Math.PI*2);c.fill();}
 const exit=d.length-67-cam,open=d.wordIndex.length>=d.required&&!d.boss?.alive;box(c,exit-13,354,71,100,open?'#78b8a0':'#536e79','#efdb9b');box(c,exit-7,362,58,86,open?'#326f60':'#44585d');label(c,open?'✓':'LOCKED',exit+21,403,open?27:11,'#fce6b7');
 if(d.dashGlow>0){c.globalAlpha=.4;for(let i=1;i<=4;i++)box(c,d.x-cam-(d.facing===1?-i:i)*18,d.y-60,18,48,'#f9e394');c.globalAlpha=1;}
 if(d.invuln<=0||Math.floor(time*12)%2===0)P.person(c,d.x-cam,d.y+2,!!V.Input.axis().x||!!P.held.x,d.facing,66);
 if(!r.training){box(c,14,163,217,45,'#1d4239','#d5c48e');label(c,'♥ '.repeat(Math.max(0,d.hearts)),76,179,17,'#f4a8a1');box(c,22,190,192,8,'#465f55');box(c,22,190,d.power*1.92,8,'#e5c66f');label(c,'POWER',183,178,11,'#f6e0b2');}
};

// The loom's existing "preview" handler only pulsed the static sequence.
// Animate each repeated group in-place and then notify the tutorial.
const K=V.CultureChallenges,loom=K.loom.bind(K);
K.loom=function(){loom();const button=V.$('#loom-preview'),preview=V.$('.loom-live-preview');if(!button||!preview||button.disabled)return;
 const old=button.onclick;button.onclick=()=>{
  const cells=[...preview.querySelectorAll('.loom-row:first-of-type > span')];if(!cells.length){old?.();return;}
  const r=K.run(),d=r.data,sequence=K.loomOutput(d.pattern,d.offset,d.reverse),group=d.pattern.length;
  const info=document.createElement('div');info.className='loom-preview-progress';info.setAttribute('role','status');info.textContent='Watch the pattern repeat…';preview.append(info);
  button.disabled=true;cells.forEach(cell=>cell.classList.add('loom-preview-hidden'));
  let i=0;const step=()=>{if(!preview.isConnected)return;if(i<cells.length){cells[i].classList.remove('loom-preview-hidden');cells[i].classList.add('loom-preview-reveal');info.textContent=`Thread ${i+1}/8 · ${sequence[i]} · repeat ${Math.floor(i/group)+1}`;i++;setTimeout(step,V.settings.reducedMotion?45:165);}else{info.textContent='Complete! Compare the repeated row with the model above.';button.disabled=false;old?.();}};step();
 };
};
})();
