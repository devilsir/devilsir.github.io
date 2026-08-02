import * as THREE from '../../vendor/three.module.js';
import { randomBetween } from '../utils.js';

const ROOM_PALETTES = {
  living: { floor: 0xe5b98f, wall: 0xf6e5cd, accent: 0xf3a36c, sky: 0xcfe8f5 },
  garden: { floor: 0x82b875, wall: 0xb8d99c, accent: 0xf4c96e, sky: 0x9fd7ed },
  bedroom: { floor: 0xc8b5c8, wall: 0xeee0ef, accent: 0x9c86bd, sky: 0xc6d9ef },
  kitchen: { floor: 0xd8c6a4, wall: 0xf4efe2, accent: 0x79b6a6, sky: 0xc9e6f0 },
  playroom: { floor: 0xe2b4ad, wall: 0xffe7ce, accent: 0x7fb4d7, sky: 0xcce6f3 },
  park: { floor: 0x78a96c, wall: 0xaecf99, accent: 0xf2b85f, sky: 0x89c8e4 },
  training: { floor: 0xb7aaa2, wall: 0xe8ddd4, accent: 0xe67f6a, sky: 0xbfdbea }
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
  },

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
    return this.findSafePosition(desired);
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
    for (let i = 0; i < 4; i += 1) {
      const item = this.box(0.2 + i * 0.03, 0.45 + (i % 2) * 0.2, 0.25, cream, -0.45 + i * 0.29, 1.16, 0);
      item.rotation.z = (i - 2) * 0.05;
      shelf.add(item);
    }
    this.environment.add(shelf);
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
    group.add(this.box(0.22, 1.7, 0.22, accent, 0, 0.85, 0));
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.8, 24, 1, true), cream);
    shade.position.y = 1.8;
    shade.rotation.x = Math.PI;
    shade.castShadow = true;
    group.add(shade);
    this.environment.add(group);
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
  },

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
  },

  addBench(x, z, wood) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.add(this.box(2, 0.18, 0.55, wood, 0, 0.65, 0));
    group.add(this.box(2, 0.16, 0.45, wood, 0, 1.15, 0.18));
    group.add(this.box(0.18, 0.65, 0.18, wood, -0.75, 0.33, 0));
    group.add(this.box(0.18, 0.65, 0.18, wood, 0.75, 0.33, 0));
    this.environment.add(group);
  },

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
  },

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
  },

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
  },

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
  },

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
  },

  wakePetFromBed() {
    const pet = this.currentPet;
    if (!pet) return;
    this.clearMovementPath();
    pet.model.position.copy(pet.baseModelPosition);
    pet.model.rotation.copy(pet.baseModelRotation);
    pet.modelHolder.rotation.set(0, 0, 0);
    pet.stage.position.copy(this.findSafePosition(this.wakeAnchor));
    pet.stage.position.y = 0;
  },

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
  },

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
    await this.renderStableFrame();
  }
};
