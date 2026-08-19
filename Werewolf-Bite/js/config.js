/* WEREWOLF BITE — centralized balancing configuration.
   Tune progression, combat, loot, energy and economy here. */
window.WB_CONFIG = {
  version: 2,
  saveKey: "werewolf_bite_save_v1",
  autosaveMs: 12000,
  maxLevel: 40,
  energy: {
    baseMax: 120,
    perFiveLevels: 0,
    regenSeconds: 35,
    huntCosts: {
      quick: 3,
      careful: 5,
      dangerous: 7,
      monster: 6,
      treasure: 5,
      rival: 8,
    },
  },
  xp: {
    needed(level) {
      return Math.floor(70 + Math.pow(level, 1.62) * 38);
    },
    reward(enemyLevel, difficulty = 1) {
      return Math.floor((22 + enemyLevel * 11) * difficulty);
    },
  },
  attributes: {
    baseUpgradeCost: 55,
    growth: 1.16,
    cost(current, amount = 1) {
      let total = 0;
      for (let i = 0; i < amount; i++)
        total += Math.floor(
          this.baseUpgradeCost * Math.pow(this.growth, current + i - 5),
        );
      return Math.max(10, total);
    },
  },
  combat: {
    armorConstant: 120,
    hitFloor: 0.66,
    hitCeil: 0.97,
    critFloor: 0.03,
    critCeil: 0.55,
    maxBlock: 0.45,
    fleeBase: 0.43,
    resourceMax: 100,
    heavyDamage: 1.42,
    heavyAccuracy: -0.12,
    defendArmor: 0.32,
    defendBlock: 0.18,
    regenerationTurnFactor: 0.018,
    initiativeVariance: 8,
    enemyBuffMinPercent: 10,
    enemyBuffMaxPercent: 100,
  },
  loot: {
    rarityWeights: {
      common: 48,
      uncommon: 27,
      rare: 14,
      epic: 7,
      legendary: 2.8,
      mythic: 0.9,
      cursed: 0.3,
    },
    bossBonus: { rare: 10, epic: 7, legendary: 3 },
    maxInventory: 120,
  },
  arena: {
    dailyLimit: 12,
    refreshCost: 12,
    ratingWin: 24,
    ratingLoss: 11,
    rewards: { baseGold: 70, baseXp: 45 },
  },
  hideout: {
    cost(level) {
      return Math.floor(220 * Math.pow(1.72, level - 1));
    },
    coreCost(level) {
      return Math.floor(520 * Math.pow(1.58, level - 1));
    },
    maxStructureLevel: 5,
    maxCoreLevel: 10,
    coreBonuses: {
      healthPerLevel: 0.02,
      damagePerLevel: 0.015,
      armorPerLevel: 0.015,
    },
  },
  crafting: {
    upgradeGold(level) {
      return Math.floor(90 * Math.pow(1.45, level));
    },
    rerollGold: 250,
  },
  dailyRewards: [
    { type: "gold", amount: 150, icon: "◈" },
    { type: "energy", amount: 8, icon: "⚡" },
    { type: "shards", amount: 2, icon: "✦" },
    { type: "consumable", amount: 1, icon: "⚗" },
    { type: "gold", amount: 400, icon: "◈" },
    { type: "item", amount: 1, icon: "◆" },
    { type: "shards", amount: 6, icon: "✦" },
  ],
};

window.WB_UTIL = {
  clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  },
  rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  chance(p) {
    return Math.random() < p;
  },
  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },
  shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  },
  uid(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  },
  fmt(n) {
    return new Intl.NumberFormat("en-US", {
      notation: n >= 1000000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(Math.floor(n));
  },
  title(s) {
    return s.replace(
      /(^|\s|_)(\w)/g,
      (_, a, b) => `${a ? " " : ""}${b.toUpperCase()}`,
    );
  },
  dayKey(date = new Date()) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },
  safeParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  debounce(fn, ms = 120) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  },
  weighted(obj) {
    const entries = Object.entries(obj);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [key, weight] of entries) {
      r -= weight;
      if (r <= 0) return key;
    }
    return entries[0][0];
  },
};
