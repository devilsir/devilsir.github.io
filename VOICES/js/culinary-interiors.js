/* Registered module: culinary-interiors */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("culinary-interiors", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,U=V.CulinaryWorld,C=V.Cozy,W=V.World,S=V.SceneDesign,Arch=V.Architecture,T=48,copy=x=>JSON.parse(JSON.stringify(x));
const I=V.CulinaryInteriors={ids:['kitchen','university'],images:{},
 load(){if(this.ready)return this.ready;this.ready=Promise.all(['kitchen-interiors','campus-interiors'].map(key=>new Promise(resolve=>{const image=V.Assets.image();this.images[key]=image;image.onload=image.onerror=resolve;image.src='assets/cooking/'+key+'.webp?v=20261102-rooms1';V.AssetLoader.register(image,resolve);})));return this.ready;},
 art(c,sheet,index,x,y,w,h=w){const im=this.images[sheet];if(!im?.naturalWidth)return false;const cell=im.naturalWidth/4;c.save();c.imageSmoothingEnabled=false;c.drawImage(im,index%4*cell,Math.floor(index/4)*cell,cell,cell,Math.round(x),Math.round(y),Math.round(w),Math.round(h));c.restore();return true;},
 geometry(id,d){if(d.culinaryInteriorVersion===1)return;const g=Arch.geometry(d),college=id==='university',east=d.width-1.3,south=d.height-1.6;
  const add=(name,a,b,height=100,color=college?'#adac92':'#b4c4b5',gaps=[])=>g.walls.push({id:id+'-interior-'+name,a:a.map(n=>n*T),b:b.map(n=>n*T),height,thickness:14,color,openings:gaps.map(([position,width])=>({u:position,width:width*T}))});
  add('north',[1.3,3.5],[east,3.5],142,college?'#66816e':'#6c9181');add('west',[1.3,3.5],[1.3,south],86);add('east',[east,3.5],[east,south],86);
  add('south',[1.3,south],[east,south],70,'#b7b090',college?[[(20-1.3)/(east-1.3),3.8],[(28-1.3)/(east-1.3),3.5],[(35-1.3)/(east-1.3),3.6]]:[[(16-1.3)/(east-1.3),3.8],[(27-1.3)/(east-1.3),3.4]]);
  if(college){add('classroom',[18.3,3.5],[18.3,18],94,'#a9b6a0',[[(12.5-3.5)/14.5,3.4]]);add('library-side',[22,3.5],[22,18],94,'#b3b69c',[[(12.5-3.5)/14.5,3.4]]);add('classroom-south',[1.3,18],[18.3,18],94,'#a4b5a0',[[(13.6-1.3)/17,3.3]]);add('research-south',[22,18],[east,18],94,'#b3b69c',[[(31-22)/(east-22),3.5]]);add('library-research',[22,10.8],[east,10.8],108,'#86a699',[[(33-22)/(east-22),3.3]]);
   d.interiorZones=[{x:1.5,y:3.6,w:16.6,h:14.2,floor:'wood',label:'SALA DE AULA'},{x:22.2,y:3.6,w:16.3,h:7,floor:'wood',label:'BIBLIOTECA'},{x:22.2,y:11,w:16.3,h:6.8,floor:'tile',label:'PESQUISA'},{x:1.5,y:18.2,w:37,h:9,floor:'stone',label:'RECEPÇÃO E LEITURA'}];
   g.signs.push({id:'university-class-sign',text:'SALA DE AULA',x:9.8*T,y:18.55*T},{id:'university-library-sign',text:'BIBLIOTECA',x:27*T,y:11.5*T},{id:'university-research-sign',text:'PESQUISA',x:31*T,y:18.55*T});
  }else{add('pantry',[10.5,3.5],[10.5,9.7],100,'#aebf9d',[[(8.3-3.5)/6.2,2.4]]);add('cooking',[20.8,3.5],[20.8,17.8],96,'#9fb7a7',[[(11.6-3.5)/14.3,3.6]]);add('washroom',[1.3,9.7],[20.8,9.7],100,'#b7c9bb',[[(16-1.3)/19.5,3.8]]);
   d.interiorZones=[{x:1.5,y:3.6,w:8.8,h:5.9,floor:'wood',label:'DESPENSA'},{x:10.7,y:3.6,w:9.9,h:5.9,floor:'tile',label:'LAVAGEM'},{x:21,y:3.6,w:9.5,h:14.3,floor:'tile',label:'COCÇÃO'},{x:1.5,y:9.9,w:19.1,h:8.2,floor:'tile',label:'PREPARO E MASSAS'},{x:1.5,y:18.2,w:29,h:3,floor:'stone',label:'COZINHA DE ENSINO'}];
   g.signs.push({id:'kitchen-pantry-sign',text:'DESPENSA',x:6*T,y:10.4*T},{id:'kitchen-wash-sign',text:'LAVAGEM',x:15.7*T,y:10.4*T},{id:'kitchen-cooking-sign',text:'COCÇÃO',x:25.7*T,y:17.8*T});
  }
  const windows=college?[5.5,15.8,25,35.5]:[5.5,14.2,26.7];for(const[i,x]of windows.entries())g.windows.push({id:id+'-interior-window-'+i,x:x*T-49,y:3.5*T-127,w:98,h:114,interiorSheet:college?'campus-interiors':'kitchen-interiors',interiorFrame:college?8:13});
  d.culinaryInteriorVersion=1;d.purpose=college?'Salas de aula, biblioteca, laboratório de pesquisa e recepção para estudar histórias e saberes alimentares.':'Cozinha de ensino com despensa, lavagem, cocção e bancadas de preparo.';
 },
 prop(m,id,index,x,y,size=150,options={}){const o={id,type:options.role?'cooking-station':'culinary-furniture',x:x*T,y:y*T,interiorArt:index,interiorSheet:options.sheet||(m.id==='kitchen'?'kitchen-interiors':'campus-interiors'),size,label:options.label||'',role:options.role,interiorDecor:!options.role,interactionRange:options.range||110,...options};m.objects.push(o);if(options.solid!==false)m.solids.push({x:o.x-(options.footWidth||size*.65)/2,y:o.y-18,w:options.footWidth||size*.65,h:options.footHeight||29,owner:id});return o;},
 build(id,d){this.geometry(id,d);const m=W.base(id,'community',d.width,d.height);Object.assign(m,{name:d.name,design:d,culinary:true,culinaryInteriors:true,ambientTime:0,decor:[],zones:[],chats:[],anchors:new Map(),reservations:new Map(),bubbleBudget:0,archWalls:[],archSolids:[],mounts:[],lifeAnimals:[],geometryRevision:1});for(const b of [[0,0,d.width,1],[0,0,1,d.height],[d.width-1,0,1,d.height],[0,d.height-1,d.width,1]])m.solids.push({x:b[0]*T,y:b[1]*T,w:b[2]*T,h:b[3]*T});
  const p=(key,frame,x,y,size,options)=>this.prop(m,id+'-'+key,frame,x,y,size,options);
  if(id==='kitchen'){
   U.link(m,'kitchen-restaurant',16,21.4,'restaurant','Voltar ao Restaurante');U.link(m,'kitchen-university',27,21.4,'university','Ir para a Universidade');
   p('pantry-left',3,3.9,6.9,165,{role:'book',label:'Despensa · consultar ingredientes e receitas'});p('pantry-right',3,7.3,6.9,165,{role:'book',label:'Grãos e farinhas · receitas da oficina'});p('fridge',4,8.8,8.7,128,{role:'book',label:'Geladeira · planejar o preparo'});p('pots',5,8.7,3.5,126,{solid:false,onWall:'kitchen-interior-north'});
   p('sink',2,13.2,6.6,170,{role:'water',label:'Pia · lavar as mãos e beber água'});p('drying',9,17.9,6.6,158);p('recycling',10,12.7,8.7,100);p('herbs',11,18.5,8.6,105);
   this.prop(m,'kitchen-work-23-7',1,24,7.5,180,{role:'book',label:'Fogão · escolher uma receita'});p('second-stove',1,27.4,12.4,180,{role:'book',label:'Cocção · preparar um prato'});p('hood',8,24,4.6,155,{solid:false});p('safety',14,29.8,10.3,70,{solid:false});p('clean-dishes',9,24.1,15.6,144);
   this.prop(m,'kitchen-work-7-7',0,6.4,13.7,188,{role:'book',label:'Bancada de preparo · escolher receita'});this.prop(m,'kitchen-work-7-14',6,15.3,13.7,188,{role:'book',label:'Mesa de massas · modelar e amassar'});p('spices',7,3.4,16.2,120,{role:'book',label:'Temperos · conhecer os ingredientes'});p('serving',15,18,16.8,124);this.prop(m,'kitchen-welcome',0,10.6,17,170,{role:'book',label:'Bancada central · preparar um prato'});
   this.prop(m,'kitchen-work-23-14',2,24,18.5,100,{role:'water',label:'Água filtrada · encher a garrafa'});U.npc(m,'kitchen-chef','Dandara','elder',14.5,16.4,'book');m.objects.push({id:'kitchen-board',type:'cooking-board',x:18*T,y:4.1*T,role:'references',label:'Consultar as receitas e referências'});
  }else{
   U.link(m,'university-exit',20,27.4,'hub','Voltar à Praça das Vozes');U.link(m,'university-kitchen',35,27.4,'kitchen','Entrar na Cozinha de ensino');
   p('chalkboard',6,9.8,3.5,210,{solid:false,onWall:'university-interior-north',role:'class',label:'Quadro · aula aberta de sabores e contextos',range:180});p('lectern',7,7.7,7.3,130,{role:'class',label:'Material da aula · comparar pratos e técnicas'});U.npc(m,'university-professor','Professora Jamila','jamila',12,8.2,'class');
   for(const[x,y]of [[6,11.3],[12.5,11.3],[6,15.5],[12.5,15.5]]){p('desk-'+x+'-'+y,0,x,y,146,{role:'class',label:'Carteira · acompanhar a aula'});p('chair-'+x+'-'+y,4,x,y+1.35,82,{footWidth:42,footHeight:22});}
   for(const x of [25.2,30.2,35.3])p('books-'+x,2,x,6.5,180,{role:'references',label:'Biblioteca · fontes e referências'});p('reading-shelf',15,25.1,9,144,{role:'references',label:'Livros e mapas · pesquisa de territórios'});p('globe',11,36,9,135,{role:'references',label:'Globo e atlas · ingredientes e lugares'});
   for(const x of [26.8,34])p('research-'+x,1,x,14.6,175,{role:'references',label:'Bancada de pesquisa · observar e consultar fontes'});U.npc(m,'university-researcher','Inês','ines',30,15.8,'references');p('samples',13,25,17,132,{role:'class',label:'Mostruário de estudo · sementes, conchas e cerâmica'});
   p('reception',3,20,21.1,210,{role:'class',label:'Recepção · conhecer as aulas abertas'});U.npc(m,'university-guide','Aline','aline',20,22,'class');p('noticeboard',5,8.3,18,108,{solid:false,onWall:'university-interior-classroom-south',role:'class',label:'Mural · programação das aulas'});
   p('fountain',10,28.5,21,112,{role:'water',label:'Bebedouro · água filtrada'});p('foyer-tree',12,3.5,21.4,165);p('east-tree',12,37,22.2,165);p('foyer-reading',15,10,22,150,{role:'references',label:'Estante de leitura · livros e mapas'});
   for(const x of [7.5,13.8]){p('reading-table-'+x,0,x,25.1,143,{role:'references',label:'Mesa de leitura · consultar referências'});p('reading-chair-'+x,4,x+2,25.1,77,{footWidth:40,footHeight:22});}for(const[x,y]of [[6,8.2],[15,8.2],[30,20.5]])p('pendant-'+x,14,x,y,80,{solid:false});
  }
  Arch.hydrate(m);V.Environment.hydrate(m);return m;
 },
 floor(c,b,kind){const x=b.x*T,y=b.y*T,w=b.w*T,h=b.h*T;c.fillStyle=kind==='wood'?'#b19267':kind==='tile'?'#b8c8bb':'#c9b991';c.fillRect(x,y,w,h);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();const step=kind==='wood'?18:32;for(let yy=y;yy<y+h;yy+=step)for(let xx=x;xx<x+w;xx+=kind==='wood'?112:48){c.fillStyle=kind==='wood'?(xx+yy)%3?'#bda071':'#c5a97b':kind==='tile'?(xx+yy)%3?'#d9dfcd':'#cbd7c5':(xx+yy)%3?'#e0d1ae':'#d4c49e';c.fillRect(xx+(yy%2?12:0)+2,yy+2,(kind==='wood'?112:48)-3,step-3);}c.restore();},
 ground(m){const canvas=V.GroundCache.create(m, m.width*T, m.height*T);;;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#355747';c.fillRect(0,0,V.GroundCache.width(canvas),V.GroundCache.height(canvas));this.floor(c,{x:1.3,y:3.5,w:m.width-2.6,h:m.height-5.1},'stone');for(const z of m.design.interiorZones)this.floor(c,z,z.floor);
  if(m.id==='university'){c.fillStyle='#638b77';c.fillRect(18.5*T,3.6*T,3.3*T,21.5*T);c.fillStyle='#b9c29d';c.fillRect(18.5*T+9,3.6*T,3.3*T-18,21.5*T);for(let y=4*T;y<24*T;y+=T){c.fillStyle='#7e9c80';c.fillRect(19.3*T,y,1.7*T,5);c.fillRect(20*T,y+14,12,12);}}
  else{for(const[x,y,w,h]of [[4,11.7,4.8,2.8],[13,11.7,4.8,2.8],[22,5.6,4,2.7],[25.4,10.4,4,2.7]]){c.fillStyle='#7c8e78';c.fillRect(x*T,y*T,w*T,h*T);c.strokeStyle='#d9d7b0';c.lineWidth=3;c.strokeRect(x*T+5,y*T+5,w*T-10,h*T-10);}}
  m.cache=canvas;
 },
 draw(c,o,cam){const x=o.x-cam.x,y=o.y-cam.y;if((o.culinaryLink||o.interiorDoor)&&W.current?.culinaryInteriors){const college=W.current.id==='university';this.art(c,college?'campus-interiors':'kitchen-interiors',college?9:12,x-64,y-121,128);V.Maritime.label(c,V.FastTravel.name(o.to),x,y+17,W.nearest?.id===o.id);return true;}if(o.interiorArt===undefined)return false;if(x< -220||x>c.canvas.width+220||y< -60||y>c.canvas.height+250)return true;const size=o.size;if(o.solid!==false){c.fillStyle='#193e3326';c.beginPath();c.ellipse(x,y+3,size*.33,10,0,0,Math.PI*2);c.fill();}this.art(c,o.interiorSheet,o.interiorArt,x-size/2,y-size+8,size);if(o.role==='water'&&!V.settings.reducedMotion){c.fillStyle='#a5d9d5';const t=V.Engine.time*6%1;c.fillRect(x+2,y-size*.4+t*11,2,4);}if(W.nearest?.id===o.id&&o.role)V.Maritime.label(c,o.label,x,y-size-12,true);return true;},
 window(c,o,cam){this.art(c,o.interiorSheet,o.interiorFrame,o.x-cam.x,o.y-cam.y,o.w,o.h);},
 anchors(){for(const id of this.ids){const m=W.maps[id];if(!m)continue;for(const o of m.objects.filter(o=>o.culinaryLink)){o.interiorDoor=true;o.onWall=id+'-interior-south';}if(id==='university'){const o=m.objects.find(o=>o.id==='food-museum-university-entry');if(o)Object.assign(o,{x:28*T,y:27.4*T,interiorDoor:true,onWall:id+'-interior-south'});}const point=V.FastTravel.point(id),at=id==='kitchen'?{x:12*T,y:10.8*T}:{x:20*T,y:18.5*T};if(point&&V.FastTravel.clear(m,at,14))Object.assign(point,at);}V.ObjectiveGuide.invalidate();V.Atlas.cache.clear();},
 render(c){const m=W.current,cam=W.camera;if(!m.cache)this.ground(m);c.save();c.imageSmoothingEnabled=false;c.fillStyle='#355747';c.fillRect(0,0,c.canvas.width,c.canvas.height);V.GroundCache.draw(c, m.cache, Math.round(-cam.x), Math.round(-cam.y));const g=Arch.geometry(m.design),rows=m.objects.map(o=>{const wall=o.onWall&&g.walls.find(w=>w.id===o.onWall);return{y:wall?Math.max(wall.a[1],wall.b[1])+.2:o.y,kind:'object',o};}).concat(g.walls.map(o=>({y:Math.max(o.a[1],o.b[1]),kind:'wall',o})),g.windows.map(o=>({y:3.5*T+.1,kind:'window',o})),[{y:V.Player.data.y,kind:'player'}]).sort((a,b)=>a.y-b.y);
  for(const row of rows){if(row.kind==='wall')Arch.drawWall(c,m,row.o,cam);else if(row.kind==='window')this.window(c,row.o,cam);else if(row.kind==='player')V.Player.render(c);else if(!U.draw(c,row.o,cam))C.drawObject(c,row.o,cam);}Arch.drawSigns(c,m,cam);if(V.PixPresence.following())V.PixPresence.draw(c,V.Player.data,cam);if(W.transition>0){c.globalAlpha=W.transition;c.fillStyle='#284a41';c.fillRect(0,0,c.canvas.width,c.canvas.height);}c.restore();W.drawMiniMap();
 }
};
const setup=U.setup.bind(U);U.setup=function(){setup();for(const id of I.ids){I.geometry(id,C.layouts[id]);S.defaults[id]=copy(C.layouts[id]);}};U.setup();
const link=U.link.bind(U);U.link=function(m,...args){const o=link(m,...args);if(m.culinaryInteriors)Object.assign(o,{interiorDoor:true,onWall:m.id+'-interior-south'});return o;};
const movable=V.PortalSpacing.movable.bind(V.PortalSpacing);V.PortalSpacing.movable=o=>!o.interiorDoor&&movable(o);
const init=W.init.bind(W);W.init=function(...args){const result=init(...args);I.anchors();return result;};
const build=U.build.bind(U);U.build=(id,d=C.layouts[id])=>I.ids.includes(id)?I.build(id,d):build(id,d);
const ground=U.ground.bind(U);U.ground=m=>m.culinaryInteriors?I.ground(m):ground(m);
const draw=U.draw.bind(U);U.draw=(c,o,cam)=>I.draw(c,o,cam)||draw(c,o,cam);
const render=U.render.bind(U);U.render=c=>W.current?.culinaryInteriors?I.render(c):render(c);
const assets=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await Promise.all([assets(...args),I.load()]);};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=function(key){return /assets\/cooking\/kitchen-interiors\./.test(key)?'culinary-kitchen':/assets\/cooking\/campus-interiors\./.test(key)?'culinary-campus':group(key);};
const groups=V.MapAssets.groups.bind(V.MapAssets);V.MapAssets.groups=function(m){const out=groups(m);if(m?.culinaryInteriors)out.push(m.id==='kitchen'?'culinary-kitchen':'culinary-campus');return[...new Set(out)];};
const interactables=W.interactables.bind(W);W.interactables=(...args)=>interactables(...args).filter(o=>!o.interiorDecor);
const load=W.load.bind(W);W.load=function(id,pos){if(I.ids.includes(id)){const m=W.maps[id],spawn=C.layouts[id].spawn;pos=V.Rooms.safe(m,pos||{x:spawn[0]*T,y:spawn[1]*T},14)||{x:spawn[0]*T,y:spawn[1]*T};}return load(id,pos);};
})();

});
