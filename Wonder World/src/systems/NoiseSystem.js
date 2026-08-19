import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
export class NoiseSystem {
    danger = 0;
    enabled = false;
    scene;
    materials;
    events = [];
    listeners = new Set();
    debugMeshes = [];
    nextId = 1;
    elapsed = 0;
    visualize = false;
    dangerHold = 0;
    thresholdCooldown = 0;
    onThreshold = null;
    constructor(scene, materials) {
        this.scene = scene;
        this.materials = materials;
        for (let index = 0; index < 14; index += 1) {
            const marker = MeshBuilder.CreateSphere(`noise-debug-${index}`, { diameter: 1, segments: 8 }, scene);
            marker.isPickable = false;
            marker.isVisible = false;
            marker.material = materials.emissive(`noise-debug-material-${index}`, new Color3(0.9, 0.32, 0.12), 0.75);
            this.debugMeshes.push(marker);
        }
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.events.length = 0;
            this.danger = 0;
            this.refreshDebugMeshes();
        }
    }
    setThresholdHandler(handler) {
        this.onThreshold = handler;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    emit(definition) {
        if (!this.enabled)
            return null;
        const intensity = Math.max(0, Math.min(1.5, definition.intensity));
        if (intensity <= 0.005)
            return null;
        const duration = Math.max(0.05, Math.min(12, definition.duration ?? this.defaultDuration(definition.category)));
        const event = {
            id: this.nextId++,
            position: definition.position.clone(),
            intensity,
            duration,
            remaining: duration,
            range: Math.max(1, Math.min(80, definition.range ?? this.defaultRange(definition.category, intensity))),
            material: definition.material ?? "concrete",
            category: definition.category,
            obstructionFactor: Math.max(0.12, Math.min(1, definition.obstructionFactor ?? 0.68)),
            createdAt: this.elapsed
        };
        this.events.push(event);
        if (this.events.length > 36)
            this.events.splice(0, this.events.length - 36);
        const dangerGain = this.dangerWeight(event.category) * event.intensity * 15;
        this.danger = Math.min(100, this.danger + dangerGain);
        this.dangerHold = Math.max(this.dangerHold, 1.2 + event.duration * 0.35);
        for (const listener of this.listeners)
            listener(event);
        this.refreshDebugMeshes();
        return event;
    }
    update(deltaSeconds) {
        if (!this.enabled)
            return { danger: 0, strongest: null, activeCount: 0 };
        this.elapsed += deltaSeconds;
        this.thresholdCooldown = Math.max(0, this.thresholdCooldown - deltaSeconds);
        this.dangerHold = Math.max(0, this.dangerHold - deltaSeconds);
        for (let index = this.events.length - 1; index >= 0; index -= 1) {
            const event = this.events[index];
            event.remaining -= deltaSeconds;
            if (event.remaining <= 0)
                this.events.splice(index, 1);
        }
        const decay = this.dangerHold > 0 ? 1.1 : this.danger > 70 ? 4.2 : 7.4;
        this.danger = Math.max(0, this.danger - decay * deltaSeconds);
        if (this.danger >= 74 && this.thresholdCooldown <= 0) {
            this.thresholdCooldown = 7;
            this.onThreshold?.(this.danger);
        }
        if (this.visualize)
            this.refreshDebugMeshes();
        return { danger: this.danger, strongest: this.strongest(), activeCount: this.events.length };
    }
    strongest(origin, maxRange = Infinity) {
        let best = null;
        let bestScore = 0;
        for (const event of this.events) {
            const distance = origin ? Vector3.Distance(origin, event.position) : 0;
            if (distance > Math.min(maxRange, event.range))
                continue;
            const ageFactor = Math.max(0.12, event.remaining / event.duration);
            const distanceFactor = origin ? Math.max(0, 1 - distance / event.range) : 1;
            const score = event.intensity * ageFactor * (0.25 + distanceFactor * 0.75);
            if (score > bestScore) {
                best = event;
                bestScore = score;
            }
        }
        return best;
    }
    perceivedIntensity(event, listenerPosition, obstructed) {
        const distance = Vector3.Distance(listenerPosition, event.position);
        if (distance >= event.range)
            return 0;
        const falloff = 1 - distance / event.range;
        return event.intensity * falloff * (obstructed ? event.obstructionFactor : 1);
    }
    restoreDanger(value) {
        this.danger = Math.max(0, Math.min(100, value));
        this.dangerHold = 0;
    }
    clearDanger(amount = 100) {
        this.danger = Math.max(0, this.danger - Math.max(0, amount));
    }
    toggleVisualization() {
        this.visualize = !this.visualize;
        this.refreshDebugMeshes();
        return this.visualize;
    }
    inspect() {
        const strongest = this.strongest();
        return `noise danger=${this.danger.toFixed(1)} events=${this.events.length} strongest=${strongest ? `${strongest.category}@${strongest.position.toString()}` : "none"}`;
    }
    refreshDebugMeshes() {
        this.debugMeshes.forEach((mesh, index) => {
            const event = this.events[index];
            mesh.isVisible = this.visualize && Boolean(event);
            if (!event)
                return;
            mesh.position.copyFrom(event.position);
            const pulse = 0.82 + Math.sin((this.elapsed - event.createdAt) * 8) * 0.12;
            const scale = Math.max(0.25, event.range * 0.055 * pulse);
            mesh.scaling.setAll(scale);
            mesh.visibility = Math.max(0.12, event.remaining / event.duration * 0.55);
        });
    }
    defaultDuration(category) {
        if (category === "alarm" || category === "machine" || category === "gas")
            return 3.5;
        if (category === "fire")
            return 2.2;
        if (category === "attack" || category === "impact" || category === "failure")
            return 1.4;
        return 0.65;
    }
    defaultRange(category, intensity) {
        const base = {
            footstep: 8,
            sprint: 17,
            crouch: 4.5,
            attack: 22,
            impact: 24,
            door: 19,
            machine: 38,
            alarm: 52,
            fire: 24,
            gas: 20,
            distraction: 34,
            failure: 42
        };
        return base[category] * (0.65 + intensity * 0.55);
    }
    dangerWeight(category) {
        const weights = {
            footstep: 0.18,
            sprint: 0.52,
            crouch: 0.06,
            attack: 0.72,
            impact: 0.62,
            door: 0.48,
            machine: 0.7,
            alarm: 1,
            fire: 0.56,
            gas: 0.35,
            distraction: 0.74,
            failure: 0.92
        };
        return weights[category];
    }
}
