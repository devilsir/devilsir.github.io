
"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
const THREE=require("../assets/three.min.js");
for(const name of ["frontier","regions","settlements","npc-looks","biome-fauna","wildlife-models","mob-spawn","entity-ai"]){
  require("../js/"+name+".js");
}

const B={AIR:0,DOOR:13,PLANK:11,IRON:9,CLAY:23,STONE:3,COAL:8,COPPER:17,TIN:27,ZINC:28,RED_SAND:32,SAND:4,
  CERAMIC:42,SLATE:51,LEAVES:6,GLASS:19,VILLAGE_BRICK:59,LIMESTONE:50,TALL_GRASS:44,DIRT:2,BRONZE_BLOCK:43,MOSS:31,TORCH:12,PINE_LOG:34};
QuimiCraftFrontier.register(B,{});
QuimiCraftRegions.register(B,{});
const hash=(x,y,z)=>{const v=Math.sin(x*127.1+y*311.7+z*74.7+19.19)*43758.5453;return v-Math.floor(v)};
const worldSeed=106488241;
const village=biome=>QuimiCraftSettlements.create({
  B,seed:worldSeed,hub:{x:880,z:880,base:30,version:3},biome:()=>biome,hash
}).main();

test("moradores têm aparência reprodutível e as crianças têm proporções e roupas próprias",()=>{
  const villagers=village("taiga").people,kids=villagers.filter(p=>p.age==="child");
  const looks=person=>QuimiCraftNPCLooks.describe(worldSeed,person.id,{
    age:person.age,culture:person.culture,scale:person.scale,color:0x8f8f8f
  });
  assert.equal(kids.length,8);
  assert.equal(new Set(kids.map(p=>p.interest)).size,4);
  assert.equal(new Set(villagers.map(p=>p.id)).size,villagers.length);
  assert.equal(new Set(villagers.map(p=>JSON.stringify(looks(p)))).size,villagers.length);
  const child=kids[0],style=looks(child);
  assert.deepEqual(style,looks(village("taiga").people.find(p=>p.id===child.id)));
  assert.ok(kids.every(p=>looks(p).scale<.7&&looks(p).child&&!looks(p).beard));
  assert.ok(new Set(villagers.map(p=>looks(p).hair)).size>3);
  assert.ok(new Set(villagers.map(p=>looks(p).width)).size>3);
  assert.ok(kids.every(p=>["hoodie","overalls","vest"].includes(looks(p).attire)));
});

test("fauna regional e criaturas hostis têm tabelas distintas por habitat",()=>{
  const {ambient,hostile,pets,species}=QuimiCraftBiomeFauna;
  assert.deepEqual(pets,["cat","dog"]);
  assert.ok(ambient("selva tropical").includes("jaguar")&&ambient("selva tropical").includes("tiger"));
  assert.ok(ambient("savana").includes("lion"));
  assert.ok(ambient("taiga").includes("wolf")&&ambient("taiga").includes("brown_bear"));
  assert.ok(ambient("floresta").includes("black_bear"));
  assert.ok(ambient("tundra").includes("polar_bear")&&!ambient("selva tropical").includes("polar_bear"));
  assert.ok(hostile("manguezal",false).includes("bog_revenant")&&hostile("vulcânico",false).includes("basalt_husk"));
  assert.ok(hostile("planície",true).includes("cave_shade")&&!hostile("planície",false).includes("cave_shade"));
  for(const [id,d] of Object.entries(species))assert.equal(QuimiCraftAI.getProfile(id),d.profile);
});

test("as espécies regionais têm rig quadrúpede, malhas e silhuetas distintas",()=>{
  const builder=QuimiCraftWildlife.create(THREE);
  const attachLeg=(parent,rig,x,y,z)=>{
    const node=new THREE.Group(),foot=new THREE.Group();
    node.position.set(x,y,z);node.userData.lower=foot;node.add(foot);parent.add(node);
    rig.legs.push(node);
  };
  const sizes=new Set();
  for(const [id,entry] of Object.entries(QuimiCraftBiomeFauna.species)){
    if(entry.shape==="fantasy")continue;
    const parent=new THREE.Group(),rig={legs:[],tails:[]};
    builder.regional(id,entry,parent,rig,attachLeg,.44);
    assert.equal(rig.legs.length,4);
    assert.equal(rig.tails.length,1);
    assert.ok(rig.head&&rig.body);
    const size=new THREE.Box3().setFromObject(parent).getSize(new THREE.Vector3());
    assert.ok(size.y>.4&&size.z>.7,id);
    sizes.add(size.toArray().map(n=>n.toFixed(2)).join(","));
  }
  assert.ok(sizes.size>=10);
});

test("luz direta, sombra e emissores são avaliados antes do surgimento",()=>{
  const {lightLevel,civilTwilight}=QuimiCraftMobSpawn;
  const point={x:0,y:12,z:0},torch={x:4,y:12,z:0,power:13};
  assert.ok(civilTwilight(.25)>10&&civilTwilight(.75)<=5);
  assert.ok(lightLevel(point,.25,1,[],()=>true)>10);
  assert.equal(lightLevel(point,.25,0,[],()=>true),0);
  assert.equal(lightLevel(point,.75,0,[torch],()=>true),9);
  assert.equal(lightLevel(point,.75,0,[torch],()=>false),0);
});

test("mobs têm limite por configuração e intervalo local mesmo após morrerem",()=>{
  const {create}=QuimiCraftMobSpawn;
  const p={x:0,y:10,z:0},dark={x:17,y:10,z:0,light:0};
  const d=create(16,()=>0),calls=[];
  const spawn=(kind,eligible,record)=>{
    if(kind!=="hostile"||!eligible(dark))return;
    calls.push(kind);record(dark);
  };
  assert.equal(d.eligible({...dark,protected:true},p,[],2),false);
  assert.equal(d.eligible({...dark,x:4},p,[],2),false);
  assert.equal(d.eligible({...dark,light:6},p,[],2),false);
  assert.equal(d.eligible(dark,p,[{x:22,y:10,z:0,hostile:true},{x:15,y:10,z:7,hostile:true}],2),false);
  for(let t=0;t<31;t++)d.tick(1,1,p,[],spawn);
  assert.equal(calls.length,1);
  for(let t=0;t<18;t++)d.tick(1,1,p,[],spawn);
  assert.equal(calls.length,2);
  for(let t=0;t<40;t++)d.tick(1,1,p,[{...dark,hostile:true},{...dark,x:24,hostile:true}],spawn);
  assert.equal(calls.length,2);
  assert.equal(create(16).eligible(dark,p,[],0),false);
});

