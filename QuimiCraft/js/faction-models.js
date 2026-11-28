"use strict";

globalThis.QuimiCraftFactionModels={
  create(THREE,part,beam,jointLeg,jointArm){
    const buildDivine=QuimiCraftDivineModels.create(THREE,part,jointLeg,jointArm);
    const linear=hex=>new THREE.Color(hex).convertSRGBToLinear();
    const mat=(hex,rough=.65,metal=.15,emissive=0,eInt=0,opts={})=>new THREE.MeshStandardMaterial({
      color:linear(hex),roughness:rough,metalness:metal,flatShading:true,
      ...(emissive?{emissive:linear(emissive),emissiveIntensity:eInt}:{}),...opts
    });
    const glow=(hex,opts={})=>new THREE.MeshBasicMaterial({color:hex,toneMapped:false,...opts});

    const palettes={
      scourge:{
        steel:mat(0x334763,.30,.70,0x14324d,.18),
        dark:mat(0x131b26,.48,.48,0x081320,.10),
        trim:mat(0x82a3c4,.26,.76,0x2e6c94,.24),
        flesh:mat(0x5c6952,.84,.04,0x1d2b1d,.08),
        rot:mat(0x3a4734,.88,.04),
        blood:mat(0x4f171d,.58,.08,0x2b070c,.28),
        bone:mat(0xd7d2be,.56,.06),
        cloth:mat(0x1b2940,.86,.06,0x0a1c33,.14),
        ghost:mat(0x74d8f2,.28,.08,0x49c9f5,.65,{transparent:true,opacity:.68,depthWrite:false}),
        ghostVeil:mat(0x284e6e,.5,.05,0x2c82b8,.45,{transparent:true,opacity:.56,depthWrite:false,side:THREE.DoubleSide}),
        light:glow(0x7af4ff),
        lightSoft:mat(0x69e8ff,.22,.1,0x3fd8ff,.95),
        haloHex:0x5ce4ff
      },
      light:{
        gold:mat(0xe6b647,.24,.76,0x996514,.18),
        goldBright:mat(0xffdf80,.20,.72,0xd99b26,.36),
        marble:mat(0xf2efe4,.34,.14,0xfff3d1,.12),
        ivory:mat(0xe3d8c1,.44,.12,0xd1b379,.10),
        dark:mat(0x6e471b,.44,.52),
        cloth:mat(0xf7f2e2,.68,.06,0xffebc2,.14),
        wingGlow:mat(0xfff4c4,.18,.08,0xffd45c,1.05,{transparent:true,opacity:.88}),
        light:glow(0xffe88a),
        lightPure:glow(0xfff9db),
        haloHex:0xffd866
      },
      fel:{
        steel:mat(0x221d2b,.36,.68,0x1e0e29,.14),
        dark:mat(0x14101c,.52,.44),
        flesh:mat(0x6e242c,.72,.08,0x3d0c14,.18),
        fleshDark:mat(0x471722,.78,.08,0x290810,.14),
        horn:mat(0x2b242c,.46,.18),
        bone:mat(0xc7bca0,.54,.08),
        wingMembrane:mat(0x3a1324,.76,.06,0x4d1020,.22,{side:THREE.DoubleSide}),
        cloth:mat(0x361326,.82,.08,0x29081b,.16),
        light:glow(0xaaff3b),
        felCore:mat(0x98ff2e,.20,.08,0x74f516,1.15),
        felOrange:glow(0xff9b38),
        haloHex:0x8eff2b
      },
      druid:{
        steel:mat(0x4b6e44,.62,.16,0x1d4020,.14),
        dark:mat(0x3a2a1d,.76,.10),
        wood:mat(0x6e4a2e,.74,.08),
        cloth:mat(0x27573c,.82,.06,0x103320,.12),
        flesh:mat(0xc99c74,.68,.06),
        bone:mat(0xded4b8,.56,.08),
        trim:mat(0xb8934c,.34,.58),
        light:glow(0x6effa6),
        lightSoft:mat(0x5ae896,.24,.10,0x3bd67c,.85),
        haloHex:0x66f59e
      },
      alchemist:{
        steel:mat(0x3a6e75,.34,.62,0x143e45,.16),
        dark:mat(0x222c30,.56,.34),
        brass:mat(0xc79b44,.28,.72,0x593d0e,.14),
        cloth:mat(0x2c6966,.78,.08,0x103836,.12),
        flesh:mat(0xd4ad88,.66,.06),
        glass:mat(0x88f0ec,.16,.18,0x44d8d4,.45,{transparent:true,opacity:.78}),
        light:glow(0x70f8e8),
        lightSoft:mat(0x64e8d8,.22,.10,0x3ad4c2,.88),
        haloHex:0x68f0e0
      },
      villager:{
        steel:mat(0x74848e,.32,.68),
        dark:mat(0x3c2c20,.72,.14),
        cloth:mat(0x8f5638,.80,.06),
        cloak:mat(0x3d6346,.82,.06),
        flesh:mat(0xd8ad86,.66,.06),
        trim:mat(0xdcb45c,.30,.64),
        light:glow(0xffe094),
        lightSoft:mat(0xf2cb72,.28,.22,0xc99a32,.65),
        haloHex:0xffd87a
      }
    };

    const gem=new THREE.OctahedronGeometry(1,0);
    const sphere=new THREE.SphereGeometry(1,11,9);
    const hornGeo=new THREE.ConeGeometry(.42,1,6);
    const cyl=new THREE.CylinderGeometry(.5,.5,1,10);
    const haloGeo=new THREE.TorusGeometry(1,.052,6,22);
    const shardGeo=new THREE.OctahedronGeometry(1,0);
    const eyeBlack=new THREE.MeshBasicMaterial({color:0x050308});

    const pivot=(parent,x,y,z)=>{const node=new THREE.Group();node.position.set(x,y,z);parent.add(node);return node};
    function shape(parent,geometry,material,x,y,z,sx,sy=sx,sz=sx,rx=0,ry=0,rz=0){
      const m=new THREE.Mesh(geometry,material);
      m.position.set(x,y,z);m.scale.set(sx,sy,sz);
      if(rx||ry||rz)m.rotation.set(rx,ry,rz);
      parent.add(m);return m;
    }
    function addHalo(parent,hex,pos,w,h,opacity=.38){
      if(globalThis.QuimiCraftSpectral?.halo)QuimiCraftSpectral.halo(THREE,parent,hex,pos,w,h,opacity);
    }
    function eyes(head,matLight,y,z,x,w=.086,h=.056){
      for(const sign of [-1,1])part(head,matLight,[sign*x,y,z],[w,h,.032]);
    }

    // Multi-segment curved demon horn (WoW Eredar / Felguard / Imp / Dreadlord style)
    function curvedHorn(parent,material,glowMat,basePos,side,scale,sweep=1){
      const root=pivot(parent,...basePos);
      const pts=[
        [0,0,0],
        [side*.22*scale,.18*scale,.04*scale],
        [side*.46*scale,.44*scale,.16*scale*sweep],
        [side*.54*scale,.78*scale,.28*scale*sweep],
        [side*.42*scale,1.08*scale,.22*scale*sweep]
      ];
      for(let i=1;i<pts.length;i++){
        beam(root,material,pts[i-1],pts[i],(.14-i*.024)*scale);
      }
      shape(root,hornGeo,material,...pts[4],.10*scale,.28*scale,.10*scale,-.25,0,-side*.22);
      if(glowMat)shape(root,gem,glowMat,...pts[2],.055*scale,.09*scale,.055*scale);
      return root;
    }

    // Seamless scalloped Bat-Demon Wings (BufferGeometry membranes + bone struts + Fel veins)
    function wingMembraneGeo(pts){
      const verts=[],idx=[];
      for(const [a,b,c] of pts){
        const base=verts.length/3;
        verts.push(...a,...b,...c);
        idx.push(base,base+1,base+2);
      }
      const geo=new THREE.BufferGeometry();
      geo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
      geo.setIndex(idx);geo.computeVertexNormals();
      return geo;
    }
    function demonWings(parent,rig,p,y,z,scale=1,customAnim=false){
      for(const side of [-1,1]){
        const wing=pivot(parent,side*.24*scale,y,z);
        wing.userData.side=side;
        if(customAnim)rig.factionAnim.wings.push({pivot:wing,side,amp:.30,speed:2.2,base:.14});
        else rig.wings.push(wing);
        const root=[0,0,0];
        const shoulderLow=[0,-.52*scale,.08*scale];
        const elbow=[side*.68*scale,.44*scale,.16*scale];
        const wrist=[side*1.36*scale,.86*scale,.24*scale];
        // Wing arm & bone thumb claw
        beam(wing,p.fleshDark,root,elbow,.11*scale);
        beam(wing,p.fleshDark,elbow,wrist,.09*scale);
        shape(wing,hornGeo,p.bone,wrist[0],wrist[1]+.14*scale,wrist[2]-.04*scale,.09*scale,.28*scale,.09*scale,-.4,0,-side*.35);
        // 4 splayed bat-wing finger ribs
        const t0=[side*1.96*scale,.56*scale,.34*scale];
        const t1=[side*1.74*scale,-.06*scale,.32*scale];
        const t2=[side*1.24*scale,-.48*scale,.26*scale];
        const t3=[side*.66*scale,-.66*scale,.20*scale];
        for(const [from,to] of [[wrist,t0],[wrist,t1],[wrist,t2],[elbow,t3]]){
          beam(wing,p.horn,from,to,.055*scale);
          beam(wing,p.light,from,[(from[0]+to[0])*.58,(from[1]+to[1])*.58,from[2]-.018],.024*scale);
        }
        // Continuous stretched leathery membranes directly between the wing bones (ZERO gaps!)
        const geo=wingMembraneGeo([
          [wrist,t0,t1],[wrist,t1,t2],[wrist,t2,elbow],
          [elbow,t2,t3],[elbow,t3,shoulderLow],[elbow,shoulderLow,root]
        ]);
        const mem=new THREE.Mesh(geo,p.wingMembrane);
        mem.userData.ownGeometry=true;
        wing.add(mem);
      }
    }

    // Radiant Feathered Angelic / Lightforged Wings (feathers rooted directly along the golden wing arch!)
    function lightWings(parent,rig,p,y,z,scale=1,pairs=1){
      for(let pair=0;pair<pairs;pair++){
        const py=y+(pair===0?.08:pair===1?-.22:-.52)*scale;
        const pScale=scale*(pair===0?1.12:pair===1?.92:.74);
        const tilt=pair===0?.24:pair===1?-.05:-.34;
        for(const side of [-1,1]){
          const wing=pivot(parent,side*(.24+pair*.04)*scale,py,z+pair*.05);
          wing.userData.side=side;
          if(pairs>1)rig.factionAnim.wings.push({pivot:wing,side,amp:.18+pair*.04,speed:1.7,base:.18+tilt*.4,phase:pair*.65});
          else rig.wings.push(wing);
          const p0=[0,0,0];
          const arch1=[side*.60*pScale,(.36+tilt*.4)*pScale,.14*pScale];
          const arch2=[side*1.32*pScale,(.60+tilt*.5)*pScale,.24*pScale];
          // Burnished golden wing-frame arch
          beam(wing,p.gold,p0,arch1,.10*pScale);
          beam(wing,p.goldBright,arch1,arch2,.075*pScale);
          shape(wing,gem,p.light,...arch1,.07*pScale,.11*pScale,.05*pScale);
          // 6 cascading luminous feathers anchored directly ON the golden arch (zero detachment!)
          const feathers=6;
          for(let i=0;i<feathers;i++){
            const frac=(i+.35)/feathers;
            const seg=frac<.5?frac*2:(frac-.5)*2;
            const a=frac<.5?p0:arch1,b=frac<.5?arch1:arch2;
            const sx=a[0]+(b[0]-a[0])*seg,sy=a[1]+(b[1]-a[1])*seg,sz=a[2]+(b[2]-a[2])*seg;
            const fLen=(.66+Math.sin(frac*Math.PI)*.44)*pScale;
            const tx=sx+side*(.18+frac*.28)*pScale,ty=sy-fLen,tz=sz+.08*pScale;
            beam(wing,i%2===0?p.wingGlow:p.marble,[sx,sy,sz],[tx,ty,tz],.15*pScale,.04*pScale);
            beam(wing,p.lightPure,[sx,sy,sz-.018],[tx,ty+.08*pScale,tz-.018],.045*pScale,.02*pScale);
          }
        }
      }
    }

    // Sculpted Skull Relief for Lich King & Scourge Pauldrons/Crossguards
    function skullRelief(parent,p,pos,scale,rot=[0,0,0]){
      const sk=pivot(parent,...pos);sk.rotation.set(...rot);
      shape(sk,sphere,p.bone,0,.04*scale,0,.18*scale,.19*scale,.16*scale);
      part(sk,p.bone,[0,-.10*scale,-.04*scale],[.18*scale,.11*scale,.14*scale]);
      for(const s of [-1,1])part(sk,p.light,[s*.075*scale,.03*scale,-.14*scale],[.05*scale,.045*scale,.03*scale]);
      return sk;
    }

    // Detailed Jawed Head for Demons / Ghouls / Abomination / Felhunter
    function fangedJaw(parent,anim,p,pos,w,h,d,fangCount=6){
      const jaw=pivot(parent,...pos);
      part(jaw,p.fleshDark||p.flesh,[0,-h*.35,-d*.35],[w,h*.6,d]);
      for(let i=0;i<fangCount;i++){
        const t=fangCount===1?0:i/(fangCount-1)*2-1;
        const fx=t*w*.42,fz=-d*.72+Math.abs(t)*d*.26;
        shape(jaw,hornGeo,p.bone,fx,h*.05,fz,w*.09,h*.75,w*.09,.15,0,-t*.15);
      }
      anim.jaws.push({pivot:jaw,rest:.12,amp:.34,phase:pos[1]*3});
      return jaw;
    }

    function build(data,g,rig){
      if(data.form==="divine")return buildDivine(data,g,rig,QuimiCraftDivineFactions.orders[data.order]);
      const {form,height}=data,p=palettes[data.order];
      rig.factionAnim={wings:[],spinners:[],jaws:[],floaters:[],tentacles:[],chimes:[],orbits:[]};
      const anim=rig.factionAnim;

      // ============================================================
      // 1. NAARU — AURINO (WoW Floating Harmonic Crystal Chime Being)
      // ============================================================
      if(form==="orb"){
        const core=pivot(g,0,.88,0);rig.body=core;
        anim.floaters.push({pivot:core,baseY:.88,amp:.18,speed:1.9});
        // Luminous central diamond heart + additive golden-white aura
        shape(core,gem,p.lightPure,0,0,0,.22,.36,.22);
        shape(core,gem,p.wingGlow,0,0,0,.30,.46,.30);
        addHalo(core,p.haloHex,[0,0,0],1.45,1.65,.52);
        // Symmetrical floating Naaru crystal chimes (no connecting rods!)
        const chimeSpecs=[
          // Inner crown & keel chimes
          [0,.62,0,.11,.36,.07,0,0,0,1],
          [0,-.62,0,.11,.36,.07,0,0,Math.PI,1],
          // Left & right sweeping winged crystal blades
          [-.48,.22,0,.10,.44,.06,0,0,.48,1.1],
          [.48,.22,0,.10,.44,.06,0,0,-.48,1.1],
          [-.48,-.22,0,.09,.40,.06,0,0,2.66,1.1],
          [.48,-.22,0,.09,.40,.06,0,0,-2.66,1.1],
          // Outer delicate floating harmonic shards
          [-.82,0,.04,.075,.34,.055,0,0,.18,1.35],
          [.82,0,.04,.075,.34,.055,0,0,-.18,1.35],
          [0,.36,-.34,.06,.24,.05,.32,0,0,1.2],
          [0,-.36,.34,.06,.24,.05,-.32,0,0,1.2]
        ];
        for(const [i,[x,y,z,sx,sy,sz,rx,ry,rz,rad]] of chimeSpecs.entries()){
          const ch=shape(core,gem,i%2===0?p.goldBright:p.light,x,y,z,sx,sy,sz,rx,ry,rz);
          anim.chimes.push({mesh:ch,bx:x,by:y,bz:z,phase:i*.62,rad});
        }
        // Subtle inclined golden harmonic rings
        for(let i=0;i<2;i++){
          const rMesh=shape(core,haloGeo,i===0?p.goldBright:p.light,0,0,0,.56+i*.16);
          rMesh.rotation.set(.95-i*.45,i*.7,0);
          anim.spinners.push({mesh:rMesh,axis:"z",speed:i===0?.75:-.55});
        }
        return;
      }

      // ============================================================
      // 2. FELHUNTER — CÃO DA FENDA (WoW Mana-Draining Demon Hound)
      // ============================================================
      if(form==="hound"){
        const y=height*.52;
        rig.body=part(g,p.fleshDark,[0,y,.06],[.68,.44,.98]);
        part(g,p.steel,[0,y+.08,-.12],[.72,.30,.52]);
        // Muscular crouched hound legs with clawed paws
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.31,-.32,y-.04,y-.02,.17,p.flesh,p.dark,side>0?Math.PI:0);
          jointLeg(g,rig,side*.32,.36,y-.10,y-.08,.16,p.fleshDark,p.dark,side<0?Math.PI:0);
        }
        // Armored shark-jawed demon skull (eyeless/slitted Felhunter head!)
        const head=pivot(g,0,y+.14,-.56);rig.head=head;
        part(head,p.flesh,[0,.05,0],[.48,.28,.54]);
        part(head,p.steel,[0,.14,-.04],[.52,.14,.50]);
        // Upper fangs + animated chomping lower jaw
        for(let i=0;i<6;i++){
          const t=i/5*2-1;
          shape(head,hornGeo,p.bone,t*.18,-.07,-.26+Math.abs(t)*.10,.045,.13,.045,Math.PI-.15,0,t*.14);
        }
        fangedJaw(head,anim,p,[0,-.05,-.02],.42,.15,.46,6);
        eyes(head,p.light,.06,-.27,.14,.095,.032);
        // TWO ICONIC WO-W FELHUNTER MANA-DRAINING DORSAL TENTACLES arched wide & high above the skull!
        for(const side of [-1,1]){
          let anchor=pivot(g,side*.28,y+.24,-.12);
          anchor.rotation.set(.10,side*.26,-side*.42);
          for(let seg=0;seg<5;seg++){
            const len=.24-seg*.022,w=.090-seg*.013;
            const j=pivot(anchor,0,seg?len:0,0);
            j.rotation.x=seg<2?-.10:-.24;
            j.rotation.z=seg===0?-side*.12:side*.06;
            beam(j,seg%2?p.flesh:p.fleshDark,[0,0,0],[0,len+.03,0],w);
            if(seg===4){
              shape(j,sphere,p.felCore,0,len+.04,0,.085,.105,.085);
              addHalo(j,p.haloHex,[0,len+.04,0],.30,.30,.42);
            }
            anim.tentacles.push({joint:j,restX:j.rotation.x,restZ:j.rotation.z,phase:side*1.5+seg*.7,amp:.14});
            anchor=j;
          }
        }
        // Sharp dorsal spine ridge
        for(let i=0;i<5;i++){
          shape(g,hornGeo,i%2?p.bone:p.felCore,0,y+.28-i*.02,-.18+i*.19,.085,.24,.095,.36,0,0);
        }
        // Barbed demon whip-tail
        const tail=pivot(g,0,y+.02,.54);rig.tails.push(tail);
        beam(tail,p.fleshDark,[0,0,0],[0,.14,.34],.095);
        beam(tail,p.flesh,[0,.14,.34],[0,.34,.62],.065);
        shape(tail,hornGeo,p.light,0,.38,.66,.08,.22,.08,.7,0,0);
        return;
      }

      // ============================================================
      // 3. GHOUL — CARNIÇAL DA GEADA (WoW Hunched Feral Scourge Ghoul)
      // ============================================================
      if(form==="ghoul"){
        const hip=.62,sh=1.08;
        const torso=pivot(g,0,hip,0);rig.body=torso;
        torso.rotation.x=.42; // Iconic feral forward hunch!
        part(torso,p.flesh,[0,.26,0],[.46,.48,.30]);
        part(torso,p.cloth,[0,-.02,0],[.48,.22,.34]);
        // Protruding exposed spine vertebrae & visible ribs
        for(let i=0;i<4;i++){
          shape(torso,hornGeo,p.bone,0,.08+i*.11,.17,.06,.14,.06,1.1,0,0);
          beam(torso,p.bone,[-.21,.10+i*.09,-.15],[.21,.10+i*.09,-.15],.038);
        }
        // Snarling thrust-forward gaunt skull head with gaping fanged jaw
        const head=pivot(g,0,sh+.12,-.28);rig.head=head;
        part(head,p.flesh,[0,.04,0],[.34,.28,.34]);
        for(const s of [-1,1]){
          shape(head,hornGeo,p.flesh,s*.22,.08,.04,.07,.18,.05,-.2,0,-s*.85); // Pointed ragged ears
          part(head,p.dark,[s*.09,.06,-.17],[.09,.07,.02]);
        }
        eyes(head,p.light,.06,-.185,.09,.062,.045);
        fangedJaw(head,anim,p,[0,-.09,-.03],.28,.12,.30,6);
        // Crouching legs + overlong clawed knuckle-dragging arms
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.18,.08,hip,hip+.02,.14,p.rot,p.bone,side>0?Math.PI:0);
          const arm=jointArm(g,rig,side*.32,sh,-.16,p.flesh,p.rot,.78,.13);
          const lower=arm.userData.lower;
          for(let c=-1;c<=1;c++){
            shape(lower,hornGeo,p.bone,c*.045,-.46,-.08,.032,.18,.032,Math.PI+.35,0,c*.12);
          }
        }
        return;
      }

      // ============================================================
      // 4. BANSHEE — BANSHEE DO VÉU FRIO (WoW Ethereal Floating Wraith)
      // ============================================================
      if(form==="wraith"){
        const root=pivot(g,0,.22,0);
        anim.floaters.push({pivot:root,baseY:.22,amp:.16,speed:2.1});
        rig.body=part(root,p.ghost,[0,1.08,0],[.46,.56,.28]);
        // Glowing icy soul core inside spectral torso
        shape(root,gem,p.light,0,1.12,-.14,.11,.19,.06);
        addHalo(root,p.haloHex,[0,1.08,0],1.05,1.45,.28);
        // Multi-ribbon billowing ethereal ghostly veil tail tapering into mist
        const shroud=pivot(root,0,.84,0);rig.factionHem=shroud;
        for(let i=0;i<5;i++){
          const a=(i-2)*.55;
          part(shroud,i%2?p.ghost:p.ghostVeil,[Math.sin(a)*.18,-.36,Math.cos(a)*.12],[.18,.72,.08],[.14,a,Math.sin(a)*.12]);
        }
        // Hooded wailing ghostly head + floating spectral hair strands
        const head=pivot(root,0,1.52,-.04);rig.head=head;
        part(head,p.ghostVeil,[0,.05,.04],[.42,.44,.42]);
        part(head,p.dark,[0,0,-.18],[.28,.30,.08]);
        eyes(head,p.light,.06,-.225,.08,.065,.045);
        // Open wailing spectral mouth
        part(head,p.light,[0,-.09,-.225],[.09,.10,.03]);
        for(let i=-2;i<=2;i++){
          beam(head,p.ghost,[i*.07,.16,.18],[i*.11,-.12,.48],.045);
        }
        // Spectral clawed arms with orbiting soul wisps
        for(const side of [-1,1]){
          const arm=jointArm(root,rig,side*.32,1.32,0,p.ghostVeil,p.ghost,.62,.12);
          const lower=arm.userData.lower;
          for(let c=-1;c<=1;c++)beam(lower,p.light,[c*.03,-.30,-.04],[c*.05,-.48,-.12],.024);
          const wisp=shape(lower,gem,p.light,0,-.38,-.16,.075,.075,.075);
          anim.orbits.push({mesh:wisp,cx:0,cy:-.36,cz:-.12,r:.11,speed:3.2*side,phase:side});
        }
        return;
      }

      // ============================================================
      // 5. ABOMINATION — ABOMINAÇÃO COSTURADA (WoW Patchwerk / Stitched Brute)
      // ============================================================
      if(form==="brute"){
        const hip=.92,sh=1.96;
        // Massive bloated stitched necrotic belly
        const torso=pivot(g,0,1.38,0);rig.body=torso;
        shape(torso,sphere,p.flesh,0,-.06,.02,.76,.68,.64);
        shape(torso,sphere,p.rot,0,.38,.06,.72,.44,.56);
        // Split-open stitched gut showing dark crimson cavity, curved bone ribs & sunken plague ooze!
        part(torso,p.blood,[0,-.12,-.52],[.58,.42,.18]);
        shape(torso,sphere,p.lightSoft,0,-.14,-.56,.11,.10,.08);
        for(let i=-1;i<=1;i++){
          for(const s of [-1,1]){
            beam(torso,p.bone,[s*.30,-.04+i*.11,-.56],[s*.09,-.08+i*.11,-.67],.048);
          }
        }
        // Dark iron X-stitches across the belly & chest
        for(const sx of [-.24,0,.24]){
          beam(torso,p.dark,[sx-.05,.18,-.58],[sx+.05,.28,-.58],.028);
          beam(torso,p.dark,[sx+.05,.18,-.58],[sx-.05,.28,-.58],.028);
        }
        // Tiny hunched stitched head sunken deep into massive shoulders
        const head=pivot(g,0,sh+.16,-.32);rig.head=head;
        part(head,p.flesh,[0,0,0],[.40,.34,.38]);
        eyes(head,p.light,.06,-.20,.10,.07,.055);
        fangedJaw(head,anim,p,[0,-.11,-.04],.34,.13,.32,6);
        // Protruding bone spikes & iron bolts on shoulders
        for(const side of [-1,1]){
          shape(torso,hornGeo,p.bone,side*.66,.52,0,.14,.42,.14,0,0,-side*.55);
          jointLeg(g,rig,side*.34,0,hip,hip+.02,.28,p.rot,p.dark,side>0?Math.PI:0);
          jointArm(g,rig,side*.78,sh-.08,0,p.flesh,p.rot,.96,.28);
        }
        // Iconic THIRD smaller stitched arm sprouting from lower left side!
        const thirdArm=pivot(torso,-.66,-.14,-.18);
        beam(thirdArm,p.rot,[0,0,0],[-.24,-.26,-.24],.12);
        for(let c=-1;c<=1;c++)shape(thirdArm,hornGeo,p.bone,-.24+c*.05,-.32,-.32,.03,.12,.03,Math.PI*.7,0,0);
        anim.tentacles.push({joint:thirdArm,restX:0,restZ:.15,phase:1.1,amp:.24});
        // RIGHT HAND: Colossal rusty notched Meat Cleaver
        const rHand=rig.arms[1].userData.lower;
        beam(rHand,p.dark,[0,-.46,-.04],[0,-.46,-.44],.095);
        part(rHand,p.steel,[0,-.44,-.86],[.08,.48,.78]);
        part(rHand,p.trim,[0,-.68,-.88],[.05,.09,.76]);
        part(rHand,p.blood,[0,-.60,-1.04],[.09,.18,.26]);
        // LEFT HAND: Heavy curved Iron Meat Hook & chain
        const lHand=rig.arms[0].userData.lower;
        beam(lHand,p.dark,[0,-.46,-.04],[0,-.46,-.56],.075);
        beam(lHand,p.trim,[0,-.46,-.56],[.16,-.22,-.76],.085);
        beam(lHand,p.trim,[.16,-.22,-.76],[.04,-.06,-.52],.065);
        return;
      }

      // ============================================================
      // 6. SKELETON — ESQUELETO RÚNICO (WoW Scourge Skeleton Warrior)
      // ============================================================
      if(form==="skeleton"){
        const hip=.84,sh=1.42;
        // Articulated spine, pelvis & curved ribcage with glowing cyan soul-flame inside!
        beam(g,p.bone,[0,hip,0],[0,sh+.10,0],.095);
        part(g,p.bone,[0,hip,0],[.38,.18,.24]);
        for(let i=0;i<4;i++){
          const ry=hip+.18+i*.11,rw=.19+i*.022;
          beam(g,p.bone,[-rw,ry,-.12],[rw,ry,-.12],.045);
          beam(g,p.bone,[-rw,ry,-.12],[-rw*.7,ry,.06],.04);
          beam(g,p.bone,[rw,ry,-.12],[rw*.7,ry,.06],.04);
        }
        const flame=shape(g,gem,p.light,0,hip+.35,-.04,.10,.17,.08);
        anim.orbits.push({mesh:flame,cx:0,cy:hip+.35,cz:-.04,r:.015,speed:2.5,phase:0});
        // Sculpted skull + grinning jaw + rusted horned iron Scourge helm
        const head=pivot(g,0,1.66,0);rig.head=head;
        shape(head,sphere,p.bone,0,.04,0,.20,.21,.20);
        part(head,p.bone,[0,-.12,-.05],[.20,.10,.17]);
        for(const s of [-1,1]){
          part(head,eyeBlack,[s*.075,.03,-.18],[.075,.065,.03]);
          part(head,p.light,[s*.075,.03,-.195],[.045,.04,.02]);
        }
        // Rusted iron helm with twin side horns
        part(head,p.steel,[0,.14,.02],[.44,.20,.44]);
        for(const s of [-1,1])shape(head,hornGeo,p.trim,s*.24,.24,-.02,.07,.22,.07,0,0,-s*.52);
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.16,0,hip,hip+.02,.12,p.bone,p.steel,side>0?Math.PI:0);
          const arm=jointArm(g,rig,side*.32,sh,0,p.bone,p.bone,.62,.10);
          part(arm,p.steel,[side*.02,.02,0],[.20,.14,.22]);
        }
        // RIGHT HAND: Runed Scourge Blade
        const rHand=rig.arms[1].userData.lower;
        beam(rHand,p.dark,[0,-.32,-.04],[0,-.32,-.26],.055);
        part(rHand,p.trim,[0,-.32,-.28],[.24,.06,.06]);
        beam(rHand,p.trim,[0,-.32,-.30],[0,-.32,-.96],.10,.035);
        beam(rHand,p.light,[0,-.32,-.34],[0,-.32,-.90],.032);
        // LEFT HAND: Spiked Iron Scourge Shield
        const lHand=rig.arms[0].userData.lower;
        part(lHand,p.steel,[-.12,-.24,-.08],[.07,.54,.44]);
        shape(lHand,gem,p.light,-.16,-.24,-.08,.04,.11,.08);
        return;
      }

      // ============================================================
      // 7. LICH KING — VARKEL, O REI LICH (WoW Arthas Menethil!)
      // ============================================================
      if(form==="king"){
        const hip=1.30,sh=2.34;
        // Heavy gothic saronite-steel armored torso with ribbed plates & glowing runic core
        rig.body=part(g,p.steel,[0,1.82,0],[.92,1.06,.58]);
        part(g,p.dark,[0,1.82,-.28],[.66,.92,.12]);
        for(let i=0;i<3;i++)part(g,p.trim,[0,1.56+i*.26,-.33],[.72-i*.08,.065,.08]);
        shape(g,gem,p.light,0,1.98,-.37,.16,.24,.06);
        addHalo(g,p.haloHex,[0,1.98,-.40],.65,.85,.32);
        // Skull-buckled armored war-belt
        part(g,p.dark,[0,hip+.06,0],[.98,.20,.64]);
        skullRelief(g,p,[0,hip+.06,-.35],.75);
        // Layered armored tassets + armored greaves & spiked sabatons (NO plain skirt box!)
        const skirt=pivot(g,0,hip+.04,0);rig.factionHem=skirt;
        part(skirt,p.cloth,[0,-.52,-.26],[.42,1.04,.07]); // Runed front tabard
        beam(skirt,p.light,[0,-.12,-.30],[0,-.92,-.30],.045);
        for(const side of [-1,1]){
          part(skirt,p.steel,[side*.38,-.38,0],[.28,.76,.56],[0,0,side*.12]);
          jointLeg(g,rig,side*.24,0,hip,hip+.02,.28,p.steel,p.dark,side>0?Math.PI:0);
          // Knee skull spikes on greaves
          shape(rig.legs[rig.legs.length-1],hornGeo,p.trim,0,-.52,-.19,.08,.18,.08,-.5,0,0);
        }
        // Flowing tattered midnight cloak behind shoulders
        const cape=pivot(g,0,sh+.06,.30);rig.cape=cape;
        part(cape,p.cloth,[0,-.96,.06],[1.14,1.92,.07],[.08,0,0]);
        part(cape,p.trim,[0,-.06,.08],[1.18,.18,.12]);
        // HELM OF DOMINATION (Iconic 5-spire jagged crown + glowing ice-blue eyes!)
        const head=pivot(g,0,2.74,-.02);rig.head=head;
        part(head,p.steel,[0,.02,.02],[.54,.54,.54]);
        part(head,eyeBlack,[0,-.02,-.26],[.42,.26,.08]); // Deep dark visor void
        eyes(head,p.light,.02,-.31,.115,.11,.055);
        addHalo(head,p.haloHex,[0,.02,-.34],.58,.36,.42);
        // Metallic cheekbone guards & nasal bridge
        part(head,p.trim,[0,.03,-.30],[.07,.24,.06]);
        for(const s of [-1,1])part(head,p.steel,[s*.21,-.14,-.24],[.16,.20,.14],[0,s*.24,0]);
        // 5 Iconic soaring jagged Crown Spires of the Helm of Domination!
        shape(head,hornGeo,p.trim,0,.64,-.12,.14,.74,.14,-.18,0,0); // Tall central spire
        shape(head,gem,p.light,0,.38,-.26,.075,.14,.05); // Crown forehead crystal
        for(const s of [-1,1]){
          shape(head,hornGeo,p.steel,s*.20,.56,-.06,.12,.64,.12,-.10,0,-s*.26);
          shape(head,hornGeo,p.trim,s*.34,.42,.04,.11,.54,.11,.05,0,-s*.54);
        }
        // Massive Skull-Adorned Spiked Saronite Pauldrons + Arms
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*.66,sh,0,p.steel,p.dark,1.12,.30);
          part(arm,p.steel,[side*.08,.06,0],[.56,.44,.58],[0,0,-side*.16]);
          part(arm,p.trim,[side*.12,.22,0],[.58,.10,.60],[0,0,-side*.16]);
          skullRelief(arm,p,[side*.28,.06,-.24],.92,[0,-side*.45,0]);
          shape(arm,hornGeo,p.trim,side*.24,.46,-.06,.12,.42,.12,-.18,0,-side*.38);
          shape(arm,hornGeo,p.trim,side*.28,.38,.14,.10,.34,.10,.22,0,-side*.55);
        }
        // RIGHT HAND: GELINGOR / FROSTMOURNE (Colossal Horned-Skull Runeblade!)
        const rHand=rig.arms[1].userData.lower;
        const fm=pivot(rHand,0,-.58,-.06);
        fm.rotation.x=-.35; // Angled dramatically forward & slightly down
        beam(fm,p.dark,[0,0,.36],[0,0,-.20],.08); // Wrapped hilt
        shape(fm,gem,p.light,0,0,.40,.09,.09,.12); // Pommel crystal
        // Horned skull crossguard
        part(fm,p.steel,[0,0,-.22],[.58,.14,.16]);
        skullRelief(fm,p,[0,.04,-.24],.75,[0,0,0]);
        for(const s of [-1,1])shape(fm,hornGeo,p.trim,s*.32,0,-.34,.08,.34,.08,-1.1,0,-s*.45);
        // Wide notched jagged Frostmourne steel blade with glowing frost runes!
        beam(fm,p.trim,[0,0,-.26],[0,0,-1.88],.22,.055);
        beam(fm,p.light,[0,0,-.34],[0,0,-1.76],.065,.075);
        for(let n=0;n<3;n++){
          for(const s of [-1,1])shape(fm,hornGeo,p.trim,s*.14,0,-.62-n*.38,.06,.18,.05,-1.25,0,-s*.85);
        }
        addHalo(fm,p.haloHex,[0,0,-1.15],.65,1.55,.36);
        // 4 Orbiting Icecrown Frost Shards around the Lich King!
        for(let i=0;i<4;i++){
          const shd=shape(g,shardGeo,p.lightSoft,0,1.95,0,.11,.24,.10);
          anim.orbits.push({mesh:shd,cx:0,cy:1.95+i*.18,cz:0,r:1.25,speed:1.1,phase:i*Math.PI/2});
        }
        return;
      }

      // ============================================================
      // 8. BURNING LEGION DEMON LORD — ZARVETH (WoW Kil'jaeden / Archimonde!)
      // ============================================================
      if(form==="supreme"){
        const hip=1.54,sh=2.88;
        // Towering muscular crimson-obsidian body cracked with blazing Fel-green magma!
        rig.body=part(g,p.flesh,[0,2.22,0],[1.22,1.38,.78]);
        part(g,p.steel,[0,2.22,-.36],[.84,1.16,.16]);
        // Blazing Fel-green magma core & chest cracks
        shape(g,gem,p.felCore,0,2.40,-.46,.24,.38,.10);
        addHalo(g,p.haloHex,[0,2.40,-.50],1.15,1.35,.46);
        for(const s of [-1,1]){
          beam(g,p.light,[s*.14,2.42,-.45],[s*.48,2.68,-.40],.05);
          beam(g,p.light,[s*.12,2.22,-.45],[s*.44,1.88,-.40],.045);
        }
        // Armored Legion war-belt with Fel skull buckle + armored loin-plates + cloven hooves!
        part(g,p.steel,[0,hip+.08,0],[1.26,.26,.82]);
        shape(g,gem,p.light,0,hip+.08,-.44,.16,.18,.08);
        const skirt=pivot(g,0,hip+.04,0);rig.factionHem=skirt;
        part(skirt,p.cloth,[0,-.58,-.36],[.52,1.14,.09]);
        beam(skirt,p.light,[0,-.15,-.41],[0,-.96,-.41],.055);
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.36,0,hip,hip+.02,.36,p.fleshDark,p.horn,side>0?Math.PI:0);
          // Heavy spiked Legion thigh plates
          part(rig.legs[rig.legs.length-1],p.steel,[side*.04,-.36,-.08],[.44,.52,.44]);
        }
        // Sculpted Horned Eredar Demon Sovereign Head + Giant Sweeping Curved Horns + Fanged Jaw!
        const head=pivot(g,0,3.36,-.08);rig.head=head;
        part(head,p.flesh,[0,.06,0],[.66,.56,.62]);
        part(head,p.steel,[0,.24,.06],[.72,.26,.64]); // Demon crest brow
        shape(head,gem,p.light,0,.22,-.34,.09,.14,.05); // Forehead Fel rune
        eyes(head,p.light,.06,-.33,.16,.13,.065);
        addHalo(head,p.haloHex,[0,.06,-.38],.72,.42,.42);
        fangedJaw(head,anim,p,[0,-.20,-.04],.54,.22,.48,8);
        for(const side of [-1,1]){
          curvedHorn(head,p.horn,p.light,[side*.26,.26,0],side,1.25,1.1);
          // Eredar chin tendrils
          beam(head,p.fleshDark,[side*.16,-.22,-.26],[side*.22,-.48,-.28],.065);
        }
        // Colossal Bat-Demon Wings with Fel veins
        demonWings(g,rig,p,sh-.18,.34,1.38,true);
        // Massive Spiked Fel-Brazier Pauldrons + Arms
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*.86,sh,0,p.flesh,p.steel,1.38,.38);
          part(arm,p.steel,[side*.12,.10,0],[.74,.52,.72],[0,0,-side*.18]);
          // Burning Fel brazier crystal atop each shoulder!
          shape(arm,hornGeo,p.horn,side*.24,.56,0,.16,.54,.16,0,0,-side*.38);
          shape(arm,gem,p.felCore,side*.08,.44,0,.18,.28,.18);
          addHalo(arm,p.haloHex,[side*.08,.48,0],.72,.72,.44);
        }
        // RIGHT HAND: Colossal Blazing Fel Greatsword (Gorshalach / Burning Legion Blade!)
        const rHand=rig.arms[1].userData.lower;
        const glaive=pivot(rHand,0,-.72,-.08);
        glaive.rotation.x=-.26;
        beam(glaive,p.dark,[0,0,.55],[0,0,-.30],.11);
        part(glaive,p.steel,[0,0,-.32],[.82,.22,.22]);
        for(const s of [-1,1])shape(glaive,hornGeo,p.horn,s*.46,0,-.46,.12,.46,.12,-1.15,0,-s*.52);
        shape(glaive,gem,p.light,0,0,-.38,.18,.18,.16);
        beam(glaive,p.steel,[0,0,-.38],[0,0,-2.42],.36,.08);
        beam(glaive,p.felCore,[0,0,-.45],[0,0,-2.30],.12,.11);
        for(let n=0;n<4;n++){
          for(const s of [-1,1])shape(glaive,hornGeo,n%2?p.felCore:p.steel,s*.22,0,-.72-n*.40,.09,.24,.07,-1.25,0,-s*.92);
        }
        addHalo(glaive,p.haloHex,[0,0,-1.40],.92,2.05,.44);
        // 4 Orbiting Fel-Fire Embers around Zarveth
        for(let i=0;i<4;i++){
          const orb=shape(g,gem,i%2?p.felCore:p.light,0,2.35,0,.14,.22,.14);
          anim.orbits.push({mesh:orb,cx:0,cy:2.35+i*.22,cz:0,r:1.58,speed:1.35,phase:i*Math.PI/2});
        }
        return;
      }

      // ============================================================
      // 9. DREADLORD / EREDAR WARLOCK — MAESTRA DA BRASA VIL (WoW Nathrezim!)
      // ============================================================
      if(form==="master"){
        const hip=1.12,sh=2.04;
        rig.body=part(g,p.steel,[0,1.58,0],[.72,.92,.46]);
        part(g,p.cloth,[0,1.58,-.24],[.48,.82,.08]);
        shape(g,gem,p.felCore,0,1.72,-.29,.14,.22,.06);
        // Layered dark warlock robe hem + cloven hooves
        const skirt=pivot(g,0,hip+.04,0);rig.factionHem=skirt;
        for(const side of [-1,1]){
          part(skirt,p.cloth,[side*.19,-.52,0],[.42,1.06,.54],[.04,0,side*.12]);
          beam(skirt,p.light,[side*.08,-.12,-.28],[side*.32,-.96,-.28],.038);
        }
        // High iconic Dreadlord Gothic Spiked Collar behind the head!
        const collar=pivot(g,0,sh+.06,.14);
        for(let i=-2;i<=2;i++){
          shape(collar,hornGeo,i%2?p.steel:p.cloth,i*.18,.28,.08,.14,.56,.08,.22,0,-i*.22);
        }
        // Horned Nathrezim Head
        const head=pivot(g,0,2.40,-.04);rig.head=head;
        part(head,p.flesh,[0,0,0],[.46,.42,.44]);
        eyes(head,p.light,.04,-.235,.11,.09,.048);
        fangedJaw(head,anim,p,[0,-.15,-.03],.36,.13,.34,6);
        for(const side of [-1,1])curvedHorn(head,p.horn,p.light,[side*.18,.18,0],side,.82,.95);
        // Sweeping Dreadlord Bat-Wings
        demonWings(g,rig,p,sh-.14,.26,.95,false);
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*.52,sh,0,p.steel,p.flesh,.94,.22);
          part(arm,p.steel,[side*.08,.06,0],[.38,.28,.40],[0,0,-side*.22]);
          shape(arm,hornGeo,p.horn,side*.18,.32,0,.09,.28,.09,0,0,-side*.45);
        }
        // RIGHT HAND: Prominent Upright Horned Fel Ritual Staff with blazing Fel orb!
        const rHand=rig.arms[1].userData.lower;
        const staff=pivot(rHand,.10,-.44,-.24);
        staff.rotation.x=.18;
        beam(staff,p.dark,[0,-.75,0],[0,1.45,0],.075);
        for(const s of [-1,1])beam(staff,p.steel,[0,1.24,0],[s*.28,1.62,0],.065);
        const orb=shape(staff,gem,p.felCore,0,1.58,0,.18,.24,.18);
        anim.spinners.push({mesh:orb,axis:"y",speed:2.4});
        addHalo(staff,p.haloHex,[0,1.58,0],.68,.68,.52);
        return;
      }

      // ============================================================
      // 10. FELGUARD — GUARDIÃO ABISSAL (WoW Burning Legion Felguard!)
      // ============================================================
      if(form==="guard"){
        const hip=1.08,sh=1.98;
        // Massive scarred crimson-bronze demon torso strapped with blackened iron chains
        rig.body=part(g,p.flesh,[0,1.54,0],[.92,.96,.58]);
        beam(g,p.steel,[-.42,1.98,-.31],[.42,1.12,-.31],.10,.06);
        beam(g,p.steel,[.42,1.98,-.31],[-.42,1.12,-.31],.10,.06);
        shape(g,gem,p.felCore,0,1.56,-.35,.15,.18,.07);
        part(g,p.steel,[0,hip+.06,0],[.96,.20,.62]);
        // Muscular demon legs ending in armored cloven hooves
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.28,0,hip,hip+.02,.28,p.fleshDark,p.horn,side>0?Math.PI:0);
          part(rig.legs[rig.legs.length-1],p.steel,[0,-.52,-.04],[.34,.42,.36]);
        }
        // Horned Iron Helmet & Jawplate + Thick Curved Bull Horns + Upward Tusks
        const head=pivot(g,0,2.32,-.06);rig.head=head;
        part(head,p.flesh,[0,-.02,0],[.48,.44,.48]);
        part(head,p.steel,[0,.14,.02],[.54,.24,.54]);
        eyes(head,p.light,.03,-.25,.12,.10,.052);
        for(const side of [-1,1]){
          curvedHorn(head,p.horn,p.light,[side*.22,.16,0],side,.92,.75);
          shape(head,hornGeo,p.bone,side*.14,-.14,-.26,.055,.18,.055,-.35,0,-side*.25); // Lower tusks
        }
        // Oversized Spiked Legion Pauldrons + Arms
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*.66,sh,0,p.flesh,p.steel,.98,.28);
          part(arm,p.steel,[side*.10,.08,0],[.54,.40,.54],[0,0,-side*.16]);
          shape(arm,hornGeo,p.horn,side*.24,.38,0,.11,.36,.11,0,0,-side*.45);
          shape(arm,gem,p.light,side*.14,.10,-.29,.08,.12,.04);
        }
        // RIGHT HAND: Enormous Iconic Jagged Fel Battleaxe / Cleaver!
        const rHand=rig.arms[1].userData.lower;
        const axe=pivot(rHand,0,-.50,-.08);
        axe.rotation.x=-.30;
        beam(axe,p.dark,[0,0,.45],[0,0,-1.45],.09);
        for(const side of [-1,1]){
          part(axe,p.steel,[side*.30,0,-1.08],[.54,.10,.74],[0,0,side*.08]);
          part(axe,p.felCore,[side*.56,0,-1.08],[.08,.09,.70]);
        }
        addHalo(axe,p.haloHex,[0,0,-1.08],.82,.82,.36);
        return;
      }

      // ============================================================
      // 11. FEL IMP — DIABRETE VIL (WoW Cackling Burning Legion Imp!)
      // ============================================================
      if(form==="imp"){
        const hip=.46,sh=.82;
        const torso=pivot(g,0,hip,0);rig.body=torso;
        torso.rotation.x=.25;
        part(torso,p.flesh,[0,.20,0],[.34,.38,.26]);
        for(let i=0;i<3;i++)shape(torso,hornGeo,p.horn,0,.10+i*.11,.15,.045,.12,.045,1.1,0,0);
        // Barbed Devil Tail with spade tip!
        const tail=pivot(g,0,hip+.04,.16);rig.tails.push(tail);
        beam(tail,p.fleshDark,[0,0,0],[0,.14,.32],.05);
        beam(tail,p.flesh,[0,.14,.32],[0,.36,.44],.038);
        shape(tail,hornGeo,p.light,0,.40,.46,.08,.16,.06,.5,0,0);
        // Oversized mischievous devil head + curved horns + big pointed bat-ears + fanged grin!
        const head=pivot(g,0,sh+.18,-.10);rig.head=head;
        part(head,p.flesh,[0,0,0],[.38,.32,.36]);
        eyes(head,p.light,.04,-.19,.10,.085,.055);
        fangedJaw(head,anim,p,[0,-.10,-.02],.30,.10,.28,5);
        for(const side of [-1,1]){
          curvedHorn(head,p.horn,null,[side*.13,.15,0],side,.58,1.0);
          shape(head,hornGeo,p.flesh,side*.24,.04,.04,.09,.24,.06,-.2,0,-side*1.05); // Big bat ears!
        }
        // Tiny tattered imp wings
        demonWings(g,rig,p,sh-.04,.18,.38,false);
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.14,0,hip,hip+.02,.11,p.fleshDark,p.horn,side>0?Math.PI:0);
          const arm=jointArm(g,rig,side*.26,sh,-.04,p.flesh,p.fleshDark,.44,.10);
          const lower=arm.userData.lower;
          // Crackling Fel fireball hovering in each clawed hand!
          const fb=shape(lower,gem,p.felCore,0,-.26,-.12,.09,.09,.09);
          anim.orbits.push({mesh:fb,cx:0,cy:-.26,cz:-.12,r:.035,speed:5*side,phase:side});
          addHalo(lower,p.haloHex,[0,-.26,-.12],.32,.32,.46);
        }
        return;
      }

      // ============================================================
      // 12. ARCHON OF THE LIGHT — ARCONTE DA PRIMEIRA LUZ (WoW 6-Winged Celestial Archon!)
      // ============================================================
      if(form==="archon"){
        const hip=1.34,sh=2.36;
        // Radiant pearl-marble & burnished-gold full ceremonial armor
        rig.body=part(g,p.marble,[0,1.86,0],[.88,1.04,.54]);
        part(g,p.gold,[0,1.86,-.27],[.64,.92,.10]);
        shape(g,gem,p.lightPure,0,1.98,-.35,.16,.28,.07);
        addHalo(g,p.haloHex,[0,1.98,-.38],.78,.95,.42);
        // Layered flowing ivory & gold ceremonial robes + luminous cape
        const skirt=pivot(g,0,hip+.06,0);rig.factionHem=skirt;
        for(const side of [-1,1]){
          part(skirt,p.cloth,[side*.22,-.62,0],[.48,1.24,.62],[.04,0,side*.10]);
          beam(skirt,p.goldBright,[side*.10,-.10,-.32],[side*.38,-1.14,-.32],.05);
        }
        part(skirt,p.gold,[0,-.56,-.31],[.28,1.08,.06]);
        const cape=pivot(g,0,sh+.06,.28);rig.cape=cape;
        part(cape,p.cloth,[0,-.96,.06],[1.10,1.92,.07],[.08,0,0]);
        // Hooded Celestial Helm + Luminous Visage + Multi-Ray Sunburst Halo Crown!
        const head=pivot(g,0,2.76,0);rig.head=head;
        part(head,p.marble,[0,.04,.02],[.52,.52,.52]);
        part(head,p.gold,[0,.18,-.02],[.56,.22,.56]);
        part(head,p.dark,[0,-.02,-.24],[.38,.28,.07]);
        eyes(head,p.lightPure,.02,-.29,.10,.10,.052);
        addHalo(head,p.haloHex,[0,.02,-.32],.62,.42,.48);
        // Multi-ringed Sunburst Halo Crown behind/above the head
        const haloRoot=pivot(head,0,.28,.12);
        const haloRing=shape(haloRoot,haloGeo,p.light,0,0,0,.58);
        anim.spinners.push({mesh:haloRoot,axis:"z",speed:.48});
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4;
          shape(haloRoot,gem,i%2?p.goldBright:p.lightPure,Math.cos(a)*.74,Math.sin(a)*.74,0,.06,.18,.04,0,0,a-Math.PI/2);
        }
        // SIX (3 pairs!) MAGNIFICENT RADIANT WINGS OF PURE LIGHT!
        lightWings(g,rig,p,sh-.08,.28,1.18,3);
        // Sun-crested gold pauldrons + arms
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*.64,sh,0,p.marble,p.gold,1.08,.26);
          part(arm,p.gold,[side*.08,.08,0],[.46,.36,.48],[0,0,-side*.18]);
          shape(arm,gem,p.light,side*.12,.30,0,.10,.22,.08,0,0,-side*.32);
        }
        // RIGHT HAND: Radiant Sunburst Greatstaff of the Dawn!
        const rHand=rig.arms[1].userData.lower;
        const staff=pivot(rHand,0,-.56,-.06);
        staff.rotation.x=-.24;
        beam(staff,p.gold,[0,-.90,0],[0,1.45,0],.085);
        const star=shape(staff,gem,p.lightPure,0,1.62,0,.20,.30,.20);
        const sRing=shape(staff,haloGeo,p.goldBright,0,1.62,0,.36);
        anim.spinners.push({mesh:star,axis:"y",speed:2.0},{mesh:sRing,axis:"z",speed:-1.4});
        addHalo(staff,p.haloHex,[0,1.62,0],.88,.88,.55);
        return;
      }

      // ============================================================
      // 13. SERAPH — SERAFIM DE ÂMBAR (WoW Lightforged Winged Seraph!)
      // ============================================================
      if(form==="seraph"){
        const hip=1.08,sh=1.88;
        rig.body=part(g,p.marble,[0,1.48,0],[.66,.84,.42]);
        part(g,p.gold,[0,1.52,-.22],[.50,.68,.08]);
        shape(g,gem,p.light,0,1.60,-.28,.12,.20,.05);
        const skirt=pivot(g,0,hip+.04,0);rig.factionHem=skirt;
        part(skirt,p.cloth,[0,-.36,-.20],[.34,.72,.06]);
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.19,0,hip,hip+.02,.20,p.marble,p.gold,side>0?Math.PI:0);
          part(skirt,p.gold,[side*.26,-.24,0],[.20,.48,.42],[0,0,side*.15]);
        }
        // Winged Golden Helm + Double-Ring Celestial Halo
        const head=pivot(g,0,2.22,0);rig.head=head;
        part(head,p.marble,[0,0,0],[.42,.42,.42]);
        part(head,p.gold,[0,.14,-.02],[.46,.18,.46]);
        eyes(head,p.lightPure,.02,-.225,.09,.08,.044);
        for(const side of [-1,1]){
          shape(head,gem,p.goldBright,side*.26,.14,.04,.06,.22,.12,.2,0,-side*.42);
        }
        const haloNode=pivot(head,0,.38,.02);
        haloNode.rotation.x=Math.PI*.42;
        shape(haloNode,haloGeo,p.light,0,0,0,.36);
        shape(haloNode,haloGeo,p.goldBright,0,0,0,.46);
        anim.spinners.push({mesh:haloNode,axis:"z",speed:1.2});
        // Twin Sweeping Radiant Golden Feathered Wings!
        lightWings(g,rig,p,sh-.10,.24,1.02,1);
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*.46,sh,0,p.marble,p.gold,.86,.20);
          part(arm,p.gold,[side*.06,.05,0],[.34,.24,.36],[0,0,-side*.20]);
        }
        // RIGHT HAND: Radiant Dawn Spear
        const rHand=rig.arms[1].userData.lower;
        const spear=pivot(rHand,0,-.44,-.06);
        spear.rotation.x=-.30;
        beam(spear,p.gold,[0,0,.55],[0,0,-1.45],.06);
        shape(spear,gem,p.lightPure,0,0,-1.62,.10,.10,.30);
        addHalo(spear,p.haloHex,[0,0,-1.55],.48,.62,.45);
        return;
      }

      // ============================================================
      // 15. LIGHTFORGED PALADIN — TEMPLÁRIO FORJADO À LUZ (WoW Lightforged Draenei!)
      // ============================================================
      if(form==="paladin"){
        const hip=1.02,sh=1.82;
        rig.body=part(g,p.marble,[0,1.44,0],[.76,.88,.48]);
        part(g,p.gold,[0,1.46,-.25],[.58,.74,.08]);
        shape(g,gem,p.lightPure,0,1.56,-.31,.13,.22,.05);
        addHalo(g,p.haloHex,[0,1.56,-.34],.58,.68,.38);
        part(g,p.gold,[0,hip+.04,0],[.82,.16,.52]);
        const skirt=pivot(g,0,hip+.04,0);rig.factionHem=skirt;
        part(skirt,p.cloth,[0,-.42,-.24],[.36,.84,.06]);
        beam(skirt,p.goldBright,[0,-.10,-.28],[0,-.74,-.28],.045);
        const cape=pivot(g,0,sh+.06,.24);rig.cape=cape;
        part(cape,p.cloth,[0,-.72,.05],[.82,1.44,.06],[.08,0,0]);
        part(cape,p.gold,[0,-.05,.07],[.86,.14,.10]);
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.21,0,hip,hip+.02,.22,p.marble,p.gold,side>0?Math.PI:0);
          part(skirt,p.gold,[side*.29,-.26,0],[.22,.50,.44],[0,0,side*.12]);
        }
        const head=pivot(g,0,2.16,-.02);rig.head=head;
        part(head,p.ivory,[0,0,0],[.42,.42,.42]);
        part(head,p.gold,[0,.14,.02],[.46,.20,.46]);
        eyes(head,p.lightPure,.02,-.225,.095,.085,.046);
        shape(head,gem,p.lightPure,0,.17,-.25,.075,.11,.04); // Forehead Lightforged sigil
        addHalo(head,p.haloHex,[0,.17,-.28],.34,.34,.44);
        for(const side of [-1,1]){
          curvedHorn(head,p.ivory,p.light,[side*.16,.14,.02],side,.62,1.25);
        }
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*.54,sh,0,p.marble,p.gold,.88,.22);
          part(arm,p.gold,[side*.08,.07,0],[.44,.32,.44],[0,0,-side*.18]);
          shape(arm,gem,p.light,side*.12,.26,0,.09,.18,.07,0,0,-side*.30);
        }
        // RIGHT HAND: Colossal Lightforged Dawn Warhammer!
        const rHand=rig.arms[1].userData.lower;
        const hammer=pivot(rHand,0,-.46,-.06);
        hammer.rotation.x=-.28;
        beam(hammer,p.gold,[0,0,.40],[0,0,-1.28],.065);
        part(hammer,p.marble,[0,0,-1.18],[.54,.36,.38]);
        part(hammer,p.gold,[0,0,-1.18],[.60,.40,.20]);
        for(const s of [-1,1])shape(hammer,gem,p.lightPure,s*.32,0,-1.18,.06,.16,.16);
        addHalo(hammer,p.haloHex,[0,0,-1.18],.78,.78,.42);
        // LEFT HAND: Radiant Lightforged Kite Shield
        const lHand=rig.arms[0].userData.lower;
        part(lHand,p.gold,[-.16,-.26,-.10],[.08,.76,.52]);
        part(lHand,p.marble,[-.20,-.26,-.10],[.05,.62,.40]);
        shape(lHand,gem,p.lightPure,-.24,-.26,-.10,.04,.16,.14);
        return;
      }

      // ============================================================
      // 16. VAL'KYR — VAL'KYR DA ALVORADA (WoW Radiant Floating Battle-Maiden!)
      // ============================================================
      if(form==="valkyr"){
        const root=pivot(g,0,.28,0);
        anim.floaters.push({pivot:root,baseY:.28,amp:.18,speed:2.0});
        const hip=1.00,sh=1.78;
        rig.body=part(root,p.marble,[0,1.40,0],[.64,.82,.40]);
        part(root,p.gold,[0,1.44,-.21],[.48,.66,.08]);
        shape(root,gem,p.lightPure,0,1.52,-.27,.11,.20,.05);
        const skirt=pivot(root,0,hip+.04,0);rig.factionHem=skirt;
        for(const side of [-1,1]){
          part(skirt,p.cloth,[side*.16,-.44,0],[.34,.88,.44],[.05,0,side*.14]);
          beam(skirt,p.goldBright,[side*.08,-.10,-.23],[side*.26,-.82,-.23],.038);
          jointLeg(root,rig,side*.17,0,hip,hip+.02,.18,p.marble,p.gold,side>0?Math.PI:0);
        }
        const head=pivot(root,0,2.10,-.02);rig.head=head;
        part(head,p.marble,[0,0,0],[.40,.40,.40]);
        part(head,p.gold,[0,.14,-.02],[.44,.18,.44]);
        part(head,p.dark,[0,-.02,-.19],[.30,.20,.06]);
        eyes(head,p.lightPure,.02,-.23,.09,.085,.046);
        for(const side of [-1,1]){
          shape(head,gem,p.goldBright,side*.28,.16,.06,.06,.26,.14,.25,0,-side*.48);
        }
        const halo=shape(head,haloGeo,p.light,0,.28,.14,.38);
        anim.spinners.push({mesh:halo,axis:"z",speed:1.1});
        lightWings(root,rig,p,sh-.06,.24,1.12,1);
        for(const side of [-1,1]){
          const arm=jointArm(root,rig,side*.46,sh,0,p.marble,p.gold,.84,.19);
          part(arm,p.gold,[side*.06,.06,0],[.34,.24,.36],[0,0,-side*.22]);
        }
        // RIGHT HAND: Radiant Val'kyr Greatsword
        const rHand=rig.arms[1].userData.lower;
        const sw=pivot(rHand,0,-.42,-.06);
        sw.rotation.x=-.34;
        beam(sw,p.dark,[0,0,.24],[0,0,-.18],.055);
        part(sw,p.gold,[0,0,-.20],[.44,.10,.10]);
        beam(sw,p.goldBright,[0,0,-.24],[0,0,-1.44],.16,.04);
        beam(sw,p.lightPure,[0,0,-.30],[0,0,-1.36],.055,.055);
        addHalo(sw,p.haloHex,[0,0,-.86],.48,1.25,.42);
        // LEFT HAND: Golden Buckler
        const lHand=rig.arms[0].userData.lower;
        shape(lHand,cyl,p.gold,-.16,-.28,-.10,.56,.08,.56,0,0,Math.PI/2);
        shape(lHand,gem,p.lightPure,-.22,-.28,-.10,.05,.16,.16);
        return;
      }

      // ============================================================
      // 17. LIGHTFORGED WARFRAME — EXOESQUELETO FORJADO À LUZ (WoW Argus Mech!)
      // ============================================================
      if(form==="warframe"){
        const hip=1.28,sh=2.36;
        // Towering faceted gold & marble mechanical torso with spinning Light-crystal cockpit!
        rig.body=part(g,p.marble,[0,1.84,0],[1.16,1.12,.72]);
        part(g,p.gold,[0,1.86,-.34],[.86,.96,.12]);
        part(g,p.dark,[0,1.92,-.38],[.54,.54,.12]);
        const reactor=shape(g,gem,p.lightPure,0,1.92,-.44,.22,.32,.18);
        const rRing=shape(g,haloGeo,p.goldBright,0,1.92,-.45,.34);
        anim.spinners.push({mesh:reactor,axis:"y",speed:2.4},{mesh:rRing,axis:"z",speed:-1.5});
        addHalo(g,p.haloHex,[0,1.92,-.48],1.05,1.05,.52);
        part(g,p.gold,[0,hip+.06,0],[1.12,.24,.68]);
        // Heavy armored mech legs
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.36,0,hip,hip+.02,.34,p.marble,p.gold,side>0?Math.PI:0);
          const leg=rig.legs[rig.legs.length-1];
          part(leg,p.gold,[side*.04,-.56,-.06],[.44,.58,.46]);
          shape(leg,gem,p.light,side*.04,-.42,-.31,.07,.16,.04);
        }
        // Compact angular mech visor head between colossal shoulder pylons
        const head=pivot(g,0,2.62,-.08);rig.head=head;
        part(head,p.marble,[0,0,0],[.52,.44,.50]);
        part(head,p.gold,[0,.22,.02],[.28,.24,.54]);
        part(head,p.lightPure,[0,.02,-.27],[.42,.10,.05]);
        addHalo(head,p.haloHex,[0,.02,-.30],.56,.26,.45);
        // Twin Shoulder-Mounted Solar Cannons + Heavy Mech Arms with Crystal Forearm Blades!
        for(const side of [-1,1]){
          // Shoulder pylon & Solar Light Cannon pointing along -Z
          part(g,p.gold,[side*.72,sh+.32,.04],[.42,.48,.52]);
          beam(g,p.marble,[side*.72,sh+.46,.20],[side*.72,sh+.46,-.86],.16);
          beam(g,p.goldBright,[side*.72,sh+.46,-.24],[side*.72,sh+.46,-.96],.10);
          shape(g,gem,p.lightPure,side*.72,sh+.46,-1.00,.11,.11,.14);
          addHalo(g,p.haloHex,[side*.72,sh+.46,-1.02],.48,.48,.48);
          const arm=jointArm(g,rig,side*.84,sh-.06,0,p.marble,p.gold,1.16,.32);
          part(arm,p.gold,[side*.10,.08,0],[.56,.42,.56],[0,0,-side*.14]);
          const lower=arm.userData.lower;
          part(lower,p.gold,[side*.16,-.32,-.64],[.09,.24,1.08]);
          part(lower,p.lightPure,[side*.16,-.32,-.68],[.05,.16,1.02]);
          shape(lower,gem,p.lightPure,side*.16,-.32,-1.20,.06,.14,.18);
          addHalo(lower,p.haloHex,[side*.16,-.32,-.74],.46,1.02,.42);
        }
        return;
      }

      // ============================================================
      // 18. INFERNAL — INFERNAL DA FENDA (WoW Burning Legion Hooded Fel-Stone Golem!)
      // ============================================================
      if(form==="infernal"){
        const rockL=mat(0x4f544c,.84,.08);
        const rockM=mat(0x3a3e38,.88,.06);
        const rockD=mat(0x252924,.92,.06);
        const felBright=glow(0xc0ff24);
        const felBeam=mat(0xa0ff1a,.16,.04,0x8cff00,1.45);
        const hip=1.18,sh=2.22;

        // 1. Central Glowing Fel Energy Torso & Tapered Volcanic Ribcage
        const torso=pivot(g,0,1.64,0);rig.body=torso;
        // Inner blazing Fel fire furnace & glowing spine connecting down to the pelvis
        const furnace=shape(torso,gem,felBeam,0,.38,-.06,.34,.42,.28);
        anim.spinners.push({mesh:furnace,axis:"y",speed:1.7});
        addHalo(torso,0xa6ff22,[0,.42,-.18],1.35,1.25,.60);
        beam(torso,felBeam,[0,-.52,0],[0,.32,0],.12); // Glowing waist spine pillar
        // Tapered V-shaped sculpted volcanic rock chest split by a blazing Fel rib-fissure!
        part(torso,rockM,[-.34,.08,-.04],[.46,.68,.54],[.08,.22,.16]);
        part(torso,rockM,[.34,.08,-.04],[.46,.68,.54],[.08,-.22,-.16]);
        part(torso,rockL,[0,.14,.20],[.76,.74,.44],[-.12,0,0]); // Heavy rocky back hump
        part(torso,rockD,[0,-.26,.04],[.54,.30,.46],[.06,0,0]); // Narrow lower chest taper
        // Iconic glowing central chest crack + 3 pairs of branching Fel ribs across chest!
        beam(torso,felBright,[0,-.32,-.31],[0,.36,-.31],.075,.04);
        for(const [ry,rw] of [[.18,.40],[-.02,.34],[-.20,.26]]){
          for(const s of [-1,1]){
            beam(torso,felBright,[0,ry,-.31],[s*rw,ry-.08,-.28],.045,.03);
          }
        }
        // Compact floating triangular volcanic stone pelvis/loinplate beneath glowing waist!
        part(g,rockM,[0,hip+.02,0],[.56,.22,.40]);
        shape(g,hornGeo,rockD,0,hip-.12,-.04,.24,.24,.22,Math.PI,0,0);
        for(const s of [-1,1])beam(g,felBright,[s*.10,hip+.06,-.21],[s*.26,hip-.06,-.18],.04);

        // 2. ICONIC TALL ARCHED STONE HOOD / COWL framing the blazing cauldron & tiny skull!
        const hood=pivot(g,0,2.24,.06);
        part(hood,rockL,[0,.38,.22],[.62,.62,.42],[-.35,0,0]); // Rear vaulted hood dome
        shape(hood,hornGeo,rockL,0,.62,.02,.46,.52,.42,.22,0,0); // Pointed gothic hood apex!
        for(const s of [-1,1]){
          part(hood,rockM,[s*.36,.16,-.02],[.26,.72,.48],[.08,s*.24,-s*.22]); // Thick arched hood side walls
          part(hood,rockL,[s*.24,.44,-.10],[.26,.34,.36],[.26,s*.16,s*.38]); // Hood upper beveled brow arch
          part(hood,rockD,[s*.22,-.16,-.18],[.28,.18,.34],[.12,s*.15,-s*.18]); // Lower hood rock collar
        }
        // Blazing neon-green fire pool inside the hood beneath the skull
        shape(hood,sphere,felBright,0,-.12,-.16,.24,.18,.18);
        addHalo(hood,0xb2ff26,[0,-.04,-.24],1.05,.88,.62);

        // 3. SMALL SINISTER VOLCANIC STONE SKULL tucked deep inside the glowing hood!
        const head=pivot(g,0,2.30,-.14);rig.head=head;
        shape(head,sphere,rockL,0,.06,0,.20,.21,.22);
        part(head,rockM,[0,-.09,-.05],[.18,.15,.20]); // Narrow cheekbone & brow skull jaw
        part(head,rockD,[0,-.15,-.06],[.12,.08,.14]); // Tapered chin
        // Deep dark sockets + piercing neon-Fel green glowing eyes!
        for(const s of [-1,1]){
          part(head,rockD,[s*.075,.04,-.18],[.08,.07,.04]);
          part(head,felBright,[s*.075,.04,-.205],[.052,.042,.025]);
        }
        part(head,rockD,[0,-.04,-.19],[.035,.06,.03]); // Nasal cavity slit

        // 4. ENORMOUS TOWERING FLOATING SHOULDER BOULDERS + FEL-ENERGY ARMS + CLAWED ROCK FINGERS!
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*.92,sh+.12,0,felBeam,rockM,1.22,.16);
          // Hide default plain upper box look by replacing visual dominance with colossal sculpted pauldron + energy bicep!
          const upper=arm;
          // Colossal angular sculpted volcanic shoulder boulder towering high above the hood!
          part(upper,rockL,[side*.14,.38,.02],[.68,.78,.68],[.12,-side*.22,-side*.24]);
          part(upper,rockM,[side*.30,.12,-.08],[.54,.58,.62],[-.10,side*.28,-side*.16]);
          part(upper,rockL,[side*.08,.76,.06],[.46,.38,.48],[.24,-side*.18,side*.16]); // Craggy peaked upper shoulder crest
          part(upper,rockD,[side*.34,.52,.10],[.34,.42,.44],[.18,side*.22,-side*.38]); // Jagged outer stone notch
          // Glowing Fel energy arc connecting torso shoulder socket to the floating pauldron!
          beam(upper,felBright,[-side*.28,.10,0],[side*.04,.16,0],.085);
          addHalo(upper,0xa4ff1e,[-side*.16,.08,-.08],.72,.72,.52);
          // Blazing Fel-energy bicep beam (floating gap between huge pauldron and chunky forearm!)
          beam(upper,felBright,[side*.14,-.08,0],[side*.08,-.54,0],.085);
          beam(upper,felBeam,[side*.18,-.12,-.03],[side*.04,-.50,.03],.045);

          // Chunky rounded volcanic-rock forearm gauntlet laced with glowing Fel cracks + 3 dangling rock claws!
          const lower=arm.userData.lower;
          part(lower,rockM,[0,-.22,0],[.46,.56,.46],[.06,side*.18,0]);
          part(lower,rockL,[side*.06,-.18,-.04],[.42,.44,.42],[-.08,-side*.14,.10]);
          // Glowing green branching magma cracks all over the forearm!
          beam(lower,felBright,[0,-.06,-.24],[side*.14,-.34,-.22],.042);
          beam(lower,felBright,[0,-.12,-.24],[-side*.14,-.38,-.20],.038);
          beam(lower,felBright,[side*.22,-.14,-.08],[side*.20,-.42,-.12],.038);
          addHalo(lower,0xa6ff20,[0,-.32,-.24],.64,.64,.48);
          // 3 sculpted dangling volcanic rock fingers + angled rock thumb!
          for(let f=-1;f<=1;f++){
            shape(lower,hornGeo,rockM,f*.12,-.60,-.06+Math.abs(f)*.05,.095,.34,.095,Math.PI+.16,0,-f*.14);
          }
          shape(lower,hornGeo,rockL,-side*.20,-.48,-.12,.09,.28,.09,Math.PI*.78,0,side*.55); // Thumb claw
        }

        // 5. FLOATING FEL-JOINTED LEGS with ENORMOUS FLARED VOLCANIC SHIN BOULDERS!
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.36,0,hip,hip+.02,.24,rockD,rockM,side>0?Math.PI:0);
          const leg=rig.legs[rig.legs.length-1];
          // Glowing green hip & knee energy joints!
          shape(leg,gem,felBright,0,-.06,0,.13,.15,.13);
          part(leg,rockM,[side*.04,-.28,0],[.34,.40,.34],[.08,0,side*.18]); // Angled chunky rock thigh
          shape(leg,gem,felBright,side*.08,-.50,0,.15,.14,.15); // Glowing Fel knee link!
          // ENORMOUS flared blocky volcanic-rock shin/boot boulder widening toward the ground!
          part(leg,rockL,[side*.12,-.88,-.04],[.54,.68,.60],[.06,-side*.14,-side*.08]);
          part(leg,rockM,[side*.16,-1.04,-.08],[.64,.38,.70],[0,-side*.10,0]); // Flared massive stone foot base
          shape(leg,hornGeo,rockL,side*.24,-.48,-.04,.20,.44,.22,-.08,0,-side*.22); // Outer jagged knee rock fin!
          // Blazing neon-green magma cracks rising from the bottom of the massive stone boots!
          beam(leg,felBright,[side*.12,-1.18,-.38],[side*.04,-.92,-.33],.05);
          beam(leg,felBright,[side*.12,-1.18,-.38],[side*.28,-1.02,-.35],.042);
          beam(leg,felBright,[side*.36,-1.16,-.16],[side*.26,-.88,-.20],.042);
          addHalo(leg,0xa6ff20,[side*.14,-1.06,-.38],.62,.48,.42);
        }

        // 6. Floating tiny volcanic rock chips & Fel embers hovering above the giant shoulders!
        for(let i=0;i<4;i++){
          const side=i%2?1:-1;
          const chip=shape(g,gem,i<2?rockL:felBright,side*.95,3.05,0,i<2?.12:.08,i<2?.08:.12,i<2?.10:.08);
          anim.orbits.push({mesh:chip,cx:side*.82,cy:2.92+(i%2)*.18,cz:0,r:.42,speed:1.1*side,phase:i*1.6});
        }
        return;
      }

      // ============================================================
      // 19. PIT LORD — SENHOR DO ABISMO (WoW Mannoroth / Magtheridon Centaur Titan!)
      // ============================================================
      if(form==="pitlord"){
        const hip=1.12,sh=2.42;
        // Massive armored 4-legged reptilian demon lower body + thick spiked tail
        rig.body=part(g,p.fleshDark,[0,hip+.14,.04],[1.06,.74,1.56]);
        part(g,p.steel,[0,hip+.28,.04],[1.12,.34,1.42]);
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.42,-.48,hip,hip+.02,.32,p.fleshDark,p.horn,side>0?Math.PI:0);
          jointLeg(g,rig,side*.42,.54,hip,hip+.02,.32,p.fleshDark,p.horn,side<0?Math.PI:0);
        }
        const tail=pivot(g,0,hip+.10,.82);rig.tails.push(tail);
        beam(tail,p.fleshDark,[0,0,0],[0,-.08,.62],.24,.14);
        beam(tail,p.flesh,[0,-.08,.62],[0,.14,1.18],.14,.07);
        shape(tail,hornGeo,p.bone,0,.22,1.24,.14,.36,.14,.75,0,0);
        // Towering muscular upper demon torso rising at front (z = -0.36)
        part(g,p.flesh,[0,1.94,-.36],[1.14,1.06,.72]);
        part(g,p.steel,[0,1.98,-.70],[.78,.86,.14]);
        shape(g,gem,p.felCore,0,2.06,-.79,.22,.32,.09);
        addHalo(g,p.haloHex,[0,2.06,-.84],1.02,1.12,.48);
        // Ferocious horned Pit Lord head with giant upward tusks & snapping fanged jaw!
        const head=pivot(g,0,2.82,-.50);rig.head=head;
        part(head,p.flesh,[0,.04,0],[.66,.52,.60]);
        part(head,p.steel,[0,.22,.04],[.70,.22,.62]);
        eyes(head,p.light,.06,-.32,.17,.125,.062);
        fangedJaw(head,anim,p,[0,-.18,-.04],.56,.22,.48,8);
        for(const side of [-1,1]){
          curvedHorn(head,p.horn,p.light,[side*.26,.22,0],side,1.15,.95);
          shape(head,hornGeo,p.bone,side*.24,-.16,-.32,.09,.36,.09,-.42,0,-side*.30); // Massive upward tusks
        }
        // Wide tattered Bat-Demon Wings + colossal shoulders + Double-Ended Fel Glaive!
        demonWings(g,rig,p,sh-.14,.06,1.18,true);
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*.78,sh,-.36,p.flesh,p.steel,1.20,.34);
          part(arm,p.steel,[side*.12,.10,0],[.66,.46,.64],[0,0,-side*.18]);
          shape(arm,hornGeo,p.bone,side*.24,.48,0,.14,.46,.14,0,0,-side*.40);
        }
        const rHand=rig.arms[1].userData.lower;
        const glaive=pivot(rHand,0,-.62,-.08);
        glaive.rotation.x=-.22;
        beam(glaive,p.dark,[0,0,1.45],[0,0,-1.85],.10);
        for(const dir of [-1,1]){
          part(glaive,p.steel,[0,0,dir*1.48],[.12,.38,.96]);
          part(glaive,p.felCore,[0,.22,dir*1.52],[.08,.10,.88]);
        }
        addHalo(glaive,p.haloHex,[0,0,-1.55],.86,1.20,.44);
        return;
      }

      // ============================================================
      // 20. SHIVARRA — INQUISIDORA SHIVARRA (WoW 4-Armed Fel Demoness!)
      // ============================================================
      if(form==="shivarra"){
        const hip=1.14,sh=2.04;
        rig.body=part(g,p.flesh,[0,1.60,0],[.66,.90,.42]);
        part(g,p.steel,[0,1.62,-.21],[.50,.68,.08]);
        shape(g,gem,p.felCore,0,1.72,-.27,.12,.20,.05);
        addHalo(g,p.haloHex,[0,1.72,-.30],.54,.64,.38);
        const skirt=pivot(g,0,hip+.04,0);rig.factionHem=skirt;
        part(skirt,p.cloth,[0,-.46,-.20],[.38,.92,.06]);
        beam(skirt,p.light,[0,-.10,-.24],[0,-.82,-.24],.038);
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.20,0,hip,hip+.02,.20,p.fleshDark,p.horn,side>0?Math.PI:0);
          part(skirt,p.steel,[side*.27,-.28,0],[.20,.56,.42],[0,0,side*.14]);
        }
        // Fierce horned Shivarra head with curved crown horns & fanged grin
        const head=pivot(g,0,2.42,-.02);rig.head=head;
        part(head,p.flesh,[0,0,0],[.42,.40,.40]);
        part(head,p.steel,[0,.18,-.02],[.46,.16,.44]);
        shape(head,gem,p.light,0,.20,-.24,.07,.12,.04);
        eyes(head,p.light,.04,-.215,.10,.09,.046);
        fangedJaw(head,anim,p,[0,-.13,-.02],.32,.11,.30,6);
        for(const side of [-1,1])curvedHorn(head,p.horn,p.light,[side*.16,.18,0],side,.82,.95);
        // Helper to attach a glowing curved Fel scimitar to any lower arm node
        const attachScimitar=(node,s,pos)=>{
          const sc=pivot(node,...pos);
          sc.rotation.set(-.34,s*.12,s*.18);
          beam(sc,p.dark,[0,0,.18],[0,0,-.16],.05);
          beam(sc,p.steel,[0,0,-.16],[0,.08,-.72],.12,.08);
          beam(sc,p.steel,[0,.08,-.72],[0,.24,-1.24],.10,.03);
          beam(sc,p.felCore,[0,.02,-.24],[0,.22,-1.18],.045,.035);
          addHalo(sc,p.haloHex,[0,.14,-.78],.38,.86,.32);
        };
        // UPPER PAIR OF ARMS (standard animated arms)
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*.48,sh,0,p.flesh,p.steel,.86,.18);
          part(arm,p.steel,[side*.06,.06,0],[.32,.24,.34],[0,0,-side*.20]);
          attachScimitar(arm.userData.lower,side,[0,-.44,-.06]);
        }
        // LOWER SECOND PAIR OF ARMS (iconically animated independently via anim.tentacles!)
        for(const side of [-1,1]){
          const lowArm=pivot(g,side*.46,sh-.36,-.04);
          lowArm.rotation.set(-.28,0,-side*.42);
          beam(lowArm,p.flesh,[0,0,0],[side*.24,-.30,-.18],.11);
          beam(lowArm,p.steel,[side*.24,-.30,-.18],[side*.30,-.56,-.40],.095);
          attachScimitar(lowArm,side,[side*.30,-.56,-.42]);
          anim.tentacles.push({joint:lowArm,restX:-.28,restZ:-side*.42,phase:side*1.4,amp:.26});
        }
        return;
      }

      // ============================================================
      // 21. ARCHLICH — LICH DO TRONO GELADO (WoW Kel'Thuzad Floating Necromancer!)
      // ============================================================
      if(form==="lich"){
        const root=pivot(g,0,.32,0);
        anim.floaters.push({pivot:root,baseY:.32,amp:.16,speed:1.9});
        const hip=.98,sh=1.80;
        // Exposed skeletal torso encased in gothic saronite armor + hanging frost chains
        rig.body=part(root,p.steel,[0,1.42,0],[.68,.78,.42]);
        for(let i=0;i<3;i++)beam(root,p.bone,[-.24,1.22+i*.14,-.22],[.24,1.22+i*.14,-.22],.04);
        const soul=shape(root,gem,p.light,0,1.44,-.24,.13,.22,.08);
        anim.spinners.push({mesh:soul,axis:"y",speed:2.2});
        addHalo(root,p.haloHex,[0,1.44,-.28],.72,.86,.42);
        // Billowing dark necromantic shroud with frost rune borders & hanging iron chains
        const shroud=pivot(root,0,hip+.04,0);rig.factionHem=shroud;
        for(let i=0;i<5;i++){
          const a=(i-2)*.48;
          part(shroud,i%2?p.cloth:p.dark,[Math.sin(a)*.26,-.48,Math.cos(a)*.16-.04],[.24,.96,.10],[.08,a,Math.sin(a)*.10]);
        }
        beam(shroud,p.light,[0,-.08,-.26],[0,-.86,-.26],.045);
        // High iconic Horned Saronite Lich Collar behind the skull!
        for(let i=-2;i<=2;i++){
          shape(root,hornGeo,i%2?p.trim:p.steel,i*.20,sh+.30,.14,.14,.58,.10,.18,0,-i*.24);
        }
        // Horned Skeletal Lich Skull + Orbiting Frost Phylactery Crown!
        const head=pivot(root,0,2.14,-.02);rig.head=head;
        shape(head,sphere,p.bone,0,.04,0,.22,.23,.22);
        part(head,p.bone,[0,-.13,-.05],[.22,.11,.18]);
        for(const s of [-1,1]){
          part(head,eyeBlack,[s*.08,.04,-.19],[.08,.07,.03]);
          part(head,p.light,[s*.08,.04,-.21],[.055,.045,.02]);
          curvedHorn(head,p.trim,p.light,[s*.16,.16,0],s,.78,1.0);
        }
        const phyl=shape(head,gem,p.lightSoft,0,.52,0,.11,.18,.11);
        anim.orbits.push({mesh:phyl,cx:0,cy:.54,cz:0,r:.26,speed:2.2,phase:0});
        // Skeletal channeling arms with hovering cyan frost-fire orbs in both hands!
        for(const side of [-1,1]){
          const arm=jointArm(root,rig,side*.50,sh,0,p.cloth,p.bone,.88,.18);
          part(arm,p.steel,[side*.08,.08,0],[.38,.28,.40],[0,0,-side*.22]);
          shape(arm,hornGeo,p.trim,side*.18,.34,0,.09,.30,.09,0,0,-side*.42);
          const lower=arm.userData.lower;
          const orb=shape(lower,gem,p.light,0,-.44,-.14,.12,.12,.12);
          anim.orbits.push({mesh:orb,cx:0,cy:-.44,cz:-.14,r:.06,speed:3.8*side,phase:side});
          addHalo(lower,p.haloHex,[0,-.44,-.14],.46,.46,.48);
        }
        return;
      }

      // ============================================================
      // 22. DEATH KNIGHT — CAVALEIRO DA MORTE (WoW Scourge Saronite Champion!)
      // ============================================================
      if(form==="deathknight"){
        const hip=1.02,sh=1.82;
        rig.body=part(g,p.steel,[0,1.44,0],[.76,.88,.48]);
        part(g,p.dark,[0,1.44,-.24],[.56,.74,.10]);
        shape(g,gem,p.light,0,1.56,-.31,.12,.20,.05);
        addHalo(g,p.haloHex,[0,1.56,-.34],.54,.64,.36);
        part(g,p.dark,[0,hip+.04,0],[.82,.16,.52]);
        skullRelief(g,p,[0,hip+.04,-.28],.62);
        const skirt=pivot(g,0,hip+.04,0);rig.factionHem=skirt;
        part(skirt,p.cloth,[0,-.42,-.23],[.34,.84,.06]);
        beam(skirt,p.light,[0,-.10,-.27],[0,-.74,-.27],.04);
        const cape=pivot(g,0,sh+.06,.24);rig.cape=cape;
        part(cape,p.cloth,[0,-.74,.05],[.86,1.48,.06],[.08,0,0]);
        for(const side of [-1,1]){
          jointLeg(g,rig,side*.21,0,hip,hip+.02,.22,p.steel,p.dark,side>0?Math.PI:0);
          part(skirt,p.steel,[side*.29,-.26,0],[.22,.50,.44],[0,0,side*.12]);
        }
        // Horned Saronite Death Knight Helm with glowing frost eyes
        const head=pivot(g,0,2.16,-.02);rig.head=head;
        part(head,p.steel,[0,.02,.02],[.44,.44,.44]);
        part(head,eyeBlack,[0,-.02,-.21],[.34,.20,.06]);
        eyes(head,p.light,.02,-.25,.095,.09,.048);
        addHalo(head,p.haloHex,[0,.02,-.28],.48,.30,.40);
        for(const side of [-1,1])curvedHorn(head,p.trim,p.light,[side*.18,.16,0],side,.72,.90);
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*.54,sh,0,p.steel,p.dark,.88,.22);
          part(arm,p.steel,[side*.08,.07,0],[.46,.34,.46],[0,0,-side*.16]);
          skullRelief(arm,p,[side*.22,.06,-.18],.68,[0,-side*.45,0]);
          shape(arm,hornGeo,p.trim,side*.20,.36,0,.09,.30,.09,0,0,-side*.42);
        }
        // RIGHT HAND: Frost-Runed Death Knight Greatsword
        const rHand=rig.arms[1].userData.lower;
        const blade=pivot(rHand,0,-.46,-.06);
        blade.rotation.x=-.32;
        beam(blade,p.dark,[0,0,.28],[0,0,-.18],.065);
        part(blade,p.steel,[0,0,-.20],[.48,.12,.12]);
        for(const s of [-1,1])shape(blade,hornGeo,p.trim,s*.26,0,-.30,.06,.24,.06,-1.1,0,-s*.45);
        beam(blade,p.trim,[0,0,-.24],[0,0,-1.44],.18,.045);
        beam(blade,p.light,[0,0,-.30],[0,0,-1.36],.055,.055);
        addHalo(blade,p.haloHex,[0,0,-.88],.52,1.20,.38);
        // LEFT HAND: Necrotic Frost-Grip Rune Aura
        const lHand=rig.arms[0].userData.lower;
        const grip=shape(lHand,gem,p.light,0,-.44,-.14,.10,.10,.10);
        anim.orbits.push({mesh:grip,cx:0,cy:-.44,cz:-.14,r:.05,speed:4.2,phase:0});
        addHalo(lHand,p.haloHex,[0,-.44,-.14],.38,.38,.44);
        return;
      }

      // ============================================================
      // 23. FROST WYRM — SERPE GÉLIDA (WoW Sindragosa Skeletal Frost Dragon!)
      // ============================================================
      if(form==="wyrm"){
        const root=pivot(g,0,.55,0);
        anim.floaters.push({pivot:root,baseY:.55,amp:.20,speed:1.7});
        const y=1.08;
        // Articulated skeletal dragon spine + 6 curved rib hoops + blazing cyan soul-flame core!
        rig.body=beam(root,p.bone,[0,y,-.72],[0,y-.06,.86],.16,.11);
        for(let i=0;i<6;i++){
          const rz=-.56+i*.22,rw=.46-Math.abs(i-2)*.07,rh=.38-Math.abs(i-2)*.05;
          for(const s of [-1,1]){
            beam(root,p.bone,[0,y+.08,rz],[s*rw,y-.04,rz],.06);
            beam(root,p.bone,[s*rw,y-.04,rz],[s*rw*.45,y-rh,rz],.05);
          }
          shape(root,hornGeo,p.trim,0,y+.22,rz,.07,.24,.07,.35,0,0);
        }
        const heart=shape(root,gem,p.light,0,y-.12,-.16,.24,.26,.44);
        anim.spinners.push({mesh:heart,axis:"z",speed:1.6});
        addHalo(root,p.haloHex,[0,y-.12,-.16],1.25,1.15,.52);
        // Pelvis & tucked skeletal dragon talons
        part(root,p.bone,[0,y-.06,.76],[.54,.24,.34]);
        for(const side of [-1,1]){
          const claw=pivot(root,side*.30,y-.14,.62);
          beam(claw,p.bone,[0,0,0],[side*.06,-.38,-.10],.09);
          beam(claw,p.bone,[side*.06,-.38,-.10],[side*.04,-.64,.08],.075);
          for(let c=-1;c<=1;c++)shape(claw,hornGeo,p.trim,side*.04+c*.06,-.70,-.06,.04,.18,.04,1.15,0,0);
        }
        // Long curving skeletal neck + ferocious horned Frost Wyrm skull + snapping jaw!
        beam(root,p.bone,[0,y+.04,-.66],[0,y+.38,-1.18],.14,.11);
        beam(root,p.bone,[0,y+.38,-1.18],[0,y+.54,-1.64],.11,.095);
        const head=pivot(root,0,y+.56,-1.72);rig.head=head;
        part(head,p.bone,[0,.06,-.16],[.46,.32,.66]);
        part(head,p.bone,[0,.02,-.56],[.32,.22,.44]);
        for(const s of [-1,1]){
          part(head,eyeBlack,[s*.16,.10,-.32],[.11,.09,.12]);
          part(head,p.light,[s*.16,.10,-.36],[.08,.06,.09]);
          curvedHorn(head,p.trim,p.light,[s*.16,.18,.06],s,.95,1.35);
        }
        for(let i=0;i<6;i++){
          const t=i/5*2-1;
          shape(head,hornGeo,p.bone,t*.14,-.10,-.62+Math.abs(t)*.14,.04,.14,.04,Math.PI-.15,0,0);
        }
        fangedJaw(head,anim,p,[0,-.08,-.14],.34,.14,.60,6);
        addHalo(head,p.haloHex,[0,.04,-.52],.64,.42,.42);
        // Huge Tattered Skeletal Frost Wyrm Wings (continuous icy-spectral wing membranes!)
        for(const side of [-1,1]){
          const wing=pivot(root,side*.32,y+.16,-.32);
          wing.userData.side=side;
          anim.wings.push({pivot:wing,side,amp:.32,speed:2.0,base:.14});
          const p0=[0,0,0],shLow=[0,-.36,.38];
          const elb=[side*.86,.52,.10],wri=[side*1.76,1.02,.18];
          beam(wing,p.bone,p0,elb,.12);
          beam(wing,p.bone,elb,wri,.095);
          shape(wing,hornGeo,p.trim,wri[0],wri[1]+.16,wri[2]-.04,.09,.30,.09,-.4,0,-side*.35);
          const f0=[side*2.58,.72,.44],f1=[side*2.26,-.08,.56],f2=[side*1.58,-.56,.62],f3=[side*.88,-.64,.58];
          for(const [a,b] of [[wri,f0],[wri,f1],[wri,f2],[elb,f3]]){
            beam(wing,p.bone,a,b,.055);
            beam(wing,p.light,a,[(a[0]+b[0])*.56,(a[1]+b[1])*.56,a[2]-.02],.024);
          }
          const geo=wingMembraneGeo([[wri,f0,f1],[wri,f1,f2],[wri,f2,elb],[elb,f2,f3],[elb,f3,shLow],[elb,shLow,p0]]);
          const mem=new THREE.Mesh(geo,p.ghostVeil);
          mem.userData.ownGeometry=true;
          wing.add(mem);
        }
        // Articulated skeletal bone tail tipped with a frost-crystal spear
        const tail=pivot(root,0,y-.06,.88);rig.tails.push(tail);
        beam(tail,p.bone,[0,0,0],[0,-.08,.68],.12,.08);
        beam(tail,p.bone,[0,-.08,.68],[0,.10,1.38],.08,.045);
        shape(tail,gem,p.light,0,.14,1.52,.12,.14,.32);
        return;
      }

      // ============================================================
      // 24. DOOMGUARD & DOOMLORD — DEMONARCA DA LEGIÃO & LORDE DEMONARCA (WoW!)
      // ============================================================
      if(form==="doomguard"||form==="doomlord"){
        const lord=form==="doomlord";
        const hip=lord?1.34:1.24,sh=lord?2.52:2.34;
        const skin=lord?mat(0x4b1b3b,.66,.12,0x2c0926,.22):p.flesh;
        const skinDark=lord?mat(0x2d1028,.72,.12,0x1a0618,.18):p.fleshDark;
        const plate=lord?mat(0x1f192e,.30,.76,0x1d0e30,.20):p.steel;
        const trim=lord?mat(0x7c5ca8,.26,.72,0x3d1c66,.26):p.horn;
        // Towering muscular horned Demonarch torso with heavy blackened chains & glowing Fel chest core!
        rig.body=part(g,skin,[0,lord?1.94:1.78,0],[lord?1.08:.98,lord?1.18:1.08,lord?.68:.62]);
        part(g,plate,[0,lord?1.96:1.80,lord?-.33:-.30],[lord?.78:.70,lord?.96:.86,.14]);
        beam(g,trim,[-.46,sh-.10,-.37],[.46,hip+.24,-.37],.095,.055);
        beam(g,trim,[.46,sh-.10,-.37],[-.46,hip+.24,-.37],.095,.055);
        shape(g,gem,p.felCore,0,lord?2.08:1.90,lord?-.42:-.38,lord?.22:.18,lord?.34:.28,.09);
        addHalo(g,p.haloHex,[0,lord?2.08:1.90,lord?-.46:-.42],lord?1.05:.85,lord?1.15:.95,.48);
        // Spiked Legion war-belt + tattered war-banner tabard + armored hooved legs
        part(g,plate,[0,hip+.06,0],[lord?1.12:1.02,.22,lord?.72:.66]);
        shape(g,gem,p.light,0,hip+.06,lord?-.38:-.35,.14,.15,.07);
        const skirt=pivot(g,0,hip+.04,0);rig.factionHem=skirt;
        part(skirt,p.cloth,[0,-.52,lord?-.32:-.29],[.44,1.02,.08]);
        beam(skirt,p.light,[0,-.12,lord?-.37:-.34],[0,-.88,lord?-.37:-.34],.048);
        for(const side of [-1,1]){
          jointLeg(g,rig,side*(lord?.32:.29),0,hip,hip+.02,lord?.32:.29,skinDark,p.horn,side>0?Math.PI:0);
          const leg=rig.legs[rig.legs.length-1];
          part(leg,plate,[side*.04,-.42,-.06],[.38,.48,.40]);
          shape(leg,hornGeo,trim,0,-.46,-.26,.075,.20,.075,-.55,0,0); // Knee spikes
        }
        // Iconic ferocious horned Demonarch Head (massive sweeping ram/bull horns + fanged jaw!)
        const head=pivot(g,0,lord?2.94:2.74,-.06);rig.head=head;
        part(head,skin,[0,.04,0],[lord?.58:.52,lord?.50:.46,lord?.54:.50]);
        part(head,plate,[0,.20,.04],[lord?.62:.56,.22,lord?.56:.52]);
        shape(head,gem,p.light,0,.20,lord?-.30:-.27,.08,.12,.045);
        eyes(head,p.light,.05,lord?-.29:-.26,lord?.14:.125,lord?.115:.10,.058);
        addHalo(head,p.haloHex,[0,.05,lord?-.33:-.30],.62,.36,.44);
        fangedJaw(head,anim,p,[0,-.17,-.04],lord?.46:.42,.18,.42,8);
        for(const side of [-1,1]){
          curvedHorn(head,p.horn,p.light,[side*.22,.22,0],side,lord?1.26:1.12,1.05);
          if(lord)curvedHorn(head,trim,p.felCore,[side*.24,-.04,-.06],side,.68,.65); // Secondary lower Doomlord jaw horns!
          shape(head,hornGeo,p.bone,side*.14,-.18,-.24,.05,.18,.05,-.3,0,-side*.22);
        }
        // Wide Jagged Tattered Bat-Demon Wings with glowing Fel veins!
        demonWings(g,rig,p,sh-.14,.28,lord?1.36:1.22,true);
        // Massive Spiked Iron Pauldrons (+ blazing Fel braziers on Doomlord!) + Arms
        for(const side of [-1,1]){
          const arm=jointArm(g,rig,side*(lord?.78:.70),sh,0,skin,plate,lord?1.24:1.12,lord?.34:.30);
          part(arm,plate,[side*.10,.08,0],[lord?.66:.58,lord?.46:.40,lord?.64:.56],[0,0,-side*.18]);
          shape(arm,hornGeo,trim,side*.24,.46,0,.13,.44,.13,0,0,-side*.42);
          if(lord){
            shape(arm,gem,p.felCore,side*.08,.40,0,.17,.26,.17);
            addHalo(arm,p.haloHex,[side*.08,.44,0],.74,.74,.48);
          }else{
            shape(arm,gem,p.light,side*.14,.10,-.30,.08,.12,.04);
          }
        }
        const rHand=rig.arms[1].userData.lower;
        const lHand=rig.arms[0].userData.lower;
        if(lord){
          // LORDE DEMONARCA: Colossal Horned Doom Halberd-Glaive + Spinning Fel Doom-Portal in left hand!
          const glaive=pivot(rHand,0,-.64,-.08);
          glaive.rotation.x=-.24;
          beam(glaive,p.dark,[0,0,.95],[0,0,-2.05],.095);
          part(glaive,plate,[0,0,-1.48],[.12,.52,1.18]);
          part(glaive,p.felCore,[0,.28,-1.52],[.08,.12,1.10]);
          part(glaive,plate,[0,-.32,-1.18],[.10,.30,.52]);
          for(const s of [-1,1])shape(glaive,hornGeo,trim,s*.24,0,-.88,.08,.34,.08,-1.1,0,-s*.55);
          addHalo(glaive,p.haloHex,[0,.10,-1.54],.92,1.45,.46);
          // Spinning Fel Doom-Portal ring hovering in left hand
          const portal=pivot(lHand,0,-.56,-.24);
          const pRing=shape(portal,haloGeo,p.light,0,0,0,.32);
          const pCore=shape(portal,gem,p.felCore,0,0,0,.16,.16,.16);
          anim.spinners.push({mesh:pRing,axis:"z",speed:2.6},{mesh:pCore,axis:"y",speed:-3.0});
          addHalo(portal,p.haloHex,[0,0,0],.76,.76,.56);
          // 3 Orbiting Fel Runes around the Doomlord
          for(let i=0;i<3;i++){
            const rune=shape(g,gem,p.light,0,2.2,0,.11,.20,.08);
            anim.orbits.push({mesh:rune,cx:0,cy:2.1+i*.22,cz:0,r:1.42,speed:1.5,phase:i*Math.PI*2/3});
          }
        }else{
          // DEMONARCA DA LEGIÃO: Colossal Curved Jagged Burning Legion Doomblade!
          const blade=pivot(rHand,0,-.58,-.08);
          blade.rotation.x=-.30;
          beam(blade,p.dark,[0,0,.42],[0,0,-.24],.095);
          part(blade,plate,[0,0,-.26],[.66,.16,.18]);
          for(const s of [-1,1])shape(blade,hornGeo,p.horn,s*.36,0,-.38,.09,.36,.09,-1.15,0,-s*.48);
          shape(blade,gem,p.light,0,0,-.32,.14,.14,.12);
          beam(blade,plate,[0,0,-.32],[0,.14,-1.32],.28,.22);
          beam(blade,plate,[0,.14,-1.32],[0,.38,-2.08],.22,.06);
          beam(blade,p.felCore,[0,.04,-.40],[0,.34,-2.00],.095,.08);
          for(let n=0;n<3;n++)shape(blade,hornGeo,p.felCore,0,.18+n*.07,-.76-n*.38,.07,.24,.07,-.8,0,0);
          addHalo(blade,p.haloHex,[0,.18,-1.28],.82,1.72,.44);
          // Crackling Fel orb in left demon claw
          const orb=shape(lHand,gem,p.felCore,0,-.54,-.16,.13,.13,.13);
          anim.orbits.push({mesh:orb,cx:0,cy:-.54,cz:-.16,r:.06,speed:4.0,phase:.7});
          addHalo(lHand,p.haloHex,[0,-.54,-.16],.48,.48,.48);
        }
        return;
      }

      // ============================================================
      // 15. NAARU & NAARU WARDEN (WoW A'dal / X'era — Floating Crystalline Wind-Chime Being of Light!)
      // ============================================================
      if(form==="naaru"||form==="naaruWarden"){
        const elder=form==="naaruWarden",sc=elder?1.24:1.0;
        const root=pivot(g,0,1.72*sc,0);rig.body=root;
        anim.floaters.push({pivot:root,baseY:1.72*sc,amp:.16,speed:2.0});
        const azureGlow=glow(0x8ff8ff);
        const violetCrystal=mat(0x9b7cff,.22,.40,0x6e42e8,.55);
        // Radiant Heart Core + Counter-Rotating Sacred Rings
        const heart=shape(root,gem,p.lightPure,0,0,0,.30*sc,.46*sc,.26*sc);
        anim.spinners.push({mesh:heart,axis:"y",speed:2.6});
        const ring1=shape(root,haloGeo,p.goldBright,0,0,0,.64*sc,.64*sc,.55*sc,Math.PI*.12,0,0);
        anim.spinners.push({mesh:ring1,axis:"z",speed:1.1});
        if(elder){
          const ring2=shape(root,haloGeo,azureGlow,0,0,0,.92*sc,.92*sc,.52*sc,Math.PI*.35,.4,0);
          anim.spinners.push({mesh:ring2,axis:"y",speed:-1.4});
        }
        // Iconic WoW Naaru Symmetrical Floating Crystal Chime Vanes!
        const vanes=[
          // Upper grand sweeping horn-chimes
          [-.58,.78,0,.16,.72,.10,0,0,.42,p.goldBright],
          [.58,.78,0,.16,.72,.10,0,0,-.42,p.goldBright],
          [-.28,1.12,0,.12,.48,.09,0,0,.16,p.light],
          [.28,1.12,0,.12,.48,.09,0,0,-.16,p.light],
          // Broad lateral crystalline wing-bars
          [-1.08,.22,0,.18,.68,.10,0,0,1.18,p.gold],
          [1.08,.22,0,.18,.68,.10,0,0,-1.18,p.gold],
          [-.92,-.36,0,.14,.58,.09,0,0,.78,azureGlow],
          [.92,-.36,0,.14,.58,.09,0,0,-.78,azureGlow],
          // Sweeping lower chime tails
          [-.44,-.92,0,.13,.64,.09,0,0,-.26,p.goldBright],
          [.44,-.92,0,.13,.64,.09,0,0,.26,p.goldBright],
          [0,-1.28,0,.11,.46,.09,0,0,0,p.lightPure]
        ];
        if(elder){
          vanes.push(
            [-1.36,.68,-.08,.13,.56,.08,0,0,.92,violetCrystal],
            [1.36,.68,-.08,.13,.56,.08,0,0,-.92,violetCrystal],
            [0,1.46,0,.14,.52,.10,0,0,0,azureGlow]
          );
        }
        vanes.forEach(([x,y,z,sx,sy,sz,rx,ry,rz,m],idx)=>{
          const pane=shape(root,shardGeo,m,x*sc,y*sc,z*sc,sx*sc,sy*sc,sz*sc,rx,ry,rz);
          anim.chimes.push({mesh:pane,bx:x*sc,by:y*sc,bz:z*sc,phase:idx*.58});
        });
        for(let i=0;i<(elder?6:4);i++){
          const orb=shape(root,gem,i%2?azureGlow:p.lightPure,0,0,0,.09*sc,.14*sc,.09*sc);
          anim.orbits.push({mesh:orb,cx:0,cy:0,cz:0,r:(elder?1.45:1.15)*sc,speed:1.6*(i%2?1:-1),phase:i*Math.PI/(elder?3:2)});
        }
        addHalo(root,0xffe485,[0,0,0],2.6*sc,3.0*sc,.62);
        addHalo(root,0x8ef7ff,[0,0,-.06],1.8*sc,2.2*sc,.40);
        return;
      }

      // ============================================================
      // 16. VINDICATOR & CRUSADER (WoW Draenei Vindicator & Dawn Crusader)
      // ============================================================
      if(form==="vindicator"||form==="crusader"){
        const vind=form==="vindicator",hip=.96,sh=1.78;
        const crystalArmor=vind?mat(0x7c5bc4,.28,.55,0x5834b8,.28):p.marble;
        const trimMat=p.goldBright;
        rig.body=part(g,crystalArmor,[0,1.38,0],[.84,.86,.50]);
        part(g,trimMat,[0,1.42,-.26],[.38,.44,.08]);
        shape(g,gem,vind?glow(0xcf9eff):p.lightPure,0,1.42,-.31,.12,.18,.08);
        part(g,p.gold,[0,hip+.06,0],[.88,.18,.54]);
        // Flowing Light tabard & cape
        part(g,p.cloth,[0,.66,-.24],[.34,.66,.06]);
        const cape=part(g,vind?crystalArmor:p.cloth,[0,1.18,.30],[.76,1.24,.07],[.08,0,0]);
        rig.cape=cape;
        const head=pivot(g,0,2.04,0);rig.head=head;
        part(head,vind?mat(0x6d89c2,.55,.12):p.ivory,[0,.02,0],[.40,.42,.40]);
        part(head,trimMat,[0,.22,.02],[.44,.22,.46]);
        eyes(head,p.lightPure,.05,-.21,.10,.085,.05);
        if(vind){
          // Draenei forehead Light crest + twin cheek tendrils + crystal crown
          shape(head,gem,p.lightPure,0,.20,-.24,.09,.15,.06);
          for(const s of [-1,1]){
            beam(head,mat(0x5d78b0,.6,.1),[s*.14,-.10,-.16],[s*.16,-.32,-.18],.042);
            shape(head,hornGeo,trimMat,s*.24,.30,.04,.07,.24,.07,-.2,0,-s*.42);
          }
        }else{
          // Crusader winged sun-helm
          for(const s of [-1,1])part(head,p.goldBright,[s*.28,.22,.04],[.06,.34,.28],[0,0,-s*.45]);
          part(head,p.lightPure,[0,.38,-.02],[.08,.22,.34]);
        }
        for(const s of [-1,1]){
          jointLeg(g,rig,s*.24,0,hip,hip+.04,.25,crystalArmor,p.gold,s>0?Math.PI:0);
          const arm=jointArm(g,rig,s*.60,sh,0,crystalArmor,p.gold,.82,.25);
          part(arm,trimMat,[s*.10,.10,0],[.48,.34,.48],[0,0,-s*.18]);
          shape(arm,gem,vind?glow(0xcf9eff):p.lightPure,s*.16,.28,0,.11,.20,.11);
        }
        const rHand=rig.arms[1].userData.lower,lHand=rig.arms[0].userData.lower;
        if(vind){
          // Colossal Crystal Hammer of the Naaru
          const ham=pivot(rHand,0,-.44,-.08);ham.rotation.x=-.28;
          beam(ham,p.gold,[0,0,.38],[0,0,-1.45],.075);
          part(ham,trimMat,[0,0,-1.48],[.72,.44,.44]);
          shape(ham,gem,glow(0xd8a8ff),0,0,-1.48,.46,.32,.32);
          addHalo(ham,0xd69eff,[0,0,-1.48],1.05,1.05,.52);
        }else{
          // Blazing Sun Halberd + Tower Sun Shield
          const halb=pivot(rHand,0,-.44,-.08);halb.rotation.x=-.24;
          beam(halb,p.gold,[0,0,.55],[0,0,-1.72],.06);
          beam(halb,p.lightPure,[0,0,-1.68],[0,0,-2.15],.14,.02);
          part(halb,p.goldBright,[0,.22,-1.52],[.06,.44,.32]);
          addHalo(halb,p.haloHex,[0,.10,-1.78],.65,1.15,.44);
          part(lHand,p.gold,[-.18,-.28,-.12],[.10,.96,.62]);
          part(lHand,p.marble,[-.22,-.28,-.12],[.05,.82,.48]);
          shape(lHand,gem,p.lightPure,-.26,-.28,-.12,.06,.26,.16);
        }
        return;
      }

      // ============================================================
      // 17. ABYSSAL LORD (WoW Supremus — Towering Volcanic Cyan-Fel Titan!)
      // ============================================================
      if(form==="abyssalLord"){
        const abyssRock=mat(0x232730,.86,.16,0x0c2e2a,.22);
        const abyssRockHi=mat(0x323845,.82,.20,0x103832,.20);
        const abyssFlame=glow(0x4effc8);
        const felFire=p.felCore;
        // Massive Jagged Volcanic Crag Legs with Glowing Cyan-Fel Cracks (front, back & sides!)
        for(const s of [-1,1]){
          const leg=jointLeg(g,rig,s*.44,0,1.22,1.24,.42,abyssRock,abyssRock,s>0?Math.PI:0);
          shape(leg,gem,abyssRockHi,s*.04,-.82,0,.38,.56,.40,.08,0,-s*.08); // Heavy rocky greave boulder
          part(leg,abyssFlame,[0,-.48,-.22],[.11,.66,.06]);
          part(leg,abyssFlame,[0,-.52,.22],[.11,.60,.06]); // Glowing crack on back of leg too!
          part(leg,felFire,[s*.22,-.74,0],[.06,.44,.22]);
        }
        // Tapered Glowing Molten Waist + Sculpted Faceted Volcanic Torso (looks awesome from ALL angles!)
        part(g,abyssFlame,[0,1.34,0],[.54,.44,.44]); // Blazing cyan-fel molten core waist
        shape(g,gem,abyssRock,0,1.30,0,.44,.24,.40); // Dark rocky pelvis guard
        rig.body=shape(g,gem,abyssRock,0,1.94,0,.92,.78,.68); // Faceted volcanic chest boulder
        part(g,abyssRockHi,[0,2.14,0],[1.06,.46,.66]); // Broad rocky upper mantle
        // Glowing Cyan-Fel Furnace Core visible from FRONT & BACK!
        const core=shape(g,gem,abyssFlame,0,1.94,-.34,.30,.46,.24);
        anim.spinners.push({mesh:core,axis:"y",speed:3.2});
        addHalo(g,0x48ffc4,[0,1.94,-.42],1.48,1.48,.66);
        const backCore=shape(g,gem,abyssFlame,0,1.96,.34,.24,.42,.20);
        anim.spinners.push({mesh:backCore,axis:"y",speed:-2.6});
        addHalo(g,0x48ffc4,[0,1.96,.42],1.25,1.25,.52);
        // Sculpted jagged volcanic ribs (front) + jagged dorsal rock crags & magma veins (back)!
        for(const s of [-1,1]){
          for(let r=0;r<3;r++){
            part(g,abyssRockHi,[s*.44,1.62+r*.26,-.36],[.36,.13,.15],[0,0,-s*.20]);
            part(g,abyssFlame,[s*.24,1.68+r*.24,-.38],[.24,.065,.06],[0,0,-s*.28]);
            // Back volcanic ridge plates & glowing magma seams
            part(g,abyssRockHi,[s*.40,1.66+r*.25,.34],[.34,.14,.16],[0,0,s*.22]);
            part(g,abyssFlame,[s*.22,1.72+r*.23,.36],[.22,.065,.06],[0,0,s*.26]);
          }
          // Towering jagged obsidian back-spikes
          shape(g,hornGeo,abyssRockHi,s*.36,2.52,.28,.18,.62,.18,.34,0,-s*.26);
          shape(g,hornGeo,abyssFlame,s*.20,2.44,.34,.10,.42,.10,.42,0,-s*.18);
        }
        // Sunken Volcanic Skull Head inside a Jagged Obsidian Hood-Arch!
        const head=pivot(g,0,2.66,-.08);rig.head=head;
        shape(head,gem,abyssRockHi,0,.22,.16,.58,.62,.52); // Jagged rock hood arch behind skull
        part(head,abyssFlame,[0,.06,.02],[.44,.42,.42]); // Blazing furnace neck-glow behind skull
        part(head,abyssRock,[0,.02,-.06],[.42,.44,.44]); // Volcanic skull cranium
        eyes(head,abyssFlame,.06,-.30,.12,.11,.075);
        for(let i=0;i<5;i++){
          const a=(i-2)*.48;
          shape(head,hornGeo,i%2?abyssFlame:abyssRockHi,Math.sin(a)*.46,.42,.16+Math.cos(a)*.12,.13,.50,.13,-.30,0,-a*.62);
        }
        // Colossal Floating Jagged Obsidian Shoulder Monoliths + Crackling Energy Arms + Magma Fists
        for(const s of [-1,1]){
          const arm=jointArm(g,rig,s*.96,2.42,0,abyssFlame,abyssRock,1.18,.32);
          const boulder=shape(arm,gem,abyssRockHi,s*.24,.36,.04,.64,.76,.58,.15,0,-s*.26);
          anim.chimes.push({mesh:boulder,bx:s*.24,by:.36,bz:.04,phase:s*1.5});
          // Glowing cyan magma fissures wrapping shoulder monolith
          part(arm,abyssFlame,[s*.24,.34,-.28],[.14,.48,.07],[0,0,-s*.26]);
          part(arm,abyssFlame,[s*.24,.34,.32],[.14,.48,.07],[0,0,-s*.26]);
          shape(arm,hornGeo,abyssFlame,s*.36,.88,.04,.16,.58,.16,0,0,-s*.28);
          shape(arm,hornGeo,felFire,s*.10,.80,-.10,.12,.44,.12,.2,0,-s*.14);
          const fist=arm.userData.lower;
          shape(fist,gem,abyssRockHi,0,-.28,0,.38,.52,.38); // Craggy obsidian gauntlet boulder
          part(fist,abyssFlame,[0,-.46,-.12],[.34,.34,.34]);
          part(fist,abyssFlame,[0,-.32,.20],[.12,.38,.06]);
          addHalo(fist,0x48ffc4,[0,-.46,-.12],.95,.95,.52);
        }
        // 3 Orbiting Volcanic Magma Shards around the Abyssal Lord!
        for(let i=0;i<3;i++){
          const shd=shape(g,shardGeo,i%2?abyssRockHi:abyssFlame,0,2.15,0,.16,.34,.14);
          anim.orbits.push({mesh:shd,cx:0,cy:2.05+i*.25,cz:0,r:1.52,speed:1.25,phase:i*Math.PI*2/3});
        }
        return;
      }

      // ============================================================
      // 18. EREDAR LORD (WoW Man'ari Warlock — Crimson Horns & Orbiting Fel Runes)
      // ============================================================
      if(form==="eredar"){
        const hip=1.02,sh=1.96;
        const crimson=mat(0x961f2c,.62,.10,0x4d0a14,.24);
        const warGold=mat(0xc79238,.30,.72,0x593a0b,.16);
        rig.body=part(g,p.steel,[0,1.52,0],[.88,.94,.52]);
        part(g,warGold,[0,1.58,-.27],[.46,.42,.08]);
        shape(g,gem,p.felCore,0,1.58,-.33,.14,.20,.08);
        const robe=part(g,p.cloth,[0,.64,0],[.84,1.08,.56]);
        rig.factionHem=robe;
        const head=pivot(g,0,2.24,0);rig.head=head;
        part(head,crimson,[0,.04,0],[.42,.46,.42]);
        eyes(head,p.light,.08,-.22,.11,.095,.055);
        shape(head,gem,p.felCore,0,.19,-.22,.07,.10,.05);
        for(const s of [-1,1]){
          curvedHorn(head,p.horn,p.felCore,[s*.16,.24,.02],s,.78,1.15);
          beam(head,crimson,[s*.12,-.12,-.18],[s*.14,-.34,-.20],.042);
        }
        // Crown of 5 Spinning Fel Runes behind back!
        const runeRing=pivot(g,0,2.10,.42);
        for(let i=0;i<5;i++){
          const a=(i-2)*.62;
          const rune=shape(runeRing,gem,p.felCore,Math.sin(a)*1.08,Math.cos(a)*.85,0,.11,.22,.06,0,0,-a);
          anim.chimes.push({mesh:rune,bx:Math.sin(a)*1.08,by:Math.cos(a)*.85,bz:0,phase:i*.9});
        }
        addHalo(g,p.haloHex,[0,2.10,.42],2.2,1.8,.38);
        for(const s of [-1,1]){
          jointLeg(g,rig,s*.24,0,hip,hip+.02,.24,p.steel,p.dark,s>0?Math.PI:0);
          const arm=jointArm(g,rig,s*.64,sh,0,crimson,p.steel,.86,.24);
          part(arm,p.steel,[s*.10,.12,0],[.50,.36,.50],[0,0,-s*.22]);
          shape(arm,hornGeo,warGold,s*.24,.40,0,.10,.36,.10,0,0,-s*.42);
        }
        // Man'ari Fel Staff
        const rHand=rig.arms[1].userData.lower;
        const staff=pivot(rHand,0,-.46,-.08);staff.rotation.x=-.26;
        beam(staff,p.dark,[0,0,.55],[0,0,-1.75],.065);
        const orb=shape(staff,gem,p.felCore,0,0,-1.88,.22,.28,.22);
        anim.spinners.push({mesh:orb,axis:"y",speed:3.2});
        addHalo(staff,p.haloHex,[0,0,-1.88],.92,.92,.56);
        return;
      }

      // ============================================================
      // 19. FELGUARD & FEL INQUISITOR (Burning Legion)
      // ============================================================
      if(form==="felguard"){
        const hip=.96,sh=1.82;
        const skin=mat(0x8a282c,.68,.10,0x420b10,.18);
        rig.body=part(g,skin,[0,1.42,0],[.92,.88,.56]);
        part(g,p.steel,[0,1.46,-.26],[.74,.52,.12]);
        part(g,p.felCore,[0,1.46,-.33],[.32,.14,.05]);
        const head=pivot(g,0,2.10,0);rig.head=head;
        part(head,p.steel,[0,.04,0],[.46,.46,.46]);
        eyes(head,p.light,.06,-.24,.11,.10,.06);
        for(const s of [-1,1])curvedHorn(head,p.horn,p.felCore,[s*.20,.20,.02],s,.62,.85);
        for(const s of [-1,1]){
          jointLeg(g,rig,s*.26,0,hip,hip+.02,.27,p.steel,p.dark,s>0?Math.PI:0);
          const arm=jointArm(g,rig,s*.68,sh,0,skin,p.steel,.86,.28);
          part(arm,p.steel,[s*.12,.12,0],[.52,.40,.52],[0,0,-s*.24]);
          shape(arm,sphere,p.bone,s*.22,.18,-.22,.14,.16,.14); // Skull trophy on pauldron!
          shape(arm,hornGeo,p.horn,s*.22,.44,0,.09,.36,.09,0,0,-s*.35);
        }
        // Double-Bladed Fel Cleaver Axe
        const rHand=rig.arms[1].userData.lower;
        const axe=pivot(rHand,0,-.48,-.08);axe.rotation.x=-.30;
        beam(axe,p.dark,[0,0,.45],[0,0,-1.55],.07);
        for(const s of [-1,1]){
          part(axe,p.steel,[0,s*.28,-1.28],[.08,.52,.58]);
          part(axe,p.felCore,[0,s*.52,-1.28],[.05,.12,.62]);
        }
        addHalo(axe,p.haloHex,[0,0,-1.32],.95,1.25,.42);
        return;
      }
      if(form==="inquisitor"){
        const root=pivot(g,0,1.42,0);rig.body=root;
        anim.floaters.push({pivot:root,baseY:1.42,amp:.16,speed:2.2});
        // Tapered layered warlock torso + jagged Legion gothic collar + tattered floating tails
        part(root,p.cloth,[0,.06,0],[.58,.78,.42]);
        part(root,p.steel,[0,.38,0],[.82,.26,.54]);
        part(root,p.felCore,[0,.08,-.23],[.18,.48,.05]); // Front glowing Fel rune sash
        part(root,p.felCore,[0,.08,.23],[.16,.44,.05]);  // Back glowing Fel rune sash
        const hem=pivot(root,0,-.34,0);rig.factionHem=hem;
        for(let i=-2;i<=2;i++){
          part(hem,i%2?p.dark:p.cloth,[i*.14,-.34,0],[.18,.74-(Math.abs(i)*.09),.36],[.08,0,i*.09]);
        }
        // High horned gothic Legion collar behind head
        for(let i=-2;i<=2;i++){
          shape(root,hornGeo,i%2?p.steel:p.cloth,i*.18,.72,.22,.12,.48,.08,.26,0,-i*.22);
        }
        const head=pivot(root,0,.74,-.04);rig.head=head;
        shape(head,gem,p.cloth,0,.10,.04,.44,.48,.48);
        part(head,p.dark,[0,.02,-.20],[.34,.34,.14]);
        eyes(head,p.light,.06,-.28,.10,.10,.065);
        for(const s of [-1,1]){
          const arm=jointArm(root,rig,s*.52,.36,0,p.cloth,p.dark,.74,.19);
          part(arm,p.steel,[s*.10,.10,0],[.40,.26,.42],[0,0,-s*.22]);
          shape(arm,hornGeo,p.horn,s*.20,.34,0,.08,.28,.08,0,0,-s*.42);
        }
        // 3 Orbiting Demonic Fel Eyeballs!
        for(let i=0;i<3;i++){
          const eyeOrb=pivot(root,0,.45,0);
          shape(eyeOrb,sphere,p.flesh,0,0,0,.17,.17,.17);
          shape(eyeOrb,sphere,p.felCore,0,0,-.12,.11,.11,.09);
          shape(eyeOrb,sphere,eyeBlack,0,0,-.18,.04,.09,.04);
          addHalo(eyeOrb,p.haloHex,[0,0,-.14],.46,.46,.48);
          anim.orbits.push({mesh:eyeOrb,cx:0,cy:.42,cz:0,r:.96,speed:2.1,phase:i*Math.PI*2/3});
        }
        return;
      }

      // ============================================================
      // 20. NERUBIAN CRYPT LORD, NECROMANCER & GARGOYLE (Scourge Expansion)
      // ============================================================
      if(form==="nerubian"){
        const chitin=mat(0x243347,.38,.56,0x102840,.22);
        const scarabGold=mat(0xc9a14a,.30,.72,0x4f3a12,.16);
        // Massive 4-legged Armored Scarab Abdomen & Carapace
        rig.body=part(g,chitin,[0,1.18,.28],[1.24,.88,1.38]);
        for(const s of [-1,1]){
          part(g,scarabGold,[s*.44,1.62,.42],[.46,.22,1.10],[.18,0,-s*.24]); // Raised beetle wing-plates!
          for(const z of [-.34,.58]){
            const leg=jointLeg(g,rig,s*.68,z,.94,.96,.24,chitin,p.dark,(s>0)===(z>0)?0:Math.PI);
            shape(leg,hornGeo,p.lightSoft,s*.12,-.38,0,.07,.28,.07,0,0,-s*.45);
          }
        }
        // Upper Armored Thorax + Horned Mandible Head
        part(g,chitin,[0,1.76,-.34],[.98,.78,.72]);
        part(g,p.lightSoft,[0,1.76,-.72],[.38,.24,.08]);
        const head=pivot(g,0,2.24,-.52);rig.head=head;
        part(head,chitin,[0,.04,0],[.54,.44,.52]);
        shape(head,hornGeo,scarabGold,0,.38,-.16,.14,.56,.14,.42,0,0); // Massive Rhinoceros Beetle Horn!
        eyes(head,p.light,.06,-.27,.14,.10,.06);
        for(const s of [-1,1]){
          beam(head,p.bone,[s*.16,-.12,-.22],[s*.28,-.18,-.58],.075);
          const arm=jointArm(g,rig,s*.72,1.98,-.34,chitin,scarabGold,.94,.28);
          shape(arm.userData.lower,hornGeo,p.lightSoft,0,-.52,-.14,.14,.52,.14,-.35,0,0);
        }
        addHalo(g,p.haloHex,[0,1.82,-.76],1.1,1.1,.40);
        return;
      }
      if(form==="necromancer"){
        const hip=.92,sh=1.68;
        rig.body=part(g,p.cloth,[0,1.32,0],[.68,.84,.44]);
        const robe=part(g,p.cloth,[0,.56,0],[.74,.96,.50]);
        rig.factionHem=robe;
        part(g,p.bone,[0,1.44,-.23],[.44,.32,.07]); // Ribcage harness
        const head=pivot(g,0,1.94,0);rig.head=head;
        part(head,p.cloth,[0,.06,.04],[.46,.48,.48]);
        part(head,p.bone,[0,.02,-.18],[.34,.36,.18]);
        eyes(head,p.light,.06,-.28,.09,.085,.05);
        for(const s of [-1,1]){
          shape(head,hornGeo,p.bone,s*.20,.28,.02,.06,.26,.06,-.2,0,-s*.35);
          jointLeg(g,rig,s*.18,0,hip,hip+.02,.19,p.dark,p.dark,s>0?Math.PI:0);
          const arm=jointArm(g,rig,s*.48,sh,0,p.cloth,p.bone,.76,.19);
          part(arm,p.bone,[s*.08,.10,0],[.34,.22,.34],[0,0,-s*.2]);
        }
        // Necromancer Bone Scythe-Staff + Orbiting Spectral Skull!
        const rHand=rig.arms[1].userData.lower;
        const staff=pivot(rHand,0,-.42,-.06);staff.rotation.x=-.24;
        beam(staff,p.bone,[0,0,.42],[0,0,-1.52],.055);
        beam(staff,p.lightSoft,[0,0,-1.48],[0,.36,-1.76],.10,.03);
        const skull=shape(g,sphere,p.lightSoft,0,2.15,0,.15,.17,.16);
        anim.orbits.push({mesh:skull,cx:0,cy:2.12,cz:0,r:.78,speed:2.2,phase:.6});
        addHalo(staff,p.haloHex,[0,.15,-1.60],.62,.62,.42);
        return;
      }
      if(form==="gargoyle"){
        const stoneDark=mat(0x283242,.78,.28,0x0f253a,.20);
        const root=pivot(g,0,1.25,0);rig.body=root;
        anim.floaters.push({pivot:root,baseY:1.25,amp:.18,speed:2.8});
        part(root,stoneDark,[0,.14,0],[.68,.78,.48],[.18,0,0]);
        part(root,p.lightSoft,[0,.18,-.25],[.24,.18,.06]);
        const head=pivot(root,0,.64,-.18);rig.head=head;
        part(head,stoneDark,[0,.04,0],[.40,.38,.44]);
        eyes(head,p.light,.06,-.23,.10,.095,.055);
        for(const s of [-1,1]){
          shape(head,hornGeo,p.bone,s*.18,.26,.08,.07,.32,.07,-.45,0,-s*.38);
          const arm=jointArm(root,rig,s*.46,.42,-.04,stoneDark,p.dark,.72,.20);
          shape(arm.userData.lower,hornGeo,p.bone,0,-.42,-.08,.08,.26,.08,-.4,0,0);
          jointLeg(root,rig,s*.22,.08,-.28,.62,.20,stoneDark,p.dark,s>0?Math.PI:0);
        }
        // Large Sweeping Stone-Bat Wings!
        demonWings(root,rig,{...p,horn:stoneDark,wingMembrane:mat(0x1b2638,.72,.24,0x144163,.28,{side:THREE.DoubleSide}),felCore:p.lightSoft},.36,.24,1.08,true);
        return;
      }

      // ============================================================
      // 21. DRUID-SHAMAN CIRCLE (Archdruid, Elemental Shaman, Shapeshifter, Totemist)
      // ============================================================
      if(form==="archdruid"||form==="shaman"||form==="shapeshifter"||form==="totemist"){
        const arch=form==="archdruid",sham=form==="shaman",shapeF=form==="shapeshifter",totem=form==="totemist";
        const hip=.92,sh=1.74;
        const leafMat=mat(0x2f7d42,.74,.06,0x184d24,.20);
        const fireOrb=glow(0xff9438),waterOrb=glow(0x5ce6ff),earthOrb=glow(0xe0b254),windOrb=glow(0x9cfce8);
        rig.body=part(g,p.cloth,[0,1.34,0],[.74,.86,.46]);
        part(g,p.wood,[0,1.36,-.24],[.42,.40,.08]);
        shape(g,gem,p.light,0,1.40,-.30,.11,.17,.06);
        // Flowing mossy robe / beast-pelt kilt
        const hem=part(g,p.cloth,[0,.64,0],[.78,.72,.48]);
        rig.factionHem=hem;
        part(g,leafMat,[0,1.22,.28],[.78,1.16,.07],[.08,0,0]); // Leafy shamanic mantle
        const head=pivot(g,0,2.00,0);rig.head=head;
        part(head,p.flesh,[0,.02,0],[.40,.42,.40]);
        eyes(head,p.light,.06,-.21,.10,.085,.048);
        if(arch||shapeF){
          // Iconic Druid Antler Crown + Leaf Hood!
          part(head,leafMat,[0,.22,.02],[.46,.22,.46]);
          for(const s of [-1,1]){
            beam(head,p.bone,[s*.16,.26,0],[s*.36,.58,.04],.05);
            beam(head,p.bone,[s*.36,.58,.04],[s*.48,.82,-.04],.036);
            beam(head,p.bone,[s*.28,.48,.02],[s*.18,.72,-.08],.032);
            shape(head,gem,p.light,s*.48,.86,-.04,.065,.09,.065);
          }
        }else if(sham){
          // Wolf-pelt Shaman Cowl with glowing spirit eyes!
          part(head,p.dark,[0,.20,.04],[.50,.28,.50]);
          for(const s of [-1,1])shape(head,hornGeo,p.dark,s*.20,.42,.02,.10,.26,.10,-.1,0,-s*.2);
          part(head,waterOrb,[0,.28,-.22],[.18,.08,.05]);
        }else{
          // Carved Wooden Totem Mask & Feathered Crest
          part(head,p.wood,[0,.04,-.18],[.44,.46,.14]);
          for(let i=-2;i<=2;i++)shape(head,hornGeo,i%2?p.light:leafMat,i*.11,.42,.04,.07,.32,.06,0,0,-i*.18);
        }
        for(const s of [-1,1]){
          jointLeg(g,rig,s*.22,0,hip,hip+.02,.22,p.dark,p.wood,s>0?Math.PI:0);
          const arm=jointArm(g,rig,s*.54,sh,0,p.cloth,p.wood,.80,.22);
          part(arm,leafMat,[s*.08,.10,0],[.42,.28,.42],[0,0,-s*.20]);
          if(sham){
            // Dual glowing elemental fists (Fire right, Lightning/Water left)
            const fOrb=shape(arm.userData.lower,gem,s>0?fireOrb:waterOrb,0,-.46,-.08,.16,.20,.16);
            anim.spinners.push({mesh:fOrb,axis:"y",speed:3.2*s});
            addHalo(arm.userData.lower,s>0?0xff9438:0x5ce6ff,[0,-.46,-.08],.62,.62,.46);
          }else if(shapeF){
            // Wild spirit claws on both hands
            for(const c of [-.08,0,.08])shape(arm.userData.lower,hornGeo,p.light,c,-.52,-.12,.04,.22,.04,-.45,0,0);
          }
        }
        if(arch){
          // Archdruid World-Tree Staff + 4 Orbiting Elemental Spirits (Fire/Water/Earth/Wind)!
          const rHand=rig.arms[1].userData.lower;
          const staff=pivot(rHand,0,-.44,-.08);staff.rotation.x=-.22;
          beam(staff,p.wood,[0,0,.48],[0,0,-1.72],.065);
          shape(staff,gem,p.light,0,0,-1.84,.18,.28,.18);
          addHalo(staff,p.haloHex,[0,0,-1.84],.86,.86,.52);
          [fireOrb,waterOrb,earthOrb,windOrb].forEach((m,i)=>{
            const orb=shape(g,gem,m,0,2.25,0,.11,.15,.11);
            anim.orbits.push({mesh:orb,cx:0,cy:2.15+(i%2)*.24,cz:0,r:1.05,speed:1.7,phase:i*Math.PI/2});
          });
        }else if(totem){
          // Back-mounted Elemental Totem Pillar + Heavy Carved War-Totem!
          const pole=pivot(g,0,1.65,.36);
          beam(pole,p.wood,[0,-.55,0],[0,.95,0],.14);
          [fireOrb,waterOrb,earthOrb,windOrb].forEach((m,i)=>part(pole,m,[0,-.25+i*.34,.12],[.22,.14,.08]));
          const rHand=rig.arms[1].userData.lower;
          const club=pivot(rHand,0,-.46,-.08);club.rotation.x=-.30;
          beam(club,p.wood,[0,0,.35],[0,0,-1.55],.16);
          part(club,p.light,[0,.14,-1.28],[.34,.12,.14]);
        }else if(sham){
          // Floating Elemental Totem Crystals behind Shaman shoulders
          [fireOrb,waterOrb,windOrb].forEach((m,i)=>{
            const orb=shape(g,shardGeo,m,0,2.05,0,.10,.18,.10);
            anim.orbits.push({mesh:orb,cx:0,cy:2.05,cz:0,r:.86,speed:2.0,phase:i*Math.PI*2/3});
          });
        }
        return;
      }

      // ============================================================
      // 22. ALCHEMIST ORDER (Pyromancer & Brass-Glass Alchemical Construct)
      // ============================================================
      if(form==="alchemistGuard"){
        const hip=.90,sh=1.70;
        rig.body=part(g,p.cloth,[0,1.32,0],[.72,.84,.44]);
        part(g,p.brass,[0,1.36,-.23],[.58,.14,.08],[0,0,.35]); // Potion bandolier
        for(const x of [-.18,0,.18])shape(g,gem,p.light,x,1.36+x*.35,-.28,.06,.11,.06);
        const head=pivot(g,0,1.98,0);rig.head=head;
        part(head,p.cloth,[0,.04,.02],[.44,.44,.44]);
        part(head,p.brass,[0,-.02,-.21],[.36,.24,.10]); // Alchemical respirator visor
        eyes(head,p.light,.04,-.27,.10,.10,.06);
        for(const s of [-1,1]){
          jointLeg(g,rig,s*.21,0,hip,hip+.02,.21,p.dark,p.brass,s>0?Math.PI:0);
          const arm=jointArm(g,rig,s*.52,sh,0,p.cloth,p.brass,.78,.20);
          part(arm,p.brass,[s*.08,.08,0],[.34,.22,.36]);
        }
        // Glowing Catalytic Flask in right hand + glass retort tank on back
        part(g,p.glass,[0,1.42,.34],[.34,.52,.22]);
        part(g,p.light,[0,1.34,.34],[.24,.34,.14]);
        const rHand=rig.arms[1].userData.lower;
        shape(rHand,sphere,p.light,0,-.46,-.12,.14,.16,.14);
        addHalo(rHand,p.haloHex,[0,-.46,-.12],.52,.52,.44);
        return;
      }
      if(form==="alchemistGolem"){
        const hip=1.06,sh=1.96;
        rig.body=part(g,p.brass,[0,1.52,0],[1.02,.96,.66]);
        part(g,p.glass,[0,1.56,-.32],[.54,.54,.18]); // Bubbling glass chest chamber!
        const core=shape(g,gem,p.light,0,1.56,-.34,.20,.28,.16);
        anim.spinners.push({mesh:core,axis:"y",speed:2.8});
        addHalo(g,p.haloHex,[0,1.56,-.42],.95,.95,.54);
        const head=pivot(g,0,2.22,0);rig.head=head;
        part(head,p.brass,[0,.04,0],[.48,.42,.46]);
        part(head,p.light,[0,.06,-.24],[.36,.10,.05]);
        for(const s of [-1,1]){
          jointLeg(g,rig,s*.32,0,hip,hip+.02,.32,p.steel,p.brass,s>0?Math.PI:0);
          const arm=jointArm(g,rig,s*.72,sh,0,p.steel,p.brass,.98,.30);
          part(arm,p.brass,[s*.10,.12,0],[.46,.36,.48]);
          part(arm.userData.lower,p.light,[0,-.46,-.10],[.26,.22,.26]);
        }
        return;
      }

      // ============================================================
      // 23. VILLAGER LEAGUE (Militia Captain & Frontier Ranger)
      // ============================================================
      if(form==="villagerCaptain"||form==="villagerRanger"){
        const cap=form==="villagerCaptain",hip=.90,sh=1.70;
        rig.body=part(g,cap?p.steel:p.cloth,[0,1.32,0],[.76,.84,.46]);
        part(g,p.trim,[0,1.42,-.24],[.28,.34,.06]); // Village crest emblem
        part(g,cap?p.cloth:p.cloak,[0,1.22,.28],[.72,1.10,.06],[.08,0,0]);
        const head=pivot(g,0,1.98,0);rig.head=head;
        part(head,p.flesh,[0,.02,0],[.40,.42,.40]);
        part(head,cap?p.steel:p.cloak,[0,.20,.02],[.46,.22,.46]);
        eyes(head,p.light,.04,-.21,.09,.07,.045);
        for(const s of [-1,1]){
          jointLeg(g,rig,s*.21,0,hip,hip+.02,.22,cap?p.steel:p.dark,p.dark,s>0?Math.PI:0);
          const arm=jointArm(g,rig,s*.52,sh,0,cap?p.steel:p.cloth,p.dark,.78,.21);
          if(cap)part(arm,p.steel,[s*.08,.10,0],[.38,.26,.38]);
        }
        const rHand=rig.arms[1].userData.lower,lHand=rig.arms[0].userData.lower;
        if(cap){
          const halb=pivot(rHand,0,-.42,-.06);halb.rotation.x=-.24;
          beam(halb,p.dark,[0,0,.45],[0,0,-1.65],.055);
          part(halb,p.steel,[0,.18,-1.48],[.06,.42,.28]);
          part(lHand,p.steel,[-.16,-.28,-.10],[.09,.82,.54]);
          part(lHand,p.trim,[-.21,-.28,-.10],[.04,.34,.24]);
        }else{
          // Frontier Bow in left hand
          const bow=pivot(lHand,-.06,-.38,-.16);
          beam(bow,p.dark,[0,-.45,0],[0,.45,0],.045);
          beam(bow,p.trim,[0,-.45,.08],[0,.45,.08],.018);
        }
        return;
      }

      // ============================================================
      // 14. SENTINEL — SENTINELA ÁUREA (WoW Draenei Lightforged Vigilant Construct!)
      // ============================================================
      const hip=.92,sh=1.68;
      // Faceted marble & burnished-gold construct chassis with OPEN FLOATING LIGHT CRYSTAL CORE!
      rig.body=part(g,p.marble,[0,1.32,0],[.84,.82,.52]);
      part(g,p.dark,[0,1.34,-.22],[.44,.44,.14]); // Recessed crystal core chamber
      const chestCore=shape(g,gem,p.lightPure,0,1.34,-.27,.16,.24,.14);
      anim.spinners.push({mesh:chestCore,axis:"y",speed:2.2});
      addHalo(g,p.haloHex,[0,1.34,-.30],.66,.66,.46);
      part(g,p.gold,[0,hip+.04,0],[.88,.18,.56]);
      // Angular Faceted Golden-Crest Construct Head with Luminous Light-Visor Beam
      const head=pivot(g,0,1.98,0);rig.head=head;
      part(head,p.marble,[0,.02,0],[.42,.42,.44]);
      part(head,p.gold,[0,.22,.02],[.20,.26,.48]); // High central golden crest
      part(head,p.lightPure,[0,.02,-.235],[.34,.085,.04]); // Blazing Light-visor beam!
      addHalo(head,p.haloHex,[0,.02,-.27],.48,.24,.40);
      for(const side of [-1,1]){
        jointLeg(g,rig,side*.24,0,hip,hip+.02,.24,p.marble,p.gold,side>0?Math.PI:0);
        const arm=jointArm(g,rig,side*.58,sh,0,p.marble,p.gold,.80,.24);
        // Massive winged crystal-gold pauldrons with hovering shoulder crystal
        part(arm,p.gold,[side*.08,.08,0],[.46,.32,.46],[0,0,-side*.16]);
        const shd=shape(arm,gem,p.light,side*.16,.34,0,.09,.16,.09);
        anim.orbits.push({mesh:shd,cx:side*.16,cy:.34,cz:0,r:.04,speed:2.4*side,phase:side});
      }
      // RIGHT HAND: Radiant Golden Dawn Greatsword
      const rHand=rig.arms[1].userData.lower;
      const blade=pivot(rHand,0,-.42,-.06);
      blade.rotation.x=-.32;
      beam(blade,p.dark,[0,0,.22],[0,0,-.18],.065);
      part(blade,p.gold,[0,0,-.20],[.44,.12,.10]);
      beam(blade,p.goldBright,[0,0,-.24],[0,0,-1.32],.18,.045);
      beam(blade,p.lightPure,[0,0,-.30],[0,0,-1.24],.06,.06);
      addHalo(blade,p.haloHex,[0,0,-.82],.48,1.15,.36);
      // LEFT HAND: Ornate Golden-Marble Crystal Aegis Shield
      const lHand=rig.arms[0].userData.lower;
      part(lHand,p.gold,[-.16,-.28,-.10],[.09,.82,.56]);
      part(lHand,p.marble,[-.20,-.28,-.10],[.05,.68,.44]);
      shape(lHand,gem,p.lightPure,-.24,-.28,-.10,.05,.18,.12);
      addHalo(lHand,p.haloHex,[-.26,-.28,-.10],.46,.56,.34);
    }

    function pose(rig,phase,now,charge){
      const t=now*.001,a=rig.factionAnim;
      if(rig.factionHem)rig.factionHem.rotation.z=Math.sin(t*3+phase)*.048+charge*.08;
      if(!a)return;
      for(const f of a.floaters){
        f.pivot.position.y=f.baseY+Math.sin(t*f.speed+phase)*f.amp;
      }
      for(const s of a.spinners){
        s.mesh.rotation[s.axis]=t*s.speed*(1+charge*.9)+phase;
      }
      for(const w of a.wings){
        const beat=Math.sin(t*(w.speed+charge*2.2)+phase+(w.phase||0));
        w.pivot.rotation.z=w.side*(w.base+beat*w.amp);
        w.pivot.rotation.y=-w.side*(.16+beat*.12);
      }
      for(const j of a.jaws){
        const snap=.5+.5*Math.sin(t*(3.2+charge*5)+phase+j.phase);
        j.pivot.rotation.x=j.rest+snap*j.amp*(.45+charge*.85);
      }
      for(const seg of a.tentacles){
        seg.joint.rotation.x=seg.restX+Math.sin(t*(3.4+charge*3.5)+phase+seg.phase)*seg.amp;
        seg.joint.rotation.z=seg.restZ+Math.cos(t*2.6+seg.phase)*seg.amp*.65;
      }
      for(const ch of a.chimes){
        const breath=1+.08*Math.sin(t*2.4+phase+ch.phase)+charge*.14;
        ch.mesh.position.set(ch.bx*breath,ch.by*breath+Math.sin(t*3.1+ch.phase)*.04,ch.bz*breath);
      }
      for(const o of a.orbits){
        const ang=t*o.speed*(1+charge*.9)+phase+o.phase;
        o.mesh.position.set(o.cx+Math.cos(ang)*o.r,o.cy+Math.sin(ang*1.7)*.09,o.cz+Math.sin(ang)*o.r);
        o.mesh.rotation.y=ang*1.6;
      }
    }
    return {build,pose};
  }
};
