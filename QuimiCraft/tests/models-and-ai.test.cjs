"use strict";

const {test} = require("node:test");
const assert = require("node:assert/strict");
const THREE = require("../assets/three.min.js");
require("../js/entity-ai.js");
require("../js/player-models.js");

function actor(type,x=0,z=0,role=""){
  const profile=QuimiCraftAI.getProfile(type,role);
  const e={type,role,profile,x,y:10,z,persistent:!!role,dead:false};
  e.ai=QuimiCraftAI.brain(e);
  return e;
}

const still=()=>.5;
const perceived=(e,actor,visible=true)=>({actor,visible,dist:QuimiCraftAI.range(e,actor)});
function decisions(e,seconds,see){
  const states=[];
  for(let i=0;i<Math.round(seconds/.025);i++)states.push(QuimiCraftAI.tick(e,.025,see,still));
  return states;
}

test("espécies e moradores têm perfis distintos de vida, marcha e corrida",()=>{
  const golem=actor("golem"),rabbit=actor("rabbit"),guard=actor("npc_ranger",0,0,"ranger");
  for(const type of ["forest_deer","mangrove_capivara","frost_owl","glass_scorpion"])assert.ok(QuimiCraftAI.types.includes(type));
  assert.ok(golem.profile.hp>rabbit.profile.hp);
  assert.ok(golem.profile.strike.damage>guard.profile.strike.damage);
  assert.ok(rabbit.profile.run>guard.profile.run);
  assert.ok(guard.profile.run>guard.profile.walk);
});

test("criatura hostil persegue, prepara golpe e respeita o intervalo",()=>{
  const scorpion=actor("scorpion"),player=actor("player",0,5);
  const sense=()=>({enemy:perceived(scorpion,player)});
  const chase=decisions(scorpion,.4,sense).at(-1);
  assert.equal(chase.mode,"chase");
  assert.equal(chase.speed,scorpion.profile.run);
  player.z=1.7;
  const close=decisions(scorpion,1.4,sense);
  assert.ok(close.some(state=>state.mode==="windup"));
  assert.equal(close.filter(state=>state.strike).length,1);
  assert.equal(close.find(state=>state.strike).strike,player);
});

test("posições vistas são lembradas por pouco tempo, sem perseguição infinita",()=>{
  const slime=actor("slime"),player=actor("player",0,7);
  decisions(slime,.5,()=>({enemy:perceived(slime,player)}));
  player.x=6;
  const search=decisions(slime,.5,()=>({})).at(-1);
  assert.equal(search.mode,"search");
  assert.equal(search.goal.x,0);
  assert.notEqual(decisions(slime,5,()=>({})).at(-1).mode,"search");
});

test("neutro só revida após provocação e fauna assustada corre para longe",()=>{
  const cobrete=actor("cobrete"),rabbit=actor("rabbit"),player=actor("player",0,5);
  assert.equal(decisions(cobrete,.3,()=>({})).at(-1).mode,"idle");
  QuimiCraftAI.alarm(cobrete.ai,cobrete.profile,player);
  assert.equal(decisions(cobrete,.3,()=>({enemy:perceived(cobrete,player)})).at(-1).mode,"chase");
  const escape=decisions(rabbit,.3,()=>({threat:{...perceived(rabbit,player),alarming:true}})).at(-1);
  assert.equal(escape.mode,"flee");
  assert.ok(escape.goal.z<rabbit.z);
  assert.equal(escape.speed,rabbit.profile.run);
});

test("Guardiã mira em hostil e morador recua da ameaça",()=>{
  const guard=actor("npc_ranger",0,0,"ranger"),villager=actor("npc_farmer",0,0,"farmer"),mob=actor("slime",0,6);
  const actions=decisions(guard,1,()=>({enemy:perceived(guard,mob)}));
  assert.equal(actions.find(action=>action.strike).strike,mob);
  assert.equal(decisions(villager,.4,()=>({threat:{...perceived(villager,mob),alarming:true}})).at(-1).mode,"flee");
});

test("busca local contorna obstáculos e preserva a altura sugerida",()=>{
  const route=QuimiCraftAI.findPath({x:.5,y:4,z:.5},{x:5.5,y:4,z:.5},(x,z)=>{
    if(Math.floor(x)===2&&Math.abs(Math.floor(z))<2)return null;
    return x>4?5:4;
  });
  assert.ok(route.some(step=>Math.abs(Math.floor(step.z))>=2));
  assert.ok(Math.abs(route.at(-1).x-5.5)<1e-10);
  assert.equal(route.at(-1).y,5);
  assert.deepEqual(QuimiCraftAI.findPath({x:.5,y:4,z:.5},{x:5.5,y:4,z:.5},()=>null),[]);
});

test("drops básicos são garantidos e itens raros dependem do sorteio",()=>{
  const scorpion=actor("scorpion");
  const normal=QuimiCraftAI.loot(scorpion.profile,()=>.81);
  assert.deepEqual(normal,[{id:"chitin",count:2}]);
  const rare=QuimiCraftAI.loot(scorpion.profile,()=>0,id=>Number(id==="acid_gel"));
  assert.deepEqual(rare,[{id:"chitin",count:1},{id:"acid_gel",count:2}]);
});

function models(){
  return QuimiCraftModels.create(THREE,{
    blocks:{4:{tex:[2,3,4]},5:{tex:6,plant:true},6:{tex:7,partial:true}},
    block:{TORCH:12,SPECTRAL:20,FIRE:25},
    atlas:{texture:new THREE.Texture()},
    texFor:(id,side)=>id===4?side===2?2:side===3?4:3:id===5?6:7,
    uvTile:(tile,x,y)=>[(tile+x*.8)/16,y*.75],
    itemColor:()=>"#8596a8",
    shadows:()=>false
  });
}

test("miniatura usa a mesma textura de topo, base e lateral e escala por câmera",()=>{
  const kit=models();
  const first=kit.item(4,"first"),third=kit.item(4,"third");
  const block=first.children[0],mesh=block.children[0];
  assert.equal(block.userData.blockId,4);
  assert.equal(mesh.scale.x,mesh.scale.y);
  assert.ok(mesh.scale.x>third.children[0].children[0].scale.x);
  const uv=mesh.geometry.getAttribute("uv");
  assert.deepEqual([0,4,8,12,16,20].map(index=>Math.floor(uv.getX(index)*16)),[3,3,2,4,3,3]);
  assert.equal(kit.item(5,"first").children[0].children.length,2);
  const door=kit.item(6,"first").children[0].children[0];
  assert.ok(door.scale.z<door.scale.x*.3);
  assert.equal(mesh.geometry,third.children[0].children[0].geometry);
});

test("ferramenta é presa ao pulso e o arco reage à ação e à falta de flechas",()=>{
  const kit=models(),bow=kit.item("bow","first"),pick=kit.item("iron_pickaxe","third");
  kit.animateItem(bow,100,0,1,true);
  const initial=bow.userData.string[0].scale.y;
  kit.animateItem(bow,160,.9,1,false);
  assert.notEqual(bow.userData.string[0].scale.y,initial);
  assert.equal(bow.userData.arrow.visible,false);
  assert.ok(pick.children.some(mesh=>mesh.geometry.type==="ExtrudeGeometry"));
  const mat=new THREE.MeshLambertMaterial({color:0x88a888});
  const avatar=kit.avatar(Object.fromEntries(["skin","skinLight","skinShade","sleeve","coat","coatShade","pants","hair","boot"].map(key=>[key,mat])));
  assert.equal(avatar.heldThird.parent.parent.parent.parent,avatar.root);
  assert.equal(avatar.heldFirst.parent.parent,avatar.first);
  const wrist=avatar.heldThird.parent.parent;
  const rest=wrist.rotation.x;
  avatar.animate({dt:.1,now:800,motion:1,moving:true,sprint:true,crouch:false,swim:false,airborne:false,pitch:0,action:.8,firstType:"iron_sword"});
  assert.notEqual(wrist.rotation.x,rest);
});

test("a miniatura fica no quadrante inferior direito em telas largas e em retrato",()=>{
  const kit=models();
  const mat=new THREE.MeshLambertMaterial();
  for(const aspect of [16/9,9/16]){
    const avatar=kit.avatar(Object.fromEntries(["skin","skinLight","skinShade","sleeve","coat","coatShade","pants","hair","boot"].map(key=>[key,mat])));
    const first=kit.item(4,"first");
    avatar.heldFirst.add(first);
    const camera=new THREE.PerspectiveCamera(73,aspect,.07,30);
    camera.add(avatar.first);
    avatar.animate({dt:.033,now:0,motion:1,moving:false,sprint:false,crouch:false,swim:false,airborne:false,pitch:0,action:0,firstType:4,aspect});
    camera.updateMatrixWorld(true);
    const center=first.children[0].getWorldPosition(new THREE.Vector3()).project(camera);
    assert.ok(center.x>0&&center.x<1);
    assert.ok(center.y<0&&center.y>-1);
  }
});

function styleAvatar(kit=models()){
  const material=new THREE.MeshLambertMaterial();
  return kit.avatar(Object.fromEntries(["skin","skinLight","skinShade","sleeve","coat","coatShade","pants","hair","boot"].map(key=>[key,material])));
}

test("penteados e barbas se ajustam ao equipamento e retornam ao removê-lo",()=>{
  const avatar=styleAvatar();
  const tucked=avatar.root.getObjectByName("Cabelo ajustado ao equipamento");
  const beard=avatar.root.getObjectByName("Barba 5");
  assert.equal(avatar.hairStyles.length,13);
  for(const [index,hair] of avatar.hairStyles.entries()){
    avatar.setAppearance({hairStyle:index,beard:5});
    assert.equal(hair.visible,true);
    assert.equal(beard.visible,true);
    avatar.setEquipment(null,null,null,"face_shield","gas_mask");
    assert.equal(hair.visible,false);
    assert.equal(tucked.visible,index!==12);
    assert.equal(beard.visible,false);
    avatar.setEquipment(null,null,null,"iron_helmet");
    assert.equal(tucked.visible,false);
    assert.ok(avatar.hairStyles.every(group=>!group.visible));
    avatar.setEquipment();
    assert.equal(hair.visible,true);
    assert.equal(beard.visible,true);
  }
});

test("roupa, busto, calçados e insígnias funcionam na mesma malha do personagem",()=>{
  const kit=models(),avatar=styleAvatar(kit);
  avatar.setAppearance({silhouette:1,outfit:4,shoes:4,badge:3});
  const bust=avatar.root.getObjectByName("Caimento do busto");
  const outfit=avatar.root.getObjectByName("Traje 4");
  const marks=avatar.root.getObjectByName("Insígnia 3");
  assert.equal(avatar.chestFit.parent,bust.parent);
  assert.ok(bust.visible&&bust.children.length>=2&&outfit.visible);
  const shoes=[];
  avatar.root.traverse(node=>{if(node.name==="Calçado 4")shoes.push(node)});
  assert.equal(shoes.length,2);
  assert.ok(shoes.every(node=>node.visible));
  const aura=marks.getObjectByName("Halo da insígnia");
  assert.ok(marks.visible&&aura.isSprite&&aura.material.depthWrite===false);
  assert.equal(aura.material.blending,THREE.AdditiveBlending);
  assert.ok(kit.item("carbon_badge","third").getObjectByName("Halo da insígnia").isSprite);
  avatar.setEquipment(null,"iron_boots",null,null,null,"iron_chestplate");
  assert.ok(shoes.every(node=>!node.visible));
  assert.equal(outfit.visible,false);
  assert.ok(bust.visible&&avatar.chestFit.position.z<0);
  avatar.setEquipment();
  avatar.setAppearance({silhouette:0,outfit:2,shoes:1,badge:2});
  assert.equal(bust.visible,false);
  assert.equal(marks.visible,false);
  assert.equal(avatar.root.getObjectByName("Traje 2").visible,true);
});

test("cada especialidade alquímica tem roupa, cabeça e silhueta de capa próprias",()=>{
  const kit=models(),hems=[],fabrics=[],headShapes=[];
  for(const school of ["pigment","crystal","alloy","water","thermal"]){
    const root=new THREE.Group(),head=new THREE.Group();
    root.add(head);
    const cloak=kit.alchemistAttire(root,head,[],school);
    assert.equal(cloak.parent.name,"Traje alquímico "+school);
    assert.ok(cloak.parent.getObjectByName("Halo da insígnia").isSprite);
    hems.push(cloak.children[0].scale.y);
    fabrics.push(cloak.parent.children[0].material.color.getHex());
    headShapes.push(head.children.map(child=>[child.geometry.type,child.position.y,child.scale.x]).join("|"));
  }
  for(const list of [hems,fabrics,headShapes])assert.equal(new Set(list).size,5);
});

