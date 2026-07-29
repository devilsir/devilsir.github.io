'use strict';

/* ============================================================
   RPG Química — Raio Atômico & Íons: Campus Periodicum
   Canvas 2D, 16 px, execução direta em file:// e GitHub Pages.
   ============================================================ */

const {
  NEUTRAL_PM,
  ELEMENTS,
  ITEMS,
  RANKS,
  REGIONS,
  NPCS,
  MAIN_MISSIONS,
  SIDE_MISSIONS,
  QUIZZES
} = window.GAME_DATA;

/* ---------- Constantes e referências ---------- */

const cvs = document.getElementById('game');
const ctx = cvs.getContext('2d', {alpha:false});
ctx.imageSmoothingEnabled = false;

const ui = document.getElementById('ui');
const uicard = document.getElementById('uicard');
const uicontent = document.getElementById('uicontent');
const closeBtn = document.getElementById('closeBtn');
const muteBtn = document.getElementById('muteBtn');
const fsBtn = document.getElementById('fsBtn');
const testBtn = document.getElementById('testBtn');
const doneEl = document.getElementById('done');
const totalEl = document.getElementById('total');
const rankEl = document.getElementById('rank');
const rpEl = document.getElementById('rp');
const objectiveEl = document.getElementById('objective');
const toastArea = document.getElementById('toastArea');

const TILE = 16;
const VW = 960;
const VH = 540;
const WORLD_W = 160;
const WORLD_H = 86;
const SPAWN = Object.freeze({x:18 * TILE, y:12 * TILE});
const SAVE_KEY = 'rpg_quimica_raio_v3';
const LEGACY_SAVE_KEY = 'rpg_quimica_raio_v2';
const SAVE_VERSION = 3;

const Tile = Object.freeze({
  GRASS:0,
  ROCK:1,
  WATER:2,
  LAB:3,
  PATH:4,
  GARDEN:5,
  FOREST:6,
  MARSH:7,
  RIDGE:8,
  OBSERVATORY:9,
  WALL:10,
  FENCE:11,
  CLIFF:12,
  BRIDGE:13,
  ARCHIVE:14,
  TREE:15
});

const SOLID_TILE_TYPES = new Set([
  Tile.ROCK,
  Tile.WATER,
  Tile.WALL,
  Tile.FENCE,
  Tile.CLIFF,
  Tile.TREE
]);

const ALL_MISSIONS = [...MAIN_MISSIONS, ...SIDE_MISSIONS];
const MISSION_BY_ID = Object.fromEntries(ALL_MISSIONS.map(mission => [mission.id, mission]));
const ITEM_BY_ID = Object.fromEntries(ITEMS.map(item => [item.id, item]));
const ELEMENT_BY_SYMBOL = Object.fromEntries(ELEMENTS.map(element => [element.symbol, element]));
const NPC_BY_ID = Object.fromEntries(NPCS.map(npc => [npc.id, npc]));
const SHRINE_IDS = ['trend','ions','iso','zeff','period2','mix'];

const PUZZLE_DEFAULTS = Object.freeze({
  lab_repair:['fuse','wire','switch'],
  charge_balance:[-1,0,1],
  radius_order:['Cl','Na','Ar','Mg'],
  shell_distribution:[0,0,0],
  isoelectronic_gate:[],
  campus_core:{charges:[1,-1,1],shells:[0,0,0],gas:''}
});

const REQUIRED_OBJECT_IDS = [
  'prof_dalton','lab_terminal','power_relay','sample_H','sample_C','sample_O',
  'shrine_trend','garden_gate_panel','charge_console','forest_notes',
  'beacon_inner','beacon_middle','beacon_outer','bridge_console',
  'marsh_east_marker','iso_console','ridge_station_1','ridge_station_2',
  'ridge_station_3','shrine_mix','observatory_gate','dra_nobre','campus_core'
];

/* ---------- Utilitários ---------- */

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, amount) => a + (b - a) * amount;
const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const tileKey = (tx, ty) => `${tx},${ty}`;

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, character => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[character]));
}

function deepClone(value){
  return JSON.parse(JSON.stringify(value));
}

function hash2(x, y, salt=0){
  let value = Math.imul(x + 37 + salt, 374761393) ^ Math.imul(y + 91, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return (value ^ (value >>> 16)) >>> 0;
}

function intersects(a, b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function pointInRegion(px, py, region){
  const tx = Math.floor(px / TILE);
  const ty = Math.floor(py / TILE);
  return tx >= region.x && tx < region.x + region.w && ty >= region.y && ty < region.y + region.h;
}

function symbolOf(z){
  return ELEMENTS[z - 1]?.symbol || `Z${z}`;
}

function electronsToShells(electronCount){
  let remaining = clamp(Math.round(electronCount), 0, 18);
  const first = Math.min(2, remaining);
  remaining -= first;
  const second = Math.min(8, remaining);
  remaining -= second;
  const third = Math.min(8, remaining);
  return [first, second, third];
}

function ionRadiusApprox(z, charge){
  const base = NEUTRAL_PM[z] || 100;
  if(charge === 0) return base;
  const electrons = clamp(z - charge,0,18);
  if(electrons === 0) return 20;
  const occupiedShells = electronsToShells(electrons).filter(value => value > 0).length;
  let ionicRadius;
  if(occupiedShells === 1) ionicRadius = 70 - 20*z - 5*charge;
  else if(occupiedShells === 2) ionicRadius = 240 - 10*z - 6*charge;
  else ionicRadius = 320 - 8*z - 6*charge;
  return Math.round(clamp(ionicRadius,15,260));
}

function formatCharge(charge){
  if(charge === 0) return '0';
  return charge > 0 ? `+${charge}` : String(charge);
}

function currentRank(researchPoints=state?.researchPoints || 0){
  let rank = RANKS[0];
  for(const candidate of RANKS){
    if(researchPoints >= candidate.min) rank = candidate;
  }
  return rank;
}

function clearMovement(){
  for(const key of Object.keys(keys)) keys[key] = false;
  if(player){
    player.vx = 0;
    player.vy = 0;
  }
}

function copyKnownShape(defaultValue, inputValue){
  if(Array.isArray(defaultValue)){
    return Array.isArray(inputValue) ? inputValue.slice() : defaultValue.slice();
  }
  if(defaultValue && typeof defaultValue === 'object'){
    const output = {};
    const input = inputValue && typeof inputValue === 'object' && !Array.isArray(inputValue)
      ? inputValue
      : {};
    for(const key of Object.keys(defaultValue)){
      output[key] = copyKnownShape(defaultValue[key], input[key]);
    }
    return output;
  }
  return typeof inputValue === typeof defaultValue ? inputValue : defaultValue;
}

/* ---------- Áudio ---------- */

const audio = {
  ctx:null,
  enabled:true,
  ensure(){
    if(!this.ctx){
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if(!AudioContextClass) return;
      this.ctx = new AudioContextClass();
    }
    if(this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },
  beep(frequency=440, duration=0.08, type='square'){
    if(!this.enabled) return;
    this.ensure();
    if(!this.ctx) return;
    const start = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.055;
    oscillator.connect(gain).connect(this.ctx.destination);
    oscillator.start();
    gain.gain.setValueAtTime(0.055, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.stop(start + duration);
  },
  ok(){
    this.beep(880, 0.06, 'square');
    window.setTimeout(() => this.beep(1320, 0.06, 'square'), 65);
  },
  no(){
    this.beep(220, 0.12, 'sawtooth');
  },
  tick(){
    this.beep(520, 0.035, 'square');
  }
};

/* ---------- Estado e save versionado ---------- */

function defaultMissionStates(){
  const missionStates = {};
  for(const mission of ALL_MISSIONS){
    missionStates[mission.id] = {
      status:mission.id === 'main_01' ? 'active' : 'locked',
      stage:0
    };
  }
  return missionStates;
}

function createDefaultState(){
  return {
    version:SAVE_VERSION,
    player:{x:SPAWN.x,y:SPAWN.y,dir:'down'},
    shrines:Object.fromEntries(SHRINE_IDS.map(id => [id,false])),
    missions:defaultMissionStates(),
    trackedMission:'main_01',
    inventory:{},
    samples:[],
    collectedObjects:[],
    readLogs:[],
    periodicFragments:[],
    emblems:[],
    stableCorePieces:[],
    scanned:[],
    beacons:[],
    stations:[],
    repairedSigns:[],
    discoveredRegions:['central'],
    discoveredTerminals:[],
    puzzles:{},
    puzzleRewards:[],
    flags:{},
    tutorials:{movement:false,scanner:false,inventory:false,map:false,missions:false},
    cratePositions:{
      charge_crate_a:{tx:47,ty:26},
      charge_crate_b:{tx:49,ty:28}
    },
    researchPoints:0,
    rewardClaims:[],
    settings:{sound:true,reducedMotion:false},
    saveMeta:{createdAt:Date.now(),updatedAt:Date.now()}
  };
}

function sanitizeState(candidate){
  const clean = copyKnownShape(createDefaultState(), candidate);
  clean.version = SAVE_VERSION;
  const safeCandidate = candidate && typeof candidate === 'object' ? candidate : {};
  clean.flags = {};
  if(safeCandidate.flags && typeof safeCandidate.flags === 'object' && !Array.isArray(safeCandidate.flags)){
    for(const [key,value] of Object.entries(safeCandidate.flags)){
      if(typeof value === 'boolean' || typeof value === 'string' || typeof value === 'number'){
        clean.flags[key] = value;
      }else if(Array.isArray(value)){
        clean.flags[key] = value.filter(entry => ['boolean','string','number'].includes(typeof entry)).slice(0,100);
      }
    }
  }
  clean.puzzles = {};
  if(safeCandidate.puzzles && typeof safeCandidate.puzzles === 'object' && !Array.isArray(safeCandidate.puzzles)){
    for(const [key,value] of Object.entries(safeCandidate.puzzles)){
      if(typeof value === 'boolean') clean.puzzles[key] = value;
    }
  }
  clean.inventory = safeCandidate.inventory && typeof safeCandidate.inventory === 'object' && !Array.isArray(safeCandidate.inventory)
    ? {...safeCandidate.inventory}
    : {};

  for(const id of SHRINE_IDS) clean.shrines[id] = Boolean(clean.shrines[id]);
  clean.samples = [...new Set(clean.samples.filter(symbol => ELEMENT_BY_SYMBOL[symbol]))];
  clean.collectedObjects = [...new Set(clean.collectedObjects.filter(value => typeof value === 'string'))];
  clean.readLogs = [...new Set(clean.readLogs.filter(value => typeof value === 'string'))];
  clean.periodicFragments = [...new Set(clean.periodicFragments.filter(value => typeof value === 'string'))];
  clean.emblems = [...new Set(clean.emblems.filter(value => typeof value === 'string'))];
  clean.stableCorePieces = [...new Set(clean.stableCorePieces.filter(value => typeof value === 'string'))];
  clean.scanned = [...new Set(clean.scanned.filter(value => typeof value === 'string'))];
  clean.beacons = [...new Set(clean.beacons.filter(value => typeof value === 'string'))];
  clean.stations = [...new Set(clean.stations.filter(value => typeof value === 'string'))];
  clean.repairedSigns = [...new Set(clean.repairedSigns.filter(value => typeof value === 'string'))];
  clean.discoveredRegions = [...new Set(clean.discoveredRegions.filter(id => REGIONS.some(region => region.id === id)))];
  if(!clean.discoveredRegions.includes('central')) clean.discoveredRegions.unshift('central');

  clean.researchPoints = clamp(Number(clean.researchPoints) || 0, 0, 999999);
  clean.player.x = Number.isFinite(Number(clean.player.x)) ? Number(clean.player.x) : SPAWN.x;
  clean.player.y = Number.isFinite(Number(clean.player.y)) ? Number(clean.player.y) : SPAWN.y;
  clean.player.dir = ['up','down','left','right'].includes(clean.player.dir) ? clean.player.dir : 'down';

  const sanitizedInventory = {};
  for(const item of ITEMS){
    const count = Math.floor(Number(clean.inventory[item.id]) || 0);
    if(count > 0) sanitizedInventory[item.id] = clamp(count, 0, 999);
  }
  clean.inventory = sanitizedInventory;

  const validStatuses = new Set(['locked','available','active','completed']);
  for(const mission of ALL_MISSIONS){
    const missionState = clean.missions[mission.id] || {status:'locked',stage:0};
    missionState.status = validStatuses.has(missionState.status) ? missionState.status : 'locked';
    missionState.stage = clamp(Math.floor(Number(missionState.stage) || 0), 0, mission.stages.length - 1);
    clean.missions[mission.id] = missionState;
  }
  if(!MISSION_BY_ID[clean.trackedMission]) clean.trackedMission = findActiveMainId(clean) || 'main_01';
  clean.settings.sound = Boolean(clean.settings.sound);
  clean.settings.reducedMotion = Boolean(clean.settings.reducedMotion);
  return clean;
}

function migrateLegacySave(legacy){
  const migrated = createDefaultState();
  const legacyShrines = Array.isArray(legacy?.shrines) ? legacy.shrines : [];
  SHRINE_IDS.forEach((id, index) => {
    migrated.shrines[id] = Boolean(legacyShrines[index]);
  });
  migrated.flags.migratedFromV2 = true;
  return sanitizeState(migrated);
}

function parseSaveString(raw){
  if(typeof raw !== 'string' || !raw) return {state:createDefaultState(),valid:false};
  try{
    return {state:sanitizeState(JSON.parse(raw)),valid:true};
  }catch(error){
    return {state:createDefaultState(),valid:false,error};
  }
}

function hasStoredSave(){
  try{
    return Boolean(localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY));
  }catch(error){
    return false;
  }
}

function loadState(){
  try{
    const currentRaw = localStorage.getItem(SAVE_KEY);
    if(currentRaw){
      const parsed = parseSaveString(currentRaw);
      if(parsed.valid) return parsed.state;
      const recovered = createDefaultState();
      recovered.flags.recoveredCorruptSave = true;
      return recovered;
    }
    const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY);
    if(legacyRaw){
      try{
        return migrateLegacySave(JSON.parse(legacyRaw));
      }catch(error){
        const recovered = createDefaultState();
        recovered.flags.recoveredCorruptSave = true;
        return recovered;
      }
    }
  }catch(error){
    const fallback = createDefaultState();
    fallback.flags.storageUnavailable = true;
    return fallback;
  }
  return createDefaultState();
}

let state = loadState();
let saveTimer = 0;

function saveProgress(immediate=false){
  state.version = SAVE_VERSION;
  state.player = {
    x:player ? Math.round(player.x * 10) / 10 : state.player.x,
    y:player ? Math.round(player.y * 10) / 10 : state.player.y,
    dir:player ? player.dir : state.player.dir
  };
  state.saveMeta.updatedAt = Date.now();
  if(!immediate && saveTimer) return;

  const write = () => {
    saveTimer = 0;
    try{
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    }catch(error){
      state.flags.storageUnavailable = true;
    }
  };

  if(immediate) write();
  else saveTimer = window.setTimeout(write, 160);
}

function resetStatePreservingSettings(){
  const settings = {...state.settings};
  state = createDefaultState();
  state.settings = settings;
  saveProgress(true);
}

/* ---------- Inventário e recompensas ---------- */

function inventoryCount(itemId, source=state){
  return Math.max(0, Number(source.inventory[itemId]) || 0);
}

function addItem(itemId, quantity=1, source=state, notify=true){
  const item = ITEM_BY_ID[itemId];
  if(!item || quantity <= 0) return false;
  source.inventory[itemId] = inventoryCount(itemId, source) + Math.floor(quantity);
  if(source === state && notify){
    toast(`Item obtido: ${item.name}${quantity > 1 ? ` ×${quantity}` : ''}`, 'good');
    if(item.key) state.flags.lastKeyItem = itemId;
    showControlUnlock(itemId);
  }
  return true;
}

function removeItem(itemId, quantity=1, source=state){
  const item = ITEM_BY_ID[itemId];
  if(!item || item.key || inventoryCount(itemId, source) < quantity) return false;
  source.inventory[itemId] -= quantity;
  if(source.inventory[itemId] <= 0) delete source.inventory[itemId];
  return true;
}

function hasItem(itemId, quantity=1){
  return inventoryCount(itemId) >= quantity;
}

function awardResearchPoints(amount, reason='Pesquisa concluída'){
  const before = currentRank();
  state.researchPoints += Math.max(0, Math.floor(amount));
  const after = currentRank();
  toast(`+${amount} PR · ${reason}`, 'good');
  if(after.id !== before.id){
    audio.ok();
    toast(`Nova patente: ${after.name}`, 'good');
  }
  updateHUD();
}

function awardOnce(claimId, amount, reason){
  if(state.rewardClaims.includes(claimId)) return false;
  state.rewardClaims.push(claimId);
  awardResearchPoints(amount, reason);
  return true;
}

function grantRewards(mission){
  if(state.rewardClaims.includes(`mission:${mission.id}`)) return;
  state.rewardClaims.push(`mission:${mission.id}`);
  const rewards = mission.rewards || {};
  if(rewards.items){
    for(const [itemId, quantity] of Object.entries(rewards.items)) addItem(itemId, quantity);
  }
  if(rewards.rp) awardResearchPoints(rewards.rp, mission.title);
}

/* ---------- Missões ---------- */

function findActiveMainId(source=state){
  const mission = MAIN_MISSIONS.find(candidate => source.missions[candidate.id]?.status === 'active');
  return mission?.id || '';
}

function missionState(missionId){
  return state.missions[missionId];
}

function missionCompleted(missionId){
  return state.missions[missionId]?.status === 'completed';
}

function isSideMissionAvailable(mission){
  return (mission.prereq || []).every(missionCompleted);
}

function updateMissionAvailability(){
  for(const mission of SIDE_MISSIONS){
    const status = missionState(mission.id).status;
    if(status === 'locked' && isSideMissionAvailable(mission)){
      missionState(mission.id).status = 'available';
    }
  }
}

function requirementMet(requirement){
  if(!requirement) return false;
  switch(requirement.type){
    case 'flag':
      return Boolean(state.flags[requirement.id]);
    case 'item':
      return hasItem(requirement.id, requirement.count || 1);
    case 'items':
      return Object.entries(requirement.items).every(([id, count]) => hasItem(id, count));
    case 'samples':
      return requirement.ids.every(symbol => state.samples.includes(symbol));
    case 'sample_count':
      return state.samples.length >= requirement.count;
    case 'puzzle':
      return Boolean(state.puzzles[requirement.id]);
    case 'shrine':
      return Boolean(state.shrines[requirement.id]);
    case 'all_shrines':
      return SHRINE_IDS.every(id => state.shrines[id]);
    case 'set':
      return requirement.ids.every(id => Array.isArray(state[requirement.set]) && state[requirement.set].includes(id));
    case 'region':
      return state.discoveredRegions.includes(requirement.id);
    case 'fragment_count':
      return state.periodicFragments.length >= requirement.count;
    case 'turnin':
      return false;
    default:
      return false;
  }
}

function refreshMissionProgress(){
  let changed = false;
  let safety = 0;

  do{
    changed = false;
    safety += 1;
    for(const mission of ALL_MISSIONS){
      const progress = missionState(mission.id);
      if(progress.status !== 'active') continue;
      const stage = mission.stages[progress.stage];
      if(stage.req.type === 'turnin' || !requirementMet(stage.req)) continue;

      if(progress.stage < mission.stages.length - 1){
        progress.stage += 1;
        changed = true;
        toast(`Objetivo atualizado: ${mission.title}`);
      }else{
        completeMission(mission.id, false);
        changed = true;
      }
    }
  }while(changed && safety < 30);

  updateMissionAvailability();
  updateHUD();
  saveProgress();
}

function activateNextMain(completedMission){
  const next = MAIN_MISSIONS.find(mission => mission.order === completedMission.order + 1);
  if(!next) return;
  const progress = missionState(next.id);
  if(progress.status === 'locked'){
    progress.status = 'active';
    progress.stage = 0;
    state.trackedMission = next.id;
    toast(`Nova missão principal: ${next.title}`);
  }
}

function completeMission(missionId, showDialogue=true){
  const mission = MISSION_BY_ID[missionId];
  const progress = missionState(missionId);
  if(!mission || !progress || progress.status === 'completed') return false;
  progress.status = 'completed';
  progress.stage = mission.stages.length - 1;
  grantRewards(mission);
  if(mission.type === 'main') activateNextMain(mission);
  updateMissionAvailability();
  updateHUD();
  saveProgress(true);
  audio.ok();

  if(showDialogue){
    openPagedDialogue(
      mission.type === 'main' ? 'Missão principal concluída' : 'Missão paralela concluída',
      [`${mission.title}\n\n${mission.description}`, `Recompensa registrada. Seus dados já foram salvos no Caderno de Pesquisa.`],
      [{label:'Continuar',className:'good',callback:hidePanel}]
    );
  }else{
    toast(`Missão concluída: ${mission.title}`, 'good');
  }

  if(missionId === 'main_16'){
    window.setTimeout(showCertificate, showDialogue ? 0 : 350);
  }
  return true;
}

function acceptMission(missionId){
  const mission = MISSION_BY_ID[missionId];
  const progress = missionState(missionId);
  if(!mission || mission.type !== 'side' || progress.status !== 'available') return false;
  progress.status = 'active';
  progress.stage = 0;
  if(mission.acceptItems){
    for(const [itemId, quantity] of Object.entries(mission.acceptItems)) addItem(itemId, quantity);
  }
  state.trackedMission = mission.id;
  saveProgress(true);
  updateHUD();
  openPagedDialogue(
    mission.title,
    [mission.description, `Objetivo atual:\n${mission.stages[0].text}`],
    [{label:'Missão aceita',className:'good',callback:hidePanel}]
  );
  return true;
}

function turnInMission(missionId, npcId){
  const mission = MISSION_BY_ID[missionId];
  const progress = missionState(missionId);
  const stage = mission?.stages[progress?.stage];
  if(!mission || progress.status !== 'active' || stage?.req.type !== 'turnin' || stage.req.npc !== npcId) return false;
  return completeMission(missionId, true);
}

function setFlag(flagId, value=true){
  state.flags[flagId] = value;
  refreshMissionProgress();
}

function addToStateSet(setName, value){
  if(!Array.isArray(state[setName])) state[setName] = [];
  if(state[setName].includes(value)) return false;
  state[setName].push(value);
  refreshMissionProgress();
  return true;
}

/* ---------- Mundo autoral determinístico ---------- */

const tiles = new Uint8Array(WORLD_W * WORLD_H);
const solidTiles = new Uint8Array(WORLD_W * WORLD_H);
const worldObjects = [];
const worldObjectById = {};
const bridgeTiles = new Set();
const protectedZones = [
  {id:'spawn',x:15,y:9,w:8,h:8},
  {id:'lab',x:7,y:5,w:32,h:21},
  {id:'garden',x:40,y:5,w:35,h:32},
  {id:'forest',x:74,y:4,w:40,h:36},
  {id:'marsh',x:34,y:39,w:46,h:35},
  {id:'ridge',x:79,y:39,w:48,h:39},
  {id:'observatory',x:127,y:10,w:29,h:42}
];

function tileIndex(tx, ty){
  return ty * WORLD_W + tx;
}

function inWorld(tx, ty){
  return tx >= 0 && ty >= 0 && tx < WORLD_W && ty < WORLD_H;
}

function setTile(tx, ty, tileType, solid=SOLID_TILE_TYPES.has(tileType)){
  if(!inWorld(tx, ty)) return;
  const index = tileIndex(tx, ty);
  tiles[index] = tileType;
  solidTiles[index] = solid ? 1 : 0;
}

function getTile(tx, ty){
  return inWorld(tx, ty) ? tiles[tileIndex(tx, ty)] : Tile.ROCK;
}

function paintRect(tx, ty, width, height, tileType, solid=SOLID_TILE_TYPES.has(tileType)){
  for(let y=ty; y<ty + height; y++){
    for(let x=tx; x<tx + width; x++) setTile(x, y, tileType, solid);
  }
}

function outlineRect(tx, ty, width, height, tileType){
  for(let x=tx; x<tx + width; x++){
    setTile(x, ty, tileType, true);
    setTile(x, ty + height - 1, tileType, true);
  }
  for(let y=ty; y<ty + height; y++){
    setTile(tx, y, tileType, true);
    setTile(tx + width - 1, y, tileType, true);
  }
}

function paintPath(points, thickness=2){
  for(let index=0; index<points.length - 1; index++){
    const start = points[index];
    const end = points[index + 1];
    let x = start[0];
    let y = start[1];
    const dx = Math.sign(end[0] - start[0]);
    const dy = Math.sign(end[1] - start[1]);
    while(x !== end[0] || y !== end[1]){
      paintRect(x, y, thickness, thickness, Tile.PATH, false);
      if(x !== end[0]) x += dx;
      else if(y !== end[1]) y += dy;
    }
    paintRect(end[0], end[1], thickness, thickness, Tile.PATH, false);
  }
}

function addObject(id, type, tx, ty, options={}){
  if(worldObjectById[id]) throw new Error(`Objeto duplicado: ${id}`);
  const object = {
    id,
    type,
    tx,
    ty,
    x:tx * TILE,
    y:ty * TILE,
    w:options.w || TILE,
    h:options.h || TILE,
    solid:Boolean(options.solid),
    interactive:options.interactive !== false,
    scannable:Boolean(options.scannable),
    label:options.label || '',
    data:options.data || {},
    layer:options.layer || 1
  };
  worldObjects.push(object);
  worldObjectById[id] = object;
  return object;
}

function addProp(id, type, tx, ty, options={}){
  return addObject(id, type, tx, ty, {...options,interactive:false});
}

function generateWorld(){
  tiles.fill(Tile.GRASS);
  solidTiles.fill(0);
  worldObjects.length = 0;
  for(const key of Object.keys(worldObjectById)) delete worldObjectById[key];
  bridgeTiles.clear();

  for(let x=0; x<WORLD_W; x++){
    setTile(x, 0, Tile.ROCK, true);
    setTile(x, WORLD_H - 1, Tile.ROCK, true);
  }
  for(let y=0; y<WORLD_H; y++){
    setTile(0, y, Tile.ROCK, true);
    setTile(WORLD_W - 1, y, Tile.ROCK, true);
  }

  /* Eixos de navegação entre regiões. */
  paintPath([[20,24],[20,31],[39,31],[39,20],[41,20]], 2);
  paintPath([[20,24],[20,40],[22,44]], 2);
  paintPath([[53,37],[82,37],[82,20],[75,20]], 2);
  paintPath([[82,37],[82,40]], 2);
  paintPath([[124,56],[127,56],[127,32],[128,32]], 2);

  /* Laboratório Central. */
  paintRect(8,6,30,19,Tile.LAB,false);
  outlineRect(8,6,30,19,Tile.WALL);
  for(const tx of [19,20,21]) setTile(tx,24,Tile.LAB,false);
  for(const ty of [19,20]) setTile(37,ty,Tile.LAB,false);
  paintRect(37,19,5,2,Tile.PATH,false);
  outlineRect(27,7,10,9,Tile.WALL);
  setTile(27,12,Tile.LAB,false);
  paintRect(28,8,8,7,Tile.LAB,false);
  paintRect(10,22,25,1,Tile.PATH,false);

  /* Jardim Iônico. */
  paintRect(42,7,31,28,Tile.GARDEN,false);
  outlineRect(41,6,33,30,Tile.FENCE);
  for(const ty of [19,20]) setTile(41,ty,Tile.PATH,false);
  for(const ty of [19,20]) setTile(73,ty,Tile.PATH,false);
  paintRect(42,19,31,2,Tile.PATH,false);
  paintRect(56,8,2,26,Tile.PATH,false);
  paintRect(46,24,21,2,Tile.PATH,false);

  /* Floresta da Blindagem. */
  paintRect(76,6,36,32,Tile.FOREST,false);
  outlineRect(75,5,38,34,Tile.TREE);
  for(const ty of [19,20]) setTile(75,ty,Tile.PATH,false);
  for(const tx of [81,82]) setTile(tx,38,Tile.PATH,false);
  paintPath([[76,20],[91,20],[91,12],[84,12]],2);
  paintPath([[91,20],[104,20],[104,31]],2);
  paintPath([[91,20],[91,31],[82,37]],2);
  for(let layer=0; layer<3; layer++){
    const left = 83 + layer * 3;
    const top = 10 + layer * 3;
    const right = 107 - layer * 3;
    const bottom = 34 - layer * 3;
    for(let x=left; x<=right; x+=4){
      if(getTile(x,top) === Tile.FOREST) setTile(x,top,Tile.TREE,true);
      if(getTile(x,bottom) === Tile.FOREST) setTile(x,bottom,Tile.TREE,true);
    }
    for(let y=top; y<=bottom; y+=4){
      if(getTile(left,y) === Tile.FOREST) setTile(left,y,Tile.TREE,true);
      if(getTile(right,y) === Tile.FOREST) setTile(right,y,Tile.TREE,true);
    }
  }
  paintPath([[84,12],[91,12],[91,20],[104,20],[104,31]],2);

  /* Pântano Isoeletrônico e ilhas. */
  paintRect(35,40,44,33,Tile.WATER,true);
  paintRect(40,48,13,17,Tile.MARSH,false);
  paintRect(43,46,7,4,Tile.MARSH,false);
  paintRect(57,49,10,15,Tile.MARSH,false);
  paintRect(69,47,9,20,Tile.MARSH,false);
  paintRect(51,55,8,3,Tile.BRIDGE,false);
  paintRect(65,55,6,3,Tile.BRIDGE,false);
  paintRect(42,63,12,2,Tile.MARSH,false);
  for(let y=40; y<=54; y++){
    for(const x of [53,54]) bridgeTiles.add(tileKey(x,y));
  }
  paintRect(53,38,2,2,Tile.PATH,false);
  setTile(79,56,Tile.PATH,false);

  /* Arquivo Sul. */
  paintRect(9,43,25,24,Tile.ARCHIVE,false);
  outlineRect(9,43,25,24,Tile.ROCK);
  for(const tx of [20,21]) setTile(tx,43,Tile.PATH,false);
  paintRect(19,44,3,22,Tile.PATH,false);
  paintRect(11,54,21,4,Tile.PATH,false);

  /* Crista Periódica. */
  paintRect(80,40,46,37,Tile.RIDGE,false);
  outlineRect(80,40,46,37,Tile.CLIFF);
  setTile(80,40,Tile.RIDGE,false);
  for(const ty of [55,56,57]) setTile(80,ty,Tile.RIDGE,false);
  for(const ty of [55,56,57]) setTile(125,ty,Tile.PATH,false);
  for(let x=82; x<124; x++) if(![89,90,101,102].includes(x)) setTile(x,51,Tile.CLIFF,true);
  for(let x=82; x<124; x++) if(![98,99,114,115].includes(x)) setTile(x,63,Tile.CLIFF,true);
  paintPath([[81,56],[89,56],[89,49]],2);
  paintPath([[90,49],[101,49],[101,57],[99,57]],2);
  paintPath([[99,57],[114,57],[114,68]],2);
  paintPath([[114,68],[124,68],[124,56]],2);

  /* Observatório dos Gases Nobres. */
  paintRect(129,12,26,39,Tile.OBSERVATORY,false);
  outlineRect(128,11,28,41,Tile.WALL);
  for(const ty of [31,32,33]) setTile(128,ty,Tile.PATH,false);
  paintRect(129,31,26,3,Tile.PATH,false);
  paintRect(141,14,3,34,Tile.PATH,false);
  outlineRect(139,27,12,12,Tile.WALL);
  for(const tx of [144,145]) setTile(tx,38,Tile.OBSERVATORY,false);

  addLaboratoryObjects();
  addGardenObjects();
  addForestObjects();
  addMarshObjects();
  addRidgeObjects();
  addObservatoryObjects();
  addArchiveAndWorldObjects();
  addShrines();
  addElementSamples();

  worldObjects.sort((a,b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
}

function addLaboratoryObjects(){
  addObject('mission_board','mission_board',11,9,{solid:true,label:'Ler missões'});
  addObject('lab_terminal','lab_terminal',18,10,{solid:true,label:'Usar terminal',scannable:true});
  addObject('supply_cabinet','cabinet',33,10,{solid:true,label:'Abrir armário'});
  addObject('power_relay','relay',34,20,{solid:true,label:'Examinar relé',scannable:true});
  addObject('research_door','gate',27,12,{w:8,h:16,solid:true,label:'Abrir sala',data:{gate:'research_room'}});
  addObject('station_shell','station_shell',30,9,{solid:true,label:'Usar visualizador'});
  addObject('station_compare','station_compare',33,9,{solid:true,label:'Comparar raios'});
  addObject('station_ion','station_ion',30,13,{solid:true,label:'Converter íon'});
  addObject('station_iso','station_iso',33,13,{solid:true,label:'Montar série'});
  addObject('station_trend','station_trend',29,20,{solid:true,label:'Explorar tendências'});
  addObject('station_analyzer','station_analyzer',32,20,{solid:true,label:'Analisar amostras'});
  addObject('side_note_1','note',13,27,{label:'Coletar página'});
  addObject('side_note_2','note',28,27,{label:'Coletar página'});
  addObject('side_note_3','note',25,34,{label:'Coletar página'});
  addObject('broken_sign_1','broken_sign',36,30,{solid:true,label:'Restaurar placa'});
  addObject('campus_sign_central','sign',18,27,{solid:true,label:'Ler placa',data:{text:'LAB CENTRAL ↑  ·  ARQUIVO SUL ↓  ·  JARDIM IÔNICO →'}});

  addProp('lab_shelf_a','shelf',10,13,{solid:true});
  addProp('lab_shelf_b','shelf',10,16,{solid:true});
  addProp('lab_table_a','research_table',20,10,{w:32,solid:true});
  addProp('lab_table_b','research_table',20,17,{w:48,solid:true});
  addProp('lab_glass_a','glassware',21,16);
  addProp('lab_glass_b','glassware',23,16);
  addProp('lab_storage_a','storage',12,20,{solid:true});
  addProp('lab_storage_b','storage',14,20,{solid:true});
  addProp('lab_warning','warning',36,17);
  addProp('lab_cable_a','cable',17,18,{w:32});
  addProp('lab_monitor_a','monitor',24,9);
  addProp('lab_lamp_a','lamp',9,8);
  addProp('lab_lamp_b','lamp',36,8);
  addProp('lab_lamp_c','lamp',9,22);
}

function addGardenObjects(){
  addObject('garden_gate','gate',41,19,{w:16,h:32,solid:true,label:'Examinar portão',data:{gate:'garden'}});
  addObject('garden_gate_panel','gate_panel',39,20,{solid:true,label:'Usar painel'});
  addObject('forest_gate','gate',73,19,{w:16,h:32,solid:true,label:'Examinar passagem',data:{gate:'forest'}});
  addObject('charge_console','charge_console',60,26,{solid:true,label:'Equilibrar cargas'});
  addObject('charge_node_a','charge_node',52,16,{solid:true,label:'Alterar carga',scannable:true,data:{index:0}});
  addObject('charge_node_b','charge_node',59,16,{solid:true,label:'Alterar carga',scannable:true,data:{index:1}});
  addObject('charge_node_c','charge_node',66,16,{solid:true,label:'Alterar carga',scannable:true,data:{index:2}});
  addObject('crystal_pos_1','crystal_positive',47,11,{solid:true,label:'Examinar cristal',scannable:true,data:{charge:1}});
  addObject('crystal_neg_1','crystal_negative',51,31,{solid:true,label:'Examinar cristal',scannable:true,data:{charge:-1}});
  addObject('crystal_pos_2','crystal_positive',64,10,{solid:true,label:'Examinar cristal',scannable:true,data:{charge:2}});
  addObject('crystal_neg_2','crystal_negative',69,31,{solid:true,label:'Examinar cristal',scannable:true,data:{charge:-2}});
  addObject('charge_crate_a','crate',47,26,{solid:true,label:'Empurrar'});
  addObject('charge_crate_b','crate',49,28,{solid:true,label:'Empurrar'});
  addObject('charge_pad_a','pressure_pad',52,26,{interactive:false});
  addObject('charge_pad_b','pressure_pad',52,28,{interactive:false});
  addObject('crate_reset','reset_terminal',44,29,{solid:true,label:'Resetar blocos'});
  addObject('radius_organizer','radius_station',67,24,{solid:true,label:'Organizar raios'});
  addObject('broken_sign_2','broken_sign',43,33,{solid:true,label:'Restaurar placa'});
  addObject('garden_sign','sign',44,20,{solid:true,label:'Ler placa',data:{text:'JARDIM IÔNICO — cargas opostas se atraem; carga total é soma algébrica.'}});
  addProp('ionic_plant_a','ionic_plant',46,15);
  addProp('ionic_plant_b','ionic_plant',54,10);
  addProp('ionic_plant_c','ionic_plant',62,29);
  addProp('conductor_a','conductor',55,23,{solid:true});
  addProp('conductor_b','conductor',63,23,{solid:true});
  addProp('garden_bench','bench',45,23,{w:32,solid:true});
  addProp('garden_lamp_a','lamp',43,9);
  addProp('garden_lamp_b','lamp',71,33);
}

function addForestObjects(){
  addObject('forest_notes','research_notes',89,25,{label:'Coletar notas'});
  addObject('beacon_inner','beacon',92,19,{solid:true,label:'Ativar sinalizador',scannable:true,data:{order:0,layer:'interna'}});
  addObject('beacon_middle','beacon',85,12,{solid:true,label:'Ativar sinalizador',scannable:true,data:{order:1,layer:'média'}});
  addObject('beacon_outer','beacon',104,31,{solid:true,label:'Ativar sinalizador',scannable:true,data:{order:2,layer:'externa'}});
  addObject('scan_firefly_a','firefly_signal',80,10,{label:'Examinar sinal',scannable:true});
  addObject('scan_firefly_b','firefly_signal',108,17,{label:'Examinar sinal',scannable:true});
  addObject('scan_firefly_c','firefly_signal',99,35,{label:'Examinar sinal',scannable:true});
  addObject('forest_log_1','research_log',108,10,{label:'Ler registro',data:{title:'Registro 03',text:'As camadas internas blindam parcialmente os elétrons externos da atração nuclear.'}});
  addObject('forest_emblem','emblem',78,34,{label:'Coletar emblema'});
  addObject('periodic_fragment_2','periodic_fragment',110,34,{label:'Coletar fragmento'});
  addObject('broken_sign_3','broken_sign',79,22,{solid:true,label:'Restaurar placa'});
  addObject('forest_sign','sign',77,17,{solid:true,label:'Ler placa',data:{text:'FLORESTA DA BLINDAGEM — siga do sinal interno ao externo.'}});
  addProp('forest_camp','camp',81,28,{solid:true});
  addProp('forest_mushroom_a','mushroom',87,30);
  addProp('forest_mushroom_b','mushroom',106,13);
}

function addMarshObjects(){
  addObject('bridge_console','bridge_console',52,38,{solid:true,label:'Energizar ponte'});
  addObject('marsh_east_marker','marker',72,52,{interactive:false});
  addObject('iso_console','iso_console',76,56,{solid:true,label:'Resolver portão'});
  addObject('ridge_gate','gate',79,55,{w:16,h:48,solid:true,label:'Examinar portão',data:{gate:'ridge'}});
  addObject('marsh_log_1','research_log',48,62,{label:'Ler registro',data:{title:'Registro 07',text:'Espécies isoeletrônicas têm o mesmo número de elétrons, não necessariamente a mesma carga.'}});
  addObject('periodic_fragment_3','periodic_fragment',41,52,{label:'Coletar fragmento'});
  addObject('periodic_fragment_4','periodic_fragment',62,61,{label:'Coletar fragmento'});
  addObject('marsh_core_piece','stable_core_piece',75,65,{label:'Coletar peça'});
  addObject('marsh_sign','sign',42,46,{solid:true,label:'Ler placa',data:{text:'PÂNTANO ISOELETRÔNICO — conte elétrons: e⁻ = Z − carga.'}});
  addProp('marsh_reed_a','reeds',38,45);
  addProp('marsh_reed_b','reeds',55,66);
  addProp('marsh_reed_c','reeds',68,45);
}

function addRidgeObjects(){
  addObject('ridge_station_1','ridge_station',88,47,{solid:true,label:'Ativar estação',scannable:true,data:{index:1}});
  addObject('ridge_station_2','ridge_station',99,57,{solid:true,label:'Ativar estação',scannable:true,data:{index:2}});
  addObject('ridge_station_3','ridge_station',114,68,{solid:true,label:'Ativar estação',scannable:true,data:{index:3}});
  addObject('ridge_log_1','research_log',121,44,{label:'Ler registro',data:{title:'Registro 11',text:'Em um período, o aumento de Z efetiva tende a contrair o raio da esquerda para a direita.'}});
  addObject('periodic_fragment_5','periodic_fragment',84,70,{label:'Coletar fragmento'});
  addObject('periodic_fragment_6','periodic_fragment',121,72,{label:'Coletar fragmento'});
  addObject('ridge_emblem','emblem',103,42,{label:'Coletar emblema'});
  addObject('broken_sign_4','broken_sign',123,57,{solid:true,label:'Restaurar placa'});
  addObject('ridge_sign','sign',82,55,{solid:true,label:'Ler placa',data:{text:'CRISTA PERIÓDICA — o raio aumenta ↓ e ←.'}});
  addProp('ridge_mineral_a','mineral',85,44,{solid:true});
  addProp('ridge_mineral_b','mineral',107,59,{solid:true});
  addProp('ridge_mineral_c','mineral',118,66,{solid:true});
  addProp('ridge_stairs_a','stairs',89,51,{w:32});
  addProp('ridge_stairs_b','stairs',98,63,{w:32});
  addProp('ridge_stairs_c','stairs',114,63,{w:32});
}

function addObservatoryObjects(){
  addObject('observatory_gate','gate',128,31,{w:16,h:48,solid:true,label:'Abrir observatório',data:{gate:'observatory'}});
  addObject('campus_core','campus_core',145,31,{w:32,h:32,solid:true,label:'Estabilizar núcleo',scannable:true});
  addObject('aux_telescope','telescope',135,17,{w:32,h:32,solid:true,label:'Examinar telescópio'});
  addObject('lens_cabinet','cabinet',152,44,{solid:true,label:'Abrir armário',data:{lens:true}});
  addObject('discovery_map','discovery_map',132,43,{w:32,solid:true,label:'Ver descobertas'});
  addObject('observatory_log_1','research_log',151,15,{label:'Ler registro',data:{title:'Registro 18',text:'Camadas completas explicam a baixa reatividade típica dos gases nobres no modelo introdutório.'}});
  addObject('observatory_emblem','emblem',153,48,{label:'Coletar emblema'});
  addObject('observatory_core_piece','stable_core_piece',130,48,{label:'Coletar peça'});
  addProp('telescope_main','telescope',148,18,{w:32,h:32,solid:true});
  addProp('stable_core_a','stable_core',133,29,{solid:true});
  addProp('stable_core_b','stable_core',151,36,{solid:true});
  addProp('observatory_console_a','monitor',132,14,{solid:true});
  addProp('observatory_console_b','monitor',150,42,{solid:true});
  addProp('observatory_lamp_a','lamp',130,13);
  addProp('observatory_lamp_b','lamp',153,13);
}

function addArchiveAndWorldObjects(){
  addObject('maintenance_keycard_pickup','maintenance_keycard',28,62,{label:'Coletar cartão'});
  addObject('archive_log_1','research_log',13,48,{label:'Ler registro',data:{title:'Registro 01',text:'O Campus Periodicum foi projetado para ensinar tendências por exploração, não por memorização isolada.'}});
  addObject('archive_log_2','research_log',30,46,{label:'Ler registro',data:{title:'Registro 12',text:'Valores de raio dependem do método de medida; aqui usamos aproximações didáticas coerentes com o simulador.'}});
  addObject('periodic_fragment_1','periodic_fragment',12,63,{label:'Coletar fragmento'});
  addObject('archive_emblem','emblem',31,64,{label:'Coletar emblema'});
  addObject('archive_core_piece','stable_core_piece',12,45,{label:'Coletar peça'});
  addObject('archive_terminal','terminal',29,54,{solid:true,label:'Usar terminal'});
  addObject('archive_sign','sign',17,45,{solid:true,label:'Ler placa',data:{text:'ARQUIVO SUL — registros opcionais e treinamento de grupos/períodos.'}});
  addProp('archive_shelf_a','shelf',11,50,{solid:true});
  addProp('archive_shelf_b','shelf',31,50,{solid:true});
  addProp('archive_table','research_table',24,55,{w:32,solid:true});

  addObject('central_log','research_log',38,35,{label:'Ler registro',data:{title:'Registro 02',text:'O laboratório protege áreas autorais para que nenhum obstáculo bloqueie missões.'}});
  addObject('central_emblem','emblem',6,36,{label:'Coletar emblema'});
  addProp('central_bench','bench',27,31,{w:32,solid:true});
  addProp('central_lamp_a','lamp',15,31);
  addProp('central_lamp_b','lamp',31,31);
}

function addShrines(){
  const shrineData = [
    ['shrine_trend','trend',30,20,'Tendências do Raio'],
    ['shrine_ions','ions',70,12,'Cátions vs Ânions'],
    ['shrine_iso','iso',44,48,'Série Isoeletrônica'],
    ['shrine_zeff','zeff',80,40,'Blindagem & Z'],
    ['shrine_period2','period2',20,56,'Grupos e Períodos'],
    ['shrine_mix','mix',96,22,'Ordem Mista']
  ];
  for(const [objectId, shrineId, tx, ty, title] of shrineData){
    addObject(objectId,'shrine',tx,ty,{solid:true,label:'Ativar santuário',scannable:true,data:{shrineId,title}});
  }
}

function addElementSamples(){
  const placements = {
    H:[13,28], He:[141,19], Li:[48,17], Be:[86,54], B:[82,13], C:[25,19],
    N:[101,29], O:[34,28], F:[68,29], Ne:[147,27], Na:[56,11], Mg:[95,55],
    Al:[111,58], Si:[101,69], P:[105,17], S:[47,56], Cl:[73,63], Ar:[146,42]
  };
  for(const element of ELEMENTS){
    const [tx,ty] = placements[element.symbol];
    addObject(`sample_${element.symbol}`,'element_sample',tx,ty,{
      label:'Coletar amostra',
      scannable:true,
      data:{symbol:element.symbol}
    });
  }
}

generateWorld();

/* ---------- Entidades, colisão e movimento ---------- */

const keys = Object.create(null);

class Entity {
  constructor(x, y, width, height){
    this.x = x;
    this.y = y;
    this.w = width;
    this.h = height;
  }
  get cx(){ return this.x + this.w / 2; }
  get cy(){ return this.y + this.h / 2; }
}

class Player extends Entity {
  constructor(x, y){
    super(x, y, 12, 12);
    this.speed = 110;
    this.acceleration = 600;
    this.friction = 8;
    this.vx = 0;
    this.vy = 0;
    this.dir = state.player.dir || 'down';
    this.step = 0;
    this.anim = 0;
    this.blinkTimer = 0;
    this.regionCheckTimer = 0;
  }

  update(dt){
    if(!gameStarted || panelOpen()) return;
    let inputX = 0;
    let inputY = 0;
    if(keys.w || keys.arrowup){ inputY -= 1; this.dir = 'up'; }
    if(keys.s || keys.arrowdown){ inputY += 1; this.dir = 'down'; }
    if(keys.a || keys.arrowleft){ inputX -= 1; this.dir = 'left'; }
    if(keys.d || keys.arrowright){ inputX += 1; this.dir = 'right'; }

    const magnitude = inputX || inputY ? Math.hypot(inputX, inputY) : 1;
    inputX /= magnitude;
    inputY /= magnitude;
    this.vx += inputX * this.acceleration * dt;
    this.vy += inputY * this.acceleration * dt;
    this.vx -= this.vx * this.friction * dt;
    this.vy -= this.vy * this.friction * dt;

    const speed = Math.hypot(this.vx, this.vy);
    if(speed > this.speed){
      this.vx = this.vx / speed * this.speed;
      this.vy = this.vy / speed * this.speed;
    }

    this.moveAxis(this.vx * dt, 0);
    this.moveAxis(0, this.vy * dt);

    const moving = Math.hypot(this.vx, this.vy) > 5;
    if(moving){
      this.step += dt * (4 + 6 * clamp(speed / this.speed, 0, 1));
      this.anim = Math.floor(this.step) % 2;
      if(!state.settings.reducedMotion && hash2(Math.floor(timeSec * 30), Math.floor(this.x + this.y)) % 23 === 0){
        spawnDust(this);
      }
    }else{
      this.step = 0;
      this.anim = 0;
    }

    this.blinkTimer += dt;
    if(this.blinkTimer > 3.2 + (hash2(Math.floor(timeSec), 17) % 16) / 10) this.blinkTimer = 0;

    this.regionCheckTimer += dt;
    if(this.regionCheckTimer >= 0.18){
      this.regionCheckTimer = 0;
      discoverCurrentRegion();
      checkWorldProgressTriggers();
    }
  }

  moveAxis(dx, dy){
    if(dx){
      this.x += dx;
      if(collidesRect(this)) {
        this.x -= dx;
        this.vx = 0;
      }
    }
    if(dy){
      this.y += dy;
      if(collidesRect(this)){
        this.y -= dy;
        this.vy = 0;
      }
    }
    this.x = clamp(this.x, TILE, WORLD_W * TILE - TILE - this.w);
    this.y = clamp(this.y, TILE, WORLD_H * TILE - TILE - this.h);
  }
}

class NPCEntity extends Entity {
  constructor(definition){
    super(definition.tx * TILE + 2, definition.ty * TILE + 2, 12, 12);
    this.definition = definition;
    this.anchorX = this.x;
    this.anchorY = this.y;
    this.phase = (hash2(definition.tx, definition.ty) % 628) / 100;
    this.dir = 'down';
  }

  update(time){
    const patrol = this.definition.patrol;
    if(!patrol || state.settings.reducedMotion){
      this.x = this.anchorX;
      this.y = this.anchorY;
      return;
    }
    const offset = Math.sin(time * patrol.speed + this.phase) * patrol.range * TILE;
    if(patrol.axis === 'x'){
      this.x = this.anchorX + offset;
      this.y = this.anchorY;
      this.dir = Math.cos(time * patrol.speed + this.phase) >= 0 ? 'right' : 'left';
    }else{
      this.x = this.anchorX;
      this.y = this.anchorY + offset;
      this.dir = Math.cos(time * patrol.speed + this.phase) >= 0 ? 'down' : 'up';
    }
  }
}

class Particle {
  constructor(x, y, color){
    this.x = x;
    this.y = y;
    const seed = hash2(Math.floor(x * 10), Math.floor(y * 10), Math.floor(timeSec * 100));
    this.vx = ((seed % 200) / 200 - 0.5) * 14;
    this.vy = -((seed >>> 8) % 100) / 10;
    this.alpha = 1;
    this.age = 0;
    this.life = 0.45;
    this.color = color;
  }
  update(dt){
    this.age += dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 20 * dt;
    this.alpha = 1 - this.age / this.life;
  }
}

const player = new Player(state.player.x, state.player.y);
const npcEntities = NPCS.map(definition => new NPCEntity(definition));
const npcEntityById = Object.fromEntries(npcEntities.map(entity => [entity.definition.id, entity]));
const particles = [];

function spawnDust(entity){
  const tx = Math.floor(entity.cx / TILE);
  const ty = Math.floor(entity.cy / TILE);
  const tile = getTile(tx, ty);
  if([Tile.GRASS,Tile.LAB,Tile.PATH,Tile.GARDEN,Tile.FOREST,Tile.RIDGE,Tile.ARCHIVE].includes(tile)){
    const color = tile === Tile.LAB ? '#555c78' : tile === Tile.RIDGE ? '#666c81' : '#2d6743';
    if(particles.length < 70) particles.push(new Particle(entity.cx, entity.y + entity.h, color));
  }
}

function sampleTilesForRect(rect){
  const left = Math.floor(rect.x / TILE);
  const right = Math.floor((rect.x + rect.w - 1) / TILE);
  const top = Math.floor(rect.y / TILE);
  const bottom = Math.floor((rect.y + rect.h - 1) / TILE);
  const output = [];
  for(let ty=top; ty<=bottom; ty++){
    for(let tx=left; tx<=right; tx++) output.push({tx,ty});
  }
  return output;
}

function tileIsSolid(tx, ty, options={}){
  if(!inWorld(tx, ty)) return true;
  const tile = getTile(tx, ty);
  if(tile === Tile.WATER && bridgeTiles.has(tileKey(tx, ty))){
    return options.forceBridgeClosed ? true : !state.flags.bridge_open;
  }
  return Boolean(solidTiles[tileIndex(tx, ty)]);
}

function objectCollected(object){
  return state.collectedObjects.includes(object.id);
}

function objectIsVisible(object){
  if(object.type === 'element_sample'){
    return !state.samples.includes(object.data.symbol);
  }
  if([
    'note','research_notes','research_log','periodic_fragment','emblem',
    'stable_core_piece','maintenance_keycard'
  ].includes(object.type)){
    return !objectCollected(object);
  }
  return true;
}

function gateIsOpen(object){
  switch(object.data.gate){
    case 'research_room':
      return Boolean(state.flags.research_room_open || missionCompleted('main_04'));
    case 'garden':
      return Boolean(state.flags.garden_gate_open);
    case 'forest':
      return Boolean(state.puzzles.charge_balance);
    case 'ridge':
      return Boolean(state.puzzles.isoelectronic_gate);
    case 'observatory':
      return Boolean(state.flags.observatory_gate_open);
    default:
      return false;
  }
}

function objectIsSolid(object){
  if(!objectIsVisible(object)) return false;
  if(object.type === 'gate') return !gateIsOpen(object);
  return object.solid;
}

function objectRect(object){
  if(object.type === 'crate'){
    const stored = state.cratePositions[object.id];
    if(stored) return {x:stored.tx * TILE,y:stored.ty * TILE,w:object.w,h:object.h};
  }
  return object;
}

function collidesRect(rect, ignoreObjectId=''){
  for(const tile of sampleTilesForRect(rect)){
    if(tileIsSolid(tile.tx, tile.ty)) return true;
  }

  for(const object of worldObjects){
    if(object.id === ignoreObjectId || !objectIsSolid(object)) continue;
    if(intersects(rect, objectRect(object))) return true;
  }

  for(const npc of npcEntities){
    if(intersects(rect, npc)) return true;
  }
  return false;
}

function ensureSafePlayerPosition(){
  if(!Number.isFinite(player.x) || !Number.isFinite(player.y) || collidesRect(player)){
    player.x = SPAWN.x;
    player.y = SPAWN.y;
    player.vx = 0;
    player.vy = 0;
    state.player.x = SPAWN.x;
    state.player.y = SPAWN.y;
  }
}

/* ---------- Câmera ---------- */

const camera = {x:0,y:0,w:VW,h:VH};

function updateCamera(){
  const targetX = clamp(player.cx - camera.w / 2, 0, WORLD_W * TILE - camera.w);
  const targetY = clamp(player.cy - camera.h / 2, 0, WORLD_H * TILE - camera.h);
  camera.x = lerp(camera.x, targetX, state.settings.reducedMotion ? 1 : 0.16);
  camera.y = lerp(camera.y, targetY, state.settings.reducedMotion ? 1 : 0.16);
}

/* ---------- Sprites procedurais ---------- */

const spriteCanvas = document.createElement('canvas');
spriteCanvas.width = 16;
spriteCanvas.height = 16;
const spriteCtx = spriteCanvas.getContext('2d');
spriteCtx.imageSmoothingEnabled = false;

const PLAYER_COLORS = {
  skin:'#f6d6b8',
  hair:'#2b2b3a',
  coat:'#5fd3f3',
  pant:'#3a5b9b',
  shoe:'#1b1b28',
  outline:'#0c0c12'
};

function spriteRect(x, y, width, height, color){
  spriteCtx.fillStyle = color;
  spriteCtx.fillRect(x, y, width, height);
}

function drawPlayerSprite(screenX, screenY, direction, frame, blinking){
  spriteCtx.clearRect(0,0,16,16);
  spriteRect(5,2,6,6,PLAYER_COLORS.skin);
  spriteRect(4,2,8,1,PLAYER_COLORS.hair);
  if(!blinking){
    if(direction === 'left') spriteRect(6,4,1,1,'#111');
    else if(direction === 'right') spriteRect(9,4,1,1,'#111');
    else {
      spriteRect(7,4,1,1,'#111');
      if(direction === 'down') spriteRect(9,4,1,1,'#111');
    }
  }
  spriteRect(4,8,8,5,PLAYER_COLORS.coat);
  spriteRect(3,9,1,3,PLAYER_COLORS.coat);
  spriteRect(12,9,1,3,PLAYER_COLORS.coat);
  const alternate = frame % 2;
  spriteRect(5,13,2,2 + alternate,PLAYER_COLORS.pant);
  spriteRect(9,13 - alternate,2,2 + alternate,PLAYER_COLORS.pant);
  spriteRect(5,15,2,1,PLAYER_COLORS.shoe);
  spriteRect(9,15,2,1,PLAYER_COLORS.shoe);
  ctx.drawImage(spriteCanvas, Math.round(screenX), Math.round(screenY), 16,16);
}

function drawNPCSprite(npc, screenX, screenY){
  const definition = npc.definition;
  spriteCtx.clearRect(0,0,16,16);
  spriteRect(5,2,6,6,definition.skin);
  spriteRect(4,8,8,6,definition.coat);
  spriteRect(5,14,2,2,'#6f7182');
  spriteRect(9,14,2,2,'#6f7182');

  switch(definition.style){
    case 'professor':
      spriteRect(4,1,8,2,'#dce2ef');
      spriteRect(6,4,1,1,'#1b2030');
      spriteRect(9,4,1,1,'#1b2030');
      spriteRect(7,8,2,5,definition.accent);
      break;
    case 'assistant':
      spriteRect(4,1,8,3,'#392d2f');
      spriteRect(3,8,2,5,definition.accent);
      break;
    case 'technician':
      spriteRect(3,1,10,2,'#dca85d');
      spriteRect(11,8,2,5,definition.accent);
      spriteRect(4,10,2,2,'#473f36');
      break;
    case 'student':
      spriteRect(5,1,6,2,'#25283c');
      spriteRect(3,9,2,3,definition.accent);
      break;
    case 'researcher':
      spriteRect(3,1,10,2,'#55785f');
      spriteRect(11,3,2,2,'#55785f');
      spriteRect(6,9,4,1,definition.accent);
      break;
    case 'scientist':
      spriteRect(4,1,8,2,'#d3d6e8');
      spriteRect(4,4,2,1,'#4f5879');
      spriteRect(10,4,2,1,'#4f5879');
      spriteRect(7,8,2,5,definition.accent);
      break;
    case 'caretaker':
      spriteRect(4,1,8,3,'#6b4b3d');
      spriteRect(3,9,2,4,definition.accent);
      spriteRect(12,10,1,5,'#8d6c43');
      break;
  }

  ctx.drawImage(spriteCanvas, Math.round(screenX), Math.round(screenY), 16,16);
  ctx.fillStyle = 'rgba(0,0,0,.58)';
  const labelWidth = Math.max(28, definition.name.length * 5 + 4);
  ctx.fillRect(Math.round(screenX + 8 - labelWidth / 2), Math.round(screenY - 9), labelWidth, 8);
  ctx.fillStyle = '#e7eaf6';
  ctx.font = '6px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(definition.name, Math.round(screenX + 8), Math.round(screenY - 3));
  ctx.textAlign = 'left';
}

/* ---------- Renderização do mapa ---------- */

let timeSec = 0;
let dtGlobal = 0.016;
let currentInteractionTarget = null;
let currentScanTarget = null;

function drawTile(tx, ty, screenX, screenY){
  const tile = getTile(tx,ty);
  const hash = hash2(tx,ty);
  switch(tile){
    case Tile.GRASS:
      ctx.fillStyle = '#11251a';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#183f27';
      if((hash & 3) === 0) ctx.fillRect(screenX + 5,screenY + 7,1,2);
      if((hash & 15) === 1){
        ctx.fillStyle = '#ffd66b';
        ctx.fillRect(screenX + 10,screenY + 4,1,1);
      }
      if((hash & 31) === 9){
        ctx.fillStyle = '#5c6174';
        ctx.fillRect(screenX + 3,screenY + 11,2,1);
      }
      break;
    case Tile.ROCK:
      ctx.fillStyle = '#262a45';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#343b62';
      ctx.fillRect(screenX + 3,screenY + 9,3,2);
      ctx.fillRect(screenX + 10,screenY + 4,2,1);
      break;
    case Tile.WATER: {
      const wave = state.settings.reducedMotion ? 0 : Math.sin((tx + ty) * .7 + timeSec * 2.2);
      ctx.fillStyle = wave > 0 ? '#0c3c68' : '#0a2346';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = 'rgba(200,230,255,.18)';
      ctx.fillRect(screenX + (wave > 0 ? 3 : 1),screenY + 3,5,1);
      if((hash & 7) === 0) ctx.fillRect(screenX + 10,screenY + 11,3,1);
      break;
    }
    case Tile.LAB:
      ctx.fillStyle = '#2b2f49';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#353b61';
      ctx.fillRect(screenX + 7,screenY + 7,1,1);
      if((hash & 15) === 0){
        ctx.fillStyle = '#24283f';
        ctx.fillRect(screenX,screenY + 14,7,1);
      }
      break;
    case Tile.PATH:
      ctx.fillStyle = '#24322d';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#35453d';
      if((hash & 3) === 0) ctx.fillRect(screenX + 4,screenY + 5,2,1);
      if((hash & 7) === 1) ctx.fillRect(screenX + 11,screenY + 12,1,1);
      break;
    case Tile.GARDEN:
      ctx.fillStyle = '#123526';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#1b5439';
      if((hash & 3) === 0) ctx.fillRect(screenX + 8,screenY + 4,1,3);
      if((hash & 15) === 2){
        ctx.fillStyle = '#68dca4';
        ctx.fillRect(screenX + 4,screenY + 10,1,1);
      }
      break;
    case Tile.FOREST:
      ctx.fillStyle = '#0e251f';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#17372b';
      if((hash & 3) === 0) ctx.fillRect(screenX + 5,screenY + 6,2,2);
      if((hash & 31) === 4){
        ctx.fillStyle = '#728b65';
        ctx.fillRect(screenX + 11,screenY + 12,2,1);
      }
      break;
    case Tile.MARSH:
      ctx.fillStyle = '#193f42';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#2a5b50';
      if((hash & 3) === 0) ctx.fillRect(screenX + 4,screenY + 9,4,1);
      break;
    case Tile.RIDGE:
      ctx.fillStyle = '#34394f';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#474d68';
      if((hash & 3) === 0) ctx.fillRect(screenX + 3,screenY + 4,4,2);
      if((hash & 15) === 5){
        ctx.fillStyle = '#7c829c';
        ctx.fillRect(screenX + 11,screenY + 11,2,2);
      }
      break;
    case Tile.OBSERVATORY:
      ctx.fillStyle = '#30344e';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#434a70';
      ctx.fillRect(screenX,screenY + 15,TILE,1);
      ctx.fillRect(screenX + 15,screenY,1,TILE);
      if((hash & 15) === 0){
        ctx.fillStyle = '#6cf';
        ctx.fillRect(screenX + 7,screenY + 7,1,1);
      }
      break;
    case Tile.WALL:
      ctx.fillStyle = '#20243b';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#39405f';
      ctx.fillRect(screenX,screenY,TILE,3);
      ctx.fillRect(screenX + 2,screenY + 6,12,2);
      ctx.fillStyle = '#151827';
      ctx.fillRect(screenX,screenY + 14,TILE,2);
      break;
    case Tile.FENCE:
      ctx.fillStyle = '#11251a';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#506454';
      ctx.fillRect(screenX + 3,screenY + 1,3,15);
      ctx.fillRect(screenX + 10,screenY + 1,3,15);
      ctx.fillRect(screenX,screenY + 5,TILE,2);
      ctx.fillRect(screenX,screenY + 11,TILE,2);
      break;
    case Tile.CLIFF:
      ctx.fillStyle = '#22263a';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#555b76';
      ctx.fillRect(screenX,screenY,TILE,4);
      ctx.fillStyle = '#30354c';
      ctx.fillRect(screenX + 3,screenY + 6,3,8);
      ctx.fillRect(screenX + 10,screenY + 7,2,6);
      break;
    case Tile.BRIDGE:
      drawBridgeTile(screenX,screenY);
      break;
    case Tile.ARCHIVE:
      ctx.fillStyle = '#252d43';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#343e59';
      ctx.fillRect(screenX + 2,screenY + 2,5,1);
      ctx.fillRect(screenX + 9,screenY + 11,4,1);
      break;
    case Tile.TREE:
      ctx.fillStyle = '#0b1915';
      ctx.fillRect(screenX,screenY,TILE,TILE);
      ctx.fillStyle = '#4b3828';
      ctx.fillRect(screenX + 7,screenY + 9,3,7);
      ctx.fillStyle = '#173c2b';
      ctx.fillRect(screenX + 2,screenY + 2,12,10);
      ctx.fillStyle = '#24553a';
      ctx.fillRect(screenX + 5,screenY,6,4);
      break;
  }
}

function drawBridgeTile(screenX, screenY){
  ctx.fillStyle = '#0b2942';
  ctx.fillRect(screenX,screenY,TILE,TILE);
  ctx.fillStyle = '#76583c';
  for(let offset=1; offset<TILE; offset+=4) ctx.fillRect(screenX + 1,screenY + offset,TILE - 2,3);
  ctx.fillStyle = '#aa7c4c';
  ctx.fillRect(screenX + 2,screenY + 2,1,TILE - 4);
  ctx.fillRect(screenX + 13,screenY + 2,1,TILE - 4);
}

function drawDynamicBridge(gx, gy){
  if(!state.flags.bridge_open) return;
  for(const key of bridgeTiles){
    const [tx,ty] = key.split(',').map(Number);
    const screenX = tx * TILE - gx;
    const screenY = ty * TILE - gy;
    if(screenX < -TILE || screenY < -TILE || screenX > VW || screenY > VH) continue;
    drawBridgeTile(screenX,screenY);
  }
}

function drawWorldObject(object, gx, gy){
  if(!objectIsVisible(object)) return;
  const rect = objectRect(object);
  const x = Math.round(rect.x - gx);
  const y = Math.round(rect.y - gy);
  if(x + rect.w < -20 || y + rect.h < -20 || x > VW + 20 || y > VH + 20) return;
  const pulse = state.settings.reducedMotion ? 0.5 : Math.sin(timeSec * 3 + object.tx) * .5 + .5;

  switch(object.type){
    case 'mission_board':
      ctx.fillStyle = '#71533b'; ctx.fillRect(x+2,y+2,12,12);
      ctx.fillStyle = '#d9d0a6'; ctx.fillRect(x+4,y+3,8,8);
      ctx.fillStyle = '#44506d'; ctx.fillRect(x+5,y+5,6,1); ctx.fillRect(x+5,y+8,5,1);
      break;
    case 'lab_terminal':
    case 'terminal':
      ctx.fillStyle = '#1b2038'; ctx.fillRect(x+1,y+1,14,14);
      ctx.fillStyle = '#6cf'; ctx.fillRect(x+3,y+3,10,7);
      ctx.fillStyle = '#0a2630'; ctx.fillRect(x+4,y+4,8,5);
      ctx.fillStyle = pulse > .45 ? '#76e39f' : '#2f7251'; ctx.fillRect(x+5,y+6,6,2);
      break;
    case 'cabinet':
      ctx.fillStyle = '#4a5269'; ctx.fillRect(x+1,y,14,16);
      ctx.fillStyle = '#707a94'; ctx.fillRect(x+3,y+2,10,5); ctx.fillRect(x+3,y+9,10,5);
      ctx.fillStyle = '#ffd66b'; ctx.fillRect(x+10,y+6,1,1); ctx.fillRect(x+10,y+12,1,1);
      break;
    case 'relay':
      ctx.fillStyle = '#33384c'; ctx.fillRect(x,y,16,16);
      ctx.fillStyle = state.puzzles.lab_repair ? '#76e39f' : '#ff6b6b'; ctx.fillRect(x+3,y+3,4,4);
      ctx.fillStyle = '#ffd66b'; ctx.fillRect(x+10,y+4,2,8);
      ctx.fillStyle = '#191d2c'; ctx.fillRect(x+3,y+10,5,3);
      break;
    case 'gate':
      if(gateIsOpen(object)){
        ctx.fillStyle = '#76e39f'; ctx.fillRect(x+7,y,2,Math.min(rect.h,48));
        ctx.fillStyle = '#183728'; ctx.fillRect(x+5,y+4,6,2);
      }else{
        ctx.fillStyle = '#596078';
        for(let yy=0; yy<rect.h; yy+=8) ctx.fillRect(x+1,y+yy,14,3);
        ctx.fillStyle = '#2a2f49'; ctx.fillRect(x+4,y,3,rect.h); ctx.fillRect(x+10,y,3,rect.h);
        ctx.fillStyle = '#ff6b6b'; ctx.fillRect(x+7,y+Math.floor(rect.h/2)-2,3,3);
      }
      break;
    case 'gate_panel':
    case 'bridge_console':
    case 'iso_console':
    case 'charge_console':
    case 'reset_terminal':
      ctx.fillStyle = '#22283e'; ctx.fillRect(x+1,y+1,14,14);
      ctx.fillStyle = object.type === 'charge_console' ? '#ffd66b' : '#6cf'; ctx.fillRect(x+3,y+3,10,7);
      ctx.fillStyle = '#0b0f1c'; ctx.fillRect(x+5,y+5,6,3);
      ctx.fillStyle = pulse > .4 ? '#76e39f' : '#315b47'; ctx.fillRect(x+5,y+12,2,2);
      break;
    case 'station_shell':
    case 'station_compare':
    case 'station_ion':
    case 'station_iso':
    case 'station_trend':
    case 'station_analyzer':
    case 'radius_station':
    case 'ridge_station':
      ctx.fillStyle = '#262c47'; ctx.fillRect(x+1,y+1,14,14);
      ctx.fillStyle = state.stations.includes(object.id) ? '#76e39f' : '#6cf'; ctx.fillRect(x+3,y+3,10,6);
      ctx.fillStyle = '#0b0f1c'; ctx.fillRect(x+5,y+5,6,2);
      ctx.fillStyle = '#7c849d'; ctx.fillRect(x+4,y+11,8,3);
      break;
    case 'shrine': {
      const complete = Boolean(state.shrines[object.data.shrineId]);
      ctx.fillStyle = '#262a45'; ctx.fillRect(x,y,16,16);
      ctx.fillStyle = complete ? '#76e39f' : '#6cf'; ctx.fillRect(x+3,y+3,10,10);
      ctx.fillStyle = '#0a0b12'; ctx.fillRect(x+6,y+6,4,4);
      ctx.fillStyle = complete ? '#dfffea' : '#ccd'; ctx.font = '7px monospace';
      ctx.fillText(complete ? '✔' : '?',x-2,y-2);
      break;
    }
    case 'element_sample': {
      const element = ELEMENT_BY_SYMBOL[object.data.symbol];
      ctx.fillStyle = '#1a2034'; ctx.fillRect(x+3,y+2,10,13);
      ctx.fillStyle = '#6cf'; ctx.fillRect(x+4,y+3,8,8);
      ctx.fillStyle = '#0d2432'; ctx.fillRect(x+5,y+4,6,6);
      ctx.fillStyle = '#e7eaf6'; ctx.font = '6px monospace'; ctx.textAlign = 'center';
      ctx.fillText(element.symbol,x+8,y+9); ctx.textAlign = 'left';
      ctx.fillStyle = pulse > .5 ? '#76e39f' : '#3d7658'; ctx.fillRect(x+6,y+13,4,1);
      break;
    }
    case 'crystal_positive':
    case 'crystal_negative':
      ctx.fillStyle = object.type === 'crystal_positive' ? '#ff8d6b' : '#69baff';
      ctx.fillRect(x+6,y+1,4,14); ctx.fillRect(x+3,y+5,10,7);
      ctx.fillStyle = '#eef6ff'; ctx.fillRect(x+7,y+3,2,5);
      ctx.fillStyle = '#172033'; ctx.font = '7px monospace';
      ctx.fillText(object.type === 'crystal_positive' ? '+' : '−',x+5,y+12);
      break;
    case 'charge_node': {
      const values = state.flags.chargeNodeStates || PUZZLE_DEFAULTS.charge_balance;
      const charge = values[object.data.index] ?? 0;
      ctx.fillStyle = '#22283d'; ctx.fillRect(x,y,16,16);
      ctx.fillStyle = charge > 0 ? '#ff8d6b' : charge < 0 ? '#69baff' : '#8b93aa';
      ctx.fillRect(x+3,y+3,10,10);
      ctx.fillStyle = '#0a0b12'; ctx.font = '8px monospace';
      ctx.fillText(charge > 0 ? '+' : charge < 0 ? '−' : '0',x+5,y+11);
      break;
    }
    case 'beacon': {
      const active = state.beacons.includes(object.id);
      ctx.fillStyle = '#33453e'; ctx.fillRect(x+5,y+6,6,10);
      ctx.fillStyle = active ? '#76e39f' : '#6cf'; ctx.fillRect(x+3,y+2,10,6);
      if(active || pulse > .55){
        ctx.fillStyle = active ? 'rgba(118,227,159,.25)' : 'rgba(102,204,255,.18)';
        ctx.fillRect(x,y,16,12);
      }
      break;
    }
    case 'firefly_signal':
      ctx.fillStyle = '#173526'; ctx.fillRect(x+6,y+8,4,5);
      ctx.fillStyle = state.scanned.includes(object.id) ? '#76e39f' : '#c8f9a2';
      ctx.fillRect(x+7,y+4,2,2);
      if(pulse > .45) ctx.fillRect(x+5,y+3,6,1);
      break;
    case 'note':
    case 'research_notes':
    case 'research_log':
      ctx.fillStyle = '#d5cda7'; ctx.fillRect(x+3,y+3,10,11);
      ctx.fillStyle = '#77715d'; ctx.fillRect(x+5,y+6,6,1); ctx.fillRect(x+5,y+9,5,1);
      if(object.type === 'research_notes'){ ctx.fillStyle = '#76e39f'; ctx.fillRect(x+11,y+3,2,2); }
      break;
    case 'periodic_fragment':
      ctx.fillStyle = '#4d7fa3'; ctx.fillRect(x+3,y+3,10,10);
      ctx.fillStyle = '#b5e4ff'; ctx.fillRect(x+5,y+5,3,3); ctx.fillRect(x+9,y+9,2,2);
      break;
    case 'emblem':
      ctx.fillStyle = '#ffd66b'; ctx.fillRect(x+6,y+2,4,12); ctx.fillRect(x+2,y+6,12,4);
      ctx.fillStyle = '#6e5821'; ctx.fillRect(x+7,y+5,2,5);
      break;
    case 'stable_core_piece':
      ctx.fillStyle = '#76e39f'; ctx.fillRect(x+4,y+3,8,10);
      ctx.fillStyle = '#c7ffe0'; ctx.fillRect(x+6,y+5,4,5);
      ctx.fillStyle = '#264f39'; ctx.fillRect(x+7,y+7,2,2);
      break;
    case 'maintenance_keycard':
      ctx.fillStyle = '#76e39f'; ctx.fillRect(x+2,y+5,12,8);
      ctx.fillStyle = '#233b33'; ctx.fillRect(x+4,y+7,4,2);
      ctx.fillStyle = '#ffd66b'; ctx.fillRect(x+11,y+6,1,5);
      break;
    case 'broken_sign':
    case 'sign':
      ctx.fillStyle = '#6d5138'; ctx.fillRect(x+7,y+8,3,8);
      ctx.fillStyle = object.type === 'broken_sign' && !state.repairedSigns.includes(object.id) ? '#60443a' : '#536778';
      ctx.fillRect(x+1,y+1,14,9);
      ctx.fillStyle = object.type === 'broken_sign' && !state.repairedSigns.includes(object.id) ? '#ff6b6b' : '#d9efff';
      ctx.fillRect(x+4,y+4,8,1);
      if(object.type === 'broken_sign' && !state.repairedSigns.includes(object.id)) ctx.fillRect(x+8,y+1,1,8);
      break;
    case 'crate':
      ctx.fillStyle = '#78583c'; ctx.fillRect(x+1,y+1,14,14);
      ctx.fillStyle = '#a77a4c'; ctx.fillRect(x+3,y+3,10,2); ctx.fillRect(x+3,y+11,10,2);
      ctx.fillStyle = '#493729'; ctx.fillRect(x+7,y+5,2,6);
      ctx.fillRect(x+3,y+7,10,2);
      break;
    case 'pressure_pad': {
      const occupied = crateOnPad(object);
      ctx.fillStyle = occupied ? '#2c6b4a' : '#2a2f49'; ctx.fillRect(x+1,y+1,14,14);
      ctx.fillStyle = occupied ? '#76e39f' : '#5f6780'; ctx.fillRect(x+4,y+4,8,8);
      break;
    }
    case 'telescope':
      ctx.fillStyle = '#6d7693'; ctx.fillRect(x+5,y+3,18,6);
      ctx.fillStyle = '#a2c7df'; ctx.fillRect(x+20,y+4,7,4);
      ctx.fillStyle = '#454b63'; ctx.fillRect(x+10,y+9,3,13); ctx.fillRect(x+18,y+9,3,13);
      break;
    case 'campus_core':
      ctx.fillStyle = '#232842'; ctx.fillRect(x,y,32,32);
      ctx.fillStyle = state.puzzles.campus_core ? '#76e39f' : '#6cf';
      ctx.fillRect(x+7,y+7,18,18);
      ctx.fillStyle = '#0a0b12'; ctx.fillRect(x+11,y+11,10,10);
      ctx.fillStyle = pulse > .45 ? '#dfffea' : '#5f8fa3'; ctx.fillRect(x+14,y+14,4,4);
      break;
    case 'discovery_map':
      ctx.fillStyle = '#1d2540'; ctx.fillRect(x,y,32,16);
      ctx.fillStyle = '#6cf'; ctx.fillRect(x+3,y+3,26,10);
      ctx.fillStyle = '#0b1b28'; ctx.fillRect(x+5,y+5,22,6);
      ctx.fillStyle = '#76e39f'; ctx.fillRect(x+9,y+7,2,2); ctx.fillRect(x+21,y+6,2,2);
      break;
    case 'research_table':
      ctx.fillStyle = '#556076'; ctx.fillRect(x,y,rect.w,10);
      ctx.fillStyle = '#303649'; ctx.fillRect(x+2,y+10,3,6); ctx.fillRect(x+rect.w-5,y+10,3,6);
      break;
    case 'shelf':
      ctx.fillStyle = '#5f4936'; ctx.fillRect(x+1,y,14,16);
      ctx.fillStyle = '#b47c5b'; ctx.fillRect(x+3,y+2,3,5);
      ctx.fillStyle = '#6c8aa4'; ctx.fillRect(x+7,y+2,2,5);
      ctx.fillStyle = '#d8b25e'; ctx.fillRect(x+10,y+2,3,5);
      ctx.fillStyle = '#2b2d3e'; ctx.fillRect(x+2,y+8,12,2);
      break;
    case 'glassware':
      ctx.fillStyle = '#9eeaff'; ctx.fillRect(x+6,y+3,4,8);
      ctx.fillRect(x+4,y+10,8,4);
      ctx.fillStyle = '#4da487'; ctx.fillRect(x+5,y+11,6,2);
      break;
    case 'storage':
      ctx.fillStyle = '#495269'; ctx.fillRect(x+1,y+3,14,12);
      ctx.fillStyle = '#6d7892'; ctx.fillRect(x+3,y+5,10,3);
      ctx.fillStyle = '#ffd66b'; ctx.fillRect(x+7,y+10,2,2);
      break;
    case 'warning':
      ctx.fillStyle = '#ffd66b'; ctx.fillRect(x+2,y+2,12,12);
      ctx.fillStyle = '#292315'; ctx.fillRect(x+4,y+5,8,2); ctx.fillRect(x+7,y+8,2,4);
      break;
    case 'cable':
      ctx.fillStyle = '#0f121e'; ctx.fillRect(x,y+8,rect.w,3);
      ctx.fillStyle = '#d86f55'; ctx.fillRect(x+4,y+9,Math.max(2,rect.w-8),1);
      break;
    case 'monitor':
      ctx.fillStyle = '#20263c'; ctx.fillRect(x+1,y+2,14,12);
      ctx.fillStyle = '#6cf'; ctx.fillRect(x+3,y+4,10,6);
      ctx.fillStyle = pulse > .5 ? '#76e39f' : '#204f3a'; ctx.fillRect(x+5,y+6,6,2);
      break;
    case 'lamp':
      ctx.fillStyle = '#3a415a'; ctx.fillRect(x+7,y+6,2,10);
      ctx.fillStyle = pulse > .4 ? '#bff3ff' : '#6b8793'; ctx.fillRect(x+4,y+2,8,6);
      break;
    case 'ionic_plant':
      ctx.fillStyle = '#2b754e'; ctx.fillRect(x+7,y+7,2,8);
      ctx.fillStyle = '#59d794'; ctx.fillRect(x+3,y+5,5,4); ctx.fillRect(x+9,y+2,4,6);
      ctx.fillStyle = '#6cf'; ctx.fillRect(x+6,y+3,2,2);
      break;
    case 'conductor':
      ctx.fillStyle = '#a06f4a'; ctx.fillRect(x+2,y+5,12,7);
      ctx.fillStyle = '#ddae77'; ctx.fillRect(x+3,y+6,10,2);
      break;
    case 'bench':
      ctx.fillStyle = '#604934'; ctx.fillRect(x,y+6,rect.w,5);
      ctx.fillStyle = '#906846'; ctx.fillRect(x+2,y+4,rect.w-4,2);
      ctx.fillRect(x+3,y+11,2,5); ctx.fillRect(x+rect.w-5,y+11,2,5);
      break;
    case 'camp':
      ctx.fillStyle = '#425f4c'; ctx.fillRect(x+2,y+6,12,9);
      ctx.fillStyle = '#75956e'; ctx.fillRect(x+5,y+2,6,5);
      ctx.fillStyle = '#d9954f'; ctx.fillRect(x+7,y+11,2,3);
      break;
    case 'mushroom':
      ctx.fillStyle = '#d7c6a1'; ctx.fillRect(x+7,y+8,2,6);
      ctx.fillStyle = '#9d6682'; ctx.fillRect(x+4,y+5,8,4);
      break;
    case 'reeds':
      ctx.fillStyle = '#607e52'; ctx.fillRect(x+4,y+5,1,10); ctx.fillRect(x+8,y+2,1,13); ctx.fillRect(x+12,y+6,1,9);
      ctx.fillStyle = '#9a7d45'; ctx.fillRect(x+7,y+1,3,3);
      break;
    case 'mineral':
      ctx.fillStyle = '#596178'; ctx.fillRect(x+2,y+8,12,7);
      ctx.fillStyle = '#6cf'; ctx.fillRect(x+5,y+4,4,8);
      ctx.fillStyle = '#b8efff'; ctx.fillRect(x+6,y+5,1,4);
      break;
    case 'stairs':
      ctx.fillStyle = '#636a82';
      for(let step=0; step<4; step++) ctx.fillRect(x,y+step*4,rect.w,2);
      break;
    case 'stable_core':
      ctx.fillStyle = '#253d38'; ctx.fillRect(x+2,y+2,12,12);
      ctx.fillStyle = '#76e39f'; ctx.fillRect(x+5,y+5,6,6);
      ctx.fillStyle = '#d9ffea'; ctx.fillRect(x+7,y+7,2,2);
      break;
    case 'marker':
      break;
  }
}

function drawAmbientEffects(gx, gy){
  if(state.settings.reducedMotion) return;
  if(state.discoveredRegions.includes('garden')){
    for(let index=0; index<8; index++){
      const wx = (46 + (hash2(index,4) % 24)) * TILE;
      const wy = (9 + (hash2(index,8) % 23)) * TILE;
      const sx = Math.round(wx - gx + Math.sin(timeSec * 2 + index) * 4);
      const sy = Math.round(wy - gy + Math.cos(timeSec * 2.7 + index) * 3);
      if(sx >= 0 && sx < VW && sy >= 0 && sy < VH){
        ctx.fillStyle = index % 2 ? '#6cf' : '#ff9b70';
        ctx.fillRect(sx,sy,1,2);
      }
    }
  }
  if(state.discoveredRegions.includes('forest')){
    for(let index=0; index<12; index++){
      const wx = (78 + (hash2(index,15) % 31)) * TILE;
      const wy = (8 + (hash2(index,22) % 27)) * TILE;
      const sx = Math.round(wx - gx + Math.sin(timeSec + index) * 3);
      const sy = Math.round(wy - gy + Math.cos(timeSec * 1.3 + index) * 3);
      if(sx >= 0 && sx < VW && sy >= 0 && sy < VH){
        ctx.fillStyle = (Math.floor(timeSec * 3 + index) & 1) ? '#c8f9a2' : '#547c58';
        ctx.fillRect(sx,sy,2,2);
      }
    }
  }
}

function drawParticles(gx, gy){
  for(const particle of particles){
    if(particle.alpha <= 0) continue;
    ctx.globalAlpha = Math.max(0,particle.alpha);
    ctx.fillStyle = particle.color;
    ctx.fillRect(Math.round(particle.x - gx),Math.round(particle.y - gy),2,2);
  }
  ctx.globalAlpha = 1;
}

function drawTargetHighlight(target, gx, gy){
  if(!target || panelOpen()) return;
  const rect = target.kind === 'npc' ? target.entity : objectRect(target.object);
  const x = Math.round(rect.x - gx);
  const y = Math.round(rect.y - gy);
  const alpha = state.settings.reducedMotion ? .75 : .45 + Math.sin(timeSec * 5) * .2;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = target.mode === 'scan' ? '#6cf' : '#ffd66b';
  ctx.lineWidth = 1;
  ctx.strokeRect(x-2,y-2,rect.w+4,rect.h+4);
  ctx.globalAlpha = 1;
}

function drawInteractionPrompt(){
  if(!gameStarted || panelOpen()) return;
  const lines = [];
  if(currentInteractionTarget) lines.push(`E: ${interactionLabel(currentInteractionTarget)}`);
  if(currentScanTarget && hasItem('electron_scanner')) lines.push('Q: Escanear');
  if(!lines.length) return;

  ctx.font = '10px monospace';
  const width = Math.max(...lines.map(line => ctx.measureText(line).width)) + 14;
  const height = lines.length * 14 + 6;
  const playerScreenX = player.cx - camera.x;
  const playerScreenY = player.y - camera.y;
  const x = clamp(Math.round(playerScreenX - width / 2),4,VW - width - 4);
  const y = clamp(Math.round(playerScreenY - height - 10),4,VH - height - 4);
  ctx.fillStyle = 'rgba(8,11,21,.9)';
  ctx.fillRect(x,y,width,height);
  ctx.strokeStyle = '#47506f';
  ctx.strokeRect(x+.5,y+.5,width-1,height-1);
  lines.forEach((line,index) => {
    ctx.fillStyle = index === 0 ? '#fff1bd' : '#c8efff';
    ctx.fillText(line,x+7,y+14+index*14);
  });
}

function drawCurrentRegionTag(){
  const region = REGIONS.find(candidate => pointInRegion(player.cx,player.cy,candidate));
  if(!region) return;
  ctx.font = '9px monospace';
  const text = region.name.toUpperCase();
  const width = ctx.measureText(text).width + 12;
  ctx.fillStyle = 'rgba(8,11,21,.7)';
  ctx.fillRect(VW - width - 8,VH - 24,width,16);
  ctx.fillStyle = '#9fb8c9';
  ctx.fillText(text,VW - width - 2,VH - 13);
}

function drawWorld(){
  const gx = Math.floor(camera.x);
  const gy = Math.floor(camera.y);
  const startX = Math.max(0,Math.floor(gx / TILE));
  const startY = Math.max(0,Math.floor(gy / TILE));
  const endX = Math.min(WORLD_W,Math.ceil((gx + VW) / TILE) + 1);
  const endY = Math.min(WORLD_H,Math.ceil((gy + VH) / TILE) + 1);

  for(let ty=startY; ty<endY; ty++){
    for(let tx=startX; tx<endX; tx++){
      drawTile(tx,ty,tx*TILE-gx,ty*TILE-gy);
    }
  }

  drawDynamicBridge(gx,gy);
  drawAmbientEffects(gx,gy);

  for(const object of worldObjects) drawWorldObject(object,gx,gy);

  for(const npc of npcEntities){
    const sx = npc.x - gx;
    const sy = npc.y - gy;
    if(sx > -24 && sy > -24 && sx < VW + 24 && sy < VH + 24) drawNPCSprite(npc,sx,sy);
  }

  drawPlayerSprite(player.x-gx,player.y-gy,player.dir,player.anim,player.blinkTimer < .13);
  drawParticles(gx,gy);
  drawTargetHighlight(currentInteractionTarget,gx,gy);
  if(!currentInteractionTarget) drawTargetHighlight(currentScanTarget,gx,gy);
  drawInteractionPrompt();
  drawCurrentRegionTag();
}

/* ---------- Painéis, diálogos e notificações ---------- */

let activePanelKind = '';
let labAnimId = 0;
let gameStarted = false;

function panelOpen(){
  return ui.classList.contains('show');
}

function showPanel(html, options={}){
  clearMovement();
  if(labAnimId){
    cancelAnimationFrame(labAnimId);
    labAnimId = 0;
  }
  activePanelKind = options.kind || 'generic';
  uicontent.innerHTML = html;
  ui.classList.add('show');
  closeBtn.style.display = options.closable === false ? 'none' : '';
  uicard.scrollTop = 0;
  const heading = uicontent.querySelector('h1,h2,h3');
  if(heading && !heading.id) heading.id = 'panelTitle';
  if(typeof options.onMount === 'function') options.onMount();
  const focusTarget = uicontent.querySelector('button:not([disabled]),input:not([disabled])');
  if(focusTarget) window.setTimeout(() => focusTarget.focus({preventScroll:true}),0);
}

function hidePanel(){
  if(!gameStarted){
    if(activePanelKind !== 'menu') openMainMenu();
    return;
  }
  ui.classList.remove('show');
  closeBtn.style.display = '';
  activePanelKind = '';
  if(labAnimId){
    cancelAnimationFrame(labAnimId);
    labAnimId = 0;
  }
  clearMovement();
  cvs.focus({preventScroll:true});
}

function toast(message, style=''){
  const element = document.createElement('div');
  element.className = `toast ${style}`.trim();
  element.textContent = message;
  toastArea.appendChild(element);
  while(toastArea.children.length > 4) toastArea.firstElementChild.remove();
  window.setTimeout(() => element.remove(), state.settings.reducedMotion ? 2600 : 3400);
}

function openPagedDialogue(title, pages, actions=[]){
  let page = 0;
  const safePages = pages.length ? pages : ['...'];

  const render = () => {
    const actionButtons = actions.map((action,index) => (
      `<button class="btn ${escapeHtml(action.className || '')}" type="button" data-dialog-action="${index}">${escapeHtml(action.label)}</button>`
    )).join('');
    const navigation = safePages.length > 1
      ? `<div class="row">
          <button class="btn" type="button" id="dialogPrev" ${page === 0 ? 'disabled' : ''}>← Anterior</button>
          <span class="pill">${page + 1}/${safePages.length}</span>
          <button class="btn" type="button" id="dialogNext" ${page === safePages.length - 1 ? 'disabled' : ''}>Próxima →</button>
        </div>`
      : '';

    showPanel(`
      <h2 id="panelTitle">${escapeHtml(title)}</h2>
      <pre style="white-space:pre-wrap">${escapeHtml(safePages[page])}</pre>
      <div class="sep"></div>
      <div class="foot" style="justify-content:space-between">
        ${navigation}
        <div class="row">${actionButtons}</div>
      </div>
    `,{
      kind:'dialogue',
      onMount(){
        document.getElementById('dialogPrev')?.addEventListener('click',() => { page -= 1; render(); });
        document.getElementById('dialogNext')?.addEventListener('click',() => { page += 1; render(); });
        uicontent.querySelectorAll('[data-dialog-action]').forEach(button => {
          button.addEventListener('click',() => {
            const action = actions[Number(button.dataset.dialogAction)];
            action?.callback?.();
          });
        });
      }
    });
  };
  render();
}

function openConfirm(title, text, onConfirm, onCancel=hidePanel){
  showPanel(`
    <h2 id="panelTitle">${escapeHtml(title)}</h2>
    <p>${escapeHtml(text)}</p>
    <div class="sep"></div>
    <div class="foot">
      <button class="btn" id="confirmCancel" type="button">Cancelar</button>
      <button class="btn danger" id="confirmAccept" type="button">Confirmar</button>
    </div>
  `,{
    kind:'confirm',
    onMount(){
      document.getElementById('confirmCancel').addEventListener('click',onCancel);
      document.getElementById('confirmAccept').addEventListener('click',onConfirm);
    }
  });
}

function showControlUnlock(itemId){
  if(itemId === 'electron_scanner' && !state.tutorials.scanner){
    state.tutorials.scanner = true;
    toast('Scanner desbloqueado — pressione Q perto de um alvo.', 'good');
  }
  if(itemId === 'research_notebook' && !state.tutorials.inventory){
    state.tutorials.inventory = true;
    toast('Inventário e Caderno — pressione I.', 'good');
  }
}

/* ---------- Seleção de alvo e feedback contextual ---------- */

function nearestTarget(mode='interact', range=28){
  let best = null;
  let bestDistance = range;

  if(mode === 'interact'){
    for(const npc of npcEntities){
      const value = distance(player.cx,player.cy,npc.cx,npc.cy);
      if(value < bestDistance){
        bestDistance = value;
        best = {kind:'npc',entity:npc,npc:npc.definition,distance:value,mode};
      }
    }
  }

  for(const object of worldObjects){
    if(!objectIsVisible(object)) continue;
    if(mode === 'interact' && !object.interactive) continue;
    if(mode === 'scan' && !object.scannable) continue;
    const rect = objectRect(object);
    const value = distance(player.cx,player.cy,rect.x + rect.w/2,rect.y + rect.h/2);
    if(value < bestDistance){
      bestDistance = value;
      best = {kind:'object',object,distance:value,mode};
    }
  }
  return best;
}

function interactionLabel(target){
  if(target.kind === 'npc') return 'Falar';
  const object = target.object;
  if(object.type === 'crate') return 'Empurrar';
  if(object.type === 'element_sample') return 'Coletar';
  if(object.type === 'gate' && gateIsOpen(object)) return 'Examinar passagem';
  return object.label || 'Examinar';
}

function updateTargets(){
  if(!gameStarted || panelOpen()){
    currentInteractionTarget = null;
    currentScanTarget = null;
    return;
  }
  currentInteractionTarget = nearestTarget('interact',29);
  currentScanTarget = hasItem('electron_scanner') ? nearestTarget('scan',55) : null;
}

/* ---------- Coletas e descobertas ---------- */

function markObjectCollected(object){
  if(!state.collectedObjects.includes(object.id)) state.collectedObjects.push(object.id);
}

function collectElementSample(object){
  const element = ELEMENT_BY_SYMBOL[object.data.symbol];
  if(!element || state.samples.includes(element.symbol)) return;
  state.samples.push(element.symbol);
  markObjectCollected(object);
  addItem('atomic_sample',1,state,false);
  awardOnce(`sample:${element.symbol}`,8,`Amostra ${element.symbol}`);
  audio.ok();
  refreshMissionProgress();
  saveProgress(true);
  openPagedDialogue(
    `Amostra ${element.symbol} — ${element.name}`,
    [
      `Número atômico: ${element.z}\nCamadas: ${element.shells.join('–')}\nRaio neutro aproximado: ${element.radius} pm`,
      `${element.fact}\n\nLocal de descoberta: ${element.location}\n* Valor didático aproximado; o raio depende do modelo e do método de medida.`
    ],
    [{label:'Guardar cápsula',className:'good',callback:hidePanel}]
  );
}

function collectResearchLog(object){
  markObjectCollected(object);
  if(!state.readLogs.includes(object.id)) state.readLogs.push(object.id);
  addItem('research_log',1,state,false);
  awardOnce(`log:${object.id}`,6,'Registro de pesquisa');
  refreshMissionProgress();
  saveProgress(true);
  openPagedDialogue(
    object.data.title || 'Registro de pesquisa',
    [object.data.text || 'Dados recuperados e arquivados no Caderno de Pesquisa.'],
    [{label:'Arquivar',callback:hidePanel}]
  );
}

function collectPeriodicFragment(object){
  markObjectCollected(object);
  if(!state.periodicFragments.includes(object.id)) state.periodicFragments.push(object.id);
  addItem('periodic_fragment',1,state,false);
  awardOnce(`fragment:${object.id}`,5,'Fragmento periódico');
  refreshMissionProgress();
  saveProgress(true);
  toast(`Fragmento periódico ${state.periodicFragments.length}/6`, 'good');
}

function collectEmblem(object){
  markObjectCollected(object);
  if(!state.emblems.includes(object.id)) state.emblems.push(object.id);
  addItem('campus_emblem',1,state,false);
  awardOnce(`emblem:${object.id}`,12,'Emblema secreto');
  saveProgress(true);
}

function collectCorePiece(object){
  markObjectCollected(object);
  if(!state.stableCorePieces.includes(object.id)) state.stableCorePieces.push(object.id);
  addItem('stable_core_piece',1,state,false);
  awardOnce(`corepiece:${object.id}`,10,'Peça de núcleo estável');
  saveProgress(true);
}

function collectGenericObject(object){
  switch(object.type){
    case 'element_sample':
      collectElementSample(object);
      break;
    case 'note':
      markObjectCollected(object);
      refreshMissionProgress();
      saveProgress(true);
      toast('Página de catálogo recuperada.', 'good');
      break;
    case 'research_notes':
      markObjectCollected(object);
      addItem('research_notes',1);
      refreshMissionProgress();
      saveProgress(true);
      openPagedDialogue(
        'Notas de blindagem recuperadas',
        ['Os dados confirmam que os sinalizadores devem ser ligados da camada interna para a externa.'],
        [{label:'Guardar notas',className:'good',callback:hidePanel}]
      );
      break;
    case 'research_log':
      collectResearchLog(object);
      break;
    case 'periodic_fragment':
      collectPeriodicFragment(object);
      break;
    case 'emblem':
      collectEmblem(object);
      break;
    case 'stable_core_piece':
      collectCorePiece(object);
      break;
    case 'maintenance_keycard':
      markObjectCollected(object);
      addItem('maintenance_keycard',1);
      refreshMissionProgress();
      saveProgress(true);
      break;
  }
}

/* ---------- Regiões, passagem e blocos móveis ---------- */

function discoverCurrentRegion(){
  const region = REGIONS.find(candidate => pointInRegion(player.cx,player.cy,candidate));
  if(!region || state.discoveredRegions.includes(region.id)) return;
  state.discoveredRegions.push(region.id);
  awardOnce(`region:${region.id}`,10,`Descoberta: ${region.name}`);
  toast(`Região descoberta: ${region.name}`, 'good');
  refreshMissionProgress();
  saveProgress(true);
}

function checkWorldProgressTriggers(){
  const tx = Math.floor(player.cx / TILE);
  const ty = Math.floor(player.cy / TILE);
  if(state.flags.bridge_open && tx >= 69 && tx <= 78 && ty >= 47 && ty <= 67 && !state.flags.marsh_crossed){
    setFlag('marsh_crossed',true);
  }
}

function crateOnPad(pad){
  return Object.values(state.cratePositions).some(position => position.tx === pad.tx && position.ty === pad.ty);
}

function checkCratePuzzle(){
  const complete = ['charge_pad_a','charge_pad_b'].every(id => crateOnPad(worldObjectById[id]));
  if(complete && !state.puzzles.moving_blocks){
    state.puzzles.moving_blocks = true;
    awardOnce('puzzle:moving_blocks',20,'Circuito com blocos condutores');
    toast('Circuito físico fechado! Os dois condutores estão nas placas.', 'good');
    audio.ok();
    saveProgress(true);
  }
}

function pushCrate(object){
  const direction = {
    up:[0,-1],
    down:[0,1],
    left:[-1,0],
    right:[1,0]
  }[player.dir] || [0,1];
  const position = state.cratePositions[object.id] || {tx:object.tx,ty:object.ty};
  const next = {tx:position.tx + direction[0],ty:position.ty + direction[1]};
  const nextRect = {x:next.tx*TILE,y:next.ty*TILE,w:TILE,h:TILE};
  if(collidesRect(nextRect,object.id)){
    audio.no();
    toast('O bloco não pode avançar nessa direção.', 'warn');
    return;
  }
  state.cratePositions[object.id] = next;
  audio.tick();
  checkCratePuzzle();
  saveProgress();
}

function resetCrates(){
  state.cratePositions = deepClone(createDefaultState().cratePositions);
  state.puzzles.moving_blocks = false;
  saveProgress(true);
  toast('Blocos condutores retornaram às posições iniciais.');
}

/* ---------- Scanner de elétrons ---------- */

function scanDescription(object){
  if(object.type === 'element_sample'){
    const element = ELEMENT_BY_SYMBOL[object.data.symbol];
    return {
      title:`Scanner — ${element.symbol}`,
      pages:[
        `Elemento: ${element.name}\nSímbolo: ${element.symbol}\nZ: ${element.z}\nCarga: 0\nElétrons: ${element.z}`,
        `Camadas: ${element.shells.join('–')}\nRaio neutro aproximado: ${element.radius} pm\n\nPista: ${element.fact}`
      ]
    };
  }
  if(object.type.startsWith('crystal_')){
    const charge = object.data.charge || 0;
    return {
      title:'Scanner — cristal iônico',
      pages:[`Carga detectada: ${formatCharge(charge)}\nEstado: ${charge > 0 ? 'positivo' : 'negativo'}\n\nPista: some os sinais algébricos para equilibrar o sistema.`]
    };
  }
  if(object.type === 'firefly_signal'){
    return {
      title:'Scanner — sinal eletrônico',
      pages:['Assinatura fraca detectada entre as camadas.\n\nPista: elétrons internos contribuem para a blindagem sentida pelos elétrons externos.']
    };
  }
  if(object.type === 'beacon'){
    return {
      title:`Scanner — camada ${object.data.layer}`,
      pages:[`Ordem de sincronização: ${object.data.order + 1}/3.\n\nAtive os sinalizadores do mais interno para o mais externo.`]
    };
  }
  if(object.type === 'charge_node'){
    const values = state.flags.chargeNodeStates || PUZZLE_DEFAULTS.charge_balance;
    const value = values[object.data.index] ?? 0;
    return {
      title:'Scanner — nó de carga',
      pages:[`Estado atual: ${formatCharge(value)}\n\nO Manipulador de Cargas alterna apenas nós autorizados do jardim.`]
    };
  }
  if(object.type === 'shrine'){
    return {
      title:`Scanner — ${object.data.title}`,
      pages:[`Selo: ${state.shrines[object.data.shrineId] ? 'concluído' : 'pendente'}\nFoco educacional preservado do Campus Periodicum original.`]
    };
  }
  if(object.type === 'ridge_station'){
    return {
      title:`Scanner — estação ${object.data.index}`,
      pages:['O terminal responde a direções de tendência periódica.\nPista: raio aumenta para baixo e para a esquerda.']
    };
  }
  if(object.type === 'lab_terminal' || object.type === 'relay' || object.type === 'campus_core'){
    return {
      title:'Scanner — equipamento científico',
      pages:[`Estado: ${object.type === 'relay' && state.puzzles.lab_repair ? 'estável' : object.type === 'campus_core' && state.puzzles.campus_core ? 'sincronizado' : 'leitura disponível'}\n\nNenhuma carga arbitrária será alterada pelo scanner.`]
    };
  }
  return {title:'Scanner',pages:['Nenhum dado químico adicional disponível.']};
}

function tryScan(){
  if(panelOpen() || !gameStarted) return;
  if(!hasItem('electron_scanner')){
    toast('O Scanner de Elétrons ainda não foi desbloqueado.', 'warn');
    return;
  }
  const target = nearestTarget('scan',55);
  if(!target){
    audio.no();
    toast('Nenhum alvo compatível ao alcance.', 'warn');
    return;
  }
  const object = target.object;
  if(['firefly_signal','crystal_positive','crystal_negative'].includes(object.type)){
    if(!state.scanned.includes(object.id)){
      state.scanned.push(object.id);
      awardOnce(`scan:${object.id}`,5,'Leitura de scanner');
      refreshMissionProgress();
      saveProgress(true);
    }
  }
  const description = scanDescription(object);
  audio.tick();
  openPagedDialogue(description.title,description.pages,[{label:'Fechar leitura',callback:hidePanel}]);
}

/* ---------- Diálogos dos NPCs ---------- */

function activeSideTurnInsFor(npcId){
  return SIDE_MISSIONS.filter(mission => {
    const progress = missionState(mission.id);
    const stage = mission.stages[progress.stage];
    return progress.status === 'active' && stage.req.type === 'turnin' && stage.req.npc === npcId;
  });
}

function availableSideMissionsFor(npcId){
  updateMissionAvailability();
  return SIDE_MISSIONS.filter(mission => mission.giver === npcId && missionState(mission.id).status === 'available');
}

function activeMainHintFor(npcId){
  const activeId = findActiveMainId();
  const mission = MISSION_BY_ID[activeId];
  if(!mission || mission.giver !== npcId) return '';
  const progress = missionState(activeId);
  return `Missão atual: ${mission.title}\n${mission.stages[progress.stage].text}`;
}

function openNPCDialogue(npc){
  const definition = npc.definition;

  if(definition.id === 'prof_dalton' && missionState('main_01').status === 'active'){
    state.flags.spoke_dalton = true;
    refreshMissionProgress();
  }

  const actions = [];
  for(const mission of activeSideTurnInsFor(definition.id)){
    actions.push({
      label:`Concluir: ${mission.title}`,
      className:'good',
      callback:() => turnInMission(mission.id,definition.id)
    });
  }
  for(const mission of availableSideMissionsFor(definition.id)){
    actions.push({
      label:`Aceitar: ${mission.title}`,
      className:'primary',
      callback:() => acceptMission(mission.id)
    });
  }

  if(definition.id === 'prof_dalton' && missionState('main_16').status === 'active'){
    actions.push({
      label:'Receber certificação expandida',
      className:'good',
      callback(){
        state.flags.final_certificate = true;
        refreshMissionProgress();
      }
    });
  }

  if(definition.id === 'lina' && missionState('side_05').status === 'active' && missionState('side_05').stage === 0){
    actions.push({
      label:'Entregar amostra Na⁺ selada',
      className:'good',
      callback(){
        if(!hasItem('positive_ion_sample')){
          addItem('positive_ion_sample',1);
          toast('A cápsula foi recuperada pelo protocolo de segurança.', 'warn');
        }
        state.flags.ion_delivered = true;
        refreshMissionProgress();
        openPagedDialogue('Lina',['Carga verificada: +1. A cápsula chegou sem alteração. Ícaro vai gostar do relatório.'],[{label:'Continuar',callback:hidePanel}]);
      }
    });
  }

  if(definition.id === 'bento' && missionState('main_04').status === 'active'){
    actions.push({
      label:'Solicitar peças do relé',
      callback(){
        if(!hasItem('replacement_fuse')) addItem('replacement_fuse',1);
        if(!hasItem('conductive_wire')) addItem('conductive_wire',1);
        refreshMissionProgress();
        openPagedDialogue('Bento',['Fusível e fio separados. Se algo der errado, o armário também repõe as peças essenciais.'],[{label:'Certo',callback:hidePanel}]);
      }
    });
  }

  actions.push({label:'Fechar',callback:hidePanel});
  const comments = definition.comments || [];
  const commentIndex = hash2(Math.floor(timeSec),definition.tx,definition.ty) % Math.max(1,comments.length);
  const hint = activeMainHintFor(definition.id);
  const pages = [
    `${definition.role}\n\n${definition.intro}`,
    `${hint ? `${hint}\n\n` : ''}${comments[commentIndex] || 'A pesquisa continua.'}`
  ];
  openPagedDialogue(definition.name,pages,actions);
}

/* ---------- Interações de mundo ---------- */

function handleGateInteraction(object){
  const gate = object.data.gate;
  if(gateIsOpen(object)){
    toast('A passagem está aberta.');
    return;
  }
  if(gate === 'research_room'){
    openPagedDialogue(
      'Sala de pesquisa',
      ['A porta libera automaticamente depois que o relé do laboratório é restaurado.'],
      [{label:'Fechar',callback:hidePanel}]
    );
    return;
  }
  if(gate === 'garden'){
    openPagedDialogue('Portão do Jardim Iônico',['O painel de acesso fica ao lado de fora. Cartão do laboratório necessário.'],[{label:'Fechar',callback:hidePanel}]);
    return;
  }
  if(gate === 'forest'){
    openPagedDialogue('Passagem para a floresta',['Os condutores do jardim precisam atingir equilíbrio antes que a cerca seja desenergizada.'],[{label:'Fechar',callback:hidePanel}]);
    return;
  }
  if(gate === 'ridge'){
    openPagedDialogue('Portão da Crista',['O terminal isoeletrônico controla esta passagem.'],[{label:'Fechar',callback:hidePanel}]);
    return;
  }
  if(gate === 'observatory'){
    if(!missionCompleted('main_13')){
      openPagedDialogue('Observatório bloqueado',['O leitor exige os seis selos originais antes de autorizar a câmara dos gases nobres.'],[{label:'Fechar',callback:hidePanel}]);
      return;
    }
    state.flags.observatory_gate_open = true;
    state.discoveredTerminals.push('observatory_gate');
    audio.ok();
    refreshMissionProgress();
    saveProgress(true);
    toast('Observatório destravado.', 'good');
  }
}

function interactSupplyCabinet(object){
  if(object.data.lens){
    if(!hasItem('spectroscopy_lens') && !state.flags.telescope_repaired){
      addItem('spectroscopy_lens',1);
      saveProgress(true);
    }
    openPagedDialogue('Armário óptico',['A lente de espectroscopia está protegida em espuma antichoque.'],[{label:'Fechar',callback:hidePanel}]);
    return;
  }
  let restored = false;
  if(!hasItem('replacement_fuse')){ addItem('replacement_fuse',1); restored = true; }
  if(!hasItem('conductive_wire')){ addItem('conductive_wire',1); restored = true; }
  refreshMissionProgress();
  saveProgress(true);
  openPagedDialogue(
    'Armário de amostras e peças',
    [restored ? 'Peças essenciais repostas: fusível e fio condutor.' : 'Prateleiras organizadas. Peças essenciais já constam no inventário.'],
    [{label:'Fechar',callback:hidePanel}]
  );
}

function activateBeacon(object){
  const order = ['beacon_inner','beacon_middle','beacon_outer'];
  if(state.beacons.includes(object.id)){
    toast(`Sinalizador da camada ${object.data.layer} já está ativo.`);
    return;
  }
  const expected = order[state.beacons.length];
  if(object.id !== expected){
    state.beacons = [];
    audio.no();
    saveProgress(true);
    openPagedDialogue(
      'Sequência reiniciada',
      ['A blindagem deve ser percorrida da camada interna para a externa.\nNenhum progresso de missão foi perdido.'],
      [{label:'Tentar novamente',callback:hidePanel}]
    );
    return;
  }
  state.beacons.push(object.id);
  audio.ok();
  toast(`Camada ${object.data.layer} sincronizada (${state.beacons.length}/3).`, 'good');
  refreshMissionProgress();
  saveProgress(true);
}

function cycleChargeNode(object){
  if(!hasItem('charge_manipulator')){
    toast('O Manipulador de Cargas ainda não foi desbloqueado.', 'warn');
    return;
  }
  const values = Array.isArray(state.flags.chargeNodeStates)
    ? state.flags.chargeNodeStates.slice()
    : PUZZLE_DEFAULTS.charge_balance.slice();
  const current = values[object.data.index] ?? 0;
  values[object.data.index] = current === -1 ? 0 : current === 0 ? 1 : -1;
  state.flags.chargeNodeStates = values;
  audio.tick();
  saveProgress();
  toast(`Nó alterado para ${formatCharge(values[object.data.index])}.`);
}

function repairBrokenSign(object){
  if(state.repairedSigns.includes(object.id)){
    openPagedDialogue('Placa restaurada',['A orientação está legível e registrada no mapa do campus.'],[{label:'Fechar',callback:hidePanel}]);
    return;
  }
  if(!hasItem('conductive_wire')){
    openPagedDialogue('Placa danificada',['A iluminação da placa precisa de um fio condutor. O armário do laboratório pode repor a peça.'],[{label:'Fechar',callback:hidePanel}]);
    return;
  }
  state.repairedSigns.push(object.id);
  audio.ok();
  refreshMissionProgress();
  saveProgress(true);
  toast(`Placa restaurada (${state.repairedSigns.length}/4).`, 'good');
}

function interactTelescope(){
  if(state.flags.telescope_repaired){
    openPagedDialogue('Telescópio auxiliar',['A lente revela linhas espectrais didáticas de He, Ne e Ar. O equipamento está estável.'],[{label:'Fechar',callback:hidePanel}]);
    return;
  }
  if(!hasItem('spectroscopy_lens')){
    openPagedDialogue('Telescópio auxiliar',['A lente está trincada. Procure uma reposição no armário óptico do observatório.'],[{label:'Fechar',callback:hidePanel}]);
    return;
  }
  state.flags.telescope_repaired = true;
  audio.ok();
  refreshMissionProgress();
  saveProgress(true);
  openPagedDialogue(
    'Telescópio reparado',
    ['A nova lente foi encaixada. Linhas luminosas de gases nobres aparecem no visor em uma representação didática.'],
    [{label:'Concluir reparo',className:'good',callback:hidePanel}]
  );
}

function interactWorldObject(object){
  switch(object.type){
    case 'element_sample':
    case 'note':
    case 'research_notes':
    case 'research_log':
    case 'periodic_fragment':
    case 'emblem':
    case 'stable_core_piece':
    case 'maintenance_keycard':
      collectGenericObject(object);
      return;
    case 'mission_board':
      openMissionLog('active');
      return;
    case 'lab_terminal':
      if(!state.discoveredTerminals.includes(object.id)) state.discoveredTerminals.push(object.id);
      state.flags.terminal_inspected = true;
      refreshMissionProgress();
      saveProgress(true);
      openLab();
      return;
    case 'terminal':
      if(!state.discoveredTerminals.includes(object.id)) state.discoveredTerminals.push(object.id);
      saveProgress();
      openNotebook('logs');
      return;
    case 'cabinet':
      interactSupplyCabinet(object);
      return;
    case 'relay':
      if(!hasItem('replacement_fuse') || !hasItem('conductive_wire')){
        openPagedDialogue('Relé sem alimentação',['São necessários um fusível de reposição e um fio condutor. O armário e Bento oferecem recuperação segura.'],[{label:'Fechar',callback:hidePanel}]);
      }else{
        openRepairPuzzle();
      }
      return;
    case 'gate':
      handleGateInteraction(object);
      return;
    case 'gate_panel':
      if(state.flags.garden_gate_open){
        toast('Portão do Jardim Iônico já está aberto.');
      }else if(!hasItem('lab_keycard')){
        openPagedDialogue('Painel de acesso',['Cartão do laboratório necessário. O primeiro santuário faz parte da autorização.'],[{label:'Fechar',callback:hidePanel}]);
      }else{
        state.flags.garden_gate_open = true;
        if(!state.discoveredTerminals.includes(object.id)) state.discoveredTerminals.push(object.id);
        audio.ok();
        refreshMissionProgress();
        saveProgress(true);
        toast('Jardim Iônico desbloqueado.', 'good');
      }
      return;
    case 'charge_console':
      if(!hasItem('charge_manipulator')){
        openPagedDialogue('Painel de equilíbrio',['O sistema exige o Manipulador de Cargas concedido após a abertura do jardim.'],[{label:'Fechar',callback:hidePanel}]);
      }else{
        openChargePuzzle();
      }
      return;
    case 'charge_node':
      cycleChargeNode(object);
      return;
    case 'beacon':
      activateBeacon(object);
      return;
    case 'bridge_console':
      if(state.flags.bridge_open){
        toast('A ponte está energizada.');
      }else if(!hasItem('portable_battery')){
        openPagedDialogue('Terminal da ponte',['A bateria interna está descarregada. Uma bateria portátil pode alimentar o mecanismo sem ser consumida.'],[{label:'Fechar',callback:hidePanel}]);
      }else{
        state.flags.bridge_open = true;
        if(!state.discoveredTerminals.includes(object.id)) state.discoveredTerminals.push(object.id);
        awardOnce('puzzle:bridge_power',15,'Ponte energizada');
        audio.ok();
        refreshMissionProgress();
        saveProgress(true);
        toast('Ponte temporária estabilizada.', 'good');
      }
      return;
    case 'iso_console':
      openIsoelectronicGatePuzzle();
      return;
    case 'ridge_station':
      openRidgeStationPuzzle(object);
      return;
    case 'shrine':
      openQuizById(object.data.shrineId,object);
      return;
    case 'station_shell':
      openShellVisualizer();
      return;
    case 'station_compare':
      openRadiusComparison();
      return;
    case 'station_ion':
      openLab();
      return;
    case 'station_iso':
      openIsoGeneric(10);
      return;
    case 'station_trend':
      if(!missionCompleted('main_05')){
        openPagedDialogue('Explorador bloqueado',['Conquiste primeiro o Santuário Tendências do Raio.'],[{label:'Fechar',callback:hidePanel}]);
      }else{
        openPeriodicExplorer();
      }
      return;
    case 'station_analyzer':
      if(!hasItem('electron_scanner')){
        openPagedDialogue('Analisador bloqueado',['Recupere as três amostras centrais para desbloquear o Scanner de Elétrons e esta estação.'],[{label:'Fechar',callback:hidePanel}]);
      }else{
        openSampleAnalyzer();
      }
      return;
    case 'radius_station':
      openRadiusOrderPuzzle();
      return;
    case 'crate':
      pushCrate(object);
      return;
    case 'reset_terminal':
      openConfirm('Resetar blocos condutores','Os dois blocos voltarão às posições iniciais. Nenhuma missão será perdida.',() => {
        resetCrates();
        hidePanel();
      });
      return;
    case 'broken_sign':
      repairBrokenSign(object);
      return;
    case 'sign':
      openPagedDialogue('Placa do Campus Periodicum',[object.data.text],[{label:'Fechar',callback:hidePanel}]);
      return;
    case 'telescope':
      interactTelescope();
      return;
    case 'campus_core':
      openCampusCorePuzzle();
      return;
    case 'discovery_map':
      openNotebook('elements');
      return;
    case 'firefly_signal':
    case 'crystal_positive':
    case 'crystal_negative':
      openPagedDialogue('Objeto de pesquisa',['Use Q com o Scanner de Elétrons para registrar uma leitura completa.'],[{label:'Fechar',callback:hidePanel}]);
      return;
    default:
      openPagedDialogue('Objeto do campus',['O equipamento está estável e não requer uma ação neste momento.'],[{label:'Fechar',callback:hidePanel}]);
  }
}

function tryInteract(){
  if(panelOpen() || !gameStarted) return;
  const target = nearestTarget('interact',29);
  if(!target){
    toast('Nada para interagir ao alcance.');
    return;
  }
  audio.ensure();
  if(target.kind === 'npc') openNPCDialogue(target.entity);
  else interactWorldObject(target.object);
}

/* ---------- Registro de missões ---------- */

function missionStatusLabel(status){
  return {
    locked:'Bloqueada',
    available:'Disponível',
    active:'Ativa',
    completed:'Concluída'
  }[status] || status;
}

function missionCardHtml(mission){
  const progress = missionState(mission.id);
  const isTracked = state.trackedMission === mission.id;
  const objective = mission.stages[progress.stage]?.text || mission.description;
  const trackButton = progress.status === 'active'
    ? `<button class="btn" type="button" data-track-mission="${escapeHtml(mission.id)}">${isTracked ? '✓ Rastreando' : 'Rastrear'}</button>`
    : '';
  return `
    <article class="quest-card ${escapeHtml(progress.status)}">
      <div class="row" style="justify-content:space-between">
        <h3>${escapeHtml(mission.title)}</h3>
        <span class="pill">${mission.type === 'main' ? 'Principal' : 'Paralela'}</span>
      </div>
      <p class="small">${escapeHtml(mission.description)}</p>
      <div class="quest-meta">
        <span class="pill">${escapeHtml(missionStatusLabel(progress.status))}</span>
        <span class="pill">Etapa ${progress.stage + 1}/${mission.stages.length}</span>
        ${isTracked ? '<span class="pill tracked">Objetivo rastreado</span>' : ''}
      </div>
      <p><b>Objetivo:</b> ${escapeHtml(objective)}</p>
      <div class="foot">${trackButton}</div>
    </article>
  `;
}

function discoverySummaryHtml(){
  const regionItems = REGIONS.map(region => {
    const discovered = state.discoveredRegions.includes(region.id);
    return `<div class="discovery-card">${discovered ? '◆' : '◇'} ${escapeHtml(discovered ? region.name : 'Região não descoberta')}</div>`;
  }).join('');
  return `
    <div class="grid wide">
      <div class="discovery-card"><b>Amostras H–Ar</b><br>${state.samples.length}/18</div>
      <div class="discovery-card"><b>Registros de pesquisa</b><br>${state.readLogs.length}/6</div>
      <div class="discovery-card"><b>Fragmentos periódicos</b><br>${state.periodicFragments.length}/6</div>
      <div class="discovery-card"><b>Emblemas secretos</b><br>${state.emblems.length}/4</div>
      <div class="discovery-card"><b>Peças de núcleo estável</b><br>${state.stableCorePieces.length}/3</div>
    </div>
    <div class="sep"></div>
    <h3>Regiões</h3>
    <div class="grid wide">${regionItems}</div>
  `;
}

function openMissionLog(tab='active'){
  state.tutorials.missions = true;
  const validTabs = ['active','completed','main','side','discoveries'];
  if(!validTabs.includes(tab)) tab = 'active';

  let missions = [];
  if(tab === 'active') missions = ALL_MISSIONS.filter(mission => ['active','available'].includes(missionState(mission.id).status));
  if(tab === 'completed') missions = ALL_MISSIONS.filter(mission => missionState(mission.id).status === 'completed');
  if(tab === 'main') missions = MAIN_MISSIONS.filter(mission => missionState(mission.id).status !== 'locked');
  if(tab === 'side') missions = SIDE_MISSIONS.filter(mission => missionState(mission.id).status !== 'locked');

  const tabs = [
    ['active','Ativas'],
    ['completed','Concluídas'],
    ['main','Principais'],
    ['side','Paralelas'],
    ['discoveries','Descobertas']
  ].map(([id,label]) => `<button class="tab ${tab === id ? 'active' : ''}" type="button" data-mission-tab="${id}">${label}</button>`).join('');

  const body = tab === 'discoveries'
    ? discoverySummaryHtml()
    : missions.length
      ? `<div class="col">${missions.map(missionCardHtml).join('')}</div>`
      : '<p class="muted">Nenhuma missão nesta seção.</p>';

  showPanel(`
    <h2 id="panelTitle">Registro de Missões <span class="small">J</span></h2>
    <div class="tabs">${tabs}</div>
    ${body}
  `,{
    kind:'missions',
    onMount(){
      uicontent.querySelectorAll('[data-mission-tab]').forEach(button => {
        button.addEventListener('click',() => openMissionLog(button.dataset.missionTab));
      });
      uicontent.querySelectorAll('[data-track-mission]').forEach(button => {
        button.addEventListener('click',() => {
          state.trackedMission = button.dataset.trackMission;
          saveProgress();
          updateHUD();
          openMissionLog(tab);
        });
      });
    }
  });
  saveProgress();
}

/* ---------- Inventário e Caderno de Pesquisa ---------- */

function drawItemIcon(canvas, item){
  const iconContext = canvas.getContext('2d');
  iconContext.imageSmoothingEnabled = false;
  iconContext.clearRect(0,0,24,24);
  iconContext.fillStyle = '#0b0f1c';
  iconContext.fillRect(0,0,24,24);
  iconContext.fillStyle = item.color;
  if(item.kind.includes('Amostra')){
    iconContext.fillRect(7,3,10,17);
    iconContext.fillStyle = '#0b1b28';
    iconContext.fillRect(9,6,6,8);
    iconContext.fillStyle = '#dff8ff';
    iconContext.fillRect(10,8,4,2);
  }else if(item.kind.includes('Ferramenta')){
    iconContext.fillRect(4,5,16,12);
    iconContext.fillStyle = '#0b1b28';
    iconContext.fillRect(7,7,10,6);
    iconContext.fillStyle = '#e7eaf6';
    iconContext.fillRect(9,9,6,2);
    iconContext.fillStyle = '#565e78';
    iconContext.fillRect(9,18,6,3);
  }else if(item.kind.includes('Colecionável') || item.kind === 'Segredo'){
    iconContext.fillRect(8,3,8,18);
    iconContext.fillRect(3,8,18,8);
    iconContext.fillStyle = '#fff3bf';
    iconContext.fillRect(10,7,4,10);
  }else{
    iconContext.fillRect(4,6,16,13);
    iconContext.fillStyle = '#172033';
    iconContext.fillRect(7,9,10,3);
    iconContext.fillStyle = '#e7eaf6';
    iconContext.fillRect(16,8,2,7);
  }
}

function openInventory(){
  state.tutorials.inventory = true;
  const owned = ITEMS.filter(item => inventoryCount(item.id) > 0);
  const cards = owned.map(item => `
    <article class="item-card">
      <canvas class="item-icon" width="24" height="24" data-item-icon="${escapeHtml(item.id)}" aria-hidden="true"></canvas>
      <div>
        <div class="item-name">${escapeHtml(item.name)} <span class="item-qty">×${inventoryCount(item.id)}</span></div>
        <div class="small">${escapeHtml(item.kind)}${item.key ? ' · protegido' : ''}</div>
        <p class="small">${escapeHtml(item.description)}</p>
      </div>
    </article>
  `).join('');

  showPanel(`
    <h2 id="panelTitle">Inventário <span class="small">I</span></h2>
    <div class="row">
      <span class="pill">${owned.length} tipos de item</span>
      <span class="pill">${state.samples.length}/18 amostras catalogadas</span>
      <button class="btn primary" id="openNotebookBtn" type="button">Abrir Caderno de Pesquisa</button>
    </div>
    <div class="sep"></div>
    <div class="inventory-grid">${cards || '<p class="muted">O inventário está vazio.</p>'}</div>
  `,{
    kind:'inventory',
    onMount(){
      uicontent.querySelectorAll('[data-item-icon]').forEach(canvas => {
        const item = ITEM_BY_ID[canvas.dataset.itemIcon];
        if(item) drawItemIcon(canvas,item);
      });
      document.getElementById('openNotebookBtn').addEventListener('click',() => openNotebook('elements'));
    }
  });
  saveProgress();
}

function elementNotebookHtml(){
  return `
    <div class="row">
      <span class="pill">${state.samples.length}/18 cápsulas</span>
      <span class="small">Raios neutros aproximados para uso didático.</span>
    </div>
    <div class="sep"></div>
    <div class="element-grid">
      ${ELEMENTS.map(element => {
        const discovered = state.samples.includes(element.symbol);
        if(!discovered) return '<article class="element-card locked">? · amostra não descoberta</article>';
        return `
          <article class="element-card">
            <div class="row" style="justify-content:space-between">
              <span class="element-symbol">${element.symbol}</span>
              <span class="pill">Z=${element.z}</span>
            </div>
            <b>${escapeHtml(element.name)}</b>
            <div class="small">Camadas ${element.shells.join('–')} · ≈ ${element.radius} pm</div>
            <p class="small">${escapeHtml(element.fact)}</p>
            <div class="small accent">${escapeHtml(element.location)}</div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function ionsNotebookHtml(){
  const ions = [
    {symbol:'Li',charge:1},
    {symbol:'O',charge:-2},
    {symbol:'F',charge:-1},
    {symbol:'Na',charge:1},
    {symbol:'Mg',charge:2},
    {symbol:'Al',charge:3},
    {symbol:'Cl',charge:-1}
  ];
  return `
    <p class="small">Modelo simplificado: elétrons = Z − carga. O raio iônico abaixo é uma aproximação interna do simulador, não um valor experimental exato.</p>
    <div class="grid wide">
      ${ions.map(ion => {
        const element = ELEMENT_BY_SYMBOL[ion.symbol];
        const unlocked = state.samples.includes(ion.symbol) || state.shrines.ions || state.shrines.iso;
        if(!unlocked) return '<div class="discovery-card muted">Íon ainda não registrado</div>';
        const electrons = element.z - ion.charge;
        return `
          <div class="discovery-card">
            <b>${element.symbol}<sup>${ion.charge > 0 ? `${ion.charge}+` : `${Math.abs(ion.charge)}−`}</sup></b>
            <div>${electrons} e⁻ · camadas ${electronsToShells(electrons).join('–')}</div>
            <div class="small">Raio didático ≈ ${ionRadiusApprox(element.z,ion.charge)} pm</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function logsNotebookHtml(){
  const logObjects = worldObjects.filter(object => object.type === 'research_log');
  return `
    <div class="col">
      ${logObjects.map(object => {
        const read = state.readLogs.includes(object.id);
        return `
          <article class="discovery-card">
            <b>${read ? escapeHtml(object.data.title) : 'Registro não encontrado'}</b>
            <p class="small">${read ? escapeHtml(object.data.text) : 'Explore mesas, acampamentos e terminais opcionais.'}</p>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function comparisonsNotebookHtml(){
  const entries = [
    ['Tendências periódicas',state.shrines.trend,'O raio tende a aumentar para baixo e para a esquerda.'],
    ['Cátions e ânions',state.shrines.ions,'Cátions tendem a ser menores; ânions, maiores que o átomo neutro correspondente.'],
    ['Série isoeletrônica',state.shrines.iso || state.puzzles.isoelectronic_gate,'Com o mesmo número de elétrons, maior Z tende a produzir menor raio.'],
    ['Blindagem eletrônica',state.shrines.zeff || state.beacons.length === 3,'Camadas internas reduzem a atração sentida pelos elétrons externos.'],
    ['Ordem de raios',state.puzzles.radius_order || state.shrines.mix,'Comparações precisam considerar período, grupo, carga e contagem eletrônica.']
  ];
  return `<div class="col">${entries.map(([title,complete,text]) => `
    <article class="discovery-card">
      <b>${complete ? '✔' : '◇'} ${escapeHtml(title)}</b>
      <p class="small">${complete ? escapeHtml(text) : 'Complete a atividade associada para registrar a explicação.'}</p>
    </article>
  `).join('')}</div>`;
}

function openNotebook(tab='elements'){
  const tabs = [
    ['elements','Elementos'],
    ['ions','Íons'],
    ['logs','Registros'],
    ['comparisons','Comparações']
  ];
  if(!tabs.some(([id]) => id === tab)) tab = 'elements';
  const content = {
    elements:elementNotebookHtml,
    ions:ionsNotebookHtml,
    logs:logsNotebookHtml,
    comparisons:comparisonsNotebookHtml
  }[tab]();
  showPanel(`
    <h2 id="panelTitle">Caderno de Pesquisa</h2>
    <div class="tabs">
      ${tabs.map(([id,label]) => `<button class="tab ${id === tab ? 'active' : ''}" type="button" data-notebook-tab="${id}">${label}</button>`).join('')}
    </div>
    ${content}
  `,{
    kind:'notebook',
    onMount(){
      uicontent.querySelectorAll('[data-notebook-tab]').forEach(button => {
        button.addEventListener('click',() => openNotebook(button.dataset.notebookTab));
      });
    }
  });
}

/* ---------- Mapa esquemático ---------- */

function targetWorldPosition(targetId){
  const object = worldObjectById[targetId];
  if(object){
    const rect = objectRect(object);
    return {x:rect.x + rect.w/2,y:rect.y + rect.h/2};
  }
  const npc = npcEntityById[targetId];
  if(npc) return {x:npc.cx,y:npc.cy};
  return null;
}

function regionForWorldPosition(x, y){
  return REGIONS.find(region => pointInRegion(x,y,region));
}

function drawMapCanvas(canvas){
  const mapContext = canvas.getContext('2d');
  mapContext.imageSmoothingEnabled = false;
  const scale = 4;
  const offsetX = 38;
  const offsetY = 20;
  mapContext.fillStyle = '#080b13';
  mapContext.fillRect(0,0,canvas.width,canvas.height);

  for(const region of REGIONS){
    const discovered = state.discoveredRegions.includes(region.id);
    mapContext.fillStyle = discovered ? region.color : '#111522';
    mapContext.fillRect(offsetX + region.x*scale,offsetY + region.y*scale,region.w*scale,region.h*scale);
    mapContext.strokeStyle = discovered ? '#57617e' : '#262b40';
    mapContext.strokeRect(offsetX + region.x*scale+.5,offsetY + region.y*scale+.5,region.w*scale-1,region.h*scale-1);
    mapContext.fillStyle = discovered ? '#d6dced' : '#4b5268';
    mapContext.font = '9px monospace';
    mapContext.fillText(discovered ? region.name : '???',offsetX + region.x*scale + 4,offsetY + region.y*scale + 12);
  }

  for(const object of worldObjects){
    if(object.type !== 'shrine') continue;
    const region = regionForWorldPosition(object.x,object.y);
    if(region && !state.discoveredRegions.includes(region.id)) continue;
    mapContext.fillStyle = state.shrines[object.data.shrineId] ? '#76e39f' : '#6cf';
    mapContext.fillRect(offsetX + object.tx*scale - 2,offsetY + object.ty*scale - 2,5,5);
  }

  for(const terminalId of state.discoveredTerminals){
    const terminal = worldObjectById[terminalId];
    if(!terminal) continue;
    mapContext.fillStyle = '#ffd66b';
    mapContext.fillRect(offsetX + terminal.tx*scale - 1,offsetY + terminal.ty*scale - 1,3,3);
  }

  for(const npc of npcEntities){
    const region = regionForWorldPosition(npc.cx,npc.cy);
    if(region && !state.discoveredRegions.includes(region.id)) continue;
    mapContext.fillStyle = '#e7eaf6';
    mapContext.fillRect(offsetX + npc.cx/TILE*scale - 1,offsetY + npc.cy/TILE*scale - 1,3,3);
  }

  const tracked = MISSION_BY_ID[state.trackedMission];
  const trackedProgress = tracked && missionState(tracked.id);
  if(tracked && trackedProgress?.status === 'active'){
    const targetId = tracked.stages[trackedProgress.stage].target;
    const target = targetWorldPosition(targetId);
    const region = target && regionForWorldPosition(target.x,target.y);
    if(target && (!region || state.discoveredRegions.includes(region.id))){
      mapContext.strokeStyle = '#ffd66b';
      mapContext.lineWidth = 2;
      mapContext.strokeRect(offsetX + target.x/TILE*scale - 4,offsetY + target.y/TILE*scale - 4,8,8);
    }
  }

  mapContext.fillStyle = '#fff';
  mapContext.fillRect(offsetX + player.cx/TILE*scale - 2,offsetY + player.cy/TILE*scale - 2,5,5);
  mapContext.fillStyle = '#6cf';
  mapContext.fillRect(offsetX + player.cx/TILE*scale - 1,offsetY + player.cy/TILE*scale - 1,3,3);

  mapContext.fillStyle = '#aeb7cc';
  mapContext.font = '10px monospace';
  mapContext.fillText('■ jogador   □ objetivo   ◆ santuário   · terminal   ▪ NPC',38,canvas.height-12);
}

function openMap(){
  state.tutorials.map = true;
  showPanel(`
    <h2 id="panelTitle">Mapa do Campus Periodicum <span class="small">M</span></h2>
    <p class="small">Regiões não visitadas permanecem ocultas. Colecionáveis secretos não aparecem no mapa.</p>
    <div class="map-shell"><canvas id="mapCanvas" width="720" height="390" aria-label="Mapa esquemático das regiões descobertas"></canvas></div>
  `,{
    kind:'map',
    onMount(){
      drawMapCanvas(document.getElementById('mapCanvas'));
    }
  });
  saveProgress();
}

/* ---------- Teoria preservada ---------- */

function openTheory(){
  showPanel(`
    <h2 id="panelTitle">Ficha de Química — Raio Atômico</h2>
    <ul class="theory">
      <li><b>Raio atômico:</b> distância efetiva do núcleo à borda da nuvem eletrônica em uma definição operacional.</li>
      <li><b>Tendências:</b> aumenta <u>para baixo</u> no grupo, pelas novas camadas, e <u>para a esquerda</u> no período, pela menor atração nuclear efetiva comparativa.</li>
      <li><b>Íons:</b> cátion perde elétrons e tende a ficar <b>menor</b>; ânion ganha elétrons e tende a ficar <b>maior</b>.</li>
      <li><b>Série isoeletrônica:</b> com a mesma contagem de elétrons, a espécie com maior Z tende a ter <b>menor raio</b>.</li>
      <li><b>Blindagem:</b> elétrons internos reduzem parcialmente a atração sentida pelos elétrons mais externos.</li>
      <li><b>Modelo 2–8–8:</b> simplificação pedagógica usada até o argônio neste jogo.</li>
    </ul>
    <div class="sep"></div>
    <p class="small">Valores de raio e a fórmula iônica deste projeto são aproximações didáticas, não dados experimentais universais.</p>
  `,{kind:'theory'});
}

/* ---------- Laboratório: simuladores preservados e expandidos ---------- */

function drawAtomDiagram(graphics, centerX, centerY, visualRadius, shells, color, label, animate=true){
  graphics.fillStyle = '#22283a';
  graphics.beginPath();
  graphics.arc(centerX,centerY,8,0,Math.PI*2);
  graphics.fill();
  const radii = [18,32,46];
  graphics.strokeStyle = '#344269';
  graphics.lineWidth = 1;
  for(let index=0; index<shells.length; index++){
    if(shells[index] <= 0) continue;
    graphics.beginPath();
    graphics.arc(centerX,centerY,radii[index],0,Math.PI*2);
    graphics.stroke();
  }

  const animationTime = animate && !state.settings.reducedMotion ? performance.now()/1000 : 0;
  for(let shellIndex=0; shellIndex<shells.length; shellIndex++){
    const count = shells[shellIndex];
    const radius = radii[shellIndex];
    for(let electron=0; electron<count; electron++){
      const angle = animationTime * (.5 + shellIndex * .3) + electron / Math.max(1,count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      graphics.fillStyle = '#d9eeff';
      graphics.fillRect(Math.round(x-1),Math.round(y-1),2,2);
    }
  }

  graphics.strokeStyle = color;
  graphics.lineWidth = 2;
  graphics.beginPath();
  graphics.arc(centerX,centerY,visualRadius,0,Math.PI*2);
  graphics.stroke();
  graphics.fillStyle = '#d8deef';
  graphics.font = '12px monospace';
  const lines = label.split('\n');
  lines.forEach((line,index) => graphics.fillText(line,centerX-45,centerY+visualRadius+16+index*14));
}

function openLab(initialZ=11, initialCharge=1){
  let z = clamp(Math.round(initialZ),1,18);
  let charge = Math.round(initialCharge);
  let animate = !state.settings.reducedMotion;

  const chargeBounds = () => ({
    min:Math.max(-3,z-18),
    max:Math.min(4,z)
  });
  const bounds = chargeBounds();
  charge = clamp(charge,bounds.min,bounds.max);

  showPanel(`
    <h2 id="panelTitle">Laboratório: Visualizador de Raio Atômico & Íons</h2>
    <div class="row">
      <div class="col">
        <label for="zRange">Elemento: <b id="labElementLabel">${symbolOf(z)}</b> — Z=<span id="labZLabel">${z}</span></label>
        <input id="zRange" name="atomic_number" type="range" min="1" max="18" value="${z}">
        <label for="qRange">Carga: <b id="labChargeLabel">${formatCharge(charge)}</b> <span class="small">(q&gt;0 cátion; q&lt;0 ânion)</span></label>
        <input id="qRange" name="ion_charge" type="range" min="${bounds.min}" max="${bounds.max}" value="${charge}">
        <div class="pill">Elétrons: <b id="labElectronCount">${z-charge}</b></div>
        <div id="labRadiusOutput"></div>
        <div class="row">
          <button class="btn" id="btnIso" type="button">Série isoeletrônica: 10 e⁻</button>
          <button class="btn" id="btnIsoAny" type="button">E variável</button>
        </div>
        <div class="row">
          <button class="btn" id="btnExamples" type="button">Exemplos rápidos</button>
          <button class="btn" id="btnResetLab" type="button">Reset: Na⁺</button>
          <button class="btn" id="btnAnimLab" type="button">${animate ? '⏸ Pausar' : '▶ Animar'}</button>
        </div>
      </div>
      <div class="col" style="flex:1;min-width:min(420px,88vw)">
        <canvas id="labviz" width="520" height="280" style="width:100%;height:auto;background:#0b0f1c;outline:1px solid #2a2f49" aria-label="Comparação visual entre átomo neutro e íon"></canvas>
      </div>
    </div>
    <div class="sep"></div>
    <p class="small">Modelo visual didático com valores aproximados. Distribuição eletrônica simplificada 2–8–8 até Ar.</p>
  `,{
    kind:'lab',
    onMount(){
      const canvas = document.getElementById('labviz');
      const graphics = canvas.getContext('2d');
      const zRange = document.getElementById('zRange');
      const chargeRange = document.getElementById('qRange');

      const updateLabels = () => {
        const currentBounds = chargeBounds();
        chargeRange.min = currentBounds.min;
        chargeRange.max = currentBounds.max;
        charge = clamp(charge,currentBounds.min,currentBounds.max);
        chargeRange.value = charge;
        document.getElementById('labElementLabel').textContent = symbolOf(z);
        document.getElementById('labZLabel').textContent = z;
        document.getElementById('labChargeLabel').textContent = formatCharge(charge);
        document.getElementById('labElectronCount').textContent = z-charge;
        document.getElementById('labRadiusOutput').innerHTML =
          `Raio neutro ≈ <b>${NEUTRAL_PM[z]} pm</b> · raio do íon ≈ <b>${ionRadiusApprox(z,charge)} pm</b>`;
      };

      const draw = () => {
        if(!document.getElementById('labviz')) return;
        graphics.imageSmoothingEnabled = false;
        graphics.fillStyle = '#0b0f1c';
        graphics.fillRect(0,0,canvas.width,canvas.height);
        graphics.fillStyle = '#10182b';
        graphics.fillRect(0,0,canvas.width,70);
        const neutralRadius = NEUTRAL_PM[z] || 100;
        const ionRadius = ionRadiusApprox(z,charge);
        const maxRadius = Math.max(neutralRadius,ionRadius,40);
        const scale = 96/maxRadius;
        graphics.fillStyle = '#a8c8d8';
        graphics.font = '12px monospace';
        graphics.fillText('neutro',112,22);
        graphics.fillText('íon',325,22);
        graphics.fillStyle = '#2a2f49';
        graphics.fillRect(70,35,170,6);
        graphics.fillRect(290,35,170,6);
        graphics.fillStyle = '#6cf';
        graphics.fillRect(70,35,neutralRadius/maxRadius*170,6);
        graphics.fillStyle = charge < 0 ? '#ffd66b' : '#76e39f';
        graphics.fillRect(290,35,ionRadius/maxRadius*170,6);
        drawAtomDiagram(graphics,155,158,neutralRadius*scale,electronsToShells(z),'#6cf',`${symbolOf(z)} (0)\n${neutralRadius} pm`,animate);
        drawAtomDiagram(graphics,370,158,ionRadius*scale,electronsToShells(z-charge),charge < 0 ? '#ffd66b' : '#76e39f',`${symbolOf(z)} (${formatCharge(charge)})\n${ionRadius} pm`,animate);
      };

      const animationLoop = () => {
        if(activePanelKind !== 'lab' || !document.getElementById('labviz')) return;
        draw();
        if(animate) labAnimId = requestAnimationFrame(animationLoop);
      };

      zRange.addEventListener('input',() => {
        z = Number(zRange.value);
        updateLabels();
        draw();
      });
      chargeRange.addEventListener('input',() => {
        charge = Number(chargeRange.value);
        updateLabels();
        draw();
      });
      document.getElementById('btnResetLab').addEventListener('click',() => openLab(11,1));
      document.getElementById('btnIso').addEventListener('click',() => openIsoGeneric(10));
      document.getElementById('btnIsoAny').addEventListener('click',() => openIsoGeneric(z-charge));
      document.getElementById('btnExamples').addEventListener('click',openLabExamples);
      document.getElementById('btnAnimLab').addEventListener('click',() => {
        animate = !animate;
        document.getElementById('btnAnimLab').textContent = animate ? '⏸ Pausar' : '▶ Animar';
        if(animate && !labAnimId) labAnimId = requestAnimationFrame(animationLoop);
        if(!animate && labAnimId){
          cancelAnimationFrame(labAnimId);
          labAnimId = 0;
          draw();
        }
      });
      updateLabels();
      draw();
      if(animate) labAnimId = requestAnimationFrame(animationLoop);
    }
  });
}

function openLabExamples(){
  const examples = [
    {label:'Li → Li⁺',z:3,q:1},
    {label:'Mg → Mg²⁺',z:12,q:2},
    {label:'Al → Al³⁺',z:13,q:3},
    {label:'O → O²⁻',z:8,q:-2},
    {label:'F → F⁻',z:9,q:-1},
    {label:'Cl → Cl⁻',z:17,q:-1},
    {label:'Na → Na⁺',z:11,q:1},
    {label:'Si → Si⁴⁺',z:14,q:4}
  ];
  showPanel(`
    <h2 id="panelTitle">Exemplos rápidos</h2>
    <div class="grid">${examples.map((example,index) => `<button class="btn" type="button" data-example="${index}">${example.label}</button>`).join('')}</div>
    <div class="sep"></div>
    <div class="foot"><button class="btn" id="backToLab" type="button">Voltar ao LAB</button></div>
  `,{
    kind:'examples',
    onMount(){
      uicontent.querySelectorAll('[data-example]').forEach(button => {
        button.addEventListener('click',() => {
          const example = examples[Number(button.dataset.example)];
          openLab(example.z,example.q);
        });
      });
      document.getElementById('backToLab').addEventListener('click',() => openLab());
    }
  });
}

function openIsoGeneric(initialElectrons=10){
  let electrons = clamp(Math.round(initialElectrons || 10),2,18);
  const renderList = () => {
    const items = [];
    for(let z=1; z<=18; z++){
      const charge = z - electrons;
      if(charge >= -3 && charge <= 4){
        items.push({z,charge,radius:ionRadiusApprox(z,charge),symbol:symbolOf(z)});
      }
    }
    items.sort((a,b) => b.radius - a.radius);
    const output = document.getElementById('isoList');
    if(output) output.innerHTML = items.map(item => `
      <div class="discovery-card">
        <b>${item.symbol}<sup>${item.charge === 0 ? '0' : item.charge > 0 ? `${item.charge}+` : `${Math.abs(item.charge)}−`}</sup></b>
        · Z=${item.z} · <b>≈ ${item.radius} pm</b>
      </div>
    `).join('');
  };
  showPanel(`
    <h2 id="panelTitle">Construtor de série isoeletrônica</h2>
    <label for="isoElectronRange">Número total de elétrons: <b id="isoElectronValue">${electrons}</b></label>
    <input id="isoElectronRange" name="isoelectronic_electrons" type="range" min="2" max="18" value="${electrons}">
    <p class="small">Ordem exibida do maior para o menor raio aproximado. Cargas limitadas ao intervalo didático válido do laboratório.</p>
    <div id="isoList" class="grid wide"></div>
    <div class="foot"><button class="btn" id="backToLab" type="button">Voltar ao LAB</button></div>
  `,{
    kind:'iso-builder',
    onMount(){
      const range = document.getElementById('isoElectronRange');
      range.addEventListener('input',() => {
        electrons = Number(range.value);
        document.getElementById('isoElectronValue').textContent = electrons;
        renderList();
      });
      document.getElementById('backToLab').addEventListener('click',() => openLab());
      renderList();
    }
  });
}

function openRadiusComparison(){
  let zA = 3;
  let zB = 9;
  let qA = 0;
  let qB = 0;
  const render = () => {
    const elementA = ELEMENTS[zA-1];
    const elementB = ELEMENTS[zB-1];
    const radiusA = ionRadiusApprox(zA,qA);
    const radiusB = ionRadiusApprox(zB,qB);
    const max = Math.max(radiusA,radiusB,40);
    document.getElementById('comparisonOutput').innerHTML = `
      <div class="discovery-card"><b>${elementA.symbol} (${formatCharge(qA)})</b> · ${zA-qA} e⁻ · ≈ ${radiusA} pm
        <div class="meter"><span style="width:${radiusA/max*100}%"></span></div>
      </div>
      <div class="discovery-card"><b>${elementB.symbol} (${formatCharge(qB)})</b> · ${zB-qB} e⁻ · ≈ ${radiusB} pm
        <div class="meter"><span style="width:${radiusB/max*100}%"></span></div>
      </div>
      <p class="small">${radiusA === radiusB ? 'Os valores didáticos coincidem.' : radiusA > radiusB ? `${elementA.symbol} aparece maior neste modelo.` : `${elementB.symbol} aparece maior neste modelo.`}</p>
    `;
    document.getElementById('compareALabel').textContent = elementA.symbol;
    document.getElementById('compareBLabel').textContent = elementB.symbol;
  };
  showPanel(`
    <h2 id="panelTitle">Estação de comparação de raios</h2>
    <div class="grid wide">
      <div class="puzzle-board">
        <label for="compareA">Espécie A: <b id="compareALabel">Li</b></label>
        <input id="compareA" name="comparison_element_a" type="range" min="1" max="18" value="${zA}">
        <label for="compareChargeA">Carga A</label>
        <input id="compareChargeA" name="comparison_charge_a" type="range" min="-3" max="4" value="${qA}">
      </div>
      <div class="puzzle-board">
        <label for="compareB">Espécie B: <b id="compareBLabel">F</b></label>
        <input id="compareB" name="comparison_element_b" type="range" min="1" max="18" value="${zB}">
        <label for="compareChargeB">Carga B</label>
        <input id="compareChargeB" name="comparison_charge_b" type="range" min="-3" max="4" value="${qB}">
      </div>
    </div>
    <div id="comparisonOutput" class="col" style="margin-top:10px"></div>
    <p class="small">A estação usa a mesma aproximação didática do terminal original.</p>
  `,{
    kind:'comparison',
    onMount(){
      const controls = {
        compareA:value => {zA=value;qA=clamp(qA,Math.max(-3,zA-18),Math.min(4,zA));},
        compareB:value => {zB=value;qB=clamp(qB,Math.max(-3,zB-18),Math.min(4,zB));},
        compareChargeA:value => {qA=clamp(value,Math.max(-3,zA-18),Math.min(4,zA));},
        compareChargeB:value => {qB=clamp(value,Math.max(-3,zB-18),Math.min(4,zB));}
      };
      for(const [id,callback] of Object.entries(controls)){
        document.getElementById(id).addEventListener('input',event => {
          callback(Number(event.target.value));
          render();
        });
      }
      render();
    }
  });
}

function drawShellVisualizer(canvas, z){
  const graphics = canvas.getContext('2d');
  graphics.imageSmoothingEnabled = false;
  graphics.fillStyle = '#0b0f1c';
  graphics.fillRect(0,0,canvas.width,canvas.height);
  drawAtomDiagram(graphics,canvas.width/2,canvas.height/2-8,76,electronsToShells(z),'#6cf',`${symbolOf(z)} · ${electronsToShells(z).join('–')}`,false);
}

function openShellVisualizer(){
  let z = 13;
  showPanel(`
    <h2 id="panelTitle">Visualizador de camadas eletrônicas</h2>
    <label for="shellElementRange">Elemento: <b id="shellElementLabel">Al</b> · Z=<span id="shellZLabel">13</span></label>
    <input id="shellElementRange" name="shell_visualizer_element" type="range" min="1" max="18" value="13">
    <div class="row">
      <canvas id="shellCanvas" width="360" height="260" style="width:min(360px,82vw);height:auto;background:#0b0f1c;outline:1px solid #2a2f49"></canvas>
      <div>
        <div class="pill">Distribuição: <b id="shellDistributionLabel">2–8–3</b></div>
        <p class="small">Preenchimento simplificado até Ar: primeira camada comporta 2; segunda, 8; terceira, 8.</p>
        <button class="btn primary" id="openShellTraining" type="button">Treinar distribuição</button>
      </div>
    </div>
  `,{
    kind:'shell-visualizer',
    onMount(){
      const range = document.getElementById('shellElementRange');
      const canvas = document.getElementById('shellCanvas');
      const update = () => {
        z = Number(range.value);
        document.getElementById('shellElementLabel').textContent = symbolOf(z);
        document.getElementById('shellZLabel').textContent = z;
        document.getElementById('shellDistributionLabel').textContent = electronsToShells(z).join('–');
        drawShellVisualizer(canvas,z);
      };
      range.addEventListener('input',update);
      document.getElementById('openShellTraining').addEventListener('click',openShellDistributionPuzzle);
      update();
    }
  });
}

function openPeriodicExplorer(){
  let leftZ = 11;
  let rightZ = 17;
  const render = () => {
    const left = ELEMENTS[leftZ-1];
    const right = ELEMENTS[rightZ-1];
    const result = left.radius > right.radius ? `${left.symbol} é maior` : left.radius < right.radius ? `${right.symbol} é maior` : 'Valores iguais';
    document.getElementById('periodicExplorerOutput').innerHTML = `
      <div class="row">
        <span class="pill">${left.symbol}: ≈ ${left.radius} pm</span>
        <span class="pill">${right.symbol}: ≈ ${right.radius} pm</span>
        <span class="pill good-text">${result}</span>
      </div>
      <p class="small">Ao comparar elementos de um mesmo período, a tendência geral é diminuir o raio da esquerda para a direita.</p>
    `;
    document.getElementById('periodicLeftLabel').textContent = left.symbol;
    document.getElementById('periodicRightLabel').textContent = right.symbol;
  };
  showPanel(`
    <h2 id="panelTitle">Explorador de tendências periódicas</h2>
    <div class="grid wide">
      <div>
        <label for="periodicLeft">Elemento A: <b id="periodicLeftLabel">Na</b></label>
        <input id="periodicLeft" name="periodic_element_a" type="range" min="1" max="18" value="${leftZ}">
      </div>
      <div>
        <label for="periodicRight">Elemento B: <b id="periodicRightLabel">Cl</b></label>
        <input id="periodicRight" name="periodic_element_b" type="range" min="1" max="18" value="${rightZ}">
      </div>
    </div>
    <div class="puzzle-board" id="periodicExplorerOutput"></div>
    <div class="sep"></div>
    <div class="row">
      <span class="pill">Aumento geral: ↓ e ←</span>
      <span class="pill">Contração no período: →</span>
    </div>
  `,{
    kind:'periodic-explorer',
    onMount(){
      document.getElementById('periodicLeft').addEventListener('input',event => {leftZ=Number(event.target.value);render();});
      document.getElementById('periodicRight').addEventListener('input',event => {rightZ=Number(event.target.value);render();});
      render();
    }
  });
}

function openSampleAnalyzer(){
  const discovered = ELEMENTS.filter(element => state.samples.includes(element.symbol));
  showPanel(`
    <h2 id="panelTitle">Analisador de amostras</h2>
    <p class="small">Selecione uma cápsula coletada. O equipamento não inventa dados de amostras ainda ausentes.</p>
    <div class="grid">
      ${discovered.map(element => `<button class="btn" type="button" data-analyze="${element.symbol}">${element.symbol} · ${escapeHtml(element.name)}</button>`).join('') || '<p class="muted">Nenhuma amostra coletada.</p>'}
    </div>
    <div id="sampleAnalysis" class="puzzle-board" style="margin-top:10px">Aguardando cápsula.</div>
  `,{
    kind:'sample-analyzer',
    onMount(){
      uicontent.querySelectorAll('[data-analyze]').forEach(button => {
        button.addEventListener('click',() => {
          const element = ELEMENT_BY_SYMBOL[button.dataset.analyze];
          document.getElementById('sampleAnalysis').innerHTML = `
            <h3>${element.symbol} · ${escapeHtml(element.name)}</h3>
            <p>Z=${element.z} · ${element.z} elétrons no átomo neutro · camadas ${element.shells.join('–')}</p>
            <p>Raio neutro aproximado: <b>${element.radius} pm</b></p>
            <p class="small">${escapeHtml(element.fact)}</p>
          `;
        });
      });
    }
  });
}

/* ---------- Puzzles jogáveis e resetáveis ---------- */

function freshPuzzleState(puzzleId){
  return deepClone(PUZZLE_DEFAULTS[puzzleId]);
}

function completePuzzle(puzzleId, title, explanation, researchPoints=20){
  const firstCompletion = !state.puzzles[puzzleId];
  state.puzzles[puzzleId] = true;
  if(firstCompletion) awardOnce(`puzzle:${puzzleId}`,researchPoints,title);
  refreshMissionProgress();
  saveProgress(true);
  audio.ok();
  showPanel(`
    <h2 id="panelTitle">${escapeHtml(title)} — concluído</h2>
    <p class="good-text">✔ Sistema estabilizado.</p>
    <p>${escapeHtml(explanation)}</p>
    <div class="sep"></div>
    <div class="foot"><button class="btn good" id="puzzleDone" type="button">Voltar ao campus</button></div>
  `,{
    kind:'puzzle-result',
    onMount(){
      document.getElementById('puzzleDone').addEventListener('click',hidePanel);
    }
  });
}

function openRepairPuzzle(){
  let sequence = [];
  let feedback = 'Conecte os componentes na sequência segura.';
  const target = freshPuzzleState('lab_repair');
  const labels = {
    fuse:'1. Instalar fusível',
    wire:'2. Conectar fio',
    switch:'3. Liberar chave'
  };

  const render = () => {
    showPanel(`
      <h2 id="panelTitle">Reparo do relé do laboratório</h2>
      <p>Organize a alimentação sem sobrecarregar o circuito.</p>
      <div class="puzzle-board">
        <div class="row">
          ${Object.entries(labels).map(([id,label]) => `<button class="btn" type="button" data-repair-part="${id}">${label}</button>`).join('')}
        </div>
        <div class="sep"></div>
        <p><b>Sequência:</b> ${sequence.map(id => labels[id]).join(' → ') || 'vazia'}</p>
        <p class="small">${escapeHtml(feedback)}</p>
      </div>
      <div class="foot">
        <button class="btn" id="repairReset" type="button">Resetar circuito</button>
      </div>
    `,{
      kind:'puzzle',
      onMount(){
        uicontent.querySelectorAll('[data-repair-part]').forEach(button => {
          button.addEventListener('click',() => {
            const part = button.dataset.repairPart;
            sequence.push(part);
            const correctPrefix = sequence.every((entry,index) => entry === target[index]);
            if(!correctPrefix){
              feedback = 'Sequência insegura. O disjuntor local reiniciou o painel sem apagar progresso.';
              sequence = [];
              audio.no();
              render();
              return;
            }
            audio.tick();
            if(sequence.length === target.length){
              state.flags.research_room_open = true;
              completePuzzle('lab_repair','Relé restaurado','Fusível antes do condutor; chave de energia por último. Essa ordem reduz o risco de energizar um circuito incompleto.',25);
            }else{
              feedback = `Etapa ${sequence.length}/${target.length} correta.`;
              render();
            }
          });
        });
        document.getElementById('repairReset').addEventListener('click',() => {
          sequence = [];
          feedback = 'Circuito devolvido ao estado inicial.';
          render();
        });
      }
    });
  };
  render();
}

function openChargePuzzle(){
  let charges = Array.isArray(state.flags.chargeNodeStates)
    ? state.flags.chargeNodeStates.slice(0,3)
    : freshPuzzleState('charge_balance');
  while(charges.length < 3) charges.push(0);
  const targetCharge = 1;
  let feedback = 'Alterne os três nós até a soma ser +1.';

  const render = () => {
    const total = charges.reduce((sum,value) => sum + value,0);
    showPanel(`
      <h2 id="panelTitle">Equilíbrio de cargas do Jardim Iônico</h2>
      <p>Clique em cada nó para alternar <b>−1 → 0 → +1</b>. Meta do sistema: <b>+1</b>.</p>
      <div class="puzzle-board">
        <div class="row">
          ${charges.map((charge,index) => `
            <button class="btn charge-node ${charge > 0 ? 'charge-positive' : charge < 0 ? 'charge-negative' : 'charge-neutral'}" type="button" data-charge-index="${index}">
              Nó ${String.fromCharCode(65+index)}<br>${formatCharge(charge)}
            </button>
          `).join('')}
        </div>
        <div class="sep"></div>
        <p>Carga total: <b class="${total === targetCharge ? 'good-text' : total > targetCharge ? 'warn-text' : 'accent'}">${formatCharge(total)}</b></p>
        <p class="small">${escapeHtml(feedback)}</p>
      </div>
      <div class="foot">
        <button class="btn" id="chargeReset" type="button">Resetar nós</button>
        <button class="btn primary" id="chargeValidate" type="button">Validar equilíbrio</button>
      </div>
    `,{
      kind:'puzzle',
      onMount(){
        uicontent.querySelectorAll('[data-charge-index]').forEach(button => {
          button.addEventListener('click',() => {
            const index = Number(button.dataset.chargeIndex);
            charges[index] = charges[index] === -1 ? 0 : charges[index] === 0 ? 1 : -1;
            state.flags.chargeNodeStates = charges.slice();
            audio.tick();
            render();
          });
        });
        document.getElementById('chargeReset').addEventListener('click',() => {
          charges = freshPuzzleState('charge_balance');
          state.flags.chargeNodeStates = charges.slice();
          feedback = 'Nós retornaram ao estado inicial.';
          render();
        });
        document.getElementById('chargeValidate').addEventListener('click',() => {
          const sum = charges.reduce((total,value) => total + value,0);
          if(sum === targetCharge){
            state.flags.chargeNodeStates = charges.slice();
            completePuzzle('charge_balance','Equilíbrio iônico','A carga total é a soma algébrica dos nós. Cargas opostas se compensam, e o sistema atingiu +1.',25);
          }else{
            feedback = `A soma atual é ${formatCharge(sum)}; ajuste até +1.`;
            audio.no();
            render();
          }
        });
      }
    });
  };
  render();
}

function openRadiusOrderPuzzle(){
  const samples = [
    {symbol:'Na',radius:NEUTRAL_PM[11]},
    {symbol:'Mg',radius:NEUTRAL_PM[12]},
    {symbol:'Cl',radius:NEUTRAL_PM[17]},
    {symbol:'Ar',radius:NEUTRAL_PM[18]}
  ];
  let availableOrder = freshPuzzleState('radius_order');
  let selected = [];
  let feedback = 'Selecione as cápsulas do maior para o menor raio neutro aproximado.';

  const render = () => {
    showPanel(`
      <h2 id="panelTitle">Organizador de raio atômico</h2>
      <p>Monte fisicamente a fila de cápsulas do <b>maior → menor</b>.</p>
      <div class="puzzle-board">
        <h3>Bancada</h3>
        <div class="row">
          ${availableOrder.filter(symbol => !selected.includes(symbol)).map(symbol => `<button class="btn sample-choice" type="button" data-radius-sample="${symbol}">${symbol}</button>`).join('') || '<span class="muted">Todas posicionadas.</span>'}
        </div>
        <div class="sep"></div>
        <h3>Fila</h3>
        <div class="row">${selected.map((symbol,index) => `<span class="pill">${index+1}. ${symbol}</span>`).join('') || '<span class="muted">vazia</span>'}</div>
        <p class="small">${escapeHtml(feedback)}</p>
      </div>
      <div class="foot">
        <button class="btn" id="radiusReset" type="button">Resetar fila</button>
        <button class="btn primary" id="radiusValidate" type="button">Validar ordem</button>
      </div>
    `,{
      kind:'puzzle',
      onMount(){
        uicontent.querySelectorAll('[data-radius-sample]').forEach(button => {
          button.addEventListener('click',() => {
            selected.push(button.dataset.radiusSample);
            audio.tick();
            render();
          });
        });
        document.getElementById('radiusReset').addEventListener('click',() => {
          selected = [];
          availableOrder = freshPuzzleState('radius_order');
          feedback = 'Todas as cápsulas voltaram para a bancada.';
          render();
        });
        document.getElementById('radiusValidate').addEventListener('click',() => {
          const target = samples.slice().sort((a,b) => b.radius-a.radius).map(sample => sample.symbol);
          if(selected.length === target.length && selected.every((symbol,index) => symbol === target[index])){
            completePuzzle('radius_order','Fila dos raios','No período 3, a tendência geral contrai o raio da esquerda para a direita: Na > Mg > Cl > Ar nos valores didáticos usados.',20);
          }else{
            feedback = selected.length < target.length
              ? 'Posicione todas as quatro cápsulas antes de validar.'
              : 'A ordem não segue a contração geral do período 3. Resete e tente novamente.';
            audio.no();
            render();
          }
        });
      }
    });
  };
  render();
}

function openShellDistributionPuzzle(){
  let shells = freshPuzzleState('shell_distribution');
  const capacities = [2,8,8];
  const target = [2,8,3];
  const electronTarget = 13;
  let feedback = 'Distribua os 13 elétrons do alumínio no modelo 2–8–8.';

  const render = () => {
    const total = shells.reduce((sum,value) => sum + value,0);
    showPanel(`
      <h2 id="panelTitle">Treino de camadas — Alumínio</h2>
      <p>Preencha as camadas de dentro para fora. Capacidade simplificada: 2, 8 e 8.</p>
      <div class="puzzle-board">
        ${shells.map((count,index) => `
          <div class="shell-row">
            <button class="btn" type="button" data-shell-minus="${index}" ${count === 0 ? 'disabled' : ''}>−</button>
            <div>
              <b>Camada ${index+1}: ${count}/${capacities[index]}</b>
              <div class="meter"><span style="width:${count/capacities[index]*100}%"></span></div>
            </div>
            <button class="btn" type="button" data-shell-plus="${index}" ${count >= capacities[index] || total >= electronTarget ? 'disabled' : ''}>+</button>
          </div>
        `).join('')}
        <p>Total: <b>${total}/${electronTarget} elétrons</b></p>
        <p class="small">${escapeHtml(feedback)}</p>
      </div>
      <div class="foot">
        <button class="btn" id="shellReset" type="button">Resetar camadas</button>
        <button class="btn primary" id="shellValidate" type="button">Validar distribuição</button>
      </div>
    `,{
      kind:'puzzle',
      onMount(){
        uicontent.querySelectorAll('[data-shell-minus]').forEach(button => {
          button.addEventListener('click',() => {
            shells[Number(button.dataset.shellMinus)] -= 1;
            audio.tick();
            render();
          });
        });
        uicontent.querySelectorAll('[data-shell-plus]').forEach(button => {
          button.addEventListener('click',() => {
            shells[Number(button.dataset.shellPlus)] += 1;
            audio.tick();
            render();
          });
        });
        document.getElementById('shellReset').addEventListener('click',() => {
          shells = freshPuzzleState('shell_distribution');
          feedback = 'Slots esvaziados.';
          render();
        });
        document.getElementById('shellValidate').addEventListener('click',() => {
          if(shells.every((value,index) => value === target[index])){
            completePuzzle('shell_distribution','Camadas calibradas','O alumínio neutro tem 13 elétrons: 2 na primeira camada, 8 na segunda e 3 na terceira no modelo simplificado.',20);
          }else{
            feedback = total === electronTarget
              ? 'A soma está correta, mas preencha as camadas internas antes da externa.'
              : `Ainda faltam ${electronTarget-total} elétrons.`;
            audio.no();
            render();
          }
        });
      }
    });
  };
  render();
}

function openIsoelectronicGatePuzzle(){
  const species = [
    {id:'O2-',label:'O²⁻',z:8,charge:-2},
    {id:'F-',label:'F⁻',z:9,charge:-1},
    {id:'Na+',label:'Na⁺',z:11,charge:1},
    {id:'Mg2+',label:'Mg²⁺',z:12,charge:2},
    {id:'Cl-',label:'Cl⁻',z:17,charge:-1}
  ];
  const correct = species.filter(item => item.z-item.charge === 10).map(item => item.id);
  let selected = freshPuzzleState('isoelectronic_gate');
  let feedback = 'Selecione todas as espécies com exatamente 10 elétrons.';

  const render = () => {
    showPanel(`
      <h2 id="panelTitle">Portão Isoeletrônico</h2>
      <p>Use <b>elétrons = Z − carga</b>. Selecione o conjunto completo de 10 e⁻.</p>
      <div class="puzzle-board">
        <div class="row">
          ${species.map(item => `
            <button class="btn sample-choice ${selected.includes(item.id) ? 'selected' : ''}" type="button" data-iso-species="${item.id}">
              ${item.label}<br><span class="small">Z=${item.z}</span>
            </button>
          `).join('')}
        </div>
        <p class="small">${escapeHtml(feedback)}</p>
      </div>
      <div class="foot">
        <button class="btn" id="isoReset" type="button">Resetar seleção</button>
        <button class="btn primary" id="isoValidate" type="button">Testar portão</button>
      </div>
    `,{
      kind:'puzzle',
      onMount(){
        uicontent.querySelectorAll('[data-iso-species]').forEach(button => {
          button.addEventListener('click',() => {
            const id = button.dataset.isoSpecies;
            selected = selected.includes(id) ? selected.filter(value => value !== id) : [...selected,id];
            audio.tick();
            render();
          });
        });
        document.getElementById('isoReset').addEventListener('click',() => {
          selected = freshPuzzleState('isoelectronic_gate');
          feedback = 'Seleção limpa; o portão permanece seguro.';
          render();
        });
        document.getElementById('isoValidate').addEventListener('click',() => {
          const matches = selected.length === correct.length && correct.every(id => selected.includes(id));
          if(matches){
            completePuzzle('isoelectronic_gate','Portão Isoeletrônico','O²⁻, F⁻, Na⁺ e Mg²⁺ têm 10 elétrons. Cl⁻ tem 18 e não pertence ao conjunto.',25);
          }else{
            feedback = 'Conjunto incorreto. Conte os elétrons de cada espécie; a seleção foi mantida para ajuste.';
            audio.no();
            render();
          }
        });
      }
    });
  };
  render();
}

function openRidgeStationPuzzle(object){
  const stationIndex = object.data.index;
  if(stationIndex > 1 && !state.stations.includes(`ridge_station_${stationIndex-1}`)){
    openPagedDialogue(
      `Estação periódica ${stationIndex}`,
      ['O sinal anterior ainda não chegou. Ative as estações da base para o topo da crista.'],
      [{label:'Voltar',callback:hidePanel}]
    );
    return;
  }
  const targets = {
    1:['left'],
    2:['down'],
    3:['left','down','left']
  };
  const target = targets[stationIndex];
  let path = [];
  let feedback = stationIndex === 1
    ? 'Indique a direção de aumento do raio dentro de um período.'
    : stationIndex === 2
      ? 'Indique a direção de aumento do raio dentro de um grupo.'
      : 'Trace a rota final de maior raio: esquerda, baixo, esquerda.';

  const arrows = {left:'←',right:'→',up:'↑',down:'↓'};
  const render = () => {
    showPanel(`
      <h2 id="panelTitle">Estação periódica ${stationIndex}/3</h2>
      <p>A estação lê uma rota física de setas, não uma resposta textual.</p>
      <div class="puzzle-board">
        <div class="row">
          ${Object.entries(arrows).map(([id,arrow]) => `<button class="btn charge-node" type="button" data-ridge-arrow="${id}">${arrow}</button>`).join('')}
        </div>
        <div class="sep"></div>
        <p>Rota: <b>${path.map(id => arrows[id]).join(' ') || 'vazia'}</b></p>
        <p class="small">${escapeHtml(feedback)}</p>
      </div>
      <div class="foot">
        <button class="btn" id="ridgeReset" type="button">Resetar rota</button>
        <button class="btn primary" id="ridgeValidate" type="button">Ativar estação</button>
      </div>
    `,{
      kind:'puzzle',
      onMount(){
        uicontent.querySelectorAll('[data-ridge-arrow]').forEach(button => {
          button.addEventListener('click',() => {
            if(path.length < target.length) path.push(button.dataset.ridgeArrow);
            audio.tick();
            render();
          });
        });
        document.getElementById('ridgeReset').addEventListener('click',() => {
          path = [];
          feedback = 'Rota apagada.';
          render();
        });
        document.getElementById('ridgeValidate').addEventListener('click',() => {
          const matches = path.length === target.length && path.every((value,index) => value === target[index]);
          if(matches){
            if(!state.stations.includes(object.id)) state.stations.push(object.id);
            awardOnce(`station:${object.id}`,15,`Estação periódica ${stationIndex}`);
            refreshMissionProgress();
            saveProgress(true);
            audio.ok();
            showPanel(`
              <h2 id="panelTitle">Estação ${stationIndex} ativada</h2>
              <p class="good-text">✔ Rota reconhecida.</p>
              <p>${stationIndex < 3 ? 'A próxima estação foi marcada na Crista Periódica.' : 'As rotas confirmam que o raio aumenta, em geral, para baixo e para a esquerda.'}</p>
              <div class="foot"><button class="btn good" id="ridgeDone" type="button">Continuar</button></div>
            `,{
              kind:'puzzle-result',
              onMount(){
                document.getElementById('ridgeDone').addEventListener('click',hidePanel);
              }
            });
          }else{
            feedback = 'A rota não acompanha a tendência pedida. Use Resetar para recomeçar localmente.';
            audio.no();
            render();
          }
        });
      }
    });
  };
  render();
}

function openCampusCorePuzzle(){
  let core = freshPuzzleState('campus_core');
  const gasOptions = ['He','Ne','Ar'];
  let feedback = 'Zere a carga, complete 2–8–8 e selecione o gás nobre correspondente.';

  const render = () => {
    const chargeTotal = core.charges.reduce((sum,value) => sum + value,0);
    const shellTotal = core.shells.reduce((sum,value) => sum + value,0);
    showPanel(`
      <h2 id="panelTitle">Núcleo do Campus Periodicum</h2>
      <p>Três subsistemas precisam ficar estáveis ao mesmo tempo.</p>
      <div class="grid wide">
        <section class="puzzle-board">
          <h3>1. Carga total = 0</h3>
          <div class="row">
            ${core.charges.map((charge,index) => `<button class="btn ${charge > 0 ? 'charge-positive' : charge < 0 ? 'charge-negative' : 'charge-neutral'}" type="button" data-core-charge="${index}">${formatCharge(charge)}</button>`).join('')}
          </div>
          <p>Total: <b>${formatCharge(chargeTotal)}</b></p>
        </section>
        <section class="puzzle-board">
          <h3>2. Camadas 2–8–8</h3>
          ${core.shells.map((count,index) => `
            <div class="row">
              <span>Camada ${index+1}: <b>${count}</b></span>
              <button class="btn" type="button" data-core-shell-minus="${index}" ${count <= 0 ? 'disabled' : ''}>−</button>
              <button class="btn" type="button" data-core-shell-plus="${index}" ${count >= [2,8,8][index] ? 'disabled' : ''}>+</button>
            </div>
          `).join('')}
          <p>Total: ${shellTotal} e⁻</p>
        </section>
        <section class="puzzle-board">
          <h3>3. Núcleo estável</h3>
          <div class="row">${gasOptions.map(symbol => `<button class="btn ${core.gas === symbol ? 'selected sample-choice' : ''}" type="button" data-core-gas="${symbol}">${symbol}</button>`).join('')}</div>
        </section>
      </div>
      <p class="small">${escapeHtml(feedback)}</p>
      <div class="foot">
        <button class="btn" id="coreReset" type="button">Resetar núcleo</button>
        <button class="btn primary" id="coreValidate" type="button">Sincronizar Campus</button>
      </div>
    `,{
      kind:'puzzle',
      onMount(){
        uicontent.querySelectorAll('[data-core-charge]').forEach(button => {
          button.addEventListener('click',() => {
            const index = Number(button.dataset.coreCharge);
            core.charges[index] = core.charges[index] === -1 ? 0 : core.charges[index] === 0 ? 1 : -1;
            audio.tick();
            render();
          });
        });
        uicontent.querySelectorAll('[data-core-shell-minus]').forEach(button => {
          button.addEventListener('click',() => {
            core.shells[Number(button.dataset.coreShellMinus)] -= 1;
            render();
          });
        });
        uicontent.querySelectorAll('[data-core-shell-plus]').forEach(button => {
          button.addEventListener('click',() => {
            core.shells[Number(button.dataset.coreShellPlus)] += 1;
            render();
          });
        });
        uicontent.querySelectorAll('[data-core-gas]').forEach(button => {
          button.addEventListener('click',() => {
            core.gas = button.dataset.coreGas;
            audio.tick();
            render();
          });
        });
        document.getElementById('coreReset').addEventListener('click',() => {
          core = freshPuzzleState('campus_core');
          feedback = 'Subsistemas retornaram ao estado seguro.';
          render();
        });
        document.getElementById('coreValidate').addEventListener('click',() => {
          const chargeOk = core.charges.reduce((sum,value) => sum+value,0) === 0;
          const shellOk = core.shells.every((value,index) => value === [2,8,8][index]);
          const gasOk = core.gas === 'Ar';
          if(chargeOk && shellOk && gasOk){
            completePuzzle('campus_core','Campus sincronizado','Carga total neutra, distribuição 2–8–8 e identificação do argônio estabilizaram o núcleo no modelo didático do campus.',40);
          }else{
            const missing = [
              !chargeOk && 'carga total',
              !shellOk && 'camadas',
              !gasOk && 'gás nobre'
            ].filter(Boolean).join(', ');
            feedback = `Ainda ajuste: ${missing}.`;
            audio.no();
            render();
          }
        });
      }
    });
  };
  render();
}

/* ---------- Seis santuários originais ---------- */

function shrineComplete(shrineId){
  if(state.shrines[shrineId]) return;
  state.shrines[shrineId] = true;
  awardOnce(`shrine:${shrineId}`,25,'Selo de santuário');
  refreshMissionProgress();
  saveProgress(true);
  updateHUD();
  if(SHRINE_IDS.every(id => state.shrines[id])){
    toast('Capítulo dos seis santuários concluído!', 'good');
  }
}

function openQuizById(shrineId, shrineObject){
  const pack = QUIZZES[shrineId];
  if(!pack) return;
  if(state.shrines[shrineId]){
    openPagedDialogue(
      pack.title,
      ['Este selo já foi conquistado. Você pode refazer o santuário como revisão sem perder progresso.'],
      [
        {label:'Revisar perguntas',className:'primary',callback:() => runQuiz()},
        {label:'Voltar',callback:hidePanel}
      ]
    );
    return;
  }
  runQuiz();

  function runQuiz(){
    let questionIndex = 0;
    let score = 0;

    const renderQuestion = (feedback='') => {
      const item = pack.items[questionIndex];
      showPanel(`
        <h2 id="panelTitle">${escapeHtml(pack.title)}</h2>
        <div class="row">
          <span class="pill">Pergunta ${questionIndex+1}/${pack.items.length}</span>
          <span class="pill">Acertos ${score}</span>
        </div>
        <p><b>${escapeHtml(item.q)}</b></p>
        <div class="choices">
          ${item.choices.map((choice,index) => `<button class="choice" type="button" data-quiz-choice="${index}">${escapeHtml(choice)}</button>`).join('')}
        </div>
        ${feedback ? `<div class="sep"></div><p>${feedback}</p>` : ''}
      `,{
        kind:'quiz',
        onMount(){
          uicontent.querySelectorAll('[data-quiz-choice]').forEach(button => {
            button.addEventListener('click',() => answer(Number(button.dataset.quizChoice)),{once:true});
          });
        }
      });
    };

    const answer = choiceIndex => {
      const item = pack.items[questionIndex];
      const correct = choiceIndex === item.correct;
      if(correct){
        score += 1;
        audio.ok();
      }else{
        audio.no();
      }
      uicontent.querySelectorAll('[data-quiz-choice]').forEach((button,index) => {
        button.disabled = true;
        if(index === item.correct) button.classList.add('ok');
        else if(index === choiceIndex) button.classList.add('no');
      });
      const nextLabel = questionIndex < pack.items.length - 1 ? 'Próxima pergunta' : 'Ver resultado';
      const feedback = document.createElement('div');
      feedback.innerHTML = `
        <div class="sep"></div>
        <p><span class="pill">${correct ? '✔ Correto' : '✖ Revise'}</span> ${escapeHtml(item.why)}</p>
        <div class="foot"><button class="btn primary" id="quizNext" type="button">${nextLabel}</button></div>
      `;
      uicontent.appendChild(feedback);
      document.getElementById('quizNext').addEventListener('click',() => {
        questionIndex += 1;
        if(questionIndex < pack.items.length) renderQuestion();
        else showResult();
      });
    };

    const showResult = () => {
      const perfect = score === pack.items.length;
      if(perfect) shrineComplete(shrineId);
      showPanel(`
        <h2 id="panelTitle">${escapeHtml(pack.title)} — Resultado</h2>
        <p>${perfect
          ? `Selo conquistado com ${score}/${pack.items.length} acertos.`
          : `Você acertou ${score}/${pack.items.length}. Para preservar a validação original, o selo exige todas as respostas corretas.`}</p>
        <div class="sep"></div>
        <div class="foot">
          ${perfect
            ? '<button class="btn good" id="quizBack" type="button">Voltar ao campus</button>'
            : '<button class="btn primary" id="quizRetry" type="button">Tentar novamente</button>'}
        </div>
      `,{
        kind:'quiz-result',
        onMount(){
          document.getElementById('quizBack')?.addEventListener('click',hidePanel);
          document.getElementById('quizRetry')?.addEventListener('click',runQuiz);
        }
      });
    };

    renderQuestion();
  }
}

/* ---------- Certificação final ---------- */

function showCertificate(){
  showPanel(`
    <div class="cert">
      <h2 id="panelTitle">Certificado Expandido</h2>
      <h3>Guardião do Campus Periodicum</h3>
      <p>Você restaurou as estações de raio atômico, íons, blindagem, séries isoeletrônicas, grupos e períodos.</p>
      <p class="pill">Pesquisa: ${state.researchPoints} PR · ${escapeHtml(currentRank().name)}</p>
      <div class="sep"></div>
      <p>Seis selos originais: ${SHRINE_IDS.filter(id => state.shrines[id]).length}/6</p>
      <p>Amostras H–Ar: ${state.samples.length}/18 · Regiões: ${state.discoveredRegions.length}/${REGIONS.length}</p>
      <p class="small">Os modelos e valores do jogo são didáticos e aproximados.</p>
      <div class="foot" style="justify-content:center"><button class="btn good" id="certificateClose" type="button">Continuar explorando</button></div>
    </div>
  `,{
    kind:'certificate',
    onMount(){
      document.getElementById('certificateClose').addEventListener('click',hidePanel);
    }
  });
}

/* ---------- HUD ---------- */

function trackedMission(){
  const preferred = MISSION_BY_ID[state.trackedMission];
  if(preferred && missionState(preferred.id).status === 'active') return preferred;
  const activeMainId = findActiveMainId();
  if(activeMainId){
    state.trackedMission = activeMainId;
    return MISSION_BY_ID[activeMainId];
  }
  const activeSide = SIDE_MISSIONS.find(mission => missionState(mission.id).status === 'active');
  if(activeSide){
    state.trackedMission = activeSide.id;
    return activeSide;
  }
  return null;
}

function updateHUD(){
  doneEl.textContent = SHRINE_IDS.filter(id => state.shrines[id]).length;
  totalEl.textContent = SHRINE_IDS.length;
  const rank = currentRank();
  rankEl.textContent = rank.name;
  rpEl.textContent = state.researchPoints;
  const mission = trackedMission();
  if(mission){
    const progress = missionState(mission.id);
    objectiveEl.textContent = mission.stages[progress.stage]?.text || mission.title;
    objectiveEl.title = `${mission.title}: ${objectiveEl.textContent}`;
  }else{
    objectiveEl.textContent = 'Campus estabilizado · explore descobertas opcionais';
    objectiveEl.title = objectiveEl.textContent;
  }
  muteBtn.textContent = state.settings.sound ? '🔊 FX' : '🔇 FX';
  document.body.classList.toggle('reduced-motion',state.settings.reducedMotion);
}

/* ---------- Validação automática ---------- */

function uniqueIds(values){
  return new Set(values).size === values.length;
}

function validationBlockedTile(tx, ty){
  if(!inWorld(tx,ty)) return true;
  const tile = getTile(tx,ty);
  if(tile === Tile.WATER && bridgeTiles.has(tileKey(tx,ty))) return false;
  if(SOLID_TILE_TYPES.has(tile)) return true;

  const tileRect = {x:tx*TILE+2,y:ty*TILE+2,w:TILE-4,h:TILE-4};
  for(const object of worldObjects){
    if(object.type === 'gate' || !object.solid || !objectIsVisible(object)) continue;
    if(intersects(tileRect,objectRect(object))) return true;
  }
  return false;
}

function reachableTilesForValidation(){
  const start = {tx:Math.floor(SPAWN.x/TILE),ty:Math.floor(SPAWN.y/TILE)};
  const visited = new Uint8Array(WORLD_W*WORLD_H);
  const queueX = new Int16Array(WORLD_W*WORLD_H);
  const queueY = new Int16Array(WORLD_W*WORLD_H);
  let head = 0;
  let tail = 0;
  queueX[tail] = start.tx;
  queueY[tail] = start.ty;
  tail += 1;
  visited[tileIndex(start.tx,start.ty)] = 1;

  while(head < tail){
    const tx = queueX[head];
    const ty = queueY[head];
    head += 1;
    const neighbors = [[tx+1,ty],[tx-1,ty],[tx,ty+1],[tx,ty-1]];
    for(const [nx,ny] of neighbors){
      if(!inWorld(nx,ny)) continue;
      const index = tileIndex(nx,ny);
      if(visited[index] || validationBlockedTile(nx,ny)) continue;
      visited[index] = 1;
      queueX[tail] = nx;
      queueY[tail] = ny;
      tail += 1;
    }
  }
  return visited;
}

function targetReachableInValidation(targetId, visited){
  const object = worldObjectById[targetId];
  const npc = npcEntityById[targetId];
  const rect = object ? objectRect(object) : npc;
  if(!rect) return false;
  const centerTx = Math.floor((rect.x+rect.w/2)/TILE);
  const centerTy = Math.floor((rect.y+rect.h/2)/TILE);
  for(let dy=-1; dy<=1; dy++){
    for(let dx=-1; dx<=1; dx++){
      const tx = centerTx+dx;
      const ty = centerTy+dy;
      if(inWorld(tx,ty) && visited[tileIndex(tx,ty)]) return true;
    }
  }
  return false;
}

function validateMapReachability(){
  const visited = reachableTilesForValidation();
  const unreachable = REQUIRED_OBJECT_IDS.filter(id => !targetReachableInValidation(id,visited));
  return {ok:unreachable.length === 0,unreachable,visited};
}

function missionItemReferencesValid(){
  const refs = [];
  for(const mission of ALL_MISSIONS){
    for(const stage of mission.stages){
      if(stage.req.type === 'item') refs.push(stage.req.id);
      if(stage.req.type === 'items') refs.push(...Object.keys(stage.req.items));
    }
    if(mission.rewards?.items) refs.push(...Object.keys(mission.rewards.items));
    if(mission.acceptItems) refs.push(...Object.keys(mission.acceptItems));
  }
  return refs.every(id => ITEM_BY_ID[id]);
}

function protectedSpawnValid(){
  const spawnTx = Math.floor(SPAWN.x/TILE);
  const spawnTy = Math.floor(SPAWN.y/TILE);
  for(let y=spawnTy-1; y<=spawnTy+1; y++){
    for(let x=spawnTx-1; x<=spawnTx+1; x++){
      if(tileIsSolid(x,y)) return false;
    }
  }
  const spawnRect = {x:SPAWN.x-4,y:SPAWN.y-4,w:20,h:20};
  return !worldObjects.some(object => objectIsSolid(object) && intersects(spawnRect,objectRect(object)));
}

function runTests(){
  const results = [];
  const test = (name,callback) => {
    try{
      results.push([name,Boolean(callback())]);
    }catch(error){
      results.push([name,false,error.message]);
    }
  };

  test('mapa_alcancavel',() => validateMapReachability().ok);
  test('zona_spawn_protegida',protectedSpawnValid);
  test('mundo_deterministico',() => hash2(44,22,3) === hash2(44,22,3) && hash2(44,22,3) !== hash2(45,22,3));
  test('missoes_principais_16',() => MAIN_MISSIONS.length >= 16);
  test('missoes_laterais_10',() => SIDE_MISSIONS.length >= 10);
  test('progressao_missao_principal',() => MAIN_MISSIONS.every((mission,index) => mission.order === index+1 && (index === 0 || MAIN_MISSIONS[index-1].order + 1 === mission.order)));
  test('ids_missao_unicos',() => uniqueIds(ALL_MISSIONS.map(mission => mission.id)));
  test('ids_item_unicos',() => uniqueIds(ITEMS.map(item => item.id)));
  test('ids_objeto_unicos',() => uniqueIds(worldObjects.map(object => object.id)));
  test('pre_requisitos_validos',() => SIDE_MISSIONS.every(mission => (mission.prereq||[]).every(id => MISSION_BY_ID[id] && id !== mission.id)));
  test('etapas_missao_validas',() => ALL_MISSIONS.every(mission => mission.stages.length && mission.stages.every(stage => stage.text && stage.req?.type)));
  test('itens_de_missao_disponiveis',missionItemReferencesValid);
  test('objetos_mandatorios_presentes',() => REQUIRED_OBJECT_IDS.every(id => worldObjectById[id] || npcEntityById[id]));
  test('objetos_mandatorios_alcancaveis',() => validateMapReachability().ok);
  test('objetos_interativos_alcancaveis',() => {
    const visited = reachableTilesForValidation();
    return worldObjects.filter(object => object.interactive && objectIsVisible(object)).every(object => targetReachableInValidation(object.id,visited));
  });
  test('sem_sobreposicao_importante',() => {
    const interactive = worldObjects.filter(object => object.interactive && objectIsVisible(object));
    for(let first=0; first<interactive.length; first++){
      for(let second=first+1; second<interactive.length; second++){
        if(intersects(objectRect(interactive[first]),objectRect(interactive[second]))) return false;
      }
    }
    return true;
  });

  test('inventario_adicao_remocao',() => {
    const sandbox = createDefaultState();
    addItem('replacement_fuse',2,sandbox,false);
    const added = inventoryCount('replacement_fuse',sandbox) === 2;
    const removed = removeItem('replacement_fuse',1,sandbox);
    return added && removed && inventoryCount('replacement_fuse',sandbox) === 1;
  });
  test('protecao_item_chave',() => {
    const sandbox = createDefaultState();
    addItem('electron_scanner',1,sandbox,false);
    return removeItem('electron_scanner',1,sandbox) === false && inventoryCount('electron_scanner',sandbox) === 1;
  });
  test('migracao_save_v2',() => {
    const migrated = migrateLegacySave({shrines:[true,false,true,false,false,true]});
    return migrated.version === 3 && migrated.shrines.trend && migrated.shrines.iso && migrated.shrines.mix && !migrated.shrines.ions;
  });
  test('recuperacao_save_corrompido',() => {
    const parsed = parseSaveString('{save quebrado');
    return !parsed.valid && parsed.state.version === 3 && parsed.state.missions.main_01.status === 'active';
  });
  test('save_campos_versionados',() => {
    const fresh = createDefaultState();
    return fresh.version === 3 && fresh.inventory && fresh.puzzles && fresh.discoveredRegions && fresh.settings;
  });
  test('save_roundtrip_persistente',() => {
    const fresh = createDefaultState();
    fresh.flags.bridge_open = true;
    fresh.puzzles.charge_balance = true;
    fresh.inventory.portable_battery = 1;
    fresh.samples.push('H');
    const restored = sanitizeState(JSON.parse(JSON.stringify(fresh)));
    return restored.flags.bridge_open && restored.puzzles.charge_balance && restored.inventory.portable_battery === 1 && restored.samples.includes('H');
  });
  test('reset_puzzle_isolado',() => {
    const first = freshPuzzleState('charge_balance');
    first[0] = 99;
    const second = freshPuzzleState('charge_balance');
    return second[0] === -1;
  });

  test('elementos_h_ao_ar',() => ELEMENTS.length === 18 && ELEMENTS[0].symbol === 'H' && ELEMENTS[17].symbol === 'Ar');
  test('dados_elementos_completos',() => ELEMENTS.every((element,index) => element.z === index+1 && element.name && element.radius && element.shells.reduce((sum,value) => sum+value,0) === element.z));
  test('camadas_10e',() => electronsToShells(10).join(',') === '2,8,0');
  test('camadas_18e',() => electronsToShells(18).join(',') === '2,8,8');
  test('calculo_isoeletronico',() => 8-(-2) === 9-(-1) && 9-(-1) === 11-1 && 11-1 === 12-2);
  test('ordem_iso_10e',() => {
    const radii = [[8,-2],[9,-1],[11,1],[12,2],[13,3]].map(([z,q]) => ionRadiusApprox(z,q));
    return radii.every((radius,index) => index === radii.length-1 || radius > radii[index+1]);
  });
  test('faixas_carga_validas',() => ionRadiusApprox(14,4) > 0 && electronsToShells(14-4).join(',') === '2,8,0');
  test('seis_santuarios_preservados',() => SHRINE_IDS.length === 6 && SHRINE_IDS.every(id => QUIZZES[id] && worldObjectById[`shrine_${id}`]));

  test('alvo_interacao_mais_proximo',() => {
    const oldX = player.x;
    const oldY = player.y;
    player.x = worldObjectById.lab_terminal.x;
    player.y = worldObjectById.lab_terminal.y + TILE;
    const target = nearestTarget('interact',40);
    player.x = oldX;
    player.y = oldY;
    return Boolean(target && target.kind === 'object' && target.object.id === 'lab_terminal');
  });
  test('colisao_paredes_autorais',() => tileIsSolid(8,8) && !tileIsSolid(20,24) && tileIsSolid(36,41));
  test('paineis_disponiveis',() => [
    openInventory,openMissionLog,openMap,openNotebook,openTheory,openLab,
    openRepairPuzzle,openChargePuzzle,openRadiusOrderPuzzle,openShellDistributionPuzzle,
    openIsoelectronicGatePuzzle,openCampusCorePuzzle
  ].every(value => typeof value === 'function'));
  test('arquitetura_offline',() => [...document.scripts].every(script => !/^https?:/i.test(script.src)));

  return results;
}

function openTestsPanel(){
  const results = runTests();
  const passed = results.filter(([,ok]) => ok).length;
  const html = results.map(([name,ok,extra]) => `
    <div class="pill" style="border-color:${ok ? '#2b5' : '#b44'}">${ok ? '✔' : '✖'} ${escapeHtml(name)}${extra ? ` — ${escapeHtml(extra)}` : ''}</div>
  `).join('');
  showPanel(`
    <h2 id="panelTitle">Testes automáticos</h2>
    <p><b>${passed}/${results.length}</b> testes aprovados.</p>
    <div class="col" style="gap:6px">${html}</div>
    <div class="sep"></div>
    <div class="small">Resultados também registrados no console do navegador.</div>
  `,{kind:'tests'});
  console.group('Campus Periodicum — testes automáticos');
  console.table(results.map(([name,ok,extra]) => ({teste:name,ok,detalhe:extra||''})));
  console.groupEnd();
}

/* ---------- Menu, início e configurações ---------- */

function applySettings(){
  audio.enabled = state.settings.sound;
  document.body.classList.toggle('reduced-motion',state.settings.reducedMotion);
  updateHUD();
}

function startSession(startNew=false){
  if(startNew) resetStatePreservingSettings();

  player.x = state.player.x;
  player.y = state.player.y;
  player.dir = state.player.dir;
  player.vx = 0;
  player.vy = 0;
  ensureSafePlayerPosition();
  updateMissionAvailability();
  applySettings();
  gameStarted = true;
  hidePanel();

  camera.x = clamp(player.cx - VW/2,0,WORLD_W*TILE-VW);
  camera.y = clamp(player.cy - VH/2,0,WORLD_H*TILE-VH);

  if(!state.tutorials.movement){
    state.tutorials.movement = true;
    saveProgress(true);
    openPagedDialogue(
      'Bem-vindo ao Campus Periodicum',
      [
        'O campus perdeu a sincronização. Explore sem combate forçado e resolva os sistemas por observação, ferramentas e química.',
        'Mova-se com WASD ou setas.\nUse E perto de pessoas e objetos.\nAbra a teoria com H.\n\nNovos controles serão apresentados quando cada ferramenta for desbloqueada.'
      ],
      [{label:'Começar pesquisa',className:'good',callback:hidePanel}]
    );
  }else{
    toast('Progresso carregado. O Campus Periodicum está pronto.', 'good');
  }

  if(state.flags.migratedFromV2 && !state.flags.migrationNoticeShown){
    state.flags.migrationNoticeShown = true;
    toast('Save v2 migrado: os seis santuários foram preservados.', 'good');
    saveProgress(true);
  }
  if(state.flags.recoveredCorruptSave){
    toast('Save corrompido isolado; um estado seguro foi carregado.', 'warn');
  }
}

function requestNewGame(){
  if(hasStoredSave()){
    openConfirm(
      'Iniciar novo jogo',
      'O progresso atual será substituído por uma nova pesquisa. As configurações de som e movimento reduzido serão preservadas.',
      () => startSession(true),
      openMainMenu
    );
  }else{
    startSession(true);
  }
}

function requestProgressReset(){
  openConfirm(
    'Resetar progresso',
    'Missões, itens, amostras, posição e descobertas serão apagados. Esta ação não acontece automaticamente em atualizações.',
    () => {
      resetStatePreservingSettings();
      player.x = SPAWN.x;
      player.y = SPAWN.y;
      gameStarted = false;
      openMainMenu();
    },
    openMainMenu
  );
}

function openMainMenu(){
  gameStarted = false;
  clearMovement();
  const hasSave = hasStoredSave();
  showPanel(`
    <h1 id="panelTitle">RPG Química</h1>
    <h2>Raio Atômico & Íons — Campus Periodicum</h2>
    <p>Uma aventura educacional de exploração, ferramentas, experimentos e puzzles ambientais.</p>
    <div class="sep"></div>
    <div class="col" style="max-width:420px">
      ${hasSave ? '<button class="btn good" id="continueGame" type="button">Continuar pesquisa</button>' : ''}
      <button class="btn primary" id="newGame" type="button">${hasSave ? 'Iniciar novo jogo' : 'Começar'}</button>
      ${hasSave ? '<button class="btn danger" id="resetProgress" type="button">Resetar progresso</button>' : ''}
    </div>
    <div class="sep"></div>
    <label class="row" for="reducedMotionSetting">
      <input id="reducedMotionSetting" name="reduced_motion" type="checkbox" ${state.settings.reducedMotion ? 'checked' : ''}>
      Reduzir animações não essenciais
    </label>
    <p class="small">HTML + CSS + JavaScript + Canvas 2D. Funciona offline, sem instalação ou build.</p>
  `,{
    kind:'menu',
    closable:false,
    onMount(){
      document.getElementById('continueGame')?.addEventListener('click',() => startSession(false));
      document.getElementById('newGame').addEventListener('click',requestNewGame);
      document.getElementById('resetProgress')?.addEventListener('click',requestProgressReset);
      document.getElementById('reducedMotionSetting').addEventListener('change',event => {
        state.settings.reducedMotion = event.target.checked;
        applySettings();
        saveProgress(true);
      });
    }
  });
}

/* ---------- Entrada de teclado e toque ---------- */

const movementKeys = new Set(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright']);

window.addEventListener('keydown',event => {
  const key = event.key.toLowerCase();
  if(movementKeys.has(key) || [' ','h','e','q','i','j','m','n','t'].includes(key)) event.preventDefault();

  if(key === 'escape'){
    if(panelOpen()) hidePanel();
    return;
  }
  if(panelOpen() || !gameStarted) return;

  if(movementKeys.has(key)){
    keys[key] = true;
    return;
  }
  if(event.repeat) return;
  if(key === 'e') tryInteract();
  else if(key === 'q') tryScan();
  else if(key === 'h') openTheory();
  else if(key === 'i') openInventory();
  else if(key === 'j') openMissionLog('active');
  else if(key === 'm') openMap();
  else if(key === 'n') openNotebook('elements');
  else if(key === 't') openTestsPanel();
});

window.addEventListener('keyup',event => {
  keys[event.key.toLowerCase()] = false;
});

window.addEventListener('blur',clearMovement);

document.querySelectorAll('[data-move]').forEach(button => {
  const key = button.dataset.move;
  const press = event => {
    event.preventDefault();
    if(!panelOpen() && gameStarted) keys[key] = true;
  };
  const release = event => {
    event.preventDefault();
    keys[key] = false;
  };
  button.addEventListener('pointerdown',press);
  button.addEventListener('pointerup',release);
  button.addEventListener('pointercancel',release);
  button.addEventListener('pointerleave',release);
});

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click',event => {
    event.preventDefault();
    if(panelOpen() || !gameStarted) return;
    const action = button.dataset.action;
    if(action === 'interact') tryInteract();
    if(action === 'scan') tryScan();
    if(action === 'inventory') openInventory();
    if(action === 'missions') openMissionLog('active');
    if(action === 'map') openMap();
  });
});

closeBtn.addEventListener('click',hidePanel);
ui.addEventListener('click',event => {
  if(event.target === ui && activePanelKind !== 'menu') hidePanel();
});
muteBtn.addEventListener('click',() => {
  state.settings.sound = !state.settings.sound;
  applySettings();
  if(state.settings.sound) audio.ok();
  saveProgress(true);
});
fsBtn.addEventListener('click',() => {
  const root = document.documentElement;
  if(!document.fullscreenElement){
    root.requestFullscreen?.().catch(() => toast('Tela cheia não foi autorizada pelo navegador.', 'warn'));
  }else{
    document.exitFullscreen?.().catch(() => {});
  }
});
testBtn.addEventListener('click',openTestsPanel);

document.addEventListener('visibilitychange',() => {
  clearMovement();
  if(document.hidden && gameStarted) saveProgress(true);
});
window.addEventListener('beforeunload',() => {
  if(gameStarted) saveProgress(true);
});

/* ---------- Loop principal ---------- */

let previousTime = 0;
let autosaveAccumulator = 0;

function updateParticles(dt){
  for(let index=particles.length-1; index>=0; index--){
    particles[index].update(dt);
    if(particles[index].alpha <= 0) particles.splice(index,1);
  }
}

function gameLoop(timestamp){
  const now = timestamp/1000;
  dtGlobal = Math.min(.033,previousTime ? now-previousTime : .016);
  previousTime = now;
  timeSec = now;

  for(const npc of npcEntities) npc.update(timeSec);
  player.update(dtGlobal);
  updateParticles(dtGlobal);
  updateCamera();
  updateTargets();

  ctx.fillStyle = '#080910';
  ctx.fillRect(0,0,VW,VH);
  drawWorld();

  if(gameStarted){
    autosaveAccumulator += dtGlobal;
    if(autosaveAccumulator >= 2.5){
      autosaveAccumulator = 0;
      saveProgress();
    }
  }
  requestAnimationFrame(gameLoop);
}

/* ---------- Inicialização ---------- */

for(const [id,defaultPosition] of Object.entries(createDefaultState().cratePositions)){
  const stored = state.cratePositions[id];
  if(!stored || !Number.isFinite(Number(stored.tx)) || !Number.isFinite(Number(stored.ty))){
    state.cratePositions[id] = {...defaultPosition};
  }else{
    state.cratePositions[id] = {
      tx:clamp(Math.round(Number(stored.tx)),1,WORLD_W-2),
      ty:clamp(Math.round(Number(stored.ty)),1,WORLD_H-2)
    };
  }
}

updateMissionAvailability();
ensureSafePlayerPosition();
applySettings();
openMainMenu();
requestAnimationFrame(gameLoop);

/* Exposição mínima para diagnóstico e para o painel de testes. */
window.CampusPeriodicum = Object.freeze({
  version:SAVE_VERSION,
  runTests,
  openTestsPanel,
  ionRadiusApprox,
  electronsToShells,
  validateMapReachability
});
