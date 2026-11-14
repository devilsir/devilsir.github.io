/* Registered module: plaza-visuals */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("plaza-visuals", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
/* Small, crisp shapes use the same three-pixel rhythm as the world sprites. */
(function(){
'use strict';
const V=window.V,W=V.World,T=48;
/* Authored blocks keep destinations, chapter gates and walking paths together. */
const layout=V.Cozy.layouts.hub, D=V.SceneDesign;
const travel={
  'animal-museum-entry':[18.1,7.6], 'travel-african-words-hub':[25.9,7.6],
  'travel-park':[5.5,13.3], 'nature-brasil-entry':[11.5,13.3], 'travel-play-museum-hub':[17.5,13.3],
  'campus-travel-hub-school':[30.5,13.3], 'campus-travel-hub-museum':[36.5,13.3], 'travel-garden':[42.5,13.3],
  'city-restaurant':[9.6,21], 'food-museum-entry':[15.8,21], 'city-university':[32.2,21],
  'salon-entry-hub':[38.6,21], 'travel-harbor-hub':[44.1,19.3],
  'travel-market':[5.3,25.2], 'travel-beach':[42.6,25.2], 'waypoint-hub':[24,24.2],
  'portal-1':[7.8,30.6], 'portal-2':[14.25,30.6], 'portal-3':[20.75,30.6],
  'portal-4':[27.25,30.6], 'portal-5':[33.75,30.6], 'portal-6':[40.2,30.6]
};
const landmarks={
  'hub-pix':[24,20.9], 'hub-nia':[21.9,21], 'hub-student':[36,16.1],
  'guide':[23.9,26.15], 'terminal-hub':[29.2,25.2], 'word-runner':[10.6,25.2],
  'community-board':[6.5,8.7], 'parcel':[6.7,10.35], 'resident-courier':[9.1,10.4],
  'hub-record':[12.8,16.7], 'note-01':[12.1,8.35], 'note-02':[34,9.25],
  'history-hub':[27.4,10.35], 'neighbor-paulo':[40,24.2],
  'neighbors-pet-4':[39.2,24.1], 'animal-hub-0':[12.2,23.2], 'animal-hub-1':[25.9,20],
  'animal-hub-2':[40,7.5], 'coast-hub-cat':[10.5,9.8],
  'zambeto-companion-hub':[22.8,19.9], 'place-life-visitante-praca':[19.5,20.2],
  'community-arcade-kiosk':[18.6,25.1], 'city-door-hub-neighborhood':[42.3,21.7],
  'pix-discovery-hub-0':[16.3,25.45], 'pix-discovery-hub-1':[25.6,22.3],
  'pix-discovery-hub-2':[33.8,24.1],
  'pix-vocabulary-city-b5yik':[4.6,16.5], 'pix-vocabulary-shop-bg5fr':[6,23.4],
  'pix-vocabulary-now-d739':[18.6,9.75], 'pix-vocabulary-new-d6un':[13.7,9.1],
  'pix-vocabulary-quest-9u16y9':[22.3,8.9], 'pix-vocabulary-missing-agjos5':[19.4,23.7],
  'pix-vocabulary-both-b5fyq':[29.2,22.2], 'pix-vocabulary-prepare-1mjdxw6':[9.1,23.1]
};
const furnishings=[
  [4.4,7.6],[11.7,6.8],[5.7,21.3],[4.1,14.7],[29.9,24.8],[30.7,25.8],
  [18,15.4],[28,17.8],[36.2,14.6],[4.3,17.4],[42.8,15.5],[30,3],
  [6.3,18.6],[35.7,14.25]
];
const scenePositions={
  'square-water-left':[19.3,17.6],'square-water-right':[28.7,17.6],
  'square-tea':[10.5,23.1],'square-news':[5.25,8.95],
  'square-guitar':[37.5,17],'furnishings-discovery-hub':[12.35,7.9],
  'square-fountain-water':[24,19.1]
};
function author(d){
  Object.assign(d,{
    width:48,height:35,spawn:[23.5,23],meeting:[18.6,23.3],
    purpose:'A fonte liga o polo cultural ao norte, a feira a oeste, o campus a leste e os seis capítulos ao sul.',
    outline:[[6,1],[42,1],[47,7],[47,27],[42,34],[6,34],[1,27],[1,7]],
    paths:[
      [6.5,7.45,35,2.4],[16.8,8.5,3.1,5.9],[24.4,8.5,3.1,5.9],
      [4.3,13.4,39.4,2.1],[22.45,9.6,3.1,18.4],[6,17.5,36,2.2],
      [4.2,21.2,39.5,2.1],[7.5,23.2,3.1,4.7],[30.6,22.4,3.1,5.5],
      [4.8,26.4,38.1,1.8],[6.9,30.65,34.2,2],[22.45,27.2,3.1,4.5],
      ...[7.8,14.25,20.75,27.25,33.75,40.2].map(x=>[x-.72,28.1,1.44,2.7])
    ],
    zones:[['Polo cultural',6,3,36,7],['Fonte e descanso',19,14,10,7],
      ['Feira e cozinha',5,18,13,8],['Campus e oficinas',30,12,13,13],
      ['Portais da história',7,28,34,5]],
    anchors:[['observe-water',22.2,18.85,'observing',16,3],['mail-sort',7.4,9.9,'working',12,1]]
  });
  for(const [i,b] of d.buildings.entries()) b.x=i===0?4.5:34.2;
  d.positions={...d.positions,...Object.fromEntries(Object.entries({...travel,...landmarks}).map(([id,[x,y]])=>[id,[x-.5,y-.5]]))};
  d.positions['door-library']=[8.5,6.1]; d.positions['door-room-6']=[38.2,7.1];
  for(const row of d.decor){
    const id=row[6]?.id;
    if(id==='square-fountain-furniture') [row[2],row[3]]=[22,15.1];
    const index=/^region-hub-(\d+)$/.exec(id);
    if(index) [row[2],row[3]]=furnishings[+index[1]];
  }
  for(const scene of d.scenes){
    const pos=scenePositions[scene.id];if(pos) [scene.x,scene.y]=[pos[0]-.5,pos[1]-.5];
  }
}
author(layout);
author(D.defaults.hub);

const portalPoints={...travel,...landmarks};
const previewDestinations=new Set([...Object.keys(travel),'city-door-hub-neighborhood']);
const preview=D.preview.bind(D);
D.preview=function(id,d){
  const m=preview(id,d);
  if(id!=='hub')return m;
  const live=W.maps.hub;
  if(live)for(const o of live.objects){
    if(!previewDestinations.has(o.id)||m.objects.some(q=>q.id===o.id)||(d.removedObjects||[]).includes(o.id))continue;
    m.objects.push({...o});
  }
  V.PlazaLayout.install(m,d);
  return m;
};

function shift(m,o,x,y){
  const dx=x-o.x,dy=y-o.y;
  o.x=x;o.y=y;
  for(const solid of m.solids)if(solid.owner===o.id||solid.owner==='host-'+o.id){solid.x+=dx;solid.y+=dy;}
  for(const d of m.decor||[])if(d.linked===o.id){d.x+=dx;d.y+=dy;for(const s of m.solids)if(s.owner===d.id){s.x+=dx;s.y+=dy;}}
  for(const a of m.anchors?.values()||[])if(a.object===o||a.id===o.id||a.id==='home-'+o.id){a.x+=dx;a.y+=dy;}
  if(o.home)Object.assign(o.home,{x,y});
  if(o.patrol)for(const point of o.patrol){point.x+=dx;point.y+=dy;}
  const original=D.objectRegistry.hub?.[o.id];
  if(original)Object.assign(original,{x,y});
}
V.PlazaLayout={
  museum:{w:266,h:224},
  destinationNames:{
    'travel-park':'Parque das Pontes', 'campus-travel-hub-school':'Escola Aberta',
    'campus-travel-hub-museum':'Museu das Vozes', 'travel-garden':'Horta Comunitária',
    'travel-market':'Feira das Histórias', 'travel-beach':'Praia das Marés',
    'city-door-hub-neighborhood':'Bairro das Janelas'
  },
  drawDestination(c,o,cam){
    const name=W.current?.plazaPlanned&&this.destinationNames[o.id];
    if(!name)return false;
    const x=o.x-cam.x,y=o.y-cam.y,near=W.nearest?.id===o.id;
    if(x< -110||y< -30||x>c.canvas.width+110||y>c.canvas.height+100)return true;
    c.save();c.fillStyle='#766343';
    for(const dx of [-51,49])c.fillRect(x+dx,y-42,5,42);
    V.WorldSigns.draw(c,name,x,y-37,{maxWidth:184,active:near});
    c.restore();
    if(near)V.Living.marker(c,x,y+12,'E','#e8d2a2');
    return true;
  },
  install(m,design=m?.design){
    if(!m||m.plazaPlanned)return;

    m.plazaPlanned=true;
    m.solids=m.solids.filter(s=>!(s.x===14*T&&s.y===9*T&&s.w===4*T&&s.h===3*T));
    for(const o of m.objects){
      const point=portalPoints[o.id];
      if(!point)continue;
      const override=design.positions?.[o.id];
      const final=override?[override[0]+.5,override[1]+.5]:point;
      shift(m,o,final[0]*T,final[1]*T);
    }
    if(m===W.maps.hub)for(const o of m.objects.filter(o=>previewDestinations.has(o.id))){
      D.objectRegistry.hub[o.id]||={...o};
    }
    m.geometryRevision=(m.geometryRevision||0)+1;
    m.cache=null;
  }
};

const Art=V.PlazaArt={facade:null,grounds:new WeakMap(),
 surface(c,m,cam){
  if(!m.cache)return;let layer=this.grounds.get(m.cache);
  if(!layer){layer=document.createElement('canvas');layer.width=m.cache.width;layer.height=m.cache.height;const ctx=layer.getContext('2d');
   ctx.save();if(m.design.outline?.length){ctx.beginPath();m.design.outline.forEach(([x,y],i)=>i?ctx.lineTo(x*T,y*T):ctx.moveTo(x*T,y*T));ctx.closePath();ctx.clip();}
   this.ground(ctx,m);ctx.restore();this.grounds.set(m.cache,layer);
  }
  c.drawImage(layer,Math.round(-cam.x),Math.round(-cam.y));
 },
 ground(c,m){
  const f=m.decor.find(o=>o.id==='square-fountain-furniture'),legacy=m.objects.find(o=>o.type==='fountain');
  const fx=f?f.x+f.size/2:legacy?.x??16*T,fy=f?f.y+f.size*.75:(legacy?.y??12.7*T)-1.9*T;
  const paths=[...(m.design.paths||[])];
  if(f && !m.plazaPlanned)paths.push([fx/T-7,(fy+14)/T-.75,14,1.5],[fx/T-.75,(fy+14)/T-5.2,1.5,10.4]);
  const onPath=(x,y)=>paths.some(([a,b,w,h])=>x>=a*T&&x<(a+w)*T&&y>=b*T&&y<(b+h)*T);
  // Keep the authored paths and their collisions; only dress their surface.
  c.save();c.beginPath();for(const[x,y,w,h]of paths)c.rect(x*T,y*T,w*T,h*T);c.clip();
  const tones=['#81887a','#8a8e7d','#90927f','#858c7c'];
  for(let y=0;y<m.height*T;y+=24)for(let x=-24;x<m.width*T;x+=48){
   const xx=x+(y/24%2)*24,n=(Math.floor((xx+24)/24)*17+y/24*31)>>>0;
   c.fillStyle='#657769';c.fillRect(xx,y,48,24);
   c.fillStyle=tones[n%4];c.fillRect(xx+2,y+2,44,20);
   c.fillStyle='#bbc0a32a';c.fillRect(xx+3,y+2,42,2);
   if(n%7===0){c.fillStyle='#556c5c44';c.fillRect(xx+8,y+16,6,2);}
  }
  c.restore();
  // A low mosaic surrounds the fountain without adding an obstacle.
  const oval=(rx,ry,color)=>V.Cozy.pixelOval(c,fx,fy+14,rx,ry,color);
  oval(175,104,'#566f60');oval(169,98,'#c0b48f');oval(160,91,'#8b9681');oval(148,82,'#a4a68a');
  for(let i=0;i<32;i++){
   const a=i*Math.PI/16,x=Math.round((fx+Math.cos(a)*160)/3)*3,y=Math.round((fy+14+Math.sin(a)*92)/3)*3;
   c.fillStyle=i%4===0?'#d7c38e':'#657d6c';c.fillRect(x-3,y-3,6,6);
  }
  for(let i=0;i<16;i++)for(let r=78;r<148;r+=6){const a=i*Math.PI/8;c.fillStyle='#88967d';c.fillRect(Math.round((fx+Math.cos(a)*r)/3)*3,Math.round((fy+14+Math.sin(a)*r*.55)/3)*3,3,3);}
  // Moss, grass and tiny flowers soften the edge of the paving.
  for(let y=36;y<m.height*T-36;y+=24)for(let x=36;x<m.width*T-36;x+=24){
   if(onPath(x,y)||((x-fx)/175)**2+((y-fy-14)/104)**2<1)continue;const n=(x*13+y*29)>>>0;
   c.fillStyle=n%3?'#497461':'#3c6655';c.fillRect(x,y,6,3);
   if(n%5===0){c.fillRect(x+6,y-3,3,6);c.fillStyle='#70906a';c.fillRect(x+3,y-3,3,3);}
   if(n%17===0&&[[-14,0],[14,0],[0,14],[0,-14]].some(([a,b])=>onPath(x+a,y+b))){
    c.fillStyle=n%2?'#e2c78a':'#acb9b1';c.fillRect(x,y-6,3,3);
   }
  }
 },
 fountain(c,cam){
  const x=16*T-cam.x,y=10.8*T-cam.y,t=V.settings.reducedMotion?0:V.Engine.time;
  const oval=(dx,dy,rx,ry,color)=>V.Cozy.pixelOval(c,x+dx,y+dy,rx,ry,color);
  const px=(xx,yy,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(xx/3)*3,Math.round(yy/3)*3,w,h);};
  oval(6,40,116,44,'#17332b60');oval(0,31,113,43,'#586c62');oval(0,24,113,40,'#aaa88e');
  oval(0,21,103,32,'#476e70');oval(0,20,95,26,'#528c8a');oval(0,17,86,20,'#659e96');
  for(let i=0;i<9;i++){
   const xx=x-75+(i*37)%150,yy=y+8+(i*13)%25;
   px(xx+Math.sin(t*.8+i)*3,yy,9+(i%3)*3,3,i%2?'#94c6b4':'#76b3a9');
  }
  // A stepped stone column and a shallow upper bowl.
  px(x-17,y-38,33,66,'#6d8070');px(x-17,y-38,9,63,'#b5b399');px(x+10,y-35,6,63,'#526e63');
  oval(0,-33,44,14,'#65796c');oval(0,-40,44,12,'#c3c1a3');oval(0,-42,35,7,'#598e88');
  oval(0,-43,29,4,'#9ecfbc');
  // Pixel streams trace curved arcs rather than rigid vertical bars.
  for(const side of [-1,1])for(let j=0;j<=20;j++){
   const u=j/20,xx=x+side*(31+16*Math.sin(u*Math.PI/2)),yy=y-40+65*u*u;
   px(xx-3,yy,6,6,'#8dc8bd');
   if((j+Math.floor(t*16))%7<3)px(xx,yy,3,6,'#d1edda');
  }
  for(let j=0;j<12;j++){
   const u=j/11,xx=x+Math.sin(u*2.5)*3,yy=y-42-34*Math.sin(u*Math.PI/2);
   px(xx-3,yy,6,6,j%3?'#b5dfcf':'#e1f3df');
  }
  for(const side of [-1,1]){
   const phase=(t*.85+(side+1)*.22)%1;
   for(let i=0;i<4;i++){
    const u=(phase+i/4)%1;
    px(x+side*(44+Math.sin(u*Math.PI)*10),y+24-20*Math.sin(u*Math.PI),3,3,'#d8f0da');
   }
   oval(side*48,25,12+phase*13,3+phase*2,'#a5d3bf');
   oval(side*48,25,7,3,'#d5ead1');
  }
  // Small joints and highlights follow the front rim, below the splash pools.
  for(let i=0;i<8;i++){const a=(i+1)*Math.PI/9;px(x+Math.cos(a)*106,y+23+Math.sin(a)*38,3,6,'#879480');}
  px(x-64,y+54,33,3,'#ded0a8');px(x+28,y+54,35,3,'#ded0a8');
 },
 museumFacade(c,x,y){
  if(!this.facade){
   const s=document.createElement('canvas');s.width=76;s.height=64;const p=s.getContext('2d');
   const r=(a,b,w,h,color)=>{p.fillStyle=color;p.fillRect(a,b,w,h);};
   // Warm plaster, dark green shutters and tiled terracotta use the plaza palette.
   r(6,24,64,35,'#635f4c');r(7,23,62,33,'#c0b591');r(10,24,56,30,'#e0cba0');
   r(24,13,28,43,'#b6a37a');r(26,13,24,41,'#ead4a8');r(27,14,3,39,'#f1dfb5');
   r(3,21,70,4,'#314e3f');r(5,19,66,3,'#8b5d40');r(8,17,60,2,'#ab714b');
   for(let row=0;row<5;row++){
    const inset=row*3;r(19+inset,12-row*2,38-inset*2,2,row%2?'#b5794f':'#c08d5b');
   }
   r(22,13,32,3,'#315748');r(25,16,26,2,'#d7bb84');
   for(const wx of [12,55])for(const wy of [28,43]){
    r(wx,wy-1,9,12,'#9d8e6a');r(wx+2,wy,5,10,'#284b41');r(wx+3,wy+1,3,7,'#bdc6a3');
    r(wx,wy+1,2,9,'#41694e');r(wx+7,wy+1,2,9,'#41694e');r(wx+4,wy+1,1,8,'#68765a');r(wx,wy+10,9,2,'#f0dbab');
   }
   for(const wx of [29,40]){r(wx,20,7,12,'#9d8e6a');r(wx+1,21,5,9,'#315749');r(wx+2,22,3,6,'#aebc99');r(wx+3,22,1,8,'#e7c98e');}
   r(26,32,24,3,'#c4b58a');r(27,35,22,2,'#315c47');
   for(let xx=28;xx<50;xx+=3)r(xx,31,1,5,'#315c47');
   r(30,38,16,5,'#315747');r(31,39,14,1,'#dbc58e');
   r(31,45,14,12,'#8e805b');r(33,44,10,14,'#294f41');r(34,46,8,11,'#476953');r(35,47,6,10,'#a59163');r(37,48,2,9,'#d5b774');
   for(const xx of [9,23,51,65]){r(xx,25,2,30,'#b69e72');r(xx-1,25,4,2,'#eddbb0');}
   r(7,55,62,3,'#8a8c75');r(25,58,26,2,'#c5bc98');r(23,60,30,2,'#a7a78b');r(21,62,34,2,'#7a8c77');
   for(const xx of [5,65]){r(xx+1,52,5,6,'#a67450');r(xx,50,7,2,'#cb9b66');r(xx+2,43,3,7,'#436c43');r(xx-1,46,9,3,'#668451');r(xx+1,42,5,3,'#7f965b');}
   this.facade=s;
  }
  const {w,h}=V.PlazaLayout.museum;
  c.save();c.imageSmoothingEnabled=false;
  V.Cozy.pixelOval(c,x+5,y+2,w*.46,19,'#17332b50');
  c.drawImage(this.facade,Math.round(x-w/2),Math.round(y-h),w,h);
  c.restore();
 }
};
// The plaza's current fountain is a movable decoration. Keep its authored
// size, position, layering and editor transforms, and replace only its art.
const prop=V.Cozy.prop.bind(V.Cozy);
V.Cozy.prop=function(c,family,index,x,y,size=T,...rest){
 if(family!=='fountain'||index!==12)return prop(c,family,index,x,y,size,...rest);
 c.save();c.translate(x+size/2,y+size*.65);c.scale(size/240,size/240);
 Art.fountain(c,{x:16*T,y:10.8*T});c.restore();
};
if(V.World.maps.hub)V.World.maps.hub.cache=null;
})();

});
