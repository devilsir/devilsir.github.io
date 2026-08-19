import * as THREE from '../../vendor/three.module.js';
import { PETS } from '../config.js';
import { clamp, lerp, randomBetween } from '../utils.js';

export const navigationMethods = {
  autonomousPoseLocation(action) {
    return action?.objectId || action?.target || action?.id || 'autonomous';
  },

  isQuietCornerAction(action) {
    return this.autonomousPoseLocation(action) === 'quiet-corner';
  },

  clearAutonomousPose(pet) {
    if (!pet) return;
    pet.autonomousPose = null;
    pet.autonomousPoseToken = null;
  },

  playAutonomousPose(pet, action, animation, { fade = 0.22, secondary = false } = {}) {
    if (!pet?.controller) return;
    const controller = pet.controller;
    const location = this.autonomousPoseLocation(action);
    const interactionStillActive = () => secondary
      ? this.secondaryAction === action && this.secondaryPetId && this.pets.get(this.secondaryPetId) === pet
      : this.activeAutonomousAction === action && this.currentPet === pet;

    if (action?.id === 'trained-command') {
      this.clearAutonomousPose(pet);
      const clip = controller.has(animation) ? animation : controller.has('sit') ? 'sit' : 'idle';
      if (clip === 'idle') {
        controller.play('idle', { force: true, fade, loop: true });
        return;
      }
      const token = `${action?.token || 'training'}:${performance.now()}`;
      pet.autonomousPoseToken = token;
      void controller.playOnce(clip, { fade, timeScale: clip === 'walk' || clip === 'run' ? 1.18 : 1 }).then((completed) => {
        if (!completed || pet.autonomousPoseToken !== token || !interactionStillActive()) return;
        controller.play('idle', { force: true, fade: 0.16, loop: true });
      });
      return;
    }

    if (animation !== 'sit' || !controller.has('sit')) {
      this.clearAutonomousPose(pet);
      if (animation === 'jump' && controller.has('jump')) {
        const token = `${action?.token || 'jump'}:${performance.now()}`;
        pet.autonomousPoseToken = token;
        void controller.playOnce('jump', { fade, timeScale: 1 }).then((completed) => {
          if (!completed || pet.autonomousPoseToken !== token || !interactionStillActive()) return;
          controller.play('idle', { force: true, fade: 0.16, loop: true });
        });
      } else {
        const requested = controller.has(animation) ? animation : 'idle';
        const chosen = ['walk', 'run'].includes(requested) ? 'idle' : requested;
        const shouldLoop = ['idle', 'sitting_idle'].includes(chosen);
        if (shouldLoop) {
          controller.play(chosen, {
            force: true,
            fade,
            loop: true
          });
        } else {
          const token = `${action?.token || chosen}:${performance.now()}`;
          pet.autonomousPoseToken = token;
          void controller.playOnce(chosen, { fade, timeScale: chosen === 'run' ? 1.08 : 1 }).then((completed) => {
            if (!completed || pet.autonomousPoseToken !== token || !interactionStillActive()) return;
            controller.play('idle', { force: true, fade: 0.16, loop: true });
          });
        }
      }
      return;
    }

    const holdName = controller.has('sitting_idle') ? 'sitting_idle' : null;
    const alreadySittingHere = pet.autonomousPose?.kind === 'sitting' && pet.autonomousPose.location === location;
    if (alreadySittingHere) {
      if (holdName && controller.currentName !== holdName) controller.play(holdName, { force: true, fade: 0.12, loop: true });
      return;
    }

    const token = `${action?.token || action?.id || 'sit'}:${performance.now()}`;
    pet.autonomousPoseToken = token;
    pet.autonomousPose = { kind: 'transitioning-to-sit', location };
    void controller.playOnce('sit', { fade, timeScale: 1 }).then((completed) => {
      if (!completed || pet.autonomousPoseToken !== token || !interactionStillActive()) return;
      pet.autonomousPose = { kind: 'sitting', location };
      if (holdName) controller.play(holdName, { force: true, fade: 0.12, loop: true });
    });
  },

  isBlocked(x, z, radius = 0.34) {
    return this.obstacles.some((obstacle) =>
      x + radius > obstacle.minX && x - radius < obstacle.maxX &&
      z + radius > obstacle.minZ && z - radius < obstacle.maxZ
    );
  },

  petClearance(pet = this.currentPet, { interaction = false } = {}) {
    const radius = Math.max(0.2, Number(pet?.navigationRadius) || 0.34);
    if (!interaction) return radius;
    const sizeClass = pet?.physicalSize;
    const extra = sizeClass === 'large' ? 0.10 : sizeClass === 'medium' ? 0.055 : 0.025;
    return radius + extra;
  },

  findSafePetPosition(preferred = new THREE.Vector3(0, 0, 0), pet = this.currentPet, { interaction = false, avoidEntities = true } = {}) {
    const clearance = this.petClearance(pet, { interaction });
    return avoidEntities
      ? this.findSafeEntityPosition(preferred, clearance, pet)
      : this.findSafePosition(preferred, clearance);
  },

  hasClearPath(from, to, radius = 0.34) {
    const distance = from.distanceTo(to);
    const steps = Math.max(1, Math.ceil(distance / 0.09));
    for (let index = 1; index <= steps; index += 1) {
      const t = index / steps;
      const x = lerp(from.x, to.x, t);
      const z = lerp(from.z, to.z, t);
      if (this.isBlocked(x, z, radius)) return false;
    }
    return true;
  },

  getWalkBounds(margin = 0.42) {
    const floor = this.environment?.getObjectByName?.('walk-floor');
    if (!floor) return { minX: -4.4, maxX: 4.4, minZ: -2.75, maxZ: 2.75 };
    const box = new THREE.Box3().setFromObject(floor);
    return {
      minX: box.min.x + margin,
      maxX: box.max.x - margin,
      minZ: box.min.z + margin,
      maxZ: box.max.z - margin
    };
  },

  findPath(start, destination, radius = 0.34) {
    const cell = 0.28;
    const { minX, maxX, minZ, maxZ } = this.getWalkBounds(Math.max(0.42, radius + 0.12));
    const safeStart = start.clone();
    const safeEnd = destination.clone();
    safeStart.set(clamp(safeStart.x, minX, maxX), 0, clamp(safeStart.z, minZ, maxZ));
    safeEnd.set(clamp(safeEnd.x, minX, maxX), 0, clamp(safeEnd.z, minZ, maxZ));
    if (!this.isBlocked(safeEnd.x, safeEnd.z, radius) && this.hasClearPath(safeStart, safeEnd, radius)) return [safeEnd];

    const cols = Math.floor((maxX - minX) / cell) + 1;
    const rows = Math.floor((maxZ - minZ) / cell) + 1;
    const toCell = (point) => ({
      x: clamp(Math.round((point.x - minX) / cell), 0, cols - 1),
      z: clamp(Math.round((point.z - minZ) / cell), 0, rows - 1)
    });
    const toWorld = (node) => new THREE.Vector3(minX + node.x * cell, 0, minZ + node.z * cell);
    const keyOf = (node) => `${node.x}:${node.z}`;
    const walkable = (node) => {
      if (node.x < 0 || node.x >= cols || node.z < 0 || node.z >= rows) return false;
      const point = toWorld(node);
      return !this.isBlocked(point.x, point.z, radius);
    };
    const nearestWalkable = (origin) => {
      if (walkable(origin)) return origin;
      for (let ring = 1; ring < 8; ring += 1) {
        for (let dx = -ring; dx <= ring; dx += 1) {
          for (let dz = -ring; dz <= ring; dz += 1) {
            if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
            const candidate = { x: origin.x + dx, z: origin.z + dz };
            if (walkable(candidate)) return candidate;
          }
        }
      }
      return null;
    };

    const startNode = nearestWalkable(toCell(safeStart));
    const endNode = nearestWalkable(toCell(safeEnd));
    if (!startNode || !endNode) return [];

    const open = [startNode];
    const openKeys = new Set([keyOf(startNode)]);
    const cameFrom = new Map();
    const gScore = new Map([[keyOf(startNode), 0]]);
    const fScore = new Map([[keyOf(startNode), Math.hypot(endNode.x - startNode.x, endNode.z - startNode.z)]]);
    const directions = [
      [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]
    ];

    while (open.length) {
      open.sort((a, b) => (fScore.get(keyOf(a)) ?? Infinity) - (fScore.get(keyOf(b)) ?? Infinity));
      const current = open.shift();
      const currentKey = keyOf(current);
      openKeys.delete(currentKey);
      if (current.x === endNode.x && current.z === endNode.z) {
        const cells = [current];
        let cursor = currentKey;
        while (cameFrom.has(cursor)) {
          const previous = cameFrom.get(cursor);
          cells.push(previous);
          cursor = keyOf(previous);
        }
        cells.reverse();
        const raw = cells.slice(1).map(toWorld);
        const resolvedEnd = !this.isBlocked(safeEnd.x, safeEnd.z, radius) && this.hasClearPath(toWorld(endNode), safeEnd, radius)
          ? safeEnd
          : toWorld(endNode);
        if (!raw.length || raw[raw.length - 1].distanceTo(resolvedEnd) > 0.02) raw.push(resolvedEnd);
        const smoothed = [];
        let anchor = safeStart;
        for (let index = 0; index < raw.length;) {
          let furthest = index;
          for (let probe = index; probe < raw.length; probe += 1) {
            if (!this.hasClearPath(anchor, raw[probe], radius)) break;
            furthest = probe;
          }
          const waypoint = raw[furthest];
          smoothed.push(waypoint);
          anchor = waypoint;
          index = furthest + 1;
        }
        return smoothed;
      }

      for (const [dx, dz, cost] of directions) {
        const neighbor = { x: current.x + dx, z: current.z + dz };
        if (!walkable(neighbor)) continue;
        if (dx !== 0 && dz !== 0) {
          if (!walkable({ x: current.x + dx, z: current.z }) || !walkable({ x: current.x, z: current.z + dz })) continue;
        }
        const neighborKey = keyOf(neighbor);
        const tentative = (gScore.get(currentKey) ?? Infinity) + cost;
        if (tentative >= (gScore.get(neighborKey) ?? Infinity)) continue;
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentative);
        fScore.set(neighborKey, tentative + Math.hypot(endNode.x - neighbor.x, endNode.z - neighbor.z));
        if (!openKeys.has(neighborKey)) {
          open.push(neighbor);
          openKeys.add(neighborKey);
        }
      }
    }
    return [];
  },

  findSafePosition(preferred = new THREE.Vector3(0, 0, 0), clearance = 0.3) {
    const safeClearance = Math.max(0.18, Number(clearance) || 0.3);
    const bounds = this.getWalkBounds(Math.max(0.38, safeClearance + 0.08));
    const base = preferred.clone();
    base.x = clamp(base.x, bounds.minX, bounds.maxX);
    base.z = clamp(base.z, bounds.minZ, bounds.maxZ);
    base.y = 0;
    if (!this.isBlocked(base.x, base.z, safeClearance)) return base;
    const radii = [0.35, 0.65, 0.95, 1.3, 1.7, 2.2, 2.8, 3.4, 4.2, 5.0];
    for (const searchRadius of radii) {
      const steps = Math.max(12, Math.ceil(searchRadius * 14));
      for (let index = 0; index < steps; index += 1) {
        const angle = (index / steps) * Math.PI * 2;
        const x = clamp(base.x + Math.cos(angle) * searchRadius, bounds.minX, bounds.maxX);
        const z = clamp(base.z + Math.sin(angle) * searchRadius, bounds.minZ, bounds.maxZ);
        if (!this.isBlocked(x, z, safeClearance)) return new THREE.Vector3(x, 0, z);
      }
    }
    return new THREE.Vector3(clamp(0, bounds.minX, bounds.maxX), 0, clamp(1.35, bounds.minZ, bounds.maxZ));
  },

  livingEntityCollisionAt(x, z, radius = 0.3, ignore = null, margin = 0.08) {
    const entities = [];
    if (this.currentPet) entities.push(this.currentPet);
    if (this.secondaryPetId) entities.push(this.pets?.get?.(this.secondaryPetId));
    for (const robot of this.robotCompanions || []) entities.push(robot);
    for (const ambient of this.ambientPopulation || []) entities.push(ambient);
    for (const entity of entities) {
      if (!entity || entity === ignore || entity.stage?.visible === false) continue;
      const position = entity.stage?.position;
      if (!position) continue;
      const entityRadius = Math.max(0.18, Number(entity.navigationRadius || entity.radius) || 0.3);
      if (Math.hypot(x - position.x, z - position.z) < Math.max(0.18, radius) + entityRadius + margin) return true;
    }
    return false;
  },

  findSafeEntityPosition(preferred = new THREE.Vector3(0, 0, 0), clearance = 0.3, ignore = null) {
    const safeClearance = Math.max(0.18, Number(clearance) || 0.3);
    const base = this.findSafePosition(preferred, safeClearance);
    if (!this.livingEntityCollisionAt(base.x, base.z, safeClearance, ignore)) return base;
    const bounds = this.getWalkBounds(Math.max(0.38, safeClearance + 0.08));
    const radii = [0.4, 0.7, 1.0, 1.35, 1.75, 2.25, 2.9, 3.6, 4.4];
    for (const searchRadius of radii) {
      const steps = Math.max(12, Math.ceil(searchRadius * 14));
      for (let index = 0; index < steps; index += 1) {
        const angle = (index / steps) * Math.PI * 2;
        const x = clamp(base.x + Math.cos(angle) * searchRadius, bounds.minX, bounds.maxX);
        const z = clamp(base.z + Math.sin(angle) * searchRadius, bounds.minZ, bounds.maxZ);
        if (this.isBlocked(x, z, safeClearance)) continue;
        if (this.livingEntityCollisionAt(x, z, safeClearance, ignore)) continue;
        return new THREE.Vector3(x, 0, z);
      }
    }
    return base;
  },

  ensurePetOutsideObstacles(pet = this.currentPet, preferred = null) {
    if (!pet?.stage || this.mode === 'sleep' || this.trainingTraversalState) return false;
    const isIntentionalSurface = pet === this.currentPet
      ? Boolean(this.activeAutonomousAction?.surface && !this.target)
      : Boolean(this.secondaryAction?.surface && !this.secondaryTarget);
    if (isIntentionalSurface) return false;
    const radius = Math.max(0.2, Number(pet.navigationRadius) || 0.34);
    const position = pet.stage.position;
    const blocked = this.isBlocked(position.x, position.z, radius);
    const overlapping = this.livingEntityCollisionAt(position.x, position.z, radius, pet, 0.04);
    if (!blocked && !overlapping) return false;
    const fallback = preferred?.isVector3 ? preferred : position.clone();
    const safe = this.findSafeEntityPosition(fallback, radius, pet);
    pet.stage.position.set(safe.x, 0, safe.z);
    pet.modelHolder.rotation.x = 0;
    pet.modelHolder.rotation.z = 0;
    return true;
  },

  placePetSafely(preferred = null) {
    const pet = this.currentPet;
    if (!pet) return;
    this.clearMovementPath();
    this.movementOutcome = 'idle';
    this.eatingState = null;
    pet.model.position.copy(pet.baseModelPosition);
    pet.model.rotation.copy(pet.baseModelRotation);
    pet.modelHolder.rotation.set(0, 0, 0);
    const spawnPreference = preferred || this.getRoomSpawn(this.roomId);
    pet.stage.position.copy(this.findSafeEntityPosition(spawnPreference, pet.navigationRadius || 0.34, pet));
    pet.stage.position.y = 0;
    this.clearAutonomousPose(pet);
    pet.controller.play('idle', { fade: 0.2, force: true });
  },

  clearMovementPath() {
    this.target = null;
    this.pathWaypoints = [];
    this.finalTarget = null;
    this.pathRun = false;
    this.repathAttempts = 0;
  },

  stopMovement(outcome = 'stopped') {
    const pet = this.currentPet;
    const action = this.activeAutonomousAction;
    this.clearMovementPath();
    this.movementOutcome = outcome;
    if (outcome === 'arrived' && action) {
      this.beginAutonomousInteraction(action);
      this.onMovement?.('stop');
      return;
    }
    if (pet) {
      pet.stage.position.y = 0;
      this.clearAutonomousPose(pet);
      pet.controller.play('idle', { fade: 0.2 });
    }
    this.onMovement?.(outcome === 'blocked' ? 'blocked' : 'stop');
    if (outcome === 'blocked') {
      this.activeAutonomousAction = null;
      this.autonomyHoldUntil = 0;
      this.dispatchEvent(new CustomEvent('path-blocked', { detail: { action, outcome } }));
    }
  },

  moveToAndWait(x, z, { run = false, timeout = 1800 } = {}) {
    const destination = this.findSafePetPosition(new THREE.Vector3(x, 0, z), this.currentPet);
    this.moveTo(destination.x, destination.z, run);
    const started = performance.now();
    return new Promise((resolve) => {
      const check = () => {
        if (!this.currentPet) {
          resolve(false);
          return;
        }
        if (!this.target) {
          resolve(this.movementOutcome === 'arrived');
          return;
        }
        if (performance.now() - started >= timeout) {
          this.stopMovement('timeout');
          resolve(false);
          return;
        }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });
  },

  moveTo(x, z, run = false) {
    const pet = this.currentPet;
    if (!pet || this.petControlsLocked || this.mode === 'selection' || this.mode === 'sleep' || this.cleanMode) return false;
    const radius = pet.navigationRadius || 0.34;
    const bounds = this.getWalkBounds(Math.max(0.42, radius + 0.12));
    const destination = this.findSafeEntityPosition(
      new THREE.Vector3(clamp(x, bounds.minX, bounds.maxX), 0, clamp(z, bounds.minZ, bounds.maxZ)),
      radius,
      pet
    );
    if (pet.stage.position.distanceTo(destination) > 0.12) this.clearAutonomousPose(pet);
    const route = this.findPath(pet.stage.position.clone(), destination, radius);
    if (!route.length) {
      this.stopMovement('blocked');
      return false;
    }
    this.finalTarget = destination.clone();
    this.pathRun = Boolean(run);
    this.pathWaypoints = route.slice(1);
    this.target = route[0].clone();
    this.target.run = run;
    this.repathAttempts = 0;
    this.movementOutcome = 'moving';
    return true;
  },

  moveToPlayerCommand(x, z, run = false) {
    const pet = this.currentPet;
    if (!pet || this.petControlsLocked || this.mode === 'selection' || this.mode === 'sleep' || this.cleanMode) return false;
    if (this.activeAutonomousAction) this.interruptAutonomous('player-move');
    this.ensurePetOutsideObstacles(pet, pet.stage.position.clone());
    return this.moveTo(x, z, run);
  },

  setAutonomous(enabled) {
    this.autonomousEnabled = enabled;
    if (!enabled) {
      this.autonomousTarget = null;
      this.interruptAutonomous('disabled');
      if (this.secondaryAction) this.completeSecondaryInteraction('disabled');
    }
  },

  startAutonomousAction(action) {
    if (!action || !this.currentPet || this.petControlsLocked || this.mode !== 'home' || this.activityState || this.cleanMode) return false;
    if (this.activeAutonomousAction) this.interruptAutonomous('replaced');
    this.clearMovementPath();
    this.movementOutcome = 'idle';
    this.activeAutonomousAction = action;
    this.lastAutonomous = performance.now();
    const point = this.findSafePetPosition(this.autonomousPoint(action), this.currentPet, { interaction: true });
    const distance = this.currentPet.stage.position.distanceTo(point);
    let moved = false;
    if (distance > 0.12) moved = this.moveTo(point.x, point.z, Boolean(action.run));
    if (!moved) {
      if (this.movementOutcome === 'blocked') return false;
      this.beginAutonomousInteraction(action);
    }
    this.dispatchEvent(new CustomEvent('autonomous', { detail: action }));
    return true;
  },

  setAutonomyProvider(provider) { this.autonomyProvider = typeof provider === 'function' ? provider : null; },

  setSecondaryAutonomyProvider(provider) { this.secondaryAutonomyProvider = typeof provider === 'function' ? provider : null; },

  autonomousPoint(actionOrTarget) {
    const action = typeof actionOrTarget === 'object' ? actionOrTarget : { target: actionOrTarget };
    if (action.point && Number.isFinite(action.point.x) && Number.isFinite(action.point.z)) return new THREE.Vector3(action.point.x, 0, action.point.z);
    const target = action.target;
    const points = {
      bed: this.sleepAnchor.clone(), food: this.feedApproach.clone(), water: this.feedApproach.clone().add(new THREE.Vector3(0.75,0,0)),
      player: new THREE.Vector3(0,0,1.75), window: new THREE.Vector3(-3.2,0,-0.45), safe: new THREE.Vector3(-2.45,0,1.45),
      toy: new THREE.Vector3(2.1,0,0.85), favorite: new THREE.Vector3(-1.5,0,0.65), friend: this.secondaryPetId ? this.pets.get(this.secondaryPetId)?.stage.position.clone() : null
    };
    if (target === 'roam' || !points[target]) return new THREE.Vector3(randomBetween(-3.2,3.2),0,randomBetween(-2.0,2.0));
    return points[target];
  },

  updateAutonomous(time) {
    if (this.activeAutonomousAction && !this.target) {
      if (this.autonomyHoldUntil && time >= this.autonomyHoldUntil) this.completeAutonomousInteraction('completed');
      return;
    }
    if (!this.autonomousEnabled || this.mode !== 'home' || this.target || !this.currentPet || this.activityState) return;
    const settings = this.settingsProvider();
    const interval = settings.reducedMotion ? 19000 : 11000;
    if (time - this.lastAutonomous < interval) return;
    this.lastAutonomous = time;
    const action = this.autonomyProvider?.() || { id: 'explore', target: 'roam', run: Math.random() > 0.72 };
    if (!action) return;
    this.activeAutonomousAction = action;
    const point = this.findSafePetPosition(this.autonomousPoint(action), this.currentPet, { interaction: true });
    const moved = this.moveTo(point.x, point.z, Boolean(action.run));
    if (!moved && this.movementOutcome !== 'blocked') this.beginAutonomousInteraction(action);
    this.dispatchEvent(new CustomEvent('autonomous', { detail: action }));
  },

  surfacePoseFor(pet, action) {
    const surface = action?.surface;
    if (!pet || !surface || !Number.isFinite(Number(surface.y))) return null;
    const centerSource = surface.center || action.interactionPoint;
    if (!centerSource || !Number.isFinite(centerSource.x) || !Number.isFinite(centerSource.z)) return null;
    const margin = Math.max(0.02, Number(surface.margin) || 0.06);
    const width = Math.max(0.1, Number(surface.size?.[0]) || 99);
    const depth = Math.max(0.1, Number(surface.size?.[1]) || 99);
    const radius = Math.max(0.18, Number(pet.navigationRadius) || 0.34);
    const rawX = Math.max(radius * 1.55, Math.min(Number(pet.size?.x) || radius * 2, radius * 4.2));
    const rawZ = Math.max(radius * 1.55, Math.min(Number(pet.size?.z) || radius * 2, radius * 4.2));
    const preferred = Number.isFinite(Number(surface.yaw)) ? Number(surface.yaw) : pet.modelHolder.rotation.y;
    const bedAligned = ['sleep', 'bed-rest', 'sleep-near-pet'].includes(action?.id) || String(action?.objectId || '').includes(':bed');
    const candidates = bedAligned
      ? [preferred, preferred + Math.PI]
      : [preferred, preferred + Math.PI, preferred + Math.PI / 2, preferred - Math.PI / 2, 0, Math.PI / 2];
    const unique = [];
    candidates.forEach((yaw) => {
      const normalized = Math.atan2(Math.sin(yaw), Math.cos(yaw));
      if (!unique.some((value) => Math.abs(Math.atan2(Math.sin(value - normalized), Math.cos(value - normalized))) < 0.02)) unique.push(normalized);
    });
    let best = null;
    unique.forEach((yaw) => {
      const cosine = Math.abs(Math.cos(yaw));
      const sine = Math.abs(Math.sin(yaw));
      const extentX = rawX * cosine + rawZ * sine;
      const extentZ = rawX * sine + rawZ * cosine;
      const availableX = Math.max(0.08, width - margin * 2);
      const availableZ = Math.max(0.08, depth - margin * 2);
      const score = Math.min(availableX / Math.max(0.001, extentX), availableZ / Math.max(0.001, extentZ));
      if (!best || score > best.score) best = { yaw, score };
    });
    if (!best || best.score < 0.93) return null;
    return { x: Number(centerSource.x), y: Math.max(0, Number(surface.y)), z: Number(centerSource.z), yaw: best.yaw };
  },

  alignPetToSurface(pet, surfaceY) {
    if (!pet?.model || !Number.isFinite(surfaceY)) return;
    pet.stage.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(pet.model);
    if (bounds.isEmpty()) return;
    const correction = surfaceY + 0.012 - bounds.min.y;
    if (Number.isFinite(correction)) pet.stage.position.y += correction;
    pet.stage.updateMatrixWorld(true);
  },

  placePetOnActionSurface(pet, action) {
    const pose = this.surfacePoseFor(pet, action);
    if (!pose) return false;
    pet.model.position.copy(pet.baseModelPosition);
    pet.model.rotation.copy(pet.baseModelRotation);
    pet.modelHolder.rotation.set(0, pose.yaw, 0);
    pet.stage.position.set(pose.x, pose.y, pose.z);
    this.alignPetToSurface(pet, pose.y);
    action.resolvedSurfacePose = { ...pose };
    return true;
  },

  faceInteractionPoint(pet, point) {
    if (!pet || !point || !Number.isFinite(point.x) || !Number.isFinite(point.z)) return;
    const dx = point.x - pet.stage.position.x;
    const dz = point.z - pet.stage.position.z;
    if (Math.hypot(dx, dz) > 0.001) pet.modelHolder.rotation.y = Math.atan2(dx, dz);
  },

  interpolateTrainingPath(points, progress) {
    if (!Array.isArray(points) || points.length < 2) return null;
    const clamped = clamp(progress, 0, 1);
    const segmentProgress = clamped * (points.length - 1);
    const index = Math.min(points.length - 2, Math.floor(segmentProgress));
    const local = segmentProgress - index;
    const from = points[index];
    const to = points[index + 1];
    return {
      x: lerp(Number(from.x) || 0, Number(to.x) || 0, local),
      y: lerp(Number(from.y) || 0, Number(to.y) || 0, local),
      z: lerp(Number(from.z) || 0, Number(to.z) || 0, local),
      from,
      to
    };
  },

  runTrainingTraversal(pet, action) {
    const traversal = action?.trainingTraversal;
    const points = Array.isArray(traversal?.points) ? traversal.points : [];
    if (!pet || points.length < 2) return false;

    this.clearMovementPath();
    this.clearAutonomousPose(pet);
    const token = `${action.token || 'training'}:${performance.now()}`;
    this.trainingTraversalState = { token, action, pet };
    this.autonomyHoldUntil = Number.POSITIVE_INFINITY;

    const first = points[0];
    pet.stage.position.set(Number(first.x) || 0, Math.max(0, Number(first.y) || 0), Number(first.z) || 0);
    const animation = traversal.animation && pet.controller.has(traversal.animation)
      ? traversal.animation
      : pet.controller.has('jump') ? 'jump' : pet.controller.has('run') ? 'run' : 'walk';
    const isJump = traversal.kind === 'jump' || traversal.kind === 'platform';
    pet.controller.play(animation, {
      fade: 0.12,
      force: true,
      loop: !isJump,
      timeScale: isJump ? 1.06 : traversal.kind === 'weave' ? 1.12 : 1.18
    });
    if (isJump) this.soundPlayer?.('jump', { volume: 0.34, caption: false });

    const duration = clamp(Number(traversal.duration) || (isJump ? 950 : 1600), 650, 4200);
    const jumpHeight = Math.max(0, Number(traversal.jumpHeight) || 0);
    const startedAt = performance.now();
    const step = (now) => {
      const state = this.trainingTraversalState;
      if (!state || state.token !== token || this.activeAutonomousAction !== action || this.currentPet !== pet) return;
      const progress = clamp((now - startedAt) / duration, 0, 1);
      const sample = this.interpolateTrainingPath(points, progress);
      if (!sample) return;
      const baseY = Math.max(0, sample.y);
      const arc = isJump ? Math.sin(Math.PI * progress) * jumpHeight : 0;
      pet.stage.position.set(sample.x, baseY + arc, sample.z);
      const dx = (Number(sample.to.x) || 0) - (Number(sample.from.x) || 0);
      const dz = (Number(sample.to.z) || 0) - (Number(sample.from.z) || 0);
      if (Math.hypot(dx, dz) > 0.001) pet.modelHolder.rotation.y = this.smoothAngle(pet.modelHolder.rotation.y, Math.atan2(dx, dz), 0.28);

      if (progress < 1) {
        requestAnimationFrame(step);
        return;
      }

      const last = points[points.length - 1];
      pet.stage.position.set(Number(last.x) || 0, Math.max(0, Number(last.y) || 0), Number(last.z) || 0);
      this.trainingTraversalState = null;
      if (isJump) this.soundPlayer?.('land', { volume: 0.3, caption: false });
      pet.controller.play('idle', { force: true, fade: 0.18, loop: true });
      action.point = { x: pet.stage.position.x, z: pet.stage.position.z };
      this.autonomyReturnPoint = pet.stage.position.clone();
      this.autonomyHoldUntil = performance.now() + 120;
    };
    requestAnimationFrame(step);
    return true;
  },

  beginAutonomousInteraction(action) {
    const pet = this.currentPet;
    if (!pet || !action) return;
    this.autonomyReturnPoint = pet.stage.position.clone();
    if (action.id === 'trained-command' && action.trainingTraversal?.points?.length >= 2) {
      if (this.runTrainingTraversal(pet, action)) {
        this.dispatchEvent(new CustomEvent('autonomous-arrived', { detail: { action } }));
        return;
      }
    }
    if (action.surface && !this.placePetOnActionSurface(pet, action)) {
      pet.stage.position.copy(this.findSafePetPosition(this.autonomyReturnPoint, pet));
      pet.stage.position.y = 0;
      pet.controller.play('idle', { force: true, fade: 0.2 });
      this.activeAutonomousAction = null;
      this.autonomyHoldUntil = 0;
      this.autonomyReturnPoint = null;
      this.dispatchEvent(new CustomEvent('path-blocked', { detail: { action, outcome: 'invalid-surface' } }));
      return;
    }
    if (!action.surface) {
      pet.stage.position.y = 0;
      this.faceInteractionPoint(pet, action.interactionPoint);
    }
    const animation = pet.controller.has(action.animation) ? action.animation : action.id === 'sleep' && pet.controller.has('lie_down') ? 'lie_down' : 'idle';
    this.playAutonomousPose(pet, action, animation, { fade: 0.22 });
    if (action.surface) {
      const surfaceY = Number(action.surface.y);
      requestAnimationFrame(() => {
        if (this.currentPet === pet && this.activeAutonomousAction === action) this.alignPetToSurface(pet, surfaceY);
      });
    }
    if (action.id === 'eat') this.showBowlContents?.('meal');
    if (action.id === 'drink') this.showBowlContents?.('water');
    this.autonomyHoldUntil = performance.now() + clamp(Number(action.hold) || 6000, 1800, 20000);
    this.dispatchEvent(new CustomEvent('autonomous-arrived', { detail: { action } }));
  },

  completeAutonomousInteraction(outcome = 'completed') {
    const action = this.activeAutonomousAction;
    const pet = this.currentPet;
    if (this.trainingTraversalState?.action === action) this.trainingTraversalState = null;
    if (!action) return;
    if (pet) {
      const fallback = action.point ? new THREE.Vector3(action.point.x, 0, action.point.z) : this.autonomyReturnPoint;
      if (fallback) pet.stage.position.copy(this.findSafePetPosition(fallback, pet));
      pet.stage.position.y = 0;
      const keepQuietSit = this.isQuietCornerAction(action) && pet.autonomousPose?.location === 'quiet-corner';
      if (keepQuietSit) {
        pet.autonomousPose = { kind: 'sitting', location: 'quiet-corner' };
        if (pet.controller.has('sitting_idle') && pet.controller.currentName !== 'sitting_idle') {
          pet.controller.play('sitting_idle', { force: true, fade: 0.12, loop: true });
        }
      } else {
        this.clearAutonomousPose(pet);
        pet.controller.play('idle', { force: true, fade: 0.22 });
      }
    }
    this.activeAutonomousAction = null;
    this.autonomyHoldUntil = 0;
    this.autonomyReturnPoint = null;
    this.clearBowlContents?.();
    this.dispatchEvent(new CustomEvent('autonomous-complete', { detail: { action, outcome } }));
  },

  interruptAutonomous(reason = 'interrupted') {
    if (!this.activeAutonomousAction) return false;
    this.completeAutonomousInteraction(reason);
    return true;
  },

  updateMovement(delta) {
    const pet = this.currentPet;
    if (!pet || !this.target) return;
    const position = pet.stage.position;
    const direction = this.target.clone().sub(position);
    direction.y = 0;
    const distance = direction.length();
    if (distance < 0.08) {
      position.copy(this.target);
      if (this.pathWaypoints.length) {
        this.target = this.pathWaypoints.shift().clone();
        this.target.run = this.pathRun;
      } else {
        this.stopMovement('arrived');
      }
      return;
    }

    direction.normalize();
    const running = Boolean(this.pathRun) || distance > 3.4;
    const speed = running ? 2.55 : 1.2;
    const step = Math.min(distance, speed * delta);
    const substeps = Math.max(1, Math.ceil(step / 0.055));
    const substepDistance = step / substeps;
    let blocked = false;

    for (let index = 0; index < substeps; index += 1) {
      const next = position.clone().addScaledVector(direction, substepDistance);
      const petSeparation = this.livingEntityCollisionAt(next.x, next.z, pet.navigationRadius || 0.34, pet, 0.08);
      if (this.isBlocked(next.x, next.z, pet.navigationRadius || 0.34) || petSeparation) {
        blocked = true;
        break;
      }
      position.copy(next);
    }

    if (blocked) {
      const recovered = this.ensurePetOutsideObstacles(pet, position.clone());
      if (this.finalTarget && this.repathAttempts < 3) {
        this.repathAttempts += 1;
        const route = this.findPath(pet.stage.position.clone(), this.finalTarget, pet.navigationRadius || 0.34);
        if (route.length) {
          this.pathWaypoints = route.slice(1);
          this.target = route[0].clone();
          this.target.run = this.pathRun;
          return;
        }
      }
      if (recovered) pet.controller.play('idle', { force: true, fade: 0.12, loop: true });
      this.stopMovement('blocked');
      return;
    }

    const desiredYaw = Math.atan2(direction.x, direction.z);
    pet.modelHolder.rotation.y = this.smoothAngle(pet.modelHolder.rotation.y, desiredYaw, Math.min(1, delta * 8));
    pet.controller.play(running ? 'run' : 'walk', { fade: 0.18 });
    const stepNow = performance.now();
    const stepInterval = running ? 285 : 520;
    if (stepNow - (this.lastFootstepAt || 0) > stepInterval) {
      this.lastFootstepAt = stepNow;
      const outdoor = ['garden','park','training'].includes(this.roomId) || this.travelLocation;
      this.soundPlayer?.('land', { volume: running ? 0.09 : 0.055, rate: outdoor ? 0.82 + Math.random() * 0.08 : 1.04 + Math.random() * 0.1, caption: false });
    }
    this.onMovement?.(running ? 'run' : 'walk');
  },

  smoothAngle(current, target, amount) {
    let delta = (target - current + Math.PI) % (Math.PI * 2) - Math.PI;
    if (delta < -Math.PI) delta += Math.PI * 2;
    return current + delta * amount;
  },

  refreshOccludableObjects() {
    if (!this.environment) return;
    this.occludableObjects = this.environment.children.filter((object) => {
      if (!object?.visible) return false;
      if (object.name === 'walk-floor' || object.name?.startsWith('room-structure-')) return false;
      return object.userData?.excludeFromOcclusion !== true;
    });
    this.occlusionEnvironmentChildCount = this.environment.children.length;
  },

  prepareOcclusionMaterials(root) {
    if (!root || root.userData.occlusionPrepared) return;
    root.userData.occlusionPrepared = true;
    root.userData.occlusionFactor = 1;
    root.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const originals = Array.isArray(child.material) ? child.material : [child.material];
      const clones = originals.map((source) => {
        const material = source.clone();
        material.userData.occlusionOriginalOpacity = Number.isFinite(source.opacity) ? source.opacity : 1;
        material.userData.occlusionOriginalTransparent = Boolean(source.transparent);
        material.userData.occlusionOriginalDepthWrite = source.depthWrite !== false;
        return material;
      });
      child.material = Array.isArray(child.material) ? clones : clones[0];
    });
  },

  applyOcclusionFactor(root, factor) {
    if (!root) return;
    this.prepareOcclusionMaterials(root);
    root.userData.occlusionFactor = factor;
    root.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        const originalOpacity = material.userData.occlusionOriginalOpacity ?? 1;
        const originalTransparent = material.userData.occlusionOriginalTransparent ?? false;
        const originalDepthWrite = material.userData.occlusionOriginalDepthWrite ?? true;
        const faded = factor < 0.995;
        const nextTransparent = faded || originalTransparent;
        const nextDepthWrite = faded ? false : originalDepthWrite;
        material.opacity = originalOpacity * factor;
        if (material.transparent !== nextTransparent || material.depthWrite !== nextDepthWrite) {
          material.transparent = nextTransparent;
          material.depthWrite = nextDepthWrite;
          material.needsUpdate = true;
        }
      });
    });
  },

  restoreFurnitureOcclusion(immediate = false) {
    if (!this.occludableObjects?.length) return;
    this.occludableObjects.forEach((object) => {
      const current = object.userData?.occlusionFactor ?? 1;
      const next = immediate ? 1 : lerp(current, 1, 0.25);
      if (Math.abs(next - current) > 0.002 || current < 0.995) this.applyOcclusionFactor(object, next > 0.992 ? 1 : next);
    });
    this.occludedObjects?.clear?.();
  },

  updateFurnitureOcclusion(delta) {
    const pet = this.currentPet;
    if (!pet || !this.camera || !this.environment || this.mode === 'selection') {
      this.restoreFurnitureOcclusion(false);
      return;
    }
    if (this.occlusionEnvironmentChildCount !== this.environment.children.length || !this.occludableObjects?.length) this.refreshOccludableObjects();

    const target = pet.stage.position.clone().add(new THREE.Vector3(0, Math.max(0.35, pet.size.y * 0.48), 0));
    const direction = target.clone().sub(this.camera.position);
    const distance = direction.length();
    if (distance <= 0.4) return;
    direction.normalize();
    this.occlusionRaycaster.set(this.camera.position, direction);
    this.occlusionRaycaster.near = 0.05;
    this.occlusionRaycaster.far = Math.max(0.1, distance - Math.max(0.2, pet.size.z * 0.18));

    const blocked = new Set();
    const intersections = this.occlusionRaycaster.intersectObjects(this.occludableObjects, true);
    intersections.forEach((hit) => {
      let root = hit.object;
      while (root?.parent && root.parent !== this.environment) root = root.parent;
      if (root?.parent === this.environment && root.visible) blocked.add(root);
    });

    const fadeSpeed = Math.min(1, delta * 8.5);
    this.occludableObjects.forEach((object) => {
      const current = object.userData?.occlusionFactor ?? 1;
      const desired = blocked.has(object) ? 0.2 : 1;
      const next = lerp(current, desired, fadeSpeed);
      if (Math.abs(next - current) > 0.002 || (desired === 1 && current < 0.995)) this.applyOcclusionFactor(object, desired === 1 && next > 0.992 ? 1 : next);
    });
    this.occludedObjects = blocked;
  },

  updateCamera(delta) {
    const pet = this.currentPet;
    const settings = this.settingsProvider();
    const ease = settings.reducedMotion ? 1 : Math.min(1, delta * 3.5);

    if (this.buildGizmoEnabled) {
      const rect = this.canvas?.getBoundingClientRect?.();
      const pointer = this.buildViewportPointer || { inside: false, x: 0, y: 0 };
      const marginX = rect ? Math.max(42, Math.min(96, rect.width * 0.08)) : 72;
      const marginY = rect ? Math.max(42, Math.min(96, rect.height * 0.08)) : 72;
      let inputX = 0;
      let inputZ = 0;
      if (pointer.inside && rect) {
        if (pointer.x <= rect.left + marginX) inputX = -clamp((rect.left + marginX - pointer.x) / marginX, 0, 1);
        else if (pointer.x >= rect.right - marginX) inputX = clamp((pointer.x - (rect.right - marginX)) / marginX, 0, 1);
        if (pointer.y <= rect.top + marginY) inputZ = -clamp((rect.top + marginY - pointer.y) / marginY, 0, 1);
        else if (pointer.y >= rect.bottom - marginY) inputZ = clamp((pointer.y - (rect.bottom - marginY)) / marginY, 0, 1);
      }
      const bounds = this.getWalkBounds(1.2);
      const centerX = (bounds.minX + bounds.maxX) * 0.5;
      const centerZ = (bounds.minZ + bounds.maxZ) * 0.5;
      const limitX = Math.max(0.85, (bounds.maxX - bounds.minX) * 0.34);
      const limitZ = Math.max(0.85, (bounds.maxZ - bounds.minZ) * 0.34);
      const panSpeed = 5.6;
      this.buildCameraPan.x = clamp(this.buildCameraPan.x + inputX * panSpeed * delta, centerX - limitX, centerX + limitX);
      this.buildCameraPan.y = clamp(this.buildCameraPan.y + inputZ * panSpeed * delta, centerZ - limitZ, centerZ + limitZ);
      const desired = new THREE.Vector3(this.baseCamera.x + this.buildCameraPan.x, this.baseCamera.y, this.baseCamera.z + this.buildCameraPan.y);
      const focus = new THREE.Vector3(this.buildCameraPan.x, 0.92, this.buildCameraPan.y);
      if (settings.reducedMotion) this.camera.position.copy(desired);
      else this.camera.position.lerp(desired, ease);
      this.cameraTarget.lerp(focus, ease);
      this.camera.lookAt(this.cameraTarget);
      return;
    }

    const contextual = settings.contextualCamera !== false && !settings.reducedMotion ? this.contextualFocus : null;
    const focus = contextual || (pet ? pet.stage.position.clone().add(new THREE.Vector3(0, pet.size.y * 0.47, 0)) : this.cameraTarget);
    let desired = new THREE.Vector3(this.baseCamera.x, this.baseCamera.y, this.baseCamera.z);
    if (pet && this.mode !== 'selection') {
      desired.x += pet.stage.position.x * 0.22;
      desired.z += pet.stage.position.z * 0.2;
      if (this.target?.run) desired.z += 0.65;
      if (this.mode === 'clean') desired.z -= 0.85;
      if (contextual) {
        desired.x += (contextual.x - pet.stage.position.x) * 0.18;
        desired.z -= 0.35;
      }
    }
    if (['home', 'photo'].includes(this.mode) && (Math.abs(this.cameraOrbitYaw || 0) > 0.0001 || Math.abs(this.cameraOrbitPitch || 0) > 0.0001)) {
      const relativeX = desired.x - focus.x;
      const relativeZ = desired.z - focus.z;
      const radius = Math.max(0.1, Math.hypot(relativeX, relativeZ));
      const angle = Math.atan2(relativeX, relativeZ) + (this.cameraOrbitYaw || 0);
      desired.x = focus.x + Math.sin(angle) * radius;
      desired.z = focus.z + Math.cos(angle) * radius;
      desired.y = clamp(desired.y + (this.cameraOrbitPitch || 0), 1.15, 8.2);
    }
    if (settings.reducedMotion) {
      this.camera.position.copy(desired);
    } else {
      this.camera.position.lerp(desired, ease);
    }
    this.cameraTarget.lerp(focus, ease);
    this.camera.lookAt(this.cameraTarget);
  },

  async setSecondaryPet(id = null) {
    if (!this.scene || !this.petStage) { this.secondaryPetId = id && id !== this.currentPetId ? id : null; return true; }
    if (this.secondaryAction && this.secondaryPetId !== id) this.completeSecondaryInteraction('removed');
    if (this.secondaryPetId && this.secondaryPetId !== id) {
      const old = this.pets.get(this.secondaryPetId);
      if (old) { this.pets.delete(this.secondaryPetId); this.disposePetRecord(old); }
    }
    this.secondaryPetId = id && id !== this.currentPetId ? id : null;
    this.secondaryTarget = null;
    this.secondaryWaypoints = [];
    this.secondaryAction = null;
    this.secondaryHoldUntil = 0;
    if (!this.secondaryPetId || this.settingsProvider().multiPetRendering === false) return true;
    let record = this.pets.get(this.secondaryPetId);
    if (!record) {
      const gltf = await this.loadModel(PETS[this.secondaryPetId].model);
      record = this.preparePet(this.secondaryPetId, gltf);
      this.petStage.add(record.stage);
      this.pets.set(this.secondaryPetId, record);
    }
    record.stage.visible = true;
    record.stage.position.copy(this.findSafePetPosition(new THREE.Vector3(1.8,0,0.8), record));
    record.modelHolder.rotation.y = Math.PI;
    record.controller.play('idle', { force:true, fade:0.2 });
    return true;
  },

  updateSecondary(delta, time) {
    if (!this.secondaryPetId || this.mode !== 'home') return;
    const secondary = this.pets.get(this.secondaryPetId);
    const primary = this.currentPet;
    if (!secondary || !primary) return;
    if (this.secondaryAction && !this.secondaryTarget && this.secondaryHoldUntil) {
      if (time >= this.secondaryHoldUntil) this.completeSecondaryInteraction('completed');
      return;
    }
    if (!this.autonomousEnabled || this.activityState) return;
    if (!this.secondaryTarget && !this.secondaryAction && time - this.secondaryLastDecision > (this.settingsProvider().reducedMotion ? 18000 : 9000)) {
      this.secondaryLastDecision = time;
      const action = this.secondaryAutonomyProvider?.() || { id: 'explore', target: 'roam', run: false, hold: 2600, animation: 'idle' };
      if (!action) return;
      this.secondaryAction = action;
      const minimumDistance = (secondary.navigationRadius || 0.34) + (primary.navigationRadius || 0.34) + 0.18;
      const preferred = action.target === 'friend'
        ? primary.stage.position.clone().add(new THREE.Vector3(minimumDistance, 0, 0))
        : action.point && Number.isFinite(action.point.x) && Number.isFinite(action.point.z)
          ? new THREE.Vector3(action.point.x, 0, action.point.z)
          : new THREE.Vector3(randomBetween(-3.2,3.2),0,randomBetween(-2.0,2.0));
      const safePreferred = this.findSafePetPosition(preferred, secondary, { interaction: true });
      if (secondary.stage.position.distanceTo(safePreferred) > 0.12) this.clearAutonomousPose(secondary);
      const route = this.findPath(secondary.stage.position.clone(), safePreferred, secondary.navigationRadius || 0.4);
      if (!route.length) {
        this.secondaryAction = null;
        this.dispatchEvent(new CustomEvent('secondary-path-blocked', { detail: { action } }));
        return;
      }
      this.secondaryWaypoints = route.slice(1);
      this.secondaryTarget = route[0];
    }
    const separation = secondary.stage.position.clone().sub(primary.stage.position); separation.y=0;
    const safeSeparation = (secondary.navigationRadius || 0.34) + (primary.navigationRadius || 0.34) + 0.08;
    if (separation.length() < safeSeparation) {
      if (separation.lengthSq() < 0.0001) separation.set(1, 0, 0);
      else separation.normalize();
      secondary.stage.position.addScaledVector(separation, delta*0.9);
      primary.stage.position.addScaledVector(separation, -delta*0.3);
    }
    if (!this.secondaryTarget) return;
    const direction = this.secondaryTarget.clone().sub(secondary.stage.position); direction.y=0;
    const distance=direction.length();
    if(distance<0.1){
      if (this.secondaryWaypoints?.length) this.secondaryTarget = this.secondaryWaypoints.shift();
      else if (this.secondaryAction) this.beginSecondaryInteraction(this.secondaryAction);
      else { this.secondaryTarget=null; secondary.controller.play('idle',{fade:0.2}); }
      return;
    }
    direction.normalize();
    const next=secondary.stage.position.clone().addScaledVector(direction,Math.min(distance,delta*0.85));
    const minimumDistance = (secondary.navigationRadius || 0.34) + (primary.navigationRadius || 0.34) + 0.08;
    if(this.isBlocked(next.x,next.z,secondary.navigationRadius || 0.4) || this.livingEntityCollisionAt(next.x, next.z, secondary.navigationRadius || 0.4, secondary, 0.08) || next.distanceTo(primary.stage.position) < minimumDistance){
      const side = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(0.28);
      const detour = secondary.stage.position.clone().add(side);
      if (!this.isBlocked(detour.x, detour.z, secondary.navigationRadius || 0.4) && detour.distanceTo(primary.stage.position) >= minimumDistance) secondary.stage.position.lerp(detour, Math.min(1, delta * 3));
      else {
        const action=this.secondaryAction;
        this.secondaryTarget=null;this.secondaryWaypoints=[];this.secondaryAction=null;this.secondaryHoldUntil=0;
        secondary.controller.play('idle',{fade:0.15,force:true});
        this.dispatchEvent(new CustomEvent('secondary-path-blocked',{detail:{action}}));
      }
      return;
    }
    secondary.stage.position.copy(next);
    secondary.modelHolder.rotation.y=this.smoothAngle(secondary.modelHolder.rotation.y,Math.atan2(direction.x,direction.z),Math.min(1,delta*7));
    secondary.controller.play(this.secondaryAction?.run?'run':'walk',{fade:0.18});
  },

  beginSecondaryInteraction(action) {
    const secondary = this.secondaryPetId ? this.pets.get(this.secondaryPetId) : null;
    if (!secondary || !action) return;
    this.secondaryTarget = null;
    this.secondaryReturnPoint = secondary.stage.position.clone();
    if (action.surface && !this.placePetOnActionSurface(secondary, action)) {
      secondary.stage.position.copy(this.findSafePetPosition(this.secondaryReturnPoint, secondary));
      secondary.stage.position.y = 0;
      secondary.controller.play('idle', { force: true, fade: 0.2 });
      this.secondaryAction = null;
      this.secondaryHoldUntil = 0;
      this.secondaryReturnPoint = null;
      this.dispatchEvent(new CustomEvent('secondary-path-blocked', { detail: { action, outcome: 'invalid-surface' } }));
      return;
    }
    if (!action.surface) {
      secondary.stage.position.y = 0;
      this.faceInteractionPoint(secondary, action.interactionPoint);
    }
    const animation = secondary.controller.has(action.animation) ? action.animation : 'idle';
    this.playAutonomousPose(secondary, action, animation, { fade: 0.2, secondary: true });
    if (action.surface) {
      const surfaceY = Number(action.surface.y);
      requestAnimationFrame(() => {
        if (this.secondaryPetId && this.pets.get(this.secondaryPetId) === secondary && this.secondaryAction === action) this.alignPetToSurface(secondary, surfaceY);
      });
    }
    this.secondaryHoldUntil = performance.now() + clamp(Number(action.hold) || 5000, 1800, 18000);
    if (['social-play','sleep-near-pet','seek-player'].includes(action.id)) this.contextualFocus = secondary.stage.position.clone().lerp(this.currentPet.stage.position, 0.5).add(new THREE.Vector3(0,0.45,0));
  },

  completeSecondaryInteraction(outcome = 'completed') {
    const action = this.secondaryAction;
    const secondary = this.secondaryPetId ? this.pets.get(this.secondaryPetId) : null;
    if (!action) return;
    if (secondary) {
      const fallback = action.point ? new THREE.Vector3(action.point.x, 0, action.point.z) : this.secondaryReturnPoint;
      if (fallback) secondary.stage.position.copy(this.findSafePetPosition(fallback, secondary));
      secondary.stage.position.y = 0;
      const keepQuietSit = this.isQuietCornerAction(action) && secondary.autonomousPose?.location === 'quiet-corner';
      if (keepQuietSit) {
        secondary.autonomousPose = { kind: 'sitting', location: 'quiet-corner' };
        if (secondary.controller.has('sitting_idle') && secondary.controller.currentName !== 'sitting_idle') {
          secondary.controller.play('sitting_idle', { force: true, fade: 0.12, loop: true });
        }
      } else {
        this.clearAutonomousPose(secondary);
        secondary.controller.play('idle', { force: true, fade: 0.2 });
      }
    }
    this.secondaryAction = null;
    this.secondaryTarget = null;
    this.secondaryWaypoints = [];
    this.secondaryHoldUntil = 0;
    this.secondaryReturnPoint = null;
    this.contextualFocus = null;
    this.dispatchEvent(new CustomEvent('secondary-autonomous-complete', { detail: { action, outcome } }));
  },

  playSocialInteraction(kind = 'play') {
    const secondary = this.secondaryPetId ? this.pets.get(this.secondaryPetId) : null;
    const primary = this.currentPet;
    if (!secondary || !primary) return;
    if (this.secondaryAction) this.completeSecondaryInteraction('social-interaction');
    this.stopMovement('social');
    const midpoint = primary.stage.position.clone().add(secondary.stage.position).multiplyScalar(0.5);
    const offset = new THREE.Vector3(0.55,0,0);
    primary.stage.position.copy(this.findSafePetPosition(midpoint.clone().sub(offset), primary));
    secondary.stage.position.copy(this.findSafePetPosition(midpoint.clone().add(offset), secondary));
    primary.modelHolder.rotation.y=Math.PI/2; secondary.modelHolder.rotation.y=-Math.PI/2;
    const action = kind === 'play' && primary.controller.has('give_paw') ? 'give_paw' : kind === 'rest' && primary.controller.has('lie_down') ? 'lie_down' : 'idle';
    const secondAction = kind === 'play' && secondary.controller.has('give_paw') ? 'give_paw' : kind === 'rest' && secondary.controller.has('lie_down') ? 'lie_down' : 'idle';
    primary.controller.play(action,{force:true,loop:false,fade:0.2}); secondary.controller.play(secondAction,{force:true,loop:false,fade:0.2});
    setTimeout(()=>{primary.controller.play('idle',{force:true,fade:0.2});secondary.controller.play('idle',{force:true,fade:0.2});},1700);
  }
};
