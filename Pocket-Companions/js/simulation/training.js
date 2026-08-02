import { clamp } from '../utils.js';

export function migrateTrainingRecord(record = {}, commandId = '') {
  const practiceHistory = Array.isArray(record.practiceHistory) ? record.practiceHistory.slice(-24) : [];
  return {
    mastery: clamp(Number(record.mastery) || 0, 0, 100),
    attempts: Math.max(0, Math.floor(Number(record.attempts) || 0)),
    successes: Math.max(0, Math.floor(Number(record.successes) || 0)),
    lastAt: Number(record.lastAt) || 0,
    cue: record.cue || commandId,
    requiredContext: record.requiredContext || null,
    confidence: clamp(Number(record.confidence ?? record.mastery * 0.72) || 0, 0, 100),
    responseDelay: clamp(Number(record.responseDelay) || 1500, 180, 5000),
    distractionResistance: clamp(Number(record.distractionResistance) || 5, 0, 100),
    rewardAssociation: clamp(Number(record.rewardAssociation) || 10, 0, 100),
    practiceHistory,
    generalization: clamp(Number(record.generalization) || 0, 0, 100)
  };
}

export function evaluateTrainingAttempt({ command, context, traits, relationship, rewardQuality = 0.65, skillBonus = 0 }) {
  const energy = clamp(context.energy, 0, 100);
  const happiness = clamp(context.happiness, 0, 100);
  const moodReadiness = (energy * 0.48 + happiness * 0.28 + (traits.calm || 50) * 0.24) / 100;
  const trust = clamp((relationship?.trust ?? context.bond ?? 20), 0, 100) / 100;
  const distraction = clamp(Number(context.distraction) || 0, 0, 100);
  const distractionProtection = command.distractionResistance / 100;
  const distractionPenalty = (distraction / 100) * (1 - distractionProtection) * 0.28;
  const repetitionPenalty = command.practiceHistory.filter((entry) => Date.now() - entry.at < 12 * 60000).length * 0.025;
  const personality = (100 - (traits.stubborn || 50)) / 100 * 0.1 + (traits.foodMotivated || 50) / 100 * rewardQuality * 0.12;
  const learningBase = 0.2 + moodReadiness * 0.22 + trust * 0.18 + personality + skillBonus;
  const confidenceSupport = command.confidence / 100 * 0.16;
  const chance = clamp(learningBase + confidenceSupport - distractionPenalty - repetitionPenalty, 0.18, 0.94);
  return {
    chance,
    responseDelay: Math.round(clamp(command.responseDelay * (1.12 - command.confidence / 180) + distraction * 8, 220, 4200)),
    distraction,
    rewardQuality
  };
}

export function applyTrainingResult(command, { success, context, rewardQuality = 0.65, responseDelay = 1200 }) {
  const now = Date.now();
  command.attempts += 1;
  command.lastAt = now;
  if (success) {
    command.successes += 1;
    command.mastery = clamp(command.mastery + 6.5 + rewardQuality * 4, 0, 100);
    command.confidence = clamp(command.confidence + 5 + rewardQuality * 3, 0, 100);
    command.distractionResistance = clamp(command.distractionResistance + (context.distraction || 0) * 0.035 + 1.2, 0, 100);
    command.rewardAssociation = clamp(command.rewardAssociation + rewardQuality * 5, 0, 100);
    command.generalization = clamp(command.generalization + (context.newContext ? 3.5 : 0.6), 0, 100);
    command.responseDelay = clamp(command.responseDelay * 0.92 + responseDelay * 0.08, 180, 5000);
  } else {
    command.mastery = clamp(command.mastery + 1.4, 0, 100);
    command.confidence = clamp(command.confidence - 1.2, 0, 100);
    command.responseDelay = clamp(command.responseDelay + 65, 180, 5000);
  }
  command.practiceHistory.push({ at: now, success, room: context.room, distraction: context.distraction || 0, rewardQuality });
  if (command.practiceHistory.length > 24) command.practiceHistory.splice(0, command.practiceHistory.length - 24);
  return command;
}
