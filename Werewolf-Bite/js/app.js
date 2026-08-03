(() => {
  "use strict";
  const C = window.WB_CONFIG;
  const D = window.WB_DATA;
  const U = window.WB_UTIL;
  const Art = window.WB_CHARACTER_ART;
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
    weapon: "Weapon",
    secondary: "Secondary Weapon",
    head: "Head",
    chest: "Chest",
    hands: "Hands",
    legs: "Legs",
    feet: "Feet",
    amulet: "Amulet",
    ring1: "Ring 1",
    ring2: "Ring 2",
    relic: "Relic",
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
    $("#saveImportInput").addEventListener("change", importSaveFile);
    dom.mainNav.addEventListener("click", handleNav);
    dom.mobileNav.addEventListener("click", handleNav);
    dom.viewRoot.addEventListener("click", handleViewClick);
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

  function setupCreator() {
    const fill = (sel, values) => {
      $(sel).innerHTML = values
        .map(
          (v) =>
            '<option value="' +
            esc(v.toLowerCase()) +
            '">' +
            esc(v) +
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
    const fields = {
      hairSelect: "hair",
      beardSelect: "beards",
      skinSelect: "skin",
      eyeSelect: "eyes",
      eyeGlowSelect: "eyeGlow",
      hairColorSelect: "hairColor",
      markingSelect: "markings",
      outfitSelect: "outfits",
      accessorySelect: "accessories",
      metalSelect: "metals",
      accentSelect: "accents",
      backgroundSelect: "backgrounds",
    };
    Object.entries(fields).forEach(([id, key]) =>
      fill("#" + id, D.appearance[key]),
    );
    fillPortraits("moonborn", Art.defaultAppearance("moonborn").portrait);
    setCreatorAppearance(Art.defaultAppearance("moonborn"));
    $$('[data-choice="faction"]').forEach((b) =>
      b.addEventListener("click", () => {
        $$('[data-choice="faction"]').forEach((x) => {
          x.classList.toggle("active", x === b);
          x.setAttribute("aria-pressed", String(x === b));
        });
        const nextAppearance = Art.defaultAppearance(b.dataset.value);
        fillPortraits(b.dataset.value, nextAppearance.portrait);
        setCreatorAppearance(nextAppearance);
        updateCreator();
        sfx("click");
      }),
    );
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
      e.currentTarget.setAttribute(
        "aria-pressed",
        String(creatorPortraitMode === "bust"),
      );
      e.currentTarget.textContent =
        creatorPortraitMode === "bust" ? "◉ Full figure" : "◎ Portrait focus";
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
      hair: "hairSelect",
      beard: "beardSelect",
      skin: "skinSelect",
      eyes: "eyeSelect",
      eyeGlow: "eyeGlowSelect",
      hairColor: "hairColorSelect",
      marking: "markingSelect",
      outfit: "outfitSelect",
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
      hair: $("#hairSelect").value,
      beard: $("#beardSelect").value,
      skin: $("#skinSelect").value,
      eyes: $("#eyeSelect").value,
      eyeGlow: $("#eyeGlowSelect").value,
      hairColor: $("#hairColorSelect").value,
      marking: $("#markingSelect").value,
      outfit: $("#outfitSelect").value,
      accessory: $("#accessorySelect").value,
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
          esc(s.name) +
          "</option>",
      )
      .join("");
    const data = creatorData();
    const spec = f.specs[data.spec] || Object.values(f.specs)[0];
    $("#creatorPortrait").innerHTML = characterSVG(
      { ...data, faction },
      creatorPortraitMode,
    );
    $("#creatorFactionLore").innerHTML =
      '<strong class="accent">' + f.name + "</strong><br>" + f.lore;
    $("#specDescription").innerHTML =
      "<strong>" +
      spec.icon +
      " " +
      spec.name +
      "</strong><br>" +
      spec.description;
    $("#creatorFactionSeal").textContent = f.emblem;
    $("#creatorPreviewBloodline").textContent = f.name + " • " + spec.name;
    $("#creatorPreviewName").textContent = data.name || "Unnamed Scion";
    $("#creatorLookSummary").textContent = Art.describe(data);
    const badgeValues = [
      data.appearance.body,
      data.appearance.hair,
      data.appearance.outfit,
      data.appearance.accessory,
    ].filter((v) => v && v !== "none");
    $("#creatorLookBadges").innerHTML = badgeValues
      .map((v) => '<span class="look-badge">' + esc(U.title(v)) + "</span>")
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
    const coreTier = Math.max(0, (state?.hideoutCore?.level || 1) - 1);
    const healthMult = 1 + coreTier * C.hideout.coreBonuses.healthPerLevel;
    const damageMult = 1 + coreTier * C.hideout.coreBonuses.damagePerLevel;
    const armorMult = 1 + coreTier * C.hideout.coreBonuses.armorPerLevel;
    return {
      maxHealth: Math.floor((90 + endurance * 9 + p.level * 6) * healthMult),
      minDamage: Math.floor((weaponMin + strength * 1.9 + p.level * 0.6) * damageMult),
      maxDamage: Math.floor((weaponMax + strength * 2.6 + p.level * 0.9) * damageMult),
      armor: Math.floor((armorBonus + defense * 2.4 + p.level * 0.7) * armorMult),
      accuracy: U.clamp(
        0.72 +
          perception * 0.012 +
          dexterity * 0.004 +
          hideoutBonus("accuracyBonus") * 0.01,
        0.68,
        0.98,
      ),
      evasion: U.clamp(0.035 + dexterity * 0.008 + luck * 0.002, 0.03, 0.42),
      critChance: U.clamp(0.04 + luck * 0.007 + perception * 0.002, 0.04, 0.5),
      critDamage: 1.5 + luck * 0.025,
      blockChance: U.clamp(0.025 + defense * 0.005, 0.02, C.combat.maxBlock),
      initiative: dexterity * 2 + perception + luck * 0.4,
      regeneration: Math.floor(
        1 + endurance * 0.18 + hideoutBonus("healthRegen"),
      ),
      resourceGeneration: 1 + fBonus * 0.08,
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
  function updateEnergy() {
    if (!state) return false;
    const now = Date.now();
    const regenMs = Math.max(
      10000,
      C.energy.regenSeconds *
        1000 *
        (1 - hideoutBonus("trainingDiscount") * 0.025),
    );
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
    if (state.player.energy >= state.player.maxEnergy) return "full";
    const regenMs = C.energy.regenSeconds * 1000;
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
  }
  function renderSidebar() {
    const p = state.player,
      f = D.factions[p.faction];
    dom.sidebarProfile.innerHTML = `<div class="mini-profile"><div class="mini-avatar">${characterSVG(p, "mini")}</div><div><h3>${esc(p.name)}</h3><p>Lv. ${p.level} ${esc(f.specs[p.spec].name)}</p></div><div class="mini-xp"><span style="width:${U.clamp((p.xp / xpNeeded()) * 100, 0, 100)}%"></span></div></div>`;
  }
  function renderMobileNav() {
    const items = [
      ["overview", "⌂", "Home"],
      ["hunt", "◒", "Hunt"],
      ["arena", "⚔", "Arena"],
      ["inventory", "▦", "Gear"],
      ["more", "☰", "More"],
    ];
    dom.mobileNav.innerHTML = items
      .map(
        ([v, i, l]) =>
          `<button data-view="${v}" class="${currentView === v ? "active" : ""}"><span>${i}</span>${l}</button>`,
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
    return `<div class="list-item"><div class="icon-tile">${icon}</div><div class="grow"><h4>${title}</h4><p>${sub}</p></div>${right}</div>`;
  }

  function renderOverview() {
    const p = state.player,
      d = derived(),
      f = D.factions[p.faction],
      spec = f.specs[p.spec],
      activeMissions = getActiveMissions().slice(0, 3),
      recent = state.combatHistory.slice(-3).reverse();
    const moonPhases = [
      "New Moon",
      "Waxing Crescent",
      "First Quarter",
      "Waxing Gibbous",
      "Full Moon",
      "Waning Gibbous",
      "Last Quarter",
      "Waning Crescent",
    ];
    const phase = moonPhases[Math.floor(Date.now() / 86400000) % 8];
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Overview", "Your bloodline, immediate objectives and the living state of the night.", `<button class="btn btn-primary" data-action="go-hunt">Begin a Hunt</button>`)}
      <div class="grid grid-3"><section class="panel hero-panel" style="grid-column:span 2"><div class="portrait-stage hero-portrait">${characterSVG(p)}</div><div class="hero-copy"><div class="title-row"><span class="pill">${f.emblem} ${f.name}</span><span class="pill">${spec.icon} ${spec.name}</span></div><h2>${esc(p.name)}</h2><div class="muted">Level ${p.level} • Rank #${U.fmt(p.rank)} • ${esc(p.clan || "Clanless")}</div>
      <div class="bars"><div class="bar-row"><span>Health</span><div class="bar hp"><span style="width:${(p.health / d.maxHealth) * 100}%"></span></div><b>${Math.ceil(p.health)}/${d.maxHealth}</b></div><div class="bar-row"><span>${f.resource}</span><div class="bar resource"><span style="width:${p.resource}%"></span></div><b>${Math.floor(p.resource)}/100</b></div><div class="bar-row"><span>Experience</span><div class="bar xp"><span style="width:${(p.xp / xpNeeded()) * 100}%"></span></div><b>${p.xp}/${xpNeeded()}</b></div></div>
      <div class="stat-strip"><div class="stat-tile"><small>Damage</small><b>${d.minDamage}–${d.maxDamage}</b></div><div class="stat-tile"><small>Armor</small><b>${d.armor}</b></div><div class="stat-tile"><small>Critical</small><b>${Math.round(d.critChance * 100)}%</b></div><div class="stat-tile"><small>Evasion</small><b>${Math.round(d.evasion * 100)}%</b></div></div></div></section>
      <section class="panel"><h3>Night Conditions</h3><div class="list">${panelListItem("☾", phase, phase === "Full Moon" && p.faction === "moonborn" ? "Rage generation is heightened." : "The sky changes hunt conditions.")}${panelListItem("⚡", "Hunt Energy", `${p.energy}/${p.maxEnergy} • next ${energyCountdown()}`)}${panelListItem("✦", "Temporary Boon", state.story.flags.aid_0 ? "Merciful Echo: +reputation rewards" : "No active temporary boon")}</div></section>
      <section class="panel"><div class="panel-head"><h3>Suggested Action</h3><span class="pill">Recommended</span></div><div class="action-banner"><div><h3>${p.level < 4 ? "Complete your first Blackthorn hunt" : p.level < 10 ? "Challenge the Ashen Forest" : "Advance the Hollow Eclipse"}</h3><p>${p.level < 4 ? "Earn equipment, experience and reveal your first event." : "The campaign adapts to your level and past choices."}</p></div><button class="btn btn-primary btn-small" data-action="go-hunt">Hunt</button></div></section>
      <section class="panel"><div class="panel-head"><h3>Active Missions</h3><button class="btn btn-ghost btn-small" data-action="go-missions">All</button></div><div class="list">${activeMissions.length ? activeMissions.map((m) => panelListItem("◆", esc(m.title), `${m.progress}/${m.goal}`, `<div class="progress" style="width:74px"><span style="width:${(m.progress / m.goal) * 100}%"></span></div>`)).join("") : '<p class="muted small">No active missions.</p>'}</div></section>
      <section class="panel"><div class="panel-head"><h3>Recent Combat</h3><span class="muted small">Last encounters</span></div><div class="list">${recent.length ? recent.map((r) => panelListItem(r.win ? "⚔" : "☠", esc(r.enemy), r.win ? `Victory • +${r.xp} XP` : "Defeat • recovered at hideout", `<span class="${r.win ? "success-text" : "danger-text"} small">${r.win ? "WIN" : "LOSS"}</span>`)).join("") : '<p class="muted small">Your combat chronicle is empty.</p>'}</div></section>
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

  function renderAppearanceStudio() {
    const p = state.player,
      a = Art.normalizeAppearance(p.appearance, p.faction);
    const controls = [
      ["portrait", "Arte base", "portraits"],
      ["skin", "Skin / fur", "skin"],
      ["hair", "Hair / fur style", "hair"],
      ["beard", "Beard / muzzle", "beards"],
      ["hairColor", "Hair / fur color", "hairColor"],
      ["eyes", "Eye color", "eyes"],
      ["eyeGlow", "Eye radiance", "eyeGlow"],
      ["marking", "Scars / markings", "markings"],
      ["outfit", "Base outfit", "outfits"],
      ["accessory", "Heirloom", "accessories"],
      ["metal", "Metal finish", "metals"],
      ["accent", "Ritual color", "accents"],
      ["background", "Origin scenery", "backgrounds"],
    ];
    const equipped = slots
      .map((slot) => {
        const item = p.equipment[slot];
        return (
          '<div class="visual-slot ' +
          (item ? "" : "empty") +
          '">' +
          (item ? itemArtwork(item) : '<span class="icon-tile">·</span>') +
          "<div><strong>" +
          (item ? esc(item.name) : "Empty") +
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
      '<div class="studio-controls"><span class="eyebrow">ATELIÊ DA NOITE</span><h3>Aparência e regalia</h3><p>Cada controle edita cores, formas e detalhes dentro do SVG original. Sem máscaras externas, sem filtros genéricos e sem alterar os atributos de combate.</p><div class="appearance-grid">' +
      controls.map((c) => appearanceField(c[0], c[1], c[2], a[c[0]], p.faction)).join("") +
      '</div><div class="appearance-actions"><button class="btn btn-primary btn-small" data-action="randomize-appearance">Randomizar visual</button><button class="btn btn-ghost btn-small" data-action="reset-appearance">Restaurar estilo da linhagem</button></div></div>' +
      '<aside class="equipment-visual-list"><span class="eyebrow">EQUIPAMENTO VISÍVEL</span><h3>Integrado ao retrato</h3><p>Armaduras, joias e relíquias são desenhadas no mesmo SVG, respeitando escala, posição e linguagem visual da arte-base.</p><div class="visual-slot-list">' +
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
          return `<div class="achievement ${unlockedNow ? "" : "locked"}"><div class="ach-icon">${a.icon}</div><h4>${esc(a.name)}</h4><p>${esc(a.description)}</p><div class="small muted">Lv. ${a.level} • ${a.cost} ${f.resource} • CD ${a.cooldown}</div><button class="btn ${eq ? "btn-secondary" : "btn-ghost"} btn-small" data-action="toggle-ability" data-id="${a.id}" ${!unlockedNow ? "disabled" : ""}>${eq ? "Equipped" : "Equip"}</button></div>`;
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
    const hunts = [
      ["quick", "Quick Hunt", "A short pursuit with steady rewards.", 1, 0.8],
      [
        "careful",
        "Careful Hunt",
        "Lower risk and improved event choices.",
        1.08,
        0.65,
      ],
      [
        "dangerous",
        "Dangerous Hunt",
        "Hard enemies and significantly better loot.",
        1.55,
        1.35,
      ],
      [
        "monster",
        "Track a Monster",
        "Find elite creatures and regional bosses.",
        1.35,
        1.2,
      ],
      [
        "treasure",
        "Search for Treasure",
        "Fewer battles, more materials and secrets.",
        0.85,
        0.55,
      ],
      [
        "rival",
        "Hunt the Rival Faction",
        "A high-pressure faction duel.",
        1.6,
        1.45,
      ],
    ];
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Hunt", "Spend energy to explore regions, trigger branching events, discover secrets and enter tactical combat.")}
      <section class="region-map">${D.regions.map((r, i) => `<article class="region-card ${state.player.level < r.level ? "locked" : ""} ${selectedRegion === i ? "selected" : ""}" data-action="select-region" data-region="${i}" style="--region-a:${r.colors[0]};--region-b:${r.colors[1]};--region-land:${r.colors[2]}"><div class="region-art"></div><div class="region-content"><div class="region-meta"><span>Lv. ${r.level}+</span><span>${"◆".repeat(Math.min(6, r.difficulty))}</span></div><h3>${esc(r.name)}</h3><p>${esc(r.description)}</p><div class="region-meta"><span>Boss: ${esc(r.boss)}</span><span>${state.player.level >= r.level ? "OPEN" : "LOCKED"}</span></div></div></article>`).join("")}</section>
      <div class="grid grid-3" style="margin-top:14px"><section class="panel" style="grid-column:span 2"><div class="panel-head"><div><h3>${esc(region.name)}</h3><span class="muted small">Recommended level ${region.level} • Difficulty ${region.difficulty}/6</span></div><span class="pill">Secret: ${state.story.flags[`secret_${region.id}`] ? esc(region.secret) : "Unknown"}</span></div><div class="hunt-options">${hunts
        .map(([id, name, desc, reward, risk]) => {
          const cost = C.energy.huntCosts[id];
          return `<div class="hunt-option"><h4>${name}</h4><p>${desc}</p><footer><span class="cost">⚡ ${cost} • Reward ${reward}×</span><button class="btn btn-primary btn-small" data-action="start-hunt" data-type="${id}" data-reward="${reward}" data-risk="${risk}" ${!unlocked || state.player.energy < cost ? "disabled" : ""}>Hunt</button></footer></div>`;
        })
        .join("")}</div></section>
      <section class="panel"><h3>Region Intelligence</h3><div class="list">${panelListItem(region.icon, "Regional Boss", region.boss)}${panelListItem("◆", "Exclusive Loot", "Equipamentos e materiais regionais")}${panelListItem("◉", "Discoverable Secret", state.story.flags[`secret_${region.id}`] ? region.secret : "Still hidden")}${panelListItem(
        "⚔",
        "Known Threats",
        D.enemies
          .filter((e) => e.region === selectedRegion)
          .slice(0, 3)
          .map((e) => e.name)
          .join(", ") || "Ancient entities",
      )}</div></section></div></div>`;
  }

  function renderCity() {
    const availableStory = D.storyChapters.find(
      (c) => !state.story.completed.includes(c.id),
    );
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("The Night City", "Advance the campaign, craft equipment and visit the districts that connect every system.")}
      <div class="grid grid-3"><section class="panel" style="grid-column:span 2"><div class="panel-head"><h3>Story Campaign</h3><span class="pill">Chapter ${availableStory?.id || 6}/6</span></div>${availableStory ? `<div class="action-banner"><div><span class="eyebrow">THE HOLLOW ECLIPSE</span><h3>${esc(availableStory.title)}</h3><p>${esc(availableStory.description)} • Recommended level ${availableStory.level}</p></div><button class="btn btn-primary" data-action="start-story" data-chapter="${availableStory.id}" ${state.player.level < availableStory.level ? "disabled" : ""}>Begin Chapter</button></div>` : `<div class="action-banner"><div><h3>The chronicle has reached its ending</h3><p>${esc(state.story.ending || "Your final choice remains written in the rift.")}</p></div></div>`}<div class="list" style="margin-top:12px">${D.storyChapters.map((c) => panelListItem(state.story.completed.includes(c.id) ? "✓" : "◉", `Chapter ${c.id}: ${esc(c.title)}`, state.story.completed.includes(c.id) ? "Completed" : `Requires level ${c.level}`, `<span class="${state.story.completed.includes(c.id) ? "success-text" : "muted"} small">${state.story.completed.includes(c.id) ? "CLEARED" : "OPEN"}</span>`)).join("")}</div></section>
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
  function renderInventory() {
    const p = state.player,
      items = inventoryItems();
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Inventory", "Compare, equip, lock, favorite, sell, dismantle and use every item. Equipment visibly changes the character portrait.", `<button class="btn btn-ghost" data-action="inventory-mode">${inventoryMode === "grid" ? "List view" : "Grid view"}</button>`)}
      <div class="equipment-layout"><section class="panel"><h3>Equipped</h3><div class="inventory-character-preview portrait-stage">${characterSVG(p, "full")}</div><div class="equip-slots">${slots
        .map((s) => {
          const item = p.equipment[s];
          return `<button type="button" class="equip-slot ${item ? `rarity-${item.rarity}` : ""}" data-action="slot-detail" data-slot="${s}" aria-label="${item ? "Inspect " + esc(item.name) : slotLabels[s] + " is empty"}"><small>${slotLabels[s]}</small>${item ? `<div class="item-icon">${itemArtwork(item)}</div><h4>${esc(item.name)}</h4>` : '<h4 class="muted">Empty</h4>'}</button>`;
        })
        .join("")}</div></section>
      <section class="panel"><div class="inventory-toolbar"><label class="sr-only" for="inventorySearch">Search inventory</label><input id="inventorySearch" name="inventorySearch" placeholder="Search items" value="${esc(inventoryFilter.search)}"><label class="sr-only" for="inventoryRarity">Filter inventory by rarity</label><select id="inventoryRarity" name="inventoryRarity"><option value="all">All rarities</option>${Object.keys(
        rarityColors,
      )
        .map(
          (r) =>
            `<option value="${r}" ${inventoryFilter.rarity === r ? "selected" : ""}>${U.title(r)}</option>`,
        )
        .join(
          "",
        )}</select><label class="sr-only" for="inventorySlot">Filter inventory by equipment slot</label><select id="inventorySlot" name="inventorySlot"><option value="all">All slots</option>${slots.map((s) => `<option value="${s}" ${inventoryFilter.slot === s ? "selected" : ""}>${slotLabels[s]}</option>`).join("")}</select><span class="pill">${p.inventory.length}/${C.loot.maxInventory + hideoutBonus("storage") * 10}</span></div>
      <div class="${inventoryMode === "grid" ? "inventory-grid" : "list"}">${items.length ? items.map((i) => (inventoryMode === "grid" ? itemCard(i) : panelListItem(itemArtwork(i), esc(i.name), `${U.title(i.rarity)} • ${i.slot ? slotLabels[i.slot] : "Consumable"}`, `<button class="btn btn-small btn-ghost" data-action="item-detail" data-id="${i.id}">Inspect</button>`))).join("") : '<p class="muted small">No items match these filters.</p>'}</div></section></div></div>`;
  }
  function itemCard(i) {
    return `<button type="button" class="item-card rarity-${i.rarity} ${i.locked ? "locked" : ""}" data-action="item-detail" data-id="${i.id}" aria-label="Inspect ${esc(i.name)}"><div class="item-icon">${itemArtwork(i)}</div><h4>${esc(i.name)}${i.count > 1 ? ` ×${i.count}` : ""}</h4><p>${U.title(i.rarity)} • ${i.slot ? slotLabels[i.slot] : "Consumable"}</p></button>`;
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
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Mercador", "Cada lojista tem estoque próprio. Alguns itens avançados aparecem bloqueados até você alcançar o nível necessário.", `<span class="pill">Desconto ${Math.round(discount * 100)}%</span>`)}<div class="merchant-tabs">${MERCHANT_TYPES.map((t) => `<button class="tab ${merchantType === t ? "active" : ""}" data-action="merchant-type" data-type="${t}">${MERCHANT_DEFS[t].label}</button>`).join("")}</div>
      <div class="grid grid-3"><section class="panel" style="grid-column:span 2"><div class="panel-head"><h3>${MERCHANT_DEFS[merchantType].label}</h3><span class="muted small">Gira em ${state.merchant.day}</span></div><div class="inventory-grid">${stock
        .map(
          (i) =>
            `<button type="button" class="item-card rarity-${i.rarity} ${i.level > state.player.level ? "locked locked-level" : ""}" data-action="merchant-item" data-id="${i.id}" aria-label="Inspecionar ${esc(i.name)}"><div class="item-icon">${itemArtwork(i)}</div>${i.level > state.player.level ? `<span class="lock-badge">Nv ${i.level}</span>` : ""}<h4>${esc(i.name)}</h4><p>${U.title(i.rarity)} • ${i.level > state.player.level ? `Libera no nível ${i.level}` : `${U.fmt(Math.floor(i.price * (1 - discount)))} ◈`}</p></button>`,
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
    const thresholds = [0, 8, 16, 24, 32, 40];
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

  function hideoutHotspots(stage) {
    const house =
      stage <= 2
        ? "350,470 365,250 420,170 500,105 580,170 635,250 650,470"
        : stage <= 4
          ? "305,495 325,235 390,145 500,70 610,145 675,235 695,495"
          : "255,510 280,215 365,120 500,48 635,120 720,215 745,510";
    return `<svg class="hideout-hotspots" viewBox="0 0 1000 750" preserveAspectRatio="none" aria-label="Áreas do esconderijo">
      <g class="hideout-hotspot hideout-hotspot-house" tabindex="0" role="img" aria-label="Residência principal">
        <polygon points="${house}"></polygon><text x="500" y="185">Residência</text>
      </g>
      <g class="hideout-hotspot hideout-hotspot-fence" tabindex="0" role="img" aria-label="Cerca, muro e portão">
        <path d="M0 535 L360 535 L405 575 L405 745 L0 745 Z M1000 535 L640 535 L595 575 L595 745 L1000 745 Z"></path><text x="500" y="690">Cerca e portão</text>
      </g>
      <g class="hideout-hotspot hideout-hotspot-trees" tabindex="0" role="img" aria-label="Árvores e terreno">
        <path d="M0 155 Q120 80 285 170 L330 520 Q170 600 0 520 Z M1000 155 Q880 80 715 170 L670 520 Q830 600 1000 520 Z"></path><text x="128" y="300">Árvores</text><text x="872" y="300">Árvores</text>
      </g>
    </svg>`;
  }

  function hideoutEffectText(structure, level) {
    const tier = Math.max(0, level - 1);
    const values = {
      trainingDiscount: `${tier * 4}% de desconto em atributos`,
      goldBonus: `+${tier * 4}% de ouro em vitórias`,
      storage: `+${tier * 10} espaços no inventário`,
      arenaBonus: `+${tier * 5}% de XP e ouro na Arena`,
      craftBonus: `${tier * 5}% menos ouro na forja e ${tier * 10}% de chance de recuperar material`,
      accuracyBonus: `+${tier}% de precisão nas caçadas`,
      lootBonus: `+${(tier * 2.5).toFixed(tier ? 1 : 0)}% de chance de saque`,
      missionSlots: `+${tier} vagas de missões paralelas`,
      healthRegen: `+${tier} de regeneração por turno`,
      resourceBonus: `+${tier * 8}% de geração do recurso da linhagem`,
    };
    return values[structure.bonus] || `Nível de bônus ${tier}`;
  }

  function renderHideout() {
    const structures = D.hideout[state.player.faction];
    const coreLevel = state.hideoutCore?.level || 1;
    const coreTier = Math.max(0, coreLevel - 1);
    const coreCost = C.hideout.coreCost(coreLevel);
    const totalStructureLevels = structures.reduce(
      (sum, structure) => sum + (state.hideout[structure.id] || 1),
      0,
    );
    const hideoutPower = coreLevel * 100 + totalStructureLevels * 25;
    const scene = hideoutStageInfo(structures, coreLevel);
    const title =
      state.player.faction === "moonborn"
        ? "Covil da Floresta Oculta"
        : "Solar Antigo da Noite";
    const coreName =
      state.player.faction === "moonborn" ? "Coração Totêmico" : "Núcleo Hemático";
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader(
      title,
      "Construa, aprimore e fortaleça um esconderijo persistente. O cenário principal evolui junto com suas estruturas.",
    )}
      <section class="hideout-main panel">
        <div class="hideout-main-visual" style="background-image:url('${scene.image}')">
          <div class="hideout-main-vignette"></div>
          ${hideoutHotspots(scene.stage)}
          <div class="hideout-main-copy">
            <span class="eyebrow">ESCONDERIJO PRINCIPAL • ESTÁGIO ${scene.stage}/6</span>
            <h2>${scene.title}</h2>
            <p>${scene.stage >= 6 ? "Seu domínio atingiu o auge." : `Faltam ${scene.upgradesToNext} pontos de construção para o próximo visual.`}</p>
          </div>
          <div class="hideout-main-stats">
            <div><small>Poder</small><b>${U.fmt(hideoutPower)}</b></div>
            <div><small>Progresso</small><b>${Math.round(scene.totalProgress * 100)}%</b></div>
            <div><small>Estágio</small><b>${scene.stage}/6</b></div>
          </div>
          <div class="hideout-main-progress"><span style="width:${Math.max(4, Math.round(scene.stageProgress * 100))}%"></span></div>
        </div>
      </section>
      <section class="hideout-core panel"><div class="hideout-core-icon">${state.player.faction === "moonborn" ? "◒" : "♦"}</div><div class="hideout-core-copy"><span class="eyebrow">NÚCLEO DO ESCONDERIJO</span><h3>${coreName} • Nível ${coreLevel}/${C.hideout.maxCoreLevel}</h3><p>O núcleo fortalece todos os combates: <strong>+${coreTier * 2}% de vida</strong>, <strong>+${(coreTier * 1.5).toFixed(1)}% de dano</strong> e <strong>+${(coreTier * 1.5).toFixed(1)}% de armadura</strong>.</p><div class="progress"><span style="width:${(coreLevel / C.hideout.maxCoreLevel) * 100}%"></span></div></div><div class="hideout-core-actions"><span class="pill">Poder ${U.fmt(hideoutPower)}</span><button class="btn btn-gold" data-action="upgrade-hideout-core" ${coreLevel >= C.hideout.maxCoreLevel || state.player.gold < coreCost ? "disabled" : ""}>${coreLevel >= C.hideout.maxCoreLevel ? "Nível máximo" : `Melhorar • ${U.fmt(coreCost)} ◈`}</button></div></section>
      <section class="hideout-structures"><div class="structure-grid">${structures
        .map((structure) => {
          const level = state.hideout[structure.id] || 1;
          const cost = C.hideout.cost(level);
          const nextText =
            level < C.hideout.maxStructureLevel
              ? hideoutEffectText(structure, level + 1)
              : "Estrutura concluída";
          return `<article class="structure-node"><div class="structure-topline"><div class="icon">${structure.icon}</div><div><span class="structure-level">NÍVEL ${level}</span><h4>${esc(structure.name)}</h4></div></div><p>${esc(structure.description)}</p><div class="structure-meter"><span style="width:${Math.round((level / C.hideout.maxStructureLevel) * 100)}%"></span></div><div class="structure-effect"><small>ATUAL</small><strong>${hideoutEffectText(structure, level)}</strong></div><div class="structure-next"><small>PRÓXIMO</small><span>${nextText}</span></div><footer><span>Lv. ${level}/${C.hideout.maxStructureLevel}</span><button class="btn btn-small btn-primary" data-action="upgrade-hideout" data-id="${structure.id}" ${level >= C.hideout.maxStructureLevel || state.player.gold < cost ? "disabled" : ""}>${level >= C.hideout.maxStructureLevel ? "Máximo" : `${U.fmt(cost)} ◈`}</button></footer></article>`;
        })
        .join("")}</div></section>
      <section class="panel" style="margin-top:14px"><div class="panel-head"><h3>Resumo do esconderijo</h3><span class="pill">${scene.title}</span></div><div class="derived-grid"><div class="derived"><small>Nível do núcleo</small><b>${coreLevel}</b></div><div class="derived"><small>Níveis construídos</small><b>${totalStructureLevels}</b></div><div class="derived"><small>Poder total</small><b>${U.fmt(hideoutPower)}</b></div><div class="derived"><small>Próximo custo do núcleo</small><b>${coreLevel >= C.hideout.maxCoreLevel ? "MAX" : `${U.fmt(coreCost)} ◈`}</b></div></div></section></div>`;
  }

  function renderClan() {
    if (!state.clan) {
      dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Clan", "Create a faction clan, recruit authored NPC companions and build a shared fortress.")}
      <section class="panel" style="max-width:700px;margin:auto"><h3>Found a Clan</h3><p class="muted">Choose a name, emblem and motto. Every member and chat message belongs to the game world and is clearly simulated.</p><div class="field"><label for="clanName">Clan name</label><input id="clanName" name="clanName" maxlength="24" placeholder="Name your clan"></div><div class="field" style="margin-top:10px"><label for="clanMotto">Motto</label><input id="clanMotto" name="clanMotto" maxlength="60" placeholder="A promise carved into the night"></div><div class="field" style="margin-top:10px"><label for="clanEmblem">Emblem</label><select id="clanEmblem" name="clanEmblem"><option>◒</option><option>♦</option><option>♛</option><option>†</option><option>◆</option></select></div><button class="btn btn-primary" style="margin-top:14px" data-action="create-clan">Create Clan</button></section></div>`;
      return;
    }
    const c = state.clan;
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader(`${esc(c.emblem)} ${esc(c.name)}`, esc(c.motto), `<button class="btn btn-ghost" data-action="invite-clan">Invite Companion</button>`)}
      <div class="grid grid-3"><section class="panel" style="grid-column:span 2"><div class="panel-head"><h3>Clan Fortress</h3><span class="pill">Strength ${U.fmt(c.strength)}</span></div><div class="action-banner"><div><h3>Fortress Level ${c.fortress}</h3><p>Donations unlock clan bonuses, simulated rival-clan battles and stronger companions.</p></div><button class="btn btn-gold" data-action="clan-donate" ${state.player.gold < 100 ? "disabled" : ""}>Donate 100 ◈</button></div><div class="stat-strip" style="margin-top:12px"><div class="stat-tile"><small>Members</small><b>${c.members.length + 1}</b></div><div class="stat-tile"><small>Donations</small><b>${U.fmt(c.donations)}</b></div><div class="stat-tile"><small>Victories</small><b>${c.victories}</b></div><div class="stat-tile"><small>Rank</small><b>#${c.rank}</b></div></div></section>
      <section class="panel"><h3>Clan Objectives</h3><div class="list">${panelListItem("⚔", "Win faction battles", `${Math.min(c.victories, 5)}/5`)}${panelListItem("◈", "Donate resources", `${Math.min(c.donations, 1000)}/1000`)}${panelListItem("▲", "Increase strength", `${Math.min(c.strength, 5000)}/5000`)}</div><button class="btn btn-primary" style="width:100%;margin-top:10px" data-action="clan-battle">Fight Rival Clan</button></section>
      <section class="panel" style="grid-column:span 2"><h3>Simulated Clan Chat</h3><div class="chat-log">${c.chat
        .slice(-10)
        .map(
          (m) =>
            `<div class="chat-message"><div class="chat-avatar">${m.icon}</div><div class="chat-bubble"><h5>${esc(m.name)} <span class="muted">• NPC companion</span></h5><p>${esc(m.text)}</p></div></div>`,
        )
        .join("")}</div></section>
      <section class="panel"><h3>Members</h3><div class="clan-members">${c.members.map((m) => `<article class="member-card"><h4>${esc(m.name)}</h4><p>Lv. ${m.level} ${esc(m.role)}<br>${esc(m.personality)} • Gear ${m.gear}</p></article>`).join("") || '<p class="muted small">Invite companions to strengthen the fortress.</p>'}</div></section></div></div>`;
  }

  function renderBestiary() {
    const all = [
      ...D.enemies,
      ...D.bosses.map((b, i) => ({
        ...b,
        id: b.id,
        region: i,
        behavior: "boss",
        weaknesses: ["Telegraphed attacks"],
        resistances: ["Control"],
        abilities: [b.signature],
        drops: [b.exclusive],
      })),
    ];
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Bestiary & Codex", "Defeated creatures reveal weaknesses, resistances, abilities, drops and Hollow Eclipse lore.")}
      <section class="bestiary-grid">${all
        .map((e) => {
          const known = (state.bestiary[e.id]?.defeated || 0) > 0;
          return `<article class="bestiary-card ${known ? "" : "unknown"}" data-action="bestiary-detail" data-id="${e.id}"><div class="beast-art">${known ? e.icon : "?"}</div><h4>${known ? esc(e.name) : "Unknown Entity"}</h4><p>${known ? `${U.title(e.type)} • ${D.regions[e.region]?.name || "Ancient Rift"} • Defeated ${state.bestiary[e.id].defeated}` : "Defeat this creature to reveal its entry."}</p></article>`;
        })
        .join("")}</section></div>`;
  }

  function renderAchievements() {
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Achievements", "Fifty-four achievements reward combat, exploration, collection, progression, Arena, story, clan, secrets and faction mastery.")}
      <section class="achievement-grid">${D.achievements
        .map((a) => {
          const unlocked = !!state.achievements[a.id],
            progress = Math.min(state.metrics[a.metric] || 0, a.goal);
          return `<article class="achievement ${unlocked ? "" : "locked"}"><div class="ach-icon">${a.icon}</div><h4>${esc(a.title)}</h4><p>${esc(a.description)}</p><div class="progress"><span style="width:${(progress / a.goal) * 100}%"></span></div><div class="small muted" style="margin-top:6px">${progress}/${a.goal} • ${a.rewards.gold} gold${a.rewards.shards ? ` • ${a.rewards.shards} shards` : ""}</div></article>`;
        })
        .join("")}</section></div>`;
  }

  function generatedRanking(type) {
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
    const rows = Array.from({ length: 34 }, (_, i) => ({
      name: `${U.pick(D.names.first)} ${U.pick(D.names.last)}`,
      clan: U.pick(D.names.clans),
      faction: i % 2 ? "moonborn" : "bloodbound",
      value:
        type === "level"
          ? U.rand(5, 40)
          : type === "arena"
            ? U.rand(300, 3400)
            : U.rand(20, 9000),
    }));
    const playerValue =
      type === "level"
        ? state.player.level
        : type === "arena"
          ? state.arena.rating
          : type === "bosses"
            ? state.metrics.bosses
            : type === "wealth"
              ? state.player.gold
              : Object.keys(state.achievements).length * 100;
    rows.push({
      name: state.player.name,
      clan: state.clan?.name || "Clanless",
      faction: state.player.faction,
      value: playerValue,
      player: true,
    });
    rows.sort((a, b) => b.value - a.value);
    return rows;
  }
  function renderRanking() {
    const tabs = [
      "level",
      "arena",
      "bosses",
      "wealth",
      "achievements",
      "clan",
      "faction",
    ];
    const rows = generatedRanking(rankingType);
    dom.viewRoot.innerHTML = `<div class="view-container">${viewHeader("Ranking", "Generated rivals evolve with your progression. Your character is always highlighted inside the simulated world ranking.")}
      <div class="ranking-tabs">${tabs.map((t) => `<button class="tab ${rankingType === t ? "active" : ""}" data-action="ranking-type" data-type="${t}">${U.title(t)}</button>`).join("")}</div><section class="panel">${rows.map((r, i) => `<div class="ranking-row ${r.player ? "player" : ""}"><div class="rank-number">#${i + 1}</div><div class="rank-name"><strong>${esc(r.name)}</strong><small>${esc(r.clan)} • ${D.factions[r.faction].name}</small></div><div>${r.player ? '<span class="pill">YOU</span>' : ""}</div><div class="rank-value"><b>${U.fmt(r.value)}</b></div></div>`).join("")}</section></div>`;
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
    if (a === "upgrade-hideout") return upgradeHideout(el.dataset.id);
    if (a === "upgrade-hideout-core") return upgradeHideoutCore();
    if (a === "create-clan") return createClan();
    if (a === "invite-clan") return inviteClanMember();
    if (a === "clan-donate") return clanDonate();
    if (a === "clan-battle") return clanBattle();
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
      0.06 + derived().luck * 0.002 + (type === "treasure" ? 0.16 : 0);
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
    dom.eventOverlay.innerHTML = `<div class="event-shell glass-panel"><div class="event-art" style="--event-a:${D.regions[context.region].colors[0]};--event-b:${D.regions[context.region].colors[1]}"><div class="event-icon">${event.icon}</div></div><div class="event-content"><span class="eyebrow">EVENTO DE CAÇADA</span><h2>${esc(event.title)}</h2><p>${esc(event.description)}</p><div class="event-choices">${event.choices.map((c, i) => `<button class="event-choice" data-action="event-choice" data-index="${i}"><strong>${esc(c.text)}</strong><small>${esc(c.hint)}</small></button>`).join("")}</div></div></div>`;
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
    if (context.source === "arena") {
      return {
        title: "Arena",
        style: "linear-gradient(180deg,#2e2535,#17131d 56%,#231718)",
        svg: `<svg viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"><rect width="1200" height="500" fill="transparent"/><circle cx="940" cy="90" r="52" fill="rgba(255,236,188,.18)"/><path d="M0 360h1200" stroke="rgba(255,255,255,.08)" stroke-width="3"/><path d="M40 342Q200 250 360 342T680 342T1000 342T1160 342" fill="none" stroke="rgba(210,174,113,.28)" stroke-width="18"/><path d="M80 318h1040" stroke="rgba(255,255,255,.06)" stroke-width="8"/><path d="M180 110v170m840-170v170M140 170h100m720 0h100" stroke="rgba(212,162,89,.2)" stroke-width="20" stroke-linecap="round"/></svg>`
      };
    }
    const region = typeof context.region === "number" ? D.regions[context.region] : D.regions[selectedRegion] || D.regions[0];
    const colors = region?.colors || ["#35435e", "#11141c", "#12161c"];
    const baseStyle = `radial-gradient(circle at 50% 24%, ${colors[0]}55, transparent 26%), linear-gradient(180deg, ${colors[0]}, ${colors[1]} 60%, ${colors[2]})`;
    const scenes = {
      blackthorn: `<svg viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"><circle cx="180" cy="88" r="48" fill="rgba(255,239,225,.16)"/><path d="M0 372h1200" stroke="rgba(255,255,255,.08)" stroke-width="2"/><path d="M80 360l70-120 40 55 60-85 38 46 35-62 84 166Zm420 0 60-95 55 47 64-112 90 160Zm360 0 82-143 49 73 73-114 94 184Z" fill="rgba(10,12,18,.82)"/><g fill="rgba(28,36,50,.9)"><rect x="145" y="250" width="66" height="95"/><polygon points="136,250 178,205 220,250"/><rect x="256" y="232" width="83" height="113"/><polygon points="242,232 296,188 352,232"/><rect x="382" y="268" width="58" height="77"/><polygon points="372,268 411,229 450,268"/></g></svg>`,
      ashen: `<svg viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"><circle cx="1010" cy="90" r="54" fill="rgba(255,244,210,.12)"/><path d="M0 390Q200 340 420 372T860 356T1200 384V500H0Z" fill="rgba(6,8,10,.82)"/><g stroke="rgba(31,39,37,.95)" stroke-width="18" stroke-linecap="round"><path d="M120 388V188m0 66-28-35m28 16 34-38"/><path d="M255 388V165m0 74-30-40m30 14 28-35"/><path d="M470 388V152m0 90-34-46m34 20 42-50"/><path d="M720 388V178m0 72-30-38m30 18 31-41"/><path d="M930 388V150m0 86-36-48m36 18 34-42"/></g></svg>`,
      railway: `<svg viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"><circle cx="210" cy="90" r="44" fill="rgba(255,226,187,.12)"/><path d="M0 410h1200" stroke="rgba(255,255,255,.06)" stroke-width="3"/><path d="M440 500 525 260h150l85 240" fill="rgba(12,13,16,.78)"/><path d="M320 500 470 315M880 500 730 315" stroke="rgba(169,118,78,.25)" stroke-width="6"/><path d="M370 500 500 320M830 500 700 320" stroke="rgba(255,255,255,.09)" stroke-width="10"/><g stroke="rgba(107,82,69,.3)" stroke-width="12"><path d="M445 500 530 260m140 240-85-240"/><path d="M500 340h200m-230 65h260m-300 65h340"/></g></svg>`,
      bloodmarket: `<svg viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"><path d="M0 382Q250 336 560 360T1200 390V500H0Z" fill="rgba(9,7,12,.82)"/><g fill="rgba(31,14,20,.88)"><rect x="110" y="210" width="110" height="150"/><rect x="270" y="180" width="150" height="180"/><rect x="485" y="220" width="100" height="140"/><rect x="650" y="195" width="170" height="165"/><rect x="910" y="205" width="130" height="155"/></g><g stroke="rgba(255,115,128,.35)" stroke-width="6"><path d="M165 145v65m0 0h45m-45 0h-45"/><path d="M345 120v60m0 0h55m-55 0h-55"/><path d="M735 132v63m0 0h68m-68 0h-68"/><path d="M974 138v67m0 0h52m-52 0h-52"/></g><g fill="rgba(255,132,140,.28)"><circle cx="165" cy="206" r="18"/><circle cx="345" cy="180" r="24"/><circle cx="735" cy="196" r="26"/><circle cx="974" cy="204" r="20"/></g></svg>`,
      hollowgrave: `<svg viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"><circle cx="950" cy="88" r="48" fill="rgba(255,246,228,.15)"/><path d="M0 396Q220 360 510 380T1200 392V500H0Z" fill="rgba(8,8,13,.84)"/><g fill="rgba(44,47,61,.95)"><path d="M130 392v-66q0-26 26-26t26 26v66Z"/><path d="M242 392v-52q0-20 20-20t20 20v52Z"/><path d="M332 392v-76h42v76Z"/><path d="M490 392v-62q0-24 24-24t24 24v62Z"/><path d="M652 392v-50h38v50Z"/><path d="M820 392v-72q0-22 22-22t22 22v72Z"/></g><g stroke="rgba(160,164,193,.2)" stroke-width="4"><path d="M156 296v96m-16-48h32"/><path d="M262 320v72m-14-36h28"/><path d="M513 304v88m-16-44h32"/></g></svg>`,
      silvermine: `<svg viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"><path d="M0 500V260l150 70 130-98 140 86 180-132 170 108 150-72 180 88V500Z" fill="rgba(8,11,14,.85)"/><g fill="rgba(126,153,173,.28)"><path d="M185 355 215 295 245 355Z"/><path d="M364 318 396 252 428 318Z"/><path d="M692 343 728 279 764 343Z"/><path d="M922 335 952 270 982 335Z"/></g><path d="M460 500V312q82-94 170-94t170 94v188Z" fill="rgba(17,22,28,.88)" stroke="rgba(198,214,226,.15)" stroke-width="4"/></svg>`,
      harbor: `<svg viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"><circle cx="210" cy="82" r="40" fill="rgba(255,232,203,.12)"/><path d="M0 412Q125 394 250 412T500 410T750 416T1000 408T1200 416V500H0Z" fill="rgba(8,10,14,.86)"/><path d="M0 370Q200 350 420 370T840 362T1200 376" fill="none" stroke="rgba(111,82,93,.32)" stroke-width="24"/><g fill="rgba(20,24,31,.9)"><rect x="165" y="244" width="12" height="122"/><rect x="330" y="228" width="12" height="138"/><rect x="510" y="216" width="12" height="150"/></g><g fill="rgba(32,21,29,.95)"><path d="M177 244h78l-62 46Z"/><path d="M342 228h94l-75 55Z"/><path d="M522 216h108l-89 66Z"/></g><path d="M830 356h220l40-36-75-18-42 20-35-66-76 100Z" fill="rgba(17,20,25,.92)"/></svg>`,
      mountains: `<svg viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"><circle cx="960" cy="86" r="54" fill="rgba(236,244,255,.16)"/><path d="M0 500 185 278l94 120 138-182 114 154 145-198 152 223 116-138 154 243Z" fill="rgba(15,20,31,.88)"/><path d="M185 278l94 120 44-58 94-124 38 52 76-96 145 223 72-90 78-48 154 243" fill="rgba(69,88,119,.28)"/></svg>`,
      capital: `<svg viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"><circle cx="180" cy="88" r="44" fill="rgba(255,240,216,.12)"/><path d="M0 402Q240 354 520 380T1200 392V500H0Z" fill="rgba(10,8,14,.86)"/><g fill="rgba(34,24,39,.94)"><rect x="112" y="202" width="88" height="170"/><rect x="268" y="164" width="138" height="208"/><rect x="455" y="220" width="92" height="152"/><rect x="612" y="146" width="182" height="226"/><rect x="855" y="190" width="142" height="182"/></g><g fill="rgba(87,66,94,.55)"><polygon points="268,164 337,96 406,164"/><polygon points="612,146 703,58 794,146"/><polygon points="855,190 926,122 997,190"/></g></svg>`,
      rift: `<svg viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"><circle cx="600" cy="112" r="92" fill="rgba(154,97,196,.18)"/><circle cx="600" cy="112" r="46" fill="rgba(222,166,255,.2)"/><path d="M0 392Q180 348 416 372T806 360T1200 394V500H0Z" fill="rgba(7,4,10,.88)"/><g stroke="rgba(185,115,255,.32)" stroke-width="6"><path d="M600 18v188M512 74l176 76M528 194l156-108"/><path d="M254 292l58-110 34 88 60-150 40 128 62-94"/><path d="M936 292l-60-124-34 92-48-136-54 118-68-86"/></g><g fill="rgba(113,68,138,.36)"><path d="M294 360 340 278 372 352Z"/><path d="M764 362 806 286 838 362Z"/><path d="M990 360 1038 286 1070 360Z"/></g></svg>`
    };
    return { title: region?.name || "Caçada", style: baseStyle, svg: scenes[region?.id] || scenes.blackthorn };
  }

  function renderCombat() {
    if (!combat) return;
    const p = combat.player,
      e = combat.enemy,
      f = D.factions[state.player.faction];
    const scene = battleSceneConfig(combat.context);
    const abilities = state.player.equippedAbilities
      .map((id) => D.abilities.find((a) => a.id === id))
      .filter(Boolean);
    dom.combatOverlay.innerHTML = `<div class="combat-shell"><div class="combat-top"><div><span class="eyebrow">${combat.context.source === "arena" ? "ARENA DUEL" : combat.context.source === "story" ? "STORY ENCOUNTER" : "NIGHT HUNT"}</span><h2>${esc(combat.context.region !== undefined ? D.regions[combat.context.region].name : "The Arena")}</h2></div><div class="combat-top-actions"><button class="btn btn-ghost btn-small" data-combat="speed">${combat.speed}×</button><button class="btn ${combat.auto ? "btn-secondary" : "btn-ghost"} btn-small" data-combat="auto">Auto ${combat.auto ? "On" : "Off"}</button><button class="btn btn-ghost btn-small" data-combat="skip">Animations ${state.settings.skipAnimations ? "Off" : "On"}</button></div></div>
    <div class="battlefield" style="background:${scene.style}"><div class="battle-scene">${scene.svg}</div><div class="combatant-ui left"><h3>${esc(p.name)}</h3><div class="bar hp"><span style="width:${(p.health / p.maxHealth) * 100}%"></span></div><div class="small">${Math.ceil(p.health)}/${p.maxHealth} PV</div><div class="bar resource" style="margin-top:6px"><span style="width:${p.resource}%"></span></div><div class="small">${Math.floor(p.resource)}/100 ${f.resource}</div><div class="status-list">${renderStatuses(p.statuses)}</div></div><div class="combatant-ui right"><h3>${esc(e.name)}${e.boss ? ` • Phase ${e.phase}` : ""}</h3><div class="enemy-buff-badge" title="Vida, dano e armadura aumentados. Vitória concede a mesma porcentagem extra de XP e recompensas.">▲ +${e.buffPercent || 0}% BUFF</div><div class="bar hp"><span style="width:${(e.health / e.maxHealth) * 100}%"></span></div><div class="small">${Math.ceil(e.health)}/${e.maxHealth} PV</div><div class="status-list">${renderStatuses(e.statuses)}</div></div>
    <div id="fighterPlayer" class="fighter player">${characterSVG({ ...state.player, equipment: state.player.equipment }, "battle")}</div><div id="fighterEnemy" class="fighter enemy">${enemySVG(e)}</div></div>
    <div class="combat-bottom"><div><div class="turn-order">Turn ${combat.turn} • ${combat.lastAction || "Determine initiative"}</div><div class="ability-bar" style="margin-top:8px"><button class="ability-btn" data-combat="action" data-action-id="basic"><strong>⚔ Basic Attack</strong><small>Reliable strike • no cost</small></button><button class="ability-btn" data-combat="action" data-action-id="heavy"><strong>◆ Heavy Attack</strong><small>High damage • lower accuracy</small></button><button class="ability-btn" data-combat="action" data-action-id="defend"><strong>⬟ Defensive Stance</strong><small>Armor and block until next turn</small></button><button class="ability-btn" data-combat="action" data-action-id="faction"><strong>${f.emblem} ${p.resource >= 100 ? f.form : "Faction Power"}</strong><small>${p.resource >= 100 ? "Transform at maximum resource" : "Gain tactical bloodline power"}</small></button>${abilities.map((a) => `<button class="ability-btn" data-combat="action" data-action-id="ability:${a.id}" ${p.resource < a.cost || p.cooldowns[a.id] > 0 ? "disabled" : ""}><strong>${a.icon} ${esc(a.name)}</strong><small>${a.cost} ${f.resource} • ${p.cooldowns[a.id] ? `CD ${p.cooldowns[a.id]}` : a.description}</small></button>`).join("")}<button class="ability-btn" data-combat="item"><strong>⚗ Item</strong><small>Use a restorative consumable</small></button><button class="ability-btn" data-combat="flee" ${combat.canFlee ? "" : "disabled"}><strong>⌁ Retreat</strong><small>${combat.canFlee ? "Attempt to escape" : "Cannot flee this encounter"}</small></button></div></div><div id="combatLog" class="combat-log">${combat.log.join("<br>")}</div></div></div>`;
    requestAnimationFrame(() => {
      cleanBattlePortraitBackground($("#fighterPlayer"));
      cleanBattlePortraitBackground($("#fighterEnemy"));
    });
  }
  function enemySVG(e) {
    if (e.visual) return characterSVG(e.visual, "battle");
    const color = e.boss
      ? "#b02a46"
      : e.behavior === "poison"
        ? "#5d8c63"
        : e.behavior === "burn"
          ? "#bf633d"
          : "#6c7187";
    return `<svg viewBox="0 0 300 500"><defs><radialGradient id="eg"><stop stop-color="${color}" stop-opacity=".42"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><circle cx="150" cy="190" r="140" fill="url(#eg)"/><path d="M109 75l-26-50 50 31m58 19 26-50-50 31" fill="#1b1b22"/><path d="M97 80q53-38 106 0l10 80q-15 70-63 73-48-3-63-73z" fill="#30313a" stroke="${color}" stroke-width="5"/><path d="M113 132h32m12 0h31" stroke="#ffcf73" stroke-width="8"/><path d="M122 185l18 23 10-20 10 20 18-23" fill="#e4ded0"/><path d="M92 211q58-31 116 0l29 166-87 61-87-61z" fill="#24252d" stroke="${color}" stroke-width="5"/><path d="M92 230Q48 264 42 361l42 19 50-130m74-20q44 34 50 131l-42 19-50-130" fill="#30313a" stroke="#16171c" stroke-width="5"/><path d="M108 404l-25 81h54l13-58 13 58h54l-25-81" fill="#191a20"/>${e.boss ? `<circle cx="150" cy="285" r="35" fill="none" stroke="#d4a24e" stroke-width="7"/><path d="M150 245v80m-40-40h80" stroke="#d4a24e" stroke-width="5"/>` : ""}</svg>`;
  }
  function renderStatuses(statuses) {
    return statuses
      .map(
        (s) =>
          `<span class="status-icon" data-tooltip="${esc(U.title(s.name))}: ${esc(statusInfo[s.name]?.[1] || "Temporary effect")} (${s.duration})">${statusInfo[s.name]?.[0] || "•"}</span>`,
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
        },
        "player",
      );
    else if (actionId === "defend") {
      p.defending = true;
      addStatus(p, "shielded", 1);
      gainResource(p, 10);
      logCombat(`<b>${esc(p.name)}</b> takes a defensive stance.`);
      animateFighter("player", "block");
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
      logCombat(`<b>${esc(p.name)}</b> enters <b>${D.factions[f].form}</b>!`);
      sfx("transform");
      animateFighter("player", "attack");
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
          `<b>${esc(e.name)}</b> enters phase ${phase}. A dangerous attack is telegraphed.`,
        );
        addStatus(e, "enraged", 2);
        renderCombat();
        return setTimeout(
          () =>
            performAttack(
              e,
              p,
              {
                name: e.sourceData.signature || "Boss Cataclysm",
                power: 1.25 + phase * 0.16,
                accuracy: 0.02,
                status: phase === 3 ? "cursed" : "weakened",
              },
              "enemy",
            ),
          delay(650),
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
      logCombat(`${esc(e.name)} invokes a profane recovery.`);
      finishAction();
    } else if (
      (e.behavior === "defensive" || e.behavior === "shield") &&
      U.chance(0.28)
    ) {
      e.defending = true;
      addStatus(e, "shielded", 1);
      logCombat(`${esc(e.name)} raises a guard.`);
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
            ? e.sourceData.signature || "Boss Strike"
            : U.pick([
                "Rending Blow",
                "Night Rush",
                "Cruel Feint",
                "Eclipse Strike",
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
        let damage = Math.max(
          1,
          Math.floor(
            raw *
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
        if (move.status && U.chance(0.62)) {
          addStatus(target, move.status, 2);
          if (move.status === "bleeding" && side === "player")
            state.metrics.bleeds++;
        }
        if (state.player.faction === "bloodbound" && side === "player") {
          healCombat(attacker, Math.floor(damage * 0.08));
          gainResource(attacker, hasStatus(target, "bleeding") ? 8 : 3);
        }
        animateFighter(
          side === "player" ? "enemy" : "player",
          blocked ? "block" : "hit",
        );
        showDamage(
          side === "player" ? "enemy" : "player",
          damage,
          crit,
          blocked,
        );
        logCombat(
          `<b>${esc(attacker.name)}</b> uses ${esc(move.name)} for <b>${damage}</b>${crit ? " critical" : ""}${blocked ? " blocked" : ""} damage.`,
        );
        sfx(crit ? "critical" : blocked ? "block" : "attack");
        if (crit && state.settings.screenShake) {
          document.body.classList.add("screen-shake");
          setTimeout(() => document.body.classList.remove("screen-shake"), 300);
        }
      } else {
        animateFighter(side === "player" ? "enemy" : "player", "dodge");
        logCombat(`<b>${esc(target.name)}</b> dodges ${esc(move.name)}.`);
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
      if (s.name === "bleeding")
        dmg += Math.max(2, Math.floor(c.maxHealth * 0.035));
      if (s.name === "poisoned")
        dmg += Math.max(2, Math.floor(c.maxHealth * 0.025));
      if (s.name === "burning")
        dmg += Math.max(3, Math.floor(c.maxHealth * 0.04));
      if (s.name === "regenerating")
        heal += Math.max(2, Math.floor(c.maxHealth * 0.04));
    });
    if (dmg) {
      c.health = Math.max(0, c.health - dmg);
      showDamage(side, dmg, false, false);
      logCombat(`${esc(c.name)} suffers ${dmg} status damage.`);
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
    if (actual > 0)
      showDamage(
        c.id === "player" ? "player" : "enemy",
        actual,
        false,
        false,
        true,
      );
  }
  function showDamage(
    side,
    amount,
    crit = false,
    blocked = false,
    heal = false,
  ) {
    if (!state.settings.damageNumbers) return;
    const field = $(".battlefield");
    if (!field) return;
    const n = document.createElement("div");
    n.className = `damage-number ${crit ? "crit" : ""} ${heal ? "heal" : ""}`;
    n.textContent = heal
      ? `+${amount}`
      : `${blocked ? "BLOCK " : ""}-${amount}`;
    n.style.left = side === "player" ? "25%" : "72%";
    n.style.top = `${U.rand(35, 58)}%`;
    field.appendChild(n);
    setTimeout(() => n.remove(), 900);
  }
  function animateFighter(side, cls) {
    const el = $(`#fighter${side === "player" ? "Player" : "Enemy"}`);
    if (!el || state.settings.skipAnimations) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 400 / combat.speed);
  }
  function useCombatItem() {
    const item = state.player.inventory.find(
      (i) => i.type === "consumable" && i.count > 0,
    );
    if (!item) return toast("No restorative item available.", "error");
    item.count--;
    if (item.count <= 0)
      state.player.inventory = state.player.inventory.filter(
        (i) => i.id !== item.id,
      );
    healCombat(combat.player, item.amount || 40);
    logCombat(`<b>${esc(state.player.name)}</b> uses ${esc(item.name)}.`);
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
      logCombat("You vanish into the night.");
      setTimeout(() => endCombat(false, true), delay(450));
    } else {
      logCombat("Retreat failed.");
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
      const arenaRewardMult =
        ctx.source === "arena" ? 1 + hideoutBonus("arenaBonus") * 0.05 : 1;
      reward.xp = Math.floor(
        C.xp.reward(
          combat.enemy.level,
          diff * (combat.enemy.boss ? 1.7 : 1),
        ) *
          arenaRewardMult *
          riskRewardMult,
      );
      reward.gold = Math.floor(
        (35 + combat.enemy.level * 13) *
          diff *
          arenaRewardMult *
          (1 + hideoutBonus("goldBonus") * 0.04) *
          riskRewardMult,
      );
      reward.materials = Math.max(
        1,
        Math.ceil(U.rand(1, combat.enemy.boss ? 5 : 2) * riskRewardMult),
      );
      reward.buffPercent = buffPercent;
      reward.rewardMultiplier = riskRewardMult;
      const lootChance = Math.min(
        0.98,
        (0.42 + diff * 0.12 + hideoutBonus("lootBonus") * 0.025) *
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
      `Level ${state.player.level}! New power courses through your bloodline.`,
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
    openModal({
      title: item.name,
      wide: true,
      body: `<div class="detail-columns"><div class="detail-art rarity-${item.rarity}" style="--rarity:${rarityColors[item.rarity]}">${item.icon}</div><div><span class="pill">${U.title(item.rarity)}</span> <span class="pill">${item.slot ? slotLabels[item.slot] : "Consumable"}</span><p>${esc(item.flavor || "A useful object of the night.")}</p>${diff !== null ? `<p class="${diff >= 0 ? "success-text" : "danger-text"}">${diff >= 0 ? "+" : ""}${diff} total power versus equipped</p>` : ""}<div class="detail-stats">${
        Object.entries(item.stats || {})
          .map(
            ([k, v]) =>
              `<div class="detail-stat"><span>${U.title(k)}</span><b>+${v}</b></div>`,
          )
          .join("") ||
        `<div class="detail-stat"><span>Effect</span><b>${esc(item.effect || "Use")}</b></div>`
      }</div><div class="modal-actions" style="justify-content:flex-start">${item.type === "consumable" ? `<button class="btn btn-primary" data-modal-action="use-item" data-payload="${item.id}">Use</button>` : equipped ? `<button class="btn btn-ghost" data-modal-action="unequip-item" data-payload="${item.slot}">Unequip</button>` : `<button class="btn btn-primary" data-modal-action="equip-item" data-payload="${item.id}">Equip</button>`}<button class="btn btn-ghost" data-modal-action="favorite-item" data-payload="${item.id}">${item.favorite ? "Unfavorite" : "Favorite"}</button><button class="btn btn-ghost" data-modal-action="lock-item" data-payload="${item.id}">${item.locked ? "Unlock" : "Lock"}</button>${!equipped ? `<button class="btn btn-danger" data-modal-action="sell-item" data-payload="${item.id}" ${item.locked ? "disabled" : ""}>Sell ${U.fmt(item.value || 10)} ◈</button>` : ""}</div></div></div>`,
    });
    const art = $(".detail-art", dom.modalRoot);
    if (art) art.innerHTML = itemArtwork(item);
  }
  function comparePower(i) {
    return (
      Object.values(i.stats || {}).reduce((s, v) => s + Number(v || 0), 0) +
      (i.upgrade || 0) * 5
    );
  }
  function equipItem(id) {
    const item = state.player.inventory.find((i) => i.id === id);
    if (!item || !item.slot) return;
    if (item.faction !== "any" && item.faction !== state.player.faction)
      return toast("Your bloodline rejects this item.", "error");
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
    toast(`${item.name} equipped.`, "success");
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
    if (item.effect === "heal")
      state.player.health = Math.min(
        derived().maxHealth,
        state.player.health + (item.amount || 40),
      );
    else if (item.effect === "energy")
      state.player.energy = Math.min(
        state.player.maxEnergy,
        state.player.energy + (item.amount || 5),
      );
    item.count = (item.count || 1) - 1;
    if (item.count <= 0)
      state.player.inventory = state.player.inventory.filter(
        (i) => i.id !== id,
      );
    closeModal();
    updateTopbar();
    renderInventory();
    toast(`${item.name} used.`, "success");
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
    toast(`${item.name} sold.`, "success");
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
            `<div class="detail-stat"><span>${U.title(k)}</span><b>+${v}</b></div>`,
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
    if (!name) return toast("The clan needs a name.", "error");
    state.clan = {
      name,
      motto: motto || "We endure what the moon forgets.",
      emblem,
      fortress: 1,
      strength: 350,
      donations: 0,
      victories: 0,
      rank: U.rand(300, 900),
      members: [],
      chat: [
        {
          name: "Fortress Echo",
          icon: "⌂",
          text: "The hall recognizes a new banner.",
        },
      ],
    };
    state.player.clan = name;
    renderClan();
    renderSidebar();
    saveGame();
  }
  function inviteClanMember() {
    if (state.clan.members.length >= 8)
      return toast(
        "The current fortress cannot house more companions.",
        "error",
      );
    const faction = state.player.faction,
      spec = U.pick(Object.keys(D.factions[faction].specs));
    const m = {
      name: `${U.pick(D.names.first)} ${U.pick(D.names.last)}`,
      level: U.clamp(state.player.level + U.rand(-3, 2), 1, 40),
      role: U.pick(["Scout", "Warden", "Quartermaster", "Ritualist", "Hunter"]),
      personality: U.pick([
        "Taciturn",
        "Loyal",
        "Restless",
        "Scholarly",
        "Reckless",
      ]),
      gear: U.rand(120, 900),
      faction,
      spec,
    };
    state.clan.members.push(m);
    state.clan.strength += m.level * 15 + m.gear;
    state.clan.chat.push({
      name: m.name,
      icon: D.factions[faction].emblem,
      text: U.pick(D.chatLines),
    });
    renderClan();
    toast(`${m.name} joined the clan.`, "success");
    saveGame();
  }
  function clanDonate() {
    if (state.player.gold < 100) return;
    state.player.gold -= 100;
    state.clan.donations += 100;
    state.clan.strength += 35;
    state.metrics.clanDonations++;
    if (state.clan.donations >= state.clan.fortress * 600) {
      state.clan.fortress++;
      state.clan.chat.push({
        name: "Fortress Echo",
        icon: "⌂",
        text: `The fortress has reached level ${state.clan.fortress}.`,
      });
    }
    syncMissionProgress();
    checkAchievements();
    renderClan();
    updateTopbar();
    saveGame();
  }
  function clanBattle() {
    const enemy = U.pick(D.names.clans),
      your = state.clan.strength + U.rand(0, 700),
      their = state.player.level * 110 + U.rand(100, 2500),
      win = your >= their;
    if (win) {
      state.clan.victories++;
      state.clan.strength += 120;
      state.player.gold += 160;
      state.clan.rank = Math.max(1, state.clan.rank - U.rand(2, 12));
    } else state.clan.strength = Math.max(100, state.clan.strength - 20);
    state.clan.chat.push({
      name: "War Table",
      icon: "⚔",
      text: `The simulated clash against ${enemy} ended in ${win ? "victory" : "defeat"}.`,
    });
    renderClan();
    toast(
      `${win ? "Victory" : "Defeat"} against ${enemy}.`,
      win ? "success" : "error",
    );
    saveGame();
  }

  function openBestiary(id) {
    const e =
        D.enemies.find((x) => x.id === id) || D.bosses.find((x) => x.id === id),
      entry = state.bestiary[id];
    if (!e || !entry) return;
    openModal({
      title: e.name,
      body: `<div class="detail-columns"><div class="detail-art">${e.icon}</div><div><span class="pill">${U.title(e.type)}</span><p>${esc(e.description)}</p><div class="list">${panelListItem("⌖", "Weaknesses", (e.weaknesses || ["Telegraphed attacks"]).join(", "))}${panelListItem("⬟", "Resistances", (e.resistances || ["Control"]).join(", "))}${panelListItem("⚔", "Known Abilities", (e.abilities || [e.signature]).join(", "))}${panelListItem("◆", "Possible Drops", (e.drops || [e.exclusive || "Regional equipment"]).join(", "))}</div></div></div>`,
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

  function openForge() {
    const items = state.player.inventory.filter((i) => i.slot && !i.locked);
    openModal({
      title: "Black Forge",
      wide: true,
      body: `<p>Upgrade equipment safely, dismantle unwanted gear or reroll one secondary stat. No process destroys the item.</p><div class="list">${
        items
          .slice(0, 12)
          .map((i) =>
            panelListItem(
              i.icon,
              esc(i.name),
              `Upgrade +${i.upgrade || 0} • ${U.title(i.rarity)}`,
              `<div><button class="btn btn-small btn-ghost" data-modal-action="forge-upgrade" data-payload="${i.id}">Upgrade</button> <button class="btn btn-small btn-danger" data-modal-action="dismantle-item" data-payload="${i.id}">Dismantle</button></div>`,
            ),
          )
          .join("") ||
        '<p class="muted">No eligible equipment in inventory.</p>'
      }</div>`,
    });
  }
  function forgeUpgrade(id) {
    const item = state.player.inventory.find((i) => i.id === id);
    if (!item) return;
    const cost = Math.max(
      1,
      Math.floor(
        C.crafting.upgradeGold(item.upgrade || 0) *
          (1 - hideoutBonus("craftBonus") * 0.05),
      ),
    );
    if (state.player.gold < cost) return toast("Not enough gold.", "error");
    state.player.gold -= cost;
    item.upgrade = (item.upgrade || 0) + 1;
    Object.keys(item.stats).forEach(
      (k) => (item.stats[k] = Math.ceil(item.stats[k] * 1.08)),
    );
    toast(`${item.name} upgraded to +${item.upgrade}.`, "success");
    closeModal();
    openForge();
    updateTopbar();
    saveGame();
  }
  function dismantleItem(id) {
    const item = state.player.inventory.find((i) => i.id === id);
    if (!item || item.locked) return;
    state.player.inventory = state.player.inventory.filter((i) => i.id !== id);
    const mats = U.rand(1, 3);
    for (let j = 0; j < mats; j++) {
      const m = U.pick(D.materials.slice(0, 6));
      state.player.materials[m] = (state.player.materials[m] || 0) + 1;
    }
    state.metrics.dismantles++;
    syncMissionProgress();
    toast(`${item.name} dismantled into ${mats} materials.`, "success");
    closeModal();
    openForge();
    saveGame();
  }
  function openAlchemy() {
    openModal({
      title: "Alchemist’s Stair",
      body: `<p>Craft restorative tonics with Iron, Leather and Grave Dust.</p><div class="list">${panelListItem("⚗", "Nightroot Tonic", "Restores 45 health • 2 Iron + 1 Leather", `<button class="btn btn-small btn-primary" data-modal-action="craft-tonic">Craft</button>`)}${panelListItem("⚡", "Moonwake Draught", "Restores 8 energy • 2 Moonstone + 1 Grave Dust", `<button class="btn btn-small btn-primary" data-modal-action="craft-energy">Craft</button>`)}</div>`,
    });
  }
  function craft(type) {
    const recipes = {
      tonic: {
        need: { Iron: 2, Leather: 1 },
        item: { name: "Tônico de Raiz Noturna", effect: "heal", amount: 45 },
      },
      energy: {
        need: { Moonstone: 2, "Grave Dust": 1 },
        item: { name: "Moonwake Draught", effect: "energy", amount: 8 },
      },
    };
    const r = recipes[type];
    if (
      !Object.entries(r.need).every(
        ([m, n]) => (state.player.materials[m] || 0) >= n,
      )
    )
      return toast("Missing materials.", "error");
    Object.entries(r.need).forEach(
      ([m, n]) => (state.player.materials[m] -= n),
    );
    const craftTier = hideoutBonus("craftBonus");
    if (craftTier > 0 && U.chance(Math.min(0.5, craftTier * 0.1))) {
      const refunded = U.pick(Object.keys(r.need));
      state.player.materials[refunded] = (state.player.materials[refunded] || 0) + 1;
      toast(`O esconderijo preservou 1 ${materialLabels[refunded] || refunded}.`, "success");
    }
    const existing = state.player.inventory.find((i) => i.name === r.item.name);
    if (existing) existing.count = (existing.count || 1) + 1;
    else
      state.player.inventory.push({
        id: U.uid("cons"),
        type: "consumable",
        icon: type === "tonic" ? "⚗" : "⚡",
        rarity: "uncommon",
        value: 45,
        count: 1,
        locked: false,
        favorite: false,
        flavor: "Crafted in the city from volatile night materials.",
        ...r.item,
      });
    state.metrics.crafts++;
    syncMissionProgress();
    toast(`${r.item.name} crafted.`, "success");
    closeModal();
    openAlchemy();
    saveGame();
  }

  function openDaily() {
    if (!state) return;
    const today = U.dayKey(),
      last = state.daily.lastClaim,
      claimed = last === today;
    const dayIndex = state.daily.streak % 7;
    openModal({
      title: "Seven Nights of Tribute",
      wide: true,
      body: `<p>Claim one in-game reward per local day. A missed day consumes grace before the cycle resets.</p><div class="daily-grid">${C.dailyRewards.map((r, i) => `<div class="daily-day ${i === dayIndex ? "current" : ""} ${i < dayIndex ? "claimed" : ""}"><strong>Night ${i + 1}</strong><div class="reward">${r.icon}</div><small>${r.amount} ${U.title(r.type)}</small></div>`).join("")}</div>`,
      actions: [
        { label: "Close", class: "btn-ghost", action: "close" },
        {
          label: claimed ? "Claimed Today" : "Claim Reward",
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
    a.download = `werewolf-bite-${state.player.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
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
        body: "<p><strong>Werewolf Bite</strong> é um RPG de navegador original de fantasia sombria. Mundo, personagens, facções, sistemas, interface, ilustrações procedurais e narrativa foram criados originalmente para este projeto.</p><p>Entre no Eclipse Oco. Escolha o que sobreviverá.</p>",
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
    if (a === "forge-upgrade") return forgeUpgrade(p);
    if (a === "dismantle-item") return dismantleItem(p);
    if (a === "craft-tonic") return craft("tonic");
    if (a === "craft-energy") return craft("energy");
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
      if (e) e.textContent = muted ? "×" : "♪";
    });
  }

  init();
})();
