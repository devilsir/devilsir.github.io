import * as THREE from '../../vendor/three.module.js';
import { clamp, lerp, randomBetween } from '../utils.js';

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

  triggerJump() { return this.currentPet?.controller.jumpSequence(); },

  playAnimation(name, options = {}) { return this.currentPet?.controller.play(name, options); },

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
      object.position.set(record.x || 0, 0, record.z || 0);
      object.rotation.y = record.rotation || 0;
      object.userData.decorationId = record.id;
      this.decorationGroup.add(object);
      const sizes = { 'cozy-bed':[1.8,1.2],sofa:[2.2,1],'scratch-post':[0.8,0.8],rug:[2,1.4],plant:[0.7,0.7],lamp:[0.7,0.7],'toy-box':[1.1,0.8],bowl:[0.7,0.7] };
      const [width, depth] = sizes[record.item] || [1,1];
      if (record.item !== 'rug') this.obstacles.push({ minX: object.position.x-width/2, maxX: object.position.x+width/2, minZ: object.position.z-depth/2, maxZ: object.position.z+depth/2, dynamic: true });
    }
    this.environment.add(this.decorationGroup);
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
    this.scene.fog.color.copy(this.scene.background);
  },

  endDream() { if(this.dreamGroup){this.dreamGroup.removeFromParent();this.disposeObject(this.dreamGroup);this.dreamGroup=null;} this.dreamTheme=null; this.setWorldState(this.worldState); },

  setEventTheme(eventId = null) {
    if(this.eventGroup){this.eventGroup.removeFromParent();this.disposeObject(this.eventGroup);this.eventGroup=null;}
    if(!eventId) return;
    const group=new THREE.Group(); const color=eventId.includes('winter')?0xaee4ff:eventId.includes('spooky')?0x9b78d3:eventId.includes('spring')?0xf39ac2:0xffc868; const material=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0.18,roughness:0.7});
    for(let i=0;i<8;i+=1){const mesh=new THREE.Mesh(new THREE.SphereGeometry(0.12,7,5),material);mesh.position.set(-4+i*1.1,2.6+Math.sin(i)*0.2,-3.0);group.add(mesh);} this.scene.add(group);this.eventGroup=group;
  }
};
