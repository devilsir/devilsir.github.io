
"use strict";

globalThis.QuimiCraftMounts=(()=>{
  const treeBody={height:8.7,width:1.45,seat:5.75,groundSpeed:6.1,climbSpeed:3.7};
  const guard=(hp,walk,run,sense,damage,loot,color,secondary)=>({
    hp,walk,run,sense,temperament:"hostile",roam:12,loot,color,secondary,
    strike:{kind:"slam",damage,range:2.45,windup:.64,cooldown:2.12}
  });
  const trees={
    living_tree:{name:"Guardião de Casca",aspect:"oak",bark:0x574135,inner:0x967250,leaves:0x567341,lit:0xb8da78,line:"O bosque nos acolhe. Com um pouco de mel, posso te levar pelas encostas."},
    living_tree_warden:{name:"Vigia do Musgo",aspect:"moss",bark:0x414b3a,inner:0x827f56,leaves:0x3e7458,lit:0x94dfac,line:"Caminhe entre as raízes. Se ferirem uma árvore aqui, todas ouviremos."},
    living_tree_elder:{name:"Anciã da Copa",aspect:"elder",bark:0x504047,inner:0xa3755a,leaves:0x88664e,lit:0xffc87a,line:"Já ouvi as montanhas crescerem. Segure firme quando subirmos pela parede."}
  };
  const wardens={
    den_sentinel:{name:"Vigia do Covil",aspect:"basalt",...guard(42,1.23,3.48,10,9,[["crystal_shard",1,2]],0x534955,0xe78d68)},
    dune_sentinel:{name:"Sentinela das Dunas",aspect:"dune",...guard(49,1.34,3.64,11,11,[["gold_nugget",1,2]],0xb48a53,0xf0c67b)},
    lab_sentinel:{name:"Autômato de Contenção",aspect:"lab",...guard(59,1.22,3.8,12,12,[["copper_ingot",1,2]],0x42636b,0x83e4cb)}
  };
  const treeStrike={kind:"slam",damage:19,range:4.2,windup:.76,cooldown:2.65,vertical:4.5};
  function treeProfile(){return {hp:155,walk:1.71,run:4.05,sense:22,temperament:"neutral",roam:9,strike:treeStrike,loot:[]}}
  const meat=["raw_beef","raw_venison","raw_mutton","raw_pork","raw_chicken","raw_rabbit","raw_game"];
  function diet(type,isDragon){
    if(trees[type])return {food:["honey"],required:1};
    if(type==="nature_dragon")return {food:["honey","berries","apple"],required:3};
    return isDragon?{food:meat,required:3}:null;
  }
  function riderVector(yaw,forward,side){
    const length=Math.max(1,Math.hypot(forward,side)),sin=Math.sin(yaw),cos=Math.cos(yaw);
    return {x:(-sin*forward+cos*side)/length,z:(-cos*forward-sin*side)/length};
  }
  function motion(actor,dt,input,{clear,ground,ceiling,kind,speed}){
    const {x,z}=riderVector(input.yaw,input.throttle,input.side);
    const fromX=actor.x,fromZ=actor.z;
    const dx=x*speed*dt,dz=z*speed*dt;
    const dragon=kind==="dragon";
    actor.climbing=false;
    const support=ground(actor,actor.x,actor.z,actor.y+.13,actor.y-.5);
    actor.onGround=support!=null&&Math.abs(actor.y-support)<.13;
    if(dragon){
      const lift=Number(input.up)-Number(input.down);
      const glide=!lift&&actor.onGround?0:lift*(lift>0?5.55:5.1);
      let altitude=Math.min(ceiling,Math.max(1,actor.y+glide*dt));
      if(lift<0){
        const floor=ground(actor,actor.x,actor.z,actor.y+.10,altitude-.08);
        if(floor!=null&&floor>=altitude-.03)altitude=floor;
      }
      if(clear(actor,actor.x,altitude,actor.z))actor.y=altitude;
    }
    if(Math.abs(dx)+Math.abs(dz)>1e-5){
      const nx=actor.x+dx,nz=actor.z+dz;
      if(clear(actor,nx,actor.y,nz))Object.assign(actor,{x:nx,z:nz});
      else if(!dragon&&input.up&&clear(actor,actor.x,actor.y+treeBody.climbSpeed*dt,actor.z)){
        actor.y+=treeBody.climbSpeed*dt;actor.climbing=true;actor.vy=0;
        if(clear(actor,nx,actor.y,nz))Object.assign(actor,{x:nx,z:nz});
      }else if(!dragon&&actor.onGround&&clear(actor,nx,actor.y+1.025,nz)){
        const floor=ground(actor,nx,nz,actor.y+1.04,actor.y+.25);
        if(floor!=null&&clear(actor,nx,floor,nz))Object.assign(actor,{x:nx,y:floor,z:nz});
      }else{
        if(clear(actor,nx,actor.y,actor.z))actor.x=nx;
        if(clear(actor,actor.x,actor.y,nz))actor.z=nz;
      }
    }
    if(!dragon&&!actor.climbing){
      actor.vy=Math.max(-12,(actor.vy||0)-16*dt);
      const next=actor.y+actor.vy*dt;
      const floor=ground(actor,actor.x,actor.z,actor.y+.12,next-.08);
      if(floor!=null&&floor>=next-.03){actor.y=floor;actor.vy=0}
      else if(clear(actor,actor.x,next,actor.z))actor.y=next;
    }
    const floor=ground(actor,actor.x,actor.z,actor.y+.14,actor.y-.55);
    actor.onGround=floor!=null&&Math.abs(actor.y-floor)<.14;
    return {dx:actor.x-fromX,dz:actor.z-fromZ};
  }
  return {trees,wardens,treeBody,treeProfile,treeStrike,diet,motion};
})();

