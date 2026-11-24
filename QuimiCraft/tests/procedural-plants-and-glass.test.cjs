
"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
for(const name of ["frontier","regions","alchemy-world","habitats","surface-art","plant-models","block-models"]){
  require("../js/"+name+".js");
}
const B={AIR:0,FIRE:1,TALL_GRASS:2,POPPY:3,BLUE_FLOWER:4,WHITE_FLOWER:5,CACTUS:6,BAMBOO:7,PALM_LEAVES:8,
  GLASS:9,ICE:10,FROSTED_SOIL:11,SNOW:12,DOOR:13};
const defs=Object.fromEntries(Object.values(B).map(id=>[id,{tex:id,solid:id>5,plant:id>=1&&id<=5}]));
QuimiCraftFrontier.register(B,defs);
QuimiCraftRegions.register(B,defs);
QuimiCraftAlchemyWorld.register(B,defs);
QuimiCraftHabitats.register(B,defs);
const Art=QuimiCraftSurfaceArt;
const transparent=Art.configure(B,defs);
const faces=[
  {n:[1,0,0],v:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]]},
  {n:[-1,0,0],v:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]]},
  {n:[0,1,0],v:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]]},
  {n:[0,-1,0],v:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]]},
  {n:[0,0,1],v:[[1,0,1],[1,1,1],[0,1,1],[0,0,1]]},
  {n:[0,0,-1],v:[[0,0,0],[0,1,0],[1,1,0],[1,0,0]]}
];
const model=QuimiCraftBlockModels.create(B,faces,defs);
const hash=(x,y,t)=>{const n=Math.sin(x*127.1+y*311.7+(t||0)*74.7)*43758.5453;return n-Math.floor(n)};
const points=model=>model.flatMap(face=>face.vertices);
const height=model=>Math.max(...points(model).map(p=>p[1]));

test("todo bloco vegetal da versão tem geometria volumétrica com faces válidas",()=>{
  for(const [id,def] of Object.entries(defs)){
    if(!def.plant)continue;
    const shape=model.models.get(Number(id));
    assert.ok(shape&&shape.length>8,id);
    assert.ok(new Set(shape.map(f=>f.normal.map(n=>n.toFixed(2)).join(","))).size>=4,id);
    assert.ok(points(shape).flat().every(v=>Number.isFinite(v)),id);
  }
  for(const id of [B.CACTUS,B.BAMBOO,B.JACARANDA_LEAF,B.PALM_LEAVES])assert.ok(model.models.has(id));
});

test("os cultivos crescem em volume e a cenoura desenvolve a raiz sob o solo",()=>{
  for(const {stages,wild,seed,food} of QuimiCraftFrontier.crops(B)){
    const stages3d=stages.map(id=>model.models.get(id));
    assert.ok(stages3d.slice(1).every(stage=>stage.length>stages3d[0].length));
    assert.ok(height(stages3d[0])<height(stages3d[1])&&height(stages3d[1])<height(stages3d[2]));
    assert.ok(model.models.get(wild).length>16);
    assert.ok(model.produce.get(seed).length>8&&model.produce.get(food).length>8);
  }
  const orange=f=>f.tile===Art.tiles.pigment&&f.color[0]>f.color[1]*1.65&&f.color[1]>f.color[2]*1.9;
  assert.ok(model.models.get(B.CARROT_RIPE).filter(orange).length>20);
  assert.ok(points(model.models.get(B.CARROT_RIPE).filter(orange)).some(point=>point[1]<-.28));
  assert.ok(points(model.models.get(B.CARROT_RIPE).filter(orange)).every(point=>point[1]<.06));
  assert.ok(model.produce.get("carrot").filter(orange).length>15);
  assert.ok(model.produce.has("beans")&&model.produce.has("wheat"));
});

test("vidros e gelo preservam a solidez com atlas de opacidades distintas",()=>{
  for(const id of [B.GLASS,B.GLASS_AMBER,B.GLASS_COBALT,B.WINDOW_LEADED,B.ICE,B.BLUE_ICE_VEIN]){
    assert.ok(transparent.has(id)&&defs[id].solid&&defs[id].alpha);
    const texture=Array.isArray(defs[id].tex)?defs[id].tex[0]:defs[id].tex;
    const pixels=Array.from({length:1024},(_,i)=>Art.paint(texture,i%32,i>>5,hash));
    const alpha=new Set(pixels.map(p=>p[3]));
    assert.ok(alpha.size>=3&&Math.max(...alpha)>170&&Math.min(...alpha)<190);
  }
  assert.ok(!transparent.has(B.BASALT_GLASS));
  assert.equal(Art.paint(defs[B.BASALT_GLASS].tex,15,15,hash)[3],255);
});

test("aceroleira tem frutos menores e distribuídos por mais ramos que a romãzeira",()=>{
  const crops=QuimiCraftFrontier.crops(B);
  const capture=id=>{
    const {stages}=crops.find(crop=>crop.food===id);
    const branches=[],fruits=[];
    QuimiCraftPlantModels.styles[Object.keys(B).find(key=>B[key]===stages[2])]({
      add:()=>{},rod:(a,b,r,tile)=>{if(tile===196)branches.push([a,b])},
      shell:(layers,tile)=>{if(tile===Art.tiles.pigment)fruits.push(layers)}
    });
    return {branches,fruits};
  };
  const acerola=capture("acerola"),pomegranate=capture("pomegranate");
  assert.ok(acerola.branches.length>=26);
  assert.ok(acerola.fruits.length>=18&&acerola.fruits.length>pomegranate.fruits.length);
  const radius=fruit=>Math.max(...fruit.map(([, , ,r])=>r));
  assert.ok(Math.max(...acerola.fruits.map(radius))<Math.min(...pomegranate.fruits.map(radius))*.62);
});

test("terra congelada usa faces de solo e geada e o alambique inclui duas superfícies",()=>{
  assert.deepEqual(defs[B.FROSTED_SOIL].tex,[Art.tiles.frostTop,Art.tiles.frostSide,2]);
  assert.ok(!Art.transparentTiles.has(defs[B.FROST_CRUST].tex[0]));
  const shape=model.models.get(B.ALCHEMY_STILL);
  const clear=shape.filter(f=>Art.transparentTiles.has(f.tile));
  assert.ok(clear.length>=35&&shape.length-clear.length>=180);
  assert.ok(shape.some(face=>face.tile===200)&&shape.some(face=>face.tile===197));
  assert.ok(points(shape).flat().every(v=>v>=-.025&&v<=1.03));
});

