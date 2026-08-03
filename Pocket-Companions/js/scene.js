import * as THREE from '../vendor/three.module.js';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { PETS, ANIMATION_NAMES, ROBOT_COMPANIONS, ROBOT_COMPANIONS_ENABLED, OUTDOOR_WILDLIFE } from './config.js';
import { AnimationController } from './animations.js';
import { AccessoryTransformGizmo } from './accessory-gizmo.js';
import { environmentMethods } from './scene/environment.js';
import { navigationMethods } from './scene/navigation.js';
import { effectsMethods } from './scene/effects.js';
import { interactionsMethods } from './scene/interactions.js';
import { accessoriesMethods } from './scene/accessories.js';
import { mediaMethods } from './scene/media.js';
import { activitiesMethods } from './scene/activities.js';
import { buildingMethods } from './scene/building.js';
import { physicalProfile } from './simulation/species-behaviors.js';
import { clamp, lerp, randomBetween } from './utils.js';

function neutralizeHorizontalRootMotion(clip) {
  const cloned = clip.clone();
  cloned.tracks = cloned.tracks.map((sourceTrack) => {
    if (!sourceTrack.name.endsWith('.position') || !/(^|[/.|:])(root|armature|hips|pelvis)([/.|:]|$)/i.test(sourceTrack.name)) return sourceTrack;
    const track = sourceTrack.clone();
    if (track.values.length < 3 || track.values.length % 3 !== 0) return track;
    const baseX = track.values[0];
    const baseZ = track.values[2];
    for (let index = 0; index < track.values.length; index += 3) {
      track.values[index] = baseX;
      track.values[index + 2] = baseZ;
    }
    return track;
  });
  return cloned;
}

function stripExtremeScaleTracks(clip) {
  const cloned = clip.clone();
  cloned.tracks = cloned.tracks.filter((track) => {
    if (!track.name.endsWith('.scale')) return true;
    for (const value of track.values) {
      const magnitude = Math.abs(Number(value) || 0);
      if (magnitude > 10 || magnitude < 0.001) return false;
    }
    return true;
  });
  return cloned;
}

function findExpressionBones(model) {
  const bones = [];
  model.traverse((child) => { if (child.isBone) bones.push(child); });
  const ranked = (pattern) => bones.filter((bone) => pattern.test(bone.name)).sort((a, b) => a.name.length - b.name.length);
  return {
    head: ranked(/(^|[_ .-])(head|skull)(\d*|[_ .-]|$)/i)[0] || null,
    ears: ranked(/ear/i).filter((bone) => !/end|tip/i.test(bone.name)).slice(0, 2),
    tail: ranked(/tail/i).filter((bone) => !/end|tip/i.test(bone.name))[0] || null,
    delta: new THREE.Quaternion(),
    euler: new THREE.Euler()
  };
}


function normalizeActionName(name = '') {
  return String(name).trim().toLowerCase();
}

function resolveActionName(controller, candidates = [], fallback = null) {
  if (!controller) return fallback;
  const available = controller.list();
  const lookup = new Map(available.map(({ name }) => [normalizeActionName(name), name]));
  for (const candidate of candidates) {
    const key = normalizeActionName(candidate);
    if (lookup.has(key)) return lookup.get(key);
  }
  for (const { name } of available) {
    const lower = normalizeActionName(name);
    if (candidates.some((candidate) => lower.includes(normalizeActionName(candidate)))) return name;
  }
  return fallback || available[0]?.name || null;
}


function shortestAngleDelta(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function dampAngle(from, to, turnRate, delta) {
  const alpha = 1 - Math.exp(-Math.max(0.01, turnRate) * Math.max(0, delta));
  return from + shortestAngleDelta(from, to) * alpha;
}

function configureCompanionMotion(record, motion = {}) {
  const controller = record?.controller;
  if (!controller) {
    record.idleClip = null;
    record.moveClip = null;
    return record;
  }
  record.idleClip = motion.idle === false
    ? null
    : resolveActionName(controller, motion.idle || ['idle', '1idle', 'stand', 'standing'], controller.list()[0]?.name || null);
  const numberedMoveClip = Number.isInteger(motion.moveIndex)
    ? record.clipNames?.[motion.zeroBased === true ? motion.moveIndex : motion.moveIndex - 1] || null
    : null;
  const resolvedMoveClip = numberedMoveClip && controller.has(numberedMoveClip)
    ? numberedMoveClip
    : resolveActionName(controller, motion.move || ['walk', 'walking', 'trot', 'run', 'playing', 'move', 'metarigaction'], null);
  record.moveClip = resolvedMoveClip && resolvedMoveClip !== record.idleClip ? resolvedMoveClip : record.idleClip;
  if (record.idleClip) controller.play(record.idleClip, { fade: 0.01, force: true, loop: true });
  return record;
}

export class CompanionScene extends EventTarget {
  constructor(canvas, settingsProvider, soundPlayer) {
    super();
    this.canvas = canvas;
    this.settingsProvider = settingsProvider;
    this.soundPlayer = soundPlayer;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = new THREE.Clock();
    this.loader = new GLTFLoader();
    this.petStage = new THREE.Group();
    this.environment = new THREE.Group();
    this.pets = new Map();
    this.currentPetId = null;
    this.mode = 'title';
    this.running = false;
    this.frameId = null;
    this.target = null;
    this.pathWaypoints = [];
    this.finalTarget = null;
    this.pathRun = false;
    this.repathAttempts = 0;
    this.petLoadRequest = 0;
    this.movementOutcome = 'idle';
    this.lastFootstepAt = 0;
    this.velocity = new THREE.Vector3();
    this.baseCamera = { x: 0, y: 2.4, z: 6.2 };
    this.cameraTarget = new THREE.Vector3(0, 1.1, 0);
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.occlusionRaycaster = new THREE.Raycaster();
    this.occludableObjects = [];
    this.occludedObjects = new Set();
    this.occlusionEnvironmentChildCount = -1;
    this.floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.pointerState = { down: false, x: 0, y: 0, startX: 0, startY: 0, totalDx: 0, totalDy: 0, dragged: false, lastPetAt: 0, startedAt: 0, lastMoveAt: 0, lastHitPoint: null, onPet: false };
    this.activePointers = new Map();
    this.pinchDistance = null;
    this.cleanMode = false;
    this.cleanProgress = 0;
    this.bubbles = [];
    this.foamMarks = [];
    this.dirtMarks = [];
    this.waterDrops = [];
    this.particles = [];
    this.roomId = 'living';
    this.obstacles = [];
    this.dayPhase = 'day';
    this.sleepAnchor = new THREE.Vector3(-3.1, 0, -1.6);
    this.sleepSurfaceY = 0.52;
    this.wakeAnchor = new THREE.Vector3(-1.5, 0, -0.25);
    this.sleepYaw = -Math.PI / 2;
    this.feedAnchor = new THREE.Vector3(2.8, 0, -1.8);
    this.feedApproach = new THREE.Vector3(2.8, 0, -1.15);
    this.bowls = { food: null, water: null };
    this.foodDisplay = null;
    this.eatingState = null;
    this.petPortraitCache = new Map();
    this.paused = false;
    this.staticPetPreview = false;
    this.lastAutonomous = 0;
    this.autonomousTarget = null;
    this.autonomousEnabled = false;
    this.activeAutonomousAction = null;
    this.autonomyHoldUntil = 0;
    this.autonomyReturnPoint = null;
    this.autonomyProvider = null;
    this.onPetGesture = null;
    this.onCleanProgress = null;
    this.onMovement = null;
    this.resizeObserver = null;
    this.secondaryPetId = null;
    this.secondaryTarget = null;
    this.secondaryWaypoints = [];
    this.secondaryLastDecision = 0;
    this.secondaryAutonomyProvider = null;
    this.secondaryAction = null;
    this.secondaryHoldUntil = 0;
    this.secondaryReturnPoint = null;
    this.weatherGroup = new THREE.Group();
    this.weatherParticles = [];
    this.worldState = { weather: 'clear', season: 'spring' };
    this.decorationRecords = [];
    this.decorationGroup = null;
    this.accessoryGroup = null;
    this.accessoryVisualGroup = null;
    this.currentAccessoryId = null;
    this.currentAccessoryAnchorType = null;
    this.accessoryFitOverrides = null;
    this.accessoryBinding = null;
    this.accessoryLoadRequest = 0;
    this.accessoryWorldPosition = new THREE.Vector3();
    this.accessoryTargetPosition = new THREE.Vector3();
    this.accessoryAnchorOffset = new THREE.Vector3();
    this.accessoryBoneQuaternion = new THREE.Quaternion();
    this.accessoryHolderQuaternion = new THREE.Quaternion();
    this.accessoryTargetQuaternion = new THREE.Quaternion();
    this.accessoryGizmo = null;
    this.accessoryGizmoEnabled = false;
    this.accessoryGizmoDragging = false;
    this.bodyLanguageState = { id: 'relaxed', intensity: 0.5 };
    this.bodyLanguageClock = 0;
    this.scentGroup = null;
    this.dreamGroup = null;
    this.dreamTheme = null;
    this.eventGroup = null;
    this.emergentEventGroup = null;
    this.emergentVisualState = null;
    this.activityGroup = null;
    this.activityState = null;
    this.contextualFocus = null;
    this.contextualFollow = false;
    this.persistentDirtMarks = [];
    this.decorationPreview = null;
    this.travelLocation = null;
    this.roomUpgradeLevels = {};
    this.defaultFurnitureTransforms = {};
    this.defaultFurnitureStored = {};
    this.defaultFurnitureObjects = [];
    this.currentRoomDimensions = null;
    this.buildCameraPan = new THREE.Vector2(0, 0);
    this.buildViewportPointer = { x: 0, y: 0, inside: false };
    this.buildGizmo = null;
    this.buildGizmoEnabled = false;
    this.buildGizmoDragging = false;
    this.buildSelectedDecorationId = null;
    this.petControlsLocked = false;
    this.ambientPopulationGroup = new THREE.Group();
    this.wildlifeGroup = new THREE.Group();
    this.robotCompanionGroup = new THREE.Group();
    this.ambientPopulation = [];
    this.wildlifePopulation = [];
    this.robotCompanions = [];
    this.looseModelCache = new Map();
    this.worldPopulationToken = 0;
    this.lastLivingWorldKey = '';
  }

  async init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf4ead8);
    this.scene.fog = null;

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 40);
    this.camera.position.set(this.baseCamera.x, this.baseCamera.y, this.baseCamera.z);
    this.camera.lookAt(this.cameraTarget);

    this.scene.add(this.environment);
    this.scene.add(this.petStage);
    this.scene.add(this.weatherGroup);
    this.scene.add(this.ambientPopulationGroup);
    this.scene.add(this.wildlifeGroup);
    this.scene.add(this.robotCompanionGroup);
    this.createLights();
    this.buildEnvironment('living');
    this.accessoryGizmo = new AccessoryTransformGizmo({
      scene: this.scene,
      camera: this.camera,
      domElement: this.canvas,
      onDraggingChange: (dragging) => { this.accessoryGizmoDragging = dragging; },
      onChange: (interaction) => {
        const fit = this.getAccessoryEditableFit();
        if (!fit) return;
        this.dispatchEvent(new CustomEvent('accessory-gizmo-change', { detail: { ...fit, ...interaction } }));
      }
    });
    this.buildGizmo = new AccessoryTransformGizmo({
      scene: this.scene,
      camera: this.camera,
      domElement: this.canvas,
      onDraggingChange: (dragging) => { this.buildGizmoDragging = dragging; },
      onChange: (interaction) => {
        const transform = this.getBuildSelectionTransform?.();
        if (!transform) return;
        this.dispatchEvent(new CustomEvent('build-gizmo-change', { detail: { ...transform, ...interaction } }));
      }
    });
    this.buildGizmo.setUniformScale(true);
    this.bindEvents();
    this.resize();
    this.running = true;
    this.animate();
  }

  async preloadAll(progressCallback = () => {}) {
    const entries = Object.values(PETS);
    let completed = 0;
    let cursor = 0;
    const workers = Array.from({ length: Math.min(3, entries.length) }, async () => {
      while (cursor < entries.length) {
        const pet = entries[cursor];
        cursor += 1;
        try {
          const response = await fetch(pet.model, { cache: 'force-cache' });
          if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
          await response.arrayBuffer();
        } catch (error) {
          console.warn(`[Pocket Companions] Could not warm the cache for ${pet.model}.`, error);
        }
        completed += 1;
        progressCallback((completed / entries.length) * 100);
      }
    });
    await Promise.all(workers);
    progressCallback(100);
  }

  loadModel(url, progressCallback = () => {}) {
    return new Promise((resolve, reject) => {
      this.loader.load(url, resolve, (event) => {
        if (event.lengthComputable && event.total > 0) progressCallback(event.loaded / event.total);
      }, (error) => {
        console.error(`[Pocket Companions] Could not load model: ${url}`, error);
        reject(new Error(`Could not load ${url.split('/').pop()}. Check that the file exists and is served by the host.`));
      });
    });
  }

  preparePet(id, gltf) {
    const model = gltf.scene;
    const normalizedAnimations = gltf.animations.map((clip) => {
      const normalizedName = clip.name.split('|').pop().trim();
      const normalizedClip = neutralizeHorizontalRootMotion(clip);
      normalizedClip.name = normalizedName;
      return normalizedClip;
    });
    const missing = ANIMATION_NAMES.filter((name) => !normalizedAnimations.some((clip) => clip.name === name));
    if (missing.length) console.warn(`[Pocket Companions] ${id} is missing animations:`, missing);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = child.isSkinnedMesh ? false : true;
      }
    });

    const stage = new THREE.Group();
    const modelHolder = new THREE.Group();
    stage.add(modelHolder);
    modelHolder.add(model);

    const initialBox = new THREE.Box3().setFromObject(model);
    const initialSize = initialBox.getSize(new THREE.Vector3());
    const profile = physicalProfile(id);
    const targetHeight = profile.targetHeight;
    const scale = targetHeight / Math.max(0.001, initialSize.y);
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= box.min.y;
    model.updateMatrixWorld(true);
    const baseModelPosition = model.position.clone();
    const baseModelRotation = model.rotation.clone();

    modelHolder.rotation.y = 0;
    stage.position.set(0, 0, 0);

    const controller = new AnimationController(model, normalizedAnimations, (sound) => this.soundPlayer(sound));
    controller.play('idle', { fade: 0.01, force: true });

    const finalBox = new THREE.Box3().setFromObject(model);
    const finalSize = finalBox.getSize(new THREE.Vector3());
    return {
      id,
      stage,
      modelHolder,
      model,
      controller,
      size: finalSize,
      baseModelPosition,
      baseModelRotation,
      floorOffset: 0,
      navigationRadius: profile.radius,
      physicalSize: profile.size,
      expressionBones: findExpressionBones(model),
      displayYaw: 0,
      loaded: true
    };
  }


  async loadLooseRecord(url, {
    targetHeight = 0.8,
    hueShift = 0,
    saturationBoost = 0,
    brightnessBoost = 0,
    stripScaleJumps = false,
    deferMotion = false
  } = {}) {
    const gltf = await this.loadModel(url);
    const model = gltf.scene;
    const animations = (gltf.animations || []).map((clip) => {
      let normalized = neutralizeHorizontalRootMotion(clip);
      if (stripScaleJumps) normalized = stripExtremeScaleTracks(normalized);
      normalized.name = clip.name.split('|').pop().trim();
      return normalized;
    });
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material?.color) {
          child.material = child.material.clone();
          const hsl = { h: 0, s: 0, l: 0 };
          child.material.color.getHSL(hsl);
          child.material.color.setHSL((hsl.h + hueShift + 1) % 1, clamp(hsl.s + saturationBoost, 0, 1), clamp(hsl.l + brightnessBoost, 0, 1));
        }
      }
    });
    const stage = new THREE.Group();
    const modelHolder = new THREE.Group();
    stage.add(modelHolder);
    modelHolder.add(model);
    const initialBox = new THREE.Box3().setFromObject(model);
    const initialSize = initialBox.getSize(new THREE.Vector3());
    const scale = targetHeight / Math.max(0.001, initialSize.y || 1);
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= box.min.y;
    model.updateMatrixWorld(true);
    const controller = animations.length ? new AnimationController(model, animations, (sound) => this.soundPlayer(sound)) : null;
    const record = {
      stage,
      modelHolder,
      model,
      controller,
      clipNames: animations.map((clip) => clip.name),
      velocity: new THREE.Vector3(),
      target: null,
      baseY: 0,
      wanderSpeed: 0.5,
      radius: 0.34,
      kind: 'ambient',
      idleClip: null,
      moveClip: null
    };
    return deferMotion ? record : configureCompanionMotion(record);
  }

  async loadLooseRecordSafe(url, options = {}) {
    try {
      return await this.loadLooseRecord(url, options);
    } catch (error) {
      console.warn(`[Pocket Companions] Modelo ambiental não carregado: ${url}`, error);
      return null;
    }
  }

  setRobotCompanionsVisible() {
    if (this.robotCompanionGroup) this.robotCompanionGroup.visible = false;
  }

  clearOutdoorPopulation() {
    for (const collection of [this.ambientPopulation, this.wildlifePopulation, this.robotCompanions]) {
      for (const entry of collection || []) {
        entry.controller?.dispose?.();
        entry.stage?.removeFromParent?.();
        this.disposeObject(entry.stage);
      }
    }
    this.ambientPopulation = [];
    this.wildlifePopulation = [];
    this.robotCompanions = [];
    [this.ambientPopulationGroup, this.wildlifeGroup, this.robotCompanionGroup].forEach((group) => {
      while (group.children.length) group.remove(group.children[0]);
    });
  }

  async setLivingWorldState({ roomId = this.roomId, inventory = {}, petId = this.currentPetId } = {}) {
    const outdoors = ['garden', 'park'].includes(roomId);
    const key = JSON.stringify({ roomId, petId, robotsEnabled: Boolean(ROBOT_COMPANIONS_ENABLED) });
    if (key === this.lastLivingWorldKey) return;
    this.lastLivingWorldKey = key;
    const token = ++this.worldPopulationToken;
    this.clearOutdoorPopulation();
    if (this.robotCompanionGroup) this.robotCompanionGroup.visible = false;
    const bounds = this.getWalkBounds(0.9);
    if (outdoors) {
      const ambientIds = Object.keys(PETS).filter((id) => id !== petId).slice(0, 3);
    for (let i = 0; i < Math.min(3, ambientIds.length); i += 1) {
      const id = ambientIds[i];
      const profile = physicalProfile(id);
      const record = await this.loadLooseRecordSafe(PETS[id].model, { targetHeight: Math.max(0.9, profile.targetHeight * (0.9 + i * 0.03)), hueShift: 0.08 * (i + 1), saturationBoost: 0.08, brightnessBoost: 0.03 });
      if (!record) continue;
      if (token !== this.worldPopulationToken) { record.controller?.dispose?.(); this.disposeObject(record.stage); return; }
      record.kind = 'ambient-pet';
      record.wanderSpeed = 0.42 + i * 0.04;
      record.target = new THREE.Vector3(randomBetween(bounds.minX, bounds.maxX), 0, randomBetween(bounds.minZ, bounds.maxZ));
      record.stage.position.copy(record.target.clone().add(new THREE.Vector3(randomBetween(-0.6, 0.6), 0, randomBetween(-0.6, 0.6))));
      this.ambientPopulation.push(record);
      this.ambientPopulationGroup.add(record.stage);
    }
    const rabbit = await this.loadLooseRecordSafe(OUTDOOR_WILDLIFE.rabbit.model, { targetHeight: 0.5 });
    if (rabbit && token !== this.worldPopulationToken) { rabbit.controller?.dispose?.(); this.disposeObject(rabbit.stage); return; }
    if (rabbit) {
      rabbit.kind = 'rabbit';
      rabbit.wanderSpeed = 0.58;
      rabbit.stage.position.set(bounds.minX + 1.4, 0, bounds.maxZ - 1.2);
      rabbit.target = new THREE.Vector3(bounds.maxX - 1.6, 0, bounds.minZ + 1.7);
      this.wildlifePopulation.push(rabbit);
      this.wildlifeGroup.add(rabbit.stage);
    }
    for (const keyId of ['butterfly', 'butterfly2']) {
      const def = OUTDOOR_WILDLIFE[keyId];
      const fly = await this.loadLooseRecordSafe(def.model, { targetHeight: def.targetHeight || 0.18 });
      if (!fly) continue;
      if (token !== this.worldPopulationToken) { fly.controller?.dispose?.(); this.disposeObject(fly.stage); return; }
      fly.kind = 'butterfly';
      fly.baseY = 1.05 + Math.random() * 0.55;
      fly.orbitRadius = 1.2 + Math.random() * 1.4;
      fly.orbitSpeed = 0.4 + Math.random() * 0.35;
      fly.phase = Math.random() * Math.PI * 2;
      fly.yawOffset = Number(def.yawOffset || 0);
      fly.center = new THREE.Vector3(randomBetween(bounds.minX + 1, bounds.maxX - 1), fly.baseY, randomBetween(bounds.minZ + 1, bounds.maxZ - 1));
      this.wildlifePopulation.push(fly);
      this.wildlifeGroup.add(fly.stage);
    }
    }
    const activeRobotId = ROBOT_COMPANIONS_ENABLED
      ? Object.keys(ROBOT_COMPANIONS).find((robotId) => inventory?.[robotId] > 0)
      : null;
    for (const robotId of (activeRobotId ? [activeRobotId] : [])) {
      const def = ROBOT_COMPANIONS[robotId];
      const robot = await this.loadLooseRecordSafe(def.model, {
        targetHeight: def.targetHeight || 0.82,
        stripScaleJumps: robotId === 'robot-cat',
        deferMotion: robotId === 'robot-cat'
      });
      if (!robot) continue;
      if (token !== this.worldPopulationToken) { robot.controller?.dispose?.(); this.disposeObject(robot.stage); return; }
      robot.kind = 'robot';
      robot.followOffset = new THREE.Vector3(robotId === 'robot-cat' ? -1.28 : 1.34, 0, robotId === 'robot-cat' ? 0.98 : 0.92);
      robot.wanderSpeed = robotId === 'robot-dog' ? 1.0 : 0.88;
      robot.lastMoveAt = 0;
      robot.forwardYawOffset = robotId === 'robot-dog' ? -Math.PI / 2 : 0;
      robot.turnRate = robotId === 'robot-dog' ? 7.5 : 8.5;
      robot.navigationRadius = robotId === 'robot-dog' ? 0.38 : 0.31;
      robot.radius = robot.navigationRadius;
      robot.pathWaypoints = [];
      robot.pathTarget = null;
      robot.lastPathAt = 0;
      configureCompanionMotion(robot, robotId === 'robot-dog'
        ? { idle: false, moveIndex: 13 }
        : { idle: false, move: ['metarigAction', 'walk', 'playing'] });
      robot.freezeOnStop = true;
      const petPosition = this.currentPet?.stage?.position?.clone?.() || new THREE.Vector3();
      const initialDesired = petPosition.add(robot.followOffset.clone());
      robot.stage.position.copy(this.findSafeEntityPosition?.(initialDesired, robot.navigationRadius, robot) || this.findSafePosition(initialDesired, robot.navigationRadius));
      this.robotCompanions.push(robot);
      this.robotCompanionGroup.add(robot.stage);
    }
  }

  updateAmbientOutdoorLife(delta, time) {
    const bounds = this.getWalkBounds(0.9);
    const updateWalker = (entry, speedMultiplier = 1) => {
      if (!entry?.stage) return;
      entry.controller?.update?.(delta);
      if (!entry.target || entry.stage.position.distanceTo(entry.target) < 0.25) {
        entry.target = new THREE.Vector3(randomBetween(bounds.minX, bounds.maxX), 0, randomBetween(bounds.minZ, bounds.maxZ));
      }
      const dir = entry.target.clone().sub(entry.stage.position);
      const dist = Math.hypot(dir.x, dir.z);
      if (dist > 0.001) {
        dir.normalize();
        const step = Math.min(dist, (entry.wanderSpeed || 0.45) * speedMultiplier * delta);
        entry.stage.position.x += dir.x * step;
        entry.stage.position.z += dir.z * step;
        entry.modelHolder.rotation.y = Math.atan2(dir.x, dir.z);
        if (entry.controller && entry.moveClip && entry.controller.currentName !== entry.moveClip) entry.controller.play(entry.moveClip, { force: true, fade: 0.18, loop: true });
      } else if (entry.controller && entry.idleClip) {
        if (entry.controller.currentName !== entry.idleClip) entry.controller.play(entry.idleClip, { force: true, fade: 0.18, loop: true });
      }
    };
    this.ambientPopulation.forEach((entry) => updateWalker(entry, 1));
    this.wildlifePopulation.forEach((entry) => {
      entry.controller?.update?.(delta);
      if (entry.kind === 'butterfly') {
        entry.phase += delta * (entry.orbitSpeed || 0.5);
        entry.stage.position.set(entry.center.x + Math.cos(entry.phase) * entry.orbitRadius, entry.baseY + Math.sin(entry.phase * 2) * 0.16, entry.center.z + Math.sin(entry.phase) * entry.orbitRadius * 0.55);
        entry.modelHolder.rotation.y = (-entry.phase) + (entry.yawOffset || 0);
      } else updateWalker(entry, 1.15);
    });
    const current = this.currentPet;
    this.robotCompanions.forEach((entry, index) => {
      entry.controller?.update?.(delta);
      if (!current?.stage || entry.stage?.visible === false) return;
      const radius = Math.max(0.22, Number(entry.navigationRadius || entry.radius) || 0.3);
      const offset = entry.followOffset || new THREE.Vector3(index ? 1.34 : -1.28, 0, index ? 0.92 : 0.98);
      const desiredRaw = current.stage.position.clone().add(offset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), current.modelHolder.rotation.y || 0));
      const desired = this.findSafeEntityPosition?.(desiredRaw, radius, entry) || this.findSafePosition(desiredRaw, radius);

      // Recover cleanly if an old save or room rebuild left the robot inside geometry or another pet.
      const currentlyInvalid = this.isBlocked(entry.stage.position.x, entry.stage.position.z, radius)
        || this.livingEntityCollisionAt?.(entry.stage.position.x, entry.stage.position.z, radius, entry, 0.03);
      if (currentlyInvalid) {
        entry.stage.position.copy(desired);
        entry.pathWaypoints = [];
        entry.pathTarget = desired.clone();
      }

      const targetChanged = !entry.pathTarget || entry.pathTarget.distanceToSquared(desired) > 0.09;
      if (targetChanged || !entry.pathWaypoints?.length) {
        entry.lastPathAt = time;
        entry.pathTarget = desired.clone();
        const route = this.findPath(entry.stage.position.clone(), desired, radius);
        entry.pathWaypoints = route.length ? route.map((point) => point.clone()) : [];
      }

      while (entry.pathWaypoints?.length && entry.stage.position.distanceTo(entry.pathWaypoints[0]) < 0.02) entry.pathWaypoints.shift();
      const moveTarget = entry.pathWaypoints?.[0] || desired;
      const direction = moveTarget.clone().sub(entry.stage.position);
      direction.y = 0;
      const distance = direction.length();
      const finalDistance = entry.stage.position.distanceTo(desired);

      if (distance > 0.01 && finalDistance > 0.1) {
        entry.lastMoveAt = time;
        direction.normalize();
        const step = Math.min(distance, (entry.wanderSpeed || 0.8) * delta);
        const next = entry.stage.position.clone().addScaledVector(direction, step);
        const blocked = this.isBlocked(next.x, next.z, radius)
          || this.livingEntityCollisionAt?.(next.x, next.z, radius, entry, 0.07);
        if (blocked) {
          entry.pathWaypoints = [];
          entry.lastPathAt = 0;
        } else {
          entry.stage.position.copy(next);
          const targetYaw = Math.atan2(direction.x, direction.z) + (entry.forwardYawOffset || 0);
          entry.modelHolder.rotation.y = dampAngle(entry.modelHolder.rotation.y, targetYaw, entry.turnRate || 8, delta);
          if (entry.controller && entry.moveClip) {
            if (entry.controller.currentName !== entry.moveClip) {
              entry.controller.play(entry.moveClip, { force: true, fade: 0.12, loop: true, timeScale: 1 });
            } else if (entry.controller.currentAction?.paused) {
              entry.controller.currentAction.paused = false;
              entry.controller.currentAction.setEffectiveTimeScale(1);
            }
          }
        }
      } else if (entry.freezeOnStop && entry.controller?.currentAction && time - (entry.lastMoveAt || 0) > 320) {
        entry.controller.currentAction.paused = true;
      } else if (entry.controller && entry.idleClip && time - (entry.lastMoveAt || 0) > 320) {
        if (entry.controller.currentName !== entry.idleClip) entry.controller.play(entry.idleClip, { force: true, fade: 0.2, loop: true });
      }
    });
  }

  async setPet(id, { selection = false } = {}) {
    if (!PETS[id]) throw new Error(`Unknown pet ${id}.`);
    const requestId = ++this.petLoadRequest;
    let record = this.pets.get(id);

    if (!record) {
      const gltf = await this.loadModel(PETS[id].model);
      record = this.preparePet(id, gltf);
      if (requestId !== this.petLoadRequest) {
        this.disposePetRecord(record);
        return false;
      }
      this.petStage.add(record.stage);
      this.pets.set(id, record);
    }

    if (requestId !== this.petLoadRequest) return false;
    for (const [key, other] of [...this.pets.entries()]) {
      if (key === id || key === this.secondaryPetId) continue;
      this.pets.delete(key);
      this.disposePetRecord(other);
    }

    if (this.accessoryBinding && this.accessoryBinding.holder !== record.modelHolder) {
      this.accessoryGroup?.removeFromParent();
      this.disposeObject(this.accessoryGroup);
      this.accessoryGroup = null;
      this.accessoryBinding = null;
    }
    this.currentPetId = id;
    if (this.secondaryPetId === id) this.secondaryPetId = null;
    record.stage.visible = true;
    record.stage.position.set(0, 0, 0);
    record.modelHolder.rotation.set(0, 0, 0);
    record.model.position.copy(record.baseModelPosition);
    record.model.rotation.copy(record.baseModelRotation);
    record.controller.play('idle', { fade: 0.24, force: true });
    this.mode = selection ? 'selection' : 'home';
    this.stopMovement('stopped');
    this.autonomousTarget = null;
    this.frameCurrentPet(selection);
    this.dispatchEvent(new CustomEvent('pet-changed', { detail: { id, selection } }));
    return true;
  }

  get currentPet() { return this.pets.get(this.currentPetId) || null; }

  frameCurrentPet(selection = false) {
    const pet = this.currentPet;
    if (!pet) return;
    const height = pet.size.y || 2.3;
    const width = pet.size.x || 1.4;
    const distance = Math.max(4.5, height * 2.15 + width * 0.55);
    this.baseCamera = selection
      ? { x: 0, y: height * 0.72, z: distance * 0.92 }
      : { x: 0, y: height * 0.8, z: distance };
    this.cameraTarget.set(0, height * 0.48, 0);
  }

  setMode(mode) {
    this.mode = mode;
    if (mode !== 'clean') this.cleanMode = false;
  }

  setStaticPetPreview(enabled = true) {
    this.staticPetPreview = Boolean(enabled);
    const pet = this.currentPet;
    if (!pet?.controller) return;

    if (this.staticPetPreview) {
      this.stopMovement('stopped');
      this.autonomousTarget = null;
      pet.model.position.copy(pet.baseModelPosition);
      pet.model.rotation.copy(pet.baseModelRotation);
      pet.modelHolder.rotation.z = 0;
      pet.controller.mixer.timeScale = 1;
      pet.controller.play('idle', { fade: 0, force: true, loop: true });
      pet.controller.mixer.setTime(0);
      pet.controller.mixer.timeScale = 0;
      this.updateAccessoryBinding?.(0);
      return;
    }

    pet.controller.mixer.timeScale = 1;
    pet.controller.play('idle', { fade: 0.12, force: true, loop: true });
  }

  setReducedMotion() {
    if (!this.renderer) return;
    const settings = this.settingsProvider();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.reducedMotion || settings.lowPerformanceMode ? 1.05 : this.isMobile() ? 1.45 : 1.8));
  }

  animate = () => {
    if (!this.running) return;
    this.frameId = requestAnimationFrame(this.animate);
    if (this.paused || document.hidden) return;
    const delta = Math.min(this.clock.getDelta(), 0.05);
    const time = performance.now();
    this.pets.forEach((record) => {
      if (record.stage.visible && !(this.staticPetPreview && record === this.currentPet)) record.controller.update(delta);
    });
    this.updateMovement(delta);
    this.updateAutonomous(time);
    this.updateSecondary(delta, time);
    this.updateWorldEffects(delta);
    this.updateAmbientOutdoorLife(delta, time);
    this.updateParticles(delta);
    if (!this.staticPetPreview) this.updateActionPose(delta);
    this.updateAccessoryBinding(delta);
    this.updateSceneNarratives?.(delta);
    if ((this.emergentVisualState || this.eventGroup) && time - (this.lastEventSpawnSafetyAt || 0) > 500) {
      this.lastEventSpawnSafetyAt = time;
      this.ensurePetOutsideObstacles?.(this.currentPet, this.currentPet?.stage?.position?.clone?.());
      const secondary = this.secondaryPetId ? this.pets?.get?.(this.secondaryPetId) : null;
      if (secondary) this.ensurePetOutsideObstacles?.(secondary, secondary.stage?.position?.clone?.());
    }
    this.updateCamera(delta);
    this.updateFurnitureOcclusion?.(delta);
    this.accessoryGizmo?.update();
    this.buildGizmo?.update();
    this.renderer.render(this.scene, this.camera);
  };

  handleViewportPointerMove = (event) => {
    if (!this.canvas || !this.buildViewportPointer) return;
    const rect = this.canvas.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    this.buildViewportPointer.x = event.clientX;
    this.buildViewportPointer.y = event.clientY;
    this.buildViewportPointer.inside = inside;
  };

  handleViewportPointerLeave = () => {
    if (this.buildViewportPointer) this.buildViewportPointer.inside = false;
  };

  handlePointerDown = (event) => {
    if (this.petControlsLocked) {
      this.selectBuildObjectAt?.(event);
      return;
    }
    this.canvas.setPointerCapture?.(event.pointerId);
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.pointerState.down = true;
    this.pointerState.dragged = false;
    this.pointerState.startX = event.clientX;
    this.pointerState.startY = event.clientY;
    this.pointerState.totalDx = 0;
    this.pointerState.totalDy = 0;
    this.pointerState.startedAt = performance.now();
    this.pointerState.lastMoveAt = this.pointerState.startedAt;
    this.pointerState.gestureSpeed = 0;
    this.pointerState.x = event.clientX;
    this.pointerState.y = event.clientY;
    if (this.activePointers.size === 2) {
      const points = [...this.activePointers.values()];
      this.pinchDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    }
    this.updatePointer(event);
    const hits = this.raycastPet();
    if (hits.length) {
      this.pointerState.onPet = true;
      if (!this.cleanMode && this.mode !== 'selection') this.interruptAutonomous?.('player-interaction');
      if (this.cleanMode) this.processCleanHit(hits[0]);
      else if (this.mode !== 'selection') this.processPetGesture(hits[0]);
    } else {
      this.pointerState.onPet = false;
    }
  };

  handlePointerMove = (event) => {
    this.handleViewportPointerMove(event);
    if (this.petControlsLocked) return;
    if (!this.pointerState.down) return;
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.activePointers.size === 2 && this.mode !== 'title') {
      const points = [...this.activePointers.values()];
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      if (this.pinchDistance) {
        const pet = this.currentPet;
        const minZoom = this.mode === 'selection' ? 2.6 : 3.0;
        const maxZoom = this.mode === 'photo' ? 15 : 12.5;
        this.baseCamera.z = clamp(this.baseCamera.z - (distance - this.pinchDistance) * 0.012, minZoom, maxZoom);
        if (pet && this.mode !== 'selection') this.baseCamera.y = clamp(this.baseCamera.y + (distance - this.pinchDistance) * -0.0035, Math.max(1.4, pet.size.y * 0.5), 7.2);
      }
      this.pinchDistance = distance;
      this.pointerState.dragged = true;
      return;
    }
    const dx = event.clientX - this.pointerState.x;
    const dy = event.clientY - this.pointerState.y;
    this.pointerState.totalDx = event.clientX - this.pointerState.startX;
    this.pointerState.totalDy = event.clientY - this.pointerState.startY;
    const movedAt = performance.now();
    const elapsed = Math.max(8, movedAt - (this.pointerState.lastMoveAt || movedAt));
    const instantSpeed = Math.hypot(dx, dy) / elapsed * 1000;
    this.pointerState.gestureSpeed = lerp(this.pointerState.gestureSpeed || 0, instantSpeed, 0.55);
    this.pointerState.lastMoveAt = movedAt;
    if (Math.abs(dx) + Math.abs(dy) > 4) this.pointerState.dragged = true;
    this.pointerState.x = event.clientX;
    this.pointerState.y = event.clientY;
    this.updatePointer(event);

    if (this.mode === 'selection' && this.currentPet) {
      if (this.pointerState.onPet) this.currentPet.modelHolder.rotation.y += dx * 0.008;
      return;
    }

    const hits = this.raycastPet();
    if (hits.length && this.cleanMode) this.processCleanHit(hits[0]);
    else if (hits.length && this.pointerState.onPet && performance.now() - this.pointerState.lastPetAt > 180) this.processPetGesture(hits[0], true);
  };

  handlePointerUp = (event) => {
    if (this.petControlsLocked) return;
    this.activePointers.delete(event.pointerId);
    if (this.activePointers.size < 2) this.pinchDistance = null;
    if (!this.pointerState.down) return;
    this.pointerState.down = this.activePointers.size > 0;
    if (this.mode === 'selection' && !this.pointerState.onPet && Math.abs(this.pointerState.totalDx) > 70) {
      this.dispatchEvent(new CustomEvent('selection-swipe', { detail: { direction: this.pointerState.totalDx < 0 ? 1 : -1 } }));
      return;
    }
    if (!this.pointerState.dragged && !this.pointerState.onPet && this.mode === 'home') {
      this.updatePointer(event);
      const point = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.floorPlane, point)) this.moveTo(point.x, point.z, false);
    }
  };

  handleWheel = (event) => {
    if (this.mode === 'title' || !this.currentPet || event.ctrlKey) return;
    const target = event.target instanceof Element ? event.target : null;
    const interactive = target?.closest?.('input, select, textarea, button, [contenteditable="true"], .drawer, .modal-card, .wardrobe-panel, .build-panel, .dev-panel, .bottom-navigation, .topbar, .primary-actions, .needs-panel, .living-tab-rail');
    if (interactive) return;
    const rect = this.canvas.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;

    event.preventDefault();
    const pet = this.currentPet;
    const minZoom = this.mode === 'selection' ? 2.45 : 2.8;
    const maxZoom = this.mode === 'photo' ? 15 : 13.5;
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1;
    const delta = clamp(event.deltaY * unit, -240, 240);
    this.baseCamera.z = clamp(this.baseCamera.z + delta * 0.0065, minZoom, maxZoom);
    if (this.mode !== 'selection') {
      this.baseCamera.y = clamp(this.baseCamera.y + delta * 0.00135, Math.max(1.35, pet.size.y * 0.48), 7.4);
    }
  };

  resize = () => {
    if (!this.renderer || !this.camera) return;
    const parent = this.canvas.parentElement;
    const width = Math.max(1, parent?.clientWidth || window.innerWidth);
    const height = Math.max(1, parent?.clientHeight || window.innerHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.setReducedMotion();
    this.renderer.setSize(width, height, false);
  };

  isMobile() { return window.matchMedia('(max-width: 760px)').matches; }

  pause(value) { this.paused = Boolean(value); }

  disposeMaterial(material) {
    if (!material) return;
    for (const value of Object.values(material)) {
      if (value?.isTexture) value.dispose?.();
    }
    material.dispose?.();
  }

  disposeObject(object) {
    object?.traverse?.((child) => {
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) child.material.forEach((material) => this.disposeMaterial(material));
      else this.disposeMaterial(child.material);
    });
  }

  disposePetRecord(record) {
    if (!record) return;
    record.controller?.dispose?.();
    record.stage?.removeFromParent?.();
    this.disposeObject(record.stage);
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.resize);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp);
    this.canvas.removeEventListener('pointerleave', this.handleViewportPointerLeave);
    window.removeEventListener('pointermove', this.handleViewportPointerMove);
    window.removeEventListener('wheel', this.handleWheel, true);
    this.restoreFurnitureOcclusion?.(true);
    this.pets.forEach((record) => this.disposePetRecord(record));
    this.pets.clear();
    this.clearOutdoorPopulation();
    this.accessoryGizmo?.dispose();
    this.accessoryGizmo = null;
    this.buildGizmo?.dispose();
    this.buildGizmo = null;
    this.renderer?.dispose();
  }
}

Object.assign(
  CompanionScene.prototype,
  environmentMethods,
  navigationMethods,
  effectsMethods,
  interactionsMethods,
  accessoriesMethods,
  mediaMethods,
  activitiesMethods,
  buildingMethods
);
