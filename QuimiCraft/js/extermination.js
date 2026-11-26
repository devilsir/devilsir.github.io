"use strict";

globalThis.QuimiCraftExtermination=(()=>{
  const master={role:"extermination_master",name:"Mestre Gael",title:"Mestre de Extermínio"};
  const contracts={
    tide_ooze:{count:3,points:8,level:1,xp:24},
    glass_mycelium:{count:4,points:12,level:1,xp:34},
    ember_salamander:{count:3,points:9,level:3,xp:45},
    soot_weaver:{count:4,points:13,level:5,xp:58},
    echo_burrower:{count:3,points:11,level:7,xp:68},
    fractured_sentinel:{count:3,points:9,level:9,xp:78},
    resonant_burrower:{count:3,points:19,level:12,xp:116},
    furnace_weaver:{count:4,points:24,level:16,xp:152}
  };
  const levelThresholds=Array.from({length:20},(_,i)=>26*i+12*i*i);
  // Os salvos anteriores registravam o total de entregas, sem guardar as espécies.
  const legacyCompletedXp=72;
  const stock={
    fracture_hammer:{count:1,points:5},
    osmotic_salt:{count:3,points:3},
    brine_cold_pack:{count:3,points:4},
    copper_ampoule:{count:4,points:5},
    echo_fork:{count:1,points:6},
    sealing_cartridge:{count:4,points:5},
    hunt_badge:{count:1,points:28}
  };
  const starter=[["fracture_hammer",1],["osmotic_salt",3],["brine_cold_pack",3]];
  const whole=value=>Number.isSafeInteger(value)&&value>=0?value:0;
  const known=(table,id)=>typeof id==="string"&&Object.hasOwn(table,id);

  function create(saved={}){
    let points=whole(saved?.points),completed=whole(saved?.completed),starterTaken=saved?.starterTaken===true;
    const type=saved?.assignment?.type;
    let assignment=known(contracts,type)?{type,kills:Math.min(contracts[type].count,whole(saved.assignment.kills))}:null;
    const legacyXp=completed*legacyCompletedXp+(assignment?assignment.kills*contracts[type].xp:0);
    let xp=Object.hasOwn(saved??{},"xp")?whole(saved.xp):Math.min(Number.MAX_SAFE_INTEGER,legacyXp);
    const snapshot=()=>({xp,points,completed,starterTaken,assignment:assignment?{...assignment}:null});
    const hunting=()=>assignment&&assignment.kills<contracts[assignment.type].count?assignment.type:null;
    function progress(){
      const index=levelThresholds.findLastIndex(threshold=>xp>=threshold);
      return {level:index+1,xp,startXp:levelThresholds[index],nextXp:levelThresholds[index+1]??null};
    }
    function accept(type){
      if(assignment||!known(contracts,type)||progress().level<contracts[type].level)return false;
      assignment={type,kills:0};
      return true;
    }
    function record(type){
      if(hunting()!==type||!assignment)return null;
      const {count,xp:reward}=contracts[type],previousLevel=progress().level;
      assignment.kills++;
      const gain=Math.min(reward,Number.MAX_SAFE_INTEGER-xp);
      xp+=gain;
      return {kills:assignment.kills,count,ready:assignment.kills===count,gainedXp:gain,previousLevel,level:progress().level};
    }
    function claim(){
      if(!assignment||hunting())return 0;
      const reward=contracts[assignment.type].points;
      points+=reward;
      completed++;
      assignment=null;
      return reward;
    }
    function abandon(){
      if(!hunting())return false;
      assignment=null;
      return true;
    }
    function buy(id,grant){
      if(!known(stock,id)||points<stock[id].points)return false;
      const {count,points:cost}=stock[id];
      if(!grant([[id,count]]))return false;
      points-=cost;
      return true;
    }
    function kit(grant){
      if(starterTaken||!grant(starter))return false;
      starterTaken=true;
      return true;
    }
    return {snapshot,hunting,progress,accept,record,claim,abandon,buy,kit};
  }
  return {master,contracts,stock,create};
})();
