import {
  APP_VERSION, STORAGE_KEY, SETTINGS_KEY, DEFAULT_SETTINGS, DECAY_PER_HOUR,
  MAX_OFFLINE_HOURS, PETS, ROOMS, COLLECTION_ITEMS
} from './config.js';
import { clamp, safeParse, todayKey, uid } from './utils.js';

const OBJECTIVE_POOL = [
  { id: 'feed-2', label: 'Feed your companion twice', type: 'feed', target: 2 },
  { id: 'play-1', label: 'Play one minigame', type: 'play', target: 1 },
  { id: 'clean-1', label: 'Give your companion a clean', type: 'clean', target: 1 },
  { id: 'garden-1', label: 'Spend time in the garden', type: 'visit-garden', target: 1 },
  { id: 'hidden-1', label: 'Find a hidden treat', type: 'play-hidden', target: 1 },
  { id: 'happy-75', label: 'Keep happiness above 75', type: 'happiness', target: 75 },
  { id: 'walk-1', label: 'Take a short walk', type: 'walk', target: 1 }
];

const baseSlot = (slotIndex, companionId, petName) => ({
  version: APP_VERSION,
  id: uid(),
  slotIndex,
  companionId,
  petName,
  createdAt: Date.now(),
  lastActive: Date.now(),
  stats: {
    hunger: 82,
    happiness: 78,
    energy: 76,
    hygiene: 86,
    health: 92,
    bond: 20,
    experience: 0,
    fullness: 22
  },
  level: 1,
  currency: 120,
  isSleeping: false,
  inventory: {
    meal: 8,
    snack: 6,
    treat: 4,
    water: 10,
    medicine: 3
  },
  unlockedRooms: ['living'],
  activeRoom: 'living',
  unlockedItems: ['starter-bowl'],
  achievements: [],
  memories: [],
  discoveredFoods: [],
  visitedRooms: ['living'],
  photoCount: 0,
  daily: createDailyState(),
  streak: { current: 0, best: 0, lastCompletedDate: null, graceAvailable: true },
  tutorialStep: 0,
  tutorialComplete: false,
  interactions: { petTimestamps: [], totalPetting: 0, lastDialogueAt: 0, lastAutonomousAt: 0 },
  settings: {}
});

function createDailyState() {
  const shuffled = [...OBJECTIVE_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
  return {
    date: todayKey(),
    objectives: shuffled.map((objective) => ({ ...objective, progress: 0, complete: false })),
    claimed: false
  };
}

function migrateSlot(slot, slotIndex) {
  if (!slot || typeof slot !== 'object') return null;
  const migrated = {
    ...baseSlot(slotIndex, slot.companionId || 'apollo', slot.petName || 'Companion'),
    ...slot,
    slotIndex,
    version: APP_VERSION
  };
  const defaults = baseSlot(slotIndex, migrated.companionId, migrated.petName);
  migrated.stats = { ...defaults.stats, ...(slot.stats || {}) };
  migrated.interactions = { ...defaults.interactions, ...(slot.interactions || {}) };
  migrated.streak = { ...defaults.streak, ...(slot.streak || {}) };
  migrated.discoveredFoods = Array.isArray(slot.discoveredFoods) ? slot.discoveredFoods : [];
  migrated.visitedRooms = Array.isArray(slot.visitedRooms) ? slot.visitedRooms : ['living'];
  migrated.photoCount = Math.max(0, Math.floor(Number(slot.photoCount) || 0));
  Object.keys(migrated.stats).forEach((key) => { migrated.stats[key] = clamp(migrated.stats[key]); });
  migrated.currency = Math.max(0, Math.floor(Number(migrated.currency) || 0));
  migrated.level = Math.max(1, Math.floor(Number(migrated.level) || 1));
  migrated.unlockedRooms = Array.isArray(migrated.unlockedRooms) ? migrated.unlockedRooms.filter((id) => ROOMS[id]) : ['living'];
  if (!migrated.unlockedRooms.includes('living')) migrated.unlockedRooms.unshift('living');
  migrated.activeRoom = migrated.unlockedRooms.includes(migrated.activeRoom) ? migrated.activeRoom : 'living';
  migrated.unlockedItems = Array.isArray(migrated.unlockedItems) ? migrated.unlockedItems : ['starter-bowl'];
  migrated.daily = migrated.daily?.date === todayKey() ? migrated.daily : createDailyState();
  return migrated;
}

export class GameStore extends EventTarget {
  constructor() {
    super();
    this.settings = { ...DEFAULT_SETTINGS, ...safeParse(localStorage.getItem(SETTINGS_KEY), {}) };
    const raw = safeParse(localStorage.getItem(STORAGE_KEY), { version: APP_VERSION, slots: [null, null, null], activeSlot: null });
    this.data = {
      version: APP_VERSION,
      slots: [0, 1, 2].map((index) => migrateSlot(raw?.slots?.[index], index)),
      activeSlot: Number.isInteger(raw?.activeSlot) ? raw.activeSlot : null
    };
    this.lastTick = Date.now();
    this.ensureDaily();
    this.persist();
  }

  get active() {
    return Number.isInteger(this.data.activeSlot) ? this.data.slots[this.data.activeSlot] : null;
  }

  hasSaves() { return this.data.slots.some(Boolean); }

  createSlot(index, companionId, petName) {
    if (!PETS[companionId]) throw new Error('Unknown companion.');
    this.data.slots[index] = baseSlot(index, companionId, petName.trim() || PETS[companionId].name);
    this.data.activeSlot = index;
    this.persist();
    this.emit('slot-created');
    return this.active;
  }

  selectSlot(index) {
    if (!this.data.slots[index]) return false;
    this.data.activeSlot = index;
    this.applyOfflineProgress();
    this.ensureDaily();
    this.persist();
    this.emit('slot-selected');
    return true;
  }

  deleteSlot(index) {
    this.data.slots[index] = null;
    if (this.data.activeSlot === index) this.data.activeSlot = null;
    this.persist();
    this.emit('slot-deleted');
  }

  ensureDaily() {
    for (const slot of this.data.slots) {
      if (slot && slot.daily?.date !== todayKey()) slot.daily = createDailyState();
    }
  }

  applyOfflineProgress() {
    const slot = this.active;
    if (!slot || !this.settings.realTimeDecay) return 0;
    const now = Date.now();
    const elapsedHours = Math.min(MAX_OFFLINE_HOURS, Math.max(0, (now - (slot.lastActive || now)) / 3600000));
    if (elapsedHours < 0.01) return elapsedHours;
    const personality = PETS[slot.companionId]?.modifiers || {};
    if (slot.isSleeping) {
      slot.stats.hunger = clamp(slot.stats.hunger - DECAY_PER_HOUR.hunger * elapsedHours * 0.55);
      slot.stats.happiness = clamp(slot.stats.happiness - DECAY_PER_HOUR.happiness * elapsedHours * 0.22);
      slot.stats.energy = clamp(slot.stats.energy + 28 * elapsedHours);
      slot.stats.hygiene = clamp(slot.stats.hygiene - DECAY_PER_HOUR.hygiene * elapsedHours * 0.45);
      slot.stats.health = clamp(slot.stats.health + 2.2 * elapsedHours);
      if (slot.stats.energy >= 99) slot.isSleeping = false;
    } else {
      slot.stats.hunger = clamp(slot.stats.hunger - DECAY_PER_HOUR.hunger * elapsedHours);
      slot.stats.happiness = clamp(slot.stats.happiness - DECAY_PER_HOUR.happiness * elapsedHours * (personality.boredom || 1));
      slot.stats.energy = clamp(slot.stats.energy - DECAY_PER_HOUR.energy * elapsedHours);
      slot.stats.hygiene = clamp(slot.stats.hygiene - DECAY_PER_HOUR.hygiene * elapsedHours);
      const pressure = Math.max(0, 35 - Math.min(slot.stats.hunger, slot.stats.energy, slot.stats.hygiene)) / 35;
      slot.stats.health = clamp(slot.stats.health - (DECAY_PER_HOUR.health + pressure * 1.8) * elapsedHours);
    }
    slot.stats.bond = clamp(slot.stats.bond - DECAY_PER_HOUR.bond * elapsedHours);
    slot.stats.fullness = clamp(slot.stats.fullness - 5 * elapsedHours);
    slot.lastActive = now;
    return elapsedHours;
  }

  tick(now = Date.now()) {
    const slot = this.active;
    if (!slot) return;
    const elapsedHours = Math.min(MAX_OFFLINE_HOURS, Math.max(0, (now - this.lastTick) / 3600000));
    this.lastTick = now;
    if (this.settings.realTimeDecay && !slot.isSleeping) {
      const personality = PETS[slot.companionId]?.modifiers || {};
      slot.stats.hunger = clamp(slot.stats.hunger - DECAY_PER_HOUR.hunger * elapsedHours);
      slot.stats.happiness = clamp(slot.stats.happiness - DECAY_PER_HOUR.happiness * elapsedHours * (personality.boredom || 1));
      slot.stats.energy = clamp(slot.stats.energy - DECAY_PER_HOUR.energy * elapsedHours);
      slot.stats.hygiene = clamp(slot.stats.hygiene - DECAY_PER_HOUR.hygiene * elapsedHours);
      slot.stats.fullness = clamp(slot.stats.fullness - 5 * elapsedHours);
      const weakestNeed = Math.min(slot.stats.hunger, slot.stats.energy, slot.stats.hygiene);
      if (weakestNeed < 30) slot.stats.health = clamp(slot.stats.health - (30 - weakestNeed) * 0.12 * elapsedHours);
      else if (weakestNeed > 72 && slot.stats.happiness > 65) slot.stats.health = clamp(slot.stats.health + 0.45 * elapsedHours);
    }
    if (slot.isSleeping) {
      slot.stats.energy = clamp(slot.stats.energy + 28 * elapsedHours);
      slot.stats.health = clamp(slot.stats.health + 3 * elapsedHours);
      if (slot.stats.energy >= 99) slot.isSleeping = false;
    }
    this.evaluatePassiveObjectives();
  }

  modifyStats(changes, reason = 'care') {
    const slot = this.active;
    if (!slot) return;
    Object.entries(changes).forEach(([key, amount]) => {
      if (key in slot.stats) slot.stats[key] = clamp(slot.stats[key] + amount);
    });
    this.emit('stats', { reason, changes });
  }

  gainProgress(xp = 0, currency = 0) {
    const slot = this.active;
    if (!slot) return { leveled: false };
    slot.stats.experience = Math.max(0, slot.stats.experience + xp);
    slot.currency = Math.max(0, slot.currency + currency);
    let leveled = false;
    let threshold = this.levelThreshold(slot.level);
    while (slot.stats.experience >= threshold) {
      slot.stats.experience -= threshold;
      slot.level += 1;
      leveled = true;
      threshold = this.levelThreshold(slot.level);
      this.applyLevelUnlocks();
      if (!slot.achievements.includes('first-level')) slot.achievements.push('first-level');
    }
    this.emit('progress', { xp, currency, leveled });
    return { leveled };
  }

  levelThreshold() { return 100; }

  applyLevelUnlocks() {
    const slot = this.active;
    if (!slot) return;
    if (slot.level >= 2 && !slot.unlockedItems.includes('moon-bed')) slot.unlockedItems.push('moon-bed');
    if (slot.stats.bond >= 70 && !slot.unlockedItems.includes('sparkle-pose')) slot.unlockedItems.push('sparkle-pose');
  }

  track(type, amount = 1) {
    const slot = this.active;
    if (!slot) return;
    slot.daily.objectives.forEach((objective) => {
      if (objective.complete) return;
      if (objective.type === type || (objective.type === 'play-hidden' && type === 'play-hidden')) {
        objective.progress = clamp(objective.progress + amount, 0, objective.target);
        objective.complete = objective.progress >= objective.target;
      }
    });
    if (type === 'play' && !slot.unlockedItems.includes('rope-toy')) slot.unlockedItems.push('rope-toy');
    if (type === 'visit-garden' && !slot.unlockedItems.includes('garden-lamp')) slot.unlockedItems.push('garden-lamp');
    this.evaluateDailyCompletion();
    this.persist();
    this.emit('daily');
  }

  evaluatePassiveObjectives() {
    const slot = this.active;
    if (!slot) return;
    slot.daily.objectives.forEach((objective) => {
      if (objective.type === 'happiness') {
        objective.progress = Math.floor(slot.stats.happiness);
        objective.complete = objective.progress >= objective.target;
      }
    });
    this.evaluateDailyCompletion();
  }

  evaluateDailyCompletion() {
    const slot = this.active;
    if (!slot || slot.daily.claimed || !slot.daily.objectives.every((objective) => objective.complete)) return;
    slot.daily.claimed = true;
    if (!slot.achievements.includes('daily-rhythm')) slot.achievements.push('daily-rhythm');
    slot.currency += 55;
    slot.stats.experience += 35;
    const date = todayKey();
    if (slot.streak.lastCompletedDate !== date) {
      slot.streak.current += 1;
      slot.streak.best = Math.max(slot.streak.best, slot.streak.current);
      slot.streak.lastCompletedDate = date;
      slot.streak.graceAvailable = true;
    }
    this.emit('daily-complete');
  }

  unlockRoom(roomId) {
    const slot = this.active;
    const room = ROOMS[roomId];
    if (!slot || !room || slot.unlockedRooms.includes(roomId)) return true;
    if (slot.level < room.unlockLevel || slot.currency < room.cost) return false;
    slot.currency -= room.cost;
    slot.unlockedRooms.push(roomId);
    this.persist();
    this.emit('room-unlocked', { roomId });
    return true;
  }

  setRoom(roomId) {
    const slot = this.active;
    if (!slot?.unlockedRooms.includes(roomId)) return false;
    slot.activeRoom = roomId;
    slot.visitedRooms = Array.isArray(slot.visitedRooms) ? slot.visitedRooms : ['living'];
    if (!slot.visitedRooms.includes(roomId)) slot.visitedRooms.push(roomId);
    if (roomId === 'garden') this.track('visit-garden');
    this.persist();
    return true;
  }

  purchaseItem(itemId, cost, amount = 1) {
    const slot = this.active;
    if (!slot || slot.currency < cost || amount <= 0) return false;
    slot.currency -= cost;
    slot.inventory[itemId] = (slot.inventory[itemId] || 0) + amount;
    this.persist();
    this.emit('inventory', { itemId, amount, cost });
    return true;
  }

  setSleeping(value) {
    if (!this.active) return;
    this.active.isSleeping = Boolean(value);
    this.persist();
    this.emit('sleep');
  }

  updateSettings(patch) {
    this.settings = { ...this.settings, ...patch };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    this.emit('settings');
  }

  exportData() {
    return JSON.stringify({ app: 'Pocket Companions', version: APP_VERSION, exportedAt: Date.now(), data: this.data, settings: this.settings }, null, 2);
  }

  importData(text) {
    const parsed = safeParse(text, null);
    if (!parsed?.data?.slots || !Array.isArray(parsed.data.slots)) throw new Error('This backup is not valid.');
    this.data = {
      version: APP_VERSION,
      slots: [0, 1, 2].map((index) => migrateSlot(parsed.data.slots[index], index)),
      activeSlot: Number.isInteger(parsed.data.activeSlot) ? parsed.data.activeSlot : null
    };
    this.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
    this.persist();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    this.emit('imported');
  }

  recoverCorruption() {
    this.data = { version: APP_VERSION, slots: [null, null, null], activeSlot: null };
    this.persist();
  }

  persist() {
    if (this.active) this.active.lastActive = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  getCollection() {
    const unlocked = new Set(this.active?.unlockedItems || []);
    return COLLECTION_ITEMS.map((item) => ({ ...item, unlocked: unlocked.has(item.id) }));
  }

  emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }
}
