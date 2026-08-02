import * as THREE from '../vendor/three.module.js';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { PETS, ANIMATION_NAMES } from './config.js';
import { AnimationController } from './animations.js';
import { AccessoryTransformGizmo } from './accessory-gizmo.js';
import { environmentMethods } from './scene/environment.js';
import { navigationMethods } from './scene/navigation.js';
import { effectsMethods } from './scene/effects.js';
import { interactionsMethods } from './scene/interactions.js';
import { accessoriesMethods } from './scene/accessories.js';
import { mediaMethods } from './scene/media.js';
import { activitiesMethods } from './scene/activities.js';
import { physicalProfile } from './simulation/species-behaviors.js';

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
    this.scene.fog = new THREE.Fog(0xf4ead8, 9, 18);

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 40);
    this.camera.position.set(this.baseCamera.x, this.baseCamera.y, this.baseCamera.z);
    this.camera.lookAt(this.cameraTarget);

    this.scene.add(this.environment);
    this.scene.add(this.petStage);
    this.scene.add(this.weatherGroup);
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
      if (record.stage.visible) record.controller.update(delta);
    });
    this.updateMovement(delta);
    this.updateAutonomous(time);
    this.updateSecondary(delta, time);
    this.updateWorldEffects(delta);
    this.updateParticles(delta);
    this.updateActionPose(delta);
    this.updateAccessoryBinding(delta);
    this.updateSceneNarratives?.(delta);
    this.updateCamera(delta);
    this.accessoryGizmo?.update();
    this.renderer.render(this.scene, this.camera);
  };

  handlePointerDown = (event) => {
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
    if (!this.pointerState.down) return;
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.activePointers.size === 2 && (this.mode === 'selection' || this.mode === 'photo')) {
      const points = [...this.activePointers.values()];
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      if (this.pinchDistance) this.baseCamera.z = clamp(this.baseCamera.z - (distance - this.pinchDistance) * 0.012, 3.5, 8.5);
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
    if (this.mode !== 'selection' && this.mode !== 'photo') return;
    event.preventDefault();
    this.baseCamera.z = clamp(this.baseCamera.z + event.deltaY * 0.003, 3.5, 8.5);
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
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.pets.forEach((record) => this.disposePetRecord(record));
    this.pets.clear();
    this.accessoryGizmo?.dispose();
    this.accessoryGizmo = null;
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
  activitiesMethods
);
