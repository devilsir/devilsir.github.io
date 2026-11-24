
"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
const THREE=require("../assets/three.min.js");
for(const name of ["frontier","regions","habitats","alchemy-world","depths","wildlife-models","vehicle-models","vehicles","workshops"]){
  require("../js/"+name+".js");
}

const hash=(x,y,z)=>{
  const n=Math.sin(x*127.1+y*311.7+z*74.7+19.19)*43758.5453;
  return n-Math.floor(n);
};

function world(seed=106488241){
  const B={AIR:0,IRON:9,COAL:8};
  const defs={0:{tex:0},9:{tex:11},8:{tex:10}};
  QuimiCraftFrontier.register(B,defs);
  QuimiCraftRegions.register(B,defs);
  QuimiCraftHabitats.register(B,defs);
  QuimiCraftAlchemyWorld.register(B,defs);
  const existing=new Set(Object.keys(defs).map(Number));
  QuimiCraftDepths.register(B,defs);
  return {B,defs,existing,system:QuimiCraftDepths.create({B,seed,hash})};
}

test("recursos da expedição preservam os ids existentes e cabem no armazenamento de voxels",()=>{
  const {B,defs,existing}=world();
  const names=[...QuimiCraftDepths.minerals,...QuimiCraftDepths.soils,...QuimiCraftDepths.sands,"GRANITE","GNEISS","BLACK_SHALE","SUNKEN_BRICK","SUNKEN_MOSAIC","SUNKEN_BEACON"];
  assert.equal(new Set(names.map(n=>B[n])).size,19);
  for(const name of names){
    const id=B[name];
    assert.ok(Number.isInteger(id)&&id>0&&id<256&&!existing.has(id));
    assert.equal(defs[id].tex,id);
    assert.ok(QuimiCraftDepths.paint(id,12,14,hash).every(v=>v>=0&&v<=255));
  }
});

test("bacias grandes e ruínas são determinísticas e ficam longe do início",()=>{
  const {system,B}=world();
  const copy=world().system,other=world(50046).system;
  assert.equal(system.lakeAt(0,0),null);
  const search=[];
  for(let x=340;x<1100;x+=22)for(let z=340;z<1100;z+=22)search.push([x,z]);
  const lake=search.map(([x,z])=>system.lakeAt(x,z)).find(l=>l?.radius<.1);
  assert.ok(lake);
  const {x,z,rx,floor}=lake.basin;
  const center=system.lakeAt(x,z);
  assert.deepEqual(copy.lakeAt(x,z),center);
  assert.notDeepEqual(other.lakeAt(x,z),center);
  assert.ok(rx>96&&rx<182);
  assert.equal(system.lakeHeight(60,center,x,z),floor);
  assert.ok(15-floor>=10);
  assert.equal(system.ruinBlock(system.ruinAt(center,x,z),floor),B.SUNKEN_MOSAIC);
  const column=system.ruinAt(system.lakeAt(x+3,z+5),x+3,z+5);
  assert.equal(system.ruinBlock(column,floor+5),B.SUNKEN_BEACON);
  assert.equal(system.ruinBlock(column,15),0);
});

test("gemas e ferro ocupam faixas de profundidade e geologias distintas",()=>{
  const {system,B}=world();
  const deposits=(biome,y,h)=>{
    const found=new Set();
    for(let x=0;x<144;x+=3)for(let z=0;z<144;z+=3)found.add(system.ore(biome,x,y,z,h,null));
    return found;
  };
  const stone=deposits("floresta",8,31);
  assert.ok(stone.has(B.DIAMOND_ORE)&&stone.has(B.IRON)&&stone.has(B.MAGNETITE));
  assert.ok(!deposits("floresta",12,31).has(B.DIAMOND_ORE));
  assert.ok(deposits("montanha",18,35).has(B.EMERALD_ORE));
  assert.ok(deposits("vulcânico",18,35).has(B.RUBY_ORE));
  assert.ok(deposits("taiga",18,35).has(B.SAPPHIRE_ORE));
  assert.ok(deposits("termas minerais",18,35).has(B.OPAL_ORE));
});

test("fauna aquática respeita salinidade, profundidade e habitat",()=>{
  const {system}=world();
  const open={radius:.2,basin:{roll:.2}},shore={...open,radius:.66};
  assert.ok(system.eligible("taiga",open,"cold",9).includes("orca"));
  assert.ok(!system.eligible("taiga",open,"cold",6).includes("orca"));
  assert.ok(system.eligible("floresta",open,"salt",8).includes("dolphin"));
  assert.ok(!system.eligible("floresta",open,"salt",3).includes("dolphin"));
  assert.deepEqual(system.eligible("selva tropical",open,"fresh",6),["piranha"]);
  assert.ok(system.eligible("delta salobro",shore,"salt",4).includes("caiman"));
  assert.ok(!system.eligible("delta salobro",open,"salt",8).includes("caiman"));
  assert.deepEqual(system.eligible("vulcânico",open,"acid",10),[]);
  assert.deepEqual(system.eligible("selva tropical",open,"thermal",10),[]);
});

test("modelos aquáticos têm malhas, nadadeiras e caudas próprias",()=>{
  const models=QuimiCraftWildlife.create(THREE);
  const widths=new Set();
  for(const kind of Object.keys(QuimiCraftDepths.fauna)){
    const model=models.creature(kind);
    let meshes=0;
    model.group.traverse(o=>{if(o.isMesh)meshes++});
    assert.ok(meshes>8&&model.tail&&Array.isArray(model.wings));
    const bounds=new THREE.Box3().setFromObject(model.group);
    assert.ok(!bounds.isEmpty());
    widths.add(bounds.max.x-bounds.min.x);
  }
  assert.ok(widths.size>=5);
  assert.equal(models.creature("orca").verticalTail,true);
  assert.equal(models.creature("piranha").verticalTail,false);
  const fish=models.fish("raw_trout",0x72909f);
  assert.ok(fish.tail.children.some(child=>child.geometry.attributes.normal.array.some(n=>n!==0)));
});

test("os três veículos terrestres têm cabine com vidro dentro da sua altura de colisão",()=>{
  const models=QuimiCraftVehicleModels.create(THREE);
  for(const type of ["cart","drill","bucket"]){
    const cabin=models.build(type).root.getObjectByName("Cabine envidraçada");
    assert.ok(cabin);
    const windows=cabin.children.filter(part=>part.material?.transparent);
    assert.equal(windows.length,4);
    assert.ok(windows.every(part=>!part.castShadow&&!part.material.depthWrite));
    assert.ok(new THREE.Box3().setFromObject(cabin).max.y<=QuimiCraftVehicles.types[type].height+.005);
  }
  assert.equal(models.build("glider").root.getObjectByName("Cabine envidraçada"),undefined);
});

test("a forja separa redução, ligas e moldagem por etapas",()=>{
  const {B}=world();
  const jobs=QuimiCraftWorkshops.stationJobs(B).get(B.METAL_FORGE);
  const iron=jobs.find(j=>j.need.some(([id])=>id===B.MAGNETITE));
  const bronze=jobs.find(j=>j.out[0][0]==="bronze_ingot");
  const mold=jobs.find(j=>j.section==="mold");
  assert.equal(iron.section,"smelt");
  assert.equal(iron.out[0][0],"iron_ingot");
  assert.equal(bronze.section,"alloy");
  assert.ok(bronze.seconds>iron.seconds&&mold.seconds<iron.seconds);
});

