export type GameStage =
  | "menu"
  | "prologue"
  | "chapter1"
  | "boss"
  | "chapter2-transition"
  | "chapter2"
  | "chapter3-transition"
  | "chapter3"
  | "chapter4-transition"
  | "chapter4"
  | "chapter5-transition"
  | "chapter5"
  | "campaign-complete";

export interface Chapter2SaveData {
  energyCells: string[];
  mirrorAngles: number[];
  mirrorSolved: boolean;
  shelfPositions: number[];
  shelfSolved: boolean;
  backupSwitches: boolean[];
  controlRoomSolved: boolean;
  machineCables: boolean[];
  machineCellsInstalled: boolean;
  machinePressure: number;
  machineCardInserted: boolean;
  machineTrackAligned: boolean;
  machineLocks: boolean[];
  machineActivated: boolean;
  ruleCollapsed: boolean;
  completedArenas: number[];
  mayaEventSeen: boolean;
  collectedDocuments: string[];
  sphereState: "docked" | "settled";
  activeArena: number;
  trackSwitchState: number;
  arena2Blockers: boolean[];
  arena3Pass: number;
}

export type MayaEncounterState = "not-started" | "assisting" | "revealed" | "complete";

export interface Chapter3SaveData {
  chaseComplete: boolean;
  chaseCheckpoint: number;
  danielRecording: boolean;
  clubOwned: boolean;
  replacementTorchOwned: boolean;
  accessCardObtained: boolean;
  generatorStates: boolean[];
  cableRoute: number[];
  breakerStates: boolean[];
  componentSlots: string[];
  collectedComponents: string[];
  gasVents: boolean[];
  minibossDefeated: boolean;
  gasGeneratorRepaired: boolean;
  melodyInput: number[];
  melodySolved: boolean;
  noiseDanger: number;
  mayaEncounterState: MayaEncounterState;
  chapterComplete: boolean;
  collectedDocuments: string[];
}


export type EquipmentChoiceState = "undecided" | "equipment" | "blood" | "recovered";
export type MimicBossState = "not-started" | "identities" | "true-body" | "collapse" | "post-defeat" | "stopped" | "complete";

export interface Chapter4SaveData {
  prisonEscaped: boolean;
  escapeMechanism: boolean[];
  falseVoiceEvents: string[];
  fragileFloorTiles: number[];
  fragileFloorSolved: boolean;
  equipmentChoice: EquipmentChoiceState;
  badEndingDiscovered: boolean;
  recoveredEquipment: string[];
  mimicEvidence: string[];
  identityRoundsCompleted: number;
  bossState: MimicBossState;
  bossHealth: number;
  postDefeatAttackCount: number;
  postDefeatStopTime: number;
  inspectedBody: boolean;
  attemptedImmediateExit: boolean;
  chapterComplete: boolean;
  collectedDocuments: string[];
  collectedRecordings: string[];
}


export type Chapter5PhaseSave =
  | "approach" | "proof" | "archives" | "revelation" | "collapse" | "body-return"
  | "mannequin-return" | "jesse-return" | "burning-archives" | "bridge" | "exit"
  | "authorities" | "credits" | "post-credits" | "complete";

export interface Chapter5SaveData {
  phase: Chapter5PhaseSave;
  proofScore: number;
  proofContradictions: number;
  proofComplete: boolean;
  proofAnswers: [string, string][];
  archiveDataAccessed: boolean;
  experimentRevelationSeen: boolean;
  protagonistPastRevealed: boolean;
  documents: string[];
  recordings: string[];
  rescuedDocuments: string[];
  flashbacksSeen: string[];
  collapseStarted: boolean;
  escapeSegment: number;
  jesseChaseActive: boolean;
  jesseCheckpoint: number;
  noah: {
    active: boolean;
    command: "follow" | "wait" | "move" | "hold" | "crawl" | "distract";
    checkpoint: string;
    position: [number, number, number];
    trust: number;
    injured: boolean;
    carryingIdentityCard: boolean;
  };
  mimicAttackCount: number;
  deathCount: number;
  completionSeconds: number;
  trueEndingDiscovered: boolean;
  creditsSeen: boolean;
  postCreditsSeen: boolean;
  chapterComplete: boolean;
}

export interface SaveData {
  version: 6;
  stage: GameStage;
  checkpoint: string;
  checkpointPosition: [number, number, number];
  objectiveId: string;
  inventory: string[];
  solvedPuzzles: string[];
  powerRestored: boolean;
  torchFuel: number;
  playerHealth: number;
  playerArmor: number;
  lives: number;
  bossPhase: number;
  openedContainers: string[];
  lootedContainers: string[];
  activatedCheckpoints: string[];
  guideEnabled: boolean;
  chapter2: Chapter2SaveData;
  chapter3: Chapter3SaveData;
  chapter4: Chapter4SaveData;
  chapter5: Chapter5SaveData;
  endings: string[];
  updatedAt: number;
}

const STORAGE_KEY = "atracao-final-save-v6";
const ENDING_GALLERY_KEY = "atracao-final-ending-gallery-v1";
const AUTHORED_ENDINGS = ["dead-by-creature", "saved-by-authorities"] as const;
const LEGACY_STORAGE_KEYS = ["atracao-final-save-v5", "atracao-final-save-v4", "atracao-final-save-v3", "atracao-final-save-v2", "atracao-final-save-v1"] as const;

export const DEFAULT_CHAPTER2_SAVE: Chapter2SaveData = {
  energyCells: [],
  mirrorAngles: [0, 0, 0, 0],
  mirrorSolved: false,
  shelfPositions: [1, 1, 1],
  shelfSolved: false,
  backupSwitches: [false, false, false],
  controlRoomSolved: false,
  machineCables: [false, false, false, false],
  machineCellsInstalled: false,
  machinePressure: 0,
  machineCardInserted: false,
  machineTrackAligned: false,
  machineLocks: [false, false, false],
  machineActivated: false,
  ruleCollapsed: false,
  completedArenas: [],
  mayaEventSeen: false,
  collectedDocuments: [],
  sphereState: "docked",
  activeArena: 0,
  trackSwitchState: 0,
  arena2Blockers: [false, false],
  arena3Pass: 0
};

export const DEFAULT_CHAPTER3_SAVE: Chapter3SaveData = {
  chaseComplete: false,
  chaseCheckpoint: 0,
  danielRecording: false,
  clubOwned: false,
  replacementTorchOwned: false,
  accessCardObtained: false,
  generatorStates: [false, false, false, false, false],
  cableRoute: [0, 0, 0],
  breakerStates: [false, false, false],
  componentSlots: ["", "", "", "", "", ""],
  collectedComponents: [],
  gasVents: [false, false, false],
  minibossDefeated: false,
  gasGeneratorRepaired: false,
  melodyInput: [],
  melodySolved: false,
  noiseDanger: 0,
  mayaEncounterState: "not-started",
  chapterComplete: false,
  collectedDocuments: []
};

export const DEFAULT_CHAPTER4_SAVE: Chapter4SaveData = {
  prisonEscaped: false,
  escapeMechanism: [false, false, false, false],
  falseVoiceEvents: [],
  fragileFloorTiles: [],
  fragileFloorSolved: false,
  equipmentChoice: "undecided",
  badEndingDiscovered: false,
  recoveredEquipment: [],
  mimicEvidence: [],
  identityRoundsCompleted: 0,
  bossState: "not-started",
  bossHealth: 100,
  postDefeatAttackCount: 0,
  postDefeatStopTime: 0,
  inspectedBody: false,
  attemptedImmediateExit: false,
  chapterComplete: false,
  collectedDocuments: [],
  collectedRecordings: []
};

export const DEFAULT_CHAPTER5_SAVE: Chapter5SaveData = {
  phase: "approach",
  proofScore: 0,
  proofContradictions: 0,
  proofComplete: false,
  proofAnswers: [],
  archiveDataAccessed: false,
  experimentRevelationSeen: false,
  protagonistPastRevealed: false,
  documents: [],
  recordings: [],
  rescuedDocuments: [],
  flashbacksSeen: [],
  collapseStarted: false,
  escapeSegment: 0,
  jesseChaseActive: false,
  jesseCheckpoint: 0,
  noah: {
    active: false,
    command: "wait",
    checkpoint: "noah-introduction",
    position: [0, 0.12, 1502],
    trust: 0,
    injured: true,
    carryingIdentityCard: false
  },
  mimicAttackCount: 0,
  deathCount: 0,
  completionSeconds: 0,
  trueEndingDiscovered: false,
  creditsSeen: false,
  postCreditsSeen: false,
  chapterComplete: false
};

export const DEFAULT_SAVE: SaveData = {
  version: 6,
  stage: "prologue",
  checkpoint: "prologue-start",
  checkpointPosition: [0, 0.12, 10],
  objectiveId: "wait-friends",
  inventory: [],
  solvedPuzzles: [],
  powerRestored: false,
  torchFuel: 0,
  playerHealth: 100,
  playerArmor: 0,
  lives: 3,
  bossPhase: 0,
  openedContainers: [],
  lootedContainers: [],
  activatedCheckpoints: [],
  guideEnabled: true,
  chapter2: { ...DEFAULT_CHAPTER2_SAVE },
  chapter3: { ...DEFAULT_CHAPTER3_SAVE },
  chapter4: { ...DEFAULT_CHAPTER4_SAVE },
  chapter5: { ...DEFAULT_CHAPTER5_SAVE, noah: { ...DEFAULT_CHAPTER5_SAVE.noah } },
  endings: [],
  updatedAt: 0
};

export class SaveSystem {
  public hasSave(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null || LEGACY_STORAGE_KEYS.some((key) => localStorage.getItem(key) !== null);
  }

  public load(): SaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
        ?? LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find((value) => value !== null)
        ?? null;
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<Omit<SaveData, "version">> & { version?: number };
      if (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== 3 && parsed.version !== 4 && parsed.version !== 5 && parsed.version !== 6) return null;
      const stages: GameStage[] = [
        "menu", "prologue", "chapter1", "boss", "chapter2-transition", "chapter2",
        "chapter3-transition", "chapter3", "chapter4-transition", "chapter4", "chapter5-transition", "chapter5", "campaign-complete"
      ];
      const stageCandidate = typeof parsed.stage === "string" ? parsed.stage : "";
      const stage: GameStage = stages.includes(stageCandidate as GameStage) ? stageCandidate as GameStage : "prologue";
      return {
        version: 6,
        stage,
        checkpoint: typeof parsed.checkpoint === "string" ? parsed.checkpoint : DEFAULT_SAVE.checkpoint,
        checkpointPosition: this.vector3Tuple(parsed.checkpointPosition, DEFAULT_SAVE.checkpointPosition),
        objectiveId: typeof parsed.objectiveId === "string" ? parsed.objectiveId : DEFAULT_SAVE.objectiveId,
        inventory: this.stringArray(parsed.inventory),
        solvedPuzzles: this.stringArray(parsed.solvedPuzzles),
        powerRestored: Boolean(parsed.powerRestored),
        torchFuel: this.clamp(parsed.torchFuel, 0, 100, 0),
        playerHealth: this.clamp(parsed.playerHealth, 1, 100, 100),
        playerArmor: this.clamp(parsed.playerArmor, 0, 100, 0),
        lives: this.integer(parsed.lives, 1, 3, 3),
        bossPhase: this.integer(parsed.bossPhase, 0, 3, 0),
        openedContainers: this.stringArray(parsed.openedContainers),
        lootedContainers: this.stringArray(parsed.lootedContainers),
        activatedCheckpoints: this.stringArray(parsed.activatedCheckpoints),
        guideEnabled: parsed.guideEnabled !== false,
        chapter2: this.sanitizeChapter2(parsed.version >= 2 ? parsed.chapter2 : undefined),
        chapter3: this.sanitizeChapter3(parsed.version >= 3 ? parsed.chapter3 : undefined),
        chapter4: this.sanitizeChapter4(parsed.version >= 4 ? parsed.chapter4 : undefined),
        chapter5: this.sanitizeChapter5(parsed.version >= 5 ? parsed.chapter5 : undefined, parsed.version >= 4 ? parsed.chapter4 : undefined),
        endings: [...new Set([...this.getEndingGallery(), ...this.sanitizeEndings(parsed.endings)])],
        updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0
      };
    } catch {
      return null;
    }
  }

  public write(data: Omit<SaveData, "version" | "updatedAt">): void {
    const payload: SaveData = {
      ...data,
      chapter2: this.sanitizeChapter2(data.chapter2),
      chapter3: this.sanitizeChapter3(data.chapter3),
      chapter4: this.sanitizeChapter4(data.chapter4),
      chapter5: this.sanitizeChapter5(data.chapter5, data.chapter4),
      endings: [...new Set([...this.getEndingGallery(), ...this.sanitizeEndings(data.endings)])],
      version: 6,
      updatedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(ENDING_GALLERY_KEY, JSON.stringify(payload.endings));
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  public clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  public getEndingGallery(): string[] {
    try {
      const raw = localStorage.getItem(ENDING_GALLERY_KEY);
      return raw ? this.sanitizeEndings(JSON.parse(raw)) : [];
    } catch {
      return [];
    }
  }

  public clearAll(): void {
    this.clear();
    localStorage.removeItem(ENDING_GALLERY_KEY);
  }

  public inspect(): string {
    const save = this.load();
    return save ? JSON.stringify(save, null, 2) : "Nenhum save encontrado.";
  }

  private vector3Tuple(value: unknown, fallback: [number, number, number]): [number, number, number] {
    if (!Array.isArray(value) || value.length < 3) return [...fallback];
    const tuple = value.slice(0, 3).map((entry, index) => {
      const number = typeof entry === "number" && Number.isFinite(entry) ? entry : fallback[index]!;
      return Math.max(-5000, Math.min(5000, number));
    });
    return [tuple[0]!, tuple[1]!, tuple[2]!];
  }

  private sanitizeEndings(value: unknown): string[] {
    return [...new Set(this.stringArray(value).filter((id) => (AUTHORED_ENDINGS as readonly string[]).includes(id)))];
  }

  private sanitizeChapter2(value: unknown): Chapter2SaveData {
    const raw = value && typeof value === "object" ? value as Partial<Chapter2SaveData> : {};
    return {
      energyCells: this.stringArray(raw.energyCells).filter((id) => ["energyCell1", "energyCell2", "energyCell3"].includes(id)),
      mirrorAngles: this.numberArray(raw.mirrorAngles, 4, 0, 7, DEFAULT_CHAPTER2_SAVE.mirrorAngles),
      mirrorSolved: Boolean(raw.mirrorSolved),
      shelfPositions: this.numberArray(raw.shelfPositions, 3, 0, 2, DEFAULT_CHAPTER2_SAVE.shelfPositions),
      shelfSolved: Boolean(raw.shelfSolved),
      backupSwitches: this.booleanArray(raw.backupSwitches, 3, DEFAULT_CHAPTER2_SAVE.backupSwitches),
      controlRoomSolved: Boolean(raw.controlRoomSolved),
      machineCables: this.booleanArray(raw.machineCables, 4, DEFAULT_CHAPTER2_SAVE.machineCables),
      machineCellsInstalled: Boolean(raw.machineCellsInstalled),
      machinePressure: this.integer(raw.machinePressure, 0, 3, 0),
      machineCardInserted: Boolean(raw.machineCardInserted),
      machineTrackAligned: Boolean(raw.machineTrackAligned),
      machineLocks: this.booleanArray(raw.machineLocks, 3, DEFAULT_CHAPTER2_SAVE.machineLocks),
      machineActivated: Boolean(raw.machineActivated),
      ruleCollapsed: Boolean(raw.ruleCollapsed),
      completedArenas: this.flexibleNumberArray(raw.completedArenas, 1, 3),
      mayaEventSeen: Boolean(raw.mayaEventSeen),
      collectedDocuments: this.stringArray(raw.collectedDocuments),
      sphereState: raw.sphereState === "settled" ? "settled" : "docked",
      activeArena: this.integer(raw.activeArena, 0, 3, 0),
      trackSwitchState: this.integer(raw.trackSwitchState, 0, 1, 0),
      arena2Blockers: this.booleanArray(raw.arena2Blockers, 2, DEFAULT_CHAPTER2_SAVE.arena2Blockers),
      arena3Pass: this.integer(raw.arena3Pass, 0, 2, 0)
    };
  }

  private sanitizeChapter3(value: unknown): Chapter3SaveData {
    const raw = value && typeof value === "object" ? value as Partial<Chapter3SaveData> : {};
    const validComponents = ["rotor", "insulator", "brush", "fuse", "regulator", "contact"];
    const state: MayaEncounterState = ["not-started", "assisting", "revealed", "complete"].includes(String(raw.mayaEncounterState))
      ? raw.mayaEncounterState as MayaEncounterState
      : "not-started";
    return {
      chaseComplete: Boolean(raw.chaseComplete),
      chaseCheckpoint: this.integer(raw.chaseCheckpoint, 0, 4, 0),
      danielRecording: Boolean(raw.danielRecording),
      clubOwned: Boolean(raw.clubOwned),
      replacementTorchOwned: Boolean(raw.replacementTorchOwned),
      accessCardObtained: Boolean(raw.accessCardObtained),
      generatorStates: this.booleanArray(raw.generatorStates, 5, DEFAULT_CHAPTER3_SAVE.generatorStates),
      cableRoute: this.numberArray(raw.cableRoute, 3, 0, 2, DEFAULT_CHAPTER3_SAVE.cableRoute),
      breakerStates: this.booleanArray(raw.breakerStates, 3, DEFAULT_CHAPTER3_SAVE.breakerStates),
      componentSlots: this.stringFixedArray(raw.componentSlots, 6).map((id) => validComponents.includes(id) ? id : ""),
      collectedComponents: this.stringArray(raw.collectedComponents).filter((id) => validComponents.includes(id)),
      gasVents: this.booleanArray(raw.gasVents, 3, DEFAULT_CHAPTER3_SAVE.gasVents),
      minibossDefeated: Boolean(raw.minibossDefeated),
      gasGeneratorRepaired: Boolean(raw.gasGeneratorRepaired),
      melodyInput: this.sequenceNumberArray(raw.melodyInput, 0, 5).slice(-6),
      melodySolved: Boolean(raw.melodySolved),
      noiseDanger: this.clamp(raw.noiseDanger, 0, 100, 0),
      mayaEncounterState: state,
      chapterComplete: Boolean(raw.chapterComplete),
      collectedDocuments: this.stringArray(raw.collectedDocuments)
    };
  }

  private sanitizeChapter4(value: unknown): Chapter4SaveData {
    const raw = value && typeof value === "object" ? value as Partial<Chapter4SaveData> : {};
    const choices: EquipmentChoiceState[] = ["undecided", "equipment", "blood", "recovered"];
    const bossStates: MimicBossState[] = ["not-started", "identities", "true-body", "collapse", "post-defeat", "stopped", "complete"];
    return {
      prisonEscaped: Boolean(raw.prisonEscaped),
      escapeMechanism: this.booleanArray(raw.escapeMechanism, 4, DEFAULT_CHAPTER4_SAVE.escapeMechanism),
      falseVoiceEvents: this.stringArray(raw.falseVoiceEvents),
      fragileFloorTiles: this.flexibleNumberArray(raw.fragileFloorTiles, 0, 35),
      fragileFloorSolved: Boolean(raw.fragileFloorSolved),
      equipmentChoice: choices.includes(raw.equipmentChoice as EquipmentChoiceState) ? raw.equipmentChoice as EquipmentChoiceState : "undecided",
      badEndingDiscovered: Boolean(raw.badEndingDiscovered),
      recoveredEquipment: this.stringArray(raw.recoveredEquipment).filter((id) => ["metalClub", "replacementTorch", "portableRecorder", "bodyCard", "generatorAccessCard", "metalCan"].includes(id)),
      mimicEvidence: this.stringArray(raw.mimicEvidence),
      identityRoundsCompleted: this.integer(raw.identityRoundsCompleted, 0, 4, 0),
      bossState: bossStates.includes(raw.bossState as MimicBossState) ? raw.bossState as MimicBossState : "not-started",
      bossHealth: this.clamp(raw.bossHealth, 0, 100, 100),
      postDefeatAttackCount: this.integer(raw.postDefeatAttackCount, 0, 999, 0),
      postDefeatStopTime: this.clamp(raw.postDefeatStopTime, 0, 3600, 0),
      inspectedBody: Boolean(raw.inspectedBody),
      attemptedImmediateExit: Boolean(raw.attemptedImmediateExit),
      chapterComplete: Boolean(raw.chapterComplete),
      collectedDocuments: this.stringArray(raw.collectedDocuments),
      collectedRecordings: this.stringArray(raw.collectedRecordings)
    };
  }

  private sanitizeChapter5(value: unknown, chapter4Value?: unknown): Chapter5SaveData {
    const raw = value && typeof value === "object" ? value as Partial<Chapter5SaveData> : {};
    const chapter4 = chapter4Value && typeof chapter4Value === "object" ? chapter4Value as Partial<Chapter4SaveData> : {};
    const phases: Chapter5PhaseSave[] = [
      "approach", "proof", "archives", "revelation", "collapse", "body-return", "mannequin-return",
      "jesse-return", "burning-archives", "bridge", "exit", "authorities", "credits", "post-credits", "complete"
    ];
    const commands = ["follow", "wait", "move", "hold", "crawl", "distract"] as const;
    const noahRaw: Partial<Chapter5SaveData["noah"]> = raw.noah && typeof raw.noah === "object" ? raw.noah : {};
    const position = Array.isArray(noahRaw.position) ? noahRaw.position : DEFAULT_CHAPTER5_SAVE.noah.position;
    const proofAnswers: [string, string][] = Array.isArray(raw.proofAnswers)
      ? raw.proofAnswers.filter((entry): entry is [string, string] => Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string").slice(0, 8)
      : [];
    return {
      phase: phases.includes(raw.phase as Chapter5PhaseSave) ? raw.phase as Chapter5PhaseSave : "approach",
      proofScore: this.integer(raw.proofScore, -10, 20, 0),
      proofContradictions: this.integer(raw.proofContradictions, 0, 20, 0),
      proofComplete: Boolean(raw.proofComplete),
      proofAnswers,
      archiveDataAccessed: Boolean(raw.archiveDataAccessed),
      experimentRevelationSeen: Boolean(raw.experimentRevelationSeen),
      protagonistPastRevealed: Boolean(raw.protagonistPastRevealed),
      documents: this.stringArray(raw.documents),
      recordings: this.stringArray(raw.recordings),
      rescuedDocuments: this.stringArray(raw.rescuedDocuments),
      flashbacksSeen: this.stringArray(raw.flashbacksSeen),
      collapseStarted: Boolean(raw.collapseStarted),
      escapeSegment: this.integer(raw.escapeSegment, 0, 12, 0),
      jesseChaseActive: Boolean(raw.jesseChaseActive),
      jesseCheckpoint: this.integer(raw.jesseCheckpoint, 0, 6, 0),
      noah: {
        active: Boolean(noahRaw.active),
        command: commands.includes(noahRaw.command as typeof commands[number]) ? noahRaw.command as typeof commands[number] : "wait",
        checkpoint: typeof noahRaw.checkpoint === "string" ? noahRaw.checkpoint : "noah-introduction",
        position: [
          this.clamp(position[0], -200, 200, 0),
          this.clamp(position[1], -20, 50, 0.12),
          this.clamp(position[2], 1400, 2200, 1502)
        ],
        trust: this.integer(noahRaw.trust, -10, 10, 0),
        injured: noahRaw.injured !== false,
        carryingIdentityCard: Boolean(noahRaw.carryingIdentityCard)
      },
      mimicAttackCount: this.integer(raw.mimicAttackCount ?? chapter4.postDefeatAttackCount, 0, 999, 0),
      deathCount: this.integer(raw.deathCount, 0, 9999, 0),
      completionSeconds: this.clamp(raw.completionSeconds, 0, 9999999, 0),
      trueEndingDiscovered: Boolean(raw.trueEndingDiscovered),
      creditsSeen: Boolean(raw.creditsSeen),
      postCreditsSeen: Boolean(raw.postCreditsSeen),
      chapterComplete: Boolean(raw.chapterComplete)
    };
  }

  private stringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  }

  private stringFixedArray(value: unknown, length: number): string[] {
    const source = Array.isArray(value) ? value : [];
    return Array.from({ length }, (_, index) => typeof source[index] === "string" ? source[index] as string : "");
  }

  private numberArray(value: unknown, length: number, min: number, max: number, fallback: number[]): number[] {
    const source = Array.isArray(value) ? value : fallback;
    return Array.from({ length }, (_, index) => this.integer(source[index], min, max, fallback[index] ?? min));
  }

  private booleanArray(value: unknown, length: number, fallback: boolean[]): boolean[] {
    const source = Array.isArray(value) ? value : fallback;
    return Array.from({ length }, (_, index) => typeof source[index] === "boolean" ? source[index] as boolean : fallback[index] ?? false);
  }

  private flexibleNumberArray(value: unknown, min: number, max: number): number[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((entry) => typeof entry === "number" ? entry : Number(entry))
      .filter((entry) => Number.isFinite(entry) && Number.isInteger(entry) && entry >= min && entry <= max)
      .filter((entry, index, all) => all.indexOf(entry) === index);
  }

  private sequenceNumberArray(value: unknown, min: number, max: number): number[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((entry) => typeof entry === "number" ? entry : Number(entry))
      .filter((entry) => Number.isFinite(entry) && Number.isInteger(entry) && entry >= min && entry <= max);
  }

  private integer(value: unknown, min: number, max: number, fallback: number): number {
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? Math.min(max, Math.max(min, Math.round(numeric))) : fallback;
  }

  private clamp(value: unknown, min: number, max: number, fallback: number): number {
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? Math.min(max, Math.max(min, Math.round(numeric * 1000) / 1000)) : fallback;
  }
}
