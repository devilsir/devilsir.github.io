"use strict";

globalThis.QuimiCraftCreaturePoses=(()=>{
  const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
  const mix=(a,b,t)=>a+(b-a)*t;
  function rotation(o,x,y,z,weight){
    if(!o)return;
    const r=o.rotation;
    r.x=mix(r.x,x,weight);r.y=mix(r.y,y,weight);r.z=mix(r.z,z,weight);
  }
  function dragon(rig,frame){
    const {now,phase=0,dt=1/30,gait=0,flight=false,stride=0,charge=0,release=0,motion=1,
      bank=0,climb=0,glide=0,landing=0,aimPitch=0,aimYaw=0,channel=0,burstCharge=0}=frame;
    const {flap=1,tailWave=1}=rig.form||{};
    const step=clamp(stride),lean=clamp(charge),strike=clamp(release),load=clamp(burstCharge);
    const inhale=Math.sin(load*Math.PI*.54),focus=load*load;
    const roar=Math.sin(Math.PI*clamp((load-.47)/.49));
    const air=mix(rig.flightBlend??Number(flight),Number(flight),1-Math.exp(-dt*5));
    rig.flightBlend=air;
    const t=now*.001,breath=Math.sin(t*2.8+phase);
    rig.wingPhase=(rig.wingPhase??phase)+dt*flap*(4.6+step*2.25+Math.max(0,climb)*1.6+landing*1.8);
    const beat=Math.sin(rig.wingPhase),stroke=mix(beat,.08,glide),sweep=Math.cos(rig.wingPhase);
    const flick=Math.sin(rig.wingPhase-.75),weight=1-Math.exp(-dt*14),brace=lean*.09+strike*.10+inhale*.052;
    rotation(rig.flightBody,air*(climb*.27+landing*.16+stroke*.042)-strike*.092+inhale*.104,
      0,air*bank*.36*motion,1-Math.exp(-dt*7));
    for(const wing of rig.wings){
      const side=wing.userData.side;
      wing.position.y=mix(wing.position.y,mix(side<0?1.409:1.49,1.101,air),weight);
      wing.position.x=mix(wing.position.x,wing.userData.rootX*mix(.65,1,air),weight);
      wing.scale.set(mix(wing.scale.x,mix(.69,1,air),weight),
        mix(wing.scale.y,mix(.095,1,air),weight),mix(wing.scale.z,mix(.31,1,air),weight));
      wing.userData.socket.scale.y=mix(.42,1.07,1-air)/wing.scale.y;
      const z=side*mix(-.005,.16+stroke*(.49+step*.15)*motion+landing*.26+side*bank*.13+inhale*.19,air);
      rotation(wing,mix(0,.08+sweep*.13*(1-glide)+landing*.29,air),
        side*mix(-1.58,.09+stroke*.15+landing*.23,air),z,weight);
      rotation(wing.userData.tip,mix(0,flick*.23*(1-glide)+landing*.14,air),
        side*mix(-.42,.075+stroke*.22+landing*.18,air),
        side*mix(.01,flick*.32*(1-glide)-glide*.14,air),weight);
      wing.userData.flex();
    }
    for(const [i,leg] of rig.legs.entries()){
      const diagonal=leg.userData.phase??((i===0||i===3)?Math.PI:0),cycle=gait+diagonal,wave=Math.sin(cycle);
      const front=leg.userData.front??i%2===0;
      const {lower,foot,bones:[upperLength,lowerLength]}=leg.userData;
      const swing=Math.max(0,Math.cos(cycle))*step*motion;
      const y=leg.position.y-.080-swing*.154-brace*(front?1:.44);
      const z=wave*step*(front?.332:.306)*motion+(lean-strike)*(front?.103:.044)+inhale*(front?-.088:.095);
      const bend=Math.acos(clamp((y*y+z*z-upperLength**2-lowerLength**2)/(2*upperLength*lowerLength),-1,1));
      const reach=Math.atan2(z,y)-Math.atan2(lowerLength*Math.sin(bend),upperLength+lowerLength*Math.cos(bend));
      const flightHip=front?-.91+flick*.13*motion:mix(-.73,-.94,glide)+flick*.052*(1-glide)*motion;
      const flightKnee=front?1.24:mix(.047,.019,glide);
      const airHip=mix(flightHip,front?-.22:.18,landing);
      rotation(leg,mix(reach,airHip,air),0,air*Math.sign(leg.position.x)*mix(front?-.15:-.072,.19,landing),weight);
      rotation(lower,mix(bend,mix(flightKnee,.30,landing),air),0,0,weight);
      const footPitch=mix(-swing*.38,front?-.55:flightHip+flightKnee+.09,air*(1-landing));
      rotation(foot,footPitch-leg.rotation.x-lower.rotation.x,0,0,weight);
      for(const digit of foot.userData.digits){
        rotation(digit,air*(1-landing)*(front?.49:.18)-swing*.20,digit.userData.spread*(1+landing*.37-air*.21),0,weight);
      }
      leg.userData.flexLeg();
    }
    const tailPhase=t*(1.8+step*.68)+phase;
    rotation(rig.tails[0],(breath*.043+air*stroke*.083+strike*.081)*motion+climb*.11,
      Math.sin(tailPhase)*(.089+step*.074)*tailWave*motion+bank*.24,0,weight);
    for(const [i,joint] of rig.tailJoints.entries()){
      rotation(joint,(Math.sin(tailPhase-i*.59)*(.053+i*.025)+air*flick*.046)*motion,
        Math.sin(tailPhase-i*.76)*(.10+i*.032)*tailWave*motion+bank*.21,0,weight*.79);
    }
    rotation(rig.neck,.16*lean-.25*strike+aimPitch*.29-air*climb*.11-.095*channel+inhale*.37-focus*.23+roar*.15,
      aimYaw*.26+bank*.11,0,weight);
    rotation(rig.head,(.16*lean-.18*strike+mix(breath*.043,stroke*.055,air))*motion+aimPitch*.62+inhale*.24-focus*.33+roar*.20,
      Math.sin(t*1.55+phase)*(.074-.044*lean)*motion+aimYaw*.72,-bank*.12,weight);
    rotation(rig.jaw,Math.min(-.83*channel,-.033-.55*lean-.52*strike-inhale*.38-focus*.16-roar*.43)+breath*(.016+channel*.018),0,0,1-Math.exp(-dt*24));
    rotation(rig.tongue,Math.min(.22,-rig.jaw.rotation.x*.19)+breath*.018,0,0,weight);
    for(const cheek of rig.mouthCorners??[])cheek.rotation.x=-rig.jaw.rotation.x*.62;
    if(rig.body){
      rig.body.position.y=.89+breath*.018*motion*(1+air*.35)+inhale*.019;
      rig.body.scale.set(1+inhale*.041,1+inhale*.036,1);
    }
    const intensity=Math.max(lean*lean*.78+strike*.95,channel*.96,focus*1.15);
    rig.breathGlow.visible=intensity>.01;
    rig.breathGlow.material.uniforms.strength.value=intensity*(.88+breath*.12);
    rig.breathGlow.scale.setScalar(.35+.25*lean+.53*strike+.39*channel+.49*focus);
    if(rig.throatGlow){
      rig.throatGlow.visible=load>.05||channel>0;
      rig.throatGlow.material.uniforms.strength.value=inhale*.43+channel*.33;
      rig.throatGlow.scale.setScalar(.34+inhale*.28);
    }
    for(const {stage,material} of rig.chargeScales||[]){
      const t=clamp((load-stage)/.092);
      const sweep=t*t*(3-2*t),pulse=.96+Math.sin(load*20-stage*6)*.04*motion;
      material.emissiveIntensity=Math.max(sweep*(1.42+focus*1.83)*pulse,(channel*.55+strike*.26)*(1+stage*.8));
    }
    if(rig.hornMaterial){
      const power=Math.max(clamp((load-.64)/.36)**2*.74,channel,strike*.71);
      const target=power*(1.17+Math.sin(t*18)*.13*motion);
      const material=rig.hornMaterial;
      material.emissiveIntensity=mix(material.emissiveIntensity,target,weight);
      for(const glow of rig.hornGlows){
        glow.visible=material.emissiveIntensity>.018;
        glow.material.uniforms.strength.value=material.emissiveIntensity*.30;
      }
    }
    const blinking=(t+phase*1.7)%4.6<.135;
    for(const lid of rig.eyes)lid.visible=blinking&&lean<.52&&load<.25;
    if(rig.halo){
      rig.halo.rotation.z=t*1.12;
      rig.halo.rotation.y=.17+beat*.10;
      rig.halo.scale.setScalar(.37+lean*.04);
    }
    for(const fin of rig.frills||[]){
      const side=fin.userData.side;
      rotation(fin,0,side*(.08+lean*.27+strike*.11+inhale*.39),side*(breath*.10*motion+inhale*.15),weight);
    }
  }
  const dragonClips=Object.freeze({
    idle:{label:"Repouso",duration:3.7},walk:{label:"Caminhada",duration:2.8},takeoff:{label:"Decolagem",duration:3.05},
    flight:{label:"Voo batido",duration:3.4},glide:{label:"Planar e virar",duration:4.1},landing:{label:"Pouso",duration:3.5},
    charge:{label:"Carga e rugido",duration:2.25},burst:{label:"Rajada completa",duration:5.3}
  });
  function dragonPreviewFrame(clip,elapsed,dt){
    const t=elapsed%(dragonClips[clip]?.duration??3.7);
    const frame={now:elapsed*1000,dt,phase:.28,gait:elapsed*8.4,motion:1,elevation:0};
    switch(clip){
      case "walk":return {...frame,stride:.68};
      case "takeoff":return {...frame,flight:t>.8,climb:clamp((t-.78)*1.78),elevation:clamp((t-.8)/1.42)*.82};
      case "flight":return {...frame,flight:true,stride:.44,climb:Math.sin(t*1.8)*.24,elevation:.64+Math.sin(t*2.1)*.16};
      case "glide":return {...frame,flight:true,glide:.91,bank:Math.sin(t*1.53)*.86,stride:.45,elevation:.7};
      case "landing":return {...frame,flight:t<2.1,glide:t<.62?.51:0,climb:-.43,
        landing:t<2.25?clamp((t-.52)/1.52):0,elevation:Math.max(0,.94-t*.44)};
      case "charge":
      case "burst":{
        const charge=globalThis.QuimiCraftDragons.burstRules.charge;
        const active=t-.36-charge,channel=clip==="burst"&&active>=0&&active<3?1:0;
        const load=clamp((t-.36)/charge);
        return {...frame,burstCharge:clip==="charge"&&active>0?clamp(1-active*2.2):load<1?load:0,
          channel,release:channel?clamp(1-active/.35):0,aimPitch:channel?-.12:0};
      }
      default:return frame;
    }
  }
  function tree(rig,frame){
    const {now,phase=0,dt=1/30,gait=0,stride=0,climbing=false,charge=0,release=0,motion=1}=frame;
    const t=now*.001,sway=Math.sin(t*1.46+phase),step=clamp(stride);
    const grab=clamp(charge),hit=clamp(release), weight=1-Math.exp(-dt*12);
    for(const [i,leg] of rig.legs.entries()){
      const phase=i%2*Math.PI,walk=Math.sin(gait+phase),up=Math.sin(t*5.65+phase);
      rotation(leg,(climbing?-.27+up*.47:walk*step*.42-grab*.13+hit*.18)*motion,0,0,weight);
      rotation(leg.userData.lower,climbing?.30+Math.max(0,-up)*.63:.052+Math.max(0,-walk)*step*.49,0,0,weight);
    }
    for(const [i,arm] of rig.arms.entries()){
      const side=arm.userData.side??(i===0?-1:1),walk=Math.sin(gait+i*Math.PI),reach=Math.sin(t*5.65+i*Math.PI);
      rotation(arm,climbing?1.29+reach*.41*motion:(-walk*step*.38+sway*.058+grab*1.95+hit*.65)*motion,
        side*(climbing?.17:.085-grab*.18),side*(climbing?.14:.13-grab*.18+hit*.14),weight);
      rotation(arm.userData.lower,climbing?.56+reach*.19*motion:.14+step*.10+grab*.45+hit*.20,0,0,weight);
    }
    rotation(rig.head,(climbing?-.27+Math.sin(t*5.65)*.026:-grab*.20+hit*.20+sway*.04)*motion,
      climbing?0:sway*.105*(1-grab)*motion,sway*.024*motion,weight);
    rotation(rig.crown,(climbing?.06+Math.sin(t*5.65)*.036:sway*.039+grab*.11-hit*.17)*motion,
      .039*Math.sin(t+phase)*motion,(climbing?.063*Math.cos(t*5.65):sway*(.041+step*.046))*motion,weight*.82);
    for(const [i,leaf] of (rig.vines||[]).entries())rotation(leaf,Math.sin(t*2.7+i)*(.068+step*.11)*motion,0,sway*.16*motion,weight);
  }
  function bite(rig,charge,release,dt){
    const opening=Math.max(.025+clamp(charge)*.57,clamp(release)*(1.02-clamp(release)*.84));
    rotation(rig.jaw,-opening,0,0,1-Math.exp(-dt*19));
  }
  function wave(rig,t,motion=1){
    const arm=rig.arms.find(o=>o.userData.side===1&&o.userData.lower)??rig.arms.find(o=>o.userData.lower);
    if(!arm)return;
    rig.wavingArm=arm;
    const side=arm.userData.side||1;
    const lift=Math.sin(Math.PI*clamp((t-.20)/2.30));
    arm.rotation.set(.57*lift,-side*.14*lift,side*1.10*lift);
    arm.userData.lower.rotation.set((1.88+.07*Math.cos(t*12)*motion)*lift,side*.14*lift,
      side*(.13+.24*Math.sin(t*13)*motion)*lift);
  }
  function resetWave(rig){
    const arm=rig.wavingArm;
    if(!arm)return;
    arm.rotation.y=arm.userData.lower.rotation.y=arm.userData.lower.rotation.z=0;
    rig.wavingArm=null;
  }
  function warden(rig,frame){
    tree(rig,frame);
    const {charge=0,release=0,dt=1/30,stride=0,gait=0}=frame;
    const weight=1-Math.exp(-dt*19),slam=clamp(release);
    rotation(rig.body,-charge*.13+slam*.35,0,Math.sin(gait)*stride*.045,weight);
    for(const arm of rig.arms){
      arm.rotation.x+=(charge*.35-slam*.28)*weight;
      arm.userData.lower.rotation.x+=charge*.22*weight;
    }
  }
  function previewStrike(t,windup=.56,impact=.32){
    return {charge:t<windup?clamp(t/windup):0,release:t>=windup?1-clamp((t-windup)/impact):0};
  }
  const clipDetails={
    idle:["Repouso",3.6],walk:["Caminhada",2.65],run:["Corrida",2.25],climb:["Escalada",3.1],slither:["Deslizar",3.1],tongue:["Provar o ar com a língua",2.05],
    bite:["Mordida",2.4],slam:["Golpe no chão",2.6],attack:["Ataque",2.45],shot:["Disparo",2.45],signal:["Aceno",3.1],
    gaze:["Olhar petrificante",3.4],reflection:["Reflexo no Escudo de Espelho",3.4],
    flap:["Bater asas",2.6],flight:["Voo batido",3.1],glide:["Planar e virar",3.65],land:["Pouso",2.8],
    float:["Flutuar",3.8],hop:["Salto",2.25],swim:["Nado",3.2],dart:["Nado rápido",2.9],pulse:["Pulsação",3.0],whirl:["Redemoinho",3.05],
    spout:["Esguicho",2.7],dive:["Mergulho",4.1],tentacles:["Defesa com os tentáculos",2.7],breach:["Salto fora d’água",3.4],
    drive:["Andar",3.3],turn:["Fazer curva",3.7],nitro:["Nitro",2.9],drill:["Perfurar",3.2],dig:["Escavar",3.6],
    takeoff:["Decolar",3.6],soar:["Planar",3.6],pedal:["Pedalar e girar hélice",3.4],marinePedal:["Acionar pedais",3.4],tractorWheels:["Girar rodas de trator",3.1],
    closed:["Fechada",1],open:["Aberta",1],opening:["Abrir",2.55],closing:["Fechar",2.55],
    sail:["Içar vela",4],cargo:["Abrir baú de bordo",1],
    flow:["Fluxo",6],glow:["Brilho",4.7],orbit:["Órbita",4.7],draw:["Puxar corda",2.55],
    bowShot:["Soltar flecha",2.35],reload:["Armar balestra",2.7],boltShot:["Disparar virote",2.35]
  };
  function clips(...ids){
    return Object.fromEntries(ids.map(id=>{
      const [label,duration]=clipDetails[id];
      return [id,{label,duration}];
    }));
  }
  function clipTime(id,elapsed){
    return elapsed%clipDetails[id][1];
  }
  function doorSwing(clip,time){
    if(clip==="closed"||clip==="open")return Number(clip==="open");
    const progress=clamp((time-.22)/.75),eased=progress*progress*(3-2*progress);
    return clip==="opening"?eased:1-eased;
  }
  return {dragon,tree,bite,wave,resetWave,warden,clips,clipTime,previewStrike,doorSwing,dragonClips,dragonPreviewFrame};
})();

