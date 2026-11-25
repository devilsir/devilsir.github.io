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
    const metal = new THREE.MeshStandardMaterial({color:0xa5c2cc, metalness:.5, roughness:.33});
    const edge = new THREE.MeshStandardMaterial({color:0xe3f5f1, metalness:.42, roughness:.22});
    const brass = new THREE.MeshStandardMaterial({color:0xcb9b48, metalness:.48, roughness:.4});
    const stone = new THREE.MeshLambertMaterial({color:0x7c8b89});
    const dark = new THREE.MeshLambertMaterial({color:0x19262d});
    const wood = new THREE.MeshLambertMaterial({color:0x734d34});
    const lightWood = new THREE.MeshLambertMaterial({color:0xac7749});
    const leather = new THREE.MeshLambertMaterial({color:0x49342e});
    const thread = new THREE.MeshLambertMaterial({color:0xd8c4a8});
    const crystal = new THREE.MeshStandardMaterial({color:0x65ddcf, emissive:0x208c84, emissiveIntensity:.62, roughness:.24, flatShading:true});
    const bufferLiquid=new THREE.MeshStandardMaterial({color:0xb0d75f,roughness:.29,metalness:.11,emissive:0x1a2009});
    const globe = new THREE.OctahedronGeometry(1, 0);
    const torus = new THREE.TorusGeometry(1, .048, 5, 22);
    const cyl = new THREE.CylinderGeometry(.5, .5, 1, 8);
    const materialCache = new Map();
    const textures = new Map();
    const icons = new Map();
    const shieldShapes = new Map();
    const capeModels=new Map();
    const itemMatt = new THREE.MeshLambertMaterial({map:atlas.texture, alphaTest:.38, color:0xffffff, side:THREE.DoubleSide,
      emissive:0x141414, emissiveIntensity:.62});

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
      const frost=w.style==="frost",silver=w.style==="silver",shade=tint(w.style,w.color),trim=tint(w.style+"-trim",w.trim);
      const shaft=silver?metal:frost?dark:wood;
      bar(root,shaft,[0,-.62,0],[0,1.06,0],.096);
      grip(root,.39);
      for(const y of [-.58,.55,.87])bevel(root,trim,[0,y,0],[.143,.067,.137]);
      const center=[0,1.20,0],key=w.style+"-glow";
      if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({
        color:w.color,emissive:w.color,emissiveIntensity:.45,roughness:.24,flatShading:true
      }));
      const coreMaterial=w.spectralWeapon?spectralFinish(w.color,w.trim,.83,.56):materialCache.get(key);
      root.userData.core=mesh(root,globe,coreMaterial,center,frost?[.143,.29,.141]:[.21,.24,.18],[.12,.36,.24]);
      root.userData.coreSize=root.userData.core.scale.clone();
      if(w.spectralWeapon){
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
      const variant=w?.style,steel=variant==="steel",bamboo=variant==="bamboo",spectral=w?.spectralWeapon;
      const limb=spectral?spectralFinish(w.color,w.trim,.34,.59):variant?tint(variant,w.color):wood;
      const laminate=spectral?spectralFinish(w.trim,w.trim,.80):variant?tint(variant+"-trim",w.trim):lightWood;
      grip(root,.31);
      const tips = [];
      for (const side of [-1,1]) {
        const path=spectral?[[0,side*.09,-.064],[0,side*.27,-.052],[0,side*.54,.12],[0,side*.76,.30],[0,side*.95,.24],[0,side*1.04,.12]]:
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
        bevel(root,steel?dark:brass,cap,[.105,.075,.096],[side*.23,0,0]);
        if(variant)for(const pt of path.slice(1,-1)){
          bevel(root,laminate,pt,[.109,.045,.098],[side*.19,0,0]);
          if(steel)bevel(root,brass,[.057,pt[1],pt[2]],[.032,.039,.046]);
          if(spectral)mesh(root,globe,laminate,[-.055,pt[1],pt[2]],[.051,.045,.047]);
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
    function shield(root,s){
      if(!shieldShapes.has(s.shape)){
        const path=new THREE.Shape();
        if(s.shape==="oval"||s.shape==="mirror")path.absellipse(0,0,.31,.453,0,Math.PI*2);
        else{
          const form=s.shape==="tower"?[[-.28,-.53],[.28,-.53],[.343,-.44],[.343,.44],[.260,.53],[-.260,.53],[-.343,.44],[-.343,-.44]]:
            [[0,-.55],[.28,-.35],[.37,.11],[.33,.38],[.18,.48],[0,.40],[-.18,.48],[-.33,.38],[-.37,.11],[-.28,-.35]];
          path.moveTo(...form[0]);for(const pt of form.slice(1))path.lineTo(...pt);path.closePath();
        }
        shieldShapes.set(s.shape,new THREE.ExtrudeGeometry(path,{depth:.07,bevelEnabled:true,bevelThickness:.026,bevelSize:.031,bevelSegments:s.shape==="mirror"?2:1,curveSegments:s.shape==="mirror"?22:6}));
      }
      const geo=shieldShapes.get(s.shape),plate=tint("shield-"+s.shape,s.color),rim=tint("rim-"+s.shape,s.trim);
      mesh(root,geo,rim,[0,0,-.003],[1,1,1]);
      mesh(root,geo,plate,[0,0,-.032],[.87,.90,1]);
      for(const side of [-1,1]){
        for(const y of [-.29,.28])mesh(root,globe,rim,[side*.20,y,-.058],[.041,.039,.026],[0,0,Math.PI/4]);
        bevel(root,leather,[side*.147,.018,.139],[.048,.281,.091],[0,0,side*.14]);
        if(s.shape==="tower"){
          for(const x of [.101,.215])bevel(root,rim,[side*x,.005,-.067],[.023,.82,.043]);
        }else if(s.shape==="dragon"){
          for(const y of [-.225,.219])mesh(root,globe,rim,[side*.228,y,-.075],[.025,.035,.026]);
        }else if(s.shape!=="mirror"){
          bevel(root,lightWood,[side*.102,-.004,-.063],[.029,.691,.032],[0,0,side*.05]);
        }
      }
      if(s.shape==="dragon")dragonShieldFace(root,rim);
      else if(s.shape==="mirror")mirrorFace(root);
      else mesh(root,cyl,rim,[0,0,-.080],[.257,.082,.267],[Math.PI/2,0,0]);
      bar(root,leather,[-.130,.015,.153],[.130,.015,.153],.060);
    }
    const mirrorGeometry=new THREE.CircleGeometry(1,48);
    const mirrorEdgeGeometry=new THREE.TorusGeometry(1,.031,8,48);
    const mirrorMaterial=new THREE.ShaderMaterial({
      vertexShader:`varying vec3 normalInView,looking;varying vec2 facet;
        void main(){facet=uv*2.-1.;vec4 view=modelViewMatrix*vec4(position,1.);
          normalInView=normalMatrix*normal;looking=-view.xyz;gl_Position=projectionMatrix*view;}`,
      fragmentShader:`varying vec3 normalInView,looking;varying vec2 facet;
        void main(){
          vec3 ray=reflect(-normalize(looking),normalize(normalInView));
          float diagonal=facet.x*.70+facet.y*.48+ray.x*.39;
          float band=smoothstep(.04,.18,diagonal)*(1.-smoothstep(.22,.39,diagonal));
          float horizon=smoothstep(-.55,.80,facet.y+ray.y*.83);
          float rim=smoothstep(.57,1.,length(facet));
          vec3 color=mix(vec3(.25,.42,.52),vec3(.70,.88,.93),horizon);
          color=mix(color,vec3(.91,.98,1.),band*.80);
          gl_FragColor=vec4(color-rim*.11,1.);
        }`
    });
    function mirrorFace(root){
      mesh(root,mirrorGeometry,mirrorMaterial,[0,0,-.068],[.266,.390,1],[0,Math.PI,0]).name="Espelho polido";
      mesh(root,mirrorEdgeGeometry,edge,[0,0,-.077],[.273,.403,.47]);
      for(const side of [-1,1]){
        mesh(root,globe,brass,[0,side*.413,-.076],[.044,.038,.020],[0,0,Math.PI/4]);
        mesh(root,globe,crystal,[0,side*.413,-.092],[.018,.020,.011],[0,0,Math.PI/4]);
      }
    }
    function dragonShieldFace(root,rim){
      function relief(key,points,material,z,mirror=1){
        if(!shieldShapes.has(key)){
          const shape=new THREE.Shape();
          shape.moveTo(...points[0]);for(const p of points.slice(1))shape.lineTo(...p);shape.closePath();
          shieldShapes.set(key,new THREE.ExtrudeGeometry(shape,{depth:.038,bevelSize:.012,bevelThickness:.012,bevelSegments:2}));
        }
        return mesh(root,shieldShapes.get(key),material,[0,0,z],[mirror,1,1]);
      }
      const bronze=tint("dragon-relief",0xa77544);
      relief("dragon-head",[[0,.225],[.145,.201],[.191,.105],[.155,-.043],[.125,-.096],
        [.092,-.229],[0,-.267],[-.092,-.229],[-.125,-.096],[-.155,-.043],[-.191,.105],[-.145,.201]],bronze,-.119);
      for(const side of [-1,1]){
        relief("dragon-horn",[[.108,.163],[.154,.249],[.206,.302],[.240,.391],[.249,.283],[.225,.198],[.160,.123]],rim,-.126,side);
        relief("dragon-cheek",[[.095,.138],[.182,.131],[.205,.053],[.147,.031],[.168,-.073],
          [.104,-.137],[.063,-.077],[.052,.075]],rim,-.149,side);
        const eye=bevel(root,dark,[side*.111,.071,-.152],[.087,.044,.025],[0,0,-side*.37]);
        eye.name="Olho do dragão";
        mesh(root,globe,crystal,[side*.108,.073,-.169],[.038,.014,.016],[0,0,-side*.37]);
        bevel(root,rim,[side*.103,.110,-.170],[.107,.025,.032],[0,0,-side*.28]);
        mesh(root,globe,edge,[side*.077,-.175,-.221],[.021,.062,.023],[0,0,-side*.17]);
      }
      bevel(root,bronze,[0,-.124,-.171],[.180,.173,.093]);
      bevel(root,rim,[0,-.106,-.212],[.144,.092,.032]);
      for(const side of [-1,1])bevel(root,dark,[side*.040,-.109,-.231],[.032,.016,.015],[0,0,side*.27]);
      bevel(root,dark,[0,-.181,-.209],[.113,.018,.018]);
      mesh(root,globe,crystal,[0,.168,-.152],[.036,.058,.023],[0,0,Math.PI*.1]);
    }

    function capeShape(wizard,s,t){
      const edge=Math.abs(s),wave=Math.cos(s*Math.PI*3.1);
      return [s*(.241+t*.153),-t*(wizard?.86-edge*.14:.69+edge*.049),.038+t*.102+wave*(.011+t*.026)+s*s*.061];
    }
    function capeSurface(parent,gear,wizard){
      if(!capeModels.has(gear.shape)){
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
        const material=new THREE.MeshStandardMaterial({color:gear.color,roughness:.94,side:THREE.DoubleSide});
        capeModels.set(gear.shape,{geometry,material});
      }
      const {geometry,material}=capeModels.get(gear.shape);
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
      const plated=gear.finish==="metal",scaled=gear.finish==="dragon";
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
      const plated=gear.finish==="metal",scaled=gear.finish==="dragon",mage=gear.shape==="mageBoots";
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
        }
      }else if(gear.slot==="chest"){
        bevel(root,fabric,[0,.002,0],[.577,.654,.348]);
        const plate=shape==="plate"||gear.finish==="metal",scaled=gear.finish==="dragon",robe=shape==="arcaneRobe";
        for(const side of [-1,1]){
          bevel(root,shape==="plate"?metal:fabric,[side*.236,.193,-.012],[.234,.236,.467],[.07,0,side*.16]);
          bevel(root,trim,[side*.265,.273,-.040],[.214,.047,.406],[.07,0,side*.16]);
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
        mesh(root,globe,shape==="vestment"||robe?crystal:trim,[0,.095,-.249],[.056,.073,.024]);
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
      const body=w.spectralWeapon?spectralFinish(w.color,w.trim,.34,.59):tint(w.style+"-glove",w.color);
      const trim=w.spectralWeapon?spectralFinish(w.trim,w.trim,.80):tint(w.style+"-knuckle",w.trim);
      const crystal=["ice","venom","lightning","spectral"].includes(w.element);
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
      scimitar:{grip:.33,width:.16,guard:.195,fuller:[[0,.29],[.009,.73],[.082,1.04],[.269,1.33]],path:[[.44,1.53],[.264,1.39],[.113,1.22],[-.008,.99],[-.087,.72],[-.093,.32],[-.059,.205],[.063,.205],[.116,.40],[.135,.76],[.247,1.055],[.404,1.292]]}
    };
    function forgedSword(root,w){
      const {grip:handle,width,guard,path,fuller}=forgedBlades[w.style];
      const body=w.spectralWeapon?spectralFinish(w.color,w.trim,.46,.54):tint(w.style,w.color);
      const edgeTone=w.spectralWeapon?spectralFinish(w.trim,w.trim,.88):tint(w.style+"-edge",w.trim);
      const hilt=w.style==="scimitar"?brass:metal,guardY=handle*.49,two=w.twoHanded;
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
      const primary=tint(item.shape,item.color),accent=tint(item.shape+"-gilt",item.trim);
      if(item.shape==="book"){
        const pages=tint("parchment","#ece0bb"),ink=tint("sigils","#765c64");
        bevel(root,primary,[0,-.15,0],[.627,.095,.477]);
        bevel(root,accent,[0,-.087,0],[.05,.15,.49]);
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
      else if (id === "wind_staff") staff(root);
      else if (id === "bow"||weapon?.family==="bow") {bow(root,weapon);root.rotation.y=first?-.62:-.24}
      else if (weapon?.family==="crossbow") {crossbow(root,weapon);root.rotation.y=first?-.14:-.17}
      else if (guard) shield(root,guard);
      else if (artifact) focus(root,artifact);
      else if (gear){
        classApparel(root,gear);
        if(gear.slot==="back")root.rotation.y=Math.PI;
        if(gear.finish==="spectral")QuimiCraftSpectral.halo(THREE,root,0x39e0cf,[0,.17,-.12],1.11,.93,.29);
      }
      else if (id==="dragon_hide"){
        bevel(root,tint("dragonhide",0x593b48),[0,0,0],[.53,.51,.093],[0,0,-.14]);
        dragonLeatherScales(root,0,.163,-.057,5,5,.083,.078);
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
      } else {
        const color = itemColor(id);
        mesh(root,globe,tint(id,color),[0,0,0],[.18,.16,.13],[.14,.35,.22]);
        bevel(root,tint(id,color),[.09,-.06,.015],[.14,.1,.115],[0,0,.27]);
      }
      const scale = dropped ? .42 : first ? .72 : .58;
      root.scale.setScalar(scale);
      return root;
    }

    function animateItem(root, now, action = 0, motion = 1, hasArrow = true) {
      if (!root) return;
      const {core,rings,string,bowTips} = root.userData;
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
      const weapon=globalThis.QuimiCraftArsenal?.weapons[id];
      const guard=globalThis.QuimiCraftArsenal?.shields[id];
      const artifact=globalThis.QuimiCraftArsenal?.focuses[id];
      const gear=globalThis.QuimiCraftArsenal?.apparel[id];
      if (!weapon&&!guard&&!artifact&&!gear&&!vehicleItem&&!alchemyItem&&!["wind_staff","bow","iron_sword","stone_pickaxe","iron_pickaxe","copper_pickaxe","hoe","fishing_rod","reinforced_rod","pan","mallet","arrow","bolt","carbon_badge","dragon_hide"].includes(id)) return "";
      const canvas = document.createElement("canvas");
      canvas.width=canvas.height=64;
      const ctx = canvas.getContext("2d");
      ctx.lineCap="round";
      ctx.lineJoin="round";
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
      } else if(artifact){
        if(artifact.shape==="book"){
          tile([[8,15],[30,19],[54,12],[58,45],[33,53],[9,47]],artifact.color);
          tile([[11,11],[30,16],[52,9],[54,40],[31,47],[12,41]],"#e8d8ad");
          line([[30,17],[31,47]],artifact.trim,3);
          for(const y of [20,26,32,38]){line([[15,y],[26,y+3]],"#775d64",1.4);line([[35,y+1],[49,y-3]],"#775d64",1.4);}
        }else{
          line([[21,53],[44,53]],"#87634e",6);
          tile([[17,26],[24,15],[36,10],[47,18],[52,30],[43,42],[31,48],[20,41]],artifact.color);
          tile([[22,25],[33,16],[42,20],[36,35],[26,38]],artifact.trim);
          line([[15,35],[25,26],[45,20],[56,23],[48,33],[28,42],[17,41]],"#dbb78a",2.6);
        }
      } else if(guard){
        const outline=guard.shape==="oval"||guard.shape==="mirror"?[[19,11],[32,5],[45,11],[51,23],[49,41],[41,54],[32,59],[23,54],[15,41],[13,23]]:
          guard.shape==="tower"?[[15,8],[49,8],[54,14],[54,51],[48,57],[16,57],[10,51],[10,14]]:
          [[16,10],[22,6],[32,11],[42,6],[48,10],[54,24],[48,44],[32,60],[16,44],[10,24]];
        tile(outline,guard.trim);
        tile(outline.map(([x,y])=>[32+(x-32)*.83,32+(y-32)*.86]),guard.color);
        if(guard.shape==="dragon"){
          tile([[32,16],[39,19],[44,29],[41,40],[37,44],[36,51],[32,54],[28,51],[27,44],[23,40],
            [20,29],[25,19]],"#ad7948");
          for(const side of [-1,1]){
            const reflect=points=>points.map(([x,y])=>[32+(x-32)*side,y]);
            tile(reflect([[38,23],[41,15],[48,9],[46,20],[43,30]]),guard.trim);
            tile(reflect([[35,30],[43,26],[42,34],[38,39],[35,35]]),guard.trim);
            line(reflect([[36,33],[41,30]]),"#83efdb",2.7);
            tile(reflect([[36,43],[40,42],[37,48]]),"#f9e3ba");
          }
          tile([[27,37],[32,33],[37,37],[36,46],[32,49],[28,46]],"#e0b276");
          line([[29,42],[30,42]],"#493448",2);
          line([[34,42],[35,42]],"#493448",2);
        }else if(guard.shape==="mirror"){
          tile([[16,33],[38,11],[45,16],[17,45]],"#eefcfe");
          line([[23,47],[46,24]],"#d6f0f4",2.4);
        }else tile([[32,22],[42,30],[32,41],[22,30]],guard.trim);
        if(guard.shape==="tower")line([[32,14],[32,52]],guard.trim,3);
      } else if(id==="dragon_hide"){
        tile([[15,12],[32,9],[48,14],[54,30],[49,52],[35,56],[16,52],[11,35]],"#60414c");
        for(let y=20;y<=44;y+=8)for(let x=22;x<=44;x+=8){
          const dx=x+(y%16===4?-3:1);
          tile([[dx-4,y],[dx,y-2],[dx+4,y],[dx,y+5]],(x+y)%3===0?"#c68d7d":"#915e66");
        }
      } else if(gear){
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
        tile([[8,30],[13,17],[24,16],[27,12],[47,15],[54,23],[51,42],[42,51],[13,48]],weapon.color);
        tile([[10,34],[27,35],[28,46],[13,47]],"#28262f");
        tile([[27,17],[42,16],[51,23],[49,30],[28,27]],weapon.trim);
        tile([[28,31],[51,32],[47,40],[39,44],[29,41]],weapon.color);
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
        const blade=forgedBlades[weapon.style],top=Math.max(...blade.path.map(([,y])=>y)),scale=36/top;
        const originX=26,originY=40;
        const project=([x,y])=>[originX+(y*.86+x*.51)*scale,originY+(-y*.51+x*.86)*scale];
        line([[13,50],[27,40]],"#714d37",weapon.twoHanded?9:6);
        line([[21,32],[34,45]],weapon.trim,5);
        tile(blade.path.map(project),weapon.color);
        line(blade.fuller.map(project),weapon.trim,2);
      } else if(weapon?.style){
        const {color,trim,family}=weapon;
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
        }else{
          line([[12,55],[39,22]],"#283039",9);line([[12,55],[39,22]],trim,3);
          tile([[46,6],[56,19],[42,33],[34,20]],color);
          line([[34,19],[38,8],[46,6],[53,11],[57,20]],trim,2.3);
          line([[42,28],[53,18]],trim,2);
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
        hip.position.set(side*.148,.838,0);
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
        const footColors={iron_boots:0x92abb3,rubber_boots:0x9a7938,insulated_boots:0x465b70,fins:0x3c978f};
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
        const mounted=activity?.kind==="ride",pedal=mounted&&activity.pedaling;
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
        torso.rotation.z = mix(torso.rotation.z,-swing*.07,ease);
        head.rotation.x = mix(head.rotation.x,Math.max(-.31,Math.min(.31,pitch*.42)),ease);
        const blink = (now/1000)%4.7;
        for (const eye of eyes) eye.scale.y = blink>4.52?Math.max(.09,Math.abs(blink-4.61)*10):1;
        arms.forEach(({shoulder,elbow,fingers},index)=>{
          const side = index===0?-1:1;
          const guarding=side===-1?shieldLift:0,kick=side===-1?shieldRecoil:0,armEase=guarding>.05?blocking:ease;
          const effect=side===1?lift:(work||fishing?envelope*.41:0)+offhandAction*.81;
          const strike=boxing?(punchHand===side?action:0):side===1?action:twoHanded?action*.88+.18:0;
          const shoulderRest=mounted?-.69:boxing?-.66-strike*.68:swing*side+(swim?-.65:0)-strike*1.16-effect*.79;
          const elbowRest=mounted?-.65:boxing?-.98+strike*.91:-.14-Math.abs(swing)*.29-strike*.68-effect*(taste?1.22:.72);
          shoulder.rotation.x=mix(shoulder.rotation.x,mix(shoulderRest,.78,guarding)-kick*.23,armEase);
          elbow.rotation.x=mix(elbow.rotation.x,mix(elbowRest,1.18,guarding)+kick*.28,armEase);
          shoulder.rotation.y=mix(shoulder.rotation.y,-.31*guarding+kick*.15,armEase);
          fingers.flex(mounted?.64:side===1?(holding?(isBlock?.43:.94):action*.51):(twoHanded||boxing)?.92:fishing||work||offhand?.64:.12,dt);
          shoulder.rotation.z = twoHanded&&side===-1?.34+action*.16:side*(.07+Math.abs(swing)*.075+breath)+guarding*.24;
        });
        legs.forEach(({hip,knee},index)=>{
          const step = swing*(index===0?1:-1);
          const stroke=pedal?Math.sin(now*.008+index*Math.PI)*.23:0;
          hip.rotation.x = mix(hip.rotation.x,mounted?-1.19+stroke:step+(crouch?-.32:airborne?(index===0?.29:-.36):0),ease);
          knee.rotation.x = mix(knee.rotation.x,mounted?1.28-stroke:Math.max(0,-step)*.59+(crouch?.36:airborne?.36:0),ease);
        });
      }

      setAppearance({});
      setEquipment();
      return {root,first,heldFirst,heldOffFirst,heldThird,leftWrist,headGear,gear,chestFit,backFit,hairStyles,animate,setEquipment,setAppearance};
    }

    return {item,icon,animateItem,avatar,alchemistAttire,classApparel};
  }

  return {create};
})();
