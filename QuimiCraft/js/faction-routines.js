"use strict";

globalThis.QuimiCraftFactionRoutines=(()=>{
  const workers={
    light:["light_paladin","light_crusader","light_sentinel","light_vindicator"],
    scourge:["scourge_necromancer","scourge_skeleton","scourge_deathknight","scourge_ghoul"],
    fel:["fel_imp","fel_felguard","fel_succubus","fel_guard"],
    druid:["druid_shaman","druid_totemist","druid_shapeshifter"],
    alchemist:["alchemist_pyromancer","alchemist_sentinel"],
    villager:["villager_ranger"],
    arvoroso:["living_tree_sapling","living_tree_amber","living_tree_bloom"],
    ancient:["kthir_harbinger","sem_rosto","insectoide"]
  };
  const seats={
    workshop:[[0,0],[-1,0],[0,1],[1,0],[1,1]],
    quarters:[[0,-1],[1,0],[1,1],[1,-1],[1,2]],
    hall:[[-1,1],[1,0],[-1,-1],[1,1],[0,-1]]
  };
  const titles={workshop:"Trabalhando na oficina",quarters:"Descansando nos aposentos",hall:"Circulando pelo salão"};
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const near=(actor,point,radius)=>distance(actor,point)<radius&&Math.abs(actor.y-point.y)<(actor.flying?1.15:.65);
  const groundPoint=(site,project,u,y,v)=>{
    const [x,z]=project(site,u,v);
    return {x:x+.5,y,z:z+.5};
  };
  function addRoom(site,project,kind,wing,y,positions,focus=null,entry=null){
    const toWorld=([u,v])=>groundPoint(site,project,u,y,v);
    const room={kind,wing,spots:positions.map(toWorld),focus:focus&&toWorld(focus),entry:entry&&toWorld(entry)};
    (site.routineRooms??=[]).push(room);
  }
  function addChamber(site,project,kind,wing,u,y,v,entry){
    const spots=wing?[[0,2],[0,3],[-1,2],[1,2]]:seats[kind];
    addRoom(site,project,kind,wing,y,spots.map(([x,z])=>[u+x,v+z]),[u,v-2],entry);
  }
  function addPassage(site,project,wing,u,y,v){
    (site.routinePassages??={})[wing]=groundPoint(site,project,u,y,v);
  }
  function activity(day,index){
    const hour=(day*24+6)%24,shift=index%3;
    if(hour<6.35+shift*.25||hour>=21.1+shift*.45)return "quarters";
    if(hour>=8&&hour<18.4&&!(shift===1&&hour>=10&&hour<14)&&!(shift===2&&(hour<10||hour>=14)))return "workshop";
    return "hall";
  }
  function assignments(site,group){
    if(!site.routineRooms?.length)return new Map();
    if(site.routineAssignments)return site.routineAssignments;
    const eligible=site.actors.filter((spec,index)=>index>0&&!spec.surface&&(group==="elemental"?
      spec.type.endsWith("_elemental")||spec.type==="arcane_wisp"||spec.type==="arcane_sentinel":
      workers[group]?.includes(spec.type)&&(group!=="ancient"||index<=6)));
    const assigned=new Map();
    const room=(kind,wing)=>site.routineRooms.find(room=>room.kind===kind&&room.wing===wing);
    const chooseRooms=wing=>({workshop:room("workshop",wing),quarters:room("quarters",wing),hall:room("hall",0)});
    function fill(wing,count,candidates){
      const rooms=chooseRooms(wing);
      if(!rooms.workshop||!rooms.quarters||!rooms.hall)return;
      for(const [index,spec] of candidates.slice(0,count).entries()){
        assigned.set(spec.id,{rooms,index:index+(wing<0?3:wing>0?6:0),slot:index,
          hallSlot:wing<0?3:wing>0?4:index,passage:site.routinePassages?.[wing],junction:site.routineJunction});
      }
    }
    const residents=eligible.filter(spec=>!spec.id.includes(":guard:"));
    fill(0,3,residents);
    for(const wing of [-1,1]){
      const workshop=room("workshop",wing);
      if(!workshop)continue;
      const candidates=eligible.filter(spec=>spec.id.includes(":guard:")&&!assigned.has(spec.id)&&
        distance(spec,workshop.spots[0])<22).sort((a,b)=>distance(a,workshop.spots[0])-distance(b,workshop.spots[0]));
      fill(wing,1,candidates);
    }
    site.routineAssignments=assigned;
    return assigned;
  }
  function initial(assignment,day){
    if(!assignment)return null;
    const kind=activity(day,assignment.index),room=assignment.rooms[kind];
    return room.spots[(kind==="hall"?assignment.hallSlot:assignment.slot)%room.spots.length];
  }
  function begin(assignment){
    return {assignment,kind:null,action:null,room:null,target:null,route:[],via:[],nextPlan:0,nextStop:0,nextCheck:0,lap:0};
  }
  function interrupt(routine){
    if(!routine.kind)return;
    routine.kind=routine.action=null;
    routine.route.length=routine.via.length=0;
  }
  function step(e,behavior,day,now,{canStand,plan,suspended=false}){
    const routine=e.routine;
    if(!routine)return behavior;
    if(suspended||e.ai.engagement||e.ai.returnTo||e.ai.fear>0||e.ai.swing||e.shiftedForm||
      !["idle","wander","patrol","return","rest","sleep"].includes(behavior.mode)){
      interrupt(routine);
      return behavior;
    }
    const {assignment}=routine,kind=activity(day,assignment.index);
    const room=assignment.rooms[kind];
    if(routine.kind===kind&&!routine.target&&now<routine.nextCheck)return behavior;
    if(routine.kind!==kind||!routine.target||now>=routine.nextCheck&&!canStand(e,routine.target)){
      const slot=kind==="hall"?assignment.hallSlot+routine.lap:assignment.slot;
      const previous=routine.room,preferred=room.spots[slot%room.spots.length];
      const target=canStand(e,preferred)?preferred:room.spots.slice(kind==="hall"?0:3).find(point=>canStand(e,point));
      routine.kind=kind;
      routine.room=room;
      routine.action=null;
      routine.target=target||null;
      routine.nextCheck=now+1250;
      routine.nextStop=routine.nextPlan=0;
      routine.route=[];
      routine.via=[];
      if(previous&&previous!==room&&previous.entry&&previous.spots.some(spot=>distance(e,spot)<3)&&
        !near(e,previous.entry,.7))routine.via.push(previous.entry);
      if(previous&&previous.wing!==room.wing&&assignment.passage&&!near(e,assignment.passage,.7))
        routine.via.push(assignment.passage);
      if(previous!==room&&assignment.junction&&!near(e,assignment.junction,.7))
        routine.via.push(assignment.junction);
      if(room.entry&&!room.spots.some(spot=>distance(e,spot)<2.65)&&!near(e,room.entry,.7))routine.via.push(room.entry);
      if(!routine.target)return behavior;
    }else if(now>=routine.nextCheck)routine.nextCheck=now+1250;

    if(near(e,routine.target,.49)&&!e.hop){
      routine.route.length=routine.via.length=0;
      routine.action=kind;
      if(kind==="workshop")return {mode:"work",speed:0,aim:room.focus};
      if(kind==="quarters")return {mode:"sleep",speed:0};
      routine.nextStop||=now+1800+assignment.index*440;
      if(now<routine.nextStop)return {mode:"idle",speed:0,aim:room.focus};
      routine.lap++;
      routine.kind=null;
      routine.target=null;
      return {mode:"idle",speed:0};
    }
    routine.action=null;
    while(routine.via.length&&near(e,routine.via[0],.55)){
      routine.via.shift();routine.route.length=0;routine.nextPlan=0;
    }
    while(routine.route.length&&near(e,routine.route[0],.43))routine.route.shift();
    const destination=routine.via[0]||routine.target;
    if((!routine.route.length||e.ai.stalled>2.1)&&now>=routine.nextPlan){
      const route=plan(e,destination);
      if(route){
        routine.route=route;
        routine.nextPlan=now+(route.length?1800:850);
        e.ai.stalled=0;
      }
    }
    return {mode:"routineWalk",goal:routine.route[0]||destination,speed:e.profile.walk*1.16};
  }

  return {addRoom,addChamber,addPassage,activity,assignments,initial,begin,interrupt,step,titles};
})();
