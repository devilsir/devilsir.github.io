import * as THREE from '../vendor/three.module.js';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { PETS, ANIMATION_NAMES } from './config.js';
import { AnimationController } from './animations.js';
import { clamp, lerp, randomBetween } from './utils.js';

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
    this.onPetGesture = null;
    this.onCleanProgress = null;
    this.onMovement = null;
    this.resizeObserver = null;
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
    this.createLights();
    this.buildEnvironment('living');
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
    let loaded = 0;
    const total = entries.length;
    await Promise.all(entries.map(async (pet) => {
      const gltf = await this.loadModel(pet.model, (fraction) => {
        progressCallback(clamp(((loaded + fraction) / total) * 100));
      });
      const record = this.preparePet(pet.id, gltf);
      this.pets.set(pet.id, record);
      this.petStage.add(record.stage);
      record.stage.visible = false;
      loaded += 1;
      progressCallback((loaded / total) * 100);
    }));
    progressCallback(100);
  }

  loadModel(url, progressCallback) {
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
    const missing = ANIMATION_NAMES.filter((name) => !gltf.animations.some((clip) => clip.name === name));
    if (missing.length) console.warn(`[Pocket Companions] ${id} is missing animations:`, missing);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = true;
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

    const controller = new AnimationController(model, gltf.animations, (sound) => this.soundPlayer(sound));
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

  setPet(id, { selection = false } = {}) {
    if (!this.pets.has(id)) throw new Error(`Pet ${id} is not loaded.`);
    this.currentPetId = id;
    this.pets.forEach((record, key) => {
      record.stage.visible = key === id;
      record.stage.position.set(0, 0, 0);
      record.modelHolder.rotation.set(0, 0, 0);
      record.model.position.copy(record.baseModelPosition);
      record.model.rotation.copy(record.baseModelRotation);
      if (key === id) record.controller.play('idle', { fade: 0.24, force: true });
    });
    this.mode = selection ? 'selection' : 'home';
    this.target = null;
    this.autonomousTarget = null;
    this.frameCurrentPet(selection);
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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.reducedMotion ? 1.15 : this.isMobile() ? 1.5 : 2));
  }

  buildEnvironment(roomId) {
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
    this.target = null;
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
    this.target = null;
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
    this.target = null;
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
        pet.controller.play('idle', { fade: 0.6, timeScale: 0.52, force: true });
      }
      this.frameCurrentPet(false);
      this.baseCamera.y = Math.max(this.baseCamera.y, this.sleepSurfaceY + 1.15);
      this.baseCamera.z *= 0.92;
    } else {
      this.applyLighting();
      this.mode = 'home';
      if (pet) {
        this.wakePetFromBed();
        pet.controller.play('idle', { fade: 0.4, timeScale: 1, force: true });
      }
      this.frameCurrentPet(false);
    }
  }

  startCleanMode() {
    this.cleanMode = true;
    this.cleanProgress = 0;
    this.mode = 'clean';
    this.target = null;
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
    this.target = null;
    this.eatingState = null;
    pet.model.position.copy(pet.baseModelPosition);
    pet.model.rotation.copy(pet.baseModelRotation);
    pet.modelHolder.rotation.set(0, 0, 0);
    pet.stage.position.copy(preferred ? this.findSafePosition(preferred) : this.getRoomSpawn(this.roomId));
    pet.stage.position.y = 0;
    pet.controller.play('idle', { fade: 0.2, force: true });
  }

  moveToAndWait(x, z, { run = false, timeout = 1800 } = {}) {
    const destination = this.findSafePosition(new THREE.Vector3(x, 0, z));
    this.moveTo(destination.x, destination.z, run);
    const started = performance.now();
    return new Promise((resolve) => {
      const check = () => {
        if (!this.currentPet || !this.target) {
          resolve(true);
          return;
        }
        if (performance.now() - started >= timeout) {
          this.target = null;
          this.currentPet.stage.position.copy(destination);
          this.currentPet.controller.play('idle', { fade: 0.18 });
          this.onMovement?.('stop');
          resolve(false);
          return;
        }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });
  }

  moveTo(x, z, run = false) {
    if (!this.currentPet || this.mode === 'selection' || this.mode === 'sleep' || this.cleanMode) return;
    this.target = new THREE.Vector3(clamp(x, -4.4, 4.4), 0, clamp(z, -2.75, 2.75));
    this.target.run = run;
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

  updateAutonomous(time) {
    if (!this.autonomousEnabled || this.mode !== 'home' || this.target || !this.currentPet) return;
    const settings = this.settingsProvider();
    const interval = settings.reducedMotion ? 19000 : 11000;
    if (time - this.lastAutonomous < interval) return;
    this.lastAutonomous = time;
    const x = randomBetween(-2.8, 2.8);
    const z = randomBetween(-1.9, 1.9);
    this.moveTo(x, z, Math.random() > 0.72);
    this.dispatchEvent(new CustomEvent('autonomous'));
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
      this.target = null;
      pet.controller.play('idle', { fade: 0.22 });
      this.onMovement?.('stop');
      return;
    }
    direction.normalize();
    const running = Boolean(this.target.run) || distance > 3.4;
    const speed = running ? 2.55 : 1.2;
    const step = Math.min(distance, speed * delta);
    const next = position.clone().addScaledVector(direction, step);
    if (!this.isBlocked(next.x, next.z)) {
      position.copy(next);
    } else {
      const slideX = new THREE.Vector3(next.x, position.y, position.z);
      const slideZ = new THREE.Vector3(position.x, position.y, next.z);
      if (!this.isBlocked(slideX.x, slideX.z)) position.copy(slideX);
      else if (!this.isBlocked(slideZ.x, slideZ.z)) position.copy(slideZ);
      else {
        this.target = null;
        pet.controller.play('idle', { fade: 0.2 });
        this.onMovement?.('stop');
        return;
      }
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
    } else if (this.mode !== 'sleep') {
      pet.model.position.lerp(pet.baseModelPosition, Math.min(1, delta * 8));
      pet.model.rotation.x = lerp(pet.model.rotation.x, pet.baseModelRotation.x, Math.min(1, delta * 7));
      pet.model.rotation.y = lerp(pet.model.rotation.y, pet.baseModelRotation.y, Math.min(1, delta * 7));
      pet.model.rotation.z = lerp(pet.model.rotation.z, pet.baseModelRotation.z, Math.min(1, delta * 7));
    }
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
    this.updateParticles(delta);
    this.updateActionPose(delta);
    this.updateCamera(delta);
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

  disposeObject(object) {
    object.traverse?.((child) => {
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose?.());
      else child.material?.dispose?.();
    });
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
    this.pets.forEach((record) => record.controller.dispose());
    this.renderer?.dispose();
  }
}
