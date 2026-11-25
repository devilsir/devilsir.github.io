import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { animateTorchFlame, makeTorchFlame } from "./TorchFlame.js";
export class FireSystem {
    fuel = 0;
    torchLit = false;
    infiniteFuel = false;
    torchAvailable = false;
    scene;
    camera;
    audio;
    materials;
    torchRoot;
    torchLight;
    torchBeam;
    torchFlame = null;
    torchWrap = null;
    torchHandle = null;
    torchSeconds = 0;
    torchLightingActive = false;
    burnables = new Map();
    fires = [];
    scorchMarks = [];
    maxFires = 18;
    maxScorches = 28;
    torchRepulsionRadius = 10.5;
    updateAccumulator = 0;
    constructor(scene, camera, audio, materials) {
        this.scene = scene;
        this.camera = camera;
        this.audio = audio;
        this.materials = materials;
        this.torchRoot = new TransformNode("torch-root", scene);
        this.torchRoot.parent = camera;
        this.torchRoot.position = new Vector3(0.38, -0.34, 0.78);
        this.torchLight = new PointLight("torch-light", new Vector3(0.05, 0.2, 0), scene);
        this.torchLight.parent = this.torchRoot;
        this.torchLight.diffuse = new Color3(1, 0.57, 0.26);
        this.torchLight.specular = new Color3(1, 0.24, 0.05);
        this.torchLight.range = 25;
        this.torchLight.intensity = 0;
        this.torchLight.setEnabled(false);
        this.torchBeam = new SpotLight("torch-beam", new Vector3(0.08, -0.05, 0.1), new Vector3(0, -0.075, 1), Math.PI / 2.25, 2.8, scene);
        this.torchBeam.parent = camera;
        this.torchBeam.diffuse = new Color3(1, 0.62, 0.32);
        this.torchBeam.specular = new Color3(1, 0.28, 0.06);
        this.torchBeam.range = 46;
        this.torchBeam.intensity = 0;
        this.torchBeam.setEnabled(false);
        this.torchRoot.metadata = { constructionLocked: true, torchRig: true };
        this.createTorchVisuals();
        this.torchRoot.setEnabled(false);
        scene.onBeforeRenderObservable.add(() => this.update(scene.metadata?.wonderWorldFrameSeconds ?? scene.getEngine().getDeltaTime() / 1000));
    }
    register(mesh, definition) {
        this.burnables.set(mesh.uniqueId, {
            ...definition,
            mesh,
            burning: false,
            currentHealth: definition.health
        });
    }
    addFuel(amount) {
        this.fuel = Math.min(100, this.fuel + amount);
    }
    setTorchAvailable(available) {
        this.torchAvailable = available;
        if (!available)
            this.torchLit = false;
        this.ensureTorchVisualIntegrity();
        this.torchRoot.setEnabled(available);
        this.syncTorchLights(available && this.torchLit);
    }
    ensureTorchVisualIntegrity() {
        if (this.torchHandle?.isDisposed() || this.torchWrap?.isDisposed() || this.torchFlame?.isDisposed()) {
            const flameMaterial = this.torchFlame?.material;
            for (const mesh of [this.torchHandle, this.torchWrap, this.torchFlame])
                if (mesh && !mesh.isDisposed()) mesh.dispose();
            this.torchFlame = null;
            this.createTorchVisuals();
            if (flameMaterial && flameMaterial !== this.torchFlame.material) flameMaterial.dispose(false, true);
            this.torchFlame.setEnabled(this.torchLightingActive);
        }
    }
    syncTorchLights(active) {
        if (active === this.torchLightingActive)
            return;
        this.torchLightingActive = active;
        this.torchFlame.setEnabled(active);
        this.torchLight.setEnabled(active);
        this.torchBeam.setEnabled(active);
    }
    toggleTorch() {
        if (!this.torchAvailable)
            return false;
        if (this.torchLit) {
            this.torchLit = false;
            this.audio.fireBurst();
            return true;
        }
        if (this.fuel <= 0 && !this.infiniteFuel)
            return false;
        this.torchLit = true;
        this.audio.fireBurst();
        return true;
    }
    useTorch() {
        if (!this.torchLit)
            return null;
        const ray = this.camera.getForwardRay(3.2);
        const pick = this.scene.pickWithRay(ray, (mesh) => mesh.isPickable && mesh.isVisible && mesh.isEnabled());
        if (!pick?.hit || !pick.pickedMesh)
            return null;
        const runtime = this.findBurnable(pick.pickedMesh);
        if (!runtime)
            return null;
        this.ignite(runtime);
        return runtime.mesh;
    }
    igniteMesh(mesh) {
        const runtime = this.findBurnable(mesh);
        if (!runtime || runtime.burning || runtime.currentHealth <= 0)
            return false;
        this.ignite(runtime);
        return true;
    }
    igniteAt(position, duration = 12, withLight = true) {
        if (this.fires.length >= this.maxFires) {
            const oldest = this.fires.shift();
            if (oldest)
                this.disposeFire(oldest);
        }
        const root = new TransformNode(`fire-${Date.now()}-${Math.random()}`, this.scene);
        root.position.copyFrom(position);
        const flameMeshes = [];
        const smokeMeshes = [];
        for (let i = 0; i < 5; i += 1) {
            const flame = MeshBuilder.CreateSphere(`flame-${i}`, { diameter: 0.18 + i * 0.025, segments: 6 }, this.scene);
            flame.parent = root;
            flame.position = new Vector3((Math.random() - 0.5) * 0.3, i * 0.11, (Math.random() - 0.5) * 0.3);
            flame.material = this.materials.emissive(`fire-${i}`, i % 2 ? new Color3(1, 0.18, 0.015) : new Color3(1, 0.62, 0.05), 1.8);
            flame.isPickable = false;
            flameMeshes.push(flame);
        }
        for (let i = 0; i < 3; i += 1) {
            const smoke = MeshBuilder.CreateSphere(`smoke-${i}`, { diameter: 0.28 + i * 0.08, segments: 5 }, this.scene);
            smoke.parent = root;
            smoke.position = new Vector3((Math.random() - 0.5) * 0.25, 0.58 + i * 0.2, (Math.random() - 0.5) * 0.25);
            const smokeMaterial = this.materials.solid(`smoke-${i}`, new Color3(0.08, 0.07, 0.065), 1);
            smokeMaterial.alpha = 0.24;
            smoke.material = smokeMaterial;
            smoke.isPickable = false;
            smokeMeshes.push(smoke);
        }
        const light = withLight ? new PointLight(`fire-light-${this.fires.length}`, new Vector3(0, 0.35, 0), this.scene) : null;
        if (light) {
            light.parent = root;
            light.diffuse = new Color3(1, 0.28, 0.04);
            light.range = 9.5;
            light.intensity = 0.85;
        }
        this.fires.push({ root, light, flameMeshes, smokeMeshes, age: 0, duration, source: null });
        if (position.y < 1.2)
            this.createScorchMark(position);
    }
    isFireNear(position, radius = 2) {
        return this.isTorchThreatNear(position, radius)
            || this.fires.some((fire) => Vector3.Distance(fire.root.position, position) <= radius);
    }
    isTorchThreatNear(position, radius = this.torchRepulsionRadius) {
        if (!this.torchAvailable || !this.torchLit)
            return false;
        const effectiveRadius = Math.max(radius, this.torchRepulsionRadius);
        return Vector3.Distance(this.camera.globalPosition, position) <= effectiveRadius;
    }
    getTorchThreatPosition() {
        return this.torchAvailable && this.torchLit ? this.camera.globalPosition.clone() : null;
    }
    nearestFireDistance(position) {
        let nearest = Infinity;
        for (const fire of this.fires)
            nearest = Math.min(nearest, Vector3.Distance(fire.root.position, position));
        return nearest;
    }
    reset() {
        for (const fire of this.fires)
            this.disposeFire(fire);
        this.fires.length = 0;
        for (const burnable of this.burnables.values()) {
            burnable.burning = false;
            burnable.currentHealth = burnable.health;
        }
    }
    ignite(runtime) {
        if (runtime.burning)
            return;
        runtime.burning = true;
        runtime.onIgnite?.();
        this.audio.fireBurst();
        this.igniteAt(runtime.mesh.getAbsolutePosition().add(new Vector3(0, 0.4, 0)), 14, this.fires.length < 7);
        const fire = this.fires[this.fires.length - 1];
        if (fire)
            fire.source = runtime;
    }
    update(deltaSeconds) {
        this.ensureTorchVisualIntegrity();
        if (!this.torchAvailable)
            this.torchLit = false;
        if (this.torchLit && !this.infiniteFuel) {
            this.fuel = Math.max(0, this.fuel - deltaSeconds * 0.72);
            if (this.fuel <= 0)
                this.torchLit = false;
        }
        const lightingActive = this.torchAvailable && this.torchLit;
        this.syncTorchLights(lightingActive);
        if (lightingActive) {
            const fuel = this.infiniteFuel ? 1 : this.fuel / 100;
            this.torchSeconds += deltaSeconds;
            const t = this.torchSeconds;
            // Soft flicker: enough movement to feel alive without random full-frame flashes.
            const flicker = 1 + Math.sin(t * 10.6) * 0.055 + Math.sin(t * 17.9) * 0.028 + Math.sin(t * 4.1) * 0.03;
            this.torchLight.intensity = flicker * (0.95 + fuel * 1.15);
            this.torchLight.range = 15 + fuel * 10;
            this.torchBeam.intensity = flicker * (2.85 + fuel * 2.85);
            this.torchBeam.range = 30 + fuel * 16;
            animateTorchFlame(this.torchFlame, t);
        }
        this.updateAccumulator += deltaSeconds;
        for (let index = this.fires.length - 1; index >= 0; index -= 1) {
            const fire = this.fires[index];
            fire.age += deltaSeconds;
            const life = Math.max(0, 1 - fire.age / fire.duration);
            fire.flameMeshes.forEach((flame, flameIndex) => {
                flame.position.y += deltaSeconds * (0.08 + flameIndex * 0.018);
                if (flame.position.y > 0.72)
                    flame.position.y = 0.05;
                flame.scaling.setAll((0.65 + Math.random() * 0.5) * Math.max(0.3, life));
            });
            fire.smokeMeshes.forEach((smoke, smokeIndex) => {
                smoke.position.y += deltaSeconds * (0.06 + smokeIndex * 0.03);
                smoke.scaling.setAll(0.8 + fire.age * 0.035);
            });
            if (fire.light)
                fire.light.intensity = (0.45 + Math.random() * 0.75) * life;
            if (fire.age >= fire.duration) {
                this.disposeFire(fire);
                this.fires.splice(index, 1);
            }
        }
        if (this.updateAccumulator < 0.25)
            return;
        const tick = this.updateAccumulator;
        this.updateAccumulator = 0;
        for (const fire of this.fires) {
            if (!fire.source)
                continue;
            const source = fire.source;
            source.currentHealth -= tick * 13;
            source.onBurnTick?.(tick * 13);
            if (source.currentHealth <= 0) {
                source.onDestroyed?.();
                source.burning = false;
                fire.source = null;
                continue;
            }
            const radius = source.spreadRadius ?? 1.5;
            for (const candidate of this.burnables.values()) {
                if (candidate === source || candidate.burning || candidate.currentHealth <= 0)
                    continue;
                if (Vector3.Distance(candidate.mesh.getAbsolutePosition(), source.mesh.getAbsolutePosition()) <= radius && Math.random() < 0.16) {
                    this.ignite(candidate);
                    break;
                }
            }
        }
    }
    createTorchVisuals() {
        const handle = MeshBuilder.CreateCylinder("torch-handle", { height: 0.72, diameter: 0.055, tessellation: 8 }, this.scene);
        this.torchHandle = handle;
        handle.parent = this.torchRoot;
        handle.rotation.z = -0.3;
        handle.position.y = -0.18;
        handle.material = this.materials.get("wood", 1);
        handle.isPickable = false;
        handle.alwaysSelectAsActiveMesh = true;
        handle.metadata = { constructionLocked: true, torchRig: true };
        const wrap = MeshBuilder.CreateCylinder("torch-wrap", { height: 0.12, diameterTop: 0.104, diameterBottom: 0.073, tessellation: 8 }, this.scene);
        wrap.parent = this.torchRoot;
        wrap.position.set(0.05, 0.149, 0);
        wrap.rotation.z = handle.rotation.z;
        wrap.material = this.materials.solid("torch-wrap-material", new Color3(0.18, 0.067, 0.03), 0.94);
        wrap.isPickable = false;
        wrap.alwaysSelectAsActiveMesh = true;
        wrap.metadata = { constructionLocked: true, torchRig: true };
        this.torchWrap = wrap;
        this.torchFlame = makeTorchFlame(this.scene, this.torchRoot);
    }
    createScorchMark(position) {
        if (this.scorchMarks.length >= this.maxScorches)
            this.scorchMarks.shift()?.dispose();
        const scorch = MeshBuilder.CreateCylinder(`scorch-${Date.now()}-${Math.random()}`, {
            height: 0.012,
            diameter: 0.8 + Math.random() * 0.8,
            tessellation: 18
        }, this.scene);
        scorch.position = new Vector3(position.x, 0.014, position.z);
        scorch.scaling.z = 0.65 + Math.random() * 0.55;
        scorch.rotation.y = Math.random() * Math.PI;
        scorch.material = this.materials.get("burned", this.scorchMarks.length);
        scorch.isPickable = false;
        this.scorchMarks.push(scorch);
    }
    findBurnable(mesh) {
        let current = mesh;
        while (current) {
            const runtime = this.burnables.get(current.uniqueId);
            if (runtime)
                return runtime;
            current = current.parent instanceof Object && "uniqueId" in current.parent ? current.parent : null;
        }
        return null;
    }
    disposeFire(fire) {
        fire.light?.dispose();
        fire.flameMeshes.forEach((mesh) => mesh.dispose());
        fire.smokeMeshes.forEach((mesh) => mesh.dispose());
        fire.root.dispose();
    }
}
