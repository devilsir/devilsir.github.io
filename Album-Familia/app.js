(() => {
  "use strict";

  const Core = window.RecordacoesCore;
  if (!Core) throw new Error("recordacoes-core.js precisa ser carregado antes de app.js");
  const TOTAL = 64;
  const DEFAULT_VOLUME = 35;
  const STICKER_NAMES = [
    null,
    "Cleide", "Alexandre", "Rebeca", "Rosinha", "Gabriel e Jane", "Kiara", "Pietro", "Rosa",
    "Kiara", "Lucas, Rebeca, Rosa e Cleide", "Felipe", "Rebeca e Felipe", "Fernanda e Eudes", "Apollo", "Fernanda e Rosa", "Mingau",
    "Eudes", "Alexandre e Eudes", "Walkirene", "Davi", "Lilith", "Alexandre, Rosa e Priscila", "Eudes e Lalá", "Alexandre, Davi e Fernanda",
    "Walkirene", "Valdina", "Valdina e Netos", "Oswaldo e Cleide", "Jane e Gabriel", "Cleide, Helen e Lucas", "Cleide, Rebeca e Lucas", "Oswaldo e Derli",
    "Cleide", "Alexandre e Davi", "Cleide e Pietro", "Cleide e Felipe", "Cleide, Fernanda e Nilton", "Cleide e Amigos", "Cleide e Família", "Cleide, Jane, Gabriel e Lucas",
    "Cleide e Fernanda", "Álbum de Família", "Lucas e Cleide", "Cleide, Lia e Welington", "Cleide e Gabriel", "Cleide", "Alexandre e Fernanda", "Alexandre e Davi",
    "Oswaldo", "Alexandre e Família", "Cleide e Família", "Alexandre e Família", "Lucas, Rebeca e Tainá", "Divino", "Rebeca", "Priscila e Rosa",
    "Alexandre e Família", "Priscila e Larissa", "Alexandre, Cleide e Família", "Alexandre e Priscila", "Alexandre e Família", "Priscila e Família", "Alexandre e Família", "Divino e Felipe"
  ];
  const PAGE_NAMES = [
    "Capa", "Nossa Galeria de Amor", "Laços de Amor I", "Laços de Amor II",
    "Memórias para Sempre", "Momentos em Família", "Momentos Especiais",
    "Nossa Galeria", "Laços e Palavras", "Galeria no Campo I", "Galeria no Campo II", "Contracapa"
  ];
  const PUZZLE_TYPES = [
    { key: "numbers", title: "Quebra-cabeça numérico", short: "Ordene os números", description: "Mova as peças para colocar todos os números na ordem correta." },
    { key: "image", title: "Mosaico da lembrança", short: "Monte a imagem", description: "Deslize os pedaços até reconstruir a imagem da figurinha." },
    { key: "memory", title: "Jogo da memória", short: "Encontre os pares", description: "Vire as cartas e encontre todos os símbolos iguais." },
    { key: "snake", title: "Cobrinha do carinho", short: "Alcance a pontuação", description: "Guie a cobrinha, pegue os corações e não bata nas paredes." },
    { key: "tetris", title: "Blocos em família", short: "Some pontos", description: "Encaixe os blocos e alcance a pontuação indicada." },
    { key: "luxor", title: "Luxor das Recordações", short: "Cumpra as metas de cor", description: "Mire na corrente em movimento, forme grupos de 3 ou mais, provoque reações em cadeia e cumpra as metas antes do portal." },
    { key: "simon", title: "Sequência de cores", short: "Repita a sequência", description: "Observe as luzes e repita a ordem sem errar." },
    { key: "lights", title: "Luzes da casa", short: "Acenda os corações", description: "Toque nos quadrados para deixar todas as luzes acesas." }
  ];
  const FREE_DIFFICULTIES = [
    { key: "facil", label: "Fácil", rank: 1, level: 1, color: "#6f925e", description: "Tabuleiros menores, ritmo tranquilo e mais espaço para aprender." },
    { key: "normal", label: "Normal", rank: 2, level: 3, color: "#4f7f91", description: "O equilíbrio ideal entre raciocínio, velocidade e precisão." },
    { key: "dificil", label: "Difícil", rank: 3, level: 5, color: "#c27a39", description: "Metas maiores, menos ajuda e decisões mais rápidas." },
    { key: "extremo", label: "Extremo", rank: 4, level: 7, color: "#7d568e", description: "Alta velocidade, sequências longas e pouco espaço para erros." },
    { key: "inferno", label: "Inferno", rank: 5, level: 8, color: "#a73f35", description: "A versão máxima de cada jogo: brutal, veloz e feita para recordistas." }
  ];
  const FREE_GAME_DETAILS = {
    numbers: { icon: "15", accent: "#d19a3e", tagline: "Ordem contra o relógio" },
    image: { icon: "▧", accent: "#bb6248", tagline: "Reconstrua uma lembrança" },
    memory: { icon: "✦", accent: "#806394", tagline: "Pares, sequência e combo" },
    snake: { icon: "➜", accent: "#648457", tagline: "Reflexos em alta velocidade" },
    tetris: { icon: "▦", accent: "#4f7d82", tagline: "Linhas, bônus e sobrevivência" },
    luxor: { icon: "●", accent: "#c45d49", tagline: "Correntes, explosões e combos" },
    simon: { icon: "◉", accent: "#b176a3", tagline: "Memorize sequências crescentes" },
    lights: { icon: "☀", accent: "#d2a13e", tagline: "Apague o caos, acenda tudo" }
  };
  const FREE_SETTINGS = {
    numbers: [
      { size: 3, shuffle: 16 }, { size: 4, shuffle: 30 }, { size: 4, shuffle: 48 }, { size: 5, shuffle: 72 }, { size: 5, shuffle: 100 }
    ],
    image: [
      { size: 3, shuffle: 16, hints: 4 }, { size: 3, shuffle: 30, hints: 3 }, { size: 4, shuffle: 50, hints: 2 }, { size: 4, shuffle: 74, hints: 1 }, { size: 5, shuffle: 105, hints: 0 }
    ],
    memory: [
      { pairs: 4, preview: 1100 }, { pairs: 6, preview: 800 }, { pairs: 8, preview: 450 }, { pairs: 10, preview: 0 }, { pairs: 12, preview: 0 }
    ],
    snake: [
      { target: 5, interval: 170, obstacles: 0 }, { target: 8, interval: 145, obstacles: 0 }, { target: 12, interval: 118, obstacles: 3 }, { target: 17, interval: 92, obstacles: 6 }, { target: 24, interval: 70, obstacles: 10 }
    ],
    tetris: [
      { target: 140, interval: 620 }, { target: 240, interval: 500 }, { target: 380, interval: 390 }, { target: 560, interval: 285 }, { target: 800, interval: 205 }
    ],
    simon: [
      { rounds: 2, length: 3 }, { rounds: 3, length: 4 }, { rounds: 4, length: 5 }, { rounds: 5, length: 6 }, { rounds: 6, length: 7 }
    ],
    lights: [
      { size: 3, scramble: 4 }, { size: 4, scramble: 7 }, { size: 4, scramble: 11 }, { size: 5, scramble: 17 }, { size: 6, scramble: 25 }
    ]
  };
  const FREE_PHASES = Core.FREE_PHASES;
  const DIFFICULTY_KEYS = Core.DIFFICULTY_KEYS;
  const FREE_SCORE_BASE_TIMES = { numbers: 90000, image: 110000, memory: 90000, snake: 75000, tetris: 150000, luxor: 180000, simon: 95000, lights: 85000 };
  const FREE_DIFFICULTY_MULTIPLIERS = [1, 1.35, 1.8, 2.45, 3.25];
  const FREE_PHASE_MULTIPLIERS = [1, 1.08, 1.17, 1.27, 1.38, 1.5, 1.63, 1.77, 1.92, 2.08];
  const RANKING_GAMES = PUZZLE_TYPES.map(({ key, title }) => ({ key, title }));

  const STICKER_WIDTH = (273 / 1414) * 100;
  const STICKER_HEIGHT = (409 / 2000) * 100;
  const slot = (centerX, centerY, rotate = 0) => ({
    left: centerX - STICKER_WIDTH / 2,
    top: centerY - STICKER_HEIGHT / 2,
    width: STICKER_WIDTH,
    height: STICKER_HEIGHT,
    rotate
  });
  const LUXOR_COLORS = [
    { key: "azul", name: "azul", hex: "#4b7fc1" },
    { key: "vermelho", name: "vermelho", hex: "#c9574f" },
    { key: "verde", name: "verde", hex: "#6f8b57" },
    { key: "dourado", name: "dourado", hex: "#d7a43b" },
    { key: "teal", name: "verde-azulado", hex: "#2b908f" },
    { key: "roxo", name: "roxo", hex: "#8a5cb0" },
    { key: "marrom", name: "marrom", hex: "#8a5b3e" }
  ];
  const LUXOR_ROUTES = [
    {
      name: "Rio das Folhas", theme: "forest",
      d: "M 38 350 C 130 364 205 331 164 286 C 116 234 38 265 42 194 C 47 117 163 116 232 174 C 300 231 363 312 478 300 C 596 287 683 241 638 182 C 594 124 463 171 415 111 C 366 50 470 28 555 73 C 623 109 661 91 683 48",
      start: [38, 350], end: [683, 48]
    },
    {
      name: "Espiral do Sol", theme: "sun",
      d: "M 40 348 C 200 372 474 366 650 322 C 698 310 698 238 651 215 C 547 163 336 296 184 248 C 73 213 54 108 149 64 C 271 8 558 23 645 102 C 703 155 594 190 500 169 C 398 146 294 85 211 129 C 142 166 222 223 315 220 C 392 218 446 185 500 200",
      start: [40, 348], end: [500, 200]
    },
    {
      name: "Serpente de Areia", theme: "desert",
      d: "M 38 350 C 170 371 550 371 681 337 C 716 328 716 284 676 272 C 532 229 183 292 53 244 C 15 230 17 185 59 171 C 211 120 551 194 671 139 C 708 122 701 76 661 62 C 538 20 269 48 172 80 C 105 102 83 75 48 48",
      start: [38, 350], end: [48, 48]
    },
    {
      name: "Laço das Estrelas", theme: "night",
      d: "M 40 340 C 180 365 310 315 352 245 C 399 167 319 89 213 99 C 107 109 79 229 170 266 C 264 304 372 235 430 158 C 487 83 624 87 673 159 C 721 230 634 311 529 288 C 423 265 372 171 423 97 C 470 28 607 25 678 52",
      start: [40, 340], end: [678, 52]
    },
    {
      name: "Templo em Zigue-zague", theme: "temple",
      d: "M 40 350 L 665 350 Q 690 350 690 325 L 690 278 Q 690 254 666 254 L 118 254 Q 88 254 88 224 L 88 178 Q 88 150 116 150 L 602 150 Q 632 150 632 122 L 632 82 Q 632 52 602 52 L 205 52 Q 174 52 174 82 L 174 103 Q 174 122 195 122 L 505 122",
      start: [40, 350], end: [505, 122]
    },
    {
      name: "Coroa Dourada", theme: "royal",
      d: "M 38 344 C 115 356 167 326 214 281 L 302 197 L 385 294 L 475 177 L 556 270 L 681 139 C 700 119 690 84 660 75 C 559 45 488 107 421 92 C 333 72 290 25 208 52 C 137 75 143 132 205 153 C 280 178 376 113 442 145 C 506 176 555 140 597 107 C 628 82 654 58 683 47",
      start: [38, 344], end: [683, 47]
    },
    {
      name: "Caracol de Jade", theme: "jade",
      d: "M 42 348 C 204 373 491 367 646 316 C 704 297 698 219 642 193 C 504 130 259 290 113 213 C 10 158 61 63 160 34 C 293 -4 565 20 650 95 C 721 158 613 257 506 238 C 394 218 339 98 231 115 C 145 128 136 205 206 247 C 278 290 410 261 466 204 C 511 158 466 118 414 128 C 359 139 337 184 360 211",
      start: [42, 348], end: [360, 211]
    },
    {
      name: "Labirinto Final", theme: "volcano",
      d: "M 36 350 C 128 374 217 351 257 304 C 307 246 242 201 154 220 C 62 240 25 164 89 118 C 161 66 281 138 344 92 C 414 40 509 22 584 54 C 665 89 703 164 651 219 C 595 278 482 247 448 190 C 411 127 332 139 316 204 C 297 279 393 331 489 315 C 584 299 664 257 684 206 C 704 156 656 104 614 89",
      start: [36, 350], end: [614, 89]
    }
  ];
  const LUXOR_LEVELS = [
    { waveSpeed: 0.022, speedLabel: "tranquila", palette: 4, missPenalty: 0.010 },
    { waveSpeed: 0.027, speedLabel: "tranquila +", palette: 5, missPenalty: 0.011 },
    { waveSpeed: 0.034, speedLabel: "média", palette: 6, missPenalty: 0.012 },
    { waveSpeed: 0.038, speedLabel: "média +", palette: 7, missPenalty: 0.013 },
    { waveSpeed: 0.042, speedLabel: "média intensa", palette: 7, missPenalty: 0.014 },
    { waveSpeed: 0.046, speedLabel: "rápida", palette: 7, missPenalty: 0.015 },
    { waveSpeed: 0.051, speedLabel: "muito rápida", palette: 7, missPenalty: 0.016 },
    { waveSpeed: 0.057, speedLabel: "extrema", palette: 7, missPenalty: 0.018 }
  ];
  const SLOTS = {
    2: [slot(18.17,41.44,-11.7), slot(51.06,39.91,0.4), slot(84.09,38.94,7.8), slot(18.72,69.66,14.5), slot(51.05,68.40,1.9), slot(81.63,69.72,-12.2)],
    3: [slot(18.42,30.02,-11.5), slot(49.59,31.57,0.6), slot(83.59,30.33,7.7), slot(19.84,57.48,7.9), slot(50.15,59.33,0), slot(82.45,57.85,-12.4), slot(19.74,83.72,-2.6), slot(50.17,85.65,0.6), slot(82.87,85.69,8)],
    4: [slot(18.42,30.02,-11.5), slot(49.59,31.57,0.6), slot(83.59,30.33,7.7), slot(19.84,57.48,7.9), slot(50.15,59.33,0), slot(82.45,57.85,-12.4), slot(19.74,83.72,-2.6), slot(50.17,85.65,0.6), slot(82.87,85.69,8)],
    5: [slot(32.97,36.24,-5.5), slot(64.72,35.42,6.1), slot(33.93,59.84,6), slot(64.68,59.58,-4.1), slot(33.59,83.97,-4.3), slot(64.27,84.38,5.4)],
    6: [slot(79.90,22.45,6), slot(19.81,41.51,-6.4), slot(49.82,43.78,0.3), slot(77.66,46.97,6.8), slot(21.05,65.67,-3.6), slot(78.34,69.55,-0.4)],
    7: [slot(15.13,21.76,-6.4), slot(43.44,31.85,10.5), slot(14.82,48.95,0.7), slot(76.35,79.17,13)],
    8: [slot(18.50,42.00,-8.1), slot(50.31,47.77,-6.5), slot(83.96,46.66,4.6), slot(20.48,71.73,-3.7), slot(50.11,76.78,-11.1), slot(80.72,73.39,7.6)],
    10: [slot(19.05,26.95,-11.7), slot(49.62,28.57,0.4), slot(83.15,26.79,7.9), slot(19.84,54.48,7.9), slot(49.90,56.30,1.9), slot(81.86,54.96,-12.3), slot(17.89,81.13,-2.6), slot(50.16,82.48,0.6), slot(83.70,82.63,7.6)],
    11: [slot(19.05,26.95,-11.7), slot(49.62,28.57,0.4), slot(83.15,26.79,7.9), slot(19.84,54.48,7.9), slot(49.90,56.30,1.9), slot(81.86,54.96,-12.3), slot(17.89,81.13,-2.6), slot(50.16,82.48,0.6), slot(83.70,82.63,7.6)]
  };
  const WRITING_FIELDS = {
    1: [{ key: "dono", label: "Nome de quem é este álbum", placeholder: "Escreva seu nome", left: 15, top: 77.2, width: 70, height: 4.5, className: "name-field" }],
    6: [{ key: "lembrar-1", label: "Hoje eu quero lembrar", placeholder: "Escreva uma lembrança...", left: 32.5, top: 82.0, width: 38.5, height: 6.8 }],
    7: [
      { key: "lembrar-2", label: "Hoje eu quero lembrar", placeholder: "Escreva aqui...", left: 58.0, top: 41.6, width: 34.5, height: 10.8 },
      { key: "dia-especial", label: "O que fez este dia especial", placeholder: "Conte o que tornou esse dia especial...", left: 7.0, top: 69.0, width: 36.0, height: 9.8 }
    ],
    9: [
      { key: "palavras", label: "Palavras que aquecem o coração", placeholder: "Escreva palavras de carinho...", left: 10.5, top: 53.8, width: 38.5, height: 8.2 },
      { key: "juntos", label: "Coisas que amamos fazer juntos", placeholder: "Conte o que vocês gostam de fazer...", left: 52.5, top: 71.0, width: 38.5, height: 8.4 }
    ],
    12: [{ key: "mensagem", label: "Uma mensagem especial", placeholder: "Deixe uma mensagem para a família...", left: 14.0, top: 64.1, width: 72.0, height: 6.4 }]
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const stickerSrc = (id) => `assets/stickers/sticker-${String(id).padStart(3, "0")}.webp`;
  const stickerName = (id) => STICKER_NAMES[Number(id)] || `Figurinha ${String(id).padStart(2, "0")}`;
  const safeScore = (value) => {
    const score = Number(value);
    return Number.isFinite(score) && score > 0 ? Math.round(score) : 0;
  };
  function sanitizeFreeGameTotals(source) {
    const totals = {};
    if (!source || typeof source !== "object") return totals;
    RANKING_GAMES.forEach(({ key }) => {
      const record = source[key];
      const bestPoints = safeScore(record?.bestPoints);
      if (!bestPoints) return;
      totals[key] = {
        bestPoints,
        bestMs: Math.max(0, Math.round(Number(record?.bestMs) || 0)),
        difficultyKey: FREE_DIFFICULTIES.some((difficulty) => difficulty.key === record?.difficultyKey) ? record.difficultyKey : "normal",
        phasesCompleted: clamp(Number(record?.phasesCompleted) || FREE_PHASES, 1, FREE_PHASES)
      };
    });
    return totals;
  }
  function sanitizeFreeProgress(source) {
    const progress = {};
    if (!source || typeof source !== "object") return progress;
    FREE_DIFFICULTIES.forEach((difficulty) => {
      PUZZLE_TYPES.forEach((game) => {
        const key = `${difficulty.key}:${game.key}`;
        const record = source[key];
        if (!record || typeof record !== "object") return;
        const completedPhases = clamp(Number(record.completedPhases) || 0, 0, FREE_PHASES);
        if (!completedPhases) return;
        const phaseDurations = (Array.isArray(record.phaseDurations) ? record.phaseDurations : [])
          .slice(0, completedPhases)
          .map((value) => Math.max(100, Math.round(Number(value) || 0)));
        const phasePoints = (Array.isArray(record.phasePoints) ? record.phasePoints : [])
          .slice(0, completedPhases)
          .map((value) => safeScore(value));
        if (phaseDurations.length !== completedPhases || phasePoints.length !== completedPhases) return;
        progress[key] = {
          completedPhases,
          points: safeScore(record.points) || phasePoints.reduce((total, value) => total + value, 0),
          completedMs: Math.max(0, Math.round(Number(record.completedMs) || phaseDurations.reduce((total, value) => total + value, 0))),
          phaseDurations,
          phasePoints
        };
      });
    });
    return progress;
  }

  function buildPlacements() {
    const placements = {};
    let id = 1;
    Object.entries(SLOTS).forEach(([page, slots]) => {
      slots.forEach((position, index) => { placements[id] = { page: Number(page), index, ...position }; id += 1; });
    });
    return placements;
  }
  const PLACEMENTS = buildPlacements();

  function defaultState() {
    return Core.structuredToRuntime(Core.defaultStructuredSave());
  }
  let pendingSaveNotice = "";
  let state;
  const saveManager = new Core.SaveManager({
    debounceMs: 460,
    onError: (message) => {
      pendingSaveNotice = message;
      if (typeof showToast === "function" && document.readyState !== "loading") showToast(message);
    },
    onExternalUpdate: (runtime) => handleExternalState(runtime)
  });
  const loadedSave = saveManager.load();
  state = loadedSave.runtime;
  let currentView = "album";
  let currentFilter = "all";
  let currentInventoryFilter = "all";
  let currentFreeDifficulty = "normal";
  let currentTextFieldKey = null;
  let brandClickCount = 0;
  let brandClickTimer = null;
  let pendingSticker = null;
  let justPasted = null;
  let currentPuzzleId = null;
  let currentPuzzleChallenge = null;
  let freePlaySession = null;
  let currentProfileId = null;
  let puzzleCleanup = null;
  let puzzleGuide = null;
  let toastTimer = null;
  let scoreClient = null;
  let scoreUser = null;
  let rankingMode = "stickers";
  let rankingGame = "numbers";
  let rankingGameSummary = {};
  let rankingRequestId = 0;
  let scoreSyncTimer = null;
  let supabaseLoadPromise = null;
  let dailyPlaySession = null;
  let luxorCampaignSession = null;
  let resumeSnapshot = null;
  let dailyCountdownTimer = 0;
  let dailyServerContext = null;
  let dailyServerRequest = null;
  let selectedDailyLeaderboardSlot = "featured";
  let selectedLuxorChapter = 1;
  let pendingImportedSave = null;
  let cloudConflict = null;
  let cloudSyncTimer = 0;
  let pendingExternalState = null;

  const elements = {
    albumView: $("#albumView"), challengesView: $("#challengesView"), dailyView: $("#dailyView"), freeView: $("#freeView"), rankingView: $("#rankingView"), inventoryView: $("#inventoryView"), albumPage: $("#albumPage"), pageWrap: $("#pageWrap"),
    interactiveLayer: $("#interactiveLayer"), pageStrip: $("#pageStrip"), pageCounter: $("#pageCounter"), pageEyebrow: $("#pageEyebrow"),
    previousPage: $("#previousPage"), nextPage: $("#nextPage"), pageLoading: $("#pageLoading"), challengeGrid: $("#challengeGrid"),
    miniInventory: $("#miniInventory"), inventoryGrid: $("#inventoryGrid"), filterCount: $("#filterCount"), inventoryFilterCount: $("#inventoryFilterCount"), pasteBanner: $("#pasteBanner"), pasteThumb: $("#pasteThumb"), pasteTitle: $("#pasteTitle"),
    puzzleModal: $("#puzzleModal"), puzzleEyebrow: $("#puzzleEyebrow"), puzzleTitle: $("#puzzleTitle"), puzzleSticker: $("#puzzleSticker"),
    puzzleDescription: $("#puzzleDescription"), puzzleObjective: $("#puzzleObjective"), puzzleStage: $("#puzzleStage"), puzzleStatus: $("#puzzleStatus"),
    restartPuzzle: $("#restartPuzzle"), freeLiveTimer: $("#freeLiveTimer"), puzzleGuideControl: $("#puzzleGuideControl"), puzzleGuideButton: $("#puzzleGuideButton"), puzzleGuideToggle: $("#puzzleGuideToggle"), puzzleGuideState: $("#puzzleGuideState"), puzzleGuideHint: $("#puzzleGuideHint"), backgroundMusic: $("#backgroundMusic"), musicButton: $("#musicButton"), volumePopover: $("#volumePopover"),
    musicVolume: $("#musicVolume"), musicVolumeLabel: $("#musicVolumeLabel"), progressRing: $("#progressRing"), miniProgress: $("#miniProgress"), toast: $("#toast"),
    textStyleModal: $("#textStyleModal"), textFont: $("#textFont"), textColor: $("#textColor"), textStylePreview: $("#textStylePreview"),
    secretModal: $("#secretModal"), secretForm: $("#secretForm"), secretInput: $("#secretInput"),
    profileModal: $("#profileModal"), profileSticker: $("#profileSticker"), profileNumber: $("#profileNumber"), profileName: $("#profileName"),
    profileInfo: $("#profileInfo"), profileText: $("#profileText"), profileLocation: $("#profileLocation"),
    freeGameGrid: $("#freeGameGrid"), freeDifficultyName: $("#freeDifficultyName"), freeDifficultyDescription: $("#freeDifficultyDescription"), freeWins: $("#freeWins"),
    welcomeModal: $("#welcomeModal"), welcomeForm: $("#welcomeForm"), welcomeName: $("#welcomeName"),
    rankingPlayerAvatar: $("#rankingPlayerAvatar"), rankingPlayerName: $("#rankingPlayerName"), rankingPlayerBadge: $("#rankingPlayerBadge"), rankingPlayerTitle: $("#rankingPlayerTitle"), rankingPlayerStickers: $("#rankingPlayerStickers"), rankingPlayerPoints: $("#rankingPlayerPoints"),
    rankingStatus: $("#rankingStatus"), rankingPodium: $("#rankingPodium"), rankingList: $("#rankingList"), rankingGameGrid: $("#rankingGameGrid"), rankingGamePicker: $("#rankingGamePicker"), rankingGameSelect: $("#rankingGameSelect"), refreshRanking: $("#refreshRanking"),
    dailyGrid: $("#dailyGrid"), dailyCountdown: $("#dailyCountdown"), dailyDateLabel: $("#dailyDateLabel"), dailyStatus: $("#dailyStatus"), dailyStreak: $("#dailyStreak"), dailyGrace: $("#dailyGrace"),
    dailyRewardTrack: $("#dailyRewardTrack"), claimDailyReward: $("#claimDailyReward"), dailyLeaderboardSelect: $("#dailyLeaderboardSelect"), dailyRankingStatus: $("#dailyRankingStatus"), dailyRankingList: $("#dailyRankingList"),
    luxorChapterGrid: $("#luxorChapterGrid"), luxorLevelMap: $("#luxorLevelMap"), luxorUnlockedLevel: $("#luxorUnlockedLevel"), luxorTotalStars: $("#luxorTotalStars"), luxorChaptersDone: $("#luxorChaptersDone"), luxorEquippedSummary: $("#luxorEquippedSummary"),
    settingsModal: $("#settingsModal"), cloudStatus: $("#cloudStatus"), importSummary: $("#importSummary"), importSummaryText: $("#importSummaryText"), importSaveFile: $("#importSaveFile"), cosmeticShelf: $("#cosmeticShelf"), cosmeticTokenCount: $("#cosmeticTokenCount"),
    recoveryModal: $("#recoveryModal"), recoveryText: $("#recoveryText"), interruptedSettings: $("#interruptedSettings"), interruptedSettingsText: $("#interruptedSettingsText"),
    cloudConflictModal: $("#cloudConflictModal"), cloudConflictCompare: $("#cloudConflictCompare"), cloudConflictText: $("#cloudConflictText"),
    luxorLoadoutModal: $("#luxorLoadoutModal"), luxorPowerGrid: $("#luxorPowerGrid"), luxorLoadoutCount: $("#luxorLoadoutCount")
  };

  function saveState(immediate = false, markCloudPending = true) {
    if (markCloudPending && state.cloudSync) {
      state.cloudSync.pending = true;
      if (state.cloudSync.status === "synced") state.cloudSync.status = navigator.onLine ? "local" : "offline";
    }
    saveManager.schedule(state, { immediate: Boolean(immediate) });
    updateCloudStatus();
    if (markCloudPending) queueCloudSync();
  }
  function cleanPlayerName(value) {
    return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 32);
  }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }
  function canvasRoundedRect(context, x, y, width, height, radius) {
    if (typeof context.roundRect === "function") context.roundRect(x, y, width, height, radius);
    else context.rect(x, y, width, height);
  }
  function playerInitials(name = state.playerName) {
    const parts = cleanPlayerName(name).split(" ").filter(Boolean);
    return (parts.length ? `${parts[0][0]}${parts.length > 1 ? parts.at(-1)[0] : ""}` : "RF").toLocaleUpperCase("pt-BR");
  }
  function totalFreePoints() {
    return Object.values(state.freeGameTotals || {}).reduce((total, record) => total + safeScore(record?.bestPoints), 0);
  }
  const COSMETIC_FIELDS = Object.freeze({
    badge: { collection: "badges", selected: "selectedBadge" },
    stamp: { collection: "stamps", selected: "selectedStamp" },
    powerSkin: { collection: "powerSkins", selected: "selectedPowerSkin" },
    confetti: { collection: "confettiStyles", selected: "selectedConfetti" },
    title: { collection: "titles", selected: "selectedTitle" }
  });
  const COSMETIC_ICONS = Object.freeze({ badge: "✦", stamp: "❧", powerSkin: "◈", confetti: "❀", title: "♛", reroll: "↻" });
  const cosmeticReward = (type, key) => Core.DAILY_REWARDS.find((reward) => reward.type === type && reward.key === key) || null;
  const cosmeticName = (reward) => reward
    ? reward.name.replace(/^Badge\s+/i, "").replace(/^Carimbo\s+/i, "").replace(/^Visual\s+/i, "").replace(/^Confete\s+de\s+/i, "").replace(/^Título\s+/i, "")
    : "";
  function applyCosmetics() {
    const root = document.documentElement;
    const values = {
      albumStamp: state.cosmetics?.selectedStamp,
      powerSkin: state.cosmetics?.selectedPowerSkin,
      confetti: state.cosmetics?.selectedConfetti
    };
    Object.entries(values).forEach(([name, value]) => {
      if (value) root.dataset[name] = value;
      else delete root.dataset[name];
    });
  }
  function renderCosmeticShelf() {
    if (!elements.cosmeticShelf) return;
    const cosmetics = state.cosmetics;
    elements.cosmeticShelf.replaceChildren();
    elements.cosmeticTokenCount.textContent = `${Number(cosmetics.rerollTokens || 0)} ${Number(cosmetics.rerollTokens || 0) === 1 ? "troca" : "trocas"}`;
    Core.DAILY_REWARDS.forEach((reward) => {
      const mapping = COSMETIC_FIELDS[reward.type];
      const owned = reward.type === "reroll" || Boolean(mapping && cosmetics[mapping.collection]?.includes(reward.key));
      const selected = Boolean(mapping && cosmetics[mapping.selected] === reward.key);
      const item = document.createElement(reward.type === "reroll" ? "article" : "button");
      item.className = `cosmetic-item${owned ? " is-owned" : " is-locked"}${selected ? " is-selected" : ""}`;
      if (item instanceof HTMLButtonElement) {
        item.type = "button";
        item.disabled = !owned;
        item.setAttribute("aria-pressed", String(selected));
        item.setAttribute("aria-label", owned
          ? `${selected ? "Remover" : "Equipar"} ${reward.name}`
          : `${reward.name}, ainda não conquistado`);
        item.addEventListener("click", () => {
          cosmetics[mapping.selected] = selected ? "" : reward.key;
          applyCosmetics();
          saveState(true);
          renderCosmeticShelf();
          renderRankingProfile();
          showToast(selected ? `${cosmeticName(reward)} foi removido do perfil.` : `${cosmeticName(reward)} foi equipado.`);
        });
      }
      const icon = document.createElement("i");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = owned ? COSMETIC_ICONS[reward.type] : "◇";
      const copy = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = cosmeticName(reward);
      const status = document.createElement("small");
      status.textContent = reward.type === "reroll"
        ? `${Number(cosmetics.rerollTokens || 0)} disponível(is)`
        : selected ? "Equipado" : owned ? "Toque para equipar" : "Prêmio ainda bloqueado";
      copy.append(name, status);
      item.append(icon, copy);
      elements.cosmeticShelf.append(item);
    });
  }
  function renderRankingProfile() {
    if (!elements.rankingPlayerName) return;
    const name = cleanPlayerName(state.playerName) || "Jogador";
    const badge = cosmeticReward("badge", state.cosmetics?.selectedBadge);
    const title = cosmeticReward("title", state.cosmetics?.selectedTitle);
    elements.rankingPlayerName.textContent = name;
    elements.rankingPlayerAvatar.textContent = playerInitials(name);
    elements.rankingPlayerStickers.textContent = String(state.unlocked.length);
    elements.rankingPlayerPoints.textContent = totalFreePoints().toLocaleString("pt-BR");
    elements.rankingPlayerBadge.hidden = !badge;
    elements.rankingPlayerBadge.textContent = badge ? `✦ ${cosmeticName(badge)}` : "";
    elements.rankingPlayerTitle.hidden = !title;
    elements.rankingPlayerTitle.textContent = title ? cosmeticName(title) : "";
  }
  function showWelcome() {
    if (!elements.welcomeModal) return;
    elements.welcomeName.value = cleanPlayerName(state.playerName || state.notes.dono);
    elements.welcomeModal.hidden = false;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => elements.welcomeName.focus(), 60);
  }
  function closeWelcome() {
    elements.welcomeModal.hidden = true;
    if (elements.puzzleModal.hidden && elements.profileModal.hidden && elements.textStyleModal.hidden && elements.secretModal.hidden) document.body.style.overflow = "";
  }
  function supabaseSettings() {
    const config = window.ALBUM_SUPABASE || {};
    const url = String(config.url || "").trim().replace(/\/$/, "");
    const anonKey = String(config.anonKey || "").trim();
    return { url, anonKey, scoreFunction: String(config.scoreFunction || "submit-score").trim() || "submit-score" };
  }
  function supabaseConfigured() {
    const { url, anonKey } = supabaseSettings();
    return /^https?:\/\//i.test(url) && anonKey.length > 30 && !anonKey.includes("COLE_");
  }
  function loadSupabaseLibrary() {
    if (window.supabase?.createClient) return Promise.resolve(window.supabase);
    if (supabaseLoadPromise) return supabaseLoadPromise;
    supabaseLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.onload = () => {
        if (window.supabase?.createClient) resolve(window.supabase);
        else {
          supabaseLoadPromise = null;
          reject(new Error("Biblioteca indisponível"));
        }
      };
      script.onerror = () => {
        supabaseLoadPromise = null;
        script.remove();
        reject(new Error("Não foi possível carregar o ranking"));
      };
      document.head.append(script);
    });
    return supabaseLoadPromise;
  }
  async function ensureScoreClient() {
    if (scoreClient && scoreUser) return scoreClient;
    if (!supabaseConfigured()) return null;
    const library = await loadSupabaseLibrary();
    const { url, anonKey } = supabaseSettings();
    scoreClient ||= library.createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
    let { data: sessionData } = await scoreClient.auth.getSession();
    if (!sessionData?.session) {
      const { data, error } = await scoreClient.auth.signInAnonymously({ options: { data: { display_name: cleanPlayerName(state.playerName) } } });
      if (error) throw error;
      sessionData = { session: data.session };
    }
    scoreUser = sessionData.session?.user || null;
    return scoreClient;
  }
  async function syncPlayerProgress() {
    if (!cleanPlayerName(state.playerName) || !supabaseConfigured()) return false;
    try {
      const client = await ensureScoreClient();
      if (!client || !scoreUser) return false;
      const payload = {
        user_id: scoreUser.id,
        display_name: cleanPlayerName(state.playerName),
        unlocked_count: clamp(state.unlocked.length, 0, TOTAL),
        total_free_points: Math.max(0, totalFreePoints()),
        current_daily_streak: Math.max(0, Number(state.dailyChallenges?.streak?.current || 0)),
        best_daily_streak: Math.max(0, Number(state.dailyChallenges?.streak?.best || 0)),
        daily_grace_available: state.dailyChallenges?.streak?.graceAvailable !== false,
        last_daily_date: state.dailyChallenges?.streak?.lastCompletedDate || null,
        updated_at: new Date().toISOString()
      };
      const { error } = await client.from("player_profiles").upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      return true;
    } catch { return false; }
  }
  function queuePlayerSync(delay = 850) {
    clearTimeout(scoreSyncTimer);
    if (!supabaseConfigured() || !cleanPlayerName(state.playerName)) return;
    scoreSyncTimer = window.setTimeout(syncPlayerProgress, delay);
  }
  async function submitOnlineFreeScore(run) {
    if (!supabaseConfigured() || !run || !cleanPlayerName(state.playerName)) return false;
    try {
      const client = await ensureScoreClient();
      if (!client) return false;
      await syncPlayerProgress();
      const { scoreFunction } = supabaseSettings();
      const { error } = await client.functions.invoke(scoreFunction, { body: {
        displayName: cleanPlayerName(state.playerName), gameKey: run.gameKey, difficultyKey: run.difficultyKey,
        phaseDurationsMs: run.phaseDurations, phasesCompleted: clamp(Number(run.phasesCompleted) || run.phaseDurations?.length || 1, 1, FREE_PHASES), unlockedCount: state.unlocked.length
      } });
      if (error) throw error;
      if (currentView === "ranking" && rankingMode === "games") loadRanking();
      return true;
    } catch { return false; }
  }
  function rankingMetric(entry) {
    return rankingMode === "stickers" ? Math.max(0, Number(entry.unlocked_count || 0)) : safeScore(entry.points);
  }
  function rankingMetricLabel(entry) {
    if (rankingMode === "stickers") return `${rankingMetric(entry)} de ${TOTAL} figurinhas`;
    return `${rankingMetric(entry).toLocaleString("pt-BR")} pontos`;
  }
  function rankingSubLabel(entry) {
    if (rankingMode === "stickers") return `${Math.max(0, Number(entry.total_free_points || 0)).toLocaleString("pt-BR")} pontos nos desafios livres`;
    const difficulty = freeDifficulty(entry.difficulty_key);
    const phases = clamp(Number(entry.phases_completed) || FREE_PHASES, 1, FREE_PHASES);
    return `${difficulty.label} · ${phases}/${FREE_PHASES} ${phases === 1 ? "fase" : "fases"} · ${formatDuration(Math.max(0, Number(entry.duration_ms) || 0))}`;
  }
  function gameByKey(gameKey) {
    return PUZZLE_TYPES.find((game) => game.key === gameKey) || PUZZLE_TYPES[0];
  }
  function blankRankingSummary() {
    return Object.fromEntries(RANKING_GAMES.map(({ key }) => [key, { count: 0, topPoints: 0, topDuration: 0, difficultyKey: "normal" }]));
  }
  function localRankingSummary() {
    const summary = blankRankingSummary();
    RANKING_GAMES.forEach(({ key }) => {
      const record = state.freeGameTotals[key] || {};
      const topPoints = safeScore(record.bestPoints);
      if (!topPoints) return;
      summary[key] = {
        count: 1,
        topPoints,
        topDuration: Math.max(0, Number(record.bestMs) || 0),
        difficultyKey: record.difficultyKey || "normal"
      };
    });
    return summary;
  }
  function createRankingSummary(entries = []) {
    const summary = blankRankingSummary();
    const playersByGame = Object.fromEntries(RANKING_GAMES.map(({ key }) => [key, new Set()]));
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
      if (!summary[entry.game_key]) return;
      const points = safeScore(entry.points);
      if (!points) return;
      const item = summary[entry.game_key];
      playersByGame[entry.game_key].add(String(entry.user_id || `${entry.display_name}-${points}`));
      if (points > item.topPoints || (points === item.topPoints && Number(entry.duration_ms || Infinity) < Number(item.topDuration || Infinity))) {
        item.topPoints = points;
        item.topDuration = Math.max(0, Number(entry.duration_ms) || 0);
        item.difficultyKey = entry.difficulty_key || "normal";
      }
    });
    RANKING_GAMES.forEach(({ key }) => {
      summary[key].count = playersByGame[key].size;
      const local = localRankingSummary()[key];
      if (!summary[key].count && local.topPoints) summary[key] = local;
    });
    return summary;
  }
  function renderRankingGameGrid(summary = rankingGameSummary) {
    if (!elements.rankingGameGrid) return;
    rankingGameSummary = summary && typeof summary === "object" ? summary : blankRankingSummary();
    elements.rankingGameGrid.replaceChildren();
    RANKING_GAMES.forEach((game) => {
      const details = FREE_GAME_DETAILS[game.key];
      const record = rankingGameSummary[game.key] || { count: 0, topPoints: 0 };
      const button = document.createElement("button");
      button.type = "button";
      button.className = `ranking-game-card${rankingGame === game.key ? " is-active" : ""}`;
      button.dataset.rankingGame = game.key;
      button.style.setProperty("--ranking-game-accent", details.accent);
      button.setAttribute("aria-pressed", String(rankingGame === game.key));
      const countLabel = record.count ? `${record.count} ${record.count === 1 ? "recordista" : "recordistas"}` : "Sem recordes ainda";
      button.innerHTML = `<span class="ranking-game-icon" aria-hidden="true">${details.icon}</span><span class="ranking-game-copy"><strong>${escapeHTML(game.title)}</strong><small>${countLabel}</small></span><span class="ranking-game-score"><b>${record.topPoints ? safeScore(record.topPoints).toLocaleString("pt-BR") : "—"}</b><small>melhor</small></span>`;
      button.addEventListener("click", () => setRankingGame(game.key));
      elements.rankingGameGrid.append(button);
    });
  }
  function renderRankingEntries(entries) {
    elements.rankingPodium.replaceChildren();
    elements.rankingList.replaceChildren();
    if (!entries.length) {
      const gameTitle = gameByKey(rankingGame).title;
      elements.rankingList.innerHTML = `<div class="ranking-empty">Ainda não há recordistas em ${escapeHTML(gameTitle)}.</div>`;
      return;
    }
    entries.slice(0, 3).forEach((entry, index) => {
      const place = index + 1;
      const card = document.createElement("article");
      card.className = `ranking-podium-card is-${place === 1 ? "first" : place === 2 ? "second" : "third"}${entry.user_id === scoreUser?.id ? " is-you" : ""}`;
      card.style.setProperty("--podium-accent", place === 1 ? "#d2a13e" : place === 2 ? "#81909a" : "#b87550");
      card.innerHTML = `<span class="ranking-podium-place">${place}º</span><strong>${escapeHTML(entry.display_name || "Jogador")}</strong><small>${escapeHTML(rankingMetricLabel(entry))}</small>`;
      elements.rankingPodium.append(card);
    });
    entries.slice(3).forEach((entry, index) => {
      const row = document.createElement("article");
      row.className = `ranking-row${entry.user_id === scoreUser?.id ? " is-you" : ""}`;
      row.innerHTML = `<span class="ranking-row-position">${index + 4}</span><div class="ranking-row-person"><strong>${escapeHTML(entry.display_name || "Jogador")}</strong><small>${escapeHTML(rankingSubLabel(entry))}</small></div><div class="ranking-row-score"><strong>${rankingMetric(entry).toLocaleString("pt-BR")}</strong><small>${rankingMode === "stickers" ? "figurinhas" : "pontos"}</small></div>`;
      elements.rankingList.append(row);
    });
  }
  function localRankingEntry() {
    if (rankingMode === "stickers") return { user_id: "local", display_name: cleanPlayerName(state.playerName) || "Jogador", unlocked_count: state.unlocked.length, total_free_points: totalFreePoints() };
    const record = state.freeGameTotals[rankingGame] || {};
    return { user_id: "local", display_name: cleanPlayerName(state.playerName) || "Jogador", points: safeScore(record.bestPoints), duration_ms: Math.max(0, Number(record.bestMs || 0)), difficulty_key: record.difficultyKey || "normal", phases_completed: clamp(Number(record.phasesCompleted) || FREE_PHASES, 1, FREE_PHASES) };
  }
  async function loadRanking() {
    renderRankingProfile();
    if (rankingMode === "games") renderRankingGameGrid(localRankingSummary());
    const requestId = ++rankingRequestId;
    elements.rankingStatus.textContent = "Carregando recordistas...";
    elements.rankingPodium.replaceChildren();
    elements.rankingList.replaceChildren();
    if (!supabaseConfigured()) {
      const local = localRankingEntry();
      elements.rankingStatus.textContent = rankingMode === "stickers" ? "Seu progresso neste aparelho" : `Ranking de ${gameByKey(rankingGame).title}`;
      renderRankingEntries(rankingMode === "games" && !local.points ? [] : [local]);
      return;
    }
    try {
      const client = await ensureScoreClient();
      if (!client || requestId !== rankingRequestId) return;
      await syncPlayerProgress();
      if (rankingMode === "stickers") {
        const { data, error } = await client.from("player_profiles").select("user_id,display_name,unlocked_count,total_free_points,updated_at").order("unlocked_count", { ascending: false }).order("updated_at", { ascending: true }).limit(20);
        if (error) throw error;
        if (requestId !== rankingRequestId) return;
        elements.rankingStatus.textContent = "Mais figurinhas liberadas";
        renderRankingEntries(Array.isArray(data) ? data : []);
        return;
      }

      const [detailResult, summaryResult] = await Promise.all([
        client.from("free_game_scores").select("user_id,display_name,game_key,difficulty_key,points,duration_ms,phases_completed,updated_at").eq("game_key", rankingGame).order("points", { ascending: false }).order("duration_ms", { ascending: true }).limit(20),
        client.from("free_game_scores").select("user_id,display_name,game_key,difficulty_key,points,duration_ms,phases_completed").order("points", { ascending: false }).order("duration_ms", { ascending: true }).limit(1000)
      ]);
      if (detailResult.error) throw detailResult.error;
      if (requestId !== rankingRequestId) return;
      if (!summaryResult.error) renderRankingGameGrid(createRankingSummary(summaryResult.data));
      elements.rankingStatus.textContent = `Melhores pontuações em ${gameByKey(rankingGame).title}`;
      renderRankingEntries(Array.isArray(detailResult.data) ? detailResult.data : []);
    } catch {
      if (requestId !== rankingRequestId) return;
      elements.rankingStatus.textContent = "Não foi possível atualizar o ranking agora.";
      const local = localRankingEntry();
      renderRankingEntries(rankingMode === "games" && !local.points ? [] : [local]);
    }
  }
  function setRankingGame(gameKey) {
    if (!RANKING_GAMES.some((game) => game.key === gameKey)) return;
    rankingGame = gameKey;
    elements.rankingGameSelect.value = rankingGame;
    renderRankingGameGrid(rankingGameSummary);
    loadRanking();
  }
  function setRankingMode(mode) {
    rankingMode = mode === "games" ? "games" : "stickers";
    $$('[data-ranking-mode]').forEach((button) => {
      const selected = button.dataset.rankingMode === rankingMode;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    elements.rankingGamePicker.hidden = rankingMode !== "games";
    elements.rankingGameGrid.hidden = rankingMode !== "games";
    if (rankingMode === "games") renderRankingGameGrid(localRankingSummary());
    loadRanking();
  }
  function initializePlayerAndRanking() {
    state.playerName = cleanPlayerName(state.playerName || state.notes.dono);
    state.freeGameTotals = sanitizeFreeGameTotals(state.freeGameTotals);
    if (state.playerName) state.notes.dono = state.playerName;
    saveState();
    renderRankingProfile();
    elements.rankingGameSelect.replaceChildren(...RANKING_GAMES.map((game) => {
      const option = document.createElement("option"); option.value = game.key; option.textContent = game.title; return option;
    }));
    elements.rankingGameSelect.value = rankingGame;
    renderRankingGameGrid(localRankingSummary());
    elements.rankingGameGrid.hidden = true;
    if (!state.playerName) showWelcome();
    else { queuePlayerSync(120); if (currentView === "ranking") loadRanking(); }
  }
  function guideAvailableFor(challenge = currentPuzzleChallenge) {
    return Boolean(challenge && challenge.key !== "luxor" && !challenge.freeMode && !freePlaySession);
  }
  function clearPuzzleGuideTarget() {
    $$(".is-guide-target", elements.puzzleStage).forEach((target) => target.classList.remove("is-guide-target"));
    if (elements.puzzleGuideHint) elements.puzzleGuideHint.hidden = true;
  }
  function markPuzzleGuideTarget(target, message = "Toque no destaque") {
    clearPuzzleGuideTarget();
    if (!state.guideMode || !guideAvailableFor() || !target || !target.isConnected) return;
    target.classList.add("is-guide-target");
    if (elements.puzzleGuideHint) {
      elements.puzzleGuideHint.textContent = message;
      elements.puzzleGuideHint.hidden = false;
    }
  }
  function refreshPuzzleGuide() {
    clearPuzzleGuideTarget();
    if (!state.guideMode || !guideAvailableFor() || !puzzleGuide || typeof puzzleGuide.refresh !== "function") return;
    try { puzzleGuide.refresh(); } catch { clearPuzzleGuideTarget(); }
  }
  function setPuzzleGuide(controller) {
    puzzleGuide = controller && typeof controller.refresh === "function" ? controller : null;
    requestAnimationFrame(refreshPuzzleGuide);
  }
  function syncPuzzleGuideUI(challenge = currentPuzzleChallenge) {
    const available = guideAvailableFor(challenge);
    if (!elements.puzzleGuideControl) return;
    elements.puzzleGuideControl.hidden = !available;
    elements.puzzleGuideToggle.checked = available && state.guideMode;
    elements.puzzleGuideState.textContent = available && state.guideMode ? "ON" : "OFF";
    elements.puzzleGuideButton.setAttribute("aria-pressed", String(available && state.guideMode));
    elements.puzzleGuideToggle.setAttribute("aria-label", available && state.guideMode ? "Desativar modo guia" : "Ativar modo guia");
    if (!available || !state.guideMode) clearPuzzleGuideTarget();
    else requestAnimationFrame(refreshPuzzleGuide);
  }
  function togglePuzzleGuide(force) {
    if (!guideAvailableFor()) return;
    state.guideMode = typeof force === "boolean" ? force : !state.guideMode;
    saveState();
    syncPuzzleGuideUI();
  }
  function challengeFor(id) {
    const type = PUZZLE_TYPES[(id - 1) % PUZZLE_TYPES.length];
    const level = Math.floor((id - 1) / PUZZLE_TYPES.length) + 1;
    return { id, level, ...type };
  }
  function freeDifficulty(key = currentFreeDifficulty) {
    return FREE_DIFFICULTIES.find((difficulty) => difficulty.key === key) || FREE_DIFFICULTIES[1];
  }
  function freeRank(challenge) {
    return clamp(Number(challenge.freeDifficultyRank) || 1, 1, FREE_DIFFICULTIES.length);
  }
  function settingsFor(challenge) {
    if (challenge?.settings && typeof challenge.settings === "object") return { ...challenge.settings };
    if (!challenge?.freeMode) return null;
    const phase = clamp(Number(challenge.freePhase) || 1, 1, FREE_PHASES);
    return Core.buildPhaseSettings(
      challenge.key,
      freeRank(challenge),
      phase,
      challenge.seed || `free:${challenge.freeDifficultyKey}:${challenge.key}:${phase}:v2`
    );
  }
  function luxorRequirements(level) {
    const sets = [
      [{ color: "azul", size: 3 }, { color: "vermelho", size: 3 }],
      [{ color: "teal", size: 3 }, { color: "dourado", size: 4 }],
      [{ color: "roxo", size: 3 }, { color: "vermelho", size: 4 }],
      [{ color: "azul", size: 4 }, { color: "teal", size: 3 }, { color: "marrom", size: 3 }],
      [{ color: "verde", size: 4 }, { color: "roxo", size: 4 }, { color: "dourado", size: 3 }],
      [{ color: "marrom", size: 4 }, { color: "dourado", size: 4 }, { color: "teal", size: 4 }],
      [{ color: "vermelho", size: 5 }, { color: "roxo", size: 4 }, { color: "marrom", size: 4 }],
      [{ color: "teal", size: 5 }, { color: "azul", size: 5 }, { color: "roxo", size: 4 }, { color: "dourado", size: 4 }]
    ];
    return sets[(level - 1) % sets.length].map((goal) => ({ ...goal, done: false }));
  }
  function challengeState(id) {
    if (state.placed.includes(id)) return "placed";
    if (state.unlocked.includes(id)) return "available";
    return "locked";
  }
  function objectiveFor(challenge) {
    const { key, level } = challenge;
    const free = settingsFor(challenge);
    if (free) {
      if (key === "numbers") {
        const extras = [
          free.moveLimit ? `até ${free.moveLimitValue} movimentos` : "",
          free.fixed ? `${free.fixed} ${free.fixed === 1 ? "peça fixa" : "peças fixas"}` : "",
          free.trail ? `trilha de ${free.trail} casas` : "",
          free.checkpoints ? `${free.checkpoints} ${free.checkpoints === 1 ? "checkpoint" : "checkpoints"}` : "",
          free.timeLimit ? `limite de ${Math.round(free.timeLimitMs / 1000)} s` : ""
        ].filter(Boolean);
        return `Objetivo: ordene de 1 a ${free.size * free.size - 1} no tabuleiro ${free.size} × ${free.size}${extras.length ? ` com ${extras.join(", ")}` : ""}.`;
      }
      if (key === "image") {
        const extras = [
          free.rotations ? `${free.rotations} peças giradas` : "",
          free.moveLimit ? `até ${free.moveLimitValue} movimentos` : "",
          free.cornerHints ? "dicas de canto" : "",
          free.missingVariant ? "uma posição de peça ausente" : "",
          `${free.previewTokens ?? 0} prévias`
        ].filter(Boolean);
        return `Objetivo: reconstrua a figurinha em ${free.size} × ${free.size}${extras.length ? ` com ${extras.join(", ")}` : ""}.`;
      }
      if (key === "memory") {
        const extras = [
          free.mistakeLimit ? `máximo de ${free.mistakeLimitValue} erros` : "",
          free.movingCards ? "cartas móveis" : "",
          free.lockedPairs ? `${free.lockedPairs} pares trancados` : "",
          free.sequenceMatch ? "pares em sequência" : "",
          free.timeLimit ? `${Math.round(free.timeLimitMs / 1000)} s` : ""
        ].filter(Boolean);
        return `Objetivo: encontre ${free.pairs} pares${extras.length ? ` com ${extras.join(", ")}` : ""}.`;
      }
      if (key === "snake") {
        if (free.mode === "survival") return `Objetivo: sobreviva por ${free.survivalSeconds} segundos, mantenha a comida alcançável e desvie dos perigos móveis.`;
        if (free.mode === "checkpoint") return `Objetivo: atravesse ${free.checkpoints} checkpoints e colete ${free.target} corações.`;
        return `Objetivo: pegue ${free.target} corações no mapa “${free.map}”${free.multiplierFood ? ", incluindo bônus multiplicadores" : ""}.`;
      }
      if (key === "tetris") {
        if (free.objective === "lines") return `Objetivo: limpe ${free.linesTarget} linhas usando fila de 3 peças, sombra e queda rápida.`;
        if (free.objective === "combo") return `Objetivo: alcance combo ×${free.comboTarget} e ${free.target} pontos.`;
        if (free.objective === "backToBack") return `Objetivo: faça uma sequência back-to-back e alcance ${free.target} pontos.`;
        return `Objetivo: alcance ${free.target} pontos${free.garbageRows ? ` com ${free.garbageRows} linhas de obstáculo` : ""}.`;
      }
      if (key === "luxor") {
        const labels = {
          clear: `limpe ${free.clearTarget} bolinhas`,
          colors: "destrua os grupos de cor indicados",
          waves: `supere ${free.waves} ondas`,
          score: `alcance ${free.scoreTarget.toLocaleString("pt-BR")} pontos`,
          armored: `quebre ${free.armoredTarget} blindagens`,
          chains: `faça ${free.chainTarget} reações em cadeia`,
          rescue: `resgate ${free.rescueTarget} memórias`,
          checkpoint: "limpe a corrente antes do checkpoint",
          misses: `use no máximo ${free.missLimit} erros`,
          guardian: "supere as três ondas do guardião"
        };
        return `Objetivo: ${labels[free.objectiveType] || labels.clear}.`;
      }
      if (key === "simon") {
        const extras = [free.reverse ? "rodadas reversas" : "", free.distractors ? "pulsos distratores" : "", free.errorLimit ? `${free.errorLimit} erro permitido` : ""].filter(Boolean);
        return `Objetivo: vença ${free.rounds} rodadas de ${free.length}+ sinais${extras.length ? ` com ${extras.join(", ")}` : ""}.`;
      }
      if (key === "lights") {
        return `Objetivo: complete ${free.stages || 1} ${free.stages > 1 ? "tabuleiros" : "tabuleiro"} ${free.size} × ${free.size} usando a regra ${free.rule}${free.moveLimit ? ` em até ${free.moveLimitValue} toques por etapa` : ""}.`;
      }
    }
    if (key === "numbers") return "Objetivo: deixe os números de 1 a 15 em ordem.";
    if (key === "image") return "Objetivo: monte a imagem completa em 3 × 3.";
    if (key === "memory") return `Objetivo: encontre ${4 + (level % 3)} pares.`;
    if (key === "snake") return `Objetivo: faça ${4 + (level % 4)} pontos.`;
    if (key === "tetris") return `Objetivo: alcance ${120 + level * 20} pontos.`;
    if (key === "luxor") return `Objetivo: ${luxorRequirements(level).map((goal) => `1 grupo de ${goal.size} ${goal.color}`).join(" e ")}.`;
    if (key === "simon") return `Objetivo: complete ${2 + (level % 2)} rodadas.`;
    return "Objetivo: acenda todos os 16 corações.";
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2400);
  }

  function updateCloudStatus() {
    if (!elements?.cloudStatus || !state?.cloudSync) return;
    const configured = supabaseConfigured();
    const status = !configured ? "local" : !navigator.onLine ? "offline" : state.cloudSync.status || "local";
    const labels = { local: "Somente local", syncing: "Sincronizando", synced: "Sincronizado", offline: "Offline", conflict: "Conflito" };
    elements.cloudStatus.className = `cloud-status is-${status}`;
    elements.cloudStatus.innerHTML = `<i></i>${labels[status] || labels.local}`;
    const syncButton = $("#syncSaveNow");
    if (syncButton) {
      syncButton.disabled = !configured || status === "syncing" || !navigator.onLine;
      syncButton.textContent = status === "syncing" ? "Sincronizando…" : "↻ Sincronizar agora";
    }
  }

  function applyAccessibilitySettings() {
    document.documentElement.classList.toggle("reduce-motion", Boolean(state.reducedMotion));
    document.documentElement.classList.toggle("high-contrast", Boolean(state.highContrast));
    const reduced = $("#reducedMotionSetting");
    const contrast = $("#highContrastSetting");
    const aim = $("#aimAssistSetting");
    if (reduced) reduced.checked = Boolean(state.reducedMotion);
    if (contrast) contrast.checked = Boolean(state.highContrast);
    if (aim) aim.checked = Boolean(state.accessibilityAimAssist);
  }

  function handleExternalState(runtime) {
    if (!runtime?.__meta || runtime.__meta.revision <= Number(state?.__meta?.revision || 0)) return;
    if (state.activeSession || freePlaySession || dailyPlaySession || luxorCampaignSession) {
      pendingExternalState = runtime;
      showToast("Outra aba possui mudanças mais recentes. Feche a partida para atualizar com segurança.");
      return;
    }
    state = runtime;
    applyVolume(state.volume);
    applyAccessibilitySettings();
    renderAll();
    renderDaily();
    renderLuxorCampaign();
    updateCloudStatus();
    showToast("Progresso atualizado por outra aba.");
  }
  function applyPendingExternalState() {
    if (!pendingExternalState || freePlaySession || dailyPlaySession || luxorCampaignSession) return;
    const external = pendingExternalState;
    pendingExternalState = null;
    const localStructured = Core.runtimeToStructured(state, Number(state.__meta?.revision || 0));
    const externalStructured = Core.runtimeToStructured(external, Number(external.__meta?.revision || 0));
    const merged = Core.mergeSafeStructured(localStructured, externalStructured);
    state = Core.structuredToRuntime(merged);
    saveState(true);
    applyVolume(state.volume);
    applyAccessibilitySettings();
    renderAll();
    updateCloudStatus();
    showToast("As mudanças da outra aba foram mescladas com segurança.");
  }

  let activeSnapshotTimer = 0;
  function setActiveSessionSnapshot(snapshot, immediate = false) {
    const sanitized = Core.sanitizeActiveSession({ ...snapshot, savedAt: new Date().toISOString() });
    if (!sanitized) return false;
    state.activeSession = sanitized;
    if (state.luxor) state.luxor.activeSession = sanitized.gameKey === "luxor" ? sanitized : null;
    if (state.dailyChallenges) state.dailyChallenges.activeSession = sanitized.kind === "daily" ? sanitized : null;
    clearTimeout(activeSnapshotTimer);
    if (immediate) saveState(true);
    else activeSnapshotTimer = window.setTimeout(() => saveState(false), 700);
    renderInterruptedSession();
    return true;
  }

  function updateActiveGameSnapshot(game, activeElapsedMs) {
    if (!state.activeSession) return;
    setActiveSessionSnapshot({
      ...state.activeSession,
      activeElapsedMs: Math.max(0, Math.round(Number(activeElapsedMs ?? state.activeSession.activeElapsedMs) || 0)),
      game
    });
  }

  function clearActiveSessionSnapshot(immediate = false) {
    clearTimeout(activeSnapshotTimer);
    state.activeSession = null;
    if (state.luxor) state.luxor.activeSession = null;
    if (state.dailyChallenges) state.dailyChallenges.activeSession = null;
    saveState(immediate);
    renderInterruptedSession();
  }

  function restoredGameState(gameKey) {
    return resumeSnapshot?.gameKey === gameKey && resumeSnapshot?.game && typeof resumeSnapshot.game === "object"
      ? resumeSnapshot.game
      : null;
  }

  function interruptedLabel(snapshot = state.activeSession) {
    if (!snapshot) return "";
    const game = gameByKey(snapshot.gameKey).title;
    if (snapshot.kind === "daily") return `${game} · desafio diário ${snapshot.slot === "quick" ? "rápido" : snapshot.slot === "mastery" ? "de maestria" : "em destaque"}`;
    if (snapshot.kind === "luxorCampaign") return `Luxor das Recordações · nível ${snapshot.level}`;
    return `${game} · ${freeDifficulty(snapshot.difficultyKey).label} · fase ${snapshot.phase}/${FREE_PHASES}`;
  }

  function renderInterruptedSession() {
    const snapshot = state.activeSession;
    if (elements.interruptedSettings) elements.interruptedSettings.hidden = !snapshot;
    if (snapshot && elements.interruptedSettingsText) elements.interruptedSettingsText.textContent = `${interruptedLabel(snapshot)} está pausado.`;
  }

  function showRecoveryIfNeeded() {
    const snapshot = state.activeSession;
    if (!snapshot || !elements.recoveryModal) return;
    elements.recoveryText.textContent = `${interruptedLabel(snapshot)} foi salvo com ${formatDuration(snapshot.activeElapsedMs)} de tempo ativo. Nada avançou enquanto o álbum esteve fechado.`;
    elements.recoveryModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeRecovery() {
    elements.recoveryModal.hidden = true;
    if (elements.settingsModal.hidden && elements.puzzleModal.hidden) document.body.style.overflow = "";
  }

  function resumeInterrupted(restart = false) {
    const snapshot = state.activeSession;
    if (!snapshot) return;
    closeRecovery();
    closeSettings();
    resumeSnapshot = restart ? { ...snapshot, activeElapsedMs: 0, game: null } : snapshot;
    if (snapshot.kind === "free") {
      openFreePuzzle(snapshot.gameKey, snapshot.difficultyKey, false);
      return;
    }
    if (snapshot.kind === "daily") {
      const variants = { [snapshot.slot]: Number(snapshot.context?.variant || 0) };
      const config = Core.buildDailyChallenges(snapshot.dateKey, variants).find((item) => item.slot === snapshot.slot);
      if (config) openDailyPuzzle(config, restart);
      else clearActiveSessionSnapshot(true);
      return;
    }
    if (snapshot.kind === "luxorCampaign") {
      openLuxorCampaignLevel(snapshot.level, restart);
      return;
    }
    clearActiveSessionSnapshot(true);
  }

  function discardInterrupted() {
    closeRecovery();
    clearActiveSessionSnapshot(true);
    showToast("Partida interrompida descartada. O restante do progresso foi preservado.");
    applyPendingExternalState();
  }

  function trustedDailyDate() {
    const daily = state.dailyChallenges ||= Core.defaultDaily();
    if (dailyPlaySession?.dateKey) return dailyPlaySession.dateKey;
    const localDate = Core.saoPauloDateKey();
    const lastDate = daily.lastTrusted?.dateKey;
    const now = Date.now();
    let selected = localDate;
    if (lastDate && Core.dateDifferenceDays(localDate, lastDate) > 0 && now >= Number(daily.lastTrusted?.epoch || 0)) selected = lastDate;
    if (dailyServerContext?.dateKey) selected = dailyServerContext.dateKey;
    daily.lastTrusted = { dateKey: selected, epoch: Math.max(now, Number(daily.lastTrusted?.epoch || 0)) };
    daily.currentDate = selected;
    return selected;
  }

  function ensureDailyDay(dateKey = trustedDailyDate()) {
    const daily = state.dailyChallenges ||= Core.defaultDaily();
    if (!daily.days || typeof daily.days !== "object") daily.days = {};
    if (!daily.days[dateKey]) {
      daily.days[dateKey] = { challenges: {}, rerollUsed: false, rerolledSlot: "", completed: false, rewardAvailable: false, rewardClaimed: false };
    }
    const day = daily.days[dateKey];
    if (!day.challenges || typeof day.challenges !== "object") day.challenges = {};
    return day;
  }

  function dailyVariantsFor(day) {
    const variants = {};
    Core.DAILY_SLOTS.forEach((slot) => {
      variants[slot] = Number(day.challenges?.[slot]?.variant || (day.rerolledSlot === slot ? 1 : 0));
    });
    return variants;
  }

  function dailyConfigToChallenge(config) {
    const type = gameByKey(config.gameKey);
    const gameIndex = PUZZLE_TYPES.findIndex((game) => game.key === config.gameKey);
    const id = clamp(config.difficultyRank * 8 - 7 + Math.max(0, gameIndex), 1, TOTAL);
    return {
      ...type,
      id,
      level: clamp(config.difficultyRank + config.phase - 1, 1, 8),
      freeMode: true,
      dailyMode: true,
      dailyId: config.id,
      dailySlot: config.slot,
      dailyDateKey: config.dateKey,
      freeDifficultyKey: config.difficultyKey,
      freeDifficultyRank: config.difficultyRank,
      freeDifficultyLabel: freeDifficulty(config.difficultyKey).label,
      freePhase: config.phase,
      freeTotalPhases: 1,
      seed: config.seed,
      settings: { ...config.settings },
      fixedLoadout: config.fixedLoadout
    };
  }

  function dailyStateLabel(record, day) {
    if (record?.completed && day.rewardClaimed) return "Concluído · recompensa recebida";
    if (record?.completed && day.rewardAvailable) return "Concluído · recompensa disponível";
    if (record?.completed) return "Concluído";
    if (record?.attempts) return "Tentado";
    return "Disponível";
  }

  function renderDaily() {
    if (!elements.dailyGrid) return;
    const dateKey = trustedDailyDate();
    const day = ensureDailyDay(dateKey);
    const configs = Core.buildDailyChallenges(dateKey, dailyVariantsFor(day));
    const streak = state.dailyChallenges.streak;
    elements.dailyStreak.textContent = String(streak.current || 0);
    elements.dailyGrace.textContent = streak.graceAvailable
      ? "1 dia de proteção disponível"
      : streak.graceUsedDate ? `Proteção usada em ${streak.graceUsedDate.split("-").reverse().join("/")}` : "Proteção já utilizada";
    elements.dailyDateLabel.textContent = `${dateKey.split("-").reverse().join("/")} · horário de São Paulo`;
    elements.dailyStatus.textContent = day.completed
      ? day.rewardClaimed ? "Desafios concluídos e recompensa recebida." : "Desafios concluídos: sua recompensa está pronta."
      : `${configs.filter((config) => day.challenges?.[config.slot]?.completed).length} de 3 desafios concluídos hoje.`;
    elements.dailyGrid.replaceChildren();
    configs.forEach((config) => {
      const detail = FREE_GAME_DETAILS[config.gameKey];
      const record = day.challenges?.[config.slot] || {};
      const challenge = dailyConfigToChallenge(config);
      const card = document.createElement("article");
      card.className = `daily-card${record.completed ? " is-completed" : ""}`;
      card.style.setProperty("--daily-accent", detail.accent);
      const attempts = Number(record.attempts || 0);
      const hasEarnedReroll = Number(state.cosmetics?.rerollTokens || 0) > 0;
      const rerollAvailable = !record.completed && Number(record.variant || 0) === 0 && (!day.rerollUsed || hasEarnedReroll);
      const rerollTitle = !rerollAvailable
        ? "Este desafio não pode mais ser trocado hoje"
        : day.rerollUsed
          ? `Usar 1 ficha conquistada · ${state.cosmetics.rerollTokens} disponível(is)`
          : "Uma troca gratuita disponível hoje";
      card.innerHTML = `
        <div class="daily-card-top">
          <span class="daily-card-kicker">${escapeHTML(freeDifficulty(config.difficultyKey).label)} · fase-base ${config.phase}</span>
          <div class="daily-card-game"><strong>${escapeHTML(config.title)}</strong><i aria-hidden="true">${detail.icon}</i></div>
        </div>
        <div class="daily-card-body">
          <span class="daily-card-state">${dailyStateLabel(record, day)}</span>
          <h3>${escapeHTML(gameByKey(config.gameKey).title)}</h3>
          <p>${escapeHTML(config.description)} A configuração é igual para todos os jogadores nesta data.</p>
          <div class="daily-card-objective">${escapeHTML(objectiveFor(challenge))}</div>
          <div class="daily-card-record">
            <span><small>Melhor pontuação</small><strong>${record.bestScore ? Number(record.bestScore).toLocaleString("pt-BR") : "—"}</strong></span>
            <span><small>Melhor tempo</small><strong>${formatDuration(Number(record.bestTime || 0))}</strong></span>
          </div>
          <div class="daily-card-actions">
            <button class="primary-button daily-play" type="button">${record.completed ? "Jogar novamente" : attempts ? "Tentar novamente" : "Jogar agora"}</button>
            <button class="daily-reroll" type="button" aria-label="Trocar este desafio diário" title="${rerollTitle}" ${rerollAvailable ? "" : "disabled"}>↻</button>
          </div>
        </div>`;
      $(".daily-play", card).addEventListener("click", () => openDailyPuzzle(config));
      $(".daily-reroll", card).addEventListener("click", () => rerollDailyChallenge(config.slot));
      elements.dailyGrid.append(card);
    });
    elements.dailyLeaderboardSelect.replaceChildren(...configs.map((config) => {
      const option = document.createElement("option");
      option.value = config.slot;
      option.textContent = config.title;
      return option;
    }));
    elements.dailyLeaderboardSelect.value = selectedDailyLeaderboardSlot;
    renderDailyRewards(dateKey, day);
    renderLocalDailyRanking(selectedDailyLeaderboardSlot);
    startDailyCountdown();
  }

  function startDailyCountdown() {
    clearInterval(dailyCountdownTimer);
    const update = () => {
      if (!elements.dailyCountdown) return;
      const serverRemaining = dailyServerContext
        ? Number(dailyServerContext.rotationRemainingMs || 0) - (performance.now() - Number(dailyServerContext.receivedAtPerformance || 0))
        : NaN;
      const remaining = Number.isFinite(serverRemaining) ? Math.max(0, serverRemaining) : Core.millisecondsToNextSaoPauloDay();
      elements.dailyCountdown.textContent = Core.formatCountdown(remaining);
      const newDate = Core.saoPauloDateKey();
      const serverContextExpired = dailyServerContext && Number.isFinite(serverRemaining) && serverRemaining <= 0;
      if (!dailyPlaySession && serverContextExpired) {
        dailyServerContext = null;
        state.dailyChallenges.currentDate = newDate;
        fetchDailyServerContext();
        renderDaily();
      } else if (!dailyPlaySession && newDate !== state.dailyChallenges.currentDate && !dailyServerContext?.dateKey) {
        state.dailyChallenges.currentDate = newDate;
        renderDaily();
      }
    };
    dailyCountdownTimer = window.setInterval(update, 1000);
    update();
  }

  function rerollDailyChallenge(slot) {
    const dateKey = trustedDailyDate();
    const day = ensureDailyDay(dateKey);
    const previousRecord = day.challenges?.[slot] || {};
    if (previousRecord.completed || Number(previousRecord.variant || 0) === 1) return;
    const usingToken = day.rerollUsed;
    if (usingToken && Number(state.cosmetics?.rerollTokens || 0) <= 0) return;
    const current = day.challenges[slot] || {};
    if (usingToken) state.cosmetics.rerollTokens -= 1;
    else {
      day.rerollUsed = true;
      day.rerolledSlot = slot;
    }
    day.challenges[slot] = { ...current, id: "", variant: 1, attempts: 0, completed: false, bestScore: 0, bestTime: 0, lastScore: 0, lastTime: 0 };
    saveState(true);
    renderDaily();
    showToast(usingToken
      ? "Ficha usada. O desafio alternativo continua determinístico para hoje."
      : "Troca gratuita usada. O novo desafio continua determinístico para hoje.");
  }

  function openDailyPuzzle(config, restart = false) {
    cleanupPuzzle();
    const challenge = dailyConfigToChallenge(config);
    const snapshot = resumeSnapshot?.kind === "daily" && resumeSnapshot.dailyId === config.id ? resumeSnapshot : null;
    currentPuzzleId = null;
    freePlaySession = null;
    luxorCampaignSession = null;
    currentPuzzleChallenge = challenge;
    dailyPlaySession = {
      id: config.id,
      dateKey: config.dateKey,
      slot: config.slot,
      variant: config.variant,
      gameKey: config.gameKey,
      difficultyKey: config.difficultyKey,
      seed: config.seed,
      startedAt: Date.now(),
      activeBeforeMs: restart ? 0 : Number(snapshot?.activeElapsedMs || 0),
      fixedLoadout: config.fixedLoadout
    };
    const day = ensureDailyDay(config.dateKey);
    const previous = day.challenges[config.slot] || {};
    day.challenges[config.slot] = {
      ...previous,
      id: config.id,
      variant: config.variant,
      attempts: Number(previous.attempts || 0) + (snapshot && !restart ? 0 : 1),
      completed: Boolean(previous.completed),
      bestScore: Number(previous.bestScore || 0),
      bestTime: Number(previous.bestTime || 0)
    };
    state.dailyChallenges.selectedId = config.id;
    setActiveSessionSnapshot({
      kind: "daily", gameKey: config.gameKey, difficultyKey: config.difficultyKey, phase: config.phase,
      seed: config.seed, dailyId: config.id, dateKey: config.dateKey, slot: config.slot,
      activeElapsedMs: dailyPlaySession.activeBeforeMs,
      context: { variant: config.variant, fixedLoadout: config.fixedLoadout }
    }, true);
    elements.puzzleEyebrow.textContent = `Desafio Diário · ${config.title} · ${freeDifficulty(config.difficultyKey).label}`;
    elements.puzzleTitle.textContent = challenge.title;
    elements.puzzleSticker.src = stickerSrc(challenge.id);
    elements.puzzleSticker.alt = `${stickerName(challenge.id)}, figurinha de apoio`;
    elements.puzzleDescription.textContent = `${challenge.description} Esta partida usa a semente diária ${config.dateKey}.`;
    elements.puzzleObjective.textContent = objectiveFor(challenge);
    elements.puzzleModal.dataset.difficulty = config.difficultyKey;
    elements.puzzleModal.hidden = false;
    document.documentElement.classList.add("puzzle-open");
    document.body.style.overflow = "hidden";
    initPuzzle(challenge);
    resumeSnapshot = null;
  }

  function dailyElapsed() {
    if (!dailyPlaySession) return 0;
    return Math.max(0, Number(dailyPlaySession.activeBeforeMs || 0) + Date.now() - dailyPlaySession.startedAt);
  }

  function updateDailyStreak(dateKey) {
    const streak = state.dailyChallenges.streak;
    if (streak.lastCompletedDate === dateKey) return;
    const difference = streak.lastCompletedDate ? Core.dateDifferenceDays(streak.lastCompletedDate, dateKey) : 1;
    if (difference === 1) streak.current += 1;
    else if (difference === 2 && streak.graceAvailable) {
      streak.current += 1;
      streak.graceAvailable = false;
      streak.graceUsedDate = Core.addDays(dateKey, -1);
    } else streak.current = 1;
    streak.best = Math.max(streak.best, streak.current);
    streak.lastCompletedDate = dateKey;
    if (streak.current > 0 && streak.current % 7 === 0) {
      streak.graceAvailable = true;
      streak.graceUsedDate = "";
    }
  }

  function completeDailyPuzzle(gameResult = {}) {
    if (!dailyPlaySession) return;
    cleanupPuzzle();
    const session = { ...dailyPlaySession };
    const elapsed = Math.max(100, dailyElapsed());
    const config = Core.buildDailyChallenges(session.dateKey, { [session.slot]: session.variant }).find((item) => item.slot === session.slot);
    const base = calculateFreePhasePoints(session.gameKey, session.difficultyKey, config?.phase || 1, elapsed);
    const combo = clamp(Math.round(Number(gameResult.maxCombo || gameResult.combo || 0)), 0, 250);
    const accuracy = clamp(Number(gameResult.accuracy || 0), 0, 100);
    const score = Math.round(base * (config?.rewardPoints || 1) / 2 + combo * 16 + accuracy * 9);
    const day = ensureDailyDay(session.dateKey);
    const record = day.challenges[session.slot] || {};
    const better = score > Number(record.bestScore || 0) || score === Number(record.bestScore || 0) && elapsed < Number(record.bestTime || Infinity);
    day.challenges[session.slot] = {
      ...record,
      id: session.id,
      variant: session.variant,
      completed: true,
      bestScore: better ? score : Number(record.bestScore || 0),
      bestTime: better ? elapsed : Number(record.bestTime || elapsed),
      lastScore: score,
      lastTime: elapsed
    };
    const allCompleted = Core.DAILY_SLOTS.every((slot) => day.challenges?.[slot]?.completed);
    if (allCompleted && !day.completed) {
      day.completed = true;
      day.rewardAvailable = !day.rewardClaimed;
      updateDailyStreak(session.dateKey);
    }
    clearActiveSessionSnapshot(true);
    submitOnlineDailyScore(config, score, elapsed, gameResult);
    dailyPlaySession = null;
    elements.restartPuzzle.hidden = true;
    elements.puzzleStatus.textContent = better ? "Novo recorde diário!" : "Desafio diário concluído!";
    elements.puzzleStage.innerHTML = `<div class="free-success-card" style="--win-accent:${FREE_GAME_DETAILS[session.gameKey].accent}">
      <span class="free-win-emblem">☀</span>
      <span class="free-win-label">${escapeHTML(config?.title || "Desafio diário")} · ${escapeHTML(session.dateKey)}</span>
      <h3>${better ? "Novo recorde do dia!" : "Lembrança registrada!"}</h3>
      <p>Você terminou com <strong>${score.toLocaleString("pt-BR")} pontos</strong> em <strong>${formatDuration(elapsed)}</strong>.</p>
      <div class="free-win-stats"><span><small>Melhor pontuação</small><b>${day.challenges[session.slot].bestScore.toLocaleString("pt-BR")}</b></span><span><small>Desafios concluídos</small><b>${Core.DAILY_SLOTS.filter((slot) => day.challenges?.[slot]?.completed).length}/3</b></span></div>
      <div class="free-win-actions"><button class="primary-button" id="leaveDailyResult" type="button">Voltar aos desafios</button><button class="secondary-button" id="replayDailyResult" type="button">Jogar novamente</button></div>
    </div>`;
    $("#leaveDailyResult").addEventListener("click", () => { closePuzzle(); switchView("daily"); renderDaily(); });
    $("#replayDailyResult").addEventListener("click", () => openDailyPuzzle(config));
    renderDaily();
  }

  function renderDailyRewards(dateKey, day) {
    const rewardsState = state.dailyChallenges.rewards;
    const completedInTrack = Number(rewardsState.claimedDates?.length || 0) % 7;
    elements.dailyRewardTrack.replaceChildren();
    Core.DAILY_REWARDS.forEach((reward, index) => {
      const item = document.createElement("article");
      const current = index === Number(rewardsState.trackDay || 0);
      const claimed = index < completedInTrack;
      item.className = `daily-reward${current ? " is-current" : ""}${claimed ? " is-claimed" : ""}`;
      item.innerHTML = `<i aria-hidden="true">${claimed ? "✓" : index + 1}</i><small>Dia ${index + 1}</small><strong>${escapeHTML(reward.name)}</strong>`;
      elements.dailyRewardTrack.append(item);
    });
    elements.claimDailyReward.disabled = !day.rewardAvailable || day.rewardClaimed;
    elements.claimDailyReward.textContent = day.rewardClaimed ? "Recompensa recebida" : day.rewardAvailable ? "Receber recompensa" : "Complete os 3 desafios";
  }

  function claimDailyReward() {
    const dateKey = trustedDailyDate();
    const day = ensureDailyDay(dateKey);
    if (!day.rewardAvailable || day.rewardClaimed || state.dailyChallenges.rewards.claimedDates.includes(dateKey)) return;
    const trackDay = Number(state.dailyChallenges.rewards.trackDay || 0);
    const reward = Core.DAILY_REWARDS[trackDay];
    const cosmetics = state.cosmetics;
    const add = (field, selectedField, key) => {
      if (!cosmetics[field].includes(key)) cosmetics[field].push(key);
      if (!cosmetics[selectedField]) cosmetics[selectedField] = key;
    };
    if (reward.type === "badge") add("badges", "selectedBadge", reward.key);
    if (reward.type === "stamp") add("stamps", "selectedStamp", reward.key);
    if (reward.type === "powerSkin") add("powerSkins", "selectedPowerSkin", reward.key);
    if (reward.type === "confetti") add("confettiStyles", "selectedConfetti", reward.key);
    if (reward.type === "title") add("titles", "selectedTitle", reward.key);
    if (reward.type === "reroll") cosmetics.rerollTokens = Number(cosmetics.rerollTokens || 0) + 1;
    day.rewardClaimed = true;
    day.rewardAvailable = false;
    state.dailyChallenges.rewards.claimedDates.push(dateKey);
    state.dailyChallenges.rewards.trackDay = (trackDay + 1) % 7;
    saveState(true);
    submitDailyRewardClaim(dateKey, reward);
    applyCosmetics();
    renderDaily();
    renderCosmeticShelf();
    renderRankingProfile();
    showToast(`${reward.name} foi adicionado ao seu perfil.`);
  }

  function renderLocalDailyRanking(slot = selectedDailyLeaderboardSlot) {
    const dateKey = trustedDailyDate();
    const day = ensureDailyDay(dateKey);
    const record = day.challenges?.[slot];
    elements.dailyRankingList.replaceChildren();
    if (!record?.bestScore) {
      elements.dailyRankingStatus.textContent = "Ainda não há recorde local neste desafio.";
      return;
    }
    elements.dailyRankingStatus.textContent = supabaseConfigured() ? "Seu recorde local; atualize para comparar online." : "Recorde salvo offline neste aparelho.";
    const row = document.createElement("article");
    row.className = "daily-ranking-row";
    row.innerHTML = `<span>1</span><div><strong>${escapeHTML(cleanPlayerName(state.playerName) || "Jogador")}</strong><small>${formatDuration(record.bestTime)} · recorde local</small></div><strong>${Number(record.bestScore).toLocaleString("pt-BR")}</strong>`;
    elements.dailyRankingList.append(row);
  }

  async function loadDailyLeaderboard() {
    const dateKey = trustedDailyDate();
    const day = ensureDailyDay(dateKey);
    const configs = Core.buildDailyChallenges(dateKey, dailyVariantsFor(day));
    const config = configs.find((item) => item.slot === selectedDailyLeaderboardSlot);
    if (!config) return;
    renderLocalDailyRanking(config.slot);
    if (!supabaseConfigured()) return;
    elements.dailyRankingStatus.textContent = "Carregando o placar diário…";
    try {
      const client = await ensureScoreClient();
      const { data, error } = await client.from("daily_challenge_scores")
        .select("user_id,display_name,points,duration_ms,updated_at")
        .eq("daily_id", config.id)
        .order("points", { ascending: false })
        .order("duration_ms", { ascending: true })
        .limit(20);
      if (error) throw error;
      elements.dailyRankingList.replaceChildren();
      (data || []).forEach((entry, index) => {
        const row = document.createElement("article");
        row.className = "daily-ranking-row";
        row.innerHTML = `<span>${index + 1}</span><div><strong>${escapeHTML(entry.display_name || "Jogador")}</strong><small>${formatDuration(Number(entry.duration_ms || 0))}</small></div><strong>${Number(entry.points || 0).toLocaleString("pt-BR")}</strong>`;
        elements.dailyRankingList.append(row);
      });
      if (!data?.length) renderLocalDailyRanking(config.slot);
      else elements.dailyRankingStatus.textContent = `Melhores resultados em ${config.title.toLocaleLowerCase("pt-BR")}.`;
    } catch {
      renderLocalDailyRanking(config.slot);
      elements.dailyRankingStatus.textContent = "Placar online indisponível; seu recorde local foi preservado.";
    }
  }

  async function fetchDailyServerContext() {
    if (!supabaseConfigured() || !navigator.onLine || dailyPlaySession) return false;
    if (dailyServerRequest) return dailyServerRequest;
    dailyServerRequest = (async () => {
      try {
        const client = await ensureScoreClient();
        const functionName = String(window.ALBUM_SUPABASE?.dailyFunction || "daily-context");
        const { data, error } = await client.functions.invoke(functionName, { body: { mode: "context" } });
        if (error || !data?.dateKey) throw error || new Error("Contexto diário inválido");
        const serverTime = Date.parse(data.serverTime || "");
        const nextRotationAt = Date.parse(data.nextRotationAt || "");
        const declaredRemaining = Number(data.rotatesInSeconds) * 1000;
        const rotationRemainingMs = Number.isFinite(declaredRemaining) && declaredRemaining > 0
          ? declaredRemaining
          : Number.isFinite(serverTime) && Number.isFinite(nextRotationAt)
            ? Math.max(1000, nextRotationAt - serverTime)
            : Core.millisecondsToNextSaoPauloDay();
        dailyServerContext = {
          ...data,
          rotationRemainingMs,
          receivedAtPerformance: performance.now()
        };
        state.dailyChallenges.lastTrusted = { dateKey: data.dateKey, epoch: Date.now() };
        state.dailyChallenges.currentDate = data.dateKey;
        saveState(false, false);
        renderDaily();
        return true;
      } catch {
        dailyServerContext = null;
        return false;
      } finally {
        dailyServerRequest = null;
      }
    })();
    return dailyServerRequest;
  }

  async function submitOnlineDailyScore(config, points, durationMs, result = {}) {
    if (!config || !supabaseConfigured()) return false;
    try {
      const client = await ensureScoreClient();
      const { scoreFunction } = supabaseSettings();
      const { error } = await client.functions.invoke(scoreFunction, { body: {
        mode: "daily",
        displayName: cleanPlayerName(state.playerName),
        dailyId: config.id,
        dailyDate: config.dateKey,
        slot: config.slot,
        variant: config.variant,
        gameKey: config.gameKey,
        difficultyKey: config.difficultyKey,
        phase: config.phase,
        durationMs: Math.round(durationMs),
        clientPoints: Math.round(points),
        metrics: {
          score: Math.max(0, Math.round(Number(result.score || 0))),
          combo: Math.max(0, Math.round(Number(result.maxCombo || 0))),
          accuracy: clamp(Number(result.accuracy || 0), 0, 100)
        }
      } });
      if (error) throw error;
      if (currentView === "daily") loadDailyLeaderboard();
      return true;
    } catch { return false; }
  }

  async function submitDailyRewardClaim(dateKey, reward) {
    if (!supabaseConfigured() || !reward) return;
    try {
      const client = await ensureScoreClient();
      if (!client || !scoreUser) return;
      await client.from("daily_reward_claims").insert({
        user_id: scoreUser.id,
        challenge_date: dateKey,
        reward_key: reward.key,
        reward_type: reward.type
      });
    } catch { /* a restrição única impede duplicações online; o save local continua válido */ }
  }

  function renderLuxorCampaign() {
    if (!elements.luxorChapterGrid) return;
    const campaign = state.luxor.campaign;
    const levelRecords = campaign.levels || {};
    const totalStars = Object.values(levelRecords).reduce((sum, record) => sum + Number(record?.stars || 0), 0);
    elements.luxorUnlockedLevel.textContent = `${campaign.unlockedLevel}/40`;
    elements.luxorTotalStars.textContent = `${totalStars}/120`;
    elements.luxorChaptersDone.textContent = `${campaign.completedChapters.length}/8`;
    elements.luxorEquippedSummary.textContent = `${state.luxor.equippedPowers.length}`;
    elements.luxorChapterGrid.replaceChildren();
    Core.LUXOR_CHAPTERS.forEach((chapter) => {
      const firstLevel = (chapter.number - 1) * 5 + 1;
      const unlocked = campaign.unlockedLevel >= firstLevel;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `luxor-chapter-card${selectedLuxorChapter === chapter.number ? " is-active" : ""}${unlocked ? "" : " is-locked"}`;
      button.style.setProperty("--chapter-accent", ["#638056","#d09a3d","#b66e3e","#76577f","#7e6849","#a66b42","#4c8370","#9d4438"][chapter.number - 1]);
      button.disabled = !unlocked;
      button.innerHTML = `<b>${chapter.number}</b><small>${escapeHTML(chapter.name)}</small>`;
      button.addEventListener("click", () => {
        selectedLuxorChapter = chapter.number;
        renderLuxorCampaign();
      });
      elements.luxorChapterGrid.append(button);
    });
    const chapter = Core.LUXOR_CHAPTERS[selectedLuxorChapter - 1];
    elements.luxorLevelMap.innerHTML = `<div class="luxor-chapter-copy"><span class="eyebrow">Capítulo ${chapter.number}</span><h3>${escapeHTML(chapter.name)}</h3><p>${escapeHTML(chapter.subtitle)} ${escapeHTML(chapter.detail)}</p></div><div class="luxor-level-buttons"></div>`;
    const buttons = $(".luxor-level-buttons", elements.luxorLevelMap);
    for (let offset = 1; offset <= 5; offset += 1) {
      const level = (chapter.number - 1) * 5 + offset;
      const config = Core.buildLuxorLevel(level);
      const record = levelRecords[String(level)] || {};
      const button = document.createElement("button");
      button.type = "button";
      button.className = `luxor-level-button${config.finale ? " is-finale" : ""}`;
      button.disabled = level > campaign.unlockedLevel;
      button.setAttribute("aria-label", `${config.name}${button.disabled ? ", bloqueado" : ""}; ${record.stars || 0} estrelas`);
      button.innerHTML = `<b>${level}</b><small>${config.finale ? "Guardião" : config.routeVariant}</small><span class="luxor-level-stars">${"★".repeat(record.stars || 0)}${"☆".repeat(3 - (record.stars || 0))}</span>`;
      button.addEventListener("click", () => openLuxorCampaignLevel(level));
      buttons.append(button);
    }
  }

  function openLuxorCampaignLevel(level, restart = false) {
    const config = Core.buildLuxorLevel(level);
    if (level > state.luxor.campaign.unlockedLevel) return;
    cleanupPuzzle();
    const snapshot = resumeSnapshot?.kind === "luxorCampaign" && Number(resumeSnapshot.level) === level ? resumeSnapshot : null;
    currentPuzzleId = null;
    freePlaySession = null;
    dailyPlaySession = null;
    const challenge = {
      ...gameByKey("luxor"),
      id: 6,
      key: "luxor",
      level: clamp(Math.ceil(level / 5), 1, 8),
      luxorCampaign: true,
      luxorCampaignLevel: level,
      luxorConfig: config,
      seed: config.seed,
      settings: null
    };
    currentPuzzleChallenge = challenge;
    luxorCampaignSession = {
      level,
      config,
      startedAt: Date.now(),
      activeBeforeMs: restart ? 0 : Number(snapshot?.activeElapsedMs || 0)
    };
    setActiveSessionSnapshot({
      kind: "luxorCampaign", gameKey: "luxor", difficultyKey: DIFFICULTY_KEYS[clamp(Math.ceil(level / 8), 1, 5) - 1],
      phase: clamp(((level - 1) % 10) + 1, 1, 10), level, seed: config.seed,
      activeElapsedMs: luxorCampaignSession.activeBeforeMs,
      context: { equippedPowers: [...state.luxor.equippedPowers] }
    }, true);
    elements.puzzleEyebrow.textContent = `Luxor das Recordações · Capítulo ${config.chapter} · Nível ${level}/40`;
    elements.puzzleTitle.textContent = config.name;
    elements.puzzleSticker.src = stickerSrc(6);
    elements.puzzleSticker.alt = "Figurinha de apoio da campanha Luxor";
    elements.puzzleDescription.textContent = `${Core.LUXOR_CHAPTERS[config.chapter - 1].subtitle} Percurso ${config.routeVariant}, ${config.waves} ${config.waves === 1 ? "onda" : "ondas"}.`;
    elements.puzzleObjective.textContent = config.objectives.map((objective) => objective.label).join(" · ");
    elements.puzzleModal.dataset.difficulty = DIFFICULTY_KEYS[clamp(Math.ceil(level / 8), 1, 5) - 1];
    elements.puzzleModal.hidden = false;
    document.documentElement.classList.add("puzzle-open");
    document.body.style.overflow = "hidden";
    initPuzzle(challenge);
    resumeSnapshot = null;
  }

  function completeLuxorCampaign(result) {
    if (!luxorCampaignSession) return;
    const session = { ...luxorCampaignSession };
    const elapsed = Math.max(100, Number(result.activeElapsedMs || 0) || session.activeBeforeMs + Date.now() - session.startedAt);
    const level = session.level;
    const previous = state.luxor.campaign.levels[String(level)] || {};
    const score = Math.max(1, Math.round(Number(result.score || 0)));
    const stars = session.config.starThresholds.reduce((count, threshold) => count + (score >= threshold ? 1 : 0), 0);
    const better = score > Number(previous.bestScore || 0) || score === Number(previous.bestScore || 0) && elapsed < Number(previous.bestTime || Infinity);
    state.luxor.campaign.levels[String(level)] = {
      completed: true,
      bestScore: Math.max(score, Number(previous.bestScore || 0)),
      bestTime: better ? elapsed : Number(previous.bestTime || elapsed),
      stars: Math.max(stars, Number(previous.stars || 0)),
      maxCombo: Math.max(Number(result.maxCombo || 0), Number(previous.maxCombo || 0)),
      maxChain: Math.max(Number(result.maxChain || 0), Number(previous.maxChain || 0)),
      accuracy: Math.max(Number(result.accuracy || 0), Number(previous.accuracy || 0)),
      attempts: Number(previous.attempts || 0) + 1
    };
    state.luxor.campaign.unlockedLevel = Math.max(state.luxor.campaign.unlockedLevel, Math.min(40, level + 1));
    if (level % 5 === 0 && !state.luxor.campaign.completedChapters.includes(level / 5)) state.luxor.campaign.completedChapters.push(level / 5);
    state.luxor.stats.highestScore = Math.max(state.luxor.stats.highestScore, score);
    state.luxor.stats.bestCombo = Math.max(state.luxor.stats.bestCombo, Number(result.maxCombo || 0));
    state.luxor.stats.bestChain = Math.max(state.luxor.stats.bestChain, Number(result.maxChain || 0));
    state.luxor.stats.bestAccuracy = Math.max(state.luxor.stats.bestAccuracy, Number(result.accuracy || 0));
    clearActiveSessionSnapshot(true);
    submitOnlineLuxorScore(level, score, elapsed, stars, result);
    luxorCampaignSession = null;
    renderLuxorCampaign();
    return { score, elapsed, stars, better, level, config: session.config };
  }

  async function submitOnlineLuxorScore(level, points, durationMs, stars, result) {
    if (!supabaseConfigured()) return;
    try {
      const client = await ensureScoreClient();
      const { scoreFunction } = supabaseSettings();
      await client.functions.invoke(scoreFunction, { body: {
        mode: "luxorCampaign",
        displayName: cleanPlayerName(state.playerName),
        level,
        points,
        durationMs: Math.round(durationMs),
        stars,
        maxCombo: Math.round(Number(result.maxCombo || 0)),
        maxChain: Math.round(Number(result.maxChain || 0)),
        accuracy: clamp(Number(result.accuracy || 0), 0, 100)
      } });
    } catch { /* ranking opcional */ }
  }

  function renderLuxorLoadout() {
    if (!elements.luxorPowerGrid) return;
    elements.luxorPowerGrid.replaceChildren();
    Core.POWER_DEFINITIONS.forEach((power, index) => {
      const selected = state.luxor.equippedPowers.includes(power.key);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `luxor-power-choice${selected ? " is-selected" : ""}`;
      button.dataset.powerKey = power.key;
      button.style.setProperty("--power-accent", ["#c65e49","#5e8291","#7a5f90","#d09d38","#9673a4","#b06c7e","#66815b","#4f7d82"][index]);
      button.setAttribute("aria-pressed", String(selected));
      button.innerHTML = `<i aria-hidden="true">${["✹","⌛","↶","ϟ","✦","✿","◇","⋰"][index]}</i><strong>${escapeHTML(power.name)}</strong><small>${escapeHTML(power.short)}</small><span>${power.cost}% de carga · tecla ${power.shortcut}</span>`;
      button.addEventListener("click", () => {
        const key = power.key;
        const selectedKeys = $$(".luxor-power-choice.is-selected", elements.luxorPowerGrid).map((item) => item.dataset.powerKey);
        if (button.classList.contains("is-selected")) {
          if (selectedKeys.length <= 1) return;
          button.classList.remove("is-selected");
          button.setAttribute("aria-pressed", "false");
        } else {
          if (selectedKeys.length >= 3) {
            showToast("Escolha no máximo três poderes.");
            return;
          }
          button.classList.add("is-selected");
          button.setAttribute("aria-pressed", "true");
        }
        elements.luxorLoadoutCount.textContent = `${$$(".luxor-power-choice.is-selected", elements.luxorPowerGrid).length} de 3 selecionados`;
      });
      elements.luxorPowerGrid.append(button);
    });
    elements.luxorLoadoutCount.textContent = `${state.luxor.equippedPowers.length} de 3 selecionados`;
  }

  function openLuxorLoadout() {
    renderLuxorLoadout();
    elements.luxorLoadoutModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLuxorLoadout() {
    elements.luxorLoadoutModal.hidden = true;
    if (elements.puzzleModal.hidden && elements.settingsModal.hidden) document.body.style.overflow = "";
  }

  function saveLuxorLoadout() {
    const selected = $$(".luxor-power-choice.is-selected", elements.luxorPowerGrid).map((item) => item.dataset.powerKey);
    if (selected.length !== 3) {
      showToast("Selecione exatamente três poderes.");
      return;
    }
    state.luxor.equippedPowers = selected;
    saveState(true);
    renderLuxorCampaign();
    closeLuxorLoadout();
    showToast("Combinação de poderes salva.");
  }

  function openSettings() {
    renderInterruptedSession();
    applyAccessibilitySettings();
    renderCosmeticShelf();
    updateCloudStatus();
    elements.importSummary.hidden = true;
    pendingImportedSave = null;
    elements.settingsModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeSettings() {
    if (!elements.settingsModal) return;
    elements.settingsModal.hidden = true;
    pendingImportedSave = null;
    elements.importSummary.hidden = true;
    if (elements.puzzleModal.hidden && elements.recoveryModal.hidden && elements.luxorLoadoutModal.hidden) document.body.style.overflow = "";
  }

  function exportSaveFile() {
    const exported = saveManager.export(state);
    const blob = new Blob([exported.text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exported.filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Backup JSON exportado.");
  }

  async function inspectImportedSave(file) {
    if (!file) return;
    try {
      const inspected = saveManager.inspectImport(await file.text());
      pendingImportedSave = inspected;
      const summary = inspected.summary;
      elements.importSummaryText.textContent = `${summary.playerName}: ${summary.unlocked}/64 figurinhas liberadas, ${summary.placed}/64 coladas, ${summary.completedCampaigns} campanhas de 10 fases, ${summary.dailyCompletions} dias completos e ${summary.luxorLevels}/40 níveis Luxor. Atualizado em ${new Date(summary.updatedAt).toLocaleString("pt-BR")}.`;
      elements.importSummary.hidden = false;
    } catch (error) {
      pendingImportedSave = null;
      elements.importSummary.hidden = true;
      showToast(error.message || "Save incompatível.");
    } finally {
      elements.importSaveFile.value = "";
    }
  }

  function confirmImportedSave() {
    if (!pendingImportedSave) return;
    try {
      state = saveManager.import(pendingImportedSave.structured, state);
      pendingImportedSave = null;
      closeSettings();
      applyVolume(state.volume);
      applyAccessibilitySettings();
      renderAll();
      renderDaily();
      renderLuxorCampaign();
      showToast("Save importado e validado. O save anterior ficou no backup.");
    } catch (error) {
      showToast(error.message || "Não foi possível importar.");
    }
  }

  function queueCloudSync(delay = 1800) {
    clearTimeout(cloudSyncTimer);
    if (!supabaseConfigured() || !navigator.onLine || state.cloudSync?.status === "conflict") return;
    cloudSyncTimer = window.setTimeout(() => syncCloudSave(), delay);
  }

  async function syncCloudSave(forceDevice = false) {
    if (!supabaseConfigured()) {
      state.cloudSync.status = "local";
      updateCloudStatus();
      return false;
    }
    if (!navigator.onLine) {
      state.cloudSync.status = "offline";
      updateCloudStatus();
      return false;
    }
    state.cloudSync.status = "syncing";
    updateCloudStatus();
    try {
      const client = await ensureScoreClient();
      if (!client || !scoreUser) throw new Error("Sessão indisponível");
      let localStructured = Core.runtimeToStructured(state, Number(state.__meta?.revision || 0));
      const { data: cloudRow, error: readError } = await client.from("album_saves")
        .select("save_data,schema_version,revision,updated_at")
        .eq("user_id", scoreUser.id)
        .maybeSingle();
      if (readError) throw readError;
      const cloudStructured = cloudRow?.save_data ? Core.sanitizeStructuredSave(cloudRow.save_data) : null;
      if (forceDevice && cloudRow && Number(cloudRow.revision || 0) >= Number(localStructured.revision || 0)) {
        localStructured = Core.runtimeToStructured(state, Number(cloudRow.revision || 0) + 1);
      }
      const lastCloudRevision = Number(state.cloudSync.lastCloudRevision || 0);
      const cloudChanged = cloudStructured && Number(cloudRow.revision || 0) > lastCloudRevision;
      const localChanged = Boolean(state.cloudSync.pending);
      if (!forceDevice && cloudStructured && cloudChanged && localChanged && cloudStructured.updatedAt !== localStructured.updatedAt) {
        cloudConflict = { local: localStructured, cloud: cloudStructured, row: cloudRow };
        state.cloudSync.status = "conflict";
        state.cloudSync.conflict = { cloudRevision: cloudRow.revision, detectedAt: new Date().toISOString() };
        saveState(true, false);
        showCloudConflict();
        return false;
      }
      if (!forceDevice && cloudStructured && cloudChanged && !localChanged) {
        state = Core.structuredToRuntime(cloudStructured);
        state.cloudSync.status = "synced";
        state.cloudSync.pending = false;
        state.cloudSync.lastCloudRevision = Number(cloudRow.revision || cloudStructured.revision || 0);
        state.cloudSync.lastSyncedAt = new Date().toISOString();
        saveState(true, false);
        renderAll();
        renderDaily();
        renderLuxorCampaign();
        updateCloudStatus();
        return true;
      }
      if (!forceDevice && cloudStructured && !cloudChanged && !localChanged) {
        state.cloudSync.status = "synced";
        state.cloudSync.lastSyncedAt = cloudRow.updated_at || state.cloudSync.lastSyncedAt;
        updateCloudStatus();
        return true;
      }
      const payload = {
        user_id: scoreUser.id,
        save_data: localStructured,
        schema_version: Core.SCHEMA_VERSION,
        revision: Number(localStructured.revision || 0),
        updated_at: new Date().toISOString()
      };
      const writeResult = cloudRow
        ? await client.from("album_saves")
          .update(payload)
          .eq("user_id", scoreUser.id)
          .eq("revision", Number(cloudRow.revision || 0))
          .select("revision")
          .maybeSingle()
        : await client.from("album_saves").insert(payload).select("revision").maybeSingle();
      const { data: writtenRow, error: writeError } = writeResult;
      if (writeError) throw writeError;
      if (cloudRow && !writtenRow) {
        state.cloudSync.status = "local";
        updateCloudStatus();
        queueCloudSync(220);
        return false;
      }
      state.cloudSync.status = "synced";
      state.cloudSync.pending = false;
      state.cloudSync.lastCloudRevision = payload.revision;
      state.cloudSync.lastSyncedAt = payload.updated_at;
      state.cloudSync.conflict = null;
      state.__meta.revision = Math.max(Number(state.__meta?.revision || 0), payload.revision);
      saveState(true, false);
      updateCloudStatus();
      return true;
    } catch {
      state.cloudSync.status = navigator.onLine ? "local" : "offline";
      saveState(false, false);
      updateCloudStatus();
      return false;
    }
  }

  function showCloudConflict() {
    if (!cloudConflict) return;
    const local = Core.summaryForSave(cloudConflict.local);
    const cloud = Core.summaryForSave(cloudConflict.cloud);
    elements.cloudConflictCompare.innerHTML = `<article><strong>Este aparelho</strong><small>${local.unlocked}/64 liberadas · ${local.luxorLevels}/40 Luxor<br>${new Date(local.updatedAt).toLocaleString("pt-BR")}</small></article><article><strong>Nuvem</strong><small>${cloud.unlocked}/64 liberadas · ${cloud.luxorLevels}/40 Luxor<br>${new Date(cloud.updatedAt).toLocaleString("pt-BR")}</small></article>`;
    elements.cloudConflictModal.hidden = false;
    document.body.style.overflow = "hidden";
    updateCloudStatus();
  }

  function closeCloudConflict() {
    elements.cloudConflictModal.hidden = true;
    if (elements.settingsModal.hidden && elements.puzzleModal.hidden) document.body.style.overflow = "";
  }

  async function resolveCloudConflict(choice) {
    if (!cloudConflict) return;
    if (choice === "cloud") {
      state = Core.structuredToRuntime(cloudConflict.cloud);
      state.cloudSync.status = "synced";
      state.cloudSync.pending = false;
      state.cloudSync.lastCloudRevision = Number(cloudConflict.row?.revision || cloudConflict.cloud.revision || 0);
      state.cloudSync.lastSyncedAt = new Date().toISOString();
      saveState(true, false);
    } else if (choice === "merge") {
      const merged = Core.mergeSafeStructured(cloudConflict.local, cloudConflict.cloud);
      state = Core.structuredToRuntime(merged);
      state.cloudSync.pending = true;
      saveState(true, false);
    } else {
      state.cloudSync.status = "local";
      state.cloudSync.pending = true;
      state.cloudSync.conflict = null;
      saveState(true, false);
    }
    cloudConflict = null;
    closeCloudConflict();
    applyVolume(state.volume);
    applyAccessibilitySettings();
    renderAll();
    renderDaily();
    renderLuxorCampaign();
    if (choice !== "cloud") await syncCloudSave(true);
    else updateCloudStatus();
  }
  function updateProgress() {
    const unlocked = state.unlocked.length;
    const placed = state.placed.length;
    const percent = Math.round((placed / TOTAL) * 100);
    $("#headerProgress").textContent = `${unlocked}/${TOTAL}`;
    $("#unlockedCount").textContent = String(unlocked);
    $("#placedCount").textContent = String(placed);
    $("#progressPercent").textContent = `${percent}%`;
    $("#statSolved").textContent = String(unlocked);
    $("#statPlaced").textContent = String(placed);
    $("#statMissing").textContent = String(TOTAL - unlocked);
    $("#inventoryUnlocked").textContent = String(unlocked);
    $("#inventoryAvailable").textContent = String(unlocked - placed);
    $("#inventoryPlaced").textContent = String(placed);
    elements.progressRing.style.setProperty("--p", String(percent));
    elements.miniProgress.style.setProperty("--p", String(Math.round((unlocked / TOTAL) * 100)));
    $("i", elements.miniProgress).textContent = String(unlocked);
  }

  function buildPageStrip() {
    elements.pageStrip.replaceChildren();
    for (let page = 1; page <= 12; page += 1) {
      const button = document.createElement("button");
      button.className = "page-thumbnail";
      button.type = "button";
      button.dataset.page = String(page);
      button.setAttribute("aria-label", `Abrir ${PAGE_NAMES[page - 1]}`);
      button.innerHTML = `<img src="assets/album/page-${String(page).padStart(2, "0")}.webp" alt="" loading="lazy"><span>${page}</span>`;
      button.addEventListener("click", () => setPage(page));
      elements.pageStrip.append(button);
    }
  }
  function setPage(page) {
    state.page = clamp(Number(page), 1, 12);
    saveState();
    renderPage();
  }
  function renderPage() {
    const page = state.page;
    elements.pageCounter.textContent = `${page} / 12`;
    elements.pageEyebrow.textContent = PAGE_NAMES[page - 1];
    elements.previousPage.disabled = page === 1;
    elements.nextPage.disabled = page === 12;
    elements.pageLoading.hidden = false;
    elements.albumPage.classList.remove("is-loaded");
    elements.albumPage.alt = PAGE_NAMES[page - 1];
    elements.albumPage.src = `assets/album/page-${String(page).padStart(2, "0")}.webp`;
    $$(".page-thumbnail", elements.pageStrip).forEach((button) => button.classList.toggle("is-active", Number(button.dataset.page) === page));
    renderInteractiveLayer();
  }
  function renderInteractiveLayer() {
    elements.interactiveLayer.replaceChildren();
    Object.entries(PLACEMENTS).filter(([, placement]) => placement.page === state.page).forEach(([rawId, placement]) => {
      const id = Number(rawId);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "album-slot";
      button.style.left = `${placement.left}%`; button.style.top = `${placement.top}%`;
      button.style.width = `${placement.width}%`; button.style.height = `${placement.height}%`;
      button.style.setProperty("--rotate", `${placement.rotate}deg`);
      button.setAttribute("aria-label", `Espaço da figurinha ${String(id).padStart(2, "0")} — ${stickerName(id)}`);
      if (state.placed.includes(id)) {
        const img = document.createElement("img");
        img.src = stickerSrc(id); img.alt = `Figurinha ${String(id).padStart(2, "0")} — ${stickerName(id)}`;
        button.append(img);
        button.style.cursor = "pointer";
        button.setAttribute("aria-label", `Abrir perfil de ${stickerName(id)}, figurinha ${String(id).padStart(2, "0")}`);
        button.addEventListener("click", () => openProfile(id));
        if (justPasted === id) { button.classList.add("just-pasted"); window.setTimeout(() => { button.classList.remove("just-pasted"); justPasted = null; }, 900); }
      } else if (pendingSticker === id) {
        button.classList.add("is-target");
        button.addEventListener("click", () => placeSticker(id));
      }
      elements.interactiveLayer.append(button);
    });
    (WRITING_FIELDS[state.page] || []).forEach((field) => {
      const isOwnerField = field.key === "dono";
      const textarea = document.createElement(isOwnerField ? "input" : "textarea");
      const fieldId = `album-writing-${state.page}-${field.key}`;
      if (isOwnerField) { textarea.type = "text"; textarea.maxLength = 32; textarea.autocomplete = "name"; textarea.spellcheck = false; }
      textarea.id = fieldId;
      textarea.name = `album-note-${field.key}`;
      textarea.className = `writing-field ${field.className || ""}`.trim();
      textarea.dataset.fieldKey = field.key;
      textarea.setAttribute("aria-label", field.label); textarea.placeholder = field.placeholder;
      textarea.value = isOwnerField ? (state.playerName || state.notes[field.key] || "") : (state.notes[field.key] || "");
      textarea.style.left = `${field.left}%`; textarea.style.top = `${field.top}%`;
      textarea.style.width = `${field.width}%`; textarea.style.height = `${field.height}%`;
      const textStyle = textStyleFor(field);
      textarea.style.fontFamily = textStyle.font;
      textarea.style.color = textStyle.color;
      textarea.addEventListener("input", () => {
        state.notes[field.key] = textarea.value;
        if (isOwnerField) state.playerName = textarea.value.slice(0, 32);
        saveState();
        if (isOwnerField) { renderRankingProfile(); queuePlayerSync(); }
      });
      textarea.addEventListener("blur", () => {
        if (!isOwnerField) return;
        state.playerName = cleanPlayerName(textarea.value);
        state.notes.dono = state.playerName;
        textarea.value = state.playerName;
        saveState(); renderRankingProfile(); queuePlayerSync(80);
      });
      const label = document.createElement("label");
      label.className = "visually-hidden";
      label.htmlFor = fieldId;
      label.textContent = field.label;
      elements.interactiveLayer.append(label, textarea);

      const formatButton = document.createElement("button");
      formatButton.type = "button";
      formatButton.className = "text-format-button";
      formatButton.textContent = "Aa";
      formatButton.style.left = `${Math.min(94, field.left + field.width - 4.4)}%`;
      formatButton.style.top = `${Math.max(1, field.top - 3.2)}%`;
      formatButton.setAttribute("aria-label", `Mudar cor e fonte de ${field.label}`);
      formatButton.addEventListener("click", () => openTextStyle(field));
      elements.interactiveLayer.append(formatButton);
    });
  }

  function defaultTextStyle(field) {
    return {
      font: field.className === "name-field" ? "Georgia, Times New Roman, serif" : "Segoe UI, Arial, sans-serif",
      color: "#655c4c"
    };
  }
  function textStyleFor(field) {
    return { ...defaultTextStyle(field), ...(state.noteStyles[field.key] || {}) };
  }
  function updateTextStyleControls(field) {
    const style = textStyleFor(field);
    elements.textFont.value = style.font;
    elements.textColor.value = style.color;
    elements.textStylePreview.style.fontFamily = style.font;
    elements.textStylePreview.style.color = style.color;
    $$("[data-color]", $("#textColorOptions")).forEach((button) => button.classList.toggle("is-active", button.dataset.color.toLowerCase() === style.color.toLowerCase()));
  }
  function openTextStyle(field) {
    currentTextFieldKey = field.key;
    elements.textStyleModal.dataset.fieldLabel = field.label;
    elements.textStyleModal.hidden = false;
    updateTextStyleControls(field);
    document.body.style.overflow = "hidden";
    window.setTimeout(() => elements.textFont.focus(), 30);
  }
  function closeTextStyle() {
    elements.textStyleModal.hidden = true;
    currentTextFieldKey = null;
    if (elements.puzzleModal.hidden && elements.secretModal.hidden && !elements.pageWrap.classList.contains("is-fullscreen")) document.body.style.overflow = "";
  }
  function currentWritingField() {
    return Object.values(WRITING_FIELDS).flat().find((field) => field.key === currentTextFieldKey);
  }
  function saveTextStyle(nextStyle) {
    const field = currentWritingField();
    if (!field) return;
    state.noteStyles[field.key] = { ...textStyleFor(field), ...nextStyle };
    saveState();
    const textarea = $(`[data-field-key="${field.key}"]`, elements.interactiveLayer);
    if (textarea) {
      textarea.style.fontFamily = state.noteStyles[field.key].font;
      textarea.style.color = state.noteStyles[field.key].color;
    }
    updateTextStyleControls(field);
  }

  function defaultProfile(id) {
    return { name: stickerName(id), info: "Não informado", text: "Não informado" };
  }
  function profileFor(id) {
    const saved = state.profiles[String(id)] || {};
    const profile = { ...defaultProfile(id), ...saved };
    if (!profile.name || profile.name === "Não informado") profile.name = stickerName(id);
    return profile;
  }
  function saveCurrentProfile() {
    if (!currentProfileId) return;
    const clean = (value) => String(value || "").trim() || "Não informado";
    state.profiles[String(currentProfileId)] = {
      name: clean(elements.profileName.value),
      info: clean(elements.profileInfo.value),
      text: clean(elements.profileText.value)
    };
    elements.profileName.value = state.profiles[String(currentProfileId)].name;
    elements.profileInfo.value = state.profiles[String(currentProfileId)].info;
    elements.profileText.value = state.profiles[String(currentProfileId)].text;
    saveState();
  }
  function profileInput(field) {
    return field === "name" ? elements.profileName : field === "info" ? elements.profileInfo : elements.profileText;
  }
  function setProfileEditing(field, editing) {
    const input = profileInput(field);
    const button = $(`[data-profile-field="${field}"]`, elements.profileModal);
    if (!input || !button) return;
    input.readOnly = !editing;
    button.textContent = editing ? "✓" : "✎";
    button.classList.toggle("is-saving", editing);
    button.setAttribute("aria-label", editing ? "Salvar alteração" : `Editar ${field === "name" ? "nome" : field === "info" ? "informações" : "texto"}`);
    if (editing) {
      input.focus();
      input.select();
    }
  }
  function toggleProfileField(field) {
    const input = profileInput(field);
    if (!input) return;
    if (input.readOnly) return setProfileEditing(field, true);
    saveCurrentProfile();
    setProfileEditing(field, false);
    showToast("Informação do perfil salva.");
  }
  function openProfile(id) {
    if (!state.unlocked.includes(id)) return;
    const profile = profileFor(id);
    const placement = PLACEMENTS[id];
    currentProfileId = id;
    elements.profileSticker.src = stickerSrc(id);
    elements.profileSticker.alt = `Figurinha ${String(id).padStart(2, "0")} — ${stickerName(id)}`;
    elements.profileNumber.textContent = `Figurinha ${String(id).padStart(2, "0")} · ${stickerName(id)}`;
    elements.profileName.value = profile.name;
    elements.profileInfo.value = profile.info;
    elements.profileText.value = profile.text;
    elements.profileLocation.textContent = `Página ${placement.page} · espaço ${placement.index + 1}`;
    ["name", "info", "text"].forEach((field) => setProfileEditing(field, false));
    elements.profileModal.hidden = false;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => $("#closeProfile").focus(), 30);
  }
  function closeProfile() {
    saveCurrentProfile();
    ["name", "info", "text"].forEach((field) => setProfileEditing(field, false));
    currentProfileId = null;
    elements.profileModal.hidden = true;
    if (elements.puzzleModal.hidden && elements.textStyleModal.hidden && elements.secretModal.hidden && !elements.pageWrap.classList.contains("is-fullscreen")) document.body.style.overflow = "";
  }

  function renderMiniInventory() {
    elements.miniInventory.replaceChildren();
    const available = state.unlocked.filter((id) => !state.placed.includes(id)).slice(0, 4);
    for (let index = 0; index < 4; index += 1) {
      if (!available[index]) { const empty = document.createElement("span"); empty.className = "mini-sticker is-empty"; elements.miniInventory.append(empty); continue; }
      const id = available[index];
      const button = document.createElement("button"); button.type = "button"; button.className = "mini-sticker";
      button.innerHTML = `<img src="${stickerSrc(id)}" alt="${stickerName(id)}, figurinha ${String(id).padStart(2, "0")}">`;
      button.addEventListener("click", () => beginPlacement(id)); elements.miniInventory.append(button);
    }
  }
  function filterMatches(id) { return currentFilter === "all" || challengeState(id) === currentFilter; }
  function renderChallenges() {
    elements.challengeGrid.replaceChildren();
    const ids = Array.from({ length: TOTAL }, (_, index) => index + 1).filter(filterMatches);
    elements.filterCount.textContent = `${ids.length} ${ids.length === 1 ? "desafio" : "desafios"}`;
    ids.forEach((id) => {
      const challenge = challengeFor(id); const itemState = challengeState(id);
      const item = document.createElement("article"); item.className = `challenge-item is-${itemState}`;
      const stateLabel = itemState === "locked" ? "Não liberada" : itemState === "available" ? "Pronta para colar" : "Colada";
      const actionLabel = itemState === "locked" ? "Jogar desafio" : itemState === "available" ? "Colar no álbum" : "Abrir perfil";
      item.innerHTML = `
        <div class="challenge-visual"><img src="${stickerSrc(id)}" alt="${itemState === "locked" ? `Figurinha escondida de ${stickerName(id)}` : `${stickerName(id)}, figurinha ${String(id).padStart(2,"0")}`}" loading="lazy"><span class="challenge-state">${stateLabel}</span>${itemState === "locked" ? '<span class="challenge-lock"><span>◇</span></span>' : ""}</div>
        <div class="challenge-content"><span class="eyebrow">Figurinha ${String(id).padStart(2, "0")} · nível ${challenge.level}</span><h3 title="${stickerName(id)}">${stickerName(id)}</h3><p><strong>${challenge.title}</strong> · ${challenge.short}.</p><button class="challenge-action" type="button">${actionLabel}</button></div>`;
      $(".challenge-action", item).addEventListener("click", () => {
        if (itemState === "locked") openPuzzle(id);
        else if (itemState === "available") beginPlacement(id);
        else openProfile(id);
      });
      if (itemState !== "locked") $(".challenge-visual", item).addEventListener("click", () => openProfile(id));
      elements.challengeGrid.append(item);
    });
  }
  function inventoryMatches(id) { return currentInventoryFilter === "all" || challengeState(id) === currentInventoryFilter; }
  function renderInventory() {
    elements.inventoryGrid.replaceChildren();
    const ids = Array.from({ length: TOTAL }, (_, index) => index + 1).filter(inventoryMatches);
    elements.inventoryFilterCount.textContent = `${ids.length} ${ids.length === 1 ? "figurinha" : "figurinhas"}`;
    ids.forEach((id) => {
      const itemState = challengeState(id);
      const card = document.createElement("article");
      card.className = `inventory-item is-${itemState}`;
      const stateLabel = itemState === "locked" ? "Bloqueada" : itemState === "available" ? "Pronta para colar" : "Colada";
      const actionLabel = itemState === "locked" ? "Vencer desafio" : itemState === "available" ? "Colar no álbum" : "Abrir perfil";
      card.innerHTML = `<figure><img src="${stickerSrc(id)}" alt="${itemState === "locked" ? `Figurinha bloqueada de ${stickerName(id)}` : `${stickerName(id)}, figurinha ${String(id).padStart(2, "0")}`}" loading="lazy"><span>${stateLabel}</span></figure><div><strong title="${stickerName(id)}">${stickerName(id)}</strong><small>Figurinha ${String(id).padStart(2, "0")} · página ${PLACEMENTS[id].page}</small><button type="button">${actionLabel}</button></div>`;
      $("button", card).addEventListener("click", () => {
        if (itemState === "locked") openPuzzle(id);
        else if (itemState === "available") beginPlacement(id);
        else openProfile(id);
      });
      if (itemState !== "locked") $("figure", card).addEventListener("click", () => openProfile(id));
      elements.inventoryGrid.append(card);
    });
  }
  function freeRecordKey(gameKey, difficultyKey) { return `${difficultyKey}:${gameKey}`; }
  function freeProgressFor(gameKey, difficultyKey) {
    const record = state.freeProgress?.[freeRecordKey(gameKey, difficultyKey)];
    return record && typeof record === "object" ? record : null;
  }
  function formatDuration(milliseconds) {
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) return "—";
    const seconds = Math.max(0.1, milliseconds / 1000);
    if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0).replace(".", ",")} s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ${String(Math.floor(seconds % 60)).padStart(2, "0")} s`;
  }
  function buildFreeChallenge(gameKey, difficultyKey = currentFreeDifficulty, phase = 1) {
    const gameIndex = PUZZLE_TYPES.findIndex((type) => type.key === gameKey);
    const type = PUZZLE_TYPES[Math.max(0, gameIndex)];
    const difficulty = freeDifficulty(difficultyKey);
    const safePhase = clamp(Number(phase) || 1, 1, FREE_PHASES);
    const id = difficulty.rank * 8 - 7 + Math.max(0, gameIndex);
    const seed = `free:${difficulty.key}:${gameKey}:${safePhase}:v2`;
    return {
      ...type, id, level: clamp(difficulty.level + safePhase - 1, 1, 8), freeMode: true,
      freeDifficultyKey: difficulty.key, freeDifficultyRank: difficulty.rank, freeDifficultyLabel: difficulty.label,
      freePhase: safePhase, freeTotalPhases: FREE_PHASES, seed,
      settings: Core.buildPhaseSettings(gameKey, difficulty.rank, safePhase, seed)
    };
  }
  function renderFreeMode() {
    if (!elements.freeGameGrid) return;
    const difficulty = freeDifficulty();
    elements.freeDifficultyName.textContent = difficulty.label;
    elements.freeDifficultyDescription.textContent = `${difficulty.description} Cada modalidade possui 10 fases com mecânicas progressivas, e cada fase concluída já soma pontos.`;
    elements.freeDifficultyName.style.color = difficulty.color;
    $$('[data-free-difficulty]').forEach((button) => {
      const selected = button.dataset.freeDifficulty === difficulty.key;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    const allRecords = Object.values(state.freeRecords || {});
    elements.freeWins.textContent = String(allRecords.reduce((total, record) => total + (Number(record?.wins) || 0), 0));
    elements.freeGameGrid.replaceChildren();
    PUZZLE_TYPES.forEach((type) => {
      const detail = FREE_GAME_DETAILS[type.key];
      const challenge = buildFreeChallenge(type.key, difficulty.key, 1);
      const record = state.freeRecords[freeRecordKey(type.key, difficulty.key)] || {};
      const progress = freeProgressFor(type.key, difficulty.key);
      const completedPhases = clamp(Number(progress?.completedPhases) || 0, 0, FREE_PHASES);
      const bestCompletedPhases = Math.max(completedPhases, clamp(Number(record.bestPhases) || 0, 0, FREE_PHASES));
      const nextPhase = completedPhases >= FREE_PHASES ? 1 : completedPhases + 1;
      const playLabel = completedPhases >= FREE_PHASES ? "Jogar novamente" : completedPhases ? `Continuar na fase ${nextPhase}` : "Jogar fase 1";
      const card = document.createElement("article");
      card.className = `free-game-card free-game-${type.key}`;
      card.style.setProperty("--game-accent", detail.accent);
      card.style.setProperty("--difficulty-accent", difficulty.color);
      card.innerHTML = `
        <div class="free-card-top">
          <span class="free-game-icon" aria-hidden="true">${detail.icon}</span>
          <span class="free-level-badge">${difficulty.label}</span>
          <span class="free-completion-status ${bestCompletedPhases >= FREE_PHASES ? "is-complete" : ""}">${bestCompletedPhases >= FREE_PHASES ? "Campanha concluída" : "Em progresso"}</span>
          <img src="${stickerSrc(challenge.id)}" alt="${stickerName(challenge.id)}" loading="lazy">
        </div>
        <div class="free-card-body">
          <span class="free-game-tag">${detail.tagline}</span>
          <h3>${type.title}</h3>
          <p>Cada fase traz uma regra nova. ${objectiveFor(challenge).replace("Objetivo: ", "A primeira começa com: ")}</p>
          <div class="free-phase-track" aria-label="${completedPhases} de ${FREE_PHASES} fases concluídas">${Array.from({ length: FREE_PHASES }, (_, index) => `<span class="${index < completedPhases ? "is-done" : ""}" title="Fase ${index + 1}"></span>`).join("")}</div>
          <div class="free-phase-caption"><span>Fase 1</span><span>Fase 5</span><span>Fase 10</span></div>
          <div class="free-record-row is-score">
            <span><small>Melhor pontuação total</small><strong>${Number(record.bestPoints || 0).toLocaleString("pt-BR") || "—"}</strong></span>
            <span><small>Fase atual</small><strong>${completedPhases >= FREE_PHASES ? "Concluída" : `${nextPhase}/${FREE_PHASES}`}</strong></span>
          </div>
          <div class="free-record-row is-score">
            <span><small>Melhor fase</small><strong>${bestCompletedPhases}/${FREE_PHASES}</strong></span>
            <span><small>Melhor tempo</small><strong>${formatDuration(Number(record.bestMs || 0))}</strong></span>
          </div>
          <button class="free-play-button" type="button"><span>${playLabel}</span><i aria-hidden="true">→</i></button>
        </div>`;
      if (!Number(record.bestPoints)) $(".free-record-row span:first-child strong", card).textContent = "—";
      $(".free-play-button", card).addEventListener("click", () => openFreePuzzle(type.key));
      elements.freeGameGrid.append(card);
    });
  }
  function calculateFreePhasePoints(gameKey, difficultyKey, phase, elapsed) {
    const difficulty = freeDifficulty(difficultyKey);
    const target = (FREE_SCORE_BASE_TIMES[gameKey] || 90000) * (1 + (difficulty.rank - 1) * .08) * (1 + (phase - 1) * .12);
    const base = Math.round(900 * FREE_DIFFICULTY_MULTIPLIERS[difficulty.rank - 1] * FREE_PHASE_MULTIPLIERS[phase - 1]);
    const speedRatio = clamp(1 - elapsed / target, 0, .65);
    const speedBonus = Math.round(base * speedRatio);
    const clearBonus = 250 * difficulty.rank * phase;
    return Math.max(1, base + speedBonus + clearBonus);
  }
  function freeElapsed(session = freePlaySession) {
    if (!session) return 0;
    const currentPhase = Math.max(0, Number(session.phaseActiveBeforeMs) || 0) + Math.max(0, Date.now() - Number(session.phaseStartedAt || Date.now()));
    return Math.max(0, Number(session.completedMs) || 0) + currentPhase;
  }
  function updateFreePuzzleCopy(challenge = currentPuzzleChallenge) {
    if (!freePlaySession || !challenge) return;
    const difficulty = freeDifficulty(freePlaySession.difficultyKey);
    elements.puzzleEyebrow.textContent = `Desafio Livre · ${difficulty.label} · Fase ${freePlaySession.phase} de ${FREE_PHASES}`;
    elements.puzzleTitle.textContent = challenge.title;
    elements.puzzleSticker.src = stickerSrc(challenge.id);
    elements.puzzleSticker.alt = `${stickerName(challenge.id)}, figurinha de apoio do desafio`;
    elements.puzzleDescription.textContent = `${challenge.description} Cada fase concluída registra seus pontos, então você pode continuar depois sem repetir as anteriores.`;
    elements.puzzleObjective.textContent = objectiveFor(challenge);
  }
  function openFreePuzzle(gameKey, difficultyKey = currentFreeDifficulty, forceRestart = false) {
    cleanupPuzzle();
    const difficulty = freeDifficulty(difficultyKey);
    const interrupted = resumeSnapshot?.kind === "free" && resumeSnapshot.gameKey === gameKey && resumeSnapshot.difficultyKey === difficulty.key ? resumeSnapshot : null;
    const savedProgress = freeProgressFor(gameKey, difficulty.key);
    const canResume = !forceRestart && savedProgress && savedProgress.completedPhases > 0 && savedProgress.completedPhases < FREE_PHASES;
    const phase = interrupted ? clamp(Number(interrupted.phase) || 1, 1, FREE_PHASES) : canResume ? savedProgress.completedPhases + 1 : 1;
    const challenge = buildFreeChallenge(gameKey, difficulty.key, phase);
    const context = interrupted?.context && typeof interrupted.context === "object" ? interrupted.context : {};
    currentPuzzleId = null;
    currentPuzzleChallenge = challenge;
    freePlaySession = {
      gameKey, difficultyKey: difficulty.key, stickerId: challenge.id,
      phase, totalPhases: FREE_PHASES, phaseStartedAt: Date.now(), phaseActiveBeforeMs: forceRestart ? 0 : Number(interrupted?.activeElapsedMs || 0),
      completedMs: interrupted ? Math.max(0, Number(context.completedMs) || 0) : canResume ? Math.max(0, Number(savedProgress.completedMs) || 0) : 0,
      points: interrupted ? safeScore(context.points) : canResume ? safeScore(savedProgress.points) : 0,
      phaseDurations: interrupted && Array.isArray(context.phaseDurations) ? [...context.phaseDurations] : canResume ? [...savedProgress.phaseDurations] : [],
      phasePoints: interrupted && Array.isArray(context.phasePoints) ? [...context.phasePoints] : canResume ? [...savedProgress.phasePoints] : []
    };
    setActiveSessionSnapshot({
      kind: "free", gameKey, difficultyKey: difficulty.key, phase, seed: challenge.seed,
      activeElapsedMs: freePlaySession.phaseActiveBeforeMs, context: { completedMs: freePlaySession.completedMs, points: freePlaySession.points, phaseDurations: freePlaySession.phaseDurations, phasePoints: freePlaySession.phasePoints },
      game: forceRestart ? null : interrupted?.game
    }, true);
    updateFreePuzzleCopy(challenge);
    elements.puzzleModal.dataset.difficulty = difficulty.key;
    elements.puzzleModal.hidden = false;
    document.documentElement.classList.add("puzzle-open");
    document.body.style.overflow = "hidden";
    initPuzzle(challenge);
    if (interrupted) elements.puzzleStatus.textContent = `Partida restaurada na fase ${phase}. O relógio voltou de ${formatDuration(freePlaySession.phaseActiveBeforeMs)}.`;
    else if (canResume) elements.puzzleStatus.textContent = `Continuando da fase ${phase}. Seus ${freePlaySession.points.toLocaleString("pt-BR")} pontos anteriores estão salvos.`;
    resumeSnapshot = null;
  }
  function advanceFreePhase() {
    const session = freePlaySession;
    if (!session || session.phase >= FREE_PHASES) return;
    session.phase += 1;
    session.phaseStartedAt = Date.now();
    session.phaseActiveBeforeMs = 0;
    const challenge = buildFreeChallenge(session.gameKey, session.difficultyKey, session.phase);
    currentPuzzleChallenge = challenge;
    setActiveSessionSnapshot({
      kind: "free", gameKey: session.gameKey, difficultyKey: session.difficultyKey, phase: session.phase, seed: challenge.seed,
      activeElapsedMs: 0, context: { completedMs: session.completedMs, points: session.points, phaseDurations: session.phaseDurations, phasePoints: session.phasePoints }
    }, true);
    updateFreePuzzleCopy(challenge);
    initPuzzle(challenge);
    elements.puzzleStatus.textContent = `Fase ${session.phase} valendo! Os pontos anteriores continuam salvos.`;
  }
  function persistFreePhaseProgress(session, finalPhase = false) {
    const totalElapsed = Math.max(0, Number(session.completedMs) || 0);
    const key = freeRecordKey(session.gameKey, session.difficultyKey);
    const previous = state.freeRecords[key] || {};
    const previousPoints = safeScore(previous.bestPoints);
    const previousTime = Number(previous.bestMs) || Infinity;
    const isRecord = session.points > previousPoints || (session.points === previousPoints && totalElapsed < previousTime);
    state.freeRecords[key] = {
      ...previous,
      wins: (Number(previous.wins) || 0) + (finalPhase ? 1 : 0),
      bestPoints: isRecord ? session.points : previousPoints,
      bestMs: isRecord ? totalElapsed : (Number(previous.bestMs) || totalElapsed),
      bestPhases: isRecord ? session.phase : clamp(Number(previous.bestPhases) || FREE_PHASES, 1, FREE_PHASES),
      lastPoints: session.points,
      lastMs: totalElapsed,
      lastPhases: session.phase
    };
    if (!state.freeProgress || typeof state.freeProgress !== "object") state.freeProgress = {};
    state.freeProgress[key] = {
      completedPhases: session.phase,
      points: session.points,
      completedMs: totalElapsed,
      phaseDurations: [...session.phaseDurations],
      phasePoints: [...session.phasePoints]
    };
    const gamePrevious = state.freeGameTotals[session.gameKey] || {};
    if (session.points > Number(gamePrevious.bestPoints || 0) || (session.points === Number(gamePrevious.bestPoints || 0) && totalElapsed < Number(gamePrevious.bestMs || Infinity))) {
      state.freeGameTotals[session.gameKey] = {
        bestPoints: session.points,
        bestMs: totalElapsed,
        difficultyKey: session.difficultyKey,
        phasesCompleted: session.phase
      };
    }
    saveState(true);
    renderFreeMode();
    renderRankingProfile();
    queuePlayerSync(120);
    submitOnlineFreeScore({
      gameKey: session.gameKey,
      difficultyKey: session.difficultyKey,
      phaseDurations: [...session.phaseDurations],
      phasesCompleted: session.phase,
      points: session.points,
      durationMs: totalElapsed
    });
    return { key, isRecord, totalElapsed };
  }
  function completeFreePuzzle(gameResult = {}) {
    const session = freePlaySession;
    if (!session) return;
    const phaseElapsed = Math.max(100, Number(session.phaseActiveBeforeMs || 0) + Date.now() - session.phaseStartedAt);
    const performanceBonus = Math.max(0, Math.round(Number(gameResult.performanceBonus || 0)));
    const earned = calculateFreePhasePoints(session.gameKey, session.difficultyKey, session.phase, phaseElapsed) + performanceBonus;
    session.completedMs += phaseElapsed;
    session.phaseDurations.push(phaseElapsed);
    session.phasePoints.push(earned);
    session.points += earned;
    const difficulty = freeDifficulty(session.difficultyKey);
    const isFinalPhase = session.phase >= FREE_PHASES;
    const saved = persistFreePhaseProgress(session, isFinalPhase);
    clearActiveSessionSnapshot(true);
    elements.restartPuzzle.hidden = true;
    elements.puzzleGuideControl.hidden = true;
    clearPuzzleGuideTarget();

    if (!isFinalPhase) {
      elements.puzzleStatus.textContent = `Fase ${session.phase} concluída — ${earned.toLocaleString("pt-BR")} pontos salvos!`;
      elements.puzzleStage.innerHTML = `<div class="free-phase-success-card" style="--phase-accent:${difficulty.color}">
        <span class="free-phase-number">${session.phase}/${FREE_PHASES}</span>
        <span class="eyebrow">Pontos registrados</span>
        <h3>Boa! Você continua daqui.</h3>
        <p>Esta etapa foi concluída em <strong>${formatDuration(phaseElapsed)}</strong>. Mesmo saindo agora, a próxima partida começa na fase ${session.phase + 1}.</p>
        <div class="free-phase-score"><span><small>Pontos da fase</small><b>+${earned.toLocaleString("pt-BR")}</b></span><span><small>Total salvo</small><b>${session.points.toLocaleString("pt-BR")}</b></span></div>
        <div class="free-win-actions"><button class="primary-button" id="nextFreePhase" type="button">Jogar fase ${session.phase + 1}</button><button class="secondary-button" id="leaveFreePhase" type="button">Sair e continuar depois</button></div>
      </div>`;
      $("#nextFreePhase").addEventListener("click", advanceFreePhase);
      $("#leaveFreePhase").addEventListener("click", closePuzzle);
      return;
    }

    elements.puzzleStatus.textContent = saved.isRecord ? "Novo recorde pessoal!" : "Dez fases concluídas!";
    elements.puzzleStage.innerHTML = `<div class="free-success-card" style="--win-accent:${difficulty.color}">
      <div class="free-confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, index) => `<i style="--i:${index}"></i>`).join("")}</div>
      <span class="free-win-emblem">✦</span>
      <span class="free-win-label">${difficulty.label} · ${FREE_PHASES} fases concluídas</span>
      <h3>${saved.isRecord ? "Novo recorde!" : "Mandou muito bem!"}</h3>
      <p>Você venceu <strong>${currentPuzzleChallenge.title}</strong> com <strong>${session.points.toLocaleString("pt-BR")} pontos</strong> em <strong>${formatDuration(saved.totalElapsed)}</strong>.</p>
      <div class="free-win-stats"><span><small>Melhor pontuação</small><b>${state.freeRecords[saved.key].bestPoints.toLocaleString("pt-BR")}</b></span><span><small>Tempo da rodada</small><b>${formatDuration(saved.totalElapsed)}</b></span></div>
      <div class="free-win-actions"><button class="primary-button" id="replayFreePuzzle" type="button">Jogar novamente</button><button class="secondary-button" id="leaveFreePuzzle" type="button">Escolher outro</button></div>
    </div>`;
    $("#replayFreePuzzle").addEventListener("click", () => openFreePuzzle(session.gameKey, session.difficultyKey, true));
    $("#leaveFreePuzzle").addEventListener("click", closePuzzle);
  }

  function renderAll() {
    applyCosmetics();
    updateProgress();
    renderPage();
    renderMiniInventory();
    renderChallenges();
    renderInventory();
    renderFreeMode();
    renderRankingProfile();
    renderDaily();
    renderLuxorCampaign();
    renderCosmeticShelf();
  }

  function switchView(view) {
    currentView = view;
    elements.albumView.classList.toggle("is-active", view === "album");
    elements.challengesView.classList.toggle("is-active", view === "challenges");
    elements.dailyView.classList.toggle("is-active", view === "daily");
    elements.freeView.classList.toggle("is-active", view === "free");
    elements.rankingView.classList.toggle("is-active", view === "ranking");
    elements.inventoryView.classList.toggle("is-active", view === "inventory");
    $$('[data-view]').forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (view === "challenges") renderChallenges();
    if (view === "daily") { renderDaily(); loadDailyLeaderboard(); fetchDailyServerContext(); }
    if (view === "free") renderFreeMode();
    if (view === "ranking") loadRanking();
    if (view === "inventory") renderInventory();
  }
  function continueCollection() {
    switchView("challenges");
  }
  function beginPlacement(id) {
    if (!state.unlocked.includes(id) || state.placed.includes(id)) return;
    pendingSticker = id;
    const placement = PLACEMENTS[id];
    switchView("album"); setPage(placement.page);
    elements.pasteThumb.src = stickerSrc(id);
    elements.pasteTitle.textContent = `${stickerName(id)} está pronta para colar`;
    elements.pasteBanner.classList.add("is-visible");
    window.setTimeout(() => elements.pageWrap.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  }
  function cancelPlacement() { pendingSticker = null; elements.pasteBanner.classList.remove("is-visible"); renderInteractiveLayer(); }
  function placeSticker(id) {
    if (pendingSticker !== id || !state.unlocked.includes(id)) return;
    state.placed.push(id); state.placed = [...new Set(state.placed)]; justPasted = id;
    pendingSticker = null; elements.pasteBanner.classList.remove("is-visible"); saveState(); renderAll();
    showToast("Figurinha colada! Mais uma lembrança guardada ♡");
  }
  function viewSticker(id) { switchView("album"); setPage(PLACEMENTS[id].page); window.setTimeout(() => elements.pageWrap.scrollIntoView({ behavior: "smooth", block: "center" }), 70); }

  function cleanupPuzzle() {
    clearPuzzleGuideTarget();
    if (puzzleGuide && typeof puzzleGuide.cleanup === "function") puzzleGuide.cleanup();
    puzzleGuide = null;
    if (typeof puzzleCleanup === "function") puzzleCleanup();
    puzzleCleanup = null;
  }
  function openPuzzle(id) {
    cleanupPuzzle(); currentPuzzleId = id; freePlaySession = null;
    const challenge = challengeFor(id);
    currentPuzzleChallenge = challenge;
    elements.puzzleEyebrow.textContent = `Desafio ${String(id).padStart(2, "0")} de 64 · nível ${challenge.level}`;
    elements.puzzleTitle.textContent = challenge.title;
    elements.puzzleSticker.src = stickerSrc(id);
    elements.puzzleSticker.alt = `${stickerName(id)}, figurinha ${String(id).padStart(2, "0")}`;
    elements.puzzleDescription.textContent = `${challenge.description} Vença para liberar a figurinha de ${stickerName(id)}.`;
    elements.puzzleObjective.textContent = objectiveFor(challenge);
    elements.puzzleStatus.textContent = "Boa sorte!";
    elements.puzzleModal.hidden = false;
    delete elements.puzzleModal.dataset.difficulty;
    document.documentElement.classList.add("puzzle-open");
    document.body.style.overflow = "hidden";
    initPuzzle(challenge);
  }
  function closePuzzle() {
    cleanupPuzzle();
    currentPuzzleId = null;
    currentPuzzleChallenge = null;
    freePlaySession = null;
    dailyPlaySession = null;
    luxorCampaignSession = null;
    resumeSnapshot = null;
    delete elements.puzzleModal.dataset.difficulty;
    delete elements.puzzleModal.dataset.game;
    elements.puzzleModal.hidden = true;
    syncPuzzleGuideUI(null);
    document.documentElement.classList.remove("puzzle-open");
    document.body.style.overflow = "";
    renderInterruptedSession();
    if (currentView === "daily") renderDaily();
    applyPendingExternalState();
  }
  function startFreeClock() {
    if (!freePlaySession || !elements.freeLiveTimer) { if (elements.freeLiveTimer) elements.freeLiveTimer.hidden = true; return; }
    const gameCleanup = puzzleCleanup;
    const update = () => {
      const elapsed = freeElapsed();
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      const tenths = Math.floor((elapsed % 1000) / 100);
      elements.freeLiveTimer.textContent = `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")},${tenths}`;
    };
    elements.freeLiveTimer.hidden = false;
    update();
    const timer = window.setInterval(update, 100);
    puzzleCleanup = () => { clearInterval(timer); elements.freeLiveTimer.hidden = true; if (typeof gameCleanup === "function") gameCleanup(); };
  }
  function initPuzzle(challenge) {
    cleanupPuzzle(); currentPuzzleChallenge = challenge; elements.puzzleModal.dataset.game = challenge.key; elements.puzzleStage.replaceChildren(); elements.restartPuzzle.hidden = false;
    if (challenge.key === "numbers") initSlider(challenge, false);
    else if (challenge.key === "image") initSlider(challenge, true);
    else if (challenge.key === "memory") initMemory(challenge);
    else if (challenge.key === "snake") initSnake(challenge);
    else if (challenge.key === "tetris") initTetris(challenge);
    else if (challenge.key === "luxor") initLuxor(challenge);
    else if (challenge.key === "simon") initSimon(challenge);
    else initLights(challenge);
    if (challenge.freeMode) startFreeClock(); else elements.freeLiveTimer.hidden = true;
    syncPuzzleGuideUI(challenge);
  }
  function completePuzzle(gameResult = {}) {
    cleanupPuzzle();
    if (dailyPlaySession) return completeDailyPuzzle(gameResult);
    if (luxorCampaignSession) {
      const completed = completeLuxorCampaign(gameResult);
      if (!completed) return;
      const chapterFirst = (completed.config.chapter - 1) * 5 + 1;
      const chapterStars = Array.from({ length: 5 }, (_, offset) => Number(state.luxor.campaign.levels[String(chapterFirst + offset)]?.stars || 0)).reduce((sum, value) => sum + value, 0);
      const chapterSummary = completed.config.finale
        ? `<div class="luxor-chapter-result"><strong>Capítulo ${completed.config.chapter} completo</strong><span>${escapeHTML(Core.LUXOR_CHAPTERS[completed.config.chapter - 1].name)} · ${chapterStars}/15 estrelas conquistadas</span></div>`
        : "";
      elements.restartPuzzle.hidden = true;
      elements.puzzleStatus.textContent = completed.better ? "Novo recorde da campanha!" : `Nível ${completed.level} concluído!`;
      elements.puzzleStage.innerHTML = `<div class="free-success-card" style="--win-accent:${completed.config.finale ? "#a84438" : "#bb6248"}">
        <span class="free-win-emblem">${completed.config.finale ? "♛" : "★"}</span>
        <span class="free-win-label">Nível ${completed.level}/40 · ${completed.config.routeVariant}</span>
        <h3>${completed.config.finale ? "Guardião superado!" : "Percurso concluído!"}</h3>
        <div class="luxor-result-stars" aria-label="${completed.stars} de 3 estrelas">${"★".repeat(completed.stars)}${"☆".repeat(3 - completed.stars)}</div>
        <p><strong>${completed.score.toLocaleString("pt-BR")} pontos</strong> em <strong>${formatDuration(completed.elapsed)}</strong>.</p>
        ${chapterSummary}
        ${luxorScoreBreakdownHTML(gameResult)}
        <div class="free-win-actions"><button class="primary-button" id="nextLuxorCampaignLevel" type="button">${completed.level < 40 ? `Jogar nível ${completed.level + 1}` : "Rejogar o final"}</button><button class="secondary-button" id="leaveLuxorCampaign" type="button">Voltar ao mapa</button></div>
      </div>`;
      $("#nextLuxorCampaignLevel").addEventListener("click", () => openLuxorCampaignLevel(completed.level < 40 ? completed.level + 1 : 40));
      $("#leaveLuxorCampaign").addEventListener("click", () => { closePuzzle(); switchView("free"); renderLuxorCampaign(); });
      return;
    }
    if (freePlaySession) return completeFreePuzzle(gameResult);
    const id = currentPuzzleId;
    if (!state.unlocked.includes(id)) state.unlocked.push(id);
    saveState(); updateProgress(); renderMiniInventory(); renderChallenges(); renderInventory(); renderRankingProfile(); queuePlayerSync(120);
    elements.restartPuzzle.hidden = true;
    elements.puzzleGuideControl.hidden = true;
    clearPuzzleGuideTarget();
    elements.puzzleStatus.textContent = "Desafio vencido!";
    elements.puzzleStage.innerHTML = `<div class="success-card"><img src="${stickerSrc(id)}" alt="${stickerName(id)}, figurinha ${String(id).padStart(2, "0")}"><h3>${stickerName(id)} foi liberada!</h3><p>Você venceu o desafio ${String(id).padStart(2, "0")}. Agora esta lembrança pode ser colada no álbum.</p><button class="primary-button" id="placeWonSticker" type="button">Colar no álbum</button></div>`;
    $("#placeWonSticker").addEventListener("click", () => { closePuzzle(); beginPlacement(id); });
  }

  function initSlider(challenge, useImage) {
    const free = settingsFor(challenge) || {
      size: useImage ? 3 : 4,
      shuffle: 24 + challenge.level * 3,
      previewTokens: useImage ? 2 : 0,
      mechanic: "classic",
      label: "Clássico",
      seed: `album:${challenge.id}:${useImage ? "image" : "numbers"}:v2`
    };
    const size = free.size;
    const total = size * size;
    const random = Core.seededRandom(free.seed || challenge.seed || `slider:${challenge.id}`);
    const restoredCandidate = restoredGameState(challenge.key);
    const restored = useImage && restoredCandidate?.imageEncoding !== 2 ? null : restoredCandidate;
    const pendingTimers = new Set();
    const missingSource = useImage && free.missingVariant
      ? 1 + (Core.hash32(`${free.seed}:missing-piece`) % Math.max(1, total - 1))
      : 0;
    const targetTiles = useImage
      ? Array.from({ length: total }, (_, index) => index === missingSource ? 0 : index + 1)
      : Array.from({ length: total }, (_, index) => index);
    const rotationSlots = useImage ? total + 1 : total;
    const fixedCandidates = [total - 1, size - 1, total - size, total - 2, size * 2 - 1].filter((index) => index > 0 && index < total);
    const fixedIndices = new Set(Core.seededShuffle(fixedCandidates, `${free.seed}:fixed`).slice(0, Number(free.fixed || 0)));
    const forbiddenIndices = new Set(Core.seededShuffle(fixedCandidates.filter((index) => !fixedIndices.has(index)), `${free.seed}:forbidden`).slice(0, Number(free.forbidden || 0)));
    const blockedIndices = new Set([...fixedIndices, ...forbiddenIndices]);
    const neighbors = (blank) => {
      const row = Math.floor(blank / size);
      const col = blank % size;
      const result = [];
      if (row > 0) result.push(blank - size);
      if (row < size - 1) result.push(blank + size);
      if (col > 0) result.push(blank - 1);
      if (col < size - 1) result.push(blank + 1);
      return result.filter((index) => !blockedIndices.has(index));
    };
    let moves = restored ? Math.max(0, Number(restored.moves || 0)) : 0;
    let hints = restored ? Math.max(0, Number(restored.hints || 0)) : Number(free.previewTokens ?? (useImage ? 2 : 0));
    let selectedValue = restored ? Number(restored.selectedValue || 0) : 0;
    let tiles = restored && Array.isArray(restored.tiles) && restored.tiles.length === total
      ? restored.tiles.map(Number)
      : [...targetTiles];
    let rotations = restored && Array.isArray(restored.rotations) && restored.rotations.length === rotationSlots
      ? restored.rotations.map((value) => clamp(Number(value) || 0, 0, 3))
      : Array(rotationSlots).fill(0);
    let blankTrail = restored && Array.isArray(restored.blankTrail)
      ? restored.blankTrail.map(Number).filter((index) => index >= 0 && index < total)
      : [tiles.indexOf(0)];
    let trailQueue = restored && Array.isArray(restored.trailQueue) ? restored.trailQueue.map(Number) : [];
    let trailCompleted = restored ? Number(restored.trailCompleted || 0) : 0;
    let checkpointsDone = restored && Array.isArray(restored.checkpointsDone) ? restored.checkpointsDone.map(Number) : [];
    const checkpointValues = Core.seededShuffle(
      Array.from({ length: total - 1 }, (_, index) => index + 1).filter((value) => !blockedIndices.has(value)),
      `${free.seed}:checkpoints`
    ).slice(0, Number(free.checkpoints || 0));

    if (!restored) {
      let previous = -1;
      for (let move = 0; move < Number(free.shuffle || 24); move += 1) {
        const blank = tiles.indexOf(0);
        const choices = neighbors(blank).filter((index) => index !== previous);
        const safeChoices = choices.length ? choices : neighbors(blank);
        if (!safeChoices.length) break;
        const chosen = safeChoices[Math.floor(random() * safeChoices.length)];
        previous = blank;
        [tiles[blank], tiles[chosen]] = [tiles[chosen], tiles[blank]];
        blankTrail.push(chosen);
      }
      if (tiles.every((value, index) => value === targetTiles[index])) {
        const blank = tiles.indexOf(0);
        const chosen = neighbors(blank)[0];
        if (chosen !== undefined) {
          [tiles[blank], tiles[chosen]] = [tiles[chosen], tiles[blank]];
          blankTrail.push(chosen);
        }
      }
      if (useImage && free.rotations) {
        Core.seededShuffle(tiles.filter(Boolean), `${free.seed}:rotation-values`).slice(0, Number(free.rotations || 0)).forEach((value) => {
          rotations[value] = 1 + Math.floor(random() * 3);
        });
      }
      if (free.trail) {
        const reverseSolution = [...blankTrail].reverse().slice(1);
        trailQueue = [...new Set(reverseSolution.filter((index) => !blockedIndices.has(index)))].slice(0, Number(free.trail));
      }
    }

    const wrap = document.createElement("div");
    wrap.className = "slider-wrap";
    wrap.innerHTML = `<div class="game-hud slider-hud">
      <span>Movimentos: <b id="sliderMoves">${moves}</b>${free.moveLimit ? `/${free.moveLimitValue}` : ""}</span>
      <span class="phase-mechanic-tag">${escapeHTML(free.label || "Clássico")}</span>
      <span>${size} × ${size}</span>
    </div><div class="game-objective-bar"></div>`;
    const objectiveBar = $(".game-objective-bar", wrap);
    const renderObjectives = () => {
      objectiveBar.replaceChildren();
      const objectives = [];
      if (free.trail) objectives.push({ key: "trail", label: `Trilha ${trailCompleted}/${trailQueue.length}`, done: trailCompleted >= trailQueue.length });
      checkpointValues.forEach((value) => objectives.push({ label: `Peça ${value} no marco`, done: checkpointsDone.includes(value) }));
      if (free.moveLimit) objectives.push({ label: `${Math.max(0, free.moveLimitValue - moves)} movimentos`, done: false });
      if (free.timeLimit) objectives.push({ key: "time", label: `${Math.max(0, Math.ceil(timeRemaining / 1000))} s`, done: false });
      if (useImage && free.missingVariant) objectives.push({ label: `Peça ausente: posição ${missingSource + 1}`, done: false });
      objectives.forEach((objective) => {
        const chip = document.createElement("span");
        if (objective.key === "time") chip.id = "sliderTime";
        chip.textContent = objective.done ? `✓ ${objective.label}` : objective.label;
        chip.classList.toggle("is-done", objective.done);
        objectiveBar.append(chip);
      });
    };
    const board = document.createElement("div");
    board.className = `slide-grid${useImage ? " is-image" : ""}`;
    board.style.setProperty("--size", String(size));
    wrap.append(board);
    const tools = document.createElement("div");
    tools.className = "slider-tools";
    wrap.append(tools);
    let previewButton = null;
    if (useImage) {
      previewButton = document.createElement("button");
      previewButton.type = "button";
      previewButton.className = "slider-hint secondary-button";
      previewButton.innerHTML = `⌕ Ver imagem <span>(${hints})</span>`;
      previewButton.disabled = hints <= 0;
      tools.append(previewButton);
    }
    let rotateButton = null;
    if (useImage && free.rotations) {
      rotateButton = document.createElement("button");
      rotateButton.type = "button";
      rotateButton.className = "slider-rotate secondary-button";
      rotateButton.textContent = "↻ Girar peça selecionada";
      rotateButton.disabled = !selectedValue;
      tools.append(rotateButton);
    }
    elements.puzzleStage.append(wrap);
    const movesEl = $("#sliderMoves", wrap);
    let active = true;
    let timeTimer = 0;
    let timeRemaining = Number(restored?.timeRemaining ?? free.timeLimitMs ?? 0);
    const phaseElapsed = () => freePlaySession ? freeElapsed() - freePlaySession.completedMs : dailyPlaySession ? dailyElapsed() : 0;
    const rotationsSolved = () => !useImage || tiles.filter(Boolean).every((value) => rotations[value] === 0);
    const arrangementSolved = () => tiles.every((value, index) => value === targetTiles[index]);
    const checkpointsSolved = () => checkpointValues.every((value) => checkpointsDone.includes(value));
    const solved = () => arrangementSolved() && rotationsSolved() && trailCompleted >= trailQueue.length && checkpointsSolved();
    const capture = () => {
      updateActiveGameSnapshot({
        imageEncoding: useImage ? 2 : 0,
        tiles: [...tiles],
        rotations: [...rotations],
        moves,
        hints,
        selectedValue,
        blankTrail: [...blankTrail],
        trailQueue: [...trailQueue],
        trailCompleted,
        checkpointsDone: [...checkpointsDone],
        timeRemaining
      }, phaseElapsed());
    };
    const fail = (message) => {
      if (!active) return;
      active = false;
      elements.puzzleStatus.textContent = message;
      board.classList.add("is-hit");
      const timer = window.setTimeout(() => {
        pendingTimers.delete(timer);
        if (currentPuzzleChallenge === challenge && !elements.puzzleModal.hidden) initPuzzle(challenge);
      }, 850);
      pendingTimers.add(timer);
    };
    const showPreview = (duration = 950, consume = true) => {
      if (!active || board.classList.contains("is-previewing") || consume && hints <= 0) return;
      if (consume) {
        hints -= 1;
        previewButton.querySelector("span").textContent = `(${hints})`;
        previewButton.disabled = hints <= 0;
        capture();
      }
      const preview = document.createElement("img");
      preview.className = "slider-preview";
      preview.src = stickerSrc(challenge.id);
      preview.alt = `Imagem completa de ${stickerName(challenge.id)}`;
      board.classList.add("is-previewing");
      board.append(preview);
      const timer = window.setTimeout(() => {
        preview.remove();
        board.classList.remove("is-previewing");
        pendingTimers.delete(timer);
        refreshPuzzleGuide();
      }, duration);
      pendingTimers.add(timer);
    };
    if (previewButton) previewButton.addEventListener("click", () => showPreview());
    const refreshGuide = () => {
      if (blankTrail.length < 2 || solved()) return;
      const targetIndex = blankTrail[blankTrail.length - 2];
      markPuzzleGuideTarget(board.children[targetIndex], "Clique na peça destacada");
    };
    const checkProgress = () => {
      checkpointValues.forEach((value) => {
        if (tiles[value] === value && !checkpointsDone.includes(value)) checkpointsDone.push(value);
      });
      renderObjectives();
      if (free.moveLimit && moves > free.moveLimitValue) return fail("O limite de movimentos terminou. O mesmo tabuleiro será reiniciado.");
      if (solved()) {
        active = false;
        capture();
        const timer = window.setTimeout(() => completePuzzle({ moves }), 350);
        pendingTimers.add(timer);
      }
    };
    const rotateSelected = () => {
      if (!active || !selectedValue) return;
      rotations[selectedValue] = (rotations[selectedValue] + 1) % 4;
      moves += 1;
      movesEl.textContent = String(moves);
      render();
      capture();
      checkProgress();
    };
    if (rotateButton) rotateButton.addEventListener("click", rotateSelected);
    const keyHandler = (event) => {
      if ((event.key === "r" || event.key === "R") && rotateButton && !elements.puzzleModal.hidden) {
        event.preventDefault();
        rotateSelected();
      }
    };
    window.addEventListener("keydown", keyHandler);
    function render() {
      board.replaceChildren();
      const nextTrailIndex = trailQueue[trailCompleted];
      tiles.forEach((value, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `slide-tile${value === 0 ? " is-empty" : ""}${useImage ? " image-tile" : ""}`;
        button.classList.toggle("is-fixed", fixedIndices.has(index));
        button.classList.toggle("is-forbidden", forbiddenIndices.has(index));
        button.classList.toggle("is-checkpoint", checkpointValues.includes(value) && !checkpointsDone.includes(value));
        button.classList.toggle("is-trail-target", index === nextTrailIndex);
        button.classList.toggle("is-selected", value === selectedValue && value !== 0);
        button.style.position = "relative";
        if (!useImage) button.textContent = value ? String(value) : "";
        else if (value) {
          const sourceIndex = value - 1;
          const row = Math.floor(sourceIndex / size);
          const col = sourceIndex % size;
          button.style.backgroundImage = `url(${stickerSrc(challenge.id)})`;
          button.style.backgroundSize = `${size * 100}% ${size * 100}%`;
          button.style.backgroundPosition = `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`;
          button.style.transform = `rotate(${rotations[value] * 90}deg)`;
          if (free.cornerHints && [0, size - 1, total - size, total - 1].includes(sourceIndex)) button.setAttribute("data-corner", "true");
        }
        button.setAttribute("aria-label", value ? `${useImage ? "Peça" : "Número"} ${useImage ? value : value}${rotations[value] ? `, girada ${rotations[value] * 90} graus` : ""}` : useImage && free.missingVariant ? `Peça ausente na posição ${missingSource + 1}` : "Espaço vazio");
        button.addEventListener("click", () => {
          if (!active || value === 0 || fixedIndices.has(index) || forbiddenIndices.has(index)) return;
          const blank = tiles.indexOf(0);
          if (!neighbors(blank).includes(index)) {
            if (useImage && free.rotations) {
              selectedValue = value;
              if (rotateButton) rotateButton.disabled = false;
              render();
              capture();
            }
            return;
          }
          [tiles[blank], tiles[index]] = [tiles[index], tiles[blank]];
          if (blankTrail.length > 1 && index === blankTrail[blankTrail.length - 2]) blankTrail.pop();
          else blankTrail.push(index);
          const newBlank = index;
          if (trailQueue[trailCompleted] === newBlank) trailCompleted += 1;
          selectedValue = value;
          if (rotateButton) rotateButton.disabled = false;
          moves += 1;
          movesEl.textContent = String(moves);
          render();
          capture();
          checkProgress();
        });
        board.append(button);
      });
      renderObjectives();
      refreshPuzzleGuide();
    }
    render();
    if (useImage && free.previewMs && !restored) showPreview(free.previewMs, false);
    if (free.timeLimit) {
      const startedRemaining = Math.max(0, Number(restored?.timeRemaining ?? free.timeLimitMs));
      timeRemaining = startedRemaining;
      let lastTick = performance.now();
      timeTimer = window.setInterval(() => {
        if (document.hidden || !active) { lastTick = performance.now(); return; }
        const now = performance.now();
        timeRemaining -= now - lastTick;
        lastTick = now;
        const timeChip = $("#sliderTime", objectiveBar);
        if (timeChip) timeChip.textContent = `${Math.max(0, Math.ceil(timeRemaining / 1000))} s`;
        if (timeRemaining <= 0) fail("O tempo terminou. O mesmo tabuleiro será reiniciado para uma tentativa justa.");
      }, 200);
    }
    setPuzzleGuide({ refresh: refreshGuide });
    elements.puzzleStatus.textContent = useImage
      ? `Reconstrua ${stickerName(challenge.id)}. Toque numa peça distante para selecioná-la e use “Girar” quando necessário.`
      : `Ordene de 1 a ${total - 1}. ${free.label || "O espaço vazio termina no canto superior esquerdo."}`;
    puzzleCleanup = () => {
      active = false;
      clearInterval(timeTimer);
      pendingTimers.forEach(clearTimeout);
      window.removeEventListener("keydown", keyHandler);
    };
  }

  function initMemory(challenge) {
    const free = settingsFor(challenge) || {
      pairs: 4 + (challenge.level % 3),
      preview: 0,
      layout: "rectangle",
      label: "Pares queridos",
      seed: `album:memory:${challenge.id}:v2`
    };
    const symbolSet = [
      { icon: "♡", label: "coração" }, { icon: "⌂", label: "casa" }, { icon: "✿", label: "flor" },
      { icon: "★", label: "estrela" }, { icon: "☀", label: "sol" }, { icon: "♫", label: "música" },
      { icon: "☕", label: "xícara" }, { icon: "☾", label: "lua" }, { icon: "⚑", label: "bandeira" },
      { icon: "◆", label: "diamante" }, { icon: "☂", label: "guarda-chuva" }, { icon: "●", label: "círculo" }
    ];
    const pairs = free.pairs;
    const random = Core.seededRandom(free.seed || challenge.seed || `memory:${challenge.id}`);
    const chosenSymbols = symbolSet.slice(0, pairs).map((symbol, index) => ({ ...symbol, key: `pair-${index}` }));
    if (free.wildPairs) {
      for (let index = 0; index < Math.min(free.wildPairs, chosenSymbols.length); index += 1) {
        chosenSymbols[chosenSymbols.length - 1 - index] = { icon: "✦", label: `coringa ${index + 1}`, key: `wild-${index}`, wild: true };
      }
    }
    const generatedDeck = Core.seededShuffle(chosenSymbols.flatMap((symbol) => [{ ...symbol, card: 0 }, { ...symbol, card: 1 }]), random);
    const restored = restoredGameState("memory");
    let deck = restored && Array.isArray(restored.deck) && restored.deck.length === pairs * 2
      ? restored.deck.map((card) => ({
        icon: String(card.icon || "♡").slice(0, 4),
        label: String(card.label || "símbolo").slice(0, 40),
        key: String(card.key || "").slice(0, 30),
        wild: Boolean(card.wild),
        card: Number(card.card || 0)
      }))
      : generatedDeck;
    let open = [];
    let matchedKeys = new Set(restored && Array.isArray(restored.matchedKeys) ? restored.matchedKeys.map(String) : []);
    let attempts = Math.max(0, Number(restored?.attempts || 0));
    let mistakes = Math.max(0, Number(restored?.mistakes || 0));
    let combo = Math.max(0, Number(restored?.combo || 0));
    let maxCombo = Math.max(combo, Number(restored?.maxCombo || 0));
    let sequenceIndex = Math.max(0, Number(restored?.sequenceIndex || 0));
    let previewing = Boolean(free.preview && !restored);
    let locked = previewing;
    let active = true;
    let timeRemaining = Number(restored?.timeRemaining ?? free.timeLimitMs ?? 0);
    const pendingTimers = new Set();
    const lockedKeys = chosenSymbols.slice(0, Number(free.lockedPairs || 0)).map((symbol) => symbol.key);
    const sequence = [
      ...Core.seededShuffle(chosenSymbols.map((symbol) => symbol.key).filter((key) => !lockedKeys.includes(key)), `${free.seed}:sequence:open`),
      ...lockedKeys
    ];
    const symbolByKey = Object.fromEntries(chosenSymbols.map((symbol) => [symbol.key, symbol]));
    const wrap = document.createElement("div");
    wrap.className = "memory-wrap";
    wrap.innerHTML = `<div class="game-hud">
      <span>Tentativas: <b id="memoryAttempts">${attempts}</b></span>
      <span id="memoryCombo">Combo: ${combo || "—"}</span>
      <span>Pares: <b id="memoryPairs">${matchedKeys.size}</b>/${pairs}</span>
    </div><div class="game-objective-bar"></div>`;
    const objectiveBar = $(".game-objective-bar", wrap);
    const board = document.createElement("div");
    board.className = "memory-board";
    board.dataset.layout = free.layout || "rectangle";
    board.style.setProperty("--memory-cols", String(pairs >= 12 ? 6 : pairs >= 10 ? 5 : 4));
    wrap.append(board);
    elements.puzzleStage.append(wrap);
    const attemptsEl = $("#memoryAttempts", wrap);
    const pairsEl = $("#memoryPairs", wrap);
    const comboEl = $("#memoryCombo", wrap);
    const later = (fn, delay) => {
      const timer = window.setTimeout(() => {
        pendingTimers.delete(timer);
        fn();
      }, delay);
      pendingTimers.add(timer);
    };
    const matchedCount = () => matchedKeys.size;
    const isLockedKey = (key) => {
      const lockIndex = lockedKeys.indexOf(key);
      return lockIndex >= 0 && matchedCount() <= lockIndex;
    };
    const phaseElapsed = () => freePlaySession ? freeElapsed() - freePlaySession.completedMs : dailyPlaySession ? dailyElapsed() : 0;
    const capture = () => updateActiveGameSnapshot({
      deck: deck.map((card) => ({ ...card })),
      matchedKeys: [...matchedKeys],
      attempts,
      mistakes,
      combo,
      maxCombo,
      sequenceIndex,
      timeRemaining
    }, phaseElapsed());
    const renderObjectives = () => {
      objectiveBar.replaceChildren();
      const chips = [];
      if (free.comboGoal) chips.push({ label: `Combo ×${free.comboGoal}`, done: maxCombo >= free.comboGoal });
      if (free.mistakeLimit) chips.push({ label: `${Math.max(0, free.mistakeLimitValue - mistakes)} erros restantes`, done: false });
      if (free.sequenceMatch) {
        const target = symbolByKey[sequence[sequenceIndex]];
        chips.push({ label: target ? `Próximo: ${target.label} ${target.icon}` : "Sequência concluída", done: !target });
      }
      if (free.timeLimit) chips.push({ key: "time", label: `${Math.max(0, Math.ceil(timeRemaining / 1000))} s`, done: false });
      if (free.movingCards) chips.push({ label: "Cartas móveis", done: false });
      chips.forEach((chip) => {
        const item = document.createElement("span");
        if (chip.key === "time") item.id = "memoryTime";
        item.classList.toggle("is-done", chip.done);
        item.textContent = chip.done ? `✓ ${chip.label}` : chip.label;
        objectiveBar.append(item);
      });
    };
    const refreshGuide = () => {
      if (locked || matchedCount() === pairs || !active) return;
      const available = deck.map((card, index) => ({ card, index }))
        .filter(({ card, index }) => !matchedKeys.has(card.key) && !open.includes(index) && !isLockedKey(card.key));
      let targetIndex = null;
      if (open.length === 1) targetIndex = available.find(({ card }) => card.key === deck[open[0]].key)?.index;
      else {
        const wantedKey = free.sequenceMatch ? sequence[sequenceIndex] : available[0]?.card.key;
        targetIndex = available.find(({ card }) => card.key === wantedKey)?.index;
      }
      markPuzzleGuideTarget(board.children[targetIndex], open.length ? "Ache o par destacado" : "Comece pela carta destacada");
    };
    const moveUnmatchedCards = () => {
      if (!free.movingCards || !active) return;
      const indices = deck.map((card, index) => !matchedKeys.has(card.key) ? index : -1).filter((index) => index >= 0);
      if (indices.length < 4) return;
      const selected = Core.seededShuffle(indices, `${free.seed}:move:${attempts}`).slice(0, Math.min(4, indices.length));
      const values = selected.map((index) => deck[index]);
      selected.forEach((index, position) => { deck[index] = values[(position + 1) % values.length]; });
      board.classList.remove("is-moving");
      void board.offsetWidth;
      board.classList.add("is-moving");
      render();
      elements.puzzleStatus.textContent = "As cartas não encontradas mudaram de lugar.";
    };
    const fail = (message) => {
      if (!active) return;
      active = false;
      elements.puzzleStatus.textContent = message;
      wrap.classList.add("is-error");
      later(() => {
        if (currentPuzzleChallenge === challenge && !elements.puzzleModal.hidden) initPuzzle(challenge);
      }, 900);
    };
    const finishIfReady = () => {
      if (matchedCount() !== pairs) return false;
      if (free.comboGoal && maxCombo < free.comboGoal) {
        fail(`Todos os pares apareceram, mas faltou alcançar combo ×${free.comboGoal}. O mesmo baralho será reiniciado.`);
        return true;
      }
      active = false;
      capture();
      later(() => completePuzzle({ attempts, mistakes, maxCombo, performanceBonus: maxCombo * 70 }), 320);
      return true;
    };
    const chooseCard = (index) => {
      if (!active || locked || open.includes(index)) return;
      const card = deck[index];
      if (!card || matchedKeys.has(card.key)) return;
      if (isLockedKey(card.key)) {
        elements.puzzleStatus.textContent = "Este par está guardado. Encontre outro para abrir a trava.";
        return;
      }
      open.push(index);
      render();
      refreshGuide();
      if (open.length < 2) return;
      locked = true;
      clearPuzzleGuideTarget();
      attempts += 1;
      attemptsEl.textContent = String(attempts);
      const [a, b] = open;
      const pairMatches = deck[a].key === deck[b].key;
      const sequenceMatches = !free.sequenceMatch || deck[a].key === sequence[sequenceIndex];
      if (pairMatches && sequenceMatches) {
        combo += 1;
        maxCombo = Math.max(maxCombo, combo);
        later(() => {
          matchedKeys.add(deck[a].key);
          if (free.sequenceMatch) sequenceIndex += 1;
          pairsEl.textContent = String(matchedCount());
          comboEl.textContent = combo >= 2 ? `Combo ×${combo}!` : "Combo: 1";
          comboEl.classList.toggle("is-hot", combo >= 2);
          open = [];
          locked = false;
          render();
          capture();
          elements.puzzleStatus.textContent = `${matchedCount()} de ${pairs} pares${combo >= 2 ? ` · combo ×${combo}` : ""}.`;
          if (!finishIfReady()) {
            if (free.movingCards && attempts % 2 === 0) moveUnmatchedCards();
            refreshGuide();
          }
        }, 280);
      } else {
        mistakes += 1;
        combo = 0;
        comboEl.textContent = "Combo: —";
        comboEl.classList.remove("is-hot");
        later(() => {
          open = [];
          locked = false;
          render();
          capture();
          if (free.mistakeLimit && mistakes > free.mistakeLimitValue) {
            fail("O limite de erros terminou. O mesmo baralho será reiniciado.");
            return;
          }
          if (free.sequenceMatch && pairMatches) elements.puzzleStatus.textContent = "O par está certo, mas ainda não é o próximo capítulo da sequência.";
          if (free.movingCards && mistakes % 2 === 0) moveUnmatchedCards();
          refreshPuzzleGuide();
        }, Math.max(360, 710 - freeRank(challenge) * 42));
      }
      renderObjectives();
    };
    function render() {
      board.replaceChildren();
      deck.forEach((card, index) => {
        const button = document.createElement("button");
        button.type = "button";
        const isOpen = open.includes(index) || previewing;
        const isMatched = matchedKeys.has(card.key);
        button.className = `memory-card${isOpen ? " is-open" : ""}${isMatched ? " is-matched" : ""}${isLockedKey(card.key) ? " is-locked" : ""}${card.wild ? " is-wild" : ""}`;
        button.dataset.icon = card.icon;
        button.setAttribute("aria-label", isMatched ? `${card.label}, par encontrado` : isOpen ? `${card.label}, carta aberta` : `Carta ${index + 1}, fechada`);
        button.disabled = isMatched;
        button.addEventListener("click", () => chooseCard(index));
        board.append(button);
      });
      renderObjectives();
    }
    render();
    if (free.preview && !restored) later(() => {
      previewing = false;
      locked = false;
      render();
      elements.puzzleStatus.textContent = `Agora encontre os ${pairs} pares. Cada carta também é identificada por nome e símbolo.`;
      refreshPuzzleGuide();
    }, free.preview);
    let timeTimer = 0;
    if (free.timeLimit) {
      let lastTick = performance.now();
      timeTimer = window.setInterval(() => {
        if (document.hidden || !active) { lastTick = performance.now(); return; }
        const now = performance.now();
        timeRemaining -= now - lastTick;
        lastTick = now;
        const chip = $("#memoryTime", objectiveBar);
        if (chip) chip.textContent = `${Math.max(0, Math.ceil(timeRemaining / 1000))} s`;
        if (timeRemaining <= 0) fail("O tempo terminou. O baralho diário permanece o mesmo.");
      }, 200);
    }
    setPuzzleGuide({ refresh: refreshGuide });
    elements.puzzleStatus.textContent = free.preview && !restored
      ? "Memorize os símbolos e seus nomes antes que as cartas virem."
      : `Encontre ${pairs} pares. ${free.label || "Encadeie acertos para formar combos."}`;
    puzzleCleanup = () => {
      active = false;
      clearInterval(timeTimer);
      pendingTimers.forEach(clearTimeout);
    };
  }

  function initSnake(challenge) {
    const free = settingsFor(challenge) || {
      target: 4 + (challenge.level % 4),
      interval: Math.max(105, 175 - challenge.level * 7),
      obstacles: 0,
      map: "open",
      mode: "target",
      label: "Passeio",
      seed: `album:snake:${challenge.id}:v2`
    };
    const target = free.target;
    const grid = 16;
    const cell = 20;
    const random = Core.seededRandom(free.seed || challenge.seed || `snake:${challenge.id}`);
    const restored = restoredGameState("snake");
    const pendingTimers = new Set();
    const wrap = document.createElement("div");
    wrap.className = "game-wrap";
    wrap.innerHTML = `<div class="game-hud">
      <span>Pontos: <b id="snakeScore">0</b>${free.mode === "survival" ? "" : `/${target}`}</span>
      <span id="snakeCombo">Multiplicador ×1</span>
      <span id="snakeMode">${escapeHTML(free.label || free.mode)}</span>
      <span id="snakeShield">Escudo 0</span>
    </div><div class="game-objective-bar"></div>
    <canvas class="game-canvas snake-canvas" width="${grid * cell}" height="${grid * cell}" aria-label="Cobrinha em um mapa ${free.map}; use as setas ou os botões direcionais"></canvas>
    <div class="game-controls"><button type="button" data-dir="up" aria-label="Subir">↑</button><button type="button" data-dir="left" aria-label="Esquerda">←</button><button type="button" data-dir="down" aria-label="Descer">↓</button><button type="button" data-dir="right" aria-label="Direita">→</button></div>`;
    elements.puzzleStage.append(wrap);
    const canvas = $("canvas", wrap);
    const ctx = canvas.getContext("2d");
    const scoreEl = $("#snakeScore", wrap);
    const comboEl = $("#snakeCombo", wrap);
    const shieldEl = $("#snakeShield", wrap);
    const objectiveBar = $(".game-objective-bar", wrap);
    const controlButtons = Object.fromEntries($$("[data-dir]", wrap).map((button) => [button.dataset.dir, button]));
    const DIRECTIONS = [
      { name: "up", x: 0, y: -1 }, { name: "right", x: 1, y: 0 },
      { name: "down", x: 0, y: 1 }, { name: "left", x: -1, y: 0 }
    ];
    const keyOf = (point) => `${point.x},${point.y}`;
    const safeStart = new Set(Array.from({ length: 9 }, (_, index) => `${index + 2},8`));
    const uniquePoints = (points) => [...new Map(points.map((point) => [keyOf(point), point])).values()];
    const buildMap = () => {
      const points = [];
      if (free.map === "lanes") {
        [4, 11].forEach((x) => {
          for (let y = 1; y < grid - 1; y += 1) if (![4, 8, 12].includes(y)) points.push({ x, y });
        });
      } else if (free.map === "rooms") {
        for (let x = 2; x < grid - 2; x += 1) if (![5, 10].includes(x)) points.push({ x, y: 5 }, { x, y: 11 });
        for (let y = 2; y < grid - 2; y += 1) if (![7, 8].includes(y)) points.push({ x: 8, y });
      } else if (free.map === "spiral") {
        for (let x = 2; x < 14; x += 1) points.push({ x, y: 2 });
        for (let y = 2; y < 13; y += 1) points.push({ x: 13, y });
        for (let x = 5; x < 13; x += 1) points.push({ x, y: 12 });
        for (let y = 5; y < 12; y += 1) points.push({ x: 5, y });
        for (let x = 5; x < 11; x += 1) points.push({ x, y: 5 });
      }
      const desired = Number(free.obstacles || 0);
      let guard = 0;
      while (points.length < desired && guard < 600) {
        guard += 1;
        const point = { x: 1 + Math.floor(random() * (grid - 2)), y: 1 + Math.floor(random() * (grid - 2)) };
        if (!safeStart.has(keyOf(point))) points.push(point);
      }
      return uniquePoints(points).filter((point) => !safeStart.has(keyOf(point)));
    };
    let obstacles = restored && Array.isArray(restored.obstacles) ? restored.obstacles.map((point) => ({ x: Number(point.x), y: Number(point.y) })) : buildMap();
    let snake = restored && Array.isArray(restored.snake) && restored.snake.length >= 3
      ? restored.snake.map((point) => ({ x: Number(point.x), y: Number(point.y) }))
      : [{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }];
    let direction = restored?.direction || { x: 1, y: 0 };
    let nextDirection = { ...direction };
    let score = Math.max(0, Number(restored?.score || 0));
    let multiplier = Math.max(1, Number(restored?.multiplier || 1));
    let shield = Math.max(0, Number(restored?.shield || 0));
    let foodCount = Math.max(0, Number(restored?.foodCount || 0));
    let survivalMs = Math.max(0, Number(restored?.survivalMs || 0));
    let checkpointCount = Math.max(0, Number(restored?.checkpointCount || 0));
    let running = true;
    let foodPulse = 0;
    let timer = 0;
    let snapshotTimer = 0;
    const checkpointPositions = [{ x: 14, y: 2 }, { x: 2, y: 2 }, { x: 14, y: 14 }].slice(0, Number(free.checkpoints || 0));
    const hazards = restored && Array.isArray(restored.hazards) ? restored.hazards.map((hazard) => ({ ...hazard })) : Array.from({ length: Number(free.movingHazards || 0) }, (_, index) => ({
      x: 7 + index * 3,
      y: 3 + index * 5,
      dx: index % 2 ? -1 : 1,
      dy: index % 2 ? 0 : 1
    }));
    const speedZones = free.speedZones ? [
      { x: 1, y: 1, width: 4, height: 4, multiplier: .72, color: "rgba(91,142,158,.2)" },
      { x: 11, y: 11, width: 4, height: 4, multiplier: 1.35, color: "rgba(205,117,74,.2)" }
    ] : [];
    const blockedSet = (includeSnake = true) => new Set([
      ...obstacles.map(keyOf),
      ...hazards.map(keyOf),
      ...(includeSnake ? snake.slice(0, -1).map(keyOf) : [])
    ]);
    const reachableCells = () => {
      const blocked = blockedSet();
      blocked.delete(keyOf(snake[0]));
      const queue = [{ ...snake[0] }];
      const seen = new Set([keyOf(snake[0])]);
      while (queue.length) {
        const current = queue.shift();
        DIRECTIONS.forEach((step) => {
          const point = { x: current.x + step.x, y: current.y + step.y };
          const key = keyOf(point);
          if (point.x < 0 || point.y < 0 || point.x >= grid || point.y >= grid || blocked.has(key) || seen.has(key)) return;
          seen.add(key);
          queue.push(point);
        });
      }
      return [...seen].map((key) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y };
      });
    };
    const nextFood = () => {
      const candidates = reachableCells().filter((point) =>
        !snake.some((part) => keyOf(part) === keyOf(point)) &&
        !checkpointPositions.some((checkpoint, index) => index >= checkpointCount && keyOf(checkpoint) === keyOf(point))
      );
      const point = candidates[Math.floor(random() * candidates.length)] || { ...snake.at(-1) };
      const type = free.shield && foodCount > 0 && foodCount % 5 === 0
        ? "shield"
        : free.multiplierFood && foodCount > 0 && foodCount % 3 === 0 ? "multiplier"
          : free.tailCutRisk && foodCount > 0 && foodCount % 6 === 0 ? "risk" : "heart";
      return { ...point, type };
    };
    let food = restored?.food && Number.isFinite(Number(restored.food.x)) ? { ...restored.food } : nextFood();
    const phaseElapsed = () => freePlaySession ? freeElapsed() - freePlaySession.completedMs : dailyPlaySession ? dailyElapsed() : survivalMs;
    const capture = () => updateActiveGameSnapshot({
      snake: snake.map((point) => ({ ...point })),
      direction: { ...direction },
      food: { ...food },
      obstacles: obstacles.map((point) => ({ ...point })),
      hazards: hazards.map((hazard) => ({ ...hazard })),
      score,
      multiplier,
      shield,
      foodCount,
      survivalMs,
      checkpointCount
    }, phaseElapsed());
    const renderObjectives = () => {
      objectiveBar.replaceChildren();
      const chips = [];
      if (free.mode !== "survival") chips.push({ label: `${score}/${target} pontos`, done: score >= target });
      if (free.mode === "survival" || free.mode === "mixed") chips.push({ label: `${Math.floor(survivalMs / 1000)}/${free.survivalSeconds} s`, done: survivalMs >= free.survivalSeconds * 1000 });
      if (free.checkpoints) chips.push({ label: `${checkpointCount}/${free.checkpoints} checkpoints`, done: checkpointCount >= free.checkpoints });
      if (free.movingHazards) chips.push({ label: `${free.movingHazards} perigos móveis`, done: false });
      chips.forEach((chip) => {
        const element = document.createElement("span");
        element.classList.toggle("is-done", chip.done);
        element.textContent = chip.done ? `✓ ${chip.label}` : chip.label;
        objectiveBar.append(element);
      });
    };
    const drawHeart = (item) => {
      ctx.save();
      const styles = {
        heart: { color: "#f27861", symbol: "♥" },
        multiplier: { color: "#f0bd55", symbol: "×2" },
        shield: { color: "#69a0a3", symbol: "◇" },
        risk: { color: "#a96181", symbol: "✂" }
      };
      const style = styles[item.type] || styles.heart;
      ctx.shadowColor = style.color;
      ctx.shadowBlur = 7 + foodPulse;
      ctx.fillStyle = style.color;
      ctx.font = item.type === "multiplier" ? "bold 12px sans-serif" : `${17 + Math.min(2, foodPulse / 4)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(style.symbol, item.x * cell + cell / 2, item.y * cell + cell / 2 + 1);
      ctx.restore();
    };
    const draw = () => {
      ctx.fillStyle = "#283326";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      speedZones.forEach((zone) => {
        ctx.fillStyle = zone.color;
        ctx.fillRect(zone.x * cell, zone.y * cell, zone.width * cell, zone.height * cell);
      });
      ctx.strokeStyle = "rgba(255,255,255,.035)";
      ctx.lineWidth = 1;
      for (let index = 0; index <= grid; index += 1) {
        ctx.beginPath(); ctx.moveTo(index * cell, 0); ctx.lineTo(index * cell, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, index * cell); ctx.lineTo(canvas.width, index * cell); ctx.stroke();
      }
      obstacles.forEach((part) => {
        ctx.fillStyle = "#744c3b";
        ctx.beginPath();
        canvasRoundedRect(ctx, part.x * cell + 3, part.y * cell + 3, cell - 6, cell - 6, 4);
        ctx.fill();
        ctx.fillStyle = "rgba(255,214,155,.24)";
        ctx.fillRect(part.x * cell + 6, part.y * cell + 6, cell - 12, 3);
      });
      checkpointPositions.forEach((point, index) => {
        if (index < checkpointCount) return;
        ctx.strokeStyle = "#f0bd55";
        ctx.lineWidth = 3;
        ctx.strokeRect(point.x * cell + 4, point.y * cell + 4, cell - 8, cell - 8);
      });
      hazards.forEach((hazard) => {
        ctx.fillStyle = "#bc5d52";
        ctx.beginPath();
        ctx.arc(hazard.x * cell + cell / 2, hazard.y * cell + cell / 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("!", hazard.x * cell + cell / 2, hazard.y * cell + cell / 2 + 3);
      });
      snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? shield ? "#7cc5c0" : "#f1c15f" : "#7f9a69";
        ctx.beginPath();
        canvasRoundedRect(ctx, part.x * cell + 2, part.y * cell + 2, cell - 4, cell - 4, 5);
        ctx.fill();
      });
      drawHeart(food);
      foodPulse = (foodPulse + 1) % 12;
      renderObjectives();
    };
    const guidedDirection = () => {
      if (!running || !snake.length || !food) return null;
      const blocked = blockedSet();
      blocked.delete(keyOf(snake[0]));
      const queue = [{ ...snake[0], first: null }];
      const seen = new Set([keyOf(snake[0])]);
      while (queue.length) {
        const current = queue.shift();
        for (const step of DIRECTIONS) {
          if (!current.first && step.x === -direction.x && step.y === -direction.y) continue;
          const point = { x: current.x + step.x, y: current.y + step.y };
          const key = keyOf(point);
          if (point.x < 0 || point.y < 0 || point.x >= grid || point.y >= grid || blocked.has(key) || seen.has(key)) continue;
          const first = current.first || step.name;
          if (point.x === food.x && point.y === food.y) return first;
          seen.add(key);
          queue.push({ ...point, first });
        }
      }
      return null;
    };
    const refreshGuide = () => markPuzzleGuideTarget(controlButtons[guidedDirection()], "Siga a rota alcançável destacada");
    const setDirection = (name) => {
      const next = DIRECTIONS.find((item) => item.name === name);
      if (!next || next.x === -direction.x && next.y === -direction.y) return;
      nextDirection = { x: next.x, y: next.y };
      refreshPuzzleGuide();
    };
    const currentZoneMultiplier = () => {
      const head = snake[0];
      return speedZones.find((zone) => head.x >= zone.x && head.x < zone.x + zone.width && head.y >= zone.y && head.y < zone.y + zone.height)?.multiplier || 1;
    };
    const moveHazards = () => {
      hazards.forEach((hazard) => {
        let next = { x: hazard.x + hazard.dx, y: hazard.y + hazard.dy };
        if (next.x < 1 || next.y < 1 || next.x >= grid - 1 || next.y >= grid - 1 || obstacles.some((point) => keyOf(point) === keyOf(next))) {
          hazard.dx *= -1;
          hazard.dy *= -1;
          next = { x: hazard.x + hazard.dx, y: hazard.y + hazard.dy };
        }
        hazard.x = next.x;
        hazard.y = next.y;
      });
    };
    const collisionRecovery = (message) => {
      if (shield > 0) {
        shield -= 1;
        shieldEl.textContent = `Escudo ${shield}`;
        const occupied = new Set([...obstacles, ...hazards, ...snake.slice(1)].map(keyOf));
        const safeDirection = DIRECTIONS.find((candidate) => {
          const point = { x: snake[0].x + candidate.x, y: snake[0].y + candidate.y };
          return point.x >= 0 && point.y >= 0 && point.x < grid && point.y < grid && !occupied.has(keyOf(point));
        });
        direction = safeDirection ? { x: safeDirection.x, y: safeDirection.y } : { x: -direction.x, y: -direction.y };
        nextDirection = { ...direction };
        elements.puzzleStatus.textContent = `O escudo absorveu a colisão. ${shield} carga restante.`;
        return true;
      }
      running = false;
      clearPuzzleGuideTarget();
      canvas.classList.add("is-hit");
      elements.puzzleStatus.textContent = message;
      const resetTimer = window.setTimeout(() => {
        pendingTimers.delete(resetTimer);
        if (currentPuzzleChallenge === challenge && !elements.puzzleModal.hidden) initPuzzle(challenge);
      }, 780);
      pendingTimers.add(resetTimer);
      return false;
    };
    const finishReady = () => {
      const targetReady = free.mode === "survival" || score >= target;
      const survivalReady = !["survival", "mixed"].includes(free.mode) || survivalMs >= free.survivalSeconds * 1000;
      const checkpointReady = !free.checkpoints || checkpointCount >= free.checkpoints;
      if (!targetReady || !survivalReady || !checkpointReady) return false;
      running = false;
      capture();
      clearPuzzleGuideTarget();
      draw();
      const winTimer = window.setTimeout(() => {
        pendingTimers.delete(winTimer);
        completePuzzle({ score: score * 100, performanceBonus: score * multiplier * 35 });
      }, 300);
      pendingTimers.add(winTimer);
      return true;
    };
    let lastTickAt = performance.now();
    const tick = () => {
      if (!running) return;
      const now = performance.now();
      if (document.hidden) {
        lastTickAt = now;
        timer = window.setTimeout(tick, free.interval);
        return;
      }
      survivalMs += Math.max(0, now - lastTickAt);
      lastTickAt = now;
      direction = nextDirection;
      moveHazards();
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
      const selfIndex = snake.findIndex((part) => part.x === head.x && part.y === head.y);
      const hardCollision = head.x < 0 || head.y < 0 || head.x >= grid || head.y >= grid ||
        obstacles.some((part) => part.x === head.x && part.y === head.y) ||
        hazards.some((part) => part.x === head.x && part.y === head.y);
      if (hardCollision) {
        if (!collisionRecovery("Houve uma colisão. O mesmo mapa será reiniciado.")) return;
      } else if (selfIndex >= 0) {
        if (free.tailCutRisk && selfIndex >= 3) {
          snake.splice(selfIndex);
          score = Math.max(0, score - 1);
          elements.puzzleStatus.textContent = "A cauda foi cortada: você perdeu um ponto, mas a rodada continua.";
        } else if (!collisionRecovery("A cobrinha encontrou a própria cauda. O mapa será reiniciado.")) return;
      } else {
        snake.unshift(head);
        const pendingCheckpoint = checkpointPositions[checkpointCount];
        if (pendingCheckpoint && head.x === pendingCheckpoint.x && head.y === pendingCheckpoint.y) {
          checkpointCount += 1;
          shield = Math.max(shield, 1);
          elements.puzzleStatus.textContent = `Checkpoint ${checkpointCount}/${free.checkpoints} alcançado: +1 escudo.`;
        }
        if (head.x === food.x && head.y === food.y) {
          foodCount += 1;
          if (food.type === "shield") {
            shield += 1;
            score += 1;
          } else if (food.type === "multiplier") {
            multiplier = Math.min(4, multiplier + 1);
            score += 2 * multiplier;
          } else if (food.type === "risk") {
            score += 3 * multiplier;
            if (snake.length > 5) snake.splice(-2);
          } else score += multiplier;
          scoreEl.textContent = String(score);
          comboEl.textContent = `Multiplicador ×${multiplier}`;
          shieldEl.textContent = `Escudo ${shield}`;
          canvas.classList.remove("is-eating");
          void canvas.offsetWidth;
          canvas.classList.add("is-eating");
          food = nextFood();
          capture();
        } else snake.pop();
      }
      draw();
      if (!finishReady()) {
        refreshGuide();
        timer = window.setTimeout(tick, Math.max(48, free.interval * currentZoneMultiplier()));
      }
    };
    const keyHandler = (event) => {
      const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };
      if (map[event.key]) {
        event.preventDefault();
        setDirection(map[event.key]);
      }
    };
    $$("[data-dir]", wrap).forEach((button) => button.addEventListener("click", () => setDirection(button.dataset.dir)));
    window.addEventListener("keydown", keyHandler);
    scoreEl.textContent = String(score);
    comboEl.textContent = `Multiplicador ×${multiplier}`;
    shieldEl.textContent = `Escudo ${shield}`;
    draw();
    setPuzzleGuide({ refresh: refreshGuide });
    refreshGuide();
    elements.puzzleStatus.textContent = free.mode === "survival"
      ? `Sobreviva por ${free.survivalSeconds} segundos. Toda comida nasce em uma casa alcançável.`
      : `Colete ${target} pontos no mapa ${free.map}. Toda comida foi validada como alcançável.`;
    timer = window.setTimeout(tick, free.interval);
    snapshotTimer = window.setInterval(capture, 1600);
    puzzleCleanup = () => {
      running = false;
      clearTimeout(timer);
      clearInterval(snapshotTimer);
      pendingTimers.forEach(clearTimeout);
      window.removeEventListener("keydown", keyHandler);
    };
  }

  function initTetris(challenge) {
    const free = settingsFor(challenge) || {
      target: 120 + challenge.level * 20,
      interval: Math.max(260, 610 - challenge.level * 28),
      linesTarget: 2,
      objective: "score",
      hold: true,
      label: "Blocos clássicos",
      seed: `album:tetris:${challenge.id}:v2`
    };
    const cols = 10;
    const rows = 18;
    const cell = 22;
    const random = Core.seededRandom(free.seed || challenge.seed || `tetris:${challenge.id}`);
    const restored = restoredGameState("tetris");
    const pendingTimers = new Set();
    const SHAPES = [
      { key: "I", m: [[1, 1, 1, 1]], c: "#d3a13e" }, { key: "O", m: [[1, 1], [1, 1]], c: "#c4644e" },
      { key: "T", m: [[0, 1, 0], [1, 1, 1]], c: "#658075" }, { key: "J", m: [[1, 0, 0], [1, 1, 1]], c: "#7e8e62" },
      { key: "L", m: [[0, 0, 1], [1, 1, 1]], c: "#d88764" }, { key: "S", m: [[0, 1, 1], [1, 1, 0]], c: "#839f72" },
      { key: "Z", m: [[1, 1, 0], [0, 1, 1]], c: "#58777b" }
    ];
    const shapeByKey = Object.fromEntries(SHAPES.map((shape) => [shape.key, shape]));
    const cloneShape = (key) => {
      const shape = shapeByKey[key] || SHAPES[0];
      return { key: shape.key, m: shape.m.map((row) => [...row]), c: shape.c };
    };
    const wrap = document.createElement("div");
    wrap.className = "game-wrap";
    wrap.innerHTML = `<div class="game-hud">
      <span>Pontos: <b id="tetrisScore">0</b>/${free.target}</span>
      <span>Linhas: <b id="tetrisLines">0</b></span>
      <span>Nível: <b id="tetrisLevel">1</b></span>
      <span id="tetrisCombo">Combo: —</span>
    </div><div class="game-objective-bar"></div>
    <div class="tetris-layout">
      <aside class="tetris-side is-left"><div class="tetris-side-card"><small>Reserva</small><div class="tetris-mini" id="tetrisHold">—</div></div><button class="tetris-hold-button" data-action="hold" type="button">Guardar · C</button><span class="tetris-ghost-note">A sombra mostra onde a peça vai cair.</span></aside>
      <canvas class="game-canvas tetris-canvas" width="${cols * cell}" height="${rows * cell}" aria-label="Jogo de blocos com sombra, reserva e fila de três peças"></canvas>
      <aside class="tetris-side is-right"><div class="tetris-side-card"><small>Próxima</small><div class="tetris-mini" data-next="0">—</div></div><div class="tetris-side-card"><small>Depois</small><div class="tetris-mini" data-next="1">—</div></div><div class="tetris-side-card"><small>Terceira</small><div class="tetris-mini" data-next="2">—</div></div></aside>
    </div>
    <div class="game-controls tetris-controls"><button type="button" data-action="left" aria-label="Mover para esquerda">←</button><button type="button" data-action="rotate" aria-label="Girar">↻</button><button type="button" data-action="down" aria-label="Descida suave">↓</button><button type="button" data-action="right" aria-label="Mover para direita">→</button><button type="button" data-action="drop" aria-label="Queda rápida">⇣</button><button type="button" data-action="hold" aria-label="Guardar ou trocar peça">C</button></div>`;
    elements.puzzleStage.append(wrap);
    const canvas = $("canvas", wrap);
    const ctx = canvas.getContext("2d");
    const scoreEl = $("#tetrisScore", wrap);
    const linesEl = $("#tetrisLines", wrap);
    const levelEl = $("#tetrisLevel", wrap);
    const comboEl = $("#tetrisCombo", wrap);
    const holdEl = $("#tetrisHold", wrap);
    const objectiveBar = $(".game-objective-bar", wrap);
    const actionButtons = Object.fromEntries($$("[data-action]", wrap).map((button) => [button.dataset.action, button]));
    let board = restored && Array.isArray(restored.board) && restored.board.length === rows
      ? restored.board.map((row) => Array.isArray(row) && row.length === cols ? row.map((value) => typeof value === "string" ? value.slice(0, 20) : null) : Array(cols).fill(null))
      : Array.from({ length: rows }, () => Array(cols).fill(null));
    let queue = restored && Array.isArray(restored.queue) ? restored.queue.filter((key) => shapeByKey[key]).slice(0, 14) : [];
    let bagSerial = Math.max(0, Number(restored?.bagSerial || 0));
    let piece = restored?.piece && shapeByKey[restored.piece.key] ? {
      ...cloneShape(restored.piece.key),
      m: Array.isArray(restored.piece.m) ? restored.piece.m.map((row) => [...row]) : cloneShape(restored.piece.key).m,
      x: Number(restored.piece.x || 0),
      y: Number(restored.piece.y || -1)
    } : null;
    let holdKey = shapeByKey[restored?.holdKey] ? restored.holdKey : "";
    let canHold = restored ? restored.canHold !== false : true;
    let score = Math.max(0, Number(restored?.score || 0));
    let totalLines = Math.max(0, Number(restored?.totalLines || 0));
    let lineCombo = Math.max(0, Number(restored?.lineCombo || 0));
    let maxCombo = Math.max(lineCombo, Number(restored?.maxCombo || 0));
    let backToBack = Math.max(0, Number(restored?.backToBack || 0));
    let maxBackToBack = Math.max(backToBack, Number(restored?.maxBackToBack || 0));
    let piecesPlaced = Math.max(0, Number(restored?.piecesPlaced || 0));
    let level = Math.max(1, Number(restored?.level || 1));
    let timer = 0;
    let snapshotTimer = 0;
    let running = true;
    const rotate = (matrix) => matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
    const matrixKey = (matrix) => matrix.map((row) => row.join("")).join("/");
    const collides = (candidate, dx = 0, dy = 0, matrix = candidate.m) => matrix.some((row, y) => row.some((value, x) => value && (
      candidate.y + y + dy >= rows ||
      candidate.x + x + dx < 0 ||
      candidate.x + x + dx >= cols ||
      candidate.y + y + dy >= 0 && board[candidate.y + y + dy][candidate.x + x + dx]
    )));
    const refillQueue = () => {
      while (queue.length < 7) {
        queue.push(...Core.seededShuffle(SHAPES.map((shape) => shape.key), `${free.seed}:bag:${bagSerial}`));
        bagSerial += 1;
      }
    };
    const addGarbage = (count, initial = false) => {
      for (let index = 0; index < count; index += 1) {
        if (board[0].some(Boolean) && !initial) break;
        board.shift();
        const hole = Math.floor(random() * cols);
        board.push(Array.from({ length: cols }, (_, column) => column === hole ? null : "#6c6256"));
      }
    };
    if (!restored && free.garbageRows) addGarbage(Number(free.garbageRows), true);
    const updateSidePanels = () => {
      refillQueue();
      holdEl.textContent = holdKey || "—";
      $$("[data-next]", wrap).forEach((element, index) => { element.textContent = queue[index] || "—"; });
      $$('[data-action="hold"]', wrap).forEach((button) => { button.disabled = !free.hold || !canHold; });
    };
    const spawnKey = (key) => {
      const shape = cloneShape(key);
      piece = { ...shape, x: Math.floor((cols - shape.m[0].length) / 2), y: -1 };
      if (collides(piece)) {
        if (free.objective === "survive" || free.garbageRows) {
          running = false;
          elements.puzzleStatus.textContent = "O tabuleiro transbordou. A mesma sequência será reiniciada.";
          const retry = window.setTimeout(() => {
            pendingTimers.delete(retry);
            if (currentPuzzleChallenge === challenge && !elements.puzzleModal.hidden) initPuzzle(challenge);
          }, 900);
          pendingTimers.add(retry);
          return;
        }
        board = Array.from({ length: rows }, () => Array(cols).fill(null));
        score = Math.max(0, score - 80);
        canvas.classList.remove("is-danger");
        void canvas.offsetWidth;
        canvas.classList.add("is-danger");
      }
      updateSidePanels();
      refreshPuzzleGuide();
    };
    const spawn = () => {
      refillQueue();
      spawnKey(queue.shift());
    };
    const ghostY = () => {
      if (!piece) return -1;
      let y = piece.y;
      const candidate = { ...piece, y };
      while (!collides(candidate, 0, 1)) candidate.y += 1;
      return candidate.y;
    };
    const drawBlock = (x, y, color, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      canvasRoundedRect(ctx, x * cell + 1, y * cell + 1, cell - 2, cell - 2, 4);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.16)";
      ctx.fillRect(x * cell + 4, y * cell + 4, cell - 9, 3);
      ctx.restore();
    };
    const draw = () => {
      ctx.fillStyle = "#293328";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(255,255,255,.035)";
      for (let x = 0; x <= cols; x += 1) { ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, canvas.height); ctx.stroke(); }
      for (let y = 0; y <= rows; y += 1) { ctx.beginPath(); ctx.moveTo(0, y * cell); ctx.lineTo(canvas.width, y * cell); ctx.stroke(); }
      board.forEach((row, y) => row.forEach((color, x) => { if (color) drawBlock(x, y, color); }));
      if (piece) {
        const landingY = ghostY();
        piece.m.forEach((row, y) => row.forEach((value, x) => {
          if (value && landingY + y >= 0) drawBlock(piece.x + x, landingY + y, piece.c, .22);
        }));
        piece.m.forEach((row, y) => row.forEach((value, x) => {
          if (value && piece.y + y >= 0) drawBlock(piece.x + x, piece.y + y, piece.c);
        }));
      }
    };
    const clearLines = () => {
      let count = 0;
      for (let y = rows - 1; y >= 0; y -= 1) {
        if (board[y].every(Boolean)) {
          board.splice(y, 1);
          board.unshift(Array(cols).fill(null));
          count += 1;
          y += 1;
        }
      }
      return count;
    };
    const evaluatePlacement = (matrix, x, y) => {
      const simulated = board.map((row) => [...row]);
      matrix.forEach((row, dy) => row.forEach((value, dx) => {
        if (value && y + dy >= 0) simulated[y + dy][x + dx] = piece.c;
      }));
      let lines = 0;
      const heights = [];
      let holes = 0;
      simulated.forEach((row) => { if (row.every(Boolean)) lines += 1; });
      for (let column = 0; column < cols; column += 1) {
        let first = -1;
        for (let row = 0; row < rows; row += 1) if (simulated[row][column]) { first = row; break; }
        heights.push(first < 0 ? 0 : rows - first);
        if (first >= 0) for (let row = first + 1; row < rows; row += 1) if (!simulated[row][column]) holes += 1;
      }
      const bumpiness = heights.slice(1).reduce((sum, value, index) => sum + Math.abs(value - heights[index]), 0);
      return lines * 1300 - holes * 125 - heights.reduce((sum, value) => sum + value, 0) * 5 - bumpiness * 7;
    };
    const bestPlacement = () => {
      if (!piece || !running) return null;
      let matrix = piece.m;
      let best = null;
      const seen = new Set();
      for (let steps = 0; steps < 4; steps += 1) {
        const key = matrixKey(matrix);
        if (seen.has(key)) break;
        seen.add(key);
        for (let x = 0; x <= cols - matrix[0].length; x += 1) {
          const candidate = { ...piece, m: matrix, x, y: piece.y };
          if (collides(candidate, 0, 0, matrix)) continue;
          while (!collides(candidate, 0, 1, matrix)) candidate.y += 1;
          const value = evaluatePlacement(matrix, x, candidate.y);
          if (!best || value > best.value) best = { steps, x, value };
        }
        matrix = rotate(matrix);
      }
      return best;
    };
    const refreshGuide = () => {
      const targetPlacement = bestPlacement();
      if (!targetPlacement) return;
      let actionName = "drop";
      if (targetPlacement.steps > 0) {
        const next = rotate(piece.m);
        if (!collides(piece, 0, 0, next)) actionName = "rotate";
      } else if (piece.x > targetPlacement.x) actionName = "left";
      else if (piece.x < targetPlacement.x) actionName = "right";
      markPuzzleGuideTarget(actionButtons[actionName], actionName === "drop" ? "Use a queda rápida" : "Use o controle destacado");
    };
    const renderObjectives = () => {
      objectiveBar.replaceChildren();
      const chips = [
        { label: `${score}/${free.target} pontos`, done: score >= free.target },
        { label: `${totalLines}/${free.linesTarget} linhas`, done: totalLines >= free.linesTarget }
      ];
      if (free.objective === "combo" || free.objective === "mixed") chips.push({ label: `Combo ×${free.comboTarget}`, done: maxCombo >= free.comboTarget });
      if (free.objective === "backToBack" || free.backToBack) chips.push({ label: "Back-to-back", done: maxBackToBack >= 2 });
      if (free.objective === "survive" || free.objective === "mixed") chips.push({ label: `${piecesPlaced}/${free.survivalPieces} peças`, done: piecesPlaced >= free.survivalPieces });
      chips.forEach((chip) => {
        const item = document.createElement("span");
        item.classList.toggle("is-done", chip.done);
        item.textContent = chip.done ? `✓ ${chip.label}` : chip.label;
        objectiveBar.append(item);
      });
    };
    const objectiveReady = () => {
      if (free.objective === "lines") return totalLines >= free.linesTarget;
      if (free.objective === "combo") return score >= free.target && maxCombo >= free.comboTarget;
      if (free.objective === "backToBack") return score >= free.target && maxBackToBack >= 2;
      if (free.objective === "survive") return piecesPlaced >= free.survivalPieces;
      if (free.objective === "mixed") return score >= free.target && totalLines >= free.linesTarget && maxCombo >= free.comboTarget && piecesPlaced >= free.survivalPieces;
      return score >= free.target;
    };
    const phaseElapsed = () => freePlaySession ? freeElapsed() - freePlaySession.completedMs : dailyPlaySession ? dailyElapsed() : 0;
    const capture = () => updateActiveGameSnapshot({
      board: board.map((row) => [...row]),
      queue: [...queue],
      bagSerial,
      piece: piece ? { key: piece.key, m: piece.m.map((row) => [...row]), x: piece.x, y: piece.y } : null,
      holdKey,
      canHold,
      score,
      totalLines,
      lineCombo,
      maxCombo,
      backToBack,
      maxBackToBack,
      piecesPlaced,
      level
    }, phaseElapsed());
    const finish = () => {
      running = false;
      clearPuzzleGuideTarget();
      capture();
      draw();
      const timerId = window.setTimeout(() => {
        pendingTimers.delete(timerId);
        completePuzzle({
          score,
          maxCombo,
          backToBack: maxBackToBack,
          performanceBonus: totalLines * 55 + maxCombo * 80 + maxBackToBack * 120
        });
      }, 320);
      pendingTimers.add(timerId);
    };
    const lock = () => {
      piece.m.forEach((row, y) => row.forEach((value, x) => {
        if (value && piece.y + y >= 0) board[piece.y + y][piece.x + x] = piece.c;
      }));
      piecesPlaced += 1;
      const lines = clearLines();
      if (lines) {
        lineCombo += 1;
        maxCombo = Math.max(maxCombo, lineCombo);
        totalLines += lines;
        level = free.levelProgression ? 1 + Math.floor(totalLines / 5) : 1;
        const isTetris = lines === 4;
        if (isTetris) {
          backToBack += 1;
          maxBackToBack = Math.max(maxBackToBack, backToBack);
        } else backToBack = 0;
        const linePoints = [0, 100, 300, 500, 800][lines] * level;
        const b2bBonus = isTetris && backToBack >= 2 ? Math.round(linePoints * .5) : 0;
        const comboBonus = Math.max(0, lineCombo - 1) * 75 * level;
        score += linePoints + b2bBonus + comboBonus;
        comboEl.textContent = b2bBonus ? `BACK-TO-BACK ×${backToBack}!` : lineCombo >= 2 ? `Combo ×${lineCombo}!` : `${lines} ${lines === 1 ? "linha" : "linhas"}!`;
        comboEl.classList.toggle("is-hot", lineCombo >= 2 || b2bBonus);
        canvas.classList.remove("is-clearing");
        void canvas.offsetWidth;
        canvas.classList.add("is-clearing");
      } else {
        lineCombo = 0;
        comboEl.textContent = "Combo: —";
        comboEl.classList.remove("is-hot");
        score += 10 * level;
      }
      if (free.garbageRows && piecesPlaced % Math.max(5, 9 - free.garbageRows) === 0) addGarbage(1);
      scoreEl.textContent = String(score);
      linesEl.textContent = String(totalLines);
      levelEl.textContent = String(level);
      canHold = true;
      renderObjectives();
      capture();
      if (objectiveReady()) return finish();
      spawn();
    };
    const fall = (soft = false) => {
      if (!running || !piece) return;
      if (!collides(piece, 0, 1)) {
        piece.y += 1;
        if (soft) score += 1;
      } else lock();
      draw();
      refreshPuzzleGuide();
    };
    const hold = () => {
      if (!running || !free.hold || !canHold || !piece) return;
      const outgoing = piece.key;
      canHold = false;
      if (holdKey) {
        const incoming = holdKey;
        holdKey = outgoing;
        spawnKey(incoming);
      } else {
        holdKey = outgoing;
        spawn();
      }
      updateSidePanels();
      draw();
      capture();
    };
    const action = (name) => {
      if (!running || !piece) return;
      if (name === "left" && !collides(piece, -1, 0)) piece.x -= 1;
      if (name === "right" && !collides(piece, 1, 0)) piece.x += 1;
      if (name === "down") { fall(true); return; }
      if (name === "rotate") {
        const next = rotate(piece.m);
        if (!collides(piece, 0, 0, next)) piece.m = next;
        else if (!collides(piece, -1, 0, next)) { piece.x -= 1; piece.m = next; }
        else if (!collides(piece, 1, 0, next)) { piece.x += 1; piece.m = next; }
      }
      if (name === "drop") {
        let distance = 0;
        while (!collides(piece, 0, 1)) { piece.y += 1; distance += 1; }
        score += distance * 2;
        lock();
      }
      if (name === "hold") hold();
      scoreEl.textContent = String(score);
      draw();
      refreshPuzzleGuide();
    };
    const keyHandler = (event) => {
      const map = { ArrowLeft: "left", ArrowRight: "right", ArrowDown: "down", ArrowUp: "rotate", Space: "drop", " ": "drop", c: "hold", C: "hold" };
      if (map[event.key]) {
        event.preventDefault();
        action(map[event.key]);
      }
    };
    $$("[data-action]", wrap).forEach((button) => button.addEventListener("click", () => action(button.dataset.action)));
    window.addEventListener("keydown", keyHandler);
    if (!piece) spawn();
    else updateSidePanels();
    scoreEl.textContent = String(score);
    linesEl.textContent = String(totalLines);
    levelEl.textContent = String(level);
    renderObjectives();
    draw();
    setPuzzleGuide({ refresh: refreshGuide });
    refreshPuzzleGuide();
    const loop = () => {
      if (!running) return;
      if (!document.hidden) fall();
      const interval = Math.max(95, Number(free.interval || 520) * Math.pow(.88, level - 1));
      timer = window.setTimeout(loop, interval);
    };
    timer = window.setTimeout(loop, free.interval);
    snapshotTimer = window.setInterval(capture, 1800);
    elements.puzzleStatus.textContent = `${free.label || "Encaixe os blocos"}. A sombra, a reserva e as três próximas peças estão ativas.`;
    puzzleCleanup = () => {
      running = false;
      clearTimeout(timer);
      clearInterval(snapshotTimer);
      pendingTimers.forEach(clearTimeout);
      window.removeEventListener("keydown", keyHandler);
    };
  }

  function shouldUseLuxorCompatibilityMode() {
    const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches || false;
    const touchDevice = Number(navigator.maxTouchPoints || 0) > 0;
    const compactViewport = Math.min(window.innerWidth || 9999, window.screen?.width || 9999) <= 840;
    return coarsePointer || touchDevice || compactViewport;
  }

  function luxorScoreBreakdownHTML(result = {}) {
    const breakdown = result.breakdown || {};
    const rows = [
      ["Bolinhas", breakdown.marbleCount],
      ["Grupos longos", breakdown.groupSize],
      ["Reações em cadeia", breakdown.chainDepth],
      ["Combo máximo", breakdown.maximumCombo],
      ["Precisão", breakdown.accuracy],
      ["Distância do portal", breakdown.portalDistance],
      ["Tempo restante", breakdown.remainingTime],
      ["Objetivos", breakdown.objectives],
      ["Sem erros", breakdown.noMiss],
      ["Eficiência de poderes", breakdown.powerEfficiency],
      ["Ondas", breakdown.waveClear]
    ].filter(([, value]) => Number(value) > 0);
    if (!rows.length) return "";
    return `<div class="luxor-score-breakdown" aria-label="Detalhamento da pontuação">
      ${rows.map(([label, value]) => `<span>${label}<b>+${Math.round(Number(value)).toLocaleString("pt-BR")}</b></span>`).join("")}
      <span class="is-total">Precisão final<b>${clamp(Number(result.accuracy || 0), 0, 100).toLocaleString("pt-BR")}%</b></span>
    </div>`;
  }

  function initLuxor(challenge) {
    const phaseSettings = settingsFor(challenge);
    const campaignConfig = challenge.luxorConfig || null;
    const goals = luxorRequirements(challenge.level);
    const levelIndex = clamp(challenge.level - 1, 0, LUXOR_LEVELS.length - 1);
    const legacyConfig = LUXOR_LEVELS[levelIndex];
    const config = {
      waveSpeed: Number(campaignConfig?.speed || phaseSettings?.waveSpeed || legacyConfig.waveSpeed),
      speedLabel: campaignConfig ? `nível ${campaignConfig.level}` : phaseSettings ? `fase ${phaseSettings.phase}` : legacyConfig.speedLabel,
      palette: Number(campaignConfig?.palette || phaseSettings?.palette || legacyConfig.palette),
      missPenalty: Number(legacyConfig.missPenalty || .012)
    };
    const routeVariant = campaignConfig?.routeVariant || (phaseSettings?.phase >= 8 ? "tunnel" : phaseSettings?.phase >= 5 ? "mirrored" : "normal");
    const routeConfig = LUXOR_ROUTES[campaignConfig?.routeIndex ?? levelIndex % LUXOR_ROUTES.length];
    const displayStart = routeVariant === "reversed" ? routeConfig.end : routeVariant === "mirrored" ? [720 - routeConfig.start[0], routeConfig.start[1]] : routeConfig.start;
    const displayEnd = routeVariant === "reversed" ? routeConfig.start : routeVariant === "mirrored" ? [720 - routeConfig.end[0], routeConfig.end[1]] : routeConfig.end;
    const activeColors = LUXOR_COLORS.slice(0, config.palette);
    const activeKeys = activeColors.map((color) => color.key);
    goals.forEach((goal, index) => {
      if (!activeKeys.includes(goal.color)) goal.color = activeKeys[index % activeKeys.length];
    });
    const colorByKey = Object.fromEntries(LUXOR_COLORS.map((color) => [color.key, color]));
    const compatibilityMode = shouldUseLuxorCompatibilityMode();
    const difficultyRank = freeRank(challenge);
    const aimAssist = difficultyRank <= 2 || state.accessibilityAimAssist;
    const PROJECTILE_SPEED = compatibilityMode ? 590 : 660;
    const MAX_PROJECTILE_DISTANCE = 940;
    const CANNON_POINT = { x: 360, y: 396 };
    const CANNON_MIN_X = 54;
    const CANNON_MAX_X = 666;
    const CANNON_MOVE_SPEED = compatibilityMode ? 330 : 300;
    const MATCH_COLLAPSE_DELAY = 105;
    const CHAIN_REACTION_DELAY = 34;
    const REFLOW_DURATION = 155;
    const POP_VISUAL_DURATION = 210;
    const minimumWaveSize = 13 + challenge.level + Number(campaignConfig?.chapter || phaseSettings?.rank || 1);
    const totalWaves = clamp(Number(campaignConfig?.waves || phaseSettings?.waves || 1), 1, 3);
    const specialTypes = [...new Set(campaignConfig?.specials || phaseSettings?.specials || [])];
    const equippedPowers = [...(challenge.fixedLoadout || dailyPlaySession?.fixedLoadout || state.luxor.equippedPowers || [])].slice(0, 3);
    while (equippedPowers.length < 3) {
      const fallback = Core.POWER_DEFINITIONS[equippedPowers.length]?.key;
      if (fallback && !equippedPowers.includes(fallback)) equippedPowers.push(fallback);
      else break;
    }
    const powerByKey = Object.fromEntries(Core.POWER_DEFINITIONS.map((power) => [power.key, power]));
    const restored = restoredGameState("luxor");
    CANNON_POINT.x = clamp(Number(restored?.cannonX || 360), CANNON_MIN_X, CANNON_MAX_X);
    const luxorRandom = Core.seededRandom(`${campaignConfig?.seed || phaseSettings?.seed || challenge.seed || challenge.id}:runtime:${restored?.shotsFired || 0}`);
    const pendingTimers = new Set();
    const movementKeys = new Set();
    const reducedMotion = state.reducedMotion || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    let active = true;
    let resolving = false;
    let paused = false;
    let balls = restored && Array.isArray(restored.balls) ? restored.balls.map((ball) => String(ball.color || "azul")) : [];
    let ballMeta = restored && Array.isArray(restored.balls) ? restored.balls.map((ball) => ({
      type: String(ball.type || "normal"),
      hits: clamp(Number(ball.hits || 1), 0, 3),
      revealed: Boolean(ball.revealed),
      locked: Boolean(ball.locked)
    })) : [];
    let ballNodes = [];
    let headProgress = restored ? clamp(Number(restored.headProgress || .24), 0, 1) : 0.24;
    let spacing = 0.024;
    let collisionRadius = 28;
    let currentColor = restored?.currentColor && activeKeys.includes(restored.currentColor) ? restored.currentColor : goals[0].color;
    let nextColor = restored?.nextColor && activeKeys.includes(restored.nextColor) ? restored.nextColor : goals[Math.min(1, goals.length - 1)].color;
    let score = Math.max(0, Number(restored?.score || 0));
    let comboStreak = Math.max(0, Number(restored?.comboStreak || 0));
    let maxCombo = Math.max(comboStreak, Number(restored?.maxCombo || 0));
    let maxChain = Math.max(0, Number(restored?.maxChain || 0));
    let shotsFired = Math.max(0, Number(restored?.shotsFired || 0));
    let shotsHit = Math.max(0, Number(restored?.shotsHit || 0));
    let hitStreak = Math.max(0, Number(restored?.hitStreak || 0));
    let misses = Math.max(0, Number(restored?.misses || 0));
    let marblesCleared = Math.max(0, Number(restored?.marblesCleared || 0));
    let groupBonus = Math.max(0, Number(restored?.groupBonus || 0));
    let chainBonus = Math.max(0, Number(restored?.chainBonus || 0));
    let powerEarned = Math.max(0, Number(restored?.powerEarned || 0));
    let powersUsed = Math.max(0, Number(restored?.powersUsed || 0));
    let currentWave = clamp(Number(restored?.wave || 1), 1, totalWaves);
    let waveRemoved = Math.max(0, Number(restored?.waveRemoved || 0));
    let wavesCompleted = Math.max(0, currentWave - 1);
    let armoredDestroyed = Math.max(0, Number(restored?.armoredDestroyed || 0));
    let memoriesRescued = Math.max(0, Number(restored?.memoriesRescued || 0));
    let chainReactions = Math.max(0, Number(restored?.chainReactions || 0));
    let activeElapsedMs = Math.max(0, Number(restored?.activeElapsedMs || state.activeSession?.activeElapsedMs || 0));
    let powerCharge = clamp(Number(restored?.powerCharge || 0), 0, 100);
    let activePower = restored?.activePower && equippedPowers.includes(restored.activePower) ? String(restored.activePower) : "";
    let slowUntil = Math.max(0, Number(restored?.slowUntil || 0));
    let shieldUntil = Math.max(0, Number(restored?.shieldUntil || 0));
    let powerCooldowns = restored?.powerCooldowns && typeof restored.powerCooldowns === "object"
      ? Object.fromEntries(Object.entries(restored.powerCooldowns)
        .filter(([key]) => equippedPowers.includes(key))
        .map(([key, value]) => [key, Math.max(0, Number(value) || 0)]))
      : {};
    let tripleShot = Boolean(restored?.tripleShot && equippedPowers.includes("tripleMemoryShot"));
    let wildShot = Boolean(restored?.wildShot && equippedPowers.includes("wildMemory"));
    let waveChanging = false;
    let shot = null;
    let animationFrame = 0;
    let resizeFrame = 0;
    let lastTime = performance.now();
    let audioContext = null;
    let aimingPointerId = null;
    let mobileMoveDirection = 0;
    let lastAimPoint = { x: 360, y: 92 };
    let resolutionSerial = 0;
    let comboAnimation = null;
    let cannonAnimation = null;
    let resizeObserver = null;
    let snapshotTimer = 0;
    let lastHudSecond = -1;
    let boardMetrics = { left: 0, top: 0, width: 720, height: 400 };

    const objectives = campaignConfig?.objectives
      ? campaignConfig.objectives.map((objective) => ({ ...objective, progress: 0, done: false }))
      : phaseSettings
        ? [{
          type: phaseSettings.objectiveType || "clear",
          target: phaseSettings.objectiveType === "score" ? phaseSettings.scoreTarget :
            phaseSettings.objectiveType === "chains" ? phaseSettings.chainTarget :
              phaseSettings.objectiveType === "armored" ? phaseSettings.armoredTarget :
                phaseSettings.objectiveType === "rescue" ? phaseSettings.rescueTarget :
                  phaseSettings.objectiveType === "misses" ? phaseSettings.missLimit :
                    phaseSettings.objectiveType === "colors" ? 2 + phaseSettings.rank :
                      phaseSettings.objectiveType === "checkpoint" ? 42 :
                        phaseSettings.objectiveType === "time" ? Math.round(phaseSettings.timeLimitMs / 1000) :
                    phaseSettings.objectiveType === "waves" || phaseSettings.objectiveType === "guardian" ? totalWaves :
                      phaseSettings.clearTarget,
          label: objectiveFor(challenge).replace(/^Objetivo:\s*/i, "").replace(/\.$/, ""),
          progress: 0,
          done: false
        }]
        : goals.map((goal) => ({ type: "colorGroup", color: goal.color, target: goal.size, label: `1 grupo de ${goal.size} ${goal.color}`, progress: 0, done: false }));
    if (restored && Array.isArray(restored.objectives)) {
      restored.objectives.forEach((saved, index) => {
        if (!objectives[index]) return;
        objectives[index].progress = Math.max(0, Number(saved.progress || 0));
        objectives[index].done = Boolean(saved.done);
        objectives[index].used = Boolean(saved.used);
      });
    }
    if (objectives.some((objective) => objective.type === "rescue") && !specialTypes.includes("memory")) specialTypes.push("memory");
    if (objectives.some((objective) => objective.type === "armored") && !specialTypes.includes("armored")) specialTypes.push("armored");

    const buildWave = (waveNumber = currentWave) => {
      const result = [];
      const pushSeparated = (color, amount) => {
        if (result.length && result[result.length - 1] === color) {
          const separator = activeKeys.find((key) => key !== color && key !== result[result.length - 1]) || activeKeys[0];
          result.push(separator, separator);
        }
        for (let index = 0; index < amount; index += 1) result.push(color);
      };
      goals.forEach((goal, index) => {
        if (index > 0) {
          const previous = result[result.length - 1];
          const separator = activeKeys.find((key) => key !== goal.color && key !== previous) || activeKeys[(index + 1) % activeKeys.length];
          result.push(separator, separator);
        }
        pushSeparated(goal.color, Math.max(2, goal.size - 1));
      });
      const colorObjective = objectives.find((objective) => objective.type === "colors" && !objective.done && activeKeys.includes(objective.color));
      if (colorObjective) {
        const wavesRemaining = Math.max(1, totalWaves - waveNumber + 1);
        const groupsThisWave = Math.ceil(Math.max(0, colorObjective.target - Number(colorObjective.progress || 0)) / wavesRemaining);
        for (let groupIndex = 0; groupIndex < groupsThisWave; groupIndex += 1) pushSeparated(colorObjective.color, 2);
      }
      let cursor = 0;
      while (result.length < minimumWaveSize + 4) {
        let color = activeKeys[cursor % activeKeys.length];
        if (color === result[result.length - 1]) color = activeKeys[(cursor + 1) % activeKeys.length];
        result.push(color, color);
        cursor += 1;
      }
      return result;
    };
    const buildSpecialMeta = (colors, waveNumber) => {
      const meta = colors.map(() => ({ type: "normal", hits: 1, revealed: true, locked: false }));
      if (!specialTypes.length) return meta;
      const candidates = Core.seededShuffle(
        Array.from({ length: colors.length - 5 }, (_, index) => index + 3),
        `${campaignConfig?.seed || phaseSettings?.seed || challenge.seed}:wave:${waveNumber}:specials`
      );
      let candidateCursor = 0;
      const applyType = (type) => {
        const ballIndex = candidates[candidateCursor];
        candidateCursor += 1;
        if (ballIndex === undefined) return false;
        meta[ballIndex] = {
          type,
          hits: type === "armored" || type === "stone" ? 2 : 1,
          revealed: type !== "shadow",
          locked: type === "locked"
        };
        return true;
      };
      const wavesRemaining = Math.max(1, totalWaves - waveNumber + 1);
      const requiredTypes = [
        ["armored", () => armoredDestroyed],
        ["rescue", () => memoriesRescued]
      ];
      requiredTypes.forEach(([objectiveType, progressValue]) => {
        const objective = objectives.find((entry) => entry.type === objectiveType && !entry.done);
        if (!objective) return;
        const marbleType = objectiveType === "rescue" ? "memory" : "armored";
        const remaining = Math.max(0, objective.target - Number(progressValue() || 0));
        const thisWave = Math.ceil(remaining / wavesRemaining);
        for (let index = 0; index < thisWave && candidateCursor < candidates.length; index += 1) applyType(marbleType);
      });
      const desiredCount = Math.min(candidates.length, Math.max(1, specialTypes.length + waveNumber - 1));
      while (candidateCursor < desiredCount) {
        applyType(specialTypes[candidateCursor % specialTypes.length]);
      }
      return meta;
    };
    if (!balls.length) {
      balls = buildWave(currentWave);
      ballMeta = buildSpecialMeta(balls, currentWave);
    }
    ballMeta.forEach((meta, index) => {
      if (meta.type !== "prism") return;
      const copied = balls[index - 1] || balls[index + 1];
      if (copied && activeKeys.includes(copied)) balls[index] = copied;
    });

    const wrap = document.createElement("div");
    wrap.className = `luxor-wrap luxor-deluxe${compatibilityMode ? " is-mobile-compat" : ""}${aimAssist ? " has-aim-assist" : ""}`;
    wrap.dataset.compatibility = compatibilityMode ? "mobile" : "standard";
    wrap.dataset.routeVariant = routeVariant;
    if (state.cosmetics?.selectedPowerSkin) wrap.dataset.powerSkin = state.cosmetics.selectedPowerSkin;
    wrap.innerHTML = `
      <div class="luxor-score luxor-score-deluxe">
        <span>Percurso <b>${routeConfig.name}</b></span>
        <span>Onda <b id="luxorWave">${currentWave}/${totalWaves}</b></span>
        <span>Pontos <b id="luxorScore">0</b></span>
        <span id="luxorCombo">Sequência 0x</span>
        <button class="luxor-pause" type="button" aria-label="Pausar Luxor">Ⅱ</button>
      </div>
      <div class="luxor-goals" aria-label="Metas do desafio"></div>
      <div class="luxor-power-hud">
        <div class="luxor-power-meter" aria-label="Carga dos poderes"><span>Carga</span><div><i></i></div><b id="luxorPowerCharge">${Math.round(powerCharge)}%</b></div>
        <div class="luxor-power-actions" role="group" aria-label="Poderes equipados">${equippedPowers.map((key, index) => {
          const power = powerByKey[key];
          return `<button type="button" data-luxor-power="${key}" aria-label="${power.name}: ${power.short}. Atalho ${index + 1}" title="${power.name} · ${power.short}"><i aria-hidden="true">${["✹","⌛","↶","ϟ","✦","✿","◇","⋰"][Core.POWER_DEFINITIONS.findIndex((item) => item.key === key)]}</i><span>${power.name}</span><small>${index + 1}</small></button>`;
        }).join("")}</div>
      </div>
      <div class="luxor-distance">
        <span>Distância até o portal</span>
        <div><i></i></div>
        <b class="luxor-distance-value">100%</b>
      </div>
        <div class="luxor-board-shell">
        <div class="luxor-path" data-theme="${campaignConfig?.theme || routeConfig.theme}" role="button" tabindex="0" aria-label="${routeConfig.name}: ${compatibilityMode ? "toque, arraste e solte" : "pressione, mire e solte"} para disparar uma bolinha">
          <svg viewBox="0 0 720 400" preserveAspectRatio="none" aria-hidden="true">
            <g ${routeVariant === "mirrored" ? 'transform="translate(720 0) scale(-1 1)"' : ""}>
              <path class="luxor-route-shadow" d="${routeConfig.d}" />
              <path class="luxor-route" id="luxorRoute" d="${routeConfig.d}" />
              <path class="luxor-route-glow" d="${routeConfig.d}" />
            </g>
            ${routeVariant === "merge" ? `<path class="luxor-route-secondary" d="M 38 48 C 130 62 185 120 220 172" />` : ""}
            <circle class="luxor-start" cx="${displayStart[0]}" cy="${displayStart[1]}" r="17" />
            <circle class="luxor-end-pulse" cx="${displayEnd[0]}" cy="${displayEnd[1]}" r="27" />
            <circle class="luxor-end" cx="${displayEnd[0]}" cy="${displayEnd[1]}" r="20" />
          </svg>
          <div class="luxor-start-label" style="left:${(displayStart[0] / 720) * 100}%;top:${(displayStart[1] / 400) * 100}%">INÍCIO</div>
          <div class="luxor-end-label" style="left:${(displayEnd[0] / 720) * 100}%;top:${(displayEnd[1] / 400) * 100}%">PORTAL</div>
          <i class="luxor-aim-line" aria-hidden="true"></i>
          <i class="luxor-aim-marker" aria-hidden="true"></i>
          <div class="luxor-ball-layer"></div>
          <div class="luxor-effects-layer" aria-hidden="true"></div>
          <div class="luxor-combo-flash" aria-live="polite"></div>
          <div class="luxor-pause-panel" hidden><strong>Partida pausada</strong><span>Nenhum tempo ou corrente avança durante a pausa.</span><button type="button">Continuar</button></div>
          <div class="luxor-wave-transition" hidden aria-live="polite"></div>
        </div>
        <div class="luxor-launcher-controls" role="group" aria-label="Controles de movimento do lançador">
          <button class="luxor-move-button is-left" type="button" data-luxor-move="-1" aria-label="Mover lançador para a esquerda">←</button>
          <div class="luxor-cannon-dock" aria-hidden="true"><div class="luxor-cannon"><i class="luxor-loaded-marble"></i><span></span></div></div>
          <button class="luxor-move-button is-right" type="button" data-luxor-move="1" aria-label="Mover lançador para a direita">→</button>
        </div>
        <div class="luxor-control-deck">
          <div class="luxor-deck-ammo">
            <div class="luxor-ammo"><small>AGORA</small><i class="current-marble"></i></div>
            <div class="luxor-ammo next"><small>DEPOIS</small><i class="next-marble"></i></div>
          </div>
          <span class="luxor-control-copy">${compatibilityMode ? "Segure as setas para mover · toque, arraste e solte para atirar." : "A/D ou ←/→: mover · clique esquerdo: atirar · botão direito: trocar."}</span>
          <div class="luxor-deck-actions">
            <button class="luxor-swap" type="button" aria-label="Trocar a bolinha atual pela próxima">Trocar ↔</button>
          </div>
        </div>
      </div>`;
    elements.puzzleStage.append(wrap);
    elements.puzzleStage.scrollTop = 0;

    const path = $(".luxor-path", wrap);
    const route = $("#luxorRoute", wrap);
    const cannon = $(".luxor-cannon", wrap);
    const moveButtons = $$('[data-luxor-move]', wrap);
    const aimLine = $(".luxor-aim-line", wrap);
    const aimMarker = $(".luxor-aim-marker", wrap);
    const ballLayer = $(".luxor-ball-layer", wrap);
    const effectsLayer = $(".luxor-effects-layer", wrap);
    const currentEl = $(".current-marble", wrap);
    const nextEl = $(".next-marble", wrap);
    const loadedEl = $(".luxor-loaded-marble", wrap);
    const goalsEl = $(".luxor-goals", wrap);
    const distanceBar = $(".luxor-distance i", wrap);
    const distanceValue = $(".luxor-distance-value", wrap);
    const scoreEl = $("#luxorScore", wrap);
    const comboEl = $("#luxorCombo", wrap);
    const comboFlash = $(".luxor-combo-flash", wrap);
    const swapButton = $(".luxor-swap", wrap);
    const waveEl = $("#luxorWave", wrap);
    const powerChargeEl = $("#luxorPowerCharge", wrap);
    const powerChargeBar = $(".luxor-power-meter i", wrap);
    const powerButtons = $$("[data-luxor-power]", wrap);
    const pauseButton = $(".luxor-pause", wrap);
    const pausePanel = $(".luxor-pause-panel", wrap);
    const waveTransition = $(".luxor-wave-transition", wrap);
    const routeLength = route.getTotalLength();

    const later = (callback, delay) => {
      const timer = window.setTimeout(() => {
        pendingTimers.delete(timer);
        callback();
      }, delay);
      pendingTimers.add(timer);
      return timer;
    };
    const clearPendingTimers = () => {
      pendingTimers.forEach((timer) => clearTimeout(timer));
      pendingTimers.clear();
    };
    const captureSnapshot = () => {
      updateActiveGameSnapshot({
        balls: balls.map((color, index) => ({ color, ...(ballMeta[index] || { type: "normal", hits: 1, revealed: true, locked: false }) })),
        headProgress,
        wave: currentWave,
        waveRemoved,
        score,
        comboStreak,
        maxCombo,
        maxChain,
        shotsFired,
        shotsHit,
        hitStreak,
        misses,
        marblesCleared,
        groupBonus,
        chainBonus,
        powerEarned,
        powersUsed,
        armoredDestroyed,
        memoriesRescued,
        chainReactions,
        activeElapsedMs,
        powerCharge,
        slowUntil,
        shieldUntil,
        activePower,
        powerCooldowns: { ...powerCooldowns },
        tripleShot,
        wildShot,
        currentColor,
        nextColor,
        cannonX: CANNON_POINT.x,
        objectives: objectives.map(({ progress, done, used }) => ({ progress, done, used: Boolean(used) }))
      }, activeElapsedMs);
    };
    const updatePowerHud = () => {
      const rounded = Math.round(powerCharge);
      powerChargeEl.textContent = `${rounded}%`;
      powerChargeBar.style.width = `${rounded}%`;
      powerButtons.forEach((button) => {
        const key = button.dataset.luxorPower;
        const definition = powerByKey[key];
        const cooldown = Number(powerCooldowns[key] || 0);
        const cooling = activeElapsedMs < cooldown;
        const armed = Boolean(activePower || tripleShot || wildShot);
        button.disabled = !active || paused || resolving || armed || !definition || powerCharge < definition.cost || cooling;
        button.classList.toggle("is-ready", !button.disabled);
        button.classList.toggle("is-active", activePower === key || key === "tripleMemoryShot" && tripleShot || key === "wildMemory" && wildShot);
        const remaining = Math.max(0, cooldown - activeElapsedMs);
        const small = $("small", button);
        if (small) small.textContent = cooling ? `${Math.ceil(remaining / 1000)}s` : String(equippedPowers.indexOf(key) + 1);
      });
    };
    const objectiveProgressText = (objective) => {
      if (objective.type === "time") return `${Math.ceil(activeElapsedMs / 1000)}/${objective.target}s`;
      if (objective.type === "misses") return `${misses}/${objective.target} erros`;
      if (objective.type === "checkpoint") return `${Math.round((1 - headProgress) * 100)}% restante`;
      if (objective.type === "restrictedPower") return objective.done ? "respeitado" : "em andamento";
      return `${Math.min(objective.target, Math.round(objective.progress || 0))}/${objective.target}`;
    };
    const refreshObjectives = (final = false) => {
      objectives.forEach((objective) => {
        if (objective.type === "clear") objective.progress = marblesCleared;
        if (objective.type === "waves" || objective.type === "guardian") objective.progress = wavesCompleted;
        if (objective.type === "score") objective.progress = score;
        if (objective.type === "chains") objective.progress = chainReactions;
        if (objective.type === "rescue") objective.progress = memoriesRescued;
        if (objective.type === "armored") objective.progress = armoredDestroyed;
        if (objective.type === "misses") {
          objective.progress = misses;
          objective.done = final ? misses <= objective.target : misses <= objective.target;
          return;
        }
        if (objective.type === "time") {
          objective.progress = Math.ceil(activeElapsedMs / 1000);
          objective.done = final && objective.progress <= objective.target;
          return;
        }
        if (objective.type === "checkpoint") {
          objective.progress = Math.round((1 - headProgress) * 100);
          objective.done = final && objective.progress >= Number(objective.target || 42);
          return;
        }
        if (objective.type === "restrictedPower") {
          objective.done = final && !objective.used;
          return;
        }
        if (objective.type !== "colorGroup") objective.done = Number(objective.progress || 0) >= Number(objective.target || 1);
      });
      goalsEl.replaceChildren();
      objectives.forEach((objective) => {
        const chip = document.createElement("span");
        chip.className = `luxor-goal${objective.done ? " is-done" : ""}`;
        const color = objective.color ? colorByKey[objective.color] : null;
        if (color) chip.style.setProperty("--goal-color", color.hex);
        const marker = document.createElement("i");
        chip.append(marker, document.createTextNode(`${objective.done ? "✓ " : ""}${objective.label} · ${objectiveProgressText(objective)}`));
        goalsEl.append(chip);
      });
      updatePowerHud();
    };
    const allObjectivesSatisfied = (final = false) => {
      refreshObjectives(final);
      return objectives.every((objective) => objective.done);
    };
    const setPaused = (force, automatic = false) => {
      if (!active) return;
      paused = typeof force === "boolean" ? force : !paused;
      pausePanel.hidden = !paused;
      pauseButton.textContent = paused ? "▶" : "Ⅱ";
      pauseButton.setAttribute("aria-label", paused ? "Continuar Luxor" : "Pausar Luxor");
      path.classList.toggle("is-paused", paused);
      if (paused) {
        aimingPointerId = null;
        hideAimVisual?.();
        captureSnapshot();
        elements.puzzleStatus.textContent = automatic ? "Luxor pausado porque a aba ficou oculta." : "Partida pausada.";
      } else {
        lastTime = performance.now();
        elements.puzzleStatus.textContent = "Partida retomada. A corrente continua do mesmo ponto.";
      }
      updatePowerHud();
    };
    const refreshBoardMetrics = () => {
      const bounds = path.getBoundingClientRect();
      boardMetrics = {
        left: bounds.left,
        top: bounds.top,
        width: Math.max(1, bounds.width || path.clientWidth || 720),
        height: Math.max(1, bounds.height || path.clientHeight || 400)
      };
      const marblePixels = clamp(boardMetrics.width * (boardMetrics.width > 760 ? 0.036 : 0.058), 21, 38);
      const marbleRouteUnits = (marblePixels / boardMetrics.width) * 720;
      spacing = clamp((marbleRouteUnits + 3.5) / routeLength, 0.0155, 0.052);
      collisionRadius = clamp(marbleRouteUnits * 0.78 + (compatibilityMode ? 15 : 9), compatibilityMode ? 33 : 27, compatibilityMode ? 56 : 49);
    };
    const setMarbleColor = (element, colorKey) => {
      const color = colorByKey[colorKey];
      if (!element || !color) return;
      element.dataset.color = colorKey;
      element.style.setProperty("--marble-color", color.hex);
      element.setAttribute("title", color.name);
      element.setAttribute("aria-label", color.name);
    };
    const setMarbleMeta = (element, meta = {}) => {
      const types = ["armored", "stone", "prism", "frozen", "memory", "shadow", "locked", "power"];
      types.forEach((type) => element.classList.toggle(`is-${type}`, meta.type === type));
      element.classList.toggle("is-damaged", Number(meta.hits || 1) === 1 && ["armored", "stone"].includes(meta.type));
      element.classList.toggle("is-revealed", meta.revealed !== false);
      element.dataset.special = meta.type || "normal";
      const labels = {
        armored: "blindada, requer dois impactos", stone: "pedra, não combina normalmente", prism: "prisma, copia uma cor próxima",
        frozen: "congelada, bloqueia o colapso", memory: "memória, precisa ser resgatada", shadow: "sombra, cor escondida",
        locked: "trancada, abre após reação em cadeia", power: "poder, concede carga"
      };
      if (labels[meta.type]) element.setAttribute("title", labels[meta.type]);
    };
    const createMarbleNode = (colorKey, entering = false, meta = {}) => {
      const marble = document.createElement("i");
      marble.className = `marble${entering && !reducedMotion ? " is-entering" : ""}`;
      marble.setAttribute("aria-hidden", "true");
      setMarbleColor(marble, colorKey);
      setMarbleMeta(marble, meta);
      if (entering && !reducedMotion) later(() => marble.classList.remove("is-entering"), 190);
      return marble;
    };
    const playTone = (kind, multiplier = 1) => {
      if (!state.volume || !active && kind !== "win" && kind !== "miss") return;
      const AudioEngine = window.AudioContext || window.webkitAudioContext;
      if (!AudioEngine) return;
      try {
        if (!audioContext || audioContext.state === "closed") audioContext = new AudioEngine();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const now = audioContext.currentTime;
        const base = kind === "shoot" ? 250 : kind === "miss" ? 130 : kind === "win" ? 620 : 360 + Math.min(multiplier, 7) * 55;
        oscillator.type = kind === "miss" ? "sawtooth" : kind === "shoot" ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(base, now);
        if (kind === "pop" || kind === "win") oscillator.frequency.exponentialRampToValueAtTime(base * 1.45, now + 0.1);
        const peak = (state.volume / 100) * (kind === "shoot" ? 0.025 : 0.045);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "win" ? 0.29 : 0.16));
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + (kind === "win" ? 0.31 : 0.18));
      } catch { /* efeitos sonoros são opcionais */ }
    };
    const renderGoals = () => refreshObjectives(false);
    const largestRunFor = (colorKey) => {
      let best = 0;
      let run = 0;
      balls.forEach((color) => {
        run = color === colorKey ? run + 1 : 0;
        best = Math.max(best, run);
      });
      return best;
    };
    const chooseUsefulColor = () => {
      const pending = goals.filter((goal) => !goal.done && activeKeys.includes(goal.color));
      objectives
        .filter((objective) => objective.type === "colors" && !objective.done && activeKeys.includes(objective.color))
        .forEach((objective) => pending.push({ color: objective.color, size: 3, done: false }));
      if (pending.length && luxorRandom() < 0.78) {
        const ranked = [...pending].sort((a, b) => {
          const needA = Math.max(0, a.size - largestRunFor(a.color));
          const needB = Math.max(0, b.size - largestRunFor(b.color));
          return needA - needB;
        });
        return ranked[Math.floor(luxorRandom() * Math.min(2, ranked.length))].color;
      }
      return activeKeys[Math.floor(luxorRandom() * activeKeys.length)];
    };
    const updateAmmo = () => {
      setMarbleColor(currentEl, currentColor);
      setMarbleColor(nextEl, nextColor);
      setMarbleColor(loadedEl, currentColor);
      [currentEl, loadedEl].forEach((element) => element.classList.toggle("is-wild", wildShot));
      swapButton.disabled = Boolean(shot) || resolving || !active || paused;
    };
    const updateHud = () => {
      scoreEl.textContent = score.toLocaleString("pt-BR");
      comboEl.textContent = comboStreak >= 4 ? `COMBO ${comboStreak}x` : `Sequência ${comboStreak}x`;
      comboEl.classList.toggle("is-combo", comboStreak >= 4);
      waveEl.textContent = `${currentWave}/${totalWaves}`;
      refreshObjectives(false);
    };
    const pointAtProgress = (progress) => {
      const safeProgress = clamp(progress, 0, 1);
      const variantProgress = routeVariant === "alternate" ? .09 + safeProgress * .83 : safeProgress;
      const geometryProgress = routeVariant === "reversed" ? 1 - variantProgress : variantProgress;
      const point = route.getPointAtLength(geometryProgress * routeLength);
      if (routeVariant === "mirrored") return { x: 720 - point.x, y: point.y };
      return point;
    };
    const pointForIndex = (index) => {
      if (index < 0 || index >= balls.length) return null;
      const progress = headProgress - index * spacing;
      if (progress < 0 || progress > 1) return null;
      return pointAtProgress(progress);
    };
    const pointFromPointer = (event) => {
      if (!boardMetrics.width || !boardMetrics.height) refreshBoardMetrics();
      return {
        x: clamp(((event.clientX - boardMetrics.left) / boardMetrics.width) * 720, 0, 720),
        y: clamp(((event.clientY - boardMetrics.top) / boardMetrics.height) * 400, 0, 400)
      };
    };
    const updateAimVisual = (point, visible = true) => {
      lastAimPoint = point;
      const dx = point.x - CANNON_POINT.x;
      const dy = point.y - CANNON_POINT.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      cannon.style.setProperty("--aim-angle", `${angle + 90}deg`);
      aimLine.style.left = `${(CANNON_POINT.x / 720) * 100}%`;
      aimLine.style.top = `${(CANNON_POINT.y / 400) * 100}%`;
      aimLine.style.width = `${(distance / 720) * 100}%`;
      aimLine.style.transform = `rotate(${angle}deg)`;
      aimMarker.style.left = `${(point.x / 720) * 100}%`;
      aimMarker.style.top = `${(point.y / 400) * 100}%`;
      path.classList.toggle("is-aiming", visible);
    };
    const syncCannonPosition = () => {
      cannon.style.left = `${(CANNON_POINT.x / 720) * 100}%`;
      updateAimVisual(lastAimPoint, path.classList.contains("is-aiming"));
    };
    const moveCannon = (direction, deltaSeconds = 1 / 60) => {
      if (!active || paused || resolving || waveChanging || !direction) return;
      const nextX = clamp(CANNON_POINT.x + direction * CANNON_MOVE_SPEED * deltaSeconds, CANNON_MIN_X, CANNON_MAX_X);
      if (Math.abs(nextX - CANNON_POINT.x) < 0.01) return;
      CANNON_POINT.x = nextX;
      syncCannonPosition();
    };
    const hideAimVisual = () => path.classList.remove("is-aiming");
    const updateDistance = () => {
      const remaining = clamp(1 - headProgress, 0, 1);
      distanceBar.style.width = `${remaining * 100}%`;
      distanceValue.textContent = `${Math.round(remaining * 100)}%`;
      path.classList.toggle("is-danger", remaining < 0.24);
    };
    const moveBalls = () => {
      ballNodes.forEach((node, index) => {
        const point = pointForIndex(index);
        if (!point) {
          node.hidden = true;
          return;
        }
        node.hidden = false;
        node.style.left = `${(point.x / 720) * 100}%`;
        node.style.top = `${(point.y / 400) * 100}%`;
        node.style.zIndex = String(160 - index);
        const progress = headProgress - index * spacing;
        const hiddenSection = ["tunnel", "hidden"].includes(routeVariant) && progress > .43 && progress < .57;
        node.classList.toggle("is-in-tunnel", hiddenSection);
        if (ballMeta[index]?.type === "shadow" && !ballMeta[index].revealed && progress > .58) {
          ballMeta[index].revealed = true;
          setMarbleMeta(node, ballMeta[index]);
        }
      });
      updateDistance();
    };
    const renderBalls = (enteringFrom = ballNodes.length) => {
      while (ballNodes.length > balls.length) ballNodes.pop()?.remove();
      while (ballNodes.length < balls.length) {
        const index = ballNodes.length;
        const marble = createMarbleNode(balls[index], index >= enteringFrom, ballMeta[index]);
        ballNodes.push(marble);
        ballLayer.append(marble);
      }
      ballNodes.forEach((node, index) => {
        if (node.dataset.color !== balls[index]) setMarbleColor(node, balls[index]);
        setMarbleMeta(node, ballMeta[index]);
      });
      moveBalls();
    };
    const captureBallPoints = () => {
      const points = new Map();
      ballNodes.forEach((node, index) => {
        const point = pointForIndex(index);
        if (point) points.set(node, point);
      });
      return points;
    };
    const animateReflow = (beforePoints, duration = REFLOW_DURATION) => {
      if (reducedMotion || !active) return;
      const scaleX = boardMetrics.width / 720;
      const scaleY = boardMetrics.height / 400;
      ballNodes.forEach((node, index) => {
        const from = beforePoints.get(node);
        const to = pointForIndex(index);
        if (!from || !to || node.hidden || typeof node.animate !== "function") return;
        const dx = (from.x - to.x) * scaleX;
        const dy = (from.y - to.y) * scaleY;
        if (Math.hypot(dx, dy) < 1.2) return;
        node._luxorReflow?.cancel?.();
        node._luxorReflow = node.animate([
          { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px)` },
          { transform: "translate(-50%, -50%) translate(0, 0)" }
        ], { duration, easing: "cubic-bezier(.22,.78,.28,1)", fill: "none" });
      });
    };
    const groupAt = (index) => {
      if (index < 0 || index >= balls.length) return null;
      const meta = ballMeta[index] || {};
      const blocksMatch = (item = {}) => item.type === "stone" || item.type === "frozen" || item.locked;
      if (blocksMatch(meta)) return { color: balls[index], start: index, end: index, size: 1 };
      const color = balls[index];
      let start = index;
      let end = index;
      while (start > 0 && balls[start - 1] === color && !blocksMatch(ballMeta[start - 1])) start -= 1;
      while (end < balls.length - 1 && balls[end + 1] === color && !blocksMatch(ballMeta[end + 1])) end += 1;
      return { color, start, end, size: end - start + 1 };
    };
    const createImpactFlash = (point, colorKey) => {
      const flash = document.createElement("i");
      flash.className = "luxor-impact-flash";
      flash.style.left = `${(point.x / 720) * 100}%`;
      flash.style.top = `${(point.y / 400) * 100}%`;
      flash.style.setProperty("--burst-color", colorByKey[colorKey].hex);
      effectsLayer.append(flash);
      later(() => flash.remove(), 240);
    };
    const createBurst = (point, colorKey) => {
      if (!active) return;
      const burst = document.createElement("span");
      burst.className = "luxor-burst";
      burst.style.left = `${(point.x / 720) * 100}%`;
      burst.style.top = `${(point.y / 400) * 100}%`;
      burst.style.setProperty("--burst-color", colorByKey[colorKey].hex);
      const particleCount = compatibilityMode ? 4 : 6;
      burst.innerHTML = `<i class="luxor-burst-ring"></i>${Array.from({ length: particleCount }, (_, index) => {
        const angle = (Math.PI * 2 * index) / particleCount;
        const distance = 21 + (index % 3) * 7;
        return `<i class="luxor-particle" style="--tx:${Math.cos(angle) * distance}px;--ty:${Math.sin(angle) * distance}px;--delay:${index * 10}ms"></i>`;
      }).join("")}`;
      effectsLayer.append(burst);
      later(() => burst.remove(), 620);
    };
    const showCallout = (text, point, emphasis = false) => {
      if (!text) return;
      const callout = document.createElement("strong");
      callout.className = `luxor-pop-label${emphasis ? " is-combo" : ""}`;
      callout.textContent = text;
      callout.style.left = `${(point.x / 720) * 100}%`;
      callout.style.top = `${(point.y / 400) * 100}%`;
      effectsLayer.append(callout);
      later(() => callout.remove(), reducedMotion ? 40 : 760);
      comboAnimation?.cancel?.();
      comboFlash.textContent = text;
      comboFlash.classList.toggle("is-super", emphasis);
      if (typeof comboFlash.animate === "function") {
        comboAnimation = comboFlash.animate([
          { transform: "translate(-50%, -50%) scale(.48) rotate(-5deg)", opacity: 0 },
          { transform: "translate(-50%, -50%) scale(1.1) rotate(1deg)", opacity: 1, offset: .25 },
          { transform: "translate(-50%, -55%) scale(1)", opacity: 1, offset: .7 },
          { transform: "translate(-50%, -70%) scale(.94)", opacity: 0 }
        ], { duration: reducedMotion ? 1 : 690, easing: "cubic-bezier(.15,.9,.25,1)" });
        comboAnimation.onfinish = () => { comboFlash.textContent = ""; comboFlash.classList.remove("is-super"); };
      }
    };
    const markGoal = (group) => {
      const matches = goals
        .filter((goal) => !goal.done && goal.color === group.color && group.size >= goal.size)
        .sort((a, b) => b.size - a.size);
      const completedGoal = matches[0] || null;
      if (completedGoal) completedGoal.done = true;
      const objective = objectives.find((item) => item.type === "colorGroup" && item.color === group.color && !item.done);
      if (objective) {
        objective.progress = Math.max(objective.progress, group.size);
        objective.done = group.size >= objective.target;
      }
      objectives.filter((item) => item.type === "colors" && (!item.color || item.color === group.color)).forEach((item) => {
        item.progress += 1;
        item.done = item.progress >= item.target;
      });
      return completedGoal;
    };
    const appendUsefulWave = () => {
      if (balls.length >= minimumWaveSize) return;
      const previousLength = balls.length;
      const pending = goals.filter((goal) => !goal.done);
      const colorObjective = objectives.find((objective) => objective.type === "colors" && !objective.done && activeKeys.includes(objective.color));
      const goal = pending[0] || (colorObjective ? { color: colorObjective.color, size: 3, done: false } : null);
      let color = goal ? goal.color : activeKeys[Math.floor(luxorRandom() * activeKeys.length)];
      if (balls[balls.length - 1] === color) {
        const separator = activeKeys.find((key) => key !== color) || activeKeys[0];
        balls.push(separator, separator);
        ballMeta.push({ type: "normal", hits: 1, revealed: true, locked: false }, { type: "normal", hits: 1, revealed: true, locked: false });
      }
      const amount = goal ? Math.max(2, goal.size - 1) : 2;
      for (let index = 0; index < amount; index += 1) {
        balls.push(color);
        ballMeta.push({ type: "normal", hits: 1, revealed: true, locked: false });
      }
      while (balls.length < minimumWaveSize + 3) {
        color = activeKeys[Math.floor(luxorRandom() * activeKeys.length)];
        if (color === balls[balls.length - 1]) color = activeKeys[(activeKeys.indexOf(color) + 1) % activeKeys.length];
        balls.push(color, color);
        ballMeta.push({ type: "normal", hits: 1, revealed: true, locked: false }, { type: "normal", hits: 1, revealed: true, locked: false });
      }
      renderBalls(previousLength);
    };
    const stopCurrentShot = () => {
      shot?.element?.remove();
      shot?.extraElements?.forEach((element) => element.remove());
      shot = null;
      path.classList.remove("is-shooting");
    };
    const awardPowerCharge = (amount, reason = "") => {
      const gained = Math.max(0, Number(amount || 0));
      if (!gained) return;
      powerCharge = clamp(powerCharge + gained, 0, 100);
      powerEarned += gained;
      if (reason && powerCharge >= 100) elements.puzzleStatus.textContent = `${reason} A carga de poder está completa.`;
      updatePowerHud();
    };
    const registerSpecialRemoval = (meta = {}) => {
      if (meta.type === "memory") memoriesRescued += 1;
      if (meta.type === "armored") armoredDestroyed += 1;
      if (meta.type === "power") awardPowerCharge(26, "Uma bolinha de poder foi aberta.");
    };
    const removeBallIndices = (indices, options = {}) => {
      const uniqueIndices = [...new Set(indices)]
        .filter((index) => index >= 0 && index < balls.length)
        .sort((a, b) => b - a);
      if (!uniqueIndices.length) return 0;
      const beforePoints = captureBallPoints();
      let removed = 0;
      uniqueIndices.forEach((index) => {
        const meta = ballMeta[index] || { type: "normal", hits: 1 };
        if (meta.type === "stone" && !options.forceStone) {
          meta.hits = Math.max(1, Number(meta.hits || 2) - 1);
          setMarbleMeta(ballNodes[index], meta);
          return;
        }
        if (meta.type === "armored" && Number(meta.hits || 2) > 1 && !options.piercing) {
          meta.hits -= 1;
          setMarbleMeta(ballNodes[index], meta);
          return;
        }
        if (meta.type === "frozen" && !options.piercing) {
          meta.type = "normal";
          meta.hits = 1;
          setMarbleMeta(ballNodes[index], meta);
          return;
        }
        registerSpecialRemoval(meta);
        const point = pointForIndex(index);
        if (point) createBurst(point, balls[index]);
        const [node] = ballNodes.splice(index, 1);
        node?.remove();
        balls.splice(index, 1);
        ballMeta.splice(index, 1);
        removed += 1;
      });
      if (removed) {
        marblesCleared += removed;
        waveRemoved += removed;
        headProgress = Math.max(.08, headProgress - Math.min(.09, spacing * removed * .68));
        moveBalls();
        animateReflow(beforePoints, 175);
      }
      return removed;
    };
    const unlockAfterReaction = () => {
      let unlocked = 0;
      ballMeta.forEach((meta, index) => {
        if (!meta.locked) return;
        meta.locked = false;
        meta.type = "normal";
        setMarbleMeta(ballNodes[index], meta);
        unlocked += 1;
      });
      if (unlocked) showCallout(`${unlocked} MEMÓRIA${unlocked > 1 ? "S" : ""} ABERTA${unlocked > 1 ? "S" : ""}`, { x: 360, y: 165 }, true);
    };
    const waveClearTarget = () => Math.max(10, Math.round((minimumWaveSize + 4) * .72));
    const advanceOrFinishWave = () => {
      if (!active || waveChanging || waveRemoved < waveClearTarget()) return false;
      wavesCompleted = Math.max(wavesCompleted, currentWave);
      if (currentWave >= totalWaves) {
        resolving = false;
        finishWin();
        return true;
      }
      waveChanging = true;
      resolving = true;
      stopCurrentShot();
      hideAimVisual();
      waveTransition.hidden = false;
      waveTransition.innerHTML = `<strong>Onda ${currentWave} concluída</strong><span>A próxima corrente preserva sua pontuação e carga.</span>`;
      path.classList.add("is-wave-changing");
      playTone("win", currentWave);
      captureSnapshot();
      later(() => {
        if (!active) return;
        ballNodes.forEach((node) => {
          node._luxorReflow?.cancel?.();
          node.remove();
        });
        ballNodes = [];
        currentWave += 1;
        waveRemoved = 0;
        balls = buildWave(currentWave);
        ballMeta = buildSpecialMeta(balls, currentWave);
        ballMeta.forEach((meta, index) => {
          if (meta.type === "prism") balls[index] = balls[index - 1] || balls[index + 1] || balls[index];
        });
        headProgress = clamp(.18 + challenge.level * .003, .18, .29);
        currentColor = chooseUsefulColor();
        nextColor = chooseUsefulColor();
        renderBalls(0);
        renderGoals();
        updateHud();
        updateAmmo();
        waveTransition.innerHTML = `<strong>Onda ${currentWave} de ${totalWaves}</strong><span>Prepare a próxima lembrança…</span>`;
        later(() => {
          if (!active) return;
          waveChanging = false;
          resolving = false;
          path.classList.remove("is-wave-changing");
          waveTransition.hidden = true;
          lastTime = performance.now();
          captureSnapshot();
          elements.puzzleStatus.textContent = `Onda ${currentWave}/${totalWaves}: pontuação e carga preservadas.`;
        }, reducedMotion ? 120 : 620);
      }, reducedMotion ? 80 : 520);
      return true;
    };
    const buildScoreResult = () => {
      const accuracy = shotsFired ? shotsHit / shotsFired * 100 : 100;
      const remainingDistance = Math.round(clamp(1 - headProgress, 0, 1) * 100);
      const timeLimit = objectives.find((objective) => objective.type === "time")?.target;
      const timeBonus = timeLimit ? Math.max(0, Math.round((timeLimit * 1000 - activeElapsedMs) / 100)) : Math.max(0, 1200 - Math.round(activeElapsedMs / 100));
      const breakdown = {
        marbleCount: marblesCleared * 70,
        groupSize: groupBonus,
        chainDepth: chainBonus,
        maximumCombo: maxCombo * 90,
        accuracy: Math.round(accuracy * 12),
        portalDistance: remainingDistance * 10,
        remainingTime: timeBonus,
        objectives: objectives.filter((objective) => objective.done).length * 650,
        noMiss: misses === 0 ? 900 : 0,
        powerEfficiency: powersUsed ? Math.max(0, Math.round(powerEarned / powersUsed * 12)) : Math.round(powerEarned * 4),
        waveClear: wavesCompleted * 800
      };
      const bonusTotal = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
      return {
        score: Math.round(score + bonusTotal),
        rawScore: Math.round(score),
        breakdown,
        maxCombo,
        maxChain,
        accuracy: Math.round(accuracy * 10) / 10,
        misses,
        shotsFired,
        shotsHit,
        marblesCleared,
        powersUsed,
        activeElapsedMs,
        performanceBonus: Math.round(bonusTotal * .18)
      };
    };
    const finishWin = () => {
      if (!active) return;
      wavesCompleted = Math.max(wavesCompleted, currentWave);
      if (!allObjectivesSatisfied(true)) {
        resolving = false;
        appendUsefulWave();
        elements.puzzleStatus.textContent = "A onda foi limpa, mas ainda falta cumprir uma meta. A corrente trouxe novas bolinhas.";
        return;
      }
      active = false;
      resolutionSerial += 1;
      resolving = false;
      aimingPointerId = null;
      stopCurrentShot();
      hideAimVisual();
      cancelAnimationFrame(animationFrame);
      clearPendingTimers();
      effectsLayer.replaceChildren();
      comboAnimation?.cancel?.();
      path.classList.add("is-won");
      showCallout(comboStreak >= 4 ? `COMBO FINAL ${comboStreak}x!` : "METAS CUMPRIDAS!", { x: 360, y: 190 }, true);
      playTone("win", comboStreak);
      const result = buildScoreResult();
      captureSnapshot();
      elements.puzzleStatus.textContent = `Luxor vencido com ${result.score.toLocaleString("pt-BR")} pontos!`;
      const panel = document.createElement("div");
      panel.className = "luxor-result-panel";
      panel.innerHTML = `<span class="eyebrow">Percurso concluído</span><strong>${result.score.toLocaleString("pt-BR")} pontos</strong>${luxorScoreBreakdownHTML(result)}<button class="primary-button" type="button">Registrar vitória</button>`;
      $("button", panel).addEventListener("click", () => completePuzzle(result));
      path.append(panel);
    };
    const lose = (reason = "") => {
      if (!active) return;
      active = false;
      resolutionSerial += 1;
      resolving = false;
      aimingPointerId = null;
      stopCurrentShot();
      hideAimVisual();
      cancelAnimationFrame(animationFrame);
      clearPendingTimers();
      effectsLayer.replaceChildren();
      comboAnimation?.cancel?.();
      comboFlash.textContent = "";
      path.classList.add("is-lost");
      const panel = document.createElement("div");
      panel.className = "luxor-loss";
      panel.innerHTML = `<strong>${reason ? "Objetivo interrompido" : "O portal foi alcançado!"}</strong><span>${escapeHTML(reason || `A corrente venceu esta rodada com ${score.toLocaleString("pt-BR")} pontos.`)}</span><button class="restart-inline" type="button">Tentar novamente</button>`;
      $("button", panel).addEventListener("click", () => initPuzzle(challenge));
      path.append(panel);
      playTone("miss");
      captureSnapshot();
      elements.puzzleStatus.textContent = reason || "Fim do percurso. Tente novamente e use as reações em cadeia para ganhar tempo.";
    };
    const explodeGroup = (group, chainDepth = 1, serial = resolutionSerial) => {
      if (!active || serial !== resolutionSerial || !group || group.size < 3) {
        resolving = false;
        updateAmmo();
        return;
      }
      const liveGroup = groupAt(clamp(group.start, 0, Math.max(0, balls.length - 1)));
      if (!liveGroup || liveGroup.color !== group.color || liveGroup.size < 3) {
        resolving = false;
        updateAmmo();
        return;
      }
      group = liveGroup;
      resolving = true;
      const points = [];
      for (let index = group.start; index <= group.end; index += 1) {
        const point = pointForIndex(index);
        if (point) points.push(point);
        ballNodes[index]?.classList.add("is-popping");
      }
      const center = points[Math.floor(points.length / 2)] || { x: 360, y: 200 };
      const burstPoints = points.length <= 6 ? points : points.filter((_, index) => index % Math.ceil(points.length / 6) === 0).slice(0, 6);
      burstPoints.forEach((point, index) => later(() => createBurst(point, group.color), index * 14));
      comboStreak += 1;
      maxCombo = Math.max(maxCombo, comboStreak);
      maxChain = Math.max(maxChain, chainDepth);
      if (chainDepth > 1) {
        chainReactions += 1;
        unlockAfterReaction();
      }
      const gained = Math.round(group.size * 110 * (1 + Math.max(0, comboStreak - 1) * 0.25) * chainDepth);
      score += gained;
      groupBonus += Math.max(0, group.size - 3) * 130;
      chainBonus += Math.max(0, chainDepth - 1) * group.size * 95;
      awardPowerCharge(
        6 + Math.max(0, group.size - 3) * 4 + Math.max(0, chainDepth - 1) * 7 + (comboStreak >= 3 ? 3 : 0),
        "A sequência de acertos encheu o medalhão."
      );
      const completedGoal = markGoal(group);
      if (completedGoal) {
        const stillNeeded = (colorKey) => goals.some((goal) => !goal.done && goal.color === colorKey);
        if (!stillNeeded(currentColor)) currentColor = chooseUsefulColor();
        if (!stillNeeded(nextColor)) nextColor = chooseUsefulColor();
      }
      const isCombo = comboStreak >= 4;
      const callout = isCombo ? `COMBO ${comboStreak}x!` : chainDepth > 1 ? `REAÇÃO ${chainDepth}x!` : group.size >= 4 ? `GRUPO DE ${group.size}!` : `+${gained}`;
      showCallout(callout, center, isCombo || chainDepth > 2);
      if (!reducedMotion && (group.size >= 5 || chainDepth >= 2)) {
        path.classList.add("is-impacting");
        later(() => path.classList.remove("is-impacting"), 190);
      }
      playTone("pop", comboStreak + chainDepth);
      renderGoals();
      updateHud();
      updateAmmo();
      elements.puzzleStatus.textContent = completedGoal
        ? `Meta cumprida: grupo de ${group.size} ${colorByKey[group.color].name}! +${gained} pontos.`
        : chainDepth > 1
          ? `Reação em cadeia ${chainDepth}x: +${gained} pontos.`
          : `${group.size} bolinhas ${colorByKey[group.color].name} explodiram. +${gained} pontos.`;

      later(() => {
        if (!active || serial !== resolutionSerial) return;
        const removed = removeBallIndices(
          Array.from({ length: group.size }, (_, index) => group.start + index),
          { piercing: false, forceStone: false }
        );
        ballNodes.forEach((node) => node.classList.remove("is-popping"));
        if (!removed) {
          resolving = false;
          updateAmmo();
          captureSnapshot();
          return;
        }
        if (advanceOrFinishWave()) return;
        const boundary = clamp(group.start - 1, 0, balls.length - 1);
        const chained = balls.length ? groupAt(boundary) : null;
        if (chained && chained.size >= 3) {
          later(() => explodeGroup(chained, chainDepth + 1, serial), reducedMotion ? 0 : CHAIN_REACTION_DELAY);
          return;
        }
        appendUsefulWave();
        resolving = false;
        updateAmmo();
        captureSnapshot();
      }, reducedMotion ? 20 : MATCH_COLLAPSE_DELAY);
    };
    const insertionIndexForImpact = (targetIndex, impactPoint) => {
      const safeTarget = clamp(targetIndex, 0, Math.max(0, balls.length - 1));
      const targetPoint = pointForIndex(safeTarget);
      if (!targetPoint) return safeTarget + 1;
      const before = pointForIndex(safeTarget - 1);
      const after = pointForIndex(safeTarget + 1);
      let tangentX = 0;
      let tangentY = 0;
      if (before && after) {
        tangentX = after.x - before.x;
        tangentY = after.y - before.y;
      } else if (after) {
        tangentX = after.x - targetPoint.x;
        tangentY = after.y - targetPoint.y;
      } else if (before) {
        tangentX = targetPoint.x - before.x;
        tangentY = targetPoint.y - before.y;
      } else return safeTarget + 1;
      const side = (impactPoint.x - targetPoint.x) * tangentX + (impactPoint.y - targetPoint.y) * tangentY;
      return side >= 0 ? safeTarget + 1 : safeTarget;
    };
    const resolveImpact = (targetIndex, colorKey, impactPoint) => {
      if (!active || resolving) return;
      resolving = true;
      const serial = ++resolutionSerial;
      const safeTarget = clamp(targetIndex, 0, Math.max(0, balls.length - 1));
      const projectilePower = shot?.power || "";
      const projectileWasWild = Boolean(shot?.wild);
      const projectileWasTriple = Boolean(shot?.triple);
      const targetMeta = ballMeta[safeTarget] || { type: "normal", hits: 1, revealed: true, locked: false };
      shotsHit += 1;
      hitStreak += 1;
      if (hitStreak % 4 === 0) awardPowerCharge(3, `${hitStreak} acertos sem errar fortaleceram o medalhão.`);
      if (shotsFired >= 6 && shotsFired % 3 === 0 && shotsHit / shotsFired >= .85) awardPowerCharge(2, "A mira precisa fortaleceu o medalhão.");
      if (projectileWasWild) colorKey = balls[safeTarget] || colorKey;
      const insertedIndex = insertionIndexForImpact(safeTarget, impactPoint);
      stopCurrentShot();
      hideAimVisual();
      createImpactFlash(impactPoint, colorKey);
      if (!projectilePower && ["armored", "stone"].includes(targetMeta.type)) {
        if (Number(targetMeta.hits || 2) > 1) {
          targetMeta.hits -= 1;
          score += 90;
          awardPowerCharge(4);
          setMarbleMeta(ballNodes[safeTarget], targetMeta);
          createBurst(impactPoint, colorKey);
          showCallout(targetMeta.type === "armored" ? "BLINDAGEM RACHADA" : "PEDRA FRAGILIZADA", impactPoint, false);
        } else {
          const specialName = targetMeta.type;
          const removed = removeBallIndices([safeTarget], { piercing: true, forceStone: true });
          score += removed * 180;
          showCallout(specialName === "armored" ? "BLINDAGEM QUEBRADA" : "PEDRA ABERTA", impactPoint, true);
        }
        resolving = false;
        updateHud();
        updateAmmo();
        captureSnapshot();
        if (!advanceOrFinishWave()) appendUsefulWave();
        return;
      }
      if (targetMeta.type === "frozen" && !projectilePower) {
        targetMeta.type = "normal";
        targetMeta.hits = 1;
        setMarbleMeta(ballNodes[safeTarget], targetMeta);
        showCallout("GELO DERRETIDO", impactPoint, false);
      }
      if (targetMeta.type === "shadow" && !targetMeta.revealed) {
        targetMeta.revealed = true;
        setMarbleMeta(ballNodes[safeTarget], targetMeta);
      }
      const beforePoints = captureBallPoints();
      const insertionCount = projectileWasTriple ? 3 : 1;
      const insertedColors = Array.from({ length: insertionCount }, () => colorKey);
      const insertedMeta = insertedColors.map(() => ({ type: "normal", hits: 1, revealed: true, locked: false }));
      balls.splice(insertedIndex, 0, ...insertedColors);
      ballMeta.splice(insertedIndex, 0, ...insertedMeta);
      insertedColors.forEach((insertedColor, offset) => {
        const insertedNode = createMarbleNode(insertedColor, true, insertedMeta[offset]);
        ballNodes.splice(insertedIndex + offset, 0, insertedNode);
        ballLayer.append(insertedNode);
        beforePoints.set(insertedNode, {
          x: impactPoint.x + (offset - (insertionCount - 1) / 2) * 8,
          y: impactPoint.y + (offset - (insertionCount - 1) / 2) * 4
        });
      });
      if (projectilePower === "colorBloom") {
        for (let index = Math.max(0, insertedIndex - 2); index <= Math.min(balls.length - 1, insertedIndex + insertionCount + 1); index += 1) {
          if (ballMeta[index]?.type === "stone" || ballMeta[index]?.locked) continue;
          balls[index] = colorKey;
          setMarbleColor(ballNodes[index], colorKey);
        }
        showCallout("FLOR DE CORES", impactPoint, true);
      }
      moveBalls();
      animateReflow(beforePoints, 115);
      if (projectilePower === "memoryFlame") {
        const removed = removeBallIndices(
          Array.from({ length: 5 + insertionCount }, (_, offset) => insertedIndex - 2 + offset),
          { piercing: true, forceStone: false }
        );
        score += removed * 165;
        showCallout(`CHAMA · ${removed} BOLINHAS`, impactPoint, true);
        resolving = false;
        updateHud();
        updateAmmo();
        captureSnapshot();
        if (!advanceOrFinishWave()) appendUsefulWave();
        return;
      }
      const group = groupAt(clamp(insertedIndex + Math.floor(insertionCount / 2), 0, balls.length - 1));
      if (group && group.size >= 3) {
        explodeGroup(group, 1, serial);
      } else {
        resolving = false;
        comboStreak = 0;
        hitStreak = 0;
        misses += 1;
        headProgress += config.missPenalty;
        score = Math.max(0, score - 25);
        createBurst(impactPoint, colorKey);
        showCallout("SEM GRUPO", impactPoint, false);
        playTone("miss");
        updateHud();
        updateAmmo();
        moveBalls();
        captureSnapshot();
        elements.puzzleStatus.textContent = "Não formou 3: a onda avançou e o combo foi zerado.";
        const missObjective = objectives.find((objective) => objective.type === "misses");
        if (headProgress >= 0.985 || missObjective && misses > missObjective.target) lose(missObjective ? "O limite de erros foi ultrapassado." : "");
      }
    };
    const resolveProjectileMiss = () => {
      if (!shot || !active) return;
      const colorKey = shot.color;
      const missPoint = { x: clamp(shot.x, 10, 710), y: clamp(shot.y, 10, 390) };
      stopCurrentShot();
      hideAimVisual();
      resolving = false;
      comboStreak = 0;
      hitStreak = 0;
      misses += 1;
      headProgress += config.missPenalty * 0.65;
      score = Math.max(0, score - 15);
      createBurst(missPoint, colorKey);
      showCallout("ERROU A CORRENTE", missPoint, false);
      playTone("miss");
      updateHud();
      updateAmmo();
      moveBalls();
      captureSnapshot();
      elements.puzzleStatus.textContent = "O disparo passou pela corrente. Mire no caminho das bolinhas e solte novamente.";
      const missObjective = objectives.find((objective) => objective.type === "misses");
      if (headProgress >= 0.985 || missObjective && misses > missObjective.target) lose(missObjective ? "O limite de erros foi ultrapassado." : "");
    };
    const collisionAlongSegment = (startX, startY, endX, endY) => {
      const segmentX = endX - startX;
      const segmentY = endY - startY;
      const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY || 1;
      let nearest = null;
      balls.forEach((_, index) => {
        const center = pointForIndex(index);
        if (!center) return;
        const projection = clamp(((center.x - startX) * segmentX + (center.y - startY) * segmentY) / segmentLengthSquared, 0, 1);
        const closestX = startX + segmentX * projection;
        const closestY = startY + segmentY * projection;
        const distance = Math.hypot(center.x - closestX, center.y - closestY);
        if (distance > collisionRadius || (nearest && projection >= nearest.projection)) return;
        nearest = { index, projection, point: { x: closestX, y: closestY } };
      });
      return nearest;
    };
    const updateShot = (delta) => {
      if (!shot || !active) return;
      const step = PROJECTILE_SPEED * delta;
      const nextX = shot.x + shot.velocityX * step;
      const nextY = shot.y + shot.velocityY * step;
      const collision = collisionAlongSegment(shot.x, shot.y, nextX, nextY);
      if (collision) {
        shot.x = collision.point.x;
        shot.y = collision.point.y;
        shot.element.style.left = `${(shot.x / 720) * 100}%`;
        shot.element.style.top = `${(shot.y / 400) * 100}%`;
        resolveImpact(collision.index, shot.color, collision.point);
        return;
      }
      shot.x = nextX;
      shot.y = nextY;
      shot.traveled += step;
      shot.element.style.left = `${(shot.x / 720) * 100}%`;
      shot.element.style.top = `${(shot.y / 400) * 100}%`;
      shot.extraElements?.forEach((element, index) => {
        const side = index === 0 ? -1 : 1;
        const offset = Math.min(34, shot.traveled * .065) * side;
        const spreadX = shot.x - shot.velocityY * offset;
        const spreadY = shot.y + shot.velocityX * offset;
        element.style.left = `${(spreadX / 720) * 100}%`;
        element.style.top = `${(spreadY / 400) * 100}%`;
      });
      if (shot.traveled >= MAX_PROJECTILE_DISTANCE || shot.x < -35 || shot.x > 755 || shot.y < -35 || shot.y > 435) resolveProjectileMiss();
    };
    function shootAt(point) {
      if (!active || resolving || shot) return;
      point = assistedAimPoint(point);
      const dx = point.x - CANNON_POINT.x;
      const dy = point.y - CANNON_POINT.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 24) {
        elements.puzzleStatus.textContent = "Aponte um pouco mais longe do canhão e solte para disparar.";
        return;
      }
      const velocityX = dx / distance;
      const velocityY = dy / distance;
      const projectile = document.createElement("i");
      projectile.className = "luxor-projectile";
      projectile.style.left = `${(CANNON_POINT.x / 720) * 100}%`;
      projectile.style.top = `${(CANNON_POINT.y / 400) * 100}%`;
      projectile.style.setProperty("--marble-color", colorByKey[currentColor].hex);
      projectile.style.setProperty("--shot-angle", `${Math.atan2(velocityY, velocityX) * 180 / Math.PI}deg`);
      effectsLayer.append(projectile);
      const extraElements = tripleShot ? [-1, 1].map(() => {
        const extra = document.createElement("i");
        extra.className = "luxor-projectile is-spread";
        extra.style.left = `${(CANNON_POINT.x / 720) * 100}%`;
        extra.style.top = `${(CANNON_POINT.y / 400) * 100}%`;
        extra.style.setProperty("--marble-color", colorByKey[currentColor].hex);
        extra.style.setProperty("--shot-angle", `${Math.atan2(velocityY, velocityX) * 180 / Math.PI}deg`);
        effectsLayer.append(extra);
        return extra;
      }) : [];
      path.classList.add("is-shooting");
      shot = {
        color: currentColor,
        x: CANNON_POINT.x,
        y: CANNON_POINT.y,
        velocityX,
        velocityY,
        traveled: 0,
        element: projectile,
        extraElements,
        power: activePower,
        wild: wildShot,
        triple: tripleShot
      };
      activePower = "";
      wildShot = false;
      tripleShot = false;
      shotsFired += 1;
      currentColor = nextColor;
      nextColor = chooseUsefulColor();
      cannonAnimation?.cancel?.();
      if (!reducedMotion && typeof cannon.animate === "function") {
        cannonAnimation = cannon.animate([
          { scale: 1, filter: "brightness(1)" },
          { scale: .92, filter: "brightness(1.22)", offset: .38 },
          { scale: 1, filter: "brightness(1)" }
        ], { duration: 135, easing: "ease-out" });
      }
      hideAimVisual();
      updateAmmo();
      updatePowerHud();
      playTone("shoot");
      elements.puzzleStatus.textContent = `Disparo ${colorByKey[shot.color].name} a caminho — a onda continua andando.`;
    }
    const beginAim = (event) => {
      if (!active || resolving || shot || event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      refreshBoardMetrics();
      aimingPointerId = event.pointerId;
      try { path.setPointerCapture(event.pointerId); } catch { /* captura pode não estar disponível */ }
      updateAimVisual(pointFromPointer(event), true);
      elements.puzzleStatus.textContent = "Mire na corrente e solte para disparar.";
    };
    const moveAim = (event) => {
      if (aimingPointerId === null || event.pointerId !== aimingPointerId) return;
      event.preventDefault();
      const samples = event.getCoalescedEvents?.();
      const sample = samples?.length ? samples[samples.length - 1] : event;
      updateAimVisual(pointFromPointer(sample), true);
    };
    const releaseAim = (event) => {
      if (aimingPointerId === null || event.pointerId !== aimingPointerId) return;
      event.preventDefault();
      const point = pointFromPointer(event);
      aimingPointerId = null;
      try { path.releasePointerCapture(event.pointerId); } catch { /* captura já pode ter sido liberada */ }
      updateAimVisual(point, false);
      shootAt(point);
    };
    const cancelAim = (event) => {
      if (aimingPointerId === null || event.pointerId !== aimingPointerId) return;
      aimingPointerId = null;
      hideAimVisual();
    };
    const assistedAimPoint = (point) => {
      if (!aimAssist || balls.length === 0) return point;
      const targetAngle = Math.atan2(point.y - CANNON_POINT.y, point.x - CANNON_POINT.x);
      let best = null;
      balls.forEach((_, index) => {
        const center = pointForIndex(index);
        if (!center) return;
        const angle = Math.atan2(center.y - CANNON_POINT.y, center.x - CANNON_POINT.x);
        const difference = Math.abs(Math.atan2(Math.sin(angle - targetAngle), Math.cos(angle - targetAngle)));
        if (difference <= .115 && (!best || difference < best.difference)) best = { point: center, difference };
      });
      return best?.point || point;
    };
    const activatePower = (key) => {
      if (!active || paused || resolving || shot || !equippedPowers.includes(key)) return;
      const definition = powerByKey[key];
      if (!definition || powerCharge < definition.cost || activeElapsedMs < Number(powerCooldowns[key] || 0)) return;
      powerCharge = clamp(powerCharge - definition.cost, 0, 100);
      powersUsed += 1;
      powerCooldowns[key] = activeElapsedMs + 3600;
      objectives.filter((objective) => objective.type === "restrictedPower" && objective.power === key).forEach((objective) => {
        objective.used = true;
        objective.done = false;
      });
      if (key === "timeKeepsake") {
        slowUntil = activeElapsedMs + 9000;
        showCallout("RELÍQUIA DO TEMPO", { x: 360, y: 155 }, true);
        elements.puzzleStatus.textContent = "A corrente e o disparo foram desacelerados por 9 segundos.";
      } else if (key === "reverseCurrent") {
        headProgress = Math.max(.08, headProgress - .16);
        moveBalls();
        showCallout("CORRENTE REVERSA", { x: 360, y: 155 }, true);
        elements.puzzleStatus.textContent = "A corrente recuou pelo caminho.";
      } else if (key === "familyLightning") {
        const counts = activeKeys.map((color) => ({
          color,
          count: balls.filter((ball, index) => ball === color && ballMeta[index]?.type !== "stone" && !ballMeta[index]?.locked).length
        })).sort((a, b) => b.count - a.count);
        const preferred = objectives.find((objective) => objective.color && !objective.done)?.color;
        const selected = counts.find((item) => item.color === preferred && item.count >= 3) || counts[0];
        const indices = balls
          .map((color, index) => color === selected?.color ? index : -1)
          .filter((index) => index >= 0)
          .slice(0, 8);
        const removed = removeBallIndices(indices, { piercing: false, forceStone: false });
        score += removed * 145;
        showCallout(`RAIO · ${removed} ${colorByKey[selected?.color]?.name || ""}`, { x: 360, y: 155 }, true);
        if (!advanceOrFinishWave()) appendUsefulWave();
      } else if (key === "portalShield") {
        shieldUntil = activeElapsedMs + 8000;
        path.classList.add("has-portal-shield");
        showCallout("ESCUDO DO PORTAL", { x: displayEnd[0], y: displayEnd[1] }, true);
        elements.puzzleStatus.textContent = "O portal segura a corrente por 8 segundos.";
      } else if (key === "wildMemory") {
        wildShot = true;
        activePower = key;
        elements.puzzleStatus.textContent = "Memória Curinga pronta: o próximo tiro copiará a melhor cor tocada.";
      } else if (key === "tripleMemoryShot") {
        tripleShot = true;
        activePower = key;
        elements.puzzleStatus.textContent = "Disparo Triplo pronto: a próxima mira insere três bolinhas controladas.";
      } else {
        activePower = key;
        elements.puzzleStatus.textContent = key === "memoryFlame"
          ? "Chama da Memória pronta: mire o centro da área que deseja explodir."
          : "Flor de Cores pronta: mire a seção que receberá a cor do disparo.";
      }
      playTone("pop", 4);
      updateHud();
      updateAmmo();
      captureSnapshot();
    };
    const swapAmmo = () => {
      if (!active || resolving || shot) return;
      [currentColor, nextColor] = [nextColor, currentColor];
      updateAmmo();
      playTone("shoot");
      elements.puzzleStatus.textContent = "Bolinhas trocadas. Escolha onde mirar.";
    };
    const contextMenuHandler = (event) => {
      event.preventDefault();
      swapAmmo();
    };
    const movementDirectionForKey = (key) => {
      if (key === "a" || key === "A" || key === "ArrowLeft") return -1;
      if (key === "d" || key === "D" || key === "ArrowRight") return 1;
      return 0;
    };
    const keyHandler = (event) => {
      const movementDirection = movementDirectionForKey(event.key);
      if (movementDirection && active) {
        event.preventDefault();
        movementKeys.add(movementDirection < 0 ? "left" : "right");
        if (!event.repeat) moveCannon(movementDirection, 1 / 30);
      } else if ((event.key === "x" || event.key === "X") && active) {
        event.preventDefault();
        swapAmmo();
      } else if (/^[1-3]$/.test(event.key) && active) {
        event.preventDefault();
        activatePower(equippedPowers[Number(event.key) - 1]);
      } else if ((event.key === "p" || event.key === "P") && active) {
        event.preventDefault();
        setPaused();
      } else if ((event.key === "Enter" || event.key === " ") && active && document.activeElement === path) {
        event.preventDefault();
        shootAt(lastAimPoint);
      }
    };
    const keyUpHandler = (event) => {
      const movementDirection = movementDirectionForKey(event.key);
      if (!movementDirection) return;
      movementKeys.delete(movementDirection < 0 ? "left" : "right");
    };
    const clearCannonMovement = () => {
      movementKeys.clear();
      mobileMoveDirection = 0;
      moveButtons.forEach((button) => button.classList.remove("is-pressed"));
    };
    const startMobileMove = (event) => {
      if (!active || paused || resolving || waveChanging) return;
      event.preventDefault();
      const button = event.currentTarget;
      mobileMoveDirection = Number(button.dataset.luxorMove) || 0;
      moveButtons.forEach((item) => item.classList.toggle("is-pressed", item === button));
      try { button.setPointerCapture(event.pointerId); } catch { /* captura pode não estar disponível */ }
      moveCannon(mobileMoveDirection, 1 / 30);
    };
    const stopMobileMove = (event) => {
      const button = event.currentTarget;
      button.classList.remove("is-pressed");
      if (Number(button.dataset.luxorMove) === mobileMoveDirection) mobileMoveDirection = 0;
      try { button.releasePointerCapture(event.pointerId); } catch { /* captura já pode ter sido liberada */ }
    };
    const resizeHandler = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (!active) return;
        refreshBoardMetrics();
        moveBalls();
        updateAimVisual(lastAimPoint, aimingPointerId !== null);
      });
    };
    const visibilityHandler = () => {
      if (document.hidden) {
        clearCannonMovement();
        setPaused(true, true);
      }
      lastTime = performance.now();
    };
    const tick = (now) => {
      if (!active) return;
      const elapsed = Math.max(0, now - lastTime);
      const delta = Math.min(compatibilityMode ? 26 : 32, elapsed) / 1000;
      lastTime = now;
      if (paused || waveChanging) {
        animationFrame = requestAnimationFrame(tick);
        return;
      }
      const keyboardDirection = (movementKeys.has("right") ? 1 : 0) - (movementKeys.has("left") ? 1 : 0);
      const moveDirection = clamp(keyboardDirection + mobileMoveDirection, -1, 1);
      if (moveDirection) moveCannon(moveDirection, delta);
      activeElapsedMs += Math.min(elapsed, 50);
      const hudSecond = Math.floor(activeElapsedMs / 1000);
      if (hudSecond !== lastHudSecond) {
        lastHudSecond = hudSecond;
        refreshObjectives(false);
      }
      const slowFactor = activeElapsedMs < slowUntil ? .38 : 1;
      const shielded = activeElapsedMs < shieldUntil;
      path.classList.toggle("is-time-slowed", slowFactor < 1);
      path.classList.toggle("has-portal-shield", shielded);
      headProgress += (shielded ? 0 : config.waveSpeed * slowFactor) * delta;
      moveBalls();
      updateShot(delta * slowFactor);
      if (activeElapsedMs - snapshotTimer >= 5000) {
        snapshotTimer = activeElapsedMs;
        captureSnapshot();
      }
      const timeObjective = objectives.find((objective) => objective.type === "time");
      if (timeObjective && activeElapsedMs > timeObjective.target * 1000) {
        lose("O tempo desta lembrança terminou.");
        return;
      }
      if (headProgress >= 0.985) {
        lose();
        return;
      }
      animationFrame = requestAnimationFrame(tick);
    };

    if (!restored) {
      currentColor = chooseUsefulColor();
      nextColor = chooseUsefulColor();
    }
    refreshBoardMetrics();
    syncCannonPosition();
    if (routeVariant === "alternate") {
      const alternateStart = pointAtProgress(0);
      const alternateEnd = pointAtProgress(1);
      const startCircle = $(".luxor-start", path);
      const endCircle = $(".luxor-end", path);
      const endPulse = $(".luxor-end-pulse", path);
      startCircle?.setAttribute("cx", String(alternateStart.x));
      startCircle?.setAttribute("cy", String(alternateStart.y));
      endCircle?.setAttribute("cx", String(alternateEnd.x));
      endCircle?.setAttribute("cy", String(alternateEnd.y));
      endPulse?.setAttribute("cx", String(alternateEnd.x));
      endPulse?.setAttribute("cy", String(alternateEnd.y));
      const startLabel = $(".luxor-start-label", path);
      const endLabel = $(".luxor-end-label", path);
      if (startLabel) {
        startLabel.style.left = `${alternateStart.x / 7.2}%`;
        startLabel.style.top = `${alternateStart.y / 4}%`;
      }
      if (endLabel) {
        endLabel.style.left = `${alternateEnd.x / 7.2}%`;
        endLabel.style.top = `${alternateEnd.y / 4}%`;
      }
    }
    if (!restored) headProgress = clamp(0.23 + challenge.level * 0.009, 0.23, 0.31);
    swapButton.addEventListener("click", swapAmmo);
    powerButtons.forEach((button) => button.addEventListener("click", () => activatePower(button.dataset.luxorPower)));
    pauseButton.addEventListener("click", () => setPaused());
    $("button", pausePanel).addEventListener("click", () => setPaused(false));
    path.addEventListener("contextmenu", contextMenuHandler);
    path.addEventListener("pointerdown", beginAim);
    path.addEventListener("pointermove", moveAim);
    path.addEventListener("pointerup", releaseAim);
    path.addEventListener("pointercancel", cancelAim);
    path.addEventListener("lostpointercapture", cancelAim);
    moveButtons.forEach((button) => {
      button.addEventListener("pointerdown", startMobileMove);
      button.addEventListener("pointerup", stopMobileMove);
      button.addEventListener("pointercancel", stopMobileMove);
      button.addEventListener("lostpointercapture", stopMobileMove);
    });
    if (compatibilityMode) {
      window.addEventListener("pointerup", releaseAim, { passive: false });
      window.addEventListener("pointercancel", cancelAim, { passive: false });
    }
    window.addEventListener("keydown", keyHandler);
    window.addEventListener("keyup", keyUpHandler);
    window.addEventListener("blur", clearCannonMovement);
    window.addEventListener("resize", resizeHandler, { passive: true });
    document.addEventListener("visibilitychange", visibilityHandler);
    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver(resizeHandler);
      resizeObserver.observe(path);
    }
    renderGoals();
    updateHud();
    updateAmmo();
    renderBalls(0);
    updateAimVisual(lastAimPoint, false);
    elements.puzzleStatus.textContent = compatibilityMode
      ? `A onda ${config.speedLabel} já está andando. Segure as setas laterais para mover o lançador; toque, arraste e solte para disparar.`
      : `A onda ${config.speedLabel} já está andando. Use A/D ou ←/→ para mover; clique e solte para disparar e use o botão direito para trocar a bolinha.`;
    animationFrame = requestAnimationFrame(tick);
    puzzleCleanup = () => {
      if (active) captureSnapshot();
      active = false;
      resolutionSerial += 1;
      aimingPointerId = null;
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(resizeFrame);
      clearPendingTimers();
      comboAnimation?.cancel?.();
      cannonAnimation?.cancel?.();
      resizeObserver?.disconnect();
      path.removeEventListener("contextmenu", contextMenuHandler);
      path.removeEventListener("pointerdown", beginAim);
      path.removeEventListener("pointermove", moveAim);
      path.removeEventListener("pointerup", releaseAim);
      path.removeEventListener("pointercancel", cancelAim);
      path.removeEventListener("lostpointercapture", cancelAim);
      moveButtons.forEach((button) => {
        button.removeEventListener("pointerdown", startMobileMove);
        button.removeEventListener("pointerup", stopMobileMove);
        button.removeEventListener("pointercancel", stopMobileMove);
        button.removeEventListener("lostpointercapture", stopMobileMove);
      });
      if (compatibilityMode) {
        window.removeEventListener("pointerup", releaseAim);
        window.removeEventListener("pointercancel", cancelAim);
      }
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("keyup", keyUpHandler);
      window.removeEventListener("blur", clearCannonMovement);
      window.removeEventListener("resize", resizeHandler);
      document.removeEventListener("visibilitychange", visibilityHandler);
      ballNodes.forEach((node) => node._luxorReflow?.cancel?.());
      stopCurrentShot();
      effectsLayer.replaceChildren();
      if (audioContext && audioContext.state !== "closed") audioContext.close().catch(() => {});
    };
  }

  function initSimon(challenge) {
    const free = settingsFor(challenge) || {
      rounds: 2 + (challenge.level % 2),
      length: 3 + Math.floor(challenge.level / 3),
      colors: 4,
      stepMs: 480,
      lightMs: 270,
      label: "Sequência clássica",
      seed: `album:simon:${challenge.id}:v2`
    };
    const restored = restoredGameState("simon");
    const random = Core.seededRandom(free.seed || challenge.seed || `simon:${challenge.id}`);
    const roundsTarget = free.rounds;
    const baseLength = free.length;
    const colorCount = clamp(Number(free.colors || 4), 3, 6);
    const chapterCount = clamp(Number(free.patternChapters || 1), 1, Math.max(1, roundsTarget));
    const roundsPerChapter = Math.ceil(roundsTarget / chapterCount);
    const chapterForRound = (roundNumber) => clamp(Math.ceil(Math.max(1, roundNumber) / roundsPerChapter), 1, chapterCount);
    let sequence = restored && Array.isArray(restored.sequence) ? restored.sequence.map(Number).filter((value) => value >= 0 && value < colorCount) : [];
    let input = [];
    let round = clamp(Number(restored?.round || 0), 0, roundsTarget);
    let errors = clamp(Number(restored?.errors || 0), 0, 1000);
    let accepting = false;
    let active = true;
    let timeouts = [];
    let audioContext = null;
    let currentMode = "visual-audio";
    let reverseRound = false;
    const progressDots = Array.from({ length: roundsTarget }, (_, index) => `<i class="${index < Math.max(0, round - (sequence.length ? 1 : 0)) ? "is-done" : ""}"></i>`).join("");
    const wrap = document.createElement("div");
    wrap.className = "simon-wrap";
    wrap.innerHTML = `<div class="game-hud">
      <span>Rodada: <b id="simonRound">${round}</b>/${roundsTarget}</span>
      <span>Erros: <b id="simonErrors">${errors}</b>${free.errorLimit ? `/${free.errorLimit}` : ""}</span>
      <span>Sinais: ${baseLength}+</span>
      <span class="phase-mechanic-tag">${escapeHTML(free.label || "Sequência")}</span>
    </div><div class="game-objective-bar"></div>
    <div class="simon-progress">${progressDots}</div>
    <div class="simon-announcer" id="simonAnnouncer" role="status" aria-live="polite">Pronto</div>
    <div class="simon-board" data-keys="${colorCount}">${Array.from({ length: colorCount }, (_, index) => `<button class="simon-key" type="button" data-color="${index}" aria-label="Sinal ${index + 1}"><span>${index + 1}</span></button>`).join("")}</div>
    <button class="primary-button" id="startSimon" type="button">${sequence.length ? "Continuar sequência" : "Mostrar sequência"}</button>`;
    elements.puzzleStage.append(wrap);
    const keys = $$(".simon-key", wrap);
    const roundEl = $("#simonRound", wrap);
    const errorsEl = $("#simonErrors", wrap);
    const start = $("#startSimon", wrap);
    const dots = $$(".simon-progress i", wrap);
    const announcer = $("#simonAnnouncer", wrap);
    const objectiveBar = $(".game-objective-bar", wrap);
    const later = (fn, milliseconds) => {
      const id = window.setTimeout(() => {
        timeouts = timeouts.filter((timer) => timer !== id);
        fn();
      }, milliseconds);
      timeouts.push(id);
    };
    const playTone = (color, duration = .16) => {
      if (!state.volume || currentMode === "visual") return;
      const AudioEngine = window.AudioContext || window.webkitAudioContext;
      if (!AudioEngine) return;
      try {
        audioContext ||= new AudioEngine();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const now = audioContext.currentTime;
        oscillator.type = "sine";
        oscillator.frequency.value = [261.63, 329.63, 392, 493.88, 587.33, 698.46][color] || 440;
        gain.gain.setValueAtTime(.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(.002, state.volume / 100 * .055), now + .01);
        gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + duration + .02);
      } catch { /* áudio é complementar */ }
    };
    const expectedSequence = () => reverseRound ? [...sequence].reverse() : sequence;
    const roundMode = () => {
      if (free.audioOnlyRounds && free.visualOnlyRounds) return round % 2 ? "audio" : "visual";
      if (free.audioOnlyRounds && round % 2 === 0) return "audio";
      if (free.visualOnlyRounds && round % 2 === 0) return "visual";
      return "visual-audio";
    };
    const renderObjectives = () => {
      objectiveBar.replaceChildren();
      [
        reverseRound ? "Ordem reversa" : "Ordem normal",
        currentMode === "audio" ? "Rodada sonora + números" : currentMode === "visual" ? "Rodada visual" : "Som e luz",
        chapterCount > 1 ? `Capítulo ${chapterForRound(round || 1)}/${chapterCount}` : "",
        free.errorLimit ? `${Math.max(0, free.errorLimit - errors)} erros restantes` : ""
      ].filter(Boolean).forEach((label) => {
        const item = document.createElement("span");
        item.textContent = label;
        objectiveBar.append(item);
      });
    };
    const phaseElapsed = () => freePlaySession ? freeElapsed() - freePlaySession.completedMs : dailyPlaySession ? dailyElapsed() : 0;
    const capture = () => updateActiveGameSnapshot({ sequence: [...sequence], round, errors }, phaseElapsed());
    const refreshGuide = () => {
      if (!active) return;
      if (!sequence.length) {
        markPuzzleGuideTarget(start, "Mostre a sequência");
        return;
      }
      if (accepting) {
        const expected = expectedSequence();
        markPuzzleGuideTarget(keys[expected[input.length]], reverseRound ? "Repita de trás para frente" : "Toque no sinal destacado");
        return;
      }
      clearPuzzleGuideTarget();
    };
    const distract = (delay, sequenceColor) => {
      if (!free.distractors) return;
      for (let count = 0; count < free.distractors; count += 1) {
        const distractor = (sequenceColor + 1 + count + round) % colorCount;
        later(() => {
          keys[distractor]?.classList.add("is-distractor");
          later(() => keys[distractor]?.classList.remove("is-distractor"), 150);
        }, delay + Math.round(free.lightMs * .45) + count * 35);
      }
    };
    const flash = (color, delay, position) => {
      later(() => {
        if (!active) return;
        if (currentMode !== "audio") keys[color]?.classList.add("is-lit");
        playTone(color);
        announcer.textContent = `Sinal ${color + 1} · passo ${position + 1}`;
      }, delay);
      later(() => keys[color]?.classList.remove("is-lit"), delay + free.lightMs);
      distract(delay, color);
    };
    const play = () => {
      if (!active) return;
      accepting = false;
      input = [];
      start.disabled = true;
      clearPuzzleGuideTarget();
      currentMode = roundMode();
      reverseRound = Boolean(free.reverse && (round % 2 === 0 || free.mechanic === "reverse" || free.mechanic === "master"));
      renderObjectives();
      const playback = sequence;
      const speedFactor = free.speedCurve === "accelerating" ? Math.max(.68, 1 - round * .055) : 1;
      const step = Math.max(210, free.stepMs * speedFactor);
      elements.puzzleStatus.textContent = `Observe ${sequence.length} sinais${reverseRound ? "; depois repita ao contrário" : ""}.`;
      playback.forEach((color, index) => flash(color, index * step, index));
      later(() => {
        accepting = true;
        start.disabled = false;
        start.textContent = "Repetir sequência";
        announcer.textContent = reverseRound ? "Sua vez · ordem reversa" : "Sua vez · ordem normal";
        elements.puzzleStatus.textContent = reverseRound ? "Agora repita do último sinal para o primeiro." : "Agora repita a ordem.";
        refreshPuzzleGuide();
      }, playback.length * step + 190);
    };
    const sequenceForRound = (roundNumber) => {
      const roundRandom = Core.seededRandom(`${free.seed}:round:${roundNumber}`);
      const chapter = chapterForRound(roundNumber);
      const chapterStartRound = (chapter - 1) * roundsPerChapter + 1;
      const length = baseLength + (roundNumber - chapterStartRound) + chapter - 1;
      const result = [];
      for (let index = 0; index < length; index += 1) {
        let color = Math.floor(roundRandom() * colorCount);
        if (index >= 2 && result[index - 1] === color && result[index - 2] === color) color = (color + 1) % colorCount;
        result.push(color);
      }
      return result;
    };
    const nextRound = () => {
      const previousChapter = chapterForRound(Math.max(1, round));
      round += 1;
      roundEl.textContent = String(round);
      sequence = sequenceForRound(round);
      const nextChapter = chapterForRound(round);
      if (chapterCount > 1 && nextChapter !== previousChapter) {
        announcer.textContent = `Capítulo ${nextChapter}/${chapterCount}`;
        elements.puzzleStatus.textContent = `Novo capítulo do padrão: a sequência recomeça com uma estrutura reconhecível.`;
      }
      capture();
      play();
    };
    const fail = () => {
      accepting = false;
      clearPuzzleGuideTarget();
      errors += 1;
      errorsEl.textContent = String(errors);
      wrap.classList.remove("is-error");
      void wrap.offsetWidth;
      wrap.classList.add("is-error");
      capture();
      if (free.errorLimit && errors > free.errorLimit) {
        active = false;
        elements.puzzleStatus.textContent = "O limite de erros terminou. A mesma sequência será reiniciada.";
        later(() => {
          if (currentPuzzleChallenge === challenge && !elements.puzzleModal.hidden) initPuzzle(challenge);
        }, 900);
        return;
      }
      elements.puzzleStatus.textContent = "Sequência incorreta. Ela será mostrada novamente sem mudar.";
      later(play, 700);
    };
    keys.forEach((key) => key.addEventListener("click", () => {
      if (!accepting || !active) return;
      const color = Number(key.dataset.color);
      key.classList.add("is-lit", "is-player");
      playTone(color, .11);
      later(() => key.classList.remove("is-lit", "is-player"), 150);
      input.push(color);
      const expected = expectedSequence();
      const index = input.length - 1;
      if (expected[index] !== color) return fail();
      announcer.textContent = `${input.length} de ${expected.length} corretos`;
      elements.puzzleStatus.textContent = `${input.length} de ${expected.length} sinais corretos.`;
      if (input.length === expected.length) {
        accepting = false;
        clearPuzzleGuideTarget();
        dots[round - 1]?.classList.add("is-done");
        capture();
        if (round >= roundsTarget) {
          active = false;
          later(() => completePuzzle({ errors, performanceBonus: Math.max(0, roundsTarget * 120 - errors * 45) }), 350);
        } else {
          wrap.classList.remove("is-round-win");
          void wrap.offsetWidth;
          wrap.classList.add("is-round-win");
          elements.puzzleStatus.textContent = "Rodada perfeita. O próximo capítulo será maior ou terá uma nova regra.";
          later(nextRound, 650);
        }
      } else refreshPuzzleGuide();
    }));
    start.addEventListener("click", () => {
      if (!sequence.length) nextRound();
      else play();
    });
    if (sequence.length) {
      roundEl.textContent = String(round);
      renderObjectives();
    }
    setPuzzleGuide({ refresh: refreshGuide });
    elements.puzzleStatus.textContent = sequence.length ? "Partida restaurada. Toque em “Continuar sequência”." : "Toque em “Mostrar sequência” para começar.";
    puzzleCleanup = () => {
      active = false;
      timeouts.forEach(clearTimeout);
      if (audioContext && audioContext.state !== "closed") audioContext.close().catch(() => {});
    };
  }

  function initLights(challenge) {
    const free = settingsFor(challenge) || {
      size: 4,
      scramble: 5 + challenge.level,
      rule: "plus",
      shape: "square",
      stages: 1,
      target: "all",
      label: "Luzes clássicas",
      seed: `album:lights:${challenge.id}:v2`
    };
    const size = free.size;
    const total = size * size;
    const restored = restoredGameState("lights");
    let stage = clamp(Number(restored?.stage || 1), 1, Number(free.stages || 1));
    let lights = [];
    let target = [];
    let blocked = new Set();
    let activeIndices = [];
    let moves = Math.max(0, Number(restored?.moves || 0));
    let active = true;
    let pendingTimer = 0;
    const wrap = document.createElement("div");
    wrap.className = "lights-wrap";
    wrap.innerHTML = `<div class="game-hud">
      <span>Movimentos: <b id="lightsMoves">${moves}</b>${free.moveLimit ? `/${free.moveLimitValue}` : ""}</span>
      <span>Acesas: <b id="lightsOn">0</b>/<b id="lightsTotal">0</b></span>
      <span>Etapa: <b id="lightsStage">${stage}</b>/${free.stages || 1}</span>
      <span class="phase-mechanic-tag">${escapeHTML(free.label || "Luzes")}</span>
    </div><div class="game-objective-bar"></div>`;
    const board = document.createElement("div");
    board.className = "lights-board";
    board.dataset.shape = free.shape || "square";
    board.style.setProperty("--lights-size", String(size));
    wrap.append(board);
    const allowHint = !challenge.freeMode;
    let hintButton = null;
    if (allowHint) {
      hintButton = document.createElement("button");
      hintButton.type = "button";
      hintButton.className = "lights-hint secondary-button";
      hintButton.textContent = "✦ Mostrar próximo toque";
      wrap.append(hintButton);
    }
    elements.puzzleStage.append(wrap);
    const movesEl = $("#lightsMoves", wrap);
    const onEl = $("#lightsOn", wrap);
    const totalEl = $("#lightsTotal", wrap);
    const stageEl = $("#lightsStage", wrap);
    const objectiveBar = $(".game-objective-bar", wrap);
    const indexAt = (row, col) => row * size + col;
    const coordinates = (index) => ({ row: Math.floor(index / size), col: index % size });
    const buildBlocked = (stageNumber) => {
      const result = new Set();
      if (free.shape === "corners-cut") [0, size - 1, total - size, total - 1].forEach((index) => result.add(index));
      if (free.shape === "diamond") {
        const center = (size - 1) / 2;
        for (let row = 0; row < size; row += 1) {
          for (let col = 0; col < size; col += 1) {
            if (Math.abs(row - center) + Math.abs(col - center) > center + .3) result.add(indexAt(row, col));
          }
        }
      }
      const candidates = Array.from({ length: total }, (_, index) => index).filter((index) => !result.has(index));
      Core.seededShuffle(candidates, `${free.seed}:blocked:${stageNumber}`).slice(0, Number(free.blocked || 0)).forEach((index) => result.add(index));
      return result;
    };
    const ruleForStage = (stageNumber) => free.rule === "mixed" ? ["plus", "diagonal", "row"][(stageNumber - 1) % 3] : free.rule;
    const affected = (index, stageNumber = stage) => {
      if (blocked.has(index)) return [];
      const { row, col } = coordinates(index);
      const result = [index];
      const add = (targetRow, targetCol) => {
        if (targetRow < 0 || targetCol < 0 || targetRow >= size || targetCol >= size) return;
        const targetIndex = indexAt(targetRow, targetCol);
        if (!blocked.has(targetIndex)) result.push(targetIndex);
      };
      const rule = ruleForStage(stageNumber);
      if (rule === "plus") {
        add(row - 1, col); add(row + 1, col); add(row, col - 1); add(row, col + 1);
      } else if (rule === "diagonal") {
        add(row - 1, col - 1); add(row - 1, col + 1); add(row + 1, col - 1); add(row + 1, col + 1);
      } else if (rule === "row") {
        for (let other = 0; other < size; other += 1) {
          if (other !== col) add(row, other);
          if (other !== row) add(other, col);
        }
      }
      return [...new Set(result)];
    };
    const buildTarget = () => Array.from({ length: total }, (_, index) => {
      if (blocked.has(index)) return false;
      const { row, col } = coordinates(index);
      if (free.target === "checker") return (row + col) % 2 === 0;
      if (free.target === "border") return row === 0 || col === 0 || row === size - 1 || col === size - 1;
      if (free.target === "heart") {
        const x = size <= 4 ? col : col / (size - 1) * 4;
        const y = size <= 4 ? row : row / (size - 1) * 4;
        return [[0, 1], [0, 3], [1, 0], [1, 2], [1, 4], [2, 0], [2, 4], [3, 1], [3, 3], [4, 2]]
          .some(([heartRow, heartCol]) => Math.abs(y - heartRow) < .75 && Math.abs(x - heartCol) < .75);
      }
      return true;
    });
    const toggle = (index) => affected(index).forEach((affectedIndex) => { lights[affectedIndex] = !lights[affectedIndex]; });
    const generateStage = (stageNumber) => {
      blocked = buildBlocked(stageNumber);
      activeIndices = Array.from({ length: total }, (_, index) => index).filter((index) => !blocked.has(index));
      target = buildTarget();
      lights = [...target];
      const random = Core.seededRandom(`${free.seed}:stage:${stageNumber}`);
      const movesToApply = [];
      for (let index = 0; index < Number(free.scramble || 5) + stageNumber - 1; index += 1) {
        movesToApply.push(activeIndices[Math.floor(random() * activeIndices.length)]);
      }
      movesToApply.forEach(toggle);
      if (lights.every((value, index) => blocked.has(index) || value === target[index])) toggle(activeIndices[0]);
      moves = 0;
    };
    if (restored && Array.isArray(restored.lights) && restored.lights.length === total && Array.isArray(restored.blocked)) {
      blocked = new Set(restored.blocked.map(Number));
      activeIndices = Array.from({ length: total }, (_, index) => index).filter((index) => !blocked.has(index));
      target = buildTarget();
      lights = restored.lights.map(Boolean);
    } else generateStage(stage);
    const solved = () => activeIndices.every((index) => lights[index] === target[index]);
    const solve = () => {
      const variables = [...activeIndices];
      const matrix = variables.map((lightIndex) => {
        const row = Array(variables.length + 1).fill(0);
        variables.forEach((clickIndex, column) => {
          if (affected(clickIndex).includes(lightIndex)) row[column] = 1;
        });
        row[variables.length] = lights[lightIndex] === target[lightIndex] ? 0 : 1;
        return row;
      });
      const pivotColumns = [];
      let pivotRow = 0;
      for (let column = 0; column < variables.length && pivotRow < matrix.length; column += 1) {
        let found = pivotRow;
        while (found < matrix.length && !matrix[found][column]) found += 1;
        if (found === matrix.length) continue;
        [matrix[pivotRow], matrix[found]] = [matrix[found], matrix[pivotRow]];
        for (let row = 0; row < matrix.length; row += 1) {
          if (row === pivotRow || !matrix[row][column]) continue;
          for (let item = column; item <= variables.length; item += 1) matrix[row][item] ^= matrix[pivotRow][item];
        }
        pivotColumns[pivotRow] = column;
        pivotRow += 1;
      }
      for (let row = pivotRow; row < matrix.length; row += 1) {
        if (!matrix[row].slice(0, variables.length).some(Boolean) && matrix[row][variables.length]) return [];
      }
      const solution = Array(variables.length).fill(0);
      for (let row = 0; row < pivotRow; row += 1) solution[pivotColumns[row]] = matrix[row][variables.length];
      return solution.map((value, index) => value ? variables[index] : -1).filter((index) => index >= 0);
    };
    const phaseElapsed = () => freePlaySession ? freeElapsed() - freePlaySession.completedMs : dailyPlaySession ? dailyElapsed() : 0;
    const capture = () => updateActiveGameSnapshot({
      stage,
      lights: [...lights],
      blocked: [...blocked],
      moves
    }, phaseElapsed());
    const renderObjectives = () => {
      objectiveBar.replaceChildren();
      [
        `Regra: ${ruleForStage(stage)}`,
        free.target && free.target !== "all" ? `Alvo: ${free.target}` : "Alvo: todas acesas",
        free.moveLimit ? `${Math.max(0, free.moveLimitValue - moves)} toques restantes` : ""
      ].filter(Boolean).forEach((label) => {
        const chip = document.createElement("span");
        chip.textContent = label;
        objectiveBar.append(chip);
      });
    };
    const refreshGuide = () => {
      if (!active) return;
      const next = solve()[0];
      markPuzzleGuideTarget(board.children[next], "Toque na luz destacada");
    };
    const finishStage = () => {
      if (stage < Number(free.stages || 1)) {
        stage += 1;
        stageEl.textContent = String(stage);
        generateStage(stage);
        render();
        capture();
        elements.puzzleStatus.textContent = `Etapa ${stage - 1} concluída. A regra agora é ${ruleForStage(stage)}.`;
        return;
      }
      active = false;
      capture();
      board.classList.add("is-complete");
      pendingTimer = window.setTimeout(() => completePuzzle({ moves, performanceBonus: Math.max(0, 500 - moves * 8) }), 360);
    };
    const fail = () => {
      active = false;
      elements.puzzleStatus.textContent = "O limite de movimentos terminou. O tabuleiro continuará idêntico na nova tentativa.";
      pendingTimer = window.setTimeout(() => {
        if (currentPuzzleChallenge === challenge && !elements.puzzleModal.hidden) initPuzzle(challenge);
      }, 850);
    };
    const press = (index) => {
      if (!active || blocked.has(index)) return;
      moves += 1;
      movesEl.textContent = String(moves);
      toggle(index);
      render();
      capture();
      const correct = activeIndices.filter((activeIndex) => lights[activeIndex] === target[activeIndex]).length;
      elements.puzzleStatus.textContent = `${correct} de ${activeIndices.length} luzes no padrão correto · ${moves} movimentos.`;
      if (solved()) finishStage();
      else if (free.moveLimit && moves >= free.moveLimitValue) fail();
    };
    function render() {
      board.replaceChildren();
      const onCount = activeIndices.filter((index) => lights[index]).length;
      onEl.textContent = String(onCount);
      totalEl.textContent = String(activeIndices.length);
      movesEl.textContent = String(moves);
      activeIndices.forEach(() => {});
      lights.forEach((on, index) => {
        const button = document.createElement("button");
        button.type = "button";
        const isBlocked = blocked.has(index);
        const correct = !isBlocked && on === target[index];
        button.className = `light-tile${on ? " is-on" : ""}${isBlocked ? " is-blocked" : ""}${correct ? " is-correct" : ""}`;
        button.setAttribute("aria-label", isBlocked ? `Casa ${index + 1} bloqueada` : `Luz ${index + 1} ${on ? "acesa" : "apagada"}; ${correct ? "correta" : "fora do padrão"}`);
        button.disabled = isBlocked;
        button.addEventListener("click", () => press(index));
        board.append(button);
      });
      renderObjectives();
      refreshGuide();
    }
    if (hintButton) hintButton.addEventListener("click", () => {
      const next = solve()[0];
      if (next === undefined) {
        elements.puzzleStatus.textContent = "Este tabuleiro já está no padrão ou não precisa de dica.";
        return;
      }
      board.children[next]?.classList.add("is-guide-target");
      elements.puzzleStatus.textContent = `Dica: toque na casa ${next + 1}.`;
    });
    render();
    setPuzzleGuide({ refresh: refreshGuide });
    elements.puzzleStatus.textContent = `Complete o padrão “${free.target || "todas acesas"}”. A etapa foi gerada aplicando movimentos válidos, portanto possui solução.`;
    puzzleCleanup = () => {
      active = false;
      clearTimeout(pendingTimer);
    };
  }

  function toggleFullscreen() {
    const active = elements.pageWrap.classList.toggle("is-fullscreen");
    document.body.style.overflow = active ? "hidden" : "";
  }
  function applyVolume(value) {
    const volume = clamp(Number(value),0,100); state.volume=volume; elements.backgroundMusic.volume=volume/100; elements.musicVolume.value=String(volume); elements.musicVolumeLabel.textContent=`${volume}%`; saveState();
  }
  function ensureMusicPlaying() {
    if (!elements.backgroundMusic.paused) return;
    elements.backgroundMusic.play().then(() => elements.musicButton.classList.add("is-playing")).catch(() => {});
  }
  function toggleMusicControl() {
    const willOpen = elements.volumePopover.hidden;
    elements.volumePopover.hidden = !willOpen;
    ensureMusicPlaying();
  }
  function openSecret() {
    brandClickCount = 0;
    clearTimeout(brandClickTimer);
    elements.secretInput.value = "";
    elements.secretModal.hidden = false;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => elements.secretInput.focus(), 30);
  }
  function closeSecret() {
    elements.secretModal.hidden = true;
    elements.secretInput.value = "";
    if (elements.puzzleModal.hidden && elements.textStyleModal.hidden && elements.profileModal.hidden && !elements.pageWrap.classList.contains("is-fullscreen")) document.body.style.overflow = "";
  }
  function handleBrandClick() {
    switchView("album");
    setPage(1);
    brandClickCount += 1;
    clearTimeout(brandClickTimer);
    if (brandClickCount >= 5) return openSecret();
    brandClickTimer = window.setTimeout(() => { brandClickCount = 0; }, 8000);
  }

  function restartCurrentPuzzle() {
    if (!currentPuzzleChallenge) return;
    const challenge = currentPuzzleChallenge;
    cleanupPuzzle();
    resumeSnapshot = null;
    if (freePlaySession) {
      freePlaySession.phaseStartedAt = Date.now();
      freePlaySession.phaseActiveBeforeMs = 0;
      setActiveSessionSnapshot({
        ...(state.activeSession || {}),
        kind: "free",
        gameKey: freePlaySession.gameKey,
        difficultyKey: freePlaySession.difficultyKey,
        phase: freePlaySession.phase,
        seed: challenge.seed,
        activeElapsedMs: 0,
        context: {
          completedMs: freePlaySession.completedMs,
          points: freePlaySession.points,
          phaseDurations: freePlaySession.phaseDurations,
          phasePoints: freePlaySession.phasePoints
        },
        game: null
      }, true);
    } else if (dailyPlaySession) {
      dailyPlaySession.startedAt = Date.now();
      dailyPlaySession.activeBeforeMs = 0;
      setActiveSessionSnapshot({ ...(state.activeSession || {}), activeElapsedMs: 0, game: null }, true);
    } else if (luxorCampaignSession) {
      luxorCampaignSession.startedAt = Date.now();
      luxorCampaignSession.activeBeforeMs = 0;
      setActiveSessionSnapshot({ ...(state.activeSession || {}), activeElapsedMs: 0, game: null }, true);
    }
    initPuzzle(challenge);
    elements.puzzleStatus.textContent = freePlaySession
      ? `Fase ${freePlaySession.phase} reiniciada. Os pontos das fases anteriores continuam salvos.`
      : dailyPlaySession
        ? "Tentativa diária reiniciada com o mesmo nível determinístico."
        : luxorCampaignSession
          ? "Nível Luxor reiniciado sem criar uma segunda corrente."
          : "Desafio reiniciado. Boa sorte!";
  }

  let hiddenAt = 0;
  function snapshotActiveClock() {
    const snapshot = state.activeSession;
    if (!snapshot) return;
    let elapsed = Number(snapshot.activeElapsedMs || 0);
    if (freePlaySession) elapsed = Math.max(0, Number(freePlaySession.phaseActiveBeforeMs || 0) + Date.now() - freePlaySession.phaseStartedAt);
    else if (dailyPlaySession) elapsed = dailyElapsed();
    else if (luxorCampaignSession) elapsed = Math.max(elapsed, Number(snapshot.game?.activeElapsedMs || 0));
    setActiveSessionSnapshot({ ...snapshot, activeElapsedMs: elapsed, game: snapshot.game }, true);
  }
  function handleDocumentVisibility() {
    if (document.hidden) {
      hiddenAt = Date.now();
      snapshotActiveClock();
      saveManager.flush(state);
      return;
    }
    if (!hiddenAt) return;
    const hiddenDuration = Math.max(0, Date.now() - hiddenAt);
    hiddenAt = 0;
    if (freePlaySession) freePlaySession.phaseStartedAt += hiddenDuration;
    if (dailyPlaySession) dailyPlaySession.startedAt += hiddenDuration;
    if (luxorCampaignSession) luxorCampaignSession.startedAt += hiddenDuration;
  }
  function flushBeforePageExit() {
    snapshotActiveClock();
    saveManager.flush(state);
  }

  $$('[data-view]').forEach((button)=>button.addEventListener("click",()=>switchView(button.dataset.view)));
  elements.welcomeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = cleanPlayerName(elements.welcomeName.value);
    if (!name) { elements.welcomeName.focus(); return; }
    state.playerName = name; state.notes.dono = name; saveState(); closeWelcome(); renderInteractiveLayer(); renderRankingProfile(); queuePlayerSync(80);
    showToast(`Bem-vindo, ${name}!`);
  });
  $$('[data-ranking-mode]').forEach((button) => button.addEventListener("click", () => setRankingMode(button.dataset.rankingMode)));
  elements.rankingGameSelect.addEventListener("change", () => setRankingGame(elements.rankingGameSelect.value));
  elements.refreshRanking.addEventListener("click", loadRanking);
  $("#brandButton").addEventListener("click",handleBrandClick);
  elements.previousPage.addEventListener("click",()=>setPage(state.page-1));elements.nextPage.addEventListener("click",()=>setPage(state.page+1));
  elements.albumPage.addEventListener("load",()=>{elements.pageLoading.hidden=true;elements.albumPage.classList.add("is-loaded");});
  $("#fullscreenPage").addEventListener("click",toggleFullscreen);$("#exitFullscreen").addEventListener("click",toggleFullscreen);
  $("#nextChallenge").addEventListener("click",continueCollection);$("#continueChallenge").addEventListener("click",continueCollection);$("#inventoryChooseChallenge").addEventListener("click",()=>switchView("challenges"));$("#progressChip").addEventListener("click",()=>switchView("inventory"));
  $("#cancelPaste").addEventListener("click",cancelPlacement);$("#closePuzzle").addEventListener("click",closePuzzle);
  elements.puzzleGuideButton.addEventListener("click",()=>togglePuzzleGuide());
  elements.puzzleGuideToggle.addEventListener("change",()=>togglePuzzleGuide(elements.puzzleGuideToggle.checked));
  elements.restartPuzzle.addEventListener("click",restartCurrentPuzzle);
  elements.puzzleModal.addEventListener("click",(event)=>{if(event.target===elements.puzzleModal)closePuzzle();});
  $("#dailyRefresh").addEventListener("click", async () => {
    await fetchDailyServerContext();
    await loadDailyLeaderboard();
    renderDaily();
  });
  elements.claimDailyReward.addEventListener("click", claimDailyReward);
  elements.dailyLeaderboardSelect.addEventListener("change", () => {
    selectedDailyLeaderboardSlot = elements.dailyLeaderboardSelect.value;
    loadDailyLeaderboard();
  });
  $("#openLuxorLoadout").addEventListener("click", openLuxorLoadout);
  $("#closeLuxorLoadout").addEventListener("click", closeLuxorLoadout);
  $("#saveLuxorLoadout").addEventListener("click", saveLuxorLoadout);
  elements.luxorLoadoutModal.addEventListener("click", (event) => { if (event.target === elements.luxorLoadoutModal) closeLuxorLoadout(); });
  $("#settingsButton").addEventListener("click", openSettings);
  $("#closeSettings").addEventListener("click", closeSettings);
  elements.settingsModal.addEventListener("click", (event) => { if (event.target === elements.settingsModal) closeSettings(); });
  $("#exportSave").addEventListener("click", exportSaveFile);
  $("#importSave").addEventListener("click", () => elements.importSaveFile.click());
  elements.importSaveFile.addEventListener("change", () => inspectImportedSave(elements.importSaveFile.files?.[0]));
  $("#confirmImportSave").addEventListener("click", confirmImportedSave);
  $("#cancelImportSave").addEventListener("click", () => {
    pendingImportedSave = null;
    elements.importSummary.hidden = true;
  });
  $("#syncSaveNow").addEventListener("click", () => syncCloudSave());
  ["reducedMotionSetting", "highContrastSetting", "aimAssistSetting"].forEach((id) => {
    $(`#${id}`).addEventListener("change", (event) => {
      if (id === "reducedMotionSetting") state.reducedMotion = event.target.checked;
      if (id === "highContrastSetting") state.highContrast = event.target.checked;
      if (id === "aimAssistSetting") state.accessibilityAimAssist = event.target.checked;
      applyAccessibilitySettings();
      saveState(true);
    });
  });
  ["continueInterrupted", "continueInterruptedSettings"].forEach((id) => $(`#${id}`).addEventListener("click", () => resumeInterrupted(false)));
  ["restartInterrupted", "restartInterruptedSettings"].forEach((id) => $(`#${id}`).addEventListener("click", () => resumeInterrupted(true)));
  ["discardInterrupted", "discardInterruptedSettings"].forEach((id) => $(`#${id}`).addEventListener("click", discardInterrupted));
  $("#keepDeviceSave").addEventListener("click", () => resolveCloudConflict("device"));
  $("#useCloudSave").addEventListener("click", () => resolveCloudConflict("cloud"));
  $("#mergeCloudSave").addEventListener("click", () => resolveCloudConflict("merge"));
  window.addEventListener("online", () => {
    state.cloudSync.status = state.cloudSync.pending ? "local" : state.cloudSync.status;
    updateCloudStatus();
    queueCloudSync(250);
  });
  window.addEventListener("offline", () => {
    state.cloudSync.status = "offline";
    updateCloudStatus();
  });
  document.addEventListener("visibilitychange", handleDocumentVisibility);
  window.addEventListener("pagehide", flushBeforePageExit);
  $("#closeProfile").addEventListener("click", closeProfile);
  $("#profileContinue").addEventListener("click", closeProfile);
  elements.profileModal.addEventListener("click", (event) => { if (event.target === elements.profileModal) closeProfile(); });
  $$('[data-profile-field]', elements.profileModal).forEach((button) => button.addEventListener("click", () => toggleProfileField(button.dataset.profileField)));
  $$('[data-challenge-filter]').forEach((button)=>button.addEventListener("click",()=>{currentFilter=button.dataset.challengeFilter; $$('[data-challenge-filter]').forEach((item)=>item.classList.toggle("is-active",item===button));renderChallenges();}));
  $$('[data-inventory-filter]').forEach((button)=>button.addEventListener("click",()=>{currentInventoryFilter=button.dataset.inventoryFilter; $$('[data-inventory-filter]').forEach((item)=>item.classList.toggle("is-active",item===button));renderInventory();}));
  $$('[data-free-difficulty]').forEach((button)=>button.addEventListener("click",()=>{currentFreeDifficulty=button.dataset.freeDifficulty;renderFreeMode();}));
  elements.musicButton.addEventListener("click",toggleMusicControl);elements.musicVolume.addEventListener("input",()=>applyVolume(elements.musicVolume.value));
  document.addEventListener("pointerdown", ensureMusicPlaying, { once: true });
  document.addEventListener("click",(event)=>{if(!$("#musicControl").contains(event.target))elements.volumePopover.hidden=true;});
  $("#closeTextStyle").addEventListener("click", closeTextStyle);
  elements.textStyleModal.addEventListener("click", (event) => { if (event.target === elements.textStyleModal) closeTextStyle(); });
  elements.textFont.addEventListener("change", () => saveTextStyle({ font: elements.textFont.value }));
  elements.textColor.addEventListener("input", () => saveTextStyle({ color: elements.textColor.value }));
  $$("[data-color]", $("#textColorOptions")).forEach((button) => button.addEventListener("click", () => saveTextStyle({ color: button.dataset.color })));
  $("#resetTextStyle").addEventListener("click", () => {
    const field = currentWritingField();
    if (!field) return;
    delete state.noteStyles[field.key];
    saveState();
    const textarea = $(`[data-field-key="${field.key}"]`, elements.interactiveLayer);
    const standard = defaultTextStyle(field);
    if (textarea) { textarea.style.fontFamily = standard.font; textarea.style.color = standard.color; }
    updateTextStyleControls(field);
  });
  $("#closeSecret").addEventListener("click", closeSecret);
  elements.secretModal.addEventListener("click", (event) => { if (event.target === elements.secretModal) closeSecret(); });
  elements.secretForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const phrase = elements.secretInput.value.trim().toLocaleLowerCase("pt-BR");
    if (phrase !== "sem tempo irmão") return closeSecret();
    state.unlocked = Array.from({ length: TOTAL }, (_, index) => index + 1);
    saveState();
    renderAll();
    closeSecret();
    switchView("inventory");
    showToast("Todas as 64 figurinhas foram liberadas para colar.");
  });
  $("#resetButton").addEventListener("click",()=>{if(!window.confirm("Quer mesmo apagar o progresso, os textos e recomeçar o álbum?"))return;state=defaultState();saveState();cancelPlacement();setPage(1);switchView("album");renderAll();showWelcome();showToast("Álbum reiniciado.");});
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.welcomeModal.hidden) {
      if (!elements.cloudConflictModal.hidden) return;
      if (!elements.luxorLoadoutModal.hidden) closeLuxorLoadout();
      else if (!elements.settingsModal.hidden) closeSettings();
      else if (!elements.profileModal.hidden) closeProfile();
      else if (!elements.secretModal.hidden) closeSecret();
      else if (!elements.textStyleModal.hidden) closeTextStyle();
      else if (!elements.puzzleModal.hidden) closePuzzle();
      else if (elements.pageWrap.classList.contains("is-fullscreen")) toggleFullscreen();
    }
    const noModal = elements.welcomeModal.hidden && elements.profileModal.hidden && elements.puzzleModal.hidden &&
      elements.secretModal.hidden && elements.textStyleModal.hidden && elements.settingsModal.hidden &&
      elements.luxorLoadoutModal.hidden && elements.cloudConflictModal.hidden && elements.recoveryModal.hidden;
    if (noModal && currentView === "album" && !$("textarea:focus") && !$("input:focus")) {
      if (event.key === "ArrowLeft") setPage(state.page - 1);
      if (event.key === "ArrowRight") setPage(state.page + 1);
    }
  });

  buildPageStrip();
  applyVolume(state.volume);
  applyAccessibilitySettings();
  renderAll();
  initializePlayerAndRanking();
  renderInterruptedSession();
  updateCloudStatus();
  if (state.activeSession) window.setTimeout(showRecoveryIfNeeded, state.playerName ? 120 : 450);
  if (supabaseConfigured() && navigator.onLine) {
    fetchDailyServerContext();
    queueCloudSync(900);
  }
  if (pendingSaveNotice) window.setTimeout(() => showToast(pendingSaveNotice), 300);
})();
