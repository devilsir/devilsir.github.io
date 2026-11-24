"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
const THREE=require("../assets/three.min.js");
require("../js/dragons.js");
require("../js/wildlife-models.js");
require("../js/creature-poses.js");

const attach=(parent,rig,x,z,y)=>{
  const joint=new THREE.Group(),lower=new THREE.Group();
  joint.position.set(x,y,z);lower.position.y=-.26;
  joint.userData.lower=lower;joint.add(lower);parent.add(joint);rig.legs.push(joint);
  return joint;
};
const joints=()=>({legs:[],wings:[],tails:[],eyes:[],arms:[]});

test("cada dragão tem habitat, temperamento e articulações de voo próprias",()=>{
  const {species,profile,regional}=QuimiCraftDragons,models=QuimiCraftWildlife.create(THREE);
  const shapes=new Set();
  for(const [id,d] of Object.entries(species)){
    const group=new THREE.Group(),rig=joints();
    models.dragon(d,group,rig,attach);
    assert.equal(rig.wings.length,2);
    assert.equal(rig.legs.length,4);
    assert.equal(rig.tails.length,1);
    assert.equal(rig.nose.parent,rig.head);
    assert.equal(rig.jaw.parent,rig.head);
    for(const wing of rig.wings){
      assert.equal(wing.userData.tip.parent,wing);
      let parts=0;wing.traverse(node=>{if(node.isMesh)parts++});
      assert.ok(parts>=24);
    }
    const size=new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());
    assert.ok(size.x>4.75&&size.z>2.9,id);
    shapes.add(size.toArray().map(x=>x.toFixed(2)).join("/"));
    assert.ok(regional(d.regions[0]).includes(id));
    assert.ok(profile(d).hp>70);
  }
  assert.equal(shapes.size,5);
  assert.equal(species.nature_dragon.strike,null);
  assert.equal(species.fire_dragon.temperament,"hostile");
  assert.equal(species.earth_dragon.temperament,"hostile");
  assert.equal(species.ice_dragon.temperament,"neutral");
  assert.equal(species.time_dragon.strike.element,"time");
});

test("dragões dobram asas em terra, caminham em diagonais e abrem a mandíbula no ataque",()=>{
  const models=QuimiCraftWildlife.create(THREE),g=new THREE.Group(),rig=joints();
  models.dragon(QuimiCraftDragons.species.earth_dragon,g,rig,attach);
  const step=(frame)=>QuimiCraftCreaturePoses.dragon(rig,{now:850,dt:.5,...frame});
  step({flight:false});
  const folded=Math.abs(rig.wings[1].rotation.y);
  assert.ok(folded>.85);
  step({flight:false,stride:1,gait:Math.PI/2});
  assert.ok(Math.abs(rig.legs[0].rotation.x)>.40);
  assert.ok(rig.legs[0].rotation.x*rig.legs[1].rotation.x<0);
  step({flight:true,charge:1});
  assert.ok(Math.abs(rig.wings[1].rotation.y)<folded*.65);
  assert.ok(rig.jaw.rotation.x<-.5);
});

test("cervo tem pescoço contínuo, pernas articuladas, galhadas e manchas juvenis",()=>{
  const models=QuimiCraftWildlife.create(THREE),group=new THREE.Group(),rig=joints();
  models.deer(group,rig,attach,"deer");
  assert.equal(rig.legs.length,4);
  assert.ok(rig.legs.every(leg=>leg.children.some(p=>p.isMesh)&&leg.userData.lower.children.length>=3));
  assert.ok(rig.horns.every(horn=>horn.children.length>=3));
  assert.equal(rig.youngFeatures[0].visible,false);
  assert.ok(rig.youngFeatures[0].children.length>=12);
});
