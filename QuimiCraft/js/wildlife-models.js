"use strict";

globalThis.QuimiCraftWildlife=(()=>{
  function create(T){
    const geometry={
      oval:new T.SphereGeometry(1,12,8),cube:new T.BoxGeometry(1,1,1),diamond:new T.OctahedronGeometry(1),
      spike:new T.ConeGeometry(1,1,6),disk:new T.CylinderGeometry(1,1,1,8),ring:new T.TorusGeometry(1,.07,5,16)
    };
    const materials=new Map();
    function material(color,glow=false,alpha=1){
      const key=color+":"+glow+":"+alpha;
      if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({
        color,roughness:.66,flatShading:true,emissive:glow?color:0,emissiveIntensity:glow?.57:0,
        transparent:alpha<1,opacity:alpha,depthWrite:alpha===1,side:alpha<1?T.DoubleSide:T.FrontSide
      }));
      return materials.get(key);
    }
    function part(parent,shape,color,pos,size,rotation=[0,0,0],glow=false,alpha=1){
      const p=new T.Mesh(geometry[shape],material(color,glow,alpha));
      p.position.set(...pos);p.scale.set(...size);p.rotation.set(...rotation);
      p.castShadow=alpha===1;p.receiveShadow=alpha===1;
      parent.add(p);
      return p;
    }
    function hinge(root,x,y,z){
      const g=new T.Group();g.position.set(x,y,z);root.add(g);return g;
    }
    function fin(g,color,points,thickness=.024,alpha=1){
      const [a,b,c]=points.map(p=>new T.Vector3(...p)),vertices=[];
      const offset=b.clone().sub(a).cross(c.clone().sub(a)).normalize().multiplyScalar(thickness*.5);
      const top=[a,b,c].map(p=>p.clone().add(offset));
      const bottom=[a,b,c].map(p=>p.clone().sub(offset));
      const triangle=(p,q,r)=>vertices.push(p.x,p.y,p.z,q.x,q.y,q.z,r.x,r.y,r.z);
      triangle(...top);
      triangle(bottom[2],bottom[1],bottom[0]);
      for(let i=0;i<3;i++){
        const next=(i+1)%3;
        triangle(top[i],bottom[i],bottom[next]);
        triangle(top[i],bottom[next],top[next]);
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute("position",new T.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();
      const m=new T.Mesh(geo,material(color,false,alpha));m.castShadow=alpha===1;g.add(m);return m;
    }
    const eye=0x141e26;
    const pigment=(color,light)=>new T.Color(color).lerp(new T.Color(light?0xe5eee5:0x1a202b),light?.29:.36).getHex();
    function eyes(g,x,y,z,r){
      for(const side of [-1,1]){
        part(g,"oval",0x918669,[side*x,y,z],[r*1.12,r*1.06,r*1.07]);
        part(g,"oval",eye,[side*(x+r*.37),y,z-.011],[r*.82,r*.80,r*.85]);
        part(g,"oval",0xf0f6eb,[side*(x+r*.82),y+r*.26,z-r*.23],[r*.21,r*.24,r*.23]);
      }
    }
    function fish(id,color,style){
      const g=new T.Group(),long=id==="raw_eel"||id==="raw_catfish"||style==="long";
      const shrimp=id==="raw_shrimp",small=shrimp||id==="raw_sardine";
      const length=long?.62:style==="slim"?.50:.40,x=style==="flat"?.25:long?.12:.176,y=style==="flat"?.064:long?.085:style==="deep"?.215:.146;
      const belly=pigment(color,true),back=pigment(color,false);
      const tail=hinge(g,0,-.008,length*.72);
      part(g,"oval",color,[0,0,-.035],[x,y,length]);
      part(g,"oval",belly,[0,-y*.45,-.046],[x*.89,y*.64,length*.89]);
      part(g,"oval",color,[0,-y*.075,-length*.66],[x*.76,y*.74,length*.47]);
      part(g,"oval",back,[0,-y*.29,-length*1.05],[x*.57,.016,length*.09]);
      eyes(g,x*.76,y*.22,-length*.71,small?.022:.034);
      for(const side of [-1,1]){
        fin(g,back,[[side*x*.82,.014,-length*.34],[side*x*1.52,-y*.72,length*.20],[side*x*.77,-y*.54,length*.28]],.023);
        const gill=part(g,"cube",back,[side*x*.94,-.013,-length*.398],[.016,y*.64,.024],[.21,0,side*.12]);gill.castShadow=false;
        for(let j=0;j<3;j++){
          const z=-length*.19+j*length*.22;
          part(g,"diamond",belly,[side*x*(.99-j*.04),y*.31,z],[.009,y*.23,length*.09],[0,0,.2]);
        }
      }
      fin(g,back,[[0,y*.80,-length*.35],[0,y*1.75,length*.26],[0,y*.79,length*.59]],.028);
      part(tail,"oval",color,[0,-.005,.037],[x*.46,y*.52,length*.32]);
      for(const side of [-1,1]){
        fin(tail,back,[[0,-.008,.065],[0,side*y*1.22,length*.63],[0,side*y*.19,length*.49]],.024);
        if(long||shrimp){
          part(g,"cube",back,[side*x*.96,-y*.45,-length*1.12],[.012,.012,.16],[.28,side*.45,0]);
        }
      }
      g.name=id;
      const wings=[];
      return {group:g,tail,wings,verticalTail:false};
    }
    function creature(kind){
      const palette={orca:[0x182a36,0xeff3ec],dolphin:[0x547d99,0xb0c9cb],reef_shark:[0x496473,0xc4ced0],caiman:[0x596846,0xb0a36a],piranha:[0x768f79,0xd98660],ray:[0x446c76,0xa6bcac],jelly:[0x69a4b8,0xa9dee0]};
      const [body,cream]=palette[kind];
      if(kind==="piranha"){
        const f=fish(kind,body,"deep");
        part(f.group,"oval",0xc76442,[0,-.13,-.13],[.149,.092,.29]);
        for(const side of [-1,1])for(let i=0;i<4;i++)part(f.group,"spike",0xffe5bf,[side*(.02+i*.018),-.063,-.456],[.014,.062-i*.005,.013],[0,0,Math.PI]);
        f.group.scale.setScalar(.84);return f;
      }
      const g=new T.Group(),wings=[],tail=hinge(g,0,0,kind==="jelly"?0:kind==="orca"?.96:.68);
      if(kind==="jelly"){
        part(g,"oval",body,[0,.075,0],[.39,.22,.39],[0,0,0],true,.52);
        part(g,"ring",cream,[0,-.015,0],[.382,.382,.25],[Math.PI/2,0,0],true,.74);
        for(let i=0;i<8;i++){
          const t=i*Math.PI/4,u=Math.cos(t)*.235,v=Math.sin(t)*.235;
          const arm=hinge(tail,u,-.035,v);
          wings.push(arm);
          part(arm,"cube",i%2?cream:body,[0,-.16,0],[.022,.33,.026],[.18,.12,.12],true,.72);
          part(arm,"cube",cream,[.028,-.338,.036],[.015,.15,.018],[.3,0,-.28],true,.61);
        }
        return {group:g,tail,wings,verticalTail:false};
      }
      if(kind==="ray"){
        part(g,"oval",body,[0,.008,-.11],[.342,.125,.68]);part(g,"oval",cream,[0,-.073,-.09],[.31,.067,.59]);
        for(const side of [-1,1]){
          const wing=hinge(g,side*.20,0,-.07);wings.push(wing);
          fin(wing,body,[[0,.045,-.52],[side*.61,-.041,.03],[0,-.012,.53]],.063);
          fin(wing,cream,[[0,-.022,-.34],[side*.54,-.056,.04],[0,-.058,.398]],.024);
        }
        part(tail,"spike",body,[0,-.012,.30],[.065,.61,.065],[Math.PI/2,0,0]);
        eyes(g,.14,.103,-.36,.037);
        return {group:g,tail,wings,verticalTail:false};
      }
      if(kind==="caiman"){
        part(g,"oval",body,[0,-.015,.033],[.325,.213,.66]);
        part(g,"oval",cream,[0,-.105,.015],[.271,.125,.57]);
        part(g,"oval",body,[0,.019,-.553],[.242,.184,.372]);
        part(g,"cube",body,[0,-.048,-.944],[.293,.094,.394],[.08,0,0]);
        part(g,"cube",cream,[0,-.104,-.918],[.256,.049,.351]);
        eyes(g,.149,.131,-.68,.05);
        for(const side of [-1,1]){
          for(const z of [-.36,.32]){
            part(g,"cube",body,[side*.303,-.092,z],[.216,.095,.115],[0,side*.33,side*.13]);
            part(g,"cube",body,[side*.405,-.12,z-.062],[.094,.05,.183]);
          }
          for(let i=0;i<5;i++)part(g,"spike",0xf8e2bb,[side*.121,-.086,-.821-i*.045],[.018,.041,.016],[0,0,Math.PI]);
          for(let j=0;j<5;j++)part(g,"diamond",0x3f533b,[side*.107,.181,.48-j*.167],[.087,.086,.106]);
        }
        part(tail,"oval",body,[0,-.041,.26],[.159,.123,.39]);
        part(tail,"oval",body,[.048,-.079,.59],[.085,.077,.252],[.08,.19,0]);
        return {group:g,tail,wings,verticalTail:false};
      }
      const orca=kind==="orca",dolphin=kind==="dolphin",length=orca?1.16:dolphin?.88:1.03;
      const width=orca?.425:dolphin?.249:.292,height=orca?.412:dolphin?.263:.27;
      part(g,"oval",body,[0,0,-.087],[width,height,length]);
      part(g,"oval",cream,[0,-height*.39,-.077],[width*.85,height*.69,length*.91]);
      part(g,"oval",body,[0,-.012,-length*.66],[width*.76,height*.72,length*.57]);
      part(g,"oval",dolphin?cream:body,[0,-height*.27,-length*1.10],[width*.47,height*.25,length*.29]);
      eyes(g,width*.63,.041,-length*.77,orca?.045:.035);
      if(orca)for(const side of [-1,1]){
        part(g,"oval",cream,[side*width*.85,.072,-.52],[.075,.106,.28],[.02,0,side*.21]);
      }
      for(const side of [-1,1]){
        const wing=hinge(g,side*width*.73,-height*.26,-length*.14);wings.push(wing);
        fin(wing,body,[[0,.017,-.24],[side*(orca?.58:.40),-.16,.38],[0,-.035,.40]],.064);
        if(kind==="reef_shark")for(let j=0;j<4;j++)part(g,"cube",0x263e4a,[side*width*.90,.017,-.42+j*.047],[.035,.137,.015],[.13,0,side*.20]);
      }
      fin(g,body,[[0,height*.87,-.34],[0,height+(orca?.50:.31),.29],[0,height*.75,.55]],.074);
      part(tail,"oval",body,[0,-.046,.145],[width*.48,height*.46,.42]);
      for(const side of [-1,1]){
        const wing=kind==="reef_shark"?[[0,0,.35],[0,side*.36,.73],[0,0,.66]]:[[0,0,.28],[side*(orca?.47:.33),-.045,.65],[0,-.012,.58]];
        fin(tail,body,wing,.042);
      }
      return {group:g,tail,wings,verticalTail:orca||dolphin};
    }
    function moth(group,rig){
      const head=hinge(group,0,.73,-.28);rig.head=head;
      part(group,"oval",0x344864,[0,.72,.071],[.104,.109,.34]);part(head,"oval",0x597586,[0,0,0],[.105,.098,.115]);eyes(head,.073,.017,-.047,.032);
      const vein=0x80ebc4,web=0x45678e;
      for(const side of [-1,1]){
        const wing=hinge(group,side*.071,.76,.04);wing.userData.side=side;rig.wings.push(wing);
        fin(wing,web,[[0,0,-.16],[side*.50,.017,-.35],[side*.64,-.017,.15]],.026,.88);
        fin(wing,0x526f9d,[[0,0,-.16],[side*.64,-.017,.15],[side*.26,-.026,.39]],.026,.93);
        for(let j=0;j<4;j++){
          const x=side*(.14+j*.099);
          part(wing,"diamond",vein,[x,.029,.061+Math.sin(j*.68)*.065],[.05,.026,.055],[0,0,.4],true);
        }
        part(head,"cube",vein,[side*.079,.093,-.107],[.019,.193,.018],[.42,0,-side*.31],true);
      }
      for(const z of [.15,.25,.33])part(group,"diamond",vein,[0,.745,z],[.052,.05,.036],[0,0,0],true);
    }
    function refine(type,group,rig){
      if(type==="moth"){moth(group,rig);return}
      if(type==="scorpion"){
        for(let i=0;i<4;i++){
          const z=-.36+i*.211;
          part(group,"disk",i%2?0xb98143:0xd0a064,[0,.417,z],[.27-i*.025,.083,.152],[0,Math.PI/8,0]);
        }
        for(const [i,arm] of rig.arms.entries()){
          const side=i===0?-1:1;
          part(arm,"oval",0x573f2e,[side*.19,.055,-.193],[.105,.038,.151],[0,side*.5,0]);
          for(const spread of [-1,1]){
            part(arm,"diamond",0xe6b76d,[side*.46+spread*.062,.004,-.40],[.056,.07,.142],[0,spread*.43,side*.2]);
          }
        }
        rig.tails.forEach((node,i)=>part(node,"diamond",i%2?0x77523a:0x8f6b45,[0,.13,.104],[.108,.077,.124]));
        return;
      }
      if(type==="slime"){
        for(const [x,y,z,color] of [[-.23,.34,-.24,0x9ef884],[.18,.55,-.18,0x56b04b],[.16,.28,.29,0xa2e755],[0,.19,-.14,0xb5d965]]){
          part(rig.body,"diamond",color,[x,y,z],[.08,.09,.073],[.3,.45,0],true,.73);
        }
      }else if(type==="cobrete"){
        for(const side of [-1,1])for(const y of [.84,1.055])part(group,"disk",0xedbf79,[side*.25,y,-.244],[.048,.036,.048],[Math.PI/2,0,0]);
        part(group,"ring",0xc08b53,[0,1.49,-.264],[.125,.101,.86],[0,0,0]);
      }else if(type==="cristalume"){
        for(const [x,y,z] of [[-.16,1.16,-.05],[.13,1.08,.053],[.04,1.25,.131]]){
          part(group,"diamond",0x71f3d4,[x,y,z],[.096,.31,.105],[.27,.45,x*.92],true);
        }
      }else if(type==="golem"||type==="magma"){
        const stone=type==="golem"?0x4e3a58:0x513433,rune=type==="golem"?0xb586d6:0xffa246;
        for(const side of [-1,1]){
          part(group,"diamond",stone,[side*.56,1.68,.034],[.225,.208,.242],[.12,.37,side*.18]);
          for(const y of [1.12,1.28,1.46])part(group,"diamond",rune,[side*.229,y,-.311],[.033,.074,.047],[0,.15,side*.27],true);
        }
      }else if(type==="wisp"){
        for(const side of [-1,1]){
          part(group,"diamond",0xa8c7e9,[side*.48,.49,.09],[.068,.176,.067],[.13,.25,side*.4],true);
          part(group,"ring",0x82e5ed,[side*.20,.87,-.18],[.081,.092,.41],[0,side*.38,0],true);
        }
      }
    }
    return {fish,creature,refine,shared:geometry};
  }
  return {create};
})();

