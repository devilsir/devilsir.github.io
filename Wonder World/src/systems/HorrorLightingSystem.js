import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { Scene } from "@babylonjs/core/scene";
/**
 * Centralised survival-horror lighting pass. It keeps the environment dark,
 * preserves gameplay-critical emissive lights and applies controlled,
 * non-synchronised flicker to old fixtures without fighting chapter scripts.
 */
export class HorrorLightingSystem {
    scene;
    camera;
    safeMode;
    tracked = new Map();
    glow;
    pipeline;
    elapsed = 0;
    scanAccumulator = 0;
    editorMode = false;
    editorFill;
    editorKey;
    editorSnapshot = null;
    constructor(scene, camera, safeMode) {
        this.scene = scene;
        this.camera = camera;
        this.safeMode = safeMode;
        this.scene.clearColor = new Color4(0.003, 0.004, 0.007, 1);
        this.scene.fogMode = Scene.FOGMODE_EXP2;
        this.scene.fogColor = new Color3(0.008, 0.011, 0.017);
        this.scene.fogDensity = safeMode ? 0.014 : 0.019;
        this.scene.ambientColor = new Color3(0.012, 0.014, 0.02);
        const image = this.scene.imageProcessingConfiguration;
        image.contrast = 1.38;
        image.exposure = 0.78;
        image.toneMappingEnabled = true;
        image.vignetteEnabled = true;
        image.vignetteWeight = 2.6;
        image.vignetteStretch = 0.22;
        image.vignetteColor = new Color4(0.002, 0.003, 0.006, 1);
        try {
            const glow = new GlowLayer("horror-emissive-glow", scene, {
                blurKernelSize: safeMode ? 16 : 32
            });
            glow.intensity = safeMode ? 0.32 : 0.58;
            this.glow = glow;
        }
        catch (error) {
            console.warn("Glow emissivo indisponível; mantendo a iluminação base.", error);
            this.glow = null;
        }
        if (safeMode) {
            this.pipeline = null;
        }
        else {
            try {
                const pipeline = new DefaultRenderingPipeline("horror-post", true, scene, [camera]);
                pipeline.samples = 1;
                pipeline.fxaaEnabled = true;
                pipeline.bloomEnabled = true;
                pipeline.bloomThreshold = 0.78;
                pipeline.bloomWeight = 0.18;
                pipeline.bloomKernel = 48;
                pipeline.grainEnabled = true;
                if (pipeline.grain) {
                    pipeline.grain.intensity = 8;
                    pipeline.grain.animated = true;
                }
                pipeline.sharpenEnabled = true;
                if (pipeline.sharpen) {
                    pipeline.sharpen.edgeAmount = 0.22;
                    pipeline.sharpen.colorAmount = 0.8;
                }
                pipeline.chromaticAberrationEnabled = true;
                if (pipeline.chromaticAberration) {
                    pipeline.chromaticAberration.aberrationAmount = 4;
                    pipeline.chromaticAberration.radialIntensity = 0.18;
                }
                this.pipeline = pipeline;
            }
            catch (error) {
                console.warn("Pós-processamento cinematográfico indisponível; mantendo o jogo funcional.", error);
                this.pipeline = null;
            }
        }
        this.editorFill = new HemisphericLight("construction-editor-fill", new Vector3(0.15, 1, 0.2), this.scene);
        this.editorFill.diffuse = new Color3(0.9, 0.94, 1);
        this.editorFill.groundColor = new Color3(0.34, 0.37, 0.44);
        this.editorFill.specular = new Color3(0.42, 0.46, 0.55);
        this.editorFill.intensity = 1.42;
        this.editorFill.metadata = { constructionEditorLight: true };
        this.editorFill.setEnabled(false);
        this.editorKey = new DirectionalLight("construction-editor-key", new Vector3(-0.38, -1, 0.26), this.scene);
        this.editorKey.position = new Vector3(32, 48, -28);
        this.editorKey.diffuse = new Color3(1, 0.95, 0.86);
        this.editorKey.specular = new Color3(0.72, 0.76, 0.86);
        this.editorKey.intensity = 0.82;
        this.editorKey.metadata = { constructionEditorLight: true };
        this.editorKey.setEnabled(false);
        this.rescanLights();
        this.scene.onNewLightAddedObservable.add((light) => this.track(light));
    }
    setEditorMode(active) {
        if (this.editorMode === active)
            return;
        this.editorMode = active;
        const image = this.scene.imageProcessingConfiguration;
        if (active) {
            this.editorSnapshot = {
                clearColor: this.scene.clearColor.clone(),
                fogMode: this.scene.fogMode,
                fogColor: this.scene.fogColor.clone(),
                fogDensity: this.scene.fogDensity,
                ambientColor: this.scene.ambientColor.clone(),
                contrast: image.contrast,
                exposure: image.exposure,
                vignetteEnabled: image.vignetteEnabled,
                glowIntensity: this.glow?.intensity ?? null,
                bloomEnabled: this.pipeline?.bloomEnabled ?? null,
                grainEnabled: this.pipeline?.grainEnabled ?? null,
                chromaticAberrationEnabled: this.pipeline?.chromaticAberrationEnabled ?? null
            };
            this.scene.clearColor = new Color4(0.11, 0.125, 0.15, 1);
            this.scene.fogMode = Scene.FOGMODE_NONE;
            this.scene.fogDensity = 0;
            this.scene.ambientColor = new Color3(0.72, 0.76, 0.84);
            image.contrast = 1.04;
            image.exposure = 1.34;
            image.vignetteEnabled = false;
            if (this.glow)
                this.glow.intensity = 0.22;
            if (this.pipeline) {
                this.pipeline.bloomEnabled = false;
                this.pipeline.grainEnabled = false;
                this.pipeline.chromaticAberrationEnabled = false;
            }
            this.editorFill.setEnabled(true);
            this.editorKey.setEnabled(true);
            for (const tracked of this.tracked.values()) {
                tracked.light.intensity = Math.max(tracked.sourceIntensity * 0.72, tracked.lastApplied);
            }
            return;
        }
        this.editorFill.setEnabled(false);
        this.editorKey.setEnabled(false);
        const snapshot = this.editorSnapshot;
        if (snapshot) {
            this.scene.clearColor = snapshot.clearColor;
            this.scene.fogMode = snapshot.fogMode;
            this.scene.fogColor = snapshot.fogColor;
            this.scene.fogDensity = snapshot.fogDensity;
            this.scene.ambientColor = snapshot.ambientColor;
            image.contrast = snapshot.contrast;
            image.exposure = snapshot.exposure;
            image.vignetteEnabled = snapshot.vignetteEnabled;
            if (this.glow && snapshot.glowIntensity !== null)
                this.glow.intensity = snapshot.glowIntensity;
            if (this.pipeline) {
                if (snapshot.bloomEnabled !== null)
                    this.pipeline.bloomEnabled = snapshot.bloomEnabled;
                if (snapshot.grainEnabled !== null)
                    this.pipeline.grainEnabled = snapshot.grainEnabled;
                if (snapshot.chromaticAberrationEnabled !== null)
                    this.pipeline.chromaticAberrationEnabled = snapshot.chromaticAberrationEnabled;
            }
        }
        this.editorSnapshot = null;
        for (const tracked of this.tracked.values())
            tracked.light.intensity = tracked.lastApplied;
    }
    applyPerformancePreset(preset) {
        this.scene.fogDensity = preset === "performance" ? 0.014 : preset === "cinematic" ? 0.022 : 0.019;
        if (this.glow)
            this.glow.intensity = preset === "performance" ? 0.3 : preset === "cinematic" ? 0.68 : 0.52;
        if (this.pipeline) {
            this.pipeline.bloomEnabled = preset !== "performance";
            this.pipeline.grainEnabled = preset !== "performance";
            this.pipeline.chromaticAberrationEnabled = preset === "cinematic";
            this.pipeline.sharpenEnabled = true;
        }
    }
    rescanLights() {
        for (const light of this.scene.lights)
            this.track(light);
    }
    update(deltaSeconds) {
        this.elapsed += deltaSeconds;
        if (this.editorMode)
            return;
        this.scanAccumulator += deltaSeconds;
        if (this.scanAccumulator > 1.5) {
            this.scanAccumulator = 0;
            this.rescanLights();
        }
        for (const tracked of this.tracked.values()) {
            const light = tracked.light;
            if (!light || light.isDisposed?.())
                continue;
            // Chapter logic may change a light after the horror pass. When that happens,
            // treat the new value as the authored source intensity instead of overriding it.
            const externalDelta = Math.abs((light.intensity ?? 0) - tracked.lastApplied);
            if (externalDelta > Math.max(0.04, Math.abs(tracked.lastApplied) * 0.28)) {
                tracked.sourceIntensity = Math.max(0, (light.intensity ?? 0) / Math.max(0.001, tracked.multiplier));
            }
            let flicker = 1;
            if (tracked.flicker && tracked.sourceIntensity > 0.02) {
                const slow = Math.sin(this.elapsed * (5.7 + tracked.seed * 1.8) + tracked.phase) * 0.035;
                const unstable = Math.sin(this.elapsed * (27 + tracked.seed * 13) + tracked.phase * 2.1) * 0.018;
                const drop = Math.sin(this.elapsed * (0.42 + tracked.seed * 0.18) + tracked.phase) > 0.965
                    ? 0.24 + tracked.seed * 0.2
                    : 1;
                flicker = Math.max(0.15, (1 + slow + unstable) * drop);
            }
            tracked.multiplier = tracked.scale * flicker;
            tracked.lastApplied = tracked.sourceIntensity * tracked.multiplier;
            light.intensity = tracked.lastApplied;
        }
    }
    track(light) {
        if (!light || light.metadata?.constructionEditorLight || this.tracked.has(light.uniqueId))
            return;
        const name = String(light.name ?? "light").toLowerCase();
        const critical = ["torch", "fire-light", "guide", "checkpoint", "beacon", "status", "alarm", "emergency", "projector", "ember"].some((token) => name.includes(token));
        const global = name === "ambient" || name === "storm-directional";
        const facility = ["facility", "chapter2-light", "chapter3-light", "corridor", "ceiling", "room-light"].some((token) => name.includes(token));
        const scale = global ? 1 : critical ? 0.82 : facility ? 0.27 : 0.43;
        const flicker = !this.safeMode && facility && this.hash(name) % 3 !== 0;
        const seed = (this.hash(name) % 997) / 997;
        const sourceIntensity = Math.max(0, Number(light.intensity ?? 0));
        const multiplier = scale;
        const tracked = {
            light,
            sourceIntensity,
            lastApplied: sourceIntensity * multiplier,
            multiplier,
            scale,
            flicker,
            seed,
            phase: seed * Math.PI * 2
        };
        light.intensity = tracked.lastApplied;
        this.tracked.set(light.uniqueId, tracked);
    }
    hash(value) {
        let hash = 2166136261;
        for (let index = 0; index < value.length; index += 1) {
            hash ^= value.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return Math.abs(hash >>> 0);
    }
}
