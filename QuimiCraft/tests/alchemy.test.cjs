"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
require("../js/frontier.js");
require("../js/regions.js");
require("../js/alchemy.js");
require("../js/alchemy-world.js");
require("../js/inventory-transaction.js");

const A=QuimiCraftAlchemy;
const B={AIR:0,DOOR:13,SLATE:51,GLASS:19,ALCHEMY_BRICK:41,WOOD:5,PLANK:11,MARBLE:37};
const defs={};
QuimiCraftFrontier.register(B,defs);
QuimiCraftRegions.register(B,defs);
QuimiCraftAlchemyWorld.register(B,defs);

const hash=(x,y,z)=>{
  const n=Math.sin(x*127.1+y*311.7+z*74.7+19.19)*43758.5453;
  return n-Math.floor(n);
};
const seeded=(biome,extra={})=>QuimiCraftAlchemyWorld.create({
  B,seed:106488241,hash,biomeAt:()=>biome,terrainHeight:()=>23,culture:QuimiCraftRegions.culture,
  blocked:()=>false,hasEdits:()=>false,legacyOrigin:null,spawn:{x:0,z:0},waterLevel:15,sitePositions:{},...extra
});
const config={
  water:["Filtrar","Destilar"],pigment:[10,"Extrato de antocianinas"],crystal:[0,40,10],yield:[12,26,85],
  alloy:[12,75],cell:["Zinco e cobre","Ponte salina","Fechado"],thermal:["Processo que libera calor",15,"Isolado"]
};

test("as soluções dos sete experimentos atingem as metas e os controles iniciais permitem contraste",()=>{
  Object.entries(A.studies).forEach(([id,study])=>{
    assert.equal(A.runStudy(id,study.controls.map(c=>c.value)).ok,false,id);
    assert.equal(A.runStudy(id,config[id]).ok,true,id);
  });
  const filtered=Object.fromEntries(A.runStudy("water",["Filtrar","Nenhum"]).metrics);
  assert.equal(filtered["Sal na amostra"],"10 g");
  assert.equal(filtered["Sedimento na amostra"],"0 g");
  const distilled=Object.fromEntries(A.runStudy("water",config.water).metrics);
  assert.equal(distilled["Água recuperada"],"92 g");
  assert.equal(distilled["Sal retido no balão"],"10 g");
  assert.equal(A.runStudy("cell",["Zinco e cobre","Ponte salina","Aberto"]).ok,false);
  assert.equal(A.runStudy("thermal",["Processo que absorve calor",10,"Isolado"]).ok,false);
});

test("oficinas têm entradas, estações e formas determinísticas e escolhas por bioma",()=>{
  for(const [region,kind] of [["floresta","pigment"],["salinas","crystal"],["montanha","alloy"],["manguezal","water"],["tundra","thermal"]]){
    const world=seeded(region),site=world.around(48,5,3).find(s=>s.key==="starter");
    assert.equal(site.kind,kind);
    const sampleCount=Array.from(site.columns.values()).filter(c=>c.blocks.includes(B.ALCHEMY_SAMPLE)).length;
    assert.equal(sampleCount,1);
    assert.equal(site.resident.checkpoints.length,3);
    assert.equal(site.resident.office,site);
    const {x,y,z}=site.door,col=world.columnAt(x,z);
    assert.equal(world.blockAt(col,y),B.DOOR);
    assert.equal(world.blockAt(col,y+1),B.DOOR);
    assert.equal(world.doorAt(x,y+1,z).half,1);
    assert.equal(world.blockAt(col,col.top+1),null);
    assert.ok(Array.from(site.columns.values()).some(c=>c.blocks.includes(B[site.config.props[0]])));
    const second=seeded(region).around(48,5,3).find(s=>s.key==="starter");
    assert.deepEqual(second.door,site.door);
    assert.deepEqual([...second.columns].map(([k,c])=>[k,[...c.blocks]]),[...site.columns].map(([k,c])=>[k,[...c.blocks]]));
  }
});

test("o gerador respeita construções preexistentes e mantém oficinas já gravadas",()=>{
  const positions={};
  const old=seeded("floresta",{legacyOrigin:{x:0,z:0},hasEdits:()=>true});
  assert.deepEqual(old.around(48,5,85),[]);
  const world=seeded("floresta",{sitePositions:positions});
  const site=world.around(48,5,10)[0];
  world.remember(site);
  const rebuilt=seeded("floresta",{hasEdits:()=>true,sitePositions:positions}).around(48,5,10)[0];
  assert.equal(rebuilt.key,site.key);
  assert.deepEqual(rebuilt.door,site.door);
});

function lab(initial=Array(12).fill(null)){
  let slots=initial,last=null;
  const discoveries=[],observations=[];
  const callbacks={
    count:id=>slots.reduce((n,s)=>n+(s?.id===id?s.count:0),0),
    exchange:(need,out)=>{
      const result=QuimiCraftInventory.plan(slots,need,out);
      if(result.ok)slots=result.slots;
      return result;
    },
    observe:(text,category)=>observations.push([text,category]),
    discover:(...d)=>discoveries.push(d),
    save:value=>last=value,
    sitePositions:{},legacyOrigin:null
  };
  return {callbacks,discoveries,observations,progress:A.createProgress(callbacks),save:()=>last};
}

test("missões são independentes, experimentos ficam no caderno e resgate é único",()=>{
  const {progress:p,callbacks,discoveries,observations,save}=lab();
  assert.equal(p.missionStatus("water"),"available");
  assert.ok(p.accept("cell"));
  assert.ok(p.collect("alloy").ok);
  assert.ok(p.experiment("cell",config.cell,"A ponte fecha o percurso iônico.").result.ok);
  assert.equal(p.missionStatus("cell"),"ready");
  assert.ok(p.claim("cell").ok);
  assert.equal(p.missionStatus("water"),"available");
  assert.equal(p.claim("cell").ok,false);
  assert.equal(callbacks.count("voltaic_cell"),1);
  assert.equal(callbacks.count("potion_lantern"),1);
  assert.equal(observations.length,3);
  assert.ok(observations[0][0].includes("Hipótese"));
  assert.ok(discoveries.some(([section,key])=>section==="recipes"&&key==="potion_lantern"));
  assert.ok(p.use("potion_lantern").ok);
  assert.equal(callbacks.count("potion_vial"),1);
  const restored=A.createProgress({...callbacks,restore:save()});
  assert.equal(restored.missionStatus("cell"),"complete");
  assert.ok(restored.activeEffect("light"));
  restored.tick(76);
  assert.equal(restored.activeEffect("light"),false);
});

test("sem espaço para todos os produtos a missão aguarda e a amostra é preservada",()=>{
  const {progress:p,callbacks}=lab([{id:"alchemy_sample_pigment",count:1},{id:"outro",count:1}]);
  p.accept("pigment");
  p.experiment("pigment",config.pigment,"Com os volumes iguais o pH fica neutro.");
  assert.equal(p.claim("pigment").ok,false);
  assert.equal(p.missionStatus("pigment"),"ready");
  assert.equal(callbacks.count("alchemy_sample_pigment"),1);
  assert.equal(callbacks.count("indicator"),0);
});

test("a expedição secundária registra três provas de campo e só paga uma vez",()=>{
  const {progress:p,callbacks}=lab();
  assert.equal(p.startExpedition(),false);
  for(const id of ["pigment","crystal","yield"]){
    p.accept(id);p.collect(A.studies[id].specialty);
    p.experiment(id,config[id],"Vou comparar a hipótese com o resultado.");
    assert.ok(p.claim(id).ok);
  }
  assert.ok(p.startExpedition());
  for(const key of ["air","survey","warmth"])assert.ok(p.fieldTest(key));
  assert.ok(p.finishExpedition().ok);
  assert.equal(p.finishExpedition().ok,false);
  assert.equal(callbacks.count("gold_nugget"),6);
});

