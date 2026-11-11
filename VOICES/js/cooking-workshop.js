/* Registered module: cooking-workshop */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("cooking-workshop", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,P=V.Playground,K=V.Cooking,A=V.CookingArt,D=V.CookingWorkshopData,Art=V.CookingWorkshopArtData,C=P.controllers[V.CookingData.id],heat=new Set(['fry','simmer','steam','bake']);
const W=V.CookingWorkshop={
 images:{},recipe:null,run:null,visualScale:.74,plateScale:.76,
 load(){if(this.ready)return this.ready;this.ready=Promise.all(Object.entries(Art).map(([id,s])=>new Promise(resolve=>{const image=V.Assets.image();this.images[id]=image;image.onload=image.onerror=resolve;image.src=s.file+'?v=20261102-workshop1';V.AssetLoader.register(image,resolve);})));return this.ready;},
 plan(r){return D.plans[K.recipe(r).id];},
 ensure(r){const d=r.data;if(d.platingRevision!==D.revision){if(K.step(r).kind==='plate'){d.placed=d.phase==='done'?this.plan(r).parts.map((_,i)=>i):[];d.progress=d.phase==='done'?1:0;}d.platingRevision=D.revision;d.platingMotion=[];d.dragServing=null;}d.platingMotion||=[];},
 fit(sheet,frame,x,y,w,h,maxScale=1.8){const f=Art[sheet]?.frames[frame];if(!f)return null;const scale=Math.min(w/f.w,h/f.h,maxScale),dw=f.w*scale,dh=f.h*scale;return{x:Math.round(x+(w-dw)/2),y:Math.round(y+(h-dh)/2),w:Math.round(dw),h:Math.round(dh)};},
 art(c,sheet,frame,x,y,w,h,maxScale=1.8){const image=this.images[sheet],f=Art[sheet]?.frames[frame],rect=this.fit(sheet,frame,x,y,w,h,maxScale);if(!image?.naturalWidth||!rect)return rect;c.save();c.imageSmoothingEnabled=false;c.drawImage(image,f.x,f.y,f.w,f.h,rect.x,rect.y,rect.w,rect.h);c.restore();return rect;},
 stageRect(x,y,w,h){const k=this.visualScale;return[x+w*(1-k)/2,y+h*(1-k)/2,w*k,h*k];},
 food(c,id,x,y,size=118){const f=D.foods[id];return f&&this.art(c,f.sheet,f.frame,x-size/2,y-size/2,size,size);},
 sources(r){const groups=[];for(const [i,part]of this.plan(r).parts.entries()){let g=groups.find(g=>g.food===part.food);if(!g){g={food:part.food,indices:[],label:D.foods[part.food].label};groups.push(g);}g.indices.push(i);}const h=groups.length===1?218:groups.length===2?128:88,gap=12,start=groups.length===1?155:groups.length===2?142:132;return groups.map((g,i)=>({...g,x:154,y:start+i*(h+gap),w:208,h,index:g.indices.find(i=>!r.data.placed.includes(i)),remaining:g.indices.filter(i=>!r.data.placed.includes(i)).length}));},
 target(r,index){const part=this.plan(r).parts[index],k=this.plateScale;return part&&{x:622+part.x*k,y:272+part.y*k,w:Math.max(76,part.size*.8*k),h:Math.max(48,part.size*.48*k)};},
 selected(r){this.ensure(r);return this.plan(r).parts[r.data.selected]||this.plan(r).parts[0];},
 select(r,delta){const list=this.plan(r).parts.map((_,i)=>i).filter(i=>!r.data.placed.includes(i));if(!list.length)return;const at=list.indexOf(r.data.selected);r.data.selected=list[(Math.max(0,at)+delta+list.length)%list.length];P.controls();},
 place(r,index,from=null){
  this.ensure(r);const d=r.data,part=this.plan(r).parts[index];if(d.phase!=='work'||!part||d.placed.includes(index))return false;
  if(part.after?.some(i=>!d.placed.includes(i))){K.mistake(r,part.sauce?'Coloque as fatias no prato antes de regar com a calda.':'Sirva primeiro a base preparada, depois coloque esta porção por cima.');return false;}
  const source=this.sources(r).find(g=>g.indices.includes(index)),to=this.target(r,index);d.placed.push(index);d.platingMotion.push({index,age:0,from:from||{x:source.x+source.w/2,y:source.y+source.h/2},to:{x:to.x,y:to.y}});d.dragServing=null;
  V.Audio.sfx('collect');K.spark(r,to.x,to.y,'#f2d48a');K.gain(r,1/this.plan(r).parts.length);d.selected=this.plan(r).parts.findIndex((_,i)=>!d.placed.includes(i));if(d.selected<0)d.selected=0;
  if(d.phase==='work')P.feedback('✓ '+D.foods[part.food].label+' servido. '+d.placed.length+'/'+this.plan(r).parts.length+' porções no prato.');P.controls();P.save();return true;
 },
 servingPointer(r,type,p){
  this.ensure(r);const d=r.data;if(d.phase!=='work')return;d.tool={...p};
  if(type==='down'){const g=this.sources(r).find(g=>g.remaining&&p.x>=g.x&&p.x<=g.x+g.w&&p.y>=g.y&&p.y<=g.y+g.h);if(g){d.selected=g.index;d.dragServing={index:g.index,x:p.x,y:p.y,start:{x:p.x,y:p.y}};P.controls();}return;}
  if(type==='cancel'){d.dragServing=null;return;}
  if(!d.dragServing)return;
  if(type==='move'){d.dragServing.x=p.x;d.dragServing.y=p.y;return;}
  if(type==='up'){const drag=d.dragServing,target=this.target(r,drag.index);d.dragServing=null;if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)<8)return;if(target&&Math.hypot((p.x-target.x)/(target.w*.7),(p.y-target.y)/(target.h*.8))<=1.15)this.place(r,drag.index,p);else{K.mistake(r,'Leve esta porção ao contorno dourado do prato. Ela continua na bandeja.');d.returnServing={index:drag.index,x:p.x,y:p.y,age:0};}}
 },
 fishZones(){const rect=this.fit('complete-preparation',0,...this.stageRect(280,148,400,234)),x=rect.x+rect.w*.24,y=rect.y+rect.h*.28,w=rect.w*.64,h=rect.h*.5;return Array.from({length:6},(_,i)=>({x:x+i%3*w/3,y:y+Math.floor(i/3)*h/2,w:w/3,h:h/2}));},
 drawFishMarks(c,r){for(const[i,z]of this.fishZones().entries()){c.strokeStyle=r.data.zones[i]?'#77ad8b':'#e6bd64';c.lineWidth=r.data.zones[i]?1:2;c.strokeRect(z.x,z.y,z.w-3,z.h-2);}const p=K.point(r);this.text(c,'→',p.x,p.y,22,'#315840');this.text(c,'CAUDA → CABEÇA',480,389,12,'#315840');},
 scrapePointer(r,type,p){const d=r.data;d.tool={...p};if(d.phase!=='work')return;if(type==='down'){d.stroke={...p};return;}if(type==='cancel'){d.stroke=null;return;}if(type!=='up'||!d.stroke)return;const a=d.stroke;d.stroke=null;const zones=this.fishZones(),i=zones.findIndex(z=>a.x>=z.x&&a.x<=z.x+z.w&&a.y>=z.y&&a.y<=z.y+z.h);if(i>=0&&!d.zones[i]&&p.x-a.x>=zones[i].w*.45&&Math.abs(p.y-a.y)<zones[i].h*1.2){d.zones[i]=true;K.spark(r,p.x,p.y);K.gain(r,1/6);}else if(p.x<a.x)K.mistake(r,'Raspe da cauda à cabeça, seguindo a seta para a direita.');},
 rounded(c,x,y,w,h,fill,stroke='#799e94',radius=12){c.save();c.fillStyle=fill;c.strokeStyle=stroke;c.lineWidth=2;c.beginPath();c.roundRect(x,y,w,h,radius);c.fill();if(stroke)c.stroke();c.restore();},
 text(c,text,x,y,size=15,color='#f0e6c8',align='center'){c.save();c.font='600 '+size+'px "VOICES Sans",sans-serif';c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.fillText(text,x,y);c.restore();},
 background(c,r){c.fillStyle='#193f38';c.fillRect(0,0,960,540);const cover=A.images.cover;if(cover?.naturalWidth){c.globalAlpha=.12;c.drawImage(cover,0,0,960,540);c.globalAlpha=1;}this.text(c,K.recipe(r).name,480,33,24);this.text(c,'MONTAGEM · '+r.data.placed.length+'/'+this.plan(r).parts.length+' porções',480,64,14,'#b8d6c3');this.rounded(c,126,100,708,359,'#b0bcb2','#dce1c9');c.fillStyle='#899f96';c.fillRect(139,438,682,7);for(const x of [146,805]){c.fillStyle='#788d83';c.fillRect(x,114,3,314);}},
 plate(c,r,cx=622,cy=272,scale=this.plateScale,complete=false){
  const plan=this.plan(r),d=r.data;c.save();c.translate(cx,cy);c.scale(scale,scale);
  this.art(c,'prepared-sweets-tools',plan.vessel==='bowl'?14:13,-177,-103,354,206);
  const selected=d.phase==='work'&&!complete?this.target(r,d.dragServing?.index??d.selected):null;
  if(selected){c.strokeStyle='#b89143';c.lineWidth=3;c.setLineDash([6,5]);c.beginPath();c.ellipse((selected.x-622)/this.plateScale,(selected.y-272)/this.plateScale+12,selected.w*.48/this.plateScale,selected.h*.4/this.plateScale,0,0,Math.PI*2);c.stroke();c.setLineDash([]);}
  const placed=complete?plan.parts.map((_,i)=>i):d.placed;
  for(const i of placed){const part=plan.parts[i];if(!complete&&d.platingMotion.some(m=>m.index===i&&m.age<.32))continue;if(part.fill&&placed.some(j=>j>i&&plan.parts[j].food===part.food))continue;
   if(part.sauce){c.fillStyle='#f6d89acc';for(let n=0;n<5;n++){c.beginPath();c.ellipse(-77+n*34,-10+Math.sin(n)*6,12,3,Math.PI*.1,0,Math.PI*2);c.fill();}}
   else this.food(c,part.food,part.x,part.y,part.size);
  }
  c.restore();
 },
 drawServing(c,r){
  this.ensure(r);const d=r.data;this.background(c,r);this.plate(c,r);
  for(const g of this.sources(r)){const selected=g.indices.includes(d.selected)&&d.phase==='work',fill=!g.remaining?'#c4d0bf':selected?'#f7edcf':'#e3e6d6';this.rounded(c,g.x,g.y,g.w,g.h,fill,selected?'#b08d42':'#7f9a89');const large=g.h>150,size=large?119:g.h>100?83:64,iy=g.y+(large?79:g.h>100?45:31);if(g.remaining)this.food(c,g.food,g.x+g.w/2,iy,size*this.visualScale);else this.text(c,'✓',g.x+g.w/2,iy,32,'#56826c');this.text(c,g.label,g.x+g.w/2,g.y+g.h-32,13,'#264d40');this.text(c,g.remaining?g.remaining+' '+(g.remaining>1?'porções prontas':'porção pronta'):'✓ servido',g.x+g.w/2,g.y+g.h-13,12,'#47715d');}
  if(d.phase==='work'){const part=this.selected(r),target=this.target(r,d.selected);this.text(c,part.sauce?'Regue as fatias com a calda preparada':'Solte a porção no contorno dourado',607,414,14,'#214c3d');if(d.dragServing){c.save();c.globalAlpha=.9;this.food(c,part.food,d.dragServing.x,d.dragServing.y,114*this.plateScale);c.restore();}else if(!V.settings.reducedMotion){const source=this.sources(r).find(g=>g.indices.includes(d.selected)),t=(d.t*.6)%1;const x=(source.x+source.w+14)*(1-t)+(target.x-target.w*.45)*t,y=(source.y+source.h/2)*(1-t)+(target.y-12)*t;c.fillStyle='#436f5a99';c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fill();}}
  for(const motion of d.platingMotion){if(motion.age>=.32)continue;const t=V.settings.reducedMotion?1:Math.min(1,motion.age/.32),ease=1-(1-t)**3,part=this.plan(r).parts[motion.index],x=motion.from.x+(motion.to.x-motion.from.x)*ease,y=motion.from.y+(motion.to.y-motion.from.y)*ease-Math.sin(t*Math.PI)*28;if(!part.sauce)this.art(c,'prepared-sweets-tools',15,x-65,y-10,154,48);this.food(c,part.food,x,y,part.size*this.plateScale);}
  if(d.returnServing&&!V.settings.reducedMotion){const m=d.returnServing,g=this.sources(r).find(g=>g.indices.includes(m.index));if(g){const t=Math.min(1,m.age/.24);this.food(c,this.plan(r).parts[m.index].food,m.x+(g.x+g.w/2-m.x)*t,m.y+(g.y+g.h/2-m.y)*t,96*this.plateScale);}}
  for(const particle of d.particles){c.save();c.globalAlpha=Math.max(0,particle.life/.65);c.fillStyle=particle.color;c.fillRect(particle.x,particle.y,4,3);c.restore();}
  const total=this.plan(r).parts.length;P.box(c,234,485,492,12,'#31594b');P.box(c,234,485,492*d.placed.length/total,12,'#a3cfa5');this.text(c,d.phase==='done'?'✓ PRATO MONTADO · SERVINDO SUA RECEITA':d.placed.length+' de '+total+' porções servidas',480,518,14);
 },
 prepFrame(r,s,progress){
  const kind=s.kind,title=s.title.toLowerCase(),done=progress>=.52;
  if(kind==='scale')return done?1:0;if(kind==='cut')return /cebola/.test(title)?done?3:2:done?15:14;
  if(kind==='grate')return done?5:4;if(kind==='fold')return done?13:12;if(kind==='knead'||kind==='shape')return 11;if(kind==='grind')return 10;
  if(kind==='wash')return /peixe/.test(title)?1:/arroz|milho|grão|samp/.test(title)?6:done?7:6;
  if(kind==='stir')return /feijão|massa|mistura|aerar|flocos/.test(title)?9:/coco/.test(title)?5:/funge|pap|angu|creme/.test(title)?9:15;
  if(kind==='season')return /galinha/.test(title)?15:/peixe|postas/.test(title)?1:/arroz/.test(title)?7:15;
  return 9;
 },
 cookware(r,s){const id=K.recipe(r).id,title=s.title.toLowerCase();if(id==='calulu'&&!/funge|farinha/.test(title))return 0;if(/funge|pap|angu|creme/.test(title))return 1;if(['umngqusho','mungunza','baiao','geelrys'].includes(id)||/grãos|feijão|arroz/.test(title))return 3;return 2;},
 vessel(c,r,s,progress,x,y,w,h){
  const kind=s.kind,title=s.title.toLowerCase(),id=K.recipe(r).id,frame=kind==='fry'?0:kind==='steam'?2:kind==='bake'?3:1,rect=this.art(c,'empty-cookware',frame,x,y,w,h),surface=[[.39,.63,.29,.18],[.5,.35,.32,.12],[.5,.34,.31,.12],[.5,.5,.33,.17]][frame],cx=rect.x+rect.w*surface[0],cy=rect.y+rect.h*surface[1];
  if(/calda|leite|caldo/.test(title)){c.fillStyle=/calda|leite/.test(title)?'#edcf97':'#b97740';c.beginPath();c.ellipse(cx,cy,rect.w*surface[2],rect.h*surface[3],0,0,Math.PI*2);c.fill();}
  else if(kind==='fry'){for(let n=0;n<3;n++){const xx=cx+(n-1)*47,yy=cy+(n%2)*10;if(progress<.45)this.art(c,'complete-preparation',11,xx-36,yy-30,72,60);else this.food(c,this.plan(r).parts[0].food,xx,yy,75);}}
  else if(kind==='steam'&&id==='abara'){for(const dx of [-35,35])this.art(c,'complete-preparation',13,cx+dx-39,cy-29,78,58);}
  else{const f=/funge/.test(title)?'savory-15':this.plan(r).parts[0].food;this.food(c,f,cx,cy,Math.min(170,rect.w*.59));}
  return rect;
 },
 burner(c,rect,heat,time){
  const level=V.clamp(heat,0,1),cx=rect.x+rect.w/2,y=rect.y+rect.h+4,width=rect.w*.62,t=V.settings.reducedMotion?0:time;
  c.save();const glow=c.createRadialGradient(cx,y-2,3,cx,y-2,width*.67);glow.addColorStop(0,'rgba(239,164,64,'+(.09+level*.16)+')');glow.addColorStop(1,'#eeb04b00');c.fillStyle=glow;c.fillRect(cx-width,y-width*.6,width*2,width*1.1);
  c.fillStyle='#263c36';c.beginPath();c.ellipse(cx,y+4,width*.61,9,0,0,Math.PI*2);c.fill();c.strokeStyle='#91a39a';c.lineWidth=2;c.stroke();
  const tongue=(x,base,w,h,lean,color)=>{c.fillStyle=color;c.beginPath();c.moveTo(x-w/2,base);c.bezierCurveTo(x-w*.65,base-h*.4,x+lean-w*.25,base-h*.72,x+lean,base-h);c.bezierCurveTo(x+lean+w*.2,base-h*.55,x+w*.6,base-h*.24,x+w/2,base);c.closePath();c.fill();};
  for(let n=0;n<9;n++){const x=cx-width/2+n*width/8,sway=Math.sin(t*3.6+n*1.7),h=7+level*(12+Math.sin(t*4+n)*3);tongue(x,y,9,h,sway*2.5,'#e3a04e');tongue(x,y,6,h*.68,sway*1.4,'#f8d386');tongue(x,y+1,8,5+level*3,0,'#6abbd0');tongue(x,y+1,3,4,0,'#ccedf0');}
  c.strokeStyle='#364e44';c.lineWidth=4;for(const dx of [-width*.38,width*.38]){c.beginPath();c.moveTo(cx+dx,y+9);c.lineTo(cx+dx*.7,y-3);c.stroke();}c.restore();
 },
 stage(c,s,progress,x,y,w,h){
  const r=this.run;if(!r)return false;const d=r.data,kind=s.kind,t=V.settings.reducedMotion?0:d.t;
  this.rounded(c,190,82,580,386,'#adb9af','#dfe5ce');c.fillStyle='#879d93';c.fillRect(203,452,554,5);this.rounded(c,224,122,512,282,heat.has(kind)?'#596e65':'#e8dfc5','#7b8c72',9);
  [x,y,w,h]=this.stageRect(x,y,w,h);let rect;
  if(heat.has(kind)||kind==='pour'||kind==='layer'){
   const row=this.cookware(r,s),frame=Math.min(3,Math.floor(Math.min(.999,progress)*4)),actual=kind==='layer'?0:kind==='pour'?Math.max(0,Math.min(2,frame)):frame;
   if(kind==='bake'){this.rounded(c,302,135,356,260,'#4a6059','#d5dfd0',10);this.rounded(c,319,151,322,225,'#253d35','#90a393',5);const glow=c.createRadialGradient(480,295,12,480,295,160);glow.addColorStop(0,'rgba(232,145,61,'+(.2+d.heat*.3)+')');glow.addColorStop(1,'#e39a3c00');c.fillStyle=glow;c.fillRect(320,152,320,222);c.strokeStyle='#d39a59';c.lineWidth=3;for(const yy of [351,359]){c.beginPath();c.moveTo(341,yy);c.lineTo(619,yy);c.stroke();}}
   
   const dedicated=(id=>id==='calulu'&&!/funge|farinha/.test(s.title.toLowerCase())||id==='moqueca'||id==='umngqusho'||['pap','angu'].includes(id)&&/pap|angu|milho/.test(s.title.toLowerCase()))(K.recipe(r).id);
   rect=dedicated?this.art(c,'complete-cookware',row*4+actual,x,y,w,h):this.vessel(c,r,s,progress,x,y,w,h);
   if(heat.has(kind)&&kind!=='bake')this.burner(c,rect,d.heat,t);
   if(heat.has(kind)&&!V.settings.reducedMotion&&d.phase==='work'){for(let n=0;n<5;n++){const phase=(t*.35+n*.2)%1,px=rect.x+rect.w*(.32+n*.09),py=rect.y+rect.h*.21-phase*52;c.save();c.globalAlpha=(1-phase)*.7;c.strokeStyle='#f0edda';c.lineWidth=3;c.beginPath();c.moveTo(px,py+15);c.quadraticCurveTo(px-8,py+7,px,py);c.stroke();c.restore();}for(let n=0;n<6;n++){const phase=(t*.9+n*.17)%1;c.strokeStyle='#eddec0';c.lineWidth=1.4;c.beginPath();c.ellipse(rect.x+rect.w*(.3+n*.075),rect.y+rect.h*(.31+Math.sin(n)*.055),2+phase*3,1+phase*1.5,0,0,Math.PI*2);c.stroke();}}
  }else{
   const frame=this.prepFrame(r,s,progress),bounce=V.settings.reducedMotion?0:d.animation>0?Math.sin((.35-d.animation)*24)*2:0;
   if(kind==='stir'&&/funge/.test(s.title.toLowerCase()))return !!this.vessel(c,r,s,progress,x,y,w,h);
   if(kind==='season'&&['mungunza','koesister','baiao','geelrys'].includes(K.recipe(r).id)){const f=this.plan(r).parts[0].food;this.food(c,f,480,264,245*this.visualScale);return true;}
   c.save();if(kind==='knead'&&d.animation>0&&!V.settings.reducedMotion){c.translate(480,270);c.scale(1+Math.sin(d.animation*15)*.025,1-Math.sin(d.animation*15)*.025);c.translate(-480,-270);}rect=this.art(c,'complete-preparation',frame,x,y+bounce,w,h);c.restore();
   if(kind==='wash'&&d.phase==='work'){c.save();c.strokeStyle='#9bcacb99';c.lineWidth=2;for(let n=0;n<3;n++){const phase=V.settings.reducedMotion?n*.3:(t*.7+n/3)%1;c.beginPath();c.ellipse(480,282,60+phase*55,20+phase*18,0,0,Math.PI*2);c.stroke();}c.restore();}
  }
  return !!rect;
 },
 materials(r){const s=K.step(r),title=s.title.toLowerCase();if(s.kind==='shape')return[{frame:11,label:'Massa preparada'},{frame:11,label:'Porção de massa'},{frame:11,label:'Porção de massa'}];if(/postas|peixe/.test(title))return[{frame:1,label:'Peixe limpo'},{frame:3,label:'Cebola picada'},{frame:15,label:'Legumes picados'}];if(/folha|calulu|quiabo/.test(title))return[{frame:1,label:'Peixe preparado'},{frame:15,label:'Quiabo cortado'},{frame:14,label:'Folhas e temperos'}];if(/massa/.test(title))return[{frame:9,label:'Massa misturada'},{frame:9,label:'Massa misturada'},{frame:9,label:'Massa misturada'}];return[{frame:7,label:'Ingredientes separados'},{frame:3,label:'Cebola picada'},{frame:15,label:'Legumes preparados'}];},
 drawMaterials(c,r){const parts=this.materials(r);for(let i=0;i<3;i++){const x=296+i*141;this.rounded(c,x,378,86,59,r.data.placed.includes(i)?'#9bad96':i===r.data.selected?'#f3e1ad':'#c5d0bf','#547b66',6);if(!r.data.placed.includes(i))this.art(c,'complete-preparation',parts[i].frame,x+12,380,62,41);this.text(c,String(i+1),x+43,445,12,'#284d3d');}this.text(c,parts[r.data.selected].label,480,463,12,'#254c3d');}
};
const assets=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await Promise.all([assets(...args),W.load()]);return this.errors;};
const dish=A.dish.bind(A);A.dish=function(id,size=48){const index=V.CookingData.recipes.findIndex(r=>r.output===id);if(index<0)return dish(id,size);return '<span class="cooking-dish-art cooking-prepared-dish-art adv-icon" aria-hidden="true" style="--dish-size:'+Math.max(16,Number(size)||48)+'px;--dish-x:'+index%4+';--dish-y:'+Math.floor(index/4)+';background-image:url(\'assets/cooking/workshop/finished-plates.webp?v=20261102-workshop1\')"></span>';};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=function(key){return key.startsWith('assets/cooking/workshop/')?'cooking-workshop':group(key);};
A.ensure=function(world=false){return V.MapAssets.ensure(world?['cooking-world']:['cooking','cooking-workshop','nature-food'],'Preparando a cozinha');};
const reset=K.reset.bind(K);K.reset=function(r){const out=reset(r);r.data.platingRevision=D.revision;r.data.platingMotion=[];r.data.dragServing=null;r.data.returnServing=null;return out;};
const direction=K.direction.bind(K);K.direction=function(r,key){if(K.step(r).kind!=='plate')return direction(r,key);W.ensure(r);if(['a','arrowleft','w','arrowup'].includes(key)){W.select(r,-1);return true;}if(['d','arrowright','s','arrowdown'].includes(key)){W.select(r,1);return true;}return false;};
const place=K.place.bind(K);K.place=function(r,index){return K.step(r).kind==='plate'?W.place(r,index):place(r,index);};
const point=K.point.bind(K);K.point=function(r){if(K.step(r).kind==='plate'){W.ensure(r);return W.target(r,r.data.selected)||{x:622,y:272};}if(K.step(r).kind==='scale'){const z=W.fishZones()[Math.max(0,r.data.zones.indexOf(false))];return{x:z.x+z.w/2,y:z.y+z.h/2};}if(K.step(r).kind==='cut')return{x:480+(-88+Math.min(4,Math.floor(r.data.progress*5))*44)*W.visualScale,y:265};return point(r);};
const stage=A.stage.bind(A);A.stage=function(c,s,p,...rect){return W.run?W.stage(c,s,p,...rect):stage(c,s,p,...rect);};
const draw=C.draw.bind(C);C.draw=function(c,r){W.ensure(r);if(K.step(r).kind==='plate')return W.drawServing(c,r);const before=W.run;W.run=r;try{return draw(c,r);}finally{W.run=before;}};
const pointer=C.pointer.bind(C);C.pointer=function(r,type,p){if(K.step(r).kind==='plate')return W.servingPointer(r,type,p);if(K.step(r).kind==='scale')return W.scrapePointer(r,type,p);return pointer(r,type,p);};
const update=C.update.bind(C);C.update=function(r,dt){const out=update(r,dt);W.ensure(r);for(const m of r.data.platingMotion)m.age+=dt;r.data.platingMotion=r.data.platingMotion.filter(m=>m.age<.4);if(r.data.returnServing){r.data.returnServing.age+=dt;if(r.data.returnServing.age>.24)r.data.returnServing=null;}return out;};
const controls=C.controls.bind(C);C.controls=function(r,h){if(K.step(r).kind!=='plate'){const out=controls(r,h),kind=K.step(r).kind;if(kind==='bake'||kind==='steam')for(const button of h.querySelectorAll('button'))button.textContent=button.textContent.replace('Fogo',kind==='bake'?'Calor':'Vapor');return out;}W.ensure(r);if(r.data.phase==='done')return controls(r,h);const right=V.DuoChallenges.isChild&&+new URLSearchParams(location.search).get('player')===1,part=W.selected(r);h.append(P.button('cook-select-prev',right?'← Escolher':'A · Escolher',()=>P.action('dir','a')),P.button('cook-place',(right?'Enter':'E')+' · Servir '+D.foods[part.food].label,()=>P.action('place')),P.button('cook-select-next',right?'Escolher →':'Escolher · D',()=>P.action('dir','d')));if(r.data.placed.length)h.append(P.button('cook-undo','Recolher última porção',()=>P.action('plate-undo')));};
const action=C.action.bind(C);C.action=function(r,name,arg){if(name==='plate-undo'&&K.step(r).kind==='plate'&&r.data.phase==='work'&&r.data.placed.length){const index=r.data.placed.pop();r.data.selected=index;r.data.progress=r.data.placed.length/W.plan(r).parts.length;r.data.platingMotion=[];P.controls();P.save();return;}return action(r,name,arg);};
const model=C.model.bind(C);C.model=function(r){const m=model(r);if(K.step(r).kind!=='plate')return m;W.ensure(r);const right=V.DuoChallenges.isChild&&+new URLSearchParams(location.search).get('player')===1;return{...m,progress:r.data.step+(r.data.phase==='done'?1:0),support:m.support+' · '+r.data.placed.length+'/'+W.plan(r).parts.length+' porções',hint:'Arraste uma porção preparada até o contorno dourado do prato. '+(right?'←/→ escolhe; Enter serve.':'A/D escolhe; E serve.')};};
const result=P.result.bind(P);P.result=function(r){const out=result(r);if(r.game===V.CookingData.id){const box=V.$('.pg-result');if(box){box.querySelector(':scope > .cooking-dish-art, :scope > .nature-art')?.remove();const canvas=document.createElement('canvas');canvas.width=400;canvas.height=220;canvas.className='cooking-finished-plate';canvas.setAttribute('aria-label',K.recipe(r).name+' montado com os ingredientes preparados');box.prepend(canvas);W.plate(canvas.getContext('2d'),r,200,113,.8,true);}}return out;};
})();

});
