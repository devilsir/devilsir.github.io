import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MirrorTexture } from "@babylonjs/core/Materials/Textures/mirrorTexture";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import { Ray } from "@babylonjs/core/Culling/ray";
import { NoiseSystem } from "../systems/NoiseSystem.js";
import { JesseSystem } from "../entities/JesseSystem.js";
import { NoahCompanion } from "../entities/NoahCompanion.js";
export const CHAPTER5_ITEMS = {
    childhoodToken: { id: "childhoodToken", name: "Ficha infantil", description: "Uma ficha azul com as iniciais do protagonista e marcas de dentes." },
    archiveReel: { id: "archiveReel", name: "Rolo de prova", description: "Filme resgatado dos arquivos durante o incêndio." },
    permanentVisitorFile: { id: "permanentVisitorFile", name: "Arquivo de visitante permanente", description: "Registro parcialmente queimado de uma criança mantida no complexo." }
};
export class Chapter5World {
    checkpoints = {
        entrance: new Vector3(0, 0.12, 1472),
        proof: new Vector3(0, 0.12, 1510),
        employeeArchives: new Vector3(0, 0.12, 1554),
        memoryLab: new Vector3(0, 0.12, 1602),
        archiveCore: new Vector3(0, 0.12, 1652),
        burnedAuditorium: new Vector3(0, 0.12, 1715),
        mannequinTransit: new Vector3(0, 0.12, 1772),
        finalJesse: new Vector3(0, 0.12, 1832),
        burningArchives: new Vector3(0, 0.12, 1892),
        bridge: new Vector3(0, 8.2, 1950),
        finalExit: new Vector3(0, 0.12, 2018),
        authorities: new Vector3(0, 0.12, 2075)
    };
    active = false;
    phase = "approach";
    chapterComplete = false;
    trueEndingDiscovered = false;
    scene;
    materials;
    interaction;
    inventory;
    objective;
    ui;
    audio;
    fire;
    player;
    settings;
    callbacks;
    root;
    noah;
    noise;
    jesse;
    doors = [];
    proofStations = [];
    archiveRecords = [];
    documents = new Set();
    recordings = new Set();
    rescuedDocuments = new Set();
    flashbacksSeen = new Set();
    proofAnswers = new Map();
    bridgeSections = [];
    mannequins = [];
    mirrorTextures = [];
    proofScore = 0;
    proofContradictions = 0;
    proofComplete = false;
    archiveDataAccessed = false;
    experimentRevelationSeen = false;
    protagonistPastRevealed = false;
    collapseStarted = false;
    escapeSegment = 0;
    noahReaderReady = false;
    playerReaderReady = false;
    readerClock = 0;
    jesseChaseActive = false;
    jesseCheckpoint = 0;
    postCreditsSeen = false;
    creditsSeen = false;
    finalDialogueSeen = false;
    finalSequenceLocked = false;
    mimicAttackCount = 0;
    deathCount = 0;
    completionSeconds = 0;
    campaignStartTimestamp = Date.now();
    optionalRescueClock = 0;
    smokeClock = 0;
    mirrorRefreshClock = 0;
    authorityClock = 0;
    finalNose;
    proofBarrier;
    archiveCoreConsole;
    cooperativeDoor;
    noahHeavyHandle;
    bodyBeam;
    blastDoor;
    playerReader;
    noahReader;
    exitDoorLeft;
    exitDoorRight;
    exitDoorBlocker;
    childhoodProjector;
    childhoodToken;
    archiveFireStarted = false;
    mannequinLightOn = true;
    mannequinLightClock = 0;
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
        this.root = new TransformNode("chapter5-root", scene);
        this.noise = new NoiseSystem(scene, materials);
        this.noah = new NoahCompanion(scene, materials, player, audio, {
            onReachedTarget: (tag) => this.handleNoahReachedTarget(tag),
            onStuckRecovery: () => this.ui.showSoundCaption("Noah contorna silenciosamente os destroços", 1400)
        });
        this.jesse = new JesseSystem(scene, materials, player, audio, ui, this.noise, {
            onCaught: () => this.failJesseChase(),
            onStateChanged: (state) => {
                if (state === "chasing")
                    this.ui.showSoundCaption("a melodia acelera atrás de vocês", 1800);
            },
            onChaseCheckpoint: (index) => {
                this.jesseCheckpoint = Math.max(this.jesseCheckpoint, index);
                this.callbacks.onCheckpoint(`chapter5-jesse-${index}`);
            },
            isPathObstructed: (from, to) => this.pathObstructed(from, to)
        });
    }
    build() {
        this.createConnectedArchiveComplex();
        this.createProofOfLifeSequence();
        this.createArchiveRecords();
        this.createMemoryTransferLab();
        this.createCollapseRoute();
        this.createBurnedAuditoriumReturn();
        this.createMannequinReturn();
        this.createFinalJesseRoute();
        this.createBurningArchives();
        this.createMaintenanceBridge();
        this.createFinalExit();
        this.createAuthoritiesExterior();
        this.createFunctionalMirrors();
        this.configureJesse();
        this.root.setEnabled(false);
        this.noah.setVisible(false);
        this.noise.setEnabled(false);
    }
    startFromTransition(mimicAttackCount) {
        this.active = true;
        this.root.setEnabled(true);
        this.phase = "approach";
        this.mimicAttackCount = Math.max(0, mimicAttackCount);
        this.player.setEnabled(false);
        this.player.teleport(this.checkpoints.entrance.clone(), 0);
        this.noah.setVisible(true);
        this.noah.teleport(new Vector3(0, 0.12, 1502), Math.PI);
        this.noah.wait();
        this.noise.setEnabled(true);
        this.audio.stopPrisonDrone();
        this.audio.startInteriorHum();
        this.objective.set("approach-noah", "APROXIME-SE DA VOZ SEM BAIXAR A GUARDA.");
        this.callbacks.onCheckpoint("chapter5-entrance");
        this.ui.showSubtitle("Noah", "Para aí. Não chega mais perto. Eu não sei se você é você.", 5200);
        this.audio.noahCue(this.noah.position);
        window.setTimeout(() => {
            this.player.setEnabled(true);
            this.ui.toast("Use espelhos, gravações e lembranças para testar a identidade.", 4600);
        }, 1200);
    }
    restore(save, checkpoint) {
        this.active = true;
        this.root.setEnabled(true);
        this.phase = save.phase;
        this.proofScore = save.proofScore;
        this.proofContradictions = save.proofContradictions;
        this.proofComplete = save.proofComplete;
        this.archiveDataAccessed = save.archiveDataAccessed;
        this.experimentRevelationSeen = save.experimentRevelationSeen;
        this.protagonistPastRevealed = save.protagonistPastRevealed;
        this.collapseStarted = save.collapseStarted;
        this.escapeSegment = save.escapeSegment;
        this.jesseCheckpoint = save.jesseCheckpoint;
        this.trueEndingDiscovered = save.trueEndingDiscovered;
        this.creditsSeen = save.creditsSeen;
        this.postCreditsSeen = save.postCreditsSeen;
        this.chapterComplete = save.chapterComplete;
        this.mimicAttackCount = save.mimicAttackCount;
        this.deathCount = save.deathCount;
        this.completionSeconds = save.completionSeconds;
        this.campaignStartTimestamp = Date.now() - Math.round(save.completionSeconds * 1000);
        save.documents.forEach((id) => this.documents.add(id));
        save.recordings.forEach((id) => this.recordings.add(id));
        save.rescuedDocuments.forEach((id) => this.rescuedDocuments.add(id));
        save.flashbacksSeen.forEach((id) => this.flashbacksSeen.add(id));
        save.proofAnswers.forEach(([key, value]) => this.proofAnswers.set(key, value));
        this.noah.restore(save.noah);
        this.noise.setEnabled(true);
        this.applyPersistentVisualState();
        const destination = this.destinationForCheckpoint(checkpoint);
        this.player.teleport(destination, 0);
        this.player.setEnabled(true);
        if (save.jesseChaseActive)
            this.startFinalJesseChase(Math.max(0, save.jesseCheckpoint));
        if (save.phase === "credits")
            this.beginCredits();
        else if (save.phase === "post-credits")
            this.beginPostCredits();
        else if (save.phase === "complete")
            this.callbacks.onChapterComplete();
    }
    serialize() {
        this.completionSeconds = Math.max(this.completionSeconds, (Date.now() - this.campaignStartTimestamp) / 1000);
        return {
            phase: this.phase,
            proofScore: this.proofScore,
            proofContradictions: this.proofContradictions,
            proofComplete: this.proofComplete,
            proofAnswers: [...this.proofAnswers.entries()],
            archiveDataAccessed: this.archiveDataAccessed,
            experimentRevelationSeen: this.experimentRevelationSeen,
            protagonistPastRevealed: this.protagonistPastRevealed,
            documents: [...this.documents],
            recordings: [...this.recordings],
            rescuedDocuments: [...this.rescuedDocuments],
            flashbacksSeen: [...this.flashbacksSeen],
            collapseStarted: this.collapseStarted,
            escapeSegment: this.escapeSegment,
            jesseChaseActive: this.jesseChaseActive,
            jesseCheckpoint: this.jesseCheckpoint,
            noah: this.noah.serialize(),
            mimicAttackCount: this.mimicAttackCount,
            deathCount: this.deathCount,
            completionSeconds: this.completionSeconds,
            trueEndingDiscovered: this.trueEndingDiscovered,
            creditsSeen: this.creditsSeen,
            postCreditsSeen: this.postCreditsSeen,
            chapterComplete: this.chapterComplete
        };
    }
    update(deltaSeconds) {
        if (!this.active)
            return;
        this.completionSeconds = Math.max(this.completionSeconds, (Date.now() - this.campaignStartTimestamp) / 1000);
        this.noah.update(deltaSeconds);
        this.noise.update(deltaSeconds);
        if (this.jesseChaseActive)
            this.jesse.update(deltaSeconds);
        this.audio.updateListener(this.player.camera.globalPosition, this.player.forward());
        this.updateDoors(deltaSeconds);
        this.updateProofSequence();
        this.updateArchiveProgress();
        this.updateCollapse(deltaSeconds);
        this.updateMannequinReturn(deltaSeconds);
        this.updateBridge(deltaSeconds);
        this.updateFinalReaders(deltaSeconds);
        this.updateMirrors(deltaSeconds);
        this.updateAuthorities(deltaSeconds);
    }
    applySettings(settings) {
        this.settings = settings;
        this.jesse.configure(this.jesseNodes(), settings.simplifiedChase);
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
        if (objectiveId === "prove-life") {
            const pending = this.proofStations.filter((station) => !station.used).map((station) => station.mesh.getAbsolutePosition().clone());
            return nearest(pending, this.checkpoints.proof);
        }
        if (objectiveId === "search-archives") {
            const unread = this.archiveRecords.filter((record) => !this.documents.has(record.id)).map((record) => record.mesh.getAbsolutePosition().clone());
            return nearest(unread, this.checkpoints.employeeArchives);
        }
        if (objectiveId === "find-own-file") {
            if (!this.documents.has("protagonist-file"))
                return meshPoint("archive-record-protagonist-file", this.checkpoints.employeeArchives);
            if (!this.flashbacksSeen.has("film-fragment") && !this.flashbacksSeen.has("token-memory")) {
                return nearest([
                    meshPoint("childhood-projector", this.checkpoints.memoryLab),
                    this.inventory.has("childhoodToken") ? null : meshPoint("childhood-token", this.checkpoints.memoryLab)
                ], this.checkpoints.memoryLab);
            }
            return meshPoint("archive-core-console", this.checkpoints.archiveCore);
        }
        if (objectiveId === "recover-memory") {
            const pending = [];
            if (!this.flashbacksSeen.has("film-fragment"))
                pending.push(meshPoint("childhood-projector", this.checkpoints.memoryLab));
            if (!this.flashbacksSeen.has("token-memory") && !this.inventory.has("childhoodToken"))
                pending.push(meshPoint("childhood-token", this.checkpoints.memoryLab));
            if (this.canAccessArchiveCore() && !this.archiveDataAccessed)
                pending.push(meshPoint("archive-core-console", this.checkpoints.archiveCore));
            return nearest(pending, this.checkpoints.memoryLab);
        }
        if (objectiveId === "synchronized-exit")
            return this.playerReaderReady ? meshPoint("final-noah-reader", this.checkpoints.finalExit) : meshPoint("final-player-reader", this.checkpoints.finalExit);
        return null;
    }
    destinationForCheckpoint(checkpoint) {
        if (checkpoint.startsWith("chapter5-jesse"))
            return this.checkpoints.finalJesse.clone();
        if (checkpoint === "chapter5-proof")
            return this.checkpoints.proof.clone();
        if (checkpoint === "chapter5-archives")
            return this.checkpoints.employeeArchives.clone();
        if (checkpoint === "chapter5-memory")
            return this.checkpoints.memoryLab.clone();
        if (checkpoint === "chapter5-collapse")
            return this.checkpoints.archiveCore.clone();
        if (checkpoint === "chapter5-body-return")
            return this.checkpoints.burnedAuditorium.clone();
        if (checkpoint === "chapter5-mannequin-return")
            return this.checkpoints.mannequinTransit.clone();
        if (checkpoint === "chapter5-burning-archives")
            return this.checkpoints.burningArchives.clone();
        if (checkpoint === "chapter5-bridge")
            return this.checkpoints.bridge.clone();
        if (checkpoint === "chapter5-exit")
            return this.checkpoints.finalExit.clone();
        if (checkpoint === "chapter5-authorities" || checkpoint === "true-ending")
            return this.checkpoints.authorities.clone();
        return this.checkpoints.entrance.clone();
    }
    commandNoah(command) {
        if (!this.noah.active || !this.proofComplete) {
            this.ui.toast("Noah ainda não confia em você o suficiente.");
            return;
        }
        if (command === "follow") {
            this.noah.setFollow();
            this.ui.toast("NOAH: ME SIGA.", 1200);
        }
        else if (command === "wait") {
            this.noah.wait();
            this.ui.toast("NOAH: ESPERE AQUI.", 1200);
        }
        else if (command === "move") {
            const target = this.player.camera.globalPosition.add(this.player.forward().scale(6));
            target.y = this.player.collider.position.y;
            this.noah.moveTo(target, "player-mark");
            this.ui.toast("NOAH: VÁ ATÉ O PONTO MARCADO.", 1400);
        }
        else if (command === "distract") {
            const target = this.player.camera.globalPosition.add(this.player.forward().scale(8));
            target.y = this.player.collider.position.y;
            this.noah.distract(target);
            this.noise.emit({ position: target, intensity: 0.72, category: "distraction", material: "metal", range: 24 });
            this.ui.toast("NOAH: DISTRAIA.", 1200);
        }
    }
    handleContextAction() {
        if (!this.active || !this.proofComplete)
            return false;
        const distance = Vector3.Distance(this.player.collider.position, this.noah.position);
        if (distance > 4.5) {
            this.commandNoah("follow");
            return true;
        }
        this.ui.showTacticalActions([
            { id: "follow", label: "NOAH: ME SIGA" },
            { id: "wait", label: "NOAH: ESPERE" },
            { id: "move", label: "NOAH: VÁ ATÉ LÁ" },
            { id: "distract", label: "NOAH: DISTRAIA" }
        ], (action) => {
            this.ui.hideTacticalActions();
            if (["follow", "wait", "move", "distract"].includes(action))
                this.commandNoah(action);
        });
        return true;
    }
    handlePrimaryAttack(charged) {
        if (!this.active || !this.inventory.has("metalClub"))
            return false;
        const cost = charged ? 26 : 12;
        if (!this.player.consumeStamina(cost)) {
            this.ui.toast("Você está sem fôlego.", 900);
            return true;
        }
        this.audio.clubSwing(charged);
        this.noise.emit({
            position: this.player.camera.globalPosition,
            intensity: charged ? 0.92 : 0.58,
            category: "attack",
            material: "metal",
            range: charged ? 28 : 17
        });
        const ray = this.player.camera.getForwardRay(charged ? 3.2 : 2.5);
        const pick = this.scene.pickWithRay(ray, (mesh) => mesh.isPickable && mesh.isVisible && mesh.isEnabled());
        if (pick?.hit && pick.pickedMesh) {
            this.audio.clubImpact(pick.pickedPoint ?? this.player.camera.globalPosition, pick.pickedMesh.name.includes("metal") ? "metal" : "concrete", charged);
            if (pick.pickedMesh.name.includes("final-obstacle"))
                pick.pickedMesh.setEnabled(false);
        }
        return true;
    }
    emitPlayerMovementNoise(intensity, surface, sprinting, crouching) {
        if (!this.active || !this.collapseStarted)
            return;
        this.noise.emit({
            position: this.player.collider.position,
            intensity: crouching ? intensity * 0.32 : sprinting ? intensity * 1.2 : intensity * 0.58,
            category: crouching ? "crouch" : sprinting ? "sprint" : "footstep",
            material: surface,
            range: crouching ? 5 : sprinting ? 19 : 9
        });
    }
    throwObject() {
        if (!this.active || !this.inventory.has("metalCan"))
            return false;
        const position = this.player.camera.globalPosition.add(this.player.forward().scale(8));
        position.y = this.player.collider.position.y + 0.2;
        this.audio.metalLure(position, 0.82);
        this.noise.emit({ position, intensity: 0.86, category: "distraction", material: "metal", range: 26 });
        this.ui.showSoundCaption("a lata quica longe pelos arquivos", 1500);
        return true;
    }
    canUseTorch() {
        return this.active && this.phase !== "credits" && this.phase !== "post-credits" && this.phase !== "complete";
    }
    enableForDebug() {
        this.active = true;
        this.root.setEnabled(true);
        this.noah.setVisible(true);
        this.noah.teleport(this.player.collider.position.add(new Vector3(2, 0, 0)));
        this.noah.setFollow();
        this.proofComplete = true;
        this.phase = "archives";
        this.player.setEnabled(true);
        this.noise.setEnabled(true);
    }
    debugTeleport(destination) {
        this.enableForDebug();
        this.player.teleport(this.checkpoints[destination].clone(), 0);
        if (destination === "finalJesse")
            this.startFinalJesseChase(0);
    }
    debugSetNoah(command) {
        this.enableForDebug();
        this.commandNoah(command);
    }
    debugTriggerTrueEnding() {
        this.enableForDebug();
        this.proofComplete = true;
        this.archiveDataAccessed = true;
        this.collapseStarted = true;
        this.phase = "authorities";
        this.player.teleport(this.checkpoints.authorities.clone(), 0);
        this.noah.teleport(this.checkpoints.authorities.add(new Vector3(2, 0, 3)));
        this.noah.wait();
        this.finishTrueEnding();
    }
    debugInspect() {
        return JSON.stringify({
            phase: this.phase,
            proofScore: this.proofScore,
            proofContradictions: this.proofContradictions,
            proofComplete: this.proofComplete,
            documents: [...this.documents],
            flashbacks: [...this.flashbacksSeen],
            collapseStarted: this.collapseStarted,
            escapeSegment: this.escapeSegment,
            jesse: this.jesse.inspect(),
            noah: this.noah.serialize(),
            endings: { trueEnding: this.trueEndingDiscovered, credits: this.creditsSeen, postCredits: this.postCreditsSeen },
            statistics: { deathCount: this.deathCount, completionSeconds: this.completionSeconds, mimicAttackCount: this.mimicAttackCount }
        }, null, 2);
    }
    getNoah() {
        return this.noah;
    }
    createConnectedArchiveComplex() {
        this.createRoom("chapter5-entrance", new Vector3(0, 2.5, 1490), 16, 5, 42, "concrete", 12);
        this.createRoom("proof-room", new Vector3(0, 3, 1525), 24, 6, 28, "tile", 13);
        this.createRoom("employee-archives", new Vector3(0, 3.5, 1570), 36, 7, 46, "concrete", 14);
        this.createRoom("memory-lab", new Vector3(0, 3.5, 1618), 34, 7, 42, "tile", 14);
        this.createRoom("archive-core", new Vector3(0, 4, 1664), 42, 8, 44, "metal", 15);
        this.createRoom("body-return", new Vector3(0, 5, 1722), 46, 10, 56, "burned", 16);
        this.createRoom("mannequin-return", new Vector3(0, 4, 1780), 32, 8, 44, "concrete", 17);
        this.createRoom("jesse-return", new Vector3(0, 4.5, 1840), 28, 9, 70, "metal", 18);
        this.createRoom("burning-records", new Vector3(0, 4, 1902), 38, 8, 50, "wood", 19);
        this.createRoom("bridge-approach", new Vector3(0, 8, 1940), 24, 5, 30, "metal", 20);
        this.createRoom("final-security", new Vector3(0, 3.5, 2010), 32, 7, 44, "concrete", 21);
        const corridorCenters = [1506, 1546, 1594, 1642, 1694, 1752, 1810, 1872, 1930, 1982];
        corridorCenters.forEach((z, index) => this.createCorridor(`chapter5-corridor-${index}`, new Vector3(0, 2.6, z), 8, 5.2, 22, index % 2 ? "metal" : "concrete", 12 + index));
        for (let index = 0; index < 18; index += 1) {
            const pipe = MeshBuilder.CreateCylinder(`archive-overhead-pipe-${index}`, { height: 20, diameter: 0.22 + (index % 3) * 0.08, tessellation: 8 }, this.scene);
            pipe.parent = this.root;
            pipe.position = new Vector3(index % 2 ? -3.2 : 3.2, 4.5 + (index % 3) * 0.35, 1490 + index * 29);
            pipe.rotation.x = Math.PI / 2;
            pipe.material = this.materials.get("metal", index % 5);
            pipe.isPickable = false;
        }
        for (let index = 0; index < 24; index += 1) {
            const sign = this.createArchiveSign(index);
            sign.position = new Vector3(index % 2 ? -4.05 : 4.05, 2.2, 1490 + index * 21);
            sign.rotation.y = index % 2 ? Math.PI / 2 : -Math.PI / 2;
            sign.parent = this.root;
        }
    }
    createProofOfLifeSequence() {
        this.proofBarrier = MeshBuilder.CreateBox("proof-barrier", { width: 7.5, height: 3.7, depth: 0.45 }, this.scene);
        this.proofBarrier.parent = this.root;
        this.proofBarrier.position = new Vector3(0, 1.85, 1538);
        this.proofBarrier.material = this.materials.get("metal", 12);
        this.proofBarrier.checkCollisions = true;
        const mirror = MeshBuilder.CreateBox("proof-mirror-station", { width: 2.8, height: 2.4, depth: 0.18 }, this.scene);
        mirror.parent = this.root;
        mirror.position = new Vector3(-7, 1.55, 1524);
        mirror.material = this.materials.get("glass", 10);
        const recorder = MeshBuilder.CreateBox("proof-recorder-station", { width: 1.1, height: 0.55, depth: 0.65 }, this.scene);
        recorder.parent = this.root;
        recorder.position = new Vector3(0, 1.05, 1529);
        recorder.material = this.materials.get("plastic", 11);
        const token = MeshBuilder.CreateCylinder("proof-token-station", { height: 0.12, diameter: 0.72, tessellation: 20 }, this.scene);
        token.parent = this.root;
        token.position = new Vector3(7, 1.15, 1524);
        token.rotation.x = Math.PI / 2;
        token.material = this.materials.emissive("proof-token-blue", new Color3(0.06, 0.22, 0.48), 0.45);
        this.proofStations.push({ id: "mirror", used: false, mesh: mirror }, { id: "recording", used: false, mesh: recorder }, { id: "parking-token", used: false, mesh: token });
        this.interaction.register(mirror, {
            prompt: "[E] Usar o espelho para comparar gestos",
            enabled: () => this.phase === "proof" && !this.proofStations[0]?.used,
            onInteract: () => this.runProofQuestion("mirror", "Noah levanta a mão esquerda. O reflexo parece normal — e o ferimento limita o braço direito.", [
                { id: "left", label: "REPITA COM A MÃO ESQUERDA", correct: true },
                { id: "right", label: "EXIJA A MÃO DIREITA", correct: false },
                { id: "attack", label: "AMEACE COM O PORRETE", correct: false }
            ])
        });
        this.interaction.register(recorder, {
            prompt: "[E] Comparar a respiração com a gravação de Daniel",
            enabled: () => this.phase === "proof" && !this.proofStations[1]?.used,
            onInteract: () => this.runProofQuestion("recording", "Noah pede para ouvir a última gravação de Daniel. Ele interrompe antes da frase final.", [
                { id: "maya-found", label: "MAYA ENCONTROU ALGUÉM", correct: true },
                { id: "daniel-found", label: "DANIEL ENCONTROU MAYA", correct: false },
                { id: "names", label: "ELE NÃO SABIA NOSSOS NOMES", correct: false }
            ])
        });
        this.interaction.register(token, {
            prompt: "[E] Mostrar a ficha encontrada no estacionamento",
            enabled: () => this.phase === "proof" && !this.proofStations[2]?.used,
            onInteract: () => this.runProofQuestion("parking-token", "Noah olha para a ficha azul e pergunta quem ficou do lado de fora quando os outros entraram.", [
                { id: "protagonist", label: "EU FIQUEI DO LADO DE FORA", correct: true },
                { id: "noah", label: "NOAH FICOU DO LADO DE FORA", correct: false },
                { id: "everyone", label: "NINGUÉM ENTROU", correct: false }
            ])
        });
    }
    createArchiveRecords() {
        const definitions = [
            {
                id: "symbolic-program",
                title: "PROGRAMA DE TRANSFERÊNCIA — MATRIZ SIMBÓLICA",
                category: "identity",
                body: "O CORPO preserva anatomia e tolerância física.\n\nMOVIMENTO preserva resposta motora em suportes artificiais.\n\nMEDO preserva condicionamento, antecipação e obediência.\n\nIDENTIDADE preserva lembranças, voz e padrões sociais.\n\nA diretoria proíbe que as quatro matrizes compartilhem um único hospedeiro."
            },
            {
                id: "permanent-visitors-a",
                title: "VISITANTES PERMANENTES — LOTE 13-D",
                category: "permanent",
                body: "Entrada: 13/12/1959.\nClassificação: movimento / identidade.\nContato familiar: suspenso.\nResultado de transferência: parcial.\nRetenção: indefinida.\nNome: ███████.\n\nInstrução administrativa: informar à família que a criança deixou o parque por uma saída secundária."
            },
            {
                id: "body-origin",
                title: "REGISTRO B-01 — O CORPO",
                category: "body",
                body: "O suporte vermelho reagiu de forma intensa a uma criança que reconhecia o nariz promocional. A memória foi removida antes da alta. O vínculo residual permanece mensurável em gravações de sonho."
            },
            {
                id: "movement-origin",
                title: "DEPARTAMENTO DE MODELAGEM — MOVIMENTO",
                category: "movement",
                body: "Os manequins não imitam pessoas. Imitam a intenção de atravessar um espaço. A observação interrompe a transferência motora, mas não elimina o impulso."
            },
            {
                id: "fear-origin",
                title: "PROJETO J-8 — MEDO",
                category: "fear",
                body: "A melodia permite condensar o medo antes do estímulo. Jesse não caça corpos: caça a expectativa de ser encontrado. A caixa é um dispositivo de contenção, não um brinquedo."
            },
            {
                id: "identity-origin",
                title: "PROJETO M — IDENTIDADE",
                category: "identity",
                body: "O hospedeiro composto reproduz vozes e gestos após contato mínimo. Erros persistentes: lateralidade, sincronização emocional, reflexos e mistura de detalhes entre vítimas."
            },
            {
                id: "government-letter",
                title: "CORRESPONDÊNCIA FEDERAL — RESTRITO",
                category: "government",
                body: "O programa deve permanecer operacional até que a transferência de memória possa ser demonstrada fora das instalações. Nenhum visitante classificado como permanente poderá ser devolvido sem autorização."
            },
            {
                id: "protagonist-file",
                title: "ARQUIVO INFANTIL — SUJEITO 13-R",
                category: "protagonist",
                body: "Altura na admissão: 1,09 m.\nResposta ao mascote vermelho: reconhecimento imediato.\nProcedimento: supressão farmacológica e repetição audiovisual.\nAlta: autorizada após remoção de lembranças explícitas.\nObjeto retido: ficha azul mordida."
            }
        ];
        const positions = [
            new Vector3(-13, 1.1, 1560), new Vector3(-6, 1.1, 1574), new Vector3(6, 1.1, 1560), new Vector3(13, 1.1, 1574),
            new Vector3(-12, 1.1, 1606), new Vector3(-4, 1.1, 1622), new Vector3(5, 1.1, 1606), new Vector3(12, 1.1, 1622)
        ];
        definitions.forEach((definition, index) => {
            const mesh = MeshBuilder.CreateBox(`archive-record-${definition.id}`, { width: 1.7, height: 0.16, depth: 1.15 }, this.scene);
            mesh.parent = this.root;
            mesh.position = positions[index] ?? new Vector3(0, 1, 1570 + index * 2);
            mesh.material = this.materials.get("wood", 80 + index);
            const record = { ...definition, mesh };
            this.archiveRecords.push(record);
            this.interaction.register(mesh, {
                prompt: `[E] Ler ${definition.title.toLowerCase()}`,
                onInteract: () => this.readArchiveRecord(record)
            });
        });
        for (let shelfIndex = 0; shelfIndex < 14; shelfIndex += 1) {
            const shelf = MeshBuilder.CreateBox(`archive-shelf-${shelfIndex}`, { width: 1.2, height: 4.2, depth: 7 }, this.scene);
            shelf.parent = this.root;
            shelf.position = new Vector3((shelfIndex % 2 ? -1 : 1) * (8 + (shelfIndex % 3) * 3.3), 2.1, 1552 + Math.floor(shelfIndex / 2) * 7.4);
            shelf.material = this.materials.get("metal", 20 + shelfIndex % 3);
            shelf.checkCollisions = true;
            for (let boxIndex = 0; boxIndex < 8; boxIndex += 1) {
                const box = MeshBuilder.CreateBox(`archive-box-${shelfIndex}-${boxIndex}`, { width: 0.75, height: 0.55, depth: 0.9 }, this.scene);
                box.parent = shelf;
                box.position = new Vector3(0, -1.55 + (boxIndex % 4) * 0.95, -2.4 + Math.floor(boxIndex / 4) * 4.8);
                box.material = this.materials.get("wood", shelfIndex + boxIndex);
                box.isPickable = false;
            }
        }
    }
    createMemoryTransferLab() {
        const labCenter = this.checkpoints.memoryLab;
        for (let index = 0; index < 6; index += 1) {
            const chair = MeshBuilder.CreateBox(`memory-chair-${index}`, { width: 1.1, height: 1.5, depth: 1.35 }, this.scene);
            chair.parent = this.root;
            chair.position = labCenter.add(new Vector3(-10 + index * 4, 0.75, index % 2 ? -4 : 4));
            chair.material = this.materials.get("metal", 24 + index);
            chair.checkCollisions = true;
            const restraint = MeshBuilder.CreateTorus(`memory-restraint-${index}`, { diameter: 0.85, thickness: 0.1, tessellation: 14 }, this.scene);
            restraint.parent = chair;
            restraint.position.y = 0.35;
            restraint.rotation.x = Math.PI / 2;
            restraint.material = this.materials.get("plastic", 20 + index);
        }
        this.childhoodProjector = MeshBuilder.CreateBox("childhood-projector", { width: 1.4, height: 1, depth: 1.8 }, this.scene);
        this.childhoodProjector.parent = this.root;
        this.childhoodProjector.position = new Vector3(-9, 1.05, 1630);
        this.childhoodProjector.material = this.materials.get("metal", 28);
        this.interaction.register(this.childhoodProjector, {
            prompt: "[E] Reproduzir fragmento do filme infantil",
            onInteract: () => this.playChildhoodFlashback("film-fragment")
        });
        this.childhoodToken = MeshBuilder.CreateCylinder("childhood-token", { diameter: 0.72, height: 0.11, tessellation: 20 }, this.scene);
        this.childhoodToken.parent = this.root;
        this.childhoodToken.position = new Vector3(9, 1.12, 1630);
        this.childhoodToken.rotation.x = Math.PI / 2;
        this.childhoodToken.material = this.materials.emissive("childhood-token-emissive", new Color3(0.04, 0.2, 0.55), 0.42);
        this.interaction.register(this.childhoodToken, {
            prompt: "[E] Recolher a ficha azul mordida",
            enabled: () => !this.inventory.has("childhoodToken"),
            onInteract: () => {
                this.inventory.add(CHAPTER5_ITEMS.childhoodToken);
                this.childhoodToken.setEnabled(false);
                this.flashbacksSeen.add("token-memory");
                this.ui.showSubtitle("Memória", "Você mordeu a ficha para não gritar quando o mascote vermelho se aproximou.", 5200);
                this.audio.memoryFragments();
                this.callbacks.onCheckpoint("chapter5-memory");
            }
        });
        this.archiveCoreConsole = MeshBuilder.CreateBox("archive-core-console", { width: 3.2, height: 1.3, depth: 1.4 }, this.scene);
        this.archiveCoreConsole.parent = this.root;
        this.archiveCoreConsole.position = new Vector3(0, 1.1, 1668);
        this.archiveCoreConsole.material = this.materials.get("metal", 31);
        this.interaction.register(this.archiveCoreConsole, {
            prompt: () => this.canAccessArchiveCore() ? "[E] Acessar o núcleo dos arquivos" : "Núcleo bloqueado: faltam registros e lembranças",
            onInteract: () => {
                if (!this.canAccessArchiveCore()) {
                    this.ui.toast("Você ainda não entende o suficiente para decodificar o índice central.");
                    return;
                }
                this.revealExperimentProgram();
            }
        });
    }
    createCollapseRoute() {
        this.cooperativeDoor = this.createDoor("cooperative-archive-door", new Vector3(0, 2.1, 1689), new Vector3(5.2, 0, 0), "metal", 35);
        this.noahHeavyHandle = MeshBuilder.CreateCylinder("noah-heavy-handle", { height: 1.4, diameter: 0.22, tessellation: 10 }, this.scene);
        this.noahHeavyHandle.parent = this.root;
        this.noahHeavyHandle.position = new Vector3(-3.2, 1.6, 1686.8);
        this.noahHeavyHandle.rotation.z = Math.PI / 2;
        this.noahHeavyHandle.material = this.materials.get("metal", 36);
        this.interaction.register(this.noahHeavyHandle, {
            prompt: "[E] Pedir para Noah segurar o mecanismo",
            enabled: () => this.collapseStarted && !this.doors.find((door) => door.mesh === this.cooperativeDoor)?.open,
            onInteract: () => {
                this.noah.holdAt(new Vector3(-2.6, 0.12, 1686.8), "archive-heavy-handle");
                this.ui.showSubtitle("Noah", "Vai. Quando eu puxar, empurra a porta.", 3000);
            }
        });
        for (let index = 0; index < 10; index += 1) {
            const obstacle = MeshBuilder.CreateBox(`final-obstacle-${index}`, { width: 2 + (index % 2), height: 1.1 + (index % 3) * 0.3, depth: 0.7 }, this.scene);
            obstacle.parent = this.root;
            obstacle.position = new Vector3((index % 2 ? -1 : 1) * (2.6 + (index % 3)), 0.55, 1698 + index * 28);
            obstacle.rotation.y = (index % 4) * 0.2;
            obstacle.material = this.materials.get(index % 3 ? "metal" : "wood", 40 + index);
            obstacle.checkCollisions = true;
        }
    }
    createBurnedAuditoriumReturn() {
        for (let row = 0; row < 6; row += 1) {
            for (let column = 0; column < 9; column += 1) {
                if ((row + column) % 4 === 0)
                    continue;
                const seat = MeshBuilder.CreateBox(`burned-seat-${row}-${column}`, { width: 0.72, height: 0.7, depth: 0.72 }, this.scene);
                seat.parent = this.root;
                seat.position = new Vector3(-7 + column * 1.75, 0.4, 1704 + row * 2.7);
                seat.rotation.x = ((row + column) % 5) * 0.12;
                seat.rotation.z = ((row * 2 + column) % 3) * 0.08;
                seat.material = this.materials.get("burned", 10 + (row + column) % 4);
                seat.checkCollisions = true;
            }
        }
        const bodyRemains = MeshBuilder.CreateSphere("body-remains", { diameter: 4.8, segments: 14 }, this.scene);
        bodyRemains.parent = this.root;
        bodyRemains.position = new Vector3(0, 1.4, 1731);
        bodyRemains.scaling = new Vector3(1.35, 0.45, 1.05);
        bodyRemains.material = this.materials.get("burned", 22);
        bodyRemains.checkCollisions = true;
        for (let index = 0; index < 5; index += 1) {
            const ember = new PointLight(`body-ember-${index}`, new Vector3(-2 + index, 0.8, 1730 + (index % 2)), this.scene);
            ember.parent = this.root;
            ember.diffuse = new Color3(1, 0.16, 0.025);
            ember.intensity = 0.25;
            ember.range = 5;
        }
        const emptyNoseMark = MeshBuilder.CreateTorus("empty-nose-mark", { diameter: 0.95, thickness: 0.07, tessellation: 20 }, this.scene);
        emptyNoseMark.parent = this.root;
        emptyNoseMark.position = new Vector3(1.8, 0.08, 1732);
        emptyNoseMark.rotation.x = Math.PI / 2;
        emptyNoseMark.material = this.materials.get("metal", 43);
        this.bodyBeam = MeshBuilder.CreateBox("body-return-beam", { width: 11, height: 0.55, depth: 0.75 }, this.scene);
        this.bodyBeam.parent = this.root;
        this.bodyBeam.position = new Vector3(0, 1.2, 1744);
        this.bodyBeam.rotation.z = 0.22;
        this.bodyBeam.material = this.materials.get("metal", 44);
        this.bodyBeam.checkCollisions = true;
        this.interaction.register(this.bodyBeam, {
            prompt: "[E] Levantar a viga com Noah",
            enabled: () => this.phase === "body-return",
            onInteract: () => {
                if (Vector3.Distance(this.noah.position, this.bodyBeam.position) > 5) {
                    this.noah.moveTo(this.bodyBeam.position.add(new Vector3(-2, -1.08, -1.2)), "body-beam");
                    this.ui.toast("Noah está se posicionando.");
                    return;
                }
                this.bodyBeam.position.y = 3.1;
                this.bodyBeam.rotation.z = 0.03;
                this.escapeSegment = Math.max(this.escapeSegment, 2);
                this.callbacks.onCheckpoint("chapter5-body-return");
                this.ui.showSubtitle("Noah", "O nariz não está aqui. Eu vi ele cair no palco.", 3600);
                this.objective.set("escape-mannequin", "ATRAVESSE O SETOR DE MODELAGEM DESTRUÍDO.");
            }
        });
    }
    createMannequinReturn() {
        for (let index = 0; index < 8; index += 1) {
            const root = new TransformNode(`survivor-mannequin-${index}`, this.scene);
            root.parent = this.root;
            root.position = new Vector3(-8 + (index % 4) * 5.2, 0, 1765 + Math.floor(index / 4) * 18);
            const torso = MeshBuilder.CreateCapsule(`survivor-mannequin-torso-${index}`, { height: 1.7, radius: 0.34, tessellation: 9 }, this.scene);
            torso.parent = root;
            torso.position.y = 2.5;
            torso.material = this.materials.get("plastic", 28 + index);
            const head = MeshBuilder.CreateSphere(`survivor-mannequin-head-${index}`, { diameter: 0.62, segments: 10 }, this.scene);
            head.parent = root;
            head.position.y = 3.7;
            head.scaling.z = 0.78;
            head.material = this.materials.get("plastic", 30 + index);
            for (let limb = 0; limb < 4; limb += 1) {
                const part = MeshBuilder.CreateCylinder(`survivor-mannequin-limb-${index}-${limb}`, { height: limb < 2 ? 1.35 : 1.55, diameter: 0.2, tessellation: 7 }, this.scene);
                part.parent = root;
                part.position = new Vector3(limb % 2 ? 0.48 : -0.48, limb < 2 ? 2.55 : 1.15, 0);
                part.rotation.z = (limb % 2 ? 1 : -1) * (limb < 2 ? 0.18 : 0.05);
                part.material = this.materials.get("plastic", 31 + index);
            }
            this.mannequins.push({ root, pose: index % 3, moved: false, lastObserved: 0 });
        }
        for (let index = 0; index < 7; index += 1) {
            const mirrorShard = MeshBuilder.CreatePlane(`broken-mirror-shard-${index}`, { width: 1.8 + index * 0.15, height: 2.4 }, this.scene);
            mirrorShard.parent = this.root;
            mirrorShard.position = new Vector3(index % 2 ? -10 : 10, 1.6, 1760 + index * 5.5);
            mirrorShard.rotation.y = index % 2 ? Math.PI / 2 : -Math.PI / 2;
            mirrorShard.rotation.z = (index - 3) * 0.08;
            mirrorShard.material = this.materials.get("glass", 21 + index);
        }
        const track = MeshBuilder.CreateBox("sphere-damaged-track", { width: 4.2, height: 0.15, depth: 42 }, this.scene);
        track.parent = this.root;
        track.position = new Vector3(0, 0.05, 1780);
        track.material = this.materials.get("metal", 48);
    }
    createFinalJesseRoute() {
        this.blastDoor = this.createDoor("final-blast-door", new Vector3(0, 2.2, 1862), new Vector3(0, 4.8, 0), "metal", 52);
        const control = MeshBuilder.CreateBox("final-blast-door-control", { width: 0.75, height: 1.1, depth: 0.42 }, this.scene);
        control.parent = this.root;
        control.position = new Vector3(4.2, 1.2, 1857);
        control.material = this.materials.emissive("final-control", new Color3(0.08, 0.35, 0.12), 0.65);
        this.interaction.register(control, {
            prompt: "[E] Mandar Noah abrir a rota lateral",
            enabled: () => this.phase === "jesse-return" && !this.doors.find((door) => door.mesh === this.blastDoor)?.open,
            onInteract: () => {
                this.noah.moveTo(new Vector3(4, 0.12, 1856), "final-blast-control");
                this.ui.showSubtitle("Noah", "Continua correndo. Eu alcanço você!", 2600);
            }
        });
        for (let index = 0; index < 9; index += 1) {
            const hanging = MeshBuilder.CreateBox(`falling-machine-${index}`, { width: 2.2, height: 1.4, depth: 1.6 }, this.scene);
            hanging.parent = this.root;
            hanging.position = new Vector3(index % 2 ? -3.8 : 3.8, 6.4, 1818 + index * 7.2);
            hanging.material = this.materials.get("metal", 54 + index % 3);
            hanging.checkCollisions = false;
        }
        const sacrificeGate = MeshBuilder.CreateBox("near-sacrifice-gate", { width: 7, height: 3.8, depth: 0.5 }, this.scene);
        sacrificeGate.parent = this.root;
        sacrificeGate.position = new Vector3(0, 1.9, 1870);
        sacrificeGate.material = this.materials.get("metal", 58);
        sacrificeGate.checkCollisions = false;
        this.interaction.register(sacrificeGate, {
            prompt: "[E] Puxar Noah antes que a porta feche",
            enabled: () => this.phase === "jesse-return" && this.escapeSegment === 5,
            onInteract: () => {
                this.noah.teleport(this.player.collider.position.add(new Vector3(1.2, 0, -1.4)));
                this.noah.setFollow();
                this.escapeSegment = 6;
                sacrificeGate.position.y = 4.9;
                this.audio.impact(1.15);
                this.ui.showSubtitle("Noah", "Eu tinha dito para você não entrar. Ainda estava certo.", 3300);
                this.callbacks.onCheckpoint("chapter5-burning-archives");
                this.phase = "burning-archives";
                this.jesse.stop();
                this.jesseChaseActive = false;
                this.audio.stopJesseChase();
                this.objective.set("burning-archives", "ATRAVESSE OS ARQUIVOS EM CHAMAS.");
            }
        });
    }
    createBurningArchives() {
        for (let index = 0; index < 16; index += 1) {
            const shelf = MeshBuilder.CreateBox(`burning-shelf-${index}`, { width: 1.1, height: 4.6, depth: 5.2 }, this.scene);
            shelf.parent = this.root;
            shelf.position = new Vector3(index % 2 ? -7.5 : 7.5, 2.3, 1880 + Math.floor(index / 2) * 5.2);
            shelf.rotation.z = index % 5 === 0 ? 0.18 : 0;
            shelf.material = this.materials.get(index % 4 === 0 ? "burned" : "metal", 60 + index % 4);
            shelf.checkCollisions = true;
            this.fire.register(shelf, { health: 42, spreadRadius: 3.2 });
        }
        const rescueDefinitions = [
            { id: "visitor-list", title: "Lista de visitantes permanentes", z: 1890 },
            { id: "federal-reel", title: "Filme do programa federal", z: 1904 },
            { id: "family-contacts", title: "Contatos familiares não realizados", z: 1916 }
        ];
        rescueDefinitions.forEach((definition, index) => {
            const record = MeshBuilder.CreateBox(`rescue-document-${definition.id}`, { width: 1.1, height: 0.12, depth: 0.85 }, this.scene);
            record.parent = this.root;
            record.position = new Vector3(index % 2 ? -4.2 : 4.2, 1.05, definition.z);
            record.material = this.materials.emissive(`rescue-record-${index}`, new Color3(0.38, 0.22, 0.06), 0.18);
            this.interaction.register(record, {
                prompt: `[E] Resgatar ${definition.title.toLowerCase()}`,
                enabled: () => this.phase === "burning-archives" && !this.rescuedDocuments.has(definition.id),
                onInteract: () => {
                    this.rescuedDocuments.add(definition.id);
                    record.setEnabled(false);
                    this.inventory.add(index === 0 ? CHAPTER5_ITEMS.permanentVisitorFile : CHAPTER5_ITEMS.archiveReel);
                    this.ui.toast("Documento resgatado. A saída continua desabando.", 2300);
                    this.noise.emit({ position: record.position, intensity: 0.35, category: "impact", material: "wood", range: 10 });
                }
            });
        });
    }
    createMaintenanceBridge() {
        const approachRamp = MeshBuilder.CreateBox("bridge-ramp", { width: 7, height: 0.6, depth: 16 }, this.scene);
        approachRamp.parent = this.root;
        approachRamp.position = new Vector3(0, 4.1, 1932);
        approachRamp.rotation.x = -0.48;
        approachRamp.material = this.materials.get("metal", 70);
        approachRamp.checkCollisions = true;
        for (let index = 0; index < 12; index += 1) {
            const section = MeshBuilder.CreateBox(`maintenance-bridge-section-${index}`, { width: 5.6, height: 0.35, depth: 4.2 }, this.scene);
            section.parent = this.root;
            section.position = new Vector3((index % 3 - 1) * 0.45, 8.05, 1943 + index * 4.2);
            section.rotation.z = (index % 2 ? 1 : -1) * 0.025;
            section.material = this.materials.get("metal", 72 + index % 3);
            section.checkCollisions = true;
            this.bridgeSections.push({ mesh: section, index, falling: false, fallen: false, baseY: section.position.y });
            if (index % 3 === 0) {
                const machine = MeshBuilder.CreateCylinder(`bridge-moving-machine-${index}`, { height: 5, diameter: 1.2, tessellation: 12 }, this.scene);
                machine.parent = this.root;
                machine.position = new Vector3(index % 2 ? -5.5 : 5.5, 10.5, 1943 + index * 4.2);
                machine.rotation.z = Math.PI / 2;
                machine.material = this.materials.get("metal", 75 + index);
            }
        }
        const exitRamp = MeshBuilder.CreateBox("bridge-exit-ramp", { width: 7, height: 0.6, depth: 20 }, this.scene);
        exitRamp.parent = this.root;
        exitRamp.position = new Vector3(0, 4.15, 1999);
        exitRamp.rotation.x = 0.48;
        exitRamp.material = this.materials.get("metal", 79);
        exitRamp.checkCollisions = true;
        const farView = new PointLight("bridge-emergency-view", new Vector3(0, 12, 1970), this.scene);
        farView.parent = this.root;
        farView.diffuse = new Color3(0.9, 0.04, 0.02);
        farView.intensity = 2.2;
        farView.range = 62;
    }
    createFinalExit() {
        this.playerReader = MeshBuilder.CreateBox("final-player-reader", { width: 0.7, height: 1.2, depth: 0.42 }, this.scene);
        this.playerReader.parent = this.root;
        this.playerReader.position = new Vector3(-3.5, 1.3, 2023);
        this.playerReader.material = this.materials.emissive("body-card-reader", new Color3(0.48, 0.06, 0.045), 0.55);
        this.noahReader = MeshBuilder.CreateBox("final-noah-reader", { width: 0.7, height: 1.2, depth: 0.42 }, this.scene);
        this.noahReader.parent = this.root;
        this.noahReader.position = new Vector3(3.5, 1.3, 2023);
        this.noahReader.material = this.materials.emissive("identity-card-reader", new Color3(0.04, 0.22, 0.55), 0.55);
        this.exitDoorLeft = MeshBuilder.CreateBox("final-exit-left", { width: 4.5, height: 5, depth: 0.55 }, this.scene);
        this.exitDoorLeft.parent = this.root;
        this.exitDoorLeft.position = new Vector3(-2.3, 2.5, 2028);
        this.exitDoorLeft.material = this.materials.get("metal", 82);
        this.exitDoorLeft.checkCollisions = true;
        this.exitDoorRight = MeshBuilder.CreateBox("final-exit-right", { width: 4.5, height: 5, depth: 0.55 }, this.scene);
        this.exitDoorRight.parent = this.root;
        this.exitDoorRight.position = new Vector3(2.3, 2.5, 2028);
        this.exitDoorRight.material = this.materials.get("metal", 82);
        this.exitDoorRight.checkCollisions = true;
        this.exitDoorBlocker = MeshBuilder.CreateBox("final-exit-doorway-blocker", { width: 9.8, height: 5.2, depth: 1.3 }, this.scene);
        this.exitDoorBlocker.parent = this.root;
        this.exitDoorBlocker.position = new Vector3(0, 2.5, 2028);
        this.exitDoorBlocker.visibility = 0;
        this.exitDoorBlocker.isPickable = false;
        this.exitDoorBlocker.checkCollisions = true;
        this.exitDoorBlocker.metadata = { doorwayBlocker: true, interactionPassthrough: true };
        // The final room has no transverse wall by default. Build a real security
        // bulkhead around the double doors so there is no empty route around them.
        const exitBulkheadMaterial = this.materials.get("concrete", 83);
        for (const side of [-1, 1]) {
            const panel = MeshBuilder.CreateBox(`final-exit-bulkhead-${side}`, { width: 11.1, height: 7, depth: 0.75 }, this.scene);
            panel.parent = this.root;
            panel.position = new Vector3(side * 10.45, 3.5, 2028);
            panel.material = exitBulkheadMaterial;
            panel.checkCollisions = true;
            panel.metadata = { permanentDoorWall: true };
        }
        const exitUpper = MeshBuilder.CreateBox("final-exit-bulkhead-upper", { width: 9.8, height: 2, depth: 0.75 }, this.scene);
        exitUpper.parent = this.root;
        exitUpper.position = new Vector3(0, 6, 2028);
        exitUpper.material = exitBulkheadMaterial;
        exitUpper.checkCollisions = true;
        exitUpper.metadata = { permanentDoorWall: true };
        this.interaction.register(this.playerReader, {
            prompt: "[E] Inserir o Cartão do Corpo",
            enabled: () => this.phase === "exit" && !this.playerReaderReady,
            onInteract: () => {
                if (!this.inventory.has("bodyCard")) {
                    this.ui.toast("O Cartão do Corpo não está no inventário.");
                    return;
                }
                this.playerReaderReady = true;
                this.readerClock = 4.5 + (this.settings.extendedBossWindows ? 2.5 : 0);
                this.playerReader.material = this.materials.emissive("body-card-reader-ready", new Color3(0.1, 0.8, 0.18), 0.85);
                this.ui.showSubtitle("Sistema", "LEITOR CORPORAL VALIDADO. AGUARDANDO IDENTIDADE.", 2600);
                this.noah.moveTo(this.noahReader.position.add(new Vector3(0, -1.18, -1.4)), "identity-reader");
            }
        });
        this.interaction.register(this.noahReader, {
            prompt: "[E] Sincronizar com Noah",
            enabled: () => this.phase === "exit" && this.noahReaderReady && !this.finalSequenceLocked,
            onInteract: () => this.synchronizeFinalExit()
        });
    }
    createAuthoritiesExterior() {
        const ground = MeshBuilder.CreateGround("authority-ground", { width: 86, height: 80, subdivisions: 2 }, this.scene);
        ground.parent = this.root;
        ground.position = new Vector3(0, 0, 2076);
        ground.material = this.materials.get("concrete", 90);
        ground.checkCollisions = true;
        for (let index = 0; index < 11; index += 1) {
            const vehicle = this.createEmergencyVehicle(index);
            vehicle.position = new Vector3(-28 + (index % 6) * 11, 0.65, 2050 + Math.floor(index / 6) * 22);
            vehicle.rotation.y = (index % 3 - 1) * 0.22;
            vehicle.parent = this.root;
        }
        for (let index = 0; index < 34; index += 1) {
            const person = this.createAuthoritySilhouette(index);
            person.position = new Vector3(-30 + (index % 10) * 6.5, 0, 2054 + Math.floor(index / 10) * 8.5);
            person.rotation.y = (index % 8) * 0.7;
            person.parent = this.root;
        }
        for (let index = 0; index < 6; index += 1) {
            const search = new SpotLight(`authority-searchlight-${index}`, new Vector3(-26 + index * 10, 8, 2050), new Vector3((index - 3) * 0.06, -0.35, 1), Math.PI / 5, 1.4, this.scene);
            search.parent = this.root;
            search.diffuse = new Color3(0.78, 0.86, 1);
            search.intensity = 7;
            search.range = 72;
        }
        this.finalNose = MeshBuilder.CreateSphere("final-red-nose", { diameter: 0.42, segments: 14 }, this.scene);
        this.finalNose.parent = this.root;
        this.finalNose.position = new Vector3(8.5, 0.22, 2084);
        this.finalNose.material = this.materials.solid("final-nose-red", new Color3(0.55, 0.012, 0.008), 0.32);
        this.finalNose.isPickable = false;
    }
    createFunctionalMirrors() {
        const mirror = MeshBuilder.CreatePlane("chapter5-proof-functional-mirror", { width: 5.5, height: 3.3 }, this.scene);
        mirror.parent = this.root;
        mirror.position = new Vector3(-7.85, 2.1, 1519);
        mirror.rotation.y = Math.PI / 2;
        const texture = new MirrorTexture("chapter5-proof-mirror-texture", 512, this.scene, true);
        texture.mirrorPlane = new Plane(1, 0, 0, 7.85);
        texture.renderList = this.noah.getRoot().getChildMeshes();
        texture.level = 0.66;
        const material = new StandardMaterial("chapter5-proof-mirror-material", this.scene);
        material.reflectionTexture = texture;
        material.diffuseColor = new Color3(0.12, 0.13, 0.14);
        material.specularColor = new Color3(0.75, 0.78, 0.8);
        mirror.material = material;
        this.mirrorTextures.push(texture);
        for (let index = 0; index < 4; index += 1) {
            const archiveMirror = MeshBuilder.CreatePlane(`archive-identity-mirror-${index}`, { width: 3.2, height: 3.8 }, this.scene);
            archiveMirror.parent = this.root;
            archiveMirror.position = new Vector3(index % 2 ? -15.5 : 15.5, 2.1, 1588 + Math.floor(index / 2) * 26);
            archiveMirror.rotation.y = index % 2 ? Math.PI / 2 : -Math.PI / 2;
            archiveMirror.material = this.materials.get("glass", 35 + index);
        }
    }
    configureJesse() {
        this.jesse.configure(this.jesseNodes(), this.settings.simplifiedChase);
    }
    jesseNodes() {
        return [
            { id: "ceiling-entry", position: new Vector3(-7, 5.8, 1816), room: "final-route", entrance: true },
            { id: "wall-left", position: new Vector3(-7, 2.5, 1830), room: "final-route" },
            { id: "wall-right", position: new Vector3(7, 3.8, 1842), room: "final-route" },
            { id: "machine-gap", position: new Vector3(0, 0.2, 1854), room: "final-route" },
            { id: "blast-door", position: new Vector3(0, 0.2, 1865), room: "final-route" }
        ];
    }
    updateProofSequence() {
        if (this.phase === "approach" && Vector3.Distance(this.player.collider.position, this.checkpoints.proof) < 24) {
            this.phase = "proof";
            this.player.setEnabled(true);
            this.objective.set("prove-life", "PROVE QUE VOCÊ E NOAH SÃO HUMANOS.");
            this.callbacks.onCheckpoint("chapter5-proof");
            this.ui.showSubtitle("Protagonista", "Você disse que entrar era uma péssima ideia. Eu também disse.", 4200);
            this.ui.showSubtitle("Noah", "Isso qualquer coisa lá dentro pode ter ouvido. Me mostra algo que ela não consegue copiar direito.", 5200);
        }
        if (this.phase === "proof" && this.proofStations.every((station) => station.used) && !this.proofComplete)
            this.completeProofOfLife();
    }
    runProofQuestion(stationId, prompt, answers) {
        const station = this.proofStations.find((entry) => entry.id === stationId);
        if (!station || station.used)
            return;
        this.player.setEnabled(false);
        this.player.releasePointerLock();
        this.ui.showSubtitle("Noah", prompt, 5200);
        this.ui.showTacticalActions(answers.map((answer) => ({ id: answer.id, label: answer.label })), (action) => {
            const answer = answers.find((candidate) => candidate.id === action);
            if (!answer)
                return;
            station.used = true;
            this.proofAnswers.set(stationId, answer.id);
            if (answer.correct) {
                this.proofScore += 2;
                this.noah.trust += 1;
                this.ui.showSubtitle("Noah", stationId === "recording" ? "Daniel parou a frase do mesmo jeito. Certo." : "Certo. Continua.", 2800);
            }
            else {
                this.proofContradictions += 1;
                this.proofScore -= 1;
                this.noah.trust -= 1;
                this.ui.showSubtitle("Noah", "Isso não prova nada. Ou prova a coisa errada.", 3200);
            }
            this.ui.hideTacticalActions();
            this.player.setEnabled(true);
            this.player.requestPointerLock();
        });
    }
    completeProofOfLife() {
        this.proofComplete = true;
        this.phase = "archives";
        this.proofBarrier.position.y = 5.6;
        this.proofBarrier.checkCollisions = false;
        this.noah.carryingIdentityCard = true;
        this.noah.setFollow();
        this.ui.showSubtitle("Noah", "Eu ainda não confio em tudo que você lembra. Mas confio no erro. Só você insistia que a gente devia ir embora antes de entrar.", 6800);
        window.setTimeout(() => {
            this.ui.showSubtitle("Protagonista", "E você riu porque eu estava segurando a ficha com os dentes.", 4200);
            this.objective.set("search-archives", "INVESTIGUE OS ARQUIVOS CENTRAIS COM NOAH.");
            this.callbacks.onCheckpoint("chapter5-archives");
            this.reactToMimicBehavior();
        }, 2600);
    }
    reactToMimicBehavior() {
        if (this.mimicAttackCount === 0) {
            this.ui.showSubtitle("Noah", "Você parou quando ela caiu. Eu ouvi o silêncio depois.", 4200);
        }
        else if (this.mimicAttackCount <= 3) {
            this.ui.showSubtitle("Noah", "Você acertou mais algumas vezes depois que ela parou. Eu não sei se eu faria diferente.", 4600);
        }
        else if (this.mimicAttackCount <= 12) {
            this.ui.showSubtitle("Noah", "A coisa já não estava se mexendo. Mesmo assim, os golpes continuaram por um tempo.", 4800);
        }
        else {
            this.ui.showSubtitle("Noah", "Quando ela parou, o som do porrete continuou. Eu quase não chamei você depois disso.", 5200);
            this.audio.memoryFragments();
        }
    }
    readArchiveRecord(record) {
        if (!this.documents.has(record.id)) {
            this.documents.add(record.id);
            this.audio.pickup();
        }
        this.ui.showDocument(record.title, record.body, () => {
            if (["symbolic-program", "permanent-visitors-a", "protagonist-file"].includes(record.id))
                this.noahReactToRecord(record);
            if (this.documents.size >= 4)
                this.objective.set("find-own-file", "ENCONTRE SEU ARQUIVO INFANTIL E ACESSE O NÚCLEO.");
        });
    }
    noahReactToRecord(record) {
        if (record.id === "symbolic-program")
            this.ui.showSubtitle("Noah", "Corpo. Movimento. Medo. Identidade. A gente passou por cada parte como se fosse um teste.", 5600);
        if (record.id === "permanent-visitors-a")
            this.ui.showSubtitle("Noah", "Eles não perderam essas crianças. Eles decidiram ficar com elas.", 4800);
        if (record.id === "protagonist-file")
            this.ui.showSubtitle("Noah", "A ficha no chão... você não encontrou hoje. Você voltou para buscar sem saber.", 5200);
    }
    playChildhoodFlashback(id) {
        if (this.flashbacksSeen.has(id)) {
            this.ui.toast("O filme termina sempre no mesmo quadro queimado.");
            return;
        }
        this.flashbacksSeen.add(id);
        this.player.setEnabled(false);
        this.player.releasePointerLock();
        this.audio.startProjector();
        this.ui.setCorruption(0.62, 2600);
        this.ui.showSubtitle("Gravação infantil", "Sujeito 13-R, olhe para o nariz vermelho. Diga qual parte de você ele reconhece.", 5400);
        window.setTimeout(() => {
            this.ui.showSubtitle("Voz infantil", "Ele lembra de mim quando eu não lembro dele.", 4400);
            this.audio.memoryFragments();
            this.audio.stopLoop("projector");
            this.player.setEnabled(true);
            this.callbacks.onCheckpoint("chapter5-memory");
        }, 2600);
    }
    canAccessArchiveCore() {
        return this.documents.has("symbolic-program")
            && this.documents.has("permanent-visitors-a")
            && this.documents.has("protagonist-file")
            && (this.flashbacksSeen.has("film-fragment") || this.flashbacksSeen.has("token-memory"));
    }
    revealExperimentProgram() {
        if (this.archiveDataAccessed)
            return;
        this.archiveDataAccessed = true;
        this.experimentRevelationSeen = true;
        this.protagonistPastRevealed = true;
        this.phase = "revelation";
        this.player.setEnabled(false);
        this.player.releasePointerLock();
        this.audio.memoryFragments();
        this.ui.setCorruption(0.78, 3800);
        this.ui.showSubtitle("Diretor do programa", "O visitante pode perder a lembrança e manter a conexão. A ausência consciente não encerra a transferência.", 6200);
        window.setTimeout(() => {
            this.ui.showSubtitle("Noah", "Você esteve aqui antes. Body reconheceu você porque alguma parte ficou nele.", 5600);
        }, 2100);
        window.setTimeout(() => {
            this.ui.showSubtitle("Protagonista", "Eles não apagaram o que aconteceu. Só apagaram o caminho até a lembrança.", 5600);
            this.player.setEnabled(true);
            this.beginFacilityFailure();
        }, 5100);
    }
    beginFacilityFailure() {
        if (this.collapseStarted)
            return;
        this.collapseStarted = true;
        this.phase = "collapse";
        this.escapeSegment = 0;
        this.audio.startMachineAlarm();
        this.noise.emit({ position: this.archiveCoreConsole.position, intensity: 1.4, category: "alarm", material: "electrical", range: 70 });
        for (const light of this.scene.lights)
            light.intensity *= 0.72;
        this.fire.igniteAt(new Vector3(-10, 0.4, 1660), 24, true);
        this.fire.igniteAt(new Vector3(11, 0.4, 1672), 24, true);
        this.objective.set("escape-collapse", "ESCAPE DOS ARQUIVOS COM NOAH.");
        this.callbacks.onCheckpoint("chapter5-collapse");
        this.ui.showSoundCaption("o arquivo inteiro geme sob a pressão", 3200);
        this.ui.showSubtitle("Noah", "Acesso central abriu as travas de contenção. Corre!", 3600);
    }
    updateArchiveProgress() {
        if (!this.active || !this.proofComplete)
            return;
        if (this.phase === "archives" && this.documents.size >= 4 && this.player.collider.position.z > 1590) {
            this.phase = "revelation";
            this.objective.set("recover-memory", "ENCONTRE SEU ARQUIVO E RECONSTRUA A MEMÓRIA SUPRIMIDA.");
        }
    }
    updateCollapse(deltaSeconds) {
        if (!this.collapseStarted)
            return;
        this.smokeClock -= deltaSeconds;
        if (this.smokeClock <= 0) {
            this.smokeClock = this.settings.performancePreset === "performance" ? 3.8 : 2.1;
            const z = Math.max(1660, Math.min(1930, this.player.collider.position.z + 10 + Math.random() * 16));
            this.fire.igniteAt(new Vector3((Math.random() - 0.5) * 15, 0.25, z), 8, this.settings.performancePreset !== "performance");
        }
        const z = this.player.collider.position.z;
        if (this.phase === "collapse" && z > 1690) {
            this.phase = "body-return";
            this.escapeSegment = Math.max(this.escapeSegment, 1);
            this.objective.set("body-return", "ATRAVESSE O AUDITÓRIO QUEIMADO.");
            this.callbacks.onCheckpoint("chapter5-body-return");
            this.ui.showSoundCaption("o tecido queimado de Body ainda estala", 2400);
        }
        if (this.phase === "body-return" && z > 1755 && this.bodyBeam.position.y > 2.5) {
            this.phase = "mannequin-return";
            this.escapeSegment = Math.max(this.escapeSegment, 3);
            this.callbacks.onCheckpoint("chapter5-mannequin-return");
            this.objective.set("mannequin-return", "MANTENHA OS SOBREVIVENTES À VISTA E ALCANCE A ROTA DE SERVIÇO.");
            this.ui.showSubtitle("Noah", "Eles estão voltando à regra antiga. Olha para eles. Eu olho para a saída.", 4200);
        }
        if (this.phase === "mannequin-return" && z > 1810)
            this.startFinalJesseChase(0);
        if (this.phase === "burning-archives") {
            this.optionalRescueClock += deltaSeconds;
            if (!this.archiveFireStarted) {
                this.archiveFireStarted = true;
                for (let index = 0; index < 8; index += 1)
                    this.fire.igniteAt(new Vector3(index % 2 ? -7 : 7, 0.4, 1882 + index * 5.4), 20, index < 4);
            }
            if (z > 1928) {
                this.phase = "bridge";
                this.noah.setFollow();
                this.callbacks.onCheckpoint("chapter5-bridge");
                this.objective.set("maintenance-bridge", "ATRAVESSE A PONTE DE MANUTENÇÃO ANTES DO COLAPSO.");
            }
        }
        if (this.phase === "bridge" && z > 1992) {
            this.phase = "exit";
            this.noah.setFollow();
            this.callbacks.onCheckpoint("chapter5-exit");
            this.objective.set("synchronized-exit", "ATIVE OS DOIS LEITORES DE CARTÃO EM SINCRONIA.");
        }
    }
    startFinalJesseChase(checkpoint) {
        if (this.jesseChaseActive)
            return;
        this.phase = "jesse-return";
        this.escapeSegment = Math.max(this.escapeSegment, 4);
        this.jesseChaseActive = true;
        this.jesseCheckpoint = checkpoint;
        this.noise.setEnabled(true);
        this.audio.startJesseChase();
        const route = [
            new Vector3(0, 0.12, 1815),
            new Vector3(-4, 0.12, 1828),
            new Vector3(4, 0.12, 1840),
            new Vector3(0, 0.12, 1853),
            new Vector3(0, 0.12, 1866)
        ];
        this.jesse.startChase(route, checkpoint);
        this.objective.set("final-jesse", "FUJA DE JESSE E NÃO DEIXE NOAH PARA TRÁS.");
        this.callbacks.onCheckpoint(`chapter5-jesse-${checkpoint}`);
        this.ui.showSubtitle("Noah", "Não é uma gravação. Ele voltou.", 2800);
        this.ui.showSoundCaption("a caixa de música ganha percussão metálica", 2600);
    }
    failJesseChase() {
        this.deathCount += 1;
        this.player.health = 100;
        this.ui.flashDamage(1);
        this.ui.showSoundCaption("as mãos de Jesse fecham o corredor", 2200);
        this.player.teleport(this.checkpoints.finalJesse.clone(), 0);
        this.noah.teleport(this.checkpoints.finalJesse.add(new Vector3(2, 0, 1)));
        this.noah.setFollow();
        this.jesse.resetChase(new Vector3(-7, 5.8, 1816), Math.max(0, this.jesseCheckpoint));
        this.callbacks.onPlayerDamaged();
    }
    updateMannequinReturn(deltaSeconds) {
        if (this.phase !== "mannequin-return")
            return;
        this.mannequinLightClock -= deltaSeconds;
        if (this.mannequinLightClock <= 0) {
            this.mannequinLightClock = this.settings.reducedFlashing ? 3.8 : 2.2;
            this.mannequinLightOn = !this.mannequinLightOn;
            this.ui.showSoundCaption(this.mannequinLightOn ? "as luzes de emergência retornam" : "o trilho mergulha no escuro", 1200);
        }
        const forward = this.player.forward();
        for (const mannequin of this.mannequins) {
            const toMannequin = mannequin.root.position.subtract(this.player.camera.globalPosition);
            const distance = toMannequin.length();
            const direction = distance > 0 ? toMannequin.scale(1 / distance) : Vector3.Zero();
            const direct = Vector3.Dot(forward, direction) > 0.68 && distance < 24 && this.mannequinLightOn;
            if (direct) {
                mannequin.lastObserved = performance.now();
                continue;
            }
            if (this.fire.isTorchThreatNear(mannequin.root.position)) {
                const away = mannequin.root.position.subtract(this.player.collider.position);
                away.y = 0;
                if (away.lengthSquared() > 0.001) {
                    this.moveSceneMobSafely(mannequin.root, away.normalize().scale(deltaSeconds * 4.8));
                    mannequin.root.rotation.y = Math.atan2(away.x, away.z);
                    mannequin.moved = true;
                }
                continue;
            }
            if (distance < 18 && performance.now() - mannequin.lastObserved > 260) {
                const towardPlayer = this.player.collider.position.subtract(mannequin.root.position);
                towardPlayer.y = 0;
                if (towardPlayer.length() > 2.3)
                    this.moveSceneMobSafely(mannequin.root, towardPlayer.normalize().scale(deltaSeconds * 1.9));
                mannequin.root.rotation.y = Math.atan2(towardPlayer.x, towardPlayer.z);
                mannequin.moved = true;
                if (distance < 2.4) {
                    this.player.damage(8);
                    this.ui.flashDamage(0.42);
                    this.moveSceneMobSafely(mannequin.root, towardPlayer.normalize().scale(-4));
                }
            }
        }
    }
    moveSceneMobSafely(root, movement) {
        const horizontal = movement.clone();
        horizontal.y = 0;
        if (horizontal.lengthSquared() < 0.000001)
            return false;
        const belongsToRoot = (mesh) => {
            let current = mesh;
            while (current) {
                if (current === root)
                    return true;
                current = current.parent ?? null;
            }
            return false;
        };
        const canMove = (delta) => {
            const distance = delta.length();
            if (distance < 0.0001)
                return true;
            const direction = delta.scale(1 / distance);
            const side = new Vector3(-direction.z, 0, direction.x).scale(0.36);
            const base = root.position.add(new Vector3(0, 0.85, 0));
            const origins = [base, base.add(side), base.subtract(side)];
            return origins.every((origin) => {
                const pick = this.scene.pickWithRay(new Ray(origin, direction, distance + 0.44), (mesh) => {
                    if (!mesh.checkCollisions || !mesh.isEnabled() || mesh === this.player.collider)
                        return false;
                    return !belongsToRoot(mesh);
                });
                return !pick?.hit || pick.distance > distance + 0.32;
            });
        };
        if (canMove(horizontal)) {
            root.position.addInPlace(horizontal);
            return true;
        }
        const axes = [new Vector3(horizontal.x, 0, 0), new Vector3(0, 0, horizontal.z)]
            .sort((a, b) => b.lengthSquared() - a.lengthSquared());
        let moved = false;
        for (const axis of axes) {
            if (axis.lengthSquared() > 0.000001 && canMove(axis)) {
                root.position.addInPlace(axis);
                moved = true;
            }
        }
        return moved;
    }
    updateBridge(deltaSeconds) {
        if (this.phase !== "bridge")
            return;
        for (const section of this.bridgeSections) {
            const distance = Math.abs(this.player.collider.position.z - section.mesh.position.z);
            if (!section.falling && !section.fallen && distance < 2 && section.index < this.bridgeSections.length - 2) {
                section.falling = true;
                this.audio.impact(0.55);
                this.ui.showSoundCaption("a seção da ponte começa a ceder", 1100);
            }
            if (section.falling) {
                section.mesh.position.y -= deltaSeconds * (0.5 + section.index * 0.035);
                section.mesh.rotation.x += deltaSeconds * 0.22;
                if (section.mesh.position.y < section.baseY - 6) {
                    section.falling = false;
                    section.fallen = true;
                    section.mesh.checkCollisions = false;
                }
            }
        }
        if (this.player.collider.position.y < 1.4) {
            this.deathCount += 1;
            this.player.health = 100;
            this.player.teleport(this.checkpoints.bridge.clone(), 0);
            this.noah.teleport(this.checkpoints.bridge.add(new Vector3(1.5, 0, 1.5)));
            this.noah.setFollow();
            this.resetBridge();
            this.callbacks.onPlayerDamaged();
        }
    }
    updateFinalReaders(deltaSeconds) {
        if (this.phase !== "exit")
            return;
        if (this.playerReaderReady) {
            this.readerClock -= deltaSeconds;
            if (this.readerClock <= 0 && !this.noahReaderReady) {
                this.playerReaderReady = false;
                this.playerReader.material = this.materials.emissive("body-card-reader-reset", new Color3(0.48, 0.06, 0.045), 0.55);
                this.ui.showSubtitle("Sistema", "SINCRONIA EXPIRADA.", 1600);
            }
        }
    }
    synchronizeFinalExit() {
        if (!this.playerReaderReady || !this.noahReaderReady || this.readerClock <= 0) {
            this.ui.toast("Os leitores precisam ser ativados dentro da mesma janela.");
            return;
        }
        this.finalSequenceLocked = true;
        this.player.setEnabled(false);
        this.player.releasePointerLock();
        this.noah.wait();
        this.audio.electricalBurst(this.playerReader.position);
        this.exitDoorLeft.position.x -= 5;
        this.exitDoorRight.position.x += 5;
        this.exitDoorLeft.checkCollisions = false;
        this.exitDoorRight.checkCollisions = false;
        this.exitDoorBlocker.setEnabled(false);
        this.exitDoorBlocker.checkCollisions = false;
        this.ui.showSubtitle("Sistema", "CORPO E IDENTIDADE CONFIRMADOS. SAÍDA DE EMERGÊNCIA LIBERADA.", 3800);
        window.setTimeout(() => {
            this.phase = "authorities";
            this.player.teleport(this.checkpoints.authorities.clone(), 0);
            this.noah.teleport(this.checkpoints.authorities.add(new Vector3(2.2, 0, 2.4)));
            this.noah.wait();
            this.player.setEnabled(true);
            this.callbacks.onCheckpoint("chapter5-authorities");
            this.finishTrueEnding();
        }, 2400);
    }
    finishTrueEnding() {
        if (this.trueEndingDiscovered)
            return;
        this.trueEndingDiscovered = true;
        this.phase = "authorities";
        this.callbacks.onEndingDiscovered("saved-by-authorities");
        this.audio.stopAll();
        this.audio.startRain();
        this.ui.showChapterCard("FINAL VERDADEIRO", "SALVOS PELAS AUTORIDADES", 5400).then(() => {
            this.finalDialogueSeen = true;
            this.ui.showSubtitle("Noah", "Quando eles perguntarem o que aconteceu, você acha que vão acreditar?", 4200);
            window.setTimeout(() => {
                const line = this.mimicAttackCount > 12
                    ? "Eu não sei se vou acreditar em tudo que eu disser. Mas você estava lá para corrigir o que eu esquecer."
                    : "Não precisam acreditar em tudo. Só precisam abrir os arquivos antes que alguém os feche de novo.";
                this.ui.showSubtitle("Protagonista", line, 5600);
            }, 2500);
            window.setTimeout(() => this.beginCredits(), 7200);
        });
    }
    beginCredits() {
        if (this.phase === "credits" && this.creditsSeen)
            return;
        this.phase = "credits";
        this.creditsSeen = true;
        this.player.setEnabled(false);
        this.player.releasePointerLock();
        this.callbacks.onCheckpoint("true-ending");
        this.ui.showFinalCredits({
            title: "ATRAÇÃO FINAL",
            ending: "FINAL VERDADEIRO — SALVOS PELAS AUTORIDADES",
            documents: this.documents.size + this.rescuedDocuments.size,
            deaths: this.deathCount,
            completionSeconds: Math.round(this.completionSeconds),
            endings: this.callbacks.getEndingCount(),
            postDefeatAttacks: this.mimicAttackCount,
            rescuedRecords: this.rescuedDocuments.size
        }, () => this.beginPostCredits());
    }
    beginPostCredits() {
        if (this.postCreditsSeen)
            return;
        this.phase = "post-credits";
        this.postCreditsSeen = true;
        this.callbacks.onCheckpoint("post-credits");
        this.ui.showPostCredits(() => {
            this.phase = "complete";
            this.chapterComplete = true;
            this.callbacks.onCheckpoint("campaign-complete");
            this.callbacks.onChapterComplete();
        });
    }
    updateAuthorities(deltaSeconds) {
        if (this.phase !== "authorities" && this.phase !== "credits")
            return;
        this.authorityClock += deltaSeconds;
        if (this.finalNose) {
            this.finalNose.rotation.z = Math.sin(this.authorityClock * 0.42) * 0.025;
            this.finalNose.position.x += Math.sin(this.authorityClock * 0.25) * deltaSeconds * 0.004;
        }
    }
    updateMirrors(deltaSeconds) {
        this.mirrorRefreshClock -= deltaSeconds;
        if (this.mirrorRefreshClock > 0)
            return;
        const nearMirror = this.player.collider.position.z < 1660;
        this.mirrorRefreshClock = nearMirror ? 0.08 : this.settings.performancePreset === "performance" ? 1.2 : 0.45;
        this.mirrorTextures.forEach((texture) => { texture.refreshRate = nearMirror ? 1 : 0; });
    }
    handleNoahReachedTarget(tag) {
        if (tag === "archive-heavy-handle") {
            const door = this.doors.find((entry) => entry.mesh === this.cooperativeDoor);
            if (door)
                door.open = true;
            this.noah.holdAt(this.noah.position, "holding-heavy-door");
            this.ui.toast("Noah mantém a trava aberta. Atravesse.", 2400);
        }
        else if (tag === "body-beam") {
            this.ui.toast("Noah está pronto para erguer a viga.", 1600);
        }
        else if (tag === "final-blast-control") {
            const door = this.doors.find((entry) => entry.mesh === this.blastDoor);
            if (door)
                door.open = true;
            this.escapeSegment = 5;
            this.noah.wait();
            this.ui.showSubtitle("Noah", "A porta vai fechar. Me puxa quando eu passar!", 2500);
        }
        else if (tag === "identity-reader") {
            this.noahReaderReady = true;
            this.noahReader.material = this.materials.emissive("identity-reader-ready", new Color3(0.1, 0.8, 0.18), 0.85);
            this.ui.showSoundCaption("o Cartão da Identidade de Noah é reconhecido", 1600);
        }
    }
    pathObstructed(from, to) {
        const direction = to.subtract(from);
        const distance = direction.length();
        if (distance <= 0.01)
            return false;
        const ray = new Ray(from, direction.scale(1 / distance), distance);
        const pick = this.scene.pickWithRay(ray, (mesh) => mesh.checkCollisions && mesh.isEnabled() && mesh.isVisible);
        return Boolean(pick?.hit && pick.distance < distance - 0.4);
    }
    applyPersistentVisualState() {
        this.proofBarrier.position.y = this.proofComplete ? 5.6 : 1.85;
        this.proofBarrier.checkCollisions = !this.proofComplete;
        this.proofStations.forEach((station) => { station.used = this.proofAnswers.has(station.id); });
        this.archiveRecords.forEach((record) => { record.mesh.visibility = this.documents.has(record.id) ? 0.55 : 1; });
        this.childhoodToken.setEnabled(!this.inventory.has("childhoodToken") && !this.flashbacksSeen.has("token-memory"));
        if (this.collapseStarted) {
            this.cooperativeDoor.position.copyFrom(this.cooperativeDoor.position.add(new Vector3(0, 0, 0)));
            this.fire.igniteAt(new Vector3(-10, 0.4, 1660), 18, true);
        }
        if (this.escapeSegment >= 2)
            this.bodyBeam.position.y = 3.1;
        if (this.trueEndingDiscovered) {
            this.exitDoorLeft.position.x = -7.3;
            this.exitDoorRight.position.x = 7.3;
            this.exitDoorLeft.checkCollisions = false;
            this.exitDoorRight.checkCollisions = false;
            this.exitDoorBlocker.setEnabled(false);
            this.exitDoorBlocker.checkCollisions = false;
        }
    }
    updateDoors(deltaSeconds) {
        for (const door of this.doors) {
            const target = door.open ? door.base.add(door.offset) : door.base;
            door.mesh.position = Vector3.Lerp(door.mesh.position, target, Math.min(1, deltaSeconds * 3.4));
            const lifted = Vector3.Distance(door.mesh.position, door.base);
            const passageBlocked = !door.open || lifted < 3.35;
            door.mesh.checkCollisions = passageBlocked;
            door.blocker.setEnabled(passageBlocked);
            door.blocker.checkCollisions = passageBlocked;
        }
    }
    resetBridge() {
        for (const section of this.bridgeSections) {
            section.falling = false;
            section.fallen = false;
            section.mesh.position.y = section.baseY;
            section.mesh.rotation.x = 0;
            section.mesh.checkCollisions = true;
        }
    }
    createRoom(name, center, width, height, depth, material, variant) {
        const floor = MeshBuilder.CreateBox(`${name}-floor`, { width, height: 0.3, depth }, this.scene);
        floor.parent = this.root;
        floor.position = new Vector3(center.x, center.y - height / 2, center.z);
        floor.material = this.materials.get(material, variant);
        floor.checkCollisions = true;
        const ceiling = MeshBuilder.CreateBox(`${name}-ceiling`, { width, height: 0.25, depth }, this.scene);
        ceiling.parent = this.root;
        ceiling.position = new Vector3(center.x, center.y + height / 2, center.z);
        ceiling.material = this.materials.get(material === "wood" ? "metal" : material, variant + 1);
        ceiling.checkCollisions = true;
        const left = MeshBuilder.CreateBox(`${name}-left-wall`, { width: 0.35, height, depth }, this.scene);
        left.parent = this.root;
        left.position = new Vector3(center.x - width / 2, center.y, center.z);
        left.material = this.materials.get(material, variant + 2);
        left.checkCollisions = true;
        const right = left.clone(`${name}-right-wall`);
        if (!right)
            throw new Error(`Unable to clone room wall: ${name}`);
        right.parent = this.root;
        right.position.x = center.x + width / 2;
        for (let index = 0; index < Math.max(1, Math.floor(depth / 14)); index += 1) {
            const light = new PointLight(`${name}-light-${index}`, new Vector3(center.x, center.y + height / 2 - 0.7, center.z - depth / 2 + 7 + index * 13), this.scene);
            light.parent = this.root;
            light.diffuse = material === "burned" ? new Color3(0.8, 0.14, 0.035) : new Color3(0.58, 0.67, 0.72);
            light.intensity = material === "burned" ? 0.75 : 1.05;
            light.range = 14;
        }
    }
    createCorridor(name, center, width, height, depth, material, variant) {
        this.createRoom(name, center, width, height, depth, material, variant);
    }
    createDoor(name, position, offset, material, variant) {
        const mesh = MeshBuilder.CreateBox(name, { width: 8, height: 4.2, depth: 0.5 }, this.scene);
        mesh.parent = this.root;
        mesh.position.copyFrom(position);
        mesh.rotation.y = 0;
        mesh.material = this.materials.get(material, variant);
        mesh.checkCollisions = true;
        const wallHeight = name === "cooperative-archive-door" ? 8 : 9;
        // Chapter 5 rooms intentionally have open ends. These doors therefore need
        // a complete transverse bulkhead, not an eight-metre decorative frame floating
        // in a forty-metre opening.
        const openingSpan = name === "cooperative-archive-door" ? 42 : 28;
        const blocker = this.createDoorFrame(name, position, 8, 4.2, mesh.rotation.y, material, variant + 1, openingSpan, wallHeight);
        this.doors.push({ mesh, blocker, base: position.clone(), offset: new Vector3(8.8, 0, 0), open: false });
        return mesh;
    }
    createDoorFrame(name, position, width, height, rotationY, material, variant, openingSpan = width, wallHeight = height + 0.8) {
        const frame = new TransformNode(`${name}-frame-root`, this.scene);
        frame.parent = this.root;
        frame.position.copyFrom(position);
        frame.rotation.y = rotationY;
        const frameMaterial = this.materials.get(material, variant);
        const make = (suffix, size, local, collisions = true) => {
            const part = MeshBuilder.CreateBox(`${name}-frame-${suffix}`, size, this.scene);
            part.parent = frame;
            part.position.copyFrom(local);
            part.material = frameMaterial;
            part.checkCollisions = collisions;
            part.isPickable = false;
            part.metadata = { doorFrame: true, interactionPassthrough: true };
        };
        const jamb = 0.34;
        make("left", { width: jamb, height: height + 0.5, depth: 0.82 }, new Vector3(-width / 2 - jamb / 2, 0, 0));
        make("right", { width: jamb, height: height + 0.5, depth: 0.82 }, new Vector3(width / 2 + jamb / 2, 0, 0));
        make("lintel", { width: width + jamb * 2, height: 0.34, depth: 0.82 }, new Vector3(0, height / 2 + 0.17, 0));
        make("threshold", { width: width + jamb * 2, height: 0.08, depth: 0.82 }, new Vector3(0, -height / 2 + 0.04, 0), false);
        const wingWidth = Math.max(0, (openingSpan - width - jamb * 2) / 2);
        const wallCenterY = wallHeight / 2 - position.y;
        if (wingWidth > 0.03) {
            make("bulkhead-left", { width: wingWidth, height: wallHeight, depth: 0.82 }, new Vector3(-width / 2 - jamb - wingWidth / 2, wallCenterY, 0));
            make("bulkhead-right", { width: wingWidth, height: wallHeight, depth: 0.82 }, new Vector3(width / 2 + jamb + wingWidth / 2, wallCenterY, 0));
        }
        const upperHeight = Math.max(0, wallHeight - (position.y + height / 2));
        if (upperHeight > 0.08)
            make("bulkhead-upper", { width: Math.max(openingSpan, width + jamb * 2), height: upperHeight, depth: 0.82 }, new Vector3(0, height / 2 + upperHeight / 2, 0));
        const blocker = MeshBuilder.CreateBox(`${name}-doorway-blocker`, { width: Math.max(openingSpan, width + 0.82), height: wallHeight, depth: 1.3 }, this.scene);
        blocker.position.y = wallCenterY;
        blocker.parent = frame;
        blocker.visibility = 0;
        blocker.isPickable = false;
        blocker.checkCollisions = true;
        blocker.metadata = { doorwayBlocker: true, interactionPassthrough: true };
        return blocker;
    }
    createArchiveSign(index) {
        const texture = new DynamicTexture(`archive-sign-texture-${index}`, { width: 512, height: 256 }, this.scene, false);
        const context = texture.getContext();
        context.fillStyle = index % 3 === 0 ? "#d8d0b3" : "#2a302f";
        context.fillRect(0, 0, 512, 256);
        context.strokeStyle = index % 3 === 0 ? "#541c17" : "#b8aa7c";
        context.lineWidth = 14;
        context.strokeRect(12, 12, 488, 232);
        context.fillStyle = index % 3 === 0 ? "#351914" : "#d9d1af";
        context.font = "bold 38px monospace";
        context.textAlign = "center";
        const lines = ["REGISTROS", "VISITANTE PERMANENTE", "NÍVEL CENTRAL", "MEMÓRIA", "IDENTIDADE", "RETENÇÃO"];
        context.fillText(lines[index % lines.length] ?? "ARQUIVO", 256, 116);
        context.font = "22px monospace";
        context.fillText(`SETOR ${String(index + 1).padStart(2, "0")}`, 256, 164);
        texture.update(false);
        const material = new PBRMaterial(`archive-sign-material-${index}`, this.scene);
        material.albedoTexture = texture;
        material.roughness = 0.84;
        const sign = MeshBuilder.CreatePlane(`archive-sign-${index}`, { width: 3.3, height: 1.65 }, this.scene);
        sign.material = material;
        return sign;
    }
    createEmergencyVehicle(index) {
        const root = new TransformNode(`emergency-vehicle-${index}`, this.scene);
        const government = index % 5 === 0;
        const ambulance = index % 3 === 0;
        const body = MeshBuilder.CreateBox(`vehicle-body-${index}`, { width: 3.4, height: ambulance ? 1.8 : 1.2, depth: ambulance ? 6.2 : 5 }, this.scene);
        body.parent = root;
        body.position.y = 0.9;
        body.material = this.materials.solid(`vehicle-body-material-${index}`, government ? new Color3(0.055, 0.07, 0.055) : ambulance ? new Color3(0.65, 0.67, 0.62) : new Color3(0.08, 0.12, 0.16), 0.5, 0.35);
        for (let wheelIndex = 0; wheelIndex < 4; wheelIndex += 1) {
            const wheel = MeshBuilder.CreateCylinder(`vehicle-wheel-${index}-${wheelIndex}`, { height: 0.34, diameter: 0.85, tessellation: 12 }, this.scene);
            wheel.parent = root;
            wheel.rotation.z = Math.PI / 2;
            wheel.position = new Vector3(wheelIndex % 2 ? 1.72 : -1.72, 0.48, wheelIndex < 2 ? -1.7 : 1.7);
            wheel.material = this.materials.solid(`vehicle-wheel-material-${index}`, new Color3(0.025, 0.025, 0.025), 0.95);
        }
        const beacon = new PointLight(`vehicle-beacon-${index}`, new Vector3(0, 2.1, 0), this.scene);
        beacon.parent = root;
        beacon.diffuse = index % 2 ? new Color3(0.1, 0.25, 1) : new Color3(1, 0.05, 0.03);
        beacon.intensity = 2.3;
        beacon.range = 13;
        return root;
    }
    createAuthoritySilhouette(index) {
        const root = new TransformNode(`authority-person-${index}`, this.scene);
        const torso = MeshBuilder.CreateCapsule(`authority-torso-${index}`, { height: 1.35, radius: 0.28, tessellation: 8 }, this.scene);
        torso.parent = root;
        torso.position.y = 1.35;
        torso.material = this.materials.solid(`authority-uniform-${index % 4}`, index % 5 === 0 ? new Color3(0.16, 0.19, 0.12) : new Color3(0.06, 0.09, 0.13), 0.82);
        const head = MeshBuilder.CreateSphere(`authority-head-${index}`, { diameter: 0.48, segments: 8 }, this.scene);
        head.parent = root;
        head.position.y = 2.35;
        head.material = this.materials.solid(`authority-skin-${index % 3}`, new Color3(0.36 + (index % 3) * 0.09, 0.25 + (index % 3) * 0.06, 0.2 + (index % 3) * 0.05), 0.84);
        return root;
    }
}
