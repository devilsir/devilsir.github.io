/* Registered module: workshop-community */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("workshop-community", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function workshopCommunity() {
    "use strict";
    const V = window.V, A = V.LearningArcade, R = V.AncestralActivities, U = V.WorkshopUI, T = V.Tutorials, esc = V.escape, on = (id, fn) => {
      const b = V.$("#" + id);
      if (b) b.onclick = fn;
    };
    const originalEnsure = A.ensure.bind(A);
    A.ensure = function() {
      const a = originalEnsure();
      if (!a) return a;
      a.runs ||= {};
      if (a.run && !a.run.finished) a.runs[a.run.game] = a.run;
      const definition = T.definitions[T.active];
      return definition?.family === "arcade" ? { ...a, run: T.record(T.active).practice } : a;
    };
    const start = A.start.bind(A), resume = A.resume.bind(A);
    A.start = function(id) {
      if (!this.games.some((g) => g.id === id)) return false;
      const a = originalEnsure();
      a.runs ||= {};
      if (a.run && !a.run.finished) a.runs[a.run.game] = a.run;
      if (a.runs[id] && !a.runs[id].finished) a.run = a.runs[id];
      else {
        a.run = null;
        this.creating = true;
        try {
          start(id);
        } finally {
          this.creating = false;
        }
      }
      const r = a.run;
      if (r) a.runs[id] = r;
      return T.gate("arcade:" + id, () => this.resume(), !!r?.moves || a.completed.some((r2) => r2.game === id));
    };
    A.resume = function() {
      if (this.creating) return true;
      const r = this.ensure().run;
      if (!r) return this.menu();
      this.selected = r.selection ?? null;
      return this[r.game]();
    };
    for (const id of ["courier", "restoration"]) {
      const render = A[id].bind(A);
      A[id] = function() {
        return U.render("arcade:" + id, () => {
          render();
          U.bind("arcade:" + id);
          if (id === "restoration") {
            const r = this.ensure().run, guide = V.$("#mosaic-guide");
            if (guide) guide.hidden = !r.guide && !r.tiles.every((n, i) => n === i);
            on("mosaic-preview", () => {
              r.guide = !r.guide;
              guide.hidden = !r.guide;
              V.Save.save();
              T.event("mosaic-guide");
            });
          }
          return true;
        });
      };
    }
    const finish = A.finish.bind(A);
    A.finish = function() {
      const r = this.ensure().run;
      if (T.practice("arcade", r?.game)) {
        T.event("finish");
        return true;
      }
      const id = r?.game, ok = finish();
      if (ok && id) delete originalEnsure().runs?.[id];
      return ok;
    };
    const collect = V.PixCollection.collect.bind(V.PixCollection);
    V.PixCollection.collect = function(...args) {
      return T.active ? false : collect(...args);
    };
    const rounds = [{ item: "sofa", goal: [1, 1], command: "Put the sofa to the left of the table.", words: ["sofa", "left", "table"] }, { item: "plant", goal: [1, 1], command: "Put the plant above the table.", words: ["plant", "above", "table"] }, { item: "bed", goal: [2, 1], command: "Put the bed under the window.", words: ["bed", "under", "window"] }, { item: "chair", goal: [1, 1], command: "Put the chair between the sofa and the plant.", words: ["chair", "between", "sofa", "plant"] }];
    A.furniture = function() {
      const r = this.ensure().run, l = rounds[r?.stage];
      if (r?.game !== "furniture") return;
      if (!l) return this.finish();
      U.render("arcade:furniture", () => {
        V.UI.modal("Mudan\xE7a em ingl\xEAs", "C\xD4MODO " + (r.stage + 1) + "/4", `<div class="arcade-objective"><small>PEDIDO</small><h3 lang="en">${esc(l.command)}</h3>${this.keywords(l.command)}</div><div class="arcade-room-layout"><section><div class="room-touch-board"><canvas id="arcade-room" width="560" height="560" aria-label="Planta 4 por 4"></canvas><div class="room-touch-grid" role="grid" aria-label="Escolher posi\xE7\xE3o na planta">${Array.from({ length: 16 }, (_, i) => `<button data-room-cell="${i}" aria-label="Coluna ${i % 4 + 1}, linha ${Math.floor(i / 4) + 1}" aria-selected="${r.position[0] === i % 4 && r.position[1] === Math.floor(i / 4)}" ${r.opened ? "" : "disabled"}><span>${String.fromCharCode(65 + i % 4)}${Math.floor(i / 4) + 1}</span></button>`).join("")}</div></div><p id="arcade-room-feedback" class="classic-status" role="status">${esc(r.feedback || "Abra a caixa, observe os m\xF3veis de refer\xEAncia e escolha uma casa da planta.")}</p></section><aside class="culture-controls"><h3>Organizar o c\xF4modo</h3><button id="arcade-open-box" class="primary">${r.opened ? "\u2713 Caixa aberta" : "Abrir caixa \xB7 " + l.item}</button><button id="arcade-inspect-order" class="secondary">Examinar etiquetas do pedido</button><p>As letras identificam as colunas; os n\xFAmeros, as linhas. Toque numa casa ou use as setas no tabuleiro.</p><button id="arcade-room-check" class="primary workshop-main" ${r.opened ? "" : "disabled"}>Conferir arruma\xE7\xE3o</button><button id="community-hint" class="quiet">Pedir uma dica</button></aside></div>`, this.footer(), true);
        on("arcade-open-box", () => {
          r.opened = true;
          V.PixCollection.collect(l.item, "Caixa da mudan\xE7a");
          V.Save.save();
          this.furniture();
          T.event("room-box");
        });
        on("arcade-inspect-order", () => {
          for (const word of l.words) V.PixCollection.collect(word, "Etiqueta do pedido da mudan\xE7a");
          this.furniture();
          T.event("room-labels");
        });
        V.$$("[data-room-cell]").forEach((b) => b.onclick = () => this.placeRoom(+b.dataset.roomCell % 4, Math.floor(+b.dataset.roomCell / 4)));
        on("arcade-room-check", () => this.checkRoom());
        on("community-hint", () => U.hint("room:" + r.stage, ["Identifique o m\xF3vel de refer\xEAncia e procure a palavra que descreve a posi\xE7\xE3o.", l.item === "sofa" ? "To the left of indica o lado esquerdo do m\xF3vel de refer\xEAncia. Compare a linha dos dois m\xF3veis." : l.item === "plant" ? "Above indica uma posi\xE7\xE3o acima; under fica abaixo; between indica um espa\xE7o entre duas refer\xEAncias." : "Observe a posi\xE7\xE3o relativa na planta; n\xE3o \xE9 preciso adivinhar a orienta\xE7\xE3o de quem est\xE1 no quarto.", () => `Neste pedido, experimente a coluna ${l.goal[0] + 1}, linha ${l.goal[1] + 1}. Confira o significado da preposi\xE7\xE3o antes de confirmar.`], "#arcade-room-feedback"));
        this.bindPause();
        this.paintFurniture();
        U.grid(V.$(".room-touch-grid"), "[data-room-cell]", 4);
        U.bind("arcade:furniture");
      });
    };
    const place = A.placeRoom.bind(A);
    A.placeRoom = function(x, y) {
      const ok = place(x, y), r = this.ensure().run;
      if (ok) {
        r.feedback = "M\xF3vel na coluna " + (x + 1) + ", linha " + (y + 1) + ". Confira sua rela\xE7\xE3o com a refer\xEAncia antes de confirmar.";
        V.$("#arcade-room-feedback").textContent = r.feedback;
        V.$$("[data-room-cell]").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.roomCell === y * 4 + x)));
        T.event("room-place", { x, y });
        U.pulse(V.$(".room-touch-board"));
        V.Save.save();
      }
      return ok;
    };
    const check = A.checkRoom.bind(A);
    A.checkRoom = function() {
      const ok = check();
      if (ok) T.event("room-check");
      return ok;
    };
    const walk = A.walkCourier.bind(A), cargo = A.takeCargo.bind(A), interact = A.courierInteract.bind(A);
    A.walkCourier = function(dx, dy) {
      if (T.active === "arcade:courier") {
        const direction = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
        if (V.$('[data-courier-dir="' + direction + '"]')?.disabled) return false;
      }
      const ok = walk(dx, dy);
      if (ok) {
        this.ensure().run.depotOpen = false;
        this.paintCourier();
        T.event("courier-walk");
      } else if (V.$("#courier-feedback")) V.$("#courier-feedback").textContent = "H\xE1 uma \xE1rvore ou borda nessa dire\xE7\xE3o. A passagem continua pelos caminhos claros.";
      return ok;
    };
    A.takeCargo = function(item) {
      const ok = cargo(item);
      if (ok) T.event("courier-cargo", { item });
      return ok;
    };
    A.courierInteract = function() {
      const ok = interact(), r = this.ensure().run;
      if (ok) {
        if (r?.game === "courier" && r.player.join(",") === "1,5") r.depotOpen = true;
        V.Save.save();
        T.event("courier-interact");
      }
      return ok;
    };
    const courier = A.courier.bind(A);
    A.courier = function() {
      const result = courier(), r = this.ensure().run;
      if (r?.game !== "courier" || !V.$("#arcade-courier")) return result;
      const aside = V.$(".arcade-courier-layout aside");
      if (r.depotOpen && !r.cargo && r.player.join(",") === "1,5") {
        V.$("#courier-cargo-options").innerHTML = ["book", "letter", "parcel"].map((item) => `<button data-courier-cargo="${item}" class="secondary">Retirar ${item}</button>`).join("");
        V.$$("[data-courier-cargo]").forEach((b) => b.onclick = () => this.takeCargo(b.dataset.courierCargo));
      }
      if (!V.$("#courier-routes")) {
        const nav = document.createElement("div");
        nav.id = "courier-routes";
        nav.className = "classic-actions";
        nav.innerHTML = Object.keys(this.stops).map((id) => `<button data-courier-route="${id}" class="quiet">${esc(id)}</button>`).join("");
        aside.append(nav);
      }
      V.$$("[data-courier-route]").forEach((b) => b.onclick = () => this.routeCourier(b.dataset.courierRoute));
      V.$("#arcade-courier").onclick = (e) => {
        const box = e.currentTarget.getBoundingClientRect(), x = Math.floor((e.clientX - box.left) / box.width * 11), y = Math.floor((e.clientY - box.top) / box.height * 7);
        this.routeCourier([x, y]);
      };
      if (!V.$("#community-hint")) {
        const b = document.createElement("button");
        b.id = "community-hint";
        b.className = "quiet";
        b.textContent = "Pedir uma dica";
        aside.append(b);
      }
      on("community-hint", () => {
        const task = r.tasks[r.delivered.length];
        U.hint("courier:" + r.delivered.length, ["O pedido diz o objeto e o destino. Primeiro retire a encomenda no depot.", "Take the\u2026to the\u2026 liga a carga ao destino. Leve uma carga por vez; o dep\xF3sito aceita devolu\xE7\xF5es.", () => `O pedido atual \xE9 ${task.item} para ${task.to}. Retire essa caixa no depot e confirme a entrega no pr\xE9dio de destino.`], "#courier-feedback");
      });
      U.bind("arcade:courier");
      return result;
    };
    A.routeCourier = function(destination) {
      if (T.active === "arcade:courier" && !V.$("[data-courier-route]:not(:disabled),[data-courier-dir]:not(:disabled)")) return false;
      const r = this.ensure().run;
      if (r?.game !== "courier") return false;
      const goal = Array.isArray(destination) ? destination : this.stops[destination];
      if (!goal || this.blocked(...goal)) return false;
      const queue = [r.player.slice()], parent = new Map([[r.player.join(","), null]]);
      let found = null;
      for (let i = 0; i < queue.length; i++) {
        const p = queue[i];
        if (p[0] === goal[0] && p[1] === goal[1]) {
          found = p;
          break;
        }
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
          const next = [p[0] + dx, p[1] + dy], key = next.join(",");
          if (!this.blocked(...next) && !parent.has(key)) {
            parent.set(key, p);
            queue.push(next);
          }
        }
      }
      if (!found) return false;
      const path = [];
      while (parent.get(found.join(","))) {
        path.unshift(found);
        found = parent.get(found.join(","));
      }
      clearTimeout(this.courierTimer);
      const step = () => {
        if (this.ensure().run !== r || !V.$("#arcade-courier") || !path.length) return;
        const p = path.shift();
        this.walkCourier(p[0] - r.player[0], p[1] - r.player[1]);
        this.courierTimer = setTimeout(step, V.settings.reducedMotion ? 45 : 100);
      };
      step();
      return true;
    };
    A.swapMosaic = function(index) {
      const r = this.ensure().run;
      if (r?.game !== "restoration" || index < 0 || index > 8 || r.tiles.every((v, i) => v === i)) return false;
      if (r.selection == null) {
        r.selection = index;
        this.selected = index;
        V.$$("[data-mosaic]").forEach((b) => b.classList.toggle("selected", +b.dataset.mosaic === index));
        V.Save.save();
        T.event("mosaic-select", { index });
        return true;
      }
      if (r.selection === index) {
        r.selection = null;
        this.selected = null;
        V.$$("[data-mosaic]").forEach((b) => b.classList.remove("selected"));
        V.Save.save();
        return false;
      }
      [r.tiles[index], r.tiles[r.selection]] = [r.tiles[r.selection], r.tiles[index]];
      r.selection = null;
      this.selected = null;
      r.moves++;
      V.Save.save();
      this.restoration();
      T.event("mosaic-swap");
      if (V.$("#mosaic-feedback")) V.$("#mosaic-feedback").textContent = "Fragmentos trocados. " + r.tiles.filter((v, i) => v === i).length + " de 9 posi\xE7\xF5es est\xE3o corretas.";
      return true;
    };
    A.timeline = function() {
      const r = this.ensure().run;
      if (r?.game !== "timeline") return;
      const records = this.records, selected = records[r.selected || 0], seen = r.inspected.includes(selected.id);
      U.render("arcade:timeline", () => {
        V.UI.modal("Oficina do tempo", "FONTES, DATAS E ORDEM CRONOL\xD3GICA", `<p class="classic-status">Abra a fonte, ajuste o ano da ficha e organize da mais antiga \xE0 mais recente. As setas funcionam por toque e teclado.</p><div class="classic-grid"><section class="classic-order">${r.order.map((idx, pos) => {
          const f = records[idx];
          return `<article data-key="time-${f.id}" class="${idx === r.selected ? "selected" : ""}"><span>0${pos + 1}</span><div><h3>${esc(f.title)}</h3><p>${esc(f.name)} \xB7 <b>${r.dates[idx]}</b></p><button data-timeline-open="${idx}" class="secondary">${r.inspected.includes(f.id) ? "\u2713 Rever fonte" : "Abrir documento"}</button></div><div class="row"><button data-timeline-shift="${pos}:-1" class="quiet" ${pos === 0 ? "disabled" : ""} aria-label="Mover ${esc(f.name)} para antes">\u2191</button><button data-timeline-shift="${pos}:1" class="quiet" ${pos === 3 ? "disabled" : ""} aria-label="Mover ${esc(f.name)} para depois">\u2193</button></div></article>`;
        }).join("")}</section><aside class="culture-controls"><small>FONTE DA FICHA SELECIONADA</small><h3>${esc(selected.name)}</h3>${seen ? `<strong>${selected.year} \xB7 ${esc(selected.title)}</strong><p>${esc(selected.summary)}</p><a href="${esc(selected.url)}" target="_blank" rel="noopener noreferrer">${esc(selected.source)} \u2197</a>` : "<p>Abra o documento desta ficha antes de decidir sobre a data.</p>"}<label class="field">Ano na ficha<input id="timeline-year" type="number" min="1800" max="2026" value="${r.dates[r.selected || 0]}" ${seen ? "" : "disabled"}></label><div class="timeline-date"><button data-year-change="${r.selected || 0}:-10" ${seen ? "" : "disabled"} aria-label="Diminuir dez anos">\u221210</button><button data-year-change="${r.selected || 0}:-1" ${seen ? "" : "disabled"} aria-label="Diminuir um ano">\u22121</button><button data-year-change="${r.selected || 0}:1" ${seen ? "" : "disabled"} aria-label="Aumentar um ano">+1</button><button data-year-change="${r.selected || 0}:10" ${seen ? "" : "disabled"} aria-label="Aumentar dez anos">+10</button></div><p id="timeline-feedback" class="classic-status" role="status">${r.inspected.length}/4 fontes consultadas</p><button id="community-hint" class="quiet">Pedir uma dica</button><button id="timeline-check" class="primary workshop-main">Conferir exposi\xE7\xE3o</button></aside></div>`, this.footer(), true);
        V.$$("[data-timeline-open]").forEach((b) => b.onclick = () => {
          r.selected = +b.dataset.timelineOpen;
          if (!r.inspected.includes(records[r.selected].id)) r.inspected.push(records[r.selected].id);
          V.PixCollection.collect("date", "Documento da oficina do tempo");
          V.PixCollection.collect("source", "Oficina do tempo \xB7 consulta de fonte");
          V.Save.save();
          this.timeline();
          T.event("timeline-open", { index: r.selected });
        });
        V.$$("[data-timeline-shift]").forEach((b) => b.onclick = () => {
          const [pos, delta] = b.dataset.timelineShift.split(":").map(Number);
          this.moveTimeline(pos, pos + delta);
        });
        V.$$("[data-year-change]").forEach((b) => b.onclick = () => {
          const [idx, delta] = b.dataset.yearChange.split(":").map(Number);
          this.adjustDate(idx, delta);
        });
        V.$("#timeline-year").onchange = (e) => {
          const value = +e.target.value;
          if (Number.isInteger(value) && value >= 1800 && value <= 2026) {
            r.dates[r.selected] = value;
            r.moves++;
            V.Save.save();
            this.timeline();
            T.event("timeline-year");
          }
        };
        on("timeline-check", () => this.checkTimeline());
        on("community-hint", () => U.hint("community-time", ["A fonte consultada conserva o ano; a ficha \xE9 o registro que voc\xEA est\xE1 corrigindo.", "Depois de conferir os anos, compare dois vizinhos. O ano menor deve ficar antes; reordenar n\xE3o muda a data escrita.", () => `A fonte de ${selected.name} registra ${selected.year}. Ajuste essa ficha e depois a compare com as vizinhas.`], "#timeline-feedback"));
        this.bindPause();
        U.bind("arcade:timeline");
      });
    };
    const adjust = A.adjustDate.bind(A), move = A.moveTimeline.bind(A);
    A.adjustDate = function(...args) {
      const ok = adjust(...args);
      if (ok) T.event("timeline-year");
      return ok;
    };
    A.moveTimeline = function(...args) {
      const ok = move(...args);
      if (ok) T.event("timeline-order");
      return ok;
    };
    function make(game) {
      const r = { id: "practice-" + game, game, stage: 0, moves: 0, mistakes: 0, finished: false };
      if (game === "furniture") Object.assign(r, { position: [3, 3], opened: false, cleared: [] });
      if (game === "courier") Object.assign(r, { player: [1, 5], cargo: null, delivered: [], tasks: [{ item: "book", to: "library" }] });
      if (game === "restoration") Object.assign(r, { deck: ["machado"], tiles: [1, 0, 2, 3, 4, 5, 6, 7, 8], restored: [] });
      if (game === "timeline") Object.assign(r, { order: [1, 0, 2, 3], dates: [1898, 1960, 1961, 1962], inspected: [], selected: 0 });
      return r;
    }
    const common = (id) => ({ family: "arcade", id, create: () => make(id), render() {
      A[id]();
    }, resume() {
      if (originalEnsure().run) A.resume();
      else A.start(id);
    } });
    T.define("arcade:furniture", { ...common("furniture"), steps: [{ title: "Abra a caixa do pedido", text: "O pedido est\xE1 em ingl\xEAs. Abra a caixa para liberar o m\xF3vel; os outros m\xF3veis s\xE3o refer\xEAncias da posi\xE7\xE3o.", target: "#arcade-open-box", allow: "#arcade-open-box", event: "room-box", after: "O m\xF3vel apareceu na planta. Voc\xEA pode test\xE1-lo em mais de uma posi\xE7\xE3o antes de confirmar." }, { title: "Compare duas posi\xE7\xF5es", text: "To the left of indica o lado esquerdo. Escolha uma casa \xE0 esquerda da mesa, na mesma linha. As letras e os n\xFAmeros ajudam a localizar a posi\xE7\xE3o.", target: ".room-touch-grid", allow: "[data-room-cell],#community-hint", event: "room-place", test: (d) => d.x === 1 && d.y === 1, after: "O sof\xE1 ficou \xE0 esquerda da mesa. Alterar a posi\xE7\xE3o ainda n\xE3o conclui o pedido." }, { title: "Confira o pedido", text: "Toque em Conferir arruma\xE7\xE3o. Uma tentativa incorreta permite mover de novo; n\xE3o h\xE1 cron\xF4metro.", target: "#arcade-room-check", allow: "#arcade-room-check,[data-room-cell]", event: "room-check", after: "Voc\xEA leu, posicionou e conferiu. Agora pode praticar os outros pedidos na sua partida." }] });
    T.define("arcade:courier", { ...common("courier"), steps: [{ title: "Retire uma encomenda", text: "Voc\xEA est\xE1 no depot, o dep\xF3sito. Toque em Retirar / entregar para ver as caixas dispon\xEDveis.", target: "#courier-interact", allow: "#courier-interact", event: "courier-interact" }, { title: "Leia qual caixa foi pedida", text: "O pedido pede book para library. Escolha a caixa book; retirar outra caixa pode ser corrigido devolvendo-a ao dep\xF3sito.", target: '[data-courier-cargo="book"]', allow: '[data-courier-cargo="book"]', event: "courier-cargo", test: (d) => d.item === "book" }, { title: "D\xEA um passo no mapa", text: "Use Caminhar para cima. Voc\xEA tamb\xE9m pode tocar num destino do mapa para seguir um caminho, sem atravessar \xE1rvores.", target: '[data-courier-dir="up"]', allow: "[data-courier-dir]", event: "courier-walk", after: "Sua posi\xE7\xE3o mudou, mas a entrega ainda precisa ser confirmada no pr\xE9dio correto." }, { title: "Complete uma entrega de treino", text: "Siga at\xE9 library e toque em Retirar / entregar. Os controles e o pedido permanecem junto ao mapa.", allow: "[data-courier-dir],[data-courier-route],#arcade-courier,#courier-interact,#community-hint", event: "finish", after: "O livro chegou \xE0 biblioteca. Na sua partida h\xE1 outros pedidos e nenhuma entrega deste treino concede moedas." }] });
    T.define("arcade:restoration", { ...common("restoration"), steps: [{ title: "Observe a refer\xEAncia", text: "Abra a imagem de refer\xEAncia. O retrato \xE9 uma ilustra\xE7\xE3o educativa, e a ficha de trajet\xF3ria aparece quando ele \xE9 restaurado.", target: "#mosaic-preview", allow: "#mosaic-preview", event: "mosaic-guide" }, { title: "Escolha um fragmento", text: "Selecione o primeiro fragmento. Ele fica marcado at\xE9 voc\xEA escolher a segunda posi\xE7\xE3o.", target: '[data-mosaic="0"]', allow: '[data-mosaic="0"]', event: "mosaic-select", test: (d) => d.index === 0 }, { title: "Troque as duas posi\xE7\xF5es", text: "Selecione o segundo fragmento. Os dois trocam de lugar; a borda indica os encaixes corretos.", target: '[data-mosaic="1"]', allow: '[data-mosaic="1"]', event: "mosaic-swap", after: "O pequeno mosaico de treino est\xE1 restaurado. Voc\xEA pode conferir autoria, trajet\xF3ria e a fonte da ficha." }, { title: "Registre a restaura\xE7\xE3o", text: "Leia a ficha e toque em Registrar restaura\xE7\xE3o. A conclus\xE3o deste treino volta \xE0 sua partida original.", target: "#mosaic-next", allow: "#mosaic-next", event: "finish" }] });
    T.define("arcade:timeline", { ...common("timeline"), steps: [{ title: "Confira um documento", text: "Abra a fonte de Machado de Assis. A data da fonte e o ano escrito na ficha t\xEAm fun\xE7\xF5es diferentes.", target: '[data-timeline-open="0"]', allow: '[data-timeline-open="0"]', event: "timeline-open", test: (d) => d.index === 0, after: "A sess\xE3o inaugural \xE9 documentada em 1897. A ficha de treino est\xE1 um ano adiante." }, { title: "Corrija o ano da ficha", text: "Diminua um ano ou digite 1897. A fonte continua vis\xEDvel enquanto voc\xEA ajusta a data.", target: '#timeline-year,[data-year-change="0:-1"]', allow: "#timeline-year,[data-year-change]", event: "timeline-year", test: (d, r) => r.dates[0] === 1897 }, { title: "Organize a cronologia", text: "A ficha de 1897 precisa vir antes da de 1960. Use a seta da ficha para mov\xEA-la uma posi\xE7\xE3o.", target: "[data-timeline-shift]", allow: "[data-timeline-shift]", event: "timeline-order", test: (d, r) => r.order[0] === 0 }, { title: "Confronte as outras fontes", text: "Abra os outros tr\xEAs documentos e depois confira a exposi\xE7\xE3o. As datas restantes deste treino j\xE1 coincidem com as fontes.", allow: "[data-timeline-open],[data-timeline-shift],[data-year-change],#timeline-year,#timeline-check,#community-hint", event: "finish", after: "Voc\xEA conferiu as fontes, corrigiu a data e ordenou os documentos. Agora pode continuar a exposi\xE7\xE3o guardada." }] });
    const rootRun = R.run.bind(R);
    R.run = function(id = this.active) {
      return T.practice("roots", id) || rootRun(id);
    };
    const rootShow = R.show.bind(R);
    R.show = function(id = this.active) {
      return U.render("roots:" + id, () => {
        rootShow(id);
        const button = V.$("#roots-activity-help");
        if (button) {
          button.textContent = "Rever como jogar";
          button.onclick = () => T.open("roots:" + id, true);
        }
        V.$$("[data-roots-left]").forEach((b) => {
          const fn = b.onclick;
          b.onclick = (e) => {
            fn(e);
            V.Save.save();
            T.event("roots-left", { index: +b.dataset.rootsLeft });
          };
        });
        if (!V.$("#roots-gradual-hint")) {
          const b = document.createElement("button");
          b.id = "roots-gradual-hint";
          b.className = "quiet";
          b.textContent = "Pedir uma dica";
          V.$(".modal-footer")?.prepend(b);
        }
        on("roots-gradual-hint", () => {
          const g = R.game(id), r = R.run(id), i = r.selected ?? g.pairs.findIndex((_, i2) => !r.matches.includes(i2));
          U.hint("roots:" + id, [g.mode === "order" ? "Procure a a\xE7\xE3o que prepara as demais e a a\xE7\xE3o que registra o resultado." : "Leia o cart\xE3o em ingl\xEAs e procure a explica\xE7\xE3o da mesma a\xE7\xE3o, n\xE3o apenas uma palavra parecida.", g.mode === "order" ? "Compare duas etapas vizinhas: uma precisa ocorrer antes para que a outra fa\xE7a sentido." : "A explica\xE7\xE3o precisa manter o sentido completo do cart\xE3o. Compare o verbo e o contexto.", () => g.mode === "order" ? "A primeira etapa \xE9: " + g.pairs[0].en + "." : g.pairs[i].en + " corresponde a " + g.pairs[i].pt + "."], "#roots-activity-feedback");
        });
        U.bind("roots:" + id);
      });
    };
    R.open = function(id) {
      const g = this.game(id);
      if (!g || !V.state) return false;
      this.active = id;
      const s = V.Ancestral.ensure();
      if (!s.runs[id] || s.runs[id].finished) this.create(id);
      return T.gate("roots:" + id, () => this.show(id), !!s.runs[id].moves || !!s.activities[id]);
    };
    R.tutorial = function(id = this.active) {
      return T.open("roots:" + id, !!T.record("roots:" + id)?.completed);
    };
    const rootPair = R.pair.bind(R), rootMove = R.move.bind(R), rootFinish = R.finish.bind(R);
    R.pair = function(index) {
      const r = this.run(), g = this.game(this.active), selected = r?.selected, ok = rootPair(index);
      if (ok) T.event("roots-pair");
      else if (selected !== null && selected !== void 0 && g.pairs[index] && g.pairs[selected] && V.$("#roots-activity-feedback")) {
        r.feedback = "Voc\xEA ligou \u201C" + g.pairs[selected].en + "\u201D a \u201C" + g.pairs[index].pt + "\u201D. Essa explica\xE7\xE3o se refere a outra a\xE7\xE3o; compare o contexto e tente outra liga\xE7\xE3o.";
        V.$("#roots-activity-feedback").textContent = r.feedback;
      }
      return ok;
    };
    R.move = function(...args) {
      const ok = rootMove(...args);
      if (ok) T.event("roots-move");
      return ok;
    };
    R.finish = function() {
      if (T.practice("roots", this.active)) {
        T.event("finish");
        return true;
      }
      return rootFinish();
    };
    for (const g of V.AncestralData.activities) T.define("roots:" + g.id, { family: "roots", id: g.id, create() {
      const n = g.pairs.length;
      return { version: 1, matches: [], selected: null, order: g.mode === "order" ? [1, 0, ...Array.from({ length: n - 2 }, (_, i) => i + 2)] : Array.from({ length: n }, (_, i) => n - 1 - i), moves: 0, finished: false, feedback: "" };
    }, render() {
      R.active = g.id;
      R.show(g.id);
    }, resume() {
      R.active = g.id;
      R.show(g.id);
    }, steps: g.mode === "order" ? [{ title: "Mude uma etapa de posi\xE7\xE3o", text: "Neste treino, as duas primeiras etapas est\xE3o invertidas. Use uma seta para colocar \u201C" + g.pairs[0].en + "\u201D antes de \u201C" + g.pairs[1].en + "\u201D.", target: "[data-roots-move]", allow: "[data-roots-move]", event: "roots-move", test: (d, r) => r.order[0] === 0 }, { title: "Confira a sequ\xEAncia", text: "Leia a sequ\xEAncia resultante e toque em Conferir. A ordem correta prepara a a\xE7\xE3o e termina com revis\xE3o ou registro.", target: "#roots-order-check", allow: "#roots-order-check", event: "finish" }] : [{ title: "Escolha um cart\xE3o em ingl\xEAs", text: "Selecione \u201C" + g.pairs[0].en + "\u201D. Depois voc\xEA vai procurar a explica\xE7\xE3o da mesma ideia.", target: '[data-roots-left="0"]', allow: '[data-roots-left="0"]', event: "roots-left", test: (d) => d.index === 0 }, { title: "Ligue a ideia ao seu sentido", text: "Toque em \u201C" + g.pairs[0].pt + "\u201D. Compare o contexto completo; uma tentativa diferente pode ser corrigida.", target: '[data-roots-right="0"]', allow: '[data-roots-right="0"]', event: "roots-pair", after: "O par foi marcado sem apagar os cart\xF5es. Agora sua partida original continua com todos os pares guardados." }] });
  })();
});
