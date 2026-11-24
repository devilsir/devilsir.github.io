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
    const {now,phase=0,dt=1/30,gait=0,flight=false,stride=0,charge=0,release=0,motion=1}=frame;
    const q=rig.form||{},flap=q.flap??1,tailWeight=q.tailWave??1;
    const step=clamp(stride),lean=clamp(charge),strike=clamp(release);
    const t=now*.001,breath=Math.sin(t*2.8+phase),beat=Math.sin(t*(3.75+step*2.1)*flap+phase);
    const air=mix(rig.flightBlend??Number(flight),Number(flight),1-Math.exp(-dt*5));
    rig.flightBlend=air;
    const weight=1-Math.exp(-dt*13);
    for(const wing of rig.wings){
      const side=wing.userData.side;
      const z=side*mix(.35+breath*.025,.16+beat*(.35+step*.17),air);
      rotation(wing,mix(-.40,.12+Math.cos(t*4.1*flap+phase)*.123,air)*motion,
        side*mix(-1.04,.075+beat*.13,air),z*motion,weight);
      rotation(wing.userData.tip,mix(-.12,beat*.14,air),side*mix(-.78,.09+beat*.19,air),
        side*mix(.31,beat*.12,air),weight);
    }
    for(const [i,leg] of rig.legs.entries()){
      const diagonal=leg.userData.phase??((i===0||i===3)?Math.PI:0),wave=Math.sin(gait+diagonal);
      const front=leg.userData.front??i%2===0;
      const ground=wave*step*.57*(front?1:.85)-lean*(front?.23:.08)+strike*(front?.37:.14);
      const float=(front?-.32:.48)+Math.sin(t*3.8+phase+i)*.14;
      rotation(leg,mix(ground,float,air)*motion,0,0,weight);
      rotation(leg.userData.lower,mix(.04+Math.max(0,-wave)*step*.56,.38+Math.abs(beat)*.16,air)*motion,0,0,weight);
    }
    rotation(rig.tails[0],(breath*.054+air*beat*.105+strike*.053)*motion,
      Math.sin(t*(2.0+step*.74)+phase)*(.11+step*.15)*tailWeight*motion,0,weight);
    rotation(rig.head,(-.34*lean+.23*strike+mix(breath*.043,beat*.075,air))*motion,
      Math.sin(t*1.55+phase)*(.074-.044*lean)*motion,0,weight);
    rotation(rig.jaw,-.035-.58*lean-.40*strike,0,0,1-Math.exp(-dt*24));
    if(rig.body)rig.body.position.y=.89+breath*.018*motion*(1+air*.35);
    if(rig.halo){
      rig.halo.rotation.z=t*1.12;
      rig.halo.rotation.y=.17+beat*.10;
      rig.halo.scale.setScalar(.37+lean*.04);
    }
    for(const fin of rig.frills||[]){
      const side=fin.userData.side;
      rotation(fin,0,side*(.08+lean*.27+strike*.11),side*breath*.10*motion,weight);
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
      rotation(arm,(climbing?-1.50+reach*.69:-walk*step*.38+sway*.058-grab*1.69+hit*.64)*motion,
        side*(climbing?.24:.085+grab*.23),side*(climbing?.08:.13-grab*.23+hit*.14),weight);
      rotation(arm.userData.lower,climbing?-.40-reach*.32:-.14-step*.10-grab*.54-hit*.28,0,0,weight);
    }
    rotation(rig.head,(climbing?-.27+Math.sin(t*5.65)*.026:-grab*.20+hit*.20+sway*.04)*motion,
      climbing?0:sway*.105*(1-grab)*motion,sway*.024*motion,weight);
    rotation(rig.crown,(climbing?.06+Math.sin(t*5.65)*.036:sway*.039+grab*.11-hit*.17)*motion,
      .039*Math.sin(t+phase)*motion,(climbing?.063*Math.cos(t*5.65):sway*(.041+step*.046))*motion,weight*.82);
    for(const [i,leaf] of (rig.vines||[]).entries())rotation(leaf,Math.sin(t*2.7+i)*(.068+step*.11)*motion,0,sway*.16*motion,weight);
  }
  return {dragon,tree};
})();

