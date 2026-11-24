
"use strict";

const assert=require("node:assert/strict");
const {test}=require("node:test");
const THREE=require("../assets/three.min.js");
for(const file of ["dragons","expeditions","mounts","wildlife-models"])require("../js/"+file+".js");

function world(seed,biome,blocked=()=>false){
  const ids=new Map([["AIR",0]]);
  QuimiCraftExpeditions.register(new Proxy({},{
    set(target,key,value){ids.set(key,value);return true;}
  }),{});
  const B=new Proxy({},{
    get(target,key){
      if(!ids.has(key))ids.set(key,ids.size+1);
      return ids.get(key);
    }
  });
  const world=QuimiCraftExpeditions.create({B,seed,terrain:()=>33,biome:()=>biome,blocked,
    cave:(x,y,z)=>y>=13&&y<=22,dragons:QuimiCraftDragons.regional});
  return {B,...world};
}
function places(world){return world.nearby(0,0,350);}
function signature(sites){return sites.map(({kind,x,y,z,turn,dragon})=>[kind,x,y,z,turn,dragon]);}

test("estruturas respeitam a semente, biomas, áreas bloqueadas e células vazias",()=>{
  const dry=places(world(492,"deserto")),other=places(world(493,"deserto"));
  assert.deepEqual(signature(dry),signature(places(world(492,"deserto"))));
  assert.notDeepEqual(signature(dry),signature(other));
  assert.deepEqual(places(world(492,"deserto",()=>true)),[]);
  assert.ok(dry.some(s=>s.kind==="temple")&&dry.some(s=>s.kind==="den")&&dry.some(s=>s.kind==="lab"));
  assert.ok(dry.every(s=>s.kind!=="grove"));
  assert.ok(places(world(492,"floresta")).some(s=>s.kind==="grove"));
  assert.ok(new Set(dry.filter(s=>s.kind==="temple").map(s=>s.turn)).size>1);
});
test("baús, salões escavados e guardiões usam as mesmas coordenadas da geração em chunks",()=>{
  const realm=world(492,"deserto"),sites=places(realm);
  for(const site of sites){
    for(const [key,loot] of site.treasures){
      const [x,y,z]=key.split("|").map(Number);
      assert.equal(realm.column(x,z).blocks[y],realm.B.EXPEDITION_CHEST);
      assert.equal(realm.treasureAt(x,y,z),loot);
      assert.ok(loot.items.length>=3);
    }
    assert.equal(new Set(site.actors.map(a=>a.id)).size,site.actors.length);
    assert.ok(site.actors.every(a=>realm.column(Math.floor(a.x),Math.floor(a.z)).blocks[a.y]===realm.B.AIR));
    if(site.kind==="lab"){
      assert.ok(site.y<22&&site.tunnel>=12);
      assert.ok(site.mouthY+2<=22);
    }
  }
});
test("as árvores vivas têm cinco alturas de jogador, quatro membros e assento no tronco",()=>{
  const models=QuimiCraftWildlife.create(THREE);
  for(const t of Object.values(QuimiCraftMounts.trees)){
    const rig={legs:[],arms:[]},g=new THREE.Group();
    models.livingTree(t,g,rig);
    const size=new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3());
    assert.ok(size.y>=8.3&&size.y<=9.2);
    assert.ok(rig.saddle&&rig.head);
    assert.equal(rig.legs.length,2);
    assert.equal(rig.arms.length,2);
  }
});
test("voo pousa no piso e a árvore escala apenas ao avançar com espaço",()=>{
  const {motion}=QuimiCraftMounts;
  const base={x:0,y:5,z:0};
  const input={yaw:0,throttle:1,side:0,up:true,down:false};
  const sky={kind:"dragon",speed:9,ceiling:11,clear:(_,x,y)=>y>=5,
    ground:(_,x,z,top,bottom)=>top>=5&&bottom<=5?5:null};
  const dragon={...base};
  for(let i=0;i<28;i++)motion(dragon,.04,input,sky);
  assert.equal(dragon.y,11);assert.ok(dragon.z<-9);
  for(let i=0;i<40;i++)motion(dragon,.04,{...input,throttle:0,up:false,down:true},sky);
  assert.ok(dragon.onGround);assert.equal(dragon.y,5);
  const wall={...sky,kind:"tree",speed:6,ceiling:40,
    clear:(_,x,y,z)=>y>=5&&(z>=-2||y>=9),
    ground:(_,x,z,top,bottom)=>{const y=z<-2?9:5;return top>=y&&bottom<=y?y:null;}};
  const tree={...base};
  for(let i=0;i<60;i++)motion(tree,.035,{...input,up:false},wall);
  assert.equal(tree.y,5);assert.ok(tree.z>=-2);
  for(let i=0;i<58;i++)motion(tree,.035,input,wall);
  assert.equal(tree.y,9);assert.ok(tree.z<-3&&tree.onGround);
});

