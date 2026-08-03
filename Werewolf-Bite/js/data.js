(() => {
  const U = window.WB_UTIL;
  const D = {};

  D.factions = {
    moonborn: {
      name: "Moonborn",
      resource: "Rage",
      color: "#4f83d1",
      color2: "#a8c6ef",
      emblem: "◒",
      lore: "Born beneath the first broken moon, the Moonborn survive through instinct, territory and the fierce memory carried in bone. Rage is not madness—it is an ancestral chorus.",
      form: "Primal Form",
      theme: "moon",
      passive: "Critical hits and received damage generate additional Rage.",
      specs: {
        ravager: {
          name: "Ravager",
          icon: "✦",
          description:
            "A brutal striker built around physical damage, critical attacks and escalating Rage.",
          bonuses: { strength: 3, luck: 2 },
        },
        warden: {
          name: "Warden",
          icon: "⬟",
          description:
            "A resilient guardian specializing in armor, regeneration, blocks and savage counterattacks.",
          bonuses: { defense: 3, endurance: 2 },
        },
        stalker: {
          name: "Stalker",
          icon: "◈",
          description:
            "A relentless tracker with superior speed, evasion, accuracy and ambush pressure.",
          bonuses: { dexterity: 3, perception: 2 },
        },
      },
    },
    bloodbound: {
      name: "Bloodbound",
      resource: "Blood",
      color: "#ba2339",
      color2: "#ff7c8e",
      emblem: "♦",
      lore: "The Bloodbound preserve empires through influence, ritual and hunger refined into art. Every drop of blood contains memory, and every memory may be commanded.",
      form: "Crimson Ascendance",
      theme: "blood",
      passive:
        "Successful attacks, bleeding and defeated living enemies generate Blood.",
      specs: {
        reaper: {
          name: "Reaper",
          icon: "†",
          description:
            "A predatory duelist using direct damage, bleeding and ruthless life drain.",
          bonuses: { strength: 2, endurance: 1, luck: 2 },
        },
        noble: {
          name: "Noble",
          icon: "♛",
          description:
            "A controller who excels at influence, gold, resource denial and defensive manipulation.",
          bonuses: { presence: 3, defense: 2 },
        },
        shadow: {
          name: "Shadow",
          icon: "◐",
          description:
            "An evasive assassin built around poison, concealment, initiative and precision.",
          bonuses: { dexterity: 3, perception: 2 },
        },
      },
    },
  };

  D.appearance = {
    hair: ["Feral Crown", "War Braids", "Razor Crop", "Cathedral Crest", "Velvet Lengths"],
    skin: ["Ash", "Umber", "Pale", "Onyx", "Russet", "Silver"],
    eyes: ["Amber", "Crimson", "Ice", "Violet", "Emerald", "White"],
    outfits: ["Wanderer", "Warplate", "Hunter", "Ritualist", "Noble"],
    backgrounds: ["Exile", "Survivor", "Acolyte", "Outrider", "Heir"],
  };

  D.regions = [
    {
      id: "blackthorn",
      name: "Vila Blackthorn",
      level: 1,
      difficulty: 1,
      colors: ["#35435e", "#11141c", "#12161c"],
      icon: "⌂",
      boss: "O Inquisidor de Prata",
      description:
        "Uma vila encharcada pela chuva, onde sinos tocam sem mãos e cada porta trancada esconde uma testemunha.",
      secret: "Cifra do Guardião dos Sinos",
    },
    {
      id: "ashen",
      name: "Floresta Cinzenta",
      level: 4,
      difficulty: 2,
      colors: ["#30413d", "#0b1312", "#101713"],
      icon: "♠",
      boss: "Mãe Oca",
      description:
        "Árvores carbonizadas sussurram nomes roubados de viajantes. Raízes pálidas rastejam sob as cinzas.",
      secret: "O santuário de chifres",
    },
    {
      id: "railway",
      name: "A Ferrovia Abandonada",
      level: 7,
      difficulty: 2,
      colors: ["#4b4540", "#131313", "#161310"],
      icon: "═",
      boss: "O Coletor de Ossos",
      description:
        "Uma ferrovia morta transporta cargas fantasmagóricas por túneis que nunca foram escavados.",
      secret: "Carruagem treze",
    },
    {
      id: "bloodmarket",
      name: "Distrito do Mercado de Sangue",
      level: 10,
      difficulty: 3,
      colors: ["#5d2735", "#160c11", "#1c0e13"],
      icon: "♜",
      boss: "O Corretor Velado",
      description:
        "Máscaras, favores e memórias engarrafadas são vendidos sob lanternas vermelhas.",
      secret: "O leilão silencioso",
    },
    {
      id: "hollowgrave",
      name: "Cemitério Hollowgrave",
      level: 13,
      difficulty: 3,
      colors: ["#3a3f56", "#101118", "#17151d"],
      icon: "†",
      boss: "Santo Vesper",
      description:
        "Aqui, as covas se abrem para dentro. Os mortos temem algo abaixo deles.",
      secret: "O verdadeiro epitáfio de Vesper",
    },
    {
      id: "silvermine",
      name: "Passagem da Mina de Prata",
      level: 17,
      difficulty: 4,
      colors: ["#607080", "#11171c", "#171b1e"],
      icon: "▲",
      boss: "A Viúva Argêntea",
      description:
        "Uma passagem congelada aberta entre veios de prata e guardada por caçadores presos a juramentos.",
      secret: "O veio de pedra da lua",
    },
    {
      id: "harbor",
      name: "Porto Carmesim",
      level: 21,
      difficulty: 4,
      colors: ["#653040", "#111119", "#171016"],
      icon: "≋",
      boss: "O Açougueiro do Porto Vermelho",
      description:
        "Navios negros chegam sem tripulação, carregados de caixões e correntes manchadas de sal.",
      secret: "O livro-caixa afogado",
    },
    {
      id: "mountains",
      name: "Montanhas da Queda Lunar",
      level: 25,
      difficulty: 5,
      colors: ["#405271", "#0d111a", "#141821"],
      icon: "△",
      boss: "O Devorador da Lua",
      description:
        "A lua parece fraturada sobre picos onde feras ancestrais ainda sonham.",
      secret: "A primeira presa do inverno",
    },
    {
      id: "capital",
      name: "A Capital Amaldiçoada",
      level: 30,
      difficulty: 5,
      colors: ["#534259", "#100d14", "#19131b"],
      icon: "♛",
      boss: "A Rainha sem Rosto",
      description:
        "Uma capital abandonada ensaia a vida da corte para uma plateia de fantasmas.",
      secret: "O trono vazio",
    },
    {
      id: "rift",
      name: "A Fenda Ancestral",
      level: 36,
      difficulty: 6,
      colors: ["#563460", "#0b0710", "#160d1a"],
      icon: "◉",
      boss: "O Coração do Eclipse",
      description:
        "A realidade se dobra ao redor da ferida onde a terceira força espera além da forma e da fome.",
      secret: "O nome anterior à noite",
    },
  ];

  const enemyRoots = [
    ["Aldeão Apavorado", "human", "balanced", "♙"],
    ["Vigia da Lanterna", "human", "defensive", "♟"],
    ["Armadilheiro de Prata", "hunter", "bleed", "⌁"],
    ["Exorcista de Blackthorn", "hunter", "shield", "✝"],
    ["Cão de Cinzas", "beast", "fast", "♞"],
    ["Cervo Desperto pelas Raízes", "beast", "berserk", "♘"],
    ["Saqueador Ferroviário", "mercenary", "balanced", "⚔"],
    ["Atirador de Brasa", "mercenary", "fast", "⌖"],
    ["Iniciado Velado", "cultist", "poison", "◬"],
    ["Cantor Ritual", "cultist", "healer", "♩"],
    ["Carcaça Sepulcral", "undead", "defensive", "☠"],
    ["Revenante Lamentador", "undead", "weaken", "☽"],
    ["Diabrete da Fornalha", "demon", "burn", "♨"],
    ["Demônio das Sarjetas", "demon", "fast", "Ψ"],
    ["Brutamontes Costurado", "mutant", "berserk", "♜"],
    ["Rastejante de Olhos de Vidro", "mutant", "poison", "⌬"],
    ["Alfa Marcado pela Lua", "rival werewolf", "berserk", "◒"],
    ["Quebrador de Totens", "rival werewolf", "counter", "♢"],
    ["Duelista Carmesim", "rival vampire", "bleed", "♦"],
    ["Magistrado Noturno", "rival vampire", "control", "♛"],
    ["Bastião da Mina de Prata", "hunter", "shield", "⬟"],
    ["Acólito da Viúva", "cultist", "summoner", "✣"],
    ["Afogado do Porto", "undead", "weaken", "≋"],
    ["Açougueiro de Sal", "mercenary", "bleed", "⚒"],
    ["Mandíbula de Geada", "beast", "berserk", "❄"],
    ["Harpia Pálida", "beast", "fast", "⌁"],
    ["Cavaleiro sem Corte", "undead", "defensive", "♞"],
    ["Assassino do Espelho", "rival vampire", "dodge", "◐"],
    ["Cria do Eclipse", "ancient", "summoner", "◉"],
    ["Oráculo Faminto", "ancient", "control", "✧"],
    ["Serafim sem Sangue", "ancient", "healer", "✦"],
    ["Devorador da Fenda", "ancient", "berserk", "⊙"],
    ["Alquimista das Correntes", "cultist", "poison", "⚗"],
    ["Vidente Cego pela Lua", "human", "control", "☾"],
    ["Beemote de Chifres Sepulcrais", "mutant", "defensive", "♉"],
  ];
  const enemyTypeLabels = {
    human: "humano",
    hunter: "caçador",
    beast: "fera",
    mercenary: "mercenário",
    cultist: "cultista",
    undead: "morto-vivo",
    demon: "demônio",
    mutant: "mutante",
    "rival werewolf": "lobisomem rival",
    "rival vampire": "vampiro rival",
    ancient: "ser ancestral",
  };
  const enemyBehaviorLabels = {
    balanced: "equilibrado",
    defensive: "defensivo",
    bleed: "sangrador",
    shield: "protegido",
    fast: "veloz",
    berserk: "furioso",
    poison: "venenoso",
    healer: "curandeiro",
    weaken: "debilitador",
    burn: "incendiário",
    counter: "contra-atacante",
    control: "controlador",
    summoner: "invocador",
    dodge: "evasivo",
  };
  D.enemies = enemyRoots.map((e, i) => ({
    id: `enemy_${i}`,
    name: e[0],
    type: e[1],
    behavior: e[2],
    icon: e[3],
    region: Math.min(9, Math.floor(i / 4)),
    baseLevel: 1 + Math.floor(i / 2),
    description: `${e[0]} é um ${enemyTypeLabels[e[1]] || e[1]} de estilo ${enemyBehaviorLabels[e[2]] || e[2]}, moldado pelo Eclipse Oco.`,
    weaknesses: [
      U.pick(["Bleeding", "Burning", "Poisoned", "Marked"]),
      U.pick(["Heavy attacks", "Control", "Critical hits"]),
    ],
    resistances: [U.pick(["Bleeding", "Poisoned", "Frightened", "Burning"])],
    abilities: [
      U.pick(["Rending Blow", "Guarded Step", "Hex Pulse", "Venom Cut"]),
      U.pick(["Night Rush", "Iron Prayer", "Soul Cry"]),
    ],
    drops: [],
  }));

  const bossData = [
    ["O Inquisidor de Prata", "hunter", "✝", "Judgment of Argent"],
    ["Mãe Oca", "ancient", "♠", "Root of Grief"],
    ["O Coletor de Ossos", "undead", "☠", "Thirteen Chains"],
    ["O Corretor Velado", "cultist", "♛", "Price of Memory"],
    ["Santo Vesper", "undead", "†", "False Benediction"],
    ["A Viúva Argêntea", "hunter", "✣", "Silver Web"],
    ["O Açougueiro do Porto Vermelho", "mutant", "⚒", "Tide of Limbs"],
    ["O Devorador da Lua", "ancient", "◉", "Devour the Sky"],
    ["A Rainha sem Rosto", "ancient", "♕", "Borrowed Identity"],
    ["O Coração do Eclipse", "ancient", "⊙", "Hollow Convergence"],
  ];
  D.bosses = bossData.map((b, i) => ({
    id: `boss_${i}`,
    name: b[0],
    type: b[1],
    icon: b[2],
    signature: b[3],
    region: i,
    phases: 3,
    description: `Regional sovereign of ${D.regions[i].name}. Its presence bends the rules of night.`,
    exclusive: `${b[0].replace(/^The /, "")} Relic`,
  }));

  const rarityMult = {
    common: 1,
    uncommon: 1.12,
    rare: 1.3,
    epic: 1.55,
    legendary: 1.9,
    mythic: 2.35,
    cursed: 2.1,
  };
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
  const icons = {
    weapon: "⚔",
    secondary: "†",
    head: "♜",
    chest: "⬟",
    hands: "✦",
    legs: "Ⅱ",
    feet: "⌁",
    amulet: "◇",
    ring1: "○",
    ring2: "◉",
    relic: "◆",
  };
  const prefixes = [
    "das Cinzas",
    "de Blackthorn",
    "de Vidro de Sangue",
    "dos Ossos",
    "de Brasa",
    "Carmesim",
    "do Pavor",
    "do Eclipse",
    "Feral",
    "Sepulcral",
    "do Vazio",
    "de Ferro",
    "ao Luar",
    "da Noite",
    "de Obsidiana",
    "da Névoa Pálida",
    "da Fenda",
    "com Runas",
    "das Sombras",
    "de Prata",
  ];
  const nouns = {
    weapon: ["Garra", "Presa", "Lâmina", "Cutelo", "Sabre"],
    secondary: ["Gancho", "Adaga", "Talismã", "Pistola", "Foco"],
    head: ["Coroa", "Capuz", "Elmo", "Máscara", "Viseira"],
    chest: ["Arreio", "Casaco", "Carapaça", "Vestimenta", "Couraça"],
    hands: ["Manoplas", "Manoplas de Guerra", "Faixas", "Garras", "Luvas"],
    legs: ["Grevas", "Calças", "Perneiras", "Calças de Malha", "Ataduras"],
    feet: ["Botas", "Solados", "Escarpes", "Passos", "Patas"],
    amulet: ["Medalhão", "Amuleto", "Corrente", "Torques", "Rosário"],
    ring1: ["Anel", "Sinete", "Argola", "Selo", "Espiral"],
    ring2: ["Anel", "Sinete", "Argola", "Selo", "Espiral"],
    relic: ["Ídolo", "Cálice", "Totem", "Coração", "Fragmento"],
  };
  const suffixes = [
    "da Chuva Vermelha",
    "dos Sinos Silenciosos",
    "dos Dentes do Inverno",
    "da Última Corte",
    "dos Santos Famintos",
    "dos Juramentos Partidos",
    "do Covil Profundo",
    "da Noite de Veludo",
  ];
  D.itemTemplates = [];
  const itemTotal = 198;
  const highTierSuffixes = [
    "da Lua Quebrada",
    "do Trono Faminto",
    "da Viúva de Prata",
    "do Porto Carmesim",
    "da Capital Sem Rosto",
    "da Fenda Ancestral",
    "do Eclipse Oco",
  ];
  for (let i = 0; i < itemTotal; i++) {
    const slot = slots[i % slots.length],
      faction =
        i % 5 === 0 ? (i % 10 === 0 ? "moonborn" : "bloodbound") : "any",
      tier = 1 + Math.floor(i / 22);
    const rarity = [
      "common",
      "uncommon",
      "rare",
      "epic",
      "legendary",
      "mythic",
      "cursed",
    ][Math.min(6, Math.floor(i / 28))];
    const lateGame = tier >= 6;
    D.itemTemplates.push({
      templateId: `item_${i}`,
      name: `${nouns[slot][i % nouns[slot].length]} ${prefixes[i % prefixes.length]}${i % 7 === 0 ? " " + suffixes[i % suffixes.length] : lateGame && i % 4 === 0 ? " " + highTierSuffixes[i % highTierSuffixes.length] : ""}`,
      slot,
      icon: icons[slot],
      rarity,
      faction,
      tier,
      level: Math.min(40, Math.max(1, tier * 4 - 3 + (i % 3 === 0 ? 1 : 0))),
      flavor: `Forjado com ${U.pick(["pó de pedra da lua", "cristal de sangue", "ferro sepulcral", "seda sombria", "osso prateado", "essência ancestral", "cinza demoníaca"])} durante uma noite sem amanhecer${lateGame ? ", para caçadas de fim de jogo" : ""}.`,
      basePower: Math.round((12 + i * 1.85) * rarityMult[rarity] * (lateGame ? 1.08 : 1)),
    });
  }

  const abilityNames = {
    moonborn: [
      "Rending Swipe",
      "Howl of Claim",
      "Bonebreaker",
      "Predator’s Step",
      "Moonhide",
      "Savage Counter",
      "Blood Scent",
      "Pack Echo",
      "Feral Rush",
      "Crushing Pounce",
      "Totem Ward",
      "Night Tracker",
      "Lunar Mend",
      "Territory Mark",
      "Razor Moon",
      "Alpha’s Command",
      "Primal Form",
      "Worldfang",
    ],
    bloodbound: [
      "Sanguine Cut",
      "Velvet Command",
      "Crimson Sip",
      "Shadow Passage",
      "Blood Aegis",
      "Courtly Ruin",
      "Vein Mark",
      "Night Poison",
      "Hypnotic Gaze",
      "Grave Elegance",
      "Scarlet Reversal",
      "Mistwalk",
      "Ritual Feast",
      "Noble Decree",
      "Heartseeker",
      "Blood Moon Rite",
      "Crimson Ascendance",
      "Throne of Thirst",
    ],
  };
  D.abilities = [];
  Object.entries(abilityNames).forEach(([faction, names]) =>
    names.forEach((name, i) => {
      const types = ["damage", "damage", "defense", "status", "heal", "damage"];
      const type = types[i % types.length];
      D.abilities.push({
        id: `${faction}_ability_${i}`,
        faction,
        name,
        icon: ["⚔", "◒", "◆", "◐", "✦", "†"][i % 6],
        level: Math.min(40, 1 + i * 2),
        spec:
          i % 4 === 0
            ? Object.keys(D.factions[faction].specs)[(i / 4) % 3 | 0]
            : null,
        type,
        cost: i === 16 ? 100 : Math.min(55, 12 + i * 2),
        cooldown: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
        power: 1.05 + i * 0.055,
        duration: 2 + (i % 3),
        status: [
          "bleeding",
          "marked",
          "shielded",
          "weakened",
          "regenerating",
          "poisoned",
        ][i % 6],
        description: `${type === "damage" ? "Strike with supernatural force" : type === "defense" ? "Raise a supernatural defense" : type === "heal" ? "Restore stolen vitality" : "Impose a tactical condition"} using ${D.factions[faction].resource}.`,
        sound: i === 16 ? "transform" : "ability",
      });
    }),
  );

  const missionVerbs = [
    "Defeat",
    "Hunt",
    "Collect",
    "Win",
    "Apply",
    "Upgrade",
    "Discover",
    "Spend",
    "Craft",
    "Dismantle",
    "Explore",
    "Survive",
  ];
  const missionTargets = [
    "hunters",
    "beasts",
    "rival combatants",
    "rare items",
    "Bleeding",
    "a hideout structure",
    "a regional secret",
    "faction resource",
    "potions",
    "equipment",
    "dangerous hunts",
    "boss phases",
  ];
  const categories = [
    "tutorial",
    "story",
    "side",
    "daily",
    "weekly",
    "faction",
    "clan",
  ];
  D.missions = [];
  for (let i = 0; i < 66; i++) {
    const category = categories[i % categories.length],
      target = missionTargets[i % missionTargets.length],
      goal = 1 + (i % 5);
    D.missions.push({
      id: `mission_${i}`,
      category,
      title: `${missionVerbs[i % missionVerbs.length]} ${target}`,
      description: `Advance the war by completing this ${category} objective.`,
      metric: [
        "kills",
        "hunts",
        "arenaWins",
        "rareLoot",
        "bleeds",
        "hideoutUpgrades",
        "secrets",
        "resourceSpent",
        "crafts",
        "dismantles",
        "regions",
        "bosses",
      ][i % 12],
      goal,
      rewards: {
        xp: 35 + i * 5,
        gold: 70 + i * 8,
        shards: i % 9 === 0 ? 1 : 0,
      },
      minLevel: Math.min(35, Math.floor(i / 3) + 1),
    });
  }
  D.missions[0] = {
    id: "mission_0",
    category: "tutorial",
    title: "First Hunger",
    description: "Complete your first hunt.",
    metric: "hunts",
    goal: 1,
    rewards: { xp: 90, gold: 180, shards: 1 },
    minLevel: 1,
  };
  D.missions[1] = {
    id: "mission_1",
    category: "tutorial",
    title: "Steel and Instinct",
    description: "Equip an item.",
    metric: "equips",
    goal: 1,
    rewards: { xp: 60, gold: 140, shards: 0 },
    minLevel: 1,
  };
  D.missions[2] = {
    id: "mission_2",
    category: "tutorial",
    title: "Shape the Beast",
    description: "Upgrade any attribute.",
    metric: "attributeUpgrades",
    goal: 1,
    rewards: { xp: 70, gold: 120, shards: 0 },
    minLevel: 1,
  };

  const eventSubjects = [
    "Caravana de Prata",
    "Metamorfo Ferido",
    "Emboscada de Caçadores",
    "Adega Sussurrante",
    "Santuário Amaldiçoado",
    "Informante Apavorado",
    "Alquimista Viajante",
    "Lua Vermelha",
    "Guardião dos Sinos Cego",
    "Sombra Viva",
    "Totem Partido",
    "Carruagem Negra",
    "Coro Faminto",
    "Criança ao Luar",
    "Duelista Mascarado",
    "Pomar Sepulcral",
    "Círculo de Sal",
  ];
  const eventIcons = [
    "⚔",
    "♞",
    "⌖",
    "⌂",
    "†",
    "♙",
    "⚗",
    "◉",
    "♩",
    "◐",
    "◆",
    "♜",
    "♫",
    "☾",
    "♛",
    "♣",
    "○",
  ];
  D.events = [];
  for (let i = 0; i < 52; i++) {
    const subject = eventSubjects[i % eventSubjects.length];
    D.events.push({
      id: `event_${i}`,
      title: `${subject}: ${["Um Preço", "Um Juramento", "Um Aviso", "Uma Fome"][i % 4]}`,
      icon: eventIcons[i % eventIcons.length],
      description: `Na escuridão de ${D.regions[i % 10].name}, ${subject.toLowerCase()} interrompe sua caçada. A escolha pode ecoar pelas noites futuras.`,
      choices: [
        {
          text: "Agir com força",
          hint: "Arrisque vida por uma recompensa maior",
          effects: {
            health: -U.rand(2, 10),
            gold: 60 + i * 2,
            xp: 30 + i,
            alignment: -1,
            reputation: 1,
          },
          flag: `force_${i}`,
        },
        {
          text: "Observar e negociar",
          hint: "Uma resposta calculada e lucrativa",
          effects: { gold: 25 + i, xp: 18 + i, reputation: 2 },
          flag: `bargain_${i}`,
        },
        {
          text: "Oferecer ajuda",
          hint: "Ganhe reputação e um favor futuro",
          effects: {
            gold: -Math.min(90, 15 + i),
            xp: 25 + i,
            reputation: 3,
            alignment: 2,
          },
          flag: `aid_${i}`,
        },
        ...(i % 3 === 0
          ? [
              {
                text: "Invocar sua linhagem",
                hint: "Gaste recurso por um resultado raro",
                effects: {
                  resource: -20,
                  xp: 55 + i,
                  shards: i % 9 === 0 ? 1 : 0,
                  reputation: 1,
                },
                flag: `faction_${i}`,
              },
            ]
          : []),
      ],
    });
  }

  const achievementCats = [
    "combat",
    "exploration",
    "collection",
    "progression",
    "arena",
    "story",
    "clan",
    "secrets",
    "faction",
  ];
  D.achievements = [];
  for (let i = 0; i < 54; i++) {
    const metric = [
      "kills",
      "hunts",
      "items",
      "level",
      "arenaWins",
      "storyChapters",
      "clanDonations",
      "secrets",
      "resourceSpent",
    ][i % 9];
    const thresholds = {
      kills: [1, 10, 50, 150, 300, 600],
      hunts: [1, 10, 30, 80, 180, 350],
      items: [5, 20, 50, 100, 180, 300],
      level: [2, 5, 10, 20, 30, 40],
      arenaWins: [1, 5, 15, 40, 90, 180],
      storyChapters: [1, 2, 3, 4, 5, 6],
      clanDonations: [1, 5, 15, 35, 70, 120],
      secrets: [1, 2, 4, 6, 8, 10],
      resourceSpent: [50, 250, 800, 2000, 5000, 10000],
    };
    const tier = Math.floor(i / 9),
      goal = thresholds[metric][tier];
    D.achievements.push({
      id: `achievement_${i}`,
      category: achievementCats[i % 9],
      title: `${["Primeiro", "Ferro", "Prata", "Carmesim", "Eclipse", "Imortal"][tier]} — ${{
        kills: "Abates",
        hunts: "Caçadas",
        items: "Itens",
        level: "Níveis",
        arenaWins: "Vitórias na Arena",
        storyChapters: "Capítulos da história",
        clanDonations: "Doações ao clã",
        secrets: "Segredos",
        resourceSpent: "Recursos gastos",
      }[metric]}`,
      description: `Alcance ${goal} em ${{
        kills: "abates",
        hunts: "caçadas",
        items: "itens",
        level: "níveis",
        arenaWins: "vitórias na Arena",
        storyChapters: "capítulos da história",
        clanDonations: "doações ao clã",
        secrets: "segredos",
        resourceSpent: "recursos gastos",
      }[metric]}.`,
      metric,
      goal,
      icon: ["⚔", "◒", "◆", "▲", "♛", "✦", "⌂", "◉", "♦"][i % 9],
      rewards: {
        gold: 100 + tier * 180,
        shards: tier > 1 ? 1 + tier : 0,
        xp: 50 + tier * 75,
      },
    });
  }

  const sharedStructures = [
    [
      "Training Pit",
      "Reduces attribute training costs.",
      "⚔",
      "trainingDiscount",
    ],
    ["Trophy Hall", "Improves gold from victories.", "♛", "goldBonus"],
    ["Hidden Stores", "Increases inventory capacity.", "▦", "storage"],
    ["Night Gate", "Improves Arena rewards.", "♜", "arenaBonus"],
    ["Apothecary", "Improves potion crafting.", "⚗", "craftBonus"],
    ["Watcher Post", "Increases accuracy while hunting.", "⌖", "accuracyBonus"],
    ["Relic Vault", "Improves rare loot chance.", "◆", "lootBonus"],
    ["War Table", "Adds mission capacity.", "◇", "missionSlots"],
    ["Deep Quarters", "Adds passive health regeneration.", "♥", "healthRegen"],
    [
      "Eclipse Shrine",
      "Improves faction resource generation.",
      "◉",
      "resourceBonus",
    ],
  ];
  D.hideout = {
    moonborn: sharedStructures.map((s, i) => ({
      id: `moon_structure_${i}`,
      name: i === 0 ? "Totem Circle" : i === 4 ? "Herbal Shelter" : s[0],
      description: s[1],
      icon: s[2],
      bonus: s[3],
    })),
    bloodbound: sharedStructures.map((s, i) => ({
      id: `blood_structure_${i}`,
      name: i === 0 ? "Ritual Chamber" : i === 4 ? "Blood Cellar" : s[0],
      description: s[1],
      icon: s[2],
      bonus: s[3],
    })),
  };

  D.materials = [
    "Iron",
    "Silver",
    "Bone",
    "Leather",
    "Blood Crystal",
    "Moonstone",
    "Grave Dust",
    "Demon Ash",
    "Shadow Silk",
    "Ancient Essence",
  ];
  D.divisions = [
    ["Iron", 0],
    ["Bronze", 800],
    ["Silver", 1100],
    ["Gold", 1450],
    ["Obsidian", 1850],
    ["Crimson", 2350],
    ["Eclipse", 3000],
  ];
  D.storyChapters = [
    {
      id: 1,
      title: "Bells Beneath Blackthorn",
      level: 1,
      description:
        "Investigate the bells ringing under the village and confront the Silver Inquisitor.",
    },
    {
      id: 2,
      title: "Roots That Remember",
      level: 6,
      description:
        "Follow the ash-root network and learn why Mother Hollow knows your name.",
    },
    {
      id: 3,
      title: "Carriage Thirteen",
      level: 12,
      description:
        "Board the phantom train carrying bodies toward the Bloodmarket.",
    },
    {
      id: 4,
      title: "The Court of Empty Masks",
      level: 19,
      description:
        "Infiltrate a market auction where memories of the first eclipse are sold.",
    },
    {
      id: 5,
      title: "A Crown Without a Face",
      level: 28,
      description:
        "Expose the force steering both factions toward the Cursed Capital.",
    },
    {
      id: 6,
      title: "The Hollow Eclipse",
      level: 36,
      description:
        "Enter the Ancient Rift and choose what the next age of night will become.",
    },
  ];

  D.names = {
    first: [
      "Aldric",
      "Veyra",
      "Corvin",
      "Mara",
      "Silas",
      "Nyx",
      "Orsen",
      "Elara",
      "Draven",
      "Ilyra",
      "Garran",
      "Vesper",
      "Rook",
      "Selene",
      "Kade",
      "Mirelle",
      "Thorn",
      "Lucan",
    ],
    last: [
      "Blackvein",
      "Moonscar",
      "Voss",
      "Hollow",
      "Graves",
      "Redwake",
      "Ashcroft",
      "Vale",
      "Nightward",
      "Silverhand",
      "Mourn",
      "Dusk",
      "Crowe",
      "Frost",
      "Wolfsbane",
    ],
    clans: [
      "The Velvet Fang",
      "Ashen Howl",
      "Court of Thorns",
      "Silver Ruin",
      "Nocturne Pact",
      "Grave Lanterns",
      "Eclipse Ward",
      "Red Parliament",
    ],
  };
  D.chatLines = [
    "The moon phase changed. Hunts in the forest feel different tonight.",
    "I found silver marks beneath the railway. Someone is mapping our routes.",
    "The quartermaster rotated stock. There is a relic worth seeing.",
    "Do not trust the bellkeeper. He remembers conversations that never happened.",
    "Arena scouts report a new rival clan near the harbor.",
    "I left materials in the fortress vault. Use them well.",
    "The Hollow Eclipse pulsed again. Even the dead looked upward.",
  ];

  D.createItem = function (template, level = 1, forcedRarity = null) {
    const t =
      typeof template === "string"
        ? D.itemTemplates.find((x) => x.templateId === template)
        : template;
    const rarity =
      forcedRarity || t.rarity || U.weighted(WB_CONFIG.loot.rarityWeights);
    const rMult = rarityMult[rarity] || 1;
    const item = {
      id: U.uid("loot"),
      templateId: t.templateId,
      name: t.name,
      slot: t.slot,
      icon: t.icon,
      rarity,
      faction: t.faction,
      tier: t.tier,
      level: Math.max(t.level, level),
      upgrade: 0,
      locked: false,
      favorite: false,
      flavor: t.flavor,
      stats: {},
    };
    const budget = Math.floor((t.basePower + level * 3.1) * rMult);
    if (["weapon", "secondary"].includes(t.slot)) {
      item.stats.minDamage = Math.floor(budget * 0.48);
      item.stats.maxDamage = Math.floor(budget * 0.78);
      item.stats.strength = Math.max(1, Math.floor(budget * 0.05));
    } else {
      item.stats.armor = Math.floor(budget * 0.72);
      item.stats.endurance = Math.max(1, Math.floor(budget * 0.045));
    }
    const secondary = [
      "defense",
      "dexterity",
      "perception",
      "presence",
      "luck",
    ];
    item.stats[secondary[(level + t.templateId.length) % secondary.length]] =
      Math.max(1, Math.floor(budget * 0.04));
    item.value = Math.floor(20 + budget * 2.2);
    return item;
  };

  D.generateOpponent = function (player) {
    const level = U.clamp(player.level + U.rand(-2, 2), 1, 40),
      faction = player.faction === "moonborn" ? "bloodbound" : "moonborn";
    const spec = U.pick(Object.keys(D.factions[faction].specs));
    const rating = Math.max(
      250,
      (player.arena?.rating || player.rating || 650) + U.rand(-160, 210),
    );
    return {
      id: U.uid("rival"),
      name: `${U.pick(D.names.first)} ${U.pick(D.names.last)}`,
      faction,
      spec,
      level,
      rating,
      clan: U.pick(D.names.clans),
      record: `${U.rand(4, 92)}–${U.rand(1, 45)}`,
      power: Math.floor(level * 45 + rating * 0.35 + U.rand(-40, 80)),
      appearance: {
        hair: U.pick(D.appearance.hair),
        skin: U.pick(D.appearance.skin),
        eyes: U.pick(D.appearance.eyes),
        outfit: U.pick(D.appearance.outfits),
      },
    };
  };

  window.WB_DATA = D;
})();
