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
    const aquaticSkin=new T.MeshStandardMaterial({vertexColors:true,roughness:.48});
    const materials=new Map();
    function material(color,glow=false,alpha=1){
      const key=color+":"+glow+":"+alpha;
      if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({
        color,roughness:.66,flatShading:true,emissive:glow?color:0,emissiveIntensity:glow?.57:0,
        transparent:alpha<1,opacity:alpha,depthWrite:alpha===1,side:alpha<1?T.DoubleSide:T.FrontSide
      }));
      return materials.get(key);
    }
    function mutedTint(color){
      const tone=new T.Color(color);
      return tone.clone().convertSRGBToLinear().lerp(tone,.26).getHex();
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
    function serpentPupil(parent,position,width,height,turn=0){
      const pupil=part(parent,"diamond",0x170e1b,position,[width,height,.006],[0,turn,0]);
      pupil.name="Pupila vertical serpentina";
      return pupil;
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
    function fanFin(parent,root,edge,colors,thickness=.014,resolution=1){
      if(resolution>1)return smoothFin(parent,root,edge,colors,thickness,resolution);
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
    function smoothFin(parent,root,edge,colors,thickness,steps){
      const origin=new T.Vector3(...root),rim=new T.CatmullRomCurve3(edge.map(p=>new T.Vector3(...p)));
      const columns=rim.getPoints((edge.length-1)*3);
      const normal=columns[0].clone().sub(origin).cross(columns.at(-1).clone().sub(origin)).normalize();
      const width=columns.length,layerSize=1+steps*width,vertices=[],tints=[],indices=[];
      const dark=new T.Color(colors[0]),light=new T.Color(colors[1]);
      const triangle=(a,b,c,reverse)=>indices.push(a,reverse?c:b,reverse?b:c);
      for(let layer=0;layer<2;layer++){
        const start=layer*layerSize,side=layer?-1:1;
        vertices.push(...origin.clone().addScaledVector(normal,side*thickness).toArray());
        tints.push(dark.r,dark.g,dark.b);
        for(let r=1;r<=steps;r++)for(const [i,p] of columns.entries()){
          const t=r/steps,w=Math.sin(t*Math.PI);
          const swell=side*thickness*(1-t*.61)+thickness*w*(.42+.13*Math.cos(i*Math.PI*2/3));
          vertices.push(...origin.clone().lerp(p,t).addScaledVector(normal,swell).toArray());
          const tint=dark.clone().lerp(light,.15+.65*t+.11*w*Math.cos(i*Math.PI*2/3));
          if(layer===(colors.length>2&&normal.y<0?0:1))tint.lerp(new T.Color(colors[2]??colors[0]),.68).multiplyScalar(.83);
          tints.push(tint.r,tint.g,tint.b);
          if(i===width-1)continue;
          const at=start+1+(r-1)*width+i;
          if(r===1)triangle(start,at,at+1,layer);
          else{
            triangle(at-width,at,at+1,layer);
            triangle(at-width,at+1,at+1-width,layer);
          }
        }
      }
      const border=[0,...Array.from({length:steps},(_,i)=>1+i*width),
        ...Array.from({length:width-1},(_,i)=>layerSize-width+i+1),
        ...Array.from({length:steps-1},(_,i)=>(steps-i-1)*width)];
      for(let i=0;i<border.length;i++){
        const a=border[i],b=border[(i+1)%border.length];
        indices.push(b,a,a+layerSize,b,a+layerSize,b+layerSize);
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute("position",new T.Float32BufferAttribute(vertices,3));
      geo.setAttribute("color",new T.Float32BufferAttribute(tints,3));
      geo.setIndex(indices);geo.computeVertexNormals();
      const mesh=new T.Mesh(geo,aquaticSkin);
      mesh.userData.ownGeometry=true;parent.add(mesh);
      return mesh;
    }
    const eye=0x141e26;
    const pigment=(color,light)=>new T.Color(color).lerp(new T.Color(light?0xe5eee5:0x1a202b),light?.29:.36).getHex();
    function contour(parent,sections,colors,pattern="",segments=12,shape=null,paint=null,finish=null){
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
      const node=new T.Mesh(mesh,finish||(shape?coatMaterial:skinMaterial));
      node.userData.ownGeometry=true;
      node.castShadow=true;node.receiveShadow=true;parent.add(node);
      return node;
    }
    function rayWing(parent,side,body,belly){
      const outline=[[-.06,.016,-.56],[.26,.022,-.462],[.62,.005,-.223],[.89,-.055,.05],
        [.61,-.041,.23],[.30,-.027,.437],[-.076,-.009,.63]].map(([x,y,z])=>[x*side,y,z]);
      if(side<0)outline.reverse();
      smoothFin(parent,[side*.075,.006,.034],outline,[pigment(body,false),body,belly],.036,8);
    }
    function scaledContour(parent,template,x,y,z,colors,pattern=""){
      return contour(parent,sculptSections(template).map(([position,center,width,height])=>[position*z,center*y,width*x,height*y]),
        colors,pattern,24,null,null,aquaticSkin);
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
    function shrimpModel(color,kind="raw_shrimp"){
      const pitu=kind==="shrimp_pitu",white=kind==="shrimp_white",small=kind==="shrimp_seabob";
      const shellDark=new T.Color(pitu?0x172d26:white?0xaba99d:small?0x794832:0xaf553e);
      const pituStripe=new T.Color(0xb99252);
      const group=new T.Group(),back=pigment(color,false),belly=pigment(color,true),wings=[];
      const tail=hinge(group,0,-.03,.15),tailTip=hinge(tail,0,-.089,.24);
      const head=[[-.35,-.035,.025,.033],[-.29,.008,.067,.059],[-.22,.023,.099,.086],
        [-.12,.035,.123,.102],[.005,.038,.116,.105],[.15,.012,.090,.079],[.21,-.002,.066,.065]];
      contour(group,sculptSections(sculptSections(head)),[color,belly],"",44,null,(c,z,a)=>{
        const stripe=Math.sin(a*(pitu?6:4)+z*8),mottle=Math.cos(z*91+a*25)*Math.sin(a*19-z*67);
        if(pitu)c.copy(shellDark).lerp(pituStripe,Math.max(0,-stripe)**6*.78);
        else c.lerp(shellDark,Math.max(0,stripe)**3*.33);
        c.multiplyScalar(.98+.12*mottle);
      },aquaticSkin).name="Carapaça do camarão";
      taper(group,[[0,.052,-.22,.048],[0,.059,-.32,.037],[0,.078,-.433,.006]],[back,belly],7);
      const jaw=aquaticMouth(group,[0,-.037,-.28],.035,.019,.033,back,belly);
      eyes(group,.064,.065,-.279,.025);
      contour(tail,sculptSections(sculptSections([[-.055,.04,.076,.067],[.065,.021,.083,.063],[.157,-.004,.067,.058],
        [.231,-.047,.058,.048],[.285,-.073,.045,.039],[.32,-.083,.039,.032]])),[color,belly],"",32,null,(c,z,a)=>{
          const ring=Math.max(0,Math.cos(z*96+a*.59));
          if(pitu)c.copy(shellDark).lerp(pituStripe,ring**5*.77);
          else c.lerp(shellDark,ring**5*.42);
        },aquaticSkin).name="Abdômen articulado";
      for(let i=0;i<4;i++){
        const y=.096-i*.024,z=.022+i*.069,r=.074-i*.010;
        fanFin(tail,[0,y-.062,z-.023],[[-r,y-.042,z],[0,y,z+.034],[r,y-.042,z]], [back,belly],.010);
      }
      part(tailTip,"oval",back,[0,.016,.012],[.043,.042,.075]).name="Raiz do leque caudal";
      for(const side of [-1,1]){
        const feeler=[[side*.031,.022,-.291],[side*.098,.012,-.42],[side*.134,-.012,-.547],[side*(small?.23:.162),-.034,small?-.75:-.67]];
        taper(group,feeler.map((p,i)=>[...p,.009-i*.0019]),[color,belly],5);
        fanFin(tailTip,[0,.013,-.015],[[side*.087,.014,.091],[side*.136,-.027,.18],[side*.082,-.036,.206],
          [side*.038,-.040,.165],[0,-.033,.123]],[back,color],.010);
        if(pitu){
          const claw=hinge(group,side*.063,-.052,-.16);
          const dark=0x142e2b,orange=0xbe5728,rust=new T.Color(orange);
          const jointBands=(c,a,j)=>c.lerp(rust,Math.max(0,1-Math.abs(j-8)/1.6,1-Math.abs(j-14)/1.35)*.94);
          dragonCurve(claw,[[0,0,0,.028],[side*.079,-.039,-.059,.026],[side*.164,-.074,-.125,.032],
            [side*.194,-.060,-.246,.028],[side*.210,-.055,-.337,.037],[side*.206,-.046,-.403,.028]],
            [dark,0x444c36],12,[0,1,0],jointBands).name="Braço comprido do pitu";
          for(const finger of [-1,1])dragonCurve(claw,[
            [side*.205,-.046,-.385,.024],[side*.205+finger*.037,-.044,-.439,.017],
            [side*.197+finger*.045,-.039,-.512,.010],[side*.188+finger*.020,-.037,-.552,.002]],
            [dark,orange],11,[0,1,0],(c,a,j)=>c.lerp(rust,Math.max(0,1-j*.17)*.9)).name="Pinça longa do pitu";
        }
        const swimmer=hinge(group,side*.047,-.038,-.102);swimmer.userData.side=side;wings.push(swimmer);
        for(let i=0;i<5;i++){
          const z=i*.049,t=i*.018;
          taper(swimmer,[[0,0,z,.013],[side*(.102-t),-.077,z+.045,.010],[side*(.129-t),-.143,z+.015,.004]],[back,belly],5);
        }
      }
      group.name=kind;
      return {group,tail,tailTip,wings,jaw,verticalTail:false,swimStyle:"undulate",biteAngle:.32};
    }
    function fish(id,color,style){
      if(id==="raw_shrimp")return shrimpModel(color);
      const eel=id==="raw_eel",catfish=id==="raw_catfish",pike=id==="raw_pike",flat=style==="flat";
      const puffer=id==="pufferfish";
      const g=new T.Group(),long=eel||catfish||style==="long",small=id==="raw_sardine";
      const length=eel?.79:pike?.73:long?.62:style==="slim"?.50:id==="raw_carp"?.46:.40;
      const x=flat?.25:catfish?.145:long?.109:puffer?.244:.176,y=flat?.064:long?.085:puffer?.233:style==="deep"?.215:.146;
      const belly=pigment(color,true),back=pigment(color,false),lateral=new T.Color(belly);
      const salmonid=id==="raw_trout"||id==="raw_char",blush=new T.Color(id==="raw_char"?0xd58458:0xb87b8a),fleck=new T.Color(0x455372);
      const wings=[];
      const markings=["raw_perch","piranha","raw_piranha","raw_tilapia"].includes(id)?"stripe":
        ["raw_trout","raw_char","raw_loach","raw_pike"].includes(id)?"speckle":style==="slim"?"silver":"scales";
      const hull=[[-1.15,-.20,.23,.14],[-1.04,-.14,.46,.32],[-.91,-.10,.69,.60],[-.73,-.05,.85,.84],
        [-.52,-.012,.95,.96],[-.36,0,1,1],[-.19,.02,.98,1],[-.03,.02,.94,.97],[.17,0,.88,.88],
        [.34,-.02,.76,.76],[.49,-.042,.61,.60],[.64,-.046,.46,.45],[.83,-.05,.29,.31],[.94,-.05,.19,.23],[1.04,-.05,.09,.14]];
      const profile=sculptSections(sculptSections(hull));
      const skin=profile.map(([z,c,w,h])=>[z*length,c*y,w*x*(flat&&z>-.7?1.12:1),h*y]);
      const hullMesh=contour(g,skin,[color,belly],"",48,null,(mix,z,a)=>{
        const elevation=Math.cos(a),lane=elevation-(.041*Math.sin(z*11)+.06);
        const row=Math.floor(a*9.5),arch=Math.cos(a*9.5*Math.PI*2)*.23;
        const scales=(Math.cos(z*147+row*Math.PI+arch)*.5+.5)**4;
        if(z>-.59*length&&!eel&&!catfish)mix.multiplyScalar(.93+scales*.17);
        if(z<-.52*length)mix.multiplyScalar(.97+.035*Math.sin(a*15+z*90));
        if(markings==="stripe"&&z>-.65*length)mix.multiplyScalar(1-Math.max(0,Math.cos(z*44+elevation))**3*.28);
        if(puffer&&z>-.73*length&&elevation>-.34)mix.multiplyScalar(1-Math.max(0,Math.cos(z*70+a*7)*Math.sin(a*19))**5*.43);
        if(Math.abs(lane)<.26&&z>-.57*length)mix.lerp(lateral,(.26-Math.abs(lane))*.93);
        if(Math.abs(lane)<.067&&z>-.38*length&&z<.64*length)mix.multiplyScalar(.93+.12*Math.sin(z*182)**2);
        if(salmonid&&z>-.57*length&&z<.68*length){
          if(Math.abs(elevation)<.31)mix.lerp(blush,(.31-Math.abs(elevation))*1.85);
          if(elevation>.12&&Math.sin(z*67+elevation*41)>.69)mix.lerp(fleck,.63);
        }
      },aquaticSkin);
      hullMesh.name="Corpo com escamas";
      if(puffer)for(let row=0;row<5;row++)for(let k=0;k<11;k++){
        const a=(k+(row%2)*.5)*Math.PI*2/11,z=length*(-.72+row*.29);
        const [,c,w,h]=profile.reduce((best,next)=>Math.abs(next[0]*length-z)<Math.abs(best[0]*length-z)?next:best);
        const base=[Math.sin(a)*x*w*.98,y*(c+Math.cos(a)*h*.98),z];
        dragonHorn(g,[[...base,.025],[base[0]+Math.sin(a)*.044,base[1]+Math.cos(a)*.044,z+.025,.013],
          [base[0]+Math.sin(a)*.083,base[1]+Math.cos(a)*.083,z+.06,.0015]],[back,belly],true);
      }
      const hunter=id==="piranha"||pike,jaw=aquaticMouth(g,[0,-y*.26,-length*.91],
        x*(hunter?.52:catfish?.56:.36),y*(hunter?.23:.17),length*(pike?.22:.19),back,belly,hunter?4:0);
      eyes(g,x*.77,y*(flat?.63:.22),-length*.74,puffer?.044:small?.022:.030);
      for(const side of [-1,1]){
        const paddle=hinge(g,side*x*.64,-y*.28,-length*.38);
        paddle.userData.side=side;wings.push(paddle);
        const tip=[side*x*(flat?1.36:puffer?.58:.91),-y*(puffer?.36:.62),length*(puffer?.35:.45)];
        part(paddle,"oval",color,[0,0,0],[.034,.027,.058],[.07,side*.24,0]);
        fanFin(paddle,[0,0,-length*.085],[[side*x*.60,-y*.19,length*.11],tip,
          [tip[0]*.69,tip[1]*.84,length*.54],[tip[0]*.27,tip[1]*.37,length*.49],[0,0,length*.22]],[back,belly],.013,5);
        const gill=[[side*x*.83,y*.55,-length*.44,small?.005:.006],[side*x*.961,y*.21,-length*.36,.007],
          [side*x*.994,-y*.075,-length*.382,.007],[side*x*.884,-y*.41,-length*.468,.003]];
        const plate=taper(g,gill,[back,pigment(back,true)],8,[0,0,1]);
        plate.castShadow=false;plate.name="Borda do opérculo";
        taper(g,gill.map(([gx,gy,gz,r])=>[gx*1.012,gy*.92,gz-length*.022,r*.51]),
          [pigment(back,false),back],7,[0,0,1]).name="Abertura branquial";
        if(!eel){
          const mark=[side*x*.48,-y*.145,-length*1.03];
          part(g,"oval",back,mark,[.013,.008,.012],[0,side*.40,0]).name="Narina";
        }
        const pelvic=hinge(g,side*x*.46,-y*.45,length*.13);
        pelvic.userData.side=side;wings.push(pelvic);
        fanFin(pelvic,[0,0,-length*.14],[[side*x*.29,-y*.34,length*.05],[side*x*.54,-y*.63,length*.23],
          [side*x*.20,-y*.24,length*.30],[0,0,length*.29]],[back,color],.009,4);
      }
      const crest=puffer?1.22:eel?1.13:id==="piranha"?1.60:flat?1.25:style==="deep"?1.88:1.72;
      const dorsalRoot=[0,y*.70,length*.035],dorsalEdge=eel?[
        [0,y*.72,-length*.47],[0,y*1.11,-length*.16],[0,y*1.23,length*.25],[0,y*.90,length*.68],[0,y*.36,length*.82]]:
        [[0,y*.72,-length*.51],[0,y*(crest*.87),-length*.32],[0,y*crest,-length*.185],
        [0,y*(crest*.91),-length*.04],[0,y*(crest*.75),length*.12],[0,y*.57,length*.42],[0,y*.36,length*.59]];
      fanFin(g,dorsalRoot,dorsalEdge,[back,pigment(color,true)],.012,6);
      if(id==="raw_perch"||id==="raw_seabass"||pike)fanFin(g,[0,y*.40,length*.51],
        [[0,y*.49,length*.34],[0,y*.92,length*.49],[0,y*.69,length*.62],[0,y*.29,length*.74]],[back,color],.009);
      fin(g,back,[[0,-y*.58,length*.18],[0,-y*1.04,length*.47],[0,-y*.30,length*.68]],.022);
      const {tail,tailTip}=anchoredSwimmer(g,hullMesh,skin,48,length*.66,length*.90,aquaticSkin,length*.21);
      part(tailTip,"oval",back,[0,0,length*.02],[x*.16,y*.23,length*.185]).name="Raiz da nadadeira caudal";
      for(const side of [-1,1]){
        const roundTail=flat||id==="raw_tilapia"||id==="raw_pacu";
        const root=[0,-y*.05,-length*.10],tip=[0,side*y*(puffer?.68:eel?.64:long?1.12:roundTail?1.16:1.45),length*(eel?.37:roundTail?.42:.52)];
        const fork=[0,0,length*(roundTail?.49:.27)];
        fanFin(tailTip,root,[[0,tip[1]*.51,length*.18],tip,[0,tip[1]*.72,tip[2]*1.07],[0,tip[1]*.33,length*.36],fork],[back,color],.013,5);
        if(catfish||id==="raw_loach"){
          const mouth=[side*x*.26,-y*.21,-length*1.10],bend=[side*x*.65,-y*.41,-length*1.20];
          taper(g,[[...mouth,.009],[...bend,.006],[side*x*1.28,-y*.60,-length*1.34,.002]],[back,belly],6);
        }
      }
      g.name=id;
      return {group:g,tail,tailTip,wings,jaw,verticalTail:false,swimStyle:long?"undulate":"swim",biteAngle:hunter?.83:.41};
    }
    function anchoredSwimmer(group,body,profile,segments,joint,tip,finish=body.material,bend=.33){
      const spine=new T.Bone(),tail=new T.Bone(),tailTip=new T.Bone(),weights=[],bones=[];
      spine.name="Eixo do torso";tail.name="Pedúnculo";tailTip.name="Raiz dos lobos caudais";
      tail.position.z=joint;tailTip.position.z=tip-joint;spine.add(tail);tail.add(tailTip);
      for(const [z] of profile){
        const outer=T.MathUtils.smoothstep(z,tip-bend*1.24,tip-bend*.22);
        const inner=T.MathUtils.smoothstep(z,joint-bend*.94,joint+bend);
        for(let i=0;i<segments;i++){
          bones.push(0,1,2,0);weights.push(1-inner,inner*(1-outer),inner*outer,0);
        }
      }
      body.geometry.setAttribute("skinIndex",new T.Uint16BufferAttribute(bones,4));
      body.geometry.setAttribute("skinWeight",new T.Float32BufferAttribute(weights,4));
      const childIndex=group.children.indexOf(body);
      group.remove(body);
      const mesh=new T.SkinnedMesh(body.geometry,skinnedMaterial(finish));
      mesh.name=body.name;mesh.userData.ownGeometry=true;mesh.frustumCulled=false;mesh.add(spine);group.add(mesh);
      group.children.splice(childIndex,0,group.children.pop());
      mesh.castShadow=mesh.receiveShadow=true;
      mesh.updateMatrixWorld(true);mesh.bind(new T.Skeleton([spine,tail,tailTip]));
      return {tail,tailTip};
    }
    function riverBoto(){
      const g=new T.Group(),wings=[],rose=0xd48a94,pale=0xeaa6aa,shadow=0x875e75;
      const profile=sculptSections(sculptSections(sculptSections([
        [-1.44,-.089,.010,.013],[-1.40,-.091,.046,.025],[-1.23,-.083,.055,.037],
        [-1.02,-.052,.082,.060],[-.89,-.014,.128,.122],[-.79,.011,.169,.190],
        [-.648,.012,.231,.260],[-.47,-.002,.282,.275],[-.19,-.013,.323,.275],
        [.13,-.026,.314,.251],[.39,-.045,.264,.213],[.69,-.081,.199,.167],[.91,-.118,.134,.118],
        [1.10,-.138,.097,.081],[1.29,-.149,.077,.058],[1.42,-.146,.019,.021]
      ])));
      const pink=new T.Color(rose),lit=new T.Color(pale),deep=new T.Color(shadow);
      const crown=([z,y,w,h],a)=>{
        const c=Math.cos(a);
        const ridge=.106*Math.exp(-(((z-.44)/.35)**2))*Math.max(0,c)**13;
        return [Math.sin(a)*w,y+c*h+ridge,z];
      };
      const body=contour(g,profile,[rose,pale],"",58,crown,(color,z,a)=>{
        const lower=T.MathUtils.smoothstep(-Math.cos(a),.12,.97);
        const freckles=Math.sin(z*86+a*37)*Math.cos(z*111-a*71);
        const bands=Math.cos(z*21+a*11+Math.sin(a*9));
        color.copy(pink).lerp(lit,.58*(1-lower)).lerp(deep,lower*.25).multiplyScalar(.975+.052*bands+.043*freckles);
        if(freckles>.71&&z>-.68&&z<.72)color.lerp(deep,.20);
      },aquaticSkin);
      body.name="Corpo rosado, melão, rostro e crista dorsal";
      const {tail,tailTip}=anchoredSwimmer(g,body,profile,58,.59,1.26);
      part(tailTip,"oval",rose,[0,-.147,.025],[.087,.061,.165]).name="Junção dos lobos caudais";
      const jaw=hinge(g,0,-.099,-.784);
      contour(jaw,[[-.635,-.007,.014,.013],[-.598,-.014,.041,.020],[-.47,-.020,.044,.024],
        [-.29,-.022,.064,.039],[-.11,-.035,.104,.048],[.055,-.018,.117,.032]],
        [rose,pale],"",29,null,null,aquaticSkin).name="Mandíbula longa";
      for(const side of [-1,1]){
        const eye=hinge(g,side*.186,.046,-.718);eye.rotation.y=-side*.91;
        part(eye,"oval",shadow,[0,0,0],[.026,.018,.018]);
        part(eye,"oval",0x31212b,[0,0,-.009],[.016,.013,.010]).name="Olho pequeno do boto";
        part(eye,"oval",0xf7dad2,[.004,.004,-.018],[.004,.004,.003]);
        dragonCurve(g,[[side*.039,-.095,-1.397,.003],[side*.053,-.101,-1.24,.004],[side*.076,-.105,-1.047,.006],
          [side*.125,-.114,-.894,.007],[side*.164,-.107,-.784,.003]],[shadow,rose],8).name="Linha da boca";
        dragonCurve(g,[[side*.190,-.124,-.731,.004],[side*.220,-.139,-.657,.006],
          [side*.250,-.114,-.586,.003]],[rose,shadow],9).name="Dobra do pescoço";
        const wing=hinge(g,side*.232,-.121,-.449);wing.userData.side=side;wings.push(wing);
        fanFin(wing,[-side*.070,.045,-.028],[[side*.10,-.035,-.14],[side*.24,-.11,-.105],[side*.46,-.175,.064],
          [side*.59,-.222,.257],[side*.53,-.234,.329],[side*.36,-.15,.327],[side*.15,-.066,.247],[0,-.006,.147]],
          [rose,pale,shadow],.033,10).name="Nadadeira peitoral larga";
        const edge=[[.13,-.002,-.065],[.32,-.014,-.041],[.48,-.042,.016],[.65,-.066,.145],[.55,-.081,.261],
          [.36,-.076,.271],[.18,-.036,.232],[0,-.007,.165]];
        fanFin(tailTip,[0,-.144,-.11],edge.map(([x,y,z])=>[side*x,-.144+y,z]),[rose,pale,shadow],.036,10).name="Lobo caudal";
      }
      part(g,"oval",0x805a6f,[0,.275,-.465],[.037,.008,.068],[.13,0,0]).name="Espiráculo";
      return {group:g,tail,tailTip,wings,jaw,spouts:[[0,.282,-.465]],breach:1.12,verticalTail:true,swimStyle:"swim",biteAngle:.11};
    }
    const orcaLooks={
      orca:{back:0x090e16,fin:0x2e3d47,pale:0xf2f3eb,saddle:0x495664,
        eye:[-1.06,.075,.29,.151,.13],dorsal:[1,1,0],forehead:0,flipper:1,cape:0},
      orca_b:{back:0x1a1b17,fin:0x383a30,pale:0xefd39a,saddle:0x685f4d,
        eye:[-1.00,.105,.39,.221,.05],dorsal:[.76,1.09,.12],forehead:.04,flipper:.99,cape:.25},
      orca_c:{back:0x20221d,fin:0x363c34,pale:0xe4c88f,saddle:0x62594e,
        eye:[-1.17,.072,.23,.105,.84],dorsal:[.96,.87,.17],forehead:.015,flipper:.87,cape:.22},
      orca_d:{back:0x090c12,fin:0x293641,pale:0xf1f3f0,saddle:0x454b58,
        eye:[-1.25,.085,.125,.079,.08],dorsal:[.73,.91,.29],forehead:.18,flipper:.87,cape:0}
    };
    const orcaSkins=new Map();
    const orcaPigments=new Map(Object.values(orcaLooks).map(look=>[look,{
      back:new T.Color(look.back),saddle:new T.Color(look.saddle),pale:new T.Color(look.pale)
    }]));
    function paintOrca(color,z,c,look,pigments){
      const clamp=value=>Math.max(0,Math.min(1,value));
      const [eyeZ,eyeHeight,eyeLength,eyeWidth,tilt]=look.eye;
      const eyeCenter=eyeHeight+tilt*(z-eyeZ);
      const eyePatch=1-((z-eyeZ)/eyeLength)**2-((c-eyeCenter)/eyeWidth)**2;
      const flank=1-((z-.39)/.57)**2-((c+.61)/.38)**2;
      const lower=-.63+.37*clamp((-z-1.23)/.71);
      const lowerPatch=clamp((1.53-z)*15)*clamp((lower-c)*59);
      const mantle=1-((z-.47)/.39)**2-((1-c)/.42)**2;
      const cape=clamp((c-.42)*2)*clamp(1-((z+.35)/1.72)**4);
      return color.copy(pigments.back).multiplyScalar(1.1+.22*Math.max(c,0))
        .lerp(pigments.saddle,Math.max(clamp(mantle)*.73,cape*look.cape))
        .lerp(pigments.pale,Math.max(clamp(eyePatch*19),clamp(flank*23),lowerPatch));
    }
    function orcaFinish(profile,geometry,segments,look,pigments){
      const from=profile[0][0],span=profile.at(-1)[0]-from,uv=[];
      const colors=geometry.getAttribute("color");
      for(const [z] of profile)for(let i=0;i<segments;i++){
        uv.push((z-from)/span,(1+Math.cos(i*Math.PI*2/segments))/2);
      }
      for(let i=0;i<colors.count;i++){
        const shade=colors.getX(i);
        colors.setXYZ(i,shade,shade,shade);
      }
      geometry.setAttribute("uv",new T.Float32BufferAttribute(uv,2));
      if(!orcaSkins.has(look)){
        const w=512,h=256,pixels=new Uint8Array(w*h*4),color=new T.Color();
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){
          paintOrca(color,from+(x+.5)*span/w,(y+.5)*2/h-1,look,pigments);
          const i=(y*w+x)*4;
          pixels[i]=color.r*255;pixels[i+1]=color.g*255;pixels[i+2]=color.b*255;pixels[i+3]=255;
        }
        const map=new T.DataTexture(pixels,w,h,T.RGBAFormat);
        map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;
        orcaSkins.set(look,new T.MeshStandardMaterial({map,vertexColors:true,roughness:.43}));
      }
      return orcaSkins.get(look);
    }
    const whaleLooks={
      sperm_whale:{back:0x333b42,belly:0x777875,fin:0x454b50,width:1,depth:1,dorsal:.31,shift:.33,flipper:.85,tail:1.04},
      blue_whale:{back:0x456879,belly:0xa3b4b8,fin:0x688295,width:1.12,depth:.92,dorsal:.38,shift:.48,flipper:.97,tail:1.07},
      southern_right_whale:{back:0x171d24,belly:0x88918d,fin:0x343f4a,width:1.24,depth:1.18,dorsal:0,shift:0,flipper:1.22,tail:1.20},
      sei_whale:{back:0x46515b,belly:0xadb1a6,fin:0x556674,width:.88,depth:.90,dorsal:1.48,shift:.06,flipper:.84,tail:.93},
      common_minke:{back:0x2e3c45,belly:0xd2d4c7,fin:0x3e5059,width:.96,depth:.92,dorsal:1.09,shift:.02,flipper:1,tail:.82},
      fin_whale:{back:0x2a4647,belly:0xd0c4a9,fin:0x426067,width:.89,depth:.85,dorsal:1.20,shift:.27,flipper:1.02,tail:.92},
      brydes_whale:{back:0x564943,belly:0xc7b99e,fin:0x605b55,width:1.04,depth:.94,dorsal:1.38,shift:.17,flipper:.97,tail:1.02}
    };
    function cetacean(kind,detail){
      const variant=whaleLooks[kind],humpback=kind==="humpback",minke=kind==="minke"||kind==="common_minke";
      const sperm=kind==="sperm_whale",right=kind==="southern_right_whale",blue=kind==="blue_whale",finWhale=kind==="fin_whale";
      const whale=humpback||minke||!!variant,slender=whale&&!humpback&&!right;
      const look=orcaLooks[kind],pigments=orcaPigments.get(look),g=new T.Group(),wings=[];
      const back=variant?.back??(minke?0x293845:whale?0x263d4c:look.back),belly=variant?.belly??(whale?0xb7cbd3:look.pale),dark=0x101923;
      const coarse=sperm?[
        [-2.41,.23,.082,.31],[-2.37,.25,.33,.52],[-2.28,.27,.49,.62],[-2.12,.29,.55,.67],
        [-1.88,.28,.59,.68],[-1.57,.23,.63,.65],[-1.27,.15,.66,.61],[-.91,.067,.68,.628],
        [-.49,.041,.71,.613],[-.07,.018,.66,.55],[.36,.02,.56,.47],[.78,.024,.44,.39],
        [1.23,.028,.31,.29],[1.63,.036,.20,.19],[2.02,.051,.133,.121],[2.36,.058,.095,.063],[2.53,.056,.026,.025]
      ]:right?[
        [-2.35,.192,.032,.036],[-2.29,.184,.28,.16],[-2.10,.155,.434,.290],[-1.88,.092,.648,.419],
        [-1.65,.046,.697,.554],[-1.43,.068,.715,.608],[-1.10,.078,.751,.656],[-.62,.065,.785,.648],
        [-.11,.058,.716,.593],[.39,.031,.635,.521],[.82,.018,.49,.402],[1.25,-.005,.364,.294],
        [1.66,-.016,.243,.199],[2.01,.012,.156,.118],[2.34,.038,.105,.066],[2.54,.05,.024,.023]
      ]:slender?[
        [-2.35,-.06,.023,.021],[-2.24,-.043,.129,.071],[-2.02,-.02,.225,.116],[-1.81,.033,.35,.179],
        [-1.56,.08,.468,.295],[-1.31,.076,.550,.425],[-.89,.06,.61,.506],[-.45,.049,.60,.518],
        [.02,.027,.55,.487],[.47,.046,.465,.421],[.89,.05,.364,.335],[1.30,.015,.274,.255],
        [1.70,-.02,.18,.16],[2.07,-.012,.125,.093],[2.38,.018,.090,.054],[2.54,.030,.027,.026]
      ]:whale?[
        [-2.35,.05,.045,.045],[-2.30,.064,.20,.105],[-2.16,.075,.34,.165],[-1.94,.10,.46,.225],
        [-1.66,.105,.57,.35],[-1.42,.06,.66,.49],[-1.15,.055,.75,.63],[-.73,.034,.83,.69],
        [-.24,.038,.80,.70],[.24,.067,.71,.61],[.68,.106,.55,.51],[1.10,.075,.42,.38],
        [1.49,.010,.31,.255],[1.84,-.039,.218,.174],[2.12,-.007,.139,.102],[2.39,.046,.109,.058],[2.54,.060,.025,.025]
      ]:[
        [-1.99,.032,.035,.038],[-1.954,.040,.18,.13],[-1.84,.054,.325,.224],[-1.63,.052,.435,.334],
        [-1.39,.049,.527,.453],[-1.14,.028,.572,.537],[-.79,.022,.603,.565],[-.38,.017,.600,.559],
        [.03,.008,.532,.507],[.40,-.017,.445,.432],[.72,-.068,.363,.352],[1.04,-.108,.267,.258],
        [1.31,-.127,.198,.195],[1.59,-.112,.133,.124],[1.79,-.084,.105,.070],[1.92,-.08,.029,.027]
      ];
      const blowholeZ=sperm?-2.18:whale?-1.32:-1.12;
      const openings=sperm?[[-.142,-.012]]:whale?[[-.101,-.018],[.101,.018]]:[[0,0]];
      const w=whale?.055:.096,d=whale?.110:.074;
      function nostril(x,z){
        return Math.min(...openings.map(([center,shear])=>{
          const along=z-blowholeZ;
          return Math.hypot((x-center-along*shear*8)/w,(along-.18*Math.abs(x-center))/d);
        }));
      }
      const headProfile=variant&&!right?coarse.map(([z,y,rx,ry])=>{
        const rostrum=blue&&z<-1.55?1+.86*T.MathUtils.smoothstep(-z,1.55,2.27):1;
        return [z,y,rx*variant.width*rostrum,ry*variant.depth];
      }):look?.forehead?coarse.map(([z,y,rx,ry])=>{
        const crest=look.forehead*T.MathUtils.smoothstep(z,-1.99,-1.78)*(1-T.MathUtils.smoothstep(z,-1.59,-.97));
        return [z,y+crest,rx*(1+crest),ry+crest];
      }):coarse;
      const smoothProfile=sculptSections(sculptSections(headProfile));
      const profile=detail?sculptSections(smoothProfile):smoothProfile;
      const blowholeSteps=detail?8:4;
      for(let i=-blowholeSteps;i<=blowholeSteps;i++){
        const z=blowholeZ+i*d*1.44/blowholeSteps,upper=profile.findIndex(row=>row[0]>z),a=profile[upper-1],b=profile[upper];
        const ratio=(z-a[0])/(b[0]-a[0]);
        profile.splice(upper,0,[z,...a.slice(1).map((value,j)=>T.MathUtils.lerp(value,b[j+1],ratio))]);
      }
      const gradient=new T.Color(belly),base=new T.Color(back);
      const bound=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
      function surface(z,a,offset=0){
        const n=profile.findIndex(p=>p[0]>=z),i=n<0?profile.length-1:Math.max(1,n),b=profile[i],c=profile[i-1];
        const f=bound((z-c[0])/(b[0]-c[0]));
        const [,y,rx,ry]=b.map((v,j)=>c[j]+(v-c[j])*f);
        return [Math.sin(a)*(rx+offset),y+Math.cos(a)*(ry+offset),z];
      }
      const segments=detail?144:72;
      const smooth=T.MathUtils.smoothstep;
      const mouthEnd=sperm?-1.02:right?-1.19:whale?-1.31:-1.08,front=coarse[0][0];
      const lips=z=>{
        const f=bound((z-front)/(mouthEnd-front));
        const angle=sperm?2.42-.12*Math.sin(f*Math.PI):right?1.88-.53*Math.sin(f*Math.PI):whale?2.02+.21*Math.sin(f*Math.PI)-f*.39:2.14+.10*Math.sin((z+1.99)*4)-.29*smooth(z,-1.85,-1.13);
        return T.MathUtils.lerp(angle,Math.PI,smooth(z,mouthEnd-.23,mouthEnd));
      };
      const lipLine=z=>surface(z,lips(z));
      const hull=contour(g,profile,[back,belly],"",segments,([z,y,rx,ry],a)=>{
        const c=Math.cos(a);let x=Math.sin(a)*rx,height=y+c*ry;
        if(c>.82&&Math.abs(z-blowholeZ)<d*1.7){
          const r=nostril(x,z);
          height-=.035*(1-smooth(r,.33,.91))-.008*(1-smooth(Math.abs(r-1),.04,.29));
        }
        if(z<mouthEnd){
          const angle=lips(z),fold=Math.acos(c);
          if(fold>angle){
            height=y+Math.cos(angle)*ry;
            x=Math.sign(Math.sin(a))*rx*Math.sin(angle)*(Math.PI-fold)/(Math.PI-angle);
          }
        }
        return [x,height,z];
      },(color,z,a)=>{
        const c=Math.cos(a),threshold=-.32-.21*bound((z+1.33)/2.1)+.029*Math.sin(z*14+a*7);
        const mottling=.91+.061*Math.sin(z*16+a*7+Math.sin(a*4-z*9))+
          .057*Math.sin(z*32-a*21)*Math.cos(z*38+a*19)+.075*Math.sin(z*78+a*62)*Math.sin(z*57-a*71);
        if(whale){
          const blueBlotches=blue?.29*Math.sin(z*23+a*7)**2*Math.cos(z*17-a*15)**2:0;
          const whiteChin=finWhale&&Math.sin(a)>0&&z<-1.08?bound((.18-c)*2.7)*.95:0;
          const rightBelly=right?bound((-.88-c)*9)*bound((.58-Math.abs(z+.31))):0;
          const pale=sperm?bound((-.57-c)*2.8)*.65:right?rightBelly:Math.max(whiteChin,bound((threshold-c)*5.5)*(z<1.43?1:.44));
          color.copy(base).multiplyScalar(mottling+blueBlotches).lerp(gradient,pale);
        }
        else color.setRGB(1,1,1);
        if(c>.82&&Math.abs(z-blowholeZ)<d*1.7){
          const shade=T.MathUtils.lerp(.14,1,smooth(nostril(surface(z,a)[0],z),.54,1.05));
          color.multiplyScalar(shade);
        }
      },aquaticSkin);
      hull.name=whale?"Corpo contínuo da baleia":"Corpo da orca com sela e manchas";
      const joint=whale?1.02:.76,tip=whale?2.36:1.75;
      const finish=whale?hull.material:orcaFinish(profile,hull.geometry,segments,look,pigments);
      const {tail,tailTip}=anchoredSwimmer(g,hull,profile,segments,joint,tip,finish);
      part(tailTip,"oval",back,[0,whale?.043:-.083,.008],
        whale?[.137,.070,.211]:[.111,.072,.174]).name="Junção dos lobos caudais";
      const jaw=hinge(g,0,surface(mouthEnd,Math.PI)[1],mouthEnd);
      const mouthColor=whale?0x182833:0x10161d;
      jaw.name=whale?"Mandíbula articulada da baleia":"Mandíbula articulada da orca";
      const jawRows=profile.filter(([z])=>z<mouthEnd).map(([z])=>[z,0,0,0]);
      jawRows.push([mouthEnd-.0001,0,0,0]);
      contour(jaw,jawRows,[belly,0xced9d8],"",detail?96:48,([z],a)=>{
        const angle=lips(z),c=Math.cos(a),side=Math.sign(Math.sin(a));
        let at;
        if(c>=0){
          const edge=lipLine(z);
          at=[edge[0]*Math.sin(a),edge[1]+.008*(1-smooth(z,mouthEnd-.16,mouthEnd)),z];
        }else{
          const folded=angle+(Math.PI-angle)*(Math.acos(c)-Math.PI/2)/(Math.PI/2);
          at=surface(z,side*folded);
          if(sperm)at[0]*=.72;
        }
        return [at[0],at[1]-jaw.position.y,z-jaw.position.z];
      },(color,z,a)=>{
        const c=Math.cos(a),folded=lips(z)+(Math.PI-lips(z))*Math.max(0,(Math.acos(c)-Math.PI/2)/(Math.PI/2));
        if(c>.04)color.setHex(whale?0x392a36:0x2b1925);
        else if(whale){
          const threshold=-.32-.21*bound((z+1.33)/2.1)+.029*Math.sin(z*14+folded*7);
          const whiteChin=finWhale&&Math.sin(a)>0?.96:0;
          color.copy(base).lerp(gradient,right?0:Math.max(whiteChin,bound((threshold-Math.cos(folded))*5.5)));
        }else paintOrca(color,z,Math.cos(folded),look,pigments);
      },aquaticSkin).name=whale?"Mandíbula inferior e cavidade bucal da jubarte":"Queixo branco e interior da boca";
      if(!whale||sperm){
        for(const side of [-1,1])for(let i=0;i<8;i++){
          const z=(sperm?-2.28:-1.88)+i*(sperm?.13:.062),[worldX,worldY]=lipLine(z);
          const x=sperm?worldX*.68:worldX,y=sperm?worldY-jaw.position.y:worldY;
          const toothZ=sperm?z-jaw.position.z:z,tip=sperm?.043:-.012;
          dragonCurve(sperm?jaw:g,[[side*x*.90,y+.005,toothZ,.012],[side*x*.91,y+tip*.5,toothZ+.002,.009],
            [side*x*.91,y+tip,toothZ+.008,.002]],[0xe4e5d5,0x9daaa7],7).name=sperm?"Dente da mandíbula":"Dente da orca";
        }
      }
      for(const side of [-1,1]){
        const eyeZ=sperm?-1.07:whale?-1.39:-1.41,eyeAngle=side*(whale?1.71:1.59);
        const eye=surface(eyeZ,eyeAngle,.014);
        part(g,"oval",whale?0x3d5260:back,eye,whale?[.034,.052,.086]:[.025,.038,.057]).name="Pálpebras";
        const pupil=eye.slice();pupil[0]+=side*.020;
        part(g,"oval",dark,pupil,whale?[.025,.031,.057]:[.018,.024,.041]).name=whale?"Olho da baleia":"Olho da orca";
        part(g,"oval",0xa9bfc7,[pupil[0]+side*.016,pupil[1]+.01,pupil[2]-.019],[.005,.009,.012]);
        const lip=[];
        for(let i=0;i<=15;i++){
          const f=i/15,z=T.MathUtils.lerp(front+.005,mouthEnd-.12,f);
          const at=surface(z,side*lips(z),.002);
          lip.push([...at,.0015+.004*Math.sin(f*Math.PI)]);
        }
        dragonCurve(g,lip,[mouthColor,mouthColor],9).name="Linha da boca";
        const wingRoot=surface(sperm?-.70:whale?-.92:-.85,side*2.02,-.08);
        const wing=hinge(g,...wingRoot);wing.userData.side=side;wings.push(wing);
        const outline=right||sperm?[
          [.04,.03,-.22],[.21,-.045,-.27],[.44,-.12,-.15],[.62,-.21,.04],[.70,-.27,.24],
          [.58,-.29,.44],[.40,-.24,.46],[.20,-.14,.32],[0,-.02,.18]
        ]:slender?[
          [.02,0,-.21],[.20,-.067,-.22],[.37,-.14,-.11],[.60,-.28,.16],[.68,-.34,.38],
          [.58,-.30,.41],[.39,-.18,.36],[.18,-.09,.24],[.01,-.02,.15]
        ]:whale?[
          [.02,0,-.32],[.22,-.035,-.37],[.34,-.069,-.35],[.50,-.108,-.29],[.72,-.161,-.21],
          [.95,-.24,-.055],[1.22,-.32,.17],[1.45,-.43,.47],[1.54,-.49,.66],
          [1.40,-.45,.68],[1.14,-.37,.58],[.86,-.30,.46],[.55,-.21,.39],[.23,-.10,.36],[0,-.02,.26]
        ]:[
          [.05,.01,-.24],[.17,-.065,-.23],[.31,-.135,-.17],[.44,-.23,-.07],[.54,-.32,.10],
          [.56,-.36,.26],[.51,-.34,.40],[.40,-.28,.46],[.29,-.20,.41],[.17,-.10,.32],[.03,-.015,.24]
        ];
        const paddle=fanFin(wing,[-side*.09,.03,-.014],outline.map(([x,y,z])=>[side*x*(variant?.flipper??look?.flipper??1),y,z]),
          [back,variant?.fin??(whale?0x506d7d:look.fin),whale?belly:back],whale?.050:.043,detail?10:7);
        paddle.name=whale?"Nadadeira peitoral da baleia":"Nadadeira peitoral arredondada";
        if(kind==="common_minke"){
          const position=paddle.geometry.attributes.position,colors=paddle.geometry.attributes.color,tint=new T.Color(),white=new T.Color(0xedece0);
          for(let i=0;i<position.count;i++){
            const span=Math.abs(position.getX(i));
            const band=smooth(span,.20,.28)*(1-smooth(span,.51,.62));
            tint.fromBufferAttribute(colors,i).lerp(white,band*.94);colors.setXYZ(i,tint.r,tint.g,tint.b);
          }
        }
        if(humpback)for(let i=0;i<8;i++){
          const [x,y,z]=outline[i+1],size=.050-i*.0036;
          part(wing,"oval",i%3?back:0x596d76,[side*x,y,z],[size,.031-i*.002,size*.87]).name="Tubérculo da nadadeira";
        }
        const edge=whale?[
          [.16,-.025,-.13],[.38,-.031,-.108],[.59,-.065,-.026],[.84,-.11,.16],[.79,-.13,.249],
          [.66,-.12,.316],[.56,-.11,.29],[.47,-.10,.345],[.37,-.073,.308],[.26,-.058,.351],[.16,-.039,.298],[.06,-.02,.23],[0,-.014,.14]
        ]:[
          [.12,.013,-.12],[.27,.016,-.106],[.46,.0,-.047],[.68,-.043,.105],[.62,-.054,.225],
          [.49,-.030,.276],[.35,-.026,.285],[.19,-.015,.255],[.08,-.003,.194],[0,0,.12]
        ];
        fanFin(tailTip,[0,whale?.039:-.08,-.19],edge.map(([x,y,z])=>[side*x*(variant?.tail??(minke?.79:1)),(whale?.039:-.08)+y,z]),
          [back,whale?0x506676:look.fin,whale?0xc6d4d9:back],.039,detail?10:7).name=whale?"Lobo da cauda da baleia":"Lobo da cauda da orca";
      }
      const dorsal=slender?[
        [0,.39,.61],[0,.52,.81],[0,.68,1.00],[0,.79,1.24],[0,.61,1.18],[0,.45,1.23],[0,.29,1.47]
      ]:whale?[
        [0,.525,.38],[0,.58,.55],[0,.68,.75],[0,.78,.98],[0,.67,1.09],[0,.53,1.10],[0,.38,1.34]
      ]:[
        [0,.48,-.40],[0,.68,-.22],[0,.89,-.04],[0,1.09,.10],[0,1.24,.26],[0,1.05,.22],
        [0,.84,.19],[0,.65,.24],[0,.47,.46]
      ];
      const dorsalOutline=variant?dorsal.map(([x,y,z])=>{
        const nz=z+variant.shift,baseY=surface(nz,0)[1];
        return [x,baseY+(y-surface(z,0)[1])*variant.dorsal,nz];
      }):whale?dorsal:dorsal.map(([x,y,z])=>{
        const [height,width,sweep]=look.dorsal;
        const rise=Math.max(0,y-.47);
        return [x,.47+(y-.47)*height,z*width+sweep*(rise/1.14)**2];
      });
      if(!right){
        const anchor=variant?.82+variant.shift:whale?.69:-.05;
        fanFin(g,[0,variant?surface(anchor,0)[1]-.02:whale?.45:.46,anchor],dorsalOutline,
          [back,variant?.fin??(whale?0x415865:look.fin)],whale?.051:.064,detail?12:7).name=whale?"Nadadeira dorsal da baleia":"Nadadeira dorsal da orca";
      }
      const spouts=openings.map(([x])=>[x,surface(blowholeZ,x/(whale?.62:.58))[1]-.013,blowholeZ]);
      spouts.forEach((at,i)=>{
        const marker=hinge(g,...at);
        marker.name=whale?(i===0?"Espiráculo esquerdo da baleia":"Espiráculo direito da baleia"):"Espiráculo da orca";
      });
      if(kind==="brydes_whale"||kind==="sei_whale"){
        const ridges=kind==="brydes_whale"?[-.41,0,.41]:[0];
        for(const angle of ridges){
          const ridge=Array.from({length:12},(_,i)=>{
            const t=i/11,z=-2.20+t*.92;
            return [...surface(z,angle*Math.sin(Math.PI*t*.90),.008),.006+.019*Math.sin(Math.PI*t)];
          });
          dragonCurve(g,ridge,[variant.fin,back],detail?11:6).name="Crista do rostro";
        }
      }
      if(right){
        for(let row=0;row<4;row++)for(let i=0;i<7;i++){
          const z=-2.27+i*.151+row*.028,angle=(row-1.5)*.57+.09*Math.sin(i*2.21+row);
          if(row!==1&&i%3===2)continue;
          const at=surface(z,angle,.009),size=.021+(i+row)%4*.010;
          part(g,"oval",i%3?0xb2a98d:0xc8bea2,at,[size*1.34,size*.44,size*.86],[.17*Math.sin(i),angle,.12]).name="Calosidade da franca-austral";
        }
      }
      if(whale&&!right&&!sperm){
        const pleats=detail?[1,2,3,4,5,6,7]:[1,2,4,6,7],steps=detail?19:9;
        for(const side of [-1,1])for(const n of pleats){
          const frontZ=-2.25+n*.024,endZ=frontZ+2.18-n*.075;
          const groove=(start,end,parent)=>{
            const points=[];
            for(let i=0;i<=steps;i++){
              const z=T.MathUtils.lerp(start,end,i/steps),f=bound((z-frontZ)/(endZ-frontZ)),a=side*(Math.PI-n*(.089+.057*Math.sin(f*Math.PI)));
              const at=surface(z,a,.003);
              if(parent===jaw){at[1]-=jaw.position.y;at[2]-=jaw.position.z;}
              points.push([...at,.002+.005*Math.sin(f*Math.PI)]);
            }
            dragonCurve(parent,points,[0x607d8d,0x6a8594],detail?7:5).name="Prega ventral";
          };
          if(frontZ<mouthEnd)groove(frontZ,Math.min(endZ,mouthEnd),jaw);
          if(endZ>mouthEnd)groove(Math.max(frontZ,mouthEnd),endZ,g);
        }
        if(humpback)for(const side of [-1,1])for(let row=0;row<3;row++)for(let i=0;i<6-row;i++){
          const z=-2.30+i*(.126+row*.016)+row*.018,angle=side*(.22+row*.68+Math.sin(i*2.4+row)*.11);
          const [x,y]=surface(z,angle,.005);
          const size=.030+(i%3)*.006;
          part(g,"oval",(i+row)%4===0?0x536b77:back,[x,y,z],[size,.021+(i%2)*.008,size*.95]).name="Tubérculo do rostro";
        }
      }
      if(sperm)for(let i=0;i<4;i++){
        const z=1.43+i*.22,at=surface(z,0,-.013);
        part(g,"oval",back,at,[.050-i*.008,.044-i*.006,.077]);
      }
      return {group:g,tail,tailTip,wings,jaw,spouts,breach:whale?1.28:1.05,verticalTail:true,
        spoutLean:sperm?[-.34,-.48]:null,swimStyle:whale?"whale":"swim",biteAngle:sperm?.33:whale?.12:.34,jawRest:0,jawDrift:whale?.012:.009};
    }
    function weddellSeal(kind){
      const leopard=kind==="leopard_seal",harbor=kind==="harbor_seal",ringed=kind==="ringed_seal";
      const group=new T.Group(),wings=[],coat=leopard?0x46515e:harbor?0x7d7670:ringed?0x4d5659:0x657177,belly=0xa9b1ad;
      const profile=sculptSections(sculptSections([
        [-1.05,.115,.038,.043],[-.98,.146,.116,.107],[-.80,.173,.169,.146],[-.59,.101,.213,.189],
        [-.37,.034,.300,.247],[-.08,.021,.363,.283],[.29,.006,.353,.261],[.57,-.037,.266,.203],
        [.80,-.070,.147,.127],[.94,-.071,.074,.069],[1.00,-.069,.018,.020]
      ].map(([z,y,x,h])=>[z,leopard&&z<-.53?y-.06:y,leopard&&z>-.54?x*.81:x,h])));
      const pale=new T.Color(belly),dark=new T.Color(0x394550);
      const hull=contour(group,profile,[coat,belly],"",48,null,(color,z,a)=>{
        const spots=Math.max(0,Math.sin(z*63+a*13)*Math.cos(z*81-a*7))**5;
        const rings=ringed?Math.max(0,1-Math.abs(Math.sin(z*34+a*7)*Math.cos(z*21-a*12)-.61)*12)*.58:0;
        color.lerp(Math.cos(a)>.22&&!leopard?pale:dark,spots*(leopard?.85:.59)).lerp(pale,rings);
      },aquaticSkin);
      const {tail,tailTip}=anchoredSwimmer(group,hull,profile,48,.54,.91);
      eyes(group,.14,.215,-.89,.031);
      part(group,"oval",0x323b40,[0,.123,-1.035],[.077,.042,.035]);
      for(const side of [-1,1]){
        const wing=hinge(group,side*.27,-.118,-.29);
        wing.userData.side=side;wings.push(wing);
        fanFin(wing,[0,0,0],[[.03,0,-.12],[.26,-.067,-.025],[.43,-.11,.16],[.36,-.13,.28],[.09,-.03,.14]]
          .map(([x,y,z])=>[side*x,y,z]),[coat,belly],.025,7);
        fanFin(tailTip,[0,-.07,0],[[.015,-.07,-.03],[.16,-.081,.06],[.31,-.10,.27],[.24,-.11,.36],[.09,-.085,.275]]
          .map(([x,y,z])=>[side*x,y,z]),[coat,0x394550],.026,8);
      }
      return {group,tail,tailTip,wings,swimStyle:"swim",breathHeight:.22};
    }
    function plankton(kind){
      const group=new T.Group(),tail=hinge(group,0,0,0),positions=[],colors=[];
      const plant=kind==="phytoplankton",krill=kind==="antarctic_krill";
      for(let i=0;i<70;i++){
        const a=i*2.39996,r=.16+.79*Math.sqrt(i/70);
        positions.push(Math.cos(a)*r, Math.sin(i*1.77)*(.11+r*.23), Math.sin(a)*r*.78);
        const tint=new T.Color(plant?0x92df82:krill?0xff987d:0xbbddd0);
        tint.multiplyScalar(.65+.40*Math.sin(i*1.08)**2);colors.push(tint.r,tint.g,tint.b);
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute("position",new T.Float32BufferAttribute(positions,3));
      geo.setAttribute("color",new T.Float32BufferAttribute(colors,3));
      const mesh=new T.Points(geo,new T.PointsMaterial({size:krill?.075:.038,vertexColors:true,transparent:true,opacity:.61,depthWrite:false}));
      mesh.userData.ownMarineMaterial=true;tail.add(mesh);
      if(krill)for(let i=0;i<10;i++){
        const [x,y,z]=positions.slice(i*21,i*21+3);
        dragonCurve(tail,[[x-.064,y,z,.009],[x,y+.023,z,.019],[x+.037,y+.011,z,.015],[x+.062,y-.018,z,.005]],
          [0xe88579,0xffb197],6);
      }
      return {group,tail,wings:[],swimStyle:"plankton",stockVisual:tail};
    }
    function deepSquid(kind,detail){
      const colossal=kind==="colossal_squid",group=new T.Group(),tail=hinge(group,0,0,0),wings=[],arms=[];
      const coat=colossal?0x884741:0x9a5144,back=colossal?0xb97161:0xc47966,pale=colossal?0xd8a794:0xe0ab94;
      const mantle=colossal?[
        [-1.18,0,.024,.028],[-1.08,.016,.13,.12],[-.88,.020,.25,.215],[-.62,.018,.32,.275],
        [-.32,0,.335,.292],[-.05,-.012,.295,.262],[.18,-.014,.215,.198],[.28,-.022,.162,.150]
      ]:[
        [-1.34,0,.007,.012],[-1.22,.007,.068,.064],[-.98,.011,.132,.122],[-.68,.009,.176,.158],
        [-.36,.010,.188,.168],[-.10,-.004,.175,.154],[.14,-.012,.128,.118],[.22,-.020,.104,.100]
      ];
      const hull=contour(group,sculptSections(sculptSections(mantle)),[coat,pale],"",detail?54:28,null,
        (c,z,a)=>c.multiplyScalar(.87+.21*Math.sin(z*64+a*17)**2*Math.cos(z*37-a*11)**2),aquaticSkin);
      hull.name="Manto";
      const headWidth=colossal?.195:.134,eye=colossal?.098:.064,headZ=colossal?.32:.28;
      part(group,"oval",back,[0,-.002,headZ],[headWidth,headWidth*.84,colossal?.195:.165]).name="Cabeça da lula";
      for(const side of [-1,1]){
        part(group,"oval",coat,[side*(headWidth-.018),.026,headZ+.015],[eye*.78,eye*1.15,eye*1.20]);
        part(group,"oval",0x211e29,[side*(headWidth+eye*.24),.030,headZ+.028],[eye*.53,eye*.84,eye*.89]).name="Olho";
        part(group,"oval",0x99a8ac,[side*(headWidth+eye*.72),.050,headZ+.050],[eye*.10,eye*.25,eye*.19]);
        const fin=hinge(group,side*(colossal?.14:.056),.035,colossal?-.72:-1.10);
        fin.userData.side=side;wings.push(fin);
        const span=colossal?.42:.25,length=colossal?.52:.35;
        fanFin(fin,[0,0,0],[[0,0,-length*.73],[side*span*.50,.022,-length*.50],[side*span,.026,.07],
          [side*span*.68,-.032,length*.65],[side*span*.29,-.025,length],[0,-.012,length*.86]],[coat,back,pale],.030,detail?10:6).name="Nadadeira do manto";
      }
      for(let i=0;i<10;i++){
        const long=i>=8,a=long?(i===8?.19:Math.PI-.19):i*Math.PI/4,sx=Math.cos(a),sy=Math.sin(a);
        const z=long?(colossal?2.38:4.45):(colossal?1.08:1.18)+(i%3-1)*.065;
        const radius=long?(colossal?.038:.026):(colossal?.066:.042);
        const arm=hinge(group,sx*headWidth*.62,-.024+sy*headWidth*.56,headZ+.14);
        arm.userData.restYaw=sx*(long?.09:.20);
        arm.userData.restPitch=-sy*.18+.065;
        arm.rotation.set(arm.userData.restPitch,arm.userData.restYaw,0);
        const jointAt=[sx*z*(long?.022:.048),sy*z*(long?.018:.036),z*.53],terminal=hinge(arm,...jointAt);
        arm.userData.tip=terminal;arm.userData.long=long;arms.push(arm);
        const divisions=detail?12:7;
        dragonCurve(arm,[[0,0,0,radius],[sx*z*(long?.020:.042),sy*z*(long?.016:.030),z*.24,radius*.86],
          [...jointAt,radius*.52]],[coat,back],divisions).name=long?"Tentáculo de captura":"Braço";
        dragonCurve(terminal,[[0,0,0,radius*.54],[-sx*z*(long?.008:.016),sy*z*(long?.012:.024),z*.23,radius*(long?.46:.37)],
          [-sx*z*(long?.028:.058),sy*z*(long?.020:.042),z*.47,long?radius*.27:.004]],[back,coat],divisions);
        const clubAt=[-sx*z*(long?.022:.050),sy*z*(long?.016:.034),z*.415];
        if(long)part(terminal,"oval",back,clubAt,[radius*1.38,radius*1.05,z*(colossal?.086:.066)]).name="Extremidade do tentáculo";
        for(let j=0;j<(detail?7:3);j++){
          const t=(j+1)/(detail?9:5),width=radius*(long?.53:.62)*(1-t*.30);
          const x=-sx*z*(long?.026:.054)*t,y=-radius*.34+sy*z*(long?.018:.038)*t,zz=long?z*(.34+t*.12):z*.43*t;
          for(const side of [-1,1]){
            part(terminal,"oval",pale,[x+side*width*.46,y,zz],[width*.37,width*.22,width*.46]).name="Ventosa";
            if(colossal&&long)dragonCurve(terminal,[[x+side*width,y,zz,width*.23],
              [x+side*width,y-width*.8,zz+width*.21,width*.17],
              [x+side*width*.79,y-width,zz-width*.25,.0018]],[0xcda597,0xeeeece],5).name="Gancho";
          }
        }
      }
      return {group,tail,wings,arms,swimStyle:"squid"};
    }
    function cephalopod(kind){
      const squid=kind==="coastal_squid",group=new T.Group(),tail=hinge(group,0,0,0),wings=[];
      const coat=squid?0xb97e74:0x995e5a,pale=squid?0xe7a995:0xe1a88a;
      const mantle=squid?[[-.59,0,.013,.017],[-.49,0,.077,.075],[-.31,0,.131,.118],[-.10,-.011,.126,.106],[.14,-.014,.102,.095]]:
        [[-.36,.039,.035,.04],[-.30,.067,.21,.172],[-.15,.079,.272,.222],[.04,.05,.227,.190],[.20,-.024,.118,.11]];
      contour(group,sculptSections(sculptSections(mantle)),[coat,pale],"",40,null,
        (c,z,a)=>c.multiplyScalar(.81+.31*Math.sin(z*84+a*23)**2*Math.cos(z*39-a*18)**2),aquaticSkin);
      part(group,"oval",coat,[0,-.019,.174],[squid?.117:.157,.106,.129]);
      eyes(group,squid?.101:.139,.008,.215,.043);
      if(squid)for(const side of [-1,1]){
        const flap=hinge(group,side*.077,-.004,-.35);
        flap.userData.side=side;wings.push(flap);
        fanFin(flap,[0,0,.12],[[0,0,-.20],[side*.18,-.02,-.09],[side*.221,-.022,.048],[side*.12,-.015,.16],[0,0,.245]],
          [pale,coat],.014,7);
      }
      const arms=[];
      for(let i=0;i<(squid?10:8);i++){
        const a=i*Math.PI*2/(squid?10:8),dx=Math.cos(a),dz=Math.sin(a),reach=squid?(i<2?.73:.44):.57+(i%3)*.055;
        const arm=hinge(group,dx*.080,-.044+(squid?dz*.07:0),.244);arms.push(arm);
        const points=squid?[[0,0,0,.043],[dx*.09,dz*.09,.16,.032],[dx*.12,dz*.12,reach*.74,.017],[dx*.15,dz*.15,reach,.006]]:
          [[0,0,0,.061],[dx*.21,-.09,dz*.17,.051],[dx*.38,-.161,dz*.35,.031],[dx*reach,-.126,dz*reach,.008]];
        dragonCurve(arm,points,[coat,pale],12);
        for(let j=1;j<5;j++){
          const t=j/6,tip=points.at(-1);
          part(arm,"oval",pale,[tip[0]*t,tip[1]*t-.032,tip[2]*t],[.025-t*.012,.012,.024-t*.011]);
        }
      }
      return {group,tail,wings,arms,swimStyle:squid?"squid":"octopus"};
    }
    function adeliePenguin(){
      const group=new T.Group(),tail=hinge(group,0,0,.37),wings=[],feet=[];
      const shell=sculptSections(sculptSections([[-.54,.04,.025,.029],[-.46,.042,.099,.093],[-.32,.018,.123,.126],
        [-.23,0,.141,.137],[-.04,-.005,.198,.176],[.15,.003,.181,.153],[.33,.036,.121,.095],[.45,.06,.031,.031]]));
      contour(group,shell,[0x1c2631,0xf3f1e5],"",48,null,(c,z,a)=>{
        const blue=new T.Color(0x222a34),white=new T.Color(0xf6f4e8),shade=Math.cos(a);
        c.copy(blue).lerp(white,T.MathUtils.smoothstep(-shade,.23,.48)*(z>-.28?1:.07));
      },aquaticSkin);
      for(const side of [-1,1]){
        const wing=hinge(group,side*.13,-.03,-.15);
        wing.userData.side=side;wings.push(wing);
        fanFin(wing,[0,0,0],[[0,0,-.05],[side*.19,-.055,-.017],[side*.30,-.08,.22],[side*.25,-.075,.29],[0,-.04,.12]],
          [0x262e37,0x516476],.022,8);
        const foot=hinge(group,side*.072,-.082,.302);feet.push(foot);
        part(foot,"oval",0xb49b8f,[0,-.022,.145],[.061,.031,.097],[0,side*.18,0]);
        const eye=part(group,"oval",0xe6ecea,[side*.097,.051,-.395],[.018,.032,.036]);
        eye.name="Anel branco do olho";
        part(group,"oval",0x101319,[side*.111,.053,-.397],[.011,.015,.018]);
      }
      dragonCurve(group,[[0,.007,-.462,.042],[0,-.006,-.552,.029],[0,-.013,-.613,.003]],[0x242229,0xa06b57],9);
      return {group,tail,wings,feet,swimStyle:"penguin",breathHeight:.16};
    }
    let brainCoralCache=null;
    function brainCoralAssets(){
      if(brainCoralCache)return brainCoralCache;
      let seed=71337;
      const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
      const ss=(e0,e1,x)=>{const t=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return t*t*(3-2*t)};
      const G=9,pts=[];
      for(let gy=0;gy<G;gy++)for(let gx=0;gx<G;gx++){
        pts.push({x:(gx+.18+rand()*.64)/G,y:(gy+.18+rand()*.64)/G,group:gy*G+gx,size:.85+rand()*.30});
      }
      const groupSize=new Int32Array(G*G).fill(1);
      const find=i=>pts[i].group===i?i:(pts[i].group=find(pts[i].group));
      for(let i=0;i<pts.length;i++){
        if(rand()>.62)continue;
        const gx=i%G,gy=Math.floor(i/G);
        const nbrs=[gy*G+(gx+1)%G,((gy+1)%G)*G+gx,((gy+1)%G)*G+(gx+1)%G];
        const j=nbrs[Math.floor(rand()*nbrs.length)],ra=find(i),rb=find(j);
        if(ra!==rb&&groupSize[ra]+groupSize[rb]<=3){pts[rb].group=ra;groupSize[ra]+=groupSize[rb]}
      }
      for(let i=0;i<pts.length;i++)pts[i].group=find(i);
      const wrapD=d=>d>.5?d-1:d<-.5?d+1:d;
      function fieldAt(u0,v0){
        const u=u0+.018*Math.sin(v0*Math.PI*6+.8)+.010*Math.cos((u0+v0)*Math.PI*10);
        const v=v0+.018*Math.cos(u0*Math.PI*6-.5)+.010*Math.sin((u0-v0)*Math.PI*10);
        const cgx=((Math.floor(u*G)%G)+G)%G,cgy=((Math.floor(v*G)%G)+G)%G;
        let d1=9,g1=-1,d2=9;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          const p=pts[((cgy+dy+G)%G)*G+((cgx+dx+G)%G)];
          const d=Math.hypot(wrapD(u-p.x),wrapD(v-p.y))*p.size;
          if(d<d1){if(p.group!==g1)d2=d1;d1=d;g1=p.group}
          else if(p.group!==g1&&d<d2)d2=d;
        }
        return (d2-d1)*G;
      }
      const W=384,E=new Float32Array(W*W),H=new Float32Array(W*W),GX=new Float32Array(W*W),GY=new Float32Array(W*W),noise=new Float32Array(W*W);
      for(let y=0;y<W;y++)for(let x=0;x<W;x++){
        const idx=y*W+x,e=fieldAt(x/W,y/W);
        E[idx]=e;
        H[idx]=1-ss(.04,.56,e);
        noise[idx]=rand();
      }
      // Gradient of unclamped valley distance E points smoothly from valley center all the way to the white ridge crest
      for(let y=0;y<W;y++)for(let x=0;x<W;x++){
        const xm=(x-1+W)%W,xp=(x+1)%W,ym=(y-1+W)%W,yp=(y+1)%W;
        const gx=E[y*W+xm]-E[y*W+xp],gy=E[ym*W+x]-E[yp*W+x],len=Math.hypot(gx,gy)||1;
        GX[y*W+x]=gx/len;GY[y*W+x]=gy/len;
      }
      const rgba=new Uint8Array(W*W*4),bump=new Uint8Array(W*W*4);
      for(let y=0;y<W;y++)for(let x=0;x<W;x++){
        const idx=y*W+x,h=H[idx],e=E[idx];
        let acc=0,wsum=0,px=x,py=y;
        for(let s=0;s<10;s++){
          const ix=((Math.round(px)%W)+W)%W,iy=((Math.round(py)%W)+W)%W,wt=1-s/11;
          acc+=noise[iy*W+ix]*wt;wsum+=wt;
          px+=GX[iy*W+ix]*1.15;py+=GY[iy*W+ix]*1.15;
        }
        px=x;py=y;
        for(let s=1;s<10;s++){
          const ix=((Math.round(px)%W)+W)%W,iy=((Math.round(py)%W)+W)%W,wt=1-s/11;
          acc+=noise[iy*W+ix]*wt;wsum+=wt;
          px-=GX[iy*W+ix]*1.15;py-=GY[iy*W+ix]*1.15;
        }
        const septa=ss(.38,.62,acc/wsum),grain=(noise[idx]-.5)*13;
        const centerPit=ss(.34,.66,e);
        // Deep brown valley crease -> radiating creamy-white & warm tan septa walls -> puffy ivory-white calcified ridges
        let r=86+46*(1-centerPit),g=63+35*(1-centerPit),b=38+24*(1-centerPit);
        const tooth=septa*(.42+.58*ss(.08,.76,h))*(1-centerPit*.45);
        r=r*(1-tooth*.76)+232*(tooth*.76);
        g=g*(1-tooth*.76)+227*(tooth*.76);
        b=b*(1-tooth*.76)+218*(tooth*.76);
        const wall=ss(.40,.74,h+(septa-.5)*.22);
        const wr=242-(1-septa)*20+grain*.55,wg=240-(1-septa)*21+grain*.55,wb=235-(1-septa)*22+grain*.55;
        r=r*(1-wall)+wr*wall+grain*(1-wall)*.4;
        g=g*(1-wall)+wg*wall+grain*(1-wall)*.4;
        b=b*(1-wall)+wb*wall+grain*(1-wall)*.4;
        const ao=1-.30*centerPit*(1-septa*.35);
        rgba[idx*4]=Math.max(0,Math.min(255,Math.round(r*ao)));
        rgba[idx*4+1]=Math.max(0,Math.min(255,Math.round(g*ao)));
        rgba[idx*4+2]=Math.max(0,Math.min(255,Math.round(b*ao)));
        rgba[idx*4+3]=255;
        const bh=Math.max(0,Math.min(255,Math.round((h*.68+septa*.32)*255)));
        bump[idx*4]=bump[idx*4+1]=bump[idx*4+2]=bh;bump[idx*4+3]=255;
      }
      const makeTex=(data,srgb)=>{
        const tex=new T.DataTexture(data,W,W,T.RGBAFormat);
        tex.wrapS=tex.wrapT=T.RepeatWrapping;
        tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;
        tex.generateMipmaps=true;
        if(srgb)tex.encoding=T.sRGBEncoding;
        tex.needsUpdate=true;
        return tex;
      };
      const map=makeTex(rgba,true),bumpMap=makeTex(bump,false);
      const coralMat=new T.MeshStandardMaterial({map,bumpMap,bumpScale:.028,roughness:.88,metalness:.02});
      const sampleH=(u,v)=>{
        const x=((Math.round(u*W)%W)+W)%W,y=((Math.round(v*W)%W)+W)%W;
        return H[y*W+x];
      };
      brainCoralCache={material:coralMat,sampleH};
      return brainCoralCache;
    }
    function seafloorLife(kind,detail=true){
      const group=new T.Group(),tail=hinge(group,0,0,0),stems=[];
      if(kind==="sea_star"){
        for(let i=0;i<5;i++){
          const a=i*2*Math.PI/5,x=Math.cos(a),z=Math.sin(a);
          dragonCurve(group,[[0,.09,0,.118],[x*.19,.073,z*.19,.108],[x*.36,.042,z*.36,.063],[x*.57,.027,z*.57,.013]],
            [0xa95030,0xdba04d],12,[0,1,0]);
          for(let j=1;j<6;j++)part(group,"oval",0xf0ac58,[x*.082*j,.136-j*.014,z*.082*j],[.019,.015,.019]);
        }
        part(group,"oval",0xac512d,[0,.09,0],[.16,.096,.16]);
      }else if(kind==="rock_mussel"){
        part(group,"oval",0x6a7772,[0,.04,0],[.38,.09,.30]);
        for(let i=0;i<12;i++){
          const a=i*2.40,r=.07+.24*(i/12);
          part(group,"oval",i%3?0x302e38:0x524454,[Math.cos(a)*r,.13+(i%4)*.015,Math.sin(a)*r],[.059,.075,.122],[a*.15,a,.73]);
        }
      }else if(kind==="brain_coral"){
        const {material:coralMat,sampleH}=brainCoralAssets();
        const rings=detail?34:18,segs=detail?72:36,maxPhi=Math.PI*.56;
        const pos=[],uv=[],idx=[];
        for(let r=0;r<=rings;r++){
          const frac=r/rings,phi=frac*maxPhi,sinP=Math.sin(phi),cosP=Math.cos(phi);
          for(let s=0;s<=segs;s++){
            const theta=s/segs*Math.PI*2,cosT=Math.cos(theta),sinT=Math.sin(theta);
            const u=.5+frac*.47*cosT,v=.5+frac*.47*sinT;
            const lobe=1+.082*Math.sin(theta*3+.45)*sinP*sinP+.052*Math.cos(theta*5-1.1)*sinP*sinP+.034*Math.sin(theta*2+1.8)*sinP;
            const bump=(sampleH(u,v)-.44)*(.052*(1-.25*frac*frac));
            const rad=.46*lobe+bump;
            const x=rad*sinP*cosT,z=rad*sinP*sinT;
            const baseY=(.31*lobe+bump*.85)*cosP+.048;
            pos.push(x,Math.max(.004,baseY),z);
            uv.push(u,v);
          }
        }
        const stride=segs+1;
        for(let r=0;r<rings;r++)for(let s=0;s<segs;s++){
          const a=r*stride+s,b=a+1,c=a+stride,d=c+1;
          idx.push(a,b,c,b,d,c);
        }
        // Close calcareous underside so there is no gap when rotated from below in the 3D catalog
        const baseCenter=pos.length/3;
        pos.push(0,.004,0);uv.push(.5,.5);
        const rimStart=rings*stride;
        for(let s=0;s<segs;s++)idx.push(baseCenter,rimStart+s,rimStart+s+1);
        const dome=new T.BufferGeometry();
        dome.setAttribute("position",new T.Float32BufferAttribute(pos,3));
        dome.setAttribute("uv",new T.Float32BufferAttribute(uv,2));
        dome.setIndex(idx);dome.computeVertexNormals();
        const mesh=new T.Mesh(dome,coralMat);
        mesh.name="Colônia de coral-cérebro (Diploria labyrinthiformis)";
        mesh.castShadow=mesh.receiveShadow=true;
        group.add(mesh);
      }else if(kind==="branching_coral"){
        part(group,"oval",0x9d7870,[0,.05,0],[.34,.077,.28]);
        for(let i=0;i<9;i++){
          const a=i*2.399,x=Math.cos(a),z=Math.sin(a),h=.29+.32*Math.sin(i*.87)**2;
          dragonCurve(group,[[x*.07,.03,z*.07,.063],[x*.17,h*.72,z*.15,.047],[x*.28,h,z*.25,.023]],[0xb36164,0xf3a178],12);
          const fork=[x*.16,h*.59,z*.16,.042];
          for(const sign of [-1,1])dragonCurve(group,[fork,[x*.25+sign*z*.07,h*.88,z*.23-sign*x*.07,.025],
            [x*.28+sign*z*.10,h*1.09,z*.25-sign*x*.10,.012]],[0xc36b63,0xffc090],10);
        }
      }else if(kind==="sea_anemone"){
        part(group,"oval",0x893e57,[0,.125,0],[.22,.15,.21]);
        part(group,"oval",0xce827e,[0,.22,0],[.234,.067,.23]);
        for(let i=0;i<23;i++){
          const a=i*2.39996,r=.092+.104*(i%4)/3,x=Math.cos(a),z=Math.sin(a);
          const stem=hinge(group,x*r,.22,z*r);stems.push(stem);
          dragonCurve(stem,[[0,0,0,.027],[x*.06,.115,z*.04,.024],[x*.13,.225+(i%3)*.034,z*.10,.010]],
            [0xc97779,0xf5b0ad],9);
        }
      }else{
        const kelp=kind==="kelp",weed=kind==="waterweed";
        const base=kelp?0x65502b:weed?0x2c703e:0x317c59,light=kelp?0xb28b3f:weed?0x8fb56a:0x77b779;
        for(let i=0;i<(weed?6:9);i++){
          const a=i*2.39996,x=Math.cos(a),z=Math.sin(a),h=(kelp?.78:weed?.62:.52)+.32*Math.sin(i*.72)**2;
          const stem=hinge(group,x*.09,.016,z*.09);stems.push(stem);
          if(weed){
            dragonCurve(stem,[[0,0,0,.014],[x*.06,h*.52,z*.06,.013],[x*.14,h,z*.14,.008]],[base,light],7);
            for(let tier=1;tier<=4;tier++)for(let leaf=0;leaf<3;leaf++){
              const b=a+leaf*Math.PI*2/3+tier*.53,dx=Math.cos(b),dz=Math.sin(b),y=h*tier/5;
              fanFin(stem,[x*.03,y,z*.03],[[dx*.09,y+.032,dz*.09],[dx*.17,y+.067,dz*.17],
                [dx*.10+dz*.028,y+.016,dz*.10-dx*.028]],[base,light],.007,4);
            }
          }else{
            const w=kelp?.105:.034;
            fanFin(stem,[x*.06,h*.31,z*.08],[[0,0,0],[x*.11+z*w,h*.37,z*.12-x*w],[x*.25+z*w,h*.73,z*.21-x*w],
              [x*.43,h,z*.40],[x*.31-z*w,h*.69,z*.24+x*w],[x*.12-z*w,h*.32,z*.08+x*w]],[base,light],.009,8);
          }
        }
      }
      return {group,tail,wings:[],stems,swimStyle:"benthic"};
    }
    function verticalHull(parent,sections,colors,segments=30,paint=null){
      return contour(parent,sculptSections(sculptSections(sections)),colors,"",segments,
        ([y,z,xr,zr],a)=>[Math.sin(a)*xr,y,z-Math.cos(a)*zr],paint,aquaticSkin);
    }
    function humanFace(head,{skin,light,iris,eyebrow,width=1,mood=""}){
      const smile=mood==="smile",stern=mood==="stern";
      verticalHull(head,[[-.177,.028,.067*width,.072],[-.133,.013,.108*width,.118],
        [-.071,.011,.143*width,.142],[.007,.014,.163*width,.151],[.069,.028,.171*width,.160],
        [.131,.033,.144*width,.139],[.182,.036,.093*width,.094],[.211,.039,.021,.026]],
        [skin,light],32).name="Rosto, maçãs e maxilar";
      const mouth=hinge(head,0,-.119,-.118);
      part(mouth,"oval",skin,[0,-.014,.006],[.077*width,.042,.039]);
      dragonCurve(mouth,[[-.067*width,.006,-.013,.003],[0,-.009,-.035,.012],[.067*width,.008,-.013,.003]],
        [pigment(skin,false),skin],11).name="Lábio inferior";
      dragonCurve(head,[[-.073*width,smile?-.098:-.115,-.132,.003],[0,-.113,-.160,smile?.014:.008],
        [.073*width,smile?-.098:-.115,-.132,.003]],[pigment(skin,false),skin],13).name=smile?"Sorriso enviesado":"Abertura da boca";
      if(smile)dragonCurve(head,[[-.066*width,-.102,-.141,.001],[0,-.111,-.171,.006],
        [.069*width,-.098,-.140,.001]],[0xe8c7aa,0xc8a38e],10).userData.noShadow=true;
      dragonCurve(head,[[0,.040,-.132,.018],[0,-.011,-.154,.029],[0,-.054,-.188,.036],[0,-.073,-.154,.015]],
        [skin,light],15).name="Nariz";
      for(const side of [-1,1]){
        const eyeGroup=hinge(head,side*.080*width,.027,-.125);
        eyeGroup.rotation.y=-side*.31;eyeGroup.userData.entityEye=true;
        part(eyeGroup,"oval",eyebrow,[0,0,0],[.051,.033,.024]);
        part(eyeGroup,"oval",stern?0xb06536:0xe2ddce,[0,0,-.016],[.041,stern?.013:smile?.027:.024,.014]);
        part(eyeGroup,"oval",iris,[0,.002,-.027],[.022,stern?.014:.022,.013],[0,0,0],stern);
        part(eyeGroup,"oval",0x231f27,[0,.002,-.039],[.011,.015,.008]);
        part(eyeGroup,"oval",0xf6f4e1,[-.008,.010,-.046],[.005,.006,.004]);
        dragonCurve(head,[[side*.037*width,stern?.048:.066,-.127,.006],[side*.084*width,stern?.069:.074,-.135,stern?.015:.010],
          [side*.130*width,stern?.086:.056,-.112,.004]],[eyebrow,pigment(eyebrow,true)],12).name="Sobrancelha";
        part(head,"oval",skin,[side*.164*width,-.023,.019],[.036,.065,.037],[.13,side*.22,side*.19]);
        part(head,"oval",pigment(skin,false),[side*.180*width,-.025,-.004],[.013,.032,.013],[.13,side*.22,side*.19]);
        part(head,"oval",light,[side*.036,-.066,-.165],[.024,.014,.016]);
      }
      return mouth;
    }
    function organicArm(parent,rig,side,x,y,z,length,width,skin,accent,clawed=false,webbing=null){
      const upper=hinge(parent,side*x,y,z);
      upper.userData.side=side;rig.arms.push(upper);
      dragonCurve(upper,[[0,.095,0,width*.60],[side*.02,.018,0,width],
        [side*.017,-length*.27,.01,width*.83],[0,-length*.52,0,width*.57]],
        [skin,accent],20,[0,0,1]).name="Ombro e braço";
      const lower=hinge(upper,0,-length*.48,0);upper.userData.lower=lower;
      dragonCurve(lower,[[0,.068,0,width*.58],[0,-.018,-.006,width*.69],
        [0,-length*.24,-.027,width*.60],[0,-length*.46,-.034,width*.39]],
        [skin,accent],19,[0,0,1]).name="Cotovelo e antebraço";
      const hand=hinge(lower,0,-length*.48,-.035);
      if(webbing){
        swimmingHand(hand,side,skin,accent,webbing);
        return {upper,lower,hand};
      }
      part(hand,"oval",skin,[0,-.025,0],[width*.57,width*.68,width*.36]);
      for(let n=0;n<4;n++){
        const at=(n-1.5)*width*.264,end=(clawed?.91:.65)*width*(1-Math.abs(n-1.45)*.08);
        dragonCurve(hand,[[at,-width*.33,0,width*.153],[at,-width*.61,-.019,width*.133],
          [at,-end-width*.22,-.029,width*.067]],[skin,accent],10,[0,0,1]);
        if(clawed)dragonHorn(hand,[[at,-end-width*.12,-.025,.022],[at,-end-width*.56,-.035,.012],
          [at,-end-width*.70,-.056,.001]],[0xb5a58d,0xe0d5ac]);
      }
      part(hand,"oval",accent,[-side*width*.41,-width*.30,-.011],[width*.166,width*.33,width*.18],[0,0,-side*.56]);
      return {upper,lower,hand};
    }
    function organicLeg(parent,rig,x,y,z,length,width,skin,accent,phase,footDirection=-1,hoof=false,webbing=null){
      const upper=hinge(parent,x,y,z);upper.userData.phase=phase;rig.legs.push(upper);
      dragonCurve(upper,[[0,.09,.02,width*.64],[0,.012,.023,width],
        [.009,-length*.27,-.014,width*.84],[0,-length*.55,-.018,width*.64]],
        [skin,accent],20,[0,0,1]).name="Quadril e coxa";
      const lower=hinge(upper,0,-length*.48,-.018);upper.userData.lower=lower;
      dragonCurve(lower,[[0,.082,0,width*.65],[0,-.025,.007,width*.68],
        [0,-length*.28,.022,width*.49],[0,-length*.51,.006,width*.38]],
        [skin,accent],19,[0,0,1]).name="Joelho e canela";
      const foot=hinge(lower,0,-length*.492,.006);foot.name=hoof?"Casco":footDirection>0?"Pé voltado para trás":"Pé";
      if(webbing){
        swimmingFoot(foot,Math.sign(x),skin,accent,webbing);
        return {upper,lower,foot};
      }
      if(hoof)part(foot,"facet",accent,[0,-.045,-.026],[width*1.37,.116,width*1.75],[.13,0,0]);
      else{
        part(foot,"oval",skin,[0,-.022,footDirection*width*.55],[width*.78,.065,width*1.27],[.10*footDirection,0,0]);
        for(let i=-2;i<=2;i++)part(foot,"oval",accent,[i*width*.277,-.022,footDirection*(width*1.48-Math.abs(i)*.016)],
          [width*.167,.034,width*.29]);
      }
      return {upper,lower,foot};
    }
    const finMembrane=new T.MeshStandardMaterial({vertexColors:true,roughness:.53,transparent:true,opacity:.68,side:T.DoubleSide,depthWrite:false});
    let scaleSkin;
    function hybridScales(mesh,rings,segments,around,along=1){
      if(!scaleSkin){
        const size=512,color=new Uint8Array(size*size*4),relief=new Uint8Array(size*size*4);
        for(let y=0;y<size;y++)for(let x=0;x<size;x++){
          const row=(y+.5)*12/size,off=Math.floor(row)%2*.5;
          const u=((x+.5)*8/size+off)%1-.5,v=row%1;
          const overlap=v-(.14+.76*(1-Math.sqrt(Math.max(0,1-4*u*u))));
          const rim=Math.exp(-((overlap/.083)**2)),seam=Math.exp(-(((overlap+.09)/.045)**2));
          const grain=Math.sin(x*1.713+y*.311)*Math.sin(y*2.017-x*.483);
          const tone=211+34*rim-35*seam+7*grain;
          color.set([tone,tone+4,tone+6,255],(y*size+x)*4);
          const bump=120+95*rim-68*seam;
          relief.set([bump,bump,bump,255],(y*size+x)*4);
        }
        const texture=data=>{
          const map=new T.DataTexture(data,size,size,T.RGBAFormat);
          map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;
          map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;
          return map;
        };
        scaleSkin=new T.MeshStandardMaterial({vertexColors:true,map:texture(color),bumpMap:texture(relief),
          bumpScale:.011,metalness:.16,roughness:.42});
      }
      const source=mesh.geometry,index=source.index.array,geometry=source.toNonIndexed(),uv=[];
      for(let i=0;i<index.length;i+=3){
        const columns=[index[i]%segments,index[i+1]%segments,index[i+2]%segments];
        const seam=Math.max(...columns)-Math.min(...columns)>segments*.5;
        for(let j=0;j<3;j++){
          const u=seam&&columns[j]<segments*.5?columns[j]+segments:columns[j];
          uv.push(u/segments*around,Math.floor(index[i+j]/segments)/(rings-1)*along);
        }
      }
      geometry.setAttribute("uv",new T.Float32BufferAttribute(uv,2));
      source.dispose();mesh.geometry=geometry;mesh.material=scaleSkin;
    }
    function digitWeb(parent,paths,colors,name){
      for(let i=1;i<paths.length;i++){
        const [a0,a1,a2]=paths[i-1], [b0,b1,b2]=paths[i];
        const edge=(a,b,t)=>a.slice(0,3).map((v,k)=>T.MathUtils.lerp(v,b[k],t));
        const a=edge(a1,a2,.51),b=edge(b1,b2,.51),fold=edge(a,b,.5);
        fold[1]+=.016;
        const web=fanFin(parent,edge(a0,b0,.5),[a0.slice(0,3),a,fold,b,b0.slice(0,3)],colors,.003,4);
        if(web){web.material=finMembrane;web.name=name}
      }
    }
    function swimmingHand(hand,side,skin,accent,webbing){
      dragonCurve(hand,[[0,.013,.005,.035,.025],[0,-.024,.003,.047,.023],
        [side*.004,-.058,-.004,.050,.021],[side*.004,-.079,-.012,.039,.015]],
        [skin,accent],20,[0,0,1]).name="Palma com arco dos nós dos dedos";
      const fingers=[.075,.095,.086,.060].map((length,i)=>{
        const x=(i-1.5)*.025*side,y=-.068+Math.abs(i-1.2)*.005;
        return [[x,y,.001,.013],[x*1.22,y-length*.46,-.009,.011],
          [x*1.43,y-length*.78,-.024,.008],[x*1.46,y-length,-.036,.004]];
      });
      const thumb=[[-side*.029,-.029,.004,.018],[-side*.058,-.048,-.003,.015],
        [-side*.073,-.071,-.020,.011],[-side*.071,-.090,-.035,.006]];
      for(const path of [thumb,...fingers])dragonCurve(hand,path,[skin,accent],13,[0,0,1]).name=path===thumb?"Polegar articulado":"Dedo afilado";
      digitWeb(hand,[thumb,...fingers],webbing,"Membrana interdigital da mão");
    }
    function swimmingFoot(foot,side,skin,accent,webbing){
      dragonCurve(foot,[[0,-.017,.047,.040,.036],[0,-.026,.003,.055,.037],
        [side*.007,-.029,-.073,.067,.029],[side*.003,-.033,-.119,.065,.022]],
        [skin,accent],20,[0,1,0]).name="Calcanhar, peito e planta do pé";
      const toes=Array.from({length:5},(_,i)=>{
        const x=(i-2)*.025*side,len=.077-i*.008,base=-.099-Math.max(0,2-i)*.009;
        return [[x,-.028,base,.015-i*.001],[x*1.20,-.034,base-len*.44,.013-i*.001],
          [x*1.27,-.044,base-len*.76,.010-i*.001],[x*1.29,-.049,base-len,.006-i*.0006]];
      });
      for(const path of toes)dragonCurve(foot,path,[skin,accent],11,[0,1,0]).name="Dedo do pé";
      digitWeb(foot,toes,webbing,"Membrana interdigital do pé");
    }
    function swimmingHybrid(type){
      const headFish=type==="fishfolk_head"||type==="fishwoman_head",mermaid=type==="mermaid",g=new T.Group();
      const femaleHead=type==="fishwoman_head",femaleTail=type==="fishwoman_tail",narrow=mermaid||femaleHead||femaleTail;
      const palettes={
        fishfolk_head:[0x85814f,0xbbad7d,0x456d57,0x8dbed6],
        fishfolk_tail:[0x9e7867,0xd6a892,0x3b6686,0x8dbed6],
        mermaid:[0xa86f59,0xd3a082,0x287e85,0x80d2b5],
        fishwoman_head:[0x708872,0xc8c7a1,0x2b6561,0xe1be69],
        fishwoman_tail:[0x8d5848,0xc58d6d,0x564783,0xd884a1]
      };
      const [skin,light,scales,lustre]=palettes[type],dark=0x293943;
      const swimmer=hinge(g,0,-.055,0),rig={arms:[],legs:[]},wings=[];
      const upper=verticalHull(swimmer,[[-.29,.028,.17,.15],[-.20,.018,.214,.16],[-.04,.013,.202,.148],
        [.17,.006,narrow?.23:.25,.164],[.33,.012,narrow?.245:.302,.167],[.43,.014,.238,.129],
        [.50,.017,.14,.099],[.57,.015,.095,.087]],[skin,light],36,(color,y,a)=>{
          if(y<.03||Math.abs(Math.sin(a))>.83)color.lerp(new T.Color(scales),y<.03?.77:.50);
          if(Math.cos(a)>.42&&y>.15&&y<.36)color.lerp(new T.Color(mermaid?0x42688f:scales),.77);
          color.multiplyScalar(.94+.10*Math.sin(y*105+a*19)**2);
        });
      upper.name="Tronco contínuo do nadador";
      hybridScales(upper,upper.geometry.attributes.position.count/36,36,2,1.8);
      for(const side of [-1,1]){
        const limb=organicArm(swimmer,rig,side,narrow?.221:.268,.371,.018,.60,.103,skin,light,false,[scales,lustre]);
        const web=fanFin(limb.lower,[0,-.03,.033],[[side*.069,-.07,.042],[side*.131,-.141,.081],
          [side*.088,-.202,.094],[0,-.273,.057],[0,-.18,.025]],[scales,lustre],.012,5);
        if(web)web.material=finMembrane;
      }
      const head=hinge(swimmer,0,.658,-.017);
      let jaw,tail,tailTip;
      if(headFish){
        const fishHead=contour(head,sculptSections([[-.32,-.025,.118,.089],[-.24,.02,.173,.139],[-.12,.047,.190,.205],
          [.023,.037,.161,.188],[.147,.013,.116,.128]]),[scales,light],"",36,null,(c,z,a)=>{
          c.multiplyScalar(.84+.22*Math.cos(a*17+z*90)**2);
        },aquaticSkin);
        fishHead.name="Cabeça de peixe";
        hybridScales(fishHead,fishHead.geometry.attributes.position.count/36,36,1);
        jaw=aquaticMouth(head,[0,-.048,-.235],.142,.058,.118,scales,light,5);
        eyes(head,.154,.077,-.188,.041);
        const crest=fanFin(head,[0,.147,-.103],[[0,.163,-.223],[0,.271,-.11],[0,.299,.010],
          [0,.209,.101],[0,.105,.155]],[scales,lustre],.018,6);
        if(crest)crest.material=finMembrane;
        for(const side of [-1,1]){
          if(femaleHead){
            const cheek=fanFin(head,[side*.157,.058,-.041],[[side*.194,.126,-.009],[side*.29,.172,.062],
              [side*.274,.057,.078],[side*.184,-.049,.037]],[scales,lustre],.012,6);
            if(cheek)cheek.material=finMembrane;
          }
          dragonCurve(head,[[side*.162,.115,-.107,.009],[side*.181,.063,-.053,.012],[side*.167,-.053,-.046,.010],
            [side*.13,-.120,-.071,.003]],[dark,lustre],12).name="Fenda branquial";
          const leg=organicLeg(swimmer,rig,side*.116,-.208,.036,.71,.107,skin,light,side>0?Math.PI:0,-1,false,[scales,lustre]);
          const heel=fanFin(leg.lower,[0,-.14,.043],[[side*.059,-.185,.103],[side*.093,-.282,.161],
            [side*.049,-.36,.093],[0,-.342,.049]],[scales,lustre],.013,4);
          if(heel)heel.material=finMembrane;
        }
        tail=hinge(swimmer,0,-.201,.154);
        const dorsal=fanFin(tail,[0,.046,0],[[0,.024,.10],[0,-.168,.29],[0,-.284,.32],[0,-.276,.12],
          [0,-.33,.001]],[scales,lustre],.023,5);
        if(dorsal)dorsal.material=finMembrane;
      }else{
        jaw=humanFace(head,{skin,light,iris:femaleTail?0xe6b784:mermaid?0x9ddfc1:0x75d4ed,eyebrow:narrow?0x563437:0x354954});
        const hair=femaleTail?0x302344:mermaid?0x603043:0x263d4a;
        part(head,"oval",hair,[0,.101,.063],[.174,.185,.164],[.19,0,0]);
        for(const side of [-1,1]){
          for(let i=0;i<4;i++){
            const at=hinge(head,side*(.085+i*.020),.108+i*.013,.06+i*.022);
            const end=femaleTail?-.32-i*.031:mermaid?-.49-i*.039:-.105-i*.026;
            dragonCurve(at,[[0,.033,0,.044],[side*.037,-.071,.041,.049],
              [side*.054,end*.64,.132+i*.013,.038],[side*.043,end,.176+i*.018,.006]],
              [hair,femaleTail?0x72538a:mermaid?0xa05470:scales],15);
            (rig.hair??=[]).push(at);
          }
          const ear=fanFin(head,[side*.128,-.019,.011],[[side*.167,.01,.043],[side*.243,.129,.122],
            [side*.244,-.002,.115],[side*.175,-.083,.065]],[scales,lustre],.013,5);
          if(ear)ear.material=finMembrane;
          part(head,"oval",0xecd7ac,[side*.144,-.072,-.007],[.021,.037,.021]);
        }
        tail=hinge(swimmer,0,-.16,.022);
        const tailSkin=dragonCurve(tail,[[0,.035,.011,.165,.213],[0,-.12,.012,.163,.209],[0,-.33,.047,.131,.165],
          [0,-.55,.11,.102,.13],[0,-.79,.155,.07,.092],[0,-.98,.148,.04,.062]],
          [scales,lustre],32,[1,0,0],(c,a,row)=>c.multiplyScalar(.88+.18*Math.cos(a*17+(row%2)*.83)**2));
        tailSkin.name="Cauda de escamas";
        hybridScales(tailSkin,tailSkin.geometry.attributes.position.count/32,32,2,2.2);
        tailTip=hinge(tail,0,-.88,.156);
        const socket=dragonCurve(tailTip,[[0,.089,-.003,.058,.076],[0,.024,-.004,.056,.070],
          [0,-.035,.003,.062,.063],[0,-.094,.010,.051,.041],[0,-.142,.014,.017,.022]],
          [scales,lustre],32,[1,0,0]);
        socket.name="Raiz flexível da nadadeira caudal";
        hybridScales(socket,socket.geometry.attributes.position.count/32,32,1);
        for(const side of [-1,1]){
          const tip=femaleTail?[side*.64,-.30,.19]:[side*.57,-.37,.132];
          const tailFin=fanFin(tailTip,[0,.033,0],[[side*.11,-.082,.008],[side*.32,-.177,.047],
            tip,[side*.45,-.433,.104],[side*.22,-.351,.052],[0,-.18,0]],
            [scales,lustre],.026,8);
          if(tailFin)tailFin.material=finMembrane;
        }
      }
      return {group:g,tail,tailTip,wings,jaw,limbs:rig,verticalTail:!headFish,swimStyle:"hybrid",biteAngle:headFish?.61:.17};
    }


    const referenceShrimps={shrimp_pink:0xef9a7c,shrimp_seabob:0xb98465,shrimp_white:0xbcc0ac,shrimp_pitu:0x98794d};
    function seahorse(kind){
      const thorny=kind==="seahorse_red",group=new T.Group(),wings=[];
      const base=thorny?0x852010:0xc78a29,shade=thorny?0x3c130c:0x553011,light=thorny?0xd05a25:0xf8d775;
      const shadow=new T.Color(shade),mottle=new T.Color(thorny?0xf2ab75:0xffdf87);
      const pigmentBands=(c,a,j)=>{
        const streak=Math.cos(j*1.74+Math.sin(a*5)*.92);
        c.lerp(shadow,Math.max(0,streak)**3*(thorny?.54:.81));
        const fleck=Math.max(0,Math.sin(j*2.38+a*17)*Math.cos(a*23-j*.81))**4;
        c.lerp(mottle,fleck*(thorny?.73:.32));
        c.multiplyScalar(.86+.20*Math.cos(a*5+j*.23)**2);
      };
      dragonCurve(group,[[0,.275,.117,.042,.055],[0,.205,.151,.077,.088],[0,.087,.132,.112,.127],
        [0,-.057,.118,.122,.134],[0,-.192,.162,.071,.089],[0,-.261,.201,.059,.055]],
        [base,light],44,[0,0,1],pigmentBands,.09).name="Tronco com anéis ósseos";
      const head=hinge(group,0,.274,.093);
      dragonCurve(head,[[0,-.047,.045,.052],[0,.020,.017,.085,.073],[0,.051,-.063,.092,.077],
        [0,.026,-.118,.054,.052],[0,-.019,-.156,.034],[0,-.056,-.226,.023],[0,-.062,-.254,.024]],
        [base,light],34,[1,0,0],pigmentBands).name="Cabeça e focinho tubular";
      part(head,"oval",shade,[0,-.063,-.253],[.022,.015,.009]);
      eyes(head,.072,.046,-.088,.021);
      const tail=hinge(group,0,-.232,.192),turn=thorny?1.13:.86;
      const curl=Array.from({length:37},(_,i)=>{
        const t=i/36,a=t*Math.PI*2*turn,r=(thorny?.145:.167)*(1-t*.91);
        return [0,-.137-Math.sin(a)*r-t*.094,-.149+Math.cos(a)*r,.006+.059*(1-t)**1.36];
      });
      curl.unshift([0,.034,-.024,.070],[0,-.034,-.003,.063]);
      dragonCurve(tail,curl,[base,light],26,[1,0,0],pigmentBands).name="Cauda preênsil enrolada";
      if(thorny)for(let i=3;i<27;i+=2){
        const [x,y,z,width]=curl[i],angle=(i-2)/36*Math.PI*2*turn;
        const dy=-Math.sin(angle),dz=Math.cos(angle),side=i%4===1?1:-1;
        dragonCurve(tail,[[side*width*.5,y+dy*width*.54,z+dz*width*.53,width*.33],
          [side*width*.68,y+dy*width*1.10,z+dz*width*1.16,width*.18],
          [side*width*.91,y+dy*width*1.60,z+dz*width*1.56,.002]],[base,0xf69a6f],7).name="Espinho da cauda preênsil";
      }
      const dorsal=hinge(group,0,-.018,.233);wings.push(dorsal);
      const web=fanFin(dorsal,[0,.018,-.022],[[0,.110,.010],[0,.098,.076],[0,.035,.104],
        [0,-.049,.114],[0,-.106,.083],[0,-.094,.008]],[shade,light],.008,8);
      web.material=finMembrane;web.name="Nadadeira dorsal translúcida";
      for(const side of [-1,1]){
        const finRoot=hinge(head,side*.063,-.012,.048);finRoot.userData.side=side;
        wings.push(finRoot);
        const pectoral=fanFin(finRoot,[0,0,0],[[side*.033,.025,.025],[side*.065,.006,.038],
          [side*.031,-.035,.049],[0,-.024,.026]],[base,light],.005,4);
        pectoral.material=finMembrane;
      }
      for(let i=0;i<(thorny?15:5);i++){
        const t=i/(thorny?14:4),a=i*2.399,side=i%2===0?1:-1;
        const y=.26-t*.47,z=.185+.068*Math.sin(Math.PI*t),r=thorny?.055+.022*Math.sin(a):.028;
        const at=[side*(.025+.048*Math.sin(Math.PI*t)),y,z];
        dragonCurve(group,[[...at,r*.28],[at[0]+side*r*.32,y+r*.35,z+r*.55,r*.17],
          [at[0]+side*r*.55,y+r*.82,z+r,r*.027]],[base,light],7).name="Espinho da crista";
        if(thorny&&i%2===0)dragonCurve(group,[[at[0]+side*r*.22,y+r*.22,z+r*.45,.008],
          [at[0]+side*r*.58,y+r*.40,z+r*.78,.006],[at[0]+side*r*.97,y+r*.55,z+r*.88,.0015]],
          [base,light],6).name="Filamento ramificado";
      }
      for(let i=0;i<5;i++){
        const z=-.098+i*.042,y=.101+.023*Math.sin(i*.85),r=thorny?.059:.035;
        dragonCurve(head,[[0,y-.024,z,.021],[0,y+r*.47,z+.012,.013],[0,y+r,z-.006,.0018]],
          [shade,light],10).name="Coroa do cavalo-marinho";
      }
      return {group,tail,wings,swimStyle:"seahorse"};
    }
    function leatherback(){
      const group=new T.Group(),wings=[],top=0x25353d,cream=0x72868a,ink=0x142329;
      const outline=sculptSections(sculptSections(sculptSections([
        [-.64,-.017,.082,.083],[-.51,.008,.34,.192],[-.31,.023,.489,.262],
        [-.055,.028,.523,.292],[.22,.017,.468,.269],[.46,.003,.322,.188],
        [.62,-.029,.148,.105],[.72,-.036,.043,.036],[.765,-.037,.010,.014]
      ])));
      const speckle=(v,w)=>Math.pow(Math.max(0,Math.sin(v)*Math.cos(w)),11);
      const ridge=a=>Math.max(0,Math.cos((a-Math.PI*.5)*12))**13;
      contour(group,outline,[top,cream],"",104,([z,y,x,h],a)=>{
        const c=Math.cos(a),raised=c>-.10?(h*.20)*ridge(a):0;
        return [Math.sin(a)*x,y+c*h+raised,z];
      },(c,z,a)=>{
        c.lerp(new T.Color(cream),speckle(z*131+a*29,z*79-a*53)*.65);
        if(Math.cos(a)>-.1)c.lerp(new T.Color(0x9ba8a3),ridge(a)*.61);
      },aquaticSkin).name="Carapaça de couro com sete quilhas";
      const tail=hinge(group,0,-.068,.62);
      dragonCurve(tail,[[0,0,-.067,.075],[0,-.006,.057,.059],[0,-.019,.158,.021],
        [0,-.031,.189,.006]],[top,cream],18).name="Cauda curta da tartaruga";
      const head=hinge(group,0,-.038,-.59);
      contour(head,sculptSections(sculptSections([[-.47,-.012,.038,.036],[-.434,.010,.109,.065],
        [-.35,.021,.153,.108],[-.215,.026,.146,.102],[-.090,.017,.110,.091],[.059,.012,.129,.100]])),
        [top,cream],"",52,null,(c,z,a)=>c.lerp(new T.Color(cream),speckle(z*107+a*26,z*66-a*36)*.88),
        aquaticSkin).name="Cabeça mosqueada e bico";
      eyes(head,.117,.065,-.355,.022);
      for(const side of [-1,1]){
        dragonCurve(head,[[side*.043,-.023,-.466,.005],[side*.098,-.027,-.436,.006],
          [side*.139,-.033,-.359,.008],[side*.138,-.043,-.292,.002]],[ink,top],9);
        for(const front of [true,false]){
          const limb=hinge(group,side*(front?.282:.251),-.098,front?-.459:.448);
          limb.userData.side=side;limb.userData.rear=!front;wings.push(limb);
          part(limb,"oval",top,[0,0,0],front?[.146,.098,.139]:[.098,.068,.102]);
          const edge=front?[[.03,.044,-.154],[.249,.027,-.229],[.436,-.006,-.202],[.704,-.085,-.091],
            [.927,-.143,.094],[1.002,-.168,.221],[.884,-.162,.256],[.660,-.110,.205],[.314,-.023,.124],[.015,.006,.123]]:
            [[.03,.019,-.086],[.14,.026,-.077],[.30,-.015,.032],[.415,-.036,.148],
              [.371,-.055,.254],[.224,-.043,.237],[.056,-.002,.156]];
          const paddle=fanFin(limb,[-side*.095,0,.007],edge.map(([x,y,z])=>[side*x,y,z]),[top,0x53686f,0x78888a],front?.061:.036,12);
          paddle.name=front?"Nadadeira dianteira longa":"Nadadeira traseira";
          const position=paddle.geometry.attributes.position,color=paddle.geometry.attributes.color,tint=new T.Color();
          for(let i=0;i<position.count;i++){
            const along=position.getX(i),cross=position.getZ(i);
            tint.fromBufferAttribute(color,i).lerp(new T.Color(0xc4c6b5),speckle(along*172+cross*98,along*108-cross*151)*.93);
            color.setXYZ(i,tint.r,tint.g,tint.b);
          }
        }
      }
      return {group,tail,wings,swimStyle:"turtle"};
    }
    function creature(kind,detail=true){
      if(kind==="leatherback")return leatherback();
      if(kind==="seahorse_red"||kind==="seahorse_gold")return seahorse(kind);
      if(Object.hasOwn(referenceShrimps,kind))return shrimpModel(referenceShrimps[kind],kind);
      if(kind==="humpback"||kind==="minke"||Object.hasOwn(whaleLooks,kind)||Object.hasOwn(orcaLooks,kind))return cetacean(kind,detail);
      if(["weddell_seal","harbor_seal","leopard_seal","ringed_seal"].includes(kind))return weddellSeal(kind);
      if(["phytoplankton","zooplankton","antarctic_krill"].includes(kind))return plankton(kind);
      if(kind==="giant_squid"||kind==="colossal_squid")return deepSquid(kind,detail);
      if(kind==="common_octopus"||kind==="coastal_squid")return cephalopod(kind);
      if(kind==="adelie_penguin")return adeliePenguin();
      if(QuimiCraftMarineLife.profiles[kind]?.anchored||kind==="sea_star")return seafloorLife(kind,detail);
      if(kind==="antarctic_toothfish"||kind==="patagonian_toothfish")return fish(kind,kind==="antarctic_toothfish"?0x797e6d:0x5e594e,"long");
      if(["mermaid","fishfolk_head","fishfolk_tail","fishwoman_head","fishwoman_tail"].includes(kind))return swimmingHybrid(kind);
      if(kind==="pufferfish")return fish(kind,0xb49b4c,"deep");
      const venomRay=kind==="venom_ray";
      if(venomRay)kind="ray";
      if(kind==="pink_boto")return riverBoto();
      const moon=kind==="moon_jelly",nettle=kind==="sea_nettle",jelly=kind==="jelly"||moon||nettle;
      const palette={dolphin:[0x547d99,0xb0c9cb],reef_shark:[0x496473,0xc4ced0],caiman:[0x596846,0xb0a36a],piranha:[0x768f79,0xd98660],ray:[0x446c76,0xa6bcac],
        jelly:[0x69a4b8,0xa9dee0],moon_jelly:[0xaecde2,0xdac5e9],sea_nettle:[0xb87545,0xffc87b]};
      const [body,cream]=venomRay?[0x526558,0xccbd88]:palette[kind];
      if(kind==="piranha"){
        const f=fish(kind,body,"deep");
        part(f.group,"oval",0xc76442,[0,-.13,-.13],[.149,.092,.29]);
        f.group.scale.setScalar(.84);return f;
      }
      const g=new T.Group(),wings=[],tail=hinge(g,0,0,jelly?0:.68);
      if(jelly){
        const bell=hinge(g,0,0,0);
        bell.add(tail);
        g.userData.bell=bell;
        const canopy=new T.LatheGeometry([[.01,.257],[.16,.239],[.275,.181],[.361,.098],[.393,.019],
          [.378,-.021],[.322,-.033],[.239,-.013],[.09,.021],[.01,.038]].map(([r,y])=>new T.Vector2(r,y*(moon?.55:nettle?1.18:1))),28);
        bell.add(new T.Mesh(canopy,material(body,true,.49)));
        part(bell,"ring",cream,[0,-.012,0],[.369,.369,.31],[Math.PI/2,0,0],true,.74);
        if(moon){
          for(let i=0;i<4;i++){
            const a=i*Math.PI/2;
            part(bell,"ring",0xb784a4,[Math.cos(a)*.103,.058,Math.sin(a)*.103],[.050,.057,.19],[Math.PI/2,0,a],true,.57);
          }
        }else part(bell,"oval",nettle?0xb67843:0x66699a,[0,.068,0],[.205,.083,.205],[0,0,0],true,.48);
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
        const count=moon?20:nettle?16:8;
        for(let i=0;i<count;i++){
          const t=i*Math.PI*2/count,u=Math.cos(t)*(moon?.352:.251),v=Math.sin(t)*(moon?.352:.251);
          const arm=hinge(tail,u,.021,v);
          wings.push(arm);
          const length=(moon?.10:nettle?.91:.41)+(i%3)*(moon?.015:.056),points=[[0,0,0],[u*.10,-length*.34,v*.10],
            [u*.27,-length*.61,v*.18],[u*.13,-length*.83,v*.29],[-u*.08,-length,v*.32]];
          for(let j=1;j<points.length;j++){
            const color=j%2?cream:body,r=moon?.008:nettle?.020-j*.002:.042-j*.007;
            link(arm,color,points[j-1],points[j],r,.69,true);
            if(j<points.length-1)part(arm,"oval",color,points[j],[r,r,r],[0,0,0],true,.65);
          }
        }
        return {group:g,tail,wings,jaw,verticalTail:false,swimStyle:"pulse"};
      }
      if(kind==="ray"){
        contour(g,sculptSections([[-.78,-.01,.13,.038],[-.64,0,.26,.077],[-.36,.018,.34,.124],
          [-.02,.011,.34,.115],[.30,0,.27,.088],[.63,-.02,.11,.046],[.75,-.02,.062,.037]]),
          [body,cream],"",30,null,(c,z,a)=>c.multiplyScalar(.9+.15*Math.cos(z*34+a*18)**2),aquaticSkin);
        for(const side of [-1,1]){
          const wing=hinge(g,side*.11,0,-.07);wing.userData.side=side;wings.push(wing);
          rayWing(wing,side,body,cream);
          fanFin(wing,[side*.12,.053,-.26],[[side*.27,.051,-.29],[side*.62,.012,-.117],
            [side*.44,.061,.036],[side*.22,.055,.121]],[body,0x7f9d91],.005);
        }
        taper(tail,[[0,-.016,-.077,.055],[0,-.028,.14,.043],[.012,-.037,.35,.028],
          [.032,-.017,.57,.018],[.088,.013,.78,.006]],[body,cream],8);
        if(venomRay)dragonHorn(tail,[[.022,-.014,.408,.023],[.022,.031,.48,.018],
          [.026,.057,.55,.011],[.035,.064,.64,.001]],[body,0xcbe781],true).name="Ferrão da arraia";
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
      const dolphin=kind==="dolphin",length=dolphin?.88:1.03;
      const width=dolphin?.249:.292,height=dolphin?.263:.27;
      const nose=dolphin?[-1.39,-.31,.21,.088]:[-1.16,-.14,.15,.125];
      const oceanHull=[nose,[-1.035,-.12,dolphin?.43:.62,dolphin?.25:.50],[-.91,-.04,.71,.67],[-.81,.02,.83,.82],
        [-.665,.038,.94,.95],[-.47,.01,1,1],[-.285,.008,1.01,.985],[-.07,0,1,.94],
        [.16,-.021,.89,.87],[.33,-.036,.74,.77],[.51,-.055,.60,.63],[.64,-.085,.48,.48],[.84,-.13,.27,.29]];
      const warm=new T.Color(cream);
      contour(g,oceanHull.map(([z,c,w,h])=>[z*length,c*height,w*width,h*height]),[body,cream],"",32,null,(mix,z,a)=>{
        const level=Math.cos(a);
        if(dolphin&&level<.19&&z/length>-.80)mix.lerp(warm,Math.min(.51,Math.max(0,.19-level)*.62));
      }).name="Corpo do cetáceo";
      const shark=kind==="reef_shark";
      const jaw=aquaticMouth(g,[0,-height*(shark?.47:.37),-length*(dolphin?.90:.76)],
        width*(dolphin?.49:.64),height*(dolphin?.15:.20),
        length*(dolphin?.349:shark?.237:.253),shark?cream:body,cream,shark?6:0);
      eyes(g,width*.83,height*.18,-length*.766,.034);
      for(const side of [-1,1]){
        const start=[side*width*.61,-height*.21,-length*1.006];
        const finish=[side*width*.82,-height*.35,-length*.76];
        fin(g,pigment(body,false),[start,finish,[finish[0],finish[1]-.027,finish[2]-.02]],.012);
      }
      for(const side of [-1,1]){
        const wing=hinge(g,side*width*.55,-height*.23,-length*.19);wing.userData.side=side;wings.push(wing);
        const tip=side*.45;
        fanFin(wing,[-side*.065,.017,-.24],[[tip*.44,-.024,-.06],[tip*.82,-.111,.18],[tip,-.17,.38],
          [tip*.62,-.188,.423],[tip*.21,-.105,.431],[-side*.07,-.035,.40]],[pigment(body,false),body],.026);
        if(shark)for(let j=0;j<5;j++){
          const z=-.42+j*.041,x=side*(width*.971+j*.001),len=.11-j*.008;
          taper(g,[[x,.038,z,.006],[x+side*.007,.009,z+.018,.007],[x-side*.021,-len,z+.030,.004]],[0x293a46,body],5);
        }
      }
      const dorsal=[[0,height*.80,-.35],[0,height+.21,-.01],[0,height+.32,.27],[0,height*.95,.19],[0,height*.56,.37],[0,height*.27,.55]];
      fanFin(g,[0,height*.57,-.28],dorsal,[pigment(body,false),body],.032).name="Nadadeira dorsal";
      contour(tail,[[-.12,-height*.13,width*.34,height*.34],[0,-height*.16,width*.29,height*.33],[.15,-height*.21,width*.24,height*.31],
        [.33,-height*.18,width*.185,height*.22],[.52,-height*.12,width*.106,height*.095]],[body,cream]);
      for(const side of [-1,1]){
        const cross=side*.37,lift=side*(side>0?.43:.29);
        const edge=shark?[[0,lift*.47,.49],[0,lift,.74],[0,lift*.65,.755],[0,lift*.31,.63],[0,0,.59]]:
          [[cross*.44,-.013,.445],[cross*.74,-.023,.49],[cross,-.06,.67],[cross*.59,-.073,.655],[cross*.26,-.032,.61],[0,-.024,.515]];
        fanFin(tail,[0,-.014,shark?.33:.285],edge,[pigment(body,false),body],.021);
      }
      return {group:g,tail,wings,jaw,verticalTail:dolphin,swimStyle:shark?"undulate":"swim",biteAngle:shark?.77:.38,
        ...(dolphin?{spouts:[[0,height*.97,-length*.56]],breach:1.22}:{})};
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
    function plumage(parent,rows,tones,name){
      const positions=[],colors=[],indices=[];
      const [base,edge,bar]=tones.map(tint=>new T.Color(tint));
      const tone=new T.Color();
      for(const [i,[from,to,width,lift]] of rows.entries()){
        const a=new T.Vector3(...from),b=new T.Vector3(...to),normal=new T.Vector3(...lift).normalize();
        const vane=b.clone().sub(a).cross(normal).normalize(),offset=positions.length/3;
        for(let rib=0;rib<7;rib++){
          const t=rib/6,span=width*(.072+.928*Math.sin(t*Math.PI)**.77);
          const center=a.clone().lerp(b,t).addScaledVector(normal,Math.sin(t*Math.PI)*width*.34);
          for(const side of [-1,0,1]){
            const p=center.clone().addScaledVector(vane,span*side).addScaledVector(normal,side===0?width*.17:0);
            positions.push(...p.toArray());
            tone.copy(base).lerp(edge,.32+t*.30+(side===0?.23:0))
              .lerp(bar,(rib+i%2)%3===0&&t>.14?.55:.08);
            colors.push(tone.r,tone.g,tone.b);
          }
          if(rib===6)continue;
          for(let side=0;side<2;side++){
            const v=offset+rib*3+side;
            indices.push(v,v+1,v+3,v+1,v+4,v+3);
          }
        }
      }
      const surface=new T.BufferGeometry();
      surface.setAttribute("position",new T.Float32BufferAttribute(positions,3));
      surface.setAttribute("color",new T.Float32BufferAttribute(colors,3));
      surface.setIndex(indices);surface.computeVertexNormals();
      const feathers=new T.Mesh(surface,leafMaterial);
      feathers.userData.ownGeometry=true;feathers.name=name;parent.add(feathers);
    }
    function owl(g,rig,frost){
      const light=frost?0xe4ebed:0xcbbea3,coat=mutedTint(frost?0x98a8b2:0x745c50);
      const dark=frost?0x647180:0x463b3c,speckle=frost?0x526572:0x6d5144,beak=frost?0x6c7281:0x9e753f;
      const body=hinge(g,0,.68,.022);rig.body=body;
      contour(body,[[-.265,-.064,.062,.145],[-.221,-.024,.174,.265],[-.153,.008,.254,.314],
        [.005,.028,.271,.331],[.16,-.006,.234,.279],[.26,-.056,.152,.183],[.32,-.09,.049,.081]],
        [coat,light],"",24,torsoShape);
      taper(body,[[0,.10,-.05,.253,.25],[0,.224,-.071,.214,.217],[0,.34,-.075,.199,.181]],
        [coat,light],14);
      const breast=[];
      for(let row=0;row<5;row++)for(let col=-2;col<=2;col++){
        const x=col*(.044+row*.004),y=.167-row*.076,z=-.193+Math.abs(x)*.30+(row>3?.021:0);
        breast.push([[x,y,z],[x*1.21,y-.115,z-.041+Math.abs(x)*.20],.035,[0,.08,-1]]);
      }
      plumage(body,breast,[light,frost?0xf8f9fa:0xe3cead,speckle],"Penas do peito");
      const head=hinge(g,0,.984,-.052);rig.head=head;
      contour(head,[[-.236,.014,.105,.126],[-.192,.021,.215,.211],[-.07,.034,.267,.238],
        [.044,.044,.247,.226],[.18,.022,.186,.175],[.224,.013,.099,.103]],[coat,light],"",24,torsoShape);
      taper(head,[[0,-.052,-.197,.058],[0,-.073,-.274,.047],[0,-.126,-.309,.024],[0,-.154,-.278,.005]],
        [beak,0xd1ae6d],8,[1,0,0]);
      for(const side of [-1,1]){
        const x=side*.125,y=.019,z=-.195;
        part(head,"oval",dark,[x,y,z],[.149,.151,.084],[0,side*-.18,side*.12]);
        part(head,"oval",light,[x,y,z-.031],[.124,.124,.073],[0,side*-.17,side*.10]);
        const facial=[];
        for(let i=0;i<16;i++){
          const a=i*Math.PI*2/16,dx=Math.cos(a),dy=Math.sin(a);
          facial.push([[x+dx*.047,y+dy*.043,-.262],[x+dx*.125,y+dy*.128,-.229+dx*side*.025],.026,[0,0,-1]]);
        }
        plumage(head,facial,[light,0xf3e6c7,dark],"Penas do disco facial");
        const eye=hinge(head,x,.033,-.270);eye.userData.entityEye=true;
        part(eye,"oval",dark,[0,0,0],[.067,.062,.028]);
        part(eye,"oval",frost?0xe5b958:0xeb9b39,[0,0,-.018],[.053,.051,.021]);
        part(eye,"oval",0x20202c,[0,0,-.036],[.026,.029,.014]);
        part(eye,"oval",0xfff8e7,[-.012,.014,-.047],[.009,.009,.006]);
        if(!frost){
          const crest=Array.from({length:4},(_,i)=>[[side*(.131+i*.027),.164+i*.011,.013],
            [side*(.176+i*.055),.280+i*.019,.044+i*.022],.036+i*.003,[0,0,-1]]);
          plumage(head,crest,[coat,light,dark],"Penachos");
        }
        const wing=hinge(g,side*.224,.761,.055);
        wing.userData.side=side;rig.wings.push(wing);
        part(wing,"oval",coat,[-side*.013,-.034,.029],[.169,.135,.242],[.09,0,side*.13]);
        taper(wing,[[-side*.062,.009,-.033,.108],[side*.137,.005,-.042,.109],
          [side*.311,-.041,.015,.070],[side*.466,-.082,.105,.025]],[coat,light],12,[0,1,0]);
        const flight=[];
        for(let i=0;i<10;i++){
          const x=.07+i*.041;
          flight.push([[side*x,-.027-i*.0065,-.016+i*.011],
            [side*(x+.11+i*.038),-.118-i*.017,.246+i*.011],.045-i*.0011,[0,1,-.2]]);
        }
        plumage(wing,flight,[coat,light,dark],"Rêmiges da asa");
        for(let row=0;row<2;row++){
          const cover=Array.from({length:8},(_,i)=>{
            const x=.036+i*.050,y=.041-i*.010-row*.020,z=-.08+i*.009+row*.063;
            return [[side*x,y,z],[side*(x+.082),y-.033,z+.173],.037,[0,1,0]];
          });
          plumage(wing,cover,[coat,row?light:pigment(coat,true),speckle],"Penas de cobertura");
        }
        const leg=hinge(body,side*.13,-.209,-.051);
        taper(leg,[[0,.085,.018,.074],[0,-.045,0,.057],[side*.02,-.119,-.007,.036]],[light,coat],9);
        taper(leg,[[side*.02,-.105,-.007,.038],[side*.036,-.249,-.027,.027],[side*.039,-.316,-.049,.034]],[dark,beak],8);
        for(const toe of [-1,0,1])taper(leg,[[side*.039,-.300,-.048,.022],[side*.040+toe*.040,-.319,-.102,.017],
          [side*.039+toe*.059,-.333,-.153,.012],[side*.037+toe*.061,-.355,-.168,.004]],[beak,0x4d4752],6);
      }
      const tail=hinge(body,0,-.085,.216);rig.tails.push(tail);
      const rectrices=Array.from({length:7},(_,i)=>[[(i-3)*.020,0,-.018],[(i-3)*.048,-.245+Math.abs(i-3)*.022,
        .296-Math.abs(i-3)*.027],.045,[0,1,0]]);
      plumage(tail,rectrices,[coat,light,dark],"Penas da cauda");
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
        if(skull){
          head.remove(skull);
          const profile=bovine?
            [[-.352,-.118,.139,.070],[-.273,-.076,.184,.129],[-.194,-.011,.213,.195],
              [-.075,.034,.259,.246],[.073,.027,.261,.24],[.222,-.025,.145,.153]]:
            [[-.481,-.082,.103,.074],[-.394,-.064,.149,.089],[-.286,-.037,.174,.127],
              [-.181,.021,.231,.194],[-.031,.011,.263,.233],[.139,-.019,.197,.161],[.229,-.037,.091,.103]];
          const cream=new T.Color(0xdeceb5);
          const markings=bovine?(c,z,a)=>{
            const sin=Math.sin(a),front=(z+.17)/.206;
            const stripe=(sin-.085-.18*Math.sin(z*13))/.232;
            const patch=front*front+stripe*stripe;
            if(Math.cos(a)>.11)c.lerp(cream,1-T.MathUtils.smoothstep(patch,.57,1.03));
          }:null;
          contour(head,sculptSections(profile),[skull.material.color.getHex(),light],"",bovine?38:24,torsoShape,markings);
        }
        if(muzzle){muzzle.geometry=geometry.oval;muzzle.scale.multiplyScalar(.62);}
        const snout=bovine?-.347:-.467;
        for(const side of [-1,1]){
          part(head,"oval",bovine?0xc58f88:0xc48685,[side*(bovine?.141:.105),-.119,snout+.043],[.071,.052,.059]);
          link(head,bovine?0x715254:0x824658,[side*.019,-.165,snout-.006],
            [side*(bovine?.108:.083),-.159,snout+.022],.006);
          if(bovine){
            const ear=head.children.find(node=>node.isMesh&&node.position.x*side>.21&&node.position.y>.12);
            if(ear){ear.geometry=geometry.chamfer;ear.scale.multiplyScalar(.83);}
          }else{
            const path=[[side*.148,.133,-.018,.066,.059],[side*.198,.228,-.023,.082,.053],
              [side*.268,.328,-.054,.060,.042],[side*.323,.342,-.091,.011,.014]];
            taper(head,path,[0xb97179,0xe08f90],10,[0,0,1]).name="Orelha presa à cabeça";
            fanFin(head,[side*.177,.200,-.065],[[side*.206,.287,-.071],[side*.299,.327,-.098],
              [side*.264,.260,-.102],[side*.208,.222,-.087]],[0x854b59,0xd68787],.014);
          }
        }
        if(bovine){
          for(const part of head.children)if(part.isMesh&&part.position.z<-.29&&part.position.y<-.10)
            part.geometry=geometry.oval;
          taper(group,[[0,.89,-.332,.25,.242],[0,.952,-.45,.232,.211],[0,1.027,-.581,.167,.165]],
            [0x585253,0xa29a8f],10);
        }
        else{
          const oldTail=group.children.find(node=>node.isMesh&&node.geometry.type==="TorusGeometry");
          if(oldTail){oldTail.geometry.dispose();group.remove(oldTail);}
          const tail=hinge(group,0,.59,.43);rig.tails.push(tail);
          taper(tail,[[0,0,-.024,.046],[.015,.021,.095,.032],[.055,.095,.132,.033],
            [.079,.185,.106,.028],[.017,.193,.110,.021],[-.016,.143,.142,.014],[.014,.117,.155,.007]],
            [coat,light],8,[1,0,0]).name="Cauda enrolada";
        }
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
        if(skull){
          head.remove(skull);
          contour(head,sculptSections([[-.470,-.078,.090,.074],[-.407,-.052,.153,.101],[-.311,-.019,.189,.148],
            [-.192,.001,.239,.211],[-.022,.016,.281,.245],[.143,-.010,.221,.189],
            [.252,-.041,.119,.111]]),[skull.material.color.getHex(),light],"",24,torsoShape);
        }
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
          const newBody=scaledContour(rig.body,sculptSections([[-.99,0,.43,.56],[-.69,-.027,.79,.85],[-.29,.016,.92,1],
            [.29,-.025,1,.89],[.69,-.04,.83,.75],[1,-.061,.34,.46]]),size.x,size.y,size.z,[hull.material.color.getHex(),colors[1]]);
          newBody.position.set(hull.position.x,y,z);
          if(type==="sheep"){hull.geometry=geometry.chamfer;hull.scale.multiplyScalar(.72)}
          else rig.body.remove(hull);
          if(rig.head){
            const neck=hull.material.color.getHex(),head=rig.head.position;
            const [fromY,toY]=[y+.045,head.y-.034],fromZ=z-size.z*.53,toZ=head.z+.091;
            const r=size.y*(type==="owl"?.68:.61);
            taper(group,[[0,fromY,fromZ,r*1.14,r*1.16],[0,(fromY+toY)*.50,(fromZ+toZ)*.50,r,r],
              [0,toY,toZ,r*.81,r*.85]],[neck,colors[1]],16);
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
      }else if(type==="golem"){
        rig.body.geometry=geometry.facet;rig.body.scale.x*=1.08;
        for(const limb of [...rig.arms,...rig.legs]){
          const plate=limb.children.find(node=>node.isMesh);
          if(plate){plate.geometry=geometry.chamfer;plate.scale.multiplyScalar(.76)}
        }
        const stone=0x4e3a58,rune=0xb586d6;
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
      lion:[.81,.79,.282,.325,.68,.70,1.075,.248,.229,.241],
      tiger:[.77,.91,.293,.320,.64,.67,1.02,.238,.223,.242],
      jaguar:[.59,.70,.266,.266,.50,.54,.817,.216,.188,.216],
      lynx:[.68,.51,.196,.235,.60,.43,.89,.171,.172,.177],
      brown_bear:[.91,.89,.408,.424,.69,.67,1.02,.242,.222,.243],
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
      brown_bear:[[-1.13,.32,.56,-.46],[-.91,.75,1.05,-.78],[-.60,1,1.36,-.95],[-.29,1.02,1.19,-1.03],
        [.11,.93,.82,-1.02],[.54,1.08,.88,-.96],[.81,.91,.79,-.76],[1.02,.49,.48,-.49],[1.10,.09,.18,-.18]],
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
    function sculptSections(sections){
      return sections.flatMap((row,i)=>{
        const next=sections[i+1];
        if(!next)return [row];
        const before=sections[Math.max(0,i-1)],after=sections[Math.min(sections.length-1,i+2)];
        const half=row.map((v,k)=>{
          const average=(v+next[k])*.5;
          if(k===0)return average;
          const curved=average+(v+next[k]-before[k]-after[k])*.0625;
          return T.MathUtils.clamp(curved,Math.min(v,next[k]),Math.max(v,next[k]));
        });
        return [row,half];
      });
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
      mane.name="Juba dourada com peito escuro";
      const collar=[[-.366,.035,.126,.164],[-.292,.013,.237,.293],[-.194,-.003,.318,.372],
        [-.082,-.033,.367,.423],[.043,-.067,.394,.442],[.195,-.042,.320,.339],
        [.289,-.032,.219,.191],[.368,-.051,.064,.072]];
      const fringe=([z,y,rx,ry],a)=>{
        const split=1+.062*Math.cos(a*9+z*9)+.032*Math.sin(a*13-z*7);
        return [Math.sin(a)*rx*split,y+Math.cos(a)*ry*split,z];
      };
      const lit=new T.Color(0xc59654),deep=new T.Color(0x34261e);
      contour(mane,sculptSections(sculptSections(collar)),[0x885731,0x51341f],"",64,fringe,(color,z,a)=>{
        const c=Math.cos(a),strands=Math.sin(a*32+z*17+Math.sin(a*7)*1.1);
        color.lerp(lit,Math.max(0,c+.20)*.63).lerp(deep,Math.max(0,-c+.08)*.69);
        color.multiplyScalar(.95+strands*.10+.05*Math.sin(a*49-z*27));
      });
      for(let i=0;i<30;i++){
        const a=i*Math.PI/15,s=Math.sin(a),c=Math.cos(a),z=-.102+Math.sin(i*2.19)*.069;
        const t=Math.max(0,-c),warm=c>.32,reach=.016*Math.cos(i*2.21);
        dragonCurve(mane,[[s*.247,c*.270,z-.148,.029],[s*.346,c*.342-t*.047,z-.049,.043],
          [s*(.387+reach),c*.397-t*.061,z+.104,.031],[s*.344,c*.408-t*.11,z+.213+reach,.003]],
          [warm?0xa3733e:0x553620,warm?0xc09052:0x785237],7,[1,0,0]);
      }
    }
    function predatorJaw(head,hx,hy,hz,muzzle,coat,trim){
      const throatY=-hy*.44,hingeZ=-hz*.23,front=-hz-muzzle*.82;
      const jaw=hinge(head,0,throatY,hingeZ);
      jaw.name="Mandíbula articulada";
      const gum=0x55313d,bone=0xe4d7bd;
      const lower=sculptSections([
        [front-hingeZ,-hy*.185,hx*.25,hy*.125],
        [-hz-muzzle*.56-hingeZ,-hy*.223,hx*.43,hy*.204],
        [-hz-muzzle*.20-hingeZ,-hy*.263,hx*.61,hy*.244],
        [-hz*.68-hingeZ,-hy*.199,hx*.70,hy*.274],
        [-hz*.21-hingeZ,-hy*.09,hx*.43,hy*.224],
        [hz*.10-hingeZ,hy*.04,hx*.25,hy*.158]
      ]);
      contour(jaw,lower,[trim,coat],"",18,torsoShape).name="Queixo e ramos da mandíbula";
      contour(jaw,lower.slice(0,5).map(([z,y,x,h])=>[z,y+h*.80,x*.81,h*.26]),[gum,0x482733],"",14,torsoShape);
      part(jaw,"oval",0xac5669,[0,hy*.021,-hz*.65-muzzle*.37],[hx*.32,hy*.080,hz*.36+muzzle*.23]);
      for(const side of [-1,1]){
        part(jaw,"oval",coat,[side*hx*.46,hy*.067,.007],[hx*.26,hy*.26,hz*.24]);
        for(let i=0;i<4;i++){
          const t=i/3,x=side*hx*(.31+t*.18),z=front+muzzle*(.21+t*.63);
          const size=hy*(i===0?.285:.14),width=hx*(i===0?.072:.053);
          taper(head,[[x,throatY+hy*.046,z,width],[x*1.01,throatY-size*.43,z+.01,width*.70],
            [x,throatY-size,z+.024,.002]],[bone,0xc0b29d],6,[0,0,1]);
          taper(jaw,[[x*.86,-hy*.08,z-hingeZ+.017,width*.86],[x*.88,-hy*.009,z-hingeZ+.025,width*.62],
            [x*.91,size*.59,z-hingeZ+.037,.002]],[bone,0xc0b29d],6,[0,0,1]);
        }
        taper(head,[[side*hx*.45,throatY+.015,front+.003,.010],[side*hx*.61,throatY+.005,-hz-muzzle*.52,.012],
          [side*hx*.70,throatY-.009,-hz*.88,.010],[side*hx*.70,throatY+.015,hingeZ-.02,.003]],
          [gum,coat],6,[0,1,0]);
      }
      return jaw;
    }
    function brazilianMammal(id,def,g,rig,attachLeg){
      const possum=id==="opossum",coat=def.coat,trim=def.trim,dark=0x302d37;
      const size=possum?.68:1;
      const sections=[[-.58,.64,.116,.149],[-.36,.68,.197,.26],[-.10,.65,.235,.287],
        [.19,.60,.236,.25],[.45,.56,.175,.19],[.62,.55,.09,.104]];
      rig.body=contour(g,sculptSections(sections).map(([z,y,w,h])=>[z*size,y*size,w*size,h*size]),
        [coat,trim],"",26,null,(color,z,a)=>{
          const flank=Math.abs(Math.sin(a));
          if(!possum&&flank>.56&&z>-.47&&z<.12)color.lerp(new T.Color(dark),.86);
          color.multiplyScalar(.93+.09*Math.sin(95*z+15*a)**2);
        });
      const head=hinge(g,0,.70*size,-.50*size);rig.head=head;
      const snout=possum?.34:.65;
      contour(head,sculptSections([[-snout,-.115,.029,.036],[-snout*.78,-.088,.050,.049],
        [-snout*.41,-.029,.108,.077],[-.04,.009,.141,.137],[.13,-.025,.113,.104]]).map(v=>v.map(n=>n*size)),
        [possum?trim:coat,trim],"",22);
      part(head,"oval",possum?0xb2777c:dark,[0,-.116*size,-snout*size],[.042,.032,.048].map(n=>n*size));
      for(const side of [-1,1]){
        const ear=[side*.113*size,.105*size,.015*size];
        part(head,"oval",dark,ear,[.051,possum?.077:.045,.028],[.26,0,side*.34]);
        part(head,"oval",possum?0xba858f:trim,[ear[0],ear[1]+.01,ear[2]-.021],[.026,.039,.010],[.22,0,side*.34]);
        part(head,"oval",dark,[side*.114*size,.024*size,-.128*size],[.029,.024,.027]);
        part(head,"oval",0xe5d6bf,[side*.122*size,.032*size,-.147*size],[.009,.009,.007]);
        for(const z of [-.31,.32]){
          attachLeg(g,rig,side*.145*size,z*size,.45*size,.43*size,(possum?.094:.133)*size,
            material(coat),material(dark),side===Math.sign(z)?0:Math.PI);
          const lower=rig.legs.at(-1)?.userData.lower;
          if(lower)for(let i=-1;i<=1;i++)part(lower,"spike",0xbdb1a0,[i*.025*size,-.252*size,-.071*size],
            [.012,.041,.013],[Math.PI*.6,0,0]);
        }
      }
      const tail=hinge(g,0,.57*size,.52*size);rig.tails.push(tail);
      if(possum){
        dragonCurve(tail,[[0,0,-.07,.066],[0,.013,.13,.040],[.036,-.085,.42,.029],[.11,-.18,.62,.017],
          [.22,-.15,.79,.010],[.248,-.08,.86,.003]],[0x887078,0xb69ba0],13,[0,1,0],
          (color,a,i)=>color.multiplyScalar(i%3===0?.76:1));
      }else{
        dragonCurve(tail,[[0,0,-.05,.08,.10],[0,.11,.16,.14,.25],[0,.10,.43,.17,.31],
          [0,.04,.67,.15,.26],[.03,-.02,.90,.09,.18],[.06,-.10,1.1,.01,.014]],[dark,coat],18);
        for(let i=0;i<8;i++)part(tail,"shard",i%2?coat:dark,[(i%2?1:-1)*(.11+i*.006),.18-i*.035,.25+i*.084],
          [.058,.163,.115],[.52,0,(i%2?1:-1)*.37]);
      }
    }
    function regional(id,def,g,rig,attachLeg,seed){
      if(def.shape==="opossum"||def.shape==="anteater")return brazilianMammal(id,def,g,rig,attachLeg);
      const feline=def.shape==="cat",bear=def.shape==="bear",bison=id==="bison",canine=def.shape==="dog";
      const fox=id==="fennec"||id==="rime_fox",badger=id==="badger",longBear=id==="polar_bear";
      const [coat,trim]=(id==="cat"&&seed>.57?[0x676873,0xe3d9cb]:
        id==="dog"&&seed>.56?[0x614d40,0xc6ae91]:[def.coat,def.trim]).map(mutedTint);
      const dark=pigment(coat,false),noseColor=0x282630;
      const [bodyY,length,width,height,hip,neckZ,headY,hx,hy,hz]=forms[id];
      const legLength=(hip-.035)/.96;
      const body=hinge(g,0,bodyY,.05);rig.body=body;
      const brown=id==="brown_bear",baseSections=torsoSections(id,length,width,height);
      const sections=brown?sculptSections(sculptSections(sculptSections(baseSections))):sculptSections(baseSections);
      const shoulder=new T.Color(dark),throat=new T.Color(trim);
      contour(body,sections,[coat,trim],"",brown?68:28,torsoShape,(color,z,a)=>{
        const c=Math.cos(a),front=Math.max(0,(-z/length+.20)*.82);
        if(bison)color.lerp(shoulder,Math.min(1,front*(.98+c*.27)));
        if(brown)color.setHex(coat).lerp(new T.Color(0x916c47),Math.max(0,c)*(.44+front*.22))
          .lerp(shoulder,Math.max(0,-c+.10)*.63);
        else if(id==="wolf")color.lerp(shoulder,front*Math.max(0,c+.1)*.43);
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
      const neckRootZ=.05-length*.49,neckTipZ=-neckZ+hz*.13;
      const neckAt=t=>T.MathUtils.lerp(neckRootZ,neckTipZ,t);
      taper(g,[[0,bodyY+height*.29,neckRootZ,height*.76,width*.82],
        [0,bodyY+height*.34,neckAt(.27),height*.71,Math.max(width*.76,neckWidth)],
        [0,headY-hy*.51,neckAt(.56),hy*.91,neckWidth*.94],
        [0,headY-hy*.25,neckAt(.81),hy*.76,neckWidth*.81],
        [0,headY-hy*.071,neckTipZ,hy*.53,neckWidth*.53]],
        [bison?dark:coat,bear?coat:trim],20).name="Pescoço ligado ao peito";
      part(head,"oval",coat,[0,-hy*.21,hz*.51],[hx*.68,hy*.62,hz*.46]);
      const muzzle=longBear?.335:bear?(brown?.256:.235):canine?.235:bison?.20:.132;
      const forehead=bison?1.24:badger?.81:1;
      const skull=[[ -hz-muzzle*.80,-hy*.31,hx*.37,hy*.16],[-hz-muzzle*.30,-hy*.195,hx*.57,hy*.29],
        [-hz*.90,-hy*.10,hx*.74,hy*.71],[-hz*.53,.016,hx*.98,hy*.93*forehead],
        [-hz*.08,.026,hx,hy*forehead],[hz*.47,.019,hx*.86,hy*.78],[hz*.72,.005,hx*.50,hy*.48]];
      contour(head,sculptSections(sculptSections(skull)),[badger?trim:coat,trim],"",brown?48:24,torsoShape);
      const jawY=-hy*.40,snoutZ=-hz-muzzle*.67,noseZ=-hz-muzzle*.90;
      if(!bison)rig.jaw=predatorJaw(head,hx,hy,hz,muzzle,coat,trim);
      part(head,"oval",trim,[0,jawY+hy*.16,snoutZ],[hx*.62,hy*.24,muzzle*.46]);
      part(head,"chamfer",noseColor,[0,-hy*.21,noseZ],[hx*(bear?.54:.47),hy*.37,muzzle*.36]);
      if(bison)part(head,"oval",dark,[0,-hy*.57,snoutZ-.01],[hx*.42,hy*.08,muzzle*.28]);
      if(bison){
        part(head,"oval",dark,[0,.15,-.053],[hx*1.02,hy*.59,hz*.82],[.20,0,0]);
        part(head,"shard",dark,[0,-.21,-.19],[.129,.206,.143],[.37,0,0]);
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
          const x=side*hx*.78,y=hy*.83,r=id==="black_bear"?.104:badger?.067:longBear?.068:brown?.075:.086;
          part(head,"oval",dark,[x,y,.050],[r,r*(id==="black_bear"?1.17:.93),.081],[0,0,side*.24]);
          part(head,"oval",trim,[x,y+.004,-.013],[r*.56,r*.56,.026],[0,0,side*.23]);
        }
        const x=side*hx*.66,y=hy*.245,z=-hz*.78;
        if(bear&&!badger){
          part(head,"oval",dark,[side*hx*.65,hy*.48,-hz*.69],[hx*.33,hy*.17,hz*.25],[0,side*.39,side*.13]);
          part(head,"oval",trim,[side*hx*.40,-hy*.28,-hz-muzzle*.47],[hx*.54,hy*.22,muzzle*.53]);
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
          const legCoat=brown?[dark,coat]:[bison&&front?dark:coat,pigment(coat,true)];
          foot.position.z=kneeZ;
          leg.remove(...leg.children.filter(node=>node.isMesh));
          foot.remove(...foot.children.filter(node=>node.isMesh));
          taper(leg,[[-side*upperSize*.20,upperSize*.79,front?-.048:.025,upperSize*(front?.64:.78),upperSize*.58],
            [-side*upperSize*.11,upperSize*.25,front?-.025:.004,upperSize*(front?.69:.84),upperSize*.57],
            [0,kneeY*.46,kneeZ*.39,upperSize*(front?.52:.62),upperSize*.42],
            [0,kneeY-shinWidth*.24,kneeZ,kneeDepth,shinWidth*1.08]],legCoat);
          part(foot,"oval",coat,[0,.005,0],[shinWidth*1.13,shinWidth*.95,kneeDepth*.92]);
          taper(foot,[[0,shinWidth*.58,0,kneeDepth*.91,shinWidth],
            [0,-legLength*.16,0,kneeDepth*.79,shinWidth*.96],
            [0,endY*.70,padZ*.38,shinWidth*.91,shinWidth*.79],
            [0,endY+.015,padZ*.78,shinWidth*.96,shinWidth*.96]],brown?[dark,0x473124]:[coat,pigment(coat,true)]);
          if(bison){
            for(const toe of [-1,1])part(foot,"chamfer",noseColor,[toe*upperSize*.31,endY-.025,padZ],
              [upperSize*.51,.091,upperSize*.80]);
          }else{
            part(foot,"oval",fox||brown?dark:coat,[0,endY,padZ],[upperSize*(bear?.78:.68),bear?.072:.061,upperSize*(longBear||brown?1.03:.87)]);
            for(let j=brown?-2:-1;j<=(brown?2:1);j++){
              const xToe=j*upperSize*(brown?.232:.314);
              part(foot,"oval",bear?dark:coat,[xToe,endY-.015,padZ-upperSize*.49],[upperSize*(brown?.17:.25),.039,upperSize*.34]);
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
        const path=canine?
          [[0,.019,-.036,.069],[.017,.024,size*.24,.082],[.052,-.044,size*.52,.079],
            [.093,-.066,size*.79,.059],[.132,-.031,size*.96,.035],[.161,-.009,size*1.06,.008]]:
          [[0,.019,-.028],[.033,bison?-.15:.031,size*.38],[.093,bison?-.30:.095,size*.72],
            [.132,bison?-.40:.128,size*.93],[.169,bison?-.41:.158,size]].map((point,i)=>[...point,(bison?.053:.071)*(1-i*.15)]);
        taper(tail,path,[coat,trim],12,[0,1,0],
          (c,a,row)=>{if(id==="tiger"&&row%2===0)c.lerp(new T.Color(dark),.68)}).name="Cauda contínua";
        if(id==="lion"||bison)part(tail,"shard",dark,path.at(-1).slice(0,3),[.096,.095,.124],[.2,.28,0]);
      }
      g.scale.setScalar(def.scale);
    }
    function leafSprig(parent,from,to,color,accent,size,seed,width=.27){
      const start=new T.Vector3(...from),end=new T.Vector3(...to),stem=end.clone().sub(start);
      const transverse=new T.Vector3(stem.z,0,-stem.x).normalize();
      const data=[],colors=[],indices=[];
      for(let i=0;i<9;i++){
        const t=.17+i*.096,side=i%2?-1:1,form=.77+.22*Math.sin(seed+i*2.1);
        const origin=start.clone().lerp(end,t);
        const tip=origin.clone().addScaledVector(transverse,side*size*(.65+form*.31))
          .addScaledVector(stem,size*.42/stem.length());
        tip.y+=size*(.14+Math.sin(i+seed)*.31);
        const edge=new T.Vector3(tip.z-origin.z,0,origin.x-tip.x).normalize().multiplyScalar(size*width*form);
        const mid=origin.clone().lerp(tip,.46);
        const left=mid.clone().add(edge),right=mid.clone().sub(edge),ridge=mid.clone().add(new T.Vector3(0,size*.12,0));
        const base=data.length/3;
        const shade=new T.Color(color).lerp(new T.Color(accent),.27+.24*Math.sin(i*3.1+seed));
        for(const [vertex,tint] of [[origin,.75],[left,.89],[ridge,1.23],[right,1.03],[tip,.91]]){
          data.push(...vertex.toArray());colors.push(shade.r*tint,shade.g*tint,shade.b*tint);
        }
        indices.push(base,base+1,base+2,base,base+2,base+3,base+2,base+1,base+4,base+2,base+4,base+3);
      }
      const surface=new T.BufferGeometry();
      surface.setAttribute("position",new T.Float32BufferAttribute(data,3));
      surface.setAttribute("color",new T.Float32BufferAttribute(colors,3));
      surface.setIndex(indices);surface.computeVertexNormals();
      const leaves=new T.Mesh(surface,leafMaterial);
      leaves.userData.ownGeometry=true;leaves.name="Folhas com nervura";parent.add(leaves);
    }
    const leafMaterial=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.86});
    const barkRingGeometry=new T.TorusGeometry(1,.085,6,18);
    function livingTree(data,g,rig){
      const {aspect,lit}=data;
      const [bark,inner,leaves]=[data.bark,data.inner,data.leaves].map(mutedTint),deep=pigment(bark,false);
      const elder=aspect==="elder",moss=aspect==="moss",lichen=new T.Color(moss?0x769b62:0xc29a75);
      const pine=aspect==="pine",cherry=aspect==="cherry",willow=aspect==="willow",mangrove=aspect==="mangrove";
      const grain=(c,a,row)=>{
        const groove=(.5+.5*Math.sin(a*9+(row%4)*.53))**5;
        c.multiplyScalar(.81+groove*.32+Math.cos(a*4+row*.2)*.067);
        if(moss&&Math.sin(a*5+row*.7)>.55)c.lerp(lichen,.30);
      };
      const trunk=hinge(g,0,0,0);rig.body=trunk;
      const crown=hinge(trunk,0,5.65,.042);rig.crown=crown;rig.vines=[];
      const canopy=hinge(crown,0,-5.65,-.042);
      const barkSections=[[0,2.42,.06,.74,.79],[.025,2.81,.12,.89,.99],[.025,3.14,.16,.96,1.06],
        [.09,3.51,.16,.99,1.02],[.02,3.76,.11,.91,.96],[-.045,3.99,.07,.79,elder?.73:.91],
        [.013,4.22,.07,.80,.94],[.062,4.51,.07,.85,elder?.88:1.14],[.032,4.81,.06,.82,1.13],
        [0,5.1,.05,.73,elder?.99:1.24],[.08,5.57,.09,.63,.95],[.07,6.09,.18,.41,.62]];
      taper(trunk,barkSections,[bark,inner],32,[1,0,0],grain).name="Tronco com casca estriada";
      for(let i=0;i<22;i++){
        const a=i*Math.PI*2/22,from=i%4,to=Math.min(barkSections.length,from+5+i%4);
        const path=barkSections.slice(from,to).map(([x,y,z,depth,width],row,span)=>{
          const winding=a+Math.sin(y*1.19+i*.71)*.094,root=row===0||row===span.length-1;
          const edge=root?.956:1.002;
          return [x+Math.sin(winding)*width*edge,y,z+Math.cos(winding)*depth*edge,root?.015:.034+(i%3)*.008];
        });
        taper(trunk,path,[i%4?deep:bark,inner],5,[1,0,0]).name="Veio da casca";
      }
      for(const [x,y,z,size] of [[-.41,3.46,-.711,.20],[.38,4.56,-.704,.21],[.71,3.87,.57,.17]]){
        const knot=hinge(trunk,x,y,z),direction=Math.atan2(x,z);knot.rotation.y=direction;
        part(knot,"oval",deep,[0,0,0],[size*.79,size, size*.30],[0,0,-.30]);
        for(let i=0;i<3;i++){
          const ring=new T.Mesh(barkRingGeometry,material(i===1?inner:bark));
          ring.rotation.z=-.33;ring.position.z=size*.106;
          ring.scale.set(size*(.203+i*.101),size*(.27+i*.123),.085);knot.add(ring);
        }
      }
      for(const side of [-1,1]){
        for(let i=0;i<5;i++){
          const x=side*(.12+i*.17),y=3.05+i*.34,z=-.67+Math.abs(x)*.23;
          taper(trunk,[[x*.62,y-.48,z+.12,.015],[x,y-.15,z,.084],[x+side*.19,y+.51,z-.01,.088],
            [x+side*.22,y+1.06,z+.14,.012]],[deep,inner],6);
        }
        const branchBase=side*(elder?.242:.415);
        taper(trunk,[[branchBase,2.78,-.437,.133],[branchBase+side*.23,3.54,-.662,.155],
          [branchBase+side*.13,4.39,-.694,.104],[branchBase+side*.37,4.86,-.388,.031]],[deep,inner],10,[1,0,0],grain);
        const leg=hinge(trunk,side*.64,3.02,.13);rig.legs.push(leg);
        taper(leg,[[0,.26,.05,.59,.52],[side*.12,-.46,.06,.51,.47],[side*.16,-1.24,.31,.27,.31],
          [side*.12,-1.45,.36,.24,.25]],[bark,inner],12,[1,0,0],grain);
        const shin=hinge(leg,side*.12,-1.32,.32);leg.userData.lower=shin;
        part(shin,"oval",bark,[0,.006,0],[.34,.36,.37]);
        taper(shin,[[0,.18,0,.29,.30],[side*.12,-.38,-.10,.30,.25],[side*.18,-1.25,-.21,.33,.28],
          [side*.21,-1.58,-.33,.43,.39]],[bark,inner],12,[1,0,0],grain);
        for(let claw=-1;claw<=1;claw++){
          taper(shin,[[side*.16+claw*.18,-1.46,-.36,.18],[side*.20+claw*.28,-1.56,-.75,.166],
            [side*.24+claw*.34,-1.63,-1.09,.04]],[deep,inner],7);
        }
        for(const toe of [-1,1])taper(shin,[[side*.15,-1.40,-.25,.16],[side*.26+toe*.22,-1.53,-.02,.12],
          [side*.31+toe*.37,-1.61,.24,.015]],[bark,inner],7,[0,1,0],grain);
        if(mangrove)for(const spread of [-1,1])taper(shin,[[side*.14,-.50,-.12,.138],[side*.40,-.85,spread*.23,.107],
          [side*.54,-1.25,spread*.42,.088],[side*.76,-1.63,spread*.54-.14,.024]],
          [deep,inner],9,[0,0,1],grain).name="Raiz escora";
        const arm=hinge(trunk,side*1.02,5.02,.03);arm.userData.side=side;rig.arms.push(arm);
        taper(arm,[[-side*.22,.30,.07,.43,.55],[side*.22,-.19,.01,.51,.53],
          [side*.51,-.80,.08,.38,.35],[side*.65,-1.39,.15,.26,.28]],[bark,inner],14,[1,0,0],grain);
        const hand=hinge(arm,side*.63,-1.29,.14);arm.userData.lower=hand;
        part(hand,"oval",bark,[0,.036,.013],[.33,.37,.34]);
        taper(hand,[[0,.17,.05,.29],[side*.08,-.33,-.03,.35],[side*.19,-.97,-.38,.32],
          [side*.23,-1.20,-.52,.36]],[bark,inner],9);
        for(let j=-1;j<=1;j++){
          taper(hand,[[side*.22+j*.16,-1.09,-.47,.126],[side*.25+j*.21,-1.38,-.66,.113],
            [side*.26+j*.22,-1.48,-.94,.028]],[deep,inner],6);
        }
        taper(hand,[[side*.043,-.98,-.403,.165],[side*-.137,-1.088,-.559,.118],
          [side*-.202,-1.173,-.738,.037]],[bark,inner],7);
        const wristSprig=[[side*.061,-.42,-.21],[side*.34,-.76,-.31]];
        link(hand,bark,...wristSprig,.027);
        leafSprig(hand,...wristSprig,leaves,lichen,.205,side);
        taper(arm,[[side*.17,.08,-.004,.24],[side*.34,.36,-.019,.20],[side*.59,.61,.10,.11],
          [side*.70,.78,.23,.02]],[bark,inner],9,[0,0,1],grain);
        const elbowSprig=[[side*.22,.23,-.027],[side*.73,.75,.239]];
        link(arm,bark,...elbowSprig,.024);
        leafSprig(arm,...elbowSprig,leaves,pigment(leaves,true),.265,side*3);
        if(moss){
          taper(arm,[[side*.49,.08,-.20,.06],[side*.62,-.34,-.29,.052],[side*.79,-.83,-.16,.027],
            [side*.84,-1.13,-.09,.009]],[leaves,0x9bba72],7);
        }
      }
      const head=hinge(trunk,0,5.31,-.33);rig.head=head;
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
        const a=i*Math.PI/4+(elder||cherry?.25:0),s=Math.sin(a),c=Math.cos(a);
        const length=(i%2?1.39:1.80)+(moss?.12:elder?Math.sin(i*2.3)*.16:willow?.36:pine?-.22:mangrove?.22:0);
        const curve=moss?-.27:elder?.13:cherry?.14:willow?-.18:0;
        const branch=[[s*.24,5.27,c*.30,.28],[s*.57,6.17,c*.63,.27],
          [s*1.03,7.02+curve*.28,c*.96,.19],[s*length,7.47+(i%3)*.14+curve,c*length,.054]];
        taper(canopy,branch,[bark,inner],13,[0,0,1],grain);
        for(let j=0;j<5;j++){
          const from=branch[j<2?1:2].slice(0,3),edge=j%2?1:-1;
          const r=j===4?(pine?.22:.92):length+(.03+j*.13)-(pine?j*.22:0);
          const x=s*r+c*edge*(.26+j*.066),z=c*r-s*edge*(.26+j*.066);
          const y=(j===4?8.22:j===0?6.90:7.29+j*.16)+curve*.65+Math.sin(i*1.93)*.11;
          const to=[x,y,z],fork=from.map((v,k)=>T.MathUtils.lerp(v,to[k],.52));
          fork[1]+=.16;
          taper(canopy,[[...from,.091],[...fork,.063],[...to,.015]],[bark,inner],7);
          const shade=cherry&&j%2?0xe3a0b3:leaves;
          leafSprig(canopy,fork,to,shade,cherry?0xf6bcce:pigment(leaves,true),.32+j*.034,i*4+j,pine?.078:willow?.15:.27);
          if(cherry&&j%2===0&&j<4){
            const flower=hinge(canopy,...to);
            flower.name="Flor de cerejeira";
            for(let petal=0;petal<5;petal++){
              const angle=petal*Math.PI*.4;
              part(flower,"oval",petal%2?0xe7a0b8:0xd57d9e,[Math.sin(angle)*.072,.04,Math.cos(angle)*.072],
                [.076,.032,.084],[.19,angle,.12]);
            }
            part(flower,"oval",0xf6cc8f,[0,.059,0],[.047,.023,.047]);
          }
          if(elder&&j%2===0){
            const stalk=from.map((v,k)=>T.MathUtils.lerp(fork[k],to[k],.69));
            const fruit=[stalk[0]+s*.084,stalk[1]-.26,stalk[2]+c*.084];
            link(canopy,bark,stalk,fruit,.023);
            part(canopy,"shard",lit,fruit,[.11,.148,.097],[0,0,a],true);
          }
        }
        if(willow||moss&&i%2===0){
          const vine=hinge(canopy,...branch.at(-1).slice(0,3));rig.vines.push(vine);
          const length=willow?1.64+i%3*.25:1.16;
          const a=[s*.20,-length*.23,c*.15],b=[s*.31,-length*.61,c*.20],tip=[s*.16,-length,c*.16];
          taper(vine,[[0,0,0,.071],[...a,.051],[...b,.036],[...tip,.010]],[leaves,0xaac17d],7,[0,0,1]);
          leafSprig(vine,a,b,leaves,lichen,.21,i,.17);
          if(willow)leafSprig(vine,b,tip,leaves,lichen,.22,i+3,.16);
        }
        if(pine&&i%2===0){
          const anchor=branch[2].slice(0,3),cone=[anchor[0]+s*.084,anchor[1]-.24,anchor[2]+c*.08];
          link(canopy,bark,anchor,cone,.022);
          part(canopy,"facet",bark,cone,[.144,.203,.142],[.3,a,.18]).name="Pinha";
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
    function geode(parent,x,y,z,r,stone,gem,yaw=0){
      const socket=hinge(parent,x,y,z);socket.rotation.y=yaw;socket.name="Geodo";
      const rims=[[.04,.42],[.49,.30],[.73,.06],[.84,-.16],[.98,-.085],[1.07,.16],[.79,.57],[.04,.61]];
      const nodes=[],colors=[],indices=[],segments=13;
      const shade=new T.Color(stone),bright=new T.Color(gem),tone=new T.Color();
      for(const [row,[width,depth]] of rims.entries())for(let i=0;i<segments;i++){
        const a=i/segments*Math.PI*2,rough=1+Math.sin(a*3+.41)*.113+Math.cos(a*5-.08)*.081;
        nodes.push(Math.cos(a)*r*width*rough,Math.sin(a)*r*width*1.11*rough,r*(depth+Math.sin(a*3)*.045));
        tone.copy(shade).lerp(bright,[.38,.49,.77,.52,.16,.02,.01,0][row]).multiplyScalar(.72+.21*rough);
        colors.push(tone.r,tone.g,tone.b);
        if(row<rims.length-1){
          const n=row*segments+i,next=row*segments+(i+1)%segments;
          indices.push(n,next,n+segments,next,next+segments,n+segments);
        }
      }
      const surface=new T.BufferGeometry();
      surface.setAttribute("position",new T.Float32BufferAttribute(nodes,3));
      surface.setAttribute("color",new T.Float32BufferAttribute(colors,3));
      surface.setIndex(indices);surface.computeVertexNormals();
      const rock=new T.Mesh(surface,skinMaterial);rock.userData.ownGeometry=true;socket.add(rock);
      for(let i=0;i<12;i++){
        const a=i*2.399,x=Math.sin(a)*r*(.19+i*.028),y=Math.cos(a)*r*(.20+i*.026);
        const depth=r*(.24-(i%4)*.105),height=r*(.23+(i%4)*.21),width=r*(.058+(i%3)*.023);
        const crystal=taper(socket,[[x,y,depth,width],[x*.90,y*1.04,depth-height*.55,width*.94],
          [x*.77,y*1.10,depth-height,.001]],[gem,pigment(gem,true)],6,[0,1,0]);
        if(i%3===0)crystal.material=material(gem,true);
      }
      return socket;
    }
    function siteWarden(data,g,rig,attachLeg){
      const {color,secondary,aspect,alloy}=data,dune=aspect==="dune",lab=aspect==="lab",basalt=aspect==="basalt";
      const gem=aspect==="gem",forged=aspect==="metal";
      const metal=lab?0x35434e:dune?0x6e5746:0x34323e,edge=pigment(color,true),metalLit=lab?0xb4835d:dune?0xc8a35d:0x77636a;
      let alloyMaterial;
      if(forged){
        const key="sentinel-alloy:"+alloy;
        if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color:alloy,metalness:.68,roughness:.33,flatShading:true}));
        alloyMaterial=materials.get(key);
      }
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
        if(gem){
          for(let i=0;i<3;i++){
            const x=side*(.13+i*.070),y=.165-i*.071;
            part(head,"shard",color,[x,y,.027],[.113,.132,.101],[.16,side*.30,side*.26]);
            taper(head,[[x,y+.016,.027,.054],[x+side*.033,y+.110,.059,.053],[x+side*.059,y+.195-i*.022,.081,.009]],
              [color,secondary],5,[0,0,1]).name="Cristal da coroa";
          }
          for(let i=0;i<3;i++){
            const x=side*(.12+i*.051);
            link(rig.body,secondary,[x,.038-i*.038,-.395+i*.046],[x+side*.042,.087-i*.031,-.362+i*.043],.012);
          }
        }else if(forged){
          part(head,"chamfer",alloy,[side*.216,.081,.035],[.13,.27,.278],[.18,side*.18,side*.19]).material=alloyMaterial;
          part(head,"disk",alloy,[side*.268,.055,.015],[.094,.027,.094],[0,0,Math.PI/2]).material=alloyMaterial;
          part(head,"chamfer",alloy,[side*.113,.119,-.270],[.193,.031,.095],[0,side*.22,side*.27]).material=alloyMaterial;
        }else if(basalt){
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
        if(gem)for(let i=0;i<3;i++){
          const x=side*(.10+i*.037),y=.032-i*.071,z=-.019+i*.044;
          taper(arm,[[x,y,z,.074],[x+side*.107,y+.104,z+.011,.059],[x+side*.174,y+.183,z+.036,.009]],
            [edge,secondary],5,[1,0,0]);
        }
        if(forged)for(let i=0;i<3;i++){
          part(arm,"chamfer",alloy,[side*(.068+i*.024),.039-i*.079,-.075],[.34-i*.037,.124,.26],
            [.15,side*.18,side*.21]).material=alloyMaterial;
          part(arm,"oval",metal,[side*(.133+i*.014),.056-i*.080,-.195],[.029,.026,.029]);
        }
        const wrist=hinge(arm,side*.11,-.38,0);arm.userData.lower=wrist;
        taper(wrist,[[0,.045,.012,.107],[0,-.104,.023,.102],[side*.028,-.219,-.019,.133],[0,-.331,-.026,.086]],[color,edge],8);
        part(wrist,"chamfer",metal,[0,-.339,-.041],[.199,.192,.185],[.19,0,0]);
        if(forged){
          const sleeve=part(wrist,"disk",alloy,[0,-.198,-.002],[.149,.23,.14],[.14,0,side*.08]);
          sleeve.material=alloyMaterial;sleeve.name="Braçadeira metálica";
          for(let i=-1;i<=1;i++)part(wrist,"chamfer",alloy,[i*.052,-.362,-.125],[.052,.104,.056],
            [.20,0,i*.14]).material=alloyMaterial;
        }
        if(gem)geode(arm,side*.133,-.037,-.122,.097,color,secondary,side*.18);
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
        if(forged){
          for(let i=0;i<3;i++)part(lower,"chamfer",alloy,[0,-.131-i*.077,-.111],[.176-i*.017,.091,.094],
            [.12,0,0]).material=alloyMaterial;
          part(lower,"chamfer",alloy,[0,-.393,-.187],[.243,.088,.165],[.13,0,0]).material=alloyMaterial;
        }
      }
      function meshWardenCore(){
        if(forged){
          for(let i=0;i<4;i++){
            part(rig.body,"chamfer",alloy,[0,.188-i*.113,-.329],[.49-i*.037,.139,.144],[.14,0,0]).material=alloyMaterial;
            for(const side of [-1,1])part(rig.body,"oval",metal,[side*(.177-i*.013),.19-i*.112,-.411],[.031,.026,.026]);
          }
          part(rig.body,"diamond",secondary,[0,.046,-.451],[.111,.13,.046],[0,0,.20],true);
        }else if(gem){
          geode(rig.body,0,.040,-.430,.190,color,secondary);
        }else if(dune){
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
    const dragonSkin=new T.MeshStandardMaterial({vertexColors:true,roughness:.72});
    const dragonKeratin=new T.MeshStandardMaterial({vertexColors:true,roughness:.31,metalness:.08});
    const dragonMembrane=new T.MeshStandardMaterial({vertexColors:true,roughness:.77,side:T.DoubleSide});
    const skinnedMaterials=new WeakMap();
    function skinnedMaterial(source){
      if(!skinnedMaterials.has(source)){
        const material=source.clone();
        material.skinning=true;
        skinnedMaterials.set(source,material);
      }
      return skinnedMaterials.get(source);
    }
    const glowPlane=new T.PlaneGeometry(1,1);
    function dragonGlow(parent,tint,x,y,z,size,opacity){
      const material=new T.ShaderMaterial({
        uniforms:{tint:{value:new T.Color(tint)},strength:{value:opacity}},
        vertexShader:`varying vec2 coord;
          void main(){coord=uv-.5;vec4 center=modelViewMatrix*vec4(0.,0.,0.,1.);
          float scale=length(modelMatrix[0].xyz);
          gl_Position=projectionMatrix*(center+vec4(position.xy*scale,0.,0.));}`,
        fragmentShader:`varying vec2 coord;uniform vec3 tint;uniform float strength;
          void main(){float falloff=1.-smoothstep(.02,.5,length(coord));
          gl_FragColor=vec4(tint,falloff*falloff*strength);}`,
        transparent:true,depthWrite:false,blending:T.AdditiveBlending
      });
      const glow=new T.Mesh(glowPlane,material);
      glow.position.set(x,y,z);glow.scale.setScalar(size);
      glow.userData.ownMaterial=true;glow.userData.noShadow=true;parent.add(glow);
      return glow;
    }
    function dragonTaper(parent,points,colors,segments=12,reference,paint){
      const mesh=taper(parent,points,colors,segments,reference,paint);
      mesh.material=dragonSkin;mesh.castShadow=true;mesh.receiveShadow=true;
      return mesh;
    }
    function dragonCurve(parent,knots,colors,segments,reference,paint,ridges=0){
      const path=new T.CatmullRomCurve3(knots.map(([x,y,z])=>new T.Vector3(x,y,z)),false,"catmullrom",.43);
      const points=path.getPoints((knots.length-1)*4).map((p,i,all)=>{
        const t=i/4,j=Math.min(knots.length-2,Math.floor(t)),u=t-j;
        const a=knots[j],b=knots[j+1];
        const waviness=1+Math.cos(i*1.77)*ridges*(1-i/all.length);
        const r=T.MathUtils.lerp(a[3],b[3],u),d=T.MathUtils.lerp(a[4]??a[3],b[4]??b[3],u);
        return [...p.toArray(),r*waviness,d*waviness];
      });
      return dragonTaper(parent,points,colors,segments,reference,paint);
    }
    function dragonHorn(parent,knots,colors,crystal=false,material=dragonKeratin){
      const segments=crystal?10:15;
      const mesh=dragonCurve(parent,knots,colors,segments,[0,0,1],
        (color,a,i)=>color.multiplyScalar(.85+Math.sin(a*2)**2*.16+Math.sin(i*1.77)*.08),.08);
      mesh.material=material;
      if(material===dragonKeratin)return mesh;
      const rings=(knots.length-1)*4;
      const charge=Float32Array.from({length:mesh.geometry.attributes.position.count},(_,i)=>{
        const along=Math.floor(i/segments)/rings;
        return T.MathUtils.lerp(.14,1,along**1.6)*(.84+.16*Math.cos(i%segments/segments*Math.PI*2));
      });
      mesh.geometry.setAttribute("hornCharge",new T.BufferAttribute(charge,1));
      mesh.name="Chifre dracônico";
      return mesh;
    }
    function dragonLegSkin(leg,lower,foot,colors,girth,front){
      const [upper,shin]=leg.userData.bones,side=Math.sign(leg.position.x),ankle=upper+shin;
      const knee=front?-.029:.044,segments=15;
      const mesh=dragonCurve(leg,[
        [-side*.115,.243,.044,.105,.137],[-side*.068,.164,.057,.153,.177],
        [-side*.030,.079,.032,front?.174:.217,front?.179:.234],
        [side*.013,-.071,knee,.142,.161],[side*.009,-.205,knee*.90,.103,.119],
        [0,-upper-.013,0,.089,.091],[0,-upper-.11,.032,.074,.084],
        [0,-ankle+.128,.025,.060,.069],[0,-ankle+.037,.012,.065,.075],
        [0,-ankle-.018,-.013,.073,.095],[0,-ankle-.021,-.075,.060,.119],
        [0,-ankle-.029,-.129,.041,.099],[0,-ankle-.030,-.170,.025,.057]
      ].map(([x,y,z,r,d])=>[x,y,z,r*girth,d*girth]),colors,segments,[1,0,0],(color,a,i)=>{
        const groove=Math.cos(a*13+i*.61)*.5+.5;
        color.multiplyScalar(.89+.15*groove+.13*Math.sin(a)**2);
      });
      mesh.name="Pele contínua da perna e da pata";mesh.frustumCulled=false;
      const position=mesh.geometry.getAttribute("position").setUsage(T.DynamicDrawUsage);
      const rest=position.array.slice(),weights=new Float32Array(position.count*3);
      for(let i=0;i<position.count;i++){
        const ring=Math.floor(i/segments)/4;
        weights[i*3]=1-T.MathUtils.smoothstep(ring,.38,3.25);
        weights[i*3+1]=T.MathUtils.smoothstep(ring,4.12,5.88);
        weights[i*3+2]=T.MathUtils.smoothstep(ring,7.62,9.18);
      }
      const socket=new T.Quaternion(),lastHip=new T.Quaternion(),lastKnee=new T.Quaternion(),lastAnkle=new T.Quaternion();
      const shinMatrix=new T.Matrix4(),footMatrix=new T.Matrix4();
      const undoShin=new T.Matrix4().makeTranslation(0,upper,0),undoAnkle=new T.Matrix4().makeTranslation(0,ankle,0);
      const original=new T.Vector3(),vertex=new T.Vector3(),bent=new T.Vector3();
      leg.userData.flexLeg=()=>{
        if(lastHip.angleTo(leg.quaternion)<.002&&lastKnee.angleTo(lower.quaternion)<.002&&lastAnkle.angleTo(foot.quaternion)<.002)return;
        lastHip.copy(leg.quaternion);lastKnee.copy(lower.quaternion);lastAnkle.copy(foot.quaternion);
        socket.copy(lastHip).invert();
        lower.updateMatrix();foot.updateMatrix();
        shinMatrix.multiplyMatrices(lower.matrix,undoShin);
        footMatrix.multiplyMatrices(lower.matrix,foot.matrix).multiply(undoAnkle);
        for(let i=0;i<position.count;i++){
          original.fromArray(rest,3*i);vertex.copy(original);
          const hip=weights[i*3],bend=weights[i*3+1],paw=weights[i*3+2];
          if(hip)vertex.lerp(bent.copy(original).applyQuaternion(socket),hip);
          if(bend)vertex.lerp(bent.copy(original).applyMatrix4(shinMatrix),bend);
          if(paw)vertex.lerp(bent.copy(original).applyMatrix4(footMatrix),paw);
          position.setXYZ(i,vertex.x,vertex.y,vertex.z);
        }
        position.needsUpdate=true;mesh.geometry.computeVertexNormals();
      };
    }
    function dragonPlates(parent,sections,coat,back,belly,crest){
      const positions=[],colors=[],indices=[];
      const profile=new T.CatmullRomCurve3(sections.map(([z,y,rx,ry])=>new T.Vector3(z,rx,ry)),false,"catmullrom");
      const height=new T.CatmullRomCurve3(sections.map(([z,y])=>new T.Vector3(z,y,0)),false,"catmullrom");
      function plate(t,a,halfWidth,halfLength,base,edge,depth){
        const first=positions.length/3;
        const add=(dt,da,rise,color)=>{
          const p=profile.getPoint(t+dt),y=height.getPoint(t+dt).y;
          positions.push(...torsoShape([p.x,y,p.y+rise,p.z+rise],a+da));
          colors.push(color.r,color.g,color.b);
        };
        const outline=[[-1,0],[-.70,-.76],[-.16,-1],[.50,-.71],[1,-.13],
          [.87,.32],[.39,.80],[-.20,1],[-.72,.67]];
        add(-halfLength*.22,0,depth,base);
        const shoulder=base.clone().lerp(edge,.28);
        for(const [dt,da] of outline)add(dt*halfLength*.73,da*halfWidth*.75,depth*.64,shoulder);
        for(const [dt,da] of outline)add(dt*halfLength,da*halfWidth,.004,edge);
        for(let i=0;i<outline.length;i++){
          const a=first+1+i,b=first+1+(i+1)%outline.length,n=outline.length;
          indices.push(first,a,b,a,a+n,b,b,a+n,b+n);
        }
      }
      const dark=new T.Color(back),main=new T.Color(coat),under=new T.Color(belly);
      for(let row=0;row<14;row++){
        const t=.085+row*.061;
        for(let column=-5;column<=5;column++){
          const a=(column+(row%2)*.46)*.263,flank=Math.abs(column)/5;
          const scale=main.clone().lerp(dark,(crest==="stone"?.38:.15)+.26*Math.abs(Math.cos(row*2.17+column)));
          const seam=scale.clone().lerp(dark,.44+flank*.19);
          plate(t,a,.148-flank*.014,.038-flank*.007,scale.multiplyScalar(1.20),seam,.031-flank*.015);
        }
        for(let column=-1;column<=1;column++){
          const lit=under.clone().multiplyScalar(1.04-Math.abs(column)*.12);
          plate(t,Math.PI+column*.49,.290,.035,lit,under.clone().lerp(dark,.33),.022);
        }
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute("position",new T.Float32BufferAttribute(positions,3));
      geo.setAttribute("color",new T.Float32BufferAttribute(colors,3));
      geo.setIndex(indices);geo.computeVertexNormals();
      const plates=new T.Mesh(geo,dragonSkin);plates.receiveShadow=true;
      plates.userData.ownGeometry=true;plates.userData.noShadow=true;parent.add(plates);
    }
    function dragonChargeScutes(parent,rig,surfaces,coat,iris,stage){
      const vertices=[],indices=[];
      for(const {center,normal,wide,long} of surfaces){
        const lateral=new T.Vector3(1,0,0).addScaledVector(normal,-normal.x).normalize();
        const along=new T.Vector3().crossVectors(normal,lateral);
        const i=vertices.length/3;
        vertices.push(...center.clone().addScaledVector(normal,.025).toArray());
        for(let j=0;j<8;j++){
          const a=j*Math.PI/4;
          vertices.push(...center.clone().addScaledVector(lateral,Math.cos(a)*wide)
            .addScaledVector(along,Math.sin(a)*long).addScaledVector(normal,-.003).toArray());
          indices.push(i,i+1+j,i+1+(j+1)%8);
        }
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute("position",new T.Float32BufferAttribute(vertices,3));
      geo.setIndex(indices);geo.computeVertexNormals();
      const material=new T.MeshStandardMaterial({color:coat,roughness:.55,metalness:.07,emissive:iris,emissiveIntensity:0});
      const mesh=new T.Mesh(geo,material);
      mesh.name="Escamas da carga";mesh.userData={ownGeometry:true,ownMaterial:true,noShadow:true};
      mesh.receiveShadow=true;parent.add(mesh);
      rig.chargeScales.push({material,stage,mesh});
    }
    function dragonWingPoint(wrist,a,b,t,u,side,crest){
      const scallop=Math.sin(Math.PI*u)**1.48;
      const flexible=a.flex&&b.flex;
      const notch=flexible?(crest==="leaf"?.086:crest==="stone"?.144:.189):.053;
      const edge=a.p.map((v,i)=>v+(b.p[i]-v)*u);
      edge[0]-=side*scallop*notch*.56;
      edge[1]-=scallop*(crest==="leaf"?.084:.055);
      edge[2]-=scallop*notch;
      const point=wrist.map((v,i)=>v+(edge[i]-v)*t);
      const arch=Math.sin(t*Math.PI);
      const rib=Math.sin(Math.PI*u*3)**2*Math.sin(Math.PI*u);
      const hem=.017*T.MathUtils.smoothstep(t,.86,.956)*(1-T.MathUtils.smoothstep(t,.961,1))*scallop;
      point[1]+=arch*(.048+.064*scallop+rib*.023)+hem;
      return point;
    }
    function dragonWingSkin(parent,hinge,wrist,outline,side,colors,crest){
      const positions=[],tints=[],indices=[],binding=[],steps=12,across=9;
      const [shade,skin,sheen]=colors.map(c=>new T.Color(c));
      const add=(p,flex,color)=>{
        positions.push(...p);binding.push(flex);tints.push(color.r,color.g,color.b);
        return binding.length-1;
      };
      const triangle=(a,b,c)=>indices.push(a,side>0?b:c,side>0?c:b);
      const center=add(wrist,0,shade);
      let boundary=[];
      for(let sector=0;sector<outline.length-1;sector++){
        const a=outline[sector],b=outline[sector+1],nextBoundary=[];
        let previous=[center];
        for(let row=1;row<=steps;row++){
          const t=row/steps,width=Math.max(1,Math.round(across*t)),ring=[];
          for(let k=0;k<=width;k++){
            if(k===0&&sector>0){ring.push(boundary[row-1]);continue}
            const u=k/width,vein=Math.sin(Math.PI*u),p=dragonWingPoint(wrist,a,b,t,u,side,crest);
            const tint=shade.clone().lerp(skin,Math.sin(t*Math.PI*.86)*(.29+vein*.67));
            const grain=Math.cos(t*38+u*9+sector)*.055+Math.sin(t*17-u*32)*.058;
            tint.lerp(sheen,vein*Math.sin(t*Math.PI)*.57).multiplyScalar(1+grain);
            if(t>.82)tint.lerp(shade,T.MathUtils.smoothstep(t,.82,1)*.53);
            const flex=T.MathUtils.smoothstep(u,.06,.94);
            ring.push(add(p,a.flex+(b.flex-a.flex)*flex,tint));
          }
          nextBoundary.push(ring.at(-1));
          let i=0,j=0;
          while(i<previous.length-1||j<ring.length-1){
            if(i<previous.length-1&&(j===ring.length-1||(i+1)/(previous.length-1)<=(j+1)/(ring.length-1))){
              triangle(previous[i],previous[++i],ring[j]);
            }else{
              triangle(previous[i],ring[j+1],ring[j]);j++;
            }
          }
          previous=ring;
        }
        boundary=nextBoundary;
      }
      const geo=new T.BufferGeometry();
      const position=new T.Float32BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage);
      geo.setAttribute("position",position);geo.setAttribute("color",new T.Float32BufferAttribute(tints,3));
      geo.setIndex(indices);geo.computeVertexNormals();
      const membrane=new T.Mesh(geo,dragonMembrane);
      membrane.castShadow=membrane.receiveShadow=true;membrane.frustumCulled=false;
      membrane.userData.ownGeometry=true;parent.add(membrane);
      const offset=new T.Vector3(...wrist),rest=new T.Vector3(),bent=new T.Vector3(),last=new T.Quaternion();
      return ()=>{
        if(last.angleTo(hinge.quaternion)<.005)return;
        last.copy(hinge.quaternion);
        for(let i=0;i<binding.length;i++){
          if(!binding[i])continue;
          rest.fromArray(positions,i*3);
          bent.copy(rest).sub(offset).applyQuaternion(last).add(offset);
          rest.lerp(bent,binding[i]);position.setXYZ(i,rest.x,rest.y,rest.z);
        }
        position.needsUpdate=true;geo.computeVertexNormals();
      };
    }
    function dragon(data,g,rig,attachLeg){
      const {coat,back,belly,wing,horn,eye:iris,crest,form}=data;
      const ice=crest==="crystal",fire=crest==="ember",green=crest==="leaf",time=crest==="hourglass",earth=crest==="stone";
      rig.form=form;rig.frills=[];rig.tailJoints=[];rig.chargeScales=[];rig.hornGlows=[];
      const hornMaterial=rig.hornMaterial=dragonKeratin.clone();
      hornMaterial.emissive.set(iris);
      hornMaterial.emissiveIntensity=0;
      hornMaterial.onBeforeCompile=shader=>{
        shader.vertexShader=shader.vertexShader
          .replace("#include <common>","#include <common>\nattribute float hornCharge; varying float hornRadiance;")
          .replace("#include <begin_vertex>","#include <begin_vertex>\nhornRadiance=hornCharge;");
        shader.fragmentShader=shader.fragmentShader
          .replace("#include <common>","#include <common>\nvarying float hornRadiance;")
          .replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\ntotalEmissiveRadiance*=hornRadiance;");
      };
      const {length,girth,neck,skull,span,chord,lift,tail:tailLength}=form;
      const root=g;
      rig.flightBody=hinge(root,0,.89,0);
      g=hinge(rig.flightBody,0,-.89,0);
      const body=hinge(g,0,.89,.02);rig.body=body;
      const hull=[[-.87,.087,.10,.14],[-.76,.105,.213,.271],[-.60,.107,.365,.358],[-.39,.09,.458,.421],
        [-.13,.058,.424,.385],[.17,-.006,.346,.299],[.40,-.003,.334,.270],[.56,.003,.355,.275],
        [.75,.026,.276,.220],[.94,.054,.117,.117]]
        .map(([z,y,w,h])=>[z*length,y,w*girth*(z<-.19?(earth?1.058:green?.965:1):1),h*(earth?1.07:ice?.91:1)]);
      const profile=new T.CatmullRomCurve3(hull.map(([z,y,w,h])=>new T.Vector3(z,w,h)),false,"catmullrom");
      const centerline=new T.CatmullRomCurve3(hull.map(([z,y])=>new T.Vector3(z,y,0)),false,"catmullrom");
      const rings=profile.getPoints(38).map(({x,y,z},i)=>[x,centerline.getPoint(i/38).y,y,z]);
      contour(body,rings,[coat,belly],"",44,torsoShape,(color,z,a)=>{
        const scales=(Math.cos(z*32+Math.sin(a*11))*.5+.5)*(Math.cos(a*17+z*13)*.5+.5);
        color.multiplyScalar(.70+scales*.19+Math.sin(a)**2*.19);
      });
      dragonPlates(body,hull,coat,back,belly,crest);
      const scaleTint=new T.Color(belly).lerp(new T.Color(back),.27);
      for(let row=0;row<4;row++){
        const t=.525-row*.095,p=profile.getPoint(t),y=centerline.getPoint(t).y;
        const chest=[-2,-1,0,1,2].map(side=>{
          const a=Math.PI+side*.39;
          return {center:new T.Vector3(...torsoShape([p.x,y,p.y+.013,p.z+.015],a)),
            normal:new T.Vector3(Math.sin(a),Math.cos(a),-.22).normalize(),
            wide:Math.min(.075,p.y*.22),long:.045+row*.002};
        });
        dragonChargeScutes(body,rig,chest,scaleTint,iris,.025+row*.075);
      }
      const neckPoint=([x,y,z,r,d])=>[x,.98+(y-.98)*neck,-.58*length+(z+.58)*neck,r*girth,d*girth];
      const neckBase=neckPoint([0,.98,-.58,0,0]),neckJoint=hinge(body,0,neckBase[1]-.89,neckBase[2]-.02);
      rig.neck=neckJoint;
      const neckLocal=p=>neckPoint(p).map((v,i)=>i<3?v-neckBase[i]:v);
      const neckKnots=[[0,.875,-.395,.241,.220],[0,.96,-.55,.260,.255],[0,1.04,-.649,.237,.23],
        [0,1.136,-.745,.205,.211],[0,1.237,-.827,.181,.194],[0,1.33,-.903,.157,.165],
        [0,1.425,-.976,.151,.162],[0,1.50,-1.040,.148,.155],[0,1.587,-1.143,.128,.137]].map(neckLocal);
      dragonCurve(neckJoint,neckKnots,[coat,back],26,
        [1,0,0],(color,a,i)=>color.lerp(new T.Color(belly),Math.max(0,Math.cos(a))*(.47+.27*Math.min(1,i/14)))
          .multiplyScalar(.89+(Math.cos(a*5+i*.67)*.5+.5)*.20));
      for(let i=2;i<neckKnots.length;i++){
        const [x,y,z,r,d]=neckKnots[i],prev=neckKnots[i-1],next=neckKnots[Math.min(i+1,neckKnots.length-1)];
        const forward=new T.Vector3(0,next[2]-prev[2],prev[1]-next[1]).normalize();
        const throat=[-1,0,1].map(side=>{
          const angle=side*.53;
          const normal=forward.clone().multiplyScalar(Math.cos(angle)).setX(Math.sin(angle));
          const center=new T.Vector3(x+Math.sin(angle)*d,y,z).addScaledVector(forward,Math.cos(angle)*(r+.012));
          return {center,normal,wide:d*(side?.24:.30),long:.038};
        });
        dragonChargeScutes(neckJoint,rig,throat,scaleTint,iris,.32+(i-2)*.081);
      }
      const [hx,hy,hz]=neckLocal([0,1.58,-1.06,0,0]),head=hinge(neckJoint,hx,hy,hz);rig.head=head;head.scale.set(...skull);
      const throat=neckLocal([0,1.29,-.99,0,0]);
      rig.throatGlow=dragonGlow(neckJoint,iris,...throat.slice(0,3),.34,0);
      rig.throatGlow.visible=false;
      contour(head,[[-.586,-.052,.077,.057],[-.545,-.041,.125,.074],[-.483,-.018,.166,.091],
        [-.385,-.002,.157,.105],[-.29,.044,.204,.149],[-.185,.076,.243,.184],
        [-.080,.085,.230,.192],[.037,.058,.226,.176],[.151,.028,.165,.135],[.225,.014,.091,.077]],
        [coat,belly],"",36,torsoShape,(color,z,a)=>{
          const facet=Math.sin(a*9+z*28);
          color.multiplyScalar(.88+Math.max(0,facet)*.17+.08*Math.cos(a));
        });
      const jaw=hinge(head,0,-.093,-.185);rig.jaw=jaw;
      contour(jaw,sculptSections([[-.403,-.015,.059,.029],[-.364,-.026,.112,.049],[-.306,-.045,.139,.062],
        [-.226,-.056,.155,.073],[-.148,-.053,.158,.079],[-.066,-.039,.144,.076],[-.012,-.022,.116,.063],
        [.074,-.008,.058,.043]]),[back,belly],"",38,torsoShape,(color,z,a)=>{
          color.multiplyScalar(.93+.08*Math.cos(z*83+Math.cos(a)*3));
        }).name="Mandíbula e queixo escamados";
      const roof=dragonCurve(head,[[0,-.073,-.522,.075,.021],[0,-.087,-.385,.137,.030],
        [0,-.063,-.239,.172,.039],[0,-.039,-.144,.156,.055],[0,-.043,-.061,.086,.062]],
        [0x482533,0x975258],24,[1,0,0]);
      roof.name="Palato";
      dragonCurve(jaw,[[0,-.012,-.392,.044,.018],[0,-.009,-.295,.094,.020],[0,-.008,-.186,.122,.027],
        [0,-.006,-.077,.113,.030],[0,-.009,.041,.062,.037]],[0x442331,0x9f5961],25,[1,0,0]).name="Assoalho da boca";
      const tongue=hinge(jaw,0,.015,.015);rig.tongue=tongue;
      dragonCurve(tongue,[[0,-.006,.013,.043,.018],[0,.022,-.071,.072,.027],[0,.020,-.159,.067,.020],
        [0,.015,-.253,.052,.015],[0,.013,-.324,.021,.009],[0,.010,-.347,.005,.003]],
        [0x8f384b,0xdc8082],24,[1,0,0]).name="Língua articulada";
      dragonCurve(tongue,[[0,.044,-.077,.004],[0,.038,-.169,.004],[0,.026,-.267,.003]],
        [0x9d4a5c,0xcc7378],7,[1,0,0]).name="Sulco da língua";
      for(let i=0;i<2;i++){
        const scutes=[-1,0,1].map(side=>({center:new T.Vector3(side*.068,-.087+i*.007,-.102-i*.133),
          normal:new T.Vector3(side*.32,-.93,-.15).normalize(),wide:side?.028:.038,long:.040}));
        dragonChargeScutes(jaw,rig,scutes,scaleTint,iris,.89+i*.075);
      }
      rig.nose=hinge(head,0,-.070,-.56);
      rig.breathGlow=dragonGlow(head,iris,0,-.095,-.60,.49,0);
      rig.breathGlow.visible=false;
      for(const side of [-1,1]){
        const topGum=[],bottomGum=[];
        for(let i=0;i<6;i++){
          const z=-.493+i*.072,x=[.077,.115,.139,.159,.176,.179][i]*side;
          topGum.push([x,-.086+i*.008,z,.022-i*.001,.023]);
          bottomGum.push([x*.77,-.004-i*.002,z+.102,.016,.019]);
        }
        dragonCurve(head,topGum,[0x672f3d,0xbb6669],18,[0,1,0]).name="Gengiva superior";
        dragonCurve(jaw,bottomGum,[0x6e3646,0xbb626b],18,[0,1,0]).name="Gengiva inferior";
        const cheek=hinge(jaw,side*.104,-.006,-.017);(rig.mouthCorners??=[]).push(cheek);
        dragonCurve(cheek,[[0,-.024,-.03,.021],[side*.024,.015,.008,.036],
          [side*.019,.061,.055,.037],[0,.102,.052,.013]],[0x4e2937,0x954d59],16).name="Comissura da boca";
        for(let i=0;i<5;i++){
          const z=-.068-i*.064,x=side*(.104-i*.012),y=-.096-Math.sin(i*.68)*.018;
          dragonCurve(jaw,[[x,y+.017,z+.038,.022],[x*.72,y-.018,z+.012,.025],
            [x*.41,y-.025,z-.018,.012]],[back,belly],10,[1,0,0]).name="Placas submandibulares";
        }
        dragonCurve(head,[[side*.095,-.086,-.455,.023,.014],[side*.154,-.072,-.350,.032,.021],
          [side*.190,-.048,-.229,.041,.029],[side*.187,-.036,-.116,.054,.040],
          [side*.160,-.008,-.028,.037,.027]],[back,coat],11);
        dragonCurve(jaw,[[side*.119,-.028,.055,.063],[side*.130,-.011,-.062,.038],
          [side*.128,-.015,-.195,.019],[side*.093,-.006,-.337,.009]],[back,coat],11);
        part(head,"oval",coat,[side*.097,.021,-.501],[.067,.032,.056],[0,side*.28,-side*.22]);
        part(head,"oval",back,[side*.108,.037,-.520],[.039,.012,.029],[0,side*.28,-side*.22]);
        const eyeGroup=hinge(head,side*.187,.119,-.244);
        part(eyeGroup,"oval",back,[0,0,0],[.081,.057,.077],[0,side*.52,0]);
        const irisRig=hinge(eyeGroup,side*.040,0,-.055);irisRig.rotation.y=-side*.62;
        part(irisRig,"oval",iris,[0,0,0],[.062,.039,.027],[0,0,0],true);
        serpentPupil(irisRig,[0,0,-.028],.012,.036);
        part(irisRig,"oval",0xfff6d7,[-.019,.014,-.023],[.006,.006,.006],[0,0,0],true).userData.noShadow=true;
        dragonGlow(eyeGroup,iris,side*.032,.002,-.044,.228,.22);
        const lid=part(irisRig,"oval",back,[0,.014,-.015],[.062,.037,.028]);
        lid.visible=false;rig.eyes.push(lid);
        const brow=[[side*.125,.176,-.30],[side*.208,.177,-.217],[side*.238,.192,-.125],[side*.234,.149,-.07]];
        dragonCurve(head,brow.map((p,i)=>[...p,.048-i*.010,.036-i*.007]),[back,coat],11);
        for(let i=0;i<3;i++){
          const z=-.15+i*.084,x=side*(.204-i*.023),y=.011+i*.013;
          part(head,crest==="crystal"||crest==="stone"?"shard":"chamfer",i%2?back:coat,[x,y,z],
            [.056,.044,.094],[.11,side*.41,side*.15]);
        }
        const horns=ice?[[.128,.143,.040,.076],[.164,.35,.123,.071],[.25,.545,.151,.048],[.29,.668,.196,.003]]:
          fire?[[.127,.169,.047,.093],[.199,.211,.188,.077],[.268,.329,.344,.064],[.31,.474,.394,.042],[.29,.609,.296,.004]]:
          green?[[.137,.16,.032,.066],[.202,.329,.094,.055],[.302,.462,.178,.040],[.407,.543,.225,.029],[.463,.652,.208,.005]]:
          time?[[.138,.16,.036,.076],[.221,.249,.137,.064],[.328,.30,.255,.046],[.382,.35,.343,.029],[.402,.421,.375,.004]]:
          [[.148,.129,.045,.098],[.232,.193,.116,.086],[.328,.220,.160,.057],[.379,.264,.174,.006]];
        const [hornX,hornY,hornZ,hornRadius]=horns[0];
        const hornPoint=([x,y,z,r])=>[side*(hornX+(x-hornX)*1.14),hornY+(y-hornY)*1.23,
          hornZ+(z-hornZ)*1.12,r*1.08];
        const rootSocket=hornPoint(horns[0]).slice(0,3);
        part(head,"chamfer",back,[rootSocket[0],rootSocket[1]-.013,rootSocket[2]],
          [hornRadius*1.68,hornRadius*1.32,hornRadius*1.53],[.31,side*.11,-side*.29]);
        const [nextX,nextY,nextZ]=hornPoint(horns[1]);
        dragonTaper(head,[[...rootSocket.map((v,i)=>i===1?v-.062:v),hornRadius*.98],
          [...rootSocket,hornRadius*1.23],[T.MathUtils.lerp(rootSocket[0],nextX,.31),
            T.MathUtils.lerp(rootSocket[1],nextY,.31),T.MathUtils.lerp(rootSocket[2],nextZ,.31),hornRadius*.97]],
          [back,pigment(coat,true)],13,[0,0,1]);
        const hornMesh=dragonHorn(head,horns.map(hornPoint),[horn,pigment(horn,true)],ice,hornMaterial);
        if(side===-1)hornMesh.userData.ownMaterial=true;
        const hornGlow=dragonGlow(head,iris,...hornPoint(horns.at(-1)).slice(0,3),.46,0);
        hornGlow.visible=false;rig.hornGlows.push(hornGlow);
        if(green){
          for(const [x,y,z,dx,dy] of [[.201,.324,.090,.016,.185],[.302,.462,.176,-.035,.187],[.399,.538,.219,.078,.094]]){
            dragonHorn(head,[[x,y,z,.038],[x+dx*.51,y+dy*.57,z-.026,.022],
              [x+dx,y+dy,z-.09,.003]].map(hornPoint),[horn,0xc9ae6d],false,hornMaterial);
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
          dragonHorn(jaw,[[side*.126,-.042,-.138,.046],[side*.166,.036,-.207,.035],
            [side*.184,.115,-.270,.020],[side*.169,.178,-.307,.002]],[horn,0xf0d5a9]);
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
        for(let i=0;i<5;i++){
          const [x,y,z]=topGum[i+1],reach=i===0?.112:.075-i*.007;
          dragonHorn(head,[[x,y+.017,z,i===0?.026:.018],[x+side*.005,y-.026,z+.003,.018-i*.002],
            [x,y-reach*.79,z+.014,.010],[x-side*.008,y-reach,z+.030,.002]],[0xbfa185,0xffedc7]).name="Dente superior";
          const [bx,by,bz]=bottomGum[i];
          dragonHorn(jaw,[[bx,by-.013,bz,.017],[bx+side*.004,by+.015,bz-.004,.012],
            [bx-side*.004,by+.046-i*.004,bz-.011,.002]],[0xbfa181,0xf9e2be]).name="Dente inferior";
        }
        for(const front of [true,false]){
          const leg=attachLeg(g,rig,side*(front?.343:.300)*girth,(front?-.443:.50)*length,.734,.72,front?.19:.22,
            material(coat),material(back),(side>0)===front?0:Math.PI)||rig.legs.at(-1);
          leg.userData.front=front;
          const lower=leg.userData.lower;
          const upperLength=front?.344:.365,lowerLength=front?.337:.321;
          leg.userData.bones=[upperLength,lowerLength];lower.position.y=-upperLength;
          for(const n of [...leg.children])if(n.isMesh)leg.remove(n);
          for(const n of [...lower.children])if(n.isMesh)lower.remove(n);
          const foot=hinge(lower,0,-lowerLength,0);
          leg.userData.foot=foot;
          dragonLegSkin(leg,lower,foot,[back,coat],girth,front);
          part(foot,"oval",back,[0,-.030,-.045],[.093*girth,.038,.083],[0,0,0]).userData.noShadow=true;
          for(const toe of [-1,0,1]){
            const digit=hinge(foot,toe*.069*girth,-.019,-.115);
            digit.rotation.y=-toe*.24;digit.userData.spread=-toe*.24;
            const reach=toe===0?.113:.088;
            dragonCurve(digit,[[0,.011,.061,.049],[0,.005,-.012,.047],
              [0,-.007,-reach*.46,.038],[0,.001,-reach*.72,.035],[0,-.008,-reach,.024]],[back,coat],10);
            dragonHorn(digit,[[0,-.005,-reach*.83,.026],[0,.006,-reach-.030,.025],
              [0,-.007,-reach-.067,.014],[0,-.036,-reach-.092,.002]],[horn,pigment(horn,true)]);
            (foot.userData.digits??=[]).push(digit);
          }
          dragonTaper(foot,[[side*.054,.002,.031,.029],[side*.095,-.007,.084,.022],
            [side*.113,-.030,.112,.014],[side*.119,-.048,.116,.002]],[coat,horn],9);
          if(earth||fire)part(leg,"shard",back,[side*.063,.093,.009],[.132*girth,.175,.155],[.3,side*.28,.07]);
        }
        const pivot=hinge(g,side*.30*girth,1.101,-.391*length);pivot.userData.side=side;rig.wings.push(pivot);
        pivot.userData.rootX=pivot.position.x;
        const socket=dragonCurve(pivot,[[0,-.50,0,.106],[0,-.30,0,.087],
          [0,-.015,0,.057]],[coat,back],16);
        socket.name="Raiz da asa";
        pivot.userData.socket=socket;
        const wingPoint=([x,y,z])=>[side*x*span,y*lift,z*chord];
        const a=[0,0,-.103],elbow=wingPoint([.69,.303,-.324]),wrist=wingPoint([1.30,.343,-.209]);
        const wingOutline=ice?[[2.69,.29,.045],[2.35,-.069,.89],[1.68,-.21,1.25],[.93,-.23,1.29],[.29,-.13,1.00]]:
          green?[[2.40,.12,.27],[2.23,-.06,.77],[1.70,-.18,1.14],[1.07,-.267,1.31],[.33,-.24,1.03]]:
          time?[[2.72,.18,.102],[2.40,-.071,.83],[1.62,-.22,1.16],[.94,-.21,1.23],[.28,-.151,1.03]]:
          earth?[[2.42,.10,.294],[2.19,-.115,.913],[1.64,-.226,1.36],[1.02,-.252,1.44],[.32,-.20,1.13]]:
          [[2.59,.18,.18],[2.23,-.082,.954],[1.63,-.211,1.33],[.93,-.238,1.37],[.29,-.193,1.10]];
        const tips=wingOutline.map(wingPoint),fold=hinge(pivot,...wrist);pivot.userData.tip=fold;
        const distal=hinge(fold,-wrist[0],-wrist[1],-wrist[2]);
        const root=[-side*.073,-.091,.481];
        dragonCurve(pivot,[[...a,.145,.161],[...wingPoint([.31,.166,-.254]),.111,.128],[...elbow,.086,.096],
          [...wingPoint([1.00,.322,-.273]),.058,.069],[...wrist,.054,.057]],[back,coat],16,[0,0,1]);
        dragonCurve(pivot,[[-side*.126,-.055,-.068,.116],[-side*.031,.036,-.100,.158,.139],
          [side*.091,.093,-.136,.117,.143],[side*.266,.146,-.219,.071,.088]],[back,coat],14,[0,0,1]);
        dragonCurve(pivot,[[-side*.151,-.087,.104,.091,.105],[-side*.035,.015,.018,.106,.111],
          [side*.104,.102,-.069,.077,.087],[side*.306,.181,-.179,.033,.046]],
          [back,coat],12,[0,0,1]);
        const sheen=green?0xa9bc75:pigment(wing,true),wingDark=pigment(wing,false);
        pivot.userData.flex=dragonWingSkin(pivot,fold,wrist,[
          {p:a,flex:0},{p:elbow,flex:0},...tips.map(p=>({p,flex:1})),{p:root,flex:0}
        ],side,[wingDark,wing,sheen],crest);
        dragonTaper(pivot,[[...root,.035],[side*.06,-.017,.36,.029],[side*.193,.068,.17,.015]],
          [back,wing],8).userData.noShadow=true;
        const ray=(tip,t)=>dragonWingPoint(wrist,{p:tip,flex:1},{p:tip,flex:1},t,0,side,crest);
        for(let i=0;i<tips.length;i++){
          const tip=tips[i],mid=ray(tip,.47);
          dragonCurve(distal,[[...wrist,.046],[...ray(tip,.23),.034],[...mid,.023],
            [...ray(tip,.74),.015],[...tip,.003]],[back,coat],10,[0,1,0]);
          part(distal,"oval",coat,mid,[.044,.027,.051],[.17,side*.38,0]).userData.noShadow=true;
          const hook=tip.map((v,k)=>v+(v-wrist[k])*.049+(k===1?-.032:0));
          dragonHorn(distal,[[...ray(tip,.941),.016],[...tip,.012],[...hook,.002]],[back,horn]).userData.noShadow=true;
          if(i<tips.length-1){
            const next=tips[i+1];
            const vein=(t,u)=>{
              const p=dragonWingPoint(wrist,{p:tip,flex:1},{p:next,flex:1},t,u,side,crest);
              p[1]+=.010;
              return p;
            };
            for(const offset of [0,.14]){
              dragonTaper(distal,[[...vein(.30+offset,.02),.010],[...vein(.48+offset,.22),.008],
                [...vein(.63+offset,.38),.006],[...vein(.72+offset,.51),.001]],[wingDark,wing],6).userData.noShadow=true;
            }
          }
        }
        part(pivot,"oval",coat,wrist,[.080,.061,.079],[.14,side*.28,0]);
        dragonHorn(distal,[[...wrist,.049],[wrist[0]+side*.113,wrist[1]+.084,wrist[2]-.059,.036],
          [wrist[0]+side*.187,wrist[1]+.126,wrist[2]-.085,.021],
          [wrist[0]+side*.252,wrist[1]+.105,wrist[2]-.124,.003]],[back,horn]);
      }
      const tail=hinge(body,0,.05,.802*length-.02);rig.tails.push(tail);
      tail.scale.set(earth?1.31:1,earth?1.22:1,tailLength);
      const tailPath=new T.CatmullRomCurve3([[0,0,-.126],[0,0,.141],[.014,.014,.38],
        [.038,.03,.628],[.09,.06,.90],[.166,.099,1.11],[.235,.134,1.26]].map(p=>new T.Vector3(...p)));
      const tailRadius=t=>.017+.144*(1-t)**.86;
      const tailShell=dragonTaper(tail,tailPath.getPoints(27).map((p,i)=>[...p.toArray(),tailRadius(i/27)]),
        [coat,back],18,[0,1,0],(color,a,i)=>color.lerp(new T.Color(belly),Math.max(0,Math.sin(a))*.72)
          .multiplyScalar(.92+Math.cos(i*1.61+a*9)*.14));
      const skin=new T.SkinnedMesh(tailShell.geometry,skinnedMaterial(dragonSkin));
      tail.remove(tailShell);tail.add(skin);
      skin.name="Cauda articulada";skin.castShadow=skin.receiveShadow=true;
      skin.userData.ownGeometry=true;skin.frustumCulled=false;
      const bones=[new T.Bone(),new T.Bone(),new T.Bone(),new T.Bone()];
      const pivots=[0,.41,.83,1.23];
      skin.add(bones[0]);
      for(let i=1;i<bones.length;i++){bones[i].position.z=pivots[i]-pivots[i-1];bones[i-1].add(bones[i])}
      function tailWeights(geometry){
        const indices=[],weights=[],position=geometry.getAttribute("position");
        for(let i=0;i<position.count;i++){
          const z=position.getZ(i),j=z<pivots[1]?0:z<pivots[2]?1:2;
          const t=T.MathUtils.smoothstep(z,pivots[j],pivots[j+1]);
          indices.push(j,j+1,0,0);weights.push(1-t,t,0,0);
        }
        geometry.setAttribute("skinIndex",new T.Uint16BufferAttribute(indices,4));
        geometry.setAttribute("skinWeight",new T.Float32BufferAttribute(weights,4));
      }
      tailWeights(skin.geometry);
      skin.bind(new T.Skeleton(bones));
      rig.tailJoints=bones.slice(1);
      const details=new T.Group();
      for(let i=0;i<5;i++){
        const t=.16+i*.145,p=tailPath.getPoint(t),size=1-i*.12;
        const plate=part(details,earth?"shard":"chamfer",i%2?back:coat,[p.x,p.y+tailRadius(t)*.80,p.z],
          [.079*size,.088*size,.113*size],[.37,0,0]);
        plate.userData.noShadow=true;
      }
      for(const side of [-1,1])for(let i=0;i<4;i++){
        const t=.20+i*.166,p=tailPath.getPoint(t),r=tailRadius(t);
        const plate=part(details,"chamfer",i%2?coat:back,[p.x+side*r*.66,p.y+r*.40,p.z-.025],
          [r*.46,r*.39,.103-i*.012],[.15,.24,-side*.33]);
        plate.userData.noShadow=true;
      }
      const joint=tailPath.getPoint(.84),tip=tailPath.getPoint(1),tipTangent=tailPath.getTangent(1);
      const at=(x,y,z)=>[tip.x+x,tip.y+y,tip.z+z];
      if(green||fire){
        for(const side of [-1,1]){
          fanFin(details,joint.toArray(),[at(side*.19,-.01,.011),at(side*(green?.20:.23),.052,.155),
            at(side*.078,.11,.37),at(0,.02,.085),tip.toArray()],[back,wing],.029);
          dragonTaper(details,[[...joint.toArray(),.023],[...at(side*.066,.021,.024),.023],
            [...at(side*.143,.056,.124),.014],[...at(side*.078,.11,.37),.002]],[back,coat],8);
        }
      }else if(earth){
        part(details,"shard",back,at(0,0,.018),[.178,.147,.194],[.14,.26,.19]);
        for(const side of [-1,1])part(details,"shard",horn,at(side*.101,.012,.032),[.098,.086,.137],[.218,side*.38,.28*side]);
      }else if(ice){
        fanFin(details,joint.toArray(),[at(-.072,.079,-.047),at(.018,.193,.152),at(.109,.038,.411),
          at(.081,-.098,.182),at(.014,-.04,.020),tip.toArray()],[back,horn],.033);
        dragonHorn(details,[[...joint.toArray(),.028],[...at(0,.034,.011),.050],
          [...at(.060,.054,.165),.032],[...at(.109,.038,.411),.002]],[back,horn],true);
      }else{
        dragonTaper(details,[[...joint.toArray(),.033],[...at(-.031,-.014,-.068),.045],
          [...tip.toArray(),.052],[...at(.042,.022,.113),.017]],[back,coat],12);
        const collar=part(details,"ring",horn,tip.toArray(),[.053,.053,.082],[0,0,0],true);
        collar.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),tipTangent);
        part(details,"diamond",horn,at(.041,.022,.092),[.057,.062,.135],[.137,.26,0]);
      }
      for(const detail of details.children){
        detail.updateMatrix();
        const geometry=detail.geometry.clone().applyMatrix4(detail.matrix);
        tailWeights(geometry);
        const attached=new T.SkinnedMesh(geometry,skinnedMaterial(detail.material));
        attached.userData={ownGeometry:true,sharedSkeleton:true,noShadow:detail.userData.noShadow};
        attached.frustumCulled=false;attached.castShadow=!detail.userData.noShadow;attached.receiveShadow=true;
        tail.add(attached);
        attached.bind(skin.skeleton,skin.bindMatrix);
        if(detail.userData.ownGeometry)detail.geometry.dispose();
      }
      for(let i=0;i<9;i++){
        const z=(-.72+i*.177)*length,h=1.20+Math.sin((i+.8)*.37)*.154;
        const scale=1-i*.055;
        if(ice||earth){
          part(body,"shard",i%2?horn:back,[0,h-.910,z-.02],[.085*scale*(earth?1.78:1),.159*scale*(ice?1.73:.98),.119*scale*(earth?1.38:1)],[.35,0,0],ice&&i%2===1);
          if(earth)for(const side of [-1,1])part(body,"chamfer",i%2?back:horn,[side*.112,h-.938,z+.005],
            [.118*scale,.099*scale,.136*scale],[.28,side*.36,side*.16]);
        }else{
          const peak=.137*scale*(fire?1.57:green?.85:1);
          fanFin(body,[0,h-.99,z+.052],[[0,h-.981,z-.092],[.018,h-.858+peak*.58,z-.018],
            [0,h-.89+peak,z+.047],[-.009,h-.904+peak*.34,z+.088],[0,h-.997,z+.108]],[back,wing],.032*scale);
        }
        if((fire||earth)&&i%2===1){
          for(const side of [-1,1]){
            const warm=fire?0xf66f42:0xbb8357;
            dragonTaper(body,[[side*.046,h-.888,z-.009,.004],[side*.056,h-.844,z+.024,.011],
              [side*.037,h-.808,z+.050,.003]],[back,warm],6).userData.noShadow=true;
            part(body,"shard",warm,[side*.053,h-.844,z+.030],[.010,.019,.018],[.58,0,side*.18],true).userData.noShadow=true;
          }
        }
      }
      if(time){
        const halo=new T.Mesh(geometry.ring,material(0xffc46d,true,.72));
        halo.scale.set(.32,.32,.44);
        halo.position.set(0,.37,.02);halo.rotation.x=Math.PI/2;
        head.add(halo);rig.halo=halo;
        for(const side of [-1,1])part(head,"diamond",0xf3c781,[side*.044,.255,.009],[.028,.072,.035],[0,0,side*.22],true);
        for(let i=0;i<7;i++){
          const a=i*Math.PI*2/7;
          part(halo,"diamond",0xffce86,[Math.cos(a),Math.sin(a),0],[.12,.16,.15],[0,0,a],true);
        }
      }
      root.scale.setScalar(data.scale);
    }
    function magma(g,rig,attachLeg,data){
      const rock=mutedTint(data?.tint??0x412c34),trim=pigment(rock,true),hot=data?.hot??0xff5b24,light=data?.glow??0xffc06e;
      const coreColor=new T.Color(hot).convertSRGBToLinear(),surfaceColor=new T.Color(light).convertSRGBToLinear();
      const fluid=new T.MeshStandardMaterial({color:coreColor.clone().multiplyScalar(.38),emissive:coreColor,emissiveIntensity:.84,roughness:.47});
      const time=rig.moltenTime={value:0};
      fluid.onBeforeCompile=shader=>{
        shader.uniforms.moltenTime=time;shader.uniforms.moltenCore={value:coreColor};shader.uniforms.moltenRim={value:surfaceColor};
        shader.vertexShader="varying vec3 vLava;\n"+shader.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nvLava=position;");
        shader.fragmentShader="varying vec3 vLava;uniform vec3 moltenCore,moltenRim;uniform float moltenTime;\n"+
          shader.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
            float twist = sin(vLava.x*19. + vLava.y*12. + vLava.z*8. + moltenTime*1.7);
            float currents = .5 + .5*sin(vLava.y*23. - vLava.z*17. + twist*1.63 - moltenTime*3.2);
            float crack = smoothstep(.68,.98,currents);
            totalEmissiveRadiance *= .42 + .35*currents;
            totalEmissiveRadiance += mix(moltenCore*.12,moltenRim*.57,crack);`);
      };
      const body=hinge(g,0,1.17,0);rig.body=body;
      rig.moltenMaterial=fluid;rig.embers=[];
      const core=taper(body,[[0,-.52,.02,.19,.26],[0,-.29,.03,.24,.35],[0,-.02,0,.31,.43],
        [0,.23,.02,.32,.43],[0,.41,.025,.24,.34],[0,.49,0,.168,.23]],[hot,light],18,[1,0,0]);
      core.material=fluid;core.userData.ownMaterial=true;core.name="Núcleo de lava";
      for(let row=0;row<3;row++)for(let i=0;i<6;i++){
        const a=i*Math.PI/3+(row%2)*.32,y=-.30+row*.26;
        const width=row===0?.31:.43,depth=row===0?.23:.30;
        part(body,"shard",i%3===0?trim:rock,[Math.sin(a)*width,y,Math.cos(a)*depth],
          [.218+(i%2)*.034,.19+(row%2)*.032,.094],[.12-Math.sin(a)*.18,a,.29+Math.cos(a)*.27]);
      }
      const head=hinge(g,0,1.72,-.04);rig.head=head;
      const skull=taper(head,[[0,-.186,.015,.149],[0,-.12,-.024,.215],[0,.039,.012,.263],
        [0,.193,.055,.202],[0,.254,.09,.118]],[rock,trim],16,[1,0,0]);
      skull.name="Máscara de rocha vulcânica";
      part(head,"chamfer",0x291e2a,[0,-.048,-.211],[.37,.17,.124],[.02,0,0]);
      for(const side of [-1,1]){
        part(head,"oval",light,[side*.102,.005,-.293],[.071,.025,.023],[0,0,side*-.26],true);
        const crest=[[side*.142,.126,.032,.10],[side*.188,.236,.066,.091],
          [side*.276,.343,.13,.051],[side*.311,.401,.167,.008]];
        taper(head,crest,[rock,trim],7,[0,0,1]);
        const arm=hinge(g,side*.46,1.44,.003);arm.userData.side=side;rig.arms.push(arm);
        const shoulder=taper(arm,[[0,.15,.022,.139],[side*.045,-.045,.029,.19],
          [side*.132,-.218,.037,.158],[side*.152,-.329,.019,.106]],[hot,light],11);
        shoulder.material=fluid;
        for(let i=0;i<3;i++)part(arm,"shard",i===1?trim:rock,[side*(.09+i*.05),.07-i*.127,-.049],[.22,.149,.171],
          [.13,side*.25,-side*.21]);
        const fist=hinge(arm,side*.142,-.305,.024);arm.userData.lower=fist;
        const stream=taper(fist,[[0,.065,.002,.111],[side*.04,-.07,-.006,.123],[side*.052,-.238,-.057,.141],
          [side*.044,-.332,-.081,.112]],[hot,light],12);
        stream.material=fluid;
        part(fist,"chamfer",rock,[side*.045,-.235,-.016],[.247,.21,.246],[.18,0,side*.13]);
        for(const knuckle of [-1,0,1])part(fist,"shard",trim,[side*.046+knuckle*.077,-.334,-.131],
          [.055,.071,.058],[.20,.12,knuckle*.16]);
        const leg=attachLeg(g,rig,side*.26,.056,.71,.72,.25,material(rock),material(trim),side>0?Math.PI:0)||rig.legs.at(-1);
        part(leg,"shard",rock,[0,-.09,-.039],[.20,.157,.18],[.14,0,side*.21]);
        const shin=leg.userData.lower;
        part(shin,"shard",hot,[0,-.13,-.105],[.034,.13,.034],[.15,0,side*.18],true);
        part(shin,"shard",trim,[0,-.25,-.073],[.136,.087,.127],[.25,0,0]);
      }
      for(let i=0;i<11;i++){
        const spark=part(body,"shard",i%3?hot:light,[0,0,0],[.032,.044,.032],[0,0,0],true,.68);
        spark.userData.noShadow=true;rig.embers.push(spark);
      }
    }
    function ghost(g,rig,data){
      const mist=new T.ShaderMaterial({
        uniforms:{tint:{value:new T.Color(data.tint)},light:{value:new T.Color(data.glow)},time:{value:0},charge:{value:0}},
        vertexShader:`varying vec3 eyeNormal,viewDir,local;uniform float time;
          void main(){vec3 p=position;local=p;p.x+=sin(p.y*8.+time*3.)*.027;p.z+=cos(p.x*9.+p.y*6.-time*2.5)*.025;
            vec4 view=modelViewMatrix*vec4(p,1.);eyeNormal=normalMatrix*normal;viewDir=-view.xyz;gl_Position=projectionMatrix*view;}`,
        fragmentShader:`varying vec3 eyeNormal,viewDir,local;uniform vec3 tint,light;uniform float time,charge;
          void main(){float rim=pow(1.-abs(dot(normalize(eyeNormal),normalize(viewDir))),1.9);
            float strand=.57+.43*sin(local.y*14.+sin(local.x*12.-time*2.2)*1.45+time*3.);
            float alpha=.16+.55*rim+.10*strand+charge*.12;
            gl_FragColor=vec4(mix(tint*.64,light,.24+.50*rim+.13*strand)+light*.75*rim,alpha);}`,
        side:T.DoubleSide,transparent:true,depthWrite:false
      });
      const body=hinge(g,0,.67,.02);rig.body=body;rig.ghostMist=mist;rig.embers=[];
      const shroud=(parent,points,rings)=>{
        const node=taper(parent,points,[data.tint,data.glow],rings,[0,0,1]);
        node.material=mist;node.userData.noShadow=true;
        return node;
      };
      const hull=shroud(body,[[0,-.57,.32,.045],[.071,-.37,.23,.14,.10],[0,-.17,.088,.21,.18],
        [0,.10,.02,.30,.21],[0,.32,.05,.40,.235],[0,.46,.064,.31,.20],[0,.52,.045,.17,.121]],21);
      hull.userData.ownMaterial=true;hull.name="Manto espectral translúcido";
      const head=hinge(body,0,.51,-.071);rig.head=head;
      globalThis.QuimiCraftSpectral?.halo(T,body,data.glow,[0,.36,-.16],1.46,1.64,.35);
      shroud(head,[[0,-.13,0,.10],[0,-.065,-.04,.162],[0,.11,-.04,.215],[0,.25,.011,.177],
        [0,.34,.12,.091],[0,.38,.205,.022]],18);
      part(head,"oval",0x223444,[0,.078,-.174],[.147,.106,.038],[.12,0,.0],false,.65);
      for(const side of [-1,1]){
        part(head,"oval",data.glow,[side*.073,.098,-.211],[.040,.021,.020],[0,0,side*.23],true);
        const arm=hinge(body,side*.245,.296,.055);arm.userData.side=side;rig.arms.push(arm);
        shroud(arm,[[0,.045,.00,.134],[side*.12,-.042,-.013,.121],[side*.22,-.207,.033,.101],
          [side*.27,-.34,.072,.075]],12);
        const wrist=hinge(arm,side*.25,-.29,.061);arm.userData.lower=wrist;
        shroud(wrist,[[0,.035,.009,.079],[side*.029,-.069,-.034,.090],[side*.060,-.217,-.134,.057],
          [side*.064,-.264,-.176,.028]],11);
        const tendril=hinge(body,side*.20,-.151,.17);rig.tails.push(tendril);
        shroud(tendril,[[0,.056,0,.104],[side*.073,-.103,.102,.078],
          [side*.031,-.304,.16,.054],[side*.13,-.414,.31,.006]],9);
        for(let i=0;i<2;i++)link(wrist,data.glow,[side*.026,-.13,-.068-i*.044],[side*.074,-.245,-.154-i*.023],.012,.52,true);
      }
      for(let i=0;i<12;i++){
        const mote=part(body,"diamond",data.glow,[0,0,0],[.020,.033,.020],[0,0,0],true,.52);
        mote.userData.noShadow=true;rig.embers.push(mote);
      }
    }
    function crab(g,rig,data){
      const shell=data.tint,trim=data.glow,shadow=pigment(shell,false);
      rig.body=hinge(g,0,0,0);rig.claws=[];
      contour(rig.body,[[-.37,.253,.16,.10],[-.26,.275,.33,.155],[-.07,.29,.393,.206],
        [.17,.24,.364,.173],[.34,.204,.233,.108],[.40,.19,.099,.055]],[shell,trim],"speckle",22,torsoShape);
      for(const side of [-1,1]){
        const stalk=[side*.116,.394,-.361];
        taper(rig.body,[[side*.111,.332,-.289,.037],[...stalk,.032]],[shadow,shell],8);
        part(rig.body,"oval",0x242938,stalk,[.036,.035,.038]);
        for(let i=0;i<4;i++){
          const leg=hinge(g,side*(.30-i*.022),.23,-.21+i*.157);
          leg.userData.side=side;leg.userData.phase=(i%2)*Math.PI;
          const knee=[side*(.24-i*.020),.087,-.092+i*.058],feet=[side*(.32-i*.022),-.21,-.104+i*.105];
          taper(leg,[[0,0,0,.057],[...knee,.041],[...feet,.013]],[shell,trim],8);
          rig.legs.push(leg);
          part(rig.body,"shard",trim,[side*(.214-i*.025),.416-i*.027,-.17+i*.132],[.078,.050,.076],[.15,side*.21,i*.42]);
        }
        const arm=hinge(g,side*.205,.235,-.23);arm.userData.side=side;rig.arms.push(arm);
        taper(arm,[[0,0,0,.071],[side*.148,.022,-.102,.082],[side*.239,.06,-.253,.073]],[shell,shadow],9);
        const claw=hinge(arm,side*.235,.08,-.278);
        part(claw,"oval",shell,[0,0,-.062],[.153,.113,.173],[.13,side*.10,0]);
        taper(claw,[[side*.110,.010,-.074,.064],[side*.156,.023,-.218,.059],
          [side*.084,.030,-.316,.020],[side*.013,.031,-.344,.004]],[shell,trim],8);
        const finger=hinge(claw,-side*.08,.01,-.115);finger.userData.side=side;rig.claws.push(finger);
        taper(finger,[[0,0,0,.054],[-side*.027,.008,-.114,.042],[side*.021,.019,-.199,.003]],
          [shell,trim],8);
      }
    }
    function armadillo(g,rig){
      const coat=0x53443e,bone=0xb49e87,edge=0x827265,skin=0x73574e;
      const body=hinge(g,0,0,0);rig.body=body;
      const profile=sculptSections([[-.655,.437,.160,.17],[-.56,.448,.258,.25],[-.37,.46,.355,.344],
        [-.17,.479,.389,.392],[.080,.475,.399,.409],[.31,.46,.382,.361],[.52,.425,.298,.266],
        [.67,.415,.161,.159],[.737,.392,.054,.077]]);
      contour(body,profile,[coat,skin],"",38,torsoShape).name="Carapaça abobadada";
      function surface(z,angle,rise=0){
        const index=Math.max(1,profile.findIndex(row=>row[0]>=z)),a=profile[index-1],b=profile[index];
        const t=(z-a[0])/(b[0]-a[0]),row=a.map((v,k)=>T.MathUtils.lerp(v,b[k],t));
        row[2]+=rise;row[3]+=rise;
        return torsoShape(row,angle);
      }
      const tiles=[],tones=[],faces=[],plate=new T.Color(coat),ridge=new T.Color(bone),tint=new T.Color();
      function scale(z,a,dz,da,light,stagger){
        const corners=[[z-dz,a-da*.68,.007],[z,a-da,.017],[z+dz,a-da*.55,.010],
          [z+dz*.92,a+da*.58,.010],[z,a+da,.016],[z-dz,a+da*.66,.008],[z+dz*stagger,a,.033]];
        const base=tiles.length/3;
        for(const [i,[at,arc,height]] of corners.entries()){
          tiles.push(...surface(at,arc,height));
          tint.copy(plate).lerp(ridge,light*(i===6?.87:i===1||i===4?.56:.39));
          tones.push(tint.r,tint.g,tint.b);
        }
        for(let i=0;i<6;i++)faces.push(base+6,base+i,base+(i+1)%6);
      }
      for(let band=0;band<7;band++){
        const z=-.24+band*.084;
        const ring=Array.from({length:19},(_,i)=>[...surface(z,(i-9)*.21,.013),.027,.028]);
        taper(body,ring,[edge,bone],7,[0,0,1]).name="Faixa do casco";
        for(let i=0;i<23;i++)scale(z,-1.88+i*.171,.035,.085,.44+(i+band)%3*.14,.39);
      }
      for(const [from,count] of [[-.59,8],[.343,9]])for(let row=0;row<count;row++){
        const z=from+row*.040;
        for(let i=0;i<25;i++)scale(z,-1.90+(i+.4*(row%2))*.155,.019,.075,.49+(i+row*3)%4*.12,.14);
      }
      const armour=new T.BufferGeometry();
      armour.setAttribute("position",new T.Float32BufferAttribute(tiles,3));
      armour.setAttribute("color",new T.Float32BufferAttribute(tones,3));
      armour.setIndex(faces);armour.computeVertexNormals();
      const scutes=new T.Mesh(armour,skinMaterial);
      scutes.userData.ownGeometry=true;scutes.name="Escamas do casco";body.add(scutes);
      const head=hinge(g,0,.398,-.535);rig.head=head;
      const snout=sculptSections([[-.546,-.268,.034,.029],[-.481,-.244,.060,.059],[-.353,-.158,.084,.087],
        [-.207,-.074,.123,.133],[-.061,.004,.153,.137],[.083,.011,.16,.158],[.176,.016,.127,.129]]);
      contour(head,snout,[coat,skin],"speckle",24,torsoShape).name="Focinho comprido";
      part(head,"oval",0x9b7168,[0,-.265,-.532],[.041,.030,.035],[.40,0,0]);
      for(const side of [-1,1]){
        const eye=hinge(head,side*.118,-.011,-.203);eye.userData.entityEye=true;
        part(eye,"oval",edge,[0,0,0],[.027,.023,.029]);
        part(eye,"oval",0x221a19,[side*.010,.001,-.010],[.021,.019,.024]);
        part(eye,"oval",0xbbae97,[side*.018,.007,-.025],[.005,.005,.005]);
        taper(head,[[side*.074,.093,.036,.061,.046],[side*.104,.186,.046,.079,.050],
          [side*.151,.286,.074,.057,.039],[side*.188,.327,.105,.008,.011]],[coat,edge],10,[0,0,1]);
        fanFin(head,[side*.101,.167,-.001],[[side*.097,.232,.005],[side*.166,.308,.068],
          [side*.181,.237,.061],[side*.141,.174,.021]],[0x78574b,0xa98875],.017);
        for(let i=0;i<9;i++)part(head,"oval",i%3?edge:bone,[side*(.132-i*.008),.045-i*.021,-.103-i*.040],
          [.015,.011,.012],[0,side*.41,.17]);
        for(const front of [true,false]){
          const leg=hinge(g,side*(front?.214:.237),front?.324:.306,front?-.385:.443);
          leg.userData.phase=(side===1)===front?0:Math.PI;rig.legs.push(leg);
          taper(leg,[[0,.078,.023,.112],[side*.018,-.04,.037,.096],[side*.018,-.139,.012,.061]],[coat,skin],10);
          const knee=hinge(leg,side*.018,-.121,.019);leg.userData.lower=knee;
          taper(knee,[[0,.025,.014,.067],[side*.010,-.058,-.018,.062],[side*.017,-.155,-.055,.062]],[coat,edge],9);
          part(knee,"oval",coat,[0,-.153,-.072],[.078,.041,.071]);
          for(let toe=-1;toe<=1;toe++)taper(knee,[[toe*.038,-.155,-.061,.023],[toe*.048,-.171,-.114,.019],
            [toe*.056,-.19,-.172+Math.abs(toe)*.025,.002]],[edge,bone],6,[0,1,0]);
        }
      }
      const points=[[0,.381,.626],[.014,.399,.762],[.066,.394,.927],[.145,.363,1.057],
        [.233,.298,1.148],[.336,.225,1.196],[.438,.145,1.183],[.508,.083,1.117],[.539,.051,1.021]];
      let parent=g;
      for(let i=0;i<points.length-1;i++){
        const start=points[i],last=points[i-1],end=points[i+1].map((v,k)=>v-start[k]),r=.073-i*.0074;
        const tail=hinge(parent,...(last?start.map((v,k)=>v-last[k]):start));
        tail.userData.sway=.58;rig.tails.push(tail);parent=tail;
        const mid=end.map(n=>n*.47);
        taper(tail,[[0,0,0,r],[...mid,r*1.12],[...end,Math.max(.003,r-.006)]],[coat,edge],11,[0,1,0],
          (c,a,row)=>{if(row===1)c.multiplyScalar(.85+.24*Math.sin(a*3)**2);}).name="Anel da cauda";
        if(i>0)part(tail,"oval",skin,[0,0,0],[r,r,r]);
      }
    }
    function serpent(g,rig,data){
      const {tint:coat,trim,glow:iris}=data,fire=!!data.fire;
      const boneCount=fire?17:11,length=fire?3.65:2.23,first=fire?-.64:-.47,step=length/(boneCount-1),belly=fire?0xc99348:pigment(trim,true);
      const height=z=>fire?.19+.94*Math.exp(-(((z-first)/.48)**2))+.025*Math.cos(z*5):.103+.166*Math.exp(-(((z-first)/.34)**2));
      const pathX=z=>fire?.50*Math.sin((z-first)*4.38)*T.MathUtils.smoothstep(z-first,.20,1.39)*(1-.36*(z-first)/length):0;
      const count=fire?28:14;
      const knots=Array.from({length:count},(_,i)=>{
        const t=i/(count-1),z=first+t*length;
        const hood=fire?T.MathUtils.smoothstep(t,0,.09):0;
        const width=fire?(.151+hood*.041+.059*Math.sin(t*Math.PI))*((1-t)**.48)+.009:
          t<.28?.123+Math.sin(t*Math.PI/.28)*.032:.127*(1-t)**.72+.008;
        return [pathX(z),height(z),z,i===count-1?.003:width,i===count-1?.003:width*1.14];
      });
      const bronze=new T.Color(coat),bright=new T.Color(trim),scutes=new T.Color(belly);
      const body=dragonCurve(g,knots,[coat,trim],fire?60:36,fire?[0,1,0]:[1,0,0],(color,a,row)=>{
        const underside=Math.cos(a)<-.24;
        if(fire){
          const t=Math.abs(Math.cos(a*16+row*.66))**7,spine=Math.sin(row*.18+a*Math.PI);
          if(underside)color.copy(scutes).multiplyScalar(row%3===0?.79:1.06);
          else color.copy(bronze).lerp(bright,T.MathUtils.smoothstep(spine,-.28,.91)*.62+t*.21).multiplyScalar(.78+t*.38);
          return;
        }
        if(underside)color.lerp(new T.Color(belly),.56).multiplyScalar(row%4===0?.79:1);
        else{
          const rowOffset=row%2?Math.PI*.5:0;
          color.multiplyScalar(.82+.24*Math.cos(a*13+rowOffset)**4);
          color.lerp(new T.Color(pigment(coat,false)),.22*Math.max(0,Math.sin(row*.59+Math.cos(a*2)*1.15))**2);
        }
      });
      const positions=body.geometry.getAttribute("position"),indices=[],weights=[],bones=[];
      for(let i=0;i<positions.count;i++){
        const row=T.MathUtils.clamp((positions.getZ(i)-first)/step,0,boneCount-1),a=Math.floor(row),t=row-a;
        indices.push(a,Math.min(a+1,boneCount-1),0,0);weights.push(1-t,t,0,0);
      }
      body.geometry.setAttribute("skinIndex",new T.Uint16BufferAttribute(indices,4));
      body.geometry.setAttribute("skinWeight",new T.Float32BufferAttribute(weights,4));
      const skin=dragonSkin.clone();skin.skinning=true;
      const mesh=new T.SkinnedMesh(body.geometry,skin);
      mesh.name="Corpo serpentino contínuo";mesh.userData.ownMaterial=mesh.userData.ownGeometry=true;
      mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;
      g.remove(body);g.add(mesh);
      for(let i=0;i<boneCount;i++){
        const bone=new T.Bone(),z=first+i*step;
        bone.position.set(i===0?pathX(z):pathX(z)-pathX(z-step),i===0?height(z):height(z)-height(z-step),i===0?z:step);
        (i===0?mesh:bones.at(-1)).add(bone);bones.push(bone);
      }
      mesh.bind(new T.Skeleton(bones));
      rig.slither=bones;rig.body=mesh;
      const head=hinge(bones[0],0,0,fire?-.026:.023);rig.head=head;
      if(fire){
        head.scale.set(1.42,1.28,1.28);rig.raisedSerpent=true;
        const neck=[[-.090,0,.126,.126],[.012,-.004,.160,.170],[.106,-.025,.180,.183],[.234,-.066,.174,.170]];
        dragonCurve(bones[0],neck.map(([z,y,w,h])=>[pathX(first+z),height(first+z)-height(first)+y,z,w,h]),
          [coat,trim],24,[0,1,0],(color,a,row)=>{
            if(Math.cos(a)<-.24)color.copy(scutes).multiplyScalar(row%3===0?.83:1.04);
            else color.copy(bronze).lerp(bright,.23+.18*Math.cos(a*13+row*.70)**4);
          }).name="Pescoço escamado contínuo do Boitatá";
      }
      const headRings=[[-.36,-.009,.048,.039],[-.319,.005,.102,.068],[-.25,.031,.139,.100],
        [-.15,.035,.155,.121],[-.048,.021,.146,.113],[.044,.003,.106,.092],[.12,-.003,.085,.069]];
      if(fire)headRings.push([.178,-.015,.095,.083],[.217,-.035,.078,.068]);
      contour(head,sculptSections(sculptSections(headRings)),[coat,trim],"",40,null,(color,z,a)=>{
        if(fire){
          if(Math.cos(a)<-.3)color.copy(scutes).multiplyScalar(.86+.16*Math.cos(z*47)**6);
          else color.copy(bronze).lerp(bright,.25+.19*Math.cos(a*10+z*23)**6);
        }
        color.multiplyScalar(.87+.18*Math.sin(z*111+a*13)**4);
      },aquaticSkin).name="Cabeça e base do pescoço";
      const jaw=aquaticMouth(head,[0,-.058,-.175],fire?.125:.114,fire?.083:.061,fire?.151:.132,coat,belly,5);
      rig.jaw=jaw;
      const tongue=hinge(jaw,0,-.011,-.163);tongue.visible=false;rig.serpentTongue=tongue;
      dragonCurve(tongue,[[0,0,.03,.013],[0,.001,-.015,.012],[0,.007,-.080,.009],[0,.007,-.126,.006]],
        [0x9b4365,0xe69ba4],11).name="Língua retrátil";
      for(const side of [-1,1]){
        dragonCurve(tongue,[[0,.007,-.113,.006],[side*.013,.009,-.153,.004],
          [side*.028,.011,-.206,.001]],[0xab4667,0xe9879b],10);
        const lid=hinge(head,side*.118,.062,-.243);lid.rotation.y=-side*.57;
        part(lid,"oval",pigment(coat,false),[0,0,0],[.060,.043,.045]);
        part(lid,"oval",iris,[0,0,-.033],[.048,.032,.025],[0,0,0],true);
        serpentPupil(lid,[0,0,-.058],.009,.030);
        part(lid,"oval",0xffeaca,[-.015,.014,-.052],[.007,.008,.006],[0,0,0],true);
        part(head,"oval",0x28202b,[side*.065,.032,-.331],[.015,.009,.011],[.15,side*.39,0]);
        if(data.profile.strike.venom||fire)dragonHorn(head,[[side*.095,-.055,-.305,.014],[side*.084,-.111,-.310,.007],
          [side*.085,fire?-.162:-.131,-.292,.001]],[fire?0xe5b06a:0xdacead,0xffeed3]);
      }
    }
    function venomFauna(g,rig,data){
      const coat=data.tint,trim=data.trim,shadow=pigment(coat,false),iris=data.glow;
      if(data.model==="serpent")return serpent(g,rig,data);
      const body=hinge(g,0,.37,.06);rig.body=body;
      part(body,"oval",coat,[0,.032,.24],[.252,.220,.318]);
      part(body,"oval",shadow,[0,.018,-.101],[.183,.145,.218]);
      for(const side of [-1,1]){
        dragonCurve(body,[[side*.054,.207,.13,.019],[side*.094,.244,.26,.039],
          [side*.071,.206,.41,.009]],[shadow,trim],10,[0,1,0]);
        for(let i=0;i<4;i++)part(body,"oval",iris,[side*(.036+i*.034),.089+(i%2)*.037,-.289+i*.017],
          [.024-i*.003,.017,.017],[0,0,0],true);
        for(let i=0;i<4;i++){
          const z=-.21+i*.099,spread=.145+Math.sin((i+1)*.6)*.10;
          const leg=hinge(body,side*.115,-.008,z);leg.userData.side=side;leg.userData.phase=(i%2+(side>0?1:0))*Math.PI;
          rig.legs.push(leg);
          dragonCurve(leg,[[0,0,0,.049],[side*.13,.049,(i-1.5)*.062,.047],[side*spread,.073,(i-1.5)*.125,.033],
            [side*(spread+.107),-.142,(i-1.5)*.196,.027],[side*(spread+.225),-.344,(i-1.5)*.24,.007]],
            [coat,trim],14);
        }
        dragonHorn(body,[[side*.091,-.066,-.27,.026],[side*.11,-.12,-.327,.021],
          [side*.088,-.16,-.351,.003]],[shadow,data.profile.strike.venom?iris:trim]);
      }
    }
    function medusa(g,rig,data){
      const skin=mutedTint(data.tint),belly=pigment(skin,true),dark=pigment(skin,false);
      const {trim,glow,aspect}=data,salt=aspect==="salt",obsidian=aspect==="obsidian";
      const hips=hinge(g,0,.74,.055);rig.serpentTail=hips;
      const path=[[0,0,.00,.206],[0,-.19,.145,.236],[.028,-.43,.345,.236],[.121,-.56,.62,.220],
        [.293,-.57,.813,.179],[.50,-.582,.87,.143],[.72,-.61,.785,.104],[.863,-.64,.595,.059],[.86,-.64,.43,.007]];
      dragonCurve(hips,path,[skin,belly],17,[1,0,0],(c,a,i)=>{
        const scale=Math.cos(a*12+i*.53)*Math.cos(i*1.48);
        c.multiplyScalar(.94+scale*.12);
        if(Math.cos(a)<-.58)c.lerp(new T.Color(belly),.55).multiplyScalar(i%3===0?.83:1.04);
      },.036).name="Cauda serpentina";
      dragonCurve(hips,path.map(([x,y,z,r],i)=>[x,y+r*.77,z+.018,r*.18*(i===0?.5:1),r*.27]),
        [dark,trim],13,[1,0,0]).name="Crista dorsal da cauda";
      const body=hinge(hips,0,0,0);rig.body=body;
      dragonCurve(body,[[0,-.114,.025,.189,.195],[0,.066,.017,.178,.202],[0,.25,.002,.142,.170],
        [0,.414,-.014,.153,.198],[0,.594,.005,.156,.283],[0,.719,.018,.110,.222],[0,.82,.035,.091,.142]],
        [skin,belly],28,[1,0,0]).name="Tronco da medusa";
      dragonCurve(body,[[0,.71,.024,.129,.141],[0,.81,.025,.103,.106],[0,.91,.016,.087,.103]],
        [skin,belly],24,[1,0,0]).name="Pescoço";
      for(const side of [-1,1])for(let i=0;i<5;i++){
        const y=.09+i*.111,x=side*(.158-i*.012);
        taper(body,[[side*.052,y,-.132,.033],[x,y+.017,-.141,.048],
          [x+side*.044,y+.052,-.087,.014]],[dark,trim],6,[0,0,1]);
      }
      const head=hinge(body,0,.971,.011);rig.head=head;rig.snakes=[];
      dragonCurve(head,[[0,-.197,-.019,.058,.085],[0,-.146,-.048,.116,.145],[0,-.094,-.039,.146,.17],
        [0,-.022,-.022,.174,.180],[0,.075,.017,.18,.191],[0,.144,.032,.161,.169],
        [0,.193,.060,.10,.111],[0,.207,.069,.018,.025]],[skin,belly],32,[1,0,0]).name="Rosto";
      dragonCurve(head,[[0,.011,-.179,.025],[0,-.060,-.220,.035],[0,-.089,-.207,.028]],
        [belly,skin],18,[1,0,0]).name="Nariz";
      dragonCurve(head,[[-.053,-.126,-.179,.007],[0,-.133,-.203,.012],[.053,-.126,-.179,.007]],
        [dark,0x815564],12,[0,1,0]).name="Lábios";
      const eyes=hinge(head,0,-.023,-.183);eyes.name="Origem do olhar";rig.gazeOrigin=eyes;
      rig.gazeEyes=[];
      for(const side of [-1,1]){
        const mark=hinge(eyes,side*.082,.014,0);
        part(mark,"oval",dark,[0,0,0],[.059,.030,.022],[0,side*.26,side*.18]);
        part(mark,"oval",glow,[0,0,-.018],[.038,.024,.014],[0,side*.21,side*.16],true);
        serpentPupil(mark,[0,0,-.033],.0055,.022,side*.21);
        part(mark,"oval",0xfff5d5,[-side*.011,.010,-.033],[.003,.004,.004],[0,0,0],true);
        dragonCurve(head,[[side*.037,.043,-.190,.008],[side*.091,.05,-.186,.013],[side*.143,.032,-.157,.006]],
          [dark,trim],12,[0,1,0]).name="Sobrancelha";
        dragonCurve(head,[[side*.127,.016,-.139,.038],[side*.157,-.048,-.129,.032],
          [side*.118,-.095,-.159,.015]],[belly,skin],15).name="Maçã do rosto";
        part(head,"oval",skin,[side*.162,-.025,.013],[.045,.072,.033],[.14,side*.21,side*.16]);
        part(head,"ring",trim,[side*.175,-.077,-.007],[.034,.043,.033],[0,side*.28,0]);
        const aura=dragonGlow(mark,glow,0,0,-.028,.32,0);
        aura.visible=false;rig.gazeEyes.push(aura);
        const arm=hinge(body,side*.231,.654,.018);arm.userData.side=side;rig.arms.push(arm);
        part(body,"oval",skin,[side*.212,.645,.016],[.116,.112,.113]);
        dragonCurve(arm,[[0,.038,.01,.095],[side*.022,-.060,0,.111],[side*.039,-.227,.02,.071],
          [side*.039,-.322,.005,.058]],[skin,belly],20);
        const lower=hinge(arm,side*.039,-.290,.012);arm.userData.lower=lower;
        dragonCurve(lower,[[0,.034,0,.066],[side*.012,-.075,-.027,.070],[side*.016,-.235,-.058,.051],
          [side*.016,-.302,-.098,.049]],[skin,belly],18);
        for(let i=0;i<4;i++)dragonCurve(lower,[[side*.017+(i-1.5)*.022,-.278,-.092,.015],
          [side*.024+(i-1.5)*.023,-.333,-.121,.013],[side*.024+(i-1.5)*.025,-.35-(i%2)*.015,-.154,.003]],
          [skin,belly],9,[0,0,1]);
        dragonCurve(lower,[[-side*.011,-.257,-.062,.019],[-side*.054,-.285,-.084,.014],
          [-side*.053,-.31,-.112,.004]],[skin,belly],9).name="Polegar";
        part(lower,"oval",trim,[side*.012,-.122,-.034],[.075,.092,.081],[.19,0,.08]);
      }
      part(head,"oval",dark,[0,.106,.049],[.182,.114,.179]).name="Raiz da cabeleira";
      for(let i=0;i<15;i++){
        const a=i*Math.PI*2/15,x=Math.sin(a),z=Math.cos(a),lift=(i%4)*.041;
        const snake=hinge(head,x*.117,.112+lift*.18,z*.113+.036);rig.snakes.push(snake);
        const crown=(i%3)!==0,skull=[x*(.203+i%2*.053),crown?.20+lift:-.10-lift*.58,z*.22-.025];
        const neck=[skull[0]*.82,skull[1]+(crown?.017:.041),skull[2]*.86];
        const color=i%3?skin:trim;
        dragonCurve(snake,[[-x*.035,-.027,-z*.035,.044],[x*.071,crown?.117:.041,z*.082,.040],
          [x*.14,crown?.217+lift:-.023,z*.167,.032],[...neck,.028],[...skull,.035]],
          [color,belly],14,[0,0,1],(c,a,k)=>c.multiplyScalar(.87+.16*Math.cos(k*1.3+a*4)**2),.025);
        const face=hinge(snake,...skull);face.rotation.y=Math.atan2(-x,-z);
        part(face,"oval",color,[0,0,-.019],[.043,.032,.058]);
        part(face,"oval",belly,[0,-.015,-.028],[.035,.014,.049]);
        for(const side of [-1,1])part(face,"oval",glow,[side*.029,.010,-.044],[.010,.008,.008],[0,0,0],true);
        for(const side of [-1,1])link(face,0xba536d,[0,-.011,-.066],[side*.012,-.014,-.093],.003);
      }
      if(salt||obsidian)for(const arm of rig.arms)for(let i=0;i<3;i++){
        const side=arm.userData.side;
        part(arm,obsidian?"shard":"diamond",i%2?trim:skin,[side*(.006+i*.027),.062-i*.048,-.037],
          [.082,.097,.091],[.19,side*.21,side*.50]);
      }
    }
    function folkParticles(parent,rig,position,palette,count,kind){
      const geometry=new T.BufferGeometry();
      geometry.setAttribute("position",new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));
      const colors=Float32Array.from(Array.from({length:count},(_,i)=>new T.Color(palette[i%palette.length]).toArray()).flat());
      geometry.setAttribute("color",new T.BufferAttribute(colors,3));
      const points=new T.Points(geometry,new T.PointsMaterial({vertexColors:true,size:kind==="spray"?.048:kind==="smoke"?.058:.041,
        transparent:true,opacity:.76,depthWrite:false,blending:kind==="smoke"?T.NormalBlending:T.AdditiveBlending}));
      points.position.set(...position);points.frustumCulled=false;
      points.userData.ownMaterial=points.userData.ownGeometry=true;
      parent.add(points);(rig.folkParticles??=[]).push({points,kind});
    }
    function flameFronds(parent,rig,scale,count,sweep=.28){
      for(let i=0;i<count;i++){
        const a=i*2.399,at=hinge(parent,Math.cos(a)*scale*.26,0,Math.sin(a)*scale*.24);
        const height=scale*(.55+(i%4)*.145),side=Math.sin(a)*scale*.165;
        const shade=i%3===0?0xffea9a:i%3===1?0xff9a1f:0xf34d14;
        const flame=dragonCurve(at,[[0,-.013,0,scale*.23],[side*.2,height*.34,scale*sweep*.28,scale*.16],
          [side,height*.65,scale*sweep*.62,scale*.110],[side*.6,height,scale*sweep,.003]],
          [shade,0xffd37b],16,[0,0,1]);
        flame.material=material(shade,true,i%3===0?.84:.64);flame.castShadow=false;
        flame.userData.noShadow=true;flame.name="Mecha de fogo translúcida";
        (rig.flames??=[]).push(at);
      }
    }
    function headlessHorse(g,rig){
      const hide=0x331d25,flank=0x633533,coal=0x221b24,red=0x974822,ember=new T.Color(0xb76034);
      rig.mule=true;
      rig.body=contour(g,sculptSections(sculptSections(sculptSections([[-.90,1.24,.087,.14],[-.76,1.20,.211,.24],
        [-.57,1.19,.304,.35],[-.36,1.148,.349,.372],[-.13,1.065,.305,.349],[.17,1.075,.283,.288],
        [.41,1.128,.345,.314],[.64,1.105,.314,.278],[.80,1.067,.217,.208],[.89,1.06,.067,.10]]))),[hide,flank],"",50,torsoShape,(color,z,a)=>{
          color.multiplyScalar(.91+.12*Math.sin(z*68+a*21)*Math.cos(z*91+a*37));
          if(Math.abs(Math.sin(a))>.65&&z<-.37)color.lerp(new T.Color(flank),.32);
          color.lerp(ember,T.MathUtils.smoothstep(Math.cos(a),.63,.99)*T.MathUtils.smoothstep(-z,-.30,.78)*.46);
        },aquaticSkin);
      rig.body.name="Peito, ventre e garupa";
      dragonCurve(g,[[0,1.047,-.47,.25,.30],[0,1.207,-.60,.265,.269],[0,1.398,-.737,.212,.226],
        [0,1.592,-.869,.169,.182],[0,1.748,-1.005,.125,.135]],[hide,flank],43,[1,0,0]).name="Pescoço ligado ao peito";
      const throat=hinge(g,0,1.721,-.999);
      part(throat,"oval",coal,[0,-.021,0],[.148,.062,.152]);
      part(throat,"oval",0xff6c20,[0,.018,0],[.130,.064,.125],[0,0,0],true);
      flameFronds(throat,rig,.73,13,1.53);
      flameFronds(hinge(throat,0,.049,.10),rig,.55,8,1.98);
      folkParticles(throat,rig,[0,.07,.14],[0xffb65c,0xff682a,0xffe0a8],38,"embers");
      for(let i=0;i<11;i++){
        const t=i/10,y=1.69-.41*t,z=-.883+.47*t,x=(i%3-1)*.028;
        dragonCurve(g,[[x,y,z,.043],[x+.026,y-.049,z+.117,.054],
          [x+.083,y-.15,z+.205,.031],[x+.056,y-.25,z+.268,.004]],[i%3?coal:hide,red],13,[0,0,1]);
      }
      for(const side of [-1,1])for(const front of [-1,1]){
        const x=side*(front>0?.205:.194),z=front*.535,y=front>0?.987:.962;
        const leg=organicLeg(g,rig,x,y,z,y-.055,front>0?.121:.096,hide,coal,side===front?0:Math.PI,-1,true);
        leg.upper.userData.gallop=(front>0?1.93:0)+(side>0?.56:0);
        const root=hinge(leg.upper,-side*.033,.115,.012);
        dragonCurve(root,[[0,.148,0,.082,.103],[side*.032,.056,.013,.124,.152],
          [side*.048,-.098,.055,.117,.120],[side*.033,-.261,.029,.052,.060]],[hide,flank],22).name="Músculos da perna";
        part(leg.foot,"oval",0xb66333,[0,-.031,-.099],[.062,.016,.013]);
      }
      const tail=hinge(g,0,1.183,.735);rig.tails.push(tail);
      tail.userData.sway=1.12;
      dragonCurve(tail,[[0,.026,-.088,.093],[0,.033,.066,.082],[.012,-.016,.185,.067],
        [.023,-.137,.279,.050],[.035,-.208,.318,.042]],[hide,flank],19,[1,0,0]).name="Base da cauda na garupa";
      for(let i=0;i<7;i++){
        const s=(i-3)*.021,y=.016*Math.cos(i);
        dragonCurve(tail,[[s,y,.024,.041],[s*1.14,.027+y,.162,.037],[s*1.08,-.091+y,.274,.030],
          [s*.61+.041,-.237+y,.343,.007]],[coal,i%3?hide:0x7e3e33],9,[1,0,0]).name="Crina da base da cauda";
      }
      const swing=hinge(tail,.034,-.180,.298);
      swing.userData.sway=1.75;rig.tails.push(swing);
      for(let i=0;i<12;i++){
        const side=(i-5.5)*.013,lift=.01*Math.sin(i*2.7),length=.37+(i%4)*.042;
        dragonCurve(swing,[[side,0,0,.027],[side*1.36,-.133,.071,.031],[side*1.50,-length*.65,.116+lift,.022],
          [side*1.67+.027,-length,.158+lift+(i%3)*.047,.002]],
          [i%4?coal:hide,i%3?0x4b2b32:red],10,[1,0,0]).name="Mecha da cauda";
      }
    }
    function wolfFace(head,rig,skin,light){
      const deep=new T.Color(0x2a2831),ash=new T.Color(light);
      contour(head,sculptSections(sculptSections([[-.449,-.079,.053,.039],[-.403,-.076,.108,.065],[-.295,-.046,.127,.090],
        [-.215,-.017,.152,.116],[-.152,.035,.184,.151],[-.090,.047,.209,.194],[.025,.071,.232,.218],
        [.118,.055,.224,.200],[.187,.035,.172,.163],[.250,.002,.123,.131]])),[skin,light],"",48,torsoShape,(color,z,a)=>{
        const grain=Math.sin(z*157+a*19+Math.sin(a*7))*Math.cos(z*78-a*39);
        color.lerp(ash,T.MathUtils.smoothstep(-z,.11,.39)*Math.max(0,-Math.cos(a)+.33)*.81);
        color.lerp(deep,.34*Math.max(0,Math.cos(a))**2).multiplyScalar(.96+.10*grain);
      },aquaticSkin).name="Crânio com focinho, testa e maçãs do rosto";
      rig.jaw=predatorJaw(head,.211,.22,.266,.181,skin,light);
      part(head,"chamfer",0x25202a,[0,-.066,-.454],[.158,.088,.057],[.20,0,0]).name="Trufa do lobisomem";
      part(head,"oval",0x777079,[0,-.035,-.485],[.041,.011,.009]);
      for(const side of [-1,1]){
        part(head,"oval",0x19171c,[side*.045,-.072,-.478],[.026,.014,.008],[0,side*.39,0]).name="Narina";
        dragonCurve(head,[[side*.037,-.101,-.435,.028],[side*.111,-.091,-.348,.042],
          [side*.150,-.113,-.238,.026],[side*.139,-.112,-.172,.008]],[light,skin],12,[0,1,0]).name="Lábio e almofada do focinho";
        dragonCurve(head,[[side*.112,-.084,-.384,.007],[side*.149,-.096,-.285,.010],
          [side*.153,-.135,-.179,.004]],[0x19191f,0x2c2630],10,[0,1,0]).name="Linha da boca";
      }
      for(const side of [-1,1]){
        const at=hinge(head,side*.142,.069,-.193);at.rotation.set(.04,-side*.46,side*.33);at.userData.entityEye=true;
        part(at,"oval",0x2e2630,[0,0,0],[.052,.028,.031]);
        part(at,"oval",0xc7d990,[0,-.004,-.024],[.038,.018,.019],[0,0,0],true);
        part(at,"oval",0x271d28,[0,-.004,-.041],[.014,.018,.005]);
        dragonCurve(at,[[-.052,.007,-.008,.005],[0,.025,-.020,.015],[.048,.008,-.008,.005]],[skin,light],9);
        fanFin(head,[side*.167,.182,.056],[[side*.111,.174,.058],[side*.160,.282,.061],[side*.241,.373,.086],
          [side*.261,.348,.117],[side*.249,.209,.127],[side*.206,.164,.113]],[skin,light],.032,9).name="Orelha lupina";
        fanFin(head,[side*.176,.211,.038],[[side*.145,.194,.039],[side*.178,.267,.045],[side*.235,.339,.067],
          [side*.224,.247,.070],[side*.212,.207,.061]],[0x584550,0x927176],.014,7).name="Interior da orelha";
        for(let i=0;i<7;i++)dragonCurve(head,[[side*(.147+i*.004),-.135+i*.054,.062,.057],
          [side*(.236+i*.010),-.149+i*.058,.134,.048],
          [side*(.272+i*.008),-.242+i*.065,.208,.018],[side*(.264+i*.009),-.287+i*.073,.229,.001]],
          [skin,i%3===0?light:0x3e3a45],12).name="Juba lateral";
      }
      for(let i=-3;i<=3;i++)dragonCurve(head,[[i*.042,.171,.054,.049],[i*.046,.252-i%2*.022,.048,.042],
        [i*.052,.386-Math.abs(i)*.028,.107,.004]],[skin,i%2?light:0x3e3a45],12).name="Crista de pelo";
    }
    function folklore(type,g,rig){
      if(type==="boitata"){
        serpent(g,rig,{tint:0xa24619,trim:0xeb9f32,glow:0xffd958,fire:true,profile:{strike:{}}});
        g.scale.set(1.35,1.12,1.27);
        const crest=hinge(rig.head,0,.112,.015);
        flameFronds(crest,rig,.43,9,.61);
        for(const [i,bone] of rig.slither.entries()){
          if(i===0||i===2||i>14)continue;
          const torch=hinge(bone,0,i<5?.16:.19-i*.008,.004);
          flameFronds(torch,rig,(i<5?.33:.26)*(1-i*.035),i%2?3:4,1.06);
          if(i%2===0)folkParticles(torch,rig,[0,.04,0],[0xffae43,0xff6222,0xffdf87],9,"embers");
        }
        return;
      }
      if(type==="headless_mule")return headlessHorse(g,rig);
      const wolf=type==="werewolf",saci=type==="saci",boto=type==="pink_boto",curupira=type==="curupira";
      const skin=wolf?0x41404c:saci?0x512e27:boto?0xb47d64:0x693629;
      const light=wolf?0x887b81:saci?0x85503c:boto?0xe0ad8c:0xbd703f;
      const cloth=wolf?0x784229:saci?0x983129:boto?0xe6e0d1:0x655431;
      const body=boto?hinge(g,0,0,0):g;
      if(boto){
        rig.human=body;rig.boto=creature("pink_boto");g.add(rig.boto.group);
        rig.boto.group.position.y=.34;body.visible=false;
        folkParticles(rig.boto.group,rig,[0,.05,.45],[0xf6aad3,0xb2f4ed],18,"spray");
      }
      body.scale.setScalar(wolf?1.12:boto?1:curupira?.89:.77);
      const broad=wolf?.404:boto?.273:curupira?.303:.204;
      const woven=new T.Color(cloth),cinder=new T.Color(0x351b23);
      rig.body=verticalHull(body,[[.675,.025,.14,.101],[.731,.025,.205,.139],[.825,.021,.213,.160],
        [.947,.017,wolf?.219:.193,.149],[1.070,.011,broad*.83,.164],[1.178,.001,broad*.96,wolf?.235:.175],
        [1.238,-.013,broad,wolf?.220:.176],[1.309,-.028,broad*.94,.168],
        [1.387,-.039,broad*.64,.131],[1.446,-.039,.124,.109],[1.526,-.047,.095,.097]],
        [boto?cloth:skin,light],56,(color,y,a)=>{
          if(boto)color.lerp(woven,.77+.20*Math.sin(a*3)**2);
          else if(y<.846)color.lerp(woven,.94);
          if(wolf||curupira)color.multiplyScalar(.86+.14*Math.sin(y*133+a*23)**2+.047*Math.cos(y*71-a*17));
          if(curupira&&y>.84)color.lerp(cinder,.28*Math.max(0,-Math.cos(a)));
          if(boto&&Math.abs(Math.sin(a))<.35&&Math.cos(a)>.85&&y>1.04)color.lerp(woven,.25);
        });
      rig.body.name="Torso contínuo e pescoço";
      const head=hinge(body,0,wolf?1.60:1.622,wolf?-.105:-.039);rig.head=head;
      if(wolf){
        wolfFace(head,rig,skin,light);rig.werewolf=true;
        const mane=hinge(body,0,1.403,.067);
        for(const side of [-1,1])for(let i=0;i<6;i++){
          const z=-.086+i*.047,y=.096-i*.017,x=side*(.105+i*.031);
          dragonCurve(mane,[[side*.076,y-.051,z,.071],[x,y,z,.059],[x*1.18,y-.074,z+.086,.037],
            [x*1.29,y-.155,z+.149,.003]],[skin,i%3===0?light:0x4f4a55],10,[1,0,0]).name="Pelagem da nuca e do ombro";
        }
      }
      else humanFace(head,{skin,light,iris:boto?0x79674a:saci?0x795144:0xffb33a,eyebrow:curupira?0x7c361f:0x33242b,
        width:curupira?1.06:saci?1.04:1,mood:curupira?"stern":saci?"smile":""});
      for(const side of [-1,1]){
        const arm=organicArm(body,rig,side,broad*.90,1.286,-.020,wolf?.84:.608,wolf?.169:curupira?.133:.092,
          boto?cloth:skin,boto?0xc2c4bd:light,wolf);
        if(boto){
          part(arm.lower,"disk",0xe9e5da,[0,-.243,-.02],[.066,.077,.063],[.16,0,0]);
          part(arm.lower,"oval",0x9c8061,[side*.066,-.237,-.046],[.014,.018,.013]);
          const lapel=[[side*.083,1.393,-.119],[side*.170,1.295,-.167],[side*.056,1.123,-.16]];
          fanFin(body,[side*.085,1.238,-.175],lapel,[0xc9c2b7,0xfff5dc],.017,4);
        }else if(curupira||saci){
          for(let i=0;i<(curupira?3:1);i++)part(arm.lower,"ring",curupira?0x986637:0x70533c,
            [0,-.171-i*.022,-.019],[.060,.060,.044],[Math.PI/2,0,0]);
          if(curupira){
            const pulses=[[[side*.018,.070,-.054,.009],[side*.035,-.055,-.093,.012],[side*.073,-.173,-.085,.006],[side*.023,-.26,-.060,.003]],
              [[side*.022,.053,-.035,.009],[side*.035,-.070,-.073,.010],[side*.016,-.16,-.056,.006],[side*.019,-.24,-.062,.002]]];
            pulses.forEach((points,i)=>emberTrace(i?arm.lower:arm.upper,points));
            if(side===1){
              const staff=hinge(arm.hand,.012,-.073,-.018);staff.rotation.z=-.44;
              dragonCurve(staff,[[0,-.40,0,.020],[0,.102,0,.020],[0,.60,.009,.019],
                [0,.92,.010,.016]],[0x72452c,0x946c3a],12).name="Haste do Curupira";
              fanFin(staff,[0,.92,.010],[[-.065,.928,.014],[-.057,1.041,.017],[0,1.170,.020],
                [.063,1.033,.022],[.055,.943,.01]],[0x605e57,0xada494],.028,9).name="Ponta de pedra";
              for(let i=0;i<5;i++)part(staff,"ring",0xb48a50,[0,.87+i*.014,.011],[.029,.026,.022],[Math.PI/2,0,0]);
            }
          }
        }else if(wolf){
          for(let i=0;i<4;i++)dragonCurve(arm.upper,[[side*.049,.059-i*.062,.044,.056],
            [side*.117,-.018-i*.054,.078,.044],[side*.133,-.122-i*.046,.092,.003]],
            [skin,i%2?light:0x5b5461],10).name="Mecha do braço";
          for(let i=0;i<3;i++)dragonCurve(arm.lower,[[side*.030,-i*.078,.008,.029],
            [side*.090,-.074-i*.072,.005,.033],[side*.095,-.148-i*.070,.029,.004]],
            [skin,0x76707a],8).name="Pelagem do antebraço";
          part(arm.hand,"oval",0x514651,[0,-.034,-.042],[.057,.034,.012]).name="Almofada da mão";
        }
        if(!saci||side>0){
          const leg=organicLeg(body,rig,saci?0:side*(wolf?.160:.126),.758,.026,.743,wolf?.131:curupira?.105:.084,
            boto?cloth:skin,boto?0xd4c7ac:light,side>0?Math.PI:0,curupira?1:-1);
          if(boto)part(leg.foot,"oval",0xc5b6a1,[0,-.013,-.08],[.091,.052,.127],[.10,0,0]);
          if(wolf){
            leg.upper.userData.stance=side*.25;
            dragonCurve(leg.upper,[[0,.046,.017,.128,.133],[side*.018,-.061,.011,.145,.137],
              [side*.009,-.201,-.031,.127,.125],[0,-.333,-.020,.084,.086]],[0x5c3529,cloth],22).name="Calça de tecido rasgado";
            for(let j=0;j<5;j++){
              const at=j*Math.PI*.4;
              dragonCurve(leg.upper,[[Math.cos(at)*.088,-.281,Math.sin(at)*.072,.048],
                [Math.cos(at)*.112,-.344,Math.sin(at)*.092,.028],[Math.cos(at)*.084,-.391+(j%2)*.016,Math.sin(at)*.097,.003]],
                [cloth,0x9f6443],8);
            }
            for(let j=-2;j<=2;j++)dragonHorn(leg.foot,[[j*.041,-.021,-.192,.016],[j*.044,-.039,-.222,.011],
              [j*.047,-.061,-.238,.002]],[0xb0a8a2,0xe0d2bd]);
          }else if(curupira)emberTrace(leg.lower,[[0,.031,-.040,.007],[side*.027,-.063,-.071,.010],
            [side*.052,-.169,-.045,.009],[side*.011,-.302,-.035,.002]]);
        }
      }
      if(curupira||saci){
        const leaves=curupira?22:13;
        for(let i=0;i<leaves;i++){
          const a=i*Math.PI*2/leaves,theLeaf=hinge(body,Math.sin(a)*.190,.834,Math.cos(a)*.145);
          theLeaf.rotation.y=a;
          const length=curupira?.28+.12*(i%5)/4:.10+i%4*.041;
          const tint=curupira?i%3?0x665b3a:0x8a7848:i%3?0xab2b25:0x832326;
          fanFin(theLeaf,[0,.037,-.027],[[-.062,-.022,0],[-.067,-length*.61,.036],[.018,-length,.047],
            [.062,-length*.71,.038],[.069,-.025,0]],[cloth,tint],.021,7).name=curupira?"Fibras do saiote":"Tecido vermelho";
          if(curupira)dragonCurve(theLeaf,[[0,.021,-.016,.007],[0,-length*.49,.034,.006],[0,-length*.89,.053,.002]],
            [0x8f9e4b,0xbbbf68],8);
        }
      }
      if(curupira){
        part(head,"oval",0x77311d,[0,.101,.065],[.183,.147,.166],[.08,0,0]);
        const crown=hinge(head,0,.173,.047);crown.rotation.x=.29;crown.rotation.z=.13;
        flameFronds(crown,rig,.59,15,.95);
        flameFronds(hinge(crown,-.066,.12,.11),rig,.40,7,1.32);
        folkParticles(crown,rig,[0,.05,0],[0xff6929,0xffb561,0xffd366],35,"embers");
        for(const side of [-1,1]){
          fanFin(head,[side*.147,-.011,.035],[[side*.16,.020,.022],[side*.255,.124,.059],
            [side*.219,.027,.056],[side*.182,-.062,.035]],[skin,light],.026,9).name="Orelha pontuda";
          emberTrace(body,[[side*.039,1.226,-.179,.007],[side*.115,1.219,-.177,.012],[side*.231,1.275,-.108,.010],
            [side*.275,1.299,-.066,.006],[side*.244,1.336,-.049,.003]]);
          emberTrace(body,[[side*.202,1.127,-.112,.008],[side*.155,1.069,-.158,.012],
            [side*.103,.977,-.123,.008],[side*.160,.910,-.083,.003]]);
        }
        for(let i=0;i<11;i++){
          const x=(i-5)*.032;
          part(body,"oval",i%2?0x9a7347:0x694623,[x,1.313+Math.abs(x)**1.25*.39,-.177+Math.abs(x)*.46],[.023,.028,.021]);
        }
        part(body,"shard",0xc7b584,[0,1.253,-.193],[.032,.076,.024],[.19,0,-.22]);
      }else if(saci){
        for(let i=0;i<10;i++){
          const a=i*2.399;
          part(head,"oval",i%3?0x2f2529:0x48302a,[Math.sin(a)*.151,.057-(i%3)*.030,.075+Math.cos(a)*.094],[.035,.042,.031]);
        }
        verticalHull(head,[[.087,.042,.152,.142],[.113,.037,.185,.173],[.159,.051,.184,.161],
          [.221,.067,.174,.158],[.272,.092,.156,.143],[.305,.119,.094,.102],[.316,.140,.031,.039]],
          [0x962b29,0xea4d32],39,(color,y,a)=>color.multiplyScalar(.88+.16*Math.sin(y*76+a*6)**2)).name="Gorro vermelho costurado";
        dragonCurve(head,[[-.044,.234,.146,.088,.088],[-.139,.247,.214,.089,.066],[-.217,.200,.314,.068,.054],
          [-.256,.124,.378,.042,.034],[-.231,.055,.420,.018,.022],[-.198,.051,.441,.002,.005]],
          [0xab272c,0xe74c35],26).name="Ponta caída do gorro";
        dragonCurve(head,[[-.165,.111,.074,.012],[-.134,.140,-.076,.015],[0,.164,-.133,.015],
          [.132,.139,-.091,.014],[.166,.099,.063,.010]],[0xb0312e,0xf75940],13).name="Borda dobrada do gorro";
        const pipe=hinge(head,.058,-.111,-.148);
        dragonCurve(pipe,[[0,0,0,.009],[.076,-.020,-.077,.008],[.111,-.029,-.119,.010]],[0x4c2d22,0x8b6042],10);
        verticalHull(pipe,[
          [-.054,-.116,.022,.023],[-.040,-.121,.031,.029],[-.010,-.120,.036,.033],[.003,-.120,.030,.028]
        ],[0x6e4c31,0x9d7143],22).position.x=.115;
        part(pipe,"oval",0x352a2b,[.115,.005,-.120],[.023,.006,.024]);
        folkParticles(pipe,rig,[.114,.017,-.120],[0xd4c7b5,0xaab5ad],12,"smoke");
        rig.saciVortex=saciVortex(body);
        folkParticles(body,rig,[0,.26,0],[0xccd8bd,0xb1d2c8,0xf0dbba],30,"whirl");
      }else if(boto){
        const hat=hinge(head,0,.146,.044);hat.rotation.z=-.082;
        verticalHull(hat,[[0,0,.225,.199],[.024,0,.251,.213],[.050,0,.225,.190],
          [.061,0,.154,.136],[.087,.010,.151,.127],[.147,.020,.119,.109],[.176,.027,.050,.060]],
          [0xe3d6ad,0xfff1cc],34).name="Chapéu de aba e copa";
        part(hat,"ring",0x978163,[0,.075,.007],[.159,.138,.136],[Math.PI*.5,0,0]);
        for(let i=0;i<4;i++)part(body,"oval",0xb29c77,[.013,1.119-i*.073,-.154],[.017,.019,.016]);
      }else{
        verticalHull(body,[[.747,.021,.180,.100],[.787,.019,.215,.159],[.825,.021,.216,.166],
          [.855,.018,.193,.158]],[0x563226,cloth],30).name="Cintura da calça";
        for(const side of [-1,1])for(let i=0;i<5;i++)dragonCurve(body,[
          [side*.052,1.46-i*.053,-.103,.058],[side*(.103+i*.017),1.38-i*.055,-.158,.063],
          [side*(.143+i*.019),1.22-i*.045,-.197,.009]],[skin,i%2?light:0x524754],11);
        folkParticles(body,rig,[0,.087,.015],[0x9c83ae,0xafbbc8],16,"dust");
      }
    }
    function emberTrace(parent,path){
      const ember=dragonCurve(parent,path,[0xff791d,0xf6b458],9);
      ember.material=material(0xe97528,true,.78);ember.userData.noShadow=true;
      ember.name="Traço de brasa";
      return ember;
    }
    function saciVortex(body){
      const wind=hinge(body,0,.043,.019);wind.name="Redemoinho em espiral";wind.visible=false;
      for(let i=0;i<4;i++){
        const knots=Array.from({length:14},(_,j)=>{
          const t=j/13,a=t*7.8+i*Math.PI*.5,y=.80*t,r=.055+.32*t;
          return [Math.cos(a)*r,y,Math.sin(a)*r,.007+.036*Math.sin(t*Math.PI)];
        });
        const ribbon=dragonCurve(wind,knots,[0x6d8586,0xb0bbb2],11,[0,0,1]);
        ribbon.material=material(i%2?0x96a49a:0x677c7d,true,i%2?.35:.49);
        ribbon.userData.noShadow=true;
      }
      return wind;
    }

    function screamer(g,rig,form){
      const {petal,light,leaf,bud,shape}=form,green=pigment(leaf,false);
      const leaves=shape>1?9:shape<.90?5:7,petals=shape>1?5:shape<.90?8:6;
      for(let i=0;i<leaves;i++){
        const a=i*Math.PI*2/leaves,branch=hinge(g,0,.11,0);
        branch.rotation.y=a;
        for(let k=0;k<3;k++)part(branch,k===2&&shape<.9?"shard":"oval",k===2?leaf:green,[0,k*.11,.23+k*.12],
          [.12/shape,.052,.33-k*.057],[-.25-k*.28,0,0]);
      }
      link(g,green,[0,.08,0],[0,.91*shape,-.062],.115);
      const head=hinge(g,0,shape,-.07);head.rotation.x=.44;rig.bud=head;
      part(head,"oval",bud,[0,0,0],[.289,.278*shape,.279]);
      const throat=part(head,"oval",0x1c1526,[0,0,-.253],[.163,.019,.061]);
      rig.throat=throat;rig.petals=[];
      for(let i=0;i<petals;i++){
        const at=hinge(head,0,0,-.208);at.rotation.z=i*2*Math.PI/petals;
        const lobe=hinge(at,0,.13,0);lobe.rotation.x=.76;rig.petals.push(lobe);
        part(lobe,"oval",i%2?pigment(petal,false):petal,[0,.068,-.036],[.12,.225*shape,.081],[-.32,0,0]);
        part(lobe,"oval",light,[0,.126,-.066],[.026,.103,.013],[-.39,0,0]);
      }
    }

    function folkloreEffects(rig,now,stride,enabled){
      const time=now*.001;
      if(rig.saciVortex){
        const power=Math.max(rig.whirlPower||0,stride*.83);
        rig.saciVortex.visible=enabled&&power>.14;
        rig.saciVortex.rotation.y=time*(7+power*7);
        rig.saciVortex.scale.set(.61+power*.53,.57+power*.49,.61+power*.53);
      }
      for(const {points,kind} of rig.folkParticles??[]){
        points.visible=enabled&&(kind!=="dust"||stride>.18);
        if(!points.visible)continue;
        const attr=points.geometry.getAttribute("position"),wind=kind==="whirl",spray=kind==="spray",smoke=kind==="smoke";
        points.material.opacity=wind?.28+stride*.58:spray?.57:smoke?.36:.76;
        for(let i=0;i<attr.count;i++){
          const life=(time*(wind?.58:.66+i%4*.11)+i*.618)%1,angle=i*2.399+time*(wind?4.4:1.05);
          const pulse=.19*Math.sin(life*Math.PI),radius=wind?.31+life*.44+stride*.25:spray?.115+life*.18:smoke?.009+life*.083:.043+life*.26;
          attr.setXYZ(i,Math.cos(angle)*radius,wind?life*1.12:spray?pulse:smoke?life*.32:kind==="dust"?pulse*1.8:life*.68,
            Math.sin(angle)*radius+life*(spray?.62:smoke?.063:stride*.22));
        }
        attr.needsUpdate=true;
      }
    }
    function ambientEffects(rig,now,charge,release,motion,stride=0){
      const t=now*.001,power=Math.max(charge,release);
      for(const [i,joint] of (rig.slither??[]).entries()){
        const raised=rig.raisedSerpent,travel=raised&&i<3?.42:1;
        joint.rotation.y=Math.sin(t*(3.5+stride*2.6)-i*.88)*(.059+stride*.13)*motion*(1-power*.44)*travel;
        joint.rotation.x=i===0?-charge*.16+release*.11:Math.sin(t*3.55-i)*.016*stride*motion;
      }
      if(rig.slither){
        rig.head.rotation.x=-charge*.16+release*.07;
        const cycle=(t+stride*.26)%2.05;
        const flick=Math.max(0,1-Math.abs(cycle-.55)*6.7,1-Math.abs(cycle-.80)*8.4)*(1-power);
        rig.serpentTongue.visible=flick>.055;
        rig.serpentTongue.position.z=-.074-flick*.091;
        rig.serpentTongue.scale.z=.055+.96*flick;
        rig.serpentTongue.rotation.x=Math.sin(t*24)*.062*flick;
        if(rig.serpentTongue.visible)rig.jaw.rotation.x=Math.min(rig.jaw.rotation.x,-.052-.045*flick);
      }
      if(rig.moltenMaterial){
        rig.moltenTime.value=t;rig.moltenMaterial.emissiveIntensity=.77+Math.sin(t*5)*.11*motion+power*.47;
      }
      if(rig.ghostMist){
        rig.ghostMist.uniforms.time.value=t;rig.ghostMist.uniforms.charge.value=power;
        rig.body.position.y=.67+Math.sin(t*3)*.065*motion;
      }
      for(const [i,mote] of (rig.embers??[]).entries()){
        const u=(t*(.49+i%3*.11)+i*.618)%1,a=i*2.399+t*.82;
        const r=(.22+u*.29)*(rig.ghostMist?1.09:.77)+power*.12;
        const scale=(.018+i%4*.008)*Math.sin(u*Math.PI);
        mote.position.set(Math.cos(a)*r,-.39+u*1.33,Math.sin(a)*r);
        mote.scale.set(scale,scale*1.48,scale);
      }
      for(const claw of rig.claws??[])claw.rotation.y=claw.userData.side*(.16+charge*.56-release*.18);
      if(rig.gazeOrigin){
        rig.serpentTail.rotation.y=Math.sin(t*(2.4+stride*2))*(.11+stride*.16)*motion;
        rig.body.rotation.z=Math.sin(t*3.8)*stride*.046*motion;
        for(const [i,snake] of rig.snakes.entries()){
          snake.rotation.x=Math.sin(t*5+i*.92)*(.16+power*.10)*motion;
          snake.rotation.y=Math.cos(t*4+i*.88)*.20*motion;
          snake.rotation.z=Math.sin(t*4+i*.87)*.17*motion;
        }
        for(const eye of rig.gazeEyes){
          eye.visible=power>.03;eye.material.uniforms.strength.value=.87*power**1.5;
          eye.scale.setScalar(.24+power*.27);
        }
      }
    }
    function exterminationCreature(g,rig,profile){
      const {model,tint}=profile;
      if(model==="glass_mycelium"){
        const glow=0x8fefd9,dark=0x374e50,cap=hinge(g,0,1.10,.02);
        const body=rig.body=hinge(g,0,.13,0);
        rig.head=cap;
        part(body,"oval",tint,[0,.58,0],[.21,.53,.25],[.13,0,0]);
        part(cap,"oval",dark,[0,.025,0],[.54,.12,.49],[0,0,-.08]);
        part(cap,"shard",0x448f91,[.01,.20,.015],[.55,.37,.50],[0,.52,-.08],false,.86);
        part(cap,"oval",glow,[.015,.175,.02],[.21,.17,.20],undefined,true);
        for(let i=0;i<9;i++){
          const yaw=i/9*Math.PI*2,x=Math.cos(yaw),z=Math.sin(yaw);
          link(cap,glow,[x*.12,.10,z*.12],[x*.50,.021,z*.44],.017,.82,true);
          part(cap,"diamond",i%2?0xb2e9ef:0x74bdb1,[x*.36,.13+(i%3)*.04,z*.35],[.071,.11,.059],[.2,yaw,.28],true);
        }
        for(const side of [-1,1]){
          part(cap,"oval",0x121e23,[side*.119,-.033,-.354],[.071,.06,.09]);
          part(cap,"oval",glow,[side*.119,-.042,-.426],[.023,.024,.021],undefined,true);
          const root=organicArm(g,rig,side,.23,.83,0,.63,.064,tint,glow);
          part(root.hand,"shard",0x4fadaa,[0,-.08,0],[.09,.135,.07]);
          for(const z of [-.16,.18])organicLeg(g,rig,side*.16,.47,z,.43,.087,dark,tint,
            (side>0)===(z>0)?0:Math.PI,-1,true);
        }
      }else if(model==="echo_burrower"){
        const purple=profile.glow??0xad7ce9,dark=0x353344,body=rig.body=hinge(g,0,.46,.08);
        part(body,"shard",tint,[0,.035,.06],[.47,.39,.64]);
        const cavity=geode(body,0,.19,.075,.39,dark,purple);
        cavity.rotation.x=1.27;
        if(profile.contractOnly){
          for(const side of [-1,1])part(body,"shard",purple,[side*.24,.26,.26],[.096,.25,.11],[.21,0,side*.53],true);
        }
        for(const side of [-1,1]){
          for(let i=0;i<3;i++){
            const z=-.34+i*.30;
            part(body,"facet",i%2?dark:tint,[side*.327,.09,z],[.31,.25,.34],[.15,side*.24,-side*.49]);
            const leg=organicLeg(g,rig,side*.31,.35,z,.29,.102,dark,0x7c739b,(i+(side>0?1:0))*Math.PI,-1,true);
            leg.upper.rotation.z=side*.47;
          }
        }
        const head=rig.head=hinge(g,0,.42,-.46);
        part(head,"chamfer",dark,[0,0,-.115],[.41,.23,.29]);
        for(const side of [-1,1]){
          part(head,"oval",purple,[side*.19,.039,-.287],[.053,.038,.044],undefined,true);
          dragonHorn(head,[[side*.16,-.045,-.24,.073],[side*.27,-.084,-.43,.050],
            [side*.18,-.092,-.615,.006]],[dark,0x9288af]);
        }
      }else if(model==="soot_weaver"){
        const frame=hinge(g,0,0,0),ember=profile.glow??0xe78e43;
        frame.scale.setScalar(1.21);
        venomFauna(frame,rig,{...profile,trim:0x76606a,glow:ember});
        for(const side of [-1,1])for(let i=0;i<3;i++){
          const z=.14+i*.107;
          part(rig.body,"chamfer",0x262435,[side*.155,.162,z],[.11,.134,.115],[.16,0,-side*.35]);
          part(rig.body,"oval",ember,[side*.187,.194,z-.045],[.048,.031,.015],undefined,true);
          part(rig.body,"facet",0x907383,[side*.147,.234-i*.019,z],[.081,.09,.076],[.15,0,-side*.31]);
        }
        if(profile.contractOnly)part(rig.body,"shard",ember,[0,.21,.29],[.08,.15,.19],[-.2,0,0],true);
      }else if(model==="fractured_sentinel"){
        const body=rig.body=hinge(g,0,1.10,0);
        const limestone=0xd1b994,shadow=0x5d4e42;
        part(body,"shard",shadow,[0,0,0],[.48,.50,.29]);
        for(let row=0;row<4;row++){
          const y=-.29+row*.19;
          for(const side of [-1,1])part(body,"chamfer",row%2?tint:limestone,
            [side*(.21+row*.027),y,-.12],[.39,.15,.34],[0,side*.12,side*(.14-row*.035)]);
          part(body,"diamond",0xffc878,[row%2?.045:-.037,y,-.342],[.034,.096,.03],[0,0,row%2?.42:-.46],true);
        }
        const head=rig.head=hinge(g,0,1.65,-.08);
        part(head,"facet",tint,[0,.095,0],[.51,.43,.38],[0,.16,-.07]);
        part(head,"cube",shadow,[0,.045,-.19],[.31,.057,.035]);
        for(const side of [-1,1]){
          part(head,"diamond",0xffc878,[side*.103,.047,-.221],[.063,.032,.022],undefined,true);
          part(head,"shard",limestone,[side*.173,.277,.051],[.09,.14,.09],[.18,0,-side*.2]);
          const {upper,lower}=organicArm(g,rig,side,.47,1.43,.01,.73,.148,shadow,tint);
          part(upper,"shard",limestone,[0,-.04,0],[.22,.23,.23]);
          part(lower,"chamfer",tint,[0,-.18,-.03],[.19,.24,.17]);
          const leg=organicLeg(g,rig,side*.225,.79,0,.72,.13,shadow,tint,side>0?0:Math.PI);
          part(leg.lower,"chamfer",limestone,[0,-.14,-.04],[.14,.20,.14]);
        }
      }else if(model==="tide_ooze"){
        const body=rig.body=hinge(g,0,0,0),core=new T.Mesh(geometry.slime,material(tint,false,.82));
        body.add(core);
        part(body,"oval",0x505f37,[0,.13,.08],[.57,.115,.55],undefined,false,.85);
        part(body,"oval",0xb1c971,[.03,.35,-.07],[.31,.26,.31]);
        for(let i=0;i<11;i++){
          const a=i*2.39996,y=.14+i*.047,r=.37-Math.max(0,i-5)*.032;
          part(body,"oval",i%2?0xe5d99c:0x8d9d5d,[Math.cos(a)*r,y,Math.sin(a)*r],[.047,.038,.051],undefined,false,.84);
        }
        const head=rig.head=hinge(body,0,.43,-.414);
        part(head,"oval",0x2e4031,[0,-.08,-.034],[.117,.036,.021]);
        for(const side of [-1,1]){
          part(head,"oval",0x293729,[side*.15,.017,0],[.079,.084,.039]);
          part(head,"oval",0xe2df99,[side*.154,.025,-.026],[.04,.041,.026],undefined,true);
          const feeler=hinge(body,side*.23,.62,-.21);
          rig.tails.push(feeler);
          link(feeler,tint,[0,0,0],[side*.14,.19,-.049],.028);
          part(feeler,"oval",0xbbcc82,[side*.14,.19,-.049],[.044,.044,.04],undefined,true);
        }
      }else if(model==="ember_salamander"){
        const ember=0xf08638,copper=0x5c8b73,body=rig.body=hinge(g,0,0,0);
        part(body,"oval",tint,[0,.34,.06],[.33,.23,.59]);
        part(body,"oval",0x996245,[0,.23,-.01],[.29,.118,.43]);
        for(let i=0;i<6;i++){
          part(body,"shard",i%2?copper:0x825847,[0,.54-i*.019,-.25+i*.117],
            [.25-i*.016,.09,.122],[.26,0,0]);
          for(const side of [-1,1])part(body,"oval",ember,[side*(.25-i*.014),.35,.07+i*.069],[.032,.024,.054],undefined,true);
        }
        const head=rig.head=hinge(g,0,.32,-.49);
        part(head,"oval",tint,[0,.026,-.08],[.29,.177,.308]);
        part(head,"oval",0x986043,[0,-.057,-.14],[.247,.082,.276]);
        for(const side of [-1,1]){
          part(head,"oval",0xffcd85,[side*.217,.080,-.199],[.055,.053,.045],undefined,true);
          part(head,"diamond",0x201a19,[side*.234,.083,-.233],[.012,.032,.008]);
          for(const z of [-.29,.37]){
            const leg=organicLeg(g,rig,side*.28,.33,z,.28,.077,tint,copper,(side>0)===(z>0)?0:Math.PI);
            leg.upper.rotation.z=side*.55;
          }
        }
        const tail=hinge(g,0,.298,.53);rig.tails.push(tail);
        dragonCurve(tail,[[0,0,0,.147],[0,-.025,.27,.101],[.048,.005,.55,.061],
          [.088,.075,.76,.027],[.092,.077,.89,.004]],[tint,ember],14);
      }
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
      }else if(id==="basalt_husk"){
        for(const side of [-1,1]){
          part(g,"shard",0x3e373d,[side*.43,1.72,-.025],[.242,.232,.256],[0,side*.46,side*.29]);
          for(let i=0;i<3;i++)part(g,"diamond",i%2?0xff9c55:0xda6037,[side*(.32+i*.062),1.48+i*.103,-.307],
            [.036,.113,.028],[.11,0,side*.38],true);
        }
      }
    }
    return {fish,creature,refine,scorpion,regional,regionalThreat,cowCoat,deer,owl,dragon,livingTree,siteWarden,
      magma,ghost,crab,armadillo,medusa,venomFauna,folklore,screamer,folkloreEffects,ambientEffects,exterminationCreature,geode,shared:geometry};
  }
  return {create};
})();

