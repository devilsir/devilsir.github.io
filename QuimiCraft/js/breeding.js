"use strict";

globalThis.QuimiCraftBreeding=(()=>{
  const rabbit=["carrot"],grazer=["wheat"],fruit=["berries","blackberry"],meat=["raw_beef","raw_venison","raw_pork","raw_chicken"];
  const fish=["raw_fish","raw_trout","raw_perch","raw_sardine","raw_carp","raw_char"];
  const foods=Object.freeze({
    cow:grazer,sheep:grazer,bison:grazer,mountain_goat:grazer,scoria_ram:grazer,deer:grazer,
    forest_deer:grazer,savanna_gazelle:grazer,pig:rabbit,wild_boar:rabbit,rabbit,flower_hare:rabbit,
    snow_hare:rabbit,salt_marsh_rabbit:rabbit,capivara:["carrot","wheat"],mangrove_capivara:["carrot","wheat"],
    cacao_tapir:fruit,iron_armadillo:["bait"],chicken:["wheat_seed","carrot_seed","bean_seed"],
    rime_fox:fruit,fennec:fruit,cat:fish,dog:meat,wolf:meat,jaguar:meat,tiger:meat,lion:meat,
    lynx:meat,brown_bear:fish,black_bear:fish,polar_bear:fish,badger:["raw_rabbit","berries"]
  });
  const affection=30,cooldown=300,childhood=1200,pairRange=12;
  function diet(actor){
    if(actor.community)return {items:["bread","carrot"],group:actor.community,amount:id=>id==="bread"?3:12};
    const items=foods[actor.type];
    return items?{items,group:actor.type,amount:()=>1}:null;
  }
  function create(){
    const transient=new WeakMap(),named=new Map(),offspring=new Map();
    let time=0,serial=0;
    const identity=actor=>actor.birth?.id||actor.resident?.id;
    const status=actor=>(identity(actor)?named.get(identity(actor)):transient.get(actor))||{};
    function setStatus(actor,state){
      const id=identity(actor);
      if(!id)transient.set(actor,state);
      else if(state.cooldown>time||state.ready>time)named.set(id,state);
      else named.delete(id);
    }
    const ready=actor=>!actor.dead&&!actor.ai.recovering&&!actor.young&&status(actor).ready>time;
    function offer(actor,item){
      const rules=diet(actor);
      if(!rules?.items.includes(item)||actor.dead||actor.ai.recovering)return null;
      const count=rules.amount(item),state=status(actor);
      if(actor.young)return (actor.birth||actor.wildAge)&&!actor.community?{kind:"grow",count}:null;
      if(state.cooldown>time)return {kind:"cooldown",seconds:Math.ceil(state.cooldown-time)};
      if(state.ready>time)return {kind:"ready"};
      return {kind:"feed",count};
    }
    function feed(actor,offer){
      if(offer.kind==="grow"){
        if(actor.birth)actor.birth.growAt=time+Math.max(0,actor.birth.growAt-time)*.9;
        else actor.wildAge=1-(1-actor.wildAge)*.9;
      }
      else setStatus(actor,{ready:time+affection});
    }
    function mate(actor,actors,visible){
      if(!ready(actor))return null;
      const group=diet(actor)?.group;
      let best=null,nearest=pairRange;
      for(const other of actors){
        if(other===actor||!ready(other)||diet(other)?.group!==group)continue;
        const gap=Math.hypot(actor.x-other.x,actor.z-other.z);
        if(gap>=nearest||Math.abs(actor.y-other.y)>2.5||!visible(actor,other))continue;
        best=other;nearest=gap;
      }
      return best;
    }
    function born(a,b,location,details={}){
      if(!ready(a)||!ready(b)||a===b||diet(a)?.group!==diet(b)?.group)return null;
      setStatus(a,{cooldown:time+cooldown});
      setStatus(b,{cooldown:time+cooldown});
      const child={...location,...details,id:"born:"+(++serial),type:a.type,growAt:time+childhood};
      offspring.set(child.id,child);
      return child;
    }
    function age(actor){return Math.min(1,Math.max(0,1-(actor.birth.growAt-time)/childhood))}
    function tick(dt){
      time+=dt;
      for(const [id,state] of named)if(!(state.cooldown>time||state.ready>time))named.delete(id);
    }
    function save(){
      return {time,serial,offspring:[...offspring.values()],parents:[...named]};
    }
    function restore(data){
      if(!data||!Array.isArray(data.offspring))return;
      time=Number.isFinite(data.time)?Math.max(0,data.time):0;
      serial=Number.isSafeInteger(data.serial)?Math.max(0,data.serial):0;
      offspring.clear();named.clear();
      for(const child of data.offspring){
        if(!child||!/^born:\d+$/.test(child.id)||![child.x,child.y,child.z,child.growAt].every(Number.isFinite))continue;
        if(child.family?!["villager","alchemist"].includes(child.family):!foods[child.type])continue;
        offspring.set(child.id,child);
        serial=Math.max(serial,Number(child.id.slice(5)));
      }
      for(const entry of Array.isArray(data.parents)?data.parents:[]){
        if(!Array.isArray(entry))continue;
        const [id,state]=entry;
        if(typeof id!=="string"||!state||!(state.cooldown>time||state.ready>time))continue;
        named.set(id,state);
      }
    }
    return {offer,feed,ready,mate,born,age,tick,save,restore,offspring,
      forget:actor=>{if(actor.birth){offspring.delete(actor.birth.id);named.delete(actor.birth.id)}}};
  }
  return {create,diet,childhood};
})();
