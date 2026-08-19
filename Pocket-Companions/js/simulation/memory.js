import { clamp, uid } from '../utils.js';
import { MAX_EPISODIC_MEMORIES } from './schema.js';

const DAY = 86400000;

function comparable(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value, Object.keys(value).sort());
  return String(value);
}

function fingerprint(memory) {
  return [
    memory.eventType,
    memory.location,
    memory.objectId,
    memory.playerAction,
    memory.petReaction,
    memory.associatedNeed,
    memory.associatedFear,
    comparable(memory.detail)
  ].join('|');
}

export function recordEpisodicMemory(simulation, payload = {}) {
  if (!simulation) return null;
  simulation.episodicMemories ||= [];
  const now = Number(payload.timestamp) || Date.now();
  const candidate = {
    id: payload.id || uid(),
    timestamp: now,
    lastAt: now,
    eventType: payload.eventType || payload.type || 'experience',
    participants: Array.isArray(payload.participants) ? [...new Set(payload.participants)].slice(0, 6) : [],
    location: payload.location || null,
    objectId: payload.objectId || payload.relatedObject || null,
    playerAction: payload.playerAction || null,
    petReaction: payload.petReaction || null,
    emotionalValue: clamp(Number(payload.emotionalValue ?? payload.valence ?? 0), -1, 1),
    importance: clamp(Number(payload.importance ?? payload.salience ?? 0.45), 0, 1),
    valence: clamp(Number(payload.valence ?? payload.emotionalValue ?? 0), -1, 1),
    associatedNeed: payload.associatedNeed || null,
    associatedFear: payload.associatedFear || null,
    associatedReward: payload.associatedReward ?? null,
    recallCount: 0,
    decayLevel: 0,
    longTerm: Boolean(payload.longTerm),
    occurrences: 1,
    lastRecalledAt: 0,
    detail: payload.detail && typeof payload.detail === 'object' ? { ...payload.detail } : {}
  };
  const key = fingerprint(candidate);
  const existing = simulation.episodicMemories.find((memory) =>
    fingerprint(memory) === key && now - (memory.lastAt || memory.timestamp) < 8 * 3600000
  );
  if (existing) {
    const occurrences = Math.max(1, Number(existing.occurrences) || 1) + 1;
    existing.occurrences = occurrences;
    existing.lastAt = now;
    existing.emotionalValue = clamp((existing.emotionalValue * (occurrences - 1) + candidate.emotionalValue) / occurrences, -1, 1);
    existing.valence = clamp((existing.valence * (occurrences - 1) + candidate.valence) / occurrences, -1, 1);
    existing.importance = clamp(Math.max(existing.importance, candidate.importance) + Math.min(0.16, occurrences * 0.012), 0, 1);
    existing.decayLevel = clamp(existing.decayLevel - 0.12, 0, 1);
    existing.longTerm ||= existing.importance >= 0.72 || (occurrences >= 4 && Math.abs(existing.emotionalValue) >= 0.35);
    if (candidate.associatedReward !== null) existing.associatedReward = candidate.associatedReward;
    return existing;
  }
  candidate.longTerm ||= candidate.importance >= 0.78 || Math.abs(candidate.emotionalValue) >= 0.82;
  simulation.episodicMemories.push(candidate);
  pruneMemories(simulation);
  return candidate;
}

export function maintainMemories(simulation, now = Date.now()) {
  if (!simulation?.episodicMemories) return [];
  const survivors = [];
  for (const memory of simulation.episodicMemories) {
    const ageDays = Math.max(0, (now - (memory.lastAt || memory.timestamp || now)) / DAY);
    const protection = memory.importance * 0.48 + Math.abs(memory.emotionalValue) * 0.28 + Math.min(0.18, (memory.occurrences || 1) * 0.025);
    const longTermFactor = memory.longTerm ? 0.2 : 1;
    const decayGain = ageDays * 0.045 * longTermFactor * (1 - clamp(protection, 0, 0.88));
    memory.decayLevel = clamp((memory.decayLevel || 0) + decayGain, 0, 1);
    memory.longTerm ||= memory.importance + Math.abs(memory.emotionalValue) * 0.35 + Math.min(0.25, (memory.occurrences || 1) * 0.04) >= 0.92;
    if (memory.longTerm || memory.decayLevel < 0.9) survivors.push(memory);
  }
  simulation.episodicMemories = survivors;
  pruneMemories(simulation);
  return survivors;
}

export function pruneMemories(simulation) {
  const memories = simulation?.episodicMemories;
  if (!Array.isArray(memories) || memories.length <= MAX_EPISODIC_MEMORIES) return;
  memories.sort((a, b) => {
    const score = (memory) =>
      (memory.longTerm ? 2 : 0) + memory.importance * 1.3 + Math.abs(memory.emotionalValue) * 0.8 +
      Math.min(0.6, (memory.occurrences || 1) * 0.06) - (memory.decayLevel || 0) * 1.1;
    return score(b) - score(a);
  });
  memories.length = MAX_EPISODIC_MEMORIES;
  memories.sort((a, b) => a.timestamp - b.timestamp);
}

function relevance(memory, context) {
  let score = memory.importance * 18 + Math.abs(memory.emotionalValue) * 12 - (memory.decayLevel || 0) * 14;
  if (context.action && (memory.petReaction === context.action || memory.detail?.behavior === context.action)) score += 30;
  if (context.objectId && memory.objectId === context.objectId) score += 22;
  if (context.room && memory.location === context.room) score += 14;
  if (context.weather && (memory.associatedFear === context.weather || memory.detail?.weather === context.weather)) score += 24;
  if (context.need && memory.associatedNeed === context.need) score += 18;
  if (context.playerAction && memory.playerAction === context.playerAction) score += 18;
  score += Math.min(15, (memory.occurrences || 1) * 2.2);
  return score;
}

export function recallMemories(simulation, context = {}, { mutate = false, limit = 5 } = {}) {
  if (!Array.isArray(simulation?.episodicMemories)) return [];
  const matches = simulation.episodicMemories
    .map((memory) => ({ memory, score: relevance(memory, context) }))
    .filter((entry) => entry.score >= 18)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  if (mutate) {
    const now = Date.now();
    matches.forEach(({ memory }) => {
      memory.recallCount = (memory.recallCount || 0) + 1;
      memory.lastRecalledAt = now;
      memory.decayLevel = clamp((memory.decayLevel || 0) - 0.025, 0, 1);
    });
  }
  return matches;
}

export function memoryUtilityBias(simulation, context = {}) {
  const recalled = recallMemories(simulation, context, { mutate: false, limit: 4 });
  const bias = recalled.reduce((sum, { memory, score }) => {
    const direction = memory.valence === 0 ? 0.15 : Math.sign(memory.valence);
    return sum + direction * Math.min(16, score * 0.18) * (1 - (memory.decayLevel || 0));
  }, 0);
  return { bias: clamp(bias, -28, 28), recalled };
}

export function bridgeLongTermMemory(livingState, memory) {
  if (!livingState || !memory?.longTerm) return;
  livingState.longTermMemories ||= [];
  const existing = livingState.longTermMemories.find((entry) => entry.id === memory.id);
  const compact = {
    id: memory.id,
    type: memory.eventType,
    detail: memory.detail,
    createdAt: memory.timestamp,
    lastAt: memory.lastAt,
    valence: memory.valence,
    salience: memory.importance,
    reinforcement: memory.occurrences || 1
  };
  if (existing) Object.assign(existing, compact);
  else livingState.longTermMemories.push(compact);
  if (livingState.longTermMemories.length > 80) livingState.longTermMemories.splice(0, livingState.longTermMemories.length - 80);
}
