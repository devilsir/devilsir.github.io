(function(){
'use strict';
const V=window.V,T=48,esc=V.escape;
const N=V.ObjectiveGuide={path:[],timer:0,grids:new Map(),reason:'',target:null,
invalidate(){this.grids.clear();this.signature='';this.timer=0;V.WorldAtlas?.invalidate();},
edges(id,locked=false){
const m=V.World.maps[id];if(!m)return[];const out=[];
for(const o of m.objects){
let to=null,allowed=true,reason='';
if(o.type==='room-door'){to=o.door.to?.map;allowed=V.Rooms.allowed(o.door)&&!!to;reason='Porta trancada ou condição narrativa pendente.';}
else if(o.type==='portal'){to='chapter-'+o.chapter;allowed=!!V.state?.flags.prologueDone&&V.Quests.isUnlocked(o.chapter);reason='Conclua a investigação anterior e a primeira vigília.';}
else if(['door','travel','exit'].includes(o.type))to=o.to||'hub';
if(!to||!V.World.maps[to])continue;
const cfg=m.design.life?.connections?.[o.id];if(cfg?.disabled)continue;if(cfg?.locked){allowed=false;reason='A conexão está trancada.';}
if(cfg?.conditions?.chapter&&!V.state.completed.includes(cfg.conditions.chapter)){allowed=false;reason='O acesso depende de um capítulo anterior.';}
if(cfg?.conditions?.flag&&!V.state.flags[cfg.conditions.flag]){allowed=false;reason='Esta entrada aguarda uma condição da história.';}
if(allowed||locked)out.push({from:id,to,object:o,allowed,reason});
}
return out;
},
mapRoute(from,to,includeLocked=false){
const queue=[{id:from,path:[]}],seen=new Set([from]);for(let i=0;i<queue.length;i++){const n=queue[i];if(n.id===to)return n.path;for(const e of this.edges(n.id,includeLocked)){if(!seen.has(e.to)){seen.add(e.to);queue.push({id:e.to,path:n.path.concat(e)});}}}return null;
},
find(id,map){const maps=map?[V.World.maps[map]]:Object.values(V.World.maps);for(const m of maps){const o=m?.objects.find(o=>o.id===id);if(o)return{map:m.id,object:o};}return null;},
main(chapter=null){
const a=V.Progress.ensure();if(!a)return null;
const opening=V.Story?.objective();if(opening)return opening;
const id=chapter||a.tracked?.chapter||V.content.chapters.find(c=>!V.state.completed.includes(c.id)&&V.Quests.isUnlocked(c.id))?.id||6,c=V.content.chapters[id-1];
if(!c)return null;
let found;
for(const clue of c.clues)if(!V.state.evidence.includes(clue.id)){found=this.find(clue.id);if(found)return{...found,key:'clue-'+clue.id,label:'Investigar: '+clue.title,chapter:id};}
for(let i=0;i<c.npcs.length;i++){const key='npc-'+id+'-'+i;if(!V.state.talked.includes(key)){found=this.find(key);if(found)return{...found,key:'talk-'+key,label:'Conversar com '+c.npcs[i].name,chapter:id};}}
const traces=a.story.traces[id]||[];
for(let i=0;i<3;i++)if(!traces.includes(i)){found=this.find('rasura-'+id+'-'+i);if(found)return{...found,key:'trace-'+id+'-'+i,label:'Comparar fontes: '+V.AdventureData.cases[id-1].traces[i][0],chapter:id};}
if(!a.story.interpreted.includes(id)){found=this.find('rasura-'+id+'-0');if(found)return{...found,key:'interpret-'+id,label:'Relacionar as evidências no Historiógrafo',chapter:id,openDevice:true};}
if(!V.state.minis.includes(id)){found=this.find('station-'+id);if(found)return{...found,key:'station-'+id,label:'Restaurar o sistema com a equipe',chapter:id};}
if(!V.state.completed.includes(id)){found=this.find('boss-'+id);if(found)return{...found,key:'boss-'+id,label:'Resolver: '+c.boss.name,chapter:id};}
const next=V.content.chapters.find(c=>!V.state.completed.includes(c.id)&&V.Quests.isUnlocked(c.id));
if(next&&next.id!==id)return this.main(next.id);
return{map:'museum',object:V.World.maps.museum.objects.find(o=>o.id==='archive-epilogue'),key:'epilogue',label:'Revisitar o arquivo e conversar sobre o futuro'};
},
objective(){const a=V.Progress.ensure();if(a?.tracked?.destination){const map=V.World.maps[a.tracked.destination];if(map){if(map===V.World.current){a.tracked=null;return this.main();}const object=map.objects.find(o=>['exit','travel','door','portal'].includes(o.type))||{id:'destination',x:map.width*24,y:map.height*24};return{map:map.id,object,key:'destination-'+map.id,label:'Seguir até '+map.name.split(' · ')[0]};}}if(a?.tracked?.object){const found=this.find(a.tracked.object,a.tracked.map);if(found)return{...found,key:'custom-'+a.tracked.object,label:a.tracked.label||found.object.label};}return this.main();},
track(chapter=null,object=null,map=null){const a=V.Progress.ensure();if(!a)return;a.tracked=object?{object,map}:chapter?{chapter}:null;this.signature='';this.timer=0;V.Save.save();V.UI.toast('Objetivo rastreado. O caminho segue passagens acessíveis.');},
clear(m,x,y,r=12){return!V.Living.blocked(m,x,y,r);},
line(m,a,b,people=[]){const steps=Math.max(1,Math.ceil(V.dist(a,b)/7));for(let i=0;i<=steps;i++){const x=a.x+(b.x-a.x)*i/steps,y=a.y+(b.y-a.y)*i/steps;if(!this.clear(m,x,y)||people.some(o=>Math.hypot(x-o.x,y-o.y)<24))return false;}return true;},
grid(m){const key=m.id+':'+(m.geometryRevision||0)+':'+(V.SceneDesign.revision||0),old=this.grids.get(key);if(old)return old;const step=24,width=Math.ceil(m.width*T/step),height=Math.ceil(m.height*T/step),cells=new Uint8Array(width*height);for(let y=0;y<height;y++)for(let x=0;x<width;x++)cells[y*width+x]=this.clear(m,x*step+12,y*step+12)?1:0;const g={step,width,height,cells};this.grids.set(key,g);return g;},
interactionClear(m,p,o){
const endpoint=o.type==='room-door'?{x:o.x+o.door.normal.x*18,y:o.y+o.door.normal.y*18}:o;const steps=Math.max(1,Math.ceil(V.dist(p,endpoint)/8));for(let i=1;i<=steps;i++){const x=p.x+(endpoint.x-p.x)*i/steps,y=p.y+(endpoint.y-p.y)*i/steps;if(V.Architecture.blocked(m,x,y,1)||V.Rooms.blocked(m,x,y,1,o.type==='room-door'?o.door:null))return false;
if(m.solids.some(s=>s.owner!=='host-'+o.id&&s.owner!==o.scene?.hostDecor&&x>s.x&&x<s.x+s.w&&y>s.y&&y<s.y+s.h))return false;}
return true;
},
calculate(m,start,target,dynamic=true){
if(!target)return[];
const g=this.grid(m),{step,width,height}=g,people=dynamic?m.objects.filter(o=>V.Cozy.person(o)&&o!==target):[],cells=g.cells.slice();
for(const o of people){const cx=Math.floor(o.x/step),cy=Math.floor(o.y/step);for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++)if(x>=0&&y>=0&&x<width&&y<height&&Math.hypot(x*step+12-o.x,y*step+12-o.y)<26)cells[y*width+x]=0;}
const candidates=[];let origin=-1,nearest=Infinity;
for(let y=Math.max(0,Math.floor(start.y/step)-2);y<=Math.min(height-1,Math.floor(start.y/step)+2);y++)for(let x=Math.max(0,Math.floor(start.x/step)-2);x<=Math.min(width-1,Math.floor(start.x/step)+2);x++){const i=y*width+x,p={x:x*step+12,y:y*step+12},d=V.dist(p,start);if(cells[i]&&d<nearest&&this.line(m,start,p,people)){origin=i;nearest=d;}}
if(origin<0)return[];
const goal=new Set(),range=Math.min(60,(target.interactionRange||80)-14);
const tx=Math.floor(target.x/step),ty=Math.floor(target.y/step);
for(let y=Math.max(0,ty-4);y<=Math.min(height-1,ty+4);y++)for(let x=Math.max(0,tx-4);x<=Math.min(width-1,tx+4);x++){const i=y*width+x,p={x:x*step+12,y:y*step+12};if(cells[i]&&V.dist(p,target)<=range&&this.interactionClear(m,p,target))goal.add(i);}
if(!goal.size)return[];
const parent=new Int32Array(cells.length);parent.fill(-2);parent[origin]=-1;const queue=new Int32Array(cells.length);queue[0]=origin;let len=1,end=-1;
for(let cursor=0;cursor<len;cursor++){
const i=queue[cursor];if(goal.has(i)){end=i;break;}const x=i%width,y=Math.floor(i/width);
for(const [nx,ny]of [[x+1,y],[x,y+1],[x-1,y],[x,y-1]]){if(nx<0||ny<0||nx>=width||ny>=height)continue;const j=ny*width+nx;if(cells[j]&&parent[j]===-2&&this.line(m,{x:x*step+12,y:y*step+12},{x:nx*step+12,y:ny*step+12},people)){parent[j]=i;queue[len++]=j;}}
}
if(end<0)return[];const points=[];for(let i=end;i>=0;i=parent[i])points.push({x:(i%width)*step+12,y:Math.floor(i/width)*step+12});points.reverse();points.unshift({x:start.x,y:start.y});
const out=[points[0]];let i=0;while(i<points.length-1){let next=Math.min(points.length-1,i+12);while(next>i+1&&!this.line(m,points[i],points[next],people))next--;out.push(points[next]);i=next;}return out;
},
update(dt){
if(!V.state||!V.World.current||V.Game.mode!=='explore'||V.SceneEditor.active)return;
this.timer-=dt;if(this.timer>0)return;this.timer=1.2;
const a=V.Progress.ensure(),objective=this.objective(),m=V.World.current;
if(!objective?.object){this.path=[];this.reason='Investigue os registros disponíveis no diário.';return;}
let target=objective.object,label=objective.label;this.crossMap=null;
if(objective.map!==m.id){const route=this.mapRoute(m.id,objective.map);if(!route?.length){this.path=[];const locked=this.mapRoute(m.id,objective.map,true)?.find(e=>!e.allowed);this.reason=locked?.reason||'Não há uma conexão acessível. Confira as portas no atlas.';this.target=objective;return;}target=route[0].object;this.crossMap=route[0].to;label='Seguir para '+V.World.maps[this.crossMap].name.split(' · ')[0]+' · '+label;}
const sig=[objective.key,m.id,m.geometryRevision,Math.floor(V.Player.data.x/24),Math.floor(V.Player.data.y/24),Math.floor(target.x/24),Math.floor(target.y/24)].join('|');
if(sig!==this.signature||a.routeEnabled){this.path=this.calculate(m,V.Player.data,target);this.signature=sig;}
this.reason=this.path.length?label:V.dist(V.Player.data,target)<(target.interactionRange||80)?'Objetivo próximo · pressione E para interagir.':'O caminho está ocupado. A rota tenta novamente; confira o atlas.';
this.target=objective;this.nextObject=target;
let el=V.$('#adv-route-info');if(!el){el=document.createElement('button');el.id='adv-route-info';el.className='adv-route-info';el.onclick=()=>this.panel();V.$('#stage').appendChild(el);}el.textContent=(a.routeEnabled?'◇ ':'')+this.reason;el.hidden=V.Game.mode!=='explore';
},
draw(ctx,cam){const a=V.Progress.ensure();if(!a?.routeEnabled||this.path.length<2)return;ctx.save();ctx.strokeStyle='#56d891';ctx.globalAlpha=a.routeOpacity;ctx.lineWidth=5;ctx.lineCap='round';ctx.setLineDash(a.routePattern?[12,12]:[5,12]);ctx.beginPath();this.path.forEach((p,i)=>i?ctx.lineTo(p.x-cam.x,p.y-cam.y):ctx.moveTo(p.x-cam.x,p.y-cam.y));ctx.stroke();ctx.setLineDash([]);for(let i=1;i<this.path.length;i++){const a=this.path[i-1],b=this.path[i],len=V.dist(a,b);for(let d=42;d<len;d+=86){const x=a.x+(b.x-a.x)*d/len-cam.x,y=a.y+(b.y-a.y)*d/len-cam.y,angle=Math.atan2(b.y-a.y,b.x-a.x);ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(-5,-5);ctx.lineTo(2,0);ctx.lineTo(-5,5);ctx.stroke();ctx.restore();}}ctx.restore();},
panel(){const a=V.Progress.ensure(),o=this.objective();V.UI.modal('Rastrear objetivo',o?.label||'Escolha uma missão',`<p>${esc(this.reason||'O guia calcula caminhos pelas entradas reais do mundo.')}</p><label class="toggle"><input id="guide-toggle" type="checkbox" ${a.routeEnabled?'checked':''}>Mostrar caminho no chão</label><label class="toggle"><input id="guide-pattern" type="checkbox" ${a.routePattern?'checked':''}>Traços e setas · alternativa à cor verde</label><label class="field">Visibilidade<input id="guide-opacity" type="range" min=".3" max="1" step=".1" value="${a.routeOpacity}"></label><div class="row"><button id="guide-default" class="secondary">Retomar missão principal</button><button id="guide-atlas" class="secondary">Ver no atlas</button>${o?.openDevice?'<button id="guide-device" class="primary">Comparar evidências</button>':''}</div>`,`<button id="guide-save" class="primary">Aplicar</button>`);V.$('#guide-save').onclick=()=>{a.routeEnabled=V.$('#guide-toggle').checked;a.routePattern=V.$('#guide-pattern').checked;a.routeOpacity=+V.$('#guide-opacity').value;V.Save.save();V.UI.close();};V.$('#guide-default').onclick=()=>{this.track();V.UI.close();};V.$('#guide-atlas').onclick=()=>V.WorldAtlas.open();V.$('#guide-device')?.addEventListener('click',()=>V.Story.case(o.chapter));}
};
const Atlas=V.WorldAtlas={zoom:.68,pan:{x:0,y:0},view:'world',selected:null,cache:new Map(),
invalidate(){this.cache.clear();},
positions(){const known={...V.AdventureData.atlas};let i=0;for(const id of Object.keys(V.World.maps))if(!known[id]){const parent=N.edges(id,true)[0]?.to,at=known[parent]||[700,500];known[id]=[at[0]+80+(i%3)*90,at[1]+80+Math.floor(i++/3)*90];}return known;},
open(view='world',selected=V.World.current?.id){
if(!V.state||V.Game.mode!=='explore'){V.Game.pause();return;}
this.view=view;this.selected=selected||'hub';
V.UI.modal('Atlas de New Harmony','GEOGRAFIA FICCIONAL · CAMINHOS E MEMÓRIAS',`<nav class="tabs">${[['world','Mundo'],['region','Região'],['local','Lugar']].map(([id,n])=>`<button data-atlas-view="${id}" class="${view===id?'active':''}">${n}</button>`).join('')}<button id="atlas-track" class="secondary">Rastrear objetivo</button></nav><div class="adv-atlas"><canvas id="adv-atlas-canvas" width="1100" height="650" aria-label="Atlas interativo. Arraste para mover, use a roda ou os botões para ampliar."></canvas><div class="adv-atlas-controls"><button id="atlas-minus" aria-label="Diminuir zoom">−</button><button id="atlas-fit">Enquadrar</button><button id="atlas-plus" aria-label="Ampliar zoom">+</button></div></div><div class="adv-atlas-detail" id="adv-atlas-detail"></div><p class="note">● Você está aqui · ◇ Missão rastreada · ✓ Região restaurada · Linha contínua: passagem acessível · Linha pontilhada: condição pendente. Clique num lugar para examinar suas conexões. Viagens rápidas são liberadas apenas após uma região ser restaurada.</p>`,'',true);
V.$$('[data-atlas-view]').forEach(b=>b.onclick=()=>this.open(b.dataset.atlasView,this.selected));V.$('#atlas-track').onclick=()=>N.panel();
V.$('#atlas-plus').onclick=()=>this.zoomAt(1.25);V.$('#atlas-minus').onclick=()=>this.zoomAt(.8);V.$('#atlas-fit').onclick=()=>this.fit();
const canvas=V.$('#adv-atlas-canvas');let drag=null;
canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,pan:{...this.pan},moved:false};};
canvas.onpointermove=e=>{if(!drag)return;const rect=canvas.getBoundingClientRect(),dx=(e.clientX-drag.x)*canvas.width/rect.width,dy=(e.clientY-drag.y)*canvas.height/rect.height;if(Math.hypot(dx,dy)>4)drag.moved=true;this.pan={x:drag.pan.x+dx,y:drag.pan.y+dy};this.draw();};
canvas.onpointerup=e=>{if(drag&&!drag.moved)this.hit(e);drag=null;};canvas.onpointercancel=()=>drag=null;
canvas.onwheel=e=>{e.preventDefault();this.zoomAt(e.deltaY<0?1.12:1/1.12);};this.fit();this.details();
},
fit(){
const c=V.$('#adv-atlas-canvas');if(!c)return;let bounds;
if(this.view==='local'){const m=V.World.maps[this.selected];bounds={left:0,top:0,right:m.width*T*.6,bottom:m.height*T*.6};}
else{const positions=this.positions(),ids=this.view==='region'?[this.selected,...N.edges(this.selected,true).map(e=>e.to)]:Object.keys(V.World.maps),points=ids.map(id=>positions[id]).filter(Boolean);bounds={left:Math.min(...points.map(p=>p[0]))-130,top:Math.min(...points.map(p=>p[1]))-90,right:Math.max(...points.map(p=>p[0]))+130,bottom:Math.max(...points.map(p=>p[1]))+90};}
this.zoom=V.clamp(Math.min((c.width-100)/(bounds.right-bounds.left),(c.height-130)/(bounds.bottom-bounds.top)),.2,1.5);this.pan={x:c.width/2-(bounds.left+bounds.right)/2*this.zoom,y:c.height/2+15-(bounds.top+bounds.bottom)/2*this.zoom};this.draw();
},
zoomAt(factor){const c=V.$('#adv-atlas-canvas');if(!c)return;const x=(c.width/2-this.pan.x)/this.zoom,y=(c.height/2-this.pan.y)/this.zoom;this.zoom=V.clamp(this.zoom*factor,.2,2.5);this.pan={x:c.width/2-x*this.zoom,y:c.height/2-y*this.zoom};this.draw();},
draw(){
const c=V.$('#adv-atlas-canvas');if(!c)return;const ctx=c.getContext('2d'),a=V.Progress.ensure(),positions=this.positions();ctx.imageSmoothingEnabled=false;
const paper=V.Assets.images['atlas-paper'];if(paper)ctx.drawImage(paper,0,0,c.width,c.height);else{ctx.fillStyle='#d9c69e';ctx.fillRect(0,0,c.width,c.height);}
ctx.save();ctx.translate(this.pan.x,this.pan.y);ctx.scale(this.zoom,this.zoom);
if(this.view==='local'){
const m=V.World.maps[this.selected];V.Atlas.paintCanvasLocal?.(ctx,m);
const snap=V.Atlas.snapshot(m);ctx.drawImage(snap,0,0,m.width*T*.6,m.height*T*.6);
ctx.strokeStyle='#473d2e';ctx.lineWidth=3;for(const wall of m.archWalls||[]){ctx.beginPath();ctx.moveTo(wall.a[0]*.6,wall.a[1]*.6);ctx.lineTo(wall.b[0]*.6,wall.b[1]*.6);ctx.stroke();}
for(const o of m.objects.filter(o=>['door','travel','exit','portal','room-door','rasura','boss'].includes(o.type))){ctx.fillStyle=o.type==='rasura'?'#335e49':'#8a3b45';ctx.beginPath();ctx.arc(o.x*.6,o.y*.6,5,0,Math.PI*2);ctx.fill();V.Engine.text(ctx,o.label.slice(0,35),o.x*.6+9,o.y*.6,'#f2e4c4',13);}
if(m===V.World.current){const p=V.Player.data;ctx.fillStyle='#fff3a7';ctx.beginPath();ctx.arc(p.x*.6,p.y*.6,8,0,Math.PI*2);ctx.fill();}
if(N.target?.map===m.id){ctx.strokeStyle='#70e5a0';ctx.lineWidth=4;ctx.beginPath();ctx.arc(N.target.object.x*.6,N.target.object.y*.6,16,0,Math.PI*2);ctx.stroke();}
}else{
const visible=this.view==='region'?new Set([this.selected,...N.edges(this.selected,true).map(e=>e.to)]):new Set(Object.keys(V.World.maps));
const edges=[],seen=new Set();for(const id of visible)for(const e of N.edges(id,true)){if(!visible.has(e.to))continue;const key=[id,e.to].sort().join('|');if(seen.has(key))continue;seen.add(key);edges.push(e);}
for(const[id,p]of Object.entries(positions)){if(!visible.has(id))continue;const m=V.World.maps[id],inside=m.theme==='room',w=inside?68:110,h=inside?46:74;ctx.fillStyle=inside?'#c6b28b':m.id==='beach'?'#c1bb8b':m.id==='park'||m.id==='garden'?'#98a878':'#b6aa80';ctx.beginPath();ctx.moveTo(p[0]-w,p[1]-h*.4);ctx.lineTo(p[0]-w*.4,p[1]-h);ctx.lineTo(p[0]+w*.7,p[1]-h*.7);ctx.lineTo(p[0]+w,p[1]+h*.4);ctx.lineTo(p[0]+w*.4,p[1]+h);ctx.lineTo(p[0]-w*.7,p[1]+h*.7);ctx.closePath();ctx.fill();ctx.strokeStyle='#8a785155';ctx.lineWidth=2;ctx.stroke();
for(let i=0;i<(inside?2:4);i++){const x=p[0]-w+20+i*29,y=p[1]-h+12;ctx.strokeStyle='#7d7756';ctx.beginPath();ctx.moveTo(x,y+14);ctx.lineTo(x+9,y);ctx.lineTo(x+18,y+14);ctx.stroke();}
}
for(const e of edges){const p=positions[e.from],q=positions[e.to];if(!p||!q)continue;ctx.strokeStyle=e.allowed?'#74603e':'#8d7d6577';ctx.lineWidth=e.allowed?3:2;ctx.setLineDash(e.allowed?[]:[7,9]);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}ctx.setLineDash([]);
for(const id of visible){const p=positions[id],m=V.World.maps[id];if(!p||!m)continue;const discovered=a.story.visited.includes(id)||V.state.cozy?.visited?.includes(id)||id===V.World.current.id,done=m.chapter&&V.state.completed.includes(m.chapter);ctx.fillStyle=id===V.World.current.id?'#3b6658':done?'#5c7354':discovered?'#735c43':'#a29273';ctx.beginPath();ctx.arc(p[0],p[1],id===this.selected?13:9,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f4e0ae';ctx.lineWidth=3;ctx.stroke();
const labelHeight=Math.max(27,20/this.zoom),labelFont=Math.max(15,12/this.zoom);let label=m.name.split(' · ')[0];ctx.font=labelFont+'px \"VOICES Sans\",sans-serif';while(ctx.measureText(label).width>212&&label.length>5)label=label.slice(0,-2)+'…';ctx.fillStyle='#ead8af';ctx.fillRect(p[0]-112,p[1]+18,224,labelHeight);V.Engine.text(ctx,label,p[0],p[1]+18+labelHeight*.7,'#473a2c',labelFont,'center');if(done)V.Engine.text(ctx,'✓',p[0],p[1]+6,'#f4edc6',15,'center');
if(N.target?.map===id){ctx.strokeStyle='#2b7f54';ctx.lineWidth=3;ctx.strokeRect(p[0]-21,p[1]-21,42,42);V.Engine.text(ctx,'◇ OBJETIVO',p[0],p[1]-29,'#215b3e',15,'center');}}
}
ctx.restore();ctx.strokeStyle='#6d5737';ctx.lineWidth=7;ctx.strokeRect(10,10,c.width-20,c.height-20);V.Engine.text(ctx,'NEW HARMONY · ATLAS VIVO',28,38,'#5e4a30',16);
},
hit(e){if(this.view==='local')return;const c=V.$('#adv-atlas-canvas'),r=c.getBoundingClientRect(),x=((e.clientX-r.left)*c.width/r.width-this.pan.x)/this.zoom,y=((e.clientY-r.top)*c.height/r.height-this.pan.y)/this.zoom,visible=this.view==='region'?new Set([this.selected,...N.edges(this.selected,true).map(e=>e.to)]):new Set(Object.keys(V.World.maps));let best=null,d=95;for(const[id,p]of Object.entries(this.positions())){if(!visible.has(id))continue;const dist=Math.hypot(p[0]-x,p[1]-y);if(dist<d){best=id;d=dist;}}if(best){this.selected=best;this.details();this.draw();}},
details(){const m=V.World.maps[this.selected],root=V.$('#adv-atlas-detail');if(!m||!root)return;const edges=N.edges(m.id,true),fast=V.state.completed.includes(m.chapter)&&N.mapRoute(V.World.current.id,m.id);root.innerHTML=`<div><h3>${esc(m.name)}</h3><p>${esc(m.design.purpose||'Um lugar da cidade ficcional de New Harmony.')}</p><small>Conexões: ${edges.map(e=>esc(V.World.maps[e.to].name.split(' · ')[0])+(e.allowed?'':' · acesso pendente')).join(' / ')||'Nenhuma passagem configurada'}</small></div><div class="row"><button id="atlas-examine" class="secondary">Mapa local</button><button id="atlas-follow" class="primary">Rastrear caminho até aqui</button>${fast?'<button id="atlas-fast" class="secondary">Viagem rápida desbloqueada</button>':''}</div>`;V.$('#atlas-examine').onclick=()=>this.open('local',m.id);V.$('#atlas-follow').onclick=()=>{const route=N.mapRoute(V.World.current.id,m.id);if(m.id===V.World.current.id)N.track();else if(route?.length){V.Progress.ensure().tracked={destination:m.id};N.signature='';N.timer=0;V.Save.save();}else V.UI.toast('O acesso ainda depende das condições indicadas.');V.UI.close();};V.$('#atlas-fast')?.addEventListener('click',()=>{if(N.mapRoute(V.World.current.id,m.id)&&V.state.completed.includes(m.chapter)){V.UI.close();V.World.load(m.id);}});}
};
})();
