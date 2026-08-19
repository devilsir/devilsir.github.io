import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
export class MannequinSystem {
    scene;
    materials;
    player;
    audio;
    ui;
    fire;
    onDamage;
    records = [];
    actors = [];
    lowDetailSource;
    lowDetailMatrices;
    occlusionLines = [];
    mirrorResolver = () => false;
    movementEnabled = true;
    chapterEnabled = false;
    lightingLevel = 1;
    rulesCollapsed = 0;
    updateAccumulator = 0;
    matrixAccumulator = 0;
    groupCursor = 0;
    lurePosition = null;
    lureExpiresAt = 0;
    observationVisualization = false;
    occlusionVisualization = false;
    aiCostMs = 0;
    lastRearCue = 0;
    countLimit;
    highDetailLimit;
    constructor(scene, materials, player, audio, ui, fire, spawns, onDamage, highDetailLimit = 14) {
        this.scene = scene;
        this.materials = materials;
        this.player = player;
        this.audio = audio;
        this.ui = ui;
        this.fire = fire;
        this.onDamage = onDamage;
        this.highDetailLimit = Math.max(6, highDetailLimit);
        this.countLimit = spawns.length;
        this.lowDetailSource = MeshBuilder.CreateCapsule("mannequin-thin-source", {
            height: 2.55,
            radius: 0.38,
            tessellation: 8,
            subdivisions: 2
        }, scene);
        this.lowDetailSource.material = materials.get("plastic", 1);
        this.lowDetailSource.isPickable = false;
        this.lowDetailSource.checkCollisions = false;
        this.lowDetailSource.metadata = { mannequinVisual: true };
        spawns.forEach((spawn, index) => {
            this.records.push({
                id: index,
                position: spawn.position.clone(),
                home: spawn.position.clone(),
                rotationY: spawn.rotationY ?? ((index * 1.618) % (Math.PI * 2)),
                group: spawn.group ?? index % 8,
                pose: spawn.pose ?? index % 6,
                state: "dormant",
                observed: false,
                observedUntil: 0,
                activeSlot: -1,
                enabled: spawn.enabled ?? true,
                anticipation: 0,
                health: 100,
                lastJointCue: 0,
                movePhase: index * 0.73
            });
        });
        this.lowDetailMatrices = new Float32Array(this.records.length * 16);
        this.lowDetailSource.thinInstanceSetBuffer("matrix", this.lowDetailMatrices, 16, true);
        for (let index = 0; index < this.highDetailLimit; index += 1)
            this.actors.push(this.createActor(index));
        this.refreshThinInstances(true);
    }
    setChapterEnabled(enabled) {
        this.chapterEnabled = enabled;
        this.lowDetailSource.setEnabled(enabled);
        if (!enabled)
            this.actors.forEach((actor) => actor.root.setEnabled(false));
    }
    setMovementEnabled(enabled) {
        this.movementEnabled = enabled;
    }
    setLightingLevel(level) {
        this.lightingLevel = Math.max(0, Math.min(1, level));
    }
    setRuleCollapse(progress) {
        this.rulesCollapsed = Math.max(0, Math.min(1, progress));
    }
    setMirrorResolver(resolver) {
        this.mirrorResolver = resolver;
    }
    setCount(count) {
        this.countLimit = Math.max(8, Math.min(this.records.length, Math.round(count)));
        for (const record of this.records)
            record.enabled = record.id < this.countLimit && record.state !== "inactive";
        this.refreshThinInstances(true);
    }
    toggleObservationVisualization() {
        this.observationVisualization = !this.observationVisualization;
        return this.observationVisualization;
    }
    toggleOcclusionVisualization() {
        this.occlusionVisualization = !this.occlusionVisualization;
        if (!this.occlusionVisualization)
            this.clearOcclusionLines();
        return this.occlusionVisualization;
    }
    emitLure(position, strength = 1, duration = 8) {
        this.lurePosition = position.clone();
        this.lureExpiresAt = performance.now() * 0.001 + duration;
        this.audio.metalLure(position, strength);
        for (const record of this.records) {
            if (!record.enabled || record.state === "crushed" || record.state === "inactive")
                continue;
            const distance = Vector3.Distance(record.position, position);
            if (distance < 18 + strength * 14 && record.state === "dormant")
                record.state = "stalking";
        }
    }
    crushInRadius(center, radius) {
        let crushed = 0;
        for (const record of this.records) {
            if (!record.enabled || record.state === "crushed" || record.state === "inactive")
                continue;
            if (Vector3.Distance(record.position, center) > radius)
                continue;
            record.state = "crushed";
            record.health = 0;
            record.observed = false;
            record.anticipation = 0;
            crushed += 1;
            this.audio.mannequinBreak(record.position);
            const actor = record.activeSlot >= 0 ? this.actors[record.activeSlot] : undefined;
            if (actor) {
                actor.root.setEnabled(false);
                actor.recordId = -1;
                record.activeSlot = -1;
            }
        }
        if (crushed > 0)
            this.refreshThinInstances(true);
        return crushed;
    }
    deactivateNearest(position, radius) {
        let selected = null;
        let distance = radius;
        for (const record of this.records) {
            if (!record.enabled || record.state === "inactive" || record.state === "crushed")
                continue;
            const candidate = Vector3.Distance(position, record.position);
            if (candidate < distance) {
                selected = record;
                distance = candidate;
            }
        }
        if (selected) {
            selected.state = "inactive";
            selected.enabled = false;
            this.refreshThinInstances(true);
        }
        return selected;
    }
    attackNearest(origin, forward, range, damage, charged) {
        let selected = null;
        let bestScore = Number.POSITIVE_INFINITY;
        const horizontalForward = forward.clone();
        horizontalForward.y = 0;
        if (horizontalForward.lengthSquared() < 0.001)
            return false;
        horizontalForward.normalize();
        for (const record of this.records) {
            if (!record.enabled || record.state === "crushed" || record.state === "inactive")
                continue;
            const offset = record.position.subtract(origin);
            offset.y = 0;
            const distance = offset.length();
            if (distance > range || distance < 0.001)
                continue;
            const facing = Vector3.Dot(horizontalForward, offset.scale(1 / distance));
            if (facing < (charged ? 0.42 : 0.58))
                continue;
            const score = distance + (1 - facing) * 2;
            if (score < bestScore) {
                bestScore = score;
                selected = record;
            }
        }
        if (!selected)
            return false;
        selected.health = Math.max(0, selected.health - damage);
        selected.observed = false;
        selected.anticipation = 0;
        const push = selected.position.subtract(origin);
        push.y = 0;
        if (push.lengthSquared() > 0.001)
            this.moveRecordSafely(selected, push.normalize().scale(charged ? 1.5 : 0.7));
        this.audio.mannequinBreak(selected.position);
        if (selected.health <= 0) {
            selected.state = "crushed";
            selected.enabled = false;
            const actor = selected.activeSlot >= 0 ? this.actors[selected.activeSlot] : undefined;
            if (actor) {
                actor.root.setEnabled(false);
                actor.recordId = -1;
                selected.activeSlot = -1;
            }
            this.refreshThinInstances(true);
        }
        else {
            selected.state = selected.health < 45 ? "crawler" : "stalking";
        }
        return true;
    }
    resetForPlayerRespawn() {
        this.lurePosition = null;
        this.lureExpiresAt = 0;
        for (const record of this.records) {
            if (record.state === "crushed" || record.state === "inactive" || !record.enabled)
                continue;
            record.position.copyFrom(record.home);
            record.state = "dormant";
            record.anticipation = 0;
            record.observed = false;
            record.observedUntil = 0;
        }
        this.actors.forEach((actor) => { actor.root.setEnabled(false); actor.recordId = -1; });
        this.records.forEach((record) => { record.activeSlot = -1; });
        this.refreshThinInstances(true);
    }
    getReflectableMeshes() {
        const meshes = [this.lowDetailSource];
        for (const actor of this.actors)
            meshes.push(...actor.skinMeshes, ...actor.joints);
        return meshes;
    }
    getNearestRearDistance() {
        const forward = this.player.forward();
        let nearest = Infinity;
        for (const record of this.records) {
            if (!record.enabled || record.state === "crushed" || record.state === "inactive")
                continue;
            const offset = record.position.subtract(this.player.collider.position);
            const distance = offset.length();
            if (distance > 10 || distance < 0.001)
                continue;
            if (Vector3.Dot(offset.scale(1 / distance), forward) < -0.18)
                nearest = Math.min(nearest, distance);
        }
        return nearest;
    }
    update(deltaSeconds) {
        if (!this.chapterEnabled)
            return;
        const start = performance.now();
        this.updateAccumulator += deltaSeconds;
        this.matrixAccumulator += deltaSeconds;
        const tickRate = this.rulesCollapsed > 0.65 ? 0.065 : 0.095;
        if (this.updateAccumulator < tickRate) {
            this.animateActors(deltaSeconds);
            return;
        }
        const step = Math.min(0.18, this.updateAccumulator);
        this.updateAccumulator = 0;
        const now = performance.now() * 0.001;
        if (this.lurePosition && now >= this.lureExpiresAt)
            this.lurePosition = null;
        const updateGroup = this.groupCursor % 4;
        this.groupCursor += 1;
        const raySamples = [];
        for (const record of this.records) {
            if (!record.enabled || record.id >= this.countLimit || record.state === "inactive")
                continue;
            const distance = Vector3.Distance(record.position, this.player.collider.position);
            if (distance > 55 && record.group % 4 !== updateGroup)
                continue;
            const observedResult = this.evaluateObservation(record, now);
            record.observed = observedResult.observed;
            if (observedResult.ray)
                raySamples.push(observedResult.ray);
            this.updateRecord(record, step, now, distance);
        }
        this.assignActors();
        this.animateActors(step);
        if (this.matrixAccumulator > 0.16) {
            this.matrixAccumulator = 0;
            this.refreshThinInstances(false);
        }
        this.updateRearWarning(now);
        if (this.occlusionVisualization)
            this.drawOcclusionLines(raySamples.slice(0, 12));
        this.aiCostMs = this.aiCostMs * 0.72 + (performance.now() - start) * 0.28;
    }
    inspect() {
        let enabled = 0;
        let observed = 0;
        let running = 0;
        let crawling = 0;
        for (const record of this.records) {
            if (!record.enabled || record.id >= this.countLimit)
                continue;
            enabled += 1;
            if (record.observed)
                observed += 1;
            if (record.state === "running")
                running += 1;
            if (record.state === "crawler")
                crawling += 1;
        }
        return {
            enabled,
            observed,
            activeActors: this.records.filter((record) => record.activeSlot >= 0).length,
            running,
            crawling,
            aiCostMs: this.aiCostMs,
            drawEstimate: 2 + this.actors.filter((actor) => actor.root.isEnabled()).length * 7,
            ruleCollapse: this.rulesCollapsed,
            lureActive: this.lurePosition !== null
        };
    }
    evaluateObservation(record, now) {
        if (this.lightingLevel < 0.14)
            return { observed: false };
        const cameraPosition = this.player.camera.globalPosition;
        const target = record.position.add(new Vector3(0, record.state === "crawler" ? 0.5 : 1.25, 0));
        const offset = target.subtract(cameraPosition);
        const distance = offset.length();
        if (distance < 0.01 || distance > 38)
            return { observed: now < record.observedUntil };
        const direction = offset.scale(1 / distance);
        const cameraDirection = this.player.camera.getForwardRay().direction.normalize();
        const viewDot = Vector3.Dot(cameraDirection, direction);
        const projected = Vector3.Project(target, Matrix.Identity(), this.scene.getTransformMatrix(), this.player.camera.viewport.toGlobal(this.scene.getEngine().getRenderWidth(), this.scene.getEngine().getRenderHeight()));
        const inScreen = projected.z > 0 && projected.z < 1
            && projected.x > -40 && projected.x < this.scene.getEngine().getRenderWidth() + 40
            && projected.y > -40 && projected.y < this.scene.getEngine().getRenderHeight() + 40;
        const directCandidate = inScreen && viewDot > (distance < 8 ? 0.34 : 0.48);
        let blocked = false;
        if (directCandidate) {
            const pick = this.scene.pickWithRay(new Ray(cameraPosition, direction, distance), (mesh) => {
                if (!mesh.isPickable || !mesh.isVisible || !mesh.isEnabled())
                    return false;
                if (mesh === this.player.collider || mesh.metadata?.mannequinVisual)
                    return false;
                return true;
            });
            blocked = Boolean(pick?.hit && pick.distance < distance - 0.62);
        }
        const mirrorObserved = !directCandidate || blocked ? this.mirrorResolver(record.position) : false;
        const observed = (directCandidate && !blocked) || mirrorObserved;
        if (observed)
            record.observedUntil = now + 0.22;
        return {
            observed: observed || now < record.observedUntil,
            ray: directCandidate ? { from: cameraPosition.clone(), to: target, blocked } : undefined
        };
    }
    updateRecord(record, deltaSeconds, now, distanceToPlayer) {
        if (record.state === "crushed" || record.state === "inactive")
            return;
        const ignoresObservation = this.rulesCollapsed > 0.68
            || (this.rulesCollapsed > 0.2 && record.id % 5 === 0)
            || (this.rulesCollapsed > 0.48 && record.id % 2 === 0);
        const frozen = record.observed && !ignoresObservation;
        const target = this.lurePosition ?? this.player.collider.position;
        const distanceToTarget = Vector3.Distance(record.position, target);
        if (this.fire.isTorchThreatNear(record.position, 6.5)) {
            const away = record.position.subtract(this.player.collider.position);
            away.y = 0;
            if (away.lengthSquared() > 0.001 && this.movementEnabled) {
                this.moveRecordSafely(record, away.normalize().scale(deltaSeconds * (record.state === "crawler" ? 4.2 : 5.8)));
                record.rotationY = Math.atan2(away.x, away.z);
            }
            record.anticipation = 0;
            record.observed = false;
            record.state = record.health < 45 ? "crawler" : "stalking";
            return;
        }
        if (distanceToPlayer > 30 && !this.lurePosition)
            record.state = "dormant";
        else if (record.state === "dormant" && (distanceToPlayer < 19 || this.lurePosition))
            record.state = "stalking";
        if (this.rulesCollapsed > 0.38 && distanceToPlayer < 28)
            record.state = record.health < 45 ? "crawler" : "running";
        if (frozen || !this.movementEnabled) {
            record.anticipation = Math.max(0, record.anticipation - deltaSeconds * 2);
            if (record.observed && now - record.lastJointCue > 3.4 && Math.random() < 0.035) {
                record.lastJointCue = now;
                this.audio.mannequinJoint(record.position, 0.28);
            }
            return;
        }
        if (distanceToPlayer < 1.45 && !this.lurePosition) {
            record.anticipation += deltaSeconds * (this.rulesCollapsed > 0.7 ? 1.9 : 1.25);
            if (record.anticipation > 0.2 && record.anticipation - deltaSeconds < 0.2) {
                this.audio.mannequinJoint(record.position, 0.9);
                this.ui.showSoundCaption("juntas de plástico estalam muito perto", 1300);
            }
            if (record.anticipation >= 1) {
                this.onDamage(this.rulesCollapsed > 0.65 ? 18 : 11);
                record.anticipation = 0;
                const retreat = record.position.subtract(this.player.collider.position).normalize().scale(2.2);
                this.moveRecordSafely(record, retreat);
            }
            return;
        }
        record.anticipation = Math.max(0, record.anticipation - deltaSeconds * 1.8);
        const speed = record.state === "running" ? 4.25 : record.state === "crawler" ? 2.2 : 1.05 + (record.id % 4) * 0.12;
        if (distanceToTarget < 1.3 && this.lurePosition) {
            record.rotationY += deltaSeconds * (record.id % 2 === 0 ? 1 : -1);
            return;
        }
        const desired = target.subtract(record.position);
        desired.y = 0;
        if (desired.lengthSquared() < 0.02)
            return;
        desired.normalize();
        const navigated = this.navigationDirection(record, desired);
        record.rotationY = Math.atan2(navigated.x, navigated.z);
        this.moveRecordSafely(record, navigated.scale(speed * deltaSeconds));
        record.movePhase += deltaSeconds * speed * 3;
        if (now - record.lastJointCue > (record.state === "running" ? 0.7 : 1.8) && Math.random() < 0.12) {
            record.lastJointCue = now;
            this.audio.mannequinJoint(record.position, record.state === "running" ? 0.65 : 0.32);
        }
    }
    moveRecordSafely(record, movement) {
        const horizontal = movement.clone();
        horizontal.y = 0;
        if (horizontal.lengthSquared() < 0.000001)
            return false;
        const canMove = (delta) => {
            const distance = delta.length();
            if (distance < 0.0001)
                return true;
            const direction = delta.scale(1 / distance);
            const side = new Vector3(-direction.z, 0, direction.x).scale(record.state === "crawler" ? 0.24 : 0.34);
            const base = record.position.add(new Vector3(0, record.state === "crawler" ? 0.42 : 0.82, 0));
            const origins = [base, base.add(side), base.subtract(side)];
            return origins.every((origin) => {
                const pick = this.scene.pickWithRay(new Ray(origin, direction, distance + 0.42), (mesh) => {
                    if (!mesh.checkCollisions || !mesh.isEnabled() || mesh === this.player.collider)
                        return false;
                    return !mesh.metadata?.mannequinVisual;
                });
                return !pick?.hit || pick.distance > distance + 0.3;
            });
        };
        if (canMove(horizontal)) {
            record.position.addInPlace(horizontal);
            return true;
        }
        const axes = [new Vector3(horizontal.x, 0, 0), new Vector3(0, 0, horizontal.z)]
            .sort((a, b) => b.lengthSquared() - a.lengthSquared());
        let moved = false;
        for (const axis of axes) {
            if (axis.lengthSquared() > 0.000001 && canMove(axis)) {
                record.position.addInPlace(axis);
                moved = true;
            }
        }
        return moved;
    }
    navigationDirection(record, desired) {
        const origin = record.position.add(new Vector3(0, 0.8, 0));
        const pick = this.scene.pickWithRay(new Ray(origin, desired, 1.25), (mesh) => {
            if (!mesh.checkCollisions || mesh === this.player.collider || mesh.metadata?.mannequinVisual)
                return false;
            return mesh.isEnabled();
        });
        if (!pick?.hit || pick.distance > 0.95)
            return desired;
        const side = record.id % 2 === 0 ? 1 : -1;
        return new Vector3(desired.z * side, 0, -desired.x * side).normalize();
    }
    assignActors() {
        const candidates = this.records
            .filter((record) => record.enabled && record.id < this.countLimit && record.state !== "inactive" && record.state !== "crushed")
            .map((record) => ({ record, distance: Vector3.Distance(record.position, this.player.collider.position) }))
            .filter((entry) => entry.distance < 24 || entry.record.state === "running" || entry.record.state === "crawler")
            .sort((a, b) => a.distance - b.distance)
            .slice(0, this.highDetailLimit);
        const selected = new Set(candidates.map((entry) => entry.record.id));
        for (const record of this.records) {
            if (record.activeSlot >= 0 && !selected.has(record.id)) {
                const actor = this.actors[record.activeSlot];
                if (actor) {
                    actor.recordId = -1;
                    actor.root.setEnabled(false);
                }
                record.activeSlot = -1;
            }
        }
        for (const entry of candidates) {
            if (entry.record.activeSlot >= 0)
                continue;
            const slot = this.actors.findIndex((actor) => actor.recordId < 0);
            if (slot < 0)
                break;
            entry.record.activeSlot = slot;
            const actor = this.actors[slot];
            actor.recordId = entry.record.id;
            actor.root.setEnabled(true);
        }
    }
    animateActors(deltaSeconds) {
        const now = performance.now() * 0.001;
        for (const actor of this.actors) {
            if (actor.recordId < 0)
                continue;
            const record = this.records[actor.recordId];
            if (!record || !record.enabled) {
                actor.root.setEnabled(false);
                actor.recordId = -1;
                continue;
            }
            actor.root.position.copyFrom(record.position);
            actor.root.rotation.y = record.rotationY;
            actor.root.scaling.y = record.state === "crawler" ? 0.48 : 1;
            actor.root.rotation.x = record.state === "crawler" ? Math.PI / 2.35 : 0;
            const moving = !record.observed || this.rulesCollapsed > 0.68;
            const gait = moving ? Math.sin(record.movePhase) : 0;
            actor.leftArm.rotation.x = gait * 0.7 + (record.pose % 3) * 0.12;
            actor.rightArm.rotation.x = -gait * 0.7 - (record.pose % 2) * 0.15;
            actor.leftLeg.rotation.x = -gait * 0.58;
            actor.rightLeg.rotation.x = gait * 0.58;
            const headTarget = this.player.collider.position.subtract(record.position);
            actor.head.rotation.y += (Math.atan2(headTarget.x, headTarget.z) - record.rotationY - actor.head.rotation.y) * Math.min(1, deltaSeconds * 4.5);
            actor.head.rotation.z = record.pose === 4 ? 0.26 : record.pose === 5 ? -0.21 : Math.sin(now * 0.4 + record.id) * 0.025;
            const observedMaterial = this.materials.emissive("mannequin-observed", new Color3(0.05, 0.65, 0.2), 0.22);
            const unobservedMaterial = this.materials.emissive("mannequin-unobserved", new Color3(0.72, 0.06, 0.035), 0.22);
            for (const mesh of actor.skinMeshes) {
                mesh.material = this.observationVisualization
                    ? record.observed ? observedMaterial : unobservedMaterial
                    : this.materials.get("plastic", record.id % 2);
            }
        }
    }
    refreshThinInstances(force) {
        if (!force && !this.chapterEnabled)
            return;
        for (const record of this.records) {
            const offset = record.id * 16;
            const visible = this.chapterEnabled
                && record.enabled
                && record.id < this.countLimit
                && record.activeSlot < 0
                && record.state !== "inactive"
                && record.state !== "crushed";
            const scale = visible
                ? new Vector3(record.state === "crawler" ? 0.7 : 1, record.state === "crawler" ? 0.45 : 1, 1)
                : Vector3.Zero();
            const rotation = Quaternion.FromEulerAngles(record.state === "crawler" ? Math.PI / 2.4 : 0, record.rotationY, 0);
            const matrix = Matrix.Compose(scale, rotation, record.position);
            matrix.copyToArray(this.lowDetailMatrices, offset);
        }
        this.lowDetailSource.thinInstanceBufferUpdated("matrix");
    }
    createActor(index) {
        const root = new TransformNode(`mannequin-actor-${index}`, this.scene);
        const torso = MeshBuilder.CreateCapsule(`mannequin-torso-${index}`, { height: 1.25, radius: 0.32, tessellation: 10 }, this.scene);
        torso.parent = root;
        torso.position.y = 1.25;
        torso.scaling = new Vector3(0.78, 1, 0.48);
        const head = MeshBuilder.CreateSphere(`mannequin-head-${index}`, { diameter: 0.58, segments: 12 }, this.scene);
        head.parent = root;
        head.position.y = 2.18;
        head.scaling.z = 0.82;
        const leftArm = MeshBuilder.CreateCapsule(`mannequin-arm-l-${index}`, { height: 1.15, radius: 0.105, tessellation: 8 }, this.scene);
        leftArm.parent = root;
        leftArm.position = new Vector3(-0.39, 1.25, 0);
        const rightArm = leftArm.clone(`mannequin-arm-r-${index}`);
        rightArm.parent = root;
        rightArm.position.x = 0.39;
        const leftLeg = MeshBuilder.CreateCapsule(`mannequin-leg-l-${index}`, { height: 1.28, radius: 0.13, tessellation: 8 }, this.scene);
        leftLeg.parent = root;
        leftLeg.position = new Vector3(-0.17, 0.38, 0);
        const rightLeg = leftLeg.clone(`mannequin-leg-r-${index}`);
        rightLeg.parent = root;
        rightLeg.position.x = 0.17;
        const skinMeshes = [torso, head, leftArm, rightArm, leftLeg, rightLeg];
        for (const mesh of skinMeshes) {
            mesh.material = this.materials.get("plastic", index % 2);
            mesh.isPickable = false;
            mesh.checkCollisions = false;
            mesh.metadata = { mannequinVisual: true };
        }
        const joints = [];
        for (const [jointIndex, position] of [
            new Vector3(-0.39, 1.67, 0), new Vector3(0.39, 1.67, 0),
            new Vector3(-0.17, 0.9, 0), new Vector3(0.17, 0.9, 0)
        ].entries()) {
            const joint = MeshBuilder.CreateSphere(`mannequin-joint-${index}-${jointIndex}`, { diameter: 0.19, segments: 6 }, this.scene);
            joint.parent = root;
            joint.position.copyFrom(position);
            joint.material = this.materials.get("metal", jointIndex);
            joint.isPickable = false;
            joint.metadata = { mannequinVisual: true };
            joints.push(joint);
        }
        root.setEnabled(false);
        return { root, head, torso, leftArm, rightArm, leftLeg, rightLeg, joints, skinMeshes, recordId: -1 };
    }
    updateRearWarning(now) {
        const rearDistance = this.getNearestRearDistance();
        if (rearDistance >= 5.5 || now - this.lastRearCue < 2.1)
            return;
        this.lastRearCue = now;
        this.audio.rearProximity(rearDistance);
        if (rearDistance < 3.2)
            this.ui.showSoundCaption("passos secos se aproximam atrás de você", 1500);
    }
    drawOcclusionLines(samples) {
        this.clearOcclusionLines();
        samples.forEach((sample, index) => {
            const line = MeshBuilder.CreateLines(`mannequin-observation-ray-${index}`, { points: [sample.from, sample.to] }, this.scene);
            line.color = sample.blocked ? new Color3(0.9, 0.1, 0.06) : new Color3(0.08, 0.9, 0.3);
            line.isPickable = false;
            this.occlusionLines.push(line);
        });
    }
    clearOcclusionLines() {
        while (this.occlusionLines.length > 0)
            this.occlusionLines.pop()?.dispose();
    }
}
