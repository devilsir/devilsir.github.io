"use strict";

globalThis.QuimiCraftCommands = (() => {
  const MAX_VISIBLE = 48;

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function slugify(value) {
    return normalize(value)
      .replace(/[^a-z0-9:]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tokenizeInput(raw, caret = raw.length) {
    const before = raw.slice(0, caret);
    const tokens = [];
    let i = 0;
    while (i < before.length) {
      while (i < before.length && /\s/.test(before[i])) i++;
      if (i >= before.length) break;
      const start = i;
      let text = "";
      let quoted = false;
      if (before[i] === '"') {
        quoted = true;
        i++;
        while (i < before.length && before[i] !== '"') text += before[i++];
        if (i < before.length && before[i] === '"') i++;
      } else {
        while (i < before.length && !/\s/.test(before[i])) text += before[i++];
      }
      tokens.push({ text, start, end: i, quoted });
    }
    const endsWithSpace = /\s$/.test(before);
    return { tokens, endsWithSpace, before, after: raw.slice(caret) };
  }

  function splitArgs(raw) {
    const out = [];
    let i = 0;
    while (i < raw.length) {
      while (i < raw.length && /\s/.test(raw[i])) i++;
      if (i >= raw.length) break;
      if (raw[i] === '"') {
        i++;
        let s = "";
        while (i < raw.length && raw[i] !== '"') s += raw[i++];
        if (i < raw.length && raw[i] === '"') i++;
        out.push(s);
      } else {
        let s = "";
        while (i < raw.length && !/\s/.test(raw[i])) s += raw[i++];
        out.push(s);
      }
    }
    return out;
  }

  function parseCoord(token, base) {
    if (token === undefined || token === null) return null;
    const raw = String(token).trim();
    if (!raw) return null;
    if (raw === "~") return base;
    if (raw.startsWith("~")) {
      const offset = Number(raw.slice(1));
      return Number.isFinite(offset) ? base + offset : null;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  function isCoordToken(token) {
    if (token === undefined || token === null) return false;
    const raw = String(token).trim();
    if (raw === "~") return true;
    if (raw.startsWith("~")) return raw.length > 1 && Number.isFinite(Number(raw.slice(1)));
    return /^-?\d+(?:\.\d+)?$/.test(raw);
  }

  function makeEntry(entry) {
    const token = String(entry.token);
    const name = String(entry.name || token);
    const normToken = normalize(token);
    const normName = normalize(name);
    const slug = slugify(name);
    const numStr = entry.numId !== undefined && entry.numId !== null ? String(entry.numId) : "";
    const aliasList = [];
    const seen = new Set([normToken, normName, slug]);
    for (const a of entry.aliases || []) {
      const n = normalize(a);
      if (n && !seen.has(n)) {
        seen.add(n);
        aliasList.push(n);
      }
      const s = slugify(a);
      if (s && !seen.has(s)) {
        seen.add(s);
        aliasList.push(s);
      }
    }
    const words = entry.matchName === false
      ? [...normToken.split(/[_\-:\s/]+/), ...aliasList.flatMap(a => a.split(/[_\-:\s/]+/))].filter(Boolean)
      : [...normToken.split(/[_\-:\s]+/), ...normName.split(/[_\-:\s·]+/)].filter(Boolean);
    return {
      ...entry,
      token,
      name,
      normToken,
      normName,
      slug,
      numStr,
      aliasList,
      words
    };
  }

  function scoreEntry(entry, rawQuery) {
    const q = normalize(rawQuery);
    if (!q) return entry.priority ?? 50;
    const qClean = q.replace(/^(?:block|bloco|item|mob|id):/, "");
    const qSlug = slugify(qClean);
    const isNumeric = /^\d+$/.test(qClean);
    const baseBoost = entry.kindBoost ?? 0;
    const matchName = entry.matchName !== false;

    if (isNumeric && entry.numStr) {
      if (entry.numStr === qClean) return 0 + baseBoost * 0.1;
      if (entry.numStr.startsWith(qClean)) return 1 + baseBoost * 0.1;
    }
    if (entry.normToken === q || entry.normToken === qClean || entry.normToken === qSlug) {
      return 0.5 + baseBoost * 0.1;
    }
    if (matchName && (entry.slug === qSlug || entry.normName === qClean)) {
      return 0.8 + baseBoost * 0.1;
    }
    if (entry.aliasList.includes(qClean) || entry.aliasList.includes(qSlug)) {
      return 1.2 + baseBoost * 0.1;
    }
    if (entry.normToken.startsWith(qClean) || (qSlug && entry.normToken.startsWith(qSlug))) {
      return 2 + baseBoost * 0.2;
    }
    if (matchName && (entry.normName.startsWith(qClean) || (qSlug && entry.slug.startsWith(qSlug)))) {
      return 2.5 + baseBoost * 0.2;
    }
    if (entry.aliasList.some(a => a.startsWith(qClean) || (qSlug && a.startsWith(qSlug)))) {
      return 3 + baseBoost * 0.2;
    }
    if (entry.words.some(w => w.startsWith(qClean) || (qSlug && w.startsWith(qSlug)))) {
      return 4 + baseBoost * 0.2;
    }
    if (entry.normToken.includes(qClean) || (matchName && (entry.normName.includes(qClean) || (qSlug && entry.slug.includes(qSlug))))) {
      return 5 + baseBoost * 0.2;
    }
    if (entry.aliasList.some(a => a.includes(qClean))) {
      return 6 + baseBoost * 0.2;
    }
    if (isNumeric && entry.numStr && entry.numStr.includes(qClean)) {
      return 6.5 + baseBoost * 0.2;
    }
    return Infinity;
  }

  function rankMatches(entries, query, limit = MAX_VISIBLE) {
    const q = normalize(query);
    const scored = [];
    for (const entry of entries) {
      const score = scoreEntry(entry, q);
      if (score < Infinity) scored.push({ entry, score });
    }
    scored.sort((a, b) =>
      a.score - b.score ||
      (a.entry.priority ?? 50) - (b.entry.priority ?? 50) ||
      a.entry.token.length - b.entry.token.length ||
      a.entry.name.localeCompare(b.entry.name, "pt-BR")
    );
    return scored.slice(0, limit).map(s => s.entry);
  }

  function resolveEntry(entries, rawQuery) {
    const q = normalize(rawQuery);
    if (!q) return null;
    const qClean = q.replace(/^(?:block|bloco|item|mob|id):/, "");
    const qSlug = slugify(qClean);
    const isNumeric = /^\d+$/.test(qClean);

    if (isNumeric) {
      const byNum = entries.find(e => e.numStr === qClean);
      if (byNum) return byNum;
    }
    const exactToken = entries.find(e => e.normToken === q || e.normToken === qClean || e.normToken === qSlug);
    if (exactToken) return exactToken;
    const exactName = entries.find(e => e.normName === qClean || e.slug === qSlug);
    if (exactName) return exactName;
    const exactAlias = entries.find(e => e.aliasList.includes(qClean) || e.aliasList.includes(qSlug));
    if (exactAlias) return exactAlias;

    const ranked = rankMatches(entries, q, 2);
    if (ranked.length === 1) return ranked[0];
    if (ranked.length > 1) {
      const s0 = scoreEntry(ranked[0], q);
      const s1 = scoreEntry(ranked[1], q);
      if (s0 <= 2.5 && s1 - s0 >= 0.4) return ranked[0];
    }
    return null;
  }

  function create(api) {
    let cachedIndex = null;

    function getIndex() {
      if (cachedIndex) return cachedIndex;
      const raw = api.buildRegistries();
      const blocks = raw.blocks.map(e => makeEntry({ ...e, kind: "block" }));
      const items = raw.items.map(e => makeEntry({ ...e, kind: "item" }));
      const entities = raw.entities.map(e => makeEntry(e));

      const giveables = [
        ...blocks.map(e => ({ ...e, kindBoost: 0 })),
        ...items.map(e => ({ ...e, kindBoost: 0.4 }))
      ];
      const summonables = [
        ...entities.map(e => ({ ...e, kindBoost: 0 })),
        ...blocks.map(e => ({ ...e, kindBoost: 1.5, priority: 70 })),
        ...items.map(e => ({ ...e, kindBoost: 2.0, priority: 80 }))
      ];
      const placeables = blocks.filter(e => e.placeable !== false);

      cachedIndex = { blocks, placeables, items, entities, giveables, summonables };
      return cachedIndex;
    }

    const gamemodeEntries = [
      makeEntry({ token: "creative", name: "Criativo", badge: "Modo · voo e blocos infinitos", aliases: ["criativo", "c", "1"], value: "creative", priority: 1 }),
      makeEntry({ token: "survival", name: "Sobrevivência", badge: "Modo · padrão", aliases: ["sobrevivencia", "s", "0"], value: "survival", priority: 2 }),
      makeEntry({ token: "criativo", name: "Criativo (PT)", badge: "Modo · alias de creative", aliases: ["creative"], value: "creative", priority: 3 }),
      makeEntry({ token: "sobrevivencia", name: "Sobrevivência (PT)", badge: "Modo · alias de survival", aliases: ["survival"], value: "survival", priority: 4 })
    ];

    const timeEntries = [
      makeEntry({ token: "day", name: "Dia (09:00)", badge: "Horário", aliases: ["dia", "manha", "morning"], value: 0.25, priority: 1 }),
      makeEntry({ token: "noon", name: "Meio-dia (12:00)", badge: "Horário", aliases: ["meio-dia", "meiodia"], value: 0.25, priority: 2 }),
      makeEntry({ token: "sunset", name: "Entardecer", badge: "Horário", aliases: ["entardecer", "por_do_sol", "tarde"], value: 0.49, priority: 3 }),
      makeEntry({ token: "night", name: "Noite", badge: "Horário", aliases: ["noite", "midnight", "meia-noite"], value: 0.72, priority: 4 })
    ];

    const weatherEntries = [
      makeEntry({ token: "clear", name: "Ensolarado / limpo", badge: "Clima", aliases: ["sol", "limpo", "ensolarado"], value: "clear", priority: 1 }),
      makeEntry({ token: "rain", name: "Chuva", badge: "Clima", aliases: ["chuva"], value: "rain", priority: 2 }),
      makeEntry({ token: "snow", name: "Neve", badge: "Clima", aliases: ["neve"], value: "snow", priority: 3 }),
      makeEntry({ token: "storm", name: "Tempestade", badge: "Clima", aliases: ["tempestade"], value: "storm", priority: 4 }),
      makeEntry({ token: "auto", name: "Clima automático", badge: "Clima", aliases: ["automatico", "normal"], value: null, priority: 5 })
    ];

    const seasonEntries = [
      makeEntry({ token: "primavera", name: "Primavera", badge: "Estação", aliases: ["spring", "0"], value: 0, priority: 1 }),
      makeEntry({ token: "verao", name: "Verão", badge: "Estação", aliases: ["summer", "1"], value: 1, priority: 2 }),
      makeEntry({ token: "outono", name: "Outono", badge: "Estação", aliases: ["autumn", "fall", "2"], value: 2, priority: 3 }),
      makeEntry({ token: "inverno", name: "Inverno", badge: "Estação", aliases: ["winter", "3"], value: 3, priority: 4 })
    ];

    const tpPlaceEntries = [
      makeEntry({ token: "lab", name: "Laboratório Carbono", badge: "Local", aliases: ["laboratorio", "carbono"], priority: 1 }),
      makeEntry({ token: "vila", name: "Vila dos Elementos", badge: "Local", aliases: ["village", "aldeia"], priority: 2 }),
      makeEntry({ token: "spawn", name: "Ponto inicial", badge: "Local", aliases: ["inicio", "origem"], priority: 3 }),
      ...[
        ["vila_regional","Vila regional mais próxima",["vilas","povoado"]],
        ["vila_alquimista","Vila alquimista mais próxima",["aldeia_alquimista","vila_dos_alquimistas"]],
        ["covil_draconico","Covil dracônico mais próximo",["covil","dragao"]],
        ["templo_das_dunas","Templo das Dunas mais próximo",["dunas"]],
        ["laboratorio_soterrado","Laboratório soterrado mais próximo",["lab_soterrado"]],
        ["aldeia_das_copas_proxima","Aldeia das Copas mais próxima",["bosque_arvoroso"]],
        ["ruinas_submersas","Ruínas submersas mais próximas",["ruinas_submersas","lago"]],
        ["ruinas_distantes","Ruínas de superfície mais próximas",["ruinas_de_superficie"]],
        ["refugio_distante","Refúgio distante mais próximo",["refugio"]],
        ["posto_distante","Posto alquímico distante mais próximo",["posto_abandonado"]]
      ].map(([token,name,aliases])=>makeEntry({token,name,aliases,badge:"Destino procedural",priority:5})),
      ...(globalThis.QuimiCraftAncients?.profiles??[]).map(p=>makeEntry({
        token:p.id,name:p.cave,badge:"Caverna ancestral",priority:4
      })),
      ...(globalThis.QuimiCraftFactions?.places??[]).map(p=>makeEntry({
        token:p.id,name:p.name,badge:p.divine?"Templo de facção":"Fortaleza / Comunidade",aliases:p.aliases,priority:4
      })),
      ...(globalThis.QuimiCraftDragonLairs?.places??[]).map(p=>makeEntry({
        token:p.id,name:p.name,badge:"Covil de revoada",aliases:p.aliases,priority:4
      })),
      ...(globalThis.QuimiCraftElementalRifts?.places??[]).map(p=>makeEntry({
        token:p.id,name:p.name,badge:"Fissura Elemental",aliases:p.aliases,priority:4
      }))
    ];
    const teleportEntries=()=>[...tpPlaceEntries,...(api.teleportSuggestions?.()??[]).map(makeEntry)];

    const clearEntries = [
      makeEntry({ token: "mobs", name: "Criaturas terrestres", badge: "Limpar", aliases: ["criaturas", "entidades"], priority: 1 }),
      makeEntry({ token: "aquatic", name: "Vida aquática", badge: "Limpar", aliases: ["aquaticos", "peixes", "mar"], priority: 2 }),
      makeEntry({ token: "all", name: "Todas as criaturas", badge: "Limpar", aliases: ["tudo", "todos"], priority: 3 }),
      makeEntry({ token: "inventory", name: "Inventário", badge: "Limpar", aliases: ["inventario", "mochila"], priority: 4 })
    ];

    const toggleEntries = [
      makeEntry({ token: "on", name: "Ativar", badge: "Estado", aliases: ["sim", "ligar", "true", "1"], value: true, priority: 1 }),
      makeEntry({ token: "off", name: "Desativar", badge: "Estado", aliases: ["nao", "desligar", "false", "0"], value: false, priority: 2 })
    ];

    const speedEntries = [1, 2, 3, 4, 5].map(n =>
      makeEntry({ token: String(n), name: `Velocidade ${n}×`, badge: "Multiplicador", value: n, priority: n })
    );

    const qtyEntries = [1, 16, 32, 64].map((n, i) =>
      makeEntry({ token: String(n), name: `${n} unidade${n > 1 ? "s" : ""}`, badge: "Quantidade", priority: i + 1 })
    );

    const factionAllianceEntries = [
      makeEntry({ token: "luz", name: "Exército Dourado (Luz)", badge: "Facção", aliases: ["light", "exercito_dourado", "ouro", "palacio"], value: "light", priority: 1 }),
      makeEntry({ token: "flagelo", name: "Flagelo da Geada (Mortos-vivos)", badge: "Facção", aliases: ["scourge", "mortos_vivos", "lich", "gelo"], value: "scourge", priority: 2 }),
      makeEntry({ token: "fel", name: "Legião da Fenda Vil (Demônios)", badge: "Facção", aliases: ["legiao", "demonios", "fenda", "brasa"], value: "fel", priority: 3 }),
      makeEntry({ token: "druida", name: "Círculo Druídico Xamânico", badge: "Facção", aliases: ["druid", "druidas", "xama", "xamanico", "circulo"], value: "druid", priority: 4 }),
      makeEntry({ token: "alquimista", name: "Ordem dos Alquimistas", badge: "Facção", aliases: ["alchemist", "alquimistas", "alquimia"], value: "alchemist", priority: 5 }),
      makeEntry({ token: "aldeao", name: "Liga dos Aldeões", badge: "Facção", aliases: ["villager", "aldeoes", "vila", "milicia"], value: "villager", priority: 6 }),
      makeEntry({ token: "arvorosos", name: "Conselho dos Arvorosos", badge: "Facção", aliases: ["arvoroso", "copas", "conselho_dos_arvorosos"], value: "arvoroso", priority: 7 }),
      makeEntry({ token: "neutro", name: "Neutro (sem aliança)", badge: "Facção", aliases: ["none", "nenhuma", "sair", "neutral"], value: null, priority: 7 })
    ];

    const summonSpellEntries = [
      makeEntry({ token: "dispensar", name: "Dispensar todos os aliados invocados", badge: "Ação", aliases: ["dismiss", "clear", "remover"], value: "__dismiss__", priority: 0 }),
      ...(globalThis.QuimiCraftSummons?.spells ?? []).map((s, i) => makeEntry({
        token: s.id, name: `${s.name} (${s.mana} mana)`, badge: "Magia de Invocação", aliases: [s.name, s.category, ...(s.id==="brown_bear"?["bear","urso"]:[])], value: s.id, priority: i + 1
      }))
    ];

    const invasionTargetEntries = [
      makeEntry({ token: "patrulha", name: "Confronto de patrulhas perto de você", badge: "Batalha", aliases: ["patrol", "escaramuca", "batalha", "perto"], priority: 1 }),
      ...(globalThis.QuimiCraftFactions?.places ?? []).map((p, i) => makeEntry({
        token: p.id, name: `Invadir ${p.name}`, badge: "Fortaleza", aliases: p.aliases, priority: i + 2
      }))
    ];

    const invasionAttackerEntries = factionAllianceEntries.filter(e => e.value);

    const COMMANDS = [
      {
        name: "gamemode",
        aliases: ["gm", "modo"],
        usage: "/gamemode <creative|survival|criativo|sobrevivencia>",
        desc: "Alterna entre modo Criativo e Sobrevivência",
        complete(args, idx) {
          if (idx === 0) return rankMatches(gamemodeEntries, args[0] || "");
          return [];
        },
        run(args) {
          if (!args.length) {
            return { ok: true, msg: `Modo atual: ${api.getGamemode() === "creative" ? "Criativo" : "Sobrevivência"}. Use /gamemode creative ou /gamemode survival.` };
          }
          const match = resolveEntry(gamemodeEntries, args[0]);
          if (!match) return { ok: false, msg: "Modo inválido. Use: creative (criativo) ou survival (sobrevivencia)." };
          return api.setGamemode(match.value);
        }
      },
      {
        name: "summon",
        aliases: ["spawn", "invocar"],
        usage: "/summon <criatura|bloco|item|id|nome> [x y z | quantidade]",
        desc: "Invoca criaturas, aquáticos, veículos, NPCs ou blocos/itens por ID ou nome",
        complete(args, idx) {
          const { summonables } = getIndex();
          if (idx === 0) return rankMatches(summonables, args[0] || "");
          if (idx >= 1 && idx <= 3) return coordSuggestions(idx - 1, args[idx] || "", idx === 1);
          if (idx === 4) return rankMatches([1, 2, 3, 5].map((n, i) => makeEntry({ token: String(n), name: `${n}×`, badge: "Quantidade", priority: i })), args[4] || "");
          return [];
        },
        run(args) {
          if (!args.length) return { ok: false, msg: "Use: /summon <criatura|bloco|item|id|nome> [x y z | qtd]" };
          const { summonables } = getIndex();
          const parsed = parseTargetAndTail(args, summonables);
          if (!parsed.entry) {
            return { ok: false, msg: `Alvo não encontrado: "${parsed.query}". Use Tab para ver IDs e nomes.` };
          }
          const { entry, coords, count } = parsed;
          if (entry.kind === "block") {
            if (coords) {
              return api.setBlockAt(Math.floor(coords[0]), Math.floor(coords[1]), Math.floor(coords[2]), entry);
            }
            return api.giveEntry(entry, count ?? 64, true);
          }
          if (entry.kind === "item") {
            return api.giveEntry(entry, count ?? entry.defaultCount ?? 1, false);
          }
          return api.summonEntity(entry, coords, count ?? 1);
        }
      },
      {
        name: "give",
        aliases: ["dar", "item"],
        usage: "/give <bloco|item|id|nome> [quantidade]",
        desc: "Adiciona qualquer bloco, arma, ferramenta ou item à mochila por ID ou nome",
        complete(args, idx) {
          const { giveables } = getIndex();
          if (idx === 0) return rankMatches(giveables, args[0] || "");
          if (idx === 1) return rankMatches(qtyEntries, args[1] || "");
          return [];
        },
        run(args) {
          if (!args.length) return { ok: false, msg: "Use: /give <bloco|item|id|nome> [quantidade]" };
          const { giveables } = getIndex();
          let count = null;
          let nameParts = args;
          if (args.length >= 2 && /^\d+$/.test(args[args.length - 1])) {
            count = Math.max(1, Math.min(9999, Number(args[args.length - 1])));
            nameParts = args.slice(0, -1);
          }
          const query = nameParts.join(" ");
          const entry = resolveEntry(giveables, query);
          if (!entry) return { ok: false, msg: `Bloco ou item não encontrado: "${query}". Use Tab para buscar.` };
          const amount = count ?? (entry.kind === "block" ? 64 : (entry.defaultCount ?? 1));
          return api.giveEntry(entry, amount, false);
        }
      },
      {
        name: "setblock",
        aliases: ["bloco"],
        usage: "/setblock <x> <y> <z> <bloco|id|nome>  ou  /setblock <bloco|id|nome>",
        desc: "Coloca um bloco nas coordenadas (aceita ~) ou na mira",
        complete(args, idx) {
          const { placeables } = getIndex();
          if (idx === 0) {
            const q = args[0] || "";
            if (!q || isCoordToken(q) || q.startsWith("~")) {
              return [...coordSuggestions(0, q, false), ...rankMatches(placeables, q, 24)];
            }
            return rankMatches(placeables, q);
          }
          if (idx >= 1 && idx <= 2 && isCoordToken(args[0])) {
            return coordSuggestions(idx, args[idx] || "", false);
          }
          if (idx === 3 && isCoordToken(args[0])) {
            return rankMatches(placeables, args[3] || "");
          }
          return [];
        },
        run(args) {
          if (!args.length) return { ok: false, msg: "Use: /setblock <x> <y> <z> <bloco|id|nome> ou /setblock <bloco>" };
          const { placeables } = getIndex();
          const pos = api.playerBlockPos();
          if (args.length >= 4 && isCoordToken(args[0]) && isCoordToken(args[1]) && isCoordToken(args[2])) {
            const x = parseCoord(args[0], pos.x);
            const y = parseCoord(args[1], pos.y);
            const z = parseCoord(args[2], pos.z);
            const query = args.slice(3).join(" ");
            const entry = resolveEntry(placeables, query);
            if (!entry) return { ok: false, msg: `Bloco não encontrado: "${query}".` };
            return api.setBlockAt(Math.floor(x), Math.floor(y), Math.floor(z), entry);
          }
          const query = args.join(" ");
          const entry = resolveEntry(placeables, query);
          if (!entry) return { ok: false, msg: `Bloco não encontrado: "${query}".` };
          const spot = api.aimedPlacePos();
          return api.setBlockAt(spot.x, spot.y, spot.z, entry);
        }
      },
      {
        name: "fill",
        aliases: ["preencher"],
        usage: "/fill <x1> <y1> <z1> <x2> <y2> <z2> <bloco|id|nome>",
        desc: "Preenche uma região 3D com um bloco (aceita ~)",
        complete(args, idx) {
          const { placeables } = getIndex();
          if (idx >= 0 && idx <= 5) return coordSuggestions(idx % 3, args[idx] || "", false);
          if (idx === 6) return rankMatches(placeables, args[6] || "");
          return [];
        },
        run(args) {
          if (args.length < 7) return { ok: false, msg: "Use: /fill <x1> <y1> <z1> <x2> <y2> <z2> <bloco|id|nome>" };
          const pos = api.playerBlockPos();
          const c = [
            parseCoord(args[0], pos.x), parseCoord(args[1], pos.y), parseCoord(args[2], pos.z),
            parseCoord(args[3], pos.x), parseCoord(args[4], pos.y), parseCoord(args[5], pos.z)
          ];
          if (!c.every(Number.isFinite)) return { ok: false, msg: "Coordenadas inválidas para /fill." };
          const { placeables } = getIndex();
          const query = args.slice(6).join(" ");
          const entry = resolveEntry(placeables, query);
          if (!entry) return { ok: false, msg: `Bloco não encontrado: "${query}".` };
          return api.fillBlocks(c.map(Math.floor), entry);
        }
      },
      {
        name: "tp",
        aliases: ["teleport"],
        usage: "/tp <x> <y> <z>  ou  /tp <local>",
        desc: "Teleporta para coordenadas (aceita ~) ou ponto conhecido",
        complete(args, idx) {
          if (idx === 0) {
            return [
              ...rankMatches(teleportEntries(), args[0] || ""),
              ...coordSuggestions(0, args[0] || "", false)
            ];
          }
          if (idx === 1 || idx === 2) return coordSuggestions(idx, args[idx] || "", false);
          return [];
        },
        run(args) {
          if (!args.length) return { ok: false, msg: "Use /tp <x> <y> <z> ou /tp <local>." };
          if (!isCoordToken(args[0])) {
            const query=args.join(" ");
            const place = resolveEntry(teleportEntries(),query);
            if (place) return api.teleportNamed(place.token);
            if (/^(?:vila|alquimia|den|temple|lab|grove|marco|ruina):-?\d+:-?\d+$/.test(normalize(query)))return api.teleportNamed(normalize(query));
            return {ok:false,msg:"Destino não reconhecido. Consulte as sugestões de /tp."};
          }
          if (args.length !== 3) return { ok: false, msg: "Informe as três coordenadas: /tp x y z" };
          const p = api.playerPos();
          const x = parseCoord(args[0], p.x), y = parseCoord(args[1], p.y), z = parseCoord(args[2], p.z);
          if (![x, y, z].every(Number.isFinite)) return { ok: false, msg: "Coordenadas inválidas." };
          return api.teleportTo(x, y, z);
        }
      },
      {
        name: "time",
        aliases: ["hora"],
        usage: "/time <day|noon|sunset|night|0..24000>",
        desc: "Ajusta o horário do mundo",
        complete(args, idx) {
          return idx === 0 ? rankMatches(timeEntries, args[0] || "") : [];
        },
        run(args) {
          if (!args.length) return { ok: false, msg: "Use: /time day|noon|sunset|night" };
          const entry = resolveEntry(timeEntries, args[0]);
          if (entry) return api.setTime(entry.value, entry.name);
          const n = Number(args[0]);
          if (Number.isFinite(n)) {
            const normalized = n > 1 ? ((n % 24000) + 24000) % 24000 / 24000 : ((n % 1) + 1) % 1;
            return api.setTime(normalized, String(args[0]));
          }
          return { ok: false, msg: "Horário inválido. Use: day, noon, sunset, night ou 0..24000." };
        }
      },
      {
        name: "weather",
        aliases: ["clima"],
        usage: "/weather <clear|rain|snow|storm|auto>",
        desc: "Altera o clima atual",
        complete(args, idx) {
          return idx === 0 ? rankMatches(weatherEntries, args[0] || "") : [];
        },
        run(args) {
          if (!args.length) return { ok: false, msg: "Use: /weather clear|rain|snow|storm|auto" };
          const entry = resolveEntry(weatherEntries, args[0]);
          if (!entry) return { ok: false, msg: "Clima inválido. Use: clear (sol), rain (chuva), snow (neve), storm (tempestade) ou auto." };
          return api.setWeather(entry.value, entry.name);
        }
      },
      {
        name: "season",
        aliases: ["estacao"],
        usage: "/season <primavera|verao|outono|inverno>",
        desc: "Altera a estação do ano",
        complete(args, idx) {
          return idx === 0 ? rankMatches(seasonEntries, args[0] || "") : [];
        },
        run(args) {
          if (!args.length) return { ok: false, msg: "Use: /season primavera|verao|outono|inverno" };
          const entry = resolveEntry(seasonEntries, args[0]);
          if (!entry) return { ok: false, msg: "Estação inválida. Use: primavera, verao, outono ou inverno." };
          return api.setSeason(entry.value, entry.name);
        }
      },
      {
        name: "fly",
        aliases: ["voar"],
        usage: "/fly [on|off]",
        desc: "Liga ou desliga o voo livre",
        complete(args, idx) {
          return idx === 0 ? rankMatches(toggleEntries, args[0] || "") : [];
        },
        run(args) {
          if (!args.length) return api.setFly(null);
          const entry = resolveEntry(toggleEntries, args[0]);
          if (!entry) return { ok: false, msg: "Use: /fly, /fly on ou /fly off." };
          return api.setFly(entry.value);
        }
      },
      {
        name: "speed",
        aliases: ["velocidade"],
        usage: "/speed <1..5>",
        desc: "Ajusta o multiplicador de velocidade",
        complete(args, idx) {
          return idx === 0 ? rankMatches(speedEntries, args[0] || "") : [];
        },
        run(args) {
          const v = args.length ? Number(args[0]) : null;
          if (args.length && (!Number.isFinite(v) || v < 1 || v > 5)) {
            return { ok: false, msg: "Use um valor entre 1 e 5: /speed 1..5" };
          }
          return api.setSpeed(v);
        }
      },
      {
        name: "heal",
        aliases: ["curar"],
        usage: "/heal",
        desc: "Restaura vida, mana, fome, sede e fôlego ao máximo",
        complete() { return []; },
        run() { return api.healPlayer(); }
      },
      {
        name: "kill",
        aliases: ["matar"],
        usage: "/kill <mobs|aquatic|all|especie>",
        desc: "Remove criaturas do mundo (todas ou de uma espécie)",
        complete(args, idx) {
          if (idx !== 0) return [];
          const { entities } = getIndex();
          const scopes = [
            makeEntry({ token: "mobs", name: "Criaturas terrestres", badge: "Alvo", priority: 1 }),
            makeEntry({ token: "aquatic", name: "Criaturas aquáticas", badge: "Alvo", priority: 2 }),
            makeEntry({ token: "all", name: "Todas as criaturas", badge: "Alvo", priority: 3 })
          ];
          return rankMatches([...scopes, ...entities.filter(e => e.kind === "mob" || e.kind === "aquatic")], args[0] || "");
        },
        run(args) {
          if (!args.length) return { ok: false, msg: "Use: /kill mobs|aquatic|all|<espécie>" };
          const scope = normalize(args[0]);
          if (["mobs", "aquatic", "all"].includes(scope)) return api.clearWorld(scope);
          const { entities } = getIndex();
          const entry = resolveEntry(entities, args.join(" "));
          if (!entry) return { ok: false, msg: `Espécie não encontrada: "${args.join(" ")}".` };
          return api.killSpecies(entry);
        }
      },
      {
        name: "clear",
        aliases: ["limpar"],
        usage: "/clear [mobs|aquatic|all|inventory]",
        desc: "Limpa criaturas ou esvazia a mochila",
        complete(args, idx) {
          return idx === 0 ? rankMatches(clearEntries, args[0] || "") : [];
        },
        run(args) {
          const target = args.length ? resolveEntry(clearEntries, args[0]) : clearEntries[0];
          if (!target) return { ok: false, msg: "Use: /clear mobs|aquatic|all|inventory" };
          return api.clearWorld(target.token);
        }
      },
      {
        name: "faccao",
        aliases: ["alianca", "faction", "ally"],
        usage: "/faccao <luz|flagelo|fel|druida|alquimista|aldeao|arvorosos|neutro>",
        desc: "Alia-se a uma facção (Luz, Flagelo, Legião Vil, Druidas, Alquimistas, Aldeões) ou volta a neutro",
        complete(args, idx) {
          return idx === 0 ? rankMatches(factionAllianceEntries, args[0] || "") : [];
        },
        run(args) {
          if (!args.length) {
            return api.getFactionStatus ? api.getFactionStatus() : { ok: true, msg: "Use /faccao luz|flagelo|fel|druida|alquimista|aldeao|arvorosos|neutro" };
          }
          const match = resolveEntry(factionAllianceEntries, args.join(" "));
          if (!match) return { ok: false, msg: "Facção inválida. Use: luz, flagelo, fel, druida, alquimista, aldeao ou neutro." };
          return api.setFactionAlliance ? api.setFactionAlliance(match.value) : { ok: false, msg: "Sistema de facções indisponível." };
        }
      },
      {
        name: "conjurar",
        aliases: ["conjure", "aliado", "invocacao"],
        usage: "/conjurar <criatura|dispensar>",
        desc: "Conjura um aliado de combate (elemental, infernal, cão infernal, golem, luz, caos) usando magia de invocação",
        complete(args, idx) {
          return idx === 0 ? rankMatches(summonSpellEntries, args[0] || "") : [];
        },
        run(args) {
          if (!api.castSummonSpell) return { ok: false, msg: "Sistema de magia de invocação indisponível." };
          if (!args.length) return api.castSummonSpell(null);
          const match = resolveEntry(summonSpellEntries, args.join(" "));
          if (!match) return { ok: false, msg: `Invocação não encontrada: "${args.join(" ")}". Aperte K para ver o Grimório.` };
          return api.castSummonSpell(match.value);
        }
      },
      {
        name: "invasao",
        aliases: ["invasion", "patrulha", "batalha"],
        usage: "/invasao [fortaleza|patrulha] [luz|flagelo|fel]",
        desc: "Inicia uma invasão de facção a uma fortaleza ou um confronto de patrulhas perto de você",
        complete(args, idx) {
          if (idx === 0) return rankMatches(invasionTargetEntries, args[0] || "");
          if (idx === 1) return rankMatches(invasionAttackerEntries, args[1] || "");
          return [];
        },
        run(args) {
          if (!api.triggerFactionEvent) return { ok: false, msg: "Sistema de invasões indisponível." };
          const targetMatch = args[0] ? resolveEntry(invasionTargetEntries, args[0]) : null;
          const attackerMatch = args[1] ? resolveEntry(invasionAttackerEntries, args[1]) : null;
          if (args[0] && !targetMatch) {
            const asAttacker = resolveEntry(invasionAttackerEntries, args[0]);
            if (asAttacker) return api.triggerFactionEvent("patrulha", asAttacker.value);
            return { ok: false, msg: `Destino não encontrado: "${args[0]}". Use patrulha ou o nome de uma fortaleza.` };
          }
          return api.triggerFactionEvent(targetMatch ? targetMatch.token : "auto", attackerMatch ? attackerMatch.value : null);
        }
      },
      {
        name: "sanidade",
        aliases: ["sanity", "mente"],
        usage: "/sanidade [0-100]",
        desc: "Consulta ou ajusta a sanidade do jogador (visões ocorrem abaixo de 60)",
        complete(args, idx) {
          if (idx !== 0) return [];
          const list = [
            makeEntry({ token: "100", name: "Mente lúcida (100%)", badge: "Sanidade", priority: 1 }),
            makeEntry({ token: "50", name: "Abalada — alucinações leves (50%)", badge: "Sanidade", priority: 2 }),
            makeEntry({ token: "25", name: "Perturbada — visões e passagens falsas (25%)", badge: "Sanidade", priority: 3 }),
            makeEntry({ token: "5", name: "Colapso mental — delírio extremo (5%)", badge: "Sanidade", priority: 4 })
          ];
          return rankMatches(list, args[0] || "");
        },
        run(args) {
          if (!api.setSanity) return { ok: false, msg: "Sistema de sanidade indisponível." };
          if (!args.length) return api.setSanity(null);
          const v = Number(args[0]);
          if (!Number.isFinite(v)) return { ok: false, msg: "Use um número entre 0 e 100. Ex.: /sanidade 25" };
          return api.setSanity(Math.max(0, Math.min(100, v)));
        }
      },
      {
        name: "sussurro",
        aliases: ["whisper", "visao"],
        usage: "/sussurro",
        desc: "Dispara um sussurro dos Deuses Antigos (drena sanidade se sem Luz)",
        complete() { return []; },
        run() {
          if (!api.triggerWhisper) return { ok: false, msg: "Sussurros indisponíveis." };
          return api.triggerWhisper();
        }
      },
      {
        name: "recipes",
        aliases: ["receitas"],
        usage: "/recipes",
        desc: "Libera todas as reações químicas na bancada",
        complete() { return []; },
        run() { return api.unlockRecipes(); }
      },
      {
        name: "help",
        aliases: ["ajuda"],
        usage: "/help [comando]",
        desc: "Mostra a lista de comandos disponíveis",
        complete(args, idx) {
          return idx === 0 ? rankMatches(commandEntries, args[0] || "") : [];
        },
        run(args) {
          if (args.length) {
            const cmd = findCommand(args[0]);
            if (!cmd) return { ok: false, msg: `Comando não encontrado: ${args[0]}` };
            return { ok: true, msg: `${cmd.usage} — ${cmd.desc}` };
          }
          const summary = COMMANDS.map(c => "/" + c.name).join(" · ");
          return { ok: true, msg: `Comandos: ${summary} (use Tab para autocompletar)` };
        }
      }
    ];

    const commandEntries = COMMANDS.map((cmd, idx) => makeEntry({
      token: "/" + cmd.name,
      name: cmd.desc,
      badge: "Comando",
      matchName: false,
      aliases: [cmd.name, ...cmd.aliases, ...cmd.aliases.map(a => "/" + a)],
      priority: idx + 1,
      cmd
    }));

    function findCommand(name) {
      const q = normalize(name).replace(/^\/+/, "");
      return COMMANDS.find(c => c.name === q || c.aliases.includes(q)) || null;
    }

    function coordSuggestions(axisIdx, query, includeQty) {
      const aimed = api.aimedBlockPos?.();
      const pos = api.playerBlockPos();
      const axes = ["x", "y", "z"];
      const list = [
        makeEntry({ token: "~", name: `Posição atual (${axes[axisIdx].toUpperCase()} = ${[pos.x, pos.y, pos.z][axisIdx]})`, badge: "Relativo", priority: 1 })
      ];
      if (axisIdx === 0) {
        list.push(makeEntry({ token: "~ ~ ~", name: `Sua posição (${pos.x} ${pos.y} ${pos.z})`, badge: "Relativo", priority: 2 }));
      }
      if (aimed) {
        const val = [aimed.x, aimed.y, aimed.z][axisIdx];
        list.push(makeEntry({ token: String(val), name: `Bloco mirado (${axes[axisIdx].toUpperCase()} = ${val})`, badge: "Mira", priority: 3 }));
        if (axisIdx === 0) {
          list.push(makeEntry({ token: `${aimed.x} ${aimed.y} ${aimed.z}`, name: "Coordenadas do bloco mirado", badge: "Mira", priority: 4 }));
        }
      }
      if (includeQty) {
        list.push(
          makeEntry({ token: "1", name: "1 unidade", badge: "Quantidade", priority: 10 }),
          makeEntry({ token: "5", name: "5 unidades", badge: "Quantidade", priority: 11 }),
          makeEntry({ token: "64", name: "64 unidades (bloco/item)", badge: "Quantidade", priority: 12 })
        );
      }
      return rankMatches(list, query);
    }

    function parseTargetAndTail(args, pool) {
      const pos = api.playerPos();
      let count = null;
      let coords = null;
      let targetArgs = [...args];

      if (targetArgs.length >= 5 && isCoordToken(targetArgs[targetArgs.length - 4]) && isCoordToken(targetArgs[targetArgs.length - 3]) && isCoordToken(targetArgs[targetArgs.length - 2]) && /^\d+$/.test(targetArgs[targetArgs.length - 1])) {
        const x = parseCoord(targetArgs[targetArgs.length - 4], pos.x);
        const y = parseCoord(targetArgs[targetArgs.length - 3], pos.y);
        const z = parseCoord(targetArgs[targetArgs.length - 2], pos.z);
        if ([x, y, z].every(Number.isFinite)) {
          coords = [x, y, z];
          count = Math.max(1, Math.min(9999, Number(targetArgs[targetArgs.length - 1])));
          targetArgs = targetArgs.slice(0, -4);
        }
      } else if (targetArgs.length >= 4 && isCoordToken(targetArgs[targetArgs.length - 3]) && isCoordToken(targetArgs[targetArgs.length - 2]) && isCoordToken(targetArgs[targetArgs.length - 1])) {
        const x = parseCoord(targetArgs[targetArgs.length - 3], pos.x);
        const y = parseCoord(targetArgs[targetArgs.length - 2], pos.y);
        const z = parseCoord(targetArgs[targetArgs.length - 1], pos.z);
        if ([x, y, z].every(Number.isFinite)) {
          coords = [x, y, z];
          targetArgs = targetArgs.slice(0, -3);
        }
      } else if (targetArgs.length >= 2 && /^\d+$/.test(targetArgs[targetArgs.length - 1])) {
        count = Math.max(1, Math.min(9999, Number(targetArgs[targetArgs.length - 1])));
        targetArgs = targetArgs.slice(0, -1);
      }

      const query = targetArgs.join(" ");
      let entry = resolveEntry(pool, query);
      if (!entry && args.length > 1) {
        const fullQuery = args.join(" ");
        const fullEntry = resolveEntry(pool, fullQuery);
        if (fullEntry) return { entry: fullEntry, coords: null, count: null, query: fullQuery };
      }
      return { entry, coords, count, query };
    }

    function getCompletionContext(raw, caret = raw.length, requireSlash = true) {
      const trimmedLeft = raw.trimStart();
      if (requireSlash && !trimmedLeft.startsWith("/")) {
        return { active: false, suggestions: [], hint: "", replaceStart: caret, replaceEnd: caret, appendSpace: false };
      }
      const hasSlash = trimmedLeft.startsWith("/");
      const { tokens, endsWithSpace } = tokenizeInput(raw, caret);

      if (!tokens.length || (tokens.length === 1 && !endsWithSpace)) {
        const tok = tokens[0];
        const q = tok ? tok.text.replace(/^\/+/, "") : "";
        const items = rankMatches(commandEntries, q).map(e => ({
          ...e,
          insert: hasSlash ? e.token : e.token.slice(1)
        }));
        const matched = q ? findCommand(q) : null;
        return {
          active: true,
          suggestions: items,
          hint: matched ? matched.usage : "/comando — Tab autocompleta · ↑↓ navega · Enter executa",
          replaceStart: tok ? tok.start : caret,
          replaceEnd: tok ? tok.end : caret,
          appendSpace: true
        };
      }

      const cmdToken = tokens[0].text.replace(/^\/+/, "");
      const cmd = findCommand(cmdToken);
      if (!cmd) {
        return {
          active: true,
          suggestions: [],
          hint: `Comando desconhecido: /${cmdToken} — digite /help`,
          replaceStart: caret,
          replaceEnd: caret,
          appendSpace: false
        };
      }

      const argTokens = tokens.slice(1);
      const argIndex = endsWithSpace ? argTokens.length : argTokens.length - 1;
      const args = argTokens.map(t => t.text);
      if (endsWithSpace) args.push("");
      const activeToken = endsWithSpace ? null : argTokens[argTokens.length - 1];
      const matches = cmd.complete(args, argIndex) || [];
      const items = matches.map(e => ({ ...e, insert: e.token }));

      return {
        active: true,
        suggestions: items,
        hint: cmd.usage,
        replaceStart: activeToken ? activeToken.start : caret,
        replaceEnd: activeToken ? activeToken.end : caret,
        appendSpace: false
      };
    }

    function execute(raw) {
      const text = String(raw || "").trim();
      if (!text) return { ok: false, msg: "" };
      const cleaned = text.startsWith("/") ? text.slice(1).trim() : text;
      const parts = splitArgs(cleaned);
      if (!parts.length) return { ok: false, msg: "" };
      const cmdName = parts[0];
      const args = parts.slice(1);
      const cmd = findCommand(cmdName);
      if (!cmd) {
        return { ok: false, msg: `Comando não reconhecido: /${cmdName}. Digite /help ou use Tab.` };
      }
      return cmd.run(args);
    }

    function attachUI({ input, listEl, hintEl, requireSlash = true, onSubmit, onEscape }) {
      const history = [];
      let historyIndex = -1;
      let historyDraft = "";
      let suggestions = [];
      let selected = 0;
      let arrowPicked = false;
      let replaceRange = { start: 0, end: 0, appendSpace: false };
      let cycleState = null;

      function hide() {
        suggestions = [];
        selected = 0;
        arrowPicked = false;
        cycleState = null;
        if (listEl) {
          listEl.hidden = true;
          listEl.innerHTML = "";
        }
        if (hintEl) {
          hintEl.hidden = true;
          hintEl.textContent = "";
        }
      }

      function render() {
        if (!listEl) return;
        if (!suggestions.length) {
          listEl.hidden = true;
          listEl.innerHTML = "";
          return;
        }
        listEl.hidden = false;
        listEl.innerHTML = suggestions.map((item, idx) => {
          const idTag = item.numStr ? `<span class="cmd-suggest-id">#${escapeHtml(item.numStr)}</span>` : "";
          return `<div class="cmd-suggest-item${idx === selected ? " active" : ""}" role="option" aria-selected="${idx === selected}" data-cmd-idx="${idx}">`
            + `<span class="cmd-suggest-main"><b class="cmd-suggest-token">${escapeHtml(item.insert)}</b>${idTag}</span>`
            + `<span class="cmd-suggest-meta"><span class="cmd-suggest-name">${escapeHtml(item.name)}</span>`
            + (item.badge ? `<em class="cmd-suggest-badge">${escapeHtml(item.badge)}</em>` : "")
            + `</span></div>`;
        }).join("");
        const activeRow = listEl.querySelector(".cmd-suggest-item.active");
        activeRow?.scrollIntoView({ block: "nearest" });
      }

      function refresh() {
        cycleState = null;
        arrowPicked = false;
        const caret = input.selectionStart ?? input.value.length;
        const ctx = getCompletionContext(input.value, caret, requireSlash);
        if (!ctx.active) {
          hide();
          return;
        }
        suggestions = ctx.suggestions;
        selected = 0;
        replaceRange = { start: ctx.replaceStart, end: ctx.replaceEnd, appendSpace: ctx.appendSpace };
        if (hintEl) {
          hintEl.hidden = !ctx.hint;
          hintEl.textContent = ctx.hint;
        }
        render();
      }

      function applySuggestion(item, start, end, appendSpace) {
        const before = input.value.slice(0, start);
        const after = input.value.slice(end);
        const needsSpace = appendSpace && !after.startsWith(" ");
        const insertText = item.insert + (needsSpace ? " " : "");
        input.value = before + insertText + after;
        const newCaret = before.length + insertText.length;
        input.setSelectionRange(newCaret, newCaret);
        return { end: before.length + item.insert.length, newCaret };
      }

      function completeWithTab(backwards = false) {
        if (!suggestions.length) {
          refresh();
          if (!suggestions.length) return;
        }

        if (cycleState && cycleState.list.length > 1) {
          cycleState.index = (cycleState.index + (backwards ? -1 : 1) + cycleState.list.length) % cycleState.list.length;
          selected = cycleState.index;
          const item = cycleState.list[selected];
          const res = applySuggestion(item, cycleState.start, cycleState.end, false);
          cycleState.end = res.end;
          render();
          return;
        }

        const item = suggestions[selected] || suggestions[0];
        if (!item) return;

        if (suggestions.length === 1 || replaceRange.appendSpace) {
          const acceptWithSpace = replaceRange.appendSpace && (suggestions.length === 1 || arrowPicked);
          if (replaceRange.appendSpace && !acceptWithSpace) {
            const res = applySuggestion(item, replaceRange.start, replaceRange.end, false);
            cycleState = { list: [...suggestions], index: selected, start: replaceRange.start, end: res.end };
            render();
            return;
          }
          applySuggestion(item, replaceRange.start, replaceRange.end, acceptWithSpace || replaceRange.appendSpace);
          refresh();
          return;
        }

        const res = applySuggestion(item, replaceRange.start, replaceRange.end, false);
        cycleState = { list: [...suggestions], index: selected, start: replaceRange.start, end: res.end };
        render();
      }

      if (listEl) {
        listEl.addEventListener("mousedown", e => {
          const row = e.target.closest("[data-cmd-idx]");
          if (!row) return;
          e.preventDefault();
          const idx = Number(row.dataset.cmdIdx);
          const item = suggestions[idx];
          if (!item) return;
          const range = cycleState ? { start: cycleState.start, end: cycleState.end, appendSpace: replaceRange.appendSpace } : replaceRange;
          applySuggestion(item, range.start, range.end, range.appendSpace || item.badge === "Comando");
          refresh();
          input.focus();
        });
      }

      input.addEventListener("input", () => {
        if (requireSlash && /^\/{2,}$/.test(input.value)) {
          input.value = "/";
          input.setSelectionRange(1, 1);
        }
        historyIndex = -1;
        refresh();
      });

      input.addEventListener("click", () => {
        if (!cycleState) refresh();
      });

      input.addEventListener("keydown", e => {
        if (e.key === "Tab") {
          e.preventDefault();
          e.stopPropagation();
          completeWithTab(e.shiftKey);
          return;
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          if (suggestions.length) {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.key === "ArrowDown" ? 1 : -1;
            selected = (selected + delta + suggestions.length) % suggestions.length;
            arrowPicked = true;
            if (cycleState) {
              cycleState.index = selected;
              const item = cycleState.list[selected];
              const res = applySuggestion(item, cycleState.start, cycleState.end, false);
              cycleState.end = res.end;
            }
            render();
            return;
          }
          if (history.length) {
            e.preventDefault();
            e.stopPropagation();
            if (e.key === "ArrowUp") {
              if (historyIndex < 0) historyDraft = input.value;
              historyIndex = Math.min(history.length - 1, historyIndex + 1);
              input.value = history[history.length - 1 - historyIndex];
            } else if (historyIndex >= 0) {
              historyIndex--;
              input.value = historyIndex < 0 ? historyDraft : history[history.length - 1 - historyIndex];
            }
            input.setSelectionRange(input.value.length, input.value.length);
            refresh();
            return;
          }
        }
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          const raw = input.value.trim();
          if (raw && history[history.length - 1] !== raw) {
            history.push(raw);
            if (history.length > 40) history.shift();
          }
          historyIndex = -1;
          hide();
          onSubmit?.(raw);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          historyIndex = -1;
          hide();
          onEscape?.();
        }
      });

      return { refresh, hide, reset: () => { historyIndex = -1; hide(); } };
    }

    return {
      normalize,
      slugify,
      execute,
      getCompletionContext,
      attachUI,
      invalidateIndex: () => { cachedIndex = null; },
      commands: COMMANDS
    };
  }

  return { create, normalize, slugify, parseCoord, isCoordToken };
})();
