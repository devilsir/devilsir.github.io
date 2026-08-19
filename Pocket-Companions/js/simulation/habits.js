import { clamp, uid } from '../utils.js';
import { MAX_HABITS, timeWindow } from './schema.js';

const DAY = 86400000;

const contextKey = (context = {}) => [context.room || '*', context.timeWindow || '*', context.objectId || '*', context.weather || '*'].join('|');

export function reinforceHabit(simulation, observation = {}) {
  if (!simulation) return null;
  simulation.habits ||= [];
  const context = {
    room: observation.context?.room || null,
    timeWindow: observation.context?.timeWindow || timeWindow(observation.at),
    objectId: observation.context?.objectId || null,
    weather: observation.context?.weather || null
  };
  const behavior = observation.behavior || 'idle-observe';
  const trigger = observation.trigger || 'context';
  const key = `${trigger}|${behavior}|${contextKey(context)}`;
  let habit = simulation.habits.find((entry) => entry.key === key);
  const importance = clamp(Number(observation.importance) || 0.45, 0, 1);
  const positive = observation.positive !== false;
  if (!habit) {
    habit = {
      id: uid(), key, trigger, context, behavior,
      expectedResult: observation.expectedResult || null,
      strength: importance >= 0.9 ? 18 : 5,
      confidence: importance >= 0.9 ? 20 : 5,
      lastActivation: Number(observation.at) || Date.now(),
      positiveReinforcement: positive ? 1 : 0,
      negativeReinforcement: positive ? 0 : 1,
      extinctionProgress: 0,
      repetitions: 1,
      createdAt: Date.now()
    };
    simulation.habits.push(habit);
  } else {
    habit.repetitions += 1;
    habit.lastActivation = Number(observation.at) || Date.now();
    habit.expectedResult = observation.expectedResult ?? habit.expectedResult;
    if (positive) {
      habit.positiveReinforcement += 1;
      habit.strength = clamp(habit.strength + 3.5 + importance * 4 + Math.min(3, habit.repetitions * 0.25), 0, 100);
      habit.confidence = clamp(habit.confidence + 2.5 + importance * 3, 0, 100);
      habit.extinctionProgress = clamp(habit.extinctionProgress - 8, 0, 100);
    } else {
      habit.negativeReinforcement += 1;
      habit.strength = clamp(habit.strength - 2.5 - importance * 2, 0, 100);
      habit.confidence = clamp(habit.confidence + 1.5, 0, 100);
      habit.extinctionProgress = clamp(habit.extinctionProgress + 7 + importance * 5, 0, 100);
    }
  }
  if (simulation.habits.length > MAX_HABITS) {
    simulation.habits.sort((a, b) => habitValue(b) - habitValue(a));
    simulation.habits.length = MAX_HABITS;
  }
  return habit;
}

function habitValue(habit) {
  return habit.strength * 0.55 + habit.confidence * 0.35 + Math.min(20, habit.repetitions * 1.5) - habit.extinctionProgress * 0.45;
}

function contextMatch(habitContext = {}, context = {}) {
  let match = 1;
  if (habitContext.room && habitContext.room !== context.room) match *= 0.4;
  if (habitContext.timeWindow && habitContext.timeWindow !== context.timeWindow) match *= 0.55;
  if (habitContext.objectId && habitContext.objectId !== context.objectId) match *= 0.45;
  if (habitContext.weather && habitContext.weather !== context.weather) match *= 0.55;
  return match;
}

export function habitUtilityBias(simulation, behavior, context = {}) {
  if (!Array.isArray(simulation?.habits)) return { bias: 0, habits: [] };
  const resolvedContext = { ...context, timeWindow: context.timeWindow || timeWindow() };
  const habits = simulation.habits
    .filter((habit) => habit.behavior === behavior && habit.repetitions >= 2 && habit.extinctionProgress < 85)
    .map((habit) => ({ habit, match: contextMatch(habit.context, resolvedContext) }))
    .filter((entry) => entry.match > 0.2)
    .sort((a, b) => habitValue(b.habit) * b.match - habitValue(a.habit) * a.match)
    .slice(0, 3);
  const bias = habits.reduce((sum, { habit, match }) => sum + habitValue(habit) * match * 0.22, 0);
  return { bias: clamp(bias, 0, 26), habits };
}

export function activateHabit(simulation, behavior, context = {}) {
  const result = habitUtilityBias(simulation, behavior, context);
  const strongest = result.habits[0]?.habit;
  if (strongest) {
    strongest.lastActivation = Date.now();
    strongest.strength = clamp(strongest.strength + 0.25, 0, 100);
  }
  return strongest || null;
}

export function maintainHabits(simulation, now = Date.now()) {
  if (!Array.isArray(simulation?.habits)) return [];
  simulation.habits = simulation.habits.filter((habit) => {
    const inactiveDays = Math.max(0, (now - (habit.lastActivation || habit.createdAt || now)) / DAY);
    if (inactiveDays > 1) {
      const decay = Math.min(8, inactiveDays * 0.55);
      habit.strength = clamp(habit.strength - decay, 0, 100);
      habit.confidence = clamp(habit.confidence - decay * 0.35, 0, 100);
      habit.extinctionProgress = clamp(habit.extinctionProgress + inactiveDays * 0.3, 0, 100);
    }
    return habit.strength >= 3 || habit.repetitions >= 4 || habit.confidence >= 25;
  });
  return simulation.habits;
}

export function strongestHabits(simulation, limit = 6) {
  return (simulation?.habits || [])
    .filter((habit) => habit.repetitions >= 3 && habit.strength >= 18 && habit.extinctionProgress < 80)
    .slice()
    .sort((a, b) => habitValue(b) - habitValue(a))
    .slice(0, limit);
}
