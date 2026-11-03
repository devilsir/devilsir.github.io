(function(){
'use strict';
const V=window.V,D=V.NatureData,N=V.NatureWorld,A=V.NatureArt,W=V.World,T=48;
const byId=id=>D.species.find(s=>s.id===id);
A.names.push('africa-extra','brazil-extra','flight','water-full-africa','water-full-brazil','water-full-extra','museum-fauna');
const cell=A.cell.bind(A);A.cell=function(...args){const f=cell(...args);if(f.sheet==='museum-fauna')f.rows=2;return f;};
const assetGroup=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=function(key){if(/assets\/nature\/museum-fauna\./.test(key))return'animal-museum';if(/assets\/nature\/(?:africa-extra|brazil-extra|flight|water-full-africa|water-full-brazil|water-full-extra)\./.test(key))return'wildlife';return assetGroup(key);};
const groups=V.MapAssets.groups.bind(V.MapAssets);V.MapAssets.groups=function(m){const out=groups(m);if(m?.nature)out.push('wildlife');return [...new Set(out)];};
const L=V.Wildlife={
 species:byId,
 water(m,x,y){return(m?.natureWater||[]).some(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);},
 mode(s,o,m=W.current){return s.flightArt?'fly':s.waterArt&&(o.forceWater||this.water(m,o.x,o.y))?'water':s.motion==='perch'?'perch':'land';},
 frame(s,mode,time=0,moving=true){const art=mode==='fly'?s.flightArt:mode==='water'?s.waterArt:null;return{sheet:art?.sheet||s.sheet,row:art?.row??s.row,col:V.settings.reducedMotion?0:mode==='fly'||mode==='water'||moving?Math.floor(time*(mode==='fly'?7:5))%4:0};},
 waves(c,x,y,size,time,front=false){const t=V.settings.reducedMotion?0:time;c.save();c.lineWidth=front?2:1.5;for(let i=0;i<3;i++){const phase=(t*.65+i/3)%1,rx=size*(.4+phase*.21),ry=size*(.1+phase*.055);c.strokeStyle=front?'rgba(218,243,230,'+(.64-phase*.42)+')':'rgba(166,217,208,'+(.44-phase*.3)+')';c.beginPath();c.ellipse(x,y,rx,ry,0,front?.08:Math.PI+.12,front?Math.PI-.08:Math.PI*2-.12);c.stroke();}if(front&&!V.settings.reducedMotion){c.fillStyle='#d7f2dfaa';for(let i=0;i<4;i++){const a=t*2+i*Math.PI*.5;c.fillRect(x+Math.cos(a)*size*.43,y+Math.sin(a)*size*.11,3,2);}}c.restore();},
 perch(c,x,y,size){const branch=y-size*.74;c.save();c.fillStyle='#294c3738';c.beginPath();c.ellipse(x+size*.46,y+5,size*.29,7,0,0,Math.PI*2);c.fill();c.strokeStyle='#4e3d2a';c.lineWidth=Math.max(8,size*.12);c.lineCap='round';c.beginPath();c.moveTo(x+size*.47,y);c.lineTo(x+size*.47,branch-5);c.moveTo(x-size*.68,branch);c.lineTo(x+size*.7,branch);c.stroke();c.strokeStyle='#a27e49';c.lineWidth=Math.max(3,size*.045);c.beginPath();c.moveTo(x-size*.66,branch-2);c.lineTo(x+size*.68,branch-2);c.moveTo(x+size*.45,y);c.lineTo(x+size*.45,branch+3);c.stroke();c.fillStyle='#54794e';for(const[dx,dy]of [[-.66,-.1],[.67,-.12],[.75,-.02]]){c.beginPath();c.ellipse(x+dx*size,branch+dy*size,size*.13,size*.06,dx<0?-.4:.5,0,Math.PI*2);c.fill();}c.restore();},
 drawAnimal(c,s,o,cam={x:0,y:0},m=W.current,size=s.size){const x=o.x-cam.x,y=o.y-cam.y,mode=this.mode(s,o,m),time=o.phase||0,f=this.frame(s,mode,time,o.walking),flying=mode==='fly',wet=mode==='water',perched=mode==='perch',alt=flying?46+(V.settings.reducedMotion?0:Math.sin(time*2.4)*7):perched?size*.7:0,h=size*(flying?1:wet?.9:s.id==='giraffe'?1.12:.85);
  if(perched)this.perch(c,(o.perch?.x??o.x)-cam.x,(o.perch?.y??o.y)-cam.y,size);if(wet)this.waves(c,x,y-h*.3,size,time,false);c.save();if(!wet&&!perched){c.fillStyle=flying?'#24473426':'#24473440';c.beginPath();c.ellipse(x,y+4,size*(flying?.21:.3),flying?5:7,0,0,Math.PI*2);c.fill();}if(o.dir<0){c.translate(x*2,0);c.scale(-1,1);}A.frame(c,f.sheet,f.row,f.col,x-size/2,y-h-alt,size,h);c.restore();
  if(wet)this.waves(c,x,y-h*.3,size,time,true);
  if(o.id&&W.nearest?.id===o.id)V.Maritime.label(c,s.name,x,y-h-alt-11,true);return mode;
 },
 canMove(m,o,s,x,y){if(x<T+12||x>(m.width-1)*T-12||y<T+12||y>(m.height-1)*T-12)return false;if(s.flightArt)return true;return!m.solids.some(b=>{if(s.waterArt&&m.natureWater.some(w=>w.owner===b.owner))return false;return x+14>b.x&&x-14<b.x+b.w&&y+14>b.y&&y-14<b.y+b.h;});},
 add(m,id,x,y,bounds){return N.animal(m,id,x,y,bounds);},
 enrich(m){
  if(m.natureStage===0){this.add(m,'spotted-hyena',31,11,[29,10,5,2]);this.add(m,'wild-dog',11,6,[8,5,5,2]);this.add(m,'meerkat',5,23,[3.4,21.8,4,2]);this.add(m,'meerkat',7,23,[5.3,22,3,2]);this.add(m,'puff-adder',35,17,[34,16,3,2]);}
  if(m.natureStage===1){this.add(m,'fish-eagle',28,7,[26,5,8,5]);this.add(m,'puff-adder',24,21.5,[22,21,3,1.4]);this.add(m,'elephant',18,12,[16,11,6,2]);this.add(m,'buffalo',24,6,[21,4,4,3]);}
  if(m.natureStage===2){this.add(m,'yellow-anaconda',14,12,[12,10,6,4]);this.add(m,'giant-otter',32,13,[30,10,6,4]);this.add(m,'tapir',18,7,[17,6,4,5]);this.add(m,'capybara',19,13,[17,11,4,3]);this.add(m,'jaguar',35,14,[32,12,5,3]);}
  if(m.natureStage===3){this.add(m,'armadillo',31,6,[29,5,5,2]);this.add(m,'tapir',20,7.5,[18,7,5,2]);}
  if(m.natureStage===4){this.add(m,'harpy',17,7,[14,5,8,5]);this.add(m,'tapir',34,13,[32,11,5,4]);this.add(m,'armadillo',9,19,[7,18,4,2]);this.add(m,'armadillo',35,11,[32,10,5,4]);}
  // Broader bank ranges let these animals enter and leave the water naturally.
  for(const o of m.objects.filter(o=>o.type==='nature-animal')){o.phase+=.4;if(o.species==='tapir'&&m.natureStage===2)o.bounds={x:17*T,y:6*T,w:5*T,h:6*T};if(byId(o.species).motion==='perch'){o.perch={x:o.x,y:o.y};const tree=m.objects.find(p=>p.id===m.id+'-sloth-tree');if(tree)tree.y=o.y-1;}}
  return m;
 },
 preview(c,s,mode,time=0){c.clearRect(0,0,c.canvas.width,c.canvas.height);if(s.motion==='perch'&&mode!=='water'){const size=Math.min(c.canvas.width*.65,c.canvas.height*.48),x=c.canvas.width/2,y=c.canvas.height*.9;this.drawAnimal(c,s,{x,y,phase:time,walking:true,dir:1},{x:0,y:0},{natureWater:[]},size);return;}if(mode==='water'){const x=c.canvas.width/2,y=c.canvas.height*.85,size=Math.min(c.canvas.width*.83,c.canvas.height*.92);c.fillStyle='#4b8582';c.beginPath();c.ellipse(x,y-size*.25,size*.59,size*.25,0,0,Math.PI*2);c.fill();this.drawAnimal(c,s,{x,y,phase:time,walking:true,forceWater:true,dir:1},{x:0,y:0},{natureWater:[]},size);return;}const f=this.frame(s,mode,time,true),size=Math.min(c.canvas.width-24,c.canvas.height-24,224);A.frame(c,f.sheet,f.row,f.col,(c.canvas.width-size)/2,(c.canvas.height-size)/2,size,size);}
};
const build=N.build.bind(N);N.build=function(...args){return L.enrich(build(...args));};
N.update=function(m,dt){if(m.natureTick===V.Engine.time)return;dt=V.clamp(dt,0,.08);m.natureTick=V.Engine.time;m.natureClock+=dt;for(const o of m.objects.filter(o=>o.type==='nature-animal')){const s=byId(o.species);o.phase+=dt;o.wait-=dt;if(o.wait<=0){o.wait=2+(o.phase*7%5);o.walking=!o.walking;if(o.walking)o.dir*=-1;}if(s.motion==='perch')continue;const mode=L.mode(s,o,m);if(!o.walking&&mode!=='fly')continue;const speed=mode==='fly'?36:mode==='water'?18:s.size>140?16:23,nx=o.x+o.dir*speed*dt,ny=V.clamp(o.y+Math.sin(o.phase*.8)*dt*9,o.bounds.y,o.bounds.y+o.bounds.h);if(nx<o.bounds.x||nx>o.bounds.x+o.bounds.w||!L.canMove(m,o,s,nx,ny)){o.dir*=-1;continue;}o.x=nx;o.y=ny;o.walk+=dt;}};
const draw=N.draw.bind(N);N.draw=function(c,o,cam){if(o.type==='nature-animal'){L.drawAnimal(c,byId(o.species),o,cam);return true;}return draw(c,o,cam);};
// Every requesting viewer receives their own field guide and educational record.
const field=N.fieldGuide.bind(N);N.fieldGuide=function(...args){const out=field(...args);for(const el of V.$$('[data-nature-species]')){const s=byId(el.dataset.natureSpecies),country=el.parentElement.querySelector('small');if(country)country.textContent=s.country;}return out;};
const panel=N.speciesPanel.bind(N);N.speciesPanel=function(id,...args){const out=panel(id,...args),s=byId(id),body=V.$('.modal-body');if(body&&!body.querySelector('.wildlife-facts')){const box=document.createElement('div');box.className='nature-notice wildlife-facts';box.innerHTML='<strong>Localização</strong><p>'+V.escape(s.location)+'</p><strong>Curiosidade</strong><p>'+V.escape(s.curiosity)+'</p>';body.append(box);}return out;};
})();
