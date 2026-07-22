// Copy exported editor data into these objects to ship intentional overrides.
// Empty defaults preserve every existing world map and procedural Tower floor.
export const WORLD_MAP_OVERRIDES=Object.freeze({});
export const TOWER_FLOOR_OVERRIDES=Object.freeze({});

const clone=(value)=>typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));
const key=(seed,floor,floorSeed)=>`${seed}|${floor}|${floorSeed}`;

export function worldMapOverride(regionId){return WORLD_MAP_OVERRIDES[String(regionId)]||WORLD_MAP_OVERRIDES[regionId]||null;}
export function towerFloorOverride(floor){const runSeed=String(floor.seed||"").split("|andar:")[0];return TOWER_FLOOR_OVERRIDES[key(runSeed,floor.floor,floor.floorSeed)]||TOWER_FLOOR_OVERRIDES[key(floor.seed,floor.floor,floor.floorSeed)]||null;}

export function worldNavigationValue(regionId,x,y,cellSize=64){
  const override=worldMapOverride(regionId);if(!override)return null;const cellX=Math.floor(x/cellSize),cellY=Math.floor(y/cellSize),entry=(override.navigation||[]).find((value)=>value.x===cellX&&value.y===cellY);return entry?.value||null;
}

export function applyWorldEntityOverride(regionId,entities){
  const override=worldMapOverride(regionId);if(!override)return entities;const result=entities.map((entry)=>clone(entry)),changes=new Map((override.entities||[]).map((entry)=>[entry.id,entry]));for(const entity of result){const change=changes.get(entity.id);if(change)Object.assign(entity,clone(change));changes.delete(entity.id);}result.push(...[...changes.values()].map(clone));return result;
}

export function applyTowerFloorOverride(floor,override=towerFloorOverride(floor)){
  if(!floor||!override)return floor;
  for(const change of override.changedGridCells||[])if(floor.grid?.[change.y]?.[change.x]!==undefined)floor.grid[change.y][change.x]=change.value;
  const removedProps=new Set(override.removedPropIds||[]),removedEntities=new Set(override.removedEntityIds||[]);
  floor.props=(floor.props||[]).filter((entry)=>!removedProps.has(entry.id));
  floor.entities=(floor.entities||[]).filter((entry)=>!removedEntities.has(entry.id));
  const merge=(target,changes)=>changes.forEach((change)=>{const current=target.find((entry)=>entry.id===change.id);if(current)Object.assign(current,clone(change));else target.push(clone(change));});
  merge(floor.props,override.modifiedProps||[]);merge(floor.props,override.addedProps||[]);merge(floor.entities,override.modifiedEntities||[]);merge(floor.entities,override.addedEntities||[]);
  if(Array.isArray(override.pathCellsOverride))floor.pathCells=clone(override.pathCellsOverride);
  if(Array.isArray(override.bridgeCellsOverride))floor.bridgeCells=clone(override.bridgeCellsOverride);
  if(override.spawnOverride)floor.spawn={...floor.spawn,...clone(override.spawnOverride)};
  for(const [type,value] of[["entrance",override.entranceOverride],["exit",override.exitOverride],["objective",override.objectiveOverride]])if(value){const target=type==="objective"?floor.entities.find((entry)=>entry.objective):floor.entities.find((entry)=>entry.type===type);if(target)Object.assign(target,clone(value));}
  return floor;
}
