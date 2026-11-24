
"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
require("../js/horizon.js");
require("../js/frontier.js");
require("../js/regions.js");
require("../js/workshops.js");
require("../js/entity-ai.js");

const horizon=QuimiCraftHorizon;
const B={};
const defs={};
QuimiCraftFrontier.register(B,defs);
QuimiCraftRegions.register(B,defs);
const hash=(x,y,z)=>{const v=Math.sin(x*127.1+y*311.7+z*74.7+19.19)*43758.5453;return v-Math.floor(v)};

test("a entrada pré-carrega disco maior e o alcance tem margem para névoa",()=>{
  const {presetRange,normalizeRange,preloadRadius,streamRadius,disk,fogRange}=horizon;
  assert.equal(normalizeRange(21),16);
  assert.equal(normalizeRange(3),8);
  assert.equal(normalizeRange("inválido",6),8);
  assert.equal(presetRange.low,8);
  assert.equal(normalizeRange("dado inválido"),12);
  assert.equal(presetRange.high,12);
  const r=preloadRadius(presetRange.high),initial=disk(-3,4,r);
  assert.equal(r,5);
  assert.equal(initial.length,89);
  assert.equal(new Set(initial.map(q=>q.k)).size,initial.length);
  assert.ok(initial.some(q=>q.k==="-3,4"));
  const clear=fogRange(12,16,"clear"),storm=fogRange(12,16,"storm");
  assert.equal(clear.near,192);
  assert.ok(clear.far>clear.near&&clear.far<streamRadius(12)*16-20);
  assert.ok(storm.near<clear.near&&storm.far===clear.far);
  assert.ok(fogRange(12,16,"clear",.12).far<clear.near);
});

test("todos os presets protegem pelo menos 85 chunks ao redor da posição de entrada",()=>{
  assert.equal(horizon.coreSize,89);
  assert.equal(horizon.preloadRadius(horizon.presetRange.low),horizon.minimumRadius);
  for(const range of Object.values(horizon.presetRange)){
    const loaded=new Set(horizon.disk(4,-15,horizon.preloadRadius(range)).map(q=>q.k));
    assert.ok(horizon.coreReady(4,-15,(x,z)=>loaded.has(x+","+z)));
  }
});

test("a verificação de cobertura identifica o último chunk pendente",()=>{
  const origin=horizon.disk(0,0,horizon.minimumRadius),next=horizon.disk(1,1,horizon.minimumRadius);
  const loaded=new Set(origin.map(q=>q.k));
  const outside=next.filter(q=>!loaded.has(q.k));
  const has=(x,z)=>loaded.has(x+","+z);
  for(const q of outside.slice(1))loaded.add(q.k);
  assert.equal(horizon.coreReady(0,0,has),true);
  assert.equal(next.filter(q=>has(q.cx,q.cz)).length,88);
  assert.equal(horizon.coreReady(1,1,has),false);
  loaded.add(outside[0].k);
  assert.equal(horizon.coreReady(1,1,has),true);
});

test("a direção de caminhada antecipa os discos laterais e o diagonal ao mesmo tempo",()=>{
  const direction=horizon.movementDirection(-.6,.65);
  assert.deepEqual(direction,{x:-1,z:1});
  assert.deepEqual(horizon.nextCenters(-2,3,direction),[{x:-3,z:3},{x:-2,z:4},{x:-3,z:4}]);
  assert.deepEqual(horizon.nextCenters(-2,3,horizon.movementDirection(.8,.01)),[{x:-1,z:3}]);
  assert.deepEqual(horizon.nextCenters(0,0,horizon.movementDirection(0,0)),[]);
});

test("aproximar-se da borda solicita só a faixa nova antes da travessia",()=>{
  const initial=horizon.streamCenter({x:8,z:8},16);
  const east=horizon.streamCenter({x:13,z:8},16,initial);
  const old=new Set(horizon.streamWindow(initial,8).map(q=>q.k));
  const preview=horizon.streamWindow(east,8);
  const added=preview.filter(q=>!old.has(q.k));
  const next=new Set(horizon.disk(1,0,horizon.streamRadius(8)).map(q=>q.k));
  assert.equal(east.x,initial.x);
  assert.equal(east.aheadX,1);
  assert.equal(preview.length,old.size+added.length);
  assert.equal(added.length,21);
  assert.ok(added.every(q=>q.cx>0&&next.has(q.k)));
  assert.ok([...next].every(key=>preview.some(q=>q.k===key)));
  assert.equal(horizon.streamCenter({x:10,z:8},16,east).aheadX,1);
  assert.equal(horizon.streamCenter({x:8,z:8},16,east).aheadX,0);
});

test("a borda funciona nas diagonais e mantém uma margem curta de reaproveitamento",()=>{
  const center=horizon.streamCenter({x:-14,z:30},16);
  assert.deepEqual(center,{x:-1,z:1,aheadX:-1,aheadZ:1});
  const ranges=new Set(horizon.streamWindow(center,8).map(q=>q.k));
  for(const [cx,cz] of [[-1,1],[-2,1],[-1,2],[-2,2]]){
    assert.ok(horizon.disk(cx,cz,10).every(q=>ranges.has(q.k)));
  }
  assert.equal(horizon.retainChunk(-12,1,center,8),true);
  assert.equal(horizon.retainChunk(-13,1,center,8),false);
});

test("a névoa acompanha a borda real até o restante dos chunks chegar",()=>{
  const chunks=new Set(horizon.disk(0,0,5).map(q=>q.k)),pos={x:8,z:8};
  const loaded=horizon.loadedRange(pos,12,16,(x,z)=>chunks.has(x+","+z));
  assert.ok(loaded>3&&loaded<5);
  const partial=horizon.fogRange(loaded,16,"clear");
  assert.ok(partial.far<horizon.fogRange(12,16,"clear").near);
  assert.equal(horizon.loadedRange(pos,12,16,()=>true),12);
  assert.equal(horizon.loadedRange(pos,12,16,()=>false),.25);
});

test("pulo libera construção sob os pés sem aceitar bloco dentro do corpo",()=>{
  const pos={x:4.5,y:11.22,z:7.5};
  assert.equal(horizon.overlapsPlayer(pos,1.72,4,11,7),true);
  assert.equal(horizon.canBufferUnderfoot(pos,4,11,7,5.2),true);
  assert.equal(horizon.canBufferUnderfoot(pos,4,11,7,-.8),false);
  assert.equal(horizon.canBufferUnderfoot(pos,5,11,7,5.2),false);
  assert.equal(horizon.canBufferUnderfoot(pos,4,12,7,5.2),false);
  pos.y=12.025;
  assert.equal(horizon.overlapsPlayer(pos,1.72,4,11,7),false);
  assert.equal(horizon.overlapsPlayer(pos,1.72,4,12,7),true);
  assert.equal(horizon.overlapsPlayer(pos,1.72,5,12,7),false);
});

test("cada bioma oferece recursos próprios e peixes e animais válidos",()=>{
  const biomes=["planície","planície florida","prado alpino","montanha","tundra","taiga","floresta","floresta de sequoias",
    "bosque de cerejeiras","bosque lilás","selva tropical","savana","deserto","badlands","chapadas ocres",
    "cânion calcário","bosque de cristais","campina de aurora","manguezal","delta salobro","pântano","salinas",
    "fiordes glaciais","termas minerais","caldeira vítrea","vulcânico"];
  const high=QuimiCraftRegions.resourcePlan(B,()=>.995,88131);
  const scarce=QuimiCraftRegions.resourcePlan(B,()=>.35,88131);
  const surfaces=new Set(),strata=new Set(),ores=new Set(),plants=new Set();
  for(const biome of biomes){
    const ids=[high.surface(biome,80,60,4),high.stratum(biome,80,10,60),high.ore(biome,80,10,60),high.cover(biome,80,60)];
    assert.ok(ids.every(id=>defs[id]?.tex>0&&defs[id].tex<256),biome);
    assert.ok(high.produce.has(ids[3]),biome);
    assert.equal(scarce.surface(biome,80,60,4),0);
    assert.equal(scarce.ore(biome,80,10,60),0);
    assert.ok(QuimiCraftWorkshops.fishSpecies[QuimiCraftRegions.localFish(biome)],biome);
    assert.ok(QuimiCraftAI.types.includes(QuimiCraftRegions.localFauna(biome)),biome);
    [surfaces,strata,ores,plants].forEach((set,i)=>set.add(ids[i]));
  }
  assert.ok(surfaces.size>=14);
  assert.ok(strata.size>=10);
  assert.equal(ores.size,7);
  assert.equal(plants.size,9);
  assert.equal(high.surface("manguezal",80,82,-2),B.PEAT_MAT);
  assert.equal(high.surface("deserto",80,82,-2),0);
});

test("distribuição depende da seed e varia dentro do mesmo bioma",()=>{
  const a=QuimiCraftRegions.resourcePlan(B,hash,987);
  const b=QuimiCraftRegions.resourcePlan(B,hash,987);
  const c=QuimiCraftRegions.resourcePlan(B,hash,5527);
  const sample=plan=>Array.from({length:96},(_,i)=>plan.surface("floresta",i*4,15,12));
  assert.deepEqual(sample(a),sample(b));
  assert.notDeepEqual(sample(a),sample(c));
  assert.ok(sample(a).includes(B.FOREST_LOAM));
  assert.ok(sample(a).includes(0));
  const rock=defs[B.TRAVERTINE];
  const rgba=QuimiCraftRegions.paint(rock.tex,16,10,hash);
  assert.equal(rgba.length,4);
  assert.equal(rgba[3],255);
});

test("o pescado regional chega às receitas e os novos metais podem virar blocos",()=>{
  const catchAt=(biome,roll,depth=4)=>QuimiCraftWorkshops.fishingYield({biome,depth},"fishing_rod",null,()=>roll);
  assert.deepEqual(catchAt("delta salobro",.64),[["raw_sole",1]]);
  assert.deepEqual(catchAt("selva tropical",.64),[["raw_pacu",1]]);
  assert.deepEqual(catchAt("salinas",.62),[["raw_sardine",2]]);
  assert.deepEqual(catchAt("vulcânico",.73),[["raw_emberfish",1]]);
  const stations=QuimiCraftWorkshops.stationJobs(B);
  const jobs=stations.get(B.KITCHEN_STOVE),forge=stations.get(B.METAL_FORGE);
  for(const id of ["cacao_cake","bog_risotto","shellfish_broth","mint_fish","grilled_game"]){
    assert.ok(jobs.some(recipe=>recipe.out[0][0]===id),id);
    assert.ok(QuimiCraftWorkshops.food[id].hunger>20,id);
  }
  assert.ok(jobs.some(recipe=>recipe.out[0][0]==="cooked_pacu"));
  assert.deepEqual(forge.find(recipe=>recipe.out[0][0]==="cupronickel_ingot").need.slice(0,2),[["copper_ingot",2],["nickel_ingot",1]]);
  for(const id of [B.NICKEL_BLOCK,B.COBALT_BLOCK,B.CUPRONICKEL_BLOCK,B.PEWTER_BLOCK]){
    assert.ok(forge.some(recipe=>recipe.out[0][0]===id));
  }
});
