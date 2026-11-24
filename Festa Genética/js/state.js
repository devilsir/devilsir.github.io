'use strict';
/**
 * state.js — Persistência local de progresso, patentes da Divisão de Perícia,
 * conquistas, Herbário e estatísticas acumuladas.
 */
const GameState = (() => {
  const STORAGE_KEY = 'dossie46_pericia_state_v1';

  const RANKS = [
    { level: 1, title: 'Estagiário de Perícia', minXp: 0, badgeKey: 'estagiario', tier: 'Classe I' },
    { level: 2, title: 'Auxiliar Forense', minXp: 260, badgeKey: 'estagiario', tier: 'Classe II' },
    { level: 3, title: 'Perito Hereditário', minXp: 640, badgeKey: 'perito', tier: 'Classe III' },
    { level: 4, title: 'Perito Sênior', minXp: 1200, badgeKey: 'perito', tier: 'Classe IV' },
    { level: 5, title: 'Perito-Chefe', minXp: 2000, badgeKey: 'chefe', tier: 'Direção' },
  ];

  const ACHIEVEMENTS = [
    { id: 'primeiro_mandado', iconKey: 'stamp', title: 'Primeiro Mandado', desc: 'Conclua seu primeiro caso no arquivo do Dossiê 46.', xp: 60 },
    { id: 'olho_clinico', iconKey: 'magnifier', title: 'Olho Clínico', desc: 'Feche um caso do Dossiê 46 de primeira e sem pedir ajuda ao laboratório.', xp: 110 },
    { id: 'pericia_em_serie', iconKey: 'folder', title: 'Perito Impecável', desc: 'Confirme 3 casos do Dossiê 46 em sequência na primeira tentativa.', xp: 180 },
    { id: 'mestre_epistasia', iconKey: 'dna', title: 'Mestre da Epistasia', desc: 'Conclua o Caso 10 decifrando o efeito epistático do albinismo.', xp: 200 },
    { id: 'primeiro_broto', iconKey: 'leaf', title: 'Primeiro Broto', desc: 'Realize seu primeiro cruzamento botânico na Estufa de Mendel.', xp: 50 },
    { id: 'sem_raiox', iconKey: 'xray', title: 'Raciocínio Puro', desc: 'Conclua uma missão da Estufa sem ativar o Raio-X Genético.', xp: 100 },
    { id: 'analista_teste', iconKey: 'flask', title: 'Analista de Cruzamento-Teste', desc: 'Emita o laudo correto no Cruzamento-Teste da Estufa.', xp: 120 },
    { id: 'colecionador_100', iconKey: 'book', title: 'Acervo Completo', desc: 'Catalogue todas as 12 variedades no Herbário.', xp: 250 },
  ];

  function defaultData() {
    return {
      version: 4,
      xp: 0,
      greenhouse: {
        unlocked: 1,
        stars: {},
        noXrayWins: {},
        bestGens: {},
        totalCrosses: 0,
      },
      herbarium: {
        discovered: {},
        multiDiscovered: {},
      },
      shop: {
        credits: 220,
        day: 1,
        ordersCompleted: 0,
        reputation: 4.6,
        totalCrosses: 0,
        potCapacity: 8,
        unlockedSpecies: ['flor_mendel', 'orquidea', 'tulipa', 'girassol', 'rosa', 'cerejeira', 'macieira', 'cacto', 'dioneia', 'milho', 'soja', 'tomate', 'morango'],
        inventory: null, // inicializado sob demanda com as matrizes reprodutivas
        orders: null,
        nextPlantId: 100,
        nextOrderId: 1,
      },
      sandbox: {
        totalCrosses: 0,
        totalSeedlings: 0,
        byPair: {},
      },
      detective: {
        unlocked: 1,
        stars: {},
        solved: {},
        streak: 0,
        bestStreak: 0,
      },
      achievements: {},
      settings: {
        sfx: true,
        ambient: false,
        xray: false,
      },
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      const parsed = JSON.parse(raw);
      const base = defaultData();
      return {
        ...base,
        ...parsed,
        greenhouse: { ...base.greenhouse, ...(parsed.greenhouse || {}) },
        herbarium: {
          ...base.herbarium,
          ...(parsed.herbarium || {}),
          discovered: { ...(parsed.herbarium && parsed.herbarium.discovered ? parsed.herbarium.discovered : {}) },
          multiDiscovered: { ...(parsed.herbarium && parsed.herbarium.multiDiscovered ? parsed.herbarium.multiDiscovered : {}) },
        },
        shop: { ...base.shop, ...(parsed.shop || {}) },
        sandbox: { ...base.sandbox, ...(parsed.sandbox || {}) },
        detective: { ...base.detective, ...(parsed.detective || {}) },
        settings: { ...base.settings, ...(parsed.settings || {}) },
        achievements: { ...(parsed.achievements || {}) },
      };
    } catch (e) {
      return defaultData();
    }
  }

  let data = load();
  const listeners = new Set();

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* indisponível */ }
    listeners.forEach(fn => { try { fn(data); } catch (e) { /* ignore */ } });
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function getRank(xp = data.xp) {
    let current = RANKS[0];
    for (const r of RANKS) {
      if (xp >= r.minXp) current = r;
    }
    const idx = RANKS.indexOf(current);
    const next = RANKS[idx + 1] || null;
    const pct = next
      ? Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100))
      : 100;
    return { ...current, next, pct, xp };
  }

  function addXP(amount) {
    if (!amount || amount <= 0) return { leveledUp: false, rank: getRank() };
    const before = getRank().level;
    data.xp += Math.round(amount);
    const after = getRank();
    persist();
    return { leveledUp: after.level > before, rank: after };
  }

  function unlockAchievement(id) {
    if (data.achievements[id]) return null;
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return null;
    data.achievements[id] = Date.now();
    data.xp += def.xp;
    persist();
    if (typeof UI !== 'undefined' && typeof UI.showAchievement === 'function') {
      UI.showAchievement(def);
    }
    return def;
  }

  function discoverSpecies(genotype, speciesId = 'flor_mendel') {
    if (typeof Genetics === 'undefined') return false;
    if (!data.herbarium.multiDiscovered) data.herbarium.multiDiscovered = {};

    const ph = Genetics.phenotypeFor(speciesId, genotype);
    const multiKey = Genetics.phenoKeyFor(speciesId, ph);
    const isNewMulti = !data.herbarium.multiDiscovered[multiKey];
    if (isNewMulti) {
      data.herbarium.multiDiscovered[multiKey] = { firstAt: Date.now(), count: 1 };
    } else {
      data.herbarium.multiDiscovered[multiKey].count += 1;
    }

    if (speciesId === 'flor_mendel') {
      const legacyKey = Genetics.phenoKey(ph);
      if (!data.herbarium.discovered[legacyKey]) {
        data.herbarium.discovered[legacyKey] = { firstAt: Date.now(), count: 1 };
      } else {
        data.herbarium.discovered[legacyKey].count += 1;
      }
      if (Object.keys(data.herbarium.discovered).length >= 12) {
        unlockAchievement('colecionador_100');
      }
    }
    persist();
    return isNewMulti;
  }

  function updateShop(mutator) {
    if (typeof mutator === 'function') mutator(data.shop);
    persist();
    return data.shop;
  }

  function getMultiHerbariumCount() {
    const multi = data.herbarium.multiDiscovered || {};
    // Também garante retrocompatibilidade com descobertas antigas da Flor-de-Mendel
    const legacy = data.herbarium.discovered || {};
    const keys = new Set(Object.keys(multi));
    Object.keys(legacy).forEach(k => keys.add(`flor_mendel::${k}`));
    return keys.size;
  }

  function recordGreenhouseCross(seedlingGenotypes) {
    data.greenhouse.totalCrosses += 1;
    const newlyDiscovered = [];
    seedlingGenotypes.forEach(g => {
      if (discoverSpecies(g)) newlyDiscovered.push(Genetics.phenotype(g));
    });
    persist();
    unlockAchievement('primeiro_broto');
    return newlyDiscovered;
  }

  function completeMission(missionId, stars, gensUsed, usedXray, isTestCross = false) {
    const prevStars = data.greenhouse.stars[missionId] || 0;
    data.greenhouse.stars[missionId] = Math.max(prevStars, stars);
    if (!usedXray) data.greenhouse.noXrayWins[missionId] = true;
    const prevBest = data.greenhouse.bestGens[missionId];
    if (prevBest == null || gensUsed < prevBest) data.greenhouse.bestGens[missionId] = gensUsed;
    data.greenhouse.unlocked = Math.max(data.greenhouse.unlocked, Math.min(8, missionId + 1));

    const baseXp = prevStars === 0 ? 110 : 35;
    const starBonus = stars * 25;
    const xrayBonus = usedXray ? 0 : 40;
    const totalXp = baseXp + starBonus + xrayBonus;
    const res = addXP(totalXp);

    if (!usedXray) unlockAchievement('sem_raiox');
    if (isTestCross) unlockAchievement('analista_teste');
    persist();
    return { xpEarned: totalXp, ...res };
  }

  function recordSandboxCross(g1, g2, children) {
    const k1 = Genetics.toString(g1, '');
    const k2 = Genetics.toString(g2, '');
    const pairKey = [k1, k2].sort().join('×');
    if (!data.sandbox.byPair[pairKey]) {
      data.sandbox.byPair[pairKey] = { crosses: 0, total: 0, observed: {} };
    }
    const bucket = data.sandbox.byPair[pairKey];
    bucket.crosses += 1;
    bucket.total += children.length;
    data.sandbox.totalCrosses += 1;
    data.sandbox.totalSeedlings += children.length;

    const newlyDiscovered = [];
    children.forEach(g => {
      const ph = Genetics.phenotype(g);
      const pk = Genetics.phenoKey(ph);
      bucket.observed[pk] = (bucket.observed[pk] || 0) + 1;
      if (discoverSpecies(g)) newlyDiscovered.push(ph);
    });

    persist();
    unlockAchievement('primeiro_broto');
    return { pairKey, bucket, newlyDiscovered };
  }

  function clearSandboxStats() {
    data.sandbox = { totalCrosses: 0, totalSeedlings: 0, byPair: {} };
    persist();
  }

  function recordForensicAttempt(caseId, solved, attempts, hintsUsed) {
    if (!solved) {
      data.detective.streak = 0;
      persist();
      return { xpEarned: 0, stars: 0, streak: 0, leveledUp: false, rank: getRank() };
    }

    const firstTime = !data.detective.solved[caseId];
    const stars = attempts === 1 && hintsUsed === 0 ? 3
      : (attempts <= 2 && hintsUsed <= 1) ? 2 : 1;

    const detTotal = (typeof Dossie46 !== 'undefined' && Dossie46.CASES) ? Dossie46.CASES.length : 16;
    data.detective.solved[caseId] = true;
    data.detective.stars[caseId] = Math.max(data.detective.stars[caseId] || 0, stars);
    data.detective.unlocked = Math.max(data.detective.unlocked, Math.min(detTotal, caseId + 1));

    if (attempts === 1) {
      data.detective.streak += 1;
      data.detective.bestStreak = Math.max(data.detective.bestStreak, data.detective.streak);
    } else {
      data.detective.streak = 0;
    }

    const baseXp = firstTime ? 140 : 40;
    const starBonus = stars * 30;
    const hintPenalty = Math.min(60, hintsUsed * 15);
    const streakBonus = data.detective.streak >= 2 ? data.detective.streak * 15 : 0;
    const totalXp = Math.max(45, baseXp + starBonus + streakBonus - hintPenalty);
    const res = addXP(totalXp);

    unlockAchievement('primeiro_mandado');
    if (attempts === 1 && hintsUsed === 0) unlockAchievement('olho_clinico');
    if (data.detective.streak >= 3) unlockAchievement('pericia_em_serie');
    if (caseId === 10) unlockAchievement('mestre_epistasia');

    persist();
    return { xpEarned: totalXp, stars, streak: data.detective.streak, ...res };
  }

  function setSetting(key, val) {
    data.settings[key] = val;
    persist();
  }

  function resetAll() {
    const keepSettings = { ...data.settings };
    data = defaultData();
    data.settings = keepSettings;
    persist();
  }

  function getSummary() {
    const ghStars = Object.values(data.greenhouse.stars).reduce((a, b) => a + b, 0);
    const detStars = Object.values(data.detective.stars).reduce((a, b) => a + b, 0);
    const speciesCount = Object.keys(data.herbarium.discovered).length;
    const multiSpeciesCount = getMultiHerbariumCount();
    const totalCatalog = (typeof Genetics !== 'undefined' && Genetics.ALL_HERBARIUM) ? Genetics.ALL_HERBARIUM.length : 216;
    const achCount = Object.keys(data.achievements).length;
    const detTotal = (typeof Dossie46 !== 'undefined' && Dossie46.CASES) ? Dossie46.CASES.length : 16;
    return {
      rank: getRank(),
      ghStars,
      ghMaxStars: 24,
      ghSolved: Object.keys(data.greenhouse.stars).length,
      detStars,
      detTotal,
      detMaxStars: detTotal * 3,
      detSolved: Object.keys(data.detective.solved).length,
      speciesCount,
      speciesPct: Math.round((speciesCount / 12) * 100),
      multiSpeciesCount,
      totalCatalog,
      multiPct: Math.round((multiSpeciesCount / totalCatalog) * 100),
      shopCredits: data.shop ? data.shop.credits : 220,
      shopOrders: data.shop ? data.shop.ordersCompleted : 0,
      achCount,
      achTotal: ACHIEVEMENTS.length,
    };
  }

  return {
    RANKS,
    ACHIEVEMENTS,
    get: () => data,
    subscribe,
    getRank,
    addXP,
    unlockAchievement,
    discoverSpecies,
    updateShop,
    getMultiHerbariumCount,
    recordGreenhouseCross,
    completeMission,
    recordSandboxCross,
    clearSandboxStats,
    recordForensicAttempt,
    setSetting,
    resetAll,
    getSummary,
  };
})();
