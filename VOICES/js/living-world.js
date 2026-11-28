/* Registered module: living-world */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("living-world", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V;
    const T = 48;
    const esc = (s) => V.escape(s);
    const animalNames = ["C\xE3o da pra\xE7a", "Gato da biblioteca", "Pombo", "Passarinho", "Pato", "Borboleta"];
    const animalBehaviors = ["fareja o caminho e descansa \xE0 sombra", "observa o movimento e se espregui\xE7a", "caminha perto dos bancos", "pousa nas \xE1rvores do parque", "passeia perto do lago", "voa sobre os canteiros"];
    const townMotion = { file: "assets/characters/town-animal-motion.webp", rows: [0, 1, 2, 4, 6, 7], sizes: [49, 43, 36, 36, 44, 29] };
    const localAnimalSize = [49, 43, 49, 52, 43, 43, 40, 45, 47, 40, 44, 46, 45, 48, 46, 45];
    const movingFrames = [1, 0, 2, 0], breathingFrames = [4, 5, 6, 7, 6, 5];
    V.Hooks.around(V.Assets, "load", "living-world:load:1", (loadAssets) => async function(...args) {
      const entries = [
        ["townAnimals", townMotion.file],
        ["localAnimals", "assets/characters/neighborhood-animal-motion.webp"]
      ];
      const [result] = await Promise.all([loadAssets(...args), this.loadEntries(entries)]);
      return result;
    });
    const locations = { hub: "Pra\xE7a das Vozes", library: "Biblioteca", park: "Parque das Pontes", market: "Feira das Hist\xF3rias", garden: "Horta Comunit\xE1ria" };
    const mainJournal = V.Quests.journal.bind(V.Quests);
    const baseGround = V.World.ground.bind(V.World);
    const baseDraw = V.World.drawObject.bind(V.World);
    const baseMini = V.World.drawMiniMap.bind(V.World);
    const baseUpdate = V.World.update.bind(V.World);
    const baseLoad = V.World.load.bind(V.World);
    const missions = [
      { id: "delivery", title: "Uma caixa, muitas hist\xF3rias", owner: "courier", map: "hub", brief: "Bia reuniu os documentos que a biblioteca vai catalogar. Leve a caixa fechada \xE0 mesa de recebimento; a identifica\xE7\xE3o acompanha o material.", reward: "Selo: cuidado com o arquivo", steps: [{ kind: "pickup", targets: ["parcel"], label: "Retire a caixa na banca de correspond\xEAncias da pra\xE7a." }, { kind: "deliver", targets: ["library-desk"], label: "Entregue a caixa na mesa de recebimento da biblioteca." }] },
      { id: "interview", title: "Ouvir antes de decidir", owner: "teacher", map: "park", brief: "A pra\xE7a ter\xE1 uma roda de leitura. Escute a educadora e a moradora, depois organize as sugest\xF5es sem apagar diferen\xE7as.", reward: "Selo: escuta da comunidade", steps: [{ kind: "talk", targets: ["teacher", "elder"], label: "Converse com Joana e Celina no parque (duas perspectivas)." }, { kind: "puzzle", targets: ["interview"], label: "Organize as sugest\xF5es na mesa do parque." }] },
      { id: "labels", title: "Etiquetas fora de lugar", owner: "vendor", map: "market", brief: "Tr\xEAs etiquetas ca\xEDram na feira. Recupere os pap\xE9is e separe proced\xEAncia, descri\xE7\xE3o e interpreta\xE7\xE3o.", reward: "Selo: curadoria atenta", steps: [{ kind: "collect", targets: ["label-1", "label-2", "label-3"], label: "Encontre as tr\xEAs etiquetas na feira." }, { kind: "puzzle", targets: ["labels"], label: "Reorganize as etiquetas na banca de Rosa." }] },
      { id: "rhythm-workshop", title: "A roda precisa de todos", owner: "percussionist", map: "chapter-1", brief: "Ivo precisa abrir o ensaio com escuta e turnos. Consulte uma leitura do Distrito do Ritmo e organize a sequ\xEAncia de luzes da oficina.", reward: "Selo: oficina colaborativa", steps: [{ kind: "read", chapter: 1, count: 1, label: "Leia um livro ou uma nota do Distrito do Ritmo." }, { kind: "puzzle", targets: ["rhythm-workshop"], label: "Monte a sequ\xEAncia de luzes na oficina de percuss\xE3o." }] },
      { id: "exhibition", title: "Uma exposi\xE7\xE3o com contexto", owner: "guide", map: "chapter-2", brief: "\xCDsis est\xE1 desfazendo a confus\xE3o entre Mali, Songhai e Kongo. Consulte uma leitura e separe descri\xE7\xE3o, proced\xEAncia e interpreta\xE7\xE3o na mesa de curadoria.", reward: "Selo: hist\xF3ria em contexto", steps: [{ kind: "read", chapter: 2, count: 1, label: "Consulte uma leitura do Museu de Mem\xF3rias." }, { kind: "puzzle", targets: ["exhibition"], label: "Monte as tr\xEAs camadas da legenda na mesa de curadoria." }] },
      { id: "experiment", title: "Testar tamb\xE9m \xE9 perguntar", owner: "technician", map: "chapter-3", brief: "Caio quer comparar as lumin\xE1rias do prot\xF3tipo de Luma. Mantenha as condi\xE7\xF5es do teste e registre o resultado, como Luca fez no caderno das tentativas.", reward: "Selo: investiga\xE7\xE3o cient\xEDfica", steps: [{ kind: "talk", targets: ["technician"], label: "Converse com Caio sobre o teste da oficina." }, { kind: "puzzle", targets: ["experiment"], label: "Planeje e execute o experimento no laborat\xF3rio." }] },
      { id: "newsroom", title: "A edi\xE7\xE3o de amanh\xE3", owner: "student2", map: "chapter-4", brief: "Luca e Ravi est\xE3o preparando a pr\xF3xima edi\xE7\xE3o. Compare o contexto da not\xEDcia antes de escolher uma manchete que os registros sustentem.", reward: "Selo: edi\xE7\xE3o respons\xE1vel", steps: [{ kind: "read", chapter: 4, count: 1, label: "Leia uma nota ou um livro sobre fontes e contexto." }, { kind: "puzzle", targets: ["newsroom"], label: "Revise a not\xEDcia na mesa da reda\xE7\xE3o." }] },
      { id: "garden-care", title: "A horta \xE9 um projeto coletivo", owner: "gardener", map: "garden", brief: "Aisha reuniu tr\xEAs canteiros para a oficina comunit\xE1ria. Regue cada um e escute como a equipe divide o cuidado.", reward: "Selo: cuidado compartilhado", steps: [{ kind: "water", targets: ["bed-1", "bed-2", "bed-3"], label: "Regue os tr\xEAs canteiros sinalizados da horta." }, { kind: "talk", targets: ["gardener"], label: "Volte a conversar com Aisha na horta." }] },
      { id: "backup", title: "Um arquivo que pode ser conferido", owner: "archivist", map: "library", brief: "Dimas est\xE1 preparando o cat\xE1logo que liga o documento \xE0 sua origem. Leia um registro e associe os pares na mesa da biblioteca.", reward: "Selo: arquivo verific\xE1vel", steps: [{ kind: "read", count: 1, label: "Conclua a leitura de qualquer livro ou nota." }, { kind: "puzzle", targets: ["backup"], label: "Associe os pares na mesa de cataloga\xE7\xE3o da biblioteca." }] },
      { id: "field-notes", title: "Caderno de observa\xE7\xE3o", owner: "elder", map: "park", brief: "Observe tr\xEAs tipos de animais sem persegui-los. Compare as aves da pra\xE7a, o pato do lago e os insetos da horta. Use as fichas de campo para separar a a\xE7\xE3o observada de uma hip\xF3tese sobre sua causa.", reward: "Selo: olhar de campo", steps: [{ kind: "animal", count: 3, label: "Observe tr\xEAs tipos de animais no parque, na feira ou na pra\xE7a." }, { kind: "puzzle", targets: ["field-notes"], label: "Separe observa\xE7\xE3o e hip\xF3tese na mesa do parque." }] },
      { id: "community-mail", title: "Uma mem\xF3ria com autoriza\xE7\xE3o", owner: "courier", map: "market", brief: "A equipe pode registrar hist\xF3rias do bairro quando as pessoas concordam. Complete o roteiro da entrevista e prepare o consentimento.", reward: "Selo: mem\xF3ria com cuidado", steps: [{ kind: "talk", targets: ["vendor"], label: "Converse com Rosa na feira sobre a mem\xF3ria do bairro." }, { kind: "puzzle", targets: ["community-mail"], label: "Prepare o roteiro de registro na mesa de correspond\xEAncias." }] },
      { id: "human-review", title: "A \xFAltima palavra \xE9 da equipe", owner: "archivist", map: "chapter-6", brief: "Dimas prepara a continuidade do arquivo. Consulte uma leitura do Arquivo Central e organize o protocolo que mant\xE9m fontes, respons\xE1veis e pedidos de revis\xE3o.", reward: "Selo: revis\xE3o humana", steps: [{ kind: "read", chapter: 6, count: 1, label: "Leia um registro do Arquivo Central." }, { kind: "puzzle", targets: ["human-review"], label: "Revise o protocolo na bancada do Arquivo Central." }] }
    ];
    V.Living = {
      missions,
      ready: false,
      uiTab: "missions",
      walkingTime: 0,
      townAnimalPose(o) {
        const reduced = V.settings.reducedMotion || V.settings.npcMovement === false;
        const time = (o.walkClock ?? this.walkingTime ?? 0) + o.x % 83 * 0.021;
        const birds = o.species === 2 || o.species === 3;
        const butterfly = o.species === 5, swimming = o.species === 4 && !!V.World.current?.pond;
        const flight = reduced ? 0 : o.townFlight || 0;
        let frame = 0, lift = 0;
        if (!reduced) {
          if (butterfly) {
            frame = Math.floor(time * (o.walking ? 12 : 5)) % 4;
            lift = o.walking ? 8 + Math.sin(time * 5) * 3 : 2;
          } else if (flight > 0.025) {
            frame = flight < 0.42 ? 5 : 6 + Math.floor(time * 9) % 2;
            lift = flight * (o.species === 3 ? 15 : 11);
          } else if (o.walking && !swimming) {
            frame = [1, 0, 2, 0][Math.floor(time * (birds ? 8 : 6)) % 4];
          } else {
            const beat = time % 5.6;
            frame = beat > 3.75 && beat < 4.65 ? birds && Math.floor(beat * 9) % 2 ? 4 : 3 : birds && beat > 2.3 && beat < 2.7 ? 4 : 0;
            if (swimming) lift = Math.sin(time * 2.6) * 1.25;
          }
        }
        return { frame, lift, swimming };
      },
      localAnimalRow(o) {
        if (Number.isInteger(o.neighborAnimal) && o.neighborAnimal >= 0 && o.neighborAnimal < 6) return 10 + o.neighborAnimal;
        if (Number.isInteger(o.coastAnimal) && o.coastAnimal >= 0 && o.coastAnimal < 8) return 2 + o.coastAnimal;
        return o.species === 0 || o.species === 1 ? o.species : -1;
      },
      localAnimalPose(o, row) {
        const motion = !V.settings.reducedMotion && V.settings.npcMovement !== false;
        const time = (o.walkClock ?? this.walkingTime) + Math.abs(o.x || 0) % 83 * 0.021;
        const cat = row === 1 || row === 4 || row === 5, dog = row === 0 || row === 2 || row === 3;
        const swimming = row === 8 || row === 9, fly = row === 7 && o.walking;
        if (!motion) return { frame: cat && o.action === "sleeping" ? 6 : 0, lift: 0, swimming };
        let frame = 0, lift = 0;
        if (swimming || fly || o.walking) {
          frame = dog || cat ? movingFrames[Math.floor(time * 8) % 4] : Math.floor(time * (fly ? 9 : 6)) % 4;
          if (fly) lift = 6 + Math.sin(time * 5) * 2;
          if (swimming) lift = Math.sin(time * 3) * 1.5;
        } else if (cat) {
          frame = o.action === "sleeping" ? 6 + Math.floor(time * 2.2) % 2 : [3, 3, 4, 4, 3, 5][Math.floor(time * 1.8) % 6];
        } else if (dog) {
          frame = o.action === "resting" && time % 9 < 2 ? 7 : [0, 5, 0, 6, 0, 4, 0, 3][Math.floor(time * 3) % 8];
        } else {
          frame = breathingFrames[Math.floor(time * 5) % breathingFrames.length];
        }
        return { frame, lift, swimming };
      },
      drawTownAnimal(ctx, o, x, y, portraitSize = 0) {
        const row = this.localAnimalRow(o), portrait = portraitSize > 0;
        const local = V.Assets.images.localAnimals, town = V.Assets.images.townAnimals;
        const townRow = townMotion.rows[o.species], size = portraitSize || (row >= 0 ? localAnimalSize[row] : townMotion.sizes[o.species]) * (o.visualScale || 1);
        if (!size) return;
        const useLocal = row >= 0 && V.Assets.ready(local);
        if (row >= 0 && !useLocal && (portrait || V.AssetLoader.byImage.get(local)?.state === "deferred")) {
          const canvas = ctx.canvas;
          V.AssetLoader.request(local).then((ready) => {
            if (ready && portrait && canvas.isConnected) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              this.drawTownAnimal(ctx, o, x, y, portraitSize);
            }
          });
        }
        const pose = portrait ? { frame: 0, lift: 0, swimming: false } : row >= 0 ? this.localAnimalPose(o, row) : this.townAnimalPose(o);
        const { lift, swimming } = pose;
        if (!portrait) {
          if (swimming) {
            ctx.save();
            ctx.strokeStyle = "#d3ece190";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(x, y + 2, 13 + lift, 3.2, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          } else V.SceneShadows?.contact(ctx, x, y + 3, size * 0.24, 3.3, 0.22 - lift * 8e-3);
        }
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y - lift));
        ctx.imageSmoothingEnabled = false;
        if (!portrait && o.visualRotation) ctx.rotate(o.visualRotation * Math.PI / 180);
        if (!portrait && (o.lifeFacing !== void 0 ? o.lifeFacing === 1 : V.FieldGuide.flip(o))) ctx.scale(-1, 1);
        if (useLocal) {
          ctx.drawImage(local, pose.frame * 64, row * 64, 64, 64, -size / 2, -size * 0.875, size, size);
        } else if (row < 0 && townRow !== void 0 && V.Assets.ready(town)) {
          const visible = swimming ? 49 : 64;
          ctx.drawImage(town, pose.frame % 4 * 64, (townRow + Math.floor(pose.frame / 4)) * 64, 64, visible, -size / 2, -size * (swimming ? 0.765 : 0.89), size, size * visible / 64);
        } else {
          const key = o.neighborAnimal !== void 0 ? "neighbors-animals" : o.coastAnimal !== void 0 ? "coast-animals" : "animals";
          const fallback = V.Assets.images[key], fallbackRow = o.neighborAnimal ?? o.coastAnimal ?? o.species;
          if (V.Assets.ready(fallback)) {
            if (key === "neighbors-animals") ctx.scale(-1, 1);
            ctx.drawImage(fallback, 0, fallbackRow * 32, 32, 32, -size / 2, -size * 0.875, size, size);
          }
        }
        ctx.restore();
      },
      initContent() {
        if (this.ready) return;
        this.ready = true;
        (V.learning.residents || []).forEach((r) => {
          V.content.characters[r.character] = { name: r.name, role: r.role, quote: r.lines?.[0]?.pt || "", accent: "#a0dfa1" };
        });
        (V.learning.sources || []).forEach((s) => {
          if (!V.content.sources.some((x) => x.id === s.id)) V.content.sources.push(s);
        });
        V.content.questions.push(...V.learning.questions.filter((q) => !V.content.questions.some((x) => x.id === q.id)));
        V.Quests.achievements.push(
          { id: "reader", title: "Estante aberta", desc: "Concluiu quatro leituras.", index: 4 },
          { id: "neighbor", title: "Cidade feita por pessoas", desc: "Concluiu quatro miss\xF5es da comunidade.", index: 8 },
          { id: "naturalist", title: "Caderno de campo", desc: "Observou quatro tipos de animais.", index: 10 },
          { id: "historian", title: "Perguntar ao passado", desc: "Interpretou seis quest\xF5es de Hist\xF3ria.", index: 13 }
        );
      },
      ensure() {
        if (!V.state) return;
        ["readings", "knowledge", "residentTalks", "observations", "fieldGuideSeen", "watered", "tokens", "deliveries"].forEach((k) => {
          if (!Array.isArray(V.state[k])) V.state[k] = [];
        });
        ["sideQuests", "readingPages", "historyAttempts"].forEach((k) => {
          if (!V.state[k] || typeof V.state[k] !== "object" || Array.isArray(V.state[k])) V.state[k] = {};
        });
        if (typeof V.state.trackedQuest !== "string") V.state.trackedQuest = "";
      },
      location(id) {
        return locations[id] || V.World.maps[id]?.name || id;
      },
      missionUnlocked(q) {
        const match = q.map.match(/^chapter-(\d)$/);
        return !match || V.Quests.isUnlocked(+match[1]);
      },
      blocked(m, x, y, r = 11) {
        return x - r < T || y - r < T || x + r > (m.width - 1) * T || y + r > (m.height - 1) * T || m.solids.some((s) => x + r > s.x && x - r < s.x + s.w && y + r > s.y && y - r < s.y + s.h);
      },
      safe(m, x, y, avoid = true) {
        const cx = Math.round(x), cy = Math.round(y);
        for (let radius = 0; radius < 8; radius++) for (let yy = cy - radius; yy <= cy + radius; yy++) for (let xx = cx - radius; xx <= cx + radius; xx++) {
          const px = xx * T + 24, py = yy * T + 24;
          if (!this.blocked(m, px, py) && (!avoid || m.objects.every((o) => Math.hypot(o.x - px, o.y - py) > 38))) return { x: xx, y: yy };
        }
        return { x: m.width / 2, y: m.height - 4 };
      },
      add(m, type, id, x, y, label, data = {}) {
        const p2 = this.safe(m, x, y);
        V.World.object(m, type, id, p2.x, p2.y, label, data);
        return m.objects[m.objects.length - 1];
      },
      prop(m, x, y, index, rich = false, solid = false) {
        if (x < 1 || y < 1 || x >= m.width - 1 || y >= m.height - 1) return;
        if (m.objects.some((o) => Math.hypot(o.x - (x * T + 24), o.y - (y * T + 24)) < 35)) return;
        if (m.buildings.some((b) => x * T >= b.x && x * T < b.x + b.w && y * T >= b.y && y * T < b.y + b.h)) return;
        m.decor.push({ x: x * T, y: y * T, prop: index, rich });
        if (solid) m.solids.push({ x: x * T + 9, y: y * T + 21, w: 30, h: 25 });
      },
      build() {
        this.newDistricts();
        Object.values(V.World.maps).forEach((m) => {
          m.zones = [];
          m.chats = [];
          m.ambientTime = 0;
          if (m.theme === "room") this.interior(m);
          else this.landscape(m);
        });
        this.add(V.World.maps.hub, "travel", "travel-park", 3, 19, "Ir ao Parque das Pontes", { to: "park", prop: 44 });
        this.add(V.World.maps.hub, "travel", "travel-market", 28, 19, "Ir \xE0 Feira das Hist\xF3rias", { to: "market", prop: 31 });
        this.add(V.World.maps.hub, "travel", "travel-garden", 19, 5, "Visitar a Horta Comunit\xE1ria", { to: "garden", prop: 36 });
        this.add(V.World.maps.hub, "board", "community-board", 20, 14, "Mural de miss\xF5es da comunidade", { prop: 8 });
        this.add(V.World.maps.hub, "pickup", "parcel", 6, 13, "Retirar caixa da biblioteca", { mission: "delivery", prop: 12 });
        this.add(V.World.maps.library, "delivery", "library-desk", 16, 14, "Mesa de recebimento do arquivo", { mission: "delivery", prop: 11 });
        this.add(V.World.maps.market, "pickup", "label-1", 5, 9, "Etiqueta: proced\xEAncia", { mission: "labels", prop: 13 });
        this.add(V.World.maps.market, "pickup", "label-2", 20, 12, "Etiqueta: descri\xE7\xE3o", { mission: "labels", prop: 13 });
        this.add(V.World.maps.market, "pickup", "label-3", 8, 17, "Etiqueta: interpreta\xE7\xE3o", { mission: "labels", prop: 13 });
        [[7, 7], [12, 7], [17, 7]].forEach(([x, y], i) => this.add(V.World.maps.garden, "water", "bed-" + (i + 1), x, y, "Regar canteiro " + (i + 1), { bed: i, richProp: 1, mission: "garden-care" }));
        missions.forEach((q, i) => {
          const m = V.World.maps[q.map], sp = { hub: [10, 16], park: [18, 16], market: [15, 14], garden: [15, 12], library: [8, 12] };
          const at = sp[q.map] || [19, 12];
          if (q.steps.some((s) => s.kind === "puzzle")) this.add(m, "workbench", "work-" + q.id, at[0] + i % 2, at[1] + i % 3, "Oficina: " + q.title, { mission: q.id, richProp: q.id === "newsroom" ? 21 : q.id === "experiment" ? 22 : 12 });
        });
        this.readingObjects();
        this.residents();
        this.animals();
        this.conversations();
        Object.values(V.World.maps).forEach((m) => {
          m.objects.filter((o) => ["npc", "resident", "ambient", "animal"].includes(o.type)).forEach((o, i) => this.prepareWalker(m, o, i));
          m.cache = null;
        });
      },
      newDistricts() {
        const W = V.World;
        const park = W.base("park", "community", 28, 24);
        park.name = "Parque das Pontes \xB7 lago e rodas de conversa";
        park.biome = "park";
        park.solids.push({ x: 17 * T, y: 5 * T, w: 6 * T, h: 5 * T });
        park.pond = { x: 17, y: 5, w: 6, h: 5 };
        W.object(park, "exit", "park-exit", 13, 21.5, "Voltar \xE0 Pra\xE7a das Vozes", { to: "hub" });
        const market = W.base("market", "hub", 30, 22);
        market.name = "Feira das Hist\xF3rias \xB7 bancas e ateli\xEAs";
        market.biome = "market";
        W.object(market, "exit", "market-exit", 15, 19.5, "Voltar \xE0 Pra\xE7a das Vozes", { to: "hub" });
        const garden = W.base("garden", "community", 26, 20);
        garden.name = "Horta Comunit\xE1ria \xB7 cuidado compartilhado";
        garden.biome = "garden";
        W.object(garden, "exit", "garden-exit", 13, 17.5, "Voltar \xE0 Pra\xE7a das Vozes", { to: "hub" });
        W.maps.park = park;
        W.maps.market = market;
        W.maps.garden = garden;
      },
      interior(m) {
        // Wide aisles and different furnishings make the seven interiors usable rooms.
        const c = m.chapter || 0;
        m.decor = [];
        m.solids = [{ x: 0, y: 0, w: m.width * T, h: T * 2 }, { x: 0, y: 0, w: T, h: m.height * T }, { x: (m.width - 1) * T, y: 0, w: T, h: m.height * T }];
        m.roomStyle = ["reading", "studio", "archive", "laboratory", "newsroom", "assembly", "control"][c];
        m.zones.push({ x: 1, y: 2, w: 22, h: 15, tile: [11, 13, 9, 12, 8, 29, 24][c] });
        const shelves = c === 0 || c === 2 || c === 6;
        if (shelves) {
          [3, 7, 17, 21].forEach((x) => {
            for (let y = 3; y < 6; y++) this.prop(m, x, y, c === 6 ? 12 : 10, false, true);
          });
        }
        const tables = c === 1 ? [[4, 4, 24], [8, 4, 25], [16, 4, 27], [19, 5, 26], [5, 9, 23], [18, 9, 22]] : c === 3 ? [[4, 4, 18], [8, 4, 16], [16, 4, 18], [20, 4, 17], [5, 10, 19], [18, 10, 16]] : c === 4 ? [[4, 4, 19], [8, 4, 20], [16, 4, 19], [20, 4, 19], [5, 10, 21], [18, 10, 19]] : c === 5 ? [[4, 4, 8], [8, 4, 11], [16, 4, 11], [20, 4, 47], [5, 10, 4], [18, 10, 4]] : [[5, 9, 11], [9, 9, 11], [16, 9, 11], [20, 9, 11]];
        tables.forEach(([x, y, p2]) => this.prop(m, x, y, p2));
        [[2, 7, 28], [21, 7, 28], [2, 12, 29], [21, 12, 29], [11, 3, 15]].forEach(([x, y, p2]) => this.prop(m, x, y, p2));
        [[10, 12, 9], [3, 14, 10], [20, 14, 10], [12, 2, 11], [11, 5, 12], [15, 11, 20]].forEach(([x, y, p2]) => this.prop(m, x, y, p2, true));
        if (c === 0) {
          [[3, 10], [3, 11], [20, 10], [20, 11]].forEach(([x, y]) => this.prop(m, x, y, 10, false, true));
          [[5, 12], [17, 12]].forEach(([x, y]) => this.prop(m, x, y, 9, true));
          [[4, 11], [7, 11], [16, 11], [19, 11]].forEach(([x, y]) => this.prop(m, x, y, 10, true));
          [[6, 10], [18, 10]].forEach(([x, y]) => this.prop(m, x, y, 39));
        }
        if (c === 3) {
          this.prop(m, 6, 5, 22, true);
          this.prop(m, 19, 5, 27, true);
        }
        if (c === 4 || c === 6) {
          [4, 8, 16, 20].forEach((x) => this.prop(m, x, 6, 24, true));
        }
        if (c === 1) {
          this.prop(m, 18, 12, 14, true);
          this.prop(m, 5, 12, 15, true);
        }
        const librarian = m.objects.find((o) => o.library);
        if (librarian) {
          librarian.x = 12 * T + 24;
          librarian.y = 7 * T + 24;
          librarian.label = c ? "Conversar com a equipe do interior" : "Conversar com Davi";
        }
        m.objects.forEach((o) => {
          if (this.blocked(m, o.x, o.y)) {
            const p2 = this.safe(m, o.x / T - 0.5, o.y / T - 0.5, false);
            o.x = p2.x * T + 24;
            o.y = p2.y * T + 24;
          }
        });
      },
      landscape(m) {
        const c = m.chapter || 0, biome = m.biome || m.theme;
        m.zones.push({ x: 7, y: 7, w: m.width - 14, h: 12, tile: c === 2 ? 10 : c === 3 ? 12 : c === 4 || c === 6 ? 24 : 7 });
        if (biome === "park") m.zones = [{ x: 2, y: 3, w: 24, h: 18, tile: 30 }, { x: 11, y: 3, w: 4, h: 19, tile: 3 }, { x: 4, y: 13, w: 20, h: 3, tile: 3 }];
        if (biome === "garden") m.zones = [{ x: 2, y: 3, w: 22, h: 13, tile: 2 }, { x: 4, y: 6, w: 18, h: 3, tile: 22 }, { x: 4, y: 11, w: 18, h: 3, tile: 22 }, { x: 10, y: 3, w: 4, h: 14, tile: 3 }];
        if (biome === "market") m.zones = [{ x: 2, y: 4, w: 26, h: 14, tile: 6 }, { x: 12, y: 3, w: 6, h: 16, tile: 7 }];
        for (let x = 2; x < m.width - 2; x += 2) {
          if (!m.buildings.length) {
            this.prop(m, x, 2, x % 6 === 0 ? 1 : 0);
            this.prop(m, x, m.height - 2, x % 4 === 0 ? 29 : 28);
          }
          this.prop(m, x, 18, x % 4 === 0 ? 0 : 29);
        }
        const clusters = [[3, 7], [4, 12], [7, 16], [10, 6], [19, 8], [20, 14], [25, 13], [27, 17]];
        clusters.forEach(([x, y], i) => {
          this.prop(m, x, y, c === 1 ? [25, 26, 22, 23][i % 4] : c === 3 ? [16, 17, 18, 45][i % 4] : c === 4 || c === 6 ? [19, 20, 45, 12][i % 4] : [4, 28, 29, 30][i % 4]);
          this.prop(m, x + 1, y, i % 3 === 0 ? 4 : 29);
          this.prop(m, x, y + 1, [0, 5, 6, 7, 16, 26, 30, 28][i], true);
        });
        if (biome === "market") {
          [[4, 5], [8, 5], [20, 5], [24, 5], [4, 12], [23, 13]].forEach(([x, y], i) => {
            this.prop(m, x, y, 31);
            this.prop(m, x, y - 1, 2, true);
            this.prop(m, x + 1, y, 3, true);
            this.prop(m, x + 1, y + 1, 4, true);
          });
          this.prop(m, 10, 14, 21, true);
          this.prop(m, 21, 16, 31, true);
          this.prop(m, 5, 16, 6, true);
        }
        if (biome === "park") {
          [[5, 5], [7, 6], [4, 9], [6, 17], [21, 17], [24, 11]].forEach(([x, y], i) => {
            this.prop(m, x, y, i % 2 ? 1 : 0);
            this.prop(m, x + 1, y + 1, 29);
          });
          [[7, 11], [19, 12], [5, 16]].forEach(([x, y]) => this.prop(m, x, y, 5, true));
          this.prop(m, 16, 9, 37);
          this.prop(m, 6, 4, 29, true);
          this.prop(m, 22, 10, 19, true);
        }
        if (biome === "garden") {
          for (let y of [6, 11]) for (let x of [5, 8, 15, 18]) this.prop(m, x, y, 1, true);
          this.prop(m, 5, 14, 27, true);
          this.prop(m, 18, 14, 22, true);
          this.prop(m, 21, 5, 28, true);
          this.prop(m, 3, 10, 31, true);
        }
        if (c === 1) {
          m.zones.push({ x: 3, y: 13, w: 8, h: 5, tile: 13 });
          this.prop(m, 19, 6, 14, true);
          this.prop(m, 21, 6, 15, true);
        }
        if (c === 2) {
          this.prop(m, 18, 7, 13, true);
          this.prop(m, 20, 7, 20, true);
          this.prop(m, 5, 17, 12, true);
        }
        if (c === 3) {
          [[20, 6], [21, 6], [20, 7]].forEach(([x, y]) => this.prop(m, x, y, 22, true));
          this.prop(m, 5, 17, 25, true);
        }
        if (c === 4 || c === 6) {
          [6, 8, 20, 22].forEach((x) => this.prop(m, x, 7, 24, true));
          this.prop(m, 19, 18, 23, true);
        }
        if (c === 5) {
          m.zones.push({ x: 3, y: 11, w: 6, h: 4, tile: 2 });
          this.prop(m, 8, 6, 17, true);
          this.prop(m, 20, 18, 26, true);
        }
      },
      readingObjects() {
        const counts = {};
        V.learning.readings.forEach((r) => {
          if (r.collectionOnly) return;
          const id = r.map || (r.chapter ? r.kind === "book" ? "room-" + r.chapter : "chapter-" + r.chapter : r.kind === "book" ? "library" : "hub");
          const m = V.World.maps[id], i = counts[id] || 0;
          counts[id] = i + 1;
          const spots = m.theme === "room" ? [[6, 6], [17, 11], [5, 14], [19, 14], [15, 5], [7, 10]] : [[8, 11], [20, 11], [7, 18], [24, 15], [10, 18], [19, 5]];
          const [x, y] = spots[i % spots.length];
          this.add(m, "reading", r.id, x, y, (r.kind === "book" ? "Ler livro: " : "Examinar nota: ") + r.title, { reading: r, prop: r.kind === "book" ? 9 : 13 });
        });
        // Regional books are also available in the city's lending collection.
        const shelfSpots = [[4, 6], [8, 6], [16, 6], [20, 6], [4, 10], [8, 10], [16, 10], [20, 10], [4, 13], [8, 13], [16, 13], [20, 13]];
        V.learning.readings.filter((r) => r.kind === "book").forEach((r, i) => {
          const [x, y] = shelfSpots[i % shelfSpots.length];
          if (!V.World.maps.library.objects.some((o) => o.id === r.id)) this.add(V.World.maps.library, "reading", r.id, x, y, "Ler livro: " + r.title, { reading: r, prop: 9 });
        });
        ["hub", "library", "park", "market", "chapter-1", "chapter-2", "chapter-3", "chapter-4", "chapter-5", "chapter-6"].forEach((id) => {
          const m = V.World.maps[id];
          this.add(m, "history", "history-" + id, m.theme === "room" ? 19 : 26, m.theme === "room" ? 12 : 18, "Roda de perguntas: Hist\xF3ria e contexto", { chapter: m.chapter || 1, prop: 15 });
        });
      },
      residents() {
        const placement = { courier: ["hub", 8, 15], gardener: ["garden", 13, 10], vendor: ["market", 21, 14], guide: ["chapter-2", 17, 13], archivist: ["library", 14, 10], technician: ["chapter-3", 18, 14], teacher: ["park", 8, 15], elder: ["park", 17, 18], student2: ["chapter-4", 20, 15], percussionist: ["chapter-1", 8, 15] };
        V.learning.residents.forEach((r) => {
          const [id, x, y] = placement[r.id] || ["hub", 10, 17];
          this.add(V.World.maps[id], "resident", "resident-" + r.id, x, y, "Conversar com " + r.name, { character: r.character, resident: r, homeMap: id });
        });
      },
      animals() {
        const specs = { hub: [[0, 9, 15], [2, 21, 16], [5, 20, 5]], library: [[1, 9, 14]], park: [[0, 7, 18], [2, 10, 11], [3, 6, 8], [4, 16, 10], [5, 23, 17]], market: [[1, 7, 15], [2, 17, 16]], garden: [[3, 5, 9], [5, 19, 12]], "chapter-1": [[1, 10, 17], [3, 20, 15]], "chapter-2": [[2, 19, 16]], "chapter-3": [[3, 9, 17]], "chapter-5": [[0, 7, 15], [5, 19, 14]] };
        Object.entries(specs).forEach(([id, list]) => list.forEach(([species, x, y], i) => this.add(V.World.maps[id], "animal", "animal-" + id + "-" + i, x, y, "Observar: " + animalNames[species], { species, behavior: animalBehaviors[species] })));
      },
      conversations() {
        (V.learning.chats || []).forEach((chat, i) => {
          const m = V.World.maps[chat.map];
          if (!m) return;
          const p2 = this.safe(m, m.theme === "room" ? 15 : 10 + i % 4, m.theme === "room" ? 13 : 12 + i % 5);
          const group = { id: chat.id, chat, clock: i * 1.9, meet: { x: p2.x * T + 24, y: p2.y * T + 24 }, members: [] };
          chat.speakers.forEach((character, j) => {
            const o = this.add(m, "ambient", "chat-" + chat.id + "-" + j, p2.x + j * 2, p2.y, V.content.characters[character]?.name || "Morador", { character, group: chat.id, chat, member: j });
            group.members.push(o);
          });
          m.chats.push(group);
        });
      },
      prepareWalker(m, o, i) {
        o.home = { x: o.x, y: o.y };
        o.dir = 0;
        o.frame = 0;
        o.walking = false;
        o.walkClock = 0;
        o.wait = 1.5 + i % 5;
        o.speed = o.type === "animal" ? o.species === 5 ? 32 : 18 : 24 + i % 5 * 3;
        o.route = [];
        o.goalIndex = 0;
        const offsets = o.type === "animal" ? [[0, 0], [2, 0], [1, 2], [-1, 1]] : [[0, 0], [2, 0], [2, 2], [0, 2], [-1, 1]];
        o.waypoints = offsets.map(([dx, dy]) => {
          const p2 = this.safe(m, o.home.x / T - 0.5 + dx, o.home.y / T - 0.5 + dy, false);
          return { x: p2.x * T + 24, y: p2.y * T + 24 };
        });
      },
      path(m, from, to) {
        const start = { x: Math.floor(from.x / T), y: Math.floor(from.y / T) }, goal = { x: Math.floor(to.x / T), y: Math.floor(to.y / T) };
        const key = (p2) => p2.x + "," + p2.y, queue = [start], parents = new Map([[key(start), null]]);
        let found = null;
        for (let n = 0; n < queue.length; n++) {
          const p2 = queue[n];
          if (p2.x === goal.x && p2.y === goal.y) {
            found = p2;
            break;
          }
          for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
            const next = { x: p2.x + dx, y: p2.y + dy }, k = key(next);
            if (!parents.has(k) && !this.blocked(m, next.x * T + 24, next.y * T + 24, 9)) {
              parents.set(k, p2);
              queue.push(next);
            }
          }
        }
        if (!found) return [];
        const route = [];
        while (parents.get(key(found))) {
          route.unshift({ x: found.x * T + 24, y: found.y * T + 24 });
          found = parents.get(key(found));
        }
        return route;
      },
      update(dt) {
        const m = V.World.current;
        this.ensure();
        m.ambientTime += dt;
        this.walkingTime += dt;
        V.Audio.footsteps(dt);
        const p2 = V.Player.data;
        m.chats.forEach((g) => {
          g.clock += dt;
          const phase = g.clock % 32;
          g.talking = phase > 8 && phase < 23;
          g.members.forEach((o, j) => {
            o.chatSpeaking = g.talking && Math.floor((phase - 8) / 4) % 2 === j;
            o.bubble = o.chatSpeaking ? g.chat.lines[Math.floor((phase - 8) / 4) % g.chat.lines.length] : "";
          });
        });
        m.objects.filter((o) => o.waypoints).forEach((o) => {
          o.walking = false;
          o.walkClock += dt;
          if (V.settings.npcMovement === false || V.settings.reducedMotion) {
            o.frame = 0;
            return;
          }
          const group = o.group && m.chats.find((g) => g.id === o.group);
          if (V.dist(p2, o) < 78 || group?.talking && V.dist(o, group.meet) < 82) {
            o.dir = group ? o.member ? 1 : 2 : o.dir;
            o.frame = 0;
            return;
          }
          o.wait = Math.max(0, o.wait - dt);
          if (o.wait > 0) return;
          if (!o.route.length) {
            const goal = group?.talking ? { x: group.meet.x + (o.member ? T : 0), y: group.meet.y } : o.waypoints[o.goalIndex++ % o.waypoints.length];
            o.route = this.path(m, o, goal);
            if (!o.route.length) {
              o.wait = 2;
              return;
            }
          }
          const target = o.route[0], dx = target.x - o.x, dy = target.y - o.y, len = Math.hypot(dx, dy), step = o.speed * dt;
          if (len < step + 1) {
            o.x = target.x;
            o.y = target.y;
            o.route.shift();
            if (!o.route.length) o.wait = o.type === "animal" ? 1.8 : 3;
          } else {
            const nx = o.x + dx / len * step, ny = o.y + dy / len * step;
            if (!this.blocked(m, nx, ny, 8)) {
              if (o.type === "animal" && Math.abs(nx - o.x) > 1e-3) o.animalFacing = nx < o.x ? 1 : 2;
              o.x = nx;
              o.y = ny;
              o.walking = true;
              o.dir = Math.abs(dx) > Math.abs(dy) ? dx < 0 ? 1 : 2 : dy < 0 ? 3 : 0;
            } else {
              o.route = [];
              o.wait = 0.3;
            }
          }
          o.frame = o.walking ? Math.floor(o.walkClock * 6) % 4 : 0;
        });
        this.updateHUD();
      },
      nav(tab) {
        return `<nav class="tabs living-tabs">${[["quests", "Investiga\xE7\xE3o"], ["missions", "Comunidade"], ["readings", "Livros e notas"], ["field", "Caderno de campo"]].map(([id, label]) => `<button data-notebook-tab="${id}" class="${tab === id ? "active" : ""}">${label}</button>`).join("")}</nav>`;
      },
      bindNav() {
        V.$$("[data-notebook-tab]").forEach((b) => b.onclick = () => this.journal(b.dataset.notebookTab));
      },
      journal(tab = "quests") {
        if (tab === "chronicles") {
          const previous = V.$(".living-tabs .active")?.dataset.notebookTab || "readings";
          return V.CityChronicle.open(V.World.current?.id, () => this.journal(previous));
        }
        this.ensure();
        this.uiTab = tab;
        if (tab === "quests") {
          mainJournal();
          const body2 = V.$(".modal-body");
          body2.innerHTML = this.nav(tab) + body2.innerHTML;
          this.bindNav();
          return;
        }
        let body = "";
        if (tab === "missions") body = `<div class="notebook-summary"><strong>${missions.filter((q) => V.state.sideQuests[q.id]?.done).length}/${missions.length} miss\xF5es conclu\xEDdas</strong><span>Escuta, explora\xE7\xE3o, cuidado e reconstru\xE7\xE3o</span></div><div class="two-cols">${missions.map((q) => this.missionCard(q)).join("")}</div>`;
        if (tab === "readings") body = `<div class="notebook-summary"><strong>${V.state.readings.length}/${V.learning.readings.length} leituras conclu\xEDdas</strong><span>${V.state.knowledge.length} perguntas interpretadas</span></div><label class="field">Buscar por t\xEDtulo ou tema<input id="reading-search" placeholder="m\xFAsica, ci\xEAncia, mem\xF3ria\u2026"></label><div id="reading-shelf" class="reading-shelf"></div>`;
        if (tab === "field") body = `<div class="two-cols"><article class="card">${V.FieldGuide.journal()}</article><article class="card"><h3>Pessoas e descobertas</h3><p>${V.state.residentTalks.length}/${V.learning.residents.length} moradores escutados \xB7 ${V.state.watered.length}/3 canteiros cuidados</p><div class="note">Uma observa\xE7\xE3o diz o que foi visto. Uma hip\xF3tese prop\xF5e uma explica\xE7\xE3o que ainda pode ser investigada.</div><div class="separator"></div><h3>Selos da comunidade</h3>${missions.filter((q) => V.state.sideQuests[q.id]?.done).map((q) => `<p class="reward-line">\u2713 ${esc(q.reward)}</p>`).join("") || '<p class="muted">As miss\xF5es deixam seus selos neste caderno.</p>'}</article></div>`;
        V.UI.modal("Caderno de New Harmony", "Livros, registros de campo e trabalhos feitos com a comunidade.", this.nav(tab) + body, "", true);
        this.bindNav();
        if (tab === "field") V.FieldGuide.bindJournal();
        V.$$("[data-mission-view]").forEach((b) => b.onclick = () => this.showMission(b.dataset.missionView));
        if (tab === "readings") {
          this.shelf();
          V.$("#reading-search").oninput = (e) => this.shelf(e.target.value);
        }
      },
      missionCard(q) {
        const s = V.state.sideQuests[q.id], step = s?.started ? q.steps[s.step] : null;
        return `<article class="mission-card ${s?.done ? "done" : ""}"><span class="chip">${esc(this.location(q.map))} \xB7 ${s?.done ? "CONCLU\xCDDA" : s?.started ? "EM ANDAMENTO" : this.missionUnlocked(q) ? "DISPON\xCDVEL" : "PORTAL A LIBERAR"}</span><h3>${esc(q.title)}</h3><p>${esc(q.brief)}</p>${step ? `<div class="mission-current">${esc(step.label)}</div>` : ""}<button class="secondary" data-mission-view="${q.id}">${s?.done ? "Ver registro" : s?.started ? "Acompanhar miss\xE3o" : "Conhecer miss\xE3o"} \u2192</button></article>`;
      },
      showMission(id) {
        this.ensure();
        const q = missions.find((x) => x.id === id);
        if (!q) return;
        const s = V.state.sideQuests[id];
        V.UI.modal(q.title, this.location(q.map), `<p>${esc(q.brief)}</p><ol class="mission-steps">${q.steps.map((step, i) => `<li class="${s && i < s.step ? "checked" : ""}">${s && i < s.step ? "\u2713 " : ""}${esc(step.label)}</li>`).join("")}</ol><div class="note">${esc(q.reward)}. ${this.missionUnlocked(q) ? "As miss\xF5es da comunidade podem ser feitas no seu ritmo e ficam salvas junto da aventura." : "Libere o portal desta regi\xE3o na investiga\xE7\xE3o principal para iniciar esta miss\xE3o."}</div>`, `<button id="mission-back" class="secondary">Caderno</button>${s?.done ? "" : `<button id="mission-start" class="primary" ${!this.missionUnlocked(q) ? "disabled" : ""}>${s?.started ? "Acompanhar esta miss\xE3o" : "Aceitar miss\xE3o"}</button>`}`);
        V.$("#mission-back").onclick = () => this.journal("missions");
        if (V.$("#mission-start")) V.$("#mission-start").onclick = () => {
          if (!this.missionUnlocked(q)) return;
          if (!s) V.state.sideQuests[id] = { started: true, step: 0, done: false, progress: [] };
          V.state.trackedQuest = id;
          V.UI.close();
          this.reconcile(id);
          V.Save.save();
          this.updateHUD();
          V.UI.toast("Miss\xE3o acompanhada: " + q.title + ". Caderno: K.");
        };
      },
      reconcile(id) {
        const q = missions.find((x) => x.id === id), s = V.state.sideQuests[id];
        if (!q || !s || s.done) return;
        const step = q.steps[s.step];
        if (step.kind === "talk") V.state.residentTalks.forEach((value) => this.event("talk", value));
        if (step.kind === "animal") V.state.observations.forEach((value) => this.event("animal", value));
        if (step.kind === "read") V.state.readings.forEach((value) => this.event("read", value, V.learning.readings.find((r) => r.id === value)));
        if (step.kind === "water") V.state.watered.forEach((value) => this.event("water", value));
      },
      event(kind, value, data = {}) {
        this.ensure();
        let changed = false;
        missions.forEach((q) => {
          const s = V.state.sideQuests[q.id];
          if (!s?.started || s.done) return;
          const step = q.steps[s.step];
          if (step.kind !== kind || step.chapter && data?.chapter !== step.chapter || step.targets && !step.targets.includes(value)) return;
          if (!s.progress.includes(value)) s.progress.push(value);
          const needed = step.targets?.length || step.count || 1;
          if (s.progress.length >= needed) {
            s.step++;
            s.progress = [];
            changed = true;
            V.Audio.sfx("correct");
            if (s.step >= q.steps.length) {
              s.done = true;
              V.UI.toast("Miss\xE3o conclu\xEDda: " + q.title);
              V.Save.log("miss\xE3o da comunidade", q.title);
              V.Engine.burst(V.Player.data.x, V.Player.data.y, "#a0dfa1");
              if (missions.filter((x) => V.state.sideQuests[x.id]?.done).length >= 4) V.Quests.achieve("neighbor");
            } else V.UI.toast("Nova etapa: " + q.steps[s.step].label);
          }
        });
        if (changed) {
          V.Save.save();
          this.updateHUD();
        }
      },
      updateHUD() {
        const el = V.$("#community-hud");
        if (!el || !V.state) return;
        const q = missions.find((x) => x.id === V.state.trackedQuest), s = q && V.state.sideQuests[q.id];
        el.hidden = V.Game.mode !== "explore" || !V.state.flags.prologueDone;
        const title = s && !s.done ? q.title : "Livros, pessoas e novas hist\xF3rias";
        const text = s && !s.done ? q.steps[s.step].label : "K abre o caderno \xB7 miss\xF5es, leituras e observa\xE7\xF5es";
        const sig = title + "|" + text;
        if (el.dataset.signature === sig) return;
        el.dataset.signature = sig;
        el.innerHTML = `<button id="community-tracker"><small>COMUNIDADE ${s && !s.done ? s.step + 1 + "/" + q.steps.length : ""}</small><strong>${esc(title)}</strong><span>${esc(text)}</span></button>`;
        V.$("#community-tracker").onclick = () => q && s && !s.done ? this.showMission(q.id) : this.journal("missions");
      },
      shelf(query = "") {
        const readings = V.learning.readings.filter((r) => (r.title + " " + r.theme).toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
        V.$("#reading-shelf").innerHTML = readings.map((r, i) => {
          const found = V.state.readings.includes(r.id);
          return `<button class="book-card ${r.kind === "note" ? "note-card" : ""} ${found ? "read" : ""}" data-open-reading="${r.id}" style="--book-color:${["#7145cb", "#287786", "#ab4d65", "#91703d"][i % 4]}"><small>${r.kind === "book" ? "LIVRO" : "NOTA ENCONTRADA"} \xB7 ${esc(r.theme)}</small><strong>${esc(r.title)}</strong><span>${found ? "\u2713 No seu caderno" : this.location(r.map || (r.chapter ? r.kind === "book" ? "room-" + r.chapter : "chapter-" + r.chapter : r.kind === "book" ? "library" : "hub"))}</span></button>`;
        }).join("");
        V.$$("[data-open-reading]").forEach((b) => b.onclick = () => {
          const r = V.learning.readings.find((x) => x.id === b.dataset.openReading);
          if (V.state.readings.includes(r.id)) this.read(r.id);
          else {
            V.UI.close();
            V.UI.toast("Encontre esta leitura em " + this.location(r.map || (r.chapter ? r.kind === "book" ? "room-" + r.chapter : "chapter-" + r.chapter : r.kind === "book" ? "library" : "hub")) + ".");
          }
        });
      },
      read(id, page = 0, returnTo = null) {
        this.ensure();
        const r = V.learning.readings.find((x) => x.id === id);
        if (!r) return;
        page = V.clamp(Number.isInteger(page) ? page : 0, 0, r.paragraphs.length - 1);
        const isNote = r.kind === "note", last = isNote || page === r.paragraphs.length - 1;
        V.state.readingPages[id] = page;
        const texts = isNote ? r.paragraphs : [r.paragraphs[page]];
        const sources = r.sourceIds.map((sid) => V.content.sources.find((s) => s.id === sid)).filter(Boolean);
        const cover = V.Interface?.cover(r) || "history";
        const biography = V.MuseumBiographies.forReading(id);
        V.UI.modal(r.title, (isNote ? "NOTA ENCONTRADA" : "LIVRO \xB7 P\xC1GINA " + (page + 1) + "/" + r.paragraphs.length) + " / " + r.theme, `<div class="reader-spread"><aside class="reader-cover"><img class="book-cover-art" src="assets/ui/interface/${isNote ? "note" : "cover"}-${cover}.svg" alt="" aria-hidden="true" width="128" height="160"><small>${isNote ? "NOTA DO BAIRRO" : "ACERVO DE NEW HARMONY"} \xB7 ${esc(r.theme)}</small><h3>${esc(r.title)}</h3><p>${V.state.readings.includes(r.id) ? "\u2713 Leitura registrada no seu caderno." : "Leia e guarde esta descoberta para consultar depois."}</p>${!isNote ? `<nav class="reader-index" aria-label="P\xE1ginas desta leitura">${r.paragraphs.map((t, i) => `<button data-reader-page="${i}" aria-current="${i === page ? "page" : "false"}">${String(i + 1).padStart(2, "0")} \xB7 ${esc(t.split(/[.!?]/)[0].slice(0, 46))}${t.split(/[.!?]/)[0].length > 46 ? "\u2026" : ""}</button>`).join("")}</nav>` : ""}<div class="reader-origin"><small>${esc(r.author)}</small>${sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} \u2197</a>`).join("")}</div></aside><article class="reader-paper"><div class="reader-mark">VOICES \xB7 HIST\xD3RIAS PARA CONHECER E CONFERIR</div>${texts.map((t) => `<p>${esc(t)}</p>`).join("")}<div class="reader-page-number"><span>${isNote ? "NOTA ENCONTRADA" : "LEITURA DO ARQUIVO VIVO"}</span><span>${isNote ? "REGISTRO \xDANICO" : page + 1 + " / " + r.paragraphs.length}</span></div></article></div>`, `<button id="reader-back" class="secondary">${page > 0 && !isNote ? "\u2190 P\xE1gina anterior" : "Voltar ao mundo"}</button>${biography ? '<button id="reader-biography" class="secondary">Ler biografia</button>' : ""}${last ? '<button id="reader-save" class="primary">Registrar no caderno \u2713</button>' : '<button id="reader-next" class="primary">Pr\xF3xima p\xE1gina \u2192</button>'}`, true);
        V.$(".modal").dataset.readerKind = isNote ? "note" : "book";
        V.$$("[data-reader-page]").forEach((b) => b.onclick = () => this.read(id, +b.dataset.readerPage, returnTo));
        if (biography) V.$("#reader-biography").onclick = () => V.MuseumBiographies.open(biography, () => this.read(id, page, returnTo));
        V.$("#reader-back").onclick = () => page > 0 && !isNote ? this.read(id, page - 1, returnTo) : returnTo ? returnTo() : V.UI.close();
        if (V.$("#reader-next")) V.$("#reader-next").onclick = () => this.read(id, page + 1, returnTo);
        if (V.$("#reader-save")) V.$("#reader-save").onclick = () => {
          if (!V.state.readings.includes(id)) {
            V.state.readings.push(id);
            V.Save.log("leitura", r.title);
            V.Audio.sfx("collect");
            if (V.state.readings.length >= 4) V.Quests.achieve("reader");
          }
          this.event("read", id, r);
          V.Save.save();
          const q = V.Teacher.questions.find((x) => x.readingId === r.id && x.grade === V.state.grade) || V.Teacher.questions.find((x) => x.id === r.questionId);
          if (returnTo) returnTo();
          else if (q) this.quiz(r.chapter || 1, [q], () => V.UI.close());
          else {
            V.UI.close();
            V.UI.toast("Leitura guardada no caderno.");
          }
        };
      },
      quiz(chapter, provided = null, done = null) {
        this.ensure();
        const all = V.Teacher.questions.filter((q) => q.subject === "history" && q.chapter === chapter);
        const qs = provided || (all.filter((q) => q.grade === V.state.grade).length ? all.filter((q) => q.grade === V.state.grade) : all).slice(0, 3);
        if (!qs.length) {
          V.UI.toast("Nenhuma quest\xE3o dispon\xEDvel para esta regi\xE3o.");
          return;
        }
        let index = 0;
        const show = () => {
          const q = qs[index];
          V.UI.modal("Perguntar ao passado", "HIST\xD3RIA E CONTEXTO \xB7 " + (index + 1) + "/" + qs.length, `<div class="history-prompt"><span class="chip">Interpreta\xE7\xE3o de fontes</span><h3>${esc(q.prompt)}</h3></div><div class="stack">${q.options.map((label, i) => `<button class="choice-button" data-history-answer="${i}">${String.fromCharCode(65 + i)}. ${esc(label)}</button>`).join("")}</div><div id="history-feedback" aria-live="polite"></div>`, `<button id="history-source" class="secondary">Consultar leitura</button><button id="history-next" class="primary" disabled>Continuar \u2192</button>`);
          V.$("#history-source").onclick = () => {
            const r = V.learning.readings.find((x) => x.id === q.readingId || x.questionId === q.id);
            if (r) this.read(r.id, 0, show);
            else {
              const sources = (q.sourceIds || []).map((id) => V.content.sources.find((s) => s.id === id)).filter(Boolean);
              V.UI.modal("Refer\xEAncias da quest\xE3o", "Origem e contexto do registro.", sources.length ? sources.map((s) => `<article class="source-row"><strong>${esc(s.name)}</strong><p>${esc(s.note)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Consultar institui\xE7\xE3o \u2197</a></article>`).join("") : "<p>Esta quest\xE3o n\xE3o tem uma leitura vinculada. Consulte o professor para ampliar a pesquisa.</p>", '<button id="history-return" class="primary">Voltar \xE0 quest\xE3o</button>');
              V.$("#history-return").onclick = show;
            }
          };
          V.$$("[data-history-answer]").forEach((b) => b.onclick = () => {
            const correct = +b.dataset.historyAnswer === q.correct;
            V.state.historyAttempts[q.id] = (V.state.historyAttempts[q.id] || 0) + 1;
            V.$("#history-feedback").innerHTML = `<div class="feedback ${correct ? "" : "error"}"><strong>${correct ? "\u2713 Evid\xEAncia bem interpretada." : "Vamos revisar a interpreta\xE7\xE3o."}</strong><p>${esc(q.explanation)}</p>${correct ? "" : "<small>Voc\xEA pode tentar outra alternativa. Consulte o texto e procure a evid\xEAncia.</small>"}</div>`;
            V.Audio.sfx(correct ? "correct" : "wrong");
            if (correct) {
              if (!V.state.knowledge.includes(q.id)) {
                V.state.knowledge.push(q.id);
                V.Save.log("Hist\xF3ria", q.id);
                if (V.state.knowledge.length >= 6) V.Quests.achieve("historian");
              }
              V.$$("[data-history-answer]").forEach((x) => x.disabled = true);
              V.$("#history-next").disabled = false;
              V.Save.save();
            }
          });
          V.$("#history-next").onclick = () => {
            index++;
            if (index < qs.length) show();
            else {
              V.UI.close();
              V.UI.toast("Interpreta\xE7\xF5es registradas no caderno.");
              if (done) done();
            }
          };
        };
        show();
      },
      resident(o) {
        const r = o.resident, seen = V.state.residentTalks.includes(r.id);
        const lines = seen && r.repeat ? [r.repeat] : r.lines;
        V.Dialogue.start(lines, () => {
          if (!seen) V.state.residentTalks.push(r.id);
          this.event("talk", r.id);
          V.Save.log("morador", r.name);
          const offers = missions.filter((q) => q.owner === r.id && !V.state.sideQuests[q.id]?.done);
          if (offers.length) {
            V.UI.modal(r.name + " \xB7 trabalho em conjunto", r.role, `<p>Voc\xEA pode ajudar a comunidade com estas tarefas:</p><div class="stack">${offers.map((q) => this.missionCard(q)).join("")}</div>`);
            V.$$("[data-mission-view]").forEach((b) => b.onclick = () => this.showMission(b.dataset.missionView));
          }
        });
      },
      interact(o) {
        this.ensure();
        if (o.type === "resident") {
          this.resident(o);
          return true;
        }
        if (o.type === "ambient") {
          const c = o.chat;
          V.Dialogue.start(c.lines.map((pt, i) => ({ speaker: c.speakers[i % 2], en: c.enLines?.[i] || "Let\u2019s listen to the conversation.", pt })));
          return true;
        }
        if (o.type === "reading") {
          this.read(o.reading.id, V.state.readingPages[o.id] || 0);
          return true;
        }
        if (o.type === "history") {
          this.quiz(o.chapter);
          return true;
        }
        if (o.type === "travel") {
          V.UI.close();
          V.World.load(o.to);
          return true;
        }
        if (o.type === "board") {
          this.journal("missions");
          return true;
        }
        if (o.type === "workbench") {
          this.workshop(o.mission);
          return true;
        }
        if (o.type === "animal") return V.FieldGuide.panel(o);
        if (o.type === "pickup") {
          const q = V.state.sideQuests[o.mission];
          if (!q?.started) {
            this.showMission(o.mission);
            return true;
          }
          if (!V.state.tokens.includes(o.id)) V.state.tokens.push(o.id);
          this.event(o.id === "parcel" ? "pickup" : "collect", o.id);
          V.Audio.sfx("collect");
          V.Save.save();
          V.UI.toast(o.id === "parcel" ? "Caixa guardada. Leve-a \xE0 biblioteca." : "Etiqueta guardada no caderno.");
          return true;
        }
        if (o.type === "delivery") {
          if (!V.state.tokens.includes("parcel")) {
            V.UI.toast("Retire a caixa na pra\xE7a depois de aceitar a miss\xE3o.");
            return true;
          }
          if (!V.state.deliveries.includes(o.id)) V.state.deliveries.push(o.id);
          this.event("deliver", o.id);
          V.Save.save();
          V.UI.toast("Recebimento registrado pela biblioteca.");
          return true;
        }
        if (o.type === "water") {
          if (!V.state.sideQuests["garden-care"]?.started) {
            this.showMission("garden-care");
            return true;
          }
          if (!V.state.watered.includes(o.id)) V.state.watered.push(o.id);
          this.event("water", o.id);
          V.Engine.burst(o.x, o.y, "#59d9dd", 10);
          V.Audio.sfx("water");
          V.Save.save();
          V.UI.toast("Canteiro cuidado. Combine o pr\xF3ximo turno com Aisha.");
          return true;
        }
        return false;
      },
      workshop(id) {
        const q = missions.find((x) => x.id === id), s = V.state.sideQuests[id];
        if (!s?.started) {
          this.showMission(id);
          return;
        }
        if (s.done) {
          V.UI.toast("Oficina conclu\xEDda. O selo est\xE1 no caderno.");
          return;
        }
        if (q.steps[s.step].kind !== "puzzle") {
          V.UI.toast(q.steps[s.step].label);
          return;
        }
        const finish = () => {
          V.UI.close();
          this.event("puzzle", id);
          V.Audio.sfx("victory");
        };
        if (id === "rhythm-workshop") this.sequencePuzzle(finish);
        else if (id === "backup") this.matchPuzzle(finish);
        else if (id === "experiment") this.experiment(finish);
        else if (id === "newsroom") this.newsroom(finish);
        else this.classify(id, finish);
      },
      classify(id, done) {
        const exercises = {
          labels: { title: "Etiquetas da feira", intro: "Organize estas tr\xEAs partes do cat\xE1logo fict\xEDcio. Proced\xEAncia informa origem; descri\xE7\xE3o registra caracter\xEDsticas; interpreta\xE7\xE3o prop\xF5e um sentido.", labels: ["Proced\xEAncia", "Descri\xE7\xE3o", "Interpreta\xE7\xE3o"], items: [{ text: "Ficha assinada pela oficina do bairro, guardada no arquivo.", answer: 0 }, { text: "Cartaz de papel azul, com t\xEDtulo e tr\xEAs desenhos.", answer: 1 }, { text: "A composi\xE7\xE3o pode sugerir encontro e colabora\xE7\xE3o.", answer: 2 }] },
          exhibition: { title: "Uma legenda que abre perguntas", intro: "Uma boa legenda n\xE3o mistura o registro observado com uma conclus\xE3o sem apoio.", labels: ["O que o registro mostra", "De onde vem a informa\xE7\xE3o", "Pergunta para investigar"], items: [{ text: "H\xE1 uma data e uma assinatura no documento exposto.", answer: 0 }, { text: "A ficha de consulta registra o arquivo que guarda o original.", answer: 1 }, { text: "Que outras pessoas participaram e n\xE3o aparecem neste registro?", answer: 2 }] },
          interview: { title: "Mesa de escuta do parque", intro: "Conserve as duas propostas e construa uma decis\xE3o que possa ser revisada.", labels: ["Fala de Joana", "Fala de Celina", "Decis\xE3o compartilhada"], items: [{ text: "Quero livros e tradu\xE7\xF5es para a roda de leitura.", answer: 0 }, { text: "Precisamos de sombra, bancos e uma passagem livre.", answer: 1 }, { text: "Vamos reunir as duas propostas e testar o espa\xE7o com o grupo.", answer: 2 }] },
          "field-notes": { title: "Observar e levantar hip\xF3teses", intro: "Celina quer comparar as pausas do gato e os passos do pombo. Separe o registro da postura, uma poss\xEDvel explica\xE7\xE3o e uma pergunta que possa orientar outra observa\xE7\xE3o.", labels: ["Observa\xE7\xE3o", "Hip\xF3tese", "Pergunta de investiga\xE7\xE3o"], items: [{ text: "O gato permaneceu sentado perto de uma mesa.", answer: 0 }, { text: "Talvez tenha escolhido o lugar porque estava tranquilo.", answer: 1 }, { text: "Em outro momento, ele escolhe o mesmo lugar?", answer: 2 }] },
          "community-mail": { title: "Roteiro de mem\xF3ria oral", intro: "A hist\xF3ria do bairro pode ser documentada com autoriza\xE7\xE3o, contexto e respeito ao direito de n\xE3o responder.", labels: ["Consentimento", "Pergunta aberta", "Contexto do registro"], items: [{ text: "Voc\xEA concorda com o registro? Pode recusar ou pedir revis\xE3o.", answer: 0 }, { text: "Que lembran\xE7as voc\xEA gostaria de compartilhar sobre a feira?", answer: 1 }, { text: "Anote a data, quem entrevistou e as condi\xE7\xF5es de consulta.", answer: 2 }] },
          "human-review": { title: "Protocolo do arquivo", intro: "Organize um processo que permita conferir registros, incluir perspectivas e corrigir decis\xF5es.", labels: ["Conferir documenta\xE7\xE3o", "Ouvir e revisar", "Explicar e corrigir"], items: [{ text: "Verificar autoria, origem, data e limites dos documentos.", answer: 0 }, { text: "Convidar pessoas envolvidas para avaliar o cat\xE1logo.", answer: 1 }, { text: "Registrar as altera\xE7\xF5es e abrir um canal para novas corre\xE7\xF5es.", answer: 2 }] }
        };
        const e = exercises[id];
        if (!e) return;
        const chosen = Array(e.items.length).fill(-1);
        const show = () => {
          V.UI.modal(e.title, "OFICINA \xB7 ORGANIZA\xC7\xC3O E INTERPRETA\xC7\xC3O", `<p>${esc(e.intro)}</p><div class="stack">${e.items.map((item, i) => `<article class="sorting-card"><p>${esc(item.text)}</p><label class="field">Associar a<select data-sort-item="${i}"><option value="-1">Escolha uma categoria\u2026</option>${e.labels.map((label, j) => `<option value="${j}" ${chosen[i] === j ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></label></article>`).join("")}</div><div id="sort-feedback" aria-live="polite"></div>`, `<button id="sort-check" class="primary">Conferir associa\xE7\xE3o</button>`);
          V.$$("[data-sort-item]").forEach((el) => el.onchange = () => chosen[+el.dataset.sortItem] = +el.value);
          V.$("#sort-check").onclick = () => {
            const ok = e.items.every((item, i) => item.answer === chosen[i]);
            V.$("#sort-feedback").innerHTML = `<div class="feedback ${ok ? "" : "error"}">${ok ? "\u2713 As informa\xE7\xF5es ficaram organizadas. O registro mant\xE9m contexto e deixa espa\xE7o para novas perguntas." : "Revise as categorias: observe o que a frase faz, al\xE9m do assunto de que ela trata."}</div>`;
            V.Audio.sfx(ok ? "correct" : "wrong");
            if (ok) {
              V.$("#sort-check").textContent = "Concluir oficina \u2713";
              V.$("#sort-check").onclick = done;
            }
          };
        };
        show();
      },
      sequencePuzzle(done) {
        const target = [0, 2, 1, 2, 3], names = ["Luz azul", "Luz dourada", "Luz coral", "Luz violeta"];
        let input = [];
        const show = () => {
          V.UI.modal("Oficina de sequ\xEAncia", "PADR\xC3O ORIGINAL \xB7 SEM LIMITE DE TEMPO", `<p>Reproduza o sinal coletivo indicado abaixo. Use as cores e os n\xFAmeros para acompanhar a sequ\xEAncia. Escute o ritmo e repita na mesma ordem.</p><div class="sequence-target">${target.map((n) => `<span class="sequence-token token-${n}">${n + 1}<small>${names[n]}</small></span>`).join("")}</div><div class="sequence-input" id="sequence-input">${input.length ? input.map((n) => names[n]).join(" \u2192 ") : "Sua sequ\xEAncia aparece aqui."}</div><div class="four-cols">${names.map((n, i) => `<button class="sequence-key token-${i}" data-sequence-key="${i}">${i + 1} \xB7 ${n}</button>`).join("")}</div><div id="sequence-feedback" aria-live="polite"></div>`, `<button id="sequence-reset" class="secondary">Recome\xE7ar padr\xE3o</button><button id="sequence-check" class="primary">Conferir sequ\xEAncia</button>`);
          V.$$("[data-sequence-key]").forEach((b) => b.onclick = () => {
            if (input.length >= target.length) return;
            input.push(+b.dataset.sequenceKey);
            V.Audio.note(60 + input.at(-1) * 3, 0.16, "sine", 0.3);
            V.$("#sequence-input").textContent = input.map((n) => names[n]).join(" \u2192 ");
          });
          V.$("#sequence-reset").onclick = () => {
            input = [];
            show();
          };
          V.$("#sequence-check").onclick = () => {
            const ok = input.join(",") === target.join(",");
            V.$("#sequence-feedback").innerHTML = `<div class="feedback ${ok ? "" : "error"}">${ok ? "\u2713 O grupo pode come\xE7ar o ensaio." : "Compare o seu padr\xE3o com o sinal. Voc\xEA pode recome\xE7ar quantas vezes precisar."}</div>`;
            if (ok) {
              V.$("#sequence-check").textContent = "Concluir oficina \u2713";
              V.$("#sequence-check").onclick = done;
            }
          };
        };
        show();
      },
      matchPuzzle(done) {
        const pairs = [["Assinatura", "Autoria"], ["Ficha de arquivo", "Origem"], ["Ano registrado", "Data"], ["Condi\xE7\xF5es de produ\xE7\xE3o", "Contexto"]];
        const cards = pairs.flatMap((p2, i) => p2.map((label) => ({ label, pair: i })));
        const order = [0, 5, 3, 6, 4, 1, 7, 2].map((i) => cards[i]);
        let selected = [], matched = [], mistake = false;
        const show = () => {
          V.UI.modal("Cataloga\xE7\xE3o em pares", "ASSOCIA\xC7\xC3O DE IDEIAS \xB7 SEM CRON\xD4METRO", `<p>Una cada registro ao tipo de informa\xE7\xE3o que ele ajuda a conferir. Os termos permanecem vis\xEDveis para permitir compara\xE7\xE3o.</p><div class="four-cols">${order.map((c, i) => `<button class="archive-card ${matched.includes(i) ? "matched" : selected.includes(i) ? "selected" : ""}" data-match-card="${i}" ${matched.includes(i) ? "disabled" : ""}>${esc(c.label)}${matched.includes(i) ? " \u2713" : ""}</button>`).join("")}</div><div class="feedback ${mistake ? "error" : ""}">${matched.length === 8 ? "\u2713 O cat\xE1logo pode ser conferido por outras pessoas." : mistake ? "Esses termos ajudam a conferir informa\xE7\xF5es diferentes. Tente outra associa\xE7\xE3o." : selected.length === 1 ? "Agora escolha o termo correspondente." : "Escolha dois termos que formam um par."}</div>`, `<button id="match-finish" class="primary" ${matched.length !== 8 ? "disabled" : ""}>Concluir cat\xE1logo \u2713</button>`);
          V.$$("[data-match-card]").forEach((b) => b.onclick = () => {
            const i = +b.dataset.matchCard;
            if (selected.includes(i)) return;
            selected.push(i);
            mistake = false;
            if (selected.length === 2) {
              if (order[selected[0]].pair === order[selected[1]].pair) {
                matched.push(...selected);
                V.Audio.sfx("correct");
              } else {
                mistake = true;
                V.Audio.sfx("wrong");
              }
              selected = [];
            }
            show();
          });
          V.$("#match-finish").onclick = done;
        };
        show();
      },
      experiment(done) {
        let choice = -1;
        V.UI.modal("Luz para a oficina", "LABORAT\xD3RIO \xB7 EXPERIMENTO FICCIONAL", `<p>Caio quer comparar duas l\xE2mpadas. Para investigar o efeito do modelo, \xE9 necess\xE1rio manter outras condi\xE7\xF5es iguais.</p><div class="stack">${["Usar o mesmo tempo e a mesma alimenta\xE7\xE3o el\xE9trica para as duas l\xE2mpadas.", "Mudar ao mesmo tempo a l\xE2mpada, o tempo e a alimenta\xE7\xE3o.", "Escolher a l\xE2mpada com a embalagem mais bonita."].map((t, i) => `<button class="choice-button" data-experiment="${i}">${esc(t)}</button>`).join("")}</div><div id="experiment-result" aria-live="polite"></div>`, `<button id="experiment-run" class="primary" disabled>Executar teste</button>`);
        V.$$("[data-experiment]").forEach((b) => b.onclick = () => {
          choice = +b.dataset.experiment;
          V.$$("[data-experiment]").forEach((x) => x.classList.toggle("selected", x === b));
          V.$("#experiment-run").disabled = false;
        });
        V.$("#experiment-run").onclick = () => {
          if (choice !== 0) {
            V.$("#experiment-result").innerHTML = '<div class="feedback error">Mudar v\xE1rias condi\xE7\xF5es impede saber o que provocou a diferen\xE7a. Revise o planejamento e teste novamente.</div>';
            V.Audio.sfx("wrong");
            return;
          }
          V.$("#experiment-result").innerHTML = '<div class="feedback"><strong>Resultado fict\xEDcio: A = 8 unidades; B = 5 unidades de consumo.</strong><p>As duas iluminaram o mesmo espa\xE7o durante o mesmo tempo. B consumiu menos neste teste. A equipe ainda vai avaliar durabilidade e acessibilidade antes de decidir.</p></div>';
          V.Audio.sfx("correct");
          V.$("#experiment-run").textContent = "Registrar teste e concluir \u2713";
          V.$("#experiment-run").onclick = done;
        };
      },
      newsroom(done) {
        const checks = new Set();
        V.UI.modal("Bancada do jornal", "REDA\xC7\xC3O \xB7 NOT\xCDCIA FICCIONAL", `<article class="social-post"><div class="post-head">RASCUNHO / FEIRA DAS HIST\xD3RIAS</div><h3>Feira ter\xE1 uma roda de leitura no s\xE1bado</h3><p>O rascunho diz que a atividade est\xE1 em prepara\xE7\xE3o. A equipe precisa conferir quais informa\xE7\xF5es pode publicar.</p></article><div class="three-cols">${[["author", "Autoria", "Equipe da feira; contato registrado pela reda\xE7\xE3o."], ["date", "Data", "Aviso escrito nesta semana; hor\xE1rio ainda em confirma\xE7\xE3o."], ["context", "Contexto", "A roda foi planejada com moradores. A passagem acess\xEDvel ser\xE1 testada antes da abertura."]].map(([id, label, text]) => `<button class="source-check" data-news-check="${id}" data-news-text="${esc(text)}">Conferir ${label}</button>`).join("")}</div><div id="news-records" class="stack"></div><label class="field" style="margin-top:18px">Manchete para publicar<select id="news-headline"><option value="-1">Escolha depois de conferir\u2026</option><option value="0">Feira prepara roda de leitura; hor\xE1rio ser\xE1 confirmado pela equipe.</option><option value="1">Todos os problemas da cidade acabaram gra\xE7as \xE0 feira.</option><option value="2">Uma pessoa criou sozinha toda a programa\xE7\xE3o da feira.</option></select></label><div id="news-feedback" aria-live="polite"></div>`, `<button id="news-publish" class="primary">Revisar publica\xE7\xE3o</button>`);
        V.$$("[data-news-check]").forEach((b) => b.onclick = () => {
          if (checks.has(b.dataset.newsCheck)) return;
          checks.add(b.dataset.newsCheck);
          b.textContent += " \u2713";
          V.$("#news-records").innerHTML += `<div class="feedback">${esc(b.dataset.newsText)}</div>`;
        });
        V.$("#news-publish").onclick = () => {
          const ok = checks.size === 3 && V.$("#news-headline").value === "0";
          V.$("#news-feedback").innerHTML = `<div class="feedback ${ok ? "" : "error"}">${ok ? "\u2713 A manchete explica o que est\xE1 confirmado e o que ainda precisa de atualiza\xE7\xE3o." : "Confira as tr\xEAs partes do registro. A manchete precisa respeitar os limites da informa\xE7\xE3o."}</div>`;
          if (ok) {
            V.$("#news-publish").textContent = "Concluir edi\xE7\xE3o \u2713";
            V.$("#news-publish").onclick = done;
          } else V.Audio.sfx("wrong");
        };
      },
      richProp(ctx, index, x, y, size = 48) {
        const img = V.Assets.images["world-props"];
        if (img) ctx.drawImage(img, index % 8 * 32, Math.floor(index / 8) * 32, 32, 32, Math.round(x), Math.round(y), size, size);
      },
      ground(m) {
        baseGround(m);
        const ctx = m.cache.getContext("2d"), tiles = V.Assets.images.tiles;
        m.zones.forEach((z) => {
          for (let y = z.y; y < z.y + z.h; y++) for (let x = z.x; x < z.x + z.w; x++) {
            if (!tiles) continue;
            ctx.drawImage(tiles, z.tile % 8 * 32, Math.floor(z.tile / 8) * 32, 32, 32, x * T, y * T, T, T);
          }
        });
        if (m.pond) {
          const p2 = m.pond;
          ctx.fillStyle = "#235d70";
          ctx.fillRect(p2.x * T, p2.y * T, p2.w * T, p2.h * T);
          ctx.strokeStyle = "#79a9a6";
          ctx.lineWidth = 8;
          ctx.strokeRect(p2.x * T, p2.y * T, p2.w * T, p2.h * T);
        }
        if (m.theme === "room") {
          ctx.fillStyle = "#131d2d";
          ctx.fillRect(T, T, (m.width - 2) * T, T);
          ctx.fillStyle = "#c8ba81";
          for (let x = 3; x < m.width - 2; x += 5) ctx.fillRect(x * T, T + 12, 40, 20);
          V.Engine.text(ctx, { reading: "SALA DE LEITURA", studio: "EST\xDADIO DE ENSAIO", archive: "ARQUIVO E CURADORIA", laboratory: "LABORAT\xD3RIO ABERTO", newsroom: "REDA\xC7\xC3O DO BAIRRO", assembly: "ASSEMBLEIA COMUNIT\xC1RIA", control: "CAT\xC1LOGO E REVIS\xC3O" }[m.roomStyle], m.width * T / 2, 87, "#e8dcaa", 14, "center");
        }
        // Authored area labels help students navigate the dense scenery.
        const labels = m.biome === "park" ? [[7, 10, "RODA DE LEITURA"], [19, 12, "OBSERVA\xC7\xC3O DO LAGO"]] : m.biome === "market" ? [[6, 9, "ATELI\xCAS"], [22, 10, "FEIRA DO BAIRRO"]] : m.biome === "garden" ? [[12, 5, "HORTA EM CONJUNTO"]] : m.id === "hub" ? [[7, 16, "FEIRA \u2192"], [24, 18, "PARQUE E BIBLIOTECA"]] : [];
        labels.forEach(([x, y, label]) => {
          ctx.fillStyle = "#101c2d99";
          ctx.fillRect(x * T - 68, y * T, 136, 22);
          V.Engine.text(ctx, label, x * T, y * T + 15, "#dbe6dc", 9, "center");
        });
      },
      drawObject(ctx, o, cam, t) {
        const x = o.x - cam.x, y = o.y - cam.y, near = V.World.nearest?.id === o.id;
        if (x < -120 || x > (V.Engine.canvas?.width || 960) + 120 || y < -120 || y > (V.Engine.canvas?.height || 540) + 120) return;
        if (["resident", "ambient", "npc"].includes(o.type)) {
          V.Assets.sprite(ctx, o.character, x, y, !o.walking && o.chatSpeaking && !V.settings.reducedMotion ? 4 : o.dir || 0, o.walking ? o.frame : o.chatSpeaking && !V.settings.reducedMotion ? Math.floor(V.Engine.time * 3) % 4 : 0, 56);
          let marker = o.type === "npc" ? (o.hub ? V.state.flags.prologueStarted : V.state.talked.includes(o.id)) ? "\u2026" : "!" : o.type === "resident" ? "\u2026" : "";
          if (o.type === "resident" && missions.some((q) => q.owner === o.resident.id && !V.state.sideQuests[q.id]?.done)) marker = "\u25C7";
          if (marker && (near || o.type !== "ambient")) this.marker(ctx, x, y, marker, o.type === "resident" ? "#a0dfa1" : t.accent);
          if (o.bubble && V.settings.npcChats !== false && V.settings.subtitles) this.bubble(ctx, o.bubble, x, y - 79);
        } else if (o.type === "animal") {
          this.drawTownAnimal(ctx, o, x, y);
          if (near) this.marker(ctx, x, y, "\u25CE", "#f4b85a");
        } else if (o.type === "reading") {
          V.Assets.prop(ctx, o.prop, x - 24, y - 36, 48);
          this.marker(ctx, x, y, V.state.readings.includes(o.id) ? "\u2713" : o.reading.kind === "book" ? "L" : "N", "#f4b85a");
        } else if (["history", "travel", "board", "pickup", "delivery", "workbench", "water"].includes(o.type)) {
          if (o.richProp !== void 0) this.richProp(ctx, o.richProp, x - 24, y - 34);
          else V.Assets.prop(ctx, o.prop || 8, x - 24, y - 36, 48);
          const done = o.type === "water" ? V.state.watered.includes(o.id) : o.type === "pickup" ? V.state.tokens.includes(o.id) : o.type === "delivery" ? V.state.deliveries.includes(o.id) : o.type === "workbench" ? V.state.sideQuests[o.mission]?.done : false;
          const mark = done ? "\u2713" : { history: "H?", travel: "\u2192", board: "\u25C7", pickup: "+", delivery: "\u2193", workbench: "\u2692", water: "~" }[o.type];
          if (o.type === "water" && done) {
            ctx.fillStyle = "#59d9dd88";
            ctx.fillRect(x - 17, y - 5, 34, 4);
          }
          this.marker(ctx, x, y, mark, o.type === "history" ? "#b18aff" : "#a0dfa1");
        } else baseDraw(ctx, o, cam, t);
        if (near && ["resident", "ambient", "animal", "reading", "history", "travel", "board", "pickup", "delivery", "workbench", "water"].includes(o.type)) {
          ctx.strokeStyle = "#f4b85a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(x, y + 6, 23, 9, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      },
      marker(ctx, x, y, text, color) {
        ctx.fillStyle = "#111b2aec";
        ctx.fillRect(x - 14, y - 79, 28, 23);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 14, y - 79, 28, 23);
        V.Engine.text(ctx, text, x, y - 63, color, 12, "center");
      },
      bubble(ctx, text, x, y) {
        const words = text.split(" "), lines = [];
        let line = "";
        for (const w of words) {
          if ((line + " " + w).length > 34) {
            lines.push(line);
            line = w;
          } else line += (line ? " " : "") + w;
        }
        if (line) lines.push(line);
        const shown = lines.slice(0, 3), width = 230, height = shown.length * 16 + 18;
        ctx.fillStyle = "#fff0ce";
        ctx.fillRect(x - width / 2, y - height, width, height);
        ctx.fillStyle = "#283549";
        ctx.fillRect(x - 3, y, 7, 7);
        shown.forEach((l, i) => V.Engine.text(ctx, l, x - width / 2 + 10, y - height + 20 + i * 16, "#243449", 10));
      },
      render(ctx) {
        const W = V.World, m = W.current;
        if (!m) return;
        this.ensure();
        const cam = W.camera, t = { accent: m.chapter ? V.content.chapters[m.chapter - 1].color : "#59d9dd" };
        if (!m.cache) this.ground(m);
        ctx.fillStyle = "#19293b";
        ctx.fillRect(0, 0, 960, 540);
        V.GroundCache.draw(ctx, m.cache, Math.round(-cam.x), Math.round(-cam.y));
        m.buildings.forEach((b) => W.drawBuilding(ctx, b, cam));
        if (m.id === "hub") W.drawFountain(ctx, cam);
        if (m.pond) {
          const p2 = m.pond;
          ctx.strokeStyle = "#8dc9d477";
          ctx.lineWidth = 2;
          for (let i = 0; i < 7; i++) {
            const x = (p2.x + 0.8 + i % 3 * 1.5) * T - cam.x, y = (p2.y + 0.7 + Math.floor(i / 3) * 1.3) * T - cam.y;
            ctx.beginPath();
            ctx.ellipse(x, y, 12 + Math.sin(V.Engine.time + i) * 4, 4, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        const draws = m.decor.map((o) => ({ y: o.y + T, kind: "decor", o })).concat(m.objects.map((o) => ({ y: o.y, kind: "object", o })), [{ y: V.Player.data.y, kind: "player" }]).sort((a, b) => a.y - b.y);
        draws.forEach((d) => {
          if (d.kind === "player") V.Player.render(ctx);
          else if (d.kind === "object") this.drawObject(ctx, d.o, cam, t);
          else {
            const o = d.o, x = o.x - cam.x, y = o.y - cam.y;
            if (x > -80 && x < 1040 && y > -80 && y < 620) {
              if (o.rich) this.richProp(ctx, o.prop, x, y, T);
              else V.Assets.prop(ctx, o.prop, x, y, T);
            }
          }
        });
        if (m.chapter === 5 && V.state.projects.length) W.drawProjects(ctx, cam);
        if (V.PixPresence?.following()) V.PixPresence.draw(ctx, V.Player.data, cam);
        if (V.Game.scanTarget) {
          const o = V.Game.scanTarget;
          ctx.strokeStyle = "#f4b85a";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 5]);
          ctx.beginPath();
          ctx.moveTo(p.x - cam.x, p.y - cam.y);
          ctx.lineTo(o.x - cam.x, o.y - cam.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        V.Engine.drawParticles(ctx, cam);
        if (!V.settings.highContrast) {
          const g = ctx.createRadialGradient(480, 270, 190, 480, 270, 600);
          g.addColorStop(0, "#060e1a00");
          g.addColorStop(1, "#050a1840");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 960, 540);
        }
        if (W.transition > 0) {
          ctx.globalAlpha = W.transition;
          ctx.fillStyle = "#141827";
          ctx.fillRect(0, 0, 960, 540);
          ctx.globalAlpha = 1;
        }
        W.drawMiniMap();
      },
      extendMap() {
        const body = V.$(".modal-body");
        if (!body) return;
        body.innerHTML += `<div class="separator"></div><div class="section-label">ESPA\xC7OS DA COMUNIDADE</div><div class="three-cols" style="margin-top:12px">${["library", "park", "market", "garden"].map((id) => `<button class="map-card" data-local-region="${id}" style="--region:#a0dfa1"><span class="chip">EXPLORA\xC7\xC3O LIVRE</span><b>${esc(this.location(id))}</b><small>${{ library: "Leituras, cataloga\xE7\xE3o e arquivo.", park: "Animais, lago e rodas de conversa.", market: "Bancas, etiquetas e jornal do bairro.", garden: "Canteiros e cuidado em conjunto." }[id]}</small><small>Visitar \u2192</small></button>`).join("")}</div>`;
        // Updating this body replaces region buttons, so reattach their handlers too.
        V.$$("[data-region]").forEach((b) => b.onclick = () => V.Game.enterChapter(+b.dataset.region));
        V.$$("[data-local-region]").forEach((b) => b.onclick = () => {
          V.UI.close();
          V.World.load(b.dataset.localRegion);
        });
      }
    };
    V.Hooks.around(V.World, "init", "living-world:init:1", (baseInit) => function() {
      baseInit();
      V.Living.build();
    });
    V.World.load = function(id, position = null) {
      V.Living.ensure();
      baseLoad(id, position);
      V.Audio.setEnvironment(this.current);
      V.Living.updateHUD();
    };
    V.World.update = function(dt) {
      V.Living.update(dt);
      baseUpdate(dt);
    };
    V.World.render = (ctx) => V.Living.render(ctx);
    V.World.drawMiniMap = function() {
      baseMini();
      const m = this.current, ctx = V.$("#minimap").getContext("2d"), sx = 128 / (m.width * T), sy = 88 / (m.height * T);
      m.objects.filter((o) => ["reading", "resident", "workbench", "travel"].includes(o.type)).forEach((o) => {
        ctx.fillStyle = o.type === "reading" ? "#f4b85a" : o.type === "travel" ? "#b18aff" : "#a0dfa1";
        ctx.fillRect(o.x * sx - 1, o.y * sy - 1, 3, 3);
      });
    };
    V.Quests.journal = () => V.Living.journal("quests");
  })();
});
