/* Registered module: ancestral-activities */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("ancestral-activities", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function ancestralActivities() {
    "use strict";
    const V = window.V, D = V.AncestralData, esc = V.escape;
    const K = V.AncestralActivities = {
      active: null,
      syncBusy: false,
      game(id) {
        return D.activities.find((g) => g.id === id);
      },
      done(id) {
        return !!V.Ancestral.ensure()?.activities[id];
      },
      run(id = this.active) {
        return V.Ancestral.ensure()?.runs[id];
      },
      create(id) {
        const g = this.game(id);
        if (!g) return null;
        const n = g.pairs.length, order = Array.from({ length: n }, (_, i) => (i + 2) % n).reverse();
        return V.Ancestral.ensure().runs[id] = { version: 1, matches: [], selected: null, order, moves: 0, finished: false, feedback: "" };
      },
      open(id) {
        const g = this.game(id);
        if (!g || !V.state) return false;
        this.active = id;
        const s = V.Ancestral.ensure();
        if (!s.tutorials.includes(id)) return this.tutorial(id);
        if (!s.runs[id] || s.runs[id].finished) this.create(id);
        this.show(id);
        return true;
      },
      tutorial(id = this.active) {
        const g = this.game(id);
        if (!g) return;
        this.active = id;
        const ordered = g.mode === "order";
        V.UI.modal(g.title, "COMO JOGAR \xB7 PRIMEIRA VISITA", `<div class="roots-tutorial"><span class="roots-kicker">${ordered ? "COLOQUE AS ETAPAS EM ORDEM" : "FORME PARES COM SENTIDO"}</span><h3>${ordered ? "Observe o que vem antes e depois." : "Compare ingl\xEAs, contexto e significado."}</h3><p>${esc(g.brief)}</p><ol><li>${ordered ? "Leia todos os cart\xF5es da sequ\xEAncia." : "Selecione um cart\xE3o da coluna da esquerda."}</li><li>${ordered ? "Use as setas para mover cada etapa para cima ou para baixo." : "Toque na explica\xE7\xE3o correspondente na coluna da direita."}</li><li>${ordered ? "Toque em Conferir sequ\xEAncia. Voc\xEA pode reorganizar e tentar outra vez." : "Os pares corretos ficam marcados. Complete todos para registrar a atividade."}</li></ol><p>Sem cron\xF4metro. A partida fica guardada ao sair.</p></div>`, `<button id="roots-tutorial-start" class="primary">Come\xE7ar atividade</button>`);
        V.$(".modal").classList.add("roots-modal");
        V.$("#roots-tutorial-start").onclick = () => {
          const s = V.Ancestral.ensure();
          if (!s.tutorials.includes(id)) s.tutorials.push(id);
          if (!s.runs[id] || s.runs[id].finished) this.create(id);
          V.Save.save();
          this.show(id);
        };
      },
      show(id = this.active) {
        this.active = id;
        const g = this.game(id), r = this.run(id);
        if (!g || !r) return;
        if (r.finished) return this.result(id);
        const order = g.mode === "order", body = order ? `<div class="roots-order" aria-label="Etapas para organizar">${r.order.map((i, pos) => `<article data-key="roots-order-${i}"><span>${pos + 1}</span><div><strong lang="en">${esc(g.pairs[i].en)}</strong><small>${esc(g.pairs[i].pt.replace(/^\d+ · /, ""))}</small></div><div><button data-roots-move="${pos}:-1" aria-label="Mover ${esc(g.pairs[i].en)} para cima" ${pos === 0 ? "disabled" : ""}>\u2191</button><button data-roots-move="${pos}:1" aria-label="Mover ${esc(g.pairs[i].en)} para baixo" ${pos === r.order.length - 1 ? "disabled" : ""}>\u2193</button></div></article>`).join("")}</div>` : `<div class="roots-pair-board"><section aria-label="Cart\xF5es em ingl\xEAs"><h3>INGL\xCAS E CONTEXTO</h3>${g.pairs.map((p, i) => `<button data-roots-left="${i}" class="roots-pair ${r.matches.includes(i) ? "matched" : r.selected === i ? "selected" : ""}" ${r.matches.includes(i) ? "disabled" : ""} aria-pressed="${r.selected === i}"><span>${r.matches.includes(i) ? "\u2713" : String.fromCharCode(65 + i)}</span><strong lang="en">${esc(p.en)}</strong></button>`).join("")}</section><section aria-label="Significados para comparar"><h3>SIGNIFICADO E A\xC7\xC3O</h3>${r.order.map((i) => `<button data-roots-right="${i}" class="roots-pair ${r.matches.includes(i) ? "matched" : ""}" ${r.matches.includes(i) ? "disabled" : ""}><span>${r.matches.includes(i) ? "\u2713" : "\u25C7"}</span><strong>${esc(g.pairs[i].pt)}</strong></button>`).join("")}</section></div>`;
        V.UI.modal(g.title, "OFICINA DE CONVIV\xCANCIA \xB7 " + (order ? "SEQU\xCANCIA" : "ASSOCIA\xC7\xC3O"), `<div class="roots-activity-summary"><p>${esc(g.brief)}</p><span>${order ? r.moves + " movimentos" : r.matches.length + " / " + g.pairs.length + " pares"}</span>${order ? "" : `<progress value="${r.matches.length}" max="${g.pairs.length}" aria-label="Pares conclu\xEDdos"></progress>`}</div>${body}<p id="roots-activity-feedback" class="roots-feedback" role="status">${esc(r.feedback || "")}</p>`, `<button id="roots-activity-help" class="secondary">Como jogar</button><button id="roots-activity-exit" class="secondary">Guardar e sair</button>${order ? '<button id="roots-order-check" class="primary">Conferir sequ\xEAncia</button>' : ""}`, true);
        V.$(".modal").classList.add("roots-modal");
        V.$$("[data-roots-left]").forEach((b) => b.onclick = () => {
          r.selected = +b.dataset.rootsLeft;
          r.feedback = "Agora escolha a explica\xE7\xE3o correspondente.";
          this.show();
        });
        V.$$("[data-roots-right]").forEach((b) => b.onclick = () => this.pair(+b.dataset.rootsRight));
        V.$$("[data-roots-move]").forEach((b) => b.onclick = () => {
          const [pos, delta] = b.dataset.rootsMove.split(":").map(Number);
          this.move(pos, delta);
        });
        if (V.$("#roots-order-check")) V.$("#roots-order-check").onclick = () => this.checkOrder();
        V.$("#roots-activity-help").onclick = () => this.tutorial(id);
        V.$("#roots-activity-exit").onclick = () => {
          V.Save.save();
          V.UI.close();
        };
      },
      pair(right) {
        const r = this.run(), g = this.game(this.active);
        if (!r || r.finished || g.mode === "order" || r.matches.includes(right) || !Number.isInteger(right) || !g.pairs[right]) return false;
        if (r.selected == null) {
          r.feedback = "Primeiro escolha um cart\xE3o da coluna da esquerda.";
          this.show();
          return false;
        }
        r.moves++;
        if (r.selected !== right) {
          r.feedback = "Esse par ainda n\xE3o corresponde. Compare o contexto dos dois cart\xF5es e tente outra liga\xE7\xE3o.";
          V.Audio.sfx("wrong");
          V.Save.save();
          this.show();
          return false;
        }
        r.matches.push(right);
        r.selected = null;
        r.feedback = "\u2713 " + g.pairs[right].en + " \u2014 " + g.pairs[right].pt;
        V.Audio.sfx("correct");
        V.Save.save();
        if (r.matches.length === g.pairs.length) return this.finish();
        this.show();
        return true;
      },
      move(position, delta) {
        const r = this.run(), g = this.game(this.active), to = position + delta;
        if (!r || r.finished || g.mode !== "order" || ![-1, 1].includes(delta) || position < 0 || to < 0 || position >= r.order.length || to >= r.order.length) return false;
        [r.order[position], r.order[to]] = [r.order[to], r.order[position]];
        r.moves++;
        r.feedback = "";
        V.Save.save();
        this.show();
        return true;
      },
      checkOrder() {
        const r = this.run(), g = this.game(this.active);
        if (!r || r.finished || g.mode !== "order") return false;
        if (!r.order.every((v, i) => v === i)) {
          r.feedback = "Compare as a\xE7\xF5es: leitura e observa\xE7\xE3o v\xEAm antes da execu\xE7\xE3o; revis\xE3o e registro encerram o cuidado.";
          V.Audio.sfx("wrong");
          V.Save.save();
          this.show();
          return false;
        }
        return this.finish();
      },
      finish() {
        const id = this.active, g = this.game(id), r = this.run(id), s = V.Ancestral.ensure();
        if (!g || !r || r.finished) return false;
        const valid = g.mode === "order" ? r.order.length === g.pairs.length && r.order.every((v, i) => v === i) : new Set(r.matches).size === g.pairs.length && r.matches.every((i) => Number.isInteger(i) && i >= 0 && i < g.pairs.length);
        if (!valid) return false;
        r.finished = true;
        const first = !s.activities[id];
        s.activities[id] = { count: (s.activities[id]?.count || 0) + 1, moves: r.moves };
        if (first) {
          V.Life.award("roots-activity-" + id, g.reward);
          V.Progress.reward("roots-activity-" + id, g.xp);
        }
        V.Quests.achieve("roots-activity-" + id);
        this.syncMissions();
        V.Companions?.check();
        V.Save.save();
        V.Audio.sfx("victory");
        this.result(id);
        return true;
      },
      syncMissions() {
        if (this.syncBusy || !V.state) return;
        this.syncBusy = true;
        try {
          for (const q of D.missions) {
            const s2 = V.state.sideQuests[q.id];
            if (!s2?.started || s2.done) continue;
            for (let i = 0; i < q.steps.length && !s2.done; i++) {
              const step = q.steps[s2.step], before = s2.step;
              if (step?.kind === "puzzle" && q.activity && this.done(q.activity)) V.Living.event("puzzle", q.id);
              else if (step?.kind === "read") {
                for (const id of step.targets || []) if (V.state.readings.includes(id)) V.Living.event("read", id, V.learning.readings.find((r) => r.id === id));
              }
              if (s2.step === before) break;
            }
          }
          const s = V.Ancestral.ensure();
          if (V.state.sideQuests["roots-labels"]?.done && !s.claimLedger.labels) {
            s.claimLedger.labels = true;
            V.Progress.add("herb-rosemary", 2);
          }
        } finally {
          this.syncBusy = false;
        }
      },
      result(id = this.active) {
        const g = this.game(id), p = V.Ancestral.person(g.person), r = this.run(id);
        V.UI.modal("Conhecimento em movimento", g.title, `<div class="roots-result">${V.AncestralArt.icon("characters", p.sprite, 144)}<h3>\u2713 Atividade registrada</h3><p>${esc(p.requirement)}</p><strong>${V.Companions.unlocked(p.id) ? p.name + " dispon\xEDvel como companhia" : "O progresso j\xE1 conta para o v\xEDnculo com " + p.name}</strong><p>${r.moves} a\xE7\xF5es \xB7 sem limite de tempo</p><small>Primeira conclus\xE3o: +${g.reward} moedas e +${g.xp} XP.</small></div>`, `<button id="roots-result-companions" class="primary">Escolher companhia</button><button id="roots-result-close" class="secondary">Voltar ao lugar</button><button id="roots-result-repeat" class="quiet">Repetir atividade</button>`);
        V.$(".modal").classList.add("roots-modal");
        V.$("#roots-result-companions").onclick = () => V.Companions.open();
        V.$("#roots-result-close").onclick = () => V.UI.close();
        V.$("#roots-result-repeat").onclick = () => {
          this.create(id);
          this.show(id);
        };
        V.AncestralArt.paint();
      }
    };
    for (const g of D.activities) V.Quests.achievements.push({ id: "roots-activity-" + g.id, title: g.title, desc: "Conclua a atividade " + g.title + " nos Caminhos da Ancestralidade.", index: 5, category: "challenges" });
    const event = V.Living.event.bind(V.Living);
    V.Living.event = function(...args) {
      const result = event(...args);
      K.syncMissions();
      V.Companions?.check();
      return result;
    };
    const reconcile = V.Living.reconcile.bind(V.Living);
    V.Living.reconcile = function(...args) {
      const result = reconcile(...args);
      K.syncMissions();
      return result;
    };
    const workshop = V.Living.workshop.bind(V.Living);
    V.Living.workshop = function(id, ...args) {
      const q = D.missions.find((q2) => q2.id === id);
      return q?.activity ? K.open(q.activity) : workshop(id, ...args);
    };
  })();
});
