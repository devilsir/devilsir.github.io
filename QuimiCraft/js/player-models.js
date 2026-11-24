"use strict";

globalThis.QuimiCraftModels = (() => {
  function create(THREE, options) {
    const {blocks, block, atlas, texFor, uvTile, itemColor, shadows, detailedBlockMiniature} = options;
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
    const globe = new THREE.OctahedronGeometry(1, 0);
    const torus = new THREE.TorusGeometry(1, .048, 5, 22);
    const cyl = new THREE.CylinderGeometry(.5, .5, 1, 8);
    const materialCache = new Map();
    const textures = new Map();
    const icons = new Map();
    const itemMatt = new THREE.MeshLambertMaterial({map:atlas.texture, alphaTest:.38, color:0xffffff, side:THREE.DoubleSide,
      emissive:0x141414, emissiveIntensity:.62});

    function mesh(parent, geometry, mat, xyz, size, rotation = [0,0,0]) {
      const node = new THREE.Mesh(geometry, mat);
      node.position.set(...xyz);
      node.scale.set(...size);
      node.rotation.set(...rotation);
      node.castShadow = shadows();
      node.receiveShadow = shadows();
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

    function bow(root) {
      grip(root,.31);
      const tips = [];
      for (const side of [-1,1]) {
        const path = [[0,side*.1,-.035],[0,side*.31,.043],[0,side*.60,.212],[0,side*.77,.305]];
        tips.push(path.at(-1));
        for (let i=1;i<path.length;i++) {
          bar(root,wood,path[i-1],path[i],.089-i*.01,.074);
          const strip = path.slice(i-1,i+1).map(([x,y,z])=>[x-.04,y,z-.015]);
          bar(root,lightWood,strip[0],strip[1],.028,.018);
        }
        bevel(root,brass,[0,side*.667,.252],[.091,.081,.104],[side*.23,0,0]);
      }
      root.userData.bowTips = tips.map(tip=>new THREE.Vector3(...tip));
      root.userData.string = [bevel(root,thread,[0,0,0],[.012,1,.012]),bevel(root,thread,[0,0,0],[.012,1,.012])];
      root.userData.arrow = arrow(root);
      root.userData.forward=new THREE.Vector3(0,0,-1);
    }

    function arrow(parent) {
      const root = new THREE.Group();
      root.name = "Flecha";
      parent.add(root);
      bar(root,lightWood,[0,0,-.46],[0,0,.31],.018);
      mesh(root,globe,edge,[0,0,-.51],[.042,.047,.09]);
      for (const side of [-1,1]) bevel(root,side<0 ? thread : brass,[side*.031,0,.23],[.054,.02,.14],[0,0,side*.32]);
      return root;
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
      if (id === "wind_staff") staff(root);
      else if (id === "bow") {bow(root);root.rotation.y=first?-.62:-.24}
      else if (id === "iron_sword") sword(root);
      else if (id === "arrow") arrow(root);
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
      } else if(globalThis.QuimiCraftAlchemy?.itemData[id]){
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
      if (core) {
        core.rotation.y = now * .0019 * motion;
        core.scale.set(.169,.22,.167).multiplyScalar(1+Math.sin(now*.005)*.07*motion);
      }
      rings?.forEach((ring,index)=>{
        ring.rotation.set(.8+index*.94,now*.00118*motion+ring.userData.phase, ring.userData.phase+now*.00043*motion);
      });
      if (string) {
        const pull = new THREE.Vector3(.027,0,.306+action*.31);
        string.forEach((span,index)=>{
          const end = bowTips[index];
          const difference = pull.clone().sub(end);
          span.position.copy(end).lerp(pull,.5);
          span.scale.y = difference.length();
          span.quaternion.setFromUnitVectors(yAxis,difference.normalize());
        });
        root.userData.arrow.position.set(.047,.023,.005+action*.31);
        root.userData.arrow.visible = hasArrow;
      }
    }

    function icon(id) {
      if (icons.has(id)) return icons.get(id);
      const alchemyItem=globalThis.QuimiCraftAlchemy?.itemData[id];
      const vehicleItem=globalThis.QuimiCraftVehicles?.itemData[id];
      if (!vehicleItem&&!alchemyItem&&!["wind_staff","bow","iron_sword","stone_pickaxe","iron_pickaxe","copper_pickaxe","hoe","fishing_rod","reinforced_rod","pan","mallet","arrow","carbon_badge"].includes(id)) return "";
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
        if(id==="kit_glider"){
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
        return {hip,knee};
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
      let headEquipment,faceEquipment,footEquipment,chestEquipment,hasBust=false;
      function syncWear(){
        const helmet=headEquipment==="iron_helmet",covered=!!headEquipment||!!faceEquipment;
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

      function setEquipment(handId,footId,backId,headId,faceId,chestId){
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
          node.visible=!!footId;
          node.scale.z=footId==="fins"?.49:.357;
        }
        pack.visible=!backId;
      }

      function animate({dt, now, motion, moving, sprint, crouch, swim, airborne, pitch, action, firstType, activity=null, aspect = 16/9}) {
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
        right.position.x=mix(right.position.x,(.55-(taste?.28:work?.12:0)*envelope)*screenWidth,ease);
        right.position.y=mix(right.position.y,-.59+(taste?.46:work?.12:0)*envelope,ease);
        right.position.z=mix(right.position.z,-1.03+(taste?.33:0)*envelope,ease);
        left.position.x=-.58*screenWidth;
        left.rotation.x=mix(left.rotation.x,-.35-swing*.25-(fishing?.38:work?.35:0)*motion,ease);
        right.rotation.x=mix(right.rotation.x,-.32+swing*.17-action*.94-lift,ease);
        right.rotation.z=.15-action*.32-(work?pulse*.36:0);
        left.visible=!isBlock||!!kind;
        const reach=isBlock ? .12 : 0;
        heldFirst.position.set(0,-.046+(isBlock?.09:0),-.094-reach);
        heldThird.position.set(0,-.046+(isBlock?.061:0),-.094-reach*.62);
        heldFirst.rotation.set(isBlock?.06:work?.13:0,action*.17,isBlock?-.12:-.04);
        heldThird.rotation.set(isBlock?.10:work?.16:-.13,0,-.10);
        const holding=firstType!=null;
        hands[1].fingers.flex(holding?(isBlock?.43:.94):action*.52,dt);
        hands[0].fingers.flex(fishing||work?.64:.12,dt);
        torso.rotation.x = mix(torso.rotation.x,mounted?.18:swim?.36:crouch?.23:sprint?.14:0,ease);
        torso.rotation.z = mix(torso.rotation.z,-swing*.07,ease);
        head.rotation.x = mix(head.rotation.x,Math.max(-.31,Math.min(.31,pitch*.42)),ease);
        const blink = (now/1000)%4.7;
        for (const eye of eyes) eye.scale.y = blink>4.52?Math.max(.09,Math.abs(blink-4.61)*10):1;
        arms.forEach(({shoulder,elbow,fingers},index)=>{
          const side = index===0?-1:1;
          const effect=side===1?lift:(work||fishing?envelope*.41:0);
          shoulder.rotation.x=mix(shoulder.rotation.x,mounted?-.69:swing*side+(swim?-.65:0)-(side===1?action*1.16:0)-effect*.79,ease);
          elbow.rotation.x=mix(elbow.rotation.x,mounted?-.65:-.14-Math.abs(swing)*.29-(side===1?action*.68:0)-effect*(taste?1.22:.72),ease);
          fingers.flex(mounted?.64:side===1?(holding?(isBlock?.43:.94):action*.51):fishing||work?.64:.12,dt);
          shoulder.rotation.z = side*(.07+Math.abs(swing)*.075+breath);
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
      return {root,first,heldFirst,heldThird,leftWrist,headGear,gear,chestFit,hairStyles,animate,setEquipment,setAppearance};
    }

    return {item,icon,animateItem,avatar,alchemistAttire};
  }

  return {create};
})();
