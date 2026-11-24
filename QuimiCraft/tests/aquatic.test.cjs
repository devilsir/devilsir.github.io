"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
const THREE=require("../assets/three.min.js");
require("../js/aquatic.js");
require("../js/depths.js");
require("../js/wildlife-models.js");

const {fauna}=QuimiCraftDepths;
const {fishProfile,stepStrike,pose}=QuimiCraftAquatic;

test("a fauna aquática tem perfis individuais e só fere no quadro de impacto",()=>{
  assert.ok(new Set(Object.values(fauna).map(p=>p.hp)).size===Object.keys(fauna).length);
  assert.notEqual(fishProfile("raw_trout","Truta").speed,fishProfile("raw_carp","Carpa").speed);
  assert.equal(fishProfile("raw_trout","Truta").damage,0);
  for(const [id,profile] of Object.entries(fauna)){
    const fish={profile,strike:null,cooldown:0};
    if(!profile.attack){
      assert.equal(stepStrike(fish,.035,true),null);
      assert.equal(profile.damage,0);
      continue;
    }
    const stages=new Set();
    let hits=0;
    for(let i=0;i<100;i++){
      const state=stepStrike(fish,.022,i===0);
      if(!state)continue;
      stages.add(state.stage);
      if(state.hit){
        hits++;
        assert.equal(state.stage,"strike",id);
      }
    }
    assert.equal(hits,1,id);
    assert.deepEqual([...stages],["windup","strike","recover"],id);
    assert.equal(fish.strike,null);
  }
});

test("mandíbulas, cauda e nadadeiras são animáveis em peixes e outros animais aquáticos",()=>{
  const models=QuimiCraftWildlife.create(THREE);
  const catalog=[models.fish("raw_trout",0x84aab8),
    ...Object.keys(fauna).map(id=>models.creature(id))];
  for(const model of catalog){
    assert.ok(model.jaw?.children.length);
    pose(model,.1,1);
    const initial=model.tail.rotation.toArray().slice(0,3);
    pose(model,1.7,1);
    assert.notDeepEqual(model.tail.rotation.toArray().slice(0,3),initial);
    if(model.swimStyle==="pulse"){
      assert.ok(model.jaw.scale.x>1);
      assert.ok(model.group.userData.bell.scale.x<1);
    }else{
      const resting=model.jaw.rotation.x;
      pose(model,1.7,1,{open:1,burst:0});
      assert.ok(model.jaw.rotation.x<resting);
    }
    pose(model,1.7,1,null,1);
    assert.ok(model.tail.rotation.toArray().slice(0,3).every(n=>Math.abs(n)<.1));
  }
});
