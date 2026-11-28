"use strict";

globalThis.QuimiCraftAncientModels={
  create(THREE,part,beam,jointLeg){
    const gem=new THREE.OctahedronGeometry(1,0);
    const shell=new THREE.IcosahedronGeometry(1,1);
    const sphere=new THREE.SphereGeometry(1,12,10);
    const fang=new THREE.ConeGeometry(.38,1,5);
    const bell=new THREE.CylinderGeometry(.53,1,1,8);
    const ringLip=new THREE.TorusGeometry(1,.22,7,18);
    const disk=new THREE.CircleGeometry(1,36),ring=new THREE.RingGeometry(.44,1,40);
    const line=new THREE.PlaneGeometry(1,1);
    const palettes=new Map();
    const dark=new THREE.MeshLambertMaterial({color:0x171122});
    const bone=new THREE.MeshStandardMaterial({color:new THREE.Color(0xd8ccb4).convertSRGBToLinear(),roughness:.52,metalness:.06,flatShading:true});
    const pupilMat=new THREE.MeshBasicMaterial({color:0x050208});
    const groupAt=(parent,x,y,z)=>{
      const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;
    };
    function mesh(parent,geometry,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
      const m=new THREE.Mesh(geometry,mat);
      m.position.set(x,y,z);m.scale.set(sx,sy,sz);
      if(rx||ry||rz)m.rotation.set(rx,ry,rz);
      parent.add(m);return m;
    }
    function palette(profile){
      const key=profile.id;
      if(palettes.has(key))return palettes.get(key);
      const bodyCol=new THREE.Color(QuimiCraftAncients.colorNumber(profile.body)).convertSRGBToLinear();
      const darkCol=new THREE.Color(QuimiCraftAncients.colorNumber(profile.dark)).convertSRGBToLinear();
      const accentHex=QuimiCraftAncients.colorNumber(profile.accent);
      const accentCol=new THREE.Color(accentHex).convertSRGBToLinear();
      const fleshColor=bodyCol.clone().lerp(new THREE.Color(0x4a1026).convertSRGBToLinear(),.52);
      const mawColor=darkCol.clone().lerp(new THREE.Color(0x2d0310).convertSRGBToLinear(),.72);
      const scleraColor=new THREE.Color(0xebdcb8).convertSRGBToLinear().lerp(accentCol,.18);
      const colors={
        carapace:new THREE.MeshStandardMaterial({color:bodyCol,roughness:.66,metalness:.18,emissive:bodyCol,emissiveIntensity:.14,flatShading:true}),
        flesh:new THREE.MeshStandardMaterial({color:fleshColor,roughness:.78,emissive:fleshColor,emissiveIntensity:.12,flatShading:true}),
        shade:new THREE.MeshStandardMaterial({color:darkCol,roughness:.9,emissive:darkCol,emissiveIntensity:.08,flatShading:true}),
        maw:new THREE.MeshStandardMaterial({color:mawColor,roughness:.42,emissive:new THREE.Color(0x3a0514).convertSRGBToLinear(),emissiveIntensity:.45,flatShading:true}),
        sclera:new THREE.MeshStandardMaterial({color:scleraColor,roughness:.24,emissive:accentCol,emissiveIntensity:.18}),
        teeth:bone,
        pupil:pupilMat,
        smallGlow:new THREE.MeshBasicMaterial({color:accentHex}),
        glow:new THREE.MeshStandardMaterial({color:accentCol,emissive:accentCol,emissiveIntensity:.75,roughness:.26,flatShading:true}),
        accentHex
      };
      palettes.set(key,colors);
      return colors;
    }

    // Multi-layered WoW-style Eldritch Eye (fleshy rim + sclera + glowing iris + slit pupil)
    function eldritchEye(parent,eyeList,colors,pos,size,rot=[0,0,0],slit=true){
      const socket=groupAt(parent,...pos);
      socket.rotation.set(...rot);
      // Fleshy eyelid rim
      mesh(socket,ringLip,colors.flesh,0,0,size*.14,size*1.04,size*1.04,size*.55);
      const lid=groupAt(socket,0,0,0);
      // Eyeball sclera
      mesh(lid,sphere,colors.sclera,0,0,0,size,size,size*.84);
      // Iris + slit pupil pivot (for organic twitch/look animation)
      const irisPivot=groupAt(lid,0,0,0);
      mesh(irisPivot,sphere,colors.glow,0,0,-size*.54,size*.60,size*.60,size*.44);
      mesh(irisPivot,sphere,colors.pupil,0,0,-size*.86,slit?size*.17:size*.32,slit?size*.49:size*.32,size*.20);
      mesh(irisPivot,sphere,colors.smallGlow,size*.18,size*.18,-size*.88,size*.10,size*.10,size*.08);
      eyeList.push({lid,iris:irisPivot,phase:pos[0]*2.1+pos[1]*1.7+pos[2]*1.3+size*5,slit});
      return socket;
    }

    // Ringed or hinged Eldritch Maw packed with rows of curved jagged teeth + deep dark gullet
    function toothyMaw(parent,mawList,colors,pos,rx,ry,rot=[0,0,0],teethCount=12,ringMode=false){
      const mouth=groupAt(parent,...pos);
      mouth.rotation.set(...rot);
      // Deep dark bloody-void cavity behind teeth (recessed slightly toward +z so teeth stand out clearly)
      mesh(mouth,sphere,colors.maw,0,0,rx*.18,rx*.96,ry*.96,rx*.46);
      // Subtle glowing inner gullet tucked deep inside the dark throat
      const tScale=[rx*.34,ry*.34,rx*.16];
      const throat=mesh(mouth,sphere,colors.glow,0,0,rx*.26,...tScale);
      if(ringMode){
        // Circular toothed horror maw (C'Thun / G'huun / Yogg side-maw style)
        mesh(mouth,ringLip,colors.flesh,0,0,-rx*.06,rx*1.04,ry*1.04,rx*.52);
        const outerRing=groupAt(mouth,0,0,-rx*.12);
        const innerRing=groupAt(mouth,0,0,rx*.02);
        for(let i=0;i<teethCount;i++){
          const a=i*Math.PI*2/teethCount;
          const tx=Math.cos(a)*rx*.92,ty=Math.sin(a)*ry*.92;
          const tooth=mesh(outerRing,fang,colors.teeth,tx,ty,0,rx*.26,rx*.58,rx*.24);
          tooth.rotation.set(-.28,0,a+Math.PI/2);
          if(i%2===0){
            const inner=mesh(innerRing,fang,colors.teeth,tx*.64,ty*.64,0,rx*.20,rx*.42,rx*.20);
            inner.rotation.set(-.18,0,a+Math.PI/2+.14);
          }
        }
        mawList.push({ring:outerRing,inner:innerRing,throat,throatScale:tScale,phase:pos[0]*1.9+pos[1]*2.3+pos[2],mode:"ring"});
      }else{
        // Hinged upper & lower jaws bristling with double-row fangs (Yogg-Saron / Y'Shaarj / N'Zoth style)
        const upper=groupAt(mouth,0,ry*.32,-rx*.04);
        const lower=groupAt(mouth,0,-ry*.32,-rx*.04);
        // Fleshy curved lips framing the dark cavity
        mesh(upper,shell,colors.flesh,0,ry*.46,.04,rx*1.12,ry*.36,rx*.36);
        mesh(lower,shell,colors.flesh,0,-ry*.46,.04,rx*1.08,ry*.34,rx*.34);
        const perRow=Math.max(4,Math.round(teethCount/2));
        for(let i=0;i<perRow;i++){
          const t=perRow===1?0:(i/(perRow-1))*2-1;
          const arch=Math.cos(t*Math.PI*.48);
          const x=t*rx*.92,z=-arch*rx*.32-.08;
          const sizeScale=.88+arch*.36+(i%2?.14:-.06);
          // Upper teeth pointing down clearly in front of the dark gullet
          mesh(upper,fang,colors.teeth,x,-ry*.06,z,rx*.22*sizeScale,ry*.74*sizeScale,rx*.20*sizeScale,Math.PI-.16,0,t*.24);
          // Lower teeth pointing up
          mesh(lower,fang,colors.teeth,x*.94,ry*.06,z*.94,rx*.21*sizeScale,ry*.70*sizeScale,rx*.19*sizeScale,.16,0,-t*.22);
          // Second inner row of fangs
          if(i>0&&i<perRow-1){
            mesh(upper,fang,colors.teeth,x*.74,0,z+.18,rx*.15,ry*.52,rx*.15,Math.PI-.08,0,t*.16);
            mesh(lower,fang,colors.teeth,x*.70,0,z+.18,rx*.14,ry*.48,rx*.14,.08,0,-t*.14);
          }
        }
        mawList.push({upper,lower,throat,throatScale:tScale,phase:pos[0]*1.7+pos[1]*2.1+pos[2],mode:"jaw"});
      }
      return mouth;
    }

    // Organic tapered multi-segment tentacle splaying outward with glowing suckers & eye/fang tip
    function tendril(parent,segments,eyeList,colors,origin,length,bend,opts={}){
      const count=opts.count??6,baseWidth=opts.width??.32,tipKind=opts.tip??"glow";
      const splay=opts.splay??0;
      let anchor=groupAt(parent,...origin);
      if(opts.yaw)anchor.rotation.y=opts.yaw;
      if(opts.pitch)anchor.rotation.x=opts.pitch;
      for(let i=0;i<count;i++){
        const frac=i/(count-1);
        const width=baseWidth*(1-frac*.72);
        const segLen=length*(1-frac*.16);
        const joint=groupAt(anchor,0,i?segLen:0,0);
        const restZ=bend*(.25+frac*.45);
        // Splay outward from base (+X rotation tilts +Y toward +Z outward) then curl menacingly upward!
        const restX=splay?(i===0?splay:i<3?-splay*.22:-splay*.30):0;
        joint.rotation.z=restZ;
        joint.rotation.x=restX;
        beam(joint,i%2?colors.carapace:colors.flesh,[0,-.05,0],[0,segLen+.07,0],width);
        // Fleshy suckers / glowing nodules + bone barbs
        if(i>0&&i<count-1){
          mesh(joint,sphere,i%2?colors.glow:colors.shade,0,segLen*.5,width*.52,width*.34,width*.28,width*.34);
          if(opts.spikes)mesh(joint,fang,colors.teeth,0,segLen*.55,-width*.52,width*.40,width*.95,width*.40,-Math.PI*.45,0,0);
        }
        if(i===count-1){
          if(tipKind==="eye"){
            mesh(joint,sphere,colors.flesh,0,segLen*.92,0,width*1.65,width*1.55,width*1.65);
            eldritchEye(joint,eyeList,colors,[0,segLen*1.04,-width*1.12],width*1.2,[0,0,0],true);
          }else if(tipKind==="fang"){
            mesh(joint,fang,colors.teeth,0,segLen*1.25,0,width*1.45,width*3.1,width*1.45);
          }else{
            mesh(joint,gem,colors.glow,0,segLen*.95,0,width*.95,width*1.55,width*.95);
          }
        }
        segments.push({joint,rest:restZ,restX,phase:origin[0]*.9+origin[2]*.7+i*.72,index:i,amp:opts.amp??1});
        anchor=joint;
      }
    }

    function build(data,profile,g,r){
      const colors=palette(profile),{carapace,flesh,shade,smallGlow,glow,teeth}=colors;
      r.ancient={roots:[],pulses:[],eyes:[],maws:[]};
      const {roots,pulses,eyes,maws}=r.ancient;

      // 1. FACELESS ONE / N'RAQI (WoW Old God General)
      if(data.form==="faceless"){
        const body=groupAt(g,0,1.35,0);r.body=body;
        mesh(body,shell,shade,0,.04,0,.52,.66,.35);
        mesh(body,shell,flesh,0,.18,-.07,.58,.46,.34);
        // Glowing chest fissure + embedded chest eyes
        for(let i=0;i<3;i++)part(body,i===1?smallGlow:glow,[0,-.05+i*.14,-.37],[.16+i*.06,.036,.028],[0,0,(i-1)*.18]);
        eldritchEye(body,eyes,colors,[0,.24,-.38],.095,[0,0,0],true);
        // Spiked shoulder carapace pauldrons with eyes
        for(const side of [-1,1]){
          mesh(body,shell,carapace,side*.46,.42,0,.26,.22,.28,0,0,-side*.32);
          eldritchEye(body,eyes,colors,[side*.48,.46,-.22],.075,[0,-side*.38,0],true);
          mesh(body,fang,teeth,side*.56,.60,0,.12,.32,.12,0,0,-side*.45);
        }
        // Iconic N'raqi / Cthulhu tentacle-bearded head
        const head=groupAt(g,0,2.04,-.05);r.head=head;
        mesh(head,shell,flesh,0,.04,0,.32,.39,.31);
        mesh(head,bell,carapace,0,.22,.05,.28,.34,.25,.24,0,0);
        // 4 asymmetrical glowing eyes on the brow
        eldritchEye(head,eyes,colors,[-.14,.12,-.25],.078,[0,.24,0],true);
        eldritchEye(head,eyes,colors,[.14,.14,-.25],.085,[0,-.24,0],true);
        eldritchEye(head,eyes,colors,[-.05,.24,-.26],.056,[-.15,.08,0],true);
        eldritchEye(head,eyes,colors,[.08,.03,-.27],.052,[.08,-.15,0],true);
        // Fanged mouth slit + 5 dangling face tentacles
        toothyMaw(head,maws,colors,[0,-.11,-.27],.14,.09,[0,0,0],6,false);
        for(let t=0;t<5;t++){
          const ox=(t-2)*.075;
          tendril(head,roots,eyes,colors,[ox,-.15,-.22],.13,ox*.9,{count:4,width:.048,pitch:Math.PI*.88,amp:.7});
        }
        for(const side of [-1,1]){
          jointLeg(g,r,side*.22,.02,.82,.82,.15,shade,dark,side<0?0:Math.PI);
          const arm=groupAt(g,side*.46,1.60,0);arm.userData.side=side;r.arms.push(arm);
          mesh(arm,shell,carapace,side*.08,.03,0,.26,.27,.27);
          beam(arm,flesh,[side*.08,.04,0],[side*.19,-.52,-.12],.23);
          mesh(arm,shell,carapace,side*.19,-.59,-.14,.17,.24,.17);
          for(let finger=0;finger<3;finger++)beam(arm,teeth,[side*.19+(finger-1)*.08,-.62,-.19],
            [side*.21+(finger-1)*.11,-.86,-.31],.066);
        }
        return;
      }

      // 2. AQIR / SILITHID INSECTOID
      if(data.form==="beetle"){
        const body=groupAt(g,0,.50,.12);r.body=body;
        mesh(body,shell,shade,0,-.04,0,.49,.31,.64);
        mesh(body,shell,flesh,0,.14,.18,.38,.25,.42);
        // Dorsal eyes + 2 writhing back tendrils
        for(const side of [-1,1]){
          mesh(body,shell,carapace,side*.19,.13,.02,.26,.28,.54,0,side*.13,0);
          eldritchEye(body,eyes,colors,[side*.22,.27,-.08],.065,[-.5,-side*.35,0],true);
          tendril(body,roots,eyes,colors,[side*.16,.28,.16],.20,side*.32,{count:4,width:.065,tip:"fang",amp:.85});
          for(let i=0;i<3;i++){
            const z=(i-1)*.31;
            const leg=groupAt(g,side*.24,.44,z);
            leg.userData={side,phase:i*1.5+(side<0?Math.PI:0)};
            beam(leg,carapace,[0,0,0],[side*.34,.17,z*.8],.095);
            beam(leg,shade,[side*.34,.17,z*.8],[side*.54,-.42,z*1.18],.074);
            roots.push({joint:leg,rest:0,phase:leg.userData.phase,index:1,amp:.9});
          }
        }
        const head=groupAt(g,0,.48,-.45);r.head=head;
        mesh(head,shell,flesh,0,0,0,.31,.27,.30);
        // Fanged mouth + 6 clustered spider-like eldritch eyes + mandibles
        toothyMaw(head,maws,colors,[0,-.07,-.26],.15,.09,[0,0,0],6,false);
        for(const side of [-1,1]){
          eldritchEye(head,eyes,colors,[side*.16,.09,-.21],.068,[0,-side*.28,0],false);
          eldritchEye(head,eyes,colors,[side*.08,.15,-.24],.045,[-.18,-side*.15,0],false);
          eldritchEye(head,eyes,colors,[side*.23,.03,-.16],.042,[0,-side*.55,0],false);
          beam(head,teeth,[side*.21,-.08,-.12],[side*.33,-.12,-.39],.086);
          beam(head,teeth,[side*.33,-.12,-.39],[side*.10,-.13,-.52],.068);
          beam(head,carapace,[side*.17,.16,-.03],[side*.40,.36,-.25],.046);
        }
        return;
      }

      // 3. EYE / MAW TENTACLE (WoW C'Thun & Yogg-Saron Tentacle)
      if(data.form==="tentacle"){
        // Fleshy crater base ringed with jagged teeth
        mesh(g,shell,flesh,0,.15,0,.64,.27,.64);
        mesh(g,ringLip,carapace,0,.18,0,.56,.56,.26,Math.PI/2,0,0);
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4;
          mesh(g,fang,teeth,Math.sin(a)*.52,.28,Math.cos(a)*.52,.13,.30,.13,.34*Math.cos(a),0,-.34*Math.sin(a));
        }
        tendril(g,roots,eyes,colors,[0,.18,0],.52,-.20,{count:6,width:.33,tip:"eye",spikes:true,amp:1.15});
        return;
      }

      // 4. MINDFLAYER — DEVORADOR DE MENTES (WoW C'Thraxxi / Faceless Mindflayer Caster)
      if(data.form==="mindflayer"){
        const floatRoot=groupAt(g,0,.22,0);pulses.push({pivot:floatRoot,rock:.05});
        // Billowing shadow-flesh robes tapering downward
        mesh(floatRoot,bell,shade,0,.85,0,.56,1.18,.48);
        mesh(floatRoot,shell,flesh,0,1.38,-.04,.46,.52,.36);
        // Chest void-fissure eye
        eldritchEye(floatRoot,eyes,colors,[0,1.42,-.36],.13,[0,0,0],true);
        // Hovering tentacles under robe hem
        for(let i=0;i<5;i++){
          const a=i*Math.PI*2/5;
          tendril(floatRoot,roots,eyes,colors,[Math.sin(a)*.28,.34,Math.cos(a)*.28],.14,.2,{count:3,width:.08,pitch:Math.PI*.92,amp:.85});
        }
        // Bulbous ribbed brain-cranium + 6 glowing eyes + fanged maw + 6 writhing face tentacles!
        const head=groupAt(floatRoot,0,1.98,-.04);r.head=head;
        mesh(head,shell,flesh,0,.12,.06,.38,.44,.42);
        mesh(head,shell,carapace,0,.28,.12,.34,.32,.40);
        for(const side of [-1,1]){
          eldritchEye(head,eyes,colors,[side*.16,.16,-.32],.085,[0,-side*.26,0],true);
          eldritchEye(head,eyes,colors,[side*.26,.04,-.24],.065,[0,-side*.52,0],true);
          eldritchEye(head,eyes,colors,[side*.10,.30,-.30],.058,[-.2,-side*.16,0],true);
        }
        toothyMaw(head,maws,colors,[0,-.08,-.32],.18,.12,[0,0,0],8,false);
        for(let t=0;t<6;t++){
          const ox=(t-2.5)*.075;
          tendril(head,roots,eyes,colors,[ox,-.14,-.28],.16,ox*1.1,{count:4,width:.052,pitch:Math.PI*.84,tip:t===0||t===5?"glow":"fang",amp:1.05});
        }
        // Clawed caster arms holding crackling void orbs
        for(const side of [-1,1]){
          const arm=groupAt(floatRoot,side*.46,1.56,0);arm.userData.side=side;r.arms.push(arm);
          mesh(arm,shell,carapace,side*.08,.04,0,.22,.20,.24);
          beam(arm,flesh,[side*.08,.02,0],[side*.18,-.48,-.24],.16);
          mesh(arm,gem,glow,side*.20,-.54,-.36,.12,.16,.12);
        }
        return;
      }

      // 5. GAZER — OLHO DA FENDA (WoW Floating Bloodshot Eldritch Eye with Under-Maw & Trailing Tentacles)
      if(data.form==="gazer"){
        const orb=groupAt(g,0,1.28,0);r.body=orb;pulses.push({pivot:orb,beat:.05,rock:.07});
        // Colossal hovering fleshy-chitinous eyeball shell
        mesh(orb,sphere,flesh,0,0,.06,.66,.64,.62);
        mesh(orb,shell,carapace,0,.28,.12,.60,.44,.58);
        // Giant central blinking slit-pupil Great Eye
        eldritchEye(orb,eyes,colors,[0,.06,-.32],.52,[0,0,0],true);
        // Ring of 4 smaller watching eyes + bone crown spines
        for(let i=0;i<4;i++){
          const a=(i+.5)*Math.PI/2;
          eldritchEye(orb,eyes,colors,[Math.sin(a)*.56,.26,Math.cos(a)*.52],.14,[-.25,Math.atan2(-Math.sin(a),-Math.cos(a)),0],true);
          mesh(orb,fang,teeth,Math.sin(a)*.48,.58,Math.cos(a)*.48,.11,.36,.11,.25*Math.cos(a),a,-.25*Math.sin(a));
        }
        // Fanged circular under-maw!
        toothyMaw(orb,maws,colors,[0,-.46,-.26],.34,.24,[.45,0,0],10,true);
        // 5 Trailing writhing tentacles dangling below the floating eye
        for(let i=0;i<5;i++){
          const a=i*Math.PI*2/5;
          tendril(orb,roots,eyes,colors,[Math.sin(a)*.38,-.44,Math.cos(a)*.38],.26,Math.sin(a)*.3,{
            count:5,width:.11,pitch:Math.PI*.88,tip:i%2===0?"eye":"fang",amp:1.2
          });
        }
        return;
      }

      // 6. C'THRAXXI COLOSSUS — COLOSSO C'THRAXXI (WoW Mythrax / General Vezax Juggernaut!)
      if(data.form==="kthir"){
        // WoW K'thir Void Prophet: tall robed body, 6 facial tentacles, 4 eyes & floating void crown
        r.body=part(g,colors.shade,[0,1.22,0],[.72,1.16,.52]);
        part(g,colors.carapace,[0,1.52,-.26],[.54,.54,.10]);
        for(const s of [-1,1]){
          jointLeg(g,r,s*.20,0,.78,.80,.20,colors.shade,colors.carapace,s>0?Math.PI:0);
          const arm=groupAt(g,s*.52,1.66,0);arm.userData.side=s;r.arms.push(arm);
          part(arm,colors.shade,[0,-.32,0],[.22,.72,.22]);
          part(arm,colors.carapace,[s*.08,.08,0],[.38,.28,.40],[0,0,-s*.24]);
          tendril(arm,roots,eyes,colors,[0,-.64,-.06],.16,s*.25,{count:3,width:.06,tip:"fang"});
        }
        const head=groupAt(g,0,2.08,-.04);r.head=head;
        mesh(head,shell,colors.flesh,0,.08,0,.38,.44,.40);
        // Floating Void Halo Crown above head!
        const crown=mesh(head,ringLip,colors.glow,0,.58,0,.38,.38,.22,Math.PI/2,0,0);
        pulses.push({pivot:crown,spin:1.6,beat:.08});
        eldritchEye(head,eyes,colors,[-.14,.16,-.32],.095,[0,.2,0],true);
        eldritchEye(head,eyes,colors,[.14,.16,-.32],.095,[0,-.2,0],true);
        eldritchEye(head,eyes,colors,[-.22,.02,-.28],.075,[0,.35,0],true);
        eldritchEye(head,eyes,colors,[.22,.02,-.28],.075,[0,-.35,0],true);
        // 6 writhing facial beard-tentacles
        for(let i=0;i<6;i++){
          const x=(i-2.5)*.095;
          tendril(head,roots,eyes,colors,[x,-.14,-.28],.16,(i-2.5)*.14,{count:4,width:.055,tip:"sucker",amp:1.25});
        }
        return;
      }
      if(data.form==="aqir"){
        // WoW Aqir / Silithid Goliath: 4-legged armored obsidian-violet horror with snapping fanged mandibles
        r.body=part(g,colors.carapace,[0,.98,.16],[1.14,.74,1.42]);
        mesh(g,shell,colors.flesh,0,1.24,.46,.54,.44,.64);
        for(let i=0;i<4;i++){
          mesh(g,fang,colors.glow,0,1.52,-.26+i*.34,.11,.36,.11,-.25,0,0);
        }
        for(const s of [-1,1])for(const z of [-.34,.52]){
          jointLeg(g,r,s*.64,z,.76,.78,.22,colors.shade,colors.carapace,(s>0)===(z>0)?0:Math.PI);
        }
        const head=groupAt(g,0,1.16,-.76);r.head=head;
        mesh(head,shell,colors.carapace,0,0,0,.46,.38,.44);
        toothyMaw(head,maws,colors,[0,-.08,-.34],.34,.22,[0,0,0],10,false);
        for(const [ex,ey] of [[-.22,.16],[.22,.16],[-.12,.22],[.12,.22]]){
          eldritchEye(head,eyes,colors,[ex,ey,-.36],.085,[0,0,0],true);
        }
        for(const s of [-1,1]){
          const arm=groupAt(g,s*.68,1.18,-.48);arm.userData.side=s;r.arms.push(arm);
          beam(arm,colors.carapace,[0,0,0],[s*.22,-.32,-.44],.16);
          mesh(arm,fang,colors.teeth,s*.22,-.34,-.66,.14,.48,.14,-1.25,0,0);
        }
        return;
      }
      if(data.form==="voidhorror"){
        // Swirling Eldritch Void Manifestation with orbiting blinking eyes, central maw & flailing tendrils
        const core=groupAt(g,0,1.45,0);r.body=core;
        pulses.push({pivot:core,rock:.09,beat:.09});
        mesh(core,shell,colors.shade,0,0,0,.64,.76,.62);
        mesh(core,gem,colors.glow,0,.04,0,.42,.56,.42);
        toothyMaw(core,maws,colors,[0,-.10,-.52],.38,.36,[0,0,0],12,true);
        eldritchEye(core,eyes,colors,[0,.38,-.48],.20,[0,0,0],true);
        const orbit=groupAt(core,0,.18,0);
        pulses.push({pivot:orbit,spin:1.35});
        for(let i=0;i<5;i++){
          const a=i*Math.PI*2/5;
          eldritchEye(orbit,eyes,colors,[Math.sin(a)*.86,Math.sin(i*1.7)*.22,Math.cos(a)*.86],.13,[0,-a,0],true);
        }
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3;
          tendril(core,roots,eyes,colors,[Math.sin(a)*.42,-.48,Math.cos(a)*.42],.24,(i%2?1:-1)*.32,{count:5,width:.09,tip:i%2?"eye":"fang",amp:1.45});
        }
        return;
      }
      if(data.form==="cthraxxi"){
        const body=groupAt(g,0,1.76,0);r.body=body;pulses.push({pivot:body,beat:.04});
        mesh(body,shell,shade,0,.06,0,.86,.92,.58);
        mesh(body,shell,carapace,0,.24,-.10,.92,.64,.52);
        // Gaping toothed belly maw!
        toothyMaw(body,maws,colors,[0,-.22,-.52],.52,.36,[0,0,0],12,false);
        // 4 writhing dorsal tentacles splaying from its back
        for(let i=0;i<4;i++){
          const s=i<2?-1:1,hi=i%2;
          const rt=groupAt(body,s*(.42+hi*.18),.35+hi*.24,.44);
          rt.rotation.y=s*(.45+hi*.35);
          tendril(rt,roots,eyes,colors,[0,0,0],.38,s*.2,{count:5,width:.20,splay:.92,tip:hi?"eye":"fang",spikes:true,amp:1.15});
        }
        // Multi-eye horned juggernaut head + face tentacles
        const head=groupAt(g,0,2.78,-.16);r.head=head;
        mesh(head,shell,flesh,0,0,0,.42,.44,.42);
        mesh(head,bell,carapace,0,.26,.06,.38,.42,.36,.22,0,0);
        eldritchEye(head,eyes,colors,[0,.14,-.36],.14,[0,0,0],true);
        for(const s of [-1,1]){
          eldritchEye(head,eyes,colors,[s*.22,.08,-.30],.095,[0,-s*.36,0],true);
          eldritchEye(head,eyes,colors,[s*.16,.28,-.28],.08,[-.2,-s*.25,0],true);
          mesh(head,fang,teeth,s*.34,.36,.04,.14,.46,.14,-.1,0,-s*.45);
        }
        for(let t=0;t<4;t++){
          const ox=(t-1.5)*.095;
          tendril(head,roots,eyes,colors,[ox,-.18,-.30],.16,ox,{count:4,width:.065,pitch:Math.PI*.86,amp:.9});
        }
        // Heavy legs + colossal crushing claw arms WITH TOOTHED SHOULDER MAWS!
        for(const side of [-1,1]){
          jointLeg(g,r,side*.36,0,1.04,1.04,.26,shade,dark,side<0?0:Math.PI);
          const arm=groupAt(g,side*.84,2.14,0);arm.userData.side=side;r.arms.push(arm);
          // Massive armored shoulder bearing its OWN fanged mouth + eye!
          mesh(arm,shell,carapace,side*.12,.14,0,.44,.42,.44);
          toothyMaw(arm,maws,colors,[side*.20,.14,-.34],.24,.18,[0,-side*.32,0],8,true);
          eldritchEye(arm,eyes,colors,[side*.24,.38,-.18],.10,[-.2,-side*.45,0],true);
          beam(arm,flesh,[side*.12,.04,0],[side*.26,-.82,-.18],.32);
          // Giant lobster-claw pincers
          beam(arm,carapace,[side*.26,-.82,-.18],[side*.44,-1.28,-.42],.20);
          beam(arm,teeth,[side*.26,-.82,-.18],[side*.08,-1.22,-.46],.16);
        }
        return;
      }

      // ============================================================
      // COLOSSAL WORLD OF WARCRAFT-INSPIRED OLD GOD BOSSES
      // ============================================================
      const body=groupAt(g,0,0,0);
      // Fleshy abyssal crater mound base ringed with bone spines
      mesh(body,shell,shade,0,.38,0,1.92,.54,1.76);
      mesh(body,shell,flesh,0,.68,0,1.56,.58,1.44);
      for(let i=0;i<10;i++){
        const a=i*Math.PI*2/10;
        mesh(body,fang,i%2?carapace:teeth,Math.sin(a)*1.62,.52,Math.cos(a)*1.52,.22,.64,.22,.42*Math.cos(a),a,-.42*Math.sin(a));
      }

      // 1) SARVAZ — C'THUN (Colossal Great Eye + Ringed Fanged Maw + Watching Eye-Crown + Tentacles)
      if(data.form==="prism"){
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4,root=groupAt(g,Math.sin(a)*1.38,.28,Math.cos(a)*1.38);
          root.rotation.y=a;
          tendril(root,roots,eyes,colors,[0,0,0],.56,i%2?.14:-.14,{
            count:6,width:.34,splay:.95,tip:i%2===0?"eye":"fang",spikes:i%2===1,amp:1.15
          });
        }
        // Muscular stalk & chitinous pillar supporting the Great Eye
        const core=groupAt(body,0,2.55,0);pulses.push({pivot:core,beat:.045});
        mesh(body,bell,flesh,0,1.48,0,1.18,1.55,1.08);
        mesh(body,shell,carapace,0,1.88,0,1.34,.82,1.24);
        // Colossal ringed fanged maw directly below the Great Eye
        toothyMaw(body,maws,colors,[0,1.35,-1.04],.78,.58,[.14,0,0],14,true);
        // Two flanking snapping side maws
        for(const side of [-1,1]){
          toothyMaw(body,maws,colors,[side*1.08,1.25,-.48],.44,.32,[.08,-side*.88,0],8,true);
        }
        // C'Thun's Giant Cyclopean Great Eye framed by chitinous armor eyelids
        const greatEye=groupAt(core,0,.78,0);pulses.push({pivot:greatEye,rock:.06});
        mesh(greatEye,sphere,carapace,0,0,.22,1.18,1.24,1.05);
        eldritchEye(greatEye,eyes,colors,[0,0,-.34],.98,[0,0,0],true);
        // Jagged chitinous brow/eyelid armor plates framing the Great Eye
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3;
          mesh(greatEye,fang,carapace,Math.cos(a)*1.12,Math.sin(a)*1.12,.06,.38,.96,.34,0,0,a-Math.PI/2);
        }
        // Ring of 6 watching secondary eyes around the upper collar
        for(let i=0;i<6;i++){
          const a=(i+.5)*Math.PI/3;
          eldritchEye(body,eyes,colors,[Math.sin(a)*1.24,2.08,Math.cos(a)*1.18],.26,[0,Math.atan2(-Math.sin(a),-Math.cos(a)),0],true);
        }
        // Floating amber void crown shards
        const crown=groupAt(body,0,4.35,0);pulses.push({pivot:crown,spin:.42});
        for(let i=0;i<5;i++){
          const a=i*Math.PI*2/5;
          mesh(crown,gem,i%2?glow:carapace,Math.sin(a)*.92,Math.sin(i*1.7)*.14,Math.cos(a)*.92,.20,.52,.20);
        }
      }
      // 2) MORMUR — YOGG-SARON (Fiend of a Thousand Mouths + Clusters of Eyes + Crusher Tentacles)
      else if(data.form==="chimes"){
        for(let i=0;i<10;i++){
          const a=i*Math.PI*2/10,root=groupAt(g,Math.sin(a)*1.42,.26,Math.cos(a)*1.42);
          root.rotation.y=a;
          tendril(root,roots,eyes,colors,[0,0,0],.58,i%2?.14:-.14,{
            count:6,width:.35,splay:1.02,tip:i%3===0?"eye":"fang",spikes:true,amp:1.2
          });
        }
        // Hulking bulbous Yogg-Saron dome of flesh & icy carapace ribs
        const torso=groupAt(body,0,2.28,0);pulses.push({pivot:torso,beat:.055});
        mesh(torso,shell,flesh,0,0,0,1.56,1.72,1.44);
        mesh(torso,shell,carapace,0,.85,.12,1.22,1.18,1.16);
        // Colossal central gaping maw packed with double rows of teeth
        toothyMaw(torso,maws,colors,[0,-.05,-1.28],.96,.68,[0,0,0],16,false);
        // Upper crown maw roaring skyward-forward
        toothyMaw(torso,maws,colors,[0,1.24,-.78],.62,.46,[-.42,0,0],12,true);
        // 4 flanking side maws gnashing all around the torso (Thousand Mouths!)
        for(const [ang,yOff,rx,ry] of [[-.95,.42,.52,.38],[.95,.42,.52,.38],[-1.85,-.22,.48,.36],[1.85,-.22,.48,.36]]){
          const rDist=1.34;
          toothyMaw(torso,maws,colors,[Math.sin(ang)*rDist,yOff,-Math.cos(ang)*rDist],rx,ry,[0,-ang,0],10,true);
        }
        // Back maw so it's horrific from all 360 degrees
        toothyMaw(torso,maws,colors,[0,.38,1.32],.64,.48,[0,Math.PI,0],10,true);
        // Clusters of peering frost-blue eyes between the maws
        const eyeSpots=[
          [-.58,.78,-1.18,.21],[.58,.78,-1.18,.22],[0,.88,-1.26,.25],
          [-.92,.02,-1.04,.17],[.92,.02,-1.04,.17],[-.36,-.82,-1.22,.16],[.36,-.82,-1.22,.16],
          [-1.12,.92,-.54,.19],[1.12,.92,-.54,.19],[-.72,1.58,-.42,.17],[.72,1.58,-.42,.17],
          [-.55,.95,1.08,.18],[.55,.95,1.08,.18]
        ];
        for(const [ex,ey,ez,es] of eyeSpots){
          eldritchEye(torso,eyes,colors,[ex,ey,ez],es,[0,Math.atan2(-ex,-ez),0],true);
        }
        // Ribbed icy bone-chime spines arcing out of the shoulders
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3;
          mesh(torso,fang,carapace,Math.sin(a)*1.38,1.22,Math.cos(a)*1.38,.28,1.25,.28,.35*Math.cos(a),a,-.35*Math.sin(a));
        }
      }
      // 3) NACREON — N'ZOTH (Hooded Abyssal Mantle + Constellation of Glowing Eyes + Fanged Maw + Deep Tentacles)
      else if(data.form==="shell"){
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4,root=groupAt(g,Math.sin(a)*1.40,.24,Math.cos(a)*1.40);
          root.rotation.y=a;
          tendril(root,roots,eyes,colors,[0,0,0],.62,i%2?.15:-.15,{
            count:7,width:.33,splay:1.08,tip:i%2?"eye":"glow",amp:1.25
          });
        }
        const mantle=groupAt(body,0,2.52,0);pulses.push({pivot:mantle,rock:.07,beat:.04});
        // Iconic curved hooded N'Zoth cephalopod dome/carapace crest
        mesh(mantle,shell,carapace,0,.55,.26,1.64,1.92,1.12,-.18,0,0);
        mesh(mantle,shell,flesh,0,-.12,-.16,1.34,1.38,1.08);
        // sweeping carapace ridges/horns framing the hood
        for(const side of [-1,1]){
          mesh(mantle,fang,carapace,side*1.38,1.12,.14,.42,1.65,.38,-.15,0,-side*.48);
          mesh(mantle,fang,carapace,side*1.58,.32,-.12,.34,1.25,.32,.12,0,-side*.76);
          // 2 upper oral feeler tentacles dangling from cheeks
          tendril(mantle,roots,eyes,colors,[side*.86,-.74,-.82],.32,side*.32,{count:5,width:.17,pitch:Math.PI*.78,tip:"glow",amp:1.1});
        }
        // Grand Central Vertical Eye of N'Zoth
        eldritchEye(mantle,eyes,colors,[0,.82,-.88],.58,[-.08,0,0],true);
        // Constellation of 10 glowing eyes sweeping across the hooded carapace
        for(const side of [-1,1]){
          eldritchEye(mantle,eyes,colors,[side*.56,1.18,-.72],.26,[-.16,-side*.28,0],true);
          eldritchEye(mantle,eyes,colors,[side*.94,.76,-.62],.31,[-.05,-side*.46,0],true);
          eldritchEye(mantle,eyes,colors,[side*.64,.38,-.88],.22,[.04,-side*.30,0],true);
          eldritchEye(mantle,eyes,colors,[side*1.16,.18,-.46],.24,[.08,-side*.62,0],true);
          eldritchEye(mantle,eyes,colors,[side*.36,1.62,-.52],.20,[-.28,-side*.20,0],true);
        }
        // Wide abyssal fanged maw under the eye constellation
        toothyMaw(mantle,maws,colors,[0,-.66,-.98],.92,.56,[.08,0,0],14,false);
        // Secondary toothed breathing-maw on the lower belly
        toothyMaw(body,maws,colors,[0,.92,-1.18],.54,.38,[.18,0,0],10,true);
      }
      // 4) VELTRIO — Y'SHAARJ (Pulsing Crimson Heart + Multi-Headed Fanged Jaws + Ruby Eyes + Blood Tentacles)
      else if(data.form==="heart"){
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4,root=groupAt(g,Math.sin(a)*1.44,.26,Math.cos(a)*1.44);
          root.rotation.y=a;
          tendril(root,roots,eyes,colors,[0,0,0],.58,i%2?.14:-.14,{
            count:6,width:.35,splay:.98,tip:i%2===0?"fang":"eye",spikes:true,amp:1.2
          });
        }
        // Central beating eldritch heart encased in bone-carapace ribs
        const heart=groupAt(body,0,1.98,0);pulses.push({pivot:heart,beat:.11});
        mesh(heart,shell,flesh,0,0,0,1.28,1.42,1.18);
        mesh(heart,gem,glow,0,0,-.62,.52,.86,.52);
        // Ribbed crimson-bone cage + gaping chest-maw
        toothyMaw(heart,maws,colors,[0,-.08,-1.08],.78,.60,[0,0,0],14,false);
        for(const side of [-1,1]){
          for(let k=0;k<3;k++){
            mesh(heart,fang,carapace,side*(1.12-k*.06),-.5+k*.52,-.22,.24,.88,.24,.2,0,-side*(1.15-k*.12));
          }
          eldritchEye(heart,eyes,colors,[side*.72,.58,-.92],.22,[0,-side*.38,0],true);
          eldritchEye(heart,eyes,colors,[side*.94,-.34,-.74],.18,[0,-side*.55,0],true);
        }
        // 3 Towering Snapping Horror-Heads (Y'Shaarj's multi-headed silhouette!)
        const heads=[
          {x:0,y:3.96,z:-.22,scale:1.05,yaw:0},
          {x:-1.38,y:3.28,z:-.16,scale:.84,yaw:.36},
          {x:1.38,y:3.28,z:-.16,scale:.84,yaw:-.36}
        ];
        for(const h of heads){
          beam(body,flesh,[h.x*.32,2.15,0],[h.x,h.y-.32,h.z],.44*h.scale);
          const head=groupAt(body,h.x,h.y,h.z);
          head.rotation.y=h.yaw;
          pulses.push({pivot:head,beat:.07,rock:.09});
          mesh(head,shell,carapace,0,.18,.14,.74*h.scale,.68*h.scale,.78*h.scale);
          mesh(head,fang,teeth,0,.78,.28,.22*h.scale,.62*h.scale,.22*h.scale,-.32,0,0);
          // Each head has its own gaping fanged maw + 4 burning eyes!
          toothyMaw(head,maws,colors,[0,-.12,-.58*h.scale],.54*h.scale,.40*h.scale,[.06,0,0],10,false);
          eldritchEye(head,eyes,colors,[-.34*h.scale,.24*h.scale,-.54*h.scale],.18*h.scale,[0,.26,0],true);
          eldritchEye(head,eyes,colors,[.34*h.scale,.24*h.scale,-.54*h.scale],.18*h.scale,[0,-.26,0],true);
          eldritchEye(head,eyes,colors,[0,.42*h.scale,-.52*h.scale],.15*h.scale,[-.18,0,0],true);
        }
      }
      // 5) FERMENTO — G'HUUN / ROT-FLESH OLD GOD (Bulbous Pustule-Maws + Multi-Eye Clusters + Bile Tentacles)
      else{
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4,root=groupAt(g,Math.sin(a)*1.38,.24,Math.cos(a)*1.38);
          root.rotation.y=a;
          tendril(root,roots,eyes,colors,[0,0,0],.56,i%2?.14:-.14,{
            count:6,width:.33,splay:1.0,tip:i%2===0?"eye":"glow",amp:1.18
          });
        }
        const stalk=groupAt(body,0,2.28,0);pulses.push({pivot:stalk,beat:.065});
        mesh(stalk,bell,flesh,0,-.32,0,.92,2.15,.92);
        // Giant bulbous fleshy cap with gaping under-maw
        const cap=groupAt(stalk,0,1.25,0);pulses.push({pivot:cap,rock:.08});
        mesh(cap,shell,carapace,0,.22,0,1.72,.88,1.62);
        mesh(cap,shell,flesh,0,-.15,0,1.45,.66,1.38);
        // Massive central spore-maw packed with teeth
        toothyMaw(stalk,maws,colors,[0,.24,-1.04],.86,.62,[.12,0,0],14,true);
        // 4 bloated pustule sacs around the torso, each with a smaller fanged maw and cluster of bulging eyes
        for(let i=0;i<4;i++){
          const a=(i+.5)*Math.PI/2,sx=Math.sin(a)*1.18,sz=Math.cos(a)*1.18;
          const sac=groupAt(stalk,sx,-.22+(i%2)*.48,sz);
          pulses.push({pivot:sac,beat:.09});
          mesh(sac,sphere,flesh,0,0,0,.64,.56,.64);
          const yaw=Math.atan2(-sx,-sz);
          toothyMaw(sac,maws,colors,[Math.sin(a)*.52,-.04,Math.cos(a)*.52],.36,.28,[0,yaw,0],8,true);
          eldritchEye(sac,eyes,colors,[Math.sin(a+.28)*.55,.28,Math.cos(a+.28)*.55],.16,[-.2,yaw+.25,0],false);
          eldritchEye(sac,eyes,colors,[Math.sin(a-.26)*.54,.24,Math.cos(a-.26)*.54],.13,[-.18,yaw-.25,0],false);
        }
        // Clusters of glowing bulging eyes studding the upper cap dome
        for(let i=0;i<7;i++){
          const a=i*Math.PI*2/7;
          eldritchEye(cap,eyes,colors,[Math.sin(a)*1.38,.36,Math.cos(a)*1.28],.22,[-.26,Math.atan2(-Math.sin(a),-Math.cos(a)),0],true);
        }
        eldritchEye(cap,eyes,colors,[0,.98,-.24],.38,[-.85,0,0],true);
      }
    }

    function pose(r,time,phase,stride,charge){
      const {roots,pulses,eyes,maws}=r.ancient;
      // Writhing sinusoidal S-wave tentacles
      for(const seg of roots){
        const wave=Math.sin(time*(2.8+stride*7+charge*3.2)+phase+seg.phase);
        const sway=Math.cos(time*(2.1+charge*2.4)+seg.phase*.8);
        const amp=(.11+stride*.22+charge*.16)*(seg.amp??1)*(1+(seg.index??0)*.09);
        seg.joint.rotation.z=seg.rest+wave*amp;
        seg.joint.rotation.x=(seg.restX??0)+sway*(.09+charge*.14)*(seg.amp??1);
      }
      // Pulsing flesh / spinning shards / breathing organs
      for(const [i,{pivot,spin,rock,beat}] of pulses.entries()){
        if(spin)pivot.rotation.y=time*spin+phase;
        if(rock)pivot.rotation.z=Math.sin(time*2.2+phase+i)*rock*(1+charge*.8);
        if(beat)pivot.scale.setScalar(1+Math.sin(time*(4.6+charge*3)+phase+i*1.7)*beat+charge*.09);
      }
      // Organic blinking & darting Eldritch Eyes
      for(const eye of eyes){
        const blinkCycle=(time*.65+eye.phase*1.3)%4.7;
        const blink=blinkCycle<.16?Math.sin((blinkCycle/.16)*Math.PI):0;
        const openScale=charge>.25?1+charge*.14:Math.max(.08,1-blink*.92);
        eye.lid.scale.y=openScale;
        const dart=Math.sin(time*1.9+eye.phase*3.1)*Math.cos(time*.7+eye.phase);
        eye.iris.rotation.y=dart*.28;
        eye.iris.rotation.x=Math.sin(time*1.3+eye.phase*2.2)*.18;
      }
      // Gnashing / snapping fanged Maws (yawn wide open when charging attack!)
      for(const maw of maws){
        const chomp=.5+.5*Math.sin(time*(3.4+charge*5.5)+phase+maw.phase);
        const open=Math.min(1,chomp*.55+charge*.68);
        if(maw.mode==="ring"){
          const stretch=1+open*.22;
          maw.ring.scale.set(stretch,stretch,1);
          maw.ring.rotation.z=Math.sin(time*1.8+maw.phase)*.16;
          maw.inner.scale.set(1+open*.15,1+open*.15,1);
          maw.inner.rotation.z=-time*(.45+charge*1.4);
        }else{
          maw.upper.rotation.x=-(.08+open*.48);
          maw.lower.rotation.x=.08+open*.52;
        }
        const ts=maw.throatScale,gPulse=.86+open*.28;
        maw.throat.scale.set(ts[0]*gPulse,ts[1]*gPulse,ts[2]*gPulse);
      }
      if(r.head)r.head.rotation.x=Math.sin(time*4+phase)*stride*.12-charge*.24;
      if(r.arms.length)for(const arm of r.arms)arm.rotation.x=Math.sin(time*8*stride+arm.userData.side)*stride*.34-charge*.72;
    }

    // Visual corruption attachment for ANY corrupted nearby mob (writhing tentacles + glowing eyes + void halo)
    function corruptEntity(entity,profile){
      if(entity.corruptVisual)return;
      const colors=palette(profile);
      const root=new THREE.Group();
      root.name="Corrupção Ancestral";
      const radius=Math.max(.34,entity.dimensions?.radius??.48);
      const height=Math.max(.75,entity.dimensions?.height??1.35);
      const cy=height*.54;
      const anim={roots:[],eyes:[],maws:[],halo:null};

      // 3-4 writhing dark tentacles sprouting from the mob's back/flanks
      const tCount=radius>.65?4:3;
      for(let i=0;i<tCount;i++){
        const a=-Math.PI*.65+i*(Math.PI*1.3/(tCount-1));
        const tx=Math.sin(a)*radius*.55,tz=Math.cos(a)*radius*.45;
        const base=groupAt(root,tx,cy+height*.14,tz);
        base.rotation.y=a;
        tendril(base,anim.roots,anim.eyes,colors,[0,0,0],Math.min(.36,.16+height*.12),i%2?.32:-.32,{
          count:4,width:Math.min(.14,.055+radius*.08),tip:i===1?"eye":"fang",amp:1.15
        });
      }
      // 4 glowing eldritch eyes clustered asymmetrically on the mob's body
      const eyeScale=Math.min(.13,.055+radius*.08);
      const spots=[
        [radius*.72,cy+.12,-radius*.25,-Math.PI*.42],
        [-radius*.72,cy+.06,-radius*.18,Math.PI*.42],
        [radius*.42,cy+.28,radius*.48,-Math.PI*.78],
        [-radius*.44,cy+.22,radius*.44,Math.PI*.78]
      ];
      for(const [ex,ey,ez,ry] of spots){
        eldritchEye(root,anim.eyes,colors,[ex,ey,ez],eyeScale,[0,ry,0],true);
      }
      // Subtle glowing corruption aura halo around the corrupted mob
      if(globalThis.QuimiCraftSpectral?.halo){
        anim.halo=QuimiCraftSpectral.halo(THREE,root,colors.accentHex,[0,cy,0],radius*2.9,height*1.35,.22);
      }
      root.traverse(node=>{
        if(node.isMesh){node.castShadow=false;node.receiveShadow=false}
      });
      entity.group.add(root);
      entity.corruptVisual={root,anim,profile};
    }

    function poseCorrupted(entity,time){
      const cv=entity.corruptVisual;
      if(!cv)return;
      const {roots,eyes}=cv.anim;
      const phase=entity.phase||0;
      for(const seg of roots){
        seg.joint.rotation.z=seg.rest+Math.sin(time*4.2+phase+seg.phase)*.22*(1+(seg.index??0)*.1);
        seg.joint.rotation.x=Math.cos(time*3.1+seg.phase)*.14;
      }
      for(const eye of eyes){
        const blinkCycle=(time*.8+eye.phase*1.7)%4.2;
        const blink=blinkCycle<.15?Math.sin((blinkCycle/.15)*Math.PI):0;
        eye.lid.scale.y=Math.max(.08,1-blink*.92);
        eye.iris.rotation.y=Math.sin(time*2.6+eye.phase*2.3)*.32;
      }
    }

    function warning(parent,zones,profile){
      const group=new THREE.Group(),material=new THREE.MeshBasicMaterial({
        color:QuimiCraftAncients.colorNumber(profile.accent),transparent:true,opacity:.27,depthWrite:false,side:THREE.DoubleSide,
        polygonOffset:true,polygonOffsetFactor:-3
      });
      for(const zone of zones){
        const pivot=groupAt(group,zone.x,zone.y+.035,zone.z);
        if(zone.r){
          mesh(pivot,zone.inner?ring:disk,material,0,0,0,zone.r,zone.r,1).rotation.x=-Math.PI/2;
        }else{
          mesh(pivot,line,material,0,0,0,zone.width,zone.length,1).rotation.x=-Math.PI/2;
          pivot.rotation.y=zone.angle;
        }
      }
      parent.add(group);
      return {update:t=>{material.opacity=.24+t*.48},remove:()=>{parent.remove(group);material.dispose()}};
    }
    return {build,pose,warning,corruptEntity,poseCorrupted};
  }
};
