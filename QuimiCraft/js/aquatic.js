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
  function stepStrike(actor,dt,start,attack=actor.profile.attack){
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
    if(model.stems)for(let i=0;i<model.stems.length;i++){
      const stem=model.stems[i],wave=Math.sin(phase*.26+i*.42);
      stem.rotation.x=wave*.12*weak;stem.rotation.z=Math.cos(phase*.23+i*.64)*.11*weak;
    }
    if(model.arms)for(let i=0;i<model.arms.length;i++){
      const wave=Math.sin(phase*(kind==="octopus"?.72:1.1)-i*.62)*effort*weak;
      const arm=model.arms[i];
      const {tip,long,restYaw,restPitch}=arm.userData;
      arm.rotation.x=(restPitch??0)+wave*.21-bite*.24;
      arm.rotation.y=(restYaw??0)+Math.sin(i*1.71)*(.15+wave*.17)*(1-burst*.72);
      if(tip){
        tip.rotation.x=Math.cos(phase*.92-i*.56)*.22*weak+burst*(long?-.23:-.59);
        tip.rotation.y=wave*.14+burst*(long?0:-Math.sign(restYaw)*.28);
      }
    }
    if(model.feet)for(let i=0;i<model.feet.length;i++){
      model.feet[i].rotation.x=Math.sin(phase*.8+i*Math.PI)*(model.ashore?.26:.10)*weak;
    }
    const jet=kind==="pulse"?Math.max(0,beat)**2*.32:0;
    if(model.tailSegments)model.tailSegments.forEach((joint,i)=>{
      joint.rotation.y=Math.sin(phase-i*.65)*(.095+i*.013)*effort*weak;
    });
    else if(kind==="plankton")tail.rotation.y=Math.sin(phase*.16)*.18;
    else if(kind==="seahorse")tail.rotation.y=beat*.16*effort*weak;
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
      }else if(kind==="penguin"){
        wing.rotation.z=side*(model.ashore?.34:swing*.59*effort*weak);
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
  function createSplashEffects(THREE,parent,quality,{preview=false}={}){
    const effects=[],pool=[],capacity=208,renderSize=new THREE.Vector2();
    let rippleGeometry;
    function makeEffect(){
      const group=new THREE.Group();
      const geometry=new THREE.BufferGeometry();
      const attribute=(size,itemSize)=>new THREE.BufferAttribute(new Float32Array(size),itemSize).setUsage(THREE.DynamicDrawUsage);
      const positions=attribute(capacity*3,3),sizes=attribute(capacity,1),fade=attribute(capacity,1),foam=attribute(capacity,1);
      geometry.setAttribute("position",positions);
      geometry.setAttribute("aSize",sizes);geometry.setAttribute("aFade",fade);geometry.setAttribute("aFoam",foam);
      const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uPixels:{value:400},uMinPoint:{value:preview?3:1}},
        vertexShader:`
          attribute float aSize;attribute float aFade;attribute float aFoam;uniform float uPixels,uMinPoint;
          varying float vFade;varying float vFoam;
          void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;
          float depth=projectionMatrix[3][3]==0.0?max(.20,-mv.z):1.0;
          gl_PointSize=clamp(aSize*uPixels*projectionMatrix[1][1]/depth,uMinPoint,46.0);vFade=aFade;vFoam=aFoam;}
        `,
        fragmentShader:`
          varying float vFade;varying float vFoam;
          void main(){vec2 p=gl_PointCoord-vec2(.5);float r=length(p*vec2(1.0,mix(1.32,1.0,vFoam)))*2.0;
          float soft=1.0-smoothstep(mix(.57,.33,vFoam),1.0,r);
          vec3 tint=mix(vec3(.54,.84,.96),vec3(.94,.995,1.0),max(vFoam,smoothstep(.25,.83,1.0-r)));
          gl_FragColor=vec4(tint,soft*vFade);}
        `});
      const drops=new THREE.Points(geometry,material);
      drops.frustumCulled=false;
      drops.renderOrder=6;
      drops.onBeforeRender=renderer=>{material.uniforms.uPixels.value=renderer.getDrawingBufferSize(renderSize).y*.5};
      group.add(drops);
      rippleGeometry??=new THREE.RingGeometry(.91,1,48).rotateX(-Math.PI/2);
      const ripples=Array.from({length:3},(_,i)=>{
        const ring=new THREE.Mesh(rippleGeometry,new THREE.MeshBasicMaterial({color:i?0xa6dfed:0xe9fcff,
          transparent:true,depthWrite:false,side:THREE.DoubleSide}));
        ring.position.y=.017+i*.009;
        ring.renderOrder=5;
        group.add(ring);
        return ring;
      });
      return {group,drops,positions,sizes,fade,foam,ripples,seeds:new Float32Array(capacity*4)};
    }
    function splash(point,size,contact,direction){
      const level=quality();
      if(!level)return;
      if(effects.length>=12)recycle(effects.shift());
      const landing=contact==="entry",effect=pool.pop()??makeEffect();
      const plume=landing?(level===1?70:126):(level===1?52:94),froth=landing?(level===1?37:73):(level===1?20:42);
      Object.assign(effect,{landing,plume,count:plume+froth,time:0,scale:clamp(size,.34,4.3),
        heading:direction?Math.atan2(direction.x,direction.z):0,
        directional:!!direction,life:landing?1.32:1.04});
      effect.group.name=landing?"Espuma do mergulho":"Respingos da saída";
      effect.group.position.copy(point);
      effect.drops.geometry.setDrawRange(0,effect.count);
      for(let i=0;i<effect.count;i++)for(let j=0;j<4;j++)effect.seeds[i*4+j]=Math.random();
      for(const ring of effect.ripples)ring.rotation.y=effect.heading;
      parent.add(effect.group);
      effects.push(effect);
      poseSplash(effect);
    }
    function poseSplash({positions,sizes,fade,foam,ripples,seeds,scale,landing,time,plume,count,heading,directional,life}){
      for(let i=0;i<count;i++){
        const a=seeds[i*4],speed=seeds[i*4+1],lift=seeds[i*4+2],grain=seeds[i*4+3];
        const resting=i>=plume;
        const start=time-(resting?.07:.015)*lift;
        const t=Math.max(0,start);
        const angle=heading+(a-.5)*Math.PI*2*(resting||landing||!directional?1:.65);
        const spread=resting?.46+speed*1.85:landing?1.55+speed*3.5:.36+speed*2.65;
        const fall=t*((landing?2.3:3.28)+lift*(landing?3.15:3.60))*Math.sqrt(scale)-t*t*(landing?6.25:6.6);
        const radius=scale*(.045+t*spread/(1+t*.49));
        const drift=directional?scale*t*(landing?.62:-.37):0;
        const y=resting?.026+lift*.035:Math.max(.023,fall);
        positions.setXYZ(i,Math.sin(angle)*radius+Math.sin(heading)*drift,y,Math.cos(angle)*radius+Math.cos(heading)*drift);
        const timed=1-clamp((time-(resting?.18:.11))/(life-(resting?.18:.11)));
        const waterContact=resting||fall>.02?1:.24;
        sizes.setX(i,scale*(resting?.11+grain*.23:.026+grain*.114)*(1+(resting?t*.72:0)));
        foam.setX(i,resting?1:grain*.35);
        fade.setX(i,start>0?timed*(resting?.64:.93)*waterContact:0);
      }
      positions.needsUpdate=sizes.needsUpdate=fade.needsUpdate=foam.needsUpdate=true;
      ripples.forEach((ring,i)=>{
        const delay=i*.13,age=clamp((time-delay)/life),radius=scale*(.17+Math.sqrt(age)*(landing?2.65:1.94)*(1-i*.16));
        ring.visible=time>=delay&&(landing||i<2);
        ring.scale.set(radius*(landing?1.11:.91),1,radius*(landing?1:.82));
        ring.material.opacity=(i?.43:.71)*(1-age)**1.60;
      });
    }
    function dispose(effect){
      effect.drops.geometry.dispose();
      effect.drops.material.dispose();
      for(const ring of effect.ripples)ring.material.dispose();
    }
    function recycle(effect){
      parent.remove(effect.group);
      if(pool.length<6)pool.push(effect);
      else dispose(effect);
    }
    function update(dt){
      for(let i=effects.length-1;i>=0;i--){
        const effect=effects[i];
        effect.time+=dt;
        if(effect.time>=effect.life){recycle(effect);effects.splice(i,1)}
        else poseSplash(effect);
      }
    }
    function clear(){
      for(const effect of effects){parent.remove(effect.group);dispose(effect)}
      for(const effect of pool)dispose(effect);
      effects.length=0;
      pool.length=0;
      rippleGeometry?.dispose();rippleGeometry=null;
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
    const [leanX,leanZ]=model.spoutLean??[0,0];
    model.spouts.forEach(([x,y,z],source)=>{
      for(let i=0;i<perSource;i++){
        const angle=i*2.399963,seed=(i*.61803398875)%1,delay=(i%42)*.012;
        const age=Math.max(0,time-delay),velocity=height*(5.7+seed*3.2);
        const heightAt=Math.max(0,velocity*age-height*5.6*age*age);
        const core=i<perSource*.70,spread=core?.075+seed*.19:.32+seed*.78;
        const radius=spread*age*(.55+age*1.9),branch=twin?Math.sign(x)*age*.43:0;
        positions.setXYZ(source*perSource+i,x+branch+Math.cos(angle)*radius+leanX*heightAt,y+heightAt,
          z+Math.sin(angle)*radius+leanZ*heightAt);
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
