import * as THREE from '../../vendor/three.module.js';
import { PETS } from '../config.js';
import { clamp, lerp, randomBetween } from '../utils.js';

export const navigationMethods = {
  isBlocked(x, z, radius = 0.34) {
    return this.obstacles.some((obstacle) =>
      x + radius > obstacle.minX && x - radius < obstacle.maxX &&
      z + radius > obstacle.minZ && z - radius < obstacle.maxZ
    );
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

  findPath(start, destination, radius = 0.34) {
    const cell = 0.28;
    const minX = -4.4;
    const maxX = 4.4;
    const minZ = -2.75;
    const maxZ = 2.75;
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

  findSafePosition(preferred = new THREE.Vector3(0, 0, 0)) {
    const base = preferred.clone();
    base.x = clamp(base.x, -4.75, 4.75);
    base.z = clamp(base.z, -2.95, 2.95);
    base.y = 0;
    if (!this.isBlocked(base.x, base.z, 0.3)) return base;
    const radii = [0.35, 0.65, 0.95, 1.3, 1.7, 2.2, 2.8, 3.4];
    for (const radius of radii) {
      const steps = Math.max(10, Math.ceil(radius * 12));
      for (let index = 0; index < steps; index += 1) {
        const angle = (index / steps) * Math.PI * 2;
        const x = clamp(base.x + Math.cos(angle) * radius, -4.75, 4.75);
        const z = clamp(base.z + Math.sin(angle) * radius, -2.95, 2.95);
        if (!this.isBlocked(x, z, 0.3)) return new THREE.Vector3(x, 0, z);
      }
    }
    return new THREE.Vector3(0, 0, 1.35);
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
    pet.stage.position.copy(preferred ? this.findSafePosition(preferred) : this.getRoomSpawn(this.roomId));
    pet.stage.position.y = 0;
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
    const destination = this.findSafePosition(new THREE.Vector3(x, 0, z));
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
    if (!pet || this.mode === 'selection' || this.mode === 'sleep' || this.cleanMode) return false;
    const destination = this.findSafePosition(new THREE.Vector3(clamp(x, -4.4, 4.4), 0, clamp(z, -2.75, 2.75)));
    const route = this.findPath(pet.stage.position.clone(), destination, pet.navigationRadius || 0.34);
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

  setAutonomous(enabled) {
    this.autonomousEnabled = enabled;
    if (!enabled) {
      this.autonomousTarget = null;
      this.interruptAutonomous('disabled');
      if (this.secondaryAction) this.completeSecondaryInteraction('disabled');
    }
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
    const point = this.findSafePosition(this.autonomousPoint(action));
    const moved = this.moveTo(point.x, point.z, Boolean(action.run));
    if (!moved && this.movementOutcome !== 'blocked') this.beginAutonomousInteraction(action);
    this.dispatchEvent(new CustomEvent('autonomous', { detail: action }));
  },

  beginAutonomousInteraction(action) {
    const pet = this.currentPet;
    if (!pet || !action) return;
    this.autonomyReturnPoint = pet.stage.position.clone();
    if (action.interactionPoint && Number.isFinite(action.interactionPoint.x) && Number.isFinite(action.interactionPoint.z)) {
      pet.stage.position.x = action.interactionPoint.x;
      pet.stage.position.z = action.interactionPoint.z;
    }
    pet.stage.position.y = Math.max(0, Number(action.verticalHeight) || 0);
    const animation = pet.controller.has(action.animation) ? action.animation : action.id === 'sleep' && pet.controller.has('lie_down') ? 'lie_down' : 'idle';
    pet.controller.play(animation, { force: true, fade: 0.22, loop: animation !== 'jump' });
    if (action.id === 'eat') this.showBowlContents?.('meal');
    if (action.id === 'drink') this.showBowlContents?.('water');
    this.autonomyHoldUntil = performance.now() + clamp(Number(action.hold) || 6000, 1800, 20000);
    this.dispatchEvent(new CustomEvent('autonomous-arrived', { detail: { action } }));
  },

  completeAutonomousInteraction(outcome = 'completed') {
    const action = this.activeAutonomousAction;
    const pet = this.currentPet;
    if (!action) return;
    if (pet) {
      const fallback = action.point ? new THREE.Vector3(action.point.x, 0, action.point.z) : this.autonomyReturnPoint;
      if (fallback) pet.stage.position.copy(this.findSafePosition(fallback));
      pet.stage.position.y = 0;
      pet.controller.play('idle', { force: true, fade: 0.22 });
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
      const secondary = this.secondaryPetId ? this.pets.get(this.secondaryPetId) : null;
      const petSeparation = secondary ? next.distanceTo(secondary.stage.position) < (pet.navigationRadius || 0.34) + (secondary.navigationRadius || 0.34) + 0.1 : false;
      if (this.isBlocked(next.x, next.z, pet.navigationRadius || 0.34) || petSeparation) {
        blocked = true;
        break;
      }
      position.copy(next);
    }

    if (blocked) {
      if (this.finalTarget && this.repathAttempts < 2) {
        this.repathAttempts += 1;
        const route = this.findPath(position.clone(), this.finalTarget, pet.navigationRadius || 0.34);
        if (route.length) {
          this.pathWaypoints = route.slice(1);
          this.target = route[0].clone();
          this.target.run = this.pathRun;
          return;
        }
      }
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

  updateCamera(delta) {
    const pet = this.currentPet;
    const settings = this.settingsProvider();
    const ease = settings.reducedMotion ? 1 : Math.min(1, delta * 3.5);
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
    record.stage.position.copy(this.findSafePosition(new THREE.Vector3(1.8,0,0.8)));
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
      const route = this.findPath(secondary.stage.position.clone(), preferred, secondary.navigationRadius || 0.4);
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
    if(this.isBlocked(next.x,next.z,secondary.navigationRadius || 0.4) || next.distanceTo(primary.stage.position) < minimumDistance){
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
    if (action.interactionPoint && Number.isFinite(action.interactionPoint.x) && Number.isFinite(action.interactionPoint.z)) {
      secondary.stage.position.x = action.interactionPoint.x;
      secondary.stage.position.z = action.interactionPoint.z;
    }
    secondary.stage.position.y = Math.max(0, Number(action.verticalHeight) || 0);
    const animation = secondary.controller.has(action.animation) ? action.animation : 'idle';
    secondary.controller.play(animation, { force: true, fade: 0.2, loop: animation !== 'jump' });
    this.secondaryHoldUntil = performance.now() + clamp(Number(action.hold) || 5000, 1800, 18000);
    if (['social-play','sleep-near-pet','seek-player'].includes(action.id)) this.contextualFocus = secondary.stage.position.clone().lerp(this.currentPet.stage.position, 0.5).add(new THREE.Vector3(0,0.45,0));
  },

  completeSecondaryInteraction(outcome = 'completed') {
    const action = this.secondaryAction;
    const secondary = this.secondaryPetId ? this.pets.get(this.secondaryPetId) : null;
    if (!action) return;
    if (secondary) {
      const fallback = action.point ? new THREE.Vector3(action.point.x, 0, action.point.z) : this.secondaryReturnPoint;
      if (fallback) secondary.stage.position.copy(this.findSafePosition(fallback));
      secondary.stage.position.y = 0;
      secondary.controller.play('idle', { force: true, fade: 0.2 });
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
    primary.stage.position.copy(this.findSafePosition(midpoint.clone().sub(offset)));
    secondary.stage.position.copy(this.findSafePosition(midpoint.clone().add(offset)));
    primary.modelHolder.rotation.y=Math.PI/2; secondary.modelHolder.rotation.y=-Math.PI/2;
    const action = kind === 'play' && primary.controller.has('give_paw') ? 'give_paw' : kind === 'rest' && primary.controller.has('lie_down') ? 'lie_down' : 'idle';
    const secondAction = kind === 'play' && secondary.controller.has('give_paw') ? 'give_paw' : kind === 'rest' && secondary.controller.has('lie_down') ? 'lie_down' : 'idle';
    primary.controller.play(action,{force:true,loop:false,fade:0.2}); secondary.controller.play(secondAction,{force:true,loop:false,fade:0.2});
    setTimeout(()=>{primary.controller.play('idle',{force:true,fade:0.2});secondary.controller.play('idle',{force:true,fade:0.2});},1700);
  }
};
