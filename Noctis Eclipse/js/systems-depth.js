/* NOCTIS ECLIPSE — Etapa 4: Profundidade Sistêmica, Economia, Ciclo Lunar, Fraquezas Ativas, Ranking Persistente e Clã Balanceado */
(() => {
  const LUNAR_PHASES = [
    {
      id: "new_moon",
      name: "Lua Nova",
      glyph: "🌑",
      color: "#7b88a8",
      summary: "+8% Evasão • +12% chance de descobrir segredos",
      bonuses: { evasion: 0.08, secretBonus: 0.12 },
    },
    {
      id: "waxing_crescent",
      name: "Lua Crescente",
      glyph: "🌒",
      color: "#8eb0df",
      summary: "+12% XP em combates e caçadas",
      bonuses: { xpMult: 0.12 },
    },
    {
      id: "first_quarter",
      name: "Quarto Crescente",
      glyph: "🌓",
      color: "#a7c4ee",
      summary: "+6% Precisão • +5% Chance de Crítico",
      bonuses: { accuracy: 0.06, critChance: 0.05 },
    },
    {
      id: "waxing_gibbous",
      name: "Gibosa Crescente",
      glyph: "🌔",
      color: "#c2d8f8",
      summary: "+18% geração de Fúria/Sangue em combate",
      bonuses: { resourceMult: 0.18 },
    },
    {
      id: "full_moon",
      name: "Lua Cheia",
      glyph: "🌕",
      color: "#dcebff",
      summary: "+10% Dano (+18% Fúria Moonborn) • +10% Saque Raro",
      bonuses: {
        damageMult: 0.1,
        factionResource: { moonborn: 0.18, bloodbound: 0.06 },
        lootBonus: 0.1,
      },
    },
    {
      id: "blood_eclipse",
      name: "Eclipse de Sangue",
      glyph: "🩸",
      color: "#e64a62",
      summary: "+10% Dano • +5% Dreno de Vida (+18% Sangue Bloodbound) • +15% Ouro",
      bonuses: {
        damageMult: 0.1,
        lifesteal: 0.05,
        goldMult: 0.15,
        factionResource: { moonborn: 0.06, bloodbound: 0.18 },
      },
    },
    {
      id: "last_quarter",
      name: "Quarto Minguante",
      glyph: "🌗",
      color: "#b8a8d8",
      summary: "+12% Armadura • +2 Regeneração por turno",
      bonuses: { armorMult: 0.12, regenFlat: 2 },
    },
    {
      id: "waning_crescent",
      name: "Lua Minguante",
      glyph: "🌘",
      color: "#9a8bb8",
      summary: "-15% custo na Forja • +25% materiais extras ao desmontar",
      bonuses: { forgeDiscount: 0.15, dismantleBonus: 0.25 },
    },
  ];

  const ENCHANTMENTS = [
    {
      id: "silver_rune",
      name: "Runa de Prata",
      short: "Prata",
      color: "#a8d2ff",
      desc: "+6% Dano • +15% bônus ao explorar Fraquezas",
      cost: { Silver: 2, Moonstone: 1 },
      shards: 0,
      gold: 160,
      bonuses: { damageMult: 0.06, weaknessBonus: 0.15 },
    },
    {
      id: "hematic_seal",
      name: "Selo Hemático",
      short: "Hemático",
      color: "#e85d75",
      desc: "+5% Dreno de Vida em ataques • +12 Vida Máxima",
      cost: { "Blood Crystal": 2, Bone: 1 },
      shards: 0,
      gold: 180,
      bonuses: { lifesteal: 0.05, maxHealthFlat: 12 },
    },
    {
      id: "shadow_weave",
      name: "Trama Sombria",
      short: "Sombrio",
      color: "#a982e8",
      desc: "+5% Evasão • +6 Iniciativa • +3% Crítico",
      cost: { "Shadow Silk": 2, Leather: 2 },
      shards: 0,
      gold: 170,
      bonuses: { evasion: 0.05, initiative: 6, critChance: 0.03 },
    },
    {
      id: "demon_ember",
      name: "Chama Demoníaca",
      short: "Brasa",
      color: "#f28e4b",
      desc: "+14% Dano Crítico • 18% chance de aplicar Queimadura",
      cost: { "Demon Ash": 2, Iron: 2 },
      shards: 0,
      gold: 190,
      bonuses: { critDamage: 0.14, burnProc: 0.18 },
    },
    {
      id: "sepulcher_ward",
      name: "Égide Sepulcral",
      short: "Égide",
      color: "#80d6a4",
      desc: "+10% Armadura • +5% Bloqueio • +1 Regeneração",
      cost: { "Grave Dust": 2, Silver: 2 },
      shards: 0,
      gold: 175,
      bonuses: { armorMult: 0.1, blockChance: 0.05, regenFlat: 1 },
    },
    {
      id: "eclipse_blessing",
      name: "Bênção do Eclipse",
      short: "Eclipse",
      color: "#f0c975",
      desc: "+8% Dano • +8% Armadura • +8% Vida • +4% Crítico",
      cost: { "Ancient Essence": 1 },
      shards: 2,
      gold: 300,
      bonuses: {
        damageMult: 0.08,
        armorMult: 0.08,
        healthMult: 0.08,
        critChance: 0.04,
      },
    },
  ];

  const ALCHEMY_RECIPES = [
    {
      id: "tonic",
      name: "Tônico de Raiz Noturna",
      icon: "⚗",
      rarity: "uncommon",
      desc: "Restaura 45 PV imediatamente.",
      need: { Iron: 2, Leather: 1 },
      shards: 0,
      item: {
        name: "Tônico de Raiz Noturna",
        effect: "heal",
        amount: 45,
        value: 45,
        flavor: "Um tônico amargo destilado com limalha de ferro e raiz noturna.",
      },
    },
    {
      id: "energy",
      name: "Elixir do Despertar Lunar",
      icon: "⚡",
      rarity: "uncommon",
      desc: "Restaura 10 pontos de Energia de Caçada.",
      need: { Moonstone: 2, "Grave Dust": 1 },
      shards: 0,
      item: {
        name: "Elixir do Despertar Lunar",
        effect: "energy",
        amount: 10,
        value: 55,
        flavor: "Brilha com poeira lunar capaz de afastar a exaustão.",
      },
    },
    {
      id: "silver_flask",
      name: "Frasco de Prata Líquida",
      icon: "♥",
      rarity: "rare",
      desc: "Restaura 95 PV e purifica sangramento, veneno e queimadura.",
      need: { Silver: 2, Bone: 2 },
      shards: 0,
      item: {
        name: "Frasco de Prata Líquida",
        effect: "heal_cleanse",
        amount: 95,
        value: 90,
        flavor: "Prata alquímica pura que cauteriza feridas e dissolve toxinas.",
      },
    },
    {
      id: "crimson_vial",
      name: "Ampola de Frenesi Carmesim",
      icon: "♦",
      rarity: "rare",
      desc: "Restaura 40 PV e concede +40 de Fúria/Sangue em combate.",
      need: { "Blood Crystal": 2, "Demon Ash": 1 },
      shards: 0,
      item: {
        name: "Ampola de Frenesi Carmesim",
        effect: "resource_heal",
        amount: 40,
        resourceAmount: 40,
        value: 110,
        flavor: "Pulsa com calor infernal e acelera o despertar da linhagem.",
      },
    },
    {
      id: "shadow_draught",
      name: "Velo de Seda Sombria",
      icon: "◐",
      rarity: "epic",
      desc: "Restaura 22 de Energia e concede bônus de recuperação.",
      need: { "Shadow Silk": 2, "Grave Dust": 2 },
      shards: 0,
      item: {
        name: "Velo de Seda Sombria",
        effect: "energy",
        amount: 22,
        value: 135,
        flavor: "Essência condensada das sombras das estradas noturnas.",
      },
    },
    {
      id: "ancient_elixir",
      name: "Destilado de Essência Ancestral",
      icon: "✦",
      rarity: "legendary",
      desc: "Restaura 100% da Vida e +25 de Energia (ou cura total em combate).",
      need: { "Ancient Essence": 1 },
      shards: 1,
      item: {
        name: "Destilado de Essência Ancestral",
        effect: "full_restore",
        amount: 999,
        energyAmount: 25,
        value: 260,
        flavor: "Relíquia líquida dos primeiros eclipses. Renova corpo e espírito.",
      },
    },
  ];

  function getLunarPhase(state) {
    const now = Date.now();
    if (
      state?.lunarOverride &&
      state.lunarOverride.until > now &&
      state.lunarOverride.phaseId
    ) {
      const forced = LUNAR_PHASES.find((p) => p.id === state.lunarOverride.phaseId);
      if (forced) {
        return {
          ...forced,
          overridden: true,
          remainingMin: Math.max(1, Math.ceil((state.lunarOverride.until - now) / 60000)),
        };
      }
    }
    const index = Math.floor(now / (3 * 3600 * 1000)) % LUNAR_PHASES.length;
    const msLeft = 3 * 3600 * 1000 - (now % (3 * 3600 * 1000));
    return {
      ...LUNAR_PHASES[index],
      overridden: false,
      nextChangeMin: Math.max(1, Math.ceil(msLeft / 60000)),
    };
  }

  function getEnchantment(id) {
    return ENCHANTMENTS.find((e) => e.id === id) || null;
  }

  function sumEquipmentEnchantments(player) {
    const totals = {
      damageMult: 0,
      armorMult: 0,
      healthMult: 0,
      maxHealthFlat: 0,
      lifesteal: 0,
      evasion: 0,
      initiative: 0,
      critChance: 0,
      critDamage: 0,
      blockChance: 0,
      regenFlat: 0,
      weaknessBonus: 0,
      burnProc: 0,
    };
    if (!player?.equipment) return totals;
    Object.values(player.equipment).forEach((item) => {
      if (!item?.enchantment) return;
      const ench = getEnchantment(item.enchantment);
      if (!ench) return;
      Object.entries(ench.bonuses).forEach(([k, v]) => {
        if (k in totals) totals[k] += v;
      });
    });
    return totals;
  }

  function normalizeTag(tag) {
    return String(tag || "")
      .trim()
      .toLowerCase();
  }

  const TAG_LABELS_PT = {
    bleeding: "Sangramento",
    burning: "Queimadura",
    poisoned: "Veneno",
    marked: "Marcado",
    frightened: "Amedrontado",
    "heavy attacks": "Golpes Pesados",
    "ataques pesados": "Golpes Pesados",
    "ataques previsíveis": "Golpes Pesados",
    control: "Controle",
    controle: "Controle",
    "critical hits": "Críticos",
    críticos: "Críticos",
  };

  function labelTrait(tag) {
    return TAG_LABELS_PT[normalizeTag(tag)] || tag;
  }

  function evaluateAttackAffinity(target, move, isCrit) {
    const src = target?.sourceData || target || {};
    const weaknesses = (src.weaknesses || []).map(normalizeTag);
    const resistances = (src.resistances || []).map(normalizeTag);

    const moveTags = new Set();
    if (move?.status) moveTags.add(normalizeTag(move.status));
    if (move?.isHeavy || /heavy|pesado|bonebreaker|crushing/i.test(move?.name || "")) {
      moveTags.add("heavy attacks");
      moveTags.add("ataques pesados");
      moveTags.add("ataques previsíveis");
    }
    if (isCrit) {
      moveTags.add("critical hits");
      moveTags.add("críticos");
    }
    if (
      move?.status === "stunned" ||
      move?.status === "weakened" ||
      move?.status === "frightened"
    ) {
      moveTags.add("control");
      moveTags.add("controle");
    }

    // Active status on defender can also trigger weakness amplification
    (target?.statuses || []).forEach((st) => {
      if (["bleeding", "burning", "poisoned", "marked"].includes(st.name)) {
        moveTags.add(st.name);
      }
    });

    const hitWeakness = weaknesses.find((w) => moveTags.has(w));
    const hitResistance = resistances.find((r) => moveTags.has(r));

    if (hitWeakness && !hitResistance) {
      return {
        kind: "weakness",
        tag: hitWeakness,
        label: labelTrait(hitWeakness),
        mult: 1.28,
        statusBonusTurns: 1,
      };
    }
    if (hitResistance && !hitWeakness) {
      return {
        kind: "resistance",
        tag: hitResistance,
        label: labelTrait(hitResistance),
        mult: 0.75,
        statusBonusTurns: 0,
      };
    }
    return { kind: "neutral", tag: null, label: "", mult: 1, statusBonusTurns: 0 };
  }

  function evaluateStatusTickAffinity(combatant, statusName) {
    const src = combatant?.sourceData || combatant || {};
    const key = normalizeTag(statusName);
    const weaknesses = (src.weaknesses || []).map(normalizeTag);
    const resistances = (src.resistances || []).map(normalizeTag);
    if (weaknesses.includes(key)) return { kind: "weakness", mult: 1.35 };
    if (resistances.includes(key)) return { kind: "resistance", mult: 0.65 };
    return { kind: "neutral", mult: 1 };
  }

  function createPersistentRanking(D, U) {
    const roster = [];
    const usedNames = new Set();
    for (let i = 0; i < 36; i++) {
      let name = "";
      for (let tries = 0; tries < 8; tries++) {
        name = `${U.pick(D.names.first)} ${U.pick(D.names.last)}`;
        if (!usedNames.has(name)) break;
      }
      usedNames.add(name);
      const tier = i / 35; // 0..1 distribution from newcomers to veterans
      const level = U.clamp(Math.round(2 + Math.pow(tier, 1.35) * 37), 1, 40);
      roster.push({
        id: `rival_rank_${i}`,
        name,
        clan: U.pick(D.names.clans),
        faction: i % 2 === 0 ? "moonborn" : "bloodbound",
        level,
        rating: Math.round(420 + Math.pow(tier, 1.25) * 2650 + U.rand(-60, 60)),
        bosses: Math.max(0, Math.round(Math.pow(tier, 1.6) * 42 + U.rand(-2, 3))),
        wealth: Math.round(350 + Math.pow(tier, 1.8) * 18500 + U.rand(-120, 220)),
        achievementPoints: Math.round(200 + tier * 4600 + U.rand(-100, 100)),
        clanStrength: Math.round(450 + Math.pow(tier, 1.45) * 8200 + U.rand(-150, 150)),
        factionContribution: Math.round(150 + Math.pow(tier, 1.5) * 7400 + U.rand(-100, 120)),
        prevRank: {},
      });
    }
    return {
      lastDay: U.dayKey(),
      roster,
    };
  }

  function advancePersistentRanking(worldRanking, U) {
    if (!worldRanking?.roster?.length) return;
    const today = U.dayKey();
    if (worldRanking.lastDay === today) return;
    worldRanking.lastDay = today;
    worldRanking.roster.forEach((r) => {
      if (U.chance(0.45) && r.level < 40) r.level += 1;
      r.rating = Math.max(300, r.rating + U.rand(-28, 42));
      if (U.chance(0.35)) r.bosses += U.rand(1, 2);
      r.wealth = Math.max(100, r.wealth + U.rand(40, 480));
      if (U.chance(0.3)) r.achievementPoints += 100;
      r.clanStrength = Math.max(300, r.clanStrength + U.rand(20, 210));
      r.factionContribution += U.rand(30, 190);
    });
  }

  function computeClanRivals(state, D) {
    const str = state.clan?.strength || 350;
    const names = D.names.clans || ["Casa Cinzenta", "Pacto do Véu", "Garra da Aurora"];
    const seed = (state.clan?.victories || 0) + (state.clan?.dailyBattles || 0) * 3;
    const pick = (offset) => names[(seed + offset) % names.length];
    return [
      {
        tier: "scout",
        label: "Incursão de Fronteira",
        enemy: pick(1),
        enemyStrength: Math.max(220, Math.round(str * 0.82)),
        goldReward: 120 + (state.clan?.fortress || 1) * 25,
        strengthGain: 65,
        rankGain: 3,
      },
      {
        tier: "skirmish",
        label: "Confronto Equilibrado",
        enemy: pick(4),
        enemyStrength: Math.max(340, Math.round(str * 1.02)),
        goldReward: 210 + (state.clan?.fortress || 1) * 40,
        strengthGain: 120,
        rankGain: 7,
      },
      {
        tier: "siege",
        label: "Cerco de Fortaleza",
        enemy: pick(7),
        enemyStrength: Math.max(520, Math.round(str * 1.24)),
        goldReward: 340 + (state.clan?.fortress || 1) * 60,
        strengthGain: 210,
        rankGain: 14,
      },
    ].map((t) => {
      const ratio = str / Math.max(1, str + t.enemyStrength);
      const winChance = Math.max(0.18, Math.min(0.88, 0.5 + (ratio - 0.5) * 1.65));
      return { ...t, winChance };
    });
  }

  function materialForUpgrade(upgradeLevel) {
    if (upgradeLevel < 2) return { mat: "Iron", qty: 2 };
    if (upgradeLevel < 4) return { mat: "Silver", qty: 2 };
    if (upgradeLevel < 6) return { mat: "Bone", qty: 2 };
    if (upgradeLevel < 8) return { mat: "Demon Ash", qty: 2 };
    return { mat: "Ancient Essence", qty: 1 };
  }

  function dismantleMaterialPool(rarity) {
    if (rarity === "common") return ["Iron", "Leather", "Bone"];
    if (rarity === "uncommon") return ["Iron", "Leather", "Bone", "Silver", "Grave Dust"];
    if (rarity === "rare")
      return ["Silver", "Moonstone", "Blood Crystal", "Grave Dust", "Shadow Silk"];
    if (rarity === "epic")
      return ["Moonstone", "Blood Crystal", "Demon Ash", "Shadow Silk", "Grave Dust"];
    return ["Demon Ash", "Shadow Silk", "Ancient Essence", "Blood Crystal", "Moonstone"];
  }

  window.WB_SYSTEMS = {
    LUNAR_PHASES,
    ENCHANTMENTS,
    ALCHEMY_RECIPES,
    getLunarPhase,
    getEnchantment,
    sumEquipmentEnchantments,
    labelTrait,
    evaluateAttackAffinity,
    evaluateStatusTickAffinity,
    createPersistentRanking,
    advancePersistentRanking,
    computeClanRivals,
    materialForUpgrade,
    dismantleMaterialPool,
  };
})();
