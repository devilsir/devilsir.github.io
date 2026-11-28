/* Registered module: world-finalize */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("world-finalize", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  "use strict";
  const V = window.V, W = V.World, T = 48;
  const asset = "assets/expansion/building-signs-v2.webp";
  const type = "building-sign";
  const playFacade = "play-museum-facade";
  const playFacadeAsset = "assets/expansion/play-museum-facade.webp";
  const pathSign = "travel-sign";
  const passageTypes = new Set(["door", "travel", "exit", "portal", "fragment-site", "infinity-trail"]);
  const classicDoor = { type: "single", normal: { x: 0, y: 1 }, appearance: 19, width: 74, height: 101 };
  const museumDoor = { ...classicDoor, appearance: 20, width: 82, height: 108 };
  const defaultRouteScale = 0.5;
  // Placa de orientação (props-polished, célula 36). Estenda só a parte
  // reta da tábua superior e mantenha o poste e a seta de baixo no tamanho original.
  const routeTop = [11, 388, 105, 16];
  const routeBottom = [11, 433, 105, 75];
  const routeLeft = [25, 404, 13, 29];
  const routeGrain = [75, 404, 18, 29];
  const routeTip = [96, 404, 20, 29];
  const routeFont = '700 20px "VOICES Sans", Arial, sans-serif';
  const routeGap = 24;
  const routePadding = 28;
  const facadeSizes = {
    "voices-museum": [416, 347],
    "open-school": [416, 309],
    "library": [416, 326],
    "community-center": [416, 316],
    "music-studio": [368, 301],
    "history-gallery": [410, 301],
    "observatory": [393, 308],
    "science-workshop": [414, 293],
    "news-office": [416, 302],
    "fossil-pavilion": [416, 284],
    "festival-hall": [416, 303],
    "server-room": [416, 227],
    "voices-central": [416, 283],
    "system-lab": [416, 292]
  };
  const buildingArt = {
    "door-library": "library",
    "door-room-6": "voices-central",
    "door-room-1-0": "music-studio",
    "door-room-1-1": "festival-hall",
    "door-room-2-0": "history-gallery",
    "door-room-2-1": "voices-museum",
    "door-room-3-0": "science-workshop",
    "door-room-3-1": "observatory",
    "door-room-4-0": "news-office",
    "door-room-4-1": "server-room",
    "door-room-5-0": "community-center",
    "door-room-5-1": "open-school",
    "door-room-6-0": "voices-central",
    "door-room-6-1": "system-lab"
  };
  const entranceArt = {
    "campus-travel-hub-school": ["Escola Aberta", "open-school", 232, "culture"],
    "campus-travel-hub-museum": ["Museu das Vozes", "voices-museum", 230, "culture"],
    "animal-museum-fossils": ["Galeria dos F\xF3sseis", "fossil-pavilion", 260, "nature"]
  };
  const buildingNames = {
    "door-library": "Biblioteca",
    "door-room-6": "Central VOICES",
    "door-room-1-0": "Est\xFAdio de Ensaio",
    "door-room-1-1": "Palco do Festival",
    "door-room-2-0": "Arquivo de Mem\xF3rias",
    "door-room-2-1": "Galeria Restaurada",
    "door-room-3-0": "Oficina de Ci\xEAncias",
    "door-room-3-1": "Observat\xF3rio",
    "door-room-4-0": "Reda\xE7\xE3o do Bairro",
    "door-room-4-1": "Sala dos Servidores",
    "door-room-5-0": "Centro Comunit\xE1rio",
    "door-room-5-1": "Escola Aberta",
    "door-room-6-0": "Arquivo Central",
    "door-room-6-1": "N\xFAcleo do Sistema"
  };
  const routeNames = {
    beach: "Praia das Mar\xE9s",
    garden: "Horta Comunit\xE1ria",
    market: "Feira das Hist\xF3rias",
    park: "Parque das Pontes",
    harbor: "Porto das Vozes",
    neighborhood: "Bairro das Janelas",
    school: "Escola Aberta",
    museum: "Museu das Vozes",
    "university-biology": "Laborat\xF3rio de Biologia",
    "university-physics": "Laborat\xF3rio de Qu\xEDmica e F\xEDsica",
    "university-sports": "Gin\xE1sio e quadra poliesportiva",
    "university-pool": "Centro Aqu\xE1tico",
    "nature-cerrado": "Cerrado",
    "capoeira-courtyard": "P\xE1tio da Ginga",
    "infinity-trails": "Trilhas do Infinito"
  };
  const facadeKey = (art) => "facade-" + art;
  const artSize = (art, w) => ({ w, h: w * facadeSizes[art][1] / facadeSizes[art][0] });
  const drawsSign = (o) => o?.type === type || o?.type === pathSign;
  const signDefaultScale = (id) => id.startsWith(pathSign + "-") ? defaultRouteScale : 1;
  const signPoint = (m, sign) => {
    const pos = m.design?.positions?.[sign.id], edit = m.design?.objectEdits?.[sign.id];
    const objectEditor = V.ObjectEditing, offset = objectEditor.special(m) ? objectEditor.offset(m) : 0.5;
    if (pos) {
      sign.x = (pos[0] + offset) * T;
      sign.y = (pos[1] + offset) * T;
    }
    if (edit || sign.type === pathSign) sign.visualScale = edit?.scale ?? signDefaultScale(sign.id);
    if (edit) Object.assign(sign, { visualRotation: edit.rotation ?? 0, visualFlip: !!edit.flip, editorLayer: edit.layer });
    return sign;
  };
  // Source rectangle, text panel and three opaque bands. All normalized
  // rectangles are measured from the pixels of the authored sprite.
  const boards = [
    [[5, 4, 210, 144], [0.15, 0.345, 0.701, 0.265], [[0, 0, 1, 0.333], [0.019, 0.333, 0.986, 0.667], [0, 0.667, 1, 1]]],
    [[225, 4, 210, 137], [0.189, 0.341, 0.623, 0.273], [[5e-3, 0, 0.995, 0.336], [0.024, 0.336, 0.976, 0.664], [0, 0.664, 1, 1]]],
    [[445, 4, 210, 120], [0.248, 0.344, 0.506, 0.259], [[0.029, 0, 0.971, 0.333], [0.062, 0.333, 0.938, 0.667], [0, 0.667, 1, 1]]],
    [[665, 4, 210, 146], [0.126, 0.331, 0.748, 0.232], [[0, 0, 1, 0.336], [0, 0.336, 1, 0.664], [0.048, 0.664, 0.952, 1]]],
    [[5, 204, 210, 112], [0.147, 0.2, 0.709, 0.343], [[0, 0, 1, 0.33], [0, 0.33, 1, 0.67], [0, 0.67, 1, 1]]],
    [[225, 204, 210, 124], [0.157, 0.296, 0.692, 0.277], [[0, 0, 1, 0.331], [0.019, 0.331, 0.986, 0.669], [0.01, 0.669, 0.99, 1]]],
    [[445, 204, 188, 191], [0.187, 0.352, 0.626, 0.244], [[0.011, 0, 0.989, 0.335], [0, 0.335, 1, 0.665], [0.074, 0.665, 0.931, 1]]],
    [[665, 204, 210, 121], [0.142, 0.357, 0.712, 0.283], [[0, 0, 1, 0.331], [0.038, 0.331, 0.962, 0.669], [0.038, 0.669, 0.962, 1]]],
    [[5, 404, 210, 186], [0.218, 0.342, 0.558, 0.308], [[0.043, 0, 0.957, 0.333], [0.076, 0.333, 0.924, 0.667], [0, 0.667, 1, 1]]],
    [[225, 404, 210, 173], [0.165, 0.345, 0.661, 0.299], [[0, 0, 1, 0.335], [0.019, 0.335, 0.981, 0.665], [0, 0.665, 1, 1]]],
    [[445, 404, 210, 182], [0.192, 0.378, 0.607, 0.273], [[0, 0, 1, 0.335], [0.038, 0.335, 0.957, 0.665], [0.01, 0.665, 0.99, 1]]],
    [[665, 404, 210, 183], [0.147, 0.375, 0.707, 0.299], [[0, 0, 1, 0.333], [0.014, 0.333, 0.986, 0.667], [0, 0.667, 1, 1]]]
  ];
  const alpha = {
    wordsMuseum: [0.0391, 0.03125, 0.9609, 1],
    foodMuseum: [0.0312, 0.1927, 0.9688, 0.9688],
    animalMuseum: [0.0312, 0.1667, 0.9688, 0.9688],
    sanctuary: [[0.0375, 0.2188, 0.9625, 0.9625], [0.0375, 0.325, 0.9625, 0.9625], [0.0375, 0.1812, 0.9625, 0.9625], [0.0375, 0.2062, 0.9625, 0.9625], [0.0375, 0.2812, 0.9625, 0.9625], [0.0375, 0.3, 0.9625, 0.9625]],
    guardHomeRatios: [1.2549, 1.45248],
    guardBuildings: [[0.0375, 0.2875, 0.9625, 0.9688], [0.0375, 0.2375, 0.9625, 0.9688]],
    stalls: [[0.0556, 0.0764, 1, 0.9306], [0.0694, 0.1042, 0.9444, 0.9444], [0.0417, 0.0833, 0.9375, 0.9375], [0.0208, 0.1111, 0.9306, 0.9306], [0.0625, 0.0417, 0.9722, 0.8819], [0.0556, 0.0417, 0.9514, 0.8889], [0.0278, 0.0486, 0.9167, 0.8958], [0.0556, 0.0486, 0.9583, 0.875]],
    fruitStall: [0.0312, 0.1458, 0.9688, 0.9688],
    kitchenCart: [0.0977, 0.0312, 0.9023, 0.9688],
    capeStalls: [[48e-4, 48e-4, 0.9952, 0.9928], [47e-4, 48e-4, 0.9953, 0.9928], [46e-4, 72e-4, 0.9931, 0.9952], [47e-4, 51e-4, 0.9953, 0.9949], [4e-3, 68e-4, 0.996, 0.9932]],
    port: { "port-terminal-v2": [1.12676, [0, 0.0563, 1, 1]], "cape-warehouse": [1.49375, [0, 0, 1, 1]], "cape-market": [1.45625, [0, 0, 1, 1]], "port-crane": [1.08108, [0, 0, 1, 1]], "harbor-lighthouse": [1.225, [0.2908, 0, 1, 1]], "cape-houses": [1.4875, [0, 0, 1, 1]], "cape-heritage": [1.4375, [0, 0, 1, 1]], "bo-kaap-terrace": [1.51875, [0, 0, 1, 1]], "garden-pavilion": [1.4125, [0.0973, 0, 1, 1]], "muizenberg-huts": [2.048, [0, 0, 1, 1]] }
  };
  const full = [0, 0, 1, 1];
  const profiles = {
    home: { styles: [6, 0, 4, 10], sizes: [100, 112, 126, 144], preference: 1 },
    shop: { styles: [7, 2, 4, 10], sizes: [120, 138, 156, 174, 192], preference: 1 },
    culture: { styles: [1, 8, 5, 9, 2], sizes: [132, 152, 172, 192, 212], preference: 2 },
    landmark: { styles: [1, 8, 9, 3], sizes: [122, 130, 150, 170, 190, 210], preference: 1 },
    nature: { styles: [3, 6, 1, 4], sizes: [112, 128, 146, 164, 182], preference: 1 },
    heritage: { styles: [9, 5, 0], sizes: [148, 168, 188, 208], preference: 8 },
    coast: { styles: [11, 5, 3], sizes: [126, 146, 166, 186, 206], preference: 1 }
  };
  const fontFace = (size) => "700 " + size + 'px "VOICES Sans",system-ui,sans-serif';
  const crop = (box, [l, t, r, b] = full) => ({
    x: box.x + box.w * l,
    y: box.y + box.h * t,
    w: box.w * (r - l),
    h: box.h * (b - t)
  });
  const at = (x, y, w, h) => ({ x: x - w / 2, y: y - h, w, h });
  const fit = (box, ratio) => {
    const w = Math.min(box.w, box.h * ratio), h = w / ratio;
    return at(box.x + box.w / 2, box.y + box.h, w, h);
  };
  const rectOverlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const makePlace = (id, name, kind, variant, face, door = null, solid = null) => ({
    id,
    name,
    kind,
    variant,
    face,
    door,
    solid,
    x: face.x + face.w / 2,
    front: face.y + face.h
  });
  const names = {
    "port-terminal-v2": "Terminal de Passageiros",
    "cape-warehouse": "Armaz\xE9m do Porto",
    "cape-market": "Mercado do Cabo",
    "port-crane": "Guindaste do Porto",
    "harbor-lighthouse": "Farol do Porto",
    "cape-houses": "Casario do Cabo",
    "cape-heritage": "Centro de Mem\xF3ria do Cabo",
    "bo-kaap-terrace": "Casario de Bo-Kaap",
    "garden-pavilion": "Pavilh\xE3o do Jardim",
    "muizenberg-huts": "Cabanas de Muizenberg"
  };
  const S = V.BuildingSigns = {
    isSign: drawsSign,
    defaultScale: signDefaultScale,
    indoors(m, point) {
      return V.Environment.isInterior(m) || !!(point && m?.design?.adventure?.regions?.some((r) => r.indoor && point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h));
    },
    interiorPassage(m, o) {
      return passageTypes.has(o.type) && !!(o.to || o.chapter && o.type === "portal" || o.type === "exit" || o.type === "infinity-trail" && ["return", "next"].includes(o.kind)) && this.indoors(m, o);
    },
    interiorDoorDepth(m, o) {
      const walls = m.design?.adventure?.architecture?.walls || [];
      return walls.reduce((depth, wall) => {
        const [x1, y1] = wall.a, [x2, y2] = wall.b;
        const distance = y1 - o.y;
        // Keep the opening visible when a nearby foreground wall would cover it.
        if (Math.abs(y2 - y1) < 1 && distance >= 0 && distance <= 100 && o.x >= Math.min(x1, x2) && o.x <= Math.max(x1, x2)) return Math.max(depth, y1 + 0.25);
        return depth;
      }, o.y);
    },
    interiorDoorSize(m, o) {
      if (o.foodGalleryDoor) return { w: 132, h: 135 };
      if (m.culinaryInteriors && o.interiorDoor) return { w: 128, h: 121 };
      const d = m.africanMuseum ? museumDoor : classicDoor;
      return { w: d.width + 18, h: d.height + 12 };
    },
    spec(m, o) {
      if (this.indoors(m, o)) return null;
      const front = entranceArt[o.id];
      if (front) {
        const [name, sprite, width, kind] = front;
        return { name, sprite, kind, ...artSize(sprite, width) };
      }
      if (m.culinary || o.interiorDoor) return null;
      if (o.culinaryLink && V.CulinaryWorld.facadeFrames[o.culinaryProp]) return {
        name: o.to === "university" ? "Universidade das Vozes" : "Restaurante dos Saberes",
        kind: o.to === "university" ? "landmark" : "shop",
        w: 224,
        h: 186,
        art: "culinary"
      };
      if (o.playMuseumExterior) return { name: "Museu das Brincadeiras", kind: "culture", variant: 1, ...V.PlayMuseum.facadeSize };
      if (o.foodFacade) return { name: "Museu da Comida", kind: "culture", w: 240, h: 210, art: "foodMuseum", offset: 8 };
      if (o.animalFacade) return { name: "Museu dos Animais", kind: "nature", w: 210, h: 180, art: "animalMuseum", offset: 6 };
      if (o.salonLink && (o.facade || m.id === "hub") && !o.inside) return { name: "Sal\xE3o \xCDris", kind: "shop", w: 184, h: 112, art: "salon" };
      if (o.afLink && o.to === "african-words" && !m.africanMuseum && !o.playMuseumLink) {
        return { name: "Museu das Palavras Africanas", kind: "culture", ...V.PlazaLayout.museum, art: "wordsMuseum" };
      }
      return null;
    },
    dimensions(o, spec) {
      if (spec.art === "culinary") return V.CulinaryWorld.facadeSize(o.culinaryProp);
      return spec;
    },
    footprint(o, spec, p = o) {
      const { w, h } = this.dimensions(o, spec), scale = o.visualScale || 1;
      const width = w * 0.8 * scale, height = h * 0.6 * scale;
      return V.SceneDesign.rotateBox({ x: p.x - width / 2, y: p.y - 20 * scale - height, w: width, h: height, owner: o.id, exteriorFacade: true }, p.x, p.y, o.visualRotation, o.visualFlip);
    },
    buildingFace(m, b) {
      const x = b.x + b.w / 2, front = b.y + b.h, art = buildingArt[b.door];
      if (art) return fit(at(x, front, b.w, b.h + 40), facadeSizes[art][0] / facadeSizes[art][1]);
      if (b.culture != null) {
        const frame = V.AncestralArt.bounds.places[b.culture];
        if (!frame) return b;
        const factor = b.w / Math.max(frame[2], frame[3]);
        return at(x, front, frame[2] * factor, frame[3] * factor);
      }
      if (b.sanctuaryHome != null) {
        if (m.id === "sanctuary-village-sa" && b.door) {
          const lind = b.door.endsWith("ranger-lindiwe");
          const entrance = lind ? 0.451 : 0.497;
          const ratio = alpha.guardHomeRatios[Number(lind)];
          const w = Math.min(b.w / (2 * Math.max(entrance, 1 - entrance)), (b.h + 56) * ratio);
          const h = w / ratio;
          return { x: x - w * entrance, y: front - h, w, h };
        }
        return crop({ x: b.x, y: b.y - 70, w: b.w, h: b.h + 76 }, alpha.sanctuary[b.sanctuaryHome]);
      }
      return b;
    },
    standFace(m, o) {
      if (m.capeDesign) {
        const box = o.marketKitchen ? at(o.x, o.y, 148, 146) : at(o.x, o.y, o.w, o.h);
        return this.capeFace(box, o.capeDesignFrame ?? 0);
      }
      if (o.marketKitchen) return crop(at(o.x, o.y + 18, 154, 154), alpha.kitchenCart);
      const bounds = o.marketVendor === "joana" ? alpha.fruitStall : alpha.stalls[o.stall];
      return crop(at(o.x, o.y, o.w, o.h), bounds);
    },
    capeFace(box, index) {
      const f = V.HomeDesignArtData["cape-design"].frames[index];
      return crop(fit(box, f.w / f.h), alpha.capeStalls[index]);
    },
    mapPlaces(m) {
      const places = [];
      for (const [i, b] of m.buildings.entries()) {
        const x = b.x + b.w / 2, front = b.y + b.h;
        const door = m.objects.find((o) => o.id === b.door) || b.culture != null && m.objects.find((o) => o.type === "room-door" && Math.abs(o.x - x) < b.w / 2 && Math.abs(o.y - front) < 54);
        const id = b.door || "building-" + i;
        const name = buildingNames[b.door] || b.facade?.home && m.id === "residential" && W.maps[b.facade.home]?.name || b.label;
        const kind = b.culture != null ? "heritage" : b.sanctuaryHome != null ? "home" : b.facade?.shop ? "shop" : b.facade ? "home" : "culture";
        const face = this.buildingFace(m, b);
        const bottom = Math.min(front - 12, (door?.y ?? front) - 18);
        const top = b.y + b.h * 0.33;
        const solid = { x: face.x + face.w * 0.075, y: top, w: face.w * 0.85, h: Math.max(12, bottom - top), owner: "shell-" + id, exteriorFacade: true };
        if (name) places.push(makePlace(id, name, kind, i, face, door, solid));
      }
      for (const o of m.objects) {
        const spec = this.spec(m, o);
        if (spec) {
          const { w, h } = this.dimensions(o, spec), scale = o.visualScale || 1;
          const box = at(o.x, o.y + (spec.offset || 0) * scale, w * scale, h * scale);
          const face = V.SceneDesign.rotateBox(crop(box, alpha[spec.art]), o.x, o.y, o.visualRotation, o.visualFlip);
          places.push(makePlace(o.id, spec.name, spec.kind, spec.variant ?? (o.foodFacade ? 4 : o.animalFacade ? 2 : 0), face, o, this.footprint(o, spec)));
        } else if (o.type === "market-stall" || o.marketKitchen) {
          const name = o.marketKitchen ? "Cozinha dos Saberes" : V.Markets.vendor(o.marketVendor)?.shop;
          const w = o.w || 154, h = o.h || 136;
          const solid = { x: o.x - w * 0.38, y: o.y - h * 0.38, w: w * 0.76, h: h * 0.33, owner: o.id, exteriorFacade: true };
          if (name) places.push(makePlace(o.id, name, "shop", o.stall ?? 2, this.standFace(m, o), o, solid));
        } else if (o.type === "sea-building" && !o.seaSite || o.type === "cape-building" || o.type === "cape-decor" && o.art === "muizenberg-huts") {
          const name = names[o.art], frame = alpha.port[o.art];
          if (name && frame) {
            const face = crop(fit(at(o.x, o.y, o.w, o.h), frame[0]), frame[1]);
            const kind = o.art.includes("pavilion") ? "nature" : o.art.includes("heritage") ? "heritage" : "coast";
            const variant = ["cape-houses", "bo-kaap-terrace", "cape-warehouse"].includes(o.art) ? 1 : ["harbor-lighthouse", "cape-market"].includes(o.art) ? 2 : 0;
            places.push(makePlace(o.id, name, kind, variant, face));
          }
        }
      }
      for (const d of m.decor || []) {
        if (d.family !== "guard-village" || d.prop > 1) continue;
        const face = crop({ x: d.x, y: d.y, w: d.size, h: d.size }, alpha.guardBuildings[d.prop]);
        places.push(makePlace(d.id, d.prop === 0 ? "Oficina dos guardas" : "Abrigo comunit\xE1rio", "nature", d.prop + 1, face));
      }
      for (const [i, entry] of (m.marketFacades || []).entries()) {
        const face = this.capeFace(entry, 4);
        const solid = {
          x: entry.x + entry.w * 0.09,
          y: entry.y + entry.h * 0.66,
          w: entry.w * 0.82,
          h: entry.h * 0.23,
          owner: "market-row-" + i,
          exteriorFacade: true
        };
        places.push(makePlace("market-row-" + i, i === 1 ? "Mercado do Cabo" : "Casario do Cabo", "coast", i, face, null, solid));
      }
      return places;
    },
    install(m) {
      if (!m) return;
      const replacedSigns = m.objects.some(drawsSign);
      m.objects = m.objects.filter((o) => !drawsSign(o));
      m.solids = m.solids.filter((o) => !o.exteriorFacade);
      V.ObjectEditing.apply(m);
      for (const o of m.objects) {
        delete o.travelSign;
        if (this.interiorPassage(m, o)) o.interiorDoorDepth = this.interiorDoorDepth(m, o);
        else delete o.interiorDoorDepth;
      }
      const indoor = this.indoors(m);
      const places = indoor ? [] : this.mapPlaces(m);
      const solids = places.flatMap((p) => p.solid ? [p.solid] : []);
      // Replace narrow legacy footprints for freestanding entrances and stalls.
      const owners = new Set(solids.map((s) => s.owner));
      const spriteShells = m.buildings.filter((b) => buildingArt[b.door]);
      m.solids = m.solids.filter((s) => !owners.has(s.owner) && !spriteShells.some((b) => s.x === b.x && s.y === b.y && s.w === b.w && s.h === b.h));
      m.solids.push(...solids);
      const structures = places.map((p) => p.face);
      const routes = m.objects.filter((o) => ["travel", "portal", "room-door", "door", "exit", "fast-travel"].includes(o.type)).map((o) => ({ x: o.x - 25, y: o.y - 8, w: 50, h: 49 }));
      const occupied = (m.decor || []).filter((o) => o.layer !== "ground" && o.family !== "floor").map((o) => ({ x: o.x + o.size * 0.12, y: o.y + o.size * 0.12, w: o.size * 0.76, h: o.size * 0.8 }));
      const fixed = structures.map((box) => ({ box, weight: 26 })).concat(
        routes.map((box) => ({ box, weight: 15 })),
        occupied.map((box) => ({ box, weight: 2 }))
      );
      const measure = this.measure ||= document.createElement("canvas").getContext("2d");
      for (const place of places.sort((a, b) => a.front - b.front || a.x - b.x)) {
        const sign = signPoint(m, this.position(m, place, fixed, measure));
        m.objects.push(sign);
        for (const box of this.silhouette(sign)) fixed.push({ box, weight: 26 });
      }
      const doors = new Set(places.map((p) => p.door?.id));
      const signposts = fixed.concat(m.objects.filter((o) => o.type === "portal" || o.type === "room-door").map((o) => ({ box: at(o.x, o.y + 4, o.width || 64, o.height || 84), weight: 26 })));
      const destinations = [];
      for (const o of m.objects) {
        const route = doors.has(o.id) ? null : this.route(m, o);
        if (!route) continue;
        const id = pathSign + "-" + o.id;
        const text = this.routeText(measure, route.name);
        const boardH = 18 + text.lines.length * routeGap;
        const sign = {
          id,
          type: pathSign,
          w: Math.max(128, Math.ceil((text.width + routePadding * 2) / 4) * 4),
          h: routeTop[3] + boardH + routeBottom[3],
          boardH,
          text,
          name: route.name,
          x: 0,
          y: 0,
          label: "Placa de viagem \xB7 " + route.name,
          collectionOnly: true,
          interactionRange: 0
        };
        signPoint(m, sign);
        const placed = m.design?.positions?.[id];
        if (placed) {
          signposts.push({ box: V.ObjectEditing.bounds(at(sign.x, sign.y, sign.w, sign.h), sign), weight: 40 });
        }
        destinations.push({ o, sign, beside: route.beside, placed });
      }
      for (const { o, sign, beside, placed } of destinations) {
        if (!placed) {
          Object.assign(sign, this.routePosition(m, o, sign, beside, signposts));
          signposts.push({ box: V.ObjectEditing.bounds(at(sign.x, sign.y, sign.w, sign.h), sign), weight: 40 });
        }
        m.objects.push(sign);
        o.travelSign = sign.id;
      }
      if (replacedSigns || places.length || m.objects.some(drawsSign)) {
        m.geometryRevision = (m.geometryRevision || 0) + 1;
        V.ObjectiveGuide.invalidate();
        V.Atlas.cache.delete(m.id);
      }
      V.SceneDesign.registerObjects(m);
    },
    route(m, o) {
      if (this.indoors(m, o) || o.type === "room-door" && o.door?.wall) return null;
      const to = o.door?.to?.map || o.to || (o.chapter && o.type === "portal" ? "chapter-" + o.chapter : null);
      const trail = o.type === "infinity-trail";
      if (trail && o.kind === "return") return { name: "Floresta do Fragmento", beside: true };
      if (trail && o.kind === "next") return { name: "Pr\xF3xima sala", beside: true };
      if (!to || to === m.id) return null;
      const target = W.maps[to], indoor = target ? V.Environment.isInterior(target) : false;
      if (o.type === "room-door" && indoor) return null;
      if (!["door", "room-door", "travel", "exit", "portal", "fragment-site", "infinity-trail"].includes(o.type)) return null;
      const name = routeNames[to] || (o.type === "portal" ? V.content.chapters[o.chapter - 1].title : V.FastTravel.name(to));
      if (!name || !target && name === to) return null;
      const beside = ["portal", "room-door", "door"].includes(o.type) || trail;
      return { name: name.split(" \xB7 ")[0], beside };
    },
    routePosition(m, o, sign, beside, occupied) {
      const offset = V.ObjectEditing.bounds(at(0, 0, sign.w, sign.h), sign);
      const face = V.ObjectEditing.bounds({ x: -sign.w / 2, y: -sign.h + routeTop[3], w: sign.w, h: sign.boardH }, sign);
      const { w, h } = offset, side = w / 2 + 40;
      const points = beside ? [[side, 0], [-side, 0], [side, 36], [-side, 36], [0, 60]] : [[0, 0], [side * 0.65, 8], [-side * 0.65, 8], [side, 26], [-side, 26], [0, 36], [0, -28]];
      let box = null, best = Infinity;
      const nearby = occupied.filter((part) => rectOverlap(part.box, { x: o.x - w - 124, y: o.y - h - 120, w: 2 * w + 248, h: h + 280 }));
      for (const [i, [dx, dy]] of points.entries()) {
        const x = V.clamp(o.x + dx, 16 - offset.x, m.width * T - 16 - offset.x - w);
        const y = V.clamp(o.y + dy, 14 - offset.y, m.height * T - 20 - offset.y - h);
        const foot = { x: x - 18, y: y - 10, w: 36, h: 11 };
        const candidate = { ...offset, x: offset.x + x, y: offset.y + y };
        const board = { ...face, x: face.x + x, y: face.y + y };
        const weight = nearby.reduce((sum, p) => sum + p.weight * (rectOverlap(board, p.box) / (board.w * board.h) + rectOverlap(candidate, p.box) / (w * h) * 0.4), 0);
        const blocked = m.solids.some((s) => rectOverlap(s, foot) > 0);
        const score = weight + i * 0.18 + (blocked ? 25 : 0) + (Math.abs(x - o.x) + Math.abs(y - o.y)) * 0.011;
        if (score < best) {
          best = score;
          box = { x, y };
        }
      }
      return box;
    },
    routeText(c, name) {
      c.save();
      c.font = routeFont;
      c.textAlign = "center";
      c.textBaseline = "alphabetic";
      const width = (line) => {
        const m = c.measureText(line);
        return Math.ceil(Math.max(m.width, (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || 0)));
      };
      const words = name.trim().split(/\s+/);
      let lines = [name], max = width(name);
      if (words.length > 1 && max > 146) {
        let score = Infinity;
        for (let i = 1; i < words.length; i++) {
          const pair = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
          const first = width(pair[0]), second = width(pair[1]), long = Math.max(first, second);
          const dangling = /^(d[aeo]s?|e|em|na|no|of|the|a|an)$/i.test(words[i - 1]);
          const balance = long + Math.abs(first - second) * 0.11 + (dangling ? 15 : 0);
          if (balance < score) {
            score = balance;
            lines = pair;
            max = long;
          }
        }
      }
      // Long names from custom maps can use extra rows without reducing letter size.
      if (max > 208 && words.length > 1) {
        lines = [];
        let line = "";
        for (const word of words) {
          const next = line ? line + " " + word : word;
          if (line && width(next) > 208) {
            lines.push(line);
            line = word;
          } else line = next;
        }
        lines.push(line);
        max = Math.max(...lines.map(width));
      }
      c.restore();
      return { lines, width: max };
    },
    drawRoute(c, o, cam) {
      const x = Math.round(o.x - cam.x), top = Math.round(o.y - cam.y - o.h);
      const { w, boardH, text } = o, img = V.Assets.images.props;
      if (!V.Assets.ready(img)) return;
      const left = Math.round(x - w / 2), y = top + routeTop[3], stemX = x - 53;
      c.save();
      c.imageSmoothingEnabled = false;
      c.drawImage(img, ...routeTop, stemX, top, 105, routeTop[3]);
      c.drawImage(img, ...routeBottom, stemX, y + boardH, 105, routeBottom[3]);
      c.drawImage(img, ...routeGrain, left + routeLeft[2], y, w - routeLeft[2] - routeTip[2], boardH);
      c.drawImage(img, ...routeLeft, left, y, routeLeft[2], boardH);
      c.drawImage(img, ...routeTip, left + w - routeTip[2], y, routeTip[2], boardH);
      c.font = routeFont;
      c.textAlign = "center";
      c.textBaseline = "alphabetic";
      c.fillStyle = "#2f1b10";
      const center = left + (w + routeLeft[2] - routeTip[2]) / 2;
      for (const [i, line] of text.lines.entries()) {
        const metrics = c.measureText(line);
        const mid = y + boardH / 2 + (i - (text.lines.length - 1) / 2) * routeGap;
        const baseline = mid + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
        c.fillText(line, center, Math.round(baseline));
      }
      c.restore();
    },
    drawFacade(c, o, cam) {
      const spec = this.spec(W.current || {}, o);
      if (!spec?.sprite) return;
      const image = V.Assets.images[facadeKey(spec.sprite)], { w, h } = spec;
      const x = o.x - cam.x, y = o.y - cam.y;
      if (V.Assets.ready(image)) {
        V.SceneShadows.contact(c, x, y + 3, w * 0.49, 11, 0.21);
        c.drawImage(image, Math.round(x - w / 2), Math.round(y - h), w, h);
      }
      this.doorMarker(c, o, cam);
    },
    doorMarker(c, o, cam) {
      if (W.nearest?.id === o.id) V.Living.marker(c, o.x - cam.x, o.y - cam.y + 8, "E", "#e8d2a2");
    },
    drawInteriorDoor(c, o, cam, m) {
      if (o.foodGalleryDoor && V.FoodGallery.drawPassage(c, o, cam)) {
        this.doorMarker(c, o, cam);
      } else if (m.culinaryInteriors && o.interiorDoor && V.CulinaryInteriors.drawPassage(c, o, cam, m)) {
        this.doorMarker(c, o, cam);
      } else {
        this.drawRoomDoor(c, o, cam, m.africanMuseum ? museumDoor : classicDoor, m);
      }
      return true;
    },
    drawRoomDoor(c, o, cam, door, m) {
      if (!V.ResidentialArt.door(c, o, cam, door, m)) V.Rooms.drawDoor(c, o, cam, door);
      return true;
    },
    drawEntry(c, o, cam, original, owner, args, m = W.current) {
      const affine = (fn, receiver) => V.ObjectEditing.draw(c, o, cam, fn, receiver, [c, o, cam]);
      if (drawsSign(o)) {
        if (this.indoors(m, o)) return true;
        if (o.type === type) return affine(this.draw, this);
        affine(this.drawRoute, this);
        return true;
      }
      if (this.interiorPassage(m, o))
        return V.ObjectEditing.draw(c, o, cam, this.drawInteriorDoor, this, [c, o, cam, m]);
      if (o.type === "room-door" && owner !== V.Cozy && this.indoors(m, o))
        return V.ObjectEditing.draw(c, o, cam, this.drawRoomDoor, this, [c, o, cam, o.door, m]);
      if (entranceArt[o.id]) return affine(this.drawFacade, this);
      if (o.travelSign && !["door", "room-door", "portal", "infinity-trail"].includes(o.type) && !(o.wordsRespectRole === "door" && W.current?.id !== "african-words")) {
        this.doorMarker(c, o, cam);
        return true;
      }
      return V.ObjectEditing.draw(c, o, cam, original, owner, args);
    },
    silhouette(sign) {
      const box = at(sign.x, sign.y, sign.w, sign.h);
      return boards[sign.style][2].map((band) => crop(box, band));
    },
    lettering(c, words, style, w, h) {
      const [, , u, v] = boards[style][1], max = w * u, height = h * v;
      for (let size = Math.min(16, Math.floor(height * 0.76)); size >= 11; size--) {
        c.font = fontFace(size);
        const lines = [];
        for (const word of words) {
          const current = lines.at(-1), next = current ? current + " " + word : word;
          if (current && c.measureText(next).width <= max) lines[lines.length - 1] = next;
          else lines.push(word);
        }
        const step = size + 2;
        if (lines.length <= 3 && size + (lines.length - 1) * step <= height && lines.every((line) => c.measureText(line).width <= max)) return { size, step, lines };
      }
      return null;
    },
    position(m, p, occupied, measure) {
      const profile = profiles[p.kind], { styles, sizes } = profile;
      const order = styles.map((_, i) => styles[(i + p.variant) % styles.length]);
      const center = p.door?.x ?? p.x;
      const target = sizes[1];
      const minW = Math.max(92, Math.min(target, p.face.w * 0.78));
      const words = p.name.trim().split(/\s+(?!(?:·|\/)(?:\s|$))/);
      const candidates = [];
      for (const [variant, style] of order.entries()) {
        const [, , sw, sh] = boards[style][0];
        for (const w of sizes) {
          const h = w * sh / sw, text = this.lettering(measure, words, style, w, h);
          if (text) candidates.push({ w, h, style, text, variant });
        }
      }
      if (!candidates.length) {
        const style = order[0], w = sizes.at(-1), [, , sw, sh] = boards[style][0], h = w * sh / sw;
        candidates.push({ w, h, style, variant: 0, text: { size: 11, step: 13, lines: [p.name] } });
      }
      const nearby = occupied.filter(({ box }) => rectOverlap(box, {
        x: p.face.x - 110,
        y: p.front - 35,
        w: p.face.w + 220,
        h: 260
      }));
      let best = null, bestScore = Infinity;
      for (const option of candidates) {
        const { w, h, style, variant, text } = option;
        const nudge = Math.min(p.face.w * 0.25, w * 0.68), doorSide = 25 + w * 0.45;
        const anchors = p.door ? [center - doorSide, center + doorSide, p.x, p.x - nudge, p.x + nudge] : [p.x, p.x - nudge * 0.5, p.x + nudge * 0.5, p.x - nudge, p.x + nudge];
        const minX = Math.max(w / 2 + 10, p.face.x + w * 0.16);
        const maxX = Math.min(m.width * T - w / 2 - 10, p.face.x + p.face.w - w * 0.16);
        for (const gap of [0, 4, 9, 16]) for (const anchor of anchors) {
          const x = V.clamp(anchor, minX, Math.max(minX, maxX));
          const y = Math.min(m.height * T - 12, p.front + gap + h);
          const shape = this.silhouette({ x, y, w, h, style });
          const area = shape.reduce((n, b) => n + b.w * b.h, 0);
          const crossing = shape.reduce((n, part) => n + nearby.reduce((k, { box, weight }) => k + rectOverlap(part, box) * weight, 0), 0) / Math.max(1, area);
          const offset = Math.abs(x - p.x) / Math.max(65, p.face.w);
          const heightCost = Math.max(0, h - (p.kind === "home" ? 82 : 98)) * 0.11;
          const sizeCost = Math.abs(w - minW) * 0.058 + Math.max(0, 13 - text.size) * 0.82 + heightCost;
          const styleCost = variant * profile.preference;
          const score = gap * 0.38 + offset * 5 + crossing * 5 + sizeCost + styleCost + Math.max(0, p.front - (y - h)) * 3;
          if (score < bestScore) {
            best = { x, y, w, h, style, text };
            bestScore = score;
          }
        }
      }
      return {
        id: type + "-" + p.id,
        type,
        name: p.name,
        label: "Placa da constru\xE7\xE3o \xB7 " + p.name,
        collectionOnly: true,
        interactionRange: 0,
        ...best
      };
    },
    draw(c, o, cam) {
      const x = o.x - cam.x, y = o.y - cam.y;
      const { w, h, style, text } = o, left = x - w / 2, top = y - h;
      const image = V.Assets.images[type], [frame, [u, v, pw, ph]] = boards[style];
      c.save();
      c.imageSmoothingEnabled = false;
      if (image?.naturalWidth) {
        c.drawImage(image, ...frame, left, top, w, h);
      } else {
        c.fillStyle = "#735036";
        c.fillRect(left + w * 0.22, top + h * 0.4, 5, h * 0.6);
        c.fillRect(left + w * 0.76, top + h * 0.4, 5, h * 0.6);
        c.fillStyle = "#b48a52";
        c.fillRect(left + w * u - 3, top + h * v - 3, w * pw + 6, h * ph + 6);
        c.fillStyle = "#29473c";
        c.fillRect(left + w * u, top + h * v, w * pw, h * ph);
      }
      c.font = fontFace(text.size);
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = "#fff0ce";
      text.lines.forEach((line, i) => c.fillText(
        line,
        left + w * (u + pw / 2),
        top + h * (v + ph / 2) + (i - (text.lines.length - 1) / 2) * text.step,
        w * pw
      ));
      c.restore();
      return true;
    }
  };
  const facadeAssets = Object.keys(facadeSizes).map((art) => [facadeKey(art), "assets/expansion/" + facadeKey(art) + ".webp"]);
  const facadeGroups = new Map(facadeAssets.map(([key, path]) => [path, key]));
  V.AssetLoader.addGroupRule("world-finalize:group:1", (key) => key === asset ? type : key === playFacadeAsset ? playFacade : facadeGroups.get(key) || void 0);
  V.Hooks.around(V.Assets, "load", "world-finalize:load:1", (loadAssets) => async function() {
    await this.loadEntries([[type, asset], [playFacade, playFacadeAsset], ...facadeAssets]);
    return loadAssets();
  });
  V.MapAssets.addGroupRule("world-finalize:groups:1", function(m, out) {
    if (m?.objects.some((o) => o.type === type)) out.push(type);
    if (m?.objects.some((o) => o.playMuseumExterior)) out.push(playFacade);
    for (const b of m?.buildings || []) if (buildingArt[b.door]) out.push(facadeKey(buildingArt[b.door]));
    for (const o of m?.objects || []) if (entranceArt[o.id]) out.push(facadeKey(entranceArt[o.id][1]));
  });
  const originalBuilding = V.Cozy.drawBuilding;
  V.Cozy.drawBuilding = function(c, b, cam) {
    const art = buildingArt[b.door], img = art && V.Assets.images[facadeKey(art)];
    if (!V.Assets.ready(img)) return originalBuilding.call(this, c, b, cam);
    const { x, y, w, h } = S.buildingFace(W.current, b);
    c.save();
    c.imageSmoothingEnabled = false;
    c.drawImage(img, Math.round(x - cam.x), Math.round(y - cam.y), w, h);
    c.restore();
  };
  const renderers = [
    [V.Cozy, "drawObject"],
    [V.Maritime, "drawObject"],
    [V.CapeRegion, "drawObject"],
    [V.Salon, "drawObject"],
    [V.AfricanMuseum, "drawObject"],
    [V.AfricanCuration, "drawObject"],
    [V.FossilGallery, "draw"],
    [V.AnimalSanctuary, "draw"],
    [V.NatureWorld, "draw"],
    [V.AnimalMuseum, "draw"],
    [V.FoodMuseum, "draw"],
    [V.CulinaryWorld, "draw"],
    [V.CampusRenewal, "draw"],
    [V.WordsRespect, "draw"]
  ];
  for (const [owner, method] of renderers) {
    const draw = owner[method];
    owner[method] = function(c, o, cam, ...args) {
      return S.drawEntry(c, o, cam, draw, this, [c, o, cam, ...args]);
    };
  }
  V.Hooks.around(V.Atlas, "landmark", "world-finalize:landmark:1", (landmark) => function(c, o, m) {
    const cam = { x: 0, y: 0 };
    if (drawsSign(o) || S.interiorPassage(m, o) || o.type === "room-door" && S.indoors(m, o) || entranceArt[o.id] || o.travelSign && !["door", "room-door", "portal", "infinity-trail"].includes(o.type))
      return S.drawEntry(c, o, cam, landmark, null, [c, o, m], m);
    if (o.playMuseumExterior) return V.ObjectEditing.draw(c, o, cam, V.PlayMuseum.drawFacade, V.PlayMuseum, [c, o, cam]);
    return V.ObjectEditing.draw(c, o, cam, landmark, null, [c, o, m]);
  });
  const interactables = W.interactables.bind(W);
  W.interactables = function() {
    return interactables().filter((o) => !drawsSign(o));
  };
  // Older editor exports can contain manual coordinates for generated indoor signs.
  const signId = (id) => typeof id === "string" && (id.startsWith(type + "-") || id.startsWith(pathSign + "-"));
  const normalise = V.SceneDesign.normalise;
  V.SceneDesign.normalise = function(doc) {
    const layouts = doc?.maps;
    if (!layouts || typeof layouts !== "object" || Array.isArray(layouts)) return normalise.call(this, doc);
    let maps = layouts;
    for (const [id, design] of Object.entries(layouts)) {
      const live = W.maps[id];
      if (!design || typeof design !== "object" || !S.indoors({
        id,
        theme: live?.theme,
        cityInterior: live?.cityInterior,
        roomBuilder: design.builderMap,
        design
      })) continue;
      let clean = design;
      for (const key of ["positions", "objectEdits"]) {
        const values = design[key];
        if (values && typeof values === "object" && !Array.isArray(values) && Object.keys(values).some(signId))
          clean = { ...clean, [key]: Object.fromEntries(Object.entries(values).filter(([name]) => !signId(name))) };
      }
      if (Array.isArray(design.removedObjects) && design.removedObjects.some(signId))
        clean = { ...clean, removedObjects: design.removedObjects.filter((name) => !signId(name)) };
      if (clean !== design) {
        if (maps === layouts) maps = { ...layouts };
        maps[id] = clean;
      }
    }
    return normalise.call(this, maps === layouts ? doc : { ...doc, maps });
  };
  const preview = V.SceneDesign.preview.bind(V.SceneDesign);
  V.SceneDesign.preview = function(...args) {
    const m = preview(...args);
    S.install(m);
    return m;
  };
  V.Hooks.around(W, "init", "world-finalize:entrances", (next) => function(...args) {
    const result = next(...args);
    V.PlazaLayout.install(W.maps.hub);
    V.PortalSpacing.all();
    for (const m of Object.values(W.maps)) S.install(m);
    return result;
  });
});
