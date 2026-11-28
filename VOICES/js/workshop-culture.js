/* Registered module: workshop-culture */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("workshop-culture", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function workshopCulture() {
    "use strict";
    const V = window.V, K = V.CultureChallenges, U = V.WorkshopUI, T = V.Tutorials, D = V.CultureChallengeData, esc = V.escape, copy = (x) => JSON.parse(JSON.stringify(x)), on = (id, fn) => {
      const b = V.$("#" + id);
      if (b) b.onclick = fn;
    }, patterns = ["AB", "AABB", "ABCD", "ABBA", "CDDC", "AACC"];
    const actualRun = K.run.bind(K);
    K.run = function(id = this.active) {
      return T.practice("culture", id) || actualRun(id);
    };
    const show = K.show.bind(K);
    K.show = function(id = this.active) {
      if (this.creating) return true;
      const r = this.run(id);
      if (!r || r.finished) return this.open(id);
      this.active = id;
      return U.render("culture:" + id, () => {
        this[id]();
        U.bind("culture:" + id);
        return true;
      });
    };
    const start = K.start.bind(K);
    K.start = function(id) {
      this.creating = true;
      try {
        start(id);
      } finally {
        this.creating = false;
      }
      const key = "culture:" + id;
      return T.gate(key, () => this.show(id), !!actualRun(id)?.moves || !!this.ensure().completed[id]);
    };
    const open = K.open.bind(K);
    K.open = function(id) {
      const result = open(id);
      if (!result) return result;
      const footer = V.$(".modal-footer"), button = document.createElement("button"), record = T.record("culture:" + id);
      button.id = "culture-intro-tutorial";
      button.className = "secondary";
      button.textContent = record?.running ? "Continuar tutorial" : "Rever como jogar";
      button.onclick = () => T.open("culture:" + id, !!record?.completed);
      footer.prepend(button);
      return result;
    };
    K.frame = function(body, footer = "") {
      const r = this.run(), g = this.game(r.game), s = g.stages[r.stage], key = "culture:" + r.game, tutorial = T.active === key;
      V.UI.modal(g.title, tutorial ? "TREINO GUIADO \xB7 SUA PARTIDA PERMANECE GUARDADA" : `ETAPA ${r.stage + 1}/${g.stages.length} \xB7 ${s.title}`, `<div id="culture-game" data-game="${r.game}" class="culture-game workshop-game">${U.tools(key)}<div class="workshop-objective"><span>${tutorial ? "PR\xC1TICA" : r.stage + 1 + " / " + g.stages.length}</span><p>${esc(tutorial ? "Experimente os controles. O treino n\xE3o altera a partida nem concede moedas." : s.context)}</p></div><p id="culture-feedback" class="culture-feedback" role="status" aria-live="polite">${esc(r.feedback || "Observe, experimente e confira o resultado.")}</p>${body}<details class="culture-context"><summary>Contexto cultural e fontes</summary>${this.source([s.source || g.sources[0]])}<p>${esc(g.note)}</p></details></div>`, footer + '<button id="culture-pause" class="secondary">Guardar e sair</button>', true);
      V.$(".modal").classList.add("culture-modal");
      on("culture-pause", () => {
        this.token++;
        V.Save.save();
        V.UI.close();
      });
      V.UI.onClose = () => {
        this.token++;
        clearTimeout(this.owareTimer);
        clearTimeout(this.stageTimer);
        this.animating = false;
      };
    };
    K.commit = function(refresh = true) {
      V.Save.save();
      V.Game.updateHUD();
      if (refresh) this.show();
    };
    const advance = K.advance.bind(K), finish = K.finish.bind(K);
    K.advance = function() {
      return T.active === "culture:" + this.active ? T.next() : advance();
    };
    K.finish = function() {
      return T.active === "culture:" + this.active ? T.event("finish") : finish();
    };
    const target = K.loomTarget.bind(K);
    K.loomTarget = function(r, row) {
      return r.practiceRows ? this.loomOutput(...r.practiceRows[row]) : target(r, row);
    };
    const rowHTML = (letters, extra = "") => `<div class="loom-row ${extra}">${letters.map((v, i) => `<span class="thread-${v}" data-key="thread-${i}" aria-label="Fio ${i + 1}: ${v || "n\xE3o tecido"}">${v || "\xB7"}</span>`).join("")}</div>`;
    K.loom = function() {
      const r = this.run(), d = r.data, done = d.woven.length >= 4, row = Math.min(3, d.woven.length), output = this.loomOutput(d.pattern, d.offset, d.reverse), expected = this.loomTarget(r, row);
      this.frame(`<div class="loom-workbench"><section class="loom-board"><div class="loom-board-head"><h3>Modelo</h3><h3>Seu tecido \xB7 ${d.woven.length}/4</h3></div>${[0, 1, 2, 3].map((i) => `<div class="loom-compare ${i === row && !done ? "current" : ""}" data-key="woven-${i}"><button data-loom-model="${i}" class="loom-model" aria-label="Examinar modelo da linha ${i + 1}">${rowHTML(this.loomTarget(r, i))}</button>${rowHTML(d.woven[i] || Array(8).fill(""), d.woven[i] ? "woven" : "empty")}</div>`).join("")}<p class="muted">A dourado \xB7 B azul \xB7 C coral \xB7 D verde. Letras e cores identificam os fios.</p></section><aside class="culture-controls loom-control-panel"><h3>${done ? "Faixa tecida" : "Linha " + (row + 1) + " \xB7 prepare a lan\xE7adeira"}</h3><label class="field">Motivo<select id="loom-pattern" ${done ? "disabled" : ""}>${patterns.map((p) => `<option value="${p}" ${p === d.pattern ? "selected" : ""}>${p.split("").join(" \xB7 ")}</option>`).join("")}</select></label><div class="loom-transform"><label class="field">Deslocar in\xEDcio<select id="loom-offset" ${done ? "disabled" : ""}>${[0, 1, 2, 3].map((i) => `<option value="${i}" ${i === d.offset ? "selected" : ""}>${i} ${i === 1 ? "posi\xE7\xE3o" : "posi\xE7\xF5es"}</option>`).join("")}</select></label><label class="toggle"><input id="loom-mirror" type="checkbox" ${d.reverse ? "checked" : ""} ${done ? "disabled" : ""}>Espelhar</label></div><div class="loom-live-preview"><small>PR\xC9VIA \xB7 ${Math.ceil(8 / d.pattern.length)} REPETI\xC7\xD5ES</small>${rowHTML(output)}<small>MODELO DA LINHA ${row + 1}</small>${rowHTML(expected)}</div><button id="loom-preview" class="secondary" ${done ? "disabled" : ""}>Visualizar a repeti\xE7\xE3o</button>${done ? '<button id="culture-next" class="primary">Registrar faixa e continuar</button>' : '<button id="loom-weave" class="primary workshop-main">Passar a lan\xE7adeira</button>'}<button id="loom-hint" class="quiet" ${done ? "disabled" : ""}>Pedir uma dica</button></aside></div>`);
      V.$$("[data-loom-model]").forEach((b) => b.onclick = () => {
        r.feedback = "O modelo da linha " + (+b.dataset.loomModel + 1) + " \xE9 " + this.loomTarget(r, +b.dataset.loomModel).join(" \xB7 ") + ". A pr\xF3xima linha a tecer est\xE1 destacada.";
        T.event("model");
        this.feedback(r.feedback);
      });
      for (const [id, key] of [["loom-pattern", "pattern"], ["loom-offset", "offset"], ["loom-mirror", "reverse"]]) {
        const el = V.$("#" + id);
        el.onchange = (e) => {
          d[key] = key === "reverse" ? e.target.checked : key === "offset" ? +e.target.value : e.target.value;
          r.feedback = "A pr\xE9via mudou; nenhuma linha foi tecida ainda.";
          this.commit();
          T.event(key, { value: d[key] });
          U.pulse(V.$(".loom-live-preview"));
        };
      }
      on("loom-preview", () => {
        U.pulse(V.$(".loom-live-preview"));
        r.feedback = "O motivo " + d.pattern.split("").join(" \xB7 ") + " se repete at\xE9 ocupar oito fios. Deslocar muda onde a leitura come\xE7a; espelhar inverte o motivo.";
        this.feedback(r.feedback);
        T.event("preview");
      });
      on("loom-weave", () => this.weave());
      on("culture-next", () => this.advance());
      on("loom-hint", () => {
        const [p, n, rev] = (r.practiceRows || this.game("loom").stages[r.stage].rows)[row];
        U.hint("loom:" + r.stage + ":" + row, ["Compare o primeiro fio e procure o trecho que se repete no modelo.", "Separe a linha em grupos de " + p.length + " fios. O mesmo grupo volta a aparecer; observe em qual cor ele come\xE7a.", () => `Uma configura\xE7\xE3o poss\xEDvel: motivo ${p.split("").join(" \xB7 ")}, deslocamento ${n}, ${rev ? "com" : "sem"} espelhamento.`]);
      });
    };
    const weave = K.weave.bind(K);
    K.weave = function() {
      const r = this.run(), before = r?.data.woven.length, ok = weave();
      if (ok) {
        T.event("weave", { count: r.data.woven.length });
        U.pulse(V.$('[data-key="woven-' + before + '"]'));
      }
      return ok;
    };
    K.press = function() {
      const r = this.run(), d = r.data, s = this.game("press").stages[r.stage], pieces = this.pressPieces(r), selected = pieces.find((p) => p.id === d.selected) || pieces[0], shape = this.rotateShape(selected.shape, d.rotations[selected.id] || 0), w = Math.max(...shape.map((p) => p[0])) + 1, h = Math.max(...shape.map((p) => p[1])) + 1, occupied = this.pressOccupied(r), cursor = Number.isInteger(d.cursor) ? d.cursor : 0, px = cursor % 6, py = Math.floor(cursor / 6), footprint = shape.map(([x, y]) => [x + px, y + py]), valid = footprint.every(([x, y]) => x >= 0 && x < 6 && y >= 0 && y < 4 && !this.pressOccupied(r, selected.id).has(y * 6 + x)), source = D.sources[s.source];
      this.frame(`<div class="press-workbench"><section class="press-page-area"><div class="press-sheet ${d.printed ? "press-printed" : ""}"><header><small>EDI\xC7\xC3O ${r.stage + 1} \xB7 PUBLICA\xC7\xC3O FICCIONAL</small><h3>Jornal das Vozes</h3></header><div id="press-board" class="press-board" role="grid" aria-label="P\xE1gina: seis colunas, quatro linhas. Setas escolhem a \xE2ncora.">${Array.from({ length: 24 }, (_, i) => {
        const id = occupied.get(i), p = pieces.find((p2) => p2.id === id), preview = footprint.some(([x, y]) => x === i % 6 && y === Math.floor(i / 6));
        return `<button data-press-cell="${i}" class="${id ? "press-ink-" + p.color : ""} ${i === cursor ? "press-anchor" : ""} ${preview && !d.printed ? valid ? "press-fit" : "press-clash" : ""}" aria-label="Coluna ${i % 6 + 1}, linha ${Math.floor(i / 6) + 1}${id ? ", " + p.name : ", livre"}" aria-selected="${i === cursor}" ${d.printed ? "disabled" : ""}>${id || "\xB7"}</button>`;
      }).join("")}</div><footer>${occupied.size}/24 ESPA\xC7OS \xB7 ${d.inspected.length}/${pieces.length} FICHAS</footer></div><div class="press-near-controls"><span>\xC2ncora: coluna ${px + 1}, linha ${py + 1} \xB7 ${valid ? "cabe nesta posi\xE7\xE3o" : "ajuste o giro ou a posi\xE7\xE3o"}</span><div class="row"><button id="press-rotate" class="secondary" ${d.printed ? "disabled" : ""}>Girar 90\xB0 \xB7 R</button><button id="press-place" class="primary" ${d.printed ? "disabled" : ""}>Posicionar ${selected.id} \xB7 Enter</button><button id="press-undo" class="quiet" ${!d.history.length || d.printed ? "disabled" : ""}>Desfazer \xB7 Z</button></div></div></section><aside class="culture-controls"><h3>Blocos e fichas</h3><div class="press-tray">${pieces.map((p) => `<button data-press-piece="${p.id}" class="${p.id === d.selected ? "active" : ""}" aria-pressed="${p.id === d.selected}"><b>${p.id}</b><span>${esc(p.name)}</span><small>${d.placements[p.id] ? "\u2713 Posicionado" : d.inspected.includes(p.id) ? "Ficha consultada" : "Examinar ficha"}</small></button>`).join("")}</div><article class="press-current-source"><small>FICHA DE ${selected.id} \xB7 ${esc(selected.name)}</small><p>${d.inspected.includes(selected.id) ? esc(source.text) : "Selecione este bloco para examinar a refer\xEAncia antes de posicion\xE1-lo."}</p><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.name)} \u2197</a></article><div class="press-piece-mini"><div class="press-piece-preview" style="--piece-cols:${w}">${Array.from({ length: w * h }, (_, i) => `<i class="${shape.some((p) => p[0] === i % w && p[1] === Math.floor(i / w)) ? "ink" : ""}"></i>`).join("")}</div><span>${selected.id} \xB7 giro ${(d.rotations[selected.id] || 0) * 90}\xB0</span></div><div class="row"><button id="press-remove" class="quiet" ${!d.placements[selected.id] || d.printed ? "disabled" : ""}>Retirar ${selected.id}</button><button id="press-hint" class="quiet" ${d.printed ? "disabled" : ""}>Pedir uma dica</button></div>${d.printed ? '<button id="culture-next" class="primary">Registrar edi\xE7\xE3o e continuar</button>' : `<button id="press-print" class="primary workshop-main" ${this.pressValid(r) ? "" : "disabled"}>Imprimir p\xE1gina</button>`}</aside></div>`);
      V.$$("[data-press-piece]").forEach((b) => b.onclick = () => {
        d.selected = b.dataset.pressPiece;
        if (!d.inspected.includes(d.selected)) d.inspected.push(d.selected);
        r.feedback = "Ficha " + d.selected + " aberta. A refer\xEAncia hist\xF3rica acompanha o bloco da publica\xE7\xE3o ficcional.";
        this.commit();
        T.event("inspect", { id: d.selected });
        T.event("select", { id: d.selected });
      });
      V.$$("[data-press-cell]").forEach((b) => b.onclick = () => {
        d.cursor = +b.dataset.pressCell;
        r.feedback = "Pr\xE9via posicionada. Toque em Posicionar para confirmar; R gira o bloco.";
        this.commit();
        T.event("anchor");
      });
      on("press-place", () => {
        if (this.placePress(d.cursor % 6, Math.floor(d.cursor / 6))) {
          T.event("place");
          if (this.pressValid(r)) T.event("layout-ready");
        }
      });
      on("press-rotate", () => {
        d.rotations[d.selected] = ((d.rotations[d.selected] || 0) + 1) % 4;
        r.moves++;
        r.feedback = "Bloco " + d.selected + " girado. A pr\xE9via mostra os espa\xE7os que ele ocupar\xE1.";
        this.commit();
        T.event("rotate");
      });
      on("press-remove", () => {
        d.history.push(JSON.stringify(d.placements));
        delete d.placements[d.selected];
        r.moves++;
        this.commit();
        T.event("remove");
      });
      on("press-undo", () => {
        const previous = d.history.pop();
        if (previous) {
          d.placements = JSON.parse(previous);
          r.moves++;
          r.feedback = "A posi\xE7\xE3o anterior foi recuperada. As fichas consultadas continuam dispon\xEDveis.";
          this.commit();
          T.event("undo");
        }
      });
      on("press-hint", () => {
        const piece = pieces.find((p) => !d.placements[p.id]) || selected;
        U.hint("press:" + r.stage, ["Compare a largura e a altura da pe\xE7a com os espa\xE7os livres da p\xE1gina.", "O contorno na p\xE1gina \xE9 uma pr\xE9via. Uma borda coral indica que parte do bloco cobre outra pe\xE7a ou sai da margem.", () => `Uma composi\xE7\xE3o poss\xEDvel coloca ${piece.id} na coluna ${piece.solution[0] + 1}, linha ${piece.solution[1] + 1}, sem giro. Examine a ficha antes de confirmar.`]);
      });
      on("press-print", () => {
        if (this.printPress()) T.event("print");
      });
      on("culture-next", () => this.advance());
      U.grid(V.$("#press-board"), "[data-press-cell]", 6);
      const area = V.$(".press-workbench");
      area.onkeydown = (e) => {
        if (/INPUT|SELECT/.test(e.target.tagName)) return;
        if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          V.$("#press-rotate")?.click();
        }
        if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          V.$("#press-undo")?.click();
        }
        if (e.key === "Enter" && e.target.matches("[data-press-cell]")) {
          e.preventDefault();
          d.cursor = +e.target.dataset.pressCell;
          V.$("#press-place")?.click();
        }
      };
    };
    const dirs = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0], W: [0, 0] }, sym = { U: "\u2191", D: "\u2193", L: "\u2190", R: "\u2192", W: "\xB7" }, names = { U: "Subir", D: "Descer", L: "Esquerda", R: "Direita", W: "Esperar" };
    K.stage = function() {
      const r = this.run(), d = r.data, s = this.game("stage").stages[r.stage], actor = Math.max(0, Math.min(s.actors.length - 1, d.editorActor || 0)), signature = r.id + ":" + r.stage + ":" + (T.active ? T.record(T.active).step : "play");
      if (this.stageView !== signature) {
        this.stageView = signature;
        this.preview = null;
        this.stageMotion = null;
        this.animating = false;
      }
      this.frame(`<div class="stage-workbench"><section class="stage-observation"><canvas id="culture-stage" width="700" height="500" tabindex="0" aria-label="Palco, 7 colunas e 5 linhas. As setas programam a pessoa selecionada; Espa\xE7o adiciona espera."></canvas><div id="stage-playback" class="stage-playback" role="status">${this.animating ? "Ensaio em execu\xE7\xE3o" : d.solved ? "\u2713 Companhia nas marcas" : d.playback?.index ? "Passo observado: " + d.playback.index : "Observe as marcas A, B e C no palco"}</div><div class="row stage-play-controls"><button id="stage-step" class="secondary" ${this.animating ? "disabled" : ""}>Ver um passo</button><button id="stage-play" class="primary workshop-main" ${this.animating ? "disabled" : ""}>${d.playback?.playing ? "Continuar ensaio" : "Ensaiar juntos"}</button><button id="stage-stop" class="quiet" ${this.animating ? "" : "disabled"}>Pausar ensaio</button></div></section><aside class="culture-controls stage-editor"><h3>Um comando por vez</h3><div class="stage-actor-tabs" role="group" aria-label="Escolher integrante">${s.actors.map((a, i) => `<button data-stage-actor="${i}" class="${i === actor ? "active" : ""}" aria-pressed="${i === actor}">${String.fromCharCode(65 + i)} \xB7 ${esc(a.name.split(" \xB7 ")[0])}</button>`).join("")}</div><p>${esc(s.actors[actor].name)} \xB7 destino ${s.actors[actor].goal[0] + 1}, ${s.actors[actor].goal[1] + 1}</p><div class="stage-command-pad">${["U", "L", "W", "R", "D"].map((c) => `<button data-stage-command="${c}" class="command-${c}" aria-label="Adicionar ${names[c]}" ${d.programs[actor].length >= s.max || this.animating ? "disabled" : ""}>${sym[c]}<small>${names[c]}</small></button>`).join("")}</div><p class="muted">At\xE9 ${s.max} comandos por pessoa. Todos executam a mesma coluna juntos; \xB7 mant\xE9m a posi\xE7\xE3o por um passo.</p><div class="row"><button id="stage-undo" class="quiet" ${d.programs[actor].length && !this.animating ? "" : "disabled"}>Desfazer \xFAltimo</button><button id="stage-clear" class="quiet" ${d.programs[actor].length && !this.animating ? "" : "disabled"}>Limpar esta pessoa</button></div><button id="stage-hint" class="quiet">Pedir uma dica</button>${d.solved ? '<button id="culture-next" class="primary">Registrar ensaio e continuar</button>' : ""}</aside></div><div class="stage-score" aria-label="Partitura de comandos simult\xE2neos">${s.actors.map((a, i) => `<div class="stage-score-row" data-key="actor-score-${i}"><strong>${String.fromCharCode(65 + i)}</strong><ol>${d.programs[i].map((c, j) => `<li><button data-stage-delete="${i}:${j}" class="${d.playback?.index === j + 1 ? "current-step" : ""}" aria-label="${esc(a.name)}, remover passo ${j + 1}: ${names[c]}" ${this.animating ? "disabled" : ""}><small>${j + 1}</small>${sym[c]}</button></li>`).join("") || '<li class="muted">Sem comandos \xB7 espera</li>'}</ol></div>`).join("")}</div><details class="stage-plan"><summary>Consultar posi\xE7\xF5es e cen\xE1rios em texto</summary>${s.actors.map((a, i) => `<p>${String.fromCharCode(65 + i)}: in\xEDcio ${a.start.join(", ")} \u2192 destino ${a.goal.join(", ")} (colunas e linhas come\xE7ando em zero).</p>`).join("")}<p>Cen\xE1rios: ${s.blocks.map((p) => p.join(", ")).join(" / ")}.</p></details>`);
      V.$$("[data-stage-actor]").forEach((b) => b.onclick = () => {
        d.editorActor = +b.dataset.stageActor;
        this.commit();
        T.event("actor", { id: d.editorActor });
      });
      V.$$("[data-stage-command]").forEach((b) => b.onclick = () => this.stageCommand(actor, b.dataset.stageCommand));
      V.$$("[data-stage-delete]").forEach((b) => b.onclick = () => {
        const [i, j] = b.dataset.stageDelete.split(":").map(Number);
        if (this.animating) return;
        d.programs[i].splice(j, 1);
        d.solved = false;
        d.playback = null;
        this.preview = null;
        r.moves++;
        this.commit();
        T.event("edit");
      });
      on("stage-undo", () => {
        d.programs[actor].pop();
        d.solved = false;
        d.playback = null;
        this.preview = null;
        r.moves++;
        this.commit();
      });
      on("stage-clear", () => {
        d.programs[actor] = [];
        d.solved = false;
        d.playback = null;
        this.preview = null;
        this.commit();
      });
      on("stage-step", () => {
        const result = this.simulateStage(r), index = Math.min((d.playback?.index || 0) + 1, result.frames.length - 1);
        d.playback = { index: index || 0, playing: false };
        this.preview = { frames: result.frames, index };
        this.stagePreviewRun = r;
        r.feedback = index === result.frames.length - 1 ? result.reason : "Coluna " + index + ": cada pessoa executa seu comando ao mesmo tempo.";
        this.commit();
        T.event("step");
      });
      on("stage-play", () => this.rehearse());
      on("stage-stop", () => {
        clearTimeout(this.stageTimer);
        this.stageMotion = null;
        this.animating = false;
        if (d.playback) d.playback.playing = true;
        this.commit();
      });
      on("culture-next", () => this.advance());
      on("stage-hint", () => U.hint("stage:" + r.stage, ["Compare uma coluna por vez: duas pessoas n\xE3o podem terminar na mesma casa nem trocar de lugar no mesmo passo.", r.stage === 1 ? "A passagem central s\xF3 comporta uma pessoa. Leve uma delas para a linha de cima ou de baixo e use \xB7 para esperar." : "Separe os trajetos em alturas diferentes e use pausas para evitar o encontro no mesmo passo.", () => r.stage === 0 ? "Experimente A: \u2191 \u2191 \u2192 \u2192 \u2192 \u2192; B: \u2190 \u2190 \u2190 \u2190 \u2191 \u2191. Confira as duas trajet\xF3rias antes de executar." : r.stage === 1 ? "Uma rota poss\xEDvel: A \u2192 \u2192 \u2192 \u2192; B \u2191 \u2190 \xB7 \u2193 \u2190 \u2190 \u2190. Compare os comandos na partitura." : "Experimente A: \u2193 \u2192 \u2192 \u2192 \u2192 \u2191 \u2191 \u2191; B: \u2191 \u2191 \u2191 \u2190 \u2190 \u2190 \u2190 \u2193; C: \u2190 \u2191 \u2191 \xB7 \xB7 \xB7 \u2191 \u2191 \u2192. Revise uma coluna por vez."]));
      V.$("#culture-stage").onkeydown = (e) => {
        const c = { ArrowUp: "U", ArrowDown: "D", ArrowLeft: "L", ArrowRight: "R", " ": "W" }[e.key];
        if (c) {
          e.preventDefault();
          e.stopPropagation();
          V.$('[data-stage-command="' + c + '"]')?.click();
        }
      };
      this.paintStage();
    };
    K.stageCommand = function(actor, command) {
      const r = this.run(), s = this.game("stage").stages[r?.stage];
      if (r?.game !== "stage" || this.animating || !dirs[command] || !r.data.programs[actor] || r.data.programs[actor].length >= s.max) return false;
      r.data.programs[actor].push(command);
      r.data.solved = false;
      r.data.playback = null;
      this.preview = null;
      r.moves++;
      r.feedback = names[command] + " adicionado a " + s.actors[actor].name.split(" \xB7 ")[0] + ". Nenhuma pessoa se move antes do ensaio.";
      this.commit();
      T.event("command", { actor, command });
      return true;
    };
    K.rehearse = function() {
      const r = this.run();
      if (r?.game !== "stage" || this.animating) return false;
      const result = this.simulateStage(r);
      if (result.frames.length <= 1) return this.feedback(result.reason, true);
      this.animating = true;
      this.stagePreviewRun = r;
      r.moves++;
      const token = ++this.token;
      let index = Math.min(r.data.playback?.playing ? r.data.playback.index || 0 : 0, result.frames.length - 1);
      const duration = V.settings.reducedMotion ? 80 : 320;
      const tick = () => {
        if (this.token !== token || this.run() !== r || !V.$("#culture-stage")) {
          this.animating = false;
          return;
        }
        this.preview = { frames: result.frames, index };
        r.data.playback = { index, playing: true };
        this.stageMotion = index ? { r, frames: result.frames, index, start: performance.now(), duration } : null;
        this.show();
        const status = V.$("#stage-playback");
        if (status) status.textContent = "Ensaio simult\xE2neo \xB7 passo " + index + "/" + (result.frames.length - 1);
        if (index < result.frames.length - 1) {
          index++;
          this.stageTimer = setTimeout(tick, duration);
          return;
        }
        this.stageTimer = setTimeout(() => {
          if (this.token !== token || this.run() !== r || !V.$("#culture-stage")) return;
          this.animating = false;
          this.stageMotion = null;
          r.data.playback.playing = false;
          r.data.solved = result.success;
          r.feedback = result.reason;
          if (!result.success && !T.practice("culture", "stage")) r.mistakes++;
          U.sound(result.success ? "correct" : "observe");
          this.commit();
          T.event("rehearse", { success: result.success });
        }, duration);
      };
      tick();
      return true;
    };
    const paintStage = K.paintStage.bind(K);
    K.paintStage = function() {
      const m = this.stageMotion;
      if (!m || V.settings.reducedMotion) return paintStage();
      const f = Math.min(1, (performance.now() - m.start) / m.duration), current = m.frames[m.index], previous = m.frames[m.index - 1];
      if (!current || !previous) return paintStage();
      const smooth = f * f * (3 - 2 * f);
      m.frames[m.index] = current.map(([x, y], i) => [previous[i][0] + (x - previous[i][0]) * smooth, previous[i][1] + (y - previous[i][1]) * smooth]);
      try {
        return paintStage();
      } finally {
        m.frames[m.index] = current;
      }
    };
    const O = K.Oware;
    K.owareBoard = function(d) {
      if (!d.pending) return d.board;
      const p = d.pending, b = p.before.board.slice();
      b[p.pit] = 0;
      for (const i of p.next.path.slice(0, p.index)) b[i]++;
      return b;
    };
    K.oware = function() {
      const r = this.run(), d = r.data, training = r.stage < 3, p = d.pending, b = this.owareBoard(d), legal = O.legal(d.board, d.turn), selected = d.selected, preview = !p && selected !== null && legal.includes(selected) ? O.apply(d, selected) : null, canPlay = !p && !d.done && !d.over && d.turn === 0, emptyOther = O.total(d.board, 1) === 0;
      const pitButton = (i) => {
        const own = i < 6, forecast = preview?.path.includes(i), active = p && p.index > 0 && p.next.path[p.index - 1] === i, last = p && p.index === p.next.path.length && p.next.path.at(-1) === i, capture = p?.phase === "capture" && p.next.captured.includes(i);
        return `<button data-oware-pit="${i}" class="oware-pit ${own ? "own" : "other"} ${selected === i ? "selected" : ""} ${forecast ? "forecast" : ""} ${active ? "seed-arrival" : ""} ${last ? "last-seed" : ""} ${capture ? "captured-seeds" : ""} ${own && !legal.includes(i) ? "oware-unavailable" : ""}" aria-label="${own ? "Sua casa" : "Casa de Bia"} ${String.fromCharCode(65 + i)}, ${b[i]} sementes${own && !legal.includes(i) ? ", n\xE3o alimenta o advers\xE1rio ou est\xE1 vazia" : ""}" aria-pressed="${selected === i}" ${!canPlay || !own ? "disabled" : ""}><span class="oware-seeds" aria-hidden="true">${Array.from({ length: Math.min(12, b[i]) }, () => "<i></i>").join("")}</span><b>${b[i]}</b><small>${String.fromCharCode(65 + i)}</small></button>`;
      };
      const pendingText = p ? p.phase === "capture" ? p.next.grand ? "A captura foi cancelada: o outro lado precisa continuar com sementes." : p.next.gain ? "\xDAltima casa " + String.fromCharCode(65 + p.next.path.at(-1)) + ": capturar " + p.next.gain + " sementes destacadas." : "\xDAltima casa " + String.fromCharCode(65 + p.next.path.at(-1)) + ": nenhuma captura." : `Semente ${p.index}/${p.next.path.length} \xB7 ${p.next.path.length - p.index} na m\xE3o \xB7 ${p.computer ? "Bia" : "voc\xEA"} semeia` : "";
      const notice = p ? pendingText : d.done ? "Posi\xE7\xE3o de treino resolvida." : d.over ? (d.scores[0] > d.scores[1] ? "Voc\xEA venceu." : d.scores[0] === d.scores[1] ? "Empate." : "Bia venceu; voc\xEA tamb\xE9m concluiu a partida.") + " " + (d.endReason || "") : d.turn === 1 ? "Bia est\xE1 planejando." : "Sua vez \xB7 selecione A\u2013F e confira a pr\xE9via.";
      this.frame(`<div class="oware-mode ${training ? "training" : "match"}"><strong>${training ? "POSI\xC7\xC3O DE TREINO " + (r.stage + 1) + "/3" : "PARTIDA COMPLETA \xB7 ABAPA"}</strong><span>${training ? "Exerc\xEDcio preparado para observar uma regra." : "48 sementes \xB7 vencer \xE9 opcional para concluir."}</span></div><div class="oware-workbench"><section class="oware-play-area"><div class="oware-score"><span>Bia <b>${d.scores[1]}</b></span><span>${p ? p.next.path.length - p.index + " NA M\xC3O" : "48 SEMENTES"}</span><span>Voc\xEA <b>${d.scores[0]}</b></span></div><p class="oware-turn" role="status">${esc(notice)}</p><div id="oware-board" class="oware-board"><div class="oware-side-label">BIA \xB7 SEMEAR \u2190</div><div class="oware-row">${[11, 10, 9, 8, 7, 6].map(pitButton).join("")}</div><div class="oware-row">${[0, 1, 2, 3, 4, 5].map(pitButton).join("")}</div><div class="oware-side-label">VOC\xCA \xB7 SEMEAR \u2192</div></div>${emptyOther && !p && !d.over && !d.done ? `<p id="oware-obligation" class="oware-obligation">O outro lado est\xE1 vazio. ${legal.length ? "Alimente Bia: " + legal.map((i) => String.fromCharCode(65 + i)).join(", ") + "." : "N\xE3o h\xE1 como aliment\xE1-lo; a partida ser\xE1 encerrada."}</p>` : ""}<div class="oware-forecast" aria-live="polite">${preview ? `<strong>PR\xC9VIA DE ${String.fromCharCode(65 + selected)}</strong><p>${preview.path.map((i) => String.fromCharCode(65 + i)).join(" \u2192 ")} \xB7 \xFAltima casa ${String.fromCharCode(65 + preview.path.at(-1))}</p><span>${preview.grand ? "A captura esvaziaria o outro lado e ser\xE1 cancelada." : preview.gain ? "Captura prevista: " + preview.gain + " sementes." : "Sem captura prevista."}</span>` : p ? `<strong>${esc(pendingText)}</strong>` : "<p>Escolha uma casa. Nada muda no tabuleiro antes de Semear.</p>"}</div><div class="oware-main-controls">${d.over || d.done ? '<button id="culture-next" class="primary workshop-main">' + (training ? "Continuar treino" : "Registrar partida e concluir") + "</button>" : p ? '<button id="oware-seed-step" class="primary">Pr\xF3xima semente</button><button id="oware-seed-resume" class="secondary">Continuar semeadura</button><button id="oware-seed-finish" class="quiet">Concluir visualiza\xE7\xE3o</button>' : `<button id="oware-sow" class="primary workshop-main" ${canPlay && selected !== null && legal.includes(selected) ? "" : "disabled"}>Semear ${selected === null ? "casa escolhida" : String.fromCharCode(65 + selected)}</button>`}</div></section><aside class="culture-controls"><h3>Semeie, observe, decida</h3><p>Uma semente por casa, pulando a origem ao dar a volta. A \xFAltima casa no lado advers\xE1rio pode gerar captura com 2 ou 3 sementes.</p><p>O advers\xE1rio precisa poder continuar: alimente seu lado vazio quando poss\xEDvel. Uma captura que retiraria todas as sementes dele \xE9 cancelada.</p><details><summary>Fim da partida e regras usadas</summary><p>25 sementes garantem a maioria. Sem jogadas ou ap\xF3s tr\xEAs posi\xE7\xF5es repetidas, cada lado recolhe suas sementes. A repeti\xE7\xE3o tripla \xE9 a conven\xE7\xE3o desta oficina.</p></details><button id="oware-hint" class="quiet" ${canPlay ? "" : "disabled"}>Pedir uma dica</button>${!training && !d.over && !p ? '<button id="oware-restart" class="quiet">Recome\xE7ar esta partida</button>' : ""}</aside></div>`);
      V.$$("[data-oware-pit]").forEach((button) => button.onclick = () => {
        const i = +button.dataset.owarePit;
        if (!canPlay) return;
        if (!legal.includes(i)) return this.feedback(emptyOther ? "Essa casa n\xE3o alcan\xE7a o lado vazio de Bia. Escolha uma semeadura que o alimente." : "Esta casa est\xE1 vazia; escolha outra.");
        d.selected = i;
        r.feedback = "Casa " + String.fromCharCode(65 + i) + " selecionada. A pr\xE9via identifica o caminho e a \xFAltima casa.";
        this.commit();
        T.event("pit", { pit: i });
      });
      on("oware-sow", () => this.sowOware());
      on("culture-next", () => this.advance());
      on("oware-seed-step", () => {
        clearTimeout(this.owareTimer);
        this.owareTimer = null;
        this.tickOware(false);
      });
      on("oware-seed-resume", () => this.animateOware());
      on("oware-seed-finish", () => {
        clearTimeout(this.owareTimer);
        if (d.pending) {
          d.pending.index = d.pending.next.path.length;
          d.pending.phase = "capture";
          this.show();
          this.owareTimer = setTimeout(() => this.completeOwareMove(), V.settings.reducedMotion ? 0 : 180);
        }
      });
      on("oware-hint", () => {
        const hint = training ? this.game("oware").stages[r.stage].pit : O.choose(d);
        U.hint("oware:" + r.stage, ["Conte quantas casas cada semeadura alcan\xE7a. Se Bia estiver sem sementes, primeiro procure uma casa capaz de aliment\xE1-la.", selected !== null ? `A casa ${String.fromCharCode(65 + selected)} come\xE7a com ${d.board[selected]} sementes. A pr\xE9via aponta a \xFAltima casa e a poss\xEDvel captura.` : "Selecione uma casa e observe a pr\xE9via antes de decidir. Nada \xE9 aplicado nesta etapa.", () => `Considere a casa ${String.fromCharCode(65 + hint)}. Confira o caminho e a \xFAltima casa antes de confirmar.`]);
      });
      on("oware-restart", () => {
        V.UI.confirm("Recome\xE7ar a partida?", "Os tr\xEAs treinos e as conquistas permanecem registrados. Apenas esta partida voltar\xE1 ao in\xEDcio.", () => {
          this.setup(r);
          this.show();
          V.Save.save();
        });
      });
      U.grid(V.$("#oware-board"), '[data-oware-pit="0"],[data-oware-pit="1"],[data-oware-pit="2"],[data-oware-pit="3"],[data-oware-pit="4"],[data-oware-pit="5"]', 6);
      if (!p && !training && d.turn === 1 && !d.over) this.scheduleOware();
    };
    K.sowOware = function(pit = null, computer = false) {
      const r = this.run();
      if (r?.game !== "oware") return false;
      const d = r.data, training = r.stage < 3;
      if (d.pending || d.over || d.done || !computer && d.turn !== 0 || computer && (training || d.turn !== 1)) return false;
      pit = pit === null ? d.selected : pit;
      if (!Number.isInteger(pit) || !O.legal(d.board, d.turn).includes(pit)) return this.feedback("Escolha uma casa que mantenha a semeadura e alimente o lado vazio do advers\xE1rio quando poss\xEDvel.");
      if (training && pit !== this.game("oware").stages[r.stage].pit) return this.feedback("Este treino observa a casa " + String.fromCharCode(65 + this.game("oware").stages[r.stage].pit) + ". Sua escolha n\xE3o foi aplicada; compare os caminhos.", true);
      const next = O.apply(d, pit);
      if (!next) return false;
      d.pending = { pit, computer, before: { board: d.board.slice(), scores: d.scores.slice(), turn: d.turn }, next, index: 0, phase: "sowing" };
      r.feedback = "As sementes saem da origem e s\xE3o distribu\xEDdas uma a uma.";
      V.Save.save();
      this.show();
      this.animateOware();
      return true;
    };
    K.tickOware = function(auto = true) {
      const r = this.run(), d = r?.data, p = d?.pending;
      if (!p || r.game !== "oware" || !V.$("#oware-board")) return false;
      this.owareTimer = null;
      if (p.index < p.next.path.length) {
        p.index++;
        p.phase = p.index === p.next.path.length ? "capture" : "sowing";
        U.sound("menu");
        this.show();
        V.Save.save();
        if (auto) this.owareTimer = setTimeout(() => this.tickOware(true), p.phase === "capture" ? V.settings.reducedMotion ? 120 : 480 : V.settings.reducedMotion ? 75 : 145);
        return true;
      }
      return this.completeOwareMove();
    };
    K.animateOware = function() {
      clearTimeout(this.owareTimer);
      this.owareTimer = setTimeout(() => this.tickOware(true), V.settings.reducedMotion ? 75 : 145);
    };
    K.completeOwareMove = function() {
      const r = this.run(), d = r?.data, p = d?.pending;
      if (!p) return false;
      clearTimeout(this.owareTimer);
      this.owareTimer = null;
      const next = p.next;
      d.board = next.board;
      d.scores = next.scores;
      d.turn = next.turn;
      d.selected = null;
      d.turns++;
      d.last = { pit: p.pit, path: next.path, captured: next.captured, gain: next.gain, grand: next.grand };
      delete d.pending;
      r.moves++;
      r.feedback = (p.computer ? "Bia" : "Voc\xEA") + " semeou " + String.fromCharCode(65 + p.pit) + ". \xDAltima casa: " + String.fromCharCode(65 + next.path.at(-1)) + ". " + (next.grand ? "Captura cancelada para preservar o jogo." : next.gain ? next.gain + " sementes capturadas." : "Nenhuma captura: a \xFAltima casa n\xE3o formou uma captura v\xE1lida.");
      if (r.stage < 3) {
        d.done = true;
        d.turn = 0;
      } else O.checkEnd(d);
      U.sound(next.gain ? "collect" : "correct");
      this.commit();
      T.event("sow", { gain: next.gain, pit: p.pit });
      return true;
    };
    K.scheduleOware = function() {
      clearTimeout(this.aiTimer);
      const r = this.run(), token = this.token;
      this.aiTimer = setTimeout(() => {
        if (this.token !== token || this.run() !== r || !V.$("#oware-board") || r.data.turn !== 1 || r.data.over || r.data.pending) return;
        const pit = O.choose(r.data);
        if (pit === null) {
          O.checkEnd(r.data);
          this.commit();
          return;
        }
        this.sowOware(pit, true);
      }, V.settings.reducedMotion ? 100 : 380);
    };
    const run = (id) => {
      const r = { id: "practice-" + id, game: id, stage: 0, passed: [], moves: 0, mistakes: 0, seen: [], data: {}, finished: false };
      K.setup(r);
      return r;
    };
    const common = (id) => ({ family: "culture", id, render() {
      K.active = id;
      K.show(id);
    }, resume() {
      K.active = id;
      if (!actualRun(id) || actualRun(id).finished) {
        K.creating = true;
        try {
          start(id);
        } finally {
          K.creating = false;
        }
      }
      K.show(id);
    } });
    T.define("culture:loom", { ...common("loom"), create() {
      const r = run("loom");
      r.practiceRows = [["AB", 0, false], ["AB", 1, false], ["ABCD", 0, true], ["AABB", 0, false]];
      r.data.pattern = "AABB";
      return r;
    }, steps: [
      { title: "Leia o modelo antes de tecer", text: "Toque no modelo da primeira linha. As letras identificam os fios; voc\xEA vai produzir a mesma sequ\xEAncia no tecido ao lado.", target: '[data-loom-model="0"]', allow: '[data-loom-model="0"]', event: "model", after: "A linha ativa tem oito fios. Observe qual pequeno grupo se repete." },
      { title: "Escolha o motivo", text: "Selecione A \xB7 B no controle Motivo. A pr\xE9via muda, mas o tecido continua vazio.", target: "#loom-pattern", allow: "#loom-pattern", event: "pattern", test: (d) => d.value === "AB", after: "A \xB7 B \xE9 o motivo. Ele precisa aparecer quatro vezes para preencher os oito fios." },
      { title: "Veja a repeti\xE7\xE3o", text: "Toque em Visualizar a repeti\xE7\xE3o e compare os oito fios com o modelo.", target: "#loom-preview", allow: "#loom-preview", event: "preview", after: "A pr\xE9via repete o motivo; ela n\xE3o o copia uma \xFAnica vez. Voc\xEA pode conferir antes de executar." },
      { title: "Passe a lan\xE7adeira", text: "O programa coincide com o modelo. Toque em Passar a lan\xE7adeira para tecer a primeira linha.", target: "#loom-weave", allow: "#loom-weave", event: "weave", test: (d) => d.count === 1, after: "Uma linha ficou registrada no tecido. As configura\xE7\xF5es continuam dispon\xEDveis para a pr\xF3xima." },
      { title: "Mude onde a sequ\xEAncia come\xE7a", text: "O segundo modelo come\xE7a em B. Escolha deslocamento de 1 posi\xE7\xE3o e observe a pr\xE9via.", target: "#loom-offset", allow: "#loom-offset", event: "offset", test: (d) => d.value === 1, after: "Deslocar conserva o motivo e muda o ponto de partida: B \xB7 A \xB7 B \xB7 A\u2026" },
      { title: "Teste o deslocamento", text: "Compare a segunda linha e passe a lan\xE7adeira quando a pr\xE9via coincidir com o modelo.", target: "#loom-weave", allow: "#loom-weave,#loom-offset", event: "weave", test: (d) => d.count === 2, after: "O mesmo motivo produziu outra ordem de cores ao mudar o in\xEDcio." },
      { title: "Inverta um motivo", text: "Agora o motivo tem quatro cores. Ative Espelhar: A \xB7 B \xB7 C \xB7 D passa a ser lido de tr\xE1s para a frente.", prepare: (r) => Object.assign(r.data, { pattern: "ABCD", offset: 0, reverse: false }), target: "#loom-mirror", allow: "#loom-mirror", event: "reverse", test: (d) => d.value === true, after: "A ordem ficou D \xB7 C \xB7 B \xB7 A. Espelhar e deslocar s\xE3o opera\xE7\xF5es diferentes." },
      { title: "Registre a linha espelhada", text: "Passe a lan\xE7adeira para conferir o resultado do espelhamento.", target: "#loom-weave", allow: "#loom-weave,#loom-mirror", event: "weave", test: (d) => d.count === 3, after: "Tr\xEAs linhas prontas. Agora voc\xEA pode combinar os controles." },
      { title: "Pratique por conta pr\xF3pria", text: "A \xFAltima linha repete A \xB7 A \xB7 B \xB7 B. Escolha o motivo, ajuste o in\xEDcio e te\xE7a. As dicas s\xF3 ficam mais concretas se voc\xEA pedir novamente.", prepare: (r) => Object.assign(r.data, { pattern: "AB", offset: 0, reverse: false }), allow: "#loom-pattern,#loom-offset,#loom-mirror,#loom-preview,#loom-weave,#loom-hint,[data-loom-model]", event: "weave", test: (d) => d.count === 4, after: "Voc\xEA experimentou modelo, motivo, repeti\xE7\xE3o, deslocamento, espelhamento e execu\xE7\xE3o. Sua partida come\xE7a fora deste treino." }
    ] });
    T.define("culture:press", { ...common("press"), create: () => run("press"), steps: [
      { title: "Abra a ficha de uma voz", text: "Selecione o bloco A. A refer\xEAncia hist\xF3rica aparece ao lado da p\xE1gina; o jornal montado aqui \xE9 ficcional.", target: '[data-press-piece="A"]', allow: '[data-press-piece="A"]', event: "inspect", test: (d) => d.id === "A", after: "A ficha acompanha o bloco. Posicionar uma pe\xE7a n\xE3o transforma a publica\xE7\xE3o ficcional em documento hist\xF3rico." },
      { title: "Troque o bloco selecionado", text: "Selecione B. O nome, a ficha e a pequena forma passam a representar esse bloco.", target: '[data-press-piece="B"]', allow: '[data-press-piece="B"]', event: "select", test: (d) => d.id === "B", after: "B \xE9 o bloco ativo. Os controles de giro e posi\xE7\xE3o atuam sobre ele." },
      { title: "Gire sem comprometer a p\xE1gina", text: "Toque em Girar 90\xB0. O contorno na p\xE1gina mostra a nova orienta\xE7\xE3o antes de posicionar.", target: "#press-rotate", allow: "#press-rotate", event: "rotate", after: "A forma girou, mas ainda n\xE3o ocupa a p\xE1gina. A pr\xE9via avisa se sai da margem." },
      { title: "Escolha a \xE2ncora e posicione", text: "Toque numa casa da p\xE1gina e depois em Posicionar B. Pelo teclado, use as setas no tabuleiro e Enter. Procure uma posi\xE7\xE3o em que a pe\xE7a caiba.", target: "#press-board,#press-place", allow: "[data-press-cell],#press-place,#press-rotate", event: "place", after: "A pe\xE7a passou a ocupar os espa\xE7os destacados. Nenhum texto precisa ser arrastado." },
      { title: "Desfa\xE7a uma a\xE7\xE3o", text: "Toque em Desfazer. A posi\xE7\xE3o anterior da p\xE1gina volta; as fichas que voc\xEA examinou continuam abertas.", target: "#press-undo", allow: "#press-undo", event: "undo", after: "Voc\xEA pode corrigir a diagrama\xE7\xE3o sem recome\xE7ar toda a edi\xE7\xE3o." },
      { title: "Pratique a composi\xE7\xE3o completa", text: "Examine A, B, C e D e posicione os quatro blocos sem sobrepor. Preencha os 24 espa\xE7os. A dica oferece orienta\xE7\xE3o antes de sugerir uma posi\xE7\xE3o.", prepare: (r) => {
        r.data.placements = {};
        r.data.rotations = {};
        r.data.history = [];
        r.data.selected = "A";
        r.data.cursor = 0;
      }, allow: "[data-press-piece],[data-press-cell],#press-place,#press-rotate,#press-undo,#press-remove,#press-hint", event: "layout-ready", after: "A p\xE1gina est\xE1 preenchida e todas as fichas foram examinadas. Agora a prensa pode funcionar." },
      { title: "Imprima a p\xE1gina", text: "Toque em Imprimir p\xE1gina. A impress\xE3o s\xF3 \xE9 liberada quando cada bloco cabe e sua ficha foi consultada.", target: "#press-print", allow: "#press-print", event: "print", after: "A edi\xE7\xE3o de treino foi impressa. Voc\xEA pode voltar a uma partida guardada sem perder nenhuma pe\xE7a." }
    ] });
    T.define("culture:stage", { ...common("stage"), create: () => run("stage"), steps: [
      { title: "Escolha quem recebe o comando", text: "Selecione A \xB7 Nia. A e B tamb\xE9m aparecem nas marcas do palco e nas linhas da partitura.", target: '[data-stage-actor="0"]', allow: '[data-stage-actor="0"]', event: "actor", test: (d) => d.id === 0 },
      { title: "Adicione um passo", text: "Toque em Subir. O comando entra na primeira coluna de Nia, mas ela ainda n\xE3o se move.", target: '[data-stage-command="U"]', allow: '[data-stage-command="U"]', event: "command", test: (d) => d.actor === 0 && d.command === "U", after: "A seta \xE9 um plano. O ensaio s\xF3 come\xE7a quando voc\xEA manda executar." },
      { title: "A espera tamb\xE9m \xE9 um comando", text: "Agora Leo est\xE1 selecionado. Adicione Esperar (\xB7): ele mant\xE9m sua posi\xE7\xE3o durante um passo.", prepare: (r) => {
        r.data.editorActor = 1;
      }, target: '[data-stage-command="W"]', allow: '[data-stage-command="W"]', event: "command", test: (d) => d.actor === 1 && d.command === "W", after: "Na mesma coluna, Nia vai subir enquanto Leo espera." },
      { title: "Veja a execu\xE7\xE3o simult\xE2nea", text: "Toque em Ensaiar juntos. Observe a coluna 1: cada pessoa executa o pr\xF3prio comando no mesmo momento.", target: "#stage-play", allow: "#stage-play,#stage-stop", event: "rehearse", after: "Nia subiu e Leo manteve a posi\xE7\xE3o. O ensaio n\xE3o chegou \xE0s marcas porque programamos apenas um passo." },
      { title: "Coordene uma passagem", text: "Nesta posi\xE7\xE3o de demonstra\xE7\xE3o, Leo sai da passagem central. Adicione outra espera a Leo para deixar Nia atravessar primeiro.", prepare: (r) => {
        r.stage = 1;
        K.setup(r);
        r.data.editorActor = 1;
        r.data.programs = [["R", "R", "R", "R"], ["U", "W", "W"]];
      }, target: '[data-stage-command="W"]', allow: '[data-stage-command="W"]', event: "command", test: (d) => d.command === "W", after: "As pausas mant\xEAm uma passagem livre sem apagar o programa da outra pessoa." },
      { title: "Acompanhe uma coluna por vez", text: "Toque em Ver um passo. Voc\xEA pode conferir o trajeto antes de executar toda a sequ\xEAncia.", target: "#stage-step", allow: "#stage-step", event: "step", after: "Cada coluna inclui todos os integrantes. Uma pessoa sem comando nessa coluna espera." },
      { title: "Pratique e observe o resultado", text: "Execute o ensaio desta demonstra\xE7\xE3o. Ele mostra a coordena\xE7\xE3o de uma travessia; na partida, voc\xEA tamb\xE9m completar\xE1 o caminho de volta de Leo.", target: "#stage-play", allow: "#stage-play,#stage-stop", event: "rehearse", after: "O feedback identifica quem ainda n\xE3o chegou. Voc\xEA pode editar um passo numerado ou desfazer o \xFAltimo comando." }
    ] });
    T.define("culture:oware", { ...common("oware"), create: () => run("oware"), steps: [
      { title: "Treino e partida t\xEAm fun\xE7\xF5es diferentes", text: "Este tabuleiro \xE9 uma posi\xE7\xE3o de treino. Selecione E: a pr\xE9via aponta o caminho de suas quatro sementes.", target: '[data-oware-pit="4"]', allow: '[data-oware-pit="4"]', event: "pit", test: (d) => d.pit === 4, after: "A pr\xE9via mostra F \u2192 G \u2192 H \u2192 I. A \xFAltima semente cair\xE1 em I." },
      { title: "Observe cada semente", text: "Toque em Semear E. A origem esvazia e cada casa recebe uma semente. Voc\xEA pode avan\xE7ar manualmente ou continuar a anima\xE7\xE3o.", target: "#oware-sow,#oware-board", allow: "#oware-sow,#oware-seed-step,#oware-seed-resume,#oware-seed-finish", event: "sow", after: "A \xFAltima casa ficou destacada. Ela terminou com cinco sementes, ent\xE3o n\xE3o houve captura." },
      { title: "Prepare uma captura", text: "Esta nova posi\xE7\xE3o foi preparada para treino. Selecione F e veja a \xFAltima casa advers\xE1ria na pr\xE9via.", prepare: (r) => {
        r.stage = 1;
        K.setup(r);
      }, target: '[data-oware-pit="5"]', allow: '[data-oware-pit="5"]', event: "pit", test: (d) => d.pit === 5, after: "G tem uma semente. A \xFAltima semente de F a deixar\xE1 com duas, no lado advers\xE1rio." },
      { title: "Veja quando a captura acontece", text: "Semeie F. A semeadura acontece primeiro; depois as sementes capturadas ficam destacadas e passam ao placar.", target: "#oware-sow,#oware-board", allow: "#oware-sow,#oware-seed-step,#oware-seed-resume,#oware-seed-finish", event: "sow", test: (d) => d.gain === 2, after: "Duas sementes foram capturadas. O restante do lado de Bia continua com sementes." },
      { title: "Alimente o lado vazio", text: "Agora Bia est\xE1 sem sementes. A e B n\xE3o atravessam a borda nesta posi\xE7\xE3o. Selecione F, a jogada que permite a ela continuar.", prepare: (r) => {
        r.stage = 2;
        K.setup(r);
      }, target: '[data-oware-pit="5"],#oware-obligation', allow: '[data-oware-pit="0"],[data-oware-pit="1"],[data-oware-pit="5"]', event: "pit", test: (d) => d.pit === 5, after: "F alcan\xE7a G e alimenta o advers\xE1rio. Essa obriga\xE7\xE3o vale tamb\xE9m para Bia." },
      { title: "Pratique a alimenta\xE7\xE3o", text: "Semeie F. Depois do treino, a oficina oferece uma partida completa com 48 sementes; o objetivo \xE9 termin\xE1-la, e vencer \xE9 opcional.", target: "#oware-sow", allow: "#oware-sow,#oware-seed-step,#oware-seed-resume,#oware-seed-finish", event: "sow", after: "Voc\xEA viu semeadura, \xFAltima casa, captura e alimenta\xE7\xE3o. Rever esse treino n\xE3o substitui nem apaga a partida completa." }
    ] });
  })();
});
