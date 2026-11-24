
"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
const THREE=require("../assets/three.min.js");
require("../js/frontier.js");
require("../js/professions.js");
require("../js/combat-effects.js");
require("../js/terrain.js");

const frontier=QuimiCraftFrontier;
const B={AIR:0,DIRT:1,GRASS:2,MOSS:3,PEAT:4,CLAY:5,WATER:6,STONE:7,TALL_GRASS:8,LEAVES:9,PLANK:10,COPPER:11,COAL:12,FENCE_WOOD:13};
const defs={};
frontier.register(B,defs);

function homestead(saved=[]){
  const cells=new Map(), inventory=new Map(), reports=[], catches=[], rewards=[];
  const context={selected:"hoe",roof:0,season:0,working:true,cell:undefined,saved,cast:null,workshop:null,weather:"clear",
    pos:{x:.5,y:4,z:.5}};
  const key=(x,y,z)=>[Math.floor(x),Math.floor(y),Math.floor(z)].join("|");
  const set=(x,y,z,id)=>cells.set(key(x,y,z),id);
  const get=(x,y,z)=>cells.get(key(x,y,z))??B.AIR;
  const count=id=>inventory.get(id)||0;
  const professions=QuimiCraftProfessions.create({
    B,getBlock:get,setBlock:set,count,
    exchange(need,out){
      if(context.full&&out.length)return {ok:false,message:"Mochila cheia"};
      if(need.some(([id,qty])=>count(id)<qty))return {ok:false,message:"Insumos insuficientes"};
      for(const [id,qty] of need)inventory.set(id,count(id)-qty);
      for(const [id,qty] of out)inventory.set(id,count(id)+qty);
      return {ok:true};
    },
    selected:()=>context.selected,
    notify:line=>reports.push(line),
    blocked:x=>x<-6,
    roof:()=>context.roof,
    sunlit:()=>context.roof===0,
    weather:()=>context.weather,
    season:()=>context.season,
    name:id=>defs[id]?.name??frontier.items[id]?.[0]??id,
    wear:()=>{},
    working:()=>context.working,
    receive:(id,qty)=>catches.push([id,qty]),
    reward:(kind,id)=>rewards.push([kind,id]),
    findWater:()=>context.cell,
    position:()=>context.pos,
    showFishing:cast=>{context.cast=cast},
    splash:()=>{},
    load:()=>saved,
    save:data=>{context.saved=data},
    launchWorkshop:(t,jobs)=>{context.workshop={t,jobs}}
  });
  const use=(x,y,z)=>professions.use(professions.action({x,y,z,n:[0,1,0]}));
  return {context,set,get,use,inventory,count,reports,catches,rewards,professions};
}

test("coberturas bloqueiam chuva e neve até o topo da superfície",()=>{
  const blocks=new Map([[8,3],[11,5],[37,4]]);
  const roof=frontier.roofScan(0,0,96,54,(x,y)=>blocks.get(y),id=>id===3||id===5);
  assert.equal(roof,12);
  assert.equal(frontier.rainSpan(11.8,.7,roof),null);
  assert.ok(frontier.rainSpan(12.4,.7,roof)>12);
  assert.equal(frontier.rainSpan(14,.7,roof),13.3);
});

test("santuário tem limites verticais e a vila nova fica distante",()=>{
  const lab={x:0,cx:0,cz:0,y:8,height:6,halfW:4,halfD:5};
  assert.equal(frontier.safeInterior(lab,.5,8.05,-3),true);
  assert.equal(frontier.safeInterior(lab,.5,8,-4.9),false);
  assert.equal(frontier.safeInterior(lab,.5,14,0),false);
  assert.equal(frontier.safeInterior(lab,.5,7.7,0),false);
  assert.equal(frontier.villageFor({}).x,176);
  assert.equal(frontier.villageFor({qc_world_state_v70:"{}"}).x,48);
  assert.equal(frontier.villageFor({qc_landscape:"2",qc_world_state_v70:"{}"}).z,-70);
});

test("geração determinística encontra os nove biomas de expedição",()=>{
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const hash=(x,y=0,z=0)=>{const v=Math.sin(x*127.1+y*311.7+z*74.7+19.19)*43758.5453;return v-Math.floor(v)};
  const terrain=QuimiCraftTerrain.create({WORLD_SEED:106488241,VILLAGE:frontier.villageFor({}),BLOCK:B,MAX_Y:96,WATER_LEVEL:15,
    inVillage:()=>false,ckey:(x,z)=>x+","+z,hash,clamp,lerp:(a,b,t)=>a+(b-a)*t,smooth:t=>t*t*(3-2*t)});
  const found=new Map();
  for(let x=-22400;x<=22400;x+=1120){
    for(let z=-22400;z<=22400;z+=1120)found.set(terrain.biomeAt(x,z),[x,z]);
  }
  for(const biome of ["floresta de sequoias","manguezal","chapadas ocres","fiordes glaciais","campina de aurora","caldeira vítrea","delta salobro","termas minerais","bosque lilás"]){
    assert.ok(found.has(biome),biome);
    const args=found.get(biome);
    assert.equal(terrain.biomeAt(...args),biome);
    assert.ok(terrain.terrainHeight(...args)>=3);
  }
});

test("terra arada, cultivo irrigado, crescimento, persistência e colheita",()=>{
  const h=homestead();
  h.set(0,3,0,B.DIRT);
  h.set(2,3,0,B.WATER);
  assert.equal(h.use(0,3,0),true);
  assert.equal(h.get(0,3,0),B.WET_FARMLAND);
  h.context.selected="wheat_seed";
  h.inventory.set("wheat_seed",2);
  assert.equal(h.use(0,3,0),true);
  assert.equal(h.count("wheat_seed"),1);
  assert.equal(h.get(0,4,0),B.WHEAT_SPROUT);
  for(let i=0;i<30;i++)h.professions.update(1.2);
  assert.equal(h.get(0,4,0),B.WHEAT_GROWING);
  h.professions.persist();
  const loaded=homestead(h.context.saved);
  loaded.set(0,3,0,B.WET_FARMLAND);
  loaded.set(2,3,0,B.WATER);
  loaded.set(0,4,0,B.WHEAT_GROWING);
  for(let i=0;i<18;i++)loaded.professions.update(1.2);
  assert.equal(loaded.get(0,4,0),B.WHEAT_RIPE);
  assert.equal(loaded.use(0,4,0),true);
  assert.equal(loaded.count("wheat"),2);
  assert.equal(loaded.count("wheat_seed"),2);
  assert.equal(loaded.get(0,4,0),B.AIR);
});

test("cultivo sob teto exige luz, e oficinas exibem os processos corretos",()=>{
  const h=homestead({invalid:true});
  h.set(0,3,0,B.DIRT);
  h.context.roof=10;
  h.context.weather="rain";
  h.use(0,3,0);
  h.context.selected="carrot_seed";
  h.inventory.set("carrot_seed",1);
  h.use(0,3,0);
  for(let i=0;i<90;i++)h.professions.update(1.2);
  assert.equal(h.get(0,3,0),B.FARMLAND);
  assert.equal(h.get(0,4,0),B.CARROT_SPROUT);
  h.set(4,4,0,B.ASSAY_BENCH);
  h.use(4,4,0);
  assert.ok(h.context.workshop.jobs.some(job=>job.need[0][0]===B.AQUAMARINE_ORE));
  h.set(-7,3,0,B.DIRT);
  h.context.selected="hoe";
  h.use(-7,3,0);
  assert.equal(h.get(-7,3,0),B.DIRT);
});

test("frutíferas soltam material de plantio, passam pela floração e frutificam de novo",()=>{
  for(const crop of frontier.crops(B).filter(crop=>crop.regrows)){
    const h=homestead();
    h.set(0,3,0,B.DIRT);
    h.set(1,4,0,crop.wild);
    h.set(2,3,0,B.WATER);
    h.use(1,4,0);
    assert.equal(h.count(crop.food),2);
    assert.equal(h.count(crop.seed),1);
    h.use(0,3,0);
    h.context.selected=crop.seed;
    if(crop.support){
      h.use(0,3,0);
      assert.equal(h.get(0,4,0),B.AIR);
      assert.equal(h.count(crop.seed),1);
      h.inventory.set(B.FENCE_WOOD,1);
    }
    h.use(0,3,0);
    assert.equal(h.get(0,4,0),crop.stages[0]);
    assert.equal(h.count(crop.seed),0);
    assert.equal(h.count(B.FENCE_WOOD),0);
    h.professions.update(crop.seconds);
    assert.equal(h.get(0,4,0),crop.stages[1]);
    h.use(0,4,0);
    assert.equal(h.count(crop.food),2);
    h.professions.update(crop.seconds);
    assert.equal(h.get(0,4,0),crop.stages[2]);
    h.context.full=true;
    h.use(0,4,0);
    assert.equal(h.get(0,4,0),crop.stages[2]);
    h.context.full=false;
    h.use(0,4,0);
    assert.equal(h.count(crop.food),5);
    assert.equal(h.get(0,4,0),crop.stages[1]);
    h.professions.persist();
    const restored=homestead(h.context.saved);
    restored.set(0,3,0,B.WET_FARMLAND);
    restored.set(2,3,0,B.WATER);
    restored.set(0,4,0,crop.stages[1]);
    restored.professions.update(crop.seconds);
    assert.equal(restored.get(0,4,0),crop.stages[2]);
    restored.professions.clearPlot({x:0,y:3,z:0,id:B.FARMLAND});
    assert.equal(restored.get(0,4,0),B.AIR);
    assert.deepEqual(restored.catches,[[crop.food,3],[crop.seed,1],...(crop.support?[[B.FENCE_WOOD,1]]:[])]);
  }
});

test("as nove frutíferas silvestres aparecem somente nos biomas e solos definidos",()=>{
  const crops=frontier.crops(B).filter(crop=>crop.regrows);
  const biomes=new Set(crops.flatMap(crop=>crop.biomes));
  const found=new Set();
  for(let i=0;i<9;i++){
    const picker=frontier.wildFruitPicker(B,(x,z,salt)=>salt===1506?.998:i/9,5);
    for(const biome of biomes){
      const id=picker(biome,B.GRASS,0,0,2);
      const crop=frontier.cropAt(crops,id);
      assert.ok(crop.biomes.includes(biome));
      found.add(id);
      assert.equal(picker(biome,B.WATER,0,0,2),0);
    }
    assert.equal(picker("fiordes glaciais",B.GRASS,0,0,2),0);
  }
  assert.equal(found.size,9);
});

test("pesca consome isca, respeita a fisgada e entrega peixe do bioma",()=>{
  const h=homestead();
  h.context.selected="fishing_rod";
  h.context.cell={x:2.5,y:3.83,z:0.5,biome:"manguezal",depth:3};
  h.set(2,3,0,B.WATER);
  h.inventory.set("bait",2);
  const cast=()=>h.professions.use(h.professions.action(null));
  cast();
  assert.equal(h.context.cast.stage,"flying");
  assert.equal(h.count("bait"),1);
  for(let i=0;i<48&&h.context.cast?.stage!=="bite";i++)h.professions.update(.12);
  assert.equal(h.context.cast.stage,"bite");
  cast();
  assert.equal(h.context.cast,null);
  assert.deepEqual(h.catches,[["raw_catfish",1]]);
  assert.deepEqual(h.rewards,[["pesca","raw_catfish"]]);
  cast();
  h.context.pos.x=9;
  h.professions.update(.12);
  assert.equal(h.context.cast,null);
});

test("rastros e efeitos 3D são atualizados e removidos ao final",()=>{
  const scene=new THREE.Scene();
  const fx=QuimiCraftEffects.create(THREE,scene,()=>2,()=>false);
  const point=new THREE.Vector3(3,4,6);
  const direction=new THREE.Vector3(0,0,-1);
  const trail=fx.trail("arrow");
  trail.move(point);
  trail.move(point.clone().add(direction));
  assert.equal(scene.children[0].children[1].geometry.drawRange.count,2);
  trail.close();
  fx.cast(point,direction,true);
  fx.update(.04);
  assert.ok(scene.children[0].children.length>=4);
  for(let i=0;i<100;i++)fx.update(.02);
  assert.equal(scene.children[0].children.length,1);
  assert.equal(scene.children[0].children[0].geometry.drawRange.count,0);
});
