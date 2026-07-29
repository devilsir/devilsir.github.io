import "@babylonjs/core/Collisions/collisionCoordinator";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { SettingsStore, type GameSettings } from "../systems/Settings";
import {
  SaveSystem,
  DEFAULT_CHAPTER2_SAVE,
  DEFAULT_CHAPTER3_SAVE,
  DEFAULT_CHAPTER4_SAVE,
  DEFAULT_CHAPTER5_SAVE,
  type GameStage,
  type SaveData
} from "../systems/SaveSystem";
import { GameUI, type MenuAction } from "../ui/GameUI";
import { AudioManager } from "../systems/AudioManager";
import { PlayerController } from "./PlayerController";
import { InteractionSystem } from "../systems/InteractionSystem";
import { Inventory, type InventoryItem } from "../systems/Inventory";
import { ObjectiveSystem } from "../systems/ObjectiveSystem";
import { ProceduralMaterials } from "../world/ProceduralMaterials";
import { FireSystem } from "../systems/FireSystem";
import { GuidePathSystem } from "../systems/GuidePathSystem";
import { ITEM_CATALOG, WorldBuilder } from "../world/WorldBuilder";
import type { Chapter2World } from "../world/Chapter2World";
import type { Chapter3World } from "../world/Chapter3World";
import type { Chapter4World } from "../world/Chapter4World";
import type { Chapter5World } from "../world/Chapter5World";
import { BodyBoss } from "../entities/BodyBoss";

export class Game {
  private readonly canvas: HTMLCanvasElement;
  private readonly engine: Engine;
  private readonly scene: Scene;
  private readonly settingsStore = new SettingsStore();
  private readonly saveSystem = new SaveSystem();
  private readonly ui: GameUI;
  private readonly audio: AudioManager;
  private readonly materials: ProceduralMaterials;
  private readonly player: PlayerController;
  private readonly interaction: InteractionSystem;
  private readonly inventory: Inventory;
  private readonly objectives: ObjectiveSystem;
  private readonly fire: FireSystem;
  private readonly world: WorldBuilder;
  private readonly guide: GuidePathSystem;
  private chapter2?: Chapter2World;
  private chapter3?: Chapter3World;
  private chapter4?: Chapter4World;
  private chapter5?: Chapter5World;
  private readonly itemCatalog: Record<string, InventoryItem> = { ...ITEM_CATALOG };
  private readonly safeMode: boolean;
  private readonly boss: BodyBoss;
  private readonly menuRoot: TransformNode;
  private readonly menuProjector: SpotLight;
  private readonly menuBodyParts: Mesh[] = [];
  private stage: GameStage = "menu";
  private paused = false;
  private inventoryOpen = false;
  private initialized = false;
  private prologueElapsed = 0;
  private screamPlayed = false;
  private ambientEventIndex = 0;
  private ambientTimer = 0;
  private nextLightning = 3;
  private debugEnabled = false;
  private lastCheckpoint = "prologue-start";
  private chapterTransitionStarted = false;
  private fireDamageCooldown = 0;
  private collisionDebugVisible = false;
  private endings = new Set<string>();
  private worldBuilt = false;
  private chapter2Built = false;
  private chapter3Built = false;
  private chapter4Built = false;
  private chapter5Built = false;
  private movementDebugOverlay: HTMLPreElement | null = null;
  private movementDebugAccumulator = 0;
  private readonly maxLives = 3;
  private lives = 3;
  private readonly runtimeCheckpointPositions = new Map<string, Vector3>();

  public constructor(canvas: HTMLCanvasElement, uiRoot: HTMLDivElement) {
    this.canvas = canvas;
    this.safeMode = new URLSearchParams(location.search).get("safe") === "1";
    if (this.safeMode) {
      this.settingsStore.value = {
        ...this.settingsStore.value,
        performancePreset: "performance",
        reducedCameraShake: true,
        reducedFlashing: true,
        reducedHeadBob: true
      };
    }
    this.engine = new Engine(canvas, !this.safeMode, {
      preserveDrawingBuffer: false,
      stencil: true,
      antialias: true,
      powerPreference: this.safeMode ? "low-power" : "high-performance",
      disableWebGL2Support: this.safeMode
    });
    this.scene = new Scene(this.engine);
    this.scene.collisionsEnabled = true;
    this.scene.clearColor = new Color4(0.012, 0.014, 0.019, 1);
    this.scene.skipPointerMovePicking = true;

    this.ui = new GameUI(uiRoot, this.settingsStore.value);
    this.audio = new AudioManager(this.settingsStore.value);
    this.materials = new ProceduralMaterials(this.scene, this.safeMode ? 128 : this.settingsStore.value.performancePreset === "performance" ? 256 : 512);
    this.inventory = new Inventory((items) => {
      this.ui.updateStatus(this.player?.health ?? 100, this.fire?.fuel ?? 0, items, this.lives, this.player?.armor ?? 0);
      this.fire?.setTorchAvailable(items.some((item) => item.id === "torch" || item.id === "replacementTorch"));
    });
    this.objectives = new ObjectiveSystem((objective) => {
      this.ui.setObjective(objective.text);
      if (objective.id !== "none") this.audio.objective();
      this.guide?.invalidate();
    });

    this.player = new PlayerController(this.scene, canvas, this.audio, this.settingsStore.value, {
      onPause: () => this.togglePause(),
      onTorchToggle: () => this.toggleTorch(),
      onInteract: () => this.interaction?.interact(),
      onFireUse: () => this.usePrimaryAction(false),
      onThrow: () => this.throwObject(),
      onSoundDevice: () => this.deploySoundDevice(),
      onRearDoor: () => this.closeRearDoor(),
      onHeavyAttack: () => this.usePrimaryAction(true),
      onContextAction: () => this.contextAction(),
      onFootstep: (position, intensity, surface, sprinting, crouching) => {
        if (this.stage === "chapter3") this.chapter3?.emitPlayerMovementNoise(intensity, surface, sprinting, crouching);
        if (this.stage === "chapter5") this.chapter5?.emitPlayerMovementNoise(intensity, surface, sprinting, crouching);
      }
    });
    this.interaction = new InteractionSystem(
      this.scene,
      this.player.camera,
      () => this.player.collider.getAbsolutePosition(),
      (prompt) => this.ui.setInteractionPrompt(prompt)
    );
    this.fire = new FireSystem(this.scene, this.player.camera, this.audio, this.materials);
    this.fire.setTorchAvailable(false);
    this.world = new WorldBuilder(
      this.scene,
      this.materials,
      this.interaction,
      this.inventory,
      this.objectives,
      this.ui,
      this.audio,
      this.fire,
      this.player,
      {
        onEnteredWonderWorld: () => this.enterWonderWorld(),
        onPowerRestored: () => this.checkpoint("electrical-restored", "chapter1"),
        onPuzzleSolved: () => this.checkpoint("body-puzzles", "chapter1"),
        onBossRequested: () => this.startBoss(),
        onBodyCardObtained: () => this.checkpoint("body-card", "chapter1"),
        onChapterTransition: () => this.startChapterTransition(),
        onPlayerDamaged: () => this.handleRespawn("Você recupera o fôlego no último ponto seguro."),
        onCheckpointActivated: (id, position) => this.activateSurvivalCheckpoint(id, position)
      }
    );
    this.guide = new GuidePathSystem(this.scene, this.materials, this.player, () => this.guideRouteForCurrentObjective());
    this.boss = new BodyBoss(this.scene, this.materials, this.player, this.fire, this.audio, this.ui, {
      onPhaseChanged: (phase) => this.checkpoint(`body-phase-${phase}`, "boss", phase),
      onDefeated: () => this.finishBoss(),
      onHint: (text) => this.ui.toast(text, 3400),
      canUseItem: () => this.inventory.has("bandage"),
      onUseItem: () => this.inventory.remove("bandage"),
      onArenaDamage: (severity) => this.world.damageArenaCover(severity)
    });
    this.world.attachBoss(this.boss);

    const backdrop = this.createMenuBackdrop();
    this.menuRoot = backdrop.root;
    this.menuProjector = backdrop.projector;
    this.setupSceneLighting();
    this.bindUI();
    this.bindGlobalEvents();
    this.applySettings(this.settingsStore.value);
    if (new URLSearchParams(location.search).get("movementdebug") === "1") this.installMovementDiagnostics();
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    // Start rendering and show the menu before constructing the campaign. Building all
    // five chapters synchronously here previously left slower browsers on a blank page.
    this.enterMenuMode();
    this.ui.setContinueEnabled(this.saveSystem.hasSave());
    this.engine.runRenderLoop(() => {
      const deltaSeconds = Math.min(0.05, this.engine.getDeltaTime() / 1000);
      this.update(deltaSeconds);
      this.scene.render();
    });
    window.addEventListener("resize", () => this.engine.resize());
    this.ui.hideLoading();

    if (this.debugEnabled) {
      // Debug chapter selection expects every destination to exist. Build incrementally
      // while keeping a visible loading screen instead of locking the first frame.
      await this.ensureBuiltThrough(5, "Preparando ferramentas de desenvolvimento…");
    }

    if (sessionStorage.getItem("atracao-final-auto-new") === "1") {
      sessionStorage.removeItem("atracao-final-auto-new");
      await this.startNewGame();
    }
  }

  private async ensureChapter2Created(): Promise<Chapter2World> {
    if (this.chapter2) return this.chapter2;
    const { Chapter2World, CHAPTER2_ITEMS } = await import("../world/Chapter2World");
    Object.assign(this.itemCatalog, CHAPTER2_ITEMS);
    this.chapter2 = new Chapter2World(
      this.scene,
      this.materials,
      this.interaction,
      this.inventory,
      this.objectives,
      this.ui,
      this.audio,
      this.fire,
      this.player,
      this.settingsStore.value,
      {
        onCheckpoint: (checkpoint) => this.checkpoint(checkpoint, "chapter2"),
        onChapterComplete: () => void this.finishChapter2(),
        onPlayerDamaged: () => this.handleRespawn("Você retorna ao último setor estabilizado.")
      }
    );
    return this.chapter2;
  }

  private async ensureChapter3Created(): Promise<Chapter3World> {
    if (this.chapter3) return this.chapter3;
    const { Chapter3World, CHAPTER3_ITEMS } = await import("../world/Chapter3World");
    Object.assign(this.itemCatalog, CHAPTER3_ITEMS);
    this.chapter3 = new Chapter3World(
      this.scene,
      this.materials,
      this.interaction,
      this.inventory,
      this.objectives,
      this.ui,
      this.audio,
      this.fire,
      this.player,
      this.settingsStore.value,
      {
        onCheckpoint: (checkpoint) => this.checkpoint(checkpoint, "chapter3"),
        onChapterComplete: () => void this.finishChapter3(),
        onPlayerDamaged: () => this.handleRespawn("Você retorna ao último setor estabilizado.")
      }
    );
    return this.chapter3;
  }

  private async ensureChapter4Created(): Promise<Chapter4World> {
    if (this.chapter4) return this.chapter4;
    const { Chapter4World, CHAPTER4_ITEMS } = await import("../world/Chapter4World");
    Object.assign(this.itemCatalog, CHAPTER4_ITEMS);
    this.chapter4 = new Chapter4World(
      this.scene,
      this.materials,
      this.interaction,
      this.inventory,
      this.objectives,
      this.ui,
      this.audio,
      this.fire,
      this.player,
      this.settingsStore.value,
      {
        onCheckpoint: (checkpoint) => this.checkpoint(checkpoint, "chapter4"),
        onChapterComplete: () => void this.finishChapter4(),
        onPlayerDamaged: () => this.handleRespawn("Você retorna ao último ponto estável da prisão."),
        onReturnMenu: () => {
          this.saveSystem.write(this.currentSavePayload());
          this.enterMenuMode();
        },
        onEndingDiscovered: (endingId) => {
          this.endings.add(endingId);
          this.checkpoint("bad-ending-retry", "chapter4");
        }
      }
    );
    return this.chapter4;
  }

  private async ensureChapter5Created(): Promise<Chapter5World> {
    if (this.chapter5) return this.chapter5;
    const { Chapter5World, CHAPTER5_ITEMS } = await import("../world/Chapter5World");
    Object.assign(this.itemCatalog, CHAPTER5_ITEMS);
    this.chapter5 = new Chapter5World(
      this.scene,
      this.materials,
      this.interaction,
      this.inventory,
      this.objectives,
      this.ui,
      this.audio,
      this.fire,
      this.player,
      this.settingsStore.value,
      {
        onCheckpoint: (checkpoint) => this.checkpoint(checkpoint, "chapter5"),
        onChapterComplete: () => this.finishChapter5(),
        onPlayerDamaged: () => this.handleRespawn("Você retorna ao último ponto seguro com Noah."),
        onEndingDiscovered: (endingId) => {
          this.endings.add(endingId);
          this.saveSystem.write(this.currentSavePayload());
        },
        getEndingCount: () => this.endings.size,
        onReturnMenu: () => {
          this.saveSystem.write(this.currentSavePayload());
          this.enterMenuMode();
        }
      }
    );
    return this.chapter5;
  }

  private requireChapter2(): Chapter2World {
    if (!this.chapter2) throw new Error("O Capítulo 2 ainda não foi carregado.");
    return this.chapter2;
  }

  private requireChapter3(): Chapter3World {
    if (!this.chapter3) throw new Error("O Capítulo 3 ainda não foi carregado.");
    return this.chapter3;
  }

  private requireChapter4(): Chapter4World {
    if (!this.chapter4) throw new Error("O Capítulo 4 ainda não foi carregado.");
    return this.chapter4;
  }

  private requireChapter5(): Chapter5World {
    if (!this.chapter5) throw new Error("O Capítulo 5 ainda não foi carregado.");
    return this.chapter5;
  }

  private async ensureBuiltThrough(chapter: 1 | 2 | 3 | 4 | 5, message: string): Promise<void> {
    this.ui.showLoading(message);
    try {
      await this.yieldToBrowser();
      if (!this.worldBuilt) {
        this.ui.updateLoading("Construindo o estacionamento e o Wonder World…");
        this.world.build();
        this.worldBuilt = true;
        await this.yieldToBrowser();
      }
      if (chapter >= 2 && !this.chapter2Built) {
        this.ui.updateLoading("Carregando o departamento de modelagem…");
        const chapter2 = await this.ensureChapter2Created();
        await this.yieldToBrowser();
        this.ui.updateLoading("Construindo o departamento de modelagem…");
        chapter2.build();
        this.chapter2Built = true;
        await this.yieldToBrowser();
      }
      if (chapter >= 3 && !this.chapter3Built) {
        this.ui.updateLoading("Carregando a caixa de sustos…");
        const chapter3 = await this.ensureChapter3Created();
        await this.yieldToBrowser();
        this.ui.updateLoading("Construindo a caixa de sustos…");
        chapter3.build();
        this.chapter3Built = true;
        await this.yieldToBrowser();
      }
      if (chapter >= 4 && !this.chapter4Built) {
        this.ui.updateLoading("Carregando a prisão subterrânea…");
        const chapter4 = await this.ensureChapter4Created();
        await this.yieldToBrowser();
        this.ui.updateLoading("Construindo a prisão subterrânea…");
        chapter4.build();
        this.chapter4Built = true;
        await this.yieldToBrowser();
      }
      if (chapter >= 5 && !this.chapter5Built) {
        this.ui.updateLoading("Carregando os arquivos centrais…");
        const chapter5 = await this.ensureChapter5Created();
        await this.yieldToBrowser();
        this.ui.updateLoading("Construindo os arquivos centrais…");
        chapter5.build();
        this.chapter5Built = true;
        await this.yieldToBrowser();
      }
    } catch (error) {
      this.ui.showFatalError(error);
      throw error;
    } finally {
      this.ui.hideLoading();
    }
  }

  private yieldToBrowser(): Promise<void> {
    return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
  }

  private bindUI(): void {
    this.ui.bindMenu((action) => void this.handleMenuAction(action));
    this.ui.bindPauseButtons();
  }

  private bindGlobalEvents(): void {
    const unlockAudio = (): void => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      void this.audio.unlock().then(() => {
        if (this.stage === "menu" && this.audio.unlocked) this.audio.startProjector();
      }).catch((error) => {
        console.warn("O áudio continuará desativado até o navegador permitir a reprodução.", error);
      });
    };
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("keydown", (event) => {
      if (
        !event.repeat
        && (event.code === "KeyE" || event.code === "Escape")
        && this.stage !== "menu"
        && this.ui.dismissGameplayText()
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (event.code === "KeyE" && !event.repeat && this.stage !== "menu" && !this.paused && !this.inventoryOpen) {
        event.preventDefault();
        this.interaction.interact();
      }
      if (event.code === "Tab") {
        event.preventDefault();
        if (!event.repeat) this.toggleInventory();
      }
      if (event.code === "KeyH" && !event.repeat && this.stage !== "menu" && !this.paused && !this.inventoryOpen) {
        event.preventDefault();
        this.toggleGuide();
      }
      if (event.code === "Backquote" && this.debugEnabled) this.toggleDebug();
      if (event.code === "KeyP" && this.debugEnabled) this.saveSystem.write(this.currentSavePayload());
    }, { capture: true });
    document.addEventListener("pointerlockchange", () => {
      if (this.stage !== "menu" && !this.paused && document.pointerLockElement !== this.canvas) {
        this.ui.toast("Clique no jogo para retomar o controle do mouse.", 1800);
      }
    });
    this.debugEnabled = new URLSearchParams(location.search).get("debug") === "1";
  }

  private async handleMenuAction(action: MenuAction): Promise<void> {
    await this.audio.unlock();
    this.audio.uiClick();
    if (action === "new") {
      this.endings = new Set(this.saveSystem.getEndingGallery());
      this.saveSystem.clear();
      if (this.hasRuntimeProgress()) {
        sessionStorage.setItem("atracao-final-auto-new", "1");
        location.reload();
        return;
      }
      await this.startNewGame();
    } else if (action === "continue" || action === "load") {
      const save = this.saveSystem.load();
      if (save) await this.loadGame(save);
      else this.ui.toast("Nenhum jogo salvo foi encontrado.");
    } else if (action === "tips") {
      this.openTips(true);
    } else if (action === "settings") {
      this.openSettings(false, true);
    } else if (action === "accessibility") {
      this.openSettings(true, true);
    } else if (action === "credits") {
      this.ui.showCredits();
    }
  }

  private hasRuntimeProgress(): boolean {
    return this.prologueElapsed > 0
      || this.world.enteredWonderWorld
      || this.world.solvedPuzzles.size > 0
      || this.inventory.list().length > 0
      || this.world.bodyDefeated
      || Boolean(this.chapter2?.active)
      || Boolean(this.chapter3?.active)
      || Boolean(this.chapter4?.active)
      || Boolean(this.chapter5?.active);
  }

  private async startNewGame(): Promise<void> {
    await this.ensureBuiltThrough(1, "Preparando o prólogo…");
    this.inventory.restore([], this.itemCatalog);
    this.inventoryOpen = false;
    this.ui.hideInventory();
    this.stage = "prologue";
    this.chapterTransitionStarted = false;
    this.fireDamageCooldown = 0;
    this.player.setEnabled(false);
    this.menuProjector.intensity = 0;
    this.audio.startProjector();
    this.ui.hideMenu();
    await this.ui.playOpeningFilm(() => undefined);
    this.ui.ensureGameplayVisible();
    this.audio.stopLoop("projector");
    this.audio.startRain();
    this.audio.startHorrorDrone();
    this.menuRoot.setEnabled(false);
    this.player.teleport(this.world.checkpoints.prologue.clone(), 0);
    this.player.health = 100;
    this.player.armor = 0;
    this.lives = this.maxLives;
    this.guide.setEnabled(true);
    this.fire.fuel = 0;
    this.fire.torchLit = false;
    this.ui.showHud();
    this.objectives.set("wait-friends", "AGUARDE SEUS AMIGOS RETORNAREM.");
    this.ui.showSubtitle("Protagonista", "Isso é uma péssima ideia. Eu vou esperar aqui fora.", 4300);
    this.player.setEnabled(true);
    this.prologueElapsed = 0;
    this.screamPlayed = false;
    this.ambientTimer = 4;
    this.lastCheckpoint = "prologue-start";
    this.checkpoint("prologue-start", "prologue");
    this.ui.toast("WASD para andar · Mouse para olhar · E interage · F acende a tocha · H mostra o caminho · Tab abre o inventário", 6800);
  }

  private async loadGame(save: SaveData): Promise<void> {
    const requiredChapter: 1 | 2 | 3 | 4 | 5 =
      save.stage === "chapter5" || save.stage === "campaign-complete" || save.stage === "chapter5-transition" ? 5
        : save.stage === "chapter4" || save.stage === "chapter4-transition" ? 4
          : save.stage === "chapter3" || save.stage === "chapter3-transition" ? 3
            : save.stage === "chapter2" || save.stage === "chapter2-transition" ? 2
              : 1;
    await this.ensureBuiltThrough(requiredChapter, "Restaurando o Wonder World…");
    this.ui.hideMenu();
    this.menuRoot.setEnabled(false);
    this.ui.ensureGameplayVisible();
    this.inventoryOpen = false;
    this.ui.hideInventory();
    this.stage = save.stage;
    this.player.health = save.playerHealth;
    this.player.armor = save.playerArmor;
    this.lives = save.lives;
    this.guide.setEnabled(save.guideEnabled);
    this.fire.fuel = save.torchFuel;
    this.world.restoreProgress(
      save.inventory,
      save.solvedPuzzles,
      save.powerRestored,
      save.checkpoint,
      save.openedContainers,
      save.lootedContainers,
      save.activatedCheckpoints
    );
    this.inventory.restore(save.inventory, this.itemCatalog);
    this.lastCheckpoint = save.checkpoint;
    this.runtimeCheckpointPositions.set(save.checkpoint, Vector3.FromArray(save.checkpointPosition));
    this.endings = new Set(save.endings);
    this.objectives.set(save.objectiveId, this.objectiveTextFor(save.objectiveId));

    if (save.stage === "prologue") {
      this.teleportToSafePosition(this.destinationForCheckpoint(save.checkpoint, save.stage));
      this.player.setEnabled(true);
      this.audio.startRain();
      this.prologueElapsed = 20;
      this.screamPlayed = true;
    } else if (save.stage === "chapter5" || save.stage === "campaign-complete") {
      this.world.enteredWonderWorld = true;
      this.audio.startInteriorHum();
      this.requireChapter5().restore(save.chapter5, save.checkpoint);
      if (save.stage === "campaign-complete") this.player.setEnabled(false);
    } else if (save.stage === "chapter4" || save.stage === "chapter5-transition") {
      this.world.enteredWonderWorld = true;
      this.audio.startInteriorHum();
      this.requireChapter4().restore(save.chapter4, save.checkpoint);
      if (save.stage === "chapter5-transition") {
        this.player.setEnabled(false);
        await this.finishChapter4();
      }
    } else if (save.stage === "chapter3" || save.stage === "chapter4-transition") {
      this.world.enteredWonderWorld = true;
      this.audio.startInteriorHum();
      this.requireChapter3().restore(save.chapter3, save.checkpoint);
      if (save.stage === "chapter4-transition") {
        this.player.setEnabled(false);
        await this.finishChapter3();
      }
    } else if (save.stage === "chapter2" || save.stage === "chapter3-transition") {
      this.world.enteredWonderWorld = true;
      this.audio.startInteriorHum();
      this.requireChapter2().restore(save.chapter2, save.checkpoint);
      if (save.stage === "chapter3-transition") {
        this.player.setEnabled(false);
        await this.finishChapter2();
      }
    } else {
      this.world.enteredWonderWorld = true;
      this.audio.startInteriorHum();
      this.teleportToSafePosition(this.destinationForCheckpoint(save.checkpoint, save.stage));
      this.player.setEnabled(true);
    }

    // Chapter restore routines also restore their own animation state and may
    // briefly teleport to an authored room centre. The save now carries the exact
    // collision-free checkpoint position, so make that the final authority.
    if (!["chapter2-transition", "chapter3-transition", "chapter4-transition", "chapter5-transition", "campaign-complete"].includes(save.stage)) {
      this.teleportToSafePosition(this.destinationForCheckpoint(save.checkpoint, save.stage));
    }

    if (save.checkpoint === "body-defeated" && !save.inventory.includes("bodyCard")) {
      this.boss.markDefeatedForRestore();
      this.world.revealBodyCard(this.boss.getNose());
      this.objectives.set("inspect-nose", "INSPECIONE O NARIZ DE BODY.");
    }
    if (save.stage === "boss") {
      this.boss.start(Math.max(1, save.bossPhase));
      this.objectives.set("defeat-body", "DERROTE BODY.");
    }
    if (save.stage === "chapter2-transition") await this.startChapterTransition();
    // Chapter restore routines may place the player before every collider has updated.
    // Validate the final position on the next frame so saves/checkpoints can never
    // leave the collision ellipsoid inside a station, wall or closed door.
    window.setTimeout(() => this.correctUnsafePlayerPosition(), 0);
    this.ui.toast("Jogo carregado.");
  }

  private enterMenuMode(): void {
    this.stage = "menu";
    this.paused = false;
    this.inventoryOpen = false;
    this.player.setEnabled(false);
    this.player.releasePointerLock();
    this.ui.hideHud();
    this.ui.hidePause();
    this.ui.hideInventory();
    this.guide.setEnabled(false);
    this.ui.setEndingGallery(this.saveSystem.getEndingGallery());
    this.ui.showMenu();
    this.menuRoot.setEnabled(true);
    this.menuProjector.intensity = 12;
    this.player.teleport(new Vector3(0, 2.2, -48), 0);
    this.player.lookAtWorld(new Vector3(0, 3.3, -35));
    this.audio.stopAll();
    if (this.audio.unlocked) this.audio.startProjector();
    this.ui.setContinueEnabled(this.saveSystem.hasSave());
  }

  private enterWonderWorld(): void {
    if (this.world.enteredWonderWorld) return;
    this.world.enteredWonderWorld = true;
    this.stage = "chapter1";
    this.audio.stopLoop("rain");
    this.audio.startInteriorHum();
    this.player.teleport(new Vector3(18.2, 0.12, 42.4), Math.PI);
    this.ui.showSoundCaption("a porta de metal bate atrás de você");
    this.audio.impact(1.3);
    window.setTimeout(() => {
      this.world.closeSideEntranceBehindPlayer();
      this.fire.torchLit = false;
    }, 600);
    void this.ui.showChapterCard("ATRAÇÃO FINAL", "CAPÍTULO 1 · O CORPO", 4300).then(() => {
      this.objectives.set("search-friends", "PROCURE SINAIS DOS SEUS AMIGOS E RESTAURE A ELETRICIDADE.");
      this.ui.showSubtitle("Protagonista", "Ei! Vocês estão aí?", 3200);
      this.checkpoint("chapter1-entry", "chapter1");
    });
  }

  private startBoss(): void {
    if (this.boss.active || this.world.bodyDefeated) return;
    this.stage = "boss";
    this.objectives.set("defeat-body", "DERROTE BODY.");
    this.ui.showSubtitle("Body", "Braços para abraçar. Pernas para correr. Você trouxe o resto?", 6200);
    this.audio.playVoiceLikeLine(4.2);
    this.boss.start(1);
    this.checkpoint("body-phase-1", "boss", 1);
  }

  private finishBoss(): void {
    this.world.bodyDefeated = true;
    this.boss.detachNose();
    this.ui.hideBossUI();
    this.ui.showSubtitle("Voz desconhecida", "Você não se lembra porque eles tiraram isso de você.", 6100);
    this.audio.playVoiceLikeLine(3.8);
    this.world.revealBodyCard(this.boss.getNose());
    this.objectives.set("inspect-nose", "INSPECIONE O NARIZ DE BODY.");
    this.stage = "chapter1";
    this.checkpoint("body-defeated", "chapter1");
  }

  private async startChapterTransition(): Promise<void> {
    if (this.chapterTransitionStarted) return;
    this.chapterTransitionStarted = true;
    this.stage = "chapter2-transition";
    this.player.setEnabled(false);
    this.player.releasePointerLock();
    this.objectives.set("chapter2-descend", "AGUARDE O ELEVADOR CONCLUIR A DESCIDA.");
    this.audio.impact(0.8);
    this.checkpoint("chapter2-transition", "chapter2-transition");
    await new Promise<void>((resolve) => window.setTimeout(resolve, 950));
    await this.ensureBuiltThrough(2, "Preparando o departamento de modelagem…");
    await this.ui.showChapterCard("CAPÍTULO 2 — NÃO VIRE AS COSTAS.", "", 4700);
    this.stage = "chapter2";
    this.chapterTransitionStarted = false;
    this.requireChapter2().startFromElevator();
  }

  private async finishChapter2(): Promise<void> {
    if (this.chapterTransitionStarted && this.stage === "chapter3-transition") return;
    this.chapterTransitionStarted = true;
    this.stage = "chapter3-transition";
    this.player.setEnabled(false);
    this.player.releasePointerLock();
    this.checkpoint("chapter3-transition", "chapter3-transition");
    await this.ensureBuiltThrough(3, "Preparando a caixa de sustos…");
    await this.ui.showChapterCard("CAPÍTULO 3 — A CAIXA DE SUSTOS.", "", 5600);
    this.stage = "chapter3";
    this.chapterTransitionStarted = false;
    this.requireChapter3().startFromTransition();
  }

  private async finishChapter3(): Promise<void> {
    if (this.chapterTransitionStarted && this.stage === "chapter4-transition") return;
    this.chapterTransitionStarted = true;
    this.stage = "chapter4-transition";
    this.player.setEnabled(false);
    this.player.releasePointerLock();
    this.checkpoint("chapter4-transition", "chapter4-transition");
    await this.ensureBuiltThrough(4, "Preparando a prisão subterrânea…");
    await this.ui.showChapterCard("CAPÍTULO 4 — O CAMINHO SEGURO.", "", 5800);
    this.stage = "chapter4";
    this.chapterTransitionStarted = false;
    this.requireChapter4().startFromTransition();
  }

  private async finishChapter4(): Promise<void> {
    if (this.chapterTransitionStarted && this.stage === "chapter5-transition") return;
    this.chapterTransitionStarted = true;
    this.stage = "chapter5-transition";
    this.player.setEnabled(false);
    this.player.releasePointerLock();
    this.checkpoint("chapter5-transition", "chapter5-transition");
    await this.ensureBuiltThrough(5, "Preparando os arquivos centrais…");
    await this.ui.showChapterCard("CAPÍTULO 5 — PROVA DE VIDA.", "", 5800);
    this.stage = "chapter5";
    this.chapterTransitionStarted = false;
    this.requireChapter5().startFromTransition(this.requireChapter4().serialize().postDefeatAttackCount);
  }

  private finishChapter5(): void {
    this.stage = "campaign-complete";
    this.lastCheckpoint = "campaign-complete";
    this.saveSystem.write(this.currentSavePayload());
    this.ui.setContinueEnabled(true);
    this.ui.showDocument(
      "CAMPANHA CONCLUÍDA",
      "O final verdadeiro foi registrado. Você pode retornar ao menu, revisar os finais descobertos ou iniciar uma nova campanha sem apagar este registro.",
      () => this.enterMenuMode()
    );
  }

  private togglePause(): void {
    if (this.inventoryOpen) {
      this.closeInventory();
      return;
    }
    if (this.stage === "menu" || this.chapterTransitionStarted) return;
    this.paused = !this.paused;
    this.player.setEnabled(!this.paused);
    if (this.paused) {
      this.player.releasePointerLock();
      this.ui.showPause((action) => {
        if (action === "resume") this.togglePause();
        else if (action === "tips") this.openTips(false);
        else if (action === "settings") this.openSettings(false, false);
        else if (action === "menu") {
          this.paused = false;
          this.saveSystem.write(this.currentSavePayload());
          this.enterMenuMode();
        }
      });
    } else {
      this.ui.hidePause();
      this.player.requestPointerLock();
    }
  }

  private toggleInventory(): void {
    if (this.stage === "menu" || this.chapterTransitionStarted) return;
    if (this.inventoryOpen) {
      this.closeInventory();
      return;
    }
    if (this.paused || !this.player.enabled) return;
    this.inventoryOpen = true;
    this.player.setEnabled(false);
    this.player.releasePointerLock();
    this.ui.setInteractionPrompt(null);
    this.ui.showInventory(this.inventory.list(), () => this.closeInventory());
  }

  private closeInventory(): void {
    if (!this.inventoryOpen) return;
    this.inventoryOpen = false;
    this.ui.hideInventory();
    if (this.stage !== "menu" && !this.chapterTransitionStarted && !this.paused) {
      this.player.setEnabled(true);
      this.ui.toast("Clique no jogo para retomar o controle do mouse.", 1800);
    }
  }

  private openTips(fromMenu: boolean): void {
    const objective = fromMenu
      ? "INICIE OU CONTINUE UMA PARTIDA PARA RECEBER ORIENTAÇÕES DO OBJETIVO ATUAL."
      : this.objectives.get().text;
    const hints = fromMenu
      ? [
          "Durante a partida, abra o menu de pausa com Esc e selecione DICAS.",
          "O painel sempre acompanha o objetivo atual e mostra os próximos passos sem revelar toda a história.",
          "Objetos interativos exibem uma mensagem quando você olha para eles de perto."
        ]
      : this.hintsForCurrentObjective();
    this.ui.showTips(objective, hints);
  }

  private hintsForCurrentObjective(): string[] {
    const id = this.objectives.get().id;
    const hints: Record<string, string[]> = {
      "wait-friends": [
        "Explore o estacionamento enquanto espera; o prólogo avança sozinho após alguns segundos.",
        "Observe os carros, o galpão de manutenção à esquerda e a fachada do Wonder World.",
        "Quando ouvir um grito vindo do prédio, procure uma forma de entrar."
      ],
      "find-entry": [
        "Vá até o pequeno galpão de manutenção no lado esquerdo do estacionamento.",
        "Pegue a tocha improvisada no chão usando E.",
        "Depois, procure combustível no porta-malas de um dos carros abandonados."
      ],
      "find-fuel": [
        "O combustível está no porta-malas do carro mais à esquerda do estacionamento.",
        "Interaja uma vez para forçar o porta-malas e outra vez para retirar a gasolina.",
        "Com a tocha abastecida, siga para a parte danificada da cerca à direita."
      ],
      "cross-fence": [
        "Acenda a tocha com F.",
        "A seção quebrada da cerca fica no lado direito da fachada, perto da entrada lateral.",
        "Aproxime-se do painel inclinado e use E para levantá-lo."
      ],
      "reach-side-door": [
        "Passe pela abertura da cerca e aproxime-se da porta metálica lateral.",
        "Mantenha a tocha acesa para enxergar a trava quebrada.",
        "Use E na porta para entrar no Wonder World."
      ],
      "search-friends": [
        "Procure a chave do quadro elétrico na loja de presentes.",
        "Explore as áreas próximas para encontrar fusível, cabo e manivela.",
        "Leve as quatro peças ao setor elétrico e interaja com o painel."
      ],
      "restore-power": [
        "Você precisa de quatro peças: chave, fusível, cabo e manivela.",
        "A chave está na loja de presentes; as outras peças ficam em setores próximos do corredor principal.",
        "Empurre o caixote da manutenção para revelar o cabo escondido no chão."
      ],
      "repair-power-panel": [
        "As quatro peças já foram coletadas.",
        "Volte ao setor elétrico no corredor da esquerda.",
        "Interaja com o quadro elétrico para instalar as peças e ligar a energia."
      ],
      "survive-plush": [
        "Use a tocha acesa contra os brinquedos quando eles se aproximarem.",
        "Não fique cercado entre as estantes; use os corredores para recuar.",
        "Continue procurando as peças do quadro elétrico depois de sobreviver ao ataque."
      ],
      "solve-body-puzzles": [
        "Há quatro salas temáticas: mãos, olhos, coração e pés.",
        "Mãos: 2, 4, 3 e 1 giros finais. Olhos: 2, 3 e 4 giros. Coração: válvulas 2, 1 e 3, depois três pulsações regulares. Pés: 1, 3, 2, 4.",
        "Concluir as quatro partes abre o caminho para o auditório."
      ],
      "enter-auditorium": [
        "Retorne ao corredor central e siga até a porta marcada TEATRO BODY.",
        "A porta deve estar aberta depois dos quatro puzzles.",
        "Prepare a tocha e procure cobertura antes de avançar."
      ],
      "defeat-body": [
        "Observe o padrão dos ataques e use as cadeiras como cobertura.",
        "Aproxime-se apenas durante as janelas em que Body fica vulnerável.",
        "Use curativos quando a vida estiver baixa."
      ],
      "inspect-nose": [
        "Aproxime-se da cabeça de Body depois da luta.",
        "Olhe diretamente para o nariz e use E.",
        "Recolha o cartão liberado para continuar."
      ],
      "unlock-underground": [
        "Leve o Cartão do Corpo até o leitor perto do elevador subterrâneo.",
        "Olhe para o leitor e use E.",
        "Entre no elevador quando a passagem abrir."
      ],
      "learn-observation": [
        "Os manequins só avançam quando deixam seu campo de visão.",
        "Caminhe de costas quando necessário e faça movimentos lentos.",
        "Mantenha o grupo enquadrado até alcançar a saída do corredor."
      ],
      "recover-cells": [
        "Explore os três setores laterais do departamento de modelagem.",
        "Cada célula de energia está ligada a um pequeno desafio ambiental.",
        "Volte à máquina central quando reunir as três."
      ],
      "blackout-control": [
        "Localize as três chaves de reserva antes do próximo apagão.",
        "Ative uma chave por vez e memorize a rota entre elas.",
        "Durante a escuridão, use som e observação para evitar os manequins."
      ],
      "activate-machine": [
        "Insira as três células na máquina central.",
        "Verifique os módulos ao redor e ative os sistemas ainda apagados.",
        "Acompanhe o contador mostrado no objetivo."
      ],
      "sphere-arena-1": [
        "Produza som para atrair os manequins até os trilhos.",
        "Espere o grupo ficar sobre a área de impacto.",
        "Libere a esfera quando o caminho estiver alinhado."
      ],
      "sphere-arena-2": [
        "Observe para qual ramo os trilhos conduzem a esfera.",
        "Remova os bloqueios do caminho escolhido.",
        "Use sons para manter os manequins na trajetória."
      ],
      "sphere-arena-3": [
        "Continue se movendo entre as zonas seguras durante as ondas.",
        "Use a esfera quando vários inimigos estiverem alinhados.",
        "Acione o retorno para reutilizá-la."
      ],
      "follow-music": [
        "Pare por alguns segundos e identifique de onde vem a melodia.",
        "Siga o som pelos corredores, verificando portas laterais.",
        "A caixa de música marca a rota de saída."
      ],
      "follow-jesse-melody": [
        "Use fones ou as legendas de som para localizar a melodia.",
        "A intensidade aumenta conforme você se aproxima.",
        "Prepare uma rota de fuga antes de interagir com a caixa."
      ],
      "escape-jesse": [
        "Corra sem parar em direção ao elevador de serviço.",
        "Feche portas atrás de você para ganhar alguns segundos.",
        "Evite becos e não pare para explorar durante a perseguição."
      ],
      "activate-five-generators": [
        "Siga a numeração e os cabos para localizar cada gerador.",
        "Alguns exigem componentes encontrados perto de Daniel.",
        "O quinto gerador precisa da ajuda de Maya."
      ],
      "escape-cell": [
        "Examine a cela inteira e procure peças soltas perto da cama e da parede.",
        "Use o intercomunicador para provocar uma falha no sistema.",
        "Aja quando a iluminação do corredor oscilar."
      ],
      "cross-fragile-floor": [
        "Observe rachaduras, marcas e padrões antes de pisar.",
        "Atravesse uma placa por vez e evite áreas já danificadas.",
        "Recuar rapidamente pode quebrar o piso atrás de você."
      ],
      "identify-mimic": [
        "Compare memórias, ferimentos, reflexos e movimentos das identidades.",
        "Procure contradições antes de acusar alguém.",
        "Reúna várias evidências; uma pista isolada pode ser uma armadilha."
      ],
      "approach-noah": [
        "Avance devagar e mantenha a voz enquadrada antes de chegar perto.",
        "Não ataque imediatamente; observe sinais de respiração e reação.",
        "Use E quando o prompt de interação aparecer."
      ],
      "prove-life": [
        "Siga as instruções do teste e coordene suas ações com Noah.",
        "Use comandos de companheiro quando o jogo solicitar duas posições.",
        "Sinais humanos consistentes são mais importantes que velocidade."
      ],
      "search-archives": [
        "Investigue terminais, gavetas e documentos junto de Noah.",
        "Mantenha Noah por perto para ações sincronizadas.",
        "Procure registros ligados ao seu nome e à infância."
      ],
      "find-own-file": [
        "Siga os números de arquivo e referências encontradas nos documentos.",
        "O arquivo infantil está em um setor mais profundo dos arquivos centrais.",
        "Depois de encontrá-lo, leve as informações ao núcleo."
      ],
      "final-jesse": [
        "Não deixe Noah muito distante durante a fuga.",
        "Use obstáculos e portas para atrasar Jesse.",
        "Priorize a rota de saída em vez de enfrentar a criatura."
      ]
    };

    return hints[id] ?? [
      "Leia o objetivo atual no topo da tela e explore a área relacionada.",
      "Aproxime-se de objetos, portas e mecanismos; use E quando o prompt aparecer.",
      "Observe luzes, sons, cabos, marcas no chão e documentos: eles indicam a próxima ação."
    ];
  }

  private openSettings(accessibilityOnly: boolean, fromMenu: boolean): void {
    this.ui.showSettings(this.settingsStore.value, {
      onSave: (settings) => {
        const saved = this.settingsStore.save(settings);
        this.applySettings(saved);
        // The pause screen remains mounted below settings, preserving its original callbacks.
      },
      onReset: () => {
        const defaults = this.settingsStore.reset();
        this.applySettings(defaults);
        this.ui.toast("Configurações restauradas.");
      },
      onClose: () => {
        if (fromMenu) this.ui.showMenu();
      }
    }, accessibilityOnly);
  }

  private applySettings(settings: GameSettings): void {
    this.ui.applySettings(settings);
    this.audio.applySettings(settings);
    this.player.applySettings(settings);
    this.interaction.setHighContrast(settings.highContrastInteractions);
    this.boss.setExtendedReactionWindows(settings.extendedBossWindows);
    this.chapter2?.applySettings(settings);
    this.chapter3?.applySettings(settings);
    this.chapter4?.applySettings(settings);
    this.chapter5?.applySettings(settings);
    const scaling = settings.performancePreset === "performance" ? 1.5 : settings.performancePreset === "cinematic" ? 0.82 : 1;
    this.engine.setHardwareScalingLevel(scaling);
    this.scene.fogDensity = settings.performancePreset === "performance" ? 0.012 : 0.009;
  }

  private toggleTorch(): void {
    if (!this.player.enabled || (!this.inventory.has("torch") && !this.inventory.has("replacementTorch"))) return;
    if (this.stage === "chapter2" && !this.requireChapter2().canUseTorch()) {
      this.ui.toast("A corrente de ar apaga a chama antes que ela se forme.");
      return;
    }
    if (this.stage === "chapter3" && !this.requireChapter3().canUseTorch()) {
      this.ui.toast("O gás e a ventilação tornam a chama perigosa neste setor.");
      return;
    }
    if (this.stage === "chapter5" && !this.requireChapter5().canUseTorch()) {
      this.ui.toast("A chama não pode ser usada durante esta sequência.");
      return;
    }
    if (this.stage === "chapter4" && !this.requireChapter4().canUseTorch()) {
      this.ui.toast("Seu equipamento ainda está no depósito de evidências.");
      return;
    }
    const changed = this.fire.toggleTorch();
    if (!changed) this.ui.toast("A tocha está sem combustível.");
    else {
      if (this.stage === "chapter3") this.requireChapter3().emitTorchNoise(false);
      this.ui.toast(this.fire.torchLit ? "Tocha acesa." : "Tocha apagada.", 1100);
    }
  }

  private usePrimaryAction(charged = false): void {
    if (!this.player.enabled) return;
    if (this.stage === "chapter5" && this.requireChapter5().handlePrimaryAttack(charged)) return;
    if (this.stage === "chapter4" && this.requireChapter4().handlePrimaryAttack(charged)) return;
    if (this.stage === "chapter3" && this.requireChapter3().handlePrimaryAttack(charged)) return;
    if (this.stage === "chapter2" && (charged || !this.fire.torchLit) && this.requireChapter2().handlePrimaryAttack(charged)) return;
    if ((this.stage === "prologue" || this.stage === "chapter1") && (charged || !this.fire.torchLit) && this.world.handlePrimaryAttack(charged)) return;
    if (!charged) this.useTorch();
  }

  private useTorch(): void {
    if (!this.player.enabled || !this.fire.torchLit) return;
    if (this.stage === "chapter2" && !this.requireChapter2().canUseTorch()) return;
    if (this.stage === "chapter3" && !this.requireChapter3().canUseTorch()) return;
    if (this.stage === "chapter5" && !this.requireChapter5().canUseTorch()) return;
    if (this.stage === "chapter4" && !this.requireChapter4().canUseTorch()) return;
    if (this.stage === "chapter3") this.requireChapter3().emitTorchNoise(true);
    const burned = this.fire.useTorch();
    if (burned) this.ui.showSoundCaption("o tecido estala e começa a queimar");
  }

  private throwObject(): void {
    if (!this.player.enabled) return;
    if (this.stage === "chapter5" && this.requireChapter5().throwObject()) return;
    if (this.stage === "chapter3") {
      this.requireChapter3().throwObject();
      return;
    }
    if (this.stage === "chapter2" && this.requireChapter2().throwNoiseObject()) this.audio.metalLure(this.player.camera.globalPosition);
  }

  private deploySoundDevice(): void {
    if (!this.player.enabled || this.stage !== "chapter2") return;
    this.requireChapter2().deploySoundDevice();
  }

  private closeRearDoor(): void {
    if (!this.player.enabled) return;
    if (this.stage === "chapter3" && this.requireChapter3().closeRearDoor()) return;
    if (this.stage === "chapter2") this.requireChapter2().closeNearestRearDoor();
  }

  private contextAction(): void {
    if (!this.player.enabled) return;
    if (this.stage === "chapter5") {
      this.requireChapter5().handleContextAction();
      return;
    }
    if (this.stage === "chapter4") {
      this.requireChapter4().handleContextAction();
      return;
    }
    if (this.stage === "chapter3") this.requireChapter3().handleContextAction();
  }

  private update(deltaSeconds: number): void {
    // Keep simulation, camera and rendering in one deterministic loop. The old
    // controller ran from Scene.onBeforeRender, after the game systems had already
    // updated, which allowed the collider/audio to advance while a stale camera was
    // rendered on some browsers.
    this.player.update(deltaSeconds);
    this.updateMovementDiagnostics(deltaSeconds);
    const time = performance.now() * 0.001;
    if (this.stage === "menu") {
      this.updateMenuBackdrop(time);
      return;
    }
    if (this.paused || this.inventoryOpen) return;
    this.interaction.update(deltaSeconds);
    this.guide.update(deltaSeconds);
    if (this.stage === "chapter5" || this.stage === "campaign-complete") this.requireChapter5().update(deltaSeconds);
    else if (this.stage === "chapter4" || this.stage === "chapter5-transition") this.requireChapter4().update(deltaSeconds);
    else if (this.stage === "chapter3" || this.stage === "chapter4-transition") this.requireChapter3().update(deltaSeconds);
    else if (this.stage === "chapter2" || this.stage === "chapter3-transition") this.requireChapter2().update(deltaSeconds);
    else this.world.update();
    this.fireDamageCooldown = Math.max(0, this.fireDamageCooldown - deltaSeconds);
    if (this.fire.nearestFireDistance(this.player.collider.position) < 1.15 && this.fireDamageCooldown <= 0) {
      this.player.damage(6);
      this.ui.flashDamage(0.35);
      this.ui.showSoundCaption("o calor queima sua pele", 1000);
      this.fireDamageCooldown = 0.65;
    }
    this.ui.updateStatus(this.player.health, this.fire.fuel, this.inventory.list(), this.lives, this.player.armor);
    this.ui.setStamina(this.player.stamina);
    if (this.stage === "prologue" || this.stage === "chapter1") this.updateLightning(deltaSeconds);
    if (this.stage === "prologue") this.updatePrologue(deltaSeconds);
    if (this.player.health < 25 && Math.random() < deltaSeconds * 0.4) this.ui.showSoundCaption("respiração ofegante", 1200);
  }


  private toggleGuide(): void {
    const enabled = this.guide.toggle();
    this.ui.toast(enabled ? "GUIA LUMINOSO ATIVADO · siga as marcas no chão." : "Guia luminoso desativado.", 1800);
  }

  private guideRouteForCurrentObjective(): Vector3[] | null {
    const objectiveId = this.objectives.get().id;
    if (this.stage === "prologue" || this.stage === "chapter1" || this.stage === "boss") return this.world.getGuideRoute(objectiveId);

    let roomTarget: Vector3 | null = null;
    if (this.stage === "chapter2" || this.stage === "chapter3-transition") {
      const c = this.requireChapter2().checkpoints;
      const map: Record<string, Vector3> = {
        "chapter2-descend": c.chapter2Elevator!, "learn-observation": c.mannequinCorridor!, "recover-cells": c.mirrorRoom!,
        "blackout-control": c.controlRoom!, "activate-machine": c.machine!, "sphere-arena-1": c.arena1!,
        "sphere-arena-2": c.arena2!, "sphere-arena-3": c.arena3!, "escape-arena": c.maya!, "sphere-return": c.maya!, "follow-music": c.chapter3!
      };
      roomTarget = this.requireChapter2().guideTargetForObjective(objectiveId) ?? map[objectiveId]?.clone() ?? null;
    } else if (this.stage === "chapter3" || this.stage === "chapter4-transition") {
      const c = this.requireChapter3().checkpoints;
      const map: Record<string, Vector3> = {
        "follow-jesse-melody": c.musicCorridor!, "watch-jack-box": c.jackChamber!, "escape-jesse": c.chase4!,
        "survive-elevator": c.serviceElevator!, "inspect-daniel-room": c.danielRoom!, "collect-daniel-items": c.danielRoom!,
        "activate-five-generators": this.nearestInactiveGeneratorTarget(c), "ventilate-gas-room": c.generator3!, "reach-generator5": c.generator5!,
        "synchronize-generator5": c.generator5!, "talk-to-maya": c.mayaChamber!, "watch-maya": c.mayaChamber!
      };
      roomTarget = map[objectiveId]?.clone() ?? null;
    } else if (this.stage === "chapter4" || this.stage === "chapter5-transition") {
      const c = this.requireChapter4().checkpoints;
      const map: Record<string, Vector3> = {
        "wake-prison": c.prisonCell!, "escape-cell": c.prisonCell!, "open-cell-lock": c.observationCorridor!,
        "observe-guard": c.guardStation!, "repair-intercom": c.guardStation!, "cross-fragile-floor": c.fragileFloor!,
        "choose-route": c.choice!, "recover-equipment": c.equipment!, "follow-blood": c.blood!,
        "identify-mimic": c.identityTesting!, "defeat-mimic": c.mimicArena!, "search-mimic-remains": c.mimicArena!,
        "reach-archives": c.archives!, "after-mimic": c.archives!, "find-maintenance-route": c.chapter5!
      };
      roomTarget = map[objectiveId]?.clone() ?? null;
    } else if (this.stage === "chapter5" || this.stage === "campaign-complete") {
      const c = this.requireChapter5().checkpoints;
      const map: Record<string, Vector3> = {
        "approach-noah": c.proof!, "prove-life": c.proof!, "search-archives": c.employeeArchives!, "find-own-file": c.employeeArchives!,
        "recover-memory": c.memoryLab!, "escape-collapse": c.archiveCore!, "body-return": c.burnedAuditorium!,
        "mannequin-return": c.mannequinTransit!, "escape-mannequin": c.mannequinTransit!, "final-jesse": c.finalJesse!,
        "burning-archives": c.burningArchives!, "maintenance-bridge": c.bridge!, "synchronized-exit": c.finalExit!
      };
      roomTarget = map[objectiveId]?.clone() ?? null;
    }

    if (!roomTarget) return null;
    const preciseTarget = this.interaction.getGuideTarget(objectiveId, roomTarget, 28) ?? roomTarget;
    return this.buildCampaignGuideRoute(preciseTarget);
  }

  private nearestInactiveGeneratorTarget(checkpoints: Record<string, Vector3>): Vector3 {
    const chapter = this.requireChapter3();
    const states = chapter.generatorStates;
    const targets = [checkpoints.generator1!, checkpoints.generator2!, checkpoints.generator3!, checkpoints.generator4!, checkpoints.generator5!];
    const pending = targets.filter((_target, index) => !states[index]);
    if (pending.length === 0) return checkpoints.generator5!.clone();
    return pending.sort((a, b) => Vector3.Distance(a, this.player.collider.position) - Vector3.Distance(b, this.player.collider.position))[0]!.clone();
  }

  private buildCampaignGuideRoute(target: Vector3): Vector3[] {
    const player = this.player.collider.position.clone();
    const y = Math.max(0.12, Math.min(player.y, target.y));
    type PortalZone = { bounds: [number, number, number, number]; portal: (point: Vector3) => Vector3 };
    const fixed = (x: number, z: number, py = y) => (_point: Vector3) => new Vector3(x, py, z);
    const zones: PortalZone[] = [
      { bounds: [-40, -11, 263, 298], portal: fixed(-10.2, 270) },
      { bounds: [11, 42, 260, 304], portal: fixed(10.2, 272) },
      { bounds: [-42, -11, 302, 335], portal: fixed(-10.2, 309) },
      { bounds: [11, 41, 306, 335], portal: fixed(10.2, 320) },
      { bounds: [-40, -8, 784, 812], portal: fixed(-7.2, 798) },
      { bounds: [8, 40, 815, 846], portal: fixed(7.2, 830) },
      { bounds: [-40, -8, 849, 883], portal: fixed(-7.2, 866) },
      { bounds: [8, 40, 888, 920], portal: fixed(7.2, 904) },
      { bounds: [-30, -5, 1105, 1130], portal: fixed(-5.2, 1118) },
      { bounds: [5, 30, 1128, 1157], portal: fixed(5.2, 1142) },
      { bounds: [-28, -16, 1250, 1315], portal: (point) => new Vector3(-16.8, y, point.z < 1282 ? 1253 : 1311) },
      { bounds: [16, 28, 1250, 1315], portal: (point) => new Vector3(16.8, y, point.z < 1282 ? 1253 : 1311) }
    ];
    const findZone = (point: Vector3): PortalZone | null => zones.find(({ bounds }) => point.x >= bounds[0] && point.x <= bounds[1] && point.z >= bounds[2] && point.z <= bounds[3]) ?? null;
    const route: Vector3[] = [];
    const push = (point: Vector3): void => {
      const adjusted = point.clone();
      adjusted.y = Number.isFinite(point.y) ? point.y : y;
      const previous = route[route.length - 1];
      if (!previous || Vector3.Distance(previous, adjusted) > 0.65) route.push(adjusted);
    };
    const playerZone = findZone(player);
    const targetZone = findZone(target);
    if (playerZone && playerZone === targetZone) return [target.clone()];

    if (playerZone) {
      const portal = playerZone.portal(player);
      push(portal);
      push(new Vector3(0, portal.y, portal.z));
    } else if (Math.abs(player.x) > 7.5 && player.z < 1470) {
      push(new Vector3(0, y, player.z));
    }

    if (targetZone) {
      const portal = targetZone.portal(target);
      push(new Vector3(0, portal.y, portal.z));
      push(portal);
      push(target);
    } else {
      if (Math.abs(target.x) <= 8 && Math.abs(player.z - target.z) > 7) push(new Vector3(0, target.y, target.z));
      push(target);
    }
    return route;
  }

  private activateSurvivalCheckpoint(id: string, position: Vector3): void {
    this.lastCheckpoint = id;
    this.runtimeCheckpointPositions.set(id, this.findSafeSpawnPosition(position));
    this.lives = Math.min(this.maxLives, this.lives + 1);
    this.player.health = 100;
    this.saveSystem.write(this.currentSavePayload());
    this.ui.setContinueEnabled(true);
    this.ui.toast(`CHECKPOINT SALVO · ${this.lives}/${this.maxLives} vidas`, 2100);
  }

  private handleRespawn(message: string): void {
    this.lives = Math.max(0, this.lives - 1);
    if (this.lives <= 0) {
      this.lives = this.maxLives;
      this.player.armor = 0;
      this.fire.fuel = Math.max(0, this.fire.fuel - 15);
      this.ui.toast("SEM VIDAS · retorno ao último checkpoint. Combustível e proteção foram parcialmente perdidos.", 4300);
    } else {
      this.ui.toast(`${message} · ${this.lives} ${this.lives === 1 ? "vida restante" : "vidas restantes"}.`, 3200);
    }
    this.player.health = Math.max(45, this.player.health);
    this.world.resetEnemiesForPlayerRespawn();
    if (this.chapter2Built) this.chapter2?.resetEnemiesForPlayerRespawn();
    if (this.chapter3Built) this.chapter3?.resetEnemiesForPlayerRespawn();
    const destination = this.destinationForCheckpoint(this.lastCheckpoint, this.stage);
    window.setTimeout(() => this.teleportToSafePosition(destination), 0);
    this.saveSystem.write(this.currentSavePayload());
  }

  private updatePrologue(deltaSeconds: number): void {
    this.prologueElapsed += deltaSeconds;
    this.ambientTimer -= deltaSeconds;
    if (this.ambientTimer <= 0) {
      this.playPrologueAmbientEvent();
      this.ambientTimer = 4.8 + Math.random() * 4.5;
    }
    if (!this.screamPlayed && this.prologueElapsed > 18) {
      this.screamPlayed = true;
      this.audio.plushCry();
      this.ui.showSoundCaption("um grito humano ecoa de dentro do prédio", 4200);
      this.ui.showSubtitle("Voz distante", "NÃO! SOLTA—", 3000);
      this.objectives.set("find-entry", "ENCONTRE UMA ENTRADA PARA O WONDER WORLD.");
    }
  }

  private playPrologueAmbientEvent(): void {
    const events = [
      () => {
        this.audio.impact(0.45);
        this.ui.showSoundCaption("um impacto metálico distante");
      },
      () => {
        this.ui.showSoundCaption("um motor de brinquedo gira por alguns segundos");
        this.audio.plushCry();
      },
      () => {
        this.ui.flashLightning();
        this.ui.showSoundCaption("uma silhueta desaparece atrás de uma janela");
      },
      () => {
        this.world.flashRandomCarHeadlights(1900);
        this.audio.impact(0.22);
        this.ui.showSoundCaption("os faróis de um carro acendem sozinhos");
      }
    ];
    events[this.ambientEventIndex % events.length]?.();
    this.ambientEventIndex += 1;
  }

  private updateLightning(deltaSeconds: number): void {
    this.nextLightning -= deltaSeconds;
    if (this.nextLightning > 0) return;
    this.nextLightning = 5 + Math.random() * 11;
    this.ui.flashLightning();
    this.audio.thunder(0.75 + Math.random() * 0.35);
    const exteriorLight = this.scene.getLightByName("storm-directional");
    if (exteriorLight) {
      exteriorLight.intensity = 4.8;
      window.setTimeout(() => exteriorLight.intensity = 0.55, 140);
    }
  }

  private checkpoint(checkpoint: string, stage: GameStage, bossPhase = this.boss.phase): void {
    this.lastCheckpoint = checkpoint;
    this.stage = stage;
    // Automatic checkpoints used to save only a room-centre identifier. Several
    // of those centres overlap consoles, gates or checkpoint props. Preserve the
    // player's nearest collision-free position at the exact moment of progress.
    const current = this.player.collider.position.clone();
    const blockedAtCheckpoint = this.isSpawnPositionBlocked(current);
    const safePosition = this.findSafeSpawnPosition(current);
    this.runtimeCheckpointPositions.set(checkpoint, safePosition);
    if (blockedAtCheckpoint) window.setTimeout(() => this.teleportToSafePosition(safePosition), 0);
    this.saveSystem.write({ ...this.currentSavePayload(), checkpoint, stage, bossPhase });
    this.ui.setContinueEnabled(true);
  }

  private currentSavePayload(): Omit<SaveData, "version" | "updatedAt"> {
    return {
      stage: this.stage,
      checkpoint: this.lastCheckpoint,
      checkpointPosition: this.checkpointPositionTuple(),
      objectiveId: this.objectives.get().id,
      inventory: this.inventory.ids(),
      solvedPuzzles: [...this.world.solvedPuzzles],
      powerRestored: this.world.powerRestored,
      torchFuel: this.fire.fuel,
      playerHealth: Math.max(1, this.player.health),
      playerArmor: this.player.armor,
      lives: this.lives,
      bossPhase: this.boss.phase,
      openedContainers: this.world.getOpenedLootContainers(),
      lootedContainers: this.world.getLootedContainers(),
      activatedCheckpoints: this.world.getActivatedCheckpoints(),
      guideEnabled: this.guide.enabled,
      chapter2: this.chapter2?.serialize() ?? DEFAULT_CHAPTER2_SAVE,
      chapter3: this.chapter3?.serialize() ?? DEFAULT_CHAPTER3_SAVE,
      chapter4: this.chapter4?.serialize() ?? DEFAULT_CHAPTER4_SAVE,
      chapter5: this.chapter5?.serialize() ?? DEFAULT_CHAPTER5_SAVE,
      endings: [...this.endings]
    };
  }

  private checkpointPositionTuple(): [number, number, number] {
    const stored = this.runtimeCheckpointPositions.get(this.lastCheckpoint);
    const point = stored ?? this.player.collider.position;
    return [point.x, point.y, point.z];
  }

  private destinationForCheckpoint(checkpoint: string, stage: GameStage): Vector3 {
    const runtimeCheckpoint = this.runtimeCheckpointPositions.get(checkpoint);
    if (runtimeCheckpoint) return runtimeCheckpoint.clone();
    const survivalCheckpoint = this.world.getSurvivalCheckpointPosition(checkpoint);
    if (survivalCheckpoint) return survivalCheckpoint;
    if (stage === "chapter5" || stage === "campaign-complete" || checkpoint.startsWith("chapter5-") || checkpoint === "true-ending" || checkpoint === "post-credits" || checkpoint === "campaign-complete") {
      return this.requireChapter5().destinationForCheckpoint(checkpoint);
    }
    if (stage === "chapter4" || stage === "chapter5-transition" || checkpoint.startsWith("mimic-") || checkpoint === "prisonCell" || checkpoint === "floor-complete" || checkpoint === "equipment-recovered" || checkpoint === "bad-ending-retry" || checkpoint === "chapter5-transition") {
      return this.requireChapter4().destinationForCheckpoint(checkpoint);
    }
    if (stage === "chapter3" || stage === "chapter4-transition" || checkpoint.startsWith("generator-") || checkpoint.startsWith("jesse-chase-") || checkpoint === "daniel" || checkpoint === "maya-reveal" || checkpoint === "chapter4-transition") {
      return this.requireChapter3().destinationForCheckpoint(checkpoint);
    }
    if (stage === "chapter2" || stage === "chapter3-transition" || checkpoint.startsWith("chapter2-") || checkpoint.startsWith("arena-") || checkpoint === "chapter3-transition") {
      return this.requireChapter2().destinationForCheckpoint(checkpoint);
    }
    if (checkpoint.startsWith("body-phase") || checkpoint === "body-defeated") return this.world.checkpoints.auditorium.clone();
    if (checkpoint === "electrical-restored") return this.world.checkpoints.power.clone();
    if (checkpoint === "body-puzzles") return this.world.checkpoints.hands.clone();
    if (checkpoint === "body-card") return this.world.checkpoints.auditorium.clone();
    if (checkpoint === "chapter2-transition" || stage === "chapter2-transition") return this.world.checkpoints.elevator.clone();
    if (checkpoint === "chapter1-entry" || stage === "chapter1") return this.world.checkpoints.lobby.clone();
    return this.world.checkpoints.prologue.clone();
  }

  private teleportToSafePosition(preferred: Vector3, rotationY = 0): void {
    this.player.teleport(this.findSafeSpawnPosition(preferred), rotationY);
  }

  private correctUnsafePlayerPosition(): void {
    if (!this.player.enabled || this.stage === "menu") return;
    const current = this.player.collider.position.clone();
    if (!this.isSpawnPositionBlocked(current)) return;
    const checkpoint = this.runtimeCheckpointPositions.get(this.lastCheckpoint) ?? current;
    this.player.teleport(this.findSafeSpawnPosition(checkpoint));
    this.ui.toast("Posição do checkpoint corrigida para uma área livre.", 1800);
  }

  private findSafeSpawnPosition(preferred: Vector3): Vector3 {
    const offsets: Vector3[] = [Vector3.Zero()];
    for (const radius of [1.4, 2.4, 3.6, 5.0, 6.5]) {
      for (let index = 0; index < 12; index += 1) {
        const angle = index / 12 * Math.PI * 2;
        offsets.push(new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
      }
    }

    for (const offset of offsets) {
      const candidate = preferred.add(offset);
      candidate.y = this.findSpawnFloorHeight(candidate);
      if (!this.isSpawnPositionBlocked(candidate)) return candidate;
    }

    // Last-resort vertical release. This is deliberately above the preferred
    // point and lets Babylon settle the player onto the floor instead of keeping
    // the ellipsoid embedded in a collider.
    return preferred.add(new Vector3(0, 1.35, 0));
  }

  private findSpawnFloorHeight(point: Vector3): number {
    const origin = new Vector3(point.x, point.y + 4.5, point.z);
    const pick = this.scene.pickWithRay(
      new Ray(origin, new Vector3(0, -1, 0), 11),
      (mesh: AbstractMesh) => this.isWalkableSpawnFloor(mesh)
    );
    return pick?.hit && pick.pickedPoint ? pick.pickedPoint.y + 0.12 : point.y;
  }

  private isWalkableSpawnFloor(mesh: AbstractMesh): boolean {
    if (!mesh.checkCollisions || !mesh.isEnabled() || mesh === this.player.collider) return false;
    const name = mesh.name.toLowerCase();
    if (mesh.metadata?.mapBoundary || mesh.metadata?.doorwayBlocker || mesh.metadata?.roomCeiling) return false;
    if (name.includes("wall") || name.includes("door") || name.includes("ceiling") || name.includes("roof") || name.includes("foundation")) return false;
    return Boolean(
      mesh.metadata?.guideFloor
      || mesh.metadata?.continuousInteriorFloor
      || name.includes("floor")
      || name.includes("ground")
      || name.includes("platform")
      || name.includes("stage")
      || name.includes("bridge-section")
      || name.includes("ramp")
      || name.includes("track")
    );
  }

  private isSpawnPositionBlocked(position: Vector3): boolean {
    const radius = 0.56;
    const bottom = position.y + 0.08;
    const top = position.y + 1.78;
    for (const mesh of this.scene.meshes) {
      if (!mesh.checkCollisions || !mesh.isEnabled() || mesh === this.player.collider) continue;
      if (mesh.metadata?.checkpointDecoration || mesh.metadata?.guideMarker) continue;
      const name = mesh.name.toLowerCase();
      if (name.includes("floor") || name.includes("ground") || name.includes("foundation") || name.includes("threshold")) continue;
      mesh.computeWorldMatrix(true);
      const box = mesh.getBoundingInfo().boundingBox;
      if (box.maximumWorld.y <= bottom || box.minimumWorld.y >= top) continue;
      if (box.maximumWorld.x < position.x - radius || box.minimumWorld.x > position.x + radius) continue;
      if (box.maximumWorld.z < position.z - radius || box.minimumWorld.z > position.z + radius) continue;
      return true;
    }
    return false;
  }

  private objectiveTextFor(id: string): string {
    const mapping: Record<string, string> = {
      "wait-friends": "AGUARDE SEUS AMIGOS RETORNAREM.",
      "find-entry": "ENCONTRE UMA ENTRADA PARA O WONDER WORLD.",
      "find-fuel": "ENCONTRE COMBUSTÍVEL EM UM VEÍCULO ABANDONADO.",
      "cross-fence": "ATRAVESSE A SEÇÃO DANIFICADA DA CERCA.",
      "reach-side-door": "ALCANCE A ENTRADA LATERAL.",
      "search-friends": "PROCURE SINAIS DOS SEUS AMIGOS E RESTAURE A ELETRICIDADE.",
      "restore-power": "RESTAURE A ELETRICIDADE.",
      "repair-power-panel": "VOLTE AO QUADRO ELÉTRICO E INSTALE AS PEÇAS.",
      "solve-body-puzzles": "ATIVE AS QUATRO PARTES DO CORPO PARA ABRIR O AUDITÓRIO.",
      "enter-auditorium": "ENTRE NO AUDITÓRIO.",
      "defeat-body": "DERROTE BODY.",
      "inspect-nose": "INSPECIONE O NARIZ DE BODY.",
      "unlock-underground": "USE O CARTÃO DO CORPO NA PASSAGEM SUBTERRÂNEA.",
      "descend": "DESÇA PARA AS INSTALAÇÕES SUBTERRÂNEAS.",
      "chapter2-descend": "AGUARDE O ELEVADOR CONCLUIR A DESCIDA.",
      "learn-observation": "ATRAVESSE O CORREDOR SEM DEIXAR OS MANEQUINS SAÍREM DE VISTA.",
      "recover-cells": "RECUPERE AS TRÊS CÉLULAS DE ENERGIA.",
      "blackout-control": "ATIVE AS TRÊS CHAVES DE RESERVA ENTRE OS APAGÕES.",
      "activate-machine": "ATIVE A MÁQUINA CENTRAL COM AS TRÊS CÉLULAS.",
      "sphere-arena-1": "ATRAIA OS MANEQUINS PARA OS TRILHOS E LIBERE A ESFERA.",
      "sphere-arena-2": "ESCOLHA O TRILHO, REMOVA OS BLOQUEIOS E LIBERE A ESFERA.",
      "sphere-arena-3": "SOBREVIVA ÀS ONDAS E USE O RETORNO DA ESFERA.",
      "sphere-return": "ACIONE O GUINCHO DE RETORNO E ALCANCE UMA ZONA SEGURA.",
      "escape-arena": "FUJA PELA ROTA DE SAÍDA ANTES QUE O SISTEMA REINICIE.",
      "follow-music": "SIGA A MELODIA DA CAIXA DE MÚSICA.",
      "follow-jesse-melody": "SIGA A MELODIA ATÉ A CAIXA DE BRINQUEDO.",
      "watch-jack-box": "ENCONTRE A ORIGEM DA MELODIA.",
      "escape-jesse": "CORRA ATÉ O ELEVADOR DE SERVIÇO.",
      "survive-elevator": "MANTENHA JESSE FORA ATÉ AS PORTAS FECHAREM.",
      "inspect-daniel-room": "EXAMINE DANIEL E RECOLHA O EQUIPAMENTO PRÓXIMO.",
      "collect-daniel-items": "RECOLHA O EQUIPAMENTO DE DANIEL.",
      "activate-five-generators": "ATIVE OS CINCO GERADORES.",
      "ventilate-gas-room": "VENTILE A SALA, DERROTE O EXPERIMENTO E REPARE O GERADOR 3.",
      "reach-generator5": "ALCANCE O GERADOR FINAL. ELE EXIGE DUAS PESSOAS.",
      "talk-to-maya": "APROXIME-SE DE MAYA E ATIVE O GERADOR FINAL.",
      "synchronize-generator5": "SEGURE A ALAVANCA ESQUERDA ENQUANTO MAYA MANTÉM A OUTRA.",
      "watch-maya": "OBSERVE MAYA.",
      "wake-prison": "DESCUBRA ONDE VOCÊ ESTÁ.",
      "escape-cell": "ESCAPE DA CELA SEM SEU EQUIPAMENTO.",
      "repair-intercom": "USE O FIO SOLTO NO INTERCOMUNICADOR.",
      "observe-guard": "OBSERVE O CORREDOR E ACIONE A ALAVANCA DURANTE A FALHA DE LUZ.",
      "open-cell-lock": "USE A HASTE NO MECANISMO DA PORTA.",
      "find-maintenance-route": "ENCONTRE A PASSAGEM DE MANUTENÇÃO ATRÁS DA OBSERVAÇÃO.",
      "cross-fragile-floor": "ATRAVESSE O PISO DE TESTE.",
      "choose-route": "DECIDA ENTRE RECUPERAR O EQUIPAMENTO OU SEGUIR O RASTRO DE SANGUE.",
      "recover-equipment": "RECUPERE SEU EQUIPAMENTO NO DEPÓSITO DE EVIDÊNCIAS.",
      "follow-blood": "SIGA O RASTRO DE SANGUE.",
      "identify-mimic": "REÚNA EVIDÊNCIAS PARA IDENTIFICAR AS FALSAS IDENTIDADES.",
      "defeat-mimic": "SOBREVIVA AO TESTE DE IDENTIDADE.",
      "search-mimic-remains": "PROCURE UMA ROTA PARA OS ARQUIVOS.",
      "reach-archives": "ALCANCE OS NÍVEIS CENTRAIS DE ARQUIVO.",
      "approach-noah": "APROXIME-SE DA VOZ SEM BAIXAR A GUARDA.",
      "prove-life": "PROVE QUE VOCÊ E NOAH SÃO HUMANOS.",
      "search-archives": "INVESTIGUE OS ARQUIVOS CENTRAIS COM NOAH.",
      "find-own-file": "ENCONTRE SEU ARQUIVO INFANTIL E ACESSE O NÚCLEO.",
      "recover-memory": "RECONSTRUA A MEMÓRIA SUPRIMIDA.",
      "escape-collapse": "ESCAPE DOS ARQUIVOS COM NOAH.",
      "body-return": "ATRAVESSE O AUDITÓRIO QUEIMADO.",
      "mannequin-return": "MANTENHA OS MANEQUINS SOB OBSERVAÇÃO.",
      "final-jesse": "FUJA DE JESSE E NÃO DEIXE NOAH PARA TRÁS.",
      "burning-archives": "ATRAVESSE OS ARQUIVOS EM CHAMAS.",
      "maintenance-bridge": "ATRAVESSE A PONTE DE MANUTENÇÃO.",
      "synchronized-exit": "ATIVE OS DOIS LEITORES DE CARTÃO EM SINCRONIA."
    };
    return mapping[id] ?? "CONTINUE EXPLORANDO O WONDER WORLD.";
  }

  private setupSceneLighting(): void {
    const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), this.scene);
    ambient.diffuse = new Color3(0.24, 0.26, 0.3);
    ambient.groundColor = new Color3(0.05, 0.045, 0.04);
    ambient.intensity = 0.42;
    const storm = new DirectionalLight("storm-directional", new Vector3(-0.4, -1, 0.25), this.scene);
    storm.position = new Vector3(20, 35, -20);
    storm.diffuse = new Color3(0.55, 0.66, 0.82);
    storm.intensity = 0.55;
  }

  private installMovementDiagnostics(): void {
    const overlay = document.createElement("pre");
    overlay.id = "movement-diagnostics";
    overlay.style.position = "fixed";
    overlay.style.left = "10px";
    overlay.style.top = "10px";
    overlay.style.zIndex = "1000";
    overlay.style.margin = "0";
    overlay.style.padding = "8px 10px";
    overlay.style.maxWidth = "min(520px, 92vw)";
    overlay.style.whiteSpace = "pre-wrap";
    overlay.style.pointerEvents = "none";
    overlay.style.background = "rgba(0,0,0,.82)";
    overlay.style.border = "1px solid rgba(255,255,255,.3)";
    overlay.style.color = "#d9f2d9";
    overlay.style.font = "12px/1.35 Consolas, monospace";
    overlay.textContent = "Diagnóstico de movimento iniciando…";
    document.body.appendChild(overlay);
    this.movementDebugOverlay = overlay;
  }

  private updateMovementDiagnostics(deltaSeconds: number): void {
    if (!this.movementDebugOverlay) return;
    this.movementDebugAccumulator += deltaSeconds;
    if (this.movementDebugAccumulator < 0.12) return;
    this.movementDebugAccumulator = 0;
    const snapshot = this.player.getDebugSnapshot();
    this.movementDebugOverlay.textContent = [
      "TESTE DE MOVIMENTO · FECHE A ABA PARA ENCERRAR",
      `Fase: ${this.stage} · FPS: ${Math.round(this.engine.getFps())}`,
      `Controle ativo: ${snapshot.enabled ? "SIM" : "NÃO"} · Câmera ativa: ${snapshot.activeCamera ? "SIM" : "NÃO"}`,
      `No chão: ${snapshot.grounded ? "SIM" : "NÃO"} · Mouse capturado: ${snapshot.pointerLocked ? "SIM" : "NÃO"}`,
      `Corpo: ${snapshot.collider}`,
      `Câmera local: ${snapshot.cameraLocal}`,
      `Velocidade: ${snapshot.velocity} · queda: ${snapshot.verticalVelocity}`,
      "WASD deve alterar CORPO e VELOCIDADE. Clique na imagem para capturar o mouse."
    ].join("\n");
  }

  private createMenuBackdrop(): { root: TransformNode; projector: SpotLight } {
    const root = new TransformNode("menu-backdrop", this.scene);
    root.position = new Vector3(0, 0, -35);
    const torso = MeshBuilder.CreateSphere("menu-body-torso", { diameter: 5.2, segments: 14 }, this.scene);
    torso.parent = root;
    torso.position.y = 3.3;
    torso.scaling = new Vector3(1.15, 1.2, 0.8);
    torso.material = this.materials.get("plush", 0);
    this.menuBodyParts.push(torso);
    const head = MeshBuilder.CreateSphere("menu-body-head", { diameter: 3.3, segments: 14 }, this.scene);
    head.parent = root;
    head.position.y = 7;
    head.material = this.materials.get("plush", 0);
    this.menuBodyParts.push(head);
    const nose = MeshBuilder.CreateSphere("menu-body-nose", { diameter: 0.9, segments: 10 }, this.scene);
    nose.parent = head;
    nose.position = new Vector3(0, 0, -1.52);
    nose.material = this.materials.get("plastic", 0);
    this.menuBodyParts.push(nose);
    for (let index = 0; index < 4; index += 1) {
      const arm = MeshBuilder.CreateCapsule(`menu-body-arm-${index}`, { height: 4.1, radius: 0.48, tessellation: 10 }, this.scene);
      arm.parent = root;
      const left = index < 2;
      arm.position = new Vector3(left ? -2.6 : 2.6, index % 2 ? 2.8 : 4.5, 0.2);
      arm.rotation.z = (left ? 1 : -1) * (0.45 + (index % 2) * 0.25);
      arm.material = this.materials.get("plush", 0);
      this.menuBodyParts.push(arm);
    }
    const projector = new SpotLight("menu-projector", new Vector3(-7, 8, -44), new Vector3(0.45, -0.25, 1), Math.PI / 4, 2.2, this.scene);
    projector.diffuse = new Color3(0.95, 0.82, 0.57);
    projector.intensity = 12;
    projector.range = 35;
    return { root, projector };
  }

  private updateMenuBackdrop(time: number): void {
    this.menuProjector.intensity = 7 + Math.random() * 6 + Math.sin(time * 18) * 0.8;
    this.menuProjector.direction.x = 0.4 + Math.sin(time * 0.7) * 0.08;
    this.menuRoot.rotation.y = Math.sin(time * 0.24) * 0.06;
    this.menuBodyParts.forEach((part, index) => {
      if (index > 2) part.rotation.x = Math.sin(time * (0.4 + index * 0.08) + index) * 0.08;
    });
    if (Math.random() < 0.004) this.ui.flashLightning();
  }

  private toggleDebug(): void {
    this.ui.showDebug({
      teleport: (destination) => {
        const chapter5Position = this.requireChapter5().checkpoints[destination];
        const chapter4Position = this.requireChapter4().checkpoints[destination];
        const chapter3Position = this.requireChapter3().checkpoints[destination];
        const chapter2Position = this.requireChapter2().checkpoints[destination];
        if (chapter5Position) {
          this.requireChapter5().enableForDebug();
          this.stage = "chapter5";
          this.world.enteredWonderWorld = true;
          this.player.teleport(chapter5Position.clone());
        } else if (chapter4Position) {
          this.requireChapter4().enableForDebug();
          this.stage = "chapter4";
          this.world.enteredWonderWorld = true;
          this.player.teleport(chapter4Position.clone());
        } else if (chapter3Position) {
          this.requireChapter3().enableForDebug();
          this.stage = "chapter3";
          this.world.enteredWonderWorld = true;
          this.player.teleport(chapter3Position.clone());
        } else if (chapter2Position) {
          this.requireChapter2().enableForDebug();
          this.stage = "chapter2";
          this.world.enteredWonderWorld = true;
          this.player.teleport(chapter2Position.clone());
        } else {
          const position = this.world.checkpoints[destination] ?? this.world.checkpoints.prologue;
          this.player.teleport(position.clone());
        }
        this.ui.toast(`Teleportado: ${destination}`);
      },
      giveItems: () => {
        Object.values(this.itemCatalog).forEach((item) => this.inventory.add(item));
        this.fire.addFuel(100);
        this.ui.toast("Todos os itens adicionados.");
      },
      toggleInfiniteFuel: () => {
        this.fire.infiniteFuel = !this.fire.infiniteFuel;
        this.ui.toast(`Combustível infinito: ${this.fire.infiniteFuel ? "ON" : "OFF"}`);
      },
      toggleInvulnerability: () => {
        this.player.invulnerable = !this.player.invulnerable;
        this.ui.toast(`Invulnerabilidade: ${this.player.invulnerable ? "ON" : "OFF"}`);
      },
      resetPuzzle: () => this.world.resetNearestPuzzle(),
      startBoss: () => {
        this.world.auditoriumOpened = true;
        this.player.teleport(this.world.checkpoints.auditorium.clone());
        this.startBoss();
      },
      bossPhase: (phase) => {
        if (!this.boss.active) this.startBoss();
        this.boss.setPhase(phase);
      },
      toggleCollisions: () => {
        this.collisionDebugVisible = !this.collisionDebugVisible;
        for (const mesh of this.scene.meshes) {
          mesh.showBoundingBox = this.collisionDebugVisible && Boolean(mesh.checkCollisions);
        }
        this.player.collider.isVisible = this.collisionDebugVisible;
        this.player.collider.showBoundingBox = this.collisionDebugVisible;
        this.ui.toast(`Formas de colisão: ${this.collisionDebugVisible ? "VISÍVEIS" : "OCULTAS"}`);
      },
      toggleMannequinMovement: () => {
        this.requireChapter2().enableForDebug();
        this.ui.toast(`Movimento dos manequins: ${this.requireChapter2().toggleMannequinMovement() ? "ON" : "OFF"}`);
      },
      toggleObservationVisualization: () => this.ui.toast(`Observação: ${this.requireChapter2().toggleObservationVisualization() ? "VISÍVEL" : "OCULTA"}`),
      toggleOcclusionVisualization: () => this.ui.toast(`Raios de oclusão: ${this.requireChapter2().toggleOcclusionVisualization() ? "VISÍVEIS" : "OCULTOS"}`),
      forceBlackout: () => {
        this.requireChapter2().enableForDebug();
        this.requireChapter2().forceBlackout();
      },
      grantEnergyCells: () => {
        this.requireChapter2().enableForDebug();
        this.requireChapter2().grantEnergyCells();
      },
      resetMirrorPuzzle: () => this.requireChapter2().resetMirrorPuzzle(),
      resetShelfPuzzle: () => this.requireChapter2().resetShelfPuzzle(),
      startSphereArena: (arena) => {
        this.requireChapter2().enableForDebug();
        this.stage = "chapter2";
        this.requireChapter2().startArena(arena);
      },
      setMannequinCount: (count) => {
        this.requireChapter2().enableForDebug();
        this.requireChapter2().setMannequinCount(count);
        this.ui.toast(`Manequins ativos: ${count}`);
      },
      startJesseIntroduction: () => {
        this.stage = "chapter3";
        this.requireChapter3().startJesseIntroduction();
      },
      startChaseSegment: (segment) => {
        this.stage = "chapter3";
        this.requireChapter3().startChaseSegment(segment);
      },
      setNoiseLevel: (level) => {
        this.stage = "chapter3";
        this.requireChapter3().enableForDebug();
        this.requireChapter3().setNoiseLevel(level);
        this.ui.toast(`Perigo sonoro: ${level}`);
      },
      forceJesseSearch: () => {
        this.stage = "chapter3";
        this.requireChapter3().enableForDebug();
        this.requireChapter3().forceJesseSearch();
      },
      toggleNoiseVisualization: () => this.ui.toast(`Propagação do ruído: ${this.requireChapter3().toggleNoiseVisualization() ? "VISÍVEL" : "OCULTA"}`),
      toggleJesseVisualization: () => this.ui.toast(`Alvo de Jesse: ${this.requireChapter3().toggleJesseVisualization() ? "VISÍVEL" : "OCULTO"}`),
      grantGeneratorComponents: () => {
        this.stage = "chapter3";
        this.requireChapter3().enableForDebug();
        this.requireChapter3().grantGeneratorComponents();
      },
      resetMelodyPuzzle: () => this.requireChapter3().resetMelodyPuzzle(),
      spawnMiniboss: () => {
        this.stage = "chapter3";
        this.requireChapter3().spawnMiniboss();
      },
      triggerMayaReveal: () => {
        this.stage = "chapter3";
        this.requireChapter3().triggerMayaReveal();
      },
      previewMimicIdentity: (identity) => {
        if (this.stage === "chapter4") this.requireChapter4().previewMimicIdentity(identity);
        else {
          this.stage = "chapter3";
          this.requireChapter3().previewMimicIdentity(identity);
        }
      },
      resetFragileFloor: () => this.requireChapter4().resetFragileFloor(),
      revealFloorSolution: () => this.requireChapter4().revealFloorSolution(),
      triggerBadEnding: () => {
        this.stage = "chapter4";
        this.requireChapter4().triggerBadEnding();
      },
      grantChapter4Equipment: () => {
        this.stage = "chapter4";
        this.requireChapter4().grantEquipment();
      },
      forceMimicEvidence: (evidence) => {
        this.stage = "chapter4";
        this.requireChapter4().forceIdentityInconsistency(evidence);
      },
      startMimicBossPhase: (phase) => {
        this.stage = "chapter4";
        this.requireChapter4().startBossPhase(phase);
      },
      setPostDefeatAttackCount: (count) => this.requireChapter4().setPostDefeatAttackCount(count),
      inspectEndingFlags: () => this.requireChapter4().inspectEndingFlags(),
      setNoahCommand: (command) => {
        this.stage = "chapter5";
        this.requireChapter5().debugSetNoah(command);
      },
      triggerTrueEnding: () => {
        this.stage = "chapter5";
        this.requireChapter5().debugTriggerTrueEnding();
      },
      inspectChapter5: () => this.requireChapter5().debugInspect(),
      refreshState: () => [
        `stage=${this.stage} paused=${this.paused}`,
        `position=${this.player.collider.position.toString()}`,
        `health=${this.player.health.toFixed(1)} fuel=${this.fire.fuel.toFixed(1)} torch=${this.fire.torchLit}`,
        `objective=${this.objectives.get().id}`,
        `inventory=${this.inventory.ids().join(", ")}`,
        `puzzles=${[...this.world.solvedPuzzles].join(", ")}`,
        this.boss.inspectState(),
        `plush=${this.world.plushEnemies.map((enemy) => enemy.state).join(", ") || "none"}`,
        this.requireChapter2().inspectState(),
        this.requireChapter3().inspectState(),
        this.requireChapter4().inspectState(),
        this.requireChapter5().debugInspect(),
        `fps=${this.engine.getFps().toFixed(0)}`,
        this.saveSystem.inspect()
      ].join("\n")
    });
  }

}
