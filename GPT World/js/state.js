import { FORMS, ITEMS, REGIONS, normalizeVisualVariant } from "./data.js";
import { TOWER_RUN_UPGRADES } from "./tower_data.js";

export const SAVE_VERSION = 6;
const SAVE_PREFIX = "voz-partida-save-";
const SETTINGS_KEY = "voz-partida-settings";
const META_KEY = "voz-partida-meta";

export const DEFAULT_SETTINGS = {
  masterVolume: .68,
  musicVolume: .38,
  effectsVolume: .75,
  textSpeed: 28,
  autoDialogue: false,
  screenShake: .75,
  reduceFlashes: false,
  battleSpeed: 1,
  autoBattle: false,
  autoBattleItems: false,
  fullscreen: false,
  pixelScale: "crisp",
  highContrast: false,
  reducedMotion: false,
  fontSize: "normal",
  touchControls: "auto",
  keys: { up:"KeyW", down:"KeyS", left:"KeyA", right:"KeyD", interact:"KeyE", menu:"Escape" }
};

const safeParse = (value, fallback=null) => {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};

export function loadSettings() {
  const saved = safeParse(localStorage.getItem(SETTINGS_KEY), {});
  const settings = { ...DEFAULT_SETTINGS, ...saved, keys:{...DEFAULT_SETTINGS.keys, ...(saved?.keys || {})} };
  if (![1,2,3].includes(Number(settings.battleSpeed))) settings.battleSpeed = 1;
  else settings.battleSpeed = Number(settings.battleSpeed);
  if (!["normal","large","extra-large"].includes(settings.fontSize)) settings.fontSize = settings.fontSize === "grande" ? "large" : "normal";
  settings.autoBattle = Boolean(settings.autoBattle);
  settings.autoBattleItems = Boolean(settings.autoBattleItems);
  return settings;
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadMeta() {
  return { ngPlus:false, endings:[], codexLegacy:[], ...(safeParse(localStorage.getItem(META_KEY), {}) || {}) };
}

export function saveMeta(meta) { localStorage.setItem(META_KEY, JSON.stringify(meta)); }

function makeQuests() {
  const quests = [];
  REGIONS.forEach((region, index) => {
    quests.push({
      id:`main-${index}`, category:"main", title:`O Comando ${index + 1}: ${region.command}`,
      description:region.objective, objective:"Derrote os quatro guardiões da região.", region:region.name, npc:region.npc,
      progress:0, goal:4, rewards:`Comando Primordial • ${90 + index * 25} Ecos`, status:index === 0 ? "active" : "locked", optional:false
    });
    quests.push({
      id:`hunt-${index}`, category:"hunt", title:`Ecossistema Fraturado: ${region.name}`,
      description:`Registre e derrote uma criatura regional sem destruir seu habitat.`, objective:"Vença um encontro normal.", region:region.name, npc:"Arquivo da Voz",
      progress:0, goal:1, rewards:`Bestiário • 2 ${region.material}`, status:index === 0 ? "active" : "locked", optional:true
    });
    quests.push({
      id:`side-${index}`, category:"side", title:`Matéria de ${region.subtitle}`,
      description:`Recolha materiais para compreender como o Comando alterou a região.`, objective:`Obtenha 3 unidades de ${region.material}.`, region:region.name, npc:region.npc,
      progress:0, goal:3, rewards:"Receita regional • 45 Ecos", status:index === 0 ? "active" : "locked", optional:true
    });
    quests.push({
      id:`mystery-${index}`, category:"mystery", title:`O Documento que ${region.command}`,
      description:region.lore, objective:"Inspecione o altar oculto.", region:region.name, npc:"Fragmento GPT",
      progress:0, goal:1, rewards:"Entrada de Códex • -1 Ressonância", status:index === 0 ? "active" : "locked", optional:true
    });
    quests.push({
      id:`companion-${index}`, category:"companion", title:index % 2 ? "Dagra: O Golpe que Não Veio" : "Eliara: A Memória do Perdão",
      description:index % 2 ? "Dagra reconhece nesta região uma força que Timbó decidiu conter." : "Eliara encontrou uma lembrança que Lucas tentou classificar como inútil.",
      objective:`Converse com o eco no centro de ${region.settlement}.`, region:region.name, npc:index % 2 ? "Dagra" : "Eliara",
      progress:0, goal:1, rewards:"+8 Lealdade • Habilidade de vínculo", status:index === 0 ? "active" : "locked", optional:true
    });
  });
  return quests;
}

export function createTowerState(unlocked=false) {
  return {
    unlocked:Boolean(unlocked),seenIntro:false,bestFloor:0,totalRuns:0,currency:0,
    permanentUpgrades:{},codexEntries:[],activeRun:null,returnRegionIndex:0,returnPosition:null
  };
}

function migrateTower(rawTower,state) {
  const defaults=createTowerState(Boolean(state.ngPlus)||(state.primeCommands?.length||0)>=1),source=rawTower&&typeof rawTower==="object"?rawTower:{};
  const tower={...defaults,...source};
  tower.unlocked=Boolean(tower.unlocked||state.ngPlus||(state.primeCommands?.length||0)>=1);
  tower.seenIntro=Boolean(tower.seenIntro);tower.bestFloor=Math.max(0,Math.floor(Number(tower.bestFloor)||0));tower.totalRuns=Math.max(0,Math.floor(Number(tower.totalRuns)||0));tower.currency=Math.max(0,Math.floor(Number(tower.currency)||0));
  tower.permanentUpgrades=tower.permanentUpgrades&&typeof tower.permanentUpgrades==="object"?tower.permanentUpgrades:{};
  tower.codexEntries=Array.isArray(tower.codexEntries)?[...new Set(tower.codexEntries.filter((entry)=>typeof entry==="string"))]:[];
  tower.returnRegionIndex=Number.isInteger(tower.returnRegionIndex)&&tower.returnRegionIndex>=0&&tower.returnRegionIndex<REGIONS.length?tower.returnRegionIndex:state.regionIndex;
  tower.returnPosition=tower.returnPosition&&Number.isFinite(tower.returnPosition.x)&&Number.isFinite(tower.returnPosition.y)?{x:tower.returnPosition.x,y:tower.returnPosition.y}:null;
  const run=source.activeRun;
  if(!run||typeof run!=="object"||typeof run.seed!=="string"||!run.seed.trim()||!Number.isFinite(Number(run.floor))){tower.activeRun=null;return tower;}
  const position=run.playerPosition&&Number.isFinite(run.playerPosition.x)&&Number.isFinite(run.playerPosition.y)?{x:run.playerPosition.x,y:run.playerPosition.y}:null;
  tower.activeRun={
    version:1,seed:run.seed.slice(0,96),floor:Math.max(1,Math.floor(Number(run.floor)||1)),floorSeed:Number.isFinite(Number(run.floorSeed))?Number(run.floorSeed):null,
    difficulty:Math.max(.5,Math.min(8,Number(run.difficulty)||1)),playerPosition:position,
    hp:Math.max(1,Number(run.hp)||Number(state.hp)||1),focus:Math.max(0,Number(run.focus)||0),authority:Math.max(0,Number(run.authority)||0),companionHp:{eliara:Math.max(1,Number(run.companionHp?.eliara)||state.companions.eliara.hp),dagra:Math.max(1,Number(run.companionHp?.dagra)||state.companions.dagra.hp)},
    upgrades:Array.isArray(run.upgrades)?run.upgrades.filter((id)=>TOWER_RUN_UPGRADES.some((entry)=>entry.id===id)).slice(0,80):[],
    clearedEncounters:Array.isArray(run.clearedEncounters)?[...new Set(run.clearedEncounters.filter((id)=>typeof id==="string"))].slice(0,64):[],
    openedChests:Array.isArray(run.openedChests)?[...new Set(run.openedChests.filter((id)=>typeof id==="string"))].slice(0,48):[],
    activatedAltars:Array.isArray(run.activatedAltars)?[...new Set(run.activatedAltars.filter((id)=>typeof id==="string"))].slice(0,32):[],
    completedEvents:Array.isArray(run.completedEvents)?[...new Set(run.completedEvents.filter((id)=>typeof id==="string"))].slice(0,48):[],
    activatedObjectives:Array.isArray(run.activatedObjectives)?[...new Set(run.activatedObjectives.filter((id)=>typeof id==="string"))].slice(0,48):[],
    explored:Array.isArray(run.explored)?[...new Set(run.explored.filter((id)=>typeof id==="string"))].slice(0,4096):[],
    currentObjective:run.currentObjective&&typeof run.currentObjective==="object"?{...run.currentObjective}:null,
    resources:{towerCurrency:Math.max(0,Math.floor(Number(run.resources?.towerCurrency)||0)),ecos:Math.max(0,Math.floor(Number(run.resources?.ecos)||0)),materials:Math.max(0,Math.floor(Number(run.resources?.materials)||0))},
    floorChoices:run.floorChoices&&typeof run.floorChoices==="object"?{...run.floorChoices}:{},revivesUsed:Math.max(0,Math.floor(Number(run.revivesUsed)||0)),
    entryVitals:run.entryVitals&&typeof run.entryVitals==="object"?{hp:Math.max(1,Number(run.entryVitals.hp)||Number(state.hp)||1),focus:Math.max(0,Number(run.entryVitals.focus)||0),authority:Math.max(0,Number(run.entryVitals.authority)||0),companions:{eliara:Math.max(1,Number(run.entryVitals.companions?.eliara)||state.companions.eliara.hp),dagra:Math.max(1,Number(run.entryVitals.companions?.dagra)||state.companions.dagra.hp)}}:null,
    worldVitals:run.worldVitals&&typeof run.worldVitals==="object"?{hp:Math.max(1,Number(run.worldVitals.hp)||Number(state.hp)||1),focus:Math.max(0,Number(run.worldVitals.focus)||0),authority:Math.max(0,Number(run.worldVitals.authority)||0),companions:{eliara:Math.max(1,Number(run.worldVitals.companions?.eliara)||state.companions.eliara.hp),dagra:Math.max(1,Number(run.worldVitals.companions?.dagra)||state.companions.dagra.hp)}}:null,
    pendingEncounter:typeof run.pendingEncounter==="string"?run.pendingEncounter:null,startedAt:Number(run.startedAt)||Date.now(),lastSavedAt:Date.now()
  };
  return tower;
}

export function createNewState(route, ngPlus=false, visualVariant="masculino") {
  const meta = loadMeta();
  const variant = normalizeVisualVariant(visualVariant);
  const state = {
    version:SAVE_VERSION,
    createdAt:Date.now(), updatedAt:Date.now(), playTime:0,
    route, visualVariant:variant, rivalVisualVariant:variant, ngPlus, gameMode:"world",
    regionIndex:0, discoveredRegions:[0], completedRegions:[],
    worldScaleVersion:2, position:{x:348,y:1738}, facing:"front",
    level:ngPlus ? 6 : 1, xp:0, nextXp:100,
    hp:ngPlus ? 182 : 126, maxHp:ngPlus ? 182 : 126,
    focus:ngPlus ? 122 : 88, maxFocus:ngPlus ? 122 : 88,
    authority:5, maxAuthority:5,
    attack:ngPlus ? 42 : 26, defense:ngPlus ? 31 : 19, speed:ngPlus ? 32 : 24,
    resonance:ngPlus ? 18 : 4, fracture:ngPlus ? 24 : 8,
    philosophy:{order:0,will:0,free:0,silence:0},
    currency:ngPlus ? 540 : 120,
    materials:{},
    inventory:{potion:4,focus:2,remedy:1,relic_prime:ngPlus ? 1 : 0},
    equipment:{weapon:null,armor:null,accessory1:null,accessory2:null,boots:null,relic:ngPlus ? "relic_prime" : null},
    unlockedForms:ngPlus ? FORMS.map((f) => f.id) : ["base"],
    primaryForm:"base", secondaryForm:null, activeForm:"base",
    learnedSkills:route === "lucas" ? ["ice","life","order"] : ["blood","fire","domination"],
    skillPoints:ngPlus ? 4 : 1,
    primeCommands:[],
    defeated:{}, openedChests:[], inspectedAltars:[], talkedNpcs:[],
    companions:{ eliara:{unlocked:true,loyalty:50,hp:92,maxHp:92}, dagra:{unlocked:true,loyalty:50,hp:146,maxHp:146} },
    activeParty:["hero","eliara","dagra"],
    quests:makeQuests(),
    bestiary:[], codex:[...(ngPlus ? meta.codexLegacy : []),"fracture"],
    dialogueSeen:[], choices:{}, flags:{openingComplete:true, tutorialComplete:false},
    settings:loadSettings(), tower:createTowerState(ngPlus), pendingEnding:null, completed:false
  };
  REGIONS.forEach((region) => { state.materials[region.key] = 0; state.defeated[region.key] = []; });
  return state;
}

function migrateState(raw) {
  if (!raw || typeof raw !== "object" || !raw.route) return null;
  const variant = normalizeVisualVariant(raw.visualVariant || raw.gender);
  const clean = { ...createNewState(raw.route, Boolean(raw.ngPlus), variant), ...raw };
  clean.version = SAVE_VERSION;
  clean.gameMode=raw.gameMode==="tower"?"tower":"world";
  clean.visualVariant = variant;
  clean.rivalVisualVariant = normalizeVisualVariant(raw.rivalVisualVariant || variant);
  const globalSettings = loadSettings();
  const hasGlobalSettings = Boolean(safeParse(localStorage.getItem(SETTINGS_KEY), null));
  clean.settings = hasGlobalSettings
    ? { ...(raw.settings || {}), ...globalSettings, keys:{...DEFAULT_SETTINGS.keys,...(raw.settings?.keys||{}),...globalSettings.keys} }
    : { ...globalSettings, ...(raw.settings || {}), keys:{...DEFAULT_SETTINGS.keys,...globalSettings.keys,...(raw.settings?.keys||{})} };
  clean.settings.autoBattle = Boolean(hasGlobalSettings ? globalSettings.autoBattle : (raw.settings?.autoBattle ?? clean.settings.autoBattle));
  clean.settings.autoBattleItems = Boolean(hasGlobalSettings ? globalSettings.autoBattleItems : (raw.settings?.autoBattleItems ?? clean.settings.autoBattleItems));
  if (!["normal","large","extra-large"].includes(clean.settings.fontSize)) clean.settings.fontSize = "normal";
  const oldPosition = {x:310,y:770,...(raw.position || {})};
  clean.position = Number(raw.worldScaleVersion) >= 2 ? oldPosition : {x:oldPosition.x*2,y:oldPosition.y*2};
  clean.worldScaleVersion = 2;
  clean.philosophy = {order:0,will:0,free:0,silence:0,...(raw.philosophy || {})};
  clean.companions = {
    eliara:{unlocked:true,loyalty:50,hp:92,maxHp:92,...(raw.companions?.eliara || {})},
    dagra:{unlocked:true,loyalty:50,hp:146,maxHp:146,...(raw.companions?.dagra || {})}
  };
  REGIONS.forEach((region) => {
    if (!Array.isArray(clean.defeated?.[region.key])) clean.defeated[region.key] = [];
    if (typeof clean.materials?.[region.key] !== "number") clean.materials[region.key] = 0;
  });
  if (!Array.isArray(clean.quests) || clean.quests.length < 10) clean.quests = makeQuests();
  clean.tower=migrateTower(raw.tower,clean);
  if(clean.gameMode==="tower"&&!clean.tower.activeRun)clean.gameMode="world";
  return clean;
}

export function saveGame(state, slot="auto") {
  const payload = {...state, version:SAVE_VERSION, updatedAt:Date.now()};
  try {
    localStorage.setItem(`${SAVE_PREFIX}${slot}`, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Falha ao salvar", error);
    return false;
  }
}

export function loadGame(slot="auto") {
  const raw = safeParse(localStorage.getItem(`${SAVE_PREFIX}${slot}`));
  return migrateState(raw);
}

export function deleteSave(slot) { localStorage.removeItem(`${SAVE_PREFIX}${slot}`); }

export function listSaves() {
  return ["auto","1","2","3"].map((slot) => {
    const state = loadGame(slot);
    return state ? {
      slot, route:state.route, region:REGIONS[state.regionIndex]?.name || "Desconhecida", level:state.level,
      visualVariant:state.visualVariant, commands:state.primeCommands?.length || 0, updatedAt:state.updatedAt, playTime:state.playTime || 0, ngPlus:Boolean(state.ngPlus)
    } : {slot,empty:true};
  });
}

export function hasAnySave() { return listSaves().some((entry) => !entry.empty); }

export function getItem(id) { return ITEMS.find((item) => item.id === id); }

export function getPlayerStats(state) {
  const form = FORMS.find((entry) => entry.id === state.activeForm) || FORMS[0];
  const stats = { hp:state.maxHp, focus:state.maxFocus, attack:state.attack, defense:state.defense, speed:state.speed };
  Object.entries(state.equipment || {}).forEach(([,id]) => {
    const item = getItem(id);
    if (!item?.stats) return;
    Object.entries(item.stats).forEach(([key,value]) => { stats[key] = (stats[key] || 0) + value; });
  });
  Object.entries(form.stats || {}).forEach(([key,value]) => { stats[key] = (stats[key] || 0) + value; });
  const levelBonus = Math.max(0,state.level - 1);
  stats.attack += levelBonus * 2;
  stats.defense += levelBonus;
  stats.speed += Math.floor(levelBonus * .7);
  if(state.gameMode==="tower"&&state.tower?.activeRun){
    const ids=state.tower.activeRun.upgrades||[];
    for(const upgrade of TOWER_RUN_UPGRADES){const count=ids.filter((id)=>id===upgrade.id).length;if(!count||!upgrade.stat)continue;stats[upgrade.stat]=Math.round(stats[upgrade.stat]*(1+upgrade.value*count));}
  }
  return stats;
}

export function addInventory(state, itemId, quantity=1) {
  state.inventory[itemId] = (state.inventory[itemId] || 0) + quantity;
}

export function removeInventory(state, itemId, quantity=1) {
  const next = Math.max(0,(state.inventory[itemId] || 0) - quantity);
  state.inventory[itemId] = next;
  return next;
}

export function addXp(state, amount) {
  let leveled = false;
  state.xp += amount;
  while (state.xp >= state.nextXp) {
    state.xp -= state.nextXp;
    state.level += 1;
    state.nextXp = Math.round(state.nextXp * 1.28);
    state.maxHp += 12;
    state.maxFocus += 7;
    state.attack += 3;
    state.defense += 2;
    state.speed += 1;
    state.skillPoints += 1;
    state.hp = state.maxHp;
    state.focus = state.maxFocus;
    leveled = true;
  }
  return leveled;
}

export function updateQuest(state, id, amount=1) {
  const quest = state.quests.find((entry) => entry.id === id);
  if (!quest || quest.status === "completed" || quest.status === "locked") return null;
  quest.progress = Math.min(quest.goal, quest.progress + amount);
  if (quest.progress >= quest.goal) {
    quest.status = "completed";
    state.currency += quest.category === "main" ? 90 + Number(id.split("-")[1] || 0) * 25 : 45;
    return {quest,completed:true};
  }
  return {quest,completed:false};
}

export function unlockRegionQuests(state, regionIndex) {
  state.quests.filter((quest) => quest.region === REGIONS[regionIndex]?.name && quest.status === "locked").forEach((quest) => { quest.status = "active"; });
}

export function totalMaterials(state) {
  return Object.values(state.materials || {}).reduce((sum,value) => sum + Number(value || 0),0);
}
