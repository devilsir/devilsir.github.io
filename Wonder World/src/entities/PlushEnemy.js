import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";
export class PlushEnemy {
    root;
    state;
    health = 55;
    scene;
    materials;
    player;
    audio;
    fire;
    parts = [];
    body;
    head;
    leftButton;
    rightButton;
    stuffing;
    activationDistance;
    attackCooldown = 0;
    stateTimer = 0;
    updateTimer = 0;
    lastKnownDistance = Infinity;
    deathTimer = 0;
    spawnPosition;
    initialState;
    constructor(scene, materials, fire, player, audio, options) {
        this.scene = scene;
        this.materials = materials;
        this.player = player;
        this.audio = audio;
        this.fire = fire;
        this.activationDistance = options.activationDistance ?? 11;
        this.state = options.dormant === false ? "watching" : "dormant";
        this.initialState = this.state;
        this.spawnPosition = options.position.clone();
        const scale = options.scale ?? 1;
        const variant = options.variant ?? 0;
        this.root = new TransformNode(options.name, scene);
        this.root.position.copyFrom(options.position);
        this.root.scaling.setAll(scale);
        this.body = MeshBuilder.CreateSphere(`${options.name}-body`, { diameter: 0.9, segments: 10 }, scene);
        this.body.parent = this.root;
        this.body.scaling = new Vector3(0.82, 1.05, 0.62);
        this.body.position.y = 0.58;
        this.body.material = materials.get("plush", variant);
        this.parts.push(this.body);
        this.head = MeshBuilder.CreateSphere(`${options.name}-head`, { diameter: 0.66, segments: 10 }, scene);
        this.head.parent = this.root;
        this.head.position.y = 1.22;
        this.head.scaling = new Vector3(1, 0.9, 0.84);
        this.head.material = materials.get("plush", variant);
        this.parts.push(this.head);
        for (const side of [-1, 1]) {
            const ear = MeshBuilder.CreateCylinder(`${options.name}-ear-${side}`, { height: 0.42, diameterTop: 0.04, diameterBottom: 0.3, tessellation: 7 }, scene);
            ear.parent = this.root;
            ear.position = new Vector3(side * 0.23, 1.58, 0);
            ear.rotation.z = side * -0.24;
            ear.material = materials.get("plush", variant);
            this.parts.push(ear);
            const arm = MeshBuilder.CreateCapsule(`${options.name}-arm-${side}`, { height: 0.72, radius: 0.12, tessellation: 8 }, scene);
            arm.parent = this.root;
            arm.position = new Vector3(side * 0.48, 0.65, 0);
            arm.rotation.z = side * 0.55;
            arm.material = materials.get("plush", variant);
            this.parts.push(arm);
            const leg = MeshBuilder.CreateCapsule(`${options.name}-leg-${side}`, { height: 0.65, radius: 0.14, tessellation: 8 }, scene);
            leg.parent = this.root;
            leg.position = new Vector3(side * 0.22, 0.12, 0);
            leg.rotation.z = side * 0.12;
            leg.material = materials.get("plush", variant);
            this.parts.push(leg);
        }
        this.leftButton = MeshBuilder.CreateCylinder(`${options.name}-button-l`, { height: 0.05, diameter: 0.13, tessellation: 12 }, scene);
        this.leftButton.parent = this.head;
        this.leftButton.position = new Vector3(-0.17, 0.09, -0.31);
        this.leftButton.rotation.x = Math.PI / 2;
        this.leftButton.material = materials.solid("button-dark", new Color3(0.025, 0.02, 0.018), 0.32, 0.05);
        this.parts.push(this.leftButton);
        this.rightButton = this.leftButton.clone(`${options.name}-button-r`);
        this.rightButton.parent = this.head;
        this.rightButton.position.x = 0.17;
        this.parts.push(this.rightButton);
        const snout = MeshBuilder.CreateSphere(`${options.name}-snout`, { diameter: 0.24, segments: 8 }, scene);
        snout.parent = this.head;
        snout.position = new Vector3(0, -0.12, -0.34);
        snout.scaling.z = 0.5;
        snout.material = materials.get("plastic", variant);
        this.parts.push(snout);
        this.stuffing = MeshBuilder.CreateSphere(`${options.name}-stuffing`, { diameter: 0.37, segments: 7 }, scene);
        this.stuffing.parent = this.body;
        this.stuffing.position = new Vector3(0.33, -0.1, -0.42);
        this.stuffing.scaling = new Vector3(1.2, 0.5, 0.45);
        this.stuffing.material = materials.solid("stuffing", new Color3(0.8, 0.75, 0.63), 1);
        this.stuffing.setEnabled(false);
        this.parts.forEach((part) => {
            part.checkCollisions = false;
            part.isPickable = true;
        });
        fire.register(this.body, {
            health: 46,
            spreadRadius: 2.1,
            onIgnite: () => {
                if (this.state !== "dead") {
                    this.state = "burning";
                    this.stateTimer = 0;
                    this.audio.plushCry();
                }
            },
            onBurnTick: (damage) => {
                this.health -= damage * 0.5;
                this.stuffing.setEnabled(true);
            },
            onDestroyed: () => this.kill()
        });
        scene.onBeforeRenderObservable.add(() => this.update(scene.getEngine().getDeltaTime() / 1000));
    }
    containsMesh(mesh) {
        let current = mesh;
        while (current) {
            if (current === this.root)
                return true;
            current = current.parent ?? null;
        }
        return false;
    }
    takeDamage(amount, impulseDirection) {
        if (this.state === "dead" || amount <= 0)
            return false;
        this.health = Math.max(0, this.health - amount);
        if (impulseDirection) {
            const push = impulseDirection.clone();
            push.y = 0;
            if (push.lengthSquared() > 0.001)
                this.moveSafely(push.normalize().scale(0.45));
        }
        this.state = this.health <= 0 ? "dead" : "retreating";
        this.stateTimer = 0;
        this.audio.plushCry();
        if (this.health <= 0)
            this.kill();
        return true;
    }
    repelFrom(position, strength = 1) {
        if (this.state === "dead")
            return;
        const away = this.getPosition().subtract(position);
        away.y = 0;
        if (away.lengthSquared() > 0.001)
            this.moveSafely(away.normalize().scale(Math.max(0.15, strength) * 0.52));
        this.state = "retreating";
        this.stateTimer = 0;
    }
    isDead() {
        return this.state === "dead";
    }
    resetForPlayerRespawn() {
        if (this.state === "dead") {
            this.root.setEnabled(false);
            return;
        }
        this.root.position.copyFrom(this.spawnPosition);
        this.root.rotation.set(0, 0, 0);
        this.state = this.initialState;
        this.stateTimer = 0;
        this.attackCooldown = 1.5;
    }
    activate() {
        if (this.state === "dormant") {
            this.state = "watching";
            this.stateTimer = 0;
        }
    }
    reveal() {
        this.activate();
        this.root.rotation.z = (Math.random() - 0.5) * 0.16;
    }
    getPosition() {
        return this.root.getAbsolutePosition();
    }
    dispose() {
        this.parts.forEach((part) => part.dispose());
        this.stuffing.dispose();
        this.root.dispose();
    }
    update(deltaSeconds) {
        if (this.state === "dead") {
            this.deathTimer += deltaSeconds;
            if (this.deathTimer > 1.35 && this.root.isEnabled())
                this.root.setEnabled(false);
            return;
        }
        this.updateTimer += deltaSeconds;
        this.stateTimer += deltaSeconds;
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaSeconds);
        const distance = Vector3.Distance(this.getPosition(), this.player.collider.position);
        this.lastKnownDistance = distance;
        const updateInterval = distance > 22 ? 0.42 : distance > 12 ? 0.16 : 0;
        if (this.updateTimer < updateInterval)
            return;
        const step = this.updateTimer;
        this.updateTimer = 0;
        if (this.state === "dormant") {
            if (distance < this.activationDistance) {
                const playerForward = this.player.forward();
                const toEnemy = this.getPosition().subtract(this.player.collider.position).normalize();
                const lookedAt = Vector3.Dot(playerForward, toEnemy) > 0.75;
                if (!lookedAt || distance < 4.2)
                    this.activate();
            }
            return;
        }
        if (this.state !== "burning" && this.state !== "retreating" && this.fire.isFireNear(this.getPosition(), 2.4)) {
            this.state = "retreating";
            this.stateTimer = 0;
            this.audio.plushCry();
        }
        const toPlayer = this.player.collider.position.subtract(this.getPosition());
        toPlayer.y = 0;
        const direction = toPlayer.lengthSquared() > 0.001 ? toPlayer.normalize() : Vector3.Zero();
        const facing = Math.atan2(direction.x, direction.z);
        this.root.rotation.y += this.shortestAngle(this.root.rotation.y, facing) * Math.min(1, step * 5);
        this.head.rotation.y = Math.sin(this.stateTimer * 1.7) * 0.12;
        if (this.state === "watching") {
            this.head.rotation.z = Math.sin(this.stateTimer * 2.6) * 0.08;
            if (this.stateTimer > 0.9 || distance < 5) {
                this.state = "crawling";
                this.stateTimer = 0;
            }
        }
        else if (this.state === "crawling") {
            const speed = distance < 3.2 ? 2.2 : 1.25;
            this.moveSafely(direction.scale(speed * step));
            this.root.position.y = Math.max(0, this.root.position.y + Math.sin(this.stateTimer * 8) * 0.002);
            this.root.rotation.z = Math.sin(this.stateTimer * 7) * 0.08;
            if (distance < 1.7 && this.attackCooldown <= 0) {
                this.state = "lunging";
                this.stateTimer = 0;
                this.audio.plushCry();
            }
        }
        else if (this.state === "lunging") {
            this.moveSafely(direction.scale(step * 5.8));
            this.root.position.y = Math.sin(Math.min(1, this.stateTimer / 0.5) * Math.PI) * 0.65;
            if (distance < 1.05 && this.stateTimer < 0.55) {
                this.player.damage(12);
                this.attackCooldown = 2.6;
            }
            if (this.stateTimer > 0.72) {
                this.state = "crawling";
                this.root.position.y = 0;
                this.stateTimer = 0;
            }
        }
        else if (this.state === "retreating") {
            this.moveSafely(direction.scale(step * -2.8));
            if (this.stateTimer > 1.5) {
                this.state = "crawling";
                this.stateTimer = 0;
            }
        }
        else if (this.state === "burning") {
            this.moveSafely(direction.scale(step * -1.9));
            this.root.rotation.y += step * 3.4;
            this.root.rotation.z = Math.sin(this.stateTimer * 13) * 0.28;
            if (this.health <= 0)
                this.kill();
        }
    }
    moveSafely(movement) {
        const horizontal = movement.clone();
        horizontal.y = 0;
        if (horizontal.lengthSquared() < 0.000001)
            return false;
        const canMove = (delta) => {
            const distance = delta.length();
            if (distance < 0.0001)
                return true;
            const direction = delta.scale(1 / distance);
            const side = new Vector3(-direction.z, 0, direction.x).scale(0.38);
            const base = this.root.position.add(new Vector3(0, 0.72, 0));
            const origins = [base, base.add(side), base.subtract(side)];
            return origins.every((origin) => {
                const pick = this.scene.pickWithRay(new Ray(origin, direction, distance + 0.46), (mesh) => {
                    if (!mesh.checkCollisions || !mesh.isEnabled() || mesh === this.player.collider)
                        return false;
                    return !this.containsMesh(mesh);
                });
                return !pick?.hit || pick.distance > distance + 0.34;
            });
        };
        if (canMove(horizontal)) {
            this.root.position.addInPlace(horizontal);
            return true;
        }
        const axes = [new Vector3(horizontal.x, 0, 0), new Vector3(0, 0, horizontal.z)]
            .sort((a, b) => b.lengthSquared() - a.lengthSquared());
        let moved = false;
        for (const axis of axes) {
            if (axis.lengthSquared() > 0.000001 && canMove(axis)) {
                this.root.position.addInPlace(axis);
                moved = true;
            }
        }
        return moved;
    }
    kill() {
        if (this.state === "dead" && this.deathTimer > 0)
            return;
        this.state = "dead";
        this.deathTimer = 0.001;
        this.stuffing.setEnabled(true);
        this.root.rotation.z = Math.PI / 2;
        this.root.position.y = 0.22;
        this.parts.forEach((part) => {
            part.isPickable = false;
            part.checkCollisions = false;
            part.material = this.materials.get("burned", 0);
        });
    }
    shortestAngle(from, to) {
        let difference = (to - from + Math.PI) % (Math.PI * 2) - Math.PI;
        if (difference < -Math.PI)
            difference += Math.PI * 2;
        return difference;
    }
}
