import { clamp, uid } from '../utils.js';

const HOUR = 3600000;

function hash(text) {
  let value = 2166136261;
  for (const char of String(text)) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

function randomFactory(seed) {
  let state = hash(seed) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function pickWeighted(random, choices) {
  const available = choices.filter((choice) => choice.weight > 0);
  const total = available.reduce((sum, choice) => sum + choice.weight, 0);
  let cursor = random() * total;
  for (const choice of available) {
    cursor -= choice.weight;
    if (cursor <= 0) return choice;
  }
  return available.at(-1);
}

function eventCopy(event, petName, language) {
  const en = {
    slept: `${petName} slept and recovered some energy`,
    favorite: `${petName} settled in a favorite spot`,
    toy: `${petName} played with a toy`,
    bored: `${petName} became a little bored`,
    waited: `${petName} waited near the entrance for a while`,
    friend: `${petName} spent time with the other companion`,
    hidden: `${petName} hid a toy somewhere safe`,
    weather: `${petName} watched the changing weather`,
    dream: `${petName} had a calm dream`,
    habit: `${petName} repeated a familiar habit`,
    preference: `${petName} showed a clearer preference`,
    dirty: `${petName} became slightly dirty while exploring`
  };
  const pt = {
    slept: `${petName} dormiu e recuperou um pouco de energia`,
    favorite: `${petName} descansou em um lugar favorito`,
    toy: `${petName} brincou com um brinquedo`,
    bored: `${petName} ficou um pouco entediado`,
    waited: `${petName} esperou perto da entrada por um tempo`,
    friend: `${petName} passou um tempo com o outro pet`,
    hidden: `${petName} escondeu um brinquedo em um lugar seguro`,
    weather: `${petName} observou as mudanças do clima`,
    dream: `${petName} teve um sonho tranquilo`,
    habit: `${petName} repetiu um hábito conhecido`,
    preference: `${petName} demonstrou uma preferência com mais clareza`,
    dirty: `${petName} ficou levemente sujo enquanto explorava`
  };
  return (language === 'en' ? en : pt)[event.type] || event.type;
}

function summaryFromEvents(events, petName, language) {
  const parts = events.slice(0, 4).map((event) => eventCopy(event, petName, language).replace(`${petName} `, ''));
  if (!parts.length) return language === 'en' ? `${petName} rested safely while you were away.` : `${petName} descansou em segurança enquanto você estava fora.`;
  const last = parts.pop();
  const joined = parts.length ? `${parts.join(', ')} ${language === 'en' ? 'and' : 'e'} ${last}` : last;
  return language === 'en' ? `While you were away, ${petName} ${joined}.` : `Enquanto você estava fora, ${petName} ${joined}.`;
}

export function simulateOfflineLife({ slot, livingState, elapsedMs, from, to, language = 'pt-BR', maxHours = 12 }) {
  const simulation = livingState?.simulation;
  if (!slot || !simulation) return null;
  const boundedMs = Math.min(Math.max(0, Number(elapsedMs) || 0), Math.max(1, maxHours) * HOUR);
  if (boundedMs < 60000) return null;
  const hours = boundedMs / HOUR;
  const random = randomFactory(`${slot.id}:${Math.floor((from || Date.now()) / 60000)}:${Math.round(boundedMs / 60000)}`);
  const steps = Math.max(1, Math.min(7, Math.ceil(hours * 0.85)));
  const events = [];
  const seen = new Set();
  const traits = livingState.personality || {};
  const hasFriend = Boolean(livingState.secondaryPetId);
  const favoriteRoom = livingState.preferences?.favoriteSleepingLocation?.value || livingState.preferences?.favoriteEnvironment?.value;
  for (let index = 0; index < steps; index += 1) {
    const lowEnergy = 100 - slot.stats.energy;
    const lowHappiness = 100 - slot.stats.happiness;
    const choice = pickWeighted(random, [
      { type: 'slept', weight: 1.3 + lowEnergy / 55 + (traits.lazy || 50) / 120 },
      { type: 'favorite', weight: favoriteRoom ? 1.1 + (traits.calm || 50) / 130 : 0 },
      { type: 'toy', weight: 0.8 + (traits.playful || 50) / 80 },
      { type: 'bored', weight: 0.35 + lowHappiness / 90 },
      { type: 'waited', weight: 0.55 + (traits.affectionate || 50) / 120 },
      { type: 'friend', weight: hasFriend ? 0.9 + (traits.sociable || 50) / 100 : 0 },
      { type: 'hidden', weight: 0.32 + (traits.independent || 50) / 180 },
      { type: 'weather', weight: 0.72 },
      { type: 'dream', weight: index > 0 ? 0.46 + (traits.calm || 50) / 200 : 0.2 },
      { type: 'habit', weight: simulation.habits?.some((habit) => habit.strength > 25) ? 0.7 : 0.12 },
      { type: 'preference', weight: 0.3 + (traits.curious || 50) / 210 },
      { type: 'dirty', weight: ['garden', 'park'].includes(slot.activeRoom) ? 0.72 : 0.22 }
    ]);
    if (!choice) continue;
    const duplicatePenalty = seen.has(choice.type) && choice.type !== 'slept' && choice.type !== 'toy';
    if (duplicatePenalty && random() < 0.75) continue;
    seen.add(choice.type);
    events.push({ id: uid(), type: choice.type, at: (from || Date.now() - boundedMs) + boundedMs * ((index + 1) / (steps + 1)), room: slot.activeRoom, weather: livingState.world?.weather || 'clear' });
  }
  if (!events.length) events.push({ id: uid(), type: 'slept', at: to || Date.now(), room: slot.activeRoom, weather: livingState.world?.weather || 'clear' });

  const counts = Object.fromEntries(events.map((event) => [event.type, (events.filter((entry) => entry.type === event.type).length)]));
  const negativeScale = Math.min(1, hours / 6);
  slot.stats.hunger = clamp(slot.stats.hunger - Math.min(28, hours * 2.5), 5, 100);
  slot.stats.energy = clamp(slot.stats.energy + (counts.slept || 0) * 10 - Math.min(12, hours * 0.8), 8, 100);
  slot.stats.happiness = clamp(slot.stats.happiness + (counts.toy || 0) * 2.5 + (counts.friend || 0) * 2 - (counts.bored || 0) * 2.5 - negativeScale * 2, 12, 100);
  slot.stats.hygiene = clamp(slot.stats.hygiene - Math.min(18, hours * 1.05) - (counts.dirty || 0) * 2, 18, 100);
  slot.stats.health = clamp(slot.stats.health - Math.min(5, Math.max(0, 24 - Math.min(slot.stats.hunger, slot.stats.energy)) * 0.08), 35, 100);
  slot.stats.bond = clamp(slot.stats.bond - Math.min(1.5, hours * 0.06) + (counts.waited || 0) * 0.12, 0, 100);
  livingState.hydration = clamp(livingState.hydration - Math.min(24, hours * 2.1), 8, 100);
  if (counts.dirty) {
    simulation.dirt.dust = clamp(simulation.dirt.dust + counts.dirty * 5, 0, 100);
    if (['rain', 'thunderstorm'].includes(livingState.world?.weather)) simulation.dirt.mud = clamp(simulation.dirt.mud + counts.dirty * 5, 0, 100);
  }

  const summary = {
    id: uid(),
    from: from || Date.now() - boundedMs,
    to: to || Date.now(),
    durationMs: boundedMs,
    events,
    text: summaryFromEvents(events, slot.petName, language),
    capped: boundedMs < elapsedMs
  };
  simulation.offline.history.push(summary);
  if (simulation.offline.history.length > 24) simulation.offline.history.splice(0, simulation.offline.history.length - 24);
  simulation.offline.lastSummary = summary;
  simulation.offline.lastSimulatedAt = summary.to;
  return summary;
}

export function formatOfflineEvent(event, petName, language = 'pt-BR') {
  return eventCopy(event, petName, language);
}
