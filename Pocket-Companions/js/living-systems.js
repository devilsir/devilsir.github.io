import {
  LIVING_SCHEMA, TRAITS, PET_TRAIT_SEEDS, EMOTIONS, FOOD_PREFERENCES, TOY_PREFERENCES, ENVIRONMENT_PREFERENCES,
  AFFECTION_PREFERENCES, WEATHER_TYPES, SEASONS, CONDITIONS, INGREDIENTS, RECIPES, GROOMING, COMMANDS,
  SKILL_PATHS, LIFE_STAGES, PET_QUESTS, PET_QUEST_TRIGGERS, WALK_LOCATIONS, SECRETS, FURNITURE, ROOM_UPGRADES, ACCESSORIES, EVENTS, EVENT_MISSIONS, DREAMS,
  SHAMPOOS, ANIMATION_CAPABILITIES
} from './living-data.js';
import { clamp, uid, todayKey } from './utils.js';
import { getLanguage } from './i18n.js';
import { SimulationRuntime } from './simulation/simulation.js';
import { migrateSimulationState } from './simulation/schema.js';
import { applyTrainingResult, evaluateTrainingAttempt, migrateTrainingRecord } from './simulation/training.js';
import { speciesForPet } from './simulation/species-behaviors.js';

const HOUR = 3600000;
const DAY = 86400000;
const WEEK = 7 * DAY;
const deepClone = (value) => JSON.parse(JSON.stringify(value));
const localized = (value) => typeof value === 'string' ? value : (getLanguage() === 'en' ? value?.en : value?.pt) || value?.en || '';
const numberHash = (text = '') => [...String(text)].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
const chance = (probability = 0.5) => Math.random() < clamp(Number(probability) || 0, 0, 1);
const seededChoice = (items, seed, offset = 0) => items[(numberHash(`${seed}:${offset}`) % items.length + items.length) % items.length];
const cappedPush = (array, item, max) => { array.push(item); if (array.length > max) array.splice(0, array.length - max); };
const weekKey = (time = Date.now()) => Math.floor((time - new Date(2024, 0, 1).getTime()) / WEEK);

function defaultPreferenceState(slot) {
  const seed = `${slot.id}:${slot.companionId}`;
  const favoriteFood = seededChoice(FOOD_PREFERENCES, seed, 1);
  let dislikedFood = seededChoice(FOOD_PREFERENCES, seed, 2);
  if (dislikedFood === favoriteFood) dislikedFood = FOOD_PREFERENCES[(FOOD_PREFERENCES.indexOf(dislikedFood) + 1) % FOOD_PREFERENCES.length];
  return {
    favoriteFood: { value: favoriteFood, confidence: 0, status: 'unknown' },
    dislikedFood: { value: dislikedFood, confidence: 0, status: 'unknown' },
    favoriteTreat: { value: 'treat', confidence: 0, status: 'unknown' },
    favoriteToy: { value: seededChoice(TOY_PREFERENCES, seed, 3), confidence: 0, status: 'unknown' },
    favoriteEnvironment: { value: seededChoice(ENVIRONMENT_PREFERENCES, seed, 4), confidence: 0, status: 'unknown' },
    favoriteSleepingLocation: { value: seededChoice(['bedroom', 'living', 'garden'], seed, 5), confidence: 0, status: 'unknown' },
    favoriteMinigame: { value: seededChoice(['chase', 'stars', 'light', 'hidden', 'rhythm', 'obstacle', 'memory', 'maze'], seed, 6), confidence: 0, status: 'unknown' },
    favoriteAffection: { value: seededChoice(AFFECTION_PREFERENCES, seed, 7), confidence: 0, status: 'unknown' },
    activePeriod: { value: seededChoice(['morning', 'day', 'sunset', 'night'], seed, 8), confidence: 0, status: 'unknown' },
    weather: { value: seededChoice(['clear', 'rain', 'snow', 'sunshine', 'wind'], seed, 9), confidence: 0, status: 'unknown' },
    social: { value: seededChoice(['solo', 'pair', 'player'], seed, 10), confidence: 0, status: 'unknown' },
    groomingTolerance: { value: 35 + numberHash(`${seed}:11`) % 56, confidence: 0, status: 'unknown' },
    fear: { value: seededChoice(['thunderstorm', 'vacuum', 'deep-water', 'crowds', 'none'], seed, 12), confidence: 0, status: 'unknown' }
  };
}

function weeklyChallenges(slot, key = weekKey()) {
  const pool = [
    { id: 'games', type: 'play', target: 3, label: { en: 'Complete 3 minigames', pt: 'Complete 3 minijogos' } },
    { id: 'training', type: 'training', target: 2, label: { en: 'Practice 2 commands', pt: 'Pratique 2 comandos' } },
    { id: 'meal', type: 'cook', target: 1, label: { en: 'Prepare a meal', pt: 'Prepare uma refeição' } },
    { id: 'groom', type: 'groom', target: 2, label: { en: 'Complete 2 grooming actions', pt: 'Complete 2 cuidados de higiene' } },
    { id: 'walk', type: 'walk', target: 2, label: { en: 'Visit 2 walk locations', pt: 'Visite 2 locais de passeio' } },
    { id: 'secret', type: 'secret', target: 1, label: { en: 'Discover a secret', pt: 'Descubra um segredo' } },
    { id: 'preference', type: 'preference', target: 1, label: { en: 'Confirm a preference', pt: 'Confirme uma preferência' } },
    { id: 'social', type: 'social', target: 2, label: { en: 'Share 2 positive pet interactions', pt: 'Faça 2 interações positivas entre pets' } }
  ];
  const start = numberHash(`${slot.id}:${key}`) % pool.length;
  return [0, 1, 2].map((offset) => ({ ...deepClone(pool[(start + offset * 3) % pool.length]), progress: 0, complete: false }));
}

export function createLivingState(slot) {
  const personality = { ...PET_TRAIT_SEEDS[slot.companionId] };
  return {
    schema: LIVING_SCHEMA,
    personality,
    personalityLastChange: {},
    emotion: { id: 'content', since: Date.now(), intensity: 0.55, hint: '' },
    preferences: defaultPreferenceState(slot),
    conditions: [],
    healthHistory: [],
    clinic: { visits: 0, lastVisitAt: 0, lastPreventiveAt: 0, weightHistory: [] },
    hydration: 78,
    ingredients: { rice: 2, pumpkin: 1, fish: 0, berries: 1, herbs: 0, chicken: 1, water: 3 },
    recipesUnlocked: ['pumpkin-bowl'],
    preparedMeals: {},
    grooming: { tolerance: 50, actions: {}, shampoo: 'gentle' },
    commands: Object.fromEntries(Object.keys(COMMANDS).map((id) => [id, migrateTrainingRecord({}, id)])),
    skills: { points: 1, spent: 0, unlocked: [], freeResets: 1 },
    lifeStage: 'young',
    quest: { id: slot.companionId, step: 0, completed: false, choices: [], ready: false, objectiveProgress: 0, lastTrigger: null },
    walks: { visited: [], discoveries: [], history: [] },
    world: { weather: 'clear', weatherStartedAt: Date.now(), season: 'spring', seasonStartedAt: Date.now(), weatherSeed: numberHash(slot.id), fixedWeather: null, fixedSeason: null },
    secrets: {},
    decorations: [],
    defaultFurnitureTransforms: {},
    defaultFurnitureStored: {},
    furnitureInventory: {},
    roomUpgrades: Object.fromEntries(Object.keys(ROOM_UPGRADES).map((id) => [id, 0])),
    accessories: { owned: [], equipped: null },
    timeline: [],
    memoryCosmetics: { frames: ['plain'], stickers: [], backgrounds: ['classic'], favoritePhotoId: null },
    eventArchive: [],
    activeEvent: null,
    weekly: { key: weekKey(), challenges: weeklyChallenges(slot), claimed: false },
    bondCalendar: { days: {}, grace: 2 },
    secondaryPetId: null,
    relationships: {},
    bodyLanguage: { last: 'relaxed', observationScore: 0 },
    dreams: { played: [], lastAt: 0, rare: [] },
    scent: { level: 1, experience: 0, found: [] },
    longTermMemories: [],
    recentActions: [],
    simulation: migrateSimulationState(slot, null),
    autonomy: { recent: [], lastActionAt: 0, blockedTargets: [] },
    antiExploit: {}
  };
}

export function migrateLivingState(slot) {
  const defaults = createLivingState(slot);
  const source = slot.living && typeof slot.living === 'object' ? slot.living : {};
  const merged = { ...defaults, ...source, schema: LIVING_SCHEMA };
  merged.personality = { ...defaults.personality, ...(source.personality || {}) };
  for (const trait of TRAITS) merged.personality[trait] = clamp(Number(merged.personality[trait]) || defaults.personality[trait], 0, 100);
  merged.preferences = Object.fromEntries(Object.entries(defaults.preferences).map(([key, value]) => [key, { ...value, ...(source.preferences?.[key] || {}) }]));
  merged.ingredients = { ...defaults.ingredients, ...(source.ingredients || {}) };
  merged.preparedMeals = { ...defaults.preparedMeals, ...(source.preparedMeals || {}) };
  merged.commands = Object.fromEntries(Object.entries(defaults.commands).map(([key]) => [key, migrateTrainingRecord(source.commands?.[key], key)]));
  merged.skills = { ...defaults.skills, ...(source.skills || {}), unlocked: Array.isArray(source.skills?.unlocked) ? [...new Set(source.skills.unlocked)].slice(0, 9) : [] };
  merged.world = { ...defaults.world, ...(source.world || {}) };
  merged.grooming = { ...defaults.grooming, ...(source.grooming || {}), actions: { ...defaults.grooming.actions, ...(source.grooming?.actions || {}) } };
  merged.walks = { ...defaults.walks, ...(source.walks || {}), visited: Array.isArray(source.walks?.visited) ? [...new Set(source.walks.visited)].slice(0, 16) : [], discoveries: Array.isArray(source.walks?.discoveries) ? source.walks.discoveries.slice(-60) : [], history: Array.isArray(source.walks?.history) ? source.walks.history.slice(-60) : [] };
  merged.weekly = source.weekly?.key === weekKey() ? { ...defaults.weekly, ...source.weekly } : defaults.weekly;
  merged.bondCalendar = { ...defaults.bondCalendar, ...(source.bondCalendar || {}), days: source.bondCalendar?.days && typeof source.bondCalendar.days === 'object' ? source.bondCalendar.days : {} };
  merged.quest = { ...defaults.quest, ...(source.quest || {}), choices: Array.isArray(source.quest?.choices) ? source.quest.choices.slice(-12) : [] };
  merged.clinic = { ...defaults.clinic, ...(source.clinic || {}), weightHistory: Array.isArray(source.clinic?.weightHistory) ? source.clinic.weightHistory.slice(-24) : [] };
  const ownedAccessories = Array.isArray(source.accessories?.owned)
    ? [...new Set(source.accessories.owned)].filter((id) => ACCESSORIES[id]?.model)
    : [];
  const equippedAccessory = ownedAccessories.includes(source.accessories?.equipped)
    ? source.accessories.equipped
    : null;
  merged.accessories = { ...defaults.accessories, ...(source.accessories || {}), owned: ownedAccessories, equipped: equippedAccessory };
  merged.dreams = { ...defaults.dreams, ...(source.dreams || {}), played: Array.isArray(source.dreams?.played) ? source.dreams.played.slice(-30) : [], rare: Array.isArray(source.dreams?.rare) ? [...new Set(source.dreams.rare)].slice(-20) : [] };
  merged.scent = { ...defaults.scent, ...(source.scent || {}), found: Array.isArray(source.scent?.found) ? [...new Set(source.scent.found)].slice(-40) : [] };
  merged.bodyLanguage = { ...defaults.bodyLanguage, ...(source.bodyLanguage || {}) };
  merged.autonomy = { ...defaults.autonomy, ...(source.autonomy || {}), recent: Array.isArray(source.autonomy?.recent) ? source.autonomy.recent.slice(-8) : [], blockedTargets: Array.isArray(source.autonomy?.blockedTargets) ? source.autonomy.blockedTargets.slice(-10) : [] };
  merged.relationships = source.relationships && typeof source.relationships === 'object' ? source.relationships : {};
  for (const [key, relationship] of Object.entries(merged.relationships)) {
    merged.relationships[key] = {
      familiarity: 10, trust: 8, affection: relationship?.attachment || relationship?.comfort || 4,
      rivalry: 4, jealousy: 0, playCompatibility: relationship?.playfulness || 10,
      resourceTension: 0, protectiveTendency: 0, playfulness: 10, comfort: 8,
      attachment: 4, interactions: 0, ...(relationship || {})
    };
  }
  merged.furnitureInventory = source.furnitureInventory && typeof source.furnitureInventory === 'object' ? source.furnitureInventory : {};
  merged.defaultFurnitureTransforms = source.defaultFurnitureTransforms && typeof source.defaultFurnitureTransforms === 'object' ? source.defaultFurnitureTransforms : {};
  merged.defaultFurnitureStored = source.defaultFurnitureStored && typeof source.defaultFurnitureStored === 'object' ? source.defaultFurnitureStored : {};
  merged.roomUpgrades = { ...defaults.roomUpgrades, ...(source.roomUpgrades || {}) };
  Object.keys(merged.roomUpgrades).forEach((room) => { merged.roomUpgrades[room] = clamp(Math.floor(Number(merged.roomUpgrades[room]) || 0), 0, 3); });
  merged.memoryCosmetics = { ...defaults.memoryCosmetics, ...(source.memoryCosmetics || {}), frames: Array.isArray(source.memoryCosmetics?.frames) ? [...new Set(source.memoryCosmetics.frames)].slice(-16) : ['plain'], stickers: Array.isArray(source.memoryCosmetics?.stickers) ? [...new Set(source.memoryCosmetics.stickers)].slice(-30) : [], backgrounds: Array.isArray(source.memoryCosmetics?.backgrounds) ? [...new Set(source.memoryCosmetics.backgrounds)].slice(-16) : ['classic'] };
  merged.conditions = Array.isArray(source.conditions) ? source.conditions.slice(0, 4) : [];
  merged.timeline = Array.isArray(source.timeline) ? source.timeline.slice(-180) : [];
  merged.longTermMemories = Array.isArray(source.longTermMemories) ? source.longTermMemories.slice(-80) : [];
  merged.decorations = [];
  if (Array.isArray(source.decorations)) {
    for (const raw of source.decorations.slice(0, 120)) {
      const item = FURNITURE[raw?.item];
      if (!item) continue;
      const room = raw.room || 'living';
      if (Array.isArray(item.rooms) && !item.rooms.includes(room)) {
        merged.furnitureInventory[raw.item] = (merged.furnitureInventory[raw.item] || 0) + 1;
        continue;
      }
      merged.decorations.push({ ...raw, room, y: clamp(Number(raw?.y) || 0, 0, 5.5), scale: clamp(Number(raw?.scale) || 1, 0.55, 2.2) });
    }
  }
  merged.eventArchive = Array.isArray(source.eventArchive) ? source.eventArchive.slice(-24) : [];
  merged.recentActions = Array.isArray(source.recentActions) ? source.recentActions.slice(-30) : [];
  merged.simulation = migrateSimulationState(slot, source.simulation);
  merged.hydration = clamp(Number(source.hydration ?? defaults.hydration), 0, 100);
  merged.activeEvent = source.activeEvent && typeof source.activeEvent === 'object' ? source.activeEvent : null;
  if (merged.activeEvent && !Array.isArray(merged.activeEvent.missions)) {
    merged.activeEvent.missions = deepClone(EVENT_MISSIONS[merged.activeEvent.id] || []).map((mission) => ({ ...mission, progress: 0, complete: false }));
  }
  return merged;
}

export class LivingSystems extends EventTarget {
  constructor({ store, scene, playSound = () => {}, showDialogue = () => {}, toast = () => {}, onWorldChange = () => {} }) {
    super();
    this.store = store;
    this.scene = scene;
    this.playSound = playSound;
    this.showDialogue = showDialogue;
    this.toast = toast;
    this.onWorldChange = onWorldChange;
    this.bus = new EventTarget();
    this.lastTickAt = Date.now();
    this.lastSecondaryTickAt = Date.now();
    this.simulationRuntime = new SimulationRuntime(this);
  }

  get slot() { return this.store.active; }
  get state() { return this.slot?.living; }
  t(value) { return localized(value); }

  ensure() {
    const slot = this.slot;
    if (!slot) return null;
    if (!slot.living || slot.living.schema !== LIVING_SCHEMA) slot.living = migrateLivingState(slot);
    this.ensureWeekly();
    return slot.living;
  }

  async activate() {
    if (!this.ensure()) return;
    this.refreshLifeStage(false);
    const state = this.state;
    this.scene.setRoomUpgrades?.(state.roomUpgrades);
    this.scene.setDefaultFurnitureTransforms?.(state.defaultFurnitureTransforms);
    this.scene.setDefaultFurnitureStored?.(state.defaultFurnitureStored);
    if (!this.scene.travelLocation && this.scene.roomId === this.slot.activeRoom) this.scene.buildEnvironment?.(this.slot.activeRoom);
    this.scene.setWorldState?.({ weather: this.currentWeather(), season: this.currentSeason() });
    this.scene.setDecorations?.(state.decorations);
    this.scene.setAccessory?.(state.accessories.equipped);
    const secondaryOwned = this.store.data.slots.some((entry) => entry?.companionId === state.secondaryPetId && entry !== this.slot);
    if (!secondaryOwned) state.secondaryPetId = null;
    await this.scene.setSecondaryPet?.(state.secondaryPetId);
    this.scene.setAutonomyProvider?.(() => this.chooseAutonomousAction());
    this.evaluateEmotion(true);
    return this.simulationRuntime.activate();
  }

  ensureWeekly(now = Date.now()) {
    if (!this.state) return;
    const key = weekKey(now);
    if (this.state.weekly?.key !== key) this.state.weekly = { key, challenges: weeklyChallenges(this.slot, key), claimed: false };
  }

  tick(now = Date.now()) {
    const state = this.ensure();
    if (!state) return;
    const elapsed = Math.max(0, Math.min(12 * HOUR, now - (state.simulation.lastAt || now)));
    state.simulation.lastAt = now;
    const elapsedHours = elapsed / HOUR;
    state.hydration = clamp(state.hydration - elapsedHours * (this.slot.isSleeping ? 0.7 : 1.7), 0, 100);
    this.ensureWeekly(now);
    if (!state.world.fixedWeather && now - state.world.weatherStartedAt > 7 * 60000) this.advanceWeather(now);
    if (!state.world.fixedSeason && now - state.world.seasonStartedAt > 3 * DAY) this.advanceSeason(now);
    if (now - state.simulation.lastEmotionAt > 3500) {
      state.simulation.lastEmotionAt = now;
      this.evaluateEmotion();
    }
    if (now - state.simulation.lastConditionCheckAt > 10 * 60000) {
      state.simulation.lastConditionCheckAt = now;
      this.updateConditions(elapsed, now);
    }
    if (state.secondaryPetId && now - this.lastSecondaryTickAt > 60000) {
      this.lastSecondaryTickAt = now;
      this.tickSecondaryPet(Math.min(elapsedHours, 0.25));
    }
    if (['garden', 'park'].includes(this.slot.activeRoom)) this.applyOutdoorSociability(now);
    this.simulationRuntime.tick(now);
    this.refreshLifeStage();
    if (now - (state.simulation.lastPersistAt || 0) > 10000) {
      state.simulation.lastPersistAt = now;
      this.store.persist();
    }
  }

  tickSecondaryPet(elapsedHours) {
    if (!elapsedHours || !this.state.secondaryPetId) return;
    const other = this.store.data.slots.find((entry) => entry?.companionId === this.state.secondaryPetId);
    if (!other) return;
    const factor = other.isSleeping ? 0.35 : 1;
    other.stats.hunger = clamp(other.stats.hunger - elapsedHours * 1.7 * factor);
    other.stats.energy = clamp(other.stats.energy + elapsedHours * (other.isSleeping ? 18 : -1.2));
    other.stats.happiness = clamp(other.stats.happiness - elapsedHours * 0.45);
    other.living = migrateLivingState(other);
    other.living.hydration = clamp(other.living.hydration - elapsedHours * (other.isSleeping ? 0.7 : 1.7));
  }

  currentWeather() { return this.state?.world.fixedWeather || this.state?.world.weather || 'clear'; }
  currentSeason() { return this.state?.world.fixedSeason || this.state?.world.season || 'spring'; }

  setWeather(weather) {
    if (weather !== 'dynamic' && !WEATHER_TYPES.includes(weather)) return false;
    this.state.world.fixedWeather = weather === 'dynamic' ? null : weather;
    if (weather !== 'dynamic') this.state.world.weather = weather;
    this.state.world.weatherStartedAt = Date.now();
    this.scene.setWorldState?.({ weather: this.currentWeather(), season: this.currentSeason() });
    this.record('weather', { weather: this.currentWeather() });
    this.onWorldChange();
    return true;
  }

  setSeason(season) {
    if (season !== 'automatic' && !SEASONS.includes(season)) return false;
    this.state.world.fixedSeason = season === 'automatic' ? null : season;
    if (season !== 'automatic') this.state.world.season = season;
    this.state.world.seasonStartedAt = Date.now();
    this.scene.setWorldState?.({ weather: this.currentWeather(), season: this.currentSeason() });
    this.onWorldChange();
    return true;
  }

  advanceWeather(now = Date.now()) {
    const season = this.currentSeason();
    const tables = {
      spring: ['clear','rain','rain','wind','sunshine','fog','rainbow'], summer: ['clear','clear','sunshine','wind','rain','thunderstorm','rainbow'],
      autumn: ['clear','rain','wind','fog','rain','thunderstorm'], winter: ['clear','snow','snow','fog','wind','rain']
    };
    const list = tables[season] || WEATHER_TYPES;
    const next = seededChoice(list, `${this.state.world.weatherSeed}:${Math.floor(now / 420000)}`);
    this.state.world.weather = next;
    this.state.world.weatherStartedAt = now;
    this.scene.setWorldState?.({ weather: next, season });
    this.record('weather', { weather: next }, { timeline: false });
    this.onWorldChange();
  }

  advanceSeason(now = Date.now()) {
    const current = this.state.world.season;
    this.state.world.season = SEASONS[(SEASONS.indexOf(current) + 1) % SEASONS.length];
    this.state.world.seasonStartedAt = now;
    this.scene.setWorldState?.({ weather: this.currentWeather(), season: this.currentSeason() });
    this.addMemory('season', { season: this.currentSeason() }, 0.55);
    this.onWorldChange();
  }

  chooseAutonomousAction() {
    return this.simulationRuntime.chooseAutonomousAction();
  }

  forceAutonomousAction(behaviorId, options = {}) {
    return this.simulationRuntime.forceAutonomousAction(behaviorId, options);
  }

  stopForcedAutonomousAction() {
    return this.simulationRuntime.stopForcedAutonomousAction();
  }

  forceEmergentEvent(eventId) {
    return this.simulationRuntime.forceEmergentEvent(eventId);
  }

  clearEmergentEvent() {
    return this.simulationRuntime.clearEmergentEvent();
  }

  evaluateEmotion(force = false) {
    const slot = this.slot;
    const state = this.state;
    if (!slot || !state) return 'content';
    const stats = slot.stats;
    const weather = this.currentWeather();
    const candidates = [];
    const add = (id, score, hint) => candidates.push({ id, score, hint });
    add('sleepy', (100 - stats.energy) * 1.2 + (slot.isSleeping ? 80 : 0), { en: 'Slow posture and heavy eyes', pt: 'Postura lenta e olhos pesados' });
    add('bored', (100 - stats.happiness) + (state.personality.playful * 0.25), { en: 'Looking for something to do', pt: 'Procurando algo para fazer' });
    add('lonely', (Math.max(0, (Date.now() - (slot.interactions.lastDialogueAt || slot.lastActive)) / HOUR) * 4 + (100 - stats.bond) * 0.15) * (1 - this.skillEffect('loneliness')), { en: 'Staying closer to your interaction area', pt: 'Ficando mais perto da área de interação' });
    add('frightened', weather === 'thunderstorm' ? 65 + (100 - state.personality.brave) * 0.4 + (state.longTermMemories.some((m) => m.type === 'storm' && m.valence < 0) ? 16 : 0) : 0, { en: 'Seeking a safe, familiar place', pt: 'Procurando um lugar seguro e familiar' });
    add('anxious', state.conditions.some((c) => c.id === 'stress') ? 75 : Math.max(0, 45 - stats.health), { en: 'Pacing and checking the room', pt: 'Andando e observando o ambiente' });
    add('irritated', state.conditions.length * 14 + (100 - stats.hygiene) * 0.25, { en: 'Short movements and less patience', pt: 'Movimentos curtos e menos paciência' });
    add('jealous', state.secondaryPetId && this.relationship().rivalry > 55 ? 48 : 0, { en: 'Watching the other pet closely', pt: 'Observando o outro pet com atenção' });
    add('curious', state.personality.curious * 0.55 + (slot.activeRoom === state.preferences.favoriteEnvironment.value ? 20 : 0), { en: 'Head tilted toward new details', pt: 'Cabeça inclinada para novidades' });
    add('playful', state.personality.playful * 0.5 + stats.energy * 0.25 + stats.happiness * 0.25, { en: 'Bouncy movement and invitations to play', pt: 'Movimentos saltitantes e convites para brincar' });
    add('proud', state.recentActions.some((a) => a.type === 'training-success' && Date.now() - a.at < 120000) ? 85 : 0, { en: 'Confident posture after learning', pt: 'Postura confiante depois de aprender' });
    add('excited', stats.happiness * 0.42 + stats.energy * 0.36 + state.personality.playful * 0.22, { en: 'Fast movement and happy sounds', pt: 'Movimento rápido e sons felizes' });
    add('content', stats.happiness * 0.38 + stats.health * 0.32 + stats.bond * 0.2 + state.personality.calm * 0.2, { en: 'Relaxed posture and soft attention', pt: 'Postura relaxada e atenção tranquila' });
    candidates.sort((a, b) => b.score - a.score);
    const selected = candidates[0] || { id: 'content', score: 50, hint: '' };
    const previous = state.emotion.id;
    const minimumDuration = 9000;
    if (!force && previous !== selected.id && Date.now() - state.emotion.since < minimumDuration && selected.score < (state.emotion.intensity * 100 + 18)) return previous;
    if (previous !== selected.id) {
      state.emotion = { id: selected.id, since: Date.now(), intensity: clamp(selected.score / 100, 0.2, 1), hint: localized(selected.hint) };
      this.dispatchEvent(new CustomEvent('emotion', { detail: state.emotion }));
    } else {
      state.emotion.intensity = clamp(selected.score / 100, 0.2, 1);
      state.emotion.hint = localized(selected.hint);
    }
    return state.emotion.id;
  }

  emotionLabel() { return localized(EMOTIONS[this.state?.emotion?.id] || EMOTIONS.content); }

  traitChange(trait, amount, source) {
    if (!TRAITS.includes(trait) || !this.state) return;
    const now = Date.now();
    const key = `${trait}:${source}`;
    const last = this.state.personalityLastChange[key] || 0;
    const damp = now - last < 10 * 60000 ? 0.2 : now - last < HOUR ? 0.55 : 1;
    this.state.personality[trait] = clamp(this.state.personality[trait] + amount * damp, 5, 95);
    this.state.personalityLastChange[key] = now;
  }

  observePreference(key, observedValue, positive = true, strength = 12) {
    const pref = this.state?.preferences?.[key];
    if (!pref || observedValue !== pref.value) return false;
    const oldStatus = pref.status;
    const discoveryBonus = 1 + this.skillEffect('preference');
    pref.confidence = clamp(pref.confidence + (positive ? strength : strength * 0.7) * discoveryBonus, 0, 100);
    pref.status = pref.confidence >= 70 ? 'confirmed' : pref.confidence >= 28 ? 'suspected' : 'unknown';
    if (oldStatus !== 'confirmed' && pref.status === 'confirmed') {
      this.record('preference', { key, value: pref.value });
      this.addTimeline('preference', { key, value: pref.value });
      this.toast(getLanguage() === 'en' ? 'A preference was confirmed.' : 'Uma preferência foi confirmada.');
    }
    return true;
  }

  record(type, detail = {}, options = {}) {
    if (!this.state) return;
    const action = { type, detail, at: Date.now() };
    cappedPush(this.state.recentActions, action, 30);
    this.updateWeekly(type, 1);
    this.updateBondCalendar(type);
    const changes = {
      pet: () => { this.traitChange('affectionate', 0.45, 'pet'); this.traitChange('calm', 0.22, 'pet'); this.observePreference('favoriteAffection', detail.kind || 'calm', true, 8); },
      play: () => { this.traitChange('playful', 0.55, 'play'); this.observePreference('favoriteMinigame', detail.gameId, true, 9); },
      feed: () => { this.traitChange('foodMotivated', detail.foodId === 'treat' ? 0.5 : 0.12, 'feed'); this.observePreference('favoriteFood', detail.foodId, true, 11); this.observePreference('dislikedFood', detail.foodId, false, 5); },
      walk: () => { this.traitChange('brave', 0.35, 'walk'); this.traitChange('curious', 0.3, 'walk'); this.observePreference('favoriteEnvironment', detail.location || detail.room, true, 8); },
      groom: () => { this.traitChange('calm', 0.22, 'groom'); this.observePreference('groomingTolerance', this.state.preferences.groomingTolerance.value, true, 7); },
      social: () => { this.traitChange('sociable', 0.42, 'social'); this.traitChange('independent', -0.12, 'social'); },
      ignored: () => { this.traitChange('independent', 0.35, 'ignored'); },
      'training-fail': () => this.traitChange('stubborn', 0.3, 'training'),
      'training-success': () => { this.traitChange('stubborn', -0.18, 'training'); this.traitChange('calm', 0.12, 'training'); }
    };
    changes[type]?.();
    if (options.timeline) this.addTimeline(type, detail, options.photo || null);
    this.progressQuestFromEvent(type, detail);
    this.progressActiveEvent(type, detail);
    this.simulationRuntime.observe(type, detail);
    if (type === 'weather' && detail.weather === 'thunderstorm') this.addMemory('storm', { room: this.slot.activeRoom }, -0.45, 0.72);
    this.bus.dispatchEvent(new CustomEvent(type, { detail }));
    this.store.persist();
  }

  addTimeline(type, detail = {}, photo = null) {
    const entry = { id: uid(), type, at: Date.now(), pet: this.slot.companionId, room: this.slot.activeRoom, weather: this.currentWeather(), season: this.currentSeason(), detail, photo };
    cappedPush(this.state.timeline, entry, 180);
    return entry;
  }

  addMemory(type, detail = {}, valence = 0.5, salience = 0.5) {
    const existing = this.state.longTermMemories.find((memory) => memory.type === type && JSON.stringify(memory.detail) === JSON.stringify(detail));
    if (existing) {
      existing.reinforcement = clamp((existing.reinforcement || 1) + 1, 1, 12);
      existing.lastAt = Date.now();
      existing.salience = clamp(existing.salience + 0.08, 0, 1);
      return existing;
    }
    const memory = { id: uid(), type, detail, createdAt: Date.now(), lastAt: Date.now(), valence: clamp(valence, -1, 1), salience: clamp(salience, 0, 1), reinforcement: 1 };
    cappedPush(this.state.longTermMemories, memory, 80);
    return memory;
  }

  updateWeekly(type, amount = 1) {
    this.ensureWeekly();
    for (const challenge of this.state.weekly.challenges) {
      if (challenge.type !== type || challenge.complete) continue;
      challenge.progress = Math.min(challenge.target, challenge.progress + amount);
      challenge.complete = challenge.progress >= challenge.target;
    }
    if (!this.state.weekly.claimed && this.state.weekly.challenges.every((item) => item.complete)) {
      this.state.weekly.claimed = true;
      this.store.gainProgress(55, 85);
      this.toast(getLanguage() === 'en' ? 'Weekly set complete: +85 coins.' : 'Semana completa: +85 moedas.');
    }
  }

  updateBondCalendar(type) {
    const meaningful = ['feed','play','groom','training','walk','cook','photo','quest','pet','sleep','preference','social'];
    if (!meaningful.includes(type)) return;
    const key = todayKey();
    const day = this.state.bondCalendar.days[key] || { actions: [], complete: false };
    if (!day.actions.includes(type)) day.actions.push(type);
    day.complete = day.actions.length >= 3;
    this.state.bondCalendar.days[key] = day;
    const keys = Object.keys(this.state.bondCalendar.days).sort();
    if (keys.length > 42) keys.slice(0, keys.length - 42).forEach((old) => delete this.state.bondCalendar.days[old]);
  }

  updateConditions(elapsed, now) {
    const slot = this.slot;
    const state = this.state;
    for (const condition of state.conditions) {
      const careBonus = condition.careProgress || 0;
      condition.severity = clamp(condition.severity - elapsed / HOUR * (2.5 + careBonus), 0, 100);
    }
    const recovered = state.conditions.filter((condition) => condition.severity <= 0);
    if (recovered.length) {
      state.conditions = state.conditions.filter((condition) => condition.severity > 0);
      recovered.forEach((condition) => {
        cappedPush(state.healthHistory, { id: condition.id, recoveredAt: now }, 40);
        this.addMemory('recovery', { condition: condition.id }, 0.7, 0.55);
      });
    }
    if (state.conditions.length >= 2) return;
    const risk = [];
    if (slot.stats.energy < 20) risk.push('exhaustion');
    if (slot.stats.fullness > 94) risk.push('overeating');
    if (state.hydration < 24) risk.push('dehydration');
    if (slot.stats.hygiene < 22) risk.push('dirtyCoat');
    if (slot.stats.health < 45 && slot.stats.hunger < 35) risk.push('stomach');
    if (this.currentWeather() === 'thunderstorm' && state.personality.brave < 50) risk.push('stress');
    if (['rain','snow'].includes(this.currentWeather()) && slot.stats.energy < 48) risk.push('cold');
    if (state.walks.history.at(-1)?.locationId === 'forest' && slot.stats.hygiene < 55) risk.push('fleas');
    if (state.recentActions.some((action) => action.type === 'walk' && now - action.at < 30 * 60000) && slot.stats.energy < 35) risk.push('paw');
    if (this.currentSeason() === 'spring' && slot.activeRoom === 'garden') risk.push('allergy');
    if (risk.length && Math.random() < 0.12) this.addCondition(risk[Math.floor(Math.random() * risk.length)]);
  }

  addCondition(id) {
    if (!CONDITIONS[id] || this.state.conditions.some((condition) => condition.id === id)) return false;
    this.state.conditions.push({ id, severity: 28 + Math.random() * 24, startedAt: Date.now(), careProgress: 0 });
    this.addTimeline('health', { condition: id });
    this.addMemory('health-condition', { condition: id }, -0.35, 0.62);
    return true;
  }

  diagnose() {
    const conditions = this.state.conditions;
    if (!conditions.length) return { healthy: true, text: getLanguage() === 'en' ? 'No active condition was found.' : 'Nenhuma condição ativa foi encontrada.' };
    const condition = conditions.sort((a, b) => b.severity - a.severity)[0];
    const data = CONDITIONS[condition.id];
    cappedPush(this.state.healthHistory, { id: condition.id, diagnosedAt: Date.now(), severity: condition.severity }, 40);
    this.record('clinic', { condition: condition.id }, { timeline: true });
    return { healthy: false, id: condition.id, name: localized(data.name), symptoms: localized(data.symptoms), care: data.care, severity: Math.round(condition.severity) };
  }

  treatCondition(care) {
    let effective = false;
    for (const condition of this.state.conditions) {
      const data = CONDITIONS[condition.id];
      if (data.care.includes(care)) {
        condition.severity = clamp(condition.severity - 18, 0, 100);
        condition.careProgress = clamp((condition.careProgress || 0) + 0.8, 0, 4);
        effective = true;
      }
    }
    this.record('treatment', { care, effective }, { timeline: effective });
    return effective;
  }

  hydrate(amount = 18, source = 'water') {
    this.state.hydration = clamp(this.state.hydration + amount, 0, 100);
    this.treatCondition('water');
    this.record('hydrate', { amount, source });
    return this.state.hydration;
  }

  async visitClinic() {
    this.state.clinic.visits += 1;
    this.state.clinic.lastVisitAt = Date.now();
    this.record('clinic-visit', { visit: this.state.clinic.visits }, { timeline: true });
    await this.scene.buildTravelEnvironment?.('clinic', this.currentWeather(), this.currentSeason());
    this.scene.placePetSafely?.();
    return true;
  }

  weightCheck() {
    const fullness = this.slot.stats.fullness || 0;
    const tendency = clamp(50 + (fullness - 50) * 0.18 + this.state.personality.foodMotivated * 0.08, 35, 75);
    const entry = { at: Date.now(), tendency: Math.round(tendency), fullness: Math.round(fullness) };
    cappedPush(this.state.clinic.weightHistory, entry, 24);
    this.record('weight-check', entry, { timeline: true });
    return entry;
  }

  preventiveCare() {
    const cooldown = 3 * DAY;
    const cost = 28;
    if (Date.now() - this.state.clinic.lastPreventiveAt < cooldown) return { ok: false, reason: 'cooldown' };
    if (this.slot.currency < cost) return { ok: false, reason: 'coins' };
    this.slot.currency -= cost;
    this.state.clinic.lastPreventiveAt = Date.now();
    this.store.modifyStats({ health: 8, bond: 1.2 }, 'preventive-care');
    for (const condition of this.state.conditions) condition.severity = clamp(condition.severity - 6);
    cappedPush(this.state.healthHistory, { id: 'preventive', at: Date.now() }, 40);
    this.record('preventive', { cost }, { timeline: true });
    return { ok: true, cost };
  }

  buyIngredient(id) {
    const item = INGREDIENTS[id];
    if (!item || this.slot.currency < item.cost) return false;
    this.slot.currency -= item.cost;
    this.state.ingredients[id] = (this.state.ingredients[id] || 0) + 1;
    this.store.persist();
    return true;
  }

  cook(recipeId) {
    const recipe = RECIPES[recipeId];
    if (!recipe || !this.state.recipesUnlocked.includes(recipeId)) return { ok: false, reason: 'locked' };
    for (const [ingredient, amount] of Object.entries(recipe.ingredients)) if ((this.state.ingredients[ingredient] || 0) < amount) return { ok: false, reason: ingredient };
    for (const [ingredient, amount] of Object.entries(recipe.ingredients)) this.state.ingredients[ingredient] -= amount;
    this.state.preparedMeals[recipeId] = (this.state.preparedMeals[recipeId] || 0) + 1;
    this.store.gainProgress(12, 4);
    this.record('cook', { recipeId }, { timeline: true });
    this.addMemory('recipe', { recipeId }, 0.7, 0.5);
    if (this.state.recipesUnlocked.length < Object.keys(RECIPES).length && Math.random() < 0.35) {
      const locked = Object.keys(RECIPES).filter((id) => !this.state.recipesUnlocked.includes(id));
      if (locked.length) this.state.recipesUnlocked.push(locked[0]);
    }
    this.playSound('positive', { volume: 0.5 });
    return { ok: true, recipe };
  }

  foodReaction(foodId) {
    const disliked = this.state.preferences.dislikedFood;
    if (disliked?.value !== foodId) return { allow: true, reaction: 'neutral' };
    this.observePreference('dislikedFood', foodId, false, 14);
    const hesitationChance = disliked.status === 'confirmed' ? 0.38 : disliked.status === 'suspected' ? 0.2 : 0.08;
    if (Math.random() < hesitationChance) {
      this.addMemory('disliked-food', { foodId }, -0.45, 0.58);
      this.record('food-hesitation', { foodId });
      return { allow: false, reaction: 'hesitate' };
    }
    return { allow: true, reaction: 'reluctant' };
  }

  serveMeal(recipeId, portion = 'normal') {
    const recipe = RECIPES[recipeId];
    if (!recipe || (this.state.preparedMeals[recipeId] || 0) <= 0) return false;
    const portionScale = { small: 0.72, normal: 1, large: 1.28 }[portion] || 1;
    this.state.preparedMeals[recipeId] -= 1;
    const favorite = this.observePreference('favoriteFood', recipeId, true, 18);
    const multiplier = (favorite ? 1.18 : 1) * portionScale;
    const effects = Object.fromEntries(Object.entries(recipe.effects).filter(([key]) => key !== 'hydration').map(([key, value]) => [key, value * multiplier]));
    this.store.modifyStats(effects, `recipe-${recipeId}`);
    this.store.modifyStats({ bond: favorite ? 2.8 : 1.6, fullness: 28 * portionScale }, 'prepared-meal');
    this.hydrate((recipe.effects.hydration || 0) * multiplier, recipeId);
    if (portion === 'large' && this.slot.stats.fullness > 92) this.addCondition('overeating');
    this.record('feed', { foodId: recipeId, portion }, { timeline: true });
    return true;
  }

  setShampoo(id) {
    if (!SHAMPOOS[id]) return false;
    this.state.grooming.shampoo = id;
    this.store.persist();
    return true;
  }

  groom(actionId) {
    const action = GROOMING[actionId];
    if (!action) return { ok: false, reason: 'unknown' };
    const last = this.state.grooming.actions[actionId] || 0;
    const remaining = action.cooldown - (Date.now() - last);
    if (remaining > 0) return { ok: false, reason: 'cooldown', remaining };
    const shampoo = SHAMPOOS[this.state.grooming.shampoo] || SHAMPOOS.gentle;
    const tolerance = Number(this.state.preferences.groomingTolerance.value) || 50;
    const chance = clamp(0.55 + (tolerance + shampoo.tolerance) / 250 + this.state.personality.calm / 400 - this.state.personality.stubborn / 500, 0.45, 0.97);
    const success = Math.random() < chance;
    this.state.grooming.actions[actionId] = Date.now();
    if (success) {
      this.store.modifyStats({ [action.stat]: action.gain + (shampoo.prevention || 0), bond: 1.2, happiness: 2.5 + (shampoo.happiness || 0) }, `groom-${actionId}`);
      this.state.grooming.tolerance = clamp(this.state.grooming.tolerance + 1, 0, 100);
      this.record('groom', { actionId }, { timeline: true });
      this.addMemory('gentle-grooming', { actionId }, 0.55, 0.4);
      this.treatCondition(actionId === 'paws' ? 'paw-clean' : actionId === 'brush' ? 'brush' : 'clean');
    } else {
      this.store.modifyStats({ happiness: -1 }, `groom-${actionId}-hesitate`);
      this.traitChange('stubborn', 0.12, 'groom');
      this.record('groom', { actionId, success: false }, { timeline: true });
    }
    return { ok: true, success };
  }

  commandAvailability(commandId) {
    const definition = COMMANDS[commandId];
    if (!definition) return { available: false, reason: 'unknown' };
    const room = this.scene.travelLocation || this.slot.activeRoom;
    if (Array.isArray(definition.rooms) && !definition.rooms.includes(room)) return { available: false, reason: 'room' };
    const capability = new Set(ANIMATION_CAPABILITIES[this.slot.companionId] || ['idle']);
    const missing = (definition.requiredAnimations || []).filter((clip) => !capability.has(clip));
    if (missing.length) return { available: false, reason: 'animation', missing };
    const species = speciesForPet(this.slot.companionId);
    const objects = this.scene.getSemanticEnvironmentObjects?.(room, species) || [];
    if (definition.behavior === 'bed' && !objects.some((entry) => entry.type === 'bed' || entry.actions?.includes('bed-rest'))) {
      return { available: false, reason: 'no-bed' };
    }
    if (definition.behavior === 'marker' && !objects.some((entry) => entry.id?.includes('platform') || entry.actions?.includes('trained-command'))) {
      return { available: false, reason: 'no-marker' };
    }
    return { available: true, reason: null };
  }

  availableCommands() {
    return Object.entries(COMMANDS).filter(([id]) => this.commandAvailability(id).available);
  }

  commandAnimation(commandId) {
    if (!this.commandAvailability(commandId).available) return null;
    const capability = new Set(ANIMATION_CAPABILITIES[this.slot.companionId] || ['idle']);
    return COMMANDS[commandId]?.requiredAnimations?.find((clip) => capability.has(clip)) || null;
  }

  async performCommandPose(commandId, { practice = false } = {}) {
    const pet = this.scene.currentPet;
    const controller = pet?.controller;
    if (!pet || !controller || !this.commandAvailability(commandId).available) return false;
    const stillCurrent = () => this.scene.currentPet === pet;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    this.scene.stopMovement?.(`command-${commandId}`);

    if (commandId === 'sit') {
      const completed = await controller.playOnce('sit', { fade: 0.14, timeScale: 1 });
      if (!completed || !stillCurrent()) return false;
      controller.play('sitting_idle', { force: true, fade: 0.12, loop: true });
      if (practice) {
        await wait(2200);
        if (!stillCurrent() || controller.currentName !== 'sitting_idle') return true;
        if (controller.has('get_up_from_sitting')) await controller.playOnce('get_up_from_sitting', { fade: 0.14, timeScale: 1 });
        if (stillCurrent()) controller.play('idle', { force: true, fade: 0.18, loop: true });
      }
      return true;
    }

    if (commandId === 'lie') {
      const completed = await controller.playOnce('lie_down', { fade: 0.14, timeScale: 1 });
      if (!completed || !stillCurrent()) return false;
      controller.play('lying_down_idle', { force: true, fade: 0.12, loop: true });
      if (practice) {
        await wait(2200);
        if (!stillCurrent() || controller.currentName !== 'lying_down_idle') return true;
        if (controller.has('get_up_from_lying_down')) await controller.playOnce('get_up_from_lying_down', { fade: 0.14, timeScale: 1 });
        if (stillCurrent()) controller.play('idle', { force: true, fade: 0.18, loop: true });
      }
      return true;
    }

    if (commandId === 'paw') {
      const completed = await controller.playOnce('give_paw', { fade: 0.14, timeScale: 1 });
      if (completed && stillCurrent()) controller.play('idle', { force: true, fade: 0.18, loop: true });
      return Boolean(completed);
    }

    if (commandId === 'jump') {
      // Each GLB already contains one complete jump clip. Playing jump_start/jump_fall/jump_end
      // in sequence causes vertical discontinuities because those clips use different root heights.
      controller.onSound?.('jump');
      const completed = await controller.playOnce('jump', { fade: 0.08, timeScale: 1 });
      if (completed && stillCurrent()) {
        controller.onSound?.('land');
        controller.play('idle', { force: true, fade: 0.16, loop: true });
      }
      return Boolean(completed);
    }

    return false;
  }

  async executeCommand(commandId, { practice = false } = {}) {
    const availability = this.commandAvailability(commandId);
    if (!availability.available) return false;
    const behavior = COMMANDS[commandId]?.behavior;
    if (['sit', 'lie', 'paw', 'jump'].includes(behavior)) return this.performCommandPose(commandId, { practice });

    const room = this.scene.travelLocation || this.slot.activeRoom;
    const species = speciesForPet(this.slot.companionId);
    const objects = this.scene.getSemanticEnvironmentObjects?.(room, species) || [];

    if (behavior === 'come') {
      const player = objects.find((entry) => entry.id === 'player-space');
      const point = player?.approach || [0, 1.75];
      return Boolean((this.scene.moveToPlayerCommand || this.scene.moveTo)?.call(this.scene, point[0], point[1], false));
    }

    if (behavior === 'bed') {
      const bed = objects.find((entry) => entry.type === 'bed' || entry.actions?.includes('bed-rest'));
      const point = bed?.approach;
      if (!point) return false;
      return Boolean((this.scene.moveToPlayerCommand || this.scene.moveTo)?.call(this.scene, point[0], point[1], false));
    }

    if (behavior === 'marker') {
      const marker = objects.find((entry) => entry.id?.includes('platform') || entry.actions?.includes('trained-command'));
      const point = marker?.approach;
      if (!point) return false;
      return Boolean((this.scene.moveToPlayerCommand || this.scene.moveTo)?.call(this.scene, point[0], point[1], false));
    }

    return false;
  }

  async train(commandId) {
    const availability = this.commandAvailability(commandId);
    if (!availability.available) return { ok: false, reason: availability.reason, missing: availability.missing || [] };
    const command = this.state.commands[commandId] = migrateTrainingRecord(this.state.commands[commandId], commandId);
    if (!command || this.slot.stats.energy < 12) return { ok: false, reason: 'energy' };
    this.scene.setAutonomous?.(false);
    const skillBonus = this.skillEffect('training');
    const room = this.scene.travelLocation || this.slot.activeRoom;
    const weather = this.currentWeather();
    const distraction = clamp((this.state.secondaryPetId ? 18 : 0) + (['thunderstorm', 'wind'].includes(weather) ? 32 : 0) + (room === 'park' ? 16 : 0), 0, 100);
    const previousRooms = new Set(command.practiceHistory.map((entry) => entry.room));
    const context = { ...this.slot.stats, room, weather, distraction, newContext: command.practiceHistory.length > 2 && !previousRooms.has(room) };
    const attempt = evaluateTrainingAttempt({ command, context, traits: this.state.personality, relationship: this.state.secondaryPetId ? this.relationship() : { trust: this.slot.stats.bond }, rewardQuality: 0.7, skillBonus });
    const success = Math.random() < attempt.chance;
    applyTrainingResult(command, { success, context, rewardQuality: attempt.rewardQuality, responseDelay: attempt.responseDelay });
    this.store.modifyStats({ energy: -4, happiness: success ? 3 : -0.5, bond: success ? 1.5 : 0.2 }, 'training');
    let performed = false;
    try {
      if (success) {
        this.teachSecondaryByObservation(commandId, command.mastery);
        this.record('training-success', { commandId, room, distraction, responseDelay: attempt.responseDelay, reward: 'praise' }, { timeline: command.successes === 1 || command.mastery >= 100 });
        this.updateWeekly('training', 1);
        this.store.gainProgress(9, 3);
        performed = await this.executeCommand(commandId, { practice: true });
      } else {
        this.record('training-fail', { commandId, room, distraction, responseDelay: attempt.responseDelay });
      }
    } finally {
      if (!this.slot.isSleeping) this.scene.setAutonomous?.(true);
    }
    return { ok: true, success, performed, mastery: Math.round(command.mastery), confidence: Math.round(command.confidence), responseDelay: attempt.responseDelay, animation: this.commandAnimation(commandId) };
  }

  teachSecondaryByObservation(commandId, primaryMastery) {
    if (!this.state.secondaryPetId || primaryMastery < 45) return;
    const other = this.store.data.slots.find((entry) => entry?.companionId === this.state.secondaryPetId);
    if (!other) return;
    other.living = migrateLivingState(other);
    const observed = other.living.commands[commandId];
    if (!observed) return;
    observed.mastery = clamp(observed.mastery + 0.8 + this.relationship().trust / 150, 0, 100);
  }

  useCommand(commandId) {
    const command = this.state.commands[commandId];
    if (!command || command.mastery < 28 || !this.commandAvailability(commandId).available) return false;
    void this.executeCommand(commandId, { practice: false });
    this.record('command', { commandId });
    return true;
  }

  commandLevel(mastery) { return mastery >= 100 ? 'Mastered' : mastery >= 65 ? 'Familiar' : mastery >= 20 ? 'Learning' : 'Unknown'; }

  skillEffect(effect) {
    return Object.values(SKILL_PATHS).flat().filter((skill) => this.state.skills.unlocked.includes(skill.id) && skill.effect === effect).reduce((sum, skill) => sum + skill.value, 0);
  }

  unlockSkill(skillId) {
    const skill = Object.values(SKILL_PATHS).flat().find((entry) => entry.id === skillId);
    if (!skill || this.state.skills.points <= 0 || this.state.skills.unlocked.includes(skillId)) return false;
    this.state.skills.unlocked.push(skillId);
    this.state.skills.points -= 1;
    this.state.skills.spent += 1;
    this.record('skill', { skillId }, { timeline: true });
    return true;
  }

  resetSkills() {
    const cost = this.state.skills.freeResets > 0 ? 0 : 60;
    if (this.slot.currency < cost) return false;
    this.slot.currency -= cost;
    if (this.state.skills.freeResets > 0) this.state.skills.freeResets -= 1;
    this.state.skills.points += this.state.skills.unlocked.length;
    this.state.skills.unlocked = [];
    this.store.persist();
    return true;
  }

  refreshLifeStage(announce = true) {
    if (!this.state) return;
    const mastered = Object.values(this.state.commands).filter((command) => command.mastery >= 65).length;
    const careVariety = Object.values(this.state.bondCalendar.days || {}).reduce((sum, day) => sum + Math.min(day.actions?.length || 0, 4), 0);
    const storyBonus = this.state.quest.completed ? 18 : this.state.quest.step * 4;
    const milestoneScore = this.slot.level * 7 + this.slot.stats.bond * 0.45 + mastered * 4 + Math.min(24, this.state.timeline.length * 0.25) + Math.min(18, careVariety * 0.3) + storyBonus;
    let stage = LIFE_STAGES[0];
    const thresholds = { young: 0, adolescent: 55, adult: 115, veteran: 190 };
    for (const candidate of LIFE_STAGES) if (this.slot.level >= candidate.level && this.slot.stats.bond >= candidate.bond && milestoneScore >= thresholds[candidate.id]) stage = candidate;
    if (stage.id !== this.state.lifeStage) {
      this.state.lifeStage = stage.id;
      this.state.skills.points += 1;
      if (announce) {
        this.addTimeline('life-stage', { stage: stage.id });
        this.addMemory('life-stage', { stage: stage.id }, 0.9, 0.9);
        this.toast(getLanguage() === 'en' ? `${this.slot.petName} reached a new life stage!` : `${this.slot.petName} chegou a uma nova fase da vida!`);
      }
    }
  }

  questData() { return PET_QUESTS[this.slot.companionId]; }

  questTriggerMatches(trigger, type, detail) {
    if (!trigger || trigger.type !== type) return false;
    const matches = (rule) => !rule.key || detail?.[rule.key] === rule.value;
    return trigger.any ? trigger.any.some(matches) : matches(trigger);
  }

  progressQuestFromEvent(type, detail = {}) {
    if (!this.state || this.state.quest.completed || this.state.quest.ready) return false;
    const triggers = PET_QUEST_TRIGGERS[this.slot.companionId] || [];
    const trigger = triggers[this.state.quest.step];
    if (!this.questTriggerMatches(trigger, type, detail)) return false;
    this.state.quest.objectiveProgress = 1;
    this.state.quest.ready = true;
    this.state.quest.lastTrigger = { type, detail, at: Date.now() };
    this.toast(getLanguage() === 'en' ? 'Story objective complete. Choose how to respond.' : 'Objetivo da história concluído. Escolha como responder.');
    return true;
  }

  advanceQuest(choice = 'kind') {
    const quest = this.questData();
    if (!quest || this.state.quest.completed || !this.state.quest.ready) return false;
    this.state.quest.choices.push(choice);
    this.state.quest.step += 1;
    this.state.quest.ready = false;
    this.state.quest.objectiveProgress = 0;
    this.record('quest', { step: this.state.quest.step, choice }, { timeline: true });
    this.store.gainProgress(18, 15);
    if (this.state.quest.step >= quest.steps.length) {
      this.state.quest.completed = true;
      this.slot.currency += 75;
      this.state.skills.points += 1;
      const questReward = Object.keys(ACCESSORIES).find((id) => ACCESSORIES[id]?.model && !this.state.accessories.owned.includes(id));
      if (questReward) this.state.accessories.owned.push(questReward);
      this.addMemory('quest-complete', { quest: this.slot.companionId, choice }, 0.95, 1);
    }
    return true;
  }

  async takeWalk(locationId) {
    const location = WALK_LOCATIONS[locationId];
    if (!location || this.slot.stats.energy < location.energy) return { ok: false, reason: 'energy' };
    this.store.modifyStats({ energy: -location.energy * (1 - this.skillEffect('energy')), happiness: 10, bond: 2.2, hygiene: -2 }, `walk-${locationId}`);
    if (!this.state.walks.visited.includes(locationId)) this.state.walks.visited.push(locationId);
    const rareChance = clamp(0.08 + this.skillEffect('rare') + (this.currentSeason() === 'autumn' ? 0.04 : 0), 0.08, 0.36);
    const rewardPool = [...location.rewards];
    if (Math.random() < rareChance) rewardPool.push(this.currentSeason() === 'winter' ? 'berries' : this.currentSeason() === 'spring' ? 'herbs' : 'fish');
    const rewardId = seededChoice(rewardPool, `${this.slot.id}:${Date.now()}:${locationId}`);
    const rewardAmount = Math.random() < this.skillEffect('walk') ? 2 : 1;
    if (INGREDIENTS[rewardId]) this.state.ingredients[rewardId] = (this.state.ingredients[rewardId] || 0) + rewardAmount;
    else this.slot.inventory[rewardId] = (this.slot.inventory[rewardId] || 0) + rewardAmount;
    cappedPush(this.state.walks.history, { locationId, at: Date.now(), weather: this.currentWeather(), rewardId }, 60);
    this.record('walk', { location: locationId, rewardId }, { timeline: true });
    this.addMemory('memorable-walk', { location: locationId, weather: this.currentWeather() }, 0.72, 0.55);
    this.observePreference('favoriteEnvironment', locationId, true, 13);
    await this.scene.buildTravelEnvironment?.(locationId, this.currentWeather(), this.currentSeason());
    this.scene.placePetSafely?.();
    return { ok: true, rewardId, rewardAmount };
  }

  returnHome() {
    this.scene.travelLocation = null;
    this.scene.buildEnvironment?.(this.slot.activeRoom);
    this.scene.setWorldState?.({ weather: this.currentWeather(), season: this.currentSeason() });
    this.scene.setDecorations?.(this.state.decorations);
    this.scene.placePetSafely?.();
  }

  secretAvailable(id) {
    const secret = SECRETS[id];
    if (!secret || this.state.secrets[id]) return false;
    const hour = new Date().getHours();
    if (secret.condition === 'night' && !(hour >= 19 || hour < 6)) return false;
    if (secret.condition === 'rainbow' && this.currentWeather() !== 'rainbow') return false;
    if (secret.condition === 'curious' && this.state.personality.curious < 58) return false;
    return true;
  }

  discoverSecret(id) {
    const secret = SECRETS[id];
    if (!this.secretAvailable(id)) return false;
    this.state.secrets[id] = { discoveredAt: Date.now() };
    this.slot.currency += secret.reward;
    this.record('secret', { id }, { timeline: true });
    this.addMemory('secret', { id }, 0.85, 0.8);
    this.playSound('positive');
    return true;
  }

  furnitureAvailableInRoom(itemId, room = this.slot.activeRoom) {
    const item = FURNITURE[itemId];
    return Boolean(item && (!Array.isArray(item.rooms) || item.rooms.includes(room)));
  }

  roomUpgradeLevel(room = this.slot.activeRoom) {
    return clamp(Math.floor(Number(this.state.roomUpgrades?.[room]) || 0), 0, 3);
  }

  roomUpgradeScale(room = this.slot.activeRoom) {
    const data = ROOM_UPGRADES[room];
    return Number(data?.scales?.[this.roomUpgradeLevel(room)] || 1);
  }

  upgradeRoom(room = this.slot.activeRoom) {
    const data = ROOM_UPGRADES[room];
    if (!data) return { ok: false, reason: 'unavailable' };
    const level = this.roomUpgradeLevel(room);
    if (level >= 3) return { ok: false, reason: 'max' };
    const cost = Number(data.costs[level]) || 0;
    if (this.slot.currency < cost) return { ok: false, reason: 'coins', cost };
    this.slot.currency -= cost;
    this.state.roomUpgrades[room] = level + 1;
    this.scene.setRoomUpgrades?.(this.state.roomUpgrades);
    this.scene.setDefaultFurnitureStored?.(this.state.defaultFurnitureStored);
    if (this.slot.activeRoom === room && !this.scene.travelLocation) {
      this.scene.buildEnvironment?.(room);
      this.scene.setWorldState?.({ weather: this.currentWeather(), season: this.currentSeason() });
      this.scene.setDecorations?.(this.state.decorations);
      this.scene.placePetSafely?.();
    }
    this.record('room-upgrade', { room, level: level + 1, cost }, { timeline: true });
    this.store.persist();
    return { ok: true, level: level + 1, cost };
  }

  canPlaceDecoration(item, x, z, ignoreId = null, rotation = 0, scale = 1, validateRoute = true) {
    if (!this.furnitureAvailableInRoom(item)) return false;
    const safeScale = clamp(Number(scale) || 1, 0.55, 2.2);
    const [baseWidth, baseDepth] = FURNITURE[item].size;
    const quarter = Math.abs(Math.sin(Number(rotation) || 0));
    const width = (baseWidth * (1 - quarter) + baseDepth * quarter) * safeScale;
    const depth = (baseDepth * (1 - quarter) + baseWidth * quarter) * safeScale;
    const bounds = this.scene.getWalkBounds?.(0.34) || { minX: -4.1, maxX: 4.1, minZ: -2.45, maxZ: 2.45 };
    if (x - width / 2 < bounds.minX || x + width / 2 > bounds.maxX || z - depth / 2 < bounds.minZ || z + depth / 2 > bounds.maxZ) return false;
    const clear = !this.state.decorations.some((other) => {
      if (other.id === ignoreId || other.room !== this.slot.activeRoom) return false;
      const otherItem = FURNITURE[other.item];
      if (!otherItem) return false;
      const otherScale = clamp(Number(other.scale) || 1, 0.55, 2.2);
      const otherQuarter = Math.abs(Math.sin(Number(other.rotation) || 0));
      const otherWidth = (otherItem.size[0] * (1 - otherQuarter) + otherItem.size[1] * otherQuarter) * otherScale;
      const otherDepth = (otherItem.size[1] * (1 - otherQuarter) + otherItem.size[0] * otherQuarter) * otherScale;
      return Math.abs(other.x - x) < (width + otherWidth) / 2 + 0.08 && Math.abs(other.z - z) < (depth + otherDepth) / 2 + 0.08;
    });
    return clear && (!validateRoute || FURNITURE[item].kind === 'rug' || (this.scene.validateDecorationPlacement?.(x, z, width, depth) ?? true));
  }

  buyFurniture(itemId) {
    const item = FURNITURE[itemId];
    if (!item || !this.furnitureAvailableInRoom(itemId) || this.slot.currency < item.cost) return false;
    this.slot.currency -= item.cost;
    this.state.furnitureInventory[itemId] = (this.state.furnitureInventory[itemId] || 0) + 1;
    this.record('furniture-buy', { item: itemId, room: this.slot.activeRoom }, { timeline: true });
    this.store.persist();
    return true;
  }

  findDecorationSpot(itemId) {
    const bounds = this.scene.getWalkBounds?.(0.55) || { minX: -4, maxX: 4, minZ: -2.4, maxZ: 2.4 };
    const candidates = [];
    for (let z = bounds.maxZ - 0.45; z >= bounds.minZ + 0.45; z -= 0.55) {
      for (let x = bounds.minX + 0.45; x <= bounds.maxX - 0.45; x += 0.55) candidates.push({ x, z });
    }
    candidates.sort((a, b) => (a.x * a.x + a.z * a.z) - (b.x * b.x + b.z * b.z));
    return candidates.find((point) => this.canPlaceDecoration(itemId, point.x, point.z)) || null;
  }

  placeOwnedFurniture(itemId) {
    const owned = this.state.furnitureInventory[itemId] || 0;
    if (owned <= 0 || !this.furnitureAvailableInRoom(itemId)) return { ok: false, reason: 'inventory' };
    const point = this.findDecorationSpot(itemId);
    if (!point) return { ok: false, reason: 'space' };
    this.state.furnitureInventory[itemId] -= 1;
    const record = { id: uid(), item: itemId, room: this.slot.activeRoom, x: point.x, y: 0, z: point.z, rotation: 0, scale: 1 };
    this.state.decorations.push(record);
    this.scene.setDecorations?.(this.state.decorations);
    this.record('decorate', { item: itemId }, { timeline: true });
    this.store.persist();
    return { ok: true, record };
  }

  buyAndPlaceFurniture(item, x = 0, z = 1.8, rotation = 0) {
    const furniture = FURNITURE[item];
    const owned = this.state.furnitureInventory[item] || 0;
    if (!furniture || !this.furnitureAvailableInRoom(item) || (owned <= 0 && this.slot.currency < furniture.cost) || !this.canPlaceDecoration(item, x, z, null, rotation, 1)) return false;
    if (owned > 0) this.state.furnitureInventory[item] -= 1; else this.slot.currency -= furniture.cost;
    this.state.decorations.push({ id: uid(), item, room: this.slot.activeRoom, x, y: 0, z, rotation, scale: 1 });
    this.scene.setDecorations?.(this.state.decorations);
    this.record('decorate', { item }, { timeline: true });
    this.store.persist();
    return true;
  }

  moveDecoration(id, x, y = 0, z, rotation = 0, scale = 1) {
    const item = this.state.decorations.find((entry) => entry.id === id);
    if (!item || !this.canPlaceDecoration(item.item, x, z, id, rotation, scale, false)) return false;
    Object.assign(item, { x, y: clamp(Number(y) || 0, 0, 5.5), z, rotation, scale: clamp(Number(scale) || 1, 0.55, 2.2) });
    this.scene.setDecorations?.(this.state.decorations);
    this.store.persist();
    return true;
  }

  saveDefaultFurnitureTransform(room, key, transform = {}) {
    if (!room || !key) return false;
    this.state.defaultFurnitureTransforms ||= {};
    this.state.defaultFurnitureTransforms[room] ||= {};
    const record = {
      x: Number(transform.x) || 0,
      y: clamp(Number(transform.y) || 0, 0, 5.5),
      z: Number(transform.z) || 0,
      rotation: Number(transform.rotation) || 0,
      scale: clamp(Number(transform.scale) || 1, 0.55, 2.2)
    };
    this.state.defaultFurnitureTransforms[room][key] = record;
    this.scene.setDefaultFurnitureTransforms?.(this.state.defaultFurnitureTransforms);
    this.scene.updateDefaultFurnitureAnchors?.(key);
    this.scene.rebuildDefaultFurnitureObstacles?.();
    this.store.persist();
    return true;
  }

  storeDefaultFurniture(room = this.slot.activeRoom, key = null, itemId = null) {
    if (!room || !key) return false;

    this.state.defaultFurnitureStored ||= {};
    this.state.defaultFurnitureStored[room] ||= {};
    if (this.state.defaultFurnitureStored[room][key]) return false;

    let resolvedItem = itemId;
    if (!resolvedItem) {
      const record = this.scene.getDefaultFurnitureRecords?.().find((entry) => entry.room === room && entry.key === key);
      resolvedItem = record?.item || null;
    }

    this.state.defaultFurnitureStored[room][key] = true;
    if (resolvedItem && FURNITURE[resolvedItem]) {
      this.state.furnitureInventory[resolvedItem] = (this.state.furnitureInventory[resolvedItem] || 0) + 1;
    }

    this.scene.setDefaultFurnitureStored?.(this.state.defaultFurnitureStored);
    this.scene.syncSemanticAnchors?.();
    this.store.persist();
    return true;
  }

  storeDecoration(id) {
    const index = this.state.decorations.findIndex((entry) => entry.id === id);
    if (index < 0) return false;
    const [item] = this.state.decorations.splice(index, 1);
    this.state.furnitureInventory[item.item] = (this.state.furnitureInventory[item.item] || 0) + 1;
    this.scene.setDecorations?.(this.state.decorations);
    this.store.persist();
    return true;
  }

  sellDecoration(id) {
    const index = this.state.decorations.findIndex((entry) => entry.id === id);
    if (index < 0) return false;
    const [item] = this.state.decorations.splice(index, 1);
    this.slot.currency += Math.floor((FURNITURE[item.item]?.cost || 0) * 0.45);
    this.scene.setDecorations?.(this.state.decorations);
    this.store.persist();
    return true;
  }

  resetRoomDecorations() {
    const room = this.slot.activeRoom;
    const removed = this.state.decorations.filter((entry) => entry.room === room);
    for (const entry of removed) this.state.furnitureInventory[entry.item] = (this.state.furnitureInventory[entry.item] || 0) + 1;
    this.state.decorations = this.state.decorations.filter((entry) => entry.room !== room);
    this.scene.setDecorations?.(this.state.decorations);
    this.store.persist();
    return removed.length;
  }

  buyAccessory(id) {
    const item = ACCESSORIES[id];
    if (!item || this.slot.currency < item.cost || this.state.accessories.owned.includes(id)) return false;
    this.slot.currency -= item.cost;
    this.state.accessories.owned.push(id);
    this.store.persist();
    return true;
  }

  equipAccessory(id) {
    if (id && (!ACCESSORIES[id]?.model || !this.state.accessories.owned.includes(id))) return false;
    this.state.accessories.equipped = id || null;
    this.scene.setAccessory?.(id || null);
    this.record('accessory', { id }, { timeline: Boolean(id) });
    return true;
  }

  relationship(otherId = this.state?.secondaryPetId) {
    const defaults = { familiarity: 0, trust: 0, affection: 0, rivalry: 0, jealousy: 0, playCompatibility: 0, resourceTension: 0, protectiveTendency: 0, playfulness: 0, comfort: 0, attachment: 0, interactions: 0 };
    if (!otherId) return defaults;
    const key = [this.slot.companionId, otherId].sort().join(':');
    this.state.relationships[key] = { ...defaults, familiarity: 10, trust: 8, affection: 5, playCompatibility: 10, playfulness: 10, comfort: 8, rivalry: 4, attachment: 4, ...(this.state.relationships[key] || {}) };
    return this.state.relationships[key];
  }

  async setSecondaryPet(otherId) {
    const owned = this.store.data.slots.some((entry) => entry?.companionId === otherId && entry !== this.slot);
    if (otherId === this.slot.companionId || !owned) otherId = null;
    this.state.secondaryPetId = otherId || null;
    if (otherId) this.relationship(otherId);
    await this.scene.setSecondaryPet?.(otherId || null);
    this.store.persist();
  }

  socialInteraction(kind = 'play') {
    if (!this.state.secondaryPetId) return false;
    const relationship = this.relationship();
    relationship.interactions += 1;
    relationship.familiarity = clamp(relationship.familiarity + 3, 0, 100);
    relationship.trust = clamp(relationship.trust + (kind === 'share' ? 4 : 2), 0, 100);
    relationship.playfulness = clamp(relationship.playfulness + (kind === 'play' ? 4 : 1), 0, 100);
    relationship.playCompatibility = clamp(relationship.playCompatibility + (kind === 'play' ? 3.5 : 0.8), 0, 100);
    relationship.comfort = clamp(relationship.comfort + 2, 0, 100);
    relationship.affection = clamp(relationship.affection + (kind === 'share' ? 3 : 1.2), 0, 100);
    relationship.attachment = clamp(relationship.attachment + 1.5, 0, 100);
    relationship.rivalry = clamp(relationship.rivalry + (kind === 'compete' ? 3 : -1), 0, 100);
    relationship.jealousy = clamp(relationship.jealousy + (kind === 'compete' ? 2 : -0.7), 0, 100);
    relationship.resourceTension = clamp(relationship.resourceTension + (kind === 'share' ? -2 : kind === 'compete' ? 2.5 : -0.4), 0, 100);
    relationship.protectiveTendency = clamp(relationship.protectiveTendency + (kind === 'share' ? 1.2 : 0.25), 0, 100);
    this.scene.playSocialInteraction?.(kind);
    this.record('social', { otherId: this.state.secondaryPetId, kind }, { timeline: relationship.interactions === 1 });
    this.addMemory('pet-relationship', { otherId: this.state.secondaryPetId, kind }, kind === 'compete' ? 0.1 : 0.75, 0.55);
    const otherSlot = this.store.data.slots.find((entry) => entry?.companionId === this.state.secondaryPetId);
    if (otherSlot) {
      otherSlot.living = migrateLivingState(otherSlot);
      const key = [this.slot.companionId, this.state.secondaryPetId].sort().join(':');
      otherSlot.living.relationships[key] = { ...relationship };
      otherSlot.living.longTermMemories ||= [];
      cappedPush(otherSlot.living.longTermMemories, { id: uid(), type: 'pet-relationship', detail: { otherId: this.slot.companionId, kind }, at: Date.now(), valence: kind === 'compete' ? 0.1 : 0.75, salience: 0.55, reinforcement: 1 }, 80);
    }
    return true;
  }

  updateBodyLanguage() {
    this.simulationRuntime.updateBodyLanguage();
  }

  playObservation(answer) {
    const correct = answer === this.state.emotion.id || answer === this.state.bodyLanguage.last;
    if (correct) {
      this.state.bodyLanguage.observationScore += 1;
      this.store.gainProgress(4, 2);
    }
    return correct;
  }

  dreamEligible() { return this.slot.isSleeping && Date.now() - this.state.dreams.lastAt > 45 * 60000; }
  playDream(theme = null) {
    if (!this.slot.isSleeping) return { ok: false, reason: 'sleep' };
    if (!this.dreamEligible()) return { ok: false, reason: 'cooldown' };
    if (!theme) {
      if (this.state.personality.foodMotivated > 70) theme = 'treats';
      else if (this.state.personality.curious > 75) theme = 'space';
      else if (this.state.secondaryPetId) theme = 'friends';
      else if (this.state.longTermMemories.some((memory) => memory.type === 'memorable-walk')) theme = 'memory';
      else if (this.currentWeather() === 'rainbow' || this.state.emotion.id === 'excited') theme = 'clouds';
      else theme = seededChoice(Object.keys(DREAMS), `${this.slot.id}:${Date.now()}`);
    }
    this.state.dreams.lastAt = Date.now();
    cappedPush(this.state.dreams.played, { theme, at: Date.now(), score: 0 }, 30);
    this.record('dream', { theme }, { timeline: true });
    this.scene.startDream?.(theme);
    return { ok: true, theme, name: localized(DREAMS[theme]?.name) };
  }

  completeDream(score) {
    const last = this.state.dreams.played.at(-1);
    if (last) last.score = score;
    const rare = score >= 8;
    if (rare) {
      this.state.dreams.rare.push(last.theme);
      this.addMemory('rare-dream', { theme: last.theme }, 0.9, 0.88);
      this.slot.currency += 25;
      if (!this.state.memoryCosmetics.stickers.includes('dream-star')) this.state.memoryCosmetics.stickers.push('dream-star');
    }
    this.scene.endDream?.();
    this.store.persist();
    return rare;
  }

  scentSearch() {
    const location = this.scene.travelLocation || this.slot.activeRoom;
    const secret = Object.entries(SECRETS).find(([id, value]) => this.secretAvailable(id) && value.room === location);
    const isDog = speciesForPet(this.slot.companionId) === 'dog';
    const speciesBonus = isDog ? 0.13 : this.state.personality.curious / 800;
    const chance = clamp(0.36 + speciesBonus + this.state.scent.level * 0.04 + this.skillEffect('scent'), 0.36, 0.92);
    const found = secret && Math.random() < chance;
    this.state.scent.experience += found ? 18 : 5;
    if (this.state.scent.experience >= this.state.scent.level * 40) { this.state.scent.level += 1; this.state.scent.experience = 0; }
    if (found) {
      this.scene.showScentTrail?.(secret[0]);
      this.state.scent.found.push(secret[0]);
      this.discoverSecret(secret[0]);
      this.record('scent', { found: secret[0] }, { timeline: true });
      return { found: true, id: secret[0] };
    }
    this.scene.showScentTrail?.(null);
    return { found: false };
  }

  eventAvailable() {
    const season = this.currentSeason();
    return EVENTS.find((event) => !event.season || event.season === season) || EVENTS[0];
  }

  startEvent(eventId = null) {
    const event = EVENTS.find((entry) => entry.id === eventId) || this.eventAvailable();
    const missions = deepClone(EVENT_MISSIONS[event.id] || []).map((mission) => ({ ...mission, progress: 0, complete: false }));
    this.state.activeEvent = { id: event.id, startedAt: Date.now(), missions };
    this.scene.setEventTheme?.(event.id);
    this.record('event', { eventId: event.id }, { timeline: true });
    return event;
  }

  progressActiveEvent(type, detail = {}) {
    const active = this.state?.activeEvent;
    if (!active || type === 'event') return false;
    let changed = false;
    for (const mission of active.missions || []) {
      if (mission.complete || mission.type !== type) continue;
      if (mission.detail && detail?.[mission.detail.key] !== mission.detail.value) continue;
      mission.progress = Math.min(mission.target, (mission.progress || 0) + 1);
      mission.complete = mission.progress >= mission.target;
      changed = true;
    }
    if (changed && active.missions.every((mission) => mission.complete)) this.completeEvent();
    return changed;
  }

  completeEvent() {
    if (!this.state.activeEvent) return false;
    const completed = { ...deepClone(this.state.activeEvent), completedAt: Date.now() };
    cappedPush(this.state.eventArchive, completed, 24);
    this.state.activeEvent = null;
    this.slot.currency += 55;
    const reward = Object.keys(ACCESSORIES).find((id) => ACCESSORIES[id]?.model && !this.state.accessories.owned.includes(id));
    if (reward) this.state.accessories.owned.push(reward);
    const furnitureReward = completed.id === 'winter-lights' ? 'lamp' : completed.id === 'spring-festival' ? 'plant' : 'rug';
    this.state.furnitureInventory[furnitureReward] = (this.state.furnitureInventory[furnitureReward] || 0) + 1;
    if (!this.state.memoryCosmetics.backgrounds.includes(completed.id)) this.state.memoryCosmetics.backgrounds.push(completed.id);
    this.addMemory('event-complete', { eventId: completed.id }, 0.9, 0.8);
    this.addTimeline('event-complete', { eventId: completed.id, reward, furnitureReward });
    this.scene.setEventTheme?.(null);
    this.toast(getLanguage() === 'en' ? 'Event complete: rewards added.' : 'Evento concluído: recompensas adicionadas.');
    this.store.persist();
    return true;
  }

  advanceEvent() { return false; }


  applyOutdoorSociability(now = Date.now()) {
    if (!this.slot || !['garden', 'park'].includes(this.slot.activeRoom)) return;
    const last = Number(this.state?.simulation?.lastOutdoorSocialAt || 0);
    if (now - last < 9000) return;
    this.state.simulation.lastOutdoorSocialAt = now;
    const socialGain = 0.85;
    this.store.modifyStats({ social: socialGain, happiness: 0.35, bond: 0.16 }, 'outdoor-social');
    if (chance(0.4)) this.record('social', { room: this.slot.activeRoom, robots: 0, ambient: true });
  }

  recordPhoto(filename = '') {
    const entry = this.addTimeline('photo', { filename }, filename);
    this.record('photo', { filename, photoId: entry.id });
    return entry;
  }

  setFavoritePhoto(photoId) {
    if (!this.state.timeline.some((entry) => entry.id === photoId && entry.type === 'photo')) return false;
    this.state.memoryCosmetics.favoritePhotoId = photoId;
    this.store.persist();
    return true;
  }

  replayEvent(eventId) { return this.startEvent(eventId); }

  directInteraction(gesture = {}) {
    const result = this.simulationRuntime.directInteraction(gesture);
    this.record('pet', {
      kind: gesture.kind || result.region || 'calm', region: result.region,
      accepted: result.accepted, overstimulated: result.overstimulated,
      reaction: result.reaction, speed: gesture.speed || 0, duration: gesture.duration || 0,
      comforting: (gesture.speed || 0) < 850
    });
    return result;
  }

  interpretHiddenDesire(options = {}) {
    return this.simulationRuntime.interpretDesire(options);
  }

  observeHiddenDesire(amount = 1) {
    return this.simulationRuntime.observeDesire(amount);
  }

  resetLearnedRoutines() {
    this.simulationRuntime.resetRoutines();
    return true;
  }

  respondToEmergentEvent(response) {
    return this.simulationRuntime.respondToEvent(response);
  }

  simulationDebugSnapshot() {
    return this.simulationRuntime.debugSnapshot();
  }

  learnedPatterns() {
    return {
      habits: this.simulationRuntime.strongestHabits(8),
      routines: this.simulationRuntime.routineSummary(8),
      memories: [...(this.state.simulation.episodicMemories || [])].sort((a, b) => (b.lastRecalledAt || b.lastAt || b.timestamp) - (a.lastRecalledAt || a.lastAt || a.timestamp)).slice(0, 10),
      fears: Object.entries(this.state.simulation.fears || {}).map(([id, fear]) => ({ id, ...fear })).sort((a, b) => b.intensity - a.intensity),
      offline: this.state.simulation.offline.lastSummary,
      event: this.state.simulation.emergentEvents.active,
      desire: this.interpretHiddenDesire({ accessibility: true })
    };
  }

  async startWorldActivity(activityId) {
    const activities = {
      fetch: { energy: 7, happiness: 7, bond: 1.7, species: 'any' },
      'hide-treat': { energy: 5, happiness: 6, bond: 1.5, species: 'any' },
      'scent-trail': { energy: 6, happiness: 7, bond: 1.8, species: 'dog' },
      laser: { energy: 7, happiness: 8, bond: 1.4, species: 'cat' },
      'obstacle-course': { energy: 9, happiness: 8, bond: 2, species: 'any' },
      'command-sequence': { energy: 6, happiness: 5, bond: 2.2, species: 'any' },
      'hide-seek': { energy: 7, happiness: 8, bond: 2.2, species: 'any' },
      'toy-selection': { energy: 4, happiness: 6, bond: 1.3, species: 'any' }
    };
    const activity = activities[activityId];
    const species = speciesForPet(this.slot.companionId);
    if (!activity) return { ok: false, reason: 'unknown' };
    if (activity.species !== 'any' && activity.species !== species) return { ok: false, reason: 'species' };
    if (this.slot.stats.energy < activity.energy + 4) return { ok: false, reason: 'energy' };
    this.scene.setAutonomous?.(false);
    let result;
    try {
      result = await this.scene.runWorldActivity?.(activityId, { species, petId: this.slot.companionId, mastery: this.state.commands });
    } finally {
      if (!this.slot.isSleeping) this.scene.setAutonomous?.(true);
    }
    if (!result?.ok) return result || { ok: false, reason: 'scene' };
    const quality = clamp(Number(result.quality) || 0.65, 0.2, 1);
    this.store.modifyStats({ energy: -activity.energy, happiness: activity.happiness * quality, bond: activity.bond * quality }, `world-activity-${activityId}`);
    this.store.gainProgress(Math.round(5 + quality * 7), Math.round(2 + quality * 4));
    this.record('play', { gameId: activityId, activityId, success: quality >= 0.45, objectId: result.objectId, importance: 0.6 }, { timeline: true });
    this.addMemory('world-activity', { activityId, room: this.scene.travelLocation || this.slot.activeRoom }, 0.65, 0.58);
    if (activityId === 'toy-selection' && result.objectId) this.observePreference('favoriteToy', result.objectId, true, 15);
    return { ...result, reward: Math.round(2 + quality * 4) };
  }

  profileSummary() {
    const topTraits = Object.entries(this.state.personality).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { topTraits, emotion: this.emotionLabel(), stage: localized(LIFE_STAGES.find((stage) => stage.id === this.state.lifeStage)?.name), weather: this.currentWeather(), season: this.currentSeason() };
  }
}

export { CONDITIONS, INGREDIENTS, RECIPES, GROOMING, SHAMPOOS, COMMANDS, SKILL_PATHS, LIFE_STAGES, PET_QUESTS, PET_QUEST_TRIGGERS, WALK_LOCATIONS, SECRETS, FURNITURE, ROOM_UPGRADES, ACCESSORIES, EVENTS, EVENT_MISSIONS, DREAMS, EMOTIONS, WEATHER_TYPES, SEASONS };
