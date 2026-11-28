/* Registered module: home-collection */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("home-collection", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function homeCollectionModule() {
    "use strict";
    const V = window.V, H = V.Homestead, C = V.Cozy, W = V.World, R = V.Rooms, P = V.Player, A = V.Animations, L = V.Life, T = 48, esc = V.escape;
    const entries = [
      ["bed-teal", "Cama de casal \xB7 mar\xE9", "Quarto", 58, "bed", "bed", 2.4],
      ["bed-rose", "Cama de solteiro \xB7 p\xE9tala", "Quarto", 42, "bed", "bed", 2.1],
      ["bed-bunk", "Beliche de carvalho", "Quarto", 68, "bed", "bed", 2.5],
      ["sofa-clay", "Sof\xE1 terracota", "Sala", 46, "sofa", "seat", 2.4],
      ["sofa-sage", "Sof\xE1 de canto \xB7 s\xE1lvia", "Sala", 72, "sofa", "seat", 2.6],
      ["armchair-navy", "Poltrona azul de leitura", "Sala", 30, "chair", "seat", 1.9],
      ["desk-teak", "Escrivaninha com livros", "Estudo", 38, "desk", "study", 2.2],
      ["desk-ivory", "Mesa de estudo com computador", "Estudo", 58, "desk", "study", 2.2],
      ["table-round", "Mesa redonda de jantar", "Sala", 35, "table", "food", 2.3],
      ["coffee-table", "Mesa de centro com livros", "Sala", 24, "table", "study", 1.8],
      ["bookcase-oak", "Estante aberta de carvalho", "Estudo", 42, "bookshelf", "study", 2.2],
      ["dresser-walnut", "C\xF4moda de nogueira", "Quarto", 34, "dresser", "storage", 2],
      ["wardrobe-rattan", "Arm\xE1rio de palhinha", "Quarto", 48, "wardrobe", "storage", 2.2],
      ["nightstand-oak", "Mesa de cabeceira", "Quarto", 16, "table", "storage", 1.5],
      ["entry-console", "Aparador e sapateira", "Sala", 28, "shelf", "storage", 2],
      ["lamp-rattan", "Lumin\xE1ria de palhinha", "Decora\xE7\xE3o", 22, "lamp", "light", 1.9],
      ["fridge-mint", "Geladeira verde-menta", "Cozinha", 62, "fridge", "fridge", 2.1],
      ["washer-white", "M\xE1quina de lavar", "Banheiro", 52, "washing machine", "wash", 2],
      ["bathtub-teal", "Banheira azul-petr\xF3leo", "Banheiro", 56, "bathtub", "wash", 2.5],
      ["toilet-white", "Vaso sanit\xE1rio", "Banheiro", 20, "toilet", "wash", 1.6],
      ["rug-geometry", "Tapete geom\xE9trico azul", "Decora\xE7\xE3o", 18, "rug", "rug", 2.6],
      ["rug-round", "Tapete redondo de fibras", "Decora\xE7\xE3o", 16, "rug", "rug", 2.2],
      ["plant-monstera", "Costela-de-ad\xE3o em vaso", "Decora\xE7\xE3o", 14, "plant", "plant", 1.8],
      ["plant-cactus", "Cacto em vaso cer\xE2mico", "Decora\xE7\xE3o", 12, "plant", "plant", 1.7]
    ];
    const actions = { bed: "Dormir at\xE9 a manh\xE3", seat: "Sentar e descansar", study: "Abrir o caderno de leituras", food: "Consultar alimenta\xE7\xE3o", storage: "Guardar, escolher e reorganizar sua mob\xEDlia", light: "Ligar ou apagar a lumin\xE1ria", fridge: "Consultar os alimentos", wash: "Usar por alguns segundos", rug: "Tapete leve para compor o ambiente", plant: "Um toque de verde no ambiente" };
    const newItems = entries.map(([id, name, category, price, word, action, size], prop2) => ({ id, name, category, price, word, action, size, family: "home-plus", prop: prop2, solid: action !== "rug", description: actions[action] }));
    H.catalog.push(...newItems);
    for (const item of H.catalog) if (!item.category) item.category = item.id.startsWith("music-") ? "Instrumentos" : ["bed", "wardrobe"].includes(item.id) ? "Quarto" : ["fridge", "stove", "sink", "pantry"].includes(item.id) ? "Cozinha" : ["shower", "basin"].includes(item.id) ? "Banheiro" : item.id === "plant" ? "Decora\xE7\xE3o" : "Sala";
    V.AdventureArt["home-collection"] = "assets/homestead/home-collection.webp";
    V.sceneAssets.push(...newItems.map((i) => ({ family: i.family, index: i.prop, id: i.id, name: i.name, description: i.description, category: "moradia", layer: i.solid ? "object" : "ground", solid: i.solid, size: i.size, interaction: i.action, solidFootprint: i.solid ? { x: 0.16, y: 0.73, width: 0.68, height: 0.19 } : [] })));
    const G = V.HomeLiving = {
      items: newItems,
      cartMap: null,
      item(o) {
        return o?.scene?.family === "home-plus" ? newItems[o.scene.prop] : o?.furnitureItem ? H.catalog.find((i) => i.id === o.furnitureItem) : o?.scene?.family === "home" ? H.catalog.find((i) => i.family === "home" && i.prop === (o.scene.prop < 16 ? Math.floor(o.scene.prop / 4) * 4 : o.scene.prop)) : H.catalog.find((i) => i.family === o?.scene?.family && i.prop === o?.scene?.prop) || null;
      },
      hydrate(m) {
        if (!m?.objects) return;
        for (const o of m.objects) {
          const item = this.item(o);
          if (o.scene?.family !== "home-plus" || !item) continue;
          m.solids = m.solids.filter((s) => s.owner !== o.id);
          o.household = true;
          o.homeMap = m.id;
          o.label = item.name;
          o.interactionRange = 100;
          o.scene.hostDecor = "solid-" + o.id;
          if (item.solid && !m.solids.some((s) => s.owner === o.scene.hostDecor)) {
            const size = (o.scene.size || item.size) * T;
            m.solids.push({ x: o.x - size * 0.32, y: o.y - 30, w: size * 0.64, h: 17, owner: o.scene.hostDecor });
          }
        }
        this.filterStored(m);
      },
      filterStored(m) {
        const hidden = new Set(H.ensure()?.hidden[m.id] || []);
        if (!hidden.size) return;
        const owners = new Set(m.objects.filter((o) => hidden.has(o.id)).flatMap((o) => [o.id, o.scene?.hostDecor, "solid-" + o.id, "host-" + o.id]));
        m.objects = m.objects.filter((o) => !hidden.has(o.id));
        m.solids = m.solids.filter((s) => !owners.has(s.owner));
        for (const [id, a] of m.anchors || []) if (hidden.has(a.object?.id)) m.anchors.delete(id);
      },
      room() {
        const id = W.current?.id;
        return H.owned(id) ? id : H.ensure()?.active || null;
      },
      cart() {
        let b = V.$("#home-cart");
        if (!b) {
          b = document.createElement("button");
          b.id = "home-cart";
          b.className = "home-cart";
          b.innerHTML = '<svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path d="M3 5h4l4 16h15l3-12H9M12 15h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="27" r="2" fill="currentColor"/><circle cx="24" cy="27" r="2" fill="currentColor"/></svg><span>Minha casa<small>Comprar \xB7 vender \xB7 guardar</small></span>';
          b.title = "Gerenciar os m\xF3veis e as compras da casa";
          b.setAttribute("aria-label", "Minha casa: comprar, vender e guardar m\xF3veis");
          b.onclick = () => H.homeShop("buy", this.room());
          V.$("#stage").append(b);
        }
        b.hidden = V.Game.screen !== "game" || V.Game.mode !== "explore" || V.SceneEditor.active || !H.home(W.current?.id) && W.current?.id !== "interior-horizonte-1" || !!H.ensure()?.sleep;
      },
      drawSleeper(ctx, id, bed, cam = { x: 0, y: 0 }, time = performance.now() / 1e3) {
        const key = "daily-" + id, img = V.Assets.images[key], rig = V.SpriteFrames.layouts[key];
        if (!rig || !V.Assets.ready(img)) {
          if (V.AssetLoader.byImage.get(img)?.state === "deferred") V.AssetLoader.request(img);
          return;
        }
        const f = V.settings.reducedMotion ? 0 : Math.floor(time * 3) % 6, b = rig.rows[1].bounds[f], size = (bed.scene.size || 2.3) * T, scale = Math.min(size * 0.69 / (b[2] - b[0]), size * 0.29 / (b[3] - b[1])), cx = bed.x - cam.x, cy = bed.y - cam.y - size * (bed.scene.family === "home-plus" && bed.scene.prop === 2 ? 0.31 : 0.43);
        ctx.save();
        ctx.translate(cx - (b[2] - b[0]) * scale / 2 - b[0] * scale, cy - (b[3] - b[1]) * scale / 2 - b[1] * scale);
        ctx.drawImage(img, f * rig.cell, rig.cell, rig.cell, rig.cell, 0, 0, rig.cell * scale, rig.cell * scale);
        ctx.restore();
      },
      sleepPreview() {
        const canvas = V.$("#home-sleep-bed"), s = H.ensure()?.sleep;
        if (!canvas || !s) return;
        const bed = W.maps[s.map]?.objects.find((o) => o.id === s.bed);
        if (!bed) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#203c35";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#b39a76";
        ctx.fillRect(16, 16, canvas.width - 32, canvas.height - 32);
        const b = { ...bed, x: canvas.width / 2, y: canvas.height - 22, scene: { ...bed.scene, size: 4.5 } };
        const z = b.scene.size * T;
        C.prop(ctx, b.scene.family, b.scene.prop, b.x - z / 2, b.y - z * 0.99, z);
        this.drawSleeper(ctx, V.state.character, b);
      },
      paint() {
        const now = performance.now() / 1e3;
        for (const [key, a] of V.City.appliances) if (a.startedAt != null && now - a.startedAt >= a.duration) V.City.appliances.delete(key);
        this.cart();
        this.sleepPreview();
      }
    };
    const ensure = H.ensure.bind(H);
    H.ensure = function() {
      const h = ensure();
      if (h) {
        if (!h.hidden || typeof h.hidden !== "object" || Array.isArray(h.hidden)) h.hidden = {};
        if (!h.lamps || typeof h.lamps !== "object" || Array.isArray(h.lamps)) h.lamps = {};
      }
      return h;
    };
    H.isBed = (o) => o?.scene?.family === "home" && o.scene.prop === 16 || o?.scene?.family === "home-plus" && newItems[o.scene.prop]?.action === "bed";
    const prop = C.prop.bind(C);
    C.prop = function(ctx, family, index, x, y, size, materials) {
      if (family !== "home-plus") return prop(ctx, family, index, x, y, size, materials);
      const img = V.Assets.images["home-collection"];
      if (V.Assets.ready(img)) ctx.drawImage(img, index % 6 * 256, Math.floor(index / 6) * 256, 256, 256, Math.round(x), Math.round(y), size, size);
    };
    const hydrate = V.City.hydrate.bind(V.City);
    V.City.hydrate = function(m) {
      hydrate(m);
      G.hydrate(m);
    };
    const apply = H.applyFurniture.bind(H);
    H.applyFurniture = function(...args) {
      const result = apply(...args);
      for (const m of Object.values(W.maps)) G.hydrate(m);
      return result;
    };
    const ground = C.ground.bind(C);
    C.ground = function(m) {
      ground(m);
      const ctx = m.cache.getContext("2d");
      for (const o of m.objects.filter((o2) => o2.scene?.family === "home-plus" && !newItems[o2.scene.prop]?.solid)) {
        const z = (o.scene.size || 2) * T;
        V.ObjectEditing.scene(ctx, o, { x: 0, y: 0 }, () => C.prop(ctx, "home-plus", o.scene.prop, o.x - z / 2, o.y - z * 0.99, z));
      }
    };
    V.Hooks.around(V.Cozy, "drawObject", "home-collection:drawObject:1", (drawObject) => function(ctx, o, cam, t) {
      if (o.scene?.family !== "home-plus") return drawObject(ctx, o, cam, t);
      const item = newItems[o.scene.prop], z = (o.scene.size || item.size) * T, x = o.x - cam.x, y = o.y - cam.y;
      if (item.solid) C.prop(ctx, "home-plus", o.scene.prop, x - z / 2, y - z * 0.99, z);
      const active = V.City.appliances.get(o.id), elapsed = active?.startedAt != null ? performance.now() / 1e3 - active.startedAt : Infinity;
      if (active && elapsed < active.duration && !V.settings.reducedMotion) {
        ctx.save();
        ctx.globalAlpha = Math.sin(elapsed / active.duration * Math.PI) * 0.55;
        ctx.strokeStyle = "#a3d9d2";
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(x - 14 + i * 10, y - z * 0.44 - elapsed * 8 - i % 2 * 5, 3 + i % 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (item.action === "light" && H.ensure()?.lamps[o.id]) {
        ctx.save();
        const g = ctx.createRadialGradient(x, y - z * 0.67, 4, x, y - z * 0.67, z * 0.48);
        g.addColorStop(0, "#ffdf9470");
        g.addColorStop(1, "#ffdf9400");
        ctx.fillStyle = g;
        ctx.fillRect(x - z / 2, y - z, z, z);
        ctx.restore();
      }
      if (W.nearest?.id === o.id) V.Living.marker(ctx, x, y, "E", "#e7cb8e");
    });
    H.buyFurniture = function(id) {
      const item = this.catalog.find((c) => c.id === id), h = this.ensure(), l = L.ensure();
      if (!item || !h.owned.length || l.coins < item.price || !this.owned(W.current?.id) && !this.isOpen("interior-shopping")) return false;
      l.coins -= item.price;
      h.furniture[id] = (h.furniture[id] || 0) + 1;
      V.PixCollection.collect(item.word, "Mob\xEDlia \xB7 " + item.name);
      V.Save.save();
      L.hud();
      return true;
    };
    H.sellFurniture = function(id) {
      const item = this.catalog.find((c) => c.id === id), h = this.ensure();
      if (!item || !(h.furniture[id] > 0)) return false;
      h.furniture[id]--;
      const value = Math.max(1, Math.floor(item.price * 0.6));
      L.ensure().coins += value;
      V.Save.save();
      L.hud();
      V.UI.toast(item.name + " vendido por " + value + " moedas.");
      return true;
    };
    H.storeObject = function(map, key) {
      if (!this.owned(map)) return false;
      const m = W.maps[map], o = m?.objects.find((o2) => o2.id === key || o2.playerFurniture === key), item = G.item(o);
      if (!o || !item) return false;
      if (this.ensure().sleep?.bed === o.id) {
        V.UI.toast("Acorde antes de guardar a cama.");
        return false;
      }
      if (o.playerFurniture) return this.removeFurniture(map, o.playerFurniture);
      const h = this.ensure();
      h.hidden[map] ||= [];
      if (h.hidden[map].includes(o.id)) return false;
      h.hidden[map].push(o.id);
      h.furniture[item.id] = (h.furniture[item.id] || 0) + 1;
      this.applyFurniture(map);
      m.cache = null;
      V.Save.save();
      return true;
    };
    H.homeShop = function(tab = "buy", map = G.room()) {
      const h = this.ensure(), l = L.ensure(), owned = map && this.owned(map), canBuy = h.owned.length && (this.owned(W.current?.id) || this.isOpen("interior-shopping")), placed = owned ? W.maps[map].objects.filter((o) => (o.household || o.playerFurniture) && G.item(o)) : [];
      this.shopTab = tab;
      G.cartMap = map;
      V.UI.modal("Casa e decora\xE7\xE3o", map && W.maps[map] ? W.maps[map].name : "M\xD3VEIS \xB7 ENTREGA E ARMAZENAMENTO", `<div class="home-shop-heading"><span class="home-wallet">${l.coins} moedas</span><span>${this.owned(W.current?.id) ? "Entrega em casa \xB7 dispon\xEDvel a qualquer hora" : this.isOpen("interior-shopping") ? "Loja aberta \xB7 8h \xE0s 20h" : "Loja fechada \xB7 reabre \xE0s 8h"}</span></div><nav class="tabs home-shop-tabs">${[["buy", "Comprar"], ["sell", "Vender"], ["stored", "Guardar e organizar"]].map(([id, label]) => `<button data-home-shop-tab="${id}" class="${id === tab ? "active" : ""}" aria-pressed="${id === tab}">${label}</button>`).join("")}</nav>${h.owned.length ? `<label class="field home-select-house">Casa<select id="home-shop-house">${h.owned.map((id) => `<option value="${id}" ${id === map ? "selected" : ""}>${esc(W.maps[id]?.name || id)}</option>`).join("")}</select></label>` : '<p class="note">Compre uma moradia para receber os m\xF3veis. Os im\xF3veis est\xE3o no bairro residencial.</p>'}${tab === "buy" ? `<div class="home-shop-filters"><label class="field">Buscar m\xF3vel<input id="home-shop-search" placeholder="Cama, sof\xE1, estante\u2026" type="search"></label><label class="field">Ambiente<select id="home-shop-category"><option value="">Todos os ambientes</option>${["Quarto", "Sala", "Cozinha", "Banheiro", "Estudo", "Decora\xE7\xE3o", "Instrumentos"].map((c) => `<option>${c}</option>`).join("")}</select></label></div><div id="home-shop-count" class="muted" role="status"></div><div class="home-catalog">${this.catalog.map((item) => `<article class="card home-furniture-card" data-home-item="${item.id}" data-category="${item.category}" data-name="${esc(item.name.toLowerCase())}"><canvas data-home-thumb="${item.id}" width="112" height="112" aria-label="${esc(item.name)}"></canvas><small>${esc(item.category)}</small><h3>${esc(item.name)}</h3><p>${esc(item.description || (item.id.startsWith("music-") ? "Toque este instrumento na sua casa." : actions[item.action] || "Organize este m\xF3vel na sua casa."))}</p><small>Guardados: ${h.furniture[item.id] || 0}</small><button data-furniture-buy="${item.id}" class="secondary" ${!canBuy || l.coins < item.price ? "disabled" : ""}>Comprar \xB7 ${item.price} moedas</button></article>`).join("")}</div>` : tab === "sell" ? `<p class="note">A venda usa uma unidade guardada e devolve 60% do pre\xE7o de compra. Para vender um m\xF3vel instalado, guarde-o primeiro.</p><div class="home-catalog">${this.catalog.filter((i) => h.furniture[i.id] > 0).map((item) => `<article class="card"><canvas data-home-thumb="${item.id}" width="112" height="112" aria-label="${esc(item.name)}"></canvas><h3>${esc(item.name)}</h3><p>Guardados: ${h.furniture[item.id]}</p><button data-furniture-sell="${item.id}" class="secondary">Vender 1 \xB7 ${Math.floor(item.price * 0.6)} moedas</button></article>`).join("") || '<div class="home-shop-empty">Nenhum m\xF3vel guardado para vender. Abra \u201CGuardar e organizar\u201D para recolher um da sua casa.</div>'}</div>` : `<p class="note">Guarde a mob\xEDlia inicial ou os m\xF3veis que voc\xEA colocou. Os itens recolhidos ficam dispon\xEDveis para reorganizar ou vender.</p><div class="two-cols"><section><h3>Instalados nesta casa</h3><div class="home-installed">${placed.map((o) => `<article class="home-installed-item"><span><strong>${esc(G.item(o).name)}</strong><small>${o.playerFurniture ? "Adicionado por voc\xEA" : "Mob\xEDlia inicial"}</small></span><button data-home-store-object="${esc(o.id)}" class="secondary">Guardar</button></article>`).join("") || '<p class="muted">Nenhum m\xF3vel recolh\xEDvel nesta casa.</p>'}</div></section><section><h3>No seu dep\xF3sito</h3>${this.catalog.filter((i) => h.furniture[i.id] > 0).map((i) => `<p class="home-storage-line"><span>${esc(i.name)}</span><b>\xD7${h.furniture[i.id]}</b></p>`).join("") || '<p class="muted">Seu dep\xF3sito est\xE1 vazio.</p>'}${owned ? '<button id="home-open-arrange" class="primary">Colocar e organizar os m\xF3veis</button>' : ""}</section></div>`}`, `<button id="home-shop-properties" class="secondary">Moradias e endere\xE7os</button>`, true);
      V.$$("[data-home-thumb]").forEach((canvas) => {
        const item = this.catalog.find((i) => i.id === canvas.dataset.homeThumb), ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        C.prop(ctx, item.family, item.prop, 0, 0, 112);
      });
      V.$$("[data-home-shop-tab]").forEach((b) => b.onclick = () => this.homeShop(b.dataset.homeShopTab, map));
      V.$("#home-shop-house")?.addEventListener("change", (e) => this.homeShop(tab, e.target.value));
      V.$$("[data-furniture-buy]").forEach((b) => b.onclick = () => {
        this.buyFurniture(b.dataset.furnitureBuy);
        this.homeShop("buy", map);
      });
      V.$$("[data-furniture-sell]").forEach((b) => b.onclick = () => {
        this.sellFurniture(b.dataset.furnitureSell);
        this.homeShop("sell", map);
      });
      V.$$("[data-home-store-object]").forEach((b) => b.onclick = () => {
        this.storeObject(map, b.dataset.homeStoreObject);
        this.homeShop("stored", map);
      });
      V.$("#home-open-arrange")?.addEventListener("click", () => this.organize(map));
      V.$("#home-shop-properties").onclick = () => this.panel();
      const filter = () => {
        const q = V.Interface.normalize(V.$("#home-shop-search").value), cat = V.$("#home-shop-category").value;
        let count = 0;
        V.$$("[data-home-item]").forEach((el) => {
          el.hidden = !!(cat && el.dataset.category !== cat) || !V.Interface.normalize(el.dataset.name).includes(q);
          if (!el.hidden) count++;
        });
        V.$("#home-shop-count").textContent = count + " m\xF3veis e instrumentos";
      };
      if (tab === "buy") {
        V.$("#home-shop-search").oninput = filter;
        V.$("#home-shop-category").onchange = filter;
        filter();
      }
    };
    H.store = () => H.homeShop("buy", G.cartMap || G.room());
    const organize = H.organize.bind(H);
    function showFurniturePlan(id) {
      organize(id);
      const aside = V.$(".home-arrange aside");
      if (aside) {
        const b = document.createElement("button");
        b.className = "secondary";
        b.textContent = "Guardar ou vender a mob\xEDlia";
        b.onclick = () => this.homeShop("stored", id);
        aside.prepend(b);
      }
    }
    H.organize = function(id) {
      if (!this.owned(id)) return organize(id);
      return V.MapAssets.ensure(["home-collection", "home-appliances"], "Preparando a planta da casa", () => showFurniturePlan(id));
    };
    const validPlacement = H.validPlacement.bind(H);
    H.validPlacement = function(id, item, x, y) {
      if (item.solid !== false) return validPlacement(id, item, x, y);
      const m = W.maps[id], room = m?.design.construction.rooms[0], b = room && R.box(room.polygon), size = (item.size || 2) * T;
      return !!b && x - size / 2 > b.x + 10 && x + size / 2 < b.x + b.w - 10 && y - size * 0.9 > b.y + 10 && y < b.y + b.h - 10;
    };
    H.sleep = function(o) {
      const map = W.current?.id;
      if (!H.isBed(o) || !W.current.objects.includes(o)) return false;
      if (!this.owned(map) && map !== "interior-horizonte-1") {
        V.UI.toast("Esta cama pertence a um morador. Use sua casa ou a pousada comunit\xE1ria.");
        return false;
      }
      if (this.ensure().sleep) return this.sleepPanel();
      const clock = V.Progress.ensure().clock, p = P.data;
      C.playerStand();
      this.ensure().sleep = { day: clock.day, hour: clock.hour, targetDay: clock.day + (clock.hour >= 6 ? 1 : 0), map, bed: o.id, returnAt: { x: p.x, y: p.y, dir: p.dir } };
      p.x = o.x;
      p.y = o.y + 2;
      p.moving = false;
      p.pose = "sleep";
      p.poseStart = V.Engine.time;
      p.poseUntil = V.Engine.time + 86400;
      W.camera = V.Viewport.target(W.current, p);
      V.PixCollection.collect("sleep", "Descanso na cama");
      V.Save.save();
      this.sleepPanel();
      return true;
    };
    H.sleepPanel = function() {
      const s = this.ensure()?.sleep;
      if (!s) return;
      const m = W.maps[s.map], bed = m?.objects.find((o) => o.id === s.bed) || m?.objects.find(H.isBed);
      if (!bed) {
        this.wake();
        return;
      }
      s.bed = bed.id;
      if (W.current?.id === s.map) {
        P.data.x = bed.x;
        P.data.y = bed.y + 2;
        P.data.pose = "sleep";
        P.data.poseUntil = V.Engine.time + 86400;
        W.camera = V.Viewport.target(m, P.data);
      }
      V.UI.onClose = null;
      V.UI.modal("Uma noite de descanso", "DORMINDO NA SUA CAMA", `<div class="home-sleep"><canvas id="home-sleep-bed" width="400" height="280" aria-label="Personagem deitado sobre a cama"></canvas><p>Descansando em ${esc(bed.scene.title || G.item(bed)?.name || "uma cama")}.</p><small>Dia ${s.targetDay} \xB7 ao acordar, 8h da manh\xE3</small></div>`, '<button id="home-wake" class="primary">Acordar de manh\xE3</button>');
      V.$("#home-wake").onclick = () => this.wake();
      V.UI.onClose = () => {
        if (this.ensure().sleep) this.wake();
      };
      G.sleepPreview();
    };
    const wake = H.wake.bind(H);
    H.wake = function() {
      const s = this.ensure()?.sleep;
      if (!s) return false;
      if (W.current?.id === s.map) {
        const bed = W.current.objects.find((o) => o.id === s.bed), point = R.safe(W.current, s.returnAt || { x: bed?.x || P.data.x, y: (bed?.y || P.data.y) + 65 }, 11);
        if (point) Object.assign(P.data, point);
      }
      return wake();
    };
    const render = P.render.bind(P);
    P.render = function(ctx) {
      const s = H.ensure()?.sleep, bed = s && W.current?.id === s.map && W.current.objects.find((o) => o.id === s.bed);
      if (bed) {
        G.drawSleeper(ctx, V.state.character, bed, W.camera);
        return;
      }
      return render(ctx);
    };
    V.Hooks.around(V.Save, "save", "home-collection:save:1", (save) => function(...args) {
      const s = H.ensure()?.sleep;
      if (!s?.returnAt || !P.data) return save(...args);
      const point = { x: P.data.x, y: P.data.y, dir: P.data.dir };
      Object.assign(P.data, s.returnAt);
      try {
        return save(...args);
      } finally {
        Object.assign(P.data, point);
      }
    });
    const furniture = L.furniture.bind(L);
    L.furniture = function(o) {
      if (H.isBed(o)) return H.sleep(o);
      return furniture(o);
    };
    V.Hooks.around(V.Game, "interact", "home-collection:interact:1", (nextHook) => function(o) {
      if (o?.scene?.family !== "home-plus" || V.modal || V.Dialogue.active) return nextHook(o);
      const item = G.item(o);
      V.PixCollection.collect(item.word, "Casa \xB7 " + item.name);
      switch (item.action) {
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
        case "fridge":
          if (item.action === "fridge") V.City.appliances.set(o.id, { startedAt: performance.now() / 1e3, duration: 2.6 });
          return L.panel("food");
        case "wash":
          V.City.appliances.set(o.id, { startedAt: performance.now() / 1e3, duration: 3.2 });
          V.UI.toast("Usando " + item.name.toLowerCase() + ". A anima\xE7\xE3o termina sozinha.");
          return;
        case "light":
          H.ensure().lamps[o.id] = !H.ensure().lamps[o.id];
          V.Save.save();
          V.UI.toast("Lumin\xE1ria " + (H.ensure().lamps[o.id] ? "acesa." : "apagada."));
          return;
        default:
          V.UI.toast(item.description);
          return;
      }
    });
    V.Hooks.around(V.Game, "render", "home-collection:render:1", (gameRender) => function(ctx) {
      gameRender(ctx);
      if (V.state) G.paint();
    });
    for (const [id, prop2] of [["interior-player-cottage", 1], ["interior-player-loft", 0], ["interior-player-villa", 2]]) {
      const d = C.layouts[id];
      if (!d) continue;
      for (const s of d.scenes) if (s.family === "home" && s.prop === 16) {
        s.family = "home-plus";
        s.prop = prop2;
        s.title = newItems[prop2].name;
        s.size = newItems[prop2].size;
      }
      V.SceneDesign.defaults[id] = JSON.parse(JSON.stringify(d));
      if (H.defaults[id]) H.defaults[id] = JSON.parse(JSON.stringify(d));
    }
  })();
});
