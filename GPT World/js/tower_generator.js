import { TOWER_ASSETS, TOWER_MANIFEST_META } from "./tower_manifest.js";
import { TOWER_CONFIG, TOWER_FAMILIES, TOWER_GRAMMARS, TOWER_MUTATIONS, TOWER_OBJECTIVES, TOWER_WHISPERS, towerBossName, towerEnemyPool } from "./tower_data.js";
import { createVisualTerrainPlan, validateTowerManifestVisuals, validateVisualTerrainPlan, visualTerrainSignature } from "./tower_visual.js";
import { presentationFromAsset, propCollisionBounds, rectangleOverlap } from "./prop_presentation.js";
import { applyTowerFloorOverride } from "./map_overrides.js";

const CELL=TOWER_CONFIG.cellSize;
const GRID_SIZES=[64,72,80,88,96];
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const cellKey=(x,y)=>`${x},${y}`;
const MANIFEST_PATHS=new Set(TOWER_ASSETS.map((entry)=>entry.path));

export function hashString(value) {
  let hash=2166136261;
  for(let index=0;index<String(value).length;index++){hash^=String(value).charCodeAt(index);hash=Math.imul(hash,16777619);}
  return hash>>>0;
}

export class TowerRandom {
  constructor(seed){this.state=hashString(seed)||0x9e3779b9;}
  next(){let x=this.state;x^=x<<13;x^=x>>>17;x^=x<<5;this.state=x>>>0;return this.state/4294967296;}
  int(min,max){return Math.floor(this.next()*(max-min+1))+min;}
  pick(list){return list[Math.min(list.length-1,Math.floor(this.next()*list.length))];}
  chance(value){return this.next()<value;}
  shuffle(list){const copy=[...list];for(let i=copy.length-1;i>0;i--){const j=this.int(0,i);[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
}

export function towerFloorSeed(runSeed,floor,difficulty=1,route="lucas",overrides=null) {
  const base=`${runSeed}|andar:${floor}|dificuldade:${Number(difficulty).toFixed(3)}|rota:${route}`;
  if(!overrides)return base;
  const suffix=[overrides.familyId,overrides.hybridId,overrides.grammarId,overrides.mutationId].map((value)=>value??"auto").join("|");
  const exact=Number.isFinite(Number(overrides.floorSeed))?`|floor-seed:${Number(overrides.floorSeed)>>>0}`:"";
  return`${base}${exact}|dev:${suffix}`;
}

const resolvedFloorSeed=(seed,overrides)=>Number.isFinite(Number(overrides?.floorSeed))?Number(overrides.floorSeed)>>>0:hashString(seed);

function rectRoom(id,cx,cy,w,h,shape="rect") {
  return{id,cx:Math.round(cx),cy:Math.round(cy),w:Math.round(w),h:Math.round(h),shape,type:"side"};
}

function roomCandidates(grammar,size,rng) {
  const margin=8,count=clamp(10+Math.floor(size/16)+rng.int(0,3),12,18),rooms=[];
  const add=(cx,cy,w=rng.int(7,12),h=rng.int(6,11),shape="rect")=>{
    cx=clamp(Math.round(cx),margin,size-margin-1);cy=clamp(Math.round(cy),margin,size-margin-1);
    const room=rectRoom(`sala-${rooms.length}`,cx,cy,w,h,shape);
    if(rooms.every((other)=>Math.hypot(other.cx-cx,other.cy-cy)>Math.max(6,(other.w+w+other.h+h)/8)))rooms.push(room);
  };
  if(grammar.id==="arteria"||grammar.id==="coluna-vertebral"){
    const vertical=grammar.id==="coluna-vertebral"||rng.chance(.5);
    for(let i=0;i<count;i++){const t=i/(count-1),axis=margin+t*(size-margin*2);const side=(i%2?1:-1)*rng.int(8,18);add(vertical?size/2+side:axis,vertical?axis:size/2+side,rng.int(7,11),rng.int(6,10),"ellipse");}
  }else if(grammar.id==="orgao-circular"){
    add(size/2,size/2,14,14,"ellipse");
    for(let i=0;i<count-1;i++){const angle=(i/(count-1))*Math.PI*2+rng.next()*.18,radius=size*(.27+rng.next()*.08);add(size/2+Math.cos(angle)*radius,size/2+Math.sin(angle)*radius,rng.int(7,11),rng.int(7,11),"ellipse");}
  }else if(grammar.id==="fortaleza"||grammar.id==="complexo-templo"){
    const cols=4,rows=Math.ceil(count/cols);for(let i=0;i<count;i++){const col=i%cols,row=Math.floor(i/cols),x=margin+(col+.5)*(size-margin*2)/cols,y=margin+(row+.5)*(size-margin*2)/rows;add(x+rng.int(-2,2),y+rng.int(-2,2),rng.int(8,12),rng.int(7,11),grammar.id==="complexo-templo"?"diamond":"rect");}
  }else if(grammar.id==="espiral"){
    for(let i=0;i<count;i++){const t=i/(count-1),angle=t*Math.PI*4.5,radius=5+t*size*.36;add(size/2+Math.cos(angle)*radius,size/2+Math.sin(angle)*radius,rng.int(7,10),rng.int(6,9),"ellipse");}
  }else if(grammar.id==="ilhas-afogadas"||grammar.id==="plataformas-arcanas"){
    for(let i=0;i<count;i++){const angle=(i/count)*Math.PI*2+rng.next()*.5,radius=size*(.12+(i%3)*.105);add(size/2+Math.cos(angle)*radius,size/2+Math.sin(angle)*radius,rng.int(8,13),rng.int(7,12),"ellipse");}
  }else{
    let attempts=0;while(rooms.length<count&&attempts++<count*20)add(rng.int(margin,size-margin),rng.int(margin,size-margin),rng.int(7,13),rng.int(6,12),grammar.id==="rede-cavernosa"||grammar.id==="clareiras"?"ellipse":"rect");
  }
  if(rooms.length<8){rooms.length=0;for(let y=14;y<size-10;y+=16)for(let x=14;x<size-10&&rooms.length<12;x+=18)add(x,y,10,8,"rect");}
  return rooms;
}

function roomDistance(a,b){return Math.hypot(a.cx-b.cx,a.cy-b.cy);}

function graphEdges(rooms,rng) {
  const candidates=[];for(let i=0;i<rooms.length;i++)for(let j=i+1;j<rooms.length;j++)candidates.push({a:i,b:j,d:roomDistance(rooms[i],rooms[j])});candidates.sort((a,b)=>a.d-b.d);
  const parent=rooms.map((_,index)=>index),find=(i)=>parent[i]===i?i:(parent[i]=find(parent[i])),edges=[];
  for(const edge of candidates){const pa=find(edge.a),pb=find(edge.b);if(pa===pb)continue;parent[pa]=pb;edges.push(edge);if(edges.length===rooms.length-1)break;}
  const extras=candidates.filter((edge)=>!edges.includes(edge)&&edge.d<rooms.length*3.1);
  for(const edge of rng.shuffle(extras).slice(0,Math.max(2,Math.floor(rooms.length*.22))))edges.push(edge);
  return edges;
}

function makeGrid(size,value=0){return Array.from({length:size},()=>new Uint8Array(size).fill(value));}
function paint(grid,x,y,value,radius=1){for(let yy=y-radius;yy<=y+radius;yy++)for(let xx=x-radius;xx<=x+radius;xx++)if(grid[yy]?.[xx]!==undefined)grid[yy][xx]=value;}
function carveRoom(grid,room){const rx=Math.max(3,Math.floor(room.w/2)),ry=Math.max(3,Math.floor(room.h/2));for(let y=room.cy-ry;y<=room.cy+ry;y++)for(let x=room.cx-rx;x<=room.cx+rx;x++){if(grid[y]?.[x]===undefined)continue;const dx=(x-room.cx)/rx,dy=(y-room.cy)/ry;if(room.shape!=="ellipse"||dx*dx+dy*dy<=1.05)grid[y][x]=1;}}
function carveLine(grid,a,b,rng,value=1){let x=a.cx,y=a.cy;const centerline=[[x,y]],horizontalFirst=rng.chance(.5);const go=(tx,ty)=>{while(x!==tx||y!==ty){if(x!==tx&&(y===ty||horizontalFirst))x+=Math.sign(tx-x);else if(y!==ty)y+=Math.sign(ty-y);else x+=Math.sign(tx-x);paint(grid,x,y,value,2);centerline.push([x,y]);}};go(b.cx,b.cy);return centerline;}

function farthestPair(rooms){let pair=[rooms[0],rooms.at(-1)],distance=-1;for(const a of rooms)for(const b of rooms){const d=roomDistance(a,b);if(d>distance){distance=d;pair=[a,b];}}return pair;}

function flood(grid,start) {
  const seen=new Set([cellKey(start.x,start.y)]),queue=[start];
  for(let i=0;i<queue.length;i++){const p=queue[i];for(const [dx,dy] of[[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy,key=cellKey(x,y);if(!seen.has(key)&&grid[y]?.[x]===1){seen.add(key);queue.push({x,y});}}}
  return seen;
}

function assignRooms(rooms,entrance,exit,rng) {
  entrance.type="entrance";exit.type="exit";
  const types=["combat","treasure","event","rest","combat","story","risk","combat","altar","treasure"];
  rng.shuffle(rooms.filter((room)=>room!==entrance&&room!==exit)).forEach((room,index)=>{room.type=types[index%types.length];});
}

function assetPools(family,hybrid) {
  const folders=new Set([family.folder,hybrid?.folder].filter(Boolean)),pool=TOWER_ASSETS.filter((item)=>folders.has(item.region));
  const by=(category)=>pool.filter((item)=>item.category===category);
  const terrains=by("terrain"),hazards=terrains.filter((item)=>item.hazard),safeTerrain=terrains.filter((item)=>!item.hazard);
  return{all:pool,terrain:safeTerrain.length?safeTerrain:terrains,hazard:hazards.length?hazards:terrains,path:by("path"),structure:by("structure"),wall:by("wall"),prop:by("prop"),decoration:by("decoration")};
}

function weightedPick(rng,list,used=new Map()) {
  if(!list.length)return null;const weights=list.map((item)=>Math.max(.2,item.weight/(1+(used.get(item.id)||0)*.8))),total=weights.reduce((a,b)=>a+b,0);let roll=rng.next()*total;
  for(let i=0;i<list.length;i++){roll-=weights[i];if(roll<=0){used.set(list[i].id,(used.get(list[i].id)||0)+1);return list[i];}}
  return list.at(-1);
}

function selectFloorAssets(rng,pools) {
  const used=new Map(),take=(list,count)=>Array.from({length:Math.min(count,list.length)},()=>weightedPick(rng,list,used)).filter(Boolean);
  return{
    terrain:take(pools.terrain,Math.min(8,pools.terrain.length)),hazard:take(pools.hazard,Math.min(5,pools.hazard.length)),path:take(pools.path.length?pools.path:pools.terrain,Math.min(7,Math.max(2,pools.path.length))),
    structures:take(pools.structure,Math.min(18,pools.structure.length)),walls:take(pools.wall,Math.min(10,pools.wall.length)),props:take(pools.prop,Math.min(22,pools.prop.length)),decorations:take(pools.decoration,Math.min(28,pools.decoration.length))
  };
}

function addHazards(grid,rooms,rng,grammar) {
  const islandLike=["ilhas-afogadas","plataformas-arcanas"].includes(grammar.id);
  if(islandLike){for(let y=2;y<grid.length-2;y++)for(let x=2;x<grid.length-2;x++)if(grid[y][x]===0&&rng.chance(.72))grid[y][x]=2;}
  const count=clamp(Math.floor(grid.length/14),4,8);
  for(let i=0;i<count;i++){const room=rng.pick(rooms.filter((entry)=>!["entrance","exit"].includes(entry.type)));if(!room)continue;const cx=room.cx+rng.int(-Math.floor(room.w/3),Math.floor(room.w/3)),cy=room.cy+rng.int(-Math.floor(room.h/3),Math.floor(room.h/3));for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++)if(grid[y]?.[x]===1&&Math.hypot(x-room.cx,y-room.cy)>2.5)grid[y][x]=2;}
  // O centro de cada sala e todas as conexões obrigatórias permanecem seguros.
  rooms.forEach((room)=>paint(grid,room.cx,room.cy,1,2));
}

function corridorCells(grid,rooms) {
  const result=[];for(let y=1;y<grid.length-1;y++)for(let x=1;x<grid.length-1;x++){if(grid[y][x]!==1)continue;const inside=rooms.some((room)=>Math.abs(x-room.cx)<=Math.max(2,Math.floor(room.w/2)-1)&&Math.abs(y-room.cy)<=Math.max(2,Math.floor(room.h/2)-1));if(!inside)result.push([x,y]);}return result;
}

const COMPOSITIONS={settlement:["casa","mercado","poste","caixa","barril","cerca"],ruins:["ruina","coluna","entulho","estatua","pedra"],temple:["templo","altar","coluna","escad","pedestal","portal"],mine:["mina","trilho","ferramenta","rocha","estrutura de madeira"],port:["porto","cais","barco","recife","cerca","caixa"],cemetery:["mausoleu","cemiterio","osso","sepultura","lanterna","cerca"],fortress:["fortaleza","castelo","muro","torre","bandeira","arma"],forest:["arvore","vegetacao","cogumelo","flor","arbusto"],cave:["caverna","cristal","estalag","rocha","agua subterranea"],farm:["fazenda","estrutura rural","trigo","feno","cultivo","mercado"],laboratory:["biblioteca","maquina","portal","plataforma","cristal","coluna"]};
function compositionName(grammar,family,room){if(room.type==="altar")return"temple";if(family.id==="coracao-necrosado")return"cemetery";if(family.id==="gordura-dourada")return"farm";if(family.id==="cerebro-arcano")return"laboratory";return grammar.template||"ruins";}
function matchingAssets(list,template){const words=COMPOSITIONS[template]||COMPOSITIONS.ruins,matched=list.filter((asset)=>words.some((word)=>asset.name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(word)));return matched.length?matched:list;}

function buildProps(rooms,grid,assets,rng,size,grammar,family,requiredPaths=[]) {
  const placements=[],occupied=new Set(),solidBounds=[],pathLookup=new Set(requiredPaths.map(([x,y])=>cellKey(x,y))),combined=[...assets.structures,...assets.walls,...assets.props,...assets.decorations];
  const add=(room,asset,angleIndex=0,template="ruins")=>{
    if(!asset)return;const angle=(angleIndex/8)*Math.PI*2+rng.next()*.24,radius=Math.max(3,Math.min(room.w,room.h)*(.32+rng.next()*.18));let cellX=clamp(Math.round(room.cx+Math.cos(angle)*radius),2,size-3),cellY=clamp(Math.round(room.cy+Math.sin(angle)*radius),2,size-3);
    if(asset.watercraft){let found=null;for(let r=2;r<9&&!found;r++)for(let a=0;a<12;a++){const x=clamp(Math.round(room.cx+Math.cos(a/12*Math.PI*2)*r),2,size-3),y=clamp(Math.round(room.cy+Math.sin(a/12*Math.PI*2)*r),2,size-3);if(grid[y]?.[x]===2){found={x,y};break;}}if(found){cellX=found.x;cellY=found.y;}else return;}
    if(asset.dock){let found=null;for(let r=2;r<8&&!found;r++)for(let a=0;a<12;a++){const x=clamp(Math.round(room.cx+Math.cos(a/12*Math.PI*2)*r),2,size-3),y=clamp(Math.round(room.cy+Math.sin(a/12*Math.PI*2)*r),2,size-3);if(grid[y]?.[x]===1&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>grid[y+dy]?.[x+dx]===2)){found={x,y};break;}}if(found){cellX=found.x;cellY=found.y;}}
    const solid=!asset.watercraft&&asset.collision!=="none"&&asset.collision!=="traversable",baseAngle=angle;
    let chosen=null;
    // Alternative positions are deterministic and consume no extra RNG, so
    // entity generation remains stable while large footprints get room.
    for(let attempt=0;attempt<10&&!chosen;attempt++){
      const candidateAngle=baseAngle+attempt*2.399963229728653,candidateRadius=radius+Math.floor(attempt/4);
      const x=attempt?clamp(Math.round(room.cx+Math.cos(candidateAngle)*candidateRadius),2,size-3):cellX;
      const y=attempt?clamp(Math.round(room.cy+Math.sin(candidateAngle)*candidateRadius),2,size-3):cellY;
      const candidateKey=cellKey(x,y);
      if(occupied.has(candidateKey)||(!asset.watercraft&&grid[y]?.[x]!==1)||Math.hypot(x-room.cx,y-room.cy)<2.2)continue;
      if(pathLookup.has(candidateKey)&&!asset.touchPath&&!asset.dock)continue;
      chosen={x,y,key:candidateKey};
    }
    if(!chosen)return;cellX=chosen.x;cellY=chosen.y;
    const presentation=presentationFromAsset(asset,rng.next()),candidate={id:`cenario-${placements.length}`,assetId:asset.id,path:asset.path,x:(cellX+.5)*CELL,y:(cellY+.82)*CELL,cellX,cellY,layer:asset.layer,collision:asset.watercraft?"none":asset.collision,roomId:room.id,composition:template,facing:"path",...presentation};
    if(solid){const box=propCollisionBounds(candidate),padding=Math.max(4,Number(asset.minClearRadius||0)*4);if(solidBounds.some((other)=>rectangleOverlap(box,other,padding)))return;solidBounds.push(box);}
    occupied.add(chosen.key);placements.push(candidate);
  };
  for(const room of rooms){const template=compositionName(grammar,family,room),density=room.type==="entrance"?2:room.type==="exit"?3:room.type==="story"?8:room.type==="treasure"?6:5;for(let i=0;i<density;i++){let pool=assets.decorations;if(i===0&&["story","altar","risk","exit"].includes(room.type))pool=assets.structures.length?assets.structures:assets.props;else if(i<2&&assets.props.length)pool=assets.props;pool=matchingAssets(pool.length?pool:combined,template);add(room,rng.pick(pool),i,template);}}
  return placements.slice(0,Math.min(150,Math.floor(size*1.55)));
}

function removePropsCoveringGameplay(props,entities) {
  const protectedEntities=entities.filter((entity)=>entity.type==="encounter"||entity.objective||["entrance","exit","chest","rest","event","living-altar","valve","node","echo","memory","key","rune"].includes(entity.type));
  return props.filter((prop)=>{
    const [visualWidth=0,visualDepth=0]=prop.visualFootprint||[0,0],box=propCollisionBounds(prop),solid=prop.collision!=="none"&&prop.collision!=="traversable";
    return !protectedEntities.some((entity)=>{
      const critical=entity.objective||["entrance","exit"].includes(entity.type),padding=critical?34:entity.type==="encounter"?24:18;
      if(solid&&entity.x>box.x-padding&&entity.x<box.x+box.w+padding&&entity.y>box.y-padding&&entity.y<box.y+box.h+padding)return true;
      return Math.abs(entity.x-prop.x)<Math.max(padding,visualWidth*.38)&&Math.abs(entity.y-prop.y)<Math.max(padding,visualDepth*.75);
    });
  });
}

function entityAt(room,offset=0) {const angle=offset*2.399;return{x:(room.cx+.5+Math.cos(angle)*Math.min(2,room.w/4))*CELL,y:(room.cy+.72+Math.sin(angle)*Math.min(2,room.h/4))*CELL,cellX:clamp(Math.round(room.cx+Math.cos(angle)*Math.min(2,room.w/4)),1,999),cellY:clamp(Math.round(room.cy+Math.sin(angle)*Math.min(2,room.h/4)),1,999)};}

function buildObjective(floor,rng,rooms,entities) {
  let candidates=TOWER_OBJECTIVES;
  if(floor%10===0)candidates=TOWER_OBJECTIVES.filter((item)=>item.id==="guardian");
  else if(floor%5===0)candidates=TOWER_OBJECTIVES.filter((item)=>["guardian","nodes","ambush"].includes(item.id));
  const definition=rng.pick(candidates),objective={...definition,progress:0,completed:["reach","escape"].includes(definition.id),sequence:[]};
  const sideRooms=rng.shuffle(rooms.filter((room)=>!["entrance","exit"].includes(room.type)));
  const addTargets=(type,count)=>{for(let i=0;i<count;i++){const room=sideRooms[i%sideRooms.length],pos=entityAt(room,i+1);entities.push({id:`objetivo-${definition.id}-${i}`,type,objective:true,label:definition.verb,index:i,...pos});}};
  if(["valves","disable"].includes(definition.id))addTargets("valve",definition.targets);
  if(definition.id==="nodes")addTargets("node",definition.targets);
  if(definition.id==="rescue")addTargets("echo",1);
  if(definition.id==="memory")addTargets("memory",1);
  if(definition.id==="key")addTargets("key",1);
  if(definition.id==="choice")addTargets("choice",1);
  if(definition.id==="altar")addTargets("living-altar",1);
  if(definition.id==="runes"){addTargets("rune",3);objective.sequence=[0,1,2];}
  return objective;
}

function encounterConfig(floor,familyIndex,hybridIndex,mutation,rng,kind="normal",id="") {
  const pool=towerEnemyPool(familyIndex,hybridIndex),normal=pool.filter((entry)=>entry.kind==="normal"),mini=pool.filter((entry)=>entry.kind==="miniboss"),boss=pool.filter((entry)=>entry.kind==="boss");
  const major=kind==="boss",elite=kind==="elite"||major,source=major?rng.pick(boss):kind==="elite"?rng.pick(mini.length?mini:normal):rng.pick(normal),count=major?1:clamp(2+Math.floor(floor/18)+(rng.chance(.36)?1:0),2,4),enemies=[source];
  while(enemies.length<count)enemies.push(rng.pick(normal));
  return{id,kind,enemyIds:enemies.map((entry)=>entry.id),enemyRegions:enemies.map((entry)=>entry.region),enemyKinds:enemies.map((entry)=>entry.kind),level:Math.max(1,Math.round(1+floor*.72)),elite,major,modifier:elite?mutation:null,allowFlee:!elite,reward:{xp:45+floor*8,currency:20+floor*3,towerCurrency:(elite?3:1)+Math.floor(floor/10)},title:major?towerBossName(floor,rng.next()):elite?`Sentinela ${mutation.name}`:"Convergência da Ferida"};
}

function buildEntities(floor,rooms,entrance,exit,familyIndex,hybridIndex,mutation,rng) {
  const entities=[{id:"entrada",type:"entrance",label:"Entrada da incursão",...entityAt(entrance)},{id:"saida",type:"exit",label:"Subir ao próximo andar",locked:true,...entityAt(exit)}];
  const combatRooms=rooms.filter((room)=>room.type==="combat"),risk=rooms.find((room)=>room.type==="risk"),treasures=rooms.filter((room)=>room.type==="treasure"),rest=rooms.find((room)=>room.type==="rest"),event=rooms.find((room)=>room.type==="event"),altar=rooms.find((room)=>room.type==="altar");
  combatRooms.slice(0,clamp(2+Math.floor(floor/12),2,5)).forEach((room,index)=>{const pos=entityAt(room,index);entities.push({id:`encontro-${index}`,type:"encounter",label:"Eco hostil",patrol:true,guard:room.type==="risk",encounter:encounterConfig(floor,familyIndex,hybridIndex,mutation,rng,"normal",`encontro-${index}`),...pos,spawnX:pos.x,spawnY:pos.y});});
  if(risk){const pos=entityAt(risk,1);entities.push({id:"sentinela-risco",type:"encounter",label:"Sentinela da recompensa",patrol:true,guard:true,encounter:encounterConfig(floor,familyIndex,hybridIndex,mutation,rng,"elite","sentinela-risco"),...pos,spawnX:pos.x,spawnY:pos.y});}
  if(floor%5===0){const room=rooms.filter((entry)=>entry!==entrance&&entry!==exit).sort((a,b)=>roomDistance(b,entrance)-roomDistance(a,entrance))[0],pos=entityAt(room,2);entities.push({id:"guardiao-andar",type:"encounter",label:floor%10===0?towerBossName(floor,rng.next()):"Guardião de elite",patrol:false,guard:true,objective:true,encounter:encounterConfig(floor,familyIndex,hybridIndex,mutation,rng,floor%10===0?"boss":"elite","guardiao-andar"),...pos,spawnX:pos.x,spawnY:pos.y});}
  treasures.slice(0,2).forEach((room,index)=>entities.push({id:`bau-${index}`,type:"chest",label:"Tesouro orgânico",...entityAt(room,index)}));
  if(rest)entities.push({id:"repouso",type:"rest",label:"Câmara de repouso",...entityAt(rest,1)});
  if(event)entities.push({id:"evento",type:"event",label:"Memória reconstruída",...entityAt(event,2)});
  if(altar)entities.push({id:"altar",type:"living-altar",label:"Altar vivo",...entityAt(altar,3)});
  const objective=buildObjective(floor,rng,rooms,entities);
  if(objective.id==="guardian"&&!entities.some((entry)=>entry.objective&&entry.type==="encounter")){const enemy=entities.find((entry)=>entry.type==="encounter");if(enemy){enemy.objective=true;enemy.label="Guardião da passagem";enemy.encounter.kind="elite";enemy.encounter.elite=true;enemy.encounter.modifier=mutation;enemy.encounter.title=`Sentinela ${mutation.name}`;enemy.encounter.allowFlee=false;enemy.encounter.reward.towerCurrency+=2;}}
  if(objective.id==="ambush"){const target=entities.find((entry)=>entry.type==="event");if(target){target.type="encounter";target.label="Emboscada da torre";target.objective=true;target.encounter=encounterConfig(floor,familyIndex,hybridIndex,mutation,rng,"elite",target.id);target.spawnX=target.x;target.spawnY=target.y;target.patrol=false;}}
  return{entities,objective};
}

function buildAttempt(options,attempt=0) {
  const {runSeed,floor=1,difficulty=1,route="lucas"}=options,overrides=options.overrides||null,seed=towerFloorSeed(runSeed,floor,difficulty,route,overrides),rng=new TowerRandom(`${seed}|tentativa:${attempt}`),size=GRID_SIZES[clamp(Math.floor((floor-1)/10),0,GRID_SIZES.length-1)],automaticFamily=(floor-1)%10,forcedFamily=TOWER_FAMILIES.findIndex((entry)=>entry.id===overrides?.familyId),familyIndex=forcedFamily>=0?forcedFamily:automaticFamily,family=TOWER_FAMILIES[familyIndex]||TOWER_FAMILIES[automaticFamily];
  const hybridsUnlocked=floor>10&&(floor%3===0||floor%20===0),forcedHybrid=TOWER_FAMILIES.findIndex((entry)=>entry.id===overrides?.hybridId),hybridIndex=forcedHybrid>=0?forcedHybrid:hybridsUnlocked?(familyIndex+1+rng.int(0,8))%10:null,hybrid=hybridIndex===null?null:TOWER_FAMILIES[hybridIndex],grammar=TOWER_GRAMMARS.find((entry)=>entry.id===overrides?.grammarId)||TOWER_GRAMMARS[(hashString(seed)+attempt)%TOWER_GRAMMARS.length],mutation=TOWER_MUTATIONS.find((entry)=>entry.id===overrides?.mutationId)||TOWER_MUTATIONS[(hashString(`${seed}|mutacao`)+Math.floor(floor/5))%TOWER_MUTATIONS.length],rooms=roomCandidates(grammar,size,rng),edges=graphEdges(rooms,rng),grid=makeGrid(size,0);
  rooms.forEach((room)=>carveRoom(grid,room));edges.forEach((edge)=>{edge.centerline=carveLine(grid,rooms[edge.a],rooms[edge.b],rng,1);});
  const [entrance,exit]=farthestPair(rooms);assignRooms(rooms,entrance,exit,rng);addHazards(grid,rooms,rng,grammar);
  const paths=corridorCells(grid,rooms),pools=assetPools(family,hybrid),assets=selectFloorAssets(rng,pools),generatedProps=buildProps(rooms,grid,assets,rng,size,grammar,family,paths),{entities,objective}=buildEntities(floor,rooms,entrance,exit,familyIndex,hybridIndex,mutation,rng),props=removePropsCoveringGameplay(generatedProps,entities);
  const spawn=entityAt(entrance),difficultyScale=1+Math.log2(Math.max(1,floor))*.085+Math.max(0,Number(difficulty)-1)*.12;
  const result={version:1,seed,floor,floorSeed:resolvedFloorSeed(seed,overrides),route,difficulty,difficultyScale,size,cellSize:CELL,world:{w:size*CELL,h:size*CELL},familyIndex,family,hybridIndex,hybrid,grammar,mutation,developerOverrides:overrides||null,whisper:TOWER_WHISPERS[hashString(`${seed}|sussurro`)%TOWER_WHISPERS.length],grid:grid.map((row)=>Array.from(row)),pathCells:paths,bridgeCells:["ilhas-afogadas","plataformas-arcanas"].includes(grammar.id)?paths:[],rooms,edges,entranceRoomId:entrance.id,exitRoomId:exit.id,spawn:{x:spawn.x,y:spawn.y,cellX:entrance.cx,cellY:entrance.cy},assets,props,entities,objective,createdFromManifest:TOWER_MANIFEST_META.assetCount};
  result.visualPlan=createVisualTerrainPlan(result);return result;
}

function fallbackFloor(options) {
  const floor=Math.max(1,Number(options.floor)||1),size=64,grid=makeGrid(size,0),rooms=[],edges=[];for(let i=0;i<8;i++){const room=rectRoom(`sala-${i}`,8+i*7,12+(i%2)*34,9,9,"rect");rooms.push(room);carveRoom(grid,room);if(i)edges.push({a:i-1,b:i,centerline:carveLine(grid,rooms[i-1],room,new TowerRandom(`${options.runSeed}|fallback|${i}`))});}
  const seed=towerFloorSeed(options.runSeed,floor,options.difficulty||1,options.route||"lucas",options.overrides||null),rng=new TowerRandom(`${seed}|fallback`),automaticFamily=(floor-1)%10,forcedFamily=TOWER_FAMILIES.findIndex((entry)=>entry.id===options.overrides?.familyId),familyIndex=forcedFamily>=0?forcedFamily:automaticFamily,family=TOWER_FAMILIES[familyIndex],grammar=TOWER_GRAMMARS.find((entry)=>entry.id===options.overrides?.grammarId)||TOWER_GRAMMARS[0],mutation=TOWER_MUTATIONS.find((entry)=>entry.id===options.overrides?.mutationId)||TOWER_MUTATIONS[(floor-1)%TOWER_MUTATIONS.length],entrance=rooms[0],exit=rooms.at(-1);assignRooms(rooms,entrance,exit,rng);const assets=selectFloorAssets(rng,assetPools(family,null)),{entities,objective}=buildEntities(floor,rooms,entrance,exit,familyIndex,null,mutation,rng),spawn=entityAt(entrance);
  const paths=corridorCells(grid,rooms),generatedProps=buildProps(rooms,grid,assets,rng,size,grammar,family,paths),result={version:1,seed,floor,floorSeed:resolvedFloorSeed(seed,options.overrides),route:options.route||"lucas",difficulty:options.difficulty||1,difficultyScale:1+Math.log2(floor)*.085,size,cellSize:CELL,world:{w:size*CELL,h:size*CELL},familyIndex,family,hybridIndex:null,hybrid:null,grammar,mutation,developerOverrides:options.overrides||null,whisper:TOWER_WHISPERS[floor%TOWER_WHISPERS.length],grid:grid.map((row)=>Array.from(row)),pathCells:paths,bridgeCells:[],rooms,edges,entranceRoomId:entrance.id,exitRoomId:exit.id,spawn:{x:spawn.x,y:spawn.y,cellX:entrance.cx,cellY:entrance.cy},assets,props:removePropsCoveringGameplay(generatedProps,entities),entities,objective,createdFromManifest:TOWER_MANIFEST_META.assetCount,fallback:true};
  result.visualPlan=createVisualTerrainPlan(result);return result;
}

export function validateTowerFloor(floor) {
  const errors=[],finite=(value)=>Number.isFinite(value),size=floor?.size,grid=floor?.grid,entities=Array.isArray(floor?.entities)?floor.entities:[],props=Array.isArray(floor?.props)?floor.props:[],rooms=Array.isArray(floor?.rooms)?floor.rooms:[];
  if(!Number.isInteger(size)||size<64||size>96)errors.push("tamanho de grade inválido");
  if(!Array.isArray(grid)||grid.length!==size||grid.some((row)=>row.length!==size))errors.push("grade incompleta");
  const entrance=entities.find((entry)=>entry.type==="entrance"),exit=entities.find((entry)=>entry.type==="exit");if(!entrance)errors.push("entrada ausente");if(!exit)errors.push("saída ausente");
  if(entrance&&exit&&grid?.length){
    const seen=flood(grid,{x:entrance.cellX,y:entrance.cellY});if(!seen.has(cellKey(exit.cellX,exit.cellY)))errors.push("saída inacessível");
    for(const entity of entities.filter((entry)=>entry.objective))if(!seen.has(cellKey(entity.cellX,entity.cellY)))errors.push(`objetivo inacessível: ${entity.id}`);
    for(const room of rooms)if(!seen.has(cellKey(room.cx,room.cy)))errors.push(`sala desconectada: ${room.id}`);
    const spawnCell={x:Math.floor(Number(floor.spawn?.x)/CELL),y:Math.floor(Number(floor.spawn?.y)/CELL)};if(!finite(floor.spawn?.x)||!finite(floor.spawn?.y)||grid[spawnCell.y]?.[spawnCell.x]!==1)errors.push("nascimento inseguro");else for(const [dx,dy] of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(grid[spawnCell.y+dy]?.[spawnCell.x+dx]!==1)errors.push("raio seguro da entrada incompleto");
  }
  const entityIds=new Set();for(const entity of entities){if(entityIds.has(entity.id))errors.push(`entidade duplicada: ${entity.id}`);entityIds.add(entity.id);if(!finite(entity.x)||!finite(entity.y))errors.push(`posição inválida: ${entity.id}`);if(entity.x<0||entity.y<0||entity.x>floor.world.w||entity.y>floor.world.h)errors.push(`entidade fora do mapa: ${entity.id}`);if(grid?.[entity.cellY]?.[entity.cellX]!==1)errors.push(`entidade em superfície inválida: ${entity.id}`);if(entity.type==="chest"){const exits=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>grid?.[entity.cellY+dy]?.[entity.cellX+dx]===1).length;if(exits<2)errors.push(`baú bloqueia passagem: ${entity.id}`);}}
  const propIds=new Set(),solidProps=[];for(const prop of props){if(propIds.has(prop.id))errors.push(`cenário duplicado: ${prop.id}`);propIds.add(prop.id);if(!finite(prop.x)||!finite(prop.y)||!finite(prop.height))errors.push(`cenário inválido: ${prop.id}`);if(prop.x<0||prop.y<0||prop.x>floor.world.w||prop.y>floor.world.h)errors.push(`cenário fora do mapa: ${prop.id}`);if(!MANIFEST_PATHS.has(prop.path))errors.push(`cenário sem manifesto: ${prop.id}`);if(!Array.isArray(prop.groundAnchor)||!finite(prop.groundAnchor[0])||!finite(prop.groundAnchor[1]))errors.push(`âncora inválida: ${prop.id}`);const room=rooms.find((entry)=>entry.id===prop.roomId);if(prop.collision!=="none"&&prop.collision!=="traversable"){const box=propCollisionBounds(prop);if(room){const centerX=(room.cx+.5)*CELL,centerY=(room.cy+.72)*CELL;if(centerX>box.x-CELL*.42&&centerX<box.x+box.w+CELL*.42&&centerY>box.y-CELL*.42&&centerY<box.y+box.h+CELL*.42)errors.push(`estrutura bloqueia o centro da sala: ${prop.id}`);}if(solidProps.some((entry)=>rectangleOverlap(box,entry.box,2)))errors.push(`cenários sólidos sobrepostos: ${prop.id}`);solidProps.push({prop,box});}}
  for(const encounter of entities.filter((entry)=>entry.type==="encounter")){if(props.some((prop)=>{if(prop.collision==="none"||prop.collision==="traversable")return false;const box=propCollisionBounds(prop);return encounter.x>box.x-10&&encounter.x<box.x+box.w+10&&encounter.y>box.y-8&&encounter.y<box.y+box.h+8;}))errors.push(`inimigo dentro de cenário sólido: ${encounter.id}`);}
  for(const bridge of floor?.bridgeCells||[]){if(grid?.[bridge[1]]?.[bridge[0]]!==1)errors.push("ponte fora de uma passagem válida");else if(![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>grid?.[bridge[1]+dy]?.[bridge[0]+dx]===1))errors.push("ponte sem conexão válida");}
  for(const path of floor?.pathCells||[])if(grid?.[path[1]]?.[path[0]]!==1)errors.push("rota obrigatória cruza risco profundo");
  if(props.length>160)errors.push("excesso de objetos");
  const assetPaths=[...Object.values(floor?.assets||{}).flat(),...props].map((entry)=>entry?.path).filter(Boolean);if(assetPaths.some((path)=>!MANIFEST_PATHS.has(path)))errors.push("caminho de recurso ausente do manifesto");
  const visualValidation=validateVisualTerrainPlan(floor);if(!visualValidation.valid)errors.push(...visualValidation.errors);
  const counts={walkable:grid?.reduce?.((sum,row)=>sum+row.filter((cell)=>cell===1).length,0)||0,blocked:grid?.reduce?.((sum,row)=>sum+row.filter((cell)=>cell===0).length,0)||0,hazards:grid?.reduce?.((sum,row)=>sum+row.filter((cell)=>cell===2).length,0)||0,props:props.length,solidProps:solidProps.length,enemies:entities.filter((entry)=>entry.type==="encounter").length,entities:entities.length,bridges:floor?.bridgeCells?.length||0,paths:floor?.pathCells?.length||0};
  return{valid:errors.length===0,errors:[...new Set(errors)],counts};
}

export function generateTowerFloor(options) {
  const rawOverrides=options?.overrides||{},overrides={familyId:typeof rawOverrides.familyId==="string"?rawOverrides.familyId:null,hybridId:typeof rawOverrides.hybridId==="string"?rawOverrides.hybridId:null,grammarId:typeof rawOverrides.grammarId==="string"?rawOverrides.grammarId:null,mutationId:typeof rawOverrides.mutationId==="string"?rawOverrides.mutationId:null,floorSeed:Number.isFinite(Number(rawOverrides.floorSeed))?Number(rawOverrides.floorSeed)>>>0:null};
  const normalized={runSeed:String(options?.runSeed||"VOZ-PARTIDA"),floor:Math.max(1,Math.floor(Number(options?.floor)||1)),difficulty:Math.max(.5,Number(options?.difficulty)||1),route:options?.route==="timbo"?"timbo":"lucas",overrides:Object.values(overrides).some((value)=>value!==null&&value!=="")?overrides:null};
  for(let attempt=0;attempt<7;attempt++){const floor=applyTowerFloorOverride(buildAttempt(normalized,attempt));rebuildTowerVisualPlan(floor);const validation=validateTowerFloor(floor);if(validation.valid)return floor;}
  const fallback=applyTowerFloorOverride(fallbackFloor(normalized));rebuildTowerVisualPlan(fallback);const validation=validateTowerFloor(fallback);if(!validation.valid)throw new Error(`Falha na geração segura da Torre da Carne: ${validation.errors.join(", ")}`);return fallback;
}

export function rebuildTowerVisualPlan(floor){if(!floor)return null;floor.visualPlan=createVisualTerrainPlan(floor);return floor.visualPlan;}

export function validateTowerSeeds(count=500,options={}) {
  const failures=[],signatures=new Set(),grammars=new Set(),families=new Set(),manifest=validateTowerManifestVisuals(),visualStats={hybridFloors:0,milestoneFloors:0,minDominantRatio:1,maxDominantRatio:0,maxPatches:0};
  if(!manifest.valid)failures.push({index:-1,errors:manifest.errors});
  for(let index=0;index<count;index++){const floorNumber=1+(index%Math.max(60,options.maxFloor||120)),base={runSeed:`VALIDACAO-${Math.floor(index/Math.max(60,options.maxFloor||120))}-${index}`,floor:floorNumber,difficulty:1+(index%4)*.2,route:index%2?"lucas":"timbo"},first=generateTowerFloor(base),second=generateTowerFloor(base),check=validateTowerFloor(first),visualSignature=visualTerrainSignature(first.visualPlan),signature=JSON.stringify([first.floorSeed,first.grammar.id,first.family.id,first.hybrid?.id,first.rooms.map((room)=>[room.cx,room.cy,room.type]),first.entities.map((entry)=>[entry.id,entry.cellX,entry.cellY]),visualSignature]);
    if(!check.valid)failures.push({index,errors:check.errors});if(signature!==JSON.stringify([second.floorSeed,second.grammar.id,second.family.id,second.hybrid?.id,second.rooms.map((room)=>[room.cx,room.cy,room.type]),second.entities.map((entry)=>[entry.id,entry.cellX,entry.cellY]),visualTerrainSignature(second.visualPlan)]))failures.push({index,errors:["geração visual não determinística"]});signatures.add(signature);grammars.add(first.grammar.id);families.add(first.family.id);if(first.hybrid)visualStats.hybridFloors++;if(first.floor%10===0)visualStats.milestoneFloors++;visualStats.minDominantRatio=Math.min(visualStats.minDominantRatio,first.visualPlan.statistics.dominantRatio);visualStats.maxDominantRatio=Math.max(visualStats.maxDominantRatio,first.visualPlan.statistics.dominantRatio);visualStats.maxPatches=Math.max(visualStats.maxPatches,first.visualPlan.statistics.patches);
  }
  return{valid:failures.length===0,count,failures,uniqueFloors:signatures.size,grammars:[...grammars],families:[...families],manifestAssets:TOWER_MANIFEST_META.assetCount,manifestVersion:TOWER_MANIFEST_META.version,visualStats};
}
