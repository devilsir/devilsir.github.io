(() => {
  "use strict";

  const TOTAL = 64;
  const STORAGE_KEY = "recordacoes-familia-album-2026-v1";
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
  const FREE_PHASES = 3;
  const FREE_SCORE_BASE_TIMES = { numbers: 90000, image: 110000, memory: 90000, snake: 75000, tetris: 150000, luxor: 180000, simon: 95000, lights: 85000 };
  const FREE_DIFFICULTY_MULTIPLIERS = [1, 1.35, 1.8, 2.45, 3.25];
  const FREE_PHASE_MULTIPLIERS = [1, 1.18, 1.42];
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
    return { page: 1, unlocked: [], placed: [], notes: {}, noteStyles: {}, profiles: {}, freeRecords: {}, freeGameTotals: {}, playerName: "", volume: DEFAULT_VOLUME, guideMode: false };
  }
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return defaultState();
      const valid = (values) => [...new Set(Array.isArray(values) ? values.map(Number) : [])].filter((id) => id >= 1 && id <= TOTAL);
      const unlocked = valid(saved.unlocked);
      const placed = valid(saved.placed).filter((id) => unlocked.includes(id));
      return {
        page: clamp(Number(saved.page) || 1, 1, 12), unlocked, placed,
        notes: saved.notes && typeof saved.notes === "object" ? saved.notes : {},
        noteStyles: saved.noteStyles && typeof saved.noteStyles === "object" ? saved.noteStyles : {},
        profiles: saved.profiles && typeof saved.profiles === "object" ? saved.profiles : {},
        freeRecords: saved.freeRecords && typeof saved.freeRecords === "object" ? saved.freeRecords : {},
        freeGameTotals: saved.freeGameTotals && typeof saved.freeGameTotals === "object" ? saved.freeGameTotals : {},
        playerName: String(saved.playerName || saved.notes?.dono || "").trim().slice(0, 32),
        volume: clamp(Number(saved.volume ?? DEFAULT_VOLUME), 0, 100),
        guideMode: Boolean(saved.guideMode)
      };
    } catch { return defaultState(); }
  }
  let state = loadState();
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
  let rankingRequestId = 0;
  let scoreSyncTimer = null;
  let supabaseLoadPromise = null;

  const elements = {
    albumView: $("#albumView"), challengesView: $("#challengesView"), freeView: $("#freeView"), rankingView: $("#rankingView"), inventoryView: $("#inventoryView"), albumPage: $("#albumPage"), pageWrap: $("#pageWrap"),
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
    rankingPlayerAvatar: $("#rankingPlayerAvatar"), rankingPlayerName: $("#rankingPlayerName"), rankingPlayerStickers: $("#rankingPlayerStickers"), rankingPlayerPoints: $("#rankingPlayerPoints"),
    rankingStatus: $("#rankingStatus"), rankingPodium: $("#rankingPodium"), rankingList: $("#rankingList"), rankingGamePicker: $("#rankingGamePicker"), rankingGameSelect: $("#rankingGameSelect"), refreshRanking: $("#refreshRanking")
  };

  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function cleanPlayerName(value) {
    return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 32);
  }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }
  function playerInitials(name = state.playerName) {
    const parts = cleanPlayerName(name).split(" ").filter(Boolean);
    return (parts.length ? `${parts[0][0]}${parts.length > 1 ? parts.at(-1)[0] : ""}` : "RF").toLocaleUpperCase("pt-BR");
  }
  function totalFreePoints() {
    return Object.values(state.freeGameTotals || {}).reduce((total, record) => total + (Number(record?.bestPoints) || 0), 0);
  }
  function renderRankingProfile() {
    if (!elements.rankingPlayerName) return;
    const name = cleanPlayerName(state.playerName) || "Jogador";
    elements.rankingPlayerName.textContent = name;
    elements.rankingPlayerAvatar.textContent = playerInitials(name);
    elements.rankingPlayerStickers.textContent = String(state.unlocked.length);
    elements.rankingPlayerPoints.textContent = totalFreePoints().toLocaleString("pt-BR");
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
      script.onload = () => window.supabase?.createClient ? resolve(window.supabase) : reject(new Error("Biblioteca indisponível"));
      script.onerror = () => reject(new Error("Não foi possível carregar o ranking"));
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
        phaseDurationsMs: run.phaseDurations, phasesCompleted: FREE_PHASES, unlockedCount: state.unlocked.length
      } });
      if (error) throw error;
      if (currentView === "ranking" && rankingMode === "games" && rankingGame === run.gameKey) loadRanking();
      return true;
    } catch { return false; }
  }
  function rankingMetric(entry) {
    return rankingMode === "stickers" ? Number(entry.unlocked_count || 0) : Number(entry.points || 0);
  }
  function rankingMetricLabel(entry) {
    if (rankingMode === "stickers") return `${rankingMetric(entry)} de ${TOTAL} figurinhas`;
    return `${rankingMetric(entry).toLocaleString("pt-BR")} pontos`;
  }
  function rankingSubLabel(entry) {
    if (rankingMode === "stickers") return `${Number(entry.total_free_points || 0).toLocaleString("pt-BR")} pontos nos desafios livres`;
    const difficulty = freeDifficulty(entry.difficulty_key);
    return `${difficulty.label} · ${formatDuration(Number(entry.duration_ms))}`;
  }
  function renderRankingEntries(entries) {
    elements.rankingPodium.replaceChildren();
    elements.rankingList.replaceChildren();
    if (!entries.length) {
      elements.rankingList.innerHTML = '<div class="ranking-empty">Ainda não há recordistas nesta categoria.</div>';
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
    return { user_id: "local", display_name: cleanPlayerName(state.playerName) || "Jogador", points: Number(record.bestPoints || 0), duration_ms: Number(record.bestMs || 0), difficulty_key: record.difficultyKey || "normal" };
  }
  async function loadRanking() {
    renderRankingProfile();
    const requestId = ++rankingRequestId;
    elements.rankingStatus.textContent = "Carregando recordistas...";
    elements.rankingPodium.replaceChildren();
    elements.rankingList.replaceChildren();
    if (!supabaseConfigured()) {
      const local = localRankingEntry();
      elements.rankingStatus.textContent = "O ranking online está indisponível no momento.";
      renderRankingEntries(rankingMode === "games" && !local.points ? [] : [local]);
      return;
    }
    try {
      const client = await ensureScoreClient();
      if (!client || requestId !== rankingRequestId) return;
      await syncPlayerProgress();
      let query;
      if (rankingMode === "stickers") query = client.from("player_profiles").select("user_id,display_name,unlocked_count,total_free_points,updated_at").order("unlocked_count", { ascending: false }).order("updated_at", { ascending: true }).limit(20);
      else query = client.from("free_game_scores").select("user_id,display_name,game_key,difficulty_key,points,duration_ms,updated_at").eq("game_key", rankingGame).order("points", { ascending: false }).order("duration_ms", { ascending: true }).limit(20);
      const { data, error } = await query;
      if (error) throw error;
      if (requestId !== rankingRequestId) return;
      elements.rankingStatus.textContent = rankingMode === "stickers" ? "Mais figurinhas liberadas" : `Melhores pontuações em ${PUZZLE_TYPES.find((game) => game.key === rankingGame)?.title || "minijogo"}`;
      renderRankingEntries(Array.isArray(data) ? data : []);
    } catch {
      if (requestId !== rankingRequestId) return;
      elements.rankingStatus.textContent = "Não foi possível atualizar o ranking agora.";
      const local = localRankingEntry();
      renderRankingEntries(rankingMode === "games" && !local.points ? [] : [local]);
    }
  }
  function setRankingMode(mode) {
    rankingMode = mode === "games" ? "games" : "stickers";
    $$('[data-ranking-mode]').forEach((button) => {
      const selected = button.dataset.rankingMode === rankingMode;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    elements.rankingGamePicker.hidden = rankingMode !== "games";
    loadRanking();
  }
  function initializePlayerAndRanking() {
    state.playerName = cleanPlayerName(state.playerName || state.notes.dono);
    if (state.playerName) state.notes.dono = state.playerName;
    saveState();
    renderRankingProfile();
    elements.rankingGameSelect.replaceChildren(...RANKING_GAMES.map((game) => {
      const option = document.createElement("option"); option.value = game.key; option.textContent = game.title; return option;
    }));
    elements.rankingGameSelect.value = rankingGame;
    if (!state.playerName) showWelcome();
    else { queuePlayerSync(120); if (currentView === "ranking") loadRanking(); }
  }
  function guideAvailableFor(challenge = currentPuzzleChallenge) { return Boolean(challenge && challenge.key !== "luxor"); }
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
    const settings = FREE_SETTINGS[challenge.key];
    if (!challenge.freeMode || !settings) return null;
    const base = { ...settings[freeRank(challenge) - 1] };
    const phase = clamp(Number(challenge.freePhase) || 1, 1, FREE_PHASES);
    const step = phase - 1;
    if (challenge.key === "numbers") base.shuffle = Math.round(base.shuffle * (1 + step * .24));
    if (challenge.key === "image") { base.shuffle = Math.round(base.shuffle * (1 + step * .22)); base.hints = Math.max(0, Number(base.hints || 0) - step); }
    if (challenge.key === "memory") { base.pairs = Math.min(12, base.pairs + step); base.preview = Math.max(0, Number(base.preview || 0) - step * 180); }
    if (challenge.key === "snake") { base.target += step * Math.max(2, freeRank(challenge)); base.interval = Math.max(55, Math.round(base.interval * (1 - step * .07))); base.obstacles += step * Math.max(1, freeRank(challenge) - 1); }
    if (challenge.key === "tetris") { base.target = Math.round(base.target * (1 + step * .2)); base.interval = Math.max(170, Math.round(base.interval * (1 - step * .07))); }
    if (challenge.key === "simon") { base.rounds += step; if (phase === FREE_PHASES) base.length += 1; }
    if (challenge.key === "lights") base.scramble += step * Math.max(2, freeRank(challenge));
    return base;
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
      if (key === "numbers") return `Objetivo: ordene os números de 1 a ${free.size * free.size - 1} no tabuleiro ${free.size} × ${free.size}.`;
      if (key === "image") return `Objetivo: reconstrua a figurinha em um mosaico ${free.size} × ${free.size}.`;
      if (key === "memory") return `Objetivo: encontre ${free.pairs} pares com o menor número de tentativas.`;
      if (key === "snake") return `Objetivo: pegue ${free.target} corações sem tocar nas paredes, no corpo ou nos obstáculos.`;
      if (key === "tetris") return `Objetivo: alcance ${free.target} pontos e use linhas múltiplas para acelerar.`;
      if (key === "simon") return `Objetivo: vença ${free.rounds} rodadas; a sequência começa com ${free.length} sinais.`;
      if (key === "lights") return `Objetivo: acenda as ${free.size * free.size} luzes do tabuleiro ${free.size} × ${free.size}.`;
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
      if (isOwnerField) { textarea.type = "text"; textarea.maxLength = 32; textarea.autocomplete = "name"; textarea.spellcheck = false; }
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
      elements.interactiveLayer.append(textarea);

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
    return {
      ...type, id, level: clamp(difficulty.level + safePhase - 1, 1, 8), freeMode: true,
      freeDifficultyKey: difficulty.key, freeDifficultyRank: difficulty.rank, freeDifficultyLabel: difficulty.label,
      freePhase: safePhase, freeTotalPhases: FREE_PHASES
    };
  }
  function renderFreeMode() {
    if (!elements.freeGameGrid) return;
    const difficulty = freeDifficulty();
    elements.freeDifficultyName.textContent = difficulty.label;
    elements.freeDifficultyDescription.textContent = `${difficulty.description} Cada modalidade possui 3 fases progressivas.`;
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
      const card = document.createElement("article");
      card.className = `free-game-card free-game-${type.key}`;
      card.style.setProperty("--game-accent", detail.accent);
      card.style.setProperty("--difficulty-accent", difficulty.color);
      card.innerHTML = `
        <div class="free-card-top">
          <span class="free-game-icon" aria-hidden="true">${detail.icon}</span>
          <span class="free-level-badge">${difficulty.label}</span>
          <img src="${stickerSrc(challenge.id)}" alt="${stickerName(challenge.id)}" loading="lazy">
        </div>
        <div class="free-card-body">
          <span class="free-game-tag">${detail.tagline}</span>
          <h3>${type.title}</h3>
          <p>Supere 3 fases progressivas. ${objectiveFor(challenge).replace("Objetivo: ", "A primeira começa com: ")}</p>
          <div class="free-phase-track" aria-label="Três fases"><span></span><span></span><span></span></div>
          <div class="free-phase-caption"><span>Fase 1</span><span>Fase 2</span><span>Fase 3</span></div>
          <div class="free-record-row is-score">
            <span><small>Melhor pontuação</small><strong>${Number(record.bestPoints || 0).toLocaleString("pt-BR") || "—"}</strong></span>
            <span><small>Melhor tempo</small><strong>${formatDuration(Number(record.bestMs))}</strong></span>
          </div>
          <button class="free-play-button" type="button"><span>Jogar 3 fases</span><i aria-hidden="true">→</i></button>
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
    return Math.max(0, Number(session.completedMs) || 0) + Math.max(0, Date.now() - Number(session.phaseStartedAt || Date.now()));
  }
  function updateFreePuzzleCopy(challenge = currentPuzzleChallenge) {
    if (!freePlaySession || !challenge) return;
    const difficulty = freeDifficulty(freePlaySession.difficultyKey);
    elements.puzzleEyebrow.textContent = `Desafio Livre · ${difficulty.label} · Fase ${freePlaySession.phase} de ${FREE_PHASES}`;
    elements.puzzleTitle.textContent = challenge.title;
    elements.puzzleSticker.src = stickerSrc(challenge.id);
    elements.puzzleSticker.alt = `${stickerName(challenge.id)}, figurinha de apoio do desafio`;
    elements.puzzleDescription.textContent = `${challenge.description} Complete as três fases para registrar sua pontuação em ${challenge.title}.`;
    elements.puzzleObjective.textContent = objectiveFor(challenge);
  }
  function openFreePuzzle(gameKey, difficultyKey = currentFreeDifficulty) {
    cleanupPuzzle();
    const difficulty = freeDifficulty(difficultyKey);
    const challenge = buildFreeChallenge(gameKey, difficulty.key, 1);
    currentPuzzleId = null;
    currentPuzzleChallenge = challenge;
    freePlaySession = {
      gameKey, difficultyKey: difficulty.key, stickerId: challenge.id,
      phase: 1, totalPhases: FREE_PHASES, phaseStartedAt: Date.now(), completedMs: 0,
      points: 0, phaseDurations: [], phasePoints: []
    };
    updateFreePuzzleCopy(challenge);
    elements.puzzleStatus.textContent = "Fase 1 valendo — o cronômetro começou!";
    elements.puzzleModal.dataset.difficulty = difficulty.key;
    elements.puzzleModal.hidden = false;
    document.documentElement.classList.add("puzzle-open");
    document.body.style.overflow = "hidden";
    initPuzzle(challenge);
  }
  function advanceFreePhase() {
    const session = freePlaySession;
    if (!session || session.phase >= FREE_PHASES) return;
    session.phase += 1;
    session.phaseStartedAt = Date.now();
    const challenge = buildFreeChallenge(session.gameKey, session.difficultyKey, session.phase);
    currentPuzzleChallenge = challenge;
    updateFreePuzzleCopy(challenge);
    elements.puzzleStatus.textContent = `Fase ${session.phase} valendo!`;
    initPuzzle(challenge);
  }
  function completeFreePuzzle() {
    const session = freePlaySession;
    if (!session) return;
    const phaseElapsed = Math.max(100, Date.now() - session.phaseStartedAt);
    const earned = calculateFreePhasePoints(session.gameKey, session.difficultyKey, session.phase, phaseElapsed);
    session.completedMs += phaseElapsed;
    session.phaseDurations.push(phaseElapsed);
    session.phasePoints.push(earned);
    session.points += earned;
    const difficulty = freeDifficulty(session.difficultyKey);
    elements.restartPuzzle.hidden = true;
    elements.puzzleGuideControl.hidden = true;
    clearPuzzleGuideTarget();

    if (session.phase < FREE_PHASES) {
      elements.puzzleStatus.textContent = `Fase ${session.phase} concluída!`;
      elements.puzzleStage.innerHTML = `<div class="free-phase-success-card" style="--phase-accent:${difficulty.color}">
        <span class="free-phase-number">${session.phase}/3</span>
        <span class="eyebrow">Fase concluída</span>
        <h3>Boa! A próxima apertou.</h3>
        <p>Você venceu esta etapa em <strong>${formatDuration(phaseElapsed)}</strong>. A dificuldade cresce, e os pontos também.</p>
        <div class="free-phase-score"><span><small>Pontos da fase</small><b>+${earned.toLocaleString("pt-BR")}</b></span><span><small>Total até agora</small><b>${session.points.toLocaleString("pt-BR")}</b></span></div>
        <div class="free-win-actions"><button class="primary-button" id="nextFreePhase" type="button">Jogar fase ${session.phase + 1}</button><button class="secondary-button" id="leaveFreePhase" type="button">Sair</button></div>
      </div>`;
      $("#nextFreePhase").addEventListener("click", advanceFreePhase);
      $("#leaveFreePhase").addEventListener("click", closePuzzle);
      return;
    }

    const totalElapsed = session.completedMs;
    const key = freeRecordKey(session.gameKey, session.difficultyKey);
    const previous = state.freeRecords[key] || {};
    const previousPoints = Number(previous.bestPoints) || 0;
    const previousTime = Number(previous.bestMs) || Infinity;
    const isRecord = session.points > previousPoints || (session.points === previousPoints && totalElapsed < previousTime);
    state.freeRecords[key] = {
      wins: (Number(previous.wins) || 0) + 1,
      bestPoints: isRecord ? session.points : previousPoints,
      bestMs: isRecord ? totalElapsed : (Number(previous.bestMs) || totalElapsed),
      lastPoints: session.points, lastMs: totalElapsed
    };
    const gamePrevious = state.freeGameTotals[session.gameKey] || {};
    if (session.points > Number(gamePrevious.bestPoints || 0) || (session.points === Number(gamePrevious.bestPoints || 0) && totalElapsed < Number(gamePrevious.bestMs || Infinity))) {
      state.freeGameTotals[session.gameKey] = { bestPoints: session.points, bestMs: totalElapsed, difficultyKey: session.difficultyKey };
    }
    saveState();
    renderFreeMode();
    renderRankingProfile();
    queuePlayerSync(120);
    submitOnlineFreeScore({
      gameKey: session.gameKey, difficultyKey: session.difficultyKey,
      phaseDurations: [...session.phaseDurations], points: session.points, durationMs: totalElapsed
    });
    elements.puzzleStatus.textContent = isRecord ? "Novo recorde pessoal!" : "Três fases concluídas!";
    elements.puzzleStage.innerHTML = `<div class="free-success-card" style="--win-accent:${difficulty.color}">
      <div class="free-confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, index) => `<i style="--i:${index}"></i>`).join("")}</div>
      <span class="free-win-emblem">✦</span>
      <span class="free-win-label">${difficulty.label} · 3 fases concluídas</span>
      <h3>${isRecord ? "Novo recorde!" : "Mandou muito bem!"}</h3>
      <p>Você venceu <strong>${currentPuzzleChallenge.title}</strong> com <strong>${session.points.toLocaleString("pt-BR")} pontos</strong> em <strong>${formatDuration(totalElapsed)}</strong>.</p>
      <div class="free-win-stats"><span><small>Melhor pontuação</small><b>${state.freeRecords[key].bestPoints.toLocaleString("pt-BR")}</b></span><span><small>Tempo da rodada</small><b>${formatDuration(totalElapsed)}</b></span></div>
      <div class="free-win-actions"><button class="primary-button" id="replayFreePuzzle" type="button">Jogar novamente</button><button class="secondary-button" id="leaveFreePuzzle" type="button">Escolher outro</button></div>
    </div>`;
    $("#replayFreePuzzle").addEventListener("click", () => openFreePuzzle(session.gameKey, session.difficultyKey));
    $("#leaveFreePuzzle").addEventListener("click", closePuzzle);
  }

  function renderAll() { updateProgress(); renderPage(); renderMiniInventory(); renderChallenges(); renderInventory(); renderFreeMode(); renderRankingProfile(); }

  function switchView(view) {
    currentView = view;
    elements.albumView.classList.toggle("is-active", view === "album");
    elements.challengesView.classList.toggle("is-active", view === "challenges");
    elements.freeView.classList.toggle("is-active", view === "free");
    elements.rankingView.classList.toggle("is-active", view === "ranking");
    elements.inventoryView.classList.toggle("is-active", view === "inventory");
    $$('[data-view]').forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (view === "challenges") renderChallenges();
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
  function closePuzzle() { cleanupPuzzle(); currentPuzzleId = null; currentPuzzleChallenge = null; freePlaySession = null; delete elements.puzzleModal.dataset.difficulty; delete elements.puzzleModal.dataset.game; elements.puzzleModal.hidden = true; syncPuzzleGuideUI(null); document.documentElement.classList.remove("puzzle-open"); document.body.style.overflow = ""; }
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
  function completePuzzle() {
    cleanupPuzzle();
    if (freePlaySession) return completeFreePuzzle();
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
    const free = settingsFor(challenge);
    const size = free?.size || (useImage ? 3 : 4);
    const shuffleMoves = free?.shuffle || 24 + challenge.level * 3;
    let moves = 0;
    let hints = useImage ? (free?.hints ?? 2) : 0;
    const pendingTimers = new Set();
    let tiles = Array.from({ length: size * size }, (_, index) => index);
    const blankTrail = [0];
    const neighbors = (blank) => {
      const row = Math.floor(blank / size), col = blank % size, result = [];
      if (row > 0) result.push(blank - size); if (row < size - 1) result.push(blank + size);
      if (col > 0) result.push(blank - 1); if (col < size - 1) result.push(blank + 1); return result;
    };
    let previous = -1;
    for (let move = 0; move < shuffleMoves; move += 1) {
      const blank = tiles.indexOf(0); const choices = neighbors(blank).filter((index) => index !== previous);
      const chosen = choices[Math.floor(Math.random() * choices.length)]; previous = blank;
      [tiles[blank], tiles[chosen]] = [tiles[chosen], tiles[blank]];
      blankTrail.push(chosen);
    }
    if (tiles.every((value, index) => value === index)) {
      const blank = tiles.indexOf(0), chosen = neighbors(blank)[0];
      [tiles[blank], tiles[chosen]] = [tiles[chosen], tiles[blank]];
      blankTrail.push(chosen);
    }
    const wrap = document.createElement("div"); wrap.className = "slider-wrap";
    wrap.innerHTML = `<div class="game-hud slider-hud"><span>Movimentos: <b id="sliderMoves">0</b></span><span>${size} × ${size}</span></div>`;
    const board = document.createElement("div"); board.className = "slide-grid"; board.style.setProperty("--size", String(size));
    wrap.append(board);
    if (useImage) {
      const hint = document.createElement("button"); hint.type = "button"; hint.className = "slider-hint secondary-button";
      hint.innerHTML = `⌕ Ver imagem <span>(${hints})</span>`;
      hint.disabled = hints <= 0;
      hint.addEventListener("click", () => {
        if (hints <= 0 || board.classList.contains("is-previewing")) return;
        hints -= 1; hint.querySelector("span").textContent = `(${hints})`; hint.disabled = hints <= 0;
        const preview = document.createElement("img"); preview.className = "slider-preview"; preview.src = stickerSrc(challenge.id); preview.alt = `Imagem completa de ${stickerName(challenge.id)}`;
        board.classList.add("is-previewing"); board.append(preview);
        const timer = window.setTimeout(() => { preview.remove(); board.classList.remove("is-previewing"); pendingTimers.delete(timer); refreshPuzzleGuide(); }, 900);
        pendingTimers.add(timer);
      });
      wrap.append(hint);
    }
    elements.puzzleStage.append(wrap);
    const movesEl = $("#sliderMoves", wrap);
    const solved = () => tiles.every((value, index) => value === index);
    const refreshGuide = () => {
      if (blankTrail.length < 2 || solved()) return;
      const targetIndex = blankTrail[blankTrail.length - 2];
      markPuzzleGuideTarget(board.children[targetIndex], "Clique na peça destacada");
    };
    const render = () => {
      board.replaceChildren();
      tiles.forEach((value, index) => {
        const button = document.createElement("button"); button.type = "button"; button.className = `slide-tile${value === 0 ? " is-empty" : ""}${useImage ? " image-tile" : ""}`;
        if (!useImage) button.textContent = value ? String(value) : "";
        else if (value) {
          const original = value; const row = Math.floor(original / size), col = original % size;
          button.style.backgroundImage = `url(${stickerSrc(challenge.id)})`;
          button.style.backgroundSize = `${size * 100}% ${size * 100}%`;
          button.style.backgroundPosition = `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`;
        }
        button.addEventListener("click", () => {
          const blank = tiles.indexOf(0); if (!neighbors(blank).includes(index)) return;
          [tiles[blank], tiles[index]] = [tiles[index], tiles[blank]];
          if (blankTrail.length > 1 && index === blankTrail[blankTrail.length - 2]) blankTrail.pop();
          else blankTrail.push(index);
          moves += 1; movesEl.textContent = String(moves); render();
          if (solved()) { const timer = window.setTimeout(completePuzzle, 350); pendingTimers.add(timer); }
        }); board.append(button);
      });
      refreshPuzzleGuide();
    };
    render();
    setPuzzleGuide({ refresh: refreshGuide });
    elements.puzzleStatus.textContent = useImage ? `Reconstrua ${stickerName(challenge.id)} deslizando as peças vizinhas.` : `Ordene de 1 a ${size * size - 1}; o espaço vazio termina no canto superior esquerdo.`;
    puzzleCleanup = () => pendingTimers.forEach(clearTimeout);
  }

  function initMemory(challenge) {
    const free = settingsFor(challenge);
    const icons = ["♡", "⌂", "✿", "★", "☀", "♫", "✦", "☕", "☾", "⚑", "◆", "☂"];
    const pairs = free?.pairs || 4 + (challenge.level % 3);
    const deck = shuffle([...icons.slice(0, pairs), ...icons.slice(0, pairs)]);
    const pendingTimers = new Set();
    let open = [], matched = 0, attempts = 0, combo = 0, locked = Boolean(free?.preview);
    const wrap = document.createElement("div"); wrap.className = "memory-wrap";
    wrap.innerHTML = `<div class="game-hud"><span>Tentativas: <b id="memoryAttempts">0</b></span><span id="memoryCombo">Combo: —</span><span>Pares: <b id="memoryPairs">0</b>/${pairs}</span></div>`;
    const board = document.createElement("div"); board.className = "memory-board"; board.style.setProperty("--memory-cols", String(pairs >= 12 ? 6 : pairs >= 10 ? 5 : 4));
    wrap.append(board); elements.puzzleStage.append(wrap);
    const attemptsEl = $("#memoryAttempts", wrap), pairsEl = $("#memoryPairs", wrap), comboEl = $("#memoryCombo", wrap);
    const later = (fn, delay) => { const timer = window.setTimeout(() => { pendingTimers.delete(timer); fn(); }, delay); pendingTimers.add(timer); };
    const refreshGuide = () => {
      if (locked || matched === pairs) return;
      const unmatched = deck.map((_, index) => index).filter((index) => !board.children[index]?.classList.contains("is-matched"));
      let targetIndex = null;
      if (open.length === 1) targetIndex = unmatched.find((index) => index !== open[0] && deck[index] === deck[open[0]]);
      else if (!open.length) {
        const first = unmatched.find((index, position) => unmatched.slice(position + 1).some((other) => deck[other] === deck[index]));
        targetIndex = first;
      }
      markPuzzleGuideTarget(board.children[targetIndex], open.length ? "Ache o par destacado" : "Comece pela carta destacada");
    };
    deck.forEach((icon, index) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "memory-card"; button.dataset.icon = icon; button.setAttribute("aria-label", `Carta ${index + 1}`);
      if (free?.preview) button.classList.add("is-open", "is-preview");
      button.addEventListener("click", () => {
        if (locked || open.includes(index) || button.classList.contains("is-matched")) return;
        button.classList.add("is-open"); open.push(index); refreshPuzzleGuide();
        if (open.length < 2) return;
        locked = true; clearPuzzleGuideTarget(); attempts += 1; attemptsEl.textContent = String(attempts); const [a, b] = open;
        if (deck[a] === deck[b]) {
          combo += 1;
          later(() => {
            [a,b].forEach((i) => { board.children[i].classList.remove("is-open"); board.children[i].classList.add("is-matched"); });
            matched += 1; pairsEl.textContent = String(matched); open = []; locked = false;
            comboEl.textContent = combo >= 2 ? `Combo ×${combo}!` : "Combo: 1"; comboEl.classList.toggle("is-hot", combo >= 2);
            elements.puzzleStatus.textContent = `${matched} de ${pairs} pares — ${combo >= 2 ? `combo ×${combo}!` : "continue"}`;
            if (matched === pairs) completePuzzle(); else refreshPuzzleGuide();
          }, 300);
        } else later(() => {
          [a,b].forEach((i) => board.children[i].classList.remove("is-open")); open = []; locked = false; combo = 0;
          comboEl.textContent = "Combo: —"; comboEl.classList.remove("is-hot"); refreshPuzzleGuide();
        }, Math.max(360, 690 - freeRank(challenge) * 45));
      }); board.append(button);
    });
    if (free?.preview) later(() => {
      $$(".memory-card", board).forEach((card) => card.classList.remove("is-open", "is-preview"));
      locked = false; elements.puzzleStatus.textContent = `Agora encontre os ${pairs} pares.`; refreshPuzzleGuide();
    }, free.preview);
    setPuzzleGuide({ refresh: refreshGuide });
    elements.puzzleStatus.textContent = free?.preview ? "Memorize as cartas antes que elas virem!" : `Encontre ${pairs} pares e encadeie acertos para fazer combo.`;
    puzzleCleanup = () => pendingTimers.forEach(clearTimeout);
  }

  function initSnake(challenge) {
    const free = settingsFor(challenge);
    const target = free?.target || 4 + (challenge.level % 4), grid = 16, cell = 20;
    const obstacleCount = free?.obstacles || 0;
    const tickInterval = free?.interval || Math.max(105, 175 - challenge.level * 7);
    const pendingTimers = new Set();
    const wrap = document.createElement("div"); wrap.className = "game-wrap";
    wrap.innerHTML = `<div class="game-hud"><span>Pontos: <b id="snakeScore">0</b>/${target}</span><span id="snakeCombo">Ritmo: ×1</span><span>Obstáculos: ${obstacleCount}</span></div><canvas class="game-canvas snake-canvas" width="${grid * cell}" height="${grid * cell}" aria-label="Jogo da cobrinha"></canvas><div class="game-controls"><button type="button" data-dir="up" aria-label="Subir">↑</button><button type="button" data-dir="left" aria-label="Esquerda">←</button><button type="button" data-dir="down" aria-label="Descer">↓</button><button type="button" data-dir="right" aria-label="Direita">→</button></div>`;
    elements.puzzleStage.append(wrap);
    const canvas = $("canvas", wrap), ctx = canvas.getContext("2d"), scoreEl = $("#snakeScore", wrap), comboEl = $("#snakeCombo", wrap);
    const controlButtons = Object.fromEntries($$("[data-dir]", wrap).map((button) => [button.dataset.dir, button]));
    const DIRECTIONS = [
      { name:"up", x:0, y:-1 }, { name:"right", x:1, y:0 }, { name:"down", x:0, y:1 }, { name:"left", x:-1, y:0 }
    ];
    let snake, direction, nextDirection, food, obstacles = [], score, timer, running = true, foodPulse = 0;
    const occupied = (candidate) => snake.some((part) => part.x === candidate.x && part.y === candidate.y) || obstacles.some((part) => part.x === candidate.x && part.y === candidate.y);
    const randomFood = () => {
      let candidate;
      do candidate = { x: Math.floor(Math.random() * grid), y: Math.floor(Math.random() * grid) };
      while (occupied(candidate));
      return candidate;
    };
    const buildObstacles = () => {
      obstacles = [];
      let guard = 0;
      while (obstacles.length < obstacleCount && guard < 500) {
        guard += 1;
        const candidate = { x: 1 + Math.floor(Math.random() * (grid - 2)), y: 1 + Math.floor(Math.random() * (grid - 2)) };
        const safeStart = candidate.y === 8 && candidate.x >= 2 && candidate.x <= 8;
        if (!safeStart && !obstacles.some((item) => item.x === candidate.x && item.y === candidate.y)) obstacles.push(candidate);
      }
    };
    const drawHeart = (x, y) => {
      ctx.save?.(); ctx.shadowColor = "#ff947b"; ctx.shadowBlur = 8 + foodPulse; ctx.fillStyle = "#f27861"; ctx.font = `${18 + Math.min(2, foodPulse / 4)}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("♥", x * cell + cell / 2, y * cell + cell / 2 + 1); ctx.restore?.();
    };
    const draw = () => {
      ctx.fillStyle = "#283326"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle = "rgba(255,255,255,.035)"; ctx.lineWidth = 1;
      for (let i=0;i<=grid;i+=1) { ctx.beginPath(); ctx.moveTo(i*cell,0); ctx.lineTo(i*cell,canvas.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*cell); ctx.lineTo(canvas.width,i*cell); ctx.stroke(); }
      obstacles.forEach((part) => { ctx.fillStyle = "#744c3b"; ctx.beginPath(); ctx.roundRect(part.x*cell+3,part.y*cell+3,cell-6,cell-6,4); ctx.fill(); ctx.fillStyle = "rgba(255,214,155,.24)"; ctx.fillRect(part.x*cell+6,part.y*cell+6,cell-12,3); });
      snake.forEach((part,index) => { ctx.fillStyle = index === 0 ? "#f1c15f" : "#7f9a69"; ctx.beginPath(); ctx.roundRect(part.x*cell+2,part.y*cell+2,cell-4,cell-4,5); ctx.fill(); });
      drawHeart(food.x, food.y);
      foodPulse = (foodPulse + 1) % 12;
    };
    const guidedDirection = () => {
      if (!running || !snake?.length || !food) return null;
      const blocked = new Set([...snake.slice(0, -1), ...obstacles].map((part) => `${part.x},${part.y}`));
      blocked.delete(`${snake[0].x},${snake[0].y}`);
      const queue = [{ x:snake[0].x, y:snake[0].y, first:null }];
      const seen = new Set([`${snake[0].x},${snake[0].y}`]);
      while (queue.length) {
        const current = queue.shift();
        for (const step of DIRECTIONS) {
          if (!current.first && step.x === -direction.x && step.y === -direction.y) continue;
          const x = current.x + step.x, y = current.y + step.y, key = `${x},${y}`;
          if (x < 0 || y < 0 || x >= grid || y >= grid || blocked.has(key) || seen.has(key)) continue;
          const first = current.first || step.name;
          if (x === food.x && y === food.y) return first;
          seen.add(key); queue.push({ x, y, first });
        }
      }
      const safe = DIRECTIONS.filter((step) => !(step.x === -direction.x && step.y === -direction.y)).filter((step) => {
        const x = snake[0].x + step.x, y = snake[0].y + step.y;
        return x >= 0 && y >= 0 && x < grid && y < grid && !blocked.has(`${x},${y}`);
      }).sort((a,b) => (Math.abs(snake[0].x+a.x-food.x)+Math.abs(snake[0].y+a.y-food.y)) - (Math.abs(snake[0].x+b.x-food.x)+Math.abs(snake[0].y+b.y-food.y)));
      return safe[0]?.name || null;
    };
    const refreshGuide = () => {
      const name = guidedDirection();
      markPuzzleGuideTarget(controlButtons[name], "Siga a seta destacada");
    };
    const reset = () => {
      snake = [{x:5,y:8},{x:4,y:8},{x:3,y:8}]; direction = {x:1,y:0}; nextDirection = direction; score = 0; scoreEl.textContent = "0"; comboEl.textContent = "Ritmo: ×1"; buildObstacles(); food = randomFood(); running = true; draw(); refreshPuzzleGuide();
    };
    const setDirection = (name) => {
      const next = DIRECTIONS.find((item) => item.name === name);
      if (!next || next.x === -direction.x && next.y === -direction.y) return;
      nextDirection = { x:next.x, y:next.y }; refreshPuzzleGuide();
    };
    const tick = () => {
      if (!running) return; direction = nextDirection;
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
      if (head.x < 0 || head.y < 0 || head.x >= grid || head.y >= grid || snake.some((part) => part.x === head.x && part.y === head.y) || obstacles.some((part) => part.x === head.x && part.y === head.y)) {
        running = false; clearPuzzleGuideTarget(); canvas.classList.add("is-hit"); elements.puzzleStatus.textContent = "Ops! Houve uma colisão. A rodada vai recomeçar...";
        const resetTimer = window.setTimeout(() => { pendingTimers.delete(resetTimer); if (currentPuzzleChallenge === challenge && !elements.puzzleModal.hidden) { canvas.classList.remove("is-hit"); reset(); elements.puzzleStatus.textContent = `Pegue ${target} corações.`; } }, 700); pendingTimers.add(resetTimer); return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 1; scoreEl.textContent = String(score); comboEl.textContent = score >= 4 ? `Combo ×${score}!` : `Ritmo: ×${Math.min(3, score + 1)}`; comboEl.classList.toggle("is-hot", score >= 4); canvas.classList.remove("is-eating"); void canvas.offsetWidth; canvas.classList.add("is-eating"); elements.puzzleStatus.textContent = `${score} de ${target} corações${score >= 4 ? ` · COMBO ×${score}` : ""}`;
        if (score >= target) { running = false; clearPuzzleGuideTarget(); draw(); const winTimer = window.setTimeout(completePuzzle, 280); pendingTimers.add(winTimer); return; }
        food = randomFood();
      } else snake.pop();
      draw(); refreshPuzzleGuide();
    };
    const keyHandler = (event) => {
      const map = { ArrowUp:"up", ArrowDown:"down", ArrowLeft:"left", ArrowRight:"right" };
      if (map[event.key]) { event.preventDefault(); setDirection(map[event.key]); }
    };
    $$("[data-dir]", wrap).forEach((button) => button.addEventListener("click", () => setDirection(button.dataset.dir)));
    window.addEventListener("keydown", keyHandler); reset(); setPuzzleGuide({ refresh: refreshGuide }); timer = window.setInterval(tick, tickInterval);
    elements.puzzleStatus.textContent = `Pegue ${target} corações${obstacleCount ? ` e desvie de ${obstacleCount} obstáculos` : ""}.`;
    puzzleCleanup = () => { running = false; clearInterval(timer); pendingTimers.forEach(clearTimeout); window.removeEventListener("keydown", keyHandler); };
  }

  function initTetris(challenge) {
    const free = settingsFor(challenge);
    const cols = 10, rows = 16, cell = 24, target = free?.target || 120 + challenge.level * 20;
    const fallInterval = free?.interval || Math.max(260,610-challenge.level*28);
    const pendingTimers = new Set();
    const SHAPES = [
      { m:[[1,1,1,1]], c:"#d3a13e" }, { m:[[1,1],[1,1]], c:"#c4644e" }, { m:[[0,1,0],[1,1,1]], c:"#658075" },
      { m:[[1,0,0],[1,1,1]], c:"#7e8e62" }, { m:[[0,0,1],[1,1,1]], c:"#d88764" }, { m:[[0,1,1],[1,1,0]], c:"#839f72" }, { m:[[1,1,0],[0,1,1]], c:"#58777b" }
    ];
    const wrap = document.createElement("div"); wrap.className = "game-wrap";
    wrap.innerHTML = `<div class="game-hud"><span>Pontos: <b id="tetrisScore">0</b>/${target}</span><span>Linhas: <b id="tetrisLines">0</b></span><span id="tetrisCombo">Combo: —</span></div><canvas class="game-canvas tetris-canvas" width="${cols*cell}" height="${rows*cell}" aria-label="Jogo de blocos"></canvas><div class="game-controls tetris-controls"><button type="button" data-action="left" aria-label="Mover para esquerda">←</button><button type="button" data-action="rotate" aria-label="Girar">↻</button><button type="button" data-action="down" aria-label="Descer">↓</button><button type="button" data-action="right" aria-label="Mover para direita">→</button><button type="button" data-action="drop" aria-label="Queda rápida">⇣</button></div>`;
    elements.puzzleStage.append(wrap);
    const canvas = $("canvas",wrap), ctx = canvas.getContext("2d"), scoreEl = $("#tetrisScore",wrap), linesEl = $("#tetrisLines",wrap), comboEl = $("#tetrisCombo",wrap);
    const actionButtons = Object.fromEntries($$("[data-action]",wrap).map((button)=>[button.dataset.action,button]));
    let board = Array.from({length:rows},()=>Array(cols).fill(null)), piece, score = 0, totalLines = 0, lineCombo = 0, timer, running = true;
    const rotate = (matrix) => matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
    const matrixKey = (matrix) => matrix.map((row)=>row.join("")).join("/");
    const collides = (candidate, dx = 0, dy = 0, matrix = candidate.m) => matrix.some((row,y) => row.some((value,x) => value && (candidate.y+y+dy >= rows || candidate.x+x+dx < 0 || candidate.x+x+dx >= cols || (candidate.y+y+dy >= 0 && board[candidate.y+y+dy][candidate.x+x+dx]))));
    const spawn = () => {
      const shape = SHAPES[Math.floor(Math.random()*SHAPES.length)];
      piece = {m:shape.m.map((r)=>[...r]),c:shape.c,x:Math.floor((cols-shape.m[0].length)/2),y:-1};
      if (collides(piece)) {
        board = Array.from({length:rows},()=>Array(cols).fill(null)); score = Math.max(0,score-(freeRank(challenge)>=4?80:20)); scoreEl.textContent = String(score);
        canvas.classList.remove("is-danger"); void canvas.offsetWidth; canvas.classList.add("is-danger"); elements.puzzleStatus.textContent = "O tabuleiro transbordou: ele foi limpo e houve penalidade.";
      }
      refreshPuzzleGuide();
    };
    const drawBlock = (x,y,color) => { ctx.fillStyle=color; ctx.beginPath(); ctx.roundRect(x*cell+1,y*cell+1,cell-2,cell-2,4); ctx.fill(); ctx.fillStyle="rgba(255,255,255,.16)"; ctx.fillRect(x*cell+4,y*cell+4,cell-9,3); };
    const draw = () => {
      ctx.fillStyle="#293328"; ctx.fillRect(0,0,canvas.width,canvas.height);
      board.forEach((row,y)=>row.forEach((color,x)=>{ if(color) drawBlock(x,y,color); }));
      if(piece) piece.m.forEach((row,y)=>row.forEach((value,x)=>{ if(value && piece.y+y>=0) drawBlock(piece.x+x,piece.y+y,piece.c); }));
    };
    const clearLines = () => { let count=0; for(let y=rows-1;y>=0;y-=1){ if(board[y].every(Boolean)){ board.splice(y,1); board.unshift(Array(cols).fill(null)); count+=1; y+=1; } } return count; };
    const evaluatePlacement = (matrix, x, y) => {
      const simulated = board.map((row)=>[...row]);
      let above = 0;
      matrix.forEach((row,dy)=>row.forEach((value,dx)=>{ if (!value) return; const targetY=y+dy; if(targetY<0) above+=1; else simulated[targetY][x+dx]=piece.c; }));
      let lines=0;
      for(let row=simulated.length-1;row>=0;row-=1){if(simulated[row].every(Boolean)){simulated.splice(row,1);simulated.unshift(Array(cols).fill(null));lines+=1;row+=1;}}
      const heights=[];let holes=0;
      for(let col=0;col<cols;col+=1){let first=-1;for(let row=0;row<rows;row+=1){if(simulated[row][col]){first=row;break;}}const height=first<0?0:rows-first;heights.push(height);if(first>=0){for(let row=first+1;row<rows;row+=1)if(!simulated[row][col])holes+=1;}}
      const aggregate=heights.reduce((sum,value)=>sum+value,0), maxHeight=Math.max(...heights), bumpiness=heights.slice(1).reduce((sum,value,index)=>sum+Math.abs(value-heights[index]),0);
      return lines*1200-holes*110-aggregate*4.5-bumpiness*6-maxHeight*9-above*180-Math.abs((x+matrix[0].length/2)-cols/2)*.7;
    };
    const bestPlacement = () => {
      if(!piece||!running)return null;
      let matrix=piece.m, best=null;const seen=new Set();
      for(let steps=0;steps<4;steps+=1){
        const key=matrixKey(matrix);if(seen.has(key))break;seen.add(key);
        const width=matrix[0].length;
        for(let x=0;x<=cols-width;x+=1){
          const candidate={...piece,m:matrix,x,y:piece.y};
          if(collides(candidate,0,0,matrix))continue;
          while(!collides(candidate,0,1,matrix))candidate.y+=1;
          const value=evaluatePlacement(matrix,x,candidate.y);
          if(!best||value>best.value)best={steps,x,value};
        }
        matrix=rotate(matrix);
      }
      return best;
    };
    const refreshGuide = () => {
      const targetPlacement=bestPlacement();
      if(!targetPlacement)return;
      let actionName="drop";
      if(targetPlacement.steps>0){const next=rotate(piece.m);if(!collides(piece,0,0,next))actionName="rotate";else if(piece.x>targetPlacement.x)actionName="left";else if(piece.x<targetPlacement.x)actionName="right";}
      else if(piece.x>targetPlacement.x)actionName="left";
      else if(piece.x<targetPlacement.x)actionName="right";
      markPuzzleGuideTarget(actionButtons[actionName], actionName==="drop"?"Solte a peça destacada":"Use o controle destacado");
    };
    const lock = () => {
      piece.m.forEach((row,y)=>row.forEach((value,x)=>{ if(value && piece.y+y>=0) board[piece.y+y][piece.x+x]=piece.c; }));
      const lines=clearLines();
      if(lines){ lineCombo+=1; totalLines+=lines; const multiBonus=[0,90,230,420,700][lines]||700; const comboBonus=(lineCombo-1)*45; score += 20+multiBonus+comboBonus; linesEl.textContent=String(totalLines); comboEl.textContent=lineCombo>=2?`Combo ×${lineCombo}!`:`${lines} ${lines===1?"linha":"linhas"}!`; comboEl.classList.toggle("is-hot",lineCombo>=2); canvas.classList.remove("is-clearing"); void canvas.offsetWidth; canvas.classList.add("is-clearing"); elements.puzzleStatus.textContent=`${lines===4?"TETRIS! ":""}${lines} ${lines===1?"linha":"linhas"} · ${lineCombo>=2?`combo ×${lineCombo} · `:""}${score}/${target}`; }
      else { lineCombo=0; comboEl.textContent="Combo: —"; comboEl.classList.remove("is-hot"); score+=20; elements.puzzleStatus.textContent=`${score} de ${target} pontos`; }
      scoreEl.textContent=String(score);
      if(score>=target){ running=false; clearPuzzleGuideTarget(); draw(); const timerId=window.setTimeout(completePuzzle,300);pendingTimers.add(timerId); return; }
      spawn();
    };
    const fall = () => { if(!running)return; if(!collides(piece,0,1))piece.y+=1; else lock(); draw(); refreshPuzzleGuide(); };
    const action = (name) => {
      if(!running)return;
      if(name==="left"&&!collides(piece,-1,0))piece.x-=1;
      if(name==="right"&&!collides(piece,1,0))piece.x+=1;
      if(name==="down"){fall();return;}
      if(name==="rotate"){ const next=rotate(piece.m); if(!collides(piece,0,0,next))piece.m=next; }
      if(name==="drop"){ while(!collides(piece,0,1)){ piece.y+=1; score+=1; } lock(); scoreEl.textContent=String(score); }
      draw();refreshPuzzleGuide();
    };
    const keyHandler = (event) => { const map={ArrowLeft:"left",ArrowRight:"right",ArrowDown:"down",ArrowUp:"rotate",Space:"drop"," ":"drop"}; if(map[event.key]){event.preventDefault();action(map[event.key]);} };
    $$("[data-action]",wrap).forEach((button)=>button.addEventListener("click",()=>action(button.dataset.action)));
    window.addEventListener("keydown",keyHandler); spawn(); draw(); setPuzzleGuide({refresh:refreshGuide}); timer=window.setInterval(fall,fallInterval);
    elements.puzzleStatus.textContent=`Encaixe blocos até fazer ${target} pontos. Limpe linhas seguidas para criar combos.`;
    puzzleCleanup=()=>{running=false;clearInterval(timer);pendingTimers.forEach(clearTimeout);window.removeEventListener("keydown",keyHandler);};
  }

  function initLuxor(challenge) {
    const goals = luxorRequirements(challenge.level);
    const levelIndex = clamp(challenge.level - 1, 0, LUXOR_LEVELS.length - 1);
    const config = LUXOR_LEVELS[levelIndex];
    const routeConfig = LUXOR_ROUTES[levelIndex % LUXOR_ROUTES.length];
    const activeColors = LUXOR_COLORS.slice(0, config.palette);
    const activeKeys = activeColors.map((color) => color.key);
    const colorByKey = Object.fromEntries(LUXOR_COLORS.map((color) => [color.key, color]));
    const PROJECTILE_SPEED = 660;
    const MAX_PROJECTILE_DISTANCE = 940;
    const CANNON_POINT = { x: 360, y: 396 };
    const MATCH_COLLAPSE_DELAY = 105;
    const CHAIN_REACTION_DELAY = 34;
    const REFLOW_DURATION = 155;
    const POP_VISUAL_DURATION = 210;
    const minimumWaveSize = 11 + challenge.level;
    const pendingTimers = new Set();
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    let active = true;
    let resolving = false;
    let balls = [];
    let ballNodes = [];
    let headProgress = 0.24;
    let spacing = 0.024;
    let collisionRadius = 28;
    let currentColor = goals[0].color;
    let nextColor = goals[Math.min(1, goals.length - 1)].color;
    let score = 0;
    let comboStreak = 0;
    let shot = null;
    let animationFrame = 0;
    let resizeFrame = 0;
    let lastTime = performance.now();
    let audioContext = null;
    let aimingPointerId = null;
    let lastAimPoint = { x: 360, y: 92 };
    let resolutionSerial = 0;
    let comboAnimation = null;
    let cannonAnimation = null;
    let resizeObserver = null;
    let boardMetrics = { left: 0, top: 0, width: 720, height: 400 };

    const buildWave = () => {
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
      let cursor = 0;
      while (result.length < minimumWaveSize + 4) {
        let color = activeKeys[cursor % activeKeys.length];
        if (color === result[result.length - 1]) color = activeKeys[(cursor + 1) % activeKeys.length];
        result.push(color, color);
        cursor += 1;
      }
      return result;
    };
    balls = buildWave();

    const wrap = document.createElement("div");
    wrap.className = "luxor-wrap luxor-deluxe";
    wrap.innerHTML = `
      <div class="luxor-score luxor-score-deluxe">
        <span>Percurso <b>${routeConfig.name}</b></span>
        <span>Onda <b>${config.speedLabel} · ${(config.waveSpeed * 100).toFixed(1)}%/s</b></span>
        <span>Pontos <b id="luxorScore">0</b></span>
        <span id="luxorCombo">Sequência 0x</span>
      </div>
      <div class="luxor-goals" aria-label="Metas do desafio"></div>
      <div class="luxor-distance">
        <span>Distância até o portal</span>
        <div><i></i></div>
        <b class="luxor-distance-value">100%</b>
      </div>
      <div class="luxor-board-shell">
        <div class="luxor-path" data-theme="${routeConfig.theme}" role="button" tabindex="0" aria-label="${routeConfig.name}: pressione em qualquer ponto, mire e solte para disparar uma bolinha">
          <svg viewBox="0 0 720 400" preserveAspectRatio="none" aria-hidden="true">
            <path class="luxor-route-shadow" d="${routeConfig.d}" />
            <path class="luxor-route" id="luxorRoute" d="${routeConfig.d}" />
            <path class="luxor-route-glow" d="${routeConfig.d}" />
            <circle class="luxor-start" cx="${routeConfig.start[0]}" cy="${routeConfig.start[1]}" r="17" />
            <circle class="luxor-end-pulse" cx="${routeConfig.end[0]}" cy="${routeConfig.end[1]}" r="27" />
            <circle class="luxor-end" cx="${routeConfig.end[0]}" cy="${routeConfig.end[1]}" r="20" />
          </svg>
          <div class="luxor-start-label" style="left:${(routeConfig.start[0] / 720) * 100}%;top:${(routeConfig.start[1] / 400) * 100}%">INÍCIO</div>
          <div class="luxor-end-label" style="left:${(routeConfig.end[0] / 720) * 100}%;top:${(routeConfig.end[1] / 400) * 100}%">PORTAL</div>
          <i class="luxor-aim-line" aria-hidden="true"></i>
          <i class="luxor-aim-marker" aria-hidden="true"></i>
          <div class="luxor-ball-layer"></div>
          <div class="luxor-effects-layer" aria-hidden="true"></div>
          <div class="luxor-combo-flash" aria-live="polite"></div>
        </div>
        <div class="luxor-control-deck">
          <div class="luxor-deck-ammo">
            <div class="luxor-ammo"><small>AGORA</small><i class="current-marble"></i></div>
            <div class="luxor-ammo next"><small>DEPOIS</small><i class="next-marble"></i></div>
          </div>
          <div class="luxor-cannon-dock" aria-hidden="true"><div class="luxor-cannon"><i class="luxor-loaded-marble"></i><span></span></div></div>
          <div class="luxor-deck-actions">
            <button class="luxor-swap" type="button" aria-label="Trocar a bolinha atual pela próxima">Trocar ↔</button>
            <span>Pressione, aponte e solte.</span>
          </div>
        </div>
      </div>`;
    elements.puzzleStage.append(wrap);
    elements.puzzleStage.scrollTop = 0;

    const path = $(".luxor-path", wrap);
    const route = $("#luxorRoute", wrap);
    const cannon = $(".luxor-cannon", wrap);
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
      collisionRadius = clamp(marbleRouteUnits * 0.78 + 9, 27, 49);
    };
    const setMarbleColor = (element, colorKey) => {
      const color = colorByKey[colorKey];
      if (!element || !color) return;
      element.dataset.color = colorKey;
      element.style.setProperty("--marble-color", color.hex);
      element.setAttribute("title", color.name);
      element.setAttribute("aria-label", color.name);
    };
    const createMarbleNode = (colorKey, entering = false) => {
      const marble = document.createElement("i");
      marble.className = `marble${entering && !reducedMotion ? " is-entering" : ""}`;
      marble.setAttribute("aria-hidden", "true");
      setMarbleColor(marble, colorKey);
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
    const renderGoals = () => {
      goalsEl.innerHTML = goals.map((goal) => {
        const color = colorByKey[goal.color];
        return `<span class="luxor-goal${goal.done ? " is-done" : ""}" style="--goal-color:${color.hex}"><i></i>${goal.done ? "✓ " : ""}1 grupo de ${goal.size} ${color.name}</span>`;
      }).join("");
    };
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
      if (pending.length && Math.random() < 0.78) {
        const ranked = [...pending].sort((a, b) => {
          const needA = Math.max(0, a.size - largestRunFor(a.color));
          const needB = Math.max(0, b.size - largestRunFor(b.color));
          return needA - needB;
        });
        return ranked[Math.floor(Math.random() * Math.min(2, ranked.length))].color;
      }
      return activeKeys[Math.floor(Math.random() * activeKeys.length)];
    };
    const updateAmmo = () => {
      setMarbleColor(currentEl, currentColor);
      setMarbleColor(nextEl, nextColor);
      setMarbleColor(loadedEl, currentColor);
      swapButton.disabled = Boolean(shot) || resolving || !active;
    };
    const updateHud = () => {
      scoreEl.textContent = score.toLocaleString("pt-BR");
      comboEl.textContent = comboStreak >= 4 ? `COMBO ${comboStreak}x` : `Sequência ${comboStreak}x`;
      comboEl.classList.toggle("is-combo", comboStreak >= 4);
    };
    const pointAtProgress = (progress) => route.getPointAtLength(clamp(progress, 0, 1) * routeLength);
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
      });
      updateDistance();
    };
    const renderBalls = (enteringFrom = ballNodes.length) => {
      while (ballNodes.length > balls.length) ballNodes.pop()?.remove();
      while (ballNodes.length < balls.length) {
        const index = ballNodes.length;
        const marble = createMarbleNode(balls[index], index >= enteringFrom);
        ballNodes.push(marble);
        ballLayer.append(marble);
      }
      ballNodes.forEach((node, index) => {
        if (node.dataset.color !== balls[index]) setMarbleColor(node, balls[index]);
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
      const color = balls[index];
      let start = index;
      let end = index;
      while (start > 0 && balls[start - 1] === color) start -= 1;
      while (end < balls.length - 1 && balls[end + 1] === color) end += 1;
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
      burst.innerHTML = `<i class="luxor-burst-ring"></i>${Array.from({ length: 6 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 6;
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
      if (!matches.length) return null;
      matches[0].done = true;
      return matches[0];
    };
    const appendUsefulWave = () => {
      if (balls.length >= minimumWaveSize) return;
      const previousLength = balls.length;
      const pending = goals.filter((goal) => !goal.done);
      const goal = pending[0];
      let color = goal ? goal.color : activeKeys[Math.floor(Math.random() * activeKeys.length)];
      if (balls[balls.length - 1] === color) {
        const separator = activeKeys.find((key) => key !== color) || activeKeys[0];
        balls.push(separator, separator);
      }
      const amount = goal ? Math.max(2, goal.size - 1) : 2;
      for (let index = 0; index < amount; index += 1) balls.push(color);
      while (balls.length < minimumWaveSize + 3) {
        color = activeKeys[Math.floor(Math.random() * activeKeys.length)];
        if (color === balls[balls.length - 1]) color = activeKeys[(activeKeys.indexOf(color) + 1) % activeKeys.length];
        balls.push(color, color);
      }
      renderBalls(previousLength);
    };
    const stopCurrentShot = () => {
      shot?.element?.remove();
      shot = null;
      path.classList.remove("is-shooting");
    };
    const finishWin = () => {
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
      path.classList.add("is-won");
      showCallout(comboStreak >= 4 ? `COMBO FINAL ${comboStreak}x!` : "METAS CUMPRIDAS!", { x: 360, y: 190 }, true);
      playTone("win", comboStreak);
      elements.puzzleStatus.textContent = `Luxor vencido com ${score.toLocaleString("pt-BR")} pontos!`;
      later(completePuzzle, reducedMotion ? 80 : 650);
    };
    const lose = () => {
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
      panel.innerHTML = `<strong>O portal foi alcançado!</strong><span>A corrente venceu esta rodada com ${score.toLocaleString("pt-BR")} pontos.</span><button class="restart-inline" type="button">Tentar novamente</button>`;
      $("button", panel).addEventListener("click", () => initPuzzle(challenge));
      path.append(panel);
      playTone("miss");
      elements.puzzleStatus.textContent = "Fim do percurso. Tente novamente e use as reações em cadeia para ganhar tempo.";
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
      const gained = Math.round(group.size * 110 * (1 + Math.max(0, comboStreak - 1) * 0.25) * chainDepth);
      score += gained;
      const completedGoal = markGoal(group);
      if (completedGoal) {
        const stillNeeded = (colorKey) => goals.some((goal) => !goal.done && goal.color === colorKey);
        if (!stillNeeded(currentColor)) currentColor = chooseUsefulColor();
        if (!stillNeeded(nextColor)) nextColor = chooseUsefulColor();
      }
      const isCombo = comboStreak >= 4;
      const callout = isCombo ? `COMBO ${comboStreak}x!` : chainDepth > 1 ? `REAÇÃO ${chainDepth}x!` : group.size >= 4 ? `GRUPO DE ${group.size}!` : `+${gained}`;
      showCallout(callout, center, isCombo || chainDepth > 2);
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
        const beforePoints = captureBallPoints();
        const removedNodes = ballNodes.splice(group.start, group.size);
        balls.splice(group.start, group.size);
        removedNodes.forEach((node) => {
          node.hidden = false;
          effectsLayer.append(node);
          later(() => node.remove(), Math.max(70, POP_VISUAL_DURATION - MATCH_COLLAPSE_DELAY));
        });
        headProgress = Math.max(0.12, headProgress - Math.min(0.075, spacing * group.size * 0.7));
        moveBalls();
        animateReflow(beforePoints);
        if (goals.every((goal) => goal.done)) return finishWin();
        const boundary = clamp(group.start - 1, 0, balls.length - 1);
        const chained = balls.length ? groupAt(boundary) : null;
        if (chained && chained.size >= 3) {
          later(() => explodeGroup(chained, chainDepth + 1, serial), reducedMotion ? 0 : CHAIN_REACTION_DELAY);
          return;
        }
        appendUsefulWave();
        resolving = false;
        updateAmmo();
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
      const insertedIndex = insertionIndexForImpact(safeTarget, impactPoint);
      stopCurrentShot();
      hideAimVisual();
      createImpactFlash(impactPoint, colorKey);
      const beforePoints = captureBallPoints();
      balls.splice(insertedIndex, 0, colorKey);
      const insertedNode = createMarbleNode(colorKey);
      ballNodes.splice(insertedIndex, 0, insertedNode);
      ballLayer.append(insertedNode);
      beforePoints.set(insertedNode, impactPoint);
      moveBalls();
      animateReflow(beforePoints, 115);
      const group = groupAt(insertedIndex);
      if (group && group.size >= 3) {
        explodeGroup(group, 1, serial);
      } else {
        resolving = false;
        comboStreak = 0;
        headProgress += config.missPenalty;
        score = Math.max(0, score - 25);
        createBurst(impactPoint, colorKey);
        showCallout("SEM GRUPO", impactPoint, false);
        playTone("miss");
        updateHud();
        updateAmmo();
        moveBalls();
        elements.puzzleStatus.textContent = "Não formou 3: a onda avançou e o combo foi zerado.";
        if (headProgress >= 0.985) lose();
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
      headProgress += config.missPenalty * 0.65;
      score = Math.max(0, score - 15);
      createBurst(missPoint, colorKey);
      showCallout("ERROU A CORRENTE", missPoint, false);
      playTone("miss");
      updateHud();
      updateAmmo();
      moveBalls();
      elements.puzzleStatus.textContent = "O disparo passou pela corrente. Mire no caminho das bolinhas e solte novamente.";
      if (headProgress >= 0.985) lose();
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
      if (shot.traveled >= MAX_PROJECTILE_DISTANCE || shot.x < -35 || shot.x > 755 || shot.y < -35 || shot.y > 435) resolveProjectileMiss();
    };
    function shootAt(point) {
      if (!active || resolving || shot) return;
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
      shot = { color: currentColor, x: CANNON_POINT.x, y: CANNON_POINT.y, velocityX, velocityY, traveled: 0, element: projectile };
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
    const swapAmmo = () => {
      if (!active || resolving || shot) return;
      [currentColor, nextColor] = [nextColor, currentColor];
      updateAmmo();
      playTone("shoot");
      elements.puzzleStatus.textContent = "Bolinhas trocadas. Escolha onde mirar.";
    };
    const keyHandler = (event) => {
      if ((event.key === "x" || event.key === "X") && active) {
        event.preventDefault();
        swapAmmo();
      } else if ((event.key === "Enter" || event.key === " ") && active && document.activeElement === path) {
        event.preventDefault();
        shootAt(lastAimPoint);
      }
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
    const visibilityHandler = () => { lastTime = performance.now(); };
    const tick = (now) => {
      if (!active) return;
      const elapsed = Math.max(0, now - lastTime);
      const delta = Math.min(32, elapsed) / 1000;
      lastTime = now;
      headProgress += config.waveSpeed * delta;
      moveBalls();
      updateShot(delta);
      if (headProgress >= 0.985) {
        lose();
        return;
      }
      animationFrame = requestAnimationFrame(tick);
    };

    currentColor = chooseUsefulColor();
    nextColor = chooseUsefulColor();
    refreshBoardMetrics();
    headProgress = clamp(0.23 + challenge.level * 0.009, 0.23, 0.31);
    swapButton.addEventListener("click", swapAmmo);
    path.addEventListener("pointerdown", beginAim);
    path.addEventListener("pointermove", moveAim);
    path.addEventListener("pointerup", releaseAim);
    path.addEventListener("pointercancel", cancelAim);
    path.addEventListener("lostpointercapture", cancelAim);
    window.addEventListener("keydown", keyHandler);
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
    elements.puzzleStatus.textContent = `A onda ${config.speedLabel} já está andando. Pressione no tabuleiro, mire e solte para disparar.`;
    animationFrame = requestAnimationFrame(tick);
    puzzleCleanup = () => {
      active = false;
      resolutionSerial += 1;
      aimingPointerId = null;
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(resizeFrame);
      clearPendingTimers();
      comboAnimation?.cancel?.();
      cannonAnimation?.cancel?.();
      resizeObserver?.disconnect();
      path.removeEventListener("pointerdown", beginAim);
      path.removeEventListener("pointermove", moveAim);
      path.removeEventListener("pointerup", releaseAim);
      path.removeEventListener("pointercancel", cancelAim);
      path.removeEventListener("lostpointercapture", cancelAim);
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("resize", resizeHandler);
      document.removeEventListener("visibilitychange", visibilityHandler);
      ballNodes.forEach((node) => node._luxorReflow?.cancel?.());
      stopCurrentShot();
      effectsLayer.replaceChildren();
      if (audioContext && audioContext.state !== "closed") audioContext.close().catch(() => {});
    };
  }

  function initSimon(challenge) {
    const free=settingsFor(challenge), rank=freeRank(challenge);
    const roundsTarget=free?.rounds||2+(challenge.level%2), baseLength=free?.length||3+Math.floor(challenge.level/3);
    const colorCount=free?Math.min(6,3+rank):4, step=Math.max(255,560-rank*48), lightTime=Math.max(150,330-rank*22);
    let sequence=[],input=[],round=0,errors=0,accepting=false,active=true,timeouts=[];
    const progressDots=Array.from({length:roundsTarget},()=>"<i></i>").join("");
    const wrap=document.createElement("div");wrap.className="simon-wrap";wrap.innerHTML=`<div class="game-hud"><span>Rodada: <b id="simonRound">0</b>/${roundsTarget}</span><span>Erros: <b id="simonErrors">0</b></span><span>Sinais: ${baseLength}+</span></div><div class="simon-progress">${progressDots}</div><div class="simon-board" data-keys="${colorCount}">${Array.from({length:colorCount},(_,i)=>`<button class="simon-key" type="button" data-color="${i}" aria-label="Cor ${i+1}"><span>${i+1}</span></button>`).join("")}</div><button class="primary-button" id="startSimon" type="button">Mostrar sequência</button>`;elements.puzzleStage.append(wrap);
    const keys=$$(".simon-key",wrap),roundEl=$("#simonRound",wrap),errorsEl=$("#simonErrors",wrap),start=$("#startSimon",wrap),dots=$$(".simon-progress i",wrap);
    const later=(fn,ms)=>{const id=window.setTimeout(()=>{timeouts=timeouts.filter((timer)=>timer!==id);fn();},ms);timeouts.push(id);};
    const refreshGuide=()=>{
      if(!active)return;
      if(!sequence.length){markPuzzleGuideTarget(start,"Mostre a sequência");return;}
      if(accepting){markPuzzleGuideTarget(keys[sequence[input.length]],"Toque na cor destacada");return;}
      clearPuzzleGuideTarget();
    };
    const flash=(color,delay)=>{later(()=>keys[color]?.classList.add("is-lit"),delay);later(()=>keys[color]?.classList.remove("is-lit"),delay+lightTime);};
    const play=()=>{if(!active)return;accepting=false;input=[];start.disabled=true;clearPuzzleGuideTarget();elements.puzzleStatus.textContent=`Observe ${sequence.length} sinais...`;sequence.forEach((color,index)=>flash(color,index*step));later(()=>{accepting=true;start.disabled=false;start.textContent="Repetir sequência";elements.puzzleStatus.textContent="Agora repita a ordem.";refreshPuzzleGuide();},sequence.length*step+180);};
    const nextRound=()=>{round+=1;roundEl.textContent=String(round);sequence=Array.from({length:baseLength+round-1},()=>Math.floor(Math.random()*colorCount));play();};
    keys.forEach((key)=>key.addEventListener("click",()=>{
      if(!accepting||!active)return;const color=Number(key.dataset.color);key.classList.add("is-lit","is-player");later(()=>key.classList.remove("is-lit","is-player"),150);input.push(color);const index=input.length-1;
      if(sequence[index]!==color){accepting=false;clearPuzzleGuideTarget();errors+=1;errorsEl.textContent=String(errors);wrap.classList.remove("is-error");void wrap.offsetWidth;wrap.classList.add("is-error");elements.puzzleStatus.textContent="Sequência incorreta. Respire: ela será mostrada novamente.";later(play,700);return;}
      elements.puzzleStatus.textContent=`${input.length} de ${sequence.length} sinais corretos`;
      if(input.length===sequence.length){accepting=false;clearPuzzleGuideTarget();dots[round-1]?.classList.add("is-done");if(round>=roundsTarget){active=false;later(completePuzzle,350);}else{wrap.classList.remove("is-round-win");void wrap.offsetWidth;wrap.classList.add("is-round-win");elements.puzzleStatus.textContent="Rodada perfeita! A próxima sequência será maior.";later(nextRound,650);}}
      else refreshPuzzleGuide();
    }));
    start.addEventListener("click",()=>{if(!sequence.length)nextRound();else play();});
    setPuzzleGuide({refresh:refreshGuide});
    elements.puzzleStatus.textContent="Toque em “Mostrar sequência” para começar.";
    puzzleCleanup=()=>{active=false;timeouts.forEach(clearTimeout);};
  }

  function initLights(challenge) {
    const free=settingsFor(challenge),size=free?.size||4,total=size*size,scramble=free?.scramble||5+challenge.level;
    let lights=Array(total).fill(true),active=true,moves=0,pendingTimer=null;
    const affected=(index)=>{const row=Math.floor(index/size),col=index%size,result=[index];if(row>0)result.push(index-size);if(row<size-1)result.push(index+size);if(col>0)result.push(index-1);if(col<size-1)result.push(index+1);return result;};
    const toggle=(index)=>affected(index).forEach((i)=>lights[i]=!lights[i]);
    for(let i=0;i<scramble;i+=1)toggle((i*7+challenge.level*5+i*i)%total);if(lights.every(Boolean))toggle(challenge.level%total);
    const wrap=document.createElement("div");wrap.className="lights-wrap";wrap.innerHTML=`<div class="game-hud"><span>Movimentos: <b id="lightsMoves">0</b></span><span>Acesas: <b id="lightsOn">0</b>/${total}</span><span>${size} × ${size}</span></div>`;
    const board=document.createElement("div");board.className="lights-board";board.style.setProperty("--lights-size",String(size));wrap.append(board);elements.puzzleStage.append(wrap);
    const movesEl=$("#lightsMoves",wrap),onEl=$("#lightsOn",wrap);
    const solve=()=>{
      const matrix=Array.from({length:total},(_,lightIndex)=>{
        const row=Array(total+1).fill(0);
        for(let clickIndex=0;clickIndex<total;clickIndex+=1)if(affected(clickIndex).includes(lightIndex))row[clickIndex]=1;
        row[total]=lights[lightIndex]?0:1;
        return row;
      });
      const pivotColumns=[];let pivotRow=0;
      for(let col=0;col<total&&pivotRow<total;col+=1){
        let found=pivotRow;while(found<total&&!matrix[found][col])found+=1;if(found===total)continue;
        [matrix[pivotRow],matrix[found]]=[matrix[found],matrix[pivotRow]];
        for(let row=0;row<total;row+=1){if(row===pivotRow||!matrix[row][col])continue;for(let item=col;item<=total;item+=1)matrix[row][item]^=matrix[pivotRow][item];}
        pivotColumns[pivotRow]=col;pivotRow+=1;
      }
      for(let row=pivotRow;row<total;row+=1){if(!matrix[row].slice(0,total).some(Boolean)&&matrix[row][total])return [];}
      const solution=Array(total).fill(0);for(let row=0;row<pivotRow;row+=1)solution[pivotColumns[row]]=matrix[row][total];
      return solution.map((value,index)=>value?index:-1).filter((index)=>index>=0);
    };
    const refreshGuide=()=>{if(!active)return;const next=solve()[0];markPuzzleGuideTarget(board.children[next],"Toque no coração destacado");};
    const render=()=>{
      board.replaceChildren();const onCount=lights.filter(Boolean).length;onEl.textContent=String(onCount);
      lights.forEach((on,index)=>{
        const button=document.createElement("button");button.type="button";button.className=`light-tile${on?" is-on":""}`;button.setAttribute("aria-label",`Luz ${index+1} ${on?"acesa":"apagada"}`);
        button.addEventListener("click",()=>{
          if(!active)return;moves+=1;movesEl.textContent=String(moves);toggle(index);const lit=lights.filter(Boolean).length;
          if(lit===total)active=false;render();elements.puzzleStatus.textContent=`${lit} de ${total} corações acesos · ${moves} movimentos`;
          if(lit===total){board.classList.add("is-complete");pendingTimer=window.setTimeout(completePuzzle,350);}
        });board.append(button);
      });
      refreshPuzzleGuide();
    };
    render();setPuzzleGuide({refresh:refreshGuide});elements.puzzleStatus.textContent=`Acenda ${total} corações. Cada toque muda a luz e suas vizinhas.`;puzzleCleanup=()=>{active=false;clearTimeout(pendingTimer);};
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

  $$('[data-view]').forEach((button)=>button.addEventListener("click",()=>switchView(button.dataset.view)));
  elements.welcomeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = cleanPlayerName(elements.welcomeName.value);
    if (!name) { elements.welcomeName.focus(); return; }
    state.playerName = name; state.notes.dono = name; saveState(); closeWelcome(); renderInteractiveLayer(); renderRankingProfile(); queuePlayerSync(80);
    showToast(`Bem-vindo, ${name}!`);
  });
  $$('[data-ranking-mode]').forEach((button) => button.addEventListener("click", () => setRankingMode(button.dataset.rankingMode)));
  elements.rankingGameSelect.addEventListener("change", () => { rankingGame = elements.rankingGameSelect.value; loadRanking(); });
  elements.refreshRanking.addEventListener("click", loadRanking);
  $("#brandButton").addEventListener("click",handleBrandClick);
  elements.previousPage.addEventListener("click",()=>setPage(state.page-1));elements.nextPage.addEventListener("click",()=>setPage(state.page+1));
  elements.albumPage.addEventListener("load",()=>{elements.pageLoading.hidden=true;elements.albumPage.classList.add("is-loaded");});
  $("#fullscreenPage").addEventListener("click",toggleFullscreen);$("#exitFullscreen").addEventListener("click",toggleFullscreen);
  $("#nextChallenge").addEventListener("click",continueCollection);$("#continueChallenge").addEventListener("click",continueCollection);$("#inventoryChooseChallenge").addEventListener("click",()=>switchView("challenges"));$("#progressChip").addEventListener("click",()=>switchView("inventory"));
  $("#cancelPaste").addEventListener("click",cancelPlacement);$("#closePuzzle").addEventListener("click",closePuzzle);
  elements.puzzleGuideButton.addEventListener("click",()=>togglePuzzleGuide());
  elements.puzzleGuideToggle.addEventListener("change",()=>togglePuzzleGuide(elements.puzzleGuideToggle.checked));
  elements.restartPuzzle.addEventListener("click",()=>{if(!currentPuzzleChallenge)return;if(freePlaySession)freePlaySession.phaseStartedAt=Date.now();initPuzzle(currentPuzzleChallenge);elements.puzzleStatus.textContent=freePlaySession?`Fase ${freePlaySession.phase} reiniciada. Os pontos anteriores continuam valendo.`:"Desafio reiniciado. Boa sorte!";});
  elements.puzzleModal.addEventListener("click",(event)=>{if(event.target===elements.puzzleModal)closePuzzle();});
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
  window.addEventListener("keydown",(event)=>{if(event.key==="Escape"&&elements.welcomeModal.hidden){if(!elements.profileModal.hidden)closeProfile();else if(!elements.secretModal.hidden)closeSecret();else if(!elements.textStyleModal.hidden)closeTextStyle();else if(!elements.puzzleModal.hidden)closePuzzle();else if(elements.pageWrap.classList.contains("is-fullscreen"))toggleFullscreen();}if(elements.welcomeModal.hidden&&elements.profileModal.hidden&&elements.puzzleModal.hidden&&elements.secretModal.hidden&&elements.textStyleModal.hidden&&currentView==="album"&&!$("textarea:focus")&&!$("input:focus")){if(event.key==="ArrowLeft")setPage(state.page-1);if(event.key==="ArrowRight")setPage(state.page+1);}});

  buildPageStrip();applyVolume(state.volume);renderAll();initializePlayerAndRanking();
})();
