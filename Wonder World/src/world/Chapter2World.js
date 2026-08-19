import { Color3 } from "@babylonjs/core/Maths/math.color";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { MirrorTexture } from "@babylonjs/core/Materials/Textures/mirrorTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import { Ray } from "@babylonjs/core/Culling/ray";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { MannequinSystem } from "../entities/MannequinSystem.js";
export const CHAPTER2_ITEMS = {
    energyCell1: { id: "energyCell1", name: "Célula de energia I", description: "Célula cerâmica retirada da sala de espelhos." },
    energyCell2: { id: "energyCell2", name: "Célula de energia II", description: "Célula industrial recuperada no depósito de manequins." },
    energyCell3: { id: "energyCell3", name: "Célula de energia III", description: "Célula de controle marcada com um símbolo de olho riscado." },
    metalCan: { id: "metalCan", name: "Lata de teste", description: "Pode ser arremessada para produzir ruído." },
    soundEmitter: { id: "soundEmitter", name: "Emissor portátil", description: "Buzzer de teste recarregável que atrai manequins por alguns segundos." }
};
export class Chapter2World {
    checkpoints = {
        chapter2Elevator: new Vector3(0, 0.12, 198),
        mannequinCorridor: new Vector3(0, 0.12, 224),
        modeling: new Vector3(0, 0.12, 252),
        mirrorRoom: new Vector3(-21, 0.12, 278),
        storage: new Vector3(22, 0.12, 282),
        controlRoom: new Vector3(-22, 0.12, 318),
        machine: new Vector3(0, 0.12, 352),
        arena1: new Vector3(0, 0.12, 390),
        arena2: new Vector3(0, 0.12, 430),
        arena3: new Vector3(0, 0.12, 474),
        maya: new Vector3(0, 0.12, 502),
        chapter3: new Vector3(0, 0.12, 531)
    };
    active = false;
    energyCells = new Set();
    mirrorSolved = false;
    shelfSolved = false;
    controlRoomSolved = false;
    machineActivated = false;
    ruleCollapsed = false;
    completedArenas = new Set();
    mayaEventSeen = false;
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
    mannequins;
    mirrors = [];
    shelves = [];
    thrownObjects = [];
    debrisPool = [];
    chapterLights = [];
    emergencyLights = [];
    machineRedLights = [];
    mirrorTargets = [];
    cellMeshes = [];
    machineCables = [false, false, false, false];
    machineLocks = [false, false, false];
    backupSwitches = [false, false, false];
    machineCableMeshes = [];
    machineLockMeshes = [];
    machinePressure = 0;
    machineCellsInstalled = false;
    machineCardInserted = false;
    machineTrackAligned = false;
    trackSwitchState = 0;
    arena2Blockers = [false, false];
    arena2RequiredRoute = 1;
    arena3Pass = 0;
    shelfPositions = [1, 1, 1];
    mirrorAngles = [0, 0, 0, 0];
    blackoutActive = false;
    blackoutTimer = 11;
    blackoutElapsed = 0;
    blackoutDamageCooldown = 0;
    controlRoomEntered = false;
    ruleCollapseProgress = 0;
    ruleMessageStage = 0;
    openingElapsed = 0;
    openingComplete = false;
    corridorLessonTriggered = false;
    modelingObjectiveTriggered = false;
    torchDisabled = true;
    settings;
    sphere;
    sphereState = "docked";
    sphereSpeed = 0;
    sphereTarget = Vector3.Zero();
    sphereDamageCooldown = 0;
    arena3HydraulicTimer = 6.5;
    arena3HydraulicWarning = false;
    arena3HydraulicDamageCooldown = 0;
    activeArena = 0;
    crushCountThisRun = 0;
    mayaSequenceTime = -1;
    mayaRoot = null;
    mayaHead = null;
    mayaOriginalPositions = null;
    exitTriggered = false;
    lastRearCue = 0;
    mirrorRenderAccumulator = 0;
    documentMeshes = new Map();
    observationDoors = [];
    soundDeviceMarker = null;
    soundDeviceCooldown = 0;
    meleeCooldown = 0;
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
        this.root = new TransformNode("chapter2-root", scene);
        this.mannequins = new MannequinSystem(scene, materials, player, audio, ui, fire, this.createMannequinSpawns(), (amount) => this.damagePlayer(amount), settings.performancePreset === "performance" ? 10 : 14);
        this.mannequins.setMirrorResolver((position) => this.isObservedThroughMirror(position));
    }
    build() {
        this.createArchitecture();
        this.createObservationDoors();
        this.createElevatorSequenceSet();
        this.createMannequinCorridor();
        this.createModelingDepartment();
        this.createMirrorRoom();
        this.createStorageWarehouse();
        this.createControlRoom();
        this.createCentralMachine();
        this.createSphereArenas();
        this.createMayaAndExitRoute();
        this.createDocuments();
        this.createThrownObjectPool();
        this.createDebrisPool();
        this.root.setEnabled(false);
        this.mannequins.setChapterEnabled(false);
    }
    startFromElevator() {
        this.active = true;
        this.root.setEnabled(true);
        this.mannequins.setChapterEnabled(true);
        this.mannequins.setMovementEnabled(false);
        this.player.teleport(this.checkpoints.chapter2Elevator.clone(), Math.PI);
        this.player.setEnabled(false);
        this.openingElapsed = 0;
        this.openingComplete = false;
        this.torchDisabled = true;
        this.fire.torchLit = false;
        this.audio.stopLoop("rain");
        this.audio.startInteriorHum();
        this.audio.startIndustrialDepths();
        this.startChapterSpatialAudio();
        this.objective.set("chapter2-descend", "AGUARDE O ELEVADOR CONCLUIR A DESCIDA.");
        for (const mirror of this.mirrors)
            mirror.texture.refreshRate = this.settings.performancePreset === "performance" ? 4 : 2;
    }
    enableForDebug() {
        this.active = true;
        this.root.setEnabled(true);
        this.mannequins.setChapterEnabled(true);
        this.mannequins.setMovementEnabled(true);
        this.openingComplete = true;
        this.openingElapsed = 10;
        this.torchDisabled = false;
        this.player.setEnabled(true);
        this.startChapterSpatialAudio();
        for (const mirror of this.mirrors)
            mirror.texture.refreshRate = this.settings.performancePreset === "performance" ? 4 : 2;
    }
    restore(progress, checkpoint) {
        this.active = true;
        this.root.setEnabled(true);
        this.mannequins.setChapterEnabled(true);
        this.openingComplete = true;
        this.openingElapsed = 10;
        this.torchDisabled = false;
        this.energyCells = new Set(progress.energyCells);
        this.mirrorAngles = [...progress.mirrorAngles];
        this.mirrorSolved = progress.mirrorSolved;
        this.shelfPositions = [...progress.shelfPositions];
        this.shelfSolved = progress.shelfSolved;
        progress.backupSwitches.forEach((value, index) => this.backupSwitches[index] = value ?? false);
        this.controlRoomSolved = progress.controlRoomSolved;
        progress.machineCables.forEach((value, index) => this.machineCables[index] = value ?? false);
        this.machinePressure = progress.machinePressure;
        this.machineCellsInstalled = progress.machineCellsInstalled;
        this.machineCardInserted = progress.machineCardInserted;
        this.machineTrackAligned = progress.machineTrackAligned;
        progress.machineLocks.forEach((value, index) => this.machineLocks[index] = value ?? false);
        this.machineActivated = progress.machineActivated;
        this.ruleCollapsed = progress.ruleCollapsed;
        this.ruleCollapseProgress = progress.ruleCollapsed ? 1 : progress.machineActivated ? 0.4 : 0;
        this.completedArenas = new Set(progress.completedArenas);
        this.mayaEventSeen = progress.mayaEventSeen;
        this.collectedDocuments = new Set(progress.collectedDocuments);
        this.sphereState = progress.sphereState;
        this.activeArena = progress.activeArena;
        this.trackSwitchState = progress.trackSwitchState;
        progress.arena2Blockers.forEach((value, index) => this.arena2Blockers[index] = value ?? false);
        this.arena3Pass = progress.arena3Pass;
        this.applyRestoredVisualState();
        this.mannequins.setMovementEnabled(true);
        this.mannequins.setRuleCollapse(this.ruleCollapseProgress);
        this.player.teleport(this.destinationForCheckpoint(checkpoint), Math.PI);
        this.player.setEnabled(true);
        this.startChapterSpatialAudio();
        if (this.machineActivated)
            this.audio.startMachineAlarm();
        if (this.mayaEventSeen)
            this.audio.startMusicBoxTheme();
        for (const mirror of this.mirrors)
            mirror.texture.refreshRate = this.settings.performancePreset === "performance" ? 4 : 2;
    }
    serialize() {
        return {
            energyCells: [...this.energyCells],
            mirrorAngles: [...this.mirrorAngles],
            mirrorSolved: this.mirrorSolved,
            shelfPositions: [...this.shelfPositions],
            shelfSolved: this.shelfSolved,
            backupSwitches: [...this.backupSwitches],
            controlRoomSolved: this.controlRoomSolved,
            machineCables: [...this.machineCables],
            machineCellsInstalled: this.machineCellsInstalled,
            machinePressure: this.machinePressure,
            machineCardInserted: this.machineCardInserted,
            machineTrackAligned: this.machineTrackAligned,
            machineLocks: [...this.machineLocks],
            machineActivated: this.machineActivated,
            ruleCollapsed: this.ruleCollapsed,
            completedArenas: [...this.completedArenas],
            mayaEventSeen: this.mayaEventSeen,
            collectedDocuments: [...this.collectedDocuments],
            sphereState: this.sphereState === "docked" ? "docked" : "settled",
            activeArena: this.activeArena,
            trackSwitchState: this.trackSwitchState,
            arena2Blockers: [...this.arena2Blockers],
            arena3Pass: this.arena3Pass
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
        const nearest = (points) => {
            if (points.length === 0)
                return null;
            return points.sort((a, b) => Vector3.Distance(a, player) - Vector3.Distance(b, player))[0].clone();
        };
        if (objectiveId === "recover-cells") {
            const tasks = [];
            if (!this.mirrorSolved)
                tasks.push(meshPoint("mirror-observation-console", this.checkpoints.mirrorRoom));
            else if (!this.energyCells.has("energyCell1"))
                tasks.push(meshPoint("chapter2-energy-cell-1", this.checkpoints.mirrorRoom));
            if (!this.shelfSolved)
                tasks.push(meshPoint("rolling-shelf-handle-0", this.checkpoints.storage));
            else if (!this.energyCells.has("energyCell2"))
                tasks.push(meshPoint("chapter2-energy-cell-2", this.checkpoints.storage));
            if (!this.controlRoomSolved) {
                const pendingSwitches = this.backupSwitches
                    .map((active, index) => active ? null : meshPoint(`backup-switch-${index}`, this.checkpoints.controlRoom))
                    .filter((point) => point !== null);
                tasks.push(...pendingSwitches);
            }
            else if (!this.energyCells.has("energyCell3"))
                tasks.push(meshPoint("chapter2-energy-cell-3", this.checkpoints.controlRoom));
            return nearest(tasks) ?? this.checkpoints.machine.clone();
        }
        if (objectiveId === "blackout-control") {
            const switches = this.backupSwitches
                .map((active, index) => active ? null : meshPoint(`backup-switch-${index}`, this.checkpoints.controlRoom))
                .filter((point) => point !== null);
            return nearest(switches) ?? this.checkpoints.controlRoom.clone();
        }
        if (objectiveId === "activate-machine") {
            const tasks = [];
            this.machineCables.forEach((active, index) => { if (!active)
                tasks.push(meshPoint(`machine-cable-socket-${index}`, this.checkpoints.machine)); });
            if (!this.machineCellsInstalled)
                tasks.push(meshPoint("machine-cell-bank", this.checkpoints.machine));
            if (this.machinePressure !== 2)
                tasks.push(meshPoint("machine-pressure-console", this.checkpoints.machine));
            if (!this.machineCardInserted)
                tasks.push(meshPoint("machine-body-card-reader", this.checkpoints.machine));
            if (!this.machineTrackAligned)
                tasks.push(meshPoint("machine-track-lever", this.checkpoints.machine));
            this.machineLocks.forEach((active, index) => { if (!active)
                tasks.push(meshPoint(`machine-release-lock-${index}`, this.checkpoints.machine)); });
            return nearest(tasks) ?? this.checkpoints.machine.clone();
        }
        return null;
    }
    destinationForCheckpoint(checkpoint) {
        if (checkpoint.includes("mirror") || checkpoint.includes("cell-1"))
            return this.checkpoints.mirrorRoom.clone();
        if (checkpoint.includes("storage") || checkpoint.includes("cell-2"))
            return this.checkpoints.storage.clone();
        if (checkpoint.includes("control") || checkpoint.includes("cell-3"))
            return this.checkpoints.controlRoom.clone();
        if (checkpoint.includes("three-cells") || checkpoint.includes("machine") || checkpoint.includes("rule-collapsed"))
            return this.checkpoints.machine.clone();
        if (checkpoint.includes("arena-1"))
            return this.checkpoints.arena1.clone();
        if (checkpoint.includes("arena-2"))
            return this.checkpoints.arena2.clone();
        if (checkpoint.includes("arena-3"))
            return this.checkpoints.arena3.clone();
        if (checkpoint.includes("maya"))
            return this.checkpoints.maya.clone();
        if (checkpoint.includes("chapter3"))
            return this.checkpoints.chapter3.clone();
        if (checkpoint.includes("elevator-arrival"))
            return this.checkpoints.mannequinCorridor.clone();
        return this.checkpoints.chapter2Elevator.clone();
    }
    update(deltaSeconds) {
        if (!this.active)
            return;
        this.updateOpening(deltaSeconds);
        this.updateObservationDoors(deltaSeconds);
        this.soundDeviceCooldown = Math.max(0, this.soundDeviceCooldown - deltaSeconds);
        this.meleeCooldown = Math.max(0, this.meleeCooldown - deltaSeconds);
        this.updateShelves(deltaSeconds);
        this.updateBlackout(deltaSeconds);
        this.updateRuleCollapse(deltaSeconds);
        this.updateSphere(deltaSeconds);
        this.updateArenaThreeHazard(deltaSeconds);
        this.updateThrownObjects(deltaSeconds);
        this.updateDebris(deltaSeconds);
        this.updateMayaSequence(deltaSeconds);
        this.updateAreaTriggers();
        this.mannequins.update(deltaSeconds);
        this.mirrorRenderAccumulator += deltaSeconds;
        if (this.mirrorRenderAccumulator > 0.8) {
            this.mirrorRenderAccumulator = 0;
            const renderList = this.mannequins.getReflectableMeshes();
            for (const mirror of this.mirrors)
                mirror.texture.renderList = renderList;
        }
        this.sphereDamageCooldown = Math.max(0, this.sphereDamageCooldown - deltaSeconds);
        this.blackoutDamageCooldown = Math.max(0, this.blackoutDamageCooldown - deltaSeconds);
        this.arena3HydraulicDamageCooldown = Math.max(0, this.arena3HydraulicDamageCooldown - deltaSeconds);
    }
    applySettings(settings) {
        this.settings = settings;
        const mannequinCount = settings.performancePreset === "performance" ? 62 : 80;
        this.mannequins.setCount(mannequinCount);
        for (const mirror of this.mirrors)
            mirror.texture.refreshRate = settings.performancePreset === "performance" ? 4 : 2;
    }
    canUseTorch() {
        return !this.active || !this.torchDisabled;
    }
    handlePrimaryAttack(charged) {
        if (!this.active || !this.inventory.has("crowbar") || !this.openingComplete)
            return false;
        if (this.meleeCooldown > 0)
            return true;
        const staminaCost = charged ? 34 : 16;
        if (!this.player.consumeStamina(staminaCost)) {
            this.ui.toast("Você precisa recuperar o fôlego.");
            return true;
        }
        this.meleeCooldown = charged ? 0.95 : 0.44;
        this.audio.clubSwing(charged);
        const hit = this.mannequins.attackNearest(this.player.camera.globalPosition, this.player.forward(), charged ? 3.4 : 2.7, charged ? 55 : 28, charged);
        if (hit) {
            this.audio.clubImpact(this.player.camera.globalPosition.add(this.player.forward().scale(1.8)), "plastic", charged);
            this.ui.showSoundCaption("plástico racha sob o impacto", 950);
        }
        return true;
    }
    resetEnemiesForPlayerRespawn() {
        this.mannequins.resetForPlayerRespawn();
    }
    throwNoiseObject() {
        if (!this.active || !this.openingComplete || this.mayaSequenceTime >= 0)
            return false;
        const object = this.thrownObjects.find((candidate) => !candidate.active);
        if (!object) {
            this.ui.toast("Você precisa esperar a lata parar de rolar.");
            return false;
        }
        const forward = this.player.camera.getForwardRay().direction.normalize();
        object.mesh.position.copyFrom(this.player.camera.globalPosition.add(forward.scale(0.75)));
        object.velocity.copyFrom(forward.scale(9).add(new Vector3(0, 2.3, 0)));
        object.life = 7;
        object.active = true;
        object.mesh.setEnabled(true);
        this.ui.showSoundCaption("uma lata corta o ar", 900);
        return true;
    }
    deploySoundDevice() {
        if (!this.active || !this.openingComplete)
            return false;
        if (!this.inventory.has("soundEmitter")) {
            this.ui.toast("Você ainda não encontrou um emissor portátil.");
            return false;
        }
        if (this.soundDeviceCooldown > 0) {
            this.ui.toast(`O emissor recarrega em ${Math.ceil(this.soundDeviceCooldown)} s.`);
            return false;
        }
        const forward = this.player.forward();
        const target = this.player.collider.position.add(forward.scale(5.5));
        target.y = 0.18;
        if (!this.soundDeviceMarker) {
            const marker = MeshBuilder.CreateCylinder("portable-sound-emitter-active", { height: 0.3, diameter: 0.55, tessellation: 12 }, this.scene);
            marker.parent = this.root;
            marker.material = this.materials.emissive("portable-emitter-active", new Color3(0.58, 0.09, 0.03), 0.75);
            marker.isPickable = false;
            this.soundDeviceMarker = marker;
        }
        this.soundDeviceMarker.position.copyFrom(target);
        this.soundDeviceMarker.setEnabled(true);
        this.soundDeviceCooldown = this.settings.extendedPuzzleWindows ? 9 : 12;
        this.audio.startTemporaryBuzzer(target, 6.5);
        this.mannequins.emitLure(target, 1.55, 7);
        this.ui.showSoundCaption("o emissor portátil repete um alarme metálico", 1400);
        window.setTimeout(() => this.soundDeviceMarker?.setEnabled(false), 6800);
        return true;
    }
    closeNearestRearDoor() {
        const playerPosition = this.player.collider.position;
        const forward = this.player.forward();
        const candidate = this.observationDoors
            .map((door) => ({ door, offset: new Vector3(door.mesh.position.x - playerPosition.x, 0, door.mesh.position.z - playerPosition.z) }))
            .map((entry) => ({ ...entry, distance: entry.offset.length() }))
            .filter((entry) => entry.distance < 5.5 && entry.distance > 0.1)
            .filter((entry) => Vector3.Dot(entry.offset.scale(1 / entry.distance), forward) < 0.35)
            .sort((a, b) => a.distance - b.distance)[0];
        if (!candidate) {
            this.ui.toast("Nenhuma porta de contenção está ao alcance atrás de você.", 1500);
            return false;
        }
        const door = candidate.door;
        const horizontalDistance = Vector3.Distance(new Vector3(playerPosition.x, 0, playerPosition.z), new Vector3(door.mesh.position.x, 0, door.mesh.position.z));
        if (door.open && horizontalDistance < 1.45) {
            this.ui.toast("Dê mais um passo antes de fechar a porta.");
            return false;
        }
        door.open = !door.open;
        this.audio.impact(0.55);
        this.ui.showSoundCaption(door.open ? "a porta sobe atrás de você" : "a porta fecha atrás de você", 1100);
        return true;
    }
    resetMirrorPuzzle() {
        this.mirrorSolved = false;
        this.mirrorAngles = [0, 0, 0, 0];
        this.mirrors.forEach((mirror) => {
            mirror.angleIndex = 0;
            mirror.pivot.rotation.y = mirror.baseAngle;
            this.updateMirrorPlane(mirror);
        });
        const collected = this.energyCells.has("energyCell1");
        this.cellMeshes[0]?.setEnabled(!collected);
        const container = this.scene.getMeshByName("mirror-cell-container-door");
        if (container) {
            container.position.y = collected ? 4.4 : 1.25;
            container.checkCollisions = !collected;
        }
        this.ui.toast("Sala de espelhos reiniciada.");
    }
    resetShelfPuzzle() {
        this.shelfSolved = false;
        this.shelfPositions = [1, 1, 1];
        this.shelves.forEach((shelf) => {
            shelf.state = 1;
            shelf.targetState = 1;
            shelf.root.position.z = shelf.baseZ;
        });
        const collected = this.energyCells.has("energyCell2");
        const door = this.scene.getMeshByName("storage-cell-cage-door");
        if (door) {
            door.position.y = collected ? 5.1 : 2;
            door.checkCollisions = !collected;
        }
        this.cellMeshes[1]?.setEnabled(!collected);
        this.ui.toast("Prateleiras devolvidas às posições seguras.");
    }
    forceBlackout() {
        this.controlRoomEntered = true;
        this.blackoutTimer = 0;
    }
    grantEnergyCells() {
        [1, 2, 3].forEach((index) => {
            const id = `energyCell${index}`;
            const item = CHAPTER2_ITEMS[id];
            if (item)
                this.inventory.add(item);
            this.energyCells.add(id);
            this.cellMeshes[index - 1]?.setEnabled(false);
        });
        this.mirrorSolved = true;
        this.shelfSolved = true;
        this.controlRoomSolved = true;
        this.objective.set("activate-machine", "ATIVE A MÁQUINA CENTRAL COM AS TRÊS CÉLULAS.");
    }
    startArena(index) {
        if (!this.machineActivated)
            this.activateMachine(true);
        this.activeArena = Math.max(1, Math.min(3, Math.round(index)));
        const destination = this.checkpoints[`arena${this.activeArena}`] ?? this.checkpoints.arena1;
        this.player.teleport(destination.clone(), Math.PI);
        this.prepareArena(this.activeArena);
    }
    toggleMannequinMovement() {
        const enabled = !this.debugMovementEnabled;
        this.debugMovementEnabled = enabled;
        this.mannequins.setMovementEnabled(enabled);
        return enabled;
    }
    toggleObservationVisualization() {
        return this.mannequins.toggleObservationVisualization();
    }
    toggleOcclusionVisualization() {
        return this.mannequins.toggleOcclusionVisualization();
    }
    setMannequinCount(count) {
        this.mannequins.setCount(count);
    }
    inspectState() {
        const ai = this.mannequins.inspect();
        return [
            `chapter2 active=${this.active} opening=${this.openingComplete}`,
            `cells=${[...this.energyCells].join(",") || "none"}`,
            `mirror=${this.mirrorSolved} shelves=${this.shelfSolved} control=${this.controlRoomSolved}`,
            `machine=${this.machineActivated} cables=${this.machineCables.join("")} pressure=${this.machinePressure} card=${this.machineCardInserted} track=${this.machineTrackAligned} locks=${this.machineLocks.join("")}`,
            `ruleCollapse=${ai.ruleCollapse.toFixed(2)} arenas=${[...this.completedArenas].join(",") || "none"}`,
            `mannequins enabled=${ai.enabled} observed=${ai.observed} actors=${ai.activeActors} running=${ai.running} crawling=${ai.crawling}`,
            `AI cost=${ai.aiCostMs.toFixed(2)}ms draw estimate=${ai.drawEstimate} scene meshes=${this.scene.meshes.length}`,
            `blackout=${this.blackoutActive} timer=${this.blackoutTimer.toFixed(1)} Maya=${this.mayaEventSeen}`
        ].join("\n");
    }
    debugMovementEnabled = true;
    startChapterSpatialAudio() {
        this.audio.createSpatialNoise("elevator-motor-depth", new Vector3(0, -3, 198), 0.05);
        this.audio.createSpatialNoise("chapter2-air-current", new Vector3(0, 3, 239), 0.065);
        this.audio.createSpatialNoise("chapter3-box-mechanism", new Vector3(0, 2, 534), 0.025);
    }
    createObservationDoors() {
        this.createObservationDoor("corridor-containment-door", new Vector3(0, 2.35, 245), 6.4, 4.7, 0);
        this.createObservationDoor("mirror-containment-door", new Vector3(-12.7, 2.35, 270), 5.8, 4.7, Math.PI / 2);
        this.createObservationDoor("storage-containment-door", new Vector3(13.7, 2.35, 272), 5.8, 4.7, Math.PI / 2);
        this.createObservationDoor("control-containment-door", new Vector3(-13.7, 2.35, 309), 5.8, 4.7, Math.PI / 2);
    }
    createObservationDoor(name, position, width, height, rotationY) {
        const door = MeshBuilder.CreateBox(name, { width, height, depth: 0.32 }, this.scene);
        door.parent = this.root;
        door.position.copyFrom(position.add(new Vector3(0, height + 0.5, 0)));
        door.rotation.y = rotationY;
        door.material = this.materials.get("metal", Math.round(position.z));
        door.checkCollisions = true;
        door.isPickable = true;
        const wallHeight = name.includes("storage") ? 7.2 : name.includes("control") ? 6 : 6.4;
        const blocker = this.createObservationDoorFrame(name, position, width, height, rotationY, 8, wallHeight);
        blocker.setEnabled(false);
        blocker.checkCollisions = false;
        const rig = { mesh: door, blocker, open: true, closedY: position.y, openY: position.y + height + 0.5 };
        this.observationDoors.push(rig);
        const panel = MeshBuilder.CreateBox(`${name}-panel`, { width: 0.55, height: 0.9, depth: 0.24 }, this.scene);
        panel.parent = this.root;
        const side = rotationY === 0 ? new Vector3(width * 0.5 + 0.7, 1.25, position.z - 0.35) : new Vector3(position.x - 0.35, 1.25, width * 0.5 + position.z + 0.7);
        panel.position = rotationY === 0 ? new Vector3(side.x, side.y, side.z) : new Vector3(position.x - 0.35, 1.25, position.z + width * 0.5 + 0.7);
        panel.material = this.materials.emissive(`${name}-panel-light`, new Color3(0.34, 0.08, 0.03), 0.34);
        this.interaction.register(panel, {
            prompt: () => rig.open ? "[E] FECHAR PORTA DE CONTENÇÃO" : "[E] ABRIR PORTA DE CONTENÇÃO",
            onInteract: () => {
                const playerPosition = this.player.collider.position;
                const horizontalDistance = Vector3.Distance(new Vector3(playerPosition.x, 0, playerPosition.z), new Vector3(rig.mesh.position.x, 0, rig.mesh.position.z));
                if (rig.open && horizontalDistance < 1.45) {
                    this.ui.toast("Saia do vão antes de fechar a porta.");
                    return;
                }
                rig.open = !rig.open;
                this.audio.impact(0.5);
            }
        });
    }
    updateObservationDoors(deltaSeconds) {
        for (const door of this.observationDoors) {
            const target = door.open ? door.openY : door.closedY;
            door.mesh.position.y += (target - door.mesh.position.y) * Math.min(1, deltaSeconds * 5.5);
            const passageBlocked = !door.open || Math.abs(door.mesh.position.y - door.openY) > 3.25;
            door.mesh.checkCollisions = passageBlocked;
            door.blocker.setEnabled(passageBlocked);
            door.blocker.checkCollisions = passageBlocked;
        }
    }
    createObservationDoorFrame(name, position, width, height, rotationY, openingSpan = width, wallHeight = height + 0.6) {
        const frame = new TransformNode(`${name}-frame-root`, this.scene);
        frame.parent = this.root;
        frame.position.copyFrom(position);
        frame.rotation.y = rotationY;
        const material = this.materials.get("metal", Math.round(position.z) + 2);
        const make = (suffix, size, local, collisions = true) => {
            const part = MeshBuilder.CreateBox(`${name}-frame-${suffix}`, size, this.scene);
            part.parent = frame;
            part.position.copyFrom(local);
            part.material = material;
            part.checkCollisions = collisions;
            part.isPickable = false;
            part.metadata = { doorFrame: true, interactionPassthrough: true };
        };
        const jamb = 0.32;
        make("left", { width: jamb, height: height + 0.45, depth: 0.7 }, new Vector3(-width / 2 - jamb / 2, 0, 0));
        make("right", { width: jamb, height: height + 0.45, depth: 0.7 }, new Vector3(width / 2 + jamb / 2, 0, 0));
        make("lintel", { width: width + jamb * 2, height: 0.32, depth: 0.7 }, new Vector3(0, height / 2 + 0.16, 0));
        make("threshold", { width: width + jamb * 2, height: 0.08, depth: 0.7 }, new Vector3(0, -height / 2 + 0.04, 0), false);
        const wingWidth = Math.max(0, (openingSpan - width - jamb * 2) / 2);
        const wallCenterY = wallHeight / 2 - position.y;
        if (wingWidth > 0.03) {
            make("bulkhead-left", { width: wingWidth, height: wallHeight, depth: 0.7 }, new Vector3(-width / 2 - jamb - wingWidth / 2, wallCenterY, 0));
            make("bulkhead-right", { width: wingWidth, height: wallHeight, depth: 0.7 }, new Vector3(width / 2 + jamb + wingWidth / 2, wallCenterY, 0));
        }
        const upperHeight = Math.max(0, wallHeight - (position.y + height / 2));
        if (upperHeight > 0.08)
            make("bulkhead-upper", { width: Math.max(openingSpan, width + jamb * 2), height: upperHeight, depth: 0.7 }, new Vector3(0, height / 2 + upperHeight / 2, 0));
        const blocker = MeshBuilder.CreateBox(`${name}-doorway-blocker`, { width: Math.max(openingSpan, width + 0.72), height: wallHeight, depth: 1.2 }, this.scene);
        blocker.position.y = wallCenterY;
        blocker.parent = frame;
        blocker.visibility = 0;
        blocker.isPickable = false;
        blocker.checkCollisions = true;
        blocker.metadata = { doorwayBlocker: true, interactionPassthrough: true };
        return blocker;
    }
    createArchitecture() {
        this.createHall("chapter2-elevator", new Vector3(0, 0, 198), 8, 16, 5.4, "metal");
        this.createHall("mannequin-corridor", new Vector3(0, 0, 226), 9, 42, 5.8, "concrete");
        this.createRoom("modeling-department", new Vector3(0, 0, 254), 42, 20, 6.4, "tile", [{ side: "south", offset: 0, width: 6.8 }, { side: "north", offset: 0, width: 8 }]);
        this.createHall("mirror-access", new Vector3(-13, 0, 270), 7, 25, 5.4, "concrete", Math.PI / 2);
        this.createRoom("mirror-testing-room", new Vector3(-25, 0, 280), 24, 25, 6.4, "tile", [{ side: "east", offset: -10, width: 8 }]);
        this.createHall("storage-access", new Vector3(14, 0, 272), 7, 28, 5.4, "metal", Math.PI / 2);
        this.createRoom("mannequin-storage", new Vector3(27, 0, 285), 27, 32, 7.2, "concrete", [{ side: "west", offset: -13, width: 8 }]);
        this.createHall("control-access", new Vector3(-14, 0, 309), 7, 28, 5.4, "metal", Math.PI / 2);
        this.createRoom("blackout-control-room", new Vector3(-27, 0, 320), 28, 25, 6, "metal", [{ side: "east", offset: -11, width: 8 }]);
        this.createRoom("electrical-distribution", new Vector3(26, 0, 320), 26, 24, 6, "metal", [{ side: "west", offset: 0, width: 8 }]);
        this.createHall("central-spine", new Vector3(0, 0, 317), 10, 105, 6.4, "concrete");
        this.createRoom("central-machinery-hall", new Vector3(0, 0, 354), 46, 36, 11, "metal", [{ side: "south", offset: 0, width: 10 }, { side: "north", offset: 0, width: 18 }]);
        this.createHall("sphere-track-1", new Vector3(0, 0, 395), 18, 48, 8, "concrete");
        this.createRoom("sphere-arena-1", new Vector3(0, 0, 398), 38, 30, 8, "concrete", [{ side: "south", offset: 0, width: 18 }, { side: "north", offset: 0, width: 18 }]);
        this.createHall("sphere-track-2", new Vector3(0, 0, 433), 24, 48, 8.5, "metal");
        this.createRoom("sphere-arena-2", new Vector3(0, 0, 438), 46, 32, 8.5, "metal", [{ side: "south", offset: 0, width: 24 }, { side: "north", offset: 0, width: 24 }]);
        this.createHall("sphere-track-3", new Vector3(0, 0, 477), 20, 48, 8.5, "concrete");
        this.createRoom("sphere-arena-3", new Vector3(0, 0, 481), 42, 34, 9, "concrete", [{ side: "south", offset: 0, width: 20 }, { side: "north", offset: 0, width: 9 }]);
        this.createHall("maya-exit-corridor", new Vector3(0, 0, 514), 9, 44, 6, "tile");
        for (let z = 206; z <= 526; z += 14) {
            const pipe = MeshBuilder.CreateCylinder(`chapter2-overhead-pipe-${z}`, { height: 12, diameter: 0.26, tessellation: 8 }, this.scene);
            pipe.parent = this.root;
            pipe.position = new Vector3(-3.4, 4.6, z);
            pipe.rotation.x = Math.PI / 2;
            pipe.material = this.materials.get("metal", z);
            const cableTray = MeshBuilder.CreateBox(`chapter2-cable-tray-${z}`, { width: 0.6, height: 0.18, depth: 12 }, this.scene);
            cableTray.parent = this.root;
            cableTray.position = new Vector3(3.1, 4.35, z);
            cableTray.material = this.materials.get("metal", z + 1);
        }
        for (let z = 206; z <= 522; z += 15) {
            const light = new PointLight(`chapter2-light-${z}`, new Vector3(0, 4.25, z), this.scene);
            light.parent = this.root;
            light.diffuse = z % 30 === 0 ? new Color3(0.72, 0.82, 0.68) : new Color3(0.68, 0.75, 0.8);
            light.intensity = 2.1;
            light.range = 15;
            this.chapterLights.push(light);
            const fixture = MeshBuilder.CreateBox(`chapter2-fixture-${z}`, { width: 2.5, height: 0.12, depth: 0.38 }, this.scene);
            fixture.parent = this.root;
            fixture.position = new Vector3(0, 4.55, z);
            fixture.material = this.materials.emissive(`chapter2-fixture-${z}`, light.diffuse, 0.65);
        }
    }
    createElevatorSequenceSet() {
        const innerDoorLeft = MeshBuilder.CreateBox("chapter2-elevator-door-left", { width: 2.9, height: 4.7, depth: 0.28 }, this.scene);
        innerDoorLeft.parent = this.root;
        innerDoorLeft.position = new Vector3(-1.45, 2.35, 205.7);
        innerDoorLeft.material = this.materials.get("metal", 0);
        innerDoorLeft.checkCollisions = true;
        const innerDoorRight = innerDoorLeft.clone("chapter2-elevator-door-right");
        innerDoorRight.parent = this.root;
        innerDoorRight.position.x = 1.45;
        const indicator = this.createTextSign("chapter2-floor-indicator", "B1", new Vector3(0, 3.9, 204.9), 1.8, 0.9, new Color3(0.55, 0.06, 0.035));
        indicator.metadata = { floorIndicator: true };
        this.createTextSign("elevator-capacity", "CAPACIDADE 900 LB · DEPARTAMENTO DE MODELAGEM", new Vector3(0, 2.6, 190.25), 6.2, 0.8, new Color3(0.28, 0.08, 0.05));
    }
    createMannequinCorridor() {
        this.createTextSign("modeling-direction", "MODELAGEM HUMANA · ARMAZENAMENTO · TESTES", new Vector3(0, 4.35, 244), 7.2, 1, new Color3(0.2, 0.31, 0.34));
        for (const side of [-1, 1]) {
            for (let row = 0; row < 8; row += 1) {
                const marker = MeshBuilder.CreateBox(`corridor-position-marker-${side}-${row}`, { width: 0.5, height: 0.02, depth: 0.8 }, this.scene);
                marker.parent = this.root;
                marker.position = new Vector3(side * 2.8, 0.03, 211 + row * 4.1);
                marker.material = this.materials.solid("measurement-yellow", new Color3(0.47, 0.38, 0.08), 0.82);
            }
        }
        const airflowFan = MeshBuilder.CreateCylinder("chapter2-airflow-fan", { height: 0.45, diameter: 3.6, tessellation: 16 }, this.scene);
        airflowFan.parent = this.root;
        airflowFan.position = new Vector3(0, 3.1, 239.2);
        airflowFan.rotation.x = Math.PI / 2;
        airflowFan.material = this.materials.get("metal", 1);
        for (let bladeIndex = 0; bladeIndex < 6; bladeIndex += 1) {
            const blade = MeshBuilder.CreateBox(`airflow-blade-${bladeIndex}`, { width: 0.32, height: 0.1, depth: 1.45 }, this.scene);
            blade.parent = airflowFan;
            blade.rotation.y = bladeIndex * Math.PI / 3;
            blade.position.z = 0.1;
            blade.material = this.materials.get("metal", bladeIndex);
        }
    }
    createModelingDepartment() {
        for (let tableIndex = 0; tableIndex < 6; tableIndex += 1) {
            const x = -14 + (tableIndex % 3) * 14;
            const z = 248 + Math.floor(tableIndex / 3) * 9;
            const table = MeshBuilder.CreateBox(`modeling-table-${tableIndex}`, { width: 8, height: 1, depth: 2.8 }, this.scene);
            table.parent = this.root;
            table.position = new Vector3(x, 0.5, z);
            table.material = this.materials.get("metal", tableIndex);
            table.checkCollisions = true;
            for (let partIndex = 0; partIndex < 4; partIndex += 1) {
                const part = partIndex % 2 === 0
                    ? MeshBuilder.CreateSphere(`model-part-${tableIndex}-${partIndex}`, { diameter: 0.42 + partIndex * 0.06, segments: 8 }, this.scene)
                    : MeshBuilder.CreateCapsule(`model-part-${tableIndex}-${partIndex}`, { height: 0.9, radius: 0.13, tessellation: 8 }, this.scene);
                part.parent = this.root;
                part.position = new Vector3(x - 2.4 + partIndex * 1.6, 1.18, z);
                part.rotation.z = partIndex * 0.52;
                part.material = this.materials.get("plastic", tableIndex + partIndex);
            }
        }
        for (let index = 0; index < 8; index += 1) {
            const rail = MeshBuilder.CreateBox(`model-overhead-rail-${index}`, { width: 0.18, height: 0.18, depth: 18 }, this.scene);
            rail.parent = this.root;
            rail.position = new Vector3(-17.5 + index * 5, 5.25, 254);
            rail.material = this.materials.get("metal", index);
            for (let hookIndex = 0; hookIndex < 3; hookIndex += 1) {
                const hook = MeshBuilder.CreateCylinder(`model-hook-${index}-${hookIndex}`, { height: 1.3, diameter: 0.08, tessellation: 6 }, this.scene);
                hook.parent = this.root;
                hook.position = new Vector3(rail.position.x, 4.5, 248 + hookIndex * 5.8);
                hook.material = this.materials.get("metal", hookIndex);
            }
        }
        this.createMeasurementDiagram("body-measurement-diagram", new Vector3(20.7, 2.7, 254), Math.PI / 2);
        const emitter = MeshBuilder.CreateCylinder("portable-sound-emitter-pickup", { height: 0.35, diameter: 0.65, tessellation: 12 }, this.scene);
        emitter.parent = this.root;
        emitter.position = new Vector3(7.4, 1.18, 250.5);
        emitter.material = this.materials.emissive("portable-emitter-idle", new Color3(0.28, 0.12, 0.03), 0.38);
        this.interaction.register(emitter, {
            prompt: "[E] PEGAR EMISSOR PORTÁTIL",
            enabled: () => !this.inventory.has("soundEmitter"),
            onInteract: () => {
                this.inventory.add(CHAPTER2_ITEMS.soundEmitter);
                emitter.setEnabled(false);
                this.audio.pickup();
                this.ui.toast("Q posiciona o emissor · G arremessa uma lata · R fecha uma porta atrás de você.", 5200);
            }
        });
    }
    createMirrorRoom() {
        this.createTextSign("mirror-room-title", "TESTE DE RECONHECIMENTO · NÃO QUEBRE CONTATO VISUAL", new Vector3(-25, 5.25, 291.9), 11, 1, new Color3(0.33, 0.16, 0.12));
        const mirrorPositions = [
            new Vector3(-34, 2.2, 272), new Vector3(-16, 2.2, 274),
            new Vector3(-34, 2.2, 287), new Vector3(-16, 2.2, 289)
        ];
        const baseAngles = [Math.PI / 2, -Math.PI / 2, Math.PI / 2, -Math.PI / 2];
        mirrorPositions.forEach((position, index) => this.createFunctionalMirror(index, position, baseAngles[index] ?? 0));
        const targetPositions = [
            new Vector3(-27.26, 0, 274), new Vector3(-27.58, 0, 280.2), new Vector3(-22.42, 0, 280.2)
        ];
        this.mirrorTargets.push(...targetPositions);
        targetPositions.forEach((position, index) => {
            const ring = MeshBuilder.CreateTorus(`mirror-target-ring-${index}`, { diameter: 1.1, thickness: 0.08, tessellation: 16 }, this.scene);
            ring.parent = this.root;
            ring.position = position.add(new Vector3(0, 0.05, 0));
            ring.rotation.x = Math.PI / 2;
            ring.material = this.materials.emissive(`mirror-target-${index}`, new Color3(0.42, 0.07, 0.05), 0.28);
        });
        const observationConsole = MeshBuilder.CreateBox("mirror-observation-console", { width: 3.4, height: 1.25, depth: 1.4 }, this.scene);
        observationConsole.parent = this.root;
        observationConsole.position = new Vector3(-25, 0.63, 269.2);
        observationConsole.material = this.materials.get("metal", 1);
        observationConsole.checkCollisions = true;
        this.interaction.register(observationConsole, {
            prompt: () => this.mirrorSolved ? "LINHAS DE OBSERVAÇÃO ESTÁVEIS" : "[E] TESTAR LINHAS DE OBSERVAÇÃO",
            onInteract: () => this.evaluateMirrorPuzzle(true)
        });
        const reset = MeshBuilder.CreateBox("mirror-reset-switch", { width: 0.7, height: 0.85, depth: 0.24 }, this.scene);
        reset.parent = this.root;
        reset.position = new Vector3(-12.9, 1.15, 275);
        reset.material = this.materials.get("plastic", 0);
        this.interaction.register(reset, { prompt: "[E] REINICIAR SUPORTES DOS ESPELHOS", onInteract: () => this.resetMirrorPuzzle() });
        const containerDoor = MeshBuilder.CreateBox("mirror-cell-container-door", { width: 3.5, height: 2.5, depth: 0.32 }, this.scene);
        containerDoor.parent = this.root;
        containerDoor.position = new Vector3(-25, 1.25, 292.1);
        containerDoor.material = this.materials.get("metal", 0);
        containerDoor.checkCollisions = true;
        const cell = this.createEnergyCell(1, new Vector3(-25, 1.15, 291.4));
        this.cellMeshes[0] = cell;
        this.interaction.register(cell, {
            prompt: "[E] RETIRAR CÉLULA DE ENERGIA I",
            enabled: () => this.mirrorSolved && !this.energyCells.has("energyCell1"),
            onInteract: () => this.collectEnergyCell(1)
        });
    }
    createStorageWarehouse() {
        this.createTextSign("storage-title", "ARMAZENAMENTO · MANTENHA CORREDORES DE FUGA", new Vector3(27, 5.8, 300.8), 10, 1, new Color3(0.34, 0.22, 0.08));
        for (let index = 0; index < 3; index += 1) {
            const baseX = 18 + index * 9;
            const baseZ = 282;
            const root = new TransformNode(`rolling-shelf-${index}`, this.scene);
            root.parent = this.root;
            root.position = new Vector3(baseX, 0, baseZ);
            for (let level = 0; level < 4; level += 1) {
                const shelf = MeshBuilder.CreateBox(`rolling-shelf-${index}-level-${level}`, { width: 6.5, height: 0.18, depth: 2.6 }, this.scene);
                shelf.parent = root;
                shelf.position.y = 0.35 + level * 1.35;
                shelf.material = this.materials.get("metal", index + level);
                shelf.checkCollisions = true;
                if (level > 0) {
                    for (let boxIndex = 0; boxIndex < 3; boxIndex += 1) {
                        const box = MeshBuilder.CreateBox(`storage-box-${index}-${level}-${boxIndex}`, { width: 1.25, height: 0.8, depth: 1.7 }, this.scene);
                        box.parent = root;
                        box.position = new Vector3(-2.1 + boxIndex * 2.1, 0.78 + level * 1.35, 0);
                        box.material = boxIndex === 1 ? this.materials.get("plastic", boxIndex) : this.materials.get("wood", boxIndex);
                    }
                }
            }
            for (const side of [-1, 1]) {
                const post = MeshBuilder.CreateBox(`rolling-shelf-${index}-post-${side}`, { width: 0.22, height: 5.4, depth: 2.6 }, this.scene);
                post.parent = root;
                post.position = new Vector3(side * 3.12, 2.7, 0);
                post.material = this.materials.get("metal", index);
                post.checkCollisions = true;
            }
            const handle = MeshBuilder.CreateBox(`rolling-shelf-handle-${index}`, { width: 1.1, height: 0.42, depth: 0.32 }, this.scene);
            handle.parent = root;
            handle.position = new Vector3(0, 1.05, -1.48);
            handle.material = this.materials.get("plastic", index);
            this.shelves.push({ root, handle, state: 1, targetState: 1, baseZ });
            this.interaction.register(handle, {
                prompt: () => `[E] MOVER PRATELEIRA ${index + 1} · POSIÇÃO ${this.shelves[index].targetState + 1}`,
                onInteract: () => this.moveShelf(index)
            });
            for (let wheelIndex = 0; wheelIndex < 4; wheelIndex += 1) {
                const wheel = MeshBuilder.CreateCylinder(`rolling-wheel-${index}-${wheelIndex}`, { height: 0.18, diameter: 0.5, tessellation: 10 }, this.scene);
                wheel.parent = root;
                wheel.rotation.z = Math.PI / 2;
                wheel.position = new Vector3(wheelIndex < 2 ? -2.6 : 2.6, 0.23, wheelIndex % 2 === 0 ? -1 : 1);
                wheel.material = this.materials.get("metal", wheelIndex);
            }
        }
        const shelfReset = MeshBuilder.CreateBox("storage-reset-control", { width: 0.8, height: 1.1, depth: 0.3 }, this.scene);
        shelfReset.parent = this.root;
        shelfReset.position = new Vector3(13.7, 1.2, 295);
        shelfReset.material = this.materials.get("plastic", 1);
        this.interaction.register(shelfReset, { prompt: "[E] RETORNAR PRATELEIRAS À POSIÇÃO NEUTRA", onInteract: () => this.resetShelfPuzzle() });
        const cageDoor = MeshBuilder.CreateBox("storage-cell-cage-door", { width: 0.35, height: 4, depth: 5 }, this.scene);
        cageDoor.parent = this.root;
        cageDoor.position = new Vector3(39.9, 2, 293);
        cageDoor.material = this.materials.get("metal", 0);
        cageDoor.checkCollisions = true;
        const cell = this.createEnergyCell(2, new Vector3(38.2, 1.2, 293));
        this.cellMeshes[1] = cell;
        this.interaction.register(cell, {
            prompt: "[E] RETIRAR CÉLULA DE ENERGIA II",
            enabled: () => this.shelfSolved && !this.energyCells.has("energyCell2"),
            onInteract: () => this.collectEnergyCell(2)
        });
    }
    createControlRoom() {
        this.createTextSign("control-title", "CONTROLE DE TESTES · QUEDA PROGRAMADA A CADA CICLO", new Vector3(-27, 5, 331.9), 10.5, 1, new Color3(0.4, 0.08, 0.045));
        const safePositions = [new Vector3(-36, 0.03, 313), new Vector3(-27, 0.03, 326), new Vector3(-18, 0.03, 313)];
        safePositions.forEach((position, index) => {
            const zone = MeshBuilder.CreateGround(`blackout-safe-zone-${index}`, { width: 4, height: 4 }, this.scene);
            zone.parent = this.root;
            zone.position.copyFrom(position);
            zone.material = this.materials.emissive(`safe-zone-${index}`, new Color3(0.08, 0.42, 0.2), 0.45);
            const emergency = new PointLight(`blackout-emergency-${index}`, position.add(new Vector3(0, 2.1, 0)), this.scene);
            emergency.parent = this.root;
            emergency.diffuse = new Color3(0.72, 0.06, 0.035);
            emergency.intensity = 0;
            emergency.range = 7;
            this.emergencyLights.push(emergency);
            const switchMesh = MeshBuilder.CreateBox(`backup-switch-${index}`, { width: 0.75, height: 1.1, depth: 0.3 }, this.scene);
            switchMesh.parent = this.root;
            switchMesh.position = position.add(new Vector3(0, 1.15, index === 1 ? 2.1 : -2.1));
            switchMesh.material = this.materials.get("plastic", index);
            this.interaction.register(switchMesh, {
                prompt: () => this.backupSwitches[index] ? `CHAVE DE RESERVA ${index + 1} ATIVA` : `[E] ATIVAR CHAVE DE RESERVA ${index + 1}`,
                onInteract: () => this.activateBackupSwitch(index, switchMesh)
            });
        });
        for (let consoleIndex = 0; consoleIndex < 7; consoleIndex += 1) {
            const consoleMesh = MeshBuilder.CreateBox(`control-console-${consoleIndex}`, { width: 3.2, height: 1.35, depth: 1.6 }, this.scene);
            consoleMesh.parent = this.root;
            consoleMesh.position = new Vector3(-36 + (consoleIndex % 4) * 6, 0.68, 316 + Math.floor(consoleIndex / 4) * 10);
            consoleMesh.material = this.materials.get("metal", consoleIndex);
            consoleMesh.checkCollisions = true;
            for (let lampIndex = 0; lampIndex < 4; lampIndex += 1) {
                const lamp = MeshBuilder.CreateSphere(`control-lamp-${consoleIndex}-${lampIndex}`, { diameter: 0.12, segments: 6 }, this.scene);
                lamp.parent = consoleMesh;
                lamp.position = new Vector3(-0.8 + lampIndex * 0.52, 0.7, -0.82);
                lamp.material = this.materials.emissive(`control-lamp-${consoleIndex}-${lampIndex}`, lampIndex % 2 ? new Color3(0.55, 0.05, 0.03) : new Color3(0.06, 0.42, 0.24), 0.7);
            }
        }
        const cellCage = MeshBuilder.CreateBox("control-cell-cage", { width: 4, height: 3, depth: 0.3 }, this.scene);
        cellCage.parent = this.root;
        cellCage.position = new Vector3(-27, 1.5, 332.1);
        cellCage.material = this.materials.get("metal", 1);
        cellCage.checkCollisions = true;
        const cell = this.createEnergyCell(3, new Vector3(-27, 1.2, 331.3));
        this.cellMeshes[2] = cell;
        this.interaction.register(cell, {
            prompt: "[E] RETIRAR CÉLULA DE ENERGIA III",
            enabled: () => this.controlRoomSolved && !this.energyCells.has("energyCell3"),
            onInteract: () => this.collectEnergyCell(3)
        });
    }
    createCentralMachine() {
        this.createTextSign("central-machine-title", "ATRAÇÃO CINÉTICA · TESTE DE RESPOSTA CORPORAL", new Vector3(0, 8.8, 370.8), 13, 1.3, new Color3(0.45, 0.08, 0.04));
        const pit = MeshBuilder.CreateCylinder("central-machine-pit", { height: 0.5, diameter: 19, tessellation: 40 }, this.scene);
        pit.parent = this.root;
        pit.position = new Vector3(0, -0.35, 354);
        pit.material = this.materials.get("concrete", 1);
        pit.checkCollisions = true;
        const platform = MeshBuilder.CreateTorus("central-machine-platform", { diameter: 20, thickness: 1.2, tessellation: 48 }, this.scene);
        platform.parent = this.root;
        platform.position = new Vector3(0, 0.35, 354);
        platform.rotation.x = Math.PI / 2;
        platform.material = this.materials.get("metal", 0);
        platform.checkCollisions = true;
        this.sphere = MeshBuilder.CreateSphere("central-crushing-sphere", { diameter: 6.2, segments: 24 }, this.scene);
        this.sphere.parent = this.root;
        this.sphere.position = new Vector3(0, 3.45, 354);
        this.sphere.material = this.materials.get("metal", 1);
        this.sphere.checkCollisions = true;
        for (let clampIndex = 0; clampIndex < 4; clampIndex += 1) {
            const angle = clampIndex * Math.PI / 2;
            const clamp = MeshBuilder.CreateBox(`sphere-hydraulic-clamp-${clampIndex}`, { width: 2.2, height: 1, depth: 5.4 }, this.scene);
            clamp.parent = this.root;
            clamp.position = new Vector3(Math.sin(angle) * 5, 3.5, 354 + Math.cos(angle) * 5);
            clamp.rotation.y = angle;
            clamp.material = this.materials.get("metal", clampIndex);
            const piston = MeshBuilder.CreateCylinder(`sphere-piston-${clampIndex}`, { height: 4.6, diameter: 0.75, tessellation: 10 }, this.scene);
            piston.parent = this.root;
            piston.position = new Vector3(Math.sin(angle) * 8, 3.5, 354 + Math.cos(angle) * 8);
            piston.rotation.z = Math.PI / 2;
            piston.rotation.y = angle;
            piston.material = this.materials.get("metal", clampIndex + 1);
        }
        for (let cableIndex = 0; cableIndex < 4; cableIndex += 1) {
            const angle = cableIndex * Math.PI / 2 + Math.PI / 4;
            const socketPosition = new Vector3(Math.sin(angle) * 8.5, 1.35, 354 + Math.cos(angle) * 8.5);
            const socket = MeshBuilder.CreateCylinder(`machine-cable-socket-${cableIndex}`, { height: 0.55, diameter: 1.1, tessellation: 12 }, this.scene);
            socket.parent = this.root;
            socket.position.copyFrom(socketPosition);
            socket.rotation.x = Math.PI / 2;
            socket.material = this.materials.get("metal", cableIndex);
            const cable = MeshBuilder.CreateCylinder(`machine-cable-${cableIndex}`, { height: 7.5, diameter: 0.22, tessellation: 8 }, this.scene);
            cable.parent = this.root;
            cable.position = socketPosition.add(new Vector3(Math.sin(angle) * 3.2, 0.5, Math.cos(angle) * 3.2));
            cable.rotation.z = Math.PI / 2;
            cable.rotation.y = -angle;
            cable.material = this.materials.solid(`machine-cable-rubber-${cableIndex}`, new Color3(0.035, 0.035, 0.03), 0.88);
            cable.scaling.y = 0.38;
            this.machineCableMeshes.push(cable);
            this.interaction.register(socket, {
                prompt: () => this.machineCables[cableIndex] ? `CABO ${cableIndex + 1} CONECTADO` : `[E] RECONECTAR CABO ${cableIndex + 1}`,
                onInteract: () => {
                    if (this.machineActivated || this.machineCables[cableIndex])
                        return;
                    this.machineCables[cableIndex] = true;
                    cable.scaling.y = 1;
                    this.audio.impact(0.55);
                    this.audio.electricalSnap(socketPosition, 0.45);
                    this.checkMachineReadiness();
                }
            });
        }
        const cellBank = MeshBuilder.CreateBox("machine-cell-bank", { width: 5.4, height: 2.2, depth: 1.8 }, this.scene);
        cellBank.parent = this.root;
        cellBank.position = new Vector3(-12.5, 1.1, 348);
        cellBank.material = this.materials.get("metal", 0);
        cellBank.checkCollisions = true;
        for (let slotIndex = 0; slotIndex < 3; slotIndex += 1) {
            const slot = MeshBuilder.CreateBox(`machine-cell-slot-${slotIndex}`, { width: 1.2, height: 1.1, depth: 0.25 }, this.scene);
            slot.parent = cellBank;
            slot.position = new Vector3(-1.7 + slotIndex * 1.7, 0, -1.02);
            slot.material = this.materials.solid(`empty-cell-slot-${slotIndex}`, new Color3(0.025, 0.025, 0.02), 0.72);
        }
        this.interaction.register(cellBank, {
            prompt: () => this.energyCells.size >= 3 ? "[E] INSTALAR AS TRÊS CÉLULAS" : `[E] BANCO DE CÉLULAS (${this.energyCells.size}/3)`,
            onInteract: () => this.installEnergyCells(cellBank)
        });
        const pressureConsole = MeshBuilder.CreateBox("machine-pressure-console", { width: 4.2, height: 1.45, depth: 1.8 }, this.scene);
        pressureConsole.parent = this.root;
        pressureConsole.position = new Vector3(12.5, 0.73, 348);
        pressureConsole.material = this.materials.get("metal", 1);
        pressureConsole.checkCollisions = true;
        for (let gaugeIndex = 0; gaugeIndex < 3; gaugeIndex += 1) {
            const gauge = MeshBuilder.CreateCylinder(`pressure-gauge-${gaugeIndex}`, { height: 0.16, diameter: 0.9, tessellation: 18 }, this.scene);
            gauge.parent = pressureConsole;
            gauge.rotation.x = Math.PI / 2;
            gauge.position = new Vector3(-1.25 + gaugeIndex * 1.25, 0.48, -0.92);
            gauge.material = this.materials.get("glass", gaugeIndex);
        }
        this.interaction.register(pressureConsole, {
            prompt: () => ` [E] REGULAR PRESSÃO · NÍVEL ${this.machinePressure}/3`,
            onInteract: () => {
                if (this.machineActivated)
                    return;
                this.machinePressure = (this.machinePressure + 1) % 4;
                this.audio.hydraulicPulse(this.machinePressure / 3);
                if (this.machinePressure === 2)
                    this.ui.toast("Os três manômetros entram na faixa verde.");
                this.checkMachineReadiness();
            }
        });
        const cardReader = MeshBuilder.CreateBox("machine-body-card-reader", { width: 1, height: 1.4, depth: 0.4 }, this.scene);
        cardReader.parent = this.root;
        cardReader.position = new Vector3(-12.5, 1.3, 361);
        cardReader.material = this.materials.get("plastic", 0);
        this.interaction.register(cardReader, {
            prompt: () => this.machineCardInserted ? "CARTÃO DO CORPO ACEITO" : "[E] INSERIR CARTÃO DO CORPO",
            onInteract: () => {
                if (this.machineCardInserted)
                    return;
                if (!this.inventory.has("bodyCard")) {
                    this.ui.toast("O mecanismo exige o Cartão do Corpo.");
                    return;
                }
                this.machineCardInserted = true;
                cardReader.material = this.materials.emissive("card-reader-active", new Color3(0.55, 0.07, 0.035), 0.7);
                this.audio.electricalSnap(cardReader.position, 0.65);
                this.checkMachineReadiness();
            }
        });
        const trackLever = MeshBuilder.CreateBox("machine-track-lever", { width: 1.5, height: 1.55, depth: 1.2 }, this.scene);
        trackLever.parent = this.root;
        trackLever.position = new Vector3(12.5, 0.78, 361);
        trackLever.material = this.materials.get("metal", 0);
        trackLever.checkCollisions = true;
        this.interaction.register(trackLever, {
            prompt: () => this.machineTrackAligned ? "TRILHOS ALINHADOS" : "[E] ALINHAR TRILHOS DO PISO",
            onInteract: () => {
                if (this.machineTrackAligned)
                    return;
                this.machineTrackAligned = true;
                trackLever.rotation.z = -0.48;
                this.audio.impact(1.1);
                this.animateTrackAlignment();
                this.checkMachineReadiness();
            }
        });
        for (let lockIndex = 0; lockIndex < 3; lockIndex += 1) {
            const angle = -0.65 + lockIndex * 0.65;
            const lock = MeshBuilder.CreateBox(`machine-release-lock-${lockIndex}`, { width: 1.4, height: 1.1, depth: 0.5 }, this.scene);
            lock.parent = this.root;
            lock.position = new Vector3(Math.sin(angle) * 10, 1.1, 365 + Math.cos(angle) * 3);
            lock.material = this.materials.get("metal", lockIndex);
            this.machineLockMeshes.push(lock);
            this.interaction.register(lock, {
                prompt: () => this.machineLocks[lockIndex] ? `TRAVA ${lockIndex + 1} LIBERADA` : `[E] LIBERAR TRAVA MECÂNICA ${lockIndex + 1}`,
                onInteract: () => {
                    if (this.machineActivated || this.machineLocks[lockIndex])
                        return;
                    this.machineLocks[lockIndex] = true;
                    lock.rotation.x = -0.8;
                    this.audio.impact(0.75);
                    this.checkMachineReadiness();
                }
            });
        }
        for (let railIndex = -2; railIndex <= 2; railIndex += 1) {
            const rail = MeshBuilder.CreateBox(`central-track-${railIndex}`, { width: 0.32, height: 0.18, depth: 150 }, this.scene);
            rail.parent = this.root;
            rail.position = new Vector3(railIndex * 3.4, 0.08, 420);
            rail.material = this.materials.get("metal", railIndex + 2);
            rail.checkCollisions = false;
        }
        for (let redIndex = 0; redIndex < 8; redIndex += 1) {
            const angle = redIndex * Math.PI / 4;
            const light = new PointLight(`machine-alarm-light-${redIndex}`, new Vector3(Math.sin(angle) * 17, 6.5, 354 + Math.cos(angle) * 13), this.scene);
            light.parent = this.root;
            light.diffuse = new Color3(0.9, 0.035, 0.015);
            light.intensity = 0;
            light.range = 16;
            this.machineRedLights.push(light);
        }
    }
    createSphereArenas() {
        this.createArenaOne();
        this.createArenaTwo();
        this.createArenaThree();
    }
    createArenaOne() {
        this.createTextSign("arena1-sign", "TESTE A · SOM → TRAJETO → ABRIGO", new Vector3(0, 6.7, 411.9), 9, 1, new Color3(0.5, 0.15, 0.04));
        const lure = this.createLureButton("arena1-lure", new Vector3(0, 1.1, 405), new Vector3(0, 0, 413), 1.2);
        const release = this.createReleaseConsole("arena1-release", new Vector3(-12, 0.8, 385), 1);
        release.metadata = { pairedLure: lure.uniqueId };
        for (const x of [-13, 13]) {
            const shelter = MeshBuilder.CreateBox(`arena1-shelter-${x}`, { width: 5, height: 3.5, depth: 4 }, this.scene);
            shelter.parent = this.root;
            shelter.position = new Vector3(x, 1.75, 403);
            shelter.material = this.materials.get("concrete", x);
            shelter.checkCollisions = true;
            const opening = MeshBuilder.CreateBox(`arena1-shelter-opening-${x}`, { width: 2, height: 2.6, depth: 0.2 }, this.scene);
            opening.parent = this.root;
            opening.position = new Vector3(x - Math.sign(x) * 2.55, 1.3, 403);
            opening.isVisible = false;
            opening.checkCollisions = false;
        }
    }
    createArenaTwo() {
        this.createTextSign("arena2-sign", "TESTE B · SELEÇÃO DE TRILHO", new Vector3(0, 7.1, 453.9), 8.5, 1, new Color3(0.48, 0.18, 0.04));
        this.createLureButton("arena2-lure-left", new Vector3(-13, 1.1, 443), new Vector3(-12, 0, 451), 1.3);
        this.createLureButton("arena2-lure-right", new Vector3(13, 1.1, 443), new Vector3(12, 0, 451), 1.3);
        const trackSwitch = MeshBuilder.CreateBox("arena2-track-switch", { width: 2.1, height: 1.55, depth: 1.5 }, this.scene);
        trackSwitch.parent = this.root;
        trackSwitch.position = new Vector3(0, 0.78, 423);
        trackSwitch.material = this.materials.get("metal", 1);
        trackSwitch.checkCollisions = true;
        this.interaction.register(trackSwitch, {
            prompt: () => `[E] ALTERAR DESVIO · ROTA ${this.trackSwitchState === 0 ? "ESQUERDA" : "DIREITA"}`,
            onInteract: () => {
                this.trackSwitchState = 1 - this.trackSwitchState;
                trackSwitch.rotation.z = this.trackSwitchState === 0 ? -0.45 : 0.45;
                this.audio.impact(0.8);
            }
        });
        this.createReleaseConsole("arena2-release", new Vector3(-18, 0.8, 425), 2);
        [-9, 9].forEach((x, routeIndex) => {
            const blocker = MeshBuilder.CreateBox(`arena2-track-blocker-${routeIndex}`, { width: 5, height: 2.2, depth: 1.4 }, this.scene);
            blocker.parent = this.root;
            blocker.position = new Vector3(x, 1.1, 439);
            blocker.material = this.materials.get("metal", routeIndex);
            blocker.checkCollisions = true;
            const hydraulic = MeshBuilder.CreateBox(`arena2-hydraulic-control-${routeIndex}`, { width: 0.9, height: 1.2, depth: 0.4 }, this.scene);
            hydraulic.parent = this.root;
            hydraulic.position = new Vector3(x + Math.sign(x) * 3.5, 1.2, 435);
            hydraulic.material = this.materials.get("plastic", routeIndex);
            this.interaction.register(hydraulic, {
                prompt: () => this.arena2Blockers[routeIndex] ? "BLOQUEIO HIDRÁULICO RECOLHIDO" : "[E] RECOLHER BLOQUEIO HIDRÁULICO",
                onInteract: () => {
                    if (this.arena2Blockers[routeIndex])
                        return;
                    this.arena2Blockers[routeIndex] = true;
                    blocker.position.y = -1.2;
                    blocker.checkCollisions = false;
                    this.audio.hydraulicPulse(0.8);
                    this.callbacks.onCheckpoint("chapter2-arena-2-blocker");
                }
            });
        });
    }
    createArenaThree() {
        this.createTextSign("arena3-sign", "TESTE C · RETORNO AUTOMÁTICO · ÁREA NÃO SEGURA", new Vector3(0, 7.4, 497.9), 11, 1, new Color3(0.55, 0.06, 0.03));
        this.createLureButton("arena3-lure-a", new Vector3(-13, 1.1, 484), new Vector3(-9, 0, 493), 1.45);
        this.createLureButton("arena3-lure-b", new Vector3(13, 1.1, 484), new Vector3(9, 0, 493), 1.45);
        this.createReleaseConsole("arena3-release", new Vector3(-16, 0.8, 466), 3);
        const returnWinch = MeshBuilder.CreateBox("arena3-return-winch", { width: 2.2, height: 1.8, depth: 1.5 }, this.scene);
        returnWinch.parent = this.root;
        returnWinch.position = new Vector3(16, 0.9, 491);
        returnWinch.material = this.materials.get("metal", 0);
        returnWinch.checkCollisions = true;
        this.interaction.register(returnWinch, {
            prompt: () => this.arena3Pass === 1 ? "[E] ACIONAR RETORNO DA ESFERA" : "O GUINCHO AGUARDA A PRIMEIRA PASSAGEM",
            onInteract: () => {
                if (this.arena3Pass !== 1 || this.sphereState !== "settled")
                    return;
                this.sphereState = "arena3-return";
                this.crushCountThisRun = 0;
                this.sphereSpeed = 0;
                this.sphereTarget = new Vector3(0, 3.45, 463);
                this.audio.hydraulicPulse(1);
                this.ui.showSoundCaption("cabos de aço tensionam a esfera", 1800);
            }
        });
        for (const x of [-14, 0, 14]) {
            const safePlatform = MeshBuilder.CreateBox(`arena3-safe-platform-${x}`, { width: 5.5, height: 0.7, depth: 5.5 }, this.scene);
            safePlatform.parent = this.root;
            safePlatform.position = new Vector3(x, 0.35, 475);
            safePlatform.material = this.materials.get("metal", x);
            safePlatform.checkCollisions = true;
        }
        for (let debrisIndex = 0; debrisIndex < 12; debrisIndex += 1) {
            const hanging = MeshBuilder.CreateBox(`arena3-hanging-panel-${debrisIndex}`, { width: 1.2 + debrisIndex % 3, height: 0.25, depth: 1.8 }, this.scene);
            hanging.parent = this.root;
            hanging.position = new Vector3(-17 + (debrisIndex % 6) * 7, 7.2, 470 + Math.floor(debrisIndex / 6) * 15);
            hanging.rotation.z = (debrisIndex % 2 ? 1 : -1) * 0.12;
            hanging.material = this.materials.get("metal", debrisIndex);
        }
    }
    createMayaAndExitRoute() {
        const ankleHand = MeshBuilder.CreateCapsule("maya-ankle-hand", { height: 0.9, radius: 0.12, tessellation: 8 }, this.scene);
        ankleHand.parent = this.root;
        ankleHand.position = new Vector3(0.6, 0.25, 501.5);
        ankleHand.rotation.z = Math.PI / 2;
        ankleHand.material = this.materials.get("plastic", 1);
        ankleHand.setEnabled(false);
        const musicBoxMarker = MeshBuilder.CreateBox("jesse-music-box-marker", { width: 1.2, height: 0.8, depth: 1.2 }, this.scene);
        musicBoxMarker.parent = this.root;
        musicBoxMarker.position = new Vector3(2.5, 0.4, 518);
        musicBoxMarker.material = this.materials.get("wood", 1);
        const jackBox = MeshBuilder.CreateBox("chapter3-jack-box-silhouette", { width: 11, height: 8, depth: 9 }, this.scene);
        jackBox.parent = this.root;
        jackBox.position = new Vector3(0, 4, 540);
        jackBox.material = this.materials.get("wood", 0);
        jackBox.checkCollisions = true;
        for (let stripeIndex = 0; stripeIndex < 6; stripeIndex += 1) {
            const stripe = MeshBuilder.CreateBox(`jack-box-stripe-${stripeIndex}`, { width: 11.1, height: 0.8, depth: 0.08 }, this.scene);
            stripe.parent = this.root;
            stripe.position = new Vector3(0, 0.7 + stripeIndex * 1.25, 535.45);
            stripe.material = stripeIndex % 2 === 0
                ? this.materials.solid("jack-red", new Color3(0.36, 0.035, 0.025), 0.75)
                : this.materials.solid("jack-cream", new Color3(0.55, 0.48, 0.32), 0.82);
        }
        const lid = MeshBuilder.CreateBox("chapter3-jack-box-lid", { width: 12, height: 0.7, depth: 10 }, this.scene);
        lid.parent = this.root;
        lid.position = new Vector3(0, 8.3, 540);
        lid.rotation.x = -0.35;
        lid.material = this.materials.get("wood", 1);
    }
    createDocuments() {
        this.createDocument("modeling-manual", "MEMORANDO 22-B", "Os sujeitos artificiais devem permanecer imóveis durante a observação direta. Movimento fora da linha de visão é uma resposta esperada do protocolo, não uma falha mecânica.", new Vector3(8, 1.2, 248));
        this.createDocument("mirror-report", "RELATÓRIO DE ESPELHOS", "A reflexão conta como observação apenas quando o sujeito, o espelho e o observador compartilham uma linha limpa. Vidro sujo reduz a resposta. Vidro quebrado produz zonas cegas perigosas.", new Vector3(-25, 1.2, 271));
        this.createDocument("warehouse-note", "INSTRUÇÃO AO TURNO DA NOITE", "Nunca feche os três corredores de prateleiras ao mesmo tempo. A equipe de resgate precisa conservar uma rota aberta até a grade de energia.", new Vector3(29, 1.2, 274));
        this.createDocument("maya-file", "FICHA M-04 · MAYA", "Reconhecimento facial: instável. Memória residual: elevada. O sujeito pede que Jesse pare de tocar a música. Recomenda-se separar as duas unidades antes do próximo ciclo.", new Vector3(-2, 1.1, 507));
    }
    createFunctionalMirror(index, position, baseAngle) {
        const pivot = new TransformNode(`functional-mirror-pivot-${index}`, this.scene);
        pivot.parent = this.root;
        pivot.position.copyFrom(position);
        pivot.rotation.y = baseAngle;
        const support = MeshBuilder.CreateCylinder(`functional-mirror-support-${index}`, { height: 2.2, diameter: 0.24, tessellation: 10 }, this.scene);
        support.parent = pivot;
        support.position.y = -1.1;
        support.material = this.materials.get("metal", index);
        const surface = MeshBuilder.CreatePlane(`functional-mirror-${index}`, { width: 4.2, height: 3.8 }, this.scene);
        surface.parent = pivot;
        surface.material = this.createMirrorMaterial(index, position, baseAngle);
        surface.isPickable = true;
        surface.checkCollisions = false;
        const frame = MeshBuilder.CreateBox(`functional-mirror-frame-${index}`, { width: 4.5, height: 4.1, depth: 0.16 }, this.scene);
        frame.parent = pivot;
        frame.position.z = 0.12;
        frame.material = this.materials.get("metal", index);
        frame.isPickable = false;
        const reflectiveInset = MeshBuilder.CreatePlane(`mirror-reflective-inset-${index}`, { width: 4.1, height: 3.7 }, this.scene);
        reflectiveInset.parent = pivot;
        reflectiveInset.position.z = -0.1;
        reflectiveInset.material = surface.material;
        reflectiveInset.isPickable = false;
        const damageOverlay = MeshBuilder.CreatePlane(`mirror-damage-overlay-${index}`, { width: 4.1, height: 3.7 }, this.scene);
        damageOverlay.parent = pivot;
        damageOverlay.position.z = -0.13;
        damageOverlay.material = this.createMirrorDamageMaterial(index);
        damageOverlay.isPickable = false;
        const texture = surface.material.reflectionTexture;
        const rig = { id: index, pivot, surface, texture, angleIndex: 0, baseAngle, width: 4.1, height: 3.7, damage: 0.12 + index * 0.08 };
        this.mirrors.push(rig);
        this.updateMirrorPlane(rig);
        this.interaction.register(surface, {
            prompt: () => this.mirrorSolved ? `ESPELHO ${index + 1} TRAVADO` : `[E] GIRAR ESPELHO ${index + 1} · ${this.mirrorAngles[index] * 45}°`,
            maxDistance: 4,
            onInteract: () => {
                if (this.mirrorSolved)
                    return;
                rig.angleIndex = (rig.angleIndex + 1) % 8;
                this.mirrorAngles[index] = rig.angleIndex;
                rig.pivot.rotation.y = rig.baseAngle + rig.angleIndex * Math.PI / 4;
                this.updateMirrorPlane(rig);
                this.audio.impact(0.28);
                this.evaluateMirrorPuzzle(false);
            }
        });
    }
    createMirrorMaterial(index, position, angle) {
        const texture = new MirrorTexture(`mirror-render-${index}`, this.settings.performancePreset === "performance" ? 256 : 512, this.scene, true);
        texture.level = 0.72;
        texture.refreshRate = 0;
        const normal = this.mirrorNormal(angle);
        texture.mirrorPlane = Plane.FromPositionAndNormal(position, normal);
        const material = new StandardMaterial(`functional-mirror-material-${index}`, this.scene);
        material.diffuseColor = new Color3(0.06, 0.07, 0.07);
        material.specularColor = new Color3(0.95, 0.95, 0.92);
        material.reflectionTexture = texture;
        material.specularPower = 128;
        material.backFaceCulling = false;
        return material;
    }
    createMirrorDamageMaterial(index) {
        const texture = new DynamicTexture(`mirror-damage-texture-${index}`, { width: 512, height: 512 }, this.scene, false);
        const context = texture.getContext();
        context.clearRect(0, 0, 512, 512);
        context.strokeStyle = "rgba(215,220,214,.42)";
        context.lineWidth = 2;
        const random = this.seeded(117 + index * 7919);
        for (let crackIndex = 0; crackIndex < 8 + index * 2; crackIndex += 1) {
            let x = random() * 512;
            let y = random() * 512;
            context.beginPath();
            context.moveTo(x, y);
            for (let segment = 0; segment < 7; segment += 1) {
                x += (random() - 0.5) * 70;
                y += (random() - 0.5) * 70;
                context.lineTo(x, y);
            }
            context.stroke();
        }
        context.fillStyle = "rgba(85,72,60,.17)";
        for (let smear = 0; smear < 22; smear += 1) {
            context.beginPath();
            context.ellipse(random() * 512, random() * 512, 12 + random() * 35, 4 + random() * 14, random() * Math.PI, 0, Math.PI * 2);
            context.fill();
        }
        const edge = context.createRadialGradient(256, 256, 150, 256, 256, 360);
        edge.addColorStop(0, "rgba(0,0,0,0)");
        edge.addColorStop(1, "rgba(63,42,25,.55)");
        context.fillStyle = edge;
        context.fillRect(0, 0, 512, 512);
        texture.hasAlpha = true;
        texture.update(false);
        const material = new StandardMaterial(`mirror-damage-material-${index}`, this.scene);
        material.diffuseTexture = texture;
        material.opacityTexture = texture;
        material.useAlphaFromDiffuseTexture = true;
        material.disableLighting = true;
        material.backFaceCulling = false;
        return material;
    }
    updateMirrorPlane(rig) {
        const angle = rig.baseAngle + rig.angleIndex * Math.PI / 4;
        rig.texture.mirrorPlane = Plane.FromPositionAndNormal(rig.pivot.getAbsolutePosition(), this.mirrorNormal(angle));
    }
    mirrorNormal(angle) {
        return new Vector3(Math.sin(angle), 0, -Math.cos(angle)).normalize();
    }
    evaluateMirrorPuzzle(fromConsole) {
        if (this.mirrorSolved)
            return;
        const target = [0, 0, 3, 1];
        const aligned = this.mirrorAngles.every((angle, index) => angle === target[index]);
        if (!aligned) {
            if (fromConsole)
                this.ui.toast("As reflexões não cobrem todas as zonas cegas.");
            return;
        }
        if (!fromConsole) {
            this.ui.toast("Os suportes encaixaram. Teste as linhas no console.", 1800);
            return;
        }
        const visibleTargets = this.mirrorTargets.filter((position) => this.isObservedThroughMirror(position)).length;
        if (visibleTargets < 2) {
            this.ui.toast("A posição está correta, mas você precisa olhar para o conjunto de espelhos.");
            return;
        }
        this.mirrorSolved = true;
        const door = this.scene.getMeshByName("mirror-cell-container-door");
        if (door) {
            door.position.y = 4.4;
            door.checkCollisions = false;
        }
        this.audio.objective();
        this.ui.showSoundCaption("quatro suportes travam e a grade sobe", 1800);
        this.callbacks.onCheckpoint("chapter2-mirror-solved");
    }
    isObservedThroughMirror(mannequinPosition) {
        if (!this.active || this.blackoutActive)
            return false;
        const cameraPosition = this.player.camera.globalPosition;
        const cameraForward = this.player.camera.getForwardRay().direction.normalize();
        for (const mirror of this.mirrors) {
            const mirrorPosition = mirror.pivot.getAbsolutePosition();
            const normal = this.mirrorNormal(mirror.baseAngle + mirror.angleIndex * Math.PI / 4);
            const toMirror = mirrorPosition.subtract(cameraPosition);
            const mirrorDistance = toMirror.length();
            if (mirrorDistance < 0.1 || mirrorDistance > 22)
                continue;
            if (Vector3.Dot(cameraForward, toMirror.scale(1 / mirrorDistance)) < 0.4)
                continue;
            const pointOffset = mannequinPosition.subtract(mirrorPosition);
            const reflected = mannequinPosition.subtract(normal.scale(2 * Vector3.Dot(pointOffset, normal)));
            const reflectedRay = reflected.subtract(cameraPosition);
            const denominator = Vector3.Dot(reflectedRay, normal);
            if (Math.abs(denominator) < 0.0001)
                continue;
            const t = Vector3.Dot(mirrorPosition.subtract(cameraPosition), normal) / denominator;
            if (t <= 0 || t >= 1)
                continue;
            const intersection = cameraPosition.add(reflectedRay.scale(t));
            const right = new Vector3(normal.z, 0, -normal.x).normalize();
            const local = intersection.subtract(mirrorPosition);
            const localX = Vector3.Dot(local, right);
            if (Math.abs(localX) > mirror.width * 0.5 * (1 - mirror.damage))
                continue;
            if (Math.abs(local.y) > mirror.height * 0.5 * (1 - mirror.damage * 0.6))
                continue;
            if (this.rayBlocked(cameraPosition, intersection, mirror.surface))
                continue;
            if (this.rayBlocked(intersection.add(normal.scale(0.08)), mannequinPosition.add(new Vector3(0, 1.1, 0)), mirror.surface))
                continue;
            return true;
        }
        return false;
    }
    rayBlocked(from, to, ignored) {
        const offset = to.subtract(from);
        const distance = offset.length();
        if (distance < 0.1)
            return false;
        const pick = this.scene.pickWithRay(new Ray(from, offset.scale(1 / distance), distance), (mesh) => {
            if (!mesh.isPickable || !mesh.isVisible || !mesh.isEnabled())
                return false;
            if (mesh === ignored || mesh === this.player.collider || mesh.metadata?.mannequinVisual)
                return false;
            return true;
        });
        return Boolean(pick?.hit && pick.distance < distance - 0.25);
    }
    createEnergyCell(index, position) {
        const cell = MeshBuilder.CreateCylinder(`chapter2-energy-cell-${index}`, { height: 1.2, diameter: 0.62, tessellation: 16 }, this.scene);
        cell.parent = this.root;
        cell.position.copyFrom(position);
        cell.rotation.z = Math.PI / 2;
        cell.material = this.materials.emissive(`energy-cell-${index}`, new Color3(0.12 + index * 0.08, 0.48, 0.6 - index * 0.08), 0.72);
        const ringA = MeshBuilder.CreateTorus(`energy-cell-ring-a-${index}`, { diameter: 0.7, thickness: 0.09, tessellation: 12 }, this.scene);
        ringA.parent = cell;
        ringA.position.y = 0.42;
        ringA.material = this.materials.get("metal", index);
        const ringB = ringA.clone(`energy-cell-ring-b-${index}`);
        ringB.parent = cell;
        ringB.position.y = -0.42;
        return cell;
    }
    collectEnergyCell(index) {
        const id = `energyCell${index}`;
        if (this.energyCells.has(id))
            return;
        const item = CHAPTER2_ITEMS[id];
        if (!item)
            return;
        this.energyCells.add(id);
        this.inventory.add(item);
        this.cellMeshes[index - 1]?.setEnabled(false);
        this.audio.pickup();
        this.ui.showDocument(`CÉLULA DE ENERGIA ${index}`, "O núcleo vibra como se respondesse aos movimentos do seu braço.", () => {
            if (this.energyCells.size >= 3) {
                this.objective.set("activate-machine", "ATIVE A MÁQUINA CENTRAL COM AS TRÊS CÉLULAS.");
                this.callbacks.onCheckpoint("chapter2-three-cells");
            }
            else {
                this.objective.set("recover-cells", `RECUPERE AS CÉLULAS DE ENERGIA (${this.energyCells.size}/3).`);
                this.callbacks.onCheckpoint(`chapter2-cell-${index}`);
            }
        });
    }
    moveShelf(index) {
        const shelf = this.shelves[index];
        if (!shelf || this.shelfSolved)
            return;
        if (Math.abs(shelf.root.position.z - (shelf.baseZ + (shelf.targetState - 1) * 5.2)) > 0.2) {
            this.ui.toast("A prateleira ainda está se movendo.");
            return;
        }
        const nextState = (shelf.targetState + 1) % 3;
        const nextZ = shelf.baseZ + (nextState - 1) * 5.2;
        const playerPosition = this.player.collider.position;
        const insideShelfWidth = Math.abs(playerPosition.x - shelf.root.position.x) < 4.2;
        const betweenPositions = playerPosition.z > Math.min(shelf.root.position.z, nextZ) - 2.2
            && playerPosition.z < Math.max(shelf.root.position.z, nextZ) + 2.2;
        if (insideShelfWidth && betweenPositions) {
            this.ui.toast("Afaste-se do trilho antes de mover a prateleira.");
            return;
        }
        shelf.targetState = nextState;
        this.shelfPositions[index] = shelf.targetState;
        this.audio.hydraulicPulse(0.42);
        this.evaluateShelfPuzzle();
    }
    evaluateShelfPuzzle() {
        if (this.shelfSolved)
            return;
        const target = [0, 2, 1];
        if (!this.shelfPositions.every((value, index) => value === target[index]))
            return;
        this.shelfSolved = true;
        const door = this.scene.getMeshByName("storage-cell-cage-door");
        if (door) {
            door.position.y = 5.1;
            door.checkCollisions = false;
        }
        this.audio.objective();
        this.ui.toast("Os corredores se alinham: visão, bloqueio e rota de fuga.", 3400);
        this.callbacks.onCheckpoint("chapter2-storage-solved");
    }
    activateBackupSwitch(index, mesh) {
        if (this.backupSwitches[index])
            return;
        this.backupSwitches[index] = true;
        mesh.rotation.z = -0.55;
        mesh.material = this.materials.emissive(`backup-active-${index}`, new Color3(0.06, 0.5, 0.2), 0.65);
        this.audio.electricalSnap(mesh.getAbsolutePosition(), 0.5);
        this.blackoutTimer += this.settings.extendedPuzzleWindows ? 8 : 5.5;
        this.ui.toast(`A próxima queda foi atrasada. Chaves: ${this.backupSwitches.filter(Boolean).length}/3.`);
        if (this.backupSwitches.every(Boolean)) {
            this.controlRoomSolved = true;
            this.blackoutActive = false;
            this.setChapterLighting(0.68);
            const cage = this.scene.getMeshByName("control-cell-cage");
            if (cage) {
                cage.position.y = 4.2;
                cage.checkCollisions = false;
            }
            this.audio.objective();
            this.callbacks.onCheckpoint("chapter2-control-solved");
        }
    }
    installEnergyCells(bank) {
        if (this.machineActivated)
            return;
        if (this.energyCells.size < 3) {
            this.ui.toast(`Faltam ${3 - this.energyCells.size} células.`);
            return;
        }
        if (this.machineCellsInstalled)
            return;
        this.machineCellsInstalled = true;
        bank.metadata = { ...(bank.metadata ?? {}), cellsInstalled: true };
        [1, 2, 3].forEach((index) => this.inventory.remove(`energyCell${index}`));
        this.createInstalledCellVisuals(bank);
        this.audio.electricalSnap(bank.position, 0.9);
        this.ui.showSoundCaption("três núcleos entram em ressonância", 1800);
        this.checkMachineReadiness();
    }
    createInstalledCellVisuals(bank) {
        [1, 2, 3].forEach((index) => {
            if (this.scene.getMeshByName(`machine-installed-cell-${index}`))
                return;
            const installed = this.createEnergyCell(index, bank.position.add(new Vector3(-1.7 + (index - 1) * 1.7, 0.2, -1.2)));
            installed.name = `machine-installed-cell-${index}`;
            installed.parent = this.root;
            installed.scaling = new Vector3(0.65, 0.65, 0.65);
            installed.isPickable = false;
        });
    }
    checkMachineReadiness() {
        if (this.machineActivated)
            return;
        const bank = this.scene.getMeshByName("machine-cell-bank");
        const ready = this.machineCables.every(Boolean)
            && this.machineCellsInstalled
            && this.machinePressure === 2
            && this.machineCardInserted
            && this.machineTrackAligned
            && this.machineLocks.every(Boolean);
        if (!ready) {
            const complete = this.machineCables.filter(Boolean).length
                + (this.machineCellsInstalled ? 1 : 0)
                + (this.machinePressure === 2 ? 1 : 0)
                + (this.machineCardInserted ? 1 : 0)
                + (this.machineTrackAligned ? 1 : 0)
                + this.machineLocks.filter(Boolean).length;
            this.objective.set("activate-machine", `ATIVE A MÁQUINA CENTRAL · SISTEMAS ${complete}/11.`);
            return;
        }
        this.activateMachine(false);
    }
    activateMachine(debugBypass) {
        if (this.machineActivated)
            return;
        if (debugBypass) {
            this.machineCables.fill(true);
            this.machineLocks.fill(true);
            this.machinePressure = 2;
            this.machineCardInserted = true;
            this.machineTrackAligned = true;
            const bank = this.scene.getMeshByName("machine-cell-bank");
            this.machineCellsInstalled = true;
            if (bank)
                bank.metadata = { ...(bank.metadata ?? {}), cellsInstalled: true };
        }
        this.machineActivated = true;
        this.ruleCollapseProgress = 0.02;
        this.audio.startMachineAlarm();
        this.audio.impact(1.6);
        this.machineRedLights.forEach((light) => light.intensity = 4.5);
        this.chapterLights.forEach((light, index) => light.intensity = index % 2 === 0 ? 0.35 : 1.1);
        this.mannequins.setMovementEnabled(true);
        this.objective.set("sphere-arena-1", "ATRAIA OS MANEQUINS PARA OS TRILHOS E LIBERE A ESFERA.");
        this.ui.showSubtitle("Sistema", "Protocolo de observação suspenso. Movimento autônomo autorizado.", 5200);
        this.callbacks.onCheckpoint("chapter2-machine-activated");
        this.prepareArena(1);
    }
    animateTrackAlignment() {
        for (let index = -2; index <= 2; index += 1) {
            const rail = this.scene.getMeshByName(`central-track-${index}`);
            if (rail)
                rail.position.x = index * 2.2;
        }
    }
    createLureButton(name, position, lurePosition, strength) {
        const pedestal = MeshBuilder.CreateBox(`${name}-pedestal`, { width: 1.8, height: 1.6, depth: 1.5 }, this.scene);
        pedestal.parent = this.root;
        pedestal.position.copyFrom(position);
        pedestal.material = this.materials.get("metal", Math.round(position.x));
        pedestal.checkCollisions = true;
        const button = MeshBuilder.CreateCylinder(name, { height: 0.3, diameter: 0.8, tessellation: 14 }, this.scene);
        button.parent = pedestal;
        button.position = new Vector3(0, 0.95, -0.45);
        button.rotation.x = Math.PI / 2;
        button.material = this.materials.emissive(`${name}-button`, new Color3(0.6, 0.045, 0.02), 0.5);
        this.interaction.register(button, {
            prompt: "[E] ATIVAR SIRENE DE TESTE",
            onInteract: () => {
                if (!this.machineActivated) {
                    this.ui.toast("A linha de teste está sem energia.");
                    return;
                }
                this.mannequins.emitLure(lurePosition, strength, 9);
                this.audio.startTemporaryBuzzer(lurePosition, 4.5);
                this.ui.showSoundCaption("uma sirene industrial chama os manequins", 1800);
            }
        });
        return button;
    }
    createReleaseConsole(name, position, arena) {
        const consoleMesh = MeshBuilder.CreateBox(name, { width: 2.4, height: 1.6, depth: 1.6 }, this.scene);
        consoleMesh.parent = this.root;
        consoleMesh.position.copyFrom(position);
        consoleMesh.material = this.materials.get("metal", arena);
        consoleMesh.checkCollisions = true;
        this.interaction.register(consoleMesh, {
            prompt: () => this.completedArenas.has(arena) ? `TESTE ${arena} CONCLUÍDO` : `[E] LIBERAR ESFERA · TESTE ${arena}`,
            onInteract: () => this.releaseSphere(arena)
        });
        return consoleMesh;
    }
    releaseSphere(arena) {
        if (!this.machineActivated) {
            this.ui.toast("A esfera ainda está presa à máquina central.");
            return;
        }
        if (this.completedArenas.has(arena))
            return;
        if (this.sphereState !== "docked" && this.sphereState !== "settled") {
            this.ui.toast("A esfera ainda está em movimento.");
            return;
        }
        if (arena === 2 && this.trackSwitchState !== this.arena2RequiredRoute) {
            this.ui.toast("O diagrama de manutenção marca o outro ramo como rota de teste.");
            this.audio.impact(0.4);
            return;
        }
        if (arena === 2 && !this.arena2Blockers[this.trackSwitchState]) {
            this.ui.toast("O bloqueio hidráulico ainda ocupa o trilho selecionado.");
            this.audio.impact(0.4);
            return;
        }
        if (arena === 3 && !this.completedArenas.has(2)) {
            this.ui.toast("A trava do Teste C depende do circuito anterior.");
            return;
        }
        this.activeArena = arena;
        this.crushCountThisRun = 0;
        this.sphereSpeed = 0;
        this.sphere.checkCollisions = false;
        if (arena === 1) {
            this.sphere.position = new Vector3(0, 3.45, 367);
            this.sphereTarget = new Vector3(0, 3.45, 413);
            this.sphereState = "arena1";
        }
        else if (arena === 2) {
            this.sphere.position = new Vector3(0, 3.45, 416);
            const routeX = this.trackSwitchState === 0 ? -9 : 9;
            this.sphereTarget = new Vector3(routeX, 3.45, 453);
            this.sphereState = "arena2";
        }
        else {
            this.sphere.position = new Vector3(0, 3.45, 462);
            this.sphereTarget = new Vector3(0, 3.45, 496);
            this.sphereState = "arena3-forward";
            this.arena3Pass = Math.max(0, this.arena3Pass);
        }
        this.audio.impact(1.5);
        this.ui.showSoundCaption("as travas soltam a esfera de seis toneladas", 1900);
    }
    prepareArena(index) {
        this.activeArena = index;
        if (index === 1) {
            this.sphereState = "docked";
            this.sphere.position = new Vector3(0, 3.45, 354);
            this.objective.set("sphere-arena-1", "CRIE UM SOM, ATRAIA OS MANEQUINS E LIBERE A ESFERA.");
        }
        else if (index === 2) {
            this.sphereState = "settled";
            this.sphere.position = new Vector3(0, 3.45, 416);
            this.objective.set("sphere-arena-2", "ESCOLHA O TRILHO, REMOVA OS BLOQUEIOS E LIBERE A ESFERA.");
        }
        else {
            this.sphereState = "settled";
            this.sphere.position = new Vector3(0, 3.45, 462);
            this.objective.set("sphere-arena-3", "SOBREVIVA ÀS ONDAS E USE O RETORNO DA ESFERA.");
        }
    }
    updateOpening(deltaSeconds) {
        if (this.openingComplete)
            return;
        this.openingElapsed += deltaSeconds;
        const indicator = this.scene.getMeshByName("chapter2-floor-indicator");
        const doorLeft = this.scene.getMeshByName("chapter2-elevator-door-left");
        const doorRight = this.scene.getMeshByName("chapter2-elevator-door-right");
        if (indicator?.material && Math.floor(this.openingElapsed * 1.1) !== Math.floor((this.openingElapsed - deltaSeconds) * 1.1)) {
            const floor = Math.min(6, Math.max(1, Math.floor(this.openingElapsed * 0.9)));
            this.updateTextSign(indicator, `B${floor}`);
            this.audio.elevatorTick(floor);
            if (floor === 3 || floor === 5)
                this.audio.impact(0.45);
        }
        if (this.openingElapsed > 2.2 && this.openingElapsed < 5.8) {
            const shake = Math.sin(this.openingElapsed * 34) * 0.025;
            this.player.camera.position.x = shake;
            if (Math.random() < deltaSeconds * 1.1)
                this.ui.showSoundCaption("o elevador range entre os níveis", 900);
        }
        if (this.openingElapsed > 5.3 && this.openingElapsed - deltaSeconds <= 5.3) {
            this.audio.distortedAnnouncement();
            this.ui.showSubtitle("Alto-falante", "Departamento de modelagem. Mantenha contato visual com o produto.", 4700);
        }
        if (this.openingElapsed > 7.2 && doorLeft && doorRight) {
            doorLeft.position.x = Math.max(-3.9, doorLeft.position.x - deltaSeconds * 2.4);
            doorRight.position.x = Math.min(3.9, doorRight.position.x + deltaSeconds * 2.4);
            doorLeft.checkCollisions = false;
            doorRight.checkCollisions = false;
        }
        if (this.openingElapsed > 8.5) {
            this.player.camera.position.x = 0;
            this.openingComplete = true;
            this.torchDisabled = false;
            this.player.setEnabled(true);
            this.mannequins.setMovementEnabled(true);
            this.objective.set("learn-observation", "ATRAVESSE O CORREDOR SEM DEIXAR OS MANEQUINS SAÍREM DE VISTA.");
            this.ui.toast("Ande de costas para manter contato visual · R fecha uma porta próxima atrás de você.", 5200);
            this.callbacks.onCheckpoint("chapter2-elevator-arrival");
        }
    }
    updateShelves(deltaSeconds) {
        this.shelves.forEach((shelf, index) => {
            const targetZ = shelf.baseZ + (shelf.targetState - 1) * 5.2;
            const difference = targetZ - shelf.root.position.z;
            if (Math.abs(difference) < 0.015) {
                shelf.root.position.z = targetZ;
                shelf.state = shelf.targetState;
                return;
            }
            const next = Math.sign(difference) * Math.min(Math.abs(difference), deltaSeconds * 1.65);
            const proposed = shelf.root.position.z + next;
            const playerPosition = this.player.collider.position;
            const closeX = Math.abs(playerPosition.x - shelf.root.position.x) < 4;
            const closeZ = Math.abs(playerPosition.z - proposed) < 2.3;
            if (closeX && closeZ) {
                this.ui.toast("Afaste-se dos trilhos da prateleira.", 900);
                return;
            }
            shelf.root.position.z = proposed;
            if (Math.random() < deltaSeconds * 2)
                this.audio.mannequinJoint(shelf.root.position, 0.2);
            this.shelfPositions[index] = shelf.targetState;
        });
    }
    updateBlackout(deltaSeconds) {
        if (!this.controlRoomEntered || this.controlRoomSolved)
            return;
        const litDuration = this.settings.extendedPuzzleWindows ? 15 : 11;
        const darkDuration = this.settings.extendedPuzzleWindows ? 2.8 : 4.3;
        if (!this.blackoutActive) {
            this.blackoutTimer -= deltaSeconds;
            if (this.blackoutTimer <= 0) {
                this.blackoutActive = true;
                this.blackoutElapsed = 0;
                this.setChapterLighting(0.02);
                this.emergencyLights.forEach((light) => light.intensity = 3.2);
                this.mannequins.setLightingLevel(0.02);
                this.audio.blackoutDrop();
                this.ui.showSoundCaption("a energia cai; todas as juntas começam a se mover", 1800);
            }
            return;
        }
        this.blackoutElapsed += deltaSeconds;
        const pulse = Math.sin(this.blackoutElapsed * 8) > 0.55 ? 2.8 : 0.15;
        this.emergencyLights.forEach((light) => light.intensity = pulse);
        if (!this.isInsideSafeZone() && this.blackoutElapsed > 0.9 && this.blackoutDamageCooldown <= 0) {
            this.damagePlayer(10);
            this.blackoutDamageCooldown = 1.2;
            this.ui.showSoundCaption("mãos de plástico tateiam no escuro", 1200);
        }
        if (this.blackoutElapsed >= darkDuration) {
            this.blackoutActive = false;
            this.blackoutTimer = litDuration + this.backupSwitches.filter(Boolean).length * 1.7;
            this.setChapterLighting(0.72);
            this.emergencyLights.forEach((light) => light.intensity = 0);
            this.mannequins.setLightingLevel(0.72);
            this.audio.electricalSnap(this.player.collider.position, 0.35);
        }
    }
    updateRuleCollapse(deltaSeconds) {
        if (!this.machineActivated || this.ruleCollapsed)
            return;
        this.ruleCollapseProgress = Math.min(1, this.ruleCollapseProgress + deltaSeconds / 19);
        this.mannequins.setRuleCollapse(this.ruleCollapseProgress);
        if (this.ruleCollapseProgress > 0.18 && this.ruleMessageStage === 0) {
            this.ruleMessageStage = 1;
            this.ui.showSoundCaption("um manequim gira a cabeça sem sair da sua visão", 2300);
            this.ui.showSubtitle("Protagonista", "Não. Você não deveria conseguir fazer isso.", 3400);
        }
        if (this.ruleCollapseProgress > 0.46 && this.ruleMessageStage === 1) {
            this.ruleMessageStage = 2;
            this.audio.distortedAnnouncement();
            this.ui.showSubtitle("Sistema", "Limite de observação excedido. Corrida autorizada.", 3900);
        }
        if (this.ruleCollapseProgress > 0.72 && this.ruleMessageStage === 2) {
            this.ruleMessageStage = 3;
            this.ruleCollapsed = true;
            this.mannequins.setRuleCollapse(1);
            this.ui.showSoundCaption("oitenta pares de pés começam a correr", 2500);
            this.callbacks.onCheckpoint("chapter2-rule-collapsed");
        }
    }
    updateSphere(deltaSeconds) {
        if (!this.sphere || this.sphereState === "docked" || this.sphereState === "settled")
            return;
        const offset = this.sphereTarget.subtract(this.sphere.position);
        const distance = offset.length();
        if (distance < 0.25) {
            this.finishSphereRun();
            return;
        }
        this.sphereSpeed = Math.min(this.activeArena === 3 ? 12.5 : 10.5, this.sphereSpeed + deltaSeconds * 7.5);
        const direction = offset.scale(1 / Math.max(0.001, distance));
        this.sphere.position.addInPlace(direction.scale(Math.min(distance, this.sphereSpeed * deltaSeconds)));
        this.sphere.rotation.x += deltaSeconds * this.sphereSpeed * 0.33;
        this.sphere.rotation.z -= deltaSeconds * this.sphereSpeed * 0.21;
        const crushed = this.mannequins.crushInRadius(this.sphere.position, 3.75);
        if (crushed > 0) {
            this.crushCountThisRun += crushed;
            this.spawnCrushDebris(this.sphere.position, Math.min(12, crushed * 3));
            this.ui.showSoundCaption("plástico racha sob a esfera", 1100);
        }
        const playerDistance = Vector3.Distance(this.player.collider.position, this.sphere.position);
        if (playerDistance < 4.2 && this.sphereDamageCooldown <= 0) {
            this.damagePlayer(45);
            this.sphereDamageCooldown = 1.5;
            const side = this.player.collider.position.x >= this.sphere.position.x ? 1 : -1;
            this.player.teleport(this.player.collider.position.add(new Vector3(side * 4.8, 0.3, -1.5)), this.player.camera.rotation.y);
            this.ui.flashDamage(0.8);
        }
        if (this.activeArena === 3 && Math.random() < deltaSeconds * 1.2)
            this.dropArenaDebris();
    }
    finishSphereRun() {
        this.sphere.position.copyFrom(this.sphereTarget);
        this.sphereSpeed = 0;
        if (this.sphereState === "arena1") {
            if (this.crushCountThisRun < 1) {
                this.ui.toast("A esfera passou sem atingir o grupo. Use a sirene antes de liberar.", 3400);
                this.sphereState = "settled";
                this.sphere.position = new Vector3(0, 3.45, 367);
                return;
            }
            this.completedArenas.add(1);
            this.sphereState = "settled";
            this.audio.objective();
            this.objective.set("sphere-arena-2", "SIGA OS TRILHOS ATÉ O SEGUNDO TESTE.");
            this.callbacks.onCheckpoint("chapter2-arena-1-complete");
        }
        else if (this.sphereState === "arena2") {
            if (this.crushCountThisRun < 1) {
                this.ui.toast("O grupo não estava no ramo selecionado.");
                this.sphereState = "settled";
                return;
            }
            this.completedArenas.add(2);
            this.sphereState = "settled";
            this.audio.objective();
            this.objective.set("sphere-arena-3", "ALCANCE O TESTE FINAL E PREPARE O RETORNO DA ESFERA.");
            this.callbacks.onCheckpoint("chapter2-arena-2-complete");
        }
        else if (this.sphereState === "arena3-forward") {
            if (this.crushCountThisRun < 1) {
                this.ui.toast("A primeira onda não estava sobre os trilhos.");
                this.arena3Pass = 0;
                this.sphereState = "settled";
                this.sphere.position = new Vector3(0, 3.45, 462);
                return;
            }
            this.arena3Pass = 1;
            this.sphereState = "settled";
            this.objective.set("sphere-return", "ACIONE O GUINCHO DE RETORNO E ALCANCE UMA ZONA SEGURA.");
            this.ui.showSoundCaption("uma segunda onda atravessa as portas laterais", 1800);
            this.mannequins.emitLure(new Vector3(0, 0, 477), 1.6, 10);
        }
        else if (this.sphereState === "arena3-return") {
            if (this.crushCountThisRun < 1) {
                this.ui.toast("A segunda onda escapou. Reative o guincho quando estiver posicionada.");
                this.arena3Pass = 1;
                this.sphereState = "settled";
                this.sphere.position = new Vector3(0, 3.45, 496);
                return;
            }
            this.arena3Pass = 2;
            this.completedArenas.add(3);
            this.sphereState = "settled";
            this.audio.objective();
            this.objective.set("escape-arena", "FUJA PELA ROTA DE SAÍDA ANTES QUE O SISTEMA REINICIE.");
            this.callbacks.onCheckpoint("chapter2-arena-3-complete");
            this.openArenaExit();
        }
    }
    updateThrownObjects(deltaSeconds) {
        for (const object of this.thrownObjects) {
            if (!object.active)
                continue;
            object.life -= deltaSeconds;
            object.velocity.y -= 12 * deltaSeconds;
            const next = object.mesh.position.add(object.velocity.scale(deltaSeconds));
            const direction = next.subtract(object.mesh.position);
            const distance = direction.length();
            const pick = distance > 0.001
                ? this.scene.pickWithRay(new Ray(object.mesh.position, direction.scale(1 / distance), distance + 0.15), (mesh) => mesh.checkCollisions && mesh !== this.player.collider)
                : null;
            if (pick?.hit || next.y <= 0.18) {
                object.mesh.position.y = Math.max(0.18, object.mesh.position.y);
                object.velocity.scaleInPlace(0.28);
                object.velocity.y = Math.abs(object.velocity.y) * 0.22;
                this.mannequins.emitLure(object.mesh.position, 0.65, 5.5);
                this.audio.metalLure(object.mesh.position, 0.65);
            }
            else {
                object.mesh.position.copyFrom(next);
            }
            object.mesh.rotation.x += deltaSeconds * 7;
            object.mesh.rotation.z += deltaSeconds * 5;
            if (object.life <= 0 || object.velocity.lengthSquared() < 0.04) {
                object.active = false;
                object.mesh.setEnabled(false);
            }
        }
    }
    updateDebris(deltaSeconds) {
        for (const debris of this.debrisPool) {
            if (!debris.active)
                continue;
            debris.life -= deltaSeconds;
            debris.velocity.y -= 9.5 * deltaSeconds;
            debris.mesh.position.addInPlace(debris.velocity.scale(deltaSeconds));
            debris.mesh.rotation.x += deltaSeconds * 5;
            debris.mesh.rotation.y += deltaSeconds * 3;
            if (debris.mesh.position.y < 0.12) {
                debris.mesh.position.y = 0.12;
                if (debris.hazardous) {
                    const playerPosition = this.player.collider.position;
                    const horizontalDistance = Math.hypot(debris.mesh.position.x - playerPosition.x, debris.mesh.position.z - playerPosition.z);
                    if (horizontalDistance < 2.25 && this.arena3HydraulicDamageCooldown <= 0) {
                        this.damagePlayer(7);
                        this.ui.flashDamage(0.45);
                        this.arena3HydraulicDamageCooldown = 0.8;
                    }
                    debris.hazardous = false;
                    this.audio.impact(0.45);
                }
                debris.velocity.y *= -0.22;
                debris.velocity.x *= 0.72;
                debris.velocity.z *= 0.72;
            }
            if (debris.life <= 0) {
                debris.active = false;
                debris.hazardous = false;
                debris.mesh.setEnabled(false);
            }
        }
    }
    updateMayaSequence(deltaSeconds) {
        if (this.mayaSequenceTime < 0)
            return;
        this.mayaSequenceTime += deltaSeconds;
        const hand = this.scene.getMeshByName("maya-ankle-hand");
        if (hand)
            hand.setEnabled(true);
        if (!this.mayaRoot)
            this.createMayaMannequin();
        if (this.mayaRoot) {
            const target = this.player.collider.position.add(this.player.forward().scale(1.3));
            this.mayaRoot.position.copyFrom(new Vector3(target.x, 0.05, target.z));
            this.mayaRoot.rotation.y = Math.atan2(this.player.collider.position.x - target.x, this.player.collider.position.z - target.z);
        }
        if (this.mayaSequenceTime > 0.45 && this.mayaSequenceTime - deltaSeconds <= 0.45) {
            this.audio.mannequinJoint(this.player.collider.position, 1);
            this.ui.showSoundCaption("dedos rígidos prendem seu tornozelo", 1800);
            this.ui.flashDamage(0.35);
        }
        if (this.mayaSequenceTime > 1.25 && this.mayaSequenceTime - deltaSeconds <= 1.25) {
            this.applyMayaFace(true);
            this.ui.showSubtitle("Maya", "Por favor... não deixa ele abrir a caixa.", 3900);
            this.audio.playVoiceLikeLine(2.6);
        }
        if (this.mayaSequenceTime > 4.2 && this.mayaSequenceTime - deltaSeconds <= 4.2) {
            this.applyMayaFace(false);
            this.ui.showSoundCaption("o rosto afunda até voltar a ser liso", 1800);
        }
        if (this.mayaSequenceTime > 5.6) {
            if (hand)
                hand.setEnabled(false);
            this.mayaRoot?.setEnabled(false);
            this.mayaEventSeen = true;
            this.mayaSequenceTime = -1;
            this.player.setEnabled(true);
            this.audio.stopLoop("machine-alarm");
            this.audio.startMusicBoxTheme();
            this.objective.set("follow-music", "SIGA A MELODIA DA CAIXA DE MÚSICA.");
            this.callbacks.onCheckpoint("chapter2-maya-event");
        }
    }
    updateAreaTriggers() {
        const position = this.player.collider.position;
        if (this.openingComplete && !this.corridorLessonTriggered && position.z > 214) {
            this.corridorLessonTriggered = true;
            this.fire.torchLit = false;
            this.torchDisabled = false;
            this.audio.windGust();
            this.ui.showSoundCaption("uma corrente de ar apaga a chama — você pode acendê-la novamente", 2200);
            this.ui.showSubtitle("Protagonista", "Eles param quando eu olho. Certo... continua olhando.", 4400);
        }
        if (!this.modelingObjectiveTriggered && position.z > 245) {
            this.modelingObjectiveTriggered = true;
            this.objective.set("recover-cells", `RECUPERE AS CÉLULAS DE ENERGIA (${this.energyCells.size}/3).`);
            this.ui.toast("Três circuitos alimentam a máquina central: espelhos, armazenamento e controle.", 3900);
        }
        if (!this.controlRoomEntered && position.x < -14 && position.z > 307 && position.z < 334) {
            this.controlRoomEntered = true;
            this.blackoutTimer = this.settings.extendedPuzzleWindows ? 16 : 11;
            this.objective.set("blackout-control", "ATIVE AS TRÊS CHAVES DE RESERVA ENTRE OS APAGÕES.");
            this.ui.showSoundCaption("um relé inicia uma contagem mecânica", 1500);
        }
        if (this.machineActivated && this.completedArenas.has(1) && !this.completedArenas.has(2) && position.z > 418) {
            this.activeArena = 2;
            this.objective.set("sphere-arena-2", "ESCOLHA O RAMO CERTO E USE O SOM PARA POSICIONAR O GRUPO.");
        }
        if (this.completedArenas.has(2) && !this.completedArenas.has(3) && position.z > 458) {
            this.activeArena = 3;
            this.objective.set("sphere-arena-3", "SOBREVIVA ÀS ONDAS E USE A ESFERA DUAS VEZES.");
        }
        if (this.completedArenas.has(3) && !this.mayaEventSeen && this.mayaSequenceTime < 0 && position.z > 497) {
            this.mayaSequenceTime = 0;
            this.player.setEnabled(false);
            this.mannequins.deactivateNearest(position, 5);
            this.audio.stopLoop("machine-alarm");
        }
        if (this.mayaEventSeen && !this.exitTriggered && position.z > 528) {
            this.exitTriggered = true;
            this.active = false;
            this.player.setEnabled(false);
            this.audio.stopMusicBoxTheme();
            this.callbacks.onChapterComplete();
        }
        const rearDistance = this.mannequins.getNearestRearDistance();
        const now = performance.now() * 0.001;
        if (rearDistance < 2.7 && now - this.lastRearCue > 2.5) {
            this.lastRearCue = now;
            this.ui.toast("Algo está quase encostando nas suas costas.", 1200);
        }
    }
    createMayaMannequin() {
        const root = new TransformNode("maya-mannequin-root", this.scene);
        root.parent = this.root;
        const torso = MeshBuilder.CreateCapsule("maya-mannequin-torso", { height: 1.35, radius: 0.34, tessellation: 12 }, this.scene);
        torso.parent = root;
        torso.position.y = 0.78;
        torso.rotation.x = Math.PI / 2.8;
        torso.material = this.materials.get("plastic", 1);
        const head = MeshBuilder.CreateSphere("maya-mannequin-head", { diameter: 0.68, segments: 20 }, this.scene);
        head.parent = root;
        head.position = new Vector3(0, 0.78, -0.64);
        head.scaling = new Vector3(0.86, 1.06, 0.9);
        head.material = this.materials.get("plastic", 1);
        const arm = MeshBuilder.CreateCapsule("maya-mannequin-arm", { height: 1.1, radius: 0.11, tessellation: 8 }, this.scene);
        arm.parent = root;
        arm.position = new Vector3(0.42, 0.35, 0.18);
        arm.rotation.z = Math.PI / 2;
        arm.material = this.materials.get("plastic", 1);
        this.mayaRoot = root;
        this.mayaHead = head;
        const originalPositions = head.getVerticesData("position");
        this.mayaOriginalPositions = originalPositions ? Array.from(originalPositions) : null;
    }
    applyMayaFace(visible) {
        if (!this.mayaHead)
            return;
        if (!visible) {
            this.mayaHead.material = this.materials.get("plastic", 1);
            if (this.mayaOriginalPositions)
                this.mayaHead.updateVerticesData("position", [...this.mayaOriginalPositions], true, false);
            return;
        }
        const texture = new DynamicTexture("maya-generated-face", { width: 512, height: 512 }, this.scene, false);
        const context = texture.getContext();
        const gradient = context.createRadialGradient(256, 220, 45, 256, 256, 300);
        gradient.addColorStop(0, "#b9a68d");
        gradient.addColorStop(0.7, "#8d7a66");
        gradient.addColorStop(1, "#55483e");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        context.fillStyle = "#191615";
        context.beginPath();
        context.ellipse(178, 218, 34, 19, -0.12, 0, Math.PI * 2);
        context.ellipse(334, 218, 34, 19, 0.12, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#ddd2bd";
        context.beginPath();
        context.arc(184, 214, 7, 0, Math.PI * 2);
        context.arc(328, 214, 7, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "#392622";
        context.lineWidth = 11;
        context.beginPath();
        context.moveTo(178, 350);
        context.quadraticCurveTo(256, 305, 334, 350);
        context.stroke();
        context.strokeStyle = "rgba(45,34,30,.65)";
        context.lineWidth = 4;
        for (let line = 0; line < 5; line += 1) {
            context.beginPath();
            context.moveTo(152 + line * 48, 160);
            context.lineTo(132 + line * 54, 78);
            context.stroke();
        }
        texture.update(false);
        const material = new StandardMaterial("maya-generated-face-material", this.scene);
        material.diffuseTexture = texture;
        material.specularPower = 12;
        this.mayaHead.material = material;
        const positions = this.mayaOriginalPositions ? [...this.mayaOriginalPositions] : this.mayaHead.getVerticesData("position");
        if (positions) {
            for (let index = 0; index < positions.length; index += 3) {
                const x = positions[index] ?? 0;
                const y = positions[index + 1] ?? 0;
                const z = positions[index + 2] ?? 0;
                if (z < -0.18 && y > -0.12 && Math.abs(x) < 0.18)
                    positions[index + 2] = z - 0.055 * (1 - Math.abs(x) / 0.18);
                if (z < -0.12 && y < -0.08 && y > -0.28)
                    positions[index + 1] = y - 0.035;
            }
            this.mayaHead.updateVerticesData("position", positions, true, false);
        }
    }
    openArenaExit() {
        const panels = this.scene.meshes.filter((mesh) => mesh.name.startsWith("arena3-hanging-panel-"));
        panels.slice(0, 6).forEach((panel, index) => {
            panel.position.y = 0.25;
            panel.rotation.x = index * 0.2;
            panel.checkCollisions = false;
        });
        this.audio.impact(1.3);
        this.ui.showSoundCaption("a parede de manutenção desaba e revela uma saída", 2100);
    }
    damagePlayer(amount) {
        this.player.damage(amount);
        this.ui.flashDamage(Math.min(0.85, amount / 30));
        if (this.player.health > 0)
            return;
        this.player.health = 45;
        const checkpoint = this.completedArenas.has(3)
            ? this.checkpoints.maya
            : this.completedArenas.has(2)
                ? this.checkpoints.arena3
                : this.completedArenas.has(1)
                    ? this.checkpoints.arena2
                    : this.machineActivated
                        ? this.checkpoints.arena1
                        : this.energyCells.size >= 3
                            ? this.checkpoints.machine
                            : this.checkpoints.modeling;
        this.player.teleport(checkpoint.clone(), Math.PI);
        this.callbacks.onPlayerDamaged();
    }
    isInsideSafeZone() {
        const position = this.player.collider.position;
        return [new Vector3(-36, 0, 313), new Vector3(-27, 0, 326), new Vector3(-18, 0, 313)]
            .some((safe) => Math.abs(position.x - safe.x) < 2.2 && Math.abs(position.z - safe.z) < 2.2);
    }
    setChapterLighting(level) {
        this.chapterLights.forEach((light, index) => light.intensity = level * (index % 3 === 0 ? 2.5 : 1.8));
    }
    updateArenaThreeHazard(deltaSeconds) {
        if (this.activeArena !== 3 || this.completedArenas.has(3) || !this.machineActivated) {
            this.arena3HydraulicTimer = this.settings.extendedPuzzleWindows ? 8.5 : 6.5;
            this.arena3HydraulicWarning = false;
            return;
        }
        this.arena3HydraulicTimer -= deltaSeconds;
        const warningWindow = this.settings.extendedPuzzleWindows ? 2 : 1.35;
        if (this.arena3HydraulicTimer <= warningWindow && !this.arena3HydraulicWarning) {
            this.arena3HydraulicWarning = true;
            this.ui.showSoundCaption("as linhas hidráulicas pressurizam sob o piso", 1400);
            this.audio.hydraulicPulse(0.35);
            this.emergencyLights.forEach((light) => light.intensity = Math.max(light.intensity, 2.8));
        }
        if (this.arena3HydraulicTimer > 0)
            return;
        this.audio.hydraulicPulse(1.25);
        this.ui.showSoundCaption("um pulso hidráulico atravessa o piso", 1300);
        if (!this.isOnArenaThreeSafePlatform() && this.arena3HydraulicDamageCooldown <= 0) {
            this.damagePlayer(12);
            this.ui.flashDamage(0.6);
            this.arena3HydraulicDamageCooldown = 1.8;
        }
        else {
            this.ui.toast("A plataforma isolou o impacto hidráulico.", 1100);
        }
        this.dropArenaDebris();
        this.dropArenaDebris();
        this.arena3HydraulicTimer = this.settings.extendedPuzzleWindows ? 8.5 : 6.5;
        this.arena3HydraulicWarning = false;
    }
    isOnArenaThreeSafePlatform() {
        const position = this.player.collider.position;
        return [-14, 0, 14].some((x) => Math.abs(position.x - x) <= 2.75 && Math.abs(position.z - 475) <= 2.75);
    }
    dropArenaDebris() {
        const debris = this.debrisPool.find((piece) => !piece.active);
        if (!debris)
            return;
        debris.active = true;
        debris.hazardous = true;
        debris.life = 4;
        debris.mesh.setEnabled(true);
        debris.mesh.position = new Vector3(-16 + Math.random() * 32, 8, 468 + Math.random() * 25);
        debris.velocity = new Vector3((Math.random() - 0.5) * 2, -1, (Math.random() - 0.5) * 2);
    }
    spawnCrushDebris(position, count) {
        let spawned = 0;
        for (const debris of this.debrisPool) {
            if (debris.active)
                continue;
            debris.active = true;
            debris.hazardous = false;
            debris.life = 3 + Math.random() * 2;
            debris.mesh.setEnabled(true);
            debris.mesh.position.copyFrom(position.add(new Vector3((Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2)));
            debris.velocity = new Vector3((Math.random() - 0.5) * 7, 2 + Math.random() * 5, (Math.random() - 0.5) * 7);
            debris.mesh.material = spawned % 3 === 0 ? this.materials.get("metal", spawned) : this.materials.get("plastic", spawned);
            spawned += 1;
            if (spawned >= count)
                break;
        }
    }
    createThrownObjectPool() {
        for (let index = 0; index < 8; index += 1) {
            const mesh = MeshBuilder.CreateCylinder(`throwable-metal-can-${index}`, { height: 0.45, diameter: 0.24, tessellation: 10 }, this.scene);
            mesh.parent = this.root;
            mesh.material = this.materials.get("metal", index);
            mesh.isPickable = false;
            mesh.checkCollisions = false;
            mesh.setEnabled(false);
            this.thrownObjects.push({ mesh, velocity: Vector3.Zero(), active: false, life: 0 });
        }
    }
    createDebrisPool() {
        for (let index = 0; index < 36; index += 1) {
            const mesh = index % 6 === 0
                ? MeshBuilder.CreateSphere(`chapter2-debris-head-${index}`, { diameter: 0.32 + (index % 3) * 0.08, segments: 7 }, this.scene)
                : index % 3 === 0
                    ? MeshBuilder.CreateCapsule(`chapter2-debris-limb-${index}`, { height: 0.55 + (index % 4) * 0.1, radius: 0.08, tessellation: 6 }, this.scene)
                    : MeshBuilder.CreateBox(`chapter2-debris-frame-${index}`, {
                        width: 0.12 + (index % 3) * 0.1,
                        height: 0.15 + (index % 4) * 0.08,
                        depth: 0.16 + (index % 2) * 0.12
                    }, this.scene);
            mesh.parent = this.root;
            mesh.material = index % 4 === 0 ? this.materials.get("metal", index) : this.materials.get("plastic", index);
            mesh.isPickable = false;
            mesh.checkCollisions = false;
            mesh.setEnabled(false);
            this.debrisPool.push({ mesh, velocity: Vector3.Zero(), life: 0, active: false, hazardous: false });
        }
    }
    createDocument(id, title, body, position) {
        const document = MeshBuilder.CreateBox(`chapter2-document-${id}`, { width: 0.8, height: 0.035, depth: 1.05 }, this.scene);
        document.parent = this.root;
        document.position.copyFrom(position);
        document.material = this.materials.solid(`chapter2-paper-${id}`, new Color3(0.58, 0.54, 0.43), 0.94);
        this.documentMeshes.set(id, document);
        this.interaction.register(document, {
            prompt: `[E] LER ${title}`,
            onInteract: () => {
                this.collectedDocuments.add(id);
                this.ui.showDocument(title, body);
                this.callbacks.onCheckpoint(`chapter2-document-${id}`);
            }
        });
    }
    applyRestoredVisualState() {
        this.mirrors.forEach((mirror, index) => {
            mirror.angleIndex = this.mirrorAngles[index] ?? 0;
            mirror.pivot.rotation.y = mirror.baseAngle + mirror.angleIndex * Math.PI / 4;
            this.updateMirrorPlane(mirror);
        });
        if (this.mirrorSolved) {
            const door = this.scene.getMeshByName("mirror-cell-container-door");
            if (door) {
                door.position.y = 4.4;
                door.checkCollisions = false;
            }
        }
        this.shelves.forEach((shelf, index) => {
            shelf.state = this.shelfPositions[index] ?? 1;
            shelf.targetState = shelf.state;
            shelf.root.position.z = shelf.baseZ + (shelf.state - 1) * 5.2;
        });
        if (this.shelfSolved) {
            const door = this.scene.getMeshByName("storage-cell-cage-door");
            if (door) {
                door.position.y = 5.1;
                door.checkCollisions = false;
            }
        }
        this.backupSwitches.forEach((active, index) => {
            const mesh = this.scene.getMeshByName(`backup-switch-${index}`);
            if (mesh && active) {
                mesh.rotation.z = -0.55;
                mesh.material = this.materials.emissive(`backup-active-${index}`, new Color3(0.06, 0.5, 0.2), 0.65);
            }
        });
        if (this.controlRoomSolved) {
            const cage = this.scene.getMeshByName("control-cell-cage");
            if (cage) {
                cage.position.y = 4.2;
                cage.checkCollisions = false;
            }
        }
        [1, 2, 3].forEach((index) => this.cellMeshes[index - 1]?.setEnabled(!this.energyCells.has(`energyCell${index}`)));
        this.machineCables.forEach((active, index) => {
            const cable = this.machineCableMeshes[index];
            if (cable)
                cable.scaling.y = active ? 1 : 0.38;
        });
        this.machineLocks.forEach((active, index) => {
            const lock = this.machineLockMeshes[index];
            if (lock)
                lock.rotation.x = active ? -0.8 : 0;
        });
        if (this.machineCellsInstalled) {
            const bank = this.scene.getMeshByName("machine-cell-bank");
            if (bank) {
                bank.metadata = { ...(bank.metadata ?? {}), cellsInstalled: true };
                this.createInstalledCellVisuals(bank);
            }
        }
        this.arena2Blockers.forEach((cleared, routeIndex) => {
            const blocker = this.scene.getMeshByName(`arena2-track-blocker-${routeIndex}`);
            if (blocker && cleared) {
                blocker.position.y = -1.2;
                blocker.checkCollisions = false;
            }
        });
        if (this.machineTrackAligned)
            this.animateTrackAlignment();
        if (this.machineCardInserted) {
            const reader = this.scene.getMeshByName("machine-body-card-reader");
            if (reader)
                reader.material = this.materials.emissive("card-reader-active", new Color3(0.55, 0.07, 0.035), 0.7);
        }
        if (this.machineActivated) {
            this.machineRedLights.forEach((light) => light.intensity = 4.5);
            if (this.completedArenas.has(3))
                this.sphere.position = new Vector3(0, 3.45, 463);
            else if (this.completedArenas.has(2))
                this.sphere.position = new Vector3(0, 3.45, 462);
            else if (this.completedArenas.has(1))
                this.sphere.position = new Vector3(0, 3.45, 416);
            else
                this.sphere.position = new Vector3(0, 3.45, 354);
            this.sphereState = this.completedArenas.size > 0 ? "settled" : this.sphereState;
        }
        if (this.completedArenas.has(3)) {
            const panels = this.scene.meshes.filter((mesh) => mesh.name.startsWith("arena3-hanging-panel-"));
            panels.slice(0, 6).forEach((panel, index) => {
                panel.position.y = 0.25;
                panel.rotation.x = index * 0.2;
                panel.checkCollisions = false;
            });
        }
        this.documentMeshes.forEach((mesh, id) => mesh.setEnabled(!this.collectedDocuments.has(id)));
    }
    createHall(name, center, width, depth, height, material, rotationY = 0) {
        const room = new TransformNode(name, this.scene);
        room.parent = this.root;
        room.position.copyFrom(center);
        room.rotation.y = rotationY;
        const floor = MeshBuilder.CreateBox(`${name}-floor`, { width, height: 0.22, depth }, this.scene);
        floor.parent = room;
        floor.position.y = -0.11;
        floor.material = this.materials.get(material, Math.round(center.z));
        floor.checkCollisions = true;
        const ceiling = MeshBuilder.CreateBox(`${name}-ceiling`, { width, height: 0.2, depth }, this.scene);
        ceiling.parent = room;
        ceiling.position.y = height;
        ceiling.material = this.materials.get("concrete", Math.round(center.x));
        ceiling.checkCollisions = true;
        for (const side of [-1, 1]) {
            const wall = MeshBuilder.CreateBox(`${name}-wall-${side}`, { width: 0.35, height, depth }, this.scene);
            wall.parent = room;
            wall.position = new Vector3(side * width * 0.5, height * 0.5, 0);
            wall.material = this.materials.get(material, side + Math.round(center.z));
            wall.checkCollisions = true;
        }
    }
    createRoom(name, center, width, depth, height, material, doorways = []) {
        const room = new TransformNode(name, this.scene);
        room.parent = this.root;
        room.position.copyFrom(center);
        const floor = MeshBuilder.CreateBox(`${name}-floor`, { width, height: 0.22, depth }, this.scene);
        floor.parent = room;
        floor.position.y = -0.11;
        floor.material = this.materials.get(material, Math.round(center.x + center.z));
        floor.checkCollisions = true;
        floor.metadata = { guideFloor: true };
        const ceiling = MeshBuilder.CreateBox(`${name}-ceiling`, { width, height: 0.2, depth }, this.scene);
        ceiling.parent = room;
        ceiling.position.y = height;
        ceiling.material = this.materials.get("concrete", Math.round(center.z));
        ceiling.checkCollisions = true;
        ceiling.metadata = { roomCeiling: true };
        const thickness = 0.38;
        const wallMaterial = this.materials.get(material, Math.round(center.z));
        const buildSide = (side) => {
            const horizontal = side === "north" || side === "south";
            const total = horizontal ? width : depth;
            const relevant = doorways.filter((doorway) => doorway.side === side)
                .map((doorway) => ({ start: Math.max(-total / 2, doorway.offset - doorway.width / 2), end: Math.min(total / 2, doorway.offset + doorway.width / 2) }))
                .sort((a, b) => a.start - b.start);
            const spans = [];
            let cursor = -total / 2;
            for (const opening of relevant) {
                if (opening.start > cursor + 0.02)
                    spans.push({ start: cursor, end: opening.start });
                cursor = Math.max(cursor, opening.end);
            }
            if (cursor < total / 2 - 0.02)
                spans.push({ start: cursor, end: total / 2 });
            if (relevant.length === 0)
                spans.splice(0, spans.length, { start: -total / 2, end: total / 2 });
            spans.forEach((span, index) => {
                const length = span.end - span.start;
                const wall = MeshBuilder.CreateBox(`${name}-${side}-wall-${index}`, horizontal
                    ? { width: length, height, depth: thickness }
                    : { width: thickness, height, depth: length }, this.scene);
                wall.parent = room;
                const along = (span.start + span.end) / 2;
                wall.position = horizontal
                    ? new Vector3(along, height / 2, side === "north" ? depth / 2 : -depth / 2)
                    : new Vector3(side === "east" ? width / 2 : -width / 2, height / 2, along);
                wall.material = wallMaterial;
                wall.checkCollisions = true;
                wall.metadata = { roomWall: true, room: name };
            });
            relevant.forEach((opening, index) => {
                const openingWidth = opening.end - opening.start;
                const lintelHeight = Math.max(0.2, height - 5.05);
                const lintel = MeshBuilder.CreateBox(`${name}-${side}-lintel-${index}`, horizontal
                    ? { width: openingWidth, height: lintelHeight, depth: thickness }
                    : { width: thickness, height: lintelHeight, depth: openingWidth }, this.scene);
                lintel.parent = room;
                const along = (opening.start + opening.end) / 2;
                lintel.position = horizontal
                    ? new Vector3(along, 5.05 + lintelHeight / 2, side === "north" ? depth / 2 : -depth / 2)
                    : new Vector3(side === "east" ? width / 2 : -width / 2, 5.05 + lintelHeight / 2, along);
                lintel.material = wallMaterial;
                lintel.checkCollisions = true;
                lintel.metadata = { roomWall: true, room: name };
            });
        };
        buildSide("north");
        buildSide("south");
        buildSide("east");
        buildSide("west");
    }
    createTextSign(name, text, position, width, height, color) {
        const texture = new DynamicTexture(`${name}-texture`, { width: 1024, height: 256 }, this.scene, false);
        const context = texture.getContext();
        context.fillStyle = "#d8cfb5";
        context.fillRect(0, 0, 1024, 256);
        context.fillStyle = color.toHexString();
        context.font = "bold 56px Georgia";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, 512, 128, 950);
        context.strokeStyle = "rgba(35,30,24,.35)";
        for (let index = 0; index < 24; index += 1) {
            context.beginPath();
            context.moveTo(Math.random() * 1024, Math.random() * 256);
            context.lineTo(Math.random() * 1024, Math.random() * 256);
            context.stroke();
        }
        texture.update(false);
        const material = new StandardMaterial(`${name}-material`, this.scene);
        material.diffuseTexture = texture;
        material.specularPower = 10;
        const sign = MeshBuilder.CreatePlane(name, { width, height }, this.scene);
        sign.parent = this.root;
        sign.position.copyFrom(position);
        sign.rotation.y = 0;
        sign.material = material;
        sign.isPickable = false;
        return sign;
    }
    updateTextSign(sign, text) {
        const material = sign.material;
        const texture = material?.diffuseTexture;
        if (!texture)
            return;
        const context = texture.getContext();
        context.fillStyle = "#16130f";
        context.fillRect(0, 0, 1024, 256);
        context.fillStyle = "#d64b2a";
        context.font = "bold 112px monospace";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, 512, 128);
        texture.update(false);
    }
    createMeasurementDiagram(name, position, rotationY) {
        const texture = new DynamicTexture(`${name}-texture`, { width: 512, height: 768 }, this.scene, false);
        const context = texture.getContext();
        context.fillStyle = "#c8c0a8";
        context.fillRect(0, 0, 512, 768);
        context.strokeStyle = "#493f34";
        context.lineWidth = 6;
        context.beginPath();
        context.arc(256, 120, 62, 0, Math.PI * 2);
        context.moveTo(256, 182);
        context.lineTo(256, 455);
        context.moveTo(256, 245);
        context.lineTo(120, 385);
        context.moveTo(256, 245);
        context.lineTo(392, 385);
        context.moveTo(256, 455);
        context.lineTo(155, 690);
        context.moveTo(256, 455);
        context.lineTo(357, 690);
        context.stroke();
        context.fillStyle = "#493f34";
        context.font = "24px monospace";
        context.fillText("ALTURA", 28, 80);
        context.fillText("ALCANCE", 320, 250);
        context.fillText("PASSO", 320, 540);
        texture.update(false);
        const material = new StandardMaterial(`${name}-material`, this.scene);
        material.diffuseTexture = texture;
        const plane = MeshBuilder.CreatePlane(name, { width: 4, height: 6 }, this.scene);
        plane.parent = this.root;
        plane.position.copyFrom(position);
        plane.rotation.y = rotationY;
        plane.material = material;
    }
    createMannequinSpawns() {
        const spawns = [];
        const addRows = (centerX, startZ, rows, columns, spacingX, spacingZ, groupOffset) => {
            for (let row = 0; row < rows; row += 1) {
                for (let column = 0; column < columns; column += 1) {
                    const jitter = ((row * 17 + column * 31 + groupOffset) % 7 - 3) * 0.08;
                    spawns.push({
                        position: new Vector3(centerX + (column - (columns - 1) / 2) * spacingX + jitter, 0, startZ + row * spacingZ),
                        rotationY: (row + column) % 2 === 0 ? Math.PI : 0,
                        group: groupOffset + row,
                        pose: (row * columns + column) % 6
                    });
                }
            }
        };
        addRows(0, 211, 6, 2, 5.4, 4.6, 0); // 12 corridor
        addRows(-25, 274, 2, 4, 5, 7.4, 10); // 8 mirrors
        addRows(27, 276, 3, 4, 5.2, 7.6, 20); // 12 storage
        addRows(-27, 312, 2, 4, 5.5, 8.2, 30); // 8 control
        addRows(0, 343, 2, 4, 6.5, 9, 40); // 8 machine
        addRows(0, 389, 2, 5, 6.5, 10, 50); // 10 arena 1
        addRows(0, 429, 2, 5, 8, 11, 60); // 10 arena 2
        addRows(0, 469, 3, 4, 8, 9, 70); // 12 arena 3
        return spawns;
    }
    seeded(seed) {
        let state = seed >>> 0;
        return () => {
            state = (state * 1664525 + 1013904223) >>> 0;
            return state / 4294967296;
        };
    }
}
