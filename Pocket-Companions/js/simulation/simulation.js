import { MAX_OFFLINE_HOURS, PETS } from '../config.js';
import { clamp } from '../utils.js';
import { getLanguage } from '../i18n.js';
import { BehavioralAgent } from './agent.js';
import { bodyLanguageFor, fulfillHiddenDesire, interpretHiddenDesire, observeHiddenDesire, updateHiddenDesire } from './body-language.js';
import { cleanupReservations, environmentObjects, releaseObject, reserveObject } from './environment-actions.js';
import { applyEventConsequence, advanceEmergentEvent, evaluateEventScheduler, recoverEventState, respondToEmergentEvent } from './events.js';
import { maintainHabits, reinforceHabit, strongestHabits } from './habits.js';
import { bridgeLongTermMemory, maintainMemories, recordEpisodicMemory } from './memory.js';
import { simulateOfflineLife } from './offline-simulation.js';
import { maintainRoutines, observeRoutine, resetRoutines, routineSummary } from './routines.js';
import { compactSimulationState, migrateSimulationState, timeWindow } from './schema.js';
import { physicalProfile, speciesForPet } from './species-behaviors.js';

const HOUR = 3600000;
const MEANINGFUL = new Set(['feed', 'hydrate', 'pet', 'play', 'walk', 'groom', 'sleep', 'wake', 'social', 'training-success', 'training-fail', 'weather', 'secret', 'quest', 'treatment', 'ignored']);

function eventMemoryPayload(type, detail, context) {
  const values = {
    feed: { playerAction: 'feed', petReaction: 'eat', need: 'hunger', valence: 0.62, importance: 0.48, objectId: detail.foodId || 'food-bowl' },
    hydrate: { playerAction: 'offer-water', petReaction: 'drink', need: 'hydration', valence: 0.55, importance: 0.42, objectId: 'water-bowl' },
    pet: { playerAction: detail.kind || 'affection', petReaction: detail.comforting && context.weather === 'thunderstorm' ? 'seek-player' : detail.reaction || 'accept-affection', need: 'bond', valence: detail.accepted === false ? -0.34 : 0.58, importance: detail.comforting && context.weather === 'thunderstorm' ? 0.68 : 0.5, fear: detail.comforting && context.weather === 'thunderstorm' ? 'thunderstorm' : null },
    play: { playerAction: 'play', petReaction: detail.success === false ? 'attempted-play' : 'shared-play', need: 'happiness', valence: detail.success === false ? 0.12 : 0.65, importance: 0.5, objectId: detail.gameId || 'toy' },
    walk: { playerAction: 'visit', petReaction: 'explore', need: 'happiness', valence: 0.58, importance: 0.46, objectId: detail.location || detail.room },
    groom: { playerAction: detail.actionId || 'groom', petReaction: detail.success === false ? 'resist-grooming' : 'accept-grooming', need: 'hygiene', valence: detail.success === false ? -0.42 : 0.48, importance: 0.55 },
    sleep: { playerAction: 'settle-for-sleep', petReaction: 'sleep', need: 'energy', valence: 0.42, importance: 0.36, objectId: 'bed' },
    wake: { playerAction: detail.repeated ? 'wake-repeatedly' : 'wake', petReaction: detail.repeated ? 'avoid-rest-area' : 'wake', need: 'energy', valence: detail.repeated ? -0.58 : 0.05, importance: detail.repeated ? 0.68 : 0.25 },
    social: { playerAction: 'allow-social-time', petReaction: detail.kind || 'social', need: 'bond', valence: detail.kind === 'compete' ? 0.05 : 0.62, importance: 0.5, objectId: detail.otherId },
    'training-success': { playerAction: 'reward-command', petReaction: detail.commandId || 'command', need: 'bond', valence: 0.72, importance: 0.62, reward: detail.reward || 'praise' },
    'training-fail': { playerAction: 'practice-command', petReaction: 'uncertain', need: 'bond', valence: -0.08, importance: 0.3 },
    ignored: { playerAction: 'ignore-request', petReaction: detail.request || 'withdraw', need: 'bond', valence: -0.52, importance: 0.58 },
    weather: { playerAction: null, petReaction: 'experience-weather', need: 'safety', valence: detail.weather === 'thunderstorm' ? -0.55 : 0.08, importance: detail.weather === 'thunderstorm' ? 0.7 : 0.25, fear: detail.weather === 'thunderstorm' ? 'thunderstorm' : null }
  }[type] || { playerAction: type, petReaction: type, need: null, valence: 0.2, importance: 0.35 };
  return {
    eventType: type,
    participants: [context.petId, ...(context.friendId ? [context.friendId] : [])],
    location: context.room,
    objectId: values.objectId || detail.objectId || null,
    playerAction: values.playerAction,
    petReaction: values.petReaction,
    emotionalValue: values.valence,
    valence: values.valence,
    importance: values.importance,
    associatedNeed: values.need,
    associatedFear: values.fear || null,
    associatedReward: values.reward || detail.reward || null,
    detail: { ...detail, weather: context.weather }
  };
}

export class SimulationRuntime {
  constructor(host) {
    this.host = host;
    this.agent = null;
    this.slotId = null;
    this.secondaryAgent = null;
    this.secondarySlotId = null;
    this.lastDirtSignature = '';
    this.sceneListeners = [];
    this.bindSceneEvents();
  }

  get slot() { return this.host.slot; }
  get living() { return this.host.state; }
  get state() { return this.living?.simulation; }

  bindSceneEvents() {
    const scene = this.host.scene;
    if (!scene?.addEventListener) return;
    const bind = (name, handler) => {
      const bound = (event) => handler.call(this, event.detail || {});
      scene.addEventListener(name, bound);
      this.sceneListeners.push([name, bound]);
    };
    bind('autonomous-arrived', this.onAutonomousArrived);
    bind('autonomous-complete', this.onAutonomousComplete);
    bind('path-blocked', this.onPathBlocked);
    bind('secondary-autonomous-complete', this.onSecondaryAutonomousComplete);
    bind('secondary-path-blocked', this.onSecondaryPathBlocked);
  }

  ensure() {
    if (!this.slot || !this.living) return null;
    this.living.simulation = migrateSimulationState(this.slot, this.living.simulation);
    if (!this.agent || this.slotId !== this.slot.id) {
      this.slotId = this.slot.id;
      this.agent = new BehavioralAgent({ simulation: this.state, petId: this.slot.companionId, contextProvider: () => this.context() });
    } else {
      this.agent.simulation = this.state;
    }
    return this.state;
  }

  secondarySlot() {
    const id = this.living?.secondaryPetId;
    if (!id) return null;
    return this.host.store.data.slots.find((entry) => entry?.companionId === id && entry !== this.slot) || null;
  }

  ensureSecondary() {
    const other = this.secondarySlot();
    if (!other?.living) {
      this.secondaryAgent = null;
      this.secondarySlotId = null;
      this.host.scene.setSecondaryAutonomyProvider?.(null);
      return null;
    }
    other.living.simulation = migrateSimulationState(other, other.living.simulation);
    if (!this.secondaryAgent || this.secondarySlotId !== other.id) {
      this.secondarySlotId = other.id;
      this.secondaryAgent = new BehavioralAgent({ simulation: other.living.simulation, petId: other.companionId, contextProvider: () => this.secondaryContext(other) });
    } else this.secondaryAgent.simulation = other.living.simulation;
    this.host.scene.setSecondaryAutonomyProvider?.(() => this.chooseSecondaryAction());
    return other;
  }

  context() {
    if (!this.slot || !this.living || !this.state) return null;
    const petConfig = PETS[this.slot.companionId] || {};
    const species = speciesForPet(this.slot.companionId, petConfig.species);
    const relationship = this.living.secondaryPetId ? this.host.relationship(this.living.secondaryPetId) : null;
    const fears = Object.values(this.state.fears || {});
    const contextualFear = this.state.fears[this.host.currentWeather()]?.intensity || Math.max(0, ...fears.map((fear) => fear.intensity || 0));
    const dirtTotal = Object.values(this.state.dirt || {}).reduce((sum, value) => sum + Number(value || 0), 0) / Math.max(1, Object.keys(this.state.dirt || {}).length);
    return {
      slotId: this.slot.id,
      petId: this.slot.companionId,
      friendId: this.living.secondaryPetId,
      hasFriend: Boolean(this.living.secondaryPetId),
      species,
      physical: physicalProfile(this.slot.companionId),
      lifeStage: this.living.lifeStage || 'young',
      stats: this.slot.stats,
      hydration: this.living.hydration,
      traits: this.living.personality,
      preferences: this.living.preferences,
      relationship,
      emotion: this.living.emotion?.id || 'content',
      emotionIntensity: this.living.emotion?.intensity || 0.5,
      room: this.host.scene.travelLocation || this.slot.activeRoom,
      weather: this.host.currentWeather(),
      season: this.host.currentSeason(),
      timeWindow: timeWindow(),
      fearIntensity: contextualFear,
      dirtTotal,
      overstimulation: this.state.directInteraction.overstimulation || 0,
      hiddenDesire: this.state.agent.hiddenDesire,
      objects: environmentObjects(this.host.scene.travelLocation || this.slot.activeRoom, species),
      settings: this.host.store.settings,
      lowPerformance: Boolean(this.host.store.settings.lowPerformanceMode),
      minimumUntil: this.state.agent.minimumUntil,
      currentAction: this.state.agent.currentAction,
      currentAnimation: this.host.scene.currentPet?.controller?.currentName || 'idle',
      movementState: this.state.agent.navigationState,
      playerActivity: this.host.scene.mode,
      recentPlayerActions: (this.living.recentActions || []).slice(-8)
    };
  }

  secondaryContext(other = this.secondarySlot()) {
    if (!other?.living || !this.state) return null;
    const living = other.living;
    const species = speciesForPet(other.companionId, PETS[other.companionId]?.species);
    const fears = Object.values(living.simulation.fears || {});
    const fearIntensity = living.simulation.fears[this.host.currentWeather()]?.intensity || Math.max(0, ...fears.map((fear) => fear.intensity || 0));
    const dirt = living.simulation.dirt || {};
    return {
      slotId: other.id,
      petId: other.companionId,
      friendId: this.slot.companionId,
      hasFriend: true,
      species,
      physical: physicalProfile(other.companionId),
      lifeStage: living.lifeStage || 'young',
      stats: other.stats,
      hydration: living.hydration,
      traits: living.personality,
      preferences: living.preferences,
      relationship: this.host.relationship(other.companionId),
      emotion: living.emotion?.id || 'content',
      emotionIntensity: living.emotion?.intensity || 0.5,
      room: this.host.scene.travelLocation || this.slot.activeRoom,
      weather: this.host.currentWeather(),
      season: this.host.currentSeason(),
      timeWindow: timeWindow(),
      fearIntensity,
      dirtTotal: Object.values(dirt).reduce((sum, value) => sum + Number(value || 0), 0) / Math.max(1, Object.keys(dirt).length),
      overstimulation: living.simulation.directInteraction.overstimulation || 0,
      hiddenDesire: living.simulation.agent.hiddenDesire,
      objects: environmentObjects(this.host.scene.travelLocation || this.slot.activeRoom, species),
      settings: this.host.store.settings,
      lowPerformance: Boolean(this.host.store.settings.lowPerformanceMode),
      minimumUntil: living.simulation.agent.minimumUntil,
      currentAction: living.simulation.agent.currentAction,
      currentAnimation: this.host.scene.pets.get(other.companionId)?.controller?.currentName || 'idle',
      movementState: living.simulation.agent.navigationState,
      playerActivity: this.host.scene.mode,
      recentPlayerActions: (living.recentActions || []).slice(-8)
    };
  }

  activate() {
    const state = this.ensure();
    if (!state) return { offlineSummary: null };
    const now = Date.now();
    state.routines.sessions += 1;
    state.routines.lastSessionAt = now;
    const pending = state.offline.pending;
    const fallbackElapsed = Math.max(0, now - (state.lastAt || now));
    const elapsedMs = pending?.durationMs ?? fallbackElapsed;
    let offlineSummary = null;
    if (this.host.store.settings.realTimeDecay !== false && elapsedMs >= 60000) {
      offlineSummary = simulateOfflineLife({
        slot: this.slot,
        livingState: this.living,
        elapsedMs,
        from: pending?.from || now - elapsedMs,
        to: pending?.to || now,
        language: getLanguage(),
        maxHours: MAX_OFFLINE_HOURS
      });
      if (offlineSummary) {
        state.routines.lastAbsenceDuration = offlineSummary.durationMs;
        offlineSummary.events.forEach((event) => {
          const memory = recordEpisodicMemory(state, {
            eventType: `offline-${event.type}`, participants: [this.slot.companionId], location: event.room,
            petReaction: event.type, emotionalValue: event.type === 'bored' ? -0.2 : 0.25,
            importance: ['dream', 'friend', 'preference'].includes(event.type) ? 0.45 : 0.25,
            detail: { offline: true, weather: event.weather }
          });
          bridgeLongTermMemory(this.living, memory);
          reinforceHabit(state, { trigger: 'offline-context', behavior: event.type === 'toy' ? 'toy-play' : event.type === 'waited' ? 'wait-door' : event.type === 'favorite' ? 'favorite-place' : 'idle-observe', context: { room: event.room, weather: event.weather }, positive: event.type !== 'bored', importance: 0.35, at: event.at });
        });
        const returnMemory = recordEpisodicMemory(state, {
          eventType: 'player-return', participants: [this.slot.companionId], location: this.context().room,
          playerAction: 'return-after-absence', petReaction: offlineSummary.events.some((event) => event.type === 'waited') ? 'seek-player' : 'greet-player',
          emotionalValue: 0.55, importance: clamp(0.42 + offlineSummary.durationMs / (24 * HOUR) * 0.35, 0.42, 0.78),
          associatedNeed: 'bond', detail: { absenceDuration: offlineSummary.durationMs }
        });
        bridgeLongTermMemory(this.living, returnMemory);
      }
    }
    state.offline.pending = null;
    state.lastAt = now;
    maintainMemories(state, now);
    maintainHabits(state, now);
    maintainRoutines(state, now);
    cleanupReservations(state, now);
    recoverEventState(state, this.context(), now);
    this.processExpiredDesire(state, this.context(), now);
    updateHiddenDesire(state, this.context(), now);
    this.ensureSecondary();
    this.updateBodyLanguage();
    this.syncDirt(true);
    compactSimulationState(state);
    this.host.store.persist();
    return { offlineSummary };
  }

  tick(now = Date.now()) {
    const state = this.ensure();
    if (!state) return;
    cleanupReservations(state, now);
    state.directInteraction.overstimulation = clamp(state.directInteraction.overstimulation - 0.18, 0, 100);
    state.dirt.water = clamp(state.dirt.water - 0.22, 0, 100);
    state.dirt.snow = clamp(state.dirt.snow - 0.08, 0, 100);
    this.processExpiredDesire(state, this.context(), now);
    updateHiddenDesire(state, this.context(), now);
    this.updateBodyLanguage();
    if (now - (state.lastMemoryMaintenanceAt || 0) > 10 * 60000) {
      state.lastMemoryMaintenanceAt = now;
      maintainMemories(state, now);
      maintainHabits(state, now);
    }
    if (now - (state.lastRoutineMaintenanceAt || 0) > 30 * 60000) {
      state.lastRoutineMaintenanceAt = now;
      maintainRoutines(state, now);
    }
    const transition = state.emergentEvents.active
      ? advanceEmergentEvent(state, this.context(), now)
      : evaluateEventScheduler(state, this.context(), now);
    if (transition.transition) this.handleEventTransition(transition);
    this.syncDirt();
    const other = this.ensureSecondary();
    if (other) {
      const secondaryContext = this.secondaryContext(other);
      this.processExpiredDesire(other.living.simulation, secondaryContext, now, other.living);
      updateHiddenDesire(other.living.simulation, secondaryContext, now);
      cleanupReservations(other.living.simulation, now);
      if (now - (other.living.simulation.lastMemoryMaintenanceAt || 0) > 10 * 60000) {
        other.living.simulation.lastMemoryMaintenanceAt = now;
        maintainMemories(other.living.simulation, now);
        maintainHabits(other.living.simulation, now);
      }
      if (now - (other.living.simulation.lastRoutineMaintenanceAt || 0) > 30 * 60000) {
        other.living.simulation.lastRoutineMaintenanceAt = now;
        maintainRoutines(other.living.simulation, now);
      }
    }
  }

  chooseAutonomousAction() {
    const state = this.ensure();
    if (!state || this.slot.isSleeping) return null;
    const action = this.agent.decide(Date.now());
    if (!action) return null;
    if (action.objectId && !reserveObject(state, action.objectId, this.slot.companionId, action.hold + 9000, true)) {
      state.agent.cooldowns[action.id] = Date.now() + 9000;
      return null;
    }
    state.agent.navigationState = 'moving';
    return action;
  }

  processExpiredDesire(state, context, now = Date.now(), living = this.living) {
    const desire = state?.agent?.hiddenDesire;
    if (!context || !desire || desire.fulfilled || desire.expiryRecorded || now < desire.expiresAt) return false;
    desire.expiryRecorded = true;
    const memory = recordEpisodicMemory(state, {
      eventType: 'ignored-request', participants: [context.petId], location: context.room,
      playerAction: 'ignore-request', petReaction: desire.behavior, emotionalValue: -0.42,
      importance: 0.52, associatedNeed: desire.need || 'bond', detail: { behavior: desire.behavior, desireId: desire.id }
    });
    bridgeLongTermMemory(living, memory);
    reinforceHabit(state, { trigger: 'ignored-request', behavior: desire.behavior, context: { room: context.room, timeWindow: context.timeWindow, objectId: desire.objectId, weather: context.weather }, positive: false, importance: 0.55, expectedResult: 'ignored' });
    return true;
  }

  chooseSecondaryAction() {
    const other = this.ensureSecondary();
    if (!other || other.isSleeping || !this.secondaryAgent) return null;
    const action = this.secondaryAgent.decide(Date.now());
    if (!action) return null;
    if (action.objectId && !reserveObject(this.state, action.objectId, other.companionId, action.hold + 9000, true)) {
      other.living.simulation.agent.cooldowns[action.id] = Date.now() + 9000;
      return null;
    }
    if (action.target === 'friend' && this.host.scene.currentPet) action.point = { x: this.host.scene.currentPet.stage.position.x + 0.75, z: this.host.scene.currentPet.stage.position.z };
    other.living.simulation.agent.navigationState = 'moving';
    return action;
  }

  onAutonomousArrived(detail) {
    const action = detail.action;
    if (!action || !this.state || (action.token && action.token !== this.state.agent.actionToken)) return;
    this.state.agent.navigationState = 'interacting';
    if (action.id === 'eat') this.host.scene.showBowlContents?.('meal');
    if (action.id === 'drink') this.host.scene.showBowlContents?.('water');
  }

  onAutonomousComplete(detail) {
    const action = detail.action;
    if (!action || !this.agent) return;
    if ((detail.outcome || 'completed') === 'completed') this.applyBehaviorOutcome(action);
    this.agent.complete(action, detail.outcome || 'completed');
    releaseObject(this.state, action.objectId, this.slot.companionId);
    this.host.scene.clearBowlContents?.();
    this.host.store.persist();
  }

  onPathBlocked(detail) {
    const action = detail.action;
    if (!action || !this.agent) return;
    this.agent.markBlocked(action);
    releaseObject(this.state, action.objectId, this.slot.companionId);
  }

  onSecondaryAutonomousComplete(detail) {
    const action = detail.action;
    const other = this.secondarySlot();
    if (!action || !other || !this.secondaryAgent) return;
    if ((detail.outcome || 'completed') === 'completed') {
      this.applySecondaryBehaviorOutcome(other, action);
      if (['social-play', 'sleep-near-pet', 'seek-player'].includes(action.id)) {
        const relation = this.host.relationship(other.companionId);
        relation.familiarity = clamp(relation.familiarity + 0.35, 0, 100);
        relation.affection = clamp(relation.affection + 0.22, 0, 100);
        const key = [this.slot.companionId, other.companionId].sort().join(':');
        other.living.relationships[key] = { ...relation };
      }
      reinforceHabit(other.living.simulation, { trigger: 'autonomous-context', behavior: action.id, context: { room: this.secondaryContext(other).room, timeWindow: timeWindow(), objectId: action.objectId, weather: this.host.currentWeather() }, positive: true, importance: 0.3 });
    }
    this.secondaryAgent.complete(action, detail.outcome || 'completed');
    releaseObject(this.state, action.objectId, other.companionId);
    this.host.store.persist();
  }

  onSecondaryPathBlocked(detail) {
    const action = detail.action;
    const other = this.secondarySlot();
    if (!action || !other || !this.secondaryAgent) return;
    this.secondaryAgent.markBlocked(action);
    releaseObject(this.state, action.objectId, other.companionId);
  }

  applySecondaryBehaviorOutcome(other, action) {
    const living = other.living;
    const simulation = living.simulation;
    const changes = {};
    if (action.id === 'drink' && living.hydration < 88) {
      living.hydration = clamp(living.hydration + 8, 0, 100);
      changes.health = 0.6;
    }
    if (action.id === 'eat' && other.stats.hunger < 58 && (other.inventory.meal || 0) > 0) {
      other.inventory.meal -= 1;
      changes.hunger = 11;
      changes.fullness = 9;
    }
    if (['toy-play', 'bring-toy', 'chase-target', 'social-play'].includes(action.id)) {
      changes.happiness = 1.8;
      changes.energy = -0.8;
    }
    if (['sleep', 'bed-rest', 'high-rest', 'sunlight-rest'].includes(action.id)) changes.energy = (changes.energy || 0) + 2.4;
    if (['explore', 'follow-scent', 'dig', 'hunt'].includes(action.id)) {
      changes.happiness = (changes.happiness || 0) + 0.8;
      changes.energy = (changes.energy || 0) - 0.65;
    }
    Object.entries(changes).forEach(([key, value]) => {
      if (key in other.stats) other.stats[key] = clamp(other.stats[key] + value, 0, 100);
    });
    const fulfilled = fulfillHiddenDesire(simulation, action.id);
    if (fulfilled) {
      other.stats.happiness = clamp(other.stats.happiness + 3.2, 0, 100);
      other.stats.bond = clamp(other.stats.bond + 1.1, 0, 100);
    }
    reinforceHabit(simulation, {
      trigger: 'autonomous-context', behavior: action.id,
      context: { room: this.secondaryContext(other).room, timeWindow: timeWindow(), objectId: action.objectId, weather: this.host.currentWeather() },
      expectedResult: Object.keys(changes)[0] || 'comfort', positive: true, importance: fulfilled ? 0.72 : 0.35
    });
    if (fulfilled || ['fear-response', 'bring-toy', 'sleep-near-pet', 'follow-scent', 'climb'].includes(action.id)) {
      const memory = recordEpisodicMemory(simulation, {
        eventType: 'autonomous-behavior', participants: [other.companionId], location: this.secondaryContext(other).room,
        objectId: action.objectId, petReaction: action.id, emotionalValue: action.id === 'fear-response' ? -0.35 : 0.42,
        importance: fulfilled ? 0.58 : 0.36, detail: { behavior: action.id, fulfilledDesire: fulfilled }
      });
      bridgeLongTermMemory(living, memory);
    }
  }

  applyBehaviorOutcome(action) {
    const changes = {};
    if (action.id === 'drink' && this.living.hydration < 88) {
      this.living.hydration = clamp(this.living.hydration + 8, 0, 100);
      changes.health = 0.6;
    }
    if (action.id === 'eat' && this.slot.stats.hunger < 58 && (this.slot.inventory.meal || 0) > 0) {
      this.slot.inventory.meal -= 1;
      changes.hunger = 11;
      changes.fullness = 9;
    }
    if (['toy-play', 'bring-toy', 'chase-target', 'social-play'].includes(action.id)) {
      changes.happiness = 1.8;
      changes.energy = -0.8;
    }
    if (['sleep', 'bed-rest', 'high-rest', 'sunlight-rest'].includes(action.id)) changes.energy = (changes.energy || 0) + 2.4;
    if (['explore', 'follow-scent', 'dig', 'hunt'].includes(action.id)) {
      changes.happiness = (changes.happiness || 0) + 0.8;
      changes.energy = (changes.energy || 0) - 0.65;
    }
    Object.entries(changes).forEach(([key, value]) => {
      if (key in this.slot.stats) this.slot.stats[key] = clamp(this.slot.stats[key] + value, 0, 100);
    });
    const fulfilled = fulfillHiddenDesire(this.state, action.id);
    if (fulfilled) {
      this.slot.stats.happiness = clamp(this.slot.stats.happiness + 3.2, 0, 100);
      this.slot.stats.bond = clamp(this.slot.stats.bond + 1.1, 0, 100);
    }
    reinforceHabit(this.state, {
      trigger: 'autonomous-context', behavior: action.id,
      context: { room: this.context().room, timeWindow: this.context().timeWindow, objectId: action.objectId, weather: this.host.currentWeather() },
      expectedResult: Object.keys(changes)[0] || 'comfort', positive: true, importance: fulfilled ? 0.72 : 0.35
    });
    if (fulfilled || ['fear-response', 'bring-toy', 'sleep-near-pet', 'follow-scent', 'climb'].includes(action.id)) {
      const memory = recordEpisodicMemory(this.state, {
        eventType: 'autonomous-behavior', participants: [this.slot.companionId], location: this.context().room,
        objectId: action.objectId, petReaction: action.id, emotionalValue: action.id === 'fear-response' ? -0.35 : 0.42,
        importance: fulfilled ? 0.58 : 0.36, detail: { behavior: action.id, fulfilledDesire: fulfilled }
      });
      bridgeLongTermMemory(this.living, memory);
    }
  }

  observe(type, detail = {}) {
    const state = this.ensure();
    if (!state) return null;
    const context = this.context();
    const routineType = type === 'walk' && detail.room ? 'room' : type.startsWith('training-') ? 'training' : type;
    observeRoutine(state, routineType, detail, Date.now(), this.host.store.settings);
    if (MEANINGFUL.has(type)) {
      const memory = recordEpisodicMemory(state, eventMemoryPayload(type, detail, context));
      bridgeLongTermMemory(this.living, memory);
    }
    const behaviorAliases = {
      feed: 'ask-food', hydrate: 'ask-water', pet: 'request-affection', play: detail.activityId === 'fetch' ? 'bring-toy' : 'toy-play', walk: detail.location ? 'wait-door' : 'explore',
      groom: 'groom', sleep: 'sleep', social: 'social-play', 'training-success': 'trained-command', scent: 'follow-scent'
    };
    const behavior = behaviorAliases[type];
    if (behavior) {
      const positive = detail.success !== false && detail.accepted !== false;
      reinforceHabit(state, {
        trigger: type,
        behavior,
        context: { room: context.room, timeWindow: context.timeWindow, objectId: detail.objectId, weather: context.weather },
        expectedResult: positive ? 'reward' : 'discomfort', positive, importance: detail.importance || 0.5
      });
      fulfillHiddenDesire(state, behavior);
    }
    if (type === 'weather' && detail.weather === 'thunderstorm') this.adjustFear('thunderstorm', 9, 'storm');
    if (type === 'pet' && detail.comforting && this.host.currentWeather() === 'thunderstorm') this.adjustFear('thunderstorm', -8, 'comfort');
    if (type === 'walk') {
      state.dirt.dust = clamp(state.dirt.dust + 3.5, 0, 100);
      if (['rain', 'thunderstorm'].includes(context.weather)) state.dirt.mud = clamp(state.dirt.mud + 7, 0, 100);
      if (context.weather === 'snow') state.dirt.snow = clamp(state.dirt.snow + 6, 0, 100);
      if (context.season === 'autumn') state.dirt.leaves = clamp(state.dirt.leaves + 4, 0, 100);
    }
    if (type === 'groom' && ['bath', 'brush', 'paws'].includes(detail.actionId)) this.cleanDirt(detail.actionId === 'bath' ? 1 : 0.45);
    observeHiddenDesire(state, type === 'pet' ? 0.6 : 0.2);
    return state;
  }

  directInteraction(gesture = {}) {
    const state = this.ensure();
    if (!state) return { accepted: false, changes: {} };
    const interaction = state.directInteraction;
    const region = gesture.region || 'back';
    const speed = Math.max(0, Number(gesture.speed) || 0);
    const duration = Math.max(0, Number(gesture.duration) || 0);
    const repetitions = interaction.recent.filter((entry) => Date.now() - entry.at < 12000).length;
    const seed = [...`${this.slot.id}:${region}`].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const innatePreference = ((seed % 31) - 15) / 15;
    const learned = (interaction.preferredRegions[region] || 0) - (interaction.avoidedRegions[region] || 0);
    const mood = this.living.emotion?.id;
    const moodTolerance = ['content', 'playful', 'excited'].includes(mood) ? 18 : ['irritated', 'frightened', 'anxious'].includes(mood) ? -25 : 0;
    const gentleness = clamp(34 - speed * 0.022 + Math.min(18, duration / 180), -25, 38);
    const comfortScore = innatePreference * 18 + learned * 2 + moodTolerance + gentleness + this.living.personality.affectionate * 0.22 - interaction.overstimulation * 0.55;
    const accepted = comfortScore > -8;
    const overstimulated = repetitions >= 8 || interaction.overstimulation > 72 || (speed > 1500 && repetitions > 3);
    interaction.overstimulation = clamp(interaction.overstimulation + (overstimulated ? 14 : accepted ? 3.5 : 7), 0, 100);
    interaction.lastAt = Date.now();
    interaction.recent.push({ at: Date.now(), region, speed: Math.round(speed), duration: Math.round(duration), accepted, overstimulated });
    if (interaction.recent.length > 24) interaction.recent.splice(0, interaction.recent.length - 24);
    if (accepted && !overstimulated) interaction.preferredRegions[region] = clamp((interaction.preferredRegions[region] || 0) + 0.22, 0, 20);
    else interaction.avoidedRegions[region] = clamp((interaction.avoidedRegions[region] || 0) + 0.35, 0, 20);
    const changes = accepted && !overstimulated
      ? { happiness: 0.7 + Math.min(0.6, duration / 2500), bond: 0.35 + this.living.personality.affectionate / 300 }
      : { happiness: overstimulated ? -0.35 : -0.15, bond: 0.05 };
    const reaction = overstimulated ? 'move-away' : accepted ? (comfortScore > 35 ? 'lean-in' : 'relax') : 'avoid-affection';
    observeHiddenDesire(state, 1);
    return { accepted: accepted && !overstimulated, overstimulated, reaction, region, changes };
  }

  adjustFear(id, amount, source = id) {
    const fear = this.state.fears[id] ||= { intensity: 0, confidence: 0, lastTriggeredAt: 0, comfortCount: 0, source };
    fear.intensity = clamp(fear.intensity + amount, 0, 100);
    fear.confidence = clamp(fear.confidence + Math.abs(amount) * 0.7, 0, 100);
    fear.lastTriggeredAt = Date.now();
    if (amount < 0) fear.comfortCount += 1;
    return fear;
  }

  cleanDirt(strength = 1) {
    Object.keys(this.state.dirt).forEach((key) => { this.state.dirt[key] = clamp(this.state.dirt[key] - 100 * strength, 0, 100); });
    this.syncDirt(true);
  }

  syncDirt(force = false) {
    if (!this.state || !this.host.scene.setPetDirtState) return;
    const signature = Object.entries(this.state.dirt).map(([key, value]) => `${key}:${Math.round(value / 5)}`).join('|');
    if (!force && signature === this.lastDirtSignature) return;
    this.lastDirtSignature = signature;
    this.host.scene.setPetDirtState(this.state.dirt);
  }

  updateBodyLanguage() {
    if (!this.state) return;
    const language = bodyLanguageFor(this.state, { fallback: this.living.bodyLanguage?.last || 'relaxed', intensity: this.living.emotion?.intensity || 0.5 });
    this.living.bodyLanguage.last = language.id;
    this.host.scene.setBodyLanguage?.(language.id, language.intensity);
  }

  interpretDesire({ accessibility = false } = {}) {
    return interpretHiddenDesire(this.state, this.slot?.petName, getLanguage(), { accessibility });
  }

  observeDesire(amount = 1) {
    const desire = observeHiddenDesire(this.state, amount);
    this.updateBodyLanguage();
    return desire;
  }

  handleEventTransition(result) {
    if (result.transition === 'started' || result.transition === 'active') {
      this.host.scene.setEmergentEvent?.(result.active);
      if (result.transition === 'started') this.host.dispatchEvent(new CustomEvent('emergent-event', { detail: { phase: 'started', event: result.active } }));
      return;
    }
    if (result.transition === 'resolved' && result.resolved) {
      this.host.scene.setEmergentEvent?.(null);
      applyEventConsequence(this.slot, this.living, result.resolved);
      const consequence = result.resolved.consequence;
      if (result.resolved.id === 'thunder') this.adjustFear('thunderstorm', consequence.fearDelta, result.resolved.response);
      const memory = recordEpisodicMemory(this.state, {
        eventType: result.resolved.memoryType || result.resolved.id,
        participants: result.resolved.participants,
        location: result.resolved.room,
        playerAction: result.resolved.response,
        petReaction: result.resolved.id,
        emotionalValue: consequence.valence,
        importance: result.resolved.rare ? 0.9 : 0.62,
        associatedFear: result.resolved.id === 'thunder' ? 'thunderstorm' : null,
        associatedReward: consequence.reward || null,
        detail: { eventId: result.resolved.id, response: result.resolved.response }
      });
      bridgeLongTermMemory(this.living, memory);
      this.host.dispatchEvent(new CustomEvent('emergent-event', { detail: { phase: 'resolved', event: result.resolved } }));
      this.host.store.persist();
    }
  }

  respondToEvent(response) {
    const result = respondToEmergentEvent(this.state, this.context(), response);
    if (!result.ok && !result.transition) return false;
    this.handleEventTransition(result);
    return true;
  }

  resetRoutines() {
    resetRoutines(this.state);
    this.host.store.persist();
  }

  strongestHabits(limit = 6) { return strongestHabits(this.state, limit); }
  routineSummary(limit = 6) { return routineSummary(this.state, limit); }

  debugSnapshot() {
    const state = this.state;
    const relation = this.living?.secondaryPetId ? this.host.relationship(this.living.secondaryPetId) : null;
    return {
      action: state?.agent?.currentAction || 'idle',
      candidates: state?.agent?.utilityCandidates || [],
      target: state?.agent?.targetObjectId || state?.agent?.target || null,
      desire: state?.agent?.hiddenDesire || null,
      navigation: state?.agent?.navigationState || 'idle',
      event: state?.emergentEvents?.active || null,
      memoryInfluence: state?.agent?.memoryInfluence || [],
      routineConfidence: this.routineSummary(1)[0]?.confidence || 0,
      relationship: relation
    };
  }

  prepareOfflineWindow(from, to = Date.now()) {
    const state = this.ensure();
    if (!state) return;
    const durationMs = Math.min(MAX_OFFLINE_HOURS * HOUR, Math.max(0, to - from));
    state.offline.pending = { from, to, durationMs };
  }
}
