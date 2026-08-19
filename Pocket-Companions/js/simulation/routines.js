import { clamp } from '../utils.js';
import { timeWindow } from './schema.js';

const DAY = 86400000;
const TRACKED_ROUTINES = new Set(['feed', 'hydrate', 'play', 'walk', 'sleep', 'wake', 'groom', 'training', 'room']);

function dayKey(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function minuteOfDay(timestamp) {
  const date = new Date(timestamp);
  return date.getHours() * 60 + date.getMinutes();
}

function circularMinuteDistance(a, b) {
  const direct = Math.abs(a - b);
  return Math.min(direct, 1440 - direct);
}

export function observeRoutine(simulation, type, detail = {}, timestamp = Date.now(), settings = {}) {
  if (!simulation?.routines || settings.routineLearning === false || !TRACKED_ROUTINES.has(type)) return null;
  const routineType = type === 'hydrate' ? 'water' : type === 'room' ? `room:${detail.room || detail.location || 'living'}` : type;
  const samples = simulation.routines.samples[routineType] ||= [];
  const sample = {
    at: timestamp,
    day: dayKey(timestamp),
    minute: minuteOfDay(timestamp),
    window: timeWindow(timestamp),
    room: detail.room || detail.location || null,
    objectId: detail.objectId || null
  };
  const duplicate = samples.at(-1);
  if (!duplicate || timestamp - duplicate.at > 20 * 60000 || duplicate.day !== sample.day) samples.push(sample);
  if (samples.length > 48) samples.splice(0, samples.length - 48);
  return learnRoutine(simulation, routineType);
}

export function learnRoutine(simulation, type) {
  const samples = simulation?.routines?.samples?.[type] || [];
  const recent = samples.filter((sample) => Date.now() - sample.at < 28 * DAY);
  const distinctDays = new Set(recent.map((sample) => sample.day)).size;
  if (recent.length < 3 || distinctDays < 3) {
    delete simulation.routines.learned[type];
    return null;
  }
  const buckets = new Map();
  recent.forEach((sample) => {
    const bucket = Math.round(sample.minute / 60) % 24;
    const entry = buckets.get(bucket) || [];
    entry.push(sample);
    buckets.set(bucket, entry);
  });
  const strongest = [...buckets.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  const cluster = strongest?.[1] || recent;
  const averageMinute = Math.round(cluster.reduce((sum, sample) => sum + sample.minute, 0) / cluster.length);
  const spread = cluster.reduce((sum, sample) => sum + circularMinuteDistance(sample.minute, averageMinute), 0) / cluster.length;
  const repetition = clamp(distinctDays / 10, 0, 1);
  const consistency = clamp(1 - spread / 240, 0, 1);
  const confidence = clamp((repetition * 0.58 + consistency * 0.42) * 100, 0, 100);
  const learned = {
    type,
    minute: averageMinute,
    window: timeWindow(new Date().setHours(Math.floor(averageMinute / 60), averageMinute % 60, 0, 0)),
    toleranceMinutes: Math.round(clamp(45 + spread, 45, 180)),
    confidence,
    observations: recent.length,
    distinctDays,
    lastObservedAt: recent.at(-1)?.at || 0,
    room: cluster.map((sample) => sample.room).filter(Boolean).sort((a, b) => cluster.filter((sample) => sample.room === b).length - cluster.filter((sample) => sample.room === a).length)[0] || null
  };
  simulation.routines.learned[type] = learned;
  return learned;
}

export function maintainRoutines(simulation, now = Date.now()) {
  if (!simulation?.routines) return;
  Object.entries(simulation.routines.samples).forEach(([type, samples]) => {
    simulation.routines.samples[type] = samples.filter((sample) => now - sample.at < 35 * DAY).slice(-48);
    learnRoutine(simulation, type);
  });
}

export function routineAnticipation(simulation, now = Date.now(), settings = {}) {
  if (!simulation?.routines || settings.routineLearning === false) return [];
  const intensity = clamp(Number(settings.routineAnticipation ?? 0.65), 0, 1);
  if (intensity <= 0) return [];
  const currentMinute = minuteOfDay(now);
  return Object.values(simulation.routines.learned || {})
    .filter((routine) => routine.confidence >= 28)
    .map((routine) => {
      const signed = ((routine.minute - currentMinute + 2160) % 1440) - 720;
      const approaching = signed >= -routine.toleranceMinutes && signed <= Math.max(90, routine.toleranceMinutes);
      const delayed = signed < -routine.toleranceMinutes && signed > -Math.max(240, routine.toleranceMinutes * 2);
      const proximity = approaching ? 1 - Math.min(1, Math.abs(signed) / Math.max(90, routine.toleranceMinutes)) : delayed ? 0.45 : 0;
      const score = routine.confidence * proximity * intensity * (delayed ? 0.7 : 1);
      return { ...routine, minutesUntil: signed, delayed, score };
    })
    .filter((routine) => routine.score > 4)
    .sort((a, b) => b.score - a.score);
}

export function routineBiasForBehavior(anticipations, behavior) {
  const aliases = {
    eat: ['feed'], 'ask-food': ['feed'], drink: ['water'], 'ask-water': ['water'],
    'toy-play': ['play'], 'bring-toy': ['play'], 'social-play': ['play'],
    'wait-door': ['walk'], 'follow-scent': ['walk'], sleep: ['sleep'], 'bed-rest': ['sleep'],
    groom: ['groom'], 'trained-command': ['training']
  };
  const types = aliases[behavior] || [behavior];
  return clamp(anticipations.filter((entry) => types.includes(entry.type)).reduce((sum, entry) => sum + entry.score * 0.34, 0), 0, 28);
}

export function resetRoutines(simulation) {
  if (!simulation?.routines) return;
  simulation.routines.samples = {};
  simulation.routines.learned = {};
  simulation.routines.sessions = 0;
  simulation.routines.lastSessionAt = Date.now();
}

export function routineSummary(simulation, limit = 6) {
  return Object.values(simulation?.routines?.learned || {})
    .slice()
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}
