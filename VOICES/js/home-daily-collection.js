/* Registered module: home-daily-collection */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("home-daily-collection", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  "use strict";
  const V = window.V, D = V.HomeDesign, H = V.Homestead, C = V.Cozy, FAMILY = "home-daily";
  const rows = [
    ["breakfast", "Mesa do caf\xE9 da manh\xE3", "Cozinha", 54, "breakfast", "food", "preparing", 2.6],
    ["prep", "Bancada de preparo \xB7 carvalho", "Cozinha", 69, "kitchen", "food", "preparing", 2.6],
    ["tea-cart", "Carrinho de ch\xE1 de nogueira", "Cozinha", 48, "tea", "food", "preparing", 2.2],
    ["loom", "Tear dom\xE9stico com banco", "Estudo", 76, "weave", "study", "crafting", 2.5],
    ["potting", "Bancada de jardinagem", "Decora\xE7\xE3o", 62, "plant", "plant", "watering", 2.6],
    ["paint-table", "Mesa de pintura com banco", "Estudo", 68, "paint", "study", "drawing", 2.6],
    ["chess-table", "Mesa baixa de xadrez", "Sala", 52, "table", "seat", "playing", 2.7],
    ["reading-bench", "Banco de leitura \xB7 verde-petr\xF3leo", "Sala", 61, "read", "seat", "reading", 2.8],
    ["entry", "Arm\xE1rio de entrada aberto", "Sala", 53, "coat", "storage", "tidying", 2.5],
    ["laundry", "Bancada de dobrar roupa", "Banheiro", 57, "laundry", "storage", "tidying", 2.6],
    ["greenhouse", "Estufa de vidro para plantas", "Decora\xE7\xE3o", 70, "plant", "plant", "watering", 2.4],
    ["aquarium", "Aqu\xE1rio com gabinete de madeira", "Decora\xE7\xE3o", 84, "aquarium", "decor", "observing", 2.6],
    ["floor-reading", "Almofadas e cesto de leitura", "Sala", 29, "read", "seat", "reading", 2.2, false],
    ["screen", "Biombo de trama natural", "Decora\xE7\xE3o", 65, "screen", "decor", "", 2.7],
    ["typewriter", "Mesa de escrever com m\xE1quina", "Estudo", 71, "write", "study", "writing", 2.5],
    ["woodcraft", "Bancada de marcenaria artesanal", "Estudo", 79, "workbench", "storage", "crafting", 2.7]
  ];
  const text = { preparing: "Lou\xE7as, utens\xEDlios e espa\xE7o para preparar uma refei\xE7\xE3o.", crafting: "Um canto para trabalhos manuais e projetos da casa.", watering: "Vasos e utens\xEDlios para cuidar das plantas.", drawing: "Tintas, tela e espa\xE7o de cria\xE7\xE3o.", playing: "Uma mesa baixa para sentar e compartilhar uma partida.", reading: "Um lugar confort\xE1vel para sentar com um livro.", tidying: "Organize os pertences e a mob\xEDlia da casa.", observing: "Um aqu\xE1rio decorativo para observar os pequenos peixes.", writing: "Um canto para anota\xE7\xF5es, cartas e leituras." };
  const K = V.HomeDailyCollection = { items: rows.map(([id, name, category, price, word, action, ambientAction, size, solid = true], prop2) => ({ id: "daily-" + id, name, category, price, word, action, ambientAction, size, solid, prop: prop2, family: FAMILY, description: text[ambientAction] || "Divida os espa\xE7os com madeira e trama natural." })) };
  H.catalog.push(...K.items);
  V.sceneAssets.push(...K.items.map((i) => ({ family: FAMILY, index: i.prop, id: i.id, name: i.name, description: i.description, category: "moradia", layer: "object", solid: i.solid, size: i.size, interaction: i.action, solidFootprint: i.solid ? { x: 0.17, y: 0.73, width: 0.66, height: 0.2 } : [] })));
  const item = D.item.bind(D);
  D.item = (o) => o?.scene?.family === FAMILY ? K.items[o.scene.prop] : item(o);
  const prop = C.prop.bind(C);
  C.prop = function(c, family, index, x, y, size, ...rest) {
    return family === FAMILY ? D.art(c, FAMILY, index, x, y, size) : prop(c, family, index, x, y, size, ...rest);
  };
  V.AssetLoader.addGroupRule("home-daily-collection:group:1", (key) => key.startsWith("assets/homestead/home-daily.") ? "home-collection" : void 0);
});
