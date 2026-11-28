/* Registered module: coast-world */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("coast-world", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, C = V.Cozy, L = V.Living, W = V.World, D = V.SceneDesign, E = V.SceneEditor, T = 48, copy = (x) => JSON.parse(JSON.stringify(x)), esc = V.escape;
    const previous = { districts: L.newDistricts.bind(L), residents: L.residents.bind(L), compose: C.compose.bind(C), ground: C.ground.bind(C), render: C.render.bind(C), draw: C.drawObject.bind(C), interact: C.interact.bind(C), animal: C.prepareAnimal.bind(C), path: C.path.bind(C), blocked: C.blocked.bind(C), prop: C.prop.bind(C), assets: V.Assets.load.bind(V.Assets), workshop: L.workshop.bind(L), ensure: C.ensure.bind(C), normalise: D.normalise.bind(D), document: D.document.bind(D), regions: V.Atlas.regions.bind(V.Atlas) };
    for (const data of [V.wardrobeContent, V.coastContent]) for (const key of ["sources", "readings", "questions", "residents"]) for (const item of data[key] || []) if (!V.cozyContent[key].some((x) => x.id === item.id)) V.cozyContent[key].push(item);
    V.Culture.gallery.push(...V.wardrobeContent.gallery);
    Object.assign(V.content.characters, V.wardrobeContent.characters, { iemanja: { name: "Iemanj\xE1 \xB7 s\xEDmbolos e tradi\xE7\xF5es", role: "Arte e cultura afro-brasileira", accent: "#a8d5df", quote: "" } });
    for (const a of V.beachAssets.filter((a2) => a2.category === "pisos")) {
      const item = V.sceneAssets.find((s) => s.family === "beach" && s.index === a.index);
      Object.assign(item, { family: "floor", index: 12 + a.index - 48, sourceFamily: "beach", sourceIndex: a.index });
    }
    const scene = (id, kind, x, y, prop, title, text, size = 1.3) => ({ id, kind, x, y, family: "beach", prop, title, text, size, dir: 0 });
    const decor = (index, x, y, size = 1, solid = true) => ["beach", index, x, y, size, solid, { id: "coast-prop-" + index + "-" + x + "-" + y, layer: V.beachAssets[index].layer || "object" }];
    C.layouts.beach = { purpose: "Uma praia de bairro com cal\xE7ad\xE3o, sombra, descanso, observa\xE7\xE3o e um ponto educativo sobre Iemanj\xE1.", palette: ["#e2c99a", "#b1aaa0", "#f4e5bf"], floor: "sand", paths: [[3, 2, 2, 20], [5, 17, 15, 1], [5, 4, 13, 1]], zones: [["Cal\xE7ad\xE3o e quiosque", 2, 2, 5, 19], ["Descanso \xE0 sombra", 9, 8, 8, 10], ["Arte, mem\xF3ria e mar", 18, 3, 5, 7], ["Fauna e observa\xE7\xE3o", 20, 13, 3, 8]], decor: [decor(40, 7, 2, 2), decor(41, 7, 17, 1.8), decor(42, 20, 2, 1.2, false), decor(43, 19, 20, 1.3, false), decor(44, 8, 20, 1.2, false), decor(0, 10, 8, 2), decor(1, 15, 13, 2), decor(4, 11, 11, 1.5, false), decor(5, 18, 10, 1.2, false), decor(6, 8, 9, 1.1), decor(9, 8, 4, 1.5), decor(7, 18, 15, 2), decor(10, 16, 16, 1, false), decor(12, 9, 19, 2.1, false), decor(13, 3, 10, 1.4), decor(14, 4.5, 14, 1.1), decor(18, 22, 12, 0.8, false), decor(18, 21, 19, 0.8, false), decor(46, 20, 21, 1.1, false), decor(17, 27, 5, 2, false)], scenes: [scene("coast-rest-1", "seat", 11, 10, 2, "Espregui\xE7adeira sob o guarda-sol", "Um lugar de descanso com vista para a areia."), scene("coast-rest-2", "seat", 16, 15, 3, "Cadeira da roda de conversa", "Sombra e uma passagem livre para quem chega."), scene("coast-kiosk", "food", 4, 5, 19, "Quiosque de Nalu", "\xC1gua, sucos e lanches. O trabalho inclui manter o balc\xE3o e a faixa de passagem limpos.", 1.6), scene("coast-guide", "notice", 18, 5, 16, "Arte e contextos de Iemanj\xE1", "Conhe\xE7a o abeb\xE9, as cores e os significados presentes na obra sobre Iemanj\xE1."), scene("coast-notes", "sketch", 21, 16, 19, "Caderno do litoral", "Registre o que observa antes de formular uma hip\xF3tese."), scene("coast-care", "notice", 6, 16, 14, "Cuidar de uma praia compartilhada", "Combine caminhos livres, observa\xE7\xE3o \xE0 dist\xE2ncia e descarte no lugar adequado."), scene("coast-sources", "shelf", 6, 7, 56, "Leituras do litoral", "Iemanj\xE1, observa\xE7\xE3o e cuidado compartilhado. As refer\xEAncias permanecem dispon\xEDveis.")], positions: { "coast-book-iemanja": [18, 7], "coast-note-observation": [21, 18], "coast-book-shared-care": [6, 18], "work-coast-observe": [20, 17], "work-coast-context": [19, 6], "work-coast-care": [6, 17] }, anchors: [["coast-water", 21, 11, "observing", 22, 2], ["coast-watch", 21, 15, "observing", 26, 2], ["coast-sand", 14, 11, "observing", 18, 2], ["coast-kiosk-work", 4, 6.5, "working", 22, 3], ["coast-walk", 14, 18, "walking", 14, 2], ["coast-read", 9, 15, "reading", 28, 3]], meeting: [13, 14], routines: {} };
    Object.assign(C.layouts.beach.scenes.find((s) => s.id === "coast-guide"), { family: "scene", prop: 21, size: 1.2 });
    Object.assign(C.layouts.beach.scenes.find((s) => s.id === "coast-sources"), { family: "expanded", prop: 62, size: 1.35 });
    const homes = { "beach-lara": [21, 12], "beach-jorge": [13, 11], "beach-samira": [17, 8], "beach-ivo": [9, 6], "beach-nalu": [4, 7], "beach-celina": [10, 15], "beach-rebeca": [20, 16], "beach-beto": [8, 16] };
    const tasks = { "beach-lara": ["coast-water", "coast-notes", "coast-rest-2"], "beach-jorge": ["coast-sand", "coast-rest-1"], "beach-samira": ["coast-guide", "coast-rest-2", "coast-sources"], "beach-ivo": ["coast-walk", "coast-rest-1"], "beach-nalu": ["coast-kiosk-work", "coast-kiosk"], "beach-celina": ["coast-read", "coast-rest-1"], "beach-rebeca": ["coast-watch", "coast-water"], "beach-beto": ["coast-care", "coast-walk", "coast-rest-2"] };
    for (const r of V.wardrobeContent.residents) {
      const id = "resident-" + r.id;
      C.layouts.beach.positions[id] = homes[r.id];
      C.layouts.beach.routines[id] = tasks[r.id];
    }
    V.cozyContent.conversations.push({ map: "beach", lines: ["Deixei a canga perto da sombra.", "Depois a gente observa as aves dali.", "Combinado. Sem chegar perto dos animais."], enLines: ["I left the towel near the shade.", "Then we can watch the birds from there.", "Agreed. We will stay away from the animals."] });
    const missions = [
      { id: "coast-observe", title: "O mar no caderno", owner: "beach-lara", map: "beach", coast: true, brief: "Lara est\xE1 comparando anota\xE7\xF5es. Observe os animais, leia o caderno e separe uma observa\xE7\xE3o de uma hip\xF3tese.", reward: "Painel de observa\xE7\xF5es revisado na praia", steps: [{ kind: "talk", targets: ["beach-lara"], label: "Converse com Lara perto da faixa de areia." }, { kind: "read", targets: ["coast-note-observation"], label: "Consulte o caderno de observa\xE7\xE3o do litoral." }, { kind: "puzzle", targets: ["coast-observe"], label: "Compare os registros na mesa de observa\xE7\xE3o." }] },
      { id: "coast-context", title: "Uma imagem e seu contexto", owner: "beach-samira", map: "beach", coast: true, brief: "Samira re\xFAne refer\xEAncias para uma legenda. Leia sobre a representa\xE7\xE3o de Iemanj\xE1 e escolha uma descri\xE7\xE3o que identifique sua autoria e seus limites.", reward: "Legenda de contexto dispon\xEDvel junto \xE0 figura", steps: [{ kind: "talk", targets: ["beach-samira"], label: "Converse com Samira perto do ponto de arte." }, { kind: "read", targets: ["coast-book-iemanja"], label: "Leia o registro sobre Iemanj\xE1." }, { kind: "puzzle", targets: ["coast-context"], label: "Revise a legenda do ponto educativo." }] },
      { id: "coast-care", title: "Uma praia para compartilhar", owner: "beach-beto", map: "beach", coast: true, brief: "Beto est\xE1 revisando o aviso do cal\xE7ad\xE3o. Consulte a leitura e combine a\xE7\xF5es que cuidam de pessoas, animais e caminhos.", reward: "Aviso comunit\xE1rio revisado no cal\xE7ad\xE3o", steps: [{ kind: "read", targets: ["coast-book-shared-care"], label: "Leia sobre cuidado compartilhado no litoral." }, { kind: "puzzle", targets: ["coast-care"], label: "Ajude a revisar o aviso junto \xE0s lixeiras." }] }
    ];
    L.missions.push(...missions);
    for (const [map, index, x, y, z] of [["hub", 37, 6.5, 11, 1.2], ["park", 35, 3, 17, 1.25], ["garden", 46, 20, 4, 0.9], ["room-2", 33, 12, 11, 1.1], ["room-4", 27, 20.5, 14, 1.15], ["room-5", 34, 3, 14, 1.1], ["market", 56, 20, 6, 1.2], ["market", 59, 25, 7, 1.1]]) C.layouts[map].decor.push(["beach", index, x, y, z, true, { id: "coast-neighbor-" + map + "-" + index, layer: "object" }]);
    D.defaults = copy(C.layouts);
    L.newDistricts = function() {
      previous.districts();
      const m = W.base("beach", "community", 32, 24);
      m.name = "Praia das Mar\xE9s \xB7 mem\xF3ria e encontro";
      m.biome = "beach";
      W.object(m, "exit", "beach-exit", 4, 21, "Voltar \xE0 Pra\xE7a das Vozes", { to: "hub" });
      for (const r of V.wardrobeContent.residents) {
        const [x, y] = homes[r.id];
        W.object(m, "resident", "resident-" + r.id, x, y, "Conversar com " + r.name, { character: r.character, resident: r, homeMap: "beach", stationary: ["beach-nalu", "beach-celina", "beach-rebeca"].includes(r.id) });
      }
      W.object(m, "resident", "coast-iemanja", 21, 7, "Conhecer a representa\xE7\xE3o de Iemanj\xE1", { character: "iemanja", faithRepresentation: true, stationary: true, resident: { id: "coast-iemanja", name: "Iemanj\xE1 \xB7 s\xEDmbolos e tradi\xE7\xF5es", role: "Arte e cultura afro-brasileira", lines: [] } });
      const animals = [[0, 8, 17, "C\xE3o sem ra\xE7a definida de Beto"], [1, 14, 12, "Golden retriever de Jorge"], [4, 22, 12, "Caranguejo na areia"], [5, 22, 18, "Ave do litoral"], [6, 24.6, 9, "Tartaruga marinha observada \xE0 dist\xE2ncia"], [7, 24.6, 18, "Peixes na \xE1gua"]];
      for (const [row, x, y, name] of animals) W.object(m, "animal", "coast-animal-" + row, x, y, "Observar: " + name, { coastAnimal: row, species: row === 6 || row === 7 ? 4 : row === 5 ? 3 : 0, behavior: row < 2 ? "descansa perto de seu respons\xE1vel" : row === 4 ? "caminha pela areia" : row === 5 ? "pousa e faz voos curtos" : row === 6 ? "nada no mar; observe \xE0 dist\xE2ncia" : "nada em um pequeno cardume", coastHome: [x, y] });
      W.maps.beach = m;
      W.object(W.maps.hub, "travel", "travel-beach", 18, 19, "Ir \xE0 Praia das Mar\xE9s", { to: "beach", prop: 44 });
    };
    L.residents = function() {
      const all = V.learning.residents;
      V.learning.residents = all.filter((r) => !V.wardrobeContent.residents.some((n) => n.id === r.id));
      try {
        return previous.residents();
      } finally {
        V.learning.residents = all;
      }
    };
    function addCoastAnimal(m, row, x, y, id, label) {
      W.object(m, "animal", id, x, y, label, { coastAnimal: row, species: 1, coastHome: [x, y], behavior: "descansa perto do espa\xE7o de leitura e de quem cuida dele" });
    }
    const animalDefs = { hub: [[3, 7, 15, "coast-hub-cat", "Gato preto e branco da pra\xE7a"]] };
    C.compose = function(m) {
      if (m.id === "library") {
        const cat = m.objects.find((o) => o.type === "animal" && o.species === 1);
        if (cat) Object.assign(cat, { coastAnimal: 2, coastHome: [7, 13] });
      }
      if (animalDefs[m.id]) {
        for (const a of animalDefs[m.id]) if (!m.objects.some((o) => o.id === a[3])) addCoastAnimal(m, ...a);
      }
      if (m.id === "beach") {
        for (const q of missions) if (!m.objects.some((o) => o.id === "work-" + q.id)) {
          const point = q.id === "coast-observe" ? [20, 17] : q.id === "coast-context" ? [19, 6] : [6, 17];
          W.object(m, "workbench", "work-" + q.id, ...point, "Oficina: " + q.title, { mission: q.id, richProp: 12 });
        }
        if (!m.objects.some((o) => o.id === "history-beach")) W.object(m, "history", "history-beach", 18, 19, "Perguntas: litoral e contextos", { chapter: 1, prop: 15 });
      }
      previous.compose(m);
      if (m.id === "beach") {
        m.solids.push({ x: 24 * T, y: 0, w: (m.width - 24) * T, h: m.height * T, owner: "coast-ocean" });
        for (const o of m.objects.filter((o2) => o2.faithRepresentation)) {
          o.tasks = ["home-" + o.id];
          o.waypoints = o.tasks.map((id) => m.anchors.get(id));
          o.stationary = true;
        }
        for (const o of m.objects.filter((o2) => o2.type === "workbench")) {
          const positions = { "work-coast-observe": [20, 17], "work-coast-context": [19, 6], "work-coast-care": [6, 17] }, p = m.design.positions?.[o.id] || positions[o.id];
          if (p) {
            o.x = p[0] * T + 24;
            o.y = p[1] * T + 24;
          }
        }
        m.cache = null;
      }
    };
    V.Coast = { missions, floorTiles: new Map(), shore(y) {
      return 23 + Math.sin(y * 0.31) * 0.45;
    }, floorTile(index) {
      if (this.floorTiles.has(index)) return this.floorTiles.get(index);
      const a = D.asset("floor", index), c = document.createElement("canvas");
      c.width = c.height = 32;
      const ctx = c.getContext("2d"), img = V.EditorMaterials.images.beach || V.Assets.images["beach-props"];
      if (img) {
        const i = a.sourceIndex;
        ctx.drawImage(img, i % 8 * 32, Math.floor(i / 8) * 32, 32, 32, 0, 0, 32, 32);
      }
      this.floorTiles.set(index, c);
      return c;
    }, panel() {
      const figure = V.coastContent.iemanja;
      V.UI.modal(figure.title, "REPRESENTA\xC7\xC3O ART\xCDSTICA ORIGINAL \xB7 CONTEXTO EDUCATIVO", `<article class="coast-figure"><canvas id="coast-figure-portrait" width="160" height="160" role="img" aria-label="Representa\xE7\xE3o art\xEDstica de Iemanj\xE1"></canvas><div><p>${esc(figure.description)}</p>${figure.lines.map((l) => `<p>${esc(l.pt)}</p>`).join("")}<p class="note">A ilustra\xE7\xE3o foi criada para VOICES a partir de refer\xEAncias documentadas. Ela n\xE3o \xE9 uma pessoa hist\xF3rica, uma r\xE9plica de objeto consagrado ou uma fala sagrada.</p>${C.sourceLinks(figure.sourceIds)}</div></article>`, `<button id="coast-figure-read" class="primary">Ler: imagem e contexto</button><button id="coast-figure-close" class="secondary">Voltar \xE0 praia</button>`);
      const portrait = V.$("#coast-figure-portrait").getContext("2d");
      if (!V.Presences?.portrait(portrait, "iemanja")) V.UI.drawPortrait(portrait.canvas, "iemanja");
      V.$("#coast-figure-read").onclick = () => L.read("coast-book-iemanja", 0, () => this.panel());
      V.$("#coast-figure-close").onclick = () => V.UI.close();
    }, workshop(id) {
      const q = missions.find((q2) => q2.id === id);
      if (!q) return;
      L.ensure();
      if (!V.state.sideQuests[id]?.started) {
        L.showMission(id);
        return;
      }
      const group = {
        "coast-observe": { reading: "coast-note-observation", prompt: "Qual registro descreve algo observado, sem afirmar uma causa n\xE3o conferida?", options: ["A ave pousou perto da \xE1gua.", "A ave est\xE1 triste porque ningu\xE9m falou com ela.", "O caranguejo conhece todos os moradores."], correct: 0, explanation: "Pousar \xE9 uma a\xE7\xE3o que pode ser registrada. Tristeza e conhecimento exigiriam outra evid\xEAncia." },
        "coast-context": { reading: "coast-book-iemanja", prompt: "Qual legenda preserva o contexto desta figura?", options: ["Todo mundo representa Iemanj\xE1 do mesmo jeito.", "Iemanj\xE1 \xE9 associada \xE0s \xE1guas e \xE0 maternidade nas tradi\xE7\xF5es apresentadas.", "A cor da roupa revela a cren\xE7a de qualquer pessoa."], correct: 1, explanation: "A leitura apresenta a rela\xE7\xE3o de Iemanj\xE1 com as \xE1guas e a maternidade e situa a Festa de Iemanj\xE1 no Rio Vermelho, em Salvador." },
        "coast-care": { reading: "coast-book-shared-care", prompt: "Que proposta cuida do espa\xE7o compartilhado?", options: ["Chegar bem perto dos animais para fotografar.", "Deixar objetos na passagem principal.", "Manter caminhos livres, observar \xE0 dist\xE2ncia e usar os pontos de descarte."], correct: 2, explanation: "Essas a\xE7\xF5es respeitam quem usa a praia e os animais. O cuidado pode ser combinado e revisto em grupo." }
      }[id];
      V.UI.modal(q.title, "OBSERVE, CONSULTE E REVISE", `<p>${esc(q.brief)}</p><strong>${esc(group.prompt)}</strong><div class="stack">${group.options.map((s, i) => `<button class="choice-button" data-coast-answer="${i}">${esc(s)}</button>`).join("")}</div><p id="coast-feedback" aria-live="polite"></p>`, `<button id="coast-review-read" class="secondary">Consultar a leitura</button><button id="coast-record" class="primary" disabled>Guardar no painel</button>`);
      V.$$("[data-coast-answer]").forEach((b) => b.onclick = () => {
        const good = +b.dataset.coastAnswer === group.correct;
        V.$("#coast-feedback").textContent = (good ? "Boa observa\xE7\xE3o. " : "Reveja o contexto. ") + group.explanation;
        V.$("#coast-record").disabled = !good;
      });
      V.$("#coast-review-read").onclick = () => L.read(group.reading, 0, () => this.workshop(id));
      V.$("#coast-record").onclick = () => {
        V.state.coast.completed.push(id);
        L.event("puzzle", id);
        V.Save.save();
        V.Atlas.cache.clear();
        V.UI.close();
        V.UI.toast(q.reward + ".");
      };
    } };
    C.ensure = function() {
      previous.ensure();
      if (!V.state) return;
      if (!V.state.coast || typeof V.state.coast !== "object" || Array.isArray(V.state.coast)) V.state.coast = {};
      V.state.coast.completed = Array.isArray(V.state.coast.completed) ? [...new Set(V.state.coast.completed.filter((id) => missions.some((q) => q.id === id)))] : [];
    };
    C.prepareAnimal = function(m, o) {
      if (o.coastAnimal === void 0) return previous.animal(m, o);
      const point = m.design.positions?.[o.id] || o.coastHome || [8, 17], water = [6, 7].includes(o.coastAnimal);
      o.x = point[0] * T + 24;
      o.y = point[1] * T + 24;
      o.home = { x: o.x, y: o.y };
      o.dir = 0;
      o.animalFacing = 2;
      o.frame = 0;
      o.walkClock = 0;
      o.walking = false;
      o.wait = 5;
      o.taskTime = 7 + o.coastAnimal;
      o.taskIndex = 0;
      o.action = water ? "swimming" : o.coastAnimal === 2 || o.coastAnimal === 3 ? "sleeping" : "observing";
      o.speed = water ? 9 : o.coastAnimal === 5 ? 25 : 13;
      o.iconTime = 0;
      o.nextIcon = 20;
      o.route = [];
      const offsets = water ? [[0, 0], [0, 1.4], [0, -1.2]] : o.coastAnimal < 4 ? [[0, 0], [1, 0], [0, 1]] : [[0, 0], [0, 1], [0, -1]];
      o.waypoints = offsets.map(([dx, dy], i) => {
        const p = water ? { x: point[0] + dx, y: point[1] + dy } : C.safe(m, point[0] + dx, point[1] + dy);
        return { id: "coast-animal-" + o.id + "-" + i, x: p.x * T + 24, y: p.y * T + 24, state: water ? "swimming" : o.coastAnimal < 4 ? "resting" : o.coastAnimal === 5 ? "perching" : "observing", duration: water ? 4 : 12, dir: 0 };
      });
      o.x = o.waypoints[0].x;
      o.y = o.waypoints[0].y;
    };
    C.path = function(m, o, a) {
      if (m.id === "beach" && [6, 7].includes(o.coastAnimal)) return [{ x: a.x, y: a.y }];
      return previous.path(m, o, a);
    };
    C.blocked = function(m, o, x, y) {
      if (m.id === "beach" && [6, 7].includes(o.coastAnimal)) return x < 24.05 * T || x > 25.1 * T || y < 3 * T || y > (m.height - 2) * T;
      return previous.blocked(m, o, x, y);
    };
    C.prop = function(ctx, family, index, x, y, size = T, materials = null) {
      if (family !== "beach") return previous.prop(ctx, family, index, x, y, size, materials);
      const colored = V.EditorMaterials.tinted(family, index, materials), image = V.Assets.images["beach-props"];
      if (colored) ctx.drawImage(colored, Math.round(x), Math.round(y), size, size);
      else if (image) ctx.drawImage(image, index % 8 * 32, Math.floor(index / 8) * 32, 32, 32, Math.round(x), Math.round(y), size, size);
    };
    C.ground = function(m) {
      if (m.id !== "beach") return previous.ground(m);
      const c = V.GroundCache.create(m, m.width * T, m.height * T);
      ;
      ;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#e2c99a";
      ctx.fillRect(0, 0, V.GroundCache.width(c), V.GroundCache.height(c));
      for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) {
        const edge = V.Coast.shore(y), i = x < 6 ? 51 : x < edge ? 48 : 49;
        ctx.globalAlpha = x < 6 ? 1 : 0.45;
        C.prop(ctx, "beach", i, x * T, y * T, T);
        ctx.globalAlpha = 1;
        if (x >= edge) {
          ctx.fillStyle = x < 24 ? "#78b7b4" : x < 27 ? "#478f9f" : "#337287";
          ctx.fillRect(x * T, y * T, T, T);
        }
        if (x === edge) {
          ctx.fillStyle = "#f2e7c855";
          ctx.fillRect(x * T, y * T, T / 2, T);
        }
      }
      for (let yy = 0; yy < V.GroundCache.height(c); yy += 6) {
        const edge = Math.round((23 + Math.sin(yy / T * 0.31) * 0.45) * T / 3) * 3;
        ctx.fillStyle = "#baa07c";
        ctx.fillRect(edge - 18, yy, 30, 6);
        ctx.fillStyle = "#89c3ba";
        ctx.fillRect(edge + 6, yy, 28, 6);
        ctx.fillStyle = "#569caa";
        ctx.fillRect(edge + 34, yy, 96, 6);
        ctx.fillStyle = "#337287";
        ctx.fillRect(edge + 130, yy, V.GroundCache.width(c) - edge - 130, 6);
      }
      for (const [x, y, w, h] of m.design.paths) for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) C.prop(ctx, "beach", 53, xx * T, yy * T, T);
      ctx.fillStyle = "#344d48";
      ctx.fillRect(0, 0, 12, V.GroundCache.height(c));
      ctx.fillRect(0, 0, V.GroundCache.width(c), 12);
      ctx.fillRect(0, V.GroundCache.height(c) - 12, V.GroundCache.width(c), 12);
      V.Engine.text(ctx, "PRAIA DAS MAR\xC9S", 4 * T, 2 * T, "#3f554c", 14, "center");
      m.cache = c;
    };
    const beforePond = C.pond.bind(C);
    C.pond = function(ctx, m, cam) {
      beforePond(ctx, m, cam);
      if (m.id !== "beach") return;
      const time = V.settings.reducedMotion ? 0 : C.clock;
      ctx.fillStyle = "#d9f0df99";
      for (let y = 2; y < m.height - 1; y++) {
        const edge = V.Coast.shore(y), shift = Math.round(Math.sin(time * 0.8 + y * 0.6) * 5);
        ctx.fillRect(edge * T + shift - cam.x, y * T + 11 - cam.y, 7, 30);
        if (y % 2 === 0) {
          ctx.fillStyle = "#abd6cf77";
          ctx.fillRect((25 + y % 3) * T - cam.x, y * T + 25 - cam.y, 29, 3);
          ctx.fillStyle = "#d9f0df99";
        }
      }
    };
    V.Hooks.around(V.Cozy, "drawObject", "coast-world:drawObject:1", () => function(ctx, o, cam, t) {
      if (o.coastAnimal !== void 0) {
        const x = o.x - cam.x, y = o.y - cam.y;
        L.drawTownAnimal(ctx, o, x, y);
        if (W.nearest?.id === o.id) L.marker(ctx, x, y, "E", "#eee0b8");
        return;
      }
      if (o.faithRepresentation) {
        const z = o.visualScale || 1, special = V.Presences?.drawObject(ctx, o, cam);
        if (!special) V.Assets.sprite(ctx, "iemanja", o.x - cam.x, o.y - cam.y, o.dir || 0, V.settings.reducedMotion ? 0 : Math.floor(C.clock * 0.7) % 4, 72 * z);
        if (W.nearest?.id === o.id) L.marker(ctx, o.x - cam.x, o.y - cam.y - (special ? 85 : 0), "E", "#cae7e4");
        return;
      }
      previous.draw(ctx, o, cam, t);
      if (W.current?.id === "beach" && o.type === "workbench" && V.state.coast?.completed.includes(o.mission)) {
        ctx.fillStyle = "#6e9871";
        ctx.fillRect(o.x - cam.x + 12, o.y - cam.y - 27, 10, 9);
        V.Engine.text(ctx, "\u2713", o.x - cam.x + 17, o.y - cam.y - 19, "#f1ebd5", 8, "center");
      }
    });
    C.interact = function(o) {
      if (o.faithRepresentation) {
        V.Coast.panel();
        return true;
      }
      if (o.scene?.id === "coast-guide") {
        V.Coast.panel();
        return true;
      }
      if (o.scene?.id === "coast-sources") {
        C.shelf({ ...o, scene: { ...o.scene, readingIds: V.coastContent.readings.map((r) => r.id) } });
        return true;
      }
      if (o.scene?.id === "coast-notes") {
        V.Coast.workshop("coast-observe");
        return true;
      }
      if (o.scene?.id === "coast-care") {
        V.Coast.workshop("coast-care");
        return true;
      }
      if (o.coastAnimal !== void 0) return V.FieldGuide.panel(o);
      return previous.interact(o);
    };
    L.workshop = function(id) {
      if (missions.some((q) => q.id === id)) V.Coast.workshop(id);
      else previous.workshop(id);
    };
    const priorEvent = L.event.bind(L);
    L.event = function(kind, value, record) {
      priorEvent(kind, value, record);
      if (!V.state) return;
      for (const q of missions) {
        const s = V.state.sideQuests[q.id];
        if (s?.started && !s.done && q.steps[s.step]?.kind === "puzzle" && V.state.coast?.completed.includes(q.id)) priorEvent("puzzle", q.id);
      }
    };
    const host = D.host.bind(D);
    D.host = function(m, o, family, prop, size) {
      if (m.id === "beach" && o.type === "workbench") return host(m, o, "beach", 19, 1.3);
      return host(m, o, family, prop, size);
    };
    D.document = function(maps) {
      return { ...previous.document(maps), revision: 4 };
    };
    D.normalise = function(doc) {
      const input = copy(doc);
      if (input?.maps && (input.revision || 0) < 4) {
        if (!input.maps.beach) input.maps.beach = copy(D.defaults.beach);
      }
      const clean = previous.normalise(input);
      return clean;
    };
    V.Hooks.around(V.Assets, "load", "coast-world:load:1", () => async function() {
      const ids = [...V.wardrobeContent.residents.map((r) => r.character), "iemanja"], entries = ids.flatMap((id) => [[id, "assets/characters/" + id + ".png"], [id + "-portrait", "assets/characters/" + id + "-portrait.png"]]).concat([["beach-props", "assets/tilesets/beach-props.png"], ["coast-animals", "assets/characters/coast-animals.png"]]);
      await Promise.all([previous.assets(), this.loadEntries(entries), new Promise((resolve) => {
        const img = V.Assets.image();
        img.onload = () => {
          V.EditorMaterials.images.beach = img;
          resolve();
        };
        img.onerror = () => {
          V.Assets.errors.push("Cores dos m\xF3veis de praia");
          resolve();
        };
        img.src = V.beachMaterialSources.beach;
      })]);
      return this.errors;
    });
    V.Atlas.regions = function() {
      previous.regions();
      const target = V.$(".atlas-neighbors"), button = document.createElement("button");
      button.className = "map-card";
      button.dataset.localRegion = "beach";
      button.innerHTML = '<canvas class="map-preview" data-map-preview="beach" width="384" height="240" aria-hidden="true"></canvas><b>Praia das Mar\xE9s</b><small>Mar, descanso, mem\xF3ria e cuidado compartilhado.</small><span class="map-card-action">Visitar \u2192</span>';
      target.appendChild(button);
      V.Atlas.paint(button.querySelector("canvas"), W.maps.beach);
      button.onclick = () => {
        V.UI.close();
        W.load("beach");
      };
    };
    const worldLoad = W.load.bind(W);
    W.load = function(id, position = null) {
      return worldLoad(id, id === "beach" && !position ? { x: 4 * T + 24, y: 21 * T } : position);
    };
  })();
});
