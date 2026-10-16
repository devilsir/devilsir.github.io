(function(){
'use strict';
const V=window.V,clamp=V.clamp;
const types={clear:'Céu limpo',cloudy:'Nublado',rain:'Chuva',snow:'Neve · demonstração/anomalia',storm:'Tempestade'};
const keys=[{h:0,c:[19,28,55],dark:.68},{h:5,c:[76,73,101],dark:.48},{h:6.5,c:[211,159,130],dark:.18},{h:9,c:[156,197,210],dark:0},{h:15,c:[158,199,214],dark:0},{h:18,c:[204,128,112],dark:.2},{h:19.5,c:[68,68,106],dark:.53},{h:21,c:[24,32,62],dark:.68},{h:24,c:[19,28,55],dark:.68}];
const E=V.Environment={particles:[],clock:0,cache:new Map(),preview:null,flash:0,sound:null,
state(){return V.Progress.ensure();},
time(){return this.preview?.hour??this.state()?.clock.hour??12;},
phase(h=this.time()){return h<5?'Madrugada':h<7?'Amanhecer':h<12?'Manhã':h<17?'Tarde':h<19?'Pôr do sol':h<21?'Anoitecer':'Noite';},
colors(h=this.time()){let i=0;while(i<keys.length-2&&h>keys[i+1].h)i++;const a=keys[i],b=keys[i+1],t=clamp((h-a.h)/(b.h-a.h),0,1);return{sky:a.c.map((c,j)=>Math.round(c+(b.c[j]-c)*t)),dark:a.dark+(b.dark-a.dark)*t};},
profile(m=V.World.current,x=V.Player.data?.x||0,y=V.Player.data?.y||0){
const d=m?.design?.adventure||{},base={indoor:m?.theme==='room',sky:'automatic',weather:true,climate:'temperate-warm',wind:.2,clouds:.25,snowAllowed:false,...d.environment};
const regions=(d.regions||[]).filter(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h).sort((a,b)=>(a.priority||0)-(b.priority||0));
for(const r of regions)Object.assign(base,Object.fromEntries(Object.entries(r).filter(([k,v])=>['indoor','weather','sky','wind','clouds','ambient','snowAllowed','climate'].includes(k)&&v!==undefined)));
return base;
},
weather(){const a=this.state();if(!a)return{type:'clear',intensity:.5};if(this.preview)return{...a.weather,...this.preview.weather,type:this.preview.weather?.type||a.weather.type};const profile=this.profile();return ['overcast','storm'].includes(profile.sky)?{...a.weather,type:profile.sky==='storm'?'storm':'cloudy'}:a.weather;},
setHour(h){const a=this.state();if(!a)return;a.clock.hour=((Number(h)||0)%24+24)%24;this.cache.clear();this.hud();V.Save.save();},
setWeather(type,opts={}){const a=this.state();if(!a||!types[type])return;Object.assign(a.weather,{target:type,type,transition:0,remaining:opts.duration||300,manual:!!opts.manual,intensity:clamp(opts.intensity??a.weather.intensity,0,1),demonstration:type==='snow'&&!!opts.force});V.Save.save();},
hydrate(m){const d=V.Architecture.design(m.design);d.environment||={indoor:m.theme==='room',sky:'automatic',climate:'temperate-warm',weather:m.theme!=='room',snowAllowed:false};d.lights||=[];d.regions||=[];},
update(dt,paused=false){
if(!V.state||V.Game.screen!=='game')return;
this.clock+=dt;this.flash=Math.max(0,this.flash-dt*.6);
const a=this.state(),c=a.clock;
if(!paused){if(!c.paused&&!c.daylight){c.hour+=dt*24/(c.cycleMinutes*60)*c.speed;while(c.hour>=24){c.hour-=24;c.day++;}}
const w=a.weather;w.transition=Math.min(1,(w.transition??1)+dt/5);
if(!w.manual){w.remaining-=dt;if(w.remaining<=0){const seed=w.seed=(Math.imul(w.seed||971,1664525)+1013904223)>>>0;const type=['clear','clear','cloudy','rain','clear','cloudy','storm'][seed%7];Object.assign(w,{type,target:type,transition:0,remaining:180+seed%300});}}
if(a.overload>0)a.overload=Math.max(0,a.overload-dt*.35);
}
const w=this.weather(),profile=this.profile();
this.ambientBlend=this.ambientBlend??(profile.indoor?1:0);this.ambientBlend+=(Number(profile.indoor)-this.ambientBlend)*Math.min(1,dt*3);
if(!paused){const wind=profile.wind??w.wind??.2;for(const p of this.particles){p.x+=dt*(p.vx+Math.cos(wind)*(w.type==='snow'?9:35));p.y+=dt*(p.vy+Math.sin(wind)*12);if(p.y>700||p.x>1800||p.x<0){p.y=-40;p.x=(p.x+677)%1600+40;}}}
if(!this.particles.length){let seed=187;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let i=0;i<180;i++)this.particles.push({x:rand()*1600,y:rand()*700,vx:(rand()-.5)*20,vy:270+rand()*230,snow:16+rand()*31,size:1+rand()*2,phase:rand()*6.28});}
if(w.type==='storm'&&!paused&&Math.floor(this.clock/17)!==this.lastStorm){this.lastStorm=Math.floor(this.clock/17);this.flash=V.settings.reducedFlash||V.settings.reducedMotion?0:.10;this.thunder();}
if(Math.floor(this.clock*2)!==this.hudTick){this.hudTick=Math.floor(this.clock*2);this.hud();this.audio();}
},
hud(){const a=this.state();if(!a)return;let el=V.$('#adv-clock');if(!el){el=document.createElement('button');el.id='adv-clock';el.className='adv-clock';el.onclick=()=>this.panel();V.$('#stage').appendChild(el);}const h=this.time(),hour=Math.floor(h),min=Math.floor((h-hour)*60),weather=this.weather();el.innerHTML=`<span aria-hidden="true">${h>=6&&h<19?'☀':'☾'}</span><b>${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}</b><small>Dia ${a.clock.day} · ${weather.type==='snow'?'Neve · '+(weather.demonstration?'demonstração':'anomalia'):this.phase()}</small>`;el.hidden=V.Game.mode!=='explore';},
panel(){
const a=this.state();if(!a)return;
V.UI.modal('O ritmo da cidade',this.phase()+' · '+types[this.weather().type],`<p>O dia dura ${a.clock.cycleMinutes} minutos reais. Leituras, menus e decisões de batalha pausam o relógio.</p><div class="row"><button id="env-wait" class="primary">Aguardar o anoitecer · 19h</button><button id="env-dawn" class="secondary">Descansar até a manhã · 8h</button><button id="env-rest" class="secondary">Pausa e recuperação</button></div><div class="separator"></div><label class="toggle"><input id="env-lantern" type="checkbox" ${a.lanternOn?'checked':''}>Lanterna de exploração</label><label class="field">Brilho mínimo<input id="env-bright" type="range" min=".2" max=".8" step=".05" value="${V.settings.minimumBrightness}"></label><label class="field">Intensidade visual do clima<input id="env-weather" type="range" min="0" max="1" step=".1" value="${V.settings.weatherIntensity}"></label><label class="toggle"><input id="env-flash" type="checkbox" ${V.settings.reducedFlash?'checked':''}>Reduzir relâmpagos</label><label class="field">Qualidade de iluminação<select id="env-quality"><option value="low">Econômica</option><option value="medium">Equilibrada</option><option value="high">Detalhada</option></select></label><p class="note">A neve aparece apenas em demonstrações do professor ou em anomalias indicadas. Galerias e áreas cobertas permanecem secas.</p>`,`<button id="env-apply" class="primary">Aplicar preferências</button>`);
V.$('#env-quality').value=V.settings.lightingQuality;
V.$('#env-wait').onclick=()=>{this.setHour(19);V.UI.close();};V.$('#env-dawn').onclick=()=>{a.clock.day++;this.setHour(8);V.Progress.rest();V.UI.close();};V.$('#env-rest').onclick=()=>{V.Progress.rest();V.UI.close();};
V.$('#env-apply').onclick=()=>{a.lanternOn=V.$('#env-lantern').checked;V.settings.minimumBrightness=+V.$('#env-bright').value;V.settings.weatherIntensity=+V.$('#env-weather').value;V.settings.reducedFlash=V.$('#env-flash').checked;V.settings.lightingQuality=V.$('#env-quality').value;this.cache.clear();V.Save.applySettings();V.Save.save();V.UI.close();};
},
sky(ctx,m,cam){
const profile=this.profile(m),height=68-cam.y;if(profile.indoor||height<=0)return;
const visual=this.preview?.hour??({dawn:6.3,day:12,sunset:18,night:22}[profile.sky])??(this.state()?.clock.daylight?12:this.time()),c=this.colors(visual),sky='rgb('+c.sky.join(',')+')',g=ctx.createLinearGradient(0,0,0,Math.max(1,height));g.addColorStop(0,sky);g.addColorStop(1,'#ccd4bd');ctx.fillStyle=g;ctx.fillRect(0,0,ctx.canvas.width,Math.min(height,ctx.canvas.height));
ctx.save();ctx.beginPath();ctx.rect(0,0,ctx.canvas.width,Math.max(0,height));ctx.clip();
const h=visual;if(h<6||h>19){ctx.fillStyle='#f0e6c7';for(let i=0;i<34;i++){const x=(i*173+37)%ctx.canvas.width,y=(i*47+7)%52-cam.y;ctx.fillRect(x,y,2,2);}ctx.beginPath();ctx.arc(ctx.canvas.width*.77,26-cam.y,13,0,Math.PI*2);ctx.fill();ctx.fillStyle=sky;ctx.beginPath();ctx.arc(ctx.canvas.width*.77+6,21-cam.y,12,0,Math.PI*2);ctx.fill();}
else{ctx.fillStyle='#f9e6ad';ctx.beginPath();ctx.arc(ctx.canvas.width*.72,26-cam.y,14,0,Math.PI*2);ctx.fill();}
const w=this.weather(),clouds=['storm','cloudy','rain'].includes(w.type)?8:Math.ceil((profile.clouds??.25)*8);ctx.fillStyle=w.type==='storm'?'#626b8066':'#eff0e349';for(let i=0;i<clouds;i++){const x=(i*260-this.clock*(V.settings.reducedMotion?0:5*Math.cos(profile.wind??.2))-cam.x*.05+2200)%(ctx.canvas.width+240)-120;ctx.fillRect(x,17+i%3*14-cam.y,110+i%2*60,9);ctx.fillRect(x+20,10+i%3*14-cam.y,65,8);}
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
const count=V.settings.lightingQuality==='high'?80:V.settings.lightingQuality==='low'?32:48,angles=Array.from({length:count},(_,i)=>i*Math.PI*2/count);
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
else{const icon=V.Assets.images['fixture-'+l.type];if(icon)ctx.drawImage(icon,x-18,y,36,40);else{ctx.fillStyle='#596363';ctx.fillRect(x-3,y+4,6,30);ctx.fillStyle=on?l.color:'#727d73';ctx.fillRect(x-12,y,24,10);}}
ctx.restore();
},
lighting(ctx,m,cam){
if(!V.state)return;
const a=this.state(),profile=this.profile(m),visual=this.preview?.hour??({dawn:6.3,day:12,sunset:18,night:22}[profile.sky])??(a.clock.daylight?12:this.time()),c=this.colors(visual),mix=this.preview?Number(profile.indoor):(this.ambientBlend??Number(profile.indoor));
let darkness=c.dark*(1-mix)+.19*mix;
const w=this.weather();if(['cloudy','rain','storm'].includes(w.type))darkness+=w.type==='storm'?.13:.055;
darkness=Math.min(darkness,1-(V.settings.minimumBrightness||.28));if(V.settings.fullVisibility)darkness=0;
if(darkness<.01)return;
if(!this.mask){this.mask=document.createElement('canvas');this.maskCtx=this.mask.getContext('2d');}
if(this.mask.width!==ctx.canvas.width||this.mask.height!==ctx.canvas.height){this.mask.width=ctx.canvas.width;this.mask.height=ctx.canvas.height;}
const mask=this.maskCtx;mask.globalCompositeOperation='source-over';mask.clearRect(0,0,this.mask.width,this.mask.height);const tint=/^#[a-f0-9]{6}$/i.test(profile.ambient||'')?[1,3,5].map(i=>Math.round(parseInt(profile.ambient.slice(i,i+2),16)*.13)):[9,16,39];mask.fillStyle='rgba('+tint.join(',')+','+darkness+')';mask.fillRect(0,0,this.mask.width,this.mask.height);
const visible=this.lights(m).filter(l=>l.x+l.radius>cam.x&&l.y+l.radius>cam.y&&l.x-l.radius<cam.x+ctx.canvas.width&&l.y-l.radius<cam.y+ctx.canvas.height).sort((a,b)=>Number(b.moving)-Number(a.moving)).slice(0,V.settings.lightingQuality==='low'?9:22);
for(const l of visible){mask.save();const poly=this.visibility(m,l,l.moving);mask.beginPath();poly.forEach(([x,y],i)=>i?mask.lineTo(x-cam.x,y-cam.y):mask.moveTo(x-cam.x,y-cam.y));mask.closePath();mask.clip();const x=l.x-cam.x,y=l.y-cam.y,g=mask.createRadialGradient(x,y,6,x,y,l.radius);g.addColorStop(0,'rgba(0,0,0,'+Math.min(1,l.intensity)+')');g.addColorStop(l.softness?Math.max(.05,1-l.softness):.2,'rgba(0,0,0,'+Math.min(.85,l.intensity*.8)+')');g.addColorStop(1,'rgba(0,0,0,0)');mask.globalCompositeOperation='destination-out';mask.fillStyle=g;mask.fillRect(x-l.radius,y-l.radius,l.radius*2,l.radius*2);mask.restore();
ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.10,darkness*.15)*l.intensity;ctx.beginPath();poly.forEach(([px,py],i)=>i?ctx.lineTo(px-cam.x,py-cam.y):ctx.moveTo(px-cam.x,py-cam.y));ctx.closePath();ctx.clip();ctx.fillStyle=l.color;ctx.beginPath();ctx.arc(x,y,l.radius*.68,0,Math.PI*2);ctx.fill();ctx.restore();}
for(const l of visible.filter(l=>l.mount)){const mount=m.mounts?.find(m=>m.id===l.mount);if(!mount)continue;const pos=V.Architecture.mountPosition(m.design,mount),x=pos.x-cam.x,y=pos.y-cam.y-mount.elevation;mask.save();mask.globalCompositeOperation='destination-out';const glow=mask.createRadialGradient(x,y+mount.height*.5,2,x,y+mount.height*.5,95);glow.addColorStop(0,'rgba(0,0,0,.85)');glow.addColorStop(1,'rgba(0,0,0,0)');mask.fillStyle=glow;mask.fillRect(x-mount.width*.7,y-10,mount.width*1.4,mount.height+45);mask.restore();}
ctx.drawImage(this.mask,0,0);
},
drawWindows(ctx,m,cam){
if(!m.design.adventure?.environment?.indoor)return;const list=m.design.adventure.architecture.windows||[{x:m.width*24,y:m.id==='museum'?90:35,w:94,h:66}],colors=this.colors(),sky='rgb('+colors.sky.join(',')+')',weather=this.weather();
for(const window of list){const x=window.x-cam.x,y=window.y-cam.y,w=window.w,h=window.h;if(x+w<0||x>ctx.canvas.width||y+h<0||y>ctx.canvas.height)continue;ctx.save();ctx.fillStyle='#b5a586';ctx.fillRect(x-6,y-6,w+12,h+12);ctx.fillStyle=sky;ctx.fillRect(x,y,w,h);ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();if(this.time()>19||this.time()<6){ctx.fillStyle='#f0e6c4';for(let i=0;i<8;i++)ctx.fillRect(x+(i*17)%w,y+(i*23)%h,2,2);}ctx.fillStyle='#667e7355';ctx.fillRect(x,y+h-15,w,15);if(['rain','storm','snow'].includes(weather.type)){ctx.strokeStyle='#e0e7e8';ctx.globalAlpha=.45;for(let i=0;i<10;i++){const px=x+(i*19)%w,py=y+(i*11+this.clock*(weather.type==='snow'?8:45))%h;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-2,py+(weather.type==='snow'?2:7));ctx.stroke();}}ctx.restore();ctx.fillStyle='#756e5a';ctx.fillRect(x+w/2-2,y,4,h);ctx.fillRect(x,y+h/2-2,w,4);}
},
weatherDraw(ctx,m,cam){
const w=this.weather(),p=this.profile(m),base=m.design.adventure?.environment||{},allowed=!base.indoor&&base.weather!==false||(m.design.adventure?.regions||[]).some(r=>r.indoor===false&&r.weather!==false);
if(!allowed||!['rain','storm','snow'].includes(w.type)||w.type==='snow'&&!base.snowAllowed&&!w.demonstration&&!(m.design.adventure?.regions||[]).some(r=>r.snowAllowed))return;
const intensity=(w.intensity||.5)*(V.settings.weatherIntensity??.7)*(w.transition??1),reduced=V.settings.reducedMotion;
if(intensity<=0)return;
const n=Math.round((w.type==='storm'?160:w.type==='snow'?90:120)*intensity*(reduced?.35:1));ctx.save();ctx.lineWidth=1;ctx.strokeStyle='#ccdeea';ctx.fillStyle='#e6e8eb';ctx.globalAlpha=.28+intensity*.15;
for(let i=0;i<n;i++){
const pt=this.particles[i],x=(pt.x+Math.sin(this.clock*.2+pt.phase)*(w.type==='snow'?15:0))%(ctx.canvas.width+50)-25,y=w.type==='snow'?(pt.y*.16+this.clock*pt.snow)%(ctx.canvas.height+40)-20:pt.y%(ctx.canvas.height+40)-20;
const region=this.profile(m,x+cam.x,y+cam.y);if(region.indoor||region.weather===false||w.type==='snow'&&!region.snowAllowed&&!w.demonstration)continue;
if(w.type==='snow')ctx.fillRect(Math.round(x),Math.round(y),pt.size,pt.size);else{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+(w.type==='storm'?15:10));ctx.stroke();if(i%7===0&&y>ctx.canvas.height*.5){ctx.beginPath();ctx.ellipse(x,y+10,3+(i%3),1.3,0,0,Math.PI*2);ctx.stroke();}}
}
if(w.type==='rain'||w.type==='storm'){ctx.globalAlpha=.025*intensity;ctx.fillStyle='#b8d5e1';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);}
if(w.type==='snow'){ctx.globalAlpha=.12*intensity;ctx.fillStyle='#e5e7e3';for(let i=0;i<25;i++){const x=(i*177)%ctx.canvas.width,y=(i*83)%ctx.canvas.height;ctx.fillRect(x,y,7,2);}}
ctx.restore();if(this.flash&&!V.settings.reducedFlash){ctx.fillStyle='rgba(217,223,240,'+this.flash+')';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);}
},
audio(){
const ctx=V.Audio.ctx;if(!ctx||!V.Audio.unlocked)return;
if(!this.sound){const b=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),p=b.getChannelData(0);let seed=17,last=0;for(let i=0;i<p.length;i++){seed=Math.imul(seed,1664525)+1013904223|0;last=.97*last+.03*((seed>>>0)/2147483648-1);p[i]=last*.8;}const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=b;source.loop=true;filter.type='lowpass';filter.frequency.value=1900;source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);gain.gain.value=0;source.start();this.sound={source,filter,gain};}
const w=this.weather(),p=this.profile(),on=!V.settings.muted&&!document.hidden&&V.Game.screen==='game';const volume=on&&['rain','storm','snow'].includes(w.type)?(w.type==='storm'?.28:.17)*(w.intensity||.5)*(V.settings.ambience??.5)*(p.indoor?.18:1):0;this.sound.gain.gain.setTargetAtTime(volume,ctx.currentTime,.7);
},
thunder(){const ctx=V.Audio.ctx;if(!ctx||V.settings.muted||V.settings.reducedFlash||V.Game.screen!=='game')return;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.setValueAtTime(45,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(24,ctx.currentTime+1);gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(.025*(V.settings.ambience??.5),ctx.currentTime+.3);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+1.8);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+2);}
};
})();
