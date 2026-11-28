/* Registered module: home-design-collection */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("home-design-collection", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  "use strict";
  const V = window.V, H = V.Homestead, C = V.Cozy, G = V.HomeLiving, R = V.Rooms, W = V.World, T = 48, esc = V.escape;
  const rows = [
    ["canopy", "Cama de dossel \xB7 linho", "Quarto", 96, "bed", "bed", 2.8],
    ["rounded-bed", "Cama estofada \xB7 petr\xF3leo", "Quarto", 84, "bed", "bed", 2.6],
    ["drawer-daybed", "Cama de dia com gavetas", "Quarto", 74, "bed", "bed", 2.6],
    ["platform-bed", "Cama baixa \xB7 terracota", "Quarto", 78, "bed", "bed", 2.7],
    ["carved-ivory", "Cama imperial \xB7 algod\xE3o", "Quarto", 88, "bed", "bed", 2.7],
    ["loft-study", "Cama suspensa com estudo", "Quarto", 108, "bed", "bed", 2.9],
    ["vanity", "Penteadeira de nogueira", "Quarto", 58, "mirror", "storage", 2.4],
    ["glass-cabinet", "Cristaleira de carvalho", "Sala", 68, "cupboard", "storage", 2.5],
    ["kitchen-island", "Ilha de cozinha com bancos", "Cozinha", 85, "table", "food", 2.8],
    ["asymmetric-books", "Estante jardim", "Estudo", 72, "bookshelf", "study", 2.7],
    ["rattan-chair", "Poltrona de palhinha \xB7 creme", "Sala", 44, "chair", "seat", 2.2],
    ["record-sideboard", "Aparador com toca-discos", "Sala", 78, "shelf", "storage", 2.7],
    ["curved-sofa", "Sof\xE1 curvo \xB7 mar profundo", "Sala", 82, "sofa", "seat", 2.9],
    ["quilted-chair", "Poltrona capiton\xEA \xB7 barro", "Sala", 52, "chair", "seat", 2.3],
    ["oval-dining", "Jantar oval com quatro cadeiras", "Sala", 94, "table", "food", 3],
    ["nursery", "Ber\xE7o de carvalho", "Quarto", 72, "bed", "decor", 2.4],
    ["storage-bench", "Banco-ba\xFA \xB7 verde", "Quarto", 43, "bench", "storage", 2.3],
    ["tiled-fireplace", "Lareira de azulejos e livros", "Sala", 88, "fireplace", "light", 2.7],
    ["arched-mirror", "Espelho de arco \xB7 lat\xE3o", "Decora\xE7\xE3o", 42, "mirror", "decor", 2.3],
    ["woven-wardrobe", "Arm\xE1rio de nogueira e trama", "Quarto", 92, "wardrobe", "storage", 2.7],
    ["secretary", "Escrivaninha-secret\xE1ria \xB7 creme", "Estudo", 73, "desk", "study", 2.5],
    ["botanic-console", "Aparador bot\xE2nico", "Sala", 46, "shelf", "plant", 2.5],
    ["lamp-table", "Mesa lateral com abajur", "Sala", 32, "lamp", "light", 2.1],
    ["linen-ottoman", "Pufe de linho com manta", "Sala", 35, "chair", "seat", 2.1],
    ["cape-window", "Janela em arco \xB7 costa do Cabo", "Decora\xE7\xE3o", 38, "window", "decor", 2.5],
    ["garden-window", "Janela com cortina \xB7 jardim", "Decora\xE7\xE3o", 34, "window", "decor", 2.4],
    ["rain-window", "Janela de nogueira \xB7 floresta chuvosa", "Decora\xE7\xE3o", 36, "window", "decor", 2.4],
    ["night-window", "Janela de linho \xB7 cidade \xE0 noite", "Decora\xE7\xE3o", 39, "window", "decor", 2.5],
    ["sunrise-window", "Janela com venezianas \xB7 amanhecer", "Decora\xE7\xE3o", 40, "window", "decor", 2.6],
    ["meadow-window", "Janela panor\xE2mica \xB7 campo florido", "Decora\xE7\xE3o", 42, "window", "decor", 2.7],
    ["jute-rug", "Tapete oval de juta", "Decora\xE7\xE3o", 24, "rug", "rug", 3],
    ["teal-kilim", "Tapete kilim \xB7 mar e areia", "Decora\xE7\xE3o", 29, "rug", "rug", 3],
    ["ivory-rug", "Tapete redondo de l\xE3", "Decora\xE7\xE3o", 27, "rug", "rug", 2.9],
    ["vintage-rug", "Tapete persa \xB7 terracota", "Decora\xE7\xE3o", 34, "rug", "rug", 3.1],
    ["navy-runner", "Passadeira \xB7 anil e ouro", "Decora\xE7\xE3o", 25, "rug", "rug", 3.2],
    ["sage-entry", "Tapete meia-lua \xB7 s\xE1lvia", "Decora\xE7\xE3o", 22, "rug", "rug", 2.6],
    ["botanical-prints", "Tr\xEDptico de bot\xE2nica", "Decora\xE7\xE3o", 31, "picture", "decor", 2.5],
    ["harbor-painting", "Quadro \xB7 porto do Cabo", "Decora\xE7\xE3o", 35, "picture", "decor", 2.5],
    ["walnut-clock", "Rel\xF3gio de nogueira", "Decora\xE7\xE3o", 27, "clock", "decor", 1.9],
    ["wall-books", "Prateleira de livros e folhas", "Estudo", 32, "bookshelf", "study", 2.3],
    ["hanging-fern", "Samambaia suspensa", "Decora\xE7\xE3o", 24, "plant", "plant", 2.1],
    ["double-sconce", "Arandela dupla de lat\xE3o", "Decora\xE7\xE3o", 33, "lamp", "light", 2.1],
    ["woven-baskets", "Cestos de fibra natural", "Decora\xE7\xE3o", 22, "basket", "storage", 2],
    ["pottery-vases", "Vasos de cer\xE2mica e flores secas", "Decora\xE7\xE3o", 25, "vase", "decor", 2.2],
    ["shoe-bench", "Sapateira com almofada de linho", "Sala", 37, "bench", "storage", 2.3],
    ["coat-stand", "Cabideiro de nogueira", "Sala", 31, "coat", "storage", 2.2],
    ["pottery-cupboard", "Arm\xE1rio-vitrine \xB7 cer\xE2micas", "Sala", 61, "cupboard", "storage", 2.4],
    ["tea-tray", "Bandeja de ch\xE1 \xB7 folhas", "Cozinha", 21, "tea", "food", 1.8]
  ];
  const descriptions = { bed: "Uma nova cama para dormir at\xE9 a manh\xE3.", seat: "Um convite para sentar e descansar.", study: "Livros e espa\xE7o para suas leituras.", storage: "Guarde e organize a mob\xEDlia da casa.", food: "Um lugar para cuidar da alimenta\xE7\xE3o.", light: "Acenda ou apague a luz acolhedora.", plant: "Folhagens e materiais naturais para a casa.", rug: "Uma trama no piso que deixa o caminho livre.", decor: "Detalhes de madeira, tecido e cer\xE2mica para compor sua casa." };
  const D = V.HomeDesign = {
    images: {},
    items: rows.map(([id, name, category, price, word, action, size], index) => ({ id: "design-" + id, name, category, price, word, action, size, family: index < 24 ? "home-design" : "home-decor", prop: index % 24, solid: !["rug", "decor"].includes(action) && !["picture", "window", "clock", "plant"].includes(word) && index !== 39 && index !== 41, description: descriptions[action] })),
    load() {
      if (this.ready) return this.ready;
      this.ready = Promise.all(Object.entries(V.HomeDesignArtData).map(([key, data]) => new Promise((resolve) => {
        const image = V.Assets.image();
        this.images[key] = image;
        image.onload = image.onerror = resolve;
        image.src = data.file + "?v=20261110-design1";
        V.AssetLoader.register(image, resolve);
      })));
      return this.ready;
    },
    art(c, sheet, index, x, y, w, h = w) {
      const image = this.images[sheet], f = V.HomeDesignArtData[sheet]?.frames[index];
      if (!image?.naturalWidth || !f) return false;
      const scale = Math.min(w / f.w, h / f.h), dw = f.w * scale, dh = f.h * scale;
      c.save();
      c.imageSmoothingEnabled = true;
      c.drawImage(image, f.x, f.y, f.w, f.h, Math.round(x + (w - dw) / 2), Math.round(y + h - dh), Math.round(dw), Math.round(dh));
      c.restore();
      return true;
    },
    item(o) {
      return this.items.find((i) => i.family === o?.scene?.family && i.prop === o.scene.prop);
    },
    hydrate(m) {
      for (const o of m?.objects || []) {
        const item2 = this.item(o);
        if (!item2) continue;
        o.household = true;
        o.homeMap = m.id;
        o.label = item2.name;
        o.interactionRange = 100;
        o.scene.hostDecor = "solid-" + o.id;
        if (o.playerFurniture && m.solids.some((s) => s.owner === o.id)) continue;
        m.solids = m.solids.filter((s) => s.owner !== o.id && s.owner !== o.scene.hostDecor);
        if (item2.solid) {
          const z = (o.scene.size || item2.size) * T;
          m.solids.push({ x: o.x - z * 0.32, y: o.y - 25, w: z * 0.64, h: 20, owner: o.scene.hostDecor });
        }
      }
      G.filterStored(m);
    },
    finishes(id) {
      return H.ensure()?.roomFinishes?.[id] || { rooms: {}, windows: {}, defaultWindow: 1 };
    },
    floorOptions() {
      return V.sceneAssets.filter((i) => i.family === "floor" && (i.index < 16 || (i.index >= 200 && i.index < 232 || i.index >= 240 && i.index < 254)));
    },
    wallpapers: [["linen", "Linho e carvalho", "#e7dfcb", "#80664b"], ["sage", "Bot\xE2nica \xB7 s\xE1lvia", "#c8d0b9", "#54705c"], ["stripe", "Listras \xB7 creme e ouro", "#ece0c3", "#b79c6a"], ["clay", "Argila e nogueira", "#d7b3a0", "#89654d"], ["night", "Geometria \xB7 azul profundo", "#647f83", "#d1bd85"], ["rose", "Floral \xB7 rosa antigo", "#ddc1b5", "#9e7d76"], ["ivory", "Pain\xE9is \xB7 marfim", "#ece7da", "#ac9b7e"], ["olive", "Oliva e palhinha", "#b2bc98", "#727d59"]],
    windowNames: ["Arco de nogueira \xB7 costa do Cabo", "Linho creme \xB7 jardim", "Nogueira \xB7 floresta chuvosa", "Cortina dourada \xB7 cidade \xE0 noite", "Venezianas \xB7 amanhecer nas montanhas", "Carvalho panor\xE2mico \xB7 campo florido"],
    paper(c, x, y, w, h, key = "linen") {
      const style = this.wallpapers.find((p) => p[0] === key) || this.wallpapers[0];
      c.save();
      c.beginPath();
      c.rect(x, y, w, h);
      c.clip();
      c.fillStyle = style[2];
      c.fillRect(x, y, w, h);
      c.strokeStyle = style[3] + "45";
      c.lineWidth = 1;
      if (key === "stripe") for (let xx = x + 9; xx < x + w; xx += 16) {
        c.fillStyle = style[3] + "35";
        c.fillRect(xx, y, 4, h);
      }
      else if (["sage", "rose"].includes(key)) for (let yy = y + 12; yy < y + h; yy += 24) for (let xx = x + 12 + Math.round((yy - y) / 24) % 2 * 12; xx < x + w; xx += 26) {
        c.beginPath();
        c.moveTo(xx, yy + 6);
        c.quadraticCurveTo(xx - 7, yy - 2, xx, yy - 8);
        c.quadraticCurveTo(xx + 8, yy - 2, xx, yy + 2);
        c.stroke();
      }
      else if (key === "night") for (let yy = y; yy < y + h; yy += 24) for (let xx = x; xx < x + w; xx += 24) {
        c.beginPath();
        c.moveTo(xx + 12, yy);
        c.lineTo(xx + 24, yy + 12);
        c.lineTo(xx + 12, yy + 24);
        c.lineTo(xx, yy + 12);
        c.closePath();
        c.stroke();
      }
      else if (key === "ivory") for (let xx = x + 8; xx < x + w; xx += 64) c.strokeRect(xx, y + 8, 48, Math.max(8, h - 16));
      else for (let xx = x; xx < x + w; xx += 5) {
        c.fillStyle = "#ffffff0c";
        c.fillRect(xx, y, 1, h);
      }
      c.fillStyle = style[3];
      c.fillRect(x, y + h - 13, w, 13);
      c.fillStyle = "#ead7ac";
      c.fillRect(x, y + h - 14, w, 2);
      c.fillRect(x, y, w, 3);
      c.restore();
    },
    saveFinishes(id, draft) {
      if (!H.owned(id)) return false;
      const d = C.layouts[id];
      if (!d?.construction?.rooms.length) return false;
      const floors = new Set(this.floorOptions().map((i) => i.index)), papers = new Set(this.wallpapers.map((i) => i[0]));
      if (!Number.isInteger(draft.defaultWindow) || draft.defaultWindow < 0 || draft.defaultWindow > 5) throw Error("Escolha uma vista v\xE1lida.");
      for (const [room, f] of Object.entries(draft.rooms)) {
        if (!d.construction.rooms.some((r) => r.id === room) || !floors.has(f.floor) || !papers.has(f.paper)) throw Error("Escolha um piso e uma parede v\xE1lidos.");
      }
      for (const [id2, index] of Object.entries(draft.windows)) if (!d.homeWindows?.some((w) => w.id === id2) || !Number.isInteger(index) || index < 0 || index > 5) throw Error("Escolha uma janela v\xE1lida.");
      const h = H.ensure();
      h.roomFinishes ||= {};
      h.roomFinishes[id] = JSON.parse(JSON.stringify(draft));
      W.maps[id].cache = null;
      V.Save.save();
      return true;
    },
    open(id = G.room()) {
      if (!H.owned(id)) return H.property(id);
      const d = C.layouts[id], rooms = d?.construction?.rooms || [];
      if (!rooms.length) return;
      const draft = JSON.parse(JSON.stringify(this.finishes(id)));
      draft.rooms ||= {};
      draft.windows ||= {};
      draft.defaultWindow ??= 1;
      const paper = V.ResidentialPlans.palettes[d.homeInterior?.palette]?.paper || "linen";
      for (const r of rooms) draft.rooms[r.id] ||= { floor: r.floorStyle, paper };
      for (const key of Object.keys(draft.windows)) if (!d.homeWindows?.some((w) => w.id === key)) delete draft.windows[key];
      let selected = rooms[0].id;
      V.UI.modal("Ateli\xEA da casa", "PISOS \xB7 PAREDES \xB7 VISTAS", `<p>Escolha os acabamentos de cada c\xF4modo. A pr\xE9via mostra sua combina\xE7\xE3o. Salve para aplicar nesta casa.</p><div class="home-design-layout"><canvas id="home-finish-preview" width="600" height="390" aria-label="Pr\xE9via de piso, papel de parede e janela"></canvas><section><label class="field">C\xF4modo<select id="home-finish-room">${rooms.map((r) => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join("")}</select></label><label class="field">Piso<select id="home-finish-floor">${this.floorOptions().map((f) => `<option value="${f.index}">${esc(f.name)}</option>`).join("")}</select></label><label class="field">Parede e papel de parede<select id="home-finish-paper">${this.wallpapers.map((p) => `<option value="${p[0]}">${p[1]}</option>`).join("")}</select></label><label class="field">Moldura e vista das novas janelas<select id="home-finish-window">${this.windowNames.map((n, i) => `<option value="${i}">${n}</option>`).join("")}</select></label><p class="muted">Use \u201CConstruir\u201D para encaixar janelas nas paredes. Janelas decorativas e quadros tamb\xE9m est\xE3o na loja.</p>${(d.homeWindows || []).map((w, i) => `<label class="field">Janela ${i + 1}<select data-finish-window="${esc(w.id)}">${this.windowNames.map((n, j) => `<option value="${j}" ${j === (draft.windows[w.id] ?? w.view ?? draft.defaultWindow) ? "selected" : ""}>${n}</option>`).join("")}</select></label>`).join("")}</section></div><p id="home-finish-status" role="status"></p>`, '<button id="home-finish-cancel" class="secondary">Voltar</button><button id="home-finish-save" class="primary">Salvar acabamentos</button>', true);
      const paint = () => {
        const c = V.$("#home-finish-preview").getContext("2d"), f = draft.rooms[selected];
        c.clearRect(0, 0, 600, 390);
        c.fillStyle = "#263f37";
        c.fillRect(0, 0, 600, 390);
        for (let yy = 125; yy < 390; yy += T) for (let xx = 0; xx < 600; xx += T) C.prop(c, "floor", f.floor, xx, yy, T);
        this.paper(c, 0, 0, 600, 135, f.paper);
        this.art(c, "home-decor", draft.defaultWindow, 208, 10, 184, 174);
        this.art(c, "home-design", 12, 64, 193, 240, 165);
        this.art(c, "home-decor", 7, 264, 285, 240, 100);
        this.art(c, "home-design", 22, 405, 208, 115, 149);
      };
      const fields = () => {
        V.$("#home-finish-floor").value = draft.rooms[selected].floor;
        V.$("#home-finish-paper").value = draft.rooms[selected].paper;
        V.$("#home-finish-window").value = draft.defaultWindow;
        paint();
      };
      fields();
      V.$("#home-finish-room").onchange = (e) => {
        selected = e.target.value;
        fields();
      };
      V.$("#home-finish-floor").onchange = (e) => {
        draft.rooms[selected].floor = +e.target.value;
        paint();
      };
      V.$("#home-finish-paper").onchange = (e) => {
        draft.rooms[selected].paper = e.target.value;
        paint();
      };
      V.$("#home-finish-window").onchange = (e) => {
        draft.defaultWindow = +e.target.value;
        paint();
      };
      V.$$("[data-finish-window]").forEach((s) => s.onchange = () => {
        draft.windows[s.dataset.finishWindow] = +s.value;
      });
      V.$("#home-finish-cancel").onclick = () => H.homeShop("buy", id);
      V.$("#home-finish-save").onclick = () => {
        try {
          this.saveFinishes(id, draft);
          H.homeShop("buy", id);
          V.UI.toast("Acabamentos salvos nesta casa.");
        } catch (e) {
          V.$("#home-finish-status").textContent = e.message;
        }
      };
    }
  };
  H.catalog.push(...D.items);
  V.sceneAssets.push(...D.items.map((i) => ({ family: i.family, index: i.prop, id: i.id, name: i.name, description: i.description, category: "moradia", layer: i.action === "rug" ? "ground" : "object", solid: i.solid, size: i.size, interaction: i.action, solidFootprint: i.solid ? { x: 0.16, y: 0.73, width: 0.68, height: 0.19 } : [] })));
  V.Assets.addLoader("home-design-collection:load:1", function() {
    return D.load();
  });
  V.AssetLoader.addGroupRule("home-design-collection:group:1", function(key) {
    if (/^assets\/homestead\/home-(?:design|decor)\./.test(key)) return "home-collection";
    return void 0;
  });
  V.MapAssets.addGroupRule("home-design-collection:groups:1", function(m, out) {
    if (m?.fossilHall || m?.id === "cape-market" || m?.objects?.some((o) => D.item(o)) || m?.decor?.some((o) => ["home-design", "home-decor"].includes(o.family))) out.push("home-collection");
  });
  const prop = C.prop.bind(C);
  C.prop = function(c, family, index, x, y, size, ...args) {
    if (["home-design", "home-decor"].includes(family)) return D.art(c, family, index, x, y, size);
    return prop(c, family, index, x, y, size, ...args);
  };
  const item = G.item.bind(G);
  G.item = (o) => D.item(o) || item(o);
  const bed = H.isBed;
  H.isBed = (o) => D.item(o)?.action === "bed" || bed(o);
  const sleeper = G.drawSleeper.bind(G);
  G.drawSleeper = function(c, id, bed2, cam, time) {
    const i = D.item(bed2);
    if (i?.action === "bed") {
      const z = (bed2.scene.size || i.size) * T, offset = [0.31, 0.34, 0.31, 0.31, 0.32, 0.78][i.prop];
      return sleeper(c, id, { ...bed2, y: bed2.y + z * (0.43 - offset) }, cam, time);
    }
    return sleeper(c, id, bed2, cam, time);
  };
  const install = V.HomeConstruction.install.bind(V.HomeConstruction);
  V.HomeConstruction.install = function(id, value) {
    const out = install(id, value);
    for (const o of W.maps[id]?.objects || []) if (o.type === "home-window") o.homeMap = id;
    return out;
  };
  const hydrate = V.City.hydrate.bind(V.City);
  V.City.hydrate = function(m) {
    hydrate(m);
    D.hydrate(m);
  };
  const apply = H.applyFurniture.bind(H);
  H.applyFurniture = function(...args) {
    const out = apply(...args);
    for (const m of Object.values(W.maps)) D.hydrate(m);
    return out;
  };
  const ground = C.ground.bind(C);
  C.ground = function(m) {
    const out = ground(m);
    for (const o of m.objects.filter((o2) => !o2.playerFurniture && D.item(o2)?.action === "rug")) {
      const z = (o.scene.size || D.item(o).size) * T;
      V.ObjectEditing.scene(m.cache.getContext("2d"), o, { x: 0, y: 0 }, () => C.prop(m.cache.getContext("2d"), o.scene.family, o.scene.prop, o.x - z / 2, o.y - z * 0.99, z));
    }
    return out;
  };
  V.Hooks.around(V.Cozy, "drawObject", "home-design-collection:drawObject:1", (draw) => function(c, o, cam, t) {
    if (o.type === "home-window") {
      const w = o.homeWindow, id = o.homeMap || W.current?.id, d = W.maps[id]?.design, wall = d && R.structure(d).rooms.flatMap((r) => R.segments(r)).find((s) => s.room === w.room && s.key === w.wall);
      if (wall) {
        const f = D.finishes(id), index = f.windows?.[w.id] ?? f.defaultWindow ?? 1;
        c.save();
        c.translate(o.x - (cam?.x || 0), o.y - (cam?.y || 0));
        if (Math.abs(wall.b[1] - wall.a[1]) > Math.abs(wall.b[0] - wall.a[0])) c.transform(0.48, 0.25, 0, 1, 0, 0);
        D.art(c, "home-decor", index, -w.width * 0.64, -w.width * 1.12, w.width * 1.28, w.width * 1.1);
        c.restore();
        return;
      }
    }
    const i = D.item(o);
    if (!i || o.playerFurniture) return draw(c, o, cam, t);
    if (i.action === "rug") return;
    const z = (o.scene.size || i.size) * T, x = o.x - cam.x, y = o.y - cam.y;
    C.prop(c, i.family, i.prop, x - z / 2, y - z * 0.99, z);
    if (i.action === "light" && H.ensure()?.lamps[o.id]) {
      c.save();
      const g = c.createRadialGradient(x, y - z * 0.6, 4, x, y - z * 0.6, z * 0.6);
      g.addColorStop(0, "#f8d68c60");
      g.addColorStop(1, "#f8d68c00");
      c.fillStyle = g;
      c.fillRect(x - z, y - z, z * 2, z * 1.5);
      c.restore();
    }
    if (W.nearest?.id === o.id) V.Living.marker(c, x, y, "E", "#e7cb8e");
  });
  const drawGround = R.drawGround.bind(R);
  R.drawGround = function(m) {
    const saved = D.finishes(m.id).rooms || {}, old = m.design.construction.rooms.map((r) => r.floorStyle);
    try {
      for (const r of m.design.construction.rooms) if (saved[r.id]) r.floorStyle = saved[r.id].floor;
      return drawGround(m);
    } finally {
      m.design.construction.rooms.forEach((r, i) => r.floorStyle = old[i]);
    }
  };
  const decor = V.SceneDesign.drawDecor.bind(V.SceneDesign);
  V.SceneDesign.drawDecor = function(c, o, cam = { x: 0, y: 0 }) {
    if (o.family === "room-wall") {
      const s = o.wall, f = D.finishes(W.current?.id).rooms?.[s.room];
      if (f) {
        const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], len = Math.hypot(dx, dy), h = Math.abs(dx) >= Math.abs(dy) ? 72 : 24;
        c.save();
        c.translate(s.a[0] - cam.x, s.a[1] - cam.y);
        c.rotate(Math.atan2(dy, dx));
        D.paper(c, 0, -h, len, h + 5, f.paper);
        c.restore();
        return;
      }
    }
    return decor(c, o, cam);
  };
  const shop = H.homeShop.bind(H);
  H.homeShop = function(tab = "buy", id = G.room()) {
    return V.MapAssets.ensure(["home-collection"], "Preparando a cole\xE7\xE3o da casa", () => {
      shop(tab, id);
      if (H.owned(id)) {
        const b = document.createElement("button");
        b.id = "home-design-open";
        b.className = "secondary";
        b.textContent = "Pisos, paredes e janelas";
        b.onclick = () => D.open(id);
        V.$(".modal-footer")?.prepend(b);
      }
    });
  };
  const organize = H.organize.bind(H);
  H.organize = function(id) {
    const out = organize(id), host = V.$(".home-arrange aside");
    if (host && H.owned(id)) {
      const b = document.createElement("button");
      b.id = "home-design-arrange";
      b.className = "secondary";
      b.textContent = "Pisos, paredes e janelas";
      b.onclick = () => D.open(id);
      host.prepend(b);
    }
    return out;
  };
  V.Hooks.around(V.Game, "interact", "home-design-collection:interact:1", (next) => function(o) {
    const i = D.item(o);
    if (!i || V.modal || V.Dialogue.active) return next(o);
    V.PixCollection.collect(i.word, "Casa \xB7 " + i.name);
    switch (i.action) {
      case "bed":
        return H.sleep(o);
      case "seat":
        return V.Activities.perform("sit");
      case "storage":
        return H.homeShop("stored", G.room());
      case "study":
        V.Living.journal("readings");
        return V.Activities.perform("read", { close: false });
      case "food":
        return V.Life.panel("food");
      case "light":
        H.ensure().lamps[o.id] = !H.ensure().lamps[o.id];
        V.Save.save();
        V.UI.toast("Luz " + (H.ensure().lamps[o.id] ? "acesa." : "apagada."));
        return;
      default:
        V.UI.toast(i.description);
    }
  });
});
