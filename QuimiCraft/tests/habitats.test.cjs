"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
require("../js/frontier.js");
require("../js/regions.js");
require("../js/habitats.js");
require("../js/settlements.js");
require("../js/laboratory-layout.js");
require("../js/entity-ai.js");

const B={AIR:0,DOOR:13,SLATE:51,MARBLE:37,ALCHEMY_BRICK:41,PLANK:11,GLASS:19,PINE_LOG:34,WATER:61};
const defs={};
QuimiCraftFrontier.register(B,defs);
QuimiCraftRegions.register(B,defs);
QuimiCraftHabitats.register(B,defs);
const Q=QuimiCraftHabitats;
const hash=(x,y,z)=>{
  const n=Math.sin(x*127.1+y*311.7+z*74.7+19.19)*43758.5453;
  return n-Math.floor(n);
};
const cases=[["pântano","amber"],["floresta","lumen"],["tundra","glacial"],["termas minerais","terrace"],["chapadas ocres","iron"]];

test("sub-biomas selecionam recursos próprios, respeitam áreas protegidas e cabem no atlas",()=>{
  for(const [biome,kind] of cases){
    const zone=Q.create({B,hash:()=>.99,noise:{n2:()=>.17},seed:5178,biomeAt:()=>biome,waterLevel:15,excluded:(x,z)=>x===5&&z===6});
    assert.equal(zone.at(31,31),kind);
    assert.equal(zone.at(5,6),null);
    assert.equal(zone.surface(kind,31,31,18),B[Q.profiles[kind].soil]);
    assert.equal(zone.ore(kind,31,10,31),B[Q.profiles[kind].vein]);
    const plant=zone.vegetation(kind,31,31,18);
    assert.equal(plant,B[Q.profiles[kind].plant]);
    assert.equal(defs[plant].solid,false);
    assert.ok(defs[plant].tex<=255);
    assert.ok(zone.fauna(kind,false).length);
    assert.ok(zone.fauna(kind,true).length);
    assert.ok(Array.from({length:32},(_,y)=>Q.paint(defs[plant].tex,16,y,hash)).some(pixel=>pixel[3]===0));
  }
});

test("edifícios públicos da vila têm lotes livres, acessos, moradores e estações de ofício",()=>{
  const display={floresta:["orchard","lookout"],manguezal:["quay","orchard"],deserto:["cistern","market"],tundra:["lookout","orchard"],vulcânico:["kiln","cistern"]};
  for(const [biome,expected] of Object.entries(display)){
    const engine=QuimiCraftSettlements.create({B,seed:5178,hub:{version:3,x:156,z:70,base:20},biome:()=>biome,hash});
    const district=engine.main();
    assert.deepEqual(district.civic.map(b=>b.civic),expected);
    assert.equal(district.buildings.filter(b=>b.shop).length,5);
    for(const lot of district.civic){
      const expert=district.people.find(p=>p.civic===lot.civic);
      assert.equal(expert.y,lot.y+1);
      assert.ok(district.road.has(Math.floor(lot.frontX)+","+Math.floor(lot.frontZ)));
      assert.equal(engine.blockAt(lot.doorX,lot.y+1,lot.doorZ),B.DOOR);
      assert.equal(engine.doorAt(lot.doorX,lot.y+2,lot.doorZ).half,1);
      assert.equal(district.floor.get(lot.x+","+lot.z).y,lot.y);
      assert.ok(district.buildings.filter(other=>other!==lot).every(other=>Math.abs(other.x-lot.x)>other.width+lot.width||Math.abs(other.z-lot.z)>other.depth+lot.depth));
    }
  }
});

test("as três trilhas do laboratório apontam para alas distintas com borda estrutural",()=>{
  const layout={cx:-6,cz:-6,halfW:18,halfD:14};
  const floor=QuimiCraftLaboratory.floorBlock;
  assert.equal(floor(layout,B,-17,-8),B.LAB_GUIDE_GOLD);
  assert.equal(floor(layout,B,2,-8),B.LAB_GUIDE_GREEN);
  assert.equal(floor(layout,B,-16,-3),B.LAB_GUIDE_BLUE);
  assert.equal(floor(layout,B,-24,-3),B.SLATE);
  assert.equal(floor(layout,B,-6,-6),B.ALCHEMY_BRICK);
});

test("fauna regional tem valores próprios e volta ao território depois de perder o perigo de vista",()=>{
  const A=QuimiCraftAI;
  const profiles=[...new Set(Object.values(Q.profiles).flatMap(p=>[...p.residents,...p.night]))].map(id=>A.getProfile(id,""));
  assert.equal(profiles.length,6);
  assert.equal(new Set(profiles.map(p=>p.hp)).size,6);
  assert.ok(profiles.every(p=>p.run>p.walk&&p.loot.length>0));
  const profile=A.getProfile("rime_fox","");
  const e={x:profile.roam*1.2,y:20,z:0,profile,habitat:"glacial",persistent:false,ai:A.brain({x:0,y:20,z:0})};
  const returned=A.tick(e,.05,()=>({}),()=>.65);
  assert.equal(returned.mode,"return");
  assert.deepEqual(returned.goal,{x:0,y:20,z:0});
  assert.ok(returned.speed>profile.walk);
});

