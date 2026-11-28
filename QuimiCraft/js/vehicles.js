"use strict";

globalThis.QuimiCraftVehicles = (() => {
  const types={
    cart:{item:"kit_cart",name:"Carrinho de Engenhocas",color:"#43a99c",halfX:1.03,halfZ:1.42,height:2.18,seat:.12,place:2.65,top:13.2,reverse:4.0,accel:5.2,brake:11.7,coast:2.6,turn:1.45,tracks:false,jumpSpeed:8.5,boost:1.44},
    drill:{item:"kit_drill",name:"Escavadeira de Broca",color:"#c67e53",halfX:1.08,halfZ:1.48,height:2.33,seat:.24,place:3.0,top:3.65,reverse:1.8,accel:2.65,brake:8.4,coast:3.5,turn:1.02,tracks:true,jumpSpeed:7.1,boost:1.29,interval:.74},
    bucket:{item:"kit_excavator",name:"Escavadeira de Caçamba",color:"#bc738f",halfX:1.08,halfZ:1.48,height:2.33,seat:.24,place:3.0,top:4.65,reverse:2.3,accel:3.05,brake:9.2,coast:3.9,turn:1.23,tracks:true,jumpSpeed:7.5,boost:1.34,interval:1.03},
    glider:{item:"kit_glider",name:"14-bis de Campo",color:"#e2bf83",halfX:2.68,halfZ:2.87,height:2.18,seat:.14,place:3.7,top:23,runway:11.2,reverse:2.4,accel:2.9,brake:7,coast:2.2,turn:.98,tracks:false},
    dinghy:{item:"kit_dinghy",name:"Bote",color:"#e4a854",halfX:.85,halfZ:1.5,height:.78,seat:.14,place:3.4,top:4.5,reverse:1.9,accel:2.5,brake:4.8,coast:1.6,turn:1.42,draft:.33},
    boat:{item:"kit_boat",name:"Barco médio",color:"#52a9a3",halfX:1.22,halfZ:2.36,height:1.52,seat:.35,place:4.7,top:6.4,reverse:2.5,accel:2.6,brake:4.6,coast:1.4,turn:1.12,draft:.54},
    ship:{item:"kit_ship",name:"Barco grande",color:"#e2c57f",halfX:2.08,halfZ:4.25,height:2.82,seat:.87,place:6.4,top:7.1,reverse:2.2,accel:1.75,brake:3.4,coast:1.12,turn:.69,draft:1.16},
    speedboat:{item:"kit_speedboat",name:"Lancha",color:"#e56d61",halfX:1.1,halfZ:2.67,height:1.58,seat:.35,place:4.9,top:16.5,reverse:3.2,accel:5.5,brake:7,coast:2.45,turn:1.3,draft:.48}
  };
  const hullKind=kind=>types[kind]?.hull??kind;
  for(const [hull,radius] of Object.entries({dinghy:.78,boat:1.02,ship:1.28,speedboat:1.02})){
    const base=types[hull],width=radius*.72;
    const wheels={radius,width,x:base.halfX+width*.52,z:base.halfZ*.56,lift:base.draft+.42};
    types[hull+"_tractor"]={...base,hull,wheels,item:base.item+"_tractor",name:base.name+" com rodas de trator",
      place:base.place+1,dirtTop:hull==="ship"?2.05:2.65,step:6};
  }
  const boatScale=1.15;
  const boatGeometry=Object.fromEntries(Object.entries(types).filter(([,type])=>type.draft));
  for(const [kind,base] of Object.entries(boatGeometry)){
    const {halfX,halfZ,height,seat,place,draft,wheels}=base;
    types[kind]={...base,halfX:halfX*boatScale,halfZ:halfZ*boatScale,height:height*boatScale,
      seat:seat*boatScale,place:place*boatScale,draft:draft*boatScale};
    if(wheels)types[kind].wheels=Object.fromEntries(Object.entries(wheels).map(([key,value])=>[key,value*boatScale]));
  }
  const motor="pedal_drive";
  const itemData={...Object.fromEntries(Object.values(types).map(v=>[v.item,[v.name,v.color]])),
    [motor]:["Módulo de Pedal e Correia","#cfad67"]};
  const kindOf=id=>Object.keys(types).find(key=>types[key].item===id);
  const isBoat=kind=>!!types[kind]?.draft;
  const sails={
    dinghy:{name:"Vela latina ocre",angle:.14,bottom:.26,top:.94,foot:[0,1],head:[.04,.045],curve:.13,
      colors:[0xe5bc76,0xad5428,0xf2d698],stripes:[1,2]},
    boat:{name:"Vela de gafo verde",angle:2.05,bottom:.29,top:.93,foot:[0,1],head:[0,.63],curve:.17,
      colors:[0xe3ecd7,0x336b5e,0x85a88d],stripes:[1,2,6]},
    ship:{name:"Vela quadrada azul",angle:.30,bottom:.49,top:.97,foot:[-.58,1.16],head:[-.48,.96],curve:.24,
      colors:[0xe0d6ad,0x344f70,0xc29248],stripes:[2,3,4,9]},
    speedboat:{name:"Vela de asa rubra",angle:2.39,bottom:.31,top:.96,foot:[0,.52],head:[.22,.04],roach:.68,curve:.11,
      colors:[0x9f292c,0xe9e7dc,0x3a4148],stripes:[4,5,9]}
  };
  function sailSpan(sail,v){
    const left=sail.foot[0]+(sail.head[0]-sail.foot[0])*v;
    const width=sail.foot[1]+(sail.head[1]-sail.foot[1])*v+(sail.roach??0)*Math.sin(v*Math.PI);
    return [left,left+width];
  }
  const decks={
    dinghy:{floor:.15,size:.49,rows:[[-.86,1],[-.35,0],[.60,1],[1.10,1]],cargo:9},
    boat:{floor:.245,size:.60,rows:[[-1.49,1],[-.84,2],[-.19,2],[.46,2],[1.11,2],[1.76,2]],cargo:15},
    ship:{floor:.685,size:.65,rows:[[-2.9,2],[-2.2,3],[-1.5,4],[-.8,5],[-.1,5],[.6,5],[1.3,5],[2.0,5],[2.7,4],[3.4,4]],cargo:27},
    speedboat:{floor:.245,size:.57,rows:[[-1.61,1],[-.98,2],[-.35,2],[.28,2],[.91,2],[1.54,2]],cargo:12}
  };
  function deckLayout(kind,scale=boatScale){
    kind=hullKind(kind);
    const plan=decks[kind];
    if(!plan)return null;
    const {floor,size,rows,cargo}=plan,p=boatGeometry[kind];
    const chest={x:kind==="dinghy"?0:-p.halfX*.53,y:floor,z:p.halfZ*(kind==="dinghy"?-.57:.68),
      w:kind==="ship"?.76:kind==="dinghy"?.44:.53,h:kind==="ship"?.60:.45,d:kind==="ship"?.51:.36};
    const mast={x:kind==="dinghy"?-.34:p.halfX*.54,y:floor,z:p.halfZ*(kind==="dinghy"?-.23:.51),
      height:kind==="ship"?3.55:kind==="dinghy"?1.55:2.19,width:kind==="ship"?1.65:kind==="dinghy"?.73:1.09};
    const fixed=[chest,{x:0,z:.19,w:p.halfX*1.35,d:.30},{x:mast.x,z:mast.z,w:.19,d:.19}];
    if(kind!=="dinghy")fixed.push({x:0,z:-Math.min(.88,p.halfZ*.36),w:p.halfX*1.23,d:.35});
    if(kind==="speedboat")fixed.push({x:0,z:p.halfZ*.72,w:p.halfX*1.38,d:p.halfZ*.32});
    const cells=[];
    rows.forEach(([z,width],row)=>{
      for(let column=0;column<width;column++){
        const x=(column-(width-1)/2)*(size+.045);
        if(fixed.some(prop=>Math.abs(x-prop.x)<(size+prop.w)*.5&&Math.abs(z-prop.z)<(size+prop.d)*.5))continue;
        cells.push({key:row+":"+column,x:x*scale,y:floor*scale,z:z*scale,size:size*scale});
      }
    });
    const resize=fixture=>Object.fromEntries(Object.entries(fixture).map(([key,value])=>[key,value*scale]));
    return {floor:floor*scale,size:size*scale,cells,chest:resize(chest),mast:resize(mast),cargo};
  }
  function shipCabin(scale=boatScale){
    const {halfX,halfZ}=boatGeometry.ship;
    const front=-halfZ*.39,rear=halfZ*.47;
    return {halfWidth:halfX*.56*scale,front:front*scale,rear:rear*scale,
      roof:{y:2.46*scale,z:(front+rear)*.5*scale,width:halfX*.56*2.22*scale,height:.13*scale,depth:(rear-front+.32)*scale}};
  }
  function recipes(B){
    return [
      ["kit_cart",[[B.IRON,5],[B.PLANK,6],["copper_ingot",2],["hide",4]]],
      ["kit_drill",[[B.IRON,9],["copper_ingot",4],["voltaic_cell",1],["hide",5]]],
      ["kit_excavator",[[B.IRON,8],["bronze_ingot",3],["voltaic_cell",1],["hide",5]]],
      ["kit_glider",[[B.PLANK,8],["wool",7],["stick",5],["copper_ingot",2]]],
      ["kit_dinghy",[[B.PLANK,5],["stick",2],["hide",2]]],
      ["kit_boat",[[B.PLANK,12],["bronze_ingot",2],["stick",3],["hide",3]]],
      ["kit_ship",[[B.PLANK,28],["iron_ingot",8],["bronze_ingot",4],["wool",7]]],
      ["kit_speedboat",[[B.PLANK,14],["steel_ingot",4],["voltaic_cell",2],["copper_ingot",3]]],
      ...Object.values(types).filter(p=>p.wheels).map(p=>[p.item,[[types[p.hull].item,1],["iron_ingot",4],["hide",6]]]),
      [motor,[[B.IRON,3],["bronze_ingot",2],["hide",3],["stick",2]]]
    ].map(([id,need])=>({name:itemData[id][0],need,out:[id,1]}));
  }
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const approach=(a,b,change)=>a+clamp(b-a,-change,change);
  const ease=(a,b,rate,dt)=>a+(b-a)*(1-Math.exp(-rate*dt));
  const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
  const groundProfiles={
    normal:{grip:1,pace:1},slip:{grip:.43,pace:.97},
    loose:{grip:.76,pace:.78},mud:{grip:.59,pace:.62}
  };
  const point=(x,z,yaw,u,v)=>[x+u*Math.cos(yaw)+v*Math.sin(yaw),z-u*Math.sin(yaw)+v*Math.cos(yaw)];
  const axis=(pos,estimated)=>{
    const dx=-Math.sin(pos.yaw),dz=-Math.cos(pos.yaw);
    return {x:Math.floor(pos.x+dx*estimated),z:Math.floor(pos.z+dz*estimated),fx:Math.abs(dx)>Math.abs(dz)?Math.sign(dx):0,fz:Math.abs(dx)>Math.abs(dz)?0:Math.sign(dz)};
  };

  function excavation(vehicle,target){
    if(vehicle.kind!=="drill"&&vehicle.kind!=="bucket")return [];
    const drill=vehicle.kind==="drill",offset=drill?2.49:2.3;
    let base=Math.floor(vehicle.y+.16);
    const front=axis(vehicle,offset);
    let {x,z,fx,fz}=front;
    if(target){
      const ahead=(target.x+.5-vehicle.x)*fx+(target.z+.5-vehicle.z)*fz;
      const lateral=Math.abs((target.x+.5-vehicle.x)*fz-(target.z+.5-vehicle.z)*fx);
      if(ahead>=1.60&&ahead<=(drill?3.1:4.35)&&lateral<=(drill?.85:1.85)&&Math.abs(target.y-base)<3){
        if(drill){
          if(fx)x=target.x;
          else z=target.z;
        }else{
          x=target.x;z=target.z;
          base=target.y+1;
        }
      }
    }
    const cells=[];
    for(let layer=0;layer<(drill?1:2);layer++)for(let u=-1;u<=1;u++){
      for(let level=0;level<(drill?3:2);level++)
        cells.push({x:x+fx*layer+fz*u,y:drill?base+level:base-1-level,z:z+fz*layer-fx*u});
    }
    return cells;
  }

  function create({THREE,scene,models,player,solid,ground,liquid,water=()=>null,protectedPosition,exchange,breakArea,
    inspect=()=>"cut",surface=()=>"normal",notice,persist,deckBlock=()=>null,cargoItem=()=>true,wind=()=>({x:0,z:0})}){
    const roster=[],root=new THREE.Group();
    root.name="Oficina de veículos";
    scene.add(root);
    const workGeometry=new THREE.EdgesGeometry(new THREE.BoxGeometry(1.01,1.01,1.01));
    const workMaterial=new THREE.LineBasicMaterial({color:0xffc985,transparent:true,opacity:.65});
    const workPreview=new THREE.Group();
    for(let i=0;i<12;i++)workPreview.add(new THREE.LineSegments(workGeometry,workMaterial));
    workPreview.name="Prévia do corte";
    workPreview.visible=false;
    root.add(workPreview);
    let active=null,serial=0,workPreviewClock=0;
    const current=()=>active;
    const lifted=v=>v.flying||v.airborne||!!v.climb;
    const copyPose=v=>({x:v.x,y:v.y,z:v.z,yaw:v.yaw});
    function syncPose(v){
      v.heading=v.yaw;
      v.renderY=v.y;
      v.tilt=v.bank=v.steer=v.yawRate=0;
      v.stuckTime=0;
    }
    const within=v=>!protectedPosition(v.x,v.y,v.z);
    function add(kind,pose,id=++serial,motorized=false,saved=null){
      const rig=models.build(kind);
      const v={kind,id,...pose,motor:motorized,speed:0,dy:0,steer:0,tilt:0,bank:0,work:0,
        cooldown:0,flying:false,pedaling:false,park:copyPose(pose),rig,
        onLand:!!types[kind].wheels&&saved?.onLand===true,airborne:false,climb:null,climbRetry:0,nitro:100,nitroActive:false,nitroDelay:0,nitroLock:false,
        jumpHeld:false,meterSpeed:0,waterClock:0};
      syncPose(v);
      const layout=deckLayout(kind);
      if(layout){
        v.deck={...layout,blocks:new Map(),cargoSlots:Array(layout.cargo).fill(null),sail:saved?.sail===true};
        const validCells=new Map(layout.cells.map(cell=>[cell.key,cell]));
        for(const row of Array.isArray(saved?.blocks)?saved.blocks.slice(0,layout.cells.length):[]){
          const cell=validCells.get(row?.key);
          if(cell&&!v.deck.blocks.has(cell.key))addDeckBlock(v,cell,row.id);
        }
        if(Array.isArray(saved?.cargoSlots))v.deck.cargoSlots=v.deck.cargoSlots.map((_,i)=>{
          const item=saved.cargoSlots[i];
          const liquid=item?.liquid;
          const sample=liquid&&typeof liquid.id==="string"&&["water_bucket","water_cup","hazardous_container"].includes(item.id)
            ?Object.fromEntries(Object.entries(liquid).filter(([,value])=>typeof value==="string"||Number.isFinite(value))):null;
          return item&&cargoItem(item.id)&&Number.isSafeInteger(item.count)&&item.count>0
            ?{id:item.id,count:item.count,...(item.silvered===true?{silvered:true}:{}),...(sample?{liquid:sample}:{}),
              ...(item.venomCharges>0&&Number.isSafeInteger(item.venomCharges)?{venomCharges:Math.min(99,item.venomCharges)}:{})}:null;
        });
      }
      root.add(rig.root);
      roster.push(v);
      models.animate(rig,v,0);
      return v;
    }
    function snapshot(){
      return {version:1,roster:roster.map(v=>({kind:v.kind,id:v.id,motor:v.motor,
        ...(v.kind==="glider"||isBoat(v.kind)?{}:{nitro:v.nitro}),...(lifted(v)?v.park:copyPose(v)),
        ...(v.deck?{deck:{onLand:!!(v.climb?v.park.onLand:v.onLand),sail:v.deck.sail,blocks:[...v.deck.blocks].map(([key,block])=>({key,id:block.id})),
          cargoSlots:v.deck.cargoSlots.map(item=>item&&{...item})}}:{})}))};
    }
    function restore(data){
      if(data?.version!==1||!Array.isArray(data.roster))return;
      for(const v of roster)root.remove(v.rig.root);
      roster.length=0;serial=0;active=null;
      const seen=new Set();
      for(const row of data.roster.slice(0,48)){
        if(!Object.hasOwn(types,row?.kind)||![row.x,row.y,row.z,row.yaw].every(Number.isFinite))continue;
        if(Math.max(Math.abs(row.x),Math.abs(row.z))>8e6||row.y<1||row.y>128)continue;
        const id=Number.isSafeInteger(row.id)&&row.id>0&&!seen.has(row.id)?row.id:serial+1;
        seen.add(id);serial=Math.max(serial,id);
        const vehicle=add(row.kind,copyPose(row),id,row.kind==="glider"&&row.motor===true,row.deck);
        if(row.kind!=="glider"&&Number.isFinite(row.nitro))vehicle.nitro=clamp(row.nitro,0,100);
      }
    }
    function hitbox(kind,x,y,z,yaw){
      const type=types[kind],halfX=type.halfX,halfZ=type.halfZ,glider=kind==="glider";
      if(active&&overlaps(x,y,z,kind,active,yaw))return true;
      const boat=isBoat(kind),wheels=type.wheels;
      if(wheels){
        for(const side of [-1,1])for(const end of [-1,1]){
          for(const u of [wheels.x-wheels.width*.43,wheels.x+wheels.width*.43]){
            for(const offset of [-.76,0,.76]){
              const [px,pz]=point(x,z,yaw,u*side,end*wheels.z+offset*wheels.radius);
              const bottom=y-wheels.lift+wheels.radius*(offset?.34:.06);
              const top=y-wheels.lift+wheels.radius*(offset?1.66:1.94);
              if(protectedPosition(px,bottom,pz))return true;
              for(let py=bottom;py<=top;py=Math.min(top,Math.floor(py)+1.005)){
                if(solid(px,py,pz))return true;
                if(py===top)break;
              }
            }
          }
        }
      }
      for(let i=0;i<=Math.ceil(halfX*4);i++){
        const u=-halfX+Math.min(halfX*2,i*.5);
        for(let j=0;j<=Math.ceil(halfZ*4);j++){
          const v=-halfZ+Math.min(halfZ*2,j*.5);
          if(glider&&Math.abs(u)>.83&&(v<-1.13||v>1.14))continue;
          if(boat&&v<-halfZ*.45&&Math.abs(u)>halfX*(.31+.69*(v+halfZ)/(halfZ*.55)))continue;
          const [px,pz]=point(x,z,yaw,u,v);
          let bottom=boat?y-type.draft+.09:glider&&Math.abs(u)>.83?y+1.01:y+.07;
          if(glider&&v<-1.91)bottom=y+.75;
          if(protectedPosition(px,bottom,pz))return true;
          const top=y+type.height-.04;
          for(let py=bottom;py<=top;py=Math.min(top,Math.floor(py)+1.005)){
            if(solid(px,py,pz))return true;
            if(py===top)break;
          }
        }
      }
      if(kind==="drill"||kind==="bucket"){
        const toolEnd=kind==="drill"?-2.4:-2.55;
        for(const u of [-.49,0,.49])for(const v of [-1.48,-1.9,toolEnd]){
          const [px,pz]=point(x,z,yaw,u,v);
          if(protectedPosition(px,y+.6,pz))return true;
          if(kind==="drill"&&solid(px,y+.79,pz))return true;
        }
      }
      return false;
    }
    function nearest(range=4.25,kind){
      let best=null,dist=range;
      for(const v of roster){
        if(kind&&v.kind!==kind||Math.abs(v.y-player.pos.y)>(types[v.kind].wheels?3.8:2.65))continue;
        const d=Math.hypot(v.x-player.pos.x,v.z-player.pos.z)-(isBoat(v.kind)?types[v.kind].halfZ*.35:0);
        if(d<dist){best=v;dist=d;}
      }
      return best;
    }
    function overlaps(x,y,z,kind,skip=null,yaw=0){
      return roster.some(v=>{
        if(v===skip||Math.abs(v.y-y)>=2.45)return false;
        if(!isBoat(kind)&&!isBoat(v.kind)){
          const wing=v.kind==="glider"||kind==="glider";
          return Math.hypot(v.x-x,v.z-z)<(skip?(wing?3.7:2.38):(wing?4:2.55));
        }
        const a=types[kind],b=types[v.kind],dx=v.x-x,dz=v.z-z;
        for(const angle of [yaw,yaw+Math.PI/2,v.yaw,v.yaw+Math.PI/2]){
          const reach=(p,dir)=>{
            const w=p.wheels,halfX=w?Math.max(p.halfX,w.x+w.width*.5):p.halfX;
            const halfZ=w?Math.max(p.halfZ,w.z+w.radius):p.halfZ;
            return halfX*Math.abs(Math.cos(angle-dir))+halfZ*Math.abs(Math.sin(angle-dir));
          };
          if(Math.abs(dx*Math.cos(angle)-dz*Math.sin(angle))>=reach(a,yaw)+reach(b,v.yaw)+.08)return false;
        }
        return true;
      });
    }
    function waterSupport(kind,x,z,reference,yaw){
      const type=types[kind],center=water(x,z,reference);
      if(!center||center.depth<type.draft+.12)return null;
      for(const [u,v] of [[0,-.86],[0,.86],[-.80,-.29],[.80,-.29],[-.80,.61],[.80,.61]]){
        const [px,pz]=point(x,z,yaw,type.halfX*u,type.halfZ*v),sample=water(px,pz,center.y);
        if(!sample||sample.depth<type.draft+.06||Math.abs(sample.y-center.y)>.36)return null;
      }
      return center.y;
    }
    function tractorGround(kind,x,z,reference,yaw,rise=.42,drop=1.10){
      const {wheels}=types[kind],feet=reference-wheels.lift;
      const probe=(px,pz)=>{
        const y=ground(px,pz,feet+rise+.025,feet-drop);
        return y===null||liquid(px,y+.09,pz)?null:y;
      };
      const heights=[];
      for(const side of [-1,1])for(const end of [-1,1]){
        const [px,pz]=point(x,z,yaw,side*wheels.x,end*wheels.z);
        const y=probe(px,pz);
        if(y!==null)heights.push(y);
      }
      const center=probe(x,z);
      if(heights.length<2&&(center===null||heights.length<1))return null;
      if(center!==null)heights.push(center);
      return Math.max(...heights)+wheels.lift;
    }
    function boatSupport(kind,x,z,reference,yaw,preferLand=false){
      const p=types[kind],afloat=waterSupport(kind,x,z,reference,yaw);
      const rolling=p.wheels?tractorGround(kind,x,z,reference,yaw):null;
      return preferLand&&rolling!==null?{y:rolling,land:true}:afloat!==null?{y:afloat,land:false}:
        rolling!==null?{y:rolling,land:true}:null;
    }
    function boatRoute(v,x,z,yaw){
      const route=boatSupport(v.kind,x,z,v.y,yaw,v.onLand);
      const clear=y=>!hitbox(v.kind,x,y,z,yaw)&&deckClear(v,x,y,z,yaw);
      if(route&&clear(route.y))return route;
      if(!v.onLand||!water(x,z,v.y))return null;
      // The back of the hull can still touch the bank after the tire centers reach water.
      const p=types[v.kind],w=p.wheels,reach=Math.max(p.halfZ,w.z+w.radius)+.08,feet=v.y-w.lift;
      for(const end of [-1,1])for(const side of [-1,0,1]){
        const [px,pz]=point(x,z,yaw,side*w.x,end*reach),bed=ground(px,pz,feet+.15,feet-.55);
        if(bed!==null&&!liquid(px,bed+.08,pz)&&clear(v.y))return {y:v.y,land:true};
      }
      return null;
    }
    function safeParking(x,y,z,yaw){
      for(const radius of [0,5,10,18,30]){
        const count=radius?8:1;
        for(let i=0;i<count;i++){
          const a=i*Math.PI/4,px=x+Math.round(Math.cos(a)*radius),pz=z+Math.round(Math.sin(a)*radius);
          const py=ground(px,pz,y-.16,2);
          if(py!==null&&!liquid(px,py+.08,pz)&&!hitbox("glider",px,py,pz,yaw)&&!overlaps(px,py,pz,"glider"))
            return {x:px,y:py,z:pz,yaw};
        }
      }
      return null;
    }
    function deploy(id,target,inAir=false){
      const kind=kindOf(id),type=types[kind];
      if(!type||active||inAir&&kind!=="glider")return false;
      if(roster.length>=48){notice("Recolha um veículo antes de montar outro.");return false;}
      const yaw=player.yaw;
      const boat=isBoat(kind);
      const offset=target?.n?.[1]===1?.5:boat?0:.5;
      const x=inAir?player.pos.x:target?target.x+offset:player.pos.x-Math.sin(yaw)*type.place;
      const z=inAir?player.pos.z:target?target.z+offset:player.pos.z-Math.cos(yaw)*type.place;
      const center=boat?null:inAir?player.pos.y:ground(x,z,player.pos.y+2,player.pos.y-4);
      const reference=type.wheels&&(!target||target.n?.[1]===1)?
        (target?target.y+1:player.pos.y)+type.wheels.lift:target?.y??player.pos.y;
      const float=boat?boatSupport(kind,x,z,reference,yaw):null;
      const y=boat?float?.y??null:
        inAir||center===null?center:support({kind,yaw},x,z,center)?.height??null;
      if(y===null||hitbox(kind,x,y,z,yaw)||(!boat&&!inAir&&liquid(x,y+.08,z))||overlaps(x,y,z,kind,null,yaw)){
        notice(type.wheels?"Procure água com calado ou terreno livre para as rodas.":boat?"Procure água livre e fundo suficiente para o casco.":"Procure espaço livre para montar o veículo.");return false;
      }
      if(!inAir&&Math.hypot(x-player.pos.x,z-player.pos.z)<(boat?type.halfZ+.5:kind==="glider"?2.4:1.95)){
        notice("Afaste-se um pouco para abrir o kit.");return false;
      }
      const recovery=inAir?safeParking(x,y,z,yaw):null;
      if(inAir&&!recovery){notice("Abra o planador perto de terra firme para poder recuperá-lo.");return false;}
      const result=exchange([[id,1]],[]);
      if(!result.ok){notice(result.message);return false;}
      const v=add(kind,{x,y,z,yaw},undefined,false,{onLand:float?.land});
      if(inAir){
        const descent=player.vel.y;
        const entrySpeed=Math.hypot(player.vel.x,player.vel.z);
        v.park=recovery;
        mount(v);
        v.flying=true;
        v.speed=clamp(9.5+entrySpeed*.38+Math.abs(descent)*.08,9.5,16);
        v.dy=clamp(descent,-7,-2.2);
        v.report="Asas abertas";
      }
      persist();notice(type.name+" montado.");
      return true;
    }
    function spawn(kind,coords=null){
      const type=types[kind];
      if(!type)return {ok:false,msg:"Veículo desconhecido."};
      if(roster.length>=48)return {ok:false,msg:"Limite de 48 veículos atingido."};
      const yaw=player.yaw,boat=isBoat(kind);
      const x=coords?coords[0]:player.pos.x-Math.sin(yaw)*(type.place+.5);
      const z=coords?coords[2]:player.pos.z-Math.cos(yaw)*(type.place+.5);
      const refY=coords?coords[1]:player.pos.y;
      const float=boat?boatSupport(kind,x,z,refY+(type.wheels?type.wheels.lift:0),yaw):null;
      const center=boat?null:ground(x,z,refY+6,refY-6);
      const y=boat?float?.y??null:(center===null?null:support({kind,yaw},x,z,center)?.height??center);
      const finalY=y??refY;
      add(kind,{x,y:finalY,z,yaw},undefined,false,{onLand:boat?(float?.land??!water(x,z,finalY)):true});
      persist();
      return {ok:true,msg:`Veículo invocado: ${type.name}`};
    }
    function mount(v=nearest()){
      if(!v||active||!roster.includes(v)||Math.hypot(player.pos.x-v.x,player.pos.z-v.z)>4.5+(isBoat(v.kind)?types[v.kind].halfZ*.35:0)||Math.abs(player.pos.y-v.y)>2.65)return false;
      if(!within(v))return false;
      active=v;
      v.speed=0;v.dy=0;v.report="";
      syncPose(v);
      player.yaw=v.yaw;player.pitch=0;
      player.vel.set(0,0,0);player.pos.set(v.x,v.y+types[v.kind].seat,v.z);
      return true;
    }
    function dismount(cancel=false){
      const v=active;
      if(!v)return false;
      if(lifted(v)&&!cancel){notice("Espere o veículo tocar o solo.");return false;}
      if(Math.abs(v.speed)>2.2&&!cancel){notice("Reduza a velocidade para desmontar.");return false;}
      let exit=null;
      let swimming=false;
      if(!cancel){
        for(const side of [-1,1]){
          const p=types[v.kind],width=p.wheels?p.wheels.x+p.wheels.width*.5:p.halfX;
          const [x,z]=point(v.x,v.z,v.yaw,side*(width+.65),.16);
          const y=ground(x,z,v.y+1.1,v.y-(p.wheels?.lift??0)-1.3);
          if(y!==null&&!solid(x,y+.05,z)&&!solid(x,y+1.3,z)&&!liquid(x,y+.14,z)&&!protectedPosition(x,y,z)){
            exit=[x,y,z];break;
          }
        }
        if(!exit&&isBoat(v.kind))for(const side of [-1,1]){
          const [x,z]=point(v.x,v.z,v.yaw,side*(types[v.kind].halfX+.72),.16),pool=water(x,z,v.y);
          if(!pool||protectedPosition(x,pool.y,z)||solid(x,pool.y+.2,z)||solid(x,pool.y+1.18,z))continue;
          exit=[x,pool.y-.34,z];swimming=true;break;
        }
        if(!exit){notice("Deixe espaço em um dos lados para sair.");return false;}
        player.pos.set(...exit);
        player.onGround=!swimming;
      }
      if(cancel&&lifted(v))Object.assign(v,v.park);
      v.climb=null;v.airborne=v.nitroActive=v.jumpHeld=false;
      v.speed=v.dy=v.work=0;v.flying=v.pedaling=false;
      syncPose(v);
      active=null;
      player.vel.set(0,0,0);
      player.fallStart=player.pos.y;
      workPreview.visible=false;
      models.animate(v.rig,v,0);
      persist();
      return true;
    }
    function stash(){
      const v=nearest();
      if(active||!v)return false;
      if(v.deck&&(v.deck.blocks.size||v.deck.cargoSlots.some(Boolean))){
        notice("Esvazie o baú e retire os blocos do convés antes de recolher o barco.");return true;
      }
      const items=[[types[v.kind].item,1],...(v.motor?[[motor,1]]:[])];
      const result=exchange([],items);
      if(result.ok){root.remove(v.rig.root);roster.splice(roster.indexOf(v),1);persist();notice("Veículo recolhido.");}
      else notice(result.message);
      return true;
    }
    function addDeckBlock(v,cell,id){
      const mesh=deckBlock(id,cell.size);
      if(!mesh)return false;
      mesh.position.set(cell.x,cell.y,cell.z);
      v.rig.root.add(mesh);
      v.deck.blocks.set(cell.key,{id,mesh,cell});
      return true;
    }
    function deckTarget(ray,range=5.5){
      let best=null,distance=range;
      const inverse=new THREE.Matrix4(),local=new THREE.Ray(),hit=new THREE.Vector3(),box=new THREE.Box3();
      for(const v of roster){
        if(!v.deck||!v.rig.root.visible||Math.hypot(ray.origin.x-v.x,ray.origin.z-v.z)>range+types[v.kind].halfZ)continue;
        v.rig.root.updateWorldMatrix(true,false);
        local.copy(ray).applyMatrix4(inverse.copy(v.rig.root.matrixWorld).invert());
        const sample=(kind,x,y,z,w,h,d,cell=null)=>{
          box.min.set(x-w/2,y,z-d/2);box.max.set(x+w/2,y+h,z+d/2);
          if(!local.intersectBox(box,hit))return;
          const dist=local.origin.distanceTo(hit);
          if(dist>=distance)return;
          distance=dist;
          best={kind,vehicle:v,cell,distance,point:hit.clone().applyMatrix4(v.rig.root.matrixWorld)};
        };
        const {chest,mast,cells,blocks}=v.deck;
        if(hullKind(v.kind)==="ship"){
          const {roof}=shipCabin();
          sample("cabinRoof",0,roof.y-roof.height*.5,roof.z,roof.width,roof.height,roof.depth);
        }
        sample("cargo",chest.x,chest.y,chest.z,chest.w,chest.h,chest.d);
        sample("sail",mast.x,mast.y,mast.z,.20*boatScale,mast.height,.24*boatScale);
        for(const cell of cells){
          const placed=blocks.has(cell.key);
          if(!placed&&(local.direction.y>=-.12||
            local.origin.y<=cell.y||
            Math.abs(local.at((cell.y-local.origin.y)/local.direction.y,hit).x-cell.x)>cell.size/2||
            Math.abs(hit.z-cell.z)>cell.size/2))continue;
          sample(placed?"deckBlock":"deck",cell.x,cell.y-(placed?0:.036),cell.z,cell.size,placed?cell.size:.036,cell.size,cell);
        }
      }
      return best?.kind==="cabinRoof"?null:best;
    }
    function buildOnDeck(target,id,consume){
      const v=target?.vehicle,cell=target?.cell;
      if(target?.kind!=="deck"||!v?.deck||!roster.includes(v)||!v.deck.cells.includes(cell)||v.deck.blocks.has(cell.key))return false;
      const [x,z]=point(v.x,v.z,v.yaw,cell.x,cell.z),radius=cell.size*.48;
      if(protectedPosition(x,v.y+cell.y,z)||solid(x,v.y+cell.y+radius,z)||solid(x,v.y+cell.y+cell.size-.025,z)
        ||player.pos.y+1.68>v.y+cell.y&&player.pos.y<v.y+cell.y+cell.size&&Math.hypot(player.pos.x-x,player.pos.z-z)<radius+.28){
        notice("Libere o espaço sobre o piso do barco.");return false;
      }
      if(!addDeckBlock(v,cell,id)){notice("Use um bloco de construção compatível no piso do barco.");return false;}
      if(!consume()){removeDeckBlock(v,cell);return false;}
      persist();return true;
    }
    function removeDeckBlock(v,cell){
      const block=v.deck.blocks.get(cell.key);
      if(!block)return;
      v.rig.root.remove(block.mesh);block.mesh.geometry?.dispose();
      v.deck.blocks.delete(cell.key);
    }
    function breakOnDeck(target,receive){
      const v=target?.vehicle,cell=target?.cell,block=v?.deck?.blocks.get(cell?.key);
      if(target?.kind!=="deckBlock"||!roster.includes(v)||!block)return false;
      if(!receive(block.id))return false;
      removeDeckBlock(v,cell);persist();return true;
    }
    function toggleSail(v){
      if(!v?.deck||!roster.includes(v))return false;
      v.deck.sail=!v.deck.sail;
      if(v.deck.sail&&!deckClear(v,v.x,v.y,v.z,v.yaw)){
        v.deck.sail=false;notice("Abra espaço acima do convés para içar a vela.");return false;
      }
      models.animate(v.rig,v,0);persist();
      notice(v.deck.sail?sails[v.kind].name+" içada · aproveite o vento a favor":"Vela recolhida.");return true;
    }
    function moveCargo(v,backpack,into,index){
      if(!v?.deck||!roster.includes(v))return false;
      const cargo=v.deck.cargoSlots,from=into?backpack:cargo,to=into?cargo:backpack,item=from[index];
      if(!item||!cargoItem(item.id))return false;
      const plain=slot=>!slot.liquid&&!slot.silvered&&!slot.venomCharges;
      const stack=plain(item)?to.find(slot=>slot?.id===item.id&&plain(slot)&&Number.isSafeInteger(slot.count+item.count)):null;
      if(stack)stack.count+=item.count;
      else{
        const free=to.indexOf(null);
        if(free<0){notice(into?"O baú do barco está cheio.":"A mochila está cheia.");return false;}
        to[free]={...item};
      }
      from[index]=null;persist();return true;
    }
    function install(){
      const v=nearest(4.25,"glider");
      if(active||!v){notice("Aproxime-se de um 14-bis estacionado.");return false;}
      if(v.motor){notice("O planador já tem pedal e correia.");return false;}
      const result=exchange([[motor,1]],[]);
      if(!result.ok){notice(result.message);return false;}
      v.motor=true;models.animate(v.rig,v,0);persist();notice("Pedal, correia e hélice instalados.");
      return true;
    }
    function support(v,x,z,y){
      const props=types[v.kind],glider=v.kind==="glider";
      const height=ground(x,z,y+1.05,y-1.55);
      if(height===null||liquid(x,height+.08,z))return null;
      const track=glider?.55:props.halfX*.79;
      const wheelbase=glider?.60:props.halfZ*.67;
      const samples=[[-track,-wheelbase],[track,-wheelbase],[-track,wheelbase],[track,wheelbase]].map(([u,w])=>{
        const [px,pz]=point(x,z,v.yaw,u,w);
        const supportY=ground(px,pz,height+1.05,height-1.4);
        return supportY===null||liquid(px,supportY+.08,pz)?null:supportY;
      });
      const heels=samples.filter(h=>h!==null);
      if(heels.length<3||Math.max(...heels)-Math.min(...heels)>(props.tracks?2:1.1))return null;
      const [fl,fr,rl,rr]=samples.map(h=>h??height);
      return {height:Math.max(height,...heels),pitch:Math.atan2(fl+fr-rl-rr,4*wheelbase),
        bank:Math.atan2(fr+rr-fl-rl,4*track)};
    }
    function stopAtObstacle(v,x,z){
      if(Math.hypot(x-v.x,z-v.z)<.018){v.speed=0;return;}
      let lo=0,hi=1;
      for(let i=0;i<5;i++){
        const mid=(lo+hi)*.5,px=v.x+(x-v.x)*mid,pz=v.z+(z-v.z)*mid;
        const bed=support(v,px,pz,v.y);
        if(bed&&!hitbox(v.kind,px,bed.height,pz,v.yaw))lo=mid;
        else hi=mid;
      }
      if(lo>.03){
        v.x+=(x-v.x)*lo;
        v.z+=(z-v.z)*lo;
        const bed=support(v,v.x,v.z,v.y);
        if(bed)v.y=bed.height;
        v.park=copyPose(v);
      }
      v.speed=0;
    }
    function turn(v,dt,input,traction){
      const p=types[v.kind],direction=v.speed<-.25?-1:1;
      const proportion=clamp(Math.abs(v.speed)/6,0,1);
      const pivot=p.tracks?.72:0;
      const flexibility=v.flying?.58+proportion*.27:v.airborne?.28:pivot+(1-pivot)*proportion;
      const fast=v.flying?1:1/(1+Math.max(0,Math.abs(v.speed)-6)*.10);
      const amount=input.turn*p.turn*flexibility*fast*dt*direction*(.55+traction.grip*.45);
      const yaw=v.yaw+amount;
      if(Math.abs(amount)>.0002&&!hitbox(v.kind,v.x,v.y,v.z,yaw)){
        v.yaw=yaw;
        player.yaw+=amount;
      }
      const hold=v.flying?6.7:v.airborne?3.6:p.tracks?14:8*traction.grip;
      v.heading+=angleDelta(v.heading,v.yaw)*(1-Math.exp(-hold*dt));
      v.steer=ease(v.steer,input.turn,8,dt);
    }
    function chargeNitro(v,dt,input){
      if(v.kind==="glider")return;
      if(!input.nitro)v.nitroLock=false;
      const usable=!v.airborne&&!v.climb&&!input.brake&&input.throttle>0;
      v.nitroActive=usable&&input.nitro&&!v.nitroLock&&v.nitro>0;
      if(v.nitroActive){
        v.nitro=Math.max(0,v.nitro-dt*32);
        v.nitroDelay=1.18;
        if(v.nitro===0)v.nitroLock=true;
      }else{
        v.nitroDelay=Math.max(0,v.nitroDelay-dt);
        if(v.nitroDelay===0)v.nitro=Math.min(100,v.nitro+15*dt);
      }
    }
    function acrossClear(v,x,y,z){
      const length=Math.hypot(x-v.x,z-v.z),samples=Math.max(1,Math.ceil(length/.36));
      for(let i=1;i<=samples;i++){
        const t=i/samples;
        if(hitbox(v.kind,v.x+(x-v.x)*t,y,v.z+(z-v.z)*t,v.yaw))return false;
      }
      return true;
    }
    function tryClimb(v,x,z){
      if(v.climbRetry>0||!hitbox(v.kind,x,v.y,z,v.yaw))return false;
      v.climbRetry=.32;
      const p=types[v.kind],span=p.halfZ+(v.kind==="drill"?2.47:p.halfZ)+.25;
      for(const reach of [span,span+.48,span+.94]){
        const [tx,tz]=point(v.x,v.z,v.yaw,0,-reach);
        const top=ground(tx,tz,v.y+4.04,v.y+1.06);
        if(top===null)continue;
        const bed=support(v,tx,tz,top);
        if(!bed||bed.height-v.y>4.01||bed.height-v.y<1.05)continue;
        let clear=true;
        for(let h=v.y+.27;h<bed.height;h+=.27){
          if(hitbox(v.kind,v.x,h,v.z,v.yaw)){clear=false;break;}
        }
        if(!clear||hitbox(v.kind,v.x,bed.height,v.z,v.yaw)||!acrossClear(v,tx,bed.height,tz))continue;
        v.climb={x:tx,y:bed.height,z:tz,startY:v.y,bank:bed.bank,pitch:bed.pitch,up:true};
        v.nitroActive=false;
        v.park=copyPose(v);
        v.report="Subindo "+Math.round(bed.height-v.y)+" blocos";
        return true;
      }
      return false;
    }
    function climbStep(v,dt){
      const ledge=v.climb;
      let x=v.x,y=v.y,z=v.z;
      const dx=ledge.x-v.x,dz=ledge.z-v.z,distance=Math.hypot(dx,dz);
      if(ledge.up){
        y=approach(y,ledge.y,dt*(types[v.kind].tracks?5.6:6.5));
      }else if(distance>0){
        const stride=Math.min(1,dt*(types[v.kind].tracks?4.8:6.3)/distance);
        x+=dx*stride;z+=dz*stride;
      }
      if(hitbox(v.kind,x,y,z,v.yaw)){
        v.climb=null;v.airborne=true;v.speed=0;v.dy=-.6;
        v.report="Subida interrompida";
        return;
      }
      v.x=x;v.y=y;v.z=z;v.speed=0;
      v.tilt=ease(v.tilt,ledge.up?.42:ledge.pitch,8,dt);
      v.bank=ease(v.bank,ledge.up?0:ledge.bank,8,dt);
      if(y>=ledge.y)ledge.up=false;
      if(y===ledge.y&&Math.hypot(ledge.x-x,ledge.z-z)<.025){
        v.climb=null;
        v.park=copyPose(v);
        v.report="";
      }
    }
    function jumpGround(v,dt,input){
      v.dy=Math.max(-19,v.dy-dt*19.8);
      const [nx,nz]=point(v.x,v.z,v.heading,0,-v.speed*dt);
      const ny=v.y+v.dy*dt;
      v.tilt=ease(v.tilt,clamp(v.dy*.047,-.31,.35),5,dt);
      v.bank=ease(v.bank,-input.turn*.16,5,dt);
      if(ny<=1.02||liquid(nx,ny+.12,nz)){
        Object.assign(v,v.park);
        v.speed=v.dy=0;
        v.airborne=false;
        syncPose(v);
        v.report="Recuperado em terra firme";
        return;
      }
      const flatClear=!hitbox(v.kind,nx,ny,nz,v.yaw);
      const x=flatClear?nx:v.x,z=flatClear?nz:v.z;
      const bed=v.dy<=0?support(v,x,z,v.y):null;
      if(bed&&ny<=bed.height+.07&&v.y>=bed.height-.05&&!hitbox(v.kind,x,bed.height,z,v.yaw)){
        v.x=x;v.z=z;v.y=bed.height;
        v.speed*=v.dy<-6.1?.52:.79;
        v.dy=0;v.airborne=false;
        v.park=copyPose(v);
        v.report="Pouso";
        return;
      }
      if(!flatClear)v.speed*=.48;
      if(flatClear||!hitbox(v.kind,x,ny,z,v.yaw)){
        v.x=x;v.y=ny;v.z=z;
      }else if(v.dy>0)v.dy=0;
    }
    function roll(v,dt,input,traction){
      const p=types[v.kind],glider=v.kind==="glider";
      const activeBoost=v.nitroActive?p.boost:1;
      const ceiling=(glider?p.runway:p.top)*traction.pace*activeBoost;
      const pedalBrake=input.brake&&(!glider||input.throttle<=0);
      const braking=pedalBrake||v.speed*input.throttle<-.04;
      const target=pedalBrake?0:input.throttle>=0?input.throttle*ceiling:input.throttle*p.reverse;
      const force=braking?p.brake*(.37+.63*traction.grip):input.throttle?p.accel*(.63+.37*traction.grip)*(v.nitroActive?1.82:1):p.coast;
      v.speed=approach(v.speed,target,dt*force);
      if(glider&&input.takeoff&&!v.takeoffHeld&&v.speed>=7.1&&input.throttle>0&&!hitbox(v.kind,v.x,v.y+.26,v.z,v.yaw)){
        v.park=copyPose(v);v.flying=true;v.dy=3.6;v.launch=.82;v.report="Decolagem";return;
      }
      if(Math.abs(v.speed)<.008){
        v.speed=0;
        return;
      }
      const [x,z]=point(v.x,v.z,v.heading,0,-v.speed*dt);
      const bed=support(v,x,z,v.y);
      if(bed&&!hitbox(v.kind,x,bed.height,z,v.yaw)){
        v.x=x;v.y=bed.height;v.z=z;
        v.park=copyPose(v);
        v.tilt=ease(v.tilt,clamp(bed.pitch,-.39,.39),7,dt);
        const lean=p.tracks?.07:.18;
        v.bank=ease(v.bank,clamp(bed.bank-input.turn*lean*Math.min(1,Math.abs(v.speed)/9),-.38,.38),7,dt);
      }else if(glider&&!bed&&v.speed>5.25&&!hitbox(v.kind,x,v.y,z,v.yaw)){
        v.park=copyPose(v);v.flying=true;v.dy=-1.1;v.x=x;v.z=z;v.report="Planando";
      }else{
        if(!glider&&input.throttle>0&&tryClimb(v,x,z))return;
        stopAtObstacle(v,x,z);
        v.report=bed?"Obstáculo à frente":"Terreno sem apoio";
      }
    }
    function landed(v,x,z,bed,input){
      v.x=x;v.y=bed.height;v.z=z;
      const hard=v.dy< -4.15||Math.abs(v.bank)>.27;
      v.speed*=hard?.27:.63;
      v.flying=false;v.dy=0;v.launch=0;v.stuckTime=0;
      v.park=copyPose(v);
      v.report=hard?"Pouso brusco":"Pouso concluído";
      if(input.takeoff)v.takeoffHeld=true;
      notice(v.report+".");
      persist();
    }
    function recover(v){
      Object.assign(v,v.park);
      v.flying=false;v.speed=v.dy=v.launch=0;
      syncPose(v);
      v.report="Recuperado no último pouso";
      notice("O planador foi recuperado em terra firme.");
      persist();
    }
    function fly(v,dt,input){
      const angle=clamp(input.pitch,-.69,.64),dive=Math.max(0,-angle),lift=Math.max(0,angle);
      const pedal=v.pedaling?3.35:0,drag=.4+v.speed*v.speed*.0053+.66*Math.abs(v.bank);
      v.speed=clamp(v.speed+(dive*4-lift*3.65+pedal-drag-(input.throttle<0?2.5:0))*dt,2.0,types.glider.top);
      const stall=v.speed<(6.5+lift*1.35+Math.abs(v.bank)*1.25);
      v.launch=Math.max(0,(v.launch||0)-dt);
      const glide=-1.42-3.6*dive-.64*Math.abs(v.bank)+Math.min(1.18,lift*v.speed*.128)+(v.pedaling?.92:0);
      const rate=stall?-5.45:clamp(glide,-5.1,.78);
      v.dy=approach(v.dy,rate,dt*(v.launch?1.45:3.8));
      if(v.y>=108.9&&v.dy>0)v.dy=0;
      v.tilt=ease(v.tilt,stall?-.18:angle*.53,4.1,dt);
      v.bank=ease(v.bank,-input.turn*.32,3.8,dt);
      const [x,z]=point(v.x,v.z,v.heading,0,-v.speed*dt);
      const y=clamp(v.y+v.dy*dt,1.02,109);
      if(y<=1.021||liquid(x,y+.08,z)){recover(v);return;}
      const blocked=hitbox(v.kind,x,y,z,v.yaw);
      if(!blocked){
        v.x=x;v.y=y;v.z=z;
        v.stuckTime=0;
        v.report=v.launch?"Decolagem":stall?"Perda de sustentação":v.pedaling?"Pedal e hélice em movimento":"Planando";
        return;
      }
      const bed=support(v,x,z,v.y);
      if(v.dy<=0&&bed&&Math.abs(y-bed.height)<.68&&!hitbox(v.kind,x,bed.height,z,v.yaw)){
        landed(v,x,z,bed,input);return;
      }
      const currentBed=support(v,v.x,v.z,v.y);
      if(v.dy<=0&&currentBed&&y<=currentBed.height+.09&&v.y-currentBed.height<.65&&
         !hitbox(v.kind,v.x,currentBed.height,v.z,v.yaw)){
        landed(v,v.x,v.z,currentBed,input);return;
      }
      if(!hitbox(v.kind,v.x,y,v.z,v.yaw))v.y=y;
      v.stuckTime+=dt;
      v.speed=Math.max(2,v.speed*.62);
      v.dy=Math.min(v.dy,-.65);
      v.report="Obstáculo · alinhe para pousar";
      if(v.stuckTime>1.65)recover(v);
    }
    function workPlan(v,target){
      const cells=excavation(v,target);
      if(!cells.length)return [];
      if(v.kind==="drill"){
        const heading=axis(v,2.49);
        const leading=heading.fx?heading.x:heading.z;
        const chosen=heading.fx?cells[0].x:cells[0].z;
        if((chosen-leading)*(heading.fx||heading.fz)>0){
          const nearer=excavation(v,null);
          if(nearer.some(cell=>inspect(cell,v)!=="open"))return nearer.filter(cell=>inspect(cell,v)==="cut");
        }
        return cells.filter(cell=>inspect(cell,v)==="cut");
      }
      const exposed=new Map(),supports=new Set(),p=types[v.kind];
      for(const u of [-p.halfX*.79,p.halfX*.79])for(const w of [-p.halfZ*.67,p.halfZ*.67]){
        const [x,z]=point(v.x,v.z,v.yaw,u,w);
        supports.add(Math.floor(x)+","+Math.floor(z));
      }
      return cells.filter(cell=>{
        const key=cell.x+","+cell.z;
        const status=supports.has(key)?"blocked":inspect(cell,v);
        if(!exposed.has(key)){
          exposed.set(key,status!=="blocked");
          return status==="cut";
        }
        return exposed.get(key)&&status==="cut";
      });
    }
    function displayPlan(v,target){
      const cutting=lifted(v)?[]:workPlan(v,target);
      v.cutCount=cutting.length;
      workPreview.visible=cutting.length>0&&Math.abs(v.speed)<=1.15;
      for(let i=0;i<workPreview.children.length;i++){
        const mark=workPreview.children[i],cell=cutting[i];
        mark.visible=!!cell;
        if(cell)mark.position.set(cell.x+.5,cell.y+.5,cell.z+.5);
      }
      return cutting;
    }
    function operate(target){
      const v=active;
      if(!v)return false;
      if(v.kind==="cart"){notice("Use Espaço para frear ou E para sair.");return true;}
      if(isBoat(v.kind)){notice("A/D movem os pedais do leme. W/S avançam e recuam. Espaço freia.");return true;}
      if(v.kind==="glider"){
        notice(v.motor?"Segure W para pedalar. Espaço decola após a corrida.":"Aponte para baixo para ganhar velocidade. Use o módulo de pedal no solo.");
        return true;
      }
      if(lifted(v)){notice("Apoie o veículo no solo para escavar.");return true;}
      if(v.cooldown>0)return true;
      if(Math.abs(v.speed)>1.15){notice("Reduza a velocidade antes de escavar.");return true;}
      const cells=displayPlan(v,target),cut=breakArea(cells,v);
      if(cut>0){
        workPreview.visible=false;
        v.cutCount=0;
        v.cooldown=types[v.kind].interval;
        v.report=cut+" "+(cut===1?"bloco retirado":"blocos retirados");
        v.workTime=1.35;
      }else{
        v.report="Sem material escavável na área";
        v.workTime=1.20;
      }
      return true;
    }
    function climbShore(v,input){
      const p=types[v.kind],{wheels}=p,sign=Math.sign(input.throttle);
      const front=Math.max(p.halfZ,wheels.z+wheels.radius);
      for(const reach of [front+.18,front+.68,front+1.18]){
        const [x,z]=point(v.x,v.z,v.yaw,0,-reach*sign);
        const y=tractorGround(v.kind,x,z,v.y,v.yaw,p.step,.1);
        const rise=y-v.y;
        if(y===null||rise<.5||rise>p.step+.01||hitbox(v.kind,v.x,y,v.z,v.yaw)||
          !deckClear(v,v.x,y,v.z,v.yaw)||!acrossClear(v,x,y,z))continue;
        v.climb={x,y,z,up:true,sign};
        v.park={...copyPose(v),onLand:v.onLand};
        v.onLand=true;
        v.speed=Math.min(Math.abs(v.speed),p.dirtTop)*sign;
        v.report="Rodas subindo "+Math.ceil(rise-.01)+" blocos";
        return true;
      }
      return false;
    }
    function tractorClimb(v,dt){
      const {x,z,y,up,sign}=v.climb,p=types[v.kind];
      const distance=Math.hypot(x-v.x,z-v.z);
      const stride=up?0:Math.min(1,p.dirtTop*dt/Math.max(.001,distance));
      const next={x:v.x+(x-v.x)*stride,y:up?approach(v.y,y,2.5*dt):y,z:v.z+(z-v.z)*stride};
      if(hitbox(v.kind,next.x,next.y,next.z,v.yaw)||!deckClear(v,next.x,next.y,next.z,v.yaw)){
        Object.assign(v,v.park);v.renderY=v.y;v.speed=0;v.climb=null;v.report="Subida interrompida";return;
      }
      Object.assign(v,next);
      v.speed=(up?p.dirtTop*.55:p.dirtTop)*sign;
      v.tilt=ease(v.tilt,up?.22:0,7,dt);
      if(v.y===y)v.climb.up=false;
      if(stride===1){v.climb=null;v.park=copyPose(v)}
      v.renderY=v.y;
    }
    function navigate(v,dt,input){
      const p=types[v.kind],throttle=input.brake?0:clamp(input.throttle||0,-1,1);
      if(v.climb){
        if(input.brake)v.speed=0;
        else tractorClimb(v,dt);
        return;
      }
      const turn=clamp(input.turn||0,-1,1);
      v.steer=ease(v.steer,turn,8,dt);
      v.pedaling=!!throttle||Math.abs(v.steer)>.06;
      const yaw=v.yaw+v.steer*p.turn*(.26+Math.min(1,Math.abs(v.speed)*.23))*(v.speed<-.25?-1:1)*dt;
      const heading=boatRoute(v,v.x,v.z,yaw);
      if(heading)v.yaw=yaw;
      const breeze=!v.onLand&&v.deck?.sail?wind(v):null;
      const thrust=breeze?clamp((-Math.sin(v.yaw)*breeze.x-Math.cos(v.yaw)*breeze.z)*.30,0,.38):0;
      const top=v.onLand?p.dirtTop:p.top,reverse=v.onLand?Math.min(1.35,p.reverse):p.reverse;
      const goal=input.brake?0:throttle*(throttle>=0?top:reverse)+(throttle>=0?thrust*top:0);
      const braking=input.brake||v.speed*throttle<-.04;
      v.speed=approach(v.speed,goal,(braking?p.brake:throttle||thrust?p.accel:p.coast)*dt);
      const x=v.x-Math.sin(v.yaw)*v.speed*dt,z=v.z-Math.cos(v.yaw)*v.speed*dt;
      const route=boatRoute(v,x,z,v.yaw);
      if(route){
        Object.assign(v,{x,y:route.y,z,onLand:route.land});
        if(route.land)v.speed=clamp(v.speed,-1.35,p.dirtTop);
        v.report=route.land?"Tração de trator":v.pedaling?"Pedais e leme em movimento":thrust>.05?"Navegando a vela":"À deriva";
        v.park=copyPose(v);
      }else if(p.wheels&&throttle&&Math.sign(v.speed)===Math.sign(throttle)&&climbShore(v,input)){
        return;
      }else{
        v.speed=0;
        v.report=p.wheels?`Passagem bloqueada · subida máxima de ${p.step} blocos`:"Casco bloqueado · verifique o fundo e a margem";
        const bottom=ground(v.x,v.z,v.y-p.draft+.12,v.y-4);
        if(!p.wheels&&!heading&&bottom!==null)v.y=approach(v.y,bottom+p.draft,dt*1.65);
      }
      v.waterClock+=dt;
      const pace=Math.abs(v.speed)/p.top;
      v.bank=ease(v.bank,-v.steer*pace*.17,5,dt);
      v.tilt=ease(v.tilt,v.onLand?0:-pace*.065+Math.sin(v.waterClock*2.7)*.021,5,dt);
      v.renderY=v.onLand?ease(v.renderY,v.y,12,dt):v.y+Math.sin(v.waterClock*3.2)*(.028+pace*.026);
    }
    function deckClear(v,x,y,z,yaw){
      const {blocks,mast,sail}=v.deck;
      for(const {cell} of blocks.values()){
        const corner=cell.size*.45;
        for(const dx of [-corner,corner])for(const dz of [-corner,corner]){
          const [px,pz]=point(x,z,yaw,cell.x+dx,cell.z+dz);
          if(solid(px,y+cell.y+cell.size-.02,pz))return false;
        }
      }
      if(sail){
        const plan=sails[hullKind(v.kind)],angle=plan.angle+v.steer*.19;
        for(const level of [0,.5,1]){
          const [left,right]=sailSpan(plan,level),height=mast.height*(plan.bottom+(plan.top-plan.bottom)*level);
          for(const span of [left,(left+right)*.5,right]){
            const u=span*mast.width;
            const [px,pz]=point(x,z,yaw,mast.x+u*Math.cos(angle),mast.z-u*Math.sin(angle));
            if(solid(px,y+mast.y+.03+height,pz))return false;
          }
        }
        const [px,pz]=point(x,z,yaw,mast.x,mast.z);
        if(solid(px,y+mast.y+mast.height,pz))return false;
      }
      return true;
    }

    function update(dt,input,target){
      const v=active;
      if(!v)return null;
      const previousX=v.x,previousZ=v.z,previousYaw=v.yaw,elapsed=clamp(dt,0,.1);
      const deltaCount=Math.max(1,Math.ceil(elapsed/.020)),step=elapsed/deltaCount;
      const boat=isBoat(v.kind);
      const terrain=v.flying||boat?"normal":surface(v.x,v.y,v.z);
      const traction=groundProfiles[terrain]||groundProfiles.normal;
      v.grip=terrain;
      if(!input.takeoff)v.takeoffHeld=false;
      v.pedaling=v.kind==="glider"&&v.motor&&input.throttle>0;
      if(!input.jump)v.jumpHeld=false;
      const jump=!boat&&v.kind!=="glider"&&!lifted(v)&&input.jump&&!v.jumpHeld;
      if(input.jump)v.jumpHeld=true;
      if(jump){
        v.park=copyPose(v);
        v.airborne=true;
        v.dy=types[v.kind].jumpSpeed;
        v.report="Salto";
      }
      for(let i=0;i<deltaCount;i++){
        if(boat){navigate(v,step,input);continue}
        v.climbRetry=Math.max(0,v.climbRetry-step);
        chargeNitro(v,step,input);
        if(v.climb){climbStep(v,step);continue;}
        turn(v,step,input,traction);
        if(v.flying)fly(v,step,input);
        else if(v.airborne)jumpGround(v,step,input);
        else roll(v,step,input,traction);
      }
      v.cooldown=Math.max(0,v.cooldown-elapsed);
      v.workTime=Math.max(0,(v.workTime||0)-elapsed);
      v.work=v.cooldown>0?Math.sin(Math.PI*v.cooldown/types[v.kind].interval):0;
      if(!boat&&!lifted(v)&&!input.throttle&&v.cooldown===0&&v.workTime===0&&v.kind!=="glider"&&v.report!=="Pouso")v.report="";
      v.yawRate=elapsed>0?angleDelta(previousYaw,v.yaw)/elapsed:0;
      if(!boat)v.renderY=lifted(v)?v.y:ease(v.renderY,v.y,16,elapsed);
      const displaced=elapsed>0?Math.hypot(v.x-previousX,v.z-previousZ)/elapsed:0;
      v.meterSpeed=ease(v.meterSpeed,displaced,11,elapsed);
      player.pos.set(v.x,v.y+types[v.kind].seat,v.z);
      player.fallStart=player.pos.y;
      player.onGround=!lifted(v);
      player.vel.set(0,0,0);
      models.animate(v.rig,v,elapsed);
      workPreviewClock-=elapsed;
      if(workPreviewClock<=0){
        workPreviewClock=.090;
        if(v.kind==="drill"||v.kind==="bucket")displayPlan(v,target);
        else workPreview.visible=false;
      }
      return {vehicle:v,dx:v.x-previousX,dz:v.z-previousZ};
    }
    function blocksPlayer(pos,height){
      return roster.some(v=>{
        const type=types[v.kind],boat=isBoat(v.kind);
        if(v===active||pos.y+height<=v.y+(boat?-type.draft:.16))return false;
        const dx=pos.x-v.x,dz=pos.z-v.z,c=Math.cos(v.yaw),s=Math.sin(v.yaw);
        if(boat){
          const x=dx*c-dz*s,z=dx*s+dz*c,y=pos.y-v.y;
          if(y<v.deck.floor&&Math.abs(x)<type.halfX*.77+.20&&Math.abs(z)<type.halfZ*.88)return true;
          if(hullKind(v.kind)==="ship"){
            const {roof}=shipCabin();
            if(y<roof.y+roof.height*.5&&y+height>roof.y-roof.height*.5&&
              Math.abs(x)<roof.width*.5+.25&&Math.abs(z-roof.z)<roof.depth*.5+.25)return true;
          }
          return [...v.deck.blocks.values()].some(({cell})=>y<cell.y+cell.size&&y+height>cell.y&&
            Math.abs(x-cell.x)<cell.size*.5+.25&&Math.abs(z-cell.z)<cell.size*.5+.25);
        }
        if(pos.y>=v.y+1.18)return false;
        const width=v.kind==="glider"?.67:type.halfX;
        return Math.abs(dx*c-dz*s)<width+.24&&Math.abs(dx*s+dz*c)<1.19;
      });
    }
    function supportsPlayer(pos){
      return roster.some(v=>{
        if(v===active||!v.deck)return false;
        const c=Math.cos(v.yaw),s=Math.sin(v.yaw),dx=pos.x-v.x,dz=pos.z-v.z,x=dx*c-dz*s,z=dx*s+dz*c,y=pos.y-v.y;
        if(Math.abs(y-v.deck.floor)<.12&&Math.abs(x)<types[v.kind].halfX*.77&&Math.abs(z)<types[v.kind].halfZ*.88)return true;
        if(hullKind(v.kind)==="ship"){
          const {roof}=shipCabin();
          if(Math.abs(y-roof.y-roof.height*.5)<.12&&Math.abs(x)<roof.width*.5&&Math.abs(z-roof.z)<roof.depth*.5)return true;
        }
        return [...v.deck.blocks.values()].some(({cell})=>Math.abs(y-cell.y-cell.size)<.12&&Math.abs(x-cell.x)<cell.size*.5&&Math.abs(z-cell.z)<cell.size*.5);
      });
    }
    function updateVisibility(x,z,radius){
      for(const v of roster)v.rig.root.visible=v===active||Math.hypot(x-v.x,z-v.z)<radius;
    }
    return {current,nearest,deploy,spawn,mount,dismount,stash,install,operate,update,snapshot,restore,blocksPlayer,supportsPlayer,
      updateVisibility,deckTarget,buildOnDeck,breakOnDeck,toggleSail,moveCargo};
  }
  return {types,motor,itemData,kindOf,isBoat,hullKind,recipes,excavation,boatScale,boatGeometry,deckLayout,shipCabin,sails,sailSpan,create};
})();

