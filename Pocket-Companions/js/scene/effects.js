import * as THREE from '../../vendor/three.module.js';
import { clamp, lerp, randomBetween } from '../utils.js';
import { FURNITURE } from '../living-data.js';

export const effectsMethods = {
  startCleanMode() {
    this.cleanMode = true;
    this.cleanProgress = 0;
    this.mode = 'clean';
    this.clearMovementPath();
    this.currentPet?.controller.play('idle', { fade: 0.25, timeScale: 0.78, force: true });
    this.persistentDirtMarks.forEach((mark) => { mark.visible = false; });
    this.seedDirtMarks();
  },

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
    this.persistentDirtMarks.forEach((mark) => { mark.visible = true; });
  },

  triggerJump() {
    if (this.petControlsLocked) return false;
    return this.currentPet?.controller.jumpSequence();
  },

  playAnimation(name, options = {}) {
    if (this.staticPetPreview) return this.currentPet?.controller.currentAction || null;
    return this.currentPet?.controller.play(name, options);
  },

  listAnimations() {
    return this.currentPet?.controller?.list?.() || [];
  },

  currentAnimationName() {
    return this.currentPet?.controller?.currentName || null;
  },

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
  },

  addBubble(point) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(randomBetween(0.045, 0.095), 10, 8),
      new THREE.MeshPhysicalMaterial({ color: 0xc9f4ff, transparent: true, opacity: 0.68, roughness: 0.15, transmission: 0.2 })
    );
    mesh.position.copy(point).addScaledVector(new THREE.Vector3(randomBetween(-1, 1), randomBetween(0, 1), randomBetween(-1, 1)).normalize(), 0.08);
    this.scene.add(mesh);
    this.bubbles.push({ mesh, life: randomBetween(1.4, 2.6), velocity: randomBetween(0.1, 0.24) });
  },

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
  },

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
  },

  setPetDirtState(dirt = {}) {
    const pet = this.currentPet;
    if (!pet) return;
    this.persistentDirtState = { ...dirt };
    this.persistentDirtMarks.forEach((mark) => {
      mark.removeFromParent();
      this.disposeObject(mark);
    });
    this.persistentDirtMarks = [];
    const entries = Object.entries(dirt).filter(([, value]) => Number(value) >= 4).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return;
    const settings = this.settingsProvider?.() || {};
    const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0) / entries.length;
    const maximum = settings.lowPerformanceMode || settings.advancedDirtEffects === false ? 4 : 12;
    const count = clamp(Math.round(total / 8), 1, maximum);
    const colors = { mud: 0x6c4f35, dust: 0xb29473, leaves: 0xb96d3f, water: 0x8bc7d8, snow: 0xeaf5f7 };
    for (let index = 0; index < count; index += 1) {
      const [kind, amount] = entries[index % entries.length];
      const material = new THREE.MeshStandardMaterial({
        color: colors[kind] || 0x8b6a4b,
        transparent: true,
        opacity: clamp(0.28 + Number(amount) / 180, 0.3, 0.78),
        roughness: kind === 'water' ? 0.18 : 0.96,
        metalness: 0,
        depthWrite: false
      });
      const geometry = kind === 'leaves'
        ? new THREE.PlaneGeometry(0.09, 0.055)
        : kind === 'snow'
          ? new THREE.SphereGeometry(0.04, 6, 5)
          : new THREE.SphereGeometry(0.055, 7, 5);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(randomBetween(0.7, 1.5), kind === 'mud' || kind === 'dust' ? randomBetween(0.25, 0.5) : randomBetween(0.6, 1.15), randomBetween(0.25, 0.7));
      mesh.position.set(
        randomBetween(-(pet.size.x || 1) * 0.2, (pet.size.x || 1) * 0.2),
        randomBetween((pet.size.y || 1) * 0.18, (pet.size.y || 1) * 0.76),
        randomBetween(-(pet.size.z || 1) * 0.16, (pet.size.z || 1) * 0.2)
      );
      mesh.rotation.set(randomBetween(-0.5, 0.5), randomBetween(-1, 1), randomBetween(-0.4, 0.4));
      mesh.raycast = () => {};
      pet.model.add(mesh);
      this.persistentDirtMarks.push(mesh);
    }
  },

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
  },

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
  },

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
  },

  updateActionPose(delta) {
    if (this.staticPetPreview) return;
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
    if (canExpress) this.updateExpressionBones(pet, delta);
  },

  updateExpressionBones(pet, delta) {
    const rig = pet.expressionBones;
    if (!rig || this.settingsProvider?.().reducedMotion) return;
    const language = this.bodyLanguageState?.id || 'relaxed';
    const phase = this.bodyLanguageClock;
    const intensity = clamp(this.bodyLanguageState?.intensity || 0.5, 0, 0.8);
    const headProfile = {
      'head-tilt': [0.015, Math.sin(phase * 0.75) * 0.035, 0.07],
      watchful: [-0.01, Math.sin(phase * 0.55) * 0.055, 0.015],
      'low-and-close': [0.045, 0, 0],
      'slow-looking': [0.025, Math.sin(phase * 0.38) * 0.025, 0],
      approaching: [-0.025, 0, 0],
      'play-bow': [-0.035, Math.sin(phase) * 0.02, 0]
    }[language] || [0, Math.sin(phase * 0.35) * 0.012, 0];
    if (rig.head) {
      rig.euler.set(headProfile[0] * intensity, headProfile[1] * intensity, headProfile[2] * intensity);
      rig.delta.setFromEuler(rig.euler);
      rig.head.quaternion.multiply(rig.delta);
    }
    if (!this.settingsProvider?.().lowPerformanceMode) {
      rig.ears.forEach((ear, index) => {
        const caution = ['watchful','low-and-close','pacing'].includes(language) ? -0.035 : language === 'bouncy' || language === 'play-bow' ? 0.025 : 0;
        rig.euler.set(0, 0, (index ? -1 : 1) * caution * intensity);
        rig.delta.setFromEuler(rig.euler);
        ear.quaternion.multiply(rig.delta);
      });
      if (rig.tail) {
        const wag = ['bouncy','play-bow','approaching'].includes(language) ? Math.sin(phase * 5.2) * 0.045 : ['watchful','low-and-close'].includes(language) ? -0.025 : Math.sin(phase * 1.2) * 0.012;
        rig.euler.set(0, wag * intensity, 0);
        rig.delta.setFromEuler(rig.euler);
        rig.tail.quaternion.multiply(rig.delta);
      }
    }
  },

  isOutdoorEnvironment() {
    if (this.travelLocation) return !['clinic'].includes(this.travelLocation);
    return ['garden', 'park', 'training'].includes(this.roomId);
  },

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
    const outdoors = this.isOutdoorEnvironment();
    const seasonTints = { spring: 0xf3ead8, summer: 0xe9f3dc, autumn: 0xead7bd, winter: 0xdce7ee };
    const weatherTints = { rain: 0xb9c5cf, thunderstorm: 0x74808f, snow: 0xdceaf3, fog: 0xc9d0cf, sunshine: 0xffecc6, rainbow: 0xdce8f5, clear: seasonTints[season] || 0xf3ead8, wind: seasonTints[season] || 0xf3ead8 };
    const outsideTint = new THREE.Color(weatherTints[weather] ?? seasonTints[season] ?? 0xf3ead8);
    if (this.dayPhase === 'night') outsideTint.multiplyScalar(0.25);
    else if (this.dayPhase === 'sunset') outsideTint.lerp(new THREE.Color(0xe8a079), 0.32);
    if (!outdoors) {
      if (this.windowGlass?.material) {
        this.windowGlass.material.color.copy(outsideTint);
        this.windowGlass.material.emissive?.copy?.(outsideTint);
        this.windowGlass.material.emissiveIntensity = this.dayPhase === 'night' ? 0.05 : 0.2;
      }
      return;
    }
    this.scene.background?.copy?.(outsideTint);
    if (this.scene.fog) this.scene.fog.color.copy(outsideTint);
    const intensity = weather === 'thunderstorm' ? 0.72 : weather === 'fog' ? 0.86 : 1;
    this.hemisphere.intensity = 2.15 * intensity;
    this.keyLight.intensity = (weather === 'sunshine' ? 3.8 : weather === 'thunderstorm' ? 1.55 : 3.0) * intensity;
    const count = reduced ? 24 : this.isMobile() ? 55 : 90;
    const kind = ['rain', 'thunderstorm', 'snow', 'wind'].includes(weather) ? weather : season === 'autumn' ? 'leaves' : null;
    if (kind) {
      const geometry = kind === 'snow' ? new THREE.SphereGeometry(0.035, 5, 4) : kind === 'leaves' ? new THREE.PlaneGeometry(0.09, 0.055) : new THREE.PlaneGeometry(0.018, kind === 'rain' || kind === 'thunderstorm' ? 0.32 : 0.09);
      const material = new THREE.MeshBasicMaterial({ color: kind === 'snow' ? 0xffffff : kind === 'leaves' ? 0xd77b43 : 0x9fc7e3, transparent: true, opacity: kind === 'rain' || kind === 'thunderstorm' ? 0.62 : 0.78, depthWrite: false, side: THREE.DoubleSide });
      for (let i = 0; i < count; i += 1) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(randomBetween(-5.2, 5.2), randomBetween(0.3, 5.6), randomBetween(-3.4, 3.4));
        mesh.rotation.z = kind === 'rain' || kind === 'thunderstorm' ? -0.16 : randomBetween(-Math.PI, Math.PI);
        this.weatherGroup.add(mesh);
        this.weatherParticles.push({ mesh, kind, speed: kind === 'snow' ? randomBetween(0.25, 0.55) : kind === 'leaves' ? randomBetween(0.45, 0.9) : randomBetween(2.8, 4.5), phase: Math.random() * Math.PI * 2 });
      }
    }
    if (weather === 'rainbow') {
      const colors = [0xe36b6b, 0xf2a35b, 0xf3d969, 0x70c77d, 0x69a7db, 0x9b78d3];
      const arc = new THREE.Group();
      colors.forEach((color, index) => arc.add(new THREE.Mesh(new THREE.TorusGeometry(2.2 - index * 0.08, 0.035, 7, 48, Math.PI), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72, side: THREE.DoubleSide }))));
      arc.position.set(2.45, 0.42, -3.08);
      this.weatherGroup.add(arc);
    }
  },

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
  },


  semanticStaticObjects(room = this.roomId, species = 'dog') {
    const normalize = (object) => ({
      requiredOrientation: null,
      occupancy: null,
      cooldown: 0,
      animationMapping: {},
      needEffects: {},
      emotionalEffects: {},
      memoryEvents: [],
      collisionBounds: null,
      surfaceSize: object.surfaceSize ?? null,
      surfaceYaw: object.surfaceYaw ?? null,
      surfaceMargin: Number.isFinite(Number(object.surfaceMargin)) ? Number(object.surfaceMargin) : 0.06,
      navigationCost: 1,
      movable: object.type === 'movable',
      canBecomeDirty: ['bed', 'toy', 'soil', 'bench'].includes(object.type),
      canBecomeDamaged: object.type === 'movable',
      ...object,
      room,
      position: object.approach
    });
    const shared = [
      { id: 'player-space', type: 'player', approach: [0, 1.75], actions: ['seek-player', 'request-affection'], exclusive: false },
      { id: 'quiet-corner', type: 'quiet', approach: [-2.5, 1.6], actions: ['seek-solitude', 'hide'], exclusive: true }
    ];
    const roomMap = {
      living: [
        { id: 'living-window', type: 'window', approach: [1.65, -2.65], actions: ['window-watch', 'investigate-sound'], exclusive: true },
        { id: 'living-door', type: 'door', approach: [4.2, -1.5], actions: ['wait-door', 'investigate-sound'], exclusive: true }
      ],
      bedroom: [
        { id: 'bedroom-window', type: 'window', approach: [0.8, -2.6], actions: ['window-watch', 'investigate-sound'], exclusive: true }
      ],
      garden: [
        { id: 'garden-tree', type: 'tree', approach: [-5.85, -2.8], actions: ['scratch', 'investigate-sound'], exclusive: true },
        { id: 'garden-scent', type: 'scent', approach: [0.4, -1.8], actions: ['follow-scent', 'investigate-object'], exclusive: true },
        { id: 'garden-dig', type: 'soil', approach: [2.1, -1.65], actions: ['dig', 'follow-scent'], species: ['dog'], exclusive: true },
        { id: 'garden-insects', type: 'target', approach: [-0.7, 1.7], actions: ['chase-target', 'hunt'], exclusive: true }
      ],
      playroom: [
        { id: 'playroom-moving-target', type: 'target', approach: [1.2, 0.4], actions: ['chase-target', 'hunt'], exclusive: true }
      ],
      park: [
        { id: 'park-leaves', type: 'target', approach: [1.5, -1.35], actions: ['chase-target', 'hunt'], exclusive: true },
        { id: 'park-dig', type: 'soil', approach: [3.0, 1.55], actions: ['dig', 'follow-scent'], species: ['dog'], exclusive: true },
        { id: 'park-scent', type: 'scent', approach: [0.1, 1.8], actions: ['follow-scent', 'investigate-object'], exclusive: true }
      ],
      training: [
        { id: 'training-wait', type: 'marker', approach: [0.2, -2], actions: ['wait-command', 'seek-player'], exclusive: true }
      ]
    };
    return [...shared, ...(roomMap[room] || [])]
      .filter((object) => !object.species || object.species.includes(species))
      .map(normalize);
  },

  furnitureSemanticEntries(object, room = this.roomId, species = 'dog') {
    if (!object || object.visible === false) return [];
    const item = object.userData?.furnitureItem || null;
    if (!item) return [];
    const definition = FURNITURE[item] || {};
    const kind = definition.kind || item;
    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);
    if (!Number.isFinite(box.min.x) || !Number.isFinite(box.max.x)) return [];
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = Math.max(0.01, (object.scale.x + object.scale.y + object.scale.z) / 3 || 1);
    const baseW = Number(definition.size?.[0]) || Math.max(0.8, size.x / scale);
    const baseD = Number(definition.size?.[1]) || Math.max(0.8, size.z / scale);
    const quat = new THREE.Quaternion();
    object.getWorldQuaternion(quat);
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat).setY(0);
    if (forward.lengthSq() < 1e-4) forward.set(0, 0, 1); else forward.normalize();
    const yaw = Math.atan2(forward.x, forward.z);
    const sourceId = object.userData?.defaultFurnitureId || object.userData?.decorationId || item;
    const topY = box.max.y + 0.02;
    const toWorld = (x = 0, y = 0, z = 0) => object.localToWorld(new THREE.Vector3(x, y, z));
    const entries = [];
    const addEntry = (suffix, type, approachLocal, actions, options = {}) => {
      const approachWorld = Array.isArray(approachLocal) ? toWorld(...approachLocal) : center.clone().add(forward.clone().multiplyScalar(size.z * 0.45 + 0.38));
      const interactionWorld = Array.isArray(options.interactionLocal) ? toWorld(...options.interactionLocal) : (options.interaction ? new THREE.Vector3(...options.interaction) : center.clone());
      const payload = {
        id: `${sourceId}:${suffix}`,
        type,
        approach: [approachWorld.x, approachWorld.z],
        interaction: interactionWorld ? [interactionWorld.x, interactionWorld.z] : undefined,
        actions,
        exclusive: true,
        room,
        species: options.species,
        surfaceY: options.surfaceY,
        surfaceSize: options.surfaceSize,
        surfaceYaw: options.surfaceYaw,
        surfaceMargin: options.surfaceMargin,
        trainingTraversal: options.trainingTraversal
          ? {
              ...options.trainingTraversal,
              points: Array.isArray(options.trainingTraversal.points)
                ? options.trainingTraversal.points.map(([x = 0, y = 0, z = 0]) => {
                    const world = toWorld(x, y, z);
                    return { x: world.x, y: world.y, z: world.z };
                  })
                : []
            }
          : null
      };
      entries.push(payload);
    };

    if (kind === 'bed') {
      addEntry('bed', 'bed', [0, 0, baseD * 0.84], ['sleep', 'bed-rest', 'hide', 'sleep-near-pet'], {
        interactionLocal: [0, Math.max(0.18, size.y / scale * 0.92), 0],
        surfaceY: topY,
        surfaceSize: [Math.max(0.8, size.x * 0.82), Math.max(0.6, size.z * 0.72)],
        surfaceYaw: yaw - Math.PI / 2,
        surfaceMargin: 0.1
      });
    } else if (kind === 'bowl') {
      addEntry('food', 'food', [0, 0, 0.56], ['eat', 'ask-food', 'steal-food'], { interactionLocal: [-0.22, 0.08, 0] });
      addEntry('water', 'water', [0, 0, 0.56], ['drink', 'ask-water'], { interactionLocal: [0.22, 0.08, 0] });
    } else if (kind === 'toy' || kind === 'ball-pit') {
      addEntry('toy', 'toy', [0, 0, baseD * 0.72], kind === 'ball-pit' ? ['toy-play', 'bring-toy', 'guard-object', 'chase-target', 'bed-rest'] : ['toy-play', 'bring-toy', 'guard-object']);
    } else if (kind === 'tunnel') {
      const tunnelActions = room === 'training' ? ['hide', 'investigate-object', 'toy-play', 'trained-command'] : ['hide', 'investigate-object', 'toy-play'];
      addEntry('hide', 'hide', [-baseW * 0.72, 0, 0], tunnelActions, room === 'training' ? {
        trainingTraversal: {
          kind: 'tunnel', animation: 'run', duration: 1450,
          points: [[-baseW * 0.78, 0, 0], [0, 0, 0], [baseW * 0.78, 0, 0]]
        }
      } : {});
    } else if (kind === 'cat-tree' || kind === 'bookshelf') {
      addEntry('perch', 'perch', [0, 0, baseD * 0.78], ['climb', 'high-rest', 'investigate-object'], {
        interactionLocal: [kind === 'cat-tree' ? 0.22 : 0, kind === 'cat-tree' ? 1.82 : 1.05, 0],
        species: ['cat'],
        surfaceY: topY,
        surfaceSize: kind === 'cat-tree' ? [Math.max(0.55, size.x * 0.58), Math.max(0.45, size.z * 0.48)] : [Math.max(0.8, size.x * 0.8), Math.max(0.45, size.z * 0.72)],
        surfaceYaw: yaw,
        surfaceMargin: 0.08
      });
    } else if (kind === 'post') {
      addEntry('scratch', 'tree', [0, 0, baseD * 0.8], ['scratch', 'investigate-object']);
    } else if (kind === 'bathtub') {
      addEntry('bath', 'rest', [0, 0, baseD * 0.8], ['bed-rest', 'investigate-object'], {
        interactionLocal: [0, 0.58, 0],
        surfaceY: 0.44,
        surfaceSize: [Math.max(0.9, size.x * 0.62), Math.max(0.48, size.z * 0.46)]
      });
    } else if (kind === 'sink' || kind === 'toilet' || kind === 'hamper' || kind === 'mirror' || kind === 'shower') {
      addEntry('bathroom', 'movable', [0, 0, baseD * 0.82], ['investigate-object', 'guard-object']);
    } else if (kind === 'bench' || kind === 'sofa' || kind === 'armchair') {
      addEntry('rest', kind === 'bench' ? 'bench' : 'bed', [0, 0, baseD * 0.88], ['sunlight-rest', 'bed-rest', 'window-watch'], {
        interactionLocal: [0, Math.max(0.18, size.y / scale * 0.72), 0],
        surfaceY: Math.max(0.3, box.min.y + size.y * 0.6),
        surfaceSize: [Math.max(0.7, size.x * 0.78), Math.max(0.45, size.z * 0.65)],
        surfaceYaw: yaw,
        surfaceMargin: 0.08
      });
    } else if (kind === 'low-table') {
      addEntry('puzzle', 'puzzle', [0, 0, baseD * 0.82], ['investigate-object', 'toy-play']);
    } else if (['dining-table', 'kitchen-island', 'desk', 'picnic-table'].includes(kind)) {
      addEntry('table', kind === 'picnic-table' ? 'bench' : 'table', [0, 0, baseD * 0.92], kind === 'picnic-table' ? ['sunlight-rest', 'guard-object', 'investigate-object'] : ['guard-object', 'investigate-object']);
      if (['dining-table', 'kitchen-island'].includes(kind)) {
        addEntry('perch', 'perch', [0, 0, baseD * 0.82], ['climb', 'high-rest'], {
          interactionLocal: [0, size.y / scale, 0],
          species: ['cat'],
          surfaceY: topY,
          surfaceSize: [Math.max(0.8, size.x * 0.82), Math.max(0.6, size.z * 0.72)],
          surfaceYaw: yaw,
          surfaceMargin: 0.08
        });
      }
    } else if (['hurdle', 'ramp', 'platform', 'weave-poles', 'jump-ring'].includes(kind)) {
      const jumpDistance = Math.max(1.35, baseD * 1.8 + 0.7);
      const traversalByKind = {
        hurdle: {
          kind: 'jump', animation: 'jump', duration: 920, jumpHeight: 0.78,
          points: [[0, 0, jumpDistance], [0, 0, 0], [0, 0, -jumpDistance]]
        },
        'jump-ring': {
          kind: 'jump', animation: 'jump', duration: 980, jumpHeight: 0.92,
          points: [[0, 0, jumpDistance], [0, 0, 0], [0, 0, -jumpDistance]]
        },
        ramp: {
          kind: 'ramp', animation: 'run', duration: 1650,
          points: [[-baseW * 0.72, 0, 0], [-baseW * 0.12, 0.48, 0], [baseW * 0.48, 0.9, 0], [baseW * 0.82, 0, 0]]
        },
        'weave-poles': {
          kind: 'weave', animation: 'run', duration: 2300,
          points: [[-baseW * 0.58, 0, 0.34], [-baseW * 0.34, 0, -0.34], [-baseW * 0.1, 0, 0.34], [baseW * 0.14, 0, -0.34], [baseW * 0.38, 0, 0.34], [baseW * 0.62, 0, -0.34]]
        },
        platform: {
          kind: 'platform', animation: 'jump', duration: 1450, jumpHeight: 0.48,
          points: [[0, 0, baseD * 0.92], [0, Math.max(0.42, size.y / scale), 0], [0, 0, -baseD * 0.92]]
        }
      };
      const traversal = traversalByKind[kind];
      addEntry('train', kind === 'platform' ? 'marker' : 'obstacle', traversal.points[0], ['trained-command', 'explore'], {
        animationMapping: { 'trained-command': traversal.animation },
        holdMapping: { 'trained-command': traversal.duration + 300 },
        trainingTraversal: traversal
      });
      if (kind === 'platform') {
        addEntry('rest', 'perch', [0, 0, baseD * 0.76], ['trained-command', 'high-rest'], {
          interactionLocal: [0, Math.max(0.28, size.y / scale), 0],
          surfaceY: topY,
          surfaceSize: [Math.max(0.8, size.x * 0.72), Math.max(0.6, size.z * 0.66)],
          surfaceYaw: yaw,
          surfaceMargin: 0.08
        });
      }
    } else if (['planter', 'fountain', 'pergola'].includes(kind)) {
      addEntry('garden', kind === 'fountain' ? 'water' : 'movable', [0, 0, baseD * 0.82], kind === 'fountain' ? ['investigate-object', 'ask-water'] : ['investigate-object', 'follow-scent']);
    } else if (['dresser', 'nightstand', 'media-console', 'wardrobe', 'pantry'].includes(kind)) {
      addEntry('storage', kind === 'pantry' ? 'cabinet' : 'movable', [0, 0, baseD * 0.86], ['investigate-object', 'guard-object', 'misbehave']);
    }
    return entries
      .filter((entry) => !entry.species || entry.species.includes(species))
      .map((entry) => ({
        requiredOrientation: null,
        occupancy: null,
        cooldown: 0,
        animationMapping: {},
        needEffects: {},
        emotionalEffects: {},
        memoryEvents: [],
        collisionBounds: null,
        navigationCost: 1,
        movable: entry.type === 'movable',
        canBecomeDirty: ['bed', 'toy', 'soil', 'bench'].includes(entry.type),
        canBecomeDamaged: entry.type === 'movable',
        ...entry,
        position: entry.approach
      }));
  },

  getSemanticEnvironmentObjects(room = this.roomId, species = 'dog') {
    const entries = this.semanticStaticObjects(room, species);
    if (room !== this.roomId) return entries;
    const seen = new Set(entries.map((entry) => entry.id));
    const append = (items = []) => {
      for (const item of items) {
        if (!item || seen.has(item.id)) continue;
        seen.add(item.id);
        entries.push(item);
      }
    };
    for (const object of this.defaultFurnitureObjects || []) {
      if (!object || object.visible === false || object.userData?.defaultFurnitureStored) continue;
      append(this.furnitureSemanticEntries(object, room, species));
    }
    for (const object of this.decorationGroup?.children || []) append(this.furnitureSemanticEntries(object, room, species));
    return entries;
  },

  syncSemanticAnchors(room = this.roomId) {
    if (room !== this.roomId) return;
    const objects = this.getSemanticEnvironmentObjects(room, 'dog');
    const bed = objects.find((entry) => entry.type === 'bed' && Array.isArray(entry.interaction));
    if (bed) {
      this.sleepAnchor.set(bed.interaction[0], 0, bed.interaction[1]);
      this.sleepSurfaceY = Number.isFinite(Number(bed.surfaceY)) ? Number(bed.surfaceY) : this.sleepSurfaceY;
      if (Array.isArray(bed.approach)) this.wakeAnchor.set(bed.approach[0], 0, bed.approach[1]);
      if (Number.isFinite(Number(bed.surfaceYaw))) this.sleepYaw = Number(bed.surfaceYaw);
    }
    const food = objects.find((entry) => entry.type === 'food' && Array.isArray(entry.interaction));
    if (food) {
      this.feedAnchor.set(food.interaction[0], 0, food.interaction[1]);
      if (Array.isArray(food.approach)) this.feedApproach.set(food.approach[0], 0, food.approach[1]);
    }
  },

  createDecorationMesh(item) {
    const group = new THREE.Group();
    const definition = FURNITURE[item] || {};
    const kind = definition.kind || item;
    const wood = new THREE.MeshStandardMaterial({ color: 0xa77656, roughness: 0.86 });
    const warm = new THREE.MeshStandardMaterial({ color: 0xe7a873, roughness: 0.82 });
    const accent = new THREE.MeshStandardMaterial({ color: 0x8cc7b8, roughness: 0.78 });
    const cream = new THREE.MeshStandardMaterial({ color: 0xfff0d7, roughness: 0.9 });
    const green = new THREE.MeshStandardMaterial({ color: 0x6e9e72, roughness: 0.94 });
    const metal = new THREE.MeshStandardMaterial({ color: 0xc7cfd3, roughness: 0.48, metalness: 0.18 });
    const addLegs = (width, depth, height = 0.65) => {
      for (const x of [-width * 0.42, width * 0.42]) for (const z of [-depth * 0.38, depth * 0.38]) group.add(this.box(0.1, height, 0.1, wood, x, height / 2, z));
    };
    if (kind === 'bed') {
      group.add(this.box(1.7, 0.28, 1.1, warm, 0, 0.14, 0));
      group.add(this.box(1.3, 0.18, 0.78, accent, 0, 0.36, 0));
      group.add(this.box(0.48, 0.14, 0.58, cream, -0.48, 0.52, 0));
    } else if (kind === 'sofa') {
      group.add(this.box(2.0, 0.45, 0.85, warm, 0, 0.28, 0));
      group.add(this.box(2.0, 0.75, 0.22, accent, 0, 0.62, -0.34));
      group.add(this.box(0.22, 0.62, 0.82, warm, -0.91, 0.48, 0));
      group.add(this.box(0.22, 0.62, 0.82, warm, 0.91, 0.48, 0));
    } else if (kind === 'armchair') {
      group.add(this.box(1.0, 0.38, 0.82, warm, 0, 0.28, 0));
      group.add(this.box(0.9, 0.72, 0.2, accent, 0, 0.65, -0.32));
      group.add(this.box(0.18, 0.58, 0.76, warm, -0.42, 0.47, 0));
      group.add(this.box(0.18, 0.58, 0.76, warm, 0.42, 0.47, 0));
    } else if (kind === 'coffee-table' || kind === 'low-table') {
      const [w, d] = definition.size || [1.4, 1];
      group.add(this.box(w * 0.92, 0.12, d * 0.88, cream, 0, kind === 'low-table' ? 0.46 : 0.62, 0));
      addLegs(w, d, kind === 'low-table' ? 0.46 : 0.62);
    } else if (kind === 'media-console' || kind === 'bookshelf' || kind === 'dresser' || kind === 'nightstand' || kind === 'pantry' || kind === 'wardrobe') {
      const [w, d] = definition.size || [1.5, .75];
      const h = kind === 'pantry' || kind === 'wardrobe' ? 1.8 : kind === 'bookshelf' ? 1.25 : kind === 'nightstand' ? .72 : 1.0;
      group.add(this.box(w * .94, h, d * .9, wood, 0, h / 2, 0));
      const rows = kind === 'bookshelf' ? 3 : kind === 'dresser' ? 3 : 2;
      for (let i = 0; i < rows; i += 1) group.add(this.box(w * .76, .1, d * .08, cream, 0, .28 + i * (h / (rows + .5)), d * .47));
      if (kind === 'media-console') group.add(this.box(w * .55, .42, .06, accent, 0, h + .25, .05));
    } else if (kind === 'desk') {
      group.add(this.box(1.7, .14, .85, wood, 0, .82, 0));
      addLegs(1.7, .85, .82);
      group.add(this.box(.7, .55, .55, accent, -.46, .34, .02));
    } else if (kind === 'dining-table' || kind === 'kitchen-island') {
      const [w, d] = definition.size || [2.2, 1.2];
      group.add(this.box(w * .96, .18, d * .92, kind === 'kitchen-island' ? cream : wood, 0, .9, 0));
      if (kind === 'kitchen-island') group.add(this.box(w * .76, .72, d * .7, accent, 0, .43, 0)); else addLegs(w, d, .9);
    } else if (kind === 'stools') {
      for (const x of [-.38, .38]) {
        group.add(this.box(.42, .12, .42, accent, x, .58, 0));
        group.add(this.box(.1, .58, .1, wood, x, .29, 0));
      }
    } else if (kind === 'post') {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.17,.19,1.15,12), warm); pole.position.y=.58; group.add(pole);
      group.add(this.box(.75,.12,.75,accent,0,.06,0));
    } else if (kind === 'rug') {
      group.add(this.roundedRug((definition.size?.[0] || 2) * .95, (definition.size?.[1] || 1.4) * .95, 0xd6a6cb));
    } else if (kind === 'plant') {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(.28,.36,.45,12), warm); pot.position.y=.23; group.add(pot);
      for (let i=0;i<6;i+=1) { const leaf = new THREE.Mesh(new THREE.SphereGeometry(.22,8,6), green); leaf.scale.set(.55,1.2,.45); leaf.position.set(Math.sin(i*1.1)*.18,.67+Math.cos(i)*.08,Math.cos(i*1.1)*.18); group.add(leaf); }
    } else if (kind === 'lamp') {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.05,.07,1.15,10), metal); pole.position.y=.58; group.add(pole);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(.34,.45,14,1,true), cream); shade.position.y=1.15; group.add(shade);
    } else if (kind === 'toy') {
      group.add(this.box(1.0,.48,.72,warm,0,.24,0));
      group.add(this.box(1.08,.08,.78,cream,0,.48,0));
      const folded = this.box(.5,.12,.28,accent,.18,.58,-.08); group.add(folded);
      for(let i=0;i<2;i+=1){ const rope=new THREE.Mesh(new THREE.TorusKnotGeometry(.12,.035,48,8),i?accent:cream); rope.position.set(-.2+i*.34,.62,.1-i*.14); rope.rotation.set(.3*i,.5*i,.2); group.add(rope); }
    } else if (kind === 'bowl') {
      for (const x of [-.22,.22]) { const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.28,.21,.16,18,1,true), x < 0 ? accent : cream); bowl.position.set(x,.08,0); group.add(bowl); }
      group.add(this.box(.82,.06,.58,wood,0,.03,0));
    } else if (kind === 'tunnel') {
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,1.55,20,1,true), accent); shell.rotation.z=Math.PI/2; shell.position.y=.49; group.add(shell);
      for (const x of [-.78,.78]) { const ring=new THREE.Mesh(new THREE.TorusGeometry(.48,.055,8,28),cream); ring.rotation.y=Math.PI/2; ring.position.set(x,.49,0); group.add(ring); }
    } else if (kind === 'cat-tree') {
      group.add(this.box(1.15,.14,.92,wood,0,.07,0));
      group.add(this.box(.16,1.35,.16,warm,-.3,.68,0)); group.add(this.box(.16,1.85,.16,warm,.3,.93,0));
      group.add(this.box(1.05,.12,.75,accent,-.1,1.25,0)); group.add(this.box(.82,.12,.65,cream,.28,1.82,0));
    } else if (kind === 'ball-pit') {
      group.add(this.box(1.65,.42,1.25,warm,0,.21,0));
      for(let i=0;i<16;i+=1){ const ball=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),[accent,cream,warm][i%3]); ball.position.set(-.65+(i%5)*.32,.48+(i%2)*.12,-.42+Math.floor(i/5)*.34); group.add(ball); }
    } else if (kind === 'bathtub') {
      const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xf8fbfc, roughness: 0.28, metalness: 0.02, clearcoat: 0.18 });
      const water = new THREE.MeshPhysicalMaterial({ color: 0x9edbec, transparent: true, opacity: 0.8, roughness: 0.08, transmission: 0.22 });
      const chrome = new THREE.MeshStandardMaterial({ color: 0xcbd6dc, roughness: 0.2, metalness: 0.68 });
      const knobBlue = new THREE.MeshStandardMaterial({ color: 0x8fcbe0, roughness: 0.42, metalness: 0.08 });
      const knobRose = new THREE.MeshStandardMaterial({ color: 0xeab6a6, roughness: 0.42, metalness: 0.08 });
      const outer = this.box(2.08, 0.58, 1.16, porcelain, 0, 0.3, 0); group.add(outer);
      const basin = this.box(1.68, 0.28, 0.76, water, -0.04, 0.48, 0); group.add(basin);
      group.add(this.box(2.18, 0.09, 0.12, porcelain, 0, 0.62, -0.53));
      group.add(this.box(2.18, 0.09, 0.12, porcelain, 0, 0.62, 0.53));
      group.add(this.box(0.12, 0.09, 1.0, porcelain, -1.03, 0.62, 0));
      group.add(this.box(0.12, 0.09, 1.0, porcelain, 1.03, 0.62, 0));
      for (const x of [-0.78, 0.78]) for (const z of [-0.42, 0.42]) group.add(this.box(0.12, 0.18, 0.12, chrome, x, 0.09, z));
      group.add(this.box(0.34, 0.05, 0.18, chrome, 0.78, 0.81, -0.28));
      const faucetCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.76, 0.84, -0.28),
        new THREE.Vector3(0.78, 1.08, -0.28),
        new THREE.Vector3(0.67, 1.2, -0.26),
        new THREE.Vector3(0.47, 1.22, -0.2),
        new THREE.Vector3(0.29, 1.08, -0.12)
      ]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(faucetCurve, 32, 0.03, 10, false), chrome));
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.034, 0.1, 12), chrome); nozzle.rotation.z = Math.PI / 2; nozzle.position.set(0.26, 1.08, -0.12); group.add(nozzle);
      for (const [x, mat] of [[0.56, knobBlue], [0.92, knobRose]]) { const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.075, 14), mat); knob.rotation.x = Math.PI / 2; knob.position.set(x, 0.81, -0.4); group.add(knob); }
      const towel = this.box(0.58, 0.035, 0.34, new THREE.MeshStandardMaterial({ color: 0xf0c7b8, roughness: 0.94 }), -0.48, 0.69, 0.43); towel.rotation.z = -0.08; group.add(towel);
      for (let i = 0; i < 5; i += 1) { const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.055 + i * 0.006, 10, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.64, roughness: 0.08 })); bubble.position.set(-0.55 + i * 0.28, 0.65 + (i % 2) * 0.04, -0.08 + (i % 3) * 0.12); group.add(bubble); }
    } else if (kind === 'toilet') {
      const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xf9fbfc, roughness: 0.3, clearcoat: 0.12 });
      const chrome = new THREE.MeshStandardMaterial({ color: 0xc9d2d7, roughness: 0.2, metalness: 0.65 });
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.54, 20), porcelain); pedestal.position.set(0, 0.27, 0.05); pedestal.scale.set(1, 1, 1.15); group.add(pedestal);
      const bowl = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.1, 12, 26), porcelain); bowl.rotation.x = Math.PI / 2; bowl.position.set(0, 0.58, 0.06); bowl.scale.set(1, 1.18, 1); group.add(bowl);
      const lid = this.box(0.62, 0.08, 0.72, cream, 0, 0.69, 0.04); lid.rotation.x = -0.04; group.add(lid);
      group.add(this.box(0.62, 0.74, 0.32, porcelain, 0, 0.86, -0.34));
      group.add(this.box(0.54, 0.08, 0.34, cream, 0, 1.25, -0.34));
      const flush = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.035, 14), chrome); flush.rotation.x = Math.PI / 2; flush.position.set(0.18, 1.29, -0.16); group.add(flush);
      const paperBar = this.box(0.44, 0.05, 0.05, chrome, -0.52, 0.72, -0.02); group.add(paperBar);
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.24, 16), cream); roll.rotation.z = Math.PI / 2; roll.position.set(-0.52, 0.72, 0); group.add(roll);
    } else if (kind === 'sink') {
      const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xf9fcfd, roughness: 0.22, metalness: 0.02, clearcoat: 0.24 });
      const basinInner = new THREE.MeshStandardMaterial({ color: 0xe7f2f5, roughness: 0.32, metalness: 0.01 });
      const cabinetWood = new THREE.MeshStandardMaterial({ color: 0x9b6748, roughness: 0.82, metalness: 0.02 });
      const cabinetFace = new THREE.MeshStandardMaterial({ color: 0xb9d1d8, roughness: 0.48, metalness: 0.02 });
      const chrome = new THREE.MeshStandardMaterial({ color: 0xd2d9dd, roughness: 0.12, metalness: 0.82 });
      const darkChrome = new THREE.MeshStandardMaterial({ color: 0x65747c, roughness: 0.2, metalness: 0.72 });
      const waterMat = new THREE.MeshPhysicalMaterial({ color: 0xa4deec, transparent: true, opacity: 0.68, roughness: 0.05, transmission: 0.2 });
      const towelMat = new THREE.MeshStandardMaterial({ color: 0xc2dce4, roughness: 0.94 });

      // Raised vanity with inset doors, visible feet and a thinner stone countertop.
      group.add(this.box(1.5, 0.72, 0.62, cabinetWood, 0, 0.43, 0));
      group.add(this.box(0.62, 0.54, 0.045, cabinetFace, -0.35, 0.45, 0.335));
      group.add(this.box(0.62, 0.54, 0.045, cabinetFace, 0.35, 0.45, 0.335));
      group.add(this.box(0.05, 0.54, 0.055, cabinetWood, 0, 0.45, 0.35));
      for (const x of [-0.09, 0.09]) group.add(this.box(0.035, 0.16, 0.028, darkChrome, x, 0.46, 0.38));
      for (const x of [-0.58, 0.58]) for (const z of [-0.22, 0.22]) group.add(this.box(0.09, 0.16, 0.09, darkChrome, x, 0.08, z));
      group.add(this.box(1.68, 0.09, 0.76, porcelain, 0, 0.86, 0));
      group.add(this.box(1.58, 0.12, 0.08, porcelain, 0, 0.96, -0.34));

      // Oval recessed basin; no oversized raised cylinder.
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.34, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), basinInner);
      bowl.position.set(-0.16, 0.84, 0.02);
      bowl.rotation.x = Math.PI;
      bowl.scale.set(1.2, 0.38, 0.82);
      group.add(bowl);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.035, 12, 34), porcelain);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(-0.16, 0.91, 0.02);
      rim.scale.set(1.24, 0.84, 1);
      group.add(rim);
      const water = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.014, 28), waterMat);
      water.position.set(-0.16, 0.895, 0.02);
      water.scale.set(1.22, 1, 0.78);
      group.add(water);
      const drain = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 16), darkChrome);
      drain.position.set(-0.16, 0.905, 0.02);
      group.add(drain);

      // Compact gooseneck faucet made from a continuous tube, correctly aimed at the basin.
      const faucetCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.38, 0.91, -0.2),
        new THREE.Vector3(0.38, 1.08, -0.2),
        new THREE.Vector3(0.3, 1.19, -0.18),
        new THREE.Vector3(0.12, 1.22, -0.12),
        new THREE.Vector3(-0.04, 1.13, -0.04)
      ]);
      const faucet = new THREE.Mesh(new THREE.TubeGeometry(faucetCurve, 30, 0.026, 10, false), chrome);
      group.add(faucet);
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.034, 0.09, 12), chrome);
      nozzle.position.set(-0.04, 1.085, -0.04);
      group.add(nozzle);
      const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.045, 16), chrome);
      baseRing.position.set(0.38, 0.92, -0.2);
      group.add(baseRing);
      const lever = this.box(0.035, 0.16, 0.035, darkChrome, 0.54, 1.0, -0.19);
      lever.rotation.z = -0.18;
      group.add(lever);
      const leverTip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), chrome);
      leverTip.position.set(0.56, 1.075, -0.19);
      group.add(leverTip);

      const soapBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.2, 12), accent);
      soapBottle.position.set(0.62, 0.99, 0.16);
      group.add(soapBottle);
      group.add(this.box(0.1, 0.025, 0.025, chrome, 0.62, 1.105, 0.16));
      const toothbrushCup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.15, 14), cream);
      toothbrushCup.position.set(0.58, 0.96, -0.02);
      group.add(toothbrushCup);
      for (const x of [0.55, 0.61]) {
        const brush = this.box(0.018, 0.2, 0.018, x < 0.58 ? accent : warm, x, 1.08, -0.02);
        brush.rotation.z = x < 0.58 ? -0.08 : 0.08;
        group.add(brush);
      }
      group.add(this.box(0.5, 0.035, 0.035, chrome, -0.72, 0.62, 0.05));
      group.add(this.box(0.24, 0.3, 0.035, towelMat, -0.72, 0.46, 0.07));
    } else if (kind === 'shower') {
      const glass = new THREE.MeshPhysicalMaterial({ color: 0xdff4fb, transparent: true, opacity: 0.46, roughness: 0.08, transmission: 0.38, depthWrite: false });
      const chrome = new THREE.MeshStandardMaterial({ color: 0xc8d3d9, roughness: 0.18, metalness: 0.72 });
      const tile = new THREE.MeshStandardMaterial({ color: 0xeaf4f7, roughness: 0.9 });
      group.add(this.box(1.38, 0.12, 1.06, tile, 0, 0.06, 0));
      group.add(this.box(1.28, 2.05, 0.08, glass, 0, 1.03, -0.49));
      group.add(this.box(0.08, 2.05, 1.0, glass, -0.61, 1.03, 0));
      group.add(this.box(0.08, 2.05, 1.0, glass, 0.61, 1.03, 0));
      for (const x of [-0.64, 0.64]) group.add(this.box(0.04, 2.12, 0.04, chrome, x, 1.06, -0.5));
      group.add(this.box(1.34, 0.04, 0.04, chrome, 0, 2.08, -0.5));
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.26, 12), chrome); pipe.position.set(0.38, 1.37, -0.38); group.add(pipe);
      const arm = this.box(0.34, 0.04, 0.04, chrome, 0.23, 1.97, -0.38); group.add(arm);
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 18), chrome); head.rotation.x = Math.PI / 2; head.position.set(0.05, 1.95, -0.38); group.add(head);
      const control = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16), accent); control.rotation.x = Math.PI / 2; control.position.set(0.38, 1.02, -0.42); group.add(control);
      for (let i = 0; i < 7; i += 1) { const drop = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), new THREE.MeshBasicMaterial({ color: 0x8fd6eb, transparent: true, opacity: 0.7 })); drop.scale.y = 2.4; drop.position.set(-0.1 + (i % 4) * 0.08, 1.62 - Math.floor(i / 4) * 0.28, -0.34 + (i % 2) * 0.1); group.add(drop); }
    } else if (kind === 'hamper') {
      const wicker = new THREE.MeshStandardMaterial({ color: 0xb88d6d, roughness: 0.96 });
      group.add(this.box(0.78, 0.82, 0.64, wicker, 0, 0.41, 0));
      for (let i = -3; i <= 3; i += 1) group.add(this.box(0.035, 0.7, 0.04, cream, i * 0.1, 0.42, 0.34));
      for (let i = 0; i < 5; i += 1) group.add(this.box(0.68, 0.035, 0.04, cream, 0, 0.16 + i * 0.14, 0.34));
      group.add(this.box(0.84, 0.09, 0.7, wood, 0, 0.86, 0));
      const clothA = this.box(0.34, 0.16, 0.28, new THREE.MeshStandardMaterial({ color: 0x9dc9d8, roughness: 0.94 }), -0.14, 0.93, 0); clothA.rotation.z = -0.12; group.add(clothA);
      const clothB = this.box(0.32, 0.14, 0.24, new THREE.MeshStandardMaterial({ color: 0xf0b6aa, roughness: 0.94 }), 0.16, 0.95, -0.04); clothB.rotation.z = 0.16; group.add(clothB);
      for (const x of [-0.25, 0.25]) { const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 18, Math.PI), wood); handle.position.set(x, 0.72, 0.35); group.add(handle); }
    } else if (kind === 'mirror') {
      const chrome = new THREE.MeshStandardMaterial({ color: 0xd1b687, roughness: 0.28, metalness: 0.54 });
      const glass = new THREE.MeshPhysicalMaterial({ color: 0xcfe9f4, roughness: 0.08, metalness: 0.12, clearcoat: 0.28 });
      const frame = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.055, 12, 36), chrome); frame.position.y = 0.92; group.add(frame);
      const face = new THREE.Mesh(new THREE.CircleGeometry(0.43, 36), glass); face.position.set(0, 0.92, 0.015); group.add(face);
      group.add(this.box(0.72, 0.08, 0.22, wood, 0, 0.34, 0));
      for (const x of [-0.25, 0, 0.25]) { const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff2c4, emissive: 0xffd58c, emissiveIntensity: 0.15, roughness: 0.4 })); bulb.position.set(x, 1.48, 0.03); group.add(bulb); }
      const tray = this.box(0.46, 0.05, 0.18, cream, 0, 0.38, 0.14); group.add(tray);
    } else if (kind === 'bath-stool') {
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.46, 0.14, 24), cream); seat.position.y = 0.56; seat.scale.z = 0.82; group.add(seat);
      for (const x of [-0.28, 0.28]) for (const z of [-0.22, 0.22]) { const leg = this.box(0.08, 0.5, 0.08, wood, x, 0.25, z); leg.rotation.z = x < 0 ? -0.05 : 0.05; group.add(leg); }
      group.add(this.box(0.52, 0.06, 0.06, accent, 0, 0.24, 0));
      group.add(this.box(0.06, 0.06, 0.38, accent, 0, 0.24, 0));
      const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.39, 0.07, 24), new THREE.MeshStandardMaterial({ color: 0x9dcbd7, roughness: 0.88 })); cushion.position.y = 0.67; cushion.scale.z = 0.82; group.add(cushion);
    } else if (kind === 'towel-rack') {
      const chrome = new THREE.MeshStandardMaterial({ color: 0xc7d0d5, roughness: 0.2, metalness: 0.68 });
      group.add(this.box(1.08, 0.055, 0.055, chrome, 0, 0.88, 0));
      group.add(this.box(0.055, 0.34, 0.055, chrome, -0.52, 0.72, 0));
      group.add(this.box(0.055, 0.34, 0.055, chrome, 0.52, 0.72, 0));
      const towelA = this.box(0.46, 0.56, 0.045, new THREE.MeshStandardMaterial({ color: 0x8fc2d5, roughness: 0.96 }), -0.25, 0.58, 0.04); group.add(towelA);
      const towelB = this.box(0.42, 0.48, 0.045, new THREE.MeshStandardMaterial({ color: 0xf1b3aa, roughness: 0.96 }), 0.26, 0.62, 0.04); group.add(towelB);
      group.add(this.box(0.46, 0.04, 0.05, cream, -0.25, 0.42, 0.07));
      group.add(this.box(0.42, 0.04, 0.05, cream, 0.26, 0.46, 0.07));
    } else if (kind === 'bath-cabinet') {
      group.add(this.box(1.48, 1.42, 0.58, wood, 0, 0.71, 0));
      group.add(this.box(0.66, 1.18, 0.06, cream, -0.36, 0.73, 0.31));
      group.add(this.box(0.66, 1.18, 0.06, cream, 0.36, 0.73, 0.31));
      for (const x of [-0.08, 0.08]) group.add(this.box(0.045, 0.2, 0.035, metal, x, 0.72, 0.36));
      group.add(this.box(1.26, 0.06, 0.44, accent, 0, 1.26, 0));
      const bottleColors = [0x8cc7b8, 0xf0b2a5, 0xd4c3ed];
      bottleColors.forEach((color, index) => { const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.26 + index * 0.04, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.72 })); bottle.position.set(-0.28 + index * 0.28, 1.44 + index * 0.02, 0.02); group.add(bottle); });
    } else if (kind === 'bath-mat') {
      const mat = this.roundedRug(1.7, 1.0, 0x9fcbd7); mat.position.y = 0.025; group.add(mat);
      for (let i = -3; i <= 3; i += 1) group.add(this.box(0.12, 0.018, 0.72, cream, i * 0.2, 0.045, 0));
    } else if (kind === 'bench') {
      group.add(this.box(2.0,.12,.12,wood,0,.58,-.18));
      group.add(this.box(2.0,.12,.12,wood,0,.58,0));
      group.add(this.box(2.0,.12,.12,wood,0,.58,.18));
      group.add(this.box(2.0,.1,.12,wood,0,.98,-.24));
      group.add(this.box(2.0,.1,.12,wood,0,1.18,-.24));
      group.add(this.box(2.0,.1,.12,wood,0,1.38,-.24));
      for (const x of [-.78,.78]) {
        group.add(this.box(.14,.62,.14,wood,x,.31,0));
        group.add(this.box(.14,.88,.14,wood,x,.44,-.24));
        group.add(this.box(.16,.14,.48,wood,x,.76,-.02));
      }
      group.add(this.box(1.72,.08,.18,metal,0,.18,-.12));
      group.add(this.box(1.72,.08,.18,metal,0,.18,.12));
    } else if (kind === 'planter') {
      group.add(this.box(1.66,.4,.62,wood,0,.2,0));
      group.add(this.box(1.54,.18,.48,new THREE.MeshStandardMaterial({ color: 0x6b5940, roughness: 1 }),0,.42,0));
      for(let i=0;i<5;i+=1){
        const stem = this.box(.04,.22 + (i%2)*.06,.04,green,-.6+i*.3,.56, i%2? .08 : -.06); group.add(stem);
        const blossom=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),i%2?accent:cream); blossom.position.set(-.6+i*.3,.78+(i%2)*.06,i%2? .08 : -.06); blossom.scale.set(1,.72,1); group.add(blossom);
        const leaf=new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),green); leaf.position.set(-.56+i*.3,.67,-.1 + (i%2)*.2); leaf.scale.set(.6,1.3,.6); group.add(leaf);
      }
    } else if (kind === 'fountain') {
      const base=new THREE.Mesh(new THREE.CylinderGeometry(.72,.82,.18,22),metal); base.position.y=.09; group.add(base);
      const lowerBasin=new THREE.Mesh(new THREE.CylinderGeometry(.6,.68,.14,22),cream); lowerBasin.position.y=.28; group.add(lowerBasin);
      const waterLower=new THREE.Mesh(new THREE.CylinderGeometry(.48,.5,.04,20), new THREE.MeshPhysicalMaterial({ color: 0x92d7e8, transparent: true, opacity: 0.88, roughness: 0.08, transmission: 0.22 })); waterLower.position.y=.37; group.add(waterLower);
      const column=new THREE.Mesh(new THREE.CylinderGeometry(.11,.16,.72,14),metal); column.position.y=.72; group.add(column);
      const upperBasin=new THREE.Mesh(new THREE.CylinderGeometry(.32,.4,.12,18),cream); upperBasin.position.y=1.05; group.add(upperBasin);
      const finial=new THREE.Mesh(new THREE.SphereGeometry(.14,12,8),accent); finial.position.y=1.28; group.add(finial);
      const waterUpper=new THREE.Mesh(new THREE.CylinderGeometry(.22,.24,.03,16), new THREE.MeshPhysicalMaterial({ color: 0x92d7e8, transparent: true, opacity: 0.88, roughness: 0.08, transmission: 0.22 })); waterUpper.position.y=1.1; group.add(waterUpper);
    } else if (kind === 'pergola') {
      for(const x of [-.9,.9]) for(const z of [-.55,.55]) group.add(this.box(.14,1.9,.14,wood,x,.95,z));
      for(let i=-2;i<=2;i+=1) group.add(this.box(2.2,.1,.12,wood,0,1.9,i*.28));
    } else if (kind === 'picnic-table') {
      group.add(this.box(2.06,.12,.18,wood,0,.86,-.36));
      group.add(this.box(2.06,.12,.18,wood,0,.86,0));
      group.add(this.box(2.06,.12,.18,wood,0,.86,.36));
      group.add(this.box(2.16,.12,.28,cream,0,.52,-.78));
      group.add(this.box(2.16,.12,.28,cream,0,.52,.78));
      for (const x of [-.72,.72]) {
        group.add(this.box(.14,.84,.14,wood,x,.42,-.18));
        group.add(this.box(.14,.84,.14,wood,x,.42,.18));
      }
      group.add(this.box(1.5,.08,.16,wood,0,.24,0));
    } else if (kind === 'hurdle') {
      group.add(this.box(.48,.08,.26,metal,-.68,.04,0)); group.add(this.box(.48,.08,.26,metal,.68,.04,0));
      group.add(this.box(.12,.9,.12,wood,-.68,.45,0)); group.add(this.box(.12,.9,.12,wood,.68,.45,0));
      group.add(this.box(1.52,.12,.12,accent,0,.76,0));
      group.add(this.box(1.24,.06,.12,cream,0,.56,0));
    } else if (kind === 'ramp') {
      const frameMat = wood;
      const deckMat = accent;
      const gripMat = cream;
      const ramp = this.box(2.18,.16,.96,deckMat,0,.61,0); ramp.rotation.z=-.24; group.add(ramp);
      const topPad = this.box(.36,.08,.84,gripMat,.78,.86,0); topPad.rotation.z=-.24; group.add(topPad);
      const grip1 = this.box(1.28,.035,.1,gripMat,-.08,.68,-.22); grip1.rotation.z=-.24; group.add(grip1);
      const grip2 = this.box(1.28,.035,.1,gripMat,-.08,.68,0); grip2.rotation.z=-.24; group.add(grip2);
      const grip3 = this.box(1.28,.035,.1,gripMat,-.08,.68,.22); grip3.rotation.z=-.24; group.add(grip3);
      group.add(this.box(.12,.8,.98,frameMat,-.98,.4,0));
      group.add(this.box(.12,.8,.98,frameMat,.98,.4,0));
      group.add(this.box(.18,.12,1.02,frameMat,-1.04,.08,0));
      group.add(this.box(.18,.12,1.02,frameMat,1.04,.08,0));
      const braceA = this.box(1.86,.08,.08,frameMat,0,.23,-.32); braceA.rotation.z=.18; group.add(braceA);
      const braceB = this.box(1.86,.08,.08,frameMat,0,.23,.32); braceB.rotation.z=.18; group.add(braceB);
    } else if (kind === 'platform') {
      group.add(this.box(1.94,.44,1.38,accent,0,.22,0));
      group.add(this.box(1.58,.08,1.02,cream,0,.49,0));
      group.add(this.box(.24,.12,.24,warm,-.42,.55,-.22));
      group.add(this.box(.24,.12,.24,warm,.42,.55,-.22));
      group.add(this.box(.14,.14,.14,warm,0,.55,.18));
    } else if (kind === 'jump-ring') {
      group.add(this.box(.72,.08,.34,metal,-.6,.04,0));
      group.add(this.box(.72,.08,.34,metal,.6,.04,0));
      group.add(this.box(.14,1.08,.14,wood,-.6,.54,0));
      group.add(this.box(.14,1.08,.14,wood,.6,.54,0));
      const crossbar = this.box(1.48,.08,.12,wood,0,1.14,0); group.add(crossbar);
      const supportA = this.box(.08,.46,.08,wood,-.42,.91,0); supportA.rotation.z=-.36; group.add(supportA);
      const supportB = this.box(.08,.46,.08,wood,.42,.91,0); supportB.rotation.z=.36; group.add(supportB);
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(.44,.08,14,34), accent); hoop.position.y=.86; group.add(hoop);
      const stripe1 = new THREE.Mesh(new THREE.TorusGeometry(.44,.022,10,24), cream); stripe1.position.y=.86; stripe1.rotation.z=.52; group.add(stripe1);
      const stripe2 = new THREE.Mesh(new THREE.TorusGeometry(.44,.022,10,24), cream); stripe2.position.y=.86; stripe2.rotation.z=-.52; group.add(stripe2);
      const lowerStop = this.box(.64,.06,.08,cream,0,.44,0); group.add(lowerStop);
    } else if (kind === 'weave-poles') {
      group.add(this.box(2.28,.08,.18,metal,0,.04,-.16));
      group.add(this.box(2.28,.08,.18,metal,0,.04,.16));
      for (let i = 0; i < 6; i += 1) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.86,10), i % 2 ? accent : cream);
        pole.position.set(-.92 + i * .37,.47,0);
        group.add(pole);
      }
    } else if (kind === 'cone-set') {
      for (let i = 0; i < 5; i += 1) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(.13,.38,12), i % 2 ? accent : warm);
        cone.position.set(-.42 + i * .21,.19,(i % 2 ? -.12 : .12));
        group.add(cone);
      }
    } else {
      const [w,d]=definition.size || [1,1]; group.add(this.box(w,.55,d,warm,0,.28,0));
    }
    group.userData.furnitureItem = item;
    group.traverse((child) => { if (child.isMesh) { child.castShadow=true; child.receiveShadow=true; child.userData.occlusionCandidate=true; } });
    return group;
  },

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
  },

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
      object.position.set(Number(record.x) || 0, clamp(Number(record.y) || 0, 0, 5.5), Number(record.z) || 0);
      object.rotation.y = Number(record.rotation) || 0;
      const scale = clamp(Number(record.scale) || 1, 0.55, 2.2);
      object.scale.setScalar(scale);
      object.userData.decorationId = record.id;
      this.decorationGroup.add(object);
      const [baseWidth, baseDepth] = FURNITURE[record.item]?.size || [1,1];
      const quarter = Math.abs(Math.sin(object.rotation.y));
      const width = (baseWidth * (1 - quarter) + baseDepth * quarter) * scale;
      const depth = (baseDepth * (1 - quarter) + baseWidth * quarter) * scale;
      if (FURNITURE[record.item]?.kind !== 'rug' && object.position.y < 0.65) this.obstacles.push({ minX: object.position.x-width/2, maxX: object.position.x+width/2, minZ: object.position.z-depth/2, maxZ: object.position.z+depth/2, dynamic: true });
    }
    this.environment.add(this.decorationGroup);
    this.syncSemanticAnchors?.();
    if (this.buildGizmoEnabled && this.buildSelectedDecorationId) this.selectDecorationForBuild?.(this.buildSelectedDecorationId);
  },

  setBodyLanguage(id = 'relaxed', intensity = 0.5) {
    const previous = this.bodyLanguageState?.id;
    this.bodyLanguageState = { id, intensity: clamp(intensity, 0, 1) };
    if (previous !== id) this.bodyLanguageClock = 0;
  },

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
  },

  startDream(theme = 'stars') {
    if (this.dreamGroup) this.endDream();
    this.dreamTheme=theme;
    const group=new THREE.Group();
    const colors={treats:0xffb65e,clouds:0xb9ddff,space:0x8d72d8,vacuum:0xff8e94,ocean:0x63c9db,stars:0xffdf77,memory:0xe5bca5,friends:0x9ad9b7};
    const material=new THREE.MeshStandardMaterial({color:colors[theme]||0xffdf77,emissive:colors[theme]||0xffdf77,emissiveIntensity:0.32,roughness:0.55});
    for(let i=0;i<14;i+=1){ const geometry=i%3===0?new THREE.TorusGeometry(0.14,0.045,6,12):i%3===1?new THREE.SphereGeometry(0.12,7,5):new THREE.ConeGeometry(0.11,0.28,5); const mesh=new THREE.Mesh(geometry,material); mesh.position.set(randomBetween(-4.2,4.2),randomBetween(0.5,4.5),randomBetween(-3,2)); group.add(mesh); }
    this.scene.add(group); this.dreamGroup=group;
    this.scene.background.setHex(theme==='space'?0x201a42:0xcbd9ed);
    if (this.scene.fog) this.scene.fog.color.copy(this.scene.background);
  },

  endDream() { if(this.dreamGroup){this.dreamGroup.removeFromParent();this.disposeObject(this.dreamGroup);this.dreamGroup=null;} this.dreamTheme=null; this.setWorldState(this.worldState); },

  setEventTheme(eventId = null) {
    if(this.eventGroup){this.eventGroup.removeFromParent();this.disposeObject(this.eventGroup);this.eventGroup=null;}
    if(!eventId) return;
    const group=new THREE.Group(); const color=eventId.includes('winter')?0xaee4ff:eventId.includes('spooky')?0x9b78d3:eventId.includes('spring')?0xf39ac2:0xffc868; const material=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0.18,roughness:0.7});
    for(let i=0;i<8;i+=1){const mesh=new THREE.Mesh(new THREE.SphereGeometry(0.12,7,5),material);mesh.position.set(-4+i*1.1,2.6+Math.sin(i)*0.2,-3.0);group.add(mesh);} this.scene.add(group);this.eventGroup=group;
  }
};
