(function(){
'use strict';const V=window.V,N=V.NatureWorld,D=V.NatureData,C=V.Cozy,S=V.SceneDesign,W=V.World,T=48,ID='nature-cerrado';
const labels=['Pequizeiro','Ipê-amarelo-do-cerrado','Baru','Buriti','Lobeira','Canela-de-ema','Gramíneas nativas','Flores do campo','Afloramento rochoso','Cupinzeiro','Centro de visitantes','Posto de observação'];
const R=V.CerradoRenewal={image:null,
 setup(){const d=C.layouts[ID];if(!d)return;Object.assign(d,{width:72,height:52,spawn:[36,46],purpose:'Campos abertos, cerrado típico e vereda com buritis, fauna livre e trilhas de observação.'});S.defaults[ID]=JSON.parse(JSON.stringify(d));S.raw[ID]=W.base(ID,'community',72,52);},
 load(){return new Promise(resolve=>{const image=V.Assets.image();this.image=image;image.onload=image.onerror=resolve;image.src='assets/expansion/cerrado-landscape.webp?v=20261102-cerrado2';V.AssetLoader.register(image,resolve);});},
 prop(m,index,x,y,size=140,solid=index<6||index>7){const o={id:ID+'-native-'+m.objects.length,type:'nature-prop',cerradoArt:index,x:x*T,y:y*T,w:size,h:size,label:labels[index]};m.objects.push(o);if(solid)m.solids.push({x:o.x-18,y:o.y-13,w:36,h:24,owner:o.id});return o;},
 build(m){m.cerradoRenewal=true;const remove=new Set(m.objects.filter(o=>o.type==='nature-prop'||o.type==='nature-animal').map(o=>o.id));m.objects=m.objects.filter(o=>!remove.has(o.id));m.solids=m.solids.filter(o=>!remove.has(o.owner)&&!String(o.owner).includes('-water-'));m.natureWater=[];m.natureBridges=[];
  const ranger=m.objects.find(o=>o.type==='nature-ranger');if(ranger)Object.assign(ranger,{x:36*T,y:44*T,home:{x:36*T,y:44*T}});const patrol=m.objects.find(o=>o.type==='nature-board');if(patrol)Object.assign(patrol,{x:41*T,y:44*T});
  for(const o of m.objects.filter(o=>o.natureLink)){const at=o.to==='hub'?[36,49]:o.to==='nature-pantanal'?[7,48]:[65,48];o.x=at[0]*T;o.y=at[1]*T;}
  N.water(m,43,7,5,19);N.water(m,43,29,5,7);m.natureBridges.push({x:42*T,y:26*T,w:7*T,h:3*T});
  this.prop(m,10,30.5,44.5,170);for(const[x,y]of [[12,29],[56,24],[33,13]])this.prop(m,11,x,y,122);
  const trails=[[36,49,36,38],[36,38,16,29],[16,29,14,8],[36,38,60,36],[60,36,59,8],[16,28,60,28],[7,48,36,46],[36,46,65,48]],distance=(x,y)=>Math.min(...trails.map(([ax,ay,bx,by])=>{const dx=bx-ax,dy=by-ay,u=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-ax-u*dx,y-ay-u*dy);}));m.cerradoTrails=trails;
  for(let y=5;y<42;y+=4)for(let x=4;x<69;x+=4){if(distance(x,y)<2.5||x>40&&x<51||N.blocked(m,x*T,y*T,60))continue;const seed=(x*17+y*31)%19,index=seed%7===0?1:seed%5===0?2:seed%4===0?4:0;this.prop(m,index,x+(seed%3)*.3,y, index===4?78:108+seed%4*14);}
  for(const[x,y]of [[40,10],[51,13],[40,18],[51,23],[40,32],[51,34]])this.prop(m,3,x,y,150);
  for(let i=0;i<120;i++){const x=3+(i*17.3)%65,y=4+(i*11.7)%38;if(distance(x,y)<1.5||x>41&&x<50||N.blocked(m,x*T,y*T,24))continue;this.prop(m,i%8===0?5:i%4===0?7:6,x,y,i%8===0?64:34+i%3*8,false);}
  for(const[index,x,y]of [[8,22,12],[8,63,18],[9,8,19],[9,25,34],[8,54,39]])this.prop(m,index,x,y,index===8?90:72);
  const animals=[['maned-wolf',24,18],['maned-wolf',61,13],['giant-anteater',10,13],['giant-anteater',28,34],['giant-anteater',55,32],['tapir',52,18],['tapir',52,32],['armadillo',9,36],['armadillo',23,8],['armadillo',63,39],['macaw',37,10],['macaw',57,9],['macaw',21,31],['toucan',11,24],['toucan',55,39],['toucan',33,22]];
  for(const[id,x,y]of animals){const at=V.Rooms.safe(m,{x:x*T,y:y*T},16)||{x:x*T,y:y*T},o=N.animal(m,id,at.x/T,at.y/T,[at.x/T-2,at.y/T-1.5,4,3]);o.wait=.5+(x%3);o.walking=true;}
  const place=D.maps.find(p=>p.id===ID);place.species=[...new Set([...place.species,'tapir','armadillo'])];place.source='cerradoFlora';V.Wildlife.enrich(m);for(const o of m.objects){const p=m.design.positions?.[o.id];if(p){o.x=(p[0]+.5)*T;o.y=(p[1]+.5)*T;}}return m;
 },
 ground(m){const canvas=document.createElement('canvas');canvas.width=m.width*T;canvas.height=m.height*T;const c=canvas.getContext('2d');c.fillStyle='#adb47c';c.fillRect(0,0,canvas.width,canvas.height);for(let y=0;y<canvas.height;y+=32)for(let x=0;x<canvas.width;x+=32){const n=(x*3+y*11)%37;c.fillStyle=['#a4ad71','#afb982','#b8bc84','#9fa96c'][n%4];c.globalAlpha=.35;c.fillRect(x,y,32,32);c.globalAlpha=1;if(n%3===0){c.strokeStyle='#818e52';c.lineWidth=1;c.beginPath();c.moveTo(x+10,y+22);c.lineTo(x+8,y+14);c.moveTo(x+11,y+22);c.lineTo(x+15,y+12);c.stroke();}}
  c.lineJoin=c.lineCap='round';for(const width of [100,82]){c.strokeStyle=width===100?'#a59865':'#d1be8b';c.lineWidth=width;for(const[ax,ay,bx,by]of m.cerradoTrails){c.beginPath();c.moveTo(ax*T,ay*T);c.lineTo(bx*T,by*T);c.stroke();}}
  for(const b of m.natureWater){c.fillStyle='#7eaa87';c.fillRect(b.x-20,b.y-18,b.w+40,b.h+36);c.fillStyle='#619f9a';c.fillRect(b.x,b.y,b.w,b.h);c.strokeStyle='#b5d4b9';for(let y=b.y+20;y<b.y+b.h;y+=35){c.beginPath();c.moveTo(b.x+20,y);c.lineTo(b.x+b.w-25,y);c.stroke();}}
  for(const b of m.natureBridges){c.fillStyle='#72523b';c.fillRect(b.x,b.y,b.w,b.h);c.fillStyle='#d2b17a';for(let x=b.x+3;x<b.x+b.w;x+=16)c.fillRect(x,b.y+5,12,b.h-10);}
  c.fillStyle='#607a4c';c.fillRect(0,0,canvas.width,48);c.fillRect(0,canvas.height-48,canvas.width,48);c.fillRect(0,0,48,canvas.height);c.fillRect(canvas.width-48,0,48,canvas.height);m.cache=canvas;
 },
 draw(c,o,cam){if(o.cerradoArt===undefined)return false;const image=this.image;if(!image?.naturalWidth)return true;const x=o.x-cam.x,y=o.y-cam.y,size=o.w,cell=image.naturalWidth/4;if(Math.abs(c.getTransform().a)>=.99&&(x<-size||x>c.canvas.width+size||y<-40||y>c.canvas.height+size))return true;V.SceneShadows.cast(c,image,x,y+6,size,size,{frame:[o.cerradoArt%4*cell,Math.floor(o.cerradoArt/4)*cell,cell,cell],alpha:o.cerradoArt<4?.16:.12});c.save();c.imageSmoothingEnabled=true;c.drawImage(image,o.cerradoArt%4*cell,Math.floor(o.cerradoArt/4)*cell,cell,cell,x-size/2,y-size+12,size,size);c.restore();return true;}
};
const setup=N.setup.bind(N);N.setup=function(...args){const positions=S.saved?.[ID]?.positions||C.layouts[ID]?.positions;setup(...args);if(positions)C.layouts[ID].positions=JSON.parse(JSON.stringify(positions));R.setup();};R.setup();
D.sources.cerradoFlora={title:'Embrapa · Restauração do Cerrado',url:'https://ainfo.cnptia.embrapa.br/digital/bitstream/item/141879/1/Restauracao-semeadura-direta-cerrado-PDF-WEB.pdf'};
D.sources.cerradoFauna={title:'Embrapa · Mamíferos do Cerrado',url:'https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/tematicas/bioma-cerrado/fauna/mamiferos'};
const build=N.build.bind(N);N.build=function(...args){const m=build(...args);return m.id===ID?R.build(m):m;};
const ground=N.ground.bind(N);N.ground=m=>m.id===ID?R.ground(m):ground(m);
const draw=N.draw.bind(N);N.draw=(c,o,cam)=>R.draw(c,o,cam)||draw(c,o,cam);
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await Promise.all([load(...args),R.load()]);};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=key=>key.includes('/cerrado-landscape.')?'nature':group(key);
})();
