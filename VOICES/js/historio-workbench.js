/* Registered module: historio-workbench */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("historio-workbench", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function historioWorkbench() {
    "use strict";
    const V = window.V, S = V.Story, D = V.AdventureData, U = V.WorkshopUI, T = V.Tutorials, esc = V.escape, on = (id, fn) => {
      const b = V.$("#" + id);
      if (b) b.onclick = fn;
    };
    V.AdventureArt["historiograph-v2"] = "assets/adventure/historiograph-mask.webp?v=20261103-mask-duo2";
    const deviceIcon = V.Progress.icon.bind(V.Progress);
    V.Progress.icon = function(id, size = 40) {
      return id === "historiograph" ? `<img class="adv-icon" src="assets/adventure/historiograph-mask.webp?v=20261103-mask-duo2" alt="" width="${size}" height="${size}">` : deviceIcon(id, size);
    };
    const tabs = { current: ["track", "Investiga\xE7\xE3o"], traces: ["records", "Vest\xEDgios"], compare: ["context", "Comparar fontes"], links: ["pulse", "Conex\xF5es"], history: ["intents", "Descobertas"] };
    const questions = { 1: "Que contribui\xE7\xF5es da equipe ainda precisam ser confirmadas com as pessoas envolvidas?", 2: "Como a legenda mudou entre uma vers\xE3o e outra, e o que a ficha de proced\xEAncia permite conferir?", 3: "Que tarefas de pesquisa, teste e registro ficaram fora da c\xF3pia p\xFAblica?", 4: "Quem teve acesso \xE0 mensagem, quem foi ouvido e o que a corre\xE7\xE3o ainda precisa explicar?", 5: "Quais trajetos, necessidades e hor\xE1rios ficaram fora do plano da comunidade?", 6: "Quem poder\xE1 consultar, questionar e corrigir o arquivo depois da restaura\xE7\xE3o?" };
    const H = V.Historio = {
      tab: "current",
      selected: null,
      activated: false,
      viewTabs: new WeakMap(),
      ensure() {
        const l = T.ensure();
        l.historio ||= { version: 1, selected: null, sound: false, motion: true, links: {} };
        return l.historio;
      },
      awake() {
        const s = S.ensure();
        return !!(s.awakened || s.met || V.state.completed.length);
      },
      available() {
        return this.awake() ? D.cases.filter((c) => V.Quests.isUnlocked(c.id) || V.state.completed.includes(c.id)) : [];
      },
      allowed(id) {
        return this.available().some((c) => c.id === +id);
      },
      current() {
        const all = this.available(), wanted = this.selected || this.ensure().selected;
        return all.find((c) => c.id === +wanted) || all.find((c) => !V.state.completed.includes(c.id)) || all.at(-1) || null;
      },
      found(c) {
        return (S.ensure().traces[c?.id] || []).filter((i) => Number.isInteger(i) && i >= 0 && i < 3);
      },
      documents(c) {
        if (T.active === "historio") return [{ id: 0, title: "Ficha integral \xB7 Cadernos da Pra\xE7a", kind: "Documento ficcional de treino", body: "Registro NH-014. A ficha preserva a autoria da oficina de Cec\xEDlia e do grupo do bairro. \xC9 o exemplo da primeira rasura examinada no museu.", author: "Oficina de Cec\xEDlia e grupo do bairro (fic\xE7\xE3o)", date: "Data n\xE3o anotada nesta ficha", origin: "Museu das Vozes \xB7 registro NH-014 (fic\xE7\xE3o)", context: "Exemplo did\xE1tico da primeira rasura. N\xE3o conta como vest\xEDgio de cap\xEDtulo." }, { id: 1, title: "Legenda abreviada \xB7 mesma pe\xE7a", kind: "Documento ficcional de treino", body: "A legenda abreviada deixa o campo de autoria vazio. Comparar as duas vers\xF5es mostra uma diverg\xEAncia; atribuir responsabilidade exige investiga\xE7\xE3o.", author: "Autoria ausente nesta vers\xE3o", date: "Data da altera\xE7\xE3o n\xE3o informada", origin: "Legenda da pe\xE7a NH-014 (fic\xE7\xE3o)", context: "Um campo ausente \xE9 uma diverg\xEAncia observ\xE1vel; ele n\xE3o identifica sozinho quem fez a altera\xE7\xE3o." }];
        if (!c) return [];
        const ref = V.content.sources.find((s) => s.id === c.source);
        return this.found(c).map((i) => {
          const t = c.traces[i];
          return { id: i, title: t[0], kind: t[1], body: t[2], author: i === 1 ? t[0] + " (personagem ficcional)" : i === 0 ? "N\xE3o identificada neste vest\xEDgio; confirmar com a equipe." : "Autoria n\xE3o transcrita; consultar a ficha da fonte original.", date: "Data n\xE3o transcrita no vest\xEDgio; permanece um limite da compara\xE7\xE3o.", origin: i === 2 ? ref?.name || "Refer\xEAncia indicada no cap\xEDtulo" : V.World.maps[c.map]?.name + " \xB7 arquivo ficcional de New Harmony", context: i === 2 ? "Refer\xEAncia hist\xF3rica que situa o tema; n\xE3o comprova os acontecimentos de New Harmony." : "Registro criado para a investiga\xE7\xE3o ficcional \u201C" + c.title + "\u201D.", url: i === 2 ? ref?.url : null };
        });
      },
      card(doc, side = "") {
        return `<article class="historio-document" data-key="document-${side}-${doc.id}"><span class="historio-kind ${/documentada/i.test(doc.kind) ? "documented" : "fiction"}">${esc(doc.kind)}</span><h3>${esc(doc.title)}</h3><dl><div><dt>Autoria</dt><dd>${esc(doc.author)}</dd></div><div><dt>Data</dt><dd>${esc(doc.date)}</dd></div><div><dt>Origem</dt><dd>${esc(doc.origin)}</dd></div><div><dt>Contexto</dt><dd>${esc(doc.context)}</dd></div></dl><p class="historio-transcript">${esc(doc.body)}</p>${doc.url ? `<a href="${esc(doc.url)}" target="_blank" rel="noopener noreferrer">Consultar a fonte original \u2197</a>` : ""}</article>`;
      },
      next(c) {
        if (!this.awake()) return { label: "Examinar as duas vers\xF5es no Museu das Vozes", map: "museum", object: "historiograph-awakening" };
        if (!c) return { label: "Rever a investiga\xE7\xE3o no di\xE1rio", native: true, chapter: null };
        const missing = [0, 1, 2].find((i) => !this.found(c).includes(i));
        if (missing !== void 0) return { label: "Procurar: " + c.traces[missing][0], map: c.map, object: "rasura-" + c.id + "-" + missing };
        if (!S.ensure().interpreted.includes(c.id)) return { label: "Comparar os tr\xEAs vest\xEDgios e formular uma conclus\xE3o", tab: "compare" };
        const native = V.ObjectiveGuide.main(c.id);
        return native ? { label: native.label, native: true, chapter: c.id } : { label: "Revisitar a regi\xE3o com a equipe", map: c.map };
      },
      track() {
        const c = this.current(), next = this.next(c);
        if (next.tab) {
          this.panel(next.tab);
          return;
        }
        if (V.Game.mode !== "explore") return;
        if (next.object) V.ObjectiveGuide.track(null, next.object, next.map);
        else if (next.native) V.ObjectiveGuide.track(next.chapter);
        else V.Progress.ensure().tracked = { destination: next.map };
        V.ObjectiveGuide.invalidate();
        V.Save.save();
        V.UI.close();
      },
      summary(c, a, l, tutorial) {
        const icon = V.TurnArt.icon, combat = V.Game.mode === "combat", awake = this.awake(), next = this.next(c);
        const target = combat ? null : S.echo(), delay = S.pulseDelay(), cost = Math.max(0, 6 - V.Progress.bonus("overload"));
        const action = (id, symbol, label, detail, extra = "") => `<button type="button" id="${id}" class="mask-quick-button" ${extra}>${icon(symbol)}<span><b>${label}</b><small>${esc(detail)}</small></span></button>`;
        const meter = (key, symbol, label, value) => `<label class="mask-meter ${key}"><span>${icon(symbol)}${label} <b>${Math.round(value)}/100</b></span><progress max="100" value="${value}"></progress></label>`;
        const pulseReason = combat ? "Dispon\xEDvel na explora\xE7\xE3o" : !awake ? "Aguardando o despertar" : delay > 0 ? "Pronto em " + Math.ceil(delay) + " s" : cost ? "+" + cost + " de sobrecarga" : "Pronto para usar";
        const nextAction = combat ? action("mask-compare-quick", "context", "Comparar fontes", "Consulta durante a batalha") : target ? action("mask-track-echo", "track", "Rastrear sinal", target.label) : action("mask-track-quick", next.tab ? "context" : "track", next.tab ? "Comparar fontes" : "Rastrear objetivo", next.label);
        return `<header class="historio-device mask-dashboard ${l.motion && !V.settings.reducedMotion ? "historio-motion" : ""}">
    <div class="historio-object mask-display">
      <img src="assets/adventure/historiograph-mask.webp?v=20261103-mask-duo2" alt="M\xE1scara ancestral ficcional com penas coloridas" width="200" height="200">
      <button id="historio-activate" class="quiet" ${tutorial ? "" : "hidden"} aria-pressed="${this.activated}">${this.activated ? "M\xE1scara desperta" : "Despertar m\xE1scara"}</button>
    </div>
    <div class="historio-device-title">
      <small data-mask-equipped>${esc(V.state.name)}</small>
      <h3>${c && awake ? esc(c.title) : awake ? "Investiga\xE7\xF5es da m\xE1scara" : "A m\xE1scara no museu"}</h3>
      <div class="historio-meters">${meter("resonance", "skills", "Resson\xE2ncia", a.resonance)}${meter("overload", "pulse", "Sobrecarga", a.overload)}</div>
      <div class="mask-resource-note">${a.resonance >= 60 ? "Converg\xEAncia dispon\xEDvel com a habilidade aprendida." : a.overload >= 85 ? "A sobrecarga pode causar corrup\xE7\xE3o no in\xEDcio do turno." : a.overload >= 60 ? "Habilidades custam mais foco." : ""}</div>
      <div class="mask-quick">${action("historio-pulse", "pulse", "Usar pulso", pulseReason, combat || !awake || delay > 0 ? "disabled" : "")}${nextAction}</div>
    </div>
  </header>`;
      },
      intro(tab = "current") {
        if (!V.state) return false;
        const l = this.ensure(), legacy = Object.keys(S.ensure().traces).length || S.ensure().interpreted.length;
        if (this.awake() && !T.record("historio") && !legacy) return T.open("historio");
        this.panel(tab);
        return true;
      },
      panel(tab) {
        tab = tab ?? this.viewTabs.get(V.Player.data) ?? "current";
        const aliases = { disturbances: "current", connections: "links", memories: "history", resonance: "current" };
        this.tab = aliases[tab] || tab;
        if (!tabs[this.tab]) this.tab = "current";
        if (V.Player.data) this.viewTabs.set(V.Player.data, this.tab);
        if (T.active === "historio") T.record("historio").practice.tab = this.tab;
        const a = V.Progress.ensure(), l = this.ensure(), c = this.current(), s = S.ensure(), docs = this.documents(c), tutorial = T.active === "historio";
        let body = "";
        if (!this.awake() && !tutorial) body = `<div class="historio-empty"><h3>O arquivo ainda n\xE3o despertou</h3><p>No museu, a ficha integral e a legenda abreviada da mesma pe\xE7a discordam sobre a autoria. Examine as duas vers\xF5es para iniciar a investiga\xE7\xE3o da m\xE1scara.</p><button id="historio-track" class="primary">Rastrear a primeira rasura</button></div>`;
        else if (this.tab === "current" && c) {
          const found = this.found(c), done = s.interpreted.includes(c.id), next = this.next(c);
          body = `<section class="historio-question"><span class="historio-kind fiction">INVESTIGA\xC7\xC3O FICCIONAL \xB7 CAP\xCDTULO ${c.id}</span><h3>${esc(c.title)}</h3><p>${esc(c.intro)}</p></section><div class="historio-current-grid"><section><h4>Evid\xEAncias encontradas \xB7 ${found.length}/3</h4><ol class="historio-evidence-list">${c.traces.map((t, i) => `<li class="${found.includes(i) ? "found" : ""}"><span>${found.includes(i) ? "\u2713" : "\u25CB"}</span><div><strong>${esc(t[0])}</strong><small>${found.includes(i) ? esc(t[1]) : "Ainda falta recuperar no cen\xE1rio"}</small></div>${found.includes(i) ? `<button data-historio-document="${i}" class="quiet">Examinar</button>` : `<button data-historio-track-trace="${i}" class="quiet">Rastrear</button>`}</li>`).join("")}</ol></section><aside class="historio-next"><small>PR\xD3XIMO PASSO POSS\xCDVEL</small><strong>${esc(next.label)}</strong><button id="historio-track" class="primary">${next.tab ? "Abrir compara\xE7\xE3o" : "Rastrear no mundo"}</button><span class="historio-kind question">PERGUNTA EM ABERTO</span><p>${esc(questions[c.id])}</p></aside></div>${done ? `<section class="historio-conclusion"><span class="historio-kind interpretation">INTERPRETA\xC7\xC3O SUSTENTADA PELOS VEST\xCDGIOS</span><p>${esc(c.explanation)}</p><small>Sustenta\xE7\xE3o: ${c.traces.map((t) => esc(t[0])).join(" \xB7 ")}. Limite: os registros locais pertencem \xE0 fic\xE7\xE3o; a refer\xEAncia hist\xF3rica tem contexto pr\xF3prio.</small></section>` : ""}`;
        } else if (this.tab === "traces") {
          body = `<h3>${tutorial ? "Registros de treino" : "Vest\xEDgios desta investiga\xE7\xE3o"}</h3>${docs.length ? '<div class="historio-record-grid">' + docs.map((doc) => this.card(doc, "archive")).join("") + "</div>" : '<div class="historio-empty"><p>Nenhum vest\xEDgio foi recuperado neste caso. O pr\xF3ximo passo aponta para um registro real do cen\xE1rio.</p><button id="historio-track" class="primary">Rastrear primeiro vest\xEDgio</button></div>'}`;
        } else if (this.tab === "compare") {
          if (docs.length < 2) body = `<div class="historio-empty"><h3>Compare quando houver dois registros</h3><p>${docs.length ? "Um vest\xEDgio j\xE1 foi recuperado. Procure outro para confrontar autoria, data, origem e contexto." : "Recupere os vest\xEDgios no cen\xE1rio. A m\xE1scara conserva o que foi encontrado e n\xE3o inventa documentos para preencher lacunas."}</p><button id="historio-track" class="primary">Rastrear registro que falta</button></div>`;
          else {
            const ui = tutorial ? T.record("historio").practice : l;
            ui.left = docs.some((d) => d.id === ui.left) ? ui.left : docs[0].id;
            ui.right = docs.some((d) => d.id === ui.right) && ui.right !== ui.left ? ui.right : docs.find((d) => d.id !== ui.left).id;
            const pick = (name, value) => `<label class="field">${name === "left" ? "Documento A" : "Documento B"}<select id="historio-${name}">${docs.map((d) => `<option value="${d.id}" ${d.id === value ? "selected" : ""}>${esc(d.title)}</option>`).join("")}</select></label>`;
            body = `<div class="historio-comparison-selects">${pick("left", ui.left)}${pick("right", ui.right)}</div><div class="historio-comparison">${this.card(docs.find((d) => d.id === ui.left), "left")}${this.card(docs.find((d) => d.id === ui.right), "right")}</div><div class="historio-comparison-note"><span class="historio-kind question">O QUE A COMPARA\xC7\xC3O PERMITE?</span><p>${tutorial ? "As duas vers\xF5es discordam na autoria. Isso sustenta investigar a diferen\xE7a; n\xE3o prova sozinho quem alterou a legenda." : "Compare os campos e os limites. Uma fonte hist\xF3rica situa o tema; um testemunho ficcional esclarece a a\xE7\xE3o na cidade, sem representar todas as perspectivas."}</p><button id="historio-link" class="secondary">Registrar conex\xE3o de trabalho</button></div>${!tutorial && V.Game.mode === "explore" && c && this.found(c).length === 3 ? this.conclusionHTML(c) : ""}`;
          }
        } else if (this.tab === "links") {
          const linked = l.links[c?.id] || [], found = this.found(c);
          body = `<h3>Como os registros se relacionam</h3><p>Uma conex\xE3o de trabalho indica o que comparar; uma conclus\xE3o exige evid\xEAncias suficientes e revis\xE3o.</p><div class="historio-link-chain">${(tutorial ? docs : c?.traces.map((t, i) => ({ id: i, title: t[0], body: found.includes(i) ? t[2] : null })) || []).map((doc, i) => `<article class="${doc.body ? "known" : "unknown"}"><span>0${i + 1}</span><h4>${esc(doc.title)}</h4><p>${doc.body ? esc(doc.body) : "Ainda n\xE3o recuperado. O conte\xFAdo ser\xE1 mostrado ap\xF3s a explora\xE7\xE3o."}</p></article>`).join("")}</div>${linked.length ? `<ul class="historio-links-list">${linked.map((link) => `<li><span class="historio-kind interpretation">${s.interpreted.includes(c.id) ? "CONEX\xC3O REVISADA" : "CONEX\xC3O DE TRABALHO"}</span>${esc(c.traces[link[0]][0])} \u2194 ${esc(c.traces[link[1]][0])}</li>`).join("")}</ul>` : '<p class="historio-empty">Nenhuma conex\xE3o de trabalho registrada. Abra Compara\xE7\xE3o de fontes para escolher dois registros.</p>'}<button id="historio-open-compare" class="primary">Comparar registros</button>`;
        } else if (this.tab === "history") {
          const entries = T.ensure().discoveries.filter((e) => this.allowed(e.caseId)), legacy = this.available().flatMap((c2) => this.found(c2).filter((i) => !entries.some((e) => e.key === "trace-" + c2.id + "-" + i)).map((i) => ({ key: "legacy-" + c2.id + "-" + i, caseId: c2.id, title: c2.traces[i][0], when: "Recuperado antes desta atualiza\xE7\xE3o" })));
          body = `<h3>Hist\xF3rico de descobertas</h3><div class="historio-discoveries">${entries.slice().reverse().concat(legacy).map((e) => `<article data-key="discovery-${e.key}"><span>\u25C7</span><div><small>${esc(e.when)}</small><strong>${esc(e.title)}</strong><p>${esc(D.cases[e.caseId - 1].title)}</p></div><button data-historio-case="${e.caseId}" class="quiet">Revisitar</button></article>`).join("") || "<p>As pr\xF3ximas descobertas registrar\xE3o o dia da cidade e a evid\xEAncia recuperada. O progresso anterior continua nas investiga\xE7\xF5es.</p>"}</div>`;
        }
        const key = "historio";
        U.render(key, () => {
          V.UI.modal("Histori\xF3grafo Ancestral", "M\xC1SCARA ANCESTRAL", `${tutorial ? '<div id="lesson-panel"></div>' : ""}<div class="historio-shell">${this.summary(c, a, l, tutorial)}<nav class="historio-tabs" aria-label="Se\xE7\xF5es do Histori\xF3grafo">${Object.entries(tabs).map(([id, [icon, label]]) => `<button data-historio-tab="${id}" class="${this.tab === id ? "active" : ""}" aria-current="${this.tab === id ? "page" : "false"}">${V.TurnArt.icon(icon)}<span>${label}</span></button>`).join("")}</nav>${this.available().length ? `<label class="field historio-case-select">Investiga\xE7\xE3o<select id="historio-case">${this.available().map((item) => `<option value="${item.id}" ${c?.id === item.id ? "selected" : ""}>${item.id} \xB7 ${esc(item.title)}</option>`).join("")}</select></label>` : ""}<div class="historio-main" id="historio-main">${body}</div><p id="historio-feedback" role="status" class="historio-inline-feedback"></p><details class="historio-settings"><summary>Prefer\xEAncias e funcionamento</summary><p class="historio-mask-origin">Origem na fic\xE7\xE3o: Costa do Marfim \xB7 m\xE1scara de fantasia de VOICES.</p><p>O pulso procura rasuras in\xE9ditas pr\xF3ximas; n\xE3o interpreta fontes. Sobrecarga acima de 60 aumenta o custo de foco; acima de 85 pode afetar o in\xEDcio do turno. Descansar com a equipe reduz a Sobrecarga.</p><label class="toggle"><input id="historio-sound" type="checkbox" ${l.sound ? "checked" : ""}>Som discreto da m\xE1scara</label><label class="toggle"><input id="historio-motion" type="checkbox" ${l.motion ? "checked" : ""}>Anima\xE7\xF5es de ativa\xE7\xE3o e conex\xE3o</label><p>A op\xE7\xE3o global de movimento reduzido e o volume de efeitos sempre t\xEAm prioridade.</p><div class="row"><button id="historio-rest" class="secondary">Pausa com a equipe</button></div></details></div>`, `${!tutorial ? '<button id="lesson-review" class="secondary">' + (T.record("historio")?.running ? "Continuar tutorial" : "Rever como jogar") + "</button>" : ""}<button id="historio-close" class="quiet">Voltar \xE0 aventura</button>`, true);
          V.$(".modal").classList.add("historio-modal");
        });
        on("lesson-review", () => T.open("historio", !!T.record("historio")?.completed));
        on("historio-close", () => V.UI.close());
        on("historio-activate", () => {
          this.activated = true;
          const button = V.$("#historio-activate");
          button.textContent = "M\xE1scara desperta";
          button.setAttribute("aria-pressed", "true");
          V.$(".historio-object").classList.add("active");
          if (l.sound) U.sound("observe");
          if (l.motion) U.pulse(V.$(".historio-object"));
          T.event("device-activate");
        });
        for (const b of V.$$("[data-historio-tab]")) {
          b.onclick = () => {
            this.panel(b.dataset.historioTab);
            T.event("device-tab", { tab: b.dataset.historioTab });
          };
        }
        const picker = V.$("#historio-case");
        if (picker) picker.onchange = ({ target }) => {
          if (!this.allowed(+target.value)) return;
          this.selected = +target.value;
          l.selected = this.selected;
          V.Save.save();
          this.panel(this.tab);
        };
        on("historio-track", () => this.track());
        on("mask-track-quick", () => this.track());
        on("mask-compare-quick", () => this.panel("compare"));
        on("mask-track-echo", () => {
          if (S.trackEcho()) V.UI.close();
        });
        on("historio-pulse", () => {
          V.UI.close();
          S.pulse();
        });
        on("historio-rest", () => {
          if (V.Game.mode !== "explore") return;
          V.Progress.rest();
          this.panel(this.tab);
        });
        for (const b of V.$$("[data-historio-track-trace]")) b.onclick = () => {
          if (V.Game.mode !== "explore") return;
          V.ObjectiveGuide.track(null, "rasura-" + c.id + "-" + b.dataset.historioTrackTrace, c.map);
          V.UI.close();
        };
        for (const b of V.$$("[data-historio-document]")) b.onclick = () => {
          l.left = +b.dataset.historioDocument;
          this.panel("traces");
        };
        for (const b of V.$$("[data-historio-case]")) b.onclick = () => {
          if (!this.allowed(+b.dataset.historioCase)) return;
          this.selected = +b.dataset.historioCase;
          this.panel("current");
        };
        for (const side of ["left", "right"]) {
          const select = V.$("#historio-" + side);
          if (!select) continue;
          select.onchange = ({ target }) => {
            const ui = tutorial ? T.record("historio").practice : l;
            ui[side] = +target.value;
            V.Save.save();
            this.panel("compare");
            T.event("device-source");
          };
        }
        on("historio-link", () => {
          if (V.Game.mode === "combat") return;
          if (!tutorial) {
            const pair = [l.left, l.right].sort(), links = l.links[c.id] ||= [];
            if (!links.some((link) => link.join(",") === pair.join(","))) links.push(pair);
            V.Save.save();
          }
          V.$("#historio-feedback").textContent = "Conex\xE3o de trabalho registrada. Os limites dos dois registros continuam vis\xEDveis.";
          if (l.sound) U.sound("observe");
          if (l.motion) U.pulse(V.$(".historio-comparison"));
          T.event("device-link");
        });
        on("historio-open-compare", () => this.panel("compare"));
        for (const [key2, id] of [["sound", "historio-sound"], ["motion", "historio-motion"]]) {
          V.$("#" + id).onchange = ({ target }) => {
            l[key2] = target.checked;
            V.Save.save();
          };
        }
        for (const b of V.$$("[data-historio-answer]")) b.onclick = () => this.interpret(c, +b.dataset.historioAnswer);
        for (const b of V.$$("[data-historio-choice]")) b.onclick = () => this.choose(c, +b.dataset.historioChoice);
        if (V.Game.mode === "combat") {
          for (const el of V.$$("#historio-rest,#historio-track,#lesson-review,#historio-link,[data-historio-track-trace]")) el.disabled = true;
        }
        T.decorate();
      },
      conclusionHTML(c) {
        const s = S.ensure(), done = s.interpreted.includes(c.id), choice = s.choices[c.id];
        return `<section class="historio-reasoning"><h3>${esc(c.question)}</h3>${done ? `<p class="historio-conclusion">\u2713 ${esc(c.explanation)}</p><small>Sustenta\xE7\xE3o: ${c.traces.map((t) => esc(t[0])).join(" \xB7 ")}.</small><h4>Como cuidar dos registros?</h4>${c.choice.map((text, i) => `<button data-historio-choice="${i}" class="classic-answer" aria-pressed="${choice === i}">${choice === i ? "\u2713 " : ""}${esc(text)}</button>`).join("")}` : c.options.map((text, i) => `<button data-historio-answer="${i}" class="classic-answer">${String.fromCharCode(65 + i)} \xB7 ${esc(text)}</button>`).join("")}<p id="historio-answer-feedback" class="historio-inline-feedback" role="status"></p><p class="historio-limit">Limite da conclus\xE3o: a documenta\xE7\xE3o hist\xF3rica situa o tema; os acontecimentos, personagens e altera\xE7\xF5es de New Harmony s\xE3o ficcionais.</p></section>`;
      },
      interpret(c, index) {
        if (!this.allowed(c.id) || this.found(c).length !== 3) return false;
        const s = S.ensure(), a = V.Progress.ensure();
        if (index !== c.correct) {
          V.$("#historio-answer-feedback").textContent = "Essa conclus\xE3o n\xE3o \xE9 sustentada pelo conjunto. Compare a atribui\xE7\xE3o local, o relato de quem participou e o contexto da refer\xEAncia hist\xF3rica.";
          U.sound("wrong");
          return false;
        }
        if (!s.interpreted.includes(c.id)) {
          s.interpreted.push(c.id);
          V.Progress.reward("interpret-" + c.id, 130, { tea: 1 });
          a.resonance = Math.min(100, a.resonance + 15);
          V.Save.save();
        }
        this.panel("compare");
        return true;
      },
      choose(c, index) {
        const s = S.ensure(), a = V.Progress.ensure();
        if (!this.allowed(c.id) || !s.interpreted.includes(c.id) || ![0, 1].includes(index)) return false;
        const first = !Object.hasOwn(s.choices, c.id);
        s.choices[c.id] = index;
        if (first) {
          a.resonance = Math.min(100, a.resonance + (index ? 25 : 15));
          a.overload = V.clamp(a.overload + (index ? 12 : -8), 0, 100);
          V.Progress.reward("choice-" + c.id, 45);
        }
        V.Save.save();
        V.ObjectiveGuide.invalidate();
        this.panel("compare");
        V.$("#historio-feedback").textContent = "Decis\xE3o registrada. Voc\xEA pode rev\xEA-la com a equipe sem receber outra recompensa.";
        return true;
      }
    };
    S.device = (tab) => H.panel(tab);
    S.case = function(id) {
      if (!H.allowed(id)) {
        H.panel("current");
        return false;
      }
      H.selected = +id;
      H.panel("compare");
      return true;
    };
    const reward = V.Progress.reward.bind(V.Progress);
    V.Progress.reward = function(key, ...args) {
      const ok = reward(key, ...args), match = /^(trace|interpret|choice)-(\d+)(?:-(\d+))?$/.exec(key);
      if (ok && match && !T.active) {
        const id = +match[2], c = D.cases[id - 1], clock = this.ensure().clock;
        if (c && !T.ensure().discoveries.some((e) => e.key === key)) T.ensure().discoveries.push({ key, caseId: id, title: match[1] === "trace" ? c.traces[+match[3]]?.[0] : match[1] === "interpret" ? "Conclus\xE3o revista com os vest\xEDgios" : "Decis\xE3o sobre acesso aos registros", when: "Dia " + clock.day + " \xB7 " + String(Math.floor(clock.hour)).padStart(2, "0") + "h" + String(Math.floor(clock.hour % 1 * 60)).padStart(2, "0") });
      }
      return ok;
    };
    T.define("historio", { family: "historio", id: "device", create: () => ({ left: 0, right: 1 }), render() {
      H.panel(T.record("historio").step === 0 ? "current" : T.record("historio").practice.tab || "current");
    }, resume() {
      H.panel(H.tab);
    }, steps: [{ title: "Desperte a m\xE1scara ancestral", text: "Desperte a m\xE1scara. Ela re\xFAne vest\xEDgios; autoria, origem e contexto continuam necess\xE1rios para investigar.", target: "#historio-activate", allow: "#historio-activate", event: "device-activate", after: "A m\xE1scara despertou. Seus medidores acompanham Resson\xE2ncia e Sobrecarga; PIX continua com o vocabul\xE1rio." }, { title: "Entenda o problema atual", text: "Abra Investiga\xE7\xE3o atual. O painel separa o problema, o que foi encontrado, o que falta e o pr\xF3ximo passo poss\xEDvel.", target: '[data-historio-tab="current"]', allow: '[data-historio-tab="current"]', event: "device-tab", test: (d) => d.tab === "current", after: "S\xF3 investiga\xE7\xF5es liberadas aparecem no seletor. Os conte\xFAdos n\xE3o encontrados continuam ocultos." }, { title: "Veja o que um registro conserva", text: "Abra Vest\xEDgios recuperados. Neste tutorial usamos apenas os dois exemplos ficcionais da primeira rasura, sem acrescent\xE1-los ao cap\xEDtulo.", target: '[data-historio-tab="traces"]', allow: '[data-historio-tab="traces"]', event: "device-tab", test: (d) => d.tab === "traces", after: "Autoria, data, origem e contexto ficam expl\xEDcitos. Uma data ausente permanece identificada como limite." }, { title: "Compare duas vers\xF5es", text: "Abra Compara\xE7\xE3o de fontes. A ficha integral e a legenda abreviada ser\xE3o mostradas lado a lado, ou uma ap\xF3s a outra no celular.", target: '[data-historio-tab="compare"]', allow: '[data-historio-tab="compare"]', event: "device-tab", test: (d) => d.tab === "compare" }, { title: "Relacione sem transformar hip\xF3tese em certeza", text: "Registre uma conex\xE3o de trabalho. A diverg\xEAncia na autoria abre uma investiga\xE7\xE3o; sozinha, ela n\xE3o identifica quem alterou a legenda.", target: "#historio-link", allow: "#historio-link,#historio-left,#historio-right", event: "device-link", after: "A conex\xE3o de treino n\xE3o conclui cap\xEDtulos e n\xE3o concede experi\xEAncia. Na aventura, as conclus\xF5es exigem os tr\xEAs vest\xEDgios." }, { title: "Conhe\xE7a o hist\xF3rico", text: "Abra Descobertas. Os novos registros conservam o dia da cidade; os vest\xEDgios de saves antigos continuam acess\xEDveis.", target: '[data-historio-tab="history"]', allow: '[data-historio-tab="history"]', event: "device-tab", test: (d) => d.tab === "history", after: "Voc\xEA pode rever esta introdu\xE7\xE3o pelo bot\xE3o Rever como jogar. Agora a investiga\xE7\xE3o retoma seus registros reais." }] });
  })();
});
