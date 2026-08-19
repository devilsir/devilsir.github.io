import { clamp, uid } from '../utils.js';

const MINUTE = 60000;

export const EMERGENT_EVENTS = [
  { id: 'bird-window', rooms: ['living', 'bedroom', 'kitchen'], weights: { cat: 1.8, dog: 0.8 }, objectType: 'window', duration: 55, responses: ['observe', 'redirect'], memory: 'bird-at-window' },
  { id: 'butterfly', rooms: ['garden', 'park'], weights: { cat: 1.45, dog: 1.05 }, seasons: ['spring', 'summer'], weather: ['clear', 'sunshine', 'rainbow'], duration: 60, responses: ['follow', 'stay-calm'], memory: 'butterfly-visit' },
  { id: 'mysterious-box', rooms: ['living', 'playroom'], weights: { cat: 1.7, dog: 1.0 }, duration: 75, responses: ['open-together', 'give-space'], memory: 'mysterious-box' },
  { id: 'toy-stuck', rooms: ['living', 'bedroom', 'playroom'], weights: { cat: 1.0, dog: 1.5 }, duration: 70, responses: ['help', 'encourage'], memory: 'toy-stuck' },
  { id: 'thunder', rooms: ['living', 'bedroom', 'kitchen'], weights: { cat: 1.0, dog: 1.0 }, weather: ['thunderstorm'], duration: 65, responses: ['comfort', 'safe-space'], memory: 'storm-response', priority: 3 },
  { id: 'power-outage', rooms: ['living', 'bedroom', 'kitchen', 'playroom'], weights: { cat: 0.8, dog: 0.8 }, time: ['night', 'late-night'], duration: 50, responses: ['stay-close', 'use-lamp'], memory: 'power-outage' },
  { id: 'plant-fall', rooms: ['living', 'bedroom'], weights: { cat: 1.25, dog: 0.75 }, duration: 55, responses: ['redirect', 'clean-up'], memory: 'plant-fell' },
  { id: 'hidden-item', rooms: ['garden', 'park', 'playroom'], weights: { cat: 1.2, dog: 1.35 }, duration: 70, responses: ['search', 'follow-pet'], memory: 'hidden-item' },
  { id: 'scent-trail', rooms: ['garden', 'park', 'kitchen'], weights: { cat: 0.45, dog: 2.0 }, duration: 75, responses: ['follow', 'call-back'], memory: 'ambient-scent' },
  { id: 'mud-puddle', rooms: ['garden', 'park'], weights: { cat: 0.55, dog: 1.4 }, weather: ['rain', 'thunderstorm'], duration: 65, responses: ['explore', 'redirect'], memory: 'mud-puddle' },
  { id: 'snow-drift', rooms: ['garden', 'park', 'snow-trail'], weights: { cat: 0.8, dog: 1.15 }, seasons: ['winter'], weather: ['snow'], duration: 65, responses: ['play', 'warm-up'], memory: 'snow-play' },
  { id: 'rare-visitor', rooms: ['garden', 'park'], weights: { cat: 0.55, dog: 0.55 }, weather: ['clear', 'sunshine', 'rainbow'], duration: 80, responses: ['observe', 'approach-slowly'], memory: 'rare-visitor', rare: true },
  { id: 'pet-comfort', rooms: ['living', 'bedroom'], weights: { cat: 1.0, dog: 1.0 }, requiresFriend: true, duration: 55, responses: ['let-them-rest', 'reward-kindness'], memory: 'pet-comfort' }
];

const hash = (text) => [...String(text)].reduce((value, char) => Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261);

function eventWeight(event, context, state) {
  if (!event.rooms.includes(context.room)) return 0;
  if (event.weather && !event.weather.includes(context.weather)) return 0;
  if (event.seasons && !event.seasons.includes(context.season)) return 0;
  if (event.time && !event.time.includes(context.timeWindow)) return 0;
  if (event.requiresFriend && !context.hasFriend) return 0;
  if ((state.cooldowns[event.id] || 0) > Date.now()) return 0;
  if (state.history.slice(-4).some((entry) => entry.id === event.id)) return 0;
  let weight = event.weights?.[context.species] || 1;
  if (event.objectType && !context.objects?.some((object) => object.type === event.objectType)) return 0;
  if (event.id === 'thunder') weight += (100 - context.traits.brave) / 35;
  if (event.id === 'hidden-item' || event.id === 'mysterious-box') weight += context.traits.curious / 100;
  if (event.id === 'pet-comfort') weight += context.relationship?.protectiveTendency / 50 || 0;
  if (context.emotion === 'curious' && ['bird-window','butterfly','mysterious-box','hidden-item','rare-visitor'].includes(event.id)) weight += 0.45;
  if (context.emotion === 'frightened' && ['thunder','power-outage'].includes(event.id)) weight += 0.35;
  if (event.rare) weight *= 0.22;
  return Math.max(0, weight);
}

export function evaluateEventScheduler(simulation, context, now = Date.now()) {
  const state = simulation.emergentEvents;
  if (state.active) return { active: state.active, transition: null };
  if (now < (state.nextEvaluationAt || 0)) return { active: null, transition: null };
  state.nextEvaluationAt = now + (context.lowPerformance ? 2.5 : 1) * 45 * MINUTE / 5;
  const weighted = EMERGENT_EVENTS.map((event) => ({ event, weight: eventWeight(event, context, state) })).filter((entry) => entry.weight > 0);
  if (!weighted.length) return { active: null, transition: null };
  const rollSeed = hash(`${context.slotId}:${context.room}:${Math.floor(now / 45000)}:${state.sequence}`);
  const chance = context.weather === 'thunderstorm' ? 0.62 : context.hasFriend ? 0.2 : 0.14;
  if ((rollSeed % 1000) / 1000 > chance) return { active: null, transition: null };
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let cursor = ((rollSeed >>> 8) % 10000) / 10000 * total;
  let selected = weighted[0].event;
  for (const entry of weighted) {
    cursor -= entry.weight;
    if (cursor <= 0) { selected = entry.event; break; }
  }
  state.sequence += 1;
  state.active = {
    instanceId: uid(), id: selected.id, phase: 'beginning', startedAt: now,
    activeAt: now + 2500, endsAt: now + selected.duration * 1000,
    responses: [...selected.responses], response: null, consequence: null,
    room: context.room, weather: context.weather, participants: context.hasFriend ? [context.petId, context.friendId] : [context.petId],
    memoryType: selected.memory, rare: Boolean(selected.rare)
  };
  return { active: state.active, transition: 'started' };
}

export function advanceEmergentEvent(simulation, context, now = Date.now()) {
  const state = simulation.emergentEvents;
  const active = state.active;
  if (!active) return { active: null, transition: null };
  if (active.phase === 'beginning' && now >= active.activeAt) {
    active.phase = 'active';
    return { active, transition: 'active' };
  }
  if (now >= active.endsAt) return resolveEmergentEvent(simulation, context, active.response || 'no-response', now);
  return { active, transition: null };
}

export function respondToEmergentEvent(simulation, context, response, now = Date.now()) {
  const active = simulation?.emergentEvents?.active;
  if (!active || active.phase === 'resolved' || !active.responses.includes(response)) return { ok: false };
  active.response = response;
  return resolveEmergentEvent(simulation, context, response, now);
}

function resolveEmergentEvent(simulation, context, response, now) {
  const state = simulation.emergentEvents;
  const active = state.active;
  if (!active) return { active: null, transition: null };
  const supportive = !['no-response', 'redirect', 'call-back'].includes(response);
  const valence = supportive ? 0.55 : active.id === 'thunder' || active.id === 'power-outage' ? -0.35 : 0.05;
  active.phase = 'resolved';
  active.resolvedAt = now;
  active.consequence = {
    valence,
    bond: supportive ? 1.4 : 0,
    happiness: supportive ? 2.5 : active.id === 'thunder' ? -1.5 : 0,
    fearDelta: active.id === 'thunder' ? (supportive ? -7 : 4) : 0,
    dirt: active.id === 'mud-puddle' ? (response === 'explore' ? 16 : 4) : active.id === 'snow-drift' ? 8 : 0,
    reward: active.id === 'hidden-item' || active.rare ? 12 : supportive ? 3 : 0
  };
  state.history.push({ ...active });
  if (state.history.length > 24) state.history.splice(0, state.history.length - 24);
  state.cooldowns[active.id] = now + (active.rare ? 24 * 60 : 8) * MINUTE;
  state.active = null;
  state.nextEvaluationAt = now + 5 * MINUTE;
  return { active: null, transition: 'resolved', resolved: active };
}

export function recoverEventState(simulation, context, now = Date.now()) {
  const active = simulation?.emergentEvents?.active;
  if (!active) return null;
  if (!active.endsAt || now - active.endsAt > 10 * MINUTE) return resolveEmergentEvent(simulation, context, active.response || 'no-response', now);
  return advanceEmergentEvent(simulation, context, now);
}

export function eventLabel(id, language = 'pt-BR') {
  const labels = {
    'bird-window': ['Bird at the window', 'Pássaro na janela'], butterfly: ['Butterfly visit', 'Visita de borboleta'],
    'mysterious-box': ['Mysterious box', 'Caixa misteriosa'], 'toy-stuck': ['Toy stuck', 'Brinquedo preso'],
    thunder: ['Sudden thunder', 'Trovão repentino'], 'power-outage': ['Power outage', 'Falta de luz'],
    'plant-fall': ['Plant knocked over', 'Planta derrubada'], 'hidden-item': ['Hidden item', 'Item escondido'],
    'scent-trail': ['Fresh scent trail', 'Trilha de cheiro'], 'mud-puddle': ['Mud puddle', 'Poça de lama'],
    'snow-drift': ['Fresh snow', 'Neve fresca'], 'rare-visitor': ['Rare ambient visitor', 'Visitante raro'],
    'pet-comfort': ['A comforting moment', 'Um momento de acolhimento']
  };
  return labels[id]?.[language === 'en' ? 0 : 1] || id;
}

export function responseLabel(id, language = 'pt-BR') {
  const pt = {
    observe: 'Observar', redirect: 'Redirecionar', follow: 'Seguir', 'stay-calm': 'Ficar calmo',
    'open-together': 'Abrir juntos', 'give-space': 'Dar espaço', help: 'Ajudar', encourage: 'Encorajar',
    comfort: 'Acolher', 'safe-space': 'Levar ao lugar seguro', 'stay-close': 'Ficar por perto', 'use-lamp': 'Acender a luminária',
    'clean-up': 'Arrumar', search: 'Procurar', 'follow-pet': 'Seguir o pet', 'call-back': 'Chamar de volta', explore: 'Explorar',
    play: 'Brincar', 'warm-up': 'Se aquecer', 'approach-slowly': 'Chegar devagar', 'let-them-rest': 'Deixar descansar',
    'reward-kindness': 'Recompensar a gentileza'
  };
  if (language !== 'en') return pt[id] || id;
  return id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

export function applyEventConsequence(slot, livingState, resolved) {
  const consequence = resolved?.consequence;
  if (!slot || !consequence) return;
  slot.stats.bond = clamp(slot.stats.bond + consequence.bond, 0, 100);
  slot.stats.happiness = clamp(slot.stats.happiness + consequence.happiness, 0, 100);
  slot.currency = Math.max(0, slot.currency + consequence.reward);
  if (resolved.id === 'mud-puddle') livingState.simulation.dirt.mud = clamp(livingState.simulation.dirt.mud + consequence.dirt, 0, 100);
  if (resolved.id === 'snow-drift') livingState.simulation.dirt.snow = clamp(livingState.simulation.dirt.snow + consequence.dirt, 0, 100);
}
