"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
const THREE=require("../assets/three.min.js");
require("../js/vehicles.js");
require("../js/vehicle-models.js");
require("../js/inventory-transaction.js");

const V=QuimiCraftVehicles;
const position=(x,y,z,yaw=0)=>({x,y,z,yaw});
const controls=(overrides={})=>({throttle:0,turn:0,pitch:0,takeoff:false,brake:false,...overrides});
function world({solid=(x,y)=>y<10,ground=(x,z,top,bottom)=>top>=10&&bottom<=10?10:null,
  protectedPosition=()=>false,liquid=()=>false,slots,breakArea=()=>1,inspect,surface}={}){
  const player={pos:new THREE.Vector3(0,10,0),vel:new THREE.Vector3(0,0,0),yaw:0,pitch:0},scene=new THREE.Scene();
  const models=QuimiCraftVehicleModels.create(THREE),messages=[];
  slots??=Array(8).fill(null);
  let saved=null,vehicle;
  const exchange=(need,out)=>{
    const mapped=QuimiCraftInventory.plan(slots,need,out);
    if(mapped.ok)slots=mapped.slots;
    return {...mapped,message:mapped.ok?"":"Operação inviável"};
  };
  vehicle=V.create({THREE,scene,models,player,solid,ground,liquid,protectedPosition,exchange,breakArea,inspect,surface,
    notice:msg=>messages.push(msg),persist:()=>{saved=vehicle.snapshot();}});
  return {vehicle,player,scene,messages,count:id=>slots.find(row=>row?.id===id)?.count??0,saved:()=>saved};
}
function steps(v,count,input){
  for(let i=0;i<count;i++)v.update(.025,input,null);
}

test("carrinho consome o kit, acelera, freia, colide e pode ser recolhido",()=>{
  const {vehicle:v,player,count,saved}=world({
    slots:[{id:"kit_cart",count:1},null],
    solid:(x,y,z)=>y<10||z< -13&&y<14
  });
  assert.ok(v.deploy("kit_cart",null));
  assert.equal(count("kit_cart"),0);
  assert.ok(v.nearest().rig.wheels.length===4);
  assert.ok(v.mount());
  steps(v,200,controls({throttle:1}));
  assert.ok(player.pos.z<=-10&&player.pos.z>-13);
  assert.equal(v.current().speed,0);
  steps(v,28,controls({throttle:-1}));
  assert.ok(v.current().speed<0);
  steps(v,40,controls({brake:true}));
  assert.equal(v.current().speed,0);
  assert.ok(v.dismount());
  assert.ok(v.stash());
  assert.equal(count("kit_cart"),1);
  assert.deepEqual(saved().roster,[]);
});

test("broca corta frente de 3 × 3 e caçamba seleciona 3 × 2 de solo em duas camadas",()=>{
  const drill=V.excavation({kind:"drill",...position(.5,11,.5)},null);
  assert.equal(drill.length,9);
  assert.equal(new Set(drill.map(p=>p.z)).size,1);
  assert.deepEqual([...new Set(drill.map(p=>p.y))],[11,12,13]);
  const bucket=V.excavation({kind:"bucket",...position(.5,11,.5,Math.PI/2)},{x:-3,y:10,z:0});
  assert.equal(bucket.length,12);
  assert.deepEqual([...new Set(bucket.map(p=>p.y))],[10,9]);
  assert.ok(Math.max(...bucket.map(p=>p.x))<0);
});

test("uma escavadeira opera parada e respeita o intervalo de trabalho",()=>{
  let cuts=0;
  const {vehicle:v}=world({slots:[{id:"kit_drill",count:1},null],breakArea:cells=>{cuts++;return cells.length;}});
  assert.ok(v.deploy("kit_drill",null));
  assert.ok(v.mount());
  v.operate(null);
  v.operate(null);
  assert.equal(cuts,1);
  steps(v,17,controls());
  assert.ok(v.current().work>.5);
  steps(v,22,controls());
  v.operate(null);
  assert.equal(cuts,2);
});

test("14-bis decola, pedala, pousa e o módulo retorna ao recolher",()=>{
  const {vehicle:v,player,count,saved}=world({slots:[{id:"kit_glider",count:1},{id:"pedal_drive",count:1},null]});
  assert.ok(v.deploy("kit_glider",null));
  assert.ok(v.install());
  assert.equal(count("pedal_drive"),0);
  assert.ok(v.nearest().rig.drive.visible);
  assert.ok(v.mount());
  steps(v,135,controls({throttle:1,takeoff:true,pitch:.19}));
  assert.ok(v.current().flying);
  assert.ok(player.pos.y>10.5);
  assert.ok(v.current().pedaling);
  assert.ok(v.current().rig.prop.rotation.z>1);
  assert.equal(v.dismount(),false);
  for(let i=0;i<650&&v.current().flying;i++)v.update(.025,controls({pitch:-.24}),null);
  assert.equal(v.current().flying,false);
  steps(v,40,controls({brake:true,takeoff:true}));
  assert.ok(v.dismount());
  assert.ok(saved().roster[0].motor);
  assert.ok(v.stash());
  assert.equal(count("kit_glider"),1);
  assert.equal(count("pedal_drive"),1);
});

test("abre o planador durante a queda, registra terreno de recuperação e restaura o veículo",()=>{
  const {vehicle:v,player,saved}=world({slots:[{id:"kit_glider",count:1},null]});
  player.pos.set(12,32,25);player.vel.y=-12;
  assert.ok(v.deploy("kit_glider",null,true));
  assert.ok(v.current().flying&&v.current().speed>10);
  assert.equal(v.current().dy,-7);
  const snapshot=saved();
  assert.equal(snapshot.roster[0].y,10);
  const reload=world();
  reload.player.pos.set(12,10,25);
  reload.vehicle.restore(snapshot);
  assert.equal(reload.vehicle.nearest().kind,"glider");
  assert.equal(reload.vehicle.current(),null);
});

test("a área protegida e a capacidade da mochila preservam os kits",()=>{
  const area=world({slots:[{id:"kit_cart",count:1}],protectedPosition:()=>true});
  assert.equal(area.vehicle.deploy("kit_cart",null),false);
  assert.equal(area.count("kit_cart"),1);
  const full=world({slots:[{id:"kit_cart",count:2}]});
  assert.ok(full.vehicle.deploy("kit_cart",null));
  const restored=world({slots:[{id:"outro",count:1}]});
  restored.vehicle.restore(full.vehicle.snapshot());
  assert.ok(restored.vehicle.stash());
  assert.ok(restored.vehicle.nearest());
  assert.match(restored.messages.at(-1),/inviável/);
});



test("aderência distingue gelo e lama de piso firme e as esteiras giram paradas",()=>{
  const vehicleOn=(kind,surface)=>world({slots:[{id:V.types[kind].item,count:1},null],surface:()=>surface}).vehicle;
  const asphalt=vehicleOn("cart","normal"),ice=vehicleOn("cart","slip"),mud=vehicleOn("cart","mud");
  for(const vehicle of [asphalt,ice,mud]){
    assert.ok(vehicle.deploy("kit_cart",null)&&vehicle.mount());
    steps(vehicle,145,controls({throttle:1}));
  }
  assert.ok(mud.current().speed<asphalt.current().speed*.75);
  const beforeFirm=asphalt.current().speed,beforeIce=ice.current().speed;
  steps(asphalt,20,controls({brake:true}));
  steps(ice,20,controls({brake:true}));
  assert.ok(beforeFirm-asphalt.current().speed>beforeIce-ice.current().speed+1);
  const digger=vehicleOn("drill","normal");
  assert.ok(digger.deploy("kit_drill",null)&&digger.mount());
  steps(digger,40,controls({turn:1}));
  assert.ok(digger.current().yaw>.6);
  assert.equal(digger.current().speed,0);
});

test("caçamba mostra os blocos que retira e deixa uma camada protegida intacta",()=>{
  let cut=[];
  let target=null;
  const {vehicle:v,scene}=world({
    slots:[{id:"kit_excavator",count:1},null],
    inspect:({x,y})=>x===0&&y===9?"blocked":"cut",
    breakArea:cells=>{cut=cells;return cells.length;}
  });
  assert.ok(v.deploy("kit_excavator",null)&&v.mount());
  v.update(.025,controls(),target);
  const planned=v.current().cutCount,preview=scene.getObjectByName("Prévia do corte");
  assert.equal(planned,8);
  assert.equal(preview.children.filter(node=>node.visible).length,planned);
  v.operate(target);
  assert.equal(cut.length,planned);
  assert.ok(cut.every(cell=>cell.x!==0));
  assert.equal(preview.visible,false);
});

test("14-bis ganha velocidade no mergulho, perde sustentação em subida lenta e recupera",()=>{
  const launch=()=>{
    const {vehicle:v,player}=world({slots:[{id:"kit_glider",count:1},null]});
    player.pos.set(0,42,0);player.vel.y=-2.4;
    assert.ok(v.deploy("kit_glider",null,true));
    return v;
  };
  const dive=launch(),climb=launch();
  steps(dive,85,controls({pitch:-.52}));
  steps(climb,85,controls({pitch:.62}));
  assert.ok(dive.current().speed>climb.current().speed+5);
  assert.match(climb.current().report,/sustentação/);
  const stalled=climb.current().speed;
  steps(climb,80,controls({pitch:-.62}));
  assert.ok(climb.current().speed>stalled+3);
});

function terraced(height,roof=false,kit="kit_cart"){
  const floor=(x,z)=>z< -13?10+height:10;
  const {vehicle}=world({
    slots:[{id:kit,count:1},null],
    solid:(x,y,z)=>y<floor(x,z)||(roof&&z>-13&&z< -7&&y>=12.6&&y<13.6),
    ground:(x,z,hi,lo)=>{const y=floor(x,z);return hi>=y&&lo<=y?y:null;}
  });
  assert.ok(vehicle.deploy(kit,null));
  assert.ok(vehicle.mount());
  return vehicle;
}

test("os três veículos terrestres sobem desníveis de quatro blocos",()=>{
  for(const kit of ["kit_cart","kit_drill","kit_excavator"]){
    const v=terraced(4,false,kit);
    const drive=controls({throttle:1});
    let climbing=false;
    for(let i=0;i<300;i++){
      v.update(.025,drive,null);
      const current=v.current();
      if(current.climb){
        climbing=true;
        assert.equal(v.snapshot().roster[0].y,10);
        assert.ok(!v.dismount());
      }
    }
    assert.ok(climbing,kit);
    assert.equal(v.current().y,14,kit);
    assert.ok(v.current().z< -15,kit);
    assert.equal(v.snapshot().roster[0].y,14);
  }
});

test("paredes de cinco blocos e tetos baixos impedem a subida",()=>{
  for(const v of [terraced(5),terraced(4,true)]){
    steps(v,210,controls({throttle:1,nitro:true}));
    assert.ok(v.current().z> -13);
    assert.equal(v.current().y,10);
    assert.equal(v.current().speed,0);
    assert.equal(v.current().climb,null);
  }
});

test("espaço inicia um salto por pressão, resolve o pouso e respeita o teto",()=>{
  const {vehicle:v}=world({slots:[{id:"kit_cart",count:1},null]});
  assert.ok(v.deploy("kit_cart",null)&&v.mount());
  const drive=controls({throttle:1});
  const jump=controls({throttle:1,jump:true});
  steps(v,18,drive);
  const start=v.current().z;
  steps(v,12,jump);
  assert.ok(v.current().airborne);
  assert.ok(v.current().y>11.3);
  assert.ok(v.current().z<start);
  assert.equal(v.snapshot().roster[0].y,10);
  steps(v,50,jump);
  assert.equal(v.current().airborne,false);
  assert.equal(v.current().y,10);
  steps(v,1,drive);
  steps(v,1,jump);
  assert.equal(v.current().airborne,true);
  const {vehicle:roof}=world({
    slots:[{id:"kit_cart",count:1},null],
    solid:(x,y)=>y<10||(y>=12.2&&y<13.2)
  });
  assert.ok(roof.deploy("kit_cart",null)&&roof.mount());
  for(let i=0;i<60;i++){
    roof.update(.025,controls({jump:true}),null);
    assert.ok(roof.current().y<=10.31);
  }
  assert.equal(roof.current().y,10);
});

test("nitro acelera, anima os escapes, recarrega e preserva a carga no mundo",()=>{
  const {vehicle:a}=world({slots:[{id:"kit_cart",count:1},null]});
  const {vehicle:b}=world({slots:[{id:"kit_cart",count:1},null]});
  for(const v of [a,b])assert.ok(v.deploy("kit_cart",null)&&v.mount());
  steps(a,100,controls({throttle:1,nitro:true}));
  steps(b,100,controls({throttle:1}));
  const boosted=a.current();
  assert.ok(boosted.meterSpeed>b.current().meterSpeed);
  assert.ok(boosted.speed>V.types.cart.top);
  assert.ok(boosted.nitro>18&&boosted.nitro<22);
  assert.ok(boosted.rig.boostFlames.every(jet=>jet.visible));
  const saved=a.snapshot();
  const lastCharge=boosted.nitro;
  steps(a,40,controls({brake:true,nitro:true}));
  assert.equal(boosted.nitro,lastCharge);
  assert.ok(boosted.rig.boostFlames.every(jet=>!jet.visible));
  steps(a,80,controls());
  assert.ok(boosted.nitro>lastCharge);
  const {vehicle:restored,player}=world();
  restored.restore(saved);
  const {x,y,z}=saved.roster[0];
  player.pos.set(x,y,z);
  assert.equal(restored.nearest().nitro,lastCharge);
  restored.restore({version:1,roster:[{kind:"cart",id:1,x,y,z,yaw:0}]});
  assert.equal(restored.nearest().nitro,100);
});

