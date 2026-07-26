import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
export class JesseSystem {
    state = "dormant";
    enabled = false;
    suspicion = 0;
    investigationTarget = null;
    scene;
    materials;
    player;
    audio;
    ui;
    noise;
    callbacks;
    collider;
    root;
    torso;
    chest;
    neck;
    head;
    jaw;
    leftArm;
    rightArm;
    leftLeg;
    rightLeg;
    fingers = [];
    clothingPieces = [];
    traversalNodes = [];
    debugTarget;
    chaseRoute = [];
    chaseCheckpoint = 0;
    targetNode = null;
    hiddenSpot = null;
    playerHidden = false;
    stateElapsed = 0;
    gait = 0;
    emergence = 0;
    searchTimer = 0;
    listenTimer = 0;
    falseCueTimer = 14;
    attackCooldown = 0;
    activeSearch = false;
    simplifiedChase = false;
    visualize = false;
    lastNoiseId = 0;
    tricks = 0;
    unsubscribeNoise = null;
    constructor(scene, materials, player, audio, ui, noise, callbacks) {
        this.scene = scene;
        this.materials = materials;
        this.player = player;
        this.audio = audio;
        this.ui = ui;
        this.noise = noise;
        this.callbacks = callbacks;
        this.collider = MeshBuilder.CreateCapsule("jesse-collider", { height: 4.8, radius: 0.65, tessellation: 10 }, scene);
        this.collider.isVisible = false;
        this.collider.isPickable = false;
        this.collider.checkCollisions = true;
        this.collider.ellipsoid = new Vector3(0.62, 2.25, 0.62);
        this.root = new TransformNode("jesse-root", scene);
        this.root.parent = this.collider;
        this.root.position.y = -2.35;
        const cloth = materials.get("plush", 4);
        const brace = materials.get("metal", 5);
        const skin = this.createFaceMaterial();
        this.torso = MeshBuilder.CreateCapsule("jesse-torso", { height: 3.2, radius: 0.58, tessellation: 14 }, scene);
        this.torso.parent = this.root;
        this.torso.position.y = 4.25;
        this.torso.scaling = new Vector3(0.72, 1, 0.5);
        this.torso.material = cloth;
        this.chest = MeshBuilder.CreateSphere("jesse-chest", { diameter: 1.6, segments: 14 }, scene);
        this.chest.parent = this.root;
        this.chest.position.y = 5.15;
        this.chest.scaling = new Vector3(0.74, 1.15, 0.52);
        this.chest.material = cloth;
        this.neck = MeshBuilder.CreateCylinder("jesse-neck", { height: 1.05, diameterTop: 0.35, diameterBottom: 0.48, tessellation: 10 }, scene);
        this.neck.parent = this.root;
        this.neck.position.y = 6.6;
        this.neck.material = brace;
        this.head = MeshBuilder.CreateSphere("jesse-head", { diameter: 1.35, segments: 18 }, scene);
        this.head.parent = this.root;
        this.head.position.y = 7.55;
        this.head.scaling = new Vector3(0.82, 1.25, 0.72);
        this.head.material = skin;
        this.jaw = MeshBuilder.CreateBox("jesse-jaw", { width: 0.72, height: 0.32, depth: 0.48 }, scene);
        this.jaw.parent = this.head;
        this.jaw.position = new Vector3(0, -0.32, -0.48);
        this.jaw.material = skin;
        this.leftArm = this.createLimb("jesse-left-arm", -1, true, 5.3, cloth, brace);
        this.rightArm = this.createLimb("jesse-right-arm", 1, true, 5.3, cloth, brace);
        this.leftLeg = this.createLimb("jesse-left-leg", -1, false, 3.25, cloth, brace);
        this.rightLeg = this.createLimb("jesse-right-leg", 1, false, 3.25, cloth, brace);
        this.createClothingDetails(cloth, brace);
        this.debugTarget = MeshBuilder.CreateSphere("jesse-debug-target", { diameter: 0.55, segments: 8 }, scene);
        this.debugTarget.material = materials.emissive("jesse-debug-target-material", new Color3(0.95, 0.15, 0.08), 1.1);
        this.debugTarget.isPickable = false;
        this.debugTarget.isVisible = false;
        this.collider.setEnabled(false);
        this.unsubscribeNoise = this.noise.subscribe((event) => this.hear(event));
    }
    configure(nodes, simplifiedChase) {
        this.traversalNodes.length = 0;
        this.traversalNodes.push(...nodes.map((node) => ({ ...node, position: node.position.clone() })));
        this.simplifiedChase = simplifiedChase;
    }
    startIntroduction(position) {
        this.enabled = true;
        this.activeSearch = false;
        this.collider.setEnabled(true);
        this.collider.position.copyFrom(position);
        this.collider.rotation.y = Math.PI;
        this.emergence = 0;
        this.setState("emerging");
        this.setFoldedPose(1);
        this.audio.startJesseMelody("slow", position);
    }
    startChase(route, checkpoint = 0) {
        this.enabled = true;
        this.activeSearch = false;
        this.chaseRoute = route.map((point) => point.clone());
        this.chaseCheckpoint = Math.max(0, Math.min(route.length - 1, checkpoint));
        this.collider.setEnabled(true);
        if (this.state === "dormant" || this.state === "disabled")
            this.spawnBehindPlayer();
        this.setState("chasing");
        this.audio.startJesseChase();
    }
    beginExploration() {
        this.enabled = true;
        this.activeSearch = true;
        this.audio.stopJesseChase();
        this.audio.stopJesseMelody();
        this.investigationTarget = null;
        this.targetNode = null;
        this.setState("dormant");
        this.collider.setEnabled(false);
        this.falseCueTimer = 10 + Math.random() * 8;
    }
    setPlayerHidden(hidden, spot) {
        this.playerHidden = hidden;
        this.hiddenSpot = spot?.clone() ?? null;
        if (!hidden && this.state === "reaching")
            this.setState("searching");
    }
    forceSearch(position) {
        if (!this.activeSearch)
            this.beginExploration();
        this.investigationTarget = position.clone();
        this.spawnForInvestigation(position);
        this.setState("investigating");
        this.audio.startJesseMelody("danger", this.collider.position);
    }
    update(deltaSeconds) {
        if (!this.enabled)
            return;
        this.stateElapsed += deltaSeconds;
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaSeconds);
        this.gait += deltaSeconds * (this.state === "chasing" ? 9.5 : 5.2);
        if (this.state === "emerging")
            this.updateEmergence(deltaSeconds);
        else if (this.state === "chasing")
            this.updateChase(deltaSeconds);
        else if (this.state === "investigating")
            this.updateInvestigation(deltaSeconds);
        else if (this.state === "searching")
            this.updateSearch(deltaSeconds);
        else if (this.state === "listening")
            this.updateListening(deltaSeconds);
        else if (this.state === "reaching")
            this.updateReaching(deltaSeconds);
        else if (this.state === "retreating")
            this.updateRetreat(deltaSeconds);
        else if (this.state === "dormant")
            this.updateDormant(deltaSeconds);
        this.animateRig(deltaSeconds);
        this.debugTarget.isVisible = this.visualize && Boolean(this.investigationTarget);
        if (this.investigationTarget)
            this.debugTarget.position.copyFrom(this.investigationTarget);
    }
    resetChase(position, checkpoint) {
        this.collider.position.copyFrom(position);
        this.chaseCheckpoint = checkpoint;
        this.investigationTarget = null;
        this.attackCooldown = 1.4;
        this.setState("chasing");
        this.audio.startJesseChase();
    }
    stop() {
        this.enabled = false;
        this.activeSearch = false;
        this.collider.setEnabled(false);
        this.audio.stopJesseChase();
        this.audio.stopJesseMelody();
        this.setState("disabled");
    }
    showFearRetreat(position, exit) {
        this.enabled = true;
        this.activeSearch = false;
        this.playerHidden = false;
        this.hiddenSpot = null;
        this.investigationTarget = null;
        this.collider.setEnabled(true);
        this.collider.position.copyFrom(position);
        this.targetNode = { id: "mimic-fear-exit", position: exit.clone(), room: "maya", entrance: true };
        this.setFoldedPose(0.28);
        this.faceToward(exit, 1);
        this.audio.stopJesseChase();
        this.audio.stopJesseMelody();
        this.setState("retreating");
    }
    toggleVisualization() {
        this.visualize = !this.visualize;
        this.debugTarget.isVisible = this.visualize && Boolean(this.investigationTarget);
        this.collider.isVisible = this.visualize;
        this.collider.showBoundingBox = this.visualize;
        return this.visualize;
    }
    inspect() {
        return `jesse state=${this.state} suspicion=${this.suspicion.toFixed(2)} target=${this.investigationTarget?.toString() ?? "none"} hidden=${this.playerHidden} tricks=${this.tricks}`;
    }
    hear(event) {
        if (!this.activeSearch || event.id === this.lastNoiseId)
            return;
        this.lastNoiseId = event.id;
        const origin = this.collider.isEnabled() ? this.collider.position : this.closestEntrance(event.position)?.position ?? event.position;
        const obstructed = this.callbacks.isPathObstructed(origin, event.position);
        const perceived = this.noise.perceivedIntensity(event, origin, obstructed);
        const threshold = Math.max(0.18, 0.52 - this.suspicion * 0.08);
        if (perceived < threshold && event.category !== "alarm")
            return;
        this.investigationTarget = event.position.clone();
        this.suspicion = Math.min(5, this.suspicion + event.intensity * 0.18);
        if (!this.collider.isEnabled())
            this.spawnForInvestigation(event.position);
        if (this.state !== "chasing")
            this.setState("investigating");
        this.audio.startJesseMelody(perceived > 0.7 ? "danger" : "distant", this.collider.position);
    }
    updateEmergence(deltaSeconds) {
        this.emergence = Math.min(1, this.emergence + deltaSeconds / 3.2);
        const eased = 1 - Math.pow(1 - this.emergence, 3);
        this.setFoldedPose(1 - eased);
        this.root.position.y = -2.35 + Math.sin(eased * Math.PI) * 0.35;
        if (this.emergence >= 1) {
            this.ui.showSoundCaption("molas estalam como ossos compridos");
            this.setState("chasing");
            this.audio.stopJesseMelody();
            this.audio.startJesseChase();
        }
    }
    updateChase(deltaSeconds) {
        const playerPosition = this.player.collider.position;
        const routeTarget = this.chaseRoute[Math.min(this.chaseRoute.length - 1, this.chaseCheckpoint + 1)] ?? playerPosition;
        if (Vector3.Distance(playerPosition, routeTarget) < 5.5 && this.chaseCheckpoint < this.chaseRoute.length - 1) {
            this.chaseCheckpoint += 1;
            this.callbacks.onChaseCheckpoint(this.chaseCheckpoint);
        }
        const anticipation = this.player.forward().scale(-1.4);
        const target = playerPosition.add(anticipation);
        const speed = this.simplifiedChase ? 5.9 : 7.4 + Math.min(1.3, this.chaseCheckpoint * 0.22);
        this.moveToward(target, speed, deltaSeconds);
        this.faceToward(target, deltaSeconds * 8);
        const distance = Vector3.Distance(this.collider.position, playerPosition);
        if (distance < 1.45 && this.attackCooldown <= 0) {
            this.attackCooldown = 2;
            this.callbacks.onCaught("chase");
        }
        else if (distance > 26) {
            const node = this.closestBehindNode(playerPosition);
            if (node && Vector3.Distance(node.position, playerPosition) > 12)
                this.collider.position.copyFrom(node.position);
        }
    }
    updateInvestigation(deltaSeconds) {
        if (!this.investigationTarget) {
            this.setState("searching");
            return;
        }
        const distance = Vector3.Distance(this.collider.position, this.investigationTarget);
        if (distance > 1.8) {
            this.moveToward(this.investigationTarget, 5.1 + this.suspicion * 0.22, deltaSeconds);
            this.faceToward(this.investigationTarget, deltaSeconds * 5);
            return;
        }
        this.searchTimer = 4.2 + this.suspicion * 0.45;
        this.setState(this.playerHidden && this.hiddenSpot && Vector3.Distance(this.hiddenSpot, this.investigationTarget) < 5 ? "listening" : "searching");
    }
    updateSearch(deltaSeconds) {
        this.searchTimer -= deltaSeconds;
        this.root.rotation.y += Math.sin(this.stateElapsed * 2.8) * deltaSeconds * 0.12;
        if (this.playerHidden && this.hiddenSpot && Vector3.Distance(this.collider.position, this.hiddenSpot) < 4.4) {
            this.listenTimer = 2.2;
            this.setState("listening");
            return;
        }
        if (!this.playerHidden && Vector3.Distance(this.collider.position, this.player.collider.position) < 2.3 && this.attackCooldown <= 0) {
            this.callbacks.onCaught("search");
            this.attackCooldown = 2;
            return;
        }
        if (this.searchTimer <= 0) {
            this.investigationTarget = null;
            this.setState("retreating");
        }
    }
    updateListening(deltaSeconds) {
        this.listenTimer -= deltaSeconds;
        this.head.rotation.z = Math.sin(this.stateElapsed * 4) * 0.18;
        if (!this.playerHidden) {
            this.setState("searching");
            return;
        }
        if (this.listenTimer <= 0) {
            const chance = Math.min(0.72, 0.16 + this.suspicion * 0.08 + this.tricks * 0.1);
            if (Math.random() < chance && this.hiddenSpot) {
                this.ui.showSoundCaption("dedos raspam a borda do esconderijo");
                this.setState("reaching");
            }
            else {
                this.tricks += 1;
                this.setState("retreating");
            }
        }
    }
    updateReaching(deltaSeconds) {
        if (this.hiddenSpot) {
            this.faceToward(this.hiddenSpot, deltaSeconds * 7);
            const reach = Math.min(1, this.stateElapsed / 1.7);
            this.rightArm.root.rotation.x = -0.7 - reach * 1.25;
            this.rightArm.lower.rotation.x = -0.4 - reach;
        }
        if (!this.playerHidden) {
            this.setState("searching");
            return;
        }
        if (this.stateElapsed > 2.1 && this.attackCooldown <= 0) {
            this.attackCooldown = 3;
            this.callbacks.onCaught("search");
        }
    }
    updateRetreat(deltaSeconds) {
        const node = this.targetNode ?? this.closestEntrance(this.collider.position);
        if (!node) {
            this.collider.setEnabled(false);
            this.setState("dormant");
            return;
        }
        this.targetNode = node;
        this.moveToward(node.position, 4.7, deltaSeconds);
        if (Vector3.Distance(this.collider.position, node.position) < 1.1 || this.stateElapsed > 8) {
            this.collider.setEnabled(false);
            this.targetNode = null;
            this.setState("dormant");
            this.audio.stopJesseMelody();
        }
    }
    updateDormant(deltaSeconds) {
        if (!this.activeSearch)
            return;
        this.falseCueTimer -= deltaSeconds;
        if (this.falseCueTimer <= 0) {
            this.falseCueTimer = Math.max(7, 16 - this.suspicion) + Math.random() * 9;
            const cueNode = this.traversalNodes[Math.floor(Math.random() * Math.max(1, this.traversalNodes.length))];
            if (cueNode) {
                this.audio.playJesseFalseCue(cueNode.position);
                this.ui.showSoundCaption("uma melodia incompleta ecoa no corredor");
            }
        }
    }
    moveToward(target, speed, deltaSeconds) {
        const direction = target.subtract(this.collider.position);
        direction.y = 0;
        const distance = direction.length();
        if (distance < 0.05)
            return;
        direction.normalize();
        const movement = direction.scale(Math.min(distance, speed * deltaSeconds));
        this.collider.moveWithCollisions(movement);
    }
    faceToward(target, amount) {
        const direction = target.subtract(this.collider.position);
        const desired = Math.atan2(direction.x, direction.z);
        let delta = desired - this.collider.rotation.y;
        while (delta > Math.PI)
            delta -= Math.PI * 2;
        while (delta < -Math.PI)
            delta += Math.PI * 2;
        this.collider.rotation.y += delta * Math.min(1, amount);
    }
    animateRig(deltaSeconds) {
        const running = this.state === "chasing" || this.state === "investigating" || this.state === "retreating";
        const amplitude = running ? 0.72 : 0.16;
        const wave = Math.sin(this.gait);
        const counter = Math.sin(this.gait + Math.PI);
        if (this.state !== "emerging" && this.state !== "reaching") {
            this.leftArm.root.rotation.x += ((wave * amplitude - 0.1) - this.leftArm.root.rotation.x) * Math.min(1, deltaSeconds * 9);
            this.rightArm.root.rotation.x += ((counter * amplitude - 0.1) - this.rightArm.root.rotation.x) * Math.min(1, deltaSeconds * 9);
            this.leftLeg.root.rotation.x += ((counter * amplitude * 0.7) - this.leftLeg.root.rotation.x) * Math.min(1, deltaSeconds * 9);
            this.rightLeg.root.rotation.x += ((wave * amplitude * 0.7) - this.rightLeg.root.rotation.x) * Math.min(1, deltaSeconds * 9);
        }
        const spring = running ? Math.abs(Math.sin(this.gait * 0.5)) * 0.16 : Math.sin(this.stateElapsed * 1.8) * 0.025;
        this.root.position.y += ((-2.35 + spring) - this.root.position.y) * Math.min(1, deltaSeconds * 8);
        this.torso.rotation.z = Math.sin(this.gait * 0.5) * (running ? 0.08 : 0.015);
        this.head.rotation.y = Math.sin(this.stateElapsed * 1.2) * 0.09;
        this.jaw.rotation.x = this.state === "chasing" ? 0.25 + Math.abs(Math.sin(this.gait)) * 0.22 : Math.sin(this.stateElapsed * 0.8) * 0.04;
    }
    setState(state) {
        if (this.state === state)
            return;
        this.state = state;
        this.stateElapsed = 0;
        this.callbacks.onStateChanged(state);
    }
    spawnForInvestigation(target) {
        const node = this.chooseHiddenEntrance(target) ?? this.closestEntrance(target);
        if (node) {
            this.collider.position.copyFrom(node.position);
            this.targetNode = node;
        }
        else {
            this.spawnBehindPlayer();
        }
        this.collider.setEnabled(true);
    }
    spawnBehindPlayer() {
        const node = this.closestBehindNode(this.player.collider.position);
        this.collider.position.copyFrom(node?.position ?? this.player.collider.position.subtract(this.player.forward().scale(14)));
        this.collider.setEnabled(true);
    }
    chooseHiddenEntrance(target) {
        const forward = this.player.forward();
        const cameraPosition = this.player.camera.globalPosition;
        const candidates = this.traversalNodes.filter((node) => {
            if (!node.entrance)
                return false;
            const toNode = node.position.subtract(cameraPosition);
            const distance = toNode.length();
            if (distance < 10 || distance > 45)
                return false;
            toNode.normalize();
            return Vector3.Dot(forward, toNode) < 0.35 && Vector3.Distance(node.position, target) < 36;
        });
        return candidates.sort((a, b) => Vector3.Distance(a.position, target) - Vector3.Distance(b.position, target))[0] ?? null;
    }
    closestEntrance(position) {
        return this.traversalNodes
            .filter((node) => node.entrance)
            .sort((a, b) => Vector3.Distance(a.position, position) - Vector3.Distance(b.position, position))[0] ?? null;
    }
    closestBehindNode(position) {
        const forward = this.player.forward();
        return this.traversalNodes
            .filter((node) => {
            const direction = node.position.subtract(position);
            const distance = direction.length();
            if (distance < 10 || distance > 32)
                return false;
            direction.normalize();
            return Vector3.Dot(forward, direction) < -0.15;
        })
            .sort((a, b) => Vector3.Distance(a.position, position) - Vector3.Distance(b.position, position))[0] ?? null;
    }
    createLimb(name, side, arm, baseY, cloth, brace) {
        const root = new TransformNode(`${name}-root`, this.scene);
        root.parent = this.root;
        root.position = new Vector3(side * (arm ? 0.72 : 0.32), baseY, 0);
        root.rotation.z = side * (arm ? 0.2 : 0.04);
        const upper = MeshBuilder.CreateCapsule(`${name}-upper`, { height: arm ? 2.65 : 2.5, radius: arm ? 0.21 : 0.24, tessellation: 10 }, this.scene);
        upper.parent = root;
        upper.position.y = -(arm ? 1.18 : 1.15);
        upper.material = cloth;
        const joint = MeshBuilder.CreateSphere(`${name}-joint`, { diameter: arm ? 0.52 : 0.58, segments: 10 }, this.scene);
        joint.parent = root;
        joint.position.y = -(arm ? 2.35 : 2.25);
        joint.material = brace;
        const lower = MeshBuilder.CreateCapsule(`${name}-lower`, { height: arm ? 2.85 : 2.7, radius: arm ? 0.18 : 0.21, tessellation: 10 }, this.scene);
        lower.parent = joint;
        lower.position.y = -(arm ? 1.28 : 1.2);
        lower.rotation.x = arm ? -0.12 : 0.08;
        lower.material = cloth;
        const extremity = arm
            ? MeshBuilder.CreateBox(`${name}-hand`, { width: 0.48, height: 0.82, depth: 0.22 }, this.scene)
            : MeshBuilder.CreateBox(`${name}-foot`, { width: 0.46, height: 0.28, depth: 0.92 }, this.scene);
        extremity.parent = lower;
        extremity.position.y = arm ? -1.58 : -1.42;
        extremity.position.z = arm ? -0.08 : -0.32;
        extremity.material = brace;
        if (arm) {
            for (let index = 0; index < 4; index += 1) {
                const finger = MeshBuilder.CreateCapsule(`${name}-finger-${index}`, { height: 0.72 + index * 0.06, radius: 0.045, tessellation: 6 }, this.scene);
                finger.parent = extremity;
                finger.position = new Vector3((index - 1.5) * 0.11, -0.52, -0.03);
                finger.rotation.z = (index - 1.5) * 0.08;
                finger.material = brace;
                this.fingers.push(finger);
            }
        }
        return { root, upper, lower, extremity, side, baseY };
    }
    createClothingDetails(cloth, brace) {
        const collar = MeshBuilder.CreateTorus("jesse-collar", { diameter: 1.5, thickness: 0.24, tessellation: 20 }, this.scene);
        collar.parent = this.root;
        collar.position.y = 6.15;
        collar.rotation.x = Math.PI / 2;
        collar.material = cloth;
        this.clothingPieces.push(collar);
        const waist = MeshBuilder.CreateTorus("jesse-waist-ruffle", { diameter: 1.32, thickness: 0.18, tessellation: 18 }, this.scene);
        waist.parent = this.root;
        waist.position.y = 3.42;
        waist.rotation.x = Math.PI / 2;
        waist.material = cloth;
        this.clothingPieces.push(waist);
        for (let index = 0; index < 7; index += 1) {
            const bracePiece = MeshBuilder.CreateBox(`jesse-brace-${index}`, { width: 0.09, height: 0.72, depth: 0.07 }, this.scene);
            bracePiece.parent = index < 4 ? this.torso : this.chest;
            bracePiece.position = new Vector3((index % 3 - 1) * 0.22, (index % 2 - 0.5) * 0.7, -0.56);
            bracePiece.rotation.z = (index % 2 ? 1 : -1) * 0.18;
            bracePiece.material = brace;
            this.clothingPieces.push(bracePiece);
        }
    }
    createFaceMaterial() {
        const texture = new DynamicTexture("jesse-face-texture", { width: 512, height: 512 }, this.scene, false);
        const context = texture.getContext();
        const gradient = context.createRadialGradient(256, 230, 40, 256, 256, 300);
        gradient.addColorStop(0, "#d8c4a7");
        gradient.addColorStop(0.55, "#9b856d");
        gradient.addColorStop(1, "#302520");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        context.strokeStyle = "rgba(70,25,20,0.86)";
        context.lineWidth = 22;
        context.beginPath();
        context.arc(170, 210, 58, 0, Math.PI * 2);
        context.arc(342, 210, 58, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = "#101011";
        context.beginPath();
        context.ellipse(170, 218, 20, 38, -0.15, 0, Math.PI * 2);
        context.ellipse(342, 218, 20, 38, 0.15, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "#7b1720";
        context.lineWidth = 28;
        context.beginPath();
        context.moveTo(116, 355);
        context.quadraticCurveTo(256, 455, 398, 340);
        context.stroke();
        context.strokeStyle = "rgba(30,22,18,0.7)";
        context.lineWidth = 7;
        for (let index = 0; index < 11; index += 1) {
            const x = 40 + index * 48;
            context.beginPath();
            context.moveTo(x, 20 + (index % 3) * 16);
            context.lineTo(x + 20, 120 + (index % 4) * 24);
            context.stroke();
        }
        texture.update();
        const material = new PBRMaterial("jesse-face-material", this.scene);
        material.albedoTexture = texture;
        material.roughness = 0.73;
        material.metallic = 0.04;
        return material;
    }
    setFoldedPose(amount) {
        this.root.scaling.y = 0.45 + (1 - amount) * 0.55;
        this.leftArm.root.rotation.x = -2.15 * amount;
        this.rightArm.root.rotation.x = -2.55 * amount;
        this.leftArm.root.rotation.z = -0.2 - amount * 1.15;
        this.rightArm.root.rotation.z = 0.2 + amount * 1.15;
        this.leftArm.lower.rotation.x = -2.2 * amount;
        this.rightArm.lower.rotation.x = -2.05 * amount;
        this.leftLeg.root.rotation.x = 1.85 * amount;
        this.rightLeg.root.rotation.x = 2.15 * amount;
        this.leftLeg.lower.rotation.x = -2.25 * amount;
        this.rightLeg.lower.rotation.x = -2.05 * amount;
        this.head.rotation.x = -0.72 * amount;
    }
}
