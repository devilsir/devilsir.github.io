(function(){
'use strict';
const V=window.V,R=V.CapeRegion,M=V.Maritime,A=V.MaritimeArt,D=V.CapeRegionData,T=48;
const P=V.CapeVisuals={tiles:new Map(),
labels:{'cape-houses':'Casas do Bo-Kaap · coral, turquesa e ocre','bo-kaap-terrace':'Casas do Bo-Kaap · azul, rosa e sálvia','cape-heritage':'Casa de memória do Cabo','cape-warehouse':'Armazém do cais','cape-market':'Mercado do bairro do Cabo','garden-pavilion':'Pavilhão do jardim','muizenberg-huts':'Cabanas de Muizenberg','harbor-lighthouse':'Farol da enseada','cape-fynbos':'Fynbos · proteas do Cabo','protea-bed':'Canteiro de proteas e alfineteiros','cape-restios':'Fynbos · restios e ericas','cape-silver-tree':'Árvore prateada do Cabo','cape-rocks':'Rochas de arenito','cape-dune-grass':'Capim das dunas','prop-lantern':'Poste do Cabo','cape-bench':'Banco de passeio','cape-planter':'Vaso de folhagem','prop-cargo':'Caixas e cordas do cais','cape-surfboards':'Suporte de pranchas','cape-lectern':'Painel de interpretação','boat-ferry':'Navio Horizonte','boat-row':'Barco a remo','boat-dinghy':'Bote a motor','prop-bollard':'Amarração do cais · corda e boia','prop-buoys':'Boias de navegação','prop-tackle':'Caixa de pesca e vara','port-crane':'Guindaste do porto','port-terminal-v2':'Terminal de embarque','harbor-terminal':'Terminal de embarque','cape-dock-cart':'Carrinho de carga','cape-panorama-port':'Panorama · Table Mountain','cape-panorama-street':'Panorama · Signal Hill','cape-panorama-garden':'Panorama · Kirstenbosch','cape-panorama-coast':'Panorama · False Bay','cape-mountain':'Panorama · Table Mountain'},
tile(kind){
 if(this.tiles.has(kind))return this.tiles.get(kind);
 const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d');
 const palettes={stone:['#b9b89d','#a4a98f','#c7c7ab','#dbd5b7'],cobble:['#6d8079','#62746e','#85968a','#9eaa95'],sand:['#dac396','#cdb688','#e5cfa3','#f0d9ae'],grass:['#86a375','#7e9c6a','#92ad7d','#a1b888'],path:['#c5b28d','#af9f7d','#d7c69e','#e1d1af'],wood:['#a48058','#826c4b','#b59469','#c7a774'],water:['#397f88','#347681','#418b92','#559a9b']},p=palettes[kind]||palettes.stone;
 x.fillStyle=p[0];x.fillRect(0,0,48,48);
 if(['stone','cobble','path'].includes(kind))for(let y=0;y<48;y+=12)for(let q=-12;q<48;q+=24){const z=q+(y%24?12:0);x.fillStyle=p[1];x.fillRect(z,y,23,1);x.fillRect(z,y,1,12);x.fillStyle=p[2];x.fillRect(z+2,y+2,20,1);x.fillStyle=p[3];x.fillRect(z+3,y+3,4,1);}
 else if(kind==='wood')for(let y=0;y<48;y+=8){x.fillStyle=p[1];x.fillRect(0,y,48,2);x.fillRect(y%16?16:36,y,1,8);x.fillStyle=p[2];x.fillRect(1,y+2,46,1);x.fillStyle=p[3];x.fillRect(5+(y%3)*7,y+5,14,1);}
 else for(let i=0;i<11;i++){const a=(i*19+7)%46,b=(i*29+3)%46;x.fillStyle=p[1+i%3];x.fillRect(a,b,kind==='water'?7:3,kind==='grass'?2:1);}
 this.tiles.set(kind,c);return c;
},
fill(c,kind,x,y,w,h){c.fillStyle=c.createPattern(this.tile(kind),'repeat');c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));},
panorama(c,id,width,y=0){const im=A.images.get('cape-panorama-'+id);if(!im)return 0;const h=Math.round(width*im.height/im.width);c.drawImage(im,0,Math.round(y),width,h);return h;},
rim(c,y,width){c.fillStyle='#315b4c';c.fillRect(0,Math.round(y),width,10);c.fillStyle='#97a475';c.fillRect(0,Math.round(y),width,3);},
walk(c,points,width=2.4*T){c.save();c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x*T,y*T):c.moveTo(x*T,y*T));c.strokeStyle='#597352';c.lineWidth=width+14;c.stroke();c.strokeStyle='#e1cfaa';c.lineWidth=width+6;c.stroke();c.strokeStyle=c.createPattern(this.tile('path'),'repeat');c.lineWidth=width;c.stroke();c.restore();},
pond(c,x,y){c.fillStyle='#516f53';c.beginPath();c.ellipse(x,y,3.75*T,2.45*T,0,0,Math.PI*2);c.fill();c.fillStyle='#b8ae8d';c.beginPath();c.ellipse(x,y-3,3.45*T,2.2*T,0,0,Math.PI*2);c.fill();c.fillStyle='#468b89';c.beginPath();c.ellipse(x,y-5,2.9*T,1.72*T,0,0,Math.PI*2);c.fill();c.strokeStyle='#a6c8a8';c.lineWidth=4;c.stroke();c.fillStyle='#a5c396';for(const [dx,dy]of [[-55,-8],[43,22],[16,-34]]){c.fillRect(x+dx,y+dy,14,5);c.fillRect(x+dx+3,y+dy-3,8,3);}},
regionGround(m){
 const d=D.maps[m.id],c=document.createElement('canvas');c.width=m.width*T;c.height=m.height*T;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 if(d.theme==='street'){
  this.fill(x,'stone',0,0,c.width,c.height);const h=this.panorama(x,'street',c.width);this.rim(x,h,c.width);
  this.fill(x,'cobble',20*T,8*T,6*T,27*T);this.fill(x,'cobble',T,15.7*T,44*T,4*T);this.fill(x,'cobble',T,27.4*T,44*T,2.2*T);
  for(const a of [19.8,26]){x.fillStyle='#ddd4b1';x.fillRect(a*T,8*T,8,27*T);x.fillStyle='#4f6b5b';x.fillRect(a*T+8,8*T,3,27*T);}
  for(const [art,bx,by,bw]of d.buildings){this.fill(x,'path',(bx-bw/2-.2)*T,by*T,bw*T+.4*T,.65*T);x.fillStyle='#e2d6b6';x.fillRect((bx-bw/2)*T,by*T,bw*T,4);}
  this.fill(x,'grass',2*T,30.5*T,14*T,3*T);this.fill(x,'grass',31*T,30.5*T,13*T,3*T);
  x.fillStyle='#d2bf94';x.fillRect(21*T,29.7*T,4*T,3*T);x.strokeStyle='#416e61';x.lineWidth=5;x.strokeRect(21*T+8,29.7*T+8,4*T-16,3*T-16);
 }else if(d.theme==='garden'){
  this.fill(x,'grass',0,0,c.width,c.height);const h=this.panorama(x,'garden',c.width);this.rim(x,h,c.width);
  this.walk(x,[[24,35.5],[24,30.6],[35,30.6],[35,18],[31,17.8],[17,17.8],[13,19],[13,30.6],[24,30.6]]);
  this.walk(x,[[24,30.6],[19.8,28],[19.8,22],[24,18]]);this.walk(x,[[24,30.6],[28.2,28],[28.2,22],[24,18]]);
  this.walk(x,[[5,32],[9,29.6],[13,30.6]],2*T);this.walk(x,[[43,32],[38.5,29.6],[35,30.6]],2*T);
  this.pond(x,24*T,24.8*T);
  for(const [bx,by]of [[16,20],[32,20],[16,28.1],[32,27.1]]){x.strokeStyle='#688460';x.lineWidth=5;x.strokeRect((bx-2.8)*T,(by-.9)*T,5.6*T,T);}
 }else{
  this.fill(x,'sand',0,0,c.width,c.height);const h=this.panorama(x,'coast',c.width);this.rim(x,h,c.width);
  this.fill(x,'stone',T,8*T,(m.width-2)*T,7*T);this.fill(x,'wood',T,13*T,(m.width-2)*T,1.6*T);x.fillStyle='#456a5a';x.fillRect(T,14.6*T,(m.width-2)*T,8);x.fillStyle='#e6d4ac';x.fillRect(T,14.6*T,(m.width-2)*T,3);
  for(let i=2;i<m.width-2;i+=3){x.fillStyle='#47807b';x.fillRect(i*T,9*T,18,18);x.fillStyle='#d9be8c';x.fillRect(i*T+4,9*T+4,10,10);}
  this.fill(x,'water',0,31*T,c.width,(m.height-31)*T);for(let i=0;i<5;i++){x.fillStyle=['#86b9a9','#a9d0bb','#dbdec0','#f4e7c9','#d4c599'][i];for(let bx=0;bx<c.width;bx+=24){const by=30.65*T+i*8+Math.round(Math.sin(bx/110)*2)*3;x.fillRect(bx,by,25,6);}}
  for(const [bx,by]of [[3,19],[4,25],[44,25],[46,29]]){x.fillStyle='#c5b486';x.fillRect(bx*T,by*T,2*T,3);x.fillRect((bx+.5)*T,(by+.3)*T,T,3);}
 }
 m.cache=c;
},
portGround(m){
 const d=V.MaritimeData.maps[m.id],c=document.createElement('canvas');c.width=m.width*T;c.height=m.height*T;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 this.fill(x,'water',0,0,c.width,c.height);if(m.id==='harbor'){x.fillStyle='#133f5323';x.fillRect(52*T,0,c.width-52*T,c.height);x.fillStyle='#4b9a9521';x.fillRect(23*T,39*T,29*T,c.height-39*T);}this.fill(x,'stone',0,0,d.shore*T,c.height);this.fill(x,'stone',...d.breakwater.map(n=>n*T));
 x.fillStyle='#e2d2ae';x.fillRect((d.shore-.22)*T,0,.22*T,c.height);x.fillStyle='#285e62';x.fillRect(d.shore*T,0,8,c.height);
 for(const [px,py,pw,ph]of d.piers){x.fillStyle='#225961';x.fillRect(px*T-3,py*T+10,pw*T+10,ph*T+4);this.fill(x,'wood',px*T,py*T,pw*T,ph*T);x.strokeStyle='#d1b58c';x.lineWidth=5;x.strokeRect(px*T+3,py*T+3,pw*T-6,ph*T-6);for(let k=0;k<pw;k+=2){x.fillStyle='#546658';x.fillRect((px+k)*T+12,(py+ph)*T-9,7,13);}}
 this.fill(x,'wood',(d.shore-2.1)*T,4.2*T,1.55*T,(d.height-7)*T);
 this.fill(x,'cobble',(d.shore-6)*T,7*T,2.8*T,(d.height-9)*T);
 for(const y of [16.3,28.8,35.5])this.fill(x,'path',T,y*T,(d.shore-3)*T,1.4*T);
 for(const [bx,by,bw,bh]of [[2,28,4,2],[10,33,5,2],[17,29.5,3.5,2.6]]){this.fill(x,'grass',bx*T,by*T,bw*T,bh*T);x.fillStyle='#6d8064';x.fillRect(bx*T,by*T,bw*T,5);}
 if(m.id==='cape-town'){
  const im=A.images.get('cape-panorama-port'),width=d.shore*T;if(im){const h=width*im.height/im.width;x.drawImage(im,0,0,width,h);x.fillStyle='#456b59';x.fillRect(0,h,width,8);}
 }
 m.cache=c;
},
artBox(o){const im=A.images.get(o.art);if(!im)return null;const maxW=o.w||76,maxH=o.h||76,k=Math.min(maxW/im.width,maxH/im.height),w=im.width*k,h=im.height*k;return{im,x:o.x-w/2,y:o.y-h,w,h};},
person(o){if(o.type==='sea-person'){const p=V.MaritimeData.people.find(p=>p.id===o.person);return p&&!p.sprite?{im:A.images.get('npc-'+p.id),name:p.name}:null;}if(o.type==='cape-person'){const p=D.people.find(p=>p.id===o.person);return p?{im:A.images.get(p.art),name:p.name}:null;}return null;},
draw(owner,original,c,o,cam){
 const b=['sea-building','sea-decor','cape-building','cape-decor'].includes(o.type)?this.artBox(o):null;
 if(b){if(o.seaSite){const x=o.x-cam.x,y=o.y-cam.y,r=o.siteRadius;c.fillStyle='#165367';c.beginPath();c.ellipse(x+8,y+8,r+18,r*.55+12,0,0,Math.PI*2);c.fill();c.fillStyle='#b5ad86';c.beginPath();c.ellipse(x,y,r,r*.5,0,0,Math.PI*2);c.fill();c.fillStyle='#ddca9d';c.beginPath();c.ellipse(x-5,y-5,r*.9,r*.43,0,0,Math.PI*2);c.fill();}c.drawImage(b.im,Math.round(b.x-cam.x),Math.round(b.y-cam.y),b.w,b.h);return;}
 const p=this.person(o);if(p?.im){const h=64,w=h*p.im.width/p.im.height;c.drawImage(p.im,Math.round(o.x-cam.x-w/2),Math.round(o.y-cam.y-h),w,h);if(V.World.nearest?.id===o.id)M.label(c,p.name,o.x-cam.x,o.y-cam.y-77,true);return;}
 return original.call(owner,c,o,cam);
},
shadow(owner,original,c,o,cam){
 const b=['sea-building','sea-decor','cape-building','cape-decor'].includes(o.type)?this.artBox(o):null;
 if(b)return V.GroundedArt.shadow(c,b.im,o.x-cam.x,o.y-cam.y,b.w,b.h,{indoor:false,alpha:o.type.endsWith('building')?.18:.21});
 const p=this.person(o);if(p?.im){const h=64,w=h*p.im.width/p.im.height;return V.GroundedArt.shadow(c,p.im,o.x-cam.x,o.y-cam.y,w,h,{indoor:false,alpha:.2});}
 return original.call(owner,c,o,cam);
}
};
A.boat=function(c,type,x,y,angle,size=100,occupied=false){const im=this.images.get('boat-'+type);if(!im)return;const h=size,w=size*im.width/im.height;V.SceneShadows.contact(c,x+4,y+8,Math.max(12,w*.32),Math.max(6,h*.13),.17);c.save();c.translate(x,y);c.rotate(angle);c.imageSmoothingEnabled=false;c.drawImage(im,-w/2,-h/2,w,h);c.restore();if(occupied)V.Animations.draw(c,V.state.character,'sit',x,y+12,size*.4,0,false,true);};
for(const asset of V.sceneAssets.filter(a=>a.family==='maritime')){const key=V.MaritimeData.assets[asset.index];if(P.labels[key])asset.name=P.labels[key];}
R.portLinks=function(m){if(!m||m.id!=='cape-town')return;for(const[to,x,y]of [['bo-kaap',4,18],['kirstenbosch',21.5,32.3],['muizenberg',26.3,37]]){const id='cape-access-'+to;if(!m.objects.some(o=>o.id===id))m.objects.push({id,type:'travel',...M.point([x,y]),to,capeLink:true,interactionRange:100,label:'Seguir para '+D.maps[to].short});}if(!m.objects.some(o=>o.id==='cape-routes-desk'))m.objects.push({id:'cape-routes-desk',type:'cape-routes',...M.point([22,18.4]),label:'Conhecer as Rotas do Cabo',interactionRange:96});};
V.CoastalExploration.ground=function(m){if(!this.isCoast(m)||!m.cache)return;const d=this.regions[m.id],c=m.cache.getContext('2d');c.save();c.imageSmoothingEnabled=false;if(d.shore)P.fill(c,'water',25*T,0,(m.width-25)*T,m.height*T);else P.fill(c,'water',0,31.6*T,m.width*T,(m.height-31.6)*T);c.fillStyle='#205e7030';if(d.shore)c.fillRect(42*T,0,(m.width-42)*T,m.height*T);else c.fillRect(0,46*T,m.width*T,(m.height-46)*T);const dock=V.SeaNavigation.dockPoints(m).land;c.fillStyle='#526d5a';c.fillRect(dock.x-52,dock.y-20,104,43);P.fill(c,'wood',dock.x-49,dock.y-18,98,36);for(const s of d.sites){const at=M.point(s.at);V.SceneShadows.contact(c,at.x+9,at.y+14,s.radius,s.radius*.42,.2);c.fillStyle='#c8b588';c.beginPath();c.ellipse(at.x,at.y,s.radius,s.radius*.65,0,0,Math.PI*2);c.fill();c.fillStyle='#e4cea0';c.beginPath();c.ellipse(at.x-4,at.y-5,s.radius*.88,s.radius*.52,0,0,Math.PI*2);c.fill();for(const [key,maxW,maxH]of [['cape-rocks',s.radius*1.5,s.radius*.8],[s.art,s.radius*1.4,s.radius*1.7]]){const im=A.images.get(key);if(!im)continue;const k=Math.min(maxW/im.width,maxH/im.height),w=im.width*k,h=im.height*k;V.GroundedArt.shadow(c,im,at.x,at.y,w,h,{indoor:false,alpha:.18});c.drawImage(im,at.x-w/2,at.y-h,w,h);}}c.restore();};
R.ground=m=>{P.regionGround(m);if(m.id==='muizenberg')V.CoastalExploration.ground(m);};M.ground=m=>P.portGround(m);
for(const owner of [R,M]){const draw=owner.drawObject,shadow=owner.shadow;owner.drawObject=function(c,o,cam){return P.draw(this,draw,c,o,cam);};owner.shadow=function(c,o,cam){return P.shadow(this,shadow,c,o,cam);};}
const additions={
'bo-kaap':[['cape-planter',7.5,18.2,1.1,1.3],['cape-planter',36.5,18.2,1.1,1.3],['cape-planter',7,29.3,1.1,1.3],['cape-planter',39,29.3,1.1,1.3],['cape-restios',5,32.5,2.2,1.6],['cape-restios',40,32.5,2.2,1.6]],
'kirstenbosch':[['cape-silver-tree',5,11,4,5],['cape-silver-tree',13,12,4,5],['cape-silver-tree',36,12,4.5,5.5],['cape-silver-tree',44,11.5,4.5,5.5],['cape-restios',8,21,3,2],['cape-restios',40,21,3,2],['cape-restios',8,29.2,3,2],['cape-restios',39.8,29.2,3,2],['cape-fynbos',4.5,35,3,2],['cape-fynbos',43.5,35,3,2]],
'muizenberg':[['cape-dune-grass',4,21.5,3,2],['cape-dune-grass',5,27,3,2],['cape-dune-grass',45,28.5,3,2],['cape-dune-grass',46,22.2,3,2],['cape-surfboards',30,24,2.4,3],['cape-surfboards',37,16.5,2.4,3]]
};
for(const[id,rows]of Object.entries(additions))D.maps[id].decor.push(...rows);
D.maps.muizenberg.links.find(row=>row[0]==='cape-town')[2]=8;
for(const d of [R.defaults.muizenberg,V.Cozy.layouts.muizenberg,V.SceneDesign.defaults.muizenberg,V.SceneDesign.raw.muizenberg])Object.assign(d,{width:D.maps.muizenberg.width,height:D.maps.muizenberg.height});
for(const d of [V.Cozy.layouts.beach,V.SceneDesign.defaults.beach,V.SceneDesign.raw.beach])if(d)Object.assign(d,{width:V.CoastalExploration.regions.beach.width,height:V.CoastalExploration.regions.beach.height});
const build=R.build;R.build=function(...args){const m=build.apply(this,args);m.solids.push({x:T,y:T,w:(m.width-2)*T,h:5*T,owner:'cape-background'});return m;};
for(const owner of [R,M]){const draw=owner.drawObject;owner.drawObject=function(c,o,cam){if(o.scene?.kind==='seat'&&!o.scene.family){const im=A.images.get('cape-bench');if(im){const w=90,h=w*im.height/im.width;c.drawImage(im,o.x-cam.x-w/2,o.y-cam.y-h,w,h);return;}}return draw.call(this,c,o,cam);};}
})();
