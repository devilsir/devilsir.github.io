"use strict";

const {test} = require("node:test");
const assert = require("node:assert/strict");
const THREE = require("../assets/three.min.js");
require("../js/laboratory-door.js");
require("../js/inventory-transaction.js");
require("../js/player-input.js");
require("../js/world-storage.js");
require("../js/terrain.js");

test("folhas centradas e inteiramente abaixo da bandeira de vidro", () => {
  const lab = QuimiCraftLaboratoryDoor.create(THREE, {cx: -6, cz: -6, y: 44, halfD: 14});
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial();
  lab.attach(group, {metal: material, teal: material, glass: material, brass: material});
  const bounds = new THREE.Box3().setFromObject(group);
  assert.equal(bounds.min.x, lab.minX);
  assert.equal(bounds.max.x, lab.maxX);
  assert.ok(bounds.max.y < lab.floor + lab.height);
  assert.equal(lab.cells.length, 12);
  assert.equal((lab.minX + lab.maxX) / 2, -6);
});

test("a colisão acompanha as folhas e o batente ocupado impede fechar", () => {
  const lab = QuimiCraftLaboratoryDoor.create(THREE, {cx: -6, cz: -6, y: 44, halfD: 14});
  const threshold = {x: lab.center, y: lab.floor, z: lab.plane, radius: .29, height: 1.72};
  const hitsCenter = () => lab.hits(-6.29, -5.71, 44.02, 45.7, lab.plane-.29, lab.plane+.29);
  assert.equal(hitsCenter(), true);
  assert.equal(lab.toggle([]), true);
  assert.equal(hitsCenter(), true);
  for (let i = 0; i < 30; i++) lab.update(.02, []);
  assert.equal(hitsCenter(), false);
  assert.equal(lab.hits(-4.3,-4.02,44.02,45.7,lab.plane+.5,lab.plane+1.2), true);
  assert.equal(lab.toggle([threshold]), null);
  assert.equal(lab.toggle([]), false);
  assert.equal(lab.update(.016,[threshold]),true);
  assert.equal(lab.isOpen,true);
});

test("velocidade da porta independe da divisão dos quadros", () => {
  const layout = {cx: -6, cz: -6, y: 44, halfD: 14};
  const fast = QuimiCraftLaboratoryDoor.create(THREE, layout);
  const slow = QuimiCraftLaboratoryDoor.create(THREE, layout);
  fast.toggle([]);
  slow.toggle([]);
  for (let i=0; i<12; i++) fast.update(.01, []);
  for (let i=0; i<3; i++) slow.update(.04, []);
  assert.ok(Math.abs(fast.angle-slow.angle)<1e-10);
});

test("inventário cheio torna a reação indivisível", () => {
  const slots = [{id:"água",count:3},{id:"ferro",count:2},{id:"pedra",count:1}];
  const need = [["água",2],["ferro",1]];
  const out = [["oxigênio",1],["hidrogênio",2]];
  assert.deepEqual(QuimiCraftInventory.plan(slots,need,out),{ok:false,reason:"full"});
  assert.equal(slots[0].count,3);
  const plan = QuimiCraftInventory.plan([...slots,null,null],need,out);
  assert.equal(plan.ok,true);
  assert.deepEqual(plan.slots.slice(-2),[{id:"oxigênio",count:1},{id:"hidrogênio",count:2}]);
});

test("retorna o recipiente e agrega o consumo de reagentes repetidos", () => {
  const slots = [{id:"water_cup",count:2,liquid:{id:"fresh"}},{id:"ore",count:1},null];
  const profiles = {water:["fresh"]};
  const plan = QuimiCraftInventory.plan(slots,[["water",1],["ore",1]],[["product",1]],profiles);
  assert.equal(plan.ok,true);
  assert.deepEqual(plan.slots.map(item=>[item.id,item.count]),[["water_cup",1],["cup",1],["product",1]]);
  assert.equal(QuimiCraftInventory.plan(slots,[["ore",1],["ore",1]],[]).reason,"missing");
  assert.equal(QuimiCraftInventory.plan(slots,[["ore",1]],[],profiles,[["ore",1]]).reason,"reserved");
});

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}

test("recuperação local preserva todas as edições, metadados e remoções", async () => {
  const entries = Array.from({length:18010},(_,i)=>[i+"|2|1",3]);
  const doors = Array.from({length:508},(_,i)=>[i+"|3|1",{axis:0,half:0}]);
  const local = storage({qc_mods:JSON.stringify(entries),qc_doors:JSON.stringify(doors)});
  const create = () => QuimiCraftWorldStorage.create({storage:local,seed:3,chunkSize:16,onError:()=>{}});
  const original = create();
  await original.load();
  assert.equal(original.maps.mods.size,18010);
  assert.equal(original.maps.doors.size,508);
  original.maps.mods.delete("0|2|1");
  original.maps.fluids.set("1|4|1",7);
  await original.flush();
  const reloaded = create();
  await reloaded.load();
  assert.equal(reloaded.maps.mods.size,18009);
  assert.equal(reloaded.maps.mods.get("18009|2|1"),3);
  assert.equal(reloaded.maps.mods.has("0|2|1"),false);
  assert.equal(reloaded.maps.fluids.get("1|4|1"),7);
});

test("backup inclui progresso e importação inválida preserva o mundo ativo", async () => {
  const local = storage({qc_world_seed:"23",qc_inventory:"[]"});
  const create = () => QuimiCraftWorldStorage.create({storage:local,seed:23,chunkSize:16,onError:()=>{}});
  const world = create();
  await world.load();
  world.maps.mods.set("50|22|-1",3);
  const backup = world.exportWorld();
  await assert.rejects(world.importWorld({...backup,version:20}, Number.isInteger,96));
  assert.equal(local.getItem("qc_world_slot"),null);
  await world.importWorld(backup, value=>value===3,96);
  const restored = create();
  await restored.load();
  assert.equal(restored.maps.mods.get("50|22|-1"),3);
  assert.equal(local.getItem("qc_inventory"),"[]");
});

test("recusa do mouse ativa o arraste e libera navegação pelas setas", async () => {
  const canvas = new EventTarget();
  const document = new EventTarget();
  canvas.requestPointerLock=()=>Promise.reject(new Error("recusa simulada"));
  const history=[];
  const input = QuimiCraftInput.create({
    canvas, document, touch:false, canPlay:()=>true, isPlaying:()=>true, onPlay:mode=>history.push(mode),
    onPause:()=>{}, onFallback:()=>history.push("aviso"), look:(...args)=>history.push(args),
    attack:()=>{}, use:()=>{}
  });
  input.request();
  await Promise.resolve();
  input.turn({ArrowRight:true},.1);
  assert.equal(input.mode,"drag");
  assert.deepEqual(history,["drag","aviso",[64,0,.0042]]);
});

test("terreno preserva o determinismo por seed e coordenada", () => {
  const options = {
    WORLD_SEED:106488241,VILLAGE:{x:48,z:-22,base:18},BLOCK:{AIR:0},MAX_Y:96,WATER_LEVEL:15,
    inVillage:(x,z,m=0)=>Math.abs(x-48)<=27+m&&Math.abs(z+22)<=27+m,ckey:(x,z)=>x+","+z,
    hash:(x,y=0,z=0)=>{const n=Math.sin(x*127.1+y*311.7+z*74.7+19.19)*43758.5453;return n-Math.floor(n)},
    clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),lerp:(a,b,s)=>a+(b-a)*s,smooth:n=>n*n*(3-2*n)
  };
  const map = QuimiCraftTerrain.create(options);
  const other = QuimiCraftTerrain.create(options);
  const coordinates = [[0,0],[-6,-20],[48,-22],[509,620],[-750,-950]];
  assert.deepEqual(coordinates.map(p=>map.terrainHeight(...p)),coordinates.map(p=>other.terrainHeight(...p)));
  assert.equal(map.terrainHeight(48,-22),18);
});

test("mirar a fresta central reconhece a porta fechada", () => {
  const lab = QuimiCraftLaboratoryDoor.create(THREE, {cx:-6,cz:-6,y:44,halfD:14});
  const material = new THREE.MeshBasicMaterial();
  lab.attach(new THREE.Group(), {metal:material,teal:material,glass:material,brass:material});
  const ray = new THREE.Raycaster(new THREE.Vector3(lab.center,45.6,lab.plane-2),new THREE.Vector3(0,0,1),0,6);
  assert.equal(lab.aim(ray,6),true);
  assert.equal(lab.aim(ray,1.8),false);
});

test("módulo científico confere espaço antes de consumir insumos", () => {
  const {readFileSync}=require("node:fs");
  const {runInNewContext}=require("node:vm");
  const window={};
  runInNewContext(readFileSync(require.resolve("../js/science-core.js"),"utf8"),{window});
  const local = storage();
  let slots=[{id:"acid",count:2},{id:"alkali",count:2},{id:"beaker",count:1}];
  const science=window.QuimiCraftScience.createScienceSystem({
    storage:local,
    countItem:id=>slots.reduce((sum,item)=>sum+(item?.id===id?item.count:0),0),
    exchangeItems:(need,out,reserved,preview)=>{
      const plan=QuimiCraftInventory.plan(slots,need,out,{},reserved);
      if(plan.ok&&!preview)slots=plan.slots;
      return {ok:plan.ok,message:plan.reason};
    }
  });
  const before=JSON.stringify(slots);
  assert.equal(science.reactionAvailability("neutralization_lab","chemistry_workbench",[]).ok,false);
  assert.equal(science.performReaction("neutralization_lab","chemistry_workbench",[]).ok,false);
  assert.equal(JSON.stringify(slots),before);
  slots.push(null,null);
  assert.equal(science.reactionAvailability("neutralization_lab","chemistry_workbench",[]).ok,true);
});
