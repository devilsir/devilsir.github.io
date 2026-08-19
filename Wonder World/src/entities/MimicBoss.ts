import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { ProceduralMaterials } from "../world/ProceduralMaterials";
import type { PlayerController } from "../core/PlayerController";
import type { FireSystem } from "../systems/FireSystem";
import type { AudioManager } from "../systems/AudioManager";
import type { GameUI } from "../ui/GameUI";
import type { GameSettings } from "../systems/Settings";
import type { MimicBossState } from "../systems/SaveSystem";
import { MimicEntity, type MimicIdentity } from "./MimicEntity";

export type MimicEvidenceId =
  | "wrong-memory"
  | "mirrored-hand"
  | "shared-breath"
  | "missing-reflection"
  | "mixed-clothing"
  | "wrong-injury"
  | "delayed-expression"
  | "impossible-position";

export interface MimicBossCallbacks {
  onCheckpoint: (state: MimicBossState, phase: number) => void;
  onPlayerDamaged: (amount: number, caption: string) => void;
  onArenaEvent: (event: "lights" | "darkness" | "barriers" | "memory" | "fire" | "afterimages") => void;
  onStopped: (stats: { attacks: number; stopTime: number; inspected: boolean; attemptedExit: boolean }) => void;
  onDefeated: () => void;
}

interface IdentityRound {
  identity: MimicIdentity;
  speaker: string;
  opening: string;
  question: string;
  answer: string;
  correctEvidence: MimicEvidenceId;
  accusationLabel: string;
}

interface Afterimage {
  root: TransformNode;
  parts: Mesh[];
  life: number;
}

export class MimicBoss {
  public state: MimicBossState = "not-started";
  public phase = 0;
  public health = 100;
  public identityRoundsCompleted = 0;
  public postDefeatAttackCount = 0;
  public postDefeatStopTime = 0;
  public inspectedBody = false;
  public attemptedImmediateExit = false;
  public active = false;

  private readonly scene: Scene;
  private readonly mimic: MimicEntity;
  private readonly materials: ProceduralMaterials;
  private readonly player: PlayerController;
  private readonly fire: FireSystem;
  private readonly audio: AudioManager;
  private readonly ui: GameUI;
  private readonly callbacks: MimicBossCallbacks;
  private readonly arenaCenter: Vector3;
  private settings: GameSettings;
  private readonly trueBodyRoot: TransformNode;
  private readonly trueBodyParts: Mesh[] = [];
  private readonly faces: Mesh[] = [];
  private readonly afterimages: Afterimage[] = [];
  private readonly discoveredEvidence = new Set<MimicEvidenceId>();
  private readonly roundEvidence = new Set<MimicEvidenceId>();
  private roundIndex = 0;
  private attackClock = 0;
  private stateClock = 0;
  private weaknessWindow = 0;
  private tacticalWindow = 0;
  private collapseDecisionClock = 0;
  private postDefeatClock = 0;
  private positionTarget = Vector3.Zero();
  private chargeStart = Vector3.Zero();
  private chargeTarget = Vector3.Zero();
  private charging = false;
  private chargeProgress = 0;
  private falseObjectiveIndex = 0;
  private extendedWindowMultiplier = 1;
  private restoringState = false;

  private readonly rounds: IdentityRound[] = [
    {
      identity: "maya",
      speaker: "Maya",
      opening: "Eu consegui sair. Daniel estava atrás de mim.",
      question: "Qual mão você usou para segurar a alavanca?",
      answer: "A direita. Você viu.",
      correctEvidence: "mirrored-hand",
      accusationLabel: "A mão dominante está invertida"
    },
    {
      identity: "daniel",
      speaker: "Daniel",
      opening: "Você pegou o gravador. Eu sabia que voltaria.",
      question: "O que havia na fita?",
      answer: "Eu disse que Maya encontrou uma criança.",
      correctEvidence: "wrong-memory",
      accusationLabel: "A lembrança da gravação está errada"
    },
    {
      identity: "employee",
      speaker: "Funcionário",
      opening: "Visitante permanente 04. Seu caminho seguro termina aqui.",
      question: "Por que todas as vozes respiram do mesmo jeito?",
      answer: "Porque vocês respiram juntos quando têm medo.",
      correctEvidence: "shared-breath",
      accusationLabel: "As vozes compartilham a mesma respiração"
    }
  ];

  public constructor(
    scene: Scene,
    mimic: MimicEntity,
    materials: ProceduralMaterials,
    player: PlayerController,
    fire: FireSystem,
    audio: AudioManager,
    ui: GameUI,
    settings: GameSettings,
    arenaCenter: Vector3,
    callbacks: MimicBossCallbacks
  ) {
    this.scene = scene;
    this.mimic = mimic;
    this.materials = materials;
    this.player = player;
    this.fire = fire;
    this.audio = audio;
    this.ui = ui;
    this.settings = settings;
    this.arenaCenter = arenaCenter.clone();
    this.callbacks = callbacks;
    this.trueBodyRoot = new TransformNode("mimic-boss-true-body", scene);
    this.trueBodyRoot.parent = this.mimic.getRoot();
    this.buildTrueBodyFoundation();
    this.setTrueBodyVisible(false);
  }

  public applySettings(settings: GameSettings): void {
    this.settings = settings;
    this.extendedWindowMultiplier = settings.extendedBossWindows ? 1.65 : 1;
  }

  public start(restoredState: MimicBossState = "identities", restoredHealth = 100, roundsCompleted = 0, restoringState = false): void {
    this.restoringState = restoringState;
    this.active = true;
    this.health = Math.max(0, Math.min(100, restoredHealth));
    this.identityRoundsCompleted = Math.max(0, Math.min(this.rounds.length, roundsCompleted));
    this.roundIndex = this.identityRoundsCompleted;
    this.mimic.setVisible(true);
    this.mimic.setPosition(this.arenaCenter.add(new Vector3(0, 0, 7)), Math.PI);
    this.stateClock = 0;
    this.attackClock = 0;
    this.ui.showBossUI("THE MIMIC");
    this.ui.setBossHealth(this.health);
    if (restoredState === "not-started" || restoredState === "identities") this.beginIdentityPhase();
    else if (restoredState === "true-body") this.beginTrueBodyPhase();
    else if (restoredState === "collapse") this.beginCollapsePhase();
    else if (restoredState === "post-defeat") this.beginPostDefeat();
    else if (restoredState === "stopped" || restoredState === "complete") {
      this.state = restoredState;
      this.phase = 4;
      this.active = restoredState !== "complete";
      this.mimic.setIdentity("composite", true);
      this.setTrueBodyVisible(true);
      this.mimic.getRoot().rotation.z = 1.34;
      this.mimic.getRoot().position.copyFrom(this.arenaCenter.add(new Vector3(0, 0, 1.5)));
      this.ui.hideTacticalActions();
      this.ui.setBossHealth(0);
    }
    this.restoringState = false;
  }

  public stopForWorldDisable(): void {
    this.active = false;
    this.ui.hideBossUI();
  }

  public update(deltaSeconds: number): void {
    if (!this.active) return;
    this.stateClock += deltaSeconds;
    this.attackClock -= deltaSeconds;
    this.weaknessWindow = Math.max(0, this.weaknessWindow - deltaSeconds);
    this.tacticalWindow = Math.max(0, this.tacticalWindow - deltaSeconds);
    this.mimic.update(deltaSeconds);
    this.animateTrueBody(deltaSeconds);
    this.updateAfterimages(deltaSeconds);

    if (this.state === "identities") this.updateIdentityPhase(deltaSeconds);
    else if (this.state === "true-body") this.updateTrueBodyPhase(deltaSeconds);
    else if (this.state === "collapse") this.updateCollapsePhase(deltaSeconds);
    else if (this.state === "post-defeat") this.updatePostDefeat(deltaSeconds);
  }

  public revealEvidence(evidence: MimicEvidenceId): void {
    this.discoveredEvidence.add(evidence);
    this.roundEvidence.add(evidence);
    const messages: Record<MimicEvidenceId, string> = {
      "wrong-memory": "A fala contradiz a gravação de Daniel.",
      "mirrored-hand": "No espelho, a mão dominante não acompanha o gesto real.",
      "shared-breath": "Todas as vozes respiram no mesmo ritmo mecânico.",
      "missing-reflection": "Os olhos aparecem na sala, mas não no reflexo.",
      "mixed-clothing": "Uma costura pertence a outra pessoa.",
      "wrong-injury": "O ferimento está no lado errado.",
      "delayed-expression": "O rosto reage depois da voz.",
      "impossible-position": "Os pés não sustentam a posição do corpo."
    };
    this.ui.toast(messages[evidence], 3300);
    if (this.state === "identities") this.presentIdentityActions();
  }

  public handleTacticalAction(action: string): boolean {
    if (!this.active) return false;
    if (this.state === "identities") {
      const round = this.rounds[this.roundIndex];
      if (!round) return true;
      if (action === "question") {
        this.ui.showSubtitle("Protagonista", round.question, 3000);
        window.setTimeout(() => {
          this.audio.falseVoice("answer", this.mimic.getRoot().position, 0.8);
          this.ui.showSubtitle(round.speaker, round.answer, 4100);
        }, 1050);
        return true;
      }
      if (action === "inspect") {
        const clues = [...this.roundEvidence];
        this.ui.toast(clues.length ? `Evidências observadas: ${clues.length}.` : "Use as luzes, espelhos e o gravador dentro da arena.");
        return true;
      }
      if (action.startsWith("accuse:")) {
        const evidence = action.slice("accuse:".length) as MimicEvidenceId;
        this.resolveAccusation(evidence);
        return true;
      }
      if (action === "attack") {
        this.resolveAccusation("impossible-position", true);
        return true;
      }
      return true;
    }
    if (this.state === "true-body") {
      if (action === "defend") {
        this.tacticalWindow = 2.4 * this.extendedWindowMultiplier;
        this.ui.toast("Você se prepara para o próximo impacto.", 1400);
      } else if (action === "light") {
        this.callbacks.onArenaEvent("lights");
        this.weaknessWindow = 4.4 * this.extendedWindowMultiplier;
        this.audio.electricalBurst(this.arenaCenter);
        this.ui.showSoundCaption("as luzes rotativas expõem as costuras");
      } else if (action === "mirror") {
        this.callbacks.onArenaEvent("afterimages");
        this.clearAfterimages();
        this.weaknessWindow = Math.max(this.weaknessWindow, 2.8 * this.extendedWindowMultiplier);
      } else if (action === "barrier") {
        this.callbacks.onArenaEvent("barriers");
        this.tacticalWindow = 3.2 * this.extendedWindowMultiplier;
      }
      this.ui.hideTacticalActions();
      return true;
    }
    if (this.state === "collapse") {
      this.resolveCollapseDecision(action);
      return true;
    }
    return this.state === "post-defeat";
  }

  public handleAttack(charged: boolean, torchLit: boolean): boolean {
    if (!this.active) return false;
    if (this.state === "post-defeat") {
      this.postDefeatAttackCount += 1;
      this.audio.clubImpact(this.mimic.getRoot().position, "plastic", charged);
      this.ui.setBossHealth(0);
      return true;
    }
    if (this.state === "identities") {
      this.resolveAccusation("impossible-position", true);
      return true;
    }
    if (this.state !== "true-body" && this.state !== "collapse") return true;
    const distance = Vector3.Distance(this.player.collider.position, this.mimic.getRoot().position);
    if (distance > (charged ? 3.25 : 2.55)) {
      this.audio.clubSwing(charged);
      return true;
    }
    const base = charged ? 12 : 6;
    const lightBonus = this.weaknessWindow > 0 ? 1.85 : 0.7;
    const fireBonus = torchLit ? 1.32 : 1;
    const damage = base * lightBonus * fireBonus;
    this.health = Math.max(0, this.health - damage);
    this.ui.setBossHealth(this.health);
    this.audio.clubImpact(this.mimic.getRoot().position, "plastic", charged);
    this.mimic.getRoot().rotation.z += (Math.random() - 0.5) * 0.22;
    if (torchLit && this.weaknessWindow > 0 && Math.random() < 0.45) {
      this.fire.igniteAt(this.mimic.getRoot().position.add(new Vector3(0, 2, 0)), 3.2, false);
      this.callbacks.onArenaEvent("fire");
    }
    if (this.health <= 52 && this.state === "true-body") this.beginCollapsePhase();
    else if (this.health <= 0 && this.state === "collapse") this.beginPostDefeat();
    return true;
  }

  public inspectBody(): void {
    if (this.state !== "post-defeat") return;
    this.inspectedBody = true;
    this.ui.showDocument(
      "CORPO INATIVO",
      "Sob a pele artificial, cabos ainda se contraem. Uma das faces mantém os olhos fechados; outra parece acompanhar sua respiração. Não há certeza de que isso seja morte.",
      () => this.voluntaryStop(false)
    );
  }

  public attemptLeave(): boolean {
    if (this.state !== "post-defeat") return false;
    this.attemptedImmediateExit = this.postDefeatClock < 4 && this.postDefeatAttackCount === 0;
    this.voluntaryStop(true);
    return true;
  }

  public forcePhase(phase: number): void {
    if (phase <= 1) this.beginIdentityPhase();
    else if (phase === 2) this.beginTrueBodyPhase();
    else if (phase === 3) this.beginCollapsePhase();
    else this.beginPostDefeat();
  }

  public setPostDefeatAttackCount(count: number): void {
    this.postDefeatAttackCount = Math.max(0, Math.min(999, Math.round(count)));
  }

  public restorePostDefeatStats(attacks: number, elapsed: number, inspected: boolean, attemptedExit: boolean): void {
    this.postDefeatAttackCount = Math.max(0, Math.min(999, Math.round(attacks)));
    this.postDefeatClock = Math.max(0, Math.min(3600, elapsed));
    this.postDefeatStopTime = this.postDefeatClock;
    this.inspectedBody = inspected;
    this.attemptedImmediateExit = attemptedExit;
  }

  public previewIdentity(identity: MimicIdentity): void {
    this.active = true;
    this.mimic.setVisible(true);
    this.mimic.setPosition(this.arenaCenter.add(new Vector3(0, 0, 5)), Math.PI);
    this.mimic.previewIdentity(identity);
    this.setTrueBodyVisible(identity === "composite");
  }

  public getDiscoveredEvidence(): string[] {
    return [...this.discoveredEvidence];
  }

  public restoreEvidence(ids: string[]): void {
    this.discoveredEvidence.clear();
    ids.forEach((id) => this.discoveredEvidence.add(id as MimicEvidenceId));
  }

  public isPostDefeat(): boolean {
    return this.state === "post-defeat";
  }

  public inspectState(): string {
    return `mimicBoss state=${this.state} phase=${this.phase} health=${this.health.toFixed(1)} round=${this.identityRoundsCompleted}/${this.rounds.length} evidence=${[...this.discoveredEvidence].join(",")} postHits=${this.postDefeatAttackCount} stop=${this.postDefeatStopTime.toFixed(2)}`;
  }

  private beginIdentityPhase(): void {
    this.state = "identities";
    this.phase = 1;
    this.health = 100;
    this.roundIndex = Math.min(this.identityRoundsCompleted, this.rounds.length - 1);
    this.stateClock = 0;
    this.setTrueBodyVisible(false);
    this.ui.showBossUI("THE MIMIC · IDENTIDADES");
    this.ui.setBossHealth(100);
    this.setupIdentityRound();
    if (!this.restoringState) this.callbacks.onCheckpoint(this.state, this.phase);
  }

  private setupIdentityRound(): void {
    const round = this.rounds[this.roundIndex];
    if (!round) {
      this.beginTrueBodyPhase();
      return;
    }
    this.roundEvidence.clear();
    this.mimic.setIdentity(round.identity, true);
    this.mimic.setPosition(this.arenaCenter.add(new Vector3((this.roundIndex - 1) * 3.4, 0, 6.8)), Math.PI);
    if (round.identity === "maya") this.mimic.setMayaInjuredPose();
    this.audio.falseVoice("identity", this.mimic.getRoot().position, 0.75);
    this.ui.showSubtitle(round.speaker, round.opening, 4900);
    this.presentIdentityActions();
  }

  private presentIdentityActions(): void {
    const round = this.rounds[this.roundIndex];
    if (!round) return;
    const actions: { id: string; label: string; enabled?: boolean }[] = [
      { id: "question", label: "PERGUNTAR" },
      { id: "inspect", label: "EXAMINAR A SALA" }
    ];
    for (const evidence of this.roundEvidence) {
      actions.push({ id: `accuse:${evidence}`, label: this.evidenceLabel(evidence) });
    }
    actions.push({ id: "attack", label: "ATACAR" });
    this.ui.showTacticalActions(actions, (action) => this.handleTacticalAction(action));
  }

  private resolveAccusation(evidence: MimicEvidenceId, blindAttack = false): void {
    const round = this.rounds[this.roundIndex];
    if (!round) return;
    this.ui.hideTacticalActions();
    const correct = !blindAttack && evidence === round.correctEvidence && this.roundEvidence.has(evidence);
    if (!correct) {
      this.callbacks.onPlayerDamaged(blindAttack ? 13 : 9, blindAttack ? "o corpo falso reage antes do golpe" : "a identidade errada se rompe e ataca");
      this.audio.mimicVoice();
      this.spawnAfterimages(2);
      window.setTimeout(() => this.presentIdentityActions(), 1300);
      return;
    }
    this.identityRoundsCompleted += 1;
    this.roundIndex += 1;
    this.audio.electricalBurst(this.mimic.getRoot().position);
    this.mimic.setReflectionAnomaly("blank", 1.8);
    this.ui.showSoundCaption("a máscara facial perde a forma");
    this.callbacks.onCheckpoint(this.state, this.phase);
    window.setTimeout(() => this.setupIdentityRound(), 1200);
  }

  private beginTrueBodyPhase(): void {
    this.state = "true-body";
    this.phase = 2;
    this.health = Math.min(100, Math.max(52, this.health));
    this.stateClock = 0;
    this.attackClock = 2.2;
    this.mimic.setIdentity("composite", true);
    this.mimic.setPosition(this.arenaCenter.add(new Vector3(0, 0, 7)), Math.PI);
    this.setTrueBodyVisible(true);
    this.ui.showBossUI("THE MIMIC · CORPO REAL");
    this.ui.setBossHealth(this.health);
    this.ui.hideTacticalActions();
    this.audio.mimicVoice();
    this.ui.showSubtitle("The Mimic", "Vocês me ensinaram cada movimento.", 4200);
    if (!this.restoringState) this.callbacks.onCheckpoint(this.state, this.phase);
  }

  private updateIdentityPhase(deltaSeconds: number): void {
    const root = this.mimic.getRoot();
    root.position.y = Math.sin(this.stateClock * 1.7) * 0.04;
    if (this.stateClock > 7 && Math.floor(this.stateClock) % 9 === 0 && Math.random() < deltaSeconds * 0.8) {
      this.mimic.setReflectionAnomaly("blank", 1.4);
    }
  }

  private updateTrueBodyPhase(deltaSeconds: number): void {
    if (this.charging) {
      this.chargeProgress = Math.min(1, this.chargeProgress + deltaSeconds * 1.75);
      const eased = this.chargeProgress * this.chargeProgress;
      this.mimic.getRoot().position.copyFrom(Vector3.Lerp(this.chargeStart, this.chargeTarget, eased));
      if (this.chargeProgress >= 1) {
        this.charging = false;
        if (Vector3.Distance(this.player.collider.position, this.mimic.getRoot().position) < 2.4 && this.tacticalWindow <= 0) {
          this.callbacks.onPlayerDamaged(18, "o impacto pesado atravessa a barreira");
        }
        this.attackClock = 2.2;
      }
      return;
    }
    this.repositionTowardPlayer(deltaSeconds, 1.1);
    if (this.attackClock > 0) return;
    const pattern = Math.floor(this.stateClock / 4) % 6;
    if (pattern === 0) this.performBodySweep();
    else if (pattern === 1) this.performBodyGrab();
    else if (pattern === 2) this.performMannequinStillness();
    else if (pattern === 3) this.performJesseLimbStrike();
    else if (pattern === 4) this.performCharge();
    else this.performDarknessReposition();
    this.attackClock = 4.2 - Math.min(1.2, (100 - this.health) * 0.015);
  }

  private performBodySweep(): void {
    this.ui.showSoundCaption("quatro membros cortam o ar em sequência");
    this.audio.impact(0.7);
    const distance = Vector3.Distance(this.player.collider.position, this.mimic.getRoot().position);
    if (distance < 5.4 && this.tacticalWindow <= 0) this.callbacks.onPlayerDamaged(14, "os braços varrem a plataforma");
    this.offerEnvironmentWindow();
  }

  private performBodyGrab(): void {
    this.ui.showSoundCaption("quatro mãos se abrem antes de tentar agarrar");
    this.audio.impact(0.52);
    const initialDistance = Vector3.Distance(this.player.collider.position, this.mimic.getRoot().position);
    window.setTimeout(() => {
      const currentDistance = Vector3.Distance(this.player.collider.position, this.mimic.getRoot().position);
      if (initialDistance < 5.8 && currentDistance < 4.2 && this.tacticalWindow <= 0) {
        this.callbacks.onPlayerDamaged(15, "as mãos prendem seus braços por um instante");
        this.player.teleport(this.player.collider.position.add(this.player.forward().scale(-1.6)), this.player.camera.rotation.y);
      }
    }, Math.round(760 * this.extendedWindowMultiplier));
    this.offerEnvironmentWindow();
  }

  private performMannequinStillness(): void {
    this.mimic.getRoot().rotation.set(0, this.mimic.getRoot().rotation.y, 0);
    this.callbacks.onArenaEvent("darkness");
    this.ui.showSoundCaption("as luzes apagam; juntas plásticas se movem no escuro");
    this.spawnAfterimages(3);
    window.setTimeout(() => {
      const offset = this.player.forward().scale(-4.2);
      this.mimic.getRoot().position.copyFrom(this.player.collider.position.add(offset));
      if (Vector3.Distance(this.player.collider.position, this.mimic.getRoot().position) < 4.8 && this.tacticalWindow <= 0) {
        this.callbacks.onPlayerDamaged(11, "algo se reposiciona durante a escuridão");
      }
    }, this.settings.reducedFlashing ? 950 : 620);
    this.offerEnvironmentWindow();
  }

  private performJesseLimbStrike(): void {
    this.audio.startJesseMelody("danger", this.mimic.getRoot().position);
    this.ui.showSoundCaption("uma nota de caixa de música antecede o membro estendido");
    const distance = Vector3.Distance(this.player.collider.position, this.mimic.getRoot().position);
    window.setTimeout(() => {
      this.audio.stopMusicBoxTheme();
      if (distance < 8.5 && this.tacticalWindow <= 0) this.callbacks.onPlayerDamaged(16, "um braço impossível desce do alto");
    }, Math.round(900 * this.extendedWindowMultiplier));
    this.offerEnvironmentWindow();
  }

  private performCharge(): void {
    this.ui.showSoundCaption("apoios metálicos travam; o corpo se prepara para avançar");
    this.chargeStart.copyFrom(this.mimic.getRoot().position);
    this.chargeTarget.copyFrom(this.player.collider.position.add(this.player.forward().scale(-1.2)));
    this.chargeProgress = 0;
    this.charging = true;
    this.offerEnvironmentWindow();
  }

  private performDarknessReposition(): void {
    this.callbacks.onArenaEvent("afterimages");
    this.spawnAfterimages(4);
    const angle = Math.random() * Math.PI * 2;
    this.positionTarget = this.arenaCenter.add(new Vector3(Math.sin(angle) * 9, 0, Math.cos(angle) * 9));
    this.mimic.getRoot().position.copyFrom(this.positionTarget);
    this.ui.showSoundCaption("passos idênticos surgem em várias direções");
    this.offerEnvironmentWindow();
  }

  private offerEnvironmentWindow(): void {
    this.ui.showTacticalActions([
      { id: "defend", label: "DEFENDER" },
      { id: "light", label: "LUZES" },
      { id: "mirror", label: "ESPELHOS" },
      { id: "barrier", label: "BARREIRA" }
    ], (action) => this.handleTacticalAction(action));
  }

  private beginCollapsePhase(): void {
    this.state = "collapse";
    this.phase = 3;
    this.health = Math.max(34, this.health);
    this.stateClock = 0;
    this.collapseDecisionClock = 0;
    this.falseObjectiveIndex = 0;
    this.ui.showBossUI("THE MIMIC · COLAPSO DE IDENTIDADE");
    this.ui.setBossHealth(this.health);
    this.callbacks.onArenaEvent("memory");
    this.audio.mimicVoice();
    this.ui.showSubtitle("Vozes", "VOCÊ JÁ ESCOLHEU. VOCÊ SEMPRE ESCOLHE O CAMINHO ERRADO.", 5200);
    if (!this.restoringState) this.callbacks.onCheckpoint(this.state, this.phase);
  }

  private updateCollapsePhase(deltaSeconds: number): void {
    this.collapseDecisionClock -= deltaSeconds;
    if (this.collapseDecisionClock > 0) return;
    this.collapseDecisionClock = 5.4 * this.extendedWindowMultiplier;
    this.falseObjectiveIndex += 1;
    const identities: MimicIdentity[] = ["maya", "daniel", "child", "employee", "composite"];
    this.mimic.setIdentity(identities[this.falseObjectiveIndex % identities.length] ?? "composite");
    this.callbacks.onArenaEvent("memory");
    const prompts = [
      ["protect", "PROTEGER A VOZ", "mirror", "VERIFICAR O REFLEXO"],
      ["follow", "SEGUIR O OBJETIVO", "record", "COMPARAR A GRAVAÇÃO"],
      ["attack", "ATACAR A FIGURA", "listen", "OUVIR A RESPIRAÇÃO"],
      ["light", "APAGAR AS LUZES", "restore", "RESTAURAR A LUZ"]
    ];
    const prompt = prompts[this.falseObjectiveIndex % prompts.length] ?? prompts[0]!;
    this.ui.setObjective(this.falseObjectiveIndex % 2 ? "SIGA MAYA ATÉ A SAÍDA." : "ATAQUE ANTES QUE ELA MUDE.");
    this.ui.showTacticalActions([
      { id: prompt[0]!, label: prompt[1]! },
      { id: prompt[2]!, label: prompt[3]! },
      { id: "defend", label: "DEFENDER" }
    ], (action) => this.handleTacticalAction(action));
  }

  private resolveCollapseDecision(action: string): void {
    this.ui.hideTacticalActions();
    const safe = ["mirror", "record", "listen", "restore", "defend"].includes(action);
    if (safe) {
      this.weaknessWindow = 3.6 * this.extendedWindowMultiplier;
      this.health = Math.max(0, this.health - 11);
      this.ui.setBossHealth(this.health);
      this.ui.showSoundCaption("a memória falsa perde sincronização");
      this.audio.electricalBurst(this.mimic.getRoot().position);
    } else {
      this.callbacks.onPlayerDamaged(12, "a ordem falsa conduz diretamente ao ataque");
      this.spawnAfterimages(2);
    }
    if (this.health <= 0) this.beginPostDefeat();
  }

  private beginPostDefeat(): void {
    this.state = "post-defeat";
    this.phase = 4;
    this.health = 0;
    this.postDefeatClock = 0;
    this.ui.setBossHealth(0);
    this.ui.hideTacticalActions();
    this.audio.stopMusicBoxTheme();
    this.mimic.setIdentity("composite", true);
    this.setTrueBodyVisible(true);
    this.mimic.getRoot().position.copyFrom(this.arenaCenter.add(new Vector3(0, 0, 1.5)));
    this.mimic.getRoot().rotation.z = 1.34;
    this.callbacks.onArenaEvent("lights");
    if (!this.restoringState) {
      this.callbacks.onDefeated();
      this.callbacks.onCheckpoint(this.state, this.phase);
    }
  }

  private updatePostDefeat(deltaSeconds: number): void {
    this.postDefeatClock += deltaSeconds;
    this.postDefeatStopTime = this.postDefeatClock;
    const root = this.mimic.getRoot();
    const pulse = Math.sin(this.postDefeatClock * 0.72) * 0.008;
    root.scaling.x = 1 + pulse;
    root.scaling.z = 1 - pulse;
  }

  private voluntaryStop(fromExit: boolean): void {
    if (this.state !== "post-defeat") return;
    this.state = "stopped";
    this.postDefeatStopTime = Math.max(0.1, this.postDefeatClock);
    if (fromExit && this.postDefeatClock < 2.5) this.attemptedImmediateExit = true;
    this.ui.hideBossUI();
    this.callbacks.onStopped({
      attacks: this.postDefeatAttackCount,
      stopTime: this.postDefeatStopTime,
      inspected: this.inspectedBody,
      attemptedExit: this.attemptedImmediateExit
    });
  }

  private repositionTowardPlayer(deltaSeconds: number, speed: number): void {
    const root = this.mimic.getRoot();
    const toward = this.player.collider.position.subtract(root.position);
    toward.y = 0;
    const distance = toward.length();
    if (distance > 4.6) root.position.addInPlace(toward.normalize().scale(deltaSeconds * speed));
    if (distance > 0.1) root.rotation.y = Math.atan2(toward.x, toward.z);
  }

  private buildTrueBodyFoundation(): void {
    const wetSkin = this.materials.solid("mimic-wet-skin", new Color3(0.29, 0.14, 0.12), 0.48);
    wetSkin.metallic = 0.02;
    const scar = this.materials.solid("mimic-scar", new Color3(0.34, 0.08, 0.07), 0.82);
    const cable = this.materials.solid("mimic-cable", new Color3(0.09, 0.1, 0.11), 0.35);
    cable.metallic = 0.78;
    const plastic = this.materials.get("plastic", 12);
    const cloth = this.materials.get("plush", 12);

    for (let index = 0; index < 8; index += 1) {
      const support = MeshBuilder.CreateCylinder(`mimic-support-${index}`, { height: 1.5 + (index % 3) * 0.4, diameter: 0.12 + (index % 2) * 0.04, tessellation: 8 }, this.scene);
      support.parent = this.trueBodyRoot;
      support.position = new Vector3((index % 2 ? 1 : -1) * (0.42 + (index % 4) * 0.11), 2.1 + (index % 4) * 0.72, (index % 3 - 1) * 0.25);
      support.rotation.z = (index % 2 ? 1 : -1) * (0.35 + index * 0.045);
      support.material = index % 3 === 0 ? cable : index % 3 === 1 ? plastic : wetSkin;
      support.isPickable = false;
      this.trueBodyParts.push(support);
    }
    for (let index = 0; index < 6; index += 1) {
      const patch = MeshBuilder.CreateSphere(`mimic-victim-patch-${index}`, { diameter: 0.48 + (index % 2) * 0.14, segments: 10 }, this.scene);
      patch.parent = this.trueBodyRoot;
      patch.position = new Vector3((index % 2 ? 1 : -1) * (0.28 + index * 0.045), 2.55 + index * 0.43, -0.48 - (index % 3) * 0.03);
      patch.scaling = new Vector3(1.1, 0.48, 0.26);
      patch.material = index % 2 ? scar : cloth;
      patch.isPickable = false;
      this.trueBodyParts.push(patch);
    }
    for (let index = 0; index < 4; index += 1) {
      const face = MeshBuilder.CreateSphere(`mimic-moving-face-${index}`, { diameter: 0.55, segments: 12, slice: 0.72 }, this.scene);
      face.parent = this.trueBodyRoot;
      face.position = new Vector3((index - 1.5) * 0.38, 3.15 + (index % 2) * 0.62, -0.62);
      face.scaling.z = 0.32;
      face.material = wetSkin;
      face.isPickable = false;
      this.faces.push(face);
      this.trueBodyParts.push(face);
    }
  }

  private setTrueBodyVisible(visible: boolean): void {
    this.trueBodyRoot.setEnabled(visible);
  }

  private animateTrueBody(deltaSeconds: number): void {
    if (!this.trueBodyRoot.isEnabled()) return;
    const time = performance.now() * 0.001;
    this.trueBodyParts.forEach((part, index) => {
      if (part.name.includes("support")) part.rotation.x = Math.sin(time * (1.1 + index * 0.08) + index) * 0.11;
      if (part.name.includes("patch")) part.scaling.z = 0.24 + Math.sin(time * 1.8 + index) * 0.025;
    });
    this.faces.forEach((face, index) => {
      face.rotation.y = Math.sin(time * 0.7 + index) * 0.25;
      face.position.z = -0.62 - Math.sin(time * 1.2 + index) * 0.035;
    });
    if (this.state === "post-defeat") this.trueBodyRoot.rotation.y += deltaSeconds * 0.01;
  }

  private spawnAfterimages(count: number): void {
    this.clearAfterimages();
    for (let index = 0; index < count; index += 1) {
      const root = new TransformNode(`mimic-afterimage-${index}`, this.scene);
      const angle = (index / Math.max(1, count)) * Math.PI * 2 + Math.random() * 0.5;
      root.position.copyFrom(this.arenaCenter.add(new Vector3(Math.sin(angle) * (5 + index), 0, Math.cos(angle) * (5 + index))));
      const parts: Mesh[] = [];
      const torso = MeshBuilder.CreateCapsule(`mimic-after-torso-${index}`, { height: 2.8, radius: 0.44, tessellation: 8 }, this.scene);
      torso.parent = root;
      torso.position.y = 3;
      torso.material = this.materials.get("glass", index + 14);
      torso.visibility = 0.2;
      torso.isPickable = false;
      parts.push(torso);
      const head = MeshBuilder.CreateSphere(`mimic-after-head-${index}`, { diameter: 0.9, segments: 8 }, this.scene);
      head.parent = root;
      head.position.y = 4.75;
      head.material = this.materials.get("glass", index + 18);
      head.visibility = 0.18;
      head.isPickable = false;
      parts.push(head);
      this.afterimages.push({ root, parts, life: 2.8 + index * 0.25 });
    }
  }

  private updateAfterimages(deltaSeconds: number): void {
    for (let index = this.afterimages.length - 1; index >= 0; index -= 1) {
      const after = this.afterimages[index]!;
      after.life -= deltaSeconds;
      after.root.position.y = Math.sin(performance.now() * 0.003 + index) * 0.08;
      after.parts.forEach((part) => part.visibility = Math.max(0, after.life / 8));
      if (after.life <= 0) {
        after.parts.forEach((part) => part.dispose());
        after.root.dispose();
        this.afterimages.splice(index, 1);
      }
    }
  }

  private clearAfterimages(): void {
    this.afterimages.forEach((after) => {
      after.parts.forEach((part) => part.dispose());
      after.root.dispose();
    });
    this.afterimages.length = 0;
  }

  private evidenceLabel(evidence: MimicEvidenceId): string {
    const labels: Record<MimicEvidenceId, string> = {
      "wrong-memory": "ACUSAR: MEMÓRIA ERRADA",
      "mirrored-hand": "ACUSAR: GESTO ESPELHADO",
      "shared-breath": "ACUSAR: RESPIRAÇÃO IDÊNTICA",
      "missing-reflection": "ACUSAR: REFLEXO AUSENTE",
      "mixed-clothing": "ACUSAR: ROUPA DE OUTRA VÍTIMA",
      "wrong-injury": "ACUSAR: FERIMENTO INVERTIDO",
      "delayed-expression": "ACUSAR: EXPRESSÃO ATRASADA",
      "impossible-position": "ACUSAR: POSIÇÃO IMPOSSÍVEL"
    };
    return labels[evidence];
  }

}
