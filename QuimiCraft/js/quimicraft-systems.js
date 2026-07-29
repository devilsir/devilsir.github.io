(function (global) {
  "use strict";

  const MESSAGE_STORAGE_KEY = "qc_message_history_v60";
  const MISSION_STORAGE_KEY = "qc_element_missions_v60";
  const MESSAGE_LIMIT = 250;
  const VISIBLE_MESSAGE_LIMIT = 4;
  const MESSAGE_DURATIONS = Object.freeze({
    system: 5000,
    dialogue: 7000,
    mission: 9000,
    discovery: 6500,
    chemistry: 6500,
    critical: Number.POSITIVE_INFINITY
  });
  const MESSAGE_CATEGORY_LABELS = Object.freeze({
    all: "Todas",
    dialogue: "Diálogos",
    mission: "Missões",
    system: "Sistema",
    discovery: "Descobertas",
    chemistry: "Química"
  });

  function safeParse(storage, key, fallback) {
    try {
      const value = JSON.parse(storage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (error) {
      console.warn(`[QuimiCraft] Dados inválidos em ${key}; usando estado seguro.`, error);
      return fallback;
    }
  }

  function safeWrite(storage, key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[QuimiCraft] Não foi possível salvar ${key}.`, error);
      return false;
    }
  }

  function cleanText(value, maxLength = 600) {
    return String(value == null ? "" : value)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
      .trim()
      .slice(0, maxLength);
  }

  function createMessageCenter(config) {
    const {
      storage = global.localStorage,
      visibleContainer,
      historyList,
      emptyState,
      getGameTime = () => "",
      onHistoryChange = function () {}
    } = config || {};

    if (!visibleContainer || !historyList) {
      throw new Error("MessageCenter: contêineres obrigatórios ausentes.");
    }

    const restored = safeParse(storage, MESSAGE_STORAGE_KEY, []);
    const history = Array.isArray(restored)
      ? restored
          .filter(entry => entry && typeof entry.text === "string")
          .slice(-MESSAGE_LIMIT)
          .map((entry, index) => ({
            id: cleanText(entry.id || `restored-${index}-${Date.now()}`, 90),
            text: cleanText(entry.text),
            category: MESSAGE_CATEGORY_LABELS[entry.category] ? entry.category : "system",
            speaker: cleanText(entry.speaker || "", 80),
            icon: cleanText(entry.icon || "", 12),
            count: Math.max(1, Number(entry.count) || 1),
            timestamp: Number(entry.timestamp) || Date.now(),
            gameTime: cleanText(entry.gameTime || "", 40),
            order: Number(entry.order) || index + 1
          }))
      : [];

    let sequence = history.reduce((max, entry) => Math.max(max, entry.order || 0), 0);
    let activeFilter = "all";
    const active = new Map();
    const activeTimers = new Map();

    function persist() {
      safeWrite(storage, MESSAGE_STORAGE_KEY, history.slice(-MESSAGE_LIMIT));
      onHistoryChange(history.slice());
    }

    function displayText(entry) {
      return entry.count > 1 ? `${entry.text} × ${entry.count}` : entry.text;
    }

    function removeVisible(id, immediate = false) {
      const element = active.get(id);
      if (!element) return;
      const timer = activeTimers.get(id);
      if (timer) global.clearTimeout(timer);
      activeTimers.delete(id);
      active.delete(id);
      const finish = () => element.remove();
      if (immediate) finish();
      else {
        element.classList.add("notification-out");
        global.setTimeout(finish, 340);
      }
    }

    function scheduleExpiry(entry, duration) {
      if (!Number.isFinite(duration)) return;
      const oldTimer = activeTimers.get(entry.id);
      if (oldTimer) global.clearTimeout(oldTimer);
      activeTimers.set(entry.id, global.setTimeout(() => removeVisible(entry.id), duration));
    }

    function renderVisible(entry, duration) {
      let element = active.get(entry.id);
      if (!element) {
        element = global.document.createElement("article");
        element.className = `notification notification-${entry.category}`;
        element.dataset.messageId = entry.id;

        const header = global.document.createElement("div");
        header.className = "notification-head";
        const category = global.document.createElement("span");
        category.className = "notification-category";
        category.textContent = MESSAGE_CATEGORY_LABELS[entry.category] || "Sistema";
        const speaker = global.document.createElement("b");
        speaker.className = "notification-speaker";
        speaker.textContent = entry.speaker;
        header.append(category, speaker);

        const copy = global.document.createElement("p");
        copy.className = "notification-copy";
        element.append(header, copy);

        if (!Number.isFinite(duration)) {
          const acknowledge = global.document.createElement("button");
          acknowledge.type = "button";
          acknowledge.className = "notification-ack";
          acknowledge.textContent = "Entendi";
          acknowledge.addEventListener("click", () => removeVisible(entry.id));
          element.appendChild(acknowledge);
        }

        visibleContainer.appendChild(element);
        active.set(entry.id, element);
        const raf = global.requestAnimationFrame || (callback => global.setTimeout(callback, 0));
        raf(() => element.classList.add("notification-in"));
      }

      element.querySelector(".notification-copy").textContent = displayText(entry);
      element.querySelector(".notification-speaker").textContent = entry.speaker;
      element.querySelector(".notification-speaker").hidden = !entry.speaker;
      scheduleExpiry(entry, duration);

      while (active.size > VISIBLE_MESSAGE_LIMIT) {
        const oldestId = active.keys().next().value;
        removeVisible(oldestId);
      }
    }

    function renderHistory(filter = activeFilter) {
      activeFilter = MESSAGE_CATEGORY_LABELS[filter] ? filter : "all";
      const entries = history.filter(entry => activeFilter === "all" || entry.category === activeFilter);
      historyList.replaceChildren();

      for (const entry of entries.slice().reverse()) {
        const row = global.document.createElement("article");
        row.className = `history-entry history-${entry.category}`;

        const meta = global.document.createElement("div");
        meta.className = "history-meta";
        const category = global.document.createElement("span");
        category.textContent = MESSAGE_CATEGORY_LABELS[entry.category] || "Sistema";
        const time = global.document.createElement("time");
        time.textContent = entry.gameTime || `#${entry.order}`;
        meta.append(category, time);

        const copy = global.document.createElement("p");
        if (entry.speaker) {
          const speaker = global.document.createElement("b");
          speaker.textContent = `${entry.speaker}: `;
          copy.appendChild(speaker);
        }
        copy.appendChild(global.document.createTextNode(displayText(entry)));
        row.append(meta, copy);
        historyList.appendChild(row);
      }

      if (emptyState) emptyState.hidden = entries.length > 0;
      return entries.length;
    }

    function add(input) {
      const data = typeof input === "string" ? { text: input } : input || {};
      const text = cleanText(data.text);
      if (!text) return null;

      const category = MESSAGE_CATEGORY_LABELS[data.category] && data.category !== "all"
        ? data.category
        : "system";
      const speaker = cleanText(data.speaker || "", 80);
      const now = Date.now();
      const duplicateWindow = Math.max(1000, Number(data.dedupeWindow) || 4500);
      const duplicate = history
        .slice()
        .reverse()
        .find(entry =>
          entry.text === text &&
          entry.speaker === speaker &&
          entry.category === category &&
          now - entry.timestamp <= duplicateWindow
        );
      const isDuplicate =
        duplicate &&
        now - duplicate.timestamp <= duplicateWindow;

      let entry;
      if (isDuplicate) {
        duplicate.count += 1;
        duplicate.timestamp = now;
        duplicate.gameTime = cleanText(getGameTime(), 40);
        entry = duplicate;
      } else {
        sequence += 1;
        entry = {
          id: `msg-${now.toString(36)}-${sequence.toString(36)}`,
          text,
          category,
          speaker,
          icon: cleanText(data.icon || "", 12),
          count: 1,
          timestamp: now,
          gameTime: cleanText(getGameTime(), 40),
          order: sequence
        };
        history.push(entry);
        if (history.length > MESSAGE_LIMIT) history.splice(0, history.length - MESSAGE_LIMIT);
      }

      persist();
      const duration = data.critical
        ? MESSAGE_DURATIONS.critical
        : Number.isFinite(data.duration)
          ? Math.max(1000, data.duration)
          : MESSAGE_DURATIONS[category] || MESSAGE_DURATIONS.system;
      renderVisible(entry, duration);
      renderHistory();
      return { ...entry };
    }

    function clearVisible() {
      for (const id of [...active.keys()]) removeVisible(id, true);
    }

    renderHistory();

    return Object.freeze({
      add,
      clearVisible,
      renderHistory,
      setFilter: renderHistory,
      getFilter: () => activeFilter,
      getHistory: () => history.map(entry => ({ ...entry })),
      getVisibleCount: () => active.size,
      limits: Object.freeze({ history: MESSAGE_LIMIT, visible: VISIBLE_MESSAGE_LIMIT }),
      durations: MESSAGE_DURATIONS,
      categories: MESSAGE_CATEGORY_LABELS
    });
  }

  const STAGE_DEFINITIONS = Object.freeze([
    { id: 1, title: "Elementos Essenciais", atomicNumbers: [1, 6, 7, 8] },
    { id: 2, title: "Elementos Comuns de Laboratório", atomicNumbers: [11, 12, 13, 14, 15, 16, 17, 19, 20] },
    { id: 3, title: "Metais Comuns", atomicNumbers: [26, 29, 30, 47, 50, 79] },
    { id: 4, title: "Períodos 1 a 3", atomicNumbers: [] },
    { id: 5, title: "Metais de Transição", atomicNumbers: [] },
    { id: 6, title: "Semimetais, Halogênios e Gases Nobres", atomicNumbers: [] },
    { id: 7, title: "Lantanídeos", atomicNumbers: [] },
    { id: 8, title: "Actinídeos", atomicNumbers: [] },
    { id: 9, title: "Tabela Periódica Final", atomicNumbers: [] }
  ]);

  const OBJECTIVE_TYPES = Object.freeze([
    "identify",
    "collect",
    "reaction",
    "analyze",
    "biome",
    "activate",
    "mine",
    "deliver",
    "talk"
  ]);

  const OBJECTIVE_LABELS = Object.freeze({
    identify: "Identifique o elemento pela posição, nome e número atômico",
    collect: "Colete uma amostra mineral relacionada",
    reaction: "Conclua uma reação segura na Bancada Química",
    analyze: "Analise a amostra no arquivo da Tabela Periódica",
    biome: "Visite o bioma indicado para registrar dados ambientais",
    activate: "Ative a estação indicada no laboratório",
    mine: "Extraia uma amostra do mundo",
    deliver: "Entregue os materiais solicitados ao Prof. Carbono",
    talk: "Converse com o Prof. Carbono sobre o elemento"
  });

  const BIOMES = Object.freeze([
    "planície",
    "floresta",
    "deserto",
    "taiga",
    "tundra",
    "pântano",
    "bosque de cristais",
    "cânion calcário",
    "vulcânico"
  ]);

  const CATEGORY_RESOURCE_KEYS = Object.freeze({
    alkali: ["salt", "niter", "water"],
    alkaline: ["limestone", "marble", "salt"],
    transition: ["iron", "copper", "zinc", "tin", "gold"],
    post: ["tin", "clay", "iron"],
    metalloid: ["sand", "crystal", "coal"],
    nonmetal: ["coal", "sulfur", "water"],
    halogen: ["salt", "sodium_chloride", "indicator"],
    noble: ["crystal", "spectral", "glass"],
    lanthanide: ["amethyst", "crystal", "marble"],
    actinide: ["basalt", "obsidian", "deepstone"]
  });

  function assignStages(elements) {
    const byNumber = new Map(elements.map(element => [element.atomicNumber, element]));
    const assigned = new Set();
    const stages = STAGE_DEFINITIONS.map(stage => ({ ...stage, atomicNumbers: stage.atomicNumbers.slice() }));

    for (const stage of stages.slice(0, 3)) {
      stage.atomicNumbers = stage.atomicNumbers.filter(number => byNumber.has(number));
      stage.atomicNumbers.forEach(number => assigned.add(number));
    }

    stages[3].atomicNumbers = elements
      .filter(element => element.period <= 3 && !assigned.has(element.atomicNumber))
      .map(element => element.atomicNumber);
    stages[3].atomicNumbers.forEach(number => assigned.add(number));

    stages[4].atomicNumbers = elements
      .filter(element => element.category === "transition" && !assigned.has(element.atomicNumber))
      .map(element => element.atomicNumber);
    stages[4].atomicNumbers.forEach(number => assigned.add(number));

    stages[5].atomicNumbers = elements
      .filter(element => ["metalloid", "halogen", "noble"].includes(element.category) && !assigned.has(element.atomicNumber))
      .map(element => element.atomicNumber);
    stages[5].atomicNumbers.forEach(number => assigned.add(number));

    stages[6].atomicNumbers = elements
      .filter(element => element.category === "lanthanide" && !assigned.has(element.atomicNumber))
      .map(element => element.atomicNumber);
    stages[6].atomicNumbers.forEach(number => assigned.add(number));

    stages[7].atomicNumbers = elements
      .filter(element => element.category === "actinide" && !assigned.has(element.atomicNumber))
      .map(element => element.atomicNumber);
    stages[7].atomicNumbers.forEach(number => assigned.add(number));

    stages[8].atomicNumbers = elements
      .filter(element => !assigned.has(element.atomicNumber))
      .map(element => element.atomicNumber);
    stages[8].atomicNumbers.forEach(number => assigned.add(number));

    if (assigned.size !== elements.length || assigned.size !== 118) {
      throw new Error(`ElementMissionSystem: distribuição inválida (${assigned.size}/118 elementos).`);
    }

    const stageForAtomicNumber = new Map();
    for (const stage of stages) {
      for (const atomicNumber of stage.atomicNumbers) {
        if (stageForAtomicNumber.has(atomicNumber)) {
          throw new Error(`ElementMissionSystem: elemento ${atomicNumber} duplicado entre etapas.`);
        }
        stageForAtomicNumber.set(atomicNumber, stage.id);
      }
    }
    return { stages, stageForAtomicNumber };
  }

  function createElementMissionSystem(config) {
    const {
      elements,
      storage = global.localStorage,
      inventoryCount = () => 0,
      removeInventoryItem = () => false,
      grantItem = () => true,
      itemIds = {},
      itemName = value => String(value),
      reactionIds = [],
      unlockReaction = function () {},
      notify = function () {},
      onChange = function () {},
      legacyPeriodicMission = null,
      worldSeed = 0
    } = config || {};

    if (!Array.isArray(elements) || elements.length !== 118) {
      throw new Error("ElementMissionSystem: são necessários exatamente 118 elementos.");
    }

    const atomicNumbers = new Set(elements.map(element => element.atomicNumber));
    if (atomicNumbers.size !== 118 || Math.min(...atomicNumbers) !== 1 || Math.max(...atomicNumbers) !== 118) {
      throw new Error("ElementMissionSystem: números atômicos inválidos ou duplicados.");
    }

    const { stages, stageForAtomicNumber } = assignStages(elements);
    const safeReactionIds = reactionIds.length ? reactionIds.slice() : ["glass"];

    function resourceFor(element, offset = 0) {
      const keys = CATEGORY_RESOURCE_KEYS[element.category] || ["stone"];
      const key = keys[(element.atomicNumber + offset) % keys.length];
      return {
        key,
        id: Object.prototype.hasOwnProperty.call(itemIds, key) ? itemIds[key] : key
      };
    }

    function objectiveFor(element, stageId) {
      const type = OBJECTIVE_TYPES[(element.atomicNumber + stageId * 2) % OBJECTIVE_TYPES.length];
      const quantity = 1 + ((element.atomicNumber + stageId) % (stageId >= 7 ? 2 : 3));
      const resource = resourceFor(element, stageId);
      const reactionId = safeReactionIds[(element.atomicNumber * 3 + stageId) % safeReactionIds.length];
      const biome = BIOMES[(element.atomicNumber + stageId * 3 + Number(worldSeed || 0)) % BIOMES.length];
      const station = element.atomicNumber % 2 ? "chemistry" : "periodic";

      const descriptions = {
        identify: `Identifique ${element.name} no arquivo da Tabela Periódica usando o número atômico ${element.atomicNumber}.`,
        collect: `Reúna ${quantity}× ${itemName(resource.id)} como amostra segura relacionada a ${element.name}.`,
        reaction: `Conclua a reação “${reactionId}” na Bancada Química para comparar seus dados com ${element.name}.`,
        analyze: `Analise a posição de ${element.name} na Tabela Periódica e confirme seu símbolo.`,
        biome: `Visite o bioma ${biome} e registre uma leitura ambiental para o arquivo de ${element.name}.`,
        activate: `Ative ${station === "chemistry" ? "a Bancada Química" : "a Tabela Periódica"} para calibrar a pesquisa de ${element.name}.`,
        mine: `Extraia ${quantity}× ${itemName(resource.id)} para uma comparação mineral com ${element.name}.`,
        deliver: `Leve ${quantity}× ${itemName(resource.id)} ao Prof. Carbono para concluir a amostra de ${element.name}.`,
        talk: `Converse com o Prof. Carbono para revisar as propriedades de ${element.name}.`
      };

      const hints = {
        identify: "Abra a Tabela Periódica e selecione o bloco marcado da missão ativa.",
        collect: `Procure ${itemName(resource.id)} no mundo, em lojas ou no inventário que você já possui.`,
        reaction: "A reação necessária fica disponível enquanto esta missão estiver ativa.",
        analyze: "Use o bloco do elemento na Tabela Periódica e escolha o símbolo correto.",
        biome: `Explore até o indicador de bioma mostrar “${biome.toUpperCase()}”.`,
        activate: station === "chemistry" ? "Use E em uma estação química." : "Aproxime-se da tabela e use E.",
        mine: `Quebre blocos de ${itemName(resource.id)}; amostras já obtidas também contam.`,
        deliver: "Itens já existentes no inventário são reconhecidos. A entrega consome apenas a quantidade pedida.",
        talk: "Aproxime-se do professor e aperte E."
      };

      return Object.freeze({
        type,
        description: descriptions[type],
        requiredQuantity: ["collect", "mine", "deliver"].includes(type) ? quantity : 1,
        requiredItems: ["collect", "mine", "deliver"].includes(type)
          ? Object.freeze([{ id: resource.id, key: resource.key, quantity }])
          : Object.freeze([]),
        requiredActions: Object.freeze([
          type === "reaction"
            ? { type: "reaction", id: reactionId }
            : type === "biome"
              ? { type: "visit_biome", id: biome }
              : type === "activate"
                ? { type: "activate_station", id: station }
                : type === "talk"
                  ? { type: "talk_npc", id: "carbon" }
                  : { type: type === "analyze" ? "analyze_element" : type === "identify" ? "identify_element" : type, id: element.atomicNumber }
        ]),
        reactionId: type === "reaction" ? reactionId : null,
        biome: type === "biome" ? biome : null,
        station: type === "activate" ? station : null,
        resourceId: ["collect", "mine", "deliver"].includes(type) ? resource.id : null,
        resourceKey: ["collect", "mine", "deliver"].includes(type) ? resource.key : null,
        hint: hints[type]
      });
    }

    const missions = elements.map(element => {
      const stageId = stageForAtomicNumber.get(element.atomicNumber);
      const stage = stages.find(item => item.id === stageId);
      const objective = objectiveFor(element, stageId);
      return Object.freeze({
        id: `element-${String(element.atomicNumber).padStart(3, "0")}-${element.symbol.toLowerCase()}`,
        elementAtomicNumber: element.atomicNumber,
        elementSymbol: element.symbol,
        elementName: element.name,
        elementCategory: element.category,
        stage: stageId,
        stageTitle: stage.title,
        title: `Elemento: ${element.name}`,
        description: `Ajude o Prof. Carbono a restaurar o bloco de ${element.name} (${element.symbol}) na Tabela Periódica.`,
        objectiveType: objective.type,
        objective,
        requiredItems: objective.requiredItems,
        requiredActions: objective.requiredActions,
        requiredQuantity: objective.requiredQuantity,
        prerequisites: Object.freeze(stageId === 1 ? [] : [`stage-${stageId - 1}-complete`]),
        hint: objective.hint,
        reward: Object.freeze({
          items: Object.freeze([
            Object.freeze({ id: "gold_nugget", quantity: 1 + Math.min(5, Math.floor((stageId + 1) / 2)) })
          ])
        }),
        completionDialogue: `Excelente análise. O bloco de ${element.name} agora está restaurado de forma permanente.`,
        periodicTablePosition: Object.freeze({
          period: element.period,
          group: element.group,
          displayColumn: element.displayColumn,
          displayRow: element.displayRow
        })
      });
    });

    const missionById = new Map(missions.map(mission => [mission.id, mission]));
    const missionByAtomicNumber = new Map(missions.map(mission => [mission.elementAtomicNumber, mission]));
    const restored = safeParse(storage, MISSION_STORAGE_KEY, {});
    const state = {
      version: 60,
      introduced: !!restored.introduced,
      activeMissionId: missionById.has(restored.activeMissionId) ? restored.activeMissionId : null,
      completedElements: new Set(Array.isArray(restored.completedElements) ? restored.completedElements.filter(number => atomicNumbers.has(number)) : []),
      discoveredElements: new Set(Array.isArray(restored.discoveredElements) ? restored.discoveredElements.filter(number => atomicNumbers.has(number)) : []),
      identifiedElements: new Set(Array.isArray(restored.identifiedElements) ? restored.identifiedElements.filter(number => atomicNumbers.has(number)) : []),
      analyzedElements: new Set(Array.isArray(restored.analyzedElements) ? restored.analyzedElements.filter(number => atomicNumbers.has(number)) : []),
      completedReactions: new Set(Array.isArray(restored.completedReactions) ? restored.completedReactions : []),
      visitedBiomes: new Set(Array.isArray(restored.visitedBiomes) ? restored.visitedBiomes : []),
      activatedStations: new Set(Array.isArray(restored.activatedStations) ? restored.activatedStations : []),
      spokenNpcs: new Set(Array.isArray(restored.spokenNpcs) ? restored.spokenNpcs : []),
      claimedRewards: new Set(Array.isArray(restored.claimedRewards) ? restored.claimedRewards.filter(id => missionById.has(id)) : []),
      counters: restored.counters && typeof restored.counters === "object" ? { ...restored.counters } : {},
      dialogueState: cleanText(restored.dialogueState || "new", 40),
      trackerHidden: !!restored.trackerHidden
    };

    if (legacyPeriodicMission && typeof legacyPeriodicMission === "object") {
      const legacyFilled = Array.isArray(legacyPeriodicMission.filled) ? legacyPeriodicMission.filled : [];
      for (const atomicNumber of legacyFilled) {
        if (!atomicNumbers.has(atomicNumber)) continue;
        state.completedElements.add(atomicNumber);
        state.discoveredElements.add(atomicNumber);
        const mission = missionByAtomicNumber.get(atomicNumber);
        if (mission) state.claimedRewards.add(mission.id);
      }
      if (legacyFilled.length) {
        state.introduced = true;
        state.dialogueState = "introduced";
      }
    }

    function serialize() {
      return {
        version: state.version,
        introduced: state.introduced,
        activeMissionId: state.activeMissionId,
        completedElements: [...state.completedElements].sort((a, b) => a - b),
        discoveredElements: [...state.discoveredElements].sort((a, b) => a - b),
        identifiedElements: [...state.identifiedElements].sort((a, b) => a - b),
        analyzedElements: [...state.analyzedElements].sort((a, b) => a - b),
        completedReactions: [...state.completedReactions],
        visitedBiomes: [...state.visitedBiomes],
        activatedStations: [...state.activatedStations],
        spokenNpcs: [...state.spokenNpcs],
        claimedRewards: [...state.claimedRewards],
        counters: { ...state.counters },
        dialogueState: state.dialogueState,
        trackerHidden: state.trackerHidden
      };
    }

    function persist(emit = true) {
      safeWrite(storage, MISSION_STORAGE_KEY, serialize());
      if (emit) onChange(api);
    }

    function currentStageId() {
      if (!state.introduced) return 0;
      const openStage = stages.find(stage =>
        stage.atomicNumbers.some(number => !state.completedElements.has(number))
      );
      return openStage ? openStage.id : stages[stages.length - 1].id;
    }

    function missionState(mission) {
      if (state.completedElements.has(mission.elementAtomicNumber)) return "completed";
      if (state.activeMissionId === mission.id) return isReady(mission) ? "ready-to-complete" : "active";
      return state.introduced && mission.stage === currentStageId() ? "available" : "locked";
    }

    function progressFor(mission) {
      const objective = mission.objective;
      let current = 0;
      if (objective.type === "identify") current = state.identifiedElements.has(mission.elementAtomicNumber) ? 1 : 0;
      else if (objective.type === "analyze") current = state.analyzedElements.has(mission.elementAtomicNumber) ? 1 : 0;
      else if (objective.type === "reaction") current = state.completedReactions.has(objective.reactionId) ? 1 : 0;
      else if (objective.type === "biome") current = state.visitedBiomes.has(objective.biome) ? 1 : 0;
      else if (objective.type === "activate") current = state.activatedStations.has(objective.station) ? 1 : 0;
      else if (objective.type === "talk") current = state.spokenNpcs.has("carbon") ? 1 : 0;
      else if (["collect", "deliver"].includes(objective.type)) current = inventoryCount(objective.resourceId);
      else if (objective.type === "mine") {
        current = Math.max(
          inventoryCount(objective.resourceId),
          Number(state.counters[`mine:${objective.resourceKey}`]) || 0
        );
      }
      return {
        current: Math.min(objective.requiredQuantity, Math.max(0, current)),
        total: objective.requiredQuantity
      };
    }

    function isReady(mission) {
      const progress = progressFor(mission);
      return progress.current >= progress.total;
    }

    function missionSnapshot(mission) {
      return {
        ...mission,
        state: missionState(mission),
        progress: progressFor(mission)
      };
    }

    function getActiveMission() {
      const mission = missionById.get(state.activeMissionId);
      return mission ? missionSnapshot(mission) : null;
    }

    function startMission(id) {
      const mission = missionById.get(id);
      if (!mission || missionState(mission) !== "available") return false;
      state.activeMissionId = mission.id;
      if (mission.objective.type === "reaction") unlockReaction(mission.objective.reactionId);
      persist();
      notify({
        category: "mission",
        speaker: "PROF. CARBONO",
        text: `Missão iniciada — ${mission.title}. ${mission.objective.description}`
      });
      return true;
    }

    function recordEvent(type, payload = {}) {
      let changed = false;
      if (type === "identify_element" && atomicNumbers.has(payload.atomicNumber)) {
        const size = state.identifiedElements.size;
        state.identifiedElements.add(payload.atomicNumber);
        changed = state.identifiedElements.size !== size;
      } else if (type === "analyze_element" && atomicNumbers.has(payload.atomicNumber)) {
        const size = state.analyzedElements.size;
        state.analyzedElements.add(payload.atomicNumber);
        changed = state.analyzedElements.size !== size;
      } else if (type === "reaction" && payload.id) {
        const size = state.completedReactions.size;
        state.completedReactions.add(payload.id);
        changed = state.completedReactions.size !== size;
      } else if (type === "visit_biome" && payload.id) {
        const size = state.visitedBiomes.size;
        state.visitedBiomes.add(payload.id);
        changed = state.visitedBiomes.size !== size;
      } else if (type === "activate_station" && payload.id) {
        const size = state.activatedStations.size;
        state.activatedStations.add(payload.id);
        changed = state.activatedStations.size !== size;
      } else if (type === "talk_npc" && payload.id) {
        const size = state.spokenNpcs.size;
        state.spokenNpcs.add(payload.id);
        changed = state.spokenNpcs.size !== size;
      } else if (type === "mine" && payload.key) {
        const counterKey = `mine:${payload.key}`;
        state.counters[counterKey] = (Number(state.counters[counterKey]) || 0) + Math.max(1, Number(payload.quantity) || 1);
        changed = true;
      }

      if (changed) persist();
      else onChange(api);
      return getActiveMission();
    }

    function completeActiveMission() {
      const mission = missionById.get(state.activeMissionId);
      if (!mission || !isReady(mission) || state.completedElements.has(mission.elementAtomicNumber)) return null;

      if (mission.objective.type === "deliver") {
        const removed = removeInventoryItem(mission.objective.resourceId, mission.objective.requiredQuantity);
        if (!removed) return null;
      }

      state.completedElements.add(mission.elementAtomicNumber);
      state.discoveredElements.add(mission.elementAtomicNumber);
      state.activeMissionId = null;

      if (!state.claimedRewards.has(mission.id)) {
        for (const reward of mission.reward.items) grantItem(reward.id, reward.quantity);
        state.claimedRewards.add(mission.id);
      }

      const finishedStage = stages.find(stage => stage.id === mission.stage);
      const stageCompleted = finishedStage.atomicNumbers.every(number => state.completedElements.has(number));
      state.dialogueState = state.completedElements.size === 118
        ? "table-complete"
        : stageCompleted
          ? `stage-${mission.stage}-complete`
          : "mission-complete";
      persist();

      notify({
        category: "mission",
        speaker: "PROF. CARBONO",
        text: mission.completionDialogue
      });
      notify({
        category: "discovery",
        text: `${mission.elementName} (${mission.elementSymbol}) foi registrado na Tabela Periódica.`
      });
      if (stageCompleted && mission.stage < 9) {
        const next = stages.find(stage => stage.id === mission.stage + 1);
        notify({
          category: "mission",
          text: `Nova etapa liberada: ${next.title}.`
        });
      }
      if (state.completedElements.size === 118) {
        notify({
          category: "mission",
          speaker: "PROF. CARBONO",
          text: "Os 118 elementos foram restaurados. A Tabela Periódica está completa!"
        });
      }
      return missionSnapshot(mission);
    }

    function introduce() {
      if (!state.introduced) {
        state.introduced = true;
        state.dialogueState = "introduced";
        state.spokenNpcs.add("carbon");
        persist();
        notify({
          category: "mission",
          speaker: "PROF. CARBONO",
          text: "Projeto iniciado: vamos restaurar os 118 elementos em nove etapas de pesquisa."
        });
      } else {
        recordEvent("talk_npc", { id: "carbon" });
      }
      return getStats();
    }

    function getStats() {
      const currentStage = currentStageId();
      const stage = stages.find(item => item.id === currentStage) || null;
      return {
        introduced: state.introduced,
        completed: state.completedElements.size,
        total: 118,
        currentStage,
        currentStageTitle: stage?.title || "",
        tableCompleted: state.completedElements.size === 118,
        activeMissionId: state.activeMissionId,
        trackerHidden: state.trackerHidden
      };
    }

    function setTrackerHidden(hidden) {
      state.trackerHidden = !!hidden;
      persist();
    }

    function sync() {
      persist(false);
      onChange(api);
      return getActiveMission();
    }

    function validateDefinitions() {
      const missionIds = new Set(missions.map(mission => mission.id));
      const objectiveTypes = new Set(missions.map(mission => mission.objectiveType));
      const stageNumbers = stages.flatMap(stage => stage.atomicNumbers);
      return Object.freeze({
        missionCount: missions.length,
        uniqueMissionIds: missionIds.size,
        uniqueElements: new Set(missions.map(mission => mission.elementAtomicNumber)).size,
        stageElementCount: stageNumbers.length,
        uniqueStageElements: new Set(stageNumbers).size,
        objectiveTypes: [...objectiveTypes].sort(),
        stageCounts: stages.map(stage => ({ id: stage.id, count: stage.atomicNumbers.length })),
        valid:
          missions.length === 118 &&
          missionIds.size === 118 &&
          new Set(stageNumbers).size === 118 &&
          objectiveTypes.size >= 8
      });
    }

    const api = Object.freeze({
      introduce,
      startMission,
      completeActiveMission,
      recordEvent,
      sync,
      setTrackerHidden,
      getStats,
      getActiveMission,
      getElementState(atomicNumber) {
        const mission = missionByAtomicNumber.get(atomicNumber);
        return mission ? missionState(mission) : "locked";
      },
      getMissionForElement(atomicNumber) {
        const mission = missionByAtomicNumber.get(atomicNumber);
        return mission ? missionSnapshot(mission) : null;
      },
      getMissions(filter = {}) {
        return missions
          .filter(mission => filter.stage == null || mission.stage === filter.stage)
          .filter(mission => filter.state == null || missionState(mission) === filter.state)
          .map(missionSnapshot);
      },
      getAvailableMissions() {
        return missions.filter(mission => missionState(mission) === "available").map(missionSnapshot);
      },
      getStages() {
        return stages.map(stage => ({
          ...stage,
          completed: stage.atomicNumbers.filter(number => state.completedElements.has(number)).length,
          total: stage.atomicNumbers.length
        }));
      },
      exportState: serialize,
      validateDefinitions,
      objectiveLabels: OBJECTIVE_LABELS
    });

    persist(false);
    return api;
  }

  global.QuimiCraftSystems = Object.freeze({
    createMessageCenter,
    createElementMissionSystem,
    messageCategories: MESSAGE_CATEGORY_LABELS,
    messageDurations: MESSAGE_DURATIONS,
    missionStages: STAGE_DEFINITIONS
  });
})(window);
