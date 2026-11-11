/* Registered module: residential-interiors */
(function(initialize){if(window.VoicesModules)window.VoicesModules.define('residential-interiors',initialize);else initialize();})(function(){
  'use strict';
  const V=window.V,H=V.Homestead,C=V.Cozy,R=V.Rooms,W=V.World,D=V.SceneDesign,T=48;
  const {plans,palettes}=V.ResidentialPlans;
  const copy=value=>JSON.parse(JSON.stringify(value));
  const items=new Map(H.catalog.map(item=>[item.id,item]));
  const legacy={},authored={};
  const offsets=[.36,.52,.69,.28,.62,.44];
  const beds=['bed-teal','design-platform-bed','interior-indigo-bed','bed-rose','design-rounded-bed','apartment-daybed-teal','design-canopy','design-drawer-daybed','apartment-bunk-sage'];
  const seats=['interior-olive-sofa','design-curved-sofa','sofa-clay','interior-reading-chaise','apartment-chaise-mustard','sofa-sage','daily-reading-bench'];
  const tables=['table-round','interior-breakfast-nook','design-oval-dining','apartment-folding-table','daily-breakfast','interior-conversation-table'];
  const storage=['wardrobe-rattan','design-woven-wardrobe','apartment-woven-wardrobe','dresser-walnut','design-storage-bench','interior-textile-chest'];
  const greenery=['interior-plant-steps','plant-monstera','plant-cactus','design-botanic-console','daily-greenhouse'];
  const entryFurniture=['design-shoe-bench','interior-entry-cubby','entry-console','daily-entry','design-coat-stand','design-lamp-table'];

  function outline(w,h,shape){
    const forms={
      studio:[[0,0],[w,0],[w,h],[0,h]],
      porch:[[0,0],[w,0],[w,h-2.5],[w-4.5,h-2.5],[w-4.5,h],[0,h]],
      alcove:[[0,0],[w,0],[w,h],[3.4,h],[3.4,h-2],[0,h-2]],
      bay:[[0,0],[w,0],[w,h-1.5],[w-4,h-1.5],[w-4,h],[4,h],[4,h-1.5],[0,h-1.5]],
      loft:[[0,0],[w,0],[w,h],[w*.43,h],[w*.43,h-2.8],[0,h-2.8]],
      balcony:[[0,0],[w,0],[w,h-1.8],[w-3,h-1.8],[w-3,h],[w-8,h],[w-8,h-1.8],[0,h-1.8]]
    };
    return forms[shape];
  }

  function furniture(scene,item){
    Object.assign(scene,{family:item.family,prop:item.prop,size:item.size,title:item.name,text:item.description||item.name});
  }

  function build(plan,index){
    const [id,w,h,shape,bedrooms,scheme,palette,feature]=plan;
    const d=copy(C.layouts[id]),p=palettes[palette],c=d.construction,room=c.rooms[0];
    const apartment=id.startsWith('interior-horizonte-');
    const mirror=scheme===1||scheme===3||scheme===5;
    const point=(x,y)=>[(2+(mirror?w-x:x))*T,(4+y)*T];
    const local=outline(w,h,shape);
    const shell=local.map(([x,y])=>point(x,y));
    room.polygon=shell;room.shape=shell.length===4?'rectangle':'custom';room.floorStyle=p.floor;room.walls=[];
    d.outline=shell.map(point=>point.map(n=>n/T));
    d.width=Math.max(d.width,w+4);d.height=Math.max(d.height,h+6);d.floor='parquet';d.rugs=[];
    d.adventure.architecture.walls=d.adventure.architecture.walls.filter(wall=>!wall.id.startsWith('city-bath-partition-'));
    d.adventure.architecture.windows=[];
    const oldDoors=c.doors.filter(door=>!door.internalHome&&door.to?.map!==id);
    c.doors=[];
    const blocked=[];
    const entryPoint=()=>{
      if(scheme===5&&!apartment)return [w,h-4];
      const goal=w*offsets[scheme];
      const edges=local.map((a,i)=>[a,local[(i+1)%local.length]]).filter(([a,b])=>a[1]===b[1]&&a[1]>=h-3&&Math.abs(a[0]-b[0])>=4);
      const points=edges.map(([a,b])=>[V.clamp(goal,Math.min(a[0],b[0])+1.9,Math.max(a[0],b[0])-1.9),a[1]]);
      return points.sort((a,b)=>Math.abs(a[0]-goal)-Math.abs(b[0]-goal)||b[1]-a[1])[0];
    };
    const entry=entryPoint();
    for(const old of oldDoors){
      const [x,y]=point(...entry),width=apartment?60:64+(scheme%3)*4;
      const anchored=R.doorAt(d,{x,y},{width});
      const door={...old,...Object.fromEntries(['x','y','room','wall','u','normal','facing'].map(key=>[key,anchored[key]])),width,height:apartment?108:116,appearance:p.doors[0]};
      c.doors.push(door);room.entrance=door.id;blocked.push({x:entry[0],y:entry[1],r:2.05});
      const inside={x:door.x+door.normal.x*58,y:door.y+door.normal.y*58};
      d.spawn=[inside.x/T-.5,inside.y/T-.5];
    }

    const privateY=Math.round(h*[.42,.38,.43,.40,.36,.46][scheme]*4)/4;
    const bathWidth=apartment?3.9+scheme%3*.25:4.3+scheme%3*.3;
    const privateW=w-bathWidth;
    const cuts=[0,...Array.from({length:bedrooms-1},(_,i)=>Math.round((privateW*(i+1)/bedrooms+(scheme%3-1)*.48)*4)/4),privateW,w];
    const wall=(id,x,y,xx,yy)=>room.walls.push({id,a:point(x,y),b:point(xx,yy)});
    wall('home-divider-rooms',0,privateY,w,privateY);
    cuts.slice(1,-1).forEach((x,i)=>wall('home-divider-room-'+i,x,0,x,privateY));
    const zone=(name,x,y,width,height,floor)=>({name,x,y,w:width,h:height,floor});
    const privateRooms=cuts.slice(0,-1).map((x,i)=>zone(i===bedrooms?'Banheiro':'Quarto '+(i+1),x,0,cuts[i+1]-x,privateY,i===bedrooms?p.tile:p.floor));
    const publicDepth=h-privateY-2.8;
    const kitchenWidth=w*(scheme===4?.51:scheme===2?.43:.40);
    const kitchen=zone(apartment?'Cozinha integrada':'Cozinha',0,privateY,kitchenWidth,publicDepth,p.tile);
    const living=zone(apartment?'Estar e jantar':'Sala de estar',kitchenWidth,privateY,w-kitchenWidth,publicDepth,p.floor);
    for(const [i,z] of privateRooms.entries()){
      const dx=z.x+z.w*(i===bedrooms?.58:i%2===0?.58:.44);
      const [x,y]=point(dx,privateY),bath=i===bedrooms,width=bath?54:58+(i%2)*4;
      const door=R.doorAt(d,{x,y},{id:'home-inner-'+id+'-'+i,name:z.name,width,height:bath?98:108,appearance:p.doors[bath?2:1],mode:'auto'});
      door.internalHome=true;door.to={map:id,room:room.id,door:door.id,arrival:{x,y:y+44,dir:0}};
      c.doors.push(door);blocked.push({x:dx,y:privateY,r:1.52});
    }
    if(!apartment&&(scheme===2||scheme===4)){
      const left=privateY+1.9,right=privateY+5.1;
      wall('home-divider-kitchen',kitchenWidth,left,kitchenWidth,right);
      const [x,y]=point(kitchenWidth,(left+right)/2);
      const door=R.doorAt(d,{x,y},{id:'home-inner-'+id+'-kitchen',name:'Passagem da cozinha',type:'arch',width:78,height:116,appearance:20,mode:'auto'});
      door.internalHome=true;door.to={map:id,room:room.id,door:door.id,arrival:{x:x+40,y,dir:0}};
      c.doors.push(door);blocked.push({x:kitchenWidth,y:(left+right)/2,r:1.45});
    }
    const pixelZone=z=>{const [x,y]=point(z.x,z.y),[xx]=point(z.x+z.w,z.y);return {name:z.name,rect:{x:Math.min(x,xx),y,w:z.w*T,h:z.h*T},floor:z.floor};};
    d.homeRooms=[...privateRooms,kitchen,living].map(pixelZone);
    const accent=shape==='balcony'?3:shape==='bay'?5:shape==='alcove'?2:shape==='loft'?4:scheme%2;
    const windows=[];
    function windowAt(x,y,width,look,view){
      const [wx,wy]=point(x,y),hit=R.nearestWall(d,{x:wx,y:wy});
      if(!hit||!hit.key.startsWith('edge-')||hit.distance>1)return;
      const len=Math.hypot(hit.b[0]-hit.a[0],hit.b[1]-hit.a[1]);
      if(Math.min(hit.u,1-hit.u)*len<width/2+10||[...c.doors,...windows].some(o=>Math.hypot(o.x-wx,o.y-wy)<(o.width+width)/2+18))return;
      windows.push({id:'home-window-'+id+'-'+windows.length,room:room.id,wall:hit.key,u:hit.u,x:wx,y:wy,width,look,view,urban:apartment});
    }
    privateRooms.forEach((z,i)=>windowAt(z.x+z.w*.5,0,i===bedrooms?54:Math.min(126,z.w*T*.48),i===bedrooms?4:(accent+i)%6,p.views[i%3]));
    // Vary the cutaway. A side window also gives its segment a full wall face.
    if(scheme===1||scheme===4)windowAt(w,privateY+1.5,apartment?96:118,accent,p.views[0]);
    if(scheme===2||(!apartment&&scheme===5))windowAt(0,privateY+1.7,108,(accent+2)%6,p.views[1]);
    if(windows.length<3){
      const z=privateRooms[0];
      windowAt(z.x+z.w*.18,0,70,(accent+1)%6,p.views[1]);
    }
    d.homeWindows=windows;

    const placements=[];
    const furnitureType=s=>V.HomeLiving.item({scene:s});
    const inset=([x,y],r=16)=>[[-r,0],[r,0],[0,-r],[0,r]].every(([dx,dy])=>R.pointIn(x+dx,y+dy,shell));
    const actualWalls=R.wallPieces(d);
    const fill=(scene,z,fx,fy,itemId)=>{
      if(itemId&&items.has(itemId))furniture(scene,items.get(itemId));
      const originalSize=scene.size||2;
      scene.size=apartment?Math.min(originalSize,2.45):Math.min(originalSize,2.9);
      const x0=z.x+z.w*fx,y0=z.y+z.h*fy;
      const available=(x,y)=>{
        const pos=point(x,y);
        if(!inset(pos,scene.size*13)||blocked.some(b=>Math.hypot(x-b.x,y-b.y)<b.r))return false;
        if(actualWalls.some(w=>R.distSeg({x:pos[0],y:pos[1]-10},w.a,w.b).distance<scene.size*12+8))return false;
        return placements.every(o=>Math.abs(x-o.x)>(scene.size+o.size)*.34+.25||Math.abs(y-o.y)>1.48);
      };
      const candidates=[[x0,y0]];
      for(let y=z.y+.95;y<z.y+z.h-.6;y+=.55)for(let x=z.x+1.08;x<z.x+z.w-.9;x+=.56)candidates.push([x,y]);
      candidates.sort(([a,b],[x,y])=>Math.hypot(a-x0,b-y0)-Math.hypot(x-x0,y-y0));
      const found=candidates.find(([x,y])=>available(x,y));
      if(!found)return false;
      const [x,y]=found,[px,py]=point(x,y);
      scene.x=px/T-.5;scene.y=py/T-.5;
      placements.push({x,y,size:scene.size});return true;
    };
    function added(name,z,x,y){
      const item=items.get(name),scene={id:'custom-residential-'+id+'-'+name,kind:'notice'};
      if(!item||d.scenes.some(s=>s.id===scene.id)||!fill(scene,z,x,y,name))return false;
      d.scenes.push(scene);return true;
    }
    const originalScenes=[...d.scenes],bedScenes=originalScenes.filter(s=>H.isBed({scene:s})),bath=privateRooms.at(-1);
    const required=d.scenes.filter(s=>s.family==='home'&&[4,8,19,12,22].includes(s.prop));
    const existingBath=originalScenes.filter(s=>s.family!=='home'&&furnitureType(s)?.category==='Banheiro');
    const hasBasin=required.some(s=>s.prop===22)||existingBath.some(s=>/vanity/.test(furnitureType(s).id));
    const service={
      4:scheme%3===1?[.18,.72]:[.19,.28],
      8:scheme===3?[.27,.38]:[.50,.25],
      19:scheme===3?[.74,.62]:[.80,.31]
    };
    for(const s of required){
      if(s.prop===12)fill(s,bath,.26,.29,scheme%2===0?'apartment-shower-cubicle':null);
      else if(s.prop===22)fill(s,bath,.71,.67,scheme%3===1?'apartment-bathroom-vanity':null);
      else fill(s,kitchen,...service[s.prop],s.prop===4&&scheme%2===0?'fridge-mint':null);
    }
    for(const s of existingBath){
      const item=furnitureType(s);
      fill(s,bath,/vanity/.test(item.id)?.72:.78,/toilet|shower/.test(item.id)?.31:.66);
    }
    if(!hasBasin)added('apartment-bathroom-vanity',bath,.76,.66);
    for(const [i,s] of bedScenes.entries()){
      const z=privateRooms[i%bedrooms],shared=i+bedrooms<bedScenes.length||i>=bedrooms;
      fill(s,z,shared?(i>=bedrooms?.76:.24):.50,shared?.31:.34,beds[(index+i*3)%beds.length]);
    }
    const item=items.get('interior-'+feature),featureZone=item.category==='Cozinha'?kitchen:item.category==='Quarto'?privateRooms.at(-2):item.category==='Banheiro'?bath:living;
    if(!added(item.id,featureZone,.69,featureZone===living?.29:.63)){
      const alternative=item.category==='Banheiro'?kitchen:living;
      added(item.id,alternative,.45,.67);
    }
    const furnitureZones=new Map([
      [0,[living,.82,.24]],
      [17,[living,.55,.57,seats[(index+scheme)%seats.length]]],
      [18,[scheme%3===0?kitchen:living,scheme%3===0?.64:.20,.74,tables[(index+scheme)%tables.length]]],
      [20,[privateRooms[0],.22,.72,storage[(index+scheme)%storage.length]]],
      [21,[kitchen,.23,.72]],
      [23,[living,.85,.73,greenery[(index+scheme)%greenery.length]]]
    ]);
    for(const s of originalScenes.filter(s=>!required.includes(s)&&!existingBath.includes(s)&&!bedScenes.includes(s))){
      const settings=s.family==='home'?furnitureZones.get(s.prop):null;
      const zone=furnitureType(s)?.category==='Quarto'?privateRooms[0]:living;
      if(settings&&fill(s,...settings))continue;
      if(!fill(s,zone,.28,.68))fill(s,zone===living?kitchen:living,.54,.65);
    }
    const foyer=zone('Entrada',Math.max(0,entry[0]-3.8),Math.max(privateY,entry[1]-3.2),Math.min(7.6,w-Math.max(0,entry[0]-3.8)),2.2,p.floor);
    added(entryFurniture[(index+scheme)%entryFurniture.length],foyer,scheme%2?.24:.76,.49);

    const [matX,matY]=d.spawn.map(v=>(v+.5)*T);
    d.homeInterior={version:1,kind:apartment?'apartment':'house',footprint:shape,palette,feature:item.id,
      mat:{x:matX,y:matY,shape:scheme%3},rug:{x:pixelZone(living).rect.x+living.w*T*.53,y:(4+privateY+publicDepth*.68)*T,w:Math.min(living.w*32,245),h:90+scheme*5,shape:scheme%3}};
    d.meeting=d.spawn.map((x,i)=>i?x-1.5:x);
    d.adventure.lights=[{id:'residential-lamp-'+id,type:'ceiling',x:point(living.x+living.w*.55,0)[0],y:(4+privateY+publicDepth*.48)*T,elevation:130,radius:apartment?235:290,intensity:.42,color:'#ffe0ad',enabled:true}];
    V.City.architecture(d);
    return d;
  }

  function syncEntrance(id){
    const design=C.layouts[id];
    for(const door of R.structure(design).doors){
      if(!door.pair||!door.to||door.to.map===id)continue;
      const back=R.structure(C.layouts[door.to.map]).doors.find(o=>o.id===door.pair);
      if(!back?.to)continue;
      back.to.arrival={x:door.x+door.normal.x*58,y:door.y+door.normal.y*58,dir:door.facing};
      back.to.room=door.room;
      if(door.to.map.startsWith('interior-horizonte-hall-')){back.appearance=door.appearance;back.height=door.height;}
    }
  }

  for(const [index,plan] of plans.entries()){
    const id=plan[0];legacy[id]=copy(C.layouts[id]);
    for(const door of legacy[id].construction.doors){
      if(door.wall&&door.height<96)door.height=Math.min(136,Math.round(door.width*1.65));
    }
    const d=build(plan,index);C.layouts[id]=d;authored[id]=copy(d);
    if(H.defaults[id])H.defaults[id]=copy(d);
    const meta=H.home(id);
    const n=plan[4];meta.rooms=`${n} ${n===1?'quarto':'quartos'}, ${d.homeInterior.kind==='apartment'?'estar com cozinha integrada':'sala, cozinha'}, banheiro`;
  }
  Object.keys(authored).forEach(syncEntrance);

  const sync=R.sync.bind(R);
  R.sync=function(maps){const out=sync(maps);for(const id of Object.keys(maps))if(authored[id])D.defaults[id]=copy(authored[id]);return out;};
  const init=W.init.bind(W);
  W.init=function(...args){const out=init(...args);Object.keys(authored).forEach(syncEntrance);return out;};

  const dynamic=R.composeDynamic.bind(R);
  R.composeDynamic=function(m,d){const out=dynamic(m,d);addWindows(m);return out;};
  function addWindows(m){
    for(const w of m.design?.homeWindows||[]){
      if(m.objects.some(o=>o.id===w.id))continue;
      m.objects.push({id:w.id,type:'home-window',homeMap:m.id,homeWindow:w,x:w.x,y:w.y,label:'Janela',interactionRange:0});
    }
  }
  const interactables=W.interactables.bind(W);
  W.interactables=function(...args){return interactables(...args).filter(o=>o.type!=='home-window');};

  function rug(c,{x,y,w,h,shape},color){
    c.save();c.translate(x,y);c.beginPath();
    if(shape===1)c.ellipse(0,0,w/2,h/2,0,0,2*Math.PI);else c.roundRect(-w/2,-h/2,w,h,shape===2?17:3);
    c.fillStyle=color;c.fill();c.clip();c.strokeStyle='#edd8a07a';c.lineWidth=3;c.strokeRect(-w/2+7,-h/2+7,w-14,h-14);
    c.fillStyle='#f0dbb052';
    for(let x=-w/2+12;x<w/2;x+=17){c.fillRect(x,-h/2+9,6,3);c.fillRect(x,h/2-12,6,3);}
    c.restore();
  }
  const ground=C.ground.bind(C);
  C.ground=function(m){
    const result=ground(m),d=m.design,design=d?.homeInterior;
    if(!design||!palettes[design.palette]||!m.cache)return result;
    const c=m.cache.getContext('2d'),palette=palettes[design.palette],room=d.construction.rooms[0];
    c.save();R.trace(c,room.polygon);c.clip();
    if(!V.HomeDesign.finishes(m.id).rooms?.[room.id])for(const {rect,floor} of d.homeRooms||[]){
      if(floor!==palette.tile)continue;
      c.save();c.beginPath();c.rect(rect.x,rect.y,rect.w,rect.h);c.clip();
      for(let y=rect.y;y<rect.y+rect.h;y+=T)for(let x=rect.x;x<rect.x+rect.w;x+=T)C.prop(c,'floor',floor,x,y,T);
      c.restore();
    }
    rug(c,design.rug,palette.rug);rug(c,{...design.mat,w:92,h:32},palette.rug);c.restore();return result;
  };

  const start=V.Game.startGame.bind(V.Game);
  let previousHousing;
  V.Game.startGame=function(...args){
    const housing=H.ensure();
    if(!housing.residentialPlans||typeof housing.residentialPlans!=='object'||Array.isArray(housing.residentialPlans))housing.residentialPlans={};
    for(const home of H.data.offers){
      const id=home.id,live=C.layouts[id];
      if(!authored[id]||D.saved[id]||!live)continue;
      if(!housing.residentialPlans[id]){
        const furnished=H.owned(id)&&(housing.constructionEdits?.[id]||housing.placed?.[id]?.length);
        housing.residentialPlans[id]=furnished?'legacy':'authored';
      }
      const keepLegacy=H.owned(id)&&housing.residentialPlans[id]==='legacy';
      const hadEdits=previousHousing&&previousHousing!==housing&&previousHousing.constructionEdits?.[id];
      if(keepLegacy===!live.homeInterior&&!hadEdits)continue;
      const design=copy(keepLegacy?legacy[id]:authored[id]);C.layouts[id]=design;
      W.maps[id]=R.raw(id,design);C.compose(W.maps[id]);syncEntrance(id);
    }
    previousHousing=housing;
    return start(...args);
  };

  V.ResidentialInteriors={authored,legacy};
});
