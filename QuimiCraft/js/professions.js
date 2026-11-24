"use strict";

globalThis.QuimiCraftProfessions = (() => {
  function create(api) {
    const {B, getBlock, setBlock, exchange, selected, notify, blocked, roof, sunlit, weather, season,
      wear, working, receive, reward, findWater, position, showFishing, splash, load, save, launchWorkshop} = api;
    const crops=QuimiCraftFrontier.crops(B);
    const workbench=globalThis.QuimiCraftWorkshops;
    const workshops=QuimiCraftFrontier.stations(B);
    function isRod(id){return workbench?.fishingRods.has(id)||id==="fishing_rod"}
    if(workbench){
      for(const [id,jobs] of workbench.stationJobs(B))workshops.set(id,jobs);
      workshops.get(B.FISH_RACK).push(
        {name:"Isca aromática",need:[[B.LAVENDER,1],["wheat",1]],out:[["herb_bait",4]]},
        {name:"Isca mineral",need:[[B.BAUXITE,1],["wheat",1]],out:[["mineral_lure",3]]},
        {name:"Recuperar linha",need:[["fishing_junk",2]],out:[["wool",1]]}
      );
    }
    const plots=new Map();
    const bases=[B.DIRT,B.GRASS,B.MOSS,B.PEAT,B.CLAY,B.MEADOW_SOIL,B.FOREST_LOAM,B.PODZOL,B.LATERITE,B.PEAT_MAT,B.LOESS];
    const waterIds=[B.WATER];
    const key=(x,y,z)=>x+"|"+y+"|"+z;
    let cast=null, delay=0, saving=0, dirty=false;

    const saved=load();
    for(const row of Array.isArray(saved)?saved:[]){
      if(!Array.isArray(row)||row.length!==7||!row.every(Number.isFinite)||!row.slice(0,3).every(Number.isInteger))continue;
      const [x,y,z,clock,water,feed,last]=row;
      plots.set(key(x,y,z),{x,y,z,clock:Math.max(0,clock),water:Math.max(0,water),feed:Math.max(0,feed),last:Math.max(0,last)});
    }

    const soil=id=>id===B.FARMLAND||id===B.WET_FARMLAND;
    const isCrop=id=>!!QuimiCraftFrontier.cropAt(crops,id);
    function persist(){
      if(!dirty)return;
      save([...plots.values()].map(({x,y,z,clock,water,feed,last})=>[x,y,z,clock,water,feed,last]));
      dirty=false;
    }

    function wetNearby(x,y,z){
      for(let dx=-3;dx<=3;dx++){
        for(let dz=-3;dz<=3;dz++){
          if(Math.abs(dx)+Math.abs(dz)>4)continue;
          if(waterIds.includes(getBlock(x+dx,y,z+dz))||waterIds.includes(getBlock(x+dx,y-1,z+dz)))return true;
        }
      }
      return false;
    }

    function cell(target) {
      if(!target)return null;
      return {x:target.x,y:target.y,z:target.z,id:getBlock(target.x,target.y,target.z),top:target.n?.[1]===1};
    }

    function action(target) {
      const t=cell(target);
      const id=selected();
      if(t&&workshops.has(t.id))return {kind:"station",label:api.name(t.id),t};
      if(t&&isCrop(t.id))return {kind:"crop",label:"Colher / examinar cultivo",t};
      if(t&&soil(t.id)){
        if(crops.some(row=>row.seed===id))return {kind:"seed",label:"Plantar "+api.name(id).toLowerCase(),t};
        if(id==="water_bucket")return {kind:"water",label:"Irrigar a terra",t};
        if(id==="mineral_mix"||id==="fertilizer")return {kind:"feed",label:"Adubar a terra",t};
      }
      if(t&&t.top&&bases.includes(t.id)&&id==="hoe")return {kind:"till",label:"Arar o solo",t};
      if(isRod(id))return {kind:"fish",label:cast?.stage==="bite"?"Puxar a linha":cast?"Recolher a linha":"Lançar a vara"};
      return null;
    }

    function harvest(t,broken=false){
      const crop=QuimiCraftFrontier.cropAt(crops,t.id);
      if(!crop)return false;
      const {x,y,z}=t;
      if(blocked(x,y,z)){notify("A área protegida fica livre de cultivo.");return true}
      if(crop.wild!==t.id&&!broken&&t.id!==crop.stages[2]){notify("O cultivo ainda está crescendo.");return true}
      const yieldItems=crop.wild===t.id?[[crop.seed,2]]:
        t.id===crop.stages[2]?[[crop.food,2],[crop.seed,2]]:[[crop.seed,1]];
      if(!broken){
        const result=exchange([],yieldItems);
        if(!result.ok){notify(result.message);return true}
      }else for(const [id,count] of yieldItems)receive(id,count,{x:x+.5,y:y+.32,z:z+.5});
      setBlock(x,y,z,B.AIR);
      plots.delete(key(x,y-1,z));
      dirty=true;
      reward("cultivo",crop.food,t);
      notify(t.id===crop.wild?"Sementes silvestres coletadas.":"Colheita recolhida.");
      return true;
    }

    function use(actionData){
      if(!actionData)return false;
      const {kind,t}=actionData;
      if(kind==="fish"){fish();return true}
      if(kind==="station"){launchWorkshop(t,workshops.get(t.id));return true}
      if(kind==="crop")return harvest(t);
      const {x,y,z}=t;
      if(blocked(x,y,z)||blocked(x,y+1,z)){notify("O laboratório é uma área protegida.");return true}
      const above=getBlock(x,y+1,z);
      const location=key(x,y,z);
      if(kind==="till"){
        if(!working("hoe")){notify("Repare a enxada para arar.");return true}
        if(above!==B.AIR){notify("Limpe o espaço acima da terra primeiro.");return true}
        setBlock(x,y,z,wetNearby(x,y,z)?B.WET_FARMLAND:B.FARMLAND);
        wear("hoe",.8,"cultivo");
        return true;
      }
      const crop=crops.find(row=>row.seed===selected());
      const existing=plots.get(location);
      if(kind==="seed"){
        if(above!==B.AIR){notify("Junto a este solo já existe uma planta ou um bloco.");return true}
        const result=exchange([[crop.seed,1]],[]);
        if(!result.ok){notify(result.message);return true}
        setBlock(x,y+1,z,crop.stages[0]);
        plots.set(location,{x,y,z,clock:0,last:0,feed:existing?.feed??0,water:existing?.water??(t.id===B.WET_FARMLAND?20:0)});
        dirty=true;
        notify("Plantado. Água e luz aceleram o crescimento.");
        return true;
      }
      const id=selected(),result=exchange([[id,1]],kind==="water"?[["bucket",1]]:[]);
      if(!result.ok){notify(result.message);return true}
      const plot=existing||{x,y,z,clock:0,water:0,feed:0,last:0};
      if(kind==="water"){plot.water=92;setBlock(x,y,z,B.WET_FARMLAND)}
      else plot.feed=76;
      plots.set(location,plot);
      dirty=true;
      notify(kind==="water"?"Solo irrigado.":"Adubo incorporado ao solo.");
      return true;
    }

    function fish(){
      if(cast){
        if(cast.stage==="bite"&&cast.timer>0){
          const catches=api.fishing?.(cast.water,cast.rod,cast.bait)||[[QuimiCraftFrontier.fishFor(cast.water.biome,cast.water.depth),1]];
          for(const [id,qty] of catches){
            receive(id,qty,position());
            reward("pesca",id,cast.water);
          }
          wear(cast.rod,1.1,"pesca");
          splash(cast.water,"catch");
          notify("Na linha: "+catches.map(([id,qty])=>qty+" × "+api.name(id)).join(", ")+".");
        }else notify("Linha recolhida.");
        api.animate?.("reel",.76,cast.rod);
        cast=null;
        showFishing(null);
        return;
      }
      const rod=selected();
      if(!isRod(rod))return;
      if(!working(rod)){notify("Repare a vara para pescar.");return}
      const water=findWater();
      if(!water){notify("Mire em uma superfície de água livre, até 13 blocos de distância.");return}
      const lure=(workbench?.baitOptions||["bait"]).find(id=>api.count(id)>0);
      const bait=lure&&exchange([[lure,1]],[]).ok?lure:null;
      const {x,y,z}=position();
      const start={x,y,z};
      cast={stage:"flying",timer:.42,wait:(bait?2.1:4.2)+Math.random()*(bait?2.4:4.4)-(rod==="reinforced_rod"?.65:0),water,start,age:0,rod,bait};
      api.animate?.("cast",.64,rod);
      showFishing(cast);
    }

    function updateFishing(dt){
      if(!cast)return;
      const p=position();
      if(selected()!==cast.rod||Math.hypot(p.x-cast.start.x,p.z-cast.start.z)>5.3||
         getBlock(cast.water.x,cast.water.y,cast.water.z)!==B.WATER){
        cast=null;
        showFishing(null);
        return;
      }
      cast.timer-=dt;
      cast.age+=dt;
      if(cast.timer<=0){
        if(cast.stage==="flying"){
          cast.stage="waiting";
          cast.timer=cast.wait;
          splash(cast.water,"land");
        }else if(cast.stage==="waiting"){
          cast.stage="bite";
          cast.window=(cast.rod==="reinforced_rod"?2.20:1.75)+(cast.bait==="herb_bait"?.39:0);
          cast.timer=cast.window;
          splash(cast.water,"bite");
          notify("Fisgou! Pressione E ou toque em Interagir.");
        }else{
          cast=null;
          notify("O peixe escapou.");
        }
      }
      showFishing(cast);
    }

    function update(dt){
      updateFishing(dt);
      delay+=dt;
      saving+=dt;
      if(delay<1.2)return;
      const elapsed=delay;
      delay=0;
      const p=position();
      for(const [location,plot] of plots){
        const {x,y,z}=plot;
        if(Math.abs(x-p.x)>62||Math.abs(z-p.z)>62)continue;
        if(!soil(getBlock(x,y,z))){plots.delete(location);dirty=true;continue}
        plot.water=Math.max(0,plot.water-elapsed);
        plot.feed=Math.max(0,plot.feed-elapsed);
        const exposed=roof(x,z)<=y+1.04;
        const wet=plot.water>0||wetNearby(x,y,z)||exposed&&["rain","storm"].includes(weather());
        const desired=wet?B.WET_FARMLAND:B.FARMLAND;
        if(getBlock(x,y,z)!==desired)setBlock(x,y,z,desired);
        const stage=getBlock(x,y+1,z),crop=QuimiCraftFrontier.cropAt(crops,stage);
        if(!crop||!crop.stages.includes(stage)){
          if(!plot.water&&!plot.feed){plots.delete(location);dirty=true}
          continue;
        }
        const current=crop.stages.indexOf(stage);
        if(current<2){
          plot.clock+=QuimiCraftFrontier.growClock(elapsed,{wet,sun:sunlit(x,y+1,z),winter:season()===3,fed:plot.feed>0});
          const next=Math.min(2,Math.floor(plot.clock/crop.seconds));
          if(next>current)setBlock(x,y+1,z,crop.stages[next]);
        }
        dirty=true;
      }
      if(saving>9){saving=0;persist()}
    }

    function clearPlot(t){
      if(!soil(t.id))return;
      const crop=getBlock(t.x,t.y+1,t.z);
      if(isCrop(crop))harvest({x:t.x,y:t.y+1,z:t.z,id:crop},true);
      plots.delete(key(t.x,t.y,t.z));
      dirty=true;
    }

    return {action,use,update,persist,harvest,clearPlot,isCrop,soil};
  }
  return {create};
})();
