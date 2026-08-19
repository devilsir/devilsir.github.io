import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
export class NoahCompanion {
    active = false;
    command = "wait";
    trust = 0;
    injured = true;
    carryingIdentityCard = false;
    checkpoint = "noah-introduction";
    scene;
    player;
    audio;
    callbacks;
    root;
    torso;
    head;
    leftArm;
    rightArm;
    leftLeg;
    rightLeg;
    limbs = [];
    target = null;
    targetTag = "";
    lastDistance = Infinity;
    stuckClock = 0;
    gaitClock = 0;
    recoverCooldown = 0;
    hiddenRecoveryAnchor = null;
    commandClock = 0;
    constructor(scene, materials, player, audio, callbacks = {}) {
        this.scene = scene;
        this.player = player;
        this.audio = audio;
        this.callbacks = callbacks;
        this.root = new TransformNode("noah-root", scene);
        const trousers = materials.solid("noah-trousers", new Color3(0.08, 0.095, 0.11), 0.86);
        const shirt = materials.get("plush", 12);
        const skin = materials.solid("noah-skin", new Color3(0.48, 0.34, 0.28), 0.8);
        const bandage = materials.solid("noah-bandage", new Color3(0.55, 0.52, 0.43), 0.95);
        const hair = materials.solid("noah-hair", new Color3(0.035, 0.028, 0.026), 0.92);
        const pelvis = MeshBuilder.CreateSphere("noah-pelvis", { diameter: 0.78, segments: 10 }, scene);
        pelvis.parent = this.root;
        pelvis.position.y = 1.82;
        pelvis.scaling = new Vector3(0.8, 0.62, 0.62);
        pelvis.material = trousers;
        pelvis.checkCollisions = false;
        this.torso = MeshBuilder.CreateCapsule("noah-torso", { height: 1.55, radius: 0.36, tessellation: 12 }, scene);
        this.torso.parent = this.root;
        this.torso.position.y = 2.78;
        this.torso.scaling = new Vector3(0.9, 1, 0.7);
        this.torso.material = shirt;
        this.torso.checkCollisions = false;
        const neck = MeshBuilder.CreateCylinder("noah-neck", { height: 0.3, diameter: 0.28, tessellation: 10 }, scene);
        neck.parent = this.root;
        neck.position.y = 3.72;
        neck.material = skin;
        this.head = MeshBuilder.CreateSphere("noah-head", { diameter: 0.67, segments: 16 }, scene);
        this.head.parent = this.root;
        this.head.position.y = 4.08;
        this.head.scaling = new Vector3(0.88, 1.04, 0.9);
        this.head.material = skin;
        const hairCap = MeshBuilder.CreateSphere("noah-hair-cap", { diameter: 0.7, segments: 12, slice: 0.55 }, scene);
        hairCap.parent = this.head;
        hairCap.position.y = 0.18;
        hairCap.material = hair;
        const bandageWrap = MeshBuilder.CreateTorus("noah-bandage-wrap", { diameter: 0.69, thickness: 0.055, tessellation: 18 }, scene);
        bandageWrap.parent = this.head;
        bandageWrap.rotation.x = Math.PI / 2;
        bandageWrap.rotation.z = -0.18;
        bandageWrap.position.y = 0.03;
        bandageWrap.material = bandage;
        this.leftArm = new TransformNode("noah-left-arm", scene);
        this.rightArm = new TransformNode("noah-right-arm", scene);
        this.leftLeg = new TransformNode("noah-left-leg", scene);
        this.rightLeg = new TransformNode("noah-right-leg", scene);
        this.leftArm.parent = this.root;
        this.rightArm.parent = this.root;
        this.leftLeg.parent = this.root;
        this.rightLeg.parent = this.root;
        this.leftArm.position = new Vector3(-0.47, 3.25, 0);
        this.rightArm.position = new Vector3(0.47, 3.25, 0);
        this.leftLeg.position = new Vector3(-0.22, 1.75, 0);
        this.rightLeg.position = new Vector3(0.22, 1.75, 0);
        this.createLimb(this.leftArm, -1, 0.98, shirt, skin, "arm-left");
        this.createLimb(this.rightArm, 1, 0.98, shirt, skin, "arm-right");
        this.createLeg(this.leftLeg, -1, trousers, "leg-left");
        this.createLeg(this.rightLeg, 1, trousers, "leg-right");
        const wound = MeshBuilder.CreatePlane("noah-wound", { width: 0.35, height: 0.24 }, scene);
        wound.parent = this.torso;
        wound.position = new Vector3(0.18, 0.1, -0.355);
        wound.rotation.y = Math.PI;
        wound.material = materials.solid("noah-wound-material", new Color3(0.18, 0.025, 0.018), 0.7);
        this.setVisible(false);
    }
    setVisible(visible) {
        this.active = visible;
        this.root.setEnabled(visible);
    }
    teleport(position, rotationY = 0) {
        this.root.position.copyFrom(position);
        this.root.rotation.y = rotationY;
        this.stuckClock = 0;
        this.lastDistance = Infinity;
    }
    setFollow() {
        this.command = "follow";
        this.target = null;
        this.targetTag = "";
    }
    wait() {
        this.command = "wait";
        this.target = null;
        this.targetTag = "";
    }
    moveTo(position, tag = "marked-position") {
        this.command = "move";
        this.target = position.clone();
        this.targetTag = tag;
        this.lastDistance = Infinity;
        this.stuckClock = 0;
    }
    holdAt(position, tag = "held-mechanism") {
        this.command = "hold";
        this.target = position.clone();
        this.targetTag = tag;
    }
    crawlTo(position, tag = "crawl-control") {
        this.command = "crawl";
        this.target = position.clone();
        this.targetTag = tag;
    }
    distract(position) {
        this.command = "distract";
        this.target = position.clone();
        this.targetTag = "distraction";
        this.commandClock = 5.5;
        this.audio.metalLure(position, 0.65);
    }
    setHiddenRecoveryAnchor(position) {
        this.hiddenRecoveryAnchor = position?.clone() ?? null;
    }
    update(deltaSeconds) {
        if (!this.active)
            return;
        this.recoverCooldown = Math.max(0, this.recoverCooldown - deltaSeconds);
        this.gaitClock += deltaSeconds;
        this.commandClock = Math.max(0, this.commandClock - deltaSeconds);
        let destination = this.target?.clone() ?? null;
        if (this.command === "follow") {
            const backward = this.player.forward().scale(-1.65);
            destination = this.player.collider.position.add(backward).add(new Vector3(0.75, 0, 0));
        }
        if (!destination || this.command === "wait") {
            this.poseIdle();
            return;
        }
        const flat = destination.subtract(this.root.position);
        flat.y = 0;
        const distance = flat.length();
        if (distance < (this.command === "follow" ? 1.35 : 0.72)) {
            this.poseIdle();
            if (this.command !== "follow") {
                const tag = this.targetTag;
                if (this.command === "hold")
                    this.poseHolding();
                else if (this.command === "crawl")
                    this.poseCrouched();
                else
                    this.command = "wait";
                this.target = null;
                this.targetTag = "";
                this.callbacks.onReachedTarget?.(tag);
            }
            return;
        }
        const speed = this.command === "crawl" ? 1.5 : this.command === "distract" ? 3.4 : 2.45;
        const direction = flat.normalize();
        this.root.rotation.y = Math.atan2(direction.x, direction.z);
        const step = Math.min(distance, speed * deltaSeconds);
        this.root.position.addInPlace(direction.scale(step));
        this.root.position.y = destination.y;
        this.poseWalking(speed);
        if (distance >= this.lastDistance - 0.015)
            this.stuckClock += deltaSeconds;
        else
            this.stuckClock = Math.max(0, this.stuckClock - deltaSeconds * 2);
        this.lastDistance = distance;
        if (this.stuckClock > 2.8 && this.recoverCooldown <= 0)
            this.recoverFromStuck(destination);
        if (this.command === "distract" && this.commandClock <= 0)
            this.setFollow();
    }
    serialize() {
        return {
            active: this.active,
            command: this.command,
            checkpoint: this.checkpoint,
            position: [this.root.position.x, this.root.position.y, this.root.position.z],
            trust: this.trust,
            injured: this.injured,
            carryingIdentityCard: this.carryingIdentityCard
        };
    }
    restore(state) {
        this.active = state.active;
        this.command = state.command;
        this.checkpoint = state.checkpoint;
        this.trust = Math.max(-10, Math.min(10, state.trust));
        this.injured = state.injured;
        this.carryingIdentityCard = state.carryingIdentityCard;
        this.setVisible(state.active);
        this.teleport(new Vector3(state.position[0], state.position[1], state.position[2]));
        if (state.command === "follow")
            this.setFollow();
    }
    get position() {
        return this.root.position;
    }
    getRoot() {
        return this.root;
    }
    createLimb(parent, side, length, upperMaterial, skinMaterial, name) {
        const upper = MeshBuilder.CreateCylinder(`noah-${name}-upper`, { height: length, diameterTop: 0.22, diameterBottom: 0.27, tessellation: 9 }, this.scene);
        upper.parent = parent;
        upper.position = new Vector3(side * 0.04, -0.42, 0);
        upper.rotation.z = side * 0.08;
        upper.material = upperMaterial;
        const forearm = MeshBuilder.CreateCylinder(`noah-${name}-forearm`, { height: 0.84, diameterTop: 0.18, diameterBottom: 0.22, tessellation: 9 }, this.scene);
        forearm.parent = parent;
        forearm.position = new Vector3(side * 0.08, -1.22, 0.02);
        forearm.rotation.z = side * -0.12;
        forearm.material = skinMaterial;
        const hand = MeshBuilder.CreateSphere(`noah-${name}-hand`, { diameter: 0.25, segments: 8 }, this.scene);
        hand.parent = parent;
        hand.position = new Vector3(side * 0.12, -1.7, 0.02);
        hand.scaling.y = 1.3;
        hand.material = skinMaterial;
        this.limbs.push(upper, forearm, hand);
    }
    createLeg(parent, side, material, name) {
        const thigh = MeshBuilder.CreateCylinder(`noah-${name}-thigh`, { height: 1.02, diameterTop: 0.3, diameterBottom: 0.25, tessellation: 9 }, this.scene);
        thigh.parent = parent;
        thigh.position.y = -0.48;
        thigh.material = material;
        const shin = MeshBuilder.CreateCylinder(`noah-${name}-shin`, { height: 0.98, diameterTop: 0.23, diameterBottom: 0.19, tessellation: 9 }, this.scene);
        shin.parent = parent;
        shin.position.y = -1.42;
        shin.material = material;
        const shoe = MeshBuilder.CreateBox(`noah-${name}-shoe`, { width: 0.28, height: 0.18, depth: 0.58 }, this.scene);
        shoe.parent = parent;
        shoe.position = new Vector3(side * 0.01, -1.96, 0.14);
        shoe.material = material;
        this.limbs.push(thigh, shin, shoe);
    }
    poseWalking(speed) {
        const swing = Math.sin(this.gaitClock * (speed + 3)) * 0.46;
        this.leftArm.rotation.x = swing;
        this.rightArm.rotation.x = -swing * 0.72;
        this.leftLeg.rotation.x = -swing * 0.72;
        this.rightLeg.rotation.x = swing * 0.72;
        this.torso.rotation.z = Math.sin(this.gaitClock * 2.1) * 0.025;
        this.head.rotation.y = Math.sin(this.gaitClock * 1.4) * 0.08;
    }
    poseIdle() {
        this.leftArm.rotation.x *= 0.82;
        this.rightArm.rotation.x *= 0.82;
        this.leftLeg.rotation.x *= 0.82;
        this.rightLeg.rotation.x *= 0.82;
        this.torso.rotation.z = Math.sin(this.gaitClock * 1.2) * 0.012;
        this.head.rotation.y = Math.sin(this.gaitClock * 0.7) * 0.045;
    }
    poseHolding() {
        this.leftArm.rotation.x = -1.05;
        this.rightArm.rotation.x = -1.05;
        this.leftArm.rotation.z = -0.22;
        this.rightArm.rotation.z = 0.22;
    }
    poseCrouched() {
        this.root.scaling.y = 0.68;
        this.leftLeg.rotation.x = 0.75;
        this.rightLeg.rotation.x = 0.75;
        this.leftArm.rotation.x = -0.6;
        this.rightArm.rotation.x = -0.6;
    }
    recoverFromStuck(destination) {
        this.stuckClock = 0;
        this.recoverCooldown = 6;
        const playerDistance = Vector3.Distance(this.root.position, this.player.collider.position);
        if (playerDistance < 28) {
            const lateral = new Vector3(Math.sin(this.player.camera.rotation.y), 0, Math.cos(this.player.camera.rotation.y)).scale(1.4);
            this.root.position.addInPlace(lateral);
            this.callbacks.onStuckRecovery?.();
            return;
        }
        if (this.hiddenRecoveryAnchor) {
            this.teleport(this.hiddenRecoveryAnchor);
            this.callbacks.onStuckRecovery?.();
            return;
        }
        const behind = this.player.collider.position.subtract(this.player.forward().scale(3));
        behind.y = destination.y;
        this.teleport(behind);
        this.callbacks.onStuckRecovery?.();
    }
}
