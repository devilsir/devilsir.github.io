"use strict";

globalThis.QuimiCraftDivineModels={
  create(THREE,part,jointLeg,jointArm){
    const gem=new THREE.OctahedronGeometry(1);
    const shard=new THREE.IcosahedronGeometry(1);
    const spike=new THREE.ConeGeometry(.5,1,5);
    const drum=new THREE.CylinderGeometry(1,1,1,10);
    const ring=new THREE.TorusGeometry(1,.042,5,32);
    const haloPlane=new THREE.PlaneGeometry(1,1);
    const mats=new Map();
    const sides=[-1,1];
    const tau=Math.PI*2;

    function material(color,finish="matte"){
      const key=`${color}:${finish}`;
      if(!mats.has(key)){
        const emissive=finish==="glow";
        mats.set(key,new THREE.MeshStandardMaterial({color,flatShading:true,
          metalness:finish==="metal"?.52:.08,roughness:finish==="metal"?.37:.82,
          emissive:emissive?color:0,emissiveIntensity:emissive?.95:0}));
      }
      return mats.get(key);
    }
    const shadow=material(0x211e2a);
    const bone=material(0xf1d3a6);

    function pivot(parent,x,y,z){
      const group=new THREE.Group();group.position.set(x,y,z);parent.add(group);return group;
    }
    function shape(parent,geometry,mat,xyz,dimensions,rotation=[0,0,0]){
      const mesh=new THREE.Mesh(geometry,mat);
      mesh.position.set(...xyz);mesh.scale.set(...dimensions);mesh.rotation.set(...rotation);
      parent.add(mesh);return mesh;
    }
    function strut(parent,mat,from,to,width,depth=width){
      const start=new THREE.Vector3(...from),end=new THREE.Vector3(...to),direction=end.clone().sub(start);
      const center=start.addScaledVector(direction,.5);
      const segment=part(parent,mat,center.toArray(),[width,direction.length(),depth]);
      segment.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
      return segment;
    }
    function luminous(parent,mat,alloy,xyz,size){
      shape(parent,gem,alloy,xyz,[size,size*1.25,size*.56]);
      return shape(parent,gem,mat,[xyz[0],xyz[1],xyz[2]+size*.44],[size*.62,size*.86,size*.44]);
    }
    const wing=(group,side,amp,base,speed)=>({pivot:group,side,amp,base,speed});
    function orbit(parent,rig,y,z,radius,mat,glow,count,speed){
      const wheel=pivot(parent,0,y,z);
      shape(wheel,ring,mat,[0,0,0],[radius,radius,radius*.60]);
      for(let i=0;i<count;i++){
        const a=i*tau/count;
        shape(wheel,gem,i%2?mat:glow,[Math.cos(a)*radius,Math.sin(a)*radius,0],
          [radius*.10,radius*.16,radius*.09],[0,0,a-Math.PI/2]);
      }
      rig.factionAnim.spinners.push({mesh:wheel,axis:"z",speed});
    }

    const mysteries={
      ember:{light:0xff471d,white:0xffe6a1,shape:0,eye:[.51,.23,.99,.59,.19,.17],crown:[9.4,-1.75,3.7],radius:4.15,flow:1.5},
      lantern:{light:0xffcd60,white:0xfff9db,shape:1,eye:[.34,.19,1.01,.47,.18,0],crown:[9.6,-2.12,3.65],radius:4.55,flow:.60},
      drum:{light:0xff9149,white:0xffeb9d,shape:2,eye:[.48,.10,1.17,.54,.21,0],crown:[7.35,-2.5,4.1],radius:4.8,flow:-.62},
      antler:{light:0x92ec69,white:0xecffd2,shape:3,eye:[.54,.35,1.17,.34,.24,0],crown:[8.7,-2.04,3.2],radius:4.25,flow:.8},
      wing:{light:0x6ad6ff,white:0xe5fbff,shape:4,eye:[.49,.12,1.01,.42,.20,.32],crown:[9.25,-1.72,3.44],radius:5.45,flow:1.25}
    };
    const paintGlow=(color,light)=>new THREE.ShaderMaterial({
      uniforms:{tint:{value:new THREE.Color(color)},intensity:{value:light}},
      vertexShader:`varying vec2 coord;
        void main(){coord=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform vec3 tint; uniform float intensity; varying vec2 coord;
        void main(){vec2 p=coord*2.-1.;float d=dot(p,p);
          gl_FragColor=vec4(tint,exp(-d*3.8)*(1.-smoothstep(.55,1.,d))*intensity);}`,
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false
    });
    function eyesOfGod(rig,spec){
      const [x,y,z,w,h,angle]=spec.eye;
      const glow=paintGlow(spec.light,.7);
      const socket=material(0x100f18),hot=material(spec.light,"glow");
      const pupil=new THREE.MeshBasicMaterial({color:spec.white,toneMapped:false});
      for(const side of sides){
        const eye=pivot(rig.head,x*side,y,z);eye.rotation.z=side*angle;
        part(eye,socket,[0,0,-.025],[w*1.31,h*1.7,.13]);
        part(eye,hot,[0,0,.047],[w,h,.087]);
        const core=part(eye,pupil,[0,0,.097],[w*.79,h*.48,.03]);
        const sheen=shape(eye,haloPlane,glow,[0,0,.127],[w*2.75,h*5.0,1]);
        core.userData.noShadow=sheen.userData.noShadow=true;
        if(side===1)core.userData.ownMaterial=sheen.userData.ownMaterial=true;
      }
      return glow;
    }
    function glyphs(parent,count,radius,ink,shapeId){
      for(let i=0;i<count;i++){
        const a=i*tau/count,sign=i%2?1:-1;
        const rune=pivot(parent,Math.cos(a)*radius,Math.sin(a)*radius,0);
        rune.rotation.z=a-Math.PI/2;
        const edges=[[[0,-.22,0],[0,.24,0]],[[0,.16,0],[.16,.01,0]],[[0,-.02,0],[-.14,-.16,0]]];
        if((i+shapeId)%3===0)edges.push([[-.15,.1,0],[.15,.1,0]]);
        for(const [from,to] of edges)strut(rune,ink,from,[to[0]*sign,to[1],0],.046);
      }
    }
    const sigils=[
      [[-.85,.68],[0,-.58],[.85,.68],[.34,.28],[0,.9],[-.34,.28],[-.85,.68]],
      [[0,1],[.22,.24],[.92,0],[.22,-.24],[0,-1],[-.22,-.24],[-.92,0],[-.22,.24],[0,1]],
      [[-.9,.63],[.9,.63],[.52,-.54],[0,-.84],[-.52,-.54],[-.9,.63]],
      [[-1,.63],[-.48,.45],[0,-.55],[.48,.45],[1,.63],[.71,.13],[.48,.45]],
      [[-1,.42],[-.56,.64],[.2,.3],[.85,.38],[.58,.02],[-.28,-.25],[.07,-.54],[.72,-.48]]
    ];
    function divineMysteries(g,rig,data){
      const spec=mysteries[data.aspect],ink=material(spec.light,"glow");
      const eyeGlow=eyesOfGod(rig,spec);
      const [y,z,span]=spec.crown;
      const crown=pivot(g,0,y,z);
      shape(crown,ring,ink,[0,0,0],[span,span,span*.41]);
      glyphs(crown,8,span*.84,ink,spec.shape);
      const seal=pivot(g,0,.17,0),plane=pivot(seal,0,0,0);
      plane.rotation.x=-Math.PI/2;
      shape(plane,ring,ink,[0,0,0],[spec.radius*.69,spec.radius*.69,1.4]);
      glyphs(plane,10,spec.radius*.83,ink,spec.shape);
      const crest=pivot(g,0,y+span*.69,z-.09);
      const trace=sigils[spec.shape].map(([x,h])=>[x*span*.45,h*span*.29,.10]);
      for(let i=1;i<trace.length;i++)strut(crest,ink,trace[i-1],trace[i],.085,.055);
      for(let i=0;i<5;i++){
        const a=i*tau/5,r=span*.95;
        const node=pivot(crown,Math.cos(a)*r,Math.sin(a)*r,.05);
        shape(node,spec.shape===2?shard:gem,ink,[0,0,0],[.18,.38,.17],[0,0,a-Math.PI/2]);
      }
      for(const symbol of [seal,crown,crest])symbol.traverse(node=>{if(node.isMesh)node.userData.noShadow=true});

      const count=36,positions=new Float32Array(count*3),weights=new Float32Array(count);
      for(let i=0;i<count;i++)weights[i]=.42+(i*23%37)/64;
      const geometry=new THREE.BufferGeometry();
      const points=new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage);
      geometry.setAttribute("position",points);geometry.setAttribute("weight",new THREE.BufferAttribute(weights,1));
      const shimmer=new THREE.ShaderMaterial({
        uniforms:{tint:{value:new THREE.Color(spec.light)},charge:{value:0},kind:{value:spec.shape}},
        vertexShader:`attribute float weight; varying float strength; uniform float charge;
          void main(){vec4 view=modelViewMatrix*vec4(position,1.);strength=weight;
            gl_Position=projectionMatrix*view;gl_PointSize=clamp((170.+charge*62.)*weight/max(1.,-view.z),3.,23.);}`,
        fragmentShader:`uniform vec3 tint; uniform float kind; varying float strength;
          void main(){vec2 p=abs(gl_PointCoord*2.-1.); float d=length(p);
            if(kind==0.)d=length(p*vec2(1.65,.86));
            if(kind==1.)d=min(p.x*3.5+p.y,p.y*3.5+p.x);
            if(kind==2.)d=max(p.x,p.y);
            if(kind==3.)d=p.x+p.y*.73;
            if(kind==4.)d=length(p*vec2(.84,2.4));
            float alpha=(1.-smoothstep(.19,1.,d))*strength;
            gl_FragColor=vec4(mix(tint,vec3(1.),(1.-smoothstep(.03,.42,d))*.77),alpha);}`,
        transparent:true,depthWrite:false,toneMapped:false
      });
      const motes=new THREE.Points(geometry,shimmer);
      motes.frustumCulled=false;
      motes.userData.ownGeometry=motes.userData.ownMaterial=true;
      g.add(motes);
      rig.poseDivine=(time,charge,particleLevel,reducedMotion)=>{
        const t=reducedMotion?time*.25:time;
        const power=Math.max(0,Math.min(1,charge));
        eyeGlow.uniforms.intensity.value=.63+.1*Math.sin(t*2)+power*.30;
        crown.rotation.z=t*.11*spec.flow;
        crest.position.y=y+span*.69+Math.sin(t*1.4)*.19;
        seal.rotation.y=-t*.21*spec.flow;
        motes.visible=particleLevel>0;
        if(!particleLevel)return;
        const visible=particleLevel===1?count/2:count;
        geometry.setDrawRange(0,visible);
        shimmer.uniforms.charge.value=power;
        for(let i=0;i<visible;i++){
          const seed=(i*17%37)/37,angle=i*2.39996+t*spec.flow*(.38+seed*.22);
          const progress=((seed+t*(.11+spec.shape*.012))%1+1)%1;
          const radius=spec.radius*(.58+seed*.40+.15*Math.sin(progress*Math.PI))+power*.36;
          const altitude=spec.shape===2?.3+progress**2*5.4:.65+progress*(data.height-1.05);
          points.setXYZ(i,Math.cos(angle)*radius,altitude,Math.sin(angle)*radius*.66);
        }
        points.needsUpdate=true;
      };
      rig.poseDivine(0,0,2,false);
    }

    function makeFollower(g,rig,data,colors){
      const {race,role,lineage}=data;
      const [cloth,metal,glyph]=colors;
      const shell=material(lineage.colors[0]),detail=material(lineage.colors[1]),glow=material(lineage.colors[1],"glow");
      const anim=rig.factionAnim;
      const body=rig.body=pivot(g,0,0,0);
      if(race==="dravik"){
        shape(body,shard,shell,[0,.67,-.14],[.53,.42,.78]);
        for(let i=0;i<4;i++)part(body,i%2?cloth:detail,[0,.88,-.6+i*.22],[.75-i*.06,.32,.23],[.22-i*.1,0,0]);
        const head=rig.head=pivot(g,0,.78,.44);
        shape(head,gem,shell,[0,0,0],[.38,.25,.33]);
        for(const side of sides){
          for(let i=0;i<3;i++){
            jointLeg(g,rig,side*.38,-.53+i*.38,.60,.63,.12,shell,shadow,(i+(side===1?1:0))*Math.PI);
          }
          shape(head,gem,glow,[side*.19,.055,.23],[.075,.069,.07]);
          strut(head,detail,[side*.24,-.02,.16],[side*.14,-.13,.56],.09);
        }
        luminous(body,glyph,metal,[0,1.09,-.03],.15);
        return;
      }
      if(race==="velari"){
        const bell=pivot(body,0,1.37,0);
        anim.floaters.push({pivot:bell,baseY:1.37,amp:.10,speed:2.8});
        shape(bell,shard,shell,[0,.14,0],[.53,.38,.49]);
        shape(bell,drum,cloth,[0,.02,0],[.47,.20,.45]);
        shape(bell,ring,detail,[0,-.10,0],[.47,.47,.53],[Math.PI/2,0,0]);
        luminous(bell,glyph,metal,[0,.12,.43],.16);
        for(let i=0;i<6;i++){
          const angle=i*tau/6,x=Math.cos(angle)*.34,z=Math.sin(angle)*.34;
          const tendril=pivot(bell,x,-.13,z);
          anim.wings.push(wing(tendril,i%2?1:-1,.1,.18,2.5+i*.14));
          strut(tendril,shell,[0,0,0],[x*.52,-.34,z*.52],.10);
          strut(tendril,detail,[x*.52,-.34,z*.52],[x*.31,-.67,z*.31],.075);
          shape(tendril,gem,glow,[x*.31,-.68,z*.31],[.056,.12,.056]);
        }
        return;
      }

      const rocky=race==="orun",four=race==="noktil",beaked=race==="sylfari",scaled=race==="serev";
      const width=rocky?.84:.58,headY=rocky?1.55:1.64;
      shape(body,rocky?shard:gem,shell,[0,1.13,0],[width*.73,.62,.39]);
      part(body,cloth,[0,1.17,.075],[width*.82,.59,.42]);
      part(body,metal,[0,.91,.27],[width*.91,.115,.08]);
      luminous(body,glyph,metal,[0,1.36,.30],.14);
      const head=rig.head=pivot(g,0,headY,0);
      const headWidth=rocky?.32:race==="ulmar"?.31:.25;
      shape(head,race==="solvani"?gem:shard,shell,[0,.13,0],[headWidth,.32,.27]);
      if(beaked||scaled)shape(head,gem,detail,[0,.065,.30],[scaled?.21:.12,.11,.24]);
      if(four)shape(head,gem,glow,[0,.26,.24],[.06,.075,.04]);
      for(const side of sides){
        const eyeX=side*(rocky?.135:.12);
        part(head,shadow,[eyeX,.16,.205],[.11,.078,.075],[0,side*.21,side*.2]);
        shape(head,gem,glow,[eyeX,.16,.252],[.055,.039,.033]);
        const armX=width*.57+.09,thick=rocky?.31:.18;
        const arm=jointArm(g,rig,side*armX,1.43,0,cloth,shell,rocky?.82:.70,thick);
        shape(body,shard,rocky?shell:metal,[side*armX,1.39,0],[thick*1.15,.23,thick*1.03]);
        jointLeg(g,rig,side*(rocky?.25:.17),0,.79,.80,rocky?.26:.19,cloth,shell,side===1?Math.PI:0);
        if(four)jointArm(g,rig,side*(armX+.035),1.13,-.10,cloth,shell,.59,.155);
        if(race==="kharu"){
          shape(head,spike,detail,[side*.22,.43,-.035],[.20,.58,.20],[0,0,-side*.44]);
          shape(head,spike,bone,[side*.16,-.025,.24],[.083,.22,.083],[0,0,side*.40]);
          for(let i=0;i<3;i++)shape(body,gem,shell,[side*(.22+i*.08),1.37+i*.07,-.29],[.16,.26,.16],[.39,0,-side*.6]);
        }
        if(race==="ulmar")for(let i=0;i<3;i++){
          const y=.06+i*.115;
          strut(head,detail,[side*.24,y,0],[side*(.42+i*.035),y+.06,-.16-i*.035],.085,.09);
        }
        if(race==="solvani"){
          shape(head,gem,detail,[side*.21,.36,0],[.13,.29,.14],[0,0,-side*.3]);
          shape(body,gem,glow,[side*.40,1.34,-.15],[.11,.25,.12]);
        }
        if(beaked){
          const plume=pivot(body,side*.38,1.43,-.23);
          for(let i=0;i<6;i++){
            const a=.48+i*.14;
            const feather=shape(plume,gem,i%3===0?metal:detail,[side*(.13+i*.086),-.04-i*.095,-.015],[.105,.52-i*.043,.07]);
            feather.rotation.z=side*a;
          }
          anim.wings.push(wing(plume,side,.14,.11,3.1));
        }
        if(data.rank!=="general"&&side===-1&&role==="shield"){
          shape(arm.userData.lower,gem,metal,[0,-.22,.22],[.21,.32,.095]);
          luminous(arm.userData.lower,glyph,cloth,[0,-.22,.28],.13);
        }
        if(data.rank!=="general"&&side===1&&role==="blade"){
          part(arm.userData.lower,shadow,[0,-.39,.11],[.066,.24,.06]);
          shape(arm.userData.lower,gem,metal,[0,-.60,.11],[.105,.43,.06]);
        }
        if(data.rank!=="general"&&side===1&&role==="staff"){
          part(arm.userData.lower,shadow,[0,-.03,.15],[.063,.97,.063]);
          luminous(arm.userData.lower,glyph,metal,[0,.47,.15],.12);
        }
        if(data.rank!=="general"&&side===1&&role==="bow"){
          strut(arm.userData.lower,metal,[0,-.60,.21],[0,-.20,.36],.045);
          strut(arm.userData.lower,metal,[0,-.20,.36],[0,.16,.20],.045);
          strut(arm.userData.lower,bone,[0,-.60,.21],[0,.16,.20],.016);
        }
      }
      if(scaled){
        for(let i=0;i<5;i++)shape(head,spike,detail,[0,.44-i*.042,.18-i*.095],[.11,.19,.14],[-.35,0,0]);
        const tail=pivot(body,0,.86,-.24);
        let base=[0,0,0];
        for(let i=0;i<5;i++){
          const end=[Math.sin(i*.6)*.17,-.07-i*.045,-.23-i*.21];
          strut(tail,i%2?shell:detail,base,end,.22-i*.031);base=end;
        }
        anim.wings.push(wing(tail,1,.05,0,2.2));
      }
      if(race==="mireli")for(const [x,y,z,r] of [[0,.46,.02,.32],[-.26,.35,-.09,.20],[.22,.34,-.13,.16],[0,.28,-.25,.18]]){
        shape(head,shard,detail,[x,y,z],[r,r*.34,r*.90]);
        for(const side of sides)shape(head,gem,glow,[x+side*r*.53,y+.09,z+.06],[.038,.025,.028]);
      }
    }

    // Small heraldic marks share the five divine sigils, so every rank is recognizable
    // even when the lineage has a non-humanoid body plan.
    function rankSeal(parent,aspect,ink,alloy,xyz,size){
      const plaque=pivot(parent,...xyz),spec=mysteries[aspect];
      shape(plaque,gem,alloy,[0,0,0],[size*1.15,size*1.32,.035]);
      const trace=sigils[spec.shape].map(([x,y])=>[x*size*.73,y*size*.74,.047]);
      for(let i=1;i<trace.length;i++)strut(plaque,ink,trace[i-1],trace[i],size*.105,.027);
      return plaque;
    }
    // Clergy are built independently of the temple's ordinary followers. Only the
    // primitive/rig helpers and heraldic vocabulary are shared with other creatures.
    // Seven authored silhouettes per tradition: torso width, hip height, shoulders,
    // head profile, metal colour, textile colour, and a unique ceremonial implement.
    const clergyDesigns={
      brasa:[
        [.78,.87,1.56,"warhelm",0x8e4a39,0x391d24,"brokenCrown"],
        [.75,.40,1.20,"cage",0xa44b35,0x2a1720,"captiveFlame"],
        [.57,.76,1.40,"hood",0xc96a40,0x713339,"fourBraziers"],
        [.63,.79,1.45,"veil",0xb25c41,0x47222d,"brokenChains"],
        [.66,.83,1.48,"crested",0x815245,0x60242f,"lastEmber"],
        [.51,.82,1.43,"scarf",0x9e7360,0x562831,"refugePack"],
        [.70,.74,1.40,"visor",0x7a625a,0x58322d,"forgeTongs"]
      ],
      farol:[
        [.82,.86,1.56,"diadem",0xd7bd82,0x394d72,"aegis"],
        [.55,.73,1.38,"hood",0xe5c88c,0x526a8f,"fourLamps"],
        [.60,.80,1.43,"finCrown",0xb9b7a4,0x3b7192,"watchBell"],
        [.58,.84,1.48,"beakMask",0xcba66d,0x7d91a8,"refugeCanopy"],
        [.68,.76,1.46,"mitre",0xcca96a,0x425676,"vowTablet"],
        [.54,.79,1.38,"scarf",0xb9a17c,0x566d7d,"waymarkShield"],
        [.85,.73,1.42,"stoneBrow",0x9f9172,0x66717f,"shelterKit"]
      ],
      tambor:[
        [.95,.77,1.54,"stoneBrow",0xa26c41,0x443c35,"clanHammer"],
        [.68,.77,1.42,"tusks",0xab8055,0x704a2f,"firstDrum"],
        [.60,.78,1.40,"runeMask",0x936e51,0x503e55,"runeSlabs"],
        [.84,.77,1.50,"warhelm",0xb98a58,0x514035,"duelGong"],
        [.61,.86,1.44,"crested",0x947051,0x754a32,"clanStandards"],
        [.54,.86,1.44,"beakMask",0x926e53,0x745a42,"arenaGloves"],
        [.82,.43,.92,"shell",0x997751,0x3e4639,"processionDrum"]
      ],
      marco:[
        [.74,.82,1.52,"antlers",0xb5a16b,0x344c31,"rootSceptre"],
        [.55,.74,1.40,"mushroom",0x90744d,0x4d6744,"rootBasket"],
        [.59,.81,1.42,"finCrown",0x8e9f6a,0x3d6859,"springVessel"],
        [.64,.78,1.47,"veil",0x9aa774,0x526743,"livingPact"],
        [.66,.86,1.52,"diadem",0xa0bc86,0x3a5c47,"boundaryCompass"],
        [.54,.81,1.39,"crested",0x8b9d62,0x516044,"clearingBuckler"],
        [.78,.40,.91,"shell",0x8d985f,0x485c36,"seedGarden"]
      ],
      vento:[
        [.70,.88,1.55,"wingHelm",0xb4d5df,0x314d76,"skyBow"],
        [.65,.43,1.24,"cage",0xa6c6dd,0x3b6386,"breezeSails"],
        [.51,.84,1.44,"finCrown",0xb5d2dc,0x527d9a,"skyInstrument"],
        [.63,.85,1.50,"diadem",0xc1e1ea,0x496486,"balanceScales"],
        [.56,.84,1.46,"wingHelm",0xb1c6d5,0x4e6c8c,"routeScrolls"],
        [.60,.79,1.41,"runeMask",0x9bb9d1,0x3e5876,"pactCase"],
        [.56,.85,1.43,"scarf",0x9fb1bf,0x486d8b,"travellerRope"]
      ]
    };
    const clericSphere=new THREE.SphereGeometry(1,9,6);
    const clericPlate=new THREE.DodecahedronGeometry(1,0);
    const clericCone=new THREE.CylinderGeometry(.63,1,1,7);
    const clericCollar=new THREE.CylinderGeometry(1,.65,1,8);
    const clericBlade=new THREE.CylinderGeometry(0,1,1,4);
    function clergyModel(g,rig,data,palette){
      const [order,indexText]=data.clergyDesign.split(":"),index=Number(indexText);
      const [w,hip,shoulder,helmet,alloy,tint,implement]=clergyDesigns[order][index];
      const [orderCloth,,ink]=palette,metal=material(alloy,"metal"),fabric=material(tint),
        skin=material(data.lineage.colors[0]),mark=material(data.lineage.colors[1]),
        eye=material(data.lineage.colors[1],"glow"),lining=material(new THREE.Color(tint).multiplyScalar(.64).getHex());
      const {race,rank,aspect}=data,isGeneral=rank==="general",preacher=rank==="preacher",acolyte=rank==="acolyte";
      const body=rig.body=pivot(g,0,0,0),anim=rig.factionAnim;
      let head,handL,handR,accessoryParent=body;
      const jewel=(parent,xyz,s=.09)=>luminous(parent,ink,metal,xyz,s);
      const edge=(parent,a,b,width=.045)=>strut(parent,metal,a,b,width);
      const band=(parent,y,r=.28)=>shape(parent,ring,metal,[0,y,0],[r,r,r*.72],[Math.PI/2,0,0]);
      const rod=(parent,a,b,width=.065)=>strut(parent,lining,a,b,width);
      const pole=(parent,top=.56,bottom=-.57)=>{rod(parent,[0,bottom,.17],[0,top,.17],.07);for(let y=bottom+.15;y<top;y+=.28)part(parent,metal,[0,y,.17],[.095,.055,.095]);};
      const plate=(parent,xyz,sz,mat=metal,rot=[0,0,0])=>shape(parent,clericPlate,mat,xyz,sz,rot);
      const flare=(parent,xyz,sz,mat=fabric)=>shape(parent,clericCone,mat,xyz,sz);
      const lantern=(parent,x,y,z,s=.16)=>{
        part(parent,metal,[x,y-s,z],[s*1.55,s*.25,s*1.55]);part(parent,metal,[x,y+s,z],[s*1.55,s*.25,s*1.55]);
        shape(parent,clericSphere,ink,[x,y,z],[s*.51,s*.79,s*.51]);
        for(const dx of sides)for(const dz of sides)edge(parent,[x+dx*s*.62,y-s,z+dz*s*.62],[x+dx*s*.62,y+s,z+dz*s*.62],s*.17);
      };
      const book=(parent,x,y,z,open=false)=>{
        const b=pivot(parent,x,y,z);b.rotation.x=-.18;
        if(open){for(const side of sides){part(b,metal,[side*.13,0,0],[.25,.31,.06],[0,0,side*.12]);part(b,bone,[side*.13,0,.043],[.22,.27,.028],[0,0,side*.12]);for(let j=0;j<4;j++)part(b,lining,[side*.13,.08-j*.045,.062],[.16,.012,.01]);}}
        else{part(b,lining,[0,0,0],[.25,.34,.11]);part(b,metal,[-.12,0,0],[.04,.35,.125]);rankSeal(b,aspect,ink,metal,[0,0,.068],.08);}
        return b;
      };
      const shield=(parent,style="kite",s=1)=>{
        const x=0,y=-.25,z=.24;
        shape(parent,style==="round"?drum:clericPlate,metal,[x,y,z],style==="round"?[.28*s,.10,.28*s]:[.29*s,.43*s,.09],[style==="round"?Math.PI/2:0,0,0]);
        shape(parent,style==="round"?drum:clericPlate,fabric,[x,y,z+.075],style==="round"?[.23*s,.06,.23*s]:[.235*s,.35*s,.055],[style==="round"?Math.PI/2:0,0,0]);
        rankSeal(parent,aspect,ink,metal,[x,y,z+.135],.15*s);
      };
      if(race==="velari"){
        // Two independently sculpted floating initiates: Návar's captive-fire censer
        // and Vaélis's bell with a sail assembly. Neither uses the normal Velari bell.
        const float=pivot(body,0,1.18,0);accessoryParent=float;rig.head=head=pivot(float,0,.12,0);
        anim.floaters.push({pivot:float,baseY:1.18,amp:.10,speed:2.25});
        if(implement==="captiveFlame"){
          flare(float,[0,.02,0],[.43,.35,.43],lining);plate(float,[0,.33,0],[.33,.24,.33],skin);
          shape(float,clericSphere,ink,[0,-.22,0],[.23,.25,.23]);
          for(let i=0;i<5;i++){const a=i*tau/5,x=Math.cos(a),z=Math.sin(a);edge(float,[x*.31,.16,z*.31],[x*.42,-.22,z*.42],.05);edge(float,[x*.42,-.22,z*.42],[x*.20,-.48,z*.20],.042);}
        }else{
          shape(float,clericSphere,skin,[0,.02,0],[.42,.27,.35]);shape(float,clericCollar,fabric,[0,-.21,0],[.37,.27,.37]);
          for(const side of sides){const fin=pivot(float,side*.25,.05,0);plate(fin,[side*.26,.04,-.04],[.35,.055,.25],metal,[0,0,side*.23]);plate(fin,[side*.43,.10,-.08],[.22,.038,.17],ink);anim.wings.push(wing(fin,side,.16,.12,2.5));}
          band(float,.22,.30);
        }
        for(let i=0;i<(implement==="captiveFlame"?5:7);i++){
          const a=i*tau/(implement==="captiveFlame"?5:7),x=Math.cos(a),z=Math.sin(a),t=pivot(float,x*.26,-.34,z*.26);
          rod(t,[0,0,0],[x*.14,-.22,z*.14],.08);edge(t,[x*.14,-.22,z*.14],[x*.10,-.45-(i%2)*.09,z*.10],.044);
          plate(t,[x*.10,-.48-(i%2)*.09,z*.10],[.055,.10,.055],eye);
          anim.wings.push(wing(t,i%2?1:-1,.09,.11,2+i*.12));
        }
        rankSeal(float,aspect,ink,metal,[0,.13,.38],.13);
      }else if(race==="dravik"){
        // Two original six-legged silhouettes, carrying different devotional loads.
        const garden=implement==="seedGarden";
        plate(body,[0,.66,-.10],[w*.64,.36,garden?.65:.75],skin);
        flare(body,[0,.87,-.08],[w*.56,.19,.53],fabric);
        for(let i=0;i<4;i++)plate(body,[0,.88,-.56+i*.25],[w*.46,.20,.20],i%2?metal:mark,[.12,0,0]);
        rig.head=head=pivot(body,0,.72,.49);plate(head,[0,.03,0],[.29,.22,.28],skin);
        for(const side of sides){
          for(let i=0;i<3;i++){
            const leg=jointLeg(g,rig,side*(w*.43+i*.04),-.51+i*.36,.57,.57,.13,skin,metal,(i+(side>0?1:0))*Math.PI);
            plate(leg,[0,-.04,0],[.13,.12,.11],mark);
          }
          plate(head,[side*.15,.05,.21],[.058,.052,.04],eye);edge(head,[side*.23,-.08,.13],[side*.13,-.17,.39],.07);
        }
        rankSeal(head,aspect,ink,metal,[0,.13,.21],.10);
      }else{
        // A new articulated anatomical rig rather than a follower with rank accessories.
        const long=isGeneral?.62:preacher?.57:acolyte?.51:.40;
        const upper=shoulder-.14,torso=(hip+upper)*.5,armX=w*.55+.055;
        flare(body,[0,hip-.04,0],[w*.49,.32,.29],lining);
        shape(body,clericCollar,fabric,[0,torso,0],[w*.62,upper-hip+.20,.34]);
        plate(body,[0,upper-.10,.15],[w*.40,.29,.19],isGeneral?metal:orderCloth);
        if(isGeneral){for(let k=0;k<3;k++)part(body,k===1?ink:metal,[0,hip+.04+k*.135,.30],[w*(.72-k*.065),.09,.073]);}
        else{for(const side of sides)edge(body,[side*w*.42,upper+.025,.27],[side*w*.20,hip-.04,.29],.046);}
        part(body,metal,[0,hip,.22],[w*.87,.085,.20]);jewel(body,[0,hip,.35],.075);
        const hem=rig.factionHem=pivot(body,0,hip-.02,0);
        for(const side of sides){
          // Each rank has its own cut: split armoured coat, preaching stole, novice skirt or work tunic.
          const len=isGeneral?long:preacher?long*.97:acolyte?long*.80:long*.58;
          const px=side*w*(isGeneral?.29:preacher?.33:acolyte?.24:.27);
          part(hem,isGeneral?lining:fabric,[px,-len*.45,-.19],[w*.51,len,.12],[.16,0,side*(isGeneral?.12:acolyte?.06:.025)]);
          if(isGeneral||preacher||acolyte){part(hem,metal,[px,-len*.88,-.15],[w*.43,.045,.055]);}
          const arm=jointArm(g,rig,side*armX,shoulder,0,isGeneral?metal:fabric,skin,isGeneral?.77:.66,isGeneral?.22:race==="orun"?.25:.17);
          if(side<0)handL=arm.userData.lower;else handR=arm.userData.lower;
          plate(arm,[0,-.07,0],[isGeneral?.23:.15,isGeneral?.20:.11,.17],isGeneral?metal:fabric,[0,0,-side*.16]);
          part(arm.userData.lower,metal,[0,-.15,.055],[isGeneral?.19:.13,.19,.14]);
          const leg=jointLeg(g,rig,side*w*.25,0,hip,hip+.03,race==="orun"?.27:.17,lining,metal,side>0?Math.PI:0);
          plate(leg.userData.lower,[0,-.16,.07],[race==="orun"?.18:.12,.16,.095],isGeneral?metal:fabric);
          if(race==="noktil"){
            const extra=jointArm(g,rig,side*(armX+.025),shoulder-.31,-.14,fabric,skin,.54,.13);
            plate(extra.userData.lower,[0,-.18,.06],[.10,.13,.085],metal);
          }
        }
        rankSeal(body,aspect,ink,metal,[0,upper-.07,.355],isGeneral?.15:.12);
        head=rig.head=pivot(g,0,shoulder+.17,0);
        const hw=race==="orun"?.29:race==="ulmar"?.26:.22;
        plate(head,[0,.11,0],[hw,.28,.24],skin);
        for(const side of sides){part(head,lining,[side*hw*.45,.14,.218],[.105,.058,.052]);shape(head,clericSphere,eye,[side*hw*.45,.14,.25],[.038,.024,.024]);}
        if(race==="noktil")jewel(head,[0,.26,.225],.06);
        if(race==="kharu")for(const side of sides){shape(head,clericBlade,mark,[side*.21,.30,-.03],[.10,.34,.10],[0,0,-side*.45]);shape(head,spike,bone,[side*.13,-.08,.18],[.10,.18,.09],[0,0,side*.3]);}
        if(race==="ulmar")for(const side of sides)for(let j=0;j<3;j++)edge(head,[side*hw,.02+j*.09,-.02],[side*(.33+j*.02),.07+j*.11,-.13],.042);
        if(race==="serev"||race==="sylfari")plate(head,[0,.02,.25],[race==="serev"?.17:.10,.10,.19],mark);
        if(race==="serev"){
          const tail=pivot(body,0,hip-.04,-.26);let last=[0,0,0];for(let i=0;i<5;i++){const next=[Math.sin(i*.55)*.10,-.05-i*.065,-.16-i*.15];strut(tail,i%2?mark:skin,last,next,.17-i*.023);last=next;}anim.wings.push(wing(tail,1,.085,0,2.5));
        }
        if(race==="mireli")for(let j=0;j<4;j++){const x=(j-1.5)*.135;flare(head,[x,.34+Math.sin(j)*.055,-.05],[.12,.085,.13],mark);}
        if(race==="solvani")for(const side of sides)plate(head,[side*.19,.25,-.06],[.10,.22,.10],mark,[0,0,-side*.22]);
        if(race==="sylfari")for(const side of sides){const feather=pivot(body,side*w*.42,shoulder-.06,-.29);for(let j=0;j<4;j++)plate(feather,[side*(.13+j*.10),-.08-j*.10,-.03],[.095,.32-j*.027,.052],j%2?mark:metal,[0,0,side*(.32+j*.14)]);anim.wings.push(wing(feather,side,.12,.08,2.4));}
        switch(helmet){
          case "warhelm":case "visor":case "runeMask":
            plate(head,[0,.19,-.025],[hw*1.19,.27,.27],metal);part(head,lining,[0,.13,.242],[hw*1.73,.075,.048]);
            for(const side of sides){part(head,ink,[side*.082,.138,.274],[.086,.025,.018]);edge(head,[side*hw,.20,.20],[side*hw*.78,-.07,.24],.045);}
            if(helmet==="warhelm")for(const side of sides)shape(head,spike,metal,[side*.24,.38,-.04],[.12,.36,.12],[0,0,-side*.35]);
            if(helmet==="runeMask")rankSeal(head,aspect,ink,metal,[0,.27,.26],.065);
            break;
          case "hood":case "veil":case "mitre":
            flare(head,[0,.31,-.04],[hw*1.4,helmet==="mitre"?.30:.19,.26],fabric);
            for(const side of sides){part(head,lining,[side*hw*1.05,.10,-.05],[.09,.38,.29],[0,0,side*.13]);edge(head,[side*hw,.33,.17],[side*hw*1.1,-.05,.17],.035);}
            if(helmet==="veil")part(head,bone,[0,-.005,.25],[hw*1.58,.11,.025]);
            if(helmet==="mitre")jewel(head,[0,.42,.22],.065);
            break;
          case "antlers":
            for(const side of sides){edge(head,[side*.13,.25,0],[side*.27,.47,-.06],.075);edge(head,[side*.27,.47,-.06],[side*.32,.64,-.04],.05);edge(head,[side*.27,.47,-.06],[side*.43,.52,.02],.046);plate(head,[side*.35,.60,-.03],[.06,.10,.055],ink);}
            break;
          case "mushroom":
            flare(head,[0,.40,-.03],[.37,.13,.31],mark);for(let j=0;j<5;j++)plate(head,[Math.cos(j*tau/5)*.22,.46,Math.sin(j*tau/5)*.19],[.046,.025,.046],ink);break;
          case "diadem":case "finCrown":case "wingHelm":
            part(head,metal,[0,.29,.07],[hw*2.1,.058,.35]);jewel(head,[0,.34,.25],.078);
            for(const side of sides){plate(head,[side*.20,.36,-.02],[.08,.19,.10],metal,[0,0,-side*.32]);if(helmet==="wingHelm")for(let j=0;j<3;j++)plate(head,[side*(.22+j*.065),.30+j*.085,-.12],[.065,.18,.052],j%2?ink:metal,[0,0,-side*.47]);}
            break;
          case "scarf":part(head,fabric,[0,-.065,.04],[hw*2.0,.105,.37]);part(body,fabric,[-.15,upper-.23,-.35],[.15,.56,.075],[.14,0,-.14]);break;
          case "crested":case "tusks":case "beakMask":case "stoneBrow":
            for(const side of sides){plate(head,[side*hw*.62,.26,.12],[.14,.095,.14],metal);if(helmet==="tusks")shape(head,spike,bone,[side*.20,.36,.02],[.085,.29,.085],[0,0,-side*.42]);}
            if(helmet==="crested")for(let j=0;j<4;j++)plate(head,[0,.37-j*.035,.11-j*.075],[.10,.14,.08],j%2?ink:mark,[.17,0,0]);
            if(helmet==="beakMask")plate(head,[0,.045,.24],[.13,.12,.14],metal);
            break;
        }
      }
      const R=handR||accessoryParent,L=handL||accessoryParent;
      // A different piece of equipment and silhouette for every named resident.
      switch(implement){
        case "brokenCrown": {
          pole(R,.08,-.39);part(R,metal,[0,-.38,.17],[.39,.10,.12]);
          plate(R,[0,-.72,.17],[.15,.39,.072],metal);plate(R,[0,-.71,.24],[.055,.29,.025],ink);
          for(const side of sides){shape(R,spike,metal,[side*.17,-.43,.17],[.09,.21,.10],[0,0,-side*.50]);for(let j=0;j<3;j++)shape(body,ring,metal,[side*(.13+j*.08),1.10+j*.07,.35],[.055,.071,.05],[0,0,side*.5]);}break;
        }
        case "captiveFlame": lantern(accessoryParent,0,.47,0,.17);shape(accessoryParent,spike,ink,[0,.66,0],[.10,.20,.10]);break;
        case "fourBraziers": {
          for(const arm of rig.arms){const h=arm.userData.lower;shape(h,drum,metal,[0,-.30,.13],[.12,.095,.12]);shape(h,gem,ink,[0,-.19,.13],[.066,.12,.066]);}break;
        }
        case "brokenChains": {
          pole(R,.57,-.58);for(let j=0;j<5;j++)shape(R,ring,metal,[.14*Math.sin(j*.42),.55-j*.09,.19],[.074,.075,.07],[0,j%2*Math.PI/2,0]);book(L,0,-.18,.20,true);break;
        }
        case "lastEmber": pole(R,.58,-.62);lantern(R,0,.68,.17,.14);shape(R,spike,ink,[0,.88,.17],[.075,.15,.075]);for(let j=0;j<3;j++)part(body,metal,[.19,hip-.06-j*.075,.29],[.19,.044,.04]);break;
        case "refugePack": {
          part(body,lining,[0,1.08,-.35],[.36,.46,.28]);for(let j=0;j<3;j++)part(body,metal,[0,1.22-j*.13,-.51],[.35,.04,.04]);part(R,metal,[0,-.51,.13],[.075,.42,.065]);plate(R,[0,-.68,.13],[.09,.22,.055],metal);break;
        }
        case "forgeTongs": {
          shield(L,"round",.70);for(const side of sides){edge(R,[side*.03,-.16,.13],[side*.105,-.65,.13],.055);edge(R,[side*.105,-.65,.13],[side*.045,-.78,.13],.046);}break;
        }
        case "aegis": {
          shield(L,"kite",1.12);pole(R,.04,-.65);plate(R,[0,-.65,.17],[.12,.35,.072],bone);jewel(R,[0,-.42,.23],.08);for(const side of sides)plate(body,[side*.36,1.53,-.24],[.18,.22,.11],metal);break;
        }
        case "fourLamps":for(const arm of rig.arms)lantern(arm.userData.lower,0,-.30,.15,.10);break;
        case "watchBell":pole(R,.48,-.63);flare(R,[0,.58,.17],[.18,.27,.18],metal);jewel(R,[0,.43,.17],.055);break;
        case "refugeCanopy":pole(R,.61,-.64);flare(R,[0,.76,.17],[.36,.12,.31],bone);for(const side of sides)lantern(R,side*.23,.61,.17,.07);book(L,0,-.24,.19,true);break;
        case "vowTablet":pole(R,.55,-.62);part(R,metal,[0,.48,.20],[.29,.36,.075]);for(let j=0;j<4;j++)part(R,bone,[0,.59-j*.06,.249],[.20,.018,.015]);book(L,0,-.19,.17);break;
        case "waymarkShield":shield(L,"kite",.73);edge(R,[0,-.16,.13],[0,-.63,.13],.06);part(R,bone,[0,-.53,.13],[.29,.09,.075]);break;
        case "shelterKit":part(body,fabric,[0,1.07,-.40],[.47,.51,.33]);for(const side of sides){part(body,metal,[side*.19,1.11,-.59],[.05,.47,.045]);}edge(R,[0,-.15,.14],[0,-.72,.14],.075);part(R,metal,[0,-.70,.14],[.29,.12,.15]);break;
        case "clanHammer":pole(R,.10,-.78);part(R,lining,[0,-.78,.17],[.54,.26,.27]);for(const side of sides)plate(R,[side*.25,-.78,.17],[.15,.18,.17],metal);rankSeal(R,aspect,ink,metal,[0,-.78,.32],.12);break;
        case "firstDrum":shape(body,drum,lining,[0,.86,.40],[.22,.26,.22],[Math.PI/2,0,0]);shape(body,drum,bone,[0,.86,.54],[.22,.035,.22],[Math.PI/2,0,0]);for(const h of [R,L])edge(h,[0,-.15,.15],[0,-.52,.20],.042);break;
        case "runeSlabs":pole(R,.48,-.50);for(let j=0;j<3;j++){plate(body,[.20-j*.19,.80,-.34],[.10,.19,.07],metal,[0,0,(j-1)*.15]);rankSeal(body,aspect,ink,metal,[.20-j*.19,.80,-.41],.06);}break;
        case "duelGong":pole(R,.51,-.62);shape(R,drum,metal,[0,.42,.17],[.23,.075,.23],[Math.PI/2,0,0]);shape(R,ring,ink,[0,.42,.218],[.17,.17,.5]);edge(L,[0,-.14,.12],[0,-.57,.12],.055);plate(L,[0,-.56,.12],[.08,.08,.08],lining);break;
        case "clanStandards":pole(R,.56,-.63);for(const side of sides){edge(body,[side*.27,.93,-.32],[side*.35,1.94,-.32],.048);part(body,side<0?fabric:orderCloth,[side*.43,1.68,-.32],[.23,.40,.06],[0,0,-side*.12]);rankSeal(body,aspect,ink,metal,[side*.43,1.68,-.28],.075);}break;
        case "arenaGloves":for(const h of [R,L]){plate(h,[0,-.25,.11],[.16,.20,.13],metal);for(let j=0;j<3;j++)part(h,metal,[(j-1)*.075,-.40,.16],[.055,.09,.07]);}break;
        case "processionDrum":shape(body,drum,lining,[0,1.05,-.19],[.28,.31,.28]);for(const yy of [.89,1.21])shape(body,drum,metal,[0,yy,-.19],[.30,.055,.30]);for(let j=0;j<7;j++){const a=j*tau/7;edge(body,[Math.cos(a)*.29,.91,-.19+Math.sin(a)*.29],[Math.cos(a+.4)*.29,1.19,-.19+Math.sin(a+.4)*.29],.027);}break;
        case "rootSceptre":pole(R,.50,-.70);for(const side of sides){edge(R,[0,.31,.17],[side*.19,.58,.17],.055);edge(R,[side*.19,.58,.17],[side*.25,.70,.12],.039);plate(R,[side*.25,.70,.12],[.08,.14,.08],ink);}jewel(R,[0,.64,.17],.11);break;
        case "rootBasket":flare(L,[0,-.25,.22],[.23,.25,.22],lining);for(let j=0;j<4;j++)plate(L,[(j%2-.5)*.16,-.10+Math.floor(j/2)*.09,.22],[.08,.14,.07],mark);pole(R,.38,-.52);break;
        case "springVessel":pole(R,.39,-.57);flare(R,[0,.50,.17],[.16,.26,.16],metal);shape(R,clericSphere,eye,[0,.65,.17],[.12,.06,.12]);shape(L,clericSphere,mark,[0,-.21,.17],[.13,.18,.13]);break;
        case "livingPact":book(L,0,-.20,.18,true);pole(R,.58,-.62);for(const side of sides){plate(R,[side*.14,.47,.17],[.11,.18,.06],mark,[0,0,-side*.50]);}jewel(R,[0,.55,.22],.08);break;
        case "boundaryCompass":pole(R,.46,-.62);shape(R,ring,metal,[0,.57,.18],[.20,.20,.5]);for(const side of sides)edge(R,[0,.57,.18],[side*.16,.57,.18],.038);plate(R,[0,.57,.22],[.06,.16,.04],ink);book(L,0,-.20,.19);break;
        case "clearingBuckler":shield(L,"round",.73);edge(R,[0,-.14,.13],[0,-.65,.13],.055);plate(R,[.09,-.62,.13],[.19,.10,.05],metal,[0,0,.22]);break;
        case "seedGarden":part(body,lining,[0,1.02,-.18],[.58,.13,.63]);for(let j=0;j<5;j++){const x=(j%2?1:-1)*.17,z=-.39+j*.11;edge(body,[x,1.05,z],[x,1.25+(j%2)*.06,z],.034);plate(body,[x,1.23+(j%2)*.06,z],[.075,.11,.066],j%2?ink:mark);}break;
        case "skyBow": {
          const nodes=[[0,-.75,.14],[0,-.49,.34],[0,-.18,.43],[0,.12,.34],[0,.39,.14]];
          for(let j=1;j<nodes.length;j++)edge(R,nodes[j-1],nodes[j],.065);
          strut(R,bone,nodes[0],nodes.at(-1),.016);jewel(R,[0,-.18,.43],.09);
          for(const side of sides)for(let j=0;j<3;j++)plate(body,[side*(.41+j*.10),1.52-j*.12,-.27],[.10,.31,.045],j%2?ink:metal,[0,0,-side*.45]);break;
        }
        case "breezeSails":for(let j=0;j<3;j++){const f=pivot(accessoryParent,0,.33,-.10+j*.09);plate(f,[0,.13+j*.045,0],[.14,.22,.05],j===1?ink:metal,[0,0,.3-j*.3]);}break;
        case "skyInstrument":pole(R,.52,-.58);shape(R,ring,metal,[0,.58,.17],[.19,.19,.5]);edge(R,[-.19,.58,.17],[.19,.58,.17],.043);plate(R,[.19,.58,.17],[.08,.05,.13],ink);break;
        case "balanceScales":pole(R,.56,-.60);edge(R,[-.29,.53,.17],[.29,.53,.17],.045);for(const side of sides){for(const dx of [-.09,.09])edge(R,[side*.25,.53,.17],[side*.25+dx,.29,.17],.020);flare(R,[side*.25,.25,.17],[.12,.07,.12],metal);}book(L,0,-.18,.16);break;
        case "routeScrolls":pole(R,.52,-.55);for(const side of sides){shape(body,drum,bone,[side*.23,1.03,-.34],[.08,.43,.08],[.15,0,side*.18]);band(body,1.02,.28);}book(L,0,-.21,.18,true);break;
        case "pactCase":shield(L,"kite",.70);part(R,lining,[0,-.23,.18],[.27,.35,.15]);rankSeal(R,aspect,ink,metal,[0,-.23,.27],.09);for(let j=0;j<2;j++)part(R,metal,[0,-.31+j*.17,.28],[.25,.045,.025]);break;
        case "travellerRope":part(body,lining,[0,1.07,-.32],[.28,.39,.23]);for(let j=0;j<4;j++)shape(body,ring,bone,[.21,1.03,-.36+j*.035],[.12,.12,.15],[0,Math.PI/2,0]);edge(R,[0,-.13,.16],[0,-.58,.16],.063);plate(R,[0,-.62,.16],[.10,.20,.05],metal);break;
      }
    }

    function emberGod(g,rig,[armor,copper,flame]){
      const body=rig.body=pivot(g,0,0,0),head=rig.head=pivot(g,0,9.6,.13);
      for(const side of sides){
        jointLeg(g,rig,side*1.02,0,3.67,3.75,1.52,armor,shadow,side===1?Math.PI:0);
        const arm=jointArm(g,rig,side*2.43,8.35,.07,armor,shadow,4.4,1.21);
        part(body,copper,[side*1.05,3.55,.67],[1.5,1.12,.65],[0,0,-side*.09]);
        shape(body,shard,armor,[side*2.35,8.30,-.13],[1.34,1.24,1.19]);
        shape(body,gem,copper,[side*2.61,8.5,.77],[.79,1.02,.45],[0,0,side*.20]);
        shape(body,spike,shadow,[side*2.84,9.53,-.43],[1.04,2.15,1.03],[0,0,-side*.33]);
        const horn=[[side*.91,.44,0],[side*1.38,1.33,-.19],[side*1.55,2.25,-.29],[side*1.36,2.83,-.36]];
        for(let i=1;i<horn.length;i++)strut(head,i===3?copper:shadow,horn[i-1],horn[i],.69-i*.15);
        for(let i=0;i<3;i++)strut(body,copper,[side*.35,6.48+i*.62,.93],[side*1.68,6.77+i*.68,.83],.29,.18);
        if(side===1){
          const grip=arm.userData.lower;
          strut(grip,copper,[0,-2.77,.55],[0,1.09,.55],.28);
          shape(grip,gem,flame,[0,-3.07,.55],[.66,1.44,.24]);
          for(const side of sides)strut(grip,armor,[0,-2.5,.55],[side*.73,-2.12,.55],.35);
        }
      }
      part(body,armor,[0,6.55,0],[3.9,4.5,2.19]);
      for(const y of [4.82,5.40,5.97])part(body,shadow,[0,y,.86],[3.12,.37,.66]);
      luminous(body,flame,copper,[0,7.48,1.21],.96);
      part(head,shadow,[0,.15,0],[2.08,1.82,1.72]);
      part(head,copper,[0,.55,.79],[1.72,.48,.22]);
      for(let i=0;i<5;i++){
        const x=(i-2)*.53,p=pivot(body,x,8.76-Math.abs(x)*.42,-.97);
        rig.factionAnim.floaters.push({pivot:p,baseY:p.position.y,amp:.14,speed:2.1+i*.18});
        shape(p,gem,flame,[0,.92,0],[.40,1.26+Math.abs(x)*.20,.29],[.17,0,-x*.19]);
      }
    }

    function lanternGod(g,rig,[enamel,gold,light]){
      const body=rig.body=pivot(g,0,0,0);
      const taper=[[1.3,1.38,1.02],[2.38,1.91,1.14],[3.45,2.18,1.38],[4.51,2.39,1.52]];
      for(const [y,w,d] of taper){
        shape(body,drum,enamel,[0,y,0],[w,1.24,d]);
        shape(body,ring,gold,[0,y-.42,0],[w,w,d],[Math.PI/2,0,0]);
      }
      shape(body,shard,enamel,[0,7.12,0],[2.39,2.59,1.66]);
      luminous(body,light,gold,[0,7.43,1.71],1.01);
      const head=rig.head=pivot(g,0,10.55,.13);
      shape(head,gem,gold,[0,0,0],[1.24,1.42,1.07]);
      part(head,enamel,[0,.05,.74],[1.30,1.27,.37]);
      for(const side of sides){
        strut(head,gold,[side*.66,.45,.65],[side*1.01,1.48,.42],.20,.23);
        for(let i=0;i<3;i++){
          const x=side*(2.7+i*.73),y=5.55+i*1.88;
          const tower=pivot(body,x,y,-.42-i*.18);
          rig.factionAnim.floaters.push({pivot:tower,baseY:y,amp:.24,speed:1.55+i*.2});
          shape(tower,gem,enamel,[0,0,0],[.63,1.45,.56]);
          shape(tower,gem,light,[0,.23,.29],[.32,.76,.29]);
          part(tower,gold,[0,-.59,.13],[.72,.15,.72]);
          shape(tower,spike,gold,[0,1.24,0],[.42,.68,.48]);
        }
      }
      orbit(body,rig,10.35,-.93,2.68,gold,light,8,.24);
    }

    function drumGod(g,rig,[stone,bronze,core]){
      const body=rig.body=pivot(g,0,0,0),head=rig.head=pivot(g,0,8.10,1.28);
      shape(body,shard,stone,[0,5.34,-.34],[3.06,3.19,2.12]);
      shape(body,drum,bronze,[0,6.44,1.60],[1.63,.84,1.63],[Math.PI/2,0,0]);
      shape(body,ring,core,[0,6.44,2.09],[1.30,1.30,.77]);
      for(let i=0;i<7;i++){
        const a=i*tau/7;
        part(body,bronze,[Math.cos(a)*1.48,6.44+Math.sin(a)*1.48,2.04],[.30,.44,.21],[0,0,a-Math.PI/2]);
      }
      for(const side of sides){
        jointLeg(g,rig,side*1.24,0,2.98,3.03,1.86,stone,shadow,side===1?Math.PI:0);
        const arm=jointArm(g,rig,side*2.83,7.27,.07,stone,shadow,5.12,1.69);
        shape(body,shard,stone,[side*2.76,7.57,-.24],[1.92,2.06,1.69]);
        for(let i=0;i<3;i++)shape(body,gem,i===1?bronze:stone,
          [side*(1.83+i*.51),8.87+Math.sin(i)*.53,-.84],[.58,1.73-i*.16,.66],[0,0,-side*.35]);
        shape(head,spike,bone,[side*.71,-.48,.88],[.31,1.01,.34],[0,0,-side*.30]);
        if(side===1){
          const grip=arm.userData.lower;
          strut(grip,bronze,[0,-1.75,.85],[0,2.47,.85],.39);
          part(grip,stone,[0,2.48,.85],[1.93,.97,1.45]);
          part(grip,core,[0,2.48,1.56],[.77,.40,.13]);
        }
      }
      shape(head,shard,stone,[0,0,0],[1.38,1.13,1.03]);
      part(head,shadow,[0,.18,.86],[1.72,.63,.49]);
    }

    function antlerGod(g,rig,[bark,moss,seeds]){
      const body=rig.body=pivot(g,0,0,0);
      shape(body,shard,bark,[0,5.1,-.66],[2.25,1.98,3.28]);
      const head=rig.head=pivot(g,0,8.11,2.11);
      strut(body,bark,[0,4.67,.67],[0,7.99,2.13],1.71,1.65);
      shape(head,gem,bark,[0,.14,.28],[1.11,1.26,1.42]);
      shape(head,gem,moss,[0,-.43,1.26],[.69,.50,.58]);
      luminous(body,seeds,moss,[0,5.23,1.61],.83);
      for(const side of sides){
        for(const z of [-2.52,1.05]){
          const leg=jointLeg(g,rig,side*1.48,z,4.18,4.28,1.00,bark,shadow,(side===1)===(z>0)?Math.PI:0);
          part(leg,moss,[0,-.73,0],[1.13,.62,1.16]);
        }
        const points=[[side*.70,.64,0],[side*1.51,1.70,-.47],[side*2.32,2.84,-.65],[side*2.31,4.20,-.68],[side*1.92,5.00,-.65]];
        for(let i=1;i<points.length;i++){
          strut(head,bark,points[i-1],points[i],.64-i*.105);
          const [x,y,z]=points[i],leaf=[x+side*.80,y+.58,z+.31];
          strut(head,moss,points[i],leaf,.20);
          shape(head,gem,seeds,leaf,[.28,.39,.26]);
        }
        for(let i=0;i<4;i++)shape(body,shard,moss,[side*(1.02+Math.sin(i)*.49),6.37+i%2*.41,-2.35+i*1.13],[.91,.62,.84]);
      }
      orbit(body,rig,7.28,-1.75,2.16,moss,seeds,6,-.17);
    }

    function windGod(g,rig,[blue,silver,air]){
      const body=rig.body=pivot(g,0,0,0),head=rig.head=pivot(g,0,10.20,.52);
      shape(body,shard,blue,[0,6.8,-.28],[2.13,2.76,1.36]);
      luminous(body,air,silver,[0,7.43,1.33],.74);
      shape(head,shard,silver,[0,0,0],[1.13,1.31,1.18]);
      shape(head,gem,blue,[0,-.38,1.02],[.51,.42,1.09]);
      for(const side of sides){
        jointLeg(g,rig,side*.81,0,4.45,4.31,1.04,blue,silver,side===1?Math.PI:0);
        jointArm(g,rig,side*1.82,8.17,-.13,blue,silver,3.49,.91);
        for(let i=0;i<3;i++)shape(head,gem,i===1?air:silver,[side*(.28+i*.34),1.38-i*.14,-.25-i*.13],[.35,1.28-i*.11,.27],[.28,0,-side*.37]);
        for(let tier=0;tier<2;tier++){
          const fan=pivot(body,side*(1.17-tier*.24),8.75-tier*3.40,-.91-tier*.47);
          const reach=tier?.73:1;
          strut(fan,blue,[0,0,0],[side*4.9*reach,1.36,0],.56,.56);
          for(let i=0;i<8;i++){
            const x=(.74+i*.69)*reach,y=1.2-(i-5)**2*.06,len=(2.65-i*.129)*reach;
            const feather=shape(fan,gem,i%3===0?blue:silver,[side*x,y-.68,-.07],[.50*reach,len,.28]);
            feather.rotation.z=side*(.36+i*.051);
            shape(fan,gem,air,[side*(x+.34*reach),y-.99,-.09],[.18,len*.72,.09],[0,0,side*(.36+i*.051)]);
          }
          rig.factionAnim.wings.push(wing(fan,side,.075,tier?-.18:.15,1.48+tier*.12));
        }
      }
      orbit(body,rig,10.47,-.64,2.34,silver,air,7,.19);
    }

    const gods={ember:emberGod,lantern:lanternGod,drum:drumGod,antler:antlerGod,wing:windGod};
    return (data,group,rig,order)=>{
      const g=pivot(group,0,0,0);g.rotation.y=Math.PI;
      const color=channels=>channels[0]<<16|channels[1]<<8|channels[2];
      const palette=[material(color(order.body)),material(color(order.accent),"metal"),material(color(order.accent),"glow")];
      rig.factionAnim={wings:[],spinners:[],jaws:[],floaters:[],tentacles:[],chimes:[],orbits:[]};
      if(data.god){
        gods[data.aspect](g,rig,palette);
        divineMysteries(g,rig,data);
      }
      else{
        g.scale.setScalar(data.size);
        if(data.rank)clergyModel(g,rig,data,palette);
        else makeFollower(g,rig,data,palette);
      }
    };
  }
};
