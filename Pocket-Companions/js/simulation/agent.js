import { uid } from '../utils.js';
import { activateHabit } from './habits.js';
import { chooseUtilityBehavior, behaviorDefinition } from './utility-ai.js';

export class BehavioralAgent {
  constructor({ simulation, petId, contextProvider }) {
    this.simulation = simulation;
    this.petId = petId;
    this.contextProvider = contextProvider;
  }

  get state() { return this.simulation.agent; }

  decide(now = Date.now()) {
    const state = this.state;
    if (!state || now < (state.minimumUntil || 0) || now < (state.nextDecisionAt || 0)) return null;
    const context = this.contextProvider();
    if (!context) return null;
    context.currentAction = state.currentAction;
    context.minimumUntil = state.minimumUntil;
    const { selected, candidates } = chooseUtilityBehavior(this.simulation, context, now);
    if (!selected || selected.score < 5) return null;

    const currentCandidate = candidates.find((candidate) => candidate.id === state.currentAction);
    const canContinue = currentCandidate && state.currentAction !== 'idle-observe' &&
      currentCandidate.score >= selected.score - 12 && now - state.actionSince < 45000 &&
      state.lastCompletedAt < state.actionSince;
    const resolved = canContinue ? currentCandidate : selected;
    state.currentAction = resolved.id;
    state.actionSince = now;
    state.minimumUntil = now + resolved.min;
    state.nextDecisionAt = now + Math.max(3200, Math.min(8500, resolved.min * 0.55));
    state.lastDecisionAt = now;
    state.currentScore = resolved.score;
    state.targetObjectId = resolved.object?.id || null;
    state.target = resolved.targetFriend ? 'friend' : resolved.object?.id || (resolved.roam ? 'roam' : null);
    state.actionToken = uid();
    state.utilityCandidates = candidates.slice(0, 10).map((candidate) => ({
      id: candidate.id,
      score: Math.round(candidate.score * 10) / 10,
      objectId: candidate.object?.id || null,
      memory: candidate.memoryInfluence?.[0]?.type || null,
      habit: candidate.habitInfluence?.[0]?.id || null,
      routine: candidate.routineInfluence?.[0]?.type || null
    }));
    state.memoryInfluence = (resolved.memoryInfluence || []).slice(0, 6);
    activateHabit(this.simulation, resolved.id, { room: context.room, timeWindow: context.timeWindow, objectId: resolved.object?.id, weather: context.weather });
    return {
      id: resolved.id,
      token: state.actionToken,
      target: resolved.targetFriend ? 'friend' : resolved.object?.id || (resolved.roam ? 'roam' : 'roam'),
      objectId: resolved.object?.id || null,
      point: resolved.object?.approach ? { x: resolved.object.approach[0], z: resolved.object.approach[1] } : null,
      interactionPoint: resolved.object?.interaction ? { x: resolved.object.interaction[0], z: resolved.object.interaction[1] } : null,
      surface: Number.isFinite(Number(resolved.object?.surfaceY))
        ? {
            center: resolved.object?.interaction ? { x: resolved.object.interaction[0], z: resolved.object.interaction[1] } : null,
            y: Number(resolved.object.surfaceY),
            size: Array.isArray(resolved.object.surfaceSize) ? resolved.object.surfaceSize.slice(0, 2).map(Number) : null,
            yaw: Number.isFinite(Number(resolved.object.surfaceYaw)) ? Number(resolved.object.surfaceYaw) : null,
            margin: Number.isFinite(Number(resolved.object.surfaceMargin)) ? Number(resolved.object.surfaceMargin) : 0.06
          }
        : null,
      verticalHeight: resolved.vertical ? Number(resolved.object?.surfaceY) || 0.5 : 0,
      run: Boolean(resolved.run),
      animation: resolved.object?.animationMapping?.[resolved.id] || resolved.animation || 'idle',
      hold: Number(resolved.object?.holdMapping?.[resolved.id]) || resolved.min,
      cooldown: resolved.cooldown,
      interruptPriority: resolved.interrupt || 0,
      score: resolved.score
    };
  }

  complete(action, outcome = 'completed', now = Date.now()) {
    const state = this.state;
    if (!state || (action?.token && state.actionToken !== action.token)) return false;
    const definition = behaviorDefinition(action?.id || state.currentAction);
    state.lastCompletedAt = now;
    state.navigationState = outcome;
    state.cooldowns[definition.id] = now + (action?.cooldown || definition.cooldown || 10000);
    state.recentActions.push(definition.id);
    if (state.recentActions.length > 12) state.recentActions.splice(0, state.recentActions.length - 12);
    state.currentAction = 'idle-observe';
    state.currentScore = 0;
    state.target = null;
    state.targetObjectId = null;
    state.minimumUntil = Math.max(state.minimumUntil, now + 1200);
    return true;
  }

  interrupt(reason, priority = 1, now = Date.now()) {
    const state = this.state;
    const current = behaviorDefinition(state.currentAction);
    if (now < state.minimumUntil && priority <= (current.interrupt || 0)) return false;
    state.interruptedAction = {
      id: state.currentAction,
      target: state.target,
      objectId: state.targetObjectId,
      reason,
      at: now,
      recoverUntil: now + 12000
    };
    state.currentAction = 'idle-observe';
    state.minimumUntil = now + 800;
    state.nextDecisionAt = now + 900;
    state.navigationState = 'interrupted';
    return true;
  }

  markBlocked(action, now = Date.now()) {
    const state = this.state;
    const id = action?.id || state.currentAction;
    state.failures[id] = { count: (state.failures[id]?.count || 0) + 1, lastAt: now, objectId: action?.objectId || null };
    state.cooldowns[id] = now + Math.min(90000, 18000 + state.failures[id].count * 8000);
    return this.complete(action, 'blocked', now);
  }
}
