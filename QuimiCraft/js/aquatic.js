"use strict";

globalThis.QuimiCraftAquatic=(()=>{
  const fishStats={
    raw_fish:[10,1.15],raw_carp:[14,.86],raw_perch:[11,1.32],raw_mullets:[10,1.48],
    raw_trout:[15,1.58],raw_catfish:[19,.91],raw_char:[14,1.44],raw_shrimp:[5,.74],
    raw_eel:[17,1.35],raw_pike:[23,1.76],raw_whitefish:[12,1.19],raw_bream:[16,.97],
    raw_loach:[8,1.04],raw_pacu:[20,1.10],raw_tilapia:[16,1.24],raw_seabass:[22,1.62],
    raw_sole:[13,.67],raw_sardine:[6,1.70],raw_emberfish:[9,1.26]
  };
  const clamp=(n,l=0,h=1)=>Math.min(h,Math.max(l,n));
  function fishProfile(id,name,style){
    const [hp,speed]=fishStats[id]??fishStats.raw_fish;
    return {name,hp,speed,extent:style==="long"?.38:style==="flat"?.28:.22,swim:style==="flat"?.87:.48,
      mode:style==="flat"?"bottom":"fish",damage:0,drop:id};
  }
  function stepStrike(actor,dt,start){
    const attack=actor.profile.attack;
    actor.cooldown=Math.max(0,actor.cooldown-dt);
    if(!attack)return null;
    if(actor.strike===null){
      if(!start||actor.cooldown>0)return null;
      actor.strike=0;
      actor.cooldown=attack.cooldown;
    }
    const previous=actor.strike,time=previous+dt,hit=attack.windup+attack.strike*.55;
    actor.strike=time;
    if(time<attack.windup)return {stage:"windup",open:time/attack.windup,burst:0,hit:false};
    const active=time<attack.windup+attack.strike;
    const progress=clamp((time-attack.windup)/attack.strike);
    if(active)return {stage:"strike",open:1-progress,burst:Math.sin(progress*Math.PI),hit:previous<hit&&time>=hit};
    const recovery=clamp((time-attack.windup-attack.strike)/attack.recover);
    if(recovery>=1)actor.strike=null;
    return {stage:"recover",open:0,burst:0,hit:previous<hit&&time>=hit};
  }
  function pose(model,phase,pace,strike=null,death=0){
    const {group,tail,wings,verticalTail}=model,kind=model.swimStyle;
    const weak=1-clamp(death)*.94,beat=Math.sin(phase),effort=clamp(pace,.24,1.8);
    const bite=strike?.open??0,burst=strike?.burst??0;
    const jet=kind==="pulse"?Math.max(0,beat)**2*.32:0;
    if(kind==="seahorse")tail.rotation.y=beat*.16*effort*weak;
    else if(kind==="turtle")tail.rotation.y=beat*.11*weak;
    else if(verticalTail)tail.rotation.x=beat*(kind==="whale"?.39:.28)*effort*weak;
    else tail.rotation.y=beat*(kind==="undulate"?.55:kind==="glide"?.20:.37)*effort*weak;
    if(model.tailTip){
      const wave=Math.sin(phase-.97)*weak*effort;
      if(verticalTail)model.tailTip.rotation.x=wave*.19;
      else model.tailTip.rotation.y=wave*(kind==="undulate"?.46:.29);
    }
    for(const [i,wing] of wings.entries()){
      const side=wing.userData.side??(i%2===0?-1:1),swing=Math.sin(phase-i*.42);
      if(kind==="seahorse"){
        wing.rotation.y=Math.sin(phase*4-i*.7)*.21*weak;
        wing.rotation.z=side*Math.sin(phase*4-i*.7)*.05*weak;
      }else if(kind==="turtle"){
        const rear=wing.userData.rear,stroke=Math.sin(phase*(rear?.64:.81));
        wing.rotation.z=side*stroke*(rear?.16:.42)*effort*weak;
        wing.rotation.y=side*Math.cos(phase*.81)*(rear?.10:.24)*weak;
      }else if(kind==="glide"){
        wing.rotation.z=side*beat*.36*weak;
        wing.rotation.x=side*swing*.11*weak;
      }else if(kind==="pulse"){
        wing.rotation.z=side*(swing*.21*weak+burst*.22);
        wing.rotation.x=swing*.15*weak;
      }else if(kind==="whale"){
        wing.rotation.z=side*(.12+swing*.16*effort*weak);
        wing.rotation.x=Math.cos(phase-i*.66)*.11*weak;
      }else{
        wing.rotation.z=side*swing*.16*effort*weak;
        wing.rotation.x=Math.cos(phase-i*.66)*.13*weak;
      }
    }
    if(model.jaw){
      if(kind==="pulse"){
        const open=1+jet+burst*.29;
        model.jaw.scale.set(open,1,open);
      }else{
        const open=(model.jawRest??.035)+(Math.sin(phase*1.76)*.5+.5)*(model.jawDrift??.087)+bite*(model.biteAngle??.54);
        model.jaw.rotation.x=-open*weak-.21*death;
      }
    }
    const bell=group.userData.bell;
    if(bell)bell.scale.set(1.03-jet-burst*.13,.95+jet*.77+burst*.17,1.03-jet-burst*.13);
    if(model.limbs){
      for(const [i,arm] of model.limbs.arms.entries()){
        const side=arm.userData.side,wave=Math.sin(phase+i*.68)*effort*weak;
        arm.rotation.x=-.30+wave*.36-burst*.30;
        arm.rotation.z=side*(.40+wave*.17);
        arm.userData.lower.rotation.x=-.22+wave*.27;
      }
      for(const [i,leg] of model.limbs.legs.entries()){
        const wave=Math.sin(phase+i*Math.PI)*effort*weak;
        leg.rotation.x=wave*.52;
        leg.userData.lower.rotation.x=Math.max(0,-wave)*.65;
      }
      for(const [i,hair] of (model.limbs.hair??[]).entries()){
        hair.rotation.x=Math.sin(phase*.59-i*.54)*.13*effort*weak;
        hair.rotation.y=Math.sin(phase*.64-i*.65)*.11*effort*weak;
      }
    }
    if(kind==="glide"){
      tail.rotation.x=-.45*bite+.38*burst;
      tail.rotation.y+=burst*.81;
    }
  }
  const breachStart=(bounds,surface)=>surface-bounds.max.y-.18;
  function breachPose(progress,bounds,surface,start=breachStart(bounds,surface),end=start){
    const t=clamp(progress);
    const arc=4*t*(1-t);
    const length=bounds.max.z-bounds.min.z;
    const apex=surface-bounds.min.y+.28+length*.17;
    const y=start+(end-start)*t+(apex-(start+end)*.5)*arc;
    const pitch=.72*(1-2*t)*Math.min(1,arc*5);
    const sine=Math.sin(pitch),cosine=Math.cos(pitch);
    const front=-bounds.min.z*sine,back=-bounds.max.z*sine;
    return {progress:t,y,pitch,front:-bounds.min.z*cosine,
      low:y+bounds.min.y*cosine+Math.min(front,back),
      high:y+bounds.max.y*cosine+Math.max(front,back)};
  }
  function breachContact(action,frame,surface){
    if(!action.contact&&frame.progress>0&&frame.progress<=.5&&frame.high>=surface){
      action.contact="exit";
      return "exit";
    }
    if(action.contact!=="entry"&&frame.progress>.5&&frame.low<=surface){
      action.contact="entry";
      return "entry";
    }
    return null;
  }
  function createSplashEffects(THREE,parent,quality){
    const effects=[];
    let rippleGeometry;
    function splash(point,scale,contact){
      const level=quality();
      if(!level)return;
      const landing=contact==="entry",count=(landing?72:44)/(level===1?2:1);
      const group=new THREE.Group();
      group.name=landing?"Espuma do mergulho":"Respingos da saída";
      group.position.copy(point);
      const geometry=new THREE.BufferGeometry();
      const positions=new THREE.Float32BufferAttribute(new Float32Array(count*3),3).setUsage(THREE.DynamicDrawUsage);
      geometry.setAttribute("position",positions);
      const material=new THREE.PointsMaterial({color:0xd7f5ff,size:Math.max(.075,scale*.105),transparent:true,depthWrite:false});
      const drops=new THREE.Points(geometry,material);
      drops.frustumCulled=false;
      drops.renderOrder=4;
      group.add(drops);
      rippleGeometry??=new THREE.RingGeometry(.86,1,40).rotateX(-Math.PI/2);
      const ripples=Array.from({length:landing?2:1},(_,i)=>{
        const ring=new THREE.Mesh(rippleGeometry,new THREE.MeshBasicMaterial({color:i?0x9edfea:0xe1faff,
          transparent:true,depthWrite:false,side:THREE.DoubleSide}));
        ring.position.y=.025;
        ring.renderOrder=4;
        group.add(ring);
        return ring;
      });
      const seeds=Array.from({length:count},()=>[Math.random()*Math.PI*2,Math.random(),Math.random()]);
      parent.add(group);
      effects.push({group,positions,drops,ripples,seeds,scale,landing,time:0});
      poseSplash(effects[effects.length-1]);
    }
    function poseSplash({positions,drops,ripples,seeds,scale,landing,time}){
      for(const [i,[angle,speed,lift]] of seeds.entries()){
        const radius=scale*(.04+(1.1+speed*(landing?4:2.7))*time);
        const y=time*((2.05+lift*1.75)*Math.sqrt(scale)-(landing?4.1:4.8)*time);
        positions.setXYZ(i,Math.cos(angle)*radius,Math.max(.025,y),Math.sin(angle)*radius);
      }
      positions.needsUpdate=true;
      drops.material.opacity=.91*(1-clamp((time-.13)/.75));
      ripples.forEach((ring,i)=>{
        const age=clamp((time-i*.10)/.84);
        ring.visible=time>=i*.10;
        ring.scale.setScalar(scale*(.19+Math.sqrt(age)*(i?1.44:2.1)));
        ring.material.opacity=(i?.44:.76)*(1-age)**1.5;
      });
    }
    function remove(effect){
      parent.remove(effect.group);
      effect.drops.geometry.dispose();
      effect.drops.material.dispose();
      for(const ring of effect.ripples)ring.material.dispose();
    }
    function update(dt){
      for(let i=effects.length-1;i>=0;i--){
        const effect=effects[i];
        effect.time+=dt;
        if(effect.time>=.96){remove(effect);effects.splice(i,1)}
        else poseSplash(effect);
      }
    }
    function clear(){
      for(const effect of effects)remove(effect);
      effects.length=0;
    }
    return {splash,update,clear};
  }
  function spray(THREE,model,time,ghost=false){
    if(!model.spouts?.length)return;
    const cycles=.98;
    if(time<0||time>=cycles){
      if(model.waterSpray)model.waterSpray.visible=false;
      return;
    }
    const perSource=340,count=model.spouts.length*perSource;
    if(!model.waterSpray){
      const geometry=new THREE.BufferGeometry(),positions=new THREE.Float32BufferAttribute(new Float32Array(count*3),3);
      geometry.setAttribute("position",positions.setUsage(THREE.DynamicDrawUsage));
      const material=new THREE.PointsMaterial({color:ghost?0x98fff2:0xe3faff,size:.105,transparent:true,depthWrite:false,opacity:.94});
      model.waterSpray=new THREE.Points(geometry,material);
      model.waterSpray.name="Esguicho de água e névoa";model.waterSpray.frustumCulled=false;
      model.waterSpray.userData.ownGeometry=model.waterSpray.userData.ownMaterial=true;
      model.group.add(model.waterSpray);
    }
    const points=model.waterSpray,positions=points.geometry.getAttribute("position");
    const height=model.breach??.78,twin=model.spouts.length===2;
    model.spouts.forEach(([x,y,z],source)=>{
      for(let i=0;i<perSource;i++){
        const angle=i*2.399963,seed=(i*.61803398875)%1,delay=(i%42)*.012;
        const age=Math.max(0,time-delay),velocity=height*(5.7+seed*3.2);
        const heightAt=Math.max(0,velocity*age-height*5.6*age*age);
        const core=i<perSource*.70,spread=core?.075+seed*.19:.32+seed*.78;
        const radius=spread*age*(.55+age*1.9),branch=twin?Math.sign(x)*age*.43:0;
        positions.setXYZ(source*perSource+i,x+branch+Math.cos(angle)*radius,y+heightAt,z+Math.sin(angle)*radius);
      }
    });
    positions.needsUpdate=true;
    points.material.opacity=.96*(1-Math.max(0,(time-.64)/(cycles-.64)));
    points.visible=true;
  }
  function releaseSpray(model){
    model?.waterSpray?.material.dispose();
  }
  return {fishProfile,stepStrike,pose,breachStart,breachPose,breachContact,createSplashEffects,spray,releaseSpray};
})();
