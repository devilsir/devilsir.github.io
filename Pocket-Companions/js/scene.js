import * as THREE from '../vendor/three.module.js';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { PETS, ANIMATION_NAMES } from './config.js';
import { AnimationController } from './animations.js';
import { clamp, lerp, randomBetween } from './utils.js';
import { PET_ACCESSORY_FITS } from './living-data.js';
import { AccessoryTransformGizmo } from './accessory-gizmo.js';

const ROOM_PALETTES = {
  living: { floor: 0xe5b98f, wall: 0xf6e5cd, accent: 0xf3a36c, sky: 0xcfe8f5 },
  garden: { floor: 0x82b875, wall: 0xb8d99c, accent: 0xf4c96e, sky: 0x9fd7ed },
  bedroom: { floor: 0xc8b5c8, wall: 0xeee0ef, accent: 0x9c86bd, sky: 0xc6d9ef },
  kitchen: { floor: 0xd8c6a4, wall: 0xf4efe2, accent: 0x79b6a6, sky: 0xc9e6f0 },
  playroom: { floor: 0xe2b4ad, wall: 0xffe7ce, accent: 0x7fb4d7, sky: 0xcce6f3 },
  park: { floor: 0x78a96c, wall: 0xaecf99, accent: 0xf2b85f, sky: 0x89c8e4 },
  training: { floor: 0xb7aaa2, wall: 0xe8ddd4, accent: 0xe67f6a, sky: 0xbfdbea }
};

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
    this.velocity = new THREE.Vector3();
    this.baseCamera = { x: 0, y: 2.4, z: 6.2 };
    this.cameraTarget = new THREE.Vector3(0, 1.1, 0);
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.pointerState = { down: false, x: 0, y: 0, startX: 0, startY: 0, totalDx: 0, dragged: false, lastPetAt: 0 };
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
    this.autonomyProvider = null;
    this.onPetGesture = null;
    this.onCleanProgress = null;
    this.onMovement = null;
    this.resizeObserver = null;
    this.secondaryPetId = null;
    this.secondaryTarget = null;
    this.secondaryLastDecision = 0;
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

  createLights() {
    this.hemisphere = new THREE.HemisphereLight(0xfff3de, 0x6d786f, 2.15);
    this.scene.add(this.hemisphere);

    this.keyLight = new THREE.DirectionalLight(0xffe0b8, 3.0);
    this.keyLight.position.set(-4, 7, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.keyLight.shadow.camera.left = -7;
    this.keyLight.shadow.camera.right = 7;
    this.keyLight.shadow.camera.top = 7;
    this.keyLight.shadow.camera.bottom = -5;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.PointLight(0x8ecbff, 12, 12, 2);
    this.fillLight.position.set(4, 3, 3);
    this.scene.add(this.fillLight);

    this.lampLight = new THREE.PointLight(0xffbd73, 0, 7, 2);
    this.lampLight.position.set(3.1, 2.15, -1.7);
    this.scene.add(this.lampLight);
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
      if (normalizedName === clip.name) return clip;
      const normalizedClip = clip.clone();
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
    const targetHeight = 1.175;
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

  buildEnvironment(roomId) {
    this.travelLocation = null;
    this.roomId = roomId;
    this.windowGlass = null;
    this.obstacles = [];
    this.sleepAnchor = new THREE.Vector3(-3.1, 0, -1.6);
    this.sleepSurfaceY = 0.52;
    this.wakeAnchor = new THREE.Vector3(-1.5, 0, -0.25);
    this.sleepYaw = -Math.PI / 2;
    this.feedAnchor = new THREE.Vector3(2.8, 0, -1.8);
    this.feedApproach = new THREE.Vector3(2.8, 0, -1.15);
    this.bowls = { food: null, water: null };
    this.foodDisplay = null;
    while (this.environment.children.length) {
      const object = this.environment.children[0];
      this.environment.remove(object);
      this.disposeObject(object);
    }
    const palette = ROOM_PALETTES[roomId] || ROOM_PALETTES.living;
    const floorMaterial = new THREE.MeshStandardMaterial({ color: palette.floor, roughness: 0.92, metalness: 0 });
    const wallMaterial = new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 1 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.82 });
    const creamMaterial = new THREE.MeshStandardMaterial({ color: 0xfff5df, roughness: 0.9 });
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x9c7154, roughness: 0.92 });

    const floor = this.box(11, 0.22, 7.2, floorMaterial, 0, -0.12, 0);
    floor.receiveShadow = true;
    floor.name = 'walk-floor';
    this.environment.add(floor);

    if (roomId !== 'garden' && roomId !== 'park' && roomId !== 'training') {
      this.environment.add(this.box(11, 5.5, 0.22, wallMaterial, 0, 2.62, -3.52));
      this.environment.add(this.box(0.22, 5.5, 7.2, wallMaterial, -5.5, 2.62, 0));
    }

    if (roomId === 'living') {
      this.environment.add(this.roundedRug(4.9, 3.5, 0xf1c98f));
      this.addBed(-3.35, -1.7, accentMaterial, creamMaterial);
      this.addBowls(2.8, -1.8, accentMaterial, creamMaterial);
      this.addShelf(-4.35, 0.6, woodMaterial, creamMaterial);
      this.addWindow(1.7, -3.37, palette.sky);
      this.addLamp(3.15, -2.5, accentMaterial, creamMaterial);
      this.addDoor(4.85, -2.7, woodMaterial);
      this.addToyBasket(3.6, 1.25, woodMaterial, accentMaterial);
    } else if (roomId === 'garden') {
      this.addGarden(accentMaterial, creamMaterial, woodMaterial);
    } else if (roomId === 'bedroom') {
      this.environment.add(this.roundedRug(5.3, 3.8, 0xd6c1df));
      this.addBed(-2.8, -1.4, accentMaterial, creamMaterial, 1.35);
      this.addLamp(3.2, -2.4, accentMaterial, creamMaterial);
      this.addShelf(4.35, 0.2, woodMaterial, creamMaterial);
      this.addWindow(0.8, -3.37, palette.sky);
    } else if (roomId === 'kitchen') {
      this.addKitchen(accentMaterial, creamMaterial, woodMaterial);
    } else if (roomId === 'playroom') {
      this.environment.add(this.roundedRug(6, 4.4, 0xf2c4aa));
      this.addToyBasket(-3.7, -1.5, woodMaterial, accentMaterial);
      this.addToyShapes();
      this.addShelf(4.35, 0.4, woodMaterial, creamMaterial);
    } else if (roomId === 'park') {
      this.addPark(accentMaterial, creamMaterial, woodMaterial);
    } else if (roomId === 'training') {
      this.addTraining(accentMaterial, creamMaterial, woodMaterial);
    }
    this.configureObstacles(roomId);
    this.applyLighting();
    this.setWorldState(this.worldState);
    this.setDecorations(this.decorationRecords);
  }

  configureObstacles(roomId) {
    const add = (x, z, width, depth) => this.obstacles.push({
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2
    });
    if (roomId === 'living') {
      add(-3.35, -1.7, 2.55, 1.95);
      add(3.3, -1.8, 2.05, 1.05);
      add(-4.35, 0.6, 1.75, 0.95);
      add(3.15, -2.5, 1.25, 1.15);
      add(3.6, 1.25, 1.65, 1.3);
    } else if (roomId === 'garden') {
      add(-3.8, -2.0, 2.5, 2.5);
      add(3.65, 1.45, 2.5, 1.15);
    } else if (roomId === 'bedroom') {
      add(-2.8, -1.4, 3.3, 2.45);
      add(3.2, -2.4, 1.3, 1.15);
      add(4.35, 0.2, 1.75, 0.95);
    } else if (roomId === 'kitchen') {
      add(0, -2.8, 9.1, 1.55);
      add(0.8, 0.5, 3.9, 2.45);
      add(-2.3, -1.3, 2.1, 1.1);
    } else if (roomId === 'playroom') {
      add(-3.7, -1.5, 1.7, 1.35);
      add(4.35, 0.4, 1.75, 0.95);
    } else if (roomId === 'park') {
      add(-3.55, 1.6, 2.6, 1.2);
    } else if (roomId === 'training') {
      for (let i = 0; i < 4; i += 1) add(-3 + i * 2, -0.3 + (i % 2) * 1.2, 1.8, 0.6);
      add(3.4, 2.1, 2.75, 2.0);
    }
  }

  isBlocked(x, z, radius = 0.34) {
    return this.obstacles.some((obstacle) =>
      x + radius > obstacle.minX && x - radius < obstacle.maxX &&
      z + radius > obstacle.minZ && z - radius < obstacle.maxZ
    );
  }

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
  }

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
  }

  box(width, height, depth, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  roundedRug(width, depth, color) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(Math.min(width, depth) * 0.5, Math.min(width, depth) * 0.5, 0.05, 32),
      new THREE.MeshStandardMaterial({ color, roughness: 1 })
    );
    mesh.scale.set(width / Math.min(width, depth), 1, depth / Math.min(width, depth));
    mesh.position.y = 0.03;
    mesh.receiveShadow = true;
    return mesh;
  }

  addBed(x, z, accent, cream, scale = 1) {
    const bed = new THREE.Group();
    bed.position.set(x, 0, z);
    bed.scale.setScalar(scale);
    bed.add(this.box(2.0, 0.3, 1.35, accent, 0, 0.18, 0));
    bed.add(this.box(1.55, 0.22, 0.9, cream, 0.12, 0.39, 0.02));
    const pillow = this.box(0.55, 0.19, 0.7, cream, -0.58, 0.57, 0.02);
    pillow.rotation.z = -0.12;
    bed.add(pillow);
    this.environment.add(bed);
    this.sleepAnchor = new THREE.Vector3(x - 0.08 * scale, 0, z + 0.02 * scale);
    this.sleepSurfaceY = 0.52 * scale;
    this.wakeAnchor = new THREE.Vector3(x + 1.35 * scale + 0.45, 0, z + 0.85 * scale + 0.55);
    this.sleepYaw = -Math.PI / 2;
    return bed;
  }

  addBowls(x, z, accent, cream) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const bowlSet = [];
    for (let i = 0; i < 2; i += 1) {
      const bowlGroup = new THREE.Group();
      bowlGroup.position.set(i * 1.05, 0.02, 0);
      const bowlProfile = [
        new THREE.Vector2(0.29, 0.01),
        new THREE.Vector2(0.42, 0.22),
        new THREE.Vector2(0.34, 0.205),
        new THREE.Vector2(0.235, 0.065),
        new THREE.Vector2(0.29, 0.01)
      ];
      const shell = new THREE.Mesh(
        new THREE.LatheGeometry(bowlProfile, 32),
        i ? cream : accent
      );
      shell.castShadow = true;
      shell.receiveShadow = true;
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.38, 0.035, 10, 32),
        new THREE.MeshStandardMaterial({ color: i ? 0xf7ebcf : 0xffd9a3, roughness: 0.75 })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.218;
      bowlGroup.add(shell, rim);

      const contentGroup = new THREE.Group();
      contentGroup.position.set(0, 0.17, 0);
      contentGroup.visible = false;
      bowlGroup.add(contentGroup);
      bowlSet.push({ bowlGroup, contentGroup });
      group.add(bowlGroup);
    }
    this.environment.add(group);
    this.bowls.food = bowlSet[0];
    this.bowls.water = bowlSet[1];
    this.feedAnchor = new THREE.Vector3(x, 0, z);
    this.feedApproach = new THREE.Vector3(x + 0.5, 0, z + 1.12);
    return group;
  }

  clearBowlContents() {
    ['food', 'water'].forEach((key) => {
      const entry = this.bowls[key];
      if (!entry?.contentGroup) return;
      while (entry.contentGroup.children.length) {
        const child = entry.contentGroup.children[0];
        entry.contentGroup.remove(child);
        this.disposeObject(child);
      }
      entry.contentGroup.visible = false;
    });
    this.foodDisplay = null;
  }

  showBowlContents(foodId) {
    this.clearBowlContents();
    const key = foodId === 'water' ? 'water' : 'food';
    const entry = this.bowls[key];
    if (!entry?.contentGroup) return;
    const group = entry.contentGroup;
    if (foodId === 'water') {
      const surface = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.22, 0.03, 24),
        new THREE.MeshPhysicalMaterial({ color: 0x9edff6, transparent: true, opacity: 0.88, roughness: 0.08, transmission: 0.28 })
      );
      surface.position.y = 0.0;
      group.add(surface);
    } else {
      const color = foodId === 'treat' ? 0xffc36b : foodId === 'snack' ? 0xd39a59 : 0x9f7b57;
      for (let i = 0; i < 10; i += 1) {
        const kibble = new THREE.Mesh(
          new THREE.DodecahedronGeometry(randomBetween(0.035, 0.055), 0),
          new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
        );
        kibble.position.set(randomBetween(-0.18, 0.18), randomBetween(-0.01, 0.03), randomBetween(-0.16, 0.16));
        kibble.rotation.set(randomBetween(0, 1), randomBetween(0, 1), randomBetween(0, 1));
        group.add(kibble);
      }
      if (foodId === 'meal') {
        for (let i = 0; i < 3; i += 1) {
          const garnish = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 8, 7),
            new THREE.MeshStandardMaterial({ color: i % 2 ? 0x8bc46f : 0xe6a366, roughness: 0.8 })
          );
          garnish.position.set(randomBetween(-0.15, 0.15), 0.03, randomBetween(-0.15, 0.15));
          group.add(garnish);
        }
      }
    }
    group.visible = true;
    this.foodDisplay = { foodId, entry };
  }

  getFeedApproach(foodId = 'meal') {
    const desired = this.feedApproach.clone();
    desired.x = this.feedAnchor.x + (foodId === 'water' ? 0.78 : 0.22);
    return this.findSafePosition(desired);
  }

  async playEatingSequence(foodId, duration = 1800) {
    const pet = this.currentPet;
    if (!pet) return;
    this.clearMovementPath();
    pet.stage.position.copy(this.getFeedApproach(foodId));
    const bowlPoint = (foodId === 'water' ? this.feedAnchor.clone().add(new THREE.Vector3(1.05, 0, 0)) : this.feedAnchor.clone());
    pet.controller.play('idle', { fade: 0.2, force: true, timeScale: 1.08 });
    pet.modelHolder.rotation.y = Math.atan2(bowlPoint.x - pet.stage.position.x, bowlPoint.z - pet.stage.position.z);
    this.eatingState = { foodId, timeLeft: duration / 1000, total: duration / 1000, elapsed: 0, bowlPoint };
    await new Promise((resolve) => setTimeout(resolve, duration));
    this.eatingState = null;
    pet.model.position.copy(pet.baseModelPosition);
    pet.model.rotation.copy(pet.baseModelRotation);
    this.clearBowlContents();
  }

  addShelf(x, z, wood, cream) {
    const shelf = new THREE.Group();
    shelf.position.set(x, 0, z);
    shelf.add(this.box(1.4, 0.18, 0.55, wood, 0, 0.9, 0));
    shelf.add(this.box(1.4, 0.18, 0.55, wood, 0, 1.8, 0));
    shelf.add(this.box(0.15, 2.05, 0.55, wood, -0.62, 1.05, 0));
    shelf.add(this.box(0.15, 2.05, 0.55, wood, 0.62, 1.05, 0));
    for (let i = 0; i < 4; i += 1) {
      const item = this.box(0.2 + i * 0.03, 0.45 + (i % 2) * 0.2, 0.25, cream, -0.45 + i * 0.29, 1.16, 0);
      item.rotation.z = (i - 2) * 0.05;
      shelf.add(item);
    }
    this.environment.add(shelf);
  }

  addWindow(x, z, skyColor) {
    const frame = new THREE.Group();
    frame.position.set(x, 2.3, z);
    const glass = this.box(2.6, 1.65, 0.08, new THREE.MeshStandardMaterial({ color: skyColor, emissive: skyColor, emissiveIntensity: 0.18, roughness: 0.45 }), 0, 0, 0);
    frame.add(glass);
    const wood = new THREE.MeshStandardMaterial({ color: 0xf8f1df, roughness: 0.8 });
    frame.add(this.box(2.85, 0.16, 0.16, wood, 0, 0.9, 0.05));
    frame.add(this.box(2.85, 0.16, 0.16, wood, 0, -0.9, 0.05));
    frame.add(this.box(0.16, 1.95, 0.16, wood, -1.43, 0, 0.05));
    frame.add(this.box(0.16, 1.95, 0.16, wood, 1.43, 0, 0.05));
    frame.add(this.box(0.12, 1.75, 0.14, wood, 0, 0, 0.06));
    frame.add(this.box(2.65, 0.12, 0.14, wood, 0, 0, 0.06));
    this.environment.add(frame);
    this.windowGlass = glass;
  }

  addLamp(x, z, accent, cream) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.add(this.box(0.22, 1.7, 0.22, accent, 0, 0.85, 0));
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.8, 24, 1, true), cream);
    shade.position.y = 1.8;
    shade.rotation.x = Math.PI;
    shade.castShadow = true;
    group.add(shade);
    this.environment.add(group);
  }

  addDoor(x, z, wood) {
    const door = this.box(1.45, 2.65, 0.18, wood, x, 1.32, z);
    door.rotation.y = -0.03;
    this.environment.add(door);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe6bd5d, metalness: 0.45, roughness: 0.35 }));
    knob.position.set(x - 0.43, 1.32, z + 0.16);
    this.environment.add(knob);
  }

  addToyBasket(x, z, wood, accent) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const basket = this.box(1.2, 0.65, 0.85, wood, 0, 0.34, 0);
    basket.rotation.z = 0.02;
    group.add(basket);
    for (let i = 0; i < 4; i += 1) {
      const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 + i * 0.025, 1), i % 2 ? accent : new THREE.MeshStandardMaterial({ color: 0xffe081, roughness: 0.8 }));
      ball.position.set(-0.42 + i * 0.28, 0.75 + (i % 2) * 0.12, 0);
      ball.castShadow = true;
      group.add(ball);
    }
    this.environment.add(group);
  }

  addGarden(accent, cream, wood) {
    const path = this.box(3.2, 0.05, 7.1, new THREE.MeshStandardMaterial({ color: 0xd7c399, roughness: 1 }), 0, 0.03, 0);
    path.receiveShadow = true;
    this.environment.add(path);
    for (let i = 0; i < 20; i += 1) {
      const flower = new THREE.Group();
      const x = randomBetween(-5, 5);
      const z = randomBetween(-3.2, 3.2);
      if (Math.abs(x) < 1.8) continue;
      const stem = this.box(0.05, randomBetween(0.25, 0.45), 0.05, new THREE.MeshStandardMaterial({ color: 0x4e8a58 }), 0, 0.18, 0);
      flower.add(stem);
      const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), i % 2 ? accent : cream);
      head.position.y = 0.4;
      flower.add(head);
      flower.position.set(x, 0, z);
      this.environment.add(flower);
    }
    const treeTrunk = this.box(0.55, 2.4, 0.55, wood, -4.1, 1.2, -2.15);
    this.environment.add(treeTrunk);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x5d9b66, roughness: 0.95 });
    for (let i = 0; i < 4; i += 1) {
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), crownMat);
      crown.position.set(-4.1 + (i % 2) * 0.7, 2.55 + (i > 1 ? 0.55 : 0), -2.15 + (i % 2 ? 0.35 : -0.2));
      crown.castShadow = true;
      this.environment.add(crown);
    }
    this.addBench(3.65, 1.45, wood);
  }

  addBench(x, z, wood) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.add(this.box(2, 0.18, 0.55, wood, 0, 0.65, 0));
    group.add(this.box(2, 0.16, 0.45, wood, 0, 1.15, 0.18));
    group.add(this.box(0.18, 0.65, 0.18, wood, -0.75, 0.33, 0));
    group.add(this.box(0.18, 0.65, 0.18, wood, 0.75, 0.33, 0));
    this.environment.add(group);
  }

  addKitchen(accent, cream, wood) {
    const counter = this.box(8.5, 1.1, 1.1, cream, 0, 0.55, -2.8);
    this.environment.add(counter);
    for (let i = 0; i < 5; i += 1) {
      this.environment.add(this.box(1.3, 0.82, 0.12, wood, -3.2 + i * 1.6, 0.52, -2.18));
    }
    const table = this.box(3.2, 0.22, 1.8, wood, 0.8, 0.95, 0.5);
    this.environment.add(table);
    for (const x of [-0.45, 2.05]) for (const z of [-0.05, 1.05]) this.environment.add(this.box(0.16, 0.9, 0.16, wood, x, 0.45, z));
    this.addBowls(-2.8, -1.3, accent, cream);
  }

  addToyShapes() {
    const materials = [0xff9a78, 0x7bc5de, 0xf5d16e, 0xa78bd1].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
    for (let i = 0; i < 7; i += 1) {
      const geo = i % 2 ? new THREE.IcosahedronGeometry(0.35, 1) : new THREE.BoxGeometry(0.55, 0.55, 0.55);
      const shape = new THREE.Mesh(geo, materials[i % materials.length]);
      shape.position.set(randomBetween(-3, 3), 0.35, randomBetween(-2, 2));
      shape.rotation.set(randomBetween(0, 1), randomBetween(0, 1), randomBetween(0, 1));
      shape.castShadow = true;
      this.environment.add(shape);
    }
  }

  addPark(accent, cream, wood) {
    const path = this.box(2.2, 0.05, 7.1, new THREE.MeshStandardMaterial({ color: 0xd8c6a1, roughness: 1 }), 0.9, 0.03, 0);
    this.environment.add(path);
    this.addBench(-3.55, 1.6, wood);
    this.addToyShapes();
    for (let i = 0; i < 8; i += 1) {
      const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(randomBetween(0.45, 0.75), 1), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x5a9564 : 0x70a86b, roughness: 1 }));
      bush.position.set(randomBetween(-5, 5), 0.45, randomBetween(-3, 3));
      bush.castShadow = true;
      this.environment.add(bush);
    }
  }

  addTraining(accent, cream, wood) {
    for (let i = 0; i < 4; i += 1) {
      const hurdle = new THREE.Group();
      hurdle.position.set(-3 + i * 2, 0, -0.3 + (i % 2) * 1.2);
      hurdle.add(this.box(0.12, 0.8 + i * 0.08, 0.12, wood, -0.65, 0.4, 0));
      hurdle.add(this.box(0.12, 0.8 + i * 0.08, 0.12, wood, 0.65, 0.4, 0));
      hurdle.add(this.box(1.45, 0.14, 0.14, i % 2 ? accent : cream, 0, 0.72 + i * 0.08, 0));
      this.environment.add(hurdle);
    }
    const platform = this.box(2.4, 0.45, 1.7, accent, 3.4, 0.23, 2.1);
    this.environment.add(platform);
  }

  applyLighting(forcedPhase = null) {
    const settings = this.settingsProvider();
    let phase = forcedPhase;
    if (!phase) {
      if (!settings.realTimeLighting) phase = settings.fixedVisualTime || 'day';
      else {
        const hour = new Date().getHours();
        phase = hour < 7 ? 'night' : hour < 11 ? 'morning' : hour < 17 ? 'day' : hour < 20 ? 'sunset' : 'night';
      }
    }
    this.dayPhase = phase;
    const states = {
      morning: { bg: 0xf7dfc2, hemi: 1.9, key: 2.4, fill: 7, lamp: 0 },
      day: { bg: 0xdceef1, hemi: 2.2, key: 3.0, fill: 10, lamp: 0 },
      sunset: { bg: 0xe8b9a0, hemi: 1.35, key: 2.15, fill: 5, lamp: 4 },
      night: { bg: 0x222b46, hemi: 0.65, key: 0.75, fill: 2.2, lamp: 12 }
    };
    const state = states[phase] || states.day;
    this.scene.background.setHex(state.bg);
    this.scene.fog.color.setHex(state.bg);
    this.hemisphere.intensity = state.hemi;
    this.keyLight.intensity = state.key;
    this.fillLight.intensity = state.fill;
    this.lampLight.intensity = state.lamp;
    if (this.windowGlass) {
      this.windowGlass.material.color.setHex(state.bg);
      this.windowGlass.material.emissive.setHex(state.bg);
      this.windowGlass.material.emissiveIntensity = phase === 'night' ? 0.06 : 0.22;
    }
    this.dispatchEvent(new CustomEvent('dayphase', { detail: { phase } }));
  }

  placePetOnBed() {
    const pet = this.currentPet;
    if (!pet) return;
    this.clearMovementPath();
    pet.model.position.copy(pet.baseModelPosition);
    pet.model.rotation.copy(pet.baseModelRotation);
    pet.model.rotation.z = -Math.PI / 2;
    pet.modelHolder.rotation.set(0, this.sleepYaw, 0);
    pet.stage.position.set(this.sleepAnchor.x, 0, this.sleepAnchor.z);
    pet.stage.updateMatrixWorld(true);

    let box = new THREE.Box3().setFromObject(pet.model);
    let center = box.getCenter(new THREE.Vector3());
    pet.stage.position.x += this.sleepAnchor.x - center.x;
    pet.stage.position.z += this.sleepAnchor.z - center.z;
    pet.stage.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(pet.model);
    pet.stage.position.y += this.sleepSurfaceY - box.min.y + 0.015;
    pet.stage.updateMatrixWorld(true);
  }

  wakePetFromBed() {
    const pet = this.currentPet;
    if (!pet) return;
    this.clearMovementPath();
    pet.model.position.copy(pet.baseModelPosition);
    pet.model.rotation.copy(pet.baseModelRotation);
    pet.modelHolder.rotation.set(0, 0, 0);
    pet.stage.position.copy(this.findSafePosition(this.wakeAnchor));
    pet.stage.position.y = 0;
  }

  enterSleepMode(sleeping) {
    const pet = this.currentPet;
    if (sleeping) {
      this.applyLighting('night');
      this.mode = 'sleep';
      if (pet) {
        this.placePetOnBed();
        const sleepClip = ['sleep', 'lying_down_idle', 'lie_down', 'idle'].find((name) => pet.controller.has(name)) || 'idle';
        pet.controller.play(sleepClip, {
          fade: 0.6,
          loop: sleepClip === 'sleep' || sleepClip.endsWith('_idle') || sleepClip === 'idle',
          timeScale: sleepClip === 'idle' ? 0.52 : 1,
          force: true
        });
      }
      this.frameCurrentPet(false);
      this.baseCamera.y = Math.max(this.baseCamera.y, this.sleepSurfaceY + 1.15);
      this.baseCamera.z *= 0.92;
    } else {
      this.applyLighting();
      this.mode = 'home';
      if (pet) {
        this.wakePetFromBed();
        const wakeClip = ['get_up_from_lying_down', 'get_up_from_sitting'].find((name) => pet.controller.has(name));
        if (wakeClip) {
          const action = pet.controller.play(wakeClip, { fade: 0.3, loop: false, timeScale: 1, force: true });
          const duration = action?.getClip?.().duration || 1.2;
          window.setTimeout(() => {
            if (this.currentPet === pet && this.mode === 'home') pet.controller.play('idle', { fade: 0.28, force: true });
          }, Math.max(450, duration * 1000));
        } else {
          pet.controller.play('idle', { fade: 0.4, timeScale: 1, force: true });
        }
      }
      this.frameCurrentPet(false);
    }
  }

  startCleanMode() {
    this.cleanMode = true;
    this.cleanProgress = 0;
    this.mode = 'clean';
    this.clearMovementPath();
    this.currentPet?.controller.play('idle', { fade: 0.25, timeScale: 0.78, force: true });
    this.seedDirtMarks();
  }

  stopCleanMode() {
    this.cleanMode = false;
    this.mode = 'home';
    this.currentPet?.controller.play('idle', { fade: 0.25, force: true });
    this.bubbles.forEach((bubble) => this.scene.remove(bubble.mesh));
    this.bubbles = [];
    this.foamMarks.forEach((foam) => {
      this.scene.remove(foam.group);
      foam.group.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    });
    this.foamMarks = [];
    this.dirtMarks.forEach((dirt) => {
      if (dirt.group.parent) dirt.group.parent.remove(dirt.group);
      dirt.group.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    });
    this.dirtMarks = [];
    this.waterDrops.forEach((drop) => {
      this.scene.remove(drop.mesh);
      drop.mesh.geometry.dispose();
      drop.mesh.material.dispose();
    });
    this.waterDrops = [];
  }

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
  }

  getRoomSpawn(roomId = this.roomId) {
    const spawns = {
      living: new THREE.Vector3(0, 0, 0.65),
      garden: new THREE.Vector3(0, 0, 0.15),
      bedroom: new THREE.Vector3(0.6, 0, 1.2),
      kitchen: new THREE.Vector3(3.55, 0, 1.65),
      playroom: new THREE.Vector3(0, 0, 0.75),
      park: new THREE.Vector3(0.35, 0, -0.2),
      training: new THREE.Vector3(-4.1, 0, -2.25)
    };
    return this.findSafePosition(spawns[roomId] || new THREE.Vector3(0, 0, 0.8));
  }

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
  }

  clearMovementPath() {
    this.target = null;
    this.pathWaypoints = [];
    this.finalTarget = null;
    this.pathRun = false;
    this.repathAttempts = 0;
  }

  stopMovement(outcome = 'stopped') {
    const pet = this.currentPet;
    this.clearMovementPath();
    this.movementOutcome = outcome;
    if (pet) pet.controller.play('idle', { fade: 0.2 });
    this.onMovement?.(outcome === 'blocked' ? 'blocked' : 'stop');
    if (outcome === 'blocked') this.dispatchEvent(new CustomEvent('path-blocked'));
  }

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
  }

  moveTo(x, z, run = false) {
    const pet = this.currentPet;
    if (!pet || this.mode === 'selection' || this.mode === 'sleep' || this.cleanMode) return false;
    const destination = this.findSafePosition(new THREE.Vector3(clamp(x, -4.4, 4.4), 0, clamp(z, -2.75, 2.75)));
    const route = this.findPath(pet.stage.position.clone(), destination);
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
  }

  triggerJump() { return this.currentPet?.controller.jumpSequence(); }

  playAnimation(name, options = {}) { return this.currentPet?.controller.play(name, options); }

  spawnParticles(type = 'heart', count = 7, worldPosition = null) {
    const pet = this.currentPet;
    if (!pet) return;
    const origin = worldPosition || pet.stage.position.clone().add(new THREE.Vector3(0, pet.size.y * 0.62, 0));
    const colors = type === 'clean' ? [0x9ee8ff, 0xffffff] : type === 'star' ? [0xffe477, 0xffb66f] : [0xff91b8, 0xffd4e3];
    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(
        type === 'star' ? new THREE.OctahedronGeometry(0.07, 0) : new THREE.SphereGeometry(0.055, 8, 6),
        new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.95 })
      );
      mesh.position.copy(origin).add(new THREE.Vector3(randomBetween(-0.42, 0.42), randomBetween(-0.1, 0.45), randomBetween(-0.22, 0.22)));
      this.scene.add(mesh);
      this.particles.push({ mesh, life: randomBetween(0.7, 1.2), velocity: new THREE.Vector3(randomBetween(-0.18, 0.18), randomBetween(0.5, 0.9), randomBetween(-0.08, 0.08)) });
    }
  }

  addBubble(point) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(randomBetween(0.045, 0.095), 10, 8),
      new THREE.MeshPhysicalMaterial({ color: 0xc9f4ff, transparent: true, opacity: 0.68, roughness: 0.15, transmission: 0.2 })
    );
    mesh.position.copy(point).addScaledVector(new THREE.Vector3(randomBetween(-1, 1), randomBetween(0, 1), randomBetween(-1, 1)).normalize(), 0.08);
    this.scene.add(mesh);
    this.bubbles.push({ mesh, life: randomBetween(1.4, 2.6), velocity: randomBetween(0.1, 0.24) });
  }

  addFoam(point) {
    const group = new THREE.Group();
    const bubbleCount = Math.floor(randomBetween(5, 9));
    for (let i = 0; i < bubbleCount; i += 1) {
      const radius = randomBetween(0.028, 0.082);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 8, 7),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe7f9ff, emissiveIntensity: 0.18, transparent: true, opacity: randomBetween(0.8, 0.96), roughness: 0.34, metalness: 0 })
      );
      mesh.position.set(randomBetween(-0.11, 0.11), randomBetween(-0.02, 0.12), randomBetween(-0.08, 0.08));
      group.add(mesh);
    }
    group.position.copy(point).add(new THREE.Vector3(randomBetween(-0.04, 0.04), randomBetween(0.01, 0.05), randomBetween(-0.04, 0.04)));
    group.rotation.set(randomBetween(-0.4, 0.4), randomBetween(-0.6, 0.6), randomBetween(-0.3, 0.3));
    this.scene.add(group);
    const foamLife = randomBetween(1.7, 2.8);
    this.foamMarks.push({ group, life: foamLife, maxLife: foamLife, drift: randomBetween(0.005, 0.018) });
    if (this.foamMarks.length > 90) {
      const oldest = this.foamMarks.shift();
      if (oldest) {
        this.scene.remove(oldest.group);
        oldest.group.traverse((child) => {
          if (child.isMesh) { child.geometry.dispose(); child.material.dispose(); }
        });
      }
    }
  }

  seedDirtMarks() {
    const pet = this.currentPet;
    if (!pet) return;
    this.dirtMarks.forEach((dirt) => {
      if (dirt.group.parent) dirt.group.parent.remove(dirt.group);
      dirt.group.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    });
    this.dirtMarks = [];
    const width = pet.size.x || 1.1;
    const height = pet.size.y || 2.2;
    const depth = pet.size.z || 0.9;
    const count = 16;
    for (let i = 0; i < count; i += 1) {
      const group = new THREE.Group();
      const blobs = Math.floor(randomBetween(3, 7));
      for (let j = 0; j < blobs; j += 1) {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(randomBetween(0.035, 0.085), 7, 6),
          new THREE.MeshStandardMaterial({ color: j % 2 === 0 ? 0x8b6a4b : 0x6f5136, transparent: true, opacity: randomBetween(0.62, 0.85), roughness: 0.95, metalness: 0 })
        );
        mesh.scale.set(randomBetween(0.8, 1.4), randomBetween(0.35, 0.75), randomBetween(0.22, 0.5));
        mesh.position.set(randomBetween(-0.08, 0.08), randomBetween(-0.04, 0.04), randomBetween(-0.03, 0.03));
        group.add(mesh);
      }
      group.position.set(
        randomBetween(-width * 0.22, width * 0.22),
        randomBetween(height * 0.15, height * 0.88),
        randomBetween(-depth * 0.12, depth * 0.18)
      );
      group.rotation.set(randomBetween(-0.55, 0.55), randomBetween(-0.8, 0.8), randomBetween(-0.25, 0.25));
      pet.model.add(group);
      this.dirtMarks.push({ group, cleaned: false });
    }
  }

  cleanNearbyDirt(worldPoint) {
    let cleaned = 0;
    const point = worldPoint.clone();
    for (const dirt of this.dirtMarks) {
      if (dirt.cleaned) continue;
      const dirtPos = new THREE.Vector3();
      dirt.group.getWorldPosition(dirtPos);
      if (dirtPos.distanceTo(point) < 0.34) {
        dirt.cleaned = true;
        cleaned += 1;
        dirt.group.traverse((child) => {
          if (child.isMesh) child.material.opacity *= 0.28;
        });
        dirt.group.scale.multiplyScalar(0.75);
      }
    }
    this.dirtMarks = this.dirtMarks.filter((dirt) => {
      if (!dirt.cleaned) return true;
      if (dirt.group.parent) dirt.group.parent.remove(dirt.group);
      dirt.group.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      return false;
    });
    return cleaned;
  }

  addWaterSplash(point) {
    const count = Math.floor(randomBetween(4, 8));
    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(randomBetween(0.018, 0.042), 8, 7),
        new THREE.MeshPhysicalMaterial({ color: 0x9ee8ff, emissive: 0xd8fbff, emissiveIntensity: 0.1, transparent: true, opacity: 0.88, roughness: 0.08, transmission: 0.25 })
      );
      mesh.position.copy(point).add(new THREE.Vector3(randomBetween(-0.02, 0.02), randomBetween(0.01, 0.03), randomBetween(-0.02, 0.02)));
      this.scene.add(mesh);
      this.waterDrops.push({
        mesh,
        life: randomBetween(0.45, 0.85),
        velocity: new THREE.Vector3(randomBetween(-0.26, 0.26), randomBetween(0.2, 0.55), randomBetween(-0.16, 0.16))
      });
    }
  }

  setAutonomous(enabled) {
    this.autonomousEnabled = enabled;
    if (!enabled) this.autonomousTarget = null;
  }

  setAutonomyProvider(provider) { this.autonomyProvider = typeof provider === 'function' ? provider : null; }

  autonomousPoint(target) {
    const points = {
      bed: this.sleepAnchor.clone(), food: this.feedApproach.clone(), water: this.feedApproach.clone().add(new THREE.Vector3(0.75,0,0)),
      player: new THREE.Vector3(0,0,1.75), window: new THREE.Vector3(-3.2,0,-0.45), safe: new THREE.Vector3(-2.45,0,1.45),
      toy: new THREE.Vector3(2.1,0,0.85), favorite: new THREE.Vector3(-1.5,0,0.65), friend: this.secondaryPetId ? this.pets.get(this.secondaryPetId)?.stage.position.clone() : null
    };
    if (target === 'roam' || !points[target]) return new THREE.Vector3(randomBetween(-3.2,3.2),0,randomBetween(-2.0,2.0));
    return points[target];
  }

  updateAutonomous(time) {
    if (!this.autonomousEnabled || this.mode !== 'home' || this.target || !this.currentPet) return;
    const settings = this.settingsProvider();
    const interval = settings.reducedMotion ? 19000 : 11000;
    if (time - this.lastAutonomous < interval) return;
    this.lastAutonomous = time;
    const action = this.autonomyProvider?.() || { id: 'explore', target: 'roam', run: Math.random() > 0.72 };
    if (!action) return;
    const point = this.findSafePosition(this.autonomousPoint(action.target));
    const moved = this.moveTo(point.x, point.z, Boolean(action.run));
    if (action.animation && !moved) this.currentPet.controller.play(action.animation, { force: true, fade: 0.25, loop: action.animation.endsWith('_idle') });
    this.dispatchEvent(new CustomEvent('autonomous', { detail: action }));
  }

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
      if (this.isBlocked(next.x, next.z)) {
        blocked = true;
        break;
      }
      position.copy(next);
    }

    if (blocked) {
      if (this.finalTarget && this.repathAttempts < 2) {
        this.repathAttempts += 1;
        const route = this.findPath(position.clone(), this.finalTarget);
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
    this.onMovement?.(running ? 'run' : 'walk');
  }

  smoothAngle(current, target, amount) {
    let delta = (target - current + Math.PI) % (Math.PI * 2) - Math.PI;
    if (delta < -Math.PI) delta += Math.PI * 2;
    return current + delta * amount;
  }

  updateCamera(delta) {
    const pet = this.currentPet;
    const settings = this.settingsProvider();
    const ease = settings.reducedMotion ? 1 : Math.min(1, delta * 3.5);
    const focus = pet ? pet.stage.position.clone().add(new THREE.Vector3(0, pet.size.y * 0.47, 0)) : this.cameraTarget;
    let desired = new THREE.Vector3(this.baseCamera.x, this.baseCamera.y, this.baseCamera.z);
    if (pet && this.mode !== 'selection') {
      desired.x += pet.stage.position.x * 0.22;
      desired.z += pet.stage.position.z * 0.2;
      if (this.target?.run) desired.z += 0.65;
      if (this.mode === 'clean') desired.z -= 0.85;
    }
    if (settings.reducedMotion) {
      this.camera.position.copy(desired);
    } else {
      this.camera.position.lerp(desired, ease);
    }
    this.cameraTarget.lerp(focus, ease);
    this.camera.lookAt(this.cameraTarget);
  }

  updateParticles(delta) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      particle.life -= delta;
      particle.mesh.position.addScaledVector(particle.velocity, delta);
      particle.mesh.material.opacity = clamp(particle.life, 0, 1);
      particle.mesh.scale.multiplyScalar(1 + delta * 0.25);
      if (particle.life <= 0) {
        this.scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        particle.mesh.material.dispose();
        this.particles.splice(i, 1);
      }
    }
    for (let i = this.waterDrops.length - 1; i >= 0; i -= 1) {
      const drop = this.waterDrops[i];
      drop.life -= delta;
      drop.velocity.y -= 1.2 * delta;
      drop.mesh.position.addScaledVector(drop.velocity, delta);
      drop.mesh.material.opacity = clamp(drop.life * 1.5, 0, 0.88);
      if (drop.life <= 0) {
        this.scene.remove(drop.mesh);
        drop.mesh.geometry.dispose();
        drop.mesh.material.dispose();
        this.waterDrops.splice(i, 1);
      }
    }
    for (let i = this.foamMarks.length - 1; i >= 0; i -= 1) {
      const foam = this.foamMarks[i];
      foam.life -= delta;
      foam.group.position.y += foam.drift * delta;
      foam.group.scale.multiplyScalar(1 + delta * 0.08);
      const alpha = clamp(foam.life / foam.maxLife, 0, 1);
      foam.group.traverse((child) => {
        if (child.isMesh) child.material.opacity = alpha * 0.95;
      });
      if (foam.life <= 0) {
        this.scene.remove(foam.group);
        foam.group.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
        });
        this.foamMarks.splice(i, 1);
      }
    }
    for (let i = this.bubbles.length - 1; i >= 0; i -= 1) {
      const bubble = this.bubbles[i];
      bubble.life -= delta;
      bubble.mesh.position.y += bubble.velocity * delta;
      bubble.mesh.material.opacity = clamp(bubble.life / 1.2, 0, 0.68);
      if (bubble.life <= 0) {
        this.scene.remove(bubble.mesh);
        bubble.mesh.geometry.dispose();
        bubble.mesh.material.dispose();
        this.bubbles.splice(i, 1);
      }
    }
  }

  updateActionPose(delta) {
    const pet = this.currentPet;
    if (!pet) return;
    this.bodyLanguageClock += delta;

    if (this.eatingState) {
      this.eatingState.timeLeft -= delta;
      this.eatingState.elapsed += delta;
      const t = this.eatingState.elapsed;
      pet.model.position.copy(pet.baseModelPosition).add(new THREE.Vector3(0, -0.035 + Math.sin(t * 8) * 0.012, 0));
      pet.model.rotation.copy(pet.baseModelRotation);
      pet.model.rotation.x = -0.22 + Math.sin(t * 10) * 0.08;
      pet.model.rotation.z = Math.sin(t * 5) * 0.02;
      if (this.foodDisplay?.entry?.contentGroup) {
        const consume = Math.max(0.28, Math.min(1, this.eatingState.timeLeft / Math.max(0.1, this.eatingState.total)));
        this.foodDisplay.entry.contentGroup.scale.set(consume, 1, consume);
      }
      return;
    }

    if (this.mode === 'sleep') return;

    const ease = Math.min(1, delta * 7);
    const basePosition = pet.baseModelPosition.clone();
    const baseRotation = pet.baseModelRotation.clone();
    const targetPosition = basePosition.clone();
    const targetRotation = baseRotation.clone();
    const isMoving = Boolean(this.target);
    const canExpress = this.mode === 'home' && !isMoving;

    if (canExpress) {
      const language = this.bodyLanguageState || { id: 'relaxed', intensity: 0.5 };
      const strength = clamp(language.intensity || 0.5, 0, 0.72);
      const phase = this.bodyLanguageClock;
      const profile = {
        'low-and-close': { x: -0.055, z: 0.018, y: -0.024 },
        'head-tilt': { x: 0, z: 0.058, y: 0.006 },
        'short-pacing': { x: 0, z: 0, y: 0, swayZ: [0.012, 4.6] },
        upright: { x: 0.03, z: 0, y: 0.02 },
        heavy: { x: -0.03, z: 0, y: -0.014 },
        bouncy: { x: 0.01, z: 0, y: 0.01, bobY: [0.012, 3.3], swayZ: [0.01, 3.3] },
        'play-bow': { x: -0.07, z: 0, y: -0.014 },
        pacing: { x: 0, z: 0, y: 0, swayZ: [0.014, 3.0] },
        approaching: { x: 0.014, z: 0, y: 0.012 },
        watchful: { x: 0.016, z: 0.012, y: 0.01 },
        'slow-looking': { x: -0.012, z: 0.01, y: -0.006 },
        relaxed: { x: 0, z: 0, y: 0 }
      }[language.id] || { x: 0, z: 0, y: 0 };

      targetPosition.y += profile.y * strength;
      if (profile.bobY) targetPosition.y += Math.sin(phase * profile.bobY[1]) * profile.bobY[0] * strength;
      targetRotation.x += profile.x * strength;
      targetRotation.z += profile.z * strength;
      if (profile.swayZ) targetRotation.z += Math.sin(phase * profile.swayZ[1]) * profile.swayZ[0] * strength;
    }

    pet.model.position.lerp(targetPosition, ease);
    pet.model.rotation.x = lerp(pet.model.rotation.x, targetRotation.x, ease);
    pet.model.rotation.y = lerp(pet.model.rotation.y, targetRotation.y, ease);
    pet.model.rotation.z = lerp(pet.model.rotation.z, targetRotation.z, ease);
    pet.modelHolder.rotation.z = lerp(pet.modelHolder.rotation.z, 0, Math.min(1, delta * 4));
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
    this.updateCamera(delta);
    this.accessoryGizmo?.update();
    this.renderer.render(this.scene, this.camera);
  };

  renderStableFrame() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(resolve);
      });
    });
  }

  bindEvents() {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas.parentElement || this.canvas);
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', this.handlePointerUp);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    document.addEventListener('visibilitychange', () => {
      this.clock.getDelta();
    });
  }

  updatePointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  handlePointerDown = (event) => {
    this.canvas.setPointerCapture?.(event.pointerId);
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.pointerState.down = true;
    this.pointerState.dragged = false;
    this.pointerState.startX = event.clientX;
    this.pointerState.startY = event.clientY;
    this.pointerState.totalDx = 0;
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

  raycastPet() {
    const pet = this.currentPet;
    if (!pet) return [];
    return this.raycaster.intersectObject(pet.model, true);
  }

  processPetGesture(hit, dragging = false) {
    const now = performance.now();
    if (now - this.pointerState.lastPetAt < (dragging ? 160 : 70)) return;
    this.pointerState.lastPetAt = now;
    this.spawnParticles('heart', dragging ? 2 : 5, hit.point);
    const pet = this.currentPet;
    if (pet) pet.modelHolder.rotation.z = lerp(pet.modelHolder.rotation.z, randomBetween(-0.07, 0.07), 0.5);
    this.onPetGesture?.({ dragging, point: hit.point });
  }

  processCleanHit(hit) {
    const now = performance.now();
    if (now - this.pointerState.lastPetAt < 70) return;
    this.pointerState.lastPetAt = now;
    for (let i = 0; i < 2; i += 1) this.addBubble(hit.point);
    this.addFoam(hit.point);
    this.addWaterSplash(hit.point);
    if (Math.random() > 0.62) this.spawnParticles('clean', 1, hit.point);
    const dirtLifted = this.cleanNearbyDirt(hit.point);
    const gain = dirtLifted > 0 ? 3.1 + dirtLifted * 0.9 : 1.8;
    this.cleanProgress = clamp(this.cleanProgress + gain, 0, 100);
    this.onCleanProgress?.(this.cleanProgress);
  }

  rotateSelection(delta) {
    if (this.currentPet) this.currentPet.modelHolder.rotation.y += delta;
  }


  setWorldState({ weather = this.worldState.weather, season = this.worldState.season } = {}) {
    this.worldState = { weather, season };
    if (!this.scene || !this.hemisphere || !this.keyLight || !this.weatherGroup) return;
    this.applyLighting();
    while (this.weatherGroup.children.length) {
      const object = this.weatherGroup.children[0];
      this.weatherGroup.remove(object);
      this.disposeObject(object);
    }
    this.weatherParticles = [];
    const settings = this.settingsProvider();
    const reduced = settings.reducedMotion || settings.reducedWeatherEffects;
    const seasonTints = { spring: 0xf3ead8, summer: 0xe9f3dc, autumn: 0xead7bd, winter: 0xdce7ee };
    const weatherTints = { rain: 0xb9c5cf, thunderstorm: 0x74808f, snow: 0xdceaf3, fog: 0xc9d0cf, sunshine: 0xffecc6, rainbow: 0xe7e0f4, clear: seasonTints[season] || 0xf3ead8, wind: seasonTints[season] || 0xf3ead8 };
    const tint = weatherTints[weather] ?? 0xf3ead8;
    const tintColor = new THREE.Color(tint);
    if (this.dayPhase === 'night') tintColor.multiplyScalar(0.25);
    else if (this.dayPhase === 'sunset') tintColor.lerp(new THREE.Color(0xe8a079), 0.32);
    this.scene.background?.copy?.(tintColor);
    if (this.scene.fog) this.scene.fog.color.copy(tintColor);
    const intensity = weather === 'thunderstorm' ? 0.72 : weather === 'fog' ? 0.86 : 1;
    this.hemisphere.intensity = 2.15 * intensity;
    this.keyLight.intensity = (weather === 'sunshine' ? 3.8 : weather === 'thunderstorm' ? 1.55 : 3.0) * intensity;
    const count = reduced ? 24 : this.isMobile() ? 55 : 90;
    const kind = ['rain','thunderstorm','snow','wind'].includes(weather) ? weather : season === 'autumn' ? 'leaves' : null;
    if (kind) {
      const geometry = kind === 'snow'
        ? new THREE.SphereGeometry(0.035, 5, 4)
        : kind === 'leaves'
          ? new THREE.PlaneGeometry(0.09, 0.055)
          : new THREE.PlaneGeometry(0.018, kind === 'rain' || kind === 'thunderstorm' ? 0.32 : 0.09);
      const material = new THREE.MeshBasicMaterial({
        color: kind === 'snow' ? 0xffffff : kind === 'leaves' ? 0xd77b43 : 0x9fc7e3,
        transparent: true,
        opacity: kind === 'rain' || kind === 'thunderstorm' ? 0.62 : 0.78,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      for (let i = 0; i < count; i += 1) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(randomBetween(-5.2, 5.2), randomBetween(0.3, 5.6), randomBetween(-3.4, 3.4));
        mesh.rotation.z = kind === 'rain' || kind === 'thunderstorm' ? -0.16 : randomBetween(-Math.PI, Math.PI);
        this.weatherGroup.add(mesh);
        this.weatherParticles.push({ mesh, kind, speed: kind === 'snow' ? randomBetween(0.25, 0.55) : kind === 'leaves' ? randomBetween(0.45, 0.9) : randomBetween(2.8, 4.5), phase: Math.random() * Math.PI * 2 });
      }
    }
    if (weather === 'rainbow') {
      const colors = [0xe36b6b,0xf2a35b,0xf3d969,0x70c77d,0x69a7db,0x9b78d3];
      const arc = new THREE.Group();
      colors.forEach((color, index) => {
        const mesh = new THREE.Mesh(new THREE.TorusGeometry(2.2 - index * 0.08, 0.035, 7, 48, Math.PI), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 }));
        mesh.rotation.z = Math.PI;
        arc.add(mesh);
      });
      arc.position.set(2.6, 2.5, -3.0);
      this.weatherGroup.add(arc);
    }
  }

  updateWorldEffects(delta) {
    for (const particle of this.weatherParticles) {
      const { mesh, kind, speed, phase } = particle;
      mesh.position.y -= speed * delta;
      if (kind === 'snow' || kind === 'leaves' || kind === 'wind') {
        mesh.position.x += Math.sin(performance.now() * 0.0015 + phase) * delta * (kind === 'wind' ? 1.2 : 0.28);
        mesh.rotation.z += delta * (kind === 'leaves' ? 2 : 0.4);
      }
      if (mesh.position.y < -0.1) {
        mesh.position.y = randomBetween(4.4, 6.1);
        mesh.position.x = randomBetween(-5.2, 5.2);
        mesh.position.z = randomBetween(-3.4, 3.4);
      }
    }
    if (this.dreamGroup) {
      this.dreamGroup.rotation.y += delta * 0.08;
      this.dreamGroup.children.forEach((child, index) => { child.position.y += Math.sin(performance.now() * 0.0018 + index) * delta * 0.12; child.rotation.y += delta * 0.25; });
    }
  }

  createDecorationMesh(item) {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 0xe7a873, roughness: 0.82 });
    const accent = new THREE.MeshStandardMaterial({ color: 0x8cc7b8, roughness: 0.78 });
    if (item === 'cozy-bed') {
      group.add(this.box(1.7, 0.28, 1.1, material, 0, 0.14, 0));
      group.add(this.box(1.3, 0.18, 0.78, accent, 0, 0.36, 0));
    } else if (item === 'sofa') {
      group.add(this.box(2.0, 0.45, 0.85, material, 0, 0.28, 0));
      group.add(this.box(2.0, 0.75, 0.22, accent, 0, 0.62, -0.34));
    } else if (item === 'scratch-post') {
      group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.19,1.15,12), material));
      group.children[0].position.y = 0.58;
      group.add(this.box(0.75,0.12,0.75,accent,0,0.06,0));
    } else if (item === 'rug') {
      const rug = this.roundedRug(1.9, 1.3, 0xd6a6cb); group.add(rug);
    } else if (item === 'plant') {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.36,0.45,12), material); pot.position.y = 0.23; group.add(pot);
      for (let i=0;i<5;i+=1) { const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22,8,6), accent); leaf.scale.set(0.55,1.2,0.45); leaf.position.set(Math.sin(i*1.25)*0.18,0.67+Math.cos(i)*0.08,Math.cos(i*1.25)*0.18); group.add(leaf); }
    } else if (item === 'lamp') {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.07,1.15,10), material); pole.position.y=0.58; group.add(pole);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.34,0.45,14,1,true), accent); shade.position.y=1.15; group.add(shade);
    } else if (item === 'toy-box') {
      group.add(this.box(1.0,0.55,0.7,material,0,0.28,0));
      for(let i=0;i<3;i+=1){ const ball=new THREE.Mesh(new THREE.SphereGeometry(0.15,8,6),accent); ball.position.set(-0.25+i*0.25,0.65,0); group.add(ball); }
    } else if (item === 'bowl') {
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.33,0.25,0.18,18,1,true), accent); bowl.position.y=0.09; group.add(bowl);
    }
    group.traverse((child) => { if (child.isMesh) { child.castShadow=true; child.receiveShadow=true; } });
    return group;
  }

  validateDecorationPlacement(x, z, width, depth) {
    if (!this.scene || this.travelLocation) return true;
    const obstacle = { minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2, dynamic: true, preview: true };
    this.obstacles.push(obstacle);
    try {
      const start = this.currentPet?.stage?.position?.clone?.() || new THREE.Vector3(0, 0, 0);
      const destinations = [
        new THREE.Vector3(0, 0, 0),
        this.feedApproach?.clone?.() || new THREE.Vector3(2.8, 0, -1.15),
        this.wakeAnchor?.clone?.() || new THREE.Vector3(-1.5, 0, -0.25),
        new THREE.Vector3(3.8, 0, 2.1),
        new THREE.Vector3(-3.8, 0, 2.1)
      ];
      return destinations.every((destination) => this.findPath(start, destination, 0.36).length > 0);
    } finally {
      const index = this.obstacles.indexOf(obstacle);
      if (index >= 0) this.obstacles.splice(index, 1);
    }
  }

  setDecorations(records = []) {
    this.decorationRecords = Array.isArray(records) ? records : [];
    this.obstacles = this.obstacles.filter((obstacle) => !obstacle.dynamic);
    if (this.decorationGroup?.parent) {
      this.decorationGroup.parent.remove(this.decorationGroup);
      this.disposeObject(this.decorationGroup);
    }
    this.decorationGroup = new THREE.Group();
    this.decorationGroup.name = 'player-decorations';
    const roomRecords = this.decorationRecords.filter((record) => record.room === this.roomId || (!record.room && this.roomId === 'living'));
    for (const record of roomRecords) {
      const object = this.createDecorationMesh(record.item);
      object.position.set(record.x || 0, 0, record.z || 0);
      object.rotation.y = record.rotation || 0;
      object.userData.decorationId = record.id;
      this.decorationGroup.add(object);
      const sizes = { 'cozy-bed':[1.8,1.2],sofa:[2.2,1],'scratch-post':[0.8,0.8],rug:[2,1.4],plant:[0.7,0.7],lamp:[0.7,0.7],'toy-box':[1.1,0.8],bowl:[0.7,0.7] };
      const [width, depth] = sizes[record.item] || [1,1];
      if (record.item !== 'rug') this.obstacles.push({ minX: object.position.x-width/2, maxX: object.position.x+width/2, minZ: object.position.z-depth/2, maxZ: object.position.z+depth/2, dynamic: true });
    }
    this.environment.add(this.decorationGroup);
  }

  findAttachmentBone(record, anchor = 'neck') {
    const preferences = anchor === 'head'
      ? ['head0', 'head', 'skull', 'face', 'neck1']
      : anchor === 'back'
        ? ['body_top0', 'body_top1', 'spine', 'chest', 'back', 'body']
        : ['neck1', 'neck0', 'neck', 'body_top1', 'spine', 'chest'];
    let best = null;
    let bestScore = -Infinity;

    record.model.traverse((child) => {
      if (!child.isBone) return;
      const name = child.name.toLowerCase();
      let score = -1000;
      preferences.forEach((pattern, index) => {
        if (name === pattern) score = Math.max(score, 1000 - index * 40);
        else if (name.startsWith(pattern)) score = Math.max(score, 800 - index * 40);
        else if (name.includes(pattern)) score = Math.max(score, 600 - index * 40);
      });
      if (name.includes('end') || name.includes('tip')) score -= 700;
      if (score > bestScore) {
        best = child;
        bestScore = score;
      }
    });

    return bestScore > -1000 ? best : null;
  }

  vectorFromScaledArray(values = [0, 0, 0], size = { x: 1, y: 1, z: 1 }) {
    return new THREE.Vector3(values[0] * size.x, values[1] * size.y, values[2] * size.z);
  }

  eulerFromArray(values = [0, 0, 0]) {
    return new THREE.Euler(values[0] || 0, values[1] || 0, values[2] || 0);
  }

  getAccessoryTransform(pet, id, anchorType) {
    const defaults = PET_ACCESSORY_FITS.default || {};
    const petFit = PET_ACCESSORY_FITS[pet.id] || {};
    const defaultAccessory = defaults.accessories?.[id] || {};
    const configuredAccessory = petFit.accessories?.[id] || {};
    const runtimeAccessory = this.accessoryFitOverrides?.pets?.[pet.id]?.accessories?.[id] || {};
    const petAccessory = { ...configuredAccessory, ...runtimeAccessory };
    const size = pet.size || { x: 1, y: 1, z: 1 };
    const anchorOffset = this.vectorFromScaledArray(petFit[anchorType] || defaults[anchorType] || [0, 0, 0], size);
    const localOffset = this.vectorFromScaledArray(petAccessory.position || defaultAccessory.position || [0, 0, 0], size);
    const rotationValues = petAccessory.rotation || defaultAccessory.rotation || [0, 0, 0];
    const baseScale = (defaults.scale || 1) * (petFit.scale || 1);
    const defaultScaleValue = defaultAccessory.scale ?? 1;
    const petScaleValue = petAccessory.scale ?? 1;
    const defaultScale = Array.isArray(defaultScaleValue)
      ? new THREE.Vector3(defaultScaleValue[0] ?? 1, defaultScaleValue[1] ?? defaultScaleValue[0] ?? 1, defaultScaleValue[2] ?? defaultScaleValue[0] ?? 1)
      : new THREE.Vector3(defaultScaleValue, defaultScaleValue, defaultScaleValue);
    const petScale = Array.isArray(petScaleValue)
      ? new THREE.Vector3(petScaleValue[0] ?? 1, petScaleValue[1] ?? petScaleValue[0] ?? 1, petScaleValue[2] ?? petScaleValue[0] ?? 1)
      : new THREE.Vector3(petScaleValue, petScaleValue, petScaleValue);
    const scale = defaultScale.multiply(petScale).multiplyScalar(baseScale);
    return { anchorOffset, localOffset, rotation: this.eulerFromArray(rotationValues), scale };
  }

  setAccessoryFitOverrides(overrides = null) {
    this.accessoryFitOverrides = overrides;
    this.refreshAccessoryTransform();
  }

  refreshAccessoryTransform() {
    const pet = this.currentPet;
    if (!pet || !this.currentAccessoryId || !this.accessoryVisualGroup) return false;
    const transform = this.getAccessoryTransform(pet, this.currentAccessoryId, this.currentAccessoryAnchorType);
    this.accessoryVisualGroup.position.copy(transform.localOffset);
    this.accessoryVisualGroup.rotation.copy(transform.rotation);
    this.accessoryVisualGroup.scale.copy(transform.scale);
    if (this.accessoryBinding) this.accessoryBinding.anchorOffset.copy(transform.anchorOffset);
    else if (this.accessoryGroup) this.accessoryGroup.position.copy(this.getFallbackAccessoryAnchor(this.currentAccessoryAnchorType, pet)).add(transform.anchorOffset);
    this.accessoryGroup?.updateMatrixWorld(true);
    this.accessoryGizmo?.update();
    return true;
  }

  setPetPreviewRotation(yaw = 0) {
    if (!this.currentPet) return;
    this.currentPet.modelHolder.rotation.y = Number(yaw) || 0;
  }

  setAccessoryGizmoEnabled(enabled = false) {
    this.accessoryGizmoEnabled = Boolean(enabled);
    this.accessoryGizmo?.setEnabled(this.accessoryGizmoEnabled);
    if (this.accessoryGizmoEnabled && this.accessoryVisualGroup) this.accessoryGizmo?.attach(this.accessoryVisualGroup);
    else if (!this.accessoryGizmoEnabled) this.accessoryGizmo?.detach();
  }

  setAccessoryGizmoMode(mode = 'translate') {
    this.accessoryGizmo?.setMode(mode);
  }

  setAccessoryGizmoUniformScale(enabled = true) {
    this.accessoryGizmo?.setUniformScale(enabled);
  }

  getAccessoryEditableFit() {
    const pet = this.currentPet;
    const id = this.currentAccessoryId;
    const visual = this.accessoryVisualGroup;
    if (!pet || !id || !visual) return null;

    const defaults = PET_ACCESSORY_FITS.default || {};
    const petFit = PET_ACCESSORY_FITS[pet.id] || {};
    const defaultAccessory = defaults.accessories?.[id] || {};
    const size = pet.size || { x: 1, y: 1, z: 1 };
    const safeSize = {
      x: Math.max(0.0001, size.x || 1),
      y: Math.max(0.0001, size.y || 1),
      z: Math.max(0.0001, size.z || 1)
    };
    const defaultScaleValue = defaultAccessory.scale ?? 1;
    const defaultScale = Array.isArray(defaultScaleValue)
      ? new THREE.Vector3(defaultScaleValue[0] ?? 1, defaultScaleValue[1] ?? defaultScaleValue[0] ?? 1, defaultScaleValue[2] ?? defaultScaleValue[0] ?? 1)
      : new THREE.Vector3(defaultScaleValue, defaultScaleValue, defaultScaleValue);
    const fixedScale = defaultScale.multiplyScalar((defaults.scale || 1) * (petFit.scale || 1));

    return {
      position: [visual.position.x / safeSize.x, visual.position.y / safeSize.y, visual.position.z / safeSize.z],
      rotation: [visual.rotation.x, visual.rotation.y, visual.rotation.z],
      scale: [
        visual.scale.x / Math.max(0.0001, fixedScale.x),
        visual.scale.y / Math.max(0.0001, fixedScale.y),
        visual.scale.z / Math.max(0.0001, fixedScale.z)
      ]
    };
  }

  getFallbackAccessoryAnchor(anchorType, pet) {
    const h = pet.size.y || 1.2;
    const d = pet.size.z || 0.8;
    if (anchorType === 'head') return new THREE.Vector3(0, h * 0.82, -d * 0.03);
    if (anchorType === 'back') return new THREE.Vector3(0, h * 0.52, -d * 0.2);
    return new THREE.Vector3(0, h * 0.57, d * 0.08);
  }

  setAccessory(id = null) {
    this.accessoryGizmo?.detach();
    if (this.accessoryGroup) {
      this.accessoryGroup.removeFromParent();
      this.disposeObject(this.accessoryGroup);
      this.accessoryGroup = null;
    }
    this.accessoryVisualGroup = null;
    this.currentAccessoryId = null;
    this.currentAccessoryAnchorType = null;
    this.accessoryBinding = null;

    const pet = this.currentPet;
    if (!pet || !id) return;

    const anchorType = ['bow', 'hat', 'glasses'].includes(id) ? 'head' : ['backpack', 'cape'].includes(id) ? 'back' : 'neck';
    const root = new THREE.Group();
    root.name = `accessory-${id}`;
    const group = new THREE.Group();
    group.name = `accessory-${id}-visual`;
    root.add(group);

    const primary = new THREE.MeshStandardMaterial({ color: 0xe15f75, roughness: 0.72, metalness: 0.04 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xf2c75d, roughness: 0.55, metalness: 0.2 });
    const h = pet.size.y || 1.2;
    const w = pet.size.x || 0.8;
    const d = pet.size.z || 0.8;
    const transform = this.getAccessoryTransform(pet, id, anchorType);

    if (id === 'collar' || id === 'bandana' || id === 'tag') {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(Math.max(0.18, w * 0.23), 0.03, 10, 28), primary);
      collar.rotation.x = Math.PI / 2;
      group.add(collar);
      if (id === 'bandana') {
        const knot = this.box(Math.max(0.08, w * 0.08), Math.max(0.05, h * 0.04), Math.max(0.04, d * 0.04), primary, 0, -0.02, 0.07);
        const flapLeft = new THREE.Mesh(new THREE.ConeGeometry(Math.max(0.07, w * 0.08), Math.max(0.18, h * 0.16), 3), primary);
        flapLeft.position.set(-Math.max(0.06, w * 0.07), -Math.max(0.1, h * 0.1), Math.max(0.08, d * 0.08));
        flapLeft.rotation.set(Math.PI, 0.2, -0.2);
        const flapRight = flapLeft.clone();
        flapRight.position.x *= -1;
        flapRight.rotation.z *= -1;
        group.add(knot, flapLeft, flapRight);
      }
      if (id === 'tag') {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 6, 16), gold);
        ring.position.set(0, -0.02, 0.06);
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.018, 18), gold);
        plate.rotation.x = Math.PI / 2;
        plate.position.set(0, -0.08, 0.085);
        group.add(ring, plate);
      }
    } else if (id === 'bow') {
      const left = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), primary);
      left.scale.set(1.45, 0.68, 0.55);
      left.position.x = -0.12;
      const right = left.clone();
      right.position.x = 0.12;
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), gold);
      group.add(left, right, knot);
    } else if (id === 'hat') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.04, 24), primary);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.26, 18), gold);
      crown.position.y = 0.15;
      group.add(brim, crown);
    } else if (id === 'glasses') {
      for (const x of [-0.145, 0.145]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.102, 0.016, 8, 20), primary);
        ring.position.x = x;
        group.add(ring);
      }
      group.add(this.box(0.09, 0.022, 0.022, gold, 0, 0, 0));
    } else if (id === 'backpack') {
      group.add(this.box(Math.max(0.34, w * 0.44), Math.max(0.36, h * 0.3), Math.max(0.17, d * 0.22), primary, 0, 0, 0));
      group.add(this.box(Math.max(0.12, w * 0.14), Math.max(0.08, h * 0.07), Math.max(0.03, d * 0.04), gold, 0, -Math.max(0.02, h * 0.03), Math.max(0.1, d * 0.12)));
    } else if (id === 'cape') {
      const cape = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(0.52, w * 0.72), Math.max(0.7, h * 0.6)), primary);
      cape.rotation.x = -0.16;
      cape.position.z = -Math.max(0.1, d * 0.14);
      group.add(cape);
    }

    root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.frustumCulled = false;
      }
    });

    group.position.copy(transform.localOffset);
    group.rotation.copy(transform.rotation);
    group.scale.copy(transform.scale);
    this.accessoryVisualGroup = group;
    this.currentAccessoryId = id;
    this.currentAccessoryAnchorType = anchorType;
    pet.modelHolder.add(root);

    const bone = this.findAttachmentBone(pet, anchorType);
    if (bone) {
      pet.modelHolder.updateWorldMatrix(true, false);
      bone.updateWorldMatrix(true, false);

      bone.getWorldPosition(this.accessoryWorldPosition);
      pet.modelHolder.worldToLocal(this.accessoryWorldPosition);
      root.position.copy(this.accessoryWorldPosition).add(transform.anchorOffset);

      bone.getWorldQuaternion(this.accessoryBoneQuaternion);
      pet.modelHolder.getWorldQuaternion(this.accessoryHolderQuaternion);
      const relativeBoneQuaternion = this.accessoryHolderQuaternion.clone().invert().multiply(this.accessoryBoneQuaternion);

      this.accessoryBinding = {
        root,
        bone,
        holder: pet.modelHolder,
        anchorOffset: transform.anchorOffset.clone(),
        orientationCorrection: relativeBoneQuaternion.clone().invert()
      };
    } else {
      root.position.copy(this.getFallbackAccessoryAnchor(anchorType, pet)).add(transform.anchorOffset);
    }

    this.accessoryGroup = root;
    root.updateMatrixWorld(true);
    if (this.accessoryGizmoEnabled) this.accessoryGizmo?.attach(this.accessoryVisualGroup);
  }

  updateAccessoryBinding(delta) {
    const binding = this.accessoryBinding;
    if (!binding?.root?.parent || !binding.bone?.parent || !binding.holder?.parent) return;

    binding.holder.updateWorldMatrix(true, false);
    binding.bone.updateWorldMatrix(true, false);

    binding.bone.getWorldPosition(this.accessoryWorldPosition);
    this.accessoryTargetPosition.copy(this.accessoryWorldPosition);
    binding.holder.worldToLocal(this.accessoryTargetPosition);

    binding.bone.getWorldQuaternion(this.accessoryBoneQuaternion);
    binding.holder.getWorldQuaternion(this.accessoryHolderQuaternion);
    this.accessoryTargetQuaternion
      .copy(this.accessoryHolderQuaternion)
      .invert()
      .multiply(this.accessoryBoneQuaternion)
      .multiply(binding.orientationCorrection);

    this.accessoryAnchorOffset.copy(binding.anchorOffset).applyQuaternion(this.accessoryTargetQuaternion);
    this.accessoryTargetPosition.add(this.accessoryAnchorOffset);

    const settings = this.settingsProvider?.() || {};
    const follow = settings.reducedMotion ? 1 : 1 - Math.exp(-Math.max(0, delta) * 24);
    binding.root.position.lerp(this.accessoryTargetPosition, follow);
    binding.root.quaternion.slerp(this.accessoryTargetQuaternion, follow);
  }

  async setSecondaryPet(id = null) {
    if (!this.scene || !this.petStage) { this.secondaryPetId = id && id !== this.currentPetId ? id : null; return true; }
    if (this.secondaryPetId && this.secondaryPetId !== id) {
      const old = this.pets.get(this.secondaryPetId);
      if (old) { this.pets.delete(this.secondaryPetId); this.disposePetRecord(old); }
    }
    this.secondaryPetId = id && id !== this.currentPetId ? id : null;
    this.secondaryTarget = null;
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
  }

  updateSecondary(delta, time) {
    if (!this.secondaryPetId || this.mode !== 'home') return;
    const secondary = this.pets.get(this.secondaryPetId);
    const primary = this.currentPet;
    if (!secondary || !primary) return;
    if (!this.secondaryTarget && time - this.secondaryLastDecision > (this.settingsProvider().reducedMotion ? 18000 : 9000)) {
      this.secondaryLastDecision = time;
      const preferred = new THREE.Vector3(randomBetween(-3.2,3.2),0,randomBetween(-2.0,2.0));
      const route = this.findPath(secondary.stage.position.clone(), preferred, 0.4);
      this.secondaryTarget = route.at(-1) || this.findSafePosition(preferred);
    }
    const separation = secondary.stage.position.clone().sub(primary.stage.position); separation.y=0;
    if (separation.length() < 0.72) {
      separation.normalize();
      secondary.stage.position.addScaledVector(separation, delta*0.9);
      primary.stage.position.addScaledVector(separation, -delta*0.3);
    }
    if (!this.secondaryTarget) return;
    const direction = this.secondaryTarget.clone().sub(secondary.stage.position); direction.y=0;
    const distance=direction.length();
    if(distance<0.1){ this.secondaryTarget=null; secondary.controller.play('idle',{fade:0.2}); return; }
    direction.normalize();
    const next=secondary.stage.position.clone().addScaledVector(direction,Math.min(distance,delta*0.85));
    if(this.isBlocked(next.x,next.z,0.4)){ this.secondaryTarget=null; secondary.controller.play('idle',{fade:0.15,force:true}); return; }
    secondary.stage.position.copy(next);
    secondary.modelHolder.rotation.y=this.smoothAngle(secondary.modelHolder.rotation.y,Math.atan2(direction.x,direction.z),Math.min(1,delta*7));
    secondary.controller.play('walk',{fade:0.18});
  }

  playSocialInteraction(kind = 'play') {
    const secondary = this.secondaryPetId ? this.pets.get(this.secondaryPetId) : null;
    const primary = this.currentPet;
    if (!secondary || !primary) return;
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

  setBodyLanguage(id = 'relaxed', intensity = 0.5) {
    const previous = this.bodyLanguageState?.id;
    this.bodyLanguageState = { id, intensity: clamp(intensity, 0, 1) };
    if (previous !== id) this.bodyLanguageClock = 0;
  }

  showScentTrail(secretId = null) {
    if (this.scentGroup) { this.scentGroup.removeFromParent(); this.disposeObject(this.scentGroup); this.scentGroup=null; }
    if (!this.currentPet) return;
    const targets = { 'buried-chest':[-2.4,1.6], 'toy-under-bed':[-3.1,-1.2], apparition:[2.7,1.5], 'shooting-star':[2.8,-1.2], 'secret-door':[4.0,-1.8], rainbow:[1.9,-1.8], 'hidden-picnic':[2.2,1.55] };
    const targetArray=targets[secretId] || [randomBetween(-3,3),randomBetween(-1.8,1.8)];
    const target=new THREE.Vector3(targetArray[0],0,targetArray[1]);
    const route=this.findPath(this.currentPet.stage.position.clone(),target);
    if(!route.length) return;
    const group=new THREE.Group();
    const material=new THREE.MeshBasicMaterial({color:0xb58cff,transparent:true,opacity:0.74});
    const points=[this.currentPet.stage.position.clone(),...route];
    for(let i=0;i<points.length-1;i+=1){ const a=points[i],b=points[i+1],distance=a.distanceTo(b),steps=Math.max(1,Math.floor(distance/0.32)); for(let j=1;j<=steps;j+=1){ const p=a.clone().lerp(b,j/steps); const mark=new THREE.Mesh(new THREE.RingGeometry(0.06,0.11,8),material); mark.rotation.x=-Math.PI/2; mark.position.copy(p); mark.position.y=0.025; group.add(mark); } }
    this.scene.add(group); this.scentGroup=group;
    setTimeout(()=>{ if(this.scentGroup===group){group.removeFromParent();this.disposeObject(group);this.scentGroup=null;} },9000);
  }

  startDream(theme = 'stars') {
    if (this.dreamGroup) this.endDream();
    this.dreamTheme=theme;
    const group=new THREE.Group();
    const colors={treats:0xffb65e,clouds:0xb9ddff,space:0x8d72d8,vacuum:0xff8e94,ocean:0x63c9db,stars:0xffdf77,memory:0xe5bca5,friends:0x9ad9b7};
    const material=new THREE.MeshStandardMaterial({color:colors[theme]||0xffdf77,emissive:colors[theme]||0xffdf77,emissiveIntensity:0.32,roughness:0.55});
    for(let i=0;i<14;i+=1){ const geometry=i%3===0?new THREE.TorusGeometry(0.14,0.045,6,12):i%3===1?new THREE.SphereGeometry(0.12,7,5):new THREE.ConeGeometry(0.11,0.28,5); const mesh=new THREE.Mesh(geometry,material); mesh.position.set(randomBetween(-4.2,4.2),randomBetween(0.5,4.5),randomBetween(-3,2)); group.add(mesh); }
    this.scene.add(group); this.dreamGroup=group;
    this.scene.background.setHex(theme==='space'?0x201a42:0xcbd9ed);
    this.scene.fog.color.copy(this.scene.background);
  }

  endDream() { if(this.dreamGroup){this.dreamGroup.removeFromParent();this.disposeObject(this.dreamGroup);this.dreamGroup=null;} this.dreamTheme=null; this.setWorldState(this.worldState); }

  setEventTheme(eventId = null) {
    if(this.eventGroup){this.eventGroup.removeFromParent();this.disposeObject(this.eventGroup);this.eventGroup=null;}
    if(!eventId) return;
    const group=new THREE.Group(); const color=eventId.includes('winter')?0xaee4ff:eventId.includes('spooky')?0x9b78d3:eventId.includes('spring')?0xf39ac2:0xffc868; const material=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0.18,roughness:0.7});
    for(let i=0;i<8;i+=1){const mesh=new THREE.Mesh(new THREE.SphereGeometry(0.12,7,5),material);mesh.position.set(-4+i*1.1,2.6+Math.sin(i)*0.2,-3.0);group.add(mesh);} this.scene.add(group);this.eventGroup=group;
  }

  async buildTravelEnvironment(locationId, weather = 'clear', season = 'spring') {
    this.buildEnvironment('park');
    this.travelLocation=locationId;
    this.roomId=locationId;
    const palette={beach:0xe7d099,forest:0x638861,'city-street':0x8d9198,farm:0x9dad66,'snow-trail':0xd9e8ee,'night-park':0x53647b,'pet-fair':0xd9a985,'town-square':0xb9aa98,clinic:0xd8e9e8};
    const color=palette[locationId]||0x8fb47b;
    const floor=this.environment.getObjectByName('walk-floor'); if(floor?.material?.color) floor.material.color.setHex(color);
    const mat=new THREE.MeshStandardMaterial({color:locationId==='snow-trail'?0xffffff:locationId==='night-park'?0x8db0d2:0xf2c56d,roughness:0.85});
    const wood=new THREE.MeshStandardMaterial({color:0x8f6647,roughness:0.9});
    if(locationId==='beach'){for(let i=0;i<5;i++){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(0.22+Math.random()*0.18,0),mat);rock.position.set(-3+i*1.5,0.2,randomBetween(-2,2));this.environment.add(rock);}}
    else if(locationId==='forest'){for(let i=0;i<7;i++){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.2,1.5,8),wood);trunk.position.set(-4+i*1.35,0.75,(i%2?1.9:-2));this.environment.add(trunk);}}
    else if(locationId==='city-street'||locationId==='town-square'){for(let i=0;i<4;i++){const post=this.box(0.12,1.8,0.12,wood,-3.5+i*2.3,0.9,-2.5);this.environment.add(post);}}
    else if(locationId==='farm'){for(let i=0;i<6;i++){const bale=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,0.55,12),mat);bale.rotation.z=Math.PI/2;bale.position.set(-3+i*1.2,0.32,(i%2?1.8:-1.8));this.environment.add(bale);}}
    else if(locationId==='snow-trail'){for(let i=0;i<8;i++){const snow=new THREE.Mesh(new THREE.SphereGeometry(0.15+Math.random()*0.18,7,5),mat);snow.position.set(randomBetween(-4.5,4.5),0.12,randomBetween(-2.5,2.5));this.environment.add(snow);}}
    else if(locationId==='pet-fair'){for(let i=0;i<5;i++){const flag=this.box(0.35,0.22,0.03,mat,-3+i*1.5,2.5,-2.8);flag.rotation.z=i%2?0.15:-0.15;this.environment.add(flag);}}
    else if(locationId==='clinic'){
      const clean=new THREE.MeshStandardMaterial({color:0xf5fbfa,roughness:0.84});
      const teal=new THREE.MeshStandardMaterial({color:0x66adab,roughness:0.72});
      this.environment.add(this.box(3.2,0.85,1.0,clean,-2.5,0.43,-1.8));
      this.environment.add(this.box(1.9,0.62,1.0,teal,1.4,0.32,-1.7));
      this.environment.add(this.box(1.25,0.12,0.9,clean,1.4,0.7,-1.7));
      const scale=new THREE.Mesh(new THREE.CylinderGeometry(0.68,0.72,0.12,24),teal);scale.position.set(2.9,0.07,1.35);this.environment.add(scale);
      const sign=this.box(2.0,1.2,0.08,teal,-2.2,2.0,-3.25);this.environment.add(sign);
      this.obstacles.push({minX:-4.1,maxX:-0.9,minZ:-2.3,maxZ:-1.3,dynamic:true},{minX:0.45,maxX:2.35,minZ:-2.25,maxZ:-1.15,dynamic:true});
    }
    this.obstacles=this.obstacles.filter((o)=>!o.dynamic || locationId==='clinic');
    this.setWorldState({weather,season});
    this.setDecorations([]);
    await this.renderStableFrame();
  }

  setPhotoMode(enabled) {
    this.mode = enabled ? 'photo' : 'home';
    if (!enabled) this.frameCurrentPet(false);
  }

  getPetAvatarDataUrl() {
    const pet = this.currentPet;
    if (!pet || !this.renderer || !this.camera) return '';
    if (this.petPortraitCache.has(pet.id)) return this.petPortraitCache.get(pet.id);

    const environmentVisible = this.environment.visible;
    const background = this.scene.background;
    const fog = this.scene.fog;
    const stagePosition = pet.stage.position.clone();
    const holderRotation = pet.modelHolder.rotation.clone();
    const modelPosition = pet.model.position.clone();
    const modelRotation = pet.model.rotation.clone();
    const cameraPosition = this.camera.position.clone();
    const cameraQuaternion = this.camera.quaternion.clone();
    const cameraFov = this.camera.fov;
    const target = this.cameraTarget.clone();

    this.environment.visible = false;
    this.scene.background = null;
    this.scene.fog = null;
    pet.stage.position.set(0, 0, 0);
    pet.modelHolder.rotation.set(0, 0, 0);
    pet.model.position.copy(pet.baseModelPosition);
    pet.model.rotation.copy(pet.baseModelRotation);
    pet.stage.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(pet.model);
    const center = box.getCenter(new THREE.Vector3());
    const height = Math.max(0.5, box.max.y - box.min.y);
    this.camera.fov = 28;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(center.x, center.y + height * 0.08, center.z + Math.max(1.1, height * 2.1));
    this.camera.lookAt(center.x, center.y, center.z);
    this.renderer.render(this.scene, this.camera);

    const source = this.renderer.domElement;
    const crop = Math.min(source.width, source.height);
    const offscreen = document.createElement('canvas');
    offscreen.width = 256;
    offscreen.height = 256;
    const context = offscreen.getContext('2d');
    context?.drawImage(source, (source.width - crop) / 2, (source.height - crop) / 2, crop, crop, 0, 0, 256, 256);
    const dataUrl = offscreen.toDataURL('image/png');

    this.environment.visible = environmentVisible;
    this.scene.background = background;
    this.scene.fog = fog;
    pet.stage.position.copy(stagePosition);
    pet.modelHolder.rotation.copy(holderRotation);
    pet.model.position.copy(modelPosition);
    pet.model.rotation.copy(modelRotation);
    this.camera.position.copy(cameraPosition);
    this.camera.quaternion.copy(cameraQuaternion);
    this.camera.fov = cameraFov;
    this.camera.updateProjectionMatrix();
    this.cameraTarget.copy(target);
    this.renderer.render(this.scene, this.camera);
    this.petPortraitCache.set(pet.id, dataUrl);
    return dataUrl;
  }

  captureImage() {
    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL('image/png');
  }

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
