import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MirrorTexture } from "@babylonjs/core/Materials/Textures/mirrorTexture";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import { NoiseSystem } from "../systems/NoiseSystem.js";
import { JesseSystem } from "../entities/JesseSystem.js";
import { MimicEntity } from "../entities/MimicEntity.js";
export const CHAPTER3_ITEMS = {
    metalClub: { id: "metalClub", name: "Porrete de metal", description: "Pesado, barulhento e útil somente a curta distância." },
    replacementTorch: { id: "replacementTorch", name: "Nova tocha", description: "Uma tocha de manutenção com reservatório parcialmente cheio." },
    portableRecorder: { id: "portableRecorder", name: "Gravador portátil", description: "Fita curta encontrada junto de Daniel." },
    generatorAccessCard: { id: "generatorAccessCard", name: "Cartão de acesso técnico", description: "Autoriza a rede de geração do departamento." },
    rotor: { id: "rotor", name: "Rotor", description: "Núcleo laminado com eixo de acoplamento." },
    insulator: { id: "insulator", name: "Isolador", description: "Peça cerâmica marcada para alta tensão." },
    brush: { id: "brush", name: "Conjunto de escovas", description: "Contatos de carbono e suporte de cobre." },
    fuse: { id: "fuse", name: "Fusível industrial", description: "Proteção de corrente para o gerador de montagem." },
    regulator: { id: "regulator", name: "Regulador", description: "Módulo mecânico de estabilização de voltagem." },
    contact: { id: "contact", name: "Placa de contato", description: "Ponte condutora com terminais numerados." },
    gasSeal: { id: "gasSeal", name: "Vedação de gás", description: "Anel de borracha industrial para a linha do gerador." },
    metalCan: { id: "metalCan", name: "Lata metálica", description: "Pode ser arremessada para criar uma distração." }
};
export class Chapter3World {
    checkpoints = {
        chapter3Start: new Vector3(0, 0.12, 536),
        musicCorridor: new Vector3(0, 0.12, 558),
        jackChamber: new Vector3(0, 0.12, 594),
        chase1: new Vector3(0, 0.12, 624),
        chase2: new Vector3(-12, 0.12, 651),
        chase3: new Vector3(12, 0.12, 678),
        chase4: new Vector3(0, 0.12, 706),
        serviceElevator: new Vector3(0, 0.12, 724),
        danielRoom: new Vector3(0, 0.12, 750),
        generator1: new Vector3(-23, 0.12, 798),
        generator2: new Vector3(23, 0.12, 830),
        generator3: new Vector3(-23, 0.12, 866),
        generator4: new Vector3(23, 0.12, 904),
        generator5: new Vector3(0, 0.12, 957),
        mayaChamber: new Vector3(0, 0.12, 990),
        chapter4: new Vector3(0, 0.12, 1027)
    };
    active = false;
    phase = "arrival";
    chaseComplete = false;
    danielRecording = false;
    clubOwned = false;
    replacementTorchOwned = false;
    accessCardObtained = false;
    generatorStates = [false, false, false, false, false];
    minibossDefeated = false;
    melodySolved = false;
    mayaEncounterState = "not-started";
    chapterComplete = false;
    collectedDocuments = new Set();
    scene;
    materials;
    interaction;
    inventory;
    objective;
    ui;
    audio;
    fire;
    player;
    callbacks;
    root;
    noise;
    jesse;
    mimic;
    mimicMirrorTexture = null;
    settings;
    lights = [];
    dangerLights = [];
    doors = [];
    hidingSpots = [];
    traversalObstacles = [];
    thrownCans = [];
    breakables = [];
    generators = [];
    componentSlots = [];
    componentMeshes = new Map();
    documentMeshes = new Map();
    chaseRoute = [];
    jesseNodes = [];
    cableRoute = [0, 0, 0];
    breakerStates = [false, false, false];
    gasVents = [false, false, false];
    melodyInput = [];
    correctMelody = [4, 5, 3, 1, 2, 0];
    componentOrder = ["rotor", "insulator", "brush", "fuse", "regulator", "contact"];
    selectedComponent = "";
    gasConcentration = 0.88;
    gasBreath = 8;
    torchDisabledByChapter = false;
    jackBoxRoot;
    jackLid;
    jackCrank;
    jackSequence = -1;
    chaseCheckpoint = 0;
    chaseStarted = false;
    chaseElevatorClosing = false;
    chaseElevatorTimer = 0;
    traversalMotion = null;
    hiddenSpot = null;
    clubCooldown = 0;
    chargedAttackReady = false;
    finalGeneratorLever;
    mayaSequence = -1;
    mimicAttackTriggered = false;
    memorySequence = -1;
    chapterExitTriggered = false;
    noiseIndicatorWasVisible = false;
    lightReaction = 0;
    generator1Attempts = 0;
    gasGeneratorRepaired = false;
    gasEntered = false;
    gasNoiseTimer = 1.5;
    miniboss;
    assemblyCheckMesh;
    gasRepairConsole;
    melodyPlayback;
    generator5PlayerLever;
    generator5MayaLever;
    accessCardMesh;
    danielItemsCollected = 0;
    lastSafeCheckpoint = "chapter3Start";
    debugForceJesse = false;
    constructor(scene, materials, interaction, inventory, objective, ui, audio, fire, player, settings, callbacks) {
        this.scene = scene;
        this.materials = materials;
        this.interaction = interaction;
        this.inventory = inventory;
        this.objective = objective;
        this.ui = ui;
        this.audio = audio;
        this.fire = fire;
        this.player = player;
        this.settings = settings;
        this.callbacks = callbacks;
        this.root = new TransformNode("chapter3-root", scene);
        this.noise = new NoiseSystem(scene, materials);
        this.jesse = new JesseSystem(scene, materials, player, audio, ui, this.noise, {
            onCaught: (reason) => this.handleJesseCaught(reason),
            onStateChanged: (state) => {
                if (state === "investigating")
                    this.ui.showSoundCaption("a melodia de Jesse se aproxima");
            },
            onChaseCheckpoint: (index) => this.setChaseCheckpoint(index),
            isPathObstructed: (from, to) => this.isPathObstructed(from, to)
        });
        this.mimic = new MimicEntity(scene, materials, audio);
        this.noise.setThresholdHandler(() => this.onNoiseThreshold());
    }
    build() {
        this.createConnectedArchitecture();
        this.createMusicCorridor();
        this.createJackChamber();
        this.createChaseRoute();
        this.createServiceElevator();
        this.createDanielRoom();
        this.createMaintenanceNetwork();
        this.createGenerator1();
        this.createGenerator2();
        this.createGenerator3();
        this.createGenerator4();
        this.createGenerator5AndMaya();
        this.createHidingSpaces();
        this.createDocuments();
        this.createThrownCanPool();
        this.createJesseTraversalNodes();
        this.jesse.configure(this.jesseNodes, this.settings.simplifiedChase);
        this.root.setEnabled(false);
        this.noise.setEnabled(false);
    }
    startFromTransition() {
        this.active = true;
        this.phase = "arrival";
        this.root.setEnabled(true);
        this.noise.setEnabled(true);
        this.noise.restoreDanger(0);
        this.player.teleport(this.checkpoints.chapter3Start.clone(), Math.PI);
        this.player.setEnabled(true);
        this.fire.torchLit = false;
        this.audio.stopMusicBoxTheme();
        this.audio.startJesseMelody("distant", this.checkpoints.jackChamber);
        this.objective.set("follow-jesse-melody", "SIGA A MELODIA ATÉ A CAIXA DE BRINQUEDO.");
        this.ui.toast("O som denuncia você. Caminhe devagar e use esconderijos quando a melodia se aproximar.", 5600);
        this.lastSafeCheckpoint = "chapter3Start";
        this.callbacks.onCheckpoint("chapter3Start");
    }
    enableForDebug() {
        this.active = true;
        this.root.setEnabled(true);
        this.noise.setEnabled(true);
        this.phase = this.chaseComplete ? "generators" : "arrival";
        this.player.setEnabled(true);
        this.jesse.configure(this.jesseNodes, this.settings.simplifiedChase);
    }
    restore(progress, checkpoint) {
        this.active = true;
        this.root.setEnabled(true);
        this.noise.setEnabled(true);
        this.chaseComplete = progress.chaseComplete;
        this.chaseCheckpoint = progress.chaseCheckpoint;
        this.danielRecording = progress.danielRecording;
        this.clubOwned = progress.clubOwned;
        this.replacementTorchOwned = progress.replacementTorchOwned;
        this.accessCardObtained = progress.accessCardObtained;
        this.generatorStates = [...progress.generatorStates];
        progress.cableRoute.forEach((value, index) => this.cableRoute[index] = value ?? 0);
        progress.breakerStates.forEach((value, index) => this.breakerStates[index] = value ?? false);
        progress.componentSlots.forEach((value, index) => {
            const slot = this.componentSlots[index];
            if (slot)
                slot.installed = value ?? "";
        });
        progress.gasVents.forEach((value, index) => this.gasVents[index] = value ?? false);
        this.minibossDefeated = progress.minibossDefeated;
        this.gasGeneratorRepaired = progress.gasGeneratorRepaired;
        this.melodyInput.push(...progress.melodyInput);
        this.melodySolved = progress.melodySolved;
        this.noise.restoreDanger(Math.min(42, progress.noiseDanger));
        this.mayaEncounterState = progress.mayaEncounterState;
        this.chapterComplete = progress.chapterComplete;
        this.collectedDocuments = new Set(progress.collectedDocuments);
        const danielEquipmentReady = this.clubOwned && this.replacementTorchOwned && this.danielRecording;
        if (this.chapterComplete)
            this.phase = "complete";
        else if (this.mayaEncounterState !== "not-started")
            this.phase = "maya";
        else if (!this.chaseComplete) {
            this.phase = checkpoint.startsWith("jesse-chase-") ? "chase" : checkpoint === "jackChamber" ? "jack" : "arrival";
        }
        else if (!danielEquipmentReady)
            this.phase = "daniel";
        else
            this.phase = "generators";
        this.applyRestoredState();
        const destination = this.destinationForCheckpoint(checkpoint);
        this.player.teleport(destination, Math.PI);
        this.player.setEnabled(!this.chapterComplete);
        this.lastSafeCheckpoint = checkpoint;
        if (this.phase === "arrival") {
            this.jesse.stop();
            this.audio.startJesseMelody("distant", this.checkpoints.jackChamber);
            this.objective.set("follow-jesse-melody", "SIGA A MELODIA ATÉ A CAIXA DE BRINQUEDO.");
        }
        else if (this.phase === "jack") {
            this.jesse.stop();
            this.jackSequence = 0;
            this.objective.set("watch-jack-box", "ENCONTRE A ORIGEM DA MELODIA.");
        }
        else if (this.phase === "chase") {
            this.jackLid.rotation.x = -1.4;
            this.jackLid.position.y += 1.2;
            this.jackLid.checkCollisions = false;
            this.chaseStarted = true;
            this.objective.set("escape-jesse", "CORRA ATÉ O ELEVADOR DE SERVIÇO.");
            this.jesse.startChase(this.chaseRoute, this.chaseCheckpoint);
            this.jesse.resetChase(destination.subtract(new Vector3(0, 0, 11)), this.chaseCheckpoint);
        }
        else if (this.phase === "daniel") {
            this.jesse.stop();
            this.danielItemsCollected = [this.clubOwned, this.replacementTorchOwned, this.danielRecording].filter(Boolean).length;
            this.objective.set("collect-daniel-items", `RECOLHA O EQUIPAMENTO DE DANIEL. ${this.danielItemsCollected}/3`);
        }
        else if (this.phase === "generators") {
            this.jesse.beginExploration();
            this.objective.set(this.generatorStates.slice(0, 4).every(Boolean) && !this.generatorStates[4] ? "reach-generator5" : "activate-five-generators", this.generatorStates.slice(0, 4).every(Boolean) && !this.generatorStates[4]
                ? "ALCANCE O GERADOR FINAL. ELE EXIGE DUAS PESSOAS."
                : this.generatorObjectiveText());
        }
        else if (this.phase === "maya") {
            this.jesse.stop();
            this.mimic.setPosition(this.generator5MayaLever.position.add(new Vector3(0, -0.1, 1.2)), Math.PI);
            if (this.mayaEncounterState === "assisting") {
                this.mimic.setMayaInjuredPose();
                this.generator5MayaLever.rotation.x = -0.6;
                this.mayaSequence = this.generatorStates[4] ? 11.05 : 8.05;
                this.objective.set(this.generatorStates[4] ? "watch-maya" : "synchronize-generator5", this.generatorStates[4] ? "OBSERVE MAYA." : "SEGURE A ALAVANCA ESQUERDA ENQUANTO MAYA MANTÉM A OUTRA.");
            }
            else if (this.mayaEncounterState === "revealed") {
                this.mayaSequence = 14.55;
                this.player.setEnabled(false);
                this.objective.set("watch-maya", "OBSERVE MAYA.");
            }
            else {
                this.player.setEnabled(false);
            }
        }
    }
    serialize() {
        return {
            chaseComplete: this.chaseComplete,
            chaseCheckpoint: this.chaseCheckpoint,
            danielRecording: this.danielRecording,
            clubOwned: this.clubOwned,
            replacementTorchOwned: this.replacementTorchOwned,
            accessCardObtained: this.accessCardObtained,
            generatorStates: [...this.generatorStates],
            cableRoute: [...this.cableRoute],
            breakerStates: [...this.breakerStates],
            componentSlots: this.componentSlots.map((slot) => slot.installed),
            collectedComponents: this.componentOrder.filter((id) => this.inventory.has(id) || this.componentSlots.some((slot) => slot.installed === id)),
            gasVents: [...this.gasVents],
            minibossDefeated: this.minibossDefeated,
            gasGeneratorRepaired: this.gasGeneratorRepaired,
            melodyInput: [...this.melodyInput],
            melodySolved: this.melodySolved,
            noiseDanger: Math.min(60, this.noise.danger),
            mayaEncounterState: this.mayaEncounterState,
            chapterComplete: this.chapterComplete,
            collectedDocuments: [...this.collectedDocuments]
        };
    }
    guideTargetForObjective(objectiveId) {
        const player = this.player.collider.position;
        const meshPoint = (name, fallback) => {
            const mesh = this.scene.getMeshByName(name);
            if (!mesh || !mesh.isEnabled())
                return fallback.clone();
            mesh.computeWorldMatrix(true);
            return mesh.getBoundingInfo().boundingBox.centerWorld.clone();
        };
        const nearest = (points, fallback) => {
            const valid = points.filter(Boolean);
            return (valid.length ? valid.sort((a, b) => Vector3.Distance(a, player) - Vector3.Distance(b, player))[0] : fallback).clone();
        };
        if (objectiveId === "watch-jack-box")
            return meshPoint("jack-crank-handle", this.checkpoints.jackChamber);
        if (["inspect-daniel-room", "collect-daniel-items"].includes(objectiveId)) {
            const pending = [];
            if (!this.clubOwned)
                pending.push(meshPoint("daniel-metal-club", this.checkpoints.danielRoom));
            if (!this.replacementTorchOwned)
                pending.push(meshPoint("daniel-replacement-torch", this.checkpoints.danielRoom));
            if (!this.danielRecording)
                pending.push(meshPoint("daniel-recorder", this.checkpoints.danielRoom));
            return nearest(pending, this.checkpoints.danielRoom);
        }
        if (objectiveId === "activate-five-generators") {
            const pending = this.generatorStates.map((active, index) => active ? null : this.checkpoints[`generator${index + 1}`]);
            return nearest(pending, this.checkpoints.generator5);
        }
        if (objectiveId === "ventilate-gas-room") {
            const pending = this.gasVents.map((active, index) => active ? null : meshPoint(`gas-vent-wheel-${index}`, this.checkpoints.generator3));
            if (!this.minibossDefeated)
                pending.push(meshPoint("gas-miniboss-collider", this.checkpoints.generator3));
            if (!this.gasGeneratorRepaired)
                pending.push(meshPoint("gas-generator-repair-console", this.checkpoints.generator3));
            return nearest(pending, this.checkpoints.generator3);
        }
        if (objectiveId === "synchronize-generator5")
            return meshPoint("generator5-player-lever", this.checkpoints.generator5);
        if (objectiveId === "reach-generator5")
            return this.checkpoints.generator5.clone();
        return null;
    }
    destinationForCheckpoint(checkpoint) {
        const normalized = checkpoint.replace(/^chapter3-/, "");
        if (this.checkpoints[checkpoint])
            return this.checkpoints[checkpoint].clone();
        if (this.checkpoints[normalized])
            return this.checkpoints[normalized].clone();
        if (checkpoint.startsWith("generator-")) {
            const index = Number(checkpoint.split("-")[1]);
            return this.checkpoints[`generator${index}`]?.clone() ?? this.checkpoints.danielRoom.clone();
        }
        if (checkpoint.startsWith("jesse-chase-")) {
            const index = Math.max(0, Math.min(4, Number(checkpoint.split("-").at(-1) ?? 0)));
            return (this.chaseRoute[index] ?? this.checkpoints.chase1).clone();
        }
        if (checkpoint === "daniel")
            return this.checkpoints.danielRoom.clone();
        if (checkpoint === "maya-reveal")
            return this.checkpoints.mayaChamber.clone();
        return this.checkpoints.chapter3Start.clone();
    }
    update(deltaSeconds) {
        if (!this.active)
            return;
        this.clubCooldown = Math.max(0, this.clubCooldown - deltaSeconds);
        this.updateThrownCans(deltaSeconds);
        const snapshot = this.noise.update(deltaSeconds);
        this.ui.setNoiseDanger(snapshot.danger, this.phase === "generators" || this.phase === "maya");
        this.noiseIndicatorWasVisible = snapshot.danger > 0.5;
        this.updateDangerLights(deltaSeconds, snapshot.danger);
        this.jesse.update(deltaSeconds);
        this.mimic.update(deltaSeconds);
        if (this.mimicMirrorTexture) {
            const mirrorDistance = Vector3.Distance(this.player.collider.position, this.checkpoints.generator5);
            this.mimicMirrorTexture.refreshRate = mirrorDistance < 26 ? (this.settings.performancePreset === "performance" ? 2 : 1) : 0;
        }
        this.updateTraversal(deltaSeconds);
        this.updateJackSequence(deltaSeconds);
        this.updateChaseEnvironment(deltaSeconds);
        this.updateGasRoom(deltaSeconds);
        this.updateMiniboss(deltaSeconds);
        this.updateMayaSequence(deltaSeconds);
        this.updateMemorySequence(deltaSeconds);
        this.checkAreaTriggers();
    }
    applySettings(settings) {
        this.settings = settings;
        this.jesse.configure(this.jesseNodes, settings.simplifiedChase);
    }
    resetEnemiesForPlayerRespawn() {
        if (this.miniboss && !this.minibossDefeated && this.miniboss.state !== "dead") {
            this.miniboss.collider.position.copyFrom(this.checkpoints.generator3.add(new Vector3(0, 0, 1)));
            this.miniboss.state = this.gasEntered ? "stalking" : "dormant";
            this.miniboss.attackCooldown = 2;
            this.miniboss.stagger = 0;
            this.miniboss.root.setEnabled(this.gasEntered);
        }
    }
    emitPlayerMovementNoise(intensity, material, sprinting, crouching) {
        if (!this.active || this.phase === "complete")
            return;
        const category = crouching ? "crouch" : sprinting ? "sprint" : "footstep";
        this.emitNoise(category, intensity, material, this.player.collider.position);
    }
    emitTorchNoise(activeUse) {
        if (!this.active || !this.fire.torchLit)
            return;
        this.emitNoise("fire", activeUse ? 0.48 : 0.2, "fabric", this.player.collider.position, activeUse ? 1.8 : 0.8);
    }
    handlePrimaryAttack(charged) {
        if (!this.active || !this.clubOwned || this.phase === "chase" || this.phase === "arrival" || this.phase === "jack")
            return false;
        if (this.clubCooldown > 0)
            return true;
        const staminaCost = charged ? 36 : 18;
        if (!this.player.consumeStamina(staminaCost)) {
            this.ui.toast("Você precisa recuperar o fôlego.");
            return true;
        }
        this.clubCooldown = charged ? 1.05 : 0.48;
        this.audio.clubSwing(charged);
        this.emitNoise("attack", charged ? 1.12 : 0.74, "metal", this.player.collider.position);
        const ray = this.player.camera.getForwardRay(charged ? 3.1 : 2.45);
        const pick = this.scene.pickWithRay(ray, (mesh) => mesh.isPickable && mesh.isVisible && mesh !== this.player.collider);
        if (!pick?.hit || !pick.pickedMesh || !pick.pickedPoint)
            return true;
        const hitMesh = pick.pickedMesh;
        if (this.isMinibossMesh(hitMesh)) {
            this.damageMiniboss(charged ? 34 : 18, charged);
            this.audio.clubImpact(pick.pickedPoint, "plastic", charged);
            return true;
        }
        const breakable = this.findBreakable(hitMesh);
        if (breakable) {
            if (breakable.requiredCharge && !charged) {
                this.ui.toast("O painel cede, mas precisa de um golpe carregado.");
            }
            else {
                breakable.health -= charged ? 2 : 1;
                this.audio.clubImpact(pick.pickedPoint, "metal", charged);
                if (breakable.health <= 0)
                    this.breakBreakable(breakable);
            }
            return true;
        }
        const material = hitMesh.name.includes("metal") || hitMesh.name.includes("door") ? "metal" : hitMesh.name.includes("plastic") ? "plastic" : "concrete";
        this.audio.clubImpact(pick.pickedPoint, material, charged);
        return true;
    }
    handleContextAction() {
        if (!this.active || this.traversalMotion)
            return false;
        const playerPosition = this.player.collider.position;
        const obstacle = this.traversalObstacles
            .filter((entry) => !entry.completed)
            .sort((a, b) => Vector3.Distance(a.mesh.position, playerPosition) - Vector3.Distance(b.mesh.position, playerPosition))[0];
        if (!obstacle || Vector3.Distance(obstacle.mesh.position, playerPosition) > 3.2)
            return false;
        this.beginTraversal(obstacle);
        return true;
    }
    throwObject() {
        if (!this.active || this.phase === "arrival" || this.phase === "jack")
            return false;
        if (!this.inventory.has("metalCan")) {
            this.ui.toast("Você precisa encontrar uma lata metálica para criar uma distração.");
            return true;
        }
        const can = this.thrownCans.find((entry) => !entry.active);
        if (!can) {
            this.ui.toast("Você não tem outra lata à mão.");
            return true;
        }
        can.active = true;
        can.life = 4.6;
        can.mesh.setEnabled(true);
        can.mesh.position.copyFrom(this.player.camera.globalPosition.add(this.player.forward().scale(0.65)));
        can.velocity = this.player.camera.getForwardRay().direction.normalize().scale(10.5).add(new Vector3(0, 2.8, 0));
        this.inventory.remove("metalCan");
        return true;
    }
    closeRearDoor() {
        if (!this.active)
            return false;
        const position = this.player.collider.position;
        const door = this.doors
            .filter((entry) => entry.open && entry.lockable)
            .sort((a, b) => Vector3.Distance(a.mesh.position, position) - Vector3.Distance(b.mesh.position, position))[0];
        if (!door || Vector3.Distance(door.mesh.position, position) > 3.8)
            return false;
        door.open = false;
        door.mesh.position.copyFrom(door.basePosition);
        door.mesh.checkCollisions = true;
        door.blocker.setEnabled(true);
        door.blocker.checkCollisions = true;
        this.audio.impact(0.55);
        this.emitNoise("door", 0.7, "metal", door.mesh.position);
        this.ui.showSoundCaption("a porta fecha atrás de você");
        return true;
    }
    canUseTorch() {
        if (!this.active)
            return true;
        if (this.torchDisabledByChapter)
            return false;
        if (this.playerInGasRoom() && this.gasConcentration > 0.28)
            return false;
        return this.replacementTorchOwned;
    }
    setNoiseLevel(value) {
        this.noise.restoreDanger(value);
    }
    forceJesseSearch() {
        this.debugForceJesse = true;
        this.jesse.beginExploration();
        this.jesse.forceSearch(this.player.collider.position.add(this.player.forward().scale(7)));
    }
    toggleNoiseVisualization() {
        return this.noise.toggleVisualization();
    }
    toggleJesseVisualization() {
        return this.jesse.toggleVisualization();
    }
    startJesseIntroduction() {
        this.enableForDebug();
        this.player.teleport(this.checkpoints.jackChamber.clone(), Math.PI);
        this.phase = "jack";
        this.jackSequence = 0;
    }
    startChaseSegment(index) {
        this.enableForDebug();
        const safe = Math.max(0, Math.min(4, index));
        this.phase = "chase";
        this.chaseComplete = false;
        this.chaseStarted = true;
        this.chaseCheckpoint = safe;
        this.player.teleport((this.chaseRoute[safe] ?? this.checkpoints.chase1).clone(), Math.PI);
        const jessePosition = this.player.collider.position.subtract(this.player.forward().scale(12));
        this.jesse.startChase(this.chaseRoute, safe);
        this.jesse.resetChase(jessePosition, safe);
    }
    grantGeneratorComponents() {
        this.accessCardObtained = true;
        this.inventory.add(CHAPTER3_ITEMS.generatorAccessCard);
        this.componentOrder.forEach((id) => this.inventory.add(CHAPTER3_ITEMS[id]));
        this.inventory.add(CHAPTER3_ITEMS.gasSeal);
        this.ui.toast("Componentes do Capítulo 3 adicionados.");
    }
    resetMelodyPuzzle() {
        this.melodyInput.length = 0;
        this.melodySolved = false;
        if (!this.generatorStates[3])
            this.ui.toast("Sequência musical reiniciada.");
    }
    spawnMiniboss() {
        this.enableForDebug();
        this.miniboss.health = 100;
        this.miniboss.state = "stalking";
        this.miniboss.root.setEnabled(true);
        this.miniboss.collider.position.copyFrom(this.checkpoints.generator3.add(new Vector3(0, 0, 7)));
        this.minibossDefeated = false;
    }
    triggerMayaReveal() {
        this.enableForDebug();
        this.generatorStates = [true, true, true, true, false];
        this.player.teleport(this.checkpoints.mayaChamber.clone(), Math.PI);
        this.startMayaAssistance();
        this.mayaSequence = 7.5;
    }
    previewMimicIdentity(identity) {
        this.enableForDebug();
        this.mimic.setPosition(this.checkpoints.mayaChamber.add(new Vector3(0, 0, 4)), Math.PI);
        this.mimic.previewIdentity(identity);
    }
    inspectState() {
        return [
            `chapter3 active=${this.active} phase=${this.phase} chase=${this.chaseComplete}:${this.chaseCheckpoint}`,
            `generators=${this.generatorStates.map((value, index) => `${index + 1}:${value ? "on" : "off"}`).join(" ")}`,
            `gas=${this.gasConcentration.toFixed(2)} vents=${this.gasVents.join(",")} miniboss=${this.miniboss.state}:${this.miniboss.health}`,
            `melody=${this.melodyInput.join("-")} solved=${this.melodySolved}`,
            this.noise.inspect(),
            this.jesse.inspect(),
            this.mimic.inspect()
        ].join("\n");
    }
    createConnectedArchitecture() {
        const concrete = this.materials.get("concrete", 11);
        const tile = this.materials.get("tile", 9);
        const metal = this.materials.get("metal", 12);
        this.createCorridor("music-corridor-shell", new Vector3(0, 0, 558), 8, 44, concrete, tile);
        this.createRoomShell("jack-chamber-shell", new Vector3(0, 0, 596), 34, 34, 8.5, concrete, tile, ["south", "north"]);
        this.createCorridor("chase-a-shell", new Vector3(0, 0, 624), 7, 24, concrete, concrete);
        this.createCorridor("chase-b-shell", new Vector3(-12, 0, 651), 7, 32, concrete, concrete, Math.PI / 2);
        this.createCorridor("chase-c-shell", new Vector3(0, 0, 678), 7, 34, concrete, metal, Math.PI / 2);
        this.createCorridor("chase-d-shell", new Vector3(12, 0, 701), 7, 24, concrete, concrete);
        this.createRoomShell("service-elevator-shell", new Vector3(0, 0, 724), 11, 12, 5.5, metal, metal, ["south", "north"]);
        this.createCorridor("daniel-access-shell", new Vector3(0, 0, 742), 7, 24, concrete, tile);
        this.createRoomShell("daniel-room-shell", new Vector3(0, 0, 758), 18, 18, 5.8, concrete, tile, ["south", "north"]);
        this.createCorridor("maintenance-spine-a", new Vector3(0, 0, 805), 8, 78, concrete, concrete);
        this.createCorridor("maintenance-spine-b", new Vector3(0, 0, 892), 8, 88, concrete, concrete);
        this.createCorridor("maintenance-spine-c", new Vector3(0, 0, 949), 10, 30, concrete, metal);
        this.createRoomShell("generator1-room-shell", new Vector3(-23, 0, 798), 28, 25, 6.2, concrete, tile, ["east"]);
        this.createRoomShell("generator2-room-shell", new Vector3(23, 0, 830), 30, 28, 6.2, concrete, metal, ["west"]);
        this.createRoomShell("generator3-room-shell", new Vector3(-23, 0, 866), 30, 30, 7, concrete, metal, ["east"]);
        this.createRoomShell("generator4-room-shell", new Vector3(23, 0, 904), 30, 28, 6.5, concrete, tile, ["west"]);
        this.createRoomShell("generator5-room-shell", new Vector3(0, 0, 967), 34, 32, 8, concrete, metal, ["south", "north"]);
        this.createRoomShell("maya-chamber-shell", new Vector3(0, 0, 1002), 25, 25, 7, concrete, tile, ["south", "north"]);
        this.createCorridor("chapter4-transition-shell", new Vector3(0, 0, 1024), 8, 20, concrete, concrete);
        const branchPositions = [
            { from: new Vector3(-7, 0, 798), to: new Vector3(-10, 0, 798), width: 20 },
            { from: new Vector3(7, 0, 830), to: new Vector3(10, 0, 830), width: 20 },
            { from: new Vector3(-7, 0, 866), to: new Vector3(-10, 0, 866), width: 20 },
            { from: new Vector3(7, 0, 904), to: new Vector3(10, 0, 904), width: 20 }
        ];
        branchPositions.forEach((entry, index) => {
            const center = Vector3.Center(entry.from, entry.to);
            this.createCorridor(`generator-branch-${index}`, center, 7, entry.width, concrete, metal, Math.PI / 2);
        });
        for (let z = 780; z <= 950; z += 18) {
            const pipe = MeshBuilder.CreateCylinder(`overhead-pipe-${z}`, { height: 18, diameter: 0.34, tessellation: 10 }, this.scene);
            pipe.parent = this.root;
            pipe.position = new Vector3(z % 36 === 0 ? -2.5 : 2.5, 4.9, z);
            pipe.rotation.x = Math.PI / 2;
            pipe.material = metal;
            pipe.isPickable = false;
            const drip = MeshBuilder.CreateCylinder(`pipe-joint-${z}`, { height: 0.7, diameter: 0.52, tessellation: 10 }, this.scene);
            drip.parent = pipe;
            drip.position.y = 0;
            drip.material = metal;
        }
        for (let index = 0; index < 22; index += 1) {
            const light = new PointLight(`chapter3-light-${index}`, new Vector3(index % 2 ? -2.8 : 2.8, 4.6, 548 + index * 21.5), this.scene);
            light.parent = this.root;
            light.diffuse = index % 4 === 0 ? new Color3(0.66, 0.76, 0.82) : new Color3(0.82, 0.76, 0.58);
            light.intensity = 0.55;
            light.range = 15;
            this.lights.push(light);
        }
    }
    createMusicCorridor() {
        const wood = this.materials.get("wood", 10);
        const metal = this.materials.get("metal", 11);
        for (let index = 0; index < 7; index += 1) {
            const cylinder = MeshBuilder.CreateCylinder(`music-cylinder-display-${index}`, { height: 1.4, diameter: 0.85, tessellation: 18 }, this.scene);
            cylinder.parent = this.root;
            cylinder.position = new Vector3(index % 2 ? 2.7 : -2.7, 1.45, 544 + index * 4.7);
            cylinder.rotation.z = Math.PI / 2;
            cylinder.material = index % 3 ? metal : wood;
            cylinder.isPickable = false;
            for (let pin = 0; pin < 8; pin += 1) {
                const tooth = MeshBuilder.CreateBox(`music-cylinder-${index}-tooth-${pin}`, { width: 0.09, height: 0.16, depth: 0.12 }, this.scene);
                tooth.parent = cylinder;
                tooth.position = new Vector3(0.42, (pin - 3.5) * 0.13, 0);
                tooth.rotation.x = pin * 0.72;
                tooth.material = metal;
            }
        }
        this.createProceduralSign("music-department-sign", "DEPARTAMENTO DE MÚSICA E RESPOSTA", new Vector3(0, 3.6, 548), Math.PI, 5.8, 1.25);
    }
    createJackChamber() {
        this.jackBoxRoot = new TransformNode("giant-jack-box", this.scene);
        this.jackBoxRoot.parent = this.root;
        this.jackBoxRoot.position = new Vector3(0, 0, 598);
        const wood = this.materials.get("wood", 12);
        const metal = this.materials.get("metal", 14);
        const plastic = this.materials.get("plastic", 11);
        const base = MeshBuilder.CreateBox("jack-box-base", { width: 4.4, height: 3.2, depth: 4.4 }, this.scene);
        base.parent = this.jackBoxRoot;
        base.position.y = 1.6;
        base.material = wood;
        base.checkCollisions = true;
        for (let side = 0; side < 4; side += 1) {
            const reinforcement = MeshBuilder.CreateBox(`jack-reinforcement-${side}`, side < 2
                ? { width: 0.22, height: 3.35, depth: 4.58 }
                : { width: 4.58, height: 3.35, depth: 0.22 }, this.scene);
            reinforcement.parent = this.jackBoxRoot;
            reinforcement.position = side === 0 ? new Vector3(-2.18, 1.62, 0)
                : side === 1 ? new Vector3(2.18, 1.62, 0)
                    : side === 2 ? new Vector3(0, 1.62, -2.18) : new Vector3(0, 1.62, 2.18);
            reinforcement.material = metal;
            reinforcement.checkCollisions = true;
        }
        this.jackLid = MeshBuilder.CreateBox("jack-box-lid", { width: 4.7, height: 0.35, depth: 4.7 }, this.scene);
        this.jackLid.parent = this.jackBoxRoot;
        this.jackLid.position = new Vector3(0, 3.4, 1.95);
        this.jackLid.material = wood;
        this.jackLid.checkCollisions = true;
        this.jackCrank = new TransformNode("jack-crank-root", this.scene);
        this.jackCrank.parent = this.jackBoxRoot;
        this.jackCrank.position = new Vector3(2.7, 1.6, 0);
        const axle = MeshBuilder.CreateCylinder("jack-crank-axle", { height: 1.1, diameter: 0.34, tessellation: 12 }, this.scene);
        axle.parent = this.jackCrank;
        axle.rotation.z = Math.PI / 2;
        axle.material = metal;
        const arm = MeshBuilder.CreateBox("jack-crank-arm", { width: 0.22, height: 1.65, depth: 0.22 }, this.scene);
        arm.parent = this.jackCrank;
        arm.position.y = -0.75;
        arm.material = metal;
        const handle = MeshBuilder.CreateCylinder("jack-crank-handle", { height: 0.8, diameter: 0.28, tessellation: 12 }, this.scene);
        handle.parent = arm;
        handle.position = new Vector3(0, -0.85, -0.35);
        handle.rotation.x = Math.PI / 2;
        handle.material = plastic;
        this.createProceduralSign("jack-panel-clown", "JESSE\nSORRIA PARA O SUSTO", new Vector3(0, 1.85, 595.76), 0, 2.5, 1.8, true);
        for (let index = 0; index < 8; index += 1) {
            const scratch = MeshBuilder.CreateBox(`jack-inside-scratch-${index}`, { width: 0.05, height: 1.6 + index * 0.08, depth: 0.02 }, this.scene);
            scratch.parent = this.jackBoxRoot;
            scratch.position = new Vector3(-1.4 + index * 0.4, 2, -2.23);
            scratch.rotation.z = (index - 4) * 0.05;
            scratch.material = this.materials.emissive(`jack-scratch-material-${index}`, new Color3(0.2, 0.05, 0.04), 0.12);
        }
        const chamberSpot = new SpotLight("jack-chamber-spot", new Vector3(0, 7.8, 591), new Vector3(0, -0.7, 0.8), Math.PI / 3, 2, this.scene);
        chamberSpot.parent = this.root;
        chamberSpot.diffuse = new Color3(0.8, 0.64, 0.42);
        chamberSpot.intensity = 3.2;
        chamberSpot.range = 24;
    }
    createChaseRoute() {
        this.chaseRoute.push(this.checkpoints.chase1.clone(), this.checkpoints.chase2.clone(), this.checkpoints.chase3.clone(), this.checkpoints.chase4.clone(), this.checkpoints.serviceElevator.clone());
        const metal = this.materials.get("metal", 15);
        const wood = this.materials.get("wood", 13);
        const shelf = MeshBuilder.CreateBox("chase-falling-shelf", { width: 5.2, height: 4.6, depth: 1.2 }, this.scene);
        shelf.parent = this.root;
        shelf.position = new Vector3(-3, 2.3, 632);
        shelf.material = metal;
        shelf.checkCollisions = true;
        shelf.metadata = { chaseFalling: true, triggered: false };
        for (let index = 0; index < 5; index += 1) {
            const box = MeshBuilder.CreateBox(`chase-box-${index}`, { width: 1.1, height: 0.8, depth: 0.9 }, this.scene);
            box.parent = this.root;
            box.position = new Vector3(-1.8 + index * 0.8, 0.45 + (index % 2) * 0.8, 645 + (index % 3));
            box.material = wood;
            box.checkCollisions = true;
        }
        const vault = MeshBuilder.CreateBox("chase-vault-obstacle", { width: 6.2, height: 1.15, depth: 1.2 }, this.scene);
        vault.parent = this.root;
        vault.position = new Vector3(-12, 0.58, 653);
        vault.material = metal;
        vault.checkCollisions = true;
        this.traversalObstacles.push({ mesh: vault, type: "vault", completed: false, checkpoint: 1, end: new Vector3(-12, 0.12, 657) });
        const slideDoor = MeshBuilder.CreateBox("chase-slide-door", { width: 6.5, height: 3.4, depth: 0.45 }, this.scene);
        slideDoor.parent = this.root;
        slideDoor.position = new Vector3(4, 3.1, 678);
        slideDoor.material = metal;
        slideDoor.checkCollisions = true;
        this.traversalObstacles.push({ mesh: slideDoor, type: "slide", completed: false, checkpoint: 2, end: new Vector3(8, 0.12, 678) });
        const breakPanel = MeshBuilder.CreateBox("chase-breakable-panel", { width: 5.8, height: 3.8, depth: 0.35 }, this.scene);
        breakPanel.parent = this.root;
        breakPanel.position = new Vector3(12, 1.9, 691);
        breakPanel.material = wood;
        breakPanel.checkCollisions = true;
        this.breakables.push({ mesh: breakPanel, health: 1, requiredCharge: false });
        this.interaction.register(breakPanel, {
            prompt: "[E] EMPURRAR O PAINEL DANIFICADO",
            enabled: () => this.phase === "chase" && breakPanel.isEnabled(),
            onInteract: () => {
                breakPanel.rotation.z = 1.25;
                breakPanel.position.x += 2.3;
                breakPanel.checkCollisions = false;
                this.emitNoise("impact", 0.9, "wood", breakPanel.position);
                this.audio.impact(0.75);
            }
        });
        const choiceGateA = this.createDoor("chase-choice-gate-a", new Vector3(-9, 2, 672), new Vector3(0, 4.2, 0), true);
        const choiceGateB = this.createDoor("chase-choice-gate-b", new Vector3(9, 2, 684), new Vector3(0, 4.2, 0), true);
        choiceGateA.open = true;
        choiceGateA.mesh.position.copyFrom(choiceGateA.basePosition.add(choiceGateA.slide));
        choiceGateA.mesh.checkCollisions = false;
        choiceGateA.blocker.setEnabled(false);
        choiceGateA.blocker.checkCollisions = false;
        choiceGateB.open = true;
        choiceGateB.mesh.position.copyFrom(choiceGateB.basePosition.add(choiceGateB.slide));
        choiceGateB.mesh.checkCollisions = false;
        choiceGateB.blocker.setEnabled(false);
        choiceGateB.blocker.checkCollisions = false;
    }
    createServiceElevator() {
        const metal = this.materials.get("metal", 16);
        const doorLeft = MeshBuilder.CreateBox("service-elevator-door-left", { width: 2.4, height: 4.5, depth: 0.28 }, this.scene);
        const doorRight = MeshBuilder.CreateBox("service-elevator-door-right", { width: 2.4, height: 4.5, depth: 0.28 }, this.scene);
        doorLeft.parent = doorRight.parent = this.root;
        // Start fully retracted. The old values placed both leaves already closed,
        // so the "close elevator" sequence appeared frozen and the player met a wall.
        doorLeft.position = new Vector3(-3.8, 2.25, 729.6);
        doorRight.position = new Vector3(3.8, 2.25, 729.6);
        doorLeft.material = doorRight.material = metal;
        doorLeft.checkCollisions = doorRight.checkCollisions = false;
        const elevatorHeader = MeshBuilder.CreateBox("service-elevator-header", { width: 5.2, height: 1, depth: 0.72 }, this.scene);
        elevatorHeader.parent = this.root;
        elevatorHeader.position = new Vector3(0, 5, 729.6);
        elevatorHeader.material = metal;
        elevatorHeader.checkCollisions = true;
        elevatorHeader.metadata = { permanentDoorWall: true };
        const button = MeshBuilder.CreateBox("service-elevator-button", { width: 0.38, height: 0.62, depth: 0.18 }, this.scene);
        button.parent = this.root;
        button.position = new Vector3(3.2, 1.5, 727.8);
        button.material = this.materials.emissive("service-elevator-button-material", new Color3(0.7, 0.18, 0.08), 0.55);
        this.interaction.register(button, {
            prompt: "[E] FECHAR ELEVADOR DE SERVIÇO",
            enabled: () => this.phase === "chase" && !this.chaseElevatorClosing && Vector3.Distance(this.player.collider.position, button.position) < 4,
            onInteract: () => {
                this.chaseElevatorClosing = true;
                this.chaseElevatorTimer = 0;
                this.player.setEnabled(false);
                this.audio.impact(0.65);
                this.emitNoise("machine", 1, "metal", button.position);
                this.objective.set("survive-elevator", "MANTENHA JESSE FORA ATÉ AS PORTAS FECHAREM.");
            }
        });
        doorLeft.metadata = { elevatorDoor: true, side: -1 };
        doorRight.metadata = { elevatorDoor: true, side: 1 };
    }
    createDanielRoom() {
        const fabric = this.materials.get("plush", 12);
        const skin = this.materials.get("plastic", 12);
        const bodyRoot = new TransformNode("daniel-body-root", this.scene);
        bodyRoot.parent = this.root;
        bodyRoot.position = new Vector3(-2.5, 0.38, 757);
        bodyRoot.rotation.z = 1.2;
        const torso = MeshBuilder.CreateCapsule("daniel-torso", { height: 1.65, radius: 0.42, tessellation: 12 }, this.scene);
        torso.parent = bodyRoot;
        torso.position.y = 0.85;
        torso.material = fabric;
        const head = MeshBuilder.CreateSphere("daniel-head", { diameter: 0.72, segments: 14 }, this.scene);
        head.parent = bodyRoot;
        head.position = new Vector3(0.12, 1.95, -0.15);
        head.material = skin;
        for (let index = 0; index < 4; index += 1) {
            const limb = MeshBuilder.CreateCapsule(`daniel-limb-${index}`, { height: index < 2 ? 1.35 : 1.55, radius: 0.14, tessellation: 9 }, this.scene);
            limb.parent = bodyRoot;
            limb.position = new Vector3(index % 2 ? 0.55 : -0.55, index < 2 ? 1.05 : -0.15, 0);
            limb.rotation.z = (index % 2 ? 1 : -1) * (index < 2 ? 0.8 : 0.25);
            limb.material = fabric;
        }
        this.createCollectible("daniel-metal-club", CHAPTER3_ITEMS.metalClub, new Vector3(1.6, 0.42, 754.6), "[E] PEGAR PORRETE DE METAL", () => {
            this.clubOwned = true;
            this.danielItemsCollected += 1;
            this.ui.toast("Clique esquerdo: golpe leve · clique direito: golpe carregado", 5200);
            this.updateDanielObjective();
        }, "club");
        this.createCollectible("daniel-replacement-torch", CHAPTER3_ITEMS.replacementTorch, new Vector3(0.3, 0.48, 758.6), "[E] PEGAR NOVA TOCHA", () => {
            this.replacementTorchOwned = true;
            this.fire.addFuel(72);
            this.danielItemsCollected += 1;
            this.updateDanielObjective();
        }, "torch");
        this.createCollectible("daniel-recorder", CHAPTER3_ITEMS.portableRecorder, new Vector3(-0.2, 0.35, 755.5), "[E] PEGAR GRAVADOR PORTÁTIL", () => {
            this.danielRecording = true;
            this.danielItemsCollected += 1;
            this.audio.playVoiceLikeLine(3.1);
            this.ui.showSubtitle("Daniel · gravação", "Maya encontrou alguém… mas ele sabe nossos nomes.", 6200);
            this.updateDanielObjective();
        }, "recorder");
        this.accessCardMesh = this.createCollectible("generator-access-card", CHAPTER3_ITEMS.generatorAccessCard, new Vector3(-3.35, 0.72, 755.4), "[E] RETIRAR CARTÃO DO BOLSO DE DANIEL", () => {
            this.accessCardObtained = true;
            this.updateDanielObjective();
        }, "card");
        this.createProceduralSign("daniel-room-label", "SALA DE RECUPERAÇÃO\nEQUIPE SOMENTE", new Vector3(4.1, 2.8, 750.8), -Math.PI / 2, 2.8, 1.2);
    }
    createMaintenanceNetwork() {
        const metal = this.materials.get("metal", 18);
        const glass = this.materials.get("glass", 10);
        for (let index = 0; index < 16; index += 1) {
            const machine = MeshBuilder.CreateBox(`maintenance-machine-${index}`, { width: 2.1, height: 2.8, depth: 1.3 }, this.scene);
            machine.parent = this.root;
            const side = index % 2 ? 1 : -1;
            machine.position = new Vector3(side * 4.1, 1.4, 780 + index * 10.7);
            machine.material = metal;
            machine.checkCollisions = true;
            const gauge = MeshBuilder.CreateCylinder(`maintenance-gauge-${index}`, { height: 0.12, diameter: 0.62, tessellation: 18 }, this.scene);
            gauge.parent = machine;
            gauge.position = new Vector3(0, 0.55, -0.72);
            gauge.rotation.x = Math.PI / 2;
            gauge.material = glass;
        }
        [812, 850, 886, 926].forEach((z, index) => {
            const door = this.createDoor(`maintenance-door-${index}`, new Vector3(0, 2, z), new Vector3(4.5, 0, 0), true);
            door.open = true;
            door.mesh.position.copyFrom(door.basePosition.add(door.slide));
            door.mesh.checkCollisions = false;
            door.blocker.setEnabled(false);
            door.blocker.checkCollisions = false;
            this.interaction.register(door.mesh, {
                prompt: () => door.open ? "[E] FECHAR PORTA" : "[E] ABRIR PORTA",
                onInteract: () => this.toggleDoor(door)
            });
        });
        const remoteBuzzer = MeshBuilder.CreateBox("remote-machinery-buzzer", { width: 0.55, height: 0.85, depth: 0.25 }, this.scene);
        remoteBuzzer.parent = this.root;
        remoteBuzzer.position = new Vector3(3.25, 1.4, 846);
        remoteBuzzer.material = this.materials.emissive("remote-buzzer-material", new Color3(0.75, 0.12, 0.05), 0.5);
        this.interaction.register(remoteBuzzer, {
            prompt: "[E] ACIONAR BUZINA REMOTA",
            onInteract: () => {
                const remote = new Vector3(-22, 1, 842);
                this.audio.startTemporaryBuzzer(remote, 4.2);
                this.emitNoise("distraction", 1.25, "electrical", remote, 4.2);
                this.ui.showSoundCaption("a buzina dispara em outro corredor");
            }
        });
    }
    createGenerator1() {
        const center = this.checkpoints.generator1;
        const rig = this.createGeneratorRig(0, center.add(new Vector3(0, 0, 4)));
        const cardReader = MeshBuilder.CreateBox("generator1-card-reader", { width: 0.5, height: 0.9, depth: 0.24 }, this.scene);
        cardReader.parent = this.root;
        cardReader.position = center.add(new Vector3(-4.2, 1.4, 1.5));
        cardReader.material = this.materials.get("plastic", 13);
        this.interaction.register(cardReader, {
            prompt: () => this.accessCardObtained ? "[E] INSERIR CARTÃO DE ACESSO" : "CARTÃO DE ACESSO NECESSÁRIO",
            enabled: () => !this.generatorStates[0],
            onInteract: () => {
                if (!this.accessCardObtained && !this.inventory.has("generatorAccessCard")) {
                    this.ui.toast("O leitor exige um cartão técnico.");
                    return;
                }
                cardReader.material = this.materials.emissive("generator1-reader-active", new Color3(0.18, 0.8, 0.32), 0.8);
                this.audio.electricalSnap(cardReader.position, 0.6);
                this.ui.toast("Acesso autorizado. Configure cabos e disjuntores.");
            }
        });
        for (let index = 0; index < 3; index += 1) {
            const cable = MeshBuilder.CreateTorus(`generator1-cable-${index}`, { diameter: 1.1, thickness: 0.16, tessellation: 18 }, this.scene);
            cable.parent = this.root;
            cable.position = center.add(new Vector3(-2.4 + index * 2.4, 1.6, 2));
            cable.rotation.x = Math.PI / 2;
            cable.material = this.materials.get("plastic", 14 + index);
            this.interaction.register(cable, {
                prompt: () => `[E] REDIRECIONAR CABO ${index + 1} · TERMINAL ${this.cableRoute[index] + 1}`,
                enabled: () => !this.generatorStates[0],
                onInteract: () => {
                    this.cableRoute[index] = (this.cableRoute[index] + 1) % 3;
                    cable.rotation.z = this.cableRoute[index] * Math.PI / 3;
                    this.audio.electricalSnap(cable.position, 0.38);
                    this.emitNoise("machine", 0.22, "electrical", cable.position);
                }
            });
            const breaker = MeshBuilder.CreateBox(`generator1-breaker-${index}`, { width: 0.4, height: 0.9, depth: 0.28 }, this.scene);
            breaker.parent = this.root;
            breaker.position = center.add(new Vector3(-2.2 + index * 2.2, 1.35, -0.6));
            breaker.material = this.materials.get("metal", 17);
            this.interaction.register(breaker, {
                prompt: () => `[E] DISJUNTOR ${index + 1}: ${this.breakerStates[index] ? "LIGADO" : "DESLIGADO"}`,
                enabled: () => !this.generatorStates[0],
                onInteract: () => {
                    this.breakerStates[index] = !this.breakerStates[index];
                    breaker.rotation.x = this.breakerStates[index] ? -0.45 : 0.45;
                    this.audio.electricalSnap(breaker.position, 0.45);
                }
            });
        }
        this.interaction.register(rig.console, {
            prompt: "[E] TESTAR VOLTAGEM E INICIAR GERADOR 1",
            enabled: () => !this.generatorStates[0],
            onInteract: () => this.tryGenerator1()
        });
        this.createProceduralSign("generator1-diagram", "ROTA SEGURA\nA→3  B→1  C→2\nDISJUNTORES: I  II", center.add(new Vector3(0, 3.8, -5.5)), 0, 4.8, 2);
    }
    createGenerator2() {
        const center = this.checkpoints.generator2;
        const rig = this.createGeneratorRig(1, center.add(new Vector3(0, 0, 4)));
        const componentPositions = [
            center.add(new Vector3(-5.5, 0.7, -3.8)), center.add(new Vector3(4.8, 0.7, -4.5)),
            center.add(new Vector3(-6, 1.5, 3.5)), center.add(new Vector3(5.4, 1.1, 2.8)),
            center.add(new Vector3(-1.5, 0.65, 6)), center.add(new Vector3(2.2, 1.8, -5.3))
        ];
        this.componentOrder.forEach((id, index) => {
            const mesh = this.createComponentMesh(id, componentPositions[index], index);
            this.componentMeshes.set(id, mesh);
            this.interaction.register(mesh, {
                prompt: `[E] INSPECIONAR E PEGAR ${CHAPTER3_ITEMS[id].name.toUpperCase()}`,
                enabled: () => mesh.isEnabled() && !this.componentSlots.some((slot) => slot.installed === id),
                onInteract: () => {
                    if (this.inventory.add(CHAPTER3_ITEMS[id])) {
                        mesh.setEnabled(false);
                        this.selectedComponent = id;
                        this.audio.pickup();
                        this.ui.showDocument(CHAPTER3_ITEMS[id].name, CHAPTER3_ITEMS[id].description + "\n\nUse o seletor da bancada para escolher a peça antes de instalá-la.");
                    }
                }
            });
        });
        const selector = MeshBuilder.CreateCylinder("component-selector", { height: 0.42, diameter: 0.9, tessellation: 14 }, this.scene);
        selector.parent = this.root;
        selector.position = center.add(new Vector3(-5, 1.1, 1));
        selector.rotation.x = Math.PI / 2;
        selector.material = this.materials.get("metal", 20);
        this.interaction.register(selector, {
            prompt: () => `[E] SELECIONAR PEÇA · ${this.selectedComponent ? CHAPTER3_ITEMS[this.selectedComponent].name : "NENHUMA"}`,
            onInteract: () => {
                const owned = this.componentOrder.filter((id) => this.inventory.has(id));
                if (owned.length === 0) {
                    this.ui.toast("Nenhuma peça solta na bancada.");
                    return;
                }
                const current = Math.max(-1, owned.indexOf(this.selectedComponent));
                this.selectedComponent = owned[(current + 1) % owned.length] ?? "";
                this.ui.toast(`Peça selecionada: ${CHAPTER3_ITEMS[this.selectedComponent].name}`);
            }
        });
        for (let index = 0; index < 6; index += 1) {
            const socket = MeshBuilder.CreateBox(`component-slot-${index}`, { width: 0.82, height: 0.82, depth: 0.35 }, this.scene);
            socket.parent = this.root;
            socket.position = center.add(new Vector3(-3.2 + index * 1.28, 1.4, 3.1));
            socket.material = this.materials.get("metal", 21);
            const slot = { mesh: socket, index, installed: "" };
            this.componentSlots.push(slot);
            this.interaction.register(socket, {
                prompt: () => slot.installed
                    ? `[E] REMOVER ${CHAPTER3_ITEMS[slot.installed].name.toUpperCase()} DO ENCAIXE ${index + 1}`
                    : `[E] INSTALAR PEÇA SELECIONADA NO ENCAIXE ${index + 1}`,
                enabled: () => !this.generatorStates[1],
                onInteract: () => this.interactComponentSlot(slot)
            });
        }
        this.assemblyCheckMesh = rig.console;
        this.interaction.register(rig.console, {
            prompt: "[E] TESTAR MONTAGEM DO GERADOR 2",
            enabled: () => !this.generatorStates[1],
            onInteract: () => this.tryGenerator2()
        });
        this.createProceduralSign("generator2-order", "ORDEM DE MONTAGEM\nROTOR · ISOLADOR · ESCOVAS\nFUSÍVEL · REGULADOR · CONTATO", center.add(new Vector3(0, 4.1, -6)), 0, 6, 2.2);
    }
    createGenerator3() {
        const center = this.checkpoints.generator3;
        this.createGeneratorRig(2, center.add(new Vector3(0, 0, 5)));
        for (let index = 0; index < 3; index += 1) {
            const valve = MeshBuilder.CreateTorus(`gas-vent-wheel-${index}`, { diameter: 1.05, thickness: 0.14, tessellation: 18 }, this.scene);
            valve.parent = this.root;
            valve.position = center.add(new Vector3(-6 + index * 6, 1.55, -5.5 + (index % 2) * 2));
            valve.rotation.x = Math.PI / 2;
            valve.material = this.materials.get("metal", 22 + index);
            this.interaction.register(valve, {
                prompt: () => `[E] VENTILAÇÃO ${index + 1}: ${this.gasVents[index] ? "ABERTA" : "FECHADA"}`,
                onInteract: () => {
                    this.gasVents[index] = !this.gasVents[index];
                    valve.rotation.z += Math.PI / 2;
                    this.audio.gasHiss(valve.position, this.gasVents[index] ? 0.7 : 0.35);
                    this.emitNoise("gas", 0.45, "gas", valve.position, 2.5);
                }
            });
        }
        this.gasRepairConsole = MeshBuilder.CreateBox("gas-generator-repair-console", { width: 2.2, height: 1.5, depth: 0.8 }, this.scene);
        this.gasRepairConsole.parent = this.root;
        this.gasRepairConsole.position = center.add(new Vector3(0, 1, 5.6));
        this.gasRepairConsole.material = this.materials.get("metal", 25);
        this.gasRepairConsole.checkCollisions = true;
        this.interaction.register(this.gasRepairConsole, {
            prompt: "[E] REPARAR VEDAÇÃO E ATIVAR GERADOR 3",
            enabled: () => !this.generatorStates[2],
            onInteract: () => this.tryGenerator3()
        });
        this.miniboss = this.createMiniboss(center.add(new Vector3(0, 0, 1)));
        this.createProceduralSign("gas-warning", "PERIGO · GÁS DE PROCESSAMENTO\nNÃO USE CHAMAS\nVENTILE ANTES DA MANUTENÇÃO", center.add(new Vector3(0, 4.6, -7)), 0, 6, 2.2, true);
        const sealMesh = this.createCollectible("gas-seal-item", CHAPTER3_ITEMS.gasSeal, center.add(new Vector3(6, 0.5, 5)), "[E] PEGAR VEDAÇÃO DE GÁS", () => undefined, "seal");
        sealMesh.rotation.z = Math.PI / 2;
    }
    createGenerator4() {
        const center = this.checkpoints.generator4;
        const rig = this.createGeneratorRig(3, center.add(new Vector3(0, 0, 5)));
        const metal = this.materials.get("metal", 27);
        for (let index = 0; index < 6; index += 1) {
            const pipe = MeshBuilder.CreateCylinder(`melody-pipe-${index}`, { height: 1.8 + index * 0.22, diameter: 0.42, tessellation: 14 }, this.scene);
            pipe.parent = this.root;
            pipe.position = center.add(new Vector3(-4.5 + index * 1.8, 1 + index * 0.11, 0.8));
            pipe.material = metal;
            const bell = MeshBuilder.CreateSphere(`melody-bell-${index}`, { diameter: 0.75, segments: 12, slice: 0.62 }, this.scene);
            bell.parent = pipe;
            bell.position.y = 1.05;
            bell.material = this.materials.get("metal", 28 + index);
            this.interaction.register(bell, {
                prompt: `[E] TOCAR SINO ${index + 1}`,
                enabled: () => !this.generatorStates[3],
                onInteract: () => this.pressMelodyNote(index, bell.position.add(pipe.position))
            });
        }
        this.melodyPlayback = MeshBuilder.CreateCylinder("melody-playback-control", { height: 0.45, diameter: 0.9, tessellation: 16 }, this.scene);
        this.melodyPlayback.parent = this.root;
        this.melodyPlayback.position = center.add(new Vector3(-5, 1.1, 4));
        this.melodyPlayback.rotation.x = Math.PI / 2;
        this.melodyPlayback.material = this.materials.get("plastic", 20);
        this.interaction.register(this.melodyPlayback, {
            prompt: "[E] OUVIR CILINDRO DANIFICADO AO CONTRÁRIO",
            enabled: () => !this.generatorStates[3],
            onInteract: () => this.playMelodyClue()
        });
        this.interaction.register(rig.console, {
            prompt: "[E] CONFIRMAR SEQUÊNCIA E ATIVAR GERADOR 4",
            enabled: () => !this.generatorStates[3],
            onInteract: () => this.tryGenerator4()
        });
        this.createProceduralSign("melody-instruction", "A MÁQUINA LEMBRA DE TRÁS PARA FRENTE.\nCOMPLETE O TEMA DE JESSE.", center.add(new Vector3(0, 4.2, -6)), 0, 6.2, 1.8);
    }
    createGenerator5AndMaya() {
        const center = this.checkpoints.generator5;
        this.createGeneratorRig(4, center.add(new Vector3(0, 0, 4)));
        this.generator5PlayerLever = MeshBuilder.CreateBox("generator5-player-lever", { width: 0.4, height: 1.8, depth: 0.4 }, this.scene);
        this.generator5MayaLever = MeshBuilder.CreateBox("generator5-maya-lever", { width: 0.4, height: 1.8, depth: 0.4 }, this.scene);
        this.generator5PlayerLever.parent = this.generator5MayaLever.parent = this.root;
        this.generator5PlayerLever.position = center.add(new Vector3(-6.2, 1.2, 2));
        this.generator5MayaLever.position = center.add(new Vector3(6.2, 1.2, 2));
        this.generator5PlayerLever.material = this.generator5MayaLever.material = this.materials.get("metal", 30);
        this.finalGeneratorLever = this.generator5PlayerLever;
        this.interaction.register(this.generator5PlayerLever, {
            prompt: () => this.generatorStates.slice(0, 4).every(Boolean)
                ? "[E] SEGURAR ALAVANCA DO GERADOR 5"
                : "OS QUATRO GERADORES ANTERIORES PRECISAM ESTAR ATIVOS",
            enabled: () => !this.generatorStates[4],
            onInteract: () => {
                if (!this.generatorStates.slice(0, 4).every(Boolean)) {
                    this.ui.toast("A rede ainda não tem energia suficiente.");
                    return;
                }
                if (this.mayaEncounterState === "not-started")
                    this.startMayaAssistance();
                else if (this.mayaEncounterState === "assisting" && this.mayaSequence >= 4.5)
                    this.activateGenerator5();
            }
        });
        this.interaction.register(this.generator5MayaLever, {
            prompt: "A SEGUNDA ALAVANCA EXIGE OUTRA PESSOA",
            enabled: () => !this.generatorStates[4],
            onInteract: () => this.ui.toast("As alavancas estão longe demais para uma pessoa só.")
        });
        this.mimic.setPosition(this.checkpoints.mayaChamber.add(new Vector3(0, 0, 5)), Math.PI);
        this.createMimicObservationMirror(center.add(new Vector3(10.7, 3.1, 7)), new Vector3(-1, 0, 0));
        this.createProceduralSign("generator5-instruction", "SINCRONIZAÇÃO HUMANA\nDUAS ALAVANCAS · UM PULSO", center.add(new Vector3(0, 4.8, -7)), 0, 5.5, 1.8);
    }
    createMimicObservationMirror(position, normal) {
        const texture = new MirrorTexture("mimic-observation-mirror-render", this.settings.performancePreset === "performance" ? 256 : 512, this.scene, true);
        texture.mirrorPlane = Plane.FromPositionAndNormal(position, normal);
        texture.renderList = this.mimic.getReflectableMeshes();
        texture.level = 0.72;
        texture.refreshRate = this.settings.performancePreset === "performance" ? 2 : 1;
        this.mimicMirrorTexture = texture;
        const reflective = new StandardMaterial("mimic-observation-mirror-material", this.scene);
        reflective.reflectionTexture = texture;
        reflective.diffuseColor = new Color3(0.08, 0.09, 0.1);
        reflective.specularColor = new Color3(0.72, 0.76, 0.78);
        reflective.backFaceCulling = false;
        const mirror = MeshBuilder.CreatePlane("mimic-observation-mirror", { width: 5.8, height: 4.4 }, this.scene);
        mirror.parent = this.root;
        mirror.position.copyFrom(position);
        mirror.rotation.y = -Math.PI / 2;
        mirror.material = reflective;
        mirror.isPickable = false;
        const damageTexture = new DynamicTexture("mimic-mirror-damage-texture", { width: 512, height: 384 }, this.scene, false);
        damageTexture.hasAlpha = true;
        const context = damageTexture.getContext();
        context.clearRect(0, 0, 512, 384);
        context.strokeStyle = "rgba(218,225,224,0.48)";
        context.lineWidth = 2;
        const crackOrigins = [[92, 66], [386, 104], [272, 312]];
        crackOrigins.forEach(([x, y], originIndex) => {
            for (let branch = 0; branch < 7; branch += 1) {
                context.beginPath();
                context.moveTo(x, y);
                for (let step = 1; step < 6; step += 1) {
                    const angle = branch * 0.88 + originIndex * 0.43 + Math.sin(step * 4.7 + branch) * 0.18;
                    const radius = step * (13 + originIndex * 2);
                    context.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
                }
                context.stroke();
            }
        });
        context.fillStyle = "rgba(65,54,47,0.22)";
        for (let index = 0; index < 54; index += 1) {
            const x = (index * 83) % 512;
            const y = (index * 47 + Math.sin(index) * 36 + 384) % 384;
            context.beginPath();
            context.ellipse(x, y, 5 + index % 11, 2 + index % 5, index * 0.31, 0, Math.PI * 2);
            context.fill();
        }
        damageTexture.update();
        const damageMaterial = new StandardMaterial("mimic-mirror-damage-material", this.scene);
        damageMaterial.diffuseTexture = damageTexture;
        damageMaterial.opacityTexture = damageTexture;
        damageMaterial.emissiveColor = new Color3(0.08, 0.08, 0.08);
        damageMaterial.backFaceCulling = false;
        const damage = MeshBuilder.CreatePlane("mimic-observation-mirror-damage", { width: 5.82, height: 4.42 }, this.scene);
        damage.parent = this.root;
        damage.position.copyFrom(position.add(normal.scale(-0.018)));
        damage.rotation.y = -Math.PI / 2;
        damage.material = damageMaterial;
        damage.isPickable = false;
    }
    createHidingSpaces() {
        const positions = [
            new Vector3(-4, 0, 780), new Vector3(4, 0, 814), new Vector3(-4, 0, 842),
            new Vector3(4, 0, 882), new Vector3(-4, 0, 918), new Vector3(4, 0, 944)
        ];
        positions.forEach((position, index) => {
            const locker = MeshBuilder.CreateBox(`hiding-locker-${index}`, { width: 1.2, height: 2.65, depth: 1.15 }, this.scene);
            locker.parent = this.root;
            locker.position = position.add(new Vector3(0, 1.33, 0));
            locker.material = this.materials.get("metal", 32 + index % 3);
            locker.checkCollisions = true;
            const door = MeshBuilder.CreateBox(`hiding-locker-door-${index}`, { width: 1.05, height: 2.5, depth: 0.12 }, this.scene);
            door.parent = this.root;
            door.position = position.add(new Vector3(0, 1.33, -0.63));
            door.material = this.materials.get("metal", 34 + index % 2);
            door.isPickable = true;
            const spot = {
                door,
                inside: position.add(new Vector3(0, 0.12, 0.05)),
                outside: position.add(new Vector3(0, 0.12, -1.7)),
                occupied: false
            };
            this.hidingSpots.push(spot);
            this.interaction.register(door, {
                prompt: () => spot.occupied ? "[E] SAIR DO ESCONDERIJO" : "[E] ENTRAR NO ARMÁRIO",
                onInteract: () => this.toggleHidingSpot(spot)
            });
        });
    }
    createDocuments() {
        const docs = [
            { id: "noise-protocol", title: "PROTOCOLO DE RUÍDO", body: "O sujeito JESSE responde à soma de vibração, impacto e repetição.\n\nPassos leves reduzem a assinatura. Portas, metal e geradores propagam o som por vários setores. Sons remotos podem redirecioná-lo, mas a repetição aumenta a suspeita.", position: new Vector3(3.2, 1.1, 770) },
            { id: "daniel-note", title: "NOTA DE DANIEL", body: "Maya disse que lembrava da ponte atrás da escola. Nós nunca fomos lá juntos. Ela riu antes de perceber que ninguém mais estava rindo.", position: new Vector3(-4, 1, 762) },
            { id: "mimic-instruction", title: "RELATÓRIO DE IDENTIDADE", body: "O modelo de imitação não copia apenas medidas. Ele retém preferências motoras, pausas de fala e fragmentos de memória observados. Reflexos revelam atrasos antes que o rosto principal falhe.", position: new Vector3(4, 1.2, 940) },
            { id: "generator-network", title: "REDE DE GERAÇÃO", body: "Os cinco geradores alimentam a ala de retenção. Falhas repetidas acionam a rotina sonora de contenção. A rotina nunca deve ser executada com JESSE fora da caixa.", position: new Vector3(-3.5, 1.2, 793) }
        ];
        docs.forEach((doc, index) => {
            const mesh = MeshBuilder.CreateBox(`chapter3-document-${doc.id}`, { width: 0.7, height: 0.05, depth: 0.95 }, this.scene);
            mesh.parent = this.root;
            mesh.position.copyFrom(doc.position);
            mesh.rotation.y = index * 0.7;
            mesh.material = this.materials.get("wood", 16 + index);
            this.documentMeshes.set(doc.id, mesh);
            this.interaction.register(mesh, {
                prompt: `[E] LER ${doc.title}`,
                enabled: () => mesh.isEnabled(),
                onInteract: () => {
                    this.collectedDocuments.add(doc.id);
                    mesh.setEnabled(false);
                    this.ui.showDocument(doc.title, doc.body);
                    this.audio.pickup();
                    this.callbacks.onCheckpoint(this.lastSafeCheckpoint);
                }
            });
        });
    }
    createThrownCanPool() {
        for (let index = 0; index < 5; index += 1) {
            const mesh = MeshBuilder.CreateCylinder(`chapter3-thrown-can-${index}`, { height: 0.48, diameter: 0.28, tessellation: 12 }, this.scene);
            mesh.parent = this.root;
            mesh.material = this.materials.get("metal", 36 + index);
            mesh.checkCollisions = false;
            mesh.isPickable = false;
            mesh.setEnabled(false);
            this.thrownCans.push({ mesh, velocity: Vector3.Zero(), active: false, life: 0 });
        }
        for (let index = 0; index < 7; index += 1) {
            const pickup = MeshBuilder.CreateCylinder(`metal-can-pickup-${index}`, { height: 0.45, diameter: 0.26, tessellation: 12 }, this.scene);
            pickup.parent = this.root;
            pickup.position = new Vector3(index % 2 ? 3.2 : -3.2, 0.25, 777 + index * 23);
            pickup.material = this.materials.get("metal", 37 + index % 3);
            this.interaction.register(pickup, {
                prompt: "[E] PEGAR LATA PARA DISTRAÇÃO",
                enabled: () => pickup.isEnabled() && !this.inventory.has("metalCan"),
                onInteract: () => {
                    this.inventory.add(CHAPTER3_ITEMS.metalCan);
                    pickup.setEnabled(false);
                    this.audio.pickup();
                }
            });
        }
    }
    createJesseTraversalNodes() {
        const positions = [
            ["jack-entry", 0, 615, "jack", true], ["chase-left", -12, 645, "chase", true], ["chase-right", 12, 684, "chase", true],
            ["maintenance-a", -5, 785, "maintenance", true], ["maintenance-b", 5, 820, "maintenance", true],
            ["generator1-door", -8, 798, "generator1", true], ["generator2-door", 8, 830, "generator2", true],
            ["generator3-door", -8, 866, "generator3", true], ["generator4-door", 8, 904, "generator4", true],
            ["maintenance-c", -5, 932, "maintenance", true], ["generator5-entry", 0, 948, "generator5", true],
            ["g1-inner", -23, 804, "generator1", false], ["g2-inner", 23, 836, "generator2", false],
            ["g3-inner", -23, 872, "generator3", false], ["g4-inner", 23, 910, "generator4", false]
        ];
        positions.forEach(([id, x, z, room, entrance]) => this.jesseNodes.push({ id, position: new Vector3(x, 0.12, z), room, entrance }));
    }
    updateJackSequence(deltaSeconds) {
        if (this.jackSequence < 0)
            return;
        this.jackSequence += deltaSeconds;
        const t = this.jackSequence;
        if (t < 4.2) {
            const slow = t > 2.2 ? 0.7 : 2.1;
            this.jackCrank.rotation.x += deltaSeconds * slow;
            this.jackBoxRoot.rotation.y = Math.sin(t * 5) * 0.012;
        }
        if (t > 2.2 && t - deltaSeconds <= 2.2) {
            this.audio.stopJesseMelody();
            this.audio.startJesseMelody("slow", this.jackBoxRoot.position);
            this.ui.showSoundCaption("a melodia desacelera");
        }
        if (t > 4.15 && t - deltaSeconds <= 4.15) {
            this.audio.springRelease(this.jackBoxRoot.position);
            this.jackLid.rotation.x = -1.4;
            this.jackLid.position.y += 1.2;
            this.jackLid.checkCollisions = false;
            this.ui.flashLightning();
            this.jesse.startIntroduction(this.jackBoxRoot.position.add(new Vector3(0, 0, 0.3)));
            this.ui.showSubtitle("Protagonista", "Não. Não, não, não...", 2600);
        }
        if (t > 7.4 && !this.chaseStarted) {
            this.chaseStarted = true;
            this.phase = "chase";
            this.objective.set("escape-jesse", "CORRA ATÉ O ELEVADOR DE SERVIÇO.");
            this.ui.toast("ESPAÇO perto de barreiras: saltar ou deslizar", 4300);
            this.jesse.startChase(this.chaseRoute, 0);
            this.callbacks.onCheckpoint("jesse-chase-0");
        }
    }
    updateChaseEnvironment(deltaSeconds) {
        if (this.phase !== "chase")
            return;
        const playerPosition = this.player.collider.position;
        const shelf = this.scene.getMeshByName("chase-falling-shelf");
        if (shelf?.metadata?.chaseFalling && !shelf.metadata.triggered && playerPosition.z > 630) {
            shelf.metadata.triggered = true;
            shelf.rotation.z = -1.25;
            shelf.position.x -= 2.8;
            shelf.checkCollisions = false;
            this.audio.impact(1.1);
            this.emitNoise("impact", 1.25, "metal", shelf.position);
        }
        if (this.settings.simplifiedChase && !this.traversalMotion) {
            const obstacle = this.traversalObstacles.find((entry) => !entry.completed && Vector3.Distance(entry.mesh.position, playerPosition) < 2.2);
            if (obstacle)
                this.beginTraversal(obstacle);
        }
        if (this.chaseElevatorClosing) {
            this.chaseElevatorTimer += deltaSeconds;
            const doors = [this.scene.getMeshByName("service-elevator-door-left"), this.scene.getMeshByName("service-elevator-door-right")].filter(Boolean);
            doors.forEach((door) => {
                const side = Number(door.metadata?.side ?? 1);
                door.position.x += ((side * 1.22) - door.position.x) * Math.min(1, deltaSeconds * 2.8);
                door.checkCollisions = Math.abs(door.position.x - side * 1.22) < 0.45;
            });
            if (this.chaseElevatorTimer > 2.1 && this.chaseElevatorTimer - deltaSeconds <= 2.1) {
                this.audio.impact(1.2);
                this.ui.showSoundCaption("dedos compridos batem do outro lado da porta");
            }
            if (this.chaseElevatorTimer > 3.3)
                this.completeChase();
        }
    }
    updateTraversal(deltaSeconds) {
        if (!this.traversalMotion)
            return;
        const motion = this.traversalMotion;
        motion.elapsed += deltaSeconds;
        const t = Math.min(1, motion.elapsed / motion.duration);
        const smooth = t * t * (3 - 2 * t);
        const position = Vector3.Lerp(motion.start, motion.end, smooth);
        if (motion.type === "vault")
            position.y += Math.sin(t * Math.PI) * 1.35;
        else
            position.y = 0.12 - Math.sin(t * Math.PI) * 0.05;
        this.player.collider.position.copyFrom(position);
        this.player.camera.position.copyFrom(position.add(new Vector3(0, motion.type === "slide" ? 1.05 : 1.62, 0)));
        if (t >= 1) {
            this.player.setEnabled(true);
            this.traversalMotion = null;
            this.emitNoise("impact", motion.type === "vault" ? 0.55 : 0.34, "metal", motion.end);
        }
    }
    updateThrownCans(deltaSeconds) {
        for (const can of this.thrownCans) {
            if (!can.active)
                continue;
            can.life -= deltaSeconds;
            can.velocity.y -= 13 * deltaSeconds;
            const next = can.mesh.position.add(can.velocity.scale(deltaSeconds));
            const floorY = 0.22;
            if (next.y <= floorY) {
                next.y = floorY;
                can.velocity.y = Math.abs(can.velocity.y) * 0.32;
                can.velocity.x *= 0.58;
                can.velocity.z *= 0.58;
                this.audio.metalLure(next, 0.85);
                this.emitNoise("distraction", 1.05, "metal", next, 1.8);
            }
            can.mesh.position.copyFrom(next);
            can.mesh.rotation.x += deltaSeconds * 6;
            can.mesh.rotation.z += deltaSeconds * 4;
            if (can.life <= 0) {
                can.active = false;
                can.mesh.setEnabled(false);
            }
        }
    }
    updateGasRoom(deltaSeconds) {
        if (!this.active || this.generatorStates[2])
            return;
        const inRoom = this.playerInGasRoom();
        const ventCount = this.gasVents.filter(Boolean).length;
        const target = Math.max(0.08, 0.9 - ventCount * 0.27);
        this.gasConcentration += (target - this.gasConcentration) * Math.min(1, deltaSeconds * 0.42);
        if (!inRoom) {
            this.gasBreath = Math.min(8, this.gasBreath + deltaSeconds * 2.4);
            return;
        }
        this.gasNoiseTimer -= deltaSeconds;
        if (this.gasNoiseTimer <= 0) {
            this.gasNoiseTimer = 4.2 + (1 - this.gasConcentration) * 2.4;
            const leakPosition = this.checkpoints.generator3.add(new Vector3(0, 1.8, -4));
            this.audio.gasHiss(leakPosition, 0.24 + this.gasConcentration * 0.25);
            this.emitNoise("gas", 0.2 + this.gasConcentration * 0.18, "gas", leakPosition, 2.2);
        }
        if (!this.gasEntered) {
            this.gasEntered = true;
            this.ui.showSoundCaption("gás espesso escapa das tubulações");
            this.objective.set("ventilate-gas-room", "VENTILE A SALA, DERROTE O EXPERIMENTO E REPARE O GERADOR 3.");
            if (!this.minibossDefeated) {
                this.miniboss.root.setEnabled(true);
                this.miniboss.state = "stalking";
            }
        }
        if (this.fire.torchLit && this.gasConcentration > 0.24) {
            this.fire.torchLit = false;
            this.audio.fireBurst();
            this.ui.flashDamage(0.85);
            this.player.damage(30);
            this.emitNoise("failure", 1.4, "gas", this.player.collider.position, 3.5);
            this.gasConcentration = Math.max(0.15, this.gasConcentration - 0.22);
            this.ui.toast("A tocha incendiou uma bolsa de gás. A chama se apagou.");
        }
        if (this.gasConcentration > 0.38) {
            this.gasBreath -= deltaSeconds * (0.45 + this.gasConcentration);
            if (this.gasBreath <= 0) {
                this.gasBreath = 2.2;
                this.damagePlayer(8, "O gás força você a recuar para respirar.");
            }
        }
        else {
            this.gasBreath = Math.min(8, this.gasBreath + deltaSeconds * 1.2);
        }
    }
    updateMiniboss(deltaSeconds) {
        if (!this.miniboss || this.miniboss.state === "dead" || this.miniboss.state === "dormant" || !this.miniboss.root.isEnabled())
            return;
        this.miniboss.stateElapsed += deltaSeconds;
        this.miniboss.attackCooldown = Math.max(0, this.miniboss.attackCooldown - deltaSeconds);
        if (this.miniboss.state === "staggered") {
            this.miniboss.stagger -= deltaSeconds;
            this.miniboss.root.rotation.z = Math.sin(this.miniboss.stateElapsed * 15) * 0.12;
            if (this.miniboss.stagger <= 0) {
                this.miniboss.root.rotation.z = 0;
                this.miniboss.state = "stalking";
                this.miniboss.stateElapsed = 0;
            }
            return;
        }
        const target = this.player.collider.position;
        const torchThreat = this.fire.getTorchThreatPosition();
        if (torchThreat && this.fire.isTorchThreatNear(this.miniboss.collider.position, 6.2)) {
            const away = this.miniboss.collider.position.subtract(torchThreat);
            away.y = 0;
            if (away.lengthSquared() > 0.001) {
                away.normalize();
                this.miniboss.collider.moveWithCollisions(away.scale(deltaSeconds * 4.2));
                this.miniboss.root.rotation.y = Math.atan2(away.x, away.z);
            }
            this.miniboss.state = "stalking";
            this.miniboss.attackCooldown = Math.max(this.miniboss.attackCooldown, 0.65);
            return;
        }
        const distance = Vector3.Distance(this.miniboss.collider.position, target);
        if (distance > 2.1) {
            const direction = target.subtract(this.miniboss.collider.position);
            direction.y = 0;
            direction.normalize();
            const speed = this.gasConcentration > 0.5 ? 2.6 : 3.35;
            this.miniboss.collider.moveWithCollisions(direction.scale(speed * deltaSeconds));
            this.miniboss.root.rotation.y = Math.atan2(direction.x, direction.z);
            this.miniboss.state = "stalking";
        }
        else if (this.miniboss.attackCooldown <= 0) {
            this.miniboss.state = "attacking";
            this.miniboss.attackCooldown = 2.3;
            this.audio.impact(0.72);
            this.emitNoise("attack", 0.8, "metal", this.miniboss.collider.position);
            this.damagePlayer(14, "O experimento de manutenção golpeia você.");
        }
        const gait = performance.now() * 0.006;
        this.miniboss.parts.forEach((part, index) => part.rotation.x = Math.sin(gait + index * 1.7) * 0.18);
    }
    updateMayaSequence(deltaSeconds) {
        if (this.mayaSequence < 0)
            return;
        this.mayaSequence += deltaSeconds;
        const t = this.mayaSequence;
        if (t > 0.4 && t - deltaSeconds <= 0.4) {
            this.ui.showSubtitle("Maya", "Você está vivo... Eu achei que ele tinha pegado você.", 4600);
            this.audio.playVoiceLikeLine(2.8);
        }
        if (t > 3.2 && t - deltaSeconds <= 3.2) {
            this.ui.showSubtitle("Protagonista", "Daniel não conseguiu sair.", 3100);
        }
        if (t > 5.1 && t - deltaSeconds <= 5.1) {
            this.ui.showSubtitle("Maya", "Eu sei. A jaqueta azul dele estava coberta de óleo.", 4800);
            this.ui.toast("Daniel estava usando uma jaqueta marrom.", 3600);
        }
        if (t > 7.8 && t - deltaSeconds <= 7.8 && !this.generatorStates[4]) {
            this.mimic.setPosition(this.generator5MayaLever.position.add(new Vector3(0, -0.1, 1.2)), Math.PI);
            this.ui.showSubtitle("Maya", "Eu seguro a alavanca direita. Você sempre usa a esquerda, lembra?", 5200);
            this.generator5MayaLever.rotation.x = -0.6;
            this.objective.set("synchronize-generator5", "SEGURE A ALAVANCA ESQUERDA ENQUANTO MAYA MANTÉM A OUTRA.");
        }
        if (t > 9.35 && t - deltaSeconds <= 9.35) {
            this.mimic.setReflectionAnomaly("blank", 2.6);
            this.ui.showSoundCaption("no espelho rachado, os olhos de Maya desaparecem antes que ela pisque");
            this.ui.toast("Ela costumava saber que você usa a mão direita.", 3200);
        }
        if (this.generatorStates[4] && t > 11 && this.mayaEncounterState === "assisting") {
            this.mayaEncounterState = "revealed";
            this.phase = "maya";
            this.player.setEnabled(false);
            const fearEntrance = this.checkpoints.generator5.add(new Vector3(0, 0, -11));
            const fearExit = fearEntrance.add(new Vector3(-8, 0, -9));
            this.jesse.showFearRetreat(fearEntrance, fearExit);
            this.audio.stopJesseMelody();
            this.ui.showSoundCaption("a melodia para no meio de uma nota; Jesse recua, dobrando os membros para fugir");
            this.ui.showSubtitle("Maya", "Eles chamavam esta ala de retenção antes de você nascer.", 5200);
        }
        if (this.mayaEncounterState === "revealed" && t > 14.5 && !this.mimic.revealing && !this.mimicAttackTriggered) {
            this.ui.showSubtitle("Maya", "Eu fui todos eles.", 5200);
            this.mimic.startReveal(() => {
                this.mimicAttackTriggered = true;
                this.audio.impact(1.4);
                this.ui.flashDamage(1);
                this.memorySequence = 0;
            });
        }
    }
    updateMemorySequence(deltaSeconds) {
        if (this.memorySequence < 0)
            return;
        this.memorySequence += deltaSeconds;
        const t = this.memorySequence;
        if (t > 0.25 && t - deltaSeconds <= 0.25) {
            this.audio.memoryFragments();
            this.audio.startJesseMelody("reversed", this.checkpoints.jackChamber);
        }
        if (t > 4.4 && t - deltaSeconds <= 4.4)
            this.audio.stopJesseMelody();
        if (t > 0.8 && t - deltaSeconds <= 0.8)
            this.ui.showSubtitle("Voz fragmentada", "Maya... Daniel... Jesse... nós lembramos por você.", 4300);
        if (t > 1.1 && t < 4.8 && Math.floor(t * 5) !== Math.floor((t - deltaSeconds) * 5)) {
            this.ui.flashLightning();
            const flashes = [this.checkpoints.jackChamber, this.checkpoints.generator3, this.checkpoints.mayaChamber, this.checkpoints.danielRoom];
            const target = flashes[Math.floor(t * 3) % flashes.length];
            this.player.camera.setTarget(target.add(new Vector3(0, 2, 0)));
        }
        if (t > 5.2 && !this.chapterExitTriggered) {
            this.chapterExitTriggered = true;
            this.chapterComplete = true;
            this.mayaEncounterState = "complete";
            this.phase = "complete";
            this.callbacks.onCheckpoint("chapter4-transition");
            this.callbacks.onChapterComplete();
        }
    }
    checkAreaTriggers() {
        const position = this.player.collider.position;
        if (this.phase === "arrival" && Vector3.Distance(position, this.checkpoints.jackChamber) < 12) {
            this.phase = "jack";
            this.jackSequence = 0;
            this.objective.set("watch-jack-box", "ENCONTRE A ORIGEM DA MELODIA.");
            this.callbacks.onCheckpoint("jackChamber");
        }
        if (this.phase === "daniel" && Vector3.Distance(position, this.checkpoints.danielRoom) < 7 && this.danielItemsCollected === 0) {
            this.objective.set("inspect-daniel-room", "EXAMINE DANIEL E RECOLHA O EQUIPAMENTO PRÓXIMO.");
        }
        if (this.phase === "generators") {
            const nearestGenerator = [1, 2, 3, 4, 5]
                .map((index) => ({ index, distance: Vector3.Distance(position, this.checkpoints[`generator${index}`]) }))
                .sort((a, b) => a.distance - b.distance)[0];
            if (nearestGenerator && nearestGenerator.distance < 9)
                this.lastSafeCheckpoint = `generator-${nearestGenerator.index}`;
        }
    }
    tryGenerator1() {
        if (!this.accessCardObtained && !this.inventory.has("generatorAccessCard")) {
            this.ui.toast("O sistema permanece bloqueado sem o cartão técnico.");
            return;
        }
        const routeCorrect = this.cableRoute.join(",") === "2,0,1";
        const breakersCorrect = this.breakerStates.join(",") === "true,true,false";
        if (!routeCorrect || !breakersCorrect) {
            this.generator1Attempts += 1;
            this.audio.electricalSnap(this.checkpoints.generator1, 1.2);
            this.emitNoise("failure", 0.85 + this.generator1Attempts * 0.08, "electrical", this.checkpoints.generator1, 2.5);
            this.ui.toast(routeCorrect ? "A rota está correta, mas a proteção de voltagem não." : "A voltagem retorna pelo terminal errado.");
            return;
        }
        this.completeGenerator(0);
    }
    interactComponentSlot(slot) {
        if (slot.installed) {
            this.inventory.add(CHAPTER3_ITEMS[slot.installed]);
            this.selectedComponent = slot.installed;
            slot.installed = "";
            slot.mesh.material = this.materials.get("metal", 21);
            this.ui.toast("Peça removida e devolvida à bancada.");
            return;
        }
        if (!this.selectedComponent || !this.inventory.has(this.selectedComponent)) {
            this.ui.toast("Selecione uma peça que esteja na bancada.");
            return;
        }
        slot.installed = this.selectedComponent;
        this.inventory.remove(this.selectedComponent);
        slot.mesh.material = this.materials.get("plastic", 20 + this.componentOrder.indexOf(slot.installed));
        this.audio.electricalSnap(slot.mesh.position, 0.3);
        const remaining = this.componentOrder.filter((id) => this.inventory.has(id));
        this.selectedComponent = remaining[0] ?? "";
    }
    tryGenerator2() {
        if (this.componentSlots.some((slot) => !slot.installed)) {
            this.ui.toast("Ainda existem encaixes vazios.");
            return;
        }
        const correct = this.componentSlots.every((slot, index) => slot.installed === this.componentOrder[index]);
        if (!correct) {
            this.audio.electricalSnap(this.checkpoints.generator2, 1);
            this.emitNoise("failure", 0.9, "electrical", this.checkpoints.generator2, 2.5);
            this.ui.toast("A montagem gira fora de fase. Remova as peças incorretas.");
            return;
        }
        this.completeGenerator(1);
    }
    tryGenerator3() {
        if (!this.minibossDefeated) {
            this.ui.toast("O experimento bloqueia o painel de manutenção.");
            return;
        }
        if (!this.gasVents.every(Boolean) || this.gasConcentration > 0.2) {
            this.ui.toast("A concentração de gás ainda está acima do limite seguro.");
            return;
        }
        if (!this.inventory.has("gasSeal")) {
            this.ui.toast("A linha rompida precisa de uma nova vedação.");
            return;
        }
        this.inventory.remove("gasSeal");
        this.gasGeneratorRepaired = true;
        this.completeGenerator(2);
    }
    pressMelodyNote(index, position) {
        this.audio.playMusicNote(index, position);
        this.melodyInput.push(index);
        if (this.melodyInput.length > this.correctMelody.length)
            this.melodyInput.shift();
        this.emitNoise("machine", 0.18, "metal", position);
        this.ui.toast(`Sequência: ${this.melodyInput.map((note) => note + 1).join(" · ")}`, 1600);
    }
    playMelodyClue() {
        const clue = [...this.correctMelody].reverse();
        clue.forEach((note, index) => window.setTimeout(() => this.audio.playMusicNote(note, this.melodyPlayback.position, true), index * 430));
        this.emitNoise("machine", 0.36, "metal", this.melodyPlayback.position, 3.2);
        this.ui.showSoundCaption("o cilindro toca fragmentos invertidos da melodia");
    }
    tryGenerator4() {
        const correct = this.melodyInput.length === this.correctMelody.length
            && this.melodyInput.every((note, index) => note === this.correctMelody[index]);
        if (!correct) {
            this.melodyInput.length = 0;
            this.audio.startJesseMelody("detuned", this.checkpoints.generator4);
            this.emitNoise("failure", 1.18, "metal", this.checkpoints.generator4, 4);
            this.ui.toast("O cilindro trava e reproduz a sequência errada pelo sistema de som.");
            if (!this.settings.extendedPuzzleWindows)
                this.jesse.forceSearch(this.checkpoints.generator4);
            return;
        }
        this.melodySolved = true;
        this.completeGenerator(3);
    }
    completeGenerator(index) {
        if (this.generatorStates[index])
            return;
        this.generatorStates[index] = true;
        const rig = this.generators[index];
        if (rig) {
            rig.running = true;
            rig.light.diffuse = new Color3(0.22, 0.9, 0.35);
            rig.light.intensity = 1.4;
            rig.console.material = this.materials.emissive(`generator-${index + 1}-complete-material`, new Color3(0.18, 0.78, 0.28), 0.9);
            this.audio.generatorStart(rig.root.position);
            this.emitNoise("machine", 1.05, "metal", rig.root.position, 4.5);
        }
        const count = this.generatorStates.filter(Boolean).length;
        this.ui.toast(`GERADOR ${index + 1} ATIVO · ${count}/5`, 4200);
        this.objective.set("activate-five-generators", this.generatorObjectiveText());
        this.lastSafeCheckpoint = `generator-${index + 1}`;
        this.callbacks.onCheckpoint(this.lastSafeCheckpoint);
        if (count === 4 && !this.generatorStates[4]) {
            this.objective.set("reach-generator5", "ALCANCE O GERADOR FINAL. ELE EXIGE DUAS PESSOAS.");
            this.audio.startJesseMelody("distant", this.checkpoints.generator5);
        }
    }
    startMayaAssistance() {
        this.mayaEncounterState = "assisting";
        this.phase = "maya";
        this.mayaSequence = 0;
        this.mimic.setPosition(this.checkpoints.mayaChamber.add(new Vector3(0, 0, 1.5)), Math.PI);
        this.mimic.setVisible(true);
        this.mimic.setIdentity("maya", true);
        this.mimic.setMayaInjuredPose();
        this.jesse.stop();
        this.audio.stopJesseMelody();
        this.player.setEnabled(true);
        this.objective.set("talk-to-maya", "APROXIME-SE DE MAYA E ATIVE O GERADOR FINAL.");
        this.callbacks.onCheckpoint("maya-reveal");
    }
    activateGenerator5() {
        if (this.generatorStates[4])
            return;
        this.generator5PlayerLever.rotation.x = -0.6;
        this.generatorStates[4] = true;
        this.completeGeneratorVisualOnly(4);
        this.emitNoise("machine", 1.35, "metal", this.checkpoints.generator5, 5);
        this.ui.showSoundCaption("os cinco geradores entram em sincronia");
        this.objective.set("watch-maya", "OBSERVE MAYA.");
    }
    completeGeneratorVisualOnly(index) {
        const rig = this.generators[index];
        if (!rig)
            return;
        rig.running = true;
        rig.light.diffuse = new Color3(0.22, 0.9, 0.35);
        rig.light.intensity = 1.5;
        rig.console.material = this.materials.emissive(`generator-${index + 1}-complete-material`, new Color3(0.18, 0.78, 0.28), 0.9);
        this.audio.generatorStart(rig.root.position);
        this.callbacks.onCheckpoint("generator-5");
    }
    completeChase() {
        if (this.chaseComplete)
            return;
        this.chaseComplete = true;
        this.phase = "daniel";
        this.chaseElevatorClosing = false;
        this.jesse.stop();
        this.audio.stopJesseChase();
        this.audio.stopJesseMelody();
        this.player.teleport(this.checkpoints.danielRoom.clone(), Math.PI);
        this.player.setEnabled(true);
        this.objective.set("inspect-daniel-room", "EXAMINE DANIEL E RECOLHA O EQUIPAMENTO PRÓXIMO.");
        this.ui.showSoundCaption("o elevador sobe um único nível e para bruscamente");
        this.callbacks.onCheckpoint("daniel");
        this.lastSafeCheckpoint = "daniel";
    }
    updateDanielObjective() {
        const required = [this.clubOwned, this.replacementTorchOwned, this.danielRecording];
        const count = required.filter(Boolean).length;
        if (count < 3) {
            this.objective.set("collect-daniel-items", `RECOLHA O EQUIPAMENTO DE DANIEL. ${count}/3`);
            return;
        }
        this.phase = "generators";
        this.objective.set("activate-five-generators", this.generatorObjectiveText());
        this.jesse.beginExploration();
        this.ui.toast("O medidor discreto indica quanto ruído o setor acumulou.", 5200);
        this.callbacks.onCheckpoint("daniel");
    }
    generatorObjectiveText() {
        return `ATIVE OS CINCO GERADORES. ${this.generatorStates.filter(Boolean).length}/5`;
    }
    onNoiseThreshold() {
        if (!this.active || this.phase !== "generators" || this.hiddenSpot || this.debugForceJesse)
            return;
        this.lightReaction = 2.6;
        this.audio.startJesseMelody("danger", this.player.collider.position.subtract(this.player.forward().scale(14)));
        this.ui.showSoundCaption("lâmpadas vibram no ritmo da melodia de Jesse");
        const strongest = this.noise.strongest(this.player.collider.position, 60);
        this.jesse.forceSearch(strongest?.position ?? this.player.collider.position.clone());
    }
    updateDangerLights(deltaSeconds, danger) {
        this.lightReaction = Math.max(0, this.lightReaction - deltaSeconds);
        const reactive = this.lightReaction > 0 || danger > 72;
        this.lights.forEach((light, index) => {
            if (reactive)
                light.intensity = 0.2 + Math.abs(Math.sin(performance.now() * 0.012 + index)) * 0.65;
            else
                light.intensity += (0.55 - light.intensity) * Math.min(1, deltaSeconds * 3);
        });
    }
    handleJesseCaught(reason) {
        this.ui.flashDamage(1);
        this.audio.impact(1.25);
        this.player.damage(reason === "chase" ? 100 : 42);
        if (reason === "chase") {
            const checkpointPosition = this.chaseRoute[this.chaseCheckpoint] ?? this.checkpoints.chase1;
            this.player.health = Math.max(35, this.player.health);
            this.player.teleport(checkpointPosition.clone(), Math.PI);
            this.player.setEnabled(true);
            const jessePosition = checkpointPosition.subtract(new Vector3(0, 0, 11));
            this.jesse.resetChase(jessePosition, this.chaseCheckpoint);
            this.ui.toast("A perseguição reiniciou no último ponto seguro.");
            this.callbacks.onPlayerDamaged();
        }
        else {
            this.player.health = Math.max(28, this.player.health);
            this.player.teleport(this.destinationForCheckpoint(this.lastSafeCheckpoint), Math.PI);
            this.player.setEnabled(true);
            this.hiddenSpot = null;
            this.hidingSpots.forEach((spot) => spot.occupied = false);
            this.jesse.setPlayerHidden(false, null);
            this.jesse.beginExploration();
            this.noise.clearDanger(100);
            this.ui.toast("Você desperta no último setor estabilizado.");
            this.callbacks.onPlayerDamaged();
        }
    }
    damagePlayer(amount, message) {
        this.player.damage(amount);
        this.ui.flashDamage(Math.min(1, amount / 22));
        this.ui.toast(message);
        if (this.player.health <= 0) {
            this.player.health = 42;
            this.player.teleport(this.destinationForCheckpoint(this.lastSafeCheckpoint), Math.PI);
            this.noise.clearDanger(80);
            this.callbacks.onPlayerDamaged();
        }
    }
    beginTraversal(obstacle) {
        obstacle.completed = true;
        this.player.setEnabled(false);
        this.traversalMotion = {
            type: obstacle.type,
            elapsed: 0,
            duration: this.settings.simplifiedChase ? 0.42 : obstacle.type === "vault" ? 0.68 : 0.78,
            start: this.player.collider.position.clone(),
            end: obstacle.end.clone()
        };
        if (obstacle.type === "slide")
            obstacle.mesh.position.y += 0.7;
        this.setChaseCheckpoint(obstacle.checkpoint);
    }
    setChaseCheckpoint(index) {
        const safe = Math.max(this.chaseCheckpoint, Math.min(4, index));
        if (safe === this.chaseCheckpoint)
            return;
        this.chaseCheckpoint = safe;
        this.callbacks.onCheckpoint(`jesse-chase-${safe}`);
    }
    toggleHidingSpot(spot) {
        if (this.hiddenSpot && this.hiddenSpot !== spot)
            return;
        if (!spot.occupied) {
            spot.occupied = true;
            this.hiddenSpot = spot;
            this.player.teleport(spot.inside, this.player.camera.rotation.y);
            this.player.setEnabled(false);
            this.fire.torchLit = false;
            this.jesse.setPlayerHidden(true, spot.inside);
            spot.door.rotation.y = 0.03;
            this.ui.showSoundCaption("você prende a respiração dentro do armário");
            this.noise.clearDanger(14);
        }
        else {
            spot.occupied = false;
            this.hiddenSpot = null;
            this.player.teleport(spot.outside, this.player.camera.rotation.y);
            this.player.setEnabled(true);
            this.jesse.setPlayerHidden(false, null);
            spot.door.rotation.y = -0.9;
            this.emitNoise("door", 0.24, "metal", spot.door.position);
        }
    }
    emitNoise(category, intensity, material, position, duration) {
        this.noise.emit({ category, intensity, material, position, duration });
    }
    isPathObstructed(from, to) {
        const direction = to.subtract(from);
        const distance = direction.length();
        if (distance < 0.1)
            return false;
        direction.normalize();
        const pick = this.scene.pickWithRay(new Ray(from.add(new Vector3(0, 1.2, 0)), direction, distance), (mesh) => mesh.checkCollisions && mesh.isEnabled() && mesh !== this.player.collider && !mesh.name.startsWith("jesse"));
        return Boolean(pick?.hit && pick.distance < distance - 0.4);
    }
    playerInGasRoom() {
        return Vector3.Distance(this.player.collider.position, this.checkpoints.generator3) < 15;
    }
    createRoomShell(name, center, width, depth, height, wallMaterial, floorMaterial, openings = []) {
        const floor = MeshBuilder.CreateBox(`${name}-floor`, { width, height: 0.25, depth }, this.scene);
        floor.parent = this.root;
        floor.position = center.add(new Vector3(0, -0.125, 0));
        floor.material = floorMaterial;
        floor.checkCollisions = true;
        const ceiling = MeshBuilder.CreateBox(`${name}-ceiling`, { width, height: 0.25, depth }, this.scene);
        ceiling.parent = this.root;
        ceiling.position = center.add(new Vector3(0, height, 0));
        ceiling.material = wallMaterial;
        ceiling.checkCollisions = true;
        const segments = [
            { side: "north", pos: new Vector3(0, height / 2, depth / 2), size: { width, height, depth: 0.35 } },
            { side: "south", pos: new Vector3(0, height / 2, -depth / 2), size: { width, height, depth: 0.35 } },
            { side: "east", pos: new Vector3(width / 2, height / 2, 0), size: { width: 0.35, height, depth } },
            { side: "west", pos: new Vector3(-width / 2, height / 2, 0), size: { width: 0.35, height, depth } }
        ];
        segments.forEach((segment) => {
            if (openings.includes(segment.side)) {
                const horizontal = segment.side === "north" || segment.side === "south";
                const total = horizontal ? width : depth;
                const opening = 5.2;
                const piece = (total - opening) / 2;
                [-1, 1].forEach((side) => {
                    const wall = MeshBuilder.CreateBox(`${name}-${segment.side}-wall-${side}`, horizontal
                        ? { width: piece, height, depth: 0.35 }
                        : { width: 0.35, height, depth: piece }, this.scene);
                    wall.parent = this.root;
                    const offset = (opening / 2 + piece / 2) * side;
                    wall.position = center.add(segment.pos).add(horizontal ? new Vector3(offset, 0, 0) : new Vector3(0, 0, offset));
                    wall.material = wallMaterial;
                    wall.checkCollisions = true;
                });
            }
            else {
                const wall = MeshBuilder.CreateBox(`${name}-${segment.side}-wall`, segment.size, this.scene);
                wall.parent = this.root;
                wall.position = center.add(segment.pos);
                wall.material = wallMaterial;
                wall.checkCollisions = true;
            }
        });
    }
    createCorridor(name, center, width, depth, wallMaterial, floorMaterial, rotationY = 0) {
        const root = new TransformNode(name, this.scene);
        root.parent = this.root;
        root.position.copyFrom(center);
        root.rotation.y = rotationY;
        const floor = MeshBuilder.CreateBox(`${name}-floor`, { width, height: 0.22, depth }, this.scene);
        floor.parent = root;
        floor.position.y = -0.11;
        floor.material = floorMaterial;
        floor.checkCollisions = true;
        const ceiling = MeshBuilder.CreateBox(`${name}-ceiling`, { width, height: 0.2, depth }, this.scene);
        ceiling.parent = root;
        ceiling.position.y = 5.4;
        ceiling.material = wallMaterial;
        ceiling.checkCollisions = true;
        [-1, 1].forEach((side) => {
            const wall = MeshBuilder.CreateBox(`${name}-wall-${side}`, { width: 0.3, height: 5.5, depth }, this.scene);
            wall.parent = root;
            wall.position = new Vector3(side * width / 2, 2.7, 0);
            wall.material = wallMaterial;
            wall.checkCollisions = true;
        });
    }
    createDoor(name, position, slide, lockable) {
        const mesh = MeshBuilder.CreateBox(name, { width: 5, height: 4, depth: 0.32 }, this.scene);
        mesh.parent = this.root;
        mesh.position.copyFrom(position);
        const sideWallDoor = Math.abs(slide.z) > Math.abs(slide.x) && Math.abs(slide.z) > Math.abs(slide.y);
        mesh.rotation.y = sideWallDoor ? Math.PI / 2 : 0;
        mesh.material = this.materials.get("metal", 19);
        mesh.checkCollisions = true;
        // Slide the leaf into the wall instead of lifting it through the lintel.
        // The movement is derived from the wall orientation, never from the old
        // authored offset, so every door opens in the plane of its own bulkhead.
        const bulkheadSpan = name.startsWith("maintenance-door") ? 8 : 7;
        const blocker = this.createDoorFrame(name, position, 5, 4, mesh.rotation.y, bulkheadSpan, 5.5);
        const travel = 5.65;
        const openOffset = Math.abs(mesh.rotation.y) > 0.1 ? new Vector3(0, 0, -travel) : new Vector3(travel, 0, 0);
        const rig = { mesh, blocker, open: false, basePosition: position.clone(), slide: openOffset, lockable };
        this.doors.push(rig);
        return rig;
    }
    createDoorFrame(name, position, width, height, rotationY, openingSpan = width, wallHeight = 5.5) {
        const frame = new TransformNode(`${name}-frame-root`, this.scene);
        frame.parent = this.root;
        frame.position.copyFrom(position);
        frame.rotation.y = rotationY;
        const material = this.materials.get("metal", 20 + this.doors.length);
        const make = (suffix, size, local, collisions = true) => {
            const part = MeshBuilder.CreateBox(`${name}-frame-${suffix}`, size, this.scene);
            part.parent = frame;
            part.position.copyFrom(local);
            part.material = material;
            part.checkCollisions = collisions;
            part.isPickable = false;
            part.metadata = { doorFrame: true, interactionPassthrough: true };
        };
        const jamb = 0.3;
        make("left", { width: jamb, height: height + 0.45, depth: 0.62 }, new Vector3(-width / 2 - jamb / 2, 0, 0));
        make("right", { width: jamb, height: height + 0.45, depth: 0.62 }, new Vector3(width / 2 + jamb / 2, 0, 0));
        make("lintel", { width: width + jamb * 2, height: 0.3, depth: 0.62 }, new Vector3(0, height / 2 + 0.15, 0));
        make("threshold", { width: width + jamb * 2, height: 0.08, depth: 0.62 }, new Vector3(0, -height / 2 + 0.04, 0), false);
        const wingWidth = Math.max(0, (openingSpan - width - jamb * 2) / 2);
        const wallCenterY = wallHeight / 2 - position.y;
        if (wingWidth > 0.03) {
            make("bulkhead-left", { width: wingWidth, height: wallHeight, depth: 0.62 }, new Vector3(-width / 2 - jamb - wingWidth / 2, wallCenterY, 0));
            make("bulkhead-right", { width: wingWidth, height: wallHeight, depth: 0.62 }, new Vector3(width / 2 + jamb + wingWidth / 2, wallCenterY, 0));
        }
        const upperHeight = Math.max(0, wallHeight - (position.y + height / 2));
        if (upperHeight > 0.08)
            make("bulkhead-upper", { width: Math.max(openingSpan, width + jamb * 2), height: upperHeight, depth: 0.62 }, new Vector3(0, height / 2 + upperHeight / 2, 0));
        const blocker = MeshBuilder.CreateBox(`${name}-doorway-blocker`, { width: Math.max(openingSpan, width + 0.72), height: wallHeight, depth: 1.15 }, this.scene);
        blocker.position.y = wallCenterY;
        blocker.parent = frame;
        blocker.visibility = 0;
        blocker.isPickable = false;
        blocker.checkCollisions = true;
        blocker.metadata = { doorwayBlocker: true, interactionPassthrough: true };
        return blocker;
    }
    toggleDoor(door) {
        door.open = !door.open;
        door.mesh.position.copyFrom(door.open ? door.basePosition.add(door.slide) : door.basePosition);
        door.mesh.checkCollisions = !door.open;
        door.blocker.setEnabled(!door.open);
        door.blocker.checkCollisions = !door.open;
        this.audio.impact(0.45);
        this.emitNoise("door", door.open ? 0.42 : 0.68, "metal", door.mesh.position);
    }
    createGeneratorRig(index, position) {
        const root = new TransformNode(`generator-${index + 1}-root`, this.scene);
        root.parent = this.root;
        root.position.copyFrom(position);
        const base = MeshBuilder.CreateBox(`generator-${index + 1}-base`, { width: 5, height: 2.8, depth: 2.4 }, this.scene);
        base.parent = root;
        base.position.y = 1.4;
        base.material = this.materials.get("metal", 40 + index);
        base.checkCollisions = true;
        const rotor = MeshBuilder.CreateCylinder(`generator-${index + 1}-rotor`, { height: 4.2, diameter: 1.2, tessellation: 18 }, this.scene);
        rotor.parent = root;
        rotor.position = new Vector3(0, 2.9, 0);
        rotor.rotation.z = Math.PI / 2;
        rotor.material = this.materials.get("metal", 44 + index);
        const console = MeshBuilder.CreateBox(`generator-${index + 1}-console`, { width: 1.8, height: 1.35, depth: 0.65 }, this.scene);
        console.parent = root;
        console.position = new Vector3(0, 1.1, -1.55);
        console.material = this.materials.get("metal", 47 + index);
        const light = new PointLight(`generator-${index + 1}-status-light`, position.add(new Vector3(0, 3.8, -1)), this.scene);
        light.parent = this.root;
        light.diffuse = new Color3(0.85, 0.12, 0.08);
        light.intensity = 0.5;
        light.range = 8;
        const rig = { root, console, light, running: false };
        this.generators[index] = rig;
        return rig;
    }
    createCollectible(name, item, position, prompt, afterCollect, shape) {
        let mesh;
        if (shape === "club") {
            mesh = MeshBuilder.CreateCylinder(name, { height: 1.45, diameterTop: 0.2, diameterBottom: 0.34, tessellation: 12 }, this.scene);
            mesh.rotation.z = Math.PI / 2;
        }
        else if (shape === "torch") {
            mesh = MeshBuilder.CreateCylinder(name, { height: 0.95, diameter: 0.24, tessellation: 12 }, this.scene);
            mesh.rotation.z = Math.PI / 2;
        }
        else if (shape === "recorder") {
            mesh = MeshBuilder.CreateBox(name, { width: 0.62, height: 0.22, depth: 0.42 }, this.scene);
        }
        else if (shape === "card") {
            mesh = MeshBuilder.CreateBox(name, { width: 0.5, height: 0.05, depth: 0.78 }, this.scene);
        }
        else {
            mesh = MeshBuilder.CreateTorus(name, { diameter: 0.72, thickness: 0.15, tessellation: 18 }, this.scene);
        }
        mesh.parent = this.root;
        mesh.position.copyFrom(position);
        mesh.material = shape === "card" ? this.materials.get("plastic", 18) : this.materials.get("metal", 24);
        this.interaction.register(mesh, {
            prompt,
            enabled: () => mesh.isEnabled() && !this.inventory.has(item.id),
            onInteract: () => {
                if (this.inventory.add(item)) {
                    mesh.setEnabled(false);
                    this.audio.pickup();
                    afterCollect();
                }
            }
        });
        return mesh;
    }
    createComponentMesh(id, position, variant) {
        let mesh;
        if (id === "rotor")
            mesh = MeshBuilder.CreateCylinder(`component-${id}`, { height: 0.9, diameter: 0.72, tessellation: 16 }, this.scene);
        else if (id === "insulator")
            mesh = MeshBuilder.CreateCylinder(`component-${id}`, { height: 0.75, diameterTop: 0.35, diameterBottom: 0.62, tessellation: 14 }, this.scene);
        else if (id === "brush")
            mesh = MeshBuilder.CreateBox(`component-${id}`, { width: 0.8, height: 0.45, depth: 0.55 }, this.scene);
        else if (id === "fuse")
            mesh = MeshBuilder.CreateCapsule(`component-${id}`, { height: 0.85, radius: 0.18, tessellation: 10 }, this.scene);
        else if (id === "regulator")
            mesh = MeshBuilder.CreateSphere(`component-${id}`, { diameter: 0.72, segments: 12 }, this.scene);
        else
            mesh = MeshBuilder.CreateTorus(`component-${id}`, { diameter: 0.82, thickness: 0.18, tessellation: 16 }, this.scene);
        mesh.parent = this.root;
        mesh.position.copyFrom(position);
        mesh.material = id === "insulator" ? this.materials.get("plastic", 20) : this.materials.get("metal", 20 + variant);
        mesh.checkCollisions = false;
        return mesh;
    }
    createMiniboss(position) {
        const collider = MeshBuilder.CreateCapsule("gas-miniboss-collider", { height: 3, radius: 0.75, tessellation: 10 }, this.scene);
        collider.parent = this.root;
        collider.position.copyFrom(position);
        collider.isVisible = false;
        collider.isPickable = false;
        collider.checkCollisions = true;
        collider.ellipsoid = new Vector3(0.7, 1.45, 0.7);
        const root = new TransformNode("gas-miniboss-root", this.scene);
        root.parent = collider;
        root.position.y = -1.5;
        const parts = [];
        const torso = MeshBuilder.CreateCapsule("gas-miniboss-torso", { height: 2.1, radius: 0.68, tessellation: 12 }, this.scene);
        torso.parent = root;
        torso.position.y = 2.15;
        torso.scaling = new Vector3(1.1, 1, 0.8);
        torso.material = this.materials.get("plush", 15);
        torso.metadata = { gasMiniboss: true };
        parts.push(torso);
        const helmet = MeshBuilder.CreateSphere("gas-miniboss-helmet", { diameter: 1.15, segments: 14 }, this.scene);
        helmet.parent = root;
        helmet.position.y = 3.55;
        helmet.material = this.materials.get("glass", 12);
        helmet.metadata = { gasMiniboss: true };
        parts.push(helmet);
        for (let index = 0; index < 4; index += 1) {
            const limb = MeshBuilder.CreateCapsule(`gas-miniboss-limb-${index}`, { height: index < 2 ? 1.55 : 1.75, radius: 0.22, tessellation: 9 }, this.scene);
            limb.parent = root;
            limb.position = new Vector3(index % 2 ? 0.8 : -0.8, index < 2 ? 2.35 : 0.95, 0);
            limb.rotation.z = (index % 2 ? 1 : -1) * (index < 2 ? 0.55 : 0.16);
            limb.material = this.materials.get("metal", 52 + index);
            limb.metadata = { gasMiniboss: true };
            parts.push(limb);
        }
        for (let index = 0; index < 3; index += 1) {
            const hose = MeshBuilder.CreateTorus(`gas-miniboss-hose-${index}`, { diameter: 1.3 + index * 0.2, thickness: 0.1, tessellation: 16 }, this.scene);
            hose.parent = root;
            hose.position = new Vector3(0, 2.5 - index * 0.4, 0.45);
            hose.rotation.x = Math.PI / 2;
            hose.material = this.materials.get("plastic", 23 + index);
            hose.metadata = { gasMiniboss: true };
            parts.push(hose);
        }
        root.setEnabled(false);
        return { root, collider, parts, health: 100, state: "dormant", stateElapsed: 0, attackCooldown: 0, stagger: 0 };
    }
    isMinibossMesh(mesh) {
        let current = mesh;
        while (current) {
            if (current.metadata?.gasMiniboss)
                return true;
            current = current.parent && "uniqueId" in current.parent ? current.parent : null;
        }
        return false;
    }
    damageMiniboss(amount, charged) {
        if (this.miniboss.state === "dead")
            return;
        this.miniboss.health = Math.max(0, this.miniboss.health - amount);
        this.miniboss.state = "staggered";
        this.miniboss.stagger = charged ? 1.35 : 0.58;
        this.miniboss.stateElapsed = 0;
        this.ui.toast(`Experimento de manutenção: ${this.miniboss.health}%`, 1500);
        if (this.miniboss.health <= 0) {
            this.miniboss.state = "dead";
            this.minibossDefeated = true;
            this.miniboss.collider.checkCollisions = false;
            this.miniboss.root.rotation.z = 1.35;
            this.miniboss.root.setEnabled(false);
            this.audio.mannequinBreak(this.miniboss.collider.position);
            this.emitNoise("impact", 1.1, "metal", this.miniboss.collider.position, 2.8);
            this.ui.showSoundCaption("o traje de manutenção desaba e libera gás preso");
            this.callbacks.onCheckpoint("generator-3");
        }
    }
    findBreakable(mesh) {
        let current = mesh;
        while (current) {
            const found = this.breakables.find((entry) => entry.mesh === current);
            if (found)
                return found;
            current = current.parent && "uniqueId" in current.parent ? current.parent : null;
        }
        return null;
    }
    breakBreakable(rig) {
        rig.mesh.checkCollisions = false;
        rig.mesh.isPickable = false;
        rig.mesh.rotation.z = 1.4;
        rig.mesh.position.y = 0.3;
        this.emitNoise("impact", 1, "metal", rig.mesh.position);
    }
    createProceduralSign(name, text, position, rotationY, width, height, warning = false) {
        const texture = new DynamicTexture(`${name}-texture`, { width: 768, height: 256 }, this.scene, false);
        const context = texture.getContext();
        context.fillStyle = warning ? "#c8b449" : "#d5cfb8";
        context.fillRect(0, 0, 768, 256);
        context.fillStyle = warning ? "#261d10" : "#242629";
        context.font = "bold 42px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        const lines = text.split("\n");
        lines.forEach((line, index) => context.fillText(line, 384, 128 + (index - (lines.length - 1) / 2) * 58));
        context.strokeStyle = "rgba(52,45,38,0.55)";
        context.lineWidth = 7;
        for (let index = 0; index < 15; index += 1) {
            context.beginPath();
            context.moveTo(index * 53, 0);
            context.lineTo(index * 53 + 20, 256);
            context.stroke();
        }
        texture.update();
        const material = new PBRMaterial(`${name}-material`, this.scene);
        material.albedoTexture = texture;
        material.roughness = 0.78;
        const sign = MeshBuilder.CreatePlane(name, { width, height }, this.scene);
        sign.parent = this.root;
        sign.position.copyFrom(position);
        sign.rotation.y = rotationY;
        sign.material = material;
        sign.isPickable = false;
        return sign;
    }
    applyRestoredState() {
        this.generatorStates.forEach((running, index) => {
            if (!running)
                return;
            const rig = this.generators[index];
            if (rig) {
                rig.running = true;
                rig.light.diffuse = new Color3(0.22, 0.9, 0.35);
                rig.light.intensity = 1.4;
                rig.console.material = this.materials.emissive(`generator-${index + 1}-restored-material`, new Color3(0.18, 0.78, 0.28), 0.9);
            }
        });
        for (let index = 0; index < this.cableRoute.length; index += 1) {
            const cable = this.scene.getMeshByName(`generator1-cable-${index}`);
            if (cable)
                cable.rotation.z = this.cableRoute[index] * Math.PI / 3;
            const breaker = this.scene.getMeshByName(`generator1-breaker-${index}`);
            if (breaker)
                breaker.rotation.x = this.breakerStates[index] ? -0.45 : 0.45;
            const valve = this.scene.getMeshByName(`gas-vent-wheel-${index}`);
            if (valve)
                valve.rotation.z = this.gasVents[index] ? Math.PI / 2 : 0;
        }
        this.componentSlots.forEach((slot) => {
            if (slot.installed)
                slot.mesh.material = this.materials.get("plastic", 20 + this.componentOrder.indexOf(slot.installed));
        });
        this.componentMeshes.forEach((mesh, id) => {
            const installed = this.componentSlots.some((slot) => slot.installed === id);
            mesh.setEnabled(!installed && !this.inventory.has(id));
        });
        const cardReader = this.scene.getMeshByName("generator1-card-reader");
        if (cardReader && this.accessCardObtained)
            cardReader.material = this.materials.emissive("generator1-reader-restored", new Color3(0.18, 0.8, 0.32), 0.8);
        const gasSeal = this.scene.getMeshByName("gas-seal-item");
        if (gasSeal)
            gasSeal.setEnabled(!this.inventory.has("gasSeal") && !this.gasGeneratorRepaired);
        if (this.generatorStates[4]) {
            this.generator5PlayerLever.rotation.x = -0.6;
            this.generator5MayaLever.rotation.x = -0.6;
        }
        this.documentMeshes.forEach((mesh, id) => mesh.setEnabled(!this.collectedDocuments.has(id)));
        if (this.chaseComplete) {
            this.jackLid.rotation.x = -1.4;
            this.jackLid.position.y += 1.2;
            this.jackLid.checkCollisions = false;
            this.chaseStarted = true;
        }
        if (this.minibossDefeated) {
            this.miniboss.state = "dead";
            this.miniboss.root.setEnabled(false);
            this.miniboss.root.rotation.z = 1.35;
            this.miniboss.collider.checkCollisions = false;
        }
        if (this.clubOwned)
            this.scene.getMeshByName("daniel-metal-club")?.setEnabled(false);
        if (this.replacementTorchOwned)
            this.scene.getMeshByName("daniel-replacement-torch")?.setEnabled(false);
        if (this.danielRecording)
            this.scene.getMeshByName("daniel-recorder")?.setEnabled(false);
        if (this.accessCardObtained)
            this.accessCardMesh.setEnabled(false);
        if (this.mayaEncounterState !== "not-started") {
            this.mimic.setVisible(true);
            this.mimic.setIdentity(this.mayaEncounterState === "revealed" || this.mayaEncounterState === "complete" ? "composite" : "maya", true);
        }
    }
}
