import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import "@babylonjs/core/Meshes/thinInstanceMesh";
import { PlushEnemy } from "../entities/PlushEnemy.js";
export const ITEM_CATALOG = {
    torch: { id: "torch", name: "Tocha improvisada", description: "Um pedaço de madeira envolto em tecido velho." },
    fuel: { id: "fuel", name: "Combustível", description: "Gasolina retirada de um veículo abandonado." },
    panelKey: { id: "panelKey", name: "Chave do quadro elétrico", description: "Uma chave de latão marcada com ELEC-2." },
    fuse: { id: "fuse", name: "Fusível", description: "Fusível industrial de alta amperagem." },
    cable: { id: "cable", name: "Cabo", description: "Um cabo de cobre pesado com isolamento rachado." },
    crank: { id: "crank", name: "Manivela", description: "Manivela removível de uma máquina de refrigerante." },
    bodyCard: { id: "bodyCard", name: "Cartão do Corpo", description: "Cartão perfurado vermelho, ainda morno." },
    bandage: { id: "bandage", name: "Curativo improvisado", description: "Tecido limpo e fita industrial." },
    crowbar: { id: "crowbar", name: "Pé de cabra", description: "Arma improvisada. Clique esquerdo ataca; botão direito executa um golpe pesado." },
    protectiveVest: { id: "protectiveVest", name: "Colete de manutenção", description: "Proteção acolchoada que absorve parte do dano recebido." },
    medkit: { id: "medkit", name: "Kit de primeiros socorros", description: "Suprimentos médicos encontrados em um baú de emergência." },
    flare: { id: "flare", name: "Sinalizador", description: "Uma fonte de luz reserva, útil para afastar criaturas por alguns segundos." }
};
export class WorldBuilder {
    checkpoints = {
        prologue: new Vector3(0, 0.12, 6),
        lobby: new Vector3(0, 0.12, 49),
        gift: new Vector3(-15, 0.12, 61),
        power: new Vector3(-18, 0.12, 91),
        hands: new Vector3(-15, 0.12, 110),
        eyes: new Vector3(15, 0.12, 110),
        heart: new Vector3(-15, 0.12, 132),
        feet: new Vector3(15, 0.12, 132),
        auditorium: new Vector3(0, 0.12, 145),
        elevator: new Vector3(0, 0.12, 177)
    };
    powerRestored = false;
    enteredWonderWorld = false;
    fenceOpened = false;
    sideDoorOpened = false;
    auditoriumOpened = false;
    bodyDefeated = false;
    plushEnemies = [];
    solvedPuzzles = new Set();
    sideDoor;
    auditoriumDoor;
    elevatorDoor;
    bodyCardMesh = null;
    sideDoorBlocker;
    auditoriumDoorBlocker;
    elevatorDoorBlocker;
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
    boss = null;
    coverSeats = [];
    coverSeatDamage = new Map();
    stageCurtains = [];
    keyTaken = false;
    crateMoved = false;
    lockerOpened = false;
    openedCarTrunks = new Set();
    fuelCarIndex = 2;
    torchTaken = false;
    fuelTaken = false;
    cableTaken = false;
    fuseTaken = false;
    crankTaken = false;
    panelKeyTaken = false;
    bandageTaken = false;
    handsAngles = [0, 0, 0, 0];
    eyesAngles = [0, 0, 0];
    heartValves = [0, 0, 0];
    heartPulses = [];
    feetProgress = 0;
    feetSequence = [0, 2, 1, 3];
    spotlightActivations = 0;
    auditoriumTriggerUsed = false;
    carHeadlightSets = [];
    carHeadlightFlashToken = 0;
    meleeCooldownUntil = 0;
    openedLootContainers = new Set();
    lootedContainers = new Set();
    activatedCheckpoints = new Set();
    lootContainerRigs = new Map();
    survivalCheckpointPositions = new Map();
    constructor(scene, materials, interaction, inventory, objective, ui, audio, fire, player, callbacks) {
        this.scene = scene;
        this.materials = materials;
        this.interaction = interaction;
        this.inventory = inventory;
        this.objective = objective;
        this.ui = ui;
        this.audio = audio;
        this.fire = fire;
        this.player = player;
        this.callbacks = callbacks;
    }
    build() {
        this.createExterior();
        this.createFacilityShell();
        this.createLobby();
        this.createGiftShop();
        this.createFoodCourt();
        this.createMaintenanceAndPower();
        this.createHandsPuzzle();
        this.createEyesPuzzle();
        this.createHeartPuzzle();
        this.createFeetPuzzle();
        this.createAuditorium();
        this.createUndergroundTransition();
        this.createAtmosphere();
        this.createSurvivalLoot();
        this.createCheckpointStations();
        this.createGlobalMapBoundaries();
    }
    attachBoss(boss) {
        this.boss = boss;
    }
    update() {
        if (!this.enteredWonderWorld)
            return;
        const playerPosition = this.player.collider.position;
        if (!this.auditoriumTriggerUsed && this.auditoriumOpened && playerPosition.z > 142 && Math.abs(playerPosition.x) < 10) {
            this.auditoriumTriggerUsed = true;
            this.callbacks.onBossRequested();
        }
        if (this.player.health <= 0) {
            this.player.health = 40;
            const checkpoint = this.bodyDefeated ? this.checkpoints.elevator : this.auditoriumTriggerUsed ? this.checkpoints.auditorium : this.checkpoints.lobby;
            this.player.teleport(checkpoint.clone());
            this.callbacks.onPlayerDamaged();
        }
    }
    handlePrimaryAttack(charged) {
        if (!this.inventory.has("crowbar") || !this.player.enabled)
            return false;
        const now = performance.now();
        if (now < this.meleeCooldownUntil)
            return true;
        const staminaCost = charged ? 34 : 16;
        if (!this.player.consumeStamina(staminaCost)) {
            this.ui.toast("Você precisa recuperar o fôlego.");
            return true;
        }
        this.meleeCooldownUntil = now + (charged ? 950 : 430);
        this.audio.clubSwing(charged);
        const origin = this.player.camera.globalPosition;
        const forward = this.player.camera.getForwardRay().direction.normalize();
        let selected = null;
        let bestDistance = charged ? 3.6 : 2.8;
        for (const enemy of this.plushEnemies) {
            if (enemy.isDead())
                continue;
            const offset = enemy.getPosition().subtract(origin);
            const distance = offset.length();
            if (distance <= 0.01 || distance > bestDistance)
                continue;
            const facing = Vector3.Dot(forward, offset.scale(1 / distance));
            if (facing < (charged ? 0.42 : 0.58))
                continue;
            selected = enemy;
            bestDistance = distance;
        }
        if (selected) {
            selected.takeDamage(charged ? 58 : 30, forward);
            this.audio.clubImpact(selected.getPosition(), "plastic", charged);
            this.ui.showSoundCaption("tecido e plástico cedem ao golpe", 950);
            return true;
        }
        const ray = this.player.camera.getForwardRay(charged ? 3.6 : 2.8);
        const pick = this.scene.pickWithRay(ray, (mesh) => mesh.isPickable && mesh.isVisible && mesh !== this.player.collider);
        if (pick?.hit && pick.pickedPoint) {
            const material = pick.pickedMesh?.name.includes("metal") || pick.pickedMesh?.name.includes("door") ? "metal" : "concrete";
            this.audio.clubImpact(pick.pickedPoint, material, charged);
        }
        return true;
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
            if (valid.length === 0)
                return fallback.clone();
            return valid.sort((a, b) => Vector3.Distance(a, player) - Vector3.Distance(b, player))[0].clone();
        };
        if (objectiveId === "find-entry") {
            if (!this.torchTaken)
                return meshPoint("improvised-torch-pickup", new Vector3(-27, 0.2, 25));
            if (!this.fuelTaken)
                return meshPoint(`car-trunk-interaction-${this.fuelCarIndex}`, new Vector3(12, 0.2, 11.5));
            if (!this.fenceOpened)
                return meshPoint("broken-fence-panel", new Vector3(20, 0.2, 31.5));
            return meshPoint("side-entrance-door", new Vector3(20, 0.2, 37.2));
        }
        if (objectiveId === "find-fuel")
            return meshPoint(`car-trunk-interaction-${this.fuelCarIndex}`, new Vector3(12, 0.2, 11.5));
        if (objectiveId === "cross-fence")
            return meshPoint("broken-fence-panel", new Vector3(20, 0.2, 31.5));
        if (objectiveId === "reach-side-door")
            return meshPoint("side-entrance-door", new Vector3(20, 0.2, 37.2));
        if (["search-friends", "survive-plush", "restore-power"].includes(objectiveId)) {
            const pending = [];
            if (!this.panelKeyTaken)
                pending.push(meshPoint("electrical-panel-key", new Vector3(-16, 1.2, 68.9)));
            if (!this.crankTaken)
                pending.push(meshPoint("soda-crank", new Vector3(19.7, 1.4, 71.3)));
            if (!this.cableTaken)
                pending.push(meshPoint("maintenance-heavy-crate", new Vector3(-20, 0.7, 83)));
            if (!this.fuseTaken)
                pending.push(meshPoint("fuse-locker", new Vector3(-12.7, 1.8, 87.4)));
            return nearest(pending, this.checkpoints.power);
        }
        if (objectiveId === "solve-body-puzzles")
            return this.nearestUnsolvedPuzzleCheckpoint();
        if (objectiveId === "enter-auditorium")
            return meshPoint("auditorium-door", new Vector3(0, 1.8, 137));
        if (objectiveId === "inspect-nose")
            return meshPoint("body-nose", new Vector3(0, 1, 165));
        if (objectiveId === "unlock-underground")
            return meshPoint("body-card-reader", this.checkpoints.elevator);
        return null;
    }
    getGuideRoute(objectiveId) {
        const targetByObjective = {
            "wait-friends": new Vector3(0, 0.12, 18),
            "find-entry": new Vector3(-21.55, 0.12, 25.15),
            "find-fuel": new Vector3(12, 0.12, 11.5),
            "cross-fence": new Vector3(20, 0.12, 31.5),
            "reach-side-door": new Vector3(20, 0.12, 37.2),
            "search-friends": this.checkpoints.power,
            "survive-plush": this.checkpoints.power,
            "restore-power": this.checkpoints.power,
            "solve-body-puzzles": this.nearestUnsolvedPuzzleCheckpoint(),
            "enter-auditorium": new Vector3(0, 0.12, 137),
            "defeat-body": this.checkpoints.auditorium,
            "inspect-nose": new Vector3(0, 0.12, 165),
            "unlock-underground": this.checkpoints.elevator,
            "descend": new Vector3(0, 0.12, 186)
        };
        const authoredTarget = this.guideTargetForObjective(objectiveId);
        const roomTarget = authoredTarget ?? targetByObjective[objectiveId];
        if (!roomTarget)
            return null;
        const target = authoredTarget ?? this.interaction.getGuideTarget(objectiveId, roomTarget, 28) ?? roomTarget;
        const player = this.player.collider.position;
        if (!this.enteredWonderWorld) {
            if (target.z >= 37)
                return [new Vector3(20, 0.12, 31.5), target.clone()];
            return [target.clone()];
        }
        return this.buildInteriorGuideRoute(player, target);
    }
    buildInteriorGuideRoute(player, target) {
        const route = [];
        const y = Math.max(0.12, player.y);
        const portals = [
            { bounds: [-25.2, -7.2, 54.7, 71.4], point: new Vector3(-3.65, y, 63) },
            { bounds: [7.2, 25.2, 54.5, 75.5], point: new Vector3(3.65, y, 65) },
            { bounds: [-25.8, -8.1, 76.5, 96.2], point: new Vector3(-3.65, y, 86) },
            { bounds: [-25.8, -8.1, 95.4, 109.1], point: new Vector3(-3.65, y, 102) },
            { bounds: [-25.5, -6.8, 108.5, 125.5], point: new Vector3(-3.65, y, 117) },
            { bounds: [6.8, 25.5, 108.5, 125.5], point: new Vector3(3.65, y, 117) },
            { bounds: [-25.5, -6.8, 127.5, 144.5], point: new Vector3(-3.65, y, 136) },
            { bounds: [6.8, 25.5, 127.5, 144.5], point: new Vector3(3.65, y, 136) }
        ];
        const portalFor = (point) => {
            for (const portal of portals) {
                const [minX, maxX, minZ, maxZ] = portal.bounds;
                if (point.x >= minX && point.x <= maxX && point.z >= minZ && point.z <= maxZ)
                    return portal.point.clone();
            }
            return null;
        };
        const push = (point) => {
            const previous = route[route.length - 1];
            if (!previous || Vector3.Distance(previous, point) > 0.55)
                route.push(point.clone());
        };
        // The side entrance is an L-shaped hall. A straight guide line used to cut
        // through the facade and disappear inside its walls.
        if (player.x > 11.8 && player.z < 55) {
            push(new Vector3(19.6, y, 44));
            push(new Vector3(13.8, y, 50.8));
            push(new Vector3(3.2, y, 51));
        }
        else {
            const playerPortal = portalFor(player);
            if (playerPortal) {
                push(playerPortal);
                push(new Vector3(0, y, playerPortal.z));
            }
            else if (Math.abs(player.x) > 4.1 && player.z < 61) {
                push(new Vector3(0, y, 51));
            }
        }
        const targetPortal = portalFor(target);
        if (targetPortal) {
            push(new Vector3(0, y, targetPortal.z));
            push(targetPortal);
            push(new Vector3(target.x, y, target.z));
            return route;
        }
        if (target.z >= 60 && target.z <= 186)
            push(new Vector3(0, y, target.z));
        push(new Vector3(target.x, y, target.z));
        return route;
    }
    resetEnemiesForPlayerRespawn() {
        this.plushEnemies.forEach((enemy) => enemy.resetForPlayerRespawn());
    }
    getOpenedLootContainers() {
        return [...this.openedLootContainers];
    }
    getLootedContainers() {
        return [...this.lootedContainers];
    }
    getActivatedCheckpoints() {
        return [...this.activatedCheckpoints];
    }
    restoreProgress(inventoryIds, solvedPuzzles, powerRestored, checkpoint = "", openedContainers = [], lootedContainers = [], activatedCheckpoints = []) {
        this.inventory.restore(inventoryIds, ITEM_CATALOG);
        this.powerRestored = powerRestored;
        this.solvedPuzzles = new Set(solvedPuzzles);
        this.openedLootContainers.clear();
        openedContainers.forEach((id) => this.openedLootContainers.add(id));
        this.lootedContainers.clear();
        lootedContainers.forEach((id) => this.lootedContainers.add(id));
        this.activatedCheckpoints.clear();
        activatedCheckpoints.forEach((id) => this.activatedCheckpoints.add(id));
        const interiorCheckpoint = checkpoint === "chapter1-entry"
            || checkpoint === "electrical-restored"
            || checkpoint === "body-puzzles"
            || checkpoint === "body-card"
            || checkpoint === "body-defeated"
            || checkpoint === "chapter2-transition"
            || checkpoint.startsWith("body-phase-");
        this.enteredWonderWorld =
            interiorCheckpoint
                || powerRestored
                || solvedPuzzles.length > 0
                || inventoryIds.some((id) => ["panelKey", "fuse", "cable", "crank", "bodyCard", "bandage"].includes(id));
        this.fenceOpened = this.enteredWonderWorld;
        this.sideDoorOpened = this.enteredWonderWorld;
        // The entrance closes behind the player; unlocked state and physical open
        // state are separate so continuing a save never leaves a wall-sized gap.
        this.sideDoor.position.set(20, 2.25, 37.75);
        this.sideDoor.checkCollisions = true;
        this.setDoorwayBlocked(this.sideDoorBlocker, true);
        this.torchTaken = inventoryIds.includes("torch");
        this.fuelTaken = inventoryIds.includes("fuel");
        this.scene.getMeshByName("fuel-canister")?.setEnabled(false);
        this.scene.getMeshByName("fuel-canister-cap")?.setEnabled(false);
        this.scene.getMeshByName("fuel-canister-handle")?.setEnabled(false);
        this.panelKeyTaken = inventoryIds.includes("panelKey");
        this.keyTaken = this.panelKeyTaken;
        this.fuseTaken = inventoryIds.includes("fuse");
        this.cableTaken = inventoryIds.includes("cable");
        this.crankTaken = inventoryIds.includes("crank");
        this.bandageTaken = inventoryIds.includes("bandage");
        for (const [id, rig] of this.lootContainerRigs) {
            const opened = this.openedLootContainers.has(id);
            const looted = this.lootedContainers.has(id);
            rig.hinge.rotation.copyFrom(opened ? rig.openRotation : Vector3.Zero());
            rig.door.checkCollisions = !opened;
            rig.contents.forEach((mesh) => mesh.setEnabled(opened && !looted));
        }
        this.scene.getMeshByName("improvised-torch-pickup")?.setEnabled(!this.torchTaken);
        this.scene.getMeshByName("electrical-panel-key")?.setEnabled(!this.panelKeyTaken);
        this.scene.getMeshByName("soda-crank")?.setEnabled(!this.crankTaken);
        this.scene.getMeshByName("maintenance-bandage")?.setEnabled(!this.bandageTaken);
        const postBoss = inventoryIds.includes("bodyCard") || checkpoint === "body-defeated" || checkpoint === "body-card" || checkpoint === "chapter2-transition";
        this.bodyDefeated = postBoss;
        this.auditoriumTriggerUsed = postBoss;
        if (powerRestored)
            this.enableFacilityLights(true);
        if (this.solvedPuzzles.size >= 4)
            this.openAuditorium();
    }
    resetNearestPuzzle() {
        const position = this.player.collider.position;
        const choices = ["hands", "eyes", "heart", "feet"];
        let nearest = choices[0];
        let nearestDistance = Infinity;
        for (const id of choices) {
            const distance = Vector3.Distance(position, this.checkpoints[id]);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = id;
            }
        }
        this.solvedPuzzles.delete(nearest);
        if (nearest === "hands")
            this.handsAngles = [0, 0, 0, 0];
        if (nearest === "eyes")
            this.eyesAngles = [0, 0, 0];
        if (nearest === "heart") {
            this.heartValves = [0, 0, 0];
            this.heartPulses = [];
        }
        if (nearest === "feet")
            this.feetProgress = 0;
        this.ui.toast(`Puzzle ${nearest.toUpperCase()} reiniciado.`);
    }
    damageArenaCover(severity) {
        const candidates = this.coverSeats.filter((seat) => (this.coverSeatDamage.get(seat.uniqueId) ?? 0) < 3);
        const impacts = Math.max(1, Math.min(3, Math.round(severity)));
        for (let index = 0; index < impacts && candidates.length > 0; index += 1) {
            const selection = Math.floor(Math.random() * candidates.length);
            const seat = candidates.splice(selection, 1)[0];
            const damage = (this.coverSeatDamage.get(seat.uniqueId) ?? 0) + 1;
            this.coverSeatDamage.set(seat.uniqueId, damage);
            seat.rotation.z += (Math.random() - 0.5) * 0.32;
            seat.rotation.x += (Math.random() - 0.5) * 0.18;
            seat.scaling.y = Math.max(0.28, 1 - damage * 0.23);
            seat.position.y = Math.max(0.28, 0.78 - damage * 0.14);
            if (damage >= 3) {
                seat.checkCollisions = false;
                seat.material = this.materials.get("burned", seat.uniqueId);
                this.fire.igniteMesh(seat);
            }
        }
        if (severity >= 3 && this.stageCurtains.length > 0) {
            const curtain = this.stageCurtains[Math.floor(Math.random() * this.stageCurtains.length)];
            this.fire.igniteMesh(curtain);
            this.ui.showSoundCaption("tecido pesado rasga e começa a queimar");
        }
    }
    revealBodyCard(nose) {
        this.bodyDefeated = true;
        this.bodyCardMesh = MeshBuilder.CreateBox("body-card", { width: 0.75, height: 0.08, depth: 1.05 }, this.scene);
        this.bodyCardMesh.position = nose.position.add(new Vector3(0.2, 0.3, 0));
        this.bodyCardMesh.material = this.materials.solid("body-card-red", new Color3(0.45, 0.035, 0.025), 0.55, 0.12);
        const hole = MeshBuilder.CreateCylinder("card-hole", { height: 0.09, diameter: 0.14, tessellation: 12 }, this.scene);
        hole.parent = this.bodyCardMesh;
        hole.position = new Vector3(0.22, 0, 0.36);
        hole.material = this.materials.solid("card-hole-dark", new Color3(0.02, 0.02, 0.02), 1);
        this.interaction.register(this.bodyCardMesh, {
            prompt: "[E] INSPECIONAR O NARIZ E RETIRAR O CARTÃO",
            maxDistance: 3,
            onInteract: () => {
                if (this.inventory.add(ITEM_CATALOG.bodyCard)) {
                    this.audio.pickup();
                    this.ui.showDocument("CARTÃO DO CORPO", "Um cartão perfurado vermelho.\n\nNo verso, uma frase foi escrita à mão:\n\n‘Você não se lembra porque eles tiraram isso de você.’", () => {
                        this.objective.set("unlock-underground", "USE O CARTÃO DO CORPO NA PASSAGEM SUBTERRÂNEA.");
                        this.callbacks.onBodyCardObtained();
                    });
                }
                this.bodyCardMesh?.setEnabled(false);
            }
        });
    }
    createExterior() {
        // Use a thick, fully opaque StandardMaterial slab here. Some WebGL drivers
        // treated the old large PBR floor as partially transparent after context
        // recovery, exposing the void below the parking lot.
        const parkingMaterial = new StandardMaterial("parking-ground-opaque-material", this.scene);
        parkingMaterial.diffuseColor = new Color3(0.18, 0.19, 0.19);
        parkingMaterial.ambientColor = new Color3(0.08, 0.085, 0.09);
        parkingMaterial.specularColor = new Color3(0.025, 0.025, 0.025);
        parkingMaterial.alpha = 1;
        parkingMaterial.backFaceCulling = false;
        const ground = MeshBuilder.CreateBox("parking-ground", { width: 100, height: 0.5, depth: 80 }, this.scene);
        ground.position = new Vector3(0, -0.25, 16);
        ground.material = parkingMaterial;
        ground.checkCollisions = true;
        ground.receiveShadows = true;
        ground.metadata = { ...(ground.metadata ?? {}), interactionPassthrough: true };
        const foundation = MeshBuilder.CreateBox("parking-foundation", { width: 102, height: 1.2, depth: 82 }, this.scene);
        foundation.position = new Vector3(0, -1.05, 16);
        foundation.material = parkingMaterial;
        foundation.checkCollisions = true;
        foundation.isPickable = false;
        foundation.metadata = { ...(foundation.metadata ?? {}), interactionPassthrough: true };
        for (let i = -7; i <= 7; i += 1) {
            const line = MeshBuilder.CreateBox(`parking-line-${i}`, { width: 0.13, height: 0.018, depth: 12 }, this.scene);
            line.position = new Vector3(i * 5.8, 0.018, 10);
            line.material = this.materials.solid("faded-parking-paint", new Color3(0.47, 0.43, 0.31), 0.9);
            line.isPickable = false;
            line.metadata = { interactionPassthrough: true };
        }
        this.createBuildingFacade();
        this.createFence();
        this.createCars();
        this.createMaintenanceShed();
        this.createDrainage();
        this.createExteriorProps();
        this.createNewspaper();
        this.createTorchPickup();
    }
    createGlobalMapBoundaries() {
        // Every chapter occupies a different section of one continuous Z-axis map.
        // Four invisible collision walls enclose the complete campaign without
        // blocking chapter transitions between those sections.
        const centerZ = 1048;
        const totalDepth = 2160;
        const totalWidth = 100;
        const wallHeight = 36;
        const thickness = 4;
        const createBoundary = (name, position, width, depth) => {
            const wall = MeshBuilder.CreateBox(name, { width, height: wallHeight, depth }, this.scene);
            wall.position = position;
            // Keep the collider active in Babylon's active-mesh list while rendering it
            // fully invisible. Some drivers skip collision candidates with isVisible=false.
            wall.isVisible = true;
            wall.visibility = 0;
            wall.isPickable = false;
            wall.checkCollisions = true;
            wall.alwaysSelectAsActiveMesh = true;
            wall.metadata = { mapBoundary: true };
        };
        createBoundary("map-boundary-left", new Vector3(-51, wallHeight / 2 - 2, centerZ), thickness, totalDepth);
        createBoundary("map-boundary-right", new Vector3(51, wallHeight / 2 - 2, centerZ), thickness, totalDepth);
        createBoundary("map-boundary-front", new Vector3(0, wallHeight / 2 - 2, -34), totalWidth + thickness * 2, thickness);
        createBoundary("map-boundary-back", new Vector3(0, wallHeight / 2 - 2, 2130), totalWidth + thickness * 2, thickness);
    }
    createBuildingFacade() {
        const facade = MeshBuilder.CreateBox("Wonder-World-facade", { width: 52, height: 14, depth: 2 }, this.scene);
        facade.position = new Vector3(0, 7, 39);
        facade.material = this.materials.get("concrete", 0);
        facade.checkCollisions = false;
        const facadeLeftCollider = MeshBuilder.CreateBox("facade-collider-left", { width: 44.4, height: 14, depth: 1.8 }, this.scene);
        facadeLeftCollider.position = new Vector3(-3.8, 7, 39);
        facadeLeftCollider.isVisible = false;
        facadeLeftCollider.checkCollisions = true;
        const facadeRightCollider = MeshBuilder.CreateBox("facade-collider-right", { width: 4.4, height: 14, depth: 1.8 }, this.scene);
        facadeRightCollider.position = new Vector3(23.8, 7, 39);
        facadeRightCollider.isVisible = false;
        facadeRightCollider.checkCollisions = true;
        const marquee = MeshBuilder.CreateBox("entrance-marquee", { width: 26, height: 1.2, depth: 4 }, this.scene);
        marquee.position = new Vector3(0, 6.6, 36.5);
        marquee.material = this.materials.get("metal", 0);
        marquee.checkCollisions = true;
        this.createTextSign("wonder-world-sign", "WONDER WORLD", new Vector3(0, 9.8, 37.92), 16, 2.8, new Color3(0.6, 0.12, 0.07));
        for (let x = -20; x <= 20; x += 8) {
            const window = MeshBuilder.CreatePlane(`facade-window-${x}`, { width: 4, height: 3 }, this.scene);
            window.position = new Vector3(x, 8.4, 37.94);
            window.rotation.y = Math.PI;
            window.material = this.materials.get("glass", Math.abs(x));
        }
        this.sideDoor = MeshBuilder.CreateBox("side-entrance-door", { width: 3.2, height: 4.5, depth: 0.28 }, this.scene);
        this.sideDoor.position = new Vector3(20, 2.25, 37.75);
        this.sideDoor.material = this.materials.get("metal", 1);
        this.sideDoor.checkCollisions = true;
        this.sideDoorBlocker = this.createDoorFrame("side-entrance", this.sideDoor.position.clone(), 3.2, 4.5, 0.28, 0, true, 3.2, 4.8);
        const sideDoorHandle = MeshBuilder.CreateBox("side-entrance-door-handle", { width: 0.16, height: 0.42, depth: 0.12 }, this.scene);
        sideDoorHandle.parent = this.sideDoor;
        sideDoorHandle.position = new Vector3(-1.05, 0, -0.18);
        sideDoorHandle.material = this.materials.solid("side-door-handle-brass", new Color3(0.42, 0.28, 0.09), 0.38, 0.45);
        sideDoorHandle.isPickable = true;
        this.interaction.register(this.sideDoor, {
            prompt: () => this.sideDoorOpened
                ? "[E] ENTRAR NO WONDER WORLD"
                : this.fenceOpened
                    ? "[E] FORÇAR A ENTRADA LATERAL"
                    : "A CERCA BLOQUEIA O CAMINHO",
            enabled: () => !this.enteredWonderWorld,
            maxDistance: 5.4,
            ignoreLineOfSight: true,
            onInteract: () => {
                if (!this.fenceOpened) {
                    this.ui.toast("A seção danificada da cerca ainda bloqueia o caminho.");
                    return;
                }
                if (!this.inventory.has("torch")) {
                    this.ui.toast("Você precisa encontrar uma tocha antes de examinar a trava.");
                    return;
                }
                if (!this.inventory.has("fuel") || !this.fire.torchLit) {
                    this.ui.toast("Abasteça a tocha e acenda-a com [F] para enxergar a trava.");
                    return;
                }
                if (!this.sideDoorOpened) {
                    this.sideDoorOpened = true;
                    this.sideDoor.checkCollisions = false;
                    this.sideDoor.position.y = 7.15;
                    this.setDoorwayBlocked(this.sideDoorBlocker, false);
                    this.audio.impact(0.9);
                }
                // Keep the transition outside the opening branch. This repairs old saves
                // where the door was marked open but the player had never been transported.
                this.callbacks.onEnteredWonderWorld();
            }
        });
    }
    createDoorFrame(name, position, width, height, depth, rotationY = 0, visualRecess = false, openingSpan = width, wallHeight = height + 0.5) {
        const root = new TransformNode(`${name}-door-frame-root`, this.scene);
        root.position.copyFrom(position);
        root.rotation.y = rotationY;
        const frameMaterial = this.materials.get("metal", name.length + 7);
        const recessMaterial = this.materials.solid(`${name}-door-recess-material`, new Color3(0.018, 0.02, 0.022), 1);
        const make = (part, size, local, collisions = true) => {
            const mesh = MeshBuilder.CreateBox(`${name}-door-frame-${part}`, size, this.scene);
            mesh.parent = root;
            mesh.position.copyFrom(local);
            mesh.material = frameMaterial;
            mesh.checkCollisions = collisions;
            mesh.isPickable = false;
            mesh.metadata = { doorFrame: true, interactionPassthrough: true };
            return mesh;
        };
        const jamb = 0.28;
        const frameDepth = Math.max(0.42, depth + 0.2);
        make("left", { width: jamb, height: height + 0.42, depth: frameDepth }, new Vector3(-width / 2 - jamb / 2, 0.02, 0));
        make("right", { width: jamb, height: height + 0.42, depth: frameDepth }, new Vector3(width / 2 + jamb / 2, 0.02, 0));
        make("lintel", { width: width + jamb * 2, height: 0.3, depth: frameDepth }, new Vector3(0, height / 2 + 0.15, 0));
        make("threshold", { width: width + jamb * 2, height: 0.1, depth: frameDepth }, new Vector3(0, -height / 2 + 0.05, 0), false);
        const wingWidth = Math.max(0, (openingSpan - width - jamb * 2) / 2);
        const wallCenterY = wallHeight / 2 - position.y;
        if (wingWidth > 0.03) {
            make("wall-infill-left", { width: wingWidth, height: wallHeight, depth: frameDepth }, new Vector3(-width / 2 - jamb - wingWidth / 2, wallCenterY, 0));
            make("wall-infill-right", { width: wingWidth, height: wallHeight, depth: frameDepth }, new Vector3(width / 2 + jamb + wingWidth / 2, wallCenterY, 0));
        }
        const upperHeight = Math.max(0, wallHeight - (position.y + height / 2));
        if (upperHeight > 0.08)
            make("wall-infill-upper", { width: Math.max(openingSpan, width + jamb * 2), height: upperHeight, depth: frameDepth }, new Vector3(0, height / 2 + upperHeight / 2, 0));
        if (visualRecess) {
            const recess = MeshBuilder.CreateBox(`${name}-door-dark-recess`, { width: width - 0.12, height: height - 0.12, depth: 0.05 }, this.scene);
            recess.parent = root;
            recess.position = new Vector3(0, 0, depth * 0.75);
            recess.material = recessMaterial;
            recess.checkCollisions = false;
            recess.isPickable = false;
            recess.metadata = { interactionPassthrough: true, doorRecess: true };
        }
        const blocker = MeshBuilder.CreateBox(`${name}-doorway-blocker`, { width: Math.max(openingSpan, width + 0.72), height: Math.max(height, wallHeight), depth: Math.max(1.05, depth + 0.65) }, this.scene);
        blocker.position.y = wallCenterY;
        blocker.parent = root;
        blocker.visibility = 0;
        blocker.isPickable = false;
        blocker.checkCollisions = true;
        blocker.metadata = { doorwayBlocker: true, interactionPassthrough: true };
        return blocker;
    }
    setDoorwayBlocked(blocker, blocked) {
        if (!blocker)
            return;
        blocker.setEnabled(blocked);
        blocker.checkCollisions = blocked;
    }
    closeSideEntranceBehindPlayer() {
        this.sideDoor.position.set(20, 2.25, 37.75);
        this.sideDoor.checkCollisions = true;
        this.setDoorwayBlocked(this.sideDoorBlocker, true);
    }
    createFence() {
        const root = new TransformNode("security-fence", this.scene);
        const fenceMinX = -49;
        const fenceMaxX = 49;
        const openingMinX = 17.15;
        const openingMaxX = 22.85;
        const fenceZ = 31.5;
        // The fence now reaches both map boundaries. Previously it stopped at x = ±30,
        // leaving large open gaps on each side of the parking lot.
        for (let x = fenceMinX; x <= fenceMaxX + 0.01; x += 1.5) {
            if (x > openingMinX && x < openingMaxX)
                continue;
            const post = MeshBuilder.CreateCylinder(`fence-post-${x.toFixed(2)}`, { height: 4.5, diameter: 0.09, tessellation: 6 }, this.scene);
            post.parent = root;
            post.position = new Vector3(x, 2.25, fenceZ);
            post.material = this.materials.get("metal", 0);
            post.checkCollisions = true;
        }
        // Strong terminal posts visually and physically seal the ends against the
        // invisible map boundaries, so the player cannot walk around the fence.
        for (const [name, x] of [["left", fenceMinX], ["right", fenceMaxX]]) {
            const anchor = MeshBuilder.CreateCylinder(`fence-terminal-${name}`, { height: 5, diameter: 0.24, tessellation: 8 }, this.scene);
            anchor.parent = root;
            anchor.position = new Vector3(x, 2.5, fenceZ);
            anchor.material = this.materials.get("metal", 1);
            anchor.checkCollisions = true;
        }
        // Keep the damaged section physically open while extending the remaining
        // chain-link rails from one map edge to the other.
        const fenceSegments = [
            { id: "left", minX: fenceMinX, maxX: openingMinX },
            { id: "right", minX: openingMaxX, maxX: fenceMaxX }
        ].map((segment) => ({
            ...segment,
            centerX: (segment.minX + segment.maxX) / 2,
            width: segment.maxX - segment.minX
        }));
        for (let y = 0.4; y < 4.3; y += 0.35) {
            for (const segment of fenceSegments) {
                const rail = MeshBuilder.CreateBox(`fence-wire-${segment.id}-${y.toFixed(2)}`, { width: segment.width, height: 0.025, depth: 0.035 }, this.scene);
                rail.parent = root;
                rail.position = new Vector3(segment.centerX, y, fenceZ);
                rail.material = this.materials.get("metal", 0);
                rail.checkCollisions = true;
            }
        }
        const topRailSegments = fenceSegments;
        for (const segment of topRailSegments) {
            const topRail = MeshBuilder.CreateBox(`fence-top-rail-${segment.id}`, { width: segment.width, height: 0.09, depth: 0.09 }, this.scene);
            topRail.parent = root;
            topRail.position = new Vector3(segment.centerX, 4.42, fenceZ);
            topRail.material = this.materials.get("metal", 1);
            topRail.checkCollisions = true;
        }
        const brokenPanel = MeshBuilder.CreateBox("broken-fence-panel", { width: 5.5, height: 3.6, depth: 0.18 }, this.scene);
        brokenPanel.position = new Vector3(20, 1.8, 31.5);
        brokenPanel.rotation.z = -0.13;
        brokenPanel.material = this.materials.get("metal", 0);
        brokenPanel.checkCollisions = true;
        this.interaction.register(brokenPanel, {
            prompt: () => this.inventory.has("torch") && this.inventory.has("fuel") ? "[E] LEVANTAR A SEÇÃO DANIFICADA" : "A ESTRUTURA ESTÁ PRESA E É DIFÍCIL ENXERGAR",
            onInteract: () => {
                if (!this.inventory.has("torch") || !this.inventory.has("fuel")) {
                    this.ui.toast("Encontre luz e combustível antes de atravessar.");
                    return;
                }
                if (!this.fire.torchLit) {
                    this.ui.toast("Acenda a tocha com [F].");
                    return;
                }
                if (!this.fenceOpened) {
                    this.fenceOpened = true;
                    brokenPanel.rotation.z = -1.32;
                    brokenPanel.position.y = 3.4;
                    brokenPanel.checkCollisions = false;
                    this.audio.impact(0.75);
                    this.objective.set("reach-side-door", "ALCANCE A ENTRADA LATERAL.");
                }
            }
        });
    }
    flashRandomCarHeadlights(durationMs = 1800) {
        if (this.carHeadlightSets.length === 0)
            return;
        const token = ++this.carHeadlightFlashToken;
        const selected = this.carHeadlightSets[Math.floor(Math.random() * this.carHeadlightSets.length)];
        const setEnabled = (enabled) => {
            selected.material.emissiveColor = enabled
                ? new Color3(1, 0.72, 0.32)
                : new Color3(0.015, 0.012, 0.008);
            selected.material.emissiveIntensity = enabled ? 3.8 : 0.05;
            selected.lights.forEach((light) => {
                light.intensity = enabled ? 28 : 0;
            });
        };
        this.carHeadlightSets.forEach((set) => {
            set.material.emissiveColor = new Color3(0.015, 0.012, 0.008);
            set.material.emissiveIntensity = 0.05;
            set.lights.forEach((light) => { light.intensity = 0; });
        });
        setEnabled(true);
        window.setTimeout(() => {
            if (token !== this.carHeadlightFlashToken)
                return;
            setEnabled(false);
        }, 120);
        window.setTimeout(() => {
            if (token !== this.carHeadlightFlashToken)
                return;
            setEnabled(true);
        }, 230);
        window.setTimeout(() => {
            if (token !== this.carHeadlightFlashToken)
                return;
            setEnabled(false);
        }, Math.max(520, durationMs));
    }
    createCars() {
        const positions = [new Vector3(-18, 0, 8), new Vector3(-5, 0, 17), new Vector3(12, 0, 8), new Vector3(22, 0, 19)];
        const emptyTrunkDescriptions = [
            "Há apenas um pneu murcho, jornais apodrecidos e um cheiro forte de mofo.",
            "O forro foi rasgado. Restaram ferramentas enferrujadas que não servem para nada.",
            "Cobertores úmidos e brinquedos quebrados ocupam o fundo do porta-malas.",
            "Caixas vazias deslizam pelo metal. Nada aqui pode ajudar você."
        ];
        positions.forEach((position, index) => {
            const root = new TransformNode(`car-${index}`, this.scene);
            root.position.copyFrom(position);
            root.rotation.y = index % 2 ? 0.12 : -0.08;
            // Build the car body from separate panels. A single solid box previously
            // occupied the entire trunk volume, so opening the lid revealed solid metal.
            const carPaint = this.materials.get("metal", index);
            const trunkLining = this.materials.solid(`car-trunk-lining-${index}`, new Color3(0.035, 0.038, 0.04), 0.96);
            const bodyParts = [];
            const addBodyPart = (name, size, position, material = carPaint) => {
                const part = MeshBuilder.CreateBox(`${name}-${index}`, size, this.scene);
                part.parent = root;
                part.position.copyFrom(position);
                part.material = material;
                part.checkCollisions = true;
                bodyParts.push(part);
                return part;
            };
            addBodyPart("car-front-body", { width: 3.7, height: 1.1, depth: 4.55 }, new Vector3(0, 0.9, -1.28));
            addBodyPart("car-rear-sill-left", { width: 0.42, height: 1.05, depth: 2.45 }, new Vector3(-1.64, 0.88, 2.35));
            addBodyPart("car-rear-sill-right", { width: 0.42, height: 1.05, depth: 2.45 }, new Vector3(1.64, 0.88, 2.35));
            addBodyPart("car-trunk-floor", { width: 3.0, height: 0.16, depth: 2.45 }, new Vector3(0, 0.43, 2.35), trunkLining);
            addBodyPart("car-trunk-back", { width: 3.0, height: 1.05, depth: 0.18 }, new Vector3(0, 0.92, 3.52), trunkLining);
            addBodyPart("car-trunk-front-wall", { width: 3.0, height: 0.86, depth: 0.18 }, new Vector3(0, 0.88, 1.16), trunkLining);
            const cabin = MeshBuilder.CreateBox(`car-cabin-${index}`, { width: 3.25, height: 1.45, depth: 3.4 }, this.scene);
            cabin.parent = root;
            cabin.position = new Vector3(0, 1.95, -0.2);
            cabin.scaling.x = 0.9;
            cabin.material = this.materials.get("glass", index);
            cabin.checkCollisions = true;
            for (const side of [-1, 1]) {
                for (const z of [-2.35, 2.35]) {
                    const wheel = MeshBuilder.CreateCylinder(`car-wheel-${index}-${side}-${z}`, { height: 0.38, diameter: 0.82, tessellation: 12 }, this.scene);
                    wheel.parent = root;
                    wheel.position = new Vector3(side * 1.82, 0.55, z);
                    wheel.rotation.z = Math.PI / 2;
                    wheel.material = this.materials.solid("rubber", new Color3(0.025, 0.025, 0.024), 0.95);
                }
            }
            const headlightMaterial = this.materials
                .solid(`car-headlight-glass-${index}`, new Color3(0.22, 0.2, 0.14), 0.18, 0.08)
                .clone(`car-headlight-material-${index}`);
            headlightMaterial.emissiveColor = new Color3(0.015, 0.012, 0.008);
            headlightMaterial.emissiveIntensity = 0.05;
            const bulbs = [];
            const lights = [];
            for (const side of [-1, 1]) {
                const bulb = MeshBuilder.CreateSphere(`car-headlight-bulb-${index}-${side}`, { diameter: 0.52, segments: 12 }, this.scene);
                bulb.parent = root;
                bulb.position = new Vector3(side * 1.08, 1.02, -3.62);
                bulb.scaling = new Vector3(1, 0.7, 0.28);
                bulb.material = headlightMaterial;
                bulb.isPickable = false;
                bulbs.push(bulb);
                const light = new SpotLight(`car-headlight-beam-${index}-${side}`, new Vector3(side * 1.08, 1.02, -3.76), new Vector3(0, -0.07, -1), Math.PI / 3.3, 18, this.scene);
                light.parent = root;
                light.diffuse = new Color3(1, 0.78, 0.46);
                light.specular = new Color3(1, 0.72, 0.38);
                light.range = 26;
                light.intensity = 0;
                lights.push(light);
            }
            this.carHeadlightSets.push({ bulbs, lights, material: headlightMaterial });
            // Every vehicle has a real, visible trunk lid and a generous invisible
            // interaction volume behind the car. The large hotspot prevents the
            // player from having to aim at the thin lid mesh.
            const trunk = MeshBuilder.CreateBox(`car-trunk-lid-${index}`, { width: 3.35, height: 0.18, depth: 1.5 }, this.scene);
            trunk.parent = root;
            trunk.position = new Vector3(0, 1.55, 2.7);
            trunk.material = this.materials.get("metal", index);
            trunk.checkCollisions = false;
            const trunkHandle = MeshBuilder.CreateBox(`car-trunk-handle-${index}`, { width: 0.72, height: 0.12, depth: 0.16 }, this.scene);
            trunkHandle.parent = root;
            trunkHandle.position = new Vector3(0, 1.47, 3.47);
            trunkHandle.material = this.materials.solid(`car-trunk-handle-material-${index}`, new Color3(0.045, 0.045, 0.043), 0.65);
            trunkHandle.isPickable = false;
            const interactionZone = MeshBuilder.CreateBox(`car-trunk-interaction-${index}`, { width: 4.2, height: 2.6, depth: 2.8 }, this.scene);
            interactionZone.parent = root;
            interactionZone.position = new Vector3(0, 1.25, 3.45);
            interactionZone.visibility = 0;
            interactionZone.checkCollisions = false;
            interactionZone.metadata = { interactionHotspot: true };
            const fuelParts = [];
            if (index === this.fuelCarIndex) {
                const can = MeshBuilder.CreateBox("fuel-canister", { width: 0.78, height: 1.05, depth: 0.48 }, this.scene);
                can.parent = root;
                can.position = new Vector3(0.55, 0.98, 2.55);
                can.rotation.y = -0.18;
                can.material = this.materials.solid("fuel-canister-material", new Color3(0.23, 0.045, 0.025), 0.72, 0.12);
                can.checkCollisions = false;
                can.isPickable = false;
                fuelParts.push(can);
                const cap = MeshBuilder.CreateCylinder("fuel-canister-cap", { height: 0.16, diameter: 0.24, tessellation: 12 }, this.scene);
                cap.parent = root;
                cap.position = new Vector3(0.72, 1.57, 2.52);
                cap.material = this.materials.solid("fuel-canister-cap-material", new Color3(0.04, 0.04, 0.038), 0.88);
                cap.checkCollisions = false;
                cap.isPickable = false;
                fuelParts.push(cap);
                const handle = MeshBuilder.CreateBox("fuel-canister-handle", { width: 0.42, height: 0.12, depth: 0.12 }, this.scene);
                handle.parent = root;
                handle.position = new Vector3(0.39, 1.52, 2.55);
                handle.material = this.materials.solid("fuel-canister-handle-material", new Color3(0.12, 0.025, 0.018), 0.78);
                handle.checkCollisions = false;
                handle.isPickable = false;
                fuelParts.push(handle);
                fuelParts.forEach((part) => part.setEnabled(false));
            }
            const showTrunkText = (title, bodyText) => {
                this.ui.showDocument(title, `${bodyText}

Pressione E novamente ou Esc para fechar.`);
            };
            this.interaction.register(interactionZone, {
                prompt: () => {
                    if (!this.openedCarTrunks.has(index))
                        return "[E] ABRIR O PORTA-MALAS";
                    if (index === this.fuelCarIndex && !this.fuelTaken)
                        return "[E] PEGAR O COMBUSTÍVEL";
                    return "[E] EXAMINAR O PORTA-MALAS";
                },
                maxDistance: 5.4,
                priority: -1,
                ignoreLineOfSight: true,
                onInteract: () => {
                    if (!this.openedCarTrunks.has(index)) {
                        this.openedCarTrunks.add(index);
                        trunk.rotation.x = -1.18;
                        trunk.position.y += 0.82;
                        trunk.position.z -= 0.18;
                        trunkHandle.rotation.x = -1.18;
                        trunkHandle.position.y += 0.82;
                        trunkHandle.position.z -= 0.18;
                        this.audio.impact(0.45);
                        if (index === this.fuelCarIndex && !this.fuelTaken) {
                            fuelParts.forEach((part) => part.setEnabled(true));
                            showTrunkText("PORTA-MALAS", "Um galão de combustível está preso entre os objetos no fundo.");
                        }
                        else {
                            showTrunkText("PORTA-MALAS", emptyTrunkDescriptions[index] ?? "Não há nada útil aqui.");
                        }
                        return;
                    }
                    if (index === this.fuelCarIndex && !this.fuelTaken) {
                        this.fuelTaken = true;
                        fuelParts.forEach((part) => part.setEnabled(false));
                        this.inventory.add(ITEM_CATALOG.fuel);
                        this.fire.addFuel(72);
                        this.audio.pickup();
                        showTrunkText("COMBUSTÍVEL ENCONTRADO", "Você retirou o galão. O combustível foi adicionado à tocha.");
                        this.objective.set("cross-fence", "ATRAVESSE A SEÇÃO DANIFICADA DA CERCA.");
                        return;
                    }
                    const alreadyEmpty = index === this.fuelCarIndex && this.fuelTaken;
                    showTrunkText("PORTA-MALAS", alreadyEmpty ? "Só restaram marcas do galão e o cheiro de gasolina." : (emptyTrunkDescriptions[index] ?? "Não há nada útil aqui."));
                }
            });
        });
    }
    createMaintenanceShed() {
        this.createRoomShell("exterior-shed", new Vector3(-27, 0, 25), 9, 8, 4, "metal", true, ["east"]);
        const openDoor = MeshBuilder.CreateBox("shed-door-open", { width: 2.4, height: 3.3, depth: 0.2 }, this.scene);
        openDoor.position = new Vector3(-22.55, 1.65, 25);
        openDoor.rotation.y = -0.8;
        openDoor.material = this.materials.get("metal", 1);
    }
    createDrainage() {
        for (let x = -45; x < 45; x += 3) {
            const grate = MeshBuilder.CreateBox(`drain-${x}`, { width: 2.4, height: 0.04, depth: 0.8 }, this.scene);
            grate.position = new Vector3(x, 0.035, 28);
            grate.material = this.materials.get("metal", 0);
            grate.isPickable = false;
            grate.metadata = { interactionPassthrough: true };
        }
        // The wet patch is opaque and glossy instead of alpha-blended. This keeps the
        // asphalt visible on every GPU while preserving the rain-soaked look.
        const puddle = MeshBuilder.CreateBox("rain-puddle", { width: 16, height: 0.025, depth: 8 }, this.scene);
        puddle.position = new Vector3(7, 0.018, 15);
        puddle.material = this.materials.solid("rain-puddle-opaque", new Color3(0.055, 0.07, 0.075), 0.18, 0.04);
        puddle.isPickable = false;
        puddle.metadata = { interactionPassthrough: true };
    }
    createExteriorProps() {
        for (let i = 0; i < 16; i += 1) {
            const trash = MeshBuilder.CreateBox(`trash-${i}`, { width: 0.3 + Math.random() * 0.8, height: 0.04, depth: 0.25 + Math.random() * 0.7 }, this.scene);
            trash.position = new Vector3(-27 + Math.random() * 54, 0.04, 2 + Math.random() * 26);
            trash.rotation.y = Math.random() * Math.PI;
            trash.material = i % 3 === 0 ? this.materials.get("plastic", i) : this.materials.get("wood", i);
        }
        const toy = this.createSmallPlush("observing-toy", new Vector3(8, 0, 25), 0.45, 1);
        let moved = false;
        window.setInterval(() => {
            if (!this.enteredWonderWorld && !moved && Vector3.Distance(this.player.collider.position, toy.getAbsolutePosition()) < 8) {
                const toToy = toy.getAbsolutePosition().subtract(this.player.collider.position).normalize();
                if (Vector3.Dot(this.player.forward(), toToy) < 0.2) {
                    toy.position.x += 2.8;
                    toy.rotation.y += Math.PI;
                    moved = true;
                }
            }
        }, 300);
    }
    createNewspaper() {
        const paper = MeshBuilder.CreateBox("closure-newspaper", { width: 1.05, height: 0.03, depth: 1.45 }, this.scene);
        paper.position = new Vector3(-8, 0.06, 12);
        paper.rotation.y = 0.37;
        paper.material = this.materials.solid("newsprint", new Color3(0.67, 0.63, 0.52), 0.96);
        this.interaction.register(paper, {
            prompt: "[E] LER O JORNAL MOLHADO",
            onInteract: () => {
                this.ui.showDocument("THE HAWTHORNE GAZETTE · 18 DE ABRIL DE 1964", "WONDER WORLD ENCERRA ATIVIDADES APÓS ‘FALHA TÉCNICA’\n\nO complexo familiar Wonder World encerrou suas operações sem aviso prévio. Funcionários foram instruídos a deixar o local e se recusaram a responder perguntas.\n\nMoradores relatam luzes acesas durante a madrugada e caminhões entrando pela área de manutenção. A direção afirma que todos os brinquedos foram removidos.\n\nUma mãe, que pediu anonimato, disse: ‘Meu filho voltou diferente. Ele não lembra do passeio, mas desenha aquele palhaço todas as noites.’");
            }
        });
    }
    createTorchPickup() {
        const torch = MeshBuilder.CreateCylinder("improvised-torch-pickup", { height: 1.05, diameter: 0.1, tessellation: 8 }, this.scene);
        // Place it near the open side of the maintenance shed instead of behind its
        // wall collider, where the interaction ray could never reach it reliably.
        torch.position = new Vector3(-21.55, 0.72, 25.15);
        torch.rotation.z = 0.36;
        torch.rotation.y = -0.24;
        torch.material = this.materials.get("wood", 0);
        const cloth = MeshBuilder.CreateCylinder("torch-cloth", { height: 0.3, diameter: 0.2, tessellation: 8 }, this.scene);
        cloth.parent = torch;
        cloth.position.y = 0.44;
        cloth.material = this.materials.solid("torch-cloth-visible", new Color3(0.34, 0.12, 0.055), 0.92);
        // The visible stick is intentionally thin, so aiming directly at it was far too
        // precise. This invisible pick volume resolves to the registered parent and
        // keeps the visible torch highlighted by the InteractionSystem.
        const pickupAssist = MeshBuilder.CreateSphere("improvised-torch-pick-assist", { diameter: 1.35, segments: 8 }, this.scene);
        pickupAssist.parent = torch;
        pickupAssist.position = new Vector3(0, 0.03, 0);
        pickupAssist.isVisible = true;
        pickupAssist.visibility = 0.002;
        pickupAssist.isPickable = true;
        pickupAssist.checkCollisions = false;
        this.interaction.register(torch, {
            prompt: "[E] PEGAR TOCHA IMPROVISADA",
            enabled: () => !this.torchTaken,
            maxDistance: 5.4,
            ignoreLineOfSight: true,
            onInteract: () => {
                if (this.torchTaken)
                    return;
                this.torchTaken = true;
                this.inventory.add(ITEM_CATALOG.torch);
                this.audio.pickup();
                torch.setEnabled(false);
                this.objective.set("find-fuel", "ENCONTRE COMBUSTÍVEL EM UM VEÍCULO ABANDONADO.");
            }
        });
    }
    createFacilityShell() {
        this.createContinuousFacilityFloor();
        // Each room now exposes only the doorway that actually connects to the route.
        // The old helper cut a full-height hole into all four walls of every room,
        // producing floating panels, accidental exits and large visible gaps.
        this.createRoomShell("lobby-shell", new Vector3(0, 0, 51), 28, 19, 6, "tile", true, ["north", "east"]);
        const sideHallFloor = MeshBuilder.CreateBox("side-hall-floor", { width: 9, height: 0.2, depth: 14 }, this.scene);
        sideHallFloor.position = new Vector3(17.8, -0.055, 45.5);
        sideHallFloor.material = this.materials.floor("concrete", 0);
        sideHallFloor.isVisible = true;
        sideHallFloor.visibility = 1;
        sideHallFloor.checkCollisions = true;
        sideHallFloor.metadata = { interactionPassthrough: true };
        const sideHallFoundation = MeshBuilder.CreateBox("side-hall-floor-foundation", { width: 9, height: 0.42, depth: 14 }, this.scene);
        sideHallFoundation.position = new Vector3(17.8, -0.31, 45.5);
        sideHallFoundation.material = this.materials.solid("chapter1-floor-foundation", new Color3(0.055, 0.06, 0.065), 1);
        sideHallFoundation.isPickable = false;
        sideHallFoundation.checkCollisions = false;
        sideHallFoundation.metadata = { interactionPassthrough: true };
        const sideHallRightWall = MeshBuilder.CreateBox("side-hall-wall-right", { width: 0.35, height: 5.5, depth: 14 }, this.scene);
        sideHallRightWall.position = new Vector3(22.3, 2.75, 45.5);
        sideHallRightWall.material = this.materials.get("concrete", 0);
        sideHallRightWall.checkCollisions = true;
        // The west wall stops before the lobby doorway. The previous full-length wall
        // sat directly in front of the opening and made the interior look accessible
        // while physically blocking the route.
        const sideHallLeftWall = MeshBuilder.CreateBox("side-hall-wall-left-south", { width: 0.35, height: 5.5, depth: 10.4 }, this.scene);
        sideHallLeftWall.position = new Vector3(13.3, 2.75, 43.7);
        sideHallLeftWall.material = this.materials.get("concrete", 0);
        sideHallLeftWall.checkCollisions = true;
        const sideHallLintel = MeshBuilder.CreateBox("side-hall-lobby-lintel", { width: 0.35, height: 1.8, depth: 3.6 }, this.scene);
        sideHallLintel.position = new Vector3(13.3, 4.6, 50.7);
        sideHallLintel.material = this.materials.get("concrete", 0);
        sideHallLintel.checkCollisions = true;
        const sideHallCeiling = MeshBuilder.CreateBox("side-hall-ceiling", { width: 9, height: 0.28, depth: 14 }, this.scene);
        sideHallCeiling.position = new Vector3(17.8, 5.5, 45.5);
        sideHallCeiling.material = this.materials.get("concrete", 1);
        sideHallCeiling.checkCollisions = true;
        sideHallCeiling.metadata = { interactionPassthrough: true };
        this.createRoomShell("gift-shell", new Vector3(-16, 0, 63), 17, 16, 5.5, "wood", true, ["east"]);
        this.createRoomShell("food-shell", new Vector3(16, 0, 65), 17, 20, 5.5, "tile", true, ["west"]);
        this.createCorridor("main-corridor", new Vector3(0, 0, 84), 8, 55, "concrete", {
            left: [63, 86, 102],
            right: [65]
        });
        this.createRoomShell("maintenance-shell", new Vector3(-17, 0, 86), 17, 18, 5, "concrete", true, ["east"]);
        this.createRoomShell("electrical-shell", new Vector3(-17, 0, 102), 17, 13, 5, "metal", true, ["east"]);
        // This missing central stretch was the largest visible hole in the interior.
        this.createCorridor("body-mid-corridor", new Vector3(0, 0, 118), 8, 13, "concrete", {
            left: [117],
            right: [117]
        });
        this.createRoomShell("hands-shell", new Vector3(-16, 0, 117), 18, 16, 6, "metal", true, ["east"]);
        this.createRoomShell("eyes-shell", new Vector3(16, 0, 117), 18, 16, 6, "concrete", true, ["west"]);
        this.createRoomShell("heart-shell", new Vector3(-16, 0, 136), 18, 16, 6, "tile", true, ["east"]);
        this.createRoomShell("feet-shell", new Vector3(16, 0, 136), 18, 16, 6, "metal", true, ["west"]);
        this.createCorridor("auditorium-approach", new Vector3(0, 0, 136), 9, 23, "concrete", {
            left: [136],
            right: [136]
        });
        // Short enclosed bridges join every room doorway to the central corridor.
        this.createHorizontalConnector("gift-connector", new Vector3(-5.75, 0, 63), 3.5, 4.2, 5.5, "wood");
        this.createHorizontalConnector("food-connector", new Vector3(5.75, 0, 65), 3.5, 4.2, 5.5, "concrete");
        this.createHorizontalConnector("maintenance-connector", new Vector3(-6.25, 0, 86), 4.5, 4.2, 5, "concrete");
        this.createHorizontalConnector("electrical-connector", new Vector3(-6.25, 0, 102), 4.5, 4.2, 5, "metal");
        this.createHorizontalConnector("hands-connector", new Vector3(-5.5, 0, 117), 3, 4.2, 6, "metal");
        this.createHorizontalConnector("eyes-connector", new Vector3(5.5, 0, 117), 3, 4.2, 6, "concrete");
        this.createHorizontalConnector("heart-connector", new Vector3(-5.75, 0, 136), 2.5, 4.2, 6, "concrete");
        this.createHorizontalConnector("feet-connector", new Vector3(5.75, 0, 136), 2.5, 4.2, 6, "metal");
    }
    createContinuousFacilityFloor() {
        const baseMaterial = this.materials.solid("facility-continuous-floor-material", new Color3(0.075, 0.08, 0.085), 1);
        baseMaterial.backFaceCulling = false;
        // One continuous slab sits below all decorative room floors and closes every
        // seam between the lobby, side rooms, corridors and auditorium approach.
        const slab = MeshBuilder.CreateBox("facility-continuous-floor", { width: 56, height: 0.44, depth: 110 }, this.scene);
        slab.position = new Vector3(0, -0.23, 94);
        slab.material = baseMaterial;
        slab.checkCollisions = true;
        slab.isPickable = false;
        slab.receiveShadows = true;
        slab.metadata = { interactionPassthrough: true, continuousInteriorFloor: true };
        const foundation = MeshBuilder.CreateBox("facility-continuous-foundation", { width: 58, height: 1.25, depth: 112 }, this.scene);
        foundation.position = new Vector3(0, -1.05, 94);
        foundation.material = this.materials.solid("facility-deep-foundation", new Color3(0.035, 0.038, 0.042), 1);
        foundation.checkCollisions = true;
        foundation.isPickable = false;
        foundation.metadata = { interactionPassthrough: true };
        const wallMaterial = this.materials.get("concrete", 4);
        const makeOuterWall = (name, position, width, depth) => {
            const wall = MeshBuilder.CreateBox(name, { width, height: 7, depth }, this.scene);
            wall.position = position;
            wall.material = wallMaterial;
            wall.checkCollisions = true;
            wall.metadata = { facilityOuterWall: true };
        };
        makeOuterWall("facility-outer-wall-left", new Vector3(-27.5, 3.5, 91), 0.5, 104);
        makeOuterWall("facility-outer-wall-right", new Vector3(27.5, 3.5, 91), 0.5, 104);
        makeOuterWall("facility-front-wall-left", new Vector3(-4.65, 3.5, 39.2), 45.7, 0.5);
        makeOuterWall("facility-front-wall-right", new Vector3(24.65, 3.5, 39.2), 5.7, 0.5);
    }
    createHorizontalConnector(name, center, width, depth, height, material) {
        const floor = MeshBuilder.CreateBox(`${name}-floor`, { width, height: 0.2, depth }, this.scene);
        floor.position = center.add(new Vector3(0, -0.055, 0));
        floor.material = this.materials.floor(material, Math.floor(center.z));
        floor.checkCollisions = true;
        floor.metadata = { interactionPassthrough: true };
        const ceiling = MeshBuilder.CreateBox(`${name}-ceiling`, { width, height: 0.26, depth }, this.scene);
        ceiling.position = center.add(new Vector3(0, height, 0));
        ceiling.material = this.materials.get(material === "wood" ? "wood" : material, Math.floor(center.z));
        ceiling.checkCollisions = true;
        ceiling.metadata = { interactionPassthrough: true };
        for (const side of [-1, 1]) {
            const wall = MeshBuilder.CreateBox(`${name}-side-${side}`, { width, height, depth: 0.35 }, this.scene);
            wall.position = center.add(new Vector3(0, height / 2, side * depth / 2));
            wall.material = this.materials.get(material === "wood" ? "wood" : material, side + Math.floor(center.z));
            wall.checkCollisions = true;
        }
    }
    createLobby() {
        const desk = MeshBuilder.CreateBox("lobby-desk", { width: 8, height: 1.25, depth: 1.7 }, this.scene);
        desk.position = new Vector3(0, 0.65, 51);
        desk.material = this.materials.get("wood", 0);
        desk.checkCollisions = true;
        this.createTextSign("lobby-map", "VOCÊ ESTÁ AQUI", new Vector3(0, 2.8, 58.8), 5, 2, new Color3(0.42, 0.12, 0.08));
        for (let i = 0; i < 4; i += 1) {
            const turnstile = MeshBuilder.CreateCylinder(`turnstile-${i}`, { height: 1.1, diameter: 0.22, tessellation: 8 }, this.scene);
            turnstile.position = new Vector3(-4.5 + i * 3, 0.55, 57);
            turnstile.material = this.materials.get("metal", 0);
            turnstile.checkCollisions = true;
        }
        const corridorToy = this.createSmallPlush("corridor-plush", new Vector3(0.9, 0, 43.2), 0.55, 0);
        let movedOnce = false;
        window.setInterval(() => {
            if (!this.enteredWonderWorld || movedOnce)
                return;
            const toToy = corridorToy.getAbsolutePosition().subtract(this.player.collider.position).normalize();
            if (Vector3.Distance(corridorToy.getAbsolutePosition(), this.player.collider.position) < 9 && Vector3.Dot(this.player.forward(), toToy) < -0.15) {
                corridorToy.position = new Vector3(-1.8, 0, 48.8);
                corridorToy.rotation.y = Math.PI;
                movedOnce = true;
                this.fire.torchLit = false;
                this.ui.showSoundCaption("um brinquedo arrasta o tecido no chão");
            }
        }, 250);
    }
    createGiftShop() {
        for (let row = 0; row < 3; row += 1) {
            for (let column = 0; column < 3; column += 1) {
                const shelf = MeshBuilder.CreateBox(`gift-shelf-${row}-${column}`, { width: 3.2, height: 2.3, depth: 0.65 }, this.scene);
                shelf.position = new Vector3(-20 + column * 4, 1.15, 58.7 + row * 4.2);
                shelf.material = this.materials.get("wood", row + column);
                shelf.checkCollisions = true;
                for (let toyIndex = 0; toyIndex < 3; toyIndex += 1) {
                    this.createSmallPlush(`shelf-toy-${row}-${column}-${toyIndex}`, shelf.position.add(new Vector3(-0.9 + toyIndex * 0.9, 1.45, -0.42)), 0.24, toyIndex);
                }
            }
        }
        const counter = MeshBuilder.CreateBox("gift-counter", { width: 7.5, height: 1.15, depth: 1.2 }, this.scene);
        counter.position = new Vector3(-16, 0.58, 69.2);
        counter.material = this.materials.get("wood", 1);
        counter.checkCollisions = true;
        const key = MeshBuilder.CreateBox("electrical-panel-key", { width: 0.12, height: 0.03, depth: 0.55 }, this.scene);
        key.position = new Vector3(-16, 1.22, 68.9);
        key.material = this.materials.get("metal", 1);
        this.interaction.register(key, {
            prompt: "[E] PEGAR CHAVE DO QUADRO ELÉTRICO",
            onInteract: () => {
                if (this.keyTaken)
                    return;
                this.keyTaken = true;
                this.panelKeyTaken = true;
                this.inventory.add(ITEM_CATALOG.panelKey);
                key.setEnabled(false);
                this.audio.pickup();
                this.ui.showSoundCaption("dezenas de costuras se esticam ao mesmo tempo");
                this.spawnGiftShopPlushWave();
                this.updatePowerObjective();
            }
        });
    }
    spawnGiftShopPlushWave() {
        const positions = [
            new Vector3(-22, 0, 57), new Vector3(-18, 0, 61), new Vector3(-12, 0, 59),
            new Vector3(-21, 0, 67), new Vector3(-11, 0, 66), new Vector3(-16, 0, 72)
        ];
        positions.forEach((position, index) => {
            const enemy = new PlushEnemy(this.scene, this.materials, this.fire, this.player, this.audio, {
                name: `gift-enemy-${index}`,
                position,
                scale: 0.7 + (index % 3) * 0.12,
                variant: index,
                dormant: index > 1,
                activationDistance: 12
            });
            this.plushEnemies.push(enemy);
        });
        this.objective.set("survive-plush", "SOBREVIVA AOS BRINQUEDOS E ENCONTRE AS PEÇAS DO QUADRO.");
    }
    createFoodCourt() {
        for (let i = 0; i < 8; i += 1) {
            const table = MeshBuilder.CreateCylinder(`food-table-${i}`, { height: 0.85, diameter: 2.2, tessellation: 18 }, this.scene);
            table.position = new Vector3(11 + (i % 3) * 4.5, 0.43, 59 + Math.floor(i / 3) * 4.7);
            table.material = this.materials.get("metal", i);
            table.checkCollisions = true;
        }
        const machine = MeshBuilder.CreateBox("soda-machine", { width: 2.4, height: 3.6, depth: 1.4 }, this.scene);
        machine.position = new Vector3(21, 1.8, 72);
        machine.material = this.materials.get("metal", 1);
        machine.checkCollisions = true;
        const crank = MeshBuilder.CreateCylinder("soda-crank", { height: 0.7, diameter: 0.14, tessellation: 8 }, this.scene);
        crank.position = new Vector3(19.7, 1.4, 71.3);
        crank.rotation.z = Math.PI / 2;
        crank.material = this.materials.get("metal", 0);
        this.interaction.register(crank, {
            prompt: "[E] SOLTAR A MANIVELA DA MÁQUINA",
            onInteract: () => {
                if (this.crankTaken)
                    return;
                this.crankTaken = true;
                this.inventory.add(ITEM_CATALOG.crank);
                crank.setEnabled(false);
                this.audio.pickup();
                this.updatePowerObjective();
            }
        });
    }
    createMaintenanceAndPower() {
        const crate = MeshBuilder.CreateBox("maintenance-heavy-crate", { width: 2.5, height: 1.4, depth: 2.2 }, this.scene);
        crate.position = new Vector3(-20, 0.7, 83);
        crate.material = this.materials.get("wood", 0);
        crate.checkCollisions = true;
        this.interaction.register(crate, {
            prompt: () => this.cableTaken ? "CAIXOTE VAZIO" : this.crateMoved ? "[E] PEGAR O CABO REVELADO" : "[E] EMPURRAR O CAIXOTE",
            onInteract: () => {
                if (!this.crateMoved) {
                    this.crateMoved = true;
                    crate.position.x += 3.2;
                    this.audio.impact(0.7);
                    return;
                }
                if (!this.cableTaken) {
                    this.cableTaken = true;
                    this.inventory.add(ITEM_CATALOG.cable);
                    this.audio.pickup();
                    this.updatePowerObjective();
                }
            }
        });
        const cable = MeshBuilder.CreateTorus("visible-cable", { diameter: 1.2, thickness: 0.12, tessellation: 24 }, this.scene);
        cable.position = new Vector3(-20, 0.2, 83);
        cable.rotation.x = Math.PI / 2;
        cable.material = this.materials.get("metal", 1);
        // Hollow fuse locker: back, sides, top and bottom remain fixed while only the
        // front door rotates. The old implementation rotated the entire solid box.
        const lockerRoot = new TransformNode("fuse-locker-root", this.scene);
        lockerRoot.position = new Vector3(-12.7, 0, 88);
        const lockerMaterial = this.materials.get("metal", 0);
        const lockerInterior = this.materials.solid("fuse-locker-interior", new Color3(0.035, 0.04, 0.043), 0.94);
        const createLockerPart = (name, size, position, material = lockerMaterial) => {
            const part = MeshBuilder.CreateBox(name, size, this.scene);
            part.parent = lockerRoot;
            part.position.copyFrom(position);
            part.material = material;
            part.checkCollisions = true;
            part.isPickable = false;
            return part;
        };
        createLockerPart("fuse-locker-back", { width: 2.2, height: 3.5, depth: 0.14 }, new Vector3(0, 1.75, 0.49));
        createLockerPart("fuse-locker-left", { width: 0.14, height: 3.5, depth: 1.1 }, new Vector3(-1.03, 1.75, 0));
        createLockerPart("fuse-locker-right", { width: 0.14, height: 3.5, depth: 1.1 }, new Vector3(1.03, 1.75, 0));
        createLockerPart("fuse-locker-top", { width: 2.2, height: 0.14, depth: 1.1 }, new Vector3(0, 3.43, 0));
        createLockerPart("fuse-locker-bottom", { width: 2.2, height: 0.14, depth: 1.1 }, new Vector3(0, 0.07, 0), lockerInterior);
        createLockerPart("fuse-locker-shelf", { width: 1.95, height: 0.1, depth: 0.86 }, new Vector3(0, 1.38, 0.04), lockerInterior);
        const lockerHinge = new TransformNode("fuse-locker-hinge", this.scene);
        lockerHinge.parent = lockerRoot;
        lockerHinge.position = new Vector3(-1.02, 0, -0.56);
        const lockerDoor = MeshBuilder.CreateBox("fuse-locker", { width: 2.05, height: 3.32, depth: 0.12 }, this.scene);
        lockerDoor.parent = lockerHinge;
        lockerDoor.position = new Vector3(1.025, 1.75, 0);
        lockerDoor.material = lockerMaterial;
        lockerDoor.checkCollisions = true;
        const lockerHandle = MeshBuilder.CreateBox("fuse-locker-handle", { width: 0.14, height: 0.52, depth: 0.14 }, this.scene);
        lockerHandle.parent = lockerDoor;
        lockerHandle.position = new Vector3(0.75, 0, -0.12);
        lockerHandle.material = this.materials.solid("fuse-locker-handle-material", new Color3(0.3, 0.24, 0.12), 0.45, 0.35);
        lockerHandle.isPickable = false;
        const fuseVisual = MeshBuilder.CreateCylinder("fuse-locker-fuse-visual", { height: 0.74, diameter: 0.22, tessellation: 12 }, this.scene);
        fuseVisual.parent = lockerRoot;
        fuseVisual.position = new Vector3(0.28, 1.66, -0.12);
        fuseVisual.rotation.z = Math.PI / 2;
        fuseVisual.material = this.materials.solid("fuse-locker-fuse-material", new Color3(0.78, 0.66, 0.34), 0.38, 0.18);
        fuseVisual.setEnabled(false);
        this.interaction.register(lockerDoor, {
            prompt: () => this.lockerOpened ? (this.fuseTaken ? "[E] EXAMINAR ARMÁRIO VAZIO" : "[E] RETIRAR O FUSÍVEL") : "[E] ABRIR ARMÁRIO EMPERRADO",
            maxDistance: 4.6,
            onInteract: () => {
                if (!this.lockerOpened) {
                    this.lockerOpened = true;
                    lockerHinge.rotation.y = -1.42;
                    lockerDoor.checkCollisions = false;
                    fuseVisual.setEnabled(!this.fuseTaken);
                    this.audio.impact(0.55);
                    return;
                }
                if (!this.fuseTaken) {
                    this.fuseTaken = true;
                    fuseVisual.setEnabled(false);
                    this.inventory.add(ITEM_CATALOG.fuse);
                    this.audio.pickup();
                    this.updatePowerObjective();
                }
                else {
                    this.ui.toast("O armário está vazio.", 1100);
                }
            }
        });
        const bandage = MeshBuilder.CreateBox("maintenance-bandage", { width: 0.78, height: 0.18, depth: 0.42 }, this.scene);
        bandage.position = new Vector3(-10.8, 0.34, 82.2);
        bandage.rotation.y = 0.35;
        bandage.material = this.materials.solid("clean-bandage", new Color3(0.72, 0.69, 0.57), 0.92);
        this.interaction.register(bandage, {
            prompt: "[E] PEGAR CURATIVO IMPROVISADO",
            onInteract: () => {
                if (this.bandageTaken)
                    return;
                this.bandageTaken = true;
                this.inventory.add(ITEM_CATALOG.bandage);
                bandage.setEnabled(false);
                this.audio.pickup();
                this.ui.toast("Curativo improvisado adicionado ao inventário.");
            }
        });
        const panel = MeshBuilder.CreateBox("electrical-panel", { width: 4, height: 3.4, depth: 0.55 }, this.scene);
        panel.position = new Vector3(-17, 2.0, 107.8);
        panel.material = this.materials.get("metal", 0);
        panel.checkCollisions = true;
        const lever = MeshBuilder.CreateBox("electrical-main-lever", { width: 0.35, height: 1.4, depth: 0.28 }, this.scene);
        lever.parent = panel;
        lever.position = new Vector3(0, 0, -0.45);
        lever.material = this.materials.get("plastic", 0);
        this.interaction.register(panel, {
            prompt: () => this.powerRestored ? "QUADRO ELÉTRICO OPERACIONAL" : "[E] REPARAR O QUADRO ELÉTRICO",
            onInteract: () => {
                if (this.powerRestored)
                    return;
                const required = ["panelKey", "fuse", "cable", "crank"];
                const missing = required.filter((id) => !this.inventory.has(id));
                if (missing.length) {
                    this.ui.toast(`Faltam ${missing.length} peças para concluir o reparo.`);
                    this.updatePowerObjective();
                    return;
                }
                this.powerRestored = true;
                lever.rotation.z = Math.PI;
                this.enableFacilityLights(true);
                this.audio.impact(1);
                this.audio.startInteriorHum();
                this.ui.showSubtitle("Gravação institucional", "Braços para abraçar. Pernas para correr. Olhos para enxergar. Um corpo perfeito para brincar.", 7200);
                this.audio.playVoiceLikeLine(4.8);
                this.objective.set("solve-body-puzzles", "ATIVE AS QUATRO PARTES DO CORPO PARA ABRIR O AUDITÓRIO. (0/4)");
                this.callbacks.onPowerRestored();
            }
        });
    }
    createHandsPuzzle() {
        this.createTextSign("hands-title", "MÃOS · APERTE COMO NÓS", new Vector3(-16, 4.6, 124.7), 7.5, 1.2, new Color3(0.45, 0.13, 0.08));
        const target = [1, 3, 2, 0];
        for (let i = 0; i < 4; i += 1) {
            const pivot = new TransformNode(`hand-pivot-${i}`, this.scene);
            pivot.position = new Vector3(-20.5 + i * 3, 2.1, 123.5);
            const palm = MeshBuilder.CreateBox(`hand-palm-${i}`, { width: 1.2, height: 1.4, depth: 0.35 }, this.scene);
            palm.parent = pivot;
            palm.material = this.materials.get("metal", i);
            palm.checkCollisions = true;
            for (let finger = 0; finger < 3; finger += 1) {
                const segment = MeshBuilder.CreateCapsule(`hand-${i}-finger-${finger}`, { height: 1.05, radius: 0.11, tessellation: 8 }, this.scene);
                segment.parent = pivot;
                segment.position = new Vector3(-0.38 + finger * 0.38, 1.05, 0);
                segment.material = this.materials.get("metal", i);
            }
            this.interaction.register(palm, {
                prompt: () => this.solvedPuzzles.has("hands") ? "MECANISMO DAS MÃOS ATIVO" : `[E] AJUSTAR MÃO ${i + 1}`,
                onInteract: () => {
                    if (!this.powerRestored || this.solvedPuzzles.has("hands")) {
                        if (!this.powerRestored)
                            this.ui.toast("O mecanismo não tem energia.");
                        return;
                    }
                    this.handsAngles[i] = ((this.handsAngles[i] ?? 0) + 1) % 4;
                    pivot.rotation.z = (this.handsAngles[i] ?? 0) * (Math.PI / 2);
                    this.audio.impact(0.23);
                    if (this.handsAngles.every((value, index) => value === target[index]))
                        this.solvePuzzle("hands");
                }
            });
        }
        this.createTextSign("hands-clue", "ABRAÇAR · SEGURAR · SOLTAR · PROTEGER", new Vector3(-16, 2.3, 125.1), 8, 0.8, new Color3(0.3, 0.25, 0.18));
    }
    createEyesPuzzle() {
        this.createTextSign("eyes-title", "OLHOS · VEJA O QUE ELES VEEM", new Vector3(16, 4.6, 124.7), 7.8, 1.2, new Color3(0.17, 0.32, 0.38));
        const targets = [1, 2, 3];
        for (let i = 0; i < 3; i += 1) {
            const mirror = MeshBuilder.CreateBox(`eye-mirror-${i}`, { width: 2.0, height: 2.4, depth: 0.14 }, this.scene);
            mirror.position = new Vector3(12 + i * 4, 2.1, 120.5 + (i % 2) * 2.2);
            mirror.material = this.materials.get("glass", i);
            mirror.checkCollisions = true;
            this.interaction.register(mirror, {
                prompt: () => this.solvedPuzzles.has("eyes") ? "FEIXE ÓPTICO ESTÁVEL" : `[E] GIRAR ESPELHO ${i + 1}`,
                onInteract: () => {
                    if (!this.powerRestored || this.solvedPuzzles.has("eyes")) {
                        if (!this.powerRestored)
                            this.ui.toast("Os refletores estão sem energia.");
                        return;
                    }
                    this.eyesAngles[i] = ((this.eyesAngles[i] ?? 0) + 1) % 4;
                    mirror.rotation.y = (this.eyesAngles[i] ?? 0) * (Math.PI / 4);
                    this.updateEyeBeams();
                    if (this.eyesAngles.every((value, index) => value === targets[index]))
                        this.solvePuzzle("eyes");
                }
            });
        }
        for (let i = 0; i < 3; i += 1) {
            const symbol = this.createTextSign(`eye-symbol-${i}`, ["△", "○", "□"][i], new Vector3(12 + i * 4, 3, 125.1), 1.3, 1.3, new Color3(0.7, 0.65, 0.45));
            symbol.rotation.y = Math.PI;
        }
    }
    createHeartPuzzle() {
        this.createTextSign("heart-title", "CORAÇÃO · MANTENHA O RITMO", new Vector3(-16, 4.6, 143.7), 7.2, 1.2, new Color3(0.55, 0.05, 0.04));
        const targets = [2, 1, 3];
        for (let i = 0; i < 3; i += 1) {
            const valve = MeshBuilder.CreateTorus(`heart-valve-${i}`, { diameter: 1.1, thickness: 0.15, tessellation: 18 }, this.scene);
            valve.position = new Vector3(-20 + i * 4, 1.7, 141.8);
            valve.rotation.x = Math.PI / 2;
            valve.material = this.materials.get("metal", i);
            this.interaction.register(valve, {
                prompt: () => this.solvedPuzzles.has("heart") ? "PRESSÃO ESTÁVEL" : `[E] GIRAR VÁLVULA ${i + 1}`,
                onInteract: () => {
                    if (!this.powerRestored || this.solvedPuzzles.has("heart")) {
                        if (!this.powerRestored)
                            this.ui.toast("A bomba está sem energia.");
                        return;
                    }
                    this.heartValves[i] = ((this.heartValves[i] ?? 0) + 1) % 4;
                    valve.rotation.z = (this.heartValves[i] ?? 0) * Math.PI / 2;
                    this.audio.impact(0.2);
                }
            });
        }
        const pump = MeshBuilder.CreateCylinder("heart-pump", { height: 2.4, diameter: 2.4, tessellation: 18 }, this.scene);
        pump.position = new Vector3(-16, 1.2, 132.2);
        pump.rotation.z = Math.PI / 2;
        pump.material = this.materials.get("metal", 1);
        pump.checkCollisions = true;
        this.interaction.register(pump, {
            prompt: "[E] ACIONAR PULSO DA BOMBA",
            onInteract: () => {
                if (!this.powerRestored || this.solvedPuzzles.has("heart"))
                    return;
                if (!this.heartValves.every((value, index) => value === targets[index])) {
                    this.heartPulses = [];
                    this.ui.toast("A pressão retorna pelas válvulas. Leia os medidores: 2 · 1 · 3.");
                    return;
                }
                const now = performance.now();
                this.heartPulses.push(now);
                if (this.heartPulses.length > 3)
                    this.heartPulses.shift();
                pump.scaling.setAll(1.14);
                window.setTimeout(() => pump.scaling.setAll(1), 140);
                this.audio.impact(0.4);
                if (this.heartPulses.length === 3) {
                    const firstGap = this.heartPulses[1] - this.heartPulses[0];
                    const secondGap = this.heartPulses[2] - this.heartPulses[1];
                    if (firstGap > 520 && firstGap < 1150 && secondGap > 520 && secondGap < 1150) {
                        this.solvePuzzle("heart");
                    }
                    else if (secondGap > 1500) {
                        this.heartPulses = [now];
                        this.ui.toast("O ritmo se perdeu. Tente três pulsações regulares.");
                    }
                }
            }
        });
        this.createTextSign("heart-clue", "PRESSÃO: II · I · III     RITMO: TUM — TUM — TUM", new Vector3(-16, 2.7, 128.2), 8.5, 0.9, new Color3(0.5, 0.15, 0.12));
    }
    createFeetPuzzle() {
        this.createTextSign("feet-title", "PÉS · SIGA OS PASSOS", new Vector3(16, 4.6, 143.7), 7, 1.2, new Color3(0.5, 0.33, 0.08));
        const panelPositions = [
            new Vector3(12.5, 0.12, 132.5), new Vector3(16, 0.12, 132.5),
            new Vector3(12.5, 0.12, 136), new Vector3(16, 0.12, 136)
        ];
        panelPositions.forEach((position, index) => {
            const panel = MeshBuilder.CreateBox(`foot-panel-${index}`, { width: 2.8, height: 0.16, depth: 2.8 }, this.scene);
            panel.position = position;
            panel.material = this.materials.get("metal", index);
            panel.checkCollisions = true;
            this.interaction.register(panel, {
                prompt: () => this.solvedPuzzles.has("feet") ? "SEQUÊNCIA CONCLUÍDA" : `[E] PISAR NA PLACA ${index + 1}`,
                maxDistance: 2.6,
                onInteract: () => {
                    if (!this.powerRestored || this.solvedPuzzles.has("feet"))
                        return;
                    panel.position.y = 0.03;
                    window.setTimeout(() => panel.position.y = 0.12, 260);
                    if (index === this.feetSequence[this.feetProgress]) {
                        this.feetProgress += 1;
                        this.audio.objective();
                        if (this.feetProgress >= this.feetSequence.length)
                            this.solvePuzzle("feet");
                    }
                    else {
                        this.feetProgress = 0;
                        this.audio.impact(0.45);
                        this.ui.toast("A pista reiniciou. Observe as pegadas: 1 · 3 · 2 · 4.");
                    }
                }
            });
        });
        this.createTextSign("feet-clue", "1 → 3 → 2 → 4", new Vector3(16, 2.3, 143.8), 4, 0.9, new Color3(0.58, 0.45, 0.14));
    }
    createAuditorium() {
        const floor = MeshBuilder.CreateCylinder("auditorium-floor", { height: 0.3, diameter: 38, tessellation: 48 }, this.scene);
        floor.position = new Vector3(0, -0.1, 153);
        floor.material = this.materials.floor("wood", 1);
        floor.checkCollisions = true;
        const wall = MeshBuilder.CreateTorus("auditorium-wall", { diameter: 38, thickness: 1.2, tessellation: 64 }, this.scene);
        wall.position = new Vector3(0, 3.5, 153);
        wall.rotation.x = Math.PI / 2;
        wall.scaling.y = 3.8;
        wall.material = this.materials.get("concrete", 0);
        wall.checkCollisions = false;
        for (let index = 0; index < 32; index += 1) {
            const angle = (index / 32) * Math.PI * 2;
            const entranceDistance = Math.abs(Math.atan2(Math.sin(angle - Math.PI), Math.cos(angle - Math.PI)));
            if (entranceDistance < 0.2)
                continue;
            const radius = 18.6;
            const segment = MeshBuilder.CreateBox(`auditorium-wall-collider-${index}`, { width: 3.75, height: 7.2, depth: 0.7 }, this.scene);
            segment.position = new Vector3(Math.sin(angle) * radius, 3.6, 153 + Math.cos(angle) * radius);
            segment.rotation.y = angle;
            segment.isVisible = false;
            segment.checkCollisions = true;
        }
        this.auditoriumDoor = MeshBuilder.CreateBox("auditorium-door", { width: 6, height: 5.5, depth: 0.5 }, this.scene);
        this.auditoriumDoor.position = new Vector3(0, 2.75, 137.1);
        this.auditoriumDoor.material = this.materials.get("metal", 0);
        this.auditoriumDoor.checkCollisions = true;
        this.auditoriumDoorBlocker = this.createDoorFrame("auditorium", this.auditoriumDoor.position.clone(), 6, 5.5, 0.5, 0, false, 7.2, 7.2);
        this.interaction.register(this.auditoriumDoor, {
            prompt: () => this.auditoriumOpened ? "PORTAS DO AUDITÓRIO ABERTAS" : `[E] VERIFICAR TRAVAS DO AUDITÓRIO (${this.solvedPuzzles.size}/4)`,
            onInteract: () => {
                if (this.solvedPuzzles.size < 4) {
                    this.ui.toast(`Faltam ${4 - this.solvedPuzzles.size} partes do Corpo.`);
                    return;
                }
                this.openAuditorium();
            }
        });
        const stage = MeshBuilder.CreateCylinder("auditorium-stage", { height: 1.1, diameter: 17, tessellation: 48 }, this.scene);
        stage.position = new Vector3(0, 0.45, 165);
        stage.scaling.z = 0.5;
        stage.material = this.materials.get("wood", 0);
        stage.checkCollisions = true;
        for (const side of [-1, 1]) {
            const curtain = MeshBuilder.CreateBox(`stage-curtain-${side}`, { width: 5.3, height: 9, depth: 0.45 }, this.scene);
            curtain.position = new Vector3(side * 5.4, 5.1, 168.3);
            curtain.material = this.materials.get("plush", 0);
            curtain.checkCollisions = true;
            this.stageCurtains.push(curtain);
            this.fire.register(curtain, {
                health: 90,
                spreadRadius: 3.4,
                onDestroyed: () => curtain.material = this.materials.get("burned", 0)
            });
        }
        this.createSeats();
        this.createSpotlights();
        this.createGantries();
        this.createTextSign("auditorium-sign", "TEATRO BODY", new Vector3(0, 7.5, 170.8), 8.5, 1.6, new Color3(0.55, 0.05, 0.035));
    }
    createSeats() {
        const seatBase = MeshBuilder.CreateBox("seat-thin-source", { width: 1.35, height: 1.55, depth: 1.3 }, this.scene);
        seatBase.material = this.materials.get("plush", 1);
        seatBase.isVisible = true;
        seatBase.isPickable = false;
        const matrices = [];
        for (let row = 0; row < 5; row += 1) {
            const count = 8 + row * 2;
            for (let index = 0; index < count; index += 1) {
                const x = (index - (count - 1) / 2) * 1.75;
                const z = 142.8 + row * 2.45;
                if (Math.abs(x) < 1.1)
                    continue;
                matrices.push(Matrix.Translation(x, 0.78, z));
            }
        }
        seatBase.thinInstanceAdd(matrices);
        const coverPositions = [
            new Vector3(-6, 0.78, 147), new Vector3(6, 0.78, 147),
            new Vector3(-8, 0.78, 152), new Vector3(8, 0.78, 152),
            new Vector3(-4, 0.78, 156), new Vector3(4, 0.78, 156)
        ];
        coverPositions.forEach((position, index) => {
            const cover = MeshBuilder.CreateBox(`cover-seat-${index}`, { width: 2.1, height: 2.2, depth: 1.8 }, this.scene);
            cover.position = position;
            cover.material = this.materials.get("plush", index);
            cover.checkCollisions = true;
            this.coverSeats.push(cover);
            this.coverSeatDamage.set(cover.uniqueId, 0);
            this.fire.register(cover, {
                health: 75,
                spreadRadius: 2,
                onDestroyed: () => {
                    cover.scaling.y = 0.35;
                    cover.position.y = 0.3;
                    cover.material = this.materials.get("burned", 0);
                }
            });
        });
    }
    createSpotlights() {
        for (const side of [-1, 1]) {
            const console = MeshBuilder.CreateBox(`spotlight-console-${side}`, { width: 2.4, height: 1.3, depth: 1.4 }, this.scene);
            console.position = new Vector3(side * 13.5, 0.65, 153);
            console.material = this.materials.get("metal", side + 1);
            console.checkCollisions = true;
            const light = new SpotLight(`boss-spotlight-${side}`, new Vector3(side * 13, 8.5, 158), new Vector3(-side * 0.55, -0.35, 0.55), Math.PI / 5, 2, this.scene);
            light.diffuse = new Color3(0.95, 0.85, 0.62);
            light.intensity = 0;
            light.range = 40;
            this.interaction.register(console, {
                prompt: "[E] REDIRECIONAR REFLETOR PARA BODY",
                onInteract: () => {
                    if (!this.boss?.active || this.boss.phase !== 2) {
                        this.ui.toast("O controle aguarda a sequência do palco.");
                        return;
                    }
                    light.intensity = 8;
                    this.spotlightActivations += 1;
                    this.boss.activateSpotlight();
                    window.setTimeout(() => light.intensity = 0.9, 4200);
                }
            });
        }
    }
    createGantries() {
        for (const x of [-12, 0, 12]) {
            const beam = MeshBuilder.CreateBox(`gantry-${x}`, { width: 1, height: 0.4, depth: 30 }, this.scene);
            beam.position = new Vector3(x, 8, 153);
            beam.material = this.materials.get("metal", 0);
            beam.checkCollisions = true;
        }
        for (let i = 0; i < 7; i += 1) {
            const pipe = MeshBuilder.CreateCylinder(`auditorium-pipe-${i}`, { height: 34, diameter: 0.25, tessellation: 8 }, this.scene);
            pipe.position = new Vector3(-15 + i * 5, 7.2, 153);
            pipe.rotation.x = Math.PI / 2;
            pipe.material = this.materials.get("metal", i);
        }
    }
    createUndergroundTransition() {
        this.createCorridor("underground-corridor", new Vector3(0, 0, 177), 7, 20, "metal");
        this.elevatorDoor = MeshBuilder.CreateBox("underground-elevator-door", { width: 5.5, height: 5.5, depth: 0.5 }, this.scene);
        this.elevatorDoor.position = new Vector3(0, 2.75, 186.5);
        this.elevatorDoor.material = this.materials.get("metal", 0);
        this.elevatorDoor.checkCollisions = true;
        this.elevatorDoorBlocker = this.createDoorFrame("underground-elevator", this.elevatorDoor.position.clone(), 5.5, 5.5, 0.5, 0, false, 7, 5.8);
        const reader = MeshBuilder.CreateBox("body-card-reader", { width: 0.65, height: 1.2, depth: 0.25 }, this.scene);
        reader.position = new Vector3(3.6, 1.35, 185.9);
        reader.material = this.materials.get("plastic", 0);
        this.interaction.register(reader, {
            prompt: "[E] INSERIR CARTÃO DO CORPO",
            onInteract: () => {
                if (!this.inventory.has("bodyCard")) {
                    this.ui.toast("O leitor exige um cartão perfurado.");
                    return;
                }
                this.elevatorDoor.checkCollisions = false;
                this.elevatorDoor.position.y = 8.55;
                this.setDoorwayBlocked(this.elevatorDoorBlocker, false);
                this.audio.impact(1);
                this.callbacks.onChapterTransition();
            }
        });
    }
    createSurvivalLoot() {
        this.createLootContainer("exterior-emergency-chest", new Vector3(-24.2, 0.05, 21.2), "chest", "Pé de cabra e ferramentas de emergência.", () => {
            if (!this.inventory.has("crowbar"))
                this.inventory.add(ITEM_CATALOG.crowbar);
            this.ui.toast("Pé de cabra equipado. Clique esquerdo ataca; botão direito aplica um golpe pesado.", 3600);
        }, -Math.PI / 2);
        this.createLootContainer("lobby-security-cabinet", new Vector3(-9.4, 0.05, 51.2), "cabinet", "Um colete acolchoado de manutenção ainda está utilizável.", () => {
            if (!this.inventory.has("protectiveVest"))
                this.inventory.add(ITEM_CATALOG.protectiveVest);
            this.player.addArmor(55);
            this.ui.toast("Colete equipado: parte do dano será absorvida.", 2800);
        }, -Math.PI / 2);
        this.createLootContainer("gift-shop-fuel-chest", new Vector3(-23, 0.05, 69.2), "chest", "Frascos de combustível de limpeza e um pavio seco.", () => {
            this.fire.addFuel(42);
            this.ui.toast("Combustível de reserva adicionado à tocha.", 2200);
        }, -Math.PI / 2);
        this.createLootContainer("maintenance-medical-cabinet", new Vector3(-13.2, 0.05, 91.2), "cabinet", "Curativos, antisséptico e uma placa rígida para proteção.", () => {
            if (!this.inventory.has("medkit"))
                this.inventory.add(ITEM_CATALOG.medkit);
            this.player.heal(55);
            this.player.addArmor(20);
            this.ui.toast("Ferimentos tratados e proteção reforçada.", 2400);
        }, Math.PI / 2);
        this.createLootContainer("puzzle-hall-supply-chest", new Vector3(11.2, 0.05, 120.4), "chest", "Um sinalizador industrial, combustível e tecido resistente.", () => {
            if (!this.inventory.has("flare"))
                this.inventory.add(ITEM_CATALOG.flare);
            this.fire.addFuel(30);
            this.player.addArmor(12);
            this.ui.toast("Sinalizador e suprimentos coletados.", 2200);
        }, -Math.PI / 2);
        this.createLootContainer("auditorium-backstage-chest", new Vector3(10.5, 0.05, 158.6), "chest", "Equipamento de palco, combustível e um kit de emergência.", () => {
            this.fire.addFuel(55);
            this.player.heal(45);
            this.player.addArmor(30);
            this.ui.toast("Suprimentos de combate recuperados.", 2200);
        }, Math.PI / 2);
        this.createLootContainer("chapter2-modeling-chest", new Vector3(13.5, 0.05, 252), "chest", "Combustível industrial, placas de proteção e ferramentas de modelagem.", () => { this.fire.addFuel(38); this.player.addArmor(22); this.ui.toast("Suprimentos do departamento de modelagem coletados.", 2200); }, Math.PI / 2);
        this.createLootContainer("chapter2-machine-cabinet", new Vector3(-12.5, 0.05, 350), "cabinet", "Um kit médico lacrado e um pequeno reservatório de combustível.", () => { this.player.heal(45); this.fire.addFuel(25); this.ui.toast("Kit médico usado e combustível armazenado.", 2200); }, -Math.PI / 2);
        this.createLootContainer("chapter3-daniel-chest", new Vector3(5.8, 0.05, 758.5), "chest", "Peças de equipamento deixadas por Daniel: proteção, gaze e combustível.", () => { this.player.heal(38); this.player.addArmor(35); this.fire.addFuel(24); this.ui.toast("Equipamento de Daniel recuperado.", 2300); }, Math.PI / 2);
        this.createLootContainer("chapter3-generator-cabinet", new Vector3(14.5, 0.05, 830), "cabinet", "Máscara improvisada, placas rígidas e combustível de manutenção.", () => { this.player.addArmor(30); this.fire.addFuel(34); this.ui.toast("Proteção e combustível coletados.", 2200); }, -Math.PI / 2);
        this.createLootContainer("chapter4-guard-cabinet", new Vector3(9.5, 0.05, 1168.5), "cabinet", "Suprimentos confiscados: curativos, uma chapa protetora e combustível.", () => { this.player.heal(42); this.player.addArmor(28); this.fire.addFuel(20); this.ui.toast("Suprimentos confiscados recuperados.", 2200); }, Math.PI / 2);
        this.createLootContainer("chapter4-choice-chest", new Vector3(-2.8, 0.05, 1240), "chest", "Uma reserva escondida com proteção reforçada e itens médicos.", () => { this.player.heal(55); this.player.addArmor(42); this.ui.toast("Reserva de sobrevivência coletada.", 2200); }, 0.25);
        this.createLootContainer("chapter5-archives-cabinet", new Vector3(12.5, 0.05, 1570), "cabinet", "Equipamento de evacuação, combustível e uma proteção leve.", () => { this.fire.addFuel(40); this.player.addArmor(25); this.ui.toast("Equipamento de evacuação coletado.", 2200); }, Math.PI / 2);
        this.createLootContainer("chapter5-bridge-chest", new Vector3(0, 8.06, 1951), "chest", "O último kit de emergência: combustível, curativos e placas de proteção.", () => { this.fire.addFuel(60); this.player.heal(70); this.player.addArmor(48); this.ui.toast("Kit final de emergência coletado.", 2600); }, 0);
    }
    createLootContainer(id, position, kind, contentsText, onLoot, rotationY = 0) {
        const root = new TransformNode(`${id}-root`, this.scene);
        root.position.copyFrom(position);
        root.rotation.y = rotationY;
        root.metadata = { lootContainerRoot: true, containerId: id, frontLocalZ: -1 };
        const shellMaterial = kind === "chest" ? this.materials.get("wood", id.length) : this.materials.get("metal", id.length);
        const innerMaterial = this.materials.solid(`${id}-interior-material`, new Color3(0.035, 0.038, 0.04), 0.96);
        const contentsMaterial = this.materials.emissive(`${id}-loot-glow`, new Color3(0.78, 0.42, 0.1), 0.72);
        const parts = [];
        const makePart = (name, size, local, material = shellMaterial) => {
            const part = MeshBuilder.CreateBox(`${id}-${name}`, size, this.scene);
            part.parent = root;
            part.position.copyFrom(local);
            part.material = material;
            part.checkCollisions = true;
            part.isPickable = false;
            parts.push(part);
            return part;
        };
        // A shallow plinth prevents the cabinet/chest from visually sinking into
        // uneven floors and makes its footprint obvious near walls.
        makePart("plinth", {
            width: kind === "chest" ? 2.64 : 1.78,
            height: 0.08,
            depth: kind === "chest" ? 1.78 : 1.16
        }, new Vector3(0, 0.02, 0), innerMaterial);
        let hinge;
        let door;
        let openRotation;
        const contents = [];
        if (kind === "chest") {
            makePart("bottom", { width: 2.5, height: 0.18, depth: 1.65 }, new Vector3(0, 0.12, 0), innerMaterial);
            makePart("front", { width: 2.5, height: 0.82, depth: 0.16 }, new Vector3(0, 0.5, -0.75));
            makePart("back", { width: 2.5, height: 0.82, depth: 0.16 }, new Vector3(0, 0.5, 0.75));
            makePart("left", { width: 0.16, height: 0.82, depth: 1.5 }, new Vector3(-1.17, 0.5, 0));
            makePart("right", { width: 0.16, height: 0.82, depth: 1.5 }, new Vector3(1.17, 0.5, 0));
            hinge = new TransformNode(`${id}-hinge`, this.scene);
            hinge.parent = root;
            hinge.position = new Vector3(0, 0.9, 0.75);
            door = MeshBuilder.CreateBox(`${id}-door`, { width: 2.5, height: 0.18, depth: 1.65 }, this.scene);
            door.parent = hinge;
            door.position = new Vector3(0, 0, -0.75);
            door.material = shellMaterial;
            door.checkCollisions = true;
            openRotation = new Vector3(1.28, 0, 0);
            for (let index = 0; index < 3; index += 1) {
                const loot = MeshBuilder.CreateBox(`${id}-loot-${index}`, { width: 0.45 + index * 0.12, height: 0.22, depth: 0.34 }, this.scene);
                loot.parent = root;
                loot.position = new Vector3(-0.52 + index * 0.52, 0.38 + (index % 2) * 0.12, 0.04);
                loot.rotation.y = index * 0.42;
                loot.material = contentsMaterial;
                loot.isPickable = false;
                loot.setEnabled(false);
                contents.push(loot);
            }
        }
        else {
            makePart("back", { width: 1.65, height: 3.2, depth: 0.14 }, new Vector3(0, 1.6, 0.48));
            makePart("left", { width: 0.14, height: 3.2, depth: 1.05 }, new Vector3(-0.76, 1.6, 0));
            makePart("right", { width: 0.14, height: 3.2, depth: 1.05 }, new Vector3(0.76, 1.6, 0));
            makePart("top", { width: 1.65, height: 0.14, depth: 1.05 }, new Vector3(0, 3.13, 0));
            makePart("bottom", { width: 1.65, height: 0.14, depth: 1.05 }, new Vector3(0, 0.07, 0), innerMaterial);
            makePart("shelf-a", { width: 1.42, height: 0.1, depth: 0.82 }, new Vector3(0, 1.08, 0), innerMaterial);
            makePart("shelf-b", { width: 1.42, height: 0.1, depth: 0.82 }, new Vector3(0, 2.05, 0), innerMaterial);
            hinge = new TransformNode(`${id}-hinge`, this.scene);
            hinge.parent = root;
            hinge.position = new Vector3(-0.77, 0, -0.54);
            door = MeshBuilder.CreateBox(`${id}-door`, { width: 1.52, height: 3.05, depth: 0.12 }, this.scene);
            door.parent = hinge;
            door.position = new Vector3(0.76, 1.6, 0);
            door.material = shellMaterial;
            door.checkCollisions = true;
            openRotation = new Vector3(0, 1.45, 0);
            for (let index = 0; index < 3; index += 1) {
                const loot = MeshBuilder.CreateBox(`${id}-loot-${index}`, { width: 0.68, height: 0.22, depth: 0.42 }, this.scene);
                loot.parent = root;
                loot.position = new Vector3(0, 0.48 + index * 0.93, -0.05);
                loot.material = contentsMaterial;
                loot.isPickable = false;
                loot.setEnabled(false);
                contents.push(loot);
            }
        }
        const handle = MeshBuilder.CreateBox(`${id}-handle`, { width: 0.36, height: 0.13, depth: 0.14 }, this.scene);
        handle.parent = door;
        handle.position = kind === "chest" ? new Vector3(0, -0.12, -0.78) : new Vector3(0.48, 0, -0.1);
        handle.material = this.materials.solid(`${id}-handle-material`, new Color3(0.4, 0.29, 0.11), 0.42, 0.42);
        handle.isPickable = false;
        const hotspot = MeshBuilder.CreateBox(`${id}-interaction`, {
            width: kind === "chest" ? 3.2 : 2.5,
            height: kind === "chest" ? 2.2 : 3.8,
            depth: kind === "chest" ? 2.6 : 2.2
        }, this.scene);
        hotspot.parent = root;
        hotspot.position = kind === "chest" ? new Vector3(0, 0.9, -0.45) : new Vector3(0, 1.65, -0.55);
        hotspot.visibility = 0;
        hotspot.checkCollisions = false;
        hotspot.metadata = { interactionHotspot: true, lootContainer: id };
        this.lootContainerRigs.set(id, { hinge, door, contents, openRotation });
        this.interaction.register(hotspot, {
            prompt: () => this.lootedContainers.has(id)
                ? "[E] EXAMINAR RECIPIENTE VAZIO"
                : this.openedLootContainers.has(id)
                    ? "[E] RECOLHER SUPRIMENTOS"
                    : kind === "chest" ? "[E] ABRIR BAÚ" : "[E] ABRIR ARMÁRIO",
            maxDistance: 4.8,
            priority: -0.5,
            ignoreLineOfSight: true,
            onInteract: () => {
                if (!this.openedLootContainers.has(id)) {
                    this.openedLootContainers.add(id);
                    hinge.rotation.copyFrom(openRotation);
                    door.checkCollisions = false;
                    contents.forEach((mesh) => mesh.setEnabled(!this.lootedContainers.has(id)));
                    this.audio.impact(kind === "chest" ? 0.48 : 0.36);
                    this.ui.showDocument(kind === "chest" ? "BAÚ DE SUPRIMENTOS" : "ARMÁRIO DE EMERGÊNCIA", `${contentsText}\n\nPressione E novamente ou Esc para fechar.`);
                    return;
                }
                if (this.lootedContainers.has(id)) {
                    this.ui.toast("Não restou nada útil aqui.", 1200);
                    return;
                }
                this.lootedContainers.add(id);
                contents.forEach((mesh) => mesh.setEnabled(false));
                onLoot();
                this.audio.pickup();
            }
        });
    }
    createCheckpointStations() {
        const stations = [
            ["survival-exterior", new Vector3(-24.5, 0.05, 28), new Vector3(-21.2, 0.12, 28), "ESTACIONAMENTO"],
            ["survival-lobby", new Vector3(5.8, 0.05, 53), new Vector3(2.2, 0.12, 53), "LOBBY"],
            ["survival-maintenance", new Vector3(-16.5, 0.05, 96), new Vector3(-13.1, 0.12, 96), "MANUTENÇÃO"],
            ["survival-puzzles", new Vector3(0, 0.05, 121), new Vector3(0, 0.12, 117.2), "ALA DO CORPO"],
            ["survival-auditorium", new Vector3(-12.8, 0.05, 144.5), new Vector3(-9.1, 0.12, 144.5), "AUDITÓRIO"],
            ["survival-modeling", new Vector3(9.5, 0.05, 252), new Vector3(5.5, 0.12, 252), "MODELAGEM"],
            ["survival-machine", new Vector3(11.5, 0.05, 350), new Vector3(7.4, 0.12, 350), "MÁQUINA CENTRAL"],
            ["survival-daniel", new Vector3(-10.5, 0.05, 751), new Vector3(-6.8, 0.12, 751), "SALA DE DANIEL"],
            ["survival-generators", new Vector3(11.5, 0.05, 866), new Vector3(7.5, 0.12, 866), "ALA DOS GERADORES"],
            ["survival-prison", new Vector3(-9.5, 0.05, 1165), new Vector3(-5.7, 0.12, 1165), "POSTO DA PRISÃO"],
            ["survival-identity", new Vector3(10.5, 0.05, 1332), new Vector3(6.5, 0.12, 1332), "TESTES DE IDENTIDADE"],
            ["survival-archives", new Vector3(-10.5, 0.05, 1554), new Vector3(-6.5, 0.12, 1554), "ARQUIVOS"],
            ["survival-bridge", new Vector3(8.5, 8.05, 1947), new Vector3(4.5, 8.2, 1947), "PONTE DE MANUTENÇÃO"]
        ];
        stations.forEach(([id, position, respawnPosition, label], index) => {
            // Checkpoints are landmarks, not obstacles. Respawning at the station's
            // centre used to put the player inside the post/base collider.
            this.survivalCheckpointPositions.set(id, respawnPosition.clone());
            const root = new TransformNode(`${id}-root`, this.scene);
            root.position.copyFrom(position);
            const base = MeshBuilder.CreateCylinder(`${id}-base`, { height: 0.28, diameter: 1.4, tessellation: 16 }, this.scene);
            base.parent = root;
            base.position.y = 0.14;
            base.material = this.materials.get("metal", index);
            base.checkCollisions = false;
            base.metadata = { checkpointDecoration: true, interactionPassthrough: true };
            const post = MeshBuilder.CreateCylinder(`${id}-post`, { height: 1.8, diameter: 0.28, tessellation: 10 }, this.scene);
            post.parent = root;
            post.position.y = 1.12;
            post.material = this.materials.get("metal", index + 2);
            post.checkCollisions = false;
            post.metadata = { checkpointDecoration: true, interactionPassthrough: true };
            const beacon = MeshBuilder.CreateSphere(`${id}-beacon`, { diameter: 0.5, segments: 12 }, this.scene);
            beacon.parent = root;
            beacon.position.y = 2.12;
            beacon.material = this.materials.emissive(`${id}-beacon-material`, new Color3(0.14, 0.58, 0.78), 1.6);
            beacon.isPickable = false;
            const hotspot = MeshBuilder.CreateCylinder(`${id}-interaction`, { height: 2.8, diameter: 2.5, tessellation: 12 }, this.scene);
            hotspot.parent = root;
            hotspot.position.y = 1.25;
            hotspot.visibility = 0;
            hotspot.checkCollisions = false;
            this.interaction.register(hotspot, {
                prompt: () => this.activatedCheckpoints.has(id) ? "[E] SALVAR E RECUPERAR" : "[E] ATIVAR CHECKPOINT",
                maxDistance: 4.2,
                ignoreLineOfSight: true,
                priority: -0.8,
                excludeFromGuide: true,
                onInteract: () => {
                    this.activatedCheckpoints.add(id);
                    this.player.health = 100;
                    this.player.addArmor(12);
                    this.callbacks.onCheckpointActivated(id, respawnPosition.clone());
                    this.ui.showDocument("CHECKPOINT ATIVADO", `${label}\n\nProgresso salvo. Vida restaurada e uma pequena camada de proteção foi aplicada.\n\nPressione E novamente ou Esc para fechar.`);
                }
            });
        });
    }
    getSurvivalCheckpointPosition(id) {
        return this.survivalCheckpointPositions.get(id)?.clone() ?? null;
    }
    nearestUnsolvedPuzzleCheckpoint() {
        const candidates = ["hands", "eyes", "heart", "feet"]
            .filter((id) => !this.solvedPuzzles.has(id))
            .map((id) => this.checkpoints[id])
            .sort((a, b) => Vector3.Distance(a, this.player.collider.position) - Vector3.Distance(b, this.player.collider.position));
        return (candidates[0] ?? this.checkpoints.auditorium).clone();
    }
    createAtmosphere() {
        this.scene.fogMode = 3;
        this.scene.fogDensity = 0.009;
        this.scene.fogColor = new Color3(0.035, 0.038, 0.045);
        const rainTexture = new DynamicTexture("rain-particle", { width: 8, height: 32 }, this.scene, false);
        const context = rainTexture.getContext();
        context.clearRect(0, 0, 8, 32);
        const gradient = context.createLinearGradient(4, 0, 4, 32);
        gradient.addColorStop(0, "rgba(190,210,230,0)");
        gradient.addColorStop(0.4, "rgba(190,210,230,.7)");
        gradient.addColorStop(1, "rgba(190,210,230,0)");
        context.fillStyle = gradient;
        context.fillRect(3, 0, 2, 32);
        rainTexture.update();
        const emitter = new TransformNode("rain-emitter", this.scene);
        emitter.position = new Vector3(0, 17, 14);
        const rain = new ParticleSystem("procedural-rain", 900, this.scene);
        rain.particleTexture = rainTexture;
        rain.emitter = emitter;
        rain.minEmitBox = new Vector3(-36, 0, -30);
        rain.maxEmitBox = new Vector3(36, 0, 30);
        rain.direction1 = new Vector3(-1, -35, 0.5);
        rain.direction2 = new Vector3(1, -28, -0.5);
        rain.minLifeTime = 0.5;
        rain.maxLifeTime = 0.85;
        rain.minSize = 0.06;
        rain.maxSize = 0.12;
        rain.emitRate = 850;
        rain.color1 = new Color4(0.58, 0.67, 0.74, 0.42);
        rain.color2 = new Color4(0.75, 0.82, 0.87, 0.25);
        rain.gravity = new Vector3(0, -7, 0);
        rain.start();
    }
    solvePuzzle(id) {
        if (this.solvedPuzzles.has(id))
            return;
        this.solvedPuzzles.add(id);
        this.audio.objective();
        this.ui.toast(`PARTE ATIVADA: ${id.toUpperCase()}`);
        if (this.solvedPuzzles.size >= 4) {
            this.openAuditorium();
            this.objective.set("enter-auditorium", "ENTRE NO AUDITÓRIO.");
        }
        else {
            this.objective.set("solve-body-puzzles", `ATIVE AS QUATRO PARTES DO CORPO PARA ABRIR O AUDITÓRIO. (${this.solvedPuzzles.size}/4)`);
        }
        this.callbacks.onPuzzleSolved(id);
    }
    openAuditorium() {
        if (this.auditoriumOpened)
            return;
        this.auditoriumOpened = true;
        this.auditoriumDoor.checkCollisions = false;
        this.auditoriumDoor.position.y = 8.55;
        this.setDoorwayBlocked(this.auditoriumDoorBlocker, false);
        this.audio.impact(1.1);
    }
    updatePowerObjective() {
        const ids = ["panelKey", "fuse", "cable", "crank"];
        const found = ids.filter((id) => this.inventory.has(id)).length;
        this.objective.set("restore-power", `RESTAURE A ELETRICIDADE. PEÇAS ENCONTRADAS: ${found}/4.`);
    }
    enableFacilityLights(enabled) {
        this.scene.lights.filter((light) => light.name.startsWith("facility-light")).forEach((light) => light.setEnabled(enabled));
    }
    updateEyeBeams() {
        this.audio.objective();
        const total = this.eyesAngles.reduce((sum, value) => sum + value, 0);
        const light = this.scene.getLightByName("facility-light-eyes");
        if (light)
            light.intensity = 0.6 + total * 0.22;
    }
    createRoomShell(name, center, width, depth, height, floorKind, roof, openings = ["north", "south", "east", "west"]) {
        const floor = MeshBuilder.CreateBox(`${name}-floor`, { width, height: 0.2, depth }, this.scene);
        floor.position = center.add(new Vector3(0, -0.055, 0));
        floor.material = this.materials.floor(floorKind, Math.floor(center.z));
        floor.isVisible = true;
        floor.visibility = 1;
        floor.checkCollisions = true;
        floor.receiveShadows = true;
        floor.metadata = { ...(floor.metadata ?? {}), interactionPassthrough: true };
        const foundation = MeshBuilder.CreateBox(`${name}-floor-foundation`, { width, height: 0.42, depth }, this.scene);
        foundation.position = center.add(new Vector3(0, -0.31, 0));
        foundation.material = this.materials.solid("chapter1-floor-foundation", new Color3(0.055, 0.06, 0.065), 1);
        foundation.isPickable = false;
        foundation.checkCollisions = false;
        foundation.metadata = { interactionPassthrough: true };
        const wallKind = floorKind === "wood" ? "wood" : floorKind === "metal" ? "metal" : "concrete";
        const wallMaterial = this.materials.get(wallKind, Math.floor(center.x + center.z));
        const wallThickness = 0.45;
        const doorwayWidth = Math.min(4.2, Math.min(width, depth) * 0.38);
        const doorwayHeight = Math.min(3.7, height - 0.8);
        const makeWall = (wallName, position, size) => {
            if (size.width <= 0.02 || size.height <= 0.02 || size.depth <= 0.02)
                return;
            const mesh = MeshBuilder.CreateBox(wallName, size, this.scene);
            mesh.position = position;
            mesh.material = wallMaterial;
            mesh.checkCollisions = true;
            mesh.receiveShadows = true;
            mesh.metadata = { roomWall: true, room: name };
        };
        const makeHorizontalWall = (side, z) => {
            if (!openings.includes(side)) {
                makeWall(`${name}-${side}-wall`, new Vector3(center.x, height / 2, z), { width, height, depth: wallThickness });
                return;
            }
            const segmentWidth = (width - doorwayWidth) / 2;
            makeWall(`${name}-${side}-left`, new Vector3(center.x - doorwayWidth / 2 - segmentWidth / 2, height / 2, z), { width: segmentWidth, height, depth: wallThickness });
            makeWall(`${name}-${side}-right`, new Vector3(center.x + doorwayWidth / 2 + segmentWidth / 2, height / 2, z), { width: segmentWidth, height, depth: wallThickness });
            makeWall(`${name}-${side}-lintel`, new Vector3(center.x, doorwayHeight + (height - doorwayHeight) / 2, z), { width: doorwayWidth, height: height - doorwayHeight, depth: wallThickness });
        };
        const makeVerticalWall = (side, x) => {
            if (!openings.includes(side)) {
                makeWall(`${name}-${side}-wall`, new Vector3(x, height / 2, center.z), { width: wallThickness, height, depth });
                return;
            }
            const segmentDepth = (depth - doorwayWidth) / 2;
            makeWall(`${name}-${side}-south`, new Vector3(x, height / 2, center.z - doorwayWidth / 2 - segmentDepth / 2), { width: wallThickness, height, depth: segmentDepth });
            makeWall(`${name}-${side}-north`, new Vector3(x, height / 2, center.z + doorwayWidth / 2 + segmentDepth / 2), { width: wallThickness, height, depth: segmentDepth });
            makeWall(`${name}-${side}-lintel`, new Vector3(x, doorwayHeight + (height - doorwayHeight) / 2, center.z), { width: wallThickness, height: height - doorwayHeight, depth: doorwayWidth });
        };
        makeHorizontalWall("south", center.z - depth / 2);
        makeHorizontalWall("north", center.z + depth / 2);
        makeVerticalWall("west", center.x - width / 2);
        makeVerticalWall("east", center.x + width / 2);
        if (roof) {
            const ceiling = MeshBuilder.CreateBox(`${name}-roof`, { width, height: 0.28, depth }, this.scene);
            ceiling.position = center.add(new Vector3(0, height, 0));
            ceiling.material = this.materials.get(wallKind === "wood" ? "wood" : "concrete", Math.floor(center.z));
            ceiling.checkCollisions = true;
            ceiling.receiveShadows = true;
            ceiling.metadata = { interactionPassthrough: true, roomCeiling: true };
        }
        const light = new PointLight(`facility-light-${name.replace("-shell", "")}`, center.add(new Vector3(0, height - 0.6, 0)), this.scene);
        light.diffuse = new Color3(0.86, 0.78, 0.62);
        light.intensity = name.startsWith("exterior") ? 0.2 : 0;
        light.range = Math.max(width, depth) * 0.9;
    }
    createCorridor(name, center, width, depth, material, doorways = {}) {
        const floor = MeshBuilder.CreateBox(`${name}-floor`, { width, height: 0.2, depth }, this.scene);
        floor.position = center.add(new Vector3(0, -0.055, 0));
        floor.material = this.materials.floor(material, Math.floor(center.z));
        floor.isVisible = true;
        floor.visibility = 1;
        floor.checkCollisions = true;
        floor.receiveShadows = true;
        floor.metadata = { ...(floor.metadata ?? {}), interactionPassthrough: true };
        const foundation = MeshBuilder.CreateBox(`${name}-floor-foundation`, { width, height: 0.42, depth }, this.scene);
        foundation.position = center.add(new Vector3(0, -0.31, 0));
        foundation.material = this.materials.solid("chapter1-floor-foundation", new Color3(0.055, 0.06, 0.065), 1);
        foundation.isPickable = false;
        foundation.checkCollisions = false;
        foundation.metadata = { interactionPassthrough: true };
        const corridorHeight = 5.5;
        const doorwayWidth = 4.2;
        const wallThickness = 0.35;
        const wallMaterial = this.materials.get("concrete", Math.floor(center.z));
        const minZ = center.z - depth / 2;
        const maxZ = center.z + depth / 2;
        const createSegmentedSide = (side, x, gaps) => {
            const sorted = gaps
                .map((gapCenter) => ({ start: Math.max(minZ, gapCenter - doorwayWidth / 2), end: Math.min(maxZ, gapCenter + doorwayWidth / 2) }))
                .filter((gap) => gap.end > minZ && gap.start < maxZ)
                .sort((a, b) => a.start - b.start);
            let cursor = minZ;
            let segmentIndex = 0;
            for (const gap of sorted) {
                if (gap.start > cursor + 0.05) {
                    const segmentDepth = gap.start - cursor;
                    const wall = MeshBuilder.CreateBox(`${name}-${side}-wall-${segmentIndex}`, { width: wallThickness, height: corridorHeight, depth: segmentDepth }, this.scene);
                    wall.position = new Vector3(x, corridorHeight / 2, cursor + segmentDepth / 2);
                    wall.material = wallMaterial;
                    wall.checkCollisions = true;
                    wall.metadata = { corridorWall: true, corridor: name };
                    segmentIndex += 1;
                }
                const lintelHeight = corridorHeight - 3.7;
                if (lintelHeight > 0.1) {
                    const lintel = MeshBuilder.CreateBox(`${name}-${side}-lintel-${segmentIndex}`, { width: wallThickness, height: lintelHeight, depth: gap.end - gap.start }, this.scene);
                    lintel.position = new Vector3(x, 3.7 + lintelHeight / 2, (gap.start + gap.end) / 2);
                    lintel.material = wallMaterial;
                    lintel.checkCollisions = true;
                    lintel.metadata = { corridorWall: true, corridor: name };
                }
                cursor = Math.max(cursor, gap.end);
            }
            if (cursor < maxZ - 0.05) {
                const segmentDepth = maxZ - cursor;
                const wall = MeshBuilder.CreateBox(`${name}-${side}-wall-${segmentIndex}`, { width: wallThickness, height: corridorHeight, depth: segmentDepth }, this.scene);
                wall.position = new Vector3(x, corridorHeight / 2, cursor + segmentDepth / 2);
                wall.material = wallMaterial;
                wall.checkCollisions = true;
                wall.metadata = { corridorWall: true, corridor: name };
            }
        };
        createSegmentedSide("left", center.x - width / 2, doorways.left ?? []);
        createSegmentedSide("right", center.x + width / 2, doorways.right ?? []);
        const ceiling = MeshBuilder.CreateBox(`${name}-ceiling`, { width, height: 0.28, depth }, this.scene);
        ceiling.position = center.add(new Vector3(0, corridorHeight, 0));
        ceiling.material = wallMaterial;
        ceiling.checkCollisions = true;
        ceiling.receiveShadows = true;
        ceiling.metadata = { interactionPassthrough: true, corridorCeiling: true };
        const light = new PointLight(`facility-light-${name}`, center.add(new Vector3(0, 4.7, 0)), this.scene);
        light.diffuse = new Color3(0.75, 0.72, 0.62);
        light.intensity = 0;
        light.range = 18;
    }
    createTextSign(name, text, position, width, height, color) {
        const plane = MeshBuilder.CreatePlane(name, { width, height }, this.scene);
        plane.position.copyFrom(position);
        plane.rotation.y = 0;
        const texture = new DynamicTexture(`${name}-texture`, { width: 1024, height: 256 }, this.scene, false);
        const context = texture.getContext();
        context.fillStyle = "#d8ccb0";
        context.fillRect(0, 0, 1024, 256);
        context.fillStyle = color.toHexString();
        context.font = "bold 82px Georgia";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, 512, 128, 960);
        for (let i = 0; i < 500; i += 1) {
            context.fillStyle = `rgba(30,20,12,${Math.random() * 0.08})`;
            context.fillRect(Math.random() * 1024, Math.random() * 256, Math.random() * 7, Math.random() * 3);
        }
        texture.update();
        const material = this.materials.solid(`${name}-material`, new Color3(1, 1, 1), 0.8).clone(`${name}-clone`);
        material.albedoTexture = texture;
        material.backFaceCulling = false;
        plane.material = material;
        plane.isPickable = false;
        return plane;
    }
    createSmallPlush(name, position, scale, variant) {
        const root = new TransformNode(name, this.scene);
        root.position.copyFrom(position);
        root.scaling.setAll(scale);
        const body = MeshBuilder.CreateSphere(`${name}-body`, { diameter: 1, segments: 8 }, this.scene);
        body.parent = root;
        body.position.y = 0.55;
        body.scaling = new Vector3(0.72, 0.95, 0.55);
        body.material = this.materials.get("plush", variant);
        const head = MeshBuilder.CreateSphere(`${name}-head`, { diameter: 0.72, segments: 8 }, this.scene);
        head.parent = root;
        head.position.y = 1.25;
        head.material = this.materials.get("plush", variant);
        for (const side of [-1, 1]) {
            const eye = MeshBuilder.CreateCylinder(`${name}-button-${side}`, { height: 0.06, diameter: 0.13, tessellation: 10 }, this.scene);
            eye.parent = head;
            eye.position = new Vector3(side * 0.18, 0.08, -0.34);
            eye.rotation.x = Math.PI / 2;
            eye.material = this.materials.solid("toy-button", new Color3(0.025, 0.02, 0.015), 0.35);
        }
        return root;
    }
}
