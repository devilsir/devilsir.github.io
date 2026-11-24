
"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
const THREE=require("../assets/three.min.js");
global.window=globalThis;
for(const name of ["arsenal","entity-ai","player-models","wildlife-models","science-core"]){
  require("../js/"+name+".js");
}
delete global.window;
const {createTraversal,findPath}=QuimiCraftAI;

function terrain(columns,ceilings=[],danger=[]){
  const solid=(x,y,z)=>{
    const cell=Math.floor(x)+","+Math.floor(z),height=columns.get(cell)??9;
    return y<height||ceilings.some(([key,level])=>key===cell&&y>=level&&y<level+1);
  };
  const blocked=(e,x,z,y)=>{
    for(let ix=Math.floor(x-e.radius);ix<=Math.floor(x+e.radius);ix++){
      for(let iy=Math.floor(y+.024);iy<=Math.floor(y+e.height+.024);iy++){
        for(let iz=Math.floor(z-e.radius);iz<=Math.floor(z+e.radius);iz++){
          if(solid(ix+.5,iy+.5,iz+.5))return true;
        }
      }
    }
    return false;
  };
  const hazard=(e,x,y,z)=>danger.includes(Math.floor(x)+","+Math.floor(z));
  return createTraversal({solid,blocked,hazard});
}
const ox={radius:.61,height:1.65},hare={radius:.28,height:.72};
const low={x:.5,y:9,z:.5},high={x:1.5,y:10,z:.5},limits={up:1,down:2};

test("animais pesados sobem e descem um degrau com destino e contorno válidos",()=>{
  const navigation=terrain(new Map([["1,0",10],["2,0",10]]));
  assert.equal(navigation.edge(ox,{...low,x:.36},.36,1.5,limits,ox.radius),9);
  assert.equal(navigation.edge(ox,{...low,x:.36},1.69,.5,limits,ox.radius),10);
  assert.equal(navigation.edge(ox,{...high,x:1.70},.33,.5,limits,ox.radius),9);
  assert.equal(navigation.standing(ox,.414,.5,10,8,ox.radius),10);
  assert.equal(navigation.standing(ox,.384,.5,10,8,ox.radius),9);
  const from={...low,x:.36},to={...high,x:1.69};
  assert.deepEqual(navigation.hopPoint(from,to,0),from);
  assert.deepEqual(navigation.hopPoint(from,to,1),to);
  assert.equal(navigation.hopPoint(from,to,.39).y,10);
  assert.equal(navigation.hopPoint(from,to,.39).x,from.x);
});

test("saltos grandes exigem espécie capaz, teto livre e terreno sem perigo",()=>{
  const steps=new Map([["1,0",11],["2,0",11],["3,0",5]]);
  assert.equal(terrain(steps).edge(hare,low,1.5,.5,limits,hare.radius),null);
  assert.equal(terrain(steps).edge(hare,low,1.5,.5,{up:2,down:3},hare.radius),11);
  assert.equal(terrain(steps,[["0,0",10]]).edge(hare,low,1.5,.5,{up:2,down:3},hare.radius),null);
  assert.equal(terrain(steps,[],["1,0"]).edge(hare,low,1.5,.5,{up:2,down:3},hare.radius),null);
  assert.equal(terrain(steps).edge(hare,{x:2.5,y:11,z:.5},3.5,.5,limits,hare.radius),null);
});

test("a rota procura outro caminho quando a passagem direta passa por um desnível grande",()=>{
  const nav=terrain(new Map([["1,0",13],["2,0",13],["3,0",10],["3,1",10]]));
  const goal={x:3.5,y:10,z:.5};
  const path=findPath(low,goal,(x,z,y,from)=>nav.edge(hare,from,x,z,limits,hare.radius));
  assert.deepEqual(path.at(-1),goal);
  assert.ok(path.some(p=>p.z!==.5));
  assert.ok(path.some(p=>p.y===10));
});

test("armas da bancada, balestra e escudos têm receitas e reparos registrados",()=>{
  const B={PLANK:11,OBSIDIAN:25,BAMBOO:117,SAPPHIRE_ORE:179,ICE:54,OPAL_ORE:180,FLUORITE:149};
  const {weapons,recipes,shieldRecipes,focusRecipes}=QuimiCraftArsenal;
  const list=recipes(B);
  for(const id of ["dagger","longsword","greatsword","scimitar","mace","wand","crossbow"]){
    assert.equal(list.filter(recipe=>recipe.out[0]===id).length,1,id);
  }
  assert.match(weapons.iron_sword.name,/espada curta/i);
  assert.ok(weapons.dagger.reach<weapons.iron_sword.reach&&weapons.longsword.reach>weapons.iron_sword.reach);
  assert.ok(weapons.greatsword.twoHanded&&weapons.greatsword.targets>weapons.scimitar.targets);
  assert.ok(weapons.mace.slow>0&&weapons.wand.mana<weapons.wind_staff.mana);
  for(const {need,out:[id,count]} of list){
    assert.ok(need.length<=4&&need.every(([k,n])=>(typeof k==="number"||k===k.toLowerCase())&&n>=1));
    assert.equal(count,1);
    assert.ok(QuimiCraftScience.equipmentDefinitions[id].repair.length>0);
  }
  assert.ok(weapons.bronze_sword.cooldown<weapons.iron_sword.cooldown);
  assert.ok(weapons.steel_bow.speed>weapons.bow.speed);
  assert.ok(weapons.frost_staff.slow>0);
  assert.equal(weapons.crossbow.ammo,"bolt");
  assert.deepEqual(shieldRecipes(B).map(row=>row.out[0]),["shield_oval","shield_tower","shield_dragon"]);
  for(const {out:[id]} of shieldRecipes(B))assert.equal(QuimiCraftScience.equipmentDefinitions[id].slot,"offhand");
  assert.ok(QuimiCraftScience.equipmentDefinitions.shield_dragon.dragonGuard>.5);
  assert.deepEqual(focusRecipes(B).map(recipe=>recipe.out[0]),["grimoire","resonant_orb"]);
  for(const {out:[id]} of focusRecipes(B)){
    assert.equal(QuimiCraftScience.equipmentDefinitions[id].slot,"offhand");
    assert.ok(QuimiCraftScience.equipmentDefinitions[id].repair.length>0);
  }
});

test("as armas têm modelos distintos e preservam a empunhadura e as animações",()=>{
  const models=QuimiCraftModels.create(THREE,{
    blocks:{},block:{},atlas:{texture:new THREE.Texture()},texFor:()=>0,uvTile:()=>[0,0],itemColor:()=>"#785d37",shadows:()=>false
  });
  const signatures=new Set();
  for(const [id,w] of Object.entries(QuimiCraftArsenal.weapons)){
    if(!w.style)continue;
    const model=models.item(id,"first");
    models.animateItem(model,1200,.55,1,false);
    let meshes=0;
    model.traverse(obj=>{if(obj.isMesh)meshes++});
    const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
    assert.ok(meshes>=8&&(w.family==="crossbow"?size.x>1&&size.z>.8:size.y>(w.style==="wand"?.50:w.style==="dagger"?.63:.70)),id);
    signatures.add(meshes+"/"+size.toArray().map(value=>value.toFixed(3)).join("/"));
    if(w.family==="bow"||w.family==="crossbow"){
      assert.equal(model.userData.string.length,2);
      assert.equal(model.userData.arrow.visible,false);
    }
    if(w.family==="staff")assert.ok(model.userData.core&&(w.style==="wand"||model.userData.rings.length>0));
  }
  assert.equal(signatures.size,Object.values(QuimiCraftArsenal.weapons).filter(weapon=>weapon.style).length);
  const book=models.item("grimoire","first"),orb=models.item("resonant_orb","first");
  assert.ok(new THREE.Box3().setFromObject(book).getSize(new THREE.Vector3()).x>.43);
  assert.ok(orb.userData.core&&orb.userData.rings.length===2);
  const guards=Object.keys(QuimiCraftArsenal.shields).map(id=>models.item(id,"catalog"));
  const guardSizes=guards.map(model=>new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3()));
  assert.ok(guardSizes.every(({x,y,z})=>x>.38&&y>.54&&z>.16));
  assert.equal(new Set(guards.map(model=>model.children[0].geometry)).size,3);
});

test("peixes e criaturas oceânicas usam silhuetas facetadas com cor por vértice",()=>{
  const models=QuimiCraftWildlife.create(THREE);
  for(const specimen of [models.fish("raw_trout",0x84aab8),models.creature("caiman"),models.creature("orca"),models.creature("dolphin")]){
    const hull=specimen.group.children.find(o=>o.isMesh&&o.geometry.getAttribute("color"));
    assert.ok(hull&&hull.geometry.index.count>200);
    const {normal,position}=hull.geometry.attributes;
    assert.equal(normal.count,position.count);
    assert.ok(normal.array.every(Number.isFinite));
    assert.ok(specimen.tail.children.length>=2);
  }
  assert.ok(models.creature("caiman").group.userData.jaw);
  assert.ok(models.creature("jelly").group.userData.bell);
});


test("a IA continua a perseguição quando o alvo próximo está em outro nível",()=>{
  const mob={type:"golem",x:.5,y:9,z:.5,persistent:false};
  mob.profile=QuimiCraftAI.getProfile(mob.type);
  mob.ai=QuimiCraftAI.brain(mob);
  const target={x:1.05,y:11,z:.5,dead:false};
  const decision=QuimiCraftAI.tick(mob,.24,()=>({enemy:{actor:target,dist:.55,visible:true}}),()=>.5);
  assert.equal(decision.mode,"chase");
  assert.equal(mob.ai.swing,null);
  assert.equal(decision.goal.y,11);
});

