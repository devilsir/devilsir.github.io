
"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
const THREE=require("../assets/three.min.js");
require("../js/frontier.js");
require("../js/regions.js");
require("../js/settlements.js");
require("../js/workshops.js");
require("../js/player-models.js");

const B={AIR:0,DOOR:13,PLANK:11,IRON:9,CLAY:23,STONE:3,COAL:8,COPPER:17,TIN:27,ZINC:28,RED_SAND:32,SAND:4,
  CERAMIC:42,SLATE:51,LEAVES:6,GLASS:19,VILLAGE_BRICK:59,LIMESTONE:50,TALL_GRASS:44,DIRT:2,BRONZE_BLOCK:43,MOSS:31,TORCH:12,PINE_LOG:34};
const defs={};
QuimiCraftFrontier.register(B,defs);
QuimiCraftRegions.register(B,defs);
const hash=(x,y,z)=>{const v=Math.sin(x*127.1+y*311.7+z*74.7+19.19)*43758.5453;return v-Math.floor(v)};
function district(seed,biome="floresta",version="3"){
  return QuimiCraftSettlements.create({B,seed,hash,hub:QuimiCraftFrontier.villageFor({qc_landscape:version}),biome:()=>biome});
}

test("casas, fachadas, moradores e lotes variam pela semente",()=>{
  const a=district(106488241).main(),replica=district(106488241).main(),b=district(5178).main();
  assert.deepEqual(a.buildings,replica.buildings);
  assert.notDeepEqual(a.buildings,b.buildings);
  assert.equal(a.buildings.filter(row=>row.shop).length,5);
  assert.ok(new Set(a.buildings.map(row=>row.width)).size>1);
  assert.ok(new Set(a.buildings.map(row=>row.y)).size>1);
  assert.ok(new Set(a.people.map(row=>row.scale)).size>1);
  assert.equal(new Set(a.people.map(row=>row.name)).size,a.people.length);
  assert.ok([...a.road.keys()].some(key=>key.endsWith(",-72")));
  assert.equal(district(2,"floresta","2").main(),null);
});

test("províncias trocam materiais, roupas e água",()=>{
  const cold=district(90,"fiordes glaciais").main(),coast=district(90,"delta salobro").main();
  const blocks=(d)=>new Set(d.structure.values());
  assert.equal(cold.culture,"snow");
  assert.equal(coast.culture,"coast");
  assert.notEqual(cold.people[0].tint,coast.people[0].tint);
  assert.ok(blocks(cold).has(B.PINE_LOG));
  assert.ok(blocks(coast).has(B.MANGROVE_LOG));
  assert.equal(QuimiCraftRegions.water("termas minerais").chem.hot,true);
  assert.equal(QuimiCraftRegions.water("delta salobro").chem.salt,true);
  assert.notDeepEqual(QuimiCraftRegions.water("vulcânico").rgb,QuimiCraftRegions.water("taiga").rgb);
});

test("povoados remotos geram portas e fundações coerentes pelo mundo",()=>{
  const system=district(2801);
  let site;
  for(let x=3100;x<3650&&!site;x+=8){
    for(let z=-1700;z<-1150&&!site;z+=8)site=system.near(x,z);
  }
  assert.ok(site&&!site.main);
  for(const house of site.buildings){
    assert.equal(system.blockAt(house.doorX,house.y+1,house.doorZ),B.DOOR);
    assert.equal(system.doorAt(house.doorX,house.y+2,house.doorZ).half,1);
    assert.equal(system.surface(house.x,house.z,58),house.y);
    assert.equal(system.occupied(house.x,house.z),true);
  }
});

test("catálogo de produção referencia ingredientes e aplicações",()=>{
  const stations=QuimiCraftWorkshops.stationJobs(B);
  const brass=stations.get(B.METAL_FORGE).find(row=>row.out[0][0]==="brass_ingot");
  assert.deepEqual(brass.need,[["copper_ingot",2],["zinc_ingot",1],[B.COAL,1]]);
  const cobalt=stations.get(B.GLASS_KILN).find(row=>row.out[0][0]===B.GLASS_COBALT);
  assert.ok(cobalt.need.some(([id])=>id===B.COBALT_ORE));
  for(const jobs of stations.values())for(const j of jobs){
    assert.ok(j.seconds>0);
    assert.ok([...j.need,...j.out].every(([id,n])=>id!=null&&n>0));
  }
  for(const row of QuimiCraftWorkshops.recipes(B))assert.ok(row.need.every(([id,n])=>id!=null&&n>0));
});

test("liga só consome insumos ao concluir e sair da bancada cancela",()=>{
  const inv=new Map([["copper_ingot",2],["zinc_ingot",1],[B.COAL,1]]);
  const station={x:5,y:20,z:6,id:B.METAL_FORGE};
  const job=QuimiCraftWorkshops.stationJobs(B).get(B.METAL_FORGE).find(j=>j.out[0][0]==="brass_ingot");
  const state={x:5.5,y:20,z:5.5,finished:false,warnings:0,started:0};
  const queue=QuimiCraftWorkshops.createJobQueue({
    position:()=>state,exchange(need,out,preview){
      if(need.some(([id,qty])=>(inv.get(id)||0)<qty))return {ok:false,message:"materiais"};
      if(!preview){
        for(const [id,qty] of need)inv.set(id,inv.get(id)-qty);
        for(const [id,qty] of out)inv.set(id,(inv.get(id)||0)+qty);
      }
      return {ok:true};
    },
    getBlock:()=>B.METAL_FORGE,notice:()=>state.warnings++,play:()=>state.started++,finish:()=>{state.finished=true}
  });
  assert.ok(queue.enqueue(station,job).ok);
  assert.equal(queue.enqueue(station,job).ok,false);
  queue.tick(.5);
  assert.equal(inv.get("copper_ingot"),2);
  state.x=22;
  queue.tick(.1);
  assert.equal(state.warnings,1);
  assert.equal(inv.get("copper_ingot"),2);
  state.x=5.5;
  assert.ok(queue.enqueue(station,job).ok);
  queue.tick(job.seconds+.001);
  assert.equal(inv.get("brass_ingot"),3);
  assert.equal(inv.get("copper_ingot"),0);
  assert.equal(state.finished,true);
  assert.equal(state.started,2);
});

test("pescado e achados reagem à água, à profundidade e à isca",()=>{
  const catchAt=(kind,roll,depth=4,rod="fishing_rod",bait=null)=>QuimiCraftWorkshops.fishingYield({kind,depth,biome:""},rod,bait,()=>roll);
  assert.deepEqual(catchAt("salt",.06),[["raw_shrimp",2]]);
  assert.deepEqual(catchAt("cold",.26),[["raw_char",1]]);
  assert.deepEqual(catchAt("tannin",.26),[["raw_eel",1]]);
  assert.deepEqual(catchAt("thermal",.35),[["raw_carp",1]]);
  assert.deepEqual(catchAt("mineral",.13,3,"reinforced_rod","mineral_lure"),[["aquamarine",1]]);
  assert.deepEqual(catchAt("fresh",.99),[["fishing_junk",1]]);
});

test("os dedos se fecham em torno da ferramenta e a pose de uso muda o braço",()=>{
  const model=QuimiCraftModels.create(THREE,{blocks:{},block:{},atlas:{texture:null},texFor:()=>0,uvTile:()=>[0,0],itemColor:()=>"#888",shadows:()=>false});
  const mat=new THREE.MeshLambertMaterial({color:0xffffff});
  const avatar=model.avatar(Object.fromEntries(["skin","skinLight","skinShade","sleeve","coat","coatShade","pants","hair","boot"].map(id=>[id,mat])));
  const wrist=avatar.heldThird.parent,finger=wrist.children.find(child=>child.isGroup&&child!==avatar.heldThird),shoulder=wrist.parent.parent;
  const pose={dt:.12,now:100,motion:1,moving:false,sprint:false,crouch:false,swim:false,airborne:false,pitch:0,action:0};
  avatar.animate(pose);
  const relaxed=finger.rotation.x;
  const arm=shoulder.rotation.x;
  avatar.animate({...pose,firstType:"reinforced_rod",activity:{kind:"reel",phase:.55}});
  assert.ok(finger.rotation.x>relaxed+.5);
  assert.ok(shoulder.rotation.x<arm-.15);
  assert.ok(avatar.heldThird.position.distanceTo(new THREE.Vector3(0,-.046,-.094))<.001);
  assert.ok(model.item("reinforced_rod","first").userData.rodTip.z<0);
});
