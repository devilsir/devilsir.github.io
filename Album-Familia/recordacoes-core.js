(() => {
  "use strict";

  const TOTAL_STICKERS = 64;
  const SCHEMA_VERSION = 2;
  const LEGACY_KEY = "recordacoes-familia-album-2026-v1";
  const LEGACY_BACKUP_KEY = "recordacoes-familia-album-2026-v1-migration-backup";
  const PRIMARY_KEY = "recordacoes-familia-album-2026-v2";
  const BACKUP_KEY = "recordacoes-familia-album-2026-v2-backup";
  const GAME_KEYS = ["numbers", "image", "memory", "snake", "tetris", "luxor", "simon", "lights"];
  const DIFFICULTY_KEYS = ["facil", "normal", "dificil", "extremo", "inferno"];
  const DAILY_SLOTS = ["featured", "quick", "mastery"];
  const FREE_PHASES = 10;
  const MAX_ACTIVE_MS = 24 * 60 * 60 * 1000;
  const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const asNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };
  const safeInteger = (value, min = 0, max = Number.MAX_SAFE_INTEGER, fallback = min) =>
    clamp(Math.round(asNumber(value, fallback)), min, max);
  const cleanText = (value, limit = 2000) =>
    String(value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").slice(0, limit);
  const cleanName = (value) => cleanText(value, 80).replace(/\s+/g, " ").trim().slice(0, 32);
  const isPlainObject = (value) =>
    Boolean(value) && typeof value === "object" && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  const unique = (values) => [...new Set(values)];
  const isoNow = () => new Date().toISOString();

  function hash32(value) {
    let hash = 2166136261;
    const text = String(value);
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    hash += hash << 13;
    hash ^= hash >>> 7;
    hash += hash << 3;
    hash ^= hash >>> 17;
    hash += hash << 5;
    return hash >>> 0;
  }

  function seededRandom(seed) {
    let state = typeof seed === "number" ? seed >>> 0 : hash32(seed);
    return () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(values, seed) {
    const result = [...values];
    const random = typeof seed === "function" ? seed : seededRandom(seed);
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function datePartsInSaoPaulo(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: SAO_PAULO_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date);
    return Object.fromEntries(parts.map((part) => [part.type, part.value]));
  }

  function saoPauloDateKey(date = new Date()) {
    const parts = datePartsInSaoPaulo(date);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function parseDateKey(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return null;
    const date = new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function dateDifferenceDays(fromKey, toKey) {
    const from = parseDateKey(fromKey);
    const to = parseDateKey(toKey);
    if (!from || !to) return 0;
    return Math.round((to.getTime() - from.getTime()) / 86400000);
  }

  function addDays(dateKey, amount) {
    const date = parseDateKey(dateKey);
    if (!date) return saoPauloDateKey();
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().slice(0, 10);
  }

  function millisecondsToNextSaoPauloDay(now = new Date()) {
    const currentKey = saoPauloDateKey(now);
    let low = now.getTime();
    let high = low + 30 * 60 * 60 * 1000;
    while (high - low > 1000) {
      const middle = Math.floor((low + high) / 2);
      if (saoPauloDateKey(new Date(middle)) === currentKey) low = middle;
      else high = middle;
    }
    return Math.max(1000, high - now.getTime());
  }

  function formatCountdown(milliseconds) {
    const seconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  const PHASE_BLUEPRINTS = {
    numbers: [
      { mechanic: "classic", label: "Primeira ordem" },
      { mechanic: "moveLimit", moveLimit: true, label: "Passos contados" },
      { mechanic: "trail", trail: 2, label: "Trilha numérica" },
      { mechanic: "fixed", fixed: 1, label: "Peça guardada" },
      { mechanic: "checkpoint", checkpoints: 1, label: "Marco de família" },
      { mechanic: "forbidden", forbidden: 1, label: "Casa reservada" },
      { mechanic: "time", timeLimit: true, label: "Contra o relógio" },
      { mechanic: "fixedTrail", fixed: 2, trail: 3, moveLimit: true, label: "Caminho protegido" },
      { mechanic: "checkpointTime", checkpoints: 2, timeLimit: true, label: "Dois marcos" },
      { mechanic: "master", fixed: 2, trail: 4, checkpoints: 2, moveLimit: true, label: "Álbum perfeito" }
    ],
    image: [
      { mechanic: "classic", previewTokens: 4, label: "Retrato aberto" },
      { mechanic: "briefPreview", previewTokens: 3, previewMs: 1800, label: "Olhar rápido" },
      { mechanic: "corners", cornerHints: true, previewTokens: 2, label: "Cantos da lembrança" },
      { mechanic: "moveLimit", moveLimit: true, previewTokens: 2, label: "Montagem precisa" },
      { mechanic: "rotations", rotations: 2, previewTokens: 2, label: "Retrato girado" },
      { mechanic: "missing", missingVariant: true, previewTokens: 1, label: "Peça ausente" },
      { mechanic: "rotationLimit", rotations: 4, moveLimit: true, previewTokens: 1, label: "Giros contados" },
      { mechanic: "cornersRotation", rotations: 5, cornerHints: true, previewTokens: 1, label: "Moldura em movimento" },
      { mechanic: "time", rotations: 6, timeLimit: true, previewTokens: 1, label: "Foto relâmpago" },
      { mechanic: "master", rotations: 8, moveLimit: true, cornerHints: true, previewTokens: 0, label: "Mosaico de mestre" }
    ],
    memory: [
      { mechanic: "classic", layout: "rectangle", label: "Pares queridos" },
      { mechanic: "combo", comboGoal: 2, layout: "rectangle", label: "Combo de carinho" },
      { mechanic: "time", timeLimit: true, layout: "arch", label: "Memória veloz" },
      { mechanic: "mistakes", mistakeLimit: true, layout: "rectangle", label: "Lembrança precisa" },
      { mechanic: "moving", movingCards: true, layout: "wave", label: "Cartas viajantes" },
      { mechanic: "locked", lockedPairs: 1, layout: "arch", label: "Pares guardados" },
      { mechanic: "wild", wildPairs: 1, layout: "diamond", label: "Memória coringa" },
      { mechanic: "sequence", sequenceMatch: true, layout: "wave", label: "História em ordem" },
      { mechanic: "movingLocked", movingCards: true, lockedPairs: 2, mistakeLimit: true, layout: "diamond", label: "Cofre de lembranças" },
      { mechanic: "master", movingCards: true, lockedPairs: 2, wildPairs: 1, sequenceMatch: true, timeLimit: true, layout: "ring", label: "Memória infinita" }
    ],
    snake: [
      { mechanic: "target", mode: "target", map: "open", label: "Passeio no quintal" },
      { mechanic: "obstacles", mode: "target", map: "garden", label: "Jardim de recordações" },
      { mechanic: "multiplier", mode: "target", map: "garden", multiplierFood: true, label: "Corações dourados" },
      { mechanic: "speedZones", mode: "target", map: "lanes", speedZones: true, label: "Corredor do tempo" },
      { mechanic: "shield", mode: "target", map: "rooms", shield: true, label: "Abraço protetor" },
      { mechanic: "hazards", mode: "survival", map: "garden", movingHazards: 1, label: "Relógios inquietos" },
      { mechanic: "tailRisk", mode: "target", map: "spiral", tailCutRisk: true, label: "Laço apertado" },
      { mechanic: "checkpoints", mode: "checkpoint", map: "rooms", checkpoints: 2, shield: true, label: "Caminho de casa" },
      { mechanic: "survival", mode: "survival", map: "lanes", movingHazards: 2, speedZones: true, label: "Sobreviva à festa" },
      { mechanic: "master", mode: "mixed", map: "spiral", movingHazards: 2, tailCutRisk: true, multiplierFood: true, shield: true, checkpoints: 3, label: "Volta das memórias" }
    ],
    tetris: [
      { mechanic: "classic", objective: "score", label: "Primeiros blocos" },
      { mechanic: "lines", objective: "lines", label: "Linhas da família" },
      { mechanic: "hold", objective: "score", hold: true, label: "Peça guardada" },
      { mechanic: "combo", objective: "combo", hold: true, label: "Encaixes seguidos" },
      { mechanic: "level", objective: "lines", hold: true, levelProgression: true, label: "Andares da casa" },
      { mechanic: "backToBack", objective: "backToBack", hold: true, backToBack: true, label: "Quatro em família" },
      { mechanic: "garbage", objective: "survive", hold: true, garbageRows: 1, label: "Porão cheio" },
      { mechanic: "garbageCombo", objective: "combo", hold: true, garbageRows: 2, levelProgression: true, label: "Arrumação urgente" },
      { mechanic: "precision", objective: "lines", hold: true, garbageRows: 2, backToBack: true, label: "Parede perfeita" },
      { mechanic: "master", objective: "mixed", hold: true, garbageRows: 3, backToBack: true, levelProgression: true, label: "Casa completa" }
    ],
    luxor: [
      { mechanic: "groups", objectiveType: "clear", label: "Rio tranquilo" },
      { mechanic: "colors", objectiveType: "colors", label: "Cores da família" },
      { mechanic: "waves", objectiveType: "waves", waves: 2, label: "Duas correntes" },
      { mechanic: "score", objectiveType: "score", label: "Pontuação dourada" },
      { mechanic: "armored", objectiveType: "armored", specials: ["armored"], label: "Retratos protegidos" },
      { mechanic: "chains", objectiveType: "chains", specials: ["prism"], label: "Reações de afeto" },
      { mechanic: "rescue", objectiveType: "rescue", specials: ["memory", "frozen"], label: "Resgate da lembrança" },
      { mechanic: "checkpoint", objectiveType: "checkpoint", specials: ["shadow", "locked"], label: "Antes do portal" },
      { mechanic: "limitedMisses", objectiveType: "misses", specials: ["armored", "stone", "power"], label: "Mira de precisão" },
      { mechanic: "guardian", objectiveType: "guardian", waves: 3, specials: ["armored", "stone", "prism", "frozen", "memory", "shadow", "locked", "power"], label: "Guardião do álbum" }
    ],
    simon: [
      { mechanic: "classic", label: "Primeira sequência" },
      { mechanic: "curve", speedCurve: "accelerating", label: "Ritmo crescente" },
      { mechanic: "reverse", reverse: true, label: "Memória ao contrário" },
      { mechanic: "visual", visualOnlyRounds: true, label: "Luzes silenciosas" },
      { mechanic: "audio", audioOnlyRounds: true, label: "Som das lembranças" },
      { mechanic: "distractors", distractors: 1, label: "Pulsos distraídos" },
      { mechanic: "errors", errorLimit: 2, label: "Duas chances" },
      { mechanic: "chapters", patternChapters: 2, reverse: true, label: "Capítulos do padrão" },
      { mechanic: "alternating", visualOnlyRounds: true, audioOnlyRounds: true, distractors: 2, label: "Sentidos alternados" },
      { mechanic: "master", reverse: true, distractors: 2, errorLimit: 1, speedCurve: "accelerating", patternChapters: 3, label: "Sinfonia de família" }
    ],
    lights: [
      { mechanic: "classic", rule: "plus", shape: "square", stages: 1, label: "Primeiras luzes" },
      { mechanic: "moveLimit", rule: "plus", shape: "square", moveLimit: true, stages: 1, label: "Toques contados" },
      { mechanic: "blocked", rule: "plus", shape: "corners-cut", blocked: 2, stages: 1, label: "Janelas fechadas" },
      { mechanic: "diagonal", rule: "diagonal", shape: "square", stages: 1, label: "Luz diagonal" },
      { mechanic: "row", rule: "row", shape: "diamond", stages: 1, label: "Cortinas acesas" },
      { mechanic: "target", rule: "plus", shape: "square", target: "heart", stages: 1, label: "Desenho de coração" },
      { mechanic: "blockedTarget", rule: "diagonal", shape: "corners-cut", blocked: 3, target: "checker", stages: 1, label: "Mosaico luminoso" },
      { mechanic: "multi", rule: "plus", shape: "diamond", stages: 2, moveLimit: true, label: "Dois cômodos" },
      { mechanic: "mixed", rule: "mixed", shape: "square", stages: 2, blocked: 4, target: "border", label: "Casa em camadas" },
      { mechanic: "master", rule: "mixed", shape: "corners-cut", stages: 3, blocked: 4, target: "heart", moveLimit: true, label: "Fachada iluminada" }
    ]
  };

  const DIFFICULTY_BASE = {
    numbers: [
      { size: 3, shuffle: 12 }, { size: 4, shuffle: 24 }, { size: 4, shuffle: 38 }, { size: 5, shuffle: 54 }, { size: 5, shuffle: 72 }
    ],
    image: [
      { size: 3, shuffle: 12 }, { size: 3, shuffle: 24 }, { size: 4, shuffle: 36 }, { size: 4, shuffle: 52 }, { size: 5, shuffle: 68 }
    ],
    memory: [
      { pairs: 4, preview: 1300 }, { pairs: 6, preview: 900 }, { pairs: 8, preview: 550 }, { pairs: 10, preview: 250 }, { pairs: 12, preview: 0 }
    ],
    snake: [
      { target: 5, interval: 175, obstacles: 0 }, { target: 8, interval: 150, obstacles: 1 }, { target: 11, interval: 125, obstacles: 3 }, { target: 15, interval: 100, obstacles: 5 }, { target: 19, interval: 82, obstacles: 7 }
    ],
    tetris: [
      { target: 140, interval: 650, linesTarget: 2 }, { target: 240, interval: 535, linesTarget: 3 }, { target: 360, interval: 430, linesTarget: 4 }, { target: 510, interval: 335, linesTarget: 6 }, { target: 680, interval: 255, linesTarget: 8 }
    ],
    luxor: [
      { speed: 0.018, palette: 4 }, { speed: 0.024, palette: 5 }, { speed: 0.031, palette: 6 }, { speed: 0.039, palette: 7 }, { speed: 0.047, palette: 7 }
    ],
    simon: [
      { rounds: 2, length: 3, colors: 3 }, { rounds: 3, length: 4, colors: 4 }, { rounds: 4, length: 5, colors: 5 }, { rounds: 5, length: 6, colors: 6 }, { rounds: 6, length: 7, colors: 6 }
    ],
    lights: [
      { size: 3, scramble: 4 }, { size: 4, scramble: 7 }, { size: 4, scramble: 10 }, { size: 5, scramble: 14 }, { size: 6, scramble: 18 }
    ]
  };

  function buildPhaseSettings(gameKey, difficultyRank, phase, seed) {
    const rank = clamp(safeInteger(difficultyRank, 1, 5, 2), 1, 5);
    const safePhase = clamp(safeInteger(phase, 1, FREE_PHASES, 1), 1, FREE_PHASES);
    const base = { ...(DIFFICULTY_BASE[gameKey]?.[rank - 1] || {}) };
    const blueprint = { ...(PHASE_BLUEPRINTS[gameKey]?.[safePhase - 1] || PHASE_BLUEPRINTS[gameKey]?.[0] || {}) };
    const random = seededRandom(`${seed || gameKey}:${rank}:${safePhase}`);
    const progress = safePhase - 1;
    const settings = { ...base, ...blueprint, phase: safePhase, rank, seed: String(seed || `${gameKey}-${rank}-${safePhase}`) };

    if (gameKey === "numbers" || gameKey === "image") {
      settings.shuffle = Math.round(base.shuffle * (1 + progress * 0.075));
      settings.moveLimitValue = Math.round(settings.shuffle * (rank <= 2 ? 2.35 : 1.9) + settings.size * 4);
      settings.timeLimitMs = Math.round((80 + settings.size * 26 + progress * 5) * 1000 / (1 + (rank - 1) * 0.08));
      settings.rotationIndices = seededShuffle(
        Array.from({ length: settings.size * settings.size - 1 }, (_, index) => index + 1),
        random
      ).slice(0, safeInteger(settings.rotations, 0, settings.size * settings.size - 1));
    }
    if (gameKey === "memory") {
      settings.pairs = Math.min(12, base.pairs + Math.floor(progress / 4));
      settings.preview = Math.max(0, base.preview - progress * 60);
      settings.timeLimitMs = Math.round((settings.pairs * 12 + 25) * 1000 / (1 + (rank - 1) * 0.06));
      settings.mistakeLimitValue = Math.max(2, Math.ceil(settings.pairs * (rank <= 2 ? 1.5 : 1.15)));
    }
    if (gameKey === "snake") {
      settings.target = base.target + Math.floor(progress * (1 + rank * 0.45));
      settings.obstacles = base.obstacles + Math.floor(progress / 3);
      settings.survivalSeconds = 18 + progress * 3 + rank * 3;
    }
    if (gameKey === "tetris") {
      settings.target = Math.round(base.target * (1 + progress * 0.1));
      settings.linesTarget = base.linesTarget + Math.floor(progress * 0.7);
      settings.comboTarget = 2 + Math.floor(progress / 3);
      settings.survivalPieces = 10 + progress * 2 + rank * 2;
    }
    if (gameKey === "luxor") {
      settings.waveSpeed = base.speed * (1 + progress * 0.025);
      settings.waves = safeInteger(settings.waves || (safePhase >= 6 ? 2 : 1), 1, 3);
      settings.clearTarget = 12 + rank * 3 + progress * 2;
      settings.scoreTarget = 1800 + rank * 650 + progress * 320;
      settings.chainTarget = 1 + Math.floor((rank + progress) / 3);
      settings.armoredTarget = 2 + Math.floor((rank + progress) / 3);
      settings.rescueTarget = 1 + Math.floor(progress / 4);
      settings.missLimit = Math.max(2, 8 - rank - Math.floor(progress / 3));
      settings.timeLimitMs = Math.max(50000, 125000 - rank * 9000 - progress * 2800);
    }
    if (gameKey === "simon") {
      settings.rounds = base.rounds + Math.floor(progress / 3);
      settings.length = base.length + Math.floor(progress / 4);
      settings.stepMs = Math.max(235, 610 - rank * 48 - progress * 13);
      settings.lightMs = Math.max(130, 345 - rank * 23 - progress * 7);
    }
    if (gameKey === "lights") {
      settings.scramble = base.scramble + Math.floor(progress * (1 + rank * 0.25));
      settings.moveLimitValue = Math.ceil(settings.scramble * (rank <= 2 ? 2.1 : 1.65) + settings.size);
    }
    return settings;
  }

  const POWER_DEFINITIONS = [
    { key: "memoryFlame", name: "Chama da Memória", short: "Explode uma área", icon: "flame", cost: 38, shortcut: "1" },
    { key: "timeKeepsake", name: "Relíquia do Tempo", short: "Desacelera a corrente", icon: "hourglass", cost: 34, shortcut: "2" },
    { key: "reverseCurrent", name: "Corrente Reversa", short: "Empurra a corrente", icon: "reverse", cost: 42, shortcut: "3" },
    { key: "familyLightning", name: "Raio da Família", short: "Remove uma cor útil", icon: "lightning", cost: 48, shortcut: "4" },
    { key: "wildMemory", name: "Memória Curinga", short: "Combina com qualquer cor", icon: "wild", cost: 28, shortcut: "5" },
    { key: "colorBloom", name: "Flor de Cores", short: "Transforma uma seção", icon: "bloom", cost: 32, shortcut: "6" },
    { key: "portalShield", name: "Escudo do Portal", short: "Segura a corrente", icon: "shield", cost: 44, shortcut: "7" },
    { key: "tripleMemoryShot", name: "Disparo Triplo", short: "Três tiros controlados", icon: "triple", cost: 40, shortcut: "8" }
  ];

  const LUXOR_CHAPTERS = [
    { number: 1, name: "Rio das Folhas", theme: "forest", subtitle: "O caminho começa entre folhas e retratos.", detail: "Grupos, mira e primeiras ondas." },
    { number: 2, name: "Espiral do Sol", theme: "sun", subtitle: "A luz revela novas cores na corrente.", detail: "Rotas invertidas e metas de cor." },
    { number: 3, name: "Serpente de Areia", theme: "desert", subtitle: "Relíquias protegidas atravessam o deserto.", detail: "Bolinhas blindadas e pedra." },
    { number: 4, name: "Laço das Estrelas", theme: "night", subtitle: "O céu guarda lembranças escondidas.", detail: "Sombras, prismas e tempo." },
    { number: 5, name: "Templo em Zigue-zague", theme: "temple", subtitle: "Portas antigas pedem reações em cadeia.", detail: "Travas, gelo e checkpoints." },
    { number: 6, name: "Coroa Dourada", theme: "royal", subtitle: "Cada acerto constrói uma celebração.", detail: "Ondas múltiplas e precisão." },
    { number: 7, name: "Caracol de Jade", theme: "jade", subtitle: "O passado se divide e volta a se encontrar.", detail: "Entradas alternadas e resgates." },
    { number: 8, name: "Labirinto Final", theme: "volcano", subtitle: "O álbum inteiro pulsa diante do portal.", detail: "Guardiões em três atos." }
  ];

  function luxorObjectivesFor(level, random) {
    const chapter = Math.ceil(level / 5);
    const chapterLevel = ((level - 1) % 5) + 1;
    const finale = chapterLevel === 5;
    const primaryTypes = ["clear", "colors", "waves", "score", "time", "chains", "rescue", "armored", "checkpoint", "misses", "restrictedPower"];
    const type = finale ? "guardian" : primaryTypes[(level + chapterLevel + Math.floor(random() * 3)) % primaryTypes.length];
    const objectives = [];
    const add = (objective) => objectives.push(objective);
    if (type === "clear") add({ type, target: 18 + level * 2, label: `Limpe ${18 + level * 2} bolinhas` });
    if (type === "colors") {
      const colors = ["azul", "vermelho", "verde", "dourado", "teal", "roxo", "marrom"];
      const availableColorCount = clamp(3 + Math.ceil(level / 8), 4, 7);
      const color = colors[(level + chapter) % availableColorCount];
      add({ type, color, target: 3 + chapterLevel, label: `Destrua ${3 + chapterLevel} grupos ${color}` });
    }
    if (type === "waves") add({ type, target: Math.min(3, 1 + Math.ceil(level / 15)), label: `Supere ${Math.min(3, 1 + Math.ceil(level / 15))} ondas` });
    if (type === "score") add({ type, target: 2800 + level * 280, label: `Alcance ${(2800 + level * 280).toLocaleString("pt-BR")} pontos` });
    if (type === "time") add({ type, target: Math.max(55, 115 - level), label: `Conclua em até ${Math.max(55, 115 - level)} s` });
    if (type === "chains") add({ type, target: 2 + Math.floor(chapter / 2), label: `Faça ${2 + Math.floor(chapter / 2)} reações em cadeia` });
    if (type === "rescue") add({ type, target: 1 + Math.floor(chapter / 3), label: `Resgate ${1 + Math.floor(chapter / 3)} memórias` });
    if (type === "armored") add({ type, target: 2 + chapter, label: `Quebre ${2 + chapter} blindagens` });
    if (type === "checkpoint") add({ type, target: 42, label: "Limpe a corrente antes do marco de 42%" });
    if (type === "misses") add({ type, target: Math.max(2, 7 - Math.floor(chapter / 2)), label: `Use no máximo ${Math.max(2, 7 - Math.floor(chapter / 2))} erros` });
    if (type === "restrictedPower") {
      const power = POWER_DEFINITIONS[(level + chapter) % POWER_DEFINITIONS.length];
      add({ type, power: power.key, target: 1, label: `Vença sem usar ${power.name}` });
    }
    if (type === "guardian") {
      add({ type, target: 3, label: "Supere as 3 ondas do guardião" });
      add({ type: "chains", target: 2 + Math.floor(chapter / 2), label: `Crie ${2 + Math.floor(chapter / 2)} reações` });
      add({ type: chapter >= 5 ? "rescue" : "armored", target: chapter >= 5 ? 2 : 3 + chapter, label: chapter >= 5 ? "Resgate 2 memórias" : `Quebre ${3 + chapter} blindagens` });
    }
    return objectives;
  }

  function buildLuxorLevel(level) {
    const safeLevel = clamp(safeInteger(level, 1, 40, 1), 1, 40);
    const chapter = Math.ceil(safeLevel / 5);
    const chapterLevel = ((safeLevel - 1) % 5) + 1;
    const finale = chapterLevel === 5;
    const random = seededRandom(`luxor-campaign:${safeLevel}:v2`);
    const variantOptions = ["normal", "reversed", "mirrored", "alternate", "tunnel", "hidden", "merge"];
    const allowedVariantCount = Math.min(variantOptions.length, 2 + chapter);
    const routeVariant = chapterLevel === 1 ? "normal" : variantOptions[Math.floor(random() * allowedVariantCount)];
    const introduced = [];
    if (safeLevel >= 6) introduced.push("armored");
    if (safeLevel >= 11) introduced.push("stone");
    if (safeLevel >= 14) introduced.push("prism");
    if (safeLevel >= 17) introduced.push("frozen");
    if (safeLevel >= 21) introduced.push("memory");
    if (safeLevel >= 25) introduced.push("shadow");
    if (safeLevel >= 29) introduced.push("locked");
    if (safeLevel >= 33) introduced.push("power");
    const specialCount = finale ? Math.min(5, 1 + Math.floor(chapter / 2)) : Math.min(3, Math.floor(chapter / 2));
    const specials = seededShuffle(introduced, random).slice(0, specialCount);
    let waveCount = finale ? 3 : safeLevel >= 28 ? 2 : safeLevel >= 13 && chapterLevel === 4 ? 2 : 1;
    const speed = clamp(0.018 + safeLevel * 0.00072 + (finale ? 0.001 : 0), 0.018, 0.05);
    const palette = clamp(3 + Math.ceil(safeLevel / 8), 4, 7);
    const objectives = luxorObjectivesFor(safeLevel, random);
    const waveObjective = objectives.find((objective) => objective.type === "waves" || objective.type === "guardian");
    if (waveObjective) waveCount = Math.max(waveCount, clamp(Number(waveObjective.target) || 1, 1, 3));
    const baseThreshold = 3200 + safeLevel * 410 + (waveCount - 1) * 2400;
    return {
      level: safeLevel,
      chapter,
      chapterLevel,
      finale,
      name: finale ? `Guardião ${LUXOR_CHAPTERS[chapter - 1].name}` : `${LUXOR_CHAPTERS[chapter - 1].name} · ${chapterLevel}`,
      routeIndex: chapter - 1,
      routeVariant,
      theme: LUXOR_CHAPTERS[chapter - 1].theme,
      waves: waveCount,
      speed,
      palette,
      specials,
      objectives,
      starThresholds: [Math.round(baseThreshold * 0.62), Math.round(baseThreshold * 0.84), baseThreshold],
      fixedLoadout: null,
      seed: `luxor-campaign:${safeLevel}:v2`
    };
  }

  function dailyChallengeId(dateKey, slot, variant, gameKey, difficultyKey) {
    const digest = hash32(`recordacoes:${dateKey}:${slot}:${variant}:${gameKey}:${difficultyKey}:v2`).toString(36);
    return `rf-${dateKey.replaceAll("-", "")}-${slot.slice(0, 1)}${variant}-${digest}`;
  }

  const DAILY_SLOT_DETAILS = {
    featured: { title: "Desafio em destaque", description: "Uma partida completa com regra especial.", difficultyRanks: [2, 3, 4], rewardPoints: 3 },
    quick: { title: "Desafio rápido", description: "Uma rodada curta para manter a sequência.", difficultyRanks: [1, 2, 3], rewardPoints: 2 },
    mastery: { title: "Desafio de maestria", description: "A prova mais exigente do dia.", difficultyRanks: [4, 5], rewardPoints: 5 }
  };

  function buildDailyChallenges(dateKey, variants = {}) {
    const validDate = parseDateKey(dateKey) ? dateKey : saoPauloDateKey();
    const gameOrder = seededShuffle(GAME_KEYS, `daily-games:${validDate}:v2`);
    return DAILY_SLOTS.map((slot, index) => {
      const variant = clamp(safeInteger(variants[slot], 0, 1, 0), 0, 1);
      const details = DAILY_SLOT_DETAILS[slot];
      const random = seededRandom(`daily:${validDate}:${slot}:${variant}:v2`);
      const gameKey = gameOrder[(index + variant * 3) % gameOrder.length];
      const difficultyRank = details.difficultyRanks[Math.floor(random() * details.difficultyRanks.length)];
      const difficultyKey = DIFFICULTY_KEYS[difficultyRank - 1];
      const phaseRanges = slot === "quick" ? [1, 4] : slot === "mastery" ? [7, 10] : [3, 8];
      const phase = phaseRanges[0] + Math.floor(random() * (phaseRanges[1] - phaseRanges[0] + 1));
      const seed = `daily:${validDate}:${slot}:${variant}:${gameKey}:${difficultyKey}:${phase}:v2`;
      const settings = buildPhaseSettings(gameKey, difficultyRank, phase, seed);
      const fixedLoadout = gameKey === "luxor"
        ? seededShuffle(POWER_DEFINITIONS.map(({ key }) => key), `${seed}:powers`).slice(0, 3)
        : null;
      const id = dailyChallengeId(validDate, slot, variant, gameKey, difficultyKey);
      return {
        id,
        dateKey: validDate,
        slot,
        variant,
        gameKey,
        difficultyKey,
        difficultyRank,
        phase,
        seed,
        title: details.title,
        description: details.description,
        rewardPoints: details.rewardPoints,
        settings,
        fixedLoadout
      };
    });
  }

  const DAILY_REWARDS = [
    { type: "badge", key: "primeiro-retrato", name: "Badge Primeiro Retrato" },
    { type: "stamp", key: "folhas-douradas", name: "Carimbo Folhas Douradas" },
    { type: "powerSkin", key: "porcelana", name: "Visual Porcelana para poderes" },
    { type: "confetti", key: "petalas", name: "Confete de Pétalas" },
    { type: "title", key: "guardiao-das-memorias", name: "Título Guardião das Memórias" },
    { type: "reroll", key: "reroll-extra", name: "1 ficha extra de troca diária" },
    { type: "badge", key: "semana-de-ouro", name: "Badge Semana de Ouro" }
  ];

  function jsonSafeClone(value, depth = 0) {
    if (depth > 9) return null;
    if (value === null || typeof value === "boolean") return value;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") return cleanText(value, 5000);
    if (Array.isArray(value)) return value.slice(0, 600).map((item) => jsonSafeClone(item, depth + 1));
    if (!isPlainObject(value)) return null;
    const result = {};
    Object.entries(value).slice(0, 1200).forEach(([key, item]) => {
      if (key === "__proto__" || key === "prototype" || key === "constructor") return;
      result[cleanText(key, 80)] = jsonSafeClone(item, depth + 1);
    });
    return result;
  }

  function sanitizeIds(values) {
    return unique((Array.isArray(values) ? values : [])
      .map((value) => safeInteger(value, 1, TOTAL_STICKERS, 0))
      .filter((value) => value >= 1 && value <= TOTAL_STICKERS));
  }

  function sanitizeTextMap(source, valueLimit = 5000, keyLimit = 80) {
    if (!isPlainObject(source)) return {};
    return Object.fromEntries(Object.entries(source).slice(0, 300).map(([key, value]) => [
      cleanText(key, keyLimit),
      cleanText(value, valueLimit)
    ]));
  }

  function sanitizeProfiles(source) {
    if (!isPlainObject(source)) return {};
    const result = {};
    Object.entries(source).forEach(([key, profile]) => {
      const id = safeInteger(key, 1, TOTAL_STICKERS, 0);
      if (!id || !isPlainObject(profile)) return;
      result[String(id)] = {
        name: cleanText(profile.name || "", 120),
        info: cleanText(profile.info || "", 1000),
        text: cleanText(profile.text || "", 5000)
      };
    });
    return result;
  }

  function sanitizeStyles(source) {
    if (!isPlainObject(source)) return {};
    const result = {};
    Object.entries(source).slice(0, 30).forEach(([key, style]) => {
      if (!isPlainObject(style)) return;
      const font = cleanText(style.font, 120);
      const color = /^#[0-9a-f]{6}$/i.test(String(style.color || "")) ? String(style.color) : "#655c4c";
      result[cleanText(key, 80)] = { font, color };
    });
    return result;
  }

  function sanitizeFreeRecords(source) {
    if (!isPlainObject(source)) return {};
    const result = {};
    Object.entries(source).forEach(([key, record]) => {
      if (!isPlainObject(record) || !/^(facil|normal|dificil|extremo|inferno):(numbers|image|memory|snake|tetris|luxor|simon|lights)$/.test(key)) return;
      result[key] = {
        wins: safeInteger(record.wins, 0, 100000),
        bestPoints: safeInteger(record.bestPoints, 0, 100000000),
        bestMs: safeInteger(record.bestMs, 0, MAX_ACTIVE_MS),
        bestPhases: safeInteger(record.bestPhases, 0, FREE_PHASES),
        lastPoints: safeInteger(record.lastPoints, 0, 100000000),
        lastMs: safeInteger(record.lastMs, 0, MAX_ACTIVE_MS),
        lastPhases: safeInteger(record.lastPhases, 0, FREE_PHASES)
      };
    });
    return result;
  }

  function sanitizeFreeTotals(source) {
    if (!isPlainObject(source)) return {};
    const result = {};
    GAME_KEYS.forEach((key) => {
      const record = source[key];
      if (!isPlainObject(record)) return;
      const bestPoints = safeInteger(record.bestPoints, 0, 100000000);
      if (!bestPoints) return;
      result[key] = {
        bestPoints,
        bestMs: safeInteger(record.bestMs, 0, MAX_ACTIVE_MS),
        difficultyKey: DIFFICULTY_KEYS.includes(record.difficultyKey) ? record.difficultyKey : "normal",
        phasesCompleted: safeInteger(record.phasesCompleted, 1, FREE_PHASES, FREE_PHASES)
      };
    });
    return result;
  }

  function sanitizeFreeProgress(source) {
    if (!isPlainObject(source)) return {};
    const result = {};
    Object.entries(source).forEach(([key, record]) => {
      if (!isPlainObject(record) || !/^(facil|normal|dificil|extremo|inferno):(numbers|image|memory|snake|tetris|luxor|simon|lights)$/.test(key)) return;
      const completedPhases = safeInteger(record.completedPhases, 0, FREE_PHASES);
      if (!completedPhases) return;
      const phaseDurations = (Array.isArray(record.phaseDurations) ? record.phaseDurations : [])
        .slice(0, completedPhases)
        .map((value) => safeInteger(value, 100, MAX_ACTIVE_MS, 100));
      const phasePoints = (Array.isArray(record.phasePoints) ? record.phasePoints : [])
        .slice(0, completedPhases)
        .map((value) => safeInteger(value, 0, 10000000));
      if (phaseDurations.length !== completedPhases || phasePoints.length !== completedPhases) return;
      result[key] = {
        completedPhases,
        points: safeInteger(record.points || phasePoints.reduce((sum, value) => sum + value, 0), 0, 100000000),
        completedMs: safeInteger(record.completedMs || phaseDurations.reduce((sum, value) => sum + value, 0), 0, MAX_ACTIVE_MS),
        phaseDurations,
        phasePoints
      };
    });
    return result;
  }

  function sanitizeActiveSession(source) {
    if (!isPlainObject(source)) return null;
    const allowedKinds = ["free", "daily", "luxorCampaign"];
    if (!allowedKinds.includes(source.kind) || !GAME_KEYS.includes(source.gameKey)) return null;
    const savedAt = Date.parse(source.savedAt || "");
    if (!Number.isFinite(savedAt) || Date.now() - savedAt > 30 * 86400000 || savedAt - Date.now() > 86400000) return null;
    const result = {
      kind: source.kind,
      gameKey: source.gameKey,
      difficultyKey: DIFFICULTY_KEYS.includes(source.difficultyKey) ? source.difficultyKey : "normal",
      phase: safeInteger(source.phase, 1, FREE_PHASES, 1),
      seed: cleanText(source.seed, 180),
      savedAt: new Date(savedAt).toISOString(),
      activeElapsedMs: safeInteger(source.activeElapsedMs, 0, MAX_ACTIVE_MS),
      context: jsonSafeClone(source.context),
      game: jsonSafeClone(source.game)
    };
    if (isPlainObject(result.game)) {
      const game = result.game;
      let valid = true;
      if (source.gameKey === "numbers" || source.gameKey === "image") {
        const tiles = Array.isArray(game.tiles) ? game.tiles : [];
        valid = [9, 16, 25].includes(tiles.length) &&
          new Set(tiles.map(Number)).size === tiles.length &&
          tiles.every((value) => Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= tiles.length);
        if (valid && Array.isArray(game.rotations)) valid = [tiles.length, tiles.length + 1].includes(game.rotations.length);
      } else if (source.gameKey === "memory") {
        const deck = Array.isArray(game.deck) ? game.deck : [];
        valid = deck.length >= 8 && deck.length <= 24 && deck.length % 2 === 0 &&
          deck.every((card) => isPlainObject(card) && typeof card.key === "string");
      } else if (source.gameKey === "snake") {
        const pointIsSafe = (point) => isPlainObject(point) &&
          safeInteger(point.x, 0, 15, -1) === Number(point.x) &&
          safeInteger(point.y, 0, 15, -1) === Number(point.y);
        valid = Array.isArray(game.snake) && game.snake.length >= 3 && game.snake.length <= 256 && game.snake.every(pointIsSafe) &&
          (!Array.isArray(game.obstacles) || game.obstacles.length <= 256 && game.obstacles.every(pointIsSafe)) &&
          (!Array.isArray(game.hazards) || game.hazards.length <= 8 && game.hazards.every(pointIsSafe));
      } else if (source.gameKey === "tetris") {
        const boardIsSafe = Array.isArray(game.board) && game.board.length === 18 &&
          game.board.every((row) => Array.isArray(row) && row.length === 10);
        const matrix = game.piece?.m;
        const pieceIsSafe = !game.piece || isPlainObject(game.piece) &&
          Array.isArray(matrix) && matrix.length >= 1 && matrix.length <= 4 &&
          matrix.every((row) => Array.isArray(row) && row.length >= 1 && row.length <= 4);
        valid = boardIsSafe && pieceIsSafe && (!Array.isArray(game.queue) || game.queue.length <= 14);
      } else if (source.gameKey === "simon") {
        valid = Array.isArray(game.sequence) && game.sequence.length <= 64 &&
          game.sequence.every((value) => Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 5);
      } else if (source.gameKey === "lights") {
        const lights = Array.isArray(game.lights) ? game.lights : [];
        valid = [9, 16, 25, 36].includes(lights.length) &&
          (!Array.isArray(game.blocked) || game.blocked.length <= lights.length);
      }
      if (!valid) result.game = null;
    }
    if (source.kind === "daily") {
      result.dailyId = cleanText(source.dailyId, 120);
      result.dateKey = parseDateKey(source.dateKey) ? source.dateKey : "";
      result.slot = DAILY_SLOTS.includes(source.slot) ? source.slot : "featured";
    }
    if (source.kind === "luxorCampaign") result.level = safeInteger(source.level, 1, 40, 1);
    if (source.gameKey === "luxor" && isPlainObject(result.game)) {
      const balls = Array.isArray(result.game.balls) ? result.game.balls.slice(0, 220) : [];
      result.game.balls = balls.map((ball) => {
        if (typeof ball === "string") return { color: cleanText(ball, 20), type: "normal", hits: 1 };
        if (!isPlainObject(ball)) return { color: "azul", type: "normal", hits: 1 };
        return {
          color: cleanText(ball.color, 20),
          type: cleanText(ball.type || "normal", 20),
          hits: safeInteger(ball.hits, 0, 3, 1),
          revealed: Boolean(ball.revealed),
          locked: Boolean(ball.locked)
        };
      });
      result.game.headProgress = clamp(asNumber(result.game.headProgress, 0.24), 0, 1);
      result.game.wave = safeInteger(result.game.wave, 1, 3, 1);
      result.game.score = safeInteger(result.game.score, 0, 100000000);
      result.game.powerCharge = safeInteger(result.game.powerCharge, 0, 100);
    }
    return result;
  }

  function defaultDaily() {
    return {
      currentDate: "",
      selectedId: "",
      days: {},
      streak: { current: 0, best: 0, lastCompletedDate: "", graceAvailable: true, graceUsedDate: "" },
      rewards: { trackDay: 0, claimedDates: [] },
      lastTrusted: { dateKey: "", epoch: 0 },
      activeSession: null
    };
  }

  function sanitizeDaily(source) {
    const base = defaultDaily();
    if (!isPlainObject(source)) return base;
    const days = {};
    if (isPlainObject(source.days)) {
      Object.entries(source.days)
        .filter(([dateKey]) => parseDateKey(dateKey))
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 400)
        .forEach(([dateKey, day]) => {
          if (!isPlainObject(day)) return;
          const challenges = {};
          DAILY_SLOTS.forEach((slot) => {
            const item = day.challenges?.[slot];
            if (!isPlainObject(item)) return;
            challenges[slot] = {
              id: cleanText(item.id, 120),
              variant: safeInteger(item.variant, 0, 1),
              attempts: safeInteger(item.attempts, 0, 10000),
              completed: Boolean(item.completed),
              bestScore: safeInteger(item.bestScore, 0, 100000000),
              bestTime: safeInteger(item.bestTime, 0, MAX_ACTIVE_MS),
              lastScore: safeInteger(item.lastScore, 0, 100000000),
              lastTime: safeInteger(item.lastTime, 0, MAX_ACTIVE_MS)
            };
          });
          days[dateKey] = {
            challenges,
            rerollUsed: Boolean(day.rerollUsed),
            rerolledSlot: DAILY_SLOTS.includes(day.rerolledSlot) ? day.rerolledSlot : "",
            completed: Boolean(day.completed),
            rewardAvailable: Boolean(day.rewardAvailable),
            rewardClaimed: Boolean(day.rewardClaimed)
          };
        });
    }
    const streak = isPlainObject(source.streak) ? source.streak : {};
    const rewards = isPlainObject(source.rewards) ? source.rewards : {};
    const lastTrusted = isPlainObject(source.lastTrusted) ? source.lastTrusted : {};
    return {
      currentDate: parseDateKey(source.currentDate) ? source.currentDate : "",
      selectedId: cleanText(source.selectedId, 120),
      days,
      streak: {
        current: safeInteger(streak.current, 0, 100000),
        best: safeInteger(streak.best, 0, 100000),
        lastCompletedDate: parseDateKey(streak.lastCompletedDate) ? streak.lastCompletedDate : "",
        graceAvailable: streak.graceAvailable !== false,
        graceUsedDate: parseDateKey(streak.graceUsedDate) ? streak.graceUsedDate : ""
      },
      rewards: {
        trackDay: safeInteger(rewards.trackDay, 0, 6),
        claimedDates: unique((Array.isArray(rewards.claimedDates) ? rewards.claimedDates : []).filter(parseDateKey)).slice(-400)
      },
      lastTrusted: {
        dateKey: parseDateKey(lastTrusted.dateKey) ? lastTrusted.dateKey : "",
        epoch: safeInteger(lastTrusted.epoch, 0, Number.MAX_SAFE_INTEGER)
      },
      activeSession: sanitizeActiveSession(source.activeSession)
    };
  }

  function defaultLuxor() {
    return {
      campaign: { unlockedLevel: 1, levels: {}, completedChapters: [] },
      equippedPowers: ["memoryFlame", "timeKeepsake", "reverseCurrent"],
      stats: { highestScore: 0, bestCombo: 0, bestChain: 0, bestAccuracy: 0 },
      activeSession: null
    };
  }

  function sanitizeLuxor(source) {
    const base = defaultLuxor();
    if (!isPlainObject(source)) return base;
    const validPowerKeys = new Set(POWER_DEFINITIONS.map(({ key }) => key));
    const equipped = unique((Array.isArray(source.equippedPowers) ? source.equippedPowers : [])
      .filter((key) => validPowerKeys.has(key))).slice(0, 3);
    const levels = {};
    if (isPlainObject(source.campaign?.levels)) {
      Object.entries(source.campaign.levels).forEach(([key, record]) => {
        const level = safeInteger(key, 1, 40, 0);
        if (!level || !isPlainObject(record)) return;
        levels[String(level)] = {
          completed: Boolean(record.completed),
          bestScore: safeInteger(record.bestScore, 0, 100000000),
          bestTime: safeInteger(record.bestTime, 0, MAX_ACTIVE_MS),
          stars: safeInteger(record.stars, 0, 3),
          maxCombo: safeInteger(record.maxCombo, 0, 10000),
          maxChain: safeInteger(record.maxChain, 0, 10000),
          accuracy: clamp(asNumber(record.accuracy, 0), 0, 100),
          attempts: safeInteger(record.attempts, 0, 100000)
        };
      });
    }
    const completedChapters = unique((Array.isArray(source.campaign?.completedChapters) ? source.campaign.completedChapters : [])
      .map((value) => safeInteger(value, 1, 8, 0)).filter(Boolean));
    const stats = isPlainObject(source.stats) ? source.stats : {};
    return {
      campaign: {
        unlockedLevel: safeInteger(source.campaign?.unlockedLevel, 1, 40, 1),
        levels,
        completedChapters
      },
      equippedPowers: equipped.length === 3 ? equipped : base.equippedPowers,
      stats: {
        highestScore: safeInteger(stats.highestScore, 0, 100000000),
        bestCombo: safeInteger(stats.bestCombo, 0, 10000),
        bestChain: safeInteger(stats.bestChain, 0, 10000),
        bestAccuracy: clamp(asNumber(stats.bestAccuracy, 0), 0, 100)
      },
      activeSession: sanitizeActiveSession(source.activeSession)
    };
  }

  function sanitizeCosmetics(source) {
    const valid = isPlainObject(source) ? source : {};
    const allowedByType = DAILY_REWARDS.reduce((result, reward) => {
      if (!result[reward.type]) result[reward.type] = new Set();
      result[reward.type].add(reward.key);
      return result;
    }, {});
    const stringArray = (value, type) => unique((Array.isArray(value) ? value : [])
      .map((item) => cleanText(item, 80))
      .filter((item) => item && allowedByType[type]?.has(item)));
    const badges = stringArray(valid.badges, "badge");
    const stamps = stringArray(valid.stamps, "stamp");
    const powerSkins = stringArray(valid.powerSkins, "powerSkin");
    const confettiStyles = stringArray(valid.confettiStyles, "confetti");
    const titles = stringArray(valid.titles, "title");
    const selected = (value, collection) => {
      const key = cleanText(value, 80);
      return collection.includes(key) ? key : "";
    };
    return {
      badges,
      stamps,
      powerSkins,
      confettiStyles,
      titles,
      rerollTokens: safeInteger(valid.rerollTokens, 0, 999),
      selectedBadge: selected(valid.selectedBadge, badges),
      selectedStamp: selected(valid.selectedStamp, stamps),
      selectedPowerSkin: selected(valid.selectedPowerSkin, powerSkins),
      selectedConfetti: selected(valid.selectedConfetti, confettiStyles),
      selectedTitle: selected(valid.selectedTitle, titles)
    };
  }

  function defaultStructuredSave() {
    const now = isoNow();
    return {
      schemaVersion: SCHEMA_VERSION,
      revision: 0,
      createdAt: now,
      updatedAt: now,
      album: { page: 1, unlocked: [], placed: [], notes: {}, noteStyles: {}, profiles: {} },
      player: { name: "" },
      settings: {
        volume: 35,
        guideMode: false,
        reducedMotion: false,
        highContrast: false,
        accessibilityAimAssist: false
      },
      campaigns: { seedVersion: 2 },
      freeChallenges: { records: {}, gameTotals: {}, progress: {}, activeSession: null },
      dailyChallenges: defaultDaily(),
      luxor: defaultLuxor(),
      achievements: { unlocked: [], counters: {} },
      cosmetics: sanitizeCosmetics({}),
      cloudSync: { status: "local", pending: false, lastSyncedAt: "", lastCloudRevision: 0, conflict: null }
    };
  }

  function sanitizeStructuredSave(source) {
    if (!isPlainObject(source)) return null;
    const defaults = defaultStructuredSave();
    const album = isPlainObject(source.album) ? source.album : {};
    const unlocked = sanitizeIds(album.unlocked);
    const placed = sanitizeIds(album.placed).filter((id) => unlocked.includes(id));
    const settings = isPlainObject(source.settings) ? source.settings : {};
    const player = isPlainObject(source.player) ? source.player : {};
    const free = isPlainObject(source.freeChallenges) ? source.freeChallenges : {};
    const achievements = isPlainObject(source.achievements) ? source.achievements : {};
    const cloud = isPlainObject(source.cloudSync) ? source.cloudSync : {};
    const createdAt = Number.isFinite(Date.parse(source.createdAt || "")) ? new Date(source.createdAt).toISOString() : defaults.createdAt;
    const updatedAt = Number.isFinite(Date.parse(source.updatedAt || "")) ? new Date(source.updatedAt).toISOString() : createdAt;
    const statusValues = ["local", "syncing", "synced", "offline", "conflict"];
    return {
      schemaVersion: SCHEMA_VERSION,
      revision: safeInteger(source.revision, 0, Number.MAX_SAFE_INTEGER),
      createdAt,
      updatedAt,
      album: {
        page: safeInteger(album.page, 1, 12, 1),
        unlocked,
        placed,
        notes: sanitizeTextMap(album.notes),
        noteStyles: sanitizeStyles(album.noteStyles),
        profiles: sanitizeProfiles(album.profiles)
      },
      player: { name: cleanName(player.name || album.notes?.dono) },
      settings: {
        volume: safeInteger(settings.volume, 0, 100, 35),
        guideMode: Boolean(settings.guideMode),
        reducedMotion: Boolean(settings.reducedMotion),
        highContrast: Boolean(settings.highContrast),
        accessibilityAimAssist: Boolean(settings.accessibilityAimAssist)
      },
      campaigns: jsonSafeClone(source.campaigns) || { seedVersion: 2 },
      freeChallenges: {
        records: sanitizeFreeRecords(free.records),
        gameTotals: sanitizeFreeTotals(free.gameTotals),
        progress: sanitizeFreeProgress(free.progress),
        activeSession: sanitizeActiveSession(free.activeSession)
      },
      dailyChallenges: sanitizeDaily(source.dailyChallenges),
      luxor: sanitizeLuxor(source.luxor),
      achievements: {
        unlocked: unique((Array.isArray(achievements.unlocked) ? achievements.unlocked : []).map((item) => cleanText(item, 80)).filter(Boolean)).slice(0, 500),
        counters: jsonSafeClone(achievements.counters) || {}
      },
      cosmetics: sanitizeCosmetics(source.cosmetics),
      cloudSync: {
        status: statusValues.includes(cloud.status) ? cloud.status : "local",
        pending: Boolean(cloud.pending),
        lastSyncedAt: Number.isFinite(Date.parse(cloud.lastSyncedAt || "")) ? new Date(cloud.lastSyncedAt).toISOString() : "",
        lastCloudRevision: safeInteger(cloud.lastCloudRevision, 0, Number.MAX_SAFE_INTEGER),
        conflict: jsonSafeClone(cloud.conflict)
      }
    };
  }

  function migrateLegacySave(legacy) {
    const structured = defaultStructuredSave();
    if (!isPlainObject(legacy)) return structured;
    structured.album.page = safeInteger(legacy.page, 1, 12, 1);
    structured.album.unlocked = sanitizeIds(legacy.unlocked);
    structured.album.placed = sanitizeIds(legacy.placed).filter((id) => structured.album.unlocked.includes(id));
    structured.album.notes = sanitizeTextMap(legacy.notes);
    structured.album.noteStyles = sanitizeStyles(legacy.noteStyles);
    structured.album.profiles = sanitizeProfiles(legacy.profiles);
    structured.player.name = cleanName(legacy.playerName || legacy.notes?.dono);
    structured.settings.volume = safeInteger(legacy.volume, 0, 100, 35);
    structured.settings.guideMode = Boolean(legacy.guideMode);
    structured.freeChallenges.records = sanitizeFreeRecords(legacy.freeRecords);
    structured.freeChallenges.gameTotals = sanitizeFreeTotals(legacy.freeGameTotals);
    structured.freeChallenges.progress = sanitizeFreeProgress(legacy.freeProgress);
    structured.updatedAt = isoNow();
    return structured;
  }

  function structuredToRuntime(structured) {
    const save = sanitizeStructuredSave(structured) || defaultStructuredSave();
    const defaults = defaultStructuredSave();
    const activeSession = save.luxor.activeSession || save.dailyChallenges.activeSession || save.freeChallenges.activeSession || null;
    return {
      page: save.album.page,
      unlocked: [...save.album.unlocked],
      placed: [...save.album.placed],
      notes: { ...save.album.notes },
      noteStyles: jsonSafeClone(save.album.noteStyles) || {},
      profiles: jsonSafeClone(save.album.profiles) || {},
      freeRecords: jsonSafeClone(save.freeChallenges.records) || {},
      freeGameTotals: jsonSafeClone(save.freeChallenges.gameTotals) || {},
      freeProgress: jsonSafeClone(save.freeChallenges.progress) || {},
      playerName: save.player.name,
      volume: save.settings.volume,
      guideMode: save.settings.guideMode,
      reducedMotion: save.settings.reducedMotion,
      highContrast: save.settings.highContrast,
      accessibilityAimAssist: save.settings.accessibilityAimAssist,
      campaigns: jsonSafeClone(save.campaigns) || {},
      dailyChallenges: jsonSafeClone(save.dailyChallenges) || defaultDaily(),
      luxor: jsonSafeClone(save.luxor) || defaultLuxor(),
      achievements: jsonSafeClone(save.achievements) || { unlocked: [], counters: {} },
      cosmetics: jsonSafeClone(save.cosmetics) || sanitizeCosmetics({}),
      cloudSync: jsonSafeClone(save.cloudSync) || defaults.cloudSync,
      activeSession,
      __meta: {
        schemaVersion: SCHEMA_VERSION,
        revision: save.revision,
        createdAt: save.createdAt,
        updatedAt: save.updatedAt
      }
    };
  }

  function runtimeToStructured(runtime, revisionOverride) {
    const source = isPlainObject(runtime) ? runtime : {};
    const defaults = defaultStructuredSave();
    const meta = isPlainObject(source.__meta) ? source.__meta : {};
    const active = sanitizeActiveSession(source.activeSession);
    const luxor = sanitizeLuxor(source.luxor);
    const daily = sanitizeDaily(source.dailyChallenges);
    const structured = {
      schemaVersion: SCHEMA_VERSION,
      revision: safeInteger(revisionOverride ?? meta.revision, 0, Number.MAX_SAFE_INTEGER),
      createdAt: Number.isFinite(Date.parse(meta.createdAt || "")) ? new Date(meta.createdAt).toISOString() : defaults.createdAt,
      updatedAt: isoNow(),
      album: {
        page: source.page,
        unlocked: source.unlocked,
        placed: source.placed,
        notes: source.notes,
        noteStyles: source.noteStyles,
        profiles: source.profiles
      },
      player: { name: source.playerName },
      settings: {
        volume: source.volume,
        guideMode: source.guideMode,
        reducedMotion: source.reducedMotion,
        highContrast: source.highContrast,
        accessibilityAimAssist: source.accessibilityAimAssist
      },
      campaigns: source.campaigns,
      freeChallenges: {
        records: source.freeRecords,
        gameTotals: source.freeGameTotals,
        progress: source.freeProgress,
        activeSession: active?.kind === "free" ? active : null
      },
      dailyChallenges: {
        ...daily,
        activeSession: active?.kind === "daily" ? active : null
      },
      luxor: {
        ...luxor,
        activeSession: active?.kind === "luxorCampaign" || active?.gameKey === "luxor" ? active : null
      },
      achievements: source.achievements,
      cosmetics: source.cosmetics,
      cloudSync: source.cloudSync
    };
    return sanitizeStructuredSave(structured) || defaults;
  }

  function summaryForSave(structured) {
    const save = sanitizeStructuredSave(structured);
    if (!save) return null;
    const completedCampaignKeys = new Set([
      ...Object.entries(save.freeChallenges.progress)
        .filter(([, record]) => record.completedPhases >= FREE_PHASES)
        .map(([key]) => key),
      ...Object.entries(save.freeChallenges.records)
        .filter(([, record]) => record.bestPhases >= FREE_PHASES)
        .map(([key]) => key)
    ]);
    const dailyCompletions = Object.values(save.dailyChallenges.days).filter((day) => day.completed).length;
    const luxorLevels = Object.values(save.luxor.campaign.levels).filter((level) => level.completed).length;
    return {
      schemaVersion: save.schemaVersion,
      revision: save.revision,
      playerName: save.player.name || "Jogador",
      unlocked: save.album.unlocked.length,
      placed: save.album.placed.length,
      completedCampaigns: completedCampaignKeys.size,
      dailyCompletions,
      luxorLevels,
      updatedAt: save.updatedAt
    };
  }

  function mergeSafeStructured(localSource, cloudSource) {
    const local = sanitizeStructuredSave(localSource) || defaultStructuredSave();
    const cloud = sanitizeStructuredSave(cloudSource) || defaultStructuredSave();
    const merged = sanitizeStructuredSave(local) || defaultStructuredSave();
    merged.album.unlocked = unique([...local.album.unlocked, ...cloud.album.unlocked]).sort((a, b) => a - b);
    merged.album.placed = unique([...local.album.placed, ...cloud.album.placed])
      .filter((id) => merged.album.unlocked.includes(id)).sort((a, b) => a - b);
    merged.album.notes = { ...cloud.album.notes, ...local.album.notes };
    merged.album.noteStyles = { ...cloud.album.noteStyles, ...local.album.noteStyles };
    merged.album.profiles = { ...cloud.album.profiles, ...local.album.profiles };
    merged.player.name = local.player.name || cloud.player.name;
    GAME_KEYS.forEach((gameKey) => {
      const localTotal = local.freeChallenges.gameTotals[gameKey];
      const cloudTotal = cloud.freeChallenges.gameTotals[gameKey];
      if (!localTotal && cloudTotal) merged.freeChallenges.gameTotals[gameKey] = cloudTotal;
      else if (localTotal && cloudTotal) {
        merged.freeChallenges.gameTotals[gameKey] =
          cloudTotal.bestPoints > localTotal.bestPoints ||
          cloudTotal.bestPoints === localTotal.bestPoints && cloudTotal.bestMs < localTotal.bestMs
            ? cloudTotal : localTotal;
      }
    });
    Object.keys({ ...local.freeChallenges.progress, ...cloud.freeChallenges.progress }).forEach((key) => {
      const localProgress = local.freeChallenges.progress[key];
      const cloudProgress = cloud.freeChallenges.progress[key];
      if (!localProgress) merged.freeChallenges.progress[key] = cloudProgress;
      else if (!cloudProgress) merged.freeChallenges.progress[key] = localProgress;
      else merged.freeChallenges.progress[key] =
        cloudProgress.completedPhases > localProgress.completedPhases ||
        cloudProgress.completedPhases === localProgress.completedPhases && cloudProgress.points > localProgress.points
          ? cloudProgress : localProgress;
    });
    Object.keys({ ...local.freeChallenges.records, ...cloud.freeChallenges.records }).forEach((key) => {
      const a = local.freeChallenges.records[key];
      const b = cloud.freeChallenges.records[key];
      if (!a) merged.freeChallenges.records[key] = b;
      else if (!b) merged.freeChallenges.records[key] = a;
      else merged.freeChallenges.records[key] = {
        ...a,
        wins: Math.max(a.wins, b.wins),
        bestPoints: Math.max(a.bestPoints, b.bestPoints),
        bestMs: a.bestPoints > b.bestPoints ? a.bestMs : b.bestPoints > a.bestPoints ? b.bestMs : Math.min(a.bestMs || Infinity, b.bestMs || Infinity),
        bestPhases: Math.max(a.bestPhases, b.bestPhases)
      };
    });
    Object.entries(cloud.dailyChallenges.days).forEach(([dateKey, cloudDay]) => {
      const localDay = merged.dailyChallenges.days[dateKey];
      if (!localDay) {
        merged.dailyChallenges.days[dateKey] = cloudDay;
        return;
      }
      DAILY_SLOTS.forEach((slot) => {
        const a = localDay.challenges?.[slot];
        const b = cloudDay.challenges?.[slot];
        if (!a && b) localDay.challenges[slot] = b;
        else if (a && b) localDay.challenges[slot] = {
          ...a,
          completed: a.completed || b.completed,
          attempts: Math.max(a.attempts, b.attempts),
          bestScore: Math.max(a.bestScore, b.bestScore),
          bestTime: a.bestScore > b.bestScore ? a.bestTime : b.bestScore > a.bestScore ? b.bestTime : Math.min(a.bestTime || Infinity, b.bestTime || Infinity)
        };
      });
      localDay.rewardClaimed = localDay.rewardClaimed || cloudDay.rewardClaimed;
      localDay.rewardAvailable = localDay.rewardAvailable || cloudDay.rewardAvailable;
      if (localDay.rewardClaimed) localDay.rewardAvailable = false;
      localDay.completed = localDay.completed || cloudDay.completed;
      localDay.rerollUsed = localDay.rerollUsed || cloudDay.rerollUsed;
    });
    merged.dailyChallenges.streak.current = Math.max(local.dailyChallenges.streak.current, cloud.dailyChallenges.streak.current);
    merged.dailyChallenges.streak.best = Math.max(local.dailyChallenges.streak.best, cloud.dailyChallenges.streak.best);
    merged.dailyChallenges.rewards.claimedDates = unique([
      ...local.dailyChallenges.rewards.claimedDates,
      ...cloud.dailyChallenges.rewards.claimedDates
    ]);
    merged.dailyChallenges.rewards.trackDay =
      cloud.dailyChallenges.rewards.claimedDates.length > local.dailyChallenges.rewards.claimedDates.length
        ? cloud.dailyChallenges.rewards.trackDay
        : local.dailyChallenges.rewards.trackDay;
    Object.entries(cloud.luxor.campaign.levels).forEach(([level, cloudRecord]) => {
      const localRecord = merged.luxor.campaign.levels[level];
      if (!localRecord) merged.luxor.campaign.levels[level] = cloudRecord;
      else merged.luxor.campaign.levels[level] = {
        completed: localRecord.completed || cloudRecord.completed,
        bestScore: Math.max(localRecord.bestScore, cloudRecord.bestScore),
        bestTime: localRecord.bestScore > cloudRecord.bestScore ? localRecord.bestTime : cloudRecord.bestScore > localRecord.bestScore ? cloudRecord.bestTime : Math.min(localRecord.bestTime || Infinity, cloudRecord.bestTime || Infinity),
        stars: Math.max(localRecord.stars, cloudRecord.stars),
        maxCombo: Math.max(localRecord.maxCombo, cloudRecord.maxCombo),
        maxChain: Math.max(localRecord.maxChain, cloudRecord.maxChain),
        accuracy: Math.max(localRecord.accuracy, cloudRecord.accuracy),
        attempts: Math.max(localRecord.attempts, cloudRecord.attempts)
      };
    });
    merged.luxor.campaign.unlockedLevel = Math.max(local.luxor.campaign.unlockedLevel, cloud.luxor.campaign.unlockedLevel);
    merged.luxor.campaign.completedChapters = unique([...local.luxor.campaign.completedChapters, ...cloud.luxor.campaign.completedChapters]);
    ["badges", "stamps", "powerSkins", "confettiStyles", "titles"].forEach((field) => {
      merged.cosmetics[field] = unique([...local.cosmetics[field], ...cloud.cosmetics[field]]);
    });
    merged.cosmetics.rerollTokens = Math.max(local.cosmetics.rerollTokens, cloud.cosmetics.rerollTokens);
    merged.achievements.unlocked = unique([...local.achievements.unlocked, ...cloud.achievements.unlocked]);
    merged.revision = Math.max(local.revision, cloud.revision) + 1;
    merged.updatedAt = isoNow();
    merged.cloudSync.conflict = null;
    merged.cloudSync.status = "syncing";
    merged.cloudSync.pending = true;
    return sanitizeStructuredSave(merged);
  }

  class SaveManager {
    constructor(options = {}) {
      this.onError = typeof options.onError === "function" ? options.onError : () => {};
      this.onExternalUpdate = typeof options.onExternalUpdate === "function" ? options.onExternalUpdate : () => {};
      this.debounceMs = safeInteger(options.debounceMs, 150, 5000, 420);
      this.timer = 0;
      this.pendingRuntime = null;
      this.lastSerialized = "";
      this.storageHandler = (event) => {
        if (event.key !== PRIMARY_KEY || !event.newValue || event.newValue === this.lastSerialized) return;
        try {
          const parsed = sanitizeStructuredSave(JSON.parse(event.newValue));
          if (!parsed) return;
          this.onExternalUpdate(structuredToRuntime(parsed), parsed);
        } catch {
          this.onError("Outra aba tentou enviar um save inválido. Seu progresso atual foi preservado.");
        }
      };
      window.addEventListener("storage", this.storageHandler);
    }

    parseStored(key) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return sanitizeStructuredSave(parsed);
      } catch {
        return null;
      }
    }

    load() {
      let save = this.parseStored(PRIMARY_KEY);
      let source = "primary";
      if (!save) {
        save = this.parseStored(BACKUP_KEY);
        source = save ? "backup" : "new";
      }
      if (!save) {
        try {
          const legacyRaw = localStorage.getItem(LEGACY_KEY);
          const legacy = legacyRaw ? JSON.parse(legacyRaw) : null;
          if (isPlainObject(legacy)) {
            try {
              if (!localStorage.getItem(LEGACY_BACKUP_KEY)) localStorage.setItem(LEGACY_BACKUP_KEY, legacyRaw);
            } catch { /* a chave v1 original continua preservada */ }
            save = migrateLegacySave(legacy);
            source = "legacy";
          }
        } catch {
          source = "new";
        }
      }
      save ||= defaultStructuredSave();
      const runtime = structuredToRuntime(save);
      if (source === "backup") this.onError("O save principal estava danificado e foi recuperado pelo backup.");
      if (source === "legacy" || source === "backup") this.saveNow(runtime, { preserveRevision: source === "backup" });
      return { runtime, structured: save, source };
    }

    schedule(runtime, options = {}) {
      this.pendingRuntime = runtime;
      if (options.immediate) return this.saveNow(runtime);
      clearTimeout(this.timer);
      this.timer = window.setTimeout(() => this.saveNow(this.pendingRuntime), this.debounceMs);
      return null;
    }

    saveNow(runtime, options = {}) {
      clearTimeout(this.timer);
      this.timer = 0;
      this.pendingRuntime = null;
      try {
        const previous = this.parseStored(PRIMARY_KEY);
        const currentRevision = Math.max(
          safeInteger(runtime?.__meta?.revision, 0, Number.MAX_SAFE_INTEGER),
          safeInteger(previous?.revision, 0, Number.MAX_SAFE_INTEGER)
        );
        const revision = options.preserveRevision ? currentRevision : currentRevision + 1;
        const structured = runtimeToStructured(runtime, revision);
        const serialized = JSON.stringify(structured);
        if (previous) localStorage.setItem(BACKUP_KEY, JSON.stringify(previous));
        localStorage.setItem(PRIMARY_KEY, serialized);
        this.lastSerialized = serialized;
        runtime.__meta = {
          schemaVersion: SCHEMA_VERSION,
          revision: structured.revision,
          createdAt: structured.createdAt,
          updatedAt: structured.updatedAt
        };
        return structured;
      } catch (error) {
        const quota = error?.name === "QuotaExceededError" || error?.code === 22;
        this.onError(quota
          ? "O armazenamento deste navegador está cheio. Exporte um backup antes de continuar."
          : "Não foi possível salvar agora. O progresso continua aberto nesta sessão.");
        return null;
      }
    }

    flush(runtime) {
      return this.saveNow(runtime || this.pendingRuntime);
    }

    export(runtime) {
      const structured = runtimeToStructured(runtime, safeInteger(runtime?.__meta?.revision, 0, Number.MAX_SAFE_INTEGER));
      return {
        filename: `recordacoes-em-familia-save-${saoPauloDateKey()}.json`,
        text: JSON.stringify(structured, null, 2),
        summary: summaryForSave(structured)
      };
    }

    inspectImport(text) {
      if (typeof text !== "string" || text.length > 8 * 1024 * 1024) throw new Error("O arquivo é grande demais para ser um save válido.");
      let parsed;
      try { parsed = JSON.parse(text); } catch { throw new Error("O arquivo não contém um JSON válido."); }
      const structured = parsed?.schemaVersion === SCHEMA_VERSION
        ? sanitizeStructuredSave(parsed)
        : isPlainObject(parsed) && ("unlocked" in parsed || "placed" in parsed) ? migrateLegacySave(parsed) : null;
      if (!structured) throw new Error("O arquivo não é compatível com Recordações em Família.");
      return { structured, runtime: structuredToRuntime(structured), summary: summaryForSave(structured) };
    }

    import(structured, runtimeToBackup) {
      const valid = sanitizeStructuredSave(structured);
      if (!valid) throw new Error("O save importado não passou na validação.");
      if (runtimeToBackup) {
        const backup = runtimeToStructured(runtimeToBackup, safeInteger(runtimeToBackup?.__meta?.revision, 0, Number.MAX_SAFE_INTEGER));
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
      }
      valid.revision = Math.max(valid.revision, safeInteger(runtimeToBackup?.__meta?.revision, 0)) + 1;
      valid.updatedAt = isoNow();
      const serialized = JSON.stringify(valid);
      localStorage.setItem(PRIMARY_KEY, serialized);
      this.lastSerialized = serialized;
      return structuredToRuntime(valid);
    }

    destroy() {
      clearTimeout(this.timer);
      window.removeEventListener("storage", this.storageHandler);
    }
  }

  window.RecordacoesCore = Object.freeze({
    TOTAL_STICKERS,
    SCHEMA_VERSION,
    LEGACY_KEY,
    PRIMARY_KEY,
    BACKUP_KEY,
    FREE_PHASES,
    GAME_KEYS: Object.freeze([...GAME_KEYS]),
    DIFFICULTY_KEYS: Object.freeze([...DIFFICULTY_KEYS]),
    DAILY_SLOTS: Object.freeze([...DAILY_SLOTS]),
    DAILY_SLOT_DETAILS: Object.freeze(DAILY_SLOT_DETAILS),
    DAILY_REWARDS: Object.freeze(DAILY_REWARDS.map((item) => Object.freeze({ ...item }))),
    POWER_DEFINITIONS: Object.freeze(POWER_DEFINITIONS.map((item) => Object.freeze({ ...item }))),
    LUXOR_CHAPTERS: Object.freeze(LUXOR_CHAPTERS.map((item) => Object.freeze({ ...item }))),
    PHASE_BLUEPRINTS: Object.freeze(PHASE_BLUEPRINTS),
    clamp,
    hash32,
    seededRandom,
    seededShuffle,
    saoPauloDateKey,
    dateDifferenceDays,
    addDays,
    millisecondsToNextSaoPauloDay,
    formatCountdown,
    buildPhaseSettings,
    buildDailyChallenges,
    dailyChallengeId,
    buildLuxorLevel,
    defaultStructuredSave,
    defaultDaily,
    defaultLuxor,
    sanitizeStructuredSave,
    sanitizeActiveSession,
    structuredToRuntime,
    runtimeToStructured,
    summaryForSave,
    mergeSafeStructured,
    SaveManager
  });
})();
