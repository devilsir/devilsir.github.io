/* Registered module: adventure-environment */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("adventure-environment", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,clamp=V.clamp,Seasons=V.Seasons;
const types=Object.fromEntries(Object.entries(Seasons.conditions).map(([id,condition])=>[id,condition.label]));
const keys=[{h:0,c:[19,28,55],dark:.68},{h:5,c:[76,73,101],dark:.48},{h:6.5,c:[211,159,130],dark:.18},{h:9,c:[156,197,210],dark:0},{h:15,c:[158,199,214],dark:0},{h:18,c:[204,128,112],dark:.2},{h:19.5,c:[68,68,106],dark:.53},{h:21,c:[24,32,62],dark:.68},{h:24,c:[19,28,55],dark:.68}];
const indoorPlaces=new Set(['museum','school','library','university','restaurant','kitchen','salon-iris','african-words','play-museum','food-museum','animal-museum','animal-fossil-hall']);
const E=V.Environment={clock:0,weatherClock:0,cache:new Map(),preview:null,sound:null,
state(){return V.Progress.ensure();},
time(){return this.preview?.hour??this.state()?.clock.hour??12;},
phase(h=this.time()){return h<5?'Madrugada':h<7?'Amanhecer':h<12?'Manhã':h<17?'Tarde':h<19?'Pôr do sol':h<21?'Anoitecer':'Noite';},
colors(h=this.time()){let i=0;while(i<keys.length-2&&h>keys[i+1].h)i++;const a=keys[i],b=keys[i+1],t=clamp((h-a.h)/(b.h-a.h),0,1);return{sky:a.c.map((c,j)=>Math.round(c+(b.c[j]-c)*t)),dark:a.dark+(b.dark-a.dark)*t};},
isInterior(m=V.World.current){
return !!(m&&(m.theme==='room'||m.cityInterior||m.roomBuilder||m.id?.startsWith('interior-')||indoorPlaces.has(m.id)||m.design?.adventure?.environment?.indoor===true));
},
profile(m=V.World.current,x=V.Player.data?.x||0,y=V.Player.data?.y||0){
const d=m?.design?.adventure||{},base={indoor:m?.theme==='room',sky:'automatic',weather:true,climate:'temperate-warm',wind:.2,clouds:.25,snowAllowed:false,...d.environment};
const regions=(d.regions||[]).filter(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h).sort((a,b)=>(a.priority||0)-(b.priority||0));
for(const r of regions)Object.assign(base,Object.fromEntries(Object.entries(r).filter(([k,v])=>['indoor','weather','sky','wind','clouds','ambient','snowAllowed','climate'].includes(k)&&v!==undefined)));
if(this.isInterior(m)||base.indoor)Object.assign(base,{indoor:true,weather:false});
return base;
},
weather(m){return Seasons.weather(this,m);},
setHour(h){const a=this.state();if(!a)return;a.clock.hour=((Number(h)||0)%24+24)%24;this.cache.clear();this.hud();V.Save.save();},
setWeather(type,opts={}){const a=this.state();if(!a||!types[type])return;Object.assign(a.weather,{target:type,type,transition:0,remaining:opts.duration||300,manual:!!opts.manual,intensity:clamp(opts.intensity??a.weather.intensity,0,1),demonstration:type==='snow'&&!!opts.force});V.Save.save();},
hydrate(m){const d=V.Architecture.design(m.design);d.environment||={indoor:m.theme==='room',sky:'automatic',climate:'temperate-warm',weather:m.theme!=='room',snowAllowed:false};d.lights||=[];d.regions||=[];},
update(dt,paused=false){
if(!V.state||V.Game.screen!=='game')return;
this.clock+=dt;
const a=this.state(),c=a.clock;
if(!paused){
  this.weatherClock+=dt;
  if(!c.paused&&!c.daylight){
    c.hour+=dt*24/(c.cycleMinutes*60)*c.speed;
    if(c.hour>=24){c.day+=Math.floor(c.hour/24);c.hour%=24;}
  }
  if(a.overload>0)a.overload=Math.max(0,a.overload-dt*.35);
}
Seasons.update(a,dt,this,paused);
const profile=this.profile();
this.ambientBlend=this.ambientBlend??(profile.indoor?1:0);this.ambientBlend+=(Number(profile.indoor)-this.ambientBlend)*Math.min(1,dt*3);
if(Math.floor(this.clock*2)!==this.hudTick){this.hudTick=Math.floor(this.clock*2);this.hud();this.audio();}
},
hud(){
  const a=this.state();
  if(!a)return;
  let el=V.$('#adv-clock');
  if(!el){
    el=document.createElement('button');
    el.id='adv-clock';el.className='adv-clock';el.type='button';el.onclick=()=>this.panel();
    el.setAttribute('aria-haspopup','dialog');
    el.onkeydown=event=>{if(event.key===' '||event.key==='Enter')event.stopPropagation();};
    el.append(...['span','b','small'].map(tag=>document.createElement(tag)));
    el.firstElementChild.setAttribute('aria-hidden','true');
    V.$('#stage').appendChild(el);
  }
  const h=this.time(),hour=Math.floor(h),min=Math.floor((h-hour)*60),w=this.weather(),season=Seasons.calendar(a);
  const time=String(hour).padStart(2,'0')+':'+String(min).padStart(2,'0');
  const icon=w.type==='clear'&&(h<6||h>=19)?'☾':Seasons.conditions[w.type]?.icon||'☀';
  const conditions=season.label+' · '+(types[w.type]||types.clear);
  [icon,time,conditions].forEach((label,index)=>{
    if(el.children[index].textContent!==label)el.children[index].textContent=label;
  });
  el.setAttribute('aria-label','Calendário e previsão, '+time+', '+conditions);
  el.title='Dia '+a.clock.day+' · Calendário e previsão';
  el.hidden=V.Game.mode!=='explore';
},
panel(){
const a=this.state();if(!a)return;
const panels=V.DuoPanels;
if(panels?.enabled()&&panels.context<0)return panels.withOwner(Math.max(0,panels.owner()),()=>this.panel());
const season=Seasons.calendar(a),climate=Seasons.ensure(a),weather=this.weather();
const options=entries=>Object.entries(entries).map(([id,label])=>`<option value="${id}">${label}</option>`).join('');
const forecast=Seasons.forecast().map(p=>`<li><small>Dia ${p.day} · ${String(p.hour).padStart(2,'0')}h</small><strong><span aria-hidden="true">${Seasons.conditions[p.type].icon}</span> ${types[p.type]}</strong><span>${Math.round(p.temp)} °C</span></li>`).join('');
V.UI.modal('Calendário e previsão',`${weather.climate.name} · Dia ${a.clock.day}, ano ${season.year}`,
`<div class="season-now"><div><small>${this.phase()} · Dia ${season.day} de ${Seasons.duration} da estação</small><h3>${season.label}</h3></div><strong>${types[weather.type]||types.clear} · ${Math.round(weather.temp)} °C</strong></div>
<h3 class="season-forecast-title">${a.weather.manual?'Previsão ao voltar ao automático':'Próximos períodos'}</h3><ol class="season-forecast">${forecast}</ol>
<div class="season-controls"><label class="field">Estação<select id="env-season">${options({auto:'Automática',...Seasons.labels})}</select></label><label class="field">Condição do tempo<select id="env-condition">${options({auto:'Automática',...types,snow:'Neve · demonstração onde é incomum'})}</select></label></div>
<div class="row"><button id="env-wait" class="secondary">Aguardar o anoitecer · 19h</button><button id="env-dawn" class="secondary">Descansar até a manhã · 8h</button><button id="env-rest" class="secondary">Pausa e recuperação</button></div>
<details class="season-preferences"><summary>Iluminação e efeitos</summary><label class="toggle"><input id="env-lantern" type="checkbox" ${a.lanternOn?'checked':''}>Lanterna de exploração</label><label class="field">Brilho mínimo<input id="env-bright" type="range" min=".2" max=".8" step=".05" value="${V.settings.minimumBrightness}"></label><label class="field">Intensidade visual do clima<input id="env-weather" type="range" min="0" max="1" step=".1" value="${V.settings.weatherIntensity}"></label><label class="toggle"><input id="env-flash" type="checkbox" ${V.settings.reducedFlash?'checked':''}>Reduzir relâmpagos</label><label class="field">Qualidade de iluminação<select id="env-quality"><option value="low">Econômica</option><option value="medium">Equilibrada</option><option value="high">Detalhada</option></select></label></details>`,
`<button id="env-apply" class="primary">Aplicar</button>`);
V.$('#env-quality').value=V.settings.lightingQuality;
V.$('#env-season').value=climate.season;
V.$('#env-condition').value=a.weather.manual&&types[a.weather.type]?a.weather.type:'auto';
V.$('#env-wait').onclick=()=>{this.setHour(19);V.UI.close();};V.$('#env-dawn').onclick=()=>{a.clock.day++;this.setHour(8);V.Progress.rest();V.UI.close();};V.$('#env-rest').onclick=()=>{V.Progress.rest();V.UI.close();};
V.$('#env-apply').onclick=()=>{
  a.lanternOn=V.$('#env-lantern').checked;
  V.settings.minimumBrightness=+V.$('#env-bright').value;
  V.settings.weatherIntensity=+V.$('#env-weather').value;
  V.settings.reducedFlash=V.$('#env-flash').checked;
  V.settings.lightingQuality=V.$('#env-quality').value;
  const season=V.$('#env-season').value,type=V.$('#env-condition').value;
  this.cache.clear();
  V.Save.applySettings();
  if(season!==climate.season||type!==(a.weather.manual?a.weather.type:'auto'))Seasons.select(season,type);
  else V.Save.save();
  V.UI.close();
};
},
sky(ctx,m,cam){
const profile=this.profile(m),height=68-cam.y;if(profile.indoor||height<=0)return;
const visual=this.preview?.hour??({dawn:6.3,day:12,sunset:18,night:22}[profile.sky])??(this.state()?.clock.daylight?12:this.time()),c=this.colors(visual),w=this.weather(m);
const storm=w.type==='storm',shade=w.cloud*(storm?.90:.43),target=storm?[49,55,64]:[87,108,128],sky='rgb('+c.sky.map((n,i)=>Math.round(n+(target[i]-n)*shade)).join(',')+')',g=ctx.createLinearGradient(0,0,0,Math.max(1,height));g.addColorStop(0,sky);g.addColorStop(1,storm?'#747f87':w.cloud>.65?'#afc0c7':'#ccd4bd');ctx.fillStyle=g;ctx.fillRect(0,0,ctx.canvas.width,Math.min(height,ctx.canvas.height));
ctx.save();ctx.beginPath();ctx.rect(0,0,ctx.canvas.width,Math.max(0,height));ctx.clip();
ctx.globalAlpha=1-w.cloud*.92;
const h=visual;if(h<6||h>19){ctx.fillStyle='#f0e6c7';for(let i=0;i<34;i++){const x=(i*173+37)%ctx.canvas.width,y=(i*47+7)%52-cam.y;ctx.fillRect(x,y,2,2);}ctx.beginPath();ctx.arc(ctx.canvas.width*.77,26-cam.y,13,0,Math.PI*2);ctx.fill();ctx.fillStyle=sky;ctx.beginPath();ctx.arc(ctx.canvas.width*.77+6,21-cam.y,12,0,Math.PI*2);ctx.fill();}
else{ctx.fillStyle='#f9e6ad';ctx.beginPath();ctx.arc(ctx.canvas.width*.72,26-cam.y,14,0,Math.PI*2);ctx.fill();}
ctx.globalAlpha=1;
const clouds=Math.ceil(Math.max(profile.clouds??.25,w.cloud)*8);ctx.fillStyle=w.type==='storm'?'#53637792':'#eff0e349';for(let i=0;i<clouds;i++){const x=((i*260-this.weatherClock*(V.settings.reducedMotion?0:8*Math.cos(w.wind)*w.speed)-cam.x*.05)%(ctx.canvas.width+240)+ctx.canvas.width+240)%(ctx.canvas.width+240)-120;ctx.fillRect(x,17+i%3*14-cam.y,110+i%2*60,9);ctx.fillRect(x+20,10+i%3*14-cam.y,65,8);}
ctx.fillStyle='#778d8e55';for(let i=0;i<16;i++){const x=i*97-cam.x*.05;ctx.beginPath();ctx.moveTo(x,height);ctx.lineTo(x+60,height-16-i%3*8);ctx.lineTo(x+125,height);ctx.fill();}ctx.restore();
},
occluders(m){
const key='geometry-'+m.id+'-'+(m.geometryRevision||0);if(this.cache.has(key))return this.cache.get(key);
const segments=[];
for(const r of m.solids){const p=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]];for(let i=0;i<4;i++)segments.push({a:p[i],b:p[(i+1)%4]});}
segments.push(...(m.archWalls||[]),...(m.roomWalls||[]));
this.cache.set(key,segments);if(this.cache.size>1000)this.cache.clear();return segments;
},
visibility(m,l,moving=false){
this.movingCache||=new Map();if(moving){const old=this.movingCache.get(m.id+':'+l.id);if(old&&this.clock-old.time<.14&&Math.hypot(old.x-l.x,old.y-l.y)<30)return old.polygon;}
const key=m.id+':'+(m.geometryRevision||0)+':'+l.id+':'+l.radius+':'+l.x.toFixed(0)+','+l.y.toFixed(0)+(moving?':'+Math.floor(this.clock*7):'');
if(this.cache.has(key))return this.cache.get(key);
const segs=this.occluders(m).filter(s=>Math.min(s.a[0],s.b[0])<l.x+l.radius&&Math.max(s.a[0],s.b[0])>l.x-l.radius&&Math.min(s.a[1],s.b[1])<l.y+l.radius&&Math.max(s.a[1],s.b[1])>l.y-l.radius);
const count=Math.min(V.Performance?.lightRays??80,V.settings.lightingQuality==='high'?80:V.settings.lightingQuality==='low'?32:48),angles=Array.from({length:count},(_,i)=>i*Math.PI*2/count);
for(const s of segs.slice(0,90))for(const p of [s.a,s.b])if(Math.hypot(p[0]-l.x,p[1]-l.y)<l.radius+30){const angle=Math.atan2(p[1]-l.y,p[0]-l.x);angles.push(angle-.0005,angle+.0005);}
const result=angles.sort((a,b)=>a-b).map(angle=>{const dx=Math.cos(angle),dy=Math.sin(angle);let nearest=l.radius;for(const s of segs){const sx=s.b[0]-s.a[0],sy=s.b[1]-s.a[1],den=dx*sy-dy*sx;if(Math.abs(den)<.00001)continue;const ox=s.a[0]-l.x,oy=s.a[1]-l.y,t=(ox*sy-oy*sx)/den,u=(ox*dy-oy*dx)/den;if(t>.7&&t<nearest&&u>=0&&u<=1)nearest=t;}return[l.x+dx*nearest,l.y+dy*nearest];});
if(moving)this.movingCache.set(m.id+':'+l.id,{time:this.clock,x:l.x,y:l.y,polygon:result});else this.cache.set(key,result);return result;
},
lights(m){
const a=this.state(),profile=this.profile(m),h=this.preview?.hour??({dawn:6.3,day:12,sunset:18,night:22}[profile.sky])??(a.clock.daylight?12:this.time()),list=(m.design.adventure?.lights||[]).filter(l=>l.enabled!==false&&(l.schedule!=='night'||h<6.8||h>=18));
if(V.Player.data){const p=V.Player.data;list.push({id:'historiograph-glow',x:p.x,y:p.y-8,radius:80,color:'#79d6cf',intensity:.4,softness:1,moving:true});if(a?.lanternOn&&a.equipped.tool==='lantern')list.push({id:'player-lantern',x:p.x,y:p.y+4,radius:170,color:'#ffe9b8',intensity:.95,softness:.9,moving:true});}
return list;
},
fixturePosition(l,m=V.World.current){
const mount=m?.design?.adventure?.architecture?.mounts.find(o=>o.id===l.mount),p=mount?V.Architecture.mountPosition(m.design,mount):null;
const elevation=Number.isFinite(l.elevation)?l.elevation:l.type==='street'?95:l.type==='spotlight'?124:38;
return{x:l.x,y:p&&l.type==='spotlight'?Math.min(l.y-elevation,p.y-(mount.elevation||134)-14):l.y-elevation,mount:p?mount:null};
},
drawFixture(ctx,l,cam,m=V.World.current){
const position=this.fixturePosition(l,m),x=Math.round(position.x-cam.x),y=Math.round(position.y-cam.y),baseY=Math.round(l.y-cam.y);if(x<-60||y<-120||x>ctx.canvas.width+60||y>ctx.canvas.height+110)return;
const profile=this.profile(m,l.x,l.y),h=this.preview?.hour??({dawn:6.3,day:12,sunset:18,night:22}[profile.sky])??(this.state()?.clock.daylight?12:this.time()),on=l.enabled!==false&&(l.schedule!=='night'||h<7||h>=18);ctx.save();
if(l.type==='spotlight'&&position.mount){ctx.fillStyle='#4b4943';ctx.fillRect(x-3,y-2,6,3);ctx.fillStyle='#30383b';ctx.fillRect(x-17,y,34,5);ctx.fillStyle='#9d8c64';ctx.fillRect(x-16,y,32,1);ctx.fillStyle=on?'#dfce9a':'#777764';ctx.fillRect(x-14,y+4,28,1);ctx.restore();return;}
if(l.type==='street'){ctx.fillStyle='#343c3f';ctx.fillRect(x-3,y+13,6,Math.max(3,baseY-y-10));ctx.fillRect(x-11,y+12,22,4);ctx.fillStyle='#bca777';ctx.fillRect(x-11,y-4,22,18);ctx.fillStyle=on?'#fbe3a0':'#6f766d';ctx.fillRect(x-7,y-1,14,12);ctx.fillStyle='#343c3f';ctx.fillRect(x-15,y-6,30,4);ctx.fillRect(x-8,baseY-2,16,5);}
else if(l.type==='spotlight'){ctx.translate(x,y);ctx.rotate(l.angle||0);ctx.fillStyle='#515555';ctx.fillRect(-4,-9,8,7);ctx.fillStyle='#30393d';ctx.fillRect(-9,-3,18,8);ctx.fillStyle=on?'#e7d49f':'#87846a';ctx.fillRect(-6,5,12,2);}
else{const icon=V.Assets.images['fixture-'+l.type];if(icon?.naturalWidth){
  const width=l.type==='ceiling'?48:36,height=Math.round(width*icon.naturalHeight/icon.naturalWidth);
  ctx.drawImage(icon,x-width/2,y,width,height);
}else{ctx.fillStyle='#596363';ctx.fillRect(x-3,y+4,6,30);ctx.fillStyle=on?l.color:'#727d73';ctx.fillRect(x-12,y,24,10);}}
ctx.restore();
},
lighting(ctx,m,cam){
if(!V.state)return;
const a=this.state(),profile=this.profile(m),visual=this.preview?.hour??({dawn:6.3,day:12,sunset:18,night:22}[profile.sky])??(a.clock.daylight?12:this.time()),c=this.colors(visual),mix=this.preview?Number(profile.indoor):(this.ambientBlend??Number(profile.indoor));
let darkness=c.dark*(1-mix)+.19*mix;
const w=this.weather(m);darkness+=w.cloud*.13*(1-mix);
darkness=Math.min(darkness,1-(V.settings.minimumBrightness||.28));if(V.settings.fullVisibility)darkness=0;
if(darkness<.01)return;
if(!this.mask){this.mask=document.createElement('canvas');this.maskCtx=this.mask.getContext('2d');}
const resolution=V.Performance?.lightingScale??1,viewWidth=ctx.canvas.width,viewHeight=ctx.canvas.height,maskWidth=Math.ceil(viewWidth*resolution),maskHeight=Math.ceil(viewHeight*resolution);if(this.mask.width!==maskWidth||this.mask.height!==maskHeight){this.mask.width=maskWidth;this.mask.height=maskHeight;}this.maskCtx.setTransform(resolution,0,0,resolution,0,0);
const mask=this.maskCtx;mask.globalCompositeOperation='source-over';mask.clearRect(0,0,viewWidth,viewHeight);const tint=/^#[a-f0-9]{6}$/i.test(profile.ambient||'')?[1,3,5].map(i=>Math.round(parseInt(profile.ambient.slice(i,i+2),16)*.13)):[9,16,39];mask.fillStyle='rgba('+tint.join(',')+','+darkness+')';mask.fillRect(0,0,viewWidth,viewHeight);
const visible=this.lights(m).filter(l=>l.x+l.radius>cam.x&&l.y+l.radius>cam.y&&l.x-l.radius<cam.x+ctx.canvas.width&&l.y-l.radius<cam.y+ctx.canvas.height).sort((a,b)=>Number(b.moving)-Number(a.moving)).slice(0,Math.min(V.Performance?.lightLimit??22,V.settings.lightingQuality==='low'?9:22));
for(const l of visible){mask.save();const poly=this.visibility(m,l,l.moving);mask.beginPath();poly.forEach(([x,y],i)=>i?mask.lineTo(x-cam.x,y-cam.y):mask.moveTo(x-cam.x,y-cam.y));mask.closePath();mask.clip();const x=l.x-cam.x,y=l.y-cam.y,g=mask.createRadialGradient(x,y,6,x,y,l.radius);g.addColorStop(0,'rgba(0,0,0,'+Math.min(1,l.intensity)+')');g.addColorStop(l.softness?Math.max(.05,1-l.softness):.2,'rgba(0,0,0,'+Math.min(.85,l.intensity*.8)+')');g.addColorStop(1,'rgba(0,0,0,0)');mask.globalCompositeOperation='destination-out';mask.fillStyle=g;mask.fillRect(x-l.radius,y-l.radius,l.radius*2,l.radius*2);mask.restore();
ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.10,darkness*.15)*l.intensity;ctx.beginPath();poly.forEach(([px,py],i)=>i?ctx.lineTo(px-cam.x,py-cam.y):ctx.moveTo(px-cam.x,py-cam.y));ctx.closePath();ctx.clip();ctx.fillStyle=l.color;ctx.beginPath();ctx.arc(x,y,l.radius*.68,0,Math.PI*2);ctx.fill();ctx.restore();}
for(const l of visible.filter(l=>l.mount)){const mount=m.mounts?.find(m=>m.id===l.mount);if(!mount)continue;const pos=V.Architecture.mountPosition(m.design,mount),x=pos.x-cam.x,y=pos.y-cam.y-mount.elevation;mask.save();mask.globalCompositeOperation='destination-out';const glow=mask.createRadialGradient(x,y+mount.height*.5,2,x,y+mount.height*.5,95);glow.addColorStop(0,'rgba(0,0,0,.85)');glow.addColorStop(1,'rgba(0,0,0,0)');mask.fillStyle=glow;mask.fillRect(x-mount.width*.7,y-10,mount.width*1.4,mount.height+45);mask.restore();}
ctx.drawImage(this.mask,0,0,viewWidth,viewHeight);
},
drawWindows(ctx,m,cam){
if(!this.profile(m).indoor)return;const list=m.design?.adventure?.architecture?.windows||[{x:m.width*24,y:m.id==='museum'?90:35,w:94,h:66}],colors=this.colors(),sky='rgb('+colors.sky.join(',')+')';
for(const window of list){const x=window.x-cam.x,y=window.y-cam.y,w=window.w,h=window.h;if(x+w<0||x>ctx.canvas.width||y+h<0||y>ctx.canvas.height)continue;ctx.save();ctx.fillStyle='#b5a586';ctx.fillRect(x-6,y-6,w+12,h+12);ctx.fillStyle=sky;ctx.fillRect(x,y,w,h);ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();if(this.time()>19||this.time()<6){ctx.fillStyle='#f0e6c4';for(let i=0;i<8;i++)ctx.fillRect(x+(i*17)%w,y+(i*23)%h,2,2);}ctx.fillStyle='#667e7355';ctx.fillRect(x,y+h-15,w,15);ctx.restore();ctx.fillStyle='#756e5a';ctx.fillRect(x+w/2-2,y,4,h);ctx.fillRect(x,y+h/2-2,w,4);}
},
weatherDraw(ctx,m,cam){return V.SeasonVisuals?.atmosphere(ctx,m,cam);},
audio(){
const ctx=V.Audio.ctx;if(!ctx||!V.Audio.unlocked)return;
if(!this.sound){const b=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),p=b.getChannelData(0);let seed=17,last=0;for(let i=0;i<p.length;i++){seed=Math.imul(seed,1664525)+1013904223|0;last=.97*last+.03*((seed>>>0)/2147483648-1);p[i]=last*.8;}const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=b;source.loop=true;filter.type='lowpass';filter.frequency.value=1900;source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);gain.gain.value=0;source.start();this.sound={source,filter,gain};}
const w=this.weather(),p=this.profile(),on=!V.settings.muted&&!document.hidden&&V.Game.screen==='game';
const sound={rain:.22,storm:.34,snow:.052},volume=on&&p.weather!==false?(sound[w.type]||0)*w.intensity*w.transition*(V.settings.ambience??.5):0;
this.sound.filter.frequency.setTargetAtTime(w.type==='snow'?570:p.indoor?680:2200,ctx.currentTime,.6);
if(p.weather===false){
 this.sound.gain.gain.cancelScheduledValues(ctx.currentTime);
 this.sound.gain.gain.setValueAtTime(0,ctx.currentTime);
 if(this.thunderGain){
  this.thunderGain.cancelScheduledValues(ctx.currentTime);
  this.thunderGain.setValueAtTime(0,ctx.currentTime);
 }
}else this.sound.gain.gain.setTargetAtTime(volume,ctx.currentTime,.7);
},
thunder(){
  const ctx=V.Audio.ctx;
  if(!ctx||!V.Audio.unlocked||V.settings.muted||V.settings.reducedFlash||document.hidden||V.Game.screen!=='game'||this.profile().weather===false)return;
  const volume=.026*(V.settings.ambience??.5);
  if(volume<=0)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
  osc.type='triangle';
  osc.frequency.setValueAtTime(45,now);
  osc.frequency.exponentialRampToValueAtTime(24,now+1);
  gain.gain.setValueAtTime(0,now);
  gain.gain.linearRampToValueAtTime(volume,now+.3);
  gain.gain.exponentialRampToValueAtTime(.0001,now+1.8);
  osc.connect(gain);
  gain.connect(ctx.destination);
  this.thunderGain=gain.gain;
  osc.onended=()=>{if(this.thunderGain===gain.gain)this.thunderGain=null;};
  osc.start();
  osc.stop(now+2);
}
};
})();

});
