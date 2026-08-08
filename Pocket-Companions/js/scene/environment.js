import * as THREE from '../../vendor/three.module.js';
import { randomBetween } from '../utils.js';

const ROOM_PALETTES = {
  living: { floor: 0xe5b98f, wall: 0xf6e5cd, accent: 0xf3a36c, sky: 0xcfe8f5 },
  garden: { floor: 0x82b875, wall: 0xb8d99c, accent: 0xf4c96e, sky: 0x9fd7ed },
  bedroom: { floor: 0xc8b5c8, wall: 0xeee0ef, accent: 0x9c86bd, sky: 0xc6d9ef },
  kitchen: { floor: 0xd8c6a4, wall: 0xf4efe2, accent: 0x79b6a6, sky: 0xc9e6f0 },
  playroom: { floor: 0xe2b4ad, wall: 0xffe7ce, accent: 0x7fb4d7, sky: 0xcce6f3 },
  bathroom: { floor: 0xc4d4d9, wall: 0xf5fbfd, accent: 0x7fb7c8, sky: 0xcfe8f5 },
  park: { floor: 0x78a96c, wall: 0xaecf99, accent: 0xf2b85f, sky: 0x89c8e4 },
  training: { floor: 0xb7aaa2, wall: 0xe8ddd4, accent: 0xe67f6a, sky: 0xbfdbea }
};

const ROOM_DIMENSIONS = {
  living: { width: 15.2, depth: 10.2, wallHeight: 5.8 },
  garden: { width: 16.8, depth: 12.2, wallHeight: 0 },
  bedroom: { width: 15.0, depth: 10.4, wallHeight: 5.8 },
  kitchen: { width: 15.4, depth: 10.0, wallHeight: 5.8 },
  playroom: { width: 15.2, depth: 10.8, wallHeight: 5.8 },
  bathroom: { width: 14.2, depth: 9.8, wallHeight: 5.8 },
  park: { width: 17.0, depth: 12.6, wallHeight: 0 },
  training: { width: 17.2, depth: 12.4, wallHeight: 0 }
};

const BUILT_IN_DEFAULT_FURNITURE_TRANSFORMS = {
  living: {
    'rug': { x: 1.27, y: 0.03, z: -2.58, rotation: 0, scale: 1.11 },
    'bed': { x: -5.31, y: 0, z: -2.45, rotation: 0, scale: 1.05 },
    'bowls': { x: 4.75, y: 0, z: -2.55, rotation: 0, scale: 1 },
    'shelf': { x: -2.45, y: 0, z: -3.81, rotation: -0.3, scale: 1 },
    'lamp': { x: 3.39, y: 0, z: -3.35, rotation: 0, scale: 1 },
    'toy-box': { x: 5.25, y: 0, z: 2.7, rotation: 0, scale: 1 },
    'sofa': { x: 1.45, y: 0, z: -3.5, rotation: 0, scale: 1.18 },
    'coffee-table': { x: 1.25, y: 0, z: -1.42, rotation: 0, scale: 1 },
    'plant-a': { x: 6.2, y: 0, z: 1.95, rotation: 0, scale: 1.18 },
    'plant-b': { x: -0.6, y: 0, z: -3.1, rotation: 0, scale: 0.92 },
    'media-console': { x: -4.91, y: 0, z: 0.35, rotation: 0, scale: 1 }
  },
  bedroom: {
    'rug': { x: 0, y: 0, z: -0.75, rotation: 0, scale: 1.12 },
    'bed': { x: -4.87, y: 0, z: -2.15, rotation: 0, scale: 1.5 },
    'lamp': { x: 3.76, y: 0, z: -2.29, rotation: 0, scale: 1 },
    'shelf': { x: 6.56, y: 0, z: -3.13, rotation: 0, scale: 1 },
    'dresser': { x: 0.36, y: 0, z: -2.47, rotation: 0, scale: 1 },
    'desk': { x: -0.4, y: 0, z: 1.42, rotation: 0, scale: 1 },
    'plant': { x: -5.75, y: 0, z: 1.85, rotation: 0, scale: 1.1 },
    'armchair': { x: -0.04, y: 0, z: 0.35, rotation: 0, scale: 0.96 }
  },
  kitchen: {
    'counter': { x: -1, y: 0, z: -2.94, rotation: 0, scale: 1 },
    'stove': { x: -8.12, y: 0, z: -3.74, rotation: 0, scale: 1 },
    'dining-table': { x: 1.16, y: 0, z: 1.49, rotation: 0, scale: 0.9 },
    'stools': { x: 1.23, y: 0.01, z: 3.1, rotation: Math.PI, scale: 1 },
    'fridge': { x: 5.72, y: 0.04, z: -3.65, rotation: 0, scale: 1 },
    'pantry': { x: 7.43, y: 0.01, z: -3.27, rotation: 0, scale: 1 },
    'cabinet': { x: -9.41, y: 0, z: -3.55, rotation: 0, scale: 1 },
    'upper-cabinets': { x: -0.45, y: 0, z: -2.98, rotation: 0, scale: 1 },
    'bowls': { x: -5.57, y: 0, z: 1.18, rotation: 0, scale: 1 },
    'plant': { x: 6.15, y: 0, z: 2.6, rotation: 0, scale: 0.9 }
  },
  park: {
    'bench-a': { x: -5.45, y: 0, z: 2.55, rotation: -1.476548547, scale: 1 },
    'bench-b': { x: 5.3, y: 0, z: -2.25, rotation: Math.PI, scale: 1 },
    'picnic-table': { x: 0.45, y: 0, z: 2.9, rotation: 0, scale: 1 },
    'planter-a': { x: -2.85, y: 0, z: -3.25, rotation: 0, scale: 1 },
    'planter-b': { x: 5.55, y: 0, z: 3.25, rotation: 0, scale: 1 },
    'fountain': { x: 0.72, y: 0, z: -1.15, rotation: 0, scale: 1 },
    'pergola': { x: 0.58, y: 0, z: -7.09, rotation: -0.240855437, scale: 1 },
    'park-bed': { x: 0.59, y: 0, z: -7.25, rotation: -0.240855437, scale: 1 }
  },
  bathroom: {
    'bath-mat': { x: -2.6, y: 0, z: 1.1, rotation: -0.080286, scale: 1 },
    'sink': { x: 4.55, y: 0, z: -2.2, rotation: -0.012217, scale: 1 },
    'mirror': { x: 4.44, y: 1.1, z: -2.72, rotation: Math.PI, scale: 1 }
  }
};

export const environmentMethods = {
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
  },

  setRoomUpgrades(levels = {}) {
    this.roomUpgradeLevels = levels && typeof levels === 'object' ? { ...levels } : {};
  },

  setDefaultFurnitureTransforms(transforms = {}) {
    this.defaultFurnitureTransforms = transforms && typeof transforms === 'object' ? transforms : {};
  },

  setDefaultFurnitureStored(stored = {}) {
    this.defaultFurnitureStored = stored && typeof stored === 'object' ? stored : {};
    this.applyDefaultFurnitureStored?.();
  },

  applyDefaultFurnitureStored(room = this.roomId) {
    for (const object of this.defaultFurnitureObjects || []) {
      if (!object?.userData?.defaultFurnitureKey) continue;
      const hidden = Boolean(this.defaultFurnitureStored?.[room || this.roomId]?.[object.userData.defaultFurnitureKey]);
      object.visible = !hidden;
      object.userData.defaultFurnitureStored = hidden;
      object.traverse((child) => {
        if (!child.isMesh) return;
        child.userData.buildSelectable = !hidden;
      });
    }
    this.updateDefaultFurnitureAnchors?.();
    this.rebuildDefaultFurnitureObstacles?.();
    this.syncSemanticAnchors?.();
  },

  registerDefaultFurniture(object, key, item, label, anchors = null) {
    if (!object || !key) return object;
    this.defaultFurnitureObjects ||= [];
    const id = `default:${this.roomId}:${key}`;
    object.userData.defaultFurnitureId = id;
    object.userData.defaultFurnitureKey = key;
    object.userData.furnitureItem = item || object.userData.furnitureItem || null;
    object.userData.defaultFurnitureLabel = label || key;
    object.userData.isDefaultFurniture = true;

    const builtIn = BUILT_IN_DEFAULT_FURNITURE_TRANSFORMS?.[this.roomId]?.[key];
    if (builtIn) {
      object.position.set(
        Number.isFinite(Number(builtIn.x)) ? Number(builtIn.x) : object.position.x,
        Math.max(0, Math.min(5.5, Number(builtIn.y) || 0)),
        Number.isFinite(Number(builtIn.z)) ? Number(builtIn.z) : object.position.z
      );
      object.rotation.set(0, Number(builtIn.rotation) || 0, 0);
      object.scale.setScalar(Math.max(0.55, Math.min(2.2, Number(builtIn.scale) || 1)));
    }

    object.userData.defaultBaseTransform = {
      x: object.position.x,
      y: object.position.y,
      z: object.position.z,
      rotation: object.rotation.y,
      scale: object.scale.x || 1
    };
    object.updateMatrixWorld(true);
    if (anchors) {
      object.userData.defaultAnchors = {};
      if (anchors.sleep) object.userData.defaultSleepYawOffset = this.sleepYaw - object.rotation.y;
      for (const [name, worldPoint] of Object.entries(anchors)) {
        if (!worldPoint?.isVector3) continue;
        object.userData.defaultAnchors[name] = object.worldToLocal(worldPoint.clone());
      }
    }
    const saved = this.defaultFurnitureTransforms?.[this.roomId]?.[key];
    if (saved) {
      object.position.set(
        Number.isFinite(Number(saved.x)) ? Number(saved.x) : object.position.x,
        Math.max(0, Math.min(5.5, Number(saved.y) || 0)),
        Number.isFinite(Number(saved.z)) ? Number(saved.z) : object.position.z
      );
      object.rotation.set(0, Number(saved.rotation) || 0, 0);
      object.scale.setScalar(Math.max(0.55, Math.min(2.2, Number(saved.scale) || 1)));
    }
    object.traverse((child) => {
      if (!child.isMesh) return;
      child.userData.defaultFurnitureId = id;
      child.userData.buildSelectable = true;
      child.userData.occlusionCandidate = true;
    });
    this.defaultFurnitureObjects.push(object);
    this.applyDefaultFurnitureStored?.(this.roomId);
    this.updateDefaultFurnitureAnchors(key);
    this.syncSemanticAnchors?.();
    return object;
  },

  getDefaultFurnitureRecords() {
    return (this.defaultFurnitureObjects || []).filter((object) => object.visible !== false && !object.userData?.defaultFurnitureStored).map((object) => ({
      id: object.userData.defaultFurnitureId,
      key: object.userData.defaultFurnitureKey,
      item: object.userData.furnitureItem,
      label: object.userData.defaultFurnitureLabel,
      room: this.roomId,
      isDefault: true,
      x: object.position.x,
      y: object.position.y,
      z: object.position.z,
      rotation: object.rotation.y,
      scale: (object.scale.x + object.scale.y + object.scale.z) / 3
    }));
  },

  findDefaultFurnitureObject(idOrKey) {
    return (this.defaultFurnitureObjects || []).find((object) => object.userData.defaultFurnitureId === idOrKey || object.userData.defaultFurnitureKey === idOrKey) || null;
  },

  updateDefaultFurnitureAnchors(key = null) {
    const objects = key ? [this.findDefaultFurnitureObject(key)].filter(Boolean) : (this.defaultFurnitureObjects || []);
    for (const object of objects) {
      if (!object || object.visible === false || object.userData?.defaultFurnitureStored) continue;
      const anchors = object.userData.defaultAnchors;
      if (!anchors) continue;
      object.updateMatrixWorld(true);
      const world = (name) => anchors[name] ? object.localToWorld(anchors[name].clone()) : null;
      const sleep = world('sleep');
      const wake = world('wake');
      const feed = world('feed');
      const approach = world('feedApproach');
      if (sleep) {
        this.sleepAnchor.set(sleep.x, 0, sleep.z);
        this.sleepSurfaceY = sleep.y;
        if (Number.isFinite(object.userData.defaultSleepYawOffset)) this.sleepYaw = object.rotation.y + object.userData.defaultSleepYawOffset;
      }
      if (wake) this.wakeAnchor.set(wake.x, 0, wake.z);
      if (feed) this.feedAnchor.set(feed.x, 0, feed.z);
      if (approach) this.feedApproach.set(approach.x, 0, approach.z);
    }
    this.syncSemanticAnchors?.();
  },

  rebuildDefaultFurnitureObstacles() {
    this.obstacles = (this.obstacles || []).filter((obstacle) => !obstacle.defaultFurniture);
    for (const object of this.defaultFurnitureObjects || []) {
      if (!object || object.visible === false || object.userData?.defaultFurnitureStored) continue;
      const kind = object.userData?.furnitureItem;
      if (kind === 'rug' || object.position.y > 0.65) continue;
      const box = new THREE.Box3().setFromObject(object);
      if (!Number.isFinite(box.min.x) || box.max.y < 0.15) continue;
      this.obstacles.push({
        minX: box.min.x,
        maxX: box.max.x,
        minZ: box.min.z,
        maxZ: box.max.z,
        defaultFurniture: true,
        defaultFurnitureId: object.userData.defaultFurnitureId
      });
    }
  },

  buildEnvironment(roomId) {
    this.travelLocation = null;
    this.roomId = roomId;
    this.windowGlass = null;
    this.obstacles = [];
    this.defaultFurnitureObjects = [];
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
    const baseRoomSize = ROOM_DIMENSIONS[roomId] || ROOM_DIMENSIONS.living;
    const level = Math.max(0, Math.min(3, Number(this.roomUpgradeLevels?.[roomId]) || 0));
    const scaleSteps = ['garden','park','training'].includes(roomId) ? [1, 1.2, 1.42, 1.68] : [1, 1.18, 1.38, 1.62];
    const roomScale = scaleSteps[level] || 1;
    const roomSize = { width: baseRoomSize.width * roomScale, depth: baseRoomSize.depth * roomScale, wallHeight: baseRoomSize.wallHeight };
    this.currentRoomDimensions = { ...roomSize, level, scale: roomScale };
    const halfWidth = roomSize.width / 2;
    const halfDepth = roomSize.depth / 2;
    const floorMaterial = new THREE.MeshStandardMaterial({ color: palette.floor, roughness: 0.92, metalness: 0 });
    const wallMaterial = new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 1 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.82 });
    const creamMaterial = new THREE.MeshStandardMaterial({ color: 0xfff5df, roughness: 0.9 });
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x9c7154, roughness: 0.92 });

    const floor = this.box(roomSize.width, 0.22, roomSize.depth, floorMaterial, 0, -0.12, 0);
    floor.receiveShadow = true;
    floor.name = 'walk-floor';
    floor.userData.excludeFromOcclusion = true;
    this.environment.add(floor);

    if (roomId !== 'garden' && roomId !== 'park' && roomId !== 'training') {
      const backWall = this.box(roomSize.width, roomSize.wallHeight, 0.22, wallMaterial, 0, roomSize.wallHeight * 0.48, -halfDepth + 0.08);
      const sideWall = this.box(0.22, roomSize.wallHeight, roomSize.depth, wallMaterial, -halfWidth + 0.08, roomSize.wallHeight * 0.48, 0);
      backWall.name = 'room-structure-back-wall';
      sideWall.name = 'room-structure-side-wall';
      backWall.userData.excludeFromOcclusion = true;
      sideWall.userData.excludeFromOcclusion = true;
      this.environment.add(backWall, sideWall);
    }

    if (roomId === 'living') {
      const rug = this.roundedRug(6.4, 4.8, 0xf1c98f); this.environment.add(rug); this.registerDefaultFurniture(rug, 'rug', 'rug', 'Tapete padrão');
      const bed = this.addBed(-4.85, -2.45, accentMaterial, creamMaterial, 1.05);
      this.registerDefaultFurniture(bed, 'bed', 'cozy-bed', 'Cama padrão', {
        sleep: new THREE.Vector3(this.sleepAnchor.x, this.sleepSurfaceY, this.sleepAnchor.z),
        wake: this.wakeAnchor.clone()
      });
      const bowls = this.addBowls(4.75, -2.55, accentMaterial, creamMaterial);
      this.registerDefaultFurniture(bowls, 'bowls', 'bowl', 'Tigelas padrão', { feed: this.feedAnchor.clone(), feedApproach: this.feedApproach.clone() });
      this.registerDefaultFurniture(this.addShelf(-5.8, 1.7, woodMaterial, creamMaterial), 'shelf', 'bookshelf', 'Estante padrão');
      this.addWindow(1.25, -halfDepth + 0.2, palette.sky);
      this.registerDefaultFurniture(this.addLamp(5.4, -3.35, accentMaterial, creamMaterial), 'lamp', 'lamp', 'Luminária padrão');
      this.addDoor(halfWidth - 1.2, -halfDepth + 0.92, woodMaterial);
      this.registerDefaultFurniture(this.addToyBasket(5.25, 2.7, woodMaterial, accentMaterial), 'toy-box', 'toy-box', 'Caixa de brinquedos padrão');
      this.registerDefaultFurniture(this.addSofa(1.3, 2.45, accentMaterial, creamMaterial, 1.18), 'sofa', 'sofa', 'Sofá padrão');
      this.registerDefaultFurniture(this.addCoffeeTable(1.25, 0.65, woodMaterial), 'coffee-table', 'coffee-table', 'Mesa de centro padrão');
      this.registerDefaultFurniture(this.addPlant(6.2, 1.95, 1.18), 'plant-a', 'plant', 'Planta padrão 1');
      this.registerDefaultFurniture(this.addPlant(-0.6, -3.1, 0.92), 'plant-b', 'plant', 'Planta padrão 2');
      this.registerDefaultFurniture(this.addMediaConsole(5.15, 0.35, woodMaterial, creamMaterial, accentMaterial), 'media-console', 'media-console', 'Rack padrão');
    } else if (roomId === 'garden') {
      this.addGarden(accentMaterial, creamMaterial, woodMaterial);
    } else if (roomId === 'bedroom') {
      const rug = this.roundedRug(6.4, 4.7, 0xd6c1df); this.environment.add(rug); this.registerDefaultFurniture(rug, 'rug', 'rug', 'Tapete padrão');
      const bed = this.addBed(-4.35, -2.15, accentMaterial, creamMaterial, 1.5);
      this.registerDefaultFurniture(bed, 'bed', 'cozy-bed', 'Cama padrão', {
        sleep: new THREE.Vector3(this.sleepAnchor.x, this.sleepSurfaceY, this.sleepAnchor.z),
        wake: this.wakeAnchor.clone()
      });
      this.registerDefaultFurniture(this.addLamp(5.25, -3.15, accentMaterial, creamMaterial), 'lamp', 'lamp', 'Luminária padrão');
      this.registerDefaultFurniture(this.addShelf(5.45, 1.65, woodMaterial, creamMaterial), 'shelf', 'bookshelf', 'Estante padrão');
      this.addWindow(0.45, -halfDepth + 0.2, palette.sky);
      this.registerDefaultFurniture(this.addDresser(2.1, 2.7, woodMaterial, creamMaterial), 'dresser', 'dresser', 'Cômoda padrão');
      this.registerDefaultFurniture(this.addDesk(-0.4, 2.35, woodMaterial, creamMaterial, accentMaterial), 'desk', 'desk', 'Escrivaninha padrão');
      this.registerDefaultFurniture(this.addPlant(-5.75, 1.85, 1.1), 'plant', 'plant', 'Planta padrão');
      this.registerDefaultFurniture(this.addArmchair(4.2, 0.55, accentMaterial, creamMaterial, 0.96), 'armchair', 'armchair', 'Poltrona padrão');
    } else if (roomId === 'kitchen') {
      const kitchenDefaults = this.addKitchen(accentMaterial, creamMaterial, woodMaterial);
      kitchenDefaults.forEach(({ object, key, item, label, anchors }) => this.registerDefaultFurniture(object, key, item, label, anchors));
      this.addWindow(0.3, -halfDepth + 0.2, palette.sky);
      this.registerDefaultFurniture(this.addPlant(6.15, 2.6, 0.9), 'plant', 'plant', 'Planta padrão');
    } else if (roomId === 'playroom') {
      const rug = this.roundedRug(7.0, 5.4, 0xf2c4aa); this.environment.add(rug); this.registerDefaultFurniture(rug, 'rug', 'rug', 'Tapete padrão');
      const napBed = this.addBed(-4.9, 2.15, accentMaterial, creamMaterial, 0.88);
      this.registerDefaultFurniture(napBed, 'nap-bed', 'cozy-bed', 'Caminha de soneca padrão', {
        sleep: new THREE.Vector3(this.sleepAnchor.x, this.sleepSurfaceY, this.sleepAnchor.z),
        wake: this.wakeAnchor.clone()
      });
      this.registerDefaultFurniture(this.addToyBasket(-5.2, -2.15, woodMaterial, accentMaterial), 'toy-box', 'toy-box', 'Caixa de brinquedos padrão');
      const ballPit = this.createDecorationMesh('ball-pit');
      ballPit.position.set(4.45, 0, -2.25);
      this.environment.add(ballPit);
      this.registerDefaultFurniture(ballPit, 'ball-pit', 'ball-pit', 'Piscina de bolinhas padrão');
      this.registerDefaultFurniture(this.addShelf(5.35, 2.15, woodMaterial, creamMaterial), 'shelf', 'bookshelf', 'Estante padrão');
      this.registerDefaultFurniture(this.addPlayTunnel(0.2, -1.55, accentMaterial, creamMaterial), 'play-tunnel', 'play-tunnel', 'Túnel padrão');
      this.registerDefaultFurniture(this.addLowTable(2.55, 2.1, woodMaterial, creamMaterial), 'low-table', 'low-play-table', 'Mesa baixa padrão');
      this.registerDefaultFurniture(this.addCatTree(-0.8, 2.28, woodMaterial, accentMaterial, creamMaterial), 'cat-tree', 'cat-tree', 'Torre padrão');
      const scratchPost = this.createDecorationMesh('scratch-post');
      scratchPost.position.set(2.35, 0, -2.05);
      this.environment.add(scratchPost);
      this.registerDefaultFurniture(scratchPost, 'scratch-post', 'scratch-post', 'Arranhador padrão');
      this.registerDefaultFurniture(this.addPlant(5.95, -3.05, 0.92), 'plant', 'plant', 'Planta padrão');
    } else if (roomId === 'bathroom') {
      const defaults = this.addBathroom(accentMaterial, creamMaterial, woodMaterial);
      defaults.forEach((entry) => this.registerDefaultFurniture(entry.object, entry.key, entry.item, entry.label, entry.anchors || null));
    } else if (roomId === 'bathroom') {
      add(-4.45, 2.15, 2.45, 1.55);
      add(5.05, 2.75, 1.25, 1.1);
      add(4.65, -2.2, 1.7, 1.0);
      add(-0.8, -3.15, 1.6, 1.3);
      add(2.35, -2.75, 1.05, 0.9);
      add(0.95, 2.35, 1.05, 0.85);
      add(-5.65, -1.15, 0.9, 1.75);
    } else if (roomId === 'park') {
      this.addPark(accentMaterial, creamMaterial, woodMaterial);
    } else if (roomId === 'training') {
      this.addTraining(accentMaterial, creamMaterial, woodMaterial);
    }
    this.rebuildDefaultFurnitureObstacles();
    this.applyLighting();
    this.setWorldState(this.worldState);
    this.setDecorations(this.decorationRecords);
    this.refreshOccludableObjects?.();
  },


  configureObstacles(roomId) {
    const add = (x, z, width, depth) => this.obstacles.push({
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2
    });
    if (roomId === 'living') {
      add(-4.85, -2.45, 2.7, 2.0);
      add(4.95, -2.55, 2.35, 1.15);
      add(-5.8, 1.82, 2.25, 1.4);
      add(5.4, -3.35, 1.3, 1.2);
      add(5.25, 2.7, 1.8, 1.4);
      add(1.3, 2.45, 3.7, 1.95);
      add(1.25, 0.65, 1.9, 1.15);
      add(5.15, 0.35, 1.95, 0.92);
      add(6.2, 1.95, 0.85, 0.85);
    } else if (roomId === 'garden') {
      add(-6.15, -3.15, 3.2, 3.3);
      add(5.55, 2.65, 2.45, 1.45);
      add(6.15, -2.45, 2.45, 1.45);
      add(-1.35, 3.55, 2.35, 1.25);
    } else if (roomId === 'bedroom') {
      add(-4.35, -2.15, 3.9, 2.85);
      add(5.25, -3.15, 1.3, 1.2);
      add(5.45, 1.72, 2.25, 1.4);
      add(2.1, 2.7, 2.6, 1.05);
      add(-0.4, 2.35, 2.4, 1.2);
      add(4.2, 0.55, 1.75, 1.6);
      add(-5.75, 1.85, 0.85, 0.85);
    } else if (roomId === 'kitchen') {
      add(0, -3.65, 12.2, 1.45);
      add(1.4, 0.95, 4.65, 2.75);
      add(-4.6, -1.95, 2.2, 1.25);
      add(5.55, -2.55, 1.45, 1.45);
      add(4.85, 2.15, 1.9, 0.95);
      add(-5.95, 1.95, 1.55, 1.55);
    } else if (roomId === 'playroom') {
      add(-4.9, 2.15, 2.2, 1.65);
      add(-5.2, -2.15, 1.8, 1.35);
      add(4.45, -2.25, 2.15, 1.75);
      add(5.35, 2.15, 2.25, 1.4);
      add(0.2, -1.55, 2.25, 1.35);
      add(2.55, 2.1, 1.55, 1.55);
      add(-0.8, 2.28, 1.95, 1.55);
      add(2.35, -2.05, 1.1, 1.1);
      add(5.95, -3.05, 0.85, 0.85);
    } else if (roomId === 'park') {
      add(-5.45, 2.55, 2.25, 1.25);
      add(5.3, -2.25, 2.25, 1.25);
      add(0.45, 2.9, 2.4, 1.65);
      add(-0.95, -3.25, 2.2, 1.1);
      add(5.55, 3.25, 2.2, 1.1);
      add(-4.15, -1.15, 1.8, 1.8);
      add(3.1, 0.55, 3.0, 2.2);
      add(3.2, 0.65, 2.2, 1.6);
    } else if (roomId === 'training') {
      add(-6.1, -2.2, 1.8, 0.8);
      add(-3.85, -0.95, 0.8, 1.8);
      add(-1.55, -2.2, 1.8, 0.8);
      add(0.75, -0.95, 0.8, 1.8);
      add(3.05, -2.2, 1.8, 0.8);
      add(-4.45, 2.75, 1.8, 1.0);
      add(1.15, 2.85, 2.6, 0.9);
      add(5.45, 3.05, 2.3, 1.8);
      add(3.35, -3.15, 2.35, 1.2);
      add(-1.15, 2.75, 2.3, 1.1);
      add(5.65, -2.95, 2.25, 1.1);
      add(-6.45, 3.3, 1.8, 0.95);
      add(0.55, -3.55, 1.3, 1.0);
    }
  },

  box(width, height, depth, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  },

  roundedRug(width, depth, color) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(Math.min(width, depth) * 0.5, Math.min(width, depth) * 0.5, 0.05, 32),
      new THREE.MeshStandardMaterial({ color, roughness: 1 })
    );
    mesh.scale.set(width / Math.min(width, depth), 1, depth / Math.min(width, depth));
    mesh.position.y = 0.03;
    mesh.receiveShadow = true;
    return mesh;
  },

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
  },

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
  },

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
  },

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
  },

  getFeedApproach(foodId = 'meal') {
    const desired = this.feedApproach.clone();
    desired.x = this.feedAnchor.x + (foodId === 'water' ? 0.78 : 0.22);
    return this.findSafePetPosition?.(desired, this.currentPet, { interaction: true }) || this.findSafePosition(desired);
  },

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
  },

  addShelf(x, z, wood, cream) {
    const shelf = new THREE.Group();
    shelf.position.set(x, 0, z);
    shelf.add(this.box(1.4, 0.18, 0.55, wood, 0, 0.9, 0));
    shelf.add(this.box(1.4, 0.18, 0.55, wood, 0, 1.8, 0));
    shelf.add(this.box(0.15, 2.05, 0.55, wood, -0.62, 1.05, 0));
    shelf.add(this.box(0.15, 2.05, 0.55, wood, 0.62, 1.05, 0));
    const perchBase = this.box(1.9, 0.16, 0.98, wood, 0, 2.1, 0.12);
    const perchCushion = this.box(1.72, 0.08, 0.84, cream, 0, 2.19, 0.12);
    perchBase.name = 'shelf-perch-base';
    perchCushion.name = 'shelf-perch-surface';
    shelf.add(perchBase, perchCushion);
    for (let i = 0; i < 4; i += 1) {
      const item = this.box(0.2 + i * 0.03, 0.45 + (i % 2) * 0.2, 0.25, cream, -0.45 + i * 0.29, 1.16, 0);
      item.rotation.z = (i - 2) * 0.05;
      shelf.add(item);
    }
    this.environment.add(shelf);
    return shelf;
  },

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
  },

  addLamp(x, z, accent, cream) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xf1e3cf, roughness: 0.42, metalness: 0.08 });
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0xb77a52, roughness: 0.34, metalness: 0.24 });
    const shadeMaterial = new THREE.MeshStandardMaterial({ color: 0xfff5e8, roughness: 0.76, emissive: 0xffd9a2, emissiveIntensity: 0.08, side: THREE.DoubleSide });
    const accentRing = new THREE.MeshStandardMaterial({ color: 0xe5b794, roughness: 0.5, metalness: 0.06 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.12, 22), baseMaterial);
    base.position.y = 0.06;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 1.58, 18), metalMaterial);
    stem.position.y = 0.91;
    stem.castShadow = true;
    group.add(stem);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.028, 10, 26), accentRing);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.55;
    group.add(collar);

    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.62, 0.72, 26, 1, true), shadeMaterial);
    shade.position.y = 1.9;
    shade.castShadow = true;
    shade.receiveShadow = true;
    group.add(shade);

    const diffuser = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 18, 14),
      new THREE.MeshStandardMaterial({ color: 0xffefc8, emissive: 0xffc978, emissiveIntensity: 0.18, roughness: 0.45 })
    );
    diffuser.position.y = 1.72;
    diffuser.scale.set(1, 0.78, 1);
    group.add(diffuser);

    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 10), accentRing);
    finial.position.y = 2.3;
    finial.castShadow = true;
    group.add(finial);

    this.environment.add(group);
    return group;
  },

  addDoor(x, z, wood) {
    const door = this.box(1.45, 2.65, 0.18, wood, x, 1.32, z);
    door.rotation.y = -0.03;
    this.environment.add(door);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe6bd5d, metalness: 0.45, roughness: 0.35 }));
    knob.position.set(x - 0.43, 1.32, z + 0.16);
    this.environment.add(knob);
  },

  addToyBasket(x, z, wood, accent) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const basketMaterial = new THREE.MeshStandardMaterial({ color: 0xae7b55, roughness: 0.88 });
    const innerMaterial = new THREE.MeshStandardMaterial({ color: 0x8d6248, roughness: 0.96 });
    const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xf7ead5, roughness: 0.72 });
    const toyBlue = new THREE.MeshStandardMaterial({ color: 0x7ec6df, roughness: 0.74 });
    const toyYellow = new THREE.MeshStandardMaterial({ color: 0xffdd82, roughness: 0.74 });
    const toyRose = new THREE.MeshStandardMaterial({ color: 0xf1a4a0, roughness: 0.74 });
    const toyMint = new THREE.MeshStandardMaterial({ color: 0x91c9a4, roughness: 0.76 });

    const shell = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.68, 1.02), basketMaterial);
    shell.position.set(0, 0.34, 0);
    shell.castShadow = true;
    shell.receiveShadow = true;
    group.add(shell);

    const cavity = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.46, 0.76), innerMaterial);
    cavity.position.set(0, 0.46, 0);
    group.add(cavity);

    const rim = this.box(1.48, 0.09, 1.08, trimMaterial, 0, 0.72, 0);
    group.add(rim);
    group.add(this.box(1.46, 0.12, 0.08, trimMaterial, 0, 0.4, 0.52));
    group.add(this.box(1.46, 0.12, 0.08, trimMaterial, 0, 0.4, -0.52));
    group.add(this.box(0.08, 0.12, 1.02, trimMaterial, -0.7, 0.4, 0));
    group.add(this.box(0.08, 0.12, 1.02, trimMaterial, 0.7, 0.4, 0));

    const handleLeft = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.032, 12, 24, Math.PI), trimMaterial);
    handleLeft.rotation.z = Math.PI / 2;
    handleLeft.position.set(-0.72, 0.49, 0);
    const handleRight = handleLeft.clone();
    handleRight.position.x = 0.72;
    group.add(handleLeft, handleRight);

    const lidFold = this.box(1.1, 0.05, 0.74, new THREE.MeshStandardMaterial({ color: 0xeccaa3, roughness: 0.76 }), 0, 0.75, 0);
    lidFold.rotation.z = -0.04;
    group.add(lidFold);

    const plushBody = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), toyBlue);
    plushBody.position.set(-0.34, 0.83, -0.08);
    plushBody.scale.set(1.12, 0.94, 1.16);
    group.add(plushBody);
    const plushHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), toyBlue);
    plushHead.position.set(-0.3, 1.02, 0.02);
    group.add(plushHead);
    for (const ex of [-0.37, -0.23]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), toyBlue);
      ear.position.set(ex, 1.12, 0.03);
      group.add(ear);
    }
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), trimMaterial);
    muzzle.position.set(-0.28, 0.98, 0.11);
    muzzle.scale.set(1.1, 0.8, 1.2);
    group.add(muzzle);

    const rope = new THREE.Mesh(new THREE.TorusKnotGeometry(0.18, 0.046, 48, 10, 2, 3), toyRose);
    rope.position.set(0.06, 0.86, -0.04);
    rope.rotation.set(0.52, 0.28, 0.42);
    rope.castShadow = true;
    group.add(rope);

    const bone = new THREE.Group();
    const boneBar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.34, 14), toyYellow);
    boneBar.rotation.z = Math.PI / 2;
    bone.add(boneBar);
    for (const bx of [-0.17, 0.17]) {
      const k1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), toyYellow);
      k1.position.set(bx, 0.05, 0);
      const k2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), toyYellow);
      k2.position.set(bx, -0.05, 0);
      bone.add(k1, k2);
    }
    bone.position.set(0.34, 0.81, 0.12);
    bone.rotation.set(0.28, -0.2, -0.2);
    group.add(bone);

    const foldedBlanket = this.box(0.44, 0.12, 0.28, toyMint, 0.3, 0.8, -0.06);
    group.add(foldedBlanket);

    this.environment.add(group);
    return group;
  },

  addSofa(x, z, accent, cream, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);

    const base = this.box(2.84, 0.26, 1.18, accent, 0, 0.13, 0);
    const seat = this.box(2.66, 0.24, 1.02, cream, 0, 0.38, 0.02);
    const back = this.box(2.84, 0.82, 0.24, accent, 0, 0.66, -0.46);
    const armLeft = this.box(0.28, 0.58, 1.08, accent, -1.28, 0.42, 0);
    const armRight = this.box(0.28, 0.58, 1.08, accent, 1.28, 0.42, 0);
    const underPanel = this.box(2.56, 0.16, 0.9, accent, 0, 0.2, 0.05);

    const leftLeg = this.box(0.12, 0.08, 0.12, accent, -1.08, 0.04, 0.42);
    const rightLeg = this.box(0.12, 0.08, 0.12, accent, 1.08, 0.04, 0.42);
    const leftBackLeg = this.box(0.12, 0.08, 0.12, accent, -1.08, 0.04, -0.42);
    const rightBackLeg = this.box(0.12, 0.08, 0.12, accent, 1.08, 0.04, -0.42);

    group.add(base, seat, back, armLeft, armRight, underPanel, leftLeg, rightLeg, leftBackLeg, rightBackLeg);

    for (let i = 0; i < 3; i += 1) {
      const cushion = this.box(0.72, 0.18, 0.66, cream, -0.9 + i * 0.9, 0.6, 0.08);
      group.add(cushion);
    }
    group.add(this.box(0.58, 0.16, 0.36, cream, -0.84, 0.96, -0.18));
    group.add(this.box(0.58, 0.16, 0.36, cream, 0.84, 0.96, -0.18));

    this.environment.add(group);
    return group;
  },

  addCoffeeTable(x, z, wood) {
    const top = new THREE.MeshStandardMaterial({ color: 0xf5e6d1, roughness: 0.72 });
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.add(this.box(1.55, 0.12, 0.95, top, 0, 0.64, 0));
    group.add(this.box(1.15, 0.08, 0.72, wood, 0, 0.37, 0));
    for (const lx of [-0.55, 0.55]) for (const lz of [-0.33, 0.33]) group.add(this.box(0.1, 0.6, 0.1, wood, lx, 0.3, lz));
    this.environment.add(group);
    return group;
  },

  addPlant(x, z, scale = 1) {
    const potMat = new THREE.MeshStandardMaterial({ color: 0xd49e73, roughness: 0.88 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x65996d, roughness: 0.95 });
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.45, 18), potMat);
    pot.position.y = 0.22;
    pot.castShadow = true;
    pot.receiveShadow = true;
    group.add(pot);
    for (let i = 0; i < 5; i += 1) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2 + (i % 2) * 0.05, 12, 10), leafMat);
      leaf.scale.set(0.9, 1.2, 0.7);
      leaf.position.set((i - 2) * 0.07, 0.65 + i * 0.1, (i % 2 ? 0.09 : -0.07));
      leaf.castShadow = true;
      group.add(leaf);
    }
    this.environment.add(group);
    return group;
  },

  addMediaConsole(x, z, wood, cream, accent) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.add(this.box(1.8, 0.9, 0.65, wood, 0, 0.45, 0));
    group.add(this.box(0.8, 0.45, 0.08, cream, 0, 1.18, 0.33));
    group.add(this.box(1.2, 0.1, 0.55, accent, 0, 0.58, 0.02));
    group.add(this.box(0.24, 0.24, 0.24, cream, -0.62, 1.05, 0));
    group.add(this.box(0.24, 0.24, 0.24, cream, 0.62, 1.05, 0));
    this.environment.add(group);
    return group;
  },

  addDresser(x, z, wood, cream) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.add(this.box(2.2, 1.15, 0.72, wood, 0, 0.58, 0));
    for (let i = 0; i < 3; i += 1) {
      group.add(this.box(1.85, 0.26, 0.06, cream, 0, 0.3 + i * 0.28, 0.34));
      group.add(this.box(0.14, 0.08, 0.08, wood, -0.38, 0.3 + i * 0.28, 0.38));
      group.add(this.box(0.14, 0.08, 0.08, wood, 0.38, 0.3 + i * 0.28, 0.38));
    }
    this.environment.add(group);
    return group;
  },

  addDesk(x, z, wood, cream, accent) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.add(this.box(2.1, 0.14, 1.0, wood, 0, 0.86, 0));
    for (const lx of [-0.85, 0.85]) for (const lz of [-0.35, 0.35]) group.add(this.box(0.12, 0.86, 0.12, wood, lx, 0.43, lz));
    group.add(this.box(0.85, 0.72, 0.58, accent, -0.48, 0.42, 0.05));
    group.add(this.box(0.56, 0.48, 0.06, cream, 0.42, 1.12, -0.05));
    this.environment.add(group);
    return group;
  },

  addArmchair(x, z, accent, cream, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    group.add(this.box(1.15, 0.28, 1.0, accent, 0, 0.38, 0));
    group.add(this.box(1.0, 0.85, 0.22, accent, 0, 0.84, -0.38));
    group.add(this.box(0.22, 0.65, 0.95, accent, -0.46, 0.6, 0));
    group.add(this.box(0.22, 0.65, 0.95, accent, 0.46, 0.6, 0));
    group.add(this.box(0.7, 0.18, 0.68, cream, 0, 0.62, 0.03));
    this.environment.add(group);
    return group;
  },

  addPlayTunnel(x, z, accent, cream) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x87bfd8, roughness: 0.74 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf5e6cd, roughness: 0.76 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0xf0b987, roughness: 0.82 });

    const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.72, 28, 1, true), shellMat);
    shell.rotation.z = Math.PI / 2;
    shell.position.set(0, 0.6, 0);
    shell.castShadow = true;
    shell.receiveShadow = true;
    group.add(shell);

    for (const sx of [-0.38, 0, 0.38]) {
      const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.045, 10, 28), stripeMat);
      stripe.rotation.y = Math.PI / 2;
      stripe.position.set(sx, 0.6, 0);
      group.add(stripe);
    }

    const ringFront = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.075, 10, 30), cream);
    ringFront.rotation.y = Math.PI / 2;
    ringFront.position.set(-0.86, 0.6, 0);
    const ringBack = ringFront.clone();
    ringBack.position.x = 0.86;
    group.add(ringFront, ringBack);

    const cushionFront = this.box(0.58, 0.08, 1.0, cushionMat, -1.04, 0.04, 0);
    const cushionBack = this.box(0.58, 0.08, 1.0, cushionMat, 1.04, 0.04, 0);
    group.add(cushionFront, cushionBack);

    this.environment.add(group);
    return group;
  },

  addLowTable(x, z, wood, cream) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const topMat = new THREE.MeshStandardMaterial({ color: 0xf5e9d8, roughness: 0.78 });
    const accentA = new THREE.MeshStandardMaterial({ color: 0x95c6b1, roughness: 0.82 });
    const accentB = new THREE.MeshStandardMaterial({ color: 0xf2c179, roughness: 0.82 });
    group.add(this.box(1.42, 0.12, 1.2, topMat, 0, 0.54, 0));
    group.add(this.box(1.06, 0.08, 0.82, cream, 0, 0.34, 0));
    for (const lx of [-0.48, 0.48]) for (const lz of [-0.44, 0.44]) group.add(this.box(0.1, 0.48, 0.1, wood, lx, 0.24, lz));
    group.add(this.box(0.94, 0.05, 0.05, wood, 0, 0.18, 0));
    group.add(this.box(0.05, 0.05, 0.74, wood, 0, 0.18, 0));
    group.add(this.box(0.52, 0.03, 0.34, accentA, -0.18, 0.62, -0.14));
    group.add(this.box(0.42, 0.03, 0.26, accentB, 0.26, 0.62, 0.12));
    this.environment.add(group);
    return group;
  },

  addCatTree(x, z, wood, accent, cream) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd6c1a1, roughness: 0.92 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0xb78b63, roughness: 0.84 });

    group.add(this.box(1.34, 0.14, 1.08, darkMat, 0, 0.07, 0));
    group.add(this.box(0.22, 1.26, 0.22, ropeMat, -0.38, 0.63, 0.12));
    group.add(this.box(0.22, 1.92, 0.22, ropeMat, 0.42, 0.96, -0.04));
    group.add(this.box(0.18, 1.08, 0.18, ropeMat, 0.0, 0.54, -0.28));

    const condo = new THREE.Group();
    condo.position.set(-0.05, 0.95, 0.05);
    condo.add(this.box(1.06, 0.72, 0.86, accent, 0, 0, 0));
    condo.add(this.box(0.82, 0.5, 0.08, cream, 0, -0.02, 0.39));
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 16, 1, false, Math.PI, Math.PI), darkMat);
    arch.rotation.z = Math.PI / 2;
    arch.position.set(0, 0.02, 0.42);
    condo.add(arch);
    condo.add(this.box(0.32, 0.18, 0.08, darkMat, 0, -0.2, 0.42));
    group.add(condo);

    group.add(this.box(1.16, 0.12, 0.86, accent, -0.06, 1.46, 0.05));
    group.add(this.box(0.96, 0.08, 0.66, cream, -0.06, 1.58, 0.05));
    group.add(this.box(0.9, 0.12, 0.72, accent, 0.32, 2.02, -0.02));
    group.add(this.box(0.74, 0.08, 0.54, cream, 0.32, 2.14, -0.02));
    group.add(this.box(0.08, 0.36, 0.08, darkMat, 0.66, 2.3, 0.0));

    this.environment.add(group);
    return group;
  },

  addGarden(accent, cream, wood) {
    const path = this.box(4.1, 0.05, 10.8, new THREE.MeshStandardMaterial({ color: 0xd7c399, roughness: 1 }), 0.25, 0.03, 0);
    path.receiveShadow = true;
    this.environment.add(path);

    const groundLeafMat = new THREE.MeshStandardMaterial({ color: 0x76a664, roughness: 1 });
    for (let i = 0; i < 18; i += 1) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.12 + (i % 3) * 0.03, 0.22 + (i % 2) * 0.05, 7), groundLeafMat);
      const tx = randomBetween(-7.5, 7.5);
      const tz = randomBetween(-5.6, 5.6);
      if (Math.abs(tx) < 2.2 && Math.abs(tz) < 5) continue;
      tuft.position.set(tx, 0.11, tz);
      tuft.castShadow = true;
      this.environment.add(tuft);
    }

    for (let i = 0; i < 32; i += 1) {
      const flower = new THREE.Group();
      const px = randomBetween(-7.2, 7.2);
      const pz = randomBetween(-5.2, 5.2);
      if (Math.abs(px) < 2.4 && Math.abs(pz) < 5.0) continue;
      const stem = this.box(0.045, randomBetween(0.24, 0.42), 0.045, new THREE.MeshStandardMaterial({ color: 0x4f8a57 }), 0, 0.18, 0);
      flower.add(stem);
      const petalMat = i % 3 === 0 ? accent : i % 3 === 1 ? cream : new THREE.MeshStandardMaterial({ color: 0xffb9a6, roughness: 0.82 });
      for (let p = 0; p < 5; p += 1) {
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), petalMat);
        const angle = (Math.PI * 2 * p) / 5;
        petal.position.set(Math.cos(angle) * 0.085, 0.38, Math.sin(angle) * 0.085);
        petal.scale.set(1.1, 0.72, 0.8);
        flower.add(petal);
      }
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffd971, roughness: 0.8 }));
      center.position.y = 0.38;
      flower.add(center);
      flower.position.set(px, 0, pz);
      this.environment.add(flower);
    }

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8f6649, roughness: 0.94 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 3.05, 12), trunkMat);
    trunk.position.set(-6.15, 1.52, -3.15);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    this.environment.add(trunk);

    const rootLeft = this.box(0.62, 0.16, 0.22, trunkMat, -6.45, 0.08, -2.88);
    rootLeft.rotation.y = 0.5;
    const rootRight = this.box(0.62, 0.16, 0.22, trunkMat, -5.88, 0.08, -3.38);
    rootRight.rotation.y = -0.55;
    this.environment.add(rootLeft, rootRight);

    const crownMatA = new THREE.MeshStandardMaterial({ color: 0x5c9c67, roughness: 0.96 });
    const crownMatB = new THREE.MeshStandardMaterial({ color: 0x78b06f, roughness: 0.96 });
    const crownSpecs = [
      [-6.45, 3.35, -3.22, 1.08, crownMatA],
      [-5.62, 3.5, -3.04, 1.0, crownMatB],
      [-6.12, 4.05, -3.18, 1.16, crownMatA],
      [-5.95, 3.68, -2.4, 0.9, crownMatB],
      [-6.72, 3.75, -2.7, 0.92, crownMatB],
      [-6.18, 4.55, -3.1, 0.86, crownMatA]
    ];
    for (const [cx, cy, cz, size, mat] of crownSpecs) {
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), mat);
      crown.position.set(cx, cy, cz);
      crown.castShadow = true;
      crown.receiveShadow = true;
      this.environment.add(crown);
    }

    const branch = this.box(1.72, 0.22, 0.48, trunkMat, -5.68, 1.14, -2.58);
    branch.rotation.y = -Math.PI / 4;
    branch.name = 'garden-tree-branch';
    const treePerch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.74, 0.8, 0.16, 18),
      new THREE.MeshStandardMaterial({ color: 0xa17858, roughness: 0.92 })
    );
    treePerch.position.set(-5.22, 1.22, -2.38);
    treePerch.name = 'garden-tree-perch-surface';
    treePerch.castShadow = true;
    treePerch.receiveShadow = true;
    this.environment.add(branch, treePerch);

    this.registerDefaultFurniture(this.addBench(5.55, 2.65, wood), 'bench-a', 'garden-bench', 'Banco padrão 1');
    this.registerDefaultFurniture(this.addBench(6.15, -2.45, wood), 'bench-b', 'garden-bench', 'Banco padrão 2');
    this.registerDefaultFurniture(this.addPlanterBox(-1.35, 3.55, wood, accent, cream), 'planter-a', 'planter', 'Jardineira padrão 1');
    this.registerDefaultFurniture(this.addPlanterBox(2.25, -4.05, wood, accent, cream), 'planter-b', 'planter', 'Jardineira padrão 2');
  },

  addBench(x, z, wood) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const woodSeat = new THREE.MeshStandardMaterial({ color: 0xb07c54, roughness: 0.82 });
    const woodBack = new THREE.MeshStandardMaterial({ color: 0xbf8a60, roughness: 0.8 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x62564f, roughness: 0.52, metalness: 0.24 });
    const boltMat = new THREE.MeshStandardMaterial({ color: 0xd0b394, roughness: 0.38, metalness: 0.22 });

    for (const [i, offset] of [-0.24, -0.08, 0.08, 0.24].entries()) {
      const slat = this.box(2.18, 0.05, 0.11, woodSeat, 0, 0.66 + i * 0.014, offset);
      group.add(slat);
    }

    for (const [i, offset] of [-0.14, 0.03, 0.2, 0.37].entries()) {
      const slat = this.box(2.02, 0.05, 0.095, woodBack, 0, 1.03 + i * 0.16, offset);
      slat.rotation.x = -0.2;
      group.add(slat);
    }

    const topRail = this.box(2.08, 0.08, 0.08, woodBack, 0, 1.67, 0.46);
    topRail.rotation.x = -0.2;
    group.add(topRail);

    const sideFrame = (mirror = 1) => {
      const frame = new THREE.Group();
      frame.scale.x = mirror;
      const frontLeg = this.box(0.1, 0.72, 0.16, metal, 0.89, 0.36, 0.3);
      const rearLeg = this.box(0.1, 1.03, 0.16, metal, 0.9, 0.52, -0.18);
      rearLeg.rotation.z = 0.08 * mirror;
      const arm = this.box(0.11, 0.11, 0.64, metal, 1.01, 0.92, 0.03);
      arm.rotation.z = 0.2 * mirror;
      const upperSupport = this.box(0.09, 0.34, 0.12, metal, 0.95, 1.2, 0.32);
      upperSupport.rotation.z = 0.16 * mirror;
      const lowerCurve = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 10, 20, Math.PI * 0.82), metal);
      lowerCurve.rotation.set(Math.PI / 2, 0, Math.PI * 0.56 * mirror);
      lowerCurve.position.set(0.88, 0.18, 0.08);
      frame.add(frontLeg, rearLeg, arm, upperSupport, lowerCurve);
      return frame;
    };
    group.add(sideFrame(1), sideFrame(-1));

    group.add(this.box(1.82, 0.06, 0.08, metal, 0, 0.48, 0.29));
    group.add(this.box(1.78, 0.06, 0.08, metal, 0, 0.57, -0.16));
    group.add(this.box(1.52, 0.06, 0.08, metal, 0, 0.22, 0.06));

    for (const bx of [-0.76, -0.26, 0.26, 0.76]) {
      const boltSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10), boltMat);
      boltSeat.rotation.x = Math.PI / 2;
      boltSeat.position.set(bx, 0.71, -0.27);
      const boltBack = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10), boltMat);
      boltBack.rotation.x = Math.PI / 2;
      boltBack.position.set(bx, 1.16, 0.18);
      group.add(boltSeat, boltBack);
    }

    this.environment.add(group);
    return group;
  },

  addKitchen(accent, cream, wood) {
    const defaults = [];
    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0xf5efe1, roughness: 0.82 });
    const counterTopMat = new THREE.MeshStandardMaterial({ color: 0xd9c7ae, roughness: 0.58 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x9e7555, roughness: 0.84 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xcfd4d8, roughness: 0.34, metalness: 0.42 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x474d52, roughness: 0.56, metalness: 0.2 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xa6d6de, roughness: 0.22, metalness: 0.06, transparent: true, opacity: 0.55 });

    const counterGroup = new THREE.Group();
    counterGroup.position.set(0, 0, -3.65);
    const base = this.box(12.0, 0.98, 1.08, cabinetMat, 0, 0.49, 0);
    const top = this.box(12.18, 0.08, 1.2, counterTopMat, 0, 1.01, 0);
    const backsplash = this.box(12.1, 0.22, 0.08, trimMat, 0, 1.16, -0.56);
    counterGroup.add(base, top, backsplash);
    for (let i = 0; i < 7; i += 1) {
      const x = -4.65 + i * 1.55;
      counterGroup.add(this.box(1.24, 0.72, 0.06, trimMat, x, 0.48, 0.5));
      counterGroup.add(this.box(0.11, 0.11, 0.05, darkMat, x - 0.28, 0.48, 0.55));
      counterGroup.add(this.box(0.11, 0.11, 0.05, darkMat, x + 0.28, 0.48, 0.55));
    }
    const sink = this.box(1.2, 0.05, 0.62, steelMat, 2.3, 1.04, -0.02);
    const faucetStem = this.box(0.06, 0.34, 0.06, steelMat, 2.72, 1.25, -0.1);
    const faucetNeck = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 10, 18, Math.PI), steelMat);
    faucetNeck.rotation.z = Math.PI / 2;
    faucetNeck.position.set(2.58, 1.38, -0.08);
    counterGroup.add(sink, faucetStem, faucetNeck);
    this.environment.add(counterGroup);
    defaults.push({ object: counterGroup, key: 'counter', item: 'kitchen-island', label: 'Bancada padrão' });

    const stoveGroup = new THREE.Group();
    stoveGroup.position.set(-2.05, 0, -2.58);
    stoveGroup.add(this.box(1.28, 0.92, 0.92, new THREE.MeshStandardMaterial({ color: 0xf1f4f5, roughness: 0.42 }), 0, 0.46, 0));
    const hob = this.box(1.22, 0.08, 0.86, darkMat, 0, 0.94, 0);
    stoveGroup.add(hob);
    for (const hx of [-0.33, 0.33]) for (const hz of [-0.22, 0.22]) {
      const burner = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 10, 18), steelMat);
      burner.rotation.x = Math.PI / 2;
      burner.position.set(hx, 0.99, hz);
      stoveGroup.add(burner);
    }
    const ovenDoor = this.box(0.82, 0.48, 0.04, glassMat, 0, 0.43, 0.47);
    const handle = this.box(0.68, 0.04, 0.04, steelMat, 0, 0.63, 0.49);
    stoveGroup.add(ovenDoor, handle);
    for (const knobX of [-0.32, -0.1, 0.12, 0.34]) {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 14), steelMat);
      knob.rotation.z = Math.PI / 2;
      knob.position.set(knobX, 0.8, 0.49);
      stoveGroup.add(knob);
    }
    this.environment.add(stoveGroup);
    defaults.push({ object: stoveGroup, key: 'stove', item: 'pantry', label: 'Fogão padrão' });

    const tableGroup = new THREE.Group();
    tableGroup.position.set(1.4, 0, 0.95);
    tableGroup.add(this.box(4.2, 0.18, 2.4, trimMat, 0, 0.96, 0));
    tableGroup.add(this.box(3.55, 0.08, 1.9, counterTopMat, 0, 1.09, 0));
    for (const x of [-1.72, 1.72]) for (const z of [-1.02, 1.02]) tableGroup.add(this.box(0.16, 0.92, 0.16, trimMat, x, 0.46, z));
    this.environment.add(tableGroup);
    defaults.push({ object: tableGroup, key: 'dining-table', item: 'dining-table', label: 'Mesa de jantar padrão' });

    const stools = new THREE.Group();
    stools.position.set(1.9, 0, 2.15);
    const addStool = (x) => {
      const stool = new THREE.Group();
      stool.position.x = x;
      stool.add(this.box(0.5, 0.08, 0.5, accent, 0, 0.7, 0));
      stool.add(this.box(0.44, 0.12, 0.12, accent, 0, 1.02, -0.16));
      stool.add(this.box(0.06, 0.34, 0.06, accent, -0.18, 0.88, -0.16));
      stool.add(this.box(0.06, 0.34, 0.06, accent, 0.18, 0.88, -0.16));
      for (const lx of [-0.18, 0.18]) for (const lz of [-0.18, 0.18]) stool.add(this.box(0.06, 0.66, 0.06, trimMat, lx, 0.33, lz));
      stool.add(this.box(0.36, 0.05, 0.05, trimMat, 0, 0.18, 0));
      stool.add(this.box(0.05, 0.05, 0.36, trimMat, 0, 0.18, 0));
      stools.add(stool);
    };
    [-2.1, -0.7, 0.7, 2.1].forEach(addStool);
    this.environment.add(stools);
    defaults.push({ object: stools, key: 'stools', item: 'stool-pair', label: 'Banquetas padrão' });

    const fridgeGroup = new THREE.Group();
    fridgeGroup.position.set(5.55, 0, -2.55);
    fridgeGroup.add(this.box(1.18, 2.18, 1.08, new THREE.MeshStandardMaterial({ color: 0xf4f7f8, roughness: 0.36 }), 0, 1.09, 0));
    fridgeGroup.add(this.box(1.16, 0.04, 1.02, darkMat, 0, 1.55, 0.52));
    fridgeGroup.add(this.box(0.06, 0.68, 0.05, steelMat, 0.45, 1.88, 0.56));
    fridgeGroup.add(this.box(0.06, 0.82, 0.05, steelMat, 0.45, 0.88, 0.56));
    fridgeGroup.add(this.box(0.28, 0.18, 0.03, glassMat, -0.18, 1.92, 0.56));
    fridgeGroup.add(this.box(0.14, 0.14, 0.03, accent, 0.2, 1.93, 0.56));
    this.environment.add(fridgeGroup);
    defaults.push({ object: fridgeGroup, key: 'fridge', item: 'pantry', label: 'Geladeira padrão' });

    const pantryGroup = new THREE.Group();
    pantryGroup.position.set(4.85, 0, 2.15);
    pantryGroup.add(this.box(1.5, 1.95, 0.82, trimMat, 0, 0.98, 0));
    pantryGroup.add(this.box(1.3, 1.55, 0.06, cabinetMat, 0, 0.95, 0.39));
    pantryGroup.add(this.box(0.1, 0.1, 0.05, darkMat, -0.26, 0.95, 0.43));
    pantryGroup.add(this.box(0.1, 0.1, 0.05, darkMat, 0.26, 0.95, 0.43));
    pantryGroup.add(this.box(1.18, 0.06, 0.62, counterTopMat, 0, 1.78, 0));
    this.environment.add(pantryGroup);
    defaults.push({ object: pantryGroup, key: 'pantry', item: 'pantry', label: 'Despensa padrão' });

    const cabinetGroup = new THREE.Group();
    cabinetGroup.position.set(-5.95, 0, 1.95);
    cabinetGroup.add(this.box(1.2, 1.34, 1.12, trimMat, 0, 0.67, 0));
    cabinetGroup.add(this.box(1.0, 1.0, 0.06, cabinetMat, 0, 0.68, 0.53));
    cabinetGroup.add(this.box(0.08, 0.08, 0.05, darkMat, -0.24, 0.68, 0.57));
    cabinetGroup.add(this.box(0.08, 0.08, 0.05, darkMat, 0.24, 0.68, 0.57));
    cabinetGroup.add(this.box(1.06, 0.06, 0.86, counterTopMat, 0, 1.39, 0));
    this.environment.add(cabinetGroup);
    defaults.push({ object: cabinetGroup, key: 'cabinet', item: 'pantry', label: 'Armário padrão' });

    const upperCabinets = new THREE.Group();
    upperCabinets.position.set(-0.45, 0, -2.98);
    for (let i = 0; i < 3; i += 1) {
      const gx = -2.1 + i * 2.1;
      upperCabinets.add(this.box(1.5, 0.84, 0.52, cabinetMat, gx, 2.34, 0));
      upperCabinets.add(this.box(1.22, 0.58, 0.06, trimMat, gx, 2.33, 0.25));
      upperCabinets.add(this.box(0.09, 0.09, 0.04, darkMat, gx, 2.33, 0.29));
    }
    this.environment.add(upperCabinets);
    defaults.push({ object: upperCabinets, key: 'upper-cabinets', item: 'pantry', label: 'Armários aéreos padrão' });

    const bowls = this.addBowls(-4.6, -1.95, accent, cream);
    defaults.push({ object: bowls, key: 'bowls', item: 'bowl', label: 'Tigelas padrão', anchors: { feed: this.feedAnchor.clone(), feedApproach: this.feedApproach.clone() } });
    return defaults;
  },


  createBathroomFurnitureMesh(item, accent, cream, wood) {
    if (typeof this.createDecorationMesh === 'function') return this.createDecorationMesh(item);

    const group = new THREE.Group();
    const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xf8fbfc, roughness: 0.28, metalness: 0.02, clearcoat: 0.16 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xc7d2d8, roughness: 0.18, metalness: 0.72 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xdff4fb, transparent: true, opacity: 0.46, roughness: 0.08, transmission: 0.34, depthWrite: false });
    const water = new THREE.MeshPhysicalMaterial({ color: 0x9edbec, transparent: true, opacity: 0.76, roughness: 0.06, transmission: 0.2 });
    const fabric = new THREE.MeshStandardMaterial({ color: 0xbfd9e2, roughness: 0.92 });
    const wicker = new THREE.MeshStandardMaterial({ color: 0xb88d6d, roughness: 0.96 });

    if (item === 'bathtub') {
      const shell = new THREE.Mesh(new THREE.CapsuleGeometry(0.52, 1.18, 8, 16), porcelain);
      shell.rotation.z = Math.PI / 2;
      shell.position.y = 0.48;
      shell.scale.set(1.02, 0.84, 1.08);
      group.add(shell);
      const fill = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.92, 8, 16), water);
      fill.rotation.z = Math.PI / 2;
      fill.position.set(-0.04, 0.6, 0);
      fill.scale.set(0.96, 0.28, 0.72);
      group.add(fill);
      const basePlate = this.box(0.34, 0.05, 0.18, chrome, 0.78, 0.82, -0.28);
      group.add(basePlate);
      const faucetCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.76, 0.84, -0.28),
        new THREE.Vector3(0.78, 1.06, -0.28),
        new THREE.Vector3(0.68, 1.18, -0.26),
        new THREE.Vector3(0.48, 1.2, -0.2),
        new THREE.Vector3(0.32, 1.08, -0.12)
      ]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(faucetCurve, 28, 0.028, 10, false), chrome));
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.09, 12), chrome);
      nozzle.rotation.z = Math.PI / 2;
      nozzle.position.set(0.29, 1.08, -0.12);
      group.add(nozzle);
      for (const [x, color] of [[0.58, 0x8cc7d9], [0.92, 0xe9b19a]]) {
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 14), new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.08 }));
        knob.rotation.x = Math.PI / 2;
        knob.position.set(x, 0.83, -0.38);
        group.add(knob);
      }
    } else if (item === 'toilet') {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.31, 0.44, 20), porcelain);
      base.position.set(0, 0.22, 0.08);
      base.scale.z = 1.18;
      group.add(base);
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.28, 22), porcelain);
      bowl.position.set(0, 0.48, 0.05);
      bowl.scale.z = 1.16;
      group.add(bowl);
      const seat = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.045, 12, 26), cream);
      seat.rotation.x = Math.PI / 2;
      seat.position.set(0, 0.67, 0.05);
      seat.scale.y = 1.12;
      group.add(seat);
      group.add(this.box(0.58, 0.62, 0.28, porcelain, 0, 1.08, -0.34));
      group.add(this.box(0.6, 0.05, 0.3, cream, 0, 1.42, -0.34));
    } else if (item === 'sink') {
      const face = new THREE.MeshStandardMaterial({ color: 0xb9d1d8, roughness: 0.48 });
      const darkChrome = new THREE.MeshStandardMaterial({ color: 0x65747c, roughness: 0.2, metalness: 0.72 });
      group.add(this.box(1.5, 0.72, 0.62, wood, 0, 0.43, 0));
      group.add(this.box(0.62, 0.54, 0.045, face, -0.35, 0.45, 0.335));
      group.add(this.box(0.62, 0.54, 0.045, face, 0.35, 0.45, 0.335));
      group.add(this.box(1.68, 0.09, 0.76, porcelain, 0, 0.86, 0));
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xe7f2f5, roughness: 0.32 }));
      bowl.position.set(-0.16, 0.84, 0.02);
      bowl.rotation.x = Math.PI;
      bowl.scale.set(1.2, 0.38, 0.82);
      group.add(bowl);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.035, 12, 32), porcelain);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(-0.16, 0.91, 0.02);
      rim.scale.set(1.24, 0.84, 1);
      group.add(rim);
      const faucetCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.38, 0.91, -0.2),
        new THREE.Vector3(0.38, 1.08, -0.2),
        new THREE.Vector3(0.3, 1.19, -0.18),
        new THREE.Vector3(0.12, 1.22, -0.12),
        new THREE.Vector3(-0.04, 1.13, -0.04)
      ]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(faucetCurve, 28, 0.026, 10, false), chrome));
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.034, 0.09, 12), chrome);
      nozzle.position.set(-0.04, 1.085, -0.04);
      group.add(nozzle);
      const lever = this.box(0.035, 0.16, 0.035, darkChrome, 0.54, 1.0, -0.19);
      lever.rotation.z = -0.18;
      group.add(lever);
    } else if (item === 'mirror') {
      const frame = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.055, 12, 30), chrome);
      frame.position.y = 0.58;
      group.add(frame);
      const face = new THREE.Mesh(new THREE.CircleGeometry(0.37, 30), new THREE.MeshStandardMaterial({ color: 0xdcecf3, roughness: 0.12, metalness: 0.12 }));
      face.position.set(0, 0.58, 0.015);
      group.add(face);
    } else if (item === 'shower') {
      group.add(this.box(1.34, 0.1, 1.04, cream, 0, 0.05, 0));
      group.add(this.box(1.24, 2.0, 0.06, glass, 0, 1.0, -0.49));
      group.add(this.box(0.06, 2.0, 0.98, glass, -0.6, 1.0, 0));
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.22, 12), chrome);
      pipe.position.set(0.38, 1.34, -0.38);
      group.add(pipe);
    } else if (item === 'hamper') {
      group.add(this.box(0.72, 0.76, 0.62, wicker, 0, 0.38, 0));
      group.add(this.box(0.62, 0.05, 0.52, cream, 0, 0.76, 0));
      for (const x of [-0.2, 0.2]) {
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 18, Math.PI), wood);
        handle.position.set(x, 0.62, 0.34);
        group.add(handle);
      }
    } else if (item === 'bath-stool') {
      group.add(this.box(0.7, 0.12, 0.56, cream, 0, 0.48, 0));
      for (const x of [-0.25, 0.25]) for (const z of [-0.18, 0.18]) group.add(this.box(0.08, 0.46, 0.08, wood, x, 0.23, z));
    } else if (item === 'bath-cabinet') {
      group.add(this.box(1.1, 1.55, 0.48, wood, 0, 0.78, 0));
      group.add(this.box(0.92, 0.64, 0.04, cream, 0, 1.08, 0.26));
      group.add(this.box(0.92, 0.64, 0.04, cream, 0, 0.38, 0.26));
    } else if (item === 'towel-rack') {
      group.add(this.box(1.0, 0.05, 0.05, chrome, 0, 0.9, 0));
      group.add(this.box(0.4, 0.62, 0.04, fabric, -0.25, 0.56, 0.02));
      group.add(this.box(0.4, 0.62, 0.04, fabric, 0.25, 0.56, 0.02));
    } else if (item === 'bath-mat') {
      group.add(this.box(1.8, 0.035, 1.05, fabric, 0, 0.018, 0));
    } else {
      group.add(this.box(1.0, 0.55, 0.8, cream, 0, 0.28, 0));
    }

    group.userData.furnitureItem = item;
    group.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.occlusionCandidate = true;
    });
    return group;
  },


  addBathroom(accent, cream, wood) {
    const defaults = [];
    const tileMaterial = new THREE.MeshStandardMaterial({ color: 0xe8f1f3, roughness: 0.92 });
    const groutMaterial = new THREE.MeshStandardMaterial({ color: 0xc8d7dc, roughness: 0.94 });
    const wallTileMaterial = new THREE.MeshStandardMaterial({ color: 0xdcecf1, roughness: 0.88 });

    const tileInset = this.box(10.8, 0.025, 7.4, tileMaterial, 0, 0.012, 0.15);
    this.environment.add(tileInset);
    for (let x = -5; x <= 5; x += 1) this.environment.add(this.box(0.018, 0.03, 7.35, groutMaterial, x, 0.03, 0.15));
    for (let z = -3; z <= 3; z += 1) this.environment.add(this.box(10.75, 0.03, 0.018, groutMaterial, 0, 0.03, z + 0.15));
    this.environment.add(this.box(10.6, 1.25, 0.06, wallTileMaterial, 0.15, 0.65, -4.66));
    this.environment.add(this.box(0.06, 1.25, 7.25, wallTileMaterial, -6.96, 0.65, 0.1));

    const mat = this.createBathroomFurnitureMesh('bath-mat', accent, cream, wood);
    mat.position.set(-2.6, 0, 1.1);
    mat.rotation.y = -0.08;
    this.environment.add(mat);
    defaults.push({ object: mat, key: 'bath-mat', item: 'bath-mat', label: 'Tapete de banho padrão' });

    const tub = this.createBathroomFurnitureMesh('bathtub', accent, cream, wood);
    tub.position.set(-4.45, 0, 2.15);
    tub.rotation.y = Math.PI / 10;
    this.environment.add(tub);
    defaults.push({ object: tub, key: 'bathtub', item: 'bathtub', label: 'Banheira padrão' });

    const toilet = this.createBathroomFurnitureMesh('toilet', accent, cream, wood);
    toilet.position.set(4.9, 0, 2.65);
    toilet.rotation.y = Math.PI;
    this.environment.add(toilet);
    defaults.push({ object: toilet, key: 'toilet', item: 'toilet', label: 'Privada padrão' });

    const sink = this.createBathroomFurnitureMesh('sink', accent, cream, wood);
    sink.position.set(4.55, 0, -2.15);
    sink.rotation.y = Math.PI;
    this.environment.add(sink);
    defaults.push({ object: sink, key: 'sink', item: 'sink', label: 'Pia padrão' });

    const mirror = this.createBathroomFurnitureMesh('mirror', accent, cream, wood);
    mirror.position.set(4.65, 0.55, -2.72);
    mirror.rotation.y = Math.PI;
    this.environment.add(mirror);
    defaults.push({ object: mirror, key: 'mirror', item: 'mirror', label: 'Espelho padrão' });

    const shower = this.createBathroomFurnitureMesh('shower', accent, cream, wood);
    shower.position.set(-0.8, 0, -3.15);
    shower.rotation.y = Math.PI / 2;
    this.environment.add(shower);
    defaults.push({ object: shower, key: 'shower', item: 'shower', label: 'Chuveiro padrão' });

    const hamper = this.createBathroomFurnitureMesh('hamper', accent, cream, wood);
    hamper.position.set(2.35, 0, -2.75);
    hamper.rotation.y = -0.08;
    this.environment.add(hamper);
    defaults.push({ object: hamper, key: 'hamper', item: 'hamper', label: 'Cesto de roupa padrão' });

    const stool = this.createBathroomFurnitureMesh('bath-stool', accent, cream, wood);
    stool.position.set(0.95, 0, 2.35);
    stool.rotation.y = 0.2;
    this.environment.add(stool);
    defaults.push({ object: stool, key: 'bath-stool', item: 'bath-stool', label: 'Banqueta de spa padrão' });

    const cabinet = this.createBathroomFurnitureMesh('bath-cabinet', accent, cream, wood);
    cabinet.position.set(-5.65, 0, -1.15);
    cabinet.rotation.y = Math.PI / 2;
    this.environment.add(cabinet);
    defaults.push({ object: cabinet, key: 'bath-cabinet', item: 'bath-cabinet', label: 'Armário de banheiro padrão' });

    const towelRack = this.createBathroomFurnitureMesh('towel-rack', accent, cream, wood);
    towelRack.position.set(1.25, 0.15, -4.5);
    this.environment.add(towelRack);
    defaults.push({ object: towelRack, key: 'towel-rack', item: 'towel-rack', label: 'Toalheiro padrão' });

    const plant = this.addPlant(-5.95, -3.15, 0.9);
    defaults.push({ object: plant, key: 'bath-plant', item: 'plant', label: 'Planta padrão banheiro' });

    const candleTray = new THREE.Group();
    candleTray.position.set(-3.45, 0.68, 2.55);
    candleTray.add(this.box(0.56, 0.04, 0.24, wood, 0, 0, 0));
    for (const x of [-0.18, 0, 0.18]) {
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.14 + Math.abs(x) * 0.18, 12), cream);
      candle.position.set(x, 0.09, 0);
      candleTray.add(candle);
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffd276, emissive: 0xffa63d, emissiveIntensity: 0.22, roughness: 0.4 }));
      flame.scale.y = 1.5;
      flame.position.set(x, 0.19 + Math.abs(x) * 0.09, 0);
      candleTray.add(flame);
    }
    this.environment.add(candleTray);

    this.addWindow(-2.4, -this.currentRoomDimensions.depth / 2 + 0.2, 0xd7eff8);
    this.addDoor(this.currentRoomDimensions.width / 2 - 1.15, -this.currentRoomDimensions.depth / 2 + 0.92, wood);
    return defaults;
  },

  addToyShapes() {
    const materials = [0xff9a78, 0x7bc5de, 0xf5d16e, 0xa78bd1].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
    for (let i = 0; i < 12; i += 1) {
      const geo = i % 2 ? new THREE.IcosahedronGeometry(0.35 + (i % 3) * 0.06, 1) : new THREE.BoxGeometry(0.55, 0.55, 0.55);
      const shape = new THREE.Mesh(geo, materials[i % materials.length]);
      shape.position.set(randomBetween(-4.6, 4.6), 0.35, randomBetween(-3.5, 3.4));
      shape.rotation.set(randomBetween(0, 1), randomBetween(0, 1), randomBetween(0, 1));
      shape.castShadow = true;
      this.environment.add(shape);
    }
  },

  addPark(accent, cream, wood) {
    const path = this.box(2.8, 0.05, 10.9, new THREE.MeshStandardMaterial({ color: 0xd8c6a1, roughness: 1 }), 0.6, 0.03, 0);
    this.environment.add(path);
    {
      const benchA = this.addBench(-5.45, 2.55, wood);
      benchA.rotation.y = Math.PI;
      this.registerDefaultFurniture(benchA, 'bench-a', 'garden-bench', 'Banco padrão 1');
    }
    {
      const benchB = this.addBench(5.3, -2.25, wood);
      benchB.rotation.y = Math.PI;
      this.registerDefaultFurniture(benchB, 'bench-b', 'garden-bench', 'Banco padrão 2');
    }
    this.registerDefaultFurniture(this.addPicnicTable(0.45, 2.9, wood, cream), 'picnic-table', 'picnic-table', 'Mesa de piquenique padrão');
    this.registerDefaultFurniture(this.addPlanterBox(-0.95, -3.25, wood, accent, cream), 'planter-a', 'planter', 'Jardineira padrão 1');
    this.registerDefaultFurniture(this.addPlanterBox(5.55, 3.25, wood, accent, cream), 'planter-b', 'planter', 'Jardineira padrão 2');

    const fountain = this.createDecorationMesh('fountain');
    fountain.position.set(-4.15, 0, -1.15);
    this.environment.add(fountain);
    this.registerDefaultFurniture(fountain, 'fountain', 'fountain', 'Fonte padrão');

    const canopy = this.createDecorationMesh('pergola');
    canopy.position.set(3.1, 0, 0.55);
    canopy.rotation.y = -0.24;
    this.environment.add(canopy);
    this.registerDefaultFurniture(canopy, 'pergola', 'pergola', 'Pergolado padrão');

    const bed = this.createDecorationMesh('cozy-bed');
    bed.position.set(3.2, 0, 0.65);
    bed.rotation.y = -0.24;
    this.environment.add(bed);
    this.registerDefaultFurniture(bed, 'park-bed', 'cozy-bed', 'Caminha de descanso padrão');

    for (let i = 0; i < 10; i += 1) {
      const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(randomBetween(0.45, 0.85), 1), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x5a9564 : 0x70a86b, roughness: 1 }));
      bush.position.set(randomBetween(-7.6, 7.6), 0.45, randomBetween(-5.5, 5.5));
      if (Math.abs(bush.position.x) < 1.8) bush.position.x += bush.position.x < 0 ? -2.5 : 2.5;
      bush.castShadow = true;
      this.environment.add(bush);
    }
  },

  addTraining(accent, cream, wood) {
    const hurdlePositions = [
      [-6.1, -2.2], [-3.85, -0.95], [-1.55, -2.2], [0.75, -0.95], [3.05, -2.2]
    ];
    hurdlePositions.forEach(([x, z], index) => {
      const hurdle = this.createDecorationMesh('hurdle');
      hurdle.position.set(x, 0, z);
      if (index % 2) hurdle.rotation.y = Math.PI / 2;
      this.environment.add(hurdle);
      this.registerDefaultFurniture(hurdle, `hurdle-${index + 1}`, 'hurdle', `Barreira padrão ${index + 1}`);
    });

    const jumpRing = this.createDecorationMesh('jump-ring');
    jumpRing.position.set(-4.45, 0, 2.75);
    this.environment.add(jumpRing);
    this.registerDefaultFurniture(jumpRing, 'jump-ring', 'jump-ring', 'Salto com aro padrão');

    const weave = this.createDecorationMesh('weave-poles');
    weave.position.set(1.15, 0, 2.85);
    weave.rotation.y = Math.PI / 2;
    this.environment.add(weave);
    this.registerDefaultFurniture(weave, 'weave-poles', 'weave-poles', 'Postes de slalom padrão');

    const platform = this.createDecorationMesh('training-platform');
    platform.position.set(5.45, 0, 3.05);
    this.environment.add(platform);
    this.registerDefaultFurniture(platform, 'platform', 'training-platform', 'Plataforma padrão');

    const tunnel = this.createDecorationMesh('play-tunnel');
    tunnel.position.set(3.35, 0, -3.15);
    tunnel.rotation.y = Math.PI / 2;
    this.environment.add(tunnel);
    this.registerDefaultFurniture(tunnel, 'tunnel', 'play-tunnel', 'Túnel padrão');

    const ramp = this.createDecorationMesh('ramp');
    ramp.position.set(-1.15, 0, 2.75);
    this.environment.add(ramp);
    this.registerDefaultFurniture(ramp, 'ramp', 'ramp', 'Rampa padrão');

    const trainerBench = this.createDecorationMesh('trainer-bench');
    trainerBench.position.set(5.65, 0, -2.95);
    trainerBench.rotation.y = Math.PI;
    this.environment.add(trainerBench);
    this.registerDefaultFurniture(trainerBench, 'trainer-bench', 'trainer-bench', 'Banco do treinador padrão');

    const trophyShelf = this.createDecorationMesh('trophy-shelf');
    trophyShelf.position.set(-6.45, 0, 3.3);
    this.environment.add(trophyShelf);
    this.registerDefaultFurniture(trophyShelf, 'trophy-shelf', 'trophy-shelf', 'Estante de troféus padrão');

    const coneSet = this.createDecorationMesh('cone-set');
    coneSet.position.set(0.55, 0, -3.55);
    this.environment.add(coneSet);
    this.registerDefaultFurniture(coneSet, 'cone-set', 'cone-set', 'Kit de cones padrão');
  },

  addPlanterBox(x, z, wood, accent, cream) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const planterBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 0.5, 0.82),
      new THREE.MeshStandardMaterial({ color: 0xa67657, roughness: 0.9 })
    );
    planterBody.position.set(0, 0.25, 0);
    planterBody.castShadow = true;
    planterBody.receiveShadow = true;
    group.add(planterBody);
    group.add(this.box(2.1, 0.08, 0.88, new THREE.MeshStandardMaterial({ color: 0xe9d8bc, roughness: 0.76 }), 0, 0.55, 0));
    group.add(this.box(1.82, 0.18, 0.58, new THREE.MeshStandardMaterial({ color: 0x6a563f, roughness: 1 }), 0, 0.53, 0));

    const blossomMats = [accent, cream, new THREE.MeshStandardMaterial({ color: 0xffb7c2, roughness: 0.8 }), new THREE.MeshStandardMaterial({ color: 0x9bd19e, roughness: 0.8 })];
    for (let i = 0; i < 7; i += 1) {
      const stem = this.box(0.04, 0.2 + (i % 3) * 0.05, 0.04, new THREE.MeshStandardMaterial({ color: 0x4d8958 }), -0.78 + i * 0.26, 0.66, (i % 2 ? 0.12 : -0.08));
      group.add(stem);
      const mat = blossomMats[i % blossomMats.length];
      for (let p = 0; p < 5; p += 1) {
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), mat);
        const angle = (Math.PI * 2 * p) / 5;
        petal.position.set(-0.78 + i * 0.26 + Math.cos(angle) * 0.08, 0.83 + (i % 3) * 0.03, (i % 2 ? 0.12 : -0.08) + Math.sin(angle) * 0.06);
        petal.scale.set(1.05, 0.72, 0.85);
        group.add(petal);
      }
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffdc75, roughness: 0.8 }));
      center.position.set(-0.78 + i * 0.26, 0.83 + (i % 3) * 0.03, (i % 2 ? 0.12 : -0.08));
      group.add(center);
    }

    this.environment.add(group);
    return group;
  },

  addPicnicTable(x, z, wood, cream) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.add(this.box(2.2, 0.14, 1.25, wood, 0, 0.92, 0));
    group.add(this.box(2.4, 0.16, 0.32, cream, 0, 0.55, -0.82));
    group.add(this.box(2.4, 0.16, 0.32, cream, 0, 0.55, 0.82));
    for (const lx of [-0.9, 0.9]) for (const lz of [-0.35, 0.35]) group.add(this.box(0.12, 0.92, 0.12, wood, lx, 0.46, lz));
    this.environment.add(group);
    return group;
  },

  addRampObstacle(x, z, wood, accent) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const ramp = this.box(2.2, 0.16, 1.0, accent, 0, 0.62, 0);
    ramp.rotation.z = -0.24;
    group.add(ramp);
    group.add(this.box(0.14, 0.8, 1.0, wood, -1.0, 0.4, 0));
    group.add(this.box(0.14, 0.8, 1.0, wood, 1.0, 0.4, 0));
    this.environment.add(group);
    return group;
  },

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
    if (this.scene.fog) this.scene.fog.color.setHex(state.bg);
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
  },

  placePetOnBed({ sidewaysFallback = false } = {}) {
    const pet = this.currentPet;
    if (!pet) return;
    this.clearMovementPath();
    pet.model.position.copy(pet.baseModelPosition);
    pet.model.rotation.copy(pet.baseModelRotation);
    if (sidewaysFallback) pet.model.rotation.z = -Math.PI / 2;
    pet.modelHolder.rotation.set(0, this.sleepYaw, 0);
    pet.stage.position.set(this.sleepAnchor.x, 0, this.sleepAnchor.z);
    pet.stage.updateMatrixWorld(true);

    let box = new THREE.Box3().setFromObject(pet.model);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    pet.stage.position.x += this.sleepAnchor.x - center.x;
    pet.stage.position.z += this.sleepAnchor.z - center.z;
    pet.stage.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(pet.model);
    pet.stage.position.y += this.sleepSurfaceY - box.min.y + 0.015;
    pet.stage.updateMatrixWorld(true);
  },

  wakePetFromBed() {
    const pet = this.currentPet;
    if (!pet) return;
    this.clearMovementPath();
    pet.model.position.copy(pet.baseModelPosition);
    pet.model.rotation.copy(pet.baseModelRotation);
    pet.modelHolder.rotation.set(0, 0, 0);
    pet.stage.position.copy(this.findSafePetPosition?.(this.wakeAnchor, pet) || this.findSafePosition(this.wakeAnchor, pet.navigationRadius || 0.34));
    pet.stage.position.y = 0;
  },

  enterSleepMode(sleeping) {
    const pet = this.currentPet;
    if (sleeping) {
      this.applyLighting('night');
      this.mode = 'sleep';
      if (pet) {
        const sleepClip = ['sleep', 'lying_down_idle', 'lie_down', 'idle'].find((name) => pet.controller.has(name)) || 'idle';
        pet.controller.play(sleepClip, {
          fade: 0.6,
          loop: sleepClip === 'sleep' || sleepClip.endsWith('_idle') || sleepClip === 'idle',
          timeScale: sleepClip === 'idle' ? 0.52 : 1,
          force: true
        });
        pet.controller.update?.(0.016);
        const align = () => {
          if (this.currentPet !== pet || this.mode !== 'sleep') return;
          this.placePetOnBed({ sidewaysFallback: sleepClip === 'idle' });
        };
        align();
        requestAnimationFrame(align);
        window.setTimeout(align, 180);
        window.setTimeout(align, 720);
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
  },

  getRoomSpawn(roomId = this.roomId) {
    const spawns = {
      living: new THREE.Vector3(0.2, 0, 0.95),
      garden: new THREE.Vector3(0.1, 0, 0.25),
      bedroom: new THREE.Vector3(0.8, 0, 1.45),
      kitchen: new THREE.Vector3(3.95, 0, 1.95),
      playroom: new THREE.Vector3(0.15, 0, 1.1),
      park: new THREE.Vector3(0.45, 0, -0.1),
      training: new THREE.Vector3(-4.9, 0, -2.75)
    };
    return this.findSafePosition(spawns[roomId] || new THREE.Vector3(0, 0, 0.8));
  },

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
    this.refreshOccludableObjects?.();
    await this.renderStableFrame();
  }
};
