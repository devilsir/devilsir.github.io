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
    if(verticalTail)tail.rotation.x=beat*.28*effort*weak;
    else tail.rotation.y=beat*(kind==="undulate"?.55:kind==="glide"?.20:.37)*effort*weak;
    if(model.tailTip){
      const wave=Math.sin(phase-.97)*weak*effort;
      if(verticalTail)model.tailTip.rotation.x=wave*.19;
      else model.tailTip.rotation.y=wave*(kind==="undulate"?.46:.29);
    }
    for(const [i,wing] of wings.entries()){
      const side=wing.userData.side??(i%2===0?-1:1),swing=Math.sin(phase-i*.42);
      if(kind==="glide"){
        wing.rotation.z=side*beat*.36*weak;
        wing.rotation.x=side*swing*.11*weak;
      }else if(kind==="pulse"){
        wing.rotation.z=side*(swing*.21*weak+burst*.22);
        wing.rotation.x=swing*.15*weak;
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
        const open=.035+(Math.sin(phase*1.76)*.5+.5)*.087+bite*(model.biteAngle??.54);
        model.jaw.rotation.x=-open*weak-.21*death;
      }
    }
    const bell=group.userData.bell;
    if(bell)bell.scale.set(1.03-jet-burst*.13,.95+jet*.77+burst*.17,1.03-jet-burst*.13);
    if(kind==="glide"){
      tail.rotation.x=-.45*bite+.38*burst;
      tail.rotation.y+=burst*.81;
    }
  }
  return {fishProfile,stepStrike,pose};
})();
