var now = () => globalThis.performance?.now?.() || Date.now();
var ALPHA_THRESHOLD = 8;
var WORLD_SCALE = 2;
var PLAYER_HEIGHT = 68;
var ENTITY_HEIGHTS = { npc: 72, normal: 86, miniboss: 112, boss: 140 };
var FLYING_ENEMIES = /* @__PURE__ */ new Set([
  "fada_gelo",
  "espectro_cinzas",
  "dragao_fogo",
  "dragao_pedra",
  "harpia_deserto",
  "pirata_fantasma",
  "agua_viva_abissal",
  "corvo_sombrio",
  "dragao_tempestade",
  "aguia_tempestade",
  "arraia_eletrica",
  "elemental_nuvem",
  "boss_01_dragao_vulcanico",
  "boss_02_dragao_pedra",
  "boss_02_leviata_abissal",
  "boss_01_grifo_tempestade",
  "boss_02_dragao_tempestade"
]);
var point = (x, y) => ({ x, y });
var obstacle = (x, y, w, h) => ({ x, y, w, h });
var REGION_LAYOUTS = [
  { spawn: point(0.1, 0.82), npc: point(0.2, 0.76), chest: point(0.42, 0.68), altar: point(0.69, 0.82), normal: point(0.31, 0.48), miniboss: point(0.58, 0.28), boss1: point(0.74, 0.49), boss2: point(0.86, 0.73), portal: point(0.94, 0.5), objects: [point(0.08, 0.09), point(0.39, 0.12), point(0.68, 0.08), point(0.13, 0.48)], obstacles: [obstacle(0.05, 0.06, 0.18, 0.15), obstacle(0.35, 0.07, 0.15, 0.12), obstacle(0.64, 0.05, 0.22, 0.14), obstacle(0.09, 0.43, 0.12, 0.14), obstacle(0.49, 0.68, 0.14, 0.15)] },
  { spawn: point(0.12, 0.78), npc: point(0.22, 0.69), chest: point(0.46, 0.8), altar: point(0.73, 0.66), normal: point(0.32, 0.42), miniboss: point(0.56, 0.24), boss1: point(0.78, 0.39), boss2: point(0.88, 0.72), portal: point(0.95, 0.52), objects: [point(0.05, 0.14), point(0.38, 0.06), point(0.65, 0.12), point(0.12, 0.52)], obstacles: [obstacle(0.03, 0.1, 0.2, 0.19), obstacle(0.34, 0.04, 0.18, 0.16), obstacle(0.62, 0.08, 0.18, 0.19), obstacle(0.08, 0.47, 0.14, 0.17), obstacle(0.48, 0.55, 0.13, 0.2)] },
  { spawn: point(0.09, 0.75), npc: point(0.2, 0.68), chest: point(0.38, 0.83), altar: point(0.7, 0.76), normal: point(0.3, 0.39), miniboss: point(0.59, 0.24), boss1: point(0.73, 0.42), boss2: point(0.87, 0.65), portal: point(0.95, 0.46), objects: [point(0.09, 0.08), point(0.42, 0.13), point(0.71, 0.07), point(0.16, 0.47)], obstacles: [obstacle(0.06, 0.05, 0.16, 0.16), obstacle(0.37, 0.09, 0.18, 0.13), obstacle(0.68, 0.04, 0.2, 0.16), obstacle(0.12, 0.42, 0.16, 0.13), obstacle(0.45, 0.61, 0.17, 0.16)] },
  { spawn: point(0.14, 0.84), npc: point(0.24, 0.73), chest: point(0.43, 0.58), altar: point(0.67, 0.83), normal: point(0.34, 0.35), miniboss: point(0.57, 0.2), boss1: point(0.76, 0.38), boss2: point(0.88, 0.68), portal: point(0.95, 0.5), objects: [point(0.04, 0.11), point(0.36, 0.08), point(0.63, 0.13), point(0.1, 0.46)], obstacles: [obstacle(0.02, 0.07, 0.2, 0.17), obstacle(0.32, 0.05, 0.19, 0.15), obstacle(0.6, 0.09, 0.22, 0.14), obstacle(0.06, 0.42, 0.15, 0.18), obstacle(0.48, 0.67, 0.12, 0.14)] },
  { spawn: point(0.08, 0.81), npc: point(0.19, 0.72), chest: point(0.4, 0.84), altar: point(0.65, 0.7), normal: point(0.28, 0.44), miniboss: point(0.52, 0.26), boss1: point(0.73, 0.45), boss2: point(0.87, 0.77), portal: point(0.95, 0.56), objects: [point(0.06, 0.06), point(0.34, 0.14), point(0.69, 0.09), point(0.11, 0.51)], obstacles: [obstacle(0.03, 0.03, 0.18, 0.18), obstacle(0.29, 0.1, 0.19, 0.16), obstacle(0.66, 0.06, 0.18, 0.18), obstacle(0.07, 0.47, 0.13, 0.16), obstacle(0.45, 0.62, 0.14, 0.18)] },
  { spawn: point(0.11, 0.73), npc: point(0.23, 0.79), chest: point(0.45, 0.66), altar: point(0.72, 0.8), normal: point(0.31, 0.37), miniboss: point(0.6, 0.23), boss1: point(0.75, 0.4), boss2: point(0.89, 0.66), portal: point(0.96, 0.48), objects: [point(0.04, 0.15), point(0.4, 0.07), point(0.69, 0.13), point(0.15, 0.45)], obstacles: [obstacle(0.02, 0.11, 0.17, 0.15), obstacle(0.36, 0.04, 0.2, 0.16), obstacle(0.66, 0.09, 0.2, 0.16), obstacle(0.11, 0.41, 0.14, 0.16), obstacle(0.49, 0.58, 0.15, 0.14)] },
  { spawn: point(0.15, 0.83), npc: point(0.25, 0.74), chest: point(0.27, 0.58), altar: point(0.62, 0.46), normal: point(0.27, 0.29), miniboss: point(0.58, 0.23), boss1: point(0.84, 0.27), boss2: point(0.74, 0.78), portal: point(0.52, 0.82), objects: [point(0.14, 0.22), point(0.5, 0.17), point(0.78, 0.18), point(0.6, 0.55)], obstacles: [obstacle(0, 0, 0.18, 0.16), obstacle(0.37, 0, 0.16, 0.12), obstacle(0.69, 0, 0.14, 0.14), obstacle(0, 0.25, 0.08, 0.38), obstacle(0.35, 0.31, 0.11, 0.13), obstacle(0.34, 0.52, 0.1, 0.12), obstacle(0.43, 0.57, 0.14, 0.17), obstacle(0.88, 0.38, 0.12, 0.22), obstacle(0, 0.59, 0.1, 0.21), obstacle(0.57, 0.89, 0.22, 0.11)] },
  { spawn: point(0.3, 0.83), npc: point(0.37, 0.72), chest: point(0.49, 0.62), altar: point(0.61, 0.34), normal: point(0.34, 0.43), miniboss: point(0.54, 0.25), boss1: point(0.77, 0.45), boss2: point(0.82, 0.72), portal: point(0.72, 0.88), objects: [point(0.09, 0.18), point(0.42, 0.1), point(0.71, 0.13), point(0.88, 0.63)], obstacles: [obstacle(0, 0, 0.12, 0.23), obstacle(0.27, 0, 0.1, 0.18), obstacle(0.56, 0, 0.12, 0.15), obstacle(0.88, 0, 0.12, 0.25), obstacle(0, 0.32, 0.09, 0.22), obstacle(0.2, 0.52, 0.1, 0.14), obstacle(0.44, 0.68, 0.13, 0.17), obstacle(0.61, 0.52, 0.1, 0.17), obstacle(0, 0.8, 0.2, 0.2), obstacle(0.87, 0.84, 0.13, 0.16)] },
  { spawn: point(0.09, 0.77), npc: point(0.2, 0.69), chest: point(0.42, 0.79), altar: point(0.71, 0.72), normal: point(0.3, 0.4), miniboss: point(0.57, 0.18), boss1: point(0.77, 0.37), boss2: point(0.89, 0.68), portal: point(0.96, 0.5), objects: [point(0.04, 0.08), point(0.36, 0.12), point(0.66, 0.08), point(0.13, 0.46)], obstacles: [obstacle(0.02, 0.05, 0.18, 0.17), obstacle(0.32, 0.08, 0.19, 0.15), obstacle(0.63, 0.05, 0.21, 0.16), obstacle(0.09, 0.42, 0.15, 0.16), obstacle(0.47, 0.61, 0.15, 0.16)] },
  { spawn: point(0.29, 0.84), npc: point(0.36, 0.76), chest: point(0.5, 0.86), altar: point(0.58, 0.53), normal: point(0.29, 0.5), miniboss: point(0.42, 0.25), boss1: point(0.64, 0.34), boss2: point(0.82, 0.48), portal: point(0.74, 0.75), objects: [point(0.19, 0.43), point(0.43, 0.2), point(0.65, 0.3), point(0.78, 0.44)], obstacles: [obstacle(0, 0, 0.13, 0.34), obstacle(0.3, 0, 0.1, 0.14), obstacle(0.51, 0, 0.1, 0.18), obstacle(0.84, 0, 0.16, 0.28), obstacle(0, 0.65, 0.15, 0.35), obstacle(0.36, 0.57, 0.13, 0.14), obstacle(0.56, 0.65, 0.1, 0.22), obstacle(0.84, 0.61, 0.16, 0.39), obstacle(0.56, 0.91, 0.28, 0.09)] }
];
var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
var unique = (values) => [...new Set(values.filter(Boolean))];
var AssetCache = class {
  constructor() {
    this.images = /* @__PURE__ */ new Map();
    this.aliases = /* @__PURE__ */ new Map();
    this.bounds = /* @__PURE__ */ new WeakMap();
    this.missing = /* @__PURE__ */ new Set();
    this.pendingFirst = /* @__PURE__ */ new Set();
  }
  load(src) {
    if (!src) return Promise.resolve(null);
    if (this.images.has(src)) return this.images.get(src).promise;
    const image = new Image();
    const entry = { image, promise: null, valid: false, lastUsed: now() };
    entry.promise = new Promise((resolve) => {
      image.onload = () => {
        entry.valid = image.naturalWidth > 0 && image.naturalHeight > 0;
        if (!entry.valid) this.reportMissing(src, "dimens\xF5es naturais inv\xE1lidas");
        else this.getBounds(image);
        resolve(entry.valid ? image : null);
      };
      image.onerror = () => {
        entry.valid = false;
        this.reportMissing(src, "falha de carregamento");
        resolve(null);
      };
    });
    this.images.set(src, entry);
    image.src = src;
    return entry.promise;
  }
  reportMissing(src, reason) {
    if (this.missing.has(src)) return;
    this.missing.add(src);
    console.warn(`[AssetCache] Sprite indispon\xEDvel (${reason}): ${src}`);
  }
  async loadFirst(requested, candidates = []) {
    const paths = unique([requested, ...candidates]);
    for (const path of paths) {
      const image = await this.load(path);
      if (image && image.naturalWidth > 0 && image.naturalHeight > 0) {
        this.aliases.set(requested, path);
        if (path !== requested) console.warn(`[AssetCache] Usando fallback para ${requested}: ${path}`);
        return image;
      }
    }
    this.reportMissing(requested, "nenhum fallback v\xE1lido");
    return null;
  }
  resolveFirst(requested, candidates = []) {
    const direct = this.images.get(requested), directImage = direct?.image;
    if (direct?.valid && directImage?.complete && directImage.naturalWidth > 0 && directImage.naturalHeight > 0) {
      direct.lastUsed = now();
      this.aliases.set(requested, requested);
      return directImage;
    }
    const alias = this.aliases.get(requested), aliasImage = alias && alias !== requested ? this.get(alias) : null;
    let fallback = aliasImage;
    if (!fallback) for (const path of unique(candidates)) {
      fallback = this.get(path);
      if (fallback) {
        this.aliases.set(requested, path);
        break;
      }
    }
    if (!this.missing.has(requested) && !this.pendingFirst.has(requested)) {
      this.pendingFirst.add(requested);
      this.loadFirst(requested, candidates).finally(() => this.pendingFirst.delete(requested));
    }
    return fallback || null;
  }
  get(src) {
    const resolved = this.aliases.get(src) || src;
    const entry = this.images.get(resolved);
    if (entry) entry.lastUsed = now();
    const image = entry?.image;
    return entry?.valid && image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0 ? image : null;
  }
  getBounds(image) {
    if (!image) return { x: 0, y: 0, w: 1, h: 1 };
    const cached = this.bounds.get(image);
    if (cached) return cached;
    const full = { x: 0, y: 0, w: Math.max(1, image.naturalWidth || image.width || 1), h: Math.max(1, image.naturalHeight || image.height || 1) };
    try {
      const canvas = document.createElement("canvas");
      canvas.width = full.w;
      canvas.height = full.h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, full.w, full.h);
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, full.w, full.h).data;
      let left = full.w, top = full.h, right = -1, bottom = -1;
      for (let y = 0; y < full.h; y++) for (let x = 0; x < full.w; x++) if (pixels[(y * full.w + x) * 4 + 3] > ALPHA_THRESHOLD) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
      const result = right >= left && bottom >= top ? { x: left, y: top, w: right - left + 1, h: bottom - top + 1 } : full;
      this.bounds.set(image, result);
      return result;
    } catch (error) {
      this.bounds.set(image, full);
      return full;
    }
  }
  async loadGroup(paths, onProgress = () => {
  }) {
    const list = unique(paths);
    let done = 0;
    if (!list.length) {
      onProgress(1);
      return;
    }
    await Promise.all(list.map((path) => this.load(path).then(() => {
      done += 1;
      onProgress(done / list.length);
    })));
  }
  releaseOld(maxAge = 18e4) {
    const time = now();
    for (const [key2, value] of this.images) if (time - value.lastUsed > maxAge && !this.aliases.has(key2)) this.images.delete(key2);
  }
};
var ExplorationEngine = class {
  constructor({ canvas, minimap, getState, cache: cache2, audio: audio2, onInteract, onEncounter, onPortal, onTower, onHud, onPrompt, onLoading }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    this.minimap = minimap;
    this.mctx = minimap.getContext("2d");
    this.getState = getState;
    this.cache = cache2;
    this.audio = audio2;
    this.callbacks = { onInteract, onEncounter, onPortal, onTower, onHud, onPrompt, onLoading };
    this.keys = /* @__PURE__ */ new Set();
    this.target = null;
    this.running = false;
    this.paused = true;
    this.lastTime = now();
    this.camera = { x: 0, y: 0 };
    this.world = { w: 2896, h: 2172, sourceW: 1448, sourceH: 1086 };
    this.nearEntity = null;
    this.frame = 0;
    this.entities = [];
    this.touchSprint = false;
    this.moving = false;
    this.lastPlayerImage = null;
    this.bindEvents();
  }
  bindEvents() {
    window.addEventListener("keydown", (event) => {
      if (this.paused) return;
      const settings = this.getState()?.settings;
      if (Object.values(settings?.keys || {}).includes(event.code) || ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "ShiftLeft", "ShiftRight"].includes(event.code)) event.preventDefault();
      this.keys.add(event.code);
      if (event.code === settings?.keys?.interact || event.code === "Space") this.interact();
    }, { passive: false });
    window.addEventListener("keyup", (event) => this.keys.delete(event.code));
    window.addEventListener("blur", () => {
      this.keys.clear();
      this.touchSprint = false;
    });
    this.canvas.addEventListener("pointerdown", (event) => {
      if (this.paused) return;
      const rect = this.canvas.getBoundingClientRect(), sx = this.canvas.width / rect.width, sy = this.canvas.height / rect.height;
      this.target = { x: (event.clientX - rect.left) * sx + this.camera.x, y: (event.clientY - rect.top) * sy + this.camera.y };
      this.canvas.focus();
    });
  }
  setTouchDirection(direction, active) {
    const map = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" };
    if (active) this.keys.add(map[direction]);
    else this.keys.delete(map[direction]);
  }
  setSprint(active) {
    this.touchSprint = Boolean(active);
  }
  layout(index = this.getState()?.regionIndex || 0) {
    return REGION_LAYOUTS[index] || REGION_LAYOUTS[0];
  }
  toWorld(normalized) {
    return { x: normalized.x * this.world.w, y: normalized.y * this.world.h };
  }
  spawnPoint(index = this.getState()?.regionIndex || 0) {
    const override = MapOverridesModule.worldMapOverride(index);
    return override?.spawn ? { x: Number(override.spawn.x), y: Number(override.spawn.y) } : this.toWorld((REGION_LAYOUTS[index] || REGION_LAYOUTS[0]).spawn);
  }
  obstacles(index = this.getState()?.regionIndex || 0) {
    return (this.layout(index).obstacles || []).map((box) => ({ x: box.x * this.world.w, y: box.y * this.world.h, w: box.w * this.world.w, h: box.h * this.world.h }));
  }
  playerCandidates(state2, direction) {
    const front = formSprite(state2.route, state2.activeForm, "front", state2.visualVariant);
    const exact = formSprite(state2.route, state2.activeForm, direction, state2.visualVariant);
    return { exact, candidates: [front, characterArt(state2.route, state2.visualVariant)] };
  }
  enemyCandidates(region, id, direction, boss) {
    const exact = mobSprite(region, id, direction, boss), front = mobSprite(region, id, "front", boss);
    const peers = boss ? [region.miniboss, ...region.bosses] : region.normal;
    return { exact, candidates: [front, ...peers.filter((peer) => peer !== id).map((peer) => mobSprite(region, peer, "front", boss))] };
  }
  async loadRegion(index, announce = true) {
    const state2 = this.getState(), region = REGIONS[index];
    if (!state2 || !region) return;
    this.paused = true;
    this.callbacks.onLoading?.(true, `Abrindo ${region.name}...`, 0.03);
    state2.regionIndex = index;
    if (!state2.discoveredRegions.includes(index)) state2.discoveredRegions.push(index);
    const core = [asset(region.biome), asset(region.map), asset(region.battle), asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"), ...region.tileObjects.map((file) => tileSprite(region, file)), this.npcSprite(index), ...(MapOverridesModule.worldMapOverride(index)?.props || []).map((prop) => prop.path)];
    await this.cache.loadGroup(core, (progress) => this.callbacks.onLoading?.(true, `Carregando ${region.subtitle}...`, progress * 0.55));
    const bg = this.cache.get(asset(region.biome));
    if (bg) this.world = { w: bg.naturalWidth * WORLD_SCALE, h: bg.naturalHeight * WORLD_SCALE, sourceW: bg.naturalWidth, sourceH: bg.naturalHeight };
    this.buildEntities();
    const spriteLoads = [];
    for (const direction of ["front", "back", "left", "right"]) {
      const spec = this.playerCandidates(state2, direction);
      spriteLoads.push(this.cache.loadFirst(spec.exact, spec.candidates));
    }
    for (const entity of this.entities) if (entity.sprite) {
      spriteLoads.push(this.cache.loadFirst(entity.sprite, entity.fallbacks || []));
    }
    await Promise.all(spriteLoads.map((promise, index2) => promise.then(() => this.callbacks.onLoading?.(true, `Alinhando habitantes e criaturas...`, 0.55 + 0.45 * (index2 + 1) / Math.max(1, spriteLoads.length)))));
    const changed = index !== this.lastRegion;
    if (announce || changed || !state2.position || this.collides(state2.position)) state2.position = this.findSafeSpawn(index);
    this.lastRegion = index;
    this.camera.x = Math.max(0, Math.min(this.world.w - this.canvas.width, state2.position.x - this.canvas.width / 2));
    this.camera.y = Math.max(0, Math.min(this.world.h - this.canvas.height, state2.position.y - this.canvas.height / 2));
    this.callbacks.onHud?.();
    this.callbacks.onLoading?.(false, "", 1);
    this.paused = false;
    this.audio.startAmbient(index);
    this.cache.releaseOld();
  }
  findSafeSpawn(index) {
    const spawn = this.spawnPoint(index);
    if (!this.collides(spawn, index)) return spawn;
    for (let radius = 40; radius <= 360; radius += 40) for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const candidate = { x: spawn.x + Math.cos(angle) * radius, y: spawn.y + Math.sin(angle) * radius };
      if (!this.collides(candidate, index)) return candidate;
    }
    return { x: 120, y: this.world.h - 120 };
  }
  npcSprite(index) {
    const choices = [COMPANIONS.eliara.sprite, asset("personagens/sprites_separadas/fada_timbo_feminino/fada_timbo_feminino_front.webp"), asset("personagens/sprites_separadas/anao_oculos_feminino/anao_oculos_feminino_front.webp"), COMPANIONS.dagra.sprite, asset("personagens/sprites_separadas/necromante_oculos_feminino/necromante_oculos_feminino_front.webp"), asset("personagens/sprites_separadas/vampiro_timbo_feminino/vampiro_timbo_feminino_front.webp"), asset("personagens/sprites_separadas/sereia_oculos_feminino/sereia_oculos_feminino_front.webp"), asset("personagens/sprites_separadas/sereia_timbo_feminino/sereia_timbo_feminino_front.webp"), asset("personagens/sprites_separadas/necromante_timbo_feminino/necromante_timbo_feminino_front.webp"), asset("personagens/sprites_separadas/fada_oculos_feminino/fada_oculos_feminino_front.webp")];
    return choices[index % choices.length];
  }
  towerEntrancePoint(index = this.getState()?.regionIndex || 0) {
    const candidates = [point(0.82, 0.17), point(0.74, 0.84), point(0.18, 0.24), point(0.88, 0.52), point(0.55, 0.88)];
    for (let offset = 0; offset < candidates.length; offset++) {
      const candidate = this.toWorld(candidates[(index + offset) % candidates.length]);
      if (!this.collides(candidate, index)) return candidate;
    }
    return this.findSafeSpawn(index);
  }
  buildEntities() {
    const state2 = this.getState(), region = REGIONS[state2.regionIndex], layout = this.layout(state2.regionIndex), defeated = state2.defeated[region.key] || [];
    const sequence = { normal: true, miniboss: defeated.includes("normal"), boss1: defeated.includes("miniboss"), boss2: defeated.includes("boss1") };
    const bases = [{ id: "npc", type: "npc", at: layout.npc, label: region.npc }, { id: "chest", type: "chest", at: layout.chest, label: "Tesouro" }, { id: "altar", type: "altar", at: layout.altar, label: "Mem\xF3ria" }, { id: "normal", type: "encounter", encounter: "normal", at: layout.normal, label: "Criaturas" }, { id: "miniboss", type: "encounter", encounter: "miniboss", at: layout.miniboss, label: "Miniboss" }, { id: "boss1", type: "encounter", encounter: "boss1", at: layout.boss1, label: "Guardi\xE3o" }, { id: "boss2", type: "encounter", encounter: "boss2", at: layout.boss2, label: "Portador" }, { id: "portal", type: "portal", at: layout.portal, label: "Travessia" }];
    if (state2.tower?.unlocked) {
      const entrance = this.towerEntrancePoint(state2.regionIndex);
      bases.push({ id: "tower-entrance", type: "tower", at: null, x: entrance.x, y: entrance.y, label: "Torre da Carne" });
    }
    this.entities = bases.map((base) => {
      const entity = base.at ? { ...base, ...this.toWorld(base.at) } : { ...base };
      if (entity.type === "encounter") {
        entity.defeated = defeated.includes(entity.encounter);
        entity.locked = !sequence[entity.encounter];
        let boss = false;
        if (entity.encounter === "normal") {
          entity.enemyId = region.normal[state2.regionIndex % region.normal.length];
          entity.kind = "normal";
        } else if (entity.encounter === "miniboss") {
          entity.enemyId = region.miniboss;
          entity.kind = "miniboss";
          boss = true;
        } else {
          const bossIndex = entity.encounter === "boss1" ? 0 : 1;
          entity.enemyId = region.bosses[bossIndex];
          entity.kind = "boss";
          boss = true;
        }
        const spec = this.enemyCandidates(region, entity.enemyId, "front", boss);
        entity.sprite = spec.exact;
        entity.fallbacks = spec.candidates;
        entity.height = ENTITY_HEIGHTS[entity.kind];
        entity.flying = FLYING_ENEMIES.has(entity.enemyId);
      } else if (entity.type === "npc") {
        entity.sprite = this.npcSprite(state2.regionIndex);
        entity.height = ENTITY_HEIGHTS.npc;
      }
      return entity;
    }).filter((entity) => {
      if (entity.type === "chest" && state2.openedChests.includes(`${region.key}-chest`)) return false;
      if (entity.type === "altar" && state2.inspectedAltars.includes(region.key)) return false;
      if (entity.type === "portal" && !defeated.includes("boss2")) return false;
      return !entity.defeated;
    });
    this.entities = MapOverridesModule.applyWorldEntityOverride(state2.regionIndex, this.entities);
    const objective = this.entities.find((entity) => entity.type === "encounter" && !entity.locked) || this.entities.find((entity) => entity.type === "portal") || this.entities.find((entity) => entity.type === "npc");
    if (objective) objective.objective = true;
  }
  start() {
    if (this.running) {
      this.paused = false;
      return;
    }
    this.running = true;
    this.paused = false;
    this.lastTime = now();
    const loop = (time) => {
      if (!this.running) return;
      const dt = Math.min(0.04, (time - this.lastTime) / 1e3);
      this.lastTime = time;
      if (!this.paused) this.update(dt);
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  stop() {
    this.paused = true;
    this.keys.clear();
    this.touchSprint = false;
  }
  resume() {
    this.paused = false;
    this.lastTime = now();
    this.canvas.focus();
  }
  update(dt) {
    const state2 = this.getState();
    if (!state2) return;
    const keys = state2.settings.keys;
    let dx = 0, dy = 0;
    if (this.keys.has(keys.left) || this.keys.has("ArrowLeft")) dx -= 1;
    if (this.keys.has(keys.right) || this.keys.has("ArrowRight")) dx += 1;
    if (this.keys.has(keys.up) || this.keys.has("ArrowUp")) dy -= 1;
    if (this.keys.has(keys.down) || this.keys.has("ArrowDown")) dy += 1;
    const pad = navigator.getGamepads?.()[0];
    if (pad) {
      if (Math.abs(pad.axes[0]) > 0.18) dx += pad.axes[0];
      if (Math.abs(pad.axes[1]) > 0.18) dy += pad.axes[1];
      if (pad.buttons[0]?.pressed && !this.gamepadAction) {
        this.gamepadAction = true;
        this.interact();
      }
      if (!pad.buttons[0]?.pressed) this.gamepadAction = false;
    }
    if (!dx && !dy && this.target) {
      const vx = this.target.x - state2.position.x, vy = this.target.y - state2.position.y;
      if (Math.hypot(vx, vy) < 10) this.target = null;
      else {
        dx = vx;
        dy = vy;
      }
    } else if (dx || dy) this.target = null;
    this.moving = Boolean(dx || dy);
    if (this.moving) {
      const length = Math.hypot(dx, dy) || 1;
      dx /= length;
      dy /= length;
      const sprint = this.touchSprint || this.keys.has("ShiftLeft") || this.keys.has("ShiftRight") || Boolean(pad?.buttons?.[1]?.pressed);
      const travel = (sprint ? 330 : 205) * dt;
      const steps = Math.max(1, Math.ceil(travel / 10));
      for (let step = 0; step < steps; step++) {
        const move = travel / steps, next = { x: state2.position.x + dx * move, y: state2.position.y + dy * move };
        if (!this.collides(next)) state2.position = next;
        else {
          const nx = { x: state2.position.x + dx * move, y: state2.position.y }, ny = { x: state2.position.x, y: state2.position.y + dy * move };
          if (!this.collides(nx)) state2.position = nx;
          else if (!this.collides(ny)) state2.position = ny;
        }
      }
      if (Math.abs(dx) > Math.abs(dy)) state2.facing = dx < 0 ? "left" : "right";
      else state2.facing = dy < 0 ? "back" : "front";
      this.frame += dt * (sprint ? 12 : 8);
    }
    const maxX = Math.max(0, this.world.w - this.canvas.width), maxY = Math.max(0, this.world.h - this.canvas.height), targetCamX = Math.max(0, Math.min(maxX, state2.position.x - this.canvas.width / 2)), targetCamY = Math.max(0, Math.min(maxY, state2.position.y - this.canvas.height / 2));
    this.camera.x += (targetCamX - this.camera.x) * Math.min(1, dt * 6);
    this.camera.y += (targetCamY - this.camera.y) * Math.min(1, dt * 6);
    const nearby = this.entities.filter((entity) => distance(state2.position, entity) < 118).sort((a, b) => distance(state2.position, a) - distance(state2.position, b))[0] || null;
    if (nearby?.id !== this.nearEntity?.id) {
      this.nearEntity = nearby;
      this.callbacks.onPrompt?.(nearby);
    }
    const atPortal = this.entities.some((entity) => entity.type === "portal" && distance(state2.position, entity) < 58);
    if (atPortal && !this.portalTriggered) {
      this.portalTriggered = true;
      this.callbacks.onPortal?.();
    }
    if (!atPortal) this.portalTriggered = false;
    this.callbacks.onHud?.(false);
  }
  collides(position, index = this.getState()?.regionIndex || 0) {
    if (globalThis.__VOZ_DEV__?.enabled && globalThis.__VOZ_DEV__.flags?.playerCollision === false) return false;
    const editorCollision = globalThis.__VOZ_DEV__?.enabled ? globalThis.__VOZ_DEV__.editor?.worldCollisionAt?.(position, index) : null;
    if (typeof editorCollision === "boolean") return editorCollision;
    const radius = 21, border = 64;
    if (position.x < border + radius || position.y < border + radius || position.x > this.world.w - border - radius || position.y > this.world.h - border - radius) return true;
    const shippedOverride = MapOverridesModule.worldMapOverride(index);
    const shippedNavigation = MapOverridesModule.worldNavigationValue(index, position.x, position.y, shippedOverride?.metadata?.gridSize || 64);
    if (["blocked", "hazard", "void"].includes(shippedNavigation)) return true;
    if ((shippedOverride?.props || []).some((prop) => PropPresentationModule.propBlocksPoint(prop, position.x, position.y, radius))) return true;
    if (["walkable", "path", "bridge"].includes(shippedNavigation)) return false;
    const shippedObstacles = MapOverridesModule.worldMapOverride(index)?.obstacles;
    const obstacles = Array.isArray(shippedObstacles) ? shippedObstacles : this.obstacles(index);
    return obstacles.some((box) => position.x + radius > box.x && position.x - radius < box.x + box.w && position.y + radius > box.y && position.y - radius < box.y + box.h);
  }
  interact() {
    if (this.paused || !this.nearEntity) return;
    const entity = this.nearEntity;
    this.audio.confirm();
    if (entity.type === "encounter") {
      if (entity.locked) return this.callbacks.onInteract?.({ type: "locked", entity });
      this.paused = true;
      this.callbacks.onEncounter?.(entity.encounter, entity);
    } else if (entity.type === "portal") this.callbacks.onPortal?.();
    else if (entity.type === "tower") {
      this.paused = true;
      this.callbacks.onTower?.();
    } else this.callbacks.onInteract?.(entity);
  }
  draw() {
    const state2 = this.getState();
    if (!state2) return;
    const region = REGIONS[state2.regionIndex], ctx = this.ctx, bg = this.cache.get(asset(region.biome));
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = region.palette[2];
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (bg) ctx.drawImage(bg, 0, 0, bg.naturalWidth, bg.naturalHeight, -Math.round(this.camera.x), -Math.round(this.camera.y), this.world.w, this.world.h);
    ctx.fillStyle = "rgba(4,3,9,.14)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawWorldObjects(region);
    const shippedProps = (MapOverridesModule.worldMapOverride(state2.regionIndex)?.props || []).map((prop) => ({ ...prop, type: "shipped-prop" }));
    [...this.entities, ...shippedProps].sort((a, b) => (a.type === "shipped-prop" ? PropPresentationModule.propSortY(a) : a.y) - (b.type === "shipped-prop" ? PropPresentationModule.propSortY(b) : b.y)).forEach((entity) => entity.type === "shipped-prop" ? this.drawRuntimeProp(entity) : this.drawEntity(entity, region));
    this.drawPlayer(state2);
    this.drawLighting(region);
    this.drawMinimap(state2, region);
  }
  drawCropped(image, centerX, groundY, targetHeight, { alpha = 1, mirror = false } = {}) {
    if (!image) return null;
    const bounds = this.cache.getBounds(image), width = targetHeight * (bounds.w / bounds.h), x = centerX - width / 2, y = groundY - targetHeight;
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";
    this.ctx.globalAlpha = alpha;
    if (mirror) {
      this.ctx.translate(centerX * 2, 0);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(image, bounds.x, bounds.y, bounds.w, bounds.h, x, y, width, targetHeight);
    } else this.ctx.drawImage(image, bounds.x, bounds.y, bounds.w, bounds.h, x, y, width, targetHeight);
    this.ctx.restore();
    return { width, height: targetHeight, x, y };
  }
  drawRuntimeProp(rawProp) {
    const prop = PropPresentationModule.normalizePropPresentation(rawProp);
    const image = this.cache.get(prop.path);
    if (!image) return;
    const shadow = PropPresentationModule.propShadowSpec(prop), box = PropPresentationModule.propVisualBounds(prop), bounds = prop.sourceBounds;
    if (shadow.opacity > 0) {
      this.ctx.fillStyle = `rgba(0,0,0,${shadow.opacity})`;
      this.ctx.beginPath();
      this.ctx.ellipse(shadow.x - this.camera.x, shadow.y - this.camera.y, shadow.width / 2, shadow.height / 2, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }
    const anchorX = prop.x + prop.anchorOffsetX - this.camera.x, anchorY = prop.y + prop.anchorOffsetY - this.camera.y;
    this.ctx.save();
    this.ctx.translate(anchorX, anchorY);
    if (prop.rotation && prop.canRotate !== false) this.ctx.rotate(Number(prop.rotation) * Math.PI / 180);
    if (prop.mirror && prop.canMirror !== false) this.ctx.scale(-1, 1);
    this.ctx.drawImage(image, bounds[0], bounds[1], bounds[2], bounds[3], box.x - this.camera.x - anchorX, box.y - this.camera.y - anchorY, box.w, box.h);
    this.ctx.restore();
  }
  drawWorldObjects(region) {
    const placements = this.layout(region.id).objects;
    region.tileObjects.forEach((file, index) => {
      const image = this.cache.get(tileSprite(region, file));
      if (!image) return;
      const p = this.toWorld(placements[index]);
      const bounds = this.cache.getBounds(image), targetWidth = [230, 185, 220, 150][index], scale = targetWidth / bounds.w, targetHeight = bounds.h * scale;
      this.ctx.drawImage(image, bounds.x, bounds.y, bounds.w, bounds.h, Math.round(p.x - this.camera.x - targetWidth / 2), Math.round(p.y - this.camera.y - targetHeight), Math.round(targetWidth), Math.round(targetHeight));
    });
  }
  drawEntity(entity, region) {
    const x = Math.round(entity.x - this.camera.x), ground = Math.round(entity.y - this.camera.y);
    if (x < -190 || ground < -190 || x > this.canvas.width + 190 || ground > this.canvas.height + 190) return;
    const ctx = this.ctx;
    ctx.save();
    if (entity.type === "npc" || entity.type === "encounter") {
      const image = this.cache.get(entity.sprite), height = entity.height || ENTITY_HEIGHTS.npc, float = entity.flying ? Math.sin(now() / 520 + entity.x) * 2.2 : 0, feet = ground + float, alpha = entity.locked ? 0.32 : 1;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(0,0,0,.38)";
      ctx.beginPath();
      ctx.ellipse(x, ground + 4, Math.max(19, height * 0.28), Math.max(5, height * 0.07), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      this.drawCropped(image, x, feet, height, { alpha });
      if (entity.type === "npc" || !entity.locked) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = entity.type === "npc" ? "#ffe49d" : "#ff5574";
        ctx.beginPath();
        ctx.moveTo(x, feet - height - 13);
        ctx.lineTo(x + 7, feet - height - 6);
        ctx.lineTo(x, feet - height + 1);
        ctx.lineTo(x - 7, feet - height - 6);
        ctx.fill();
      }
    } else if (entity.type === "chest") {
      const image = this.cache.get(tileSprite(region, region.tileObjects[1]));
      this.drawObject(image, x, ground, 70);
      ctx.strokeStyle = "#ffe39a";
      ctx.strokeRect(x - 27, ground - 41, 54, 38);
    } else if (entity.type === "altar") {
      const image = this.cache.get(tileSprite(region, region.tileObjects[2]));
      this.drawObject(image, x, ground, 104);
      ctx.strokeStyle = region.palette[0];
      ctx.beginPath();
      ctx.arc(x, ground - 35, 34 + Math.sin(now() / 300) * 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (entity.type === "portal") {
      const image = this.cache.get(asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"));
      ctx.globalAlpha = 0.78;
      this.drawObject(image, x, ground, 120);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.font = "700 11px Georgia";
      ctx.textAlign = "center";
      ctx.fillText("PR\xD3XIMA REGI\xC3O", x, ground + 24);
    } else if (entity.type === "tower") {
      const pulse = Math.sin(now() / 360);
      ctx.fillStyle = "rgba(25,2,13,.72)";
      ctx.beginPath();
      ctx.ellipse(x, ground - 56, 31, 52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c73768";
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.76;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(x, ground - 56, 38 + i * 10 + pulse * 2, 58 - i * 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffe1ca";
      ctx.font = "700 11px Georgia";
      ctx.textAlign = "center";
      ctx.fillText("TORRE DA CARNE", x, ground + 24);
    }
    ctx.restore();
  }
  drawObject(image, x, ground, targetHeight) {
    if (!image) return;
    const bounds = this.cache.getBounds(image), width = targetHeight * (bounds.w / bounds.h);
    this.ctx.drawImage(image, bounds.x, bounds.y, bounds.w, bounds.h, x - width / 2, ground - targetHeight, width, targetHeight);
  }
  drawPlayer(state2) {
    const spec = this.playerCandidates(state2, state2.facing), loadedImage = this.cache.resolveFirst(spec.exact, spec.candidates), image = loadedImage || this.lastPlayerImage, x = Math.round(state2.position.x - this.camera.x), ground = Math.round(state2.position.y - this.camera.y);
    if (loadedImage) this.lastPlayerImage = loadedImage;
    this.ctx.fillStyle = "rgba(0,0,0,.48)";
    this.ctx.beginPath();
    this.ctx.ellipse(x, ground + 4, 20, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();
    const resolved = this.cache.aliases.get(spec.exact) || spec.exact, derived = resolved === characterArt(state2.route, state2.visualVariant), mirror = derived && state2.facing === "left";
    this.drawCropped(image, x, ground, PLAYER_HEIGHT, { mirror });
    const route = ROUTES[state2.route];
    this.ctx.strokeStyle = route.color;
    this.ctx.globalAlpha = 0.5;
    this.ctx.beginPath();
    this.ctx.arc(x, ground - 34, 26 + Math.sin(now() / 250) * 1.5, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
  }
  drawLighting(region) {
    const gradient = this.ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 160, this.canvas.width / 2, this.canvas.height / 2, 650);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(3,2,8,.48)");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = region.id === 7 ? "rgba(30,87,170,.12)" : region.id === 2 ? "rgba(180,42,13,.08)" : "rgba(0,0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  drawMinimap(state2, region) {
    const ctx = this.mctx, w = this.minimap.width, h = this.minimap.height, bg = this.cache.get(asset(region.biome));
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#05030a";
    ctx.fillRect(0, 0, w, h);
    const scale = Math.min(w / this.world.w, h / this.world.h), mapW = this.world.w * scale, mapH = this.world.h * scale, ox = (w - mapW) / 2, oy = (h - mapH) / 2;
    if (bg) ctx.drawImage(bg, 0, 0, bg.naturalWidth, bg.naturalHeight, ox, oy, mapW, mapH);
    ctx.fillStyle = "rgba(3,2,8,.22)";
    ctx.fillRect(ox, oy, mapW, mapH);
    globalThis.__VOZ_DEV__?.editor?.drawWorldMinimapOverlay?.(ctx, { w, h, world: this.world, scale, ox, oy });
    const shippedProps = MapOverridesModule.worldMapOverride(state2.regionIndex)?.props || [];
    for (const prop of shippedProps) { ctx.fillStyle = "#d8a7ff"; ctx.fillRect(ox + prop.x * scale - 1, oy + prop.y * scale - 1, 3, 3); }
    const marker = (entity) => {
      const mx = ox + entity.x * scale, my = oy + entity.y * scale;
      const colors = { npc: "#ffe39a", chest: "#55e7ff", altar: "#9d7cff", portal: "#e967ff", tower: "#ff557e" };
      let color = colors[entity.type] || "#ff4567";
      if (entity.encounter === "miniboss") color = "#ff9c55";
      if (entity.encounter === "boss1") color = "#ff4567";
      if (entity.encounter === "boss2") color = "#d232ff";
      if (entity.objective) {
        ctx.strokeStyle = "#fff2a6";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx, my, 6.3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = color;
      ctx.strokeStyle = "rgba(0,0,0,.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (entity.type === "chest") ctx.rect(mx - 2.8, my - 2.8, 5.6, 5.6);
      else if (entity.type === "portal" || entity.type === "tower") {
        ctx.moveTo(mx, my - 4);
        ctx.lineTo(mx + 4, my);
        ctx.lineTo(mx, my + 4);
        ctx.lineTo(mx - 4, my);
        ctx.closePath();
      } else ctx.arc(mx, my, entity.type === "encounter" ? 3.5 : 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
    };
    this.entities.forEach(marker);
    const px = ox + state2.position.x * scale, py = oy + state2.position.y * scale;
    ctx.fillStyle = ROUTES[state2.route].color;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, 4.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.8)";
    ctx.lineWidth = 1;
    ctx.strokeRect(ox + this.camera.x * scale, oy + this.camera.y * scale, Math.min(mapW, this.canvas.width * scale), Math.min(mapH, this.canvas.height * scale));
    ctx.strokeStyle = "rgba(255,255,255,.48)";
    ctx.strokeRect(ox + 0.5, oy + 0.5, mapW - 1, mapH - 1);
  }
};
export {AssetCache};
