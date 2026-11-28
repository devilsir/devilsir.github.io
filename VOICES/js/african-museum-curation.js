/* Registered module: african-museum-curation */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("african-museum-curation", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, D = V.AfricanMuseumData, M = V.AfricanMuseum, A = V.CapoeiraArt, Arch = V.Architecture, W = V.World, C = V.Cozy, T = 48, esc = V.escape, copy = (x) => JSON.parse(JSON.stringify(x));
    const museum = "african-words", norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\[\]’']/g, "").toLowerCase();
    const rooms = D.galleries.map((g, i) => ({ ...g, index: i, x: 1.5 + i % 3 * 15.5, y: 6.5 + Math.floor(i / 3) * 15, w: 14, h: 10.3, location: (i < 3 ? "Ala do fundo" : "Ala de entrada") + " \xB7 " + ["esquerda", "centro", "direita"][i % 3] }));
    const panels = [
      { id: "people", title: "Palavras viajam com pessoas", en: "Words travel with people", at: [5, 34.1], paragraphs: ["Entre os s\xE9culos XVI e XIX, o tr\xE1fico atl\xE2ntico trouxe \xE0 for\xE7a para o Brasil pessoas que falavam muitas l\xEDnguas africanas. Apesar da escraviza\xE7\xE3o, elas preservaram e recriaram formas de falar, viver e transmitir saberes.", "Na conviv\xEAncia, nomes de alimentos, gestos, ferramentas e pr\xE1ticas passaram a integrar o portugu\xEAs. A l\xEDngua foi transformada por pessoas e comunidades; n\xE3o foi uma lista de palavras que atravessou o oceano sozinha."], sources: ["mlp-bantu"] },
      { id: "languages", title: "\xC1frica: muitas l\xEDnguas", en: "Many languages, many voices", at: [10.8, 34.1], paragraphs: ["Quimbundo, quicongo e umbundo s\xE3o l\xEDnguas diferentes do grupo banto. Banto n\xE3o \xE9 uma l\xEDngua \xFAnica. Suas hist\xF3rias atravessam regi\xF5es que hoje pertencem a pa\xEDses como Angola e os Congos.", "O iorub\xE1 tem outra trajet\xF3ria, ligada \xE0 \xC1frica Ocidental e a comunidades de regi\xF5es como Nig\xE9ria e Benim. Essas l\xEDnguas continuam vivas. As grafias e os pa\xEDses de hoje ajudam a localizar refer\xEAncias, mas n\xE3o desenham fronteiras fixas para toda a hist\xF3ria."], sources: ["mlp-bantu", "mlp-ioruba"] },
      { id: "research", title: "Como se pesquisa uma origem?", en: "Follow the evidence", at: [38, 34.1], paragraphs: ["Etimologia investiga a hist\xF3ria de uma palavra: formas antigas, sentidos, registros e rela\xE7\xF5es entre l\xEDnguas. Parecer com outra palavra \xE9 uma pista; n\xE3o \xE9 uma conclus\xE3o.", "Compare as fichas de canjica, dengo e cu\xEDca. As fontes podem discordar ou tratar de sentidos diferentes. Por isso, cada verbete identifica a proposta, o grau de d\xFAvida e suas refer\xEAncias.", "A hist\xF3ria de uma receita ou de um instrumento n\xE3o precisa ser id\xEAntica \xE0 hist\xF3ria do nome usado hoje. Procure a fonte e confira de qual sentido ela est\xE1 falando."], sources: ["ufs-canjica", "lex-dengo", "lex-cuica"] },
      { id: "changes", title: "Uma l\xEDngua continua mudando", en: "A living language", at: [43, 34.1], paragraphs: ["Em xingar, uma base ligada ao quimbundo se combina com a termina\xE7\xE3o portuguesa -ar. Em ca\xE7ula, o nome do irm\xE3o mais novo tamb\xE9m passa a identificar o integrante mais novo de um grupo.", "Quitanda pode nomear um com\xE9rcio ou preparos caseiros. Senzala mostra como rela\xE7\xF5es de poder podem transformar o sentido de uma palavra. Observe os usos, compare os contextos e escute quem mant\xE9m essas hist\xF3rias vivas."], sources: ["lex-xingar", "lex-cacula", "lex-quitanda", "lex-senzala"] }
    ];
    const U = V.AfricanCuration = {
      rooms,
      panels,
      originFilter: "all",
      clock: 0,
      paper() {
        V.$(".modal")?.classList.add("af-curated");
      },
      status(w) {
        return `<span class="af-origin-status" data-status="${w.origin.status}">${esc(w.origin.statusLabel)}</span>`;
      },
      language(w) {
        return w.origin.group === "debate" ? "Em debate" : w.origin.group === "outras" ? "Outras conex\xF5es" : D.originGroups.find((g) => g.id === w.origin.group)?.name || w.origin.language;
      },
      serial(w) {
        return "PAL \xB7 " + String(D.words.indexOf(w) + 1).padStart(3, "0");
      },
      say(text, lang = "pt-BR") {
        if (!("speechSynthesis" in window)) {
          V.UI.toast("A leitura em voz n\xE3o est\xE1 dispon\xEDvel neste navegador.");
          return;
        }
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = 0.86;
        speechSynthesis.speak(u);
      },
      exhibit(id) {
        const w = D.words.find((w2) => w2.id === id);
        if (!w) return;
        M.discover(w);
        const g = D.galleries.find((g2) => g2.id === w.gallery), o = w.origin, index = D.words.indexOf(w);
        V.UI.modal(w.name, g.name.toUpperCase() + " \xB7 " + this.serial(w), `<article class="af-curated-entry"><aside class="af-entry-art"><div class="af-art-mat"><img src="${w.illustration}" alt="Ilustra\xE7\xE3o de ${esc(w.name)}"></div><small class="af-accession">${this.serial(w)} \xB7 ACERVO ILUSTRADO</small>${this.status(w)}<dl class="af-object-record"><div><dt>L\xEDngua ou proposta</dt><dd>${esc(o.language)}</dd></div><div><dt>Refer\xEAncia geogr\xE1fica</dt><dd>${esc(o.region)}</dd></div></dl><button id="af-word-say" class="secondary">Ouvir a ficha</button></aside><div class="af-entry-text"><section><small class="af-section-kicker">01 \xB7 A PALAVRA EM USO</small><p class="af-lead-definition">${esc(w.meaning)}</p><p class="af-use-example">${esc(w.example)}</p></section><section><small class="af-section-kicker">02 \xB7 DE ONDE VEM</small><div class="af-etymon"><span>Forma ou caminho registrado</span><strong>${esc(o.form)}</strong><p>${esc(o.originalMeaning)}</p></div><p>${esc(o.etymology)}</p></section><section><small class="af-section-kicker">03 \xB7 COMO ENTROU NO PORTUGU\xCAS</small><p>${esc(o.incorporation)}</p></section><section><small class="af-section-kicker">04 \xB7 SENTIDOS QUE SE TRANSFORMAM</small><p>${esc(o.change)}</p></section><section class="af-language-bridge"><div><small class="af-section-kicker">PONTE COM O INGL\xCAS</small><h3>${esc(w.en)}</h3><p lang="en">${esc(w.sentence)}</p><p class="af-translation">${esc(w.translation)}</p></div><button id="af-speak" class="secondary">Ouvir ingl\xEAs</button></section>${V.MuseumStudies.section("word", id)}<section class="af-entry-sources"><h3>Consulte as refer\xEAncias</h3>${M.sources(o.sourceIds)}<p class="af-small-print">Formas de origem seguem as grafias das refer\xEAncias. Os contextos de circula\xE7\xE3o n\xE3o indicam uma data exata de entrada para cada palavra.</p></section></div></article>`, `<div class="af-curated-nav"><button id="af-prev" class="secondary" aria-label="Palavra anterior">\u2190 Anterior</button><button id="af-exhibit-back" class="primary">Acervo</button><button id="af-next" class="secondary" aria-label="Pr\xF3xima palavra">Pr\xF3xima \u2192</button><span>${index + 1} / ${D.words.length}</span></div>`, true);
        this.paper();
        V.$("#af-prev").onclick = () => this.exhibit(D.words[(index + D.words.length - 1) % D.words.length].id);
        V.$("#af-next").onclick = () => this.exhibit(D.words[(index + 1) % D.words.length].id);
        V.$("#af-exhibit-back").onclick = () => M.catalog();
        V.$("#af-speak").onclick = () => this.say(w.sentence, "en-US");
        V.$("#af-word-say").onclick = () => this.say([w.name, w.meaning, "Origem.", o.etymology, "No portugu\xEAs.", o.incorporation, "Mudan\xE7as de sentido.", o.change].join(" "));
        V.UI.onClose = () => window.speechSynthesis?.cancel();
      },
      catalog(collection = "words") {
        if (collection !== "words") return this.originalCatalog(collection);
        M.collection = "words";
        const s = M.ensure();
        V.UI.modal("Museu das Palavras Africanas", "PALAVRAS EM TRAVESSIA \xB7 CAT\xC1LOGO DA EXPOSI\xC7\xC3O", `<div class="af-collection-intro"><div><small>EXPOSI\xC7\xC3O PERMANENTE</small><h3>O portugu\xEAs guarda muitas vozes.</h3><p>Explore ${D.words.length} palavras, suas origens, transforma\xE7\xF5es e caminhos de circula\xE7\xE3o. As fichas comparam fontes e identificam propostas em debate.</p></div><div class="af-collection-progress"><strong id="af-count"></strong><span>descobertas neste perfil</span><progress id="af-progress" max="37" value="${s.words.length}" aria-label="Palavras descobertas"></progress></div></div><nav class="af-tabs af-collection-nav" aria-label="Acervos do museu"><button id="af-tab-words" aria-pressed="true">Palavras</button><button id="af-tab-instruments">Instrumentos</button><button id="af-tab-roda">Roda de capoeira</button><button id="af-plan-open">Visita \xE0s galerias</button></nav><div class="af-catalog-tools"><label class="field">Buscar palavra, origem ou sentido<input type="search" id="af-search" placeholder="Ex.: quimbundo, carinho, xingar\u2026" value="${esc(M.query)}"></label><label class="field">Conex\xF5es lingu\xEDsticas<select id="af-origin-filter">${D.originGroups.map((g) => `<option value="${g.id}" ${this.originFilter === g.id ? "selected" : ""}>${g.name}</option>`).join("")}</select></label></div><div class="af-tabs af-gallery-filters" id="af-filters" aria-label="Filtrar galeria">${[{ id: "all", name: "Todas as galerias" }, ...D.galleries].map((g) => `<button data-af-filter="${g.id}" aria-pressed="${M.filter === g.id}">${esc(g.name)}</button>`).join("")}</div><p id="af-result-count" class="af-result-count" role="status"></p><div id="af-grid" class="af-word-grid af-curated-grid"></div>`, `<button id="af-catalog-visit" class="primary">${W.current?.id === museum ? "Voltar \xE0 visita" : "Visitar o museu"}</button><button id="af-catalog-sources" class="secondary">Sobre a exposi\xE7\xE3o</button>`, true);
        this.paper();
        V.$(".modal")?.classList.add("af-catalog");
        V.$("#af-search").oninput = (e) => {
          M.query = e.target.value;
          this.paintCatalog();
        };
        V.$("#af-origin-filter").onchange = (e) => {
          this.originFilter = e.target.value;
          this.paintCatalog();
        };
        V.$$("[data-af-filter]").forEach((b) => b.onclick = () => {
          M.filter = b.dataset.afFilter;
          V.$$("[data-af-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          this.paintCatalog();
        });
        V.$("#af-tab-words").onclick = () => {
          M.query = "";
          M.filter = "all";
          this.originFilter = "all";
          M.catalog();
        };
        V.$("#af-tab-instruments").onclick = () => M.catalog("instruments");
        V.$("#af-tab-roda").onclick = () => M.roda();
        V.$("#af-plan-open").onclick = () => this.plan();
        V.$("#af-catalog-visit").onclick = () => {
          V.UI.close();
          if (W.current?.id !== museum) V.FastTravel.travel(museum);
        };
        V.$("#af-catalog-sources").onclick = () => this.about();
        this.paintCatalog();
      },
      paintCatalog() {
        if (M.collection !== "words") return this.originalPaint();
        const s = M.ensure(), q = norm(M.query), filtered = D.words.filter((w) => (M.filter === "all" || w.gallery === M.filter) && (this.originFilter === "all" || w.origin.group === this.originFilter || this.originFilter === "debate" && ["debated", "uncertain"].includes(w.origin.status)) && norm([w.name, w.meaning, w.en, w.origin.language, w.origin.region, w.origin.form, w.origin.etymology, w.origin.incorporation, w.origin.change].join(" ")).includes(q));
        V.$("#af-count").textContent = s.words.length + " / " + D.words.length;
        V.$("#af-progress").value = s.words.length;
        V.$("#af-result-count").textContent = filtered.length + " " + (filtered.length === 1 ? "palavra encontrada" : "palavras encontradas");
        V.$("#af-grid").innerHTML = filtered.map((w) => `<button class="af-word-card" data-af-item="${w.id}" data-collected="${s.words.includes(w.id)}" style="--af-gallery-color:${D.galleries.find((g) => g.id === w.gallery).color}"><div class="af-card-picture"><img src="${w.illustration}" alt="Ilustra\xE7\xE3o de ${esc(w.name)}" loading="lazy"><span>${this.serial(w)}</span></div><div class="af-card-caption"><strong>${esc(w.name)}</strong><small>${esc(this.language(w))}</small><span class="af-card-discovery">${s.words.includes(w.id) ? "\u2713 Registrada" : "Explorar hist\xF3ria"}</span></div></button>`).join("") || '<p class="af-empty">Nenhuma palavra com estes filtros. Experimente outra origem ou outra galeria.</p>';
        V.$$("[data-af-item]").forEach((b) => b.onclick = () => M.exhibit(b.dataset.afItem));
      },
      panel(id) {
        const p = panels.find((p2) => p2.id === id);
        if (!p) return;
        const s = M.ensure();
        s.panels = Array.isArray(s.panels) ? s.panels : [];
        if (!s.panels.includes(id)) {
          s.panels.push(id);
          V.Save.save();
        }
        V.UI.modal(p.title, p.en, `<article class="af-panel-reading"><small class="af-section-kicker">PAINEL DA EXPOSI\xC7\xC3O</small>${p.paragraphs.map((t) => `<p>${esc(t)}</p>`).join("")}${M.sources(p.sources)}</article>`, `<button id="af-panel-catalog" class="primary">Explorar palavras</button><button id="af-panel-voice" class="secondary">Ouvir painel</button><button id="af-panel-back" class="secondary">Voltar \xE0 visita</button>`, true);
        this.paper();
        V.$("#af-panel-catalog").onclick = () => M.catalog();
        V.$("#af-panel-voice").onclick = () => this.say(p.title + ". " + p.paragraphs.join(" "));
        V.$("#af-panel-back").onclick = () => V.UI.close();
        V.UI.onClose = () => window.speechSynthesis?.cancel();
      },
      plan() {
        const s = M.ensure();
        V.UI.modal("Sua visita ao museu", "SEIS GALERIAS \xB7 ORIGENS, USOS E TRANSFORMA\xC7\xD5ES", `<div class="af-visit-intro"><h3>Palavras em travessia</h3><p>Entre pela recep\xE7\xE3o e escolha um percurso. Cada galeria tem duas paredes de exposi\xE7\xE3o. Os pain\xE9is do \xE1trio ajudam a comparar l\xEDnguas, formas e fontes.</p></div><div class="af-room-plan">${rooms.map((r) => {
          const words = D.words.filter((w) => w.gallery === r.id && !w.extra), found = words.filter((w) => s.words.includes(w.id)).length;
          return `<button data-af-room="${r.id}" style="--af-gallery-color:${r.color}"><span class="af-room-number">0${r.index + 1}</span><strong>${esc(r.name)}</strong><small>${esc(r.location)}</small><span>${found} / ${words.length} palavras</span><progress value="${found}" max="${words.length}" aria-label="Descobertas de ${esc(r.name)}"></progress></button>`;
        }).join("")}</div><p class="af-plan-extra">No \xE1trio: recep\xE7\xE3o, pain\xE9is de pesquisa e o verbete complementar <b>Eb\xF3</b>. O P\xE1tio da Ginga re\xFAne instrumentos e a roda de capoeira.</p>`, `<button id="af-plan-words" class="primary">Acervo completo</button><button id="af-plan-close" class="secondary">Continuar explorando</button>`, true);
        this.paper();
        V.$$("[data-af-room]").forEach((b) => b.onclick = () => {
          M.query = "";
          M.filter = b.dataset.afRoom;
          this.originFilter = "all";
          M.catalog();
        });
        V.$("#af-plan-words").onclick = () => {
          M.filter = "all";
          M.query = "";
          this.originFilter = "all";
          M.catalog();
        };
        V.$("#af-plan-close").onclick = () => V.UI.close();
      },
      about() {
        V.UI.modal("Sobre a exposi\xE7\xE3o", "AS PALAVRAS VIAJAM \xB7 AS FONTES TAMB\xC9M CONTAM HIST\xD3RIAS", `<article class="af-panel-reading"><h3>Um acervo para investigar</h3><p>A exposi\xE7\xE3o conserva as 36 palavras da lista do Brasil Escola e inclui eb\xF3, citado no texto do artigo. A sele\xE7\xE3o \xE9 um ponto de partida; a pesquisa de etimologia compara dicion\xE1rios e acervos especializados.</p><p><b>Origem registrada</b> identifica a atribui\xE7\xE3o de uma refer\xEAncia. <b>Proposta identificada</b> mostra uma explica\xE7\xE3o com ressalvas. <b>Etimologia em debate</b> indica diverg\xEAncias; <b>origem n\xE3o esclarecida</b> preserva uma d\xFAvida presente nas fontes.</p><p>As explica\xE7\xF5es sobre circula\xE7\xE3o distinguem o contexto hist\xF3rico de uma data exata de incorpora\xE7\xE3o. Uma hist\xF3ria de origem de um prato, instrumento ou pr\xE1tica n\xE3o substitui a pesquisa da palavra. Quimbundo, quicongo, umbundo e iorub\xE1 s\xE3o l\xEDnguas distintas.</p><p>Ilustra\xE7\xF5es, exemplos e frases em ingl\xEAs acompanham textos pr\xF3prios da exposi\xE7\xE3o. Pesquisa revisada em 27/10/2026.</p><h3>Fontes por verbete</h3><p>Cada ficha abre suas refer\xEAncias. Consulte, por exemplo, as propostas comparadas para canjica, dengo, cu\xEDca, canga e jab\xE1.</p>${M.sources(["mlp-bantu", "mlp-ioruba", "ufs-canjica", "lex-canga", "lex-cuica", "lex-dengo", "info-jaba"])}</article>`, `<button id="af-about-back" class="primary">Voltar ao acervo</button><button id="af-about-plan" class="secondary">Visita \xE0s galerias</button>`, true);
        this.paper();
        V.$("#af-about-back").onclick = () => M.catalog();
        V.$("#af-about-plan").onclick = () => this.plan();
      },
      geometry(d) {
        if (d.afCurationVersion === 2 && d.adventure?.architecture?.mounts?.some((m) => m.word)) return;
        const geometry = { walls: [], mounts: [], signs: [], windows: [] }, add = (id, x1, y1, x2, y2, color = "#99937f", openings = []) => geometry.walls.push({ id, a: [x1 * T, y1 * T], b: [x2 * T, y2 * T], height: 156, thickness: 13, color, openings });
        add("af-shell-north", 1.2, 3.5, 46.8, 3.5, "#6c786d");
        add("af-shell-west", 1.2, 3.5, 1.2, 36.8);
        add("af-shell-east", 46.8, 3.5, 46.8, 36.8);
        add("af-shell-south", 1.2, 36.8, 46.8, 36.8, "#7d8272", [{ u: (22 - 1.2) / 45.6, width: 118 }, { u: (27.5 - 1.2) / 45.6, width: 118 }]);
        for (const r of rooms) {
          const n = "af-gallery-" + r.id;
          add(n + "-north", r.x, r.y, r.x + r.w, r.y, r.index % 2 ? "#9e9a88" : "#a89c85");
          add(n + "-partition", r.x + 1.1, r.y + 4.6, r.x + 12.6, r.y + 4.6, r.index % 2 ? "#8e9786" : "#a0927c");
          add(n + "-west", r.x, r.y, r.x, r.y + r.h);
          add(n + "-east", r.x + r.w, r.y, r.x + r.w, r.y + r.h);
          add(n + "-south", r.x, r.y + r.h, r.x + r.w, r.y + r.h, "#8b8b79", [{ u: 0.5, width: 150 }]);
          const words = D.words.filter((w) => w.gallery === r.id && !w.extra);
          words.forEach((w, i) => {
            const partition = i >= 3, start = partition ? r.x + 1.1 : r.x, length = partition ? 11.5 : 14, x = r.x + [2.5, 6.8, 11][i % 3];
            geometry.mounts.push({ id: "af-frame-" + w.id, scene: "af-word-" + w.id, wall: n + (partition ? "-partition" : "-north"), u: (x - start) / length, elevation: 138, orientation: "south", width: 110, height: 104, word: w.id, caption: w.name });
          });
          geometry.signs.push({ x: (r.x + 7) * T, y: (r.y + r.h) * T - 128, text: "0" + (r.index + 1) + " \xB7 " + r.name.toUpperCase() });
        }
        add("af-ebo-wall", 30.8, 33.5, 34.8, 33.5, "#948f84");
        geometry.mounts.push({ id: "af-frame-ebo", scene: "af-word-ebo", wall: "af-ebo-wall", u: 0.5, elevation: 138, orientation: "south", width: 110, height: 104, word: "ebo", caption: "Eb\xF3" });
        d.adventure.architecture = geometry;
        d.adventure.environment = { ...d.adventure.environment, indoor: true, sky: "windows", weather: false, ambient: "#e2d8c3" };
        d.adventure.lights = [];
        d.afCurationVersion = 2;
        d.purpose = "Um museu de l\xEDnguas, encontros e transforma\xE7\xF5es: 37 verbetes com etimologia, circula\xE7\xE3o e fontes, em seis galerias de quadros, com \xE1trio de pesquisa e acesso ao P\xE1tio da Ginga.";
      },
      build(id, d) {
        const m = this.originalBuild(id, d);
        if (id !== museum) return m;
        this.geometry(d);
        m.afCurationVersion = 2;
        m.objects = m.objects.filter((o) => o.type !== "af-word");
        m.solids = m.solids.filter((s) => !s.owner?.startsWith("af-word-"));
        const add = (type, id2, x, y, label, extra = {}) => {
          const o = { type, id: id2, x: x * T, y: y * T, label, interactionRange: 100, ...extra };
          m.objects.push(o);
          return o;
        };
        for (const w of D.words) add("af-word", "af-word-" + w.id, 0, 0, "Investigar: " + w.name, { word: w.id, scene: { id: "af-word-" + w.id } });
        const catalog = m.objects.find((o) => o.type === "af-catalog");
        Object.assign(catalog, { x: 17.7 * T, y: 34.7 * T, label: "Consultar o acervo e a visita" });
        m.solids.push({ x: 16.25 * T, y: 33.15 * T, w: 2.9 * T, h: 1.2 * T, owner: catalog.id });
        for (const p of panels) add("af-curation-panel", "af-panel-" + p.id, ...p.at, "Ler: " + p.title, { panel: p.id });
        add("af-curator", "af-curator", 20.6, 34.5, "Conversar com Bento \xB7 media\xE7\xE3o da visita", { character: "bento", stationary: true });
        for (const [x, y] of [[13.2, 35.4], [37, 35.4]]) {
          const id2 = "af-reading-bench-" + x, o = add("cozy", id2, x, y, "Sentar e observar", { scene: { id: id2, kind: "seat", dir: 0, text: "Um momento para observar e pensar nas palavras." } });
          m.anchors.set(id2, { id: id2, x: o.x, y: o.y, dir: 0, state: "sitting" });
          m.solids.push({ x: o.x - 43, y: o.y - 25, w: 86, h: 24, owner: id2 });
        }
        Arch.hydrate(m);
        for (const o of m.objects.filter((o2) => o2.type === "af-word")) {
          o.label = "Investigar: " + D.words.find((w) => w.id === o.word).name;
          o.interactionRange = 100;
        }
        for (const o of m.objects) V.SceneDesign.objectRegistry[id][o.id] = { ...o };
        return m;
      },
      ground(m) {
        if (m.id !== museum) return this.originalGround(m);
        const canvas = V.GroundCache.create(m, m.width * T, m.height * T);
        ;
        ;
        const c = canvas.getContext("2d");
        c.fillStyle = "#293f37";
        c.fillRect(0, 0, V.GroundCache.width(canvas), V.GroundCache.height(canvas));
        c.fillStyle = "#bdb39a";
        c.fillRect(T, 3.5 * T, (m.width - 2) * T, 33.5 * T);
        for (let y = 3.5 * T; y < 37 * T; y += 96) for (let x = T; x < 47 * T; x += 96) {
          c.fillStyle = (x / 96 + y / 96) % 2 ? "#fff9e20c" : "#66564008";
          c.fillRect(x + 1, y + 1, 94, 94);
          c.fillStyle = "#f8ecd317";
          c.fillRect(x + 4, y + 4, 88, 1);
        }
        for (const r of rooms) {
          const x = r.x * T, y = r.y * T, w = r.w * T, h = r.h * T;
          c.fillStyle = "#82705b";
          c.fillRect(x, y, w, h);
          for (let yy = y; yy < y + h; yy += 20) {
            c.fillStyle = Math.round((yy - y) / 20) % 3 ? "#ac96740d" : "#2c25140c";
            c.fillRect(x, yy, w, 1);
            for (let xx = x + Math.round((yy - y) / 20) % 2 * 80; xx < x + w; xx += 160) {
              c.fillStyle = "#30281915";
              c.fillRect(xx, yy, 1, 20);
            }
          }
          c.strokeStyle = "#c6b28c";
          c.lineWidth = 4;
          c.strokeRect(x + 11, y + 10, w - 22, h - 20);
          c.fillStyle = r.color + "30";
          c.fillRect(x + T, y + 1.8 * T, w - 2 * T, 1.7 * T);
          c.fillRect(x + T, y + 6.4 * T, w - 2 * T, 1.7 * T);
          c.fillStyle = "#e8d5a733";
          c.fillRect(x + T + 6, y + 3.5 * T - 5, w - 2 * T - 12, 2);
          c.fillRect(x + T + 6, y + 8.1 * T - 5, w - 2 * T - 12, 2);
        }
        c.fillStyle = "#495d51";
        c.fillRect(14.7 * T, 32.2 * T, 7.5 * T, 3.2 * T);
        c.strokeStyle = "#ccb77b";
        c.lineWidth = 2;
        c.strokeRect(14.7 * T + 8, 32.2 * T + 8, 7.5 * T - 16, 3.2 * T - 16);
        M.text(c, "RECEP\xC7\xC3O \xB7 ACERVO E VISITA", 18.45 * T, 32.65 * T, 11, "#efe3bf");
        c.fillStyle = "#263d35";
        c.fillRect(10 * T, 0.5 * T, 28 * T, 1.3 * T);
        M.text(c, "PALAVRAS EM TRAVESSIA", 24 * T, 1.14 * T, 27, "#f2d69a");
        M.text(c, "L\xCDNGUAS AFRICANAS NO PORTUGU\xCAS DO BRASIL", 24 * T, 2 * T, 12, "#e3d6b3");
        m.cache = canvas;
      },
      drawWord(c, m, mount2, cam) {
        const w = D.words.find((w2) => w2.id === mount2.word), p = Arch.mountPosition(m.design, mount2);
        if (!w || !p) return;
        const x = p.x - cam.x - mount2.width / 2, y = p.y - cam.y - mount2.elevation, fw = mount2.width, fh = mount2.height;
        if (c.getTransform().a === 1 && (x < -180 || x > c.canvas.width + 180 || y < -190 || y > c.canvas.height + 80)) return;
        const glow = c.createRadialGradient(x + fw / 2, y + fh * 0.45, 15, x + fw / 2, y + fh * 0.5, 100);
        glow.addColorStop(0, "#ffe7a31c");
        glow.addColorStop(1, "#ffe7a300");
        c.fillStyle = glow;
        c.fillRect(x - 45, y - 25, fw + 90, fh + 65);
        c.fillStyle = "#231e1d66";
        c.fillRect(x + 7, y + 9, fw + 6, fh + 6);
        c.fillStyle = "#433c30";
        c.fillRect(x - 5, y - 5, fw + 10, fh + 10);
        c.fillStyle = "#b49a60";
        c.fillRect(x - 2, y - 2, fw + 4, fh + 4);
        c.fillStyle = "#ede0bf";
        c.fillRect(x + 3, y + 3, fw - 6, fh - 6);
        A.image(c, w.illustration, x + 9, y + 9, fw - 18, fh - 18);
        c.strokeStyle = "#786b47";
        c.lineWidth = 2;
        c.strokeRect(x + 6, y + 6, fw - 12, fh - 12);
        c.fillStyle = "#30362c";
        c.fillRect(x + fw / 2 - 7, y - 17, 14, 6);
        c.fillStyle = "#e8d7a1";
        c.fillRect(x + fw / 2 - 4, y - 11, 8, 3);
        const px = p.x - cam.x - 79, py = y + fh + 13;
        c.fillStyle = "#e9ddc0";
        c.fillRect(px, py, 158, 41);
        c.fillStyle = D.galleries.find((g) => g.id === w.gallery).color;
        c.fillRect(px, py, 4, 41);
        M.text(c, w.name, px + 79, py + 13, 13, "#3e4435");
        M.text(c, this.language(w), px + 79, py + 29, 9, "#62634c");
        if (V.state?.africanMuseum?.words?.includes(w.id)) {
          c.fillStyle = "#387a5b";
          c.fillRect(x + fw - 10, y - 6, 17, 17);
          M.text(c, "\u2713", x + fw - 1, y + 3, 12, "#f6e7bd");
        }
        if (W.nearest?.word === w.id) {
          c.strokeStyle = "#edc878";
          c.lineWidth = 3;
          c.strokeRect(x - 9, y - 9, fw + 18, fh + 18);
        }
      },
      drawObject(c, o, cam) {
        if (W.current?.id !== museum) return this.originalDraw(c, o, cam);
        if (o.type === "af-word") return;
        if (o.type === "af-curation-panel") {
          const p = panels.find((p2) => p2.id === o.panel), x = o.x - cam.x, y = o.y - cam.y;
          c.fillStyle = "#332d2540";
          c.fillRect(x - 42, y - 25, 92, 26);
          c.fillStyle = "#7c704e";
          c.fillRect(x - 4, y - 54, 8, 44);
          c.fillStyle = "#b4a170";
          c.fillRect(x - 40, y - 103, 80, 62);
          c.fillStyle = "#ece0bf";
          c.fillRect(x - 36, y - 99, 72, 54);
          c.fillStyle = "#4a695a";
          c.fillRect(x - 30, y - 93, 60, 7);
          for (let i = 0; i < 3; i++) {
            c.fillStyle = "#8a886b";
            c.fillRect(x - 29, y - 77 + i * 8, 58 - i * 7, 2);
          }
          M.text(c, { "people": "PESSOAS", "languages": "L\xCDNGUAS", "research": "PESQUISA", "changes": "MUDAN\xC7AS" }[p.id], x, y - 28, 10, "#394b3b");
          if (W.nearest?.id === o.id) {
            c.strokeStyle = "#e8c875";
            c.lineWidth = 2;
            c.strokeRect(x - 43, y - 106, 86, 68);
          }
          return;
        }
        if (o.type === "af-curator") {
          const x = o.x - cam.x, y = o.y - cam.y;
          V.SceneShadows?.character(c, "bento", x, y, 64, 0, 0, true);
          V.Assets.sprite(c, "bento", x, y, 0, V.settings.reducedMotion ? 0 : Math.floor(M.clock * 1.5) % 4, 64);
          if (W.nearest?.id === o.id) {
            c.fillStyle = "#274c3f";
            c.fillRect(x - 67, y - 99, 134, 26);
            M.text(c, "Bento \xB7 media\xE7\xE3o", x, y - 85, 11, "#f3ddac");
          }
          return;
        }
        if (o.type === "af-catalog") {
          const x = o.x - cam.x, y = o.y - cam.y;
          c.fillStyle = "#40362955";
          c.fillRect(x - 62, y - 40, 130, 45);
          c.fillStyle = "#6d573a";
          c.fillRect(x - 64, y - 68, 128, 52);
          c.fillStyle = "#c8b789";
          c.fillRect(x - 70, y - 74, 140, 15);
          c.fillStyle = "#917548";
          c.fillRect(x - 59, y - 58, 118, 4);
          C.prop(c, "base", 9, x - 49, y - 83, 30);
          c.fillStyle = "#efe1bd";
          c.fillRect(x + 12, y - 71, 37, 18);
          c.fillStyle = "#496c59";
          c.fillRect(x + 30, y - 71, 2, 18);
          M.text(c, "ACERVO", x, y - 34, 12, "#f4dfad");
          return;
        }
        if (o.type === "cozy" && o.scene?.kind === "seat") {
          C.bench(c, o.x - cam.x, o.y - cam.y - 15, 0);
          return;
        }
        if (o.afLink) {
          const x = o.x - cam.x, y = o.y - cam.y;
          c.fillStyle = "#d0bc8d";
          c.fillRect(x - 57, y - 1, 114, 7);
          M.text(c, o.to === "capoeira-courtyard" ? "P\xC1TIO DA GINGA" : "PRA\xC7A DAS VOZES", x, y - 18, 11, "#f3e2ba");
          return;
        }
        return this.originalDraw(c, o, cam);
      },
      render(c) {
        const m = W.current;
        if (m.id !== museum) return this.originalRender(c);
        const cam = W.camera;
        if (!m.cache) this.ground(m);
        c.save();
        c.imageSmoothingEnabled = false;
        c.fillStyle = "#293f37";
        c.fillRect(0, 0, c.canvas.width, c.canvas.height);
        V.GroundCache.draw(c, m.cache, Math.round(-cam.x), Math.round(-cam.y));
        const draws = V.RenderView.objects(c, m, cam, true).map((o) => ({ y: V.RenderView.depth(o), kind: "object", o })).concat(Arch.geometry(m.design).walls.map((o) => ({ y: Math.max(o.a[1], o.b[1]), kind: "wall", o })), [{ y: V.Player.data.y, kind: "player" }]).sort((a, b) => a.y - b.y);
        for (const d of draws) {
          if (d.kind === "wall") Arch.drawWall(c, m, d.o, cam);
          else if (d.kind === "object") this.drawObject(c, d.o, cam);
          else V.Player.render(c);
        }
        Arch.drawSigns(c, m, cam);
        if (V.PixPresence?.following()) V.PixPresence.draw(c, V.Player.data, cam);
        if (W.transition > 0) {
          c.globalAlpha = W.transition;
          c.fillStyle = "#253e34";
          c.fillRect(0, 0, c.canvas.width, c.canvas.height);
        }
        c.restore();
        W.drawMiniMap();
      },
      curator() {
        V.UI.modal("Bento \xB7 media\xE7\xE3o da visita", "BOAS-VINDAS AO MUSEU DAS PALAVRAS", `<article class="af-curator-reading">${V.UI.portrait("bento", 0, 110)}<div><h3>Uma palavra pode guardar muitos encontros.</h3><p>Observe a ilustra\xE7\xE3o, leia o uso atual e abra a hist\xF3ria da palavra. Voc\xEA vai encontrar formas de origem, mudan\xE7as de sentido e caminhos de circula\xE7\xE3o no portugu\xEAs.</p><p>As fontes nem sempre concordam. Canjica, dengo e cu\xEDca s\xE3o bons pontos de partida para comparar explica\xE7\xF5es. As seis galerias e os pain\xE9is do \xE1trio ajudam a construir sua visita.</p><p lang="en">Every word has a story. Look, read and ask questions.</p><small>Cada palavra tem uma hist\xF3ria. Observe, leia e fa\xE7a perguntas.</small></div></article>`, `<button id="af-curator-plan" class="primary">Conhecer as galerias</button><button id="af-curator-words" class="secondary">Consultar palavras</button><button id="af-curator-close" class="secondary">Explorar</button>`, true);
        this.paper();
        V.UI.paintPortraits();
        V.$("#af-curator-plan").onclick = () => this.plan();
        V.$("#af-curator-words").onclick = () => M.catalog();
        V.$("#af-curator-close").onclick = () => V.UI.close();
      },
      hud() {
        const active = V.Game.screen === "game" && W.current?.id === museum;
        document.body.classList.toggle("af-curation-map", active);
        let el = V.$("#af-curation-hud");
        if (!el) {
          el = document.createElement("aside");
          el.id = "af-curation-hud";
          el.setAttribute("aria-label", "Sua visita ao museu");
          V.$("#stage").appendChild(el);
        }
        el.hidden = !active || V.Game.mode !== "explore" || V.SceneEditor.active;
        if (!active) return;
        const p = V.Player.data, r = rooms.find((r2) => p.x >= r2.x * T && p.x <= (r2.x + r2.w) * T && p.y >= r2.y * T && p.y <= (r2.y + r2.h) * T), s = M.ensure(), words = r ? D.words.filter((w) => w.gallery === r.id && !w.extra) : D.words, seen = words.filter((w) => s.words.includes(w.id)).length;
        const signature = [r?.id || "atrium", seen, words.length].join(":");
        if (el.dataset.signature === signature) return;
        el.dataset.signature = signature;
        el.innerHTML = `<small>${r ? "GALERIA 0" + (r.index + 1) : "\xC1TRIO \xB7 PALAVRAS EM TRAVESSIA"}</small><strong>${r ? esc(r.name) : "Uma l\xEDngua, muitas hist\xF3rias"}</strong><p>${r ? "Aproxime-se dos quadros para investigar origens e transforma\xE7\xF5es." : "Converse com Bento, leia os pain\xE9is e escolha uma galeria."}</p><div><progress max="${words.length}" value="${seen}" aria-label="Descobertas da visita"></progress><span>${seen} / ${words.length}</span></div>`;
      }
    };
    U.originalCatalog = M.catalog.bind(M);
    U.originalPaint = M.paintCatalog.bind(M);
    U.originalBuild = M.build.bind(M);
    U.originalGround = M.ground.bind(M);
    U.originalDraw = M.drawObject.bind(M);
    U.originalRender = M.render.bind(M);
    M.catalog = (...a) => U.catalog(...a);
    M.paintCatalog = (...a) => U.paintCatalog(...a);
    M.exhibit = (id) => U.exhibit(id);
    M.about = () => U.about();
    M.build = (id, d = C.layouts[id]) => U.build(id, d);
    M.ground = (m) => U.ground(m);
    M.drawObject = (...a) => U.drawObject(...a);
    M.render = (c) => U.render(c);
    for (const d of [C.layouts[museum], V.SceneDesign.defaults[museum], M.defaults[museum]]) U.geometry(d);
    const wall = Arch.drawWall.bind(Arch);
    Arch.drawWall = function(c, m, w, cam) {
      const p = V.Player.data, h = w.height || 156, behind = m.id === museum && W.current === m && !V.SceneEditor.active && p && p.y < Math.max(w.a[1], w.b[1]) && p.y > Math.min(w.a[1], w.b[1]) - h - 45 && p.x > Math.min(w.a[0], w.b[0]) - 50 && p.x < Math.max(w.a[0], w.b[0]) + 50;
      if (!behind) return wall(c, m, w, cam);
      wall(c, m, { ...w, id: "home-divider-" + w.id }, cam);
      c.save();
      c.globalAlpha = 0.22;
      for (const a of m.mounts.filter((a2) => a2.wall === w.id)) Arch.drawMount(c, m, a, cam);
      c.restore();
    };
    const mount = Arch.drawMount.bind(Arch);
    Arch.drawMount = function(c, m, a, cam) {
      return a.word ? U.drawWord(c, m, a, cam) : mount(c, m, a, cam);
    };
    const toolbar = M.toolbar.bind(M);
    M.toolbar = function() {
      toolbar();
      const root = V.$("#af-museum-toolbar");
      if (root && !V.$("#af-toolbar-plan")) {
        const b = document.createElement("button");
        b.id = "af-toolbar-plan";
        b.className = "secondary";
        b.textContent = "Visita";
        b.onclick = () => U.plan();
        root.insertBefore(b, V.$("#af-toolbar-roda"));
      }
      U.hud();
    };
    V.Hooks.around(V.Game, "interact", "african-museum-curation:interact:1", (nextHook) => function(o) {
      if (W.current?.id === museum && o && !V.modal && !V.Dialogue.active && this.mode === "explore") {
        if (o.type === "af-curation-panel") return U.panel(o.panel);
        if (o.type === "af-curator") return U.curator();
      }
      return nextHook(o);
    });
    V.Hooks.around(V.Game, "update", "african-museum-curation:update:1", (nextHook) => function(dt) {
      const r = nextHook(dt);
      U.clock += dt;
      if (U.clock > 0.35) {
        U.clock = 0;
        U.hud();
      }
      return r;
    });
    V.Hooks.around(V.Game, "toTitle", "african-museum-curation:toTitle:1", (title) => function(...a) {
      const r = title(...a);
      U.hud();
      return r;
    });
    const guide = V.ObjectiveGuide.update.bind(V.ObjectiveGuide);
    V.ObjectiveGuide.update = function(dt) {
      if (W.current?.id === museum) {
        this.path = [];
        this.nextObject = null;
        return;
      }
      return guide(dt);
    };
  })();
});
