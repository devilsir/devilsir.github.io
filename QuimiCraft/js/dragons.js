"use strict";

globalThis.QuimiCraftDragons=(()=>{
  const breath=(element,params)=>({kind:"shot",dragon:true,element,...params});
  const species=Object.freeze({
    ice_dragon:{
      name:"Dragão Azul de Gelo",element:"Gelo",temperament:"neutral",scale:1.24,width:.93,height:2.58,hover:3.0,
      coat:0x427da6,back:0x223e74,belly:0x9bcdd6,wing:0x5b9fca,horn:0xc6ecfd,eye:0x9ff5ff,crest:"crystal",
      form:{length:1.13,girth:.88,neck:1.08,skull:[.89,1.03,1.13],span:1.12,chord:.88,lift:1.04,tail:1.15,flap:.94,tailWave:.95},
      silhouette:"Corpo esguio, asas pontiagudas, coroa de gelo e lâmina na cauda",
      regions:["taiga","tundra","fiordes glaciais","campina de aurora","prado alpino"],
      hp:93,walk:2.2,run:4.7,sense:17,loot:[["dragon_saliva_ice",1,2],["crystal_shard",2,4]],
      strike:breath("ice",{effect:"thermal",color:0x83d5ff,damage:13,range:10,windup:.89,cooldown:3.8,speed:13,slow:2.4})
    },
    fire_dragon:{
      name:"Dragão Vermelho de Fogo",element:"Fogo",temperament:"hostile",scale:1.48,width:1.08,height:2.88,hover:3.6,
      coat:0xa33232,back:0x612935,belly:0xe9aa68,wing:0xd16242,horn:0x432e36,eye:0xffce66,crest:"ember",
      form:{length:1.02,girth:1.13,neck:.92,skull:[1.14,1.11,1.01],span:1.05,chord:1.07,lift:1.34,tail:1.04,flap:1.22,tailWave:1.17},
      silhouette:"Peito largo, chifres curvos, vela serrilhada e cauda bifurcada",
      regions:["vulcânico","caldeira vítrea","badlands","savana","chapadas ocres"],
      hp:133,walk:2.73,run:5.75,sense:20,loot:[["dragon_saliva_fire",1,2],["SULFUR",2,4],["crystal_shard",1,2]],
      strike:breath("fire",{effect:"fire",color:0xff7e39,damage:22,range:12,windup:.92,cooldown:4.1,speed:15})
    },
    nature_dragon:{
      name:"Dragão Verde da Natureza",element:"Natureza",temperament:"calm",scale:1.16,width:.87,height:2.46,hover:2.95,
      coat:0x527949,back:0x28584b,belly:0xb4bb6e,wing:0x62966a,horn:0xaa8c5f,eye:0xb6ed82,crest:"leaf",
      form:{length:.97,girth:.92,neck:1.25,skull:[.88,.84,1.04],span:1.04,chord:1.24,lift:.72,tail:1.24,flap:.86,tailWave:1.42},
      silhouette:"Pescoço alongado, galhadas ramificadas e asas em forma de folhas",
      regions:["floresta","selva tropical","floresta de sequoias","manguezal","bosque de cerejeiras","bosque lilás","planície florida"],
      hp:77,walk:2.34,run:5.12,sense:15,loot:[["dragon_saliva_nature",1,2],["hide",1,3]],strike:null
    },
    time_dragon:{
      name:"Dragão Bronze do Tempo",element:"Tempo",temperament:"neutral",scale:1.29,width:.96,height:2.72,hover:3.62,
      coat:0x9a653a,back:0x5b4247,belly:0xddaa62,wing:0xb18751,horn:0xf5d39f,eye:0xffe3a5,crest:"hourglass",
      form:{length:1.08,girth:.96,neck:1.08,skull:[.91,1.17,.94],span:1.10,chord:.84,lift:1.17,tail:1.13,flap:.79,tailWave:.79},
      silhouette:"Máscara estriada, asas estreitas e anéis em torno da coroa e da cauda",
      regions:["deserto","salinas","chapadas ocres","cânion calcário","termas minerais","planície"],
      hp:108,walk:2.56,run:5.48,sense:20,loot:[["dragon_saliva_time",1,2],["bronze_ingot",1,3],["crystal_shard",1,2]],
      strike:breath("time",{effect:"electric",color:0xffcf7e,damage:12,range:12,windup:1.12,cooldown:4.8,speed:11,slow:3.5})
    },
    earth_dragon:{
      name:"Dragão Negro da Terra",element:"Terra",temperament:"hostile",scale:1.44,width:1.11,height:2.81,hover:2.88,
      coat:0x3d3a49,back:0x262732,belly:0x797264,wing:0x54475b,horn:0xb0987b,eye:0xe7b459,crest:"stone",
      form:{length:.99,girth:1.27,neck:.83,skull:[1.25,.97,.86],span:.89,chord:1.09,lift:.64,tail:.82,flap:.73,tailWave:.57},
      silhouette:"Focinho largo, carapaça de pedra, asas baixas e martelo na cauda",
      regions:["montanha","cânion calcário","vulcânico","bosque de cristais","badlands"],
      hp:152,walk:2.05,run:4.76,sense:18,loot:[["dragon_saliva_earth",1,2],["OBSIDIAN",1,4],["crystal_shard",1,2]],
      strike:breath("earth",{effect:"physical",color:0xbba07f,damage:19,range:9,windup:1.08,cooldown:4.45,speed:16})
    }
  });
  const flightStyles={
    crystal:{turn:2.25,lift:4.15,dive:3.6,cruise:1.42,glide:.78},
    ember:{turn:1.65,lift:5.15,dive:4.2,cruise:1.52,glide:.43},
    leaf:{turn:2.7,lift:3.45,dive:3.2,cruise:1.21,glide:.61},
    hourglass:{turn:2.05,lift:3.9,dive:3.7,cruise:1.36,glide:.87},
    stone:{turn:1.42,lift:3.6,dive:3.0,cruise:1.19,glide:.29}
  };
  const breathStyles={
    fire:{light:0xff632b,trim:0xffdc83,mist:0x9d2852,radius:.25,gravity:0,range:1.7},
    ice:{light:0x53bdff,trim:0xdaf6ff,mist:0x5168c6,radius:.18,gravity:0,range:1.8},
    time:{light:0xffa742,trim:0xffebad,mist:0x8061c5,radius:.26,gravity:0,range:1.65},
    earth:{light:0xf79b5a,trim:0xecbe83,mist:0x8b4a51,radius:.25,gravity:8.5,range:1.7},
    nature:{light:0x75c842,trim:0xe1fca4,mist:0x26877b,radius:.22,gravity:0,range:1.6}
  };
  const natureBreath=breath("nature",{effect:"biological",color:0x92d65b,damage:14,slow:1.15,speed:15,cooldown:2.7,range:11});
  const burstRules=Object.freeze({chance:.10,charge:1.15,duration:3,interval:.25});
  function rollBurst(strike,random=Math.random){
    return random()<burstRules.chance?{chargeLeft:burstRules.charge,remaining:burstRules.duration,sincePulse:0,
      damage:strike.damage,range:strike.range+.65}:null;
  }
  function advanceCharge(burst,dt){
    const spent=Math.min(dt,burst.chargeLeft);
    burst.chargeLeft-=spent;
    return dt-spent;
  }
  function advanceBurst(burst,dt,pulse){
    const elapsed=Math.min(dt,burst.remaining);
    burst.remaining=Math.max(0,burst.remaining-elapsed);
    burst.sincePulse+=elapsed;
    while(burst.sincePulse+1e-8>=burstRules.interval){
      burst.sincePulse-=burstRules.interval;
      pulse(burst.damage);
    }
    return burst.remaining>1e-8;
  }
  function burstProtection(shieldId,broken){
    return shieldId==="shield_dragon"&&!broken;
  }
  const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
  const approach=(a,b,rate,dt)=>a+(b-a)*(1-Math.exp(-rate*dt));
  const turn=(from,to)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
  const heading=(from,to)=>Math.atan2(to.x-from.x,to.z-from.z);
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const restModes=new Set(["idle","wander","return","patrol","guard","greet"]);
  function shotDirection(T,origin,target,strike){
    const delta=target.clone().sub(origin),gravity=breathStyles[strike.element].gravity;
    if(gravity){
      const horizontal=Math.hypot(delta.x,delta.z),speed2=strike.speed**2;
      if(horizontal>.01){
        const discriminant=speed2**2-gravity*(gravity*horizontal**2+2*delta.y*speed2);
        if(discriminant>=0)delta.y=(gravity*horizontal**2+2*delta.y*speed2)/(speed2+Math.sqrt(discriminant));
      }
    }
    return delta.normalize();
  }
  function fly(e,d,behavior,dt,{ground,clear,wingClear,ceiling}){
    const style=flightStyles[d.crest];
    const f=e.dragonFlight??={clock:e.phase*2.3,vx:0,vy:0,vz:0,heading:e.angle,plan:0,bank:0,glide:0,landing:0};
    f.clock+=dt;
    const calm=restModes.has(behavior.mode);
    const rest=behavior.rest||calm&&f.clock%33<9.4;
    const aim=behavior.aim;
    const bracing=behavior.mode==="windup"||behavior.mode==="strike"||behavior.mode==="breath"||behavior.mode==="breathCharge";
    let goal=behavior.goal,pace=behavior.speed;
    const home=e.ai.home,side=Math.sin(e.phase)>=0?1:-1;
    if(aim&&behavior.mode==="recover"&&!e.onGround){
      const angle=heading(aim,e)+side*1.38;
      goal={x:e.x+Math.sin(angle)*6,y:aim.y,z:e.z+Math.cos(angle)*6};
      pace=d.walk*1.36;
    }
    if(!rest&&!goal&&!aim){
      const orbit=f.clock*.26*side+e.phase,radius=Math.min(e.profile.roam*.43,10);
      goal={x:home.x+Math.sin(orbit)*radius,y:home.y,z:home.z+Math.cos(orbit)*radius};
      pace=d.walk*1.33;
    }
    const fromX=e.x,fromY=e.y,fromZ=e.z;
    const floor=ground(e,e.x,e.z,e.y+.24,e.y-10);
    if(rest&&!e.onGround){
      if(!f.perch||f.perchTimer<=0){
        f.perchTimer=.65;
        f.perch=null;
        const a=goal?heading(e,goal):f.heading;
        for(const [offset,reach] of [[0,0],[0,3],[side*.93,3],[-side*.93,3],[side*1.80,4],[-side*1.80,4]]){
          const x=e.x+Math.sin(a+offset)*reach,z=e.z+Math.cos(a+offset)*reach;
          const y=ground(e,x,z,e.y+.20,e.y-8);
          if(y==null||!clear(e,x,e.y,z))continue;
          f.perch={x,y,z};break;
        }
      }
      f.perchTimer-=dt;
      goal=f.perch;pace=goal?d.walk:0;
    }else{f.perch=null;f.perchTimer=0}
    let travel=goal?distance(e,goal):0;
    const desired=travel>.12?heading(e,goal):f.heading;
    const grounded=rest&&e.onGround&&floor!=null;
    let targetY=grounded?floor:floor==null?e.y:floor+d.hover;
    if(!grounded&&!rest){
      if(calm)targetY+=.65+Math.sin(f.clock*.48)*.55;
      if(goal&&!calm)targetY=Math.max(targetY,Math.min(e.y+5.5,goal.y+(behavior.mode==="flee"?d.hover+1.0:d.hover*.8)));
      if(bracing&&aim&&floor!==null)targetY=Math.max(floor+.87,Math.min(targetY,aim.y+d.hover));
      if(floor===null&&goal&&goal.y<e.y-2)targetY=e.y-.85;
    }
    if(rest&&!grounded&&f.perch){
      targetY=travel<.8?f.perch.y:Math.max(e.y,f.perch.y+.88);
      if(travel<.55)travel=0;
    }
    let course=desired,holdForClimb=false;
    if(travel>.12&&!grounded&&!rest){
      f.plan-=dt;
      if(f.waypoint&&(distance(e,f.waypoint)<.70||(f.waypoint.left-=dt)<=0))f.waypoint=null;
      if(!f.waypoint&&f.plan<=0){
        f.plan=.24;
        const look=Math.min(travel+.40,clamp(pace*1.12,3.4,6.8));
        const preferred=Math.sign(turn(f.heading,desired))||side;
        const offsets=[0,preferred*.52,-preferred*.52,preferred*1.09,-preferred*1.09,preferred*1.61,-preferred*1.61];
        f.blocked=true;
        search: for(const lift of [0,2.4,4.5]){
          const y=Math.min(ceiling,Math.max(e.y,targetY)+lift);
          let open=true;
          for(let h=e.y+.78;h<y&&open;h+=.78)open=clear(e,e.x,h,e.z);
          if(!open||!clear(e,e.x,y,e.z))continue;
          for(const off of offsets){
            const a=desired+off,dx=Math.sin(a),dz=Math.cos(a);
            const x=e.x+dx*look,z=e.z+dz*look;
            const steps=Math.ceil(look/.78);
            let pass=true;
            for(let i=1;i<=steps&&pass;i++){
              const h=look*i/steps;
              pass=clear(e,e.x+dx*h,y,e.z+dz*h);
            }
            if(!pass||!wingClear(e,x,y,z,a))continue;
            f.blocked=false;
            if(off||lift||y-e.y>1.05)f.waypoint={x,y,z,left:4.2};
            break search;
          }
        }
      }
      if(f.waypoint){
        course=heading(e,f.waypoint);
        targetY=Math.max(targetY,f.waypoint.y);
        travel=distance(e,f.waypoint);
        holdForClimb=e.y<f.waypoint.y-.38&&f.waypoint.y>targetY-.15;
      }else if(f.blocked)targetY=Math.max(targetY,e.y+1.25);
    }else{
      f.plan=0;f.waypoint=null;f.blocked=false;
    }
    targetY=clamp(targetY,1,ceiling);
    const toCourse=turn(f.heading,course);
    f.heading+=clamp(toCourse,-style.turn*dt,style.turn*dt);
    const face=aim?heading(e,aim):f.heading;
    const yaw=turn(e.angle,face);
    e.angle+=clamp(yaw,-style.turn*(aim?2.4:1.45)*dt,style.turn*(aim?2.4:1.45)*dt);
    const goalSpeed=travel>.12&&!bracing&&!f.blocked&&!holdForClimb?
      Math.min(pace*(grounded?1:style.cruise),travel*(rest?1.15:1.55))*clamp(Math.cos(toCourse),.12,1):0;
    const slow=e.frostTime>0?.52:1;
    f.vx=approach(f.vx,Math.sin(f.heading)*goalSpeed*slow,goalSpeed?3.4:5.9,dt);
    f.vz=approach(f.vz,Math.cos(f.heading)*goalSpeed*slow,goalSpeed?3.4:5.9,dt);
    const fall=rest?Math.min(3.15,style.dive):style.dive;
    f.vy=approach(f.vy,clamp((targetY-e.y)*2.25,-fall,style.lift),5.3,dt);
    let nextY=clamp(e.y+f.vy*dt,1,ceiling);
    if(rest&&floor!==null&&targetY===floor&&nextY<=floor+.075){nextY=floor;f.vy=0}
    if(clear(e,e.x,nextY,e.z))e.y=nextY;
    else {f.vy=0;f.plan=0}
    const nx=e.x+(f.vx+(e.vx||0))*dt,nz=e.z+(f.vz+(e.vz||0))*dt;
    if(clear(e,nx,e.y,nz)&&(!grounded||ground(e,nx,nz,e.y+.1,e.y-.13)!=null)){
      e.x=nx;e.z=nz;
    }else{f.vx*=.47;f.vz*=.47;f.plan=0;f.waypoint=null}
    e.vx*=Math.pow(.045,dt);e.vz*=Math.pow(.045,dt);
    const speed=Math.hypot(e.x-fromX,e.z-fromZ)/dt,vertical=(e.y-fromY)/dt;
    e.onGround=floor!==null&&Math.abs(e.y-floor)<.085&&vertical<.44;
    f.bank=approach(f.bank,bracing?0:clamp(-toCourse*1.22,-1,1),5,dt);
    f.glide=approach(f.glide,!rest&&speed>d.walk*.8&&vertical<.85&&!bracing&&Math.sin(f.clock*1.3)>.02?style.glide:0,2.6,dt);
    f.climb=clamp(vertical/style.lift,-1,1);
    f.landing=approach(f.landing,rest&&!e.onGround&&f.perch&&travel<1.35?clamp(1-(e.y-f.perch.y)/2.3,0,1):0,6,dt);
    return speed;
  }
  const profile=d=>({temperament:d.temperament,hp:d.hp,walk:d.walk,run:d.run,sense:d.sense,roam:24,strike:d.strike,
    loot:[...d.loot,["dragon_hide",2,4]]});
  function regional(biome){return Object.keys(species).filter(id=>species[id].regions.includes(biome))}
  return {species,profile,regional,fly,breathStyles,natureBreath,shotDirection,burstRules,rollBurst,advanceCharge,advanceBurst,burstProtection};
})();
