import { REGIONS, ROUTES, COMPANIONS, asset, characterArt, formSprite, mobSprite, tileSprite } from "./data.js";

const now = () => globalThis.performance?.now?.() || Date.now();
const ALPHA_THRESHOLD = 8;
const WORLD_SCALE = 2;
const PLAYER_HEIGHT = 68;
const ENTITY_HEIGHTS = { npc:72, normal:86, miniboss:112, boss:140 };
const FLYING_ENEMIES = new Set([
  "fada_gelo","espectro_cinzas","dragao_fogo","dragao_pedra","harpia_deserto","pirata_fantasma",
  "agua_viva_abissal","corvo_sombrio","dragao_tempestade","aguia_tempestade","arraia_eletrica","elemental_nuvem",
  "boss_01_dragao_vulcanico","boss_02_dragao_pedra","boss_02_leviata_abissal","boss_01_grifo_tempestade","boss_02_dragao_tempestade"
]);

const point = (x,y) => ({x,y});
const obstacle = (x,y,w,h) => ({x,y,w,h});

// Coordenadas normalizadas mantêm os dez layouts estáveis caso o mundo volte a mudar de escala.
// Cada região usa bloqueios próprios, posicionados sobre maciços, florestas, lava, água ou ruínas visíveis no terreno correspondente.
export const REGION_LAYOUTS = [
  { spawn:point(.10,.82), npc:point(.20,.76), chest:point(.42,.68), altar:point(.69,.82), normal:point(.31,.48), miniboss:point(.58,.28), boss1:point(.74,.49), boss2:point(.86,.73), portal:point(.94,.50), objects:[point(.08,.09),point(.39,.12),point(.68,.08),point(.13,.48)], obstacles:[obstacle(.05,.06,.18,.15),obstacle(.35,.07,.15,.12),obstacle(.64,.05,.22,.14),obstacle(.09,.43,.12,.14),obstacle(.49,.68,.14,.15)] },
  { spawn:point(.12,.78), npc:point(.22,.69), chest:point(.46,.80), altar:point(.73,.66), normal:point(.32,.42), miniboss:point(.56,.24), boss1:point(.78,.39), boss2:point(.88,.72), portal:point(.95,.52), objects:[point(.05,.14),point(.38,.06),point(.65,.12),point(.12,.52)], obstacles:[obstacle(.03,.10,.20,.19),obstacle(.34,.04,.18,.16),obstacle(.62,.08,.18,.19),obstacle(.08,.47,.14,.17),obstacle(.48,.55,.13,.20)] },
  { spawn:point(.09,.75), npc:point(.20,.68), chest:point(.38,.83), altar:point(.70,.76), normal:point(.30,.39), miniboss:point(.59,.24), boss1:point(.73,.42), boss2:point(.87,.65), portal:point(.95,.46), objects:[point(.09,.08),point(.42,.13),point(.71,.07),point(.16,.47)], obstacles:[obstacle(.06,.05,.16,.16),obstacle(.37,.09,.18,.13),obstacle(.68,.04,.20,.16),obstacle(.12,.42,.16,.13),obstacle(.45,.61,.17,.16)] },
  { spawn:point(.14,.84), npc:point(.24,.73), chest:point(.43,.58), altar:point(.67,.83), normal:point(.34,.35), miniboss:point(.57,.20), boss1:point(.76,.38), boss2:point(.88,.68), portal:point(.95,.50), objects:[point(.04,.11),point(.36,.08),point(.63,.13),point(.10,.46)], obstacles:[obstacle(.02,.07,.20,.17),obstacle(.32,.05,.19,.15),obstacle(.60,.09,.22,.14),obstacle(.06,.42,.15,.18),obstacle(.48,.67,.12,.14)] },
  { spawn:point(.08,.81), npc:point(.19,.72), chest:point(.40,.84), altar:point(.65,.70), normal:point(.28,.44), miniboss:point(.52,.26), boss1:point(.73,.45), boss2:point(.87,.77), portal:point(.95,.56), objects:[point(.06,.06),point(.34,.14),point(.69,.09),point(.11,.51)], obstacles:[obstacle(.03,.03,.18,.18),obstacle(.29,.10,.19,.16),obstacle(.66,.06,.18,.18),obstacle(.07,.47,.13,.16),obstacle(.45,.62,.14,.18)] },
  { spawn:point(.11,.73), npc:point(.23,.79), chest:point(.45,.66), altar:point(.72,.80), normal:point(.31,.37), miniboss:point(.60,.23), boss1:point(.75,.40), boss2:point(.89,.66), portal:point(.96,.48), objects:[point(.04,.15),point(.40,.07),point(.69,.13),point(.15,.45)], obstacles:[obstacle(.02,.11,.17,.15),obstacle(.36,.04,.20,.16),obstacle(.66,.09,.20,.16),obstacle(.11,.41,.14,.16),obstacle(.49,.58,.15,.14)] },
  { spawn:point(.15,.83), npc:point(.25,.74), chest:point(.27,.58), altar:point(.62,.46), normal:point(.27,.29), miniboss:point(.58,.23), boss1:point(.84,.27), boss2:point(.74,.78), portal:point(.52,.82), objects:[point(.14,.22),point(.50,.17),point(.78,.18),point(.60,.55)], obstacles:[obstacle(.00,.00,.18,.16),obstacle(.37,.00,.16,.12),obstacle(.69,.00,.14,.14),obstacle(.00,.25,.08,.38),obstacle(.35,.31,.11,.13),obstacle(.34,.52,.10,.12),obstacle(.43,.57,.14,.17),obstacle(.88,.38,.12,.22),obstacle(.00,.59,.10,.21),obstacle(.57,.89,.22,.11)] },
  { spawn:point(.30,.83), npc:point(.37,.72), chest:point(.49,.62), altar:point(.61,.34), normal:point(.34,.43), miniboss:point(.54,.25), boss1:point(.77,.45), boss2:point(.82,.72), portal:point(.72,.88), objects:[point(.09,.18),point(.42,.10),point(.71,.13),point(.88,.63)], obstacles:[obstacle(.00,.00,.12,.23),obstacle(.27,.00,.10,.18),obstacle(.56,.00,.12,.15),obstacle(.88,.00,.12,.25),obstacle(.00,.32,.09,.22),obstacle(.20,.52,.10,.14),obstacle(.44,.68,.13,.17),obstacle(.61,.52,.10,.17),obstacle(.00,.80,.20,.20),obstacle(.87,.84,.13,.16)] },
  { spawn:point(.09,.77), npc:point(.20,.69), chest:point(.42,.79), altar:point(.71,.72), normal:point(.30,.40), miniboss:point(.57,.18), boss1:point(.77,.37), boss2:point(.89,.68), portal:point(.96,.50), objects:[point(.04,.08),point(.36,.12),point(.66,.08),point(.13,.46)], obstacles:[obstacle(.02,.05,.18,.17),obstacle(.32,.08,.19,.15),obstacle(.63,.05,.21,.16),obstacle(.09,.42,.15,.16),obstacle(.47,.61,.15,.16)] },
  { spawn:point(.29,.84), npc:point(.36,.76), chest:point(.50,.86), altar:point(.58,.53), normal:point(.29,.50), miniboss:point(.42,.25), boss1:point(.64,.34), boss2:point(.82,.48), portal:point(.74,.75), objects:[point(.19,.43),point(.43,.20),point(.65,.30),point(.78,.44)], obstacles:[obstacle(.00,.00,.13,.34),obstacle(.30,.00,.10,.14),obstacle(.51,.00,.10,.18),obstacle(.84,.00,.16,.28),obstacle(.00,.65,.15,.35),obstacle(.36,.57,.13,.14),obstacle(.56,.65,.10,.22),obstacle(.84,.61,.16,.39),obstacle(.56,.91,.28,.09)] }
];

const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const unique = (values) => [...new Set(values.filter(Boolean))];

export class AssetCache {
  constructor() {
    this.images = new Map();
    this.aliases = new Map();
    this.bounds = new WeakMap();
    this.missing = new Set();
  }

  load(src) {
    if (!src) return Promise.resolve(null);
    if (this.images.has(src)) return this.images.get(src).promise;
    const image = new Image();
    const entry = {image,promise:null,valid:false,lastUsed:now()};
    entry.promise = new Promise((resolve) => {
      image.onload = () => {
        entry.valid = image.naturalWidth > 0 && image.naturalHeight > 0;
        if (!entry.valid) this.reportMissing(src,"dimensões naturais inválidas");
        else this.getBounds(image);
        resolve(entry.valid ? image : null);
      };
      image.onerror = () => { entry.valid=false;this.reportMissing(src,"falha de carregamento");resolve(null); };
    });
    this.images.set(src,entry);
    image.src = src;
    return entry.promise;
  }

  reportMissing(src,reason) {
    if (this.missing.has(src)) return;
    this.missing.add(src);
    console.warn(`[AssetCache] Sprite indisponível (${reason}): ${src}`);
  }

  async loadFirst(requested,candidates=[]) {
    const paths=unique([requested,...candidates]);
    for (const path of paths) {
      const image=await this.load(path);
      if (image && image.naturalWidth>0 && image.naturalHeight>0) {
        this.aliases.set(requested,path);
        if(path!==requested)console.warn(`[AssetCache] Usando fallback para ${requested}: ${path}`);
        return image;
      }
    }
    this.reportMissing(requested,"nenhum fallback válido");
    return null;
  }

  get(src) {
    const resolved=this.aliases.get(src)||src;
    const entry=this.images.get(resolved);
    if(entry)entry.lastUsed=now();
    const image=entry?.image;
    return entry?.valid && image?.complete && image.naturalWidth>0 && image.naturalHeight>0 ? image : null;
  }

  getBounds(image) {
    if(!image)return{x:0,y:0,w:1,h:1};
    const cached=this.bounds.get(image);if(cached)return cached;
    const full={x:0,y:0,w:Math.max(1,image.naturalWidth||image.width||1),h:Math.max(1,image.naturalHeight||image.height||1)};
    try {
      const canvas=document.createElement("canvas");canvas.width=full.w;canvas.height=full.h;
      const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.clearRect(0,0,full.w,full.h);ctx.drawImage(image,0,0);
      const pixels=ctx.getImageData(0,0,full.w,full.h).data;
      let left=full.w,top=full.h,right=-1,bottom=-1;
      for(let y=0;y<full.h;y++)for(let x=0;x<full.w;x++)if(pixels[(y*full.w+x)*4+3]>ALPHA_THRESHOLD){if(x<left)left=x;if(x>right)right=x;if(y<top)top=y;if(y>bottom)bottom=y;}
      const result=right>=left&&bottom>=top?{x:left,y:top,w:right-left+1,h:bottom-top+1}:full;
      this.bounds.set(image,result);return result;
    } catch(error) {
      // Os arquivos entregues já estão fisicamente aparados; este fallback preserva o jogo aberto por file://.
      this.bounds.set(image,full);return full;
    }
  }

  async loadGroup(paths,onProgress=()=>{}) {
    const list=unique(paths);let done=0;
    if(!list.length){onProgress(1);return;}
    await Promise.all(list.map((path)=>this.load(path).then(()=>{done+=1;onProgress(done/list.length);}))); 
  }

  releaseOld(maxAge=180000) {
    const time=now();
    for(const [key,value] of this.images)if(time-value.lastUsed>maxAge&&!this.aliases.has(key))this.images.delete(key);
  }
}

export class ExplorationEngine {
  constructor({canvas,minimap,getState,cache,audio,onInteract,onEncounter,onPortal,onTower,onHud,onPrompt,onLoading}) {
    this.canvas=canvas;this.ctx=canvas.getContext("2d",{alpha:false});this.ctx.imageSmoothingEnabled=false;
    this.minimap=minimap;this.mctx=minimap.getContext("2d");this.getState=getState;this.cache=cache;this.audio=audio;
    this.callbacks={onInteract,onEncounter,onPortal,onTower,onHud,onPrompt,onLoading};this.keys=new Set();this.target=null;this.running=false;this.paused=true;
    this.lastTime=now();this.camera={x:0,y:0};this.world={w:2896,h:2172,sourceW:1448,sourceH:1086};this.nearEntity=null;this.frame=0;this.entities=[];this.touchSprint=false;this.moving=false;
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener("keydown",(event)=>{
      if(this.paused)return;
      const settings=this.getState()?.settings;
      if(Object.values(settings?.keys||{}).includes(event.code)||["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","ShiftLeft","ShiftRight"].includes(event.code))event.preventDefault();
      this.keys.add(event.code);if(event.code===settings?.keys?.interact||event.code==="Space")this.interact();
    },{passive:false});
    window.addEventListener("keyup",(event)=>this.keys.delete(event.code));
    window.addEventListener("blur",()=>{this.keys.clear();this.touchSprint=false;});
    this.canvas.addEventListener("pointerdown",(event)=>{
      if(this.paused)return;const rect=this.canvas.getBoundingClientRect(),sx=this.canvas.width/rect.width,sy=this.canvas.height/rect.height;
      this.target={x:(event.clientX-rect.left)*sx+this.camera.x,y:(event.clientY-rect.top)*sy+this.camera.y};this.canvas.focus();
    });
  }

  setTouchDirection(direction,active){const map={up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"};if(active)this.keys.add(map[direction]);else this.keys.delete(map[direction]);}
  setSprint(active){this.touchSprint=Boolean(active);}
  layout(index=this.getState()?.regionIndex||0){return REGION_LAYOUTS[index]||REGION_LAYOUTS[0];}
  toWorld(normalized){return{x:normalized.x*this.world.w,y:normalized.y*this.world.h};}
  spawnPoint(index=this.getState()?.regionIndex||0){return this.toWorld((REGION_LAYOUTS[index]||REGION_LAYOUTS[0]).spawn);}
  obstacles(index=this.getState()?.regionIndex||0){return(this.layout(index).obstacles||[]).map((box)=>({x:box.x*this.world.w,y:box.y*this.world.h,w:box.w*this.world.w,h:box.h*this.world.h}));}

  playerCandidates(state,direction) {
    const front=formSprite(state.route,state.activeForm,"front",state.visualVariant);
    const exact=state.visualVariant==="feminino"&&state.activeForm==="base"?front:formSprite(state.route,state.activeForm,direction,state.visualVariant);
    return{exact,candidates:[front,characterArt(state.route,state.visualVariant)]};
  }

  enemyCandidates(region,id,direction,boss) {
    const exact=mobSprite(region,id,direction,boss),front=mobSprite(region,id,"front",boss);
    const peers=boss?[region.miniboss,...region.bosses]:region.normal;
    return{exact,candidates:[front,...peers.filter((peer)=>peer!==id).map((peer)=>mobSprite(region,peer,"front",boss))]};
  }

  async loadRegion(index,announce=true) {
    const state=this.getState(),region=REGIONS[index];if(!state||!region)return;
    this.paused=true;this.callbacks.onLoading?.(true,`Abrindo ${region.name}...`,.03);state.regionIndex=index;
    if(!state.discoveredRegions.includes(index))state.discoveredRegions.push(index);
    const core=[asset(region.biome),asset(region.map),asset(region.battle),asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"),...region.tileObjects.map((file)=>tileSprite(region,file)),this.npcSprite(index)];
    await this.cache.loadGroup(core,(progress)=>this.callbacks.onLoading?.(true,`Carregando ${region.subtitle}...`,progress*.55));
    const bg=this.cache.get(asset(region.biome));
    if(bg)this.world={w:bg.naturalWidth*WORLD_SCALE,h:bg.naturalHeight*WORLD_SCALE,sourceW:bg.naturalWidth,sourceH:bg.naturalHeight};
    this.buildEntities();
    const spriteLoads=[];
    for(const direction of["front","back","left","right"]){const spec=this.playerCandidates(state,direction);spriteLoads.push(this.cache.loadFirst(spec.exact,spec.candidates));}
    for(const entity of this.entities)if(entity.sprite){spriteLoads.push(this.cache.loadFirst(entity.sprite,entity.fallbacks||[]));}
    await Promise.all(spriteLoads.map((promise,index)=>promise.then(()=>this.callbacks.onLoading?.(true,`Alinhando habitantes e criaturas...`,.55+.45*(index+1)/Math.max(1,spriteLoads.length)))));
    const changed=index!==this.lastRegion;if(announce||changed||!state.position||this.collides(state.position))state.position=this.findSafeSpawn(index);
    this.lastRegion=index;this.camera.x=Math.max(0,Math.min(this.world.w-this.canvas.width,state.position.x-this.canvas.width/2));this.camera.y=Math.max(0,Math.min(this.world.h-this.canvas.height,state.position.y-this.canvas.height/2));
    this.callbacks.onHud?.();this.callbacks.onLoading?.(false,"",1);this.paused=false;this.audio.startAmbient(index);this.cache.releaseOld();
  }

  findSafeSpawn(index) {
    const spawn=this.spawnPoint(index);if(!this.collides(spawn,index))return spawn;
    for(let radius=40;radius<=360;radius+=40)for(let angle=0;angle<Math.PI*2;angle+=Math.PI/4){const candidate={x:spawn.x+Math.cos(angle)*radius,y:spawn.y+Math.sin(angle)*radius};if(!this.collides(candidate,index))return candidate;}
    return{x:120,y:this.world.h-120};
  }

  npcSprite(index) {
    const choices=[COMPANIONS.eliara.sprite,asset("personagens/sprites_separadas/fada_timbo_feminino/fada_timbo_feminino_front.webp"),asset("personagens/sprites_separadas/anao_oculos_feminino/anao_oculos_feminino_front.webp"),COMPANIONS.dagra.sprite,asset("personagens/sprites_separadas/necromante_oculos_feminino/necromante_oculos_feminino_front.webp"),asset("personagens/sprites_separadas/vampiro_timbo_feminino/vampiro_timbo_feminino_front.webp"),asset("personagens/sprites_separadas/sereia_oculos_feminino/sereia_oculos_feminino_front.webp"),asset("personagens/sprites_separadas/sereia_timbo_feminino/sereia_timbo_feminino_front.webp"),asset("personagens/sprites_separadas/necromante_timbo_feminino/necromante_timbo_feminino_front.webp"),asset("personagens/sprites_separadas/fada_oculos_feminino/fada_oculos_feminino_front.webp")];
    return choices[index%choices.length];
  }

  towerEntrancePoint(index=this.getState()?.regionIndex||0) {
    const candidates=[point(.82,.17),point(.74,.84),point(.18,.24),point(.88,.52),point(.55,.88)];
    for(let offset=0;offset<candidates.length;offset++){const candidate=this.toWorld(candidates[(index+offset)%candidates.length]);if(!this.collides(candidate,index))return candidate;}
    return this.findSafeSpawn(index);
  }

  buildEntities() {
    const state=this.getState(),region=REGIONS[state.regionIndex],layout=this.layout(state.regionIndex),defeated=state.defeated[region.key]||[];
    const sequence={normal:true,miniboss:defeated.includes("normal"),boss1:defeated.includes("miniboss"),boss2:defeated.includes("boss1")};
    const bases=[{id:"npc",type:"npc",at:layout.npc,label:region.npc},{id:"chest",type:"chest",at:layout.chest,label:"Tesouro"},{id:"altar",type:"altar",at:layout.altar,label:"Memória"},{id:"normal",type:"encounter",encounter:"normal",at:layout.normal,label:"Criaturas"},{id:"miniboss",type:"encounter",encounter:"miniboss",at:layout.miniboss,label:"Miniboss"},{id:"boss1",type:"encounter",encounter:"boss1",at:layout.boss1,label:"Guardião"},{id:"boss2",type:"encounter",encounter:"boss2",at:layout.boss2,label:"Portador"},{id:"portal",type:"portal",at:layout.portal,label:"Travessia"}];
    if(state.tower?.unlocked){const entrance=this.towerEntrancePoint(state.regionIndex);bases.push({id:"tower-entrance",type:"tower",at:null,x:entrance.x,y:entrance.y,label:"Torre da Carne"});}
    this.entities=bases.map((base)=>{
      const entity=base.at?{...base,...this.toWorld(base.at)}:{...base};
      if(entity.type==="encounter"){
        entity.defeated=defeated.includes(entity.encounter);entity.locked=!sequence[entity.encounter];let boss=false;
        if(entity.encounter==="normal"){entity.enemyId=region.normal[state.regionIndex%region.normal.length];entity.kind="normal";}
        else if(entity.encounter==="miniboss"){entity.enemyId=region.miniboss;entity.kind="miniboss";boss=true;}
        else{const bossIndex=entity.encounter==="boss1"?0:1;entity.enemyId=region.bosses[bossIndex];entity.kind="boss";boss=true;}
        const spec=this.enemyCandidates(region,entity.enemyId,"front",boss);entity.sprite=spec.exact;entity.fallbacks=spec.candidates;entity.height=ENTITY_HEIGHTS[entity.kind];entity.flying=FLYING_ENEMIES.has(entity.enemyId);
      }else if(entity.type==="npc"){entity.sprite=this.npcSprite(state.regionIndex);entity.height=ENTITY_HEIGHTS.npc;}
      return entity;
    }).filter((entity)=>{
      if(entity.type==="chest"&&state.openedChests.includes(`${region.key}-chest`))return false;
      if(entity.type==="altar"&&state.inspectedAltars.includes(region.key))return false;
      if(entity.type==="portal"&&!defeated.includes("boss2"))return false;
      return!entity.defeated;
    });
    const objective=this.entities.find((entity)=>entity.type==="encounter"&&!entity.locked)||this.entities.find((entity)=>entity.type==="portal")||this.entities.find((entity)=>entity.type==="npc");
    if(objective)objective.objective=true;
  }

  start(){if(this.running){this.paused=false;return;}this.running=true;this.paused=false;this.lastTime=now();const loop=(time)=>{if(!this.running)return;const dt=Math.min(.04,(time-this.lastTime)/1000);this.lastTime=time;if(!this.paused)this.update(dt);this.draw();requestAnimationFrame(loop);};requestAnimationFrame(loop);}
  stop(){this.paused=true;this.keys.clear();this.touchSprint=false;}
  resume(){this.paused=false;this.lastTime=now();this.canvas.focus();}

  update(dt) {
    const state=this.getState();if(!state)return;const keys=state.settings.keys;let dx=0,dy=0;
    if(this.keys.has(keys.left)||this.keys.has("ArrowLeft"))dx-=1;if(this.keys.has(keys.right)||this.keys.has("ArrowRight"))dx+=1;if(this.keys.has(keys.up)||this.keys.has("ArrowUp"))dy-=1;if(this.keys.has(keys.down)||this.keys.has("ArrowDown"))dy+=1;
    const pad=navigator.getGamepads?.()[0];if(pad){if(Math.abs(pad.axes[0])>.18)dx+=pad.axes[0];if(Math.abs(pad.axes[1])>.18)dy+=pad.axes[1];if(pad.buttons[0]?.pressed&&!this.gamepadAction){this.gamepadAction=true;this.interact();}if(!pad.buttons[0]?.pressed)this.gamepadAction=false;}
    if(!dx&&!dy&&this.target){const vx=this.target.x-state.position.x,vy=this.target.y-state.position.y;if(Math.hypot(vx,vy)<10)this.target=null;else{dx=vx;dy=vy;}}else if(dx||dy)this.target=null;
    this.moving=Boolean(dx||dy);
    if(this.moving){const length=Math.hypot(dx,dy)||1;dx/=length;dy/=length;const sprint=this.touchSprint||this.keys.has("ShiftLeft")||this.keys.has("ShiftRight")||Boolean(pad?.buttons?.[1]?.pressed);const travel=(sprint?330:205)*dt;const steps=Math.max(1,Math.ceil(travel/10));
      for(let step=0;step<steps;step++){const move=travel/steps,next={x:state.position.x+dx*move,y:state.position.y+dy*move};if(!this.collides(next))state.position=next;else{const nx={x:state.position.x+dx*move,y:state.position.y},ny={x:state.position.x,y:state.position.y+dy*move};if(!this.collides(nx))state.position=nx;else if(!this.collides(ny))state.position=ny;}}
      if(Math.abs(dx)>Math.abs(dy))state.facing=dx<0?"left":"right";else state.facing=dy<0?"back":"front";this.frame+=dt*(sprint?12:8);
    }
    const maxX=Math.max(0,this.world.w-this.canvas.width),maxY=Math.max(0,this.world.h-this.canvas.height),targetCamX=Math.max(0,Math.min(maxX,state.position.x-this.canvas.width/2)),targetCamY=Math.max(0,Math.min(maxY,state.position.y-this.canvas.height/2));this.camera.x+=(targetCamX-this.camera.x)*Math.min(1,dt*6);this.camera.y+=(targetCamY-this.camera.y)*Math.min(1,dt*6);
    const nearby=this.entities.filter((entity)=>distance(state.position,entity)<118).sort((a,b)=>distance(state.position,a)-distance(state.position,b))[0]||null;if(nearby?.id!==this.nearEntity?.id){this.nearEntity=nearby;this.callbacks.onPrompt?.(nearby);}
    const atPortal=this.entities.some((entity)=>entity.type==="portal"&&distance(state.position,entity)<58);if(atPortal&&!this.portalTriggered){this.portalTriggered=true;this.callbacks.onPortal?.();}if(!atPortal)this.portalTriggered=false;this.callbacks.onHud?.(false);
  }

  collides(position,index=this.getState()?.regionIndex||0) {
    const radius=21,border=64;if(position.x<border+radius||position.y<border+radius||position.x>this.world.w-border-radius||position.y>this.world.h-border-radius)return true;
    return this.obstacles(index).some((box)=>position.x+radius>box.x&&position.x-radius<box.x+box.w&&position.y+radius>box.y&&position.y-radius<box.y+box.h);
  }

  interact(){if(this.paused||!this.nearEntity)return;const entity=this.nearEntity;this.audio.confirm();if(entity.type==="encounter"){if(entity.locked)return this.callbacks.onInteract?.({type:"locked",entity});this.paused=true;this.callbacks.onEncounter?.(entity.encounter,entity);}else if(entity.type==="portal")this.callbacks.onPortal?.();else if(entity.type==="tower"){this.paused=true;this.callbacks.onTower?.();}else this.callbacks.onInteract?.(entity);}

  draw() {
    const state=this.getState();if(!state)return;const region=REGIONS[state.regionIndex],ctx=this.ctx,bg=this.cache.get(asset(region.biome));ctx.imageSmoothingEnabled=false;ctx.fillStyle=region.palette[2];ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    if(bg)ctx.drawImage(bg,0,0,bg.naturalWidth,bg.naturalHeight,-Math.round(this.camera.x),-Math.round(this.camera.y),this.world.w,this.world.h);
    ctx.fillStyle="rgba(4,3,9,.14)";ctx.fillRect(0,0,this.canvas.width,this.canvas.height);this.drawWorldObjects(region);[...this.entities].sort((a,b)=>a.y-b.y).forEach((entity)=>this.drawEntity(entity,region));this.drawPlayer(state);this.drawLighting(region);this.drawMinimap(state,region);
  }

  drawCropped(image,centerX,groundY,targetHeight,{alpha=1,mirror=false}={}) {
    if(!image)return null;const bounds=this.cache.getBounds(image),width=targetHeight*(bounds.w/bounds.h),x=centerX-width/2,y=groundY-targetHeight;this.ctx.save();this.ctx.globalAlpha=alpha;
    if(mirror){this.ctx.translate(centerX*2,0);this.ctx.scale(-1,1);this.ctx.drawImage(image,bounds.x,bounds.y,bounds.w,bounds.h,x,y,width,targetHeight);}else this.ctx.drawImage(image,bounds.x,bounds.y,bounds.w,bounds.h,x,y,width,targetHeight);
    this.ctx.restore();return{width,height:targetHeight,x,y};
  }

  drawWorldObjects(region) {
    const placements=this.layout(region.id).objects;
    region.tileObjects.forEach((file,index)=>{const image=this.cache.get(tileSprite(region,file));if(!image)return;const p=this.toWorld(placements[index]);const bounds=this.cache.getBounds(image),targetWidth=[230,185,220,150][index],scale=targetWidth/bounds.w,targetHeight=bounds.h*scale;this.ctx.drawImage(image,bounds.x,bounds.y,bounds.w,bounds.h,Math.round(p.x-this.camera.x-targetWidth/2),Math.round(p.y-this.camera.y-targetHeight),Math.round(targetWidth),Math.round(targetHeight));});
  }

  drawEntity(entity,region) {
    const x=Math.round(entity.x-this.camera.x),ground=Math.round(entity.y-this.camera.y);if(x<-190||ground<-190||x>this.canvas.width+190||ground>this.canvas.height+190)return;const ctx=this.ctx;ctx.save();
    if(entity.type==="npc"||entity.type==="encounter"){
      const image=this.cache.get(entity.sprite),height=entity.height||ENTITY_HEIGHTS.npc,float=entity.flying?Math.sin(now()/520+entity.x)*2.2:0,feet=ground+float,alpha=entity.locked?.32:1;ctx.globalAlpha=alpha;ctx.fillStyle="rgba(0,0,0,.38)";ctx.beginPath();ctx.ellipse(x,ground+4,Math.max(19,height*.28),Math.max(5,height*.07),0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      this.drawCropped(image,x,feet,height,{alpha});if(entity.type==="npc"||!entity.locked){ctx.globalAlpha=alpha;ctx.fillStyle=entity.type==="npc"?"#ffe49d":"#ff5574";ctx.beginPath();ctx.moveTo(x,feet-height-13);ctx.lineTo(x+7,feet-height-6);ctx.lineTo(x,feet-height+1);ctx.lineTo(x-7,feet-height-6);ctx.fill();}
    }else if(entity.type==="chest"){const image=this.cache.get(tileSprite(region,region.tileObjects[1]));this.drawObject(image,x,ground,70);ctx.strokeStyle="#ffe39a";ctx.strokeRect(x-27,ground-41,54,38);}
    else if(entity.type==="altar"){const image=this.cache.get(tileSprite(region,region.tileObjects[2]));this.drawObject(image,x,ground,104);ctx.strokeStyle=region.palette[0];ctx.beginPath();ctx.arc(x,ground-35,34+Math.sin(now()/300)*2,0,Math.PI*2);ctx.stroke();}
    else if(entity.type==="portal"){const image=this.cache.get(asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"));ctx.globalAlpha=.78;this.drawObject(image,x,ground,120);ctx.globalAlpha=1;ctx.fillStyle="#fff";ctx.font="700 11px Georgia";ctx.textAlign="center";ctx.fillText("PRÓXIMA REGIÃO",x,ground+24);}
    else if(entity.type==="tower"){const pulse=Math.sin(now()/360);ctx.fillStyle="rgba(25,2,13,.72)";ctx.beginPath();ctx.ellipse(x,ground-56,31,52,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#c73768";ctx.lineWidth=4;ctx.globalAlpha=.76;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x,ground-56,38+i*10+pulse*2,58-i*4,0,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;ctx.fillStyle="#ffe1ca";ctx.font="700 11px Georgia";ctx.textAlign="center";ctx.fillText("TORRE DA CARNE",x,ground+24);}
    ctx.restore();
  }

  drawObject(image,x,ground,targetHeight){if(!image)return;const bounds=this.cache.getBounds(image),width=targetHeight*(bounds.w/bounds.h);this.ctx.drawImage(image,bounds.x,bounds.y,bounds.w,bounds.h,x-width/2,ground-targetHeight,width,targetHeight);}

  drawPlayer(state) {
    const spec=this.playerCandidates(state,state.facing),image=this.cache.get(spec.exact),x=Math.round(state.position.x-this.camera.x),ground=Math.round(state.position.y-this.camera.y);this.ctx.fillStyle="rgba(0,0,0,.48)";this.ctx.beginPath();this.ctx.ellipse(x,ground+4,20,6,0,0,Math.PI*2);this.ctx.fill();
    const resolved=this.cache.aliases.get(spec.exact)||spec.exact,derived=resolved===characterArt(state.route,state.visualVariant),frontOnly=state.visualVariant==="feminino"&&state.activeForm==="base",mirror=(derived||frontOnly)&&state.facing==="left";this.drawCropped(image,x,ground,PLAYER_HEIGHT,{mirror});const route=ROUTES[state.route];this.ctx.strokeStyle=route.color;this.ctx.globalAlpha=.5;this.ctx.beginPath();this.ctx.arc(x,ground-34,26+Math.sin(now()/250)*1.5,0,Math.PI*2);this.ctx.stroke();this.ctx.globalAlpha=1;
  }

  drawLighting(region){const gradient=this.ctx.createRadialGradient(this.canvas.width/2,this.canvas.height/2,160,this.canvas.width/2,this.canvas.height/2,650);gradient.addColorStop(0,"rgba(0,0,0,0)");gradient.addColorStop(1,"rgba(3,2,8,.48)");this.ctx.fillStyle=gradient;this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);this.ctx.fillStyle=region.id===7?"rgba(30,87,170,.12)":region.id===2?"rgba(180,42,13,.08)":"rgba(0,0,0,0)";this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);}

  drawMinimap(state,region) {
    const ctx=this.mctx,w=this.minimap.width,h=this.minimap.height,bg=this.cache.get(asset(region.biome));ctx.clearRect(0,0,w,h);ctx.fillStyle="#05030a";ctx.fillRect(0,0,w,h);
    const scale=Math.min(w/this.world.w,h/this.world.h),mapW=this.world.w*scale,mapH=this.world.h*scale,ox=(w-mapW)/2,oy=(h-mapH)/2;if(bg)ctx.drawImage(bg,0,0,bg.naturalWidth,bg.naturalHeight,ox,oy,mapW,mapH);ctx.fillStyle="rgba(3,2,8,.22)";ctx.fillRect(ox,oy,mapW,mapH);
    const marker=(entity)=>{const mx=ox+entity.x*scale,my=oy+entity.y*scale;const colors={npc:"#ffe39a",chest:"#55e7ff",altar:"#9d7cff",portal:"#e967ff",tower:"#ff557e"};let color=colors[entity.type]||"#ff4567";if(entity.encounter==="miniboss")color="#ff9c55";if(entity.encounter==="boss1")color="#ff4567";if(entity.encounter==="boss2")color="#d232ff";if(entity.objective){ctx.strokeStyle="#fff2a6";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mx,my,6.3,0,Math.PI*2);ctx.stroke();}ctx.fillStyle=color;ctx.strokeStyle="rgba(0,0,0,.9)";ctx.lineWidth=2;ctx.beginPath();if(entity.type==="chest")ctx.rect(mx-2.8,my-2.8,5.6,5.6);else if(entity.type==="portal"||entity.type==="tower"){ctx.moveTo(mx,my-4);ctx.lineTo(mx+4,my);ctx.lineTo(mx,my+4);ctx.lineTo(mx-4,my);ctx.closePath();}else ctx.arc(mx,my,entity.type==="encounter"?3.5:3,0,Math.PI*2);ctx.stroke();ctx.fill();};
    this.entities.forEach(marker);const px=ox+state.position.x*scale,py=oy+state.position.y*scale;ctx.fillStyle=ROUTES[state.route].color;ctx.strokeStyle="#fff";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(px,py,4.2,0,Math.PI*2);ctx.stroke();ctx.fill();ctx.strokeStyle="rgba(255,255,255,.8)";ctx.lineWidth=1;ctx.strokeRect(ox+this.camera.x*scale,oy+this.camera.y*scale,Math.min(mapW,this.canvas.width*scale),Math.min(mapH,this.canvas.height*scale));ctx.strokeStyle="rgba(255,255,255,.48)";ctx.strokeRect(ox+.5,oy+.5,mapW-1,mapH-1);
  }
}
