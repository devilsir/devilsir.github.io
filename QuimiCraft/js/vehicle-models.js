"use strict";

globalThis.QuimiCraftVehicleModels = (() => {
  function create(THREE){
    const box=new THREE.BoxGeometry(1,1,1),wheel=new THREE.CylinderGeometry(1,1,1,12),cone=new THREE.CylinderGeometry(.13,1,1,9);
    const padded=new THREE.BoxGeometry(1,1,1,4,4,4),points=padded.getAttribute("position"),inner=new THREE.Vector3(),p=new THREE.Vector3();
    for(let i=0;i<points.count;i++){
      p.fromBufferAttribute(points,i);inner.copy(p).clampScalar(-.36,.36);
      p.sub(inner).normalize().multiplyScalar(.14).add(inner);points.setXYZ(i,p.x,p.y,p.z);
    }
    padded.computeVertexNormals();
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
        const sill=[side*(w-.025),-.19,front+.03],rearSill=[side*(w-.025),-.19,back-.015];
        mesh(cab,padded,skin,side*(w-.027),.063,(front+back)*.5,.083,.51,1.31);
        tube(cab,"steel",sill,rearSill,.035);
        tube(cab,"edge",sill,f(side),.028);
        tube(cab,"edge",rearSill,r(side),.028);
        plate(cab,"steel",side*(w+.012),-.147,.16,.032,.043,.91);
        plate(cab,"ink",side*(w-.022),.36,.17,.052,.107,.82);
        plate(cab,"seat",side*(w-.039),.392,.22,.049,.088,.64);
        plate(cab,"brass",side*(w-.019),.415,.31,.027,.028,.155);
        plate(cab,"chrome",side*(w+.041),.379,.40,.031,.043,.16);
        for(const z of [-.41,.58])plate(cab,"ink",side*(w+.02),.31,z,.04,.10,.09);
        tube(cab,"steel",[side*(w-.01),.63,-.49],[side*(w+.16),.64,-.54],.027);
        plate(cab,"ink",side*(w+.17),.64,-.545,.135,.16,.07);
        plate(cab,"chrome",side*(w+.17),.64,-.499,.111,.13,.018);
      }
      mesh(cab,padded,skin,0,.063,front+.045,2*w-.04,.50,.10);
      mesh(cab,padded,skin,0,.052,back-.037,2*w-.035,.49,.10);
      plate(cab,"edge",0,-.182,back-.025,2*w-.06,.068,.11);
      tube(cab,"steel",f(-1),f(1),.044);
      tube(cab,"steel",r(-1),r(1),.044);
      tube(cab,"edge",[0,base,front],[0,high,shield],.016);
      const roofZ=(shield+deck)/2;
      plate(cab,"ink",0,high+.013,roofZ,2*w-.02,.083,1.11);
      plate(cab,skin,0,high+.055,roofZ,2*w-.12,.031,1.02);
      plate(cab,"brass",0,high-.001,shield-.045,2*w-.03,.051,.08);
      plate(cab,"ink",0,high-.040,roofZ,1.05,.033,.83);
      for(const x of [-.212,.212])plate(cab,"seat",x,high-.064,shield+.127,.307,.037,.177).rotation.x=.10;
      plate(cab,"chrome",0,high-.135,shield+.065,.25,.092,.036);
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
    function cockpit(g,y,z,housing,rig){
      const plane=rig.kind==="glider",width=plane?.84:1.13,s=plane?.85:1;
      const cab=pivot(g,0,y,z);cab.name="Interior da cabine";
      rig.cockpitView=pivot(cab,0,.80,.23);
      plate(cab,"ink",0,-.12,0,width,.18,.96);
      for(const x of [-width*.42,width*.42])plate(cab,"edge",x,-.02,-.15,.042,.027,.53);
      mesh(cab,padded,"seat",0,0,.23,.71*s,.16,.55).rotation.x=-.09;
      mesh(cab,padded,"seat",0,.275,.55,.71*s,.55,.15).rotation.x=.17;
      mesh(cab,padded,"ink",0,.555,.614,.32*s,.137,.14).rotation.x=.13;
      for(const side of [-1,1]){
        mesh(cab,padded,"seat",side*.29*s,.074,.27,.155*s,.122,.47).rotation.z=side*.11;
        tube(cab,"edge",[side*.296*s,.544,.558],[side*.184*s,.118,.494],.022);
        partSeatBelt(side);
      }
      for(const x of [-.19,-.096,0,.096,.19])plate(cab,"ink",x*s,.291,.468,.014,.247,.015).rotation.x=.17;
      mesh(cab,padded,housing,0,.386,-.443,.99*s,.226,.287);
      plate(cab,"ink",0,.414,-.269,.86*s,.179,.066).rotation.x=.25;
      plate(cab,"brass",0,.537,-.394,.91*s,.035,.248).rotation.x=.02;
      rig.gauges=[];
      for(const [i,px] of [-.246,0,.246].entries()){
        const gauge=pivot(cab,px*s,.437,-.223);gauge.rotation.x=.25;
        mesh(gauge,wheel,"brass",0,0,0,.074,.029,.074).rotation.x=Math.PI/2;
        mesh(gauge,wheel,"ink",0,0,.019,.061,.018,.061).rotation.x=Math.PI/2;
        for(let k=0;k<6;k++){
          const a=-2.49+k*.83,tick=plate(gauge,k===5?"red":"edge",Math.sin(a)*.044,Math.cos(a)*.044,.030,.007,.014,.005);
          tick.rotation.z=-a;
        }
        const needle=pivot(gauge,0,0,.038);
        plate(needle,i===1?"glass":"lamp",0,.016,0,.008,.048,.008);
        rig.gauges.push(needle);
      }
      tube(g,"edge",[0,y+.23,z-.47],[0,y+.41,z-.14],.055);
      const controls=pivot(cab,0,.432,-.09);controls.rotation.x=plane?-.66:-1.02;
      const steering=pivot(controls,0,0,0);rig.steering=steering;
      if(plane){
        for(const side of [-1,1]){
          tube(steering,"steel",[0,0,0],[side*.166,-.039,0],.030);
          tube(steering,"rubber",[side*.166,-.040,0],[side*.224,.138,0],.045);
        }
      }else{
        mesh(steering,ring,"rubber",0,0,0,.215,.215,.20);
        for(const angle of [0,Math.PI*2/3,Math.PI*4/3]){
          const spoke=pivot(steering,0,0,0);spoke.rotation.z=angle;
          plate(spoke,"edge",0,.099,0,.029,.172,.026);
        }
      }
      mesh(steering,wheel,"brass",0,0,0,.054,.033,.054).rotation.x=Math.PI/2;
      for(const x of [-.31,.31]){
        const sx=Math.sign(x);
        plate(cab,"ink",x*s,.115,.034,.126,.036,.26);
        const lever=pivot(cab,x*s,.129,.082);lever.rotation.x=sx*.31;
        tube(lever,"edge",[0,0,0],[0,.194,-.028],.019);
        mesh(lever,padded,plane?"wood":sx>0?"brass":"rubber",0,.188,-.031,.048,.055,.044);
      }
      function partSeatBelt(side){
        tube(cab,"ink",[side*.267*s,.447,.475],[side*.159*s,.085,.222],.019);
        plate(cab,"brass",side*.149*s,.115,.221,.054,.039,.041).rotation.x=.44;
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
      cockpit(g,tracked?1.04:.89,tracked?.41:.39,skin,rig);
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
      return joint;
    }
    function glider(g){
      const rig={root:g,kind:"glider",wheels:[],tracks:[]};
      for(const side of [-1,1]){
        const x=side*.30;
        tube(g,"wood",[x,.35,1.28],[x,.80,-2.63],.047);
        tube(g,"wood",[x,.35,.98],[x,1.26,.87],.048);
        tube(g,"wood",[x,1.27,1.06],[x,1.02,-2.4],.047);
        tube(g,"steel",[x,1.21,1.02],[x,.33,-.52],.021);
        const inner=wingCell(g,side*1.08,1.16,.27,1.10,.91,1.57);
        const outer=wingCell(g,side*2.15,1.16,.27,1.10,.91,1.57);
        inner.updateMatrix();outer.updateMatrix();
        const anchor=(joint,u,y,z)=>new THREE.Vector3(u,y,z).applyMatrix4(joint.matrix).toArray();
        for(const z of [-.730,.728])for(const y of [0,.91]){
          const root=anchor(inner,-side*.55,y,z);
          tube(g,"wood",[0,root[1],root[2]],root,.043);
          tube(g,"edge",anchor(inner,side*.54,y,z),anchor(outer,-side*.55,y,z),.031);
          if(!y)tube(g,"steel",[x,.411,z+.32],root,.029);
        }
        tube(g,"edge",[x,1.263,.85],anchor(inner,0,.91,-.69),.028);
        const main=tire(g,x*1.83,.27,.31,.265,.103);
        rig.wheels.push(main);
        const axle=main.joint.position.toArray();
        tube(g,"steel",axle,[x,.45,-.03],.042).name="Montante do trem principal";
        tube(g,"edge",axle,[x,.391,.89],.032).name="Escora do trem principal";
        tube(g,"steel",[x,.35,.98],[x,.419,-.36],.047);
      }
      tube(g,"brass",[-.55,.27,.31],[.55,.27,.31],.031).name="Eixo do trem principal";
      plate(g,"cream",0,.85,-1.44,.66,.34,1.95);
      for(const x of [-.34,.34])plate(g,"rust",x,.97,-1.44,.035,.058,1.88);
      wingCell(g,0,.87,-2.55,1.52,.65,1.0);
      const nose=tire(g,0,.145,-1.75,.14,.07);
      rig.wheels.push(nose);
      for(const side of [-1,1]){
        const hub=[side*.052,.145,-1.75],elbow=[side*.098,.486,-1.70];
        tube(g,"steel",hub,elbow,.033).name="Garfo da roda dianteira";
        tube(g,"wood",elbow,[side*.293,.669,-1.60],.045).name="Ancoragem da roda dianteira";
        tube(g,"edge",elbow,[side*.283,.724,-2.12],.026);
      }
      tube(g,"brass",[-.074,.145,-1.75],[.074,.145,-1.75],.020);
      cockpit(g,.92,.33,"wood",rig);
      const frame=[[-.366,1.18,-.220],[.366,1.18,-.220],[.302,1.53,-.071],[-.302,1.53,-.071]];
      pane(g,frame,"Para-brisa da aeronave");
      for(let i=0;i<4;i++)tube(g,i===0?"wood":"brass",frame[i],frame[(i+1)%4],.025);
      for(const side of [-1,1])tube(g,"steel",[side*.366,1.18,-.220],[side*.30,.985,.11],.031);
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
      tube(drive,"steel",[0,.36,.45],[0,.44,.742],.073).name="Eixo da hélice";
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
    const hulls=new Map();
    const boatStyles={
      dinghy:{rail:"wood",hull:"wood",deck:"cream",free:.35,stem:.18,stern:.49},
      boat:{rail:"cream",hull:"teal",deck:"wood",free:.49,stem:.30,stern:.67},
      ship:{rail:"edge",hull:"steel",deck:"wood",free:.83,stem:.58,stern:.68},
      speedboat:{rail:"cream",hull:"red",deck:"cream",free:.43,stem:.20,stern:.91}
    };
    function hullStations(length,style){
      return [[-1,.07,style.stem],[-.95,.24,style.stem*.80],[-.83,.54,style.stem*.49],
        [-.66,.76,style.stem*.22],[-.43,.90,.025],[-.16,1,0],[.17,1,0],[.48,.97,-.016],
        [.73,.90,0],[.94,style.stern,0],[1,style.stern*.90,.028]].map(([z,width,height])=>[z*length,width,height]);
    }
    function buildHull(kind,p,style,stations){
      if(hulls.has(kind))return hulls.get(kind);
      const profile=[[-1,0],[-.96,.31],[-.78,.66],[-.49,.86],[0,1],[.49,.86],[.78,.66],[.96,.31],[1,0]];
      const points=[],colors=[],indices=[],distance=p.halfZ,tones=[palette[style.hull],0x222e35,palette[style.rail]].map(c=>new THREE.Color(c));
      for(const [i,[z,w,rake]] of stations.entries()){
        for(const [j,[u,v]] of profile.entries()){
          const depth=(style.free+p.draft)*v*(.73+.27*w)-rake*(1-v);
          points.push(u*p.halfX*w,style.free-depth,z);
          const color=tones[0].clone().lerp(tones[1],Math.min(.82,v*.96));
          if(v<.36)color.lerp(tones[2],v<.05?.48:.12);
          color.multiplyScalar(.94+Math.cos(z/distance*6)*.055);
          colors.push(...color.toArray());
          if(i===0||j===0)continue;
          const a=(i-1)*profile.length+j-1,b=a+1,c=a+profile.length,d=c+1;
          indices.push(a,b,c,b,d,c);
        }
      }
      const tail=(stations.length-1)*profile.length;
      for(let j=1;j<profile.length-1;j++)indices.push(0,j,j+1,tail,tail+j+1,tail+j);
      const geo=new THREE.BufferGeometry();
      geo.setAttribute("position",new THREE.Float32BufferAttribute(points,3));
      geo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
      geo.setIndex(indices);geo.computeVertexNormals();
      hulls.set(kind,geo);
      return geo;
    }
    const hullMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.47,metalness:.15,side:THREE.DoubleSide});
    const canvasMat=new THREE.MeshStandardMaterial({color:0xe7ddbf,roughness:.93,side:THREE.DoubleSide});
    const canvasEdge=new THREE.MeshStandardMaterial({color:0x567871,roughness:.9,side:THREE.DoubleSide});
    function boatFurniture(g,layout,style){
      const {chest,mast}=layout;
      const cargo=pivot(g,chest.x,chest.y,chest.z);cargo.name="Baú de bordo";
      plate(cargo,"wood",0,chest.h*.35,0,chest.w,chest.h*.70,chest.d);
      const lid=pivot(cargo,0,chest.h*.68,chest.d*.40);
      plate(lid,"wood",0,chest.h*.10,-chest.d*.40,chest.w*1.02,chest.h*.27,chest.d*1.05);
      for(const side of [-1,1]){
        plate(cargo,"edge",side*chest.w*.32,chest.h*.36,0,.045,chest.h*.75,chest.d*1.035);
        plate(lid,"steel",side*chest.w*.32,chest.h*.16,-chest.d*.40,.047,chest.h*.24,chest.d*1.08);
      }
      plate(cargo,"brass",0,chest.h*.56,-chest.d*.52,.10,.102,.024);
      plate(cargo,"edge",0,chest.h*.57,-chest.d*.55,.025,.027,.012);
      const footing=pivot(g,mast.x,mast.y,mast.z);footing.name="Mastro e vela de bordo";
      plate(footing,"edge",0,.045,0,.22,.09,.22);
      tube(footing,"wood",[0,.04,0],[0,mast.height,0],.042);
      tube(footing,"brass",[0,mast.height-.10,0],[0,mast.height+.02,0],.052);
      const boom=pivot(footing,0,.03,0);
      const {height,width}=mast,top=height*.91,bottom=height*.29;
      const points=[],uv=[],indices=[],segments=13,strips=12;
      const profile=(u,v)=>[(1-v)*width*u,.022*Math.sin(v*5)*u+bottom+(top-bottom)*v,.15*Math.sin(u*Math.PI)*(1-v)];
      for(let y=0;y<=strips;y++)for(let x=0;x<=segments;x++){
        const u=x/segments,v=y/strips*.984;
        points.push(...profile(u,v));uv.push(u,v);
        if(x<segments&&y<strips){
          const i=y*(segments+1)+x,n=i+segments+1;
          indices.push(i,i+1,n,n,i+1,n+1);
        }
      }
      const shape=new THREE.BufferGeometry();
      shape.setAttribute("position",new THREE.Float32BufferAttribute(points,3));
      shape.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));shape.setIndex(indices);
      for(let row=0;row<strips;row++)shape.addGroup(row*segments*6,segments*6,row===0||row===3?1:0);
      shape.computeVertexNormals();
      const sail=new THREE.Mesh(shape,[canvasMat,canvasEdge]);sail.castShadow=true;sail.receiveShadow=true;
      sail.name="Vela de lona";boom.add(sail);
      tube(boom,"wood",[0,bottom-.01,0],[width+.035,bottom-.01,0],.029);
      tube(boom,style.rail,[0,top,0],[width,bottom,0],.012);
      tube(boom,"edge",[width,bottom,0],[0,.09,0],.013);
      const furled=pivot(footing,0,height*.31,0);furled.name="Vela recolhida";
      plate(furled,"cream",.032,.19,0,.13,.41,.127);
      for(const y of [.07,.30])plate(furled,"edge",.032,y,0,.145,.027,.14);
      return {lid,boom,furled,sail};
    }
    function boat(g,kind){
      const p=QuimiCraftVehicles.types[kind],s=boatStyles[kind],stations=hullStations(p.halfZ,s);
      const rig={root:g,kind,wheels:[],tracks:[],helmPedals:[],boat:true};
      const {halfX:w,halfZ:l}=p,deck=kind==="ship"?.64:kind==="dinghy"?.105:.20;
      const hull=new THREE.Mesh(buildHull(kind,p,s,stations),hullMat);
      hull.castShadow=hull.receiveShadow=true;hull.name="Casco com quilha e linha-d'água";g.add(hull);
      const widthAt=z=>{
        const j=stations.findIndex(([at])=>at>=z);
        if(j<=0)return stations[j===0?0:stations.length-1][1];
        const [za,wa]=stations[j-1],[zb,wb]=stations[j];
        return THREE.MathUtils.lerp(wa,wb,(z-za)/(zb-za));
      };
      for(let z=-l+.15;z<l-.13;z+=kind==="ship"?.245:.196){
        const width=widthAt(z)*w*(kind==="ship"?1.84:1.55);
        plate(g,s.deck,0,deck,z,width,.083,kind==="ship"?.235:.187);
        plate(g,"edge",0,deck+.043,z,width*.88,.008,.016);
      }
      for(const side of [-1,1]){
        const outer=stations.map(([z,f,y])=>[side*w*f,s.free+y,z]);
        for(let i=1;i<outer.length;i++){
          const a=outer[i-1],b=outer[i];
          tube(g,s.rail,a,b,kind==="ship"?.087:.059);
          const strip=([x,y,z])=>[x*.976,y-.135,z];
          tube(g,kind==="speedboat"?"red":s.rail,strip(a),strip(b),.026);
        }
        if(kind==="ship"){
          for(let z=-l+.73;z<l-.31;z+=.57){
            const x=side*w*widthAt(z)*.90;
            tube(g,"chrome",[x,deck,z],[x,deck+.53,z],.023);
            const end=z+.57;
            if(end<l-.29)tube(g,"edge",[x,deck+.53,z],[side*w*widthAt(end)*.90,deck+.53,end],.019);
          }
        }
        for(const z of [-l*.51,l*.54]){
          const x=side*w*widthAt(z)*.92;
          tube(g,"brass",[x,s.free,z-.115],[x,s.free,z+.115],.033);
          plate(g,"steel",x*.99,s.free-.056,z,.050,.118,.095);
        }
      }
      const helm=pivot(g,0,deck,-Math.min(.88,l*.36));
      const seat=pivot(g,0,deck,.19);
      rig.cockpitView=pivot(g,0,deck+(kind==="dinghy"?.94:1.05),.23);
      rig.cockpitView.name="Vista do piloto";
      plate(seat,"wood",0,.17,0,w*1.35,.115,.30);
      if(kind!=="dinghy"){
        plate(helm,kind==="speedboat"?"ink":"steel",0,.43,0,w*1.21,.31,.25);
        plate(helm,"edge",0,.60,-.03,w*1.22,.066,.33);
        const glassW=kind==="ship"?w*.53:w*.70;
        pane(helm,[[-glassW,.63,-.22],[glassW,.63,-.22],[glassW*.88,1.02,-.078],[-glassW*.88,1.02,-.078]],"Para-brisa");
        for(const side of [-1,1])tube(helm,"edge",[side*glassW,.63,-.22],[side*glassW*.88,1.02,-.078],.033);
        if(kind==="speedboat")plate(g,"red",0,deck+.17,l*.72,w*1.38,.32,l*.32);
        if(kind==="ship"){
          const wCab=w*.56,base=deck+.12,roof=deck+1.43,rear=l*.47,front=-l*.39;
          for(const side of [-1,1]){
            const x=side*wCab;
            plate(g,"cream",x,base+.22,(rear+front)/2,.10,.44,rear-front);
            pane(g,[[x,base+.45,front],[x,base+.45,rear],[x,roof-.15,rear],[x,roof-.15,front]],"Janela da cabine");
            for(const z of [front,(front+rear)/2,rear])tube(g,"edge",[x,base+.41,z],[x,roof,z],.036);
          }
          plate(g,"teal",0,roof,(rear+front)/2,wCab*2.22,.13,rear-front+.32);
          tube(g,"chrome",[0,roof+.04,l*.13],[0,roof+.63,l*.13],.026);
          plate(g,"lamp",0,roof+.63,l*.13,.090,.094,.115);
        }
      }
      rig.steering=pivot(helm,0,.56,.20);
      mesh(rig.steering,ring,"brass",0,0,0,.145,.145,.14).name="Volante ligado ao leme";
      for(let i=0;i<3;i++){
        const a=i*Math.PI*2/3;
        tube(rig.steering,"edge",[0,0,0],[Math.sin(a)*.123,Math.cos(a)*.123,0],.016);
      }
      for(const side of [-1,1]){
        const foot=pivot(helm,side*.16,.075,.51);
        tube(foot,"steel",[0,0,0],[0,.13,.09],.024);
        plate(foot,"rubber",0,.135,.09,.117,.047,.127).name=side<0?"Pedal de bombordo":"Pedal de estibordo";
        rig.helmPedals.push(foot);
        tube(g,"brass",[side*.26,deck+.048,helm.position.z+.58],[side*.23,deck+.048,l*.88],.015);
      }
      const rudder=pivot(g,0,-p.draft*.53,l*.93);rudder.name="Leme articulado";rig.rudder=rudder;
      plate(rudder,"steel",0,-.05,.125,.085,p.draft*.79,.31);
      plate(rudder,s.rail,0,-.12,.26,.066,p.draft*.69,.11);
      rig.screw=pivot(g,0,-p.draft*.65,l*.81);
      mesh(rig.screw,wheel,"brass",0,0,0,.074,.12,.074).rotation.x=Math.PI/2;
      for(let i=0;i<3;i++){
        const blade=pivot(rig.screw,0,0,0);blade.rotation.z=i*Math.PI*2/3;
        mesh(blade,padded,"chrome",.125,.035,0,.189,.082,.041).rotation.y=.46;
      }
      rig.furniture=boatFurniture(g,QuimiCraftVehicles.deckLayout(kind),s);
      return rig;
    }
    function build(kind){
      const root=new THREE.Group();
      root.name="Veículo · "+kind;
      return boatStyles[kind]?boat(root,kind):kind==="glider"?glider(root):chassis(root,kind);
    }
    function animate(rig,v,dt){
      rig.root.position.set(v.x,v.renderY??v.y,v.z);
      rig.root.rotation.set(v.tilt||0,v.yaw,v.bank||0,"YXZ");
      const speed=v.speed||0,turn=v.yawRate||0;
      if(rig.steering)rig.steering.rotation.z=(v.steer||0)*-.51+(v.bank||0)*.28;
      if(rig.boat){
        const steer=v.steer||0;
        rig.rudder.rotation.y=steer*.62;
        rig.screw.rotation.z+=dt*speed*8.5;
        rig.cadence=(rig.cadence||0)+dt*(v.pedaling?5.25+Math.abs(speed)*.36:0);
        rig.helmPedals.forEach((foot,i)=>{
          const side=i===0?1:-1,pedal=v.pedaling?Math.sin(rig.cadence+i*Math.PI)*.23:0;
          foot.rotation.x=side*steer*.46+pedal;
        });
        const {lid,boom,furled,sail}=rig.furniture,deployed=v.deck?.sail??false;
        boom.visible=deployed;furled.visible=!deployed;
        boom.rotation.y=(rig.kind==="dinghy"?Math.PI*.25:Math.PI*.67)+Math.sin((v.waterClock||0)*2.2)*.10+steer*.19;
        sail.scale.z=1+Math.sin((v.waterClock||0)*3.6)*.24+Math.min(.7,Math.abs(speed)*.06);
        lid.rotation.x=v.deck?.chestOpen?1.27:0;
        return;
      }
      if(rig.gauges){
        const values=[Math.min(1,Math.abs(speed)/16),Math.min(1,Math.abs(v.tilt||0)*1.2+.18),Math.min(1,Math.abs(turn)*.40+.22)];
        rig.gauges.forEach((needle,i)=>needle.rotation.z=.96-values[i]*2.81);
      }
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
    function preview(rig,motor,clip,t,dt,reset){
      if(reset){
        for(const wheel of rig.wheels){wheel.spin.rotation.x=0;wheel.joint.position.y=wheel.baseY;wheel.speed=0}
        for(const track of rig.tracks)track[0].userData.phase=0;
        if(rig.drill)rig.drill.rotation.z=0;
        if(rig.drive){rig.cadence=0;rig.pedals.rotation.x=0;rig.prop.rotation.z=0}
        rig.jetTime=0;
        if(rig.boat){rig.cadence=0;rig.screw.rotation.z=0}
      }
      const smooth=(x,low,high)=>THREE.MathUtils.smoothstep(x,low,high);
      const turn=clip==="turn"?Math.sin(t*1.7):0;
      const airborne=clip==="hop"||clip==="takeoff"||clip==="soar"||clip==="land";
      const lift=clip==="hop"?Math.sin(Math.PI*smooth(t,.28,1.33))*.48:
        clip==="takeoff"?smooth(t,.68,2.8)*.77:clip==="land"?(1-smooth(t,.45,2.25))*.77:
        clip==="soar"?.64+Math.sin(t*2.2)*.12:0;
      const work=(clip==="drill"||clip==="dig")?Math.sin(Math.PI*smooth(t,.25,2.6))**1.2:0;
      const speed=clip==="drive"||rig.boat&&clip==="marinePedal"?5.8:clip==="nitro"?12:clip==="turn"?5.1:airborne?5.2:0;
      const bank=clip==="soar"?Math.sin(t*1.65)*.19:turn*.13;
      animate(rig,{x:turn*.20,y:lift+(rig.boat?Math.sin(t*2.8)*.04:0),z:0,yaw:turn*.46,yawRate:turn*2,steer:turn,speed,bank,
        tilt:clip==="takeoff"?-lift*.21:clip==="land"?lift*.16:0,airborne:lift>.02,flying:rig.kind==="glider"&&lift>.10,
        nitroActive:clip==="nitro",work,motor,pedaling:rig.boat?speed>0:motor&&(clip==="pedal"||clip==="takeoff"||clip==="soar"),
        deck:rig.boat?{sail:clip==="sail",chestOpen:clip==="cargo"}:null,waterClock:t},dt);
    }
    return {build,animate,preview};
  }
  return {create};
})();

