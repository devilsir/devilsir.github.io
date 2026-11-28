/* Registered module: heritage-world */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("heritage-world", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, C = V.Cozy, D = V.SceneDesign, L = V.Living, W = V.World, data = V.heritageContent, T = 48, esc = V.escape, copy = (x) => JSON.parse(JSON.stringify(x));
    for (const key of ["sources", "readings", "questions", "residents"]) for (const item of data[key] || []) if (!V.cozyContent[key].some((x) => x.id === item.id)) V.cozyContent[key].push(item);
    const prior = { assets: V.Assets.load.bind(V.Assets), prop: C.prop.bind(C), compose: C.compose.bind(C), draw: C.drawObject.bind(C), interact: C.interact.bind(C), resident: C.resident.bind(C), ensure: C.ensure.bind(C), content: C.initContent.bind(C), journal: L.journal.bind(L), nav: L.nav.bind(L), workshop: L.workshop.bind(L), cover: V.Interface.cover.bind(V.Interface) };
    const missions = [
      { heritage: true, id: "heritage-sounds", title: "Como o som come\xE7a", owner: "mila", map: "chapter-1", brief: "Mila prepara uma instrumentoteca. Leia as fichas e compare os gestos que d\xE3o in\xEDcio aos sons.", reward: "Instrumentoteca com mecanismos identificados", steps: [{ kind: "talk", targets: ["mila"], label: "Converse com Mila no Distrito do Ritmo." }, { kind: "read", targets: ["heritage-book-instruments"], label: "Leia a instrumentoteca, tamb\xE9m dispon\xEDvel na biblioteca." }, { kind: "puzzle", targets: ["heritage-sounds"], label: "Compare os instrumentos com Mila." }] },
      { heritage: true, id: "heritage-voices", title: "Duas fichas, muitas hist\xF3rias", owner: "ravi", map: "library", brief: "Raul organiza uma mostra de literatura. Conhe\xE7a Machado e Carolina e escolha legendas que reconhe\xE7am a diversidade de cria\xE7\xE3o.", reward: "Fichas de literatura revisadas no acervo", steps: [{ kind: "talk", targets: ["ravi"], label: "Converse com Raul na biblioteca." }, { kind: "read", targets: ["heritage-book-machado", "heritage-book-carolina"], label: "Consulte as duas fichas hist\xF3ricas." }, { kind: "puzzle", targets: ["heritage-voices"], label: "Revise as legendas com Raul." }] },
      { heritage: true, id: "heritage-contexts", title: "O tecido e sua hist\xF3ria", owner: "ravi", map: "market", brief: "A mostra de tecidos precisa distinguir t\xE9cnica, nome e contexto. Consulte as pe\xE7as da feira e a leitura antes de comparar.", reward: "Descri\xE7\xE3o de t\xE9cnicas t\xEAxteis guardada no caderno", steps: [{ kind: "read", targets: ["heritage-book-textiles"], label: "Leia sobre Kente, Ankara, turbantes e contextos." }, { kind: "puzzle", targets: ["heritage-contexts"], label: "Compare os tecidos na mostra da feira ou no caderno." }] }
    ];
    L.missions.push(...missions);
    for (const e of data.entries) {
      const d = C.layouts[e.map];
      d.scenes.push({ id: e.id, kind: "exhibit", x: e.x, y: e.y, family: "expanded", prop: e.index, size: 1.1, title: e.title, text: e.description, heritageItem: e.id });
    }
    const addScene = (map, s) => C.layouts[map].scenes.push(s);
    addScene("chapter-1", { id: "heritage-rock-station", kind: "listening", x: 22, y: 17.5, family: "expanded", prop: 63, size: 1.4, title: "Blues, rock e resposta musical", text: "Compare duas frases originais e consulte a leitura sobre influ\xEAncias negras.", heritageMusic: true });
    addScene("library", { id: "heritage-reading-desk", kind: "shelf", x: 13, y: 13.8, family: "expanded", prop: 62, size: 1.35, title: "Vozes da literatura, arte e ci\xEAncia", text: "Retratos hist\xF3ricos, instrumentos e refer\xEAncias culturais com autoria e fontes.", heritageCollection: true });
    const furnish = (id, index, x, y, size = 1.4, solid = true) => C.layouts[id].decor.push(["expanded", index, x, y, size, solid, { id: "heritage-furniture-" + id + "-" + index, layer: index === 20 ? "ground" : "object" }]);
    furnish("library", 18, 2.2, 9.2, 1.2, false);
    furnish("room-1", 31, 2.2, 13.5, 1.4);
    furnish("room-4", 19, 13, 2.3, 1, false);
    furnish("chapter-5", 27, 3, 13.2, 1.25, false);
    furnish("garden", 39, 20.5, 15.8, 1.5);
    furnish("park", 38, 11, 19.5, 1.1);
    const librarySeat = C.layouts.library.scenes.find((s) => s.id === "reading-right");
    Object.assign(librarySeat, { family: "expanded", prop: 0, size: 1.6, title: "Sof\xE1 de leitura compartilhada" });
    const room6Counter = C.layouts["room-6"].decor.find((r) => r[0] === "scene" && r[1] === 29);
    if (room6Counter) {
      room6Counter[0] = "expanded";
      room6Counter[1] = 29;
    }
    D.defaults = copy(C.layouts);
    V.Heritage = {
      ensure() {
        if (!V.state) return;
        const s = V.state.heritage;
        if (!s || typeof s !== "object" || Array.isArray(s)) V.state.heritage = {};
        for (const k of ["figures", "items", "compared"]) {
          const a = V.state.heritage[k];
          V.state.heritage[k] = Array.isArray(a) ? [...new Set(a.filter((x) => typeof x === "string" && x.length < 100))].slice(0, 100) : [];
        }
      },
      remember(kind, id) {
        this.ensure();
        const a = V.state.heritage[kind];
        if (!a.includes(id)) a.push(id);
        V.Save.save();
      },
      sources(ids) {
        return (ids || []).map((id) => V.content.sources.find((s) => s.id === id)).filter(Boolean).map((s) => `<article class="source-row"><strong>${esc(s.name)}</strong><p>${esc(s.note)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Consultar refer\xEAncia \u2197</a></article>`).join("");
      },
      icon(family, index, size = 160) {
        const canvas = V.$("#heritage-object-art");
        if (!canvas) return;
        const image = V.Assets.images["expanded-props"];
        const draw = () => {
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = false;
          C.prop(ctx, family, index, (canvas.width - size) / 2, (canvas.height - size) / 2, size);
        };
        if (V.Assets.ready(image)) draw();
        else V.AssetLoader.request(image).then((loaded) => {
          if (loaded && canvas.isConnected) draw();
        });
      },
      entry(id) {
        const e = data.entries.find((x) => x.id === id);
        if (!e) return;
        this.remember("items", id);
        const sound = !!e.mechanism, biography = id === "heritage-item-59";
        V.UI.modal(e.title, "OBJETOS, MATERIAIS E T\xC9CNICAS", `<figure class="culture-piece"><canvas id="heritage-object-art" width="220" height="190" role="img" aria-label="${esc(e.title)}: ${esc(e.description)}"></canvas><figcaption>${esc(e.title)}</figcaption></figure><p>${esc(e.description)}</p>${sound ? '<p class="note">Compare o ataque e a dura\xE7\xE3o dos sons. O \xE1udio desta atividade usa s\xEDntese sonora; a descri\xE7\xE3o explica o mecanismo de cada instrumento.</p>' : ""}<div id="heritage-sound-feedback" aria-live="polite"></div><details><summary>Fontes e contexto</summary>${this.sources(e.sourceIds)}</details>`, `<button id="heritage-item-read" class="primary">Abrir leitura relacionada</button>${biography ? '<button id="heritage-item-biography" class="secondary">Ler biografia de Jos\xE9 Ad\xE1rio</button>' : ""}${sound ? '<button id="heritage-item-play" class="secondary">Ouvir compara\xE7\xE3o original</button>' : ""}<button id="heritage-item-task" class="secondary">${sound ? "Comparar instrumentos" : e.readingId.endsWith("textiles") ? "Comparar contextos" : "Rever legendas e refer\xEAncias"}</button>`);
        this.icon("expanded", e.index);
        V.$("#heritage-item-read").onclick = () => L.read(e.readingId, 0, () => this.entry(id));
        if (biography) V.$("#heritage-item-biography").onclick = () => V.MuseumBiographies.open("adario", () => this.entry(id));
        if (sound) V.$("#heritage-item-play").onclick = () => this.sound(e);
        V.$("#heritage-item-task").onclick = () => sound ? this.workshop("heritage-sounds") : e.readingId.endsWith("textiles") ? this.workshop("heritage-contexts") : L.read(e.readingId, 0, () => this.entry(id));
      },
      sound(e) {
        V.Audio.unlock();
        const patterns = { corda: [[55, 0], [62, 0.28], [55, 0.56], [62, 0.84]], pele: [[45, 0], [52, 0.28], [45, 0.56], [52, 0.84]], metal: [[80, 0], [86, 0.28], [80, 0.56], [86, 0.84]], raspagem: [[66, 0], [68, 0.1], [66, 0.2], [68, 0.3]], contas: [[78, 0], [81, 0.08], [83, 0.16], [78, 0.24]], fric\u00E7\u00E3o: [[52, 0], [60, 0.24], [57, 0.48], [65, 0.72]] }, wave = ["raspagem", "fric\xE7\xE3o"].includes(e.mechanism) ? "sawtooth" : e.mechanism === "metal" ? "sine" : "triangle";
        for (const [n, delay] of patterns[e.mechanism] || patterns.pele) V.Audio.note(n, 0.17, wave, 0.14, "sfx", delay);
        const output = V.$("#heritage-sound-feedback");
        if (output) output.textContent = "Compara\xE7\xE3o original: " + e.mechanism + ". Escute os ataques e as mudan\xE7as; a descri\xE7\xE3o da ficha permanece dispon\xEDvel.";
      },
      figure(id) {
        const f = data.figures.find((x) => x.id === id);
        if (!f) return;
        this.remember("figures", id);
        V.Dialogue.start(f.facts.map((pt, i) => ({ speaker: f.character, pt, en: f.enFacts[i] })), () => this.profile(id));
      },
      profile(id) {
        const f = data.figures.find((x) => x.id === id);
        if (!f) return;
        if (!V.MuseumBiographyData && window.VoicesApp) return window.VoicesApp.withFeature("museum-biographies", () => this.profile(id));
        V.UI.modal(f.name, "Retrato do acervo \xB7 Biografia", `<figure class="culture-piece"><canvas id="heritage-object-art" width="190" height="190" role="img" aria-label="Retrato de ${esc(f.name)}"></canvas><figcaption>${esc(f.role)}</figcaption></figure>${f.facts.map((t) => `<p>${esc(t)}</p>`).join("")}<details><summary>Fontes do registro original</summary>${this.sources(f.sourceIds)}</details>${V.MuseumBiographies.render(id)}`, `<button id="heritage-figure-read" class="primary">Ler o livro do acervo</button><button id="heritage-figure-back" class="secondary">Cole\xE7\xE3o de vozes</button>`, true);
        V.$(".modal").classList.add("museum-bio-modal");
        V.MuseumBiographies.bindRelated(() => this.profile(id));
        V.UI.drawPortrait(V.$("#heritage-object-art"), f.character);
        V.$("#heritage-figure-read").onclick = () => L.read(f.readingId, 0, () => this.profile(id));
        V.$("#heritage-figure-back").onclick = () => this.journal();
      },
      collection() {
        V.UI.modal("Vozes e objetos do bairro", "M\xDASICA, LITERATURA, ARTE E CI\xCANCIA", `<p>Escolha um registro. Conhe\xE7a trajet\xF3rias na m\xFAsica, literatura e ci\xEAncia, al\xE9m de t\xE9cnicas e hist\xF3rias dos objetos do acervo.</p><p><button type="button" class="primary" id="heritage-biographies">Consultar todas as biografias</button></p><div class="two-cols">${data.figures.map((f) => `<button class="book-card heritage-figure-card" data-heritage-figure="${f.id}"><canvas width="112" height="112" data-figure-portrait="${f.character}" role="img" aria-label="Retrato de ${esc(f.name)}"></canvas><div><small>${esc(f.role)}</small><strong>${esc(f.name)}</strong><span>Retrato e biografia</span></div></button>`).join("")}</div><div class="stack">${data.readings.map((r) => `<button class="secondary" data-heritage-read="${r.id}">${esc(r.title)}</button>`).join("")}</div>`);
        V.$("#heritage-biographies").onclick = () => V.MuseumBiographies.catalog(() => this.collection());
        this.bindCollection();
      },
      bindCollection() {
        V.$$("[data-figure-portrait]").forEach((canvas) => V.UI.drawPortrait(canvas, canvas.dataset.figurePortrait));
        V.$$("[data-heritage-figure]").forEach((b) => b.onclick = () => this.profile(b.dataset.heritageFigure));
        V.$$("[data-heritage-read]").forEach((b) => b.onclick = () => L.read(b.dataset.heritageRead, 0, () => this.journal()));
        V.$$("[data-heritage-item]").forEach((b) => b.onclick = () => this.entry(b.dataset.heritageItem));
        V.$$("[data-heritage-task]").forEach((b) => b.onclick = () => this.workshop(b.dataset.heritageTask));
      },
      journal() {
        this.ensure();
        V.UI.modal("Caderno \xB7 vozes e objetos", "DESCOBERTAS QUE CONTINUAM DISPON\xCDVEIS", L.nav("heritage") + `<p>Instrumentos, tecidos, arte e retratos hist\xF3ricos. Cada registro pode ser revisto com texto e fontes.</p><p><button type="button" class="primary" id="heritage-biographies">Consultar todas as biografias</button></p><div class="two-cols">${data.figures.map((f) => `<button class="book-card heritage-figure-card" data-heritage-figure="${f.id}"><canvas width="112" height="112" data-figure-portrait="${f.character}" role="img" aria-label="Retrato de ${esc(f.name)}"></canvas><div><small>${V.state.heritage.figures.includes(f.id) ? "Visitado" : "Explorar"} \xB7 ${esc(f.role)}</small><strong>${esc(f.name)}</strong></div></button>`).join("")}</div><h3>Leituras</h3><div class="stack">${data.readings.map((r) => `<button class="secondary" data-heritage-read="${r.id}">${esc(r.title)}</button>`).join("")}</div><h3>Objetos e contextos</h3><div class="two-cols">${data.entries.map((e) => `<button class="book-card" data-heritage-item="${e.id}"><small>${V.state.heritage.items.includes(e.id) ? "Observado" : "Consultar ficha"}</small><strong>${esc(e.title)}</strong></button>`).join("")}</div><h3>Trabalhos em conjunto</h3><div class="stack">${missions.map((q) => `<button class="secondary" data-heritage-task="${q.id}">${esc(q.title)} \xB7 ${V.state.sideQuests[q.id]?.done ? "Conclu\xEDdo" : "Experimentar"}</button>`).join("")}</div>`, "", true);
        V.$("#heritage-biographies").onclick = () => V.MuseumBiographies.catalog(() => this.journal());
        L.bindNav();
        this.bindCollection();
      },
      talk(o) {
        const r = o.resident, seen = V.state.residentTalks.includes(r.id), revised = r.id === "mila" ? V.state.sideQuests["heritage-sounds"]?.done : V.state.sideQuests["heritage-voices"]?.done, thanks = r.id === "mila" ? { speaker: r.character, en: "Our labels are ready. Let\u2019s listen to a new phrase.", pt: "As fichas ficaram claras. Vamos ouvir uma frase e deixar espa\xE7o pra resposta?" } : { speaker: r.character, en: "We checked the captions. I saved more books for you.", pt: "Conferimos a autoria das legendas. Separei mais leituras pra voc\xEA." }, lines = revised ? [thanks] : seen ? [r.lines[(o.visits = (o.visits || 0) + 1) % r.lines.length]] : r.lines.slice(0, 2);
        V.Dialogue.start(lines, () => {
          if (!V.state.residentTalks.includes(r.id)) V.state.residentTalks.push(r.id);
          L.event("talk", r.id);
          V.Save.save();
          const offers = missions.filter((q) => q.owner === r.id && !V.state.sideQuests[q.id]?.done);
          V.UI.modal(r.name + " \xB7 hist\xF3rias e descobertas", r.role, `<p>${r.id === "mila" ? "Instrumentos, blues, rock e autoria musical. As leituras ajudam a comparar antes de escolher." : "Literatura, cria\xE7\xE3o e contextos. Voc\xEA pode voltar aos registros quantas vezes quiser."}</p><div class="stack">${offers.map((q) => L.missionCard(q)).join("")}</div><button id="heritage-resident-collection" class="secondary">Explorar vozes e objetos</button>`);
          V.$$("[data-mission-view]").forEach((b) => b.onclick = () => L.showMission(b.dataset.missionView));
          V.$("#heritage-resident-collection").onclick = () => this.collection();
        });
      },
      workshop(id) {
        const groups = {
          "heritage-sounds": { reading: "heritage-book-instruments", questions: [["Qual ficha descreve fric\xE7\xE3o de uma haste interna?", ["Cu\xEDca", "Agog\xF4", "Berimbau"], 0, "A cu\xEDca tem haste por dentro, ligada \xE0 pele. A fric\xE7\xE3o \xE9 distinta de percutir metal."], ["Onde a vareta percorre sulcos?", ["Xequer\xEA", "Reco-reco", "Djembe"], 1, "No reco-reco, a vareta raspa os sulcos. No xequer\xEA, as contas encontram a caba\xE7a."], ["Qual instrumento tem corpo em c\xE1lice, na refer\xEAncia Mand\xE9?", ["Il\xFA", "Atabaque", "Djembe"], 2, "A ficha documenta o djembe nessa regi\xE3o. Isso n\xE3o atribui o instrumento a todas as sociedades africanas."]] },
          "heritage-voices": { reading: "heritage-book-carolina", questions: [["Qual legenda reconhece a cria\xE7\xE3o de Carolina?", ["S\xF3 escreveu uma obra e nunca fez m\xFAsica.", "Escreveu em v\xE1rios g\xEAneros e comp\xF4s m\xFAsicas.", "Foi apenas uma personagem de Machado."], 1, "O IMS re\xFAne manuscritos e composi\xE7\xF5es de Carolina. A autoria vai al\xE9m de seu livro mais conhecido."], ["Como a atividade diferencia autor e narrador?", ["S\xE3o sempre a mesma pessoa.", "Nenhum texto tem autoria.", "Autor cria a voz que conta o texto."], 2, "A voz narrativa \xE9 uma constru\xE7\xE3o liter\xE1ria. A pergunta da oficina n\xE3o \xE9 uma cita\xE7\xE3o de Machado."]] },
          "heritage-contexts": { reading: "heritage-book-textiles", questions: [["Qual descri\xE7\xE3o distingue os estudos de Kente e Ankara?", ["Tiras tecidas e algod\xE3o estampado, respectivamente.", "Duas palavras para qualquer m\xE1scara.", "Dois nomes para a mesma t\xE9cnica."], 0, "Observe as fichas: constru\xE7\xE3o em tiras e estampa s\xE3o processos diferentes."], ["Uma amarra\xE7\xE3o mostra sozinha a religi\xE3o de algu\xE9m?", ["Sim, sempre.", "N\xE3o; precisamos conhecer o contexto e respeitar escolhas.", "S\xF3 quando tem cor azul."], 1, "Oj\xE1 tem sentidos situados. N\xE3o deduzimos cren\xE7a nem significado universal pela apar\xEAncia."]] }
        };
        const group = groups[id], mission = missions.find((q) => q.id === id);
        if (!group || !mission) return;
        if (!L.missionUnlocked(mission)) {
          L.showMission(id);
          return;
        }
        if (!V.state.sideQuests[id]?.started) {
          V.state.sideQuests[id] = { started: true, step: 0, done: false, progress: [] };
          V.state.trackedQuest = id;
          L.reconcile(id);
          V.Save.save();
        }
        let index = 0;
        const show = () => {
          const [prompt, options, correct, explanation] = group.questions[index];
          V.UI.modal(mission.title, "COMPARE COM A LEITURA ANTES DE ESCOLHER", `<p>${index + 1} de ${group.questions.length}</p><strong>${esc(prompt)}</strong><div class="stack">${options.map((t, i) => `<button class="choice-button" data-heritage-answer="${i}">${esc(t)}</button>`).join("")}</div><div id="heritage-answer-feedback" aria-live="polite"></div>`, `<button id="heritage-answer-next" class="primary" disabled>${index === group.questions.length - 1 ? "Guardar compara\xE7\xE3o" : "Pr\xF3xima compara\xE7\xE3o"}</button><button id="heritage-answer-read" class="secondary">Rever leitura</button>`);
          V.$$("[data-heritage-answer]").forEach((b) => b.onclick = () => {
            const good = +b.dataset.heritageAnswer === correct;
            V.$("#heritage-answer-feedback").textContent = (good ? "Boa observa\xE7\xE3o. " : "Compare novamente. ") + explanation;
            V.$("#heritage-answer-next").disabled = !good;
          });
          V.$("#heritage-answer-read").onclick = () => L.read(group.reading, 0, () => show());
          V.$("#heritage-answer-next").onclick = () => {
            if (++index < group.questions.length) show();
            else {
              this.remember("compared", id);
              L.event("puzzle", id);
              V.UI.modal("Compara\xE7\xE3o registrada", "SEU TRABALHO FICA NO CADERNO", `<p>${esc(mission.reward)}.</p><p>As etapas de conversa e leitura continuam no quadro da miss\xE3o. Voc\xEA pode retom\xE1-las sem perder a compara\xE7\xE3o.</p>`, `<button id="heritage-workshop-done" class="primary">Voltar ao caderno</button>`);
              V.$("#heritage-workshop-done").onclick = () => this.journal();
            }
          };
        };
        show();
      },
      music() {
        V.UI.modal("Blues, rock e resposta musical", "EXERC\xCDCIO ORIGINAL DE VOICES", `<p>Compare uma frase e sua resposta. S\xE3o dois padr\xF5es sint\xE9ticos criados para o jogo, sem reproduzir can\xE7\xF5es de Nina Simone, Tim Maia ou Sister Rosetta Tharpe.</p><div class="cozy-sequence"><span>1<small>pergunta: d\xF3 \xB7 mi\u266D \xB7 sol</small></span><span>2<small>resposta: sol \xB7 mi\u266D \xB7 d\xF3</small></span></div><div id="heritage-music-feedback" aria-live="polite"></div>`, `<button id="heritage-music-play" class="primary">Ouvir pergunta e resposta</button><button id="heritage-music-read" class="secondary">Hist\xF3ria e refer\xEAncias</button><button id="heritage-music-save" class="secondary">Guardar exerc\xEDcio</button>`);
        V.$("#heritage-music-play").onclick = () => {
          V.Audio.unlock();
          [60, 63, 67, 67, 63, 60].forEach((n, i) => V.Audio.note(n, 0.22, "triangle", 0.14, "sfx", i * 0.3 + (i > 2 ? 0.3 : 0)));
          V.$("#heritage-music-feedback").textContent = "Pergunta: d\xF3 \u2192 mi\u266D \u2192 sol. Pausa. Resposta: sol \u2192 mi\u266D \u2192 d\xF3. Esta mesma sequ\xEAncia permanece dispon\xEDvel por escrito.";
        };
        V.$("#heritage-music-read").onclick = () => L.read("heritage-book-rock", 0, () => this.music());
        V.$("#heritage-music-save").onclick = () => {
          this.remember("compared", "original-call-response");
          V.UI.close();
          V.UI.toast("Exerc\xEDcio original guardado no caderno de vozes.");
        };
      }
    };
    const H = V.Heritage;
    const priorEvent = L.event.bind(L);
    L.event = function(kind, value, record) {
      priorEvent(kind, value, record);
      if (!V.state) return;
      for (const q of missions) {
        const progress = V.state.sideQuests[q.id];
        if (progress?.started && !progress.done && q.steps[progress.step]?.kind === "puzzle" && V.state.heritage?.compared.includes(q.id)) priorEvent("puzzle", q.id);
      }
    };
    C.ensure = function() {
      prior.ensure();
      H.ensure();
    };
    C.initContent = function() {
      prior.content();
      for (const f of data.figures) V.content.characters[f.character] = { name: "Ficha hist\xF3rica \xB7 " + f.name, role: "Representa\xE7\xE3o educativa original", quote: "", accent: "#d6ba82" };
    };
    C.prop = function(ctx, family, index, x, y, size = T) {
      if (family === "expanded") {
        const img = V.Assets.images["expanded-props"];
        if (V.Assets.ready(img)) ctx.drawImage(img, index % 8 * 32, Math.floor(index / 8) * 32, 32, 32, Math.round(x), Math.round(y), size, size);
        return;
      }
      if (family === "history") {
        const f = data.figures[index], img = f && V.Assets.images[f.character];
        if (V.Assets.ready(img)) ctx.drawImage(img, 0, 0, V.Assets.characterCell(f.character), V.Assets.characterCell(f.character), Math.round(x), Math.round(y), size, size);
        return;
      }
      return prior.prop(ctx, family, index, x, y, size);
    };
    const priorResidents = L.residents.bind(L);
    L.residents = function() {
      const all = V.learning.residents;
      V.learning.residents = all.filter((r) => !data.residents.some((n) => n.id === r.id));
      try {
        return priorResidents();
      } finally {
        V.learning.residents = all;
      }
    };
    C.compose = function(m) {
      prior.compose(m);
      for (const r of data.residents.filter((r2) => r2.map === m.id)) {
        const wanted = m.design.positions?.["resident-" + r.id] || [r.x, r.y], p = C.safe(m, ...wanted, m.objects.filter((o2) => C.person(o2))), o = { id: "resident-" + r.id, type: "resident", x: p.x * T + 24, y: p.y * T + 24, label: "Conversar com " + r.name, character: r.character, resident: r, homeMap: m.id, heritageResident: true };
        m.objects.push(o);
        C.preparePerson(m, o);
        o.tasks = r.tasks.filter((id) => m.anchors.has(id)).concat("home-" + o.id);
        o.waypoints = o.tasks.map((id) => m.anchors.get(id));
      }
      for (const f of data.figures.filter((f2) => f2.map === m.id)) {
        const point = m.design.positions?.["portrait-" + f.id] || [f.x, f.y];
        m.objects.push({ id: "portrait-" + f.id, type: "heritage", x: point[0] * T + 24, y: point[1] * T + 24, label: "Conhecer " + f.name, character: f.character, figure: f, interactionRange: 80 });
        const o = m.objects[m.objects.length - 1], box = { x: o.x - 30, y: o.y - 10, w: 60, h: 26, owner: o.id };
        m.solids.push(D.rotateBox(box, o.x, o.y, m.design.objectEdits?.[o.id]?.rotation || 0));
      }
      D.removeObjects(m);
    };
    V.Hooks.around(V.Cozy, "drawObject", "heritage-world:drawObject:1", () => function(ctx, o, cam, t) {
      if (o.type !== "heritage") {
        const result = prior.draw(ctx, o, cam, t), s = o.scene, entry = s?.heritageItem && data.entries.find((e) => e.id === s.heritageItem), mission = s?.heritageCollection ? "heritage-voices" : entry?.mechanism ? "heritage-sounds" : entry?.readingId.endsWith("textiles") ? "heritage-contexts" : null;
        if (mission && V.state?.sideQuests[mission]?.done) {
          const x2 = o.x - cam.x + 16, y2 = o.y - cam.y - 8;
          ctx.fillStyle = "#a7ce9c";
          ctx.fillRect(x2 - 2, y2 - 4, 15, 14);
          ctx.fillStyle = "#29493c";
          ctx.fillRect(x2, y2 + 1, 3, 3);
          ctx.fillRect(x2 + 3, y2 + 4, 3, 3);
          ctx.fillRect(x2 + 6, y2 + 1, 3, 3);
          ctx.fillRect(x2 + 9, y2 - 2, 3, 3);
        }
        return result;
      }
      const x = o.x - cam.x, y = o.y - cam.y;
      ctx.save();
      ctx.translate(x, y);
      if (o.visualRotation) ctx.rotate(o.visualRotation * Math.PI / 180);
      ctx.fillStyle = "#263e35";
      ctx.fillRect(-31, -63, 62, 74);
      ctx.strokeStyle = "#cdbd8c";
      ctx.lineWidth = 3;
      ctx.strokeRect(-31, -63, 62, 74);
      V.Assets.sprite(ctx, o.character, 0, -8, 0, 0, 50);
      ctx.fillStyle = "#d2bc8d";
      ctx.fillRect(-31, 12, 62, 6);
      V.Engine.text(ctx, "RETRATO", 0, 8, "#eee4c9", 8, "center");
      ctx.restore();
      if (W.nearest?.id === o.id) L.marker(ctx, x, y, "E", "#dcc58c");
    });
    C.interact = function(o) {
      if (o.scene?.family === "history" && data.figures[o.scene.prop]) {
        H.figure(data.figures[o.scene.prop].id);
        return true;
      }
      if (o.type === "heritage") {
        H.figure(o.figure.id);
        return true;
      }
      if (o.scene?.heritageCollection) {
        H.collection();
        return true;
      }
      if (o.scene?.heritageMusic) {
        H.music();
        return true;
      }
      if (o.scene?.heritageItem) {
        H.entry(o.scene.heritageItem);
        return true;
      }
      if (o.scene?.family === "expanded" && o.scene.prop >= 40 && o.scene.prop <= 47) {
        H.entry("heritage-item-" + o.scene.prop);
        return true;
      }
      return prior.interact(o);
    };
    C.resident = function(o) {
      if (o.heritageResident) {
        H.talk(o);
        return;
      }
      return prior.resident(o);
    };
    L.nav = function(tab) {
      return prior.nav(tab).replace("</nav>", `<button data-notebook-tab="heritage" aria-current="${tab === "heritage" ? "page" : "false"}" class="${tab === "heritage" ? "active" : ""}">${V.Interface.icon("book")}<span>Vozes e objetos</span></button></nav>`);
    };
    L.journal = function(tab = "quests") {
      if (tab === "heritage") H.journal();
      else prior.journal(tab);
    };
    L.workshop = function(id) {
      if (missions.some((q) => q.id === id)) H.workshop(id);
      else prior.workshop(id);
    };
    V.Interface.cover = function(r) {
      if (r.id?.startsWith("heritage-")) return /textiles/.test(r.id) ? "textiles" : /objects/.test(r.id) ? "beliefs" : /king/.test(r.id) ? "community" : /katherine/.test(r.id) ? "science" : /nina|tim|rock|instruments/.test(r.id) ? "music" : "literature";
      return prior.cover(r);
    };
    V.Hooks.around(V.Assets, "load", "heritage-world:load:1", () => async function() {
      const entries = [["expanded-props", "assets/tilesets/expanded-props.png"], ...data.figures.flatMap((f) => [[f.character, "assets/characters/" + f.character + ".png"], [f.character + "-portrait", "assets/characters/" + f.character + "-portrait.png"]]), ...data.residents.flatMap((r) => [[r.character, "assets/characters/" + r.character + ".png"], [r.character + "-portrait", "assets/characters/" + r.character + "-portrait.png"]])];
      await Promise.all([prior.assets(), this.loadEntries(entries)]);
      return this.errors;
    });
    V.Hooks.around(V.Atlas, "landmark", "heritage-world:landmark:1", (priorLandmark) => function(ctx, o, m) {
      if (o.type === "heritage") {
        C.drawObject(ctx, o, { x: 0, y: 0 }, { accent: "#d6ba82" });
        return;
      }
      return priorLandmark(ctx, o, m);
    });
  })();
});
