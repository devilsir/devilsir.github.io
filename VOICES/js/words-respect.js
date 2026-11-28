/* Registered module: words-respect */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("words-respect", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, D = V.WordsRespectData, W = V.World, C = V.Cozy, S = V.SceneDesign, A = V.Architecture, F = V.FastTravel, T = 48, esc = V.escape, copy = (x) => JSON.parse(JSON.stringify(x));
    const ID = "words-respect-courtyard", museum = "african-words";
    const layout = { name: "P\xE1tio das Palavras \xB7 respeito e escuta", width: 34, height: 30, spawn: [17, 27], floor: "stone", palette: ["#c5b796", "#557b57", "#e9d8b4"], purpose: "Um jardim de educa\xE7\xE3o antirracista com seis esta\xE7\xF5es, doze fichas contextualizadas, roda de conversa e mural. Hist\xF3ria, impacto e alternativas respeitosas, com refer\xEAncias.", paths: [], decor: [], scenes: [], positions: {}, routines: {}, anchors: [], zones: [], meeting: [17, 13], adventure: { version: 3, architecture: { walls: [{ id: "respect-north", a: [T, 3 * T], b: [33 * T, 3 * T], height: 132, thickness: 12, color: "#b4a17c" }, { id: "respect-west", a: [T, 3 * T], b: [T, 29 * T], height: 98, thickness: 12, color: "#a99472" }, { id: "respect-east", a: [33 * T, 3 * T], b: [33 * T, 29 * T], height: 98, thickness: 12, color: "#a99472" }, { id: "respect-south", a: [T, 29 * T], b: [33 * T, 29 * T], height: 80, thickness: 12, color: "#a99472", openings: [{ u: 0.5, width: 156 }] }], mounts: [], windows: [], signs: [] }, environment: { indoor: false, sky: "automatic", weather: true, ambient: "#e6d6ae", wind: 0.2, clouds: 0.2, snowAllowed: false }, lights: [], regions: [], encounters: [], triggers: [] } };
    C.layouts[ID] = copy(layout);
    S.defaults[ID] = copy(layout);
    S.raw[ID] = W.base(ID, "museum", 34, 30);
    S.objectRegistry[ID] = {};
    const R = V.WordsRespect = {
      id: ID,
      data: D,
      clock: 0,
      image: null,
      owner() {
        return V.PixWorldVocabulary?.owner?.() || 0;
      },
      ensure() {
        if (!V.state) return null;
        let s = V.state.wordsRespect;
        if (!s || typeof s !== "object" || Array.isArray(s)) s = V.state.wordsRespect = {};
        s.readers ||= {};
        const i = this.owner();
        let r = s.readers[i];
        if (!r || typeof r !== "object" || Array.isArray(r)) r = s.readers[i] = {};
        r.read = [...new Set((Array.isArray(r.read) ? r.read : []).filter((id) => D.entries.some((e) => e.id === id)))];
        r.answers = [...new Set((Array.isArray(r.answers) ? r.answers : []).filter((id) => D.scenarios.some((e) => e.id === id)))];
        r.poster = Number.isInteger(r.poster) && r.poster >= 0 && r.poster < D.posters.length ? r.poster : 0;
        return r;
      },
      load() {
        if (this.ready) return this.ready;
        this.ready = new Promise((resolve) => {
          this.image = V.Assets.image();
          this.image.onload = this.image.onerror = resolve;
          this.image.src = "assets/words-respect/courtyard.webp?v=20261102-respect1";
          V.AssetLoader.register(this.image, resolve);
        });
        return this.ready;
      },
      art(c, index, x, y, w, h) {
        const f = V.WordsRespectArt?.frames[index];
        if (!this.image?.naturalWidth || !f) return;
        const scale = Math.min(w / f.w, h / f.h, 1.4), dw = f.w * scale, dh = f.h * scale;
        c.save();
        c.imageSmoothingEnabled = false;
        c.drawImage(this.image, f.x, f.y, f.w, f.h, Math.round(x + (w - dw) / 2), Math.round(y + (h - dh) / 2), Math.round(dw), Math.round(dh));
        c.restore();
      },
      picture(index, label) {
        return `<canvas class="respect-picture" width="240" height="180" data-respect-art="${index}" role="img" aria-label="${esc(label)}"></canvas>`;
      },
      skin() {
        const root2 = V.$(".modal");
        root2?.classList.add("respect-modal");
        const paint = () => {
          if (root2?.isConnected) for (const el of root2.querySelectorAll("[data-respect-art]")) this.art(el.getContext("2d"), +el.dataset.respectArt, 0, 0, el.width, el.height);
        };
        if (this.image?.naturalWidth) paint();
        else V.MapAssets.ensure(["words-respect"], "Preparando os pain\xE9is do p\xE1tio", paint);
      },
      sources(keys) {
        return '<div class="respect-sources">' + D.sources.filter((s) => keys.includes(s.id)).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} \u2197</a>`).join("") + "</div>";
      },
      pix(word) {
        V.PixVocabulary?.collect(word, "P\xE1tio das Palavras \xB7 respeito");
      },
      navigation() {
        return '<button id="respect-directory" class="secondary">Percurso do p\xE1tio</button><button id="respect-close" class="primary">Continuar visita</button>';
      },
      bindNavigation() {
        if (V.$("#respect-directory")) V.$("#respect-directory").onclick = () => this.directory();
        if (V.$("#respect-close")) V.$("#respect-close").onclick = () => V.UI.close();
      },
      directory() {
        const r = this.ensure();
        V.UI.modal("Palavras, respeito e escolhas", "P\xC1TIO DO MUSEU DAS PALAVRAS \xB7 6\xBA AO 9\xBA ANO", `<div class="respect-welcome"><span class="respect-eyebrow">AS PALAVRAS T\xCAM HIST\xD3RIA</span><h3>Entender o impacto. Escolher com respeito.</h3><p>O racismo desvaloriza pessoas e produz desigualdades com base em classifica\xE7\xF5es raciais. Tamb\xE9m pode aparecer na linguagem. Explore os pain\xE9is para reconhecer estere\xF3tipos, conferir fontes e conhecer alternativas.</p><p class="respect-note">Os termos aparecem somente para estudo, acompanhados de explica\xE7\xF5es. N\xE3o \xE9 preciso repeti-los, encenar ofensas ou contar experi\xEAncias pessoais.</p></div><div class="respect-progress"><span>${r.read.length}/12 fichas exploradas</span><progress max="12" value="${r.read.length}" aria-label="Fichas lidas neste jogador"></progress><span>${r.answers.length}/4 situa\xE7\xF5es refletidas</span></div><div class="respect-stations">${D.groups.map((g, i) => `<button data-respect-group="${g.id}" style="--respect-color:${g.color}">${this.picture(g.art, g.name)}<small>ESTA\xC7\xC3O 0${i + 1}</small><strong>${esc(g.name)}</strong><span>${g.id === "care" ? "Roda de conversa e escolhas" : D.entries.filter((e) => e.group === g.id).length + " fichas com explica\xE7\xE3o e alternativas"}</span></button>`).join("")}</div>`, `${W.current?.id === museum ? '<button id="respect-enter" class="primary">Entrar no p\xE1tio</button>' : ""}<button id="respect-mural" class="primary">Criar cartaz</button><button id="respect-teacher" class="secondary">Proposta para a turma</button><button id="respect-close" class="secondary">Explorar o jardim</button>`, true);
        this.skin();
        this.bindNavigation();
        V.$$("[data-respect-group]").forEach((b) => b.onclick = () => this.group(b.dataset.respectGroup));
        if (V.$("#respect-enter")) V.$("#respect-enter").onclick = () => {
          const door = W.current.objects.find((o) => o.to === ID);
          V.UI.close();
          V.Game.interact(door);
        };
        V.$("#respect-mural").onclick = () => this.mural();
        V.$("#respect-teacher").onclick = () => this.teacher();
      },
      group(id) {
        const g = D.groups.find((g2) => g2.id === id);
        if (!g) return;
        if (id === "care") return this.circle();
        this.pix(g.en);
        const r = this.ensure();
        V.UI.modal(g.name, "ESTA\xC7\xC3O DO P\xC1TIO \xB7 CONTEXTO, IMPACTO E ALTERNATIVAS", `<div class="respect-group-intro">${this.picture(g.art, g.name)}<div><p>${esc(g.intro)}</p><div class="respect-english">PIX \xB7 <strong lang="en">${esc(g.en)}</strong> \xB7 ${esc(V.PixVocabulary.entry(g.en)?.pt || "")}</div></div></div>${V.MuseumStudies.section("respect", id)}<div class="respect-entry-list">${D.entries.filter((e) => e.group === id).map((e) => `<button data-respect-entry="${e.id}"><small>${r.read.includes(e.id) ? "\u2713 FICHA EXPLORADA" : "EXPRESS\xC3O EM AN\xC1LISE"}</small><strong>${esc(e.term)}</strong><span>${esc(e.status)}</span><em>Entender e conhecer alternativas \u2192</em></button>`).join("")}</div>`, this.navigation(), true);
        this.skin();
        this.bindNavigation();
        V.$$("[data-respect-entry]").forEach((b) => b.onclick = () => this.entry(b.dataset.respectEntry));
      },
      entry(id) {
        const e = D.entries.find((e2) => e2.id === id);
        if (!e) return;
        const g = D.groups.find((g2) => g2.id === e.group), r = this.ensure();
        if (!r.read.includes(id)) {
          r.read.push(id);
          V.Save.save();
        }
        this.pix(g.en);
        const index = D.entries.indexOf(e);
        V.UI.modal(e.term, "USO EM AN\xC1LISE \xB7 " + e.status.toUpperCase(), `<article class="respect-reading"><aside>${this.picture(g.art, g.name)}<span class="respect-eyebrow">${esc(g.name)}</span><p class="respect-note">Exemplo apresentado em contexto educativo. Leia para compreender o impacto; n\xE3o use como apelido ou ofensa.</p></aside><div class="respect-reading-text"><section><h3>Por que evitar esse uso?</h3><p>${esc(e.impact)}</p></section><section><h3>Hist\xF3ria e contexto</h3><p>${esc(e.context)}</p></section><section class="respect-alternative"><small>UMA ESCOLHA RESPEITOSA</small><p>${esc(e.alternative)}</p><blockquote>${esc(e.example)}</blockquote></section><section class="respect-reflection"><h3>Para conversar</h3><p>${esc(e.question)}</p></section><details><summary>Fontes e pesquisa</summary>${this.sources(e.sources)}<p>O impacto de uma fala e a origem de uma palavra s\xE3o perguntas diferentes. Nem toda hist\xF3ria de origem est\xE1 comprovada.</p></details></div></article>`, `<button id="respect-prev" class="secondary">\u2190 Anterior</button><button id="respect-back" class="primary">Voltar \xE0 esta\xE7\xE3o</button><button id="respect-next" class="secondary">Pr\xF3xima \u2192</button>`, true);
        this.skin();
        V.$("#respect-back").onclick = () => this.group(e.group);
        V.$("#respect-prev").onclick = () => this.entry(D.entries[(index + D.entries.length - 1) % D.entries.length].id);
        V.$("#respect-next").onclick = () => this.entry(D.entries[(index + 1) % D.entries.length].id);
      },
      circle() {
        this.pix("help");
        V.UI.modal("Roda de escuta", "ACOLHER \xB7 REFLETIR \xB7 AGIR", `<div class="respect-group-intro">${this.picture(5, "Pessoas escutando e acolhendo")}<div><h3>Voc\xEA pode participar sem se expor.</h3><p>${esc(D.groups.find((g) => g.id === "care").intro)}</p><p>Ningu\xE9m precisa repetir uma ofensa ou relatar algo que viveu. A pessoa atingida pode escolher n\xE3o conversar naquele momento.</p><div class="respect-english">PIX \xB7 <strong lang="en">help</strong> \xB7 ajudar</div></div></div>${V.MuseumStudies.section("respect", "care")}<div class="respect-questions">${D.questions.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>`, `<button id="respect-practice" class="primary">Praticar escolhas de cuidado</button><button id="respect-teacher" class="secondary">Proposta para a turma</button>` + this.navigation(), true);
        this.skin();
        this.bindNavigation();
        V.$("#respect-practice").onclick = () => this.scenario(0);
        V.$("#respect-teacher").onclick = () => this.teacher();
      },
      scenario(index) {
        const s = D.scenarios[index];
        if (!s) return this.circle();
        const r = this.ensure();
        V.UI.modal("Escolhas que acolhem", "SITUA\xC7\xC3O " + (index + 1) + " DE " + D.scenarios.length + " \xB7 SEM TEMPO OU PONTUA\xC7\xC3O", `<article class="respect-scenario">${this.picture(5, "Uma roda de apoio")}<h3>${esc(s.title)}</h3><p>${esc(s.prompt)}</p><div class="respect-options">${s.options.map((text, i) => `<button data-respect-choice="${i}">${esc(text)}</button>`).join("")}</div><p id="respect-answer" class="respect-answer" role="status" aria-live="polite">${r.answers.includes(s.id) ? "\u2713 Voc\xEA j\xE1 refletiu sobre esta situa\xE7\xE3o. Pode tentar novamente." : "Escolha uma atitude e leia a explica\xE7\xE3o."}</p></article>`, `<button id="respect-scenario-back" class="secondary">Roda de conversa</button><button id="respect-scenario-next" class="primary" ${r.answers.includes(s.id) ? "" : "hidden"}>${index === D.scenarios.length - 1 ? "Concluir reflex\xE3o" : "Pr\xF3xima situa\xE7\xE3o \u2192"}</button>`, true);
        this.skin();
        V.$$("[data-respect-choice]").forEach((b) => b.onclick = () => {
          const right = +b.dataset.respectChoice === s.correct;
          V.$("#respect-answer").textContent = right ? "\u2713 " + s.feedback : "Vamos repensar. Essa atitude pode deixar a pessoa sem apoio ou espalhar uma informa\xE7\xE3o sem verifica\xE7\xE3o. Tente uma a\xE7\xE3o de escuta, respeito e cuidado.";
          b.dataset.result = right ? "right" : "retry";
          if (right) {
            if (!r.answers.includes(s.id)) r.answers.push(s.id);
            V.Save.save();
            V.$("#respect-scenario-next").hidden = false;
          }
        });
        V.$("#respect-scenario-next").onclick = () => index === D.scenarios.length - 1 ? this.circle() : this.scenario(index + 1);
        V.$("#respect-scenario-back").onclick = () => this.circle();
      },
      mural() {
        const r = this.ensure();
        V.UI.modal("Mural de palavras que acolhem", "SEU CARTAZ \xB7 UMA MENSAGEM DE VALORIZA\xC7\xC3O", `<p>Escolha uma mensagem para o mural deste jogador. Na turma, crie um cartaz com suas pr\xF3prias ideias e imagens de valoriza\xE7\xE3o da popula\xE7\xE3o negra, sem reproduzir ofensas.</p><div class="respect-poster" id="respect-poster"><small>PALAVRAS QUE ACOLHEM</small><strong>${esc(D.posters[r.poster])}</strong><span>Museu das Palavras \xB7 respeito, hist\xF3ria e igualdade</span></div><div class="respect-poster-options">${D.posters.map((p, i) => `<button data-respect-poster="${i}" aria-pressed="${r.poster === i}">${esc(p)}</button>`).join("")}</div><p class="respect-note" id="respect-poster-status" role="status">O cartaz fica salvo no seu caderno e aparece no mural do p\xE1tio.</p>`, this.navigation(), true);
        this.skin();
        this.bindNavigation();
        V.$$("[data-respect-poster]").forEach((b) => b.onclick = () => {
          r.poster = +b.dataset.respectPoster;
          V.Save.save();
          V.$("#respect-poster strong").textContent = D.posters[r.poster];
          V.$$("[data-respect-poster]").forEach((el) => el.setAttribute("aria-pressed", String(el === b)));
          V.$("#respect-poster-status").textContent = "\u2713 Cartaz salvo para este jogador.";
        });
      },
      teacher() {
        V.UI.modal("As palavras t\xEAm hist\xF3ria", "PROPOSTA PEDAG\xD3GICA \xB7 HIST\xD3RIA \xB7 ENSINO FUNDAMENTAL II", `<article class="respect-lesson"><h3>Objetivo</h3><p>Identificar usos discriminat\xF3rios, compreender contextos hist\xF3ricos, pesquisar fontes e desenvolver atitudes de respeito \xE0 diversidade racial e cultural.</p><p class="respect-note"><strong>Media\xE7\xE3o cuidadosa:</strong> n\xE3o pe\xE7a que estudantes repitam insultos, imitem agress\xF5es ou representem pessoas escravizadas. A inten\xE7\xE3o de brincar n\xE3o elimina o efeito de uma fala. N\xE3o exija relatos pessoais nem atribua a estudantes negros o dever de explicar o racismo.</p><ol>${D.lesson.map(([title, text]) => `<li><h3>${esc(title)}</h3><p>${esc(text)}</p></li>`).join("")}</ol><h3>Um percurso cont\xEDnuo</h3><p>A linguagem \xE9 uma parte do enfrentamento do racismo. Reveja tamb\xE9m livros, imagens, oportunidades e respostas da escola \xE0s situa\xE7\xF5es de discrimina\xE7\xE3o. Pessoas negras devem aparecer com hist\xF3rias, conhecimentos e realiza\xE7\xF5es, al\xE9m das experi\xEAncias de viol\xEAncia.</p>${this.sources(["unicef", "research", "lupa"])}</article>`, this.navigation(), true);
        this.skin();
        this.bindNavigation();
      },
      person(role) {
        const teacher = role === "mediator";
        V.UI.modal(teacher ? "Professora Amara \xB7 educadora do p\xE1tio" : "Dara \xB7 visitante pesquisadora", teacher ? "ESCUTA E EDUCA\xC7\xC3O ANTIRRACISTA" : "UMA PERGUNTA ABRE UMA PESQUISA", `<div class="respect-person">${V.UI.portrait(teacher ? "teacher" : "taina", 0, 88)}<div><h3>${teacher ? "O respeito tamb\xE9m se aprende nas escolhas de cada dia." : "Uma explica\xE7\xE3o conhecida tamb\xE9m precisa de fonte."}</h3><p>${teacher ? "Este jardim foi criado para conversar sobre linguagem sem reproduzir humilha\xE7\xF5es. Podemos investigar express\xF5es, valorizar identidades e pensar em como apoiar quem sofre racismo." : "Eu estava preparando um cartaz e encontrei vers\xF5es diferentes para uma hist\xF3ria de origem. Agora comparo registros e marco o que ainda \xE9 d\xFAvida. Isso ajuda a construir uma educa\xE7\xE3o antirracista com responsabilidade."}</p><p lang="en">${teacher ? "Respect every person. We can listen and help." : "We check sources and learn together."}</p><small>${teacher ? "Respeite cada pessoa. Podemos escutar e ajudar." : "Conferimos fontes e aprendemos juntos."}</small></div></div>`, `<button id="respect-person-go" class="primary">${teacher ? "Conhecer o percurso" : "Investigar hist\xF3ria e fontes"}</button><button id="respect-close" class="secondary">Continuar visita</button>`, true);
        this.skin();
        V.UI.paintPortraits();
        this.bindNavigation();
        V.$("#respect-person-go").onclick = () => teacher ? this.directory() : this.group("evidence");
      },
      build(design = C.layouts[ID]) {
        const m = W.base(ID, "museum", design.width, design.height);
        Object.assign(m, { name: design.name, wordsRespect: true, design, ambientTime: 0, zones: [], chats: [], anchors: new Map(), reservations: new Map(), bubbleBudget: 0, archWalls: [], archSolids: [], mounts: [], lifeAnimals: [], geometryRevision: 1 });
        const add = (role, id, x, y, label, extra = {}) => {
          const o = { type: "respect-" + role, wordsRespectRole: role, id, x: x * T, y: y * T, label, interactionRange: 110, ...extra };
          m.objects.push(o);
          return o;
        };
        for (const g of D.groups) {
          add("panel", "respect-panel-" + g.id, ...g.at, "Ler: " + g.name, { respectGroup: g.id });
          m.solids.push({ x: g.at[0] * T - 77, y: g.at[1] * T - 56, w: 154, h: 45, owner: "respect-panel-" + g.id });
        }
        add("directory", "respect-welcome", 7, 25, "Conhecer o percurso educativo");
        add("mural", "respect-mural", 27, 25, "Escolher uma mensagem para o mural");
        add("mediator", "respect-amara", 12.5, 22.3, "Conversar com Amara \xB7 educadora", { character: "teacher" });
        add("researcher", "respect-dara", 23.3, 13, "Conversar com Dara \xB7 pesquisa e respeito", { character: "taina" });
        add("door", "respect-exit", 17, 27.7, "Voltar \xE0s galerias do Museu das Palavras", { type: "travel", to: museum });
        for (const [x, y] of [[10.6, 13], [20.8, 15.1], [11.4, 23.6]]) {
          const id = "respect-seat-" + x, o = add("seat", id, x, y, "Sentar e refletir", { scene: { id, kind: "seat", dir: 0, text: "Um lugar para escutar e pensar nas palavras." } });
          m.anchors.set(id, { id, x: o.x, y: o.y, dir: 0, state: "sitting" });
          m.solids.push({ x: o.x - 44, y: o.y - 23, w: 88, h: 22, owner: id });
        }
        for (const x of [2.8, 31.2]) for (const y of [6, 12, 18, 24]) {
          add("plant", "respect-plant-" + x + "-" + y, x, y, "Jardim do p\xE1tio", { respectDecor: true });
          m.solids.push({ x: x * T - 31, y: y * T - 19, w: 62, h: 35 });
        }
        for (const o of m.objects) {
          const p = design.positions?.[o.id];
          if (p) {
            const dx = p[0] * T - o.x, dy = p[1] * T - o.y;
            o.x += dx;
            o.y += dy;
            for (const s of m.solids.filter((s2) => s2.owner === o.id)) {
              s.x += dx;
              s.y += dy;
            }
          }
          S.objectRegistry[ID][o.id] = { ...o };
        }
        A.hydrate(m);
        return m;
      },
      seed() {
        W.maps[ID] = this.build();
        F.point(ID);
        this.link();
        V.Atlas.cache.clear();
        V.ObjectiveGuide.invalidate();
      },
      link() {
        const m = W.maps[museum];
        if (!m || m.objects.some((o) => o.id === "respect-museum-door")) return;
        m.objects.push({ type: "travel", wordsRespectRole: "door", id: "respect-museum-door", x: 25 * T, y: 33.2 * T, to: ID, label: "Visitar o P\xE1tio das Palavras \xB7 respeito e escuta", interactionRange: 110 });
      },
      floor(m) {
        const canvas = document.createElement("canvas");
        canvas.width = m.width * T;
        canvas.height = m.height * T;
        const c = canvas.getContext("2d");
        c.fillStyle = "#40583f";
        c.fillRect(0, 0, canvas.width, canvas.height);
        V.CapeVisuals.fill(c, "stone", T, 3 * T, 32 * T, 26 * T);
        c.fillStyle = "#bcac8855";
        c.fillRect(4.3 * T, 4 * T, 25.4 * T, 24 * T);
        for (const x of [1.4, 29.4]) {
          c.fillStyle = "#5c7951";
          c.fillRect(x * T, 4 * T, 3.2 * T, 24 * T);
          c.strokeStyle = "#b2a174";
          c.lineWidth = 5;
          c.strokeRect(x * T, 4 * T, 3.2 * T, 24 * T);
        }
        c.strokeStyle = "#be9b65";
        c.lineWidth = 5;
        c.strokeRect(5 * T, 5 * T, 24 * T, 22 * T);
        c.strokeStyle = "#e6d7b3";
        c.lineWidth = 2;
        c.strokeRect(5 * T + 9, 5 * T + 9, 24 * T - 18, 22 * T - 18);
        c.fillStyle = "#a78565";
        c.beginPath();
        c.ellipse(17 * T, 13.8 * T, 4.5 * T, 3.1 * T, 0, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "#e2cc9d";
        c.lineWidth = 9;
        c.stroke();
        c.strokeStyle = "#6d8268";
        c.lineWidth = 3;
        c.beginPath();
        c.ellipse(17 * T, 13.8 * T, 3.6 * T, 2.5 * T, 0, 0, Math.PI * 2);
        c.stroke();
        V.AfricanMuseum.text(c, "ESCUTAR \xB7 PENSAR \xB7 ACOLHER", 17 * T, 13.8 * T, 13, "#f3e4c0");
        c.fillStyle = "#375b4a";
        c.fillRect(11 * T, 3.4 * T, 12 * T, 43);
        V.AfricanMuseum.text(c, "P\xC1TIO DAS PALAVRAS", 17 * T, 3.4 * T + 16, 20, "#efd89e");
        V.AfricanMuseum.text(c, "RESPEITO E ESCUTA", 17 * T, 3.4 * T + 34, 11, "#d2dcc3");
        m.cache = canvas;
        return canvas;
      },
      draw(c, o, cam) {
        if (!o.wordsRespectRole) return false;
        const x = o.x - cam.x, y = o.y - cam.y, near = W.nearest?.id === o.id, role = o.wordsRespectRole;
        if (x < -250 || y < -220 || x > c.canvas.width + 250 || y > c.canvas.height + 220) return true;
        if (role === "panel") {
          const g = D.groups.find((g2) => g2.id === o.respectGroup);
          V.SceneShadows.contact(c, x, y - 5, 81, 12, 0.2);
          c.fillStyle = "#766749";
          c.fillRect(x - 62, y - 98, 11, 90);
          c.fillRect(x + 51, y - 98, 11, 90);
          c.fillStyle = "#315946";
          c.fillRect(x - 87, y - 176, 174, 136);
          c.strokeStyle = "#c5aa67";
          c.lineWidth = 4;
          c.strokeRect(x - 85, y - 174, 170, 132);
          this.art(c, g.art, x - 77, y - 170, 154, 111);
          c.fillStyle = "#eee0bc";
          c.fillRect(x - 82, y - 54, 164, 29);
          V.AfricanMuseum.text(c, g.short, x, y - 40, 11, "#36513f");
          if (this.ensure()?.read.filter((id) => D.entries.find((e) => e.id === id)?.group === g.id).length) {
            c.fillStyle = "#aacb9d";
            c.fillRect(x + 68, y - 175, 18, 19);
            V.AfricanMuseum.text(c, "\u2713", x + 77, y - 165, 12, "#294f3d");
          }
        } else if (role === "door") {
          const inMuseum = W.current?.id === museum;
          if (!inMuseum) this.art(c, 6, x - 115, y - 174, 230, 190);
          if (!o.travelSign) {
            c.fillStyle = "#315746";
            c.fillRect(x - 90, y - 39, 180, 31);
            c.strokeStyle = "#d4b66f";
            c.lineWidth = 2;
            c.strokeRect(x - 90, y - 39, 180, 31);
            V.AfricanMuseum.text(c, inMuseum ? "P\xC1TIO \xB7 RESPEITO E ESCUTA" : "VOLTAR \xC0S GALERIAS", x, y - 23, 11, "#f0dfb4");
          }
        } else if (role === "directory" || role === "mural") {
          this.art(c, 7, x - 108, y - 171, 216, 185);
          c.fillStyle = "#eee0b8";
          c.fillRect(x - 68, y - 128, 136, 72);
          V.AfricanMuseum.text(c, role === "directory" ? "COMECE AQUI" : "PALAVRAS QUE ACOLHEM", x, y - 108, 11, "#325740");
          V.AfricanMuseum.text(c, role === "directory" ? "6 esta\xE7\xF5es \xB7 12 fichas" : "UM CARTAZ DE RESPEITO", x, y - 86, 10, "#6c795c");
          if (role === "mural") {
            const n = this.ensure()?.poster || 0, lines = [];
            let line = "";
            c.font = '600 9px "VOICES Sans",sans-serif';
            for (const word of D.posters[n].split(" ")) {
              const next = line ? line + " " + word : word;
              if (c.measureText(next).width > 122 && line) {
                lines.push(line);
                line = word;
              } else line = next;
            }
            if (line) lines.push(line);
            c.fillStyle = "#eee0b8";
            c.fillRect(x - 68, y - 100, 136, 71);
            for (let i = 0; i < Math.min(5, lines.length); i++) V.AfricanMuseum.text(c, lines[i], x, y - 92 + i * 11, 9, "#77543a");
            V.AfricanMuseum.text(c, "CARTAZ 0" + (n + 1) + " \xB7 LER E ESCOLHER", x, y - 21, 9, "#f0e3be");
          }
        } else if (role === "mediator" || role === "researcher") {
          const phase = V.settings.reducedMotion ? 0 : Math.floor(this.clock * 0.9) % 4, row = role === "mediator" && !near ? 4 : 0;
          V.SceneShadows.character(c, o.character, x, y, 62, row, phase, true);
          V.Assets.sprite(c, o.character, x, y, row, phase, 62);
          if (near) {
            c.fillStyle = "#254d3f";
            c.fillRect(x - 75, y - 100, 150, 24);
            V.AfricanMuseum.text(c, role === "mediator" ? "Amara \xB7 educadora" : "Dara \xB7 pesquisadora", x, y - 88, 11, "#efdcb5");
          }
        } else if (role === "seat") C.bench(c, x, y - 15, 0);
        else if (role === "plant") {
          c.fillStyle = "#826548";
          c.fillRect(x - 25, y - 24, 50, 27);
          c.fillStyle = "#bd9360";
          c.fillRect(x - 29, y - 28, 58, 9);
          for (let i = 0; i < 7; i++) {
            c.fillStyle = i % 2 ? "#7d9c60" : "#4c7950";
            c.beginPath();
            c.ellipse(x + Math.cos(i * 2.4) * 22, y - 40 + Math.sin(i * 2.4) * 16, 13, 8, i * 0.5, 0, Math.PI * 2);
            c.fill();
          }
          c.fillStyle = "#d7ad70";
          c.fillRect(x - 2, y - 47, 5, 4);
        }
        if (near) {
          c.strokeStyle = "#ecc978";
          c.lineWidth = 2;
          c.beginPath();
          c.ellipse(x, y + 6, 37, 10, 0, 0, Math.PI * 2);
          c.stroke();
        }
        return true;
      },
      render(c) {
        const m = W.current, cam = W.camera;
        if (!m.cache) this.floor(m);
        c.save();
        c.imageSmoothingEnabled = false;
        c.fillStyle = "#34503e";
        c.fillRect(0, 0, c.canvas.width, c.canvas.height);
        V.GroundCache.draw(c, m.cache, Math.round(-cam.x), Math.round(-cam.y));
        const rows = V.RenderView.objects(c, m, cam, true).map((o) => ({ kind: "object", y: V.RenderView.depth(o), o })).concat(A.geometry(m.design).walls.map((o) => ({ kind: "wall", y: Math.max(o.a[1], o.b[1]), o })), [{ kind: "player", y: V.Player.data.y }]).sort((a, b) => a.y - b.y);
        for (const row of rows) {
          if (row.kind === "wall") A.drawWall(c, m, row.o, cam);
          else if (row.kind === "player") V.Player.render(c);
          else if (!this.draw(c, row.o, cam)) C.drawObject(c, row.o, cam);
        }
        if (V.PixPresence?.following()) V.PixPresence.draw(c, V.Player.data, cam);
        if (W.transition > 0) {
          c.globalAlpha = W.transition;
          c.fillStyle = "#254c3b";
          c.fillRect(0, 0, c.canvas.width, c.canvas.height);
        }
        c.restore();
        W.drawMiniMap();
      }
    };
    V.Assets.addLoader("words-respect:load:1", function() {
      return R.load();
    });
    V.AssetLoader.addGroupRule("words-respect:group:1", (key) => key.startsWith("assets/words-respect/") ? "words-respect" : void 0);
    V.Hooks.around(V.MapAssets, "groups", "words-respect:groups:1", (groups) => (m) => [...new Set([...groups(m), ...m?.wordsRespect ? ["words-respect"] : []])]);
    V.Hooks.around(V.World, "init", "words-respect:init:1", (init) => function(...args) {
      const r = init(...args);
      R.seed();
      return r;
    });
    const build = V.AfricanMuseum.build.bind(V.AfricanMuseum);
    V.AfricanMuseum.build = function(id, ...args) {
      const m = build(id, ...args);
      if (id === museum && !m.objects.some((o) => o.id === "respect-museum-door")) m.objects.push({ type: "travel", wordsRespectRole: "door", id: "respect-museum-door", x: 25 * T, y: 33.2 * T, to: ID, label: "Visitar o P\xE1tio das Palavras \xB7 respeito e escuta", interactionRange: 110 });
      return m;
    };
    const preview = S.preview.bind(S);
    S.preview = (id, design) => id === ID ? R.build(design) : preview(id, design);
    const normalise = S.normalise.bind(S);
    S.normalise = function(doc) {
      if (doc?.maps) {
        doc = copy(doc);
        doc.maps[ID] ||= copy(layout);
      }
      return normalise(doc);
    };
    const ground = C.ground.bind(C);
    C.ground = (m) => m.wordsRespect ? R.floor(m) : ground(m);
    const render = C.render.bind(C);
    C.render = (c) => W.current?.wordsRespect ? R.render(c) : render(c);
    V.Hooks.around(V.Cozy, "drawObject", "words-respect:drawObject:1", (draw) => (c, o, cam, ...args) => R.draw(c, o, cam) || draw(c, o, cam, ...args));
    V.Hooks.around(V.Atlas, "paint", "words-respect:paint:1", (atlas) => function(canvas, m, options) {
      const result = atlas(canvas, m, options);
      if (!canvas || !m?.wordsRespect) return result;
      const c = canvas.getContext("2d"), p = this.projection(canvas, m);
      c.save();
      for (const o of m.objects) {
        const x = p.x + o.x * p.scale, y = p.y + o.y * p.scale;
        if (o.respectGroup) {
          c.fillStyle = D.groups.find((g) => g.id === o.respectGroup).color;
          c.fillRect(x - 77 * p.scale, y - 160 * p.scale, 154 * p.scale, 125 * p.scale);
          c.strokeStyle = "#e5cd92";
          c.lineWidth = 1;
          c.strokeRect(x - 77 * p.scale, y - 160 * p.scale, 154 * p.scale, 125 * p.scale);
        } else if (o.wordsRespectRole === "directory" || o.wordsRespectRole === "mural") {
          c.fillStyle = "#b28754";
          c.fillRect(x - 70 * p.scale, y - 130 * p.scale, 140 * p.scale, 120 * p.scale);
        } else if (o.character) {
          c.fillStyle = "#dce5ae";
          c.beginPath();
          c.arc(x, y, options?.details ? 3 : 1.8, 0, Math.PI * 2);
          c.fill();
        }
      }
      c.restore();
      return result;
    });
    const museumDraw = V.AfricanMuseum.drawObject.bind(V.AfricanMuseum);
    V.AfricanMuseum.drawObject = (c, o, cam) => R.draw(c, o, cam) || museumDraw(c, o, cam);
    const toolbar = V.AfricanMuseum.toolbar.bind(V.AfricanMuseum);
    V.AfricanMuseum.toolbar = function() {
      toolbar();
      const parent = V.$("#af-museum-toolbar");
      if (parent && !parent.querySelector("#af-toolbar-respect")) {
        const button2 = document.createElement("button");
        button2.id = "af-toolbar-respect";
        button2.className = "secondary";
        button2.textContent = "P\xE1tio \xB7 respeito";
        button2.onclick = () => R.directory();
        parent.append(button2);
      }
      const button = parent?.querySelector("#af-toolbar-respect");
      if (button) button.hidden = W.current?.id !== museum;
    };
    const root = F.root.bind(F);
    F.root = (id) => id === ID ? museum : root(id);
    F.names[ID] = "P\xE1tio das Palavras \xB7 respeito e escuta";
    const interactables = W.interactables.bind(W);
    W.interactables = (...args) => interactables(...args).filter((o) => !o.respectDecor);
    V.Hooks.around(V.Game, "interact", "words-respect:interact:1", (nextHook) => function(o) {
      if (o?.wordsRespectRole && !V.modal && !V.Dialogue.active && this.mode === "explore") {
        switch (o.wordsRespectRole) {
          case "door":
            V.UI.close();
            return W.load(o.to, o.to === museum ? { x: 25 * T, y: 34.5 * T } : void 0);
          case "panel":
            return R.group(o.respectGroup);
          case "directory":
            return R.directory();
          case "mural":
            return R.mural();
          case "mediator":
            return R.person("mediator");
          case "researcher":
            return R.person("researcher");
          case "seat":
            return C.playerSit(o);
        }
      }
      return nextHook(o);
    });
    const load = W.load.bind(W);
    W.load = function(id, pos) {
      if (id === ID && !pos) pos = { x: 17 * T, y: 27 * T };
      const r = load(id, pos);
      if (id === ID) R.ensure();
      return r;
    };
    V.Hooks.around(V.Game, "update", "words-respect:update:1", (nextHook) => function(dt) {
      const r = nextHook(dt);
      if (this.screen === "game" && this.mode === "explore") R.clock += Math.min(dt, 0.08);
      return r;
    });
    // The courtyard is a room of the existing museum, with no new exterior entrance.
    for (const source of D.sources) if (!V.content.sources.some((s) => s.id === "respect-" + source.id)) V.content.sources.push({ ...source, id: "respect-" + source.id });
  })();
});
