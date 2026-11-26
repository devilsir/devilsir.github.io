(() => {
  "use strict";
  const C = window.WB_CONFIG;
  const D = window.WB_DATA;
  const U = window.WB_UTIL;
  const S = window.WB_SYSTEMS;
  const Art = window.WB_CHARACTER_ART;
  const Icons = window.WB_ICONS || {
    svg: (n) => n,
    fromGlyph: (g) => g,
  };
  const PT = window.WB_I18N || {
    label: (v) => v,
    translate: (v) => v,
  };
  const iconSvg = (nameOrGlyph, cls = "") => Icons.fromGlyph(nameOrGlyph, cls);
  const ptLabel = (value) => PT.label(value);
  function hydrateStaticIcons(root = document) {
    $$("[data-wb-icon]", root).forEach((el) => {
      el.innerHTML = Icons.svg(el.dataset.wbIcon);
    });
  }
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const slots = [
    "weapon",
    "secondary",
    "head",
    "chest",
    "hands",
    "legs",
    "feet",
    "amulet",
    "ring1",
    "ring2",
    "relic",
  ];
  const slotLabels = {
    weapon: "Arma",
    secondary: "Arma secundária",
    head: "Cabeça",
    chest: "Torso",
    hands: "Mãos",
    legs: "Pernas",
    feet: "Pés",
    amulet: "Amuleto",
    ring1: "Anel 1",
    ring2: "Anel 2",
    relic: "Relíquia",
  };
  const materialLabels = {
    Iron: "Ferro",
    Silver: "Prata",
    Bone: "Osso",
    Leather: "Couro",
    "Blood Crystal": "Cristal de Sangue",
    Moonstone: "Pedra da Lua",
    "Grave Dust": "Pó Sepulcral",
    "Demon Ash": "Cinza Demoníaca",
    "Shadow Silk": "Seda Sombria",
    "Ancient Essence": "Essência Ancestral",
  };


  const HIDEOUT_STAGE_IMAGES = [
    "assets/hideout/stage-1.png",
    "assets/hideout/stage-2.png",
    "assets/hideout/stage-3.png",
    "assets/hideout/stage-4.png",
    "assets/hideout/stage-5.png",
    "assets/hideout/stage-6.png",
  ];
  const HIDEOUT_STAGE_NAMES = [
    "Ruína Desperta",
    "Solar Sombrio",
    "Manor de Vigília",
    "Mansão do Eclipse",
    "Fortaleza Noturna",
    "Domínio Ancestral",
  ];

  const rarityColors = {
    common: "#8e929b",
    uncommon: "#6fa86f",
    rare: "#4b87d4",
    epic: "#9b63d2",
    legendary: "#d69b43",
    mythic: "#e76073",
    cursed: "#7b46a5",
  };
  const statusInfo = {
    bleeding: ["✧", "Loses health each turn."],
    poisoned: ["☣", "Takes escalating damage."],
    burning: ["♨", "Takes fire damage each turn."],
    stunned: ["✦", "Loses the next action."],
    weakened: ["↓", "Deals reduced damage."],
    marked: ["⌖", "More likely to be critically hit."],
    frightened: ["!", "Accuracy and initiative reduced."],
    regenerating: ["♥", "Restores health each turn."],
    shielded: ["⬟", "Reduces incoming damage."],
    enraged: ["⚡", "Deals increased damage."],
    concealed: ["◐", "Greatly increases evasion."],
    cursed: ["†", "Healing is reduced."],
    moonBlessed: ["☾", "Improved Moonborn power."],
    bloodFrenzy: ["♦", "Improved Bloodbound drain."],
  };

  const dom = {};
  let state = null;
  let currentView = "overview";
  let selectedRegion = 0;
  let missionFilter = "all";
  let merchantType = "general";
  const MERCHANT_TYPES = [
    "general",
    "blacksmith",
    "alchemist",
    "occult",
    "quartermaster",
    "traveling",
  ];
  const MERCHANT_DEFS = {
    general: { label: "Mercador Geral", slots: ["head", "chest", "hands", "legs", "feet", "amulet", "ring1", "ring2"], stock: 9, future: 1 },
    blacksmith: { label: "Ferreiro", slots: ["weapon", "secondary", "head", "chest", "hands", "legs", "feet"], stock: 9, future: 2 },
    alchemist: { label: "Alquimista", slots: ["amulet", "ring1", "ring2", "relic", "secondary"], stock: 8, future: 1 },
    occult: { label: "Ocultista", slots: ["head", "amulet", "ring1", "ring2", "relic", "secondary"], stock: 8, future: 2 },
    quartermaster: { label: "Intendente", slots: ["weapon", "secondary", "chest", "hands", "legs", "feet", "relic"], stock: 9, future: 2 },
    traveling: { label: "Mercador Errante", slots: slots.slice(), stock: 12, future: 4 },
  };
  let rankingType = "level";
  let inventoryMode = "grid";
  let inventoryFilter = { search: "", rarity: "all", slot: "all" };
  let combat = null;
  let autosaveTimer = null;
  let energyTimer = null;
  let particles = [];
  let particleFrame = 0;
  let audioCtx = null;
  let ambienceNodes = [];
  let lastLightning = 0;
  let creatorPortraitMode = "full";
  let modalReturnFocus = null;

  function esc(value) {
    return String(value ?? "").replace(
      /[&<>'"]/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[ch],
    );
  }

  function defaultSettings() {
    return {
      musicVolume: 0.18,
      sfxVolume: 0.42,
      mute: false,
      reducedMotion: false,
      screenShake: true,
      damageNumbers: true,
      combatSpeed: 1,
      autoBattle: false,
      textSize: 1,
      highContrast: false,
      skipAnimations: false,
      autoSave: true,
      tutorials: true,
    };
  }

  function ensureMerchantShape() {
    if (!state) return;
    state.merchant = state.merchant || {};
    if (!state.merchant.stocks || typeof state.merchant.stocks !== "object")
      state.merchant.stocks = {};
    MERCHANT_TYPES.forEach((type) => {
      if (!Array.isArray(state.merchant.stocks[type])) state.merchant.stocks[type] = [];
    });
    if (!Array.isArray(state.merchant.buyback)) state.merchant.buyback = [];
  }

  function activeMerchantStock(type = merchantType) {
    ensureMerchantShape();
    return state.merchant.stocks[type] || [];
  }

  function merchantDiscount() {
    return U.clamp(
      (derived().presence - 5) * 0.004 + state.player.reputation * 0.002,
      0,
      0.28,
    );
  }

  function merchantTemplatesFor(type) {
    const def = MERCHANT_DEFS[type] || MERCHANT_DEFS.general;
    return D.itemTemplates.filter(
      (t) =>
        def.slots.includes(t.slot) &&
        (t.faction === "any" || t.faction === state.player.faction),
    );
  }

  function generateMerchantStock(type) {
    const def = MERCHANT_DEFS[type] || MERCHANT_DEFS.general;
    const pool = merchantTemplatesFor(type);
    const currentMax = Math.min(40, state.player.level + 5 + (type === "traveling" ? 3 : 0));
    const futureMax = Math.min(40, state.player.level + 12 + def.future * 3);
    const currentPool = pool.filter((t) => t.level <= currentMax);
    const futurePool = pool.filter((t) => t.level > state.player.level && t.level <= futureMax);
    const stock = [];
    const futureCount = Math.min(def.future, futurePool.length);
    const currentCount = Math.max(0, def.stock - futureCount);
    for (let i = 0; i < currentCount; i++) {
      const source = U.pick(currentPool.length ? currentPool : pool);
      const rarity = type === "blacksmith" || type === "quartermaster"
        ? U.weighted({ common: 30, uncommon: 28, rare: 20, epic: 12, legendary: 7, mythic: 2, cursed: 1 })
        : type === "occult" || type === "traveling"
          ? U.weighted({ common: 20, uncommon: 24, rare: 24, epic: 16, legendary: 10, mythic: 4, cursed: 2 })
          : U.weighted(C.loot.rarityWeights);
      const item = D.createItem(source, Math.max(source.level, state.player.level + U.rand(-1, 3)), rarity);
      item.price = Math.floor(item.value * (type === "traveling" ? 1.95 : type === "blacksmith" ? 1.8 : 1.7));
      item.merchantType = type;
      item.lockedUntilLevel = item.level > state.player.level;
      stock.push(item);
    }
    for (let i = 0; i < futureCount; i++) {
      const source = futurePool.sort((a, b) => a.level - b.level)[i] || U.pick(futurePool);
      const rarity = source.rarity || U.weighted(C.loot.rarityWeights);
      const item = D.createItem(source, source.level, rarity);
      item.price = Math.floor(item.value * (type === "traveling" ? 2.1 : 1.85));
      item.merchantType = type;
      item.lockedUntilLevel = true;
      stock.push(item);
    }
    state.merchant.stocks[type] = stock.sort((a, b) => a.lockedUntilLevel - b.lockedUntilLevel || a.level - b.level || a.value - b.value);
  }

  function emptyMetrics() {
    return {
      kills: 0,
      hunts: 0,
      arenaWins: 0,
      rareLoot: 0,
      bleeds: 0,
      hideoutUpgrades: 0,
      secrets: 0,
      resourceSpent: 0,
      crafts: 0,
      dismantles: 0,
      regions: 1,
      bosses: 0,
      items: 0,
      level: 1,
      storyChapters: 0,
      clanDonations: 0,
      equips: 0,
      attributeUpgrades: 0,
    };
  }

  function createState(character) {
    character.appearance = Art.normalizeAppearance(
      character.appearance,
      character.faction,
    );
    const faction = D.factions[character.faction];
    const attrs = {
      strength: 5,
      defense: 5,
      dexterity: 5,
      endurance: 5,
      perception: 5,
      presence: 5,
      luck: 5,
    };
    Object.entries(faction.specs[character.spec].bonuses).forEach(
      ([k, v]) => (attrs[k] += v),
    );
    const equipment = Object.fromEntries(slots.map((s) => [s, null]));
    const starterWeapon = D.createItem(
      D.itemTemplates.find(
        (i) =>
          i.slot === "weapon" &&
          (i.faction === "any" || i.faction === character.faction),
      ),
      1,
      "uncommon",
    );
    const starterChest = D.createItem(
      D.itemTemplates.find(
        (i) =>
          i.slot === "chest" &&
          (i.faction === "any" || i.faction === character.faction),
      ),
      1,
      "common",
    );
    const consumables = [
      {
        id: U.uid("cons"),
        name: "Tônico de Raiz Noturna",
        type: "consumable",
        icon: "⚗",
        rarity: "uncommon",
        effect: "heal",
        amount: 45,
        value: 30,
        count: 3,
        locked: false,
        favorite: false,
        flavor:
          "A bitter tonic that forces the body to remember its original shape.",
      },
    ];
    const now = Date.now();
    return {
      version: C.version,
      createdAt: now,
      updatedAt: now,
      activeSlot: 1,
      player: {
        ...character,
        level: 1,
        xp: 0,
        gold: 500,
        shards: 3,
        health: 120,
        resource: 0,
        reputation: 0,
        alignment: 0,
        rank: 987,
        clan: null,
        attributes: attrs,
        attributePoints: 0,
        energy: C.energy.baseMax,
        maxEnergy: C.energy.baseMax,
        lastEnergyAt: now,
        equipment,
        inventory: [starterWeapon, starterChest, ...consumables],
        materials: Object.fromEntries(
          D.materials.map((m) => [
            m,
            m === "Iron" ? 8 : m === "Leather" ? 5 : 0,
          ]),
        ),
        unlockedAbilities: [],
        equippedAbilities: [],
        region: 0,
      },
      missions: D.missions.map((m) => ({
        id: m.id,
        progress: 0,
        claimed: false,
        accepted: ["tutorial", "story", "daily"].includes(m.category),
      })),
      metrics: emptyMetrics(),
      achievements: {},
      bestiary: {},
      story: { chapter: 1, completed: [], flags: {}, ending: null },
      arena: {
        rating: 650,
        division: "Iron",
        dailyBattles: 0,
        lastBattleDay: U.dayKey(),
        streak: 0,
        history: [],
        opponents: [],
      },
      hideout: Object.fromEntries(
        D.hideout[character.faction].map((s) => [s.id, 1]),
      ),
      hideoutCore: { level: 1 },
      lunarOverride: null,
      worldRanking: S ? S.createPersistentRanking(D, U) : null,
      clan: null,
      messages: [],
      combatHistory: [],
      merchant: { day: U.dayKey(), stock: [], stocks: {}, buyback: [] },
      daily: { lastClaim: null, streak: 0, grace: 1 },
      settings: defaultSettings(),
      tutorialStep: 0,
      codex: {
        regions: ["blackthorn"],
        lore: ["hollow_eclipse"],
        characters: [],
      },
    };
  }

  function normalizeState(raw) {
    if (
      !raw ||
      typeof raw !== "object" ||
      !raw.player ||
      !D.factions[raw.player.faction]
    )
      return null;
    raw.version = C.version;
    raw.settings = { ...defaultSettings(), ...(raw.settings || {}) };
    raw.metrics = { ...emptyMetrics(), ...(raw.metrics || {}) };
    raw.player.attributes = {
      strength: 5,
      defense: 5,
      dexterity: 5,
      endurance: 5,
      perception: 5,
      presence: 5,
      luck: 5,
      ...(raw.player.attributes || {}),
    };
    raw.player.appearance = Art.normalizeAppearance(
      raw.player.appearance,
      raw.player.faction,
    );
    raw.player.equipment = {
      ...Object.fromEntries(slots.map((s) => [s, null])),
      ...(raw.player.equipment || {}),
    };
    raw.player.inventory = Array.isArray(raw.player.inventory)
      ? raw.player.inventory
      : [];
    raw.player.materials = {
      ...Object.fromEntries(D.materials.map((m) => [m, 0])),
      ...(raw.player.materials || {}),
    };
    const configuredMaxEnergy =
      C.energy.baseMax +
      Math.floor((Number(raw.player.level) || 1) / 5) * C.energy.perFiveLevels;
    raw.player.maxEnergy = Math.max(
      Number(raw.player.maxEnergy) || 0,
      configuredMaxEnergy,
    );
    raw.player.energy = U.clamp(
      Number(raw.player.energy) || 0,
      0,
      raw.player.maxEnergy,
    );
    raw.player.lastEnergyAt = raw.player.lastEnergyAt || Date.now();
    raw.missions = Array.isArray(raw.missions)
      ? raw.missions
      : D.missions.map((m) => ({
          id: m.id,
          progress: 0,
          claimed: false,
          accepted: false,
        }));
    raw.achievements = raw.achievements || {};
    raw.bestiary = raw.bestiary || {};
    raw.hideout = {
      ...Object.fromEntries(D.hideout[raw.player.faction].map((s) => [s.id, 1])),
      ...(raw.hideout || {}),
    };
    raw.hideoutCore = { level: 1, ...(raw.hideoutCore || {}) };
    raw.hideoutCore.level = U.clamp(
      Number(raw.hideoutCore.level) || 1,
      1,
      C.hideout.maxCoreLevel,
    );
    raw.lunarOverride = raw.lunarOverride || null;
    if (!raw.worldRanking?.roster?.length && S) {
      raw.worldRanking = S.createPersistentRanking(D, U);
    }
    if (raw.clan) {
      raw.clan.dailyBattles = Number(raw.clan.dailyBattles) || 0;
      raw.clan.lastBattleDay = raw.clan.lastBattleDay || U.dayKey();
    }
    raw.arena = {
      ...{
        rating: 650,
        division: "Iron",
        dailyBattles: 0,
        lastBattleDay: U.dayKey(),
        streak: 0,
        history: [],
        opponents: [],
      },
      ...(raw.arena || {}),
    };
    raw.story = {
      ...{ chapter: 1, completed: [], flags: {}, ending: null },
      ...(raw.story || {}),
    };
    raw.story.completed = [...new Set(
      (Array.isArray(raw.story.completed) ? raw.story.completed : [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id >= 1 && id <= D.storyChapters.length),
    )].sort((a, b) => a - b);
    const nextStoryChapter = D.storyChapters.find(
      (chapter) => !raw.story.completed.includes(chapter.id),
    );
    raw.story.chapter = nextStoryChapter
      ? nextStoryChapter.id
      : D.storyChapters.length;
    raw.story.flags = raw.story.flags && typeof raw.story.flags === "object"
      ? raw.story.flags
      : {};
    raw.clan = raw.clan || null;
    raw.messages = Array.isArray(raw.messages) ? raw.messages : [];
    raw.combatHistory = Array.isArray(raw.combatHistory)
      ? raw.combatHistory
      : [];
    raw.merchant = {
      ...{ day: U.dayKey(), stock: [], stocks: {}, buyback: [] },
      ...(raw.merchant || {}),
    };
    if (Array.isArray(raw.merchant.stock) && !Object.keys(raw.merchant.stocks || {}).length) {
      raw.merchant.stocks = { general: raw.merchant.stock.slice() };
    }
    raw.daily = {
      ...{ lastClaim: null, streak: 0, grace: 1 },
      ...(raw.daily || {}),
    };
    return raw;
  }

  function saveKey(
    slot = state?.activeSlot ||
      Number(localStorage.getItem("wb_active_slot")) ||
      1,
  ) {
    return `${C.saveKey}_slot_${slot}`;
  }
  function hasAnySave() {
    return [1, 2, 3].some((i) => !!localStorage.getItem(saveKey(i)));
  }
  function saveGame(showToast = false) {
    if (!state) return;
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(saveKey(), JSON.stringify(state));
      localStorage.setItem("wb_active_slot", String(state.activeSlot || 1));
      if (showToast) toast("Chronicle saved.", "success");
    } catch (err) {
      console.error(err);
      toast("The chronicle could not be saved.", "error");
    }
  }
  function loadGame(
    slot = Number(localStorage.getItem("wb_active_slot")) || 1,
  ) {
    const raw = U.safeParse(localStorage.getItem(saveKey(slot)), null);
    const normalized = normalizeState(raw);
    if (!normalized) return false;
    state = normalized;
    state.activeSlot = slot;
    updateEnergy();
    applySettings();
    ensureUnlocks();
    refreshMerchant();
    refreshArenaOpponents(false);
    saveGame(false);
    return true;
  }

  function bindDom() {
    [
      "boot",
      "app",
      "opening",
      "creator",
      "game",
      "viewRoot",
      "sidebar",
      "sidebarProfile",
      "mainNav",
      "mobileNav",
      "modalRoot",
      "toastRoot",
      "combatOverlay",
      "eventOverlay",
      "particleCanvas",
      "lightning",
      "tooltip",
    ].forEach((id) => (dom[id] = $(`#${id}`)));
  }

  function init() {
    bindDom();
    hydrateStaticIcons(document);
    setupCreator();
    setupEvents();
    setupParticles();
    $("#continueBtn").disabled = !hasAnySave();
    setTimeout(() => {
      dom.boot.classList.add("done");
      dom.app.classList.remove("is-hidden");
      setTimeout(() => dom.boot.remove(), 550);
    }, 800);
    autosaveTimer = setInterval(() => {
      if (state?.settings.autoSave) saveGame(false);
    }, C.autosaveMs);
    energyTimer = setInterval(() => {
      if (state) {
        const changed = updateEnergy();
        updateTopbar();
        if (changed && currentView === "overview") renderOverview();
      }
    }, 1000);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(particleFrame);
        saveGame(false);
      } else {
        setupParticles(true);
      }
    });
  }

  function setupEvents() {
    $("#newGameBtn").addEventListener("click", () => {
      sfx("click");
      showScreen("creator");
    });
    $("#continueBtn").addEventListener("click", () => {
      sfx("click");
      if (loadGame()) {
        enterGame();
      } else toast("No valid chronicle was found.", "error");
    });
    $("#creatorBackBtn").addEventListener("click", () => showScreen("opening"));
    $("#creatorForm").addEventListener("submit", confirmCharacter);
    $$("[data-open-modal]").forEach((btn) =>
      btn.addEventListener("click", () =>
        openStaticModal(btn.dataset.openModal),
      ),
    );
    $("#menuToggle").addEventListener("click", () =>
      dom.sidebar.classList.toggle("open"),
    );
    $("#manualSaveBtn").addEventListener("click", () => saveGame(true));
    $("#muteBtn").addEventListener("click", toggleMute);
    $("#muteBtnOpening").addEventListener("click", toggleMute);
    $("#dailyBtn").addEventListener("click", openDaily);
    $("#lunarChipBtn")?.addEventListener("click", openLunarModal);
    $("#saveImportInput").addEventListener("change", importSaveFile);
    dom.mainNav.addEventListener("click", handleNav);
    dom.mobileNav.addEventListener("click", handleNav);
    dom.viewRoot.addEventListener("click", handleViewClick);
    dom.viewRoot.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = e.target.closest?.('[role="button"][data-action]');
      if (!el || el.tagName === "BUTTON" || el.tagName === "A") return;
      e.preventDefault();
      handleViewClick({ target: el });
    });
    dom.viewRoot.addEventListener("input", handleViewInput);
    dom.modalRoot.addEventListener("click", handleModalClick);
    dom.combatOverlay.addEventListener("click", handleCombatClick);
    dom.eventOverlay.addEventListener("click", handleEventClick);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        dom.sidebar.classList.remove("open");
        if (dom.eventOverlay.classList.contains("active")) closeEvent();
      }
    });
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-tooltip]");
      if (t) showTooltip(t, e);
    });
    document.addEventListener("pointermove", (e) => {
      if (dom.tooltip.classList.contains("show")) positionTooltip(e);
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest("[data-tooltip]"))
        dom.tooltip.classList.remove("show");
    });
    window.addEventListener(
      "resize",
      U.debounce(() => setupParticles(true), 150),
    );
  }

  function showScreen(id) {
    $$(".screen").forEach((s) => s.classList.toggle("is-active", s.id === id));
  }
  function enterGame() {
    showScreen("game");
    applyFactionTheme();
    applySettings();
    renderSidebar();
    renderMobileNav();
    updateTopbar();
    navigate("overview");
    startAmbience();
  }

  function renderVisualSwatches(container, source, selectId, faction, current, labelId) {
    if (!container) return;
    const values = Art.optionsFor ? Art.optionsFor(source, faction) : D.appearance[source] || [];
    const activeVal = String(current || "").toLowerCase();
    container.innerHTML = values
      .map((val) => {
        const key = val.toLowerCase();
        const isActive = key === activeVal;
        const translated = ptLabel(val);
        const bg = Art.swatchStyle ? Art.swatchStyle(source, key, faction) : "#555";
        return `<button type="button" class="swatch-btn ${isActive ? "active" : ""}" role="radio" aria-checked="${isActive}" title="${esc(translated)}" aria-label="${esc(translated)}" data-picker-target="${selectId}" data-picker-value="${esc(key)}"><span class="swatch-core" style="background:${bg}"></span></button>`;
      })
      .join("");
    if (labelId && $("#" + labelId)) {
      $("#" + labelId).textContent = ptLabel(activeVal);
    }
  }

  function renderVisualPills(container, source, selectId, faction, current, labelId) {
    if (!container) return;
    const values = Art.optionsFor ? Art.optionsFor(source, faction) : D.appearance[source] || [];
    const activeVal = String(current || "").toLowerCase();
    container.innerHTML = values
      .map((val) => {
        const key = val.toLowerCase();
        const isActive = key === activeVal;
        const translated = ptLabel(val);
        return `<button type="button" class="choice-pill ${isActive ? "active" : ""}" role="radio" aria-checked="${isActive}" data-picker-target="${selectId}" data-picker-value="${esc(key)}">${esc(translated)}</button>`;
      })
      .join("");
    if (labelId && $("#" + labelId)) {
      $("#" + labelId).textContent = ptLabel(activeVal);
    }
  }

  function renderCreatorPortraitThumbs(faction, current) {
    const container = $("#creatorPortraitThumbs");
    if (!container) return;
    const options = Art.presetOptions(faction);
    container.innerHTML = options
      .map((opt) => {
        const isActive = opt.id === current;
        const thumbSvg = Art.renderThumb ? Art.renderThumb(opt.id, faction) : "";
        return `<button type="button" class="preset-thumb ${isActive ? "active" : ""}" role="radio" aria-checked="${isActive}" data-picker-target="portraitSelect" data-picker-value="${esc(opt.id)}" title="${esc(opt.label)}"><span class="preset-thumb-art">${thumbSvg}</span><span>${esc(opt.label)}</span></button>`;
      })
      .join("");
    if ($("#creatorPortraitLabel")) {
      $("#creatorPortraitLabel").textContent = Art.presetLabel ? Art.presetLabel(current) : current;
    }
  }

  function syncCreatorPickers(faction, appearance) {
    renderCreatorPortraitThumbs(faction, appearance.portrait);
    renderVisualSwatches($("#creatorSkinSwatches"), "skin", "skinSelect", faction, appearance.skin, "creatorSkinLabel");
    renderVisualSwatches($("#creatorHairColorSwatches"), "hairColor", "hairColorSelect", faction, appearance.hairColor, "creatorHairColorLabel");
    renderVisualSwatches($("#creatorEyeSwatches"), "eyes", "eyeSelect", faction, appearance.eyes, "creatorEyeLabel");
    renderVisualPills($("#creatorEyeGlowPills"), "eyeGlow", "eyeGlowSelect", faction, appearance.eyeGlow, "creatorEyeGlowLabel");
    renderVisualPills($("#creatorMarkingPills"), "markings", "markingSelect", faction, appearance.marking, "creatorMarkingLabel");
    renderVisualPills($("#creatorAccessoryPills"), "accessories", "accessorySelect", faction, appearance.accessory, "creatorAccessoryLabel");
    renderVisualSwatches($("#creatorMetalSwatches"), "metals", "metalSelect", faction, appearance.metal, "creatorMetalLabel");
    renderVisualSwatches($("#creatorAccentSwatches"), "accents", "accentSelect", faction, appearance.accent, "creatorAccentLabel");
    renderVisualPills($("#creatorBackgroundPills"), "backgrounds", "backgroundSelect", faction, appearance.background, "creatorBackgroundLabel");
  }

  function setupCreator() {
    const fill = (sel, values) => {
      const el = $(sel);
      if (!el) return;
      el.innerHTML = values
        .map(
          (v) =>
            '<option value="' +
            esc(v.toLowerCase()) +
            '">' +
            esc(ptLabel(v)) +
            "</option>",
        )
        .join("");
    };
    const fillPortraits = (faction, current) => {
      const options = Art.presetOptions(faction);
      $("#portraitSelect").innerHTML = options
        .map(
          (opt) =>
            `<option value="${esc(opt.id)}" ${current === opt.id ? "selected" : ""}>${esc(opt.label)}</option>`,
        )
        .join("");
    };
    const fillFactionFields = (faction) => {
      const fields = {
        skinSelect: "skin",
        eyeSelect: "eyes",
        eyeGlowSelect: "eyeGlow",
        hairColorSelect: "hairColor",
        markingSelect: "markings",
        accessorySelect: "accessories",
        metalSelect: "metals",
        accentSelect: "accents",
        backgroundSelect: "backgrounds",
      };
      Object.entries(fields).forEach(([id, key]) =>
        fill("#" + id, Art.optionsFor ? Art.optionsFor(key, faction) : D.appearance[key] || []),
      );
    };
    const initialAppearance = Art.defaultAppearance("moonborn");
    fillFactionFields("moonborn");
    fillPortraits("moonborn", initialAppearance.portrait);
    setCreatorAppearance(initialAppearance);
    $$('[data-choice="faction"]').forEach((b) =>
      b.addEventListener("click", () => {
        $$('[data-choice="faction"]').forEach((x) => {
          x.classList.toggle("active", x === b);
          x.setAttribute("aria-pressed", String(x === b));
        });
        const nextFaction = b.dataset.value;
        const nextAppearance = Art.defaultAppearance(nextFaction);
        fillFactionFields(nextFaction);
        fillPortraits(nextFaction, nextAppearance.portrait);
        setCreatorAppearance(nextAppearance);
        updateCreator();
        sfx("click");
      }),
    );
    $("#creatorForm").addEventListener("click", (e) => {
      const pick = e.target.closest("[data-picker-target]");
      if (!pick) return;
      const select = $("#" + pick.dataset.pickerTarget);
      if (!select) return;
      select.value = pick.dataset.pickerValue;
      updateCreator();
      sfx("click");
    });
    $$("[data-creator-tab]").forEach((tab) => {
      tab.addEventListener("click", () =>
        activateCreatorTab(tab.dataset.creatorTab),
      );
      tab.addEventListener("keydown", (e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const tabs = $$("[data-creator-tab]");
        let index = tabs.indexOf(tab);
        if (e.key === "Home") index = 0;
        else if (e.key === "End") index = tabs.length - 1;
        else
          index =
            (index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
        tabs[index].focus();
        activateCreatorTab(tabs[index].dataset.creatorTab);
      });
    });
    $("#randomizeCharacterBtn").addEventListener("click", () => {
      const faction = $('[data-choice="faction"].active').dataset.value;
      setCreatorAppearance(Art.randomAppearance(faction));
      updateCreator();
      sfx("ability");
    });
    $("#creatorFocusBtn").addEventListener("click", (e) => {
      creatorPortraitMode = creatorPortraitMode === "full" ? "bust" : "full";
      const isBust = creatorPortraitMode === "bust";
      e.currentTarget.setAttribute("aria-pressed", String(isBust));
      e.currentTarget.innerHTML =
        Icons.svg("focus") + (isBust ? "Corpo inteiro" : "Foco no retrato");
      $("#creatorPortrait").classList.toggle("bust-focus", isBust);
      updateCreator();
    });
    $("#characterName").addEventListener("input", updateCreator);
    $$("#creatorForm select").forEach((s) =>
      s.addEventListener("change", updateCreator),
    );
    updateCreator();
  }

  function setCreatorAppearance(appearance) {
    const ids = {
      portrait: "portraitSelect",
      skin: "skinSelect",
      eyes: "eyeSelect",
      eyeGlow: "eyeGlowSelect",
      hairColor: "hairColorSelect",
      marking: "markingSelect",
      accessory: "accessorySelect",
      metal: "metalSelect",
      accent: "accentSelect",
      background: "backgroundSelect",
    };
    Object.entries(ids).forEach(([key, id]) => {
      if ($("#" + id) && appearance[key] !== undefined)
        $("#" + id).value = appearance[key];
    });
  }

  function activateCreatorTab(name) {
    $$("[data-creator-tab]").forEach((tab) => {
      const active = tab.dataset.creatorTab === name;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    $$("[data-creator-panel]").forEach((panel) => {
      const active = panel.dataset.creatorPanel === name;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
  }

  function creatorData() {
    const faction = $('[data-choice="faction"].active').dataset.value;
    const raw = {
      portrait: $("#portraitSelect").value,
      skin: $("#skinSelect").value,
      eyes: $("#eyeSelect").value,
      eyeGlow: $("#eyeGlowSelect").value,
      hairColor: $("#hairColorSelect").value,
      marking: $("#markingSelect") ? $("#markingSelect").value : "none",
      accessory: $("#accessorySelect") ? $("#accessorySelect").value : "none",
      metal: $("#metalSelect").value,
      accent: $("#accentSelect").value,
      background: $("#backgroundSelect").value,
    };
    return {
      name: $("#characterName").value.trim(),
      faction,
      spec: $("#specSelect").value,
      appearance: Art.normalizeAppearance(raw, faction),
    };
  }
  function updateCreator() {
    const faction = $('[data-choice="faction"].active').dataset.value;
    const f = D.factions[faction];
    document.body.dataset.faction = faction;
    document.documentElement.style.setProperty("--accent", f.color);
    document.documentElement.style.setProperty("--accent2", f.color2);
    const old = $("#specSelect").value;
    $("#specSelect").innerHTML = Object.entries(f.specs)
      .map(
        ([id, s]) =>
          '<option value="' +
          id +
          '" ' +
          (id === old ? "selected" : "") +
          ">" +
          esc(ptLabel(s.name)) +
          "</option>",
      )
      .join("");
    const data = creatorData();
    const spec = f.specs[data.spec] || Object.values(f.specs)[0];
    $("#creatorPortrait").innerHTML = characterSVG(
      { ...data, faction },
      creatorPortraitMode,
    );
    $("#creatorPortrait").classList.toggle("bust-focus", creatorPortraitMode === "bust");
    syncCreatorPickers(faction, data.appearance);
    $("#creatorFactionLore").innerHTML =
      '<strong class="accent">' + f.name + "</strong><br>" + PT.translate(f.lore);
    $("#specDescription").innerHTML =
      "<strong>" +
      iconSvg(spec.icon) +
      " " +
      esc(ptLabel(spec.name)) +
      "</strong><br>" +
      esc(PT.translate(spec.description));
    $("#creatorFactionSeal").innerHTML = Icons.svg(faction);
    $("#creatorPreviewBloodline").textContent = f.name + " • " + ptLabel(spec.name);
    $("#creatorPreviewName").textContent = data.name || "Herdeiro sem nome";
    $("#creatorLookSummary").textContent = Art.describe(data);
    const badgeValues = [
      data.appearance.marking,
      data.appearance.accessory,
      data.appearance.metal,
      data.appearance.accent,
    ].filter((v) => v && v !== "none");
    $("#creatorLookBadges").innerHTML = badgeValues
      .map((v) => '<span class="look-badge">' + esc(ptLabel(v)) + "</span>")
      .join("");
  }
  function confirmCharacter(e) {
    e.preventDefault();
    const data = creatorData();
    if (!data.name) {
      toast("A name is required before the night accepts you.", "error");
      $("#characterName").focus();
      return;
    }
    const f = D.factions[data.faction];
    openModal({
      title: "Selar a linhagem",
      body: `<p>Você está prestes a ingressar na linhagem <strong style="color:${f.color2}">${f.name}</strong> como <strong>${esc(data.name)}</strong>. Essa escolha definirá seus inimigos, habilidades, sua história e progressão. Tem certeza?</p>`,
      actions: [
        { label: "Voltar", class: "btn-ghost", action: "close" },
        {
          label: "Tenho certeza",
          class: "btn-primary",
          action: "create-character",
          payload: encodeURIComponent(JSON.stringify(data)),
        },
      ],
    });
  }

  function characterSVG(entity, size = "full") {
    return Art.render(entity, size);
  }


  function cleanBattlePortraitBackground(container) {
    if (!container) return;
    const svgs = container.querySelectorAll("svg");
    svgs.forEach((svg) => {
      svg.classList.add("wb-battle-transparent");
      svg.style.background = "transparent";
      const viewBox = (svg.getAttribute("viewBox") || "0 0 512 512")
        .trim()
        .split(/\s+/)
        .map(Number);
      const width = Math.abs(viewBox[2] || 512);
      const height = Math.abs(viewBox[3] || 512);
      Array.from(svg.children).forEach((node) => {
        if (!(node instanceof SVGElement) || node.tagName.toLowerCase() === "defs") return;
        const idClass = `${node.id || ""} ${node.getAttribute("class") || ""}`.toLowerCase();
        if (/background|backdrop|stage|sky|moon|cloud|fog|mist|landscape|scenery/.test(idClass)) {
          node.remove();
          return;
        }
        const tag = node.tagName.toLowerCase();
        if (tag === "rect") {
          const w = parseFloat(node.getAttribute("width") || "0");
          const h = parseFloat(node.getAttribute("height") || "0");
          if (w >= width * 0.78 && h >= height * 0.78) node.remove();
        } else if (tag === "circle") {
          const r = parseFloat(node.getAttribute("r") || "0");
          if (r >= Math.max(width, height) * 0.2) node.remove();
        } else if (tag === "ellipse") {
          const rx = parseFloat(node.getAttribute("rx") || "0");
          const ry = parseFloat(node.getAttribute("ry") || "0");
          if (rx >= width * 0.22 && ry >= height * 0.08) node.remove();
        }
      });
    });
  }

  function resolveEnemyFaction(enemy, context = {}) {
    const explicit = String(
      context.opponent?.faction ||
        context.opponent?.race ||
        enemy?.faction ||
        enemy?.race ||
        enemy?.combatRace ||
        "",
    ).toLowerCase();
    if (
      explicit === "moonborn" ||
      explicit.includes("werewolf") ||
      explicit.includes("lobisom")
    )
      return "moonborn";
    if (
      explicit === "bloodbound" ||
      explicit.includes("vampire") ||
      explicit.includes("vampir")
    )
      return "bloodbound";

    const type = String(enemy?.type || "").toLowerCase();
    const moonbornTypes = new Set([
      "rival werewolf",
      "beast",
      "mutant",
    ]);
    const bloodboundTypes = new Set([
      "rival vampire",
      "human",
      "hunter",
      "mercenary",
      "cultist",
      "undead",
      "demon",
    ]);
    if (moonbornTypes.has(type)) return "moonborn";
    if (bloodboundTypes.has(type)) return "bloodbound";

    const bossRaceById = {
      boss_0: "bloodbound",
      boss_1: "moonborn",
      boss_2: "bloodbound",
      boss_3: "bloodbound",
      boss_4: "bloodbound",
      boss_5: "bloodbound",
      boss_6: "moonborn",
      boss_7: "moonborn",
      boss_8: "bloodbound",
      boss_9: "moonborn",
    };
    if (enemy?.id && bossRaceById[enemy.id]) return bossRaceById[enemy.id];

    const identity = `${enemy?.name || ""} ${enemy?.description || ""}`.toLowerCase();
    if (/wolf|werewolf|lobisom|fera|besta|devorador|açougueiro|mutante/.test(identity))
      return "moonborn";
    if (/vamp|sangue|viúva|santo|inquisidor|cultista|morto|caçador/.test(identity))
      return "bloodbound";

    return U.chance(0.5) ? "bloodbound" : "moonborn";
  }

  function createEnemyVisual(enemy, context, faction) {
    if (
      window.WB_ENEMY_ART &&
      !window.WB_ENEMY_ART.shouldUseFactionPreset(enemy, context)
    ) {
      return null;
    }
    if (faction !== "moonborn" && faction !== "bloodbound") return null;
    const supplied = context.opponent?.appearance || enemy?.appearance || null;
    const randomized = Art.randomAppearance(faction);
    const appearance = Art.normalizeAppearance(
      supplied && supplied.portrait
        ? { ...randomized, ...supplied }
        : randomized,
      faction,
    );
    return {
      id: `${enemy.id || "enemy"}_visual_${Date.now()}_${U.rand(1000, 9999)}`,
      name: enemy.name,
      faction,
      spec:
        context.opponent?.spec ||
        enemy.spec ||
        U.pick(Object.keys(D.factions[faction].specs)),
      appearance,
      equipment: context.opponent?.equipment || enemy.equipment || {},
    };
  }
  function applyFactionTheme() {
    if (!state) return;
    const f = D.factions[state.player.faction];
    document.body.dataset.faction = state.player.faction;
    document.documentElement.style.setProperty("--accent", f.color);
    document.documentElement.style.setProperty("--accent2", f.color2);
  }
  function applySettings() {
    if (!state) return;
    const s = state.settings;
    document.body.classList.toggle("reduced-motion", s.reducedMotion);
    document.body.classList.toggle("high-contrast", s.highContrast);
    document.documentElement.style.setProperty("--text-scale", s.textSize);
    updateMuteIcons();
  }

  function currentLunar() {
    return S
      ? S.getLunarPhase(state)
      : { id: "full_moon", name: "Lua Cheia", glyph: "🌕", color: "#dcebff", summary: "A noite observa.", bonuses: {} };
  }

  function derived(p = state.player) {
    const a = p.attributes;
    let bonus = {};
    slots.forEach((s) => {
      const item = p.equipment?.[s];
      if (item)
        Object.entries(item.stats || {}).forEach(
          ([k, v]) => (bonus[k] = (bonus[k] || 0) + v + (item.upgrade || 0)),
        );
    });
    const val = (k) => (a[k] || 0) + (bonus[k] || 0);
    const endurance = val("endurance"),
      strength = val("strength"),
      defense = val("defense"),
      dexterity = val("dexterity"),
      perception = val("perception"),
      luck = val("luck");
    const weaponMin = bonus.minDamage || 3,
      weaponMax = bonus.maxDamage || 7,
      armorBonus = bonus.armor || 0;
    const fBonus = hideoutBonus("resourceBonus");
    const wallTier = hideoutBonus("wallDefense");
    const gateTier = hideoutBonus("arenaBonus");
    const pathTier = hideoutBonus("pathSpeed");
    const watchTier = hideoutBonus("accuracyBonus");
    const coreTier = Math.max(0, (state?.hideoutCore?.level || 1) - 1);
    const clanFort = state?.clan ? Math.min(C.clan.maxFortress, state.clan.fortress || 1) : 0;
    const ench = S ? S.sumEquipmentEnchantments(p) : {};
    const lunar = currentLunar().bonuses || {};

    const healthMult =
      1 +
      coreTier * C.hideout.coreBonuses.healthPerLevel +
      clanFort * 0.01 +
      (ench.healthMult || 0);
    const damageMult =
      1 +
      coreTier * C.hideout.coreBonuses.damagePerLevel +
      (ench.damageMult || 0) +
      (lunar.damageMult || 0);
    const armorMult =
      1 +
      coreTier * C.hideout.coreBonuses.armorPerLevel +
      wallTier * 0.04 +
      (ench.armorMult || 0) +
      (lunar.armorMult || 0);
    const lunarFactionRes = lunar.factionResource?.[p.faction] || 0;

    return {
      maxHealth: Math.floor(
        (90 + endurance * 9 + p.level * 6 + (ench.maxHealthFlat || 0)) *
          healthMult,
      ),
      minDamage: Math.floor(
        (weaponMin + strength * 1.9 + p.level * 0.6) * damageMult,
      ),
      maxDamage: Math.floor(
        (weaponMax + strength * 2.6 + p.level * 0.9) * damageMult,
      ),
      armor: Math.floor(
        (armorBonus + defense * 2.4 + p.level * 0.7) * armorMult,
      ),
      accuracy: U.clamp(
        0.72 +
          perception * 0.012 +
          dexterity * 0.004 +
          watchTier * 0.015 +
          (lunar.accuracy || 0),
        0.68,
        0.99,
      ),
      evasion: U.clamp(
        0.035 +
          dexterity * 0.008 +
          luck * 0.002 +
          gateTier * 0.02 +
          (ench.evasion || 0) +
          (lunar.evasion || 0),
        0.03,
        0.48,
      ),
      critChance: U.clamp(
        0.04 +
          luck * 0.007 +
          perception * 0.002 +
          watchTier * 0.01 +
          (ench.critChance || 0) +
          (lunar.critChance || 0),
        0.04,
        0.55,
      ),
      critDamage: 1.5 + luck * 0.025 + (ench.critDamage || 0),
      blockChance: U.clamp(
        0.025 +
          defense * 0.005 +
          wallTier * 0.02 +
          (ench.blockChance || 0),
        0.02,
        C.combat.maxBlock,
      ),
      initiative:
        dexterity * 2 +
        perception +
        luck * 0.4 +
        pathTier * 3 +
        (ench.initiative || 0),
      regeneration: Math.floor(
        1 +
          endurance * 0.18 +
          hideoutBonus("healthRegen") * 2 +
          (ench.regenFlat || 0) +
          (lunar.regenFlat || 0),
      ),
      resourceGeneration:
        1 +
        fBonus * 0.08 +
        (lunar.resourceMult || 0) +
        lunarFactionRes,
      lifesteal: (ench.lifesteal || 0) + (lunar.lifesteal || 0),
      weaknessBonus: ench.weaknessBonus || 0,
      burnProc: ench.burnProc || 0,
      presence: val("presence"),
      luck,
    };
  }
  function hideoutBonus(type) {
    if (!state) return 0;
    const structures = D.hideout[state.player.faction];
    const s = structures.find((x) => x.bonus === type);
    return s ? Math.max(0, (state.hideout[s.id] || 1) - 1) : 0;
  }
  function syncHealth() {
    const d = derived();
    state.player.health = U.clamp(state.player.health, 0, d.maxHealth);
  }
  function xpNeeded() {
    return C.xp.needed(state.player.level);
  }
  function energyRegenMs() {
    return Math.max(
      10000,
      C.energy.regenSeconds *
        1000 *
        (1 -
          hideoutBonus("trainingDiscount") * 0.025 -
          hideoutBonus("pathSpeed") * 0.06),
    );
  }
  function updateEnergy() {
    if (!state) return false;
    const now = Date.now();
    const regenMs = energyRegenMs();
    if (state.player.energy >= state.player.maxEnergy) {
      state.player.lastEnergyAt = now;
      return false;
    }
    const elapsed = now - state.player.lastEnergyAt;
    const points = Math.floor(elapsed / regenMs);
    if (points > 0) {
      state.player.energy = Math.min(
        state.player.maxEnergy,
        state.player.energy + points,
      );
      state.player.lastEnergyAt += points * regenMs;
      return true;
    }
    return false;
  }
  function energyCountdown() {
    if (state.player.energy >= state.player.maxEnergy) return "cheia";
    const regenMs = energyRegenMs();
    const left = Math.max(
      0,
      regenMs - (Date.now() - state.player.lastEnergyAt),
    );
    return `${String(Math.floor(left / 60000)).padStart(2, "0")}:${String(Math.floor((left % 60000) / 1000)).padStart(2, "0")}`;
  }

  function ensureUnlocks() {
    const available = D.abilities.filter(
      (a) =>
        a.faction === state.player.faction &&
        a.level <= state.player.level &&
        (a.spec === null || a.spec === state.player.spec),
    );
    state.player.unlockedAbilities = [
      ...new Set([
        ...(state.player.unlockedAbilities || []),
        ...available.map((a) => a.id),
      ]),
    ];
    if (!state.player.equippedAbilities?.length)
      state.player.equippedAbilities = available
        .filter((a) => a.level <= 5)
        .slice(0, 4)
        .map((a) => a.id);
    if (
      !state.player.equippedAbilities.includes(
        `${state.player.faction}_ability_16`,
      ) &&
      state.player.level >= 33
    )
      state.player.equippedAbilities[3] = `${state.player.faction}_ability_16`;
  }

  function updateTopbar() {
    if (!state) return;
    const d = derived();
    syncHealth();
    $("#topHealth").textContent =
      `${Math.ceil(state.player.health)}/${d.maxHealth}`;
    $("#topEnergy").textContent =
      `${state.player.energy}/${state.player.maxEnergy}`;
    $("#topGold").textContent = U.fmt(state.player.gold);
    $("#topShards").textContent = U.fmt(state.player.shards);
    $("#energyTimer").textContent = energyCountdown();
    const lunar = currentLunar();
    const lunarBtn = $("#lunarChipBtn");
    const lunarName = $("#topLunarName");
    if (lunarBtn && lunarName) {
      lunarBtn.style.setProperty("--lunar-color", lunar.color);
      lunarBtn.title = `${lunar.name}: ${lunar.summary}`;
      lunarName.textContent = lunar.name;
    }
  }
  function renderSidebar() {
    const p = state.player,
      f = D.factions[p.faction];
    dom.sidebarProfile.innerHTML = `<div class="mini-profile"><div class="mini-avatar">${characterSVG(p, "mini")}</div><div><h3>${esc(p.name)}</h3><p>Lv. ${p.level} ${esc(f.specs[p.spec].name)}</p></div><div class="mini-xp"><span style="width:${U.clamp((p.xp / xpNeeded()) * 100, 0, 100)}%"></span></div></div>`;
  }
  function renderMobileNav() {
    const items = [
      ["overview", "overview", "Início"],
      ["hunt", "hunt", "Caçada"],
      ["arena", "arena", "Arena"],
      ["inventory", "inventory", "Itens"],
      ["more", "menu", "Mais"],
    ];
    dom.mobileNav.innerHTML = items
      .map(
        ([v, i, l]) =>
          `<button data-view="${v}" class="${currentView === v ? "active" : ""}"><span>${Icons.svg(i)}</span>${l}</button>`,
      )
      .join("");
  }
  function handleNav(e) {
    const btn = e.target.closest("[data-view]");
    if (!btn) return;
    const v = btn.dataset.view;
    if (v === "more") {
      dom.sidebar.classList.toggle("open");
      return;
    }
    navigate(v);
    dom.sidebar.classList.remove("open");
  }
  function navigate(view) {
    if (!state) return;
    currentView = view;
    $$(".nav-item").forEach((b) =>
      b.classList.toggle("active", b.dataset.view === view),
    );
    renderMobileNav();
    const renders = {
      overview: renderOverview,
      character: renderCharacter,
      hunt: renderHunt,
      city: renderCity,
      arena: renderArena,
      missions: renderMissions,
      inventory: renderInventory,
      merchant: renderMerchant,
      hideout: renderHideout,
      clan: renderClan,
      bestiary: renderBestiary,
      achievements: renderAchievements,
      ranking: renderRanking,
      messages: renderMessages,
      settings: renderSettings,
    };
    (renders[view] || renderOverview)();
    dom.viewRoot.scrollTop = 0;
    dom.viewRoot.focus({ preventScroll: true });
    sfx("click");
  }

  function viewHeader(title, desc, actions = "") {
    return `<div class="view-header"><div><span class="eyebrow">CRÔNICA ${esc(D.factions[state.player.faction].name.toUpperCase())}</span><h2>${title}</h2><p>${desc}</p></div><div class="header-actions">${actions}</div></div>`;
  }
  function panelListItem(icon, title, sub, right = "") {
    return `<div class="list-item"><div class="icon-tile">${iconSvg(icon)}</div><div class="grow"><h4>${title}</h4><p>${sub}</p></div>${right}</div>`;
  }

  function renderOverview() {
    const p = state.player,
      d = derived(),
      f = D.factions[p.faction],
      spec = f.specs[p.spec],
      activeMissions = getActiveMissions().slice(0, 3),
      recent = state.combatHistory.slice(-3).reverse();
    const lunar = currentLunar();
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Visão geral", "Sua linhagem, objetivos imediatos e o estado vivo da noite sob o ciclo lunar.", `<button class="btn btn-ghost" data-action="open-lunar">Ciclo Lunar</button><button class="btn btn-primary" data-action="go-hunt">Iniciar Caçada</button>`)}
      <div class="grid grid-3"><section class="panel hero-panel" style="grid-column:span 2"><div class="portrait-stage hero-portrait">${characterSVG(p)}</div><div class="hero-copy"><div class="title-row"><span class="pill">${Icons.svg(p.faction)} ${f.name}</span><span class="pill">${iconSvg(spec.icon)} ${esc(ptLabel(spec.name))}</span></div><h2>${esc(p.name)}</h2><div class="muted">Nível ${p.level} • Rank #${U.fmt(p.rank)} • ${esc(p.clan || "Sem clã")}</div>
      <div class="bars"><div class="bar-row"><span>Vida</span><div class="bar hp"><span style="width:${(p.health / d.maxHealth) * 100}%"></span></div><b>${Math.ceil(p.health)}/${d.maxHealth}</b></div><div class="bar-row"><span>${ptLabel(f.resource)}</span><div class="bar resource"><span style="width:${p.resource}%"></span></div><b>${Math.floor(p.resource)}/100</b></div><div class="bar-row"><span>Experiência</span><div class="bar xp"><span style="width:${(p.xp / xpNeeded()) * 100}%"></span></div><b>${p.xp}/${xpNeeded()}</b></div></div>
      <div class="stat-strip"><div class="stat-tile"><small>Dano</small><b>${d.minDamage}–${d.maxDamage}</b></div><div class="stat-tile"><small>Armadura</small><b>${d.armor}</b></div><div class="stat-tile"><small>Crítico</small><b>${Math.round(d.critChance * 100)}%</b></div><div class="stat-tile"><small>Evasão</small><b>${Math.round(d.evasion * 100)}%</b></div></div></div></section>
      <section class="panel"><div class="panel-head"><h3>Condições da Noite</h3><button class="btn btn-small btn-ghost" data-action="open-lunar">Ritual</button></div><div class="list">${panelListItem("☾", `${lunar.name}${lunar.overridden ? ` (${lunar.remainingMin}m)` : ""}`, lunar.summary)}${panelListItem("⚡", "Energia de Caçada", `${p.energy}/${p.maxEnergy} • próxima ${energyCountdown()}`, `<button class="btn btn-small btn-ghost" data-action="refill-energy" ${p.shards < C.crafting.energyRefillShards || p.energy >= p.maxEnergy ? "disabled" : ""}>+${C.crafting.energyRefillAmount} • 1 ✦</button>`)}${panelListItem("✦", "Fragmentos do Eclipse", `${p.shards} ✦ disponíveis para Forja, Encantamentos e Rituais`, `<button class="btn btn-small btn-ghost" data-action="open-forge">Forja</button>`)}</div></section>
      <section class="panel"><div class="panel-head"><h3>Suggested Action</h3><span class="pill">Recommended</span></div><div class="action-banner"><div><h3>${p.level < 4 ? "Complete your first Blackthorn hunt" : p.level < 10 ? "Challenge the Ashen Forest" : "Advance the Hollow Eclipse"}</h3><p>${p.level < 4 ? "Earn equipment, experience and reveal your first event." : "The campaign adapts to your level and past choices."}</p></div><button class="btn btn-primary btn-small" data-action="go-hunt">Hunt</button></div></section>
      <section class="panel"><div class="panel-head"><h3>Active Missions</h3><button class="btn btn-ghost btn-small" data-action="go-missions">All</button></div><div class="list">${activeMissions.length ? activeMissions.map((m) => panelListItem("◆", esc(m.title), `${m.progress}/${m.goal}`, `<div class="progress" style="width:74px"><span style="width:${(m.progress / m.goal) * 100}%"></span></div>`)).join("") : '<p class="muted small">No active missions.</p>'}</div></section>
      <section class="panel"><div class="panel-head"><h3>Combates recentes</h3><span class="muted small">Últimos encontros</span></div><div class="list">${recent.length ? recent.map((r) => panelListItem(r.win ? "⚔" : "☠", esc(r.enemy), r.win ? `Vitória • +${r.xp} XP` : "Derrota • recuperado no refúgio", `<span class="${r.win ? "success-text" : "danger-text"} small">${r.win ? "VITÓRIA" : "DERROTA"}</span>`)).join("") : '<p class="muted small">Sua crônica de combate está vazia.</p>'}</div></section>
      <section class="panel"><div class="panel-head"><h3>Daily Objectives</h3><button class="btn btn-gold btn-small" data-action="daily">Calendar</button></div><div class="list">${getDailyObjectives()
        .map((o) =>
          panelListItem(
            o.icon,
            o.title,
            `${o.progress}/${o.goal}`,
            `<span class="reward-chip">${o.reward}</span>`,
          ),
        )
        .join("")}</div></section>
      </div></div>`;
  }

  function itemArtwork(item) {
    return Art.itemIcon(item);
  }

  function appearanceOptions(values, current) {
    return values
      .map(
        (value) =>
          '<option value="' +
          esc(value.toLowerCase()) +
          '" ' +
          (value.toLowerCase() === current ? "selected" : "") +
          ">" +
          esc(value) +
          "</option>",
      )
      .join("");
  }


  function presetAppearanceOptions(faction, current) {
    const options = Art.presetOptions ? Art.presetOptions(faction) : [];
    return options
      .map(
        (option) =>
          '<option value="' +
          esc(option.id) +
          '" ' +
          (option.id === current ? "selected" : "") +
          ">" +
          esc(option.label) +
          "</option>",
      )
      .join("");
  }

  function appearanceField(key, label, source, current, faction) {
    const id = "appearance-" + key;
    return (
      '<div class="appearance-field"><label for="' +
      id +
      '">' +
      label +
      '</label><select id="' +
      id +
      '" name="' +
      id +
      '" data-appearance-key="' +
      key +
      '">' +
      (source === "portraits"
        ? presetAppearanceOptions(faction, current)
        : appearanceOptions(Art.optionsFor ? Art.optionsFor(source, faction) : D.appearance[source], current)) +
      "</select></div>"
    );
  }

  function studioSwatchBlock(key, label, source, current, faction) {
    const values = Art.optionsFor ? Art.optionsFor(source, faction) : D.appearance[source] || [];
    const activeVal = String(current || "").toLowerCase();
    return (
      '<div class="visual-picker-block">' +
      '<div class="visual-picker-head"><span class="picker-label">' + esc(label) + '</span><span class="visual-picker-value">' + esc(ptLabel(activeVal)) + "</span></div>" +
      '<div class="swatch-row" role="radiogroup" aria-label="' + esc(label) + '">' +
      values
        .map((val) => {
          const k = val.toLowerCase();
          const isActive = k === activeVal;
          const translated = ptLabel(val);
          const bg = Art.swatchStyle ? Art.swatchStyle(source, k, faction) : "#555";
          return '<button type="button" class="swatch-btn ' + (isActive ? "active" : "") + '" role="radio" aria-checked="' + isActive + '" title="' + esc(translated) + '" aria-label="' + esc(translated) + '" data-action="studio-appearance" data-key="' + key + '" data-value="' + esc(k) + '"><span class="swatch-core" style="background:' + bg + '"></span></button>';
        })
        .join("") +
      "</div></div>"
    );
  }

  function studioPillBlock(key, label, source, current, faction) {
    const values = Art.optionsFor ? Art.optionsFor(source, faction) : D.appearance[source] || [];
    const activeVal = String(current || "").toLowerCase();
    return (
      '<div class="visual-picker-block">' +
      '<div class="visual-picker-head"><span class="picker-label">' + esc(label) + '</span><span class="visual-picker-value">' + esc(ptLabel(activeVal)) + "</span></div>" +
      '<div class="choice-pills" role="radiogroup" aria-label="' + esc(label) + '">' +
      values
        .map((val) => {
          const k = val.toLowerCase();
          const isActive = k === activeVal;
          return '<button type="button" class="choice-pill ' + (isActive ? "active" : "") + '" role="radio" aria-checked="' + isActive + '" data-action="studio-appearance" data-key="' + key + '" data-value="' + esc(k) + '">' + esc(ptLabel(val)) + "</button>";
        })
        .join("") +
      "</div></div>"
    );
  }

  function studioThumbBlock(current, faction) {
    const options = Art.presetOptions ? Art.presetOptions(faction) : [];
    const activeLabel = Art.presetLabel ? Art.presetLabel(current) : current;
    return (
      '<div class="visual-picker-block">' +
      '<div class="visual-picker-head"><span class="picker-label">Arte base</span><span class="visual-picker-value">' + esc(activeLabel) + "</span></div>" +
      '<div class="preset-thumb-grid" role="radiogroup" aria-label="Arte base">' +
      options
        .map((opt) => {
          const isActive = opt.id === current;
          const thumbSvg = Art.renderThumb ? Art.renderThumb(opt.id, faction) : "";
          return '<button type="button" class="preset-thumb ' + (isActive ? "active" : "") + '" role="radio" aria-checked="' + isActive + '" data-action="studio-appearance" data-key="portrait" data-value="' + esc(opt.id) + '" title="' + esc(opt.label) + '"><span class="preset-thumb-art">' + thumbSvg + "</span><span>" + esc(opt.label) + "</span></button>";
        })
        .join("") +
      "</div></div>"
    );
  }

  function renderAppearanceStudio() {
    const p = state.player,
      a = Art.normalizeAppearance(p.appearance, p.faction);
    const equipped = slots
      .map((slot) => {
        const item = p.equipment[slot];
        return (
          '<div class="visual-slot ' +
          (item ? "" : "empty") +
          '">' +
          (item ? itemArtwork(item) : '<span class="icon-tile">' + Icons.svg("shards") + "</span>") +
          "<div><strong>" +
          (item ? esc(item.name) : "Vazio") +
          "</strong><small>" +
          slotLabels[slot] +
          "</small></div></div>"
        );
      })
      .join("");
    return (
      '<section class="panel character-studio">' +
      '<div class="studio-portrait-wrap"><div id="studioPortrait" class="portrait-stage studio-portrait">' +
      characterSVG(p, "full") +
      '</div><div class="studio-portrait-label"><span>RETRATO VETORIAL AO VIVO</span><strong>' +
      esc(p.name) +
      '</strong><small id="studioAppearanceSummary">' +
      esc(Art.describe(p)) +
      "</small></div></div>" +
      '<div class="studio-controls"><span class="eyebrow">ATELIÊ DA NOITE</span><h3>Aparência e regalia</h3><p>Personalize retrato, tons, marcas rituais e acessórios da linhagem com aplicação imediata sobre o personagem.</p><div class="studio-visual-controls">' +
      studioThumbBlock(a.portrait, p.faction) +
      studioSwatchBlock("skin", "Pele / pelagem", "skin", a.skin, p.faction) +
      studioSwatchBlock("hairColor", "Cor do cabelo / pelagem", "hairColor", a.hairColor, p.faction) +
      studioSwatchBlock("eyes", "Cor dos olhos", "eyes", a.eyes, p.faction) +
      studioPillBlock("eyeGlow", "Brilho dos olhos", "eyeGlow", a.eyeGlow, p.faction) +
      studioPillBlock("marking", "Marca ritual / cicatriz", "markings", a.marking, p.faction) +
      studioPillBlock("accessory", "Acessório da linhagem", "accessories", a.accessory, p.faction) +
      studioSwatchBlock("metal", "Acabamento metálico", "metals", a.metal, p.faction) +
      studioSwatchBlock("accent", "Cor da roupa / capa", "accents", a.accent, p.faction) +
      studioPillBlock("background", "Cenário de origem", "backgrounds", a.background, p.faction) +
      '</div><div class="appearance-actions"><button class="btn btn-primary btn-small" data-action="randomize-appearance">' + Icons.svg("dice") + 'Sortear visual</button><button class="btn btn-ghost btn-small" data-action="reset-appearance">Restaurar estilo da linhagem</button></div></div>' +
      '<aside class="equipment-visual-list"><span class="eyebrow">EQUIPAMENTO VISÍVEL</span><h3>Integrado ao retrato</h3><p>Elmos, coroas, ombreiras, amuletos, anéis, relíquias e armas são encaixados diretamente na anatomia do retrato.</p><div class="visual-slot-list">' +
      equipped +
      "</div></aside>" +
      "</section>"
    );
  }

  function renderCharacter() {
    const p = state.player,
      d = derived(),
      f = D.factions[p.faction];
    const attrDescriptions = {
      strength: "Raises physical damage.",
      defense: "Raises armor and block chance.",
      dexterity: "Raises evasion and initiative.",
      endurance: "Raises maximum health and regeneration.",
      perception: "Raises accuracy and critical consistency.",
      presence: "Improves influence and merchant discounts.",
      luck: "Raises critical chance and rare outcomes.",
    };
    const derivedValues = [
      ["Maximum Health", d.maxHealth],
      ["Damage", `${d.minDamage}–${d.maxDamage}`],
      ["Armor", d.armor],
      ["Accuracy", `${Math.round(d.accuracy * 100)}%`],
      ["Evasion", `${Math.round(d.evasion * 100)}%`],
      ["Critical Chance", `${Math.round(d.critChance * 100)}%`],
      ["Critical Damage", `${Math.round(d.critDamage * 100)}%`],
      ["Block Chance", `${Math.round(d.blockChance * 100)}%`],
      ["Initiative", Math.round(d.initiative)],
      ["Regeneration", d.regeneration],
      ["Resource Gain", `${d.resourceGeneration.toFixed(2)}×`],
    ];
    const unlocked = D.abilities.filter((a) =>
      p.unlockedAbilities.includes(a.id),
    );
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Character", "Refine your living portrait, train attributes, inspect combat values and build an active ability loadout.")}${renderAppearanceStudio()}
      <div class="grid grid-3"><section class="panel" style="grid-column:span 2"><div class="panel-head"><h3>Attributes</h3><span class="pill">${U.fmt(p.gold)} gold</span></div><div class="stats-table">${Object.entries(
        p.attributes,
      )
        .map(([k, v]) => {
          const c1 = attributeCost(k, 1),
            c5 = attributeCost(k, 5),
            max = maxAffordable(k);
          return `<div class="stat-row"><div class="stat-main"><h4>${U.title(k)}</h4><p>${attrDescriptions[k]}</p></div><div class="stat-value"><b>${v}</b><small class="muted">Next: ${U.fmt(c1)} ◈</small></div><div class="stat-buttons"><button class="btn btn-ghost btn-small" data-action="upgrade-attr" data-attr="${k}" data-amount="1" ${p.gold < c1 ? "disabled" : ""}>+1</button><button class="btn btn-ghost btn-small" data-action="upgrade-attr" data-attr="${k}" data-amount="5" ${p.gold < c5 ? "disabled" : ""}>+5</button><button class="btn btn-gold btn-small" data-action="upgrade-attr" data-attr="${k}" data-amount="${max}" ${max < 1 ? "disabled" : ""}>Max ${max}</button></div></div>`;
        })
        .join("")}</div></section>
      <section class="panel"><h3>Derived Combat</h3><div class="derived-grid">${derivedValues.map(([n, v]) => `<div class="derived"><small>${n}</small><b>${v}</b></div>`).join("")}</div></section>
      <section class="panel" style="grid-column:1/-1"><div class="panel-head"><h3>Ability Tree</h3><span class="muted small">Equip up to four active abilities</span></div><div class="grid grid-4">${D.abilities
        .filter((a) => a.faction === p.faction)
        .map((a) => {
          const unlockedNow = p.unlockedAbilities.includes(a.id),
            eq = p.equippedAbilities.includes(a.id);
          return `<div class="achievement ${unlockedNow ? "" : "locked"}"><div class="ach-icon">${iconSvg(a.icon)}</div><h4>${esc(a.name)}</h4><p>${esc(a.description)}</p><div class="small muted">Nv. ${a.level} • ${a.cost} ${f.resource} • REC ${a.cooldown}</div><button class="btn ${eq ? "btn-secondary" : "btn-ghost"} btn-small" data-action="toggle-ability" data-id="${a.id}" ${!unlockedNow ? "disabled" : ""}>${eq ? "Equipado" : "Equipar"}</button></div>`;
        })
        .join("")}</div></section></div></div>`;
  }
  function attributeCost(attr, amount) {
    return Math.floor(
      C.attributes.cost(state.player.attributes[attr], amount) *
        (1 - hideoutBonus("trainingDiscount") * 0.04),
    );
  }
  function maxAffordable(attr) {
    let n = 0,
      cost = 0;
    while (n < 50) {
      const next = attributeCost(attr, n + 1);
      if (next > state.player.gold) break;
      n++;
      cost = next;
    }
    return n;
  }

  function renderHunt() {
    const region = D.regions[selectedRegion];
    const unlocked = state.player.level >= region.level;
    const bossObj = D.bosses[selectedRegion];
    const scenePreview = window.WB_BATTLE_SCENES
      ? window.WB_BATTLE_SCENES.get(region.id, false, region.colors)
      : { style: `linear-gradient(180deg,${region.colors[0]},${region.colors[1]})`, svg: "" };
    const hunts = [
      ["quick", "Caçada rápida", "Uma perseguição curta com recompensas consistentes.", 1, 0.8],
      ["careful", "Caçada cautelosa", "Menor risco e melhores opções nos eventos.", 1.08, 0.65],
      ["dangerous", "Caçada perigosa", "Inimigos difíceis e recompensas muito melhores.", 1.55, 1.35],
      ["monster", "Rastrear um monstro", "Encontre criaturas de elite e chefes regionais.", 1.35, 1.2],
      ["treasure", "Procurar tesouros", "Menos batalhas, mais materiais e segredos.", 0.85, 0.55],
      ["rival", "Caçar a facção rival", "Um duelo de alta pressão contra a linhagem oposta.", 1.6, 1.45],
    ];
    const worldMapHtml = window.WB_WORLD_MAP
      ? window.WB_WORLD_MAP.renderMap(D.regions, selectedRegion, state.player.level, state.story.flags)
      : "";
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Caçada", "Explore os domínios no mapa cartográfico, ative eventos ilustrados, descubra segredos e enfrente criaturas noturnas.")}
      <section aria-label="Mapa das regiões">${worldMapHtml}</section>
      <div class="grid grid-3" style="margin-top:14px"><section class="panel" style="grid-column:span 2"><div class="panel-head"><div><h3>${esc(region.name)}</h3><span class="muted small">Nível recomendado ${region.level} • Dificuldade ${region.difficulty}/6</span></div><span class="pill">Segredo: ${state.story.flags[`secret_${region.id}`] ? esc(region.secret) : "Desconhecido"}</span></div><p class="muted small" style="margin:-4px 0 12px;line-height:1.5">${esc(region.description)}</p><div class="hunt-options">${hunts
        .map(([id, name, desc, reward, risk]) => {
          const cost = C.energy.huntCosts[id];
          return `<div class="hunt-option"><h4>${name}</h4><p>${desc}</p><footer><span class="cost">${Icons.svg("energy")} ${cost} • Recompensa ${reward}×</span><button class="btn btn-primary btn-small" data-action="start-hunt" data-type="${id}" data-reward="${reward}" data-risk="${risk}" ${!unlocked || state.player.energy < cost ? "disabled" : ""}>${unlocked ? "Caçar" : `Nv. ${region.level}`}</button></footer></div>`;
        })
        .join("")}</div></section>
      <section class="panel"><h3>Inteligência da região</h3><div class="region-preview-strip" style="background:${scenePreview.style}">${scenePreview.svg}</div>${bossObj ? `<div class="region-preview-boss"><div class="region-preview-boss-art">${window.WB_ENEMY_ART ? window.WB_ENEMY_ART.render({ ...bossObj, boss: true }, {}) : iconSvg(region.icon)}</div><div><span class="eyebrow">CHEFE REGIONAL</span><h4 style="margin:2px 0">${esc(bossObj.name)}</h4><small class="muted">${esc(PT.translate(bossObj.signature))}</small></div></div>` : ""}<div class="list">${panelListItem("gem", "Saque exclusivo", "Equipamentos e materiais regionais")}${panelListItem("eclipse", "Segredo descobrível", state.story.flags[`secret_${region.id}`] ? region.secret : "Ainda oculto")}${panelListItem(
        "arena",
        "Ameaças conhecidas",
        D.enemies
          .filter((e) => e.region === selectedRegion)
          .slice(0, 3)
          .map((e) => e.name)
          .join(", ") || "Entidades ancestrais",
      )}</div></section></div></div>`;
  }

  function renderCity() {
    const availableStory = D.storyChapters.find(
      (c) => !state.story.completed.includes(c.id),
    );
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("The Night City", "Advance the campaign, craft equipment and visit the districts that connect every system.")}
      <div class="grid grid-3"><section class="panel" style="grid-column:span 2"><div class="panel-head"><h3>Story Campaign</h3><span class="pill">Chapter ${availableStory?.id || 6}/6</span></div>${availableStory ? `<div class="action-banner"><div><span class="eyebrow">THE HOLLOW ECLIPSE</span><h3>${esc(availableStory.title)}</h3><p>${esc(availableStory.description)} • Recommended level ${availableStory.level}</p></div><button class="btn btn-primary" data-action="start-story" data-chapter="${availableStory.id}" ${state.player.level < availableStory.level ? "disabled" : ""}>Begin Chapter</button></div>` : `<div class="action-banner"><div><h3>The chronicle has reached its ending</h3><p>${esc(state.story.ending || "Your final choice remains written in the rift.")}</p></div></div>`}<div class="list" style="margin-top:12px">${D.storyChapters.map((c) => { const cleared = state.story.completed.includes(c.id); const locked = !cleared && state.player.level < c.level; return panelListItem(cleared ? "✓" : locked ? "lock" : "◉", `Chapter ${c.id}: ${esc(c.title)}`, cleared ? "Completed" : `Requires level ${c.level}`, `<span class="${cleared ? "success-text" : "muted"} small">${cleared ? "CLEARED" : locked ? "LOCKED" : "OPEN"}</span>`); }).join("")}</div></section>
      <section class="panel"><h3>City Districts</h3><div class="list">${panelListItem("♧", "Merchant Row", "Buy, sell and compare rotating stock.", `<button class="btn btn-small btn-ghost" data-action="go-merchant">Visit</button>`)}${panelListItem("⚒", "Black Forge", "Upgrade, dismantle and reroll equipment.", `<button class="btn btn-small btn-ghost" data-action="open-forge">Forge</button>`)}${panelListItem("⚗", "Alchemist’s Stair", "Craft restorative tonics from materials.", `<button class="btn btn-small btn-ghost" data-action="open-alchemy">Craft</button>`)}${panelListItem("♜", "Arena Gate", "Challenge a rival character.", `<button class="btn btn-small btn-ghost" data-action="go-arena">Enter</button>`)}</div></section>
      <section class="panel"><h3>Materials</h3><div class="derived-grid">${D.materials.map((m) => `<div class="derived"><small>${materialLabels[m] || m}</small><b>${state.player.materials[m] || 0}</b></div>`).join("")}</div></section>
      <section class="panel" style="grid-column:span 2"><h3>Campaign Consequences</h3><p class="muted">Your choices alter reputation, alignment, dialogue and reward variants. No choice permanently locks the save; later chapters offer reconciliation paths.</p><div class="stat-strip"><div class="stat-tile"><small>Reputation</small><b>${state.player.reputation}</b></div><div class="stat-tile"><small>Alignment</small><b>${state.player.alignment > 0 ? "Merciful" : state.player.alignment < 0 ? "Predatory" : "Unbound"}</b></div><div class="stat-tile"><small>Secrets</small><b>${state.metrics.secrets}/10</b></div><div class="stat-tile"><small>Chapters</small><b>${state.story.completed.length}/6</b></div></div></section></div></div>`;
  }

  function divisionFor(rating) {
    let div = D.divisions[0][0];
    D.divisions.forEach(([n, min]) => {
      if (rating >= min) div = n;
    });
    return div;
  }
  function refreshArenaOpponents(force = true) {
    if (!state) return;
    const today = U.dayKey();
    if (state.arena.lastBattleDay !== today) {
      state.arena.lastBattleDay = today;
      state.arena.dailyBattles = 0;
      state.arena.streak = 0;
    }
    if (force || !state.arena.opponents?.length)
      state.arena.opponents = Array.from({ length: 6 }, () =>
        D.generateOpponent(state.player),
      );
    state.arena.division = divisionFor(state.arena.rating);
  }
  function renderArena() {
    refreshArenaOpponents(false);
    const a = state.arena;
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Arena", "Challenge simulated rival characters generated from the opposing bloodline. They are inhabitants of this offline chronicle, not online players.", `<button class="btn btn-ghost" data-action="refresh-arena">Refresh • ${C.arena.refreshCost} ◈</button>`)}
      <section class="division-banner"><div><span class="eyebrow">CURRENT DIVISION</span><h2>${a.division}</h2><div class="muted small">Daily battles ${a.dailyBattles}/${C.arena.dailyLimit} • Win streak ${a.streak}</div></div><div class="league-points">${U.fmt(a.rating)} RP</div></section>
      <section class="arena-opponents" style="margin-top:14px">${a.opponents.map((o) => `<article class="panel opponent-card"><div class="opponent-avatar">${characterSVG(o, "avatar")}</div><h3>${esc(o.name)}</h3><div class="muted small">${esc(D.factions[o.faction].specs[o.spec].name)} • ${esc(o.clan)}</div><div class="opponent-stats"><span>Lv. ${o.level}</span><span>${o.rating} RP</span><span>${o.record}</span></div><div class="pill">Power estimate ${o.power}</div><p class="muted small">Difficulty: ${o.power > state.player.level * 60 + state.arena.rating * 0.3 ? "Severe" : o.power > state.player.level * 45 ? "Challenging" : "Favorable"}</p><button class="btn btn-primary" data-action="fight-rival" data-id="${o.id}" ${a.dailyBattles >= C.arena.dailyLimit ? "disabled" : ""}>Challenge</button></article>`).join("")}</section>
      <section class="panel" style="margin-top:14px"><div class="panel-head"><h3>Match History</h3><span class="muted small">Seasonal simulation</span></div><div class="list">${
        a.history.length
          ? a.history
              .slice(-8)
              .reverse()
              .map((h) =>
                panelListItem(
                  h.win ? "⚔" : "☠",
                  esc(h.name),
                  `${h.win ? "Victory" : "Defeat"} • ${h.ratingChange > 0 ? "+" : ""}${h.ratingChange} RP`,
                  `<span class="small">${new Date(h.date).toLocaleDateString("pt-BR")}</span>`,
                ),
              )
              .join("")
          : '<p class="muted small">No Arena matches yet.</p>'
      }</div></section></div>`;
  }

  function getMissionData(ms) {
    const base = D.missions.find((m) => m.id === ms.id);
    return base
      ? { ...base, ...ms, progress: Math.min(ms.progress || 0, base.goal) }
      : null;
  }
  function getActiveMissions() {
    return state.missions
      .map(getMissionData)
      .filter(
        (m) =>
          m && m.accepted && !m.claimed && m.minLevel <= state.player.level,
      );
  }
  function renderMissions() {
    const filters = [
      "all",
      "tutorial",
      "story",
      "side",
      "daily",
      "weekly",
      "faction",
      "clan",
    ];
    let missions = state.missions
      .map(getMissionData)
      .filter(Boolean)
      .filter(
        (m) =>
          m.minLevel <= state.player.level &&
          (missionFilter === "all" || m.category === missionFilter),
      );
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Missions", "Track tutorial, story, faction, daily, clan and long-form objectives. Progress updates across every connected system.")}
      <div class="mission-tabs">${filters.map((f) => `<button class="tab ${missionFilter === f ? "active" : ""}" data-action="mission-filter" data-filter="${f}">${U.title(f)}</button>`).join("")}</div><div class="grid grid-2">${missions.map((m) => `<article class="mission-card ${m.progress >= m.goal ? "completed" : ""}"><div class="panel-head"><div><span class="eyebrow">${m.category}</span><h4>${esc(m.title)}</h4></div><span class="pill">${m.progress}/${m.goal}</span></div><p class="muted small">${esc(m.description)}</p><div class="progress"><span style="width:${(m.progress / m.goal) * 100}%"></span></div><div class="rewards"><span class="reward-chip">${m.rewards.xp} XP</span><span class="reward-chip">${m.rewards.gold} gold</span>${m.rewards.shards ? `<span class="reward-chip">${m.rewards.shards} shard</span>` : ""}</div><div style="margin-top:10px;text-align:right">${m.claimed ? '<span class="success-text small">CLAIMED</span>' : m.progress >= m.goal ? `<button class="btn btn-gold btn-small" data-action="claim-mission" data-id="${m.id}">Claim</button>` : m.accepted ? '<span class="muted small">ACTIVE</span>' : `<button class="btn btn-ghost btn-small" data-action="accept-mission" data-id="${m.id}">Accept</button>`}</div></article>`).join("")}</div></div>`;
  }

  function inventoryItems() {
    return state.player.inventory.filter(
      (i) =>
        (inventoryFilter.rarity === "all" ||
          i.rarity === inventoryFilter.rarity) &&
        (inventoryFilter.slot === "all" || i.slot === inventoryFilter.slot) &&
        i.name.toLowerCase().includes(inventoryFilter.search.toLowerCase()),
    );
  }
  function itemEnchantBadge(i) {
    if (!i?.enchantment || !S) return "";
    const ench = S.getEnchantment(i.enchantment);
    if (!ench) return "";
    return `<span class="item-enchant-pill" style="color:${ench.color}">✦ ${esc(ench.short)}</span>`;
  }

  function renderEquipSlotBtn(s, p) {
    const item = p.equipment[s];
    const ench = item?.enchantment && S ? S.getEnchantment(item.enchantment) : null;
    return `<button type="button" class="equip-slot ${item ? `rarity-${item.rarity}` : ""}" data-action="slot-detail" data-slot="${s}" aria-label="${item ? "Inspecionar " + esc(item.name) : slotLabels[s] + " está vazio"}"><small>${slotLabels[s]}${ench ? ` • <span style="color:${ench.color}">✦</span>` : ""}</small>${item ? `<div class="item-icon">${itemArtwork(item)}</div><h4>${esc(item.name)}${item.upgrade ? ` +${item.upgrade}` : ""}</h4>` : '<h4 class="muted">Vazio</h4>'}</button>`;
  }

  function itemCompareBadge(i) {
    if (!i || !i.slot) return "";
    const eq = state.player.equipment[i.slot];
    if (!eq) return '<span class="item-compare-badge fresh">★ NOVO</span>';
    const diff = comparePower(i) - comparePower(eq);
    if (diff > 0) return `<span class="item-compare-badge up">▲ +${diff}</span>`;
    if (diff < 0) return `<span class="item-compare-badge down">▼ ${diff}</span>`;
    return '<span class="item-compare-badge">= 0</span>';
  }

  function batchEligibleItems(rarities) {
    return state.player.inventory.filter(
      (i) => i.slot && !i.locked && !i.favorite && rarities.includes(i.rarity),
    );
  }

  function renderInventory() {
    const p = state.player,
      d = derived(),
      items = inventoryItems();
    const leftSlots = ["head", "chest", "hands", "legs", "feet"];
    const rightSlots = ["weapon", "secondary", "amulet", "ring1", "ring2", "relic"];
    const commonSellable = batchEligibleItems(["common"]);
    const commonGold = commonSellable.reduce((sum, i) => sum + (i.value || 10), 0);
    const dismantleBatch = batchEligibleItems(["common", "uncommon"]);

    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Inventário", "Compare diretamente contra o equipamento atual, gerencie seus 11 encaixes no painel Paper-Doll e limpe a mochila em lote.", `<button class="btn btn-ghost" data-action="inventory-mode">${inventoryMode === "grid" ? "Visualização em lista" : "Visualização em grade"}</button>`)}
      <div class="paperdoll-layout"><section class="panel"><div class="panel-head"><h3>Equipado</h3><span class="pill">${Object.values(p.equipment).filter(Boolean).length}/11 encaixes</span></div>
      <div class="paperdoll-board">
        <div class="paperdoll-col">${leftSlots.map((s) => renderEquipSlotBtn(s, p)).join("")}</div>
        <div class="paperdoll-center">
          <div class="paperdoll-stage portrait-stage">${characterSVG(p, "full")}</div>
          <div class="paperdoll-summary">
            <div><small>Dano</small><b>${d.minDamage}–${d.maxDamage}</b></div>
            <div><small>Armadura</small><b>${d.armor}</b></div>
            <div><small>Vida</small><b>${d.maxHealth}</b></div>
          </div>
        </div>
        <div class="paperdoll-col">${rightSlots.map((s) => renderEquipSlotBtn(s, p)).join("")}</div>
      </div></section>
      <section class="panel"><div class="inventory-toolbar"><label class="sr-only" for="inventorySearch">Buscar itens</label><input id="inventorySearch" name="inventorySearch" placeholder="Buscar itens" value="${esc(inventoryFilter.search)}"><label class="sr-only" for="inventoryRarity">Filtrar por raridade</label><select id="inventoryRarity" name="inventoryRarity"><option value="all">Todas as raridades</option>${Object.keys(
        rarityColors,
      )
        .map(
          (r) =>
            `<option value="${r}" ${inventoryFilter.rarity === r ? "selected" : ""}>${esc(ptLabel(r))}</option>`,
        )
        .join(
          "",
        )}</select><label class="sr-only" for="inventorySlot">Filtrar por encaixe</label><select id="inventorySlot" name="inventorySlot"><option value="all">Todos os espaços</option>${slots.map((s) => `<option value="${s}" ${inventoryFilter.slot === s ? "selected" : ""}>${slotLabels[s]}</option>`).join("")}</select><span class="pill">${p.inventory.length}/${C.loot.maxInventory + hideoutBonus("storage") * 10}</span></div>
      <div class="inventory-batch-bar"><span class="muted">Ações em lote (ignora bloqueados e favoritos):</span><button type="button" class="btn btn-small btn-ghost" data-action="batch-sell-common" ${commonSellable.length ? "" : "disabled"}>${Icons.svg("gold")}Vender Comuns (${commonSellable.length}${commonSellable.length ? ` • +${U.fmt(commonGold)}` : ""})</button><button type="button" class="btn btn-small btn-ghost" data-action="batch-dismantle" ${dismantleBatch.length ? "" : "disabled"}>${Icons.svg("forge")}Desmontar Com./Inc. (${dismantleBatch.length})</button></div>
      <div class="${inventoryMode === "grid" ? "inventory-grid" : "list"}">${items.length ? items.map((i) => (inventoryMode === "grid" ? itemCard(i) : panelListItem(itemArtwork(i), esc(i.name), `${ptLabel(i.rarity)} • ${i.slot ? slotLabels[i.slot] : "Consumível"}`, `<button class="btn btn-small btn-ghost" data-action="item-detail" data-id="${i.id}">Inspecionar</button>`))).join("") : '<p class="muted small">Nenhum item corresponde a estes filtros.</p>'}</div></section></div></div>`;
  }
  function itemCard(i) {
    return `<button type="button" class="item-card rarity-${i.rarity} ${i.locked ? "locked" : ""}" data-action="item-detail" data-id="${i.id}" aria-label="Inspecionar ${esc(i.name)}">${itemCompareBadge(i)}${itemEnchantBadge(i)}<div class="item-icon">${itemArtwork(i)}</div><h4>${esc(i.name)}${i.upgrade ? ` +${i.upgrade}` : ""}${i.count > 1 ? ` ×${i.count}` : ""}</h4><p>${esc(ptLabel(i.rarity))} • ${i.slot ? slotLabels[i.slot] : "Consumível"}</p></button>`;
  }

  function refreshMerchant(force = false) {
    if (!state) return;
    ensureMerchantShape();
    const today = U.dayKey();
    const fullyPopulated = MERCHANT_TYPES.every((type) => activeMerchantStock(type).length);
    if (!force && state.merchant.day === today && fullyPopulated) return;
    state.merchant.day = today;
    MERCHANT_TYPES.forEach((type) => generateMerchantStock(type));
  }
  function renderMerchant() {
    refreshMerchant();
    const discount = merchantDiscount();
    const stock = activeMerchantStock(merchantType);
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Mercador", "Cada lojista tem estoque próprio. Use Fragmentos (✦) para renovar todos os estoques sob demanda.", `<span class="pill">Desconto ${Math.round(discount * 100)}%</span><button type="button" class="btn btn-small btn-gold" data-action="refresh-merchant-shards" ${state.player.shards < C.crafting.merchantRefreshShards ? "disabled" : ""}>Renovar Estoque • ${C.crafting.merchantRefreshShards} ✦</button>`)}<div class="merchant-tabs">${MERCHANT_TYPES.map((t) => `<button class="tab ${merchantType === t ? "active" : ""}" data-action="merchant-type" data-type="${t}">${MERCHANT_DEFS[t].label}</button>`).join("")}</div>
      <div class="grid grid-3"><section class="panel" style="grid-column:span 2"><div class="panel-head"><h3>${MERCHANT_DEFS[merchantType].label}</h3><span class="muted small">Gira em ${state.merchant.day}</span></div><div class="inventory-grid">${stock
        .map(
          (i) =>
            `<button type="button" class="item-card rarity-${i.rarity} ${i.level > state.player.level ? "locked locked-level" : ""}" data-action="merchant-item" data-id="${i.id}" aria-label="Inspecionar ${esc(i.name)}"><div class="item-icon">${itemArtwork(i)}</div>${i.level > state.player.level ? `<span class="lock-badge">Nv ${i.level}</span>` : ""}<h4>${esc(i.name)}</h4><p>${esc(ptLabel(i.rarity))} • ${i.level > state.player.level ? `Libera no nível ${i.level}` : `${U.fmt(Math.floor(i.price * (1 - discount)))} ◈`}</p></button>`,
        )
        .join("")}</div></section>
      <section class="panel"><h3>Recompra</h3><div class="list">${
        state.merchant.buyback.length
          ? state.merchant.buyback
              .slice(-6)
              .reverse()
              .map((i) =>
                panelListItem(
                  i.icon,
                  esc(i.name),
                  `${U.fmt(Math.floor(i.value * 1.15))} ouro`,
                  `<button class="btn btn-small btn-ghost" data-action="buyback" data-id="${i.id}">Comprar</button>`,
                ),
              )
              .join("")
          : '<p class="muted small">Itens vendidos aparecem aqui.</p>'
      }</div><h3 style="margin-top:20px">Bolsa</h3><div class="stat-strip"><div class="stat-tile"><small>Ouro</small><b>${U.fmt(state.player.gold)}</b></div><div class="stat-tile"><small>Fragmentos</small><b>${state.player.shards}</b></div></div></section></div></div>`;
  }

  function hideoutStageInfo(structures, coreLevel) {
    const structureExtra = structures.reduce(
      (sum, structure) => sum + Math.max(0, (state.hideout[structure.id] || 1) - 1),
      0,
    );
    const coreExtra = Math.max(0, coreLevel - 1) * 2;
    const totalProgressPoints = structureExtra + coreExtra;
    const thresholds = [0, 8, 16, 24, 34, 46];
    let stage = 1;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (totalProgressPoints >= thresholds[i]) {
        stage = i + 1;
        break;
      }
    }
    const currentThreshold = thresholds[stage - 1];
    const nextThreshold = thresholds[Math.min(stage, thresholds.length - 1)];
    const maxPoints =
      structures.length * (C.hideout.maxStructureLevel - 1) +
      (C.hideout.maxCoreLevel - 1) * 2;
    const stageProgress =
      stage >= thresholds.length
        ? 1
        : U.clamp(
            (totalProgressPoints - currentThreshold) /
              Math.max(1, nextThreshold - currentThreshold),
            0,
            1,
          );
    return {
      stage,
      title: HIDEOUT_STAGE_NAMES[stage - 1],
      image: HIDEOUT_STAGE_IMAGES[stage - 1],
      points: totalProgressPoints,
      maxPoints,
      totalProgress: maxPoints ? totalProgressPoints / maxPoints : 0,
      stageProgress,
      upgradesToNext:
        stage >= thresholds.length ? 0 : Math.max(0, nextThreshold - totalProgressPoints),
    };
  }

  let hideoutZoneFilter = "all";
  const HIDEOUT_ZONE_LABELS = {
    all: "Todas",
    wall: "Muralha",
    gate: "Portão",
    path: "Caminho",
    landscape: "Paisagem",
    sanctum: "Santuário",
  };

  function hideoutHotspots(stage, lunar) {
    const house =
      stage <= 2
        ? "365,470 375,245 430,165 500,105 570,165 625,245 635,470"
        : stage <= 4
          ? "345,485 355,230 415,140 500,72 585,140 645,230 655,485"
          : "335,485 348,215 410,125 500,55 590,125 652,215 665,485";
    return `<svg class="hideout-hotspots" viewBox="0 0 1000 750" preserveAspectRatio="none" aria-label="Áreas interativas do esconderijo">
      <g class="hideout-hotspot hideout-hotspot-house" tabindex="0" role="button" aria-label="Inspecionar residência e núcleo" data-action="hideout-focus" data-zone="core">
        <polygon points="${house}"></polygon><text x="500" y="180">Residência • Núcleo</text>
      </g>
      <g class="hideout-hotspot hideout-hotspot-wall" tabindex="0" role="button" aria-label="Filtrar muralha e vigia (oeste)" data-action="hideout-focus" data-zone="wall">
        <path d="M0 495 L308 495 L308 615 L0 615 Z"></path><text x="154" y="562">Muralha</text>
      </g>
      <g class="hideout-hotspot hideout-hotspot-wall" tabindex="0" role="button" aria-label="Filtrar muralha e vigia (leste)" data-action="hideout-focus" data-zone="wall">
        <path d="M692 545 L1000 545 L1000 745 L692 745 Z"></path><text x="846" y="635">Muralha</text>
      </g>
      <g class="hideout-hotspot hideout-hotspot-gate" tabindex="0" role="button" aria-label="Filtrar portão e defesa de entrada (oeste)" data-action="hideout-focus" data-zone="gate">
        <path d="M316 548 L422 548 L422 745 L316 745 Z"></path><text x="369" y="618">Portão</text>
      </g>
      <g class="hideout-hotspot hideout-hotspot-gate" tabindex="0" role="button" aria-label="Filtrar portão e defesa de entrada (leste)" data-action="hideout-focus" data-zone="gate">
        <path d="M598 548 L684 548 L684 745 L598 745 Z"></path><text x="641" y="618">Portão</text>
      </g>
      <g class="hideout-hotspot hideout-hotspot-path" tabindex="0" role="button" aria-label="Filtrar caminho e rotas de caçada" data-action="hideout-focus" data-zone="path">
        <path d="M430 745 L590 745 L568 580 L554 494 L456 494 L444 585 Z"></path><text x="512" y="645">Caminho</text>
      </g>
      <g class="hideout-hotspot hideout-hotspot-trees" tabindex="0" role="button" aria-label="Filtrar paisagem e terreno (oeste)" data-action="hideout-focus" data-zone="landscape">
        <path d="M0 165 Q125 100 328 190 L328 532 Q165 565 0 532 Z"></path><text x="155" y="330">Paisagem</text>
      </g>
      <g class="hideout-hotspot hideout-hotspot-trees" tabindex="0" role="button" aria-label="Filtrar paisagem e terreno (leste)" data-action="hideout-focus" data-zone="landscape">
        <path d="M672 265 Q835 230 1000 265 L1000 532 Q835 565 672 532 Z"></path><text x="842" y="390">Paisagem</text>
      </g>
      <g class="hideout-hotspot hideout-hotspot-sanctum" tabindex="0" role="button" aria-label="Filtrar santuário e rituais lunares" data-action="hideout-focus" data-zone="sanctum">
        <circle cx="845" cy="158" r="84"></circle><text x="845" y="164">${esc(lunar?.name || "Santuário")}</text>
      </g>
    </svg>`;
  }

  function hideoutEffectText(structure, level) {
    const tier = Math.max(0, level - 1);
    const values = {
      trainingDiscount: `${tier * 4}% de desconto em atributos`,
      goldBonus: `+${tier * 4}% de ouro em vitórias`,
      storage: `+${tier * 10} espaços no inventário`,
      arenaBonus: `+${tier * 5}% de XP/ouro na Arena e +${tier * 2}% de evasão`,
      craftBonus: `${tier * 5}% menos ouro na forja e ${tier * 10}% de chance de recuperar material`,
      accuracyBonus: `+${(tier * 1.5).toFixed(tier ? 1 : 0)}% de precisão e +${tier}% de crítico`,
      lootBonus: `+${(tier * 2.5).toFixed(tier ? 1 : 0)}% de chance de saque raro`,
      missionSlots: `+${tier} vagas de missões paralelas`,
      healthRegen: `+${tier * 2} de regeneração de vida por turno`,
      resourceBonus: `+${tier * 8}% de geração do recurso da linhagem`,
      wallDefense: `+${tier * 4}% de armadura total e +${tier * 2}% de bloqueio`,
      pathSpeed: `${tier * 6}% regeneração de energia mais rápida e +${tier * 3} de iniciativa`,
    };
    return values[structure.bonus] || `Nível de bônus ${tier}`;
  }

  function renderHideout() {
    const structures = D.hideout[state.player.faction];
    const filteredStructures =
      hideoutZoneFilter === "all"
        ? structures
        : structures.filter((s) => s.zone === hideoutZoneFilter);
    const coreLevel = state.hideoutCore?.level || 1;
    const coreTier = Math.max(0, coreLevel - 1);
    const coreCost = C.hideout.coreCost(coreLevel);
    const totalStructureLevels = structures.reduce(
      (sum, structure) => sum + (state.hideout[structure.id] || 1),
      0,
    );
    const hideoutPower = coreLevel * 100 + totalStructureLevels * 25;
    const scene = hideoutStageInfo(structures, coreLevel);
    const lunar = currentLunar();
    const zoneAvg = (zone) => {
      const list = structures.filter((s) => s.zone === zone);
      return list.reduce((sum, s) => sum + (state.hideout[s.id] || 1), 0);
    };
    const wallLv = state.hideout[structures.find((s) => s.bonus === "wallDefense")?.id] || 1;
    const gateLv = state.hideout[structures.find((s) => s.bonus === "arenaBonus")?.id] || 1;
    const pathLv = state.hideout[structures.find((s) => s.bonus === "pathSpeed")?.id] || 1;
    const landSum = zoneAvg("landscape");
    const sanctumSum = zoneAvg("sanctum");
    const title =
      state.player.faction === "moonborn"
        ? "Covil da Floresta Oculta"
        : "Solar Antigo da Noite";
    const coreName =
      state.player.faction === "moonborn" ? "Coração Totêmico" : "Núcleo Hemático";
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader(
      title,
      "Explore e evolua cada ala do seu domínio clássico: Residência, Muralha, Portão, Caminho, Paisagem e Santuário Lunar.",
      `<button type="button" class="btn btn-ghost btn-small" data-action="open-lunar">Ciclo Lunar: ${esc(lunar.name)}</button>`,
    )}
      <section class="hideout-main panel">
        <div class="hideout-main-visual" style="background-image:url('${scene.image}');--lunar-glow:${lunar.color}55">
          <div class="hideout-main-vignette"></div>
          <div class="hideout-lantern-glow" aria-hidden="true"></div>
          <div class="hideout-atmosphere" aria-hidden="true"><div class="hideout-mist"></div><div class="hideout-sparks"></div></div>
          ${hideoutHotspots(scene.stage, lunar)}
          <div class="hideout-main-copy">
            <span class="eyebrow">ESCONDERIJO PRINCIPAL • ESTÁGIO ${scene.stage}/6</span>
            <h2>${scene.title}</h2>
            <p>${scene.stage >= 6 ? "Seu domínio atingiu o auge arquitetônico." : `Faltam ${scene.upgradesToNext} pontos de construção para o próximo visual.`}</p>
          </div>
          <div class="hideout-main-stats">
            <div><small>Poder</small><b>${U.fmt(hideoutPower)}</b></div>
            <div><small>Progresso</small><b>${Math.round(scene.totalProgress * 100)}%</b></div>
            <div><small>Estágio</small><b>${scene.stage}/6</b></div>
          </div>
          <div class="hideout-main-progress"><span style="width:${Math.max(4, Math.round(scene.stageProgress * 100))}%"></span></div>
        </div>
        <div class="hideout-blueprint-strip" aria-label="Resumo arquitetônico do esconderijo">
          <button type="button" class="blueprint-pill" data-action="hideout-focus" data-zone="core"><small>Residência</small><strong>Núcleo Nv. ${coreLevel}</strong><span>+${coreTier * 2}% Vida/Dano</span></button>
          <button type="button" class="blueprint-pill ${hideoutZoneFilter === "wall" ? "active" : ""}" data-action="hideout-focus" data-zone="wall"><small>Muralha</small><strong>Muro Nv. ${wallLv}/5</strong><span>+${(wallLv - 1) * 4}% Armadura</span></button>
          <button type="button" class="blueprint-pill ${hideoutZoneFilter === "gate" ? "active" : ""}" data-action="hideout-focus" data-zone="gate"><small>Portão</small><strong>Portão Nv. ${gateLv}/5</strong><span>+${(gateLv - 1) * 2}% Evasão</span></button>
          <button type="button" class="blueprint-pill ${hideoutZoneFilter === "path" ? "active" : ""}" data-action="hideout-focus" data-zone="path"><small>Caminho</small><strong>Trilha Nv. ${pathLv}/5</strong><span>+${(pathLv - 1) * 6}% Energia</span></button>
          <button type="button" class="blueprint-pill ${hideoutZoneFilter === "landscape" ? "active" : ""}" data-action="hideout-focus" data-zone="landscape"><small>Paisagem</small><strong>Terreno ${landSum}/20</strong><span>Mochila &amp; Saque</span></button>
          <button type="button" class="blueprint-pill ${hideoutZoneFilter === "sanctum" ? "active" : ""}" data-action="hideout-focus" data-zone="sanctum"><small>Santuário</small><strong>Arcano ${sanctumSum}/10</strong><span>${esc(lunar.name)}</span></button>
        </div>
      </section>
      <section id="hideoutCorePanel" class="hideout-core panel"><div class="hideout-core-icon">${Icons.svg(state.player.faction)}</div><div class="hideout-core-copy"><span class="eyebrow">RESIDÊNCIA • NÚCLEO DO ESCONDERIJO</span><h3>${coreName} • Nível ${coreLevel}/${C.hideout.maxCoreLevel}</h3><p>O núcleo fortalece todos os combates: <strong>+${coreTier * 2}% de vida</strong>, <strong>+${(coreTier * 1.5).toFixed(1)}% de dano</strong> e <strong>+${(coreTier * 1.5).toFixed(1)}% de armadura</strong>.</p><div class="progress"><span style="width:${(coreLevel / C.hideout.maxCoreLevel) * 100}%"></span></div></div><div class="hideout-core-actions"><span class="pill">Poder ${U.fmt(hideoutPower)}</span><button class="btn btn-gold" data-action="upgrade-hideout-core" ${coreLevel >= C.hideout.maxCoreLevel || state.player.gold < coreCost ? "disabled" : ""}>${coreLevel >= C.hideout.maxCoreLevel ? "Nível máximo" : `Melhorar • ${U.fmt(coreCost)} ouro`}</button></div></section>
      <div class="hideout-filter-bar"><div class="hideout-filter-tabs">${["all", "wall", "gate", "path", "landscape", "sanctum"]
        .map((z) => {
          const count = z === "all" ? structures.length : structures.filter((s) => s.zone === z).length;
          return `<button type="button" class="tab ${hideoutZoneFilter === z ? "active" : ""}" data-action="hideout-zone" data-zone="${z}">${HIDEOUT_ZONE_LABELS[z]} (${count})</button>`;
        })
        .join("")}</div><span class="muted small">Clique diretamente na Residência, Muralha, Portão, Caminho, Paisagem ou Lua acima</span></div>
      <section id="hideoutStructuresPanel" class="hideout-structures"><div class="structure-grid">${filteredStructures
        .map((structure) => {
          const level = state.hideout[structure.id] || 1;
          const cost = C.hideout.cost(level);
          const nextText =
            level < C.hideout.maxStructureLevel
              ? hideoutEffectText(structure, level + 1)
              : "Estrutura concluída";
          return `<article class="structure-node"><div class="structure-topline"><div class="icon">${iconSvg(structure.icon)}</div><div><span class="structure-level">NÍVEL ${level}<span class="structure-zone-tag">${HIDEOUT_ZONE_LABELS[structure.zone] || "Domínio"}</span></span><h4>${esc(structure.name)}</h4></div></div><p>${esc(structure.description)}</p><div class="structure-meter"><span style="width:${Math.round((level / C.hideout.maxStructureLevel) * 100)}%"></span></div><div class="structure-effect"><small>ATUAL</small><strong>${hideoutEffectText(structure, level)}</strong></div><div class="structure-next"><small>PRÓXIMO</small><span>${nextText}</span></div><footer><span>Nv. ${level}/${C.hideout.maxStructureLevel}</span><button class="btn btn-small btn-primary" data-action="upgrade-hideout" data-id="${structure.id}" ${level >= C.hideout.maxStructureLevel || state.player.gold < cost ? "disabled" : ""}>${level >= C.hideout.maxStructureLevel ? "Máximo" : `${U.fmt(cost)} ouro`}</button></footer></article>`;
        })
        .join("")}</div></section>
      <section class="panel" style="margin-top:14px"><div class="panel-head"><h3>Resumo do esconderijo</h3><span class="pill">${scene.title}</span></div><div class="derived-grid"><div class="derived"><small>Nível do núcleo</small><b>${coreLevel}</b></div><div class="derived"><small>Níveis construídos</small><b>${totalStructureLevels}/${structures.length * C.hideout.maxStructureLevel}</b></div><div class="derived"><small>Poder total</small><b>${U.fmt(hideoutPower)}</b></div><div class="derived"><small>Próximo custo do núcleo</small><b>${coreLevel >= C.hideout.maxCoreLevel ? "MAX" : `${U.fmt(coreCost)} ouro`}</b></div></div></section></div>`;
  }

  function syncClanDaily() {
    if (!state?.clan) return;
    const today = U.dayKey();
    if (state.clan.lastBattleDay !== today) {
      state.clan.lastBattleDay = today;
      state.clan.dailyBattles = 0;
    }
  }

  function renderClan() {
    if (!state.clan) {
      dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Clã", "Funde um clã da sua linhagem, recrute companheiros de campanha e conquiste bônus passivos com a Fortaleza compartilhada.")}
      <section class="panel" style="max-width:700px;margin:auto"><h3>Fundar um Clã</h3><p class="muted">Escolha nome, emblema e lema. Cada nível de Fortaleza concede +2% Ouro/XP em vitórias e +1% Vida Máxima.</p><div class="field"><label for="clanName">Nome do clã</label><input id="clanName" name="clanName" maxlength="24" placeholder="Nomeie seu clã"></div><div class="field" style="margin-top:10px"><label for="clanMotto">Lema</label><input id="clanMotto" name="clanMotto" maxlength="60" placeholder="Uma promessa gravada na noite"></div><div class="field" style="margin-top:10px"><label for="clanEmblem">Emblema</label><select id="clanEmblem" name="clanEmblem"><option>◒</option><option>♦</option><option>♛</option><option>†</option><option>◆</option></select></div><button class="btn btn-primary" style="margin-top:14px" data-action="create-clan">Fundar Clã</button></section></div>`;
      return;
    }
    syncClanDaily();
    const c = state.clan;
    const maxMembers = Math.min(12, 3 + c.fortress);
    const nextFortThreshold = c.fortress * 600;
    const fortPct = Math.min(100, Math.round((c.donations / Math.max(1, nextFortThreshold)) * 100));
    const rivals = S ? S.computeClanRivals(state, D) : [];
    const remaining = Math.max(0, C.clan.dailyBattleLimit - (c.dailyBattles || 0));
    const canRecruit = c.members.length < maxMembers && state.player.gold >= C.clan.recruitGold;

    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader(`${esc(c.emblem)} ${esc(c.name)}`, esc(c.motto), `<button class="btn btn-ghost" data-action="invite-clan" ${canRecruit ? "" : "disabled"}>Recrutar (${c.members.length}/${maxMembers}) • ${C.clan.recruitGold} ◈</button>`)}
      <div class="grid grid-3"><section class="panel" style="grid-column:span 2"><div class="panel-head"><h3>Fortaleza do Clã</h3><span class="pill">Força ${U.fmt(c.strength)}</span></div><div class="action-banner"><div><h3>Fortaleza Nível ${c.fortress}/${C.clan.maxFortress}</h3><p>Bônus passivo ativo: <strong>+${c.fortress * 2}% Ouro/XP</strong> em combates e <strong>+${c.fortress}% Vida Máxima</strong>. Próximo nível em ${U.fmt(nextFortThreshold)} doados.</p><div class="progress" style="margin-top:8px"><span style="width:${fortPct}%"></span></div></div><div class="forge-row-actions"><button class="btn btn-gold" data-action="clan-donate" ${state.player.gold < 100 ? "disabled" : ""}>Doar 100 ◈</button><button class="btn btn-ghost" data-action="clan-donate-shard" ${state.player.shards < 1 ? "disabled" : ""}>Doar 1 ✦</button></div></div><div class="stat-strip" style="margin-top:12px"><div class="stat-tile"><small>Membros</small><b>${c.members.length + 1}/${maxMembers + 1}</b></div><div class="stat-tile"><small>Doações</small><b>${U.fmt(c.donations)}</b></div><div class="stat-tile"><small>Vitórias</small><b>${c.victories}</b></div><div class="stat-tile"><small>Rank do Clã</small><b>#${c.rank}</b></div></div></section>
      <section class="panel"><h3>Objetivos do Clã</h3><div class="list">${panelListItem("⚔", "Vencer batalhas de facção", `${Math.min(c.victories, 5)}/5`)}${panelListItem("◈", "Doar recursos ao cofre", `${Math.min(c.donations, 1000)}/1000`)}${panelListItem("▲", "Elevar força do clã", `${Math.min(c.strength, 5000)}/5000`)}</div><div class="small muted" style="margin-top:10px">Batalhas hoje: <strong>${c.dailyBattles || 0}/${C.clan.dailyBattleLimit}</strong>${remaining === 0 ? ` • Ataque extra custa ${C.clan.extraBattleShards} ✦` : ""}</div></section>
      <section class="panel" style="grid-column:1/-1"><div class="panel-head"><h3>Expedições &amp; Batalhas de Clã</h3><span class="pill">${remaining > 0 ? `${remaining} gratuitas hoje` : `Extra: ${C.clan.extraBattleShards} ✦`}</span></div><div class="clan-rival-grid">${rivals
        .map((r) => {
          const pct = Math.round(r.winChance * 100);
          const probCls = pct >= 60 ? "" : pct >= 42 ? "mid" : "hard";
          const disabled = remaining === 0 && state.player.shards < C.clan.extraBattleShards;
          return `<article class="clan-rival-card"><span class="eyebrow">${esc(r.label)}</span><h4>${esc(r.enemy)}</h4><div class="small muted">Força rival: ${U.fmt(r.enemyStrength)}</div><div class="win-prob ${probCls}">Chance de vitória: ${pct}%</div><div class="small muted">Prêmio: +${U.fmt(r.goldReward)} ◈ • +${r.strengthGain} Força • +1 Material</div><button type="button" class="btn btn-small btn-primary" data-action="clan-battle" data-tier="${r.tier}" ${disabled ? "disabled" : ""}>${remaining > 0 ? "Atacar" : `Atacar (${C.clan.extraBattleShards} ✦)`}</button></article>`;
        })
        .join("")}</div></section>
      <section class="panel" style="grid-column:span 2"><h3>Crônica do Clã</h3><div class="chat-log">${c.chat
        .slice(-10)
        .map(
          (m) =>
            `<div class="chat-message"><div class="chat-avatar">${iconSvg(m.icon)}</div><div class="chat-bubble"><h5>${esc(m.name)} <span class="muted">• Companheiro</span></h5><p>${esc(m.text)}</p></div></div>`,
        )
        .join("")}</div></section>
      <section class="panel"><h3>Membros</h3><div class="clan-members">${c.members.map((m) => `<article class="member-card"><h4>${esc(m.name)}</h4><p>Nv. ${m.level} ${esc(ptLabel(m.role))}<br>${esc(ptLabel(m.personality))} • Equip. ${m.gear}</p></article>`).join("") || '<p class="muted small">Recrute companheiros para fortalecer a fortaleza.</p>'}</div></section></div></div>`;
  }

  function bestiaryArtwork(e) {
    if (window.WB_ENEMY_ART && !window.WB_ENEMY_ART.shouldUseFactionPreset(e, {})) {
      return window.WB_ENEMY_ART.render(e, {});
    }
    const faction = e.type === "rival vampire" ? "bloodbound" : "moonborn";
    return characterSVG({ name: e.name, faction, appearance: Art.defaultAppearance(faction) }, "battle");
  }

  function renderBestiary() {
    const all = [
      ...D.enemies,
      ...D.bosses.map((b, i) => ({
        ...b,
        id: b.id,
        boss: true,
        region: i,
        behavior: "boss",
        weaknesses: b.weaknesses || ["Heavy attacks"],
        resistances: b.resistances || ["Control"],
        abilities: [b.signature],
        drops: [b.exclusive],
      })),
    ];
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Bestiário e Códice", "Criaturas derrotadas revelam fraquezas e resistências ativas em combate, habilidades, recompensas e histórias do Eclipse Oco.")}
      <section class="bestiary-grid">${all
        .map((e) => {
          const known = (state.bestiary[e.id]?.defeated || 0) > 0;
          return `<article class="bestiary-card ${known ? "" : "unknown"} ${e.boss ? "is-boss" : ""}" data-action="bestiary-detail" data-id="${e.id}"><div class="beast-art">${bestiaryArtwork(e)}</div><h4>${known ? esc(e.name) : e.boss ? "Chefe desconhecido" : "Entidade desconhecida"}</h4><p>${known ? `${U.title(e.type)} • ${D.regions[e.region]?.name || "A Fenda Ancestral"} • Derrotados ${state.bestiary[e.id].defeated}` : "Derrote esta criatura para revelar seu registro."}</p></article>`;
        })
        .join("")}</section></div>`;
  }

  function renderAchievements() {
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Achievements", "Fifty-four achievements reward combat, exploration, collection, progression, Arena, story, clan, secrets and faction mastery.")}
      <section class="achievement-grid">${D.achievements
        .map((a) => {
          const unlocked = !!state.achievements[a.id],
            progress = Math.min(state.metrics[a.metric] || 0, a.goal);
          return `<article class="achievement ${unlocked ? "" : "locked"}"><div class="ach-icon">${iconSvg(a.icon)}</div><h4>${esc(a.title)}</h4><p>${esc(a.description)}</p><div class="progress"><span style="width:${(progress / a.goal) * 100}%"></span></div><div class="small muted" style="margin-top:6px">${progress}/${a.goal} • ${a.rewards.gold} ouro${a.rewards.shards ? ` • ${a.rewards.shards} fragmentos` : ""}</div></article>`;
        })
        .join("")}</section></div>`;
  }

  function generatedRanking(type) {
    if (!state.worldRanking?.roster?.length && S) {
      state.worldRanking = S.createPersistentRanking(D, U);
    }
    if (S && state.worldRanking) {
      S.advancePersistentRanking(state.worldRanking, U);
    }
    const field =
      {
        level: "level",
        arena: "rating",
        bosses: "bosses",
        wealth: "wealth",
        achievements: "achievementPoints",
        clan: "clanStrength",
        faction: "factionContribution",
      }[type] || "level";

    const rows = (state.worldRanking?.roster || []).map((r) => ({
      id: r.id,
      name: r.name,
      clan: r.clan,
      faction: r.faction,
      value: r[field] || 0,
      prevRank: r.prevRank?.[type] || null,
    }));

    const factionContribution =
      state.metrics.kills * 15 +
      state.metrics.arenaWins * 45 +
      state.metrics.bosses * 140 +
      state.metrics.storyChapters * 220;

    const playerValue =
      type === "level"
        ? state.player.level
        : type === "arena"
          ? state.arena.rating
          : type === "bosses"
            ? state.metrics.bosses
            : type === "wealth"
              ? state.player.gold
              : type === "achievements"
                ? Object.keys(state.achievements).length * 100
                : type === "clan"
                  ? state.clan?.strength || 0
                  : factionContribution;

    const prevPlayerRank = state.worldRanking?.playerPrevRank?.[type] || null;
    rows.push({
      id: "player",
      name: state.player.name,
      clan: state.clan?.name || "Sem clã",
      faction: state.player.faction,
      value: playerValue,
      player: true,
      prevRank: prevPlayerRank,
    });
    rows.sort((a, b) => b.value - a.value || (b.player ? 1 : 0) - (a.player ? 1 : 0));

    // Persist current ranks for next trend comparison
    if (state.worldRanking) {
      state.worldRanking.playerPrevRank = state.worldRanking.playerPrevRank || {};
      rows.forEach((row, idx) => {
        const rank = idx + 1;
        row.rank = rank;
        row.delta = row.prevRank ? row.prevRank - rank : 0;
        if (row.player) {
          state.worldRanking.playerPrevRank[type] = rank;
          if (type === "level") state.player.rank = rank;
        } else {
          const ref = state.worldRanking.roster.find((x) => x.id === row.id);
          if (ref) {
            ref.prevRank = ref.prevRank || {};
            ref.prevRank[type] = rank;
          }
        }
      });
    }
    return rows;
  }
  function renderRanking() {
    const tabs = [
      ["level", "Nível"],
      ["arena", "Arena"],
      ["bosses", "Chefes"],
      ["wealth", "Riqueza"],
      ["achievements", "Conquistas"],
      ["clan", "Clãs"],
      ["faction", "Facção"],
    ];
    const rows = generatedRanking(rankingType);
    const playerRow = rows.find((r) => r.player);
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Ranking Persistente", "Os 36 rivais da crônica persistem no seu salvamento e evoluem a cada dia. Acompanhe sua subida em cada categoria.", playerRow ? `<span class="pill">Sua posição: #${playerRow.rank}</span>` : "")}
      <div class="ranking-tabs">${tabs.map(([t, label]) => `<button class="tab ${rankingType === t ? "active" : ""}" data-action="ranking-type" data-type="${t}">${label}</button>`).join("")}</div><section class="panel">${rows
        .map((r, i) => {
          const trendHtml =
            r.delta > 0
              ? `<span class="rank-trend up">▲ +${r.delta}</span>`
              : r.delta < 0
                ? `<span class="rank-trend down">▼ ${r.delta}</span>`
                : `<span class="rank-trend flat">—</span>`;
          return `<div class="ranking-row ${r.player ? "player" : ""}"><div class="rank-number">#${i + 1}${trendHtml}</div><div class="rank-name"><strong>${esc(r.name)}</strong><small>${esc(r.clan)} • ${D.factions[r.faction].name}</small></div><div>${r.player ? '<span class="pill">VOCÊ</span>' : ""}</div><div class="rank-value"><b>${U.fmt(r.value)}</b></div></div>`;
        })
        .join("")}</section></div>`;
  }

  function renderMessages() {
    if (!state.messages.length)
      state.messages = [
        {
          from: "The Bellkeeper",
          icon: "♩",
          subject: "The first bell",
          body: "You heard it too. Come to Blackthorn before the rain forgets your scent.",
          date: Date.now(),
        },
        {
          from: "Faction Quartermaster",
          icon: D.factions[state.player.faction].emblem,
          subject: "Your bloodline kit",
          body: "The first weapon is not a gift. It is a promise that you will return it sharpened.",
          date: Date.now() - 3600000,
        },
      ];
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Messages", "Story contacts, faction allies and rival characters send authored messages as the campaign evolves.")}
      <div class="grid grid-2"><section class="panel"><h3>Inbox</h3><div class="list">${state.messages.map((m, i) => panelListItem(m.icon, esc(m.subject), `${esc(m.from)} • ${new Date(m.date).toLocaleDateString("pt-BR")}`, `<button class="btn btn-small btn-ghost" data-action="read-message" data-index="${i}">Read</button>`)).join("")}</div></section><section class="panel"><h3>Night Dispatch</h3><p class="muted">Messages unlock through story chapters, boss victories, Arena revenge opportunities and clan activity.</p>${panelListItem("✉", "Unread omens", String(state.messages.length), '<span class="pill">INBOX</span>')}</section></div></div>`;
  }

  function renderSettings() {
    const s = state.settings;
    const toggle = (
      key,
      label,
      desc = "Show contextual guidance during play",
    ) =>
      `<div class="setting-row"><div><span class="setting-label">${label}</span><small>${desc}</small></div><button type="button" class="toggle ${s[key] ? "on" : ""}" data-action="toggle-setting" data-key="${key}" aria-label="${label}" aria-pressed="${s[key]}"><span></span></button></div>`;
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Settings", "Tune audio, animation, accessibility, combat behavior and local save management.")}
      <div class="settings-grid"><div class="setting-row"><div><label for="musicVolumeRange">Music volume</label><small>Generated ambient night layer</small></div><input id="musicVolumeRange" name="musicVolume" type="range" min="0" max="1" step=".01" value="${s.musicVolume}" data-setting-range="musicVolume"></div><div class="setting-row"><div><label for="sfxVolumeRange">Sound effects</label><small>Combat and interface cues</small></div><input id="sfxVolumeRange" name="sfxVolume" type="range" min="0" max="1" step=".01" value="${s.sfxVolume}" data-setting-range="sfxVolume"></div>${toggle("mute", "Mute", "Silence all generated audio")}${toggle("reducedMotion", "Reduced motion", "Minimize parallax and animation")}${toggle("screenShake", "Screen shake", "Impact feedback during critical hits")}${toggle("damageNumbers", "Damage numbers", "Show floating combat values")}${toggle("autoBattle", "Auto-battle default", "Begin combat in automatic mode")}${toggle("skipAnimations", "Skip combat animation", "Resolve actions immediately")}${toggle("highContrast", "High contrast", "Strengthen borders and text contrast")}${toggle("autoSave", "Automatic saving", "Save the chronicle every few seconds")}${toggle("tutorials", "Tutorial guidance")}</div>
      <section class="panel" style="margin-top:14px"><div class="panel-head"><h3><label for="textSizeRange">Text Size</label></h3><span>${Math.round(s.textSize * 100)}%</span></div><input id="textSizeRange" name="textSize" style="width:100%" type="range" min=".9" max="1.25" step=".05" value="${s.textSize}" data-setting-range="textSize"></section>
      <section class="panel" style="margin-top:14px"><h3>Chronicle Management</h3><div class="header-actions" style="justify-content:flex-start"><button class="btn btn-ghost" data-action="save-slots">Save Slots</button><button class="btn btn-ghost" data-action="export-save">Export JSON</button><button class="btn btn-ghost" data-action="import-save">Import JSON</button><button class="btn btn-ghost" data-action="fullscreen">Fullscreen</button><button class="btn btn-danger" data-action="reset-game">Reset Game</button></div></section></div>`;
  }

  function handleViewInput(e) {
    if (e.target.matches("[data-appearance-key]")) {
      state.player.appearance[e.target.dataset.appearanceKey] = e.target.value;
      state.player.appearance = Art.normalizeAppearance(
        state.player.appearance,
        state.player.faction,
      );
      const portrait = $("#studioPortrait"),
        summary = $("#studioAppearanceSummary");
      if (portrait) portrait.innerHTML = characterSVG(state.player, "full");
      if (summary) summary.textContent = Art.describe(state.player);
      renderSidebar();
      saveGame(false);
      return;
    }
    if (e.target.id === "inventorySearch") {
      inventoryFilter.search = e.target.value;
      renderInventory();
    }
    if (e.target.id === "inventoryRarity") {
      inventoryFilter.rarity = e.target.value;
      renderInventory();
    }
    if (e.target.id === "inventorySlot") {
      inventoryFilter.slot = e.target.value;
      renderInventory();
    }
    if (e.target.matches("[data-setting-range]")) {
      const key = e.target.dataset.settingRange;
      state.settings[key] = Number(e.target.value);
      applySettings();
      if (key === "musicVolume") restartAmbience();
      saveGame(false);
      if (currentView === "settings" && key === "textSize") renderSettings();
    }
  }

  function handleViewClick(e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const a = el.dataset.action;
    sfx("click");
    const go = {
      "go-hunt": "hunt",
      "go-missions": "missions",
      "go-merchant": "merchant",
      "go-arena": "arena",
    };
    if (go[a]) return navigate(go[a]);
    if (a === "daily") return openDaily();
    if (a === "select-region") {
      selectedRegion = Number(el.dataset.region);
      return renderHunt();
    }
    if (a === "start-hunt")
      return startHunt(
        el.dataset.type,
        Number(el.dataset.reward),
        Number(el.dataset.risk),
      );
    if (a === "upgrade-attr")
      return requestAttributeUpgrade(
        el.dataset.attr,
        Number(el.dataset.amount),
      );
    if (a === "toggle-ability") return toggleAbility(el.dataset.id);
    if (a === "studio-appearance") {
      const key = el.dataset.key;
      const val = el.dataset.value;
      if (key) {
        state.player.appearance[key] = val;
        state.player.appearance = Art.normalizeAppearance(
          state.player.appearance,
          state.player.faction,
        );
        renderCharacter();
        renderSidebar();
        saveGame(false);
      }
      return;
    }
    if (a === "randomize-appearance") {
      state.player.appearance = Art.randomAppearance(state.player.faction);
      renderCharacter();
      renderSidebar();
      saveGame();
      toast("A new silhouette answers the night.", "success");
      return;
    }
    if (a === "reset-appearance") {
      state.player.appearance = Art.defaultAppearance(state.player.faction);
      renderCharacter();
      renderSidebar();
      saveGame();
      toast("Bloodline regalia restored.", "success");
      return;
    }
    if (a === "refresh-arena") {
      if (state.player.gold < C.arena.refreshCost)
        return toast("Not enough gold.", "error");
      state.player.gold -= C.arena.refreshCost;
      refreshArenaOpponents(true);
      renderArena();
      updateTopbar();
      return;
    }
    if (a === "fight-rival") return startArenaFight(el.dataset.id);
    if (a === "mission-filter") {
      missionFilter = el.dataset.filter;
      return renderMissions();
    }
    if (a === "accept-mission") {
      const m = state.missions.find((x) => x.id === el.dataset.id);
      if (!m) return;
      const mission = getMissionData(m);
      const protectedCategories = ["tutorial", "story", "daily"];
      if (!protectedCategories.includes(mission?.category)) {
        const capacity = 3 + hideoutBonus("missionSlots");
        const active = state.missions
          .map(getMissionData)
          .filter((entry) => entry && entry.accepted && !entry.claimed && !protectedCategories.includes(entry.category)).length;
        if (active >= capacity)
          return toast(`Capacidade de missões atingida (${active}/${capacity}). Melhore a Mesa de Guerra.`, "error");
      }
      m.accepted = true;
      renderMissions();
      saveGame();
      return;
    }
    if (a === "claim-mission") return claimMission(el.dataset.id);
    if (a === "inventory-mode") {
      inventoryMode = inventoryMode === "grid" ? "list" : "grid";
      return renderInventory();
    }
    if (a === "batch-sell-common") {
      const sellable = batchEligibleItems(["common"]);
      if (!sellable.length)
        return toast("Nenhum item comum elegível para venda.", "error");
      const ids = new Set(sellable.map((i) => i.id));
      const totalGold = sellable.reduce((sum, i) => sum + (i.value || 10), 0);
      state.player.inventory = state.player.inventory.filter(
        (i) => !ids.has(i.id),
      );
      state.player.gold += totalGold;
      state.merchant.buyback.push(...sellable.slice(-6));
      state.merchant.buyback = state.merchant.buyback.slice(-12);
      updateTopbar();
      renderInventory();
      sfx("level");
      toast(
        `${sellable.length} ${sellable.length === 1 ? "item comum vendido" : "itens comuns vendidos"} por ${U.fmt(totalGold)} ouro.`,
        "success",
      );
      saveGame();
      return;
    }
    if (a === "batch-dismantle") {
      const eligible = batchEligibleItems(["common", "uncommon"]);
      if (!eligible.length)
        return toast("Nenhum item elegível para desmontar.", "error");
      const ids = new Set(eligible.map((i) => i.id));
      const lunarBonus = currentLunar().bonuses?.dismantleBonus || 0;
      let totalMats = 0;
      eligible.forEach((it) => {
        const mats = U.rand(1, 3) + (lunarBonus > 0 && U.chance(lunarBonus) ? 1 : 0);
        totalMats += mats;
        const pool = S ? S.dismantleMaterialPool(it.rarity) : D.materials.slice(0, 6);
        for (let j = 0; j < mats; j++) {
          const m = U.pick(pool);
          state.player.materials[m] = (state.player.materials[m] || 0) + 1;
        }
      });
      state.player.inventory = state.player.inventory.filter(
        (i) => !ids.has(i.id),
      );
      state.metrics.dismantles = (state.metrics.dismantles || 0) + eligible.length;
      syncMissionProgress();
      checkAchievements();
      renderInventory();
      sfx("level");
      toast(
        `${eligible.length} ${eligible.length === 1 ? "item desmontado" : "itens desmontados"} em ${totalMats} materiais.`,
        "success",
      );
      saveGame();
      return;
    }
    if (a === "open-lunar") return openLunarModal();
    if (a === "refill-energy") return refillEnergyWithShard();
    if (a === "refresh-merchant-shards") return refreshMerchantWithShard();
    if (a === "item-detail") return openItemDetail(el.dataset.id);
    if (a === "slot-detail") {
      const item = state.player.equipment[el.dataset.slot];
      if (item) return openItemDetail(item.id, true);
      return;
    }
    if (a === "merchant-type") {
      merchantType = el.dataset.type;
      return renderMerchant();
    }
    if (a === "merchant-item") return openMerchantItem(el.dataset.id);
    if (a === "buyback") return buybackItem(el.dataset.id);
    if (a === "hideout-focus") {
      const zone = el.dataset.zone;
      if (zone === "core") {
        const panel = $("#hideoutCorePanel");
        if (panel) {
          panel.scrollIntoView({ behavior: "smooth", block: "center" });
          panel.classList.remove("is-spotlight");
          void panel.offsetWidth;
          panel.classList.add("is-spotlight");
          setTimeout(() => panel.classList.remove("is-spotlight"), 1900);
        }
        toast("Residência e Núcleo em foco.", "info");
      } else if (["wall", "gate", "path", "landscape", "sanctum"].includes(zone)) {
        hideoutZoneFilter = zone;
        renderHideout();
        const panel = $("#hideoutStructuresPanel");
        if (panel) {
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
          panel.classList.remove("is-spotlight");
          void panel.offsetWidth;
          panel.classList.add("is-spotlight");
          setTimeout(() => panel.classList.remove("is-spotlight"), 1900);
        }
        toast(`Ala de ${HIDEOUT_ZONE_LABELS[zone] || zone} em foco.`, "info");
      }
      return;
    }
    if (a === "hideout-zone") {
      hideoutZoneFilter = el.dataset.zone || "all";
      return renderHideout();
    }
    if (a === "upgrade-hideout") return upgradeHideout(el.dataset.id);
    if (a === "upgrade-hideout-core") return upgradeHideoutCore();
    if (a === "create-clan") return createClan();
    if (a === "invite-clan") return inviteClanMember();
    if (a === "clan-donate") return clanDonate();
    if (a === "clan-donate-shard") return clanDonateShard();
    if (a === "clan-battle") return clanBattle(el.dataset.tier || "skirmish");
    if (a === "bestiary-detail") return openBestiary(el.dataset.id);
    if (a === "ranking-type") {
      rankingType = el.dataset.type;
      return renderRanking();
    }
    if (a === "read-message") return readMessage(Number(el.dataset.index));
    if (a === "toggle-setting") {
      state.settings[el.dataset.key] = !state.settings[el.dataset.key];
      applySettings();
      renderSettings();
      saveGame();
      return;
    }
    if (a === "save-slots") return openSaveSlots();
    if (a === "export-save") return exportSave();
    if (a === "import-save") return $("#saveImportInput").click();
    if (a === "fullscreen") return toggleFullscreen();
    if (a === "reset-game") return confirmReset();
    if (a === "open-forge") return openForge();
    if (a === "open-alchemy") return openAlchemy();
    if (a === "start-story") return startStory(Number(el.dataset.chapter));
  }

  function requestAttributeUpgrade(attr, amount) {
    if (amount < 1) return;
    const cost = attributeCost(attr, amount);
    if (state.player.gold < cost) return toast("Not enough gold.", "error");
    const doUpgrade = () => {
      state.player.gold -= cost;
      state.player.attributes[attr] += amount;
      state.metrics.attributeUpgrades += amount;
      syncMissionProgress();
      checkAchievements();
      syncHealth();
      updateTopbar();
      renderCharacter();
      renderSidebar();
      sfx("level");
      toast(`${U.title(attr)} increased by ${amount}.`, "success");
      saveGame();
    };
    if (cost >= 1000)
      openModal({
        title: "Confirm Training",
        body: `<p>Spend <strong>${U.fmt(cost)} gold</strong> to increase <strong>${U.title(attr)}</strong> by ${amount}?</p>`,
        actions: [
          { label: "Cancelar", class: "btn-ghost", action: "close" },
          {
            label: "Train",
            class: "btn-primary",
            action: "upgrade-confirm",
            payload: `${attr}|${amount}|${cost}`,
          },
        ],
      });
    else doUpgrade();
  }

  function toggleAbility(id) {
    const arr = state.player.equippedAbilities;
    const idx = arr.indexOf(id);
    if (idx >= 0) arr.splice(idx, 1);
    else if (arr.length < 4) arr.push(id);
    else return toast("Unequip an ability first.", "error");
    renderCharacter();
    saveGame();
  }

  function startHunt(type, rewardMult, risk) {
    const cost = C.energy.huntCosts[type];
    if (state.player.energy < cost)
      return toast("Not enough Hunt Energy.", "error");
    const region = D.regions[selectedRegion];
    if (state.player.level < region.level)
      return toast("This region is still locked.", "error");
    state.player.energy -= cost;
    state.player.lastEnergyAt = Date.now();
    updateMetricMissions("hunts", 1);
    updateTopbar();
    const secretChance =
      0.06 +
      derived().luck * 0.002 +
      (type === "treasure" ? 0.16 : 0) +
      (currentLunar().bonuses?.secretBonus || 0);
    if (U.chance(secretChance) && !state.story.flags[`secret_${region.id}`]) {
      state.story.flags[`secret_${region.id}`] = true;
      state.metrics.secrets++;
      toast(`Secret discovered: ${region.secret}`, "achievement");
      checkAchievements();
    }
    const eventChance =
      type === "careful" ? 0.78 : type === "treasure" ? 0.88 : 0.54;
    if (U.chance(eventChance)) {
      const event = U.pick(D.events);
      openHuntEvent(event, { type, rewardMult, risk, region: selectedRegion });
    } else beginHuntCombat({ type, rewardMult, risk, region: selectedRegion });
    saveGame();
  }

  function openHuntEvent(event, context) {
    dom.eventOverlay.dataset.event = event.id;
    dom.eventOverlay.dataset.context = encodeURIComponent(
      JSON.stringify(context),
    );
    dom.eventOverlay.classList.add("active");
    dom.eventOverlay.setAttribute("aria-hidden", "false");
    const region = D.regions[context.region] || D.regions[0];
    const artHtml = window.WB_WORLD_MAP
      ? window.WB_WORLD_MAP.eventArtwork(event, region)
      : `<div class="event-icon">${iconSvg(event.icon)}</div>`;
    dom.eventOverlay.innerHTML = `<div class="event-shell glass-panel"><div class="event-art" style="--event-a:${region.colors[0]};--event-b:${region.colors[1]}">${artHtml}</div><div class="event-content"><span class="eyebrow">EVENTO DE CAÇADA • ${esc(region.name.toUpperCase())}</span><h2>${esc(event.title)}</h2><p>${esc(event.description)}</p><div class="event-choices">${event.choices.map((c, i) => `<button class="event-choice" data-action="event-choice" data-index="${i}"><strong>${esc(c.text)}</strong><small>${esc(c.hint)}</small></button>`).join("")}</div></div></div>`;
  }
  function closeEvent() {
    dom.eventOverlay.classList.remove("active");
    dom.eventOverlay.setAttribute("aria-hidden", "true");
    dom.eventOverlay.innerHTML = "";
  }
  function handleEventClick(e) {
    const btn = e.target.closest('[data-action="event-choice"]');
    if (!btn) return;
    const event = D.events.find((x) => x.id === dom.eventOverlay.dataset.event),
      choice = event.choices[Number(btn.dataset.index)],
      context = JSON.parse(
        decodeURIComponent(dom.eventOverlay.dataset.context),
      );
    applyEventEffects(choice.effects);
    state.story.flags[choice.flag] = true;
    closeEvent();
    toast(`${event.title}: ${choice.text}`, "success");
    if (U.chance(context.type === "treasure" ? 0.22 : 0.72))
      beginHuntCombat(context);
    else finishNonCombatHunt(context);
  }
  function applyEventEffects(effects) {
    Object.entries(effects).forEach(([k, v]) => {
      if (k === "health")
        state.player.health = U.clamp(
          state.player.health + v,
          1,
          derived().maxHealth,
        );
      else if (k === "resource")
        state.player.resource = U.clamp(state.player.resource + v, 0, 100);
      else if (k in state.player) state.player[k] += v;
    });
    updateTopbar();
  }
  function finishNonCombatHunt(context) {
    const gold = Math.floor((25 + selectedRegion * 12) * context.rewardMult),
      xp = Math.floor((20 + selectedRegion * 8) * context.rewardMult);
    grantRewards({ gold, xp, materials: 1 });
    showLootModal({
      gold,
      xp,
      items: [],
      materials: 1,
      title: "Hunt Complete",
    });
  }
  function beginHuntCombat(context) {
    const region = context.region;
    let enemy;
    const bossChance =
      context.type === "monster"
        ? state.story.completed.includes(region + 1)
          ? 0.08
          : 0.24
        : context.type === "dangerous"
          ? 0.07
          : 0;
    if (U.chance(bossChance)) {
      enemy = {
        ...D.bosses[region],
        level: Math.max(D.regions[region].level, state.player.level),
        boss: true,
      };
    } else {
      const pool = D.enemies.filter((e) => Math.abs(e.region - region) <= 1);
      enemy = {
        ...U.pick(pool.length ? pool : D.enemies),
        level: U.clamp(D.regions[region].level + U.rand(-1, 3), 1, 40),
      };
    }
    startCombat(enemy, { source: "hunt", ...context });
  }

  function enemyCombatStats(enemy, context = {}) {
    const level = enemy.level || 1,
      diff = (enemy.boss ? 1.5 : 1) * (1 + (enemy.region || 0) * 0.025);
    const behavior = enemy.behavior || "balanced";
    const faction = resolveEnemyFaction(enemy, context);
    return {
      name: enemy.name,
      id: enemy.id,
      icon: enemy.icon,
      faction,
      level,
      maxHealth: Math.floor((75 + level * 19) * (enemy.boss ? 2.35 : 1) * diff),
      health: 0,
      minDamage: Math.floor((7 + level * 2.15) * diff),
      maxDamage: Math.floor((13 + level * 3.05) * diff),
      armor: Math.floor(
        (4 + level * 1.35) * (behavior === "defensive" ? 1.35 : 1),
      ),
      accuracy: behavior === "fast" ? 0.92 : 0.82 + level * 0.002,
      evasion:
        behavior === "fast" || behavior === "dodge"
          ? 0.19
          : 0.06 + level * 0.002,
      critChance: behavior === "berserk" ? 0.18 : 0.08,
      critDamage: 1.6,
      blockChance:
        behavior === "shield" || behavior === "defensive" ? 0.2 : 0.06,
      initiative: level * 2 + (behavior === "fast" ? 30 : 8),
      regeneration: behavior === "healer" ? Math.max(2, level * 0.4) : 0,
      resource: 0,
      statuses: [],
      cooldowns: {},
      behavior,
      boss: !!enemy.boss,
      phase: 1,
      sourceData: enemy,
    };
  }
  function playerCombatStats() {
    const d = derived();
    return {
      name: state.player.name,
      id: "player",
      faction: state.player.faction,
      level: state.player.level,
      maxHealth: d.maxHealth,
      health: state.player.health,
      minDamage: d.minDamage,
      maxDamage: d.maxDamage,
      armor: d.armor,
      accuracy: d.accuracy,
      evasion: d.evasion,
      critChance: d.critChance,
      critDamage: d.critDamage,
      blockChance: d.blockChance,
      initiative: d.initiative,
      regeneration: d.regeneration,
      lifesteal: d.lifesteal || 0,
      weaknessBonus: d.weaknessBonus || 0,
      burnProc: d.burnProc || 0,
      resource: state.player.resource,
      statuses: [],
      cooldowns: {},
      defending: false,
      transformed: 0,
    };
  }
  function startCombat(enemy, context = {}) {
    const p = playerCombatStats(),
      e = enemyCombatStats(enemy, context);
    const buffPercent = U.rand(
      C.combat.enemyBuffMinPercent || 10,
      C.combat.enemyBuffMaxPercent || 100,
    );
    const buffMultiplier = 1 + buffPercent / 100;
    e.maxHealth = Math.max(1, Math.floor(e.maxHealth * buffMultiplier));
    e.minDamage = Math.max(1, Math.floor(e.minDamage * buffMultiplier));
    e.maxDamage = Math.max(e.minDamage, Math.floor(e.maxDamage * buffMultiplier));
    e.armor = Math.max(0, Math.floor(e.armor * buffMultiplier));
    e.health = e.maxHealth;
    e.buffPercent = buffPercent;
    e.rewardMultiplier = buffMultiplier;
    e.visual = createEnemyVisual(enemy, context, e.faction);
    combat = {
      player: p,
      enemy: e,
      context,
      turn: 0,
      log: [],
      auto: !!state.settings.autoBattle,
      revealedWeaknesses: new Set(),
      revealedResistances: new Set(),
      speed: state.settings.combatSpeed || 1,
      ended: false,
      canFlee: !enemy.boss,
      turnOrder: [],
      lastAction: null,
    };
    dom.combatOverlay.classList.add("active");
    dom.combatOverlay.setAttribute("aria-hidden", "false");
    renderCombat();
    logCombat(`<b>${esc(enemy.name)}</b> emerges from the night.`);
    logCombat(`<span class="danger-text"><b>Buff inimigo +${buffPercent}%</b></span> — vida, dano e armadura aumentados.`);
    logCombat(`<span class="success-text"><b>Recompensa de risco +${buffPercent}%</b></span> — XP, ouro, materiais e chance de saque aumentados em caso de vitória.`);
    setTimeout(() => combatStartTurn(), 300);
  }
  function battleSceneConfig(context = {}) {
    const isArena = context.source === "arena";
    const region =
      typeof context.region === "number"
        ? D.regions[context.region]
        : D.regions[selectedRegion] || D.regions[0];
    if (window.WB_BATTLE_SCENES) {
      const data = window.WB_BATTLE_SCENES.get(
        region?.id || "blackthorn",
        isArena,
        region?.colors,
      );
      return {
        title: isArena ? "Arena" : region?.name || "Caçada",
        style: data.style,
        svg: data.svg,
        weather: data.weather || "mist",
      };
    }
    const colors = region?.colors || ["#35435e", "#11141c", "#12161c"];
    return {
      title: isArena ? "Arena" : region?.name || "Caçada",
      style: `linear-gradient(180deg, ${colors[0]}, ${colors[1]} 60%, ${colors[2]})`,
      svg: "",
      weather: "mist",
    };
  }

  function combatBehaviorLabel(behavior, isBoss) {
    if (isBoss) return "Chefe Regional";
    const map = {
      balanced: "Equilibrado",
      defensive: "Defensivo",
      bleed: "Sangrador",
      shield: "Protegido",
      fast: "Veloz",
      berserk: "Furioso",
      poison: "Venenoso",
      healer: "Curandeiro",
      weaken: "Debilitador",
      burn: "Incendiário",
      counter: "Contra-atacante",
      control: "Controlador",
      summoner: "Invocador",
      dodge: "Evasivo",
    };
    return map[behavior] || "Hostil";
  }

  function buildAbilityButtonsHTML() {
    if (!combat) return "";
    const p = combat.player;
    const f = D.factions[state.player.faction];
    const abilities = state.player.equippedAbilities
      .map((id) => D.abilities.find((a) => a.id === id))
      .filter(Boolean);
    return `<button class="ability-btn" data-combat="action" data-action-id="basic"><strong>${Icons.svg("sword")}Ataque básico</strong><small>Golpe confiável • sem custo</small></button><button class="ability-btn" data-combat="action" data-action-id="heavy"><strong>${Icons.svg("heavy")}Ataque pesado</strong><small>Dano alto • precisão reduzida</small></button><button class="ability-btn" data-combat="action" data-action-id="defend"><strong>${Icons.svg("shield")}Postura defensiva</strong><small>Armadura e bloqueio até o próximo turno</small></button><button class="ability-btn" data-combat="action" data-action-id="faction"><strong>${Icons.svg(state.player.faction)}${p.resource >= 100 ? ptLabel(f.form) : "Poder da facção"}</strong><small>${p.resource >= 100 ? "Transforme-se com o recurso no máximo" : "Obtenha poder tático da linhagem"}</small></button>${abilities.map((a) => `<button class="ability-btn" data-combat="action" data-action-id="ability:${a.id}" ${p.resource < a.cost || p.cooldowns[a.id] > 0 ? "disabled" : ""}><strong>${iconSvg(a.icon)}${esc(a.name)}</strong><small>${a.cost} ${ptLabel(f.resource)} • ${p.cooldowns[a.id] ? `REC ${p.cooldowns[a.id]}` : a.description}</small></button>`).join("")}<button class="ability-btn" data-combat="item"><strong>${Icons.svg("potion")}Item</strong><small>Use um consumível restaurador</small></button><button class="ability-btn" data-combat="flee" ${combat.canFlee ? "" : "disabled"}><strong>${Icons.svg("retreat")}Recuar</strong><small>${combat.canFlee ? "Tentar escapar" : "Não é possível fugir deste encontro"}</small></button>`;
  }

  function syncFighterAuras() {
    if (!combat) return;
    const auraStatuses = ["bleeding", "poisoned", "burning", "shielded", "enraged", "cursed", "stunned"];
    [
      ["#fighterPlayer", combat.player],
      ["#fighterEnemy", combat.enemy],
    ].forEach(([sel, unit]) => {
      const el = $(sel, dom.combatOverlay);
      if (!el || !unit) return;
      auraStatuses.forEach((st) => el.classList.toggle(`has-${st}`, hasStatus(unit, st)));
      el.classList.toggle("is-transformed", (unit.transformed || 0) > 0);
    });
    const field = $(".battlefield", dom.combatOverlay);
    if (field) {
      field.classList.toggle("low-hp", combat.player.health / combat.player.maxHealth < 0.28);
      field.classList.toggle("boss-phase-2", !!(combat.enemy.boss && combat.enemy.phase === 2));
      field.classList.toggle("boss-phase-3", !!(combat.enemy.boss && combat.enemy.phase >= 3));
    }
  }

  function updateCombatHUD() {
    if (!combat) return;
    const p = combat.player,
      e = combat.enemy,
      f = D.factions[state.player.faction];
    const pPct = U.clamp((p.health / Math.max(1, p.maxHealth)) * 100, 0, 100);
    const ePct = U.clamp((e.health / Math.max(1, e.maxHealth)) * 100, 0, 100);
    const rPct = U.clamp(p.resource, 0, 100);

    const pFill = $("#playerHpFill", dom.combatOverlay);
    const pTrail = $("#playerHpTrail", dom.combatOverlay);
    const pText = $("#playerHpText", dom.combatOverlay);
    if (pFill) pFill.style.width = `${pPct}%`;
    if (pTrail) pTrail.style.width = `${pPct}%`;
    if (pText) pText.textContent = `${Math.ceil(p.health)}/${p.maxHealth} PV`;

    const rFill = $("#playerResFill", dom.combatOverlay);
    const rText = $("#playerResText", dom.combatOverlay);
    if (rFill) rFill.style.width = `${rPct}%`;
    if (rText) rText.textContent = `${Math.floor(p.resource)}/100 ${ptLabel(f.resource)}`;

    const eTitle = $("#enemyTitle", dom.combatOverlay);
    const eFill = $("#enemyHpFill", dom.combatOverlay);
    const eTrail = $("#enemyHpTrail", dom.combatOverlay);
    const eText = $("#enemyHpText", dom.combatOverlay);
    if (eTitle) eTitle.textContent = `${e.name}${e.boss ? ` • Fase ${e.phase}/3` : ""}`;
    if (eFill) eFill.style.width = `${ePct}%`;
    if (eTrail) eTrail.style.width = `${ePct}%`;
    if (eText) eText.textContent = `${Math.ceil(e.health)}/${e.maxHealth} PV`;

    const pSt = $("#playerStatuses", dom.combatOverlay);
    const eSt = $("#enemyStatuses", dom.combatOverlay);
    const eTraits = $("#enemyTraits", dom.combatOverlay);
    if (pSt) pSt.innerHTML = renderStatuses(p.statuses);
    if (eSt) eSt.innerHTML = renderStatuses(e.statuses);
    if (eTraits) eTraits.innerHTML = renderEnemyTraitsHTML(e);

    const turnEl = $("#combatTurnOrder", dom.combatOverlay);
    if (turnEl) turnEl.textContent = `Turno ${combat.turn} • ${combat.lastAction || "Determinando iniciativa"}`;

    const barEl = $("#combatAbilityBar", dom.combatOverlay);
    if (barEl) barEl.innerHTML = buildAbilityButtonsHTML();

    const speedBtn = $('[data-combat="speed"]', dom.combatOverlay);
    if (speedBtn) speedBtn.textContent = `${combat.speed}×`;
    const autoBtn = $('[data-combat="auto"]', dom.combatOverlay);
    if (autoBtn) {
      autoBtn.className = `btn ${combat.auto ? "btn-secondary" : "btn-ghost"} btn-small`;
      autoBtn.textContent = `Auto ${combat.auto ? "Ligado" : "Desligado"}`;
    }
    const skipBtn = $('[data-combat="skip"]', dom.combatOverlay);
    if (skipBtn) {
      skipBtn.textContent = `Animações ${state.settings.skipAnimations ? "Desligadas" : "Ligadas"}`;
    }

    const log = $("#combatLog", dom.combatOverlay);
    if (log) {
      log.innerHTML = combat.log.join("<br>");
      log.scrollTop = log.scrollHeight;
    }
    syncFighterAuras();
  }

  function renderEnemyTraitsHTML(e) {
    if (!e?.sourceData || !S) return "";
    const known = (state.bestiary[e.id]?.defeated || 0) > 0;
    const rawWeak = e.sourceData.weaknesses || [];
    const rawRes = e.sourceData.resistances || [];
    const chips = [];
    rawWeak.forEach((w) => {
      const lbl = S.labelTrait(w);
      if (known || combat?.revealedWeaknesses?.has(w.toLowerCase())) {
        chips.push(`<span class="trait-chip weak" title="Ataques ou efeitos deste tipo causam +28% de dano.">⚡ Fraco: ${esc(lbl)}</span>`);
      }
    });
    rawRes.forEach((r) => {
      const lbl = S.labelTrait(r);
      if (known || combat?.revealedResistances?.has(r.toLowerCase())) {
        chips.push(`<span class="trait-chip resist" title="Este inimigo reduz em 25% o dano deste tipo.">⬟ Resiste: ${esc(lbl)}</span>`);
      }
    });
    if (!chips.length && (rawWeak.length || rawRes.length)) {
      chips.push(`<span class="trait-chip unknown" title="Derrote este inimigo ou acerte sua fraqueza para revelar no Bestiário.">? Fraquezas ocultas</span>`);
    }
    return chips.join("");
  }

  function renderCombat(forceRemount = false) {
    if (!combat) return;
    if (!forceRemount && combat.mounted && $(".battlefield", dom.combatOverlay)) {
      updateCombatHUD();
      return;
    }
    const p = combat.player,
      e = combat.enemy,
      f = D.factions[state.player.faction],
      lunar = currentLunar();
    const scene = battleSceneConfig(combat.context);
    const pPct = U.clamp((p.health / Math.max(1, p.maxHealth)) * 100, 0, 100);
    const ePct = U.clamp((e.health / Math.max(1, e.maxHealth)) * 100, 0, 100);
    const encounterEyebrow =
      combat.context.source === "arena"
        ? "DUELO DE ARENA"
        : combat.context.source === "story"
          ? "ENCONTRO DA HISTÓRIA"
          : e.boss
            ? "CONFRONTO DE CHEFE"
            : "CAÇADA NOTURNA";
    dom.combatOverlay.innerHTML = `<div class="combat-shell"><div class="combat-top"><div><span class="eyebrow">${encounterEyebrow}</span><h2>${esc(combat.context.region !== undefined ? D.regions[combat.context.region].name : "A Arena")}</h2></div><div class="combat-top-actions"><span class="combat-lunar-pill" title="${esc(lunar.summary)}"><span class="lunar-dot" style="--lunar-color:${lunar.color};width:8px;height:8px;border-radius:50%;background:${lunar.color};display:inline-block"></span>${esc(lunar.name)}</span><button class="btn btn-ghost btn-small" data-combat="speed">${combat.speed}×</button><button class="btn ${combat.auto ? "btn-secondary" : "btn-ghost"} btn-small" data-combat="auto">Auto ${combat.auto ? "Ligado" : "Desligado"}</button><button class="btn btn-ghost btn-small" data-combat="skip">Animações ${state.settings.skipAnimations ? "Desligadas" : "Ligadas"}</button></div></div>
    <div class="battlefield" style="background:${scene.style}"><div class="battle-scene">${scene.svg}</div><div class="battle-weather weather-${scene.weather}" aria-hidden="true"></div><div class="battle-vignette" aria-hidden="true"></div><div class="combatant-ui left"><h3>${esc(p.name)}</h3><div class="combatant-meta"><span class="enemy-intent-pill">${Icons.svg(state.player.faction)} Nv. ${p.level}</span></div><div class="bar hp"><span id="playerHpTrail" class="bar-trail" style="width:${pPct}%"></span><span id="playerHpFill" class="bar-fill" style="width:${pPct}%"></span></div><div id="playerHpText" class="small">${Math.ceil(p.health)}/${p.maxHealth} PV</div><div class="bar resource" style="margin-top:6px"><span id="playerResFill" class="bar-fill" style="width:${U.clamp(p.resource, 0, 100)}%"></span></div><div id="playerResText" class="small">${Math.floor(p.resource)}/100 ${ptLabel(f.resource)}</div><div id="playerStatuses" class="status-list">${renderStatuses(p.statuses)}</div></div><div class="combatant-ui right"><h3 id="enemyTitle">${esc(e.name)}${e.boss ? ` • Fase ${e.phase}/3` : ""}</h3><div class="combatant-meta"><span class="enemy-intent-pill">${combatBehaviorLabel(e.behavior, e.boss)} • Nv. ${e.level}</span><div class="enemy-buff-badge" title="Vida, dano e armadura aumentados. Vitória concede a mesma porcentagem extra de XP e recompensas.">▲ +${e.buffPercent || 0}% RISCO</div></div><div class="bar hp"><span id="enemyHpTrail" class="bar-trail" style="width:${ePct}%"></span><span id="enemyHpFill" class="bar-fill" style="width:${ePct}%"></span></div><div id="enemyHpText" class="small">${Math.ceil(e.health)}/${e.maxHealth} PV</div><div id="enemyTraits" class="combat-traits">${renderEnemyTraitsHTML(e)}</div><div id="enemyStatuses" class="status-list">${renderStatuses(e.statuses)}</div></div>
    <div id="fighterPlayer" class="fighter player"><div class="fighter-shadow" aria-hidden="true"></div><div class="fighter-body">${characterSVG({ ...state.player, equipment: state.player.equipment }, "battle")}</div></div><div id="fighterEnemy" class="fighter enemy ${e.boss ? "is-boss" : ""}"><div class="fighter-shadow" aria-hidden="true"></div><div class="fighter-body">${enemySVG(e)}</div></div><div id="battleVfx" class="battle-vfx" aria-hidden="true"></div></div>
    <div class="combat-bottom"><div><div id="combatTurnOrder" class="turn-order">Turno ${combat.turn} • ${combat.lastAction || "Determinando iniciativa"}</div><div id="combatAbilityBar" class="ability-bar" style="margin-top:8px">${buildAbilityButtonsHTML()}</div></div><div id="combatLog" class="combat-log">${combat.log.join("<br>")}</div></div></div>`;
    combat.mounted = true;
    syncFighterAuras();
    requestAnimationFrame(() => {
      cleanBattlePortraitBackground($("#fighterPlayer"));
      if (e.visual) cleanBattlePortraitBackground($("#fighterEnemy"));
    });
  }
  function enemySVG(e) {
    if (e.visual) return characterSVG(e.visual, "battle");
    if (window.WB_ENEMY_ART) {
      return window.WB_ENEMY_ART.render(e.sourceData || e, combat?.context || {});
    }
    const color = e.boss
      ? "#b02a46"
      : e.behavior === "poison"
        ? "#5d8c63"
        : e.behavior === "burn"
          ? "#bf633d"
          : "#6c7187";
    return `<svg viewBox="0 0 300 500"><defs><radialGradient id="eg"><stop stop-color="${color}" stop-opacity=".42"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><circle cx="150" cy="190" r="140" fill="url(#eg)"/><path d="M109 75l-26-50 50 31m58 19 26-50-50 31" fill="#1b1b22"/><path d="M97 80q53-38 106 0l10 80q-15 70-63 73-48-3-63-73z" fill="#30313a" stroke="${color}" stroke-width="5"/><path d="M113 132h32m12 0h31" stroke="#ffcf73" stroke-width="8"/><path d="M122 185l18 23 10-20 10 20 18-23" fill="#e4ded0"/><path d="M92 211q58-31 116 0l29 166-87 61-87-61z" fill="#24252d" stroke="${color}" stroke-width="5"/><path d="M92 230Q48 264 42 361l42 19 50-130m74-20q44 34 50 131l-42 19-50-130" fill="#30313a" stroke="#16171c" stroke-width="5"/><path d="M108 404l-25 81h54l13-58 13 58h54l-25-81" fill="#191a20"/>${e.boss ? `<circle cx="150" cy="285" r="35" fill="none" stroke="#d4a24e" stroke-width="7"/><path d="M150 245v80m-40-40h80" stroke="#d4a24e" stroke-width="5"/>` : ""}</svg>`;
  }

  function spawnCombatVfx(side, type) {
    if (state.settings.skipAnimations || state.settings.reducedMotion) return;
    const layer = $("#battleVfx", dom.combatOverlay);
    if (!layer) return;
    const node = document.createElement("div");
    node.className = `vfx-node vfx-${type}`;
    node.style.left = side === "player" ? "26%" : "74%";
    node.style.top = "54%";
    const svgs = {
      "slash-moon": `<svg viewBox="0 0 200 200"><g fill="none" stroke-linecap="round"><path d="M26 164Q98 92 174 30" stroke="#c8e2ff" stroke-width="10"/><path d="M44 176Q112 108 182 52" stroke="#5f96e8" stroke-width="7" opacity=".85"/><path d="M18 142Q86 78 156 20" stroke="#eef6ff" stroke-width="5" opacity=".8"/></g></svg>`,
      "slash-blood": `<svg viewBox="0 0 200 200"><path d="M22 154C64 70 118 42 182 28C136 74 96 116 42 174Z" fill="#ff3c58" opacity=".86"/><path d="M36 162C84 96 132 64 178 46" fill="none" stroke="#ffd2da" stroke-width="4" stroke-linecap="round"/><circle cx="154" cy="48" r="7" fill="#ff5b73"/><circle cx="66" cy="144" r="5" fill="#ff5b73"/></svg>`,
      crit: `<svg viewBox="0 0 240 240"><circle cx="120" cy="120" r="88" fill="none" stroke="#ffd87d" stroke-width="6" opacity=".88"/><circle cx="120" cy="120" r="54" fill="none" stroke="#ff5c72" stroke-width="4" opacity=".8"/><path d="M120 12l16 74 74-24-50 58 64 46-78-10-10 72-32-66-76 16 48-56-56-48 74 12Z" fill="#ffe7a6" opacity=".86"/></svg>`,
      shield: `<svg viewBox="0 0 200 200"><path d="M100 22l62 24v46c0 42-26 70-62 86-36-16-62-44-62-86V46Z" fill="rgba(124,182,255,.2)" stroke="#a8d2ff" stroke-width="6"/><path d="M100 44v112M62 82h76" stroke="#e4f2ff" stroke-width="3" opacity=".7"/></svg>`,
      heal: `<svg viewBox="0 0 200 200"><g fill="#80ec98" opacity=".9"><path d="M96 48h8v32h32v8h-32v32h-8V88H64v-8h32Z"/><circle cx="56" cy="126" r="6"/><circle cx="146" cy="116" r="5"/><circle cx="124" cy="54" r="4"/></g></svg>`,
      transform: `<svg viewBox="0 0 260 260"><circle cx="130" cy="130" r="106" fill="none" stroke="var(--accent2, #ff8295)" stroke-width="8" stroke-dasharray="18 12"/><circle cx="130" cy="130" r="74" fill="var(--accent, #ba2339)" opacity=".28"/><path d="M130 16l20 82 82 32-82 32-20 82-20-82-82-32 82-32Z" fill="#fff0d4" opacity=".68"/></svg>`,
    };
    node.innerHTML = svgs[type] || svgs["slash-blood"];
    layer.appendChild(node);
    setTimeout(() => node.remove(), 760);
  }

  function showBossPhaseBanner(bossName, phase, signature) {
    const field = $(".battlefield", dom.combatOverlay);
    if (!field) return;
    const banner = document.createElement("div");
    banner.className = "boss-phase-banner";
    banner.innerHTML = `<span>FASE ${phase} • ${esc(bossName).toUpperCase()}</span><strong>${esc(PT.translate(signature || "Despertar do Eclipse"))}</strong>`;
    field.appendChild(banner);
    setTimeout(() => banner.remove(), 1900);
  }

  function triggerCritImpact() {
    if (state.settings.skipAnimations || state.settings.reducedMotion) return;
    const field = $(".battlefield", dom.combatOverlay);
    if (!field) return;
    field.classList.add("crit-flash", "hit-stop");
    setTimeout(() => field.classList.remove("hit-stop"), 65);
    setTimeout(() => field.classList.remove("crit-flash"), 360);
  }
  function renderStatuses(statuses) {
    return statuses
      .map(
        (s) =>
          `<span class="status-icon" data-tooltip="${esc(ptLabel(s.name))}: ${esc(PT.translate(statusInfo[s.name]?.[1] || "Efeito temporário"))} (${s.duration})">${iconSvg(statusInfo[s.name]?.[0] || "shards")}</span>`,
      )
      .join("");
  }
  function logCombat(msg) {
    if (!combat) return;
    combat.log.push(msg);
    if (combat.log.length > 35) combat.log.shift();
    const log = $("#combatLog");
    if (log) {
      log.innerHTML = combat.log.join("<br>");
      log.scrollTop = log.scrollHeight;
    }
  }
  function handleCombatClick(e) {
    const b = e.target.closest("[data-combat]");
    if (!b || !combat) return;
    const action = b.dataset.combat;
    if (action === "speed") {
      combat.speed = combat.speed === 1 ? 2 : combat.speed === 2 ? 4 : 1;
      state.settings.combatSpeed = combat.speed;
      renderCombat();
      saveGame();
      return;
    }
    if (action === "auto") {
      combat.auto = !combat.auto;
      state.settings.autoBattle = combat.auto;
      renderCombat();
      saveGame();
      if (combat.auto && !combat.ended) setTimeout(autoAct, 160);
      return;
    }
    if (action === "skip") {
      state.settings.skipAnimations = !state.settings.skipAnimations;
      renderCombat();
      return;
    }
    if (action === "action" && !combat.waiting)
      return playerAction(b.dataset.actionId);
    if (action === "item" && !combat.waiting) return useCombatItem();
    if (action === "flee" && !combat.waiting) return attemptFlee();
  }
  function combatStartTurn() {
    if (!combat || combat.ended) return;
    combat.turn++;
    tickCooldowns(combat.player);
    tickCooldowns(combat.enemy);
    applyStatusTick(combat.player, "player");
    applyStatusTick(combat.enemy, "enemy");
    if (checkCombatEnd()) return;
    const pInit =
        combat.player.initiative + U.rand(0, C.combat.initiativeVariance),
      eInit = combat.enemy.initiative + U.rand(0, C.combat.initiativeVariance);
    combat.turnOrder =
      pInit >= eInit ? ["player", "enemy"] : ["enemy", "player"];
    combat.actionIndex = 0;
    combat.waiting = false;
    advanceAction();
  }
  function advanceAction() {
    if (!combat || combat.ended) return;
    if (combat.actionIndex >= combat.turnOrder.length) {
      combat.player.defending = false;
      combat.enemy.defending = false;
      setTimeout(combatStartTurn, delay(420));
      return;
    }
    const actor = combat.turnOrder[combat.actionIndex++];
    if (actor === "player") {
      if (hasStatus(combat.player, "stunned")) {
        removeOneTurn(combat.player, "stunned");
        logCombat(`${esc(combat.player.name)} is stunned.`);
        return setTimeout(advanceAction, delay(350));
      }
      combat.waiting = false;
      combat.lastAction = "Your move";
      renderCombat();
      if (combat.auto) setTimeout(autoAct, delay(280));
    } else {
      combat.waiting = true;
      setTimeout(enemyAction, delay(420));
    }
  }
  function delay(ms) {
    return state.settings.skipAnimations ? 20 : ms / (combat?.speed || 1);
  }
  function autoAct() {
    if (!combat || combat.ended || combat.waiting) return;
    const p = combat.player;
    if (
      p.health / p.maxHealth < 0.3 &&
      state.player.inventory.some((i) => i.type === "consumable" && i.count > 0)
    )
      useCombatItem();
    else if (p.resource >= 100) playerAction("faction");
    else {
      const usable = state.player.equippedAbilities
        .map((id) => D.abilities.find((a) => a.id === id))
        .filter((a) => a && p.resource >= a.cost && !p.cooldowns[a.id]);
      if (usable.length && U.chance(0.55))
        playerAction(`ability:${U.pick(usable).id}`);
      else playerAction(U.chance(0.22) ? "heavy" : "basic");
    }
  }
  function playerAction(actionId) {
    if (!combat || combat.waiting) return;
    combat.waiting = true;
    const p = combat.player,
      e = combat.enemy;
    if (actionId === "basic")
      performAttack(
        p,
        e,
        { name: "Basic Attack", power: 1, accuracy: 0, status: null },
        "player",
      );
    else if (actionId === "heavy")
      performAttack(
        p,
        e,
        {
          name: "Heavy Attack",
          power: C.combat.heavyDamage,
          accuracy: C.combat.heavyAccuracy,
          status: U.chance(0.3) ? "weakened" : null,
          isHeavy: true,
        },
        "player",
      );
    else if (actionId === "defend") {
      p.defending = true;
      addStatus(p, "shielded", 1);
      gainResource(p, 10);
      logCombat(`<b>${esc(p.name)}</b> assume uma postura defensiva.`);
      spawnCombatVfx("player", "shield");
      animateFighter("player", "block");
      renderCombat();
      finishAction();
    } else if (actionId === "faction") factionAction();
    else if (actionId.startsWith("ability:"))
      useAbility(D.abilities.find((a) => a.id === actionId.split(":")[1]));
  }
  function factionAction() {
    const p = combat.player,
      e = combat.enemy,
      f = state.player.faction;
    if (p.resource >= 100) {
      p.resource = 0;
      p.transformed = 3;
      addStatus(p, f === "moonborn" ? "enraged" : "bloodFrenzy", 3);
      logCombat(`<b>${esc(p.name)}</b> entra em <b>${ptLabel(D.factions[f].form)}</b>!`);
      sfx("transform");
      spawnCombatVfx("player", "transform");
      animateFighter("player", "attack");
      renderCombat();
      if (f === "moonborn")
        performAttack(
          p,
          e,
          {
            name: "Worldfang Finisher",
            power: 1.75,
            accuracy: 0.05,
            status: "bleeding",
          },
          "player",
          true,
        );
      else {
        const result = performAttack(
          p,
          e,
          {
            name: "Crimson Ascendance",
            power: 1.48,
            accuracy: 0.08,
            status: "bleeding",
          },
          "player",
          true,
        );
        healCombat(p, Math.floor(p.maxHealth * 0.18));
      }
    } else {
      if (f === "moonborn") {
        addStatus(p, "enraged", 2);
        gainResource(p, 18);
        logCombat(`${esc(p.name)} invokes a territorial howl.`);
      } else {
        const amount = Math.floor(p.maxHealth * 0.12);
        healCombat(p, amount);
        gainResource(p, -20);
        addStatus(e, "marked", 2);
        logCombat(`${esc(p.name)} bends the enemy's pulse.`);
      }
      finishAction();
    }
  }
  function useAbility(a) {
    if (!a) return finishAction();
    const p = combat.player,
      e = combat.enemy;
    if (p.resource < a.cost || p.cooldowns[a.id] > 0) return finishAction();
    p.resource -= a.cost;
    state.metrics.resourceSpent += a.cost;
    p.cooldowns[a.id] = a.cooldown;
    if (a.type === "damage")
      performAttack(
        p,
        e,
        { name: a.name, power: a.power, accuracy: 0.03, status: a.status },
        "player",
      );
    else if (a.type === "defense") {
      addStatus(p, "shielded", a.duration);
      if (a.status) addStatus(p, a.status, a.duration);
      logCombat(`<b>${esc(a.name)}</b> surrounds ${esc(p.name)}.`);
      finishAction();
    } else if (a.type === "heal") {
      healCombat(p, Math.floor(p.maxHealth * (0.14 + a.power * 0.05)));
      addStatus(p, "regenerating", a.duration);
      logCombat(`<b>${esc(a.name)}</b> restores stolen vitality.`);
      finishAction();
    } else {
      addStatus(e, a.status, a.duration);
      if (a.status === "bleeding") state.metrics.bleeds++;
      logCombat(`<b>${esc(a.name)}</b> applies ${U.title(a.status)}.`);
      finishAction();
    }
    sfx("ability");
  }
  function enemyAction() {
    if (!combat || combat.ended) return;
    const e = combat.enemy,
      p = combat.player;
    if (hasStatus(e, "stunned")) {
      removeOneTurn(e, "stunned");
      logCombat(`${esc(e.name)} is stunned.`);
      return finishAction();
    }
    if (e.boss) {
      const hp = e.health / e.maxHealth;
      const phase = hp > 0.66 ? 1 : hp > 0.33 ? 2 : 3;
      if (phase !== e.phase) {
        e.phase = phase;
        logCombat(
          `<b>${esc(e.name)}</b> entra na Fase ${phase}! Um golpe devastador se aproxima.`,
        );
        addStatus(e, "enraged", 2);
        showBossPhaseBanner(e.name, phase, e.sourceData.signature);
        spawnCombatVfx("enemy", "transform");
        renderCombat();
        return setTimeout(
          () =>
            performAttack(
              e,
              p,
              {
                name: e.sourceData.signature || "Cataclismo do Chefe",
                power: 1.25 + phase * 0.16,
                accuracy: 0.02,
                status: phase === 3 ? "cursed" : "weakened",
              },
              "enemy",
            ),
          delay(750),
        );
      }
    }
    if (
      e.behavior === "healer" &&
      e.health / e.maxHealth < 0.45 &&
      U.chance(0.45)
    ) {
      healCombat(e, Math.floor(e.maxHealth * 0.14));
      addStatus(e, "regenerating", 2);
      logCombat(`${esc(e.name)} invoca uma recuperação profana.`);
      renderCombat();
      finishAction();
    } else if (
      (e.behavior === "defensive" || e.behavior === "shield") &&
      U.chance(0.28)
    ) {
      e.defending = true;
      addStatus(e, "shielded", 1);
      spawnCombatVfx("enemy", "shield");
      animateFighter("enemy", "block");
      logCombat(`${esc(e.name)} ergue uma guarda.`);
      renderCombat();
      finishAction();
    } else {
      const status = {
        poison: "poisoned",
        burn: "burning",
        bleed: "bleeding",
        weaken: "weakened",
        control: "stunned",
        summoner: "marked",
      }[e.behavior];
      performAttack(
        e,
        p,
        {
          name: e.boss
            ? e.sourceData.signature || "Golpe do Chefe"
            : U.pick([
                "Golpe Dilacerante",
                "Investida Noturna",
                "Finta Cruel",
                "Golpe do Eclipse",
              ]),
          power: e.behavior === "berserk" ? 1.28 : 1,
          accuracy: e.behavior === "fast" ? 0.07 : 0,
          status: U.chance(0.35) ? status : null,
        },
        "enemy",
      );
    }
  }
  function performAttack(attacker, target, move, side, skipFinish = false) {
    const hit = U.clamp(
      attacker.accuracy +
        (move.accuracy || 0) -
        target.evasion +
        (hasStatus(target, "marked") ? 0.08 : 0) -
        (hasStatus(attacker, "frightened") ? 0.12 : 0),
      C.combat.hitFloor,
      C.combat.hitCeil,
    );
    const defenderSide = side === "player" ? "enemy" : "player";
    animateFighter(side, "attack");
    setTimeout(() => {
      if (U.chance(hit)) {
        const critChance = U.clamp(
          attacker.critChance + (hasStatus(target, "marked") ? 0.08 : 0),
          C.combat.critFloor,
          C.combat.critCeil,
        );
        const crit = U.chance(critChance);
        let raw =
          U.rand(attacker.minDamage, attacker.maxDamage) * (move.power || 1);
        if (hasStatus(attacker, "weakened")) raw *= 0.76;
        if (
          hasStatus(attacker, "enraged") ||
          hasStatus(attacker, "bloodFrenzy") ||
          attacker.transformed > 0
        )
          raw *= 1.25;
        if (crit) raw *= attacker.critDamage;
        const blocked = U.chance(
          target.blockChance + (target.defending ? C.combat.defendBlock : 0),
        );
        const armor =
          target.armor * (1 + (target.defending ? C.combat.defendArmor : 0));
        const affinity =
          side === "player" && S
            ? S.evaluateAttackAffinity(target, move, crit)
            : { kind: "neutral", tag: null, label: "", mult: 1, statusBonusTurns: 0 };
        let affinityMult = affinity.mult;
        if (affinity.kind === "weakness") {
          affinityMult += attacker.weaknessBonus || 0;
          if (affinity.tag) combat?.revealedWeaknesses?.add(affinity.tag);
        } else if (affinity.kind === "resistance" && affinity.tag) {
          combat?.revealedResistances?.add(affinity.tag);
        }
        let damage = Math.max(
          1,
          Math.floor(
            raw *
              affinityMult *
              (C.combat.armorConstant / (C.combat.armorConstant + armor)) *
              (blocked ? 0.55 : 1) *
              (hasStatus(target, "shielded") ? 0.78 : 1),
          ),
        );
        target.health = Math.max(0, target.health - damage);
        if (side === "player")
          gainResource(
            attacker,
            state.player.faction === "moonborn" ? (crit ? 18 : 8) : 10,
          );
        else if (state.player.faction === "moonborn") gainResource(target, 10);
        const statusChance = affinity.kind === "resistance" ? 0.32 : 0.62;
        if (move.status && U.chance(statusChance)) {
          addStatus(target, move.status, 2 + (affinity.statusBonusTurns || 0));
          if (move.status === "bleeding" && side === "player")
            state.metrics.bleeds++;
        }
        if (side === "player" && attacker.burnProc > 0 && U.chance(attacker.burnProc)) {
          addStatus(target, "burning", 2);
        }
        const extraDrain = side === "player" ? attacker.lifesteal || 0 : 0;
        const totalDrain =
          (state.player.faction === "bloodbound" && side === "player" ? 0.08 : 0) +
          extraDrain;
        if (totalDrain > 0) {
          healCombat(attacker, Math.max(1, Math.floor(damage * totalDrain)));
        }
        if (state.player.faction === "bloodbound" && side === "player") {
          gainResource(attacker, hasStatus(target, "bleeding") ? 8 : 3);
        }
        animateFighter(defenderSide, blocked ? "block" : "hit");
        if (blocked) {
          spawnCombatVfx(defenderSide, "shield");
        } else {
          const slashType =
            attacker.faction === "moonborn" ? "slash-moon" : "slash-blood";
          spawnCombatVfx(defenderSide, slashType);
          if (crit) {
            spawnCombatVfx(defenderSide, "crit");
            triggerCritImpact();
          }
        }
        showDamage(defenderSide, damage, crit, blocked, false, false, affinity.kind);
        const affinityNote =
          affinity.kind === "weakness"
            ? ` <span class="success-text">[FRAQUEZA: ${esc(affinity.label)}]</span>`
            : affinity.kind === "resistance"
              ? ` <span class="muted">[RESISTIDO: ${esc(affinity.label)}]</span>`
              : "";
        logCombat(
          `<b>${esc(attacker.name)}</b> usa ${esc(PT.translate(move.name))} causando <b>${damage}</b> de dano${crit ? " crítico" : ""}${blocked ? " bloqueado" : ""}${affinityNote}.`,
        );
        sfx(crit ? "critical" : blocked ? "block" : "attack");
        if (crit && state.settings.screenShake) {
          document.body.classList.add("screen-shake");
          setTimeout(() => document.body.classList.remove("screen-shake"), 300);
        }
      } else {
        animateFighter(defenderSide, "dodge");
        showDamage(defenderSide, 0, false, false, false, true);
        logCombat(`<b>${esc(target.name)}</b> esquiva de ${esc(PT.translate(move.name))}.`);
        sfx("dodge");
      }
      renderCombat();
      if (checkCombatEnd()) return;
      if (!skipFinish) finishAction();
      else finishAction();
    }, delay(260));
  }
  function finishAction() {
    if (!combat || combat.ended) return;
    if (combat.player.transformed > 0) combat.player.transformed--;
    setTimeout(() => {
      combat.waiting = false;
      advanceAction();
    }, delay(260));
  }
  function tickCooldowns(c) {
    Object.keys(c.cooldowns).forEach(
      (k) => (c.cooldowns[k] = Math.max(0, c.cooldowns[k] - 1)),
    );
    c.statuses.forEach((s) => s.duration--);
    c.statuses = c.statuses.filter((s) => s.duration > 0);
  }
  function applyStatusTick(c, side) {
    let dmg = 0,
      heal = 0;
    c.statuses.forEach((s) => {
      const aff =
        side === "enemy" && S
          ? S.evaluateStatusTickAffinity(c, s.name)
          : { kind: "neutral", mult: 1 };
      if (aff.kind === "weakness") combat?.revealedWeaknesses?.add(s.name);
      if (aff.kind === "resistance") combat?.revealedResistances?.add(s.name);
      if (s.name === "bleeding")
        dmg += Math.max(2, Math.floor(c.maxHealth * 0.035 * aff.mult));
      if (s.name === "poisoned")
        dmg += Math.max(2, Math.floor(c.maxHealth * 0.025 * aff.mult));
      if (s.name === "burning")
        dmg += Math.max(3, Math.floor(c.maxHealth * 0.04 * aff.mult));
      if (s.name === "regenerating")
        heal += Math.max(2, Math.floor(c.maxHealth * 0.04));
    });
    if (dmg) {
      c.health = Math.max(0, c.health - dmg);
      showDamage(side, dmg, false, false);
      logCombat(`${esc(c.name)} sofre ${dmg} de dano contínuo.`);
    }
    if (heal) healCombat(c, heal);
    if (c.regeneration)
      c.health = Math.min(c.maxHealth, c.health + c.regeneration);
  }
  function addStatus(c, name, duration) {
    if (!name) return;
    const existing = c.statuses.find((s) => s.name === name);
    if (existing) existing.duration = Math.max(existing.duration, duration);
    else c.statuses.push({ name, duration });
  }
  function hasStatus(c, name) {
    return c.statuses.some((s) => s.name === name);
  }
  function removeOneTurn(c, name) {
    const s = c.statuses.find((x) => x.name === name);
    if (s) s.duration = 0;
  }
  function gainResource(c, amount) {
    c.resource = U.clamp(
      c.resource +
        amount * (c.id === "player" ? derived().resourceGeneration : 1),
      0,
      100,
    );
  }
  function healCombat(c, amount) {
    const actual = Math.min(amount, c.maxHealth - c.health);
    c.health += actual;
    if (actual > 0) {
      const side = c.id === "player" ? "player" : "enemy";
      spawnCombatVfx(side, "heal");
      showDamage(side, actual, false, false, true);
    }
  }
  function showDamage(
    side,
    amount,
    crit = false,
    blocked = false,
    heal = false,
    dodged = false,
    affinity = "neutral",
  ) {
    if (!state.settings.damageNumbers) return;
    const field = $(".battlefield");
    if (!field) return;
    const n = document.createElement("div");
    n.className = `damage-number ${crit ? "crit" : ""} ${blocked ? "blocked" : ""} ${heal ? "heal" : ""} ${dodged ? "dodge" : ""} ${affinity === "weakness" ? "float-dmg weakness" : affinity === "resistance" ? "float-dmg resisted" : ""}`;
    n.textContent = dodged
      ? "ESQUIVOU"
      : heal
        ? `+${amount}`
        : affinity === "weakness"
          ? `FRAQUEZA! -${amount}`
          : affinity === "resistance"
            ? `RESISTIDO -${amount}`
            : crit
              ? `CRÍTICO! -${amount}`
              : `${blocked ? "BLOQUEADO " : ""}-${amount}`;
    n.style.left = side === "player" ? "26%" : "74%";
    n.style.top = `${U.rand(34, 54)}%`;
    field.appendChild(n);
    setTimeout(() => n.remove(), 960);
  }
  function animateFighter(side, cls) {
    const el = $(`#fighter${side === "player" ? "Player" : "Enemy"}`);
    if (!el || state.settings.skipAnimations) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 400 / combat.speed);
  }
  function useCombatItem() {
    const item = state.player.inventory.find(
      (i) =>
        i.type === "consumable" &&
        i.count > 0 &&
        i.effect !== "energy",
    );
    if (!item) return toast("Nenhum consumível de combate disponível.", "error");
    item.count--;
    if (item.count <= 0)
      state.player.inventory = state.player.inventory.filter(
        (i) => i.id !== item.id,
      );
    if (item.effect === "full_restore") {
      healCombat(combat.player, combat.player.maxHealth);
      gainResource(combat.player, 25);
    } else if (item.effect === "heal_cleanse") {
      healCombat(combat.player, item.amount || 95);
      combat.player.statuses = combat.player.statuses.filter(
        (s) => !["bleeding", "poisoned", "burning", "cursed"].includes(s.name),
      );
    } else if (item.effect === "resource_heal") {
      healCombat(combat.player, item.amount || 40);
      gainResource(combat.player, item.resourceAmount || 40);
    } else {
      healCombat(combat.player, item.amount || 45);
    }
    logCombat(`<b>${esc(state.player.name)}</b> usa ${esc(item.name)}.`);
    renderCombat();
    combat.waiting = true;
    finishAction();
  }
  function attemptFlee() {
    const chance = U.clamp(
      C.combat.fleeBase +
        (combat.player.initiative - combat.enemy.initiative) * 0.006,
      0.15,
      0.8,
    );
    if (U.chance(chance)) {
      logCombat("Você desaparece na escuridão.");
      setTimeout(() => endCombat(false, true), delay(450));
    } else {
      logCombat("Fuga falhou.");
      combat.waiting = true;
      finishAction();
    }
  }
  function checkCombatEnd() {
    if (!combat) return true;
    if (combat.enemy.health <= 0) {
      endCombat(true);
      return true;
    }
    if (combat.player.health <= 0) {
      endCombat(false);
      return true;
    }
    return false;
  }
  function endCombat(win, fled = false) {
    if (!combat || combat.ended) return;
    combat.ended = true;
    const ctx = combat.context,
      enemy = combat.enemy.sourceData;
    state.player.resource = Math.floor(combat.player.resource);
    state.player.health = Math.max(0, Math.floor(combat.player.health));
    let reward = { gold: 0, xp: 0, items: [], materials: 0 };
    if (win) {
      const diff = ctx.rewardMult || 1;
      const buffPercent = Math.max(0, Number(combat.enemy.buffPercent) || 0);
      const riskRewardMult = 1 + buffPercent / 100;
      const lunar = currentLunar().bonuses || {};
      const clanMult = 1 + (state.clan ? Math.min(C.clan.maxFortress, state.clan.fortress || 1) * 0.02 : 0);
      const arenaRewardMult =
        ctx.source === "arena" ? 1 + hideoutBonus("arenaBonus") * 0.05 : 1;
      reward.xp = Math.floor(
        C.xp.reward(
          combat.enemy.level,
          diff * (combat.enemy.boss ? 1.7 : 1),
        ) *
          arenaRewardMult *
          riskRewardMult *
          (1 + (lunar.xpMult || 0)) *
          clanMult,
      );
      reward.gold = Math.floor(
        (35 + combat.enemy.level * 13) *
          diff *
          arenaRewardMult *
          (1 + hideoutBonus("goldBonus") * 0.04) *
          riskRewardMult *
          (1 + (lunar.goldMult || 0)) *
          clanMult,
      );
      reward.materials = Math.max(
        1,
        Math.ceil(U.rand(1, combat.enemy.boss ? 5 : 2) * riskRewardMult),
      );
      reward.buffPercent = buffPercent;
      reward.rewardMultiplier = riskRewardMult;
      const lootChance = Math.min(
        0.98,
        (0.42 + diff * 0.12 + hideoutBonus("lootBonus") * 0.025 + (lunar.lootBonus || 0)) *
          (1 + buffPercent / 200),
      );
      if (U.chance(lootChance)) {
        const allowed = D.itemTemplates.filter(
          (t) =>
            t.level <= combat.enemy.level + 4 &&
            (t.faction === "any" || t.faction === state.player.faction),
        );
        reward.items.push(
          D.createItem(
            U.pick(allowed.length ? allowed : D.itemTemplates),
            combat.enemy.level,
            combat.enemy.boss ? U.pick(["rare", "epic", "legendary"]) : null,
          ),
        );
      }
      grantRewards(reward);
      updateMetricMissions("kills", 1);
      if (enemy?.id) {
        state.bestiary[enemy.id] = state.bestiary[enemy.id] || { defeated: 0 };
        state.bestiary[enemy.id].defeated++;
      }
      if (combat.enemy.boss) {
        updateMetricMissions("bosses", 1);
      }
      if (ctx.source === "arena") finishArena(true);
      if (ctx.source === "story") {
        ctx.storyAdvanced = finishStoryCombat(ctx.chapter, true);
      }
      state.combatHistory.push({
        enemy: combat.enemy.name,
        win: true,
        xp: reward.xp,
        date: Date.now(),
      });
    } else if (fled) {
      state.player.health = Math.max(1, state.player.health);
    } else {
      state.player.health = Math.max(1, Math.floor(derived().maxHealth * 0.4));
      state.player.resource = 0;
      if (ctx.source === "arena") finishArena(false);
      if (ctx.source === "story") finishStoryCombat(ctx.chapter, false);
      state.combatHistory.push({
        enemy: combat.enemy.name,
        win: false,
        xp: 0,
        date: Date.now(),
      });
    }
    state.combatHistory = state.combatHistory.slice(-30);
    syncMissionProgress();
    checkAchievements();
    saveGame();
    setTimeout(() => {
      dom.combatOverlay.classList.remove("active");
      dom.combatOverlay.setAttribute("aria-hidden", "true");
      dom.combatOverlay.innerHTML = "";
      combat = null;
      updateTopbar();
      renderSidebar();
      if (win)
        showLootModal({ ...reward, title: fled ? "Retreated" : "Victory" });
      else if (fled) toast("You escaped the encounter.", "success");
      else
        openModal({
          title: "Defeat",
          body: "<p>Your body reforms within the hideout. Some health is restored and no equipment is lost.</p>",
          actions: [{ label: "Return", class: "btn-primary", action: "close" }],
        });
      if (ctx.source === "story") {
        currentView = "city";
        $$(".nav-item").forEach((button) =>
          button.classList.toggle("active", button.dataset.view === "city"),
        );
        renderMobileNav();
        renderCity();
        if (ctx.storyAdvanced) {
          const next = D.storyChapters.find(
            (chapter) => !state.story.completed.includes(chapter.id),
          );
          toast(
            next
              ? `Capítulo concluído. Capítulo ${next.id} liberado.`
              : "Campanha concluída.",
            "achievement",
          );
        }
      } else if (currentView === "arena") renderArena();
    }, delay(500));
  }

  function grantRewards(r) {
    if (r.gold) state.player.gold += r.gold;
    if (r.xp) addXp(r.xp);
    if (r.shards) state.player.shards += r.shards;
    if (r.energy)
      state.player.energy = Math.min(
        state.player.maxEnergy,
        state.player.energy + r.energy,
      );
    if (r.materials) {
      for (let i = 0; i < r.materials; i++) {
        const m = U.pick(
          D.materials.slice(0, Math.min(10, 3 + selectedRegion)),
        );
        state.player.materials[m] = (state.player.materials[m] || 0) + 1;
      }
    }
    (r.items || []).forEach(addItem);
    updateTopbar();
  }
  function addItem(item) {
    const cap = C.loot.maxInventory + hideoutBonus("storage") * 10;
    if (state.player.inventory.length >= cap) {
      state.player.gold += Math.floor(item.value * 0.35);
      toast(`${item.name} converted to gold because storage is full.`, "error");
      return;
    }
    state.player.inventory.push(item);
    updateMetricMissions("items", 1);
    if (["rare", "epic", "legendary", "mythic", "cursed"].includes(item.rarity))
      updateMetricMissions("rareLoot", 1);
  }
  function addXp(amount) {
    if (state.player.level >= C.maxLevel) return;
    state.player.xp += amount;
    while (state.player.level < C.maxLevel && state.player.xp >= xpNeeded()) {
      state.player.xp -= xpNeeded();
      levelUp();
    }
  }
  function levelUp() {
    state.player.level++;
    state.metrics.level = state.player.level;
    state.player.gold += 120 + state.player.level * 35;
    state.player.shards += state.player.level % 5 === 0 ? 2 : 0;
    state.player.maxEnergy =
      C.energy.baseMax +
      Math.floor(state.player.level / 5) * C.energy.perFiveLevels;
    state.player.energy = state.player.maxEnergy;
    state.player.health = derived().maxHealth;
    ensureUnlocks();
    renderSidebar();
    sfx("level");
    toast(
      `Nível ${state.player.level}! Um novo poder desperta em sua linhagem.`,
      "achievement",
    );
  }
  function finishArena(win) {
    const o = combat.context.opponent;
    state.arena.dailyBattles++;
    const change = win
      ? C.arena.ratingWin +
        Math.max(0, Math.floor((o.rating - state.arena.rating) / 70))
      : -C.arena.ratingLoss;
    state.arena.rating = Math.max(0, state.arena.rating + change);
    state.arena.streak = win ? state.arena.streak + 1 : 0;
    if (win) {
      updateMetricMissions("arenaWins", 1);
    }
    state.arena.history.push({
      name: o.name,
      win,
      ratingChange: change,
      date: Date.now(),
    });
    state.arena.opponents = state.arena.opponents.filter((x) => x.id !== o.id);
    state.arena.division = divisionFor(state.arena.rating);
  }
  function startArenaFight(id) {
    const o = state.arena.opponents.find((x) => x.id === id);
    if (!o) return;
    const enemy = {
      id: o.id,
      name: o.name,
      icon: D.factions[o.faction].emblem,
      type: `rival ${o.faction === "moonborn" ? "werewolf" : "vampire"}`,
      behavior:
        o.spec === "warden" || o.spec === "noble"
          ? "defensive"
          : o.spec === "stalker" || o.spec === "shadow"
            ? "fast"
            : "berserk",
      level: o.level,
      region: selectedRegion,
    };
    startCombat(enemy, {
      source: "arena",
      opponent: o,
      rewardMult: 1 + Math.max(0, (o.rating - state.arena.rating) / 1000),
    });
  }

  function showLootModal(r) {
    const items = r.items || [];
    openModal({
      title: r.title || "Rewards",
      wide: true,
      body: `<div class="grid grid-3"><div class="panel"><span class="eyebrow">EXPERIENCE</span><h2>${U.fmt(r.xp || 0)} XP</h2></div><div class="panel"><span class="eyebrow">GOLD</span><h2>${U.fmt(r.gold || 0)} ◈</h2></div><div class="panel"><span class="eyebrow">MATERIALS</span><h2>${r.materials || 0}</h2></div></div>${r.buffPercent ? `<div class="action-banner" style="margin-top:14px"><div><span class="eyebrow">BÔNUS DE RISCO</span><h3>+${r.buffPercent}% nas recompensas</h3><p>O buff do inimigo aumentou XP, ouro, materiais e a chance de saque desta vitória.</p></div><span class="pill">${Number(r.rewardMultiplier || 1).toFixed(2)}×</span></div>` : ""}${items.length ? `<h3 style="margin-top:18px">Loot</h3><div class="inventory-grid">${items.map(itemCard).join("")}</div>` : ""}`,
      actions: [{ label: "Collect", class: "btn-primary", action: "close" }],
    });
  }

  function syncMissionProgress() {
    state.missions.forEach((ms) => {
      const m = D.missions.find((x) => x.id === ms.id);
      if (!m || ms.claimed) return;
      ms.progress = Math.min(m.goal, state.metrics[m.metric] || 0);
    });
  }
  function updateMetricMissions(metric, amount) {
    state.metrics[metric] = (state.metrics[metric] || 0) + amount;
    syncMissionProgress();
  }
  function claimMission(id) {
    const ms = state.missions.find((x) => x.id === id),
      m = getMissionData(ms);
    if (!m || m.progress < m.goal || m.claimed) return;
    ms.claimed = true;
    grantRewards(m.rewards);
    toast(`Mission complete: ${m.title}`, "achievement");
    sfx("mission");
    renderMissions();
    saveGame();
  }
  function checkAchievements() {
    D.achievements.forEach((a) => {
      if (state.achievements[a.id]) return;
      if ((state.metrics[a.metric] || 0) >= a.goal) {
        state.achievements[a.id] = { date: Date.now() };
        grantRewards(a.rewards);
        toast(`Achievement unlocked: ${a.title}`, "achievement");
        sfx("achievement");
      }
    });
  }
  function getDailyObjectives() {
    return [
      {
        icon: "◒",
        title: "Complete two hunts",
        progress: Math.min(state.metrics.hunts % 3, 2),
        goal: 2,
        reward: "60 XP",
      },
      {
        icon: "⚔",
        title: "Win an Arena battle",
        progress: Math.min(
          state.arena.dailyBattles && state.arena.streak > 0 ? 1 : 0,
          1,
        ),
        goal: 1,
        reward: "100 gold",
      },
      {
        icon: "◆",
        title: "Find equipment",
        progress: Math.min(state.metrics.items % 3, 1),
        goal: 1,
        reward: "2 energy",
      },
    ];
  }

  function openItemDetail(id, equipped = false) {
    const item = equipped
      ? Object.values(state.player.equipment).find((i) => i?.id === id)
      : state.player.inventory.find((i) => i.id === id);
    if (!item) return;
    const equippedItem = item.slot ? state.player.equipment[item.slot] : null;
    const diff =
      equippedItem && equippedItem.id !== item.id
        ? comparePower(item) - comparePower(equippedItem)
        : null;
    const ench = item.enchantment && S ? S.getEnchantment(item.enchantment) : null;
    openModal({
      title: `${item.name}${item.upgrade ? ` +${item.upgrade}` : ""}`,
      wide: true,
      body: `<div class="detail-columns"><div class="detail-art rarity-${item.rarity}" style="--rarity:${rarityColors[item.rarity]}">${item.icon}</div><div><span class="pill">${ptLabel(item.rarity)}</span> <span class="pill">${item.slot ? slotLabels[item.slot] : "Consumível"}</span>${ench ? ` <span class="enchant-badge" style="color:${ench.color}">✦ ${esc(ench.name)}</span>` : ""}<p>${esc(item.flavor || "Um objeto útil da noite.")}</p>${ench ? `<p class="small" style="color:${ench.color}">Encantamento ativo: ${esc(ench.desc)}</p>` : ""}${diff !== null ? `<p class="${diff >= 0 ? "success-text" : "danger-text"}">${diff >= 0 ? "+" : ""}${diff} de poder total comparado ao equipado</p>` : ""}<div class="detail-stats">${
        Object.entries(item.stats || {})
          .map(
            ([k, v]) =>
              `<div class="detail-stat"><span>${ptLabel(k)}</span><b>+${v + (item.upgrade || 0)}</b></div>`,
          )
          .join("") ||
        `<div class="detail-stat"><span>Efeito</span><b>${esc(ptLabel(item.effect || "Usar"))}</b></div>`
      }</div><div class="modal-actions" style="justify-content:flex-start">${item.type === "consumable" ? `<button class="btn btn-primary" data-modal-action="use-item" data-payload="${item.id}">Usar</button>` : equipped ? `<button class="btn btn-ghost" data-modal-action="unequip-item" data-payload="${item.slot}">Desequipar</button>` : `<button class="btn btn-primary" data-modal-action="equip-item" data-payload="${item.id}">Equipar</button>`}${item.slot ? `<button class="btn btn-gold" data-modal-action="open-forge-item" data-payload="${item.id}">Forjar / Encantar</button>` : ""}<button class="btn btn-ghost" data-modal-action="favorite-item" data-payload="${item.id}">${item.favorite ? "Remover favorito" : "Favoritar"}</button><button class="btn btn-ghost" data-modal-action="lock-item" data-payload="${item.id}">${item.locked ? "Desbloquear" : "Bloquear"}</button>${!equipped ? `<button class="btn btn-danger" data-modal-action="sell-item" data-payload="${item.id}" ${item.locked ? "disabled" : ""}>Vender ${U.fmt(item.value || 10)} ouro</button>` : ""}</div></div></div>`,
    });
    const art = $(".detail-art", dom.modalRoot);
    if (art) art.innerHTML = itemArtwork(item);
  }
  function comparePower(i) {
    return (
      Object.values(i.stats || {}).reduce((s, v) => s + Number(v || 0), 0) +
      (i.upgrade || 0) * 5 +
      (i.enchantment ? 12 : 0)
    );
  }
  function equipItem(id) {
    const item = state.player.inventory.find((i) => i.id === id);
    if (!item || !item.slot) return;
    if (item.faction !== "any" && item.faction !== state.player.faction)
      return toast("Sua linhagem rejeita este item.", "error");
    const old = state.player.equipment[item.slot];
    state.player.inventory = state.player.inventory.filter((i) => i.id !== id);
    if (old) state.player.inventory.push(old);
    state.player.equipment[item.slot] = item;
    state.metrics.equips++;
    syncMissionProgress();
    closeModal();
    renderInventory();
    renderSidebar();
    updateTopbar();
    toast(`${item.name} equipado.`, "success");
    saveGame();
  }
  function unequipItem(slot) {
    const item = state.player.equipment[slot];
    if (!item) return;
    state.player.inventory.push(item);
    state.player.equipment[slot] = null;
    closeModal();
    renderInventory();
    renderSidebar();
    updateTopbar();
    saveGame();
  }
  function useItem(id) {
    const item = state.player.inventory.find((i) => i.id === id);
    if (!item) return;
    const d = derived();
    if (item.effect === "heal" || item.effect === "heal_cleanse")
      state.player.health = Math.min(
        d.maxHealth,
        state.player.health + (item.amount || 45),
      );
    else if (item.effect === "energy")
      state.player.energy = Math.min(
        state.player.maxEnergy,
        state.player.energy + (item.amount || 10),
      );
    else if (item.effect === "resource_heal") {
      state.player.health = Math.min(
        d.maxHealth,
        state.player.health + (item.amount || 40),
      );
      state.player.resource = U.clamp(
        state.player.resource + (item.resourceAmount || 40),
        0,
        100,
      );
    } else if (item.effect === "full_restore") {
      state.player.health = d.maxHealth;
      state.player.energy = Math.min(
        state.player.maxEnergy,
        state.player.energy + (item.energyAmount || 25),
      );
    }
    item.count = (item.count || 1) - 1;
    if (item.count <= 0)
      state.player.inventory = state.player.inventory.filter(
        (i) => i.id !== id,
      );
    closeModal();
    updateTopbar();
    renderInventory();
    toast(`${item.name} usado.`, "success");
    saveGame();
  }
  function sellItem(id) {
    const item = state.player.inventory.find((i) => i.id === id);
    if (!item || item.locked) return;
    state.player.gold += item.value || 10;
    state.player.inventory = state.player.inventory.filter((i) => i.id !== id);
    state.merchant.buyback.push(item);
    state.merchant.buyback = state.merchant.buyback.slice(-12);
    closeModal();
    renderInventory();
    updateTopbar();
    toast(`${item.name} vendido.`, "success");
    saveGame();
  }
  function toggleItemFlag(id, key) {
    let item =
      state.player.inventory.find((i) => i.id === id) ||
      Object.values(state.player.equipment).find((i) => i?.id === id);
    if (item) item[key] = !item[key];
    closeModal();
    renderInventory();
    saveGame();
  }

  function openMerchantItem(id) {
    const item = activeMerchantStock(merchantType).find((i) => i.id === id);
    if (!item) return;
    const discount = merchantDiscount();
    const price = Math.floor(item.price * (1 - discount));
    const locked = item.level > state.player.level;
    openModal({
      title: item.name,
      body: `<div class="detail-columns"><div class="detail-art" style="--rarity:${rarityColors[item.rarity]}">${item.icon}</div><div><span class="pill">${U.title(item.rarity)}</span><span class="pill">Nível ${item.level}</span><p>${esc(item.flavor)}</p>${locked ? `<p class="small" style="color:#ff9aa6">Bloqueado até o nível ${item.level}.</p>` : ""}<div class="detail-stats">${Object.entries(
        item.stats,
      )
        .map(
          ([k, v]) =>
            `<div class="detail-stat"><span>${ptLabel(k)}</span><b>+${v}</b></div>`,
        )
        .join(
          "",
        )}</div><h3 class="gold-text">${locked ? `Libera no nível ${item.level}` : `${U.fmt(price)} ouro`}</h3></div></div>`,
      actions: [
        { label: "Fechar", class: "btn-ghost", action: "close" },
        {
          label: locked ? `Nível ${item.level}` : "Comprar",
          class: locked ? "btn-ghost" : "btn-primary",
          action: "buy-merchant",
          payload: `${id}|${price}`,
          disabled: locked || state.player.gold < price,
        },
      ],
    });
    const art = $(".detail-art", dom.modalRoot);
    if (art) art.innerHTML = itemArtwork(item);
  }
  function buyMerchantItem(id, price) {
    const stock = activeMerchantStock(merchantType);
    const idx = stock.findIndex((i) => i.id === id);
    if (idx < 0 || state.player.gold < price) return;
    const item = stock[idx];
    if (item.level > state.player.level) return toast(`Esse item libera no nível ${item.level}.`, "error");
    stock.splice(idx, 1);
    delete item.price;
    delete item.stock;
    delete item.merchantType;
    delete item.lockedUntilLevel;
    state.player.gold -= price;
    addItem(item);
    closeModal();
    renderMerchant();
    updateTopbar();
    toast(`${item.name} comprado.`, "success");
    saveGame();
  }
  function buybackItem(id) {
    const idx = state.merchant.buyback.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const item = state.merchant.buyback[idx],
      price = Math.floor(item.value * 1.15);
    if (state.player.gold < price) return toast("Not enough gold.", "error");
    state.player.gold -= price;
    state.merchant.buyback.splice(idx, 1);
    addItem(item);
    renderMerchant();
    updateTopbar();
    saveGame();
  }

  function upgradeHideoutCore() {
    const level = state.hideoutCore?.level || 1;
    const cost = C.hideout.coreCost(level);
    if (level >= C.hideout.maxCoreLevel) return toast("O núcleo do esconderijo já está no nível máximo.", "error");
    if (state.player.gold < cost) return toast("Ouro insuficiente para fortalecer o núcleo.", "error");
    state.player.gold -= cost;
    state.hideoutCore = { level: level + 1 };
    state.metrics.hideoutUpgrades++;
    syncHealth();
    syncMissionProgress();
    toast(`Núcleo do esconderijo elevado ao nível ${level + 1}.`, "achievement");
    sfx("level");
    renderHideout();
    updateTopbar();
    saveGame();
  }

  function upgradeHideout(id) {
    const level = state.hideout[id] || 1,
      cost = C.hideout.cost(level);
    if (level >= C.hideout.maxStructureLevel || state.player.gold < cost)
      return;
    state.player.gold -= cost;
    state.hideout[id] = level + 1;
    state.metrics.hideoutUpgrades++;
    syncMissionProgress();
    if (
      D.hideout[state.player.faction].find((s) => s.id === id)?.bonus ===
      "storage"
    ) {
    }
    toast("The hideout changes around you.", "achievement");
    sfx("level");
    renderHideout();
    updateTopbar();
    saveGame();
  }

  function createClan() {
    const name = $("#clanName")?.value.trim(),
      motto = $("#clanMotto")?.value.trim(),
      emblem = $("#clanEmblem")?.value;
    if (!name) return toast("O clã precisa de um nome.", "error");
    state.clan = {
      name,
      motto: motto || "Resistimos ao que a lua esquece.",
      emblem,
      fortress: 1,
      strength: 350,
      donations: 0,
      victories: 0,
      dailyBattles: 0,
      lastBattleDay: U.dayKey(),
      rank: U.rand(300, 900),
      members: [],
      chat: [
        {
          name: "Eco da Fortaleza",
          icon: "⌂",
          text: "O salão reconhece um novo estandarte sob o Eclipse.",
        },
      ],
    };
    state.player.clan = name;
    renderClan();
    renderSidebar();
    saveGame();
  }
  function inviteClanMember() {
    const maxMembers = Math.min(12, 3 + (state.clan?.fortress || 1));
    if (state.clan.members.length >= maxMembers)
      return toast(
        `A fortaleza atual comporta no máximo ${maxMembers} companheiros. Doe para evoluí-la.`,
        "error",
      );
    if (state.player.gold < C.clan.recruitGold)
      return toast(`Você precisa de ${C.clan.recruitGold} ouro para recrutar um companheiro.`, "error");
    state.player.gold -= C.clan.recruitGold;
    const faction = state.player.faction,
      spec = U.pick(Object.keys(D.factions[faction].specs));
    const m = {
      name: `${U.pick(D.names.first)} ${U.pick(D.names.last)}`,
      level: U.clamp(state.player.level + U.rand(-2, 2), 1, 40),
      role: U.pick(["Batedor", "Guardião", "Intendente", "Ritualista", "Caçador"]),
      personality: U.pick([
        "Taciturno",
        "Leal",
        "Inquieto",
        "Erudito",
        "Audacioso",
      ]),
      gear: U.rand(90, 260) + state.player.level * 12,
      faction,
      spec,
    };
    state.clan.members.push(m);
    state.clan.strength += m.level * 14 + Math.round(m.gear * 0.45);
    state.clan.chat.push({
      name: m.name,
      icon: D.factions[faction].emblem,
      text: PT.translate(U.pick(D.chatLines)),
    });
    renderClan();
    updateTopbar();
    toast(`${m.name} juntou-se ao clã.`, "success");
    saveGame();
  }
  function clanDonate() {
    if (state.player.gold < 100) return toast("Ouro insuficiente.", "error");
    state.player.gold -= 100;
    state.clan.donations += 100;
    state.clan.strength += 35;
    state.metrics.clanDonations++;
    if (
      state.clan.fortress < C.clan.maxFortress &&
      state.clan.donations >= state.clan.fortress * 600
    ) {
      state.clan.fortress++;
      state.clan.chat.push({
        name: "Eco da Fortaleza",
        icon: "⌂",
        text: `A Fortaleza alcançou o nível ${state.clan.fortress}! Bônus passivos ampliados.`,
      });
      toast(`Fortaleza do Clã elevada ao nível ${state.clan.fortress}!`, "achievement");
    }
    syncHealth();
    syncMissionProgress();
    checkAchievements();
    renderClan();
    updateTopbar();
    saveGame();
  }
  function clanDonateShard() {
    if (state.player.shards < 1) return toast("Fragmentos insuficientes.", "error");
    state.player.shards -= 1;
    state.clan.donations += 300;
    state.clan.strength += 110;
    state.metrics.clanDonations++;
    if (
      state.clan.fortress < C.clan.maxFortress &&
      state.clan.donations >= state.clan.fortress * 600
    ) {
      state.clan.fortress++;
      state.clan.chat.push({
        name: "Eco da Fortaleza",
        icon: "⌂",
        text: `Um Fragmento do Eclipse elevou a Fortaleza ao nível ${state.clan.fortress}!`,
      });
    }
    syncHealth();
    syncMissionProgress();
    checkAchievements();
    renderClan();
    updateTopbar();
    toast("1 Fragmento doado ao cofre do clã (+300 doação, +110 força).", "success");
    saveGame();
  }
  function clanBattle(tier = "skirmish") {
    syncClanDaily();
    const rivals = S ? S.computeClanRivals(state, D) : [];
    const target = rivals.find((r) => r.tier === tier) || rivals[1] || {
      enemy: U.pick(D.names.clans),
      winChance: 0.55,
      goldReward: 180,
      strengthGain: 100,
      rankGain: 5,
    };
    const remaining = Math.max(0, C.clan.dailyBattleLimit - (state.clan.dailyBattles || 0));
    if (remaining === 0) {
      if (state.player.shards < C.clan.extraBattleShards) {
        return toast(
          `Limite diário atingido (${C.clan.dailyBattleLimit}/${C.clan.dailyBattleLimit}). Use ${C.clan.extraBattleShards} ✦ para um ataque extra.`,
          "error",
        );
      }
      state.player.shards -= C.clan.extraBattleShards;
    }
    state.clan.dailyBattles = (state.clan.dailyBattles || 0) + 1;
    const win = U.chance(target.winChance);
    if (win) {
      state.clan.victories++;
      state.clan.strength += target.strengthGain;
      state.player.gold += target.goldReward;
      const mat = U.pick(D.materials.slice(0, 8));
      state.player.materials[mat] = (state.player.materials[mat] || 0) + 1;
      state.clan.rank = Math.max(1, state.clan.rank - target.rankGain);
      toast(
        `Vitória contra ${target.enemy}! +${U.fmt(target.goldReward)} ouro e +1 ${materialLabels[mat] || mat}.`,
        "success",
      );
    } else {
      state.clan.strength = Math.max(120, state.clan.strength - 25);
      toast(`Derrota contra ${target.enemy}. Fortaleça a Fortaleza e recrute mais aliados.`, "error");
    }
    state.clan.chat.push({
      name: "Mesa de Guerra",
      icon: "⚔",
      text: `O confronto (${target.label || "Batalha"}) contra ${target.enemy} terminou em ${win ? "vitória" : "derrota"}.`,
    });
    renderClan();
    updateTopbar();
    saveGame();
  }

  function openBestiary(id) {
    const e =
        D.enemies.find((x) => x.id === id) || D.bosses.find((x) => x.id === id),
      entry = state.bestiary[id];
    if (!e || !entry) return;
    const weakText = (e.weaknesses || ["Heavy attacks"]).map((t) => (S ? S.labelTrait(t) : t)).join(", ");
    const resText = (e.resistances || ["Control"]).map((t) => (S ? S.labelTrait(t) : t)).join(", ");
    openModal({
      title: e.name,
      body: `<div class="detail-columns"><div class="detail-art">${bestiaryArtwork(e)}</div><div><span class="pill">${U.title(e.type)}</span><p>${esc(e.description)}</p><div class="list">${panelListItem("⌖", "Fraquezas (+28% dano)", weakText)}${panelListItem("⬟", "Resistências (-25% dano)", resText)}${panelListItem("⚔", "Habilidades conhecidas", (e.abilities || [e.signature]).map((x) => PT.translate(x)).join(", "))}${panelListItem("◆", "Saques possíveis", (e.drops || [e.exclusive || "Equipamento regional"]).join(", "))}</div></div></div>`,
      actions: [{ label: "Fechar", class: "btn-primary", action: "close" }],
    });
  }
  function readMessage(i) {
    const m = state.messages[i];
    if (!m) return;
    openModal({
      title: m.subject,
      body: `<span class="eyebrow">FROM ${esc(m.from).toUpperCase()}</span><p>${esc(m.body)}</p>`,
      actions: [{ label: "Fechar", class: "btn-primary", action: "close" }],
    });
  }

  function startStory(chapter) {
    const ch = D.storyChapters.find((c) => c.id === chapter);
    if (!ch) return;
    const choices = [
      {
        label:
          state.player.faction === "moonborn"
            ? "Follow the scent"
            : "Read the blood memory",
        flag: `chapter_${chapter}_instinct`,
        alignment: -1,
      },
      {
        label: "Protect the witness",
        flag: `chapter_${chapter}_mercy`,
        alignment: 2,
      },
      {
        label: "Negociar por conhecimento proibido",
        flag: `chapter_${chapter}_knowledge`,
        alignment: 0,
      },
    ];
    openModal({
      title: ch.title,
      body: `<p>${esc(ch.description)}</p><p>Sua abordagem influenciará os diálogos e as recompensas dos capítulos posteriores.</p><div class="event-choices">${choices.map((c, i) => `<button class="event-choice" data-modal-action="story-choice" data-payload="${chapter}|${i}"><strong>${esc(c.label)}</strong><small>Registrar esta abordagem na crônica.</small></button>`).join("")}</div>`,
    });
  }
  function chooseStory(chapter, index) {
    const flags = [
      `chapter_${chapter}_instinct`,
      `chapter_${chapter}_mercy`,
      `chapter_${chapter}_knowledge`,
    ];
    state.story.flags[flags[index]] = true;
    state.player.alignment += index === 1 ? 2 : index === 0 ? -1 : 0;
    closeModal();
    const boss = {
      ...D.bosses[Math.min(9, chapter === 6 ? 9 : chapter - 1)],
      level: Math.max(
        state.player.level,
        D.storyChapters.find((c) => c.id === chapter).level,
      ),
      boss: true,
    };
    startCombat(boss, {
      source: "story",
      chapter,
      region: boss.region,
      rewardMult: 1.6,
    });
  }
  function finishStoryCombat(chapter, win) {
    if (!win) return false;
    state.story.completed = [...new Set(
      (Array.isArray(state.story.completed) ? state.story.completed : [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id >= 1 && id <= D.storyChapters.length),
    )].sort((a, b) => a - b);

    let resolvedChapter = Number(chapter);
    if (!Number.isInteger(resolvedChapter) || resolvedChapter < 1 || resolvedChapter > D.storyChapters.length) {
      resolvedChapter = Number(state.story.chapter);
    }
    if (!Number.isInteger(resolvedChapter) || resolvedChapter < 1 || resolvedChapter > D.storyChapters.length) {
      resolvedChapter = D.storyChapters.find(
        (entry) => !state.story.completed.includes(entry.id),
      )?.id;
    }
    if (!resolvedChapter) return false;

    if (state.story.completed.includes(resolvedChapter)) {
      const nextExisting = D.storyChapters.find(
        (entry) => !state.story.completed.includes(entry.id),
      );
      state.story.chapter = nextExisting
        ? nextExisting.id
        : D.storyChapters.length;
      return false;
    }

    state.story.completed.push(resolvedChapter);
    state.story.completed.sort((a, b) => a - b);
    state.story.flags[`chapter_${resolvedChapter}_cleared`] = true;
    state.metrics.storyChapters = Math.max(
      Number(state.metrics.storyChapters) || 0,
      state.story.completed.length,
    );
    syncMissionProgress();

    const nextChapter = D.storyChapters.find(
      (entry) => !state.story.completed.includes(entry.id),
    );
    state.story.chapter = nextChapter
      ? nextChapter.id
      : D.storyChapters.length;
    state.player.shards += 2;
    state.messages.push({
      from:
        resolvedChapter < D.storyChapters.length
          ? "Unknown Witness"
          : "The Hollow Eclipse",
      icon: "◉",
      subject:
        resolvedChapter < D.storyChapters.length
          ? "A new path opens"
          : "The final echo",
      body:
        resolvedChapter < D.storyChapters.length
          ? "The evidence points farther into the night. Neither faction understands what it awakened."
          : "The rift remembers your choice. The war will never return to its old shape.",
      date: Date.now(),
    });
    if (resolvedChapter === D.storyChapters.length) {
      state.story.ending =
        state.player.alignment > 3
          ? "The Dawnless Accord"
          : state.player.alignment < -2
            ? "The Sovereign Hunger"
            : "The Balanced Night";
    }
    return true;
  }

  let forgeState = { tab: "upgrade", selectedId: null };

  function allForgeGear() {
    const eq = Object.values(state.player.equipment || {})
      .filter(Boolean)
      .map((item) => ({ item, equipped: true }));
    const bag = state.player.inventory
      .filter((i) => i.slot)
      .map((item) => ({ item, equipped: false }));
    return [...eq, ...bag];
  }

  function findForgeItem(id) {
    return allForgeGear().find((entry) => entry.item.id === id) || null;
  }

  function hasMaterials(need = {}, shards = 0, gold = 0) {
    if (state.player.gold < gold || state.player.shards < shards) return false;
    return Object.entries(need).every(
      ([m, qty]) => (state.player.materials[m] || 0) >= qty,
    );
  }

  function formatMaterialNeed(need = {}, shards = 0, gold = 0) {
    const parts = [];
    if (gold > 0) parts.push(`${U.fmt(gold)} ouro`);
    if (shards > 0) parts.push(`${shards} ✦`);
    Object.entries(need).forEach(([m, qty]) => {
      const own = state.player.materials[m] || 0;
      parts.push(`${materialLabels[m] || m} ${own}/${qty}`);
    });
    return parts.join(" • ");
  }

  function openForge(preselectId = null, tab = null) {
    const entries = allForgeGear();
    if (tab) forgeState.tab = tab;
    if (preselectId) forgeState.selectedId = preselectId;
    if (!forgeState.selectedId || !findForgeItem(forgeState.selectedId)) {
      forgeState.selectedId = entries[0]?.item.id || null;
    }
    const selectedEntry = forgeState.selectedId ? findForgeItem(forgeState.selectedId) : null;
    const lunar = currentLunar();
    const forgeDiscount =
      hideoutBonus("craftBonus") * 0.05 + (lunar.bonuses?.forgeDiscount || 0);

    const tabsHtml = `<div class="forge-tabs">
      <button type="button" class="tab ${forgeState.tab === "upgrade" ? "active" : ""}" data-modal-action="forge-tab" data-payload="upgrade">Aprimorar &amp; Reforjar</button>
      <button type="button" class="tab ${forgeState.tab === "enchant" ? "active" : ""}" data-modal-action="forge-tab" data-payload="enchant">Encantar (6)</button>
      <button type="button" class="tab ${forgeState.tab === "dismantle" ? "active" : ""}" data-modal-action="forge-tab" data-payload="dismantle">Desmontar</button>
    </div>`;

    let bodyContent = "";
    if (!entries.length) {
      bodyContent = '<p class="muted">Nenhum equipamento encontrado (equipado ou na mochila).</p>';
    } else if (forgeState.tab === "upgrade") {
      bodyContent = `<p class="small muted">Aprimore itens equipados ou na mochila com ouro e materiais, ou use <strong>1 ✦</strong> para Reforjar um atributo (desconto atual: ${Math.round(forgeDiscount * 100)}%).</p><div class="list">${entries
        .slice(0, 14)
        .map(({ item, equipped }) => {
          const goldCost = Math.max(
            1,
            Math.floor(C.crafting.upgradeGold(item.upgrade || 0) * (1 - forgeDiscount)),
          );
          const matReq = S ? S.materialForUpgrade(item.upgrade || 0) : { mat: "Iron", qty: 2 };
          const canUp = hasMaterials({ [matReq.mat]: matReq.qty }, 0, goldCost);
          const canReroll =
            state.player.gold >= C.crafting.rerollGold &&
            state.player.shards >= C.crafting.rerollShards;
          const ench = item.enchantment && S ? S.getEnchantment(item.enchantment) : null;
          return panelListItem(
            itemArtwork(item),
            `${esc(item.name)}${item.upgrade ? ` +${item.upgrade}` : ""}${equipped ? ' <span class="pill">Equipado</span>' : ""}${ench ? ` <span class="enchant-badge" style="color:${ench.color}">✦ ${esc(ench.short)}</span>` : ""}`,
            `Aprimorar: ${formatMaterialNeed({ [matReq.mat]: matReq.qty }, 0, goldCost)} • Reforjar: ${U.fmt(C.crafting.rerollGold)} ouro + ${C.crafting.rerollShards} ✦`,
            `<div class="forge-row-actions"><button class="btn btn-small btn-primary" data-modal-action="forge-upgrade" data-payload="${item.id}" ${canUp ? "" : "disabled"}>+1</button><button class="btn btn-small btn-gold" data-modal-action="forge-reroll" data-payload="${item.id}" ${canReroll ? "" : "disabled"}>Reforjar 1 ✦</button></div>`,
          );
        })
        .join("")}</div>`;
    } else if (forgeState.tab === "enchant") {
      const targetSelect = `<div class="forge-tabs">${entries
        .slice(0, 10)
        .map(
          ({ item, equipped }) =>
            `<button type="button" class="tab ${item.id === forgeState.selectedId ? "active" : ""}" data-modal-action="forge-select" data-payload="${item.id}">${esc(item.name)}${equipped ? " ★" : ""}</button>`,
        )
        .join("")}</div>`;
      const enchList = S ? S.ENCHANTMENTS : [];
      const curEnch = selectedEntry?.item.enchantment && S ? S.getEnchantment(selectedEntry.item.enchantment) : null;
      bodyContent = `<p class="small muted">Selecione um equipamento e aplique um encantamento permanente usando os 10 materiais da noite e Fragmentos (✦).</p>${targetSelect}${selectedEntry ? `<p class="small">Alvo atual: <strong>${esc(selectedEntry.item.name)}</strong>${curEnch ? ` • Atual: <span style="color:${curEnch.color}">${esc(curEnch.name)}</span>` : " • Sem encantamento"}</p>` : ""}<div class="enchant-grid">${enchList
        .map((ench) => {
          const goldCost = Math.max(1, Math.floor(ench.gold * (1 - forgeDiscount)));
          const ok = selectedEntry && hasMaterials(ench.cost, ench.shards, goldCost);
          return `<article class="enchant-card"><h4 style="color:${ench.color}">✦ ${esc(ench.name)}</h4><p>${esc(ench.desc)}</p><div class="enchant-cost">${formatMaterialNeed(ench.cost, ench.shards, goldCost)}</div><button type="button" class="btn btn-small btn-primary" data-modal-action="forge-enchant" data-payload="${selectedEntry?.item.id || ""}|${ench.id}" ${ok ? "" : "disabled"}>Aplicar Encantamento</button></article>`;
        })
        .join("")}</div>`;
    } else {
      const bagGear = entries.filter((e) => !e.equipped && !e.item.locked);
      bodyContent = `<p class="small muted">Desmontar itens da mochila extrai materiais conforme a raridade (itens Épicos+ têm 35% de chance de gerar <strong>+1 ✦</strong>).</p><div class="list">${bagGear
        .slice(0, 14)
        .map(({ item }) =>
          panelListItem(
            itemArtwork(item),
            esc(item.name),
            `${ptLabel(item.rarity)} • +${item.upgrade || 0}`,
            `<button class="btn btn-small btn-danger" data-modal-action="dismantle-item" data-payload="${item.id}">Desmontar</button>`,
          ),
        )
        .join("") || '<p class="muted">Nenhum equipamento desbloqueado na mochila para desmontar.</p>'}</div>`;
    }

    openModal({
      title: `Forja Negra • ${U.fmt(state.player.gold)} ◈ • ${state.player.shards} ✦`,
      wide: true,
      body: `${tabsHtml}${bodyContent}`,
      actions: [{ label: "Fechar", class: "btn-ghost", action: "close" }],
    });
  }
  function forgeUpgrade(id) {
    const entry = findForgeItem(id);
    if (!entry) return;
    const item = entry.item;
    const lunarDiscount = currentLunar().bonuses?.forgeDiscount || 0;
    const discount = hideoutBonus("craftBonus") * 0.05 + lunarDiscount;
    const cost = Math.max(
      1,
      Math.floor(C.crafting.upgradeGold(item.upgrade || 0) * (1 - discount)),
    );
    const matReq = S ? S.materialForUpgrade(item.upgrade || 0) : { mat: "Iron", qty: 2 };
    if (!hasMaterials({ [matReq.mat]: matReq.qty }, 0, cost))
      return toast("Ouro ou materiais insuficientes para aprimorar.", "error");
    state.player.gold -= cost;
    state.player.materials[matReq.mat] -= matReq.qty;
    const craftTier = hideoutBonus("craftBonus");
    if (craftTier > 0 && U.chance(Math.min(0.5, craftTier * 0.1))) {
      state.player.materials[matReq.mat] += 1;
      toast(`O esconderijo preservou 1 ${materialLabels[matReq.mat] || matReq.mat}.`, "info");
    }
    item.upgrade = (item.upgrade || 0) + 1;
    Object.keys(item.stats).forEach(
      (k) => (item.stats[k] = Math.ceil(item.stats[k] * 1.08)),
    );
    toast(`${item.name} aprimorado para +${item.upgrade}.`, "success");
    sfx("level");
    closeModal();
    openForge(id, "upgrade");
    updateTopbar();
    if (currentView === "inventory") renderInventory();
    saveGame();
  }
  function forgeReroll(id) {
    const entry = findForgeItem(id);
    if (!entry) return;
    const item = entry.item;
    if (
      state.player.gold < C.crafting.rerollGold ||
      state.player.shards < C.crafting.rerollShards
    )
      return toast("Ouro ou Fragmentos insuficientes para reforjar.", "error");
    state.player.gold -= C.crafting.rerollGold;
    state.player.shards -= C.crafting.rerollShards;
    const statPool = ["strength", "defense", "dexterity", "endurance", "perception", "luck", "armor"];
    const currentKeys = Object.keys(item.stats || {});
    const removeKey =
      currentKeys.find((k) => k !== "minDamage" && k !== "maxDamage") ||
      currentKeys[0];
    const baseVal = removeKey ? Number(item.stats[removeKey] || 2) : 2;
    const newKey = U.pick(statPool.filter((k) => k !== removeKey));
    if (removeKey && removeKey !== "minDamage" && removeKey !== "maxDamage") {
      delete item.stats[removeKey];
    }
    const rolledVal = Math.max(2, Math.ceil(baseVal * (1.05 + Math.random() * 0.25)));
    item.stats[newKey] = (item.stats[newKey] || 0) + rolledVal;
    toast(`${item.name} reforjado: +${rolledVal} ${ptLabel(newKey)}!`, "achievement");
    sfx("level");
    closeModal();
    openForge(id, "upgrade");
    updateTopbar();
    if (currentView === "inventory") renderInventory();
    saveGame();
  }
  function forgeEnchant(id, enchId) {
    const entry = findForgeItem(id);
    const ench = S ? S.getEnchantment(enchId) : null;
    if (!entry || !ench) return;
    const discount =
      hideoutBonus("craftBonus") * 0.05 + (currentLunar().bonuses?.forgeDiscount || 0);
    const goldCost = Math.max(1, Math.floor(ench.gold * (1 - discount)));
    if (!hasMaterials(ench.cost, ench.shards, goldCost))
      return toast("Recursos insuficientes para este encantamento.", "error");
    state.player.gold -= goldCost;
    state.player.shards -= ench.shards;
    Object.entries(ench.cost).forEach(([m, qty]) => {
      state.player.materials[m] -= qty;
    });
    entry.item.enchantment = ench.id;
    toast(`${entry.item.name} encantado com ${ench.name}!`, "achievement");
    sfx("level");
    closeModal();
    openForge(id, "enchant");
    updateTopbar();
    if (currentView === "inventory") renderInventory();
    saveGame();
  }
  function dismantleItem(id) {
    const item = state.player.inventory.find((i) => i.id === id);
    if (!item || item.locked) return;
    state.player.inventory = state.player.inventory.filter((i) => i.id !== id);
    const lunarBonus = currentLunar().bonuses?.dismantleBonus || 0;
    const mats = U.rand(1, 3) + (lunarBonus > 0 && U.chance(lunarBonus) ? 1 : 0);
    const pool = S ? S.dismantleMaterialPool(item.rarity) : D.materials.slice(0, 6);
    const gained = [];
    for (let j = 0; j < mats; j++) {
      const m = U.pick(pool);
      state.player.materials[m] = (state.player.materials[m] || 0) + 1;
      gained.push(materialLabels[m] || m);
    }
    let shardGain = 0;
    if (["epic", "legendary", "mythic", "cursed"].includes(item.rarity) && U.chance(0.35)) {
      state.player.shards += 1;
      shardGain = 1;
    }
    state.metrics.dismantles++;
    syncMissionProgress();
    checkAchievements();
    toast(
      `${item.name} desmontado em ${gained.join(", ")}${shardGain ? " + 1 ✦" : ""}.`,
      "success",
    );
    closeModal();
    openForge(null, "dismantle");
    updateTopbar();
    saveGame();
  }
  function openAlchemy() {
    const recipes = S ? S.ALCHEMY_RECIPES : [];
    openModal({
      title: "Escadaria do Alquimista",
      wide: true,
      body: `<p>Prepare tônicos, elixires de energia e destilados lendários usando todos os 10 materiais noturnos e Fragmentos (✦).</p><div class="list">${recipes
        .map((r) => {
          const ok = hasMaterials(r.need, r.shards, 0);
          return panelListItem(
            r.icon,
            `${esc(r.name)} <span class="pill">${ptLabel(r.rarity)}</span>`,
            `${esc(r.desc)} • ${formatMaterialNeed(r.need, r.shards, 0)}`,
            `<button class="btn btn-small btn-primary" data-modal-action="craft-recipe" data-payload="${r.id}" ${ok ? "" : "disabled"}>Preparar</button>`,
          );
        })
        .join("")}</div>`,
      actions: [{ label: "Fechar", class: "btn-ghost", action: "close" }],
    });
  }
  function craft(type) {
    const r = (S?.ALCHEMY_RECIPES || []).find((x) => x.id === type);
    if (!r) return;
    if (!hasMaterials(r.need, r.shards, 0))
      return toast("Materiais ou Fragmentos insuficientes.", "error");
    state.player.shards -= r.shards || 0;
    Object.entries(r.need).forEach(([m, n]) => (state.player.materials[m] -= n));
    const craftTier = hideoutBonus("craftBonus");
    if (craftTier > 0 && U.chance(Math.min(0.5, craftTier * 0.1))) {
      const refunded = U.pick(Object.keys(r.need));
      state.player.materials[refunded] = (state.player.materials[refunded] || 0) + 1;
      toast(`O esconderijo preservou 1 ${materialLabels[refunded] || refunded}.`, "info");
    }
    const existing = state.player.inventory.find((i) => i.name === r.item.name);
    if (existing) existing.count = (existing.count || 1) + 1;
    else
      state.player.inventory.push({
        id: U.uid("cons"),
        type: "consumable",
        icon: r.icon,
        rarity: r.rarity || "uncommon",
        count: 1,
        locked: false,
        favorite: false,
        ...r.item,
      });
    state.metrics.crafts++;
    syncMissionProgress();
    checkAchievements();
    toast(`${r.item.name} preparado!`, "success");
    sfx("level");
    closeModal();
    openAlchemy();
    updateTopbar();
    saveGame();
  }

  function openLunarModal() {
    if (!state || !S) return;
    const current = currentLunar();
    openModal({
      title: `Ciclo Lunar • ${current.name}`,
      wide: true,
      body: `<p>O ciclo muda automaticamente a cada 3 horas${current.overridden ? ` (ritual ativo por mais <strong>${current.remainingMin} min</strong>)` : ` (próxima fase em ~${current.nextChangeMin} min)`}. Você pode invocar qualquer fase por 30 minutos gastando <strong>${C.crafting.lunarRitualShards} Fragmento (✦)</strong>.</p><div class="lunar-phase-grid">${S.LUNAR_PHASES.map(
        (ph) => `<article class="lunar-phase-card ${ph.id === current.id ? "active" : ""}"><div><h4 style="color:${ph.color}">${ph.glyph} ${esc(ph.name)}</h4><small>${esc(ph.summary)}</small></div><button type="button" class="btn btn-small ${ph.id === current.id ? "btn-ghost" : "btn-gold"}" data-modal-action="invoke-lunar" data-payload="${ph.id}" ${ph.id === current.id || state.player.shards < C.crafting.lunarRitualShards ? "disabled" : ""}>${ph.id === current.id ? "Ativa" : `Invocar ${C.crafting.lunarRitualShards} ✦`}</button></article>`,
      ).join("")}</div>`,
      actions: [{ label: "Fechar", class: "btn-primary", action: "close" }],
    });
  }

  function invokeLunarPhase(phaseId) {
    if (!S || state.player.shards < C.crafting.lunarRitualShards)
      return toast("Fragmentos insuficientes para o ritual lunar.", "error");
    const phase = S.LUNAR_PHASES.find((p) => p.id === phaseId);
    if (!phase) return;
    state.player.shards -= C.crafting.lunarRitualShards;
    state.lunarOverride = { phaseId: phase.id, until: Date.now() + 30 * 60 * 1000 };
    syncHealth();
    updateTopbar();
    closeModal();
    toast(`Ritual concluído: ${phase.name} invocada por 30 minutos!`, "achievement");
    sfx("transform");
    if (currentView === "overview") renderOverview();
    if (currentView === "hideout") renderHideout();
    saveGame();
  }

  function refillEnergyWithShard() {
    if (state.player.shards < C.crafting.energyRefillShards)
      return toast("Fragmentos insuficientes.", "error");
    if (state.player.energy >= state.player.maxEnergy)
      return toast("Sua energia já está cheia.", "info");
    state.player.shards -= C.crafting.energyRefillShards;
    state.player.energy = Math.min(
      state.player.maxEnergy,
      state.player.energy + C.crafting.energyRefillAmount,
    );
    updateTopbar();
    if (currentView === "overview") renderOverview();
    sfx("level");
    toast(`+${C.crafting.energyRefillAmount} Energia restaurada com 1 ✦.`, "success");
    saveGame();
  }

  function refreshMerchantWithShard() {
    if (state.player.shards < C.crafting.merchantRefreshShards)
      return toast("Fragmentos insuficientes.", "error");
    state.player.shards -= C.crafting.merchantRefreshShards;
    refreshMerchant(true);
    updateTopbar();
    renderMerchant();
    sfx("level");
    toast("Todos os lojistas renovaram seus estoques!", "success");
    saveGame();
  }

  function openDaily() {
    if (!state) return;
    const today = U.dayKey(),
      last = state.daily.lastClaim,
      claimed = last === today;
    const dayIndex = state.daily.streak % 7;
    openModal({
      title: "Sete Noites de Tributo",
      wide: true,
      body: `<p>Resgate uma recompensa por dia local. Um dia perdido consome a tolerância antes de reiniciar o ciclo.</p><div class="daily-grid">${C.dailyRewards.map((r, i) => `<div class="daily-day ${i === dayIndex ? "current" : ""} ${i < dayIndex ? "claimed" : ""}"><strong>Noite ${i + 1}</strong><div class="reward">${iconSvg(r.icon)}</div><small>${r.amount} ${ptLabel(r.type)}</small></div>`).join("")}</div>`,
      actions: [
        { label: "Fechar", class: "btn-ghost", action: "close" },
        {
          label: claimed ? "Resgatada hoje" : "Resgatar recompensa",
          class: "btn-gold",
          action: "claim-daily",
          disabled: claimed,
        },
      ],
    });
  }
  function claimDaily() {
    const today = U.dayKey();
    if (state.daily.lastClaim === today) return;
    const last = state.daily.lastClaim ? new Date(state.daily.lastClaim) : null;
    let gap = 1;
    if (last) {
      const now = new Date();
      gap = Math.floor(
        (new Date(now.getFullYear(), now.getMonth(), now.getDate()) -
          new Date(last.getFullYear(), last.getMonth(), last.getDate())) /
          86400000,
      );
    }
    if (gap > 1) {
      if (state.daily.grace > 0) state.daily.grace--;
      else state.daily.streak = 0;
    }
    const reward = C.dailyRewards[state.daily.streak % 7];
    if (reward.type === "gold") grantRewards({ gold: reward.amount });
    if (reward.type === "energy") grantRewards({ energy: reward.amount });
    if (reward.type === "shards") grantRewards({ shards: reward.amount });
    if (reward.type === "item")
      addItem(
        D.createItem(U.pick(D.itemTemplates), state.player.level, "rare"),
      );
    if (reward.type === "consumable") {
      const item = {
        id: U.uid("cons"),
        name: "Eclipse Elixir",
        type: "consumable",
        icon: "⚗",
        rarity: "rare",
        effect: "heal",
        amount: 85,
        value: 80,
        count: 1,
        flavor: "A rare elixir condensed from eclipse rain.",
      };
      state.player.inventory.push(item);
    }
    state.daily.lastClaim = today;
    state.daily.streak++;
    closeModal();
    toast("Daily tribute claimed.", "achievement");
    saveGame();
  }

  function openSaveSlots() {
    const cards = [1, 2, 3]
      .map((i) => {
        const s = normalizeState(
          U.safeParse(localStorage.getItem(saveKey(i)), null),
        );
        return `<div class="panel"><h3>Crônica ${i}</h3>${s ? `<p><strong>${esc(s.player.name)}</strong><br>${D.factions[s.player.faction].name} • Nível ${s.player.level}<br><span class="muted small">${new Date(s.updatedAt).toLocaleString("pt-BR")}</span></p><button class="btn btn-ghost btn-small" data-modal-action="load-slot" data-payload="${i}">Carregar</button> <button class="btn btn-primary btn-small" data-modal-action="save-slot" data-payload="${i}">Sobrescrever</button>` : `<p class="muted">Crônica vazia.</p><button class="btn btn-primary btn-small" data-modal-action="save-slot" data-payload="${i}">Salvar aqui</button>`}</div>`;
      })
      .join("");
    openModal({
      title: "Save Slots",
      wide: true,
      body: `<div class="grid grid-3">${cards}</div>`,
    });
  }
  function saveToSlot(slot) {
    state.activeSlot = slot;
    saveGame(true);
    closeModal();
  }
  function loadSlot(slot) {
    if (loadGame(slot)) {
      closeModal();
      applyFactionTheme();
      enterGame();
      toast(`Crônica ${slot} carregada.`, "success");
    }
  }
  function exportSave() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `noctis-eclipse-${state.player.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Crônica exportada.", "success");
  }
  function importSaveFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = normalizeState(U.safeParse(reader.result, null));
      if (!parsed)
        return toast("Este arquivo de salvamento é inválido ou está corrompido.", "error");
      state = parsed;
      state.activeSlot = Number(localStorage.getItem("wb_active_slot")) || 1;
      saveGame();
      applyFactionTheme();
      enterGame();
      toast("Crônica importada com segurança.", "success");
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  function confirmReset() {
    openModal({
      title: "Apagar a crônica?",
      body: "<p>Isso apaga o espaço de salvamento ativo. Exporte o arquivo antes caso queira recuperá-lo depois.</p>",
      actions: [
        { label: "Cancelar", class: "btn-ghost", action: "close" },
        { label: "Apagar salvamento", class: "btn-danger", action: "confirm-reset" },
      ],
    });
  }
  function resetGame() {
    localStorage.removeItem(saveKey());
    state = null;
    closeModal();
    showScreen("opening");
    $("#continueBtn").disabled = !hasAnySave();
    toast("A crônica ativa foi apagada.", "success");
  }
  function toggleFullscreen() {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  function openStaticModal(type) {
    if (type === "credits")
      openModal({
        title: "Créditos",
        body: "<p><strong>Noctis Eclipse</strong> é um RPG de navegador original de fantasia sombria. Mundo, personagens, facções, sistemas, interface, ilustrações procedurais e narrativa foram criados originalmente para este projeto.</p><p>Entre no Eclipse Oco. Escolha o que sobreviverá.</p>",
        actions: [{ label: "Fechar", class: "btn-primary", action: "close" }],
      });
    else if (type === "settings") {
      if (state) navigate("settings");
      else
        openModal({
          title: "Configurações iniciais",
          body: "<p>O áudio começa somente após uma interação. Música e sons podem ser silenciados pelo botão de nota. Movimento reduzido e opções de acessibilidade ficam disponíveis dentro de uma crônica.</p>",
          actions: [{ label: "Fechar", class: "btn-primary", action: "close" }],
        });
    }
  }
  function openModal({ title, body, actions = [], wide = false }) {
    modalReturnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dom.modalRoot.classList.add("open");
    dom.modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-action="close"></div><div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><button class="icon-btn modal-close" data-modal-action="close">×</button><h2>${title}</h2>${body}${actions.length ? `<div class="modal-actions">${actions.map((a) => `<button class="btn ${a.class || "btn-ghost"}" data-modal-action="${a.action}" ${a.payload !== undefined ? `data-payload="${esc(a.payload)}"` : ""} ${a.disabled ? "disabled" : ""}>${a.label}</button>`).join("")}</div>` : ""}</div>`;
    const closeButton = $(".modal-close", dom.modalRoot);
    if (closeButton) closeButton.setAttribute("aria-label", "Close dialog");
    requestAnimationFrame(() => closeButton?.focus());
  }
  function closeModal() {
    dom.modalRoot.classList.remove("open");
    dom.modalRoot.innerHTML = "";
    if (modalReturnFocus?.isConnected) modalReturnFocus.focus();
    modalReturnFocus = null;
  }
  function handleModalClick(e) {
    const b = e.target.closest("[data-modal-action]");
    if (!b) return;
    const a = b.dataset.modalAction,
      p = b.dataset.payload;
    sfx("click");
    if (a === "close") return closeModal();
    if (a === "create-character") {
      const data = JSON.parse(decodeURIComponent(p));
      state = createState(data);
      saveGame();
      closeModal();
      enterGame();
      if (state.settings.tutorials) setTimeout(openTutorial, 350);
      return;
    }
    if (a === "upgrade-confirm") {
      const [attr, amount, cost] = p.split("|");
      if (state.player.gold >= Number(cost)) {
        state.player.gold -= Number(cost);
        state.player.attributes[attr] += Number(amount);
        state.metrics.attributeUpgrades += Number(amount);
        syncMissionProgress();
        closeModal();
        renderCharacter();
        updateTopbar();
        toast(`${U.title(attr)} increased.`, "success");
        saveGame();
      }
      return;
    }
    if (a === "equip-item") return equipItem(p);
    if (a === "unequip-item") return unequipItem(p);
    if (a === "use-item") return useItem(p);
    if (a === "favorite-item") return toggleItemFlag(p, "favorite");
    if (a === "lock-item") return toggleItemFlag(p, "locked");
    if (a === "sell-item") return sellItem(p);
    if (a === "buy-merchant") {
      const [id, price] = p.split("|");
      return buyMerchantItem(id, Number(price));
    }
    if (a === "story-choice") {
      const [chapter, index] = p.split("|");
      return chooseStory(Number(chapter), Number(index));
    }
    if (a === "open-forge-item") return openForge(p, "upgrade");
    if (a === "forge-tab") return openForge(forgeState.selectedId, p);
    if (a === "forge-select") return openForge(p, "enchant");
    if (a === "forge-upgrade") return forgeUpgrade(p);
    if (a === "forge-reroll") return forgeReroll(p);
    if (a === "forge-enchant") {
      const [itemId, enchId] = p.split("|");
      return forgeEnchant(itemId, enchId);
    }
    if (a === "dismantle-item") return dismantleItem(p);
    if (a === "craft-recipe") return craft(p);
    if (a === "craft-tonic") return craft("tonic");
    if (a === "craft-energy") return craft("energy");
    if (a === "invoke-lunar") return invokeLunarPhase(p);
    if (a === "claim-daily") return claimDaily();
    if (a === "save-slot") return saveToSlot(Number(p));
    if (a === "load-slot") return loadSlot(Number(p));
    if (a === "confirm-reset") return resetGame();
  }
  function openTutorial() {
    openModal({
      title: "The First Night",
      body: `<div class="list">${panelListItem("◒", "1. Hunt", "Spend energy in Blackthorn Village and resolve an event.")}${panelListItem("⚔", "2. Fight", "Choose attacks, defense, abilities and faction power.")}${panelListItem("▦", "3. Equip", "Inspect loot in Inventory and equip it.")}${panelListItem("▲", "4. Grow", "Upgrade an attribute and claim tutorial missions.")}</div><p>Your first three tutorial missions track these actions automatically.</p>`,
      actions: [{ label: "Begin", class: "btn-primary", action: "close" }],
    });
  }

  function toast(message, type = "") {
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.textContent = message;
    dom.toastRoot.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      setTimeout(() => t.remove(), 250);
    }, 3200);
  }
  function showTooltip(el, e) {
    dom.tooltip.textContent = el.dataset.tooltip;
    dom.tooltip.classList.add("show");
    positionTooltip(e);
  }
  function positionTooltip(e) {
    dom.tooltip.style.left = `${Math.min(innerWidth - 280, e.clientX + 14)}px`;
    dom.tooltip.style.top = `${Math.min(innerHeight - 80, e.clientY + 14)}px`;
  }

  function setupParticles(reset = false) {
    const canvas = dom.particleCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reset || !particles.length)
      particles = Array.from(
        { length: Math.min(120, Math.floor(innerWidth / 12)) },
        () => ({
          x: Math.random() * innerWidth,
          y: Math.random() * innerHeight,
          s: Math.random() * 1.8 + 0.3,
          v: Math.random() * 0.45 + 0.12,
          drift: Math.random() * 0.22 - 0.11,
          a: Math.random() * 0.38 + 0.08,
        }),
      );
    cancelAnimationFrame(particleFrame);
    const draw = (time) => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (
        !document.hidden &&
        !document.body.classList.contains("reduced-motion")
      ) {
        particles.forEach((p) => {
          p.y += p.v;
          p.x += p.drift;
          if (p.y > innerHeight) {
            p.y = -4;
            p.x = Math.random() * innerWidth;
          }
          ctx.fillStyle = `rgba(${state?.player?.faction === "bloodbound" ? "166,39,57" : "182,197,221"},${p.a})`;
          ctx.fillRect(p.x, p.y, p.s, p.s * 2.6);
        });
        if (time - lastLightning > U.rand(9000, 17000)) {
          lastLightning = time;
          dom.lightning.classList.add("flash");
          setTimeout(() => dom.lightning.classList.remove("flash"), 280);
          sfx("thunder", 0.18);
        }
      }
      particleFrame = requestAnimationFrame(draw);
    };
    particleFrame = requestAnimationFrame(draw);
  }

  function ensureAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  function sfx(type, volume = 1) {
    if (state?.settings.mute) return;
    try {
      ensureAudio();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const now = audioCtx.currentTime,
        g = audioCtx.createGain(),
        o = audioCtx.createOscillator();
      const base =
        {
          click: 180,
          attack: 95,
          critical: 62,
          block: 240,
          dodge: 420,
          level: 520,
          loot: 640,
          transform: 48,
          mission: 390,
          achievement: 720,
          ability: 150,
          thunder: 38,
        }[type] || 160;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(
        (state?.settings.sfxVolume ?? 0.35) * 0.16 * volume,
        now + 0.008,
      );
      g.gain.exponentialRampToValueAtTime(
        0.0001,
        now + (type === "thunder" ? 1.1 : 0.2),
      );
      o.type =
        type === "critical" || type === "transform"
          ? "sawtooth"
          : type === "level" || type === "achievement"
            ? "triangle"
            : "sine";
      o.frequency.setValueAtTime(base, now);
      o.frequency.exponentialRampToValueAtTime(
        Math.max(20, base * (type === "dodge" ? 1.8 : 0.55)),
        now + (type === "thunder" ? 0.9 : 0.18),
      );
      o.connect(g).connect(audioCtx.destination);
      o.start(now);
      o.stop(now + (type === "thunder" ? 1.2 : 0.22));
    } catch (err) {
      console.warn("Audio unavailable", err);
    }
  }
  function startAmbience() {
    if (!state || state.settings.mute || ambienceNodes.length) return;
    try {
      ensureAudio();
      const gain = audioCtx.createGain();
      gain.gain.value = state.settings.musicVolume * 0.06;
      const o1 = audioCtx.createOscillator(),
        o2 = audioCtx.createOscillator();
      o1.type = "sine";
      o2.type = "triangle";
      o1.frequency.value = 46;
      o2.frequency.value = 69;
      o1.detune.value = -7;
      o2.detune.value = 5;
      o1.connect(gain);
      o2.connect(gain);
      gain.connect(audioCtx.destination);
      o1.start();
      o2.start();
      ambienceNodes = [o1, o2, gain];
    } catch {}
  }
  function stopAmbience() {
    ambienceNodes.forEach((n) => {
      try {
        n.stop?.();
        n.disconnect?.();
      } catch {}
    });
    ambienceNodes = [];
  }
  function restartAmbience() {
    stopAmbience();
    startAmbience();
  }
  function toggleMute() {
    if (state) {
      state.settings.mute = !state.settings.mute;
      if (state.settings.mute) stopAmbience();
      else startAmbience();
      saveGame();
    } else {
      window.__openingMute = !window.__openingMute;
    }
    updateMuteIcons();
    sfx("click");
  }
  function updateMuteIcons() {
    const muted = state?.settings.mute || window.__openingMute;
    ["muteBtn", "muteBtnOpening"].forEach((id) => {
      const e = $(`#${id}`);
      if (e) e.innerHTML = Icons.svg(muted ? "audioOff" : "audioOn");
    });
  }

  init();
})();
