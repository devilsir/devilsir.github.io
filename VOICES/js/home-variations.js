/* Registered module: home-variations */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("home-variations", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function homeVariations() {
    "use strict";
    const V = window.V, H = V.Homestead, C = V.Cozy, G = V.HomeLiving, L = V.Life, T = 48;
    const rows = [
      ["bed-indigo", "Cama de casal \xB7 colcha anil", "Quarto", 64, "bed", "bed", 2.6],
      ["bed-moss", "Cama de solteiro \xB7 musgo", "Quarto", 48, "bed", "bed", 2.2],
      ["daybed-rust", "Cama de palhinha \xB7 ferrugem", "Quarto", 58, "bed", "bed", 2.5],
      ["bed-carved", "Cama entalhada \xB7 algod\xE3o", "Quarto", 82, "bed", "bed", 2.7],
      ["sofa-plum", "Sof\xE1 ameixa", "Sala", 55, "sofa", "seat", 2.5],
      ["sofa-cane", "Sof\xE1 de palhinha \xB7 linho", "Sala", 61, "sofa", "seat", 2.5],
      ["armchair-caramel", "Poltrona caramelo", "Sala", 36, "chair", "seat", 2],
      ["rocking-olive", "Cadeira de balan\xE7o \xB7 oliva", "Sala", 42, "chair", "seat", 2],
      ["desk-walnut-book", "Escrivaninha de nogueira", "Estudo", 46, "desk", "study", 2.4],
      ["desk-cream-laptop", "Escrivaninha creme com computador", "Estudo", 68, "desk", "study", 2.4],
      ["dining-round", "Mesa redonda com bancos", "Sala", 43, "table", "food", 2.5],
      ["dining-long", "Mesa de jantar com quatro cadeiras", "Sala", 66, "table", "food", 2.8],
      ["bookcase-narrow", "Estante estreita de carvalho", "Estudo", 39, "bookshelf", "study", 2.2],
      ["bookcase-cream-wide", "Estante creme de parede", "Estudo", 62, "bookshelf", "study", 2.7],
      ["wardrobe-carved", "Guarda-roupa entalhado", "Quarto", 71, "wardrobe", "storage", 2.5],
      ["wardrobe-ivory-mirror", "Guarda-roupa marfim com espelho", "Quarto", 74, "wardrobe", "storage", 2.5],
      ["dresser-teak", "C\xF4moda de teca com flores", "Quarto", 41, "dresser", "storage", 2.2],
      ["nightstand-blue", "Mesa de cabeceira azul", "Quarto", 24, "table", "light", 1.9],
      ["kitchen-sage", "Arm\xE1rio de cozinha \xB7 s\xE1lvia", "Cozinha", 58, "cupboard", "storage", 2.3],
      ["stove-terracotta", "Fog\xE3o terracota com panela", "Cozinha", 64, "stove", "cook", 2.2],
      ["fridge-botanical", "Geladeira creme \xB7 folhas", "Cozinha", 72, "fridge", "fridge", 2.3],
      ["lamp-brass-green", "Lumin\xE1ria de lat\xE3o e verde", "Decora\xE7\xE3o", 29, "lamp", "light", 2.1],
      ["rug-burgundy", "Tapete bord\xF4 e dourado", "Decora\xE7\xE3o", 26, "rug", "rug", 2.9],
      ["console-fern", "Aparador com samambaia", "Sala", 37, "shelf", "plant", 2.6]
    ];
    const actions = { bed: "Deite e durma at\xE9 a manh\xE3.", seat: "Sente e fa\xE7a uma pausa.", study: "Consulte suas leituras.", food: "Consulte a alimenta\xE7\xE3o.", storage: "Guarde ou organize a mob\xEDlia.", light: "Acenda ou apague a lumin\xE1ria.", cook: "Prepare comidas com os ingredientes da mochila.", fridge: "Consulte os alimentos guardados.", rug: "Decore o piso preservando a circula\xE7\xE3o.", plant: "Um lugar para a samambaia e seus livros." };
    const variants = V.HomeVariations = {
      items: rows.map(([id, name, category, price, word, action, size], prop2) => ({ id: "variant-" + id, name, category, price, word, action, size, prop: prop2, family: "home-variants", solid: action !== "rug", description: actions[action] })),
      hydrate(m) {
        if (!m?.objects) return;
        for (const o of m.objects) {
          if (o.scene?.family !== "home-variants") continue;
          const item2 = this.items[o.scene.prop];
          if (!item2) continue;
          o.household = true;
          o.homeMap = m.id;
          o.label = item2.name;
          o.interactionRange = 100;
          o.scene.hostDecor = "solid-" + o.id;
          if (item2.solid && !m.solids.some((s) => s.owner === o.scene.hostDecor)) {
            const size = (o.scene.size || item2.size) * T;
            m.solids.push({ x: o.x - size * 0.32, y: o.y - 30, w: size * 0.64, h: 17, owner: o.scene.hostDecor });
          }
        }
        G.filterStored(m);
      }
    };
    H.catalog.push(...variants.items);
    V.sceneAssets.push(...variants.items.map((i) => ({ family: i.family, index: i.prop, id: i.id, name: i.name, description: i.description, category: "moradia", layer: i.solid ? "object" : "ground", solid: i.solid, size: i.size, interaction: i.action, solidFootprint: i.solid ? { x: 0.16, y: 0.73, width: 0.68, height: 0.19 } : [] })));
    const prop = C.prop.bind(C);
    C.prop = function(ctx, family, index, x, y, size, ...args) {
      if (family === "home-variants") return V.AncestralArt.tile(ctx, "furniture", index, x, y, size);
      return prop(ctx, family, index, x, y, size, ...args);
    };
    const item = G.item.bind(G);
    G.item = function(o) {
      return o?.scene?.family === "home-variants" ? variants.items[o.scene.prop] : item(o);
    };
    const bed = H.isBed;
    H.isBed = (o) => o?.scene?.family === "home-variants" && variants.items[o.scene.prop]?.action === "bed" || bed(o);
    const hydrate = V.City.hydrate.bind(V.City);
    V.City.hydrate = function(m) {
      hydrate(m);
      variants.hydrate(m);
    };
    const apply = H.applyFurniture.bind(H);
    H.applyFurniture = function(...args) {
      const result = apply(...args);
      for (const m of Object.values(V.World.maps)) variants.hydrate(m);
      return result;
    };
    const ground = C.ground.bind(C);
    C.ground = function(m) {
      ground(m);
      const ctx = m.cache.getContext("2d");
      for (const o of m.objects.filter((o2) => o2.scene?.family === "home-variants" && variants.items[o2.scene.prop]?.solid === false)) {
        const z = (o.scene.size || variants.items[o.scene.prop].size) * T;
        C.prop(ctx, "home-variants", o.scene.prop, o.x - z / 2, o.y - z * 0.99, z);
      }
    };
    V.Hooks.around(V.Cozy, "drawObject", "home-variations:drawObject:1", (draw) => function(ctx, o, cam, t) {
      if (o.scene?.family !== "home-variants") return draw(ctx, o, cam, t);
      const item2 = variants.items[o.scene.prop], z = (o.scene.size || item2.size) * T, x = o.x - cam.x, y = o.y - cam.y;
      if (item2.solid) C.prop(ctx, item2.family, item2.prop, x - z / 2, y - z * 0.99, z);
      if (item2.action === "light" && H.ensure()?.lamps[o.id]) {
        ctx.save();
        const g = ctx.createRadialGradient(x, y - z * 0.6, 4, x, y - z * 0.6, z * 0.55);
        g.addColorStop(0, "#ffdf9470");
        g.addColorStop(1, "#ffdf9400");
        ctx.fillStyle = g;
        ctx.fillRect(x - z / 2, y - z, z, z);
        ctx.restore();
      }
      if (V.World.nearest?.id === o.id) V.Living.marker(ctx, x, y, "E", "#e7cb8e");
    });
    V.Hooks.around(V.Game, "interact", "home-variations:interact:1", (nextHook) => function(o) {
      if (o?.scene?.family !== "home-variants" || V.modal || V.Dialogue.active) return nextHook(o);
      const item2 = G.item(o);
      V.PixCollection.collect(item2.word, "Casa \xB7 " + item2.name);
      switch (item2.action) {
        case "bed":
          return H.sleep(o);
        case "seat":
          return V.Activities.perform("sit");
        case "storage":
          return H.homeShop("stored", G.room());
        case "study":
          V.Living.journal("readings");
          return V.Activities.perform("read", { close: false });
        case "cook":
          return V.Botica.recipes("food");
        case "food":
        case "fridge":
          return L.panel("food");
        case "light":
          H.ensure().lamps[o.id] = !H.ensure().lamps[o.id];
          V.Save.save();
          V.UI.toast("Lumin\xE1ria " + (H.ensure().lamps[o.id] ? "acesa." : "apagada."));
          return;
        default:
          V.UI.toast(item2.description);
      }
    });
  })();
});
