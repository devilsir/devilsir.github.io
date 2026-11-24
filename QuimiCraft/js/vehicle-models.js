"use strict";

globalThis.QuimiCraftVehicleModels = (() => {
  function create(THREE){
    const box=new THREE.BoxGeometry(1,1,1),wheel=new THREE.CylinderGeometry(1,1,1,12),cone=new THREE.CylinderGeometry(.13,1,1,9);
    const ring=new THREE.TorusGeometry(1,.13,6,20);
    const coilCurve=new THREE.Curve();
    coilCurve.getPoint=(t,target=new THREE.Vector3())=>target.set(.085*Math.cos(t*Math.PI*10),.33*(t-.5),.085*Math.sin(t*Math.PI*10));
    const spring=new THREE.TubeGeometry(coilCurve,30,.017,5,false);
    const flame=new THREE.CylinderGeometry(.025,.095,1,10,1,true);
    const palette={steel:0x496468,edge:0x91a49e,brass:0xb38d48,teal:0x25887e,cream:0xe9d5a6,rust:0xaf5a36,maroon:0x722e44,ink:0x282e34,rubber:0x20292a,wood:0x955b37,seat:0x674739,glass:0x64daca,lamp:0xffcf77,red:0xd57251,chrome:0xc1d0c9,copper:0xcb7d50,caution:0xf3ba4d,boost:0x64eeee,core:0xcafcff};
    const mats=Object.fromEntries(Object.entries(palette).map(([key,color])=>[key,new THREE.MeshStandardMaterial({
      color,roughness:["rubber","cream","seat"].includes(key)?.83:.45,metalness:["steel","edge","brass","chrome","copper"].includes(key)?.52:.04,
      emissive:{lamp:0xb97129,glass:0x173c43,red:0x541b1c,boost:0x20dbf1,core:0x9dfcff}[key]||0,
      emissiveIntensity:key==="boost"||key==="core"?1.45:.65
    })]));
    function mesh(parent,geo,material,x,y,z,w,h,d){
      const part=new THREE.Mesh(geo,mats[material]);
      part.position.set(x,y,z);part.scale.set(w,h,d);
      part.castShadow=true;part.receiveShadow=true;
      parent.add(part);
      return part;
    }
    const plate=(g,m,x,y,z,w,h,d)=>mesh(g,box,m,x,y,z,w,h,d);
    function tube(g,m,a,b,width){
      const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),mid=start.clone().lerp(end,.5);
      const part=mesh(g,wheel,m,mid.x,mid.y,mid.z,width,end.distanceTo(start),width);
      part.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());
      return part;
    }
    function pivot(parent,x,y,z){
      const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;
    }
    const cabinGlass=new THREE.MeshPhysicalMaterial({
      color:0x8dd3db,roughness:.16,metalness:.18,clearcoat:.68,opacity:.27,transparent:true,
      depthWrite:false,side:THREE.DoubleSide
    });
    function pane(g,corners,name){
      const geo=new THREE.BufferGeometry();
      geo.setAttribute("position",new THREE.Float32BufferAttribute(corners.flat(),3));
      geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();
      const window=new THREE.Mesh(geo,cabinGlass);
      window.name=name;g.add(window);
    }
    function cabin(g,y,z,skin,tracked){
      const cab=pivot(g,0,y,z);
      cab.name="Cabine envidraçada";
      const w=tracked?.64:.61,base=.32,high=1.22,front=-.58,shield=-.39,back=.72,deck=.64;
      const f=(side)=>[side*w,base,front],r=(side)=>[side*w,base,back];
      const fTop=(side)=>[side*(w-.055),high,shield],rTop=(side)=>[side*(w-.055),high,deck];
      pane(cab,[f(-1),f(1),fTop(1),fTop(-1)],"Para-brisa");
      pane(cab,[r(1),r(-1),rTop(-1),rTop(1)],"Vidro traseiro");
      for(const side of [-1,1]){
        pane(cab,[f(side),r(side),rTop(side),fTop(side)],"Vidro lateral");
        tube(cab,"edge",f(side),fTop(side),.044);
        tube(cab,"edge",r(side),rTop(side),.05);
        tube(cab,"steel",f(side),r(side),.043);
        tube(cab,"brass",fTop(side),rTop(side),.042);
        tube(cab,"steel",[side*w,base+.025,.41],[side*(w-.055),high,.41],.026);
        plate(cab,skin,side*.61,.286,.29,.065,.12,.76);
        plate(cab,"chrome",side*(w+.041),.379,.40,.031,.043,.16);
        for(const z of [-.41,.58])plate(cab,"ink",side*(w+.02),.31,z,.04,.10,.09);
        tube(cab,"steel",[side*(w-.01),.63,-.49],[side*(w+.16),.64,-.54],.027);
        plate(cab,"ink",side*(w+.17),.64,-.545,.135,.16,.07);
        plate(cab,"chrome",side*(w+.17),.64,-.499,.111,.13,.018);
      }
      tube(cab,"steel",f(-1),f(1),.044);
      tube(cab,"steel",r(-1),r(1),.044);
      const roofZ=(shield+deck)/2;
      plate(cab,"ink",0,high+.013,roofZ,2*w-.02,.083,1.11);
      plate(cab,skin,0,high+.055,roofZ,2*w-.12,.031,1.02);
      plate(cab,"brass",0,high-.001,shield-.045,2*w-.03,.051,.08);
      for(const x of [-.31,.31])plate(cab,"lamp",x,high-.008,shield-.092,.17,.044,.025);
      tube(cab,"ink",[-.235,.37,-.576],[.166,.54,-.542],.015);
      tube(cab,"ink",[.050,.55,-.54],[.293,.529,-.544],.015);
    }
    function tire(parent,x,y,z,r,width,steer=false){
      const joint=pivot(parent,x,y,z),spin=pivot(joint,0,0,0);
      mesh(spin,wheel,"rubber",0,0,0,r,width,r).rotation.z=Math.PI/2;
      mesh(spin,wheel,"steel",0,0,0,r*.76,width+.015,r*.76).rotation.z=Math.PI/2;
      mesh(spin,wheel,"brass",0,0,0,r*.31,width+.076,r*.31).rotation.z=Math.PI/2;
      const side=Math.sign(x)||1;
      mesh(spin,ring,"chrome",side*(width/2+.01),0,0,r*.65,r*.65,r*.53).rotation.y=Math.PI/2;
      mesh(spin,wheel,"ink",side*(width/2+.02),0,0,r*.52,.035,r*.52).rotation.z=Math.PI/2;
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6,c=Math.cos(a),s=Math.sin(a);
        plate(spin,"ink",0,c*r,s*r,width+.04,.052,r*.33).rotation.set(a,i%2?.19:-.19,0);
        if(i%2===0)plate(spin,"edge",side*(width/2+.045),c*r*.49,s*r*.49,.037,r*.49,.038).rotation.x=a;
      }
      return {joint,spin,r,steer,baseY:y};
    }
    function cockpit(g,y,z,housing){
      plate(g,"ink",0,y-.12,z,1.13,.18,.94);
      plate(g,"seat",0,y,z+.23,.77,.18,.57).rotation.x=-.09;
      plate(g,"seat",0,y+.31,z+.57,.77,.62,.14).rotation.x=.17;
      plate(g,housing,0,y+.39,z-.47,1.03,.18,.2);
      for(const x of [-.25,0,.25])plate(g,x===0?"brass":"glass",x,y+.49,z-.48,.12,.03,.10);
      tube(g,"edge",[0,y+.23,z-.47],[0,y+.41,z-.14],.055);
      const steering=pivot(g,0,y+.45,z-.12);
      steering.rotation.x=-Math.PI*.36;
      mesh(steering,ring,"rubber",0,0,0,.24,.24,.22);
      for(const angle of [0,Math.PI*2/3,Math.PI*4/3]){
        const spoke=pivot(steering,0,0,0);
        spoke.rotation.z=angle;
        plate(spoke,"edge",0,.112,0,.031,.19,.027);
      }
      mesh(steering,wheel,"brass",0,0,0,.067,.042,.067).rotation.x=Math.PI/2;
      for(const x of [-.25,.25]){
        mesh(g,wheel,"ink",x,y+.414,z-.35,.081,.032,.081).rotation.x=Math.PI/2;
        plate(g,"lamp",x+.016,y+.415,z-.329,.058,.012,.008).rotation.z=.55;
      }
      for(const x of [-.49,.49]){
        tube(g,"brass",[x,y,z+.56],[x,y+.62,z+.51],.046);
        tube(g,"steel",[x,y+.62,z+.51],[x,y+.50,z-.41],.047);
      }
    }
    function nitroExhaust(g,rig,x,y,z){
      for(const [surface,radius,length,offset] of [["steel",.106,.28,-.14],["copper",.114,.064,0],["ink",.081,.069,.032],["glass",.064,.015,.074]]){
        mesh(g,wheel,surface,x,y,z+offset,radius,length,radius).rotation.x=Math.PI/2;
      }
      const jet=pivot(g,x,y,z+.082);
      const halo=mesh(jet,flame,"boost",0,0,.32,1,.64,1);
      halo.rotation.x=Math.PI/2;
      const core=mesh(jet,flame,"core",0,0,.21,.57,.42,.57);
      core.rotation.x=Math.PI/2;
      halo.castShadow=halo.receiveShadow=core.castShadow=core.receiveShadow=false;
      jet.visible=false;
      rig.boostFlames.push(jet);
    }
    function chassis(g,kind){
      const tracked=kind!=="cart",width=kind==="cart"?1.21:1.46,skin=kind==="cart"?"teal":kind==="drill"?"rust":"maroon";
      const rig={root:g,wheels:[],tracks:[],boostFlames:[],kind};
      plate(g,"steel",0,.43,0,width,.3,2.33);
      plate(g,skin,0,.68,-.23,width-.04,.32,1.7);
      plate(g,"ink",0,.52,-1.22,width+.25,.17,.22);
      plate(g,"edge",0,.435,-1.34,width+.26,.083,.08);
      plate(g,"ink",0,.50,1.18,width+.06,.13,.23);
      plate(g,"chrome",0,.60,1.283,width+.12,.067,.10);
      plate(g,"ink",0,.71,1.225,.25,.16,.12);
      plate(g,"glass",0,.72,1.294,.17,.08,.026);
      for(const x of [-.32,.32])nitroExhaust(g,rig,x,.47,1.23);
      for(const x of [-width/2-.06,width/2+.06]){
        tube(g,"steel",[x,.56,-1.38],[x,.53,1.23],.086);
        plate(g,"brass",x,.63,-.84,.1,.27,.23);
        plate(g,"brass",x,.65,.76,.1,.26,.24);
        const side=Math.sign(x);
        plate(g,"ink",x,.73,-1.25,.29,.26,.16).rotation.z=side*.12;
        mesh(g,wheel,"chrome",x,.73,-1.331,.114,.069,.114).rotation.x=Math.PI/2;
        mesh(g,wheel,"lamp",x,.73,-1.37,.085,.041,.085).rotation.x=Math.PI/2;
        plate(g,"ink",x*.95,.73,1.22,.25,.148,.105);
        plate(g,"red",x*.95,.745,1.285,.17,.067,.028);
        plate(g,skin,x*.98,.737,.32,.11,.26,.70);
        plate(g,"chrome",x*1.071,.82,.32,.032,.034,.71);
        for(const z of [.043,.18,.317]){
          const louver=plate(g,"ink",x*1.071,.72,z,.031,.087,.052);
          louver.rotation.x=-.34;
        }
        if(tracked){
          plate(g,"rubber",x,.38,0,.36,.56,2.35);
          for(const z of [-.81,-.27,.27,.81])rig.wheels.push(tire(g,x,.39,z,.33,.36));
          plate(g,skin,x,.78,.03,.40,.13,1.68);
          plate(g,"caution",x+side*.207,.785,.68,.025,.07,.35);
          plate(g,"ink",x+side*.207,.785,.68,.028,.07,.07).rotation.x=.55;
          const belt=[];
          for(let i=0;i<9;i++)belt.push(plate(g,i%2?"steel":"edge",x,.675,i*.255-1.02,.39,.068,.082));
          rig.tracks.push(belt);
        }else{
          for(const z of [-.84,.88]){
            rig.wheels.push(tire(g,x*1.13,.41,z,.40,.29,z<0));
            tube(g,"ink",[x*.74,.45,z],[x*.74,.82,z],.036);
            mesh(g,spring,"copper",x*.74,.63,z,1,1,1);
            plate(g,skin,x*1.11,.887,z,.36,.087,.52);
            for(const dir of [-1,1])plate(g,skin,x*1.11,.821,z+dir*.305,.36,.08,.2).rotation.x=dir*.54;
          }
          const tail=[x*.84,.77,.71],joint=[x,.88,1.12],end=[x,1.18,1.32];
          tube(g,"steel",tail,joint,.075);tube(g,"brass",joint,end,.097);
          plate(g,"ink",end[0],end[1]+.03,end[2],.11,.073,.13);
          plate(g,"edge",x*.84,.78,-.49,.18,.13,.89);
        }
      }
      cockpit(g,tracked?1.04:.89,tracked?.41:.39,skin);
      cabin(g,tracked?1.04:.89,tracked?.41:.39,skin,tracked);
      if(kind==="cart"){
        plate(g,"rust",0,.86,-.84,.71,.3,.52);
        plate(g,"brass",0,1.035,-.84,.62,.075,.42);
        plate(g,"ink",0,.70,-1.126,.66,.29,.14);
        plate(g,"copper",0,.836,-1.201,.64,.043,.09);
        for(let i=0;i<7;i++)plate(g,"brass",i*.083-.249,.70,-1.21,.028,.233,.06).rotation.z=.18;
        for(let i=0;i<4;i++)plate(g,"ink",i*.13-.195,1.077,-.83,.056,.028,.22);
        plate(g,"glass",.21,.91,-1.105,.15,.11,.04);
        tube(g,"edge",[-.31,.99,-.85],[-.62,.82,-.69],.049);
        tube(g,"edge",[.31,.99,-.85],[.62,.82,-.69],.049);
        for(const [x,z] of [[-.39,.95],[.39,1.01]]){
          const drum=mesh(g,wheel,"rust",x,.83,z,.13,.30,.13);drum.rotation.z=.14;
          mesh(g,wheel,"brass",x,.995,z,.11,.04,.11);
        }
        tube(g,"brass",[.39,.92,1.05],[.63,1.64,1.12],.038);
        plate(g,"cream",.72,1.63,1.12,.23,.18,.038);
      }else if(kind==="drill"){
        for(const x of [-.45,.45])tube(g,"edge",[x,1.02,-.82],[x*.66,.68,-1.42],.092);
        plate(g,"brass",0,.86,-1.19,.79,.68,.32);
        rig.drill=pivot(g,0,.89,-1.24);
        mesh(rig.drill,cone,"steel",0,0,-.60,.58,1.19,.58).rotation.x=-Math.PI/2;
        for(let i=0;i<20;i++){
          const angle=i*.76,radius=.57-i*.024;
          plate(rig.drill,i%2?"edge":"brass",Math.cos(angle)*radius,Math.sin(angle)*radius,-.12-i*.047,.154,.105,.142).rotation.z=angle;
        }
        plate(g,"glass",0,1.27,-.90,.30,.13,.13);
      }else{
        const turntable=pivot(g,0,.85,-.38);
        mesh(turntable,wheel,"brass",0,.0,0,.48,.13,.46);
        const boom=pivot(turntable,0,.08,-.02);
        tube(boom,"rust",[0,0,0],[0,1.08,-.74],.155);
        tube(boom,"edge",[.17,.13,0],[.17,1,-.54],.065);
        tube(boom,"edge",[-.17,.13,0],[-.17,1,-.54],.065);
        const stick=pivot(boom,0,1.08,-.74);
        tube(stick,"rust",[0,0,0],[0,-.89,-.71],.12);
        tube(stick,"steel",[.14,-.06,-.03],[.14,-.73,-.55],.062);
        const shovel=pivot(stick,0,-.88,-.72);
        plate(shovel,"steel",0,-.10,-.11,1.14,.41,.24).rotation.x=-.25;
        plate(shovel,"edge",0,-.26,-.30,1.13,.108,.49);
        for(const x of [-.46,-.23,0,.23,.46])plate(shovel,"brass",x,-.25,-.58,.113,.086,.18);
        for(const side of [-1,1])plate(shovel,"rust",side*.52,-.10,-.28,.11,.37,.42);
        rig.boom=boom;rig.stick=stick;rig.shovel=shovel;
      }
      return rig;
    }
    function wingCell(g,x,y,z,w,h,d){
      const joint=pivot(g,x,y,z);joint.rotation.z=Math.sign(x)*.10;
      for(const ly of [0,h]){
        plate(joint,"cream",0,ly,0,w,.046,d);
        for(const u of [-w/2,w/2])tube(joint,"wood",[u,ly,-d/2],[u,ly,d/2],.035);
        for(const v of [-d/2,d/2])tube(joint,"wood",[-w/2,ly,v],[w/2,ly,v],.034);
      }
      for(const u of [-w/2,w/2]){
        plate(joint,"cream",u,h/2,0,.038,h,d);
        for(const v of [-d/2,d/2])tube(joint,"wood",[u,0,v],[u,h,v],.034);
      }
      for(const v of [-d/2,d/2]){
        tube(joint,"edge",[-w/2,.025,v],[w/2,h-.025,v],.015);
        tube(joint,"edge",[w/2,.025,v],[-w/2,h-.025,v],.015);
      }
    }
    function glider(g){
      const rig={root:g,kind:"glider",wheels:[],tracks:[]};
      for(const side of [-1,1]){
        const x=side*.30;
        tube(g,"wood",[x,.35,1.28],[x,.80,-2.63],.047);
        tube(g,"wood",[x,.35,.98],[x,1.26,.87],.048);
        tube(g,"wood",[x,1.27,1.06],[x,1.02,-2.4],.047);
        tube(g,"steel",[x,1.21,1.02],[x,.33,-.52],.021);
        for(const u of [1.08,2.15])wingCell(g,u*side,1.16,.27,1.10,.91,1.57);
        rig.wheels.push(tire(g,x*1.83,.27,.31,.265,.103));
        tube(g,"steel",[x*1.82,.29,.31],[x,.96,.24],.037);
      }
      plate(g,"cream",0,.85,-1.44,.66,.34,1.95);
      for(const x of [-.34,.34])plate(g,"rust",x,.97,-1.44,.035,.058,1.88);
      wingCell(g,0,.87,-2.55,1.52,.65,1.0);
      rig.wheels.push(tire(g,0,.145,-1.75,.14,.07));
      cockpit(g,.92,.33,"wood");
      const drive=pivot(g,0,.67,.63);
      rig.drive=drive;drive.visible=false;
      tube(drive,"brass",[0,.27,-.45],[0,-.15,-.68],.045);
      tube(drive,"teal",[0,.26,-.44],[0,.36,.49],.09);
      const pedal=pivot(drive,0,-.16,-.60);
      rig.pedals=pedal;
      mesh(pedal,wheel,"brass",0,0,0,.143,.087,.143).rotation.z=Math.PI/2;
      for(const side of [-1,1]){
        tube(pedal,"steel",[0,0,0],[side*.2,side*.16,0],.036);
        plate(pedal,"rubber",side*.25,side*.16,0,.15,.049,.103);
        tube(drive,"ink",[side*.12,-.09,-.57],[side*.12,.37,.45],.037);
      }
      const prop=pivot(drive,0,.44,.72);
      mesh(prop,wheel,"brass",0,0,0,.136,.151,.136).rotation.x=Math.PI/2;
      for(const side of [-1,1]){
        const blade=plate(prop,"wood",side*.49,side*.035,0,.87,.161,.071);
        blade.rotation.z=.16;
        plate(prop,"brass",side*.86,side*.10,0,.14,.13,.083);
      }
      rig.prop=prop;
      rig.belt=[];
      for(let i=0;i<12;i++)rig.belt.push(plate(drive,"edge",.12,0,0,.037,.039,.063));
      return rig;
    }
    function build(kind){
      const root=new THREE.Group();
      root.name="Veículo · "+kind;
      return kind==="glider"?glider(root):chassis(root,kind);
    }
    function animate(rig,v,dt){
      rig.root.position.set(v.x,v.renderY??v.y,v.z);
      rig.root.rotation.set(v.tilt||0,v.yaw,v.bank||0,"YXZ");
      const speed=v.speed||0,turn=v.yawRate||0;
      for(const tire of rig.wheels){
        const groundSpeed=speed+turn*tire.joint.position.x;
        tire.speed=v.flying?(tire.speed||0)*Math.exp(-1.8*dt):groundSpeed;
        tire.spin.rotation.x+=tire.speed*dt/tire.r;
        if(rig.kind==="cart"){
          const flex=v.airborne?-.055:tire.joint.position.z*(v.tilt||0)*.25-tire.joint.position.x*(v.bank||0)*.22;
          tire.joint.position.y+=(tire.baseY+flex-tire.joint.position.y)*(1-Math.exp(-11*dt));
        }
        if(tire.steer)tire.joint.rotation.y=(v.steer||0)*.46;
      }
      if(rig.boostFlames){
        rig.jetTime=(rig.jetTime||0)+dt;
        for(let i=0;i<rig.boostFlames.length;i++){
          const jet=rig.boostFlames[i];
          jet.visible=!!v.nitroActive;
          if(jet.visible){
            const pulse=1+.18*Math.sin(rig.jetTime*40+i*2.4);
            jet.scale.set(.9+pulse*.1,.9+pulse*.1,pulse);
          }
        }
      }
      rig.tracks.forEach((belt,side)=>{
        const pace=speed+turn*(side===0?-.84:.84);
        const phase=((belt[0].userData.phase||0)+pace*dt/3)%1;
        belt[0].userData.phase=phase;
        belt.forEach((bar,i)=>{
          const p=((i/belt.length+phase)%1+1)%1;
          bar.position.z=(p-.5)*2.25;
        });
      });
      const swing=v.work||0;
      if(rig.drill)rig.drill.rotation.z+=dt*(swing>0?18:0);
      if(rig.boom){
        rig.boom.rotation.x=-.12+swing*.48;
        rig.stick.rotation.x=.14-swing*.69;
        rig.shovel.rotation.x=-.08+swing*.99;
      }
      if(rig.drive){
        rig.drive.visible=!!v.motor;
        const cadence=v.pedaling?7.7+Math.min(2.4,Math.abs(speed)*.12):0;
        const smoothing=1-Math.exp(-dt*4.6);
        rig.cadence=(rig.cadence||0)+(cadence-(rig.cadence||0))*smoothing;
        rig.pedals.rotation.x-=dt*rig.cadence;
        rig.prop.rotation.z+=dt*rig.cadence*4.9;
        const traveled=-rig.pedals.rotation.x*.35;
        for(let i=0;i<rig.belt.length;i++){
          const phase=(i/rig.belt.length+traveled)%1,forward=phase<.5,t=forward?phase*2:(1-phase)*2;
          rig.belt[i].position.set(forward?.145:.095,-.09+t*.46,-.57+t*1.02);
          rig.belt[i].rotation.x=-.43;
        }
      }
    }
    return {build,animate};
  }
  return {create};
})();

