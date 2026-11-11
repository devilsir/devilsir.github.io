/* Registered module: food-museum-gallery */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("food-museum-gallery", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,M=V.FoodMuseum,W=V.World,C=V.Cozy,A=V.Architecture,T=48,ID='food-museum';
const G=V.FoodGallery={
 images:{},artData:V.FoodGalleryArtData,
 sections:[['Tabuleiros e encontros','Pratos, trabalho e memória'],['Técnicas que viajam','Gestos e modos de fazer'],['Cozinhas e territórios','Ingredientes e circulação'],['Pratos e nomes','Palavras em movimento']],
 load(){if(this.ready)return this.ready;this.ready=Promise.all(Object.entries(this.artData).map(([key,data])=>new Promise(resolve=>{const image=V.Assets.image();this.images[key]=image;image.onload=image.onerror=resolve;image.src=data.file+'?v=20261102-gallery1';V.AssetLoader.register(image,resolve);})));return this.ready;},
 art(c,sheet,index,x,y,w,h=w){const image=this.images[sheet],f=this.artData[sheet]?.frames[index];if(!image?.naturalWidth||!f)return null;const scale=Math.min(w/f.w,h/f.h),dw=Math.round(f.w*scale),dh=Math.round(f.h*scale),rect={x:Math.round(x+(w-dw)/2),y:Math.round(y+h-dh),w:dw,h:dh};c.save();c.imageSmoothingEnabled=false;c.drawImage(image,f.x,f.y,f.w,f.h,rect.x,rect.y,dw,dh);c.restore();return rect;},
 geometry(d){if(d.foodGalleryVersion===1)return;const g=A.geometry(d),add=(key,a,b,height=140,color='#e2dac5',openings=[])=>g.walls.push({id:'food-gallery-wall-'+key,a:a.map(n=>n*T),b:b.map(n=>n*T),height,color,thickness:14,foodGalleryWall:true,openings});
  add('north',[1.3,3.5],[42.7,3.5],148,'#e6ddc7');add('west',[1.3,3.5],[1.3,37.4],76,'#d5cbb4');add('east',[42.7,3.5],[42.7,37.4],76,'#d5cbb4');
  add('south',[1.3,37.4],[42.7,37.4],44,'#d5cbb4',[{u:(22-1.3)/41.4,width:3.8*T},{u:(28-1.3)/41.4,width:3.5*T}]);
  for(let row=0;row<4;row++)for(const[side,x]of [['left',2],['right',24.7]])add(row+'-'+side,[x,5.7+row*8],[x+17.3,5.7+row*8]);
  for(const[i,x]of [16.8,27.2].entries())g.windows.push({id:'food-gallery-window-'+i,x:x*T-40,y:18,w:80,h:110,foodGalleryWindow:true});
  d.foodGalleryVersion=1;d.spawn=[22,35];d.palette=['#e8dfc9','#214c3e','#b69658'];d.purpose='Galerias de patrimônio alimentar: vitrines, histórias dos pratos e das palavras, recepção e pesquisa.';
 },
 prop(m,id,frame,x,y,w,h,options={}){const o={id:'food-gallery-'+id,type:'food-gallery-prop',gallerySheet:'gallery-furniture',galleryFrame:frame,x:x*T,y:y*T,w,h,galleryDecor:!options.galleryRole,...options};m.objects.push(o);if(options.solid!==false)m.solids.push({x:o.x-(options.footWidth||w*.64)/2,y:o.y-16,w:options.footWidth||w*.64,h:options.footHeight||28,owner:o.id});return o;},
 build(m){this.geometry(m.design);m.foodGallery=true;m.solids=m.solids.filter(s=>s.owner!=='food-museum-gallery-wall');
  M.entries().forEach((entry,index)=>{const row=Math.floor(index/6),panel=m.objects.find(o=>o.id==='food-panel-'+entry.id),show=m.objects.find(o=>o.id==='food-case-'+entry.id),wall='food-gallery-wall-'+row+'-'+(index%6<3?'left':'right');Object.assign(panel,{y:(5.7+row*8)*T,onWall:wall,exhibitNumber:index+1,interactionRange:125});Object.assign(show,{y:(9.05+row*8)*T,exhibitNumber:index+1,galleryFrame:index%2});const solid=m.solids.find(s=>s.owner===show.id);Object.assign(solid,{x:show.x-67,y:show.y-19,w:134,h:35});});
  for(const[i,o]of m.objects.filter(o=>o.type==='food-museum-info').entries())Object.assign(o,{y:29.7*T,onWall:'food-gallery-wall-3-right',interactionRange:125,exhibitNumber:i+1});
  for(const o of m.objects.filter(o=>o.foodMuseumDoor)){o.y=37.4*T;o.foodGalleryDoor=true;o.interiorDoor=true;o.onWall='food-gallery-wall-south';}
  Object.assign(m.objects.find(o=>o.type==='food-museum-curator'),{x:32.8*T,y:35.4*T});
  this.prop(m,'reception',4,32.8,34.2,220,156,{galleryRole:'catalog',label:'Recepção · consultar o acervo',interactionRange:125});
  this.prop(m,'directory',7,24.7,34.8,82,160,{galleryRole:'directory',label:'Diretório das galerias',interactionRange:110,footWidth:44});
  this.prop(m,'bench-west',6,8.2,36,194,92,{galleryRole:'rest',label:'Banco da galeria · descansar',interactionRange:110,footWidth:142});
  this.prop(m,'palm-west',8,3.3,36.9,100,130);this.prop(m,'palm-east',8,40.8,36.9,100,130);
  this.prop(m,'archive',5,38.5,33.4,162,122,{galleryRole:'about',label:'Arquivo do museu · fontes e pesquisa',interactionRange:110});
  this.prop(m,'serving-collection',6,27.2,33.4,174,136,{gallerySheet:'gallery-collection',galleryRole:'about',label:'Objetos e modos de servir',interactionRange:110});
  this.prop(m,'plant-foyer',7,29.6,35,74,100,{gallerySheet:'gallery-collection'});
  const north='food-gallery-wall-north';for(const[i,x]of [5.5,11.2,32.8,38.5].entries())this.prop(m,'wall-study-'+i,[1,4,2,3][i],x,2.6,184,102,{gallerySheet:'gallery-collection',onWall:north,solid:false});
  this.prop(m,'title',14,22,3.5,234,116,{galleryRole:'directory',label:'Museu da Comida · conhecer as galerias',onWall:north,solid:false,interactionRange:160});
  for(let row=0;row<4;row++)for(const[side,x]of [['left',2.65],['right',41.35]])this.prop(m,'sconce-'+row+'-'+side,10,x,5.7+row*8,52,67,{onWall:'food-gallery-wall-'+row+'-'+side,solid:false});
  for(let row=0;row<4;row++)m.objects.push({id:'food-gallery-section-'+row,type:'food-gallery-section',x:22*T,y:(5.7+row*8)*T,section:row,galleryDecor:true});
  A.hydrate(m);V.Environment.hydrate(m);m.cache=null;return m;
 },
 lines(c,text,width,size=14,maxLines=2){const words=String(text).split(/\s+/);let chosen=[];for(let font=size;font>=Math.min(size,10);font-=.5){c.font=`600 ${font}px "VOICES Sans","Segoe UI",sans-serif`;const lines=[];let line='';for(const word of words){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>width){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);chosen=lines;if(lines.length<=maxLines&&lines.every(l=>c.measureText(l).width<=width))return{lines,size:font};}return{lines:chosen,size:10};},
 text(c,text,x,y,width,size,color,maxLines=2,spacing=0){c.save();const fit=this.lines(c,text,width,size,maxLines);c.textAlign='center';c.fillStyle=color;const lineHeight=fit.size+spacing+3;fit.lines.forEach((line,i)=>c.fillText(line,Math.round(x),Math.round(y+i*lineHeight)));c.restore();return{...fit,height:fit.lines.length*lineHeight};},
 plaque(c,x,y,w,h,dark=false){c.fillStyle='#1a30252b';c.fillRect(Math.round(x-w/2+3),Math.round(y+4),w,h);c.fillStyle='#9b7a42';c.fillRect(Math.round(x-w/2),Math.round(y),w,h);c.fillStyle=dark?'#204b3c':'#f0e7d1';c.fillRect(Math.round(x-w/2+2),Math.round(y+2),w-4,h-4);c.strokeStyle=dark?'#be9d5f':'#c4ad78';c.lineWidth=1;c.strokeRect(Math.round(x-w/2+5)+.5,Math.round(y+5)+.5,w-10,h-10);this.art(c,'gallery-furniture',dark?13:12,x-w/2,y,w,h);},
 wall(c,m,wall,cam){A.drawWall(c,m,wall,cam);if(!wall.foodGalleryWall||Math.abs(wall.b[1]-wall.a[1])>Math.abs(wall.b[0]-wall.a[0]))return;const p=V.Player.data,obstruct=p.y<wall.a[1]&&p.y>wall.a[1]-wall.height-45&&p.x>wall.a[0]-50&&p.x<wall.b[0]+50;c.save();c.globalAlpha=obstruct&&!V.SceneEditor?.active ? .65 : 1;
  for(const s of A.segments(wall)){const x=Math.round(s.a[0]-cam.x),y=Math.round(s.a[1]-cam.y),w=Math.round(s.b[0]-s.a[0]),h=wall.height;c.fillStyle='#e4dcc6';c.fillRect(x,y-h+14,w,h-24);c.fillStyle='#234c3e';c.fillRect(x,y-48,w,39);c.fillStyle='#b7985a';c.fillRect(x,y-51,w,3);c.fillRect(x,y-10,w,3);c.fillStyle='#314c3e';c.fillRect(x,y-7,w,7);c.fillStyle='#f0e8d2';c.fillRect(x,y-h,w,6);c.fillStyle='#b99a61';c.fillRect(x,y-h+8,w,2);for(let xx=x+8;xx<x+w-18;xx+=132){c.strokeStyle='#60715a';c.strokeRect(xx+.5,y-42.5,Math.min(116,x+w-xx-8),27);}}
  c.restore();
 },
 floor(m){const canvas=document.createElement('canvas');canvas.width=m.width*T;canvas.height=m.height*T;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#243f34';c.fillRect(0,0,canvas.width,canvas.height);const left=1.3*T,top=3.5*T,right=42.7*T,bottom=37.4*T;c.fillStyle='#bca982';c.fillRect(left,top,right-left,bottom-top);c.save();c.beginPath();c.rect(left+8,top+6,right-left-16,bottom-top-12);c.clip();for(let y=top;y<bottom;y+=64)for(let x=left;x<right;x+=64){const col=Math.round((x-left)/64),row=Math.round((y-top)/64),light=(col+row)%2;c.fillStyle=light?'#e9e2cf':'#ded7c2';c.fillRect(x+1,y+1,62,62);c.strokeStyle=light?'#cfc7b14a':'#f9f3e34d';c.lineWidth=1;c.beginPath();c.moveTo(x+7,y+12+(row%3)*8);c.lineTo(x+24,y+19+(row%3)*8);c.lineTo(x+52,y+14+(row%3)*8);c.stroke();if((col+row)%4===0){c.fillStyle='#bca276';c.beginPath();c.moveTo(x+61,y+57);c.lineTo(x+65,y+61);c.lineTo(x+61,y+65);c.lineTo(x+57,y+61);c.closePath();c.fill();}}
  c.fillStyle='#234d3e';c.fillRect(20.1*T,top,3.8*T,bottom-top);c.fillStyle='#9e854e';for(const x of [20.1*T+5,23.9*T-8])c.fillRect(x,top,3,bottom-top);for(let y=5*T;y<bottom-72;y+=96){const x=22*T;c.strokeStyle='#ba9b60';c.lineWidth=1;c.beginPath();c.moveTo(x,y-12);c.lineTo(x+12,y);c.lineTo(x,y+12);c.lineTo(x-12,y);c.closePath();c.stroke();c.fillStyle='#68866c';c.fillRect(x-2,y-2,4,4);}
  for(const o of m.objects.filter(o=>o.type==='food-museum-case')){c.fillStyle='#a8946a';c.fillRect(o.x-102,o.y-103,204,157);c.fillStyle='#f1e8d0';c.fillRect(o.x-99,o.y-100,198,151);c.strokeStyle='#bca678';c.strokeRect(o.x-94.5,o.y-95.5,189,142);}
  for(const x of [8.2,32.8]){c.fillStyle='#2e5644';c.fillRect((x-3.2)*T,34*T,6.4*T,2.6*T);c.strokeStyle='#b69b5f';c.strokeRect((x-3.2)*T+5,34*T+5,6.4*T-10,2.6*T-10);}
  c.restore();c.strokeStyle='#9a7a46';c.lineWidth=2;c.strokeRect(left+16,top+16,right-left-32,bottom-top-32);m.cache=canvas;
 },
 panel(c,o,x,y){const entry=M.entry(o.foodEntry);if(!entry)return;this.plaque(c,x,y-124,208,105);this.text(c,'ACERVO · '+String(o.exhibitNumber).padStart(2,'0'),x,y-100,174,9.5,'#80683e',1);const title=this.text(c,entry.recipe.name,x,y-85,176,14,'#234735',2);this.text(c,entry.recipe.region,x,y-85+title.height+6,176,10.5,'#59624b',2);},
 showcase(c,o,x,y){const entry=M.entry(o.foodEntry);if(!entry)return;const player=V.Player.data,behind=!V.SceneEditor?.active&&player.y<o.y&&player.y>o.y-130&&Math.abs(player.x-o.x)<100;c.save();if(behind)c.globalAlpha*=.38;const f=this.art(c,'gallery-furniture',o.galleryFrame,x-92,y-130,184,130);if(!f){this.plaque(c,x,y-108,174,108,true);}const dishY=f?f.y+f.h*.28:y-82;M.dish(c,entry,x-25,dishY,50,37.5);c.restore();this.plaque(c,x,y+11,200,40,true);this.text(c,String(o.exhibitNumber).padStart(2,'0')+' · '+entry.recipe.name,x,y+29,178,12,'#f5e7bb',2,0);if(W.nearest?.id===o.id){c.strokeStyle='#efd494';c.lineWidth=2;c.strokeRect(x-104,y-134,208,188);}},
 draw(c,o,cam){const x=Math.round(o.x-cam.x),y=Math.round(o.y-cam.y);if(o.type==='food-museum-panel'){this.panel(c,o,x,y);return true;}if(o.type==='food-museum-case'){this.showcase(c,o,x,y);return true;}if(o.type==='food-museum-info'){this.plaque(c,x,y-124,208,105);this.text(c,'PESQUISA E MEMÓRIA',x,y-100,176,9.5,'#80683e',1);this.text(c,o.title,x,y-78,176,15,'#234735',2);this.text(c,['Fontes e perguntas','Gestos e transmissão','Trabalho e lembranças'][o.exhibitNumber-1],x,y-43,176,11,'#59624b',1);return true;}
  if(o.foodGalleryDoor){this.art(c,'gallery-furniture',15,x-66,y-135,132,137);this.plaque(c,x,y+12,180,29,true);this.text(c,o.to==='hub'?'Praça das Vozes':'Universidade',x,y+31,160,11,'#f6e6b9',1);return true;}
  if(o.type==='food-gallery-section'){this.plaque(c,x,y-52,220,58,true);this.text(c,String(o.section+1).padStart(2,'0')+' · '+this.sections[o.section][0],x,y-24,198,12,'#f4e6bd',1);this.text(c,this.sections[o.section][1],x,y-7,198,10,'#c6cbaa',1);return true;}
  if(o.type!=='food-gallery-prop')return false;this.art(c,o.gallerySheet,o.galleryFrame,x-o.w/2,y-o.h,o.w,o.h);
  if(o.id==='food-gallery-title'){this.text(c,'MUSEU DA COMIDA',x,y-76,202,17,'#f3e3ac',2);this.text(c,'Pratos · palavras · pessoas',x,y-43,202,10.5,'#dfd6ae',1);}
  if(o.galleryRole==='directory'){if(o.id!=='food-gallery-title'){this.text(c,'GALERIAS',x,y-o.h+57,o.w-24,9,'#f3e3ac',1);this.text(c,'01 – 04',x,y-o.h+79,o.w-24,10,'#f3e3ac',1);this.text(c,'ACERVO',x,y-o.h+104,o.w-24,8,'#d3c69d',1);}}
  if(W.nearest?.id===o.id&&o.galleryRole)V.Maritime.label(c,o.label,x,y-o.h-12,true);return true;
 },
 render(c){const m=W.current,cam=W.camera;if(!m.cache)this.floor(m);c.save();c.imageSmoothingEnabled=false;c.fillStyle='#243f34';c.fillRect(0,0,c.canvas.width,c.canvas.height);V.GroundCache.draw(c, m.cache, Math.round(-cam.x), Math.round(-cam.y));const geometry=A.geometry(m.design),rows=m.objects.map(o=>{const wall=o.onWall&&geometry.walls.find(w=>w.id===o.onWall);return{kind:'object',y:wall?Math.max(wall.a[1],wall.b[1])+.3:o.y,o};}).concat(geometry.walls.map(o=>({kind:'wall',y:Math.max(o.a[1],o.b[1]),o})),geometry.windows.map(o=>({kind:'window',y:o.y+o.h+.1,o})),[{kind:'player',y:V.Player.data.y}]).sort((a,b)=>a.y-b.y);
  for(const row of rows){if(row.kind==='wall')this.wall(c,m,row.o,cam);else if(row.kind==='window'){if(row.o.foodGalleryWindow)this.art(c,'gallery-collection',5,row.o.x-cam.x,row.o.y-cam.y,row.o.w,row.o.h);else A.drawWindow?.(c,m,row.o,cam);}else if(row.kind==='player')V.Player.render(c);else if(!M.draw(c,row.o,cam))C.drawObject(c,row.o,cam);}
  if(V.PixPresence.following())V.PixPresence.draw(c,V.Player.data,cam);if(W.transition>0){c.globalAlpha=W.transition;c.fillStyle='#294b3e';c.fillRect(0,0,c.canvas.width,c.canvas.height);}c.restore();W.drawMiniMap();
 },
 skin(){const modal=V.$('.modal');if(modal)modal.classList.add('food-gallery-modal');},
 directory(){V.UI.modal('Museu da Comida','DIRETÓRIO DAS GALERIAS',`<p>Explore as duas alas de cada galeria. As placas nas paredes identificam os pratos e seus contextos; as vitrines guardam as representações do acervo.</p><ol class="food-gallery-directory">${this.sections.map(([name,detail],i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><div><strong>${V.escape(name)}</strong><small>${V.escape(detail)}</small></div></li>`).join('')}</ol><p>Na recepção, converse com Celina para consultar a coleção e registrar as fichas no seu caderno.</p>`,'<button id="food-gallery-collection" class="primary">Consultar a coleção</button>',true);this.skin();V.$('#food-gallery-collection').onclick=()=>M.catalog();},
 anchor(){const m=W.maps[ID],point=V.FastTravel.point(ID),at={x:22*T,y:33.7*T};if(point&&V.FastTravel.clear(m,at))Object.assign(point,at);V.Atlas.cache.clear();V.ObjectiveGuide.invalidate();}
};
const setup=M.setup.bind(M);M.setup=function(){setup();G.geometry(C.layouts[ID]);V.SceneDesign.defaults[ID]=JSON.parse(JSON.stringify(C.layouts[ID]));};M.setup();
const build=M.build.bind(M);M.build=layout=>G.build(build(layout));
M.ground=m=>G.floor(m);M.render=c=>G.render(c);
const draw=M.draw.bind(M);M.draw=(c,o,cam)=>G.draw(c,o,cam)||draw(c,o,cam);
const dish=M.dish.bind(M);M.dish=function(c,entry,x,y,w=50,h=37.5){const index=V.CookingData.recipes.indexOf(entry.recipe);return index>=0&&index<21&&G.artData['gallery-dishes'].frames[index]&&G.art(c,'gallery-dishes',index,x,y,w,h)||dish(c,entry,x,y,w,h);};
for(const key of ['catalog','exhibit','about']){const method=M[key].bind(M);M[key]=function(...args){const result=method(...args);G.skin();return result;};}
const seed=M.seed.bind(M);M.seed=function(...args){const result=seed(...args);G.anchor();return result;};
const assets=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await Promise.all([assets(...args),G.load()]);};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=key=>key.startsWith('assets/food-museum/')?'food-gallery':group(key);
const groups=V.MapAssets.groups.bind(V.MapAssets);V.MapAssets.groups=function(m){const out=groups(m);return[...new Set(m?.foodGallery?[...out.filter(g=>!['nature','nature-food','cooking'].includes(g)),'food-gallery']:out)];};
const interactables=W.interactables.bind(W);W.interactables=(...args)=>interactables(...args).filter(o=>!o.galleryDecor);
const load=W.load.bind(W);W.load=function(id,pos){if(id===ID){const m=this.maps[id],spawn=m.design.spawn;pos=V.Rooms.safe(m,pos||{x:spawn[0]*T,y:spawn[1]*T},14);}return load(id,pos);};
V.Hooks.around(V.Game, 'interact', 'food-museum-gallery:interact:1', nextHook => function(o){if(o?.galleryRole&&!V.modal&&!V.Dialogue.active&&this.mode==='explore'){if(o.galleryRole==='directory')return G.directory();if(o.galleryRole==='catalog')return M.catalog();if(o.galleryRole==='about')return M.about();if(o.galleryRole==='rest'){return V.Progress.rest();}}return nextHook(o);});
})();

});
