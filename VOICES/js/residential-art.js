/* Registered module: residential-art */
(function(initialize){if(window.VoicesModules)window.VoicesModules.define('residential-art',initialize);else initialize();})(function(){
  'use strict';
  const V=window.V,H=V.Homestead,C=V.Cozy,D=V.HomeDesign,R=V.Rooms,FAMILY='home-interiors';
  const items=[
    ['olive-sofa','Sofá compacto de veludo oliva','Sala',61,'sofa','seat',2.5],
    ['breakfast-nook','Canto de café com banco estofado','Cozinha',68,'breakfast','food',2.65],
    ['record-tower','Estante de discos e caixas de som','Sala',72,'record','decor',2.35],
    ['indigo-bed','Cama baixa com colcha de retalhos','Quarto',79,'bed','bed',2.55],
    ['folding-desk','Escrivaninha dobrável de mostarda','Estudo',57,'desk','study',2.25],
    ['pantry-hutch','Cristaleira de despensa terracota','Cozinha',64,'cupboard','storage',2.45],
    ['entry-cubby','Sapateira aberta de carvalho','Sala',51,'coat','storage',2.3],
    ['utility-sink','Tanque de louça com azulejo sálvia','Banheiro',55,'sink','decor',2.15],
    ['conversation-table','Mesa octogonal com dois pufes','Sala',62,'table','seat',2.55],
    ['open-divider','Estante vazada de pinho','Sala',66,'bookshelf','study',2.55],
    ['textile-chest','Baú de enxoval azul-anil','Quarto',44,'chest','storage',2.2],
    ['plant-steps','Suporte de canto para três vasos','Decoração',31,'plant','plant',2.05],
    ['sewing-desk','Mesa de costura de jacarandá','Estudo',70,'sew','study',2.45],
    ['reading-chaise','Chaise de leitura verde-floresta','Sala',67,'read','seat',2.6],
    ['coffee-station','Cafeteira e xícaras em aparador de creme','Cozinha',60,'coffee','food',2.35],
    ['photo-cabinet','Vitrine baixa de retratos e cerâmicas','Sala',58,'picture','storage',2.35]
  ].map(([id,name,category,price,word,action,size],prop)=>({id:'interior-'+id,name,category,price,word,action,size,prop,family:FAMILY,solid:true,description:name+'.'}));
  const file='assets/homestead/home-interiors.webp';
  V.HomeDesignArtData[FAMILY]={file,frames:items.map((_,i)=>({x:i%4*256,y:Math.floor(i/4)*256,w:256,h:256}))};
  H.catalog.push(...items);
  V.sceneAssets.push(...items.map(i=>({id:i.id,family:FAMILY,index:i.prop,name:i.name,description:i.description,category:'moradia',layer:'object',solid:i.solid,size:i.size,interaction:i.action,solidFootprint:{x:.18,y:.72,width:.64,height:.21}})));
  const item=D.item.bind(D);
  D.item=o=>o?.scene?.family===FAMILY?items[o.scene.prop]:item(o);
  const prop=C.prop.bind(C);
  const floors=new Map(Object.values(V.ResidentialPlans.palettes).flatMap(p=>[[p.floor,{material:'wood',finish:p.wood}],[p.tile,{material:'tile',finish:p.stone}]]));
  for(const [index,{finish:[name]}] of floors)V.sceneAssets.push({family:'floor',index,name,category:'piso',solid:false,layer:'ground'});
  C.prop=function(c,family,index,x,y,size,...rest){
    if(family===FAMILY)return D.art(c,FAMILY,index,x,y,size);
    if(family==='floor'&&floors.has(index))return drawFloor(c,floors.get(index),x,y,size);
    return prop(c,family,index,x,y,size,...rest);
  };
  function drawFloor(c,{material,finish:[,color]},x,y,z){
    const column=Math.floor(x/z),row=Math.floor(y/z);
    c.save();c.translate(x,y);c.scale(z/48,z/48);
    c.fillStyle=color;c.fillRect(0,0,48,48);
    if(material==='wood'){
      for(let band=0;band<3;band++){
        const yy=band*16;
        c.fillStyle=(column*3+row+band)%3===0?'#4a332011':'#ffecd814';c.fillRect(0,yy,48,16);
        c.fillStyle='#523b3228';c.fillRect(0,yy,48,1);
        c.fillStyle='#fff2ce1c';c.fillRect(0,yy+1,48,1);
        c.fillRect(5+(row+band*7)%13,yy+6,18,1);c.fillRect(26,yy+12,13,1);
        if(column%3===(row+band)%3){c.fillStyle='#4a382e31';c.fillRect(16+(band%2)*16,yy,1,16);}
      }
    }else{
      c.fillStyle=(column+row)%2?'#fff5de13':'#584d3d0b';c.fillRect(0,0,48,48);
      c.fillStyle='#62574834';c.fillRect(0,0,48,1);c.fillRect(0,0,1,48);
      c.fillStyle='#fff5e03d';c.fillRect(1,1,47,1);c.fillRect(1,1,1,47);
      c.fillStyle='#fff5da32';c.fillRect(9+(column*7+row)%24,13,3,2);c.fillRect(27,27+(row*5+column)%12,2,2);
    }
    c.restore();
  }
  const group=V.AssetLoader.group.bind(V.AssetLoader);
  V.AssetLoader.group=key=>key.startsWith(file)?'home-collection':group(key);

  const doors=[
    [16,'Madeira frisada de imbuia','slats','#765238','#bd9362'],
    [17,'Porta de correr com vidro canelado','slide','#4a6260','#9db7a8'],
    [18,'Veneziana verde-sálvia','louver','#587056','#b8c29b'],
    [19,'Painéis de marfim e latão','panel','#b5a180','#f1e1bb'],
    [20,'Arco duplo de carvalho','arch','#87603b','#d3ab75'],
    [21,'Porta azul com bandeira de vidro','transom','#3e596c','#a9bfd0'],
    [22,'Palhinha trançada em nogueira','cane','#705543','#d7ae6b'],
    [23,'Moldura terracota e vidro fosco','frost','#a36255','#e3af93']
  ];
  R.residentialDoorStyles=doors.map(([id,name])=>[id,name]);
  const models=new Map(doors.map(([id,,kind,color,trim])=>[id,{kind,color,trim}]));
  const glass=(c,x,y,w,h)=>{c.fillStyle='#aac8c1';c.fillRect(x,y,w,h);c.fillStyle='#e3f1db70';c.fillRect(x+3,y+2,Math.max(2,w*.18),h-4);};

  function door(c,o,cam){
    const d=o.door,model=models.get(d.appearance),{kind,color,trim}=model;
    const open=d.type==='arch'||d.type==='passage'||d.openUntil>R.clock;
    const mount=V.Architecture.residentialOpening(V.World.current,d,cam);
    const x=mount?.x??o.x-cam.x,y=mount?.y??o.y-cam.y,w=d.width,h=d.height,top=-h+7;
    c.save();c.translate(x,y);
    if(mount)c.transform(...mount.matrix);
    c.fillStyle='#2b342b52';c.fillRect(-w/2-9,0,w+18,12);
    if(!open){
      c.fillStyle='#4f493d';c.fillRect(-w/2-6,top-7,w+12,h+3);
      c.fillStyle=trim;c.fillRect(-w/2-4,top-5,w+8,h+3);
      c.fillStyle=color;c.fillRect(-w/2+2,top+2,w-4,h-7);
    }else if(kind!=='arch'){
      c.fillStyle=trim;c.fillRect(-w/2-4,top-5,w+8,6);c.fillRect(-w/2-4,top-5,6,h);c.fillRect(w/2-2,top-5,6,h);
    }
    const left=-w/2+9,right=w/2-9,inside=right-left;
    if(!open){
      c.strokeStyle=trim;c.lineWidth=2;
      if(kind==='slide'||kind==='frost'||kind==='transom'){
        const tall=kind==='slide'?h-21:kind==='frost'?h*.42:Math.min(23,h*.3);
        glass(c,left,top+9,inside,tall);
        for(let i=1;i<4;i++){c.fillStyle=kind==='frost'?'#f2ddc999':color;c.fillRect(left+inside*i/4,top+9,2,tall);}
        if(kind==='slide'){c.fillStyle=trim;c.fillRect(-3,top+5,5,h-15);}
      }else if(kind==='louver'||kind==='cane'){
        c.fillStyle=kind==='cane'?trim:'#415c48';c.fillRect(left,top+9,inside,h-28);
        c.strokeStyle=kind==='cane'?color:trim;c.lineWidth=1;
        for(let yy=top+13;yy<-15;yy+=kind==='cane'?5:8){c.beginPath();c.moveTo(left+2,yy);c.lineTo(right-2,yy);c.stroke();}
        if(kind==='cane')for(let xx=left+5;xx<right;xx+=5){c.beginPath();c.moveTo(xx,top+10);c.lineTo(xx,-21);c.stroke();}
      }else if(kind==='slats'){
        c.lineWidth=1;for(let xx=left;xx<=right;xx+=9){c.beginPath();c.moveTo(xx,top+7);c.lineTo(xx,-8);c.stroke();}
      }else{
        c.strokeRect(left,top+11,inside,h*.36);c.strokeRect(left,-h*.37,inside,h*.24);
        if(kind==='arch'){c.beginPath();c.moveTo(0,top+4);c.lineTo(0,-5);c.stroke();}
      }
      c.fillStyle='#f2cd86';c.fillRect(right-2,-23,5,7);
    }else{
      c.fillStyle=color;
      if(kind==='slide')c.fillRect(left,top+4,inside*.28,h-11);
      else if(d.type!=='arch'){c.beginPath();c.moveTo(left,top+4);c.lineTo(left+14,top+13);c.lineTo(left+14,5);c.lineTo(left,-4);c.fill();}
      c.fillStyle=trim;c.fillRect(left-2,-3,inside+4,3);
    }
    if(kind==='arch'){
      c.strokeStyle=trim;c.lineWidth=6;c.beginPath();c.moveTo(-w/2,-4);c.lineTo(-w/2,top+16);c.quadraticCurveTo(-w/2,top-9,0,top-9);c.quadraticCurveTo(w/2,top-9,w/2,top+16);c.lineTo(w/2,-4);c.stroke();
    }
    c.restore();
    if(V.World.nearest?.id===o.id)V.Living.marker(c,x,y,d.locked?'×':d.mode==='auto'?'→':'E','#ecd099');
  }

  const windows=['Arco de madeira','Veneziana de jardim','Caixilho de ferro','Janela de sacada','Vidro alto fosco','Janela panorâmica'];
  function windowView(c,w,wall,anchorX){
    const model=windows[w.look]?w.look:0,wide=w.width,h=Math.min(wall.height-40,model===4?48:model===3?98:74);
    const x=-wide/2,y=-h-24,frame=model===2?'#3e4d4b':model===1?'#677857':'#755b42';
    const skies=['#c1d9d0','#bad5df','#9bbab4','#6b8195','#ecc891','#bcd9cc'];
    c.save();c.translate(anchorX,0);
    c.fillStyle=frame;
    if(model===0){c.beginPath();c.roundRect(x-5,y-5,wide+10,h+10,[wide*.36,wide*.36,2,2]);c.fill();c.save();c.beginPath();c.roundRect(x,y,wide,h,[wide*.31,wide*.31,0,0]);c.clip();}
    else c.fillRect(x-5,y-5,wide+10,h+10);
    c.fillStyle=skies[w.view]||skies[0];c.fillRect(x,y,wide,h);
    if(w.urban){
      for(let i=0;i<5;i++){const block=wide/5,tall=12+(i*13+w.view*9)%31;c.fillStyle=i%2?'#a18c7b':'#7c9594';c.fillRect(x+i*block,y+h-tall,block-2,tall);c.fillStyle='#eddfaa';c.fillRect(x+i*block+4,y+h-tall+6,3,5);}
    }else{
      c.fillStyle=w.view===0?'#648e9d':'#7b9d77';c.beginPath();c.moveTo(x,y+h-13);c.lineTo(x+wide*.28,y+h-33);c.lineTo(x+wide*.62,y+h-18);c.lineTo(x+wide,y+h-28);c.lineTo(x+wide,y+h);c.lineTo(x,y+h);c.closePath();c.fill();
      c.fillStyle='#a9bb84';c.fillRect(x,y+h-10,wide,10);
    }
    c.fillStyle='#f3eed25e';c.fillRect(x+5,y+8,6,h-18);
    if(model===4){c.fillStyle='#e3e8d790';c.fillRect(x,y,wide,h);}
    c.fillStyle=frame;c.fillRect(-2,y,4,h);if(model===2||model===4)c.fillRect(x,y+h/2,wide,4);
    if(model===0)c.restore();
    if(model===1){for(const a of [x-18,-x+5]){c.fillStyle=frame;c.fillRect(a,y,13,h);c.fillStyle='#a3aa7e';for(let yy=y+5;yy<y+h-2;yy+=7)c.fillRect(a+1,yy,11,2);}}
    if(model===3){c.fillStyle='#4b5954';c.fillRect(x-4,y+h-21,wide+8,4);for(let xx=x;xx<x+wide;xx+=13)c.fillRect(xx,y+h-21,3,22);}
    c.fillStyle='#d6bd91';c.fillRect(x-8,y+h+3,wide+16,5);c.restore();
  }

  const A=V.Architecture;
  function wallFrame(w){
    const lateral=Math.abs(w.b[1]-w.a[1])>Math.abs(w.b[0]-w.a[0]),axis=lateral?1:0;
    const [start,end]=w.a[axis]<=w.b[axis]?[w.a,w.b]:[w.b,w.a];
    const length=Math.hypot(end[0]-start[0],end[1]-start[1]);
    const slope=lateral?(w.sideSlope||(w.sideDirection||1)*.38):0;
    return {start,length,lateral,slope,matrix:[(end[0]-start[0])/length,(end[1]-start[1])/length,-slope,1,0,0],
      at:p=>Math.hypot(p[0]-start[0],p[1]-start[1])};
  }

  A.residentialOpening=function(m,door,cam){
    if(!m?.design?.adventure?.architecture||!door.wall)return null;
    const wall=A.geometry(m.design).walls.find(w=>w.residential&&w.roomId===door.room&&w.segment===door.wall);
    if(!wall)return null;
    return {x:door.x-cam.x,y:door.y-cam.y,matrix:wallFrame(wall).matrix,depth:Math.max(wall.a[1],wall.b[1])+.1};
  };

  A.residentialWall=function(c,m,w,cam){
    const frame=wallFrame(w),height=w.height,parts=A.segments(w),finish=D.finishes(m.id);
    const paper=finish.rooms?.[w.roomId]?.paper,p=V.Player.data;
    const front=p&&p.y<Math.max(w.a[1],w.b[1])&&p.y>Math.min(w.a[1],w.b[1])-height-32;
    const nearSide=p&&Math.abs(p.x-frame.start[0])<65;
    c.save();
    if(!V.SceneEditor?.active&&front&&(!frame.lateral||nearSide)){
      c.globalAlpha*=w.segment.startsWith('home-divider')?.55:.78;
    }
    c.translate(frame.start[0]-cam.x,frame.start[1]-cam.y);
    if(w.sideSlope&&w.segment.startsWith('edge-')){
      c.fillStyle=w.color;
      c.beginPath();c.moveTo(0,0);c.lineTo(0,-height);c.lineTo(frame.slope*height,-height);c.closePath();c.fill();
      c.fillStyle='#493e331e';c.fill();
    }
    c.transform(...frame.matrix);

    const face=(left,right,bottom)=>{
      const width=right-left;if(width<=0||bottom<=-height)return;
      if(paper)D.paper(c,left,-height,width,height+bottom,paper);
      else{
        c.fillStyle=w.color;c.fillRect(left,-height,width,height+bottom);
        c.fillStyle='#e8d9bd';c.fillRect(left,-height,width,5);
        c.fillStyle='#af9e82';c.fillRect(left,-height+5,width,3);
      }
      if(bottom===0){
        c.fillStyle='#5b5043';c.fillRect(left,-8,width,8);
        c.fillStyle='#beaa8b';c.fillRect(left,-10,width,2);
      }
    };
    for(const part of parts){
      const [left,right]=[frame.at(part.a),frame.at(part.b)].sort((a,b)=>a-b);
      face(left,right,0);
    }
    for(const opening of w.openings){
      const center=frame.at([w.a[0]+(w.b[0]-w.a[0])*opening.u,w.a[1]+(w.b[1]-w.a[1])*opening.u]);
      face(Math.max(0,center-opening.width/2),Math.min(frame.length,center+opening.width/2),-opening.height);
    }
    for(const win of w.windows||[]){
      const x=w.a[0]+(w.b[0]-w.a[0])*win.u,y=w.a[1]+(w.b[1]-w.a[1])*win.u;
      const part=parts.find(s=>R.distSeg({x,y},s.a,s.b).distance<.01);
      if(!part)continue;
      const center=frame.at([x,y]),[left,right]=[frame.at(part.a),frame.at(part.b)].sort((a,b)=>a-b);
      const width=Math.min(win.width,2*Math.min(center-left,right-center)-8);
      if(!Number.isFinite(width)||width<28)continue;
      const view=finish.windows?.[win.id];
      c.save();c.beginPath();c.rect(left,-height+8,right-left,height-16);c.clip();
      windowView(c,{...win,width,view:view??win.view??finish.defaultWindow??1,urban:view===undefined?win.urban:view===3},w,center);
      c.restore();
    }
    c.restore();
  };

  function shadow(c,m,o,cam,decor=false){
    if(!V.City.privateHome(m.design)||o.hiddenVisual||(!decor&&!o.scene&&!o.furnitureItem))return;
    const item=decor?H.catalog.find(i=>i.family===o.family&&i.prop===o.prop):V.HomeLiving.item(o);
    if(!item||item.action==='rug'||['window','picture','clock','wall-art'].includes(item.word))return;
    if(decor&&o.layer==='ground')return;
    const size=decor?o.size:(o.scene.size||item.size)*48;
    const x=o.x-cam.x+(decor?size*.5:0),y=o.y-cam.y+size*(decor?.96:.018);
    const wide=size*(item.action==='plant'?.24:.38),depth=Math.max(4,size*.082);
    c.save();c.translate(x,y);c.scale(1,depth/wide);
    const tint=c.createRadialGradient(0,0,1,0,0,wide);
    tint.addColorStop(0,'#241d21a0');tint.addColorStop(.54,'#29202755');tint.addColorStop(1,'#29202700');
    c.fillStyle=tint;c.fillRect(-wide,-wide,wide*2,wide*2);c.restore();
  }

  const draw=C.drawObject.bind(C);
  C.drawObject=function(c,o,cam,t){
    if(o.type==='room-door'&&models.has(o.door.appearance))return door(c,o,cam);
    if(o.type==='home-window'&&V.City.privateHome(V.World.current?.design))return;
    return draw(c,o,cam,t);
  };
  V.ResidentialArt={items,windows,shadow};
});
