import { clamp } from '../utils.js';
import { habitUtilityBias } from './habits.js';
import { memoryUtilityBias } from './memory.js';
import { routineAnticipation, routineBiasForBehavior } from './routines.js';
import { chooseAvailableObject, objectsForBehavior } from './environment-actions.js';
import { speciesAllows, speciesBehaviorBias } from './species-behaviors.js';

export const BEHAVIORS = [
  { id: 'idle-observe', base: 14, min: 5000, cooldown: 2000, animation: 'idle', drive: 'calm' },
  { id: 'sleep', base: 2, min: 18000, cooldown: 45000, animation: 'lie_down', drive: 'energy', object: 'bed' },
  { id: 'bed-rest', base: 7, min: 11000, cooldown: 28000, animation: 'lie_down', drive: 'energy', object: 'bed' },
  { id: 'eat', base: 0, min: 7000, cooldown: 50000, animation: 'idle', drive: 'hunger', object: 'food' },
  { id: 'drink', base: 0, min: 6500, cooldown: 42000, animation: 'idle', drive: 'thirst', object: 'water' },
  { id: 'ask-food', base: 2, min: 6000, cooldown: 36000, animation: 'sit', drive: 'hunger', object: 'food' },
  { id: 'ask-water', base: 1, min: 6000, cooldown: 36000, animation: 'sit', drive: 'thirst', object: 'water' },
  { id: 'seek-player', base: 8, min: 7000, cooldown: 18000, animation: 'sit', drive: 'bond', object: 'player' },
  { id: 'request-affection', base: 6, min: 8000, cooldown: 32000, animation: 'sit', drive: 'bond', object: 'player' },
  { id: 'avoid-affection', base: 0, min: 9000, cooldown: 35000, animation: 'idle', drive: 'safety', object: 'quiet' },
  { id: 'toy-play', base: 9, min: 9000, cooldown: 26000, animation: 'idle', drive: 'fun', object: 'toy', run: true },
  { id: 'bring-toy', base: 5, min: 10000, cooldown: 42000, animation: 'run', drive: 'fun', object: 'toy', run: true },
  { id: 'social-play', base: 4, min: 11000, cooldown: 38000, animation: 'idle', drive: 'social', requiresFriend: true, targetFriend: true },
  { id: 'explore', base: 11, min: 7500, cooldown: 12000, animation: 'idle', drive: 'curiosity', roam: true },
  { id: 'favorite-place', base: 8, min: 11000, cooldown: 28000, animation: 'lie_down', drive: 'calm', preferred: true },
  { id: 'hide', base: 3, min: 11000, cooldown: 34000, animation: 'idle', drive: 'safety', object: 'hide' },
  { id: 'window-watch', base: 8, min: 11000, cooldown: 30000, animation: 'sit', drive: 'curiosity', object: 'window' },
  { id: 'sunlight-rest', base: 5, min: 12000, cooldown: 40000, animation: 'lie_down', drive: 'calm', object: 'bench', weather: ['clear', 'sunshine', 'rainbow'] },
  { id: 'avoid-rain', base: 0, min: 10000, cooldown: 26000, animation: 'sit', drive: 'safety', object: 'quiet', weather: ['rain', 'thunderstorm', 'snow'] },
  { id: 'investigate-sound', base: 4, min: 7000, cooldown: 24000, animation: 'idle', drive: 'curiosity' },
  { id: 'fear-response', base: 0, min: 12000, cooldown: 18000, animation: 'sit', drive: 'safety', object: 'quiet', interrupt: 5 },
  { id: 'trained-command', base: 2, min: 6500, cooldown: 30000, animation: 'sit', drive: 'bond', object: 'marker' },
  { id: 'misbehave', base: 1, min: 7000, cooldown: 52000, animation: 'idle', drive: 'fun', object: 'movable' },
  { id: 'groom', base: 2, min: 8500, cooldown: 36000, animation: 'idle', drive: 'hygiene' },
  { id: 'scratch', base: 4, min: 8500, cooldown: 35000, animation: 'idle', drive: 'species', object: 'tree' },
  { id: 'dig', base: 3, min: 9000, cooldown: 40000, animation: 'idle', drive: 'species', object: 'soil' },
  { id: 'climb', base: 4, min: 10000, cooldown: 42000, animation: 'jump', drive: 'species', object: 'perch', vertical: true },
  { id: 'high-rest', base: 5, min: 13000, cooldown: 45000, animation: 'lie_down', drive: 'calm', object: 'perch', vertical: true },
  { id: 'follow-scent', base: 4, min: 9000, cooldown: 32000, animation: 'walk', drive: 'species', object: 'scent' },
  { id: 'guard-object', base: 1, min: 10000, cooldown: 50000, animation: 'sit', drive: 'species' },
  { id: 'sleep-near-pet', base: 3, min: 14000, cooldown: 50000, animation: 'lie_down', drive: 'social', requiresFriend: true, targetFriend: true },
  { id: 'seek-solitude', base: 4, min: 11000, cooldown: 35000, animation: 'idle', drive: 'calm', object: 'quiet' },
  { id: 'chase-target', base: 6, min: 9000, cooldown: 32000, animation: 'run', drive: 'fun', object: 'target', run: true },
  { id: 'hunt', base: 3, min: 10000, cooldown: 42000, animation: 'walk', drive: 'species', object: 'target' },
  { id: 'wait-door', base: 4, min: 10000, cooldown: 36000, animation: 'sit', drive: 'routine', object: 'door' },
  { id: 'investigate-object', base: 7, min: 8000, cooldown: 24000, animation: 'idle', drive: 'curiosity' }
];

const behaviorById = new Map(BEHAVIORS.map((behavior) => [behavior.id, behavior]));

function deterministicNoise(seed) {
  let hash = 2166136261;
  for (const char of String(seed)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return ((hash >>> 0) % 1000) / 1000;
}

function driveScore(drive, context) {
  const stats = context.stats;
  const traits = context.traits;
  const map = {
    hunger: (100 - stats.hunger) * 0.95 + traits.foodMotivated * 0.2,
    thirst: (100 - context.hydration) * 1.05 + (100 - stats.health) * 0.12,
    energy: (100 - stats.energy) * 0.92 + traits.lazy * 0.2,
    fun: (100 - stats.happiness) * 0.54 + traits.playful * 0.42 + stats.energy * 0.12,
    bond: (100 - stats.bond) * 0.26 + traits.affectionate * 0.4 + (context.emotion === 'lonely' ? 30 : 0),
    social: context.hasFriend ? traits.sociable * 0.45 + (context.relationship?.affection || context.relationship?.comfort || 0) * 0.22 : -100,
    hygiene: (100 - stats.hygiene) * 0.5 + context.dirtTotal * 0.35,
    curiosity: traits.curious * 0.48 + stats.energy * 0.16,
    calm: traits.calm * 0.28 + traits.independent * 0.14 + (100 - stats.energy) * 0.18,
    safety: (context.fearIntensity || 0) * 0.7 + (['frightened', 'anxious'].includes(context.emotion) ? 42 : 0),
    species: traits.curious * 0.2 + traits.playful * 0.16,
    routine: 0
  };
  return map[drive] || 0;
}

function personalityScore(behavior, traits) {
  const scores = {
    'idle-observe': traits.calm * 0.12,
    sleep: traits.lazy * 0.18,
    'bed-rest': traits.lazy * 0.14,
    'toy-play': traits.playful * 0.16,
    'bring-toy': traits.playful * 0.12 + traits.sociable * 0.08,
    explore: traits.curious * 0.16 + traits.brave * 0.08,
    'investigate-object': traits.curious * 0.18,
    'window-watch': traits.curious * 0.12 + traits.calm * 0.08,
    'seek-solitude': traits.independent * 0.16,
    'request-affection': traits.affectionate * 0.16,
    'avoid-affection': traits.independent * 0.12 + traits.stubborn * 0.07,
    misbehave: traits.stubborn * 0.1 + traits.playful * 0.08,
    'fear-response': (100 - traits.brave) * 0.16
  };
  return scores[behavior.id] || 0;
}

function urgencyScore(behavior, context) {
  const { stats } = context;
  let score = 0;
  if (behavior.drive === 'hunger') score += clamp(48 - stats.hunger, 0, 48) * 1.05;
  if (behavior.drive === 'thirst') score += clamp(52 - context.hydration, 0, 52) * 1.08;
  if (behavior.drive === 'energy') score += clamp(42 - stats.energy, 0, 42) * 0.95;
  if (behavior.drive === 'safety') score += clamp((context.fearIntensity || 0) - 35, 0, 65) * 0.55;
  if (stats.health < 30 && ['drink', 'bed-rest', 'sleep', 'seek-player'].includes(behavior.id)) score += 18;
  if (stats.energy < 18 && (behavior.run || ['toy-play', 'social-play', 'dig', 'climb'].includes(behavior.id))) score -= 34;
  return score;
}

function emotionScore(behavior, emotion) {
  const matches = {
    sleepy: ['sleep', 'bed-rest', 'favorite-place'], bored: ['toy-play', 'bring-toy', 'explore', 'chase-target'],
    frightened: ['fear-response', 'hide', 'seek-player', 'avoid-rain'], anxious: ['fear-response', 'seek-player', 'groom'],
    lonely: ['seek-player', 'request-affection', 'social-play', 'sleep-near-pet'], playful: ['toy-play', 'bring-toy', 'chase-target', 'social-play'],
    curious: ['explore', 'window-watch', 'investigate-object', 'follow-scent', 'climb'],
    irritated: ['avoid-affection', 'seek-solitude', 'groom'], content: ['favorite-place', 'window-watch', 'sunlight-rest'],
    jealous: ['guard-object', 'seek-player']
  };
  return matches[emotion]?.includes(behavior.id) ? 18 : 0;
}

function findObjects(context, behavior) {
  const all = Array.isArray(context.objects) && context.objects.length
    ? context.objects
    : objectsForBehavior(context.room, context.species, behavior.id);
  let objects = all.filter((object) => Array.isArray(object.actions) && object.actions.includes(behavior.id));
  if (behavior.object) objects = objects.filter((object) => object.type === behavior.object || object.actions.includes(behavior.id));
  if (behavior.id === 'favorite-place') {
    objects = all.filter((object) => Array.isArray(object.actions)
      && (object.actions.includes('bed-rest') || object.actions.includes('high-rest') || object.actions.includes('window-watch')));
  }
  if (behavior.id === 'investigate-sound' || behavior.id === 'investigate-object' || behavior.id === 'guard-object') {
    objects = all.filter((object) => ['window', 'door', 'movable', 'cabinet', 'toy', 'target', 'puzzle', 'bench', 'hide', 'tree', 'perch'].includes(object.type));
  }
  return objects;
}

export function scoreUtilityBehaviors(simulation, context, now = Date.now()) {
  const anticipations = routineAnticipation(simulation, now, context.settings);
  const recent = simulation.agent.recentActions || [];
  const candidates = [];
  for (const behavior of BEHAVIORS) {
    if (!speciesAllows(context.species, behavior.id)) continue;
    if (behavior.requiresFriend && !context.hasFriend) continue;
    if (behavior.weather && !behavior.weather.includes(context.weather)) continue;
    const cooldownUntil = simulation.agent.cooldowns[behavior.id] || 0;
    const objects = behavior.roam || behavior.targetFriend ? [] : findObjects(context, behavior);
    if (!behavior.roam && !behavior.targetFriend && behavior.id !== 'idle-observe' && behavior.id !== 'groom' && !objects.length) continue;
    let score = behavior.base + driveScore(behavior.drive, context) + urgencyScore(behavior, context) + personalityScore(behavior, context.traits) + emotionScore(behavior, context.emotion);
    score += speciesBehaviorBias(context.species, behavior.id, context.traits, context.physical);
    if (context.lifeStage === 'young' && ['toy-play', 'explore', 'chase-target'].includes(behavior.id)) score += 5;
    if (context.lifeStage === 'veteran' && ['sleep', 'bed-rest', 'favorite-place'].includes(behavior.id)) score += 7;
    if (context.playerActivity === 'clean' && behavior.id === 'avoid-affection') score += 8;
    score += routineBiasForBehavior(anticipations, behavior.id);
    const preferredObjectId = context.preferences?.favoriteSleepingLocation?.value === context.room ? objects[0]?.id : null;
    const object = behavior.targetFriend ? null : chooseAvailableObject(simulation, objects, context.petId, preferredObjectId);
    if (!behavior.roam && !behavior.targetFriend && behavior.id !== 'idle-observe' && behavior.id !== 'groom' && !object) continue;
    const memory = memoryUtilityBias(simulation, { action: behavior.id, objectId: object?.id, room: context.room, weather: context.weather });
    const habit = habitUtilityBias(simulation, behavior.id, { room: context.room, timeWindow: context.timeWindow, objectId: object?.id, weather: context.weather });
    score += memory.bias + habit.bias;
    if (context.hiddenDesire?.behavior === behavior.id && !context.hiddenDesire.fulfilled) score += 30;
    if (behavior.id === 'eat' && context.stats.hunger > 68) score -= 40;
    if (behavior.id === 'drink' && context.hydration > 72) score -= 42;
    if (behavior.id === 'sleep' && context.stats.energy > 68) score -= 48;
    if (behavior.id === 'avoid-affection' && context.overstimulation < 35) score -= 35;
    if (behavior.id === 'steal-food' && context.stats.hunger > 48) score -= 20;
    if (behavior.id === 'avoid-rain' && !['rain', 'thunderstorm', 'snow'].includes(context.weather)) score -= 60;
    if (behavior.id === 'sunlight-rest' && !['clear', 'sunshine', 'rainbow'].includes(context.weather)) score -= 50;
    const repetitions = recent.slice(-6).filter((id) => id === behavior.id).length;
    score -= repetitions * 17;
    if (recent.at(-1) === behavior.id) score -= 11;
    if (cooldownUntil > now) score -= 100 + Math.min(40, (cooldownUntil - now) / 1000);
    if (context.currentAction === behavior.id && now < context.minimumUntil) score += 24;
    score += (deterministicNoise(`${context.slotId}:${behavior.id}:${Math.floor(now / 10000)}`) - 0.5) * 5;
    candidates.push({
      ...behavior,
      score,
      object,
      memoryInfluence: memory.recalled.map(({ memory: item, score: influence }) => ({ id: item.id, type: item.eventType, valence: item.valence, score: influence })),
      habitInfluence: habit.habits.map(({ habit: item, match }) => ({ id: item.id, strength: item.strength, match })),
      routineInfluence: anticipations.filter((item) => routineBiasForBehavior([item], behavior.id) > 0).map((item) => ({ type: item.type, score: item.score }))
    });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

export function chooseUtilityBehavior(simulation, context, now = Date.now()) {
  const candidates = scoreUtilityBehaviors(simulation, context, now);
  const selected = candidates[0] || { ...behaviorById.get('idle-observe'), score: 0, object: null, memoryInfluence: [] };
  return { selected, candidates };
}

export function behaviorDefinition(id) {
  return behaviorById.get(id) || behaviorById.get('idle-observe');
}
