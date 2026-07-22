const clone=(value)=>typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));
const transient=new Set(["image","canvas","ctx","cache","spriteSpecs","promise","loadedImage","_editorOriginal","runtimeEntitiesRef"]);

export function stableClean(value){
  if(value===null||typeof value!=="object")return typeof value==="function"?undefined:value;
  if(Array.isArray(value))return value.map(stableClean).filter((entry)=>entry!==undefined);
  const output={};for(const key of Object.keys(value).sort()){if(transient.has(key)||key.startsWith("__"))continue;const cleaned=stableClean(value[key]);if(cleaned!==undefined)output[key]=cleaned;}return output;
}
export const stableStringify=(value,space=2)=>JSON.stringify(stableClean(value),null,space);
const sortById=(list)=>[...(list||[])].map(stableClean).sort((a,b)=>String(a.id||"").localeCompare(String(b.id||"")));
const mapById=(list)=>new Map((list||[]).map((entry)=>[entry.id,entry]));
const sortNavigation=(navigation)=>[...(navigation||[])].map((entry)=>Array.isArray(entry)?{x:Number(entry[0].split(",")[0]),y:Number(entry[0].split(",")[1]),value:entry[1]}:{x:Number(entry.x),y:Number(entry.y),value:entry.value}).sort((a,b)=>a.y-b.y||a.x-b.x||String(a.value).localeCompare(String(b.value)));
const mergeById=(...lists)=>{const merged=new Map();for(const list of lists)for(const entry of list||[])if(entry?.id!==undefined)merged.set(entry.id,stableClean(entry));return sortById([...merged.values()]);};

export function buildWorldExport({regionId,world=null,layout={},navigation=[],navigationChanges=null,navigationRaster=null,props=[],addedProps=null,entities=null,modifiedEntities=[],addedEntities=[],removedEntityIds=[],spawnOverride=undefined,metadata={}}){
  const modified=sortById(modifiedEntities),added=sortById(addedEntities),finalEntities=entities?sortById(entities):mergeById(modified,added),finalProps=sortById(props),addedPropList=sortById(addedProps??props),removed=[...new Set(removedEntityIds||[])].map(String).sort(),payload={kind:"voz-partida-world-override",version:2,regionId:Number(regionId),coordinateSystem:"world-space"};
  if(world&&Number.isFinite(Number(world.w))&&Number.isFinite(Number(world.h)))payload.world={w:Number(world.w),h:Number(world.h)};
  if(Object.prototype.hasOwnProperty.call(layout||{},"spawn"))payload.spawn=layout.spawn;
  if(spawnOverride!==undefined)payload.spawnOverride=spawnOverride;
  if(navigationRaster)payload.navigationRaster=navigationRaster;
  payload.navigation=sortNavigation(navigation);
  payload.navigationChanges=sortNavigation(navigationChanges??navigation);
  if(Object.prototype.hasOwnProperty.call(layout||{},"obstacles"))payload.obstacles=layout.obstacles;
  payload.props=finalProps;
  payload.addedProps=addedPropList;
  payload.entities=finalEntities;
  payload.modifiedEntities=modified;
  payload.addedEntities=added;
  payload.removedEntityIds=removed;
  payload.metadata={...metadata,exportedAt:undefined};
  return stableClean(payload);
}

export function buildWorldExportCollection(overrides,metadata={}){
  const entries=overrides instanceof Map?[...overrides.entries()]:Array.isArray(overrides)?overrides.map((entry)=>[entry.regionId,entry]):Object.entries(overrides||{}),regions={};
  for(const [rawId,override] of entries.sort((a,b)=>Number(a[0])-Number(b[0])))regions[String(Number(rawId))]=stableClean(override);
  return stableClean({kind:"voz-partida-world-overrides",version:2,coordinateSystem:"world-space",regionOrder:Object.keys(regions).map(Number),regions,metadata:{...metadata,regionCount:Object.keys(regions).length,exportedAt:undefined}});
}

export function buildTowerDelta(original,current){
  const changes=[];for(let y=0;y<current.size;y++)for(let x=0;x<current.size;x++)if(original.grid?.[y]?.[x]!==current.grid?.[y]?.[x])changes.push({x,y,value:current.grid[y][x]});
  const deltaList=(before,after)=>{const old=mapById(before),next=mapById(after),added=[],modified=[],removed=[];for(const [id,entry] of next){if(!old.has(id))added.push(entry);else if(stableStringify(old.get(id),0)!==stableStringify(entry,0))modified.push(entry);}for(const id of old.keys())if(!next.has(id))removed.push(id);return{added:sortById(added),modified:sortById(modified),removed:removed.sort()};};
  const props=deltaList(original.props,current.props),entities=deltaList(original.entities,current.entities),same=(a,b)=>stableStringify(a,0)===stableStringify(b,0),entity=(list,type)=>list.find((entry)=>entry.type===type),originalEntrance=entity(original.entities,"entrance"),currentEntrance=entity(current.entities,"entrance"),originalExit=entity(original.entities,"exit"),currentExit=entity(current.entities,"exit");
  const runSeed=current.seed?.split("|andar:")[0]||current.seed,overrideKey=`${runSeed}|${current.floor}|${current.floorSeed}`;
  return stableClean({kind:"voz-partida-tower-delta",version:1,generatorVersion:current.version||1,overrideKey,runSeed,floor:current.floor,floorSeed:current.floorSeed,changedGridCells:changes,pathCellsOverride:same(original.pathCells,current.pathCells)?null:current.pathCells,bridgeCellsOverride:same(original.bridgeCells,current.bridgeCells)?null:current.bridgeCells,addedProps:props.added,modifiedProps:props.modified,removedPropIds:props.removed,addedEntities:entities.added,modifiedEntities:entities.modified,removedEntityIds:entities.removed,spawnOverride:same(original.spawn,current.spawn)?null:current.spawn,entranceOverride:same(originalEntrance,currentEntrance)?null:currentEntrance,exitOverride:same(originalExit,currentExit)?null:currentExit,objectiveOverride:same(original.objective,current.objective)?null:current.objective});
}

export function asJavaScriptModule(payload,name="EDITOR_OVERRIDE"){
  if(payload?.kind==="voz-partida-world-overrides")return`// Gerado pelo editor de GPT: A Voz Partida.\n// Cole este objeto diretamente em WORLD_MAP_OVERRIDES.\nexport const WORLD_MAP_OVERRIDES=Object.freeze(${stableStringify(payload.regions||{},2)});\n`;
  const safe=String(name).replace(/[^A-Za-z0-9_$]/g,"_").replace(/^([0-9])/,"_$1")||"EDITOR_OVERRIDE";
  return`// Gerado pelo editor de GPT: A Voz Partida.\nexport const ${safe}=Object.freeze(${stableStringify(payload,2)});\n`;
}

export function downloadText(filename,text,type="application/json"){
  const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export async function copyText(text){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);const area=document.createElement("textarea");area.value=text;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();document.execCommand("copy");area.remove();}

export const cloneExportValue=clone;
