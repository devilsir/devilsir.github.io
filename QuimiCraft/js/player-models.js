"use strict";

globalThis.QuimiCraftModels = (() => {
  function create(THREE, options) {
    const {blocks, block, atlas, texFor, uvTile, itemColor, shadows, detailedBlockMiniature,produceMiniature} = options;
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const yAxis = new THREE.Vector3(0, 1, 0);
    const cut = .065;
    const outline = new THREE.Shape();
    outline.moveTo(-.43 + cut, -.43);
    for (const [x, y] of [[.43-cut,-.43],[.43,-.43+cut],[.43,.43-cut],[.43-cut,.43],
      [-.43+cut,.43],[-.43,.43-cut],[-.43,-.43+cut]]) outline.lineTo(x, y);
    outline.closePath();
    const faceted = new THREE.ExtrudeGeometry(outline, {depth:.86, bevelEnabled:true, bevelThickness:.07, bevelSize:.07, bevelSegments:1});
    faceted.translate(0, 0, -.43);
    const metal = new THREE.MeshStandardMaterial({color:0xa5c2cc, metalness:.64, roughness:.26});
    const edge = new THREE.MeshStandardMaterial({color:0xe8f8f5, metalness:.62, roughness:.18});
    const brass = new THREE.MeshStandardMaterial({color:0xd4a44e, metalness:.72, roughness:.28});
    const stone = new THREE.MeshLambertMaterial({color:0x7c8b89});
    const dark = new THREE.MeshStandardMaterial({color:0x1b2830, metalness:.28, roughness:.62});
    const wood = new THREE.MeshLambertMaterial({color:0x734d34});
    const lightWood = new THREE.MeshLambertMaterial({color:0xac7749});
    const leather = new THREE.MeshLambertMaterial({color:0x49342e});
    const thread = new THREE.MeshLambertMaterial({color:0xd8c4a8});
    const crystal = new THREE.MeshStandardMaterial({color:0x78f0e4, emissive:0x28b8ad, emissiveIntensity:.82, roughness:.14, metalness:.16, transparent:true, opacity:.88, flatShading:true});
    const bufferLiquid=new THREE.MeshStandardMaterial({color:0xb0d75f,roughness:.24,metalness:.12,emissive:0x2d400e,emissiveIntensity:.45,transparent:true,opacity:.86});
    const globe = new THREE.OctahedronGeometry(1, 0);
    const torus = new THREE.TorusGeometry(1, .048, 6, 26);
    const cyl = new THREE.CylinderGeometry(.5, .5, 1, 14);
    const materialCache = new Map();
    const textures = new Map();
    const icons = new Map();
    const shieldShapes = new Map();
    const capeModels=new Map();
    const itemMatt = new THREE.MeshLambertMaterial({map:atlas.texture, alphaTest:.38, color:0xffffff, side:THREE.DoubleSide,
      emissive:0x141414, emissiveIntensity:.62});

    function alloyMat(key, color, metalness = .76, roughness = .22, emissive = 0x000000, emissiveIntensity = 0) {
      const k = `alloy:${key}:${color}:${metalness}:${roughness}:${emissive}:${emissiveIntensity}`;
      if (!materialCache.has(k)) materialCache.set(k, new THREE.MeshStandardMaterial({
        color, metalness, roughness, emissive, emissiveIntensity
      }));
      return materialCache.get(k);
    }
    function glassMat(key, color, opacity = .32, roughness = .06, emissive = 0x000000, emissiveIntensity = 0) {
      const k = `glass:${key}:${color}:${opacity}:${roughness}:${emissive}:${emissiveIntensity}`;
      if (!materialCache.has(k)) materialCache.set(k, new THREE.MeshStandardMaterial({
        color, metalness:.16, roughness, transparent:true, opacity, depthWrite:false,
        emissive, emissiveIntensity, side:THREE.DoubleSide
      }));
      return materialCache.get(k);
    }
    function glowGemMat(key, color, emissive = color, emissiveIntensity = .95, opacity = .86) {
      const k = `gem:${key}:${color}:${emissive}:${emissiveIntensity}:${opacity}`;
      if (!materialCache.has(k)) materialCache.set(k, new THREE.MeshStandardMaterial({
        color, emissive, emissiveIntensity, roughness:.14, metalness:.14,
        transparent:opacity < 1, opacity, flatShading:true
      }));
      return materialCache.get(k);
    }
    function glowHalo(root, parent, color, pos, size, opacity = .64) {
      const k = `halo:${color}:${opacity}`;
      if (!materialCache.has(k)) materialCache.set(k, new THREE.SpriteMaterial({
        map:haloTexture, color, transparent:true, blending:THREE.AdditiveBlending,
        depthWrite:false, toneMapped:false, opacity
      }));
      const sprite = new THREE.Sprite(materialCache.get(k));
      sprite.position.set(...pos);
      sprite.scale.set(size, size, 1);
      sprite.userData.baseSize = size;
      sprite.userData.phase = (root.userData.pulseHalos?.length || 0) * 1.37;
      sprite.userData.noShadow = true;
      parent.add(sprite);
      (root.userData.pulseHalos ??= []).push(sprite);
      return sprite;
    }

    function mesh(parent, geometry, mat, xyz, size, rotation = [0,0,0]) {
      const node = new THREE.Mesh(geometry, mat);
      node.position.set(...xyz);
      node.scale.set(...size);
      node.rotation.set(...rotation);
      node.userData.noShadow = Array.isArray(mat) ? mat.some(part => part.transparent) : mat.transparent;
      node.castShadow = node.receiveShadow = !node.userData.noShadow && shadows();
      parent.add(node);
      return node;
    }
    const box = (group, mat, pos, size, rot) => mesh(group, boxGeo, mat, pos, size, rot);
    const bevel = (group, mat, pos, size, rot) => mesh(group, faceted, mat, pos, size, rot);

    function bar(parent, mat, a, b, width, depth = width) {
      const direction = new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
      const segment = bevel(parent, mat, a.map((value, index) => (value + b[index]) / 2), [width,direction.length(),depth]);
      segment.quaternion.setFromUnitVectors(yAxis, direction.normalize());
      return segment;
    }

    function blockGeometry(id, plane = false) {
      const key = id + (plane ? "p" : "b");
      if (textures.has(key)) return textures.get(key);
      const geometry = plane ? new THREE.PlaneGeometry(1,1) : new THREE.BoxGeometry(1,1,1);
      const uv = geometry.getAttribute("uv");
      for (let i=0; i<uv.count; i++) uv.setXY(i,...uvTile(texFor(id, Math.floor(i/4)),uv.getX(i),uv.getY(i)));
      textures.set(key,geometry);
      return geometry;
    }

    function blockMiniature(id, size, view) {
      const root = new THREE.Group();
      root.name = "Bloco em miniatura";
      root.userData.blockId = id;
      const def = blocks[id];
      const detailed=detailedBlockMiniature?.(id);
      if(detailed){
        detailed.scale.setScalar(size);
        root.add(detailed);
      } else if (def.plant || id === block.FIRE) {
        const plane = blockGeometry(id, true);
        for (const angle of [Math.PI / 4, -Math.PI / 4]) {
          mesh(root,plane,itemMatt,[0,0,0],[size,size,1],[0,angle,0]);
        }
      } else if (id === block.TORCH || id === block.SPECTRAL) {
        const rod = id === block.SPECTRAL ? crystal : lightWood;
        const tip = id === block.SPECTRAL ? crystal : brass;
        bar(root,rod,[0,-size*.59,0],[0,size*.47,0],size*.16);
        bevel(root,tip,[0,size*.5,0],[size*.27,size*.29,size*.27]);
      } else {
        const thin = def.partial;
        mesh(root,blockGeometry(id),itemMatt,[0,0,0],thin ? [size*.75,size*1.22,size*.19] : [size,size,size]);
      }
      if (view === "first") root.rotation.set(.16,-.58,.04);
      else if (view === "third") root.rotation.set(.12,-.28,-.08);
      return root;
    }

    function grip(root, height = .36) {
      bevel(root,leather,[0,0,0],[.104,height,.099]);
      for (let i=0;i<5;i++) box(root,thread,[0,(i-2)*height*.16,-.049],[.107,.016,.016],[0,0,-.19]);
    }

    function staffVariant(root,w){
      const frost=w.style==="frost",silver=w.style==="silver",corrupted=!!w.corrupted,shade=tint(w.style,w.color),trim=tint(w.style+"-trim",w.trim);
      const shaft=corrupted?alloyMat("corrupt-shaft",0x241133,.42,.52,0x351052,.28):silver?metal:frost?dark:wood;
      bar(root,shaft,[0,-.62,0],[0,1.06,0],.096);
      grip(root,.39);
      for(const y of [-.58,.55,.87])bevel(root,trim,[0,y,0],[.143,.067,.137]);
      const center=[0,1.20,0],key=w.style+"-glow";
      if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({
        color:w.color,emissive:w.color,emissiveIntensity:corrupted?.85:.45,roughness:.24,flatShading:true
      }));
      const coreMaterial=w.spectralWeapon?spectralFinish(w.color,w.trim,.83,.56):materialCache.get(key);
      root.userData.core=mesh(root,globe,coreMaterial,center,frost?[.143,.29,.141]:corrupted?[.23,.23,.21]:[.21,.24,.18],[.12,.36,.24]);
      root.userData.coreSize=root.userData.core.scale.clone();
      if(corrupted){
        const eyeGlow=glowGemMat("corrupt-staff-eye",0xffd89e,0xff74e0,1.35,.95);
        const pupil=alloyMat("corrupt-pupil",0x09040e,.2,.3);
        const claw=alloyMat("corrupt-claw",0x35184d,.52,.44,0x4c1770,.24);
        mesh(root,globe,eyeGlow,[0,1.20,-.15],[.14,.14,.09]);
        mesh(root,globe,pupil,[0,1.20,-.22],[.036,.125,.04]);
        glowHalo(root,root,0xd966ff,[0,1.20,-.18],.72,.58);
        for(let i=0;i<4;i++){
          const a=i*Math.PI/2+Math.PI/4,cx=Math.cos(a)*.24,cz=Math.sin(a)*.24;
          bar(root,claw,[0,.84,0],[cx,1.08,cz],.048);
          bar(root,claw,[cx,1.08,cz],[cx*.72,1.44,cz*.72],.038);
          mesh(root,globe,trim,[cx*.72,1.47,cz*.72],[.046,.082,.046]);
        }
      }else if(w.spectralWeapon){
        QuimiCraftSpectral.halo(THREE,root,0x44dfd2,[0,1.23,-.07],.67,.74,.38);
        for(const side of [-1,1]){
          bar(root,coreMaterial,[0,.88,0],[side*.23,1.09,.04],.038);
          bar(root,coreMaterial,[side*.23,1.09,.04],[side*.16,1.46,-.08],.032);
          mesh(root,globe,coreMaterial,[side*.16,1.50,-.08],[.071,.146,.062],[0,0,-side*.41]);
        }
        mesh(root,torus,trim,[0,1.23,.02],[.31,.39,.37],[0,0,.41]);
        mesh(root,globe,trim,[0,1.62,.03],[.033,.068,.030]);
      }else if(silver){
        const outer=.33,inner=.246;
        for(let n=0;n<13;n++){
          const a=.47+n*.315,point=[Math.cos(a)*outer,1.235+Math.sin(a)*outer,0];
          mesh(root,globe,n%2?trim:shade,point,[.068,.079,.058],[0,0,a]);
          if(n<3||n>9)mesh(root,globe,trim,[Math.cos(a)*inner,1.235+Math.sin(a)*inner,0],[.062,.061,.052]);
        }
      }else if(frost){
        for(const [x,z] of [[.18,.08],[-.18,.08],[0,-.17]]){
          const elbow=[x*.75,1.05,z*.72],tip=[x,1.45,z];
          bar(root,metal,[0,.84,0],elbow,.051);
          bar(root,trim,elbow,tip,.041);
          mesh(root,globe,shade,tip,[.063,.13,.062],[.26,.1,.28]);
        }
      }else{
        for(const side of [-1,1]){
          bar(root,brass,[0,.73,0],[side*.19,1.02,.04],.052);
          bar(root,trim,[side*.19,1.02,.04],[side*.29,1.26,-.06],.048);
          mesh(root,globe,shade,[side*.274,1.35,-.07],[.052,.111,.053],[.2,side*.44,side*.3]);
        }
      }
      root.userData.rings=Array.from({length:frost||silver?1:2},(_,index)=>{
        const scale=(frost?.226:.29)+index*.05;
        const ring=mesh(root,torus,index?shade:trim,center,[scale,scale,scale]);
        ring.userData.phase=index*Math.PI*.63;
        return ring;
      });
    }

    function staff(root) {
      bevel(root,wood,[0,.24,0],[.092,1.55,.095]);
      box(root,lightWood,[.026,.23,-.048],[.028,.96,.012]);
      grip(root);
      bevel(root,brass,[0,-.56,0],[.125,.13,.128]);
      bevel(root,metal,[0,.92,0],[.18,.13,.19]);
      for (const side of [-1,1]) {
        const joint = [side*.14,1.09,.055];
        bar(root,brass,[side*.039,.91,0],joint,.05);
        bar(root,edge,joint,[side*.23,1.34,.08],.035);
        bevel(root,dark,[side*.18,1.11,0],[.067,.16,.083],[0,0,side*.4]);
      }
      root.userData.core = mesh(root,globe,crystal,[0,1.17,-.015],[.169,.22,.167],[.17,.1,.27]);
      root.userData.rings = [0,1].map((index)=>{
        const ring = mesh(root,torus,index ? metal : brass,[0,1.15,-.01],[.25 + index*.04,.25 + index*.04,.25 + index*.04]);
        ring.userData.phase = index * Math.PI * .61;
        return ring;
      });
    }

    function bow(root,w) {
      const variant=w?.style,steel=variant==="steel",bamboo=variant==="bamboo",spectral=w?.spectralWeapon,corrupted=!!w?.corrupted;
      const limb=spectral?spectralFinish(w.color,w.trim,.34,.59):corrupted?alloyMat("corrupt-bow",w.color,.45,.46,0x49186b,.30):variant?tint(variant,w.color):wood;
      const laminate=spectral?spectralFinish(w.trim,w.trim,.80):corrupted?glowGemMat("corrupt-bow-trim",w.trim,0xd862ff,1.05,.92):variant?tint(variant+"-trim",w.trim):lightWood;
      grip(root,.31);
      if(corrupted){
        mesh(root,globe,glowGemMat("corrupt-bow-eye",0xffd7a3,0xff6ee0,1.25,.95),[0,.02,-.075],[.064,.082,.042]);
        mesh(root,globe,dark,[0,.02,-.108],[.018,.068,.024]);
        glowHalo(root,root,0xd966ff,[0,.02,-.11],.34,.54);
      }
      const tips = [];
      for (const side of [-1,1]) {
        const path=spectral||corrupted?[[0,side*.09,-.064],[0,side*.27,-.052],[0,side*.54,.12],[0,side*.76,.30],[0,side*.95,.24],[0,side*1.04,.12]]:
          bamboo?[[0,side*.1,-.055],[0,side*.32,-.005],[0,side*.62,.237],[0,side*.75,.31],[0,side*.9,.19]]:
          steel?[[0,side*.08,-.048],[0,side*.37,-.011],[0,side*.65,.163],[0,side*.94,.289]]:
          [[0,side*.1,-.035],[0,side*.31,.043],[0,side*.60,.212],[0,side*.77,.305]];
        tips.push(path.at(-1));
        for (let i=1;i<path.length;i++) {
          bar(root,limb,path[i-1],path[i],(steel?.115:.089)-i*.01,.074);
          const strip = path.slice(i-1,i+1).map(([x,y,z])=>[x-.04,y,z-.015]);
          bar(root,laminate,strip[0],strip[1],.028,.018);
        }
        const cap=variant?path.at(-2):[0,side*.667,.252];
        bevel(root,steel||corrupted?dark:brass,cap,[.105,.075,.096],[side*.23,0,0]);
        if(variant)for(const pt of path.slice(1,-1)){
          bevel(root,laminate,pt,[.109,.045,.098],[side*.19,0,0]);
          if(steel)bevel(root,brass,[.057,pt[1],pt[2]],[.032,.039,.046]);
          if(spectral||corrupted)mesh(root,globe,laminate,[-.055,pt[1],pt[2]],[.051,.045,.047]);
        }
      }
      root.userData.bowTips = tips.map(tip=>new THREE.Vector3(...tip));
      root.userData.string = [bevel(root,thread,[0,0,0],[.012,1,.012]),bevel(root,thread,[0,0,0],[.012,1,.012])];
      root.userData.arrow = arrow(root);
      root.userData.forward=new THREE.Vector3(0,0,-1);
    }
    function crossbow(root,w){
      const rail=tint("crossbow-rail",w.trim),stock=tint("crossbow-stock",w.color);
      bevel(root,stock,[0,-.039,.18],[.167,.15,.70]);
      bevel(root,lightWood,[0,-.067,.495],[.221,.122,.261],[.18,0,0]);
      bevel(root,leather,[0,-.15,.20],[.11,.218,.12],[-.40,0,0]);
      bevel(root,rail,[0,.047,-.095],[.103,.046,.83]);
      bevel(root,metal,[0,.014,-.368],[.25,.115,.228]);
      bevel(root,dark,[0,.060,-.398],[.254,.033,.066]);
      for(const side of [-1,1]){
        bevel(root,brass,[side*.086,-.042,.196],[.024,.083,.46]);
        for(const z of [.008,.23,.40])mesh(root,globe,metal,[side*.098,-.025,z],[.027,.032,.032]);
        bar(root,dark,[side*.111,.058,-.337],[side*.092,.139,-.337],.039);
      }
      bevel(root,rail,[0,.141,-.337],[.214,.034,.057]);
      bevel(root,brass,[0,.066,-.471],[.020,.075,.028]);
      const tips=[];
      for(const side of [-1,1]){
        const path=[[0,.017,-.383],[side*.245,.041,-.46],[side*.467,.057,-.391],[side*.683,.065,-.257]];
        for(let i=1;i<path.length;i++){
          bar(root,i===1?metal:dark,path[i-1],path[i],.076-i*.009,.098-i*.014);
          bar(root,rail,path[i-1].map((v,k)=>v+(k===1?.026:0)),path[i].map((v,k)=>v+(k===1?.026:0)),.028,.036);
        }
        const pulley=mesh(root,cyl,brass,path.at(-1),[.111,.034,.111],[0,0,0]);
        tips.push(pulley.position.toArray());
      }
      const stirrup=mesh(root,torus,metal,[0,.01,-.563],[.094,.112,.108],[Math.PI/2,0,0]);
      stirrup.rotation.z=Math.PI/4;
      root.userData.bowTips=tips.map(tip=>new THREE.Vector3(...tip));
      root.userData.string=tips.map(()=>bevel(root,thread,[0,0,0],[.014,1,.014]));
      root.userData.arrow=bolt(root);
    }
    function sacredHammer(root,{gold,highlight,bronze,channel,silver}){
      const hammer=new THREE.Group();hammer.rotation.z=.22;hammer.position.set(0,.008,-.212);
      hammer.name="Martelo do Sol";root.add(hammer);
      mesh(hammer,cyl,bronze,[0,-.077,0],[.047,.456,.047]);
      for(let i=0;i<7;i++){
        mesh(hammer,torus,i%2?highlight:gold,[0,-.264+i*.023,0],[.023,.023,.035],[Math.PI/2+.18,0,0]);
      }
      bevel(hammer,gold,[0,-.286,0],[.065,.035,.065]);
      mesh(hammer,globe,highlight,[0,-.310,0],[.031,.042,.033]);
      const head=new THREE.Group();head.position.y=.168;head.name="Cabeça de aço do martelo";hammer.add(head);
      bevel(head,bronze,[0,0,0],[.232,.113,.093]);
      bevel(head,gold,[0,0,-.040],[.233,.118,.028]);
      bevel(head,silver,[0,0,-.059],[.185,.077,.020]);
      for(const sign of [-1,1]){
        bevel(head,highlight,[sign*.101,0,-.020],[.032,.127,.093]);
        mesh(head,globe,gold,[sign*.072,0,-.071],[.015,.017,.009]);
      }
      const hand=new THREE.Group();hand.position.set(.008,.038,0);hand.name="Manopla fechada no cabo";hammer.add(hand);
      bevel(hand,bronze,[.054,-.015,.018],[.079,.138,.063],[0,0,.17]);
      bevel(hand,channel,[.063,-.017,.023],[.076,.119,.074],[0,0,.13]);
      bevel(hand,silver,[.081,-.024,.001],[.055,.092,.051],[0,0,.24]);
      bevel(hand,bronze,[.091,-.072,.017],[.081,.060,.091],[0,0,.53]);
      bevel(hand,highlight,[.091,-.067,-.038],[.081,.035,.024],[0,0,.53]);
      for(const [i,[height,length,radius]] of [[.060,1,.015],[.025,1.07,.017],[-.011,.97,.016],[-.044,.83,.013]].entries()){
        const key="sacred:finger:"+i;
        let digit=shieldShapes.get(key);
        if(!digit){
          const path=[[.054,0,.032],[.049,.003,-.022],[.023,.005,-.050],
            [-.012*length,.003,-.055],[-.036*length,-.002,-.035],[-.031*length,-.007,-.007]];
          digit=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path.map(p=>new THREE.Vector3(...p))),18,radius,8,false);
          shieldShapes.set(key,digit);
        }
        mesh(hand,digit,bronze,[0,height,0],[1,1,1]).name="Dedo curvado";
        bevel(hand,silver,[.024,height+.006,-.054],[.038*length,.027,.022],[0,.20,.10]);
        bevel(hand,gold,[-.010*length,height+.002,-.057],[.025,.025,.020],[0,-.23,.09]);
        mesh(hand,globe,silver,[-.032*length,height-.007,-.010],[radius*.91,radius*.91,radius]);
      }
      bar(hand,channel,[.055,-.052,.009],[.014,-.053,-.058],.031,.028);
      bar(hand,highlight,[.010,-.051,-.065],[-.020,-.019,-.061],.033,.028);
      bevel(hand,silver,[-.031,-.011,-.055],[.028,.035,.025],[.14,-.29,.72]).name="Polegar sobre o cabo";
    }
    function sacredSphere(root,view){
      if(!shieldShapes.has("sacred:sphere"))shieldShapes.set("sacred:sphere",new THREE.SphereGeometry(1,48,32));
      if(!materialCache.has("sacred:sphere")){
        materialCache.set("sacred:sphere",new THREE.ShaderMaterial({
          uniforms:{pulse:{value:0},strength:{value:1}},
          transparent:true,depthWrite:false,side:THREE.FrontSide,
          blending:THREE.AdditiveBlending,toneMapped:false,
          vertexShader:`
            varying vec3 normalView, toEye, shell;
            void main(){
              shell=position;
              vec4 viewPosition=modelViewMatrix*vec4(position,1.);
              normalView=normalMatrix*normal;
              toEye=-viewPosition.xyz;
              gl_Position=projectionMatrix*viewPosition;
            }`,
          fragmentShader:`
            uniform float pulse,strength;
            varying vec3 normalView,toEye,shell;
            void main(){
              float facing=clamp(dot(normalize(normalView),normalize(toEye)),0.,1.);
              float edge=1.-facing;
              float rim=pow(edge,3.15);
              vec3 direction=normalize(shell);
              vec3 meridian=normalize(vec3(cos(pulse),.42,sin(pulse)));
              float arc=1.-smoothstep(.013,.061,abs(dot(direction,meridian)));
              float parallel=1.-smoothstep(.012,.051,abs(dot(direction,vec3(.08,.97,.23))-.36));
              float shimmer=.75+.25*sin(direction.y*8.+direction.x*5.-pulse*5.);
              float alpha=(.010+.29*rim+.10*smoothstep(.85,.99,edge)+(.064*arc+.040*parallel)*shimmer)*strength;
              gl_FragColor=vec4(mix(vec3(1.,.48,.09),vec3(1.,.88,.47),rim),alpha);
            }`
        }));
      }
      const material=materialCache.get("sacred:sphere");
      const radius=.716;
      const sphere=mesh(root,shieldShapes.get("sacred:sphere"),material,[0,.010,-.079],[radius,radius,radius]);
      sphere.name="Esfera de Luz Sagrada";
      sphere.renderOrder=4;
      sphere.userData.radius=radius;
      sphere.userData.pulse=0;
      const base=view==="first"?.60:view==="drop"?.73:1;
      sphere.userData.strength=base;
      sphere.userData.baseStrength=base;
      sphere.onBeforeRender=()=>{
        material.uniforms.pulse.value=sphere.userData.pulse;
        material.uniforms.strength.value=sphere.userData.strength;
        material.uniformsNeedUpdate=true;
      };
      root.userData.sacredSphere=sphere;
    }
    function sacredShield(root,view){
      const gold=alloyMat("sacred-gold",0xeab648,.76,.29,0x823700,.13);
      const highlight=alloyMat("sacred-edge",0xffdb8c,.65,.22,0x994807,.19);
      const bronze=alloyMat("sacred-side",0x68422a,.65,.41);
      const channel=alloyMat("sacred-channel",0x2e262b,.36,.45);
      const silver=alloyMat("sacred-silver",0xe7dfcd,.59,.30,0x715b39,.13);
      const blue=alloyMat("sacred-blue",0x374454,.47,.34,0x111c35,.17);
      if(!materialCache.has("sacred:sunlight"))materialCache.set("sacred:sunlight",new THREE.MeshBasicMaterial({color:0xffdf82,toneMapped:false}));
      const sunlight=materialCache.get("sacred:sunlight");
      let crest=shieldShapes.get("sacred:crest"),feather=shieldShapes.get("sacred:feather");
      if(!crest){
        const profile=new THREE.Shape();
        profile.moveTo(0,.565);
        profile.lineTo(.139,.463);profile.quadraticCurveTo(.253,.423,.331,.403);
        profile.quadraticCurveTo(.344,.105,.305,-.183);
        profile.quadraticCurveTo(.266,-.392,0,-.594);
        profile.quadraticCurveTo(-.266,-.392,-.305,-.183);
        profile.quadraticCurveTo(-.344,.105,-.331,.403);
        profile.quadraticCurveTo(-.253,.423,-.139,.463);profile.closePath();
        crest=new THREE.ExtrudeGeometry(profile,{depth:.062,bevelSize:.018,bevelThickness:.016,bevelSegments:2,curveSegments:12});
        shieldShapes.set("sacred:crest",crest);
        const plume=new THREE.Shape();
        plume.moveTo(0,-.17);
        plume.bezierCurveTo(.029,-.013,.065,.115,.039,.218);
        plume.bezierCurveTo(.02,.159,-.043,.097,-.066,.019);
        plume.bezierCurveTo(-.091,-.062,-.049,-.145,0,-.17);
        feather=new THREE.ExtrudeGeometry(plume,{depth:.008,bevelSize:.006,bevelThickness:.005,bevelSegments:1,curveSegments:8});
        shieldShapes.set("sacred:feather",feather);
      }
      mesh(root,crest,bronze,[0,0,0],[1.04,1.035,1.1]).name="Estrutura de bronze";
      mesh(root,crest,highlight,[0,0,-.041],[1.015,1,1]).name="Borda facetada de ouro";
      mesh(root,crest,channel,[0,0,-.053],[.934,.948,.85]);
      mesh(root,crest,gold,[0,.005,-.063],[.887,.9,.78]);
      mesh(root,crest,blue,[0,.008,-.076],[.801,.824,.66]).name="Chapa azul de aço";
      mesh(root,crest,gold,[0,0,.075],[.879,.91,.22]).name="Moldura traseira";
      mesh(root,crest,channel,[0,.004,.087],[.82,.85,.26]);
      mesh(root,crest,blue,[0,.004,.100],[.76,.79,.18]).name="Chapa interna reforçada";
      for(const side of [-1,1]){
        bar(root,bronze,[side*.205,.297,.113],[side*.183,-.227,.113],.026,.025);
        bar(root,gold,[side*.157,-.268,.113],[0,-.421,.113],.014,.016);
        for(const y of [-.222,.297])mesh(root,globe,highlight,[side*.190,y,.128],[.025,.024,.013]);
      }
      mesh(root,globe,gold,[0,.294,.113],[.068,.082,.015]);
      mesh(root,globe,bronze,[0,.296,.127],[.048,.058,.011]);
      for(const side of [-1,1]){
        bevel(root,leather,[side*.126,.007,.112],[.053,.27,.083],[0,0,side*.11]);
        bevel(root,brass,[side*.126,.104,.154],[.069,.048,.033]);
        bar(root,gold,[side*.195,-.279,-.087],[side*.089,-.373,-.089],.025,.013);
        for(const [index,[x,y,scale]] of [[.19,.307,1],[.244,.157,.68],[.158,-.255,1.13],[.104,-.375,.71]].entries()){
          const key="sacred:scroll:"+index;
          if(!shieldShapes.has(key)){
            const points=Array.from({length:25},(_,j)=>{
              const t=j/24,a=t*5.4-1.5,r=(1-t*.78)*.070;
              return new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,0);
            });
            shieldShapes.set(key,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.008,5,false));
          }
          mesh(root,shieldShapes.get(key),gold,[side*x,y,-.094],[side*scale,scale,1],[0,0,index<2?side*.18:side*2.55]).name="Filigrana";
        }
        const wing=new THREE.Group();wing.scale.x=side;wing.name="Asa de prata";
        root.add(wing);
        for(let i=0;i<7;i++){
          const pose=[.245+i*.022,.229-i*.048,-.134-i*.003],rot=[0,-.055,-.31-i*.168];
          const length=1.21-i*.067;
          mesh(wing,feather,bronze,pose,[.97,length,1],rot);
          mesh(wing,feather,i%3===0?silver:highlight,[pose[0]-.012,pose[1]+.006,pose[2]-.011],[.77,length*.975,1],rot);
          mesh(wing,feather,silver,[.171+i*.017,.15-i*.035,-.168-i*.003],[.58,.66-i*.022,.76],[0,-.08,-.49-i*.14]);
        }
      }
      bar(root,leather,[-.116,.009,.145],[.116,.009,.145],.057);
      for(const [y,size] of [[.411,1],[-.447,.91]]){
        mesh(root,globe,gold,[0,y,-.104],[.089*size,.131*size,.032]);
        mesh(root,globe,silver,[0,y,-.124],[.057*size,.084*size,.022]);
      }
      const sunY=.073;
      for(let i=0;i<12;i++){
        const angle=i*Math.PI/6,x=Math.sin(angle),y=Math.cos(angle);
        mesh(root,globe,gold,[x*.161,sunY+y*.161,-.107],[.032,i%3===0?.092:.055,.021],[0,0,-angle]);
      }
      mesh(root,cyl,bronze,[0,sunY,-.131],[.375,.06,.375],[Math.PI/2,0,0]);
      mesh(root,cyl,gold,[0,sunY,-.153],[.336,.047,.336],[Math.PI/2,0,0]).name="Medalhão solar";
      mesh(root,torus,highlight,[0,sunY,-.186],[.161,.161,.079]);
      mesh(root,torus,sunlight,[0,sunY,-.189],[.139,.139,.033]);
      sacredHammer(root,{gold,highlight,bronze,channel,silver});
      sacredSphere(root,view);
      root.userData.sacredGlow=glowHalo(root,root,0xffb73d,[0,sunY,-.179],view==="first"?.43:.72,.43);
      if(view==="catalog"){
        const halo=new THREE.Group();halo.position.set(0,.005,.098);root.add(halo);
        halo.name="Runas em órbita";
        for(let i=0;i<12;i++){
          const angle=i*Math.PI/6,x=Math.sin(angle),y=Math.cos(angle);
          const rune=new THREE.Group();
          rune.position.set(x*.657,y*.657,-.01);rune.rotation.z=-angle;halo.add(rune);
          bar(rune,sunlight,[0,-.018,0],[0,.018,0],.006);
          bar(rune,sunlight,[0,.003,0],[i%2?.015:-.015,.013,0],.006);
          if(i%3===0)bar(rune,sunlight,[0,-.003,0],[-.014,-.01,0],.006);
        }
        root.userData.sacredHalo=halo;
      }
    }
    const baseShieldDef = {name:"Escudo de bronze",shape:"heater",color:"#b1683a",trim:"#cf8c50"};
    let bronzeFinish;
    function bronzeMaterials(){
      if(bronzeFinish)return bronzeFinish;
      const width=128,height=64,rgba=new Uint8Array(width*height*4);
      for(let y=0;y<height;y++)for(let x=0;x<width;x++){
        const u=x/width,v=y/height;
        const panel=(center,yc,sx,sy)=>{
          const du=Math.abs(u-center),wrapped=Math.min(du,1-du);
          return Math.exp(-(.5*(wrapped/sx)**2+.5*((v-yc)/sy)**2));
        };
        const value=62+41*Math.sin(Math.PI*v)+145*panel(.22,.67,.065,.19)
          +112*panel(.70,.37,.12,.065)+72*panel(.91,.62,.033,.25);
        const k=(x+y*width)*4;
        rgba[k]=Math.min(255,value*1.03);
        rgba[k+1]=Math.min(255,value);
        rgba[k+2]=Math.min(255,value*.94);
        rgba[k+3]=255;
      }
      const reflection=new THREE.DataTexture(rgba,width,height,THREE.RGBAFormat);
      reflection.mapping=THREE.EquirectangularReflectionMapping;
      reflection.encoding=THREE.sRGBEncoding;
      reflection.minFilter=reflection.magFilter=THREE.LinearFilter;
      reflection.needsUpdate=true;
      const brushed=new Uint8Array(64*64*4);
      for(let y=0;y<64;y++)for(let x=0;x<64;x++){
        const k=(x+y*64)*4;
        brushed[k]=brushed[k+1]=brushed[k+2]=221+19*Math.sin(y*.71+x*.04)+9*Math.cos(y*2.36+x*.26);
        brushed[k+3]=255;
      }
      const roughnessMap=new THREE.DataTexture(brushed,64,64,THREE.RGBAFormat);
      roughnessMap.minFilter=roughnessMap.magFilter=THREE.LinearFilter;
      roughnessMap.needsUpdate=true;
      const finish=(color,metalness,roughness,envMapIntensity)=>new THREE.MeshStandardMaterial({
        color,metalness,roughness,envMap:reflection,envMapIntensity
      });
      const face=finish(baseShieldDef.color,.81,.35,.98);
      face.roughnessMap=roughnessMap;
      bronzeFinish=[face,finish(baseShieldDef.trim,.87,.24,1.15),
        finish(0x6b3b25,.78,.40,.86),finish(0xbe7544,.86,.27,1.14)];
      return bronzeFinish;
    }
    function bronzeShield(root){
      const materials=bronzeMaterials(),[,rim,groove,boss]=materials;
      if(!shieldShapes.has("bronze:buckler")){
        const contour=new THREE.Shape();
        contour.moveTo(0,-.52);
        contour.quadraticCurveTo(.23,-.45,.31,-.20);
        contour.quadraticCurveTo(.36,.02,.34,.26);
        contour.quadraticCurveTo(.34,.37,.294,.43);
        contour.quadraticCurveTo(.16,.50,0,.46);
        contour.quadraticCurveTo(-.16,.50,-.294,.43);
        contour.quadraticCurveTo(-.34,.37,-.34,.26);
        contour.quadraticCurveTo(-.36,.02,-.31,-.20);
        contour.quadraticCurveTo(-.23,-.45,0,-.52);
        const outline=contour.getPoints(6).slice(0,-1);
        const levels=[[.22,.055,0],[.87,.047,0],[.97,.028,1],[1,.006,1],[.995,-.024,1],
          [.962,-.050,1],[.912,-.060,2],[.875,-.066,0],[.75,-.092,0],[.57,-.115,0],
          [.40,-.132,0],[.20,-.144,0],[.075,-.149,0]];
        const geometry=new THREE.BufferGeometry(),points=[],uvs=[],indices=[],size=outline.length;
        const vertex=(x,y,z)=>{points.push(x,y,z);uvs.push(.5+x,.5+y*.90);};
        for(const [scale,z] of levels)for(const {x,y} of outline)vertex(x*scale,y*scale,z);
        const back=points.length/3;
        vertex(0,0,.055);vertex(0,0,-.151);
        for(let i=0;i<size;i++)indices.push(back,i,(i+1)%size);
        geometry.addGroup(0,indices.length,0);
        for(let band=0;band<levels.length-1;band++){
          const start=indices.length;
          for(let i=0;i<size;i++){
            const a=band*size+i,b=a+size,c=band*size+(i+1)%size,d=c+size;
            indices.push(a,b,c,c,b,d);
          }
          geometry.addGroup(start,indices.length-start,levels[band][2]);
        }
        const start=indices.length,last=(levels.length-1)*size;
        for(let i=0;i<size;i++)indices.push(last+i,back+1,last+(i+1)%size);
        geometry.addGroup(start,indices.length-start,0);
        geometry.setAttribute("position",new THREE.Float32BufferAttribute(points,3));
        geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
        geometry.setIndex(indices);geometry.computeVertexNormals();
        shieldShapes.set("bronze:buckler",geometry);
        shieldShapes.set("bronze:rounded",new THREE.SphereGeometry(.5,24,14));
      }
      const body=mesh(root,shieldShapes.get("bronze:buckler"),materials,[0,0,0],[1,1,1]);
      body.name="Chapa convexa de bronze escovado";
      const round=shieldShapes.get("bronze:rounded");
      mesh(root,torus,groove,[0,.009,-.144],[.147,.147,.26]);
      mesh(root,torus,rim,[0,.009,-.153],[.127,.127,.25]);
      mesh(root,round,boss,[0,.009,-.150],[.241,.241,.145]).name="Umbão de bronze polido";
      for(const side of [-1,1]){
        for(const [x,y,z] of [[.224,.348,-.056],[.292,.215,-.056],[.290,.033,-.058],
          [.251,-.173,-.057],[.172,-.328,-.054]]){
          mesh(root,round,rim,[x*side,y,z-.012],[.042,.042,.034]);
        }
        bevel(root,leather,[side*.136,.017,.085],[.050,.30,.080],[0,0,side*.15]);
        for(const y of [-.12,.145])bevel(root,rim,[side*.136,y,.069],[.072,.043,.038]);
      }
      mesh(root,round,rim,[0,-.437,-.057],[.041,.041,.034]);
      bar(root,leather,[-.124,.016,.122],[.124,.016,.122],.047);
    }
    function shield(root,s,view){
      if(s.shape==="sacred"){sacredShield(root,view);return}
      if(!shieldShapes.has(s.shape)){
        const path=new THREE.Shape();
        if(s.shape==="oval"||s.shape==="mirror")path.absellipse(0,0,.315,.46,0,Math.PI*2);
        else if(s.shape==="heater"){
          const form=[[0,-.53],[.25,-.34],[.33,.08],[.31,.43],[.18,.48],[0,.45],[-.18,.48],[-.31,.43],[-.33,.08],[-.25,-.34]];
          path.moveTo(...form[0]);for(const pt of form.slice(1))path.lineTo(...pt);path.closePath();
        }else{
          const form=s.shape==="tower"?[[-.28,-.53],[.28,-.53],[.343,-.44],[.343,.44],[.260,.53],[-.260,.53],[-.343,.44],[-.343,-.44]]:
            [[0,-.55],[.28,-.35],[.37,.11],[.33,.38],[.18,.48],[0,.40],[-.18,.48],[-.33,.38],[-.37,.11],[-.28,-.35]];
          path.moveTo(...form[0]);for(const pt of form.slice(1))path.lineTo(...pt);path.closePath();
        }
        const smooth=s.shape==="mirror"||s.shape==="oval";
        shieldShapes.set(s.shape,new THREE.ExtrudeGeometry(path,{
          depth:.068,bevelEnabled:true,bevelThickness:.028,bevelSize:.033,
          bevelSegments:smooth?3:2,curveSegments:smooth?28:8
        }));
      }
      const geo=shieldShapes.get(s.shape);
      const isWood=s.shape==="oval";
      const plate=alloyMat("shield-"+s.shape,s.color,isWood?.20:s.shape==="dragon"?.70:.76,isWood?.46:s.shape==="mirror"?.16:.24);
      const rim=alloyMat("rim-"+s.shape,s.trim,s.shape==="mirror"?.88:.82,s.shape==="mirror"?.14:.20);
      const shadowChannel=alloyMat("shield-ch-"+s.shape,0x111a22,.52,.58);
      const glint=alloyMat("shield-glint-"+s.shape,0xeef9ff,.88,.12);
      mesh(root,geo,rim,[0,0,-.002],[1,1,1]);
      mesh(root,geo,shadowChannel,[0,0,-.020],[.925,.942,1.02]);
      mesh(root,geo,plate,[0,0,-.034],[.865,.895,1.01]);
      for(const side of [-1,1]){
        for(const y of [-.29,.28]){
          mesh(root,globe,rim,[side*.205,y,-.064],[.041,.039,.028],[0,0,Math.PI/4]);
          mesh(root,globe,glint,[side*.205,y,-.079],[.015,.015,.012],[0,0,Math.PI/4]);
        }
        bevel(root,leather,[side*.147,.018,.139],[.048,.285,.092],[0,0,side*.14]);
        bevel(root,brass,[side*.147,.115,.152],[.062,.038,.032],[0,0,side*.14]);
        if(s.shape==="tower"){
          for(const x of [.105,.218])bevel(root,rim,[side*x,.005,-.072],[.025,.84,.046]);
          for(const y of [-.38,0,.38])mesh(root,globe,glint,[side*.272,y,-.056],[.022,.022,.018]);
        }else if(s.shape==="dragon"){
          for(const y of [-.235,.225]){
            mesh(root,globe,rim,[side*.238,y,-.078],[.032,.042,.028]);
            mesh(root,globe,glowGemMat("dr-rivet",0xff9f45,0xff6b22,1.05,.90),[side*.238,y,-.095],[.014,.020,.014]);
          }
          bar(root,rim,[side*.29,.35,-.045],[side*.18,.44,-.062],.032,.028);
        }else if(s.shape==="heater"){
          bar(root,rim,[side*.255,.355,-.055],[side*.195,-.265,-.055],.022,.020);
          mesh(root,globe,glint,[side*.255,.355,-.068],[.022,.022,.016]);
        }else if(s.shape!=="mirror"){
          bevel(root,alloyMat("oak-rib",0x875d39,.22,.50),[side*.105,-.004,-.065],[.029,.70,.034],[0,0,side*.05]);
          bar(root,rim,[side*.215,.30,-.062],[side*.255,0,-.056],.020,.018);
          bar(root,rim,[side*.255,0,-.056],[side*.215,-.30,-.062],.020,.018);
        }
      }
      if(s.shape==="dragon")dragonShieldFace(root,rim);
      else if(s.shape==="mirror")mirrorFace(root,rim);
      else if(s.shape==="corrupted"){
        const eyeGlow=glowGemMat("corrupt-shield-eye",0xffd4a2,0xff62dc,1.35,.95);
        const pupil=alloyMat("corrupt-shield-pupil",0x09040e,.2,.3);
        const fangMat=alloyMat("corrupt-shield-fang",0xd8ccb4,.18,.48);
        const fleshy=alloyMat("corrupt-shield-lid",0x53194f,.3,.65,0x350b3a,.28);
        mesh(root,torus,fleshy,[0,.02,-.075],[.175,.21,.16]);
        mesh(root,globe,eyeGlow,[0,.02,-.095],[.14,.17,.065]);
        mesh(root,globe,pupil,[0,.02,-.145],[.034,.145,.028]);
        glowHalo(root,root,0xd966ff,[0,.02,-.165],.62,.62);
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4;
          mesh(root,globe,fangMat,[Math.cos(a)*.255,Math.sin(a)*.33,-.075],[.036,.075,.034],[0,0,a-Math.PI/2]);
        }
      }else if(s.shape==="tower"){
        const runeGlow=glowGemMat("tower-rune",0x7ce8ff,0x34b7e8,1.05,.86);
        const visorGlass=glassMat("tower-visor",0xaef2ff,.36,.07,0x3ca8d4,.45);
        bevel(root,rim,[0,.01,-.074],[.064,.82,.044]);
        bevel(root,runeGlow,[0,.01,-.094],[.024,.64,.016]);
        bevel(root,shadowChannel,[0,.30,-.074],[.27,.082,.040]);
        bevel(root,visorGlass,[0,.30,-.094],[.22,.046,.014]);
        mesh(root,cyl,rim,[0,-.02,-.086],[.185,.074,.185],[Math.PI/2,0,0]);
        mesh(root,globe,runeGlow,[0,-.02,-.122],[.064,.095,.030]);
        glowHalo(root,root,0x5fdcff,[0,-.02,-.145],.44,.52);
        glowHalo(root,root,0x7ce8ff,[0,.30,-.118],.32,.36);
      }else if(s.shape==="heater"){
        const sapph=glowGemMat("heater-gem",0x6fd8ff,0x2fa8f0,1.0,.86);
        const dome=glassMat("heater-dome",0xd8f8ff,.30,.05,0x6fd8ff,.30);
        bevel(root,rim,[0,.02,-.068],[.046,.76,.032]);
        bevel(root,rim,[0,.06,-.068],[.44,.046,.032]);
        mesh(root,cyl,shadowChannel,[0,.06,-.082],[.22,.056,.22],[Math.PI/2,0,0]);
        mesh(root,cyl,rim,[0,.06,-.088],[.195,.066,.195],[Math.PI/2,0,0]);
        mesh(root,globe,sapph,[0,.06,-.122],[.068,.082,.038],[0,0,Math.PI/4]);
        mesh(root,globe,dome,[0,.06,-.128],[.092,.106,.048],[0,0,Math.PI/4]);
        glowHalo(root,root,0x59d2ff,[0,.06,-.156],.44,.54);
      }else{
        const amber=glowGemMat("oval-gem",0xffcf6e,0xf09224,1.0,.88);
        const glaze=glassMat("oval-glaze",0xfff0c8,.28,.06,0xffbd4f,.24);
        mesh(root,cyl,shadowChannel,[0,0,-.076],[.295,.058,.295],[Math.PI/2,0,0]);
        mesh(root,cyl,rim,[0,0,-.084],[.265,.080,.265],[Math.PI/2,0,0]);
        mesh(root,torus,glint,[0,0,-.118],[.118,.118,.12]);
        mesh(root,globe,amber,[0,0,-.124],[.078,.094,.040],[0,0,Math.PI/4]);
        mesh(root,globe,glaze,[0,0,-.130],[.104,.118,.048],[0,0,Math.PI/4]);
        glowHalo(root,root,0xffbe54,[0,0,-.162],.48,.52);
      }
      bar(root,leather,[-.130,.015,.153],[.130,.015,.153],.060);
    }
    const mirrorGeometry=new THREE.CircleGeometry(1,48);
    const mirrorEdgeGeometry=new THREE.TorusGeometry(1,.034,10,48);
    const mirrorMaterial=new THREE.ShaderMaterial({
      uniforms:{mirrorTime:{value:0}},
      vertexShader:`varying vec3 normalInView,looking;varying vec2 facet;
        void main(){facet=uv*2.-1.;vec4 view=modelViewMatrix*vec4(position,1.);
          normalInView=normalMatrix*normal;looking=-view.xyz;gl_Position=projectionMatrix*view;}`,
      fragmentShader:`uniform float mirrorTime;varying vec3 normalInView,looking;varying vec2 facet;
        void main(){
          vec3 N=normalize(normalInView),V=normalize(looking);
          vec3 ray=reflect(-V,N);
          float fresnel=pow(1.-clamp(abs(dot(N,V)),0.,1.),2.4);
          float sweep=sin(mirrorTime*1.9)*.34;
          float diagonal=facet.x*.72+facet.y*.48+ray.x*.39+sweep;
          float band=smoothstep(.02,.15,diagonal)*(1.-smoothstep(.19,.36,diagonal));
          float glint=smoothstep(.34,.42,diagonal+.26)*(1.-smoothstep(.44,.52,diagonal+.26));
          float horizon=smoothstep(-.55,.82,facet.y+ray.y*.85);
          float rim=smoothstep(.64,1.,length(facet));
          vec3 color=mix(vec3(.22,.44,.56),vec3(.76,.93,.98),horizon);
          color=mix(color,vec3(.96,1.,1.),band*.88+glint*.55);
          color+=vec3(.52,.94,1.)*fresnel*.58;
          gl_FragColor=vec4(color-rim*.08,1.);
        }`
    });
    function mirrorFace(root,rim){
      const silver=alloyMat("mirror-silver",0xeef8ff,.92,.10);
      const lensGlass=glassMat("mirror-lens",0xc8f6ff,.24,.04,0x7ce6ff,.28);
      const mirrorGem=glowGemMat("mirror-gem",0xa8fbff,0x52e0ff,1.15,.88);
      mesh(root,mirrorGeometry,mirrorMaterial,[0,0,-.068],[.268,.392,1],[0,Math.PI,0]).name="Espelho polido";
      mesh(root,mirrorGeometry,lensGlass,[0,0,-.084],[.265,.388,1],[0,Math.PI,0]).name="Cristal refletor";
      mesh(root,mirrorEdgeGeometry,silver,[0,0,-.078],[.274,.404,.52]);
      mesh(root,mirrorEdgeGeometry,rim,[0,0,-.086],[.292,.425,.38]);
      for(const side of [-1,1]){
        mesh(root,globe,rim,[0,side*.415,-.080],[.050,.044,.024],[0,0,Math.PI/4]);
        mesh(root,globe,mirrorGem,[0,side*.415,-.098],[.024,.028,.016],[0,0,Math.PI/4]);
        glowHalo(root,root,0x8ef5ff,[0,side*.415,-.115],.28,.55);
        mesh(root,globe,silver,[side*.285,0,-.078],[.030,.042,.020],[0,0,Math.PI/4]);
        mesh(root,globe,mirrorGem,[side*.285,0,-.094],[.015,.022,.012],[0,0,Math.PI/4]);
      }
      glowHalo(root,root,0xb8fbff,[0,.08,-.115],.62,.30);
    }
    function dragonShieldFace(root,rim){
      function relief(key,points,material,z,mirror=1){
        if(!shieldShapes.has(key)){
          const shape=new THREE.Shape();
          shape.moveTo(...points[0]);for(const p of points.slice(1))shape.lineTo(...p);shape.closePath();
          shieldShapes.set(key,new THREE.ExtrudeGeometry(shape,{depth:.038,bevelSize:.013,bevelThickness:.013,bevelSegments:2}));
        }
        return mesh(root,shieldShapes.get(key),material,[0,0,z],[mirror,1,1]);
      }
      const bronze=alloyMat("dragon-relief",0xb47d47,.76,.26);
      const gold=alloyMat("dragon-gold",0xe8c474,.86,.18);
      const dragonEye=glowGemMat("dragon-eye",0x7fffe8,0x2cf2d2,1.35,.92);
      const wardGem=glowGemMat("dragon-ward-gem",0xffb657,0xff6e21,1.25,.88);
      const wardVeil=glassMat("dragon-ward-veil",0x5ff0dc,.16,.08,0x32d4c2,.55);
      relief("dragon-head",[[0,.225],[.145,.201],[.191,.105],[.155,-.043],[.125,-.096],
        [.092,-.229],[0,-.267],[-.092,-.229],[-.125,-.096],[-.155,-.043],[-.191,.105],[-.145,.201]],bronze,-.119);
      for(const side of [-1,1]){
        relief("dragon-horn",[[.108,.163],[.154,.249],[.206,.302],[.240,.391],[.249,.283],[.225,.198],[.160,.123]],gold,-.126,side);
        relief("dragon-cheek",[[.095,.138],[.182,.131],[.205,.053],[.147,.031],[.168,-.073],
          [.104,-.137],[.063,-.077],[.052,.075]],rim,-.149,side);
        const eye=bevel(root,dark,[side*.111,.071,-.152],[.087,.044,.025],[0,0,-side*.37]);
        eye.name="Olho do dragão";
        mesh(root,globe,dragonEye,[side*.108,.073,-.172],[.041,.016,.018],[0,0,-side*.37]);
        glowHalo(root,root,0x55ffe4,[side*.108,.073,-.192],.24,.66);
        bevel(root,gold,[side*.103,.110,-.170],[.107,.025,.032],[0,0,-side*.28]);
        mesh(root,globe,edge,[side*.077,-.175,-.221],[.022,.066,.024],[0,0,-side*.17]);
      }
      bevel(root,bronze,[0,-.124,-.171],[.180,.173,.093]);
      bevel(root,gold,[0,-.106,-.212],[.144,.092,.032]);
      for(const side of [-1,1])bevel(root,dark,[side*.040,-.109,-.231],[.032,.016,.015],[0,0,side*.27]);
      bevel(root,dark,[0,-.181,-.209],[.113,.018,.018]);
      mesh(root,globe,wardGem,[0,.168,-.156],[.040,.064,.028],[0,0,Math.PI*.1]);
      glowHalo(root,root,0xffa842,[0,.168,-.186],.34,.64);
      mesh(root,shieldShapes.get("dragon"),wardVeil,[0,0,-.110],[.82,.85,.22]).name="Aura antidragão";
    }

    function capeShape(wizard,s,t){
      const edge=Math.abs(s),wave=Math.cos(s*Math.PI*3.1);
      return [s*(.241+t*.153),-t*(wizard?.86-edge*.14:.69+edge*.049),.038+t*.102+wave*(.011+t*.026)+s*s*.061];
    }
    function capeSurface(parent,gear,wizard){
      const key=gear.shape+":"+gear.color;
      if(!capeModels.has(key)){
        const vertices=[],indices=[],columns=12,rows=8;
        for(let row=0;row<=rows;row++)for(let col=0;col<=columns;col++){
          vertices.push(...capeShape(wizard,2*col/columns-1,row/rows));
          if(row===rows||col===columns)continue;
          const index=row*(columns+1)+col,next=index+columns+1;
          indices.push(index,next,index+1,index+1,next,next+1);
        }
        const geometry=new THREE.BufferGeometry();
        geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
        geometry.setIndex(indices);geometry.computeVertexNormals();
        const material=gear.finish==="corrupted"
          ?new THREE.MeshStandardMaterial({color:gear.color,emissive:0x360d54,emissiveIntensity:.35,roughness:.85,side:THREE.DoubleSide})
          :gear.finish==="light"
            ?new THREE.MeshStandardMaterial({color:gear.color,emissive:0xffd86b,emissiveIntensity:.32,roughness:.42,metalness:.25,side:THREE.DoubleSide})
            :new THREE.MeshStandardMaterial({color:gear.color,roughness:.94,side:THREE.DoubleSide});
        capeModels.set(key,{geometry,material});
      }
      const {geometry,material}=capeModels.get(key);
      mesh(parent,geometry,material,[0,0,0],[1,1,1]);
    }
    function spectralFinish(color,light,strength,opacity=1){
      const key="spectral:"+color+":"+light+":"+strength+":"+opacity;
      if(!materialCache.has(key)){
        const translucent=opacity<1;
        const material=new THREE.MeshStandardMaterial({color,metalness:.18,roughness:.38,
          transparent:translucent,opacity});
        const emission=new THREE.Color(light).lerp(new THREE.Color(0x26c4d8),.57);
        QuimiCraftSpectral.glow(THREE,material,emission,strength,translucent);
        materialCache.set(key,material);
      }
      return materialCache.get(key);
    }
    function apparelMaterials(gear){
      const {color,trim,finish}=gear;
      if(finish==="spectral"){
        return [spectralFinish(color,trim,.31,.56),spectralFinish(trim,trim,.78)];
      }
      if(finish==="corrupted"){
        return [
          alloyMat("corrupt-armor",0x1a0a29,.52,.38,0x260940,.28),
          glowGemMat("corrupt-trim",0xcf56ff,0x9e24e8,.92,.96)
        ];
      }
      if(finish==="light"){
        return [
          alloyMat("light-armor",color,.62,.24,0x8f6b1e,.20),
          glowGemMat("light-trim",trim,0xffdf75,1.05,.96)
        ];
      }
      if(finish!=="metal")return [tint("apparel",color),tint("apparel-trim",trim)];
      return [color,trim].map(swatch=>{
        const key="apparel-metal:"+swatch;
        if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({
          color:swatch,metalness:.56,roughness:.36
        }));
        return materialCache.get(key);
      });
    }
    function dragonLeatherScales(parent,x,y,z,columns,rows,width,height){
      const shade=tint("dragonhide",0x855760),light=tint("dragonhide",0xb17973);
      for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
        const offset=column-(columns-1)/2+(row%2?.22:-.22);
        mesh(parent,globe,(row+column)%3===0?light:shade,[x+offset*width,y-row*height,z+offset**2*.006],
          [width*.65,height*.79,.022],[.13,0,0]);
      }
    }
    function apparelLeg(thigh,shin,gear,side){
      const [fabric,trim]=apparelMaterials(gear);
      const plated=gear.finish==="metal"||gear.finish==="corrupted",scaled=gear.finish==="dragon";
      bevel(thigh,plated?leather:fabric,[0,-.173,0],[.279,.412,.285]);
      bevel(shin,plated?leather:fabric,[0,-.103,.004],[.236,.256,.241]);
      if(plated){
        for(let i=0;i<3;i++){
          const y=-.084-i*.089;
          bevel(thigh,fabric,[0,y,-.129],[.273-i*.012,.115,.125],[.10,side*.06,side*.06]);
          for(const x of [-.088,.088])mesh(thigh,globe,trim,[x,y+.016,-.194],[.015,.015,.009]);
        }
        bevel(shin,fabric,[0,-.026,-.12],[.241,.162,.133],[.06,0,0]);
        bevel(shin,trim,[0,-.037,-.185],[.071,.083,.030],[0,0,.68]);
        bevel(shin,fabric,[0,-.143,-.099],[.178,.157,.079]);
      }else if(scaled){
        dragonLeatherScales(thigh,0,-.090,-.156,4,4,.052,.064);
        dragonLeatherScales(shin,0,-.058,-.134,3,3,.047,.048);
      }else{
        const mage=gear.shape==="mageLegs";
        bar(thigh,trim,[side*.097,-.019,-.127],[side*.117,-.34,-.104],mage?.022:.013,.029);
        bevel(shin,trim,[0,-.096,-.002],[.242,.044,.254],[0,0,side*.085]);
        if(mage)mesh(shin,globe,crystal,[0,-.098,-.137],[.036,.050,.016]);
        else bevel(thigh,leather,[side*.129,-.172,-.026],[.059,.155,.156],[0,0,side*.13]);
      }
    }
    function apparelBoot(root,gear,side){
      const [fabric,trim]=apparelMaterials(gear);
      const plated=gear.finish==="metal"||gear.finish==="corrupted",scaled=gear.finish==="dragon",mage=gear.shape==="mageBoots";
      bevel(root,dark,[0,-.405,-.057],[.258,.052,.361]);
      bevel(root,plated?leather:fabric,[0,-.310,-.06],[.252,.174,.35]);
      bevel(root,fabric,[0,-.235,.009],[.24,.218,.254],[.08,0,0]);
      bevel(root,trim,[0,-.153,.012],[.253,mage?.055:.035,.258],[.04,0,0]);
      if(plated){
        for(let i=0;i<3;i++)bevel(root,i===2?trim:fabric,[0,-.320-i*.012,-.124-i*.042],
          [.239-i*.009,.071-i*.007,.098],[.17+i*.12,0,0]);
        bevel(root,fabric,[0,-.215,-.105],[.212,.121,.072],[.09,0,0]);
      }else if(scaled){
        dragonLeatherScales(root,0,-.176,-.132,3,3,.049,.043);
        bevel(root,trim,[0,-.343,-.201],[.212,.052,.078],[.26,0,0]);
      }else{
        for(let i=0;i<3;i++)bar(root,mage?trim:thread,[-.075,-.212-i*.036,-.117-i*.012],
          [.073,-.223-i*.036,-.12-i*.012],.018,.017);
        if(mage)mesh(root,globe,crystal,[side*.106,-.160,-.08],[.024,.035,.027]);
        else bevel(root,trim,[side*.119,-.242,-.065],[.036,.072,.079],[0,0,side*.16]);
      }
    }
    const wizardHatGeometry=new Map();
    function wizardHat(root,felt,trim){
      const pieces=[
        ["aba",[[0,.190,.007,.276,.250,0],[0,.151,.013,.490,.404,.033],[0,.178,.009,.502,.412,.033],
          [0,.224,.008,.387,.342,.018],[0,.242,.006,.280,.250,0]],felt],
        ["copa",[[0,.202,0,.284,.246,0],[-.021,.384,.036,.224,.195,.024],
          [-.064,.559,.083,.153,.139,.016],[-.095,.718,.120,.096,.087,.013],
          [-.042,.824,.146,.057,.049,.008],[.080,.871,.159,.024,.025,0],[.130,.855,.153,.002,.002,0]],felt],
        ["faixa",[[0,.216,0,.286,.249,0],[-.005,.254,.009,.279,.243,.007],[-.012,.298,.020,.261,.227,.012]],trim]
      ];
      for(const [name,rings,material] of pieces){
        if(!wizardHatGeometry.has(name)){
          const vertices=[],indices=[],segments=24;
          for(const [r,[x,y,z,rx,rz,wave]] of rings.entries())for(let i=0;i<segments;i++){
            const a=i*Math.PI*2/segments;
            vertices.push(x+Math.cos(a)*rx,y+Math.sin(a*3+.55)*wave,z+Math.sin(a)*rz);
            if(r===rings.length-1)continue;
            const v=r*segments+i,next=r*segments+(i+1)%segments;
            indices.push(v,v+segments,next,next,v+segments,next+segments);
          }
          const geometry=new THREE.BufferGeometry();
          geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);
          geometry.computeVertexNormals();wizardHatGeometry.set(name,geometry);
        }
        mesh(root,wizardHatGeometry.get(name),material,[0,0,0],[1,1,1]).name=name;
      }
      bevel(root,trim,[.064,.253,-.242],[.103,.082,.029],[0,-.19,.21]);
      mesh(root,globe,crystal,[.064,.252,-.266],[.041,.054,.023],[0,-.19,.21]);
      for(const side of [-1,1])for(let i=0;i<3;i++)mesh(root,globe,trim,
        [side*(.073+i*.035),.395+i*.052,-.154+i*.035],[.018,.026,.014],[0,0,.58]);
    }
    function classApparel(root,gear){
      const [fabric,trim]=apparelMaterials(gear);
      const shape=gear.shape;
      if(gear.slot==="legs"){
        bevel(root,fabric,[0,.278,0],[.565,.127,.293]);
        bevel(root,trim,[0,.31,-.015],[.577,.044,.316]);
        for(const side of [-1,1]){
          const thigh=new THREE.Group(),shin=new THREE.Group();
          thigh.position.set(side*.151,.287,0);shin.position.y=-.374;
          root.add(thigh);thigh.add(shin);apparelLeg(thigh,shin,gear,side);
        }
      }else if(gear.slot==="feet"){
        for(const side of [-1,1]){
          const boot=new THREE.Group();boot.position.set(side*.145,.27,side*.032);boot.rotation.y=side*.15;
          root.add(boot);apparelBoot(boot,gear,side);
        }
      }else if(shape==="wizardHat"){
        wizardHat(root,fabric,trim);
      }else if(shape==="circlet"){
        mesh(root,torus,trim,[0,.176,.016],[.284,.238,.38],[Math.PI/2,0,0]);
        mesh(root,globe,crystal,[0,.178,-.246],[.056,.079,.030]);
        for(const side of [-1,1])mesh(root,globe,trim,[side*.087,.174,-.239],[.037,.045,.025]);
      }else if(shape==="hood"||shape==="helm"){
        bevel(root,fabric,[0,.239,.010],[.545,.175,.512]);
        bevel(root,fabric,[0,.057,.190],[.539,.415,.164],[.11,0,0]);
        for(const side of [-1,1]){
          bevel(root,fabric,[side*.256,.054,-.028],[.115,.400,.408],[0,0,-side*.13]);
          bevel(root,trim,[side*.236,.103,-.224],[.049,.195,.059],[0,0,-side*.26]);
        }
        bevel(root,trim,[0,.159,-.257],[.43,.051,.055]);
        if(shape==="helm"){
          bevel(root,metal,[0,.266,-.055],[.085,.184,.313],[-.33,0,0]);
          bevel(root,fabric,[0,-.051,-.257],[.376,.120,.074]);
          bevel(root,trim,[0,.034,-.298],[.066,.162,.042]);
          if(gear.finish==="corrupted"){
            mesh(root,globe,trim,[0,.18,-.292],[.064,.052,.028]);
            mesh(root,globe,dark,[0,.18,-.315],[.018,.044,.014]);
            for(const side of [-1,1])mesh(root,globe,trim,[side*.14,.16,-.276],[.032,.028,.020]);
            glowHalo(root,root,0xd966ff,[0,.18,-.33],.36,.48);
          }
        }
      }else if(gear.slot==="chest"){
        bevel(root,fabric,[0,.002,0],[.577,.654,.348]);
        const plate=shape==="plate"||gear.finish==="metal"||gear.finish==="corrupted",scaled=gear.finish==="dragon",robe=shape==="arcaneRobe";
        for(const side of [-1,1]){
          bevel(root,shape==="plate"&&gear.finish!=="corrupted"?metal:fabric,[side*.236,.193,-.012],[.234,.236,.467],[.07,0,side*.16]);
          bevel(root,trim,[side*.265,.273,-.040],[.214,.047,.406],[.07,0,side*.16]);
          if(gear.finish==="corrupted"){
            mesh(root,globe,trim,[side*.25,.21,-.245],[.046,.046,.024]);
            mesh(root,globe,dark,[side*.25,.21,-.264],[.014,.038,.012]);
          }
          if(plate){
            for(const y of [-.134,.01,.163])bevel(root,fabric,[side*.128,y,-.191],[.261,.155,.080],[.05,side*.08,-side*.071]);
            if(gear.finish==="metal")for(const y of [-.153,-.008,.149]){
              bevel(root,trim,[side*.133,y,-.235],[.206,.025,.029],[.05,side*.08,-side*.071]);
              mesh(root,globe,trim,[side*.221,y+.035,-.236],[.018,.018,.015]);
            }
          }else if(scaled){
            dragonLeatherScales(root,side*.119,.192,-.192,3,5,.073,.081);
            bar(root,trim,[side*.249,.218,-.214],[side*.211,-.243,-.203],.031,.031);
          }else{
            const y=shape==="vestment"||robe?-.249:-.12;
            bar(root,trim,[side*.189,.277,-.201],[side*.099,y,-.207],.033,.022);
            if(robe)for(let i=0;i<3;i++)mesh(root,globe,i===0?crystal:trim,
              [side*(.147-i*.014),.139-i*.143,-.206],[.023,.042,.016],[0,0,side*.17]);
          }
        }
        bevel(root,plate?trim:leather,[0,-.254,-.018],[.59,.090,.385]);
        if(shape==="bufferSuit"){
          bevel(root,metal,[0,.024,-.222],[.394,.46,.123]);
          for(const side of [-1,1]){
            const x=side*.126;
            bevel(root,trim,[x,.196,-.295],[.128,.068,.086]);
            bevel(root,metal,[x,-.144,-.297],[.128,.075,.088]);
            bevel(root,bufferLiquid,[x,.024,-.304],[.078,.264,.076]);
            bar(root,trim,[x,.207,-.31],[side*.228,.264,-.278],.028,.030);
            bar(root,trim,[x,-.151,-.302],[side*.251,-.245,-.202],.032,.032);
          }
          bevel(root,trim,[0,-.243,-.215],[.48,.047,.055]);
          bevel(root,metal,[0,.042,.202],[.41,.47,.108]);
          for(const y of [-.07,.04,.15])bevel(root,trim,[0,y,.267],[.33,.026,.032]);
        }
        if(shape==="jerkin")bar(root,leather,[-.221,.284,-.219],[.213,-.250,-.235],.084,.046);
        mesh(root,globe,shape==="vestment"||robe?crystal:trim,[0,.095,-.249],[gear.finish==="corrupted"?.082:.056,gear.finish==="corrupted"?.096:.073,.028]);
        if(gear.finish==="corrupted"){
          mesh(root,globe,dark,[0,.095,-.272],[.022,.078,.015]);
          glowHalo(root,root,0xe066ff,[0,.095,-.29],.44,.52);
        }
        if(shape==="tunic"||robe||scaled){
          const length=robe?.47:scaled?.21:.25;
          root.userData.hems=[-1,1].map(side=>{
            const panel=new THREE.Group();
            panel.position.set(side*.138,-.251,-.018);root.add(panel);
            bevel(panel,fabric,[side*.018,-length*.5,0],[.281,length+.034,.369],[.018,0,side*.105]);
            bevel(panel,trim,[side*.039,-length+.024,-.016],[.27,.034,.374],[.018,0,side*.105]);
            if(robe)bar(panel,trim,[-side*.102,-.04,-.19],[-side*.075,-length+.044,-.19],.022,.023);
            if(scaled)dragonLeatherScales(panel,side*.014,-.067,-.185,3,2,.068,.061);
            return panel;
          });
        }
      }else if(shape==="earProtectors"){
        for(const side of [-1,1]){
          bevel(root,fabric,[side*.248,-.022,.008],[.079,.192,.162],[0,0,side*.10]);
          bevel(root,trim,[side*.284,-.020,.01],[.036,.159,.131],[0,0,side*.10]);
          bar(root,fabric,[side*.283,.013,.009],[side*.219,.208,.012],.028);
          bar(root,fabric,[side*.219,.208,.012],[side*.114,.291,.012],.028);
          bar(root,trim,[side*.114,.291,.012],[0,.307,.012],.026);
        }
      }else if(shape==="quiver"){
        const caseRoot=new THREE.Group();
        caseRoot.position.set(.056,-.052,.289);caseRoot.rotation.z=-.34;root.add(caseRoot);
        mesh(caseRoot,cyl,fabric,[0,0,0],[.224,.578,.183]);
        for(const y of [-.236,.241])mesh(caseRoot,cyl,trim,[0,y,0],[.242,.057,.202]);
        for(let i=0;i<4;i++){
          const x=(i-1.5)*.042,y=.263+(i%2)*.057,z=i%2?.039:-.042;
          bar(caseRoot,wood,[x,.100,z],[x,y+.270,z],.014);
          bevel(caseRoot,i%2?thread:trim,[x,y+.212,z],[.052,.137,.021],[0,0,-.12]);
        }
        bar(root,leather,[.207,.278,-.206],[-.193,-.272,-.197],.043,.025);
      }else if(shape==="backpack"){
        // Sculpted 3D Explorer Backpack with leather straps, brass buckles, bedroll & side pouches!
        const pack=new THREE.Group();
        pack.position.set(0,-.02,.27);root.add(pack);
        const packMat=alloyMat("explorer-pack",gear.color,.18,.68);
        const strapMat=alloyMat("explorer-strap",0x4a301e,.16,.74);
        const rollMat=alloyMat("explorer-roll",0xb89f72,.10,.84);
        bevel(pack,packMat,[0,0,0],[.46,.52,.24]);
        bevel(pack,strapMat,[0,.21,.02],[.48,.11,.26]); // Top leather flap
        bevel(pack,packMat,[0,-.10,.13],[.36,.24,.08]); // Front pocket
        for(const s of [-1,1]){
          bevel(pack,packMat,[s*.26,-.06,.01],[.10,.26,.16]); // Side expansion pouches
          bevel(pack,brass,[s*.13,.09,.15],[.055,.065,.028]); // Brass buckles
          bar(pack,strapMat,[s*.13,.24,.14],[s*.13,-.16,.14],.034,.018);
          // Shoulder straps wrapping around torso
          bar(root,strapMat,[s*.17,.26,.18],[s*.17,.26,-.20],.042,.020);
          bar(root,strapMat,[s*.17,.26,-.20],[s*.17,-.22,-.20],.042,.018);
        }
        // Bedroll strapped on top
        mesh(pack,cyl,rollMat,[0,.32,-.02],[.11,.46,.11],[0,0,Math.PI/2]);
        for(const s of [-1,1])mesh(pack,torus,strapMat,[s*.14,.32,-.02],[.118,.118,.04],[0,Math.PI/2,0]);
      }else{
        const cape=new THREE.Group();
        cape.position.set(0,.235,.171);cape.rotation.x=-.12;root.add(cape);root.userData.cloth=cape;
        const wizard=shape==="mageCape";
        capeSurface(cape,gear,wizard);
        const seam=(s,t)=>{
          const p=capeShape(wizard,s,t);
          p[2]+=.013;
          return p;
        };
        for(const side of [-1,1]){
          bevel(root,fabric,[side*.219,.245,.025],[.219,.112,.451],[.065,0,-side*.20]);
          mesh(root,globe,trim,[side*.231,.221,-.202],[.064,.065,.023]);
          for(let i=0;i<6;i++){
            bar(cape,trim,seam(side*i/6,.96),seam(side*(i+1)/6,.96),.022,.011);
            if(i%2===0)bar(cape,trim,seam(side*.98,i/6),seam(side*.98,(i+1)/6),.014,.010);
          }
          for(const [s,t] of [[.35,.32],[.68,.59],[.48,.73]]){
            mesh(cape,globe,trim,seam(s*side,t),wizard?[.016,.021,.006]:[.008,.011,.005]);
          }
        }
        mesh(cape,globe,wizard?crystal:trim,seam(0,.39),[.073,.107,.010]);
      }
      return root;
    }

    function gauntlet(root,w){
      const body=w.spectralWeapon?spectralFinish(w.color,w.trim,.34,.59):w.corrupted?alloyMat("corrupt-glove",w.color,.52,.42,0x3c125c,.30):tint(w.style+"-glove",w.color);
      const trim=w.spectralWeapon?spectralFinish(w.trim,w.trim,.80):w.corrupted?glowGemMat("corrupt-knuckle",w.trim,0xd964ff,1.15,.94):tint(w.style+"-knuckle",w.trim);
      const crystal=["ice","venom","lightning","spectral","void"].includes(w.element);
      bevel(root,leather,[0,.014,.089],[.43,.35,.35]);
      bevel(root,body,[0,.023,-.060],[.472,.374,.41],[.07,0,0]);
      bevel(root,dark,[0,.032,.201],[.468,.39,.104]);
      bevel(root,trim,[0,.183,.112],[.423,.052,.067]);
      bevel(root,body,[.172,-.109,-.049],[.172,.18,.239],[.18,0,.28]);
      for(let i=0;i<4;i++){
        const x=(i-1.5)*.103;
        bevel(root,body,[x,.009,-.263],[.095,.248,.127],[.12,0,0]);
        if(crystal)mesh(root,globe,trim,[x,.127,-.228],[.076,.135,.076],[.23,.42,0]);
        else bevel(root,trim,[x,.041,-.323],[.082,.115,.047],[.09,0,(i-1.5)*.09]);
      }
      if(w.element==="fire"){
        for(const x of [-.145,-.055,.055,.145])bar(root,trim,[x,.18,.088],[x*.63,.21,-.158],.035);
      }else if(w.element==="magma"||w.element==="stone"){
        for(const side of [-1,1]){
          if(w.element==="stone"){
            bevel(root,body,[side*.137,.208,-.074],[.205,.163,.248],[.23,side*.31,side*.18]);
            bevel(root,trim,[side*.144,.283,-.103],[.12,.039,.176],[.28,side*.31,side*.18]);
            continue;
          }
          mesh(root,globe,body,[side*.126,.181,-.04],[.119,.106,.214],[.25,side*.38,.20]);
          bar(root,trim,[side*.025,.202,.131],[side*.135,.212,-.175],.024);
        }
      }else if(w.element==="venom"){
        for(const side of [-1,1]){
          mesh(root,cyl,trim,[side*.158,.187,.061],[.065,.17,.065],[Math.PI/2,0,0]);
          bar(root,trim,[side*.158,.195,-.02],[side*.092,.174,-.218],.024);
        }
      }else if(w.spectralWeapon){
        QuimiCraftSpectral.halo(THREE,root,0x3decce,[0,.145,-.21],.76,.64,.45);
        mesh(root,torus,trim,[0,.221,-.061],[.091,.121,.087],[Math.PI/2,0,0]);
        mesh(root,globe,trim,[0,.232,-.064],[.047,.070,.054],[.18,0,.21]);
        for(const side of [-1,1])bar(root,trim,[side*.19,.146,.15],[side*.108,.174,-.193],.023);
      }else if(w.element==="void"){
        mesh(root,globe,trim,[0,.225,-.055],[.095,.085,.095]);
        mesh(root,globe,dark,[0,.255,-.095],[.025,.072,.042]);
        glowHalo(root,root,0xe266ff,[0,.23,-.12],.48,.58);
        for(const side of [-1,1])bar(root,trim,[side*.19,.146,.15],[side*.108,.18,-.22],.028);
      }else if(w.element==="lightning"){
        const bolt=[[-.08,.222,.114],[.029,.225,-.006],[-.027,.228,-.04],[.092,.231,-.17]];
        for(let i=1;i<bolt.length;i++)bar(root,trim,bolt[i-1],bolt[i],.044);
      }else mesh(root,globe,trim,[0,.196,.016],[.212,.163,.25],[.35,.36,0]);
      root.userData.gloveSparks=Array.from({length:6},(_,i)=>
        mesh(root,globe,trim,[0,0,0],[.018,.025,.018],[i,0,0]));
    }
    function arrow(parent,poisoned=false,silver=false) {
      const root = new THREE.Group();
      root.name = "Flecha";
      parent.add(root);
      bar(root,lightWood,[0,0,-.46],[0,0,.31],.018);
      mesh(root,globe,poisoned?tint("arrow-venom",0xa6e761):silver?tint("arrow-silver",0xe8f6ff):edge,[0,0,-.51],[.042,.047,.09]);
      for (const side of [-1,1]) bevel(root,side<0 ? thread : brass,[side*.031,0,.23],[.054,.02,.14],[0,0,side*.32]);
      return root;
    }
    function bolt(parent,silver=false){
      const shape=arrow(parent,false,silver);
      shape.name="Virote";
      shape.scale.set(1.17,1.17,.64);
      return shape;
    }

    const bladeProfiles=new Map();
    const forgedBlades={
      dagger:{grip:.25,width:.14,guard:.141,fuller:[[.01,.175],[.004,.60]],path:[[0,.805],[-.11,.49],[-.10,.178],[-.048,.15],[.049,.15],[.105,.195],[.106,.49]]},
      longsword:{grip:.36,width:.16,guard:.212,fuller:[[0,.27],[0,1.28]],path:[[0,1.56],[-.082,1.37],[-.12,.33],[-.059,.208],[.059,.208],[.12,.33],[.082,1.37]]},
      greatsword:{grip:.56,width:.20,guard:.31,fuller:[[0,.46],[0,1.74]],path:[[0,2.06],[-.095,1.92],[-.165,.85],[-.20,.61],[-.13,.52],[-.134,.31],[.134,.31],[.13,.52],[.20,.61],[.165,.85],[.095,1.92]]},
      spectralBlade:{grip:.34,width:.19,guard:.25,fuller:[[0,.29],[.018,.68],[-.017,1.13],[.017,1.53]],
        path:[[.03,1.66],[-.089,1.43],[-.097,1.25],[-.148,1.15],[-.091,.98],[-.127,.67],[-.081,.47],[-.095,.24],[.091,.24],[.116,.61],[.084,.86],[.145,1.21],[.082,1.38]]},
      corruptedBlade:{grip:.35,width:.20,guard:.27,fuller:[[0,.28],[-.025,.66],[.032,1.10],[-.014,1.54]],
        path:[[.05,1.72],[-.095,1.48],[-.15,1.24],[-.085,1.06],[-.16,.78],[-.095,.54],[-.11,.24],[.105,.24],[.15,.52],[.09,.74],[.17,1.08],[.11,1.38]]},
      corruptedGreatsword:{grip:.58,width:.24,guard:.36,fuller:[[0,.45],[0,1.20],[0,1.88]],
        path:[[0,2.22],[-.11,1.98],[-.22,1.56],[-.14,1.36],[-.23,.92],[-.18,.62],[-.15,.32],[.15,.32],[.18,.62],[.23,.92],[.14,1.36],[.22,1.56],[.11,1.98]]},
      scimitar:{grip:.33,width:.16,guard:.195,fuller:[[0,.29],[.009,.73],[.082,1.04],[.269,1.33]],path:[[.44,1.53],[.264,1.39],[.113,1.22],[-.008,.99],[-.087,.72],[-.093,.32],[-.059,.205],[.063,.205],[.116,.40],[.135,.76],[.247,1.055],[.404,1.292]]}
    };
    function forgedSword(root,w){
      const {grip:handle,width,guard,path,fuller}=forgedBlades[w.style];
      const body=w.spectralWeapon?spectralFinish(w.color,w.trim,.46,.54):w.corrupted?alloyMat("corrupt-blade",0x1c0b2b,.58,.30,0x2a0845,.28):tint(w.style,w.color);
      const edgeTone=w.spectralWeapon?spectralFinish(w.trim,w.trim,.88):w.corrupted?glowGemMat("corrupt-edge",0xc74fff,0x9b24e8,.88,.95):tint(w.style+"-edge",w.trim);
      const hilt=w.style==="scimitar"?brass:w.corrupted?dark:metal,guardY=handle*.49,two=w.twoHanded;
      grip(root,handle);
      bevel(root,hilt,[0,-handle*.52,0],[width*.98,.10,width*.76],[0,.20,Math.PI*.25]);
      if(two)for(const y of [-.236,-.114,0,.107])bevel(root,metal,[0,y,0],[.122,.033,.115]);
      bevel(root,brass,[0,guardY,0],[width,.08,.133]);
      for(const side of [-1,1]){
        const arc=w.style==="scimitar"?-.083:.050;
        const tip=[side*guard,guardY+arc,0],start=[side*width*.40,guardY+.012,0];
        bar(root,hilt,start,tip,two?.084:.064,.082);
        mesh(root,globe,edgeTone,tip,[.058,.068,.069],[0,0,.29]);
        for(let i=1;i<fuller.length;i++){
          bar(root,dark,[...fuller[i-1],side*.037],[...fuller[i],side*.037],two?.034:.021,.012);
          bar(root,edgeTone,[fuller[i-1][0]+.022,fuller[i-1][1],side*.041],[fuller[i][0]+.022,fuller[i][1],side*.041],.012,.010);
        }
      }
      if(!bladeProfiles.has(w.style)){
        const shape=new THREE.Shape();
        shape.moveTo(...path[0]);for(const point of path.slice(1))shape.lineTo(...point);shape.closePath();
        const depth=two?.059:.042;
        const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.012,bevelSize:.016,bevelSegments:1});
        geo.translate(0,0,-depth/2);
        bladeProfiles.set(w.style,geo);
      }
      mesh(root,bladeProfiles.get(w.style),[body,edgeTone],[0,0,0],[1,1,1]);
      if(w.spectralWeapon)for(const y of [.51,.93,1.36]){
        QuimiCraftSpectral.halo(THREE,root,0x43e8d7,[0,y,-.046],.49,.85,.30);
      }
      if(w.corrupted){
        const eyeGlow=glowGemMat("corrupt-sword-eye",0xffd4a2,0xff62dc,1.35,.95);
        for(const side of [-1,1]){
          mesh(root,globe,eyeGlow,[0,guardY+.12,side*.082],[two?.095:.074,two?.118:.090,.032]);
          mesh(root,globe,dark,[0,guardY+.12,side*.108],[two?.024:.019,two?.095:.072,.015]);
        }
        glowHalo(root,root,0xe266ff,[0,guardY+.12,-.10],two?.62:.48,.62);
      }
      for(const side of [-1,1])mesh(root,globe,two?crystal:edgeTone,[0,guardY,side*.079],[.051,.046,.021],[0,0,.78]);
    }
    function mace(root,w){
      const iron=tint("mace-iron",w.color),accent=tint("mace-band",w.trim);
      grip(root,.37);
      bar(root,dark,[0,-.27,0],[0,.76,0],.108);
      for(const y of [-.24,.20,.52,.74])mesh(root,cyl,accent,[0,y,0],[.142,.051,.142]);
      mesh(root,cyl,iron,[0,.774,0],[.278,.293,.278],[0,Math.PI/8,0]);
      for(let i=0;i<6;i++){
        const arm=new THREE.Group();arm.rotation.y=i*Math.PI/3;root.add(arm);
        bevel(arm,iron,[0,.78,.129],[.093,.257,.162],[.09,0,0]);
        bevel(arm,metal,[0,.825,.198],[.055,.177,.093],[-.26,0,0]);
        mesh(arm,globe,accent,[0,.718,.191],[.044,.044,.034]);
      }
      bevel(root,accent,[0,.969,0],[.093,.112,.093],[0,0,.68]);
    }
    function wand(root,w){
      const tone=tint("wand",w.color),tip=tint("wand-crystal",w.trim);
      grip(root,.22);
      bar(root,wood,[0,-.16,0],[0,.54,-.018],.069);
      bar(root,tone,[0,.11,0],[0,.52,-.022],.046);
      for(let i=0;i<6;i++)mesh(root,torus,i%2?brass:tone,[0,.08+i*.075,-.012],[.045-i*.002,.045-i*.002,.050],[Math.PI/2,.24,i*.26]);
      root.userData.core=mesh(root,globe,tip,[0,.567,-.022],[.079,.119,.08],[.11,.28,.31]);
      root.userData.coreSize=root.userData.core.scale.clone();
    }
    function focus(root,item){
      const corrupted=!!item.corrupted;
      const primary=corrupted?alloyMat("corrupt-focus",item.color,.42,.48,0x3c105c,.32):tint(item.shape,item.color);
      const accent=corrupted?glowGemMat("corrupt-focus-trim",item.trim,0xdf5eff,1.15,.95):tint(item.shape+"-gilt",item.trim);
      if(item.shape==="book"||item.shape==="corruptedBook"||item.shape==="summonBook"){
        const summonB=item.shape==="summonBook";
        const pages=tint(corrupted?"corrupt-pages":summonB?"summon-pages":"parchment",corrupted?"#d6c4dc":summonB?"#daf6f2":"#ece0bb"),ink=tint(corrupted?"corrupt-ink":summonB?"summon-ink":"sigils",corrupted?"#a43de0":summonB?"#209c8a":"#765c64");
        bevel(root,primary,[0,-.15,0],[.627,.095,.477]);
        bevel(root,accent,[0,-.087,0],[.05,.15,.49]);
        if(corrupted){
          mesh(root,globe,glowGemMat("corrupt-book-eye",0xffd4a2,0xff62dc,1.35,.95),[0,.02,0],[.088,.055,.115]);
          mesh(root,globe,dark,[0,.062,0],[.022,.025,.092]);
          glowHalo(root,root,0xe266ff,[0,.08,0],.48,.58);
        }else if(summonB){
          mesh(root,torus,glowGemMat("summon-book-sigil",0x7fffe4,0x44f2d0,1.4,.96),[0,.03,0],[.11,.11,.06],[Math.PI/2,0,0]);
          mesh(root,globe,glowGemMat("summon-book-gem",0xffe885,0xffc842,1.5,.98),[0,.04,0],[.055,.055,.055]);
          glowHalo(root,root,0x5ef8e0,[0,.08,0],.52,.60);
        }
        for(const side of [-1,1]){
          const leaf=new THREE.Group();leaf.position.x=side*.041;leaf.rotation.z=side*.19;root.add(leaf);
          bevel(leaf,primary,[side*.161,-.098,0],[.343,.059,.493]);
          bevel(leaf,pages,[side*.151,-.050,-.003],[.310,.071,.439]);
          for(const [i,z] of [-.164,-.116,-.055,.068,.115,.163].entries()){
            if(side>0&&i>1&&i<4)continue;
            bar(leaf,ink,[side*.077,-.013,z],[side*(.150+Math.sin(z*38)*.018),-.013,z],.009,.006);
            bar(leaf,ink,[side*.172,-.013,z],[side*(i%2?.229:.260),-.013,z],.009,.006);
          }
          if(side>0){
            mesh(leaf,torus,accent,[.169,-.018,.008],[.055,.055,.049],[Math.PI/2,0,0]);
            for(let k=0;k<4;k++){
              const a=k*Math.PI/2,dx=Math.cos(a)*.039,dz=Math.sin(a)*.041;
              bar(leaf,ink,[.169+dx*.48,-.012,.008+dz*.48],[.169+dx*1.12,-.012,.008+dz*1.12],.011,.006);
            }
            bevel(leaf,ink,[.169,-.013,.008],[.024,.009,.024],[0,Math.PI/4,0]);
          }
          for(const z of [-.226,.226])bevel(leaf,accent,[side*.294,-.067,z],[.062,.065,.056]);
        }
        bar(root,primary,[.024,-.028,.019],[.097,-.082,.297],.051,.008);
        root.rotation.x=-.16;
        return;
      }
      if(item.shape==="naaruOrb"){
        const goldLight=alloyMat("naaru-gold",0xf0c858,.86,.18,0x996d1a,.30);
        const coreLight=glowGemMat("naaru-core",0xfff8d6,0xffde70,1.65,.98);
        const cyanShard=glowGemMat("naaru-cyan",0x9bf8ff,0x4ceeff,1.35,.94);
        root.userData.core=mesh(root,globe,coreLight,[0,.06,0],[.15,.22,.14]);
        root.userData.coreSize=root.userData.core.scale.clone();
        for(const s of [-1,1]){
          bevel(root,goldLight,[s*.16,.24,0],[.055,.24,.042],[0,0,-s*.36]);
          bevel(root,cyanShard,[s*.26,.04,0],[.052,.22,.038],[0,0,-s*1.08]);
          bevel(root,goldLight,[s*.14,-.16,0],[.048,.20,.038],[0,0,s*.28]);
        }
        root.userData.rings=[0,1].map(i=>{
          const ring=mesh(root,torus,i?cyanShard:goldLight,[0,.06,0],[.21+i*.06,.21+i*.06,.12]);
          ring.userData.phase=i*Math.PI*.5;
          return ring;
        });
        glowHalo(root,root,0xffe485,[0,.06,-.04],.68,.76);
        return;
      }
      bevel(root,metal,[0,-.233,0],[.226,.083,.225]);
      mesh(root,cyl,accent,[0,-.181,0],[.275,.083,.275]);
      root.userData.core=mesh(root,globe,primary,[0,.067,0],[.272,.296,.274],[.23,.31,.22]);
      root.userData.coreSize=root.userData.core.scale.clone();
      root.userData.rings=[0,1].map(i=>{
        const ring=mesh(root,torus,i?accent:primary,[0,.064,0],[.22+i*.045,.22+i*.045,.239]);
        ring.userData.phase=i*Math.PI*.55;
        return ring;
      });
      for(const side of [-1,1])for(const z of [-1,1]){
        bar(root,brass,[side*.075,-.165,z*.075],[side*.147,-.043,z*.145],.04);
        mesh(root,globe,accent,[side*.15,-.040,z*.148],[.053,.051,.053]);
      }
    }
    function swordVariant(root,w){
      const bronze=w.style==="bronze",body=tint(w.style,w.color),sharpened=tint(w.style+"-trim",w.trim);
      grip(root,.33);
      bevel(root,bronze?brass:dark,[0,-.21,0],[.145,.09,.126]);
      for(const side of [-1,1]){
        bar(root,body,[0,.185,0],[side*(bronze?.182:.235),bronze?.24:.125,0],.075,.119);
        mesh(root,globe,sharpened,[side*(bronze?.172:.237),bronze?.244:.118,0],[.065,.056,.067]);
      }
      if(!bladeProfiles.has(w.style)){
        const shape=new THREE.Shape();
        const path=bronze?[[0,1.03],[-.131,.82],[-.117,.31],[-.074,.22],[.074,.22],[.117,.31],[.131,.82]]:
          [[0,1.32],[-.106,1.09],[-.103,.79],[-.155,.69],[-.122,.30],[-.062,.22],[.071,.22],[.148,.44],[.102,.55],[.143,.82],[.112,1.05]];
        shape.moveTo(...path[0]);for(const point of path.slice(1))shape.lineTo(...point);shape.closePath();
        const geo=new THREE.ExtrudeGeometry(shape,{depth:.042,bevelEnabled:true,bevelThickness:.016,bevelSize:.017,bevelSegments:1});
        geo.translate(0,0,-.021);
        bladeProfiles.set(w.style,geo);
      }
      mesh(root,bladeProfiles.get(w.style),body,[0,0,0],[1,1,1]);
      for(const side of [-1,1]){
        bar(root,sharpened,[0,.29,side*.039],[0,bronze?.90:1.12,side*.039],bronze?.018:.026,.015);
        if(!bronze)for(let i=0;i<3;i++)mesh(root,globe,sharpened,[.045,.44+i*.17,side*.035],[.021,.06,.015],[0,0,-.44]);
      }
    }

    function sword(root) {
      grip(root,.33);
      bevel(root,brass,[0,-.21,0],[.136,.087,.12]);
      bevel(root,brass,[0,.18,0],[.40,.069,.135]);
      for (const side of [-1,1]) bevel(root,metal,[side*.181,.224,0],[.089,.091,.106],[0,0,side*.32]);
      bevel(root,metal,[0,.57,0],[.155,.76,.078]);
      for (const side of [-1,1]) bevel(root,edge,[side*.065,.6,0],[.028,.705,.047]);
      bevel(root,dark,[0,.55,-.043],[.033,.59,.018]);
      mesh(root,globe,edge,[0,.957,0],[.079,.15,.04]);
      bevel(root,crystal,[0,.195,-.079],[.063,.048,.018]);
    }

    function pick(root, tier) {
      const head = tier==="iron" ? metal : tier==="copper" ? brass : stone;
      bar(root,wood,[0,-.41,0],[.05,.56,0],.085);
      grip(root,.32);
      bevel(root,brass,[.04,.47,0],[.14,.12,.14]);
      const profile = [[-.31,.26,0],[-.22,.47,0],[.04,.60,0],[.29,.55,0],[.40,.40,0]];
      for (let i=1;i<profile.length;i++) bar(root,head,profile[i-1],profile[i],.105,.09);
      bevel(root,tier==="iron" ? edge : head,[.399,.395,0],[.075,.15,.073],[0,0,.45]);
    }

    function tint(id, color) {
      const key = id + ":" + color;
      if (!materialCache.has(key)) materialCache.set(key,new THREE.MeshLambertMaterial({color}));
      return materialCache.get(key);
    }

    function item(id, view, liquid) {
      const root = new THREE.Group();
      root.userData.kind = id;
      const first = view === "first";
      const dropped = view === "drop";
      if (typeof id === "number" && blocks[id]?.tex !== undefined) {
        root.add(blockMiniature(id,first ? .485 : dropped ? .28 : .315,view));
        return root;
      }
      const arsenal=globalThis.QuimiCraftArsenal,weapon=arsenal?.weapons[id],guard=arsenal?.shields[id],artifact=arsenal?.focuses[id],
        gear=arsenal?.apparel[id],produce=produceMiniature?.(id);
      if(produce){produce.scale.setScalar(.86);produce.rotation.z=id==="carrot"?-.21:-.10;root.add(produce)}
      else if(id==="folklore_sieve"){
        mesh(root,torus,lightWood,[0,0,0],[.29,.29,.36]);
        for(let i=-3;i<=3;i++){
          const across=i*.061,length=Math.sqrt(.265**2-across**2)*2;
          box(root,thread,[across,0,-.005],[.012,length,.024]);
          box(root,thread,[0,across,.008],[length,.012,.024]);
        }
        box(root,wood,[0,0,.024],[.545,.042,.039]);
        box(root,wood,[0,0,.024],[.042,.545,.039]);
      }
      else if(id==="curupira_knot"){
        const reed=alloyMat("curupira-knot",0x739748,.04,.84);
        mesh(root,torus,reed,[-.10,.04,0],[.14,.23,.65],[.38,0,-.62]);
        mesh(root,torus,reed,[.10,.01,.035],[.14,.22,.65],[-.36,0,.74]);
        box(root,reed,[.035,-.19,0],[.045,.30,.046],[.20,0,.38]);
        box(root,reed,[-.062,-.15,-.022],[.042,.25,.044],[-.30,0,-.68]);
      }
      else if(id==="charcoal"){
        for(const [x,y,z,w] of [[-.12,.015,-.035,.22],[.095,.061,.011,.23],[.04,-.04,-.11,.17]]){
          const lump=bevel(root,dark,[x,y,z],[w,w*.80,w*.86]);
          lump.rotation.set(.24+x,.22-y,.30-z);
        }
      }
      else if (id === "wind_staff") staff(root);
      else if (id === "bow"||weapon?.family==="bow") {bow(root,weapon);root.rotation.y=first?-.62:-.24}
      else if (weapon?.family==="crossbow") {crossbow(root,weapon);root.rotation.y=first?-.14:-.17}
      else if (id === "shield") bronzeShield(root);
      else if (guard) shield(root,guard,view);
      else if (artifact) focus(root,artifact);
      else if (gear){
        classApparel(root,gear);
        if(gear.slot==="back")root.rotation.y=Math.PI;
        if(gear.finish==="spectral")QuimiCraftSpectral.halo(THREE,root,0x39e0cf,[0,.17,-.12],1.11,.93,.29);
        if(gear.finish==="corrupted")glowHalo(root,root,0xd966ff,[0,.14,-.14],.78,.34);
      }
      else if (id==="iron_leggings"){
        classApparel(root,{slot:"legs",color:"#8b9aa3",trim:"#d5e4ec",finish:"metal"});
      }
      else if (id==="iron_helmet"){
        classApparel(root,{slot:"head",shape:"helm",color:"#8d9da6",trim:"#d7e6ed",finish:"metal"});
      }
      else if (id==="iron_chestplate"||id==="chainmail"){
        const mail=id==="chainmail";
        classApparel(root,{slot:"chest",shape:"plate",color:mail?"#96a3aa":"#8b9aa3",trim:mail?"#5d6d76":"#d7e6ed",finish:"metal"});
        if(mail)for(let r=-1;r<=1;r++)for(let c=-2;c<=2;c++){
          mesh(root,torus,edge,[c*.095,r*.14,-.205],[.032,.032,.022]);
        }
      }
      else if (id==="chitin_armor"){
        classApparel(root,{slot:"chest",shape:"tunic",color:"#9a6f49",trim:"#d8b279",finish:"dragon"});
      }
      else if (id==="lab_coat"||id==="chemical_lab_coat"||id==="thermal_coat"||id==="cooling_vest"||id==="radiation_suit"||id==="fire_suit"||id==="diving_suit"||id==="pressure_suit"){
        const suitSpecs={
          lab_coat:{color:"#e9f1ef",trim:"#8ca8ad",shape:"tunic"},
          chemical_lab_coat:{color:"#d2eee7",trim:"#429b8e",shape:"tunic"},
          thermal_coat:{color:"#527699",trim:"#d8e4ef",shape:"tunic"},
          cooling_vest:{color:"#4bb7c6",trim:"#b6f6ff",shape:"vestment"},
          radiation_suit:{color:"#d2c444",trim:"#2b2c22",shape:"tunic"},
          fire_suit:{color:"#a44a39",trim:"#e0b355",shape:"tunic"},
          diving_suit:{color:"#20526b",trim:"#6bd2dd",shape:"vestment"},
          pressure_suit:{color:"#384e60",trim:"#d4a44e",shape:"plate",finish:"metal"}
        };
        const spec=suitSpecs[id];
        classApparel(root,{slot:"chest",...spec});
        if(id==="cooling_vest"){
          const cryo=glowGemMat("cool-tube",0x8df5ff,0x34d2eb,.95,.88);
          for(const x of [-.17,0,.17])mesh(root,cyl,cryo,[x,.03,-.205],[.055,.42,.055]);
        }else if(id==="radiation_suit"){
          bevel(root,dark,[0,.08,-.205],[.17,.17,.035],[0,0,Math.PI/4]);
          mesh(root,globe,tint("rad-mark",0xf2df4a),[0,.08,-.225],[.058,.058,.02]);
        }else if(id==="fire_suit"){
          for(const y of [-.14,.04,.18])bevel(root,brass,[0,y,-.205],[.52,.038,.032]);
        }else if(id==="pressure_suit"||id==="diving_suit"){
          mesh(root,cyl,brass,[0,.10,-.215],[.15,.055,.15],[Math.PI/2,0,0]);
          mesh(root,cyl,glassMat("dive-dial",0xb8f6ff,.55,.06,0x5ce0f0,.35),[0,.10,-.245],[.11,.02,.11],[Math.PI/2,0,0]);
        }else if(id==="lab_coat"||id==="chemical_lab_coat"){
          for(const side of [-1,1])bar(root,tint("coat-lapel",spec.trim),[side*.15,.26,-.19],[side*.04,.04,-.195],.038,.02);
          bevel(root,tint("coat-pocket",spec.trim),[.15,-.06,-.195],[.13,.13,.024]);
        }
      }
      else if (id==="iron_boots"||id==="rubber_boots"||id==="insulated_boots"){
        const bootSpecs={
          iron_boots:{color:"#8f9fa8",trim:"#d7e6ed",finish:"metal"},
          rubber_boots:{color:"#b48a38",trim:"#2d3338",finish:"cloth"},
          insulated_boots:{color:"#455b6f",trim:"#dce8f0",finish:"cloth"}
        };
        classApparel(root,{slot:"feet",...bootSpecs[id]});
      }
      else if (id==="fins"){
        const finMat=tint("fins",0x379990),rimMat=tint("fins-rim",0x1c4a52);
        for(const side of [-1,1]){
          const x=side*.19;
          bevel(root,rimMat,[x,.04,.16],[.17,.14,.24]);
          bevel(root,finMat,[x,-.01,-.18],[.23,.038,.56],[.08,0,0]);
          for(const r of [-.07,0,.07])bevel(root,rimMat,[x+r,.005,-.18],[.025,.046,.52],[.08,0,0]);
        }
      }
      else if (id==="disposable_gloves"||id==="chemical_gloves"||id==="heat_gloves"){
        const gMat=tint(id,itemColor(id)),cuffMat=id==="heat_gloves"?brass:id==="chemical_gloves"?dark:edge;
        for(const side of [-1,1]){
          const g=new THREE.Group();g.position.set(side*.22,-.04,0);g.rotation.set(.18,side*-.18,side*-.12);root.add(g);
          bevel(g,cuffMat,[0,-.22,0],[.21,.11,.13]);
          bevel(g,gMat,[0,-.03,0],[.22,.28,.11]);
          for(let i=0;i<4;i++)bevel(g,gMat,[(i-1.5)*.052,.17+(i===1||i===2?.03:0),0],[.044,.16,.065]);
          bevel(g,gMat,[-side*.13,.01,-.01],[.055,.14,.068],[0,0,side*.65]);
        }
      }
      else if (id==="protective_goggles"||id==="diving_mask"||id==="face_shield"){
        const lens=glassMat("sci-lens",0x9ef2ff,.44,.06,0x48d0e8,.32);
        if(id==="protective_goggles"){
          for(const x of [-.14,.14]){
            mesh(root,torus,metal,[x,.02,-.18],[.11,.085,.12]);
            bevel(root,lens,[x,.02,-.19],[.18,.12,.02]);
          }
          bevel(root,leather,[0,.02,-.18],[.09,.035,.03]);
          mesh(root,torus,leather,[0,.02,.04],[.27,.24,.10],[Math.PI/2,0,0]);
        }else if(id==="diving_mask"){
          bevel(root,dark,[0,.02,-.17],[.46,.24,.10]);
          bevel(root,lens,[0,.03,-.215],[.39,.16,.024]);
          bevel(root,tint("dive-trim",0x4a91a7),[0,-.07,-.21],[.11,.10,.08]);
          mesh(root,torus,dark,[0,.02,.05],[.27,.24,.10],[Math.PI/2,0,0]);
        }else{
          bevel(root,metal,[0,.22,-.04],[.48,.07,.38]);
          bevel(root,lens,[0,-.04,-.22],[.46,.42,.03]);
          for(const side of [-1,1])mesh(root,cyl,brass,[side*.24,.21,-.18],[.055,.04,.055],[0,0,Math.PI/2]);
        }
      }
      else if (id==="respirator_mask"||id==="gas_mask"){
        const full=id==="gas_mask";
        const rubber=alloyMat("mask-rub",full?0x2b3b36:0x3e4c54,.22,.68);
        bevel(root,rubber,[0,full?.02:-.05,-.10],[full?.42:.34,full?.44:.28,.22]);
        mesh(root,cyl,metal,[0,-.11,-.23],[.15,.08,.15],[Math.PI/2,0,0]);
        for(const side of [-1,1]){
          mesh(root,cyl,dark,[side*.20,-.11,-.17],[.14,.13,.14],[Math.PI/2,0,side*.28]);
          mesh(root,torus,brass,[side*.21,-.11,-.23],[.065,.065,.05],[0,0,0]);
        }
        if(full){
          const lens=glassMat("gas-lens",0x9bf0c2,.48,.06,0x45b878,.28);
          for(const side of [-1,1]){
            mesh(root,cyl,metal,[side*.105,.10,-.21],[.14,.04,.14],[Math.PI/2,0,0]);
            mesh(root,cyl,lens,[side*.105,.10,-.23],[.115,.02,.115],[Math.PI/2,0,0]);
          }
        }
        mesh(root,torus,leather,[0,.02,.08],[.24,.22,.08],[Math.PI/2,0,0]);
      }
      else if (id==="snorkel"){
        const tube=tint("snorkel-tube",0xe0704f);
        bar(root,tube,[.08,-.20,0],[.08,.36,0],.075);
        bar(root,dark,[.08,-.20,0],[-.12,-.24,-.06],.075);
        bevel(root,dark,[-.16,-.24,-.08],[.13,.09,.10]);
        bevel(root,brass,[.08,.39,0],[.10,.08,.10]);
        bevel(root,dark,[.08,.06,.05],[.10,.05,.09]);
      }
      else if (id==="oxygen_tank"||id==="reinforced_oxygen_tank"){
        const twin=id==="reinforced_oxygen_tank";
        const tankMat=alloyMat(id,twin?0x4c788e:0x6ea6b3,.74,.26);
        bevel(root,dark,[0,0,.09],[twin?.48:.26,.54,.08]);
        for(const x of twin?[-.13,.13]:[0]){
          mesh(root,cyl,tankMat,[x,-.03,-.04],[.21,.56,.21]);
          mesh(root,globe,tankMat,[x,.25,-.04],[.105,.09,.105]);
          mesh(root,cyl,brass,[x,.35,-.04],[.08,.10,.08]);
          mesh(root,cyl,dark,[x,.39,-.04],[.12,.03,.12]);
          for(const y of [-.16,.14])bevel(root,leather,[x,y,-.02],[.23,.05,.24]);
        }
      }
      else if (id==="sample_case"){
        bevel(root,leather,[0,-.02,0],[.54,.38,.20]);
        bevel(root,brass,[0,.02,-.105],[.55,.04,.025]);
        for(const x of [-.16,.16])bevel(root,brass,[x,.02,-.115],[.06,.08,.03]);
        bar(root,dark,[-.11,.22,0],[.11,.22,0],.04);
        for(const x of [-.11,.11])bar(root,brass,[x,.16,0],[x,.22,0],.032);
      }
      else if (id==="underwater_flashlight"){
        mesh(root,cyl,alloyMat("torch-body",0x344955,.78,.26),[0,-.05,0],[.15,.44,.15]);
        mesh(root,cyl,brass,[0,.20,0],[.22,.12,.22]);
        const beamLens=glowGemMat("torch-lens",0xfff08a,0xffd040,1.4,.95);
        mesh(root,cyl,beamLens,[0,.265,0],[.18,.03,.18]);
        bevel(root,dark,[0,.02,-.085],[.05,.10,.04]);
        glowHalo(root,root,0xffe478,[0,.30,0],.55,.65);
      }
      else if (id==="depth_gauge"){
        mesh(root,cyl,brass,[0,0,0],[.38,.11,.38],[Math.PI/2,0,0]);
        mesh(root,cyl,edge,[0,0,-.05],[.30,.025,.30],[Math.PI/2,0,0]);
        mesh(root,cyl,glassMat("gauge-glass",0xb8f6ff,.36,.05,0x64d8f0,.25),[0,0,-.065],[.31,.02,.31],[Math.PI/2,0,0]);
        bar(root,tint("gauge-needle",0xd94444),[0,0,-.068],[.09,.08,-.068],.018);
        bevel(root,leather,[0,.23,0],[.14,.16,.05]);
        bevel(root,leather,[0,-.23,0],[.14,.16,.05]);
      }
      else if (id==="thermal_blanket"){
        const foil=alloyMat("foil-blanket",0xe2bf65,.88,.16,0x8a6518,.16);
        bevel(root,foil,[0,0,0],[.46,.34,.11],[.12,.18,0]);
        for(const y of [-.08,.08])bevel(root,brass,[0,y,-.058],[.44,.022,.015],[.12,.18,0]);
      }
      else if (id==="old_god_eye"){
        mesh(root,globe,glowGemMat("og-eye-sclera",0xf5e5c4,0xd96bff,.42,1),[0,0,0],[.25,.25,.25]);
        mesh(root,globe,glowGemMat("og-eye-iris",0xff92e0,0xe648d8,1.35,.96),[0,0,-.15],[.15,.15,.11]);
        mesh(root,globe,dark,[0,0,-.23],[.042,.13,.04]);
        glowHalo(root,root,0xe864ff,[0,0,-.22],.62,.62);
      }
      else if (id==="corrupted_ingot"){
        bevel(root,alloyMat("corrupt-ingot",0x462066,.68,.28,0x491470,.38),[0,0,0],[.46,.18,.26],[.12,.35,0]);
        bevel(root,glowGemMat("corrupt-ingot-vein",0xee84ff,0xd452ff,1.2,.95),[0,.03,-.12],[.26,.045,.045],[.12,.35,.18]);
        glowHalo(root,root,0xd666ff,[0,.02,-.15],.44,.42);
      }
      else if (id==="corrupted_shard"){
        mesh(root,globe,glowGemMat("corrupt-shard",0xd66dff,0xb838ff,1.25,.92),[0,.02,0],[.15,.30,.12],[.18,.42,.24]);
        glowHalo(root,root,0xd966ff,[0,.02,-.08],.44,.50);
      }
      else if (id==="dragon_hide"){
        bevel(root,tint("dragonhide",0x593b48),[0,0,0],[.53,.51,.093],[0,0,-.14]);
        dragonLeatherScales(root,0,.163,-.057,5,5,.083,.078);
      }
      else if(id==="fracture_hammer"){
        const forged=alloyMat("fh-steel",0x7e94a3,.82,.20),silver=alloyMat("fh-edge",0xe6f6fc,.88,.14);
        const pulseCore=glowGemMat("fh-core",0x7aeaff,0x2cc8ff,1.25,.88);
        const crystalVeil=glassMat("fh-veil",0x9bf0ff,.30,.08,0x45d6ff,.35);
        bevel(root,wood,[0,-.19,0],[.096,.74,.090]);
        bevel(root,leather,[0,-.37,0],[.120,.26,.116]);
        for(let i=0;i<4;i++)bevel(root,thread,[0,-.45+i*.06,-.055],[.124,.016,.018],[0,0,-.18]);
        bevel(root,brass,[0,-.52,0],[.138,.075,.134]);
        bevel(root,brass,[0,.028,0],[.152,.072,.148]);
        bevel(root,forged,[.02,.18,0],[.48,.25,.23]);
        bevel(root,dark,[.02,.18,0],[.20,.262,.242]);
        bevel(root,silver,[-.24,.18,0],[.135,.27,.242],[0,0,.04]);
        bevel(root,silver,[.265,.18,0],[.082,.235,.215]);
        for(const side of [-1,1]){
          bevel(root,pulseCore,[.02,.18,side*.118],[.28,.040,.024]);
          mesh(root,globe,pulseCore,[.02,.18,side*.128],[.056,.068,.024],[0,0,Math.PI/4]);
          bevel(root,brass,[-.16,.18,side*.118],[.032,.215,.020]);
          bevel(root,brass,[.19,.18,side*.118],[.032,.215,.020]);
        }
        mesh(root,globe,crystalVeil,[-.28,.18,0],[.078,.17,.14]);
        glowHalo(root,root,0x58dcff,[.02,.18,-.15],.46,.56);
        glowHalo(root,root,0x9beeff,[-.27,.18,-.08],.32,.40);
      }
      else if(id==="osmotic_salt"||id==="brine_cold_pack"){
        const cold=id==="brine_cold_pack";
        if(cold){
          const cryoGlass=glassMat("brine-shell",0x79dcff,.60,.10,0x2ea7df,.38);
          const frostCore=glowGemMat("brine-core",0xcff8ff,0x52d8ff,1.25,.90);
          const steelFrame=alloyMat("brine-frame",0x375264,.78,.24);
          bevel(root,cryoGlass,[0,-.02,0],[.32,.38,.17],[0,0,-.06]);
          bevel(root,frostCore,[0,-.03,0],[.22,.26,.095],[0,0,-.06]);
          for(const side of [-1,1]){
            bevel(root,steelFrame,[side*.155,-.02,0],[.038,.39,.185],[0,0,-.06]);
            bevel(root,edge,[side*.155,.14,0],[.046,.044,.195],[0,0,-.06]);
          }
          bevel(root,steelFrame,[.012,.155,0],[.34,.058,.19],[0,0,-.06]);
          bevel(root,brass,[.018,.205,0],[.095,.060,.095],[0,0,-.06]);
          for(const [x,y,z] of [[-.06,-.04,-.095],[.01,.03,-.098],[.07,-.05,-.094]]){
            mesh(root,globe,frostCore,[x,y,z],[.034,.044,.018],[.2,.3,.4]);
          }
          glowHalo(root,root,0x6ae6ff,[0,-.01,-.13],.54,.58);
        }else{
          const pouch=alloyMat("salt-pouch",0x9b7952,.12,.72);
          const saltWindow=glassMat("salt-win",0xe8f9ff,.44,.08,0x8ce8df,.22);
          const saltCrystal=glowGemMat("salt-crys",0xf4fffd,0xa4f0e8,.72,.88);
          bevel(root,pouch,[0,-.03,0],[.32,.36,.165],[0,0,-.07]);
          bevel(root,dark,[.012,.125,0],[.335,.046,.18],[0,0,-.07]);
          bevel(root,brass,[.014,.155,0],[.315,.040,.172],[0,0,-.07]);
          bevel(root,saltWindow,[0,-.035,-.082],[.22,.22,.028],[0,0,-.07]);
          for(const [x,y,s] of [[-.06,-.06,.042],[.01,-.01,.050],[.065,-.055,.040],[-.02,.04,.036],[.045,.045,.034]]){
            bevel(root,saltCrystal,[x,y,-.078],[s,s,s],[.3,.5,.4]);
          }
          for(const [x,z] of [[-.05,.01],[.02,-.02],[.07,.015]])bevel(root,saltCrystal,[x,.195,z],[.044,.052,.044],[.4,.3,.2]);
          glowHalo(root,root,0xbef9f0,[0,.02,-.12],.44,.46);
        }
      }
      else if(id==="copper_ampoule"){
        const glass=glassMat("ampoule-glass",0xdbfcff,.32,.05,0x6aeae0,.22);
        const liquidMat=glowGemMat("ampoule-liq",0x34e2c2,0x19c9a6,1.15,.82);
        const copperCage=alloyMat("ampoule-cu",0xd8834a,.84,.20);
        const bubbleMat=glowGemMat("ampoule-bub",0xd4fff7,0x8affef,1.25,.88);
        mesh(root,cyl,glass,[0,-.085,0],[.25,.29,.25]);
        mesh(root,cyl,liquidMat,[0,-.112,0],[.205,.185,.205]);
        mesh(root,cyl,glass,[0,.105,0],[.124,.135,.124]);
        mesh(root,torus,glass,[0,.165,0],[.072,.072,.065],[Math.PI/2,0,0]);
        mesh(root,cyl,brass,[0,.205,0],[.118,.075,.118]);
        for(const y of [-.215,.048])mesh(root,torus,copperCage,[0,y,0],[.128,.128,.085],[Math.PI/2,0,0]);
        for(let i=0;i<4;i++){
          const a=i*Math.PI/2+Math.PI/4;
          bar(root,copperCage,[Math.cos(a)*.128,-.215,Math.sin(a)*.128],[Math.cos(a)*.128,.048,Math.sin(a)*.128],.020);
        }
        for(const [x,y,z,s] of [[-.04,-.12,-.04,.024],[.045,-.08,.02,.020],[0,-.15,.03,.026],[.01,-.05,-.05,.018]]){
          mesh(root,globe,bubbleMat,[x,y,z],[s,s,s]);
        }
        bevel(root,glassMat("ampoule-spec",0xffffff,.55,.04,0xffffff,.35),[-.085,-.08,-.096],[.018,.18,.014]);
        glowHalo(root,root,0x3ff5d3,[0,-.09,-.08],.56,.62);
      }
      else if(id==="echo_fork"){
        const alloy=alloyMat("echo-alloy",0xc8aff7,.84,.18,0x673db8,.22);
        const silver=alloyMat("echo-tip",0xf1e8ff,.90,.12,0xa284ff,.28);
        const piezo=glowGemMat("echo-piezo",0xd7a8ff,0x9e5bff,1.35,.90);
        const waveMat=glassMat("echo-wave",0xc8a4ff,.38,.08,0xaa7aff,.95);
        bevel(root,wood,[0,-.25,0],[.086,.39,.082]);
        bevel(root,leather,[0,-.31,0],[.102,.18,.098]);
        bevel(root,brass,[0,-.45,0],[.116,.058,.112]);
        bevel(root,brass,[0,-.048,0],[.148,.084,.128]);
        bevel(root,alloy,[0,.056,0],[.235,.108,.096]);
        mesh(root,globe,piezo,[0,.056,-.054],[.054,.074,.034]);
        for(const side of [-1,1]){
          bevel(root,alloy,[side*.112,.222,0],[.068,.355,.074],[0,0,-side*.075]);
          bevel(root,silver,[side*.126,.392,0],[.082,.064,.088]);
        }
        root.userData.waveRings=[0,1,2].map(i=>{
          const ring=mesh(root,torus,waveMat,[0,.24+i*.065,0],[.058+i*.028,.058+i*.028,.042],[Math.PI/2,0,0]);
          ring.userData.phase=i*2.1;
          return ring;
        });
        glowHalo(root,root,0xb884ff,[0,.27,-.04],.54,.62);
        glowHalo(root,root,0xd9b8ff,[0,.056,-.08],.32,.48);
      }
      else if(id==="sealing_cartridge"){
        const glass=glassMat("seal-glass",0xfff1d6,.34,.06,0xffaa42,.22);
        const resin=glowGemMat("seal-resin",0xf2a746,0xd97316,1.05,.86);
        const cap=alloyMat("seal-brass",0xdba554,.84,.22);
        const base=alloyMat("seal-steel",0x4a5d68,.80,.24);
        const sealCrest=alloyMat("seal-crest",0x8f3942,.50,.32,0x5e181f,.35);
        mesh(root,cyl,glass,[0,-.02,0],[.225,.35,.225]);
        mesh(root,cyl,resin,[0,-.03,0],[.185,.28,.185]);
        mesh(root,cyl,cap,[0,.175,0],[.24,.072,.24]);
        mesh(root,cyl,base,[0,-.205,0],[.245,.072,.245]);
        mesh(root,cyl,brass,[0,.24,0],[.095,.072,.095]);
        bar(root,cap,[.128,-.18,0],[.128,.16,0],.024);
        bar(root,cap,[-.128,-.18,0],[-.128,.16,0],.024);
        bevel(root,sealCrest,[0,-.02,-.115],[.112,.132,.028]);
        mesh(root,globe,glowGemMat("seal-gauge",0xffe08a,0xffaa2b,1.2,.92),[0,-.02,-.134],[.036,.042,.016]);
        glowHalo(root,root,0xffb14a,[0,-.02,-.14],.50,.56);
      }
      else if(id==="hunt_badge"){
        const gold=alloyMat("hb-gold",0xe8bc5f,.88,.16);
        const darkMetal=alloyMat("hb-dark",0x24343c,.68,.32);
        const heartGem=glowGemMat("hb-gem",0xffd166,0xff8b24,1.30,.88);
        const gemAura=glassMat("hb-aura",0xffe9a3,.30,.05,0xffb845,.45);
        bevel(root,gold,[0,0,0],[.34,.34,.095],[0,0,Math.PI/4]);
        bevel(root,darkMetal,[0,0,-.042],[.272,.272,.042],[0,0,Math.PI/4]);
        mesh(root,torus,gold,[0,0,-.066],[.126,.126,.11]);
        mesh(root,globe,heartGem,[0,0,-.082],[.096,.132,.038]);
        mesh(root,globe,gemAura,[0,0,-.088],[.122,.156,.048]);
        for(const side of [-1,1]){
          bevel(root,edge,[side*.115,.01,-.070],[.030,.16,.028],[0,0,-side*.45]);
          mesh(root,globe,gold,[side*.195,0,-.048],[.034,.034,.024],[0,0,Math.PI/4]);
          mesh(root,globe,gold,[0,side*.195,-.048],[.034,.034,.024],[0,0,Math.PI/4]);
        }
        glowHalo(root,root,0xffc95c,[0,0,-.12],.62,.70);
      }
      else if(id==="quartz_whetstone"){
        const quartz=glowGemMat("qw-stone",0xd7c2ea,0x9c72c9,.62,.82);
        const cradle=alloyMat("qw-cradle",0x4c5d69,.78,.24);
        const shard=glowGemMat("qw-shard",0xf3e8ff,0xc9a8ff,1.10,.90);
        bevel(root,quartz,[0,-.014,0],[.245,.44,.152],[.16,0,-.34]);
        bevel(root,cradle,[.019,-.01,.068],[.264,.452,.054],[.16,0,-.34]);
        for(const y of [-.14,.14])bevel(root,brass,[.012,y,.032],[.275,.046,.115],[.16,0,-.34]);
        for(const y of [-.10,.015,.11])bevel(root,shard,[0,y,-.085],[.135,.018,.018],[.16,0,-.34]);
        glowHalo(root,root,0xd2b4ff,[0,0,-.11],.46,.46);
      }
      else if(id==="soot_filter"){
        const body=alloyMat("sf-body",0x53626e,.78,.26);
        const glassBand=glassMat("sf-glass",0x7ad4cc,.38,.08,0x2eb39e,.28);
        const statusLed=glowGemMat("sf-led",0x68ffd6,0x25e8b2,1.25,.92);
        mesh(root,cyl,body,[0,-.035,0],[.31,.26,.31]);
        mesh(root,cyl,alloyMat("sf-top",0xc0d4dc,.84,.20),[0,.105,0],[.336,.058,.336]);
        mesh(root,cyl,brass,[0,-.172,0],[.332,.058,.332]);
        mesh(root,cyl,glassBand,[0,.032,0],[.324,.064,.324]);
        for(const x of [-.085,0,.085])bevel(root,dark,[x,-.055,-.152],[.036,.12,.028]);
        bevel(root,statusLed,[0,.032,-.164],[.135,.028,.020]);
        glowHalo(root,root,0x54ffcf,[0,.032,-.19],.38,.52);
      }
      else if(id==="vein_probe"){
        const chassis=alloyMat("vp-body",0x24313a,.74,.28);
        const headMat=alloyMat("vp-head",0x8ea8b5,.84,.20);
        const crystalCore=glowGemMat("vp-crystal",0xd89eff,0xa652ff,1.35,.86);
        const scanRing=glassMat("vp-ring",0xd6b0ff,.46,.06,0xb672ff,.95);
        bevel(root,chassis,[0,-.17,0],[.152,.35,.162]);
        bevel(root,headMat,[0,.055,0],[.215,.165,.172]);
        for(const side of [-1,1]){
          bevel(root,brass,[side*.118,.148,0],[.058,.25,.074],[0,0,-side*.25]);
          mesh(root,globe,edge,[side*.142,.265,0],[.026,.026,.026]);
        }
        root.userData.core=mesh(root,globe,crystalCore,[0,.235,.004],[.118,.182,.105],[0,.3,.22]);
        root.userData.coreSize=root.userData.core.scale.clone();
        root.userData.rings=[mesh(root,torus,scanRing,[0,.235,.004],[.165,.165,.14],[Math.PI/2,.35,0])];
        root.userData.rings[0].userData.phase=.4;
        bevel(root,crystalCore,[0,.049,-.094],[.132,.042,.028]);
        glowHalo(root,root,0xc278ff,[0,.235,-.04],.58,.66);
      }
      else if(id==="refractory_boots"){
        const ceramic=alloyMat("rb-cer",0xc97b52,.22,.22,0x662209,.28);
        const steel=alloyMat("rb-steel",0x667885,.80,.24);
        const ember=glowGemMat("rb-ember",0xff9d42,0xff5912,1.25,.92);
        const glaze=glassMat("rb-glaze",0xffcfb0,.28,.06,0xff8c42,.24);
        for(const side of [-1,1]){
          const x=side*.132;
          bevel(root,steel,[x,.040,.04],[.216,.258,.234]);
          bevel(root,ceramic,[x,-.038,-.048],[.222,.158,.356]);
          bevel(root,glaze,[x,-.035,-.062],[.232,.140,.340]);
          bevel(root,dark,[x,-.130,-.054],[.232,.062,.368]);
          bevel(root,brass,[x,.112,-.044],[.205,.042,.046]);
          bevel(root,ember,[x,-.018,-.226],[.155,.028,.024]);
          glowHalo(root,root,0xff7f2e,[x,-.018,-.25],.28,.48);
        }
      }
      else if (id === "iron_sword") sword(root);
      else if (weapon?.family==="gauntlet") {
        gauntlet(root,weapon);
        if(view==="catalog"){
          const pair=new THREE.Group();
          while(root.children.length)pair.add(root.children[0]);
          root.add(pair);
          pair.position.set(.29,0,0);pair.rotation.y=.22;
          const other=pair.clone();other.position.set(-.29,-.045,.05);other.scale.x=-1;other.rotation.y=-.22;
          root.userData.gloveSparks.push(...other.children.slice(-6));
          root.add(other);
        }
      }
      else if (weapon?.family==="mace") mace(root,weapon);
      else if (weapon?.style==="wand") wand(root,weapon);
      else if (weapon&&forgedBlades[weapon.style]) forgedSword(root,weapon);
      else if (weapon?.family==="staff") staffVariant(root,weapon);
      else if (weapon?.family==="sword") swordVariant(root,weapon);
      else if (id === "arrow"||id==="venom_arrow"||id==="silver_arrow") arrow(root,id==="venom_arrow",id==="silver_arrow");
      else if (id === "bolt"||id==="silver_bolt") bolt(root,id==="silver_bolt");
      else if (String(id).endsWith("_pickaxe")) pick(root,id.split("_")[0]);
      else if (id === "hoe") {
        bar(root,wood,[0,-.42,0],[0,.58,0],.073);
        grip(root,.27);
        bevel(root,brass,[0,.54,0],[.122,.107,.115]);
        bevel(root,metal,[.03,.597,-.139],[.29,.055,.299],[.22,0,0]);
        bevel(root,edge,[.03,.557,-.263],[.276,.039,.052]);
      } else if (id === "fishing_rod"||id === "reinforced_rod") {
        const reinforcement=id==="reinforced_rod";
        grip(root,.34);
        const path=[[0,-.28,.08],[.009,.38,-.21],[.025,.77,-.41],[.042,1.03,-.53]];
        for(let i=1;i<path.length;i++)bar(root,reinforcement&&i>1?metal:i===1?wood:lightWood,path[i-1],path[i],.073/(i*.82));
        const reel=mesh(root,cyl,reinforcement?metal:brass,[.084,.17,-.074],[.146,.063,.146],[0,0,Math.PI/2]);
        root.userData.reel=reel;
        root.userData.rodTip=new THREE.Vector3(...path.at(-1));
        bevel(root,dark,[.116,.166,-.111],[.052,.096,.053]);
        for(const [x,y,z] of path.slice(1))mesh(root,torus,metal,[x,y,z-.014],[.055,.055,.055]);
      }
      else if(id==="pan"){
        grip(root,.26);
        bar(root,metal,[0,.11,0],[0,.38,-.024],.061);
        mesh(root,cyl,dark,[0,.59,-.025],[.41,.079,.37],[.24,0,0]);
        mesh(root,torus,metal,[0,.646,-.034],[.194,.19,.185],[Math.PI/2+.24,0,0]);
        bevel(root,metal,[.12,.57,-.084],[.096,.045,.097]);
      }else if(id==="mallet"){
        grip(root,.27);
        bar(root,wood,[0,-.20,0],[0,.61,0],.073);
        bevel(root,metal,[0,.64,0],[.37,.159,.157],[0,0,.05]);
        for(const side of [-1,1])bevel(root,edge,[side*.168,.636,0],[.088,.182,.178]);
      }else if(id==="glass_tool"){
        grip(root,.27);
        bar(root,metal,[0,.11,0],[0,.61,0],.057);
        for(const side of [-1,1])bar(root,brass,[0,.58,0],[side*.102,.79,-.025],.05);
        mesh(root,globe,crystal,[0,.73,-.025],[.087,.105,.094]);
      }else if(id==="carbon_badge"){
        emblem(root,1,[0,.049,-.033],2.36);
      }else if(/^(raw_|cooked_)/.test(String(id))){
        const fill=tint(id,itemColor(id));
        bevel(root,fill,[0,.045,0],[.29,.154,.107],[.12,0,.28]);
        bevel(root,fill,[-.173,.02,.015],[.103,.105,.081],[0,0,-.31]);
        bevel(root,brass,[.103,.066,-.046],[.09,.095,.029],[0,0,.44]);
      }else if(/stew|porridge/.test(String(id))){
        mesh(root,cyl,dark,[0,0,0],[.34,.139,.34]);
        mesh(root,cyl,tint(id,itemColor(id)),[0,.08,0],[.30,.034,.30]);
        for(const i of [-1,0,1])bevel(root,i===0?brass:lightWood,[i*.068,.103,-i*.041],[.056,.046,.045]);
      }
      else if (id === "stick") bar(root,wood,[-.07,-.24,0],[.07,.39,0],.052);
      else if (/bucket|cup|container|bottle|vial|flask|oxygen_refill|sealed_sample/.test(String(id))) {
        const large = id.includes("bucket");
        const body = large ? metal : tint(id,0x76aca7);
        mesh(root,cyl,body,[0,0,0],[large?.34:.212,large?.31:.324,large?.34:.212]);
        bevel(root,dark,[0,.159,0],[large?.35:.145,.08,large?.35:.145]);
        if (liquid || id.includes("water") || id.includes("lava")) {
          mesh(root,cyl,tint(id,liquid?.color|| (id.includes("lava") ? "#f58f3d" : "#58b5d6")),[0,.201,0],
            [large?.296:.12,.032,large?.296:.12]);
        }
        if (large) {
          const handle = mesh(root,torus,edge,[0,.17,0],[.187,.187,.15]);
          handle.rotation.x = -.44;
        }
      } else if(globalThis.QuimiCraftVehicles?.itemData[id]){
        const vehicleColor=itemColor(id);
        bevel(root,metal,[0,-.025,0],[.37,.32,.24]);
        bevel(root,tint(id,vehicleColor),[0,.045,-.113],[.285,.17,.073]);
        for(const x of [-.122,.122])bevel(root,brass,[x,-.075,-.145],[.035,.028,.027]);
        bevel(root,wood,[0,.154,0],[.16,.054,.096]);
      } else if(globalThis.QuimiCraftAlchemy?.itemData[id]||id==="venom"||id==="petrifying_vial"||id==="medusa_tear"||String(id).startsWith("dragon_saliva_")){
        const liquidColor=itemColor(id);
        const tintGlass=tint("alchemy-glass",0x9fc0c8);
        bevel(root,tintGlass,[0,-.035,0],[.25,.29,.22]);
        if(id!=="potion_vial")bevel(root,tint(id,liquidColor),[0,-.074,-.018],[.215,.19,.216]);
        bevel(root,tintGlass,[0,.12,0],[.12,.16,.13]);
        bevel(root,lightWood,[0,.216,0],[.137,.09,.143]);
        bevel(root,edge,[-.072,.005,-.113],[.027,.13,.014]);
      } else if(/ingot$|plated_iron|tempered_alloy|sodium_metal/.test(String(id))){
        const barMat=alloyMat("ingot-"+id,itemColor(id),.80,.24);
        bevel(root,barMat,[0,-.04,0],[.50,.17,.26],[.08,.34,0]);
        bevel(root,barMat,[0,.055,0],[.38,.09,.19],[.08,.34,0]);
        bevel(root,edge,[0,.10,-.01],[.26,.02,.04],[.08,.34,0]);
      } else if(id==="gold_nugget"){
        const goldMat=alloyMat("gold-nug",0xf4c44e,.90,.16,0x7a4e08,.18);
        for(const [x,y,z,s] of [[0,0,0,.17],[.12,-.05,.04,.12],[-.11,-.04,-.03,.11],[.02,.10,-.02,.10]]){
          mesh(root,globe,goldMat,[x,y,z],[s,s*.88,s*.92],[x*4,y*5,z*3]);
        }
      } else if(id==="death_rune"||id==="lich_sigil"||id==="fel_ember"||id==="fel_sigil"){
        const fel=id.startsWith("fel_");
        const darkMat=alloyMat("rel-dark",fel?0x1f1924:0x1b2738,.62,.36);
        const glowCol=fel?0xa6ff36:0x6ef2ff;
        const gemMat=glowGemMat("rel-"+id,glowCol,glowCol,1.35,.95);
        if(id==="death_rune"||id==="fel_ember"){
          bevel(root,darkMat,[0,0,0],[.32,.44,.11],[.06,.18,0]);
          bevel(root,gemMat,[0,.02,-.06],[.055,.28,.025],[.06,.18,0]);
          bevel(root,gemMat,[0,.08,-.06],[.18,.045,.025],[.06,.18,0]);
          glowHalo(root,root,glowCol,[0,.02,-.10],.54,.58);
        }else{
          mesh(root,torus,darkMat,[0,0,0],[.24,.24,.18]);
          mesh(root,globe,gemMat,[0,0,-.02],[.13,.17,.08]);
          for(const s of [-1,1])bar(root,darkMat,[s*.16,.12,0],[s*.28,.34,0],.055);
          glowHalo(root,root,glowCol,[0,0,-.08],.62,.64);
        }
      } else if(id==="ectoplasm"||id==="wind_essence"){
        const col=id==="ectoplasm"?0x48f2d8:0xa6f4ff;
        const mat=glowGemMat("ess-"+id,col,col,1.35,.78);
        root.userData.core=mesh(root,globe,mat,[0,.02,0],[.20,.26,.20],[.2,.4,.1]);
        root.userData.coreSize=root.userData.core.scale.clone();
        root.userData.rings=[0,1].map(i=>{
          const ring=mesh(root,torus,mat,[0,.02,0],[.27+i*.06,.27+i*.06,.10]);
          ring.userData.phase=i*1.8;return ring;
        });
        glowHalo(root,root,col,[0,.02,0],.68,.65);
      } else if(/crystal|aquamarine|quartz|nodule|lumen|draconic_/.test(String(id))){
        const col=itemColor(id),bright=/lumen|frost|ember|crystal|resonant|draconic_/.test(String(id));
        const mat=glowGemMat("crys-"+id,col,col,bright?.95:.35,.90);
        mesh(root,globe,mat,[0,.06,0],[.13,.30,.12],[.08,.25,.05]);
        mesh(root,globe,mat,[.11,-.04,.04],[.09,.22,.09],[.12,.1,-.38]);
        mesh(root,globe,mat,[-.11,-.05,-.03],[.085,.20,.085],[-.18,.4,.36]);
        bevel(root,dark,[0,-.18,0],[.28,.09,.24]);
        if(bright)glowHalo(root,root,new THREE.Color(col).getHex(),[0,.08,-.05],.52,.48);
      } else if(id==="copper_core"||id==="voltaic_cell"||id==="catalyst"){
        const cMat=alloyMat("coil-"+id,itemColor(id),.82,.22);
        if(id==="voltaic_cell"){
          mesh(root,cyl,glassMat("volt-gl",0xc8f4ff,.36,.06,0x58e2f0,.25),[0,-.02,0],[.30,.36,.30]);
          mesh(root,cyl,glowGemMat("volt-el",0x4ce8d8,0x25c8b8,1.0,.82),[0,-.06,0],[.25,.24,.25]);
          bar(root,brass,[-.06,-.12,0],[-.06,.26,0],.04);
          bar(root,metal,[.06,-.12,0],[.06,.26,0],.04);
          mesh(root,cyl,dark,[0,.17,0],[.31,.05,.31]);
          glowHalo(root,root,0x52f2e0,[0,-.02,-.08],.48,.48);
        }else{
          mesh(root,cyl,dark,[0,0,0],[.22,.36,.22]);
          for(let i=-2;i<=2;i++)mesh(root,torus,cMat,[0,i*.065,0],[.14,.14,.09],[Math.PI/2,0,0]);
          mesh(root,cyl,brass,[0,.21,0],[.12,.06,.12]);
          mesh(root,cyl,brass,[0,-.21,0],[.12,.06,.12]);
        }
      } else if(id==="ceramic_plate"||id==="armor_plate"||id==="refractory_plate"||id==="chitin"||id==="sentinel_crust"||id==="furnace_carapace"||id==="geode_carapace"||id==="ember_scale"||id==="shell_carbonate"){
        const pMat=alloyMat("plate-"+id,itemColor(id),/plate|crust/.test(id)?.45:.25,.38);
        bevel(root,pMat,[0,0,0],[.42,.44,.085],[.08,.18,0]);
        for(const y of [-.12,0,.12])bevel(root,dark,[0,y,-.048],[.34,.026,.024],[.08,.18,0]);
        for(const sx of [-.14,.14])for(const sy of [-.14,.14])mesh(root,globe,brass,[sx,sy,-.052],[.024,.024,.018]);
      } else if(id==="beaker"||id==="graduated_cylinder"||id==="lab_glassware"||id==="test_tube"||id==="glass_myc_field_sample"||id==="petri_dish"||id==="pipette"||id==="sterile_swab"){
        const gl=glassMat("lab-gl",0xcff6ff,.42,.05,0x6cd8e8,.24);
        const liq=glowGemMat("lab-liq-"+id,itemColor(id),itemColor(id),.55,.84);
        if(id==="petri_dish"){
          mesh(root,cyl,gl,[0,-.02,0],[.44,.09,.44]);
          mesh(root,cyl,liq,[0,-.035,0],[.38,.04,.38]);
          for(const [x,z] of [[-.08,.04],[.09,-.05],[.02,.09]])mesh(root,globe,edge,[x,-.01,z],[.03,.015,.03]);
        }else if(id==="test_tube"||id==="glass_myc_field_sample"){
          mesh(root,cyl,gl,[0,0,0],[.11,.48,.11],[0,0,-.22]);
          mesh(root,cyl,liq,[.03,-.09,0],[.082,.22,.082],[0,0,-.22]);
          mesh(root,cyl,lightWood,[-.05,.24,0],[.095,.07,.095],[0,0,-.22]);
        }else if(id==="pipette"||id==="sterile_swab"){
          bar(root,id==="pipette"?gl:edge,[0,-.26,0],[0,.18,0],.036);
          mesh(root,globe,id==="pipette"?tint("pip-bulb",0xd96846):edge,[0,.22,0],[.068,.095,.068]);
        }else if(id==="lab_glassware"){
          bevel(root,wood,[0,-.18,0],[.50,.06,.24]);
          mesh(root,cyl,gl,[-.14,.02,0],[.18,.30,.18]);
          mesh(root,cyl,liq,[-.14,-.04,0],[.14,.14,.14]);
          mesh(root,cyl,gl,[.10,-.02,0],[.14,.22,.14]);
          mesh(root,cyl,gl,[.10,.15,0],[.07,.14,.07]);
          mesh(root,cyl,glowGemMat("lab-liq2",0x68f0b8,0x2cd896,.7,.82),[.10,-.06,0],[.11,.10,.11]);
        }else{
          const tall=id==="graduated_cylinder";
          mesh(root,cyl,gl,[0,0,0],[tall?.14:.30,tall?.52:.38,tall?.14:.30]);
          mesh(root,cyl,liq,[0,-.07,0],[tall?.11:.25,tall?.26:.20,tall?.11:.25]);
          mesh(root,torus,gl,[0,tall?.26:.19,0],[tall?.075:.155,tall?.075:.155,.06],[Math.PI/2,0,0]);
          for(let i=-1;i<=2;i++)bevel(root,edge,[0,i*.07,tall?-.075:-.155],[tall?.05:.09,.012,.01]);
        }
      } else if(id==="soil_sample_bag"||id==="air_canister"||id==="filter_cartridge"||id==="carbon_filter"){
        if(id==="soil_sample_bag"){
          bevel(root,tint("soil-bag",0xa47d54),[0,-.05,0],[.34,.36,.20]);
          bevel(root,thread,[0,.13,0],[.22,.05,.16]);
          bevel(root,tint("soil-top",0x8b6844),[0,.20,0],[.26,.09,.15]);
        }else{
          const canMat=alloyMat("can-"+id,itemColor(id),.68,.32);
          mesh(root,cyl,canMat,[0,-.02,0],[.28,.40,.28]);
          for(const y of [-.20,.16])mesh(root,cyl,brass,[0,y,0],[.30,.055,.30]);
          mesh(root,cyl,dark,[0,.23,0],[.12,.08,.12]);
        }
      } else if(id==="carbon_rod"){
        mesh(root,cyl,alloyMat("c-rod",0x242a30,.45,.42),[0,0,0],[.10,.64,.10],[0,0,-.32]);
        for(const s of [-1,1])mesh(root,cyl,brass,[-s*.10,s*.30,0],[.115,.07,.115],[0,0,-.32]);
      } else if(id==="spectrometer_lens"){
        mesh(root,torus,brass,[0,0,0],[.24,.24,.18]);
        mesh(root,cyl,glassMat("spec-lens",0x9bf4ff,.46,.04,0x54d8f5,.55),[0,0,0],[.44,.04,.44],[Math.PI/2,0,0]);
        glowHalo(root,root,0x7ceeff,[0,0,-.06],.48,.48);
      } else if(id==="lab_note"||id==="chromatography_strip"||id==="spectral_data"||id==="ph_kit"){
        if(id==="lab_note"){
          bevel(root,leather,[0,0,0],[.36,.44,.10],[.14,.22,0]);
          bevel(root,edge,[.01,0,0],[.33,.40,.065],[.14,.22,0]);
          bevel(root,brass,[-.14,0,-.055],[.05,.44,.03],[.14,.22,0]);
        }else if(id==="spectral_data"){
          bevel(root,dark,[0,0,0],[.46,.34,.05]);
          for(let i=0;i<6;i++)bevel(root,glowGemMat("sp-"+i,[0xff5555,0xffaa33,0xffee44,0x44ee88,0x44ccff,0xb866ff][i],[0xff5555,0xffaa33,0xffee44,0x44ee88,0x44ccff,0xb866ff][i],1.1,.95),[(i-2.5)*.065,0,-.032],[.045,.20,.016]);
        }else{
          bevel(root,edge,[0,0,0],[.18,.48,.03],[0,.15,0]);
          const cols=[0xd94b4b,0xeba834,0x58c46a,0x4a9ee6];
          for(let i=0;i<4;i++)bevel(root,tint("ph-"+i,cols[i]),[0,-.14+i*.095,-.02],[.14,.055,.012],[0,.15,0]);
        }
      } else if(id==="periodic_key"){
        const keyGold=alloyMat("pkey",0xe8bd52,.86,.18,0x7a5410,.22);
        mesh(root,torus,keyGold,[0,.22,0],[.15,.15,.16]);
        mesh(root,globe,crystal,[0,.22,0],[.08,.08,.05]);
        bar(root,keyGold,[0,.08,0],[0,-.34,0],.058);
        bevel(root,keyGold,[.09,-.24,0],[.14,.055,.045]);
        bevel(root,keyGold,[.07,-.33,0],[.10,.055,.045]);
        glowHalo(root,root,0x78f0e4,[0,.22,-.04],.46,.52);
      } else if(id==="lucky_charm"||id==="prism_pendant"||id==="storm_focus"){
        const col=itemColor(id);
        mesh(root,torus,brass,[0,.20,0],[.12,.12,.10]);
        mesh(root,torus,brass,[0,-.04,0],[.18,.20,.14]);
        mesh(root,globe,glowGemMat("amulet-"+id,col,col,1.15,.90),[0,-.04,0],[.13,.17,.09]);
        glowHalo(root,root,new THREE.Color(col).getHex(),[0,-.04,-.06],.50,.55);
      } else if(id==="bread"||id==="carrot_loaf"){
        const crust=tint("bread-cr",itemColor(id)),inner=tint("bread-in",0xe8c98a);
        bevel(root,crust,[0,-.03,0],[.48,.22,.28],[0,.22,0]);
        bevel(root,crust,[0,.06,0],[.42,.13,.23],[0,.22,0]);
        for(const x of [-.11,0,.11])bevel(root,inner,[x,.125,0],[.032,.022,.16],[0,.58,0]);
      } else if(id==="cheese"){
        const ch=tint("cheese-body",0xf0c748),hole=tint("cheese-hole",0xc79222);
        bevel(root,ch,[0,0,0],[.42,.22,.34],[0,.35,0]);
        for(const [x,y,z,s] of [[-.08,.03,-.175,.045],[.09,-.04,-.175,.055],[.02,.115,.02,.048]]){
          mesh(root,globe,hole,[x,y,z],[s,s,.02]);
        }
      } else if(id==="honey"||id==="prickly_jam"||id==="alpine_compote"){
        const col=itemColor(id);
        mesh(root,cyl,glassMat("jar-gl",0xfff6e0,.36,.06),[0,-.03,0],[.30,.34,.30]);
        mesh(root,cyl,glowGemMat("jar-f-"+id,col,col,.45,.90),[0,-.05,0],[.25,.26,.25]);
        mesh(root,cyl,id==="honey"?lightWood:tint("jar-lid",0xd96858),[0,.16,0],[.24,.08,.24]);
      } else if(id==="berries"||id==="alpine_berries"||id==="wild_cherries"||id==="pine_nuts"){
        const bMat=tint("berry-"+id,itemColor(id)),leafMat=tint("berry-leaf",0x4d8a48);
        for(const [x,y,z,s] of [[0,0,0,.10],[.11,-.04,.04,.09],[-.11,-.03,.05,.09],[.04,.09,-.04,.085],[-.05,-.09,-.04,.085]]){
          mesh(root,globe,bMat,[x,y,z],[s,s,s]);
        }
        bevel(root,leafMat,[0,.15,0],[.22,.03,.12],[.2,.3,.18]);
      } else if(id==="cacao_cake"||id==="berry_tart"||id==="cherry_crumble"){
        const base=tint("cake-b",0xc99655),top=tint("cake-t",itemColor(id));
        mesh(root,cyl,base,[0,-.06,0],[.44,.14,.44]);
        mesh(root,cyl,top,[0,.03,0],[.40,.08,.40]);
        for(let i=0;i<5;i++){
          const a=i*Math.PI*2/5;
          mesh(root,globe,id==="cacao_cake"?edge:tint("tart-ber",0xc43248),[Math.cos(a)*.12,.09,Math.sin(a)*.12],[.042,.042,.042]);
        }
      } else if(id==="bog_risotto"||id==="shellfish_broth"||id==="mushroom_rice"){
        mesh(root,cyl,dark,[0,-.05,0],[.42,.16,.42]);
        mesh(root,cyl,tint("bowl-"+id,itemColor(id)),[0,.02,0],[.36,.05,.36]);
        for(const [x,z] of [[-.08,.04],[.09,-.05],[0,.08]])bevel(root,lightWood,[x,.055,z],[.065,.04,.065],[0,.4,0]);
      } else if(id==="mint_fish"||id==="fish_fillet"||id==="grilled_game"||id==="baked_potato"){
        bevel(root,wood,[0,-.08,0],[.48,.05,.32],[0,.2,0]);
        bevel(root,tint("dish-"+id,itemColor(id)),[0,0,0],[.36,.12,.22],[0,.2,0]);
        bevel(root,tint("herb-g",0x5ca856),[.06,.075,0],[.12,.03,.08],[0,.5,.12]);
      } else if(id==="forest_mushroom"){
        mesh(root,cyl,edge,[0,-.09,0],[.12,.24,.12]);
        mesh(root,globe,tint("mush-cap",itemColor(id)),[0,.08,0],[.25,.14,.25]);
      } else if(id==="wild_mint"||id==="samphire"||id==="wild_rice"||id==="prickly_fruit"||id==="cacao"){
        const fMat=tint("forage-"+id,itemColor(id));
        if(id==="cacao"||id==="prickly_fruit"){
          mesh(root,globe,fMat,[0,0,0],[.18,.26,.16],[.12,.2,.22]);
          bar(root,wood,[0,.22,0],[.04,.32,0],.035);
        }else{
          for(let i=-1;i<=1;i++){
            bar(root,fMat,[i*.04,-.22,0],[i*.13,.22,i*.04],.035);
            bevel(root,fMat,[i*.14,.14,i*.04],[.10,.14,.03],[0,i*.4,i*-.3]);
          }
        }
      } else if(id==="feather"){
        bar(root,edge,[-.08,-.28,0],[.10,.28,0],.024);
        bevel(root,tint("feath",itemColor(id)),[.03,.05,0],[.18,.40,.025],[0,0,-.28]);
        bevel(root,edge,[.06,.16,-.01],[.12,.14,.02],[0,0,-.28]);
      } else if(id==="hide"){
        mesh(root,cyl,tint("hide-r",itemColor(id)),[0,0,0],[.22,.46,.22],[0,0,Math.PI/2-.22]);
        for(const x of [-.12,.12])mesh(root,torus,thread,[x,0,0],[.12,.12,.08],[0,Math.PI/2,0]);
      } else if(id==="wool"||id==="soot_silk"){
        const yMat=tint("yarn-"+id,itemColor(id));
        mesh(root,globe,yMat,[0,0,0],[.22,.20,.22]);
        for(let i=0;i<3;i++)mesh(root,torus,yMat,[0,0,0],[.21,.21,.10],[i*.9,i*1.1,0]);
      } else if(id==="candle"){
        const wax=tint("candle-wax",0xf8efd8),drip=tint("candle-drip",0xede0be);
        const outerFlame=glowGemMat("candle-flame-o",0xffa428,0xff7410,1.65,.92);
        const innerFlame=glowGemMat("candle-flame-i",0xfff6b8,0xffe46b,1.95,.98);
        mesh(root,cyl,brass,[0,-.22,0],[.30,.06,.30]);
        mesh(root,torus,brass,[.15,-.19,0],[.07,.07,.05]);
        mesh(root,cyl,wax,[0,-.02,0],[.18,.36,.18]);
        for(const [dx,dy,dz,h] of [[.085,.08,-.02,.13],[-.075,.06,.04,.16],[.01,.09,-.088,.10]]){
          mesh(root,cyl,drip,[dx,dy,dz],[.042,h,.042]);
        }
        bar(root,dark,[0,.15,0],[0,.21,0],.018);
        mesh(root,globe,outerFlame,[0,.28,0],[.068,.135,.068]);
        mesh(root,globe,innerFlame,[0,.265,0],[.036,.078,.036]);
        glowHalo(root,root,0xffb44c,[0,.28,-.04],.58,.62);
      } else if(id==="soap"){
        bevel(root,tint("soap-b",itemColor(id)),[0,0,0],[.36,.14,.24],[.18,.32,0]);
        bevel(root,edge,[0,.075,0],[.20,.02,.11],[.18,.32,0]);
      } else if(id==="bait"||id==="herb_bait"||id==="mineral_lure"||id==="fishing_junk"){
        const lMat=tint("lure-"+id,itemColor(id));
        mesh(root,globe,lMat,[0,.04,0],[.12,.19,.10]);
        mesh(root,torus,metal,[0,-.14,0],[.09,.10,.06]);
        bar(root,edge,[0,.22,0],[0,.34,0],.02);
      } else if(/hydrogen$|oxygen$|chlorine|carbon_dioxide|steam/.test(String(id))){
        const gCol=itemColor(id);
        mesh(root,cyl,glassMat("gas-tube",0xd8f6ff,.38,.05),[0,0,0],[.24,.42,.24]);
        mesh(root,globe,glowGemMat("gas-cloud-"+id,gCol,gCol,.75,.68),[0,0,0],[.14,.18,.14]);
        mesh(root,cyl,brass,[0,.23,0],[.26,.06,.26]);
        mesh(root,cyl,brass,[0,-.23,0],[.26,.06,.26]);
        mesh(root,torus,metal,[0,.29,0],[.08,.08,.07],[Math.PI/2,0,0]);
      } else if(/water|acid|alkali|ammonia|ethanol|oil|indicator|solution|tetraammine|antidote|bath|nitrogen|mash|medium|resin|gel|mucus/.test(String(id))){
        const lCol=itemColor(id);
        const glowing=/glow|oscillating|nitrogen|acid/.test(String(id));
        const gl=glassMat("reag-gl",0xd4f4ff,.36,.05);
        const liq=glowGemMat("reag-"+id,lCol,lCol,glowing?1.05:.35,.88);
        mesh(root,cyl,gl,[0,-.05,0],[.28,.30,.28]);
        mesh(root,cyl,liq,[0,-.08,0],[.23,.21,.23]);
        mesh(root,cyl,gl,[0,.14,0],[.13,.12,.13]);
        mesh(root,cyl,lightWood,[0,.22,0],[.12,.07,.12]);
        bevel(root,edge,[0,-.04,-.145],[.16,.11,.015]);
        if(glowing)glowHalo(root,root,new THREE.Color(lCol).getHex(),[0,-.05,-.08],.46,.48);
      } else if(/sulfur|sulfate|fertilizer|lime|salt|pigment|nitrate|chloride|hydroxide|carbon|oxide|dust|abrasive|adsorbent|exchange|alginate|mix|precipitate|residue/.test(String(id))){
        const pCol=itemColor(id);
        mesh(root,cyl,alloyMat("mortar",0x9ea8ad,.18,.68),[0,-.10,0],[.38,.16,.38]);
        mesh(root,globe,tint("pow-"+id,pCol),[0,-.01,0],[.18,.13,.18]);
        for(const [x,z] of [[-.09,.04],[.08,-.05],[.02,.08]])mesh(root,globe,tint("pow-"+id,pCol),[x,.04,z],[.065,.055,.065]);
        bar(root,edge,[.06,.02,.02],[.22,.22,-.04],.05);
      } else {
        const color = itemColor(id);
        bevel(root,wood,[0,-.02,0],[.34,.28,.26],[.08,.24,0]);
        bevel(root,tint(id,color),[0,.02,-.135],[.22,.16,.03],[.08,.24,0]);
        bevel(root,brass,[0,.13,0],[.36,.045,.28],[.08,.24,0]);
      }
      const scale = dropped ? .42 : first ? .72 : .58;
      root.scale.setScalar(scale);
      return root;
    }

    function animateItem(root, now, action = 0, motion = 1, hasArrow = true) {
      if (!root) return;
      mirrorMaterial.uniforms.mirrorTime.value = now * .001 * motion;
      const {core,rings,string,bowTips,pulseHalos,waveRings,sacredHalo,sacredGlow,sacredSphere} = root.userData;
      if(sacredSphere){
        const aura=sacredSphere.userData,phase=now*.00058*motion;
        aura.pulse=phase;
        aura.strength=aura.baseStrength*(1+Math.sin(phase*3.2)*.065*motion+action*.46);
        sacredSphere.scale.setScalar(aura.radius*(1+Math.sin(phase*3.2)*.008*motion+action*.022));
      }
      if(sacredHalo){
        const phase=now*.00048*motion;
        sacredHalo.rotation.z=phase;
        sacredHalo.scale.setScalar(1+Math.sin(phase*4)*.012*motion+action*.045);
      }
      pulseHalos?.forEach(halo=>{
        const s = (halo.userData.baseSize || .4) * (1 + Math.sin(now * .0042 + halo.userData.phase) * .12 * motion);
        halo.scale.set(s, s, 1);
      });
      if(sacredGlow){sacredGlow.scale.x*=1+action*.24;sacredGlow.scale.y*=1+action*.24}
      waveRings?.forEach((ring,i)=>{
        const pulse = 1 + Math.sin(now * .0065 * motion + ring.userData.phase) * .22;
        const base = .058 + i * .028;
        ring.scale.set(base * pulse, base * pulse, .042);
        ring.position.y = .22 + ((now * .00028 * motion + i / 3) % 1) * .17;
      });
      root.userData.gloveSparks?.forEach((spark,i)=>{
        const t=(now*.0014+i*.163)%1,a=i*2.399+t*2;
        spark.visible=motion>0;
        spark.position.set(Math.cos(a)*(.17+t*.12),.11+t*.32,Math.sin(a)*.20-.16-action*.11);
        spark.scale.setScalar((.008+action*.018)*Math.sin(t*Math.PI)*motion);
      });
      if (core) {
        core.rotation.y = now * .0019 * motion;
        const size=root.userData.coreSize;
        if(size)core.scale.copy(size);
        else core.scale.set(.169,.22,.167);
        core.scale.multiplyScalar(1+Math.sin(now*.005)*.07*motion);
      }
      rings?.forEach((ring,index)=>{
        ring.rotation.set(.8+index*.94,now*.00118*motion+ring.userData.phase, ring.userData.phase+now*.00043*motion);
      });
      if (string) {
        const crossbow=root.userData.kind==="crossbow";
        const pull=crossbow?new THREE.Vector3(0,.078,hasArrow?.22:-.225):
          new THREE.Vector3(.027,0,bowTips[0].z+action*.31);
        string.forEach((span,index)=>{
          const end = bowTips[index];
          const difference = pull.clone().sub(end);
          span.position.copy(end).lerp(pull,.5);
          span.scale.y = difference.length();
          span.quaternion.setFromUnitVectors(yAxis,difference.normalize());
        });
        if(crossbow)root.userData.arrow.position.set(0,.103,-.173);
        else root.userData.arrow.position.set(.047,.023,.005+action*.31);
        root.userData.arrow.visible = hasArrow;
      }
    }

    function icon(id) {
      if (icons.has(id)) return icons.get(id);
      const alchemyItem=globalThis.QuimiCraftAlchemy?.itemData[id];
      const vehicleItem=globalThis.QuimiCraftVehicles?.itemData[id];
      const finisher=globalThis.QuimiCraftBiomeFauna?.exterminationTools[id];
      const labUtility=globalThis.QuimiCraftFieldLab?.huntUtilities[id];
      const weapon=globalThis.QuimiCraftArsenal?.weapons[id];
      const guard=id==="shield"?baseShieldDef:globalThis.QuimiCraftArsenal?.shields[id];
      const artifact=globalThis.QuimiCraftArsenal?.focuses[id];
      const gear=globalThis.QuimiCraftArsenal?.apparel[id];
      if (!weapon&&!guard&&!artifact&&!gear&&!vehicleItem&&!alchemyItem&&!finisher&&!labUtility&&!["wind_staff","bow","iron_sword","stone_pickaxe","iron_pickaxe","copper_pickaxe","hoe","fishing_rod","reinforced_rod","pan","mallet","arrow","bolt","carbon_badge","dragon_hide","hunt_badge","shield","corrupted_ingot","corrupted_shard","old_god_eye","candle"].includes(id)) return "";
      const canvas = document.createElement("canvas");
      canvas.width=canvas.height=64;
      const ctx = canvas.getContext("2d");
      ctx.lineCap="round";
      ctx.lineJoin="round";
      function glowDisc(x,y,r,inner,outer){
        const g=ctx.createRadialGradient(x,y,1,x,y,r);
        g.addColorStop(0,inner);g.addColorStop(1,outer);
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      }
      function line(points, color, width) {
        ctx.beginPath(); ctx.moveTo(...points[0]);
        for (const point of points.slice(1)) ctx.lineTo(...point);
        ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
      }
      function tile(points,color) {
        ctx.beginPath();ctx.moveTo(...points[0]);
        for (const point of points.slice(1)) ctx.lineTo(...point);
        ctx.closePath();ctx.fillStyle=color;ctx.fill();
      }
      const handle=[[13,54],[37,27]];
      if(labUtility){
        if(id==="quartz_whetstone"){
          glowDisc(33,31,26,"#d6b8ff77","#d6b8ff00");
          tile([[16,44],[37,11],[51,21],[28,55]],"#b598cf");
          line([[18,44],[43,16]],"#f5ecff",5);
          line([[26,47],[47,21]],"#5a516b",3);
          tile([[28,27],[35,20],[38,24],[31,32]],"#ffffffaa");
        }else if(id==="soot_filter"){
          glowDisc(32,26,24,"#5cffd655","#5cffd600");
          tile([[18,17],[46,17],[47,48],[41,53],[23,53],[17,47]],"#5b6c7a");
          line([[19,18],[45,18]],"#c8dee6",5);
          line([[20,24],[44,24]],"#5effd8",4);
          for(const x of [25,32,39])line([[x,30],[x,45]],"#262e38",4);
          line([[21,51],[43,51]],"#d8aa64",4);
        }else if(id==="vein_probe"){
          glowDisc(32,19,24,"#c680ff99","#c680ff00");
          line([[31,54],[32,30]],"#3e4d5a",12);
          line([[23,19],[23,32],[40,32],[40,19]],"#d2a968",4);
          tile([[32,6],[41,19],[32,31],[23,19]],"#cf9aff");
          tile([[32,9],[36,19],[32,26],[28,19]],"#f7ebff");
          line([[27,37],[36,37]],"#d6b4ff",3.5);
        }else{
          glowDisc(34,39,24,"#ff8a3866","#ff8a3800");
          for(const shift of [14,-8]){
            tile([[26+shift,17],[39+shift,17],[39+shift,47],[21+shift,47],[20+shift,38],[26+shift,35]],"#c2724a");
            line([[20+shift,45],[39+shift,45]],"#34424a",4);
            line([[29+shift,22],[36+shift,22]],"#f3c98d",3);
            line([[22+shift,39],[33+shift,39]],"#ffae52",2.5);
          }
        }
        const source=canvas.toDataURL("image/png");
        icons.set(id,source);
        return source;
      }
      if(finisher||id==="hunt_badge"){
        if(id==="fracture_hammer"){
          glowDisc(37,22,24,"#5ad8ff80","#5ad8ff00");
          line([[18,53],[41,23]],"#75523d",10);
          line([[18,53],[28,40]],"#37424a",10);
          tile([[23,13],[32,5],[55,22],[48,35],[21,18]],"#8ca6b8");
          line([[24,12],[48,31]],"#e8f8ff",4);
          line([[31,18],[44,28]],"#62e4ff",3.5);
        }else if(id==="copper_ampoule"||id==="sealing_cartridge"){
          const copper=id==="copper_ampoule";
          glowDisc(32,36,26,copper?"#3cf2ce99":"#ffae4299",copper?"#3cf2ce00":"#ffae4200");
          if(copper){
            tile([[26,14],[38,14],[38,24],[45,31],[45,54],[19,54],[19,31],[26,24]],"#a8edf299");
            tile([[21,34],[43,34],[43,52],[21,52]],"#36e0bd");
            line([[21,31],[21,52]],"#d8854c",3);line([[43,31],[43,52]],"#d8854c",3);
            line([[24,33],[24,46]],"#e4fffb",2.5);
          }else{
            tile([[21,18],[43,18],[44,52],[20,52]],"#f0a642");
            tile([[28,30],[37,30],[37,41],[28,41]],"#8c3842");
            glowDisc(32,35,6,"#ffe48f","#ffae3400");
          }
          line([[copper?26:20,copper?14:19],[copper?38:44,copper?14:19]],"#ddb062",5);
          line([[22,52],[42,52]],"#42545e",4);
        }else if(id==="echo_fork"){
          glowDisc(32,22,25,"#bc84ff99","#bc84ff00");
          line([[32,53],[32,33]],"#8c6248",8);
          line([[22,13],[22,29],[26,36],[38,36],[42,29],[42,13]],"#cfb5ff",7);
          line([[24,12],[24,26]],"#f6eeff",3);
          line([[27,21],[37,21]],"#e0c2ffaa",2.5);line([[28,15],[36,15]],"#e0c2ff88",2);
        }else if(id==="hunt_badge"){
          glowDisc(32,31,29,"#ffc757aa","#ffc75700");
          tile([[32,5],[58,31],[32,58],[6,31]],"#eac065");
          tile([[32,12],[51,31],[32,51],[13,31]],"#263942");
          tile([[32,16],[40,31],[32,46],[24,31]],"#ffae3a");
          tile([[32,20],[36,31],[32,42],[28,31]],"#fff3be");
        }else{
          const cold=id==="brine_cold_pack";
          glowDisc(32,34,26,cold?"#5ce0ff99":"#c4faf088",cold?"#5ce0ff00":"#c4faf000");
          tile([[16,11],[46,14],[51,49],[41,56],[17,54],[12,45]],cold?"#67cef2":finisher.color);
          line([[15,14],[46,16]],cold?"#325870":"#c89c54",5);
          for(const [x,y] of [[23,36],[34,29],[41,40]])tile([[x,y-4],[x+4,y],[x,y+4],[x-4,y]],"#f7ffff");
        }
        const source=canvas.toDataURL("image/png");
        icons.set(id,source);
        return source;
      }
      if(id==="carbon_badge"){
        const glow=ctx.createRadialGradient(32,32,8,32,32,32);
        glow.addColorStop(0,"#78fffbe0");glow.addColorStop(.48,"#41d0d071");glow.addColorStop(1,"#41d0d000");
        ctx.fillStyle=glow;
        ctx.fillRect(0,0,64,64);
        tile([[32,9],[50,20],[50,44],[32,55],[14,44],[14,20]],"#c89c5c");
        tile([[32,14],[45,22],[45,41],[32,50],[19,41],[19,22]],"#18313a");
        line([[27,22],[36,22],[34,29],[41,40],[22,40],[29,29],[29,22]],"#84f8ff",2.8);
        line([[25,37],[38,37]],"#dcffff",2.5);
        const source=canvas.toDataURL("image/png");
        icons.set(id,source);
        return source;
      }
      if(vehicleItem){
        const color=vehicleItem[1];
        const boatKind=globalThis.QuimiCraftVehicles.kindOf(id);
        if(globalThis.QuimiCraftVehicles.isBoat(boatKind)){
          tile([[5,31],[20,26],[52,27],[58,32],[52,45],[21,47],[10,42]],"#1e3340");
          tile([[7,31],[22,34],[57,31],[52,41],[22,44],[11,40]],color);
          tile([[8,30],[21,26],[50,25],[57,30],[24,35]],"#e4d5a8");
          if(boatKind==="ship"){
            tile([[22,26],[29,14],[45,15],[48,28],[24,30]],"#d9ded3");
            line([[29,19],[44,19]],"#6297a1",5);
          }else if(boatKind!=="dinghy")line([[25,28],[32,20],[40,20]],"#718e98",4);
          line([[51,41],[55,49]],"#596a75",3);
          line([[16,50],[47,50]],"#67a0b7",2);
        }else if(id==="kit_glider"){
          tile([[5,27],[27,19],[33,22],[58,18],[58,34],[34,38],[7,44]],"#2c343b");
          tile([[9,29],[26,22],[26,35],[10,41]],"#e0c498");
          tile([[39,23],[55,21],[55,31],[39,34]],"#e0c498");
          line([[29,30],[29,48],[42,51]],"#91644d",6);
          line([[29,21],[29,43]],"#e0c498",4);
          line([[19,40],[19,48]],"#202729",5);line([[37,35],[37,45]],"#202729",5);
        }else if(id==="pedal_drive"){
          line([[19,46],[35,22],[47,27],[25,44],[19,46]],"#2b3941",7);
          line([[19,46],[35,22],[47,27],[25,44],[19,46]],color,4);
          line([[42,16],[51,34]],"#9e6a43",6);
          line([[13,51],[26,51]],"#896845",5);
        }else{
          line([[16,45],[52,45]],"#273138",16);
          tile([[9,40],[12,30],[29,28],[32,20],[44,20],[45,30],[53,34],[52,43],[10,43]],color);
          line([[13,36],[53,36]],"#82684b",2);
          for(const x of [18,43]){line([[x,42],[x,48]],"#233037",10);line([[x,44],[x,46]],"#b1956b",4);}
          if(id==="kit_drill")tile([[6,31],[18,32],[18,43],[4,37]],"#8d9fa1");
          if(id==="kit_excavator"){line([[32,28],[23,15],[10,24]],"#cb8a62",7);line([[11,23],[5,32],[11,34]],"#66787b",5);}
          if(id==="kit_cart")line([[8,35],[11,35]],"#ffe1a6",5);
        }
      }else if(alchemyItem){
        tile([[24,8],[40,8],[40,16],[24,16]],"#b78e63");
        tile([[24,16],[40,16],[40,24],[50,35],[50,50],[43,57],[21,57],[14,50],[14,35],[24,24]],"#263540");
        tile([[27,17],[37,17],[37,25],[46,36],[46,48],[41,53],[23,53],[18,48],[18,36],[27,25]],"#a5c6ce");
        if(id!=="potion_vial")tile([[20,39],[44,36],[44,49],[40,51],[24,51],[20,48]],alchemyItem[1]);
        line([[26,29],[22,36],[22,43]],"#ebf9ef",2.5);
      }else if (id.endsWith("pickaxe")||id==="hoe") {
        line(handle,"#291e1b",10);line(handle,"#b17e4e",6);
        const head=id==="hoe"?[[34,22],[48,18],[55,24]]:[[22,18],[32,12],[47,16],[55,26],[54,34]];
        line(head,"#1b282a",11);line(head,id.startsWith("iron") ? "#b8d3d8" : id.startsWith("copper") ? "#c38a56" : "#8a9a9b",7);
        line([[25,16],[32,13],[46,17]],"#e0eddf",2);
      } else if (id==="fishing_rod"||id==="reinforced_rod") {
        line([[10,54],[34,28],[49,11]],"#432e28",6);
        line([[10,54],[36,28],[49,11]],"#d3a76c",3.5);
        line([[49,11],[52,38],[48,48],[43,45]],"#bddbdd",1.7);
        tile([[47,29],[56,28],[56,36],[48,37]],"#e7867d");
      } else if(id==="pan"){
        line([[13,53],[35,30]],"#653f34",8);
        tile([[23,21],[33,12],[49,14],[57,24],[52,37],[34,38],[24,31]],"#536778");
        line([[29,27],[41,30],[50,22]],"#a5b9bf",2);
      } else if(id==="mallet"){
        line(handle,"#a8835b",7);
        tile([[26,15],[45,26],[40,36],[21,26]],"#9ca9ae");
        line([[22,24],[27,15],[44,25]],"#d2d8da",2);
      } else if(id==="candle"){
        glowDisc(32,16,24,"#ffcf66cc","#ff902200");
        tile([[20,48],[44,48],[46,54],[18,54]],"#c89b49");
        tile([[25,25],[39,25],[39,49],[25,49]],"#f7eed5");
        tile([[25,25],[31,25],[31,37],[28,39],[25,35]],"#e6d7b0");
        line([[32,25],[32,20]],"#2d2420",2.5);
        tile([[32,6],[38,16],[35,22],[29,22],[26,16]],"#ff9c28");
        tile([[32,11],[35,17],[32,21],[29,17]],"#fff5ba");
      } else if(id==="old_god_eye"){
        glowDisc(32,32,29,"#eb68ffaa","#eb68ff00");
        ctx.fillStyle="#f2e2c2";ctx.beginPath();ctx.arc(32,32,20,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#de58dc";ctx.beginPath();ctx.arc(32,32,12,0,Math.PI*2);ctx.fill();
        tile([[32,21],[36,32],[32,43],[28,32]],"#12061c");
        ctx.fillStyle="#fff5ff";ctx.beginPath();ctx.arc(27,26,3.2,0,Math.PI*2);ctx.fill();
      } else if(id==="corrupted_ingot"){
        glowDisc(32,32,27,"#c964ff99","#c964ff00");
        tile([[10,38],[22,20],[52,18],[54,32],[42,47],[12,48]],"#3e1b5c");
        tile([[14,36],[24,22],[49,21],[40,34]],"#6a3299");
        line([[19,34],[32,29],[45,26]],"#f594ff",3.5);
        tile([[32,26],[36,30],[32,34],[28,30]],"#ffe2a6");
        line([[32,27],[32,33]],"#14071f",2);
      } else if(id==="corrupted_shard"){
        glowDisc(32,32,27,"#d968ffaa","#d968ff00");
        tile([[32,7],[46,24],[41,54],[24,56],[17,27]],"#6e28a8");
        tile([[32,10],[41,25],[36,48],[26,30]],"#ec86ff");
        line([[32,12],[32,47]],"#fff0ff",2.2);
      } else if(artifact){
        if(artifact.shape==="book"||artifact.shape==="corruptedBook"||artifact.shape==="summonBook"){
          if(artifact.corrupted)glowDisc(32,32,29,"#d962ff99","#d962ff00");
          tile([[8,15],[30,19],[54,12],[58,45],[33,53],[9,47]],artifact.color);
          tile([[11,11],[30,16],[52,9],[54,40],[31,47],[12,41]],artifact.corrupted?"#d7c2de":"#e8d8ad");
          line([[30,17],[31,47]],artifact.trim,3);
          for(const y of [20,26,32,38]){line([[15,y],[26,y+3]],artifact.corrupted?"#9f3be0":"#775d64",1.4);line([[35,y+1],[49,y-3]],artifact.corrupted?"#9f3be0":"#775d64",1.4);}
          if(artifact.corrupted){
            ctx.fillStyle="#ffcb94";ctx.beginPath();ctx.arc(31,31,6.5,0,Math.PI*2);ctx.fill();
            line([[31,26],[31,36]],"#12061c",2.4);
          }
        }else{
          line([[21,53],[44,53]],"#87634e",6);
          tile([[17,26],[24,15],[36,10],[47,18],[52,30],[43,42],[31,48],[20,41]],artifact.color);
          tile([[22,25],[33,16],[42,20],[36,35],[26,38]],artifact.trim);
          line([[15,35],[25,26],[45,20],[56,23],[48,33],[28,42],[17,41]],"#dbb78a",2.6);
        }
      } else if(guard?.shape==="sacred"){
        glowDisc(32,30,31,"#ffc649af","#ffb94c00");
        const crest=[[32,4],[38,10],[49,15],[48,30],[44,45],[39,53],[32,61],[24,54],[19,46],[15,31],[15,15],[25,10]];
        tile(crest,"#efb74b");
        tile(crest.map(([x,y])=>[32+(x-32)*.83,31+(y-31)*.86]),"#583b29");
        tile(crest.map(([x,y])=>[32+(x-32)*.69,31+(y-31)*.76]),"#414b59");
        for(const side of [-1,1]){
          for(let i=0;i<5;i++){
            const p=(x,y)=>[32+x*side,y];
            tile([p(6,30+i*2),p(17+i,21+i*3),p(20+i,11+i*5),
              p(18+i,27+i*3),p(9,33+i*2)],i%2?"#b8a88b":"#ffecbf");
          }
        }
        glowDisc(32,29,12,"#fff9cee8","#ffa73c00");
        ctx.beginPath();ctx.arc(32,29,8.6,0,Math.PI*2);ctx.strokeStyle="#f6ba43";ctx.lineWidth=2;ctx.stroke();
        line([[35,45],[31,26]],"#332923",5);
        line([[35,45],[31,26]],"#ffda81",2.6);
        tile([[31,22],[42,21],[43,27],[32,28]],"#513527");
        tile([[32,23],[41,22],[41,26],[33,27]],"#fff1bd");
        tile([[27,29],[33,28],[36,33],[33,37],[27,35]],"#6d5032");
        for(const y of [29,31.5,34])line([[28,y],[33,y-.48]],"#fff1c6",1.55);
        for(const y of [13,52])tile([[32,y-3],[35,y],[32,y+3],[29,y]],"#ffebae");
      } else if(id==="shield"){
        const crest=[[32,59],[22,53],[15,45],[11,33],[11,14],[15,10],[22,8],[32,9],
          [42,8],[49,10],[53,14],[53,33],[49,45],[42,53]];
        const inset=scale=>crest.map(([x,y])=>[32+(x-32)*scale,31+(y-31)*scale]);
        const shine=ctx.createLinearGradient(14,12,46,56);
        shine.addColorStop(0,"#f2bf7f");shine.addColorStop(.24,"#b57040");
        shine.addColorStop(.49,"#e4a769");shine.addColorStop(.62,"#a85d33");shine.addColorStop(1,"#6f3b27");
        tile(crest,shine);tile(inset(.92),"#70412b");tile(inset(.84),shine);
        glowDisc(31,30,10,"#824324","#5b2c20");
        glowDisc(29,28,6.7,"#f6c988","#a2582e");
        for(const [x,y] of [[18,15],[46,15],[15,25],[49,25],[17,39],[47,39],[24,49],[40,49],[32,54]])
          glowDisc(x,y,1.8,"#ffdb9b","#aa693c");
      } else if(guard){
        const glowCol=guard.shape==="corrupted"?"#dc64ff99":guard.shape==="dragon"?"#4ffce288":guard.shape==="mirror"?"#a6fbff99":guard.shape==="tower"?"#62dcff77":guard.shape==="heater"?"#66d6ff77":"#ffca6677";
        glowDisc(32,32,30,glowCol,glowCol.slice(0,7)+"00");
        const outline=guard.shape==="oval"||guard.shape==="mirror"?[[19,11],[32,5],[45,11],[51,23],[49,41],[41,54],[32,59],[23,54],[15,41],[13,23]]:
          guard.shape==="tower"?[[15,8],[49,8],[54,14],[54,51],[48,57],[16,57],[10,51],[10,14]]:
          guard.shape==="heater"?[[13,11],[32,8],[51,11],[52,33],[44,49],[32,58],[20,49],[12,33]]:
          [[16,10],[22,6],[32,11],[42,6],[48,10],[54,24],[48,44],[32,60],[16,44],[10,24]];
        tile(outline,guard.trim);
        tile(outline.map(([x,y])=>[32+(x-32)*.89,32+(y-32)*.91]),"#17222b");
        tile(outline.map(([x,y])=>[32+(x-32)*.82,32+(y-32)*.85]),guard.color);
        if(guard.shape==="corrupted"){
          ctx.fillStyle="#ffcf96";ctx.beginPath();ctx.ellipse(32,31,11,13,0,0,Math.PI*2);ctx.fill();
          ctx.fillStyle="#df54d8";ctx.beginPath();ctx.ellipse(32,31,7,9,0,0,Math.PI*2);ctx.fill();
          tile([[32,22],[35,31],[32,40],[29,31]],"#12051c");
        }else if(guard.shape==="dragon"){
          tile([[32,16],[39,19],[44,29],[41,40],[37,44],[36,51],[32,54],[28,51],[27,44],[23,40],
            [20,29],[25,19]],"#b8824b");
          for(const side of [-1,1]){
            const reflect=points=>points.map(([x,y])=>[32+(x-32)*side,y]);
            tile(reflect([[38,23],[41,15],[48,9],[46,20],[43,30]]),guard.trim);
            tile(reflect([[35,30],[43,26],[42,34],[38,39],[35,35]]),guard.trim);
            line(reflect([[36,33],[41,30]]),"#68ffea",3);
            tile(reflect([[36,43],[40,42],[37,48]]),"#fff0c8");
          }
          tile([[27,37],[32,33],[37,37],[36,46],[32,49],[28,46]],"#e8bc7c");
          tile([[32,18],[35,23],[32,27],[29,23]],"#ffb24a");
          line([[29,42],[30,42]],"#382638",2);
          line([[34,42],[35,42]],"#382638",2);
        }else if(guard.shape==="mirror"){
          tile([[16,33],[38,11],[45,16],[17,45]],"#f2ffff");
          line([[23,47],[46,24]],"#d2f7ff",2.8);
          tile([[32,9],[35,13],[32,17],[29,13]],"#8cf7ff");
          tile([[32,47],[35,51],[32,55],[29,51]],"#8cf7ff");
        }else if(guard.shape==="tower"){
          line([[32,14],[32,52]],guard.trim,4);
          line([[32,17],[32,49]],"#6be4ff",2);
          line([[22,20],[42,20]],"#9ff2ff",3.5);
        }else if(guard.shape==="heater"){
          line([[32,14],[32,52]],guard.trim,3);
          line([[18,28],[46,28]],guard.trim,3);
          tile([[32,21],[38,28],[32,35],[26,28]],"#6fe0ff");
        }else{
          tile([[32,21],[43,31],[32,42],[21,31]],guard.trim);
          tile([[32,25],[38,31],[32,37],[26,31]],"#ffd36e");
        }
      } else if(id==="dragon_hide"){
        tile([[15,12],[32,9],[48,14],[54,30],[49,52],[35,56],[16,52],[11,35]],"#60414c");
        for(let y=20;y<=44;y+=8)for(let x=22;x<=44;x+=8){
          const dx=x+(y%16===4?-3:1);
          tile([[dx-4,y],[dx,y-2],[dx+4,y],[dx,y+5]],(x+y)%3===0?"#c68d7d":"#915e66");
        }
      } else if(gear){
        if(gear.finish==="corrupted")glowDisc(32,32,29,"#d962ff88","#d962ff00");
        if(gear.shape==="quiver"){
          for(const x of [26,32,38])line([[x,29],[x+2,9]],gear.trim,4);
          tile([[24,24],[43,20],[39,52],[28,56]],gear.color);
          line([[25,26],[42,23]],gear.trim,4);
        }else if(gear.slot==="legs"){
          tile([[15,10],[49,10],[51,24],[48,54],[35,54],[32,31],[29,54],[16,54],[13,24]],gear.color);
          line([[16,15],[48,15]],gear.trim,4);
          for(const side of [-1,1]){
            const x=32+side*11;
            if(gear.finish)for(let y=24;y<=42;y+=9)line([[x-4,y],[x+4,y-1]],gear.trim,2.5);
            else line([[x+side*3,22],[x+side*2,44]],gear.trim,2.25);
          }
        }else if(gear.slot==="feet"){
          for(const x of [8,33]){
            tile([[x+2,16],[x+17,15],[x+17,36],[x+24,42],[x+23,49],[x+1,50],[x,43]],gear.color);
            line([[x+2,18],[x+16,17]],gear.trim,3.5);
            for(const y of [24,31])line([[x+5,y],[x+13,y-2]],gear.trim,2.5);
            line([[x+2,47],[x+21,46]],"#252530",3);
          }
        }else if(gear.slot==="back"){
          tile([[18,10],[30,15],[45,10],[49,54],[37,58],[28,55],[14,57]],gear.color);
          line([[15,53],[29,51],[38,55],[48,50]],gear.trim,3);
          tile([[32,25],[39,33],[32,42],[25,33]],gear.trim);
        }else if(gear.shape==="earProtectors"){
          line([[12,34],[15,19],[22,11],[42,11],[49,19],[52,34]],gear.color,5);
          tile([[9,29],[19,28],[22,35],[21,49],[16,52],[8,47]],gear.trim);
          tile([[45,28],[55,29],[56,47],[48,52],[43,49],[42,35]],gear.trim);
        }else if(gear.shape==="wizardHat"){
          tile([[23,44],[24,32],[27,20],[31,11],[39,6],[48,11],[40,13],[36,22],[40,35],[44,44]],gear.color);
          tile([[24,37],[40,36],[43,42],[22,44]],gear.trim);
          tile([[21,41],[9,43],[4,49],[15,55],[36,56],[59,48],[52,43],[41,41]],gear.color);
          tile([[31,38],[35,35],[39,38],[35,43]],"#9df0db");
          line([[9,50],[23,53],[41,51],[56,47]],gear.trim,2);
        }else if(gear.shape==="circlet"){
          line([[12,25],[21,39],[32,43],[45,37],[53,25]],gear.trim,6);
          tile([[32,12],[41,29],[32,40],[23,29]],gear.color);
          tile([[32,17],[36,28],[32,35],[28,28]],"#9df0db");
        }else if(gear.slot==="head"){
          tile([[12,28],[16,15],[30,7],[43,11],[51,24],[49,49],[39,55],[23,53],[15,46]],gear.color);
          tile([[19,29],[31,22],[46,28],[43,41],[35,45],[31,37],[25,43],[21,41]],"#1e2930");
          line([[20,28],[31,22],[46,28]],gear.trim,4);
          if(gear.finish==="corrupted"){ctx.fillStyle="#ffcf96";ctx.beginPath();ctx.arc(32,18,4.8,0,Math.PI*2);ctx.fill();line([[32,14],[32,22]],"#12051c",1.9);}
        }else if(gear.shape==="tunic"||gear.shape==="arcaneRobe"||gear.finish==="dragon"){
          const hem=gear.shape==="arcaneRobe"?58:53;
          tile([[13,16],[26,9],[32,14],[39,9],[51,16],[49,30],[42,29],[47,hem],[35,hem],[32,hem-5],
            [29,hem],[17,hem],[22,29],[14,30]],gear.color);
          line([[25,13],[32,23],[40,13]],gear.trim,3.5);
          line([[22,33],[42,33]],gear.trim,3.2);
          line([[21,hem-3],[29,hem-3]],gear.trim,2.4);
          line([[35,hem-3],[43,hem-3]],gear.trim,2.4);
          if(gear.finish==="dragon")for(const y of [24,40,46])line([[26,y],[32,y+2],[38,y]],gear.trim,2.3);
        }else{
          tile([[11,16],[26,9],[32,14],[39,9],[53,16],[51,31],[45,33],[44,55],[20,55],[19,33],[12,31]],gear.color);
          line([[13,17],[26,12],[32,18],[39,12],[52,17]],gear.trim,4);
          line([[21,48],[43,48]],gear.trim,3);
          tile([[32,23],[39,32],[32,40],[25,32]],gear.trim);
          if(gear.finish==="corrupted"){ctx.fillStyle="#ffcf96";ctx.beginPath();ctx.arc(32,32,5.4,0,Math.PI*2);ctx.fill();line([[32,27],[32,37]],"#12051c",2);}
        }
      } else if(id==="crossbow"){
        line([[32,51],[32,15]],"#624334",10);
        line([[31,47],[31,12]],"#c6d8d9",3);
        line([[9,28],[14,18],[25,16],[32,22],[39,16],[50,18],[55,28]],"#4a6a77",6);
        line([[9,28],[32,36],[55,28]],"#f4dfb4",2);
        tile([[28,12],[32,5],[36,12],[32,19]],"#d7e8e6");
      } else if(id==="bolt"){
        line([[15,50],[47,19]],"#a8794c",5);
        tile([[41,19],[55,10],[49,25],[41,28]],"#bccfd8");
        tile([[13,39],[24,36],[24,46],[14,54]],"#866744");
      } else if(weapon?.family==="gauntlet"){
        if(weapon.corrupted)glowDisc(32,32,27,"#d962ff99","#d962ff00");
        tile([[8,30],[13,17],[24,16],[27,12],[47,15],[54,23],[51,42],[42,51],[13,48]],weapon.color);
        tile([[10,34],[27,35],[28,46],[13,47]],"#28262f");
        tile([[27,17],[42,16],[51,23],[49,30],[28,27]],weapon.trim);
        tile([[28,31],[51,32],[47,40],[39,44],[29,41]],weapon.color);
        if(weapon.corrupted){ctx.fillStyle="#ffcf96";ctx.beginPath();ctx.arc(24,27,5,0,Math.PI*2);ctx.fill();line([[24,23],[24,31]],"#12051c",2);}
      } else if(weapon?.family==="mace"){
        line([[12,52],[36,29]],"#584235",8);
        tile([[27,16],[42,8],[55,17],[56,28],[46,41],[33,40],[26,30]],weapon.color);
        line([[30,21],[42,29],[53,24]],weapon.trim,4);
        line([[35,13],[44,22],[51,17]],"#e0dcce",2);
      } else if(weapon?.style==="wand"){
        line([[13,51],[46,16]],"#593936",7);
        line([[19,46],[43,19]],weapon.color,3);
        tile([[44,8],[53,9],[56,17],[47,22],[42,17]],weapon.trim);
        for(const [x,y] of [[34,16],[50,29],[60,7]])line([[x-2,y],[x+2,y]],"#d6a88a",1.5);
      } else if(weapon&&forgedBlades[weapon.style]){
        if(weapon.corrupted)glowDisc(34,30,28,"#d962ff99","#d962ff00");
        const blade=forgedBlades[weapon.style],top=Math.max(...blade.path.map(([,y])=>y)),scale=36/top;
        const originX=26,originY=40;
        const project=([x,y])=>[originX+(y*.86+x*.51)*scale,originY+(-y*.51+x*.86)*scale];
        line([[13,50],[27,40]],"#714d37",weapon.twoHanded?9:6);
        line([[21,32],[34,45]],weapon.trim,5);
        tile(blade.path.map(project),weapon.color);
        line(blade.fuller.map(project),weapon.trim,2);
        if(weapon.corrupted){ctx.fillStyle="#ffcf96";ctx.beginPath();ctx.arc(28,38,4.6,0,Math.PI*2);ctx.fill();line([[28,34],[28,42]],"#12051c",1.9);}
      } else if(weapon?.style){
        const {color,trim,family}=weapon;
        if(weapon.corrupted)glowDisc(36,28,28,"#d962ff99","#d962ff00");
        if(family==="sword"){
          line([[12,54],[27,39]],"#775541",7);
          const tip=weapon.style==="bronze"?[55,11]:[56,8];
          tile([[20,36],[43,13],tip,[54,19],[31,45]],color);
          line([[29,37],[51,13]],trim,2);
          line([[16,32],[32,48]],color,6);
        }else if(family==="bow"){
          const path=weapon.style==="bamboo"?[[16,8],[18,16],[38,22],[45,34],[42,46],[29,54]]:
            [[10,8],[26,14],[44,23],[47,39],[39,52],[29,57]];
          line([path[0],path.at(-1)],"#e0ded2",2);
          line(path,"#252a31",8);line(path,color,5);
          line(path.slice(2,4),trim,4);
          if(weapon.corrupted){ctx.fillStyle="#ffcf96";ctx.beginPath();ctx.arc(44,31,4.5,0,Math.PI*2);ctx.fill();line([[44,27],[44,35]],"#12051c",1.8);}
        }else{
          line([[12,55],[39,22]],"#283039",9);line([[12,55],[39,22]],trim,3);
          tile([[46,6],[56,19],[42,33],[34,20]],color);
          line([[34,19],[38,8],[46,6],[53,11],[57,20]],trim,2.3);
          line([[42,28],[53,18]],trim,2);
          if(weapon.corrupted){ctx.fillStyle="#ffcf96";ctx.beginPath();ctx.arc(45,19,5.5,0,Math.PI*2);ctx.fill();line([[45,14],[45,24]],"#12051c",2);}
        }
      } else if (id==="iron_sword") {
        line([[13,53],[29,37]],"#a87a54",7);
        tile([[22,35],[47,11],[55,9],[53,17],[30,44]],"#b7d0d7");
        tile([[28,36],[53,13],[50,20],[32,41]],"#e4f5eb");
        line([[17,30],[33,47]],"#d2a256",6);
      } else if (id==="bow") {
        const route=[[15,8],[30,14],[44,29],[43,44],[33,56]];
        line([[15,8],[27,32],[33,56]],"#e7dec2",2);
        line(route,"#301f19",9);line(route,"#ad7340",5);
        line([[36,26],[43,34]],"#dbc591",5);
      } else if (id==="wind_staff") {
        line([[15,55],[42,21]],"#402e23",9);line([[15,55],[42,21]],"#b48958",5);
        tile([[44,7],[55,16],[49,30],[37,28],[33,17]],"#c79b4a");
        tile([[43,10],[51,17],[45,25],[38,22],[37,16]],"#73ebe0");
        line([[15,53],[22,49]],"#d8b577",3);
      } else {
        line([[13,52],[47,18]],"#a8835b",4);
        tile([[42,14],[56,10],[52,25]],"#bcdde2");
        tile([[11,43],[26,39],[20,56],[12,57]],"#deb775");
      }
      const source=canvas.toDataURL("image/png");
      icons.set(id,source);
      return source;
    }

    const haloSize=48;
    const haloData=new Uint8Array(haloSize*haloSize*4);
    for(let y=0;y<haloSize;y++)for(let x=0;x<haloSize;x++){
      const radius=Math.hypot((x+.5)/haloSize-.5,(y+.5)/haloSize-.5)*2;
      const alpha=Math.pow(Math.max(0,1-radius),1.85);
      haloData.set([255,255,255,Math.round(alpha*255)],(y*haloSize+x)*4);
    }
    const haloTexture=new THREE.DataTexture(haloData,haloSize,haloSize);
    haloTexture.magFilter=haloTexture.minFilter=THREE.LinearFilter;
    haloTexture.needsUpdate=true;
    const emblemBack=new THREE.CylinderGeometry(.5,.5,1,6);
    const emblemColors=[0xffb434,0x51e6e0,0x9af482,0xc4a8ff];
    const emblemMaterials=new Map();
    function emblem(parent,index,pos,scale=1){
      const shape=index%emblemColors.length,color=emblemColors[shape];
      if(!emblemMaterials.has(shape)){
        emblemMaterials.set(shape,{
          light:new THREE.MeshBasicMaterial({color:new THREE.Color(color).lerp(new THREE.Color(0xfffbe8),.43),toneMapped:false}),
          halo:new THREE.SpriteMaterial({map:haloTexture,color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,opacity:.92})
        });
      }
      const {light,halo}=emblemMaterials.get(shape),group=new THREE.Group();
      group.position.set(...pos);
      group.scale.setScalar(scale);
      group.name="Insígnia "+shape;
      parent.add(group);
      mesh(group,emblemBack,brass,[0,0,0],[.13,.032,.13],[Math.PI/2,0,0]);
      mesh(group,emblemBack,dark,[0,0,-.017],[.106,.012,.106],[Math.PI/2,0,0]);
      const sigils=[
        [[[-.034,-.026],[0,.042]],[[0,.042],[.034,-.026]],[[-.025,-.008],[.025,-.008]]],
        [[[-.028,.037],[.016,.037]],[[.006,.036],[.006,.007]],[[.006,.007],[.03,-.03]],[[.03,-.03],[-.03,-.03]],[[-.03,-.03],[-.005,.007]],[[-.005,.007],[-.005,.036]]],
        [[[-.045,-.019],[-.013,.026]],[[-.013,.026],[.008,-.002]],[[.008,-.002],[.025,.033]],[[.025,.033],[.046,-.021]]],
        [[[0,.043],[.031,0]],[[.031,0],[0,-.043]],[[0,-.043],[-.031,0]],[[-.031,0],[0,.043]]]
      ];
      for(const [a,b] of sigils[shape]){
        const ray=bar(group,light,[...a,-.028],[...b,-.028],.008,.012);
        ray.castShadow=false;
      }
      const aura=new THREE.Sprite(halo);
      aura.name="Halo da insígnia";
      aura.position.z=-.034;
      aura.scale.set(.39,.39,1);
      group.add(aura);
      group.userData.aura=aura;
      return group;
    }

    const alchemistFabrics=new Map();
    const alchemistThemes={
        pigment:[0x462646,0x805265,0xde977d,3],
        crystal:[0x384454,0x718398,0xe4ad6c,3],
        alloy:[0x492e30,0x78443e,0xc67c49,0],
        water:[0x153d45,0x24636c,0x71c6b8,1],
        thermal:[0x2c365c,0x596486,0xb7d5ed,1],
        wandering:[0x39324e,0x62537c,0xb9aae1,2]
    };
    function alchemistAttire(body,head,arms,school){
      if(!Object.hasOwn(alchemistThemes,school))school="wandering";
      const [base,edgeColor,trimColor,sign]=alchemistThemes[school];
      if(!alchemistFabrics.has(school))alchemistFabrics.set(school,{
        fabric:new THREE.MeshLambertMaterial({color:base}),
        fold:new THREE.MeshLambertMaterial({color:edgeColor}),
        trim:new THREE.MeshStandardMaterial({color:trimColor,metalness:.25,roughness:.48})
      });
      const {fabric,fold,trim}=alchemistFabrics.get(school);
      const robe=new THREE.Group();
      robe.name="Traje alquímico "+school;
      robe.position.y=1.12;
      body.add(robe);
      bevel(robe,fabric,[0,.02,0],[.61,.67,.355]);
      bevel(robe,fold,[0,-.263,0],[.59,.095,.361]);
      bevel(robe,leather,[0,-.292,-.013],[.616,.075,.373]);
      bevel(robe,trim,[0,-.29,-.207],[.096,.087,.035]);
      const cape=new THREE.Group();
      cape.position.set(0,.30,.188);
      robe.add(cape);
      const lengths={pigment:.71,crystal:.85,alloy:.56,water:.79,thermal:.96,wandering:.75};
      const length=lengths[school]||lengths.wandering;
      for(const side of [-1,1]){
        const x=side*.161;
        bevel(cape,fabric,[x,-length*.48,.066],[.35,length,.085],[-.12,0,side*.105]);
        bevel(cape,fold,[x*1.72,-length*.47,.075],[.075,length*.96,.095],[-.12,0,side*.11]);
        bar(cape,trim,[side*.26,-length+.025,.135],[side*.33,-length+.032,.135],.022);
        const sash=school==="alloy"?side*.197:side*.095;
        bar(robe,trim,[side*.23,.262,-.177],[sash,-.197,-.205],school==="alloy"?.028:.017);
        const arm=arms[side===-1?0:1];
        if(arm){
          bevel(arm,fold,[side*.018,-.102,0],[.235,.246,.259],[0,0,side*.10]);
          if(arm.userData.lower)bevel(arm.userData.lower,trim,[0,-.233,0],[.196,.047,.211]);
        }
      }
      emblem(robe,sign,[school==="alloy"?.14:0,.151,-.218],1.08);
      if(school==="pigment"){
        for(let i=0;i<6;i++){
          const t=i/5,side=i%2?1:-1;
          bevel(head,fold,[(t-.5)*.46,.267+Math.sin(t*Math.PI)*.061,-.107],[.113,.088,.128],[0,t,0]);
          mesh(head,globe,i%2?trim:fabric,[(t-.5)*.46,.282+Math.sin(t*Math.PI)*.078,-.181],[.05,.058,.04],[0,0,side*.36]);
        }
        for(const side of [-1,1])bevel(robe,fold,[side*.209,-.18,-.184],[.151,.235,.044],[0,0,-side*.28]);
      }else if(school==="alloy"){
        bevel(head,fabric,[0,.257,.025],[.493,.119,.426]);
        bevel(head,trim,[0,.20,-.207],[.453,.051,.11]);
        bevel(robe,leather,[0,-.39,-.088],[.339,.32,.19]);
        for(const side of [-1,1]){
          bevel(head,trim,[side*.23,.12,.035],[.064,.245,.275]);
          bevel(robe,trim,[side*.157,-.39,-.2],[.033,.25,.035]);
        }
      }else{
        bevel(head,fabric,[0,.266,.06],[.52,.138,.444]);
        bevel(head,fabric,[0,.061,.207],[.47,.417,.117]);
        for(const side of [-1,1]){
          bevel(head,fold,[side*.224,.084,.042],[.102,.364,.405],[0,0,side*.081]);
          bar(head,trim,[side*.187,.263,-.159],[side*.237,-.064,-.151],.026);
        }
        if(school==="crystal"){
          mesh(head,globe,trim,[0,.304,-.157],[.064,.102,.052]);
          for(const side of [-1,1])mesh(head,globe,trim,[side*.126,.279,-.179],[.043,.061,.035],[0,0,side*.25]);
          for(const side of [-1,1])bevel(robe,fold,[side*.172,-.35,-.12],[.192,.23,.149],[0,0,-side*.16]);
        }else if(school==="water"){
          for(const side of [-1,1]){
            mesh(head,torus,trim,[side*.097,.047,-.253],[.084,.065,1]);
            mesh(head,globe,crystal,[side*.097,.047,-.252],[.056,.045,.018]);
          }
          for(let i=0;i<3;i++)bar(cape,trim,[-.22,-.43-i*.071,.13],[.22,-.39-i*.071,.13],.011);
        }else if(school==="thermal"){
          bevel(robe,fold,[0,.298,-.012],[.64,.127,.384],[.08,0,0]);
          for(let i=0;i<5;i++)bevel(cape,trim,[(i-2)*.108,-.62,.132],[.034,.034,.017],[0,0,.78]);
        }
      }
      return cape;
    }

    function avatar(p) {
      const {skin, skinLight, skinShade, sleeve, coat, coatShade, pants, hair, boot} = p;
      const root = new THREE.Group();
      root.name = "Explorador do QuimiCraft";
      const torso = new THREE.Group();
      const hipHeight=.838;
      torso.position.y = 1.14;
      root.add(torso);
      bevel(torso,coat,[0,0,0],[.55,.66,.33]);
      const feminineChest=new THREE.Group();
      feminineChest.name="Caimento do busto";
      torso.add(feminineChest);
      const chestFit=new THREE.Group();
      chestFit.name="Equipamento do torso";
      torso.add(chestFit);
      const backFit=new THREE.Group();
      backFit.name="Equipamento das costas";
      torso.add(backFit);
      for(const side of [-1,1]){
        bevel(feminineChest,coat,[side*.114,.055,-.149],[.243,.207,.236],[.08,side*.054,side*.05]);
        bevel(feminineChest,coatShade,[side*.110,-.021,-.207],[.207,.07,.105],[.32,0,-side*.05]);
      }
      const outfits=Array.from({length:6},()=>new THREE.Group());
      outfits.slice(1).forEach((group,index)=>{group.name="Traje "+(index+1);torso.add(group)});
      const [,field,workshop,nomad,mystic,hiker]=outfits;
      for(const side of [-1,1]){
        bevel(field,sleeve,[side*.192,.035,-.196],[.178,.308,.085]);
        bevel(field,brass,[side*.193,.082,-.246],[.132,.025,.012]);
        bevel(workshop,leather,[side*.184,.029,-.208],[.079,.396,.037],[0,0,side*.12]);
        bevel(nomad,sleeve,[side*.19,.256,.013],[.263,.139,.437],[0,0,side*.18]);
        bevel(mystic,coatShade,[side*.253,.01,.156],[.124,.54,.27],[0,0,side*.08]);
        bar(mystic,brass,[side*.234,.246,-.189],[side*.042,.023,-.259],.029);
        bevel(hiker,coatShade,[side*.207,.064,-.167],[.158,.274,.124],[0,0,side*.09]);
        bevel(hiker,thread,[side*.203,-.03,-.238],[.105,.035,.012]);
      }
      bevel(workshop,sleeve,[0,-.172,-.171],[.42,.263,.083]);
      bevel(workshop,brass,[0,-.132,-.22],[.347,.024,.017]);
      bevel(nomad,sleeve,[0,.244,-.129],[.396,.108,.187]);
      bevel(nomad,coatShade,[-.058,.107,-.218],[.183,.163,.103],[.15,0,-.32]);
      bevel(mystic,sleeve,[0,-.163,.166],[.452,.398,.087],[.17,0,0]);
      bevel(hiker,sleeve,[0,.212,.055],[.48,.151,.37]);
      const shoulderPanels=[];
      bevel(torso,coatShade,[0,-.205,0],[.49,.24,.32]);
      for (const side of [-1,1]) {
        bevel(torso,sleeve,[side*.217,.202,-.015],[.126,.208,.331],[0,0,side*.13]);
        bevel(torso,coatShade,[side*.128,.143,-.172],[.079,.25,.038],[0,0,side*.31]);
        bevel(torso,coat,[side*.174,-.142,-.181],[.153,.132,.045]);
        box(torso,brass,[side*.169,-.097,-.206],[.075,.019,.015]);
        bevel(torso,leather,[side*.211,0,.151],[.059,.645,.064],[0,0,side*.11]);
      }
      box(torso,leather,[0,-.27,0],[.532,.071,.345]);
      bevel(torso,brass,[0,-.27,-.185],[.105,.072,.037]);
      box(torso,dark,[0,-.272,-.206],[.05,.028,.011]);
      box(torso,sleeve,[0,.093,-.172],[.058,.223,.025]);
      box(torso,metal,[.164,.098,-.185],[.085,.06,.025],[0,0,.07]);
      box(torso,crystal,[.168,.099,-.204],[.052,.022,.012]);
      const pack = bevel(torso,dark,[0,.027,.252],[.366,.409,.196]);
      bevel(torso,leather,[0,.011,.324],[.283,.281,.095]);
      bevel(torso,brass,[0,.054,.378],[.175,.061,.018]);
      for (const side of [-1,1]) box(torso,metal,[side*.155,-.15,.33],[.051,.04,.06]);

      const head = new THREE.Group();
      head.position.y=1.74;
      root.add(head);
      bevel(root,skinShade,[0,1.49,0],[.172,.186,.177]);
      bevel(head,skin,[0,.007,0],[.421,.405,.407]);
      bevel(head,skinShade,[0,-.125,.037],[.374,.151,.321]);
      bevel(head,skin,[0,-.127,-.117],[.31,.132,.164]);
      const eyes=[];
      for (const side of [-1,1]) {
        bevel(head,skinShade,[side*.223,-.025,.015],[.064,.122,.108]);
        bevel(head,skinLight,[side*.241,-.019,-.009],[.038,.067,.055]);
        bevel(head,skinLight,[side*.153,-.071,-.184],[.077,.061,.04]);
        const eye = new THREE.Group();
        eye.position.set(side*.088,.038,-.191);
        head.add(eye);eyes.push(eye);
        bevel(eye,dark,[0,0,0],[.086,.057,.022]);
        box(eye,edge,[0,-.001,-.014],[.07,.035,.012]);
        box(eye,leather,[side*-.009,-.001,-.022],[.036,.036,.013]);
        box(eye,dark,[side*-.012,-.001,-.03],[.018,.031,.01]);
        box(eye,edge,[.008,.01,-.036],[.01,.009,.005]);
        bevel(head,hair,[side*.092,.104,-.202],[.099,.025,.021],[0,0,side*.09]);
      }
      bevel(head,skinLight,[0,-.026,-.209],[.059,.087,.056]);
      bevel(head,skinShade,[0,-.119,-.203],[.091,.026,.015]);
      const headGear = new THREE.Group();
      head.add(headGear);
      const hairStyles=[];
      for (const style of ["short","long","bun","mohawk","coils","braids","buzz","bob","pony","side","afro","locks","shaved"]) {
        const group=new THREE.Group();
        group.name="Cabelo "+style;
        group.visible=style==="short";
        head.add(group);
        hairStyles.push(group);
        if(style==="shaved")continue;
        if(style==="buzz"){
          bevel(group,hair,[0,.174,.01],[.413,.094,.407]);
          bevel(group,hair,[0,.122,.188],[.387,.087,.044]);
          continue;
        }
        if(style==="side"){
          for(let i=0;i<5;i++)bevel(group,hair,[(i-2)*.079,.214-i*.01,-.052-i*.021],[.126,.098,.285],[.11,i*.095,-.27]);
        }
        if(style==="afro"){
          for(let j=0;j<3;j++)for(let i=0;i<4;i++){
            bevel(group,hair,[(i-1.5)*.134,.222+(i===0||i===3?0:.062),(j-1)*.151+.022],[.185,.213,.202],[j*.17,i*.33,.15*i]);
          }
          for(const side of [-1,1])bevel(group,hair,[side*.215,.164,.1],[.154,.185,.282],[0,0,side*.2]);
        }
        if(style==="pony"){
          bevel(group,sleeve,[0,.193,.229],[.145,.103,.144]);
          for(let i=0;i<4;i++)bevel(group,hair,[.027*i,.135-i*.086,.259+i*.021],[.149-i*.016,.145,.125],[.33,i*.28,.1]);
        }
        if(style==="bob"||style==="locks"){
          for(const side of [-1,1])for(let i=0;i<3;i++){
            const len=style==="bob"?.19:.265+i*.045;
            bevel(group,hair,[side*(.202+i*.009),.043-len*.35,.151-i*.117],[.088,len,.108],[.15,side*.12,side*.19]);
            if(style==="locks")bevel(group,brass,[side*(.205+i*.009),.043-len*.79,.15-i*.117],[.085,.025,.085],[0,0,side*.19]);
          }
        }
        if (style==="mohawk") {
          for (let i=0;i<5;i++) bevel(group,hair,[0,.231+Math.sin(i*Math.PI/5)*.06,(i-2)*.105],[.123,.184,.121],[(i-2)*.15,0,0]);
          continue;
        }
        if(style==="coils"){
          for(let j=0;j<3;j++)for(let i=0;i<4;i++){
            bevel(group,hair,[(i-1.5)*.101,.188+(i%2+j%2)*.017,(j-1)*.117],[.124,.116,.144],[.12*j,.3*i,.18*j]);
          }
        }
        bevel(group,hair,[0,.162,.009],[.435,.158,.431]);
        bevel(group,hair,[0,.07,.177],[.388,.169,.076]);
        for (const side of [-1,1]) {
          bevel(group,hair,[side*.189,.095,.027],[.061,.177,.341],[0,0,side*.05]);
          for (let q=0;q<3;q++) bevel(group,hair,[side*(.083+q*.049),.149-q*.023,-.203],[.076,.09,.067],[0,0,side*.24]);
          if (style==="braids") {
            for(let i=0;i<5;i++)bevel(group,i===4?sleeve:hair,[side*(.217+i*.012),.028-i*.072,.115],[.071,.095,.079],[.14,i*.43,-side*.12]);
          }
          if (style==="long") {
            for (let i=0;i<3;i++) bevel(group,hair,[side*(.173+i*.027),-.098-i*.087,.164+i*.015],[.118,.23,.126],[.12,side*.18,side*.06]);
          }
        }
        if (style==="long") bevel(group,hair,[0,-.16,.189],[.361,.455,.134],[.09,0,0]);
        if (style==="bun") {
          bevel(group,sleeve,[0,.232,.148],[.154,.096,.165]);
          bevel(group,hair,[0,.3,.187],[.249,.184,.223],[.2,.33,.18]);
        }
      }

      const tucked=new THREE.Group();
      tucked.name="Cabelo ajustado ao equipamento";
      head.add(tucked);
      bevel(tucked,hair,[0,.178,.080],[.398,.103,.260]);
      const tuckedFront=bevel(tucked,hair,[0,.164,-.073],[.398,.087,.220]);
      bevel(tucked,hair,[0,.101,.159],[.347,.109,.106]);
      const tied=new THREE.Group();
      tied.name="Mechas presas na nuca";
      tucked.add(tied);
      bevel(tied,hair,[0,-.068,.191],[.281,.244,.084]);
      bevel(tied,sleeve,[0,-.147,.211],[.091,.037,.054]);
      bevel(tied,hair,[0,-.208,.208],[.118,.131,.078],[.15,0,.12]);
      const beards=Array.from({length:6},()=>new THREE.Group());
      beards.forEach((group,i)=>{group.name="Barba "+i;head.add(group)});
      for(const side of [-1,1]){
        bevel(beards[1],hair,[side*.047,-.074,-.211],[.083,.024,.037],[0,0,-side*.19]);
        bevel(beards[2],hair,[side*.156,-.114,-.142],[.095,.108,.107],[0,0,side*.28]);
        bevel(beards[4],hair,[side*.125,-.13,-.167],[.151,.124,.09],[0,0,side*.25]);
        bevel(beards[5],hair,[side*.119,-.135,-.145],[.131,.139,.116],[0,0,side*.33]);
      }
      bevel(beards[2],hair,[0,-.188,-.127],[.324,.071,.14]);
      bevel(beards[3],hair,[0,-.167,-.176],[.112,.113,.098],[.24,0,0]);
      bevel(beards[4],hair,[0,-.181,-.158],[.279,.102,.123]);
      bevel(beards[5],hair,[0,-.19,-.159],[.255,.128,.132]);
      bevel(beards[5],hair,[0,-.276,-.189],[.126,.159,.086],[.25,0,-.11]);
      bevel(beards[5],brass,[.009,-.313,-.194],[.112,.024,.092],[.25,0,-.11]);

      const gloves=[];
      const shoes=[];
      const footwear=[];
      const gloveMat = new THREE.MeshLambertMaterial({color:0x526d66});
      const shoeMat = new THREE.MeshLambertMaterial({color:0x40484e});

      function hand(parent, side) {
        const cuff=bevel(parent,gloveMat,[0,.04,-.005],[.161,.091,.163]);
        gloves.push(cuff);
        const palm=bevel(parent,skin,[0,-.014,.012],[.151,.125,.147]);
        const fingers=[];
        for(let i=0;i<4;i++){
          const finger=new THREE.Group(),tip=new THREE.Group();
          finger.position.set((i-1.5)*.034,-.055,-.043);
          tip.position.y=-.045;
          parent.add(finger);
          finger.add(tip);
          const a=bevel(finger,skinLight,[0,-.025,-.008],[.035,.058,.038]);
          const b=bevel(tip,skin,[0,-.018,0],[.034,.042,.035]);
          fingers.push({finger,tip,a,b});
        }
        const thumb=new THREE.Group();
        thumb.position.set(side*.076,-.009,-.04);
        parent.add(thumb);
        const pad=bevel(thumb,skinShade,[0,-.036,-.015],[.052,.075,.049]);
        function flex(strength,dt){
          const smooth=1-Math.exp(-14*dt);
          fingers.forEach(({finger,tip},i)=>{
            finger.rotation.x=THREE.MathUtils.lerp(finger.rotation.x,.18+strength*(1.17+i*.05),smooth);
            tip.rotation.x=THREE.MathUtils.lerp(tip.rotation.x,.15+strength*1.18,smooth);
          });
          thumb.rotation.y=side*(.10+strength*.52);
          thumb.rotation.z=side*(.28+strength*.43);
        }
        function dress(gloved){
          palm.material=gloved?gloveMat:skin;
          pad.material=gloved?gloveMat:skinShade;
          for(const {a,b} of fingers){a.material=gloved?gloveMat:skinLight;b.material=gloved?gloveMat:skin}
        }
        return {flex,dress};
      }

      function arm(side) {
        const shoulder = new THREE.Group();
        const elbow = new THREE.Group();
        const wrist = new THREE.Group();
        shoulder.position.set(side*.365,1.406,.03);
        root.add(shoulder);
        bevel(shoulder,coat,[0,-.115,0],[.194,.285,.237],[0,0,side*.074]);
        bevel(shoulder,sleeve,[side*.04,-.039,-.03],[.134,.117,.204]);
        shoulderPanels.push(bevel(shoulder,coatShade,[side*.027,-.055,-.025],[.209,.164,.258],[0,0,side*.1]));
        elbow.position.y=-.26;
        shoulder.add(elbow);
        bevel(elbow,coatShade,[0,-.083,0],[.163,.227,.186]);
        bevel(elbow,sleeve,[0,-.177,0],[.184,.066,.207]);
        wrist.position.set(0,-.244,-.027);
        elbow.add(wrist);
        const fingers=hand(wrist,side);
        return {shoulder,elbow,wrist,fingers};
      }

      function leg(side) {
        const hip = new THREE.Group();
        const knee = new THREE.Group();
        hip.position.set(side*.148,hipHeight,0);
        root.add(hip);
        bevel(hip,pants,[0,-.183,0],[.257,.426,.264]);
        bevel(hip,coatShade,[side*.097,-.136,.022],[.066,.171,.158]);
        knee.position.y=-.374;
        hip.add(knee);
        bevel(knee,pants,[0,-.124,.004],[.213,.285,.217]);
        const styles=Array.from({length:5},()=>new THREE.Group());
        const [standard,sneaker,hiker,formal,sandals]=styles;
        styles.forEach((group,index)=>{group.name="Calçado "+index;knee.add(group)});
        footwear.push(styles);
        for(const group of styles)box(group,group===sneaker?thread:dark,[0,-.407,-.051],[.246,.049,.334]);
        bevel(standard,boot,[0,-.291,-.047],[.24,.209,.324]);
        for(let i=0;i<2;i++)bar(standard,thread,[-.067+i*.014,-.227,-.181],[.07-i*.017,-.255-i*.038,-.184],.016,.016);
        bevel(sneaker,sleeve,[0,-.347,-.057],[.238,.119,.314]);
        bevel(sneaker,thread,[0,-.343,-.189],[.191,.068,.067]);
        for(const z of [-.12,-.084])box(sneaker,thread,[0,-.279,z],[.107,.017,.016]);
        bevel(hiker,leather,[0,-.289,-.058],[.24,.236,.318]);
        bevel(hiker,brass,[side*.12,-.244,-.101],[.031,.071,.079]);
        bevel(hiker,dark,[0,-.358,-.179],[.239,.086,.098]);
        bevel(formal,dark,[0,-.339,-.063],[.234,.133,.323]);
        bevel(formal,brass,[0,-.275,-.105],[.131,.02,.047]);
        bevel(sandals,skin,[0,-.359,-.056],[.217,.083,.287]);
        for(const z of [-.129,.023])bevel(sandals,leather,[0,-.329,z],[.229,.046,.047],[0,side*.17,0]);
        shoes.push(bevel(knee,shoeMat,[0,-.301,-.066],[.258,.251,.357]));
        const thighFit=new THREE.Group(),shinFit=new THREE.Group(),bootFit=new THREE.Group();
        thighFit.name="Equipamento da coxa";shinFit.name="Equipamento da canela";bootFit.name="Bota equipada";
        hip.add(thighFit);knee.add(shinFit,bootFit);
        return {hip,knee,thighFit,shinFit,bootFit,side};
      }
      const arms=[arm(-1),arm(1)];
      const legs=[leg(-1),leg(1)];
      const first = new THREE.Group();
      first.name="Mãos do explorador";
      const hands=[-1,1].map(side=>{
        const group = new THREE.Group();
        group.position.set(side===1?.46:-.58,side===1?-.586:-.67,-1.1);
        group.rotation.set(-.35,side*.14,side*.15);
        first.add(group);
        bevel(group,coat,[side*.035,-.177,.221],[.195,.209,.507],[-.66,0,side*.09]);
        bevel(group,sleeve,[0,-.051,.087],[.206,.115,.121],[-.32,0,0]);
        const cuff=bevel(group,coatShade,[side*.018,-.13,.143],[.206,.115,.198],[-.5,0,side*.1]);
        const stitch=bevel(group,brass,[side*.067,-.111,.097],[.051,.048,.059],[-.5,0,0]);
        const fingers=hand(group,side);
        return {group,fingers,cuff,stitch};
      });
      const heldFirst = new THREE.Group();
      heldFirst.position.set(0,-.046,-.094);
      hands[1].group.add(heldFirst);
      const heldOffFirst=new THREE.Group();
      heldOffFirst.position.set(0,.041,-.174);
      hands[0].group.add(heldOffFirst);
      const heldThird = new THREE.Group();
      heldThird.position.set(0,-.046,-.094);
      heldThird.rotation.set(-.13,0,-.10);
      arms[1].wrist.add(heldThird);
      const leftWrist = new THREE.Group();
      arms[0].wrist.add(leftWrist);
      const gear = new THREE.Group();
      root.add(gear);

      const marks=emblemColors.map((_,index)=>emblem(torso,index,[-.151,.152,-.212]));
      const pick=(list,value)=>list[Number(value)]?Number(value):0;
      let currentHair=0,currentBeard=0,currentOutfit=0,currentShoes=0,currentBadge=0;
      let headEquipment,faceEquipment,footEquipment,chestEquipment,legEquipment,hasBust=false;
      function syncWear(){
        const helmet=headEquipment==="iron_helmet"||headEquipment==="melee_helm",
          covered=!!headEquipment&&headEquipment!=="mage_circlet"||!!faceEquipment;
        const visor=headEquipment==="face_shield";
        hairStyles.forEach((group,index)=>{group.visible=!covered&&index===currentHair});
        tucked.visible=covered&&!helmet&&currentHair!==12;
        tuckedFront.visible=!visor;
        tied.visible=[1,2,5,7,8,11].includes(currentHair);
        beards.forEach((group,index)=>{group.visible=!faceEquipment&&index===currentBeard&&index!==0&&(!visor||index!==5)});
        const armored=!!chestEquipment;
        outfits.forEach((group,index)=>{group.visible=!armored&&index===currentOutfit});
        shoulderPanels.forEach(panel=>{panel.visible=!armored&&[1,3,4,5].includes(currentOutfit)});
        for(const {cuff,stitch} of hands){
          cuff.visible=!armored&&[1,3,4,5].includes(currentOutfit);
          cuff.scale.z=currentOutfit===4?.243:.159;
          cuff.material=currentOutfit===3?sleeve:coatShade;
          stitch.visible=!armored&&[1,4].includes(currentOutfit);
        }
        feminineChest.visible=hasBust;
        feminineChest.scale.z=armored?.69:1;
        chestFit.position.z=hasBust?-.037:0;
        for(const styles of footwear)styles.forEach((group,index)=>{group.visible=!footEquipment&&index===currentShoes});
        marks.forEach((mark,index)=>{
          mark.visible=index===currentBadge;
          mark.position.z=hasBust||armored||currentOutfit!==0?-.273:-.213;
        });
      }
      function setAppearance(config){
        hasBust=Number(config.silhouette)===1;
        torso.scale.set(hasBust?.923:1,1,hasBust?1.045:1);
        head.scale.set(hasBust?.95:1,hasBust?1.012:1,1);
        arms.forEach(({shoulder},index)=>{shoulder.position.x=(index?1:-1)*(hasBust?.333:.365)});
        legs.forEach(({hip},index)=>{hip.position.x=(index?1:-1)*(hasBust?.164:.148)});
        currentHair=pick(hairStyles,config.hairStyle);
        currentBeard=pick(beards,config.beard);
        currentOutfit=pick(outfits,config.outfit);
        currentShoes=pick(footwear[0],config.shoes);
        currentBadge=pick(marks,config.badge);
        syncWear();
      }

      function setEquipment(handId,footId,backId,headId,faceId,chestId,legId){
        const apparel=globalThis.QuimiCraftArsenal?.apparel;
        const leggings=apparel?.[legId],boots=apparel?.[footId];
        if(legId!==legEquipment)for(const {thighFit,shinFit,side} of legs){
          thighFit.clear();shinFit.clear();
          if(leggings)apparelLeg(thighFit,shinFit,leggings,side);
        }
        if(footId!==footEquipment)for(const {bootFit,side} of legs){
          bootFit.clear();
          if(boots)apparelBoot(bootFit,boots,side);
        }
        legEquipment=legId;
        headEquipment=headId;faceEquipment=faceId;footEquipment=footId;chestEquipment=chestId;
        syncWear();
        const handColors={chemical_gloves:0x728c4c,heat_gloves:0xa26143,insulated_gloves:0xcbd5dd};
        const footColors={iron_boots:0x92abb3,rubber_boots:0x9a7938,insulated_boots:0x465b70,refractory_boots:0xb47655,fins:0x3c978f};
        gloveMat.color.set(handColors[handId]||0xbad2d4);
        shoeMat.color.set(footColors[footId]||0x425057);
        for (const node of gloves) node.visible=!!handId;
        for(const arm of arms)arm.fingers.dress(!!handId);
        for(const hand of hands)hand.fingers.dress(!!handId);
        for (const node of shoes) {
          node.visible=!!footId&&!boots;
          node.scale.z=footId==="fins"?.49:.357;
        }
        pack.visible=!backId;
      }

      function animate({dt, now, motion, moving, sprint, crouch, swim, airborne, pitch, action, firstType, offhand=false,offhandAction=0,punchHand=1,
        shieldLift=0,shieldRecoil=0,activity=null, aspect = 16/9}) {
        const aura=marks[currentBadge].userData.aura;
        const halo=.39+Math.sin(now*.003)*.026*motion;
        aura.scale.set(halo,halo,1);
        const ease = 1-Math.exp(-dt*14);
        const mix = THREE.MathUtils.lerp;
        const bob = (moving ? Math.sin(now*(sprint?.015:.01))*.026 : Math.sin(now*.0025)*.005)*motion;
        const gait = Math.sin(now*(sprint?.0128:crouch?.0065:.009));
        const swing = moving ? gait*(sprint?.68:crouch?.26:.43)*motion : 0;
        const mounted=activity?.kind==="ride",driver=mounted&&activity.vehicle,pedal=mounted&&activity.pedaling;
        const steer=driver?(activity.steer||0):0;
        const breath = Math.sin(now*.0023)*.012*motion;
        const hems=chestFit.children[0]?.userData.hems;
        hems?.forEach((hem,i)=>{
          hem.rotation.x=mix(hem.rotation.x,legs[i].hip.rotation.x*.88+(mounted?.22:0),ease);
          hem.rotation.z=mix(hem.rotation.z,(i?1:-1)*(.026+Math.abs(swing)*.13),ease);
        });
        const cloth=backFit.children[0]?.userData.cloth;
        if(cloth){
          cloth.rotation.x=mix(cloth.rotation.x,-.12+swing*.27+(sprint?.38:0)+(mounted?.31:0),ease);
          cloth.rotation.z=mix(cloth.rotation.z,gait*.063*motion, ease);
        }
        const isBlock = typeof firstType === "number";
        first.position.y = mix(first.position.y,bob,ease);
        first.rotation.z = mix(first.rotation.z,moving?gait*.018*motion:0,ease);
        const screenWidth = Math.min(1,aspect/1.18);
        const kind=activity?.kind,phase=activity?.phase||0;
        const envelope=Math.sin(phase*Math.PI)*motion;
        const taste=kind==="eat"||kind==="drink";
        const work=kind==="cook"||kind==="forge"||kind==="glass";
        const fishing=kind==="cast"||kind==="reel"||kind==="waiting"||kind==="bite";
        const pulse=kind==="forge"?Math.sin(phase*Math.PI*6)**2:kind==="cook"?Math.sin(phase*Math.PI*5):0;
        const lift=taste?envelope*1.30:kind==="throw_vial"?envelope*(1.65-phase*2.35):work?envelope*(.67+pulse*.43):kind==="cast"?envelope*(.9-phase*2.15):kind==="reel"?envelope*.82:kind==="bite"?.20:0;
        const right=hands[1].group,left=hands[0].group;
        const weapon=globalThis.QuimiCraftArsenal?.weapons[firstType];
        const boxing=weapon?.family==="gauntlet",twoHanded=weapon?.twoHanded&&!boxing;
        right.position.x=mix(right.position.x,((twoHanded?.31:.55)-(taste?.28:work?.12:0)*envelope)*screenWidth,ease);
        right.position.y=mix(right.position.y,-.59+(taste?.46:work?.12:0)*envelope,ease);
        right.position.z=mix(right.position.z,-1.03+(taste?.33:0)*envelope,ease);
        const blocking=1-Math.exp(-dt*34);
        const handEase=shieldLift>.05?blocking:ease;
        left.position.x=mix(left.position.x,(twoHanded?.24:-.58+offhandAction*.19+shieldLift*.31)*screenWidth-shieldRecoil*.059,handEase);
        left.position.y=mix(left.position.y,(twoHanded?-.785-action*.022:-.67+offhandAction*.27+shieldLift*.39)-shieldRecoil*.057,handEase);
        left.position.z=mix(left.position.z,(twoHanded?-1.08:-1.1-offhandAction*.10+shieldLift*.19)+shieldRecoil*.14,handEase);
        left.rotation.x=mix(left.rotation.x,-.35-swing*.25-(fishing?.38:work?.35:0)*motion-action*(twoHanded?.86:0)-offhandAction*.63,ease);
        left.rotation.z=mix(left.rotation.z,twoHanded?-.31+action*.12:-.15,ease);
        right.rotation.x=mix(right.rotation.x,-.32+swing*.17-action*.94-lift,ease);
        right.rotation.z=.15-action*.32-(work?pulse*.36:0);
        left.rotation.y=mix(left.rotation.y,0,ease);
        right.rotation.y=mix(right.rotation.y,0,ease);
        if(boxing)for(const [index,{group:hand}] of hands.entries()){
          const side=index?1:-1,punch=punchHand===side?action:0,guard=(1-punch)*.08;
          hand.position.set(side*(.47-punch*.19)*screenWidth,-.49+guard+punch*.17,-1.04-punch*.43);
          hand.rotation.set(-.18+swing*.14-punch*.37,side*(.17-punch*.10),side*(.14-punch*.08));
        }
        left.visible=!isBlock||!!kind||offhand;
        const reach=isBlock ? .12 : 0;
        heldFirst.position.set(0,-.046+(isBlock?.09:0),-.094-reach);
        heldThird.position.set(0,-.046+(isBlock?.061:0),-.094-reach*.62);
        heldFirst.rotation.set(isBlock?.06:work?.13:0,action*.17,isBlock?-.12:-.04);
        heldThird.rotation.set(isBlock?.10:work?.16:-.13,0,-.10);
        const holding=firstType!=null;
        hands[1].fingers.flex(holding?(isBlock?.43:.94):action*.52,dt);
        hands[0].fingers.flex((twoHanded||boxing)?.90:fishing||work||offhand?.64:.12,dt);
        torso.rotation.x = mix(torso.rotation.x,mounted?.18:swim?.36:crouch?.23:sprint?.14:0,ease);
        torso.rotation.z = mix(torso.rotation.z,driver?steer*.07:-swing*.07,ease);
        head.rotation.x = mix(head.rotation.x,Math.max(-.31,Math.min(.31,pitch*.42)),ease);
        const blink = (now/1000)%4.7;
        for (const eye of eyes) eye.scale.y = blink>4.52?Math.max(.09,Math.abs(blink-4.61)*10):1;
        arms.forEach(({shoulder,elbow,fingers},index)=>{
          const side = index===0?-1:1;
          const guarding=side===-1?shieldLift:0,kick=side===-1?shieldRecoil:0,armEase=guarding>.05?blocking:ease;
          const effect=side===1?lift:(work||fishing?envelope*.41:0)+offhandAction*.81;
          const strike=boxing?(punchHand===side?action:0):side===1?action:twoHanded?action*.88+.18:0;
          const shoulderRest=mounted?(driver?.69:-.69):boxing?-.66-strike*.68:swing*side+(swim?-.65:0)-strike*1.16-effect*.79;
          const elbowRest=mounted?(driver?.65:-.65):boxing?-.98+strike*.91:-.14-Math.abs(swing)*.29-strike*.68-effect*(taste?1.22:.72);
          shoulder.rotation.x=mix(shoulder.rotation.x,mix(shoulderRest+steer*side*.19,.78,guarding)-kick*.23,armEase);
          elbow.rotation.x=mix(elbow.rotation.x,mix(elbowRest-steer*side*.14,1.18,guarding)+kick*.28,armEase);
          shoulder.rotation.y=mix(shoulder.rotation.y,steer*.11-.31*guarding+kick*.15,armEase);
          fingers.flex(mounted?.64:side===1?(holding?(isBlock?.43:.94):action*.51):(twoHanded||boxing)?.92:fishing||work||offhand?.64:.12,dt);
          shoulder.rotation.z = twoHanded&&side===-1?.34+action*.16:side*(.07+Math.abs(swing)*.075+breath)+guarding*.24;
        });
        legs.forEach(({hip,knee},index)=>{
          const step = swing*(index===0?1:-1);
          const stroke=pedal?Math.sin((activity.cadence??now*.008)+index*Math.PI)*.18:0;
          hip.rotation.x = mix(hip.rotation.x,driver?2.06-stroke:mounted?-1.19:step+(crouch?-.32:airborne?(index===0?.29:-.36):0),ease);
          knee.rotation.x = mix(knee.rotation.x,driver?-1.43+stroke:mounted?1.28:Math.max(0,-step)*.59+(crouch?.36:airborne?.36:0),ease);
        });
      }

      setAppearance({});
      setEquipment();
      return {root,first,heldFirst,heldOffFirst,heldThird,leftWrist,headGear,gear,chestFit,backFit,hairStyles,hipHeight,animate,setEquipment,setAppearance};
    }

    function helmetCandle(parent, headId) {
      const mount = new THREE.Group();
      mount.name = "Vela de elmo";
      const isCirclet = headId === "mage_circlet";
      mount.position.set(0, isCirclet ? .27 : .315, isCirclet ? -.17 : -.06);
      const wax = tint("helm-wax", 0xf8efd8);
      const drip = tint("helm-drip", 0xe5d6af);
      const outerFlame = glowGemMat("helm-flame-o", 0xffa62e, 0xff7814, 1.75, .94);
      const innerFlame = glowGemMat("helm-flame-i", 0xfff7c2, 0xffe670, 2.0, .98);
      mesh(mount, cyl, brass, [0, .018, 0], [.18, .036, .18]);
      mesh(mount, cyl, wax, [0, .115, 0], [.095, .19, .095]);
      mesh(mount, cyl, drip, [.045, .145, -.02], [.026, .08, .026]);
      mesh(mount, cyl, drip, [-.04, .125, .028], [.024, .10, .024]);
      bar(mount, dark, [0, .205, 0], [0, .24, 0], .012);
      const flame = new THREE.Group();
      flame.position.set(0, .275, 0);
      mesh(flame, globe, outerFlame, [0, 0, 0], [.044, .088, .044]);
      mesh(flame, globe, innerFlame, [0, -.01, 0], [.022, .050, .022]);
      glowHalo(flame, flame, 0xffb84d, [0, .01, 0], .42, .46);
      mount.add(flame);
      mount.userData.flame = flame;
      parent.add(mount);
      return mount;
    }

    return {item,icon,animateItem,avatar,alchemistAttire,classApparel,helmetCandle};
  }

  return {create};
})();
