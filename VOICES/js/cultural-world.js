/* Registered module: cultural-world */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("cultural-world", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, C = V.Cozy, L = V.Living, W = V.World, T = 48, esc = V.escape, data = V.culturalContent;
    const books = data.readings || [], gallery = data.gallery || [];
    const topics = ["hair", "wrap", "clothes", "food", "music", "faceart", "masks", "sculptures", "faith"];
    const noteSources = {
      "hair-locs": ["culture_smithsonian_hair"],
      "wrap-front-knot": ["culture_baianas_ipac"],
      "wrap-side-fold": ["culture_baianas_ipac"],
      "clothes-printed-blouse": ["notebook-prints", "notebook-kente"],
      "clothes-baiana": ["notebook-tabuleiro"],
      "food-acaraje": ["notebook-bahia", "notebook-tabuleiro"],
      "food-abara": ["notebook-bahia", "culture_baianas_ipac"],
      "food-cocada": ["notebook-bahia"],
      "cloth-pano-da-costa": ["culture_art_fundaj_pano", "culture_pano_cnfcp"]
    };
    const culturalSections = (sections) => sections.map(([title, body]) => `<section><h3>${esc(title)}</h3><p>${esc(body)}</p></section>`).join("");
    const visualSources = [
      { id: "culture_art_fundaj_pano", name: "Funda\xE7\xE3o Joaquim Nabuco, Pesquisa Escolar \u2014 Panos da costa", url: "https://pesquisaescolar.fundaj.gov.br/pt-br/artigo/panos-da-costa/", note: "Refer\xEAncia de contexto para o estudo original de tecido. Nenhuma fotografia foi copiada." },
      { id: "culture_art_sv_trancas", name: "Prefeitura de S\xE3o Vicente \u2014 S\xE3o Vicente une moda, tradi\xE7\xE3o e ra\xEDzes em oficina de tran\xE7as", url: "https://www.saovicente.sp.gov.br/informacao/sao-vicente-une-moda-tradicao-e-raizes-em-oficina-de-trancas", note: "Refer\xEAncia institucional para o contexto de uma oficina de trabalho e aprendizagem. Bisa \xE9 uma personagem original." },
      { id: "culture_art_rio_trancas", name: "JUV-Rio \u2014 Jovens da Pavuna aprendem t\xE9cnica de tran\xE7as profissionais na Casa da Juventude (2021)", url: "https://juv.prefeitura.rio/noticias/jovens-da-pavuna-aprendem-tecnica-de-trancas-profissionais-na-casa-da-juventude/", note: "Refer\xEAncia sobre forma\xE7\xE3o profissional e t\xE9cnicas de tran\xE7as. Os estudos visuais e sprites s\xE3o originais." },
      { id: "culture_art_salvador_comidas", name: "C\xE2mara Municipal de Salvador \u2014 Dia da Baiana de Acaraj\xE9 (2017)", url: "https://www.cms.ba.gov.br/noticias/dia-da-baiana-de-acaraje", note: "Consultadas as descri\xE7\xF5es de preparo e apresenta\xE7\xE3o de acaraj\xE9 e abar\xE1. N\xE3o utilizamos a proposta de 2017 como informa\xE7\xE3o jur\xEDdica atual." }
    ];
    for (const key of ["sources", "readings", "questions"]) for (const item of key === "sources" ? [...data.sources || [], ...visualSources] : data[key] || []) if (!V.cozyContent[key].some((x) => x.id === item.id)) V.cozyContent[key].push(item);
    const missions = [
      { id: "culture-hair", culture: true, title: "Fios, t\xE9cnicas e escolhas", owner: "bisa", map: "market", brief: "Bisa est\xE1 preparando um caderno de trabalho. Conhe\xE7a a trancista, leia suas refer\xEAncias e relacione tr\xEAs desenhos \xE0s t\xE9cnicas descritas.", reward: "Caderno de t\xE9cnicas exposto na banca de Bisa", steps: [{ kind: "talk", targets: ["bisa"], label: "Converse com Bisa no ateli\xEA de cabelos da feira." }, { kind: "read", targets: ["culture-book-01"], label: "Leia \u201CTran\xE7ar tamb\xE9m \xE9 projetar\u201D, na feira ou no acervo cultural da biblioteca." }, { kind: "puzzle", targets: ["culture-hair"], label: "Compare os desenhos no caderno da trancista." }] },
      { id: "culture-wrap", culture: true, title: "Uma legenda para cada pe\xE7a", owner: "dandara", map: "market", brief: "A costureira Dandara organiza a mostra da feira. Relacione a exposi\xE7\xE3o de Negra Jh\xF4 e a indument\xE1ria das baianas \xE0s informa\xE7\xF5es das leituras.", reward: "Legenda contextualizada na mostra de tecidos", steps: [{ kind: "talk", targets: ["dandara"], label: "Converse com Dandara na oficina de tecidos da feira." }, { kind: "read", targets: ["culture-book-03", "culture-book-04"], label: "Consulte \u201CUm tecido, muitas escolhas\u201D e \u201CCada pe\xE7a tem contexto\u201D. A biblioteca re\xFAne as duas leituras." }, { kind: "puzzle", targets: ["culture-wrap"], label: "Prepare a legenda da mostra com Dandara." }] },
      { id: "culture-food", culture: true, title: "Nomes e saberes no tabuleiro", owner: "viviane", map: "market", brief: "Viviane preparou fichas para quem visita seu tabuleiro. Observe as ilustra\xE7\xF5es, leia sobre as comidas e associe cada nome ao preparo apresentado.", reward: "Fichas dos alimentos dispon\xEDveis no tabuleiro", steps: [{ kind: "talk", targets: ["viviane"], label: "Converse com Viviane perto do tabuleiro da feira." }, { kind: "read", targets: ["culture-book-05"], label: "Leia \u201CTr\xEAs fichas no tabuleiro\u201D." }, { kind: "puzzle", targets: ["culture-food"], label: "Organize as fichas de acaraj\xE9, abar\xE1 e cocada." }] },
      { id: "culture-style", culture: true, title: "Uma roupa para uma hist\xF3ria", owner: "jamila", map: "chapter-5", brief: "Jamila organiza uma mostra de cria\xE7\xE3o do bairro. Conhe\xE7a a leitura sobre moda autoral e componha uma roupa original explicando sua escolha.", reward: "Sua composi\xE7\xE3o original participa da mostra comunit\xE1ria", steps: [{ kind: "talk", targets: ["jamila"], label: "Converse com Jamila perto do mural comunit\xE1rio." }, { kind: "read", targets: ["culture-book-06"], label: "Leia \u201CRoupa tamb\xE9m tem autoria\u201D, na assembleia ou na biblioteca." }, { kind: "puzzle", targets: ["culture-style"], label: "Crie sua composi\xE7\xE3o na mesa da mostra comunit\xE1ria." }] },
      { id: "culture-faith", culture: true, title: "Perguntas que abrem espa\xE7o", owner: "jaci", map: "chapter-2", brief: "Jaci vai participar de uma entrevista ficcional sobre sua comunidade. Leia os materiais sobre Candombl\xE9 e Umbanda e prepare perguntas que preservem as diferen\xE7as e a liberdade de responder.", reward: "Entrevista revisada dispon\xEDvel no p\xE1tio do museu", steps: [{ kind: "talk", targets: ["jaci"], label: "Converse com Jaci no p\xE1tio do museu." }, { kind: "read", targets: ["culture-book-07", "culture-book-08"], label: "Leia as duas refer\xEAncias sobre comunidades religiosas. Elas tamb\xE9m est\xE3o no acervo cultural da biblioteca." }, { kind: "puzzle", targets: ["culture-faith"], label: "Prepare a entrevista com Jaci no p\xE1tio do museu." }] }
    ];
    L.missions.push(...missions);
    const props = (index, x, y, size = 1, solid = false) => ["culture", index, x, y, size, solid];
    const scene = (id, kind, x, y, prop, title, text, topic, missionIds = []) => ({ id, kind, x, y, family: "culture", prop, title, text, cultureTopic: topic, cultureMissions: missionIds });
    const append = (id, decor = [], scenes = [], positions = {}, anchors = []) => {
      const d = C.layouts[id];
      d.decor.push(...decor);
      d.scenes.push(...scenes);
      d.positions = Object.assign(d.positions || {}, positions);
      d.anchors = (d.anchors || []).concat(anchors);
    };
    const market = C.layouts.market;
    market.purpose = "Uma feira com alimentos, oficina de tecidos, trabalho de trancista e conversas sobre os saberes de cada pessoa.";
    market.decor = market.decor.filter((p) => !(p[0] === "cozy" && p[1] === 24)).map((p) => p[0] === "base" && p[1] === 31 && p[2] === 21 ? ["culture", 18, ...p.slice(2)] : p[0] === "cozy" && p[1] === 35 && p[2] === 20 ? ["culture", 19, ...p.slice(2)] : p[0] === "cozy" && [32, 33, 34, 37].includes(p[1]) ? ["culture", { 32: 8, 33: 9, 34: 10, 37: 5 }[p[1]], ...p.slice(2)] : p);
    const food = market.scenes.find((s) => s.id === "market-food");
    Object.assign(food, { family: "culture", prop: 8, cultureTopic: "food", cultureMissions: ["culture-food"] });
    const fabrics = market.scenes.find((s) => s.id === "market-labels");
    Object.assign(fabrics, { family: "culture", prop: 13, title: "Oficina de tecidos de Dandara", text: "Tecidos, costuras e escolhas pessoais. Veja as pe\xE7as e consulte as leituras antes de escrever uma legenda.", cultureTopic: "wrap", cultureMissions: ["culture-wrap"] });
    Object.assign(market.scenes.find((s) => s.id === "market-paper"), { x: 24, y: 17 });
    append(
      "market",
      [props(0, 22, 11, 1.3, true), props(1, 23, 12, 1.2, true), props(2, 21, 12, 0.9), props(22, 24, 11, 1, true), props(4, 22.2, 6.2, 0.9), props(6, 25, 6, 1.25, true), props(11, 3, 12, 0.7), props(12, 4, 11, 0.7)],
      [scene("market-hair", "exhibit", 25, 13, 3, "Caderno da trancista", "Observe as t\xE9cnicas e as escolhas de quem usa cada penteado. Bisa cuida deste espa\xE7o de trabalho.", "hair", ["culture-hair"])],
      { "culture-book-01": [24, 14], "culture-book-04": [24, 8], "culture-book-05": [8, 14] },
      [["braid-work", 22, 14, "working", 19, 3], ["braid-tools", 21, 13, "working", 10, 3], ["sewing-work", 23, 8, "working", 20, 3], ["fabric-check", 24, 7, "observing", 13, 3]]
    );
    append(
      "library",
      [props(15, 16, 12, 0.8), props(21, 18, 2, 1.3)],
      [scene("library-culture", "shelf", 19, 9, 15, "Acervo de culturas negras", "Cabelos, tecidos, comidas, cria\xE7\xE3o autoral e diversidade religiosa: leituras sobre t\xE9cnicas, hist\xF3rias e pr\xE1ticas culturais, acompanhadas de fontes.", "all")],
      { "culture-book-02": [15, 13] }
    );
    append(
      "chapter-2",
      [props(20, 23, 10, 0.8), props(21, 23, 8, 1.4)],
      [scene("museum-culture", "exhibit", 24, 12, 17, "Ponto de conversa com Jaci", "Conhe\xE7a materiais sobre Candombl\xE9 e Umbanda e prepare uma entrevista que mantenha as diferen\xE7as entre comunidades.", "faith", ["culture-faith"])],
      { "culture-book-07": [23, 14] },
      [["museum-community", 24, 13, "reading", 15, 3]]
    );
    append(
      "room-2",
      [props(14, 15, 3, 1.5)],
      [scene("archive-clothing", "exhibit", 15, 5, 20, "Roupas, pessoas e contextos", "Uma descri\xE7\xE3o identifica a pe\xE7a, o trabalho e as refer\xEAncias. Uma apar\xEAncia n\xE3o revela sozinha a cren\xE7a de algu\xE9m.", "clothes")],
      { "culture-book-08": [15, 12] }
    );
    append(
      "chapter-5",
      [props(13, 23, 11, 1.2), props(23, 24, 11, 0.8)],
      [scene("community-clothing", "exhibit", 23, 13, 18, "Mostra de cria\xE7\xE3o do bairro", "Escolha uma roupa original, registre para quem ela foi pensada e explique sua autoria.", "clothes", ["culture-style"])],
      { "culture-book-03": [22, 15] }
    );
    append(
      "room-5",
      [props(4, 3, 6, 0.9), props(5, 4, 7, 0.7), props(6, 20, 4, 1.3, true)],
      [scene("assembly-fashion", "exhibit", 3, 9, 18, "Mesa de cria\xE7\xE3o e autoria", "Uma mesa para pensar nas escolhas de uma roupa e reconhecer quem a desenhou.", "clothes", ["culture-style"])],
      { "culture-book-06": [3, 12] }
    );
    const square = C.layouts.hub.scenes.find((s) => s.id === "square-news");
    square.text += " Na feira: caderno de Bisa, tecidos de Dandara e fichas do tabuleiro de Viviane. A biblioteca re\xFAne as refer\xEAncias.";
    const original = { compose: C.compose.bind(C), prop: C.prop.bind(C), load: V.Assets.load.bind(V.Assets), ensure: C.ensure.bind(C), init: C.initContent.bind(C), resident: C.resident.bind(C), interact: C.interact.bind(C), nav: L.nav.bind(L), journal: L.journal.bind(L), read: L.read.bind(L), workshop: L.workshop.bind(L), progress: C.progressDetails.bind(C), signature: V.Atlas.signature.bind(V.Atlas), cover: V.Interface.cover.bind(V.Interface), endChat: C.endChat.bind(C) };
    V.Culture = {
      data,
      books,
      gallery,
      missions,
      visualSources,
      modal(...args) {
        const result = V.UI.modal(...args);
        V.$(".modal")?.classList.add("culture-modal");
        return result;
      },
      ensure() {
        if (!V.state) return;
        if (!V.state.culture || typeof V.state.culture !== "object" || Array.isArray(V.state.culture)) V.state.culture = {};
        const s = V.state.culture;
        s.seen = Array.isArray(s.seen) ? [...new Set(s.seen.filter((id) => gallery.some((g) => g.id === id)))] : [];
        if (!s.labels || typeof s.labels !== "object" || Array.isArray(s.labels)) s.labels = {};
        for (const key of Object.keys(s.labels)) if (!missions.some((q) => q.id === key) || !Array.isArray(s.labels[key])) delete s.labels[key];
        else s.labels[key] = s.labels[key].filter((x) => Number.isInteger(x) && x >= 0 && x < 8).slice(0, 5);
        if (s.design && (!Number.isInteger(s.design.piece) || s.design.piece < 0 || s.design.piece > 2 || !Number.isInteger(s.design.setting) || s.design.setting < 0 || s.design.setting > 2 || !Number.isInteger(s.design.detail) || s.design.detail < 0 || s.design.detail > 2)) delete s.design;
      },
      art(id, alt = "", cls = "") {
        return `<img class="culture-art ${cls}" loading="lazy" decoding="async" src="${esc(V.ImageFormats.resolve("assets/culture/" + id + ".png?v=20261017"))}" alt="${esc(alt)}" width="128" height="128">`;
      },
      topicLabel(id) {
        return { all: "Culturas negras \xB7 pessoas e escolhas", hair: "Cabelos e t\xE9cnicas", wrap: "Turbantes e tecidos", clothes: "Roupas, trabalho e autoria", faceart: "Pinturas faciais ilustradas", masks: "M\xE1scaras: formas e materiais", sculptures: "Esculturas e express\xE3o", food: "Comidas e saberes do tabuleiro", music: "M\xFAsica, dan\xE7a e roda", faith: "Comunidades e respeito" }[id] || "Culturas negras";
      },
      entries(topic) {
        return gallery.filter((g) => topic === "all" || g.category === topic || topic === "wrap" && g.id === "cloth-pano-da-costa");
      },
      readings(topic) {
        const ids = { hair: [1, 2], wrap: [3, 4], clothes: [4, 6, 9], food: [5], faith: [7, 8], faceart: [11], masks: [10, 11], sculptures: [11], all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }[topic] || [];
        return ids.map((n) => books.find((r) => r.id === "culture-book-" + String(n).padStart(2, "0"))).filter(Boolean);
      },
      questButton(q) {
        const s = V.state.sideQuests[q.id], ready = s?.started && (s.done || q.steps[s.step]?.kind === "puzzle");
        return `<button class="culture-quest-action ${s?.done ? "secondary" : "primary"}" data-culture-quest="${q.id}"><strong>${s?.done ? "\u2713 " : ""}${esc(q.title)}</strong><small>${s?.done ? "Rever a oficina" : ready ? "Participar da oficina" : s?.started ? "Ver a pr\xF3xima etapa" : "Conhecer a miss\xE3o"}</small></button>`;
      },
      bindQuests() {
        V.$$("[data-culture-quest]").forEach((b) => b.onclick = () => {
          const q = missions.find((q2) => q2.id === b.dataset.cultureQuest), s = V.state.sideQuests[q.id];
          s?.started && (s.done || q.steps[s.step]?.kind === "puzzle") ? L.workshop(q.id) : L.showMission(q.id);
        });
      },
      open(topic = "all", missionIds = [], back = null) {
        this.ensure();
        const entries = this.entries(topic), readings = this.readings(topic);
        V.Culture.modal(this.topicLabel(topic), "ACERVO DO BAIRRO \xB7 T\xC9CNICAS E HIST\xD3RIAS", `<div class="culture-intro"><p>${esc({ hair: "T\xE9cnicas, identidade e escolhas pessoais. Compare desenhos e leia o contexto antes de nomear um penteado.", wrap: "Compare n\xF3s, faixas e dobras. Conhe\xE7a Coroa de Ouro, exposi\xE7\xE3o de Negra Jh\xF4, e a indument\xE1ria das baianas de acaraj\xE9.", clothes: "Roupas cotidianas, trabalho criativo e indument\xE1rias em contextos espec\xEDficos. Cada pessoa pode contar suas pr\xF3prias escolhas.", food: "Da banca de Viviane ao Senegal e \xE0 Costa do Marfim, acompanhe ingredientes, t\xE9cnicas e hist\xF3rias de quem cozinha.", music: "Escute como canto, instrumentos e movimento se organizam no samba de roda e na capoeira.", faith: "Candombl\xE9 e Umbanda t\xEAm hist\xF3rias e comunidades diversas. As leituras apresentam informa\xE7\xF5es p\xFAblicas; Jaci \xE9 uma personagem ficcional que fala de sua pr\xF3pria experi\xEAncia.", faceart: "Quatro retratos aproximam pontos, linhas e cores de perguntas sobre simetria, repeti\xE7\xE3o e ritmo visual. Compare um detalhe por vez.", masks: "Compare nove formas em cada prancha e conhe\xE7a o G\xE8l\xE8d\xE9: uma tradi\xE7\xE3o iorub\xE1-nag\xF4 que articula m\xE1scaras esculpidas, dan\xE7a e canto.", sculptures: "Compare propor\xE7\xF5es, posturas e espa\xE7os entre partes. A leitura apresenta vocabul\xE1rio de an\xE1lise e uma refer\xEAncia do MASP ao artista Agnaldo Manoel dos Santos.", all: "Um acervo para conhecer cabelos, tecidos, roupas, pinturas, m\xE1scaras, esculturas, comidas e comunidades por meio de pessoas, fontes e escolhas." }[topic])}</p></div>${missionIds.length ? `<div class="culture-quest-bar">${missionIds.map((id) => missions.find((q) => q.id === id)).filter(Boolean).map((q) => this.questButton(q)).join("")}</div>` : ""}${entries.length ? `<div class="culture-grid">${entries.map((g) => `<button class="culture-card" data-culture-piece="${g.id}">${this.art(g.asset || g.id, "")}<span><small>${V.state.culture.seen.includes(g.id) ? "\u2713 OBSERVADA" : "EXAMINAR"}</small><strong>${esc(g.title)}</strong></span></button>`).join("")}</div>` : ""}${this.studyCards(topic)}${readings.length ? `<h3>Leituras para consultar</h3><div class="two-cols">${readings.map((r) => `<button class="book-card culture-reading-button" data-culture-read="${r.id}"><small>${esc(r.theme)}</small><strong>${esc(r.title)}</strong><span>${V.state.readings.includes(r.id) ? "\u2713 No caderno" : "Abrir leitura"}</span></button>`).join("")}</div>` : ""}`, `<button id="culture-close" class="primary">${back ? "Voltar" : "Voltar ao mundo"}</button>`, true);
        V.$$("[data-culture-piece]").forEach((b) => b.onclick = () => this.detail(b.dataset.culturePiece, () => this.open(topic, missionIds, back)));
        V.$$("[data-culture-read]").forEach((b) => b.onclick = () => L.read(b.dataset.cultureRead, 0, () => this.open(topic, missionIds, back)));
        V.$$("[data-culture-study]").forEach((b) => b.onclick = () => this.study(b.dataset.cultureStudy, () => this.open(topic, missionIds, back)));
        V.$("#culture-close").onclick = () => back ? back() : V.UI.close();
        this.bindQuests();
      },
      detail(id, back) {
        const g = gallery.find((g2) => g2.id === id);
        if (!g) return;
        this.ensure();
        if (!V.state.culture.seen.includes(id)) {
          V.state.culture.seen.push(id);
          V.Save.save();
        }
        const links = C.sourceLinks([...new Set([...g.sourceIds || [], ...noteSources[id] || []])]), related = (g.relatedIds || []).map((id2) => gallery.find((g2) => g2.id === id2)).filter(Boolean);
        this.modal(g.title, "T\xC9CNICAS, HIST\xD3RIAS E COMPARA\xC7\xD5ES", `<article class="culture-detail culture-detail--${esc(g.category)}">${this.art(g.asset || g.id, g.title)}<div><p>${esc(g.description)}</p>${g.context ? `<section class="culture-context"><h3>${esc(g.contextTitle || "Sobre a pe\xE7a")}</h3><p>${esc(g.context)}</p></section>` : ""}${data.notes[id] ? `<div class="culture-dossier">${culturalSections(data.notes[id])}</div>` : ""}${g.question ? `<p class="culture-observation"><strong>Para observar:</strong> ${esc(g.question)}</p>` : ""}${g.en && g.pt ? `<section class="culture-english"><h3>Em ingl\xEAs</h3><p lang="en">${esc(g.en)}</p><p lang="pt-BR">${esc(g.pt)}</p></section>` : ""}${links ? `<details class="culture-references"><summary>Refer\xEAncias para estudar</summary><div class="reader-origin">${links}</div></details>` : ""}</div></article>${related.length ? `<section class="culture-related"><h3>Compare com outra pe\xE7a</h3><div class="row">${related.map((row) => `<button class="secondary" data-culture-compare="${row.id}">${esc(row.title)}</button>`).join("")}</div></section>` : ""}<div class="stack">${(g.readingIds || []).map((id2) => books.find((r) => r.id === id2)).filter(Boolean).map((r) => `<button class="secondary" data-culture-detail-read="${r.id}">Ler: ${esc(r.title)}</button>`).join("")}</div>`, `<button id="culture-detail-back" class="primary">Voltar \xE0 cole\xE7\xE3o</button>`);
        V.$$("[data-culture-compare]").forEach((b) => b.onclick = () => this.detail(b.dataset.cultureCompare, back));
        V.$$("[data-culture-detail-read]").forEach((b) => b.onclick = () => L.read(b.dataset.cultureDetailRead, 0, () => this.detail(id, back)));
        V.$("#culture-detail-back").onclick = back || (() => this.open(g.category));
      },
      studyCards(topic) {
        const studies = data.studies.filter((s) => topic === "all" || s.topic === topic);
        return studies.length ? `<section class="culture-studies"><h3>Hist\xF3rias e modos de fazer</h3><div class="culture-study-grid">${studies.map((s) => `<button class="culture-study secondary" data-culture-study="${s.id}"><small>${esc(s.place)}</small><strong>${esc(s.title)}</strong><span>${esc(s.summary)}</span></button>`).join("")}</div></section>` : "";
      },
      study(id, back) {
        const s = data.studies.find((row) => row.id === id);
        if (!s) return;
        this.modal(s.title, s.place, `<article class="culture-dossier"><p class="culture-study-lead">${esc(s.summary)}</p>${culturalSections(s.sections)}<details class="culture-references"><summary>Refer\xEAncias para estudar</summary><div class="reader-origin">${C.sourceLinks(s.sources)}</div></details></article>`, `<button class="primary" id="culture-study-back">Voltar \xE0 cole\xE7\xE3o</button>`);
        V.$("#culture-study-back").onclick = back;
      },
      journal() {
        this.ensure();
        V.Culture.modal("Culturas negras no bairro", "CADERNO \xB7 MEM\xD3RIA, TRABALHO E VIDA COTIDIANA", L.nav("culture") + `<div class="notebook-summary"><strong>${missions.filter((q) => V.state.sideQuests[q.id]?.done).length}/${missions.length} oficinas conclu\xEDdas</strong><span>${V.state.culture.seen.length}/${gallery.length} ilustra\xE7\xF5es observadas \xB7 ${books.filter((r) => V.state.readings.includes(r.id)).length}/${books.length} leituras registradas</span></div><div class="culture-topics">${topics.map((topic) => `<button class="culture-topic" data-culture-topic="${topic}">${topic === "faith" || topic === "music" ? V.Interface.icon(topic === "music" ? "music" : "book") : this.art({ hair: "hair-nago", wrap: "wrap-high-fold", clothes: "clothes-dress-green", faceart: "face-paint-yellow", masks: "masks-color", sculptures: "sculpture-pair", food: "food-abara" }[topic], "")}<strong>${esc(this.topicLabel(topic))}</strong></button>`).join("")}</div><h3>Oficinas e transforma\xE7\xF5es do bairro</h3><div class="two-cols">${missions.map((q) => `<article class="card"><small>${esc(L.location(q.map))}</small><p>${esc(q.brief)}</p>${this.questButton(q)}</article>`).join("")}</div>`, "", true);
        L.bindNav();
        V.Interface.decorateJournal("culture");
        const heading = V.$(".modal-head h2");
        if (heading) heading.textContent = "Caderno de culturas negras";
        V.$$("[data-culture-topic]").forEach((b) => b.onclick = () => this.open(b.dataset.cultureTopic, [], () => this.journal()));
        this.bindQuests();
      },
      complete(id) {
        this.ensure();
        const s = V.state.sideQuests[id];
        if (!s?.started) return;
        if (!s.done) L.event("puzzle", id);
        V.Save.save();
        V.UI.close();
        V.UI.toast("O resultado ficou no cen\xE1rio e no caderno de culturas negras.");
        V.Atlas.cache.clear();
      },
      workshop(id) {
        const q = missions.find((q2) => q2.id === id), s = V.state.sideQuests[id];
        if (!s?.started) {
          L.showMission(id);
          return;
        }
        if (!s.done && q.steps[s.step]?.kind !== "puzzle") {
          L.showMission(id);
          return;
        }
        if (id === "culture-hair") this.match(id);
        else if (id === "culture-food") this.match(id);
        else if (id === "culture-wrap") this.caption(id);
        else if (id === "culture-style") this.design();
        else if (id === "culture-faith") this.interview();
      },
      consult(id, readingId, resume = null) {
        L.read(readingId, 0, () => resume ? resume() : this.workshop(id));
      },
      match(id) {
        const hair = id === "culture-hair", labels = hair ? ["Tran\xE7as nag\xF4", "Box braids", "Twists"] : ["Acaraj\xE9", "Abar\xE1", "Cocada"];
        const items = hair ? [{ asset: "hair-box-braids", text: "Tran\xE7as soltas, constru\xEDdas com tr\xEAs mechas.", answer: 1 }, { asset: "hair-twists", text: "Duas mechas torcidas entre si.", answer: 2 }, { asset: "hair-nago", text: "Tran\xE7as feitas rente \xE0 raiz, acompanhando o couro cabeludo.", answer: 0 }] : [{ asset: "food-abara", text: "Massa de feij\xE3o-fradinho cozida no vapor, envolvida em folha de bananeira.", answer: 1 }, { asset: "food-cocada", text: "Doce feito com coco e a\xE7\xFAcar; h\xE1 varia\xE7\xF5es de receita.", answer: 2 }, { asset: "food-acaraje", text: "Bolinho de massa de feij\xE3o-fradinho frito no azeite de dend\xEA.", answer: 0 }];
        let selected = 0, answers = V.state.culture.labels[id]?.slice() || [-1, -1, -1];
        if (answers.length !== 3) answers = [-1, -1, -1];
        const show = () => {
          V.Culture.modal(missions.find((q) => q.id === id).title, "OFICINA DE COMPARA\xC7\xC3O \xB7 SEM CRON\xD4METRO", `<p>${hair ? "Bisa descreveu t\xE9cnicas em seu livro. Relacione cada desenho \xE0 t\xE9cnica; o penteado n\xE3o informa sozinho a hist\xF3ria de quem o usa." : "Viviane preparou as descri\xE7\xF5es abaixo. Compare o preparo e a apresenta\xE7\xE3o, usando tamb\xE9m o texto."}</p><div class="culture-match-layout"><nav class="culture-match-tabs" aria-label="Ilustra\xE7\xF5es para comparar">${items.map((item, i) => `<button class="culture-match-tab ${selected === i ? "selected" : ""}" data-culture-match-item="${i}" aria-pressed="${selected === i}">${this.art(item.asset, "")}<span>Ficha ${i + 1} \xB7 ${answers[i] < 0 ? "sem nome" : esc(labels[answers[i]])}</span></button>`).join("")}</nav><article class="culture-match-item">${this.art(items[selected].asset, "Ilustra\xE7\xE3o da ficha " + (selected + 1))}<p>${esc(items[selected].text)}</p><div class="stack">${labels.map((label, i) => `<button class="choice-button ${answers[selected] === i ? "selected" : ""}" aria-pressed="${answers[selected] === i}" data-culture-match-label="${i}">${esc(label)}</button>`).join("")}</div></article></div><div id="culture-match-feedback" aria-live="polite"></div>`, `<button id="culture-match-read" class="secondary">Consultar leitura</button><button id="culture-match-back" class="secondary">Voltar \xE0 cole\xE7\xE3o</button><button id="culture-match-check" class="primary">Conferir as tr\xEAs fichas</button>`, true);
          V.$$("[data-culture-match-item]").forEach((b) => b.onclick = () => {
            selected = +b.dataset.cultureMatchItem;
            show();
          });
          V.$$("[data-culture-match-label]").forEach((b) => b.onclick = () => {
            answers[selected] = +b.dataset.cultureMatchLabel;
            show();
          });
          V.$("#culture-match-read").onclick = () => this.consult(id, hair ? "culture-book-01" : "culture-book-05", show);
          V.$("#culture-match-back").onclick = () => this.open(hair ? "hair" : "food", [id]);
          V.$("#culture-match-check").onclick = () => {
            const missing = answers.some((n) => n < 0), correct = items.every((item, i) => answers[i] === item.answer), feedback = V.$("#culture-match-feedback");
            feedback.innerHTML = `<div class="feedback ${correct ? "" : "error"}"><strong>${correct ? "\u2713 Fichas conferidas." : missing ? "Complete as tr\xEAs fichas." : "Vamos rever os detalhes."}</strong><p>${correct ? hair ? "As t\xE9cnicas ficaram identificadas. Bisa vai expor o caderno; cada pessoa continua livre para escolher seu cabelo." : "Os nomes e preparos ficaram registrados. Viviane vai apresentar as fichas em seu tabuleiro." : missing ? "Escolha uma ficha, compare sua descri\xE7\xE3o e atribua um nome." : items.filter((item, i) => answers[i] !== item.answer).map((item) => labels[item.answer] + ": " + item.text).join(" ")}</p></div>`;
            if (correct) {
              V.state.culture.labels[id] = answers.slice();
              V.$("#culture-match-check").textContent = "Guardar as fichas";
              V.$("#culture-match-check").onclick = () => this.complete(id);
            }
            V.Audio.sfx(correct ? "correct" : "observe");
          };
        };
        show();
      },
      caption(id) {
        const descriptions = ["O desenho mostra um n\xF3 frontal. Consulte a leitura para escolher uma legenda sobre Coroa de Ouro, exposi\xE7\xE3o idealizada por Negra Jh\xF4.", "O traje re\xFAne pe\xE7as da indument\xE1ria das baianas de acaraj\xE9. A leitura liga a roupa aos demais saberes do of\xEDcio."];
        const choices = [["Coroa de Ouro foi uma exposi\xE7\xE3o de cer\xE2mica, realizada em S\xE3o Paulo em 2005.", "Coroa de Ouro reuniu vinte turbantes de Negra Jh\xF4 no Museu Udo Knoff, em Salvador, em 2011.", "Coroa de Ouro apresentou uma cole\xE7\xE3o de tecidos medievais de autoria desconhecida."], ["O registro do of\xEDcio reconhece somente as receitas, deixando de fora a indument\xE1ria.", "O registro do of\xEDcio descreve apenas roupas para uma festa anual.", "A indument\xE1ria integra o Of\xEDcio das Baianas de Acaraj\xE9, registrado pelo Iphan em 2005."]];
        const correct = [1, 2];
        let selected = 0, answers = [-1, -1];
        const show = () => {
          V.Culture.modal("Uma legenda para cada pe\xE7a", "CURADORIA \xB7 PESSOA, USO E REFER\xCANCIA", `<div class="culture-caption"><div>${this.art(selected ? "clothes-baiana" : "wrap-front-knot", selected ? "Ilustra\xE7\xE3o de indument\xE1ria no contexto do of\xEDcio das baianas" : "Turbante com n\xF3 frontal")}<p>${esc(descriptions[selected])}</p><nav class="row">${["Turbante e exposi\xE7\xE3o", "Indument\xE1ria do of\xEDcio"].map((text, i) => `<button class="filter-chip ${i === selected ? "active" : ""}" data-culture-caption-item="${i}">${text}</button>`).join("")}</nav></div><div><h3>Qual legenda \xE9 sustentada pela leitura?</h3><div class="stack">${choices[selected].map((text, i) => `<button class="choice-button ${answers[selected] === i ? "selected" : ""}" data-culture-caption-answer="${i}">${esc(text)}</button>`).join("")}</div></div></div><div id="culture-caption-feedback" aria-live="polite"></div>`, `<button id="culture-caption-read" class="secondary">Consultar leitura</button><button id="culture-caption-back" class="secondary">Voltar \xE0 mostra</button><button id="culture-caption-check" class="primary">Conferir as duas legendas</button>`, true);
          V.$$("[data-culture-caption-item]").forEach((b) => b.onclick = () => {
            selected = +b.dataset.cultureCaptionItem;
            show();
          });
          V.$$("[data-culture-caption-answer]").forEach((b) => b.onclick = () => {
            answers[selected] = +b.dataset.cultureCaptionAnswer;
            show();
          });
          V.$("#culture-caption-read").onclick = () => this.consult(id, selected ? "culture-book-04" : "culture-book-03", show);
          V.$("#culture-caption-back").onclick = () => this.open("wrap", [id]);
          V.$("#culture-caption-check").onclick = () => {
            const right = answers.every((answer, i) => answer === correct[i]);
            V.$("#culture-caption-feedback").innerHTML = `<div class="feedback ${right ? "" : "error"}"><strong>${right ? "\u2713 As legendas reconhecem pessoas e contextos." : "Compare as duas pe\xE7as com suas descri\xE7\xF5es."}</strong><p>${right ? "A primeira legenda identifica autora, exposi\xE7\xE3o, lugar e ano. A segunda liga a indument\xE1ria ao registro do of\xEDcio em 2005." : "Confira os dados da exposi\xE7\xE3o na leitura sobre turbantes e o registro de 2005 na leitura sobre a indument\xE1ria das baianas."}</p></div>`;
            if (right) {
              V.state.culture.labels[id] = answers.slice();
              V.$("#culture-caption-check").textContent = "Expor as legendas";
              V.$("#culture-caption-check").onclick = () => this.complete(id);
            }
          };
        };
        show();
      },
      design() {
        const id = "culture-style", pieces = ["clothes-cardigan", "clothes-printed-blouse", "clothes-overalls"], pieceNames = ["Cardigan", "Blusa estampada original", "Jardineira"], settings = ["Roda de leitura", "Trabalho no ateli\xEA", "Passeio na pra\xE7a"], details = ["Bolsos para o caderno", "Costura com contraste", "Faixa de cor na barra"];
        let choice = { ...V.state.culture.design || { piece: 0, setting: 0, detail: 0 } };
        const show = () => {
          V.Culture.modal("Uma roupa para uma hist\xF3ria", "ATELI\xCA \xB7 CRIA\xC7\xC3O AUTORAL", `<div class="culture-design"><figure><canvas id="culture-design-preview" width="320" height="280" role="img" aria-label="Composi\xE7\xE3o original: ${esc(pieceNames[choice.piece])}; ${esc(details[choice.detail])}"></canvas><figcaption>Cria\xE7\xE3o de ${esc(V.state.name)} \xB7 ${esc(settings[choice.setting])}.</figcaption></figure><div>${[["piece", "Pe\xE7a", pieceNames], ["setting", "Uso imaginado", settings], ["detail", "Detalhe escolhido", details]].map(([key, title, labels]) => `<fieldset class="culture-design-options"><legend>${title}</legend><div class="row">${labels.map((text, i) => `<button class="filter-chip ${choice[key] === i ? "active" : ""}" aria-pressed="${choice[key] === i}" data-culture-design="${key}:${i}">${esc(text)}</button>`).join("")}</div></fieldset>`).join("")}<p class="note">Todas estas combina\xE7\xF5es s\xE3o escolhas criativas poss\xEDveis. A ficha guarda o nome de quem criou e a inten\xE7\xE3o do desenho.</p></div></div>`, `<button id="culture-design-read" class="secondary">Consultar autoria e moda</button><button id="culture-design-back" class="secondary">Voltar \xE0 mostra</button><button id="culture-design-save" class="primary">Expor minha composi\xE7\xE3o</button>`, true);
          this.drawDesign(V.$("#culture-design-preview").getContext("2d"), choice, 320, 280);
          V.$$("[data-culture-design]").forEach((b) => b.onclick = () => {
            const [key, value] = b.dataset.cultureDesign.split(":");
            choice[key] = +value;
            show();
          });
          V.$("#culture-design-read").onclick = () => this.consult(id, "culture-book-06", show);
          V.$("#culture-design-back").onclick = () => this.open("clothes", [id]);
          V.$("#culture-design-save").onclick = () => {
            V.state.culture.design = { ...choice };
            this.complete(id);
          };
        };
        show();
      },
      drawDesign(ctx, choice, width, height) {
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#e4d0a0";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#b6ad8d";
        ctx.fillRect(12, 12, width - 24, height - 24);
        const img = V.Assets.images["culture-" + ["clothes-cardigan", "clothes-printed-blouse", "clothes-overalls"][choice.piece]];
        if (V.Assets.ready(img)) ctx.drawImage(img, 0, 0, 128, 128, width * 0.08, height * 0.02, width * 0.84, height * 0.86);
        else if (img) {
          const canvas = ctx.canvas, token = Symbol();
          canvas.designPreview = token;
          V.AssetLoader.request(img).then((loaded) => {
            if (loaded && canvas.isConnected && canvas.designPreview === token) this.drawDesign(ctx, choice, width, height);
          });
        }
        ctx.fillStyle = ["#9b6249", "#376b67", "#bc8542"][choice.detail];
        const x = width * 0.4, y = height * 0.49;
        if (choice.detail === 0) {
          ctx.fillRect(x, y, width * 0.09, height * 0.1);
          ctx.fillRect(width * 0.56, y, width * 0.09, height * 0.1);
          ctx.fillStyle = "#e8d5ad";
          ctx.fillRect(x + 2, y + 2, width * 0.09 - 4, 2);
        } else if (choice.detail === 1) {
          for (let yy = height * 0.34; yy < height * 0.62; yy += 6) ctx.fillRect(width * 0.51, yy, 2, 3);
        } else ctx.fillRect(width * 0.34, height * 0.64, width * 0.33, 4);
      },
      interview() {
        const id = "culture-faith", prompts = ["Jaci aceita conversar sobre sua experi\xEAncia. Como abrir a entrevista?", "A equipe quer escrever sobre Candombl\xE9 e Umbanda. Como organizar o texto?", "Antes de publicar a entrevista, o que fazer?"], options = [["Qual roupa prova a religi\xE3o de qualquer pessoa?", "O que voc\xEA gostaria de compartilhar sobre sua comunidade? Pode deixar perguntas sem resposta.", "Voc\xEA pode falar por todas as pessoas negras?"], ["Reunir as duas religi\xF5es em uma descri\xE7\xE3o \xFAnica.", "Trocar o nome de uma pela outra sempre que soar melhor.", "Identificar cada tradi\xE7\xE3o e comunidade, consultar fontes e deixar claras as diferen\xE7as."], ["Oferecer a revis\xE3o da entrevista a Jaci e preservar o que ela decidiu n\xE3o compartilhar.", "Publicar fotos e nomes de qualquer pessoa sem perguntar.", "Transformar uma fala pessoal em regra para todos os terreiros."]], right = [1, 2, 0], responses = ["Jaci: \u201CPosso falar do encontro de leitura da minha comunidade. Algumas partes da minha vida prefiro guardar para mim.\u201D", "Jaci: \u201CObrigada por manter as diferen\xE7as. Meu relato \xE9 uma experi\xEAncia pessoal, n\xE3o uma descri\xE7\xE3o de todas as casas.\u201D", "Jaci: \u201CQuero revisar o trecho antes de aparecer no mural. E aquele assunto que deixei de fora continua de fora.\u201D"];
        let page = 0;
        const show = () => {
          V.Culture.modal("Perguntas que abrem espa\xE7o", "ENTREVISTA FICCIONAL \xB7 " + (page + 1) + "/3", `<div class="culture-interview">${V.UI.portrait("jaci", 0, 96)}<article><small>JACI \xB7 EDUCADORA MUSEAL</small><h3>${esc(prompts[page])}</h3><p>Os livros do museu apresentam as refer\xEAncias. Nesta entrevista, Jaci escolhe o que contar sobre sua pr\xF3pria experi\xEAncia.</p></article></div><div class="stack">${options[page].map((text, i) => `<button class="choice-button" data-culture-interview="${i}">${esc(text)}</button>`).join("")}</div><div id="culture-interview-feedback" aria-live="polite"></div>`, `<button id="culture-interview-read" class="secondary">Consultar as leituras</button><button id="culture-interview-back" class="secondary">Voltar ao p\xE1tio</button><button id="culture-interview-next" class="primary" disabled>${page === 2 ? "Publicar com autoriza\xE7\xE3o" : "Continuar a conversa"}</button>`, true);
          V.UI.paintPortraits();
          V.$$("[data-culture-interview]").forEach((b) => b.onclick = () => {
            const good = +b.dataset.cultureInterview === right[page];
            V.$("#culture-interview-feedback").innerHTML = `<div class="feedback ${good ? "" : "error"}"><p>${esc(good ? responses[page] : ["Uma pessoa pode contar o que deseja sobre sua experi\xEAncia. Roupa e apar\xEAncia n\xE3o autorizam presumir uma religi\xE3o.", "As leituras apresentam diferen\xE7as e diversidade dentro das comunidades. Confira os termos antes de resumir.", "O registro precisa respeitar o que a pessoa autorizou compartilhar. Revisar o texto faz parte desse cuidado."][page])}</p></div>`;
            V.$("#culture-interview-next").disabled = !good;
            if (good) V.$$("[data-culture-interview]").forEach((x) => x.disabled = true);
          });
          V.$("#culture-interview-next").onclick = () => {
            if (++page < 3) show();
            else {
              V.state.culture.labels[id] = right.slice();
              this.complete(id);
            }
          };
          V.$("#culture-interview-read").onclick = () => this.open("faith", [], () => show());
          V.$("#culture-interview-back").onclick = () => this.open("faith", [id]);
        };
        show();
      },
      registerPeople(m) {
        const locations = { bisa: ["market", 22, 14, ["braid-work", "braid-tools", "market-rest"]], dandara: ["market", 23, 8, ["sewing-work", "fabric-check", "market-labels"]], jaci: ["chapter-2", 24, 13, ["museum-community", "museum-visit", "museum-courtyard"]] };
        for (const r of data.residents || []) {
          const placement = locations[r.id];
          if (!placement || placement[0] !== m.id) continue;
          const p = C.safe(m, placement[1], placement[2], m.objects.filter((o2) => C.person(o2))), o = { type: "resident", id: "resident-" + r.id, x: p.x * T + 24, y: p.y * T + 24, label: "Conversar com " + r.name, character: r.character, resident: r, homeMap: m.id, cultural: true };
          m.objects.push(o);
          C.preparePerson(m, o);
          o.tasks = placement[3].filter((id) => m.anchors.has(id)).concat("home-" + o.id);
          o.waypoints = o.tasks.map((id) => m.anchors.get(id));
        }
        for (const o of m.objects) {
          const addition = data.residentAdditions?.find((r) => r.id === o.resident?.id)?.lines;
          if (addition) o.resident = { ...o.resident, lines: (o.resident.lines || []).concat(addition), repeat: addition.at(-1) || o.resident.repeat };
        }
      },
      talk(o, lines) {
        const r = o.resident;
        V.Dialogue.start(lines, () => {
          if (!V.state.residentTalks.includes(r.id)) V.state.residentTalks.push(r.id);
          L.event("talk", r.id);
          V.Save.log("morador", r.name);
          V.Save.save();
          const offers = missions.filter((q) => q.owner === r.id && !V.state.sideQuests[q.id]?.done);
          if (offers.length) {
            V.Culture.modal(r.name + " \xB7 trabalho em conjunto", r.role, `<p>Voc\xEA pode participar destas oficinas:</p><div class="stack">${offers.map((q) => L.missionCard(q)).join("")}</div>`);
            V.$$("[data-mission-view]").forEach((b) => b.onclick = () => L.showMission(b.dataset.missionView));
          }
        });
      },
      changeConversation(m, g, index) {
        g.sourceIndex = index % g.sources.length;
        const source = g.sources[g.sourceIndex];
        for (const o of g.members) {
          delete o.group;
          delete o.chat;
          o.chatReady = false;
        }
        g.members = source.speakers.map((id) => m.objects.find((o) => C.person(o) && o.character === id));
        g.lines = source.lines;
        g.enLines = source.enLines;
        g.members.forEach((o, i) => {
          o.member = i;
          o.group = g.id;
          o.chat = { ...g, speakers: source.speakers };
          o.chatReady = false;
        });
      },
      conversations(m) {
        const available = (data.conversations || []).filter((g2) => g2.map === m.id && g2.speakers.every((id) => m.objects.some((o) => C.person(o) && o.character === id)));
        if (!available.length) return;
        const source = available[0], members = source.speakers.map((id) => m.objects.find((o) => C.person(o) && o.character === id));
        for (const g2 of m.chats) C.endChat(m, g2);
        m.chats = [];
        m.objects = m.objects.filter((o) => o.scene?.kind !== "conversation");
        for (const o of m.objects) {
          delete o.group;
          delete o.chat;
          o.chatReady = false;
          o.chatSpeaking = false;
        }
        const meeting = m.design.meeting || (m.id === "market" ? [20, 10] : m.id === "chapter-2" ? [23, 14] : null), others = m.objects.filter((o) => C.person(o) && !members.includes(o)), base = meeting ? C.safe(m, ...meeting, others) : C.safe(m, members[0].x / T - 0.5, members[0].y / T - 0.5, others), spots = [base, C.safe(m, base.x + 1, base.y, others.concat([{ x: base.x * T + 24, y: base.y * T + 24 }]))], g = { id: "culture-conversation-" + m.id, members, lines: source.lines, enLines: source.enLines, clock: 0, wait: 19, phase: "rest", line: -1, talking: false, sources: available, sourceIndex: 0 };
        members.forEach((o, i) => {
          o.chat = { ...g, speakers: members.map((x) => x.character) };
          o.group = g.id;
          o.member = i;
          g["anchor" + i] = C.addAnchor(m, "culture-meeting-" + i, spots[i].x * T + 24, spots[i].y * T + 24, "conversing", 20, i ? 1 : 2);
        });
        m.chats.push(g);
      }
    };
    C.ensure = function() {
      original.ensure();
      V.Culture.ensure();
    };
    C.initContent = function() {
      original.init();
      for (const r of data.residents || []) V.content.characters[r.character] = { name: r.name, role: r.role, quote: r.lines?.[0]?.pt || "", accent: "#dfb16c" };
    };
    C.compose = function(m) {
      m.objects = m.objects.filter((o) => !o.mission?.startsWith("culture-") && !(m.id === "library" && o.reading?.id.startsWith("culture-") && o.reading.map !== "library"));
      original.compose(m);
      V.Culture.registerPeople(m);
      V.Culture.conversations(m);
    };
    C.prop = function(ctx, family, index, x, y, size = T) {
      if (family !== "culture") return original.prop(ctx, family, index, x, y, size);
      const img = V.Assets.images["culture-props"];
      if (img) ctx.drawImage(img, index % 8 * 48, Math.floor(index / 8) * 48, 48, 48, Math.round(x), Math.round(y), size, size);
    };
    V.Hooks.around(V.Assets, "load", "cultural-world:load:1", () => async function() {
      const entries = [["culture-props", "assets/tilesets/culture-props.png"], ...["bisa", "dandara", "jaci"].flatMap((id) => [[id, "assets/characters/" + id + ".png"], [id + "-portrait", "assets/characters/" + id + "-portrait.png"]]), ...gallery.filter((g) => ["clothes-cardigan", "clothes-printed-blouse", "clothes-overalls"].includes(g.id)).map((g) => ["culture-" + g.id, "assets/culture/" + (g.asset || g.id) + ".png"])];
      await Promise.all([original.load(), this.loadEntries(entries)]);
      return this.errors;
    });
    C.interact = function(o) {
      if (o.scene?.cultureTopic) {
        V.Culture.open(o.scene.cultureTopic, o.scene.cultureMissions || []);
        return true;
      }
      return original.interact(o);
    };
    C.resident = function(o) {
      const lines = data.residentAdditions?.find((r) => r.id === o.resident.id)?.lines;
      if (o.cultural) {
        if (!V.state.residentTalks.includes(o.resident.id)) {
          V.Culture.talk(o, o.resident.lines);
          return;
        }
        const visits = o.visits = (o.visits || 0) + 1, q = missions.find((q2) => q2.owner === o.resident.id && V.state.sideQuests[q2.id]?.done), line = q && visits % 3 === 0 ? { speaker: o.character, en: "Our work is displayed with its context.", pt: o.character === "bisa" ? "O caderno j\xE1 est\xE1 exposto com as t\xE9cnicas identificadas. Obrigada por cuidar das descri\xE7\xF5es." : o.character === "dandara" ? "As pe\xE7as ganharam legendas com contexto. Agora cada escolha tem espa\xE7o na mostra." : "A entrevista est\xE1 no mural, com as diferen\xE7as e a revis\xE3o que combinamos." } : (o.resident.lines || [])[visits % (o.resident.lines || []).length];
        V.Culture.talk(o, [line]);
        return;
      }
      if (lines && V.state.residentTalks.includes(o.resident.id) && (o.cultureVisits = (o.cultureVisits || 0) + 1) % 2) {
        V.Culture.talk(o, [lines[o.cultureVisits % lines.length]]);
        return;
      }
      return original.resident(o);
    };
    C.endChat = function(m, g) {
      const finished = g.phase === "talk" && g.clock >= g.lines.length * 4.5;
      original.endChat(m, g);
      if (finished && g.sources?.length > 1) V.Culture.changeConversation(m, g, (g.sourceIndex || 0) + 1);
    };
    L.nav = function(tab) {
      return original.nav(tab).replace("</nav>", `<button data-notebook-tab="culture" class="${tab === "culture" ? "active" : ""}" aria-current="${tab === "culture" ? "page" : "false"}">${V.Interface.icon("art")}<span>Culturas negras</span></button></nav>`);
    };
    C.nav = (tab) => L.nav(tab);
    L.journal = function(tab = "quests") {
      if (tab === "culture") V.Culture.journal();
      else original.journal(tab);
    };
    L.workshop = function(id) {
      if (missions.some((q) => q.id === id)) V.Culture.workshop(id);
      else original.workshop(id);
    };
    V.Interface.cover = function(r) {
      if (r.id?.startsWith("culture-")) return /0[12]$/.test(r.id) ? "hair" : /0[5678]$/.test(r.id) ? r.id.endsWith("05") ? "food" : r.id.endsWith("06") ? "textiles" : "beliefs" : "textiles";
      return original.cover(r);
    };
    L.read = function(id, page = 0, returnTo = null) {
      original.read(id, page, returnTo);
      if (!id.startsWith("culture-")) return;
      if (page === 0 && returnTo && V.$("#reader-back")) V.$("#reader-back").textContent = "Voltar \xE0 consulta";
      const related = gallery.filter((g) => (g.readingIds || []).includes(id)), art = related.length ? related[Math.min(page, related.length - 1)] : null, paper = V.$(".reader-paper");
      if (art && paper) {
        const figure = document.createElement("figure");
        figure.className = "culture-reading-art";
        figure.innerHTML = V.Culture.art(art.asset || art.id, art.title) + `<figcaption>${esc(art.title)}</figcaption>`;
        const first = paper.children[1];
        if (first) {
          first.after(figure);
        } else paper.appendChild(figure);
      }
    };
    C.progressDetails = function(ctx, m, cam) {
      original.progress(ctx, m, cam);
      if (!V.state?.culture) return;
      const label = (x, y, text, index) => {
        C.prop(ctx, "culture", index, x * T - cam.x, y * T - cam.y, 36);
        ctx.fillStyle = "#f1dfb8";
        ctx.fillRect(x * T + 38 - cam.x, y * T + 12 - cam.y, 126, 22);
        V.Engine.text(ctx, text, x * T + 101 - cam.x, y * T + 27 - cam.y, "#315248", 9, "center");
      };
      if (m.id === "market") {
        if (V.state.sideQuests["culture-hair"]?.done) label(22, 12, "T\xC9CNICAS IDENTIFICADAS", 3);
        if (V.state.sideQuests["culture-wrap"]?.done) label(21, 6, "PE\xC7AS COM CONTEXTO", 20);
        if (V.state.sideQuests["culture-food"]?.done) label(5, 12, "NOMES E PREPAROS", 20);
      }
      if (m.id === "chapter-2" && V.state.sideQuests["culture-faith"]?.done) label(23, 10, "ENTREVISTA REVISADA", 17);
      if (["chapter-5", "room-5"].includes(m.id) && V.state.culture.design && V.state.sideQuests["culture-style"]?.done) {
        const x = (m.id === "chapter-5" ? 24 : 18) * T - cam.x, y = (m.id === "chapter-5" ? 10 : 4) * T - cam.y;
        ctx.save();
        ctx.translate(x, y);
        V.Culture.drawDesign(ctx, V.state.culture.design, 62, 60);
        ctx.restore();
      }
    };
    V.Atlas.signature = function(m) {
      return original.signature(m) + "|" + missions.map((q) => +!!V.state?.sideQuests?.[q.id]?.done).join("") + "|" + JSON.stringify(V.state?.culture?.design || null);
    };
  })();
});
