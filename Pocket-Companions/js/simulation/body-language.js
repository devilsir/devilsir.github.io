import { clamp } from '../utils.js';
import { objectsForBehavior } from './environment-actions.js';

const DESIRES = [
  { id: 'affection', behavior: 'request-affection', need: 'bond', cues: ['approaching', 'watchful'] },
  { id: 'solitude', behavior: 'seek-solitude', need: 'happiness', cues: ['slow-looking', 'watchful'] },
  { id: 'toy', behavior: 'bring-toy', need: 'happiness', cues: ['play-bow', 'bouncy'] },
  { id: 'favorite-place', behavior: 'favorite-place', need: 'energy', cues: ['head-tilt', 'relaxed'] },
  { id: 'friend', behavior: 'social-play', need: 'bond', cues: ['approaching', 'play-bow'], requiresFriend: true },
  { id: 'outside', behavior: 'wait-door', need: 'happiness', cues: ['watchful', 'approaching'], species: 'dog' },
  { id: 'other-room', behavior: 'explore', need: 'happiness', cues: ['watchful', 'head-tilt'], roaming: true },
  { id: 'investigate', behavior: 'investigate-object', need: 'happiness', cues: ['head-tilt', 'watchful'] },
  { id: 'favorite-food', behavior: 'ask-food', need: 'hunger', cues: ['approaching', 'watchful'] },
  { id: 'grooming', behavior: 'groom', need: 'hygiene', cues: ['slow-looking', 'approaching'] },
  { id: 'brush', behavior: 'groom', need: 'hygiene', cues: ['approaching', 'relaxed'] },
  { id: 'avoid-food', behavior: 'seek-solitude', need: 'hunger', cues: ['watchful', 'slow-looking'], requiresDisliked: true },
  { id: 'window', behavior: 'window-watch', need: 'happiness', cues: ['head-tilt', 'watchful'] },
  { id: 'scent', behavior: 'follow-scent', need: 'happiness', cues: ['head-tilt', 'pacing'], species: 'dog' },
  { id: 'climb', behavior: 'climb', need: 'energy', cues: ['head-tilt', 'upright'], species: 'cat' },
  { id: 'hidden-object', behavior: 'investigate-object', need: 'happiness', cues: ['pacing', 'head-tilt'] }
];

const COPY = {
  affection: { en: '{pet} seems to be inviting gentle affection.', pt: '{pet} parece estar convidando você para um carinho tranquilo.' },
  solitude: { en: '{pet} seems to want a little quiet space.', pt: '{pet} parece querer um cantinho mais tranquilo.' },
  toy: { en: '{pet} keeps glancing toward {object}.', pt: '{pet} continua olhando para {object}.' },
  'favorite-place': { en: '{pet} seems drawn to a familiar resting place.', pt: '{pet} parece atraído por um lugar conhecido de descanso.' },
  friend: { en: '{pet} seems interested in spending time with the other companion.', pt: '{pet} parece querer passar um tempo com o outro pet.' },
  outside: { en: '{pet} keeps checking the door.', pt: '{pet} continua observando a porta.' },
  'other-room': { en: '{pet} keeps checking the room exits and nearby paths.', pt: '{pet} continua observando as saídas e os caminhos do ambiente.' },
  investigate: { en: '{pet} noticed something near {object}.', pt: '{pet} percebeu algo perto de {object}.' },
  'favorite-food': { en: '{pet} is checking the food area with unusual focus.', pt: '{pet} está observando a área de comida com atenção especial.' },
  grooming: { en: '{pet} is nudging the grooming area.', pt: '{pet} está chamando atenção para os cuidados de higiene.' },
  brush: { en: '{pet} appears receptive to a calm brushing session.', pt: '{pet} parece receptivo a uma escovação tranquila.' },
  'avoid-food': { en: '{pet} is keeping some distance from the food area.', pt: '{pet} está mantendo certa distância da área de comida.' },
  window: { en: '{pet} keeps looking toward the window.', pt: '{pet} continua olhando para a janela.' },
  scent: { en: '{pet} appears to have caught an interesting scent.', pt: '{pet} parece ter encontrado um cheiro interessante.' },
  climb: { en: '{pet} is studying a safe high resting place.', pt: '{pet} está estudando um lugar alto e seguro para descansar.' },
  'hidden-object': { en: '{pet} seems convinced that something is hidden nearby.', pt: '{pet} parece convencido de que há algo escondido por perto.' }
};

function stableIndex(seed, length) {
  let hash = 2166136261;
  for (const char of String(seed)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return Math.abs(hash >>> 0) % Math.max(1, length);
}

export function updateHiddenDesire(simulation, context, now = Date.now()) {
  const agent = simulation.agent;
  const current = agent.hiddenDesire;
  if (current && now < current.expiresAt && !current.fulfilled) return current;
  const interval = 7 * 60000 + stableIndex(`${context.slotId}:${now >> 18}`, 8) * 60000;
  if (now - (agent.lastDesireAt || 0) < interval) return current?.fulfilled ? null : current;
  const available = DESIRES.filter((desire) => {
    if (desire.species && desire.species !== context.species) return false;
    if (desire.requiresFriend && !context.hasFriend) return false;
    if (desire.requiresDisliked && context.preferences?.dislikedFood?.status === 'unknown') return false;
    return desire.behavior === 'favorite-place' || desire.roaming || objectsForBehavior(context.room, context.species, desire.behavior).length > 0;
  });
  if (!available.length) return null;
  const urgency = {
    hunger: 100 - context.stats.hunger,
    energy: 100 - context.stats.energy,
    happiness: 100 - context.stats.happiness,
    hygiene: 100 - context.stats.hygiene,
    bond: 100 - context.stats.bond
  };
  available.sort((a, b) => (urgency[b.need] || 0) - (urgency[a.need] || 0));
  const shortlist = available.slice(0, Math.min(5, available.length));
  const desire = shortlist[stableIndex(`${context.petId}:${now}:${context.room}`, shortlist.length)];
  const target = objectsForBehavior(context.room, context.species, desire.behavior)[0] || null;
  agent.hiddenDesire = {
    id: desire.id,
    behavior: desire.behavior,
    need: desire.need,
    objectId: target?.id || null,
    objectType: target?.type || null,
    createdAt: now,
    expiresAt: now + 18 * 60000,
    observations: 0,
    cueIndex: 0,
    fulfilled: false,
    revealed: false
  };
  agent.lastDesireAt = now;
  return agent.hiddenDesire;
}

export function observeHiddenDesire(simulation, amount = 1) {
  const desire = simulation?.agent?.hiddenDesire;
  if (!desire || desire.fulfilled) return null;
  desire.observations = clamp((desire.observations || 0) + amount, 0, 8);
  desire.cueIndex = Math.min((DESIRES.find((entry) => entry.id === desire.id)?.cues.length || 1) - 1, Math.floor(desire.observations / 2));
  return desire;
}

export function fulfillHiddenDesire(simulation, behavior) {
  const desire = simulation?.agent?.hiddenDesire;
  if (!desire || desire.fulfilled || desire.behavior !== behavior) return false;
  desire.fulfilled = true;
  desire.fulfilledAt = Date.now();
  simulation.agent.desireHistory.push({ ...desire });
  if (simulation.agent.desireHistory.length > 12) simulation.agent.desireHistory.splice(0, simulation.agent.desireHistory.length - 12);
  return true;
}

export function bodyLanguageFor(simulation, context) {
  const desire = simulation?.agent?.hiddenDesire;
  if (desire && !desire.fulfilled) {
    const definition = DESIRES.find((entry) => entry.id === desire.id);
    const cue = definition?.cues[Math.min(desire.cueIndex || 0, (definition.cues.length || 1) - 1)];
    if (cue) return { id: cue, intensity: clamp(0.38 + desire.observations * 0.06, 0.38, 0.78), source: 'desire' };
  }
  const actionMap = {
    'request-affection': 'approaching', 'seek-player': 'approaching', 'avoid-affection': 'watchful',
    'seek-solitude': 'slow-looking', hide: 'low-and-close', 'toy-play': 'play-bow', 'bring-toy': 'play-bow',
    'window-watch': 'head-tilt', 'investigate-object': 'head-tilt', 'follow-scent': 'pacing',
    'fear-response': 'low-and-close', climb: 'upright', 'high-rest': 'watchful', dig: 'bouncy',
    'chase-target': 'bouncy', hunt: 'watchful', sleep: 'heavy', 'bed-rest': 'heavy'
  };
  return { id: actionMap[simulation?.agent?.currentAction] || context.fallback || 'relaxed', intensity: context.intensity || 0.5, source: 'action' };
}

export function interpretHiddenDesire(simulation, petName, language = 'pt-BR', { accessibility = false } = {}) {
  const desire = simulation?.agent?.hiddenDesire;
  if (!desire || desire.fulfilled) return '';
  const age = Date.now() - desire.createdAt;
  const observable = desire.observations >= 2 || (accessibility && age >= 25000);
  if (!observable) return '';
  const template = COPY[desire.id]?.[language === 'en' ? 'en' : 'pt'];
  if (!template) return '';
  desire.revealed ||= desire.observations >= 3 || accessibility;
  const objectName = String(desire.objectType || 'something nearby').replaceAll('-', ' ');
  return template.replace('{pet}', petName || 'Your companion').replace('{object}', objectName);
}
