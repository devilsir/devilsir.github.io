(function (global) {
  "use strict";

  const SAVE_VERSION = 70;
  const STORAGE_KEY = "qc_science_v70";
  const HAZARD_KEYS = Object.freeze([
    "toxicity",
    "radiation",
    "corrosion",
    "air",
    "biological",
    "smoke"
  ]);
  const HAZARD_LABELS = Object.freeze({
    toxicity: "Toxicidade",
    radiation: "Radiação",
    corrosion: "Corrosão",
    air: "Ar contaminado",
    biological: "Contaminação biológica",
    smoke: "Fumaça",
    fire: "Fogo e calor",
    electric: "Eletricidade",
    pressure: "Pressão",
    physical: "Impacto físico",
    splash: "Respingos químicos"
  });
  const HAZARD_ICONS = Object.freeze({
    toxicity: "☠",
    radiation: "☢",
    corrosion: "◆",
    air: "◌",
    biological: "✣",
    smoke: "≋",
    fire: "♨",
    electric: "ϟ",
    pressure: "◉",
    physical: "⬡",
    splash: "◒"
  });
  const BIOME_TEMPERATURES = Object.freeze({
    "tundra": -11,
    "taiga": 5,
    "prado alpino": 8,
    "montanha": 9,
    "floresta": 18,
    "bosque de cerejeiras": 19,
    "bosque de cristais": 14,
    "planície": 23,
    "planície florida": 22,
    "cânion calcário": 28,
    "savana": 32,
    "deserto": 39,
    "salinas": 36,
    "badlands": 35,
    "selva tropical": 30,
    "pântano": 27,
    "vulcânico": 47
  });

  const WATER_PROFILES = Object.freeze({
    fresh: Object.freeze({
      id: "fresh",
      name: "água doce",
      label: "Água doce",
      hydration: 36,
      purity: 72,
      pH: 7.1,
      contamination: 8,
      temperature: 19,
      description: "Água natural com minerais dissolvidos e baixo risco."
    }),
    salt: Object.freeze({
      id: "salt",
      name: "água salgada",
      label: "Água salgada",
      hydration: -14,
      purity: 58,
      pH: 8.1,
      contamination: 5,
      temperature: 22,
      description: "A concentração de sais aumenta a sede quando ingerida."
    }),
    contaminated: Object.freeze({
      id: "contaminated",
      name: "água contaminada",
      label: "Água contaminada",
      hydration: 14,
      purity: 24,
      pH: 6.4,
      contamination: 76,
      temperature: 23,
      description: "Contém material biológico e partículas em suspensão."
    }),
    distilled: Object.freeze({
      id: "distilled",
      name: "água destilada",
      label: "Água destilada",
      hydration: 38,
      purity: 99,
      pH: 7,
      contamination: 0,
      temperature: 20,
      description: "Água de alta pureza obtida por destilação."
    }),
    acidic: Object.freeze({
      id: "acidic",
      name: "água ácida",
      label: "Água ácida",
      hydration: 8,
      purity: 31,
      pH: 3.2,
      contamination: 42,
      temperature: 31,
      description: "Água com acidez perigosa e potencial corrosivo."
    }),
    alkaline: Object.freeze({
      id: "alkaline",
      name: "água alcalina",
      label: "Água alcalina",
      hydration: 15,
      purity: 48,
      pH: 10.4,
      contamination: 25,
      temperature: 24,
      description: "Água excessivamente básica; deve ser neutralizada."
    }),
    industrial: Object.freeze({
      id: "industrial",
      name: "água industrial poluída",
      label: "Água industrial poluída",
      hydration: 5,
      purity: 9,
      pH: 5.1,
      contamination: 92,
      temperature: 29,
      description: "Mistura de resíduos químicos e contaminação biológica."
    }),
    hot: Object.freeze({
      id: "hot",
      name: "água quente",
      label: "Água quente",
      hydration: 27,
      purity: 68,
      pH: 7.2,
      contamination: 12,
      temperature: 68,
      description: "Água aquecida; pode causar queimaduras se ingerida imediatamente."
    }),
    cold: Object.freeze({
      id: "cold",
      name: "água gelada",
      label: "Água gelada",
      hydration: 33,
      purity: 73,
      pH: 7,
      contamination: 7,
      temperature: 3,
      description: "Água muito fria, comum em regiões geladas."
    })
  });

  const ITEM_NAMES = Object.freeze({
    chemical_lab_coat: "Jaleco químico resistente",
    gas_mask: "Máscara de gás",
    disposable_gloves: "Luvas descartáveis",
    chemical_gloves: "Luvas químico-resistentes",
    heat_gloves: "Luvas térmicas",
    radiation_suit: "Traje antirradiação",
    fire_suit: "Traje resistente ao fogo",
    face_shield: "Protetor facial",
    thermal_coat: "Casaco térmico",
    insulated_boots: "Botas isolantes",
    cooling_vest: "Colete refrigerado",
    thermal_blanket: "Manta térmica de emergência",
    diving_mask: "Máscara de mergulho",
    snorkel: "Snorkel",
    fins: "Nadadeiras",
    reinforced_oxygen_tank: "Cilindro de oxigênio reforçado",
    diving_suit: "Roupa de mergulho",
    pressure_suit: "Traje de mergulho pressurizado",
    underwater_flashlight: "Lanterna subaquática",
    depth_gauge: "Medidor de profundidade",
    sample_vial: "Frasco de amostra",
    test_tube: "Tubo de ensaio",
    petri_dish: "Placa de Petri",
    water_sample_bottle: "Frasco para amostra de água",
    soil_sample_bag: "Saco para amostra de solo",
    air_canister: "Coletor de ar",
    sterile_swab: "Swab estéril",
    hazardous_container: "Recipiente reforçado",
    sealed_sample: "Amostra selada",
    glass_bottle: "Garrafa de vidro",
    beaker: "Béquer",
    flask: "Erlenmeyer",
    graduated_cylinder: "Proveta",
    pipette: "Pipeta",
    chemical_bottle: "Frasco químico",
    sealed_gas_container: "Recipiente de gás selado",
    reinforced_acid_container: "Recipiente para ácido",
    sodium_metal: "Sódio metálico",
    salt_water: "Solução de água salgada",
    contaminated_water: "Água contaminada",
    distilled_water: "Água destilada",
    iron_oxide: "Óxido de ferro",
    calcium_chloride: "Cloreto de cálcio",
    steam: "Vapor de água",
    fermented_mash: "Mosto fermentado",
    precipitate: "Precipitado químico",
    unknown_residue: "Resíduo desconhecido",
    filter_cartridge: "Cartucho de filtro",
    oxygen_refill: "Carga de oxigênio",
    raw_fish: "Peixe cru",
    cooked_fish: "Peixe assado"
  });

  const ITEM_COLORS = Object.freeze({
    chemical_lab_coat: "#d9f5ed",
    gas_mask: "#455b55",
    disposable_gloves: "#d6eef1",
    chemical_gloves: "#78a83e",
    heat_gloves: "#b9653f",
    radiation_suit: "#d8c94a",
    fire_suit: "#a84f3c",
    face_shield: "#83dce5",
    thermal_coat: "#56799b",
    insulated_boots: "#394957",
    cooling_vest: "#5bc7d8",
    thermal_blanket: "#d7b568",
    diving_mask: "#4a91a7",
    snorkel: "#e0704f",
    fins: "#3a9d94",
    reinforced_oxygen_tank: "#527a8d",
    diving_suit: "#22546b",
    pressure_suit: "#3b4f60",
    underwater_flashlight: "#e4ca57",
    depth_gauge: "#76c7d2",
    sample_vial: "#bfeef2",
    test_tube: "#c7f2f4",
    petri_dish: "#d9f3ed",
    water_sample_bottle: "#68bddd",
    soil_sample_bag: "#9a7550",
    air_canister: "#899aa0",
    sterile_swab: "#f1eee5",
    hazardous_container: "#e5bb42",
    sealed_sample: "#6ed2c1",
    glass_bottle: "#b9e9ef",
    beaker: "#9ce1e8",
    flask: "#8bd3df",
    graduated_cylinder: "#a4dbe2",
    pipette: "#d6f3f4",
    chemical_bottle: "#8fb2b8",
    sealed_gas_container: "#8da2aa",
    reinforced_acid_container: "#8ab84a",
    sodium_metal: "#c9d0d4",
    salt_water: "#6eb9d2",
    contaminated_water: "#718b59",
    distilled_water: "#79d4ec",
    iron_oxide: "#a85037",
    calcium_chloride: "#e3e0cf",
    fermented_mash: "#9b5f4c",
    precipitate: "#e5d8a7",
    unknown_residue: "#7b6b84",
    filter_cartridge: "#3f4a4e",
    oxygen_refill: "#8dd6e9",
    raw_fish: "#7da5ad",
    cooked_fish: "#a96d4c"
  });

  const EQUIPMENT_DEFINITIONS = Object.freeze({
    wind_staff: Object.freeze({
      slot: "tool",
      abbr: "CAJADO",
      maxDurability: 520,
      protections: {},
      repair: [["stick", 2], ["crystal_shard", 1], ["wind_essence", 1]],
      effect: "foco científico de energia eólica; perde condição ao conjurar"
    }),
    bow: Object.freeze({
      slot: "tool",
      abbr: "ARCO",
      maxDurability: 360,
      protections: {},
      repair: [["stick", 2], ["wool", 1]],
      effect: "arma de longo alcance; a corda e a estrutura exigem manutenção"
    }),
    iron_sword: Object.freeze({
      slot: "tool",
      abbr: "ESPADA",
      maxDurability: 440,
      protections: {},
      repair: [["iron", 2]],
      effect: "arma corpo a corpo durável; fica inutilizável quando quebrada"
    }),
    protective_goggles: Object.freeze({
      slot: "head",
      abbr: "ÓCULOS",
      armor: 0.03,
      maxDurability: 180,
      clarity: 0.42,
      protections: { corrosion: 0.16, biological: 0.05, splash: 0.72 },
      repair: [["glass", 1], ["stick", 1]],
      effect: "protege os olhos contra respingos e melhora a visão submersa"
    }),
    respirator_mask: Object.freeze({
      slot: "face",
      abbr: "PFF",
      armor: 0.03,
      maxDurability: 150,
      filterCapacity: 100,
      breathMax: 20,
      breathDrain: 0.82,
      protections: { toxicity: 0.28, air: 0.72, biological: 0.58, smoke: 0.62 },
      repair: [["wool", 1], ["carbon_filter", 1]],
      effect: "filtra partículas, fumaça e esporos; não veda gases fortes"
    }),
    gas_mask: Object.freeze({
      slot: "face",
      abbr: "GÁS",
      armor: 0.04,
      maxDurability: 240,
      filterCapacity: 120,
      breathDrain: 0.76,
      protections: { toxicity: 0.86, air: 0.88, biological: 0.77, smoke: 0.91, corrosion: 0.12 },
      repair: [["filter_cartridge", 1], ["hide", 2]],
      effect: "veda o rosto e filtra gases, fumaça, partículas e aerossóis"
    }),
    iron_helmet: Object.freeze({
      slot: "head",
      abbr: "FERRO",
      armor: 0.14,
      maxDurability: 310,
      conductivity: 0.24,
      protections: { physical: 0.34 },
      repair: [["iron", 2]],
      effect: "proteção de combate; metal conduz frio e calor"
    }),
    face_shield: Object.freeze({
      slot: "head",
      abbr: "VISEIRA",
      armor: 0.04,
      maxDurability: 210,
      protections: { corrosion: 0.22, splash: 0.9, biological: 0.1 },
      repair: [["glass", 2], ["iron", 1]],
      effect: "proteção ampla contra respingos, estilhaços e material biológico"
    }),
    diving_mask: Object.freeze({
      slot: "head",
      abbr: "MERG.",
      armor: 0.02,
      maxDurability: 200,
      clarity: 0.62,
      protections: { pressure: 0.12, biological: 0.08 },
      repair: [["glass", 1], ["hide", 1]],
      effect: "aumenta muito a nitidez sob a água"
    }),
    snorkel: Object.freeze({
      slot: "face",
      abbr: "SNORKEL",
      armor: 0.01,
      maxDurability: 140,
      breathDrain: 0.92,
      surfaceBreathing: true,
      protections: {},
      repair: [["hide", 1]],
      effect: "preserva o fôlego quando o corpo está submerso e a cabeça está na superfície"
    }),
    lab_coat: Object.freeze({
      slot: "chest",
      abbr: "JALECO",
      armor: 0.07,
      maxDurability: 190,
      insulation: 0.08,
      chemical: 0.72,
      protections: { corrosion: 0.28, biological: 0.16, splash: 0.48 },
      repair: [["wool", 2]],
      effect: "proteção leve contra respingos e contaminação; defesa física limitada"
    }),
    chemical_lab_coat: Object.freeze({
      slot: "chest",
      abbr: "QUÍMICO",
      armor: 0.08,
      maxDurability: 280,
      insulation: 0.12,
      chemical: 0.5,
      protections: { toxicity: 0.18, corrosion: 0.62, biological: 0.34, splash: 0.8 },
      repair: [["wool", 2], ["hide", 1], ["plant_oil", 1]],
      effect: "jaleco selado com alta resistência a respingos corrosivos"
    }),
    chainmail: Object.freeze({
      slot: "chest",
      abbr: "MALHA",
      armor: 0.24,
      maxDurability: 420,
      conductivity: 0.28,
      protections: { physical: 0.48 },
      repair: [["iron", 3]],
      effect: "proteção física leve; conduz temperaturas extremas"
    }),
    iron_chestplate: Object.freeze({
      slot: "chest",
      abbr: "FERRO",
      armor: 0.34,
      maxDurability: 520,
      conductivity: 0.38,
      protections: { physical: 0.62 },
      repair: [["iron", 4]],
      effect: "alta proteção física, mas intensifica frio e calor sem isolamento"
    }),
    chitin_armor: Object.freeze({
      slot: "chest",
      abbr: "QUITINA",
      armor: 0.28,
      maxDurability: 390,
      insulation: 0.18,
      chemical: 0.58,
      protections: { corrosion: 0.42, biological: 0.28, physical: 0.48 },
      repair: [["chitin", 2], ["ceramic_plate", 1]],
      effect: "biocompósito leve com defesa física e química equilibrada"
    }),
    radiation_suit: Object.freeze({
      slot: "chest",
      abbr: "RAD",
      armor: 0.1,
      maxDurability: 360,
      movement: 0.88,
      insulation: 0.22,
      protections: { radiation: 0.78, toxicity: 0.38, air: 0.42, biological: 0.46 },
      repair: [["wool", 2], ["iron", 2], ["carbon_filter", 1]],
      effect: "reduz radiação e poeira contaminada; é pesado e limita movimentos"
    }),
    fire_suit: Object.freeze({
      slot: "chest",
      abbr: "FOGO",
      armor: 0.12,
      maxDurability: 420,
      insulation: 0.36,
      heatResistance: 0.76,
      movement: 0.91,
      protections: { smoke: 0.22, fire: 0.82, corrosion: 0.18 },
      repair: [["wool", 2], ["ceramic_plate", 2]],
      effect: "protege contra altas temperaturas e chamas; não filtra gases"
    }),
    thermal_coat: Object.freeze({
      slot: "chest",
      abbr: "TÉRMICO",
      armor: 0.06,
      maxDurability: 260,
      insulation: 0.68,
      coldResistance: 0.72,
      movement: 0.96,
      protections: {},
      repair: [["wool", 3], ["hide", 1]],
      effect: "retém calor corporal em biomas frios e quando o jogador está molhado"
    }),
    cooling_vest: Object.freeze({
      slot: "chest",
      abbr: "COOL",
      armor: 0.04,
      maxDurability: 240,
      cooling: 0.72,
      heatResistance: 0.44,
      protections: {},
      repair: [["wool", 2], ["copper_ingot", 1], ["water", 1]],
      effect: "reduz sobreaquecimento em desertos e perto de fontes quentes"
    }),
    diving_suit: Object.freeze({
      slot: "chest",
      abbr: "NEOPRENE",
      armor: 0.08,
      maxDurability: 330,
      insulation: 0.44,
      coldResistance: 0.58,
      waterSpeed: 1.08,
      protections: { pressure: 0.34, biological: 0.18 },
      repair: [["hide", 3], ["plant_oil", 1]],
      effect: "reduz perda de calor e pressão em mergulhos moderados"
    }),
    pressure_suit: Object.freeze({
      slot: "chest",
      abbr: "PRESSÃO",
      armor: 0.16,
      maxDurability: 470,
      insulation: 0.55,
      coldResistance: 0.7,
      waterSpeed: 0.92,
      movement: 0.9,
      protections: { pressure: 0.84, corrosion: 0.32, biological: 0.24 },
      repair: [["iron", 3], ["ceramic_plate", 2], ["hide", 2]],
      effect: "proteção elevada contra pressão de águas profundas"
    }),
    disposable_gloves: Object.freeze({
      slot: "hands",
      abbr: "LUVA",
      armor: 0.01,
      maxDurability: 70,
      protections: { biological: 0.48, corrosion: 0.14 },
      repair: [["wool", 1]],
      effect: "barreira simples para amostras biológicas; desgasta rapidamente"
    }),
    chemical_gloves: Object.freeze({
      slot: "hands",
      abbr: "QUÍMICA",
      armor: 0.03,
      maxDurability: 250,
      protections: { corrosion: 0.78, toxicity: 0.22, biological: 0.35, electric: 0.52 },
      repair: [["hide", 2], ["plant_oil", 1]],
      effect: "protege mãos contra corrosivos, contaminação e risco elétrico moderado"
    }),
    heat_gloves: Object.freeze({
      slot: "hands",
      abbr: "CALOR",
      armor: 0.04,
      maxDurability: 260,
      heatResistance: 0.36,
      protections: { fire: 0.5, corrosion: 0.12 },
      repair: [["wool", 2], ["ceramic_plate", 1]],
      effect: "permite manusear recipientes e equipamentos quentes"
    }),
    iron_leggings: Object.freeze({
      slot: "legs",
      abbr: "FERRO",
      armor: 0.22,
      maxDurability: 430,
      conductivity: 0.28,
      protections: { physical: 0.42 },
      repair: [["iron", 3]],
      effect: "proteção física para as pernas; conduz temperaturas extremas"
    }),
    rubber_boots: Object.freeze({
      slot: "feet",
      abbr: "BORRACHA",
      armor: 0.04,
      maxDurability: 260,
      waterSpeed: 1.08,
      fall: 0.82,
      protections: { corrosion: 0.42, electric: 0.76, biological: 0.12 },
      repair: [["hide", 2], ["plant_oil", 1]],
      effect: "isolamento elétrico e químico; melhora estabilidade em áreas molhadas"
    }),
    insulated_boots: Object.freeze({
      slot: "feet",
      abbr: "ISOLADA",
      armor: 0.06,
      maxDurability: 310,
      insulation: 0.28,
      coldResistance: 0.42,
      fall: 0.74,
      protections: { electric: 0.86, corrosion: 0.28 },
      repair: [["hide", 2], ["wool", 2]],
      effect: "protege do frio do solo e de descargas elétricas"
    }),
    iron_boots: Object.freeze({
      slot: "feet",
      abbr: "FERRO",
      armor: 0.13,
      maxDurability: 340,
      conductivity: 0.2,
      fall: 0.6,
      protections: { physical: 0.26 },
      repair: [["iron", 2]],
      effect: "reduz dano de queda, mas conduz frio, calor e eletricidade"
    }),
    fins: Object.freeze({
      slot: "feet",
      abbr: "NADO",
      armor: 0.01,
      maxDurability: 210,
      waterSpeed: 1.34,
      movement: 0.88,
      protections: {},
      repair: [["hide", 2], ["plant_oil", 1]],
      effect: "aumenta bastante a velocidade na água e reduz o passo em terra"
    }),
    oxygen_tank: Object.freeze({
      slot: "back",
      abbr: "O₂",
      armor: 0.03,
      maxDurability: 300,
      oxygenCapacity: 100,
      breathMax: 85,
      breathDrain: 0.58,
      protections: { pressure: 0.08 },
      repair: [["iron", 2], ["glass", 1]],
      effect: "fornece oxigênio armazenado para mergulho e ambientes sem ar"
    }),
    reinforced_oxygen_tank: Object.freeze({
      slot: "back",
      abbr: "O₂+",
      armor: 0.06,
      maxDurability: 440,
      oxygenCapacity: 180,
      breathMax: 145,
      breathDrain: 0.46,
      protections: { pressure: 0.22 },
      repair: [["iron", 3], ["ceramic_plate", 1]],
      effect: "cilindro reforçado de grande capacidade para exploração profunda"
    }),
    shield: Object.freeze({
      slot: "offhand",
      abbr: "ESCUDO",
      armor: 0.13,
      maxDurability: 420,
      blockChance: 0.2,
      protections: { physical: 0.26 },
      repair: [["bronze_ingot", 2], ["iron", 1]],
      effect: "chance de bloquear ataques; perde durabilidade ao absorver impacto"
    }),
    sample_case: Object.freeze({
      slot: "offhand",
      abbr: "AMOSTRAS",
      maxDurability: 280,
      sampleBonus: 0.25,
      sampleCapacity: 12,
      protections: { corrosion: 0.08, biological: 0.08 },
      repair: [["plank", 2], ["glass", 1]],
      effect: "aumenta a capacidade e preserva amostras frágeis ou contaminadas"
    }),
    underwater_flashlight: Object.freeze({
      slot: "offhand",
      abbr: "LUZ",
      maxDurability: 230,
      clarity: 0.16,
      protections: {},
      repair: [["iron", 1], ["voltaic_cell", 1], ["glass", 1]],
      effect: "melhora a visibilidade em cavernas e águas escuras"
    }),
    depth_gauge: Object.freeze({
      slot: "offhand",
      abbr: "PROF.",
      maxDurability: 180,
      protections: {},
      repair: [["iron", 1], ["glass", 1]],
      effect: "exibe profundidade e alerta sobre pressão perigosa"
    }),
    thermal_blanket: Object.freeze({
      slot: "offhand",
      abbr: "MANTA",
      maxDurability: 90,
      insulation: 0.34,
      coldResistance: 0.4,
      movement: 0.8,
      protections: {},
      repair: [["wool", 2]],
      effect: "proteção emergencial contra frio; limita movimentos enquanto equipada"
    })
  });

  const STATIONS = Object.freeze({
    chemistry_workbench: Object.freeze({
      id: "chemistry_workbench",
      name: "Bancada de Química",
      icon: "⚗",
      purpose: "Preparo de reagentes, montagem de ferramentas e reações básicas.",
      maxTemperature: 120,
      maxPressure: 1.1
    }),
    bunsen_burner: Object.freeze({
      id: "bunsen_burner",
      name: "Bico de Bunsen",
      icon: "♨",
      purpose: "Aquecimento controlado de pequenas amostras com combustível.",
      maxTemperature: 950,
      maxPressure: 1.1
    }),
    laboratory_furnace: Object.freeze({
      id: "laboratory_furnace",
      name: "Forno de Laboratório",
      icon: "▣",
      purpose: "Calcinação, cerâmicas, ligas e reações em alta temperatura.",
      maxTemperature: 1500,
      maxPressure: 1.2
    }),
    distillation: Object.freeze({
      id: "distillation",
      name: "Aparelho de Destilação",
      icon: "⌁",
      purpose: "Separação de misturas líquidas por diferença de ebulição.",
      maxTemperature: 220,
      maxPressure: 1.4
    }),
    centrifuge: Object.freeze({
      id: "centrifuge",
      name: "Centrífuga",
      icon: "⊛",
      purpose: "Separação de suspensões, sedimentos e amostras biológicas.",
      maxTemperature: 80,
      maxPressure: 1
    }),
    microscope: Object.freeze({
      id: "microscope",
      name: "Microscópio",
      icon: "⌕",
      purpose: "Identificação de microrganismos, fungos e contaminação biológica.",
      maxTemperature: 45,
      maxPressure: 1
    }),
    precision_balance: Object.freeze({
      id: "precision_balance",
      name: "Balança de Precisão",
      icon: "⚖",
      purpose: "Medição de massa, densidade estimada e quantidades de receita.",
      maxTemperature: 40,
      maxPressure: 1
    }),
    ventilation_hood: Object.freeze({
      id: "ventilation_hood",
      name: "Capela de Exaustão",
      icon: "≋",
      purpose: "Contenção de gases e vapores liberados por reações perigosas.",
      maxTemperature: 750,
      maxPressure: 1.2,
      gasContainment: true
    }),
    chemical_reactor: Object.freeze({
      id: "chemical_reactor",
      name: "Reator Químico",
      icon: "⬡",
      purpose: "Reações avançadas, pressurizadas ou com múltiplas etapas.",
      maxTemperature: 1200,
      maxPressure: 12,
      gasContainment: true
    }),
    electrolysis: Object.freeze({
      id: "electrolysis",
      name: "Estação de Eletrólise",
      icon: "ϟ",
      purpose: "Separação eletroquímica e produção de hidrogênio e oxigênio.",
      maxTemperature: 900,
      maxPressure: 4,
      gasContainment: true
    }),
    spectrometer: Object.freeze({
      id: "spectrometer",
      name: "Espectrômetro",
      icon: "◇",
      purpose: "Identificação de composição, elementos e radioatividade.",
      maxTemperature: 60,
      maxPressure: 1
    }),
    water_purification: Object.freeze({
      id: "water_purification",
      name: "Purificação de Água",
      icon: "◒",
      purpose: "Filtração, fervura, tratamento químico e controle de qualidade.",
      maxTemperature: 130,
      maxPressure: 2
    }),
    refrigeration: Object.freeze({
      id: "refrigeration",
      name: "Unidade de Refrigeração",
      icon: "❄",
      purpose: "Preservação de alimentos, culturas e substâncias instáveis.",
      maxTemperature: 40,
      maxPressure: 1
    }),
    sample_storage: Object.freeze({
      id: "sample_storage",
      name: "Armário de Amostras",
      icon: "▤",
      purpose: "Organização, recuperação e descarte seguro de amostras.",
      maxTemperature: 35,
      maxPressure: 1
    })
  });

  const RESEARCH_NODES = Object.freeze([
    Object.freeze({ id: "field_sampling", category: "Chemistry", name: "Amostragem de campo", cost: 0, requires: [], unlocks: "Recipientes e registro básico de amostras." }),
    Object.freeze({ id: "water_safety", category: "Environmental Science", name: "Segurança hídrica", cost: 4, requires: ["field_sampling"], unlocks: "Diagnóstico e tratamento de águas perigosas." }),
    Object.freeze({ id: "chemical_hazards", category: "Survival", name: "Riscos químicos", cost: 5, requires: ["field_sampling"], unlocks: "Leitura de toxicidade, corrosão, fumaça e ar contaminado." }),
    Object.freeze({ id: "microscopy", category: "Biology", name: "Microscopia", cost: 5, requires: ["field_sampling"], unlocks: "Análise de fungos, água e microrganismos." }),
    Object.freeze({ id: "distillation", category: "Chemistry", name: "Destilação", cost: 6, requires: ["water_safety"], unlocks: "Água destilada, solventes purificados e separação de líquidos." }),
    Object.freeze({ id: "electrochemistry", category: "Energy", name: "Eletroquímica", cost: 7, requires: ["chemical_hazards"], unlocks: "Eletrólise, células voltaicas e materiais condutores." }),
    Object.freeze({ id: "advanced_filters", category: "Engineering", name: "Filtros avançados", cost: 8, requires: ["water_safety", "chemical_hazards"], unlocks: "Cartuchos de gás e carvão ativado de maior eficiência." }),
    Object.freeze({ id: "materials_science", category: "Physics", name: "Ciência dos materiais", cost: 8, requires: ["chemical_hazards"], unlocks: "Ligas, cerâmicas técnicas e análise de propriedades." }),
    Object.freeze({ id: "diving_technology", category: "Engineering", name: "Tecnologia de mergulho", cost: 8, requires: ["water_safety"], unlocks: "Cilindros reforçados, pressão e exploração subaquática." }),
    Object.freeze({ id: "radiation_detection", category: "Physics", name: "Detecção radiológica", cost: 10, requires: ["materials_science"], unlocks: "Leitura de radioatividade e proteção contra radiação." }),
    Object.freeze({ id: "bioremediation", category: "Medicine", name: "Biorremediação", cost: 10, requires: ["microscopy", "water_safety"], unlocks: "Tratamento biológico e recuperação de ambientes." }),
    Object.freeze({ id: "environmental_restoration", category: "Environmental Science", name: "Restauração ambiental", cost: 12, requires: ["bioremediation", "advanced_filters"], unlocks: "Tecnologias para neutralizar áreas contaminadas." })
  ]);

  const REACTIONS = Object.freeze([
    Object.freeze({
      id: "sodium_water",
      name: "Sódio em água",
      equation: "2 Na + 2 H₂O → 2 NaOH + H₂",
      stations: ["ventilation_hood", "chemical_reactor"],
      duration: 2600,
      temperature: 20,
      pressure: 1,
      container: "beaker",
      need: [["sodium_metal", 2], ["water", 2]],
      out: [["sodium_hydroxide", 2], ["hydrogen", 1]],
      producedGases: [["hydrogen", 1]],
      heatGeneration: 82,
      lightGeneration: 36,
      feedback: "flash",
      risk: { type: "corrosion", amount: 56, minimumProtection: 0.42, explosion: 0.3 },
      failureConditions: ["proteção corrosiva insuficiente", "recipiente incorreto", "contenção de hidrogênio inadequada"],
      research: "chemical_hazards",
      description: "Reação exotérmica rápida com liberação de hidrogênio."
    }),
    Object.freeze({
      id: "neutralization_lab",
      name: "Neutralização ácido–base",
      equation: "H⁺ + OH⁻ → H₂O + sal",
      stations: ["chemistry_workbench", "ventilation_hood"],
      duration: 1800,
      temperature: 24,
      container: "beaker",
      need: [["acid", 1], ["alkali", 1]],
      out: [["neutral_salt", 1], ["distilled_water", 1]],
      feedback: "color",
      risk: { type: "corrosion", amount: 18, minimumProtection: 0.18 },
      description: "Ajusta o pH e forma água e um sal dissolvido."
    }),
    Object.freeze({
      id: "iron_oxidation_lab",
      name: "Oxidação do ferro",
      equation: "4 Fe + 3 O₂ → 2 Fe₂O₃",
      stations: ["chemistry_workbench"],
      duration: 2200,
      temperature: 35,
      container: "petri_dish",
      need: [["iron", 2], ["oxygen", 1], ["water", 1]],
      out: [["iron_oxide", 2]],
      feedback: "color",
      risk: { type: "corrosion", amount: 8, minimumProtection: 0 },
      description: "Produz óxido de ferro e registra um processo redox."
    }),
    Object.freeze({
      id: "water_electrolysis_lab",
      name: "Eletrólise da água",
      equation: "2 H₂O → 2 H₂ + O₂",
      stations: ["electrolysis"],
      duration: 2800,
      temperature: 22,
      pressure: 1.2,
      container: "sealed_gas_container",
      catalyst: ["carbon_rod", 2],
      need: [["water", 2]],
      out: [["hydrogen", 2], ["oxygen", 1]],
      producedGases: [["hydrogen", 2], ["oxygen", 1]],
      feedback: "electric",
      risk: { type: "electric", amount: 22, minimumProtection: 0.35 },
      research: "electrochemistry",
      description: "Separa água com corrente elétrica e eletrodos de carbono."
    }),
    Object.freeze({
      id: "molten_salt_electrolysis",
      name: "Eletrólise do sal fundido",
      equation: "2 NaCl(l) → 2 Na + Cl₂",
      stations: ["electrolysis"],
      duration: 3400,
      temperature: 805,
      pressure: 1.1,
      container: "sealed_gas_container",
      catalyst: ["carbon_rod", 2],
      need: [["sodium_chloride", 2], ["coal", 1]],
      out: [["sodium_metal", 2], ["chlorine", 1]],
      producedGases: [["chlorine", 1]],
      heatGeneration: 66,
      lightGeneration: 42,
      feedback: "electric",
      risk: { type: "electric", amount: 52, minimumProtection: 0.48, explosion: 0.14 },
      research: "electrochemistry",
      failureConditions: ["isolamento elétrico insuficiente", "temperatura abaixo do ponto de fusão", "contenção de cloro inadequada"],
      description: "Funde o sal e separa sódio metálico de cloro em uma célula fechada."
    }),
    Object.freeze({
      id: "hydrogen_combustion",
      name: "Combustão do hidrogênio",
      equation: "2 H₂ + O₂ → 2 H₂O + energia",
      stations: ["bunsen_burner", "chemical_reactor"],
      duration: 1700,
      temperature: 580,
      pressure: 1,
      container: "flask",
      need: [["hydrogen", 2], ["oxygen", 1]],
      out: [["distilled_water", 2]],
      producedGases: [["steam", 2]],
      heatGeneration: 90,
      lightGeneration: 74,
      feedback: "flash",
      risk: { type: "fire", amount: 64, minimumProtection: 0.45, explosion: 0.42 },
      research: "chemical_hazards",
      description: "Combustão controlada que libera luz, calor e vapor."
    }),
    Object.freeze({
      id: "carbon_combustion_lab",
      name: "Combustão do carbono",
      equation: "C + O₂ → CO₂",
      stations: ["ventilation_hood", "laboratory_furnace"],
      duration: 1900,
      temperature: 450,
      need: [["coal", 1], ["oxygen", 1]],
      out: [["carbon_dioxide", 1]],
      feedback: "smoke",
      risk: { type: "smoke", amount: 35, minimumProtection: 0.3 },
      description: "Oxida carbono e produz dióxido de carbono."
    }),
    Object.freeze({
      id: "carbonate_acid",
      name: "Carbonato com ácido",
      equation: "CaCO₃ + 2 HCl → CaCl₂ + H₂O + CO₂",
      stations: ["ventilation_hood"],
      duration: 2100,
      temperature: 25,
      container: "flask",
      need: [["limestone", 2], ["hydrochloric_acid", 1]],
      out: [["calcium_chloride", 1], ["carbon_dioxide", 1], ["distilled_water", 1]],
      feedback: "bubbles",
      risk: { type: "corrosion", amount: 38, minimumProtection: 0.38 },
      research: "chemical_hazards",
      description: "Efervescência com liberação de gás carbônico."
    }),
    Object.freeze({
      id: "copper_oxidation_lab",
      name: "Oxidação do cobre",
      equation: "2 Cu + O₂ → 2 CuO",
      stations: ["bunsen_burner", "laboratory_furnace"],
      duration: 2300,
      temperature: 360,
      fuel: ["coal", 1],
      need: [["copper", 2], ["oxygen", 1]],
      out: [["copper_oxide", 2]],
      feedback: "color",
      risk: { type: "fire", amount: 16, minimumProtection: 0.18 },
      description: "Forma uma camada escura de óxido de cobre."
    }),
    Object.freeze({
      id: "salt_crystallization",
      name: "Cristalização do sal",
      equation: "NaCl(aq) → NaCl(s) + H₂O(g)",
      stations: ["bunsen_burner", "distillation"],
      duration: 2500,
      temperature: 105,
      container: "beaker",
      fuel: ["coal", 1],
      need: [["salt_water", 2]],
      out: [["sodium_chloride", 2]],
      feedback: "crystals",
      risk: { type: "fire", amount: 8, minimumProtection: 0 },
      description: "Evapora o solvente e recupera cristais de cloreto de sódio."
    }),
    Object.freeze({
      id: "water_distillation_lab",
      name: "Destilação de água",
      equation: "H₂O impura → H₂O destilada + resíduo",
      stations: ["distillation"],
      duration: 3200,
      temperature: 100,
      container: "distillation_flask",
      need: [["contaminated_water", 2], ["coal", 1]],
      out: [["distilled_water", 2], ["unknown_residue", 1]],
      feedback: "steam",
      risk: { type: "fire", amount: 10, minimumProtection: 0 },
      research: "distillation",
      description: "Separa água de contaminantes não voláteis."
    }),
    Object.freeze({
      id: "charcoal_filtration_lab",
      name: "Filtração com carvão",
      equation: "Água impura + C ativado → água purificada",
      stations: ["water_purification"],
      duration: 2100,
      temperature: 22,
      need: [["contaminated_water", 2], ["activated_carbon", 1]],
      out: [["purified_water", 2], ["unknown_residue", 1]],
      feedback: "filter",
      risk: { type: "biological", amount: 8, minimumProtection: 0.12 },
      research: "water_safety",
      description: "Remove partículas e parte dos compostos orgânicos; não esteriliza tudo."
    }),
    Object.freeze({
      id: "soap_saponification",
      name: "Produção de sabão",
      equation: "Óleo + base → sabão + glicerol",
      stations: ["chemistry_workbench", "chemical_reactor"],
      duration: 2700,
      temperature: 55,
      container: "beaker",
      need: [["plant_oil", 2], ["alkali", 1]],
      out: [["soap", 3]],
      feedback: "bubbles",
      risk: { type: "corrosion", amount: 24, minimumProtection: 0.3 },
      description: "Saponificação de gordura vegetal em meio alcalino."
    }),
    Object.freeze({
      id: "lime_calcination_lab",
      name: "Produção de cal",
      equation: "CaCO₃ → CaO + CO₂",
      stations: ["laboratory_furnace"],
      duration: 3000,
      temperature: 825,
      need: [["limestone", 2], ["coal", 1]],
      out: [["quicklime", 2], ["carbon_dioxide", 1]],
      feedback: "heat",
      risk: { type: "fire", amount: 42, minimumProtection: 0.38 },
      research: "materials_science",
      description: "Calcinação de calcário em temperatura elevada."
    }),
    Object.freeze({
      id: "fermentation_lab",
      name: "Fermentação",
      equation: "C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂",
      stations: ["refrigeration", "chemistry_workbench"],
      duration: 2400,
      temperature: 28,
      pressure: 1.1,
      container: "flask",
      need: [["berries", 3], ["water", 1]],
      out: [["ethanol", 1], ["carbon_dioxide", 1], ["fermented_mash", 1]],
      producedGases: [["carbon_dioxide", 1]],
      feedback: "bubbles",
      risk: { type: "biological", amount: 10, minimumProtection: 0.1 },
      research: "microscopy",
      description: "Transformação de açúcares por microrganismos."
    }),
    Object.freeze({
      id: "bronze_alloy_lab",
      name: "Liga de bronze",
      equation: "Cu + Sn → bronze",
      stations: ["laboratory_furnace"],
      duration: 3000,
      temperature: 950,
      pressure: 1.15,
      need: [["copper", 2], ["tin", 1], ["coal", 1]],
      out: [["bronze_ingot", 3]],
      feedback: "heat",
      risk: { type: "fire", amount: 48, minimumProtection: 0.42 },
      research: "materials_science",
      description: "Fusão e homogeneização de cobre e estanho."
    })
  ]);

  const SAMPLE_CONTAINERS = Object.freeze({
    soil: "soil_sample_bag",
    water: "water_sample_bottle",
    plant: "sample_vial",
    fungi: "petri_dish",
    mineral: "sample_vial",
    animal: "sterile_swab",
    air: "air_canister",
    liquid: "hazardous_container",
    residue: "hazardous_container",
    meteorite: "hazardous_container"
  });

  const ANALYSIS_PROPERTIES = Object.freeze({
    microscope: Object.freeze(["biologicalContamination", "microorganisms", "appearance"]),
    spectrometer: Object.freeze(["composition", "radioactivity", "magneticBehavior"]),
    precision_balance: Object.freeze(["mass", "density"]),
    centrifuge: Object.freeze(["suspendedMaterial", "phaseCount"]),
    water_purification: Object.freeze(["pH", "purity", "contamination", "solubility"]),
    bunsen_burner: Object.freeze(["flammability", "meltingPoint"]),
    laboratory_furnace: Object.freeze(["meltingPoint", "thermalConductivity"]),
    electrolysis: Object.freeze(["electricalConductivity"]),
    distillation: Object.freeze(["boilingPoint", "purity"])
  });

  const CATALOG = Object.freeze({
    minerals: Object.freeze([
      ["coal", "Carvão"],
      ["iron", "Minério de ferro"],
      ["copper", "Minério de cobre"],
      ["sulfur", "Enxofre"],
      ["salt", "Halita"],
      ["limestone", "Calcário"],
      ["crystal", "Cristal prismático"],
      ["amethyst", "Ametista"],
      ["meteorite", "Material meteorítico"]
    ]),
    animals: Object.freeze([
      ["deer", "Cervo"],
      ["pig", "Porco"],
      ["cow", "Vaca"],
      ["rabbit", "Coelho"],
      ["chicken", "Galinha"],
      ["sheep", "Ovelha"],
      ["fish", "Peixe"],
      ["acid_slime", "Slime ácido"]
    ]),
    plants: Object.freeze([
      ["cactus", "Cacto"],
      ["moss", "Musgo"],
      ["poppy", "Papoula"],
      ["blue_flower", "Flor azul"],
      ["white_flower", "Flor branca"],
      ["bamboo", "Bambu"],
      ["berries", "Frutas silvestres"],
      ["crystal_tree", "Árvore cristalina"]
    ]),
    microorganisms: Object.freeze([
      ["water_bacteria", "Bactérias aquáticas"],
      ["fungal_spores", "Esporos fúngicos"],
      ["yeast", "Leveduras"],
      ["unknown_microbe", "Microrganismo desconhecido"]
    ]),
    substances: Object.freeze([
      ["distilled_water", "Água destilada"],
      ["sodium_chloride", "Cloreto de sódio"],
      ["hydrogen", "Hidrogênio"],
      ["oxygen", "Oxigênio"],
      ["acid", "Ácido sulfúrico"],
      ["alkali", "Solução alcalina"],
      ["copper_sulfate", "Sulfato de cobre"],
      ["iron_oxide", "Óxido de ferro"],
      ["ethanol", "Etanol"],
      ["soap", "Sabão"]
    ]),
    hazards: Object.freeze(HAZARD_KEYS.map(key => [key, HAZARD_LABELS[key]])),
    reactions: Object.freeze(REACTIONS.map(reaction => [reaction.id, reaction.name])),
    experiments: Object.freeze(REACTIONS.map(reaction => [reaction.id, `Experimento: ${reaction.name}`])),
    recipes: Object.freeze([
      ["sample_vial", "Frascos de amostra"],
      ["gas_mask", "Máscara de gás"],
      ["chemical_lab_coat", "Jaleco químico"],
      ["thermal_coat", "Casaco térmico"],
      ["radiation_suit", "Traje antirradiação"],
      ["fire_suit", "Traje resistente ao fogo"],
      ["diving_suit", "Roupa de mergulho"],
      ["pressure_suit", "Traje pressurizado"],
      ["reinforced_oxygen_tank", "Cilindro reforçado"],
      ["filter_cartridge", "Cartucho de filtro"]
    ]),
    missions: Object.freeze([
      ["carbon_tutorial", "Primeiros passos com Prof. Carbono"],
      ["periodic_elements", "Restauração da Tabela Periódica"],
      ["sample_collection", "Coleta de amostras"],
      ["sample_analysis", "Análise de materiais"],
      ["water_purification", "Purificação de água"],
      ["laboratory_experiment", "Experimento de laboratório"],
      ["protective_equipment", "Equipamento de proteção"]
    ])
  });

  const DEFAULT_SETTINGS = Object.freeze({
    reducedMotion: false,
    reducedUnderwaterDistortion: false,
    reducedFlashing: false,
    largeText: false,
    highContrast: false,
    colorblindHazards: false,
    foodSpoilage: true,
    survivalDifficulty: "normal",
    eventFrequency: "normal",
    disableShake: false,
    explanationLevel: "standard"
  });

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, Number(value) || 0));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeParse(storage, key) {
    try {
      return JSON.parse(storage.getItem(key) || "null");
    } catch (error) {
      console.warn(`[QuimiCraft][Ciência] Save inválido em ${key}; o arquivo original foi preservado.`, error);
      return null;
    }
  }

  function safeWrite(storage, key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[QuimiCraft][Ciência] Não foi possível salvar ${key}.`, error);
      return false;
    }
  }

  function normalizeRecord(input, fallback) {
    return input && typeof input === "object" && !Array.isArray(input) ? input : fallback;
  }

  function createDefaultState() {
    return {
      version: SAVE_VERSION,
      body: {
        temperature: 37,
        wetness: 0,
        radiationDose: 0,
        sickness: 0
      },
      hazards: Object.fromEntries(HAZARD_KEYS.map(key => [key, 0])),
      exposures: Object.fromEntries(HAZARD_KEYS.map(key => [key, 0])),
      hazardPulse: Object.fromEntries(HAZARD_KEYS.map(key => [key, 0])),
      statusEffects: [],
      notebook: {
        discoveries: {},
        entries: {},
        observations: []
      },
      samples: [],
      research: {
        points: 0,
        earned: 0,
        unlocked: ["field_sampling"]
      },
      equipment: {},
      reactions: {
        completed: [],
        failed: []
      },
      statistics: {
        samplesCollected: 0,
        samplesAnalyzed: 0,
        hazardsEntered: 0,
        waterTests: 0,
        repairs: 0
      },
      settings: { ...DEFAULT_SETTINGS },
      lastSavedAt: 0
    };
  }

  function migrateState(raw) {
    const state = createDefaultState();
    if (!raw || typeof raw !== "object") return state;

    const body = normalizeRecord(raw.body, {});
    state.body.temperature = clamp(body.temperature || 37, 30, 43);
    state.body.wetness = clamp(body.wetness, 0, 1);
    state.body.radiationDose = Math.max(0, Number(body.radiationDose) || 0);
    state.body.sickness = clamp(body.sickness, 0, 100);

    for (const key of HAZARD_KEYS) {
      state.hazards[key] = clamp(raw.hazards?.[key], 0, 100);
      state.exposures[key] = Math.max(0, Number(raw.exposures?.[key]) || 0);
      state.hazardPulse[key] = 0;
    }

    const notebook = normalizeRecord(raw.notebook, {});
    state.notebook.discoveries = normalizeRecord(notebook.discoveries, {});
    state.notebook.entries = normalizeRecord(notebook.entries, {});
    state.notebook.observations = Array.isArray(notebook.observations)
      ? notebook.observations.slice(-180)
      : [];
    state.samples = Array.isArray(raw.samples)
      ? raw.samples.filter(sample => sample && sample.id && sample.kind).slice(-80)
      : [];

    const research = normalizeRecord(raw.research, {});
    state.research.points = Math.max(0, Math.floor(Number(research.points) || 0));
    state.research.earned = Math.max(state.research.points, Math.floor(Number(research.earned) || 0));
    const knownNodes = new Set(RESEARCH_NODES.map(node => node.id));
    state.research.unlocked = Array.isArray(research.unlocked)
      ? [...new Set(["field_sampling", ...research.unlocked.filter(id => knownNodes.has(id))])]
      : ["field_sampling"];

    state.equipment = normalizeRecord(raw.equipment, {});
    for (const [id, condition] of Object.entries(state.equipment)) {
      const definition = EQUIPMENT_DEFINITIONS[id];
      if (!definition || !condition || typeof condition !== "object") {
        delete state.equipment[id];
        continue;
      }
      condition.durability = clamp(condition.durability, 0, definition.maxDurability || 100);
      if (definition.filterCapacity) {
        condition.filter = clamp(condition.filter ?? definition.filterCapacity, 0, definition.filterCapacity);
      }
      if (definition.oxygenCapacity) {
        condition.oxygen = clamp(condition.oxygen ?? definition.oxygenCapacity, 0, definition.oxygenCapacity);
      }
      condition.broken = condition.durability <= 0;
    }

    state.reactions.completed = Array.isArray(raw.reactions?.completed)
      ? [...new Set(raw.reactions.completed.filter(id => REACTIONS.some(reaction => reaction.id === id)))]
      : [];
    state.reactions.failed = Array.isArray(raw.reactions?.failed)
      ? raw.reactions.failed.slice(-60)
      : [];
    state.statistics = {
      ...state.statistics,
      ...normalizeRecord(raw.statistics, {})
    };
    state.settings = {
      ...DEFAULT_SETTINGS,
      ...normalizeRecord(raw.settings, {})
    };
    state.version = SAVE_VERSION;
    return state;
  }

  function createCraftingRecipes(block) {
    return [
      { name: "Frascos de amostra", desc: "2 vidros → 4 frascos", need: [[block.GLASS, 2]], out: ["sample_vial", 4] },
      { name: "Tubos de ensaio", desc: "2 vidros → 4 tubos", need: [[block.GLASS, 2]], out: ["test_tube", 4] },
      { name: "Placas de Petri", desc: "2 vidros → 3 placas", need: [[block.GLASS, 2]], out: ["petri_dish", 3] },
      { name: "Frasco de água", desc: "2 vidros + 1 ferro", need: [[block.GLASS, 2], [block.IRON, 1]], out: ["water_sample_bottle", 2] },
      { name: "Sacos de solo", desc: "2 lãs → 4 sacos", need: [["wool", 2]], out: ["soil_sample_bag", 4] },
      { name: "Coletores de ar", desc: "2 ferros + 1 vidro", need: [[block.IRON, 2], [block.GLASS, 1]], out: ["air_canister", 2] },
      { name: "Swabs estéreis", desc: "1 lã + 2 bastões", need: [["wool", 1], ["stick", 2]], out: ["sterile_swab", 4] },
      { name: "Recipiente reforçado", desc: "2 ferros + 1 cerâmica + 1 vidro", need: [[block.IRON, 2], ["ceramic_plate", 1], [block.GLASS, 1]], out: ["hazardous_container", 2] },
      { name: "Béquer", desc: "3 vidros → 2 béqueres", need: [[block.GLASS, 3]], out: ["beaker", 2] },
      { name: "Erlenmeyer", desc: "3 vidros → 2 frascos", need: [[block.GLASS, 3]], out: ["flask", 2] },
      { name: "Proveta", desc: "2 vidros + 1 ferro", need: [[block.GLASS, 2], [block.IRON, 1]], out: ["graduated_cylinder", 1] },
      { name: "Pipetas", desc: "1 vidro → 3 pipetas", need: [[block.GLASS, 1]], out: ["pipette", 3] },
      { name: "Garrafa de vidro", desc: "2 vidros → 2 garrafas", need: [[block.GLASS, 2]], out: ["glass_bottle", 2] },
      { name: "Frasco químico", desc: "2 vidros + 1 cerâmica", need: [[block.GLASS, 2], ["ceramic_plate", 1]], out: ["chemical_bottle", 1] },
      { name: "Recipiente de gás selado", desc: "2 ferros + 1 vidro", need: [[block.IRON, 2], [block.GLASS, 1]], out: ["sealed_gas_container", 1], research: "electrochemistry" },
      { name: "Recipiente para ácido", desc: "2 ferros + 2 cerâmicas", need: [[block.IRON, 2], ["ceramic_plate", 2]], out: ["reinforced_acid_container", 1], research: "chemical_hazards" },
      { name: "Máscara de gás", desc: "1 respirador + 1 filtro + 2 borrachas", need: [["respirator_mask", 1], ["filter_cartridge", 1], ["hide", 2]], out: ["gas_mask", 1], research: "advanced_filters" },
      { name: "Cartucho de filtro", desc: "2 carvões + 1 lã + 1 ferro", need: [[block.COAL, 2], ["wool", 1], [block.IRON, 1]], out: ["filter_cartridge", 1], research: "advanced_filters" },
      { name: "Luvas descartáveis", desc: "2 lãs + 1 óleo", need: [["wool", 2], ["plant_oil", 1]], out: ["disposable_gloves", 2] },
      { name: "Luvas químicas", desc: "2 couros + 1 óleo + 1 cerâmica", need: [["hide", 2], ["plant_oil", 1], ["ceramic_plate", 1]], out: ["chemical_gloves", 1], research: "chemical_hazards" },
      { name: "Luvas térmicas", desc: "2 lãs + 2 cerâmicas", need: [["wool", 2], ["ceramic_plate", 2]], out: ["heat_gloves", 1], research: "materials_science" },
      { name: "Jaleco químico", desc: "1 jaleco + 2 couros + 1 óleo", need: [["lab_coat", 1], ["hide", 2], ["plant_oil", 1]], out: ["chemical_lab_coat", 1], research: "chemical_hazards" },
      { name: "Protetor facial", desc: "3 vidros + 1 ferro", need: [[block.GLASS, 3], [block.IRON, 1]], out: ["face_shield", 1], research: "chemical_hazards" },
      { name: "Casaco térmico", desc: "5 lãs + 2 couros", need: [["wool", 5], ["hide", 2]], out: ["thermal_coat", 1], research: "materials_science" },
      { name: "Manta térmica", desc: "4 lãs + 1 óleo", need: [["wool", 4], ["plant_oil", 1]], out: ["thermal_blanket", 1] },
      { name: "Botas isolantes", desc: "1 bota de borracha + 2 lãs", need: [["rubber_boots", 1], ["wool", 2]], out: ["insulated_boots", 1], research: "materials_science" },
      { name: "Colete refrigerado", desc: "3 lãs + 2 cobres + 1 água", need: [["wool", 3], [block.COPPER, 2], ["water", 1]], out: ["cooling_vest", 1], research: "materials_science" },
      { name: "Traje resistente ao fogo", desc: "1 jaleco químico + 4 cerâmicas + 2 lãs", need: [["chemical_lab_coat", 1], ["ceramic_plate", 4], ["wool", 2]], out: ["fire_suit", 1], research: "materials_science" },
      { name: "Traje antirradiação", desc: "1 jaleco químico + 5 ferros + 2 filtros", need: [["chemical_lab_coat", 1], [block.IRON, 5], ["carbon_filter", 2]], out: ["radiation_suit", 1], research: "radiation_detection" },
      { name: "Roupa de mergulho", desc: "4 couros + 2 óleos", need: [["hide", 4], ["plant_oil", 2]], out: ["diving_suit", 1], research: "water_safety" },
      { name: "Máscara de mergulho", desc: "2 vidros + 1 couro", need: [[block.GLASS, 2], ["hide", 1]], out: ["diving_mask", 1], research: "water_safety" },
      { name: "Snorkel", desc: "1 ferro + 1 couro", need: [[block.IRON, 1], ["hide", 1]], out: ["snorkel", 1], research: "water_safety" },
      { name: "Nadadeiras", desc: "3 couros + 1 óleo", need: [["hide", 3], ["plant_oil", 1]], out: ["fins", 1], research: "water_safety" },
      { name: "Cilindro reforçado", desc: "1 cilindro + 3 ferros + 1 cerâmica", need: [["oxygen_tank", 1], [block.IRON, 3], ["ceramic_plate", 1]], out: ["reinforced_oxygen_tank", 1], research: "diving_technology" },
      { name: "Traje pressurizado", desc: "1 roupa de mergulho + 5 ferros + 3 cerâmicas", need: [["diving_suit", 1], [block.IRON, 5], ["ceramic_plate", 3]], out: ["pressure_suit", 1], research: "diving_technology" },
      { name: "Lanterna subaquática", desc: "2 ferros + 1 vidro + 1 célula", need: [[block.IRON, 2], [block.GLASS, 1], ["voltaic_cell", 1]], out: ["underwater_flashlight", 1], research: "diving_technology" },
      { name: "Medidor de profundidade", desc: "2 ferros + 1 vidro + 1 célula", need: [[block.IRON, 2], [block.GLASS, 1], ["voltaic_cell", 1]], out: ["depth_gauge", 1], research: "diving_technology" }
    ];
  }

  function createScienceSystem(config) {
    const options = config || {};
    const storage = options.storage || global.localStorage;
    const notify = typeof options.notify === "function" ? options.notify : function () {};
    const damagePlayer = typeof options.damagePlayer === "function" ? options.damagePlayer : function () {};
    const resolveItemId = typeof options.resolveItemId === "function" ? options.resolveItemId : value => value;
    const rawCountItem = typeof options.countItem === "function" ? options.countItem : function () { return 0; };
    const rawRemoveItem = typeof options.removeItem === "function" ? options.removeItem : function () { return false; };
    const rawAddItem = typeof options.addItem === "function" ? options.addItem : function () { return false; };
    const rawItemName = typeof options.itemName === "function" ? options.itemName : value => String(value);
    const countItem = id => rawCountItem(resolveItemId(id));
    const removeItem = (id, quantity) => rawRemoveItem(resolveItemId(id), quantity);
    const addItem = (id, quantity) => rawAddItem(resolveItemId(id), quantity);
    const itemName = id => rawItemName(resolveItemId(id));
    const onChange = typeof options.onChange === "function" ? options.onChange : function () {};
    const getSampleCapacity = typeof options.getSampleCapacity === "function"
      ? options.getSampleCapacity
      : function () { return 8; };
    const worldSeed = Number(options.worldSeed) || 0;
    const restored = safeParse(storage, STORAGE_KEY);
    const state = migrateState(restored);
    let lastPersist = 0;
    let damageClock = 0;
    let environmentClock = 0;
    let sampleAgingClock = 0;
    let lastSnapshot = null;
    const warnedHazards = new Set();

    function exportState() {
      return clone({
        ...state,
        version: SAVE_VERSION,
        lastSavedAt: Date.now()
      });
    }

    function persist(force = false) {
      const now = Date.now();
      if (!force && now - lastPersist < 2500) return false;
      lastPersist = now;
      state.lastSavedAt = now;
      return safeWrite(storage, STORAGE_KEY, exportState());
    }

    function emit(forcePersist = false) {
      persist(forcePersist);
      onChange(api);
    }

    function ensureEquipment(id) {
      const definition = EQUIPMENT_DEFINITIONS[id];
      if (!definition) return null;
      if (!state.equipment[id]) {
        state.equipment[id] = {
          durability: definition.maxDurability || 100,
          broken: false
        };
        if (definition.filterCapacity) state.equipment[id].filter = definition.filterCapacity;
        if (definition.oxygenCapacity) state.equipment[id].oxygen = definition.oxygenCapacity;
      }
      return state.equipment[id];
    }

    function equipmentCondition(id) {
      const definition = EQUIPMENT_DEFINITIONS[id];
      const condition = definition ? ensureEquipment(id) : null;
      if (!definition || !condition) return null;
      return {
        id,
        durability: condition.durability,
        maximum: definition.maxDurability || 100,
        ratio: clamp(condition.durability / (definition.maxDurability || 100), 0, 1),
        broken: condition.durability <= 0,
        filter: definition.filterCapacity ? condition.filter : null,
        filterMaximum: definition.filterCapacity || null,
        oxygen: definition.oxygenCapacity ? condition.oxygen : null,
        oxygenMaximum: definition.oxygenCapacity || null
      };
    }

    function damageEquipment(id, amount, reason) {
      const definition = EQUIPMENT_DEFINITIONS[id];
      const condition = ensureEquipment(id);
      if (!definition || !condition || condition.durability <= 0) return false;
      const previous = condition.durability;
      condition.durability = clamp(previous - Math.max(0, Number(amount) || 0), 0, definition.maxDurability || 100);
      condition.broken = condition.durability <= 0;
      const justBroke = previous > 0 && condition.broken;
      if (justBroke) {
        notify({
          category: "critical",
          speaker: "EQUIPAMENTO",
          text: `${itemName(id)} quebrou durante ${reason || "o uso"}. Ele permanece equipado, mas deixou de funcionar.`,
          critical: true
        });
      }
      persist();
      if (justBroke) onChange(api);
      return condition.durability !== previous;
    }

    function protectionSummary(equippedIds) {
      const ids = [...new Set((equippedIds || []).filter(Boolean))];
      const protection = Object.fromEntries([...HAZARD_KEYS, "fire", "electric", "pressure", "physical", "splash"].map(key => [key, 0]));
      let insulation = 0;
      let heatResistance = 0;
      let coldResistance = 0;
      let cooling = 0;
      let conductivity = 0;
      let movement = 1;
      let waterSpeed = 1;
      let clarity = 0;

      for (const id of ids) {
        const definition = EQUIPMENT_DEFINITIONS[id];
        const condition = definition && ensureEquipment(id);
        if (!definition || !condition || condition.durability <= 0) continue;
        const conditionFactor = clamp(condition.durability / (definition.maxDurability || 100), 0.2, 1);
        let filterFactor = 1;
        if (definition.filterCapacity) filterFactor = condition.filter > 0 ? clamp(condition.filter / definition.filterCapacity, 0.18, 1) : 0.08;
        for (const [key, raw] of Object.entries(definition.protections || {})) {
          const factor = ["toxicity", "air", "biological", "smoke"].includes(key) ? filterFactor : 1;
          const value = clamp(raw * conditionFactor * factor, 0, 0.96);
          protection[key] = 1 - (1 - protection[key]) * (1 - value);
        }
        insulation += (definition.insulation || 0) * conditionFactor;
        heatResistance += (definition.heatResistance || 0) * conditionFactor;
        coldResistance += (definition.coldResistance || 0) * conditionFactor;
        cooling += (definition.cooling || 0) * conditionFactor;
        conductivity += (definition.conductivity || 0) * conditionFactor;
        movement *= definition.movement || 1;
        waterSpeed *= definition.waterSpeed || 1;
        clarity += (definition.clarity || 0) * conditionFactor;
      }
      return {
        protection,
        insulation: clamp(insulation, 0, 0.88),
        heatResistance: clamp(heatResistance, 0, 0.9),
        coldResistance: clamp(coldResistance, 0, 0.9),
        cooling: clamp(cooling, 0, 0.85),
        conductivity: clamp(conductivity, 0, 0.8),
        movement: clamp(movement, 0.62, 1.25),
        waterSpeed: clamp(waterSpeed, 0.72, 1.65),
        clarity: clamp(clarity, 0, 0.84)
      };
    }

    function consumeFilter(id, amount) {
      const definition = EQUIPMENT_DEFINITIONS[id];
      const condition = ensureEquipment(id);
      if (!definition?.filterCapacity || !condition) return 0;
      condition.filter = clamp(condition.filter - Math.max(0, Number(amount) || 0), 0, definition.filterCapacity);
      persist();
      return condition.filter;
    }

    function useOxygen(equippedIds, amount) {
      const tankId = (equippedIds || []).find(id => EQUIPMENT_DEFINITIONS[id]?.oxygenCapacity);
      if (!tankId) return { available: false, id: null, remaining: 0, maximum: 0 };
      const definition = EQUIPMENT_DEFINITIONS[tankId];
      const condition = ensureEquipment(tankId);
      if (!condition || condition.durability <= 0 || condition.oxygen <= 0) {
        return { available: false, id: tankId, remaining: condition?.oxygen || 0, maximum: definition.oxygenCapacity };
      }
      condition.oxygen = clamp(condition.oxygen - Math.max(0, Number(amount) || 0), 0, definition.oxygenCapacity);
      if (condition.oxygen <= 0) {
        notify({
          category: "critical",
          speaker: "MERGULHO",
          text: `O ${itemName(tankId)} ficou sem oxigênio. Reabasteça na estação de eletrólise.`,
          critical: true
        });
      }
      persist();
      return {
        available: condition.oxygen > 0,
        id: tankId,
        remaining: condition.oxygen,
        maximum: definition.oxygenCapacity
      };
    }

    function refillEquipment(id, mode) {
      const definition = EQUIPMENT_DEFINITIONS[id];
      const condition = ensureEquipment(id);
      if (!definition || !condition) return { ok: false, message: "Equipamento desconhecido." };
      if (mode === "filter") {
        if (!definition.filterCapacity) return { ok: false, message: "Este item não usa filtro." };
        const cartridge = countItem("filter_cartridge") > 0 ? "filter_cartridge" : "carbon_filter";
        if (countItem(cartridge) < 1) return { ok: false, message: "É necessário um cartucho ou filtro de carbono." };
        removeItem(cartridge, 1);
        condition.filter = definition.filterCapacity;
        emit(true);
        return { ok: true, message: `Filtro de ${itemName(id)} substituído.` };
      }
      if (mode === "oxygen") {
        if (!definition.oxygenCapacity) return { ok: false, message: "Este item não armazena oxigênio." };
        if (countItem("oxygen") < 1) return { ok: false, message: "É necessária uma unidade de oxigênio." };
        removeItem("oxygen", 1);
        condition.oxygen = definition.oxygenCapacity;
        emit(true);
        return { ok: true, message: `${itemName(id)} reabastecido.` };
      }
      return { ok: false, message: "Manutenção não reconhecida." };
    }

    function repairEquipment(id) {
      const definition = EQUIPMENT_DEFINITIONS[id];
      const condition = ensureEquipment(id);
      if (!definition || !condition) return { ok: false, message: "Equipamento desconhecido." };
      if (condition.durability >= definition.maxDurability) return { ok: false, message: "O equipamento já está em condição máxima." };
      const need = definition.repair || [];
      const missing = need.filter(([material, quantity]) => countItem(material) < quantity);
      if (missing.length) {
        return {
          ok: false,
          message: `Faltam ${missing.map(([material, quantity]) => `${quantity}× ${itemName(material)}`).join(" + ")}.`
        };
      }
      need.forEach(([material, quantity]) => removeItem(material, quantity));
      condition.durability = definition.maxDurability;
      condition.broken = false;
      state.statistics.repairs += 1;
      emit(true);
      return { ok: true, message: `${itemName(id)} reparado sem perder o item.` };
    }

    function registerDiscovery(category, id, data) {
      const safeCategory = String(category || "observations");
      const safeId = String(id || "").trim();
      if (!safeId) return null;
      const categoryDiscoveries = state.notebook.discoveries[safeCategory] || {};
      const wasKnown = !!categoryDiscoveries[safeId];
      const current = categoryDiscoveries[safeId] || {
        id: safeId,
        category: safeCategory,
        discoveredAt: Date.now(),
        count: 0,
        researchProgress: 0
      };
      categoryDiscoveries[safeId] = {
        ...current,
        ...normalizeRecord(data, {}),
        id: safeId,
        category: safeCategory,
        count: Math.max(1, Number(current.count || 0) + 1),
        researchProgress: clamp(Math.max(current.researchProgress || 0, Number(data?.researchProgress) || 20), 0, 100)
      };
      state.notebook.discoveries[safeCategory] = categoryDiscoveries;
      if (!wasKnown && !data?.silent) {
        grantResearchPoints(safeCategory === "elements" ? 3 : 2, `descoberta: ${data?.name || safeId}`, false);
        notify({
          category: "discovery",
          text: `${data?.name || safeId} foi registrado no Caderno Científico.`
        });
      }
      emit();
      return clone(categoryDiscoveries[safeId]);
    }

    function addObservation(text, category) {
      const value = String(text || "").trim().slice(0, 420);
      if (!value) return;
      state.notebook.observations.push({
        id: `obs-${Date.now().toString(36)}-${state.notebook.observations.length}`,
        text: value,
        category: String(category || "field"),
        createdAt: Date.now()
      });
      if (state.notebook.observations.length > 180) state.notebook.observations.splice(0, state.notebook.observations.length - 180);
      emit();
    }

    function grantResearchPoints(amount, reason, announce = true) {
      const value = Math.max(0, Math.floor(Number(amount) || 0));
      if (!value) return state.research.points;
      state.research.points += value;
      state.research.earned += value;
      if (announce) {
        notify({
          category: "discovery",
          text: `+${value} pontos de pesquisa · ${reason || "atividade científica"}`
        });
      }
      emit();
      return state.research.points;
    }

    function unlockResearch(id) {
      const node = RESEARCH_NODES.find(entry => entry.id === id);
      if (!node) return { ok: false, message: "Pesquisa desconhecida." };
      if (state.research.unlocked.includes(id)) return { ok: false, message: "Pesquisa já desbloqueada." };
      const missing = node.requires.filter(required => !state.research.unlocked.includes(required));
      if (missing.length) return { ok: false, message: "Conclua as pesquisas anteriores primeiro." };
      if (state.research.points < node.cost) return { ok: false, message: `São necessários ${node.cost} pontos de pesquisa.` };
      state.research.points -= node.cost;
      state.research.unlocked.push(id);
      notify({
        category: "discovery",
        speaker: "PESQUISA",
        text: `${node.name} desbloqueada — ${node.unlocks}`
      });
      emit(true);
      return { ok: true, node: clone(node), message: `${node.name} desbloqueada.` };
    }

    function isResearchUnlocked(id) {
      return !id || state.research.unlocked.includes(id);
    }

    function collectSample(metadata) {
      const data = normalizeRecord(metadata, {});
      const kind = SAMPLE_CONTAINERS[data.kind] ? data.kind : "residue";
      const container = SAMPLE_CONTAINERS[kind];
      const capacity = Math.max(1, Number(getSampleCapacity()) || 8);
      if (state.samples.length >= capacity) {
        return { ok: false, message: `Capacidade de amostras atingida (${capacity}). Use uma maleta ou libere espaço.` };
      }
      if (countItem(container) < 1) {
        return { ok: false, message: `Você precisa de ${itemName(container)} para coletar esta amostra.` };
      }
      if (!removeItem(container, 1)) return { ok: false, message: "Não foi possível preparar o recipiente." };
      if (!addItem("sealed_sample", 1)) {
        addItem(container, 1);
        return { ok: false, message: "A mochila está cheia para receber a amostra selada." };
      }
      const sample = {
        id: `sample-${Date.now().toString(36)}-${Math.abs(worldSeed + state.statistics.samplesCollected).toString(36)}`,
        kind,
        name: String(data.name || `Amostra de ${kind}`).slice(0, 100),
        source: String(data.source || data.sourceBlock || data.sourceCreature || "origem desconhecida").slice(0, 120),
        sourceBlock: data.sourceBlock || null,
        sourceCreature: data.sourceCreature || null,
        location: {
          x: Math.floor(Number(data.x) || 0),
          y: Math.floor(Number(data.y) || 0),
          z: Math.floor(Number(data.z) || 0)
        },
        biome: String(data.biome || "desconhecido").slice(0, 80),
        contamination: clamp(data.contamination, 0, 100),
        temperature: Number.isFinite(Number(data.temperature)) ? Number(data.temperature) : 20,
        container,
        collectedAt: Date.now(),
        refrigerated: false,
        identified: false,
        analyzedAt: null,
        analyzedBy: [],
        revealedProperties: {},
        properties: {
          appearance: data.appearance || "Aspecto ainda não caracterizado",
          pH: data.pH ?? null,
          mass: data.mass ?? Number((0.8 + ((state.statistics.samplesCollected * 17) % 70) / 10).toFixed(2)),
          density: data.density ?? Number((0.7 + ((state.statistics.samplesCollected * 11) % 45) / 10).toFixed(2)),
          electricalConductivity: data.electricalConductivity ?? "não medida",
          thermalConductivity: data.thermalConductivity ?? "não medida",
          solubility: data.solubility ?? "não medida",
          flammability: data.flammability ?? "não medida",
          radioactivity: data.radioactivity ?? (kind === "meteorite" ? "elevada" : "baixa"),
          magneticBehavior: data.magneticBehavior ?? (kind === "mineral" ? "variável" : "não observado"),
          meltingPoint: data.meltingPoint ?? "não medido",
          boilingPoint: data.boilingPoint ?? (kind === "water" ? "aprox. 100 °C" : "não medido"),
          biologicalContamination: data.biologicalContamination ?? data.contamination ?? 0,
          microorganisms: data.microorganisms ?? (data.contamination > 45 ? "possível presença" : "não observados"),
          composition: data.composition ?? data.sourceBlock ?? data.sourceCreature ?? "desconhecida",
          purity: data.purity ?? clamp(100 - (data.contamination || 0), 0, 100),
          contamination: data.contamination ?? 0,
          suspendedMaterial: data.suspendedMaterial ?? (kind === "water" ? "partículas finas" : "baixo"),
          phaseCount: data.phaseCount ?? 1
        }
      };
      state.samples.push(sample);
      state.statistics.samplesCollected += 1;
      if (data.waterProfileId && WATER_PROFILES[data.waterProfileId]) {
        const profile = WATER_PROFILES[data.waterProfileId];
        registerDiscovery("water", profile.id, {
          name: profile.label,
          pH: profile.pH,
          purity: profile.purity,
          contamination: profile.contamination,
          source: sample.source,
          researchProgress: 30
        });
      }
      registerDiscovery(kind === "animal" ? "animals" : kind === "mineral" ? "minerals" : kind === "fungi" ? "microorganisms" : kind === "plant" ? "plants" : "samples", data.discoveryId || data.sourceBlock || data.sourceCreature || kind, {
        name: sample.name,
        source: sample.source,
        amountCollected: 1,
        researchProgress: 15
      });
      grantResearchPoints(1, "amostra de campo");
      registerDiscovery("missions", "sample_collection", {
        name: "Coleta de amostras",
        source: sample.name,
        researchProgress: clamp(state.statistics.samplesCollected * 20, 20, 100)
      });
      emit(true);
      return { ok: true, sample: clone(sample), message: `${sample.name} selada em ${itemName(container)}.` };
    }

    function analyzeSample(sampleId, stationId) {
      const sample = state.samples.find(entry => entry.id === sampleId);
      const properties = ANALYSIS_PROPERTIES[stationId];
      if (!sample) return { ok: false, message: "Amostra não encontrada." };
      if (!properties) return { ok: false, message: "Esta estação não analisa propriedades de amostras." };
      const newlyRevealed = [];
      for (const property of properties) {
        if (sample.revealedProperties[property] !== undefined) continue;
        sample.revealedProperties[property] = sample.properties[property];
        newlyRevealed.push(property);
      }
      if (!sample.analyzedBy.includes(stationId)) {
        sample.analyzedBy.push(stationId);
        grantResearchPoints(2, `análise em ${STATIONS[stationId]?.name || stationId}`);
      }
      sample.analyzedAt = Date.now();
      sample.identified = Object.keys(sample.revealedProperties).length >= 5;
      state.statistics.samplesAnalyzed += newlyRevealed.length ? 1 : 0;
      registerDiscovery("missions", "sample_analysis", {
        name: "Análise de materiais",
        source: STATIONS[stationId]?.name || stationId,
        researchProgress: clamp(state.statistics.samplesAnalyzed * 16, 20, 100)
      });
      const entryId = sample.sourceBlock || sample.sourceCreature || sample.id;
      registerDiscovery(sample.kind === "animal" ? "animals" : sample.kind === "mineral" ? "minerals" : sample.kind === "fungi" ? "microorganisms" : sample.kind === "plant" ? "plants" : "samples", entryId, {
        name: sample.name,
        testedProperties: { ...sample.revealedProperties },
        researchProgress: clamp(20 + Object.keys(sample.revealedProperties).length * 10, 0, 100)
      });
      emit(true);
      return {
        ok: true,
        sample: clone(sample),
        newlyRevealed,
        message: newlyRevealed.length
          ? `${newlyRevealed.length} propriedades reveladas.`
          : "Esta estação já revelou tudo o que consegue medir nesta amostra."
      };
    }

    function releaseSample(sampleId) {
      const index = state.samples.findIndex(entry => entry.id === sampleId);
      if (index < 0) return { ok: false, message: "Amostra não encontrada." };
      const sample = state.samples[index];
      if (!removeItem("sealed_sample", 1)) return { ok: false, message: "A amostra selada não está na mochila." };
      addItem(sample.container, 1);
      state.samples.splice(index, 1);
      emit(true);
      return { ok: true, message: `${itemName(sample.container)} recuperado; a amostra foi descartada com segurança.` };
    }

    function setSampleRefrigerated(sampleId, refrigerated) {
      const sample = state.samples.find(entry => entry.id === sampleId);
      if (!sample) return { ok: false, message: "Amostra não encontrada." };
      sample.refrigerated = !!refrigerated;
      sample.preservedAt = sample.refrigerated ? Date.now() : null;
      emit(true);
      return {
        ok: true,
        sample: clone(sample),
        message: sample.refrigerated
          ? `${sample.name} armazenada sob refrigeração.`
          : `${sample.name} retirada da refrigeração.`
      };
    }

    function reactionAvailability(reactionId, stationId, equippedIds) {
      const reaction = REACTIONS.find(entry => entry.id === reactionId);
      if (!reaction) return { ok: false, message: "Reação desconhecida." };
      if (!reaction.stations.includes(stationId)) return { ok: false, reaction, message: "Esta reação exige outra estação." };
      const station = STATIONS[stationId];
      if (Number.isFinite(reaction.temperature) && Number.isFinite(station?.maxTemperature) && reaction.temperature > station.maxTemperature) {
        return { ok: false, reaction, message: `${station.name} não alcança ${reaction.temperature} °C com segurança.` };
      }
      if (Number.isFinite(reaction.pressure) && Number.isFinite(station?.maxPressure) && reaction.pressure > station.maxPressure) {
        return { ok: false, reaction, message: `${station.name} não suporta ${reaction.pressure} atm.` };
      }
      if (!isResearchUnlocked(reaction.research)) {
        const node = RESEARCH_NODES.find(entry => entry.id === reaction.research);
        return { ok: false, reaction, message: `Desbloqueie “${node?.name || reaction.research}” na árvore de pesquisa.` };
      }
      const missing = reaction.need.filter(([id, quantity]) => countItem(id) < quantity);
      if (reaction.container && countItem(reaction.container) < 1) missing.push([reaction.container, 1]);
      if (reaction.catalyst && countItem(reaction.catalyst[0]) < reaction.catalyst[1]) missing.push(reaction.catalyst);
      if (reaction.fuel && countItem(reaction.fuel[0]) < reaction.fuel[1]) missing.push(reaction.fuel);
      const protection = protectionSummary(equippedIds);
      const riskProtection = reaction.risk?.type
        ? protection.protection[reaction.risk.type] || protection.heatResistance || 0
        : 1;
      if (missing.length) {
        return {
          ok: false,
          reaction,
          protection: riskProtection,
          message: `Faltam ${missing.map(([id, quantity]) => `${quantity}× ${itemName(id)}`).join(" + ")}.`
        };
      }
      return {
        ok: true,
        reaction,
        protection: riskProtection,
        warning: reaction.risk && riskProtection < (reaction.risk.minimumProtection || 0)
          ? `Proteção insuficiente contra ${reaction.risk.type}. A reação pode falhar.`
          : ""
      };
    }

    function injectHazard(type, amount) {
      if (!HAZARD_KEYS.includes(type)) return;
      state.hazardPulse[type] = clamp(state.hazardPulse[type] + Math.max(0, Number(amount) || 0), 0, 100);
      emit();
    }

    function performReaction(reactionId, stationId, equippedIds) {
      const availability = reactionAvailability(reactionId, stationId, equippedIds);
      if (!availability.ok) return availability;
      const { reaction, protection } = availability;
      const minimum = reaction.risk?.minimumProtection || 0;
      const underProtected = protection < minimum;
      const explosionRisk = reaction.risk?.explosion || 0;
      const failureChance = underProtected
        ? clamp(0.28 + (minimum - protection) * 0.72 + explosionRisk * 0.28, 0, 0.86)
        : explosionRisk * 0.08;

      reaction.need.forEach(([id, quantity]) => removeItem(id, quantity));
      if (reaction.fuel) removeItem(reaction.fuel[0], reaction.fuel[1]);
      const failed = Math.random() < failureChance;
      if (failed) {
        addItem("unknown_residue", 1);
        state.reactions.failed.push({
          id: reaction.id,
          station: stationId,
          occurredAt: Date.now(),
          reason: underProtected ? "proteção insuficiente" : "instabilidade"
        });
        if (state.reactions.failed.length > 60) state.reactions.failed.shift();
        const riskType = HAZARD_KEYS.includes(reaction.risk?.type) ? reaction.risk.type : reaction.risk?.type === "fire" ? "smoke" : "air";
        injectHazard(riskType, reaction.risk?.amount || 32);
        damagePlayer(Math.ceil((reaction.risk?.amount || 20) / 7), `falha em ${reaction.name}`, reaction.risk?.type || "chemical");
        (equippedIds || []).forEach(id => {
          const definition = EQUIPMENT_DEFINITIONS[id];
          if (definition && (definition.protections?.[reaction.risk?.type] || definition.heatResistance)) {
            damageEquipment(id, Math.max(2, (reaction.risk?.amount || 20) * 0.08), reaction.name);
          }
        });
        notify({
          category: "critical",
          speaker: "LABORATÓRIO",
          text: `${reaction.name} falhou: ${underProtected ? "EPI insuficiente" : "condição instável"}. A área foi contaminada.`,
          critical: true
        });
        addObservation(`Falha em ${reaction.name}: ${underProtected ? "proteção insuficiente" : "instabilidade do processo"}.`, "reaction");
        emit(true);
        return { ok: false, failed: true, reaction: clone(reaction), message: "A reação falhou e produziu um resíduo desconhecido." };
      }

      reaction.out.forEach(([id, quantity]) => addItem(id, quantity));
      if (!state.reactions.completed.includes(reaction.id)) state.reactions.completed.push(reaction.id);
      registerDiscovery("reactions", reaction.id, {
        name: reaction.name,
        equation: reaction.equation,
        station: STATIONS[stationId]?.name || stationId,
        knownRisks: reaction.risk?.type || "baixo",
        researchProgress: 100
      });
      registerDiscovery("experiments", reaction.id, {
        name: `Experimento: ${reaction.name}`,
        source: STATIONS[stationId]?.name || stationId,
        equation: reaction.equation,
        testedProperties: {
          temperatura: `${reaction.temperature ?? "ambiente"} °C`,
          pressão: `${reaction.pressure ?? 1} atm`,
          duração: `${(reaction.duration / 1000).toFixed(1)} s`
        },
        knownRisks: reaction.risk?.type || "baixo",
        researchProgress: 100
      });
      registerDiscovery("missions", ["water_distillation_lab", "charcoal_filtration_lab"].includes(reaction.id) ? "water_purification" : "laboratory_experiment", {
        name: ["water_distillation_lab", "charcoal_filtration_lab"].includes(reaction.id) ? "Purificação de água" : "Experimento de laboratório",
        source: reaction.name,
        researchProgress: 100
      });
      reaction.out.forEach(([id]) => registerDiscovery("substances", id, {
        name: itemName(id),
        source: reaction.name,
        relatedReaction: reaction.id,
        researchProgress: 45
      }));
      grantResearchPoints(3, `experimento: ${reaction.name}`);
      addObservation(`${reaction.name} concluída em ${STATIONS[stationId]?.name || stationId}: ${reaction.equation}.`, "reaction");
      emit(true);
      return { ok: true, failed: false, reaction: clone(reaction), message: `${reaction.name} concluída com segurança.` };
    }

    function waterProfileFor(context) {
      const data = normalizeRecord(context, {});
      const biome = String(data.biome || "").toLowerCase();
      let id = "fresh";
      if (data.treated === "distilled") id = "distilled";
      else if (data.polluted || data.industrial) id = "industrial";
      else if (data.acidic || biome === "vulcânico") id = "acidic";
      else if (data.alkaline) id = "alkaline";
      else if (data.hot) id = "hot";
      else if (data.cold || ["tundra", "taiga"].includes(biome)) id = "cold";
      else if (data.salt || biome === "salinas") id = "salt";
      else if (data.contaminated || ["pântano", "selva tropical"].includes(biome)) id = "contaminated";
      const base = WATER_PROFILES[id];
      return {
        ...base,
        temperature: Number.isFinite(Number(data.temperature)) ? Number(data.temperature) : base.temperature,
        collectedAt: Date.now(),
        sourceBiome: biome || "desconhecido"
      };
    }

    function drinkLiquid(liquid) {
      const baseProfile = WATER_PROFILES[liquid?.id] || WATER_PROFILES.fresh;
      const profile = { ...baseProfile, ...normalizeRecord(liquid, {}), id: liquid?.id || baseProfile.id };
      let damage = 0;
      let status = "";
      if (profile.id === "salt") status = "A água salgada aumentou sua sede.";
      if (profile.id === "contaminated") {
        damage = 5;
        state.body.sickness = clamp(state.body.sickness + 18, 0, 100);
        injectHazard("biological", 24);
        status = "Risco de infecção por água contaminada.";
      }
      if (profile.id === "industrial") {
        damage = 10;
        state.body.sickness = clamp(state.body.sickness + 32, 0, 100);
        injectHazard("toxicity", 45);
        status = "Intoxicação por resíduos industriais.";
      }
      if (profile.id === "acidic" || profile.id === "alkaline") {
        damage = 7;
        injectHazard("corrosion", 28);
        status = "Irritação química causada pelo pH extremo.";
      }
      if (profile.id === "hot") {
        damage = 4;
        status = "A água estava quente demais para beber com segurança.";
      }
      if (damage) {
        const damageType = profile.id === "contaminated"
          ? "biological"
          : profile.id === "industrial"
            ? "toxicity"
            : ["acidic", "alkaline"].includes(profile.id)
              ? "corrosion"
              : profile.id === "hot"
                ? "fire"
                : "physical";
        damagePlayer(damage, profile.label, damageType);
      }
      registerDiscovery("water", profile.id, {
        name: profile.label,
        pH: profile.pH,
        purity: profile.purity,
        contamination: profile.contamination,
        knownRisks: status || "baixo",
        researchProgress: 35
      });
      state.statistics.waterTests += 1;
      emit();
      return {
        hydration: profile.hydration,
        damage,
        status,
        profile: clone(profile)
      };
    }

    function temperatureState(value) {
      if (value < 33.5) return { id: "freezing", label: "Congelando", severity: 3 };
      if (value < 35) return { id: "very-cold", label: "Muito frio", severity: 2 };
      if (value < 36.1) return { id: "cold", label: "Frio", severity: 1 };
      if (value <= 37.5) return { id: "comfortable", label: "Confortável", severity: 0 };
      if (value <= 38.4) return { id: "warm", label: "Quente", severity: 1 };
      if (value <= 39.6) return { id: "very-hot", label: "Muito quente", severity: 2 };
      return { id: "overheating", label: "Superaquecendo", severity: 3 };
    }

    function survivalDifficultyMultiplier() {
      return {
        relaxed: 0.62,
        normal: 1,
        hard: 1.38
      }[state.settings.survivalDifficulty] || 1;
    }

    function updateEnvironment(dt, environment, equippedIds) {
      const elapsed = clamp(dt, 0, 0.25);
      const env = normalizeRecord(environment, {});
      const gear = protectionSummary(equippedIds);
      const biome = String(env.biome || "planície").toLowerCase();
      const baseAmbient = BIOME_TEMPERATURES[biome] ?? 22;
      const dayFraction = clamp(env.day, 0, 1);
      const daytimeHeat = Math.sin((dayFraction - 0.25) * Math.PI * 2) * 5;
      const undergroundCooling = clamp(env.undergroundDepth, 0, 30) * 0.35;
      const waterTemperature = Number.isFinite(Number(env.waterTemperature))
        ? Number(env.waterTemperature)
        : baseAmbient - 5;
      const weatherCooling = env.weather === "snow" ? 9 : env.weather === "rain" ? 4 : 0;
      const windCooling = clamp(env.wind, 0, 1) * (1.2 + state.body.wetness * 2.2);
      let ambient = baseAmbient + daytimeHeat - undergroundCooling - weatherCooling - windCooling;
      if (env.inWater) ambient = waterTemperature;

      if (env.inWater) state.body.wetness = clamp(state.body.wetness + elapsed * 0.42, 0, 1);
      else if (env.weather === "rain" || env.weather === "snow") state.body.wetness = clamp(state.body.wetness + elapsed * 0.08, 0, 1);
      else state.body.wetness = clamp(state.body.wetness - elapsed * (env.nearFire ? 0.12 : 0.018), 0, 1);

      const environmentalDeviation = clamp((ambient - 22) * 0.135, -6, 6.5);
      const coldFactor = environmentalDeviation < 0 ? 1 - gear.coldResistance : 1;
      const heatFactor = environmentalDeviation > 0 ? 1 - gear.heatResistance : 1;
      let target = 37 + environmentalDeviation * coldFactor * heatFactor;
      target += clamp(env.activity, 0, 2) * 0.65;
      target += clamp(env.nearFire, 0, 1) * 2.2;
      target += clamp(env.nearLava, 0, 1) * 4.5;
      target += clamp(env.hotStation, 0, 1) * 1.4;
      target -= state.body.wetness * (2.3 - gear.insulation * 1.6);
      target -= gear.cooling * 2.4;
      target = 37 + (target - 37) * (1 - gear.insulation * 0.7 + gear.conductivity * 0.52);
      state.body.temperature += (target - state.body.temperature) * (1 - Math.exp(-elapsed / 34));
      state.body.temperature = clamp(state.body.temperature, 30, 43);

      const rawHazards = {
        ...Object.fromEntries(HAZARD_KEYS.map(key => [key, clamp(env.hazards?.[key], 0, 100)]))
      };
      for (const key of HAZARD_KEYS) {
        const pulse = state.hazardPulse[key];
        rawHazards[key] = clamp(rawHazards[key] + pulse, 0, 100);
        state.hazardPulse[key] = clamp(pulse - elapsed * 4.2, 0, 100);
        const effective = rawHazards[key] * (1 - (gear.protection[key] || 0));
        state.hazards[key] += (effective - state.hazards[key]) * (1 - Math.exp(-elapsed * 3.5));
        state.exposures[key] = Math.max(0, state.exposures[key] + elapsed * (effective / 35 - 0.08));
        if (effective >= 18 && !warnedHazards.has(key)) {
          warnedHazards.add(key);
          state.statistics.hazardsEntered += 1;
          notify({
            category: effective >= 60 ? "critical" : "system",
            speaker: "ALERTA CIENTÍFICO",
            text: `${HAZARD_LABELS[key]} detectada. ${Math.round((gear.protection[key] || 0) * 100)}% de proteção ativa.`,
            critical: effective >= 72
          });
          registerDiscovery("hazards", key, {
            name: HAZARD_LABELS[key],
            firstDetectedAt: Date.now(),
            testedProtection: Math.round((gear.protection[key] || 0) * 100),
            researchProgress: 30
          });
        } else if (effective < 8) warnedHazards.delete(key);
      }

      const filterExposure = rawHazards.toxicity + rawHazards.air + rawHazards.biological + rawHazards.smoke;
      if (filterExposure > 4) {
        for (const id of equippedIds || []) {
          const definition = EQUIPMENT_DEFINITIONS[id];
          if (!definition?.filterCapacity) continue;
          consumeFilter(id, elapsed * filterExposure * 0.012);
          damageEquipment(id, elapsed * filterExposure * 0.0018, "filtragem ambiental");
        }
      }
      if (rawHazards.corrosion > 8) {
        for (const id of equippedIds || []) {
          const definition = EQUIPMENT_DEFINITIONS[id];
          if (definition?.protections?.corrosion) damageEquipment(id, elapsed * rawHazards.corrosion * 0.005, "exposição corrosiva");
        }
      }
      if (rawHazards.radiation > 8) {
        state.body.radiationDose += elapsed * state.hazards.radiation * 0.014;
      } else {
        state.body.radiationDose = Math.max(0, state.body.radiationDose - elapsed * 0.006);
      }

      const thermal = temperatureState(state.body.temperature);
      const activeHazards = HAZARD_KEYS
        .filter(key => state.hazards[key] >= 8)
        .map(key => ({
          id: key,
          label: HAZARD_LABELS[key],
          icon: HAZARD_ICONS[key],
          value: Math.round(state.hazards[key]),
          protection: Math.round((gear.protection[key] || 0) * 100)
        }));
      const effects = [];
      if (thermal.id !== "comfortable") effects.push({ id: thermal.id, label: thermal.label, severity: thermal.severity });
      if (state.body.sickness >= 12) effects.push({ id: "sickness", label: "Mal-estar", severity: state.body.sickness >= 55 ? 3 : 1 });
      if (state.body.radiationDose >= 20) effects.push({ id: "radiation-dose", label: "Dose radiológica", severity: state.body.radiationDose >= 70 ? 3 : 2 });
      activeHazards.forEach(hazard => effects.push({ id: hazard.id, label: hazard.label, severity: hazard.value >= 65 ? 3 : hazard.value >= 32 ? 2 : 1 }));
      state.statusEffects = effects;

      const difficulty = survivalDifficultyMultiplier();
      let movement = gear.movement;
      let hungerRate = 1;
      let thirstRate = 1;
      let toolSpeed = 1;
      if (thermal.id === "freezing") {
        movement *= 0.66;
        hungerRate *= 1.75;
        toolSpeed *= 0.68;
      } else if (thermal.id === "very-cold") {
        movement *= 0.78;
        hungerRate *= 1.45;
        toolSpeed *= 0.8;
      } else if (thermal.id === "cold") {
        movement *= 0.91;
        hungerRate *= 1.18;
        toolSpeed *= 0.92;
      } else if (thermal.id === "overheating") {
        movement *= 0.7;
        thirstRate *= 2;
        toolSpeed *= 0.76;
      } else if (thermal.id === "very-hot") {
        movement *= 0.82;
        thirstRate *= 1.55;
        toolSpeed *= 0.86;
      } else if (thermal.id === "warm") thirstRate *= 1.18;
      if (state.body.sickness >= 30) movement *= 0.88;
      if (state.body.sickness >= 65) movement *= 0.78;
      if (activeHazards.some(hazard => hazard.value >= 55)) movement *= 0.9;

      damageClock -= elapsed;
      if (damageClock <= 0) {
        if (thermal.id === "freezing" || thermal.id === "overheating") {
          damageClock = 2.8 / difficulty;
          damagePlayer(4, thermal.id === "freezing" ? "hipotermia" : "hipertermia", "thermal");
        } else {
          const severe = activeHazards.sort((a, b) => b.value - a.value)[0];
          if (severe?.value >= 72) {
            damageClock = 3.2 / difficulty;
            damagePlayer(Math.ceil(severe.value / 22), severe.label, severe.id);
          }
        }
      }

      state.body.sickness = Math.max(0, state.body.sickness - elapsed * 0.018);
      sampleAgingClock += elapsed;
      if (sampleAgingClock >= 45) {
        const agingSteps = Math.floor(sampleAgingClock / 45);
        sampleAgingClock %= 45;
        const protectedByCase = (equippedIds || []).includes("sample_case") && !equipmentCondition("sample_case")?.broken;
        for (const sample of state.samples) {
          if (sample.refrigerated || !["water", "animal", "fungi", "plant"].includes(sample.kind)) continue;
          const contaminationGain = agingSteps * (protectedByCase ? 0.12 : 0.35);
          sample.contamination = clamp((sample.contamination || 0) + contaminationGain, 0, 100);
          if (sample.properties) {
            sample.properties.contamination = sample.contamination;
            sample.properties.biologicalContamination = clamp((sample.properties.biologicalContamination || 0) + contaminationGain, 0, 100);
          }
        }
      }
      environmentClock += elapsed;
      lastSnapshot = {
        ambientTemperature: Number(ambient.toFixed(1)),
        bodyTemperature: Number(state.body.temperature.toFixed(1)),
        temperatureState: thermal,
        wetness: Math.round(state.body.wetness * 100),
        hazards: activeHazards,
        rawHazards,
        protections: gear,
        statusEffects: clone(effects),
        modifiers: {
          movement: clamp(movement, 0.48, 1.3),
          hungerRate: hungerRate * difficulty,
          thirstRate: thirstRate * difficulty,
          toolSpeed: clamp(toolSpeed, 0.55, 1.15),
          waterSpeed: gear.waterSpeed
        }
      };
      if (environmentClock >= 1) {
        environmentClock = 0;
        emit();
      } else onChange(api);
      return clone(lastSnapshot);
    }

    function getSettings() {
      return clone(state.settings);
    }

    function updateSettings(next) {
      const input = normalizeRecord(next, {});
      state.settings = { ...state.settings, ...input };
      if (!["relaxed", "normal", "hard"].includes(state.settings.survivalDifficulty)) state.settings.survivalDifficulty = "normal";
      if (!["low", "normal", "high", "off"].includes(state.settings.eventFrequency)) state.settings.eventFrequency = "normal";
      if (!["simple", "standard", "extended"].includes(state.settings.explanationLevel)) state.settings.explanationLevel = "standard";
      emit(true);
      return getSettings();
    }

    function getNotebook() {
      return clone(state.notebook);
    }

    function getSamples() {
      return clone(state.samples);
    }

    function getResearch() {
      return {
        points: state.research.points,
        earned: state.research.earned,
        unlocked: state.research.unlocked.slice(),
        nodes: RESEARCH_NODES.map(node => ({
          ...node,
          unlocked: state.research.unlocked.includes(node.id),
          available: node.requires.every(required => state.research.unlocked.includes(required)),
          affordable: state.research.points >= node.cost
        }))
      };
    }

    function getEquipmentConditions(ids) {
      const list = ids || Object.keys(state.equipment);
      return list.filter(id => EQUIPMENT_DEFINITIONS[id]).map(equipmentCondition);
    }

    function getSnapshot() {
      return lastSnapshot ? clone(lastSnapshot) : {
        ambientTemperature: 22,
        bodyTemperature: state.body.temperature,
        temperatureState: temperatureState(state.body.temperature),
        wetness: Math.round(state.body.wetness * 100),
        hazards: [],
        rawHazards: Object.fromEntries(HAZARD_KEYS.map(key => [key, 0])),
        protections: protectionSummary([]),
        statusEffects: clone(state.statusEffects),
        modifiers: { movement: 1, hungerRate: 1, thirstRate: 1, toolSpeed: 1, waterSpeed: 1 }
      };
    }

    function importState(input) {
      const migrated = migrateState(input);
      for (const key of Object.keys(state)) delete state[key];
      Object.assign(state, migrated);
      emit(true);
      return exportState();
    }

    const api = Object.freeze({
      version: SAVE_VERSION,
      persist: () => persist(true),
      exportState,
      importState,
      updateEnvironment,
      getSnapshot,
      getSettings,
      updateSettings,
      getNotebook,
      getSamples,
      getResearch,
      unlockResearch,
      isResearchUnlocked,
      registerDiscovery,
      addObservation,
      grantResearchPoints,
      collectSample,
      analyzeSample,
      releaseSample,
      setSampleRefrigerated,
      waterProfileFor,
      drinkLiquid,
      reactionAvailability,
      performReaction,
      injectHazard,
      ensureEquipment,
      equipmentCondition,
      getEquipmentConditions,
      protectionSummary,
      damageEquipment,
      consumeFilter,
      useOxygen,
      refillEquipment,
      repairEquipment,
      catalog: CATALOG,
      stations: STATIONS,
      reactions: REACTIONS,
      researchNodes: RESEARCH_NODES,
      equipmentDefinitions: EQUIPMENT_DEFINITIONS,
      waterProfiles: WATER_PROFILES,
      hazardLabels: HAZARD_LABELS,
      hazardIcons: HAZARD_ICONS,
      sampleContainers: SAMPLE_CONTAINERS
    });

    persist();
    return api;
  }

  global.QuimiCraftScience = Object.freeze({
    version: SAVE_VERSION,
    createScienceSystem,
    createCraftingRecipes,
    equipmentDefinitions: EQUIPMENT_DEFINITIONS,
    itemNames: ITEM_NAMES,
    itemColors: ITEM_COLORS,
    stations: STATIONS,
    reactions: REACTIONS,
    researchNodes: RESEARCH_NODES,
    waterProfiles: WATER_PROFILES,
    hazardLabels: HAZARD_LABELS,
    hazardIcons: HAZARD_ICONS,
    sampleContainers: SAMPLE_CONTAINERS,
    catalog: CATALOG,
    defaultSettings: DEFAULT_SETTINGS
  });
})(window);
