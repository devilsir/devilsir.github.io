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
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";
import type { InteractionSystem } from "../systems/InteractionSystem";
import type { Inventory, InventoryItem } from "../systems/Inventory";
import type { ObjectiveSystem } from "../systems/ObjectiveSystem";
import type { GameUI } from "../ui/GameUI";
import type { AudioManager } from "../systems/AudioManager";
import type { FireSystem } from "../systems/FireSystem";
import type { PlayerController } from "../core/PlayerController";
import type { ProceduralMaterials } from "./ProceduralMaterials";
import type { GameSettings } from "../systems/Settings";
import type { Chapter4SaveData, EquipmentChoiceState } from "../systems/SaveSystem";
import { MimicEntity, type MimicIdentity } from "../entities/MimicEntity";
import { MimicBoss, type MimicEvidenceId } from "../entities/MimicBoss";

export const CHAPTER4_ITEMS: Record<string, InventoryItem> = {
  evidenceTag: { id: "evidenceTag", name: "Etiqueta de evidência", description: "Etiqueta do depósito prisional marcada com o número do protagonista." },
  archivePass: { id: "archivePass", name: "Passe dos arquivos", description: "Chave analógica para os níveis centrais de registro." }
};

export interface Chapter4Callbacks {
  onCheckpoint: (checkpoint: string) => void;
  onChapterComplete: () => void;
  onPlayerDamaged: () => void;
  onReturnMenu: () => void;
  onEndingDiscovered: (endingId: string) => void;
}

type Chapter4Phase = "waking" | "escape" | "floor" | "choice" | "preboss" | "boss" | "postboss" | "complete";
type FloorSymbol = "circle" | "triangle" | "cross";

interface FloorTile {
  mesh: Mesh;
  symbol: FloorSymbol;
  index: number;
  row: number;
  column: number;
  crack: number;
  collapsed: boolean;
  falling: boolean;
  originalY: number;
}

interface DoorRig {
  mesh: Mesh;
  blocker: Mesh;
  base: Vector3;
  slide: Vector3;
  open: boolean;
}

interface BarrierRig {
  mesh: Mesh;
  base: Vector3;
  offset: Vector3;
  deployed: boolean;
}

interface FalseVoiceCue {
  id: string;
  position: Vector3;
  speaker: string;
  text: string;
  variant: "call" | "cry" | "intercom" | "chorus";
  radius: number;
  played: boolean;
}

interface PreBossEncounter {
  id: string;
  position: Vector3;
  identity: MimicIdentity;
  evidence: MimicEvidenceId;
  triggered: boolean;
}

export class Chapter4World {
  public readonly checkpoints: Record<string, Vector3> = {
    prisonCell: new Vector3(0, 0.12, 1062),
    observationCorridor: new Vector3(0, 0.12, 1090),
    interrogation: new Vector3(-16, 0.12, 1118),
    medical: new Vector3(16, 0.12, 1142),
    guardStation: new Vector3(0, 0.12, 1165),
    fragileFloor: new Vector3(0, 0.12, 1202),
    choice: new Vector3(0, 0.12, 1242),
    equipment: new Vector3(-22, 0.12, 1282),
    blood: new Vector3(22, 0.12, 1282),
    identityTesting: new Vector3(0, 0.12, 1332),
    mimicArena: new Vector3(0, 0.12, 1388),
    archives: new Vector3(0, 0.12, 1432),
    chapter5: new Vector3(0, 0.12, 1470)
  };

  public active = false;
  public phase: Chapter4Phase = "waking";
  public prisonEscaped = false;
  public fragileFloorSolved = false;
  public equipmentChoice: EquipmentChoiceState = "undecided";
  public badEndingDiscovered = false;
  public chapterComplete = false;

  private readonly scene: Scene;
  private readonly materials: ProceduralMaterials;
  private readonly interaction: InteractionSystem;
  private readonly inventory: Inventory;
  private readonly objective: ObjectiveSystem;
  private readonly ui: GameUI;
  private readonly audio: AudioManager;
  private readonly fire: FireSystem;
  private readonly player: PlayerController;
  private readonly callbacks: Chapter4Callbacks;
  private readonly root: TransformNode;
  private settings: GameSettings;
  private readonly mimic: MimicEntity;
  private readonly boss: MimicBoss;
  private readonly escapeMechanism = [false, false, false, false];
  private readonly falseVoiceEvents = new Set<string>();
  private readonly recoveredEquipment = new Set<string>();
  private readonly mimicEvidence = new Set<string>();
  private readonly collectedDocuments = new Set<string>();
  private readonly collectedRecordings = new Set<string>();
  private readonly floorTiles: FloorTile[] = [];
  private readonly doors: DoorRig[] = [];
  private readonly barriers: BarrierRig[] = [];
  private readonly falseVoices: FalseVoiceCue[] = [];
  private readonly preBossEncounters: PreBossEncounter[] = [];
  private readonly arenaLights: SpotLight[] = [];
  private readonly arenaPointLights: PointLight[] = [];
  private readonly mirrors: MirrorTexture[] = [];
  private readonly removedLoadout = new Set<string>();
  private floorResetTimer = 0;
  private floorCheckTimer = 0;
  private floorSafeIndex = -1;
  private guardObservationClock = 0;
  private guardWindowOpen = false;
  private falseVoiceClock = 2;
  private currentVoiceIndex = 0;
  private choiceLocked = false;
  private bloodEncounterClock = -1;
  private badEndingActive = false;
  private bossGate!: Mesh;
  private archiveGate!: Mesh;
  private loosePanel!: Mesh;
  private intercom!: Mesh;
  private observationLever!: Mesh;
  private mechanicalLock!: Mesh;
  private maintenanceDoor!: Mesh;
  private maintenanceDoorBlocker!: Mesh;
  private equipmentLocker!: Mesh;
  private bloodTrapDoor!: Mesh;
  private bodyInspectMesh!: Mesh;
  private archiveExitConsole!: Mesh;
  private arenaMirrorRefreshClock = 0;
  private corruptionClock = 0;
  private lastSafeCheckpoint = "prisonCell";
  private chapterExitTriggered = false;
  private equipmentRecovered = false;

  public constructor(
    scene: Scene,
    materials: ProceduralMaterials,
    interaction: InteractionSystem,
    inventory: Inventory,
    objective: ObjectiveSystem,
    ui: GameUI,
    audio: AudioManager,
    fire: FireSystem,
    player: PlayerController,
    settings: GameSettings,
    callbacks: Chapter4Callbacks
  ) {
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
    this.root = new TransformNode("chapter4-root", scene);
    this.mimic = new MimicEntity(scene, materials, audio);
    this.boss = new MimicBoss(
      scene,
      this.mimic,
      materials,
      player,
      fire,
      audio,
      ui,
      settings,
      this.checkpoints.mimicArena,
      {
        onCheckpoint: (state, phase) => {
          this.phase = "boss";
          this.callbacks.onCheckpoint(`mimic-${state}-${phase}`);
        },
        onPlayerDamaged: (amount, caption) => this.damagePlayer(amount, caption),
        onArenaEvent: (event) => this.handleArenaEvent(event),
        onDefeated: () => this.onBossApparentlyDefeated(),
        onStopped: (stats) => this.onBossStopped(stats)
      }
    );
  }

  public build(): void {
    this.createConnectedPrison();
    this.createPrisonCellEscape();
    this.createObservationAndInterrogation();
    this.createFragileFloorPuzzle();
    this.createChoiceRoutes();
    this.createPreBossEncounters();
    this.createMimicArena();
    this.createDocumentsAndRecordings();
    this.createFalseVoiceCues();
    this.root.setEnabled(false);
    this.mimic.setVisible(false);
  }

  public startFromTransition(): void {
    this.active = true;
    this.phase = "waking";
    this.root.setEnabled(true);
    this.player.setEnabled(false);
    this.stripEquipment();
    this.fire.torchLit = false;
    this.audio.stopMusicBoxTheme();
    this.audio.stopJesseMelody();
    this.audio.startPrisonDrone();
    this.player.teleport(this.checkpoints.prisonCell.clone(), Math.PI);
    this.objective.set("wake-prison", "DESCUBRA ONDE VOCÊ ESTÁ.");
    this.callbacks.onCheckpoint("prisonCell");
    this.lastSafeCheckpoint = "prisonCell";
    window.setTimeout(() => {
      this.player.setEnabled(true);
      this.phase = "escape";
      this.ui.showSubtitle("Voz de Maya", "Você acordou? Não olha para o vidro. Só abre a porta.", 5200);
      this.audio.falseVoice("call", this.checkpoints.observationCorridor.add(new Vector3(0, 1.5, 0)), 0.72);
      this.falseVoiceEvents.add("wake-maya");
      this.objective.set("escape-cell", "ESCAPE DA CELA SEM SEU EQUIPAMENTO.");
      this.ui.toast("Você não está com a tocha nem com o porrete.", 3600);
    }, 1500);
  }

  public enableForDebug(): void {
    this.active = true;
    this.root.setEnabled(true);
    this.player.setEnabled(true);
    this.audio.startPrisonDrone();
  }

  public restore(progress: Chapter4SaveData, checkpoint: string): void {
    this.active = true;
    this.root.setEnabled(true);
    this.prisonEscaped = progress.prisonEscaped;
    progress.escapeMechanism.forEach((value, index) => this.escapeMechanism[index] = value ?? false);
    this.falseVoiceEvents.clear();
    progress.falseVoiceEvents.forEach((id) => this.falseVoiceEvents.add(id));
    this.fragileFloorSolved = progress.fragileFloorSolved;
    const collapsed = new Set(progress.fragileFloorTiles);
    this.floorTiles.forEach((tile) => {
      tile.collapsed = collapsed.has(tile.index);
      tile.falling = false;
      tile.mesh.position.y = tile.collapsed ? -8 : tile.originalY;
      tile.mesh.checkCollisions = !tile.collapsed;
      tile.mesh.isVisible = !tile.collapsed;
    });
    this.equipmentChoice = progress.equipmentChoice;
    this.badEndingDiscovered = progress.badEndingDiscovered;
    this.recoveredEquipment.clear();
    progress.recoveredEquipment.forEach((id) => this.recoveredEquipment.add(id));
    this.mimicEvidence.clear();
    progress.mimicEvidence.forEach((id) => this.mimicEvidence.add(id));
    this.collectedDocuments.clear();
    progress.collectedDocuments.forEach((id) => this.collectedDocuments.add(id));
    this.collectedRecordings.clear();
    progress.collectedRecordings.forEach((id) => this.collectedRecordings.add(id));
    this.chapterComplete = progress.chapterComplete;
    this.equipmentRecovered = this.equipmentChoice === "recovered";
    this.boss.restoreEvidence(progress.mimicEvidence);
    this.applyRestoredEnvironment();

    if (this.chapterComplete) this.phase = "complete";
    else if (progress.bossState !== "not-started") this.phase = progress.bossState === "stopped" || progress.bossState === "complete" ? "postboss" : "boss";
    else if (this.equipmentChoice === "recovered") this.phase = "preboss";
    else if (this.fragileFloorSolved) this.phase = "choice";
    else if (this.prisonEscaped) this.phase = "floor";
    else this.phase = "escape";

    const destination = this.destinationForCheckpoint(checkpoint);
    this.player.teleport(destination, Math.PI);
    this.player.setEnabled(!this.chapterComplete);
    this.lastSafeCheckpoint = checkpoint;
    this.audio.startPrisonDrone();
    if (this.equipmentRecovered) this.restoreEquipmentFromProgress();
    else this.stripEquipment();

    if (this.phase === "escape") this.objective.set("escape-cell", "ESCAPE DA CELA SEM SEU EQUIPAMENTO.");
    else if (this.phase === "floor") this.objective.set("cross-fragile-floor", "ATRAVESSE O PISO DE TESTE.");
    else if (this.phase === "choice") this.objective.set("choose-route", "DECIDA ENTRE RECUPERAR O EQUIPAMENTO OU SEGUIR O RASTRO DE SANGUE.");
    else if (this.phase === "preboss") this.objective.set("identify-mimic", "REÚNA EVIDÊNCIAS PARA IDENTIFICAR AS FALSAS IDENTIDADES.");
    else if (this.phase === "boss") {
      this.objective.set("defeat-mimic", "SOBREVIVA AO TESTE DE IDENTIDADE.");
      this.boss.start(progress.bossState, progress.bossHealth, progress.identityRoundsCompleted, true);
    } else if (this.phase === "postboss") {
      this.boss.start(progress.bossState, 0, progress.identityRoundsCompleted, true);
      this.archiveGate.position.copyFrom(this.archiveGate.position.add(new Vector3(4.4, 0, 0)));
      this.archiveGate.checkCollisions = false;
      this.objective.set("search-mimic-remains", "PROCURE UMA ROTA PARA OS ARQUIVOS.");
    }
    this.boss.restorePostDefeatStats(
      progress.postDefeatAttackCount,
      progress.postDefeatStopTime,
      progress.inspectedBody,
      progress.attemptedImmediateExit
    );
    if (progress.bossState === "post-defeat") this.onBossApparentlyDefeated();
  }

  public serialize(): Chapter4SaveData {
    return {
      prisonEscaped: this.prisonEscaped,
      escapeMechanism: [...this.escapeMechanism],
      falseVoiceEvents: [...this.falseVoiceEvents],
      fragileFloorTiles: this.floorTiles.filter((tile) => tile.collapsed).map((tile) => tile.index),
      fragileFloorSolved: this.fragileFloorSolved,
      equipmentChoice: this.equipmentChoice,
      badEndingDiscovered: this.badEndingDiscovered,
      recoveredEquipment: [...this.recoveredEquipment],
      mimicEvidence: [...new Set([...this.mimicEvidence, ...this.boss.getDiscoveredEvidence()])],
      identityRoundsCompleted: this.boss.identityRoundsCompleted,
      bossState: this.boss.state,
      bossHealth: this.boss.health,
      postDefeatAttackCount: this.boss.postDefeatAttackCount,
      postDefeatStopTime: this.boss.postDefeatStopTime,
      inspectedBody: this.boss.inspectedBody,
      attemptedImmediateExit: this.boss.attemptedImmediateExit,
      chapterComplete: this.chapterComplete,
      collectedDocuments: [...this.collectedDocuments],
      collectedRecordings: [...this.collectedRecordings]
    };
  }

  public destinationForCheckpoint(checkpoint: string): Vector3 {
    if (this.checkpoints[checkpoint]) return this.checkpoints[checkpoint]!.clone();
    if (checkpoint.startsWith("mimic-")) return this.checkpoints.mimicArena.clone();
    if (checkpoint === "floor-complete") return this.checkpoints.choice.clone();
    if (checkpoint === "equipment-recovered") return this.checkpoints.identityTesting.clone();
    if (checkpoint === "bad-ending-retry") return this.checkpoints.choice.clone();
    if (checkpoint === "chapter5-transition") return this.checkpoints.chapter5.clone();
    return this.checkpoints.prisonCell.clone();
  }

  public update(deltaSeconds: number): void {
    if (!this.active) return;
    this.guardObservationClock += deltaSeconds;
    this.falseVoiceClock -= deltaSeconds;
    this.floorCheckTimer -= deltaSeconds;
    this.arenaMirrorRefreshClock -= deltaSeconds;
    this.corruptionClock += deltaSeconds;
    this.mimic.update(deltaSeconds);
    this.boss.update(deltaSeconds);
    this.updateObservationWindow();
    this.updateFalseVoices();
    this.updateFloorTiles(deltaSeconds);
    this.updateBloodEncounter(deltaSeconds);
    this.updatePreBossEncounters();
    this.updateArenaMirrors();
    this.updateAreaProgression();
  }

  public applySettings(settings: GameSettings): void {
    this.settings = settings;
    this.boss.applySettings(settings);
  }

  public canUseTorch(): boolean {
    return this.active && this.equipmentRecovered && this.inventory.has("replacementTorch");
  }

  public handlePrimaryAttack(charged: boolean): boolean {
    if (!this.active || !this.inventory.has("metalClub")) return false;
    const staminaCost = charged ? 36 : 18;
    if (!this.player.consumeStamina(staminaCost)) {
      this.ui.toast("Você precisa recuperar o fôlego.");
      return true;
    }
    this.audio.clubSwing(charged);
    if (this.phase === "boss" || this.boss.isPostDefeat()) return this.boss.handleAttack(charged, this.fire.torchLit);
    const ray = this.player.camera.getForwardRay(charged ? 3.1 : 2.45);
    const pick = this.scene.pickWithRay(ray, (mesh: AbstractMesh) => mesh.isPickable && mesh.isVisible && mesh !== this.player.collider);
    if (pick?.hit && pick.pickedPoint) {
      const material = pick.pickedMesh?.name.includes("metal") ? "metal" : "concrete";
      this.audio.clubImpact(pick.pickedPoint, material, charged);
    }
    return true;
  }

  public handleContextAction(): boolean {
    if (!this.active) return false;
    if (this.phase === "boss") return this.boss.handleTacticalAction("defend");
    return false;
  }

  public handleTacticalAction(action: string): boolean {
    return this.boss.handleTacticalAction(action);
  }

  public resetFragileFloor(): void {
    this.floorResetTimer = 0;
    this.floorTiles.forEach((tile) => {
      tile.collapsed = false;
      tile.falling = false;
      tile.crack = 0;
      tile.mesh.position.y = tile.originalY;
      tile.mesh.isVisible = true;
      tile.mesh.checkCollisions = true;
    });
    this.player.teleport(this.checkpoints.fragileFloor.add(new Vector3(0, 0, -13)), 0);
    this.ui.toast("Piso frágil reiniciado.");
  }

  public revealFloorSolution(): void {
    this.floorTiles.forEach((tile) => {
      if (tile.symbol === "circle") tile.mesh.visibility = 1;
      else tile.mesh.visibility = 0.35;
    });
    this.ui.toast("Círculos destacados temporariamente.");
    window.setTimeout(() => this.floorTiles.forEach((tile) => tile.mesh.visibility = 1), 4200);
  }

  public triggerBadEnding(): void {
    this.enableForDebug();
    this.equipmentChoice = "blood";
    this.player.teleport(this.checkpoints.blood.clone(), Math.PI);
    this.beginBadEnding();
  }

  public grantEquipment(): void {
    this.enableForDebug();
    this.recoverEquipment();
  }

  public previewMimicIdentity(identity: MimicIdentity): void {
    this.enableForDebug();
    this.player.teleport(this.checkpoints.mimicArena.add(new Vector3(0, 0, -7)), 0);
    this.boss.previewIdentity(identity);
  }

  public forceIdentityInconsistency(evidence: MimicEvidenceId): void {
    this.enableForDebug();
    this.boss.revealEvidence(evidence);
    this.mimicEvidence.add(evidence);
  }

  public startBossPhase(phase: number): void {
    this.enableForDebug();
    this.equipmentRecovered = true;
    this.restoreEquipmentFromProgress();
    this.player.teleport(this.checkpoints.mimicArena.add(new Vector3(0, 0, -8)), 0);
    this.phase = "boss";
    this.boss.start("identities", 100, 0);
    this.boss.forcePhase(phase);
  }

  public setPostDefeatAttackCount(count: number): void {
    this.boss.setPostDefeatAttackCount(count);
  }

  public inspectEndingFlags(): string {
    return `badEnding=${this.badEndingDiscovered} equipment=${this.equipmentChoice} postAttacks=${this.boss.postDefeatAttackCount} stopTime=${this.boss.postDefeatStopTime.toFixed(2)} inspected=${this.boss.inspectedBody} immediateExit=${this.boss.attemptedImmediateExit}`;
  }

  public inspectState(): string {
    return [
      `chapter4 active=${this.active} phase=${this.phase} escaped=${this.prisonEscaped}`,
      `escape=${this.escapeMechanism.join(",")} floor=${this.fragileFloorSolved} collapsed=${this.floorTiles.filter((tile) => tile.collapsed).length}`,
      `choice=${this.equipmentChoice} badEnding=${this.badEndingDiscovered} equipment=${[...this.recoveredEquipment].join(",")}`,
      `evidence=${[...this.mimicEvidence].join(",")}`,
      this.boss.inspectState()
    ].join("\n");
  }

  private createConnectedPrison(): void {
    const concrete = this.materials.get("concrete", 31);
    const tile = this.materials.get("tile", 24);
    const metal = this.materials.get("metal", 28);
    this.createRoomShell("prison-cell-shell", new Vector3(0, 0, 1062), 12, 14, 5.4, concrete, tile, ["north"]);
    this.createCorridor("observation-corridor-shell", new Vector3(0, 0, 1090), 8, 42, concrete, concrete);
    this.createRoomShell("interrogation-shell", new Vector3(-16, 0, 1118), 22, 20, 5.8, concrete, tile, ["east"]);
    this.createRoomShell("medical-shell", new Vector3(16, 0, 1142), 24, 24, 6.2, concrete, tile, ["west"]);
    this.createRoomShell("guard-station-shell", new Vector3(0, 0, 1165), 28, 22, 6.2, concrete, concrete, ["south", "north"]);
    this.createCorridor("floor-access-shell", new Vector3(0, 0, 1183), 8, 22, concrete, metal);
    this.createRoomShell("fragile-floor-shell", new Vector3(0, -0.25, 1205), 30, 34, 9, concrete, concrete, ["south", "north"]);
    this.createCorridor("choice-spine-shell", new Vector3(0, 0, 1242), 10, 34, concrete, tile);
    this.createCorridor("equipment-route-shell", new Vector3(-22, 0, 1282), 9, 58, concrete, metal);
    this.createCorridor("blood-route-shell", new Vector3(22, 0, 1282), 9, 58, concrete, tile);
    this.createRoomShell("identity-testing-shell", new Vector3(0, 0, 1332), 42, 28, 7.2, concrete, tile, ["south", "north", "east", "west"]);
    this.createCorridor("boss-access-shell", new Vector3(0, 0, 1354), 10, 24, concrete, metal);
    this.createRoomShell("mimic-arena-shell", new Vector3(0, 0, 1388), 48, 48, 11, concrete, metal, ["south", "north"]);
    this.createCorridor("archive-route-shell", new Vector3(0, 0, 1425), 10, 36, concrete, concrete);
    this.createRoomShell("archive-threshold-shell", new Vector3(0, 0, 1450), 24, 20, 6.4, concrete, tile, ["south", "north"]);

    this.createProceduralSign("prison-sign", "SETOR DE VISITANTES PERMANENTES", new Vector3(0, 3.7, 1080), Math.PI, 6.8, 1.25, true);
    this.createProceduralSign("floor-sign", "TESTE DE CARGA · NÃO CONFIAR NA PRIMEIRA LEITURA", new Vector3(-9.5, 3.5, 1190), Math.PI / 2, 5.8, 1.05, true);
    this.createProceduralSign("choice-sign-a", "EVIDÊNCIAS / EQUIPAMENTO APREENDIDO", new Vector3(-5.4, 2.8, 1250), Math.PI / 2, 5.2, 0.9, false);
    this.createProceduralSign("choice-sign-b", "TRIAGEM MÉDICA", new Vector3(5.4, 2.8, 1250), -Math.PI / 2, 4.4, 0.9, false);

    for (let index = 0; index < 28; index += 1) {
      const bar = MeshBuilder.CreateCylinder(`prison-bar-${index}`, { height: 4.5, diameter: 0.11, tessellation: 8 }, this.scene);
      bar.parent = this.root;
      bar.position = new Vector3(-5.2 + (index % 14) * 0.8, 2.25, 1070 + Math.floor(index / 14) * 39);
      bar.material = metal;
      bar.checkCollisions = true;
    }
    for (let index = 0; index < 16; index += 1) {
      const drain = MeshBuilder.CreateBox(`prison-drain-${index}`, { width: 0.34, height: 0.03, depth: 1.8 }, this.scene);
      drain.parent = this.root;
      drain.position = new Vector3(index % 2 ? -3.8 : 3.8, 0.03, 1080 + index * 20);
      drain.material = metal;
      drain.isPickable = false;
    }
    this.createBloodAndFluidTraces();
  }

  private createPrisonCellEscape(): void {
    const metal = this.materials.get("metal", 33);
    const concrete = this.materials.get("concrete", 34);
    const observationLight = new PointLight("cell-observation-light", new Vector3(0, 3.8, 1076), this.scene);
    observationLight.parent = this.root;
    observationLight.diffuse = new Color3(0.76, 0.82, 0.74);
    observationLight.intensity = 4.2;
    observationLight.range = 18;
    this.loosePanel = MeshBuilder.CreateBox("loose-wall-panel", { width: 1.6, height: 1.2, depth: 0.16 }, this.scene);
    this.loosePanel.parent = this.root;
    this.loosePanel.position = new Vector3(-4.85, 1.1, 1060);
    this.loosePanel.material = concrete;
    this.interaction.register(this.loosePanel, {
      prompt: () => this.escapeMechanism[0] ? "O painel já está solto" : "E · Forçar painel solto",
      enabled: () => this.active && !this.escapeMechanism[0],
      onInteract: () => {
        this.escapeMechanism[0] = true;
        this.loosePanel.rotation.z = -0.34;
        this.loosePanel.position.x += 0.35;
        this.audio.impact(0.4);
        this.ui.toast("Atrás do painel: um fio de intercomunicação e uma haste curta.");
        this.objective.set("repair-intercom", "USE O FIO SOLTO NO INTERCOMUNICADOR.");
      }
    });

    this.intercom = MeshBuilder.CreateBox("damaged-intercom", { width: 0.8, height: 1.1, depth: 0.22 }, this.scene);
    this.intercom.parent = this.root;
    this.intercom.position = new Vector3(4.82, 1.6, 1063);
    this.intercom.material = metal;
    this.interaction.register(this.intercom, {
      prompt: () => !this.escapeMechanism[0] ? "O intercomunicador não recebe energia" : this.escapeMechanism[1] ? "O intercomunicador repete uma respiração" : "E · Conectar fio ao intercomunicador",
      enabled: () => this.active && this.escapeMechanism[0] === true && this.escapeMechanism[1] !== true,
      onInteract: () => {
        this.escapeMechanism[1] = true;
        this.audio.electricalBurst(this.intercom.position);
        this.audio.falseVoice("intercom", this.intercom.position, 0.8);
        this.ui.showSubtitle("Voz de Daniel", "Quando a luz apagar, puxa a alavanca. Não espera por mim.", 5000);
        this.falseVoiceEvents.add("cell-intercom-daniel");
        this.objective.set("observe-guard", "OBSERVE O CORREDOR E ACIONE A ALAVANCA DURANTE A FALHA DE LUZ.");
      }
    });

    this.observationLever = MeshBuilder.CreateBox("observation-timing-lever", { width: 0.22, height: 0.9, depth: 0.22 }, this.scene);
    this.observationLever.parent = this.root;
    this.observationLever.position = new Vector3(4.72, 1.25, 1067.1);
    this.observationLever.material = metal;
    this.interaction.register(this.observationLever, {
      prompt: () => this.escapeMechanism[2] ? "A trava de observação está liberada" : this.guardWindowOpen ? "E · Puxar alavanca enquanto o observador não vê" : "A luz do corredor ainda está acesa",
      enabled: () => this.active && this.escapeMechanism[1] === true && this.escapeMechanism[2] !== true && this.guardWindowOpen,
      onInteract: () => {
        this.escapeMechanism[2] = true;
        this.observationLever.rotation.x = -0.8;
        this.audio.impact(0.3);
        this.ui.showSoundCaption("um obturador analógico se fecha atrás do vidro");
        this.objective.set("open-cell-lock", "USE A HASTE NO MECANISMO DA PORTA.");
      }
    });

    this.mechanicalLock = MeshBuilder.CreateCylinder("cell-mechanical-lock", { height: 0.32, diameter: 0.62, tessellation: 12 }, this.scene);
    this.mechanicalLock.parent = this.root;
    this.mechanicalLock.rotation.z = Math.PI / 2;
    this.mechanicalLock.position = new Vector3(0.9, 1.25, 1069.1);
    this.mechanicalLock.material = metal;
    this.interaction.register(this.mechanicalLock, {
      prompt: () => this.escapeMechanism[3] ? "A porta está destravada" : "E · Girar mecanismo com a haste",
      enabled: () => this.active && this.escapeMechanism[2] === true && this.escapeMechanism[3] !== true,
      onInteract: () => {
        this.escapeMechanism[3] = true;
        this.mechanicalLock.rotation.x += Math.PI * 0.75;
        this.openDoor(this.doors.find((door) => door.mesh.name === "cell-door")!);
        this.audio.impact(0.65);
        this.objective.set("find-maintenance-route", "ENCONTRE A PASSAGEM DE MANUTENÇÃO ATRÁS DA OBSERVAÇÃO.");
      }
    });

    const cellDoor = this.createDoor("cell-door", new Vector3(0, 2.3, 1069), new Vector3(4.6, 0, 0));
    this.maintenanceDoor = MeshBuilder.CreateBox("maintenance-route-door", { width: 2.2, height: 3.7, depth: 0.24 }, this.scene);
    this.maintenanceDoor.parent = this.root;
    this.maintenanceDoor.position = new Vector3(-4.9, 1.85, 1087);
    this.maintenanceDoor.material = metal;
    this.maintenanceDoor.checkCollisions = true;
    this.maintenanceDoorBlocker = this.createDoorFrame("maintenance-route", this.maintenanceDoor.position.clone(), 2.2, 3.7, 0, 4.2, 5.8);
    this.interaction.register(this.maintenanceDoor, {
      prompt: "E · Empurrar passagem de manutenção",
      enabled: () => this.active && this.escapeMechanism.every(Boolean) && !this.prisonEscaped,
      onInteract: () => {
        this.prisonEscaped = true;
        this.phase = "floor";
        this.maintenanceDoor.position.y = 5.95;
        this.maintenanceDoor.checkCollisions = false;
        this.maintenanceDoorBlocker.setEnabled(false);
        this.maintenanceDoorBlocker.checkCollisions = false;
        this.audio.impact(0.55);
        this.callbacks.onCheckpoint("observationCorridor");
        this.lastSafeCheckpoint = "observationCorridor";
        this.objective.set("cross-fragile-floor", "ENCONTRE UMA ROTA PELO SETOR DE TESTE.");
      }
    });
    cellDoor.open = false;
  }

  private createObservationAndInterrogation(): void {
    const glass = this.materials.get("glass", 29);
    const metal = this.materials.get("metal", 35);
    const tile = this.materials.get("tile", 30);
    for (let index = 0; index < 8; index += 1) {
      const window = MeshBuilder.CreateBox(`observation-window-${index}`, { width: 2.6, height: 1.4, depth: 0.08 }, this.scene);
      window.parent = this.root;
      window.position = new Vector3(index % 2 ? -4.05 : 4.05, 2.1, 1080 + index * 6.2);
      window.material = glass;
      window.isPickable = false;
    }
    for (let index = 0; index < 4; index += 1) {
      const table = MeshBuilder.CreateBox(`interrogation-table-${index}`, { width: 3.2, height: 0.14, depth: 1.25 }, this.scene);
      table.parent = this.root;
      table.position = new Vector3(-20 + (index % 2) * 8, 1.05, 1115 + Math.floor(index / 2) * 7);
      table.material = metal;
      table.checkCollisions = true;
      const chair = MeshBuilder.CreateBox(`restraint-chair-${index}`, { width: 0.7, height: 1.25, depth: 0.7 }, this.scene);
      chair.parent = this.root;
      chair.position = table.position.add(new Vector3(0, -0.35, 1.8));
      chair.material = tile;
      chair.checkCollisions = true;
    }
    for (let index = 0; index < 6; index += 1) {
      const restraint = MeshBuilder.CreateCapsule(`medical-restraint-${index}`, { height: 2.3, radius: 0.2, tessellation: 9 }, this.scene);
      restraint.parent = this.root;
      restraint.position = new Vector3(10 + (index % 3) * 5.5, 1.2, 1137 + Math.floor(index / 3) * 7);
      restraint.rotation.z = Math.PI / 2;
      restraint.material = metal;
      restraint.checkCollisions = true;
    }
    for (let index = 0; index < 13; index += 1) {
      const mark = MeshBuilder.CreateBox(`child-height-mark-${index}`, { width: 0.65, height: 0.025, depth: 0.025 }, this.scene);
      mark.parent = this.root;
      mark.position = new Vector3(27.6, 0.75 + index * 0.18, 1135);
      mark.material = this.materials.solid(`height-mark-mat-${index}`, new Color3(0.44, 0.08, 0.06), 0.9);
      mark.isPickable = false;
    }
  }

  private createFragileFloorPuzzle(): void {
    const tileMaterial = this.materials.get("tile", 32);
    const hiddenBase = this.scene.meshes.find((mesh: AbstractMesh) => mesh.name === "fragile-floor-shell-floor");
    if (hiddenBase) {
      hiddenBase.position.y = -10;
      hiddenBase.checkCollisions = false;
      hiddenBase.isVisible = false;
    }
    const pit = MeshBuilder.CreateBox("fragile-floor-pit", { width: 30, height: 0.5, depth: 34 }, this.scene);
    pit.parent = this.root;
    pit.position = new Vector3(0, -8.5, 1205);
    pit.material = this.materials.get("concrete", 132);
    pit.checkCollisions = true;
    pit.isPickable = false;
    const symbols: FloorSymbol[] = [
      "circle", "triangle", "cross", "triangle", "circle", "cross",
      "circle", "circle", "triangle", "cross", "triangle", "circle",
      "triangle", "circle", "circle", "triangle", "cross", "triangle",
      "cross", "triangle", "circle", "circle", "triangle", "cross",
      "triangle", "cross", "circle", "triangle", "circle", "triangle",
      "cross", "triangle", "circle", "circle", "circle", "circle"
    ];
    const startX = -10;
    const startZ = 1194;
    for (let row = 0; row < 6; row += 1) {
      for (let column = 0; column < 6; column += 1) {
        const index = row * 6 + column;
        const mesh = MeshBuilder.CreateBox(`fragile-floor-tile-${index}`, { width: 3.2, height: 0.28, depth: 3.2 }, this.scene);
        mesh.parent = this.root;
        mesh.position = new Vector3(startX + column * 4, 0, startZ + row * 4);
        mesh.material = tileMaterial;
        mesh.checkCollisions = true;
        const symbol = symbols[index] ?? "cross";
        this.drawFloorSymbol(mesh, symbol, index);
        this.floorTiles.push({ mesh, symbol, index, row, column, crack: 0, collapsed: false, falling: false, originalY: mesh.position.y });
      }
    }
    const cluePositions = [
      { text: "O RESULTADO CORRE DA DIREITA PARA A ESQUERDA NO VIDRO.", position: new Vector3(-13.9, 3.2, 1198), rotation: Math.PI / 2 },
      { text: "CÍRCULOS SUPORTAM. TRIÂNGULOS AVISAM. CRUZES NÃO ESPERAM.", position: new Vector3(13.9, 3.2, 1205), rotation: -Math.PI / 2 },
      { text: "A CRIANÇA DESENHOU O CAMINHO COMO VIA NO ESPELHO.", position: new Vector3(0, 4.5, 1219), rotation: 0 }
    ];
    cluePositions.forEach((clue, index) => this.createProceduralSign(`floor-clue-${index}`, clue.text, clue.position, clue.rotation, 7.5, 1.1, false));
    this.createDamagedReflectivePanel(new Vector3(0, 2.8, 1190.3), new Vector3(0, 0, 1), 8, 3.6, 0);
    this.createProjectorSlideClue();
  }

  private createChoiceRoutes(): void {
    const metal = this.materials.get("metal", 38);
    this.createDoor("equipment-route-door", new Vector3(-22, 2.2, 1310), new Vector3(4.4, 0, 0));
    this.equipmentLocker = MeshBuilder.CreateBox("evidence-equipment-locker", { width: 4.6, height: 4.2, depth: 1.3 }, this.scene);
    this.equipmentLocker.parent = this.root;
    this.equipmentLocker.position = new Vector3(-22, 2.1, 1303);
    this.equipmentLocker.material = metal;
    this.equipmentLocker.checkCollisions = true;
    this.interaction.register(this.equipmentLocker, {
      prompt: () => this.equipmentRecovered ? "O armário de evidências está vazio" : "E · Recuperar equipamento apreendido",
      enabled: () => this.active && this.fragileFloorSolved && !this.equipmentRecovered,
      onInteract: () => this.recoverEquipment()
    });

    for (let index = 0; index < 7; index += 1) {
      const crate = MeshBuilder.CreateBox(`evidence-crate-${index}`, { width: 2.1, height: 1.2 + (index % 2) * 0.4, depth: 1.5 }, this.scene);
      crate.parent = this.root;
      crate.position = new Vector3(-25 + (index % 3) * 3.3, 0.7, 1262 + Math.floor(index / 3) * 8.5);
      crate.material = index % 2 ? this.materials.get("wood", 31 + index) : metal;
      crate.checkCollisions = true;
    }

    for (let index = 0; index < 13; index += 1) {
      const drop = MeshBuilder.CreateCylinder(`blood-drop-${index}`, { height: 0.015, diameter: 0.22 + (index % 3) * 0.12, tessellation: 14 }, this.scene);
      drop.parent = this.root;
      drop.position = new Vector3(22 + Math.sin(index) * 0.7, 0.02, 1255 + index * 4.3);
      drop.material = this.materials.solid(`blood-drop-mat-${index}`, new Color3(0.22, 0.018, 0.015), 0.55);
      drop.isPickable = false;
    }
    this.bloodTrapDoor = this.createDoor("blood-trap-door", new Vector3(22, 2.2, 1306), new Vector3(0, 0, -4.4)).mesh;
  }

  private createPreBossEncounters(): void {
    this.preBossEncounters.push(
      { id: "maya-reflection", position: new Vector3(-12, 0, 1328), identity: "maya", evidence: "mirrored-hand", triggered: false },
      { id: "daniel-recording", position: new Vector3(12, 0, 1328), identity: "daniel", evidence: "wrong-memory", triggered: false },
      { id: "employee-breath", position: new Vector3(0, 0, 1340), identity: "employee", evidence: "shared-breath", triggered: false }
    );
    this.createDamagedReflectivePanel(new Vector3(-16.5, 2.4, 1328), new Vector3(1, 0, 0), 5.4, 3.2, 1);
    this.createDamagedReflectivePanel(new Vector3(16.5, 2.4, 1328), new Vector3(-1, 0, 0), 5.4, 3.2, 2);
    const footprintMaterial = this.materials.solid("mimic-footprints", new Color3(0.12, 0.09, 0.08), 0.88);
    for (let index = 0; index < 16; index += 1) {
      const foot = MeshBuilder.CreateBox(`mimic-footprint-${index}`, { width: 0.25, height: 0.012, depth: 0.55 }, this.scene);
      foot.parent = this.root;
      foot.position = new Vector3(-3 + (index % 2) * 0.5, 0.018, 1318 + index * 1.5);
      foot.rotation.y = index % 2 ? -0.12 : 0.12;
      foot.material = footprintMaterial;
      foot.isPickable = false;
    }
  }

  private createMimicArena(): void {
    const metal = this.materials.get("metal", 42);
    const glass = this.materials.get("glass", 38);
    const tile = this.materials.get("tile", 39);
    this.bossGate = this.createDoor("mimic-boss-gate", new Vector3(0, 2.6, 1364), new Vector3(5.2, 0, 0)).mesh;
    this.archiveGate = this.createDoor("archive-gate", new Vector3(0, 2.6, 1412), new Vector3(5.2, 0, 0)).mesh;
    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * Math.PI * 2;
      const platform = MeshBuilder.CreateCylinder(`restraint-platform-${index}`, { height: 0.42, diameter: 3.2, tessellation: 18 }, this.scene);
      platform.parent = this.root;
      platform.position = this.checkpoints.mimicArena.add(new Vector3(Math.sin(angle) * 15, 0.21, Math.cos(angle) * 15));
      platform.material = metal;
      platform.checkCollisions = true;
      const restraint = MeshBuilder.CreateCapsule(`hanging-body-${index}`, { height: 3.6, radius: 0.42, tessellation: 12 }, this.scene);
      restraint.parent = this.root;
      restraint.position = platform.position.add(new Vector3(0, 3.8, 0));
      restraint.material = index % 3 === 0 ? this.materials.get("plush", 21 + index) : index % 3 === 1 ? this.materials.get("plastic", 20 + index) : tile;
      restraint.isPickable = false;
      const cable = MeshBuilder.CreateCylinder(`hanging-cable-${index}`, { height: 3.2, diameter: 0.08, tessellation: 7 }, this.scene);
      cable.parent = this.root;
      cable.position = restraint.position.add(new Vector3(0, 3.2, 0));
      cable.material = metal;
      cable.isPickable = false;
    }
    for (let index = 0; index < 6; index += 1) {
      const angle = (index / 6) * Math.PI * 2;
      const light = new SpotLight(
        `mimic-arena-spot-${index}`,
        this.checkpoints.mimicArena.add(new Vector3(Math.sin(angle) * 17, 8.5, Math.cos(angle) * 17)),
        new Vector3(-Math.sin(angle), -0.75, -Math.cos(angle)),
        Math.PI / 4,
        2,
        this.scene
      );
      light.parent = this.root;
      light.diffuse = index % 2 ? new Color3(0.84, 0.22, 0.18) : new Color3(0.72, 0.78, 0.88);
      light.intensity = 5.5;
      light.range = 34;
      this.arenaLights.push(light);
    }
    for (let index = 0; index < 4; index += 1) {
      const barrier = MeshBuilder.CreateBox(`mimic-barrier-${index}`, { width: 5.2, height: 2.4, depth: 0.35 }, this.scene);
      barrier.parent = this.root;
      barrier.position = this.checkpoints.mimicArena.add(new Vector3(index < 2 ? -8 : 8, 1.2, index % 2 ? -6 : 6));
      barrier.material = metal;
      barrier.checkCollisions = true;
      this.barriers.push({ mesh: barrier, base: barrier.position.clone(), offset: new Vector3(0, -2.5, 0), deployed: true });
    }
    for (let index = 0; index < 4; index += 1) {
      const position = this.checkpoints.mimicArena.add(new Vector3(index % 2 ? 21.2 : -21.2, 3.4, index < 2 ? -8 : 8));
      const normal = new Vector3(index % 2 ? -1 : 1, 0, 0);
      this.createArenaMirror(position, normal, 7.4, 5.1, index);
    }
    for (let index = 0; index < 5; index += 1) {
      const speaker = MeshBuilder.CreateCylinder(`arena-speaker-${index}`, { height: 0.5, diameter: 1.1, tessellation: 14 }, this.scene);
      speaker.parent = this.root;
      speaker.rotation.x = Math.PI / 2;
      speaker.position = this.checkpoints.mimicArena.add(new Vector3(-14 + index * 7, 6.5, -20.5));
      speaker.material = metal;
      speaker.isPickable = false;
    }
    for (let index = 0; index < 6; index += 1) {
      const projector = MeshBuilder.CreateBox(`memory-projector-${index}`, { width: 1.3, height: 1, depth: 2.2 }, this.scene);
      projector.parent = this.root;
      projector.position = this.checkpoints.mimicArena.add(new Vector3(-17 + index * 6.8, 4.4, 19.5));
      projector.material = metal;
      projector.isPickable = false;
      const beam = new SpotLight(`memory-projector-light-${index}`, projector.position, new Vector3(0, -0.12, -1), Math.PI / 5, 2, this.scene);
      beam.parent = this.root;
      beam.diffuse = new Color3(0.72, 0.76, 0.66);
      beam.intensity = 1.2;
      beam.range = 28;
      this.arenaLights.push(beam);
    }
    this.createArenaEvidenceStations();

    this.bodyInspectMesh = MeshBuilder.CreateCylinder("mimic-body-inspection-zone", { height: 0.08, diameter: 4.2, tessellation: 24 }, this.scene);
    this.bodyInspectMesh.parent = this.root;
    this.bodyInspectMesh.position = this.checkpoints.mimicArena.add(new Vector3(0, 0.05, 1.5));
    this.bodyInspectMesh.material = glass;
    this.bodyInspectMesh.visibility = 0.04;
    this.bodyInspectMesh.isPickable = true;
    this.interaction.register(this.bodyInspectMesh, {
      prompt: "E · Examinar o corpo imóvel",
      enabled: () => this.active && this.boss.isPostDefeat(),
      onInteract: () => this.boss.inspectBody(),
      maxDistance: 3.8
    });

    this.archiveExitConsole = MeshBuilder.CreateBox("archive-exit-console", { width: 1.1, height: 1.5, depth: 0.7 }, this.scene);
    this.archiveExitConsole.parent = this.root;
    this.archiveExitConsole.position = new Vector3(4.2, 1.1, 1411.5);
    this.archiveExitConsole.material = metal;
    this.interaction.register(this.archiveExitConsole, {
      prompt: () => this.boss.isPostDefeat() ? "E · Abrir rota dos arquivos" : "O sistema de identidade mantém a saída bloqueada",
      enabled: () => this.active && (this.boss.isPostDefeat() || this.phase === "postboss"),
      onInteract: () => {
        if (this.boss.isPostDefeat()) {
          this.boss.attemptLeave();
          return;
        }
        this.openArchiveRoute();
      }
    });
  }

  private createArenaEvidenceStations(): void {
    const metal = this.materials.get("metal", 47);
    const stations: Array<{ id: MimicEvidenceId; label: string; position: Vector3 }> = [
      { id: "mirrored-hand", label: "ANALISAR GESTO NO ESPELHO", position: new Vector3(-15, 1.2, 1381) },
      { id: "wrong-memory", label: "COMPARAR COM O GRAVADOR", position: new Vector3(15, 1.2, 1381) },
      { id: "shared-breath", label: "ISOLAR PADRÃO DE RESPIRAÇÃO", position: new Vector3(0, 1.2, 1371) },
      { id: "missing-reflection", label: "ROTACIONAR LUZ DE REFLEXO", position: new Vector3(-15, 1.2, 1397) },
      { id: "mixed-clothing", label: "PROJETAR DETALHE DE ROUPA", position: new Vector3(15, 1.2, 1397) }
    ];
    stations.forEach((station, index) => {
      const console = MeshBuilder.CreateBox(`mimic-evidence-console-${station.id}`, { width: 1.4, height: 1.45, depth: 0.9 }, this.scene);
      console.parent = this.root;
      console.position = station.position;
      console.material = metal;
      this.interaction.register(console, {
        prompt: `E · ${station.label}`,
        enabled: () => this.active && this.phase === "boss",
        onInteract: () => {
          this.mimicEvidence.add(station.id);
          this.boss.revealEvidence(station.id);
          this.audio.electricalBurst(console.position);
          const light = this.arenaLights[index % this.arenaLights.length];
          if (light) light.intensity = 9;
          window.setTimeout(() => { if (light) light.intensity = 5.5; }, 900);
        }
      });
    });
  }

  private createDocumentsAndRecordings(): void {
    this.createDocument(
      "permanent-visitors",
      "VISITANTES PERMANENTES · NORMA 6",
      "O visitante que demonstra retenção de identidade após o terceiro teste não deverá retornar ao setor público. O termo permanente descreve permanência de observação, não hospedagem.",
      new Vector3(-5.3, 1.1, 1098)
    );
    this.createDocument(
      "floor-test-record",
      "REGISTRO DE PISO 17-B",
      "Os símbolos foram fotografados através do vidro de observação. A sequência registrada no prontuário está invertida. Não corrigir a cópia infantil: ela é a única representação fiel ao ponto de vista do sujeito.",
      new Vector3(10.6, 1.2, 1188)
    );
    this.createDocument(
      "identity-protocol",
      "PROTOCOLO DE IDENTIDADE",
      "Perguntas pessoais não são suficientes. Confirmar dominância manual, direção da voz, sincronia respiratória, reflexo ocular e continuidade de vestuário. Uma resposta correta pode ser reproduzida; um corpo coerente é mais difícil.",
      new Vector3(-18, 1.15, 1318)
    );
    this.createDocument(
      "mimic-postmortem",
      "OBSERVAÇÃO PÓS-COLAPSO",
      "A interrupção voluntária do estímulo agressivo produz respostas diferentes da exaustão física. Registrar número de repetições, tempo de cessação e tentativa de inspeção. Não informar ao sujeito que o teste continua após a queda.",
      new Vector3(18, 1.15, 1402)
    );
    const recorder = MeshBuilder.CreateBox("prison-recording-private-phrases", { width: 0.65, height: 0.25, depth: 0.9 }, this.scene);
    recorder.parent = this.root;
    recorder.position = new Vector3(14, 1, 1150);
    recorder.material = this.materials.get("plastic", 33);
    this.interaction.register(recorder, {
      prompt: "E · Ouvir fita do interrogatório",
      enabled: () => this.active,
      onInteract: () => {
        this.collectedRecordings.add("private-phrases");
        this.audio.falseVoice("chorus", recorder.position, 0.7);
        this.ui.showSubtitle("Vozes sobrepostas", "Você sempre conta até três antes de abrir uma porta. Um. Dois. Dois. Três.", 6200);
        this.ui.showSoundCaption("todas as vozes inspiram no mesmo instante", 4200);
        this.mimicEvidence.add("shared-breath");
      }
    });
  }

  private createFalseVoiceCues(): void {
    this.falseVoices.push(
      { id: "maya-behind-wall", position: new Vector3(-5, 1.5, 1105), speaker: "Maya", text: "É por aqui. Eu lembro deste corredor.", variant: "call", radius: 9, played: false },
      { id: "daniel-impossible", position: new Vector3(18, 1.5, 1138), speaker: "Daniel", text: "Não pega o porrete. Eu ainda estou usando.", variant: "intercom", radius: 10, played: false },
      { id: "child-cry", position: new Vector3(0, 1.1, 1175), speaker: "Criança", text: "O círculo cai. A cruz é segura. O círculo cai.", variant: "cry", radius: 10, played: false },
      { id: "protagonist-voice", position: new Vector3(8, 1.5, 1238), speaker: "Sua voz", text: "Segue o sangue. Você já decidiu.", variant: "call", radius: 11, played: false },
      { id: "chorus-route", position: new Vector3(0, 1.5, 1308), speaker: "Vozes", text: "Maya está viva. Daniel está vivo. Você está vivo. Repete.", variant: "chorus", radius: 13, played: false }
    );
  }

  private updateObservationWindow(): void {
    const cycle = this.guardObservationClock % 5.6;
    const open = cycle > 4.15;
    if (open !== this.guardWindowOpen) {
      this.guardWindowOpen = open;
      const light = this.scene.getLightByName("cell-observation-light");
      if (light) light.intensity = open ? 0.08 : 4.2;
      if (this.escapeMechanism[1] && !this.escapeMechanism[2] && open) this.ui.showSoundCaption("a lâmpada de observação apaga por um instante");
    }
  }

  private updateFalseVoices(): void {
    for (const cue of this.falseVoices) {
      if (cue.played || this.falseVoiceEvents.has(cue.id)) continue;
      if (Vector3.Distance(this.player.collider.position, cue.position) > cue.radius) continue;
      cue.played = true;
      this.falseVoiceEvents.add(cue.id);
      this.audio.falseVoice(cue.variant, cue.position, cue.variant === "chorus" ? 0.82 : 0.68);
      this.ui.showSubtitle(cue.speaker, cue.text, cue.variant === "chorus" ? 5700 : 4300);
      if (cue.id === "child-cry") this.ui.showSoundCaption("a voz termina com uma palavra reproduzida ao contrário");
      if (cue.id === "protagonist-voice") this.ui.showSoundCaption("sua própria voz vem de duas paredes diferentes");
    }
    if (this.falseVoiceClock > 0 || this.phase === "boss" || this.phase === "complete") return;
    this.falseVoiceClock = 10 + Math.random() * 9;
    const positions = [this.checkpoints.interrogation, this.checkpoints.medical, this.checkpoints.choice];
    const position = positions[this.currentVoiceIndex % positions.length] ?? this.checkpoints.observationCorridor;
    this.currentVoiceIndex += 1;
    this.audio.falseVoice(this.currentVoiceIndex % 2 ? "call" : "cry", position, 0.38);
    if (Math.random() < 0.45) this.ui.showSoundCaption("uma voz conhecida chama de um ponto impossível");
  }

  private updateFloorTiles(deltaSeconds: number): void {
    for (const tile of this.floorTiles) {
      if (tile.falling) {
        tile.mesh.position.y -= deltaSeconds * 9;
        tile.mesh.rotation.x += deltaSeconds * 1.8;
        if (tile.mesh.position.y < -7) {
          tile.falling = false;
          tile.collapsed = true;
          tile.mesh.isVisible = false;
        }
      }
    }
    if (this.phase !== "floor" || this.fragileFloorSolved || this.floorResetTimer > 0) {
      this.floorResetTimer = Math.max(0, this.floorResetTimer - deltaSeconds);
      return;
    }
    if (this.floorCheckTimer > 0) return;
    this.floorCheckTimer = 0.08;
    const position = this.player.collider.position;
    const tile = this.floorTiles.find((entry) => !entry.collapsed && Math.abs(entry.mesh.position.x - position.x) < 1.6 && Math.abs(entry.mesh.position.z - position.z) < 1.6);
    if (!tile) return;
    if (tile.index === this.floorSafeIndex) return;
    this.floorSafeIndex = tile.index;
    if (tile.symbol === "circle") {
      tile.crack = 0;
      this.audio.footstep("tile");
      return;
    }
    if (tile.symbol === "cross") {
      this.beginTileCollapse(tile, true);
      return;
    }
    tile.crack += 1;
    this.audio.impact(0.22);
    this.ui.showSoundCaption(tile.crack === 1 ? "rachaduras correm sob o triângulo" : "o triângulo está prestes a ceder", 1200);
    const allowed = this.settings.extendedPuzzleWindows ? 3 : 2;
    if (tile.crack >= allowed) this.beginTileCollapse(tile, false);
  }

  private beginTileCollapse(tile: FloorTile, immediate: boolean): void {
    if (tile.falling || tile.collapsed) return;
    tile.falling = true;
    tile.mesh.checkCollisions = false;
    this.audio.impact(immediate ? 0.85 : 0.6);
    this.ui.showSoundCaption(immediate ? "a cruz desaba sem aviso" : "o piso frágil se rompe");
    this.createDustBurst(tile.mesh.position);
    this.floorResetTimer = immediate ? 0.45 : (this.settings.extendedPuzzleWindows ? 1.25 : 0.75);
    window.setTimeout(() => this.failFragileFloor(), Math.round(this.floorResetTimer * 1000));
  }

  private failFragileFloor(): void {
    if (!this.active || this.fragileFloorSolved) return;
    this.ui.flashDamage(0.5);
    this.player.damage(8);
    this.player.teleport(this.checkpoints.fragileFloor.add(new Vector3(0, 0, -13)), 0);
    this.floorSafeIndex = -1;
    this.floorResetTimer = 0.8;
    this.ui.toast("Você se agarra à borda e retorna ao último ponto seguro.", 2600);
  }

  private updateBloodEncounter(deltaSeconds: number): void {
    if (this.bloodEncounterClock < 0) return;
    this.bloodEncounterClock += deltaSeconds;
    if (this.bloodEncounterClock > 0.7 && this.bloodEncounterClock - deltaSeconds <= 0.7) {
      this.audio.falseVoice("chorus", this.checkpoints.blood.add(new Vector3(0, 1.5, 15)), 1);
      this.ui.showSubtitle("Maya", "Você veio sem nada. Eu sabia.", 4200);
      this.closeBloodTrap();
    }
    if (this.bloodEncounterClock > 2.3 && !this.badEndingActive) this.beginBadEnding();
  }

  private updatePreBossEncounters(): void {
    if (this.phase !== "preboss") return;
    for (const encounter of this.preBossEncounters) {
      if (encounter.triggered || Vector3.Distance(this.player.collider.position, encounter.position) > 5.2) continue;
      encounter.triggered = true;
      this.mimic.setVisible(true);
      this.mimic.setPosition(encounter.position.add(new Vector3(0, 0, 2.2)), Math.PI);
      this.mimic.setIdentity(encounter.identity, true);
      if (encounter.identity === "maya") {
        this.mimic.setMayaInjuredPose();
        this.mimic.setReflectionAnomaly("blank", 2.5);
        this.ui.showSubtitle("Maya", "Eu usei a esquerda na alavanca. Sempre uso a esquerda.", 4300);
      } else if (encounter.identity === "daniel") {
        this.ui.showSubtitle("Daniel", "Na fita eu disse que Maya encontrou uma criança.", 4300);
      } else {
        this.ui.showSubtitle("Funcionário", "Todos respiram juntos quando pertencem ao mesmo lugar.", 4300);
      }
      this.audio.falseVoice("identity", encounter.position, 0.8);
      this.ui.showSoundCaption(encounter.identity === "employee" ? "a respiração coincide com as outras vozes" : "a expressão chega depois da fala");
      this.mimicEvidence.add(encounter.evidence);
      this.boss.revealEvidence(encounter.evidence);
      window.setTimeout(() => {
        if (this.phase === "preboss") {
          this.mimic.setVisible(false);
        }
      }, 3900);
    }
  }

  private updateArenaMirrors(): void {
    if (this.arenaMirrorRefreshClock > 0) return;
    this.arenaMirrorRefreshClock = 0.3;
    const distance = Vector3.Distance(this.player.collider.position, this.checkpoints.mimicArena);
    this.mirrors.forEach((mirror) => mirror.refreshRate = distance < 34 ? (this.settings.performancePreset === "performance" ? 3 : 1) : 0);
  }

  private updateAreaProgression(): void {
    const position = this.player.collider.position;
    if (this.phase === "floor" && !this.fragileFloorSolved && position.z > 1218.5) {
      this.fragileFloorSolved = true;
      this.phase = "choice";
      this.callbacks.onCheckpoint("floor-complete");
      this.lastSafeCheckpoint = "floor-complete";
      this.objective.set("choose-route", "DECIDA ENTRE RECUPERAR O EQUIPAMENTO OU SEGUIR O RASTRO DE SANGUE.");
      this.ui.toast("O corredor se divide. O rastro de sangue não passa pelo depósito.", 4300);
    }
    if (this.phase === "choice" && !this.choiceLocked) {
      if (position.x < -10 && position.z > 1254) {
        this.equipmentChoice = "equipment";
        this.choiceLocked = true;
        this.objective.set("recover-equipment", "RECUPERE SEU EQUIPAMENTO NO DEPÓSITO DE EVIDÊNCIAS.");
      } else if (position.x > 10 && position.z > 1254) {
        this.equipmentChoice = "blood";
        this.choiceLocked = true;
        this.objective.set("follow-blood", "SIGA O RASTRO DE SANGUE.");
      }
    }
    if (!this.equipmentRecovered && this.bloodEncounterClock < 0 && position.z > 1294 && position.x > 12) {
      this.equipmentChoice = "blood";
      this.choiceLocked = true;
      this.bloodEncounterClock = 0;
      this.player.setEnabled(false);
    }
    if (this.phase === "preboss" && position.z > 1350 && this.equipmentRecovered) this.beginBoss();
    if (this.phase === "postboss" && position.z > 1442 && !this.chapterExitTriggered) this.finishChapter();
  }

  private recoverEquipment(): void {
    this.equipmentChoice = "recovered";
    this.equipmentRecovered = true;
    const catalog: Record<string, InventoryItem> = {
      metalClub: { id: "metalClub", name: "Porrete de metal", description: "Pesado, barulhento e útil somente a curta distância." },
      replacementTorch: { id: "replacementTorch", name: "Nova tocha", description: "Tocha de manutenção recuperada do depósito." },
      portableRecorder: { id: "portableRecorder", name: "Gravador portátil", description: "Contém a gravação encontrada junto de Daniel." },
      bodyCard: { id: "bodyCard", name: "Cartão do Corpo", description: "Cartão obtido dentro do nariz de Body." },
      generatorAccessCard: { id: "generatorAccessCard", name: "Cartão de acesso técnico", description: "Autoriza setores de manutenção." },
      metalCan: { id: "metalCan", name: "Lata metálica", description: "Pode produzir uma distração sonora." }
    };
    const recoveryOrder = ["metalClub", "replacementTorch", "portableRecorder", "bodyCard", "generatorAccessCard", "metalCan"];
    recoveryOrder.forEach((id) => {
      this.inventory.add(catalog[id]!);
      this.recoveredEquipment.add(id);
    });
    this.inventory.add(CHAPTER4_ITEMS.evidenceTag!);
    this.fire.addFuel(48);
    this.phase = "preboss";
    this.player.teleport(this.checkpoints.equipment.add(new Vector3(0, 0, 8)), Math.PI);
    this.callbacks.onCheckpoint("equipment-recovered");
    this.lastSafeCheckpoint = "equipment-recovered";
    this.objective.set("identify-mimic", "REÚNA EVIDÊNCIAS PARA IDENTIFICAR AS FALSAS IDENTIDADES.");
    this.ui.toast("Equipamento recuperado. O porrete continua arriscado e barulhento.", 4500);
    this.openRouteToIdentityTesting();
  }

  private beginBadEnding(): void {
    if (this.badEndingActive) return;
    this.badEndingActive = true;
    this.badEndingDiscovered = true;
    this.callbacks.onEndingDiscovered("dead-by-creature");
    this.audio.mimicVoice();
    this.ui.flashDamage(0.9);
    this.ui.showSoundCaption("membros se desenrolam atrás de você");
    window.setTimeout(() => {
      this.ui.showEnding(
        "FINAL: MORTO PELA CRIATURA.",
        "O rastro não levava a Maya. Sem a tocha, o porrete e os cartões, o caminho seguro termina em uma sala sem saída.",
        () => this.retryAfterBadEnding(),
        () => this.callbacks.onReturnMenu()
      );
    }, 950);
  }

  private retryAfterBadEnding(): void {
    this.badEndingActive = false;
    this.bloodEncounterClock = -1;
    this.choiceLocked = false;
    this.equipmentChoice = "undecided";
    this.openBloodTrap();
    this.player.health = Math.max(45, this.player.health);
    this.player.teleport(this.checkpoints.choice.clone(), Math.PI);
    this.player.setEnabled(true);
    this.phase = "choice";
    this.objective.set("choose-route", "DECIDA ENTRE RECUPERAR O EQUIPAMENTO OU SEGUIR O RASTRO DE SANGUE.");
    this.callbacks.onCheckpoint("bad-ending-retry");
  }

  private beginBoss(): void {
    if (this.phase === "boss") return;
    this.phase = "boss";
    this.openDoor(this.doors.find((door) => door.mesh === this.bossGate)!);
    this.player.teleport(this.checkpoints.mimicArena.add(new Vector3(0, 0, -16)), 0);
    this.objective.set("defeat-mimic", "SOBREVIVA AO TESTE DE IDENTIDADE.");
    this.ui.showSubtitle("The Mimic", "Você trouxe os objetos. Agora traz as lembranças.", 4800);
    this.boss.restoreEvidence([...this.mimicEvidence]);
    this.boss.start("identities", 100, 0);
    this.callbacks.onCheckpoint("mimic-identities-1");
  }

  private onBossApparentlyDefeated(): void {
    this.objective.set("after-mimic", "");
    this.ui.showSoundCaption("o silêncio substitui a música e as vozes");
    this.arenaLights.forEach((light, index) => light.intensity = index % 2 ? 0.7 : 1.4);
  }

  private onBossStopped(stats: { attacks: number; stopTime: number; inspected: boolean; attemptedExit: boolean }): void {
    this.phase = "postboss";
    this.objective.set("search-mimic-remains", "PROCURE UMA ROTA PARA OS ARQUIVOS.");
    this.ui.showSoundCaption("um relé distante libera a porta dos arquivos");
    this.audio.electricalBurst(this.archiveExitConsole.position);
    this.openDoor(this.doors.find((door) => door.mesh === this.archiveGate)!);
    this.callbacks.onCheckpoint("mimic-stopped");
    if (stats.attacks > 0) this.ui.toast("As máquinas registram os últimos impactos sem emitir julgamento.", 3200);
  }

  private openArchiveRoute(): void {
    this.phase = "postboss";
    const door = this.doors.find((entry) => entry.mesh === this.archiveGate);
    if (door) this.openDoor(door);
    this.inventory.add(CHAPTER4_ITEMS.archivePass!);
    this.objective.set("reach-archives", "ALCANCE OS NÍVEIS CENTRAIS DE ARQUIVO.");
  }

  private finishChapter(): void {
    this.chapterExitTriggered = true;
    this.chapterComplete = true;
    this.phase = "complete";
    this.player.setEnabled(false);
    this.audio.stopPrisonDrone();
    const noahPosition = this.checkpoints.chapter5.add(new Vector3(0, 1.6, 7));
    this.audio.noahCue(noahPosition);
    this.ui.showSubtitle("Noah?", "Ei... consegue me ouvir? Não segue nenhuma voz até eu provar que sou eu.", 6200);
    this.ui.showSoundCaption("uma voz humana ecoa dos níveis de arquivo");
    this.callbacks.onCheckpoint("chapter5-transition");
    window.setTimeout(() => this.callbacks.onChapterComplete(), 5600);
  }

  private stripEquipment(): void {
    ["metalClub", "replacementTorch", "portableRecorder", "bodyCard", "generatorAccessCard", "metalCan", "torch"].forEach((id) => {
      if (this.inventory.has(id)) this.removedLoadout.add(id);
      this.inventory.remove(id);
    });
    this.fire.torchLit = false;
  }

  private restoreEquipmentFromProgress(): void {
    const catalog: Record<string, InventoryItem> = {
      metalClub: { id: "metalClub", name: "Porrete de metal", description: "Recuperado no depósito prisional." },
      replacementTorch: { id: "replacementTorch", name: "Nova tocha", description: "Recuperada no depósito prisional." },
      portableRecorder: { id: "portableRecorder", name: "Gravador portátil", description: "Contém a fala original de Daniel." },
      bodyCard: { id: "bodyCard", name: "Cartão do Corpo", description: "Cartão obtido de Body." },
      generatorAccessCard: { id: "generatorAccessCard", name: "Cartão de acesso técnico", description: "Cartão de manutenção." },
      metalCan: { id: "metalCan", name: "Lata metálica", description: "Produz ruído ao ser arremessada." }
    };
    this.recoveredEquipment.forEach((id) => { if (catalog[id]) this.inventory.add(catalog[id]!); });
    ["metalClub", "replacementTorch", "portableRecorder"].forEach((id) => this.inventory.add(catalog[id]!));
  }

  private applyRestoredEnvironment(): void {
    if (this.escapeMechanism[0]) {
      this.loosePanel.rotation.z = -0.34;
      this.loosePanel.position.x += 0.35;
    }
    if (this.escapeMechanism[2]) this.observationLever.rotation.x = -0.8;
    if (this.escapeMechanism[3]) {
      const cellDoor = this.doors.find((door) => door.mesh.name === "cell-door");
      if (cellDoor) this.openDoor(cellDoor);
    }
    if (this.prisonEscaped) {
      this.maintenanceDoor.position.y = 5.95;
      this.maintenanceDoor.checkCollisions = false;
      this.maintenanceDoorBlocker.setEnabled(false);
      this.maintenanceDoorBlocker.checkCollisions = false;
    }
    if (this.fragileFloorSolved) this.floorTiles.forEach((tile) => {
      if (tile.symbol !== "circle") {
        tile.mesh.position.y = tile.originalY;
        tile.mesh.isVisible = true;
        tile.mesh.checkCollisions = true;
        tile.collapsed = false;
      }
    });
    if (this.equipmentRecovered) this.openRouteToIdentityTesting();
  }

  private openRouteToIdentityTesting(): void {
    const routeDoor = this.doors.find((door) => door.mesh.name === "equipment-route-door");
    if (routeDoor) this.openDoor(routeDoor);
  }

  private closeBloodTrap(): void {
    const door = this.doors.find((entry) => entry.mesh === this.bloodTrapDoor);
    if (!door) return;
    door.open = false;
    door.mesh.position.copyFrom(door.base);
    door.mesh.checkCollisions = true;
    door.blocker.setEnabled(true);
    door.blocker.checkCollisions = true;
    this.audio.impact(0.75);
  }

  private openBloodTrap(): void {
    const door = this.doors.find((entry) => entry.mesh === this.bloodTrapDoor);
    if (door) this.openDoor(door);
  }

  private damagePlayer(amount: number, caption: string): void {
    this.player.damage(amount);
    this.ui.flashDamage(Math.min(0.9, amount / 18));
    this.ui.showSoundCaption(caption, 1700);
    if (this.player.health > 0) return;
    this.player.health = 55;
    this.callbacks.onPlayerDamaged();
    const destination = this.phase === "boss" ? this.checkpoints.mimicArena.add(new Vector3(0, 0, -15)) : this.destinationForCheckpoint(this.lastSafeCheckpoint);
    this.player.teleport(destination, 0);
    if (this.phase === "boss") this.boss.start(this.boss.state === "post-defeat" ? "post-defeat" : this.boss.state, Math.max(35, this.boss.health), this.boss.identityRoundsCompleted);
  }

  private handleArenaEvent(event: "lights" | "darkness" | "barriers" | "memory" | "fire" | "afterimages"): void {
    if (event === "lights") {
      this.arenaLights.forEach((light, index) => light.intensity = 8 + index * 0.25);
      window.setTimeout(() => this.arenaLights.forEach((light, index) => light.intensity = index % 2 ? 4.5 : 5.5), 1300);
    } else if (event === "darkness") {
      this.arenaLights.forEach((light) => light.intensity = 0.05);
      window.setTimeout(() => this.arenaLights.forEach((light, index) => light.intensity = index % 2 ? 4.5 : 5.5), this.settings.reducedFlashing ? 950 : 620);
    } else if (event === "barriers") {
      this.barriers.forEach((barrier) => {
        barrier.deployed = !barrier.deployed;
        barrier.mesh.position.copyFrom(barrier.deployed ? barrier.base : barrier.base.add(barrier.offset));
        barrier.mesh.checkCollisions = barrier.deployed;
      });
      this.audio.impact(0.62);
    } else if (event === "memory") {
      this.audio.memoryFragments();
      this.ui.setCorruption(Math.min(1, 0.42 + Math.sin(this.corruptionClock) * 0.2), 1500);
    } else if (event === "fire") {
      this.fire.igniteAt(this.checkpoints.mimicArena.add(new Vector3((Math.random() - 0.5) * 18, 0.1, (Math.random() - 0.5) * 18)), 5, false);
    }
  }

  private createRoomShell(
    name: string,
    center: Vector3,
    width: number,
    depth: number,
    height: number,
    wallMaterial: PBRMaterial,
    floorMaterial: PBRMaterial,
    openings: Array<"north" | "south" | "east" | "west"> = []
  ): void {
    const floor = MeshBuilder.CreateBox(`${name}-floor`, { width, height: 0.22, depth }, this.scene);
    floor.parent = this.root;
    floor.position = center.add(new Vector3(0, -0.12, 0));
    floor.material = floorMaterial;
    floor.checkCollisions = true;
    const ceiling = MeshBuilder.CreateBox(`${name}-ceiling`, { width, height: 0.22, depth }, this.scene);
    ceiling.parent = this.root;
    ceiling.position = center.add(new Vector3(0, height, 0));
    ceiling.material = wallMaterial;
    ceiling.checkCollisions = true;
    const thickness = 0.32;
    const wallSpecs: Array<{ side: "north" | "south" | "east" | "west"; position: Vector3; wallWidth: number; wallDepth: number }> = [
      { side: "north", position: center.add(new Vector3(0, height / 2, depth / 2)), wallWidth: width, wallDepth: thickness },
      { side: "south", position: center.add(new Vector3(0, height / 2, -depth / 2)), wallWidth: width, wallDepth: thickness },
      { side: "east", position: center.add(new Vector3(width / 2, height / 2, 0)), wallWidth: thickness, wallDepth: depth },
      { side: "west", position: center.add(new Vector3(-width / 2, height / 2, 0)), wallWidth: thickness, wallDepth: depth }
    ];
    for (const spec of wallSpecs) {
      if (openings.includes(spec.side)) {
        const horizontal = spec.side === "north" || spec.side === "south";
        const segmentLength = ((horizontal ? width : depth) - 4.2) / 2;
        for (const sign of [-1, 1]) {
          const wall = MeshBuilder.CreateBox(`${name}-${spec.side}-${sign}`, {
            width: horizontal ? segmentLength : thickness,
            height,
            depth: horizontal ? thickness : segmentLength
          }, this.scene);
          wall.parent = this.root;
          wall.position = spec.position.add(horizontal ? new Vector3(sign * (2.1 + segmentLength / 2), 0, 0) : new Vector3(0, 0, sign * (2.1 + segmentLength / 2)));
          wall.material = wallMaterial;
          wall.checkCollisions = true;
        }
      } else {
        const wall = MeshBuilder.CreateBox(`${name}-${spec.side}`, { width: spec.wallWidth, height, depth: spec.wallDepth }, this.scene);
        wall.parent = this.root;
        wall.position = spec.position;
        wall.material = wallMaterial;
        wall.checkCollisions = true;
      }
    }
  }

  private createCorridor(name: string, center: Vector3, width: number, depth: number, wallMaterial: PBRMaterial, floorMaterial: PBRMaterial, rotationY = 0): void {
    const shell = new TransformNode(name, this.scene);
    shell.parent = this.root;
    shell.position.copyFrom(center);
    shell.rotation.y = rotationY;
    const floor = MeshBuilder.CreateBox(`${name}-floor`, { width, height: 0.2, depth }, this.scene);
    floor.parent = shell;
    floor.position.y = -0.1;
    floor.material = floorMaterial;
    floor.checkCollisions = true;
    const ceiling = MeshBuilder.CreateBox(`${name}-ceiling`, { width, height: 0.2, depth }, this.scene);
    ceiling.parent = shell;
    ceiling.position.y = 5.8;
    ceiling.material = wallMaterial;
    ceiling.checkCollisions = true;
    for (const side of [-1, 1]) {
      const wall = MeshBuilder.CreateBox(`${name}-wall-${side}`, { width: 0.28, height: 5.8, depth }, this.scene);
      wall.parent = shell;
      wall.position = new Vector3(side * width / 2, 2.9, 0);
      wall.material = wallMaterial;
      wall.checkCollisions = true;
    }
  }

  private createDoor(name: string, position: Vector3, slide: Vector3): DoorRig {
    const mesh = MeshBuilder.CreateBox(name, { width: 4, height: 4.6, depth: 0.28 }, this.scene);
    mesh.parent = this.root;
    mesh.position.copyFrom(position);
    // Every Chapter 4 gate crosses a north/south threshold. The previous code
    // guessed orientation from its old animation vector, which turned the blood
    // route door ninety degrees and left an open lane beside it.
    mesh.rotation.y = 0;
    mesh.material = this.materials.get("metal", 51 + this.doors.length);
    mesh.checkCollisions = true;
    const wallHeight = name === "cell-door" ? 5.4 : name === "archive-gate" ? 6.4 : 7.2;
    const openingSpan = name === "cell-door" ? 4.2
      : name === "equipment-route-door" || name === "blood-trap-door" ? 9
        : 10;
    const blocker = this.createDoorFrame(name, position, 4, 4.6, mesh.rotation.y, openingSpan, wallHeight);
    const rig: DoorRig = { mesh, blocker, base: position.clone(), slide: new Vector3(4.7, 0, 0), open: false };
    this.doors.push(rig);
    return rig;
  }

  private createDoorFrame(name: string, position: Vector3, width: number, height: number, rotationY: number, openingSpan = width, wallHeight = height + 0.6): Mesh {
    const frame = new TransformNode(`${name}-frame-root`, this.scene);
    frame.parent = this.root;
    frame.position.copyFrom(position);
    frame.rotation.y = rotationY;
    const material = this.materials.get("metal", 59 + this.doors.length);
    const make = (suffix: string, size: { width: number; height: number; depth: number }, local: Vector3, collisions = true): void => {
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
      make("wall-infill-left", { width: wingWidth, height: wallHeight, depth: 0.62 }, new Vector3(-width / 2 - jamb - wingWidth / 2, wallCenterY, 0));
      make("wall-infill-right", { width: wingWidth, height: wallHeight, depth: 0.62 }, new Vector3(width / 2 + jamb + wingWidth / 2, wallCenterY, 0));
    }
    const upperHeight = Math.max(0, wallHeight - (position.y + height / 2));
    if (upperHeight > 0.08) make("wall-infill-upper", { width: Math.max(openingSpan, width + jamb * 2), height: upperHeight, depth: 0.62 }, new Vector3(0, height / 2 + upperHeight / 2, 0));
    const blocker = MeshBuilder.CreateBox(`${name}-doorway-blocker`, { width: Math.max(openingSpan, width + 0.72), height: wallHeight, depth: 1.15 }, this.scene);
    blocker.position.y = wallCenterY;
    blocker.parent = frame;
    blocker.visibility = 0;
    blocker.isPickable = false;
    blocker.checkCollisions = true;
    blocker.metadata = { doorwayBlocker: true, interactionPassthrough: true };
    return blocker;
  }

  private openDoor(door: DoorRig): void {
    if (door.open) return;
    door.open = true;
    door.mesh.position.copyFrom(door.base.add(door.slide));
    door.mesh.checkCollisions = false;
    door.blocker.setEnabled(false);
    door.blocker.checkCollisions = false;
    this.audio.impact(0.45);
  }

  private createDocument(id: string, title: string, body: string, position: Vector3): void {
    const mesh = MeshBuilder.CreateBox(`chapter4-document-${id}`, { width: 0.72, height: 0.035, depth: 0.95 }, this.scene);
    mesh.parent = this.root;
    mesh.position.copyFrom(position);
    mesh.material = this.materials.solid(`chapter4-paper-${id}`, new Color3(0.66, 0.61, 0.48), 0.92);
    this.interaction.register(mesh, {
      prompt: "E · Ler documento",
      enabled: () => this.active,
      onInteract: () => {
        this.collectedDocuments.add(id);
        this.ui.showDocument(title, body);
      }
    });
  }

  private createDamagedReflectivePanel(position: Vector3, normal: Vector3, width: number, height: number, variant: number): void {
    const panel = MeshBuilder.CreatePlane(`damaged-reflective-panel-${variant}`, { width, height }, this.scene);
    panel.parent = this.root;
    panel.position.copyFrom(position);
    panel.rotation.y = Math.atan2(normal.x, normal.z);
    const material = new PBRMaterial(`damaged-reflective-material-${variant}`, this.scene);
    material.albedoColor = new Color3(0.22, 0.25, 0.25);
    material.metallic = 0.72;
    material.roughness = 0.28 + variant * 0.05;
    material.bumpTexture = this.createCrackTexture(`reflective-cracks-${variant}`, variant);
    panel.material = material;
    panel.isPickable = false;
  }

  private createArenaMirror(position: Vector3, normal: Vector3, width: number, height: number, variant: number): void {
    const mirror = MeshBuilder.CreatePlane(`arena-functional-mirror-${variant}`, { width, height }, this.scene);
    mirror.parent = this.root;
    mirror.position.copyFrom(position);
    mirror.rotation.y = Math.atan2(normal.x, normal.z);
    const texture = new MirrorTexture(`arena-mirror-texture-${variant}`, 512, this.scene, true);
    texture.mirrorPlane = Plane.FromPositionAndNormal(position, normal);
    texture.level = 0.76;
    texture.renderList = this.mimic.getReflectableMeshes();
    const material = new StandardMaterial(`arena-mirror-material-${variant}`, this.scene);
    material.reflectionTexture = texture;
    material.diffuseColor = new Color3(0.14, 0.15, 0.15);
    material.specularColor = new Color3(0.8, 0.8, 0.76);
    material.bumpTexture = this.createCrackTexture(`arena-mirror-cracks-${variant}`, variant + 8);
    mirror.material = material;
    mirror.isPickable = false;
    this.mirrors.push(texture);
  }

  private createCrackTexture(name: string, variant: number): DynamicTexture {
    const texture = new DynamicTexture(name, { width: 512, height: 512 }, this.scene, false);
    const context = texture.getContext();
    context.clearRect(0, 0, 512, 512);
    context.strokeStyle = "rgba(25,22,20,.68)";
    context.lineWidth = 3;
    const centerX = 100 + ((variant * 83) % 310);
    const centerY = 90 + ((variant * 57) % 320);
    for (let branch = 0; branch < 10; branch += 1) {
      context.beginPath();
      context.moveTo(centerX, centerY);
      let x = centerX;
      let y = centerY;
      for (let step = 0; step < 8; step += 1) {
        x += Math.cos(branch * 0.7 + step * 0.14) * (18 + step * 4);
        y += Math.sin(branch * 0.7 + step * 0.21) * (16 + step * 3);
        context.lineTo(x, y);
      }
      context.stroke();
    }
    context.fillStyle = "rgba(70,63,52,.22)";
    for (let dot = 0; dot < 80; dot += 1) context.fillRect((dot * 73 + variant * 17) % 512, (dot * 41 + variant * 29) % 512, 2 + dot % 5, 2 + dot % 3);
    texture.update();
    return texture;
  }

  private createProjectorSlideClue(): void {
    const screen = MeshBuilder.CreatePlane("floor-projector-screen", { width: 8, height: 4.5 }, this.scene);
    screen.parent = this.root;
    screen.position = new Vector3(0, 3.1, 1219.5);
    screen.rotation.y = Math.PI;
    const texture = new DynamicTexture("floor-projector-slide", { width: 1024, height: 512 }, this.scene, false);
    const context = texture.getContext();
    context.fillStyle = "#c8c0a7";
    context.fillRect(0, 0, 1024, 512);
    context.fillStyle = "#24201a";
    context.font = "bold 46px Georgia";
    context.textAlign = "center";
    context.fillText("TESTE DE PASSOS · CÓPIA DO OBSERVADOR", 512, 70);
    context.font = "bold 72px Georgia";
    context.save();
    context.translate(512, 280);
    context.scale(-1, 1);
    context.fillText("○ ○ △ ○ ○ ○", 0, 0);
    context.restore();
    context.font = "30px Georgia";
    context.fillText("A imagem projetada nunca foi corrigida após a troca do espelho.", 512, 430);
    texture.update();
    const material = new StandardMaterial("floor-projector-screen-material", this.scene);
    material.diffuseTexture = texture;
    material.emissiveTexture = texture;
    material.disableLighting = false;
    screen.material = material;
    screen.isPickable = false;
  }

  private drawFloorSymbol(tile: Mesh, symbol: FloorSymbol, index: number): void {
    const texture = new DynamicTexture(`floor-symbol-texture-${index}`, { width: 256, height: 256 }, this.scene, false);
    const context = texture.getContext();
    context.fillStyle = "#7b786e";
    context.fillRect(0, 0, 256, 256);
    context.strokeStyle = symbol === "circle" ? "#293d36" : symbol === "triangle" ? "#5b4726" : "#562a27";
    context.lineWidth = 18;
    context.lineCap = "round";
    if (symbol === "circle") {
      context.beginPath();
      context.arc(128, 128, 62, 0, Math.PI * 2);
      context.stroke();
    } else if (symbol === "triangle") {
      context.beginPath();
      context.moveTo(128, 52);
      context.lineTo(55, 192);
      context.lineTo(201, 192);
      context.closePath();
      context.stroke();
    } else {
      context.beginPath();
      context.moveTo(64, 64);
      context.lineTo(192, 192);
      context.moveTo(192, 64);
      context.lineTo(64, 192);
      context.stroke();
    }
    texture.update();
    const material = new PBRMaterial(`floor-symbol-material-${index}`, this.scene);
    material.albedoTexture = texture;
    material.roughness = 0.84;
    tile.material = material;
  }

  private createDustBurst(position: Vector3): void {
    for (let index = 0; index < 8; index += 1) {
      const dust = MeshBuilder.CreateSphere(`floor-dust-${Date.now()}-${index}`, { diameter: 0.16 + index * 0.015, segments: 5 }, this.scene);
      dust.parent = this.root;
      dust.position = position.add(new Vector3((Math.random() - 0.5) * 2, 0.2 + Math.random(), (Math.random() - 0.5) * 2));
      const material = this.materials.solid(`floor-dust-material-${Date.now()}-${index}`, new Color3(0.32, 0.29, 0.25), 1);
      material.alpha = 0.25;
      dust.material = material;
      dust.isPickable = false;
      window.setTimeout(() => dust.dispose(), 1100 + index * 35);
    }
  }

  private createBloodAndFluidTraces(): void {
    for (let index = 0; index < 22; index += 1) {
      const trace = MeshBuilder.CreateCylinder(`artificial-fluid-trace-${index}`, { height: 0.012, diameter: 0.18 + (index % 4) * 0.1, tessellation: 12 }, this.scene);
      trace.parent = this.root;
      trace.position = new Vector3((index % 2 ? 1 : -1) * (2.5 + (index % 3)), 0.018, 1084 + index * 14.5);
      trace.material = this.materials.solid(`fluid-trace-material-${index}`, index % 3 ? new Color3(0.19, 0.025, 0.018) : new Color3(0.08, 0.19, 0.17), 0.5);
      trace.isPickable = false;
    }
  }

  private createProceduralSign(name: string, text: string, position: Vector3, rotationY: number, width: number, height: number, warning: boolean): Mesh {
    const plane = MeshBuilder.CreatePlane(name, { width, height }, this.scene);
    plane.parent = this.root;
    plane.position.copyFrom(position);
    plane.rotation.y = rotationY;
    const texture = new DynamicTexture(`${name}-texture`, { width: 1024, height: 256 }, this.scene, false);
    const context = texture.getContext();
    context.fillStyle = warning ? "#b8a45a" : "#d1c9ae";
    context.fillRect(0, 0, 1024, 256);
    context.fillStyle = warning ? "#2c2118" : "#242521";
    context.font = `bold ${text.length > 42 ? 42 : 54}px Georgia`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 512, 128, 940);
    for (let index = 0; index < 40; index += 1) {
      context.fillStyle = `rgba(30,25,20,${0.03 + (index % 4) * 0.015})`;
      context.fillRect((index * 83) % 1024, (index * 47) % 256, 8 + index % 20, 2 + index % 5);
    }
    texture.update();
    const material = new StandardMaterial(`${name}-material`, this.scene);
    material.diffuseTexture = texture;
    plane.material = material;
    plane.isPickable = false;
    return plane;
  }
}
