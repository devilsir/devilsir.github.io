const STORAGE_KEY = "atracao-final-save-v6";
const ENDING_GALLERY_KEY = "atracao-final-ending-gallery-v1";
const AUTHORED_ENDINGS = ["dead-by-creature", "saved-by-authorities"];
const LEGACY_STORAGE_KEYS = ["atracao-final-save-v5", "atracao-final-save-v4", "atracao-final-save-v3", "atracao-final-save-v2", "atracao-final-save-v1"];
export const DEFAULT_CHAPTER2_SAVE = {
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
export const DEFAULT_CHAPTER3_SAVE = {
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
export const DEFAULT_CHAPTER4_SAVE = {
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
export const DEFAULT_CHAPTER5_SAVE = {
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
export const DEFAULT_SAVE = {
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
    hasSave() {
        return localStorage.getItem(STORAGE_KEY) !== null || LEGACY_STORAGE_KEYS.some((key) => localStorage.getItem(key) !== null);
    }
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
                ?? LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find((value) => value !== null)
                ?? null;
            if (!raw)
                return null;
            const parsed = JSON.parse(raw);
            if (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== 3 && parsed.version !== 4 && parsed.version !== 5 && parsed.version !== 6)
                return null;
            const stages = [
                "menu", "prologue", "chapter1", "boss", "chapter2-transition", "chapter2",
                "chapter3-transition", "chapter3", "chapter4-transition", "chapter4", "chapter5-transition", "chapter5", "campaign-complete"
            ];
            const stageCandidate = typeof parsed.stage === "string" ? parsed.stage : "";
            const stage = stages.includes(stageCandidate) ? stageCandidate : "prologue";
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
        }
        catch {
            return null;
        }
    }
    write(data) {
        const payload = {
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
    clear() {
        localStorage.removeItem(STORAGE_KEY);
        LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    }
    getEndingGallery() {
        try {
            const raw = localStorage.getItem(ENDING_GALLERY_KEY);
            return raw ? this.sanitizeEndings(JSON.parse(raw)) : [];
        }
        catch {
            return [];
        }
    }
    clearAll() {
        this.clear();
        localStorage.removeItem(ENDING_GALLERY_KEY);
    }
    inspect() {
        const save = this.load();
        return save ? JSON.stringify(save, null, 2) : "Nenhum save encontrado.";
    }
    vector3Tuple(value, fallback) {
        if (!Array.isArray(value) || value.length < 3)
            return [...fallback];
        const tuple = value.slice(0, 3).map((entry, index) => {
            const number = typeof entry === "number" && Number.isFinite(entry) ? entry : fallback[index];
            return Math.max(-5000, Math.min(5000, number));
        });
        return [tuple[0], tuple[1], tuple[2]];
    }
    sanitizeEndings(value) {
        return [...new Set(this.stringArray(value).filter((id) => AUTHORED_ENDINGS.includes(id)))];
    }
    sanitizeChapter2(value) {
        const raw = value && typeof value === "object" ? value : {};
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
    sanitizeChapter3(value) {
        const raw = value && typeof value === "object" ? value : {};
        const validComponents = ["rotor", "insulator", "brush", "fuse", "regulator", "contact"];
        const state = ["not-started", "assisting", "revealed", "complete"].includes(String(raw.mayaEncounterState))
            ? raw.mayaEncounterState
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
    sanitizeChapter4(value) {
        const raw = value && typeof value === "object" ? value : {};
        const choices = ["undecided", "equipment", "blood", "recovered"];
        const bossStates = ["not-started", "identities", "true-body", "collapse", "post-defeat", "stopped", "complete"];
        return {
            prisonEscaped: Boolean(raw.prisonEscaped),
            escapeMechanism: this.booleanArray(raw.escapeMechanism, 4, DEFAULT_CHAPTER4_SAVE.escapeMechanism),
            falseVoiceEvents: this.stringArray(raw.falseVoiceEvents),
            fragileFloorTiles: this.flexibleNumberArray(raw.fragileFloorTiles, 0, 35),
            fragileFloorSolved: Boolean(raw.fragileFloorSolved),
            equipmentChoice: choices.includes(raw.equipmentChoice) ? raw.equipmentChoice : "undecided",
            badEndingDiscovered: Boolean(raw.badEndingDiscovered),
            recoveredEquipment: this.stringArray(raw.recoveredEquipment).filter((id) => ["metalClub", "replacementTorch", "portableRecorder", "bodyCard", "generatorAccessCard", "metalCan"].includes(id)),
            mimicEvidence: this.stringArray(raw.mimicEvidence),
            identityRoundsCompleted: this.integer(raw.identityRoundsCompleted, 0, 4, 0),
            bossState: bossStates.includes(raw.bossState) ? raw.bossState : "not-started",
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
    sanitizeChapter5(value, chapter4Value) {
        const raw = value && typeof value === "object" ? value : {};
        const chapter4 = chapter4Value && typeof chapter4Value === "object" ? chapter4Value : {};
        const phases = [
            "approach", "proof", "archives", "revelation", "collapse", "body-return", "mannequin-return",
            "jesse-return", "burning-archives", "bridge", "exit", "authorities", "credits", "post-credits", "complete"
        ];
        const commands = ["follow", "wait", "move", "hold", "crawl", "distract"];
        const noahRaw = raw.noah && typeof raw.noah === "object" ? raw.noah : {};
        const position = Array.isArray(noahRaw.position) ? noahRaw.position : DEFAULT_CHAPTER5_SAVE.noah.position;
        const proofAnswers = Array.isArray(raw.proofAnswers)
            ? raw.proofAnswers.filter((entry) => Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string").slice(0, 8)
            : [];
        return {
            phase: phases.includes(raw.phase) ? raw.phase : "approach",
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
                command: commands.includes(noahRaw.command) ? noahRaw.command : "wait",
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
    stringArray(value) {
        return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
    }
    stringFixedArray(value, length) {
        const source = Array.isArray(value) ? value : [];
        return Array.from({ length }, (_, index) => typeof source[index] === "string" ? source[index] : "");
    }
    numberArray(value, length, min, max, fallback) {
        const source = Array.isArray(value) ? value : fallback;
        return Array.from({ length }, (_, index) => this.integer(source[index], min, max, fallback[index] ?? min));
    }
    booleanArray(value, length, fallback) {
        const source = Array.isArray(value) ? value : fallback;
        return Array.from({ length }, (_, index) => typeof source[index] === "boolean" ? source[index] : fallback[index] ?? false);
    }
    flexibleNumberArray(value, min, max) {
        if (!Array.isArray(value))
            return [];
        return value
            .map((entry) => typeof entry === "number" ? entry : Number(entry))
            .filter((entry) => Number.isFinite(entry) && Number.isInteger(entry) && entry >= min && entry <= max)
            .filter((entry, index, all) => all.indexOf(entry) === index);
    }
    sequenceNumberArray(value, min, max) {
        if (!Array.isArray(value))
            return [];
        return value
            .map((entry) => typeof entry === "number" ? entry : Number(entry))
            .filter((entry) => Number.isFinite(entry) && Number.isInteger(entry) && entry >= min && entry <= max);
    }
    integer(value, min, max, fallback) {
        const numeric = typeof value === "number" ? value : Number(value);
        return Number.isFinite(numeric) ? Math.min(max, Math.max(min, Math.round(numeric))) : fallback;
    }
    clamp(value, min, max, fallback) {
        const numeric = typeof value === "number" ? value : Number(value);
        return Number.isFinite(numeric) ? Math.min(max, Math.max(min, Math.round(numeric * 1000) / 1000)) : fallback;
    }
}
