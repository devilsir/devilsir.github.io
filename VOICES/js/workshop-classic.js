/* Registered module: workshop-classic */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("workshop-classic", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function workshopClassic() {
    "use strict";
    const V = window.V, M = V.Minigames, U = V.WorkshopUI, T = V.Tutorials, esc = V.escape, on = (id, fn) => {
      const b = V.$("#" + id);
      if (b) b.onclick = fn;
    }, clone = (x) => JSON.parse(JSON.stringify(x));
    const names = { beat: "Beat Builder", timeline: "Timeline Repair", evidence: "Evidence Hunter", bias: "Spot the Bias", city: "City Builder", runner: "Word Runner", wires: "Mesa de som" };
    const projects = [{ id: "ramp", name: "Rotas acess\xEDveis", cost: 2, cat: "access", desc: "Rampa, sinaliza\xE7\xE3o leg\xEDvel e percurso cont\xEDnuo; a equipe precisa manter as rotas livres." }, { id: "bus", name: "Transporte para o centro", cost: 3, cat: "access", desc: "Conecta o bairro distante; frequ\xEAncia e hor\xE1rios continuam sujeitos a revis\xE3o." }, { id: "assembly", name: "Conselho de moradores", cost: 1, cat: "participation", desc: "Reuni\xF5es em hor\xE1rios alternados, com registro das prioridades e das decis\xF5es." }, { id: "archive", name: "Arquivo de hist\xF3rias vivas", cost: 2, cat: "representation", desc: "Moradores negros e ind\xEDgenas registram suas pr\xF3prias trajet\xF3rias e condi\xE7\xF5es de consulta." }, { id: "workshop", name: "Oficina e est\xFAdio aberto", cost: 2, cat: "representation", desc: "Um espa\xE7o para cria\xE7\xE3o musical, escrita e documenta\xE7\xE3o dos jovens da comunidade." }, { id: "signs", name: "Informa\xE7\xE3o em v\xE1rios formatos", cost: 1, cat: "access", desc: "Avisos com linguagem clara, contraste e formatos acess\xEDveis." }];
    const words = [{ pt: "mem\xF3ria", correct: "memory", other: ["music", "source"] }, { pt: "evid\xEAncia", correct: "evidence", other: ["festival", "library"] }, { pt: "escutar", correct: "listen", other: ["build", "dance"] }, { pt: "hist\xF3ria", correct: "history", other: ["street", "rhythm"] }, { pt: "comunidade", correct: "community", other: ["computer", "question"] }, { pt: "conhecimento", correct: "knowledge", other: ["backpack", "window"] }];
    M.makeSession = function(type, practice = false) {
      const l = T.ensure(), r = { id: practice ? "practice-" + type : "classic-" + (++l.classicSerial || (l.classicSerial = 1)), type, stage: 0, moves: 0, mistakes: 0, finished: false, feedback: "", inspected: [] };
      if (type === "timeline") r.order = V.content.timeline.map((e) => e.id).reverse();
      if (type === "evidence") r.selected = {};
      if (type === "bias") Object.assign(r, { context: false, answers: {}, response: false });
      if (type === "city") Object.assign(r, { selected: practice ? [] : (V.state.projects || []).slice(), phase: "plan", followup: "monthly" });
      if (type === "runner") {
        let deck = words;
        if (V.state.grade === 7) deck = [...words.slice(0, 3), { pt: "Ela escreveu \u2014 She \u2026", correct: "wrote", other: ["writes", "write"] }, { pt: "Eles aprenderam \u2014 They \u2026", correct: "learned", other: ["learns", "learning"] }, { pt: "Onde?", correct: "where", other: ["when", "who"] }];
        if (V.state.grade === 8) deck = [...words.slice(0, 3), { pt: "porque (motivo)", correct: "because", other: ["although", "but"] }, { pt: "mais forte", correct: "stronger", other: ["strongest", "strong"] }, { pt: "por\xE9m (contraste)", correct: "however", other: ["therefore", "because"] }];
        Object.assign(r, { deck: clone(practice ? words.slice(0, 1) : deck), selected: null, score: 0 });
      }
      if (type === "beat") Object.assign(r, { notes: Array.from({ length: practice ? 3 : this.opts.short ? 12 : 20 }, (_, i) => (i * 3 + Math.floor(i / 4)) % 4), score: 0 });
      if (type === "wires") r.ports = [0, 0, 0];
      return r;
    };
    M.classicRun = function(type = this.classicType) {
      return T.practice("classic", type) || T.ensure().sessions[this.classicKey || "classic:" + type + ":practice"];
    };
    M.beginClassic = function(type) {
      this.classicType = type;
      this.classicKey = "classic:" + type + ":" + (this.opts.chapter || "free") + (this.opts.finalPart !== void 0 ? ":" + this.opts.finalPart : "");
      const l = T.ensure();
      l.classicSerial = Math.max(0, Number(l.classicSerial) || 0);
      if (!l.sessions[this.classicKey] || l.sessions[this.classicKey].finished && !l.sessions[this.classicKey].resultPending) l.sessions[this.classicKey] = this.makeSession(type);
      V.Save.save();
      T.gate("classic:" + type, () => this.renderClassic(type), false);
    };
    const launch = M.launch.bind(M);
    M.launch = function(type, done, opts = {}) {
      if (type === "final") {
        this.done = done;
        this.opts = opts;
        this.finalSequence(done);
        return;
      }
      launch(type, done, opts);
      on("mini-start", () => {
        this.opts = { ...opts, assist: V.$("#mini-assist")?.checked ?? true };
        this.beginClassic(type);
      });
      const calm = V.$("#mini-assist");
      if (calm) calm.checked = true;
      const footer = V.$(".modal-footer"), b = document.createElement("button");
      b.className = "secondary";
      b.textContent = T.record("classic:" + type)?.running ? "Continuar tutorial" : "Rever como jogar";
      b.onclick = () => {
        this.opts = opts;
        this.classicType = type;
        this.classicKey = "classic:" + type + ":" + (opts.chapter || "free");
        T.open("classic:" + type, !!T.record("classic:" + type)?.completed);
      };
      footer?.prepend(b);
    };
    M.wires = function(done) {
      this.done = done;
      this.opts = { chapter: 1, wire: true };
      this.beginClassic("wires");
    };
    M.classicFrame = function(type, objective, body, actions = "") {
      const r = this.classicRun(type);
      U.render("classic:" + type, () => {
        V.UI.modal(names[type], T.active === "classic:" + type ? "TREINO GUIADO \xB7 PARTIDA PRESERVADA" : "DESAFIO DO ARQUIVO \xB7 PROGRESSO GUARDADO", `<p class="classic-status">${esc(objective)}</p><p id="classic-feedback" class="classic-status" role="status" aria-live="polite">${esc(r.feedback || "Voc\xEA pode observar, experimentar e revisar antes de concluir.")}</p>${body}`, actions + '<button id="classic-pause" class="secondary">Guardar e sair</button>', true);
        on("classic-pause", () => {
          V.Save.save();
          V.UI.close();
        });
        U.bind("classic:" + type);
      });
    };
    M.classicMessage = function(text, wrong = false) {
      const r = this.classicRun();
      r.feedback = text;
      if (wrong) r.mistakes++;
      const el = V.$("#classic-feedback");
      if (el) {
        el.textContent = text;
        el.dataset.kind = wrong ? "wrong" : "right";
        U.pulse(el);
      }
      U.sound(wrong ? "wrong" : "correct");
      V.Save.save();
    };
    const finish = M.finish.bind(M);
    M.presentClassicResult = function(r) {
      const callback = this.done;
      this.done = () => {
        if (!r.resultPending) return;
        r.resultPending = false;
        V.Save.save();
        callback?.();
      };
      return finish(r.summary.label, r.summary.text);
    };
    M.finish = function(label, text) {
      const type = this.classicType, r = this.classicRun(type);
      if (T.practice("classic", type)) {
        T.event("finish");
        return true;
      }
      if (r?.finished) return false;
      if (r) {
        r.finished = true;
        r.resultPending = true;
        r.summary = { label, text };
        V.Save.save();
        return this.presentClassicResult(r);
      }
      return finish(label, text);
    };
    M.renderClassic = function(type = this.classicType) {
      this.classicType = type;
      const r = this.classicRun(type);
      if (!r) return this.beginClassic(type);
      if (r.finished) return r.resultPending ? this.presentClassicResult(r) : this.beginClassic(type);
      if (type === "timeline") return this.timeline();
      if (type === "evidence") return this.evidence();
      if (type === "bias") return this.bias();
      if (type === "city") return this.city();
      if (type === "runner") return this.runnerCards();
      if (type === "beat") return this.beatCards();
      if (type === "wires") return this.wireCards();
    };
    M.timeline = function() {
      const r = this.classicRun("timeline"), events = r.order.map((id) => V.content.timeline.find((e) => e.id === id)).filter(Boolean), selected = events.find((e) => e.id === r.selected) || events[0], source = V.content.sources.find((s) => s.id === selected.source);
      this.classicFrame("timeline", "Organize os registros do mais antigo ao mais recente. Consulte o documento de cada ficha; uma data sempre se refere a um acontecimento e a um lugar.", `<div class="classic-grid"><div class="classic-order">${events.map((e, i) => `<article data-key="chron-${e.id}" class="${e.id === r.selected ? "selected" : ""}"><span>${i + 1}</span><div><h3>${esc(e.label)}</h3><p>${esc(e.pt)}</p><button data-classic-document="${e.id}" class="secondary">${r.inspected.includes(e.id) ? "\u2713 Rever " + e.date : "Consultar documento"}</button></div><div class="row"><button data-classic-move="${i}:-1" aria-label="Mover ${esc(e.label)} para antes" ${i === 0 ? "disabled" : ""}>\u2191</button><button data-classic-move="${i}:1" aria-label="Mover ${esc(e.label)} para depois" ${i === events.length - 1 ? "disabled" : ""}>\u2193</button></div></article>`).join("")}</div><aside class="culture-controls"><h3>${esc(selected.label)}</h3>${r.inspected.includes(selected.id) ? `<strong>${esc(selected.date)}</strong><p>${esc(selected.pt)}</p><a href="${esc(source?.url || "#")}" target="_blank" rel="noopener noreferrer">${esc(source?.name || "Refer\xEAncias do arquivo")} \u2197</a>` : "<p>Abra o documento desta ficha para consultar sua data e a fonte.</p>"}<p>Mali e Songhai s\xE3o contextos da \xC1frica Ocidental; Kongo \xE9 um contexto da \xC1frica Central. A sele\xE7\xE3o n\xE3o resume toda a hist\xF3ria africana.</p><button id="classic-hint" class="quiet">Pedir uma dica</button><button id="timeline-check" class="primary workshop-main">Conferir cronologia</button></aside></div>`);
      V.$$("[data-classic-document]").forEach((b) => b.onclick = () => {
        r.selected = b.dataset.classicDocument;
        if (!r.inspected.includes(r.selected)) r.inspected.push(r.selected);
        V.Save.save();
        this.timeline();
        T.event("document");
      });
      V.$$("[data-classic-move]").forEach((b) => b.onclick = () => {
        const [i, delta] = b.dataset.classicMove.split(":").map(Number), to = i + delta;
        [r.order[i], r.order[to]] = [r.order[to], r.order[i]];
        r.moves++;
        V.Save.save();
        this.timeline();
        T.event("reorder");
      });
      on("classic-hint", () => U.hint("classic-time", ["Leia os anos nas fontes e compare apenas dois registros vizinhos.", "Procure um par em que o ano da primeira ficha seja maior que o da segunda. Mover esse par aproxima a linha do tempo da ordem cronol\xF3gica.", () => {
        const idx = events.findIndex((e, i) => i && events[i - 1].year > e.year);
        return idx >= 0 ? "Mova \u201C" + events[idx].label + "\u201D para antes de \u201C" + events[idx - 1].label + "\u201D." : "A cronologia j\xE1 est\xE1 ordenada. Confira o contexto e conclua.";
      }], "#classic-feedback"));
      on("timeline-check", () => {
        const bad = events.findIndex((e, i) => i && events[i - 1].year > e.year);
        if (bad >= 0) return this.classicMessage("H\xE1 uma invers\xE3o entre as posi\xE7\xF5es " + bad + " e " + (bad + 1) + ". Compare os anos dessas duas fontes e use as setas para corrigir.", true);
        this.finish("As galerias t\xEAm uma hist\xF3ria!", "Os registros voltaram \xE0 ordem com seus contextos. Diferentes sociedades africanas t\xEAm trajet\xF3rias pr\xF3prias; a aboli\xE7\xE3o legal n\xE3o eliminou as desigualdades.");
      });
    };
    M.evidence = function() {
      const r = this.classicRun("evidence"), items = V.content.evidence, authors = items.map((e) => e.name);
      this.classicFrame("evidence", "Abra os documentos e relacione o trabalho descrito \xE0 pessoa respons\xE1vel. Compare a contribui\xE7\xE3o e o contexto antes de atribuir autoria.", `<div class="evidence-grid">${items.map((e, i) => `<article class="classic-card" data-key="dossier-${e.id}"><small>DOSSI\xCA ${i + 1}</small><h3>${esc(e.characteristic)}</h3>${e.documents.map((doc, j) => {
        const id = e.id + ":" + j;
        return `<button data-evidence-document="${id}" class="classic-answer">${r.inspected.includes(id) ? esc(doc) : "Abrir documento " + (j + 1)}</button>`;
      }).join("")}<label class="field">Autoria<select data-classic-author="${e.id}"><option value="">Escolha uma pessoa</option>${authors.map((name) => `<option ${r.selected[e.id] === name ? "selected" : ""}>${esc(name)}</option>`).join("")}</select></label></article>`).join("")}</div><div class="classic-actions"><button id="classic-hint" class="quiet">Pedir uma dica</button><button id="evidence-check" class="primary">Vincular evid\xEAncias</button></div>`);
      V.$$("[data-evidence-document]").forEach((b) => b.onclick = () => {
        if (!r.inspected.includes(b.dataset.evidenceDocument)) r.inspected.push(b.dataset.evidenceDocument);
        V.Save.save();
        this.evidence();
        T.event("document");
      });
      V.$$("[data-classic-author]").forEach((s) => s.onchange = () => {
        r.selected[s.dataset.classicAuthor] = s.value;
        V.Save.save();
        T.event("attribution");
      });
      on("classic-hint", () => U.hint("classic-evidence", ["Procure nos documentos o campo de atua\xE7\xE3o e o trabalho citado.", "Associe a contribui\xE7\xE3o espec\xEDfica, n\xE3o a apar\xEAncia do retrato ou uma palavra isolada.", () => {
        const item = items.find((e) => r.selected[e.id] !== e.name) || items[0];
        return "Os documentos de \u201C" + item.characteristic + "\u201D sustentam a atribui\xE7\xE3o a " + item.name + ".";
      }], "#classic-feedback"));
      on("evidence-check", () => {
        const bad = items.find((e) => r.selected[e.id] !== e.name);
        if (r.inspected.length < 3) return this.classicMessage("Abra ao menos tr\xEAs documentos antes de concluir. O texto aberto continua dispon\xEDvel enquanto voc\xEA escolhe a autoria.");
        if (bad) return this.classicMessage("O dossi\xEA \u201C" + bad.characteristic + "\u201D ainda precisa de uma atribui\xE7\xE3o compat\xEDvel com seus documentos. Revise esse conjunto.", true);
        this.finish("Autoria recuperada!", "Os documentos sustentam as contribui\xE7\xF5es de Katherine Johnson, Carolina Maria de Jesus e Andr\xE9 Rebou\xE7as. Atribuir autoria exige contexto e evid\xEAncias.");
      });
    };
    M.bias = function() {
      const r = this.classicRun("bias"), cases = V.content.biasCases, c = cases[r.stage];
      if (!c) return this.biasResponse();
      this.classicFrame("bias", `Mensagem ${r.stage + 1}/${cases.length} \xB7 investigue antes de compartilhar. Este caso pertence \xE0 fic\xE7\xE3o de New Harmony.`, `<div class="classic-grid"><article class="classic-card"><small>REDE NEW HARMONY \xB7 FIC\xC7\xC3O</small><h3>${esc(c.headline)}</h3><button id="open-context" class="secondary">${r.context ? "\u2713 Contexto consultado" : "Ouvir envolvidos e abrir contexto"}</button>${r.context ? `<p class="classic-status">${esc(c.context)}</p>` : "<p>Uma manchete n\xE3o \xE9 o registro completo.</p>"}</article><section>${r.context ? c.missing.map((answer, i) => `<button data-bias-answer="${i}" class="classic-answer" ${r.answers[r.stage] !== void 0 ? "disabled" : ""}>${i + 1} \xB7 ${esc(answer)}</button>`).join("") : "<p>As conclus\xF5es ficam dispon\xEDveis depois de consultar o contexto.</p>"}${r.answers[r.stage] !== void 0 ? `<p class="classic-status">${esc(c.explanation)}</p><button id="bias-next" class="primary">${r.stage === cases.length - 1 ? "Preparar resposta" : "Pr\xF3xima mensagem"}</button>` : ""}<button id="classic-hint" class="quiet">Pedir uma dica</button></section></div>`);
      on("open-context", () => {
        r.context = true;
        V.Save.save();
        this.bias();
        T.event("context");
      });
      V.$$("[data-bias-answer]").forEach((b) => b.onclick = () => {
        const ok = +b.dataset.biasAnswer === c.correct;
        r.moves++;
        if (!ok) return this.classicMessage("Essa conclus\xE3o vai al\xE9m do que o contexto permite. " + c.explanation, true);
        r.answers[r.stage] = c.correct;
        r.feedback = "\u2713 A conclus\xE3o respeita os registros e as pessoas envolvidas.";
        V.Save.save();
        this.bias();
        T.event("conclusion");
      });
      on("bias-next", () => {
        r.stage++;
        r.context = false;
        r.feedback = "";
        V.Save.save();
        this.bias();
      });
      on("classic-hint", () => U.hint("bias:" + r.stage, ["Separe o que foi dito na manchete do que foi verificado no contexto.", "Uma conclus\xE3o precisa ser sustentada pelo relato e pelos documentos; uma generaliza\xE7\xE3o sobre um grupo inteiro n\xE3o se sustenta por um caso isolado.", () => c.missing[c.correct]], "#classic-feedback"));
    };
    M.biasResponse = function() {
      const r = this.classicRun("bias");
      this.classicFrame("bias", "Prepare uma resposta que acolha a pessoa atingida e permita conferir as informa\xE7\xF5es. As duas a\xE7\xF5es abaixo podem se complementar.", '<button id="response-care" class="classic-answer">Acolher a pessoa, preservar o registro e buscar apoio na escola.</button><button id="response-source" class="classic-answer">Publicar fontes e uma corre\xE7\xE3o sem expor a pessoa atingida.</button>');
      on("response-care", () => {
        if (!T.active) V.state.flags.networkCare = true;
        this.finish("A rede ganhou contexto!", "A equipe combinou acolhimento, registro e busca de apoio. Ningu\xE9m precisa enfrentar discrimina\xE7\xE3o sozinho.");
      });
      on("response-source", () => {
        if (!T.active) V.state.flags.networkSources = true;
        this.finish("A rede ganhou contexto!", "A equipe publicou fontes e preservou a privacidade. O canal de corre\xE7\xF5es explica o que foi revisto e por qu\xEA.");
      });
    };
    M.city = function() {
      const r = this.classicRun("city"), spent = projects.filter((p) => r.selected.includes(p.id)).reduce((n, p) => n + p.cost, 0);
      if (r.phase === "review") {
        this.classicFrame("city", "Seu plano amplia possibilidades e mant\xE9m limites. Combine quando a comunidade vai avaliar o uso e as necessidades que ficaram de fora.", `<div class="classic-grid"><section>${projects.filter((p) => r.selected.includes(p.id)).map((p) => `<article class="classic-card"><h3>\u2713 ${p.name}</h3><p>${p.desc}</p></article>`).join("")}</section><aside class="culture-controls"><p>O or\xE7amento n\xE3o resolve todas as desigualdades. O plano precisa de manuten\xE7\xE3o e participa\xE7\xE3o na avalia\xE7\xE3o.</p><label class="field">Pr\xF3xima avalia\xE7\xE3o<select id="city-followup"><option value="monthly" ${r.followup === "monthly" ? "selected" : ""}>Em um m\xEAs, com relatos dos moradores</option><option value="quarterly" ${r.followup === "quarterly" ? "selected" : ""}>Em um trimestre, com acompanhamento do uso</option></select></label><button id="city-revise" class="secondary">Rever projetos</button><button id="city-confirm" class="primary">Construir e agendar revis\xE3o</button></aside></div>`);
        V.$("#city-followup").onchange = (e) => {
          r.followup = e.target.value;
          V.Save.save();
        };
        on("city-revise", () => {
          r.phase = "plan";
          this.city();
        });
        on("city-confirm", () => {
          if (!T.active) {
            V.state.projects = r.selected.slice();
            V.state.flags.cityFollowup = r.followup;
            V.World.maps["chapter-5"].cache = null;
          }
          this.finish("O bairro ganhou novos espa\xE7os!", "A comunidade mant\xE9m um registro das prioridades e uma avalia\xE7\xE3o agendada. Acesso e participa\xE7\xE3o exigem trabalho cont\xEDnuo.");
        });
        return;
      }
      this.classicFrame("city", "Distribua 8 unidades e inclua acesso, participa\xE7\xE3o e representa\xE7\xE3o. H\xE1 mais de uma combina\xE7\xE3o poss\xEDvel.", `<div class="budget-line"><strong>${8 - spent}/8 unidades dispon\xEDveis</strong><span>${r.selected.length} projetos selecionados</span></div><div class="project-grid">${projects.map((p) => `<button data-classic-project="${p.id}" class="project-card ${r.selected.includes(p.id) ? "selected" : ""}" aria-pressed="${r.selected.includes(p.id)}"><div><strong>${r.selected.includes(p.id) ? "\u2713 " : ""}${p.name}</strong><p>${p.desc}</p><small>${p.cost} unidade(s) \xB7 ${{ access: "acesso", participation: "participa\xE7\xE3o", representation: "representa\xE7\xE3o" }[p.cat]}</small></div></button>`).join("")}</div><div class="classic-actions"><button id="classic-hint" class="quiet">Pedir uma dica</button><button id="city-build" class="primary">Simular plano</button></div>`);
      V.$$("[data-classic-project]").forEach((b) => b.onclick = () => {
        const id = b.dataset.classicProject, p = projects.find((p2) => p2.id === id);
        if (r.selected.includes(id)) r.selected = r.selected.filter((x) => x !== id);
        else if (spent + p.cost <= 8) r.selected.push(id);
        else return this.classicMessage("O projeto custa " + p.cost + ", mas restam " + (8 - spent) + ". Voc\xEA pode retirar outra escolha sem perder o plano.");
        r.moves++;
        V.Save.save();
        this.city();
        T.event("project");
      });
      on("classic-hint", () => U.hint("classic-city", ["Observe que cada projeto atende a uma prioridade; tente cobrir os tr\xEAs grupos.", "Um plano com acesso e representa\xE7\xE3o ainda precisa permitir que os moradores participem das decis\xF5es. Preserve tamb\xE9m recursos para executar o que escolheu.", "Uma combina\xE7\xE3o poss\xEDvel \xE9 Rotas acess\xEDveis, Conselho de moradores e Arquivo de hist\xF3rias vivas: custa 5 e cobre as tr\xEAs prioridades."], "#classic-feedback"));
      on("city-build", () => {
        const cats = new Set(projects.filter((p) => r.selected.includes(p.id)).map((p) => p.cat));
        if (r.selected.length < 3 || cats.size < 3) return this.classicMessage("O plano ainda precisa de ao menos tr\xEAs projetos, cobrindo acesso, participa\xE7\xE3o e representa\xE7\xE3o. Releia quais prioridades faltam.", true);
        r.phase = "review";
        V.Save.save();
        this.city();
        T.event("simulation");
      });
    };
    M.runnerCards = function() {
      const r = this.classicRun("runner"), target = r.deck[r.stage];
      if (!target) return this.finish("Palavras recuperadas!", "Voc\xEA relacionou palavras do arquivo aos seus sentidos. PIX mant\xE9m o vocabul\xE1rio coletado dispon\xEDvel para consulta.");
      const choices = [target.correct, ...target.other], rotation = r.stage % 3, order = choices.slice(rotation).concat(choices.slice(0, rotation));
      this.classicFrame("runner", "Escolha uma faixa e confirme a palavra que corresponde ao pedido. As cartas esperam pela sua decis\xE3o.", `<div class="classic-keyword">Encontre: ${esc(target.pt)}</div><div class="runner-card-lanes" role="group" aria-label="Faixas de palavras">${order.map((word, i) => `<button data-runner-lane="${i}" class="${r.selected === i ? "selected" : ""}" aria-pressed="${r.selected === i}"><small>FAIXA ${i + 1}</small><strong lang="en">${esc(word)}</strong></button>`).join("")}</div><div class="classic-actions"><button id="classic-hint" class="quiet">Pedir uma dica</button><button id="runner-confirm" class="primary" ${r.selected === null ? "disabled" : ""}>Coletar palavra \xB7 Enter</button>${!T.active ? '<button id="runner-timed" class="quiet">Jogar nas faixas em movimento</button>' : ""}</div><p>${r.stage}/${r.deck.length} palavras recuperadas \xB7 sem limite de tempo</p>`);
      V.$$("[data-runner-lane]").forEach((b) => b.onclick = () => {
        r.selected = +b.dataset.runnerLane;
        r.moves++;
        V.Save.save();
        this.runnerCards();
        T.event("runner-select");
      });
      on("runner-confirm", () => {
        const chosen = order[r.selected];
        if (chosen !== target.correct) return this.classicMessage("A palavra \u201C" + chosen + "\u201D n\xE3o corresponde a \u201C" + target.pt + "\u201D neste pedido. Compare as outras faixas ou pe\xE7a uma dica.", true);
        r.feedback = "\u2713 " + chosen + " \u2014 " + target.pt;
        V.PixCollection.collect(chosen, "Palavras do arquivo");
        r.stage++;
        r.score++;
        r.selected = null;
        V.Save.save();
        this.runnerCards();
        T.event("runner-collect");
      });
      on("classic-hint", () => U.hint("runner:" + r.stage, ["Compare o sentido de cada palavra com o pedido, n\xE3o s\xF3 a grafia.", "Leia o pedido em portugu\xEAs e pense em uma situa\xE7\xE3o do arquivo em que essa palavra apareceria.", () => target.pt + " corresponde a " + target.correct + "."], "#classic-feedback"));
      on("runner-timed", () => {
        V.UI.close();
        this.startArcade("runner");
      });
      const body = V.$(".modal-body");
      body.onkeydown = (e) => {
        if (e.key === "Enter" && e.target === body) {
          e.preventDefault();
          V.$("#runner-confirm").click();
        }
      };
    };
    M.beatCards = function() {
      const r = this.classicRun("beat"), lane = r.notes[r.stage];
      if (lane === void 0) return this.finish("O festival voltou a soar!", "Voc\xEA restaurou o arranjo eletr\xF4nico original do jogo. A ficha cultural mant\xE9m os cr\xE9ditos e o contexto das tradi\xE7\xF5es que a cidade estuda.");
      this.classicFrame("beat", "Observe o sinal, ou\xE7a a pr\xE9via se quiser e acione a mesma faixa. O modo de pr\xE1tica espera; o arranjo \xE9 original de VOICES.", `<div class="beat-turn-score">${r.notes.map((n, i) => `<span class="${i < r.stage ? "done" : i === r.stage ? "current" : ""}">${["D", "F", "J", "K"][n]}</span>`).join("")}</div><div class="beat-key-lanes">${["D", "F", "J", "K"].map((k, i) => `<button data-beat-lane="${i}" class="${lane === i ? "target" : ""}" aria-label="Faixa ${k}${lane === i ? ", sinal atual" : ""}"><small>FAIXA</small><strong>${k}</strong><span>${lane === i ? "\u25BC AGORA" : "\u2014"}</span></button>`).join("")}</div><div class="classic-actions"><button id="beat-listen" class="secondary">Ouvir sinal atual</button>${!T.active ? '<button id="beat-timed" class="quiet">Ensaiar com notas em movimento</button>' : ""}</div><p>${r.stage}/${r.notes.length} conex\xF5es \xB7 D, F, J e K tamb\xE9m funcionam pelo teclado</p>`);
      V.$$("[data-beat-lane]").forEach((b) => b.onclick = () => {
        const selected = +b.dataset.beatLane;
        r.moves++;
        if (selected !== lane) return this.classicMessage("O sinal est\xE1 na faixa " + ["D", "F", "J", "K"][lane] + ". A sua tentativa n\xE3o avan\xE7ou a sequ\xEAncia; observe o marcador e tente outra vez.", true);
        V.Audio.drum(lane % 2 ? "hat" : "kick");
        r.score++;
        r.stage++;
        r.feedback = "\u2713 Faixa conectada. O pr\xF3ximo sinal j\xE1 est\xE1 dispon\xEDvel.";
        V.Save.save();
        this.beatCards();
        T.event("beat-hit");
      });
      on("beat-listen", () => {
        V.Audio.drum(lane % 2 ? "hat" : "kick");
        U.pulse(V.$('[data-beat-lane="' + lane + '"]'));
        T.event("beat-listen");
      });
      on("beat-timed", () => {
        V.UI.close();
        this.startArcade("beat");
      });
      V.$(".modal").onkeydown = (e) => {
        if (/INPUT|SELECT/.test(e.target.tagName)) return;
        const i = ["d", "f", "j", "k"].indexOf(e.key.toLowerCase());
        if (i >= 0) {
          e.preventDefault();
          e.stopPropagation();
          V.$('[data-beat-lane="' + i + '"]')?.click();
        }
      };
    };
    M.wireCards = function() {
      const r = this.classicRun("wires"), labels = ["Entrada \xB7 instrumentos", "Mesa \xB7 mixagem", "Sa\xEDda \xB7 alto-falantes"], ports = ["Mesa", "Instrumentos", "Alto-falantes"];
      this.classicFrame("wires", "Reconecte instrumentos \u2192 mesa \u2192 alto-falantes. Cada controle troca uma porta; voc\xEA pode testar sem perder as escolhas.", `<div class="three-cols">${labels.map((label, i) => `<article class="classic-card"><h3>${label}</h3><button data-wire-port="${i}" class="classic-answer">Porta ${r.ports[i] + 1} \xB7 ${ports[r.ports[i]]}</button></article>`).join("")}</div><div class="classic-actions"><button id="classic-hint" class="quiet">Pedir uma dica</button><button id="wire-check" class="primary">Testar circuito</button></div>`);
      V.$$("[data-wire-port]").forEach((b) => b.onclick = () => {
        const i = +b.dataset.wirePort;
        r.ports[i] = (r.ports[i] + 1) % 3;
        r.moves++;
        V.Save.save();
        this.wireCards();
        T.event("wire-port");
      });
      on("classic-hint", () => U.hint("wires", ["Siga o percurso do som: ele come\xE7a nos instrumentos, passa pela mesa e chega aos alto-falantes.", "Cada coluna representa uma etapa diferente; a primeira precisa receber instrumentos e a \xFAltima precisa enviar som aos alto-falantes.", "Uma liga\xE7\xE3o poss\xEDvel usa as portas 2, 1 e 3, nessa ordem."], "#classic-feedback"));
      on("wire-check", () => {
        if (r.ports.join(",") !== "1,0,2") return this.classicMessage("O som ainda n\xE3o segue o percurso inteiro. Compare a entrada, a mesa e a sa\xEDda; apenas as portas precisam mudar.", true);
        this.finish("Circuito restaurado", "Os instrumentos passam pela mesa de mixagem antes de chegar aos alto-falantes.");
      });
    };
    M.finalSequence = function(done) {
      this.done = done;
      this.opts = { chapter: 6 };
      const state = T.ensure().sessions["final:6"] ||= { step: 0, finished: false };
      const step = () => {
        if (state.step < 3) {
          this.launch(["beat", "timeline", "runner"][state.step], () => {
            state.step++;
            V.Save.save();
            step();
          }, { chapter: 6, short: true, finalPart: state.step });
          return;
        }
        this.done = done;
        this.opts = { chapter: 6 };
        this.classicType = null;
        V.UI.modal("O sistema precisa de pessoas", "REBOOT \xB7 REVIS\xC3O HUMANA", `<p>O pulso, os registros e as palavras foram recuperados. Como o arquivo ser\xE1 cuidado depois do reboot?</p><button id="final-review" class="classic-answer">Manter revis\xF5es, fontes documentadas e participa\xE7\xE3o das comunidades.</button><button id="final-automate" class="classic-answer">Entregar todas as decis\xF5es ao programa sem revis\xE3o dos moradores.</button><p id="final-feedback" role="status"></p>`);
        on("final-automate", () => {
          V.$("#final-feedback").textContent = "O sistema repetiu as lacunas de seu arquivo. Conferir a participa\xE7\xE3o, documentar as fontes e revisar decis\xF5es continua sendo trabalho da equipe.";
        });
        on("final-review", () => {
          V.state.flags.humanReview = true;
          state.finished = true;
          V.Save.save();
          finish("O arquivo est\xE1 pronto para o reboot.", "A equipe preparou o protocolo de fontes, participa\xE7\xE3o e revis\xE3o.");
        });
      };
      V.UI.modal("Reboot the Story", "TR\xCAS SISTEMAS \xB7 ETAPAS GUARDADAS", `<p>${state.step}/3 sistemas reconectados. Cada etapa conserva suas escolhas. O treino de cada mec\xE2nica continua dispon\xEDvel.</p>`, '<button id="final-start" class="primary">' + (state.step ? "Retomar reconstru\xE7\xE3o" : "Come\xE7ar reconstru\xE7\xE3o") + "</button>");
      on("final-start", step);
    };
    const common = (id) => ({ family: "classic", id, create: () => M.makeSession(id, true), render() {
      M.classicType = id;
      M.renderClassic(id);
    }, resume() {
      M.classicType = id;
      if (!M.classicRun(id)) M.beginClassic(id);
      else M.renderClassic(id);
    } });
    T.define("classic:timeline", { ...common("timeline"), steps: [{ title: "Consulte uma data", text: "Abra um documento. A data \xE9 uma informa\xE7\xE3o da fonte, e cada registro tem seu pr\xF3prio contexto.", target: "[data-classic-document]", allow: "[data-classic-document]", event: "document" }, { title: "Mova uma ficha", text: "Use uma seta para mover um registro uma posi\xE7\xE3o. Voc\xEA pode comparar anos sem arrastar cart\xF5es.", target: "[data-classic-move]", allow: "[data-classic-move]", event: "reorder", after: "A ficha mudou de posi\xE7\xE3o e o documento continua dispon\xEDvel. Na partida, organize toda a sequ\xEAncia antes de conferir." }] });
    T.define("classic:evidence", { ...common("evidence"), steps: [{ title: "Abra um registro do dossi\xEA", text: "O documento descreve uma contribui\xE7\xE3o. Leia antes de escolher quem a realizou.", target: "[data-evidence-document]", allow: "[data-evidence-document]", event: "document" }, { title: "Escolha uma atribui\xE7\xE3o", text: "Selecione uma pessoa no campo Autoria. Na partida, voc\xEA vai confrontar o conjunto antes de vincular as evid\xEAncias.", target: "[data-classic-author]", allow: "[data-classic-author]", event: "attribution", after: "Sua sele\xE7\xE3o ainda pode ser revista. O documento aberto permanece ao lado do campo de autoria." }] });
    T.define("classic:bias", { ...common("bias"), steps: [{ title: "Uma manchete n\xE3o basta", text: "Abra o contexto e escute os envolvidos antes de analisar as conclus\xF5es.", target: "#open-context", allow: "#open-context", event: "context" }, { title: "Compare as conclus\xF5es", text: "Escolha a alternativa que o contexto sustenta. Uma tentativa diferente explica o limite da conclus\xE3o e permite revisar.", target: "[data-bias-answer]", allow: "[data-bias-answer],#classic-hint", event: "conclusion", after: "A explica\xE7\xE3o ficou registrada. A pr\xF3xima mensagem s\xF3 aparece quando voc\xEA decidir continuar." }] });
    T.define("classic:city", { ...common("city"), steps: [{ title: "Escolha uma prioridade", text: "Selecione um projeto. O or\xE7amento muda na hora e voc\xEA pode retirar a escolha tocando nela novamente.", target: "[data-classic-project]", allow: "[data-classic-project]", event: "project" }, { title: "Pratique o planejamento", text: "Combine ao menos tr\xEAs projetos de acesso, participa\xE7\xE3o e representa\xE7\xE3o e simule o plano. As dicas s\xF3 oferecem uma combina\xE7\xE3o se voc\xEA pedir mais detalhes.", allow: "[data-classic-project],#city-build,#classic-hint", event: "simulation", after: "A simula\xE7\xE3o mostra o alcance e os limites do plano. A constru\xE7\xE3o e a revis\xE3o s\xE3o decis\xF5es posteriores." }] });
    T.define("classic:runner", { ...common("runner"), steps: [{ title: "Escolha uma faixa", text: "Este treino pede mem\xF3ria. Toque na faixa memory; as cartas ficam paradas para permitir a leitura.", target: '[data-runner-lane="0"]', allow: "[data-runner-lane]", event: "runner-select" }, { title: "Confirme a palavra", text: "Toque em Coletar palavra. A sele\xE7\xE3o pode mudar antes de confirmar; uma escolha incorreta permite tentar de novo.", target: "#runner-confirm", allow: "[data-runner-lane],#runner-confirm,#classic-hint", event: "finish", after: "A palavra de treino foi reconhecida. O modo com faixas em movimento tamb\xE9m fica dispon\xEDvel na partida." }] });
    T.define("classic:beat", { ...common("beat"), steps: [{ title: "Reconhe\xE7a o sinal", text: "A faixa atual tem um marcador. Toque em Ouvir sinal atual para ouvir uma pr\xE9via discreta; o som n\xE3o \xE9 necess\xE1rio para jogar.", target: "#beat-listen", allow: "#beat-listen", event: "beat-listen" }, { title: "Acione a mesma faixa", text: "Toque na faixa marcada ou pressione sua letra. O sinal espera pela a\xE7\xE3o; tocar outra faixa n\xE3o apaga o programa.", target: ".beat-key-lanes .target", allow: "[data-beat-lane]", event: "beat-hit", after: "A conex\xE3o foi registrada e o marcador passou ao pr\xF3ximo sinal." }, { title: "Pratique a sequ\xEAncia", text: "Complete os dois sinais restantes. Na partida, voc\xEA tamb\xE9m pode escolher o modo com notas em movimento.", allow: "[data-beat-lane],#beat-listen", event: "finish", after: "O arranjo de treino foi conclu\xEDdo sem moedas ou altera\xE7\xF5es no festival." }] });
    T.define("classic:wires", { ...common("wires"), steps: [{ title: "Uma porta por etapa", text: "Toque numa porta para alternar sua conex\xE3o. O nome acompanha o n\xFAmero para que a cor n\xE3o seja a \xFAnica pista.", target: "[data-wire-port]", allow: "[data-wire-port]", event: "wire-port" }, { title: "Teste o percurso", text: "Reconecte instrumentos \u2192 mesa \u2192 alto-falantes e teste o circuito. As dicas come\xE7am pelo percurso, sem entregar as tr\xEAs portas.", allow: "[data-wire-port],#wire-check,#classic-hint", event: "finish", after: "O circuito de treino ficou pronto. A restaura\xE7\xE3o da mesa da sua aventura continua separadamente." }] });
  })();
});
