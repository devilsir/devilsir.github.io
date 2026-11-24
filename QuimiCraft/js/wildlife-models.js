"use strict";

globalThis.QuimiCraftWildlife=(()=>{
  function create(T){
    const geometry={
      oval:new T.SphereGeometry(1,12,8),cube:new T.BoxGeometry(1,1,1),diamond:new T.OctahedronGeometry(1),
      spike:new T.ConeGeometry(1,1,6),disk:new T.CylinderGeometry(1,1,1,8),ring:new T.TorusGeometry(1,.07,5,16)
    };
    geometry.facet=new T.CylinderGeometry(.47,.57,1,8);
    geometry.shard=new T.IcosahedronGeometry(1,0);
    geometry.chamfer=new T.SphereGeometry(.74,10,6);
    geometry.rounded=new T.BoxGeometry(1,1,1,4,4,4);
    const roundFace=geometry.rounded.getAttribute("position"),base=new T.Vector3(),offset=new T.Vector3();
    for(let i=0;i<roundFace.count;i++){
      offset.fromBufferAttribute(roundFace,i);
      base.copy(offset).clampScalar(-.351,.351);
      offset.sub(base).normalize().multiplyScalar(.149).add(base);
      roundFace.setXYZ(i,offset.x,offset.y,offset.z);
    }
    geometry.rounded.computeVertexNormals();
    geometry.slime=new T.LatheGeometry([[.005,.08],[.326,.08],[.436,.14],[.492,.295],[.49,.55],
      [.422,.741],[.239,.856],[.006,.882]].map(([r,y])=>new T.Vector2(r,y)),12);
    const skinMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.68,flatShading:true});
    const coatMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.86});
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
    function link(parent,color,from,to,radius,alpha=1,glow=false){
      const a=new T.Vector3(...from),b=new T.Vector3(...to),axis=b.clone().sub(a);
      const mesh=part(parent,"disk",color,a.lerp(b,.5).toArray(),[radius,axis.length()+radius*.62,radius],[0,0,0],glow,alpha);
      mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis.normalize());
      return mesh;
    }
    function taper(parent,points,colors,segments=8,reference=[1,0,0],paint=null){
      const xyz=points.map(p=>new T.Vector3(...p.slice(0,3))),p=[],tint=[],indices=[];
      const main=new T.Color(colors[0]),light=new T.Color(colors[1]),ref=new T.Vector3(...reference);
      for(const [i,center] of xyz.entries()){
        const axis=xyz[Math.min(i+1,xyz.length-1)].clone().sub(xyz[Math.max(0,i-1)]).normalize();
        const side=new T.Vector3().crossVectors(axis,ref);
        if(side.lengthSq()<1e-8)side.crossVectors(axis,Math.abs(axis.y)<.9?new T.Vector3(0,1,0):new T.Vector3(0,0,1));
        side.normalize();
        const up=new T.Vector3().crossVectors(axis,side);
        for(let j=0;j<segments;j++){
          const a=j*Math.PI*2/segments,c=Math.cos(a),s=Math.sin(a);
          const r=points[i][3],d=points[i][4]??r;
          p.push(...center.clone().addScaledVector(side,r*c).addScaledVector(up,d*s).toArray());
          const col=main.clone().lerp(light,(1+c)*.31+(i%2)*.08);
          if(paint)paint(col,a,i);
          tint.push(col.r,col.g,col.b);
          if(i<xyz.length-1){
            const v=i*segments+j,n=i*segments+(j+1)%segments;
            indices.push(v,n,v+segments,n,n+segments,v+segments);
          }
        }
      }
      const last=(xyz.length-1)*segments;
      for(let i=1;i<segments-1;i++)indices.push(0,i+1,i,last,last+i,last+i+1);
      const g=new T.BufferGeometry();
      g.setAttribute("position",new T.Float32BufferAttribute(p,3));
      g.setAttribute("color",new T.Float32BufferAttribute(tint,3));g.setIndex(indices);g.computeVertexNormals();
      const node=new T.Mesh(g,skinMaterial);
      node.userData.ownGeometry=true;
      parent.add(node);
      return node;
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
      const m=new T.Mesh(geo,material(color,false,alpha));m.userData.ownGeometry=true;m.castShadow=alpha===1;g.add(m);return m;
    }
    function fanFin(parent,root,edge,colors,thickness=.014){
      const origin=new T.Vector3(...root),outline=edge.map(p=>new T.Vector3(...p));
      const a=outline[0].clone().sub(origin),b=outline.at(-1).clone().sub(origin);
      const normal=a.cross(b).normalize(),points=[origin,...outline],count=points.length;
      const vertices=[],tint=[],indices=[],dark=new T.Color(colors[0]),light=new T.Color(colors[1]);
      for(const side of [1,-1])for(const [i,point] of points.entries()){
        const thicknessAtPoint=i===0?thickness:thickness*.56;
        vertices.push(...point.clone().addScaledVector(normal,side*thicknessAtPoint).toArray());
        const color=dark.clone().lerp(light,i===0?.24:i%2?.69:.42).multiplyScalar(side>0?1:.83);
        tint.push(color.r,color.g,color.b);
      }
      for(let i=1;i<count-1;i++)indices.push(0,i,i+1,count,count+i+1,count+i);
      for(let i=0;i<count;i++){
        const next=(i+1)%count;
        indices.push(i,i+count,next,next,i+count,next+count);
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute("position",new T.Float32BufferAttribute(vertices,3));
      geo.setAttribute("color",new T.Float32BufferAttribute(tint,3));
      geo.setIndex(indices);geo.computeVertexNormals();
      const mesh=new T.Mesh(geo,skinMaterial);mesh.userData.ownGeometry=true;parent.add(mesh);
      return mesh;
    }
    const eye=0x141e26;
    const pigment=(color,light)=>new T.Color(color).lerp(new T.Color(light?0xe5eee5:0x1a202b),light?.29:.36).getHex();
    function contour(parent,sections,colors,pattern="",segments=12,shape=null,paint=null){
      const p=[],tint=[],indices=[];
      const main=new T.Color(colors[0]),belly=new T.Color(colors[1]),deep=main.clone().multiplyScalar(.53);
      sections.forEach(([z,center,rx,ry],row)=>{
        for(let i=0;i<segments;i++){
          const a=i*Math.PI*2/segments,c=Math.cos(a);
          p.push(...(shape?shape(sections[row],a):[Math.sin(a)*rx,center+c*ry,z]));
          const mix=c<-.2?main.clone().lerp(belly,Math.min(1,(-c-.12)*1.76)):main.clone().lerp(deep,c*.23);
          const stripe=pattern==="stripe"&&row>1&&row<sections.length-1&&row%2===0;
          const speckle=pattern==="speckle"&&row>1&&(row*7+i*3)%8<2;
          if(stripe||speckle)mix.lerp(deep,stripe?.48:.45);
          if(pattern==="scales"&&row>1&&c>-.35)mix.multiplyScalar((i+row*3)%5===0?1.19:.94+(i%3)*.041);
          if(pattern==="silver"&&Math.abs(c)<.48)mix.lerp(belly,.53);
          if(paint)paint(mix,z,a);
          tint.push(mix.r,mix.g,mix.b);
          if(row===sections.length-1)continue;
          const j=row*segments+i,next=row*segments+(i+1)%segments;
          indices.push(j,j+segments,next,next,j+segments,next+segments);
        }
      });
      for(let i=1;i<segments-1;i++){
        const last=(sections.length-1)*segments;
        indices.push(0,i,i+1,last,last+i+1,last+i);
      }
      const mesh=new T.BufferGeometry();
      mesh.setAttribute("position",new T.Float32BufferAttribute(p,3));
      mesh.setAttribute("color",new T.Float32BufferAttribute(tint,3));
      mesh.setIndex(indices);mesh.computeVertexNormals();
      const node=new T.Mesh(mesh,shape?coatMaterial:skinMaterial);
      node.userData.ownGeometry=true;
      node.castShadow=true;node.receiveShadow=true;parent.add(node);
      return node;
    }
    function rayWing(parent,side,body,belly){
      const outline=[[-.06,.016,-.56],[.43,.018,-.365],[.89,-.055,.05],[.37,-.033,.367],[-.076,-.009,.63]];
      const upper=[...outline,[.42,.079,.018]],lower=[...outline,[.42,-.022,.018]];
      const points=[],colors=[],indices=[];
      for(const [layer,shape] of [upper,lower].entries())for(const [i,[x,y,z]] of shape.entries()){
        points.push(x*side,y+(i===shape.length-1?0:layer?-.018:.018),z);
        const c=new T.Color(layer?belly:body).multiplyScalar(i===5?1.17:i===2?1.05:.84+i*.035);
        colors.push(c.r,c.g,c.b);
      }
      const triangle=(a,b,c)=>indices.push(a,side>0?b:c,side>0?c:b);
      for(let i=0;i<5;i++){
        const next=(i+1)%5;
        triangle(5,next,i);
        triangle(11,i+6,next+6);
        triangle(i,next,next+6);
        triangle(i,next+6,i+6);
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute("position",new T.Float32BufferAttribute(points,3));
      geo.setAttribute("color",new T.Float32BufferAttribute(colors,3));
      geo.setIndex(indices);geo.computeVertexNormals();
      const wing=new T.Mesh(geo,skinMaterial);
      parent.add(wing);
    }
    function scaledContour(parent,template,x,y,z,colors,pattern=""){
      return contour(parent,template.map(([position,center,width,height])=>[position*z,center*y,width*x,height*y]),colors,pattern);
    }
    function eyes(g,x,y,z,r){
      for(const side of [-1,1]){
        part(g,"oval",0x777771,[side*x,y,z],[r*1.09,r*1.07,r*1.05]);
        part(g,"oval",0xb89758,[side*(x+r*.39),y,z-.013],[r*.69,r*.82,r*.82]);
        part(g,"oval",eye,[side*(x+r*.67),y,z-.014],[r*.49,r*.60,r*.59]);
        part(g,"oval",0xf0f6eb,[side*(x+r*.92),y+r*.22,z-r*.25],[r*.143,r*.19,r*.20]);
      }
    }
    function aquaticMouth(root,origin,width,height,reach,upper,lower,teeth=0){
      const [x,y,z]=origin,jaw=hinge(root,...origin);
      root.userData.jaw=jaw;
      part(root,"oval",upper,[x,y+height*.71,z-reach*.62],[width,height*.79,reach*.73],[.04,0,0]);
      part(root,"oval",0x342631,[x,y-height*.04,z-reach*.71],
        [width*.85,height*.38,reach*.61]);
      contour(jaw,[[-reach*1.37,-height*.25,width*.32,height*.25],[-reach*1.02,-height*.50,width*.78,height*.42],
        [-reach*.57,-height*.48,width*.91,height*.49],[-reach*.16,-height*.34,width*.57,height*.39],
        [reach*.11,-height*.17,width*.30,height*.22]],[lower,lower],"",12);
      part(jaw,"oval",0x814e54,[0,-height*.16,-reach*.76],[width*.63,height*.094,reach*.46]);
      for(const side of [-1,1])for(let i=0;i<teeth;i++){
        const t=i/teeth,xx=side*width*(.33+.51*t),zz=-reach*(1.12-t*.72),tip=height*(.68-t*.18);
        part(root,"spike",0xf2e0bf,[x+xx,y-tip*.20,z+zz],[tip*.33,tip,tip*.28],[0,0,Math.PI]);
        part(jaw,"spike",0xe8d4b7,[xx*.88,-height*.28,zz+.010],[tip*.25,tip*.68,tip*.24]);
      }
      jaw.rotation.x=-.09;
      return jaw;
    }
    function shrimpModel(color){
      const group=new T.Group(),back=pigment(color,false),belly=pigment(color,true),wings=[];
      const tail=hinge(group,0,-.03,.15),tailTip=hinge(tail,0,-.089,.24);
      const head=[[-.35,-.035,.025,.033],[-.29,.008,.067,.059],[-.22,.023,.099,.086],
        [-.12,.035,.123,.102],[.005,.038,.116,.105],[.15,.012,.090,.079],[.21,-.002,.066,.065]];
      contour(group,head,[color,belly],"scales",18);
      taper(group,[[0,.052,-.22,.048],[0,.059,-.32,.037],[0,.078,-.433,.006]],[back,belly],7);
      const jaw=aquaticMouth(group,[0,-.037,-.28],.035,.019,.033,back,belly);
      eyes(group,.064,.065,-.279,.025);
      contour(tail,[[-.038,.04,.076,.067],[.065,.021,.083,.063],[.157,-.004,.067,.058],
        [.231,-.047,.058,.048],[.32,-.083,.039,.032]],[color,belly],"stripe",16);
      for(let i=0;i<4;i++){
        const y=.096-i*.024,z=.022+i*.069,r=.074-i*.010;
        fanFin(tail,[0,y-.062,z-.023],[[-r,y-.042,z],[0,y,z+.034],[r,y-.042,z]], [back,belly],.010);
      }
      for(const side of [-1,1]){
        const feeler=[[side*.031,.022,-.291],[side*.098,.012,-.42],[side*.134,-.012,-.547],[side*.162,-.034,-.64]];
        taper(group,feeler.map((p,i)=>[...p,.009-i*.0019]),[color,belly],5);
        fanFin(tailTip,[0,.021,.031],[[side*.087,.014,.091],[side*.136,-.027,.18],[side*.082,-.036,.206],
          [side*.038,-.040,.165],[0,-.033,.123]],[back,color],.010);
        const swimmer=hinge(group,side*.047,-.038,-.102);swimmer.userData.side=side;wings.push(swimmer);
        for(let i=0;i<4;i++){
          const z=i*.053,t=i*.018;
          taper(swimmer,[[0,0,z,.013],[side*(.102-t),-.077,z+.045,.010],[side*(.129-t),-.143,z+.015,.004]],[back,belly],5);
        }
      }
      group.name="raw_shrimp";
      return {group,tail,tailTip,wings,jaw,verticalTail:false,swimStyle:"undulate",biteAngle:.32};
    }
    function fish(id,color,style){
      if(id==="raw_shrimp")return shrimpModel(color);
      const eel=id==="raw_eel",catfish=id==="raw_catfish",pike=id==="raw_pike",flat=style==="flat";
      const g=new T.Group(),long=eel||catfish||style==="long",small=id==="raw_sardine";
      const length=eel?.79:pike?.73:long?.62:style==="slim"?.50:id==="raw_carp"?.46:.40;
      const x=flat?.25:catfish?.145:long?.109:.176,y=flat?.064:long?.085:style==="deep"?.215:.146;
      const belly=pigment(color,true),back=pigment(color,false),lateral=new T.Color(belly);
      const salmonid=id==="raw_trout"||id==="raw_char",blush=new T.Color(id==="raw_char"?0xd58458:0xb87b8a),fleck=new T.Color(0x455372);
      const tail=hinge(g,0,-y*.05,length*.66),wings=[];
      const markings=["raw_perch","piranha","raw_piranha","raw_tilapia"].includes(id)?"stripe":
        ["raw_trout","raw_char","raw_loach","raw_pike"].includes(id)?"speckle":style==="slim"?"silver":"scales";
      const hull=[[-1.15,-.20,.23,.14],[-1.04,-.14,.46,.32],[-.91,-.10,.69,.60],[-.73,-.05,.85,.84],
        [-.52,-.012,.95,.96],[-.36,0,1,1],[-.19,.02,.98,1],[-.03,.02,.94,.97],[.17,0,.88,.88],
        [.34,-.02,.76,.76],[.49,-.042,.61,.60],[.64,-.046,.46,.45],[.83,-.05,.29,.31]];
      const profile=salmonid?hull.flatMap((section,i)=>i===hull.length-1?[section]:
        [section,section.map((value,k)=>(value+hull[i+1][k])*.5)]):hull;
      contour(g,profile.map(([z,c,w,h])=>[z*length,c*y,w*x*(flat&&z>-.7?1.12:1),h*y]),[color,belly],markings,24,null,(mix,z,a)=>{
        const elevation=Math.cos(a),lane=elevation-(.041*Math.sin(z*11)+.06);
        if(Math.abs(lane)<.26&&z>-.57*length)mix.lerp(lateral,(.26-Math.abs(lane))*.93);
        if(salmonid&&z>-.57*length&&z<.68*length){
          if(Math.abs(elevation)<.31)mix.lerp(blush,(.31-Math.abs(elevation))*1.85);
          if(elevation>.12&&Math.sin(z*67+elevation*41)>.69)mix.lerp(fleck,.63);
        }
      });
      const hunter=id==="piranha"||pike,jaw=aquaticMouth(g,[0,-y*.26,-length*.91],
        x*(hunter?.52:catfish?.56:.36),y*(hunter?.23:.17),length*(pike?.22:.19),back,belly,hunter?4:0);
      eyes(g,x*.77,y*(flat?.63:.22),-length*.74,small?.022:.030);
      for(const side of [-1,1]){
        const paddle=hinge(g,side*x*.64,-y*.28,-length*.38);
        paddle.userData.side=side;wings.push(paddle);
        const tip=[side*x*(flat?1.36:.91),-y*.62,length*.45];
        part(paddle,"oval",color,[0,0,0],[.034,.027,.058],[.07,side*.24,0]);
        fanFin(paddle,[0,0,-length*.085],[[side*x*.60,-y*.19,length*.11],tip,
          [tip[0]*.69,tip[1]*.84,length*.54],[tip[0]*.27,tip[1]*.37,length*.49],[0,0,length*.22]],[back,belly],.013);
        const gill=[[side*x*.83,y*.55,-length*.44,small?.005:.006],[side*x*.961,y*.21,-length*.36,.007],
          [side*x*.994,-y*.075,-length*.382,.007],[side*x*.884,-y*.41,-length*.468,.003]];
        taper(g,gill,[back,pigment(back,true)],6,[0,0,1]).castShadow=false;
        const pelvic=hinge(g,side*x*.46,-y*.45,length*.13);
        pelvic.userData.side=side;wings.push(pelvic);
        fanFin(pelvic,[0,0,-length*.14],[[side*x*.29,-y*.34,length*.05],[side*x*.54,-y*.63,length*.23],
          [side*x*.20,-y*.24,length*.30],[0,0,length*.29]],[back,color],.009);
      }
      const crest=eel?1.13:id==="piranha"?1.60:flat?1.25:style==="deep"?1.88:1.72;
      const dorsalRoot=[0,y*.70,length*.035],dorsalEdge=eel?[
        [0,y*.72,-length*.47],[0,y*1.11,-length*.16],[0,y*1.23,length*.25],[0,y*.90,length*.68],[0,y*.36,length*.82]]:
        [[0,y*.72,-length*.51],[0,y*(crest*.87),-length*.32],[0,y*crest,-length*.185],
        [0,y*(crest*.91),-length*.04],[0,y*(crest*.75),length*.12],[0,y*.57,length*.42],[0,y*.36,length*.59]];
      fanFin(g,dorsalRoot,dorsalEdge,[back,pigment(color,true)],.012);
      if(id==="raw_perch"||id==="raw_seabass"||pike)fanFin(g,[0,y*.40,length*.51],
        [[0,y*.49,length*.34],[0,y*.92,length*.49],[0,y*.69,length*.62],[0,y*.29,length*.74]],[back,color],.009);
      fin(g,back,[[0,-y*.58,length*.18],[0,-y*1.04,length*.47],[0,-y*.30,length*.68]],.022);
      contour(tail,[[-length*.10,0,x*.40,y*.39],[length*.04,0,x*.32,y*.34],[length*.25,0,x*.145,y*.24],
        [length*.38,0,x*.09,y*.14]],[color,belly],"",10);
      const tailTip=hinge(tail,0,0,length*.24);
      for(const side of [-1,1]){
        const roundTail=flat||id==="raw_tilapia"||id==="raw_pacu";
        const root=[0,0,-length*.10],tip=[0,side*y*(eel?.64:long?1.12:roundTail?1.16:1.45),length*(eel?.37:roundTail?.42:.52)];
        const fork=[0,0,length*(roundTail?.49:.27)];
        fanFin(tailTip,root,[[0,tip[1]*.51,length*.18],tip,[0,tip[1]*.72,tip[2]*1.07],[0,tip[1]*.33,length*.36],fork],[back,color],.013);
        if(catfish||id==="raw_loach"){
          const mouth=[side*x*.26,-y*.21,-length*1.10],bend=[side*x*.65,-y*.41,-length*1.20];
          taper(g,[[...mouth,.009],[...bend,.006],[side*x*1.28,-y*.60,-length*1.34,.002]],[back,belly],6);
        }
      }
      g.name=id;
      return {group:g,tail,tailTip,wings,jaw,verticalTail:false,swimStyle:long?"undulate":"swim",biteAngle:hunter?.83:.41};
    }
    function creature(kind){
      const palette={orca:[0x182a36,0xeff3ec],dolphin:[0x547d99,0xb0c9cb],reef_shark:[0x496473,0xc4ced0],caiman:[0x596846,0xb0a36a],piranha:[0x768f79,0xd98660],ray:[0x446c76,0xa6bcac],jelly:[0x69a4b8,0xa9dee0]};
      const [body,cream]=palette[kind];
      if(kind==="piranha"){
        const f=fish(kind,body,"deep");
        part(f.group,"oval",0xc76442,[0,-.13,-.13],[.149,.092,.29]);
        f.group.scale.setScalar(.84);return f;
      }
      const g=new T.Group(),wings=[],tail=hinge(g,0,0,kind==="jelly"?0:kind==="orca"?.96:.68);
      if(kind==="jelly"){
        const bell=hinge(g,0,0,0);
        bell.add(tail);
        g.userData.bell=bell;
        const canopy=new T.LatheGeometry([[.01,.257],[.16,.239],[.275,.181],[.361,.098],[.393,.019],
          [.378,-.021],[.322,-.033],[.239,-.013],[.09,.021],[.01,.038]].map(([r,y])=>new T.Vector2(r,y)),20);
        bell.add(new T.Mesh(canopy,material(body,true,.49)));
        part(bell,"ring",cream,[0,-.012,0],[.369,.369,.31],[Math.PI/2,0,0],true,.74);
        part(bell,"oval",0x66699a,[0,.068,0],[.205,.083,.205],[0,0,0],true,.48);
        const jaw=hinge(bell,0,-.016,0);
        part(jaw,"oval",0x895995,[0,-.032,0],[.068,.077,.067],[0,0,0],true,.76);
        part(jaw,"ring",cream,[0,-.088,0],[.051,.051,.35],[Math.PI/2,0,0],true,.88);
        part(jaw,"oval",0x472e64,[0,-.086,0],[.035,.017,.037],[0,0,0],true,.77);
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4;
          part(bell,"oval",cream,[Math.cos(a)*.342,.013,Math.sin(a)*.342],[.068,.033,.066],[0,0,0],true,.51);
          const meridian=(r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
          const ribs=[meridian(.14,.232),meridian(.238,.192),meridian(.324,.121),meridian(.36,.04)];
          for(let j=1;j<ribs.length;j++)link(bell,cream,ribs[j-1],ribs[j],.005,.56,true);
        }
        for(let i=0;i<8;i++){
          const t=i*Math.PI/4,u=Math.cos(t)*.235,v=Math.sin(t)*.235;
          const arm=hinge(tail,u,.021,v);
          wings.push(arm);
          const length=.41+(i%3)*.056,points=[[0,0,0],[u*.10,-length*.34,v*.10],
            [u*.27,-length*.61,v*.18],[u*.13,-length*.83,v*.29],[-u*.08,-length,v*.32]];
          for(let j=1;j<points.length;j++){
            const color=j%2?cream:body,r=.042-j*.007;
            link(arm,color,points[j-1],points[j],r,.69,true);
            if(j<points.length-1)part(arm,"oval",color,points[j],[r,r,r],[0,0,0],true,.65);
          }
        }
        return {group:g,tail,wings,jaw,verticalTail:false,swimStyle:"pulse"};
      }
      if(kind==="ray"){
        contour(g,[[-.78,-.01,.13,.038],[-.64,0,.26,.077],[-.36,.018,.34,.124],
          [-.02,.011,.34,.115],[.30,0,.27,.088],[.63,-.02,.11,.046],[.75,-.02,.062,.037]],[body,cream],"speckle",16);
        for(const side of [-1,1]){
          const wing=hinge(g,side*.11,0,-.07);wing.userData.side=side;wings.push(wing);
          rayWing(wing,side,body,cream);
          fanFin(wing,[side*.12,.053,-.26],[[side*.27,.051,-.29],[side*.62,.012,-.117],
            [side*.44,.061,.036],[side*.22,.055,.121]],[body,0x7f9d91],.005);
        }
        taper(tail,[[0,-.016,-.077,.055],[0,-.028,.14,.043],[.012,-.037,.35,.028],
          [.032,-.017,.57,.018],[.088,.013,.78,.006]],[body,cream],8);
        fanFin(tail,[.004,-.010,.162],[[.007,.037,.199],[.018,.072,.268],[.019,.040,.318],[.015,-.013,.366]],
          [pigment(body,false),body],.010);
        const jaw=aquaticMouth(g,[0,-.055,-.51],.105,.025,.091,cream,cream);
        part(g,"oval",0x546568,[0,-.076,-.542],[.090,.010,.021]);
        for(const side of [-1,1])for(let i=0;i<3;i++){
          const x=side*(.112+i*.023),z=-.40+i*.071;
          link(g,0x506365,[x,-.064,z],[x*.73,-.082,z+.015],.005);
        }
        eyes(g,.14,.103,-.36,.037);
        return {group:g,tail,wings,jaw,verticalTail:false,swimStyle:"glide"};
      }
      if(kind==="caiman"){
        scaledContour(g,[[-1.09,-.21,.32,.20],[-1.02,-.19,.47,.30],[-.73,-.09,.62,.56],[-.52,.05,.74,.82],
          [-.28,0,.86,.84],[0,0,1,1],[.32,.01,.82,.84],[.71,-.04,.42,.52]],.33,.22,1,[body,cream],"speckle");
        const jaw=aquaticMouth(g,[0,-.046,-.675],.141,.056,.305,body,cream,6);
        for(const side of [-1,1]){
          part(g,"oval",0x39463a,[side*.072,.011,-1.035],[.028,.014,.043],[.3,0,0]);
          part(g,"oval",body,[side*.119,.107,-.68],[.076,.057,.16],[.11,side*.22,0]);
          taper(g,[[side*.076,.014,-1.04,.023],[side*.111,.024,-.925,.034],
            [side*.145,.059,-.80,.039],[side*.139,.109,-.681,.023]],[body,0x899067],7);
        }
        eyes(g,.149,.131,-.68,.05);
        for(const side of [-1,1]){
          for(const z of [-.36,.32]){
            const leg=hinge(g,side*.233,-.091,z);leg.userData.side=side;wings.push(leg);
            taper(leg,[[0,.014,.018,.071],[side*.12,-.017,.081,.058],[side*.18,-.061,.013,.038],
              [side*.22,-.075,-.092,.034]],[body,cream],7);
            part(leg,"chamfer",body,[side*.208,-.08,-.095],[.096,.051,.108],[0,side*.16,0]);
            for(let j=-1;j<=1;j++)part(leg,"spike",0xbbad86,[side*.21+j*.023,-.086,-.157+Math.abs(j)*.013],
              [.012,.036,.011],[-Math.PI/2,0,0]);
          }
          for(let j=0;j<7;j++)part(g,"shard",j%3?0x3f533b:body,[side*(.103+Math.sin(j*.72)*.020),.173,.54-j*.141],[.075,.071-(j%2)*.01,.094],[.19,side*.09,0]);
        }
        contour(tail,[[0,0,.158,.125],[.23,-.026,.144,.115],[.44,-.045,.103,.088],
          [.65,-.057,.063,.061],[.88,-.053,.021,.039],[.96,-.039,.008,.014]],[body,cream],"stripe",10);
        for(let i=0;i<4;i++)part(tail,"diamond",0x445a3c,[0,.092-i*.013,.16+i*.15],[.064-i*.01,.051-i*.007,.097-i*.009]);
        return {group:g,tail,wings,jaw,verticalTail:false,swimStyle:"undulate",biteAngle:.75};
      }
      const orca=kind==="orca",dolphin=kind==="dolphin",length=orca?1.16:dolphin?.88:1.03;
      const width=orca?.425:dolphin?.249:.292,height=orca?.412:dolphin?.263:.27;
      const nose=dolphin?[-1.39,-.31,.21,.088]:orca?[-1.09,-.17,.43,.27]:[-1.16,-.14,.15,.125];
      const oceanHull=[nose,[-1.035,-.12,dolphin?.43:.62,dolphin?.25:.50],[-.91,-.04,.71,.67],[-.81,.02,.83,.82],
        [-.665,.038,.94,.95],[-.47,.01,1,1],[-.285,.008,1.01,.985],[-.07,0,1,.94],
        [.16,-.021,.89,.87],[.33,-.036,.74,.77],[.51,-.055,.60,.63],[.64,-.085,.48,.48],[.84,-.13,.27,.29]];
      const warm=new T.Color(cream);
      contour(g,oceanHull.map(([z,c,w,h])=>[z*length,c*height,w*width,h*height]),[body,cream],"",28,null,(mix,z,a)=>{
        const level=Math.cos(a);
        if(orca){
          const whitePatch=1-((z/length+.51)/.205)**2-((level-.235)/.235)**2;
          if(whitePatch>-.19)mix.lerp(warm,Math.min(1,.38+whitePatch*2.4));
          if(level<-.24&&z/length<.52)mix.lerp(warm,Math.min(.98,(-level-.23)*2.72));
        }else if(dolphin&&level<.19&&z/length>-.80){
          mix.lerp(warm,Math.min(.51,Math.max(0,.19-level)*.62));
        }
      });
      const shark=kind==="reef_shark";
      const jaw=aquaticMouth(g,[0,-height*(shark?.47:.37),-length*(dolphin?.90:.76)],
        width*(orca?.68:dolphin?.49:.64),height*(orca?.15:dolphin?.15:.20),
        length*(dolphin?.349:shark?.237:.218),shark?cream:body,cream,shark?6:0);
      eyes(g,width*.83,height*.18,-length*.766,orca?.044:.034);
      for(const side of [-1,1]){
        const start=[side*width*.61,-height*.21,-length*1.006];
        const finish=[side*width*.82,-height*.35,-length*.76];
        fin(g,pigment(body,false),[start,finish,[finish[0],finish[1]-.027,finish[2]-.02]],.012);
      }
      for(const side of [-1,1]){
        const wing=hinge(g,side*width*.55,-height*.23,-length*.19);wing.userData.side=side;wings.push(wing);
        const tip=side*(orca?.65:.45);
        fanFin(wing,[-side*.065,.017,-.24],[[tip*.44,-.024,-.06],[tip*.82,-.111,.18],[tip,-.17,.38],
          [tip*.62,-.188,.423],[tip*.21,-.105,.431],[-side*.07,-.035,.40]],[pigment(body,false),body],.026);
        if(shark)for(let j=0;j<5;j++){
          const z=-.42+j*.041,x=side*(width*.971+j*.001),len=.11-j*.008;
          taper(g,[[x,.038,z,.006],[x+side*.007,.009,z+.018,.007],[x-side*.021,-len,z+.030,.004]],[0x293a46,body],5);
        }
      }
      fanFin(g,[0,height*.57,-.28],[[0,height*.80,-.35],[0,height+(orca?.32:.21),-.01],
        [0,height+(orca?.51:.32),.27],[0,height*.95,.19],[0,height*.56,.37],[0,height*.27,.55]],
        [pigment(body,false),body],.032);
      contour(tail,[[-.12,-height*.13,width*.34,height*.34],[0,-height*.16,width*.29,height*.33],[.15,-height*.21,width*.24,height*.31],
        [.33,-height*.18,width*.185,height*.22],[.52,-height*.12,width*.106,height*.095]],[body,cream]);
      for(const side of [-1,1]){
        const cross=side*(orca?.53:.37),lift=side*(side>0?.43:.29);
        const edge=shark?[[0,lift*.47,.49],[0,lift,.74],[0,lift*.65,.755],[0,lift*.31,.63],[0,0,.59]]:
          [[cross*.44,-.013,.445],[cross*.74,-.023,.49],[cross,-.06,.67],[cross*.59,-.073,.655],[cross*.26,-.032,.61],[0,-.024,.515]];
        fanFin(tail,[0,-.014,shark?.33:.285],edge,[pigment(body,false),body],.021);
      }
      return {group:g,tail,wings,jaw,verticalTail:orca||dolphin,swimStyle:shark?"undulate":"swim",biteAngle:shark?.77:.38};
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
        fin(wing,vein,[[0,.022,-.07],[x,.025,.061+Math.sin(j*.68)*.065],[x*.77,.025,.046]],.007,.79);
        }
        part(head,"cube",vein,[side*.079,.093,-.107],[.019,.193,.018],[.42,0,-side*.31],true);
      }
      for(const z of [.15,.25,.33])part(group,"diamond",vein,[0,.745,z],[.052,.05,.036],[0,0,0],true);
    }
    function joinLimbs(type,rig){
      if(type==="scorpion")return;
      for(const limb of [...rig.legs,...rig.arms]){
        const section=limb.userData.lower;
        const upper=limb.children.find(node=>node.isMesh);
        const lower=section?.children.find(node=>node.isMesh);
        if(!upper||!lower||!Math.abs(section.position.y))continue;
        const r=Math.min(Math.abs(upper.scale.x)*.42,Math.abs(lower.scale.z)*.49);
        if(!r||r>.3)continue;
        part(section,"oval",upper.material.color?.getHex()??0x79766c,[0,0,0],[r,r*.72,r]);
      }
    }
    function stockAnimalDetails(type,group,rig,colors){
      const head=rig.head;
      if(!head)return;
      const [coat,light]=colors,skull=head.children.find(node=>node.isMesh);
      if(skull)skull.geometry=geometry.rounded;
      const dark=pigment(coat,false);
      for(const eye of head.children.filter(node=>node.userData.entityEye)){
        const [x,y,z]=eye.position.toArray(),r=eye.userData.size;
        part(head,"oval",skull?.material.color.getHex()??coat,[x,y,z+r*.38],[r*1.31,r*1.05,r*.69]);
        for(const layer of eye.children)if(layer.isMesh){layer.geometry=geometry.rounded;}
      }
      if(type==="rabbit"){
        if(skull){
          head.remove(skull);
          const tint=skull.material.color.getHex();
          contour(head,[[-.208,-.007,.087,.090],[-.168,-.002,.152,.128],[-.112,.012,.185,.161],
            [-.035,.015,.202,.185],[.068,.021,.172,.162],[.151,.035,.105,.09]],[tint,light],"",16);
        }
        for(const node of [...head.children])if(node.isMesh&&node.position.y>.30)head.remove(node);
        const tail=group.children.find(node=>node.isMesh&&node.position.z>.39);
        if(tail){tail.geometry=geometry.oval;tail.scale.multiplyScalar(.55);}
        for(const side of [-1,1]){
          const path=[[side*.111,.104,.008,.062,.051],[side*.138,.287,.004,.069,.053],
            [side*.170,.483,.039,.055,.045],[side*.212,.665,.092,.022,.023]];
          taper(head,path,[coat,light],8);
          fanFin(head,[side*.115,.175,-.032],[[side*.101,.35,-.043],[side*.165,.60,.050],[side*.208,.466,-.002],
            [side*.178,.293,-.043]],[0xb57f80,0xd89897],.008);
          part(head,"oval",light,[side*.060,-.095,-.170],[.075,.057,.065]);
        }
      }else if(type==="cow"||type==="pig"){
        const bovine=type==="cow",muzzle=head.children.find(node=>node.isMesh&&node.position.z<(bovine?-.25:-.30));
        if(muzzle){muzzle.geometry=geometry.oval;muzzle.scale.multiplyScalar(.53);}
        const snout=bovine?-.347:-.467;
        for(const side of [-1,1]){
          part(head,"oval",bovine?0xc58f88:0xc48685,[side*(bovine?.141:.105),-.119,snout+.043],[.071,.052,.059]);
          link(head,bovine?0x715254:0x824658,[side*.019,-.165,snout-.006],
            [side*(bovine?.108:.083),-.159,snout+.022],.006);
          const ear=head.children.find(node=>node.isMesh&&node.position.x*side>.21&&node.position.y>.12);
          if(ear){ear.geometry=geometry.chamfer;ear.scale.multiplyScalar(.71);}
        }
        if(bovine)taper(group,[[0,.89,-.332,.25,.242],[0,.952,-.45,.232,.211],[0,1.027,-.581,.167,.165]],
          [0x585253,0xa29a8f],10);
      }else if(type==="sheep"){
        for(const mesh of rig.body.children.filter(node=>node.isMesh&&!node.userData.ownGeometry)){
          mesh.geometry=geometry.chamfer;mesh.scale.multiplyScalar(.76);
        }
        for(const side of [-1,1])for(let i=0;i<4;i++){
          const z=.303-i*.192;
          part(rig.body,"chamfer",i%2?0xd8d1bd:0xe3ddcc,[side*(.376+i*.015),.82+(i%2)*.075,z],
            [.152,.181,.153],[.28,side*.17,side*.28]);
        }
      }else if(type==="capivara"){
        for(const side of [-1,1]){
          part(head,"oval",dark,[side*.092,-.037,-.441],[.041,.025,.023],[0,side*.25,0]);
          part(head,"oval",light,[side*.145,-.097,-.368],[.118,.053,.047],[.11,side*.21,0]);
        }
      }else if(type==="owl"||type==="chicken"){
        const owl=type==="owl";
        taper(head,[[0,-.038,owl?-.201:-.232,.037],[0,-.053,owl?-.277:-.309,.044],
          [0,-.092,owl?-.325:-.394,.010]],[0xbb914d,0xe4ad59],6);
        for(const wing of rig.wings){
          const side=wing.userData.side||1;
          for(const mesh of wing.children.filter(node=>node.isMesh&&!node.userData.ownGeometry)){
            if(mesh.material.color&&mesh.geometry!==geometry.oval){mesh.geometry=geometry.chamfer;mesh.scale.multiplyScalar(.70);}
          }
          const wrist=[side*.071,-.037,-.082];
          fanFin(wing,wrist,[[side*.163,-.014,.025],[side*.32,-.082,.154],[side*.413,-.19,.257],
            [side*.31,-.214,.294],[side*.18,-.182,.252],[side*.054,-.09,.159]],[dark,light],.025);
        }
        if(!owl)for(const leg of rig.legs){
          const toes=leg.userData.lower;
          for(let i=-1;i<=1;i++)taper(toes,[[i*.015,-.141,-.039,.011],[i*.026,-.155,-.083,.009],
            [i*.044,-.160,-.127+Math.abs(i)*.019,.003]],[0xbd8c57,0xe3bd85],5);
        }
      }
    }
    function refine(type,group,rig){
      if(type==="moth"){moth(group,rig);return}
      const animals={pig:[0xb96972,0xeea99d],cow:[0x433c3d,0xbba38d],sheep:[0xaca898,0xebddc8],
        rabbit:[0xc0a181,0xe5caaa],capivara:[0x624634,0xb18a64],
        owl:[0x695344,0xd8c4a6],chicken:[0xb39676,0xece2cf]};
      const colors=animals[type];
      if(colors){
        const hull=rig.body?.children.find(n=>n.isMesh);
        if(hull&&type!=="cow"){
          const size=hull.scale.clone().multiplyScalar(.57),y=hull.position.y,z=hull.position.z;
          size.z={pig:.455,sheep:.50,rabbit:.348,capivara:.486,owl:.274,chicken:.30}[type]??size.z;
          const newBody=scaledContour(rig.body,[[-.99,0,.43,.56],[-.69,-.027,.79,.85],[-.29,.016,.92,1],
            [.29,-.025,1,.89],[.69,-.04,.83,.75],[1,-.061,.34,.46]],size.x,size.y,size.z,[hull.material.color.getHex(),colors[1]]);
          newBody.position.set(hull.position.x,y,z);
          if(type==="sheep"){hull.geometry=geometry.chamfer;hull.scale.multiplyScalar(.72)}
          else rig.body.remove(hull);
          if(rig.head){
            const neck=hull.material.color.getHex(),head=rig.head.position;
            const [fromY,toY]=[y+.045,head.y-.034],fromZ=z-size.z*.53,toZ=head.z+.091;
            const r=size.y*(type==="owl"?.68:.61);
            taper(group,[[0,fromY,fromZ,r*1.14,r*1.16],[0,(fromY+toY)*.50,(fromZ+toZ)*.50,r,r],
              [0,toY,toZ,r*.65,r*.71]],[neck,colors[1]],10);
          }
        }
        for(const leg of rig.legs){
          const lower=leg.userData.lower;
          if(!lower)continue;
          const [shin,foot]=lower.children.filter(node=>node.isMesh),upper=leg.children.find(node=>node.isMesh);
          if(!foot?.isMesh||type==="owl"||type==="chicken")continue;
          const {x,y,z}=foot.position,width=foot.scale.x,depth=foot.scale.z;
          const hoof=type==="cow"||type==="sheep"||type==="pig",rabbit=type==="rabbit",hind=leg.position.z>0;
          const skin=upper?.material.color.getHex()??colors[0],shade=pigment(skin,true),knee=lower.position.y,win=width*.40;
          if(upper&&shin){
            leg.remove(upper);
            lower.remove(shin,foot);
            for(const accent of leg.children.filter(node=>node.isMesh))accent.geometry=geometry.rounded;
            taper(leg,[[0,width*.41,0,width*(rabbit&&hind?.88:.58),width*.53],
              [0,knee*.41,hind?.021:0,width*(rabbit&&hind?.65:.51),width*.46],
              [0,knee-win*.13,0,win,win]],[skin,shade],8);
            taper(lower,[[0,win*.37,0,win,win],[0,y*.54,z*.20,win*.83,win*.85],
              [0,y+.024,z*.76,win*.92,win*.96]],[skin,shade],8);
          }
          part(lower,"oval",hoof?0x5d5352:skin,[x,y+.010,z-.023],[width*.59,.053,depth*(rabbit?.78:.63)]);
          if(hoof){
            for(const side of [-1,1])part(lower,"chamfer",0x3d3331,[x+side*width*.24,y-.002,z-depth*.34],[width*.31,.068,depth*.57]);
          }else{
            for(const toe of [-1,0,1])part(lower,"oval",shade,[x+toe*width*.30,y+.001,z-depth*.53],
              [width*.21,.038,depth*.32]);
          }
        }
        if(type==="owl"||type==="chicken")for(const wing of rig.wings){
          const side=wing.userData.side||1;
          part(wing,"oval",colors[0],[-side*.071,-.025,.027],[.137,.076,.150]);
          part(wing,"oval",colors[1],[side*.054,-.030,.046],[.125,.115,.189],[.24,0,side*-.31]);
          for(let i=0;i<3;i++)fin(wing,i%2?colors[0]:colors[1],
            [[side*(.052+i*.051),.007,-.068],[side*(.29+i*.029),-.077-i*.038,.19],[side*(.18+i*.06),-.031,.13]],.028);
        }
        stockAnimalDetails(type,group,rig,colors);
        joinLimbs(type,rig);
        return;
      }
      joinLimbs(type,rig);
      if(type==="slime"){
        const [main,crown]=rig.body.children;
        main.geometry=geometry.slime;
        main.position.set(0,0,0);main.scale.set(1,1,.96);
        rig.body.remove(crown);
        for(const [x,y,z,color] of [[-.23,.34,-.24,0x9ef884],[.18,.55,-.18,0x56b04b],[.16,.28,.29,0xa2e755],[0,.19,-.14,0xb5d965]]){
          part(rig.body,"diamond",color,[x,y,z],[.08,.09,.073],[.3,.45,0],true,.73);
        }
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3;
          part(rig.body,"oval",i%2?0x9deca0:0x71ba67,[Math.sin(a)*.379,.34+(i%3)*.072,Math.cos(a)*.371],
            [.074,.054,.061],[0,0,a],true,.52);
        }
      }else if(type==="cobrete"){
        for(const side of [-1,1])for(const y of [.84,1.055])part(group,"disk",0xedbf79,[side*.25,y,-.244],[.048,.036,.048],[Math.PI/2,0,0]);
        part(group,"ring",0xc08b53,[0,1.49,-.264],[.125,.101,.86],[0,0,0]);
        for(const side of [-1,1]){
          part(group,"chamfer",0xa26b46,[side*.195,1.458,-.180],[.144,.214,.167],[0,side*.19,side*.14]);
          const pipe=[[side*.242,1.106,.163],[side*.36,.96,.237],[side*.342,.831,.282],[side*.241,.731,.226]];
          for(let i=1;i<pipe.length;i++)link(group,0x915d41,pipe[i-1],pipe[i],.025);
        }
      }else if(type==="cristalume"){
        for(const [x,y,z] of [[-.16,1.16,-.05],[.13,1.08,.053],[.04,1.25,.131]]){
          part(group,"diamond",0x71f3d4,[x,y,z],[.096,.31,.105],[.27,.45,x*.92],true);
        }
      }else if(type==="golem"||type==="magma"){
        rig.body.geometry=geometry.facet;rig.body.scale.x*=1.08;
        for(const limb of [...rig.arms,...rig.legs]){
          const plate=limb.children.find(node=>node.isMesh);
          if(plate){plate.geometry=geometry.chamfer;plate.scale.multiplyScalar(.76)}
        }
        const stone=type==="golem"?0x4e3a58:0x513433,rune=type==="golem"?0xb586d6:0xffa246;
        for(const side of [-1,1]){
          part(group,"diamond",stone,[side*.56,1.68,.034],[.225,.208,.242],[.12,.37,side*.18]);
          for(const y of [1.12,1.28,1.46])part(group,"diamond",rune,[side*.229,y,-.311],[.033,.074,.047],[0,.15,side*.27],true);
          for(const limb of rig.arms.filter(o=>(o.userData.side||0)===side)){
            part(limb,"shard",stone,[side*.041,-.10,-.096],[.194,.243,.120],[.28,.36,side*.22]);
            const fist=limb.userData.lower;
            if(fist)for(let i=-1;i<=1;i++)part(fist,"chamfer",stone,[i*.067,-.390,-.085],[.064,.107,.085],[.16,0,i*.16]);
          }
        }
      }else if(type==="wisp"){
        for(const side of [-1,1]){
          part(group,"diamond",0xa8c7e9,[side*.48,.49,.09],[.068,.176,.067],[.13,.25,side*.4],true);
          part(group,"ring",0x82e5ed,[side*.20,.87,-.18],[.081,.092,.41],[0,side*.38,0],true);
        }
      }
    }
    function scorpion(g,rig){
      const shell=0xb7753e,edge=0xd19a59,deep=0x573b33,tip=0x33242c;
      contour(g,[[-.59,.255,.22,.108],[-.39,.285,.31,.155],[-.15,.277,.31,.143],
        [.08,.266,.28,.131],[.30,.264,.21,.105],[.46,.282,.115,.082]],[shell,deep],"stripe");
      for(let i=0;i<5;i++){
        const z=-.35+i*.154,r=.28-i*.031;
        part(g,"oval",i%2?edge:shell,[0,.38-i*.013,z],[r,.055,.108],[.11,0,0]);
        part(g,"shard",edge,[0,.425-i*.013,z+.015],[.046,.032,.073]);
        for(const side of [-1,1])taper(g,[[side*r*.74,.375-i*.012,z-.052,.014],
          [side*r*.84,.372-i*.014,z-.012,.021],[side*r*.75,.362-i*.014,z+.046,.009]],[deep,edge],5);
      }
      eyes(g,.097,.359,-.497,.029);
      for(const side of [-1,1]){
        link(g,deep,[side*.068,.247,-.50],[side*.112,.197,-.66],.028);
        for(let i=0;i<4;i++){
          const leg=hinge(g,side*(.226-i*.028),.245,-.33+i*.176);
          leg.userData.side=side;leg.userData.phase=(i%2)*Math.PI;
          const knee=[side*(.30-i*.018),.083,-.105+i*.085],ankle=[side*(.45-i*.011),-.174,-.14+i*.102];
          link(leg,shell,[0,0,0],knee,.043);
          part(leg,"oval",deep,knee,[.049,.045,.047]);
          link(leg,edge,knee,ankle,.027);
          link(leg,deep,ankle,[ankle[0]+side*.062,-.23,ankle[2]-.049],.015);
          rig.legs.push(leg);
        }
        const arm=hinge(g,side*.184,.285,-.437);arm.userData.side=side;rig.arms.push(arm);
        const elbow=[side*.216,-.025,-.11],palm=[side*.30,-.012,-.30];
        link(arm,shell,[0,0,0],elbow,.074);
        link(arm,edge,elbow,palm,.067);
        part(arm,"oval",shell,palm,[.107,.082,.13],[0,side*.22,0]);
        for(const split of [-1,1]){
          const a=[palm[0]+split*.063,-.011,-.345],b=[palm[0]+split*.10,-.012,-.45];
          link(arm,edge,a,b,.043);
          link(arm,deep,b,[palm[0]+split*.049,-.026,-.532],.029);
          part(arm,"oval",tip,[palm[0]+split*.049,-.026,-.532],[.024,.022,.025]);
        }
      }
      const tailPoints=[[0,.29,.30],[0,.40,.54],[0,.59,.64],[0,.80,.59],[0,.94,.43],[0,.96,.23],[0,.87,.105]];
      let parent=g;
      for(let i=1;i<tailPoints.length;i++){
        const a=tailPoints[i-1],b=tailPoints[i],r=.121-i*.012;
        const offset=parent===g?a:tailPoints[i-2].map((v,k)=>a[k]-v);
        const segment=hinge(parent,...offset),end=a.map((v,k)=>b[k]-v);
        part(segment,"oval",deep,[0,0,0],[r*.76,r*.76,r*.76]);
        link(segment,i===6?tip:i%2?shell:edge,[0,0,0],end,r);
        if(i<6)part(segment,"oval",edge,end,[r*.72,r*.72,r*.72]);
        rig.tails.push(segment);parent=segment;
      }
    }
    const forms={
      lion:[.76,.72,.29,.35,.62,.68,1.02,.253,.232,.245],
      tiger:[.72,.80,.29,.32,.59,.64,.98,.237,.224,.232],
      jaguar:[.64,.685,.274,.285,.54,.57,.88,.233,.205,.217],
      lynx:[.68,.51,.196,.235,.60,.43,.89,.171,.172,.177],
      brown_bear:[.81,.73,.365,.415,.64,.62,1.01,.269,.239,.25],
      polar_bear:[.79,.79,.343,.35,.66,.70,1.07,.249,.21,.257],
      black_bear:[.76,.67,.31,.34,.61,.57,.98,.234,.221,.22],
      bison:[.93,.84,.379,.50,.66,.83,1.11,.274,.29,.27],
      badger:[.46,.60,.245,.244,.31,.48,.54,.156,.148,.185],
      fennec:[.57,.43,.147,.19,.48,.38,.74,.138,.151,.155],
      rime_fox:[.57,.52,.174,.21,.47,.44,.78,.158,.161,.172],
      dog:[.65,.56,.197,.235,.53,.45,.88,.17,.18,.194],
      wolf:[.70,.63,.219,.271,.56,.52,.93,.186,.194,.22],
      cat:[.62,.48,.181,.228,.49,.42,.81,.164,.171,.175]
    };
    // Each row defines the width, back line and belly line from neck to tail.
    const stocky=[[-1.13,.27,.56,-.29],[-.92,.67,.90,-.59],[-.59,1,1.02,-.86],
      [-.21,.95,.89,-.91],[.21,.90,.77,-.83],[.58,1.02,.89,-.78],[.83,.84,.75,-.65],[1.04,.39,.36,-.46],[1.09,.05,.03,-.20]];
    const bodyProfiles={
      bison:[[-1.14,.32,.64,-.30],[-.94,.73,1.06,-.76],[-.67,.98,1.48,-.93],[-.44,1.04,1.64,-.88],
        [-.15,.97,1.31,-.83],[.17,.79,.84,-.63],[.47,.71,.66,-.56],[.72,.74,.63,-.60],[.94,.47,.47,-.46],[1.06,.08,.15,-.21]],
      lion:[[-1.16,.29,.70,-.18],[-.91,.70,.99,-.77],[-.62,1,1.14,-1.03],[-.34,.91,1.01,-.89],
        [.05,.73,.86,-.65],[.31,.72,.84,-.48],[.62,.91,1.02,-.75],[.85,.66,.86,-.67],[1.04,.11,.23,-.22]],
      tiger:[[-1.13,.40,.55,-.32],[-.89,.78,.92,-.79],[-.59,1.04,1.04,-.97],[-.24,1,.91,-.98],
        [.09,.83,.81,-.87],[.36,.81,.86,-.58],[.62,.99,1.04,-.82],[.86,.76,.88,-.65],[1.07,.09,.21,-.17]],
      jaguar:[[-1.13,.36,.53,-.32],[-.9,.79,.82,-.76],[-.65,1.06,.97,-.95],[-.31,1.05,1,-.97],
        [.06,.92,.85,-.85],[.31,.85,.79,-.66],[.60,.99,.97,-.84],[.85,.68,.79,-.65],[1.01,.11,.23,-.21]],
      polar_bear:[[-1.15,.38,.71,-.31],[-.91,.64,.93,-.64],[-.59,.87,1,-.82],[-.21,.93,.92,-.98],
        [.18,1,.82,-1.05],[.54,1.06,.87,-.87],[.79,.85,.70,-.71],[1.01,.45,.57,-.41],[1.12,.10,.24,-.18]],
      brown_bear:[[-1.13,.32,.62,-.35],[-.91,.72,1.00,-.70],[-.60,1,1.22,-.84],[-.29,1.01,1.13,-.97],
        [.11,.92,.76,-.95],[.54,1.04,.85,-.89],[.81,.86,.78,-.70],[1.02,.48,.47,-.48],[1.10,.09,.18,-.18]],
      black_bear:stocky,
      badger:[[-1.10,.25,.69,-.29],[-.88,.69,.92,-.67],[-.55,.98,1,-.79],[-.21,1.04,.94,-.91],
        [.23,1.09,.86,-.83],[.61,1,.76,-.77],[.89,.67,.58,-.61],[1.08,.13,.23,-.23]],
      wolf:[[-1.12,.37,.74,-.12],[-.88,.77,1.05,-.76],[-.61,1.03,1.14,-1.06],[-.29,.91,.97,-.91],
        [.10,.73,.79,-.65],[.31,.65,.76,-.39],[.59,.88,.95,-.62],[.85,.61,.79,-.53],[1.06,.05,.23,-.20]],
      dog:[[-1.13,.33,.72,-.26],[-.86,.73,1.04,-.64],[-.59,1,1.12,-1.05],[-.20,.90,.95,-.91],
        [.13,.73,.77,-.68],[.39,.75,.79,-.49],[.64,.90,.93,-.67],[.87,.62,.71,-.49],[1.05,.07,.19,-.18]],
      fennec:[[-1.11,.34,.71,-.11],[-.87,.70,1.04,-.53],[-.56,.94,1.13,-.89],[-.27,.79,.93,-.61],
        [.09,.64,.75,-.52],[.40,.72,.77,-.40],[.66,.93,.89,-.60],[.87,.64,.71,-.52],[1.06,.10,.21,-.18]],
      rime_fox:[[-1.12,.34,.81,-.21],[-.88,.79,1.03,-.69],[-.58,1.03,1.13,-.95],[-.27,.94,.97,-.76],
        [.13,.77,.83,-.65],[.40,.78,.81,-.49],[.65,.96,.94,-.69],[.86,.71,.78,-.57],[1.09,.11,.25,-.18]],
      cat:[[-1.16,.28,.60,-.15],[-.87,.67,.91,-.65],[-.60,.98,1.03,-.95],[-.29,.88,.91,-.78],
        [.12,.71,.96,-.67],[.40,.80,1.06,-.49],[.65,.98,1.18,-.64],[.86,.66,.80,-.52],[1.04,.09,.26,-.19]],
      lynx:[[-1.15,.29,.66,-.16],[-.87,.74,.98,-.65],[-.59,1,1.08,-.99],[-.23,.91,.97,-.68],
        [.17,.77,.92,-.62],[.46,.88,1.06,-.58],[.70,1.04,1.21,-.65],[.90,.66,.91,-.52],[1.07,.06,.24,-.21]],
      cow:[[-1.07,.29,.72,-.24],[-.86,.72,.82,-.67],[-.54,.91,.87,-.93],[-.23,1.03,.83,-.99],
        [.16,1.05,.80,-1.04],[.51,.99,.89,-.86],[.81,.93,.82,-.69],[1.01,.55,.52,-.39],[1.10,.10,.17,-.12]]
    };
    function torsoShape([z,center,rx,ry],angle){
      const c=Math.cos(angle),s=Math.sin(angle);
      return [s*rx*(1.05-.16*c*c),center+Math.sign(c)*Math.pow(Math.abs(c),.85)*ry,z];
    }
    function torsoSections(id,length,width,height){
      return bodyProfiles[id].map(([z,w,back,belly])=>[z*length,(back+belly)*.5*height,w*width,(back-belly)*.5*height]);
    }
    function coatDetails(body,sections,id,pattern,coat){
      if(!["tiger","tabby","saddle","rosette","tufts"].includes(pattern))return;
      const positions=[];
      const mark=(a,b,c)=>positions.push(...a,...b,...c);
      const surface=(z,a)=>{
        let index=sections.findIndex(section=>section[0]>=z);
        index=Math.max(1,index===-1?sections.length-1:index);
        const lo=sections[index-1],hi=sections[index],t=(z-lo[0])/(hi[0]-lo[0]);
        const [,middle,rx,ry]=lo.map((v,i)=>v+(hi[i]-v)*t);
        return torsoShape([z,middle,rx+.009,ry+.009],a);
      };
      const stripeColor=id==="tiger"?0x382927:pigment(coat,false);
      for(const side of [-1,1]){
        if(["tiger","tabby","saddle"].includes(pattern)){
          const stripes=pattern==="saddle"?5:8;
          for(let i=0;i<stripes;i++){
            const z=sections[0][0]*.58+i*(sections.at(-1)[0]*.80-sections[0][0]*.58)/stripes;
            let previous=null;
            for(let j=0;j<7;j++){
              const t=j/6,a=side*(.10+t*(pattern==="saddle"?1.10:1.85+(i%3)*.28));
              const s=z+Math.sin(t*5.4+i)*(.021+t*.053)+(i%2?.075:-.04)*t;
              const width=(.030+(i%3)*.006)*(1-t*.89),row=[surface(s-width,a),surface(s+width,a)];
              if(previous){
                mark(previous[0],previous[1],row[0]);
                mark(previous[1],row[1],row[0]);
              }
              previous=row;
            }
          }
        }
        if(pattern==="rosette"||pattern==="tufts")for(let i=0;i<(pattern==="rosette"?21:13);i++){
          const z=sections[0][0]*.66+(sections.at(-1)[0]*.77-sections[0][0]*.66)*((i*19)%29)/29;
          const angle=side*(.38+(i*13%23)*.084),r=.022+(i%4)*.006;
          const mid=surface(z,angle);
          for(let j=0;j<(pattern==="rosette"?5:2);j++){
            const a=j*Math.PI*.4+.41,k=a+.54;
            const p=surface(z+Math.sin(a)*r,angle+Math.cos(a)*r*5);
            const q=surface(z+Math.sin(k)*r,angle+Math.cos(k)*r*5);
            mark(p,q,p.map((v,n)=>v+(mid[n]-v)*.38));
          }
        }
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute("position",new T.Float32BufferAttribute(positions,3));geo.computeVertexNormals();
      const color=pattern==="rosette"?0x54321e:pattern==="tufts"?0x684c3e:stripeColor;
      const mesh=new T.Mesh(geo,material(color));
      mesh.material=mesh.material.clone();
      mesh.material.side=T.DoubleSide;
      mesh.userData.ownGeometry=true;mesh.userData.ownMaterial=true;mesh.userData.noShadow=true;
      body.add(mesh);
    }
    function cowCoat(parent){
      const profile=torsoSections("cow",.65,.41,.38).map(([z,c,x,h])=>[z,c+.83,x,h]);
      const sections=[profile[0]];
      for(let i=1;i<profile.length;i++)for(let j=1;j<=4;j++){
        sections.push(profile[i-1].map((v,k)=>v+(profile[i][k]-v)*j*.25));
      }
      const markings=[[-.34,1.41,.193,.69],[.11,1.12,.26,.61],[.46,1.96,.20,.58],
        [-.41,-1.33,.24,.74],[.23,-1.70,.29,.74],[.53,-.63,.13,.50],[.05,.03,.21,.31]];
      const black=new T.Color(0x272327),ashen=new T.Color(0x403638);
      return contour(parent,sections,[0xf3e7d1,0xdfc7ae],"",48,torsoShape,(color,z,a)=>{
        const theta=a>Math.PI?a-2*Math.PI:a;
        for(const [at,arc,w,h] of markings){
          const x=(z-at)/w,y=(theta-arc)/h;
          const edge=1+.18*Math.sin(x*4+y*5)+.11*Math.cos(x*7-y*4);
          const spot=x*x+y*y;
          if(spot<edge){color.copy(spot<edge*.81?black:ashen);break}
        }
      });
    }
    function deer(g,rig,attachLeg,variant){
      const forest=variant==="forest_deer",gazelle=variant==="savanna_gazelle";
      const coat=forest?0x965b3d:gazelle?0xb58455:0xa2724d,belly=gazelle?0xe6cfaa:0xd6b892;
      const dark=gazelle?0x59413c:0x62433c,antler=gazelle?0x594944:0xc8ad89;
      const body=hinge(g,0,.77,.035);rig.body=body;
      const torso=[[-.67,.045,.062,.104],[-.56,.060,.153,.185],[-.42,.045,.226,.273],
        [-.21,.010,.222,.255],[.02,-.018,.188,.212],[.23,-.029,.204,.196],[.44,.015,.227,.239],
        [.61,.033,.147,.173],[.69,.050,.039,.061]];
      const stripe=new T.Color(dark);
      contour(body,gazelle?torso.map(([z,y,w,h])=>[z*1.03,y,w*.93,h*.91]):torso,[coat,belly],"",32,torsoShape,(color,z,a)=>{
        if(gazelle&&z>-.54&&z<.56){
          const width=.21+Math.cos(z*4)*.052,band=Math.abs(Math.cos(a)+.23-Math.sin(z*6)*.035);
          if(band<width)color.lerp(stripe,Math.min(.97,(width-band)*5.6));
        }
        if(z<-.28)color.multiplyScalar(.89+.085*Math.cos(a));
      });
      const fawn=hinge(body,0,0,0);rig.youngFeatures=[fawn];
      for(const side of [-1,1]){
        for(let i=0;i<7;i++){
          const z=-.25+(i%4)*.18,height=.057+Math.floor(i/4)*.083;
          const x=side*(.207-(height-.05)*.21+(i%4===0?.005:0));
          part(fawn,"oval",0xecd2a6,[x,height,z],[.020,.025-i%2*.004,.035-i%3*.004],[0,0,side*.17]);
        }
        for(const front of [true,false]){
          const z=front?-.386:.435,hipY=.63,total=.61,leg=attachLeg(g,rig,side*.163,z,hipY,total,.119,material(coat),material(dark),
            (side>0)===front?Math.PI:0)||rig.legs.at(-1);
          const lower=leg.userData.lower;
          const upperMesh=leg.children.find(n=>n.isMesh);
          if(upperMesh)leg.remove(upperMesh);
          for(const mesh of [...lower.children])if(mesh.isMesh)lower.remove(mesh);
          taper(leg,[[0,.20,front?.042:.036,.100,.113],[0,.076,0,.086,.085],[0,-.105,front?.004:.070,.059,.055],
            [0,-.252,0,.034,.038]],[coat,dark]);
          taper(lower,[[0,.038,0,.039,.043],[0,-.074,.025,.035,.033],[0,-.222,.004,.026,.033],[0,-.319,-.015,.030,.034]],
            [dark,coat]);
          for(const toe of [-1,1])part(lower,"chamfer",0x372b2b,[toe*.021,-.344,-.034],[.036,.067,.082]);
        }
      }
      fawn.visible=forest;
      const tail=hinge(g,0,.821,.648);rig.tails.push(tail);
      taper(tail,[[0,0,-.043,.069,.075],[0,.031,.054,.079,.067],[0,-.022,.139,.063,.044],[0,-.047,.187,.008]],
        [belly,coat]);
      taper(g,[[0,.762,-.403,.182,.193],[0,.903,-.52,.159,.159],[0,1.058,-.634,.128,.128],
        [0,1.239,-.706,.101,.115],[0,1.317,-.729,.098,.102]],[coat,belly],12);
      const head=hinge(g,0,1.283,-.72);rig.head=head;
      contour(head,[[-.311,-.089,.063,.039],[-.258,-.074,.087,.064],[-.169,-.020,.106,.098],[-.079,.012,.134,.124],
        [.061,.023,.136,.119],[.157,-.015,.095,.088],[.208,-.045,.038,.046]],[coat,belly],"",24,null,(color,z,a)=>{
          if(gazelle&&z>-.297&&z<.035&&Math.abs(Math.cos(a)-.16)<.23)color.lerp(stripe,.76);
        });
      part(head,"oval",dark,[0,-.075,-.298],[.067,.039,.039]);
      part(head,"oval",belly,[0,-.123,-.218],[.089,.029,.087]);
      for(const side of [-1,1]){
        const ear=hinge(head,side*.097,.076,.069);
        const earPath=[[0,0,.028],[side*.19,.126,.066],[side*.106,-.015,.101]];
        fin(ear,coat,earPath,.059);
        fin(ear,0xa97568,[[side*.027,-.003,.013],[side*.162,.105,.052],[side*.095,-.004,.078]],.016);
        const ocular=hinge(head,side*.090,.031,-.149);(rig.youngEyes??=[]).push(ocular);
        part(ocular,"oval",dark,[side*.011,0,0],[.045,.031,.028],[0,side*-.6,0]);
        part(ocular,"oval",0x3b272a,[side*.019,0,-.017],[.024,.022,.015]);
        part(ocular,"oval",0xffebcc,[side*.024,.008,-.028],[.006,.006,.004]);
        const horn=hinge(head,side*.076,.105,.035);(rig.horns??=[]).push(horn);
        const h=forest?1.19:1;
        const path=gazelle?[[0,-.018,0,.038],[side*.026,.066,.021,.040],[side*.051,.143,.061,.033],
          [side*.069,.212,.094,.034],[side*.083,.287,.122,.026],[side*.082,.36,.131,.024],
          [side*.071,.425,.115,.014],[side*.066,.488,.093,.003]]:
          [[0,0,0,.035],[side*.038,.122*h,.012,.034],[side*.067,.258*h,.071,.027],
          [side*.082,.385*h,.13,.018],[side*.081,.486*h,.175,.004]];
        taper(horn,path,[antler,gazelle?0x8c7363:0xead2a7],gazelle?10:8);
        if(!gazelle)for(const [start,i] of [[path[2],0],[path[3],1]]){
          const [x,y,z,r]=start;
          taper(horn,[[x,y,z,r*.86],[x+side*.065,y+.066,z-.048,r*.68],[x+side*.094,y+.148,z-.094,.003]],[antler,0xead2a7]);
        }
      }
    }
    function lionMane(body,rig){
      const mane=hinge(body,0,.125,-.54);rig.mane=mane;
      const collar=[[-.333,.007,.157,.218],[-.264,.021,.278,.302],[-.15,.037,.321,.367],
        [-.008,.031,.357,.386],[.133,.016,.307,.309],[.256,-.04,.167,.166],[.302,-.06,.055,.071]];
      const fringe=([z,y,rx,ry],a)=>{
        const split=1+.062*Math.cos(a*9+z*9)+.032*Math.sin(a*13-z*7);
        return [Math.sin(a)*rx*split,y+Math.cos(a)*ry*split,z];
      };
      const lit=new T.Color(0xb98045),deep=new T.Color(0x654137);
      contour(mane,collar,[0x8a5738,0x75402d],"",35,fringe,(color,z,a)=>{
        color.lerp(lit,Math.max(0,Math.cos(a))*.56).lerp(deep,Math.max(0,-Math.cos(a))*.49);
      });
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6,s=Math.sin(a),c=Math.cos(a),z=i%2?-.13:-.018;
        taper(mane,[[s*.223,c*.241,z-.15,.057,.075],[s*.304,c*.311,z-.028,.071,.089],
          [s*.321,c*.377-(c<0?.046:0),z+.122,.027,.043],[s*.27,c*.41-(c<0?.063:0),z+.16,.006,.005]],
          [i%3===0?0x7c4732:0x945b36,i%2?0xb87e41:0x9d6940],6);
      }
    }
    function regional(id,def,g,rig,attachLeg,seed){
      const feline=def.shape==="cat",bear=def.shape==="bear",bison=id==="bison",canine=def.shape==="dog";
      const fox=id==="fennec"||id==="rime_fox",badger=id==="badger",longBear=id==="polar_bear";
      const [coat,trim]=id==="cat"&&seed>.57?[0x676873,0xe3d9cb]:id==="dog"&&seed>.56?[0x614d40,0xc6ae91]:[def.coat,def.trim];
      const dark=pigment(coat,false),noseColor=0x282630;
      const [bodyY,length,width,height,hip,neckZ,headY,hx,hy,hz]=forms[id];
      const legLength=(hip-.035)/.96;
      const body=hinge(g,0,bodyY,.05);rig.body=body;
      const sections=torsoSections(id,length,width,height);
      const shoulder=new T.Color(dark),throat=new T.Color(trim);
      contour(body,sections,[coat,trim],"",28,torsoShape,(color,z,a)=>{
        const c=Math.cos(a),front=Math.max(0,(-z/length+.20)*.82);
        if(bison)color.lerp(shoulder,Math.min(1,front*(.98+c*.27)));
        if(id==="brown_bear"||id==="wolf")color.lerp(shoulder,front*Math.max(0,c+.1)*.43);
        if(fox&&c<.08)color.lerp(throat,Math.min(.85,(.09-c)*.85));
        const texture=(.50+.50*Math.sin(a*(bear||bison?15:11)+z*(fox?32:24)))**3;
        color.multiplyScalar(.90+texture*(bear||fox||bison?.19:.12)+.05*Math.cos(z*18+a*4));
      });
      coatDetails(body,sections,id,def.pattern,coat);
      if(bison)for(const side of [-1,1])for(let i=0;i<3;i++){
        part(body,"shard",i%2?coat:dark,[side*(.27-i*.032),-.19-i*.071,-.62+i*.095],[.126,.147,.184],[.23,side*.34,side*.20]);
      }
      if(bear)for(const side of [-1,1]){
        const wool=id==="brown_bear",black=id==="black_bear";
        taper(body,[[side*width*.45,-height*.22,-length*.78,.062],
          [side*width*.74,height*.25,-length*.65,.091],
          [side*width*.80,height*.51,-length*.43,.079],
          [side*width*.67,height*.48,-length*.22,.024]],
          [wool?dark:coat,black?dark:trim],9,[0,1,0]);
        if(wool)for(let i=0;i<4;i++){
          const z=-length*.79+i*.109,y=-height*(.24+i*.10),x=side*width*(.66+i*.041);
          fanFin(body,[x*.66,y+.116,z],[[x,y+.101,z-.081],[x*1.22,y-.062,z+.02],
            [x*.97,y-.133,z+.123],[x*.78,y-.084,z+.115]],[dark,coat],.028);
        }
      }
      if(id==="lion")lionMane(body,rig);
      const head=hinge(g,0,headY,-neckZ);rig.head=head;
      const heavy=bison||bear||id==="wolf",neckWidth=hx*(bison?1.11:heavy?1.02:.89);
      taper(g,[[0,headY-hy*.76,-neckZ+hz*1.48,hy*.90,neckWidth],[0,headY-hy*.47,-neckZ+hz*.98,hy*.91,neckWidth*.94],
        [0,headY-hy*.21,-neckZ+hz*.49,hy*.72,neckWidth*.77],[0,headY+hy*.03,-neckZ+hz*.18,hy*.53,neckWidth*.51]],
        [bison?dark:coat,bear?coat:trim],12);
      const muzzle=longBear?.335:bear?(id==="black_bear"?.235:.22):canine?.235:bison?.20:.132;
      const forehead=bison?1.24:badger?.81:1;
      const skull=[[ -hz-muzzle*.80,-hy*.37,hx*.37,hy*.25],[-hz-muzzle*.30,-hy*.25,hx*.57,hy*.43],
        [-hz*.90,-hy*.10,hx*.74,hy*.71],[-hz*.53,.016,hx*.98,hy*.93*forehead],
        [-hz*.08,.026,hx,hy*forehead],[hz*.47,.019,hx*.86,hy*.78],[hz*.72,.005,hx*.50,hy*.48]];
      contour(head,skull,[badger?trim:coat,trim],"",16);
      const jawY=-hy*.40,snoutZ=-hz-muzzle*.67,noseZ=-hz-muzzle*.90;
      part(head,"oval",trim,[0,jawY,snoutZ],[hx*.62,hy*.37,muzzle*.46]);
      part(head,"chamfer",noseColor,[0,-hy*.21,noseZ],[hx*(bear?.54:.47),hy*.37,muzzle*.36]);
      part(head,"oval",dark,[0,-hy*.57,snoutZ-.01],[hx*.42,hy*.08,muzzle*.28]);
      if(bison){
        part(head,"oval",dark,[0,.15,-.053],[hx*1.02,hy*.59,hz*.82],[.20,0,0]);
        part(head,"shard",dark,[0,-.21,-.19],[.129,.206,.143],[.37,0,0]);
      }
      if(bear){
        const lower=[[-hz-muzzle*.88,-hy*.34,hx*.27,hy*.16],[-hz-muzzle*.59,-hy*.41,hx*.54,hy*.24],
          [-hz-muzzle*.13,-hy*.43,hx*.69,hy*.37],[-hz*.61,-hy*.36,hx*.59,hy*.31]];
        contour(head,lower,[longBear?0xd6cfc4:trim,trim],"",14);
        for(const side of [-1,1])taper(head,[[side*hx*.42,-hy*.38,-hz-muzzle*.81,.006],
          [side*hx*.61,-hy*.44,-hz-muzzle*.49,.010],[side*hx*.72,-hy*.49,-hz-muzzle*.18,.004]],[dark,coat],5);
      }
      for(const side of [-1,1]){
        if(bison){
          const root=[side*.213,.133,-.048],bend=[side*.334,.168,-.027],tip=[side*.398,.304,-.04];
          const horn=hinge(head,...root);
          (rig.horns??=[]).push(horn);
          const local=p=>p.map((v,k)=>v-root[k]);
          link(horn,0x8e765e,[0,0,0],local(bend),.057);
          link(horn,0xe3d0aa,local(bend),local(tip),.039);
          part(horn,"spike",0xece0bc,local([side*.400,.313,-.04]),[.032,.089,.032],[.04,0,side*-.21]);
          part(head,"oval",dark,[side*.253,.076,.059],[.105,.062,.079],[0,.2,side*.27]);
        }else if(fox||(!bear&&id!=="lion")){
          const baseX=side*hx*.63,earY=hy*.68,earH=id==="fennec"?.329:id==="rime_fox"?.22:id==="lynx"?.169:.146;
          const sideZ=hz*.19,rootA=[baseX-side*hx*.40,earY-.045,sideZ],rootB=[baseX+side*hx*.43,earY-.025,sideZ];
          const peak=[baseX+side*earH*.35,earY+earH,sideZ+.028];
          fin(head,fox?coat:dark,[rootA,peak,rootB],fox?.055:.05);
          fin(head,fox?0xc18d86:trim,[[baseX-side*hx*.24,earY,sideZ-.028],
            [peak[0]-side*.007,peak[1]-.042,peak[2]-.029],[baseX+side*hx*.29,earY+.01,sideZ-.028]],.009);
          if(id==="lynx")link(head,dark,[peak[0],peak[1]-.018,peak[2]],[peak[0]+side*.028,peak[1]+.086,peak[2]+.012],.016);
        }else{
          const x=side*hx*.73,y=hy*.78,r=id==="black_bear"?.104:badger?.067:longBear?.068:.086;
          part(head,"oval",dark,[x,y,.050],[r,r*(id==="black_bear"?1.17:.93),.081],[0,0,side*.24]);
          part(head,"oval",trim,[x,y+.004,-.013],[r*.56,r*.56,.026],[0,0,side*.23]);
        }
        const x=side*hx*.66,y=hy*.245,z=-hz*.78;
        if(bear&&!badger){
          part(head,"oval",dark,[side*hx*.65,hy*.48,-hz*.69],[hx*.33,hy*.17,hz*.25],[0,side*.39,side*.13]);
          part(head,"oval",trim,[side*hx*.40,-hy*.39,-hz-muzzle*.47],[hx*.54,hy*.32,muzzle*.53]);
        }
        if(badger)part(head,"oval",0x292932,[side*hx*.64,hy*.41,z-.002],[.072,.084,.078],[.41,side*.42,side*.25]);
        const eyeball=hinge(head,x,y,z);
        (rig.youngEyes??=[]).push(eyeball);
        part(eyeball,"oval",dark,[0,0,0],[hx*.248,.032,.035],[0,side*.31,side*.16]);
        part(eyeball,"oval",feline?0xc79442:0x674b39,[0,0,-.023],[hx*.162,.023,.017]);
        part(eyeball,"oval",noseColor,[side*.002,0,-.036],[feline?.010:.016,.018,.009]);
        part(eyeball,"oval",0xffeed4,[side*.008,.009,-.044],[.007,.006,.004]);
        if(feline||fox||badger){
          part(head,"oval",trim,[side*hx*.53,jawY,snoutZ],[hx*.528,hy*.36,muzzle*.50],[0,side*.25,0]);
          for(let i=0;i<3;i++){
            const from=[side*hx*(.52+i*.14),jawY+.012*(i%2),snoutZ-.031+i*.006];
            part(head,"oval",dark,from,[.009,.007,.008]);
            if(feline||fox)link(head,id==="lion"?0xe4bc8a:trim,from,
              [side*(hx+.082+i*.014),jawY+(.023-i*.033),snoutZ+.060],.0023).castShadow=false;
          }
          if(id==="lynx")for(let i=0;i<3;i++)part(head,"shard",i%2?trim:coat,
            [side*(hx*.80+i*.023),-.031-i*.040,-hz*.41],[.07,.063,.095],[.45,side*.25,side*.53]);
        }
        if(id==="tiger"||id==="jaguar")for(let i=0;i<3;i++){
          const yy=.087+i*.023,zz=-hz*.45+i*.051;
          link(head,id==="tiger"?0x382927:0x593521,
            [side*hx*(.83-i*.04),yy,zz],[side*hx*(.48-i*.06),yy+.050,zz-.028],.011).castShadow=false;
        }
        for(const front of [true,false]){
          const zLeg=(front?-.56:.64)*length,upperSize=width*(bison?(front?.68:.54):bear?.73:fox?.59:.67);
          attachLeg(g,rig,side*width*.70,zLeg,hip,legLength,upperSize,material(coat),material(dark),
            (side>0)===front?0:Math.PI);
          const leg=rig.legs.at(-1);
          const foot=leg.userData.lower;
          const endY=-legLength*.56,padZ=-upperSize*.37;
          const kneeY=foot.position.y,kneeZ=upperSize*(front?.04:.23);
          const shinWidth=upperSize*(bison?.32:bear?.36:.32),kneeDepth=upperSize*(front?.43:.46);
          const legCoat=[bison&&front?dark:coat,pigment(coat,true)];
          foot.position.z=kneeZ;
          leg.remove(...leg.children.filter(node=>node.isMesh));
          foot.remove(...foot.children.filter(node=>node.isMesh));
          taper(leg,[[-side*upperSize*.20,upperSize*.79,front?-.048:.025,upperSize*(front?.64:.78),upperSize*.58],
            [-side*upperSize*.11,upperSize*.25,front?-.025:.004,upperSize*(front?.69:.84),upperSize*.57],
            [0,kneeY*.46,kneeZ*.39,upperSize*(front?.52:.62),upperSize*.42],
            [0,kneeY-shinWidth*.13,kneeZ,kneeDepth,shinWidth*1.07]],legCoat);
          taper(foot,[[0,shinWidth*.38,0,kneeDepth*.90,shinWidth],
            [0,-legLength*.16,0,kneeDepth*.79,shinWidth*.96],
            [0,endY*.70,padZ*.38,shinWidth*.91,shinWidth*.79],
            [0,endY+.015,padZ*.78,shinWidth*.96,shinWidth*.96]],[coat,pigment(coat,true)]);
          if(bison){
            for(const toe of [-1,1])part(foot,"chamfer",noseColor,[toe*upperSize*.31,endY-.025,padZ],
              [upperSize*.51,.091,upperSize*.80]);
          }else{
            part(foot,"oval",fox?dark:coat,[0,endY,padZ],[upperSize*(bear?.78:.68),bear?.072:.061,upperSize*(longBear?1.03:.87)]);
            for(let j=-1;j<=1;j++){
              const xToe=j*upperSize*.314;
              part(foot,"oval",bear?dark:coat,[xToe,endY-.015,padZ-upperSize*.49],[upperSize*.25,.039,upperSize*.34]);
              if(bear)taper(foot,[[xToe,endY-.004,padZ-upperSize*.63,.015],[xToe,endY-.011,padZ-upperSize*.79,.012],
                [xToe,endY-.028,padZ-upperSize*.99,.002]],[longBear?0x6d6565:trim,0xb5aaa0],6);
              if(canine||feline)part(foot,"oval",dark,[xToe,endY-.029,padZ-upperSize*.66],[upperSize*.091,.012,upperSize*.13]);
            }
          }
        }
      }
      const tail=hinge(g,0,bodyY+height*.15,length*.88+.05);rig.tails.push(tail);
      if(fox){
        const brush=[[-.055,.02,.08,.08],[.02,.035,.12,.12],[.25,.055,.138,.136],[.44,.010,.115,.103],
          [.62,-.041,.087,.082],[.73,-.053,.042,.044],[.79,-.055,.010,.013]];
        contour(tail,brush,[coat,trim]);
        contour(tail,brush.slice(4).map(([z,y,x,h])=>[z-.001,y,x*1.02,h*1.02]),[id==="rime_fox"?0xf5eee2:0x564456,trim]);
      }else if(bear||id==="lynx"){
        part(tail,"oval",coat,[0,-.034,.077],[.087,.080,id==="lynx"?.184:.133],[-.26,0,0]);
        if(id==="lynx")part(tail,"oval",dark,[0,-.065,.200],[.072,.058,.076],[-.22,0,0]);
      }else{
        const size=bison?.45:id==="lion"?.85:feline?.72:.58;
        const path=[[0,.019,0],[.033,bison?-.15:.031,size*.38],[.093,bison?-.30:.095,size*.72],
          [.132,bison?-.40:.128,size*.93],[.169,bison?-.41:.158,size]];
        for(let i=1;i<path.length;i++){
          const radius=(bison?.053:.071)*(1-i*.14);
          link(tail,id==="tiger"&&i%2===0?dark:coat,path[i-1],path[i],radius);
          part(tail,"oval",coat,path[i],[radius,radius,radius]);
        }
        if(id==="lion"||bison||canine)part(tail,"shard",dark,path.at(-1),[.096,.095,.124],[.2,.28,0]);
      }
      g.scale.setScalar(def.scale);
    }
    function livingTree(data,g,rig){
      const {bark,inner,leaves,lit,aspect}=data,deep=pigment(bark,false);
      const elder=aspect==="elder",moss=aspect==="moss",lichen=new T.Color(moss?0x769b62:0xc29a75);
      const grain=(c,a,row)=>{
        const groove=(.5+.5*Math.sin(a*9+(row%4)*.53))**5;
        c.multiplyScalar(.81+groove*.32+Math.cos(a*4+row*.2)*.067);
        if(moss&&Math.sin(a*5+row*.7)>.55)c.lerp(lichen,.30);
      };
      const trunk=hinge(g,0,0,0);rig.body=trunk;
      const crown=hinge(trunk,0,5.65,.042);rig.crown=crown;rig.vines=[];
      const canopy=hinge(crown,0,-5.65,-.042);
      taper(trunk,[[0,2.45,.06,.77,.83],[.025,3.01,.16,.93,1.05],[.09,3.55,.16,.99,1.02],
        [-.045,3.94,.07,.78,elder?.73:.91],[.062,4.51,.07,.85,elder?.88:1.14],
        [0,5.1,.05,.73,elder?.99:1.24],[.08,5.57,.09,.54,.90],[.07,6.09,.18,.41,.62]],[bark,inner],23,[1,0,0],grain);
      for(const side of [-1,1]){
        for(let i=0;i<5;i++){
          const x=side*(.12+i*.17),y=3.05+i*.34,z=-.67+Math.abs(x)*.23;
          taper(trunk,[[x*.62,y-.48,z+.12,.015],[x,y-.15,z,.084],[x+side*.19,y+.51,z-.01,.088],
            [x+side*.22,y+1.06,z+.14,.012]],[deep,inner],6);
        }
        const branchBase=side*(elder?.242:.415);
        taper(trunk,[[branchBase,2.78,-.437,.133],[branchBase+side*.23,3.54,-.662,.155],
          [branchBase+side*.13,4.39,-.694,.104],[branchBase+side*.37,4.86,-.388,.031]],[deep,inner],10,[1,0,0],grain);
        const leg=hinge(g,side*.64,3.02,.13);rig.legs.push(leg);
        taper(leg,[[0,.26,.05,.59,.52],[side*.12,-.46,.06,.51,.47],[side*.16,-1.24,.31,.27,.31],
          [side*.12,-1.45,.36,.24,.25]],[bark,inner],12,[1,0,0],grain);
        const shin=hinge(leg,side*.12,-1.32,.32);leg.userData.lower=shin;
        taper(shin,[[0,.18,0,.29,.30],[side*.12,-.38,-.10,.30,.25],[side*.18,-1.25,-.21,.33,.28],
          [side*.21,-1.58,-.33,.43,.39]],[bark,inner],12,[1,0,0],grain);
        for(let claw=-1;claw<=1;claw++){
          taper(shin,[[side*.16+claw*.18,-1.46,-.36,.18],[side*.20+claw*.28,-1.56,-.75,.166],
            [side*.24+claw*.34,-1.63,-1.09,.04]],[deep,inner],7);
        }
        const arm=hinge(g,side*1.02,5.02,.03);arm.userData.side=side;rig.arms.push(arm);
        taper(arm,[[-side*.22,.30,.07,.43,.55],[side*.22,-.19,.01,.51,.53],
          [side*.51,-.80,.08,.38,.35],[side*.65,-1.39,.15,.26,.28]],[bark,inner],14,[1,0,0],grain);
        const hand=hinge(arm,side*.63,-1.29,.14);arm.userData.lower=hand;
        taper(hand,[[0,.17,.05,.29],[side*.08,-.33,-.03,.35],[side*.19,-.97,-.38,.32],
          [side*.23,-1.20,-.52,.36]],[bark,inner],9);
        for(let j=-1;j<=1;j++){
          taper(hand,[[side*.22+j*.16,-1.09,-.47,.126],[side*.25+j*.21,-1.38,-.66,.113],
            [side*.26+j*.22,-1.48,-.94,.028]],[deep,inner],6);
        }
        taper(hand,[[side*.043,-.98,-.403,.165],[side*-.137,-1.088,-.559,.118],
          [side*-.202,-1.173,-.738,.037]],[bark,inner],7);
        part(hand,"shard",leaves,[side*.17,-.51,-.25],[.43,.55,.30],[.30,0,side*.19]);
        taper(arm,[[side*.17,.08,-.004,.24],[side*.34,.36,-.019,.20],[side*.59,.61,.10,.11],
          [side*.70,.78,.23,.02]],[bark,inner],9,[0,0,1],grain);
        part(trunk,"shard",leaves,[side*.91,4.88,.06],[.70,.34,.58],[.36,side*.20,0]);
        for(let i=0;i<4;i++){
          const a=[side*(.82+i*.13),4.84+i*.14,.19-i*.13];
          fin(trunk,i%2?leaves:pigment(leaves,true),[a,[a[0]+side*.38,a[1]+.38,a[2]+.03],[a[0]+side*.21,a[1]+.04,a[2]-.41]],.078);
        }
        if(moss){
          taper(arm,[[side*.49,.08,-.20,.06],[side*.62,-.34,-.29,.052],[side*.79,-.83,-.16,.027],
            [side*.84,-1.13,-.09,.009]],[leaves,0x9bba72],7);
        }
      }
      const head=hinge(g,0,5.31,-.33);rig.head=head;
      taper(head,[[0,-.28,-.005,.38,.41],[0,.04,-.11,.58,.51],[0,.36,-.08,.70,.59],
        [0,.61,-.06,.68,.65],[0,.96,.04,.49,.49]],[bark,inner],16,[1,0,0],grain);
      taper(head,[[0,.448,-.562,.115],[0,.285,-.692,.132],[.032,.172,-.786,.096],
        [.029,.113,-.701,.038]],[bark,inner],9,[1,0,0],grain);
      taper(head,[[ -.301,-.023,-.584,.034],[-.17,-.058,-.641,.056],[0,-.077,-.662,.065],
        [.17,-.033,-.645,.047],[.331,-.002,-.579,.021]],[deep,0x33252c],7,[0,1,0]);
      for(const side of [-1,1]){
        const eye=hinge(head,side*.32,.41,-.59);eye.userData.entityEye=true;
        part(eye,"oval",deep,[0,0,0],[.25,.143,.11],[0,side*.12,side*.19]);
        part(eye,"oval",lit,[0,0,-.081],[.155,.064,.047],[0,side*.15,side*.18],true);
        part(eye,"oval",0x293733,[side*.012,.002,-.124],[.027,.043,.012],[0,0,side*.09]);
        taper(head,[[side*.16,.52,-.58,.084],[side*.36,.59,-.63,.126],
          [side*.60,.66,-.42,.055]],[deep,inner],7);
        taper(head,[[side*.54,.46,-.30,.112],[side*.48,.27,-.48,.117],[side*.40,.08,-.56,.091],
          [side*.28,-.11,-.51,.019]],[deep,inner],8);
        if(elder)for(let k=0;k<3;k++){
          const x=side*(.147+k*.077),length=.56-k*.09;
          taper(head,[[x,.002,-.533,.083],[x+side*.08,-length*.49,-.62,.067],
            [x+side*.11,-length,-.47,.016]],[inner,bark],7);
        }
      }
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4+(elder?.25:0),s=Math.sin(a),c=Math.cos(a),length=(i%2?1.39:1.80)+(moss?.12:elder?Math.sin(i*2.3)*.16:0);
        const curve=moss?-.27:elder?.13:0;
        taper(canopy,[[s*.24,5.27,c*.30,.27],[s*.57,6.17,c*.63,.27],
          [s*1.03,7.02+curve*.28,c*.96,.19],[s*length,7.47+(i%3)*.14+curve,c*length,.038]],[bark,inner],9,[0,0,1],grain);
        taper(canopy,[[s*.63,6.38,c*.62,.13],[s*1.41,6.79,c*1.01,.11],
          [s*1.88,6.95,c*1.33,.026]],[bark,inner],6);
        for(const [y,r,t] of [[7.51,length,0],[7.83,1.16,1],[8.12,.57,2]]){
          const h=y-.12+Math.sin(i*1.95)*.18+curve*(t===0?1:.19),shade=t===1?pigment(leaves,true):leaves;
          part(canopy,i%3===0?"chamfer":"shard",shade,[s*r,h,c*r],[1.01-t*.16,.62-t*.062,.90-t*.12],[.35,i*.54,.3]);
          if(t<2){
            const leaf=[s*(r+.21),h-.11,c*(r+.22)],tip=[s*(r+.91),h-.33-t*.14,c*(r+.83)];
            fanFin(canopy,leaf,[[tip[0]-c*.21,tip[1]+.14,tip[2]+s*.21],tip,
              [tip[0]+c*.28,tip[1]+.17,tip[2]-s*.28]],[shade,pigment(shade,true)],.039);
          }
          if(elder&&i%2===0){
            const fruit=[s*(r+.26),h-.34,c*(r+.24)];
            link(canopy,bark,[fruit[0]-s*.064,fruit[1]+.24,fruit[2]-c*.064],fruit,.026);
            part(canopy,"shard",lit,fruit,[.12,.16,.101],[0,0,a],true);
          }
        }
        if(moss&&i%2===0){
          const vine=hinge(canopy,s*length,7.30,c*length);rig.vines.push(vine);
          taper(vine,[[0,0,0,.088],[s*.20,-.33,c*.15,.073],
            [s*.31,-.74,c*.20,.051],[s*.11,-1.16,c*.16,.015]],[leaves,0xaac17d],7,[0,0,1]);
        }
      }
      const saddle=hinge(trunk,0,5.50,-.02);rig.saddle=saddle;
      saddle.visible=false;
      part(saddle,"chamfer",0x624638,[0,.04,0],[.74,.21,.61]);
      for(const side of [-1,1]){
        link(saddle,0xab9366,[side*.36,-.11,-.46],[side*.45,-1.20,.22],.046);
        link(saddle,0xb8a071,[side*.40,.17,-.34],[side*.40,.16,.34],.052);
      }
    }
    function siteWarden(data,g,rig,attachLeg){
      const {color,secondary,aspect}=data,dune=aspect==="dune",lab=aspect==="lab",basalt=aspect==="basalt";
      const metal=lab?0x35434e:dune?0x6e5746:0x34323e,edge=pigment(color,true),metalLit=lab?0xb4835d:dune?0xc8a35d:0x77636a;
      rig.body=hinge(g,0,1.08,0);
      taper(rig.body,[[0,-.39,0,.19,.24],[0,-.26,.023,.27,.33],[0,-.078,.05,.313,.38],
        [0,.11,0,.34,.43],[0,.286,.036,.272,.35],[0,.348,.031,.19,.245]],[color,edge],12,[1,0,0],
        (c,a,row)=>c.multiplyScalar(.90+(row+a*3)%3*.069));
      part(rig.body,"chamfer",metal,[0,.035,-.278],[.39,.43,.231],[0,.1,0]);
      meshWardenCore();
      for(const side of [-1,1])for(let i=0;i<3;i++){
        const x=side*(.209+i*.061),y=.165-i*.133;
        part(rig.body,dune?"chamfer":"shard",i===1?edge:color,[x,y,-.205+Math.abs(x)*.10],[.21,.125,.22],[.13,side*.36,side*-.17]);
        if(lab)link(rig.body,metalLit,[x*.86,y-.01,-.29],[x*1.14,y+.026,-.256],.013);
        if(basalt)taper(rig.body,[[x*.87,y+.055,-.291,.014],[x*1.01,y+.009,-.302,.013],[x*.96,y-.035,-.289,.006]],[secondary,0xa44948],5);
      }
      for(const side of [-1,1])part(rig.body,"chamfer",metal,[side*.214,-.324,0],[.25,.17,.37],[.13,0,side*.24]);
      if(lab)for(const side of [-1,1]){
        const hose=[[side*.19,.203,.201],[side*.292,.172,.308],[side*.30,-.048,.341],[side*.215,-.239,.236]];
        taper(rig.body,hose.map((node,i)=>[...node,.038-i*.002]),[metal,metalLit],9);
        part(rig.body,"disk",metalLit,[side*.215,-.239,.236],[.064,.044,.069],[Math.PI/2,0,0]);
      }
      const head=hinge(g,0,1.64,-.025);rig.head=head;
      taper(head,[[0,-.232,0,.155,.166],[0,-.16,-.030,.198,.219],[0,-.04,-.013,.236,.267],
        [0,.103,.011,.221,.261],[0,.204,.038,.166,.192],[0,.255,.079,.117,.13]],[color,edge],dune?8:12,[1,0,0]);
      part(head,"chamfer",metal,[0,.029,-.225],[.48,.176,.153],[0,0,0]);
      part(head,"chamfer",metalLit,[0,.057,-.274],[.371,.095,.052],[0,0,0]);
      part(head,"chamfer",metal,[0,-.136,-.159],[.30,.112,.158],[.12,0,0]);
      for(const side of [-1,1]){
        part(head,"oval",secondary,[side*.109,.051,-.315],[.058,.026,.035],[0,side*.12,side*.16],true);
        if(basalt){
          taper(head,[[side*.199,.025,.040,.075],[side*.236,.139,.079,.061],[side*.269,.261,.115,.045],[side*.292,.315,.154,.011]],[metal,color],7);
          fanFin(rig.body,[side*.232,.179,.033],[[side*.32,.239,.078],[side*.414,.345,.167],
            [side*.41,.153,.246],[side*.24,.075,.205]],[metal,edge],.050);
        }else if(dune){
          part(head,"chamfer",edge,[side*.21,.141,.031],[.138,.31,.179],[.091,side*.18,side*.17]);
          fin(head,0x567075,[[side*.257,.128,-.053],[side*.309,-.168,-.054],[side*.172,-.155,-.154]],.045);
          for(let i=0;i<3;i++){
            const x=side*(.172+i*.039),yy=.187-i*.035;
            link(rig.body,0x6d938f,[x,yy,-.349],[x+side*.045,yy-.016,-.324],.010);
          }
        }else{
          part(head,"disk",metalLit,[side*.236,.022,.018],[.084,.068,.084],[0,0,Math.PI/2]);
          link(head,metalLit,[side*.205,.081,.071],[side*.217,.207,.145],.027);
        }
        const arm=hinge(g,side*.42,1.22,0);arm.userData.side=side;rig.arms.push(arm);
        taper(arm,[[0,.124,.026,.147],[side*.027,-.009,.008,.152],[side*.073,-.22,.061,.103],[side*.11,-.43,.016,.086]],
          [metal,color],9);
        part(arm,basalt?"shard":"chamfer",color,[side*.065,-.033,-.003],[.28,.28,.284],[0,side*.29,side*.25]);
        part(arm,"chamfer",edge,[side*.12,-.113,-.182],[.168,.190,.126],[.19,0,side*.16]);
        const wrist=hinge(arm,side*.11,-.38,0);arm.userData.lower=wrist;
        taper(wrist,[[0,.045,.012,.107],[0,-.104,.023,.102],[side*.028,-.219,-.019,.133],[0,-.331,-.026,.086]],[color,edge],8);
        part(wrist,"chamfer",metal,[0,-.339,-.041],[.199,.192,.185],[.19,0,0]);
        if(dune)part(wrist,"chamfer",metalLit,[side*.142,-.182,-.029],[.102,.226,.177],[.25,0,0]);
        else part(wrist,"diamond",secondary,[0,-.189,-.126],[.049,.082,.036],[0,0,.22],true);
        const leg=attachLeg(g,rig,side*.23,.025,.71,.72,.27,material(color),material(metal),side>0?Math.PI:0)||rig.legs.at(-1);
        const lower=leg.userData.lower;
        const thigh=leg.children.find(node=>node.isMesh),[shin,boot]=lower.children.filter(node=>node.isMesh);
        if(thigh&&shin){thigh.geometry=geometry.chamfer;thigh.scale.multiplyScalar(.77);shin.geometry=geometry.chamfer;shin.scale.multiplyScalar(.84);}
        part(leg,"chamfer",edge,[0,-.071,-.065],[.184,.209,.167],[.21,0,0]);
        part(lower,"disk",metalLit,[0,-.014,-.056],[.093,.066,.087],[Math.PI/2,0,0]);
        part(lower,"chamfer",color,[0,-.288,-.078],[.16,.161,.142],[.12,0,0]);
        if(boot){boot.geometry=geometry.rounded;boot.scale.set(.259,.115,.341);boot.position.z=-.079;}
        part(lower,"chamfer",edge,[0,-.404,-.189],[.145,.061,.112],[.10,0,0]);
      }
      function meshWardenCore(){
        if(dune){
          part(rig.body,"diamond",0x71968c,[0,.033,-.405],[.19,.22,.058],[.03,0,Math.PI/4]);
          part(rig.body,"diamond",secondary,[0,.033,-.446],[.105,.133,.044],[.03,0,Math.PI/4],true);
        }else if(lab){
          part(rig.body,"disk",metalLit,[0,.049,-.405],[.134,.044,.134],[Math.PI/2,0,0]);
          part(rig.body,"disk",secondary,[0,.049,-.433],[.087,.039,.087],[Math.PI/2,0,0],true);
          for(const x of [-.085,0,.085])link(rig.body,metal,[x,-.102,-.392],[x,-.169,-.377],.014);
        }else{
          part(rig.body,"shard",secondary,[0,.058,-.402],[.143,.214,.119],[.03,0,.18],true);
          for(const side of [-1,1])part(rig.body,"chamfer",edge,[side*.118,.013,-.393],[.069,.195,.081],[0,0,side*.23]);
        }
      }
    }
    function dragon(data,g,rig,attachLeg){
      const {coat,back,belly,wing,horn,eye:iris,crest,form}=data;
      const ice=crest==="crystal",fire=crest==="ember",green=crest==="leaf",time=crest==="hourglass",earth=crest==="stone";
      rig.form=form;rig.frills=[];
      const {length,girth,neck,skull,span,chord,lift,tail:tailLength}=form;
      const body=hinge(g,0,.89,.02);rig.body=body;
      const hull=[[-.83,.07,.15,.20],[-.67,.105,.32,.327],[-.41,.09,.442,.405],
        [-.11,.058,.425,.393],[.19,-.005,.354,.301],[.49,-.012,.346,.267],
        [.72,.023,.270,.216],[.89,.052,.143,.129]];
      contour(body,hull.map(([z,y,w,h])=>[z*length,y,w*girth,h*(earth?1.07:ice?.91:1)]),[coat,belly],"",32,torsoShape,(color,z,a)=>{
        const scales=(Math.cos(z*32+Math.sin(a*11))*.5+.5)*(Math.cos(a*17+z*13)*.5+.5);
        color.multiplyScalar(.81+scales*.26+Math.sin(a)**2*.13);
      });
      const neckPoint=([x,y,z,r,d])=>[x,.98+(y-.98)*neck,-.58*length+(z+.58)*neck,r*girth,d*girth];
      taper(g,[[0,.98,-.58,.252,.246],[0,1.096,-.704,.220,.218],[0,1.27,-.852,.171,.183],
        [0,1.423,-.975,.141,.151],[0,1.548,-1.071,.137,.146],[0,1.587,-1.124,.132,.144]].map(neckPoint),[back,coat],15,
        [1,0,0],(color,a,r)=>color.multiplyScalar(.84+(Math.cos(a*5+r*.67)*.5+.5)*.25));
      const [hx,hy,hz]=neckPoint([0,1.58,-1.06,0,0]),head=hinge(g,hx,hy,hz);rig.head=head;head.scale.set(...skull);
      contour(head,[[-.57,-.058,.094,.064],[-.48,-.034,.179,.090],[-.33,.024,.179,.136],
        [-.18,.076,.241,.192],[-.025,.065,.229,.189],[.169,.027,.163,.135],[.226,.012,.071,.068]],
        [coat,belly],"",20,null,(color,z,a)=>{
          const facet=Math.sin(a*9+z*28);
          color.multiplyScalar(.88+Math.max(0,facet)*.17+.08*Math.cos(a));
        });
      const jaw=hinge(head,0,-.093,-.185);rig.jaw=jaw;
      contour(jaw,[[-.382,-.011,.087,.047],[-.31,-.035,.139,.053],[-.17,-.047,.153,.065],
        [-.020,-.031,.116,.061],[.064,-.013,.052,.041]],[belly,back],"",12);
      part(jaw,"oval",0x733a40,[0,-.007,-.245],[.103,.021,.116]);
      rig.nose=hinge(head,0,-.070,-.56);
      for(const side of [-1,1]){
        part(head,"oval",back,[side*.097,.020,-.509],[.048,.019,.052],[0,side*.18,-side*.17]);
        const eyeGroup=hinge(head,side*.187,.119,-.244);
        part(eyeGroup,"oval",back,[0,0,0],[.081,.057,.077],[0,side*.52,0]);
        part(eyeGroup,"oval",iris,[side*.016,0,-.026],[.061,.032,.056],[0,side*.58,0],true);
        part(eyeGroup,"oval",0x22222e,[side*.042,.001,-.045],[.020,.032,.017]);
        const brow=[[side*.125,.176,-.30],[side*.208,.177,-.217],[side*.238,.192,-.125],[side*.234,.149,-.07]];
        taper(head,brow.map((p,i)=>[...p,.047-i*.011]),[back,coat],7);
        for(let i=0;i<3;i++){
          const z=-.15+i*.084,x=side*(.204-i*.023),y=.011+i*.013;
          part(head,crest==="crystal"||crest==="stone"?"shard":"chamfer",i%2?back:coat,[x,y,z],
            [.053,.052,.093],[.11,side*.34,side*.15]);
        }
        const horns=ice?[[.128,.143,.040,.076],[.164,.35,.123,.071],[.25,.545,.151,.048],[.29,.668,.196,.003]]:
          fire?[[.127,.169,.047,.093],[.199,.211,.188,.077],[.268,.329,.344,.064],[.31,.474,.394,.042],[.29,.609,.296,.004]]:
          green?[[.137,.16,.032,.066],[.202,.329,.094,.055],[.302,.462,.178,.040],[.407,.543,.225,.029],[.463,.652,.208,.005]]:
          time?[[.138,.16,.036,.076],[.221,.249,.137,.064],[.328,.30,.255,.046],[.382,.35,.343,.029],[.402,.421,.375,.004]]:
          [[.148,.129,.045,.098],[.232,.193,.116,.086],[.328,.220,.160,.057],[.379,.264,.174,.006]];
        taper(head,horns.map(([x,y,z,r])=>[side*x,y,z,r]),[horn,pigment(horn,true)],ice?5:9,[0,0,1],
          (color,a,i)=>color.multiplyScalar(.79+(i%2)*.17+Math.abs(Math.sin(a*2))*.16));
        if(green){
          for(const [x,y,z,dx,dy] of [[.201,.324,.090,.016,.185],[.302,.462,.176,-.035,.187],[.399,.538,.219,.078,.094]]){
            taper(head,[[side*x,y,z,.035],[side*(x+dx*.51),y+dy*.57,z-.026,.022],[side*(x+dx),y+dy,z-.09,.003]],[horn,0xc9ae6d],7);
          }
          const frill=hinge(head,side*.154,.057,.042);frill.userData.side=side;rig.frills.push(frill);
          fanFin(frill,[0,0,0],[[side*.142,.035,.053],[side*.297,.046,.216],[side*.241,.154,.232],
            [side*.155,.249,.195],[side*.080,.172,.111],[side*.042,.021,.14]],[back,wing],.022);
          taper(frill,[[0,0,0,.016],[side*.124,.094,.12,.013],[side*.241,.087,.219,.004]],[back,0xa7b370],6);
        }else if(ice){
          for(let i=0;i<3;i++)part(head,"shard",i?horn:wing,[side*(.154+i*.031),.184+i*.054,.071+i*.073],
            [.082-i*.012,.143+i*.02,.147],[.32,side*.15,-side*(.38+i*.12)]);
        }else if(earth){
          for(let i=0;i<3;i++)part(head,"chamfer",i%2?horn:back,[side*(.158+i*.042),.137,.069+i*.045],
            [.127,.144-i*.020,.124],[.25,side*.16,-side*.13]);
          taper(jaw,[[side*.126,-.027,-.148,.037],[side*.164,.049,-.221,.028],[side*.184,.126,-.273,.003]],[horn,0xe1c79a],7);
        }else if(time){
          link(head,horn,[side*.118,.145,-.220],[side*.175,.152,-.112],.018);
          const ear=hinge(head,side*.146,.076,.03);ear.userData.side=side;rig.frills.push(ear);
          fanFin(ear,[0,0,0],[[side*.123,-.026,.054],[side*.278,.032,.241],[side*.209,.136,.337],
            [side*.093,.142,.229],[0,.051,.146]],[back,horn],.024);
        }else{
          const r=hinge(head,side*.15,.058,.038);r.userData.side=side;rig.frills.push(r);
          fanFin(r,[0,0,0],[[side*.137,-.012,.063],[side*.239,.004,.160],[side*.201,.091,.236],
            [side*.205,.177,.231],[side*.118,.128,.183],[0,.090,.143]],[back,wing],.034);
        }
        for(let i=0;i<4;i++){
          const x=side*(.112+i*.011),z=-.445+i*.076;
          part(head,"spike",0xffe8bd,[x,-.103,z],[.020,.098-i*.01,.021],[0,0,Math.PI]);
          part(jaw,"spike",0xe3caa4,[x*.88,-.006,z+.20],[.013,.056,.016]);
        }
        for(const front of [true,false]){
          const leg=attachLeg(g,rig,side*(front?.302:.283)*girth,(front?-.425:.53)*length,.708,.72,front?.19:.22,
            material(coat),material(back),(side>0)===front?0:Math.PI)||rig.legs.at(-1);
          leg.userData.front=front;
          const lower=leg.userData.lower;
          for(const n of [...leg.children])if(n.isMesh)leg.remove(n);
          for(const n of [...lower.children])if(n.isMesh)lower.remove(n);
          taper(leg,[[0,.20,front?.013:.072,.143],[0,.06,.022,.135],[0,-.139,front?-.019:.086,.101],[0,-.31,0,.065]]
            .map(([x,y,z,r])=>[x,y,z,r*girth]),[back,coat]);
          taper(lower,[[0,.055,0,.076],[0,-.107,.044,.067],[0,-.255,-.008,.051],[0,-.393,-.038,.066]]
            .map(([x,y,z,r])=>[x,y,z,r*girth]),[coat,back]);
          part(lower,"chamfer",coat,[0,-.389,-.089],[.128*girth,.071,.161]);
          for(const toe of [-1,0,1]){
            const x=toe*.052*girth;
            taper(lower,[[x,-.381,-.126,.021],[x,-.371,-.18,.018],[x+toe*.009,-.394,-.221,.003]],[horn,pigment(horn,true)],6);
          }
          if(earth||fire)part(leg,"shard",back,[side*.063,.093,.009],[.132*girth,.175,.155],[.3,side*.28,.07]);
        }
        const pivot=hinge(g,side*.30*girth,1.101,-.391*length);pivot.userData.side=side;rig.wings.push(pivot);
        const wingPoint=([x,y,z])=>[side*x*span,y*lift,z*chord];
        const a=[0,0,-.103],elbow=wingPoint([.69,.303,-.324]),wrist=wingPoint([1.30,.343,-.209]);
        const wingOutline=ice?[[2.64,.24,.086],[2.28,-.074,.87],[1.61,-.204,1.21],[.91,-.21,1.28],[.29,-.13,1.00]]:
          green?[[2.37,.123,.263],[2.19,-.058,.73],[1.63,-.17,1.15],[1.03,-.258,1.29],[.33,-.24,1.03]]:
          [[2.52,.145,.218],[2.18,-.078,.905],[1.60,-.19,1.27],[.91,-.22,1.339],[.28,-.19,1.064]];
        const tips=wingOutline.map(wingPoint),fold=hinge(pivot,...wrist);pivot.userData.tip=fold;
        const distal=hinge(fold,-wrist[0],-wrist[1],-wrist[2]);
        const root=[-side*.073,-.091,.481];
        taper(pivot,[[...a,.105],[...elbow,.086],[...wrist,.062]],[back,coat],9,[0,0,1]);
        part(pivot,"chamfer",coat,[-side*.022,.038,-.071],[.151,.124,.21],[.29,side*.22,0]);
        fin(pivot,wing,[a,elbow,root],.044);
        fin(pivot,wing,[elbow,wrist,root],.043);
        const sheen=pigment(wing,true);
        for(let i=0;i<tips.length;i++){
          const tip=tips[i],next=tips[i+1]??root;
          const mid=wrist.map((v,k)=>v+(tip[k]-v)*.55+(k===1?-.026:0));
          taper(distal,[[...wrist,.040],[...mid,.021],[...tip,.006]],[back,coat],6,[0,1,0]);
          const scallop=tip.map((v,k)=>v*.44+next[k]*.42+wrist[k]*.14+(k===1?-.034:0));
          fanFin(distal,wrist,[tip,scallop,next],[i%2?pigment(wing,false):wing,green?0x98ad63:sheen],.018);
          fin(distal,sheen,[wrist,mid,next.map((v,k)=>v+(wrist[k]-v)*.47)],.015);
          if(i<tips.length-1){
            const fold=tip.map((v,k)=>v*.72+wrist[k]*.28+(k===1?.012:0));
            const edge=next.map((v,k)=>v*.37+wrist[k]*.63+(k===1?.014:0));
            link(distal,pigment(wing,false),edge,fold,.009).castShadow=false;
          }
        }
        taper(distal,[[...wrist,.036],[wrist[0]+side*.142,wrist[1]+.124,wrist[2]-.069,.022],
          [wrist[0]+side*.214,wrist[1]+.152,wrist[2]-.091,.003]],[back,horn],6,[0,0,1]);
      }
      const tail=hinge(g,0,.94,.802*length);rig.tails.push(tail);
      tail.scale.set(earth?1.31:1,earth?1.22:1,tailLength);
      taper(tail,[[0,0,-.089,.149],[0,0,.141,.134],[.034,.014,.38,.115],
        [.088,.03,.628,.090],[.175,.06,.90,.062],[.268,.099,1.11,.035],[.325,.134,1.26,.019]],
        [coat,belly],12);
      if(green||fire){
        for(const side of [-1,1])fanFin(tail,[.268,.103,1.08],[[.321+side*.18,.13,1.27],[.364+side*(green?.172:.207),.17,1.415],
          [.355+side*.074,.205,1.62],[.348,.172,1.34]],[back,wing],.029);
      }else if(earth){
        part(tail,"shard",back,[.328,.134,1.228],[.162,.152,.182],[.14,.26,.19]);
        for(const side of [-1,1])part(tail,"shard",horn,[.329+side*.117,.142,1.251],[.082,.086,.127],[.218,side*.38,.28*side]);
      }else if(ice){
        fanFin(tail,[.268,.104,1.086],[[.28,.209,1.226],[.386,.337,1.406],[.412,.139,1.65],
          [.41,.055,1.441],[.346,.095,1.298]],[back,horn],.025);
      }else{
        part(tail,"ring",horn,[.345,.144,1.277],[.121,.121,.077],[.73,.13,0],true,.81);
        part(tail,"diamond",horn,[.344,.146,1.290],[.054,.071,.143],[.137,.26,0]);
      }
      for(let i=0;i<9;i++){
        const z=(-.72+i*.177)*length,h=1.20+Math.sin((i+.8)*.37)*.154;
        const scale=1-i*.055;
        if(ice||earth){
          part(g,"shard",i%2?horn:back,[0,h-.020,z],[.085*scale*(earth?1.78:1),.159*scale*(ice?1.73:.98),.119*scale*(earth?1.38:1)],[.35,0,0]);
          if(earth)for(const side of [-1,1])part(g,"chamfer",i%2?back:horn,[side*.112,h-.048,z+.025],
            [.118*scale,.099*scale,.136*scale],[.28,side*.36,side*.16]);
        }else{
          fin(g,i%2?back:wing,[[0,h-.091,z-.068],[0,h+.137*scale*(fire?1.57:green?.85:1),z+.069],[0,h-.107,z+.127]],.070*scale);
        }
      }
      if(time){
        const halo=new T.Mesh(geometry.ring,material(0xffc46d,true,.72));
        halo.scale.set(.32,.32,.44);
        halo.position.set(0,hy+.37,hz);halo.rotation.x=Math.PI/2;
        g.add(halo);rig.halo=halo;
        for(const side of [-1,1])part(head,"diamond",0xf3c781,[side*.044,.255,.009],[.028,.072,.035],[0,0,side*.22],true);
        for(let i=0;i<7;i++){
          const a=i*Math.PI*2/7;
          part(halo,"diamond",0xffce86,[Math.cos(a),Math.sin(a),0],[.12,.16,.15],[0,0,a],true);
        }
      }
      g.scale.setScalar(data.scale);
    }
    function regionalThreat(id,g,rig){
      if(id==="cave_shade"){
        for(const side of [-1,1]){
          part(g,"shard",0x2b2349,[side*.38,.83,-.094],[.175,.48,.261],[.12,side*.16,-side*.34]);
          part(g,"diamond",0x825cc8,[side*.41,.65,-.26],[.075,.21,.052],[.15,0,side*.33],true);
          part(g,"diamond",0x442e71,[side*.224,.30,.025],[.119,.275,.114],[.25,0,side*.31],true,.71);
        }
      }else if(id==="aurora_phantom"){
        for(const side of [-1,1]){
          const tail=hinge(g,side*.327,.63,.11);rig.tails.push(tail);
          part(tail,"shard",0xb5f5db,[side*.17,.045,.076],[.147,.293,.103],[.19,side*.22,side*.79],true,.82);
          part(tail,"diamond",0x50cbe4,[side*.23,-.10,.187],[.071,.232,.08],[.39,.1,side*.43],true,.74);
        }
      }else{
        const bog=id==="bog_revenant";
        for(const side of [-1,1]){
          if(bog){
            part(g,"shard",0x5c724b,[side*.43,1.71,.04],[.245,.174,.248],[0,side*.36,0]);
            for(let i=0;i<3;i++)part(g,"spike",i%2?0xa1a858:0x558c58,[side*(.34+i*.085),1.86-i*.024,.08+i*.047],
              [.065,.226-i*.035,.065],[.33,side*.1,-side*.4]);
          }else{
            part(g,"shard",0x3e373d,[side*.43,1.72,-.025],[.242,.232,.256],[0,side*.46,side*.29]);
            for(let i=0;i<3;i++)part(g,"diamond",i%2?0xff9c55:0xda6037,[side*(.32+i*.062),1.48+i*.103,-.307],
              [.036,.113,.028],[.11,0,side*.38],true);
          }
        }
      }
    }
    return {fish,creature,refine,scorpion,regional,regionalThreat,cowCoat,deer,dragon,livingTree,siteWarden,shared:geometry};
  }
  return {create};
})();

