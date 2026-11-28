/* Registered module: culture-workshops */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("culture-workshops", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function cultureWorkshops() {
    "use strict";
    const V = window.V, K = V.CultureChallenges, D = V.CultureChallengeData, esc = V.escape;
    const patterns = ["AB", "AABB", "ABCD", "ABBA", "CDDC", "AACC"], cells = (letters, cls = "") => `<div class="loom-row ${cls}">${letters.map((v) => `<span class="thread-${v}" aria-label="Fio ${v}">${v}</span>`).join("")}</div>`;
    K.loomOutput = function(pattern, offset, reverse) {
      const p = reverse ? [...pattern].reverse() : [...pattern];
      return Array.from({ length: 8 }, (_, i) => p[(i + offset) % p.length]);
    };
    K.loomTarget = function(r, row) {
      return this.loomOutput(...this.game("loom").stages[r.stage].rows[row]);
    };
    K.loom = function() {
      const r = this.run(), d = r.data, done = d.woven.length === 4, row = Math.min(3, d.woven.length), target = this.loomTarget(r, row), output = this.loomOutput(d.pattern, d.offset, d.reverse);
      this.frame(`<div class="loom-layout"><div><h3>Modelo da faixa</h3><div class="loom-cloth">${[0, 1, 2, 3].map((i) => cells(this.loomTarget(r, i), i === row && !done ? "loom-current" : "")).join("")}</div><p class="muted">A \xB7 dourado / B \xB7 azul / C \xB7 coral / D \xB7 verde. As letras identificam as cores.</p><h3>Seu tecido \xB7 ${d.woven.length} / 4 linhas</h3><div class="loom-cloth">${[0, 1, 2, 3].map((i) => cells(d.woven[i] || Array(8).fill(""), i === row && !done ? "loom-current" : "")).join("")}</div></div><aside class="culture-controls"><h3>${done ? "Faixa conclu\xEDda" : "Programa da linha " + (row + 1)}</h3><p>Escolha um motivo. O tear o repete at\xE9 preencher oito fios. Desloque o in\xEDcio ou espelhe a sequ\xEAncia.</p><label class="field">Motivo para repetir<select id="loom-pattern" ${done ? "disabled" : ""}>${patterns.map((p) => `<option value="${p}" ${p === d.pattern ? "selected" : ""}>${p.split("").join(" \xB7 ")}</option>`).join("")}</select></label><label class="field">Deslocamento do in\xEDcio<select id="loom-offset" ${done ? "disabled" : ""}>${[0, 1, 2, 3].map((i) => `<option value="${i}" ${i === d.offset ? "selected" : ""}>${i} posi\xE7\xE3o${i !== 1 ? "s" : ""}</option>`).join("")}</select></label><label class="toggle"><input id="loom-mirror" type="checkbox" ${d.reverse ? "checked" : ""} ${done ? "disabled" : ""}>Espelhar o motivo</label><p class="culture-code">REPETIR ${esc(d.pattern)} \u2192 ${Math.ceil(8 / d.pattern.length)} vezes<br>DESLOCAR ${d.offset} \xB7 ESPELHAR ${d.reverse ? "SIM" : "N\xC3O"}</p>${!done ? `<small>Pr\xE9via da lan\xE7adeira</small>${cells(output)}<small>Modelo desta linha</small>${cells(target)}` : ""}<button id="loom-hint" class="quiet" ${done ? "disabled" : ""}>Dica do tear</button></aside></div>`, done ? '<button id="culture-next" class="primary">Registrar faixa e continuar</button>' : '<button id="loom-weave" class="primary">Passar a lan\xE7adeira</button>');
      for (const [id, key] of [["loom-pattern", "pattern"], ["loom-offset", "offset"], ["loom-mirror", "reverse"]]) V.$("#" + id).onchange = (e) => {
        d[key] = key === "reverse" ? e.target.checked : key === "offset" ? +e.target.value : e.target.value;
        r.feedback = "";
        this.commit();
      };
      V.$("#loom-weave")?.addEventListener("click", () => this.weave());
      V.$("#culture-next")?.addEventListener("click", () => this.advance());
      V.$("#loom-hint").onclick = () => {
        const [p, n, rev] = this.game("loom").stages[r.stage].rows[row];
        this.feedback("Experimente o motivo " + p + ", deslocamento " + n + (rev ? " e espelhamento." : ", sem espelhar."));
      };
    };
    K.weave = function() {
      const r = this.run();
      if (r?.game !== "loom" || r.data.woven.length >= 4) return false;
      const d = r.data, expected = this.loomTarget(r, d.woven.length), actual = this.loomOutput(d.pattern, d.offset, d.reverse);
      r.moves++;
      const wrong = actual.findIndex((v, i) => v !== expected[i]);
      if (wrong >= 0) return this.feedback("O fio " + (wrong + 1) + " pede " + expected[wrong] + ", mas a pr\xE9via trouxe " + actual[wrong] + ". Ajuste o programa e tente outra vez.", true);
      d.woven.push(actual);
      r.feedback = "\u2713 Linha tecida. O motivo e suas transforma\xE7\xF5es foram registrados.";
      V.Audio.sfx("correct");
      this.commit();
      return true;
    };
    K.pressPieces = function(r) {
      const s = this.game("press").stages[r.stage];
      return [...new Set(s.layout.join(""))].map((id, i) => {
        const shape = [];
        s.layout.forEach((row, y) => [...row].forEach((v, x) => {
          if (v === id) shape.push([x, y]);
        }));
        const minX = Math.min(...shape.map((p) => p[0])), minY = Math.min(...shape.map((p) => p[1]));
        return { id, name: s.names[i], shape: shape.map(([x, y]) => [x - minX, y - minY]), solution: [minX, minY], color: i };
      });
    };
    K.rotateShape = function(shape, turns) {
      let p = shape.map((v) => v.slice());
      for (let i = 0; i < (turns % 4 + 4) % 4; i++) p = p.map(([x2, y2]) => [-y2, x2]);
      const x = Math.min(...p.map((v) => v[0])), y = Math.min(...p.map((v) => v[1]));
      return p.map(([a, b]) => [a - x, b - y]);
    };
    K.pressOccupied = function(r, exclude = null) {
      const out = new Map(), pieces = this.pressPieces(r);
      for (const [id, p] of Object.entries(r.data.placements)) {
        if (id === exclude) continue;
        const piece = pieces.find((x) => x.id === id);
        if (!piece) continue;
        for (const [x, y] of this.rotateShape(piece.shape, p.rot)) out.set((y + p.y) * 6 + x + p.x, id);
      }
      return out;
    };
    K.pressValid = function(r) {
      const occupied = new Set();
      for (const piece of this.pressPieces(r)) {
        const at = r.data.placements[piece.id];
        if (!at || !r.data.inspected.includes(piece.id)) return false;
        for (const [x, y] of this.rotateShape(piece.shape, at.rot)) {
          const px = x + at.x, py = y + at.y, key = py * 6 + px;
          if (px < 0 || px >= 6 || py < 0 || py >= 4 || occupied.has(key)) return false;
          occupied.add(key);
        }
      }
      return occupied.size === 24;
    };
    K.press = function() {
      const r = this.run(), d = r.data, s = this.game("press").stages[r.stage], pieces = this.pressPieces(r), selected = pieces.find((x) => x.id === d.selected) || pieces[0], shape = this.rotateShape(selected.shape, d.rotations[selected.id] || 0), w = Math.max(...shape.map((p) => p[0])) + 1, h = Math.max(...shape.map((p) => p[1])) + 1, occupied = this.pressOccupied(r), source = D.sources[s.source];
      this.frame(`<div class="press-layout"><div class="press-sheet ${d.printed ? "press-printed" : ""}"><header><small>NEW HARMONY \xB7 EDI\xC7\xC3O ${r.stage + 1}</small><h3>Jornal das Vozes</h3></header><div id="press-board" class="press-board" aria-label="P\xE1gina com seis colunas e quatro linhas">${Array.from({ length: 24 }, (_, i) => {
        const id = occupied.get(i), piece = pieces.find((p) => p.id === id);
        return `<button data-press-cell="${i}" class="${id ? "press-ink-" + piece.color : ""} ${id === d.selected ? "press-selected" : ""}" aria-label="Coluna ${i % 6 + 1}, linha ${Math.floor(i / 6) + 1}${id ? ", bloco " + piece.name : ", espa\xE7o livre"}" ${d.printed ? "disabled" : ""}>${id || "\xB7"}</button>`;
      }).join("")}</div><footer>FONTES E AUTORIA PRESERVADAS NAS FICHAS \xB7 ${occupied.size}/24 espa\xE7os</footer></div><aside class="culture-controls"><h3>Blocos tipogr\xE1ficos</h3><p>Toque num bloco para examinar sua ficha. Gire a pe\xE7a e toque no canto da p\xE1gina onde ela deve come\xE7ar. Preencha os 24 espa\xE7os.</p><div class="press-tray">${pieces.map((p) => `<button data-press-piece="${p.id}" class="${p.id === d.selected ? "active" : ""}" aria-pressed="${p.id === d.selected}"><b>${p.id}</b><span>${esc(p.name)}</span><small>${d.placements[p.id] ? "\u2713 Diagramado" : d.inspected.includes(p.id) ? "Ficha aberta" : "Examinar ficha"}</small></button>`).join("")}</div><div class="press-piece-preview" style="--piece-cols:${w}">${Array.from({ length: w * h }, (_, i) => `<i class="${shape.some((p) => p[0] === i % w && p[1] === Math.floor(i / w)) ? "ink" : ""}"></i>`).join("")}</div><p><b>${selected.id} \xB7 ${esc(selected.name)}</b> \xB7 giro ${(d.rotations[selected.id] || 0) * 90}\xB0</p><div class="row"><button id="press-rotate" class="secondary" ${d.printed ? "disabled" : ""}>Girar 90\xB0</button><button id="press-remove" class="quiet" ${!d.placements[selected.id] || d.printed ? "disabled" : ""}>Retirar bloco</button><button id="press-undo" class="quiet" ${!d.history.length || d.printed ? "disabled" : ""}>Desfazer</button></div><button id="press-hint" class="quiet" ${d.printed ? "disabled" : ""}>Dica de encaixe</button></aside></div><article class="culture-source"><small>FICHA DA EDI\xC7\xC3O \xB7 ${d.inspected.length}/${pieces.length} blocos examinados</small><h3>${esc(source.name)}</h3><p>${esc(source.text)}</p><p>${d.inspected.includes(selected.id) ? "Ficha aberta: " + esc(selected.name) + ". Esta pe\xE7a usa " + shape.length + " espa\xE7os da edi\xE7\xE3o ficcional." : "Selecione um bloco na bandeja para abrir sua ficha antes de imprimir."}</p></article>`, d.printed ? '<button id="culture-next" class="primary">Registrar edi\xE7\xE3o e continuar</button>' : `<button id="press-print" class="primary" ${this.pressValid(r) ? "" : "disabled"}>Rodar a prensa</button>`);
      V.$$("[data-press-piece]").forEach((b) => b.onclick = () => {
        d.selected = b.dataset.pressPiece;
        if (!d.inspected.includes(d.selected)) d.inspected.push(d.selected);
        this.commit();
      });
      V.$$("[data-press-cell]").forEach((b) => b.onclick = () => this.placePress(+b.dataset.pressCell % 6, Math.floor(+b.dataset.pressCell / 6)));
      V.$("#press-rotate").onclick = () => {
        d.rotations[d.selected] = ((d.rotations[d.selected] || 0) + 1) % 4;
        r.moves++;
        this.commit();
      };
      V.$("#press-remove").onclick = () => {
        d.history.push(JSON.stringify(d.placements));
        delete d.placements[d.selected];
        r.moves++;
        this.commit();
      };
      V.$("#press-undo").onclick = () => {
        const p = d.history.pop();
        if (p) {
          d.placements = JSON.parse(p);
          r.moves++;
          this.commit();
        }
      };
      V.$("#press-hint").onclick = () => {
        const p = pieces.find((x) => !d.placements[x.id]) || selected;
        d.selected = p.id;
        d.rotations[p.id] = 0;
        if (!d.inspected.includes(p.id)) d.inspected.push(p.id);
        r.feedback = "Uma composi\xE7\xE3o poss\xEDvel come\xE7a com " + p.id + " na coluna " + (p.solution[0] + 1) + ", linha " + (p.solution[1] + 1) + ", sem giro. Retire outras pe\xE7as se esse espa\xE7o estiver ocupado.";
        this.commit();
      };
      V.$("#press-print")?.addEventListener("click", () => this.printPress());
      V.$("#culture-next")?.addEventListener("click", () => this.advance());
    };
    K.placePress = function(x, y) {
      const r = this.run();
      if (r?.game !== "press" || r.data.printed || !Number.isInteger(x) || !Number.isInteger(y)) return false;
      const d = r.data, p = this.pressPieces(r).find((p2) => p2.id === d.selected), rot = d.rotations[p.id] || 0, shape = this.rotateShape(p.shape, rot), occupied = this.pressOccupied(r, p.id);
      r.moves++;
      if (!d.inspected.includes(p.id)) return this.feedback("Abra a ficha do bloco " + p.id + " na bandeja antes de diagram\xE1-lo.", true);
      if (shape.some(([a, b]) => x + a < 0 || x + a >= 6 || y + b < 0 || y + b >= 4 || occupied.has((y + b) * 6 + x + a))) return this.feedback("O bloco ultrapassa a margem ou cobre outra pe\xE7a. Gire, escolha outro lugar ou use Desfazer.", true);
      d.history.push(JSON.stringify(d.placements));
      d.history = d.history.slice(-80);
      d.placements[p.id] = { x, y, rot };
      r.feedback = "\u2713 Bloco " + p.id + " diagramado. As fichas e os cr\xE9ditos foram preservados.";
      V.Audio.sfx("correct");
      this.commit();
      return true;
    };
    K.printPress = function() {
      const r = this.run();
      if (r?.game !== "press" || r.data.printed || !this.pressValid(r)) return false;
      r.data.printed = true;
      r.moves++;
      r.feedback = "\u2713 Edi\xE7\xE3o impressa: todas as vozes couberam e as fontes foram preservadas.";
      V.Audio.sfx("collect");
      this.commit();
      return true;
    };
  })();
});
