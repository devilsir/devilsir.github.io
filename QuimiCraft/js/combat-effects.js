"use strict";

globalThis.QuimiCraftEffects = (() => {
  function create(THREE,scene,quality,reduced){
    const root=new THREE.Group();
    root.name="Efeitos volumétricos";
    scene.add(root);
    const bursts=[],gazes=[];
    const ringGeometry=new THREE.TorusGeometry(1,.021,6,42);
    const particleLimit=260;
    const positions=new Float32Array(particleLimit*3);
    const colors=new Float32Array(particleLimit*3);
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("color",new THREE.BufferAttribute(colors,3).setUsage(THREE.DynamicDrawUsage));
    geometry.setDrawRange(0,0);
    const material=new THREE.PointsMaterial({size:.09,vertexColors:true,transparent:true,opacity:.84,
      depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
    const sparks=new THREE.Points(geometry,material);
    sparks.frustumCulled=false;
    root.add(sparks);
    const particles=[];
    const palette={wind:0x85fbdf,cyclone:0xa0efd0,arrow:0xd3edd2,guard:0xf2deb2,enemy:0xc69aff,
      cook:0xe7c69c,forge:0xffad4b,glass:0x90e3e1,hit:0xffcc77,catch:0x81e9f1,bite:0x50d0f0,land:0x9ddffa,cast:0x87eddc,
      fire:0xff7850,ice:0x82d9ff,earth:0xe5a372,time:0xffcb69,nature:0xa6ed6b,storm:0x7fe6ff,arcane:0xa58bff,mirror:0xc8f9ff,stone:0x9ba499,venom:0x97db57};
    const shotGeometry={
      ember:new THREE.IcosahedronGeometry(1,1),rock:new THREE.DodecahedronGeometry(1,0),
      shard:new THREE.OctahedronGeometry(1,0),band:new THREE.TorusGeometry(1,.085,5,28)
    };
    const glowPixels=new Uint8Array(32*32*4);
    for(let y=0;y<32;y++)for(let x=0;x<32;x++){
      const i=(y*32+x)*4,d=Math.hypot((x+.5)/16-1,(y+.5)/16-1);
      glowPixels.set([255,255,255,Math.round(255*Math.max(0,1-d)**2)],i);
    }
    const glowMap=new THREE.DataTexture(glowPixels,32,32);
    glowMap.magFilter=THREE.LinearFilter;glowMap.minFilter=THREE.LinearFilter;glowMap.needsUpdate=true;
    const breathGeometry=new THREE.CylinderGeometry(1,.16,1,24,18,true);
    breathGeometry.rotateX(-Math.PI/2);
    breathGeometry.translate(0,0,-.5);
    const forward=new THREE.Vector3(0,0,-1);
    function shieldFlowGeometry(){
      const points=[],uvs=[],indices=[],segments=12;
      const rim=[[0,-.54],[.23,-.38],[.33,-.14],[.37,.13],[.31,.36],[.17,.46],
        [-.17,.46],[-.31,.36],[-.37,.13],[-.33,-.14],[-.23,-.38]];
      for(const [i,[x,y]] of rim.entries()){
        const exit=new THREE.Vector3(x*(1.68+i%3*.23),y*(1.48+i%3*.17),.06+i%2*.19);
        const curve=new THREE.CubicBezierCurve3(new THREE.Vector3(x*.17,y*.17,-.24),
          new THREE.Vector3(x*.83,y*.83,-.34),new THREE.Vector3(x*1.12,y*1.12,-.14),exit);
        const drift=new THREE.Vector3(-y,x,0).normalize();
        const base=points.length/3;
        for(let n=0;n<=segments;n++){
          const t=n/segments,center=curve.getPoint(t);
          for(let side=0;side<2;side++){
            const width=.014+.068*Math.sin(t*Math.PI*.79);
            points.push(...center.clone().addScaledVector(drift,(side*2-1)*width).toArray());
            uvs.push(i*.27+side*.22,t);
          }
          if(n<segments){
            const a=base+n*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);
          }
        }
      }
      const geometry=new THREE.BufferGeometry();
      geometry.setAttribute("position",new THREE.Float32BufferAttribute(points,3));
      geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return geometry;
    }
    const shieldFlow=shieldFlowGeometry();

    function dragonShot(attack,style){
      const element=attack.element,group=new THREE.Group(),body=new THREE.Group(),pieces=[];
      group.add(body);
      const materials=[];
      function hot(color){
        const m=new THREE.MeshBasicMaterial({color,toneMapped:false});
        materials.push(m);return m;
      }
      const light=hot(style.trim),edge=hot(attack.color);
      const shell=new THREE.MeshStandardMaterial({color:element==="earth"?0x705346:attack.color,
        emissive:style.light,emissiveIntensity:element==="earth"?.17:.37,flatShading:true,roughness:.63});
      materials.push(shell);
      function part(shape,material,scale,pos=[0,0,0]){
        const mesh=new THREE.Mesh(shotGeometry[shape],material);
        mesh.scale.set(...scale);mesh.position.set(...pos);body.add(mesh);return mesh;
      }
      let count;
      if(element==="fire"){
        part("ember",edge,[.23,.23,.48],[0,0,.09]);
        part("ember",light,[.15,.15,.42],[0,0,-.06]);
        count=7;
      }else if(element==="ice"){
        part("shard",shell,[.20,.20,.59]);
        part("shard",light,[.105,.105,.50],[0,0,-.14]);
        count=5;
      }else if(element==="time"){
        part("ember",light,[.134,.134,.20]);
        for(const [i,tilt] of [0,.74,-.74].entries()){
          const band=part("band",i?edge:light,[.34-i*.035,.34-i*.035,.34],[0,0,(i-1)*.19]);
          band.rotation.y=tilt;band.rotation.x=i*.40;
        }
        count=7;
      }else if(element==="earth"){
        part("rock",shell,[.27,.244,.32]);
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3;
          const chip=part("shard",i%2?edge:light,[.059,.041,.23],[Math.cos(a)*.228,Math.sin(a)*.219,Math.sin(i*2)*.087]);
          chip.rotation.y=i*.62;
        }
        count=5;
      }else if(element==="storm"){
        part("shard",light,[.16,.16,.58]);
        for(const side of [-1,1]){
          const bolt=part("shard",edge,[.09,.09,.44],[side*.12,side*.05,.04]);
          bolt.rotation.set(.18,side*.45,side*.65);
        }
        count=7;
      }else if(element==="arcane"){
        part("ember",light,[.16,.16,.24]);
        for(let i=0;i<2;i++){
          const band=part("band",i?edge:light,[.33,.33,.33]);
          band.rotation.set(i*.85,.6-i*1.2,i*.5);
        }
        count=7;
      }else{
        part("ember",light,[.15,.16,.21]);
        for(let i=0;i<3;i++){
          const a=i*Math.PI*2/3;
          const leaf=part("shard",i%2?edge:shell,[.078,.10,.32],[Math.cos(a)*.14,Math.sin(a)*.14,.066]);
          leaf.rotation.set(.32,Math.sin(a)*.42,a);
        }
        count=7;
      }
      const glowMaterial=new THREE.SpriteMaterial({map:glowMap,color:style.light,transparent:true,opacity:.85,
        depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
      const glow=new THREE.Sprite(glowMaterial);
      glow.position.z=.10;group.add(glow);materials.push(glowMaterial);
      for(let i=0;i<count;i++){
        const size=.055+(i%3)*.019;
        const shape=element==="fire"?"ember":element==="earth"?"rock":"shard";
        const mesh=part(shape,i%3?edge:light,[size,size,element==="ice"?size*3.8:size*1.9]);
        pieces.push(mesh);
      }
      let age=0,trailTime=0;
      function update(dt){
        age+=dt;trailTime+=dt;
        const motion=reduced()?.5:1;
        body.rotation.z=age*(element==="time"?6.7:4.2)*motion;
        if(element==="earth")body.rotation.x=age*7.3*motion;
        glow.scale.setScalar((element==="earth"?.93:1.34)+Math.sin(age*19)*.10*motion);
        glowMaterial.opacity=(element==="earth"?.46:.76)+Math.sin(age*22)*.10*motion;
        for(const [i,piece] of pieces.entries()){
          const angle=i*2.4+age*5*motion,orbit=(.09+i*.026)*(1+Math.sin(age*12+i)*.31*motion);
          piece.position.set(Math.sin(angle)*orbit,Math.cos(angle)*orbit,.24+i*(element==="fire"?.16:.115));
          piece.rotation.set(age*4+i,age*3+i,angle);
          piece.visible=quality()>1||i<3;
        }
        if(trailTime>.055){trailTime=0;emit(element,group.position,2,.53)}
      }
      function dispose(){for(const material of materials)material.dispose()}
      update(0);
      return {group,update,dispose};
    }
    function dragonStream(element,style,container=root){
      const group=new THREE.Group();
      group.name="Rajada dracônica";
      group.visible=false;
      const time={value:0},impact={value:0};
      const cool=new THREE.Color(style.mist),base=new THREE.Color(style.light),hot=new THREE.Color(style.trim);
      function layer(mode,blending){
        return new THREE.ShaderMaterial({
          uniforms:{time,impact,mode:{value:mode},cool:{value:cool},base:{value:base},hot:{value:hot}},
          vertexShader:`varying vec2 tex;varying vec3 surfaceNormal;varying vec3 toCamera;
            uniform float time;uniform float mode;
          void main(){
            tex=uv;
            vec3 p=position;
            float a=uv.x*6.283185;
            float lobe=sin(a*3.+uv.y*8.-time*4.8);
            float curl=cos(a*7.-uv.y*20.+time*7.);
            float grow=smoothstep(.01,.75,uv.y)*(1.-step(2.5,mode));
            p.xy*=1.+grow*(.19*lobe+.07*curl);
            p.xy+=vec2(sin(time*6.-uv.y*14.),cos(time*5.-uv.y*10.))*grow*.12;
            vec4 view=modelViewMatrix*vec4(p,1.);
            surfaceNormal=normalMatrix*normal;
            toCamera=-view.xyz;
            gl_Position=projectionMatrix*view;
          }`,
          fragmentShader:`varying vec2 tex;varying vec3 surfaceNormal;varying vec3 toCamera;
          uniform float time;uniform float mode;uniform float impact;
          uniform vec3 cool;uniform vec3 base;uniform vec3 hot;
          float hash(vec3 p){
            p=fract(p*.3183099+.1)*17.;
            return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
          }
          float vapor(vec3 p){
            vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
            return mix(
              mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
              mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
          }
          void main(){
            float t=tex.y,a=tex.x*6.283185;
            float n=vapor(vec3(cos(a),sin(a),0.)*(2.+t*3.)+vec3(time*.66,-time*.45,t*8.-time*6.));
            float streak=pow(.5+.5*sin(a*5.+t*19.-time*13.+n*4.2),4.);
            float shimmer=vapor(vec3(cos(a)*6.,sin(a)*6.,t*20.-time*15.));
            float fade=smoothstep(.0,.075,t)*(1.-smoothstep(mix(.57,.88,impact),1.,t));
            float rim=abs(dot(normalize(surfaceNormal),normalize(toCamera)));
            vec3 outer=mix(cool,base,(1.-t*.74)*(.30+.70*n));
            vec3 inner=mix(base,hot,(1.-smoothstep(.02,.87,t))*.66+streak*.31);
            float opacity;
            vec3 tint;
            if(mode<.5){
              opacity=smoothstep(.19,.88,n)*smoothstep(.03,.52,rim)*(.29+shimmer*.23);
              tint=outer;
            }else if(mode<1.5){
              opacity=(.085+.58*streak)*(.34+.66*n)*smoothstep(.04,.43,rim);
              tint=mix(outer,inner,.57+shimmer*.34);
            }else if(mode<2.5){
              opacity=(.15+.62*shimmer)*(.50+.50*streak)*(1.-.52*t);
              tint=mix(inner,hot,.41*(1.-t));
            }else{
              opacity=(.24+.74*streak)*(.45+.55*shimmer);
              tint=mix(inner,outer,smoothstep(.10,.98,t));
              fade=(1.-smoothstep(.43,1.,t))*smoothstep(.01,.14,t);
            }
            gl_FragColor=vec4(tint,opacity*fade);
          }`,
          side:THREE.DoubleSide,transparent:true,depthWrite:false,blending
        });
      }
      const streams=[THREE.NormalBlending,THREE.AdditiveBlending,THREE.AdditiveBlending].map((blending,i)=>{
        const stream=new THREE.Mesh(breathGeometry,layer(i,blending));
        stream.frustumCulled=false;stream.renderOrder=i+1;group.add(stream);
        return stream;
      });
      const reflection=new THREE.Mesh(shieldFlow,layer(3,THREE.AdditiveBlending));
      reflection.name="Rajada desviada pelo escudo";
      reflection.matrixAutoUpdate=false;reflection.frustumCulled=false;reflection.visible=false;
      root.add(reflection);
      const capacity=54,dustGeometry=new THREE.BufferGeometry();
      for(const [key,width] of [["position",3],["color",3],["glowSize",1],["glowAlpha",1]]){
        dustGeometry.setAttribute(key,new THREE.BufferAttribute(new Float32Array(capacity*width),width).setUsage(THREE.DynamicDrawUsage));
      }
      const dustMaterial=new THREE.ShaderMaterial({
        vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
        vertexShader:`attribute float glowSize;attribute float glowAlpha;varying vec4 tint;
          void main(){vec4 view=modelViewMatrix*vec4(position,1.);
            gl_PointSize=clamp(glowSize*projectionMatrix[1][1]/max(.65,-view.z),1.5,25.);
            tint=vec4(color,glowAlpha);gl_Position=projectionMatrix*view;}`,
        fragmentShader:`varying vec4 tint;
          void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);
            float soft=1.-smoothstep(.02,1.,r);float center=1.-smoothstep(.0,.25,r);
            gl_FragColor=vec4(mix(tint.rgb,vec3(1.),center*.55),tint.a*soft*soft);}`
      });
      const dust=new THREE.Points(dustGeometry,dustMaterial);
      dust.frustumCulled=false;dust.renderOrder=4;group.add(dust);
      const particleTint=new THREE.Color();
      const chips=element==="earth"||element==="ice"||element==="nature",fragments=[];
      const fragmentMaterial=new THREE.MeshBasicMaterial({color:style.light,transparent:true,opacity:.68,depthWrite:false,toneMapped:false});
      if(chips||element==="time")for(let i=0;i<12;i++){
        const shape=element==="earth"?"rock":element==="time"?"band":"shard";
        const piece=new THREE.Mesh(shotGeometry[shape],fragmentMaterial);
        group.add(piece);fragments.push(piece);
      }
      let age=0,emission=0;
      function move(origin,direction,length,dt,blocked,shield){
        const gentle=reduced(),level=quality();
        age+=dt*(gentle?.57:1);emission+=dt;
        time.value=age;impact.value=blocked||shield?1:0;
        group.visible=length>.04;
        group.position.copy(origin);group.quaternion.setFromUnitVectors(forward,direction);
        reflection.visible=!!shield;
        if(shield){
          reflection.matrix.copy(shield.matrixWorld);
          reflection.matrixWorldNeedsUpdate=true;
        }
        const width=Math.min(1.53,.35+length*.105);
        const widths=[width,width*.69,width*.33];
        for(const [i,stream] of streams.entries())stream.scale.set(widths[i],widths[i],length);
        streams[1].rotation.z=-age*1.2;
        const {position,color,glowSize,glowAlpha}=dustGeometry.attributes;
        const count=level>1&&!gentle?capacity:level?23:0;
        for(let i=0;i<count;i++){
          const u=(age*(.92+i%5*.22)+i*.618)%1,a=i*2.399+u*(2.7+i%4)+age*.8;
          const r=(.07+u*.86)*width*(.30+(i%11)*.073);
          const envelope=THREE.MathUtils.smoothstep(u,0,.10)*(1-THREE.MathUtils.smoothstep(u,.60,.98));
          position.setXYZ(i,Math.cos(a)*r,Math.sin(a)*r,-u*length);
          particleTint.copy(u<.35?hot:base).lerp(u<.35?base:cool,u<.35?u/.35:(u-.35)/.65);
          color.setXYZ(i,particleTint.r,particleTint.g,particleTint.b);
          glowSize.setX(i,(13+i%6*6)*(1-u*.5));
          glowAlpha.setX(i,envelope*(.35+i%5*.13));
        }
        dustGeometry.setDrawRange(0,count);
        for(const attribute of [position,color,glowSize,glowAlpha])attribute.needsUpdate=count>0;
        for(const [i,piece] of fragments.entries()){
          const u=(age*(.9+i%4*.25)+i*.754)%1,a=i*2.399+u*4.4;
          const r=(.12+u*.59)*width,scale=(.025+i%3*.012)*Math.sin(u*Math.PI);
          piece.position.set(Math.cos(a)*r,Math.sin(a)*r,-u*length);
          piece.rotation.set(a+age*3,a*.82,u*6);
          piece.scale.set(scale,scale,scale*(chips?2.4:1));
          piece.visible=i<(level>1&&!gentle?fragments.length:level?5:0);
        }
        if(blocked&&emission>.095){
          emit(element,origin.clone().addScaledVector(direction,length),5,1.8);
          emission=0;
        }
      }
      container.add(group);
      return {move,hide(){group.visible=reflection.visible=false},close(){
        container.remove(group);root.remove(reflection);
        for(const stream of streams)stream.material.dispose();
        reflection.material.dispose();dustGeometry.dispose();dustMaterial.dispose();fragmentMaterial.dispose();
      }};
    }

    function dragonCharge(style){
      const group=new THREE.Group(),motes=[];
      const aura=new THREE.SpriteMaterial({map:glowMap,color:style.light,opacity:0,transparent:true,
        blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
      const glow=new THREE.Sprite(aura);
      const light=new THREE.MeshBasicMaterial({color:style.trim,toneMapped:false});
      const core=new THREE.Mesh(shotGeometry.ember,light);
      group.add(glow,core);
      for(let i=0;i<16;i++){
        const mote=new THREE.Mesh(shotGeometry.shard,light);
        motes.push(mote);group.add(mote);
      }
      root.add(group);
      return {
        move(start,direction,t){
          const energy=t*t,pulse=reduced()?1:.89+.11*Math.sin(t*25);
          group.position.copy(start).addScaledVector(direction,.22);
          group.quaternion.setFromUnitVectors(forward,direction);
          core.scale.setScalar(.035+.19*energy*pulse);
          core.rotation.set(4*t,7*t,0);
          glow.scale.setScalar(.47+energy*.99);
          aura.opacity=(.16+energy*.83)*pulse;
          for(const [i,m] of motes.entries()){
            const drift=(t*(1.69+i%3*.43)+i*.187)%1;
            const a=i*2.399+(reduced()?0:t*8);
            const radius=(.14+(1-drift)*.83)*(1-energy*.44);
            m.position.set(Math.cos(a)*radius,Math.sin(a)*radius,-radius*(.45+i%3*.43));
            m.rotation.set(drift*4,t*7,a);m.scale.setScalar((.024+(i%3)*.012)*Math.sin(drift*Math.PI));
            m.visible=i<(quality()>1?16:quality()?8:0);
          }
        },
        close(){root.remove(group);light.dispose();aura.dispose()}
      };
    }

    function ring(kind,point,normal,size,life,offset=0){
      if(!quality())return;
      const tint=palette[kind]||palette.hit;
      const mat=new THREE.MeshBasicMaterial({color:tint,transparent:true,opacity:.65,depthWrite:false,
        blending:THREE.AdditiveBlending,toneMapped:false});
      const mesh=new THREE.Mesh(ringGeometry,mat);
      mesh.position.copy(point);
      mesh.position.y+=offset;
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal.clone().normalize());
      mesh.scale.setScalar(.045);
      root.add(mesh);
      bursts.push({mesh,remaining:life,life,size});
    }

    function emit(kind,point,count=14,force=2.1){
      if(!quality())return;
      const scale=quality()===1||reduced() ? .5 : 1;
      const tint=new THREE.Color(palette[kind]||palette.hit);
      for(let i=0;i<Math.ceil(count*scale)&&particles.length<particleLimit;i++){
        const velocity=new THREE.Vector3(Math.random()-.5,Math.random()*.74-.12,Math.random()-.5);
        velocity.normalize().multiplyScalar(force*(.25+Math.random()*.75));
        const life=.22+Math.random()*.42;
        particles.push({p:point.clone(),v:velocity,tint,life,left:life});
      }
    }

    function impact(kind,point,normal){
      const up=normal?.lengthSq()>.01?normal.clone().normalize():new THREE.Vector3(0,1,0);
      ring(kind,point,up,kind==="wind"?.85:kind==="enemy"?.62:.34,.34);
      emit(kind,point,kind==="wind"?22:12,kind==="wind"?2.8:1.6);
    }

    function dragonBurst(element,point,direction,impact){
      ring(element,point,direction,impact?1.12:.78,impact?.48:.26);
      if(element==="time"||element==="ice")ring(element,point,direction,impact?.66:.43,impact?.63:.35);
      emit(element,point,impact?24:13,impact?3.3:1.8);
    }

    function dragonShield(element,point,outward){
      if(!quality())return;
      ring("hit",point,outward,.47,.24);
      const tangent=new THREE.Vector3(0,1,0).cross(outward).normalize();
      if(tangent.lengthSq()<.1)tangent.set(1,0,0);
      const up=new THREE.Vector3().crossVectors(outward,tangent);
      const warm=new THREE.Color(0xffdea0),elemental=new THREE.Color(palette[element]??0x9eecca);
      const count=quality()>1&&!reduced()?24:12;
      for(let i=0;i<count&&particles.length<particleLimit;i++){
        const a=i*2.399+Math.random()*.24,force=1.25+Math.random()*2.25,life=.16+Math.random()*.30;
        const v=tangent.clone().multiplyScalar(Math.sin(a)*force).addScaledVector(up,Math.cos(a)*force)
          .addScaledVector(outward,.26+Math.random()*.95);
        const p=point.clone().addScaledVector(v,.032);
        particles.push({p,v,tint:i%4===0?elemental:warm,life,left:life});
      }
    }
    function gazeRay(color,parent=root){
      const group=new THREE.Group();
      group.name="Olhar petrificante";group.visible=false;parent.add(group);
      const beams=[color,0xe3ffff].map((hex,index)=>{
        const mat=new THREE.ShaderMaterial({
          uniforms:{color:{value:new THREE.Color(hex)},strength:{value:0},clock:{value:0}},
          vertexShader:`varying vec2 facet;void main(){facet=uv;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
          fragmentShader:`uniform vec3 color;uniform float strength,clock;varying vec2 facet;
            void main(){
              float ray=pow(.5+.5*sin(facet.x*18.8496-facet.y*19.+clock*26.),4.);
              float tails=smoothstep(0.,.075,facet.y)*(1.-smoothstep(.94,1.,facet.y));
              gl_FragColor=vec4(mix(color,vec3(1.),ray*.28),strength*(.22+.78*ray)*tails);
            }`,
          transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending
        });
        const mesh=new THREE.Mesh(breathGeometry,mat);
        mesh.frustumCulled=false;mesh.renderOrder=4+index;group.add(mesh);
        return mesh;
      });
      const delta=new THREE.Vector3();
      function set(origin,point,reflection,alpha,time){
        group.visible=alpha>.01;beams[1].visible=!!reflection;
        for(let i=0;i<(reflection?2:1);i++){
          const mesh=beams[i],start=i?point:origin,end=i?reflection:point;
          delta.subVectors(end,start);
          const length=delta.length(),width=i?.092:.158;
          mesh.position.copy(start);
          if(length>.0001)mesh.quaternion.setFromUnitVectors(forward,delta.multiplyScalar(1/length));
          mesh.scale.set(width,width,Math.max(.001,length));
          mesh.material.uniforms.strength.value=alpha*(i?.94:1);
          mesh.material.uniforms.clock.value=time*(i?-1:1);
        }
      }
      return {set,hide(){group.visible=false},close(){
        parent.remove(group);for(const mesh of beams)mesh.material.dispose();
      }};
    }
    function petrifyingGaze(origin,point,color,reflection){
      const ray=gazeRay(color),alpha=reduced()?.47:.96;
      ray.set(origin,point,reflection,alpha,0);
      gazes.push({ray,origin,point,reflection,alpha,age:0});
      if(!reflection)impact("stone",point,origin.clone().sub(point));
    }

    function cast(point,direction,wide=false){
      if(wide){
        for(let i=0;i<3;i++)ring("cyclone",point,new THREE.Vector3(0,1,0),4.5+i*.65,.61+i*.13,.05+i*.32);
        emit("cyclone",point,42,4.25);
      }else{
        ring("cast",point,direction,.57,.32);
        ring("wind",point,direction,.33,.24);
        emit("wind",point,16,1.35);
      }
    }

    function splash(point,kind){
      ring(kind,point,new THREE.Vector3(0,1,0),kind==="catch"?.95:.55,.5);
      emit(kind,point,kind==="catch"?24:10,kind==="catch"?2.8:1.1);
    }

    function trail(kind){
      if(!quality())return null;
      const n=kind==="arrow"||kind==="guard"?9:15;
      const floats=new Float32Array(n*3),colors=new Float32Array(n*3);
      const tint=new THREE.Color(palette[kind]||palette.wind);
      for(let i=0;i<n;i++)tint.clone().multiplyScalar((1-i/n)**1.4).toArray(colors,i*3);
      const g=new THREE.BufferGeometry();
      g.setAttribute("position",new THREE.BufferAttribute(floats,3).setUsage(THREE.DynamicDrawUsage));
      g.setAttribute("color",new THREE.BufferAttribute(colors,3));
      g.setDrawRange(0,0);
      const m=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.75,depthWrite:false,
        toneMapped:false,blending:THREE.AdditiveBlending});
      const line=new THREE.Line(g,m);
      line.frustumCulled=false;
      root.add(line);
      let count=0;
      return {
        move(point){
          floats.copyWithin(3,0,(n-1)*3);
          point.toArray(floats,0);
          count=Math.min(count+1,n);
          g.setDrawRange(0,count);
          g.attributes.position.needsUpdate=true;
        },
        close(){root.remove(line);g.dispose();m.dispose()}
      };
    }

    function update(dt){
      for(let i=gazes.length-1;i>=0;i--){
        const effect=gazes[i];effect.age+=dt;
        if(effect.age>=.42){effect.ray.close();gazes.splice(i,1);continue;}
        effect.ray.set(effect.origin,effect.point,effect.reflection,effect.alpha*(1-effect.age/.42)**1.5,effect.age);
      }
      for(let i=bursts.length-1;i>=0;i--){
        const effect=bursts[i];
        effect.remaining-=dt;
        if(effect.remaining<=0){
          root.remove(effect.mesh);
          effect.mesh.material.dispose();
          bursts.splice(i,1);
          continue;
        }
        const age=1-effect.remaining/effect.life;
        effect.mesh.scale.setScalar(.05+Math.sqrt(age)*effect.size);
        effect.mesh.material.opacity=(1-age)**1.3*(reduced()?.37:.74);
      }
      for(let i=particles.length-1;i>=0;i--){
        const point=particles[i];
        point.left-=dt;
        if(point.left<=0){particles.splice(i,1);continue}
        point.p.addScaledVector(point.v,dt);
        point.v.y-=dt*2.35;
      }
      particles.forEach((point,i)=>{
        point.p.toArray(positions,i*3);
        const alpha=point.left/point.life;
        colors[i*3]=point.tint.r*alpha;
        colors[i*3+1]=point.tint.g*alpha;
        colors[i*3+2]=point.tint.b*alpha;
      });
      geometry.setDrawRange(0,particles.length);
      geometry.attributes.position.needsUpdate=true;
      geometry.attributes.color.needsUpdate=true;
    }

    function work(kind,point,complete=false){
      emit(kind,point,complete?22:kind==="forge"?11:6,kind==="forge"?2.2:.93);
      if(complete)ring(kind,point,new THREE.Vector3(0,1,0),.58,.48);
    }

    return {trail,cast,impact,splash,emit,work,update,dragonShot,dragonBurst,dragonStream,dragonCharge,dragonShield,gazeRay,petrifyingGaze};
  }

  return {create};
})();
