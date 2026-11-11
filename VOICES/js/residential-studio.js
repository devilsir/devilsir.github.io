/* Registered module: residential-studio */
(function(initialize){if(window.VoicesModules)window.VoicesModules.define('residential-studio',initialize);else initialize();})(function(){
  'use strict';
  const V=window.V,H=V.Homestead,D=V.HomeDesign,C=V.Cozy,R=V.Rooms;
  const doorFile='assets/homestead/residential-doors.webp';
  const rows=[
    ['trundle','Cama com gavetão e colcha coral','Quarto','bed','bed',2.5,74],
    ['hamper','Cesto alto de roupa em rattan','Banheiro','laundry','storage',1.85,31],
    ['sofa-bed','Sofá-cama azul ardósia','Sala','bed','bed',2.7,82],
    ['breakfast-bar','Balcão de café com duas banquetas','Cozinha','breakfast','food',2.7,73],
    ['spices','Prateleira de especiarias','Cozinha','spice','decor',2.1,35,false],
    ['corner-hutch','Cristaleira de canto com relógio','Sala','cabinet','storage',2.4,67],
    ['rocker','Cadeira de balanço de fibra natural','Sala','chair','seat',2.35,49],
    ['arch-books','Estante em arco verde-musgo','Estudo','bookshelf','study',2.6,65],
    ['radio-bench','Aparador baixo com rádio','Sala','radio','storage',2.45,58],
    ['bakers-rack','Estante de pão e louças','Cozinha','bread','food',2.45,58],
    ['trellis','Treliça de folhagens para a sala','Decoração','plant','plant',2.6,61],
    ['sketch-desk','Escrivaninha de desenho com luminária','Estudo','desk','study',2.65,76],
    ['woven-mat','Esteira trançada com franjas verdes','Decoração','rug','rug',2.5,26,false],
    ['hope-chest','Baú de enxoval com correias de couro','Quarto','chest','storage',2.3,46],
    ['copper-tub','Banheira de louça com torneira de cobre','Banheiro','bath','decor',2.65,87],
    ['bamboo-lamp','Criado de bambu com lanterna','Quarto','lamp','light',2.05,39]
  ];
  const utility=[
    ['washer','Lavadora com bancada e cesto','Banheiro','laundry','storage',2.5,70,true,'Organize a roupa no cesto de palhinha ao lado da lavadora.'],
    ['shoe-cabinet','Sapateira de palhinha','Sala','shoe cabinet','storage',2.2,39,true,'Um armário estreito com nicho aberto para os sapatos da entrada.'],
    ['drying-rack','Varal dobrável de madeira','Banheiro','drying rack','decor',2.3,34,true,'Uma peça leve para compor a área de serviço ou a varanda.'],
    ['utility-cart','Carrinho verde de limpeza','Banheiro','utility cart','storage',2.15,41,true,'Cestos e prateleiras móveis para organizar os itens da casa.'],
    ['sewing-table','Mesa de costura com pedal','Estudo','sewing machine','decor',2.4,68,true,'O gabinete de carvalho tem gavetas, um pedal e espaço para o tecido.'],
    ['kids-desk','Mesa infantil de desenho','Estudo','desk','study',2.2,46,true,'Abra o caderno em uma mesa baixa com lápis e cadeira de madeira clara.'],
    ['olive-fridge','Geladeira retrô verde-oliva','Cozinha','fridge','food',2.35,75,true,'Acesse a alimentação pela geladeira de puxador creme.'],
    ['corner-dining','Mesa redonda e banco de canto','Cozinha','dining nook','food',2.85,79,true,'Monte um canto de refeições com banco estofado e mesa de madeira.'],
    ['coat-rack','Cabideiro com porta-guarda-chuva','Sala','coat rack','storage',2.05,39,true,'Reúna casacos e guarda-chuvas junto à entrada.'],
    ['seedling-shelf','Estante de mudas e sementes','Decoração','seedlings','plant',2.35,54,true,'Três níveis de vasos e bandejas para montar um canto de cultivo.'],
    ['reading-chair','Poltrona botânica com luminária','Sala','reading chair','seat',2.45,61,true,'Sente-se em uma poltrona de leitura com luz de latão.'],
    ['sink-cabinet','Pia funda com gabinete de eucalipto','Cozinha','sink','decor',2.65,72,true,'Uma cuba de louça com torneira de latão e gavetas em verde.']
  ];
  const collections=new Map();
  const furnitureFiles=new Set([doorFile]);
  for(const [id,list] of [['studio',rows],['utility',utility]]){
    const family='home-'+id,file='assets/homestead/'+family+'.webp';
    const items=list.map(([slug,name,category,word,action,size,price,solid=true,description=name+'.'],prop)=>({id:id+'-'+slug,name,category,word,action,size,price,solid,description,family,prop}));
    collections.set(family,items);
    furnitureFiles.add(file);
    H.catalog.push(...items);
    V.HomeDesignArtData[family]={file,frames:items.map((_,i)=>({x:i%4*256,y:Math.floor(i/4)*256,w:256,h:256}))};
    V.sceneAssets.push(...items.map(i=>({id:i.id,family,index:i.prop,name:i.name,description:i.description,category:'moradia',layer:i.action==='rug'?'ground':'object',size:i.size,solid:i.solid,interaction:i.action,solidFootprint:i.solid?{x:.18,y:.72,width:.64,height:.21}:[]})));
  }
  const item=D.item.bind(D);
  D.item=o=>collections.get(o?.scene?.family)?.[o.scene.prop]||item(o);
  const prop=C.prop.bind(C);
  C.prop=function(c,name,index,x,y,size,...rest){return collections.has(name)?D.art(c,name,index,x,y,size):prop(c,name,index,x,y,size,...rest);};
  const group=V.AssetLoader.group.bind(V.AssetLoader);
  V.AssetLoader.group=key=>furnitureFiles.has(key)?'home-collection':group(key);
  const load=V.Assets.load.bind(V.Assets);
  let atlas;
  V.Assets.load=async function(...args){
    const doors=new Promise(resolve=>{
      atlas=V.Assets.image();atlas.onload=atlas.onerror=resolve;atlas.src=doorFile;
      V.AssetLoader.register(atlas,resolve);
    });
    const [result]=await Promise.all([load(...args),doors]);return result;
  };

  const addresses=new Set(V.ResidentialPlans.plans.map(([id])=>id));
  const frames=new WeakMap(),trim=['#8d603c','#647d7d','#75866a','#c6ac82','#a87843','#557991','#836645','#b47b5f'];
  function progress(d,open,time){
    let frame=frames.get(d);
    if(!frame){frame={amount:open?1:0,time};frames.set(d,frame);}
    if(V.settings.reducedMotion)frame.amount=open?1:0;
    else frame.amount=V.clamp(frame.amount+(open?1:-1)*Math.min(.09,Math.max(0,time-frame.time))/.28,0,1);
    frame.time=time;
    return frame.amount*frame.amount*(3-2*frame.amount);
  }

  function renderDoor(c,o,cam,time,map){
    const d=o.door,i=Number.isInteger(d.appearance)&&d.appearance>=16&&d.appearance<=23?d.appearance-16:0;
    const mount=V.Architecture.residentialOpening(map,d,cam);
    const x=mount?.x??o.x-cam.x,y=mount?.y??o.y-cam.y,openArch=d.type==='arch'||d.type==='passage',sliding=i===1;
    const amount=progress(d,openArch||d.openUntil>R.clock,typeof time==='number'?time:V.Engine.time);
    const width=d.width,h=d.height,left=-width/2,top=-h;
    const sx=i%4*128+2,sy=Math.floor(i/4)*224+2;
    const leafWidth=Math.min(width,Math.round(h*124/220)),leafLeft=-leafWidth/2;
    c.save();c.translate(x,y);
    if(mount)c.transform(...mount.matrix);
    c.fillStyle='#283b2e44';c.fillRect(left-7,-3,width+14,11);
    c.fillStyle=trim[i];c.fillRect(left-3,-3,width+6,5);
    if(openArch){
      c.lineWidth=8;c.lineJoin='round';c.strokeStyle='#413b2e';
      c.beginPath();c.moveTo(left-2,-1);c.lineTo(left-2,top+26);
      c.quadraticCurveTo(left-2,top+1,0,top+1);c.quadraticCurveTo(-left+2,top+1,-left+2,top+26);c.lineTo(-left+2,-1);c.stroke();
      c.lineWidth=4;c.strokeStyle=trim[i];c.stroke();
    }else{
      c.fillStyle='#483b2d';c.fillRect(left-5,top-4,5,h+4);c.fillRect(-left,top-4,5,h+4);c.fillRect(left-5,top-7,width+10,7);
      c.fillStyle=trim[i];c.fillRect(left-4,top-4,3,h+3);c.fillRect(-left+1,top-4,3,h+3);c.fillRect(left-4,top-6,width+8,3);
      const jamb=(width-leafWidth)/2;
      if(jamb>0){
        c.fillStyle=trim[i];c.fillRect(left,top,jamb,h);c.fillRect(-leafLeft,top,jamb,h);
      }
      c.save();c.imageSmoothingEnabled=true;
      if(sliding){
        c.beginPath();c.rect(leafLeft,top,leafWidth,h);c.clip();
        c.drawImage(atlas,sx,sy,124,220,leafLeft-leafWidth*.89*amount,top,leafWidth,h);
      }else{
        const fold=Math.cos(amount*1.27),tilt=Math.sin(amount*1.27)*.25;
        c.translate(leafLeft,0);c.transform(fold,tilt,0,1,0,0);
        c.drawImage(atlas,sx,sy,124,220,0,top,leafWidth,h);
      }
      c.restore();
    }
    c.restore();
    if(V.World.nearest?.id===o.id)V.Living.marker(c,x,y,d.locked?'×':d.mode==='auto'?'→':'E','#eed39e');
  }
  const draw=C.drawObject.bind(C);
  C.drawObject=function(c,o,cam,t){
    const id=V.SceneEditor.active?V.SceneEditor.mapId:V.World.current?.id;
    if(o.type==='room-door'&&o.door.wall&&addresses.has(id)&&atlas?.naturalWidth)return renderDoor(c,o,cam,t,V.SceneEditor.active?V.SceneEditor.preview:V.World.maps[id]);
    return draw(c,o,cam,t);
  };
  V.ResidentialStudio={items:collections.get('home-studio'),ready:()=>!!atlas?.naturalWidth};
});
