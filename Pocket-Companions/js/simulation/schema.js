import { clamp, uid } from '../utils.js';

export const SIMULATION_SCHEMA = 2;
export const MAX_EPISODIC_MEMORIES = 96;
export const MAX_HABITS = 36;
export const MAX_OFFLINE_HISTORY = 24;
export const MAX_EMERGENT_HISTORY = 24;

const asArray = (value, limit) => Array.isArray(value) ? value.slice(-limit) : [];
const asObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function timeWindow(timestamp = Date.now()) {
  const hour = new Date(timestamp).getHours();
  if (hour < 5) return 'late-night';
  if (hour < 10) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
}

export function createAgentState(petId = 'companion') {
  return {
    id: petId,
    currentAction: 'idle-observe',
    actionSince: 0,
    minimumUntil: 0,
    interruptedAction: null,
    target: null,
    targetObjectId: null,
    currentScore: 0,
    nextDecisionAt: 0,
    lastDecisionAt: 0,
    lastCompletedAt: 0,
    cooldowns: {},
    failures: {},
    recentActions: [],
    utilityCandidates: [],
    memoryInfluence: [],
    navigationState: 'idle',
    hiddenDesire: null,
    desireHistory: [],
    lastDesireAt: 0,
    actionToken: uid()
  };
}

export function createSimulationState(slot = {}) {
  const petId = slot.companionId || 'companion';
  return {
    schema: SIMULATION_SCHEMA,
    lastAt: Date.now(),
    lastEmotionAt: 0,
    lastConditionCheckAt: 0,
    lastAutonomyAt: 0,
    lastPersistAt: 0,
    lastMemoryMaintenanceAt: 0,
    lastRoutineMaintenanceAt: 0,
    agent: createAgentState(petId),
    episodicMemories: [],
    habits: [],
    routines: {
      enabled: true,
      sessions: 0,
      samples: {},
      learned: {},
      lastSessionAt: 0,
      lastAbsenceDuration: 0
    },
    fears: {},
    environment: {
      reservations: {},
      objectStates: {},
      favoriteLocations: {},
      lastRoom: slot.activeRoom || 'living'
    },
    emergentEvents: {
      active: null,
      history: [],
      cooldowns: {},
      nextEvaluationAt: Date.now() + 45000,
      sequence: 0
    },
    offline: {
      pending: null,
      history: [],
      lastSummary: null,
      lastSimulatedAt: 0
    },
    dirt: { dust: 0, mud: 0, water: 0, snow: 0, leaves: 0, foam: 0 },
    directInteraction: {
      recent: [],
      overstimulation: 0,
      lastAt: 0,
      preferredRegions: {},
      avoidedRegions: {}
    },
    debug: { lastSnapshotAt: 0 }
  };
}

function migrateAgent(source, petId) {
  const defaults = createAgentState(petId);
  const merged = { ...defaults, ...asObject(source), id: petId };
  merged.cooldowns = asObject(source?.cooldowns);
  merged.failures = asObject(source?.failures);
  merged.recentActions = asArray(source?.recentActions, 12);
  merged.utilityCandidates = asArray(source?.utilityCandidates, 12);
  merged.memoryInfluence = asArray(source?.memoryInfluence, 8);
  merged.desireHistory = asArray(source?.desireHistory, 12);
  merged.hiddenDesire = source?.hiddenDesire && typeof source.hiddenDesire === 'object' ? { ...source.hiddenDesire } : null;
  return merged;
}

function migrateMemory(memory) {
  if (!memory || typeof memory !== 'object') return null;
  const emotionalValue = clamp(Number(memory.emotionalValue ?? memory.valence ?? 0), -1, 1);
  const importance = clamp(Number(memory.importance ?? memory.salience ?? 0.45), 0, 1);
  return {
    id: String(memory.id || uid()),
    timestamp: Number(memory.timestamp ?? memory.createdAt ?? memory.at) || Date.now(),
    lastAt: Number(memory.lastAt ?? memory.timestamp ?? memory.createdAt ?? memory.at) || Date.now(),
    eventType: String(memory.eventType ?? memory.type ?? 'experience'),
    participants: asArray(memory.participants, 6),
    location: memory.location ?? memory.room ?? null,
    objectId: memory.objectId ?? memory.relatedObject ?? null,
    playerAction: memory.playerAction ?? null,
    petReaction: memory.petReaction ?? null,
    emotionalValue,
    importance,
    valence: clamp(Number(memory.valence ?? emotionalValue), -1, 1),
    associatedNeed: memory.associatedNeed ?? null,
    associatedFear: memory.associatedFear ?? null,
    associatedReward: memory.associatedReward ?? null,
    recallCount: Math.max(0, Math.floor(Number(memory.recallCount) || 0)),
    decayLevel: clamp(Number(memory.decayLevel) || 0, 0, 1),
    longTerm: Boolean(memory.longTerm ?? memory.becameLongTerm ?? importance >= 0.72),
    occurrences: Math.max(1, Math.floor(Number(memory.occurrences ?? memory.reinforcement) || 1)),
    lastRecalledAt: Number(memory.lastRecalledAt) || 0,
    detail: asObject(memory.detail)
  };
}

function migrateHabit(habit) {
  if (!habit || typeof habit !== 'object' || !habit.behavior) return null;
  const context = asObject(habit.context);
  const trigger = String(habit.trigger || 'context');
  const behavior = String(habit.behavior);
  return {
    id: String(habit.id || uid()),
    key: String(habit.key || `${trigger}|${behavior}|${context.room || '*'}|${context.timeWindow || '*'}|${context.objectId || '*'}|${context.weather || '*'}`),
    trigger,
    context,
    behavior,
    expectedResult: habit.expectedResult ?? null,
    strength: clamp(Number(habit.strength) || 0, 0, 100),
    confidence: clamp(Number(habit.confidence) || 0, 0, 100),
    lastActivation: Number(habit.lastActivation) || 0,
    positiveReinforcement: Math.max(0, Number(habit.positiveReinforcement) || 0),
    negativeReinforcement: Math.max(0, Number(habit.negativeReinforcement) || 0),
    extinctionProgress: clamp(Number(habit.extinctionProgress) || 0, 0, 100),
    repetitions: Math.max(1, Math.floor(Number(habit.repetitions) || 1)),
    createdAt: Number(habit.createdAt) || Date.now()
  };
}

export function migrateSimulationState(slot, source = slot?.living?.simulation) {
  const defaults = createSimulationState(slot);
  const raw = asObject(source);
  const merged = { ...defaults, ...raw, schema: SIMULATION_SCHEMA };
  merged.agent = migrateAgent(raw.agent, slot?.companionId || 'companion');
  merged.episodicMemories = asArray(raw.episodicMemories, MAX_EPISODIC_MEMORIES).map(migrateMemory).filter(Boolean);
  merged.habits = asArray(raw.habits, MAX_HABITS).map(migrateHabit).filter(Boolean);
  merged.routines = {
    ...defaults.routines,
    ...asObject(raw.routines),
    samples: asObject(raw.routines?.samples),
    learned: asObject(raw.routines?.learned)
  };
  Object.entries(merged.routines.samples).forEach(([key, value]) => {
    merged.routines.samples[key] = asArray(value, 48).filter((entry) => entry && Number.isFinite(Number(entry.at)));
  });
  merged.fears = asObject(raw.fears);
  Object.entries(merged.fears).forEach(([key, fear]) => {
    merged.fears[key] = {
      intensity: clamp(Number(fear?.intensity ?? fear) || 0, 0, 100),
      confidence: clamp(Number(fear?.confidence) || 0, 0, 100),
      lastTriggeredAt: Number(fear?.lastTriggeredAt) || 0,
      comfortCount: Math.max(0, Number(fear?.comfortCount) || 0),
      source: fear?.source || key
    };
  });
  merged.environment = {
    ...defaults.environment,
    ...asObject(raw.environment),
    reservations: asObject(raw.environment?.reservations),
    objectStates: asObject(raw.environment?.objectStates),
    favoriteLocations: asObject(raw.environment?.favoriteLocations)
  };
  merged.emergentEvents = {
    ...defaults.emergentEvents,
    ...asObject(raw.emergentEvents),
    active: raw.emergentEvents?.active && typeof raw.emergentEvents.active === 'object' ? { ...raw.emergentEvents.active } : null,
    history: asArray(raw.emergentEvents?.history, MAX_EMERGENT_HISTORY),
    cooldowns: asObject(raw.emergentEvents?.cooldowns)
  };
  merged.offline = {
    ...defaults.offline,
    ...asObject(raw.offline),
    pending: raw.offline?.pending && typeof raw.offline.pending === 'object' ? { ...raw.offline.pending } : null,
    history: asArray(raw.offline?.history, MAX_OFFLINE_HISTORY),
    lastSummary: raw.offline?.lastSummary && typeof raw.offline.lastSummary === 'object' ? { ...raw.offline.lastSummary } : null
  };
  merged.dirt = { ...defaults.dirt, ...asObject(raw.dirt) };
  Object.keys(merged.dirt).forEach((key) => { merged.dirt[key] = clamp(Number(merged.dirt[key]) || 0, 0, 100); });
  merged.directInteraction = {
    ...defaults.directInteraction,
    ...asObject(raw.directInteraction),
    recent: asArray(raw.directInteraction?.recent, 24),
    preferredRegions: asObject(raw.directInteraction?.preferredRegions),
    avoidedRegions: asObject(raw.directInteraction?.avoidedRegions)
  };
  merged.debug = { ...defaults.debug, ...asObject(raw.debug) };
  return merged;
}

export function compactSimulationState(simulation) {
  if (!simulation) return simulation;
  simulation.episodicMemories = asArray(simulation.episodicMemories, MAX_EPISODIC_MEMORIES);
  simulation.habits = asArray(simulation.habits, MAX_HABITS);
  simulation.offline.history = asArray(simulation.offline.history, MAX_OFFLINE_HISTORY);
  simulation.emergentEvents.history = asArray(simulation.emergentEvents.history, MAX_EMERGENT_HISTORY);
  simulation.agent.utilityCandidates = asArray(simulation.agent.utilityCandidates, 12);
  simulation.agent.memoryInfluence = asArray(simulation.agent.memoryInfluence, 8);
  simulation.agent.recentActions = asArray(simulation.agent.recentActions, 12);
  simulation.directInteraction.recent = asArray(simulation.directInteraction.recent, 24);
  return simulation;
}
