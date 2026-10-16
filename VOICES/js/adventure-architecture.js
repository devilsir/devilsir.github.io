(function(){
'use strict';
const V=window.V,C=V.Cozy,D=V.SceneDesign,T=48,copy=x=>JSON.parse(JSON.stringify(x));
const A=V.Architecture={revision:1,
design(d){return d.adventure||=( {version:3,architecture:{walls:[],mounts:[],signs:[]},lights:[],regions:[],encounters:[],triggers:[]} );},
geometry(d){const a=this.design(d);return a.architecture||=( {walls:[],mounts:[],signs:[]} );},
segments(w){
const dx=w.b[0]-w.a[0],dy=w.b[1]-w.a[1],length=Math.hypot(dx,dy),out=[];
const cuts=(w.openings||[]).map(o=>[Math.max(0,o.u-o.width/2/length),Math.min(1,o.u+o.width/2/length)]).sort((a,b)=>a[0]-b[0]);
let start=0;const add=(s,e)=>{if(e>s)out.push({a:[w.a[0]+dx*s,w.a[1]+dy*s],b:[w.a[0]+dx*e,w.a[1]+dy*e],wall:w});};
for(const [s,e]of cuts){add(start,s);start=Math.max(start,e);}add(start,1);return out;
},
mountPosition(d,mount){const wall=this.geometry(d).walls.find(w=>w.id===mount.wall);if(!wall)return null;return{x:wall.a[0]+(wall.b[0]-wall.a[0])*mount.u,y:wall.a[1]+(wall.b[1]-wall.a[1])*mount.u,wall};},
validMount(d,mount){
const p=this.mountPosition(d,mount);if(!p)return false;const w=p.wall,len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),half=(mount.width||90)/2/len,elevation=mount.elevation||134;
return elevation>=(mount.height||96)+30&&elevation<=(w.height||148)-8&&mount.u>=half+.01&&mount.u<=1-half-.01&&!(w.openings||[]).some(o=>Math.abs(o.u-mount.u)<half+o.width/2/len+.02)&&!this.geometry(d).mounts.some(o=>o.id!==mount.id&&o.wall===mount.wall&&Math.abs(o.u-mount.u)*len<((o.width||94)+(mount.width||94))/2+10);
},
nearestWall(d,x,y){let best=null;for(const w of this.geometry(d).walls){const p=V.Rooms.distSeg({x,y},w.a,w.b);if(!best||p.distance<best.distance)best={...p,wall:w};}return best;},
hydrate(m){
const a=this.geometry(m.design);
m.archWalls=a.walls.flatMap(w=>this.segments(w));
m.archSolids=[];
for(const s of m.archWalls){const thick=s.wall.thickness||12,dx=s.b[0]-s.a[0],dy=s.b[1]-s.a[1],n=Math.ceil(Math.hypot(dx,dy)/12);for(let i=0;i<n;i++)m.archSolids.push({x:s.a[0]+dx*i/n-thick/2,y:s.a[1]+dy*i/n-thick/2,w:Math.max(thick,Math.abs(dx/n)+thick),h:Math.max(thick,Math.abs(dy/n)+thick),owner:s.wall.id});}
m.mounts=a.mounts.filter(o=>this.validMount(m.design,o));
for(const mount of m.mounts){const p=this.mountPosition(m.design,mount),scene=m.objects.find(o=>o.scene?.id===mount.scene);const approach=this.approach(m.design,mount);
if(scene){scene.mounted=mount;scene.x=approach.x;scene.y=approach.y;scene.interactionRange=82;scene.hiddenVisual=true;scene.scene.prop=mount.portrait;scene.scene.title=mount.caption;scene.label='Ler retrato: '+mount.caption;}
else if(!m.objects.some(o=>o.id==='mounted-'+mount.id))m.objects.push({id:'mounted-'+mount.id,type:'mounted-art',mounted:mount,x:approach.x,y:approach.y,label:'Ler retrato: '+mount.caption,interactionRange:82});
}
m.geometryRevision=++this.revision;
},
approach(d,mount){const p=this.mountPosition(d,mount),w=p.wall,dx=w.b[0]-w.a[0],dy=w.b[1]-w.a[1];return Math.abs(dx)>=Math.abs(dy)?{x:p.x,y:p.y+42}:{x:p.x+(mount.orientation==='west'?-45:45),y:p.y+28};},
blocked(m,x,y,r=11){return(m.archWalls||[]).some(s=>V.Rooms.distSeg({x,y},s.a,s.b).distance<r+(s.wall.thickness||12)/2);},
drawWall(ctx,m,w,cam){
const vertical=Math.abs(w.b[1]-w.a[1])>Math.abs(w.b[0]-w.a[0]),height=w.height||146,th=w.thickness||12,p=V.Player.data;
const obstruct=p&&p.y<Math.max(w.a[1],w.b[1])&&p.y>Math.min(w.a[1],w.b[1])-height-45&&p.x>Math.min(w.a[0],w.b[0])-50&&p.x<Math.max(w.a[0],w.b[0])+50;
ctx.save();ctx.globalAlpha=obstruct&&!V.SceneEditor?.active?.65:1;
for(const s of this.segments(w)){
const x1=s.a[0]-cam.x,y1=s.a[1]-cam.y,x2=s.b[0]-cam.x,y2=s.b[1]-cam.y;
ctx.fillStyle='#1b243229';ctx.beginPath();ctx.moveTo(x1+10,y1+12);ctx.lineTo(x2+10,y2+12);ctx.lineTo(x2+18,y2+32);ctx.lineTo(x1+18,y1+32);ctx.closePath();ctx.fill();
ctx.fillStyle=w.color||'#8c8178';
if(!vertical){ctx.fillRect(Math.min(x1,x2)-th/2,y1-height,Math.abs(x2-x1)+th,height);ctx.fillStyle='#dad0b7';ctx.fillRect(Math.min(x1,x2)-th/2,y1-height,Math.abs(x2-x1)+th,th);ctx.fillStyle='#b0a08b';ctx.fillRect(Math.min(x1,x2),y1-height+th,Math.abs(x2-x1),7);ctx.fillStyle='#504c50';ctx.fillRect(Math.min(x1,x2),y1-10,Math.abs(x2-x1),10);
for(let y=y1-height+30;y<y1-16;y+=24){ctx.fillStyle='#e6dfc00b';ctx.fillRect(Math.min(x1,x2),y,Math.abs(x2-x1),1);}
}else{ctx.beginPath();ctx.moveTo(x1-th/2,y1-height);ctx.lineTo(x2-th/2,y2-height);ctx.lineTo(x2+th/2,y2);ctx.lineTo(x1+th/2,y1);ctx.closePath();ctx.fill();ctx.strokeStyle='#d4c5a2';ctx.lineWidth=th;ctx.beginPath();ctx.moveTo(x1,y1-height);ctx.lineTo(x2,y2-height);ctx.stroke();ctx.strokeStyle='#544f55';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x1+th/2,y1);ctx.lineTo(x2+th/2,y2);ctx.stroke();}
}
for(const o of w.openings||[]){const x=w.a[0]+(w.b[0]-w.a[0])*o.u-cam.x,y=w.a[1]+(w.b[1]-w.a[1])*o.u-cam.y;ctx.fillStyle='#d5c4a3';if(!vertical){ctx.fillRect(x-o.width/2-7,y-height,7,height);ctx.fillRect(x+o.width/2,y-height,7,height);ctx.fillRect(x-o.width/2-7,y-height,o.width+14,12);}else{ctx.fillRect(x-9,y-o.width/2-height,18,12);ctx.fillRect(x-9,y+o.width/2-height,18,12);}}
ctx.restore();
for(const mount of m.mounts.filter(o=>o.wall===w.id))this.drawMount(ctx,m,mount,cam);
},
drawMount(ctx,m,mount,cam){
const p=this.mountPosition(m.design,mount);if(!p)return;
const img=V.Assets.images['campus-portrait-'+mount.portrait],horizontal=Math.abs(p.wall.b[0]-p.wall.a[0])>=Math.abs(p.wall.b[1]-p.wall.a[1]);
const width=mount.width||92,height=mount.height||98,x=p.x-cam.x-width/2+(horizontal?0:mount.orientation==='west'?-30:30),y=p.y-cam.y-(mount.elevation||130);
if(x<-150||y<-160||x>ctx.canvas.width+150||y>ctx.canvas.height+100)return;
ctx.save();ctx.fillStyle='#302638';ctx.fillRect(x-5,y-5,width+10,height+10);ctx.fillStyle='#b29353';ctx.fillRect(x-3,y-3,width+6,height+6);ctx.fillStyle='#ead8aa';ctx.fillRect(x+2,y+2,width-4,height-4);if(img)ctx.drawImage(img,x+7,y+6,width-14,height-13);ctx.strokeStyle='#66533c';ctx.lineWidth=3;ctx.strokeRect(x+4,y+3,width-8,height-7);
const plaqueWidth=Math.max(width,136);ctx.fillStyle='#dfd3b9';ctx.fillRect(p.x-cam.x-plaqueWidth/2,y+height+12,plaqueWidth,24);ctx.fillStyle='#493d37';ctx.font='600 10px "VOICES Sans",sans-serif';ctx.textAlign='center';let text=mount.caption;while(ctx.measureText(text).width>plaqueWidth-10&&text.length>5)text=text.slice(0,-2)+'…';ctx.fillText(text,p.x-cam.x,y+height+28);ctx.textAlign='left';
if(V.World.nearest?.mounted?.id===mount.id){ctx.strokeStyle='#6ee4ac';ctx.lineWidth=3;ctx.strokeRect(x-7,y-7,width+14,height+14);}
ctx.restore();
},
drawSigns(ctx,m,cam){for(const sign of this.geometry(m.design).signs||[]){const x=sign.x-cam.x,y=sign.y-cam.y;ctx.fillStyle='#293b3d';ctx.fillRect(x-112,y-18,224,30);ctx.strokeStyle='#c8ab70';ctx.strokeRect(x-112,y-18,224,30);V.Engine.text(ctx,sign.text,x,y+2,'#f2e0b9',12,'center');}},
rebuildMuseum(d){
const a=this.design(d),g=a.architecture={walls:[],mounts:[],signs:[]};
const add=(id,x1,y1,x2,y2,openings=[])=>g.walls.push({id,a:[x1*T,y1*T],b:[x2*T,y2*T],height:148,thickness:14,color:'#938a79',openings});
add('museum-north',1.5,4,42.5,4);add('museum-west',1.5,4,1.5,34.5);add('museum-east',42.5,4,42.5,34.5);add('museum-south',1.5,34.5,42.5,34.5,[{u:.5,width:160}]);
const galleries=[{id:'words',x:2,y:6,label:'01 · TRAJETÓRIAS E PALAVRAS',color:'#bbb19a'},{id:'arts',x:24,y:6,label:'02 · ARTE, MÚSICA E CIÊNCIA',color:'#9fab9f'},{id:'rights',x:2,y:23,label:'03 · DIREITOS E PARTICIPAÇÃO',color:'#aaa887'},{id:'creation',x:24,y:23,label:'04 · CRIAÇÃO, IDEIAS E ESPORTE',color:'#b6a08c'}];
galleries.forEach((q,gi)=>{
add(q.id+'-north',q.x,q.y,q.x+18,q.y);add(q.id+'-partition',q.x,q.y+6,q.x+16,q.y+6);add(q.id+'-south',q.x,q.y+10,q.x+18,q.y+10,[{u:gi%2?.2:.8,width:112}]);
if(gi%2===0)add(q.id+'-side',q.x+18,q.y,q.x+18,q.y+10,[{u:.8,width:112}]);else add(q.id+'-side',q.x,q.y,q.x,q.y+10,[{u:.8,width:112}]);
g.signs.push({x:(q.x+9)*T,y:(q.y+11.5)*T,text:q.label});
for(let i=0;i<8;i++){
const p=V.campusContent.portraits[gi*8+i],wall=i<4?q.id+'-north':q.id+'-partition',length=i<4?18:16;
g.mounts.push({id:'museum-frame-'+(gi*8+i),scene:'campus-museum-'+(gi*8+i)+'-read',wall,u:(2+(i%4)*4)/length,elevation:134,orientation:'south',width:94,height:96,portrait:p.index,caption:p.name});
}
});
d.decor=d.decor.filter(row=>row[0]!=='portrait-display');
for(const s of d.scenes.filter(s=>s.family==='portrait-display'))s.size=1;
for(const row of d.decor){if(row[2]>2&&row[2]<20&&row[3]>6&&row[3]<12)row[3]=14;else if(row[2]>24&&row[3]>6&&row[3]<12)row[3]=14;else if(row[3]>23&&row[3]<29)row[3]=31;}
for(const s of d.scenes.filter(s=>s.family!=='portrait-display')){
const row=d.decor.find(row=>row[6]?.id===s.hostDecor);if(row){s.x=row[2]+row[4]/2-.5;s.y=row[3]+row[4]*.9;s.size=Math.min(3,row[4]);}
}
d.positions['museum-exit-plaza']=[21.5,33.4];d.positions['museum-exit-district']=[23,33.4];
d.anchors=d.anchors.filter(row=>!row[0].includes('literature')&&!row[0].includes('art'));
d.anchors.push(['museum-art',32,15,'observing',18,3],['museum-literature',10,15,'observing',18,3]);
d.adventureMuseumVersion=3;
},
prepare(){
for(const[id,d]of Object.entries(C.layouts)){
if(id==='beach'){d.width??=32;d.height??=24;}
const a=this.design(d),indoor=d.builderMap||id==='museum'||id==='school'||id==='library'||id.startsWith('room-');
a.environment||={indoor,sky:indoor?'windows':'automatic',climate:id==='beach'?'coastal':'temperate-warm',clouds:.25,wind:.2,weather:!indoor,ambient:indoor?'#ccbba0':'#e3e5c7',snowAllowed:false};
a.lights||=[];a.regions||=[];a.encounters||=[];a.triggers||=[];
if(id==='museum'&&!d.adventureMuseumVersion)this.rebuildMuseum(d);
if(!a.lights.length){
if(id==='museum')for(const mount of a.architecture.mounts){const p=this.mountPosition(d,mount);a.lights.push({id:'spot-'+mount.id,type:'spotlight',x:p.x,y:p.y+28,elevation:135,radius:140,color:'#ffe5ac',intensity:.7,softness:.7,enabled:true,schedule:'always',mount:mount.id});}
else for(let i=0;i<3;i++)a.lights.push({id:'lamp-'+id+'-'+i,type:indoor?i?'ceiling':'desk':'street',x:(.22+i*.28)*d.width*T,y:(indoor?.56:.64)*d.height*T,elevation:indoor?65:95,radius:indoor?190:225,color:indoor?'#ffe8b9':'#f7d49d',intensity:.8,softness:.8,enabled:true,schedule:indoor?'always':'night'});
}
if(id==='museum')a.regions=[{id:'museum-covered',name:'Galerias cobertas',x:48,y:100,w:42*T,h:33*T,priority:1,indoor:true,weather:false,sky:'windows',ambient:'#e3d3b6'},...(a.regions||[]).filter(r=>r.id!=='museum-covered')];
D.defaults[id]=copy(d);
}
},
normalise(input,d){
if(!input)return;const a=copy(input);if(JSON.stringify(a).length>650000)throw Error('A expansão deste cenário excede o limite.');
for(const key of ['lights','regions','encounters','triggers'])if(!Array.isArray(a[key]||[])||(a[key]||[]).length>250)throw Error('Dados de ambiente inválidos.');
const bounds=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=24&&p[1]>=48&&p[0]<=d.width*T-24&&p[1]<=d.height*T-24;
a.architecture||={walls:[],mounts:[],signs:[]};
if(a.architecture.walls.length>180||a.architecture.mounts.length>160)throw Error('Há paredes ou quadros demais.');
const wallIds=new Set();for(const w of a.architecture.walls){if(!bounds(w.a)||!bounds(w.b)||Math.hypot(w.a[0]-w.b[0],w.a[1]-w.b[1])<24||wallIds.has(w.id))throw Error('Parede inválida.');wallIds.add(w.id);w.height=V.clamp(Number(w.height)||148,30,220);w.thickness=V.clamp(Number(w.thickness)||12,6,32);for(const o of w.openings||[])if(!Number.isFinite(o.u)||o.u<0||o.u>1||!Number.isFinite(o.width)||o.width<35)throw Error('Abertura de parede inválida.');}
for(const l of a.lights){if(!Number.isFinite(l.x)||!Number.isFinite(l.y)||!/^#[0-9a-f]{6}$/i.test(l.color)||l.radius<20||l.radius>800||l.intensity<0||l.intensity>2)throw Error('Iluminação inválida.');}
for(const r of a.regions){if(![r.x,r.y,r.w,r.h].every(Number.isFinite)||r.w<10||r.h<10)throw Error('Região de ambiente inválida.');}
d.adventure=a;for(const mount of a.architecture.mounts)if(!this.validMount(d,mount))throw Error('Quadro sem apoio ou sobre uma abertura.');
}
};
A.prepare();
})();
