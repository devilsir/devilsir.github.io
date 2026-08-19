import { REGIONS, ROUTES, asset, characterArt, formSprite, mobSprite } from "./data.js";
import { TOWER_CONFIG } from "./tower_data.js";
import { generateTowerFloor } from "./tower_generator.js";
import { normalizePropPresentation, propBlocksPoint, propCollisionBounds, propShadowSpec, propSortY, propVisualBounds } from "./prop_presentation.js";

const now=()=>globalThis.performance?.now?.()||Date.now();
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const unique=(values)=>[...new Set(values.filter(Boolean))];
const key=(x,y)=>`${x},${y}`;
const visualNoise=(seed,x,y,salt=0)=>{let value=(Number(seed)||0)^Math.imul(x+salt*17,374761393)^Math.imul(y-salt*29,668265263);value=Math.imul(value^(value>>>13),1274126177);return(value^(value>>>16))>>>0;};
const CELL=TOWER_CONFIG.cellSize;
const FLYING=new Set(["fada_gelo","espectro_cinzas","dragao_fogo","dragao_pedra","harpia_deserto","pirata_fantasma","agua_viva_abissal","corvo_sombrio","dragao_tempestade","aguia_tempestade","arraia_eletrica","elemental_nuvem"]);

export class TowerEngine {
  constructor({canvas,minimap,getState,cache,audio,onEncounter,onInteract,onAdvance,onReturn,onHud,onPrompt,onLoading,onObjective,onFloorReady}) {
    this.canvas=canvas;this.ctx=canvas.getContext("2d",{alpha:false});this.ctx.imageSmoothingEnabled=false;this.minimap=minimap;this.mctx=minimap.getContext("2d");
    this.getState=getState;this.cache=cache;this.audio=audio;this.callbacks={onEncounter,onInteract,onAdvance,onReturn,onHud,onPrompt,onLoading,onObjective,onFloorReady};
    this.running=false;this.paused=true;this.active=false;this.lastTime=now();this.keys=new Set();this.touchSprint=false;this.target=null;this.camera={x:0,y:0};this.world={w:4096,h:4096};this.floor=null;this.chunks=new Map();this.surfaceTiles=new Map();this.nearEntity=null;this.explored=new Set();this.frame=0;this.encounterCooldown=0;this.gamepadAction=false;this.pendingVisuals=new Set();this.lastPlayerImage=null;this.debugAllowed=typeof location!=="undefined"&&["1","true"].includes(new URLSearchParams(location.search).get("towerDebug"))||Boolean(globalThis.__VOZ_DEV__?.accessAllowed);this.debugVisual=false;this.bindEvents();
  }

  bindEvents() {
    window.addEventListener("keydown",(event)=>{if(event.code==="F8"&&this.debugAllowed){event.preventDefault();this.debugVisual=!this.debugVisual;this.chunks.clear();return;}if(!this.active||this.paused)return;const settings=this.getState()?.settings;if(Object.values(settings?.keys||{}).includes(event.code)||["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","ShiftLeft","ShiftRight"].includes(event.code))event.preventDefault();this.keys.add(event.code);if(event.code===settings?.keys?.interact||event.code==="Space")this.interact();},{passive:false});
    window.addEventListener("keyup",(event)=>this.keys.delete(event.code));
    window.addEventListener("blur",()=>{this.keys.clear();this.touchSprint=false;});
    this.canvas.addEventListener("pointerdown",(event)=>{if(!this.active||this.paused)return;const rect=this.canvas.getBoundingClientRect(),sx=this.canvas.width/rect.width,sy=this.canvas.height/rect.height;this.target={x:(event.clientX-rect.left)*sx+this.camera.x,y:(event.clientY-rect.top)*sy+this.camera.y};this.canvas.focus();});
  }

  setTouchDirection(direction,active){const map={up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"};if(active)this.keys.add(map[direction]);else this.keys.delete(map[direction]);}
  setSprint(active){this.touchSprint=Boolean(active);}
  start(){this.active=true;if(this.running){this.paused=false;return;}this.running=true;this.paused=false;this.lastTime=now();const loop=(time)=>{if(!this.running)return;const dt=Math.min(.04,(time-this.lastTime)/1000);this.lastTime=time;if(this.active&&!this.paused)this.update(dt);if(this.active&&this.floor)this.draw();requestAnimationFrame(loop);};requestAnimationFrame(loop);}
  stop(){this.paused=true;this.keys.clear();this.touchSprint=false;}
  deactivate(){this.active=false;this.stop();this.target=null;this.nearEntity=null;this.canvas.style.removeProperty("transform");}
  resume(){if(!this.floor)return;this.active=true;this.paused=false;this.lastTime=now();this.canvas.focus();}

  playerCandidates(state,direction) {
    const front=formSprite(state.route,state.activeForm,"front",state.visualVariant),exact=state.visualVariant==="feminino"&&state.activeForm==="base"?front:formSprite(state.route,state.activeForm,direction,state.visualVariant);
    return{exact,candidates:[front,characterArt(state.route,state.visualVariant)]};
  }

  enemyCandidates(region,id,direction,boss=false) {
    const exact=mobSprite(region,id,direction,boss),front=mobSprite(region,id,"front",boss),peers=boss?[region.miniboss,...region.bosses]:region.normal;
    return{exact,candidates:[front,...peers.filter((entry)=>entry!==id).map((entry)=>mobSprite(region,entry,"front",boss))]};
  }

  async enterFloor(run,{announce=true}={}) {
    const state=this.getState();if(!state||!run)return;this.active=true;this.paused=true;this.callbacks.onLoading?.(true,`A torre está reconstruindo o andar ${run.floor}...`,.03);
    const previousFloorSeed=run.floorSeed;
    const floor=generateTowerFloor({runSeed:run.seed,floor:run.floor,difficulty:run.difficulty||1,route:state.route,overrides:run.developerOverrides||null});
    if(previousFloorSeed===floor.floorSeed&&run.currentObjective?.id===floor.objective.id)floor.objective={...floor.objective,...run.currentObjective};
    this.floor=floor;this.floor.props=this.floor.props.map((prop)=>normalizePropPresentation(prop));this.world=floor.world;this.pathLookup=new Set((floor.pathCells||[]).map(([x,y])=>key(x,y)));this.bridgeLookup=new Set((floor.bridgeCells||[]).map(([x,y])=>key(x,y)));this.chunks.clear();this.surfaceTiles.clear();this.explored=new Set(previousFloorSeed===floor.floorSeed?(run.explored||[]):[]);this.buildSpatialIndex();this.prepareEntities(run);
    const assetPaths=unique([
      ...Object.values(floor.assets).flat().map((entry)=>entry.path),...Object.values(floor.visualPlan?.palette||{}).flatMap((entry)=>[entry?.assetPath,...(entry?.variants||[]).map((variant)=>variant.path)]),...floor.props.map((entry)=>entry.path),asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp")
    ]);
    await this.cache.loadGroup(assetPaths,(progress)=>this.callbacks.onLoading?.(true,`Enraizando ${floor.family.name}...`,.05+progress*.64));
    const spriteLoads=[];
    for(const direction of["front","back","left","right"]){const spec=this.playerCandidates(state,direction);spriteLoads.push(this.cache.loadFirst(spec.exact,spec.candidates));}
    for(const entity of floor.entities.filter((entry)=>entry.type==="encounter"))for(const direction of["front","back","left","right"]){const spec=entity.spriteSpecs[direction];spriteLoads.push(this.cache.loadFirst(spec.exact,spec.candidates));}
    await Promise.all(spriteLoads.map((promise,index)=>promise.then(()=>this.callbacks.onLoading?.(true,"Acordando ecos hostis...",.69+.29*(index+1)/Math.max(1,spriteLoads.length)))));
    const saved=previousFloorSeed===floor.floorSeed&&run.playerPosition&&this.isWalkable(run.playerPosition.x,run.playerPosition.y)?run.playerPosition:floor.spawn;
    this.position={x:saved.x,y:saved.y};state.position={...this.position};this.revealAround(this.position,true);this.updateObjectiveState(false);this.syncRun();
    this.camera.x=clamp(this.position.x-this.canvas.width/2,0,Math.max(0,this.world.w-this.canvas.width));this.camera.y=clamp(this.position.y-this.canvas.height/2,0,Math.max(0,this.world.h-this.canvas.height));
    this.cache.releaseOld(90000);this.start();this.paused=false;this.audio.startTowerAmbient?.(floor.familyIndex,floor.floor,floor.floor%10===0);if(!this.audio.startTowerAmbient)this.audio.startAmbient(floor.familyIndex);
    this.callbacks.onLoading?.(false,"",1);this.callbacks.onHud?.(floor);if(announce)this.callbacks.onFloorReady?.(floor);this.canvas.focus();
  }

  prepareEntities(run) {
    const cleared=new Set(run.clearedEncounters||[]),opened=new Set(run.openedChests||[]),altars=new Set(run.activatedAltars||[]),events=new Set(run.completedEvents||[]),objectives=new Set(run.activatedObjectives||[]);
    for(const entity of this.floor.entities){
      entity.hidden=entity.type==="encounter"?cleared.has(entity.id):entity.type==="chest"?opened.has(entity.id):["rest","event","choice","ambush"].includes(entity.type)?events.has(entity.id):["valve","node","echo","memory","key","rune"].includes(entity.type)?objectives.has(entity.id):entity.type==="living-altar"?altars.has(entity.id):false;
      if(entity.type==="encounter"){
        const enemyId=entity.encounter.enemyIds[0],regionIndex=entity.encounter.enemyRegions[0]??this.floor.familyIndex,region=REGIONS[regionIndex],boss=entity.encounter.enemyKinds?.[0]!=="normal";entity.enemyId=enemyId;entity.enemyRegion=regionIndex;if(typeof entity.flying!=="boolean")entity.flying=FLYING.has(enemyId);entity.facing=entity.facing||"front";entity.spriteSpecs={};for(const direction of["front","back","left","right"])entity.spriteSpecs[direction]=this.enemyCandidates(region,enemyId,direction,boss);entity.height=Number(entity.height)||(entity.encounter.major?142:entity.encounter.elite?112:86);
      }
    }
    const exit=this.floor.entities.find((entry)=>entry.type==="exit");if(exit)exit.locked=!this.floor.objective.completed;
  }

  syncRun() {
    const state=this.getState(),run=state?.tower?.activeRun;if(!run||!this.floor)return;
    run.floor=this.floor.floor;run.floorSeed=this.floor.floorSeed;run.playerPosition={...this.position};run.hp=state.hp;run.focus=state.focus;run.authority=state.authority;run.companionHp={eliara:state.companions.eliara.hp,dagra:state.companions.dagra.hp};run.currentObjective={...this.floor.objective};run.explored=[...this.explored].slice(0,4096);run.mutation=this.floor.mutation.id;run.family=this.floor.family.id;run.lastSavedAt=Date.now();
  }

  currentCell(position=this.position){return{x:clamp(Math.floor(position.x/TOWER_CONFIG.cellSize),0,this.floor.size-1),y:clamp(Math.floor(position.y/TOWER_CONFIG.cellSize),0,this.floor.size-1)};}
  gridAt(x,y){const cellX=Math.floor(x/TOWER_CONFIG.cellSize),cellY=Math.floor(y/TOWER_CONFIG.cellSize);return this.floor?.grid?.[cellY]?.[cellX]??0;}
  buildSpatialIndex(){this.propChunks=new Map();const size=TOWER_CONFIG.chunkCells*CELL;for(const prop of this.floor.props){const collision=propCollisionBounds(prop),visual=propVisualBounds(prop),left=Math.min(collision.x,visual.x),top=Math.min(collision.y,visual.y),right=Math.max(collision.x+collision.w,visual.x+visual.w),bottom=Math.max(collision.y+collision.h,visual.y+visual.h),minX=Math.floor(left/size),maxX=Math.floor(right/size),minY=Math.floor(top/size),maxY=Math.floor(bottom/size);for(let cy=minY;cy<=maxY;cy++)for(let cx=minX;cx<=maxX;cx++){const id=`${cx}:${cy}`;if(!this.propChunks.has(id))this.propChunks.set(id,[]);this.propChunks.get(id).push(prop);}}}
  uniqueProps(list){const found=new Map();for(const prop of list)if(prop&&!found.has(prop.id))found.set(prop.id,prop);return[...found.values()];}
  nearbyProps(x,y){const size=TOWER_CONFIG.chunkCells*CELL,cx=Math.floor(x/size),cy=Math.floor(y/size),result=[];for(let yy=cy-1;yy<=cy+1;yy++)for(let xx=cx-1;xx<=cx+1;xx++)result.push(...(this.propChunks.get(`${xx}:${yy}`)||[]));return this.uniqueProps(result);}
  visibleProps(){const size=TOWER_CONFIG.chunkCells*CELL,minX=Math.floor(this.camera.x/size)-1,maxX=Math.floor((this.camera.x+this.canvas.width)/size)+1,minY=Math.floor(this.camera.y/size)-1,maxY=Math.floor((this.camera.y+this.canvas.height)/size)+1,result=[];for(let cy=minY;cy<=maxY;cy++)for(let cx=minX;cx<=maxX;cx++)result.push(...(this.propChunks.get(`${cx}:${cy}`)||[]).slice(0,TOWER_CONFIG.maxVisiblePropsPerChunk));return this.uniqueProps(result);}
  isWalkable(x,y,radius=19,ignoreProps=false,forEnemy=false){const dev=globalThis.__VOZ_DEV__;if(dev?.enabled&&((forEnemy&&dev.flags?.enemyCollision===false)||(!forEnemy&&dev.flags?.playerCollision===false)))return true;if(!this.floor||x<radius||y<radius||x>this.world.w-radius||y>this.world.h-radius)return false;for(const [dx,dy] of[[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius],[radius*.7,radius*.7],[-radius*.7,radius*.7],[radius*.7,-radius*.7],[-radius*.7,-radius*.7]])if(this.gridAt(x+dx,y+dy)!==1)return false;if(ignoreProps)return true;return!this.nearbyProps(x,y).some((prop)=>propBlocksPoint(prop,x,y,radius));}
  invalidateVisualCaches(){this.chunks.clear();this.surfaceTiles.clear();}

  update(dt) {
    const state=this.getState();if(!state||!this.floor)return;const keys=state.settings.keys;let dx=0,dy=0;
    if(this.keys.has(keys.left)||this.keys.has("ArrowLeft"))dx-=1;if(this.keys.has(keys.right)||this.keys.has("ArrowRight"))dx+=1;if(this.keys.has(keys.up)||this.keys.has("ArrowUp"))dy-=1;if(this.keys.has(keys.down)||this.keys.has("ArrowDown"))dy+=1;
    const pad=navigator.getGamepads?.()[0];if(pad){if(Math.abs(pad.axes[0])>.18)dx+=pad.axes[0];if(Math.abs(pad.axes[1])>.18)dy+=pad.axes[1];if(pad.buttons[0]?.pressed&&!this.gamepadAction){this.gamepadAction=true;this.interact();}if(!pad.buttons[0]?.pressed)this.gamepadAction=false;}
    if(!dx&&!dy&&this.target){const vx=this.target.x-this.position.x,vy=this.target.y-this.position.y;if(Math.hypot(vx,vy)<10)this.target=null;else{dx=vx;dy=vy;}}else if(dx||dy)this.target=null;
    if(dx||dy){const length=Math.hypot(dx,dy)||1;dx/=length;dy/=length;const sprint=this.touchSprint||this.keys.has("ShiftLeft")||this.keys.has("ShiftRight")||Boolean(pad?.buttons?.[1]?.pressed),run=state.tower.activeRun,moveUpgrade=(run.upgrades||[]).filter((id)=>id==="velocidade").length*.1,travel=(sprint?335:212)*(1+moveUpgrade)*dt,steps=Math.max(1,Math.ceil(travel/9));for(let step=0;step<steps;step++){const amount=travel/steps,nx=this.position.x+dx*amount,ny=this.position.y+dy*amount;if(this.isWalkable(nx,ny))this.position={x:nx,y:ny};else if(this.isWalkable(nx,this.position.y))this.position.x=nx;else if(this.isWalkable(this.position.x,ny))this.position.y=ny;}if(Math.abs(dx)>Math.abs(dy))state.facing=dx<0?"left":"right";else state.facing=dy<0?"back":"front";this.frame+=dt*(sprint?12:8);state.position={...this.position};run.playerPosition={...this.position};this.revealAround(this.position);}
    const maxX=Math.max(0,this.world.w-this.canvas.width),maxY=Math.max(0,this.world.h-this.canvas.height),targetX=clamp(this.position.x-this.canvas.width/2,0,maxX),targetY=clamp(this.position.y-this.canvas.height/2,0,maxY);this.camera.x+=(targetX-this.camera.x)*Math.min(1,dt*6);this.camera.y+=(targetY-this.camera.y)*Math.min(1,dt*6);
    this.encounterCooldown=Math.max(0,this.encounterCooldown-dt);this.updateEnemies(dt);const near=this.floor.entities.filter((entry)=>!entry.hidden&&entry.type!=="encounter"&&distance(this.position,entry)<116).sort((a,b)=>distance(this.position,a)-distance(this.position,b))[0]||this.floor.entities.filter((entry)=>!entry.hidden&&entry.type==="encounter"&&distance(this.position,entry)<102).sort((a,b)=>distance(this.position,a)-distance(this.position,b))[0]||null;if(near?.id!==this.nearEntity?.id){this.nearEntity=near;this.callbacks.onPrompt?.(near);}const pulseDanger=this.floor.entities.some((entry)=>!entry.hidden&&((entry.type==="exit"&&!entry.locked)||entry.encounter?.elite)&&distance(this.position,entry)<430);if(!state.settings.reducedMotion&&pulseDanger){const pulse=Math.sin(now()/118)*.42;this.canvas.style.transform=`translate(${pulse.toFixed(2)}px,${(-pulse*.6).toFixed(2)}px)`;}else this.canvas.style.removeProperty("transform");this.callbacks.onHud?.(this.floor);
  }

  updateEnemies(dt) {
    if(globalThis.__VOZ_DEV__?.enabled&&globalThis.__VOZ_DEV__.flags?.enemyAI===false)return;
    for(const entity of this.floor.entities.filter((entry)=>entry.type==="encounter"&&!entry.hidden)){
      const toPlayer=distance(entity,this.position),toSpawn=Math.hypot(entity.x-entity.spawnX,entity.y-entity.spawnY);let vx=0,vy=0,speed=0;
      const aggro=Number(entity.aggroRadius)||290,returnRadius=Number(entity.returnRadius)||430,patrolRadius=Number(entity.patrolRadius)||24,moveSpeed=Number(entity.movementSpeed)||(entity.encounter.elite?72:62);if(toPlayer<aggro&&toSpawn<returnRadius){vx=this.position.x-entity.x;vy=this.position.y-entity.y;speed=moveSpeed;}else if(toSpawn>patrolRadius){vx=entity.spawnX-entity.x;vy=entity.spawnY-entity.y;speed=Math.max(28,moveSpeed*.68);}else if(entity.patrol){const phase=now()/1800+(entity.cellX*13+entity.cellY*7);vx=Math.cos(phase);vy=Math.sin(phase*.73);speed=Math.max(14,moveSpeed*.32);}
      const length=Math.hypot(vx,vy)||1;if(speed){vx/=length;vy/=length;const nx=entity.x+vx*speed*dt,ny=entity.y+vy*speed*dt,overlap=this.floor.entities.some((other)=>other!==entity&&other.type==="encounter"&&!other.hidden&&Math.hypot(nx-other.x,ny-other.y)<30);if(!overlap&&this.isWalkable(nx,ny,14,entity.flying,true)){entity.x=nx;entity.y=ny;}if(Math.abs(vx)>Math.abs(vy))entity.facing=vx<0?"left":"right";else entity.facing=vy<0?"back":"front";}
      if(toPlayer<47&&!this.encounterCooldown){this.encounterCooldown=1;this.beginEncounter(entity);return;}
    }
  }

  revealAround(position,force=false) {
    const state=this.getState(),center=this.currentCell(position),bonus=Number(state.tower.permanentUpgrades?.mapa||0),radius=4+bonus;let changed=false;for(let y=center.y-radius;y<=center.y+radius;y++)for(let x=center.x-radius;x<=center.x+radius;x++){if(this.floor.grid[y]?.[x]===1&&Math.hypot(x-center.x,y-center.y)<=radius+.35&&!this.explored.has(key(x,y))){this.explored.add(key(x,y));changed=true;}}
    if(changed||force){const run=state.tower.activeRun;run.explored=[...this.explored].slice(0,4096);if(this.floor.objective.id==="explore"){const walkable=this.floor.grid.reduce((sum,row)=>sum+row.filter((cell)=>cell===1).length,0),progress=Math.min(100,Math.floor(this.explored.size/Math.max(1,walkable)*100));this.floor.objective.progress=progress;if(progress>=this.floor.objective.targets)this.completeObjective();}}
  }

  beginEncounter(entity) {if(this.paused||entity.hidden||(globalThis.__VOZ_DEV__?.enabled&&globalThis.__VOZ_DEV__.flags?.encounterTriggers===false))return;this.syncRun();this.paused=true;this.callbacks.onPrompt?.(null);this.audio.towerPulse?.(entity.encounter.elite);this.callbacks.onEncounter?.(entity,{
    ...entity.encounter,floor:this.floor.floor,mutation:this.floor.mutation,family:this.floor.family,hybrid:this.floor.hybrid,background:asset(REGIONS[this.floor.familyIndex].battle),difficultyScale:this.floor.difficultyScale
  });}

  interact() {
    if(this.paused||!this.nearEntity)return;const entity=this.nearEntity;this.audio.confirm();
    if(entity.type==="encounter")return this.beginEncounter(entity);
    if(entity.type==="exit"){if(entity.locked)return this.callbacks.onInteract?.({...entity,type:"locked-exit"},this.floor);this.syncRun();this.paused=true;return this.callbacks.onAdvance?.(this.floor);}
    if(entity.type==="entrance"){this.syncRun();this.paused=true;return this.callbacks.onReturn?.(this.floor);}
    if(entity.hidden)return;
    const run=this.getState().tower.activeRun;
    if(entity.type==="chest")run.openedChests.push(entity.id);
    else if(entity.type==="living-altar"){run.activatedAltars.push(entity.id);if(entity.objective)this.advanceObjective(entity);}
    else if(["rest","event","choice"].includes(entity.type)){run.completedEvents.push(entity.id);if(entity.objective)this.advanceObjective(entity);}
    else if(["valve","node","echo","memory","key","rune"].includes(entity.type)){run.activatedObjectives.push(entity.id);this.advanceObjective(entity);}
    if(entity.type!=="ambush")entity.hidden=true;this.syncRun();this.callbacks.onInteract?.(entity,this.floor);
  }

  advanceObjective(entity) {
    const objective=this.floor.objective;if(objective.completed)return;
    if(objective.id==="runes"){
      const expected=objective.sequence[objective.progress]??0;if(entity.index!==expected){objective.progress=0;this.getState().tower.activeRun.activatedObjectives=[];this.floor.entities.filter((entry)=>entry.type==="rune").forEach((entry)=>entry.hidden=false);this.callbacks.onObjective?.({reset:true,objective,entity});return;}
    }
    objective.progress=Math.min(objective.targets,objective.progress+1);if(objective.progress>=objective.targets)this.completeObjective();else this.callbacks.onObjective?.({objective,entity});
  }

  updateObjectiveState(notify=true) {const exit=this.floor.entities.find((entry)=>entry.type==="exit");if(exit)exit.locked=!this.floor.objective.completed;if(notify)this.callbacks.onObjective?.({objective:this.floor.objective,completed:this.floor.objective.completed});}
  completeObjective(){if(this.floor.objective.completed)return;this.floor.objective.completed=true;this.updateObjectiveState(true);this.audio.reward?.();this.syncRun();}

  markEncounterCleared(id) {
    const run=this.getState().tower.activeRun;if(!run.clearedEncounters.includes(id))run.clearedEncounters.push(id);const entity=this.floor.entities.find((entry)=>entry.id===id);if(entity)entity.hidden=true;
    if(entity?.objective){this.floor.objective.progress=Math.min(this.floor.objective.targets,this.floor.objective.progress+1);if(this.floor.objective.progress>=this.floor.objective.targets)this.completeObjective();}
    this.encounterCooldown=1.2;this.syncRun();
  }

  chunkVisible(cx,cy,margin=1){const size=TOWER_CONFIG.chunkCells*CELL,x=cx*size,y=cy*size;return x+size>=this.camera.x-margin*size&&y+size>=this.camera.y-margin*size&&x<=this.camera.x+this.canvas.width+margin*size&&y<=this.camera.y+this.canvas.height+margin*size;}
  getChunk(cx,cy){const id=`${cx}:${cy}`;if(this.chunks.has(id)){const chunk=this.chunks.get(id);this.chunks.delete(id);this.chunks.set(id,chunk);return chunk;}const chunk=this.renderChunk(cx,cy);this.chunks.set(id,chunk);while(this.chunks.size>30){const oldest=this.chunks.keys().next().value;this.chunks.delete(oldest);}return chunk;}

  visualCell(x,y){return this.floor?.visualPlan?.cells?.[y]?.[x]||null;}

  surfaceSpec(cell) {
    const palette=this.floor.visualPlan.palette;
    if(cell.collision===2)return cell.zone==="secondary"?palette.hazardSecondary:palette.hazardPrimary;
    return cell.zone==="secondary"?palette.secondary:palette.dominant;
  }

  surfaceTile(spec) {
    const id=`${spec.key}|${spec.assetPath||"procedural"}|${spec.color}`;if(this.surfaceTiles.has(id))return this.surfaceTiles.get(id);
    const tile=document.createElement("canvas"),unit=128;tile.width=unit;tile.height=unit;const ctx=tile.getContext("2d");ctx.imageSmoothingEnabled=false;ctx.fillStyle=spec.color;ctx.fillRect(0,0,unit,unit);
    const image=this.cache.get(spec.assetPath);
    if(image){
      const bounds=this.cache.getBounds(image),inset=clamp(spec.textureInset||.18,.12,.3),trim=Math.max(4,Math.floor(Math.min(bounds.w,bounds.h)*inset)),availableW=Math.max(1,bounds.w-trim*2),availableH=Math.max(1,bounds.h-trim*2),sourceSize=Math.max(1,Math.min(availableW,availableH)),sx=Math.round(bounds.x+trim+(availableW-sourceSize)/2),sy=Math.round(bounds.y+trim+(availableH-sourceSize)/2);
      const source=document.createElement("canvas"),sourceCtx=source.getContext("2d"),half=unit/2;source.width=unit;source.height=unit;sourceCtx.imageSmoothingEnabled=false;sourceCtx.drawImage(image,sx,sy,sourceSize,sourceSize,0,0,unit,unit);
      // O deslocamento torna as bordas opostas vizinhas reais; a máscara Bayer
      // recompõe somente as novas emendas centrais sem borrar o pixel art.
      for(const oy of[-half,half])for(const ox of[-half,half])ctx.drawImage(source,ox,oy);
      const overlay=document.createElement("canvas"),overlayCtx=overlay.getContext("2d"),mask=document.createElement("canvas"),maskCtx=mask.getContext("2d"),bayer=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];overlay.width=mask.width=unit;overlay.height=mask.height=unit;overlayCtx.imageSmoothingEnabled=false;overlayCtx.drawImage(source,0,0);maskCtx.fillStyle="#fff";
      for(let y=0;y<unit;y+=2)for(let x=0;x<unit;x+=2){const seamDistance=Math.min(Math.abs(x-half),Math.abs(y-half)),coverage=clamp((34-seamDistance)/18,0,1);if(coverage>0&&coverage*16>bayer[(y/2)%4][(x/2)%4])maskCtx.fillRect(x,y,2,2);}
      overlayCtx.globalCompositeOperation="destination-in";overlayCtx.drawImage(mask,0,0);overlayCtx.globalCompositeOperation="source-over";ctx.drawImage(overlay,0,0);
      ctx.fillStyle=spec.color;ctx.globalAlpha=.08;ctx.fillRect(0,0,unit,unit);ctx.globalAlpha=1;
    }else{
      ctx.fillStyle=spec.detailColor||"rgba(255,255,255,.12)";ctx.globalAlpha=.2;for(let y=4;y<unit;y+=8)for(let x=4;x<unit;x+=8)if(visualNoise(this.floor.floorSeed,x,y)%5===0)ctx.fillRect(x,y,2,2);ctx.globalAlpha=1;
    }
    this.surfaceTiles.set(id,tile);return tile;
  }

  fillSurfaceBucket(ctx,spec,points,worldX,worldY) {
    if(!points.length)return;const pattern=ctx.createPattern(this.surfaceTile(spec),"repeat");ctx.save();ctx.translate(-worldX,-worldY);ctx.fillStyle=pattern||spec.color;ctx.beginPath();for(const point of points)ctx.rect(point.x*CELL,point.y*CELL,CELL,CELL);ctx.fill();ctx.restore();
  }

  drawTerrainDetails(ctx,cx,cy,size) {
    const worldX=cx*size,worldY=cy*size,startX=Math.floor(worldX/12)*12,startY=Math.floor(worldY/12)*12;
    for(let wy=startY;wy<worldY+size;wy+=12)for(let wx=startX;wx<worldX+size;wx+=12){const gx=Math.floor(wx/CELL),gy=Math.floor(wy/CELL),cell=this.visualCell(gx,gy);if(!cell)continue;const noise=visualNoise(this.floor.floorSeed,Math.floor(wx/12),Math.floor(wy/12),cell.visualVariationIndex);if(noise%23>2)continue;const spec=this.surfaceSpec(cell);ctx.fillStyle=spec.detailColor;ctx.globalAlpha=cell.collision===2?.28:.18;ctx.fillRect(Math.round(wx-worldX)+(noise%5),Math.round(wy-worldY)+((noise>>>4)%5),1+(noise%3),1+((noise>>>7)%2));}
    ctx.globalAlpha=1;
  }

  pathShape(ctx,x,y,mask,width) {
    const half=Math.floor(width/2),centerX=x+CELL/2,centerY=y+CELL/2;ctx.beginPath();ctx.rect(centerX-half,centerY-half,half*2,half*2);if(mask&1)ctx.rect(centerX-half,y,half*2,CELL/2+1);if(mask&2)ctx.rect(centerX-1,centerY-half,CELL/2+1,half*2);if(mask&4)ctx.rect(centerX-half,centerY-1,half*2,CELL/2+1);if(mask&8)ctx.rect(x,centerY-half,CELL/2+1,half*2);
  }

  directionalPathAsset(mask,palette) {
    const expected={vertical:5,horizontal:10,corner:6,"t-junction":14,"four-way":15},rotate=(value,turns)=>((value<<turns)|(value>>(4-turns)))&15;
    for(const variant of palette.variants||[]){const canonical=expected[variant.connectionType];if(!canonical)continue;for(let turns=0;turns<4;turns++)if(rotate(canonical,turns)===mask&&(turns===0||variant.canRotate))return{variant,turns};}
    return null;
  }

  drawDirectionalPathAsset(ctx,x,y,cell,palette,width) {
    const planned=(palette.variants||[]).find((variant)=>variant.id===cell.pathAssetId),resolved=planned?{variant:planned,turns:cell.pathAssetRotation||0}:this.directionalPathAsset(cell.pathMask,palette);if(!resolved)return false;const image=this.cache.get(resolved.variant.path);if(!image)return false;const bounds=this.cache.getBounds(image),trim=Math.max(2,Math.floor(Math.min(bounds.w,bounds.h)*.055)),availableW=Math.max(1,bounds.w-trim*2),availableH=Math.max(1,bounds.h-trim*2),sourceSize=Math.min(availableW,availableH),sx=Math.round(bounds.x+trim+(availableW-sourceSize)/2),sy=Math.round(bounds.y+trim+(availableH-sourceSize)/2);
    ctx.save();this.pathShape(ctx,x,y,cell.pathMask,width);ctx.clip();ctx.translate(x+CELL/2,y+CELL/2);ctx.rotate(resolved.turns*Math.PI/2);ctx.imageSmoothingEnabled=false;ctx.globalAlpha=.94;ctx.drawImage(image,sx,sy,sourceSize,sourceSize,-CELL/2-2,-CELL/2-2,CELL+4,CELL+4);ctx.restore();return true;
  }

  drawPathLayer(ctx,cx,cy) {
    const cells=TOWER_CONFIG.chunkCells,palette=this.floor.visualPlan.palette.path;
    for(let ly=0;ly<cells;ly++)for(let lx=0;lx<cells;lx++){
      const gx=cx*cells+lx,gy=cy*cells+ly,cell=this.visualCell(gx,gy);if(!cell||cell.pathRole==="none")continue;const x=lx*CELL,y=ly*CELL,mask=cell.pathMask;
      this.pathShape(ctx,x,y,mask,cell.bridge?34:29);ctx.fillStyle=palette.edgeColor;ctx.globalAlpha=cell.bridge?.98:.82;ctx.fill();
      this.pathShape(ctx,x,y,mask,cell.bridge?28:23);ctx.fillStyle=cell.bridge?"#765333":palette.color;ctx.globalAlpha=cell.bridge?.98:.76;ctx.fill();ctx.globalAlpha=1;
      if(!cell.bridge)this.drawDirectionalPathAsset(ctx,x,y,cell,palette,23);
      if(cell.bridge){
        ctx.strokeStyle=palette.highlightColor;ctx.lineWidth=2;ctx.globalAlpha=.52;const horizontal=Boolean(mask&(2|8))&&!Boolean(mask&(1|4));
        if(horizontal){for(let px=x+8;px<x+CELL;px+=10){ctx.beginPath();ctx.moveTo(px,y+CELL/2-13);ctx.lineTo(px,y+CELL/2+13);ctx.stroke();}}
        else{for(let py=y+8;py<y+CELL;py+=10){ctx.beginPath();ctx.moveTo(x+CELL/2-13,py);ctx.lineTo(x+CELL/2+13,py);ctx.stroke();}}
        ctx.globalAlpha=1;
      }else{
        const noise=visualNoise(this.floor.floorSeed,gx,gy,31);ctx.fillStyle=palette.highlightColor;ctx.globalAlpha=.24;if(noise%3===0)ctx.fillRect(x+CELL/2-2+(noise%9)-4,y+CELL/2-1+((noise>>>5)%7)-3,3,2);ctx.globalAlpha=1;
      }
    }
  }

  drawMaskEdges(ctx,x,y,mask,color,highlight,thickness=5,alpha=.72) {
    ctx.fillStyle=color;ctx.globalAlpha=alpha;if(mask&1)ctx.fillRect(x,y,CELL,thickness);if(mask&2)ctx.fillRect(x+CELL-thickness,y,thickness,CELL);if(mask&4)ctx.fillRect(x,y+CELL-thickness,CELL,thickness);if(mask&8)ctx.fillRect(x,y,thickness,CELL);
    ctx.fillStyle=highlight;ctx.globalAlpha=alpha*.42;if(mask&1)ctx.fillRect(x,y+thickness,CELL,1);if(mask&2)ctx.fillRect(x+CELL-thickness-1,y,1,CELL);if(mask&4)ctx.fillRect(x,y+CELL-thickness-1,CELL,1);if(mask&8)ctx.fillRect(x+thickness,y,1,CELL);ctx.globalAlpha=1;
  }

  drawTerrainEdges(ctx,cx,cy) {
    const cells=TOWER_CONFIG.chunkCells,palette=this.floor.visualPlan.palette;
    for(let ly=0;ly<cells;ly++)for(let lx=0;lx<cells;lx++){
      const gx=cx*cells+lx,gy=cy*cells+ly,cell=this.visualCell(gx,gy);if(!cell)continue;const x=lx*CELL,y=ly*CELL;
      if(cell.edgeMask)this.drawMaskEdges(ctx,x,y,cell.edgeMask,palette.boundary.color,palette.boundary.highlightColor,6,.82);
      if(cell.hazardEdgeMask)this.drawMaskEdges(ctx,x,y,cell.hazardEdgeMask,palette.boundary.hazardColor,palette.boundary.highlightColor,4,.66);
      if(cell.transitionMask){const spec=this.surfaceSpec(cell);this.drawMaskEdges(ctx,x,y,cell.transitionMask,spec.detailColor,palette.boundary.highlightColor,3,.3);}
      if((cell.edgeMask||cell.hazardEdgeMask)&&visualNoise(this.floor.floorSeed,gx,gy,17)%4===0){ctx.fillStyle=palette.boundary.highlightColor;ctx.globalAlpha=.32;const mask=cell.edgeMask||cell.hazardEdgeMask;if(mask&1)ctx.fillRect(x+18+(gx%3)*7,y+3,5,3);else if(mask&2)ctx.fillRect(x+CELL-6,y+18+(gy%3)*7,3,5);else if(mask&4)ctx.fillRect(x+18+(gx%3)*7,y+CELL-6,5,3);else if(mask&8)ctx.fillRect(x+3,y+18+(gy%3)*7,3,5);ctx.globalAlpha=1;}
    }
  }

  renderChunk(cx,cy) {
    const cells=TOWER_CONFIG.chunkCells,size=cells*CELL,worldX=cx*size,worldY=cy*size,canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;const ctx=canvas.getContext("2d",{alpha:false});ctx.imageSmoothingEnabled=false;const plan=this.floor.visualPlan,palette=plan.palette;
    ctx.fillStyle=palette.void.color;ctx.fillRect(0,0,size,size);ctx.fillStyle=palette.void.veinColor;ctx.globalAlpha=.2;for(let y=0;y<size;y+=24)for(let x=0;x<size;x+=24){const gx=Math.floor((worldX+x)/CELL),gy=Math.floor((worldY+y)/CELL);if(this.floor.grid[gy]?.[gx])continue;const noise=visualNoise(this.floor.floorSeed,Math.floor((worldX+x)/24),Math.floor((worldY+y)/24),9);if(noise%11===0)ctx.fillRect(x+(noise%7),y+((noise>>>4)%7),2+(noise%4),1);}ctx.globalAlpha=1;
    const buckets=new Map();for(let ly=0;ly<cells;ly++)for(let lx=0;lx<cells;lx++){const gx=cx*cells+lx,gy=cy*cells+ly,cell=this.visualCell(gx,gy);if(!cell)continue;const spec=this.surfaceSpec(cell);if(!buckets.has(spec.key))buckets.set(spec.key,{spec,points:[]});buckets.get(spec.key).points.push({x:gx,y:gy});}
    for(const bucket of buckets.values())this.fillSurfaceBucket(ctx,bucket.spec,bucket.points,worldX,worldY);
    this.drawTerrainDetails(ctx,cx,cy,size);this.drawTerrainEdges(ctx,cx,cy);this.drawPathLayer(ctx,cx,cy);return canvas;
  }

  draw() {
    const ctx=this.ctx;ctx.imageSmoothingEnabled=false;ctx.fillStyle=this.floor.family.palette[2];ctx.fillRect(0,0,this.canvas.width,this.canvas.height);const chunkSize=TOWER_CONFIG.chunkCells*CELL,max=Math.ceil(this.floor.size/TOWER_CONFIG.chunkCells);for(let cy=0;cy<max;cy++)for(let cx=0;cx<max;cx++)if(this.chunkVisible(cx,cy)){const chunk=this.getChunk(cx,cy);ctx.drawImage(chunk,Math.round(cx*chunkSize-this.camera.x),Math.round(cy*chunkSize-this.camera.y));}
    const visible=(entry,pad=260)=>entry.x>=this.camera.x-pad&&entry.y>=this.camera.y-pad&&entry.x<=this.camera.x+this.canvas.width+pad&&entry.y<=this.camera.y+this.canvas.height+pad;
    const actors=[...this.visibleProps().filter((entry)=>visible(entry)),...this.floor.entities.filter((entry)=>!entry.hidden&&visible(entry)),{id:"player",type:"player",x:this.position.x,y:this.position.y}].sort((a,b)=>(a.path?propSortY(a):a.y)-(b.path?propSortY(b):b.y));for(const actor of actors){if(actor.type==="player")this.drawPlayer();else if(actor.path)this.drawProp(actor);else this.drawEntity(actor);}this.drawOrganicEffects();if(this.debugVisual)this.drawVisualDebug();this.drawMinimap();
  }

  drawImage(image,centerX,groundY,height,{alpha=1,mirror=false,ctx=this.ctx}={}) {if(!image)return;const bounds=this.cache.getBounds(image),width=height*(bounds.w/bounds.h),x=centerX-width/2,y=groundY-height;ctx.save();ctx.globalAlpha=alpha;if(mirror){ctx.translate(centerX*2,0);ctx.scale(-1,1);}ctx.drawImage(image,bounds.x,bounds.y,bounds.w,bounds.h,x,y,width,height);ctx.restore();return{width,height};}
  drawProp(prop){const image=this.cache.get(prop.path);if(!image)return;const shadow=propShadowSpec(prop);if(shadow.opacity>0&&shadow.width>0&&shadow.height>0){this.ctx.fillStyle=`rgba(0,0,0,${shadow.opacity})`;this.ctx.beginPath();this.ctx.ellipse(Math.round(shadow.x-this.camera.x),Math.round(shadow.y-this.camera.y),Math.max(2,shadow.width/2),Math.max(1,shadow.height/2),0,0,Math.PI*2);this.ctx.fill();}const box=propVisualBounds(prop),bounds=prop.sourceBounds,anchorX=Math.round(prop.x+prop.anchorOffsetX-this.camera.x),anchorY=Math.round(prop.y+prop.anchorOffsetY-this.camera.y);this.ctx.save();this.ctx.globalAlpha=prop.alpha??1;this.ctx.translate(anchorX,anchorY);if(prop.rotation&&prop.canRotate!==false)this.ctx.rotate(Number(prop.rotation)*Math.PI/180);if(prop.mirror&&prop.canMirror!==false)this.ctx.scale(-1,1);this.ctx.drawImage(image,bounds[0],bounds[1],bounds[2],bounds[3],Math.round(box.x-this.camera.x-anchorX),Math.round(box.y-this.camera.y-anchorY),Math.round(box.w),Math.round(box.h));this.ctx.restore();}

  resolveVisual(spec){let image=this.cache.get(spec.exact);if(image)return image;for(const candidate of spec.candidates||[]){image=this.cache.get(candidate);if(image)break;}if(!this.pendingVisuals.has(spec.exact)){this.pendingVisuals.add(spec.exact);this.cache.loadFirst(spec.exact,spec.candidates).finally(()=>this.pendingVisuals.delete(spec.exact));}return image||null;}
  drawPlayer(){const state=this.getState(),spec=this.playerCandidates(state,state.facing),resolved=this.cache.aliases.get(spec.exact)||spec.exact,loadedImage=this.resolveVisual(spec),image=loadedImage||this.lastPlayerImage,x=Math.round(this.position.x-this.camera.x),ground=Math.round(this.position.y-this.camera.y),derived=resolved===characterArt(state.route,state.visualVariant),frontOnly=state.visualVariant==="feminino"&&state.activeForm==="base";if(loadedImage)this.lastPlayerImage=loadedImage;this.ctx.fillStyle="rgba(0,0,0,.52)";this.ctx.beginPath();this.ctx.ellipse(x,ground+4,20,6,0,0,Math.PI*2);this.ctx.fill();this.drawImage(image,x,ground,68,{mirror:(derived||frontOnly)&&state.facing==="left"});this.ctx.strokeStyle=ROUTES[state.route].color;this.ctx.globalAlpha=.58;this.ctx.beginPath();this.ctx.arc(x,ground-34,25+Math.sin(now()/260)*1.5,0,Math.PI*2);this.ctx.stroke();this.ctx.globalAlpha=1;}

  drawEntity(entity) {
    const x=Math.round(entity.x-this.camera.x),ground=Math.round(entity.y-this.camera.y),ctx=this.ctx,pulse=Math.sin(now()/360+entity.x*.01);
    if(entity.type==="encounter"){const spec=entity.spriteSpecs[entity.facing]||entity.spriteSpecs.front,image=this.resolveVisual(spec);ctx.fillStyle=entity.encounter.elite?"rgba(160,24,68,.5)":"rgba(0,0,0,.42)";ctx.beginPath();ctx.ellipse(x,ground+4,entity.encounter.elite?34:24,entity.encounter.elite?9:6,0,0,Math.PI*2);ctx.fill();if(entity.encounter.elite){ctx.strokeStyle=entity.encounter.major?"#ffcf78":"#ff4f85";ctx.lineWidth=2;ctx.globalAlpha=.68;ctx.beginPath();ctx.arc(x,ground-entity.height*.48,entity.height*.36+pulse*3,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}this.drawImage(image,x,ground+(entity.flying?pulse*2:0),entity.height);}
    else if(["entrance","exit"].includes(entity.type)){ctx.save();ctx.translate(x,ground-62);ctx.strokeStyle=entity.locked?"#5d4b65":entity.type==="exit"?"#f3c46d":"#c54d7d";ctx.lineWidth=5;ctx.globalAlpha=.74;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,31+i*10+pulse*2,52-i*5,0,0,Math.PI*2);ctx.stroke();}ctx.fillStyle="rgba(28,4,20,.64)";ctx.beginPath();ctx.ellipse(0,0,25,46,0,0,Math.PI*2);ctx.fill();ctx.restore();ctx.fillStyle="#f6e7ce";ctx.font="700 10px Georgia";ctx.textAlign="center";ctx.fillText(entity.locked?"SAÍDA SELADA":entity.label.toUpperCase(),x,ground+18);}
    else{const candidates=[...this.floor.assets.structures,...this.floor.assets.props,...this.floor.assets.decorations],match=candidates.find((entry)=>entity.type.includes("altar")?entry.altar:entity.type==="chest"?/tesouro|caixa|bau/.test(entry.name):entity.type==="rune"?/cristal|runa|mag/.test(entry.name):false)||candidates[Math.abs(entity.id.length*17+entity.cellX)%Math.max(1,candidates.length)],image=this.cache.get(match?.path);ctx.fillStyle="rgba(0,0,0,.36)";ctx.beginPath();ctx.ellipse(x,ground+3,21,6,0,0,Math.PI*2);ctx.fill();this.drawImage(image,x,ground,["node","valve","living-altar"].includes(entity.type)?112:76);ctx.strokeStyle=entity.objective?"#ffe79b":"#e45785";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,ground-44,25+pulse*2,0,Math.PI*2);ctx.stroke();}
  }

  drawOrganicEffects(){const ctx=this.ctx,time=now()/1000,reduced=this.getState().settings.reducedMotion;ctx.save();ctx.globalCompositeOperation="screen";ctx.lineWidth=1;for(let i=0;i<12;i++){const y=(i*137+this.floor.floorSeed)%this.canvas.height,x=(i*241+this.floor.floorSeed)%this.canvas.width;ctx.strokeStyle=`rgba(170,28,73,${.035+(Math.sin(time*(reduced?0:.8)+i)+1)*.018})`;ctx.beginPath();ctx.moveTo(x-90,y);ctx.bezierCurveTo(x-20,y-38,x+42,y+44,x+110,y-10);ctx.stroke();}const particleCount=Math.min(TOWER_CONFIG.maxParticles,18+this.floor.familyIndex*2);for(let i=0;i<particleCount;i++){const drift=reduced?0:time*(9+this.floor.familyIndex),x=(this.floor.floorSeed+i*137+drift*(i%3+1))%(this.canvas.width+50)-25,y=(this.floor.floorSeed+i*83+(reduced?0:Math.sin(time*.4+i)*22))%this.canvas.height,r=1+(i%4)*.55;ctx.fillStyle=this.floor.familyIndex===1?"rgba(175,244,157,.18)":this.floor.familyIndex===7?"rgba(128,221,255,.2)":this.floor.familyIndex===8?"rgba(220,54,91,.19)":"rgba(238,125,155,.13)";ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}ctx.globalCompositeOperation="source-over";const gradient=ctx.createRadialGradient(this.canvas.width/2,this.canvas.height/2,130,this.canvas.width/2,this.canvas.height/2,Math.max(this.canvas.width,this.canvas.height)*.72);gradient.addColorStop(0,"rgba(0,0,0,0)");gradient.addColorStop(1,"rgba(9,2,12,.56)");ctx.fillStyle=gradient;ctx.fillRect(0,0,this.canvas.width,this.canvas.height);ctx.fillStyle=`rgba(120,10,45,${.018+(Math.sin(time*(reduced?0:.72))+1)*.012})`;ctx.fillRect(0,0,this.canvas.width,this.canvas.height);ctx.restore();}

  drawVisualDebug(){
    const ctx=this.ctx,startX=clamp(Math.floor(this.camera.x/CELL),0,this.floor.size-1),endX=clamp(Math.ceil((this.camera.x+this.canvas.width)/CELL),0,this.floor.size-1),startY=clamp(Math.floor(this.camera.y/CELL),0,this.floor.size-1),endY=clamp(Math.ceil((this.camera.y+this.canvas.height)/CELL),0,this.floor.size-1);ctx.save();ctx.textAlign="left";ctx.textBaseline="top";ctx.font="7px ui-monospace, monospace";ctx.lineWidth=1;
    for(let y=startY;y<=endY;y++)for(let x=startX;x<=endX;x++){const sx=Math.round(x*CELL-this.camera.x),sy=Math.round(y*CELL-this.camera.y),cell=this.visualCell(x,y),collision=this.floor.grid[y]?.[x]||0;ctx.strokeStyle=collision===0?"rgba(255,255,255,.13)":collision===2?"rgba(255,76,99,.72)":"rgba(91,224,255,.46)";ctx.strokeRect(sx+.5,sy+.5,CELL-1,CELL-1);if(!cell)continue;ctx.fillStyle="rgba(3,3,8,.78)";ctx.fillRect(sx+2,sy+2,CELL-4,29);ctx.fillStyle="#ffffff";ctx.fillText(`${x},${y} C${cell.collision} ${cell.roomId||"COR"}`,sx+4,sy+4);ctx.fillStyle="#8fe6ff";ctx.fillText(`${cell.zone} ${cell.patchId.replace("patch-","P")}`,sx+4,sy+12);ctx.fillStyle="#ffd48a";ctx.fillText(`N${cell.neighborMask.toString(16)} E${cell.edgeMask.toString(16)} H${cell.hazardEdgeMask.toString(16)} P${cell.pathMask.toString(16)}`,sx+4,sy+20);ctx.fillStyle="#f4a8cf";ctx.fillText((cell.pathAssetId||cell.assetName||cell.terrainFamily).slice(0,12),sx+4,sy+51);}
    const chunkSize=TOWER_CONFIG.chunkCells*CELL;ctx.strokeStyle="#ff3b91";ctx.lineWidth=2;for(let x=Math.ceil(this.camera.x/chunkSize)*chunkSize;x<this.camera.x+this.canvas.width;x+=chunkSize){ctx.beginPath();ctx.moveTo(Math.round(x-this.camera.x),0);ctx.lineTo(Math.round(x-this.camera.x),this.canvas.height);ctx.stroke();}for(let y=Math.ceil(this.camera.y/chunkSize)*chunkSize;y<this.camera.y+this.canvas.height;y+=chunkSize){ctx.beginPath();ctx.moveTo(0,Math.round(y-this.camera.y));ctx.lineTo(this.canvas.width,Math.round(y-this.camera.y));ctx.stroke();}
    for(const prop of this.visibleProps()){const collision=propCollisionBounds(prop),shadow=propShadowSpec(prop),anchorX=prop.x-this.camera.x,anchorY=prop.y-this.camera.y;ctx.strokeStyle="#ff5578";ctx.strokeRect(collision.x-this.camera.x,collision.y-this.camera.y,collision.w,collision.h);ctx.strokeStyle="#ffe06e";ctx.beginPath();ctx.ellipse(shadow.x-this.camera.x,shadow.y-this.camera.y,shadow.width/2,shadow.height/2,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#68efff";ctx.fillRect(anchorX-2,anchorY-2,5,5);}
    for(const entity of this.floor.entities.filter((entry)=>entry.type==="encounter")){ctx.strokeStyle="#c894ff";ctx.beginPath();ctx.moveTo(entity.spawnX-this.camera.x-5,entity.spawnY-this.camera.y);ctx.lineTo(entity.spawnX-this.camera.x+5,entity.spawnY-this.camera.y);ctx.moveTo(entity.spawnX-this.camera.x,entity.spawnY-this.camera.y-5);ctx.lineTo(entity.spawnX-this.camera.x,entity.spawnY-this.camera.y+5);ctx.stroke();}
    ctx.fillStyle="rgba(3,3,8,.88)";ctx.fillRect(8,8,250,30);ctx.fillStyle="#fff";ctx.font="10px ui-monospace, monospace";ctx.fillText(`FLOOR SEED ${this.floor.floorSeed} · ${this.floor.grammar.id}`,14,14);ctx.fillText(`${this.floor.family.id}${this.floor.hybrid?` + ${this.floor.hybrid.id}`:""}`,14,27);ctx.restore();
  }

  drawMinimap(){const ctx=this.mctx,w=this.minimap.width,h=this.minimap.height,size=this.floor.size,scale=Math.min(w/size,h/size),ox=(w-size*scale)/2,oy=(h-size*scale)/2;ctx.clearRect(0,0,w,h);ctx.fillStyle="#030207";ctx.fillRect(0,0,w,h);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const explored=this.explored.has(key(x,y));if(!explored)continue;const cell=this.floor.grid[y][x];ctx.fillStyle=cell===1?this.floor.family.palette[1]:cell===2?"#6f1731":"#120a17";ctx.globalAlpha=cell===1?.7:.45;ctx.fillRect(ox+x*scale,oy+y*scale,Math.max(1,scale+.25),Math.max(1,scale+.25));}ctx.globalAlpha=1;for(const entity of this.floor.entities){if(entity.hidden||!this.explored.has(key(entity.cellX,entity.cellY)))continue;if(entity.type==="exit"&&!this.explored.has(key(entity.cellX,entity.cellY)))continue;const colors={entrance:"#c55b83",exit:"#ffe59b",encounter:entity.encounter?.elite?"#ff8c5b":"#ff456d",chest:"#5fe6ff",rest:"#71e39a",event:"#c693ff","living-altar":"#ffd06a",valve:"#f2c35e",node:"#ff4b74",echo:"#e7e7ff",memory:"#70dcff",key:"#ffe873",rune:"#b889ff"},mx=ox+(entity.x/CELL)*scale,my=oy+(entity.y/CELL)*scale;ctx.fillStyle=colors[entity.type]||"#efb5c8";ctx.beginPath();if(["entrance","exit"].includes(entity.type)){ctx.moveTo(mx,my-3);ctx.lineTo(mx+3,my);ctx.lineTo(mx,my+3);ctx.lineTo(mx-3,my);ctx.closePath();}else ctx.arc(mx,my,entity.type==="encounter"?2.7:2,0,Math.PI*2);ctx.fill();}const px=ox+(this.position.x/CELL)*scale,py=oy+(this.position.y/CELL)*scale;ctx.fillStyle=ROUTES[this.getState().route].color;ctx.strokeStyle="#fff";ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(px,py,3.8,0,Math.PI*2);ctx.stroke();ctx.fill();ctx.strokeStyle="rgba(255,255,255,.82)";ctx.lineWidth=1;ctx.strokeRect(ox+(this.camera.x/CELL)*scale,oy+(this.camera.y/CELL)*scale,(this.canvas.width/CELL)*scale,(this.canvas.height/CELL)*scale);ctx.strokeStyle="rgba(255,255,255,.32)";ctx.strokeRect(ox+.5,oy+.5,size*scale-1,size*scale-1);}
}
