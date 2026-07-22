import { TOWER_ASSETS, TOWER_MANIFEST_META } from "./tower_manifest.js";
import { TOWER_CONFIG } from "./tower_data.js";

const CARDINAL=Object.freeze([
  {dx:0,dy:-1,bit:1,opposite:4,name:"north"},
  {dx:1,dy:0,bit:2,opposite:8,name:"east"},
  {dx:0,dy:1,bit:4,opposite:1,name:"south"},
  {dx:-1,dy:0,bit:8,opposite:2,name:"west"}
]);
const DIAGONAL=Object.freeze([
  {dx:0,dy:-1,bit:1},{dx:1,dy:-1,bit:2},{dx:1,dy:0,bit:4},{dx:1,dy:1,bit:8},
  {dx:0,dy:1,bit:16},{dx:-1,dy:1,bit:32},{dx:-1,dy:0,bit:64},{dx:-1,dy:-1,bit:128}
]);
const VALID_SURFACE_MODES=new Set(["full","irregular-patch","edge","linear","structure","prop","decoration"]);
const VALID_TILE_ROLES=new Set(["base","hazard","path","boundary","transition","bridge","structure","prop","decoration"]);
const MANIFEST_BY_PATH=new Map(TOWER_ASSETS.map((asset)=>[asset.path,asset]));
const MANIFEST_BY_ID=new Map(TOWER_ASSETS.map((asset)=>[asset.id,asset]));
const CELL=TOWER_CONFIG.cellSize;
const SAFE_BASE_GROUPS=Object.freeze({
  regiao_01_glacial:["piso-de-gelo"],
  regiao_02_floresta_ancestral:["piso-de-floresta","terreno-florido"],
  regiao_03_vulcanica:["rocha-vulcanica","pedra-rachada"],
  regiao_04_montanhosa:["piso-de-pedra","piso-pedregoso"],
  regiao_05_selva_tropical:["piso-de-selva","terreno-tropical"],
  regiao_06_vale_outonal:["piso-outonal"],
  regiao_07_costa_oceanica:["areia-e-agua"],
  regiao_08_cavernas_cristalinas:["piso-de-caverna"],
  regiao_09_pantano_sombrio:["piso-de-pantano"],
  regiao_10_reino_arcano:["jardim-arcano"]
});

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const pointKey=(x,y)=>`${x},${y}`;
const text=(value)=>String(value??"");
const hashString=(value)=>{
  const source=String(value??"");let hash=2166136261;
  for(let index=0;index<source.length;index++){hash^=source.charCodeAt(index);hash=Math.imul(hash,16777619);}
  return hash>>>0;
};
const choose=(list,seed)=>list?.length?list[hashString(seed)%list.length]:null;
const bits=(value)=>{let count=0;for(let bit=value;bit;bit>>>=1)count+=bit&1;return count;};

function parseHex(value,fallback="#5c4a48") {
  const match=/^#([0-9a-f]{6})$/i.exec(value||"");
  if(!match)return parseHex(fallback,"#5c4a48");
  const number=Number.parseInt(match[1],16);
  return[(number>>16)&255,(number>>8)&255,number&255];
}

function mixHex(a,b,amount=.5) {
  const aa=parseHex(a),bb=parseHex(b),mix=(index)=>Math.round(aa[index]+(bb[index]-aa[index])*amount).toString(16).padStart(2,"0");
  return`#${mix(0)}${mix(1)}${mix(2)}`;
}

function roomContains(room,x,y,inset=0) {
  const rx=Math.max(1,Math.floor(room.w/2)-inset),ry=Math.max(1,Math.floor(room.h/2)-inset),dx=x-room.cx,dy=y-room.cy;
  if(Math.abs(dx)>rx||Math.abs(dy)>ry)return false;
  return room.shape!=="ellipse"||(dx/rx)**2+(dy/ry)**2<=1.05;
}

function roomForCell(rooms,x,y) {
  let result=null,best=Infinity;
  for(const room of rooms){if(!roomContains(room,x,y))continue;const score=Math.hypot(x-room.cx,y-room.cy);if(score<best){best=score;result=room;}}
  return result;
}

function groupVisualAssets(region,role) {
  const safeGroups=role==="base"?SAFE_BASE_GROUPS[region]:null;
  const candidates=TOWER_ASSETS.filter((asset)=>asset.region===region&&asset.tileRole===role&&asset.isFullTile&&asset.surfaceMode==="full"&&(!["base","hazard"].includes(role)||!asset.isTransition)&&(!safeGroups||safeGroups.includes(asset.variantGroup)));
  const groups=new Map();
  for(const asset of candidates){const group=asset.variantGroup||asset.visualFamily||asset.sourceCategory||asset.name;if(!groups.has(group))groups.set(group,[]);groups.get(group).push(asset);}
  return[...groups.entries()].map(([key,assets])=>({key,assets:assets.sort((a,b)=>a.id.localeCompare(b.id))})).sort((a,b)=>a.key.localeCompare(b.key));
}

function fallbackVisualGroup(region,role) {
  const legacy=TOWER_ASSETS.filter((asset)=>asset.region===region&&asset.category==="terrain"&&(role!=="hazard"||asset.hazard));
  if(!legacy.length)return null;
  return{key:`legacy-${role}-${region}`,assets:legacy.sort((a,b)=>a.id.localeCompare(b.id))};
}

function pickGroup(region,role,seed,{exclude=null,fallback=null}={}) {
  const groups=groupVisualAssets(region,role).filter((group)=>group.key!==exclude);
  const selected=choose(groups,`${seed}|grupo|${region}|${role}`)||fallback||fallbackVisualGroup(region,role);
  if(!selected)return null;
  if(!selected.assets)return{...selected,key:selected.role===role?selected.key:`${selected.key}:${role}`,role};
  const quality=(asset)=>(asset.visibleFill||0)-(asset.seamRisk||0)*.62-Math.max(0,(asset.variationIndex||1)-2)*.045+(role==="hazard"?(asset.blueRatio||0)*.22:0);
  const ranked=[...selected.assets].sort((a,b)=>quality(b)-quality(a)||a.id.localeCompare(b.id));
  const primary=choose(ranked.slice(0,Math.min(3,ranked.length)),`${seed}|asset|${region}|${role}|${selected.key}`)||ranked[0];
  return{
    key:`${region}:${selected.key}`,region,role,variantGroup:selected.key,
    visualFamily:primary?.visualFamily||`${region}:${selected.key}`,
    assetId:primary?.id||null,assetPath:primary?.path||null,assetName:primary?.name||"superfície procedural",
    canMirror:primary?.canMirror!==false,canRotate:Boolean(primary?.canRotate),textureInset:primary?.textureInset||.18,seamRisk:primary?.seamRisk||0,
    sourceCategory:primary?.sourceCategory||"",alternatives:selected.assets.slice(0,4).map((asset)=>asset.id),
    variants:selected.assets.slice(0,8).map((asset)=>({id:asset.id,path:asset.path,name:asset.name,connectionType:asset.connectionType,canRotate:Boolean(asset.canRotate)}))
  };
}

function alternateSpec(spec,seed) {
  if(!spec)return null;
  const candidates=(spec.alternatives||[]).map((id)=>MANIFEST_BY_ID.get(id)).filter((asset)=>asset&&asset.id!==spec.assetId),asset=choose(candidates,`${seed}|alternativa|${spec.key}`);
  if(!asset)return spec;
  return{...spec,key:`${spec.key}:variation`,assetId:asset.id,assetPath:asset.path,assetName:asset.name,canMirror:asset.canMirror!==false,canRotate:Boolean(asset.canRotate),textureInset:asset.textureInset||.18,seamRisk:asset.seamRisk||0};
}

function paletteFor(family,hybrid,groups) {
  const secondaryFamily=hybrid||family,base=family.palette[2],surface=family.palette[1],accent=family.palette[0],secondaryBase=secondaryFamily.palette[2],secondarySurface=secondaryFamily.palette[1],secondaryAccent=secondaryFamily.palette[0];
  return{
    dominant:{...groups.dominant,color:mixHex(base,surface,.34),detailColor:mixHex(surface,accent,.42)},
    secondary:{...groups.secondary,color:mixHex(secondaryBase,secondarySurface,.42),detailColor:mixHex(secondarySurface,secondaryAccent,.48)},
    hazardPrimary:{...groups.hazardPrimary,color:mixHex(surface,"#101729",.34),detailColor:mixHex(accent,"#ffffff",.18)},
    hazardSecondary:{...groups.hazardSecondary,color:mixHex(secondarySurface,"#171120",.31),detailColor:mixHex(secondaryAccent,"#ffffff",.18)},
    path:{...groups.path,color:mixHex(accent,"#8b633f",.6),edgeColor:mixHex(base,"#07060a",.28),highlightColor:mixHex(accent,"#fff1c8",.48)},
    void:{color:mixHex(base,"#020106",.78),veinColor:mixHex(accent,"#270516",.65)},
    boundary:{color:mixHex(base,"#020207",.46),highlightColor:mixHex(surface,accent,.5),hazardColor:mixHex(surface,"#110713",.46)}
  };
}

function roomZones(rooms,edges,seed,hasSecondary,hybrid) {
  const result=new Map(rooms.map((room)=>[room.id,"primary"]));
  if(!hasSecondary||rooms.length<3)return result;
  const adjacency=rooms.map(()=>[]);
  for(const edge of edges||[]){if(!rooms[edge.a]||!rooms[edge.b])continue;adjacency[edge.a].push(edge.b);adjacency[edge.b].push(edge.a);}
  const candidates=rooms.map((room,index)=>({room,index})).filter(({room})=>room.type!=="entrance"),roomArea=(room)=>Math.max(1,room.w*room.h*(room.shape==="ellipse"?.78:1)),totalArea=rooms.reduce((sum,room)=>sum+roomArea(room),0),targetArea=totalArea*(hybrid?.36:.22),maxRooms=Math.max(2,rooms.length-2);
  const anchor=choose(candidates,`${seed}|zona-secundaria`)||candidates[0],selected=new Set(),queue=[anchor.index];let selectedArea=0;
  while(queue.length&&(selected.size<2||selectedArea<targetArea)&&selected.size<maxRooms){const current=queue.shift();if(selected.has(current))continue;selected.add(current);selectedArea+=roomArea(rooms[current]);const neighbors=[...(adjacency[current]||[])].sort((a,b)=>hashString(`${seed}|vizinho|${current}|${a}`)-hashString(`${seed}|vizinho|${current}|${b}`));queue.push(...neighbors.filter((index)=>!selected.has(index)));}
  if((selected.size<2||selectedArea<targetArea)&&selected.size<maxRooms){const remaining=candidates.map(({index})=>index).filter((index)=>!selected.has(index)).sort((a,b)=>hashString(`${seed}|restante|${a}`)-hashString(`${seed}|restante|${b}`));for(const index of remaining){if(selected.size>=maxRooms||(selected.size>=2&&selectedArea>=targetArea))break;selected.add(index);selectedArea+=roomArea(rooms[index]);}}
  for(const index of selected){const room=rooms[index];if(room&&room.type!=="entrance")result.set(room.id,"secondary");}
  const entrance=rooms.find((room)=>room.type==="entrance");if(entrance)result.set(entrance.id,"primary");
  return result;
}

function buildRoomAndZoneGrids(size,grid,rooms,edges,seed,hasSecondary,hybrid) {
  const roomGrid=Array.from({length:size},()=>Array(size).fill(null)),zones=Array.from({length:size},()=>Array(size).fill(null)),byRoom=roomZones(rooms,edges,seed,hasSecondary,hybrid);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    if(!grid[y]?.[x])continue;
    const direct=roomForCell(rooms,x,y);roomGrid[y][x]=direct?.id||null;
    let nearest=direct,best=direct?0:Infinity;
    if(!nearest)for(const room of rooms){const score=(x-room.cx)**2+(y-room.cy)**2;if(score<best){best=score;nearest=room;}}
    zones[y][x]=byRoom.get(nearest?.id)||"primary";
  }
  for(let pass=0;pass<3;pass++){
    const next=zones.map((row)=>row.slice());
    for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++){
      if(!grid[y][x]||roomForCell(rooms,x,y))continue;let primary=0,secondary=0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;if(zones[y+dy]?.[x+dx]==="secondary")secondary++;else if(zones[y+dy]?.[x+dx]==="primary")primary++;}
      if(secondary>=5)next[y][x]="secondary";else if(primary>=5)next[y][x]="primary";
    }
    for(let y=0;y<size;y++)zones[y]=next[y];
  }
  const seen=new Set();let secondaryCells=0;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    if(zones[y]?.[x]!=="secondary"||seen.has(pointKey(x,y)))continue;const component=[],queue=[{x,y}];seen.add(pointKey(x,y));
    for(let index=0;index<queue.length;index++){const point=queue[index];component.push(point);for(const direction of CARDINAL){const nx=point.x+direction.dx,ny=point.y+direction.dy,k=pointKey(nx,ny);if(!seen.has(k)&&zones[ny]?.[nx]==="secondary"){seen.add(k);queue.push({x:nx,y:ny});}}}
    if(component.length<9)component.forEach((point)=>{zones[point.y][point.x]="primary";});else secondaryCells+=component.length;
  }
  if(hasSecondary&&!secondaryCells){const room=rooms.find((entry)=>byRoom.get(entry.id)==="secondary")||rooms.find((entry)=>entry.type!=="entrance");if(room)for(let y=room.cy-1;y<=room.cy+1;y++)for(let x=room.cx-1;x<=room.cx+1;x++)if(grid[y]?.[x])zones[y][x]="secondary";}
  return{roomGrid,zones};
}

function connectedComponents(size,predicate) {
  const visited=new Set(),components=[];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const value=predicate(x,y);if(value===null||value===undefined||visited.has(pointKey(x,y)))continue;
    const points=[],queue=[{x,y}],token=value;visited.add(pointKey(x,y));
    for(let index=0;index<queue.length;index++){const point=queue[index];points.push(point);for(const direction of CARDINAL){const nx=point.x+direction.dx,ny=point.y+direction.dy,k=pointKey(nx,ny);if(!visited.has(k)&&predicate(nx,ny)===token){visited.add(k);queue.push({x:nx,y:ny});}}}
    components.push({token,points});
  }
  return components;
}

function buildPatchGrid(size,grid,zones) {
  const patches=Array.from({length:size},()=>Array(size).fill(null));let index=0;
  for(const component of connectedComponents(size,(x,y)=>grid[y]?.[x]?`${zones[y][x]}:${grid[y][x]}`:null)){const id=`patch-${String(index++).padStart(3,"0")}`;for(const point of component.points)patches[point.y][point.x]=id;}
  return patches;
}

function buildVisualPathSet(grid,rooms,edges,legacyPaths,props=[]) {
  const result=new Set();
  for(const edge of edges||[]){
    const line=(edge.centerline||[]).map((point)=>Array.isArray(point)?{x:point[0],y:point[1]}:point).filter((point)=>grid[point.y]?.[point.x]===1);if(!line.length)continue;
    const keep=line.map((point)=>!rooms.some((room)=>roomContains(room,point.x,point.y,2)));
    for(let index=0;index<line.length;index++)if(keep[index]||keep[index-1]||keep[index+1])result.add(pointKey(line[index].x,line[index].y));
  }
  if(!result.size)for(const point of legacyPaths||[]){const x=point[0],y=point[1],horizontal=grid[y]?.[x-1]===1&&grid[y]?.[x+1]===1,vertical=grid[y-1]?.[x]===1&&grid[y+1]?.[x]===1;if(horizontal||vertical)result.add(pointKey(x,y));}
  const blocked=new Set(props.filter((prop)=>prop.collision!=="none").map((prop)=>pointKey(prop.cellX,prop.cellY)));for(const blockedKey of blocked)result.delete(blockedKey);
  for(let changed=true;changed;){changed=false;for(const entry of[...result]){const[x,y]=entry.split(",").map(Number),neighbors=CARDINAL.filter((direction)=>result.has(pointKey(x+direction.dx,y+direction.dy))).length;if(!neighbors){result.delete(entry);changed=true;}}}
  return result;
}

function pathRole(mask) {
  if(mask===0)return"isolated";if(mask===15)return"four-way";if(bits(mask)===3)return"t-junction";if(bits(mask)===1)return"end-cap";if(mask===5)return"vertical";if(mask===10)return"horizontal";if(bits(mask)===2)return"corner";return"junction";
}
const PATH_CANONICAL_MASK=Object.freeze({vertical:5,horizontal:10,corner:6,"t-junction":14,"four-way":15});
const rotatePathMask=(value,turns)=>((value<<turns)|(value>>(4-turns)))&15;
function directionalPathVariant(mask,variants=[]) {
  for(const variant of variants){const canonical=PATH_CANONICAL_MASK[variant.connectionType];if(!canonical)continue;for(let turns=0;turns<4;turns++)if(rotatePathMask(canonical,turns)===mask&&(turns===0||variant.canRotate))return{variant,turns};}
  return null;
}

function bridgeAt(grid,x,y,mask,bridgeLookup) {
  if(!bridgeLookup.has(pointKey(x,y)))return false;
  const horizontal=Boolean(mask&(2|8)),vertical=Boolean(mask&(1|4));
  if(horizontal&&(!grid[y-1]?.[x]||!grid[y+1]?.[x]))return true;
  if(vertical&&(!grid[y]?.[x-1]||!grid[y]?.[x+1]))return true;
  return false;
}

function assetSpecForZone(palette,zone,hazard=false) {
  if(hazard)return zone==="secondary"?palette.hazardSecondary:palette.hazardPrimary;
  return zone==="secondary"?palette.secondary:palette.dominant;
}

export function createVisualTerrainPlan({seed,floorSeed,size,grid,rooms,edges,pathCells,bridgeCells,family,hybrid,grammar,props=[]}) {
  const visualSeed=`${seed}|visual-v2|${floorSeed}`;
  const dominant=pickGroup(family.folder,"base",`${visualSeed}|dominante`),hybridBase=hybrid?pickGroup(hybrid.folder,"base",`${visualSeed}|hibrido`):null;
  let secondary=hybridBase||pickGroup(family.folder,"base",`${visualSeed}|secundario`,{exclude:dominant?.variantGroup,fallback:dominant});
  if(!hybrid&&secondary?.key===dominant?.key)secondary=alternateSpec(dominant,`${visualSeed}|secundario`);
  const hasSecondary=Boolean(secondary&&dominant&&secondary.key!==dominant.key);
  const hazardPrimary=pickGroup(family.folder,"hazard",`${visualSeed}|risco`,{fallback:dominant}),hazardSecondary=hybrid?pickGroup(hybrid.folder,"hazard",`${visualSeed}|risco-hibrido`,{fallback:secondary||hazardPrimary}):hazardPrimary;
  const pathGroup=pickGroup(family.folder,"path",`${visualSeed}|caminho`),path={key:pathGroup?.key||`procedural:${family.id}`,region:family.folder,role:"path",variantGroup:pathGroup?.variantGroup||`caminho-${family.id}`,visualFamily:pathGroup?.visualFamily||`${family.id}:procedural-path`,assetId:pathGroup?.assetId||null,assetPath:pathGroup?.assetPath||null,assetName:pathGroup?.assetName||"caminho procedural conectado",variants:pathGroup?.variants||[],canRotate:Boolean(pathGroup?.canRotate)};
  const palette=paletteFor(family,hybrid,{dominant:dominant||{key:`procedural:${family.id}:base`,role:"base"},secondary:secondary||dominant||{key:`procedural:${family.id}:secondary`,role:"base"},hazardPrimary:hazardPrimary||dominant||{key:`procedural:${family.id}:hazard`,role:"hazard"},hazardSecondary:hazardSecondary||hazardPrimary||secondary||dominant||{key:`procedural:${family.id}:hazard-secondary`,role:"hazard"},path});
  const {roomGrid,zones}=buildRoomAndZoneGrids(size,grid,rooms,edges,visualSeed,hasSecondary,hybrid),patches=buildPatchGrid(size,grid,zones),visualPathSet=buildVisualPathSet(grid,rooms,edges,pathCells,props),bridgeLookup=new Set((bridgeCells||[]).map(([x,y])=>pointKey(x,y)));
  const hazardComponents=connectedComponents(size,(x,y)=>grid[y]?.[x]===2?"hazard":null),hazardSizes=new Map();for(const component of hazardComponents)for(const point of component.points)hazardSizes.set(pointKey(point.x,point.y),component.points.length);
  const cells=Array.from({length:size},()=>Array(size).fill(null));
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const collision=grid[y]?.[x]||0;if(!collision)continue;
    const zone=zones[y][x]||"primary",surface=assetSpecForZone(palette,zone,collision===2),pathActive=visualPathSet.has(pointKey(x,y)),pathMask=CARDINAL.reduce((mask,direction)=>mask|(visualPathSet.has(pointKey(x+direction.dx,y+direction.dy))?direction.bit:0),0),pathVariant=pathActive?directionalPathVariant(pathMask,palette.path.variants):null,roomId=roomGrid[y][x];
    cells[y][x]={
      x,y,collision,zone,roomId,patchId:patches[y][x],corridor:collision===1&&!roomId,
      terrainFamily:surface.key,primaryTerrainFamily:palette.dominant.key,secondaryTerrainFamily:palette.secondary.key,hazardFamily:(zone==="secondary"?palette.hazardSecondary:palette.hazardPrimary).key,pathFamily:palette.path.key,
      assetId:surface.assetId||null,assetName:surface.assetName||"superfície procedural",visualVariationIndex:hashString(`${visualSeed}|variacao|${Math.floor(x/4)}|${Math.floor(y/4)}|${roomId||"corredor"}`)%4,
      neighborMask:0,diagonalMask:0,edgeMask:0,hazardEdgeMask:0,transitionMask:0,transition:false,
      pathMask:pathActive?pathMask:0,pathRole:pathActive?pathRole(pathMask):"none",pathAssetId:pathVariant?.variant.id||null,pathAssetPath:pathVariant?.variant.path||null,pathAssetRotation:pathVariant?.turns||0,bridge:pathActive&&bridgeAt(grid,x,y,pathMask,bridgeLookup),
      hazardTrap:collision===2&&(hazardSizes.get(pointKey(x,y))||0)<=2
    };
  }
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const cell=cells[y][x];if(!cell)continue;
    for(const direction of CARDINAL){const neighbor=cells[y+direction.dy]?.[x+direction.dx],neighborCollision=grid[y+direction.dy]?.[x+direction.dx]||0;if(!neighborCollision)cell.edgeMask|=direction.bit;if((cell.collision===1&&neighborCollision===2)||(cell.collision===2&&neighborCollision===1))cell.hazardEdgeMask|=direction.bit;if(neighbor&&neighbor.collision===cell.collision&&neighbor.terrainFamily===cell.terrainFamily)cell.neighborMask|=direction.bit;if(neighbor&&neighbor.collision===cell.collision&&neighbor.terrainFamily!==cell.terrainFamily)cell.transitionMask|=direction.bit;}
    for(const direction of DIAGONAL){const neighbor=cells[y+direction.dy]?.[x+direction.dx];if(neighbor&&neighbor.collision===cell.collision&&neighbor.terrainFamily===cell.terrainFamily)cell.diagonalMask|=direction.bit;}
    cell.transition=Boolean(cell.transitionMask);
  }
  const walkable=cells.flat().filter(Boolean),safeCells=walkable.filter((cell)=>cell.collision===1),secondaryCount=walkable.filter((cell)=>cell.zone==="secondary").length,secondarySafeCount=safeCells.filter((cell)=>cell.zone==="secondary").length,hazardCount=walkable.filter((cell)=>cell.collision===2).length,pathCount=walkable.filter((cell)=>cell.pathRole!=="none").length;
  return{version:2,seed:visualSeed,size,chunkCells:TOWER_CONFIG.chunkCells,palette,cells,visualPathCells:[...visualPathSet].map((entry)=>entry.split(",").map(Number)),statistics:{visibleCells:walkable.length,dominantRatio:safeCells.length?1-secondarySafeCount/safeCells.length:1,secondaryCells:secondaryCount,secondarySafeCells:secondarySafeCount,hazardCells:hazardCount,pathCells:pathCount,patches:new Set(walkable.map((cell)=>cell.patchId)).size,hybrid:Boolean(hybrid),grammar:grammar?.id||"unknown"}};
}

export function visualTerrainSignature(plan) {
  if(!plan)return"visual-plan-missing";let hash=2166136261;
  const add=(value)=>{const valueText=text(value);for(let index=0;index<valueText.length;index++){hash^=valueText.charCodeAt(index);hash=Math.imul(hash,16777619);}};
  add(plan.version);add(plan.seed);for(const key of["dominant","secondary","hazardPrimary","hazardSecondary","path"]){const entry=plan.palette?.[key];add(entry?.key);add(entry?.assetId);}
  for(let y=0;y<plan.size;y++)for(let x=0;x<plan.size;x++){const cell=plan.cells[y]?.[x];if(!cell){add("0");continue;}add(`${cell.collision}:${cell.zone}:${cell.roomId}:${cell.patchId}:${cell.terrainFamily}:${cell.assetId}:${cell.visualVariationIndex}:${cell.neighborMask}:${cell.diagonalMask}:${cell.edgeMask}:${cell.hazardEdgeMask}:${cell.transitionMask}:${cell.pathMask}:${cell.pathRole}:${cell.pathAssetId}:${cell.pathAssetRotation}:${Number(cell.bridge)}:${Number(cell.hazardTrap)}`);}
  return(hash>>>0).toString(16).padStart(8,"0");
}

let manifestValidationCache=null;
export function validateTowerManifestVisuals() {
  if(manifestValidationCache)return manifestValidationCache;
  const errors=[],required=["variantGroup","variationIndex","surfaceMode","tileRole","edgeRole","connectionType","canRotate","canMirror","repeatMode","isFullTile","isIrregularPatch","isTransition","isCliff","isShore","visualFamily","minimumPatchSize","compatibleWith","alphaCoverage","visibleFill","centerEdgeDelta","oppositeEdgeMismatch","seamRisk","textureInset","presentationVersion","groundAnchor","primaryBounds","recommendedWorldHeight","minimumWorldHeight","maximumWorldHeight","scaleClass","shadowWidth","shadowHeight","shadowOffsetY","shadowOpacity","collisionFootprint","collisionOffsetX","collisionOffsetY","visualFootprint","sortOffsetY","allowsRandomScale","randomScaleRange"],paths=new Set();
  if(Number(TOWER_MANIFEST_META?.version)<3)errors.push("manifesto visual anterior à versão 3");
  for(const asset of TOWER_ASSETS){
    if(paths.has(asset.path))errors.push(`recurso duplicado: ${asset.path}`);paths.add(asset.path);
    for(const field of required)if(!(field in asset)){errors.push(`metadado ${field} ausente: ${asset.id}`);break;}
    if(!VALID_SURFACE_MODES.has(asset.surfaceMode))errors.push(`surfaceMode inválido: ${asset.id}`);
    if(!VALID_TILE_ROLES.has(asset.tileRole))errors.push(`tileRole inválido: ${asset.id}`);
    if(!Number.isFinite(asset.width)||asset.width<=0||!Number.isFinite(asset.height)||asset.height<=0)errors.push(`dimensões inválidas: ${asset.id}`);
    if(asset.isFullTile&&asset.surfaceMode!=="full")errors.push(`tile completo sem surfaceMode full: ${asset.id}`);
    if(["base","hazard"].includes(asset.tileRole)&&(!asset.isFullTile||asset.repeatMode!=="tile"))errors.push(`superfície repetível inválida: ${asset.id}`);
    if(asset.isFullTile&&(!Number.isFinite(asset.seamRisk)||asset.seamRisk<0||asset.seamRisk>1||!Number.isFinite(asset.textureInset)||asset.textureInset<.1||asset.textureInset>.35))errors.push(`síntese de textura inválida: ${asset.id}`);
    if(!Array.isArray(asset.compatibleWith))errors.push(`compatibilidade inválida: ${asset.id}`);
    if(!Array.isArray(asset.groundAnchor)||asset.groundAnchor.length!==2||asset.groundAnchor.some((value)=>!Number.isFinite(value)))errors.push(`âncora física inválida: ${asset.id}`);
    if(!Number.isFinite(asset.recommendedWorldHeight)||asset.recommendedWorldHeight<20||asset.recommendedWorldHeight>360||asset.minimumWorldHeight>asset.maximumWorldHeight)errors.push(`escala semântica inválida: ${asset.id}`);
    if(!Array.isArray(asset.collisionFootprint)||!Array.isArray(asset.visualFootprint)||asset.shadowOpacity<0||asset.shadowOpacity>.6)errors.push(`apresentação física inválida: ${asset.id}`);
  }
  for(const region of Object.keys(TOWER_MANIFEST_META?.regions||{}))if(!TOWER_ASSETS.some((asset)=>asset.region===region&&asset.tileRole==="base"&&asset.isFullTile))errors.push(`região sem superfície-base válida: ${region}`);
  manifestValidationCache={valid:errors.length===0,errors,assetCount:TOWER_ASSETS.length};return manifestValidationCache;
}

function componentSizes(plan,filter) {
  return connectedComponents(plan.size,(x,y)=>{const cell=plan.cells[y]?.[x];return cell&&filter(cell)?"selected":null;}).map((component)=>component.points.length);
}

export function validateVisualTerrainPlan(floor) {
  const plan=floor?.visualPlan,errors=[],manifestCheck=validateTowerManifestVisuals();if(!manifestCheck.valid)errors.push(...manifestCheck.errors.slice(0,8));
  if(!plan||plan.version!==2)return{valid:false,errors:[...errors,"plano visual ausente ou inválido"]};
  if(plan.size!==floor.size||plan.cells.length!==floor.size)errors.push("dimensões do plano visual incompatíveis");
  const visualPaths=new Set((plan.visualPathCells||[]).map(([x,y])=>pointKey(x,y)));
  for(let y=0;y<floor.size;y++)for(let x=0;x<floor.size;x++){
    const collision=floor.grid[y]?.[x]||0,cell=plan.cells[y]?.[x]||null;
    if(Boolean(collision)!==Boolean(cell)){errors.push(`decisão visual ausente em ${x},${y}`);continue;}if(!cell)continue;
    if(cell.collision!==collision)errors.push(`colisão visual divergente em ${x},${y}`);
    const expectedPathMask=CARDINAL.reduce((mask,direction)=>mask|(visualPaths.has(pointKey(x+direction.dx,y+direction.dy))?direction.bit:0),0),isPath=visualPaths.has(pointKey(x,y));
    if(isPath&&(cell.pathMask!==expectedPathMask||cell.pathRole!==pathRole(expectedPathMask)))errors.push(`orientação de caminho incompatível em ${x},${y}`);
    if(cell.pathAssetId){const variant=(plan.palette?.path?.variants||[]).find((entry)=>entry.id===cell.pathAssetId),canonical=PATH_CANONICAL_MASK[variant?.connectionType],rotated=canonical===undefined?null:rotatePathMask(canonical,cell.pathAssetRotation||0);if(!variant||rotated!==cell.pathMask)errors.push(`asset direcional incompatível em ${x},${y}`);}
    if(!isPath&&cell.pathRole!=="none")errors.push(`caminho visual fantasma em ${x},${y}`);
    let expectedNeighbors=0,expectedEdges=0,expectedHazardEdges=0,expectedTransitions=0;
    for(const direction of CARDINAL){const neighbor=plan.cells[y+direction.dy]?.[x+direction.dx],neighborCollision=floor.grid[y+direction.dy]?.[x+direction.dx]||0;if(!neighborCollision)expectedEdges|=direction.bit;if((collision===1&&neighborCollision===2)||(collision===2&&neighborCollision===1))expectedHazardEdges|=direction.bit;if(neighbor&&neighbor.collision===cell.collision&&neighbor.terrainFamily===cell.terrainFamily)expectedNeighbors|=direction.bit;if(neighbor&&neighbor.collision===cell.collision&&neighbor.terrainFamily!==cell.terrainFamily)expectedTransitions|=direction.bit;}
    if(cell.neighborMask!==expectedNeighbors||cell.edgeMask!==expectedEdges||cell.hazardEdgeMask!==expectedHazardEdges||cell.transitionMask!==expectedTransitions)errors.push(`máscara visual divergente em ${x},${y}`);
    if(cell.assetId&&!MANIFEST_BY_ID.has(cell.assetId))errors.push(`asset visual ausente: ${cell.assetId}`);
  }
  for(const size of componentSizes(plan,(cell)=>cell.zone==="secondary"))if(size<9)errors.push(`ilha secundária isolada (${size} células)`);
  for(const size of componentSizes(plan,(cell)=>cell.pathRole!=="none"))if(size<2)errors.push("segmento de caminho visual isolado");
  for(const component of connectedComponents(plan.size,(x,y)=>floor.grid[y]?.[x]===2?"hazard":null))if(component.points.length<=2&&component.points.some((point)=>!plan.cells[point.y][point.x].hazardTrap))errors.push("risco isolado sem marca de armadilha");
  for(const prop of floor.props||[])if(prop.collision!=="none"&&visualPaths.has(pointKey(prop.cellX,prop.cellY)))errors.push(`cenário bloqueia rota visual obrigatória: ${prop.id}`);
  for(const type of["entrance","exit"]){const entity=(floor.entities||[]).find((entry)=>entry.type===type);if(!entity)continue;const blocked=(floor.props||[]).some((prop)=>prop.collision!=="none"&&Math.hypot(prop.x-entity.x,prop.y-entity.y)<CELL*.68);if(blocked)errors.push(`${type} visualmente obstruída`);if(floor.grid[entity.cellY]?.[entity.cellX]!==1)errors.push(`${type} fora de superfície legível`);}
  for(let boundary=TOWER_CONFIG.chunkCells;boundary<floor.size;boundary+=TOWER_CONFIG.chunkCells){
    for(let y=0;y<floor.size;y++){const left=plan.cells[y]?.[boundary-1],right=plan.cells[y]?.[boundary];if(left&&right&&left.collision===right.collision&&left.terrainFamily===right.terrainFamily){if(!(left.neighborMask&2)||!(right.neighborMask&8))errors.push(`costura horizontal instável no chunk ${boundary},${y}`);}}
    for(let x=0;x<floor.size;x++){const top=plan.cells[boundary-1]?.[x],bottom=plan.cells[boundary]?.[x];if(top&&bottom&&top.collision===bottom.collision&&top.terrainFamily===bottom.terrainFamily){if(!(top.neighborMask&4)||!(bottom.neighborMask&1))errors.push(`costura vertical instável no chunk ${x},${boundary}`);}}
  }
  return{valid:errors.length===0,errors,signature:visualTerrainSignature(plan),statistics:plan.statistics};
}

export function towerManifestAsset(path) {return MANIFEST_BY_PATH.get(path)||null;}
