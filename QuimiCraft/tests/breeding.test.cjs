"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
require("../js/breeding.js");

const {create,childhood}=QuimiCraftBreeding;
const actor=(type,x=0,extra={})=>({type,x,y:20,z:0,ai:{recovering:0},...extra});
const visible=()=>true;
const feed=(world,mob,food)=>world.feed(mob,world.offer(mob,food));

test("cada adulto precisa da comida certa, procura um par da mesma espécie e tem intervalo após o nascimento",()=>{
  const world=create(),a=actor("cow"),b=actor("cow",1.5),sheep=actor("sheep",1);
  assert.equal(world.offer(a,"carrot"),null);
  assert.deepEqual(world.offer(a,"wheat"),{kind:"feed",count:1});
  feed(world,a,"wheat");feed(world,sheep,"wheat");
  assert.equal(world.mate(a,[b,sheep],visible),null);
  feed(world,b,"wheat");
  assert.equal(world.mate(a,[b,sheep],()=>false),null);
  assert.equal(world.mate(a,[b,sheep],visible),b);
  assert.equal(world.born(a,b,{x:.75,y:20,z:0}).type,"cow");
  assert.equal(world.born(a,b,{x:.75,y:20,z:0}),null);
  assert.deepEqual(world.offer(a,"wheat"),{kind:"cooldown",seconds:300});
  world.tick(300);
  assert.equal(world.offer(a,"wheat").kind,"feed");
  feed(world,a,"wheat");
  world.tick(31);
  assert.equal(world.ready(a),false);
});

test("crescimento e intervalo de moradores continuam depois de restaurar o mundo",()=>{
  const world=create(),a=actor("npc_villager",0,{community:"village:a",resident:{id:"a"}}),
    b=actor("npc_farmer",1,{community:"village:a",resident:{id:"b"}}),
    c=actor("npc_alchemist",1,{community:"office:b",resident:{id:"c"}});
  assert.deepEqual(world.offer(a,"bread"),{kind:"feed",count:3});
  assert.deepEqual(world.offer(a,"carrot"),{kind:"feed",count:12});
  feed(world,a,"bread");feed(world,c,"bread");
  assert.equal(world.mate(a,[c],visible),null);
  feed(world,b,"bread");
  const child=world.born(a,b,{x:.5,y:20,z:0},{family:"villager",community:a.community});
  const restored=create();
  restored.restore(JSON.parse(JSON.stringify(world.save())));
  const loaded={...actor("npc_child",.5,{community:a.community,young:true}),birth:restored.offspring.get(child.id)};
  assert.equal(restored.age(loaded),0);
  assert.equal(restored.offer(loaded,"bread"),null);
  assert.equal(restored.offer(a,"bread").seconds,300);
  restored.tick(childhood);
  assert.equal(restored.age(loaded),1);
});

test("alimentar o filhote acelera o crescimento e a remoção elimina seu registro",()=>{
  const world=create(),a=actor("rabbit"),b=actor("rabbit",1);
  feed(world,a,"carrot");feed(world,b,"carrot");
  const child=actor("rabbit",.5,{young:true,birth:world.born(a,b,{x:.5,y:20,z:0})});
  assert.equal(world.offer(child,"carrot").kind,"grow");
  feed(world,child,"carrot");
  assert.ok(Math.abs(world.age(child)-.1)<1e-8);
  assert.equal(world.ready(child),false);
  world.forget(child);
  assert.deepEqual(world.save().offspring,[]);
});
