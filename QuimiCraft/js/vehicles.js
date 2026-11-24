"use strict";

globalThis.QuimiCraftVehicles = (() => {
  const types={
    cart:{item:"kit_cart",name:"Carrinho de Engenhocas",color:"#43a99c",halfX:1.03,halfZ:1.42,height:2.18,seat:.12,place:2.65,top:13.2,reverse:4.0,accel:5.2,brake:11.7,coast:2.6,turn:1.45,tracks:false,jumpSpeed:8.5,boost:1.44},
    drill:{item:"kit_drill",name:"Escavadeira de Broca",color:"#c67e53",halfX:1.08,halfZ:1.48,height:2.33,seat:.24,place:3.0,top:3.65,reverse:1.8,accel:2.65,brake:8.4,coast:3.5,turn:1.02,tracks:true,jumpSpeed:7.1,boost:1.29,interval:.74},
    bucket:{item:"kit_excavator",name:"Escavadeira de Caçamba",color:"#bc738f",halfX:1.08,halfZ:1.48,height:2.33,seat:.24,place:3.0,top:4.65,reverse:2.3,accel:3.05,brake:9.2,coast:3.9,turn:1.23,tracks:true,jumpSpeed:7.5,boost:1.34,interval:1.03},
    glider:{item:"kit_glider",name:"14-bis de Campo",color:"#e2bf83",halfX:2.68,halfZ:2.87,height:2.18,seat:.14,place:3.7,top:23,runway:11.2,reverse:2.4,accel:2.9,brake:7,coast:2.2,turn:.98,tracks:false}
  };
  const motor="pedal_drive";
  const itemData={...Object.fromEntries(Object.values(types).map(v=>[v.item,[v.name,v.color]])),
    [motor]:["Módulo de Pedal e Correia","#cfad67"]};
  const kindOf=id=>Object.keys(types).find(key=>types[key].item===id);
  function recipes(B){
    return [
      ["kit_cart",[[B.IRON,5],[B.PLANK,6],["copper_ingot",2],["hide",4]]],
      ["kit_drill",[[B.IRON,9],["copper_ingot",4],["voltaic_cell",1],["hide",5]]],
      ["kit_excavator",[[B.IRON,8],["bronze_ingot",3],["voltaic_cell",1],["hide",5]]],
      ["kit_glider",[[B.PLANK,8],["wool",7],["stick",5],["copper_ingot",2]]],
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

  function create({THREE,scene,models,player,solid,ground,liquid,protectedPosition,exchange,breakArea,inspect=()=>"cut",surface=()=>"normal",notice,persist}){
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
    function add(kind,pose,id=++serial,motorized=false){
      const rig=models.build(kind);
      const v={kind,id,...pose,motor:motorized,speed:0,dy:0,steer:0,tilt:0,bank:0,work:0,
        cooldown:0,flying:false,pedaling:false,park:copyPose(pose),rig,
        airborne:false,climb:null,climbRetry:0,nitro:100,nitroActive:false,nitroDelay:0,nitroLock:false,
        jumpHeld:false,meterSpeed:0};
      syncPose(v);
      root.add(rig.root);
      roster.push(v);
      models.animate(rig,v,0);
      return v;
    }
    function snapshot(){
      return {version:1,roster:roster.map(v=>({kind:v.kind,id:v.id,motor:v.motor,
        ...(v.kind==="glider"?{}:{nitro:v.nitro}),...(lifted(v)?v.park:copyPose(v))}))};
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
        const vehicle=add(row.kind,copyPose(row),id,row.kind==="glider"&&row.motor===true);
        if(row.kind!=="glider"&&Number.isFinite(row.nitro))vehicle.nitro=clamp(row.nitro,0,100);
      }
    }
    function hitbox(kind,x,y,z,yaw){
      const type=types[kind],halfX=type.halfX,halfZ=type.halfZ,glider=kind==="glider";
      if(active&&roster.some(other=>other!==active&&Math.abs(other.y-y)<1.4&&Math.hypot(x-other.x,z-other.z)<(glider||other.kind==="glider"?3.7:2.38)))return true;
      for(let i=0;i<=Math.ceil(halfX*4);i++){
        const u=-halfX+Math.min(halfX*2,i*.5);
        for(let j=0;j<=Math.ceil(halfZ*4);j++){
          const v=-halfZ+Math.min(halfZ*2,j*.5);
          if(glider&&Math.abs(u)>.83&&(v<-1.13||v>1.14))continue;
          const [px,pz]=point(x,z,yaw,u,v);
          let bottom=glider&&Math.abs(u)>.83?y+1.01:y+.07;
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
        if(kind&&v.kind!==kind||Math.abs(v.y-player.pos.y)>2.65)continue;
        const d=Math.hypot(v.x-player.pos.x,v.z-player.pos.z);
        if(d<dist){best=v;dist=d;}
      }
      return best;
    }
    function overlaps(x,y,z,kind){
      return roster.some(v=>Math.abs(v.y-y)<2.45&&Math.hypot(v.x-x,v.z-z)<(v.kind==="glider"||kind==="glider"?4.0:2.55));
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
      const x=inAir?player.pos.x:target?target.x+.5:player.pos.x-Math.sin(yaw)*type.place;
      const z=inAir?player.pos.z:target?target.z+.5:player.pos.z-Math.cos(yaw)*type.place;
      const center=inAir?player.pos.y:ground(x,z,player.pos.y+2,player.pos.y-4);
      const y=inAir||center===null?center:support({kind,yaw},x,z,center)?.height??null;
      if(y===null||hitbox(kind,x,y,z,yaw)||(!inAir&&liquid(x,y+.08,z))||overlaps(x,y,z,kind)){
        notice("Procure espaço livre para montar o veículo.");return false;
      }
      if(!inAir&&Math.hypot(x-player.pos.x,z-player.pos.z)<(kind==="glider"?2.4:1.95)){
        notice("Afaste-se um pouco para abrir o kit.");return false;
      }
      const recovery=inAir?safeParking(x,y,z,yaw):null;
      if(inAir&&!recovery){notice("Abra o planador perto de terra firme para poder recuperá-lo.");return false;}
      const result=exchange([[id,1]],[]);
      if(!result.ok){notice(result.message);return false;}
      const v=add(kind,{x,y,z,yaw});
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
    function mount(v=nearest()){
      if(!v||active||!roster.includes(v)||Math.hypot(player.pos.x-v.x,player.pos.z-v.z)>4.5||Math.abs(player.pos.y-v.y)>2.65)return false;
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
      if(!cancel){
        for(const side of [-1,1]){
          const [x,z]=point(v.x,v.z,v.yaw,side*(types[v.kind].halfX+.65),.16);
          const y=ground(x,z,v.y+1.1,v.y-1.3);
          if(y!==null&&!solid(x,y+.05,z)&&!solid(x,y+1.3,z)&&!liquid(x,y+.14,z)&&!protectedPosition(x,y,z)){
            exit=[x,y,z];break;
          }
        }
        if(!exit){notice("Deixe espaço em um dos lados para sair.");return false;}
        player.pos.set(...exit);
        player.onGround=true;
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
      const items=[[types[v.kind].item,1],...(v.motor?[[motor,1]]:[])];
      const result=exchange([],items);
      if(result.ok){root.remove(v.rig.root);roster.splice(roster.indexOf(v),1);persist();notice("Veículo recolhido.");}
      else notice(result.message);
      return true;
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
    function update(dt,input,target){
      const v=active;
      if(!v)return null;
      const previousX=v.x,previousZ=v.z,previousYaw=v.yaw,elapsed=clamp(dt,0,.1);
      const deltaCount=Math.max(1,Math.ceil(elapsed/.020)),step=elapsed/deltaCount;
      const terrain=v.flying?"normal":surface(v.x,v.y,v.z);
      const traction=groundProfiles[terrain]||groundProfiles.normal;
      v.grip=terrain;
      if(!input.takeoff)v.takeoffHeld=false;
      v.pedaling=v.kind==="glider"&&v.motor&&input.throttle>0;
      if(!input.jump)v.jumpHeld=false;
      const jump=v.kind!=="glider"&&!lifted(v)&&input.jump&&!v.jumpHeld;
      if(input.jump)v.jumpHeld=true;
      if(jump){
        v.park=copyPose(v);
        v.airborne=true;
        v.dy=types[v.kind].jumpSpeed;
        v.report="Salto";
      }
      for(let i=0;i<deltaCount;i++){
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
      if(!lifted(v)&&!input.throttle&&v.cooldown===0&&v.workTime===0&&v.kind!=="glider"&&v.report!=="Pouso")v.report="";
      v.yawRate=elapsed>0?angleDelta(previousYaw,v.yaw)/elapsed:0;
      v.renderY=lifted(v)?v.y:ease(v.renderY,v.y,16,elapsed);
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
        if(v===active||pos.y+height<=v.y+.16||pos.y>=v.y+1.18)return false;
        const dx=pos.x-v.x,dz=pos.z-v.z,c=Math.cos(v.yaw),s=Math.sin(v.yaw);
        const width=v.kind==="glider"?.67:types[v.kind].halfX;
        return Math.abs(dx*c-dz*s)<width+.24&&Math.abs(dx*s+dz*c)<1.19;
      });
    }
    function updateVisibility(x,z,radius){
      for(const v of roster)v.rig.root.visible=v===active||Math.hypot(x-v.x,z-v.z)<radius;
    }
    return {current,nearest,deploy,mount,dismount,stash,install,operate,update,snapshot,restore,blocksPlayer,updateVisibility};
  }
  return {types,motor,itemData,kindOf,recipes,excavation,create};
})();

