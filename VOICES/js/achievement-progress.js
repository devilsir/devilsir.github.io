/* Registered module: achievement-progress */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("achievement-progress", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function achievementProgress() {
    "use strict";
    const V = window.V, esc = V.escape;
    const categoryNames = { campaign: "Campanha", missions: "Miss\xF5es da comunidade", language: "PIX e ingl\xEAs", reading: "Leituras e pesquisa", challenges: "Desafios e oficinas", city: "Explora\xE7\xE3o e moradia" };
    const originalActs = ["rhythm", "museum", "authors", "source", "community", "reboot"];
    const countUnique = (values = []) => new Set(values).size;
    const M = V.AchievementProgress = {
      category: "all",
      status: "all",
      act: "all",
      query: "",
      rules: new Map(),
      busy: false,
      seen: new WeakSet(),
      add(id, title, desc, category, get, target = 1, options = {}) {
        let entry = V.Quests.achievements.find((a) => a.id === id);
        if (!entry) {
          entry = { id, title, desc, index: options.index ?? 8, category, target, unit: options.unit || "etapas", ...options };
          V.Quests.achievements.push(entry);
        }
        this.rules.set(id, { get, target, unit: options.unit || entry.unit || "etapas" });
        return entry;
      },
      register() {
        const Q = V.Quests, missions = V.Living.missions, readings = V.learning.readings;
        for (const a of Q.achievements) {
          const act = originalActs.indexOf(a.id);
          if (act >= 0) {
            a.category = "campaign";
            a.act = act + 1;
          } else a.category = a.category || (a.id.startsWith("culture-") || ["city-english", "city-history"].includes(a.id) ? "challenges" : a.id === "neighbor" ? "missions" : a.id === "vocab" ? "language" : ["reader", "historian", "naturalist"].includes(a.id) ? "reading" : "city");
        }
        const story = () => V.Progress.ensure().story;
        this.add("story-awakened", "A primeira rasura", "Examine as duas vers\xF5es no museu e desperte o Histori\xF3grafo Ancestral.", "campaign", () => Number(!!story().awakened || !!story().met), 1, { act: 0, index: 0 });
        this.add("story-vigilia", "Companhia na vig\xEDlia", "Conclua o encontro com Zambeto no p\xE1tio do museu.", "campaign", () => Number(!!story().met), 1, { act: 0, index: 1 });
        this.add("story-epilogue", "A cidade decide", "Conclua os seis atos e registre uma decis\xE3o para o futuro do arquivo.", "campaign", () => Number(V.state.completed.length === 6 && !!story().ending), 1, { act: 7, index: 6 });
        for (const c of V.content.chapters) {
          const id = c.id, opts = { act: id, index: id % 8 };
          this.add("act-" + id + "-evidence", "Tr\xEAs pistas \xB7 ato " + id, "Recupere os tr\xEAs registros de " + c.name + ".", "campaign", () => Q.status(id).clues, 3, { ...opts, unit: "registros" });
          this.add("act-" + id + "-voices", "Duas perspectivas \xB7 ato " + id, "Converse com os dois moradores da investiga\xE7\xE3o em " + c.name + ".", "campaign", () => Q.status(id).talked, 2, { ...opts, unit: "conversas" });
          this.add("act-" + id + "-context", "Conex\xF5es do ato " + id, "Re\xFAna os tr\xEAs vest\xEDgios e interprete o caso no Histori\xF3grafo.", "campaign", () => Math.min(3, countUnique(story().traces[id])) + Number(story().interpreted.includes(id)), 4, { ...opts, unit: "etapas" });
          this.add("act-" + id + "-reading", "Al\xE9m das pistas \xB7 ato " + id, "Conclua uma leitura ligada a " + c.name + ".", "campaign", () => readings.filter((r) => r.chapter === id && V.state.readings.includes(r.id)).length, 1, { ...opts, index: 4, unit: "leitura" });
          this.rules.set(originalActs[id - 1], { get: () => Number(V.state.completed.includes(id)), target: 1, unit: "ato" });
        }
        for (const q of missions) this.add("mission-" + q.id, q.title, "Conclua a miss\xE3o \u201C" + q.title + "\u201D em " + V.Living.location(q.map) + ".", "missions", () => {
          const s = V.state.sideQuests[q.id];
          return s?.done ? q.steps.length : Math.max(0, Number(s?.step) || 0);
        }, q.steps.length, { mission: q.id, index: 5, unit: "etapas" });
        const completedMissions = () => missions.filter((q) => V.state.sideQuests[q.id]?.done).length;
        this.add("missions-twelve", "La\xE7os pela cidade", "Conclua doze miss\xF5es da comunidade.", "missions", completedMissions, 12, { index: 9, unit: "miss\xF5es" });
        this.add("missions-all", "Cada tarefa, uma hist\xF3ria", "Conclua todas as " + missions.length + " miss\xF5es da comunidade.", "missions", completedMissions, missions.length, { index: 13, unit: "miss\xF5es" });
        for (const g of V.LearningArcade.games) this.add("arcade-" + g.id, g.title, "Conclua uma partida de " + g.title + ".", "challenges", () => Number(V.LearningArcade.ensure().completed.some((r) => r.game === g.id)), 1, { index: g.subject === "history" ? 2 : 7, unit: "partida" });
        this.add("arcade-all", "Oficinas da cidade", "Conclua os quatro jogos da comunidade: mudan\xE7a, correio, retratos e cronologia.", "challenges", () => countUnique(V.LearningArcade.ensure().completed.map((r) => r.game)), 4, { index: 12, unit: "jogos" });
        for (const [target, title] of [[25, "Primeiras conex\xF5es"], [75, "Conversa que cresce"], [150, "Um bairro em palavras"], [300, "Horizontes em ingl\xEAs"]]) this.add("pix-" + target, title, "Descubra " + target + " palavras ou express\xF5es al\xE9m da base inicial do PIX.", "language", () => V.PixVocabulary.discovered(), target, { index: 7, unit: "descobertas" });
        for (const [target, title] of [[10, "Entre p\xE1ginas"], [25, "Percurso de leitura"], [50, "Estante de muitas vozes"]]) this.add("readings-" + target, title, "Conclua " + target + " leituras diferentes no caderno da cidade.", "reading", () => countUnique(V.state.readings), target, { index: 4, unit: "leituras" });
        this.add("campaign-research", "Seis casos conectados", "Interprete os seis casos no Histori\xF3grafo Ancestral.", "campaign", () => countUnique(story().interpreted), 6, { act: 7, index: 14, unit: "casos" });
        for (const [target, title] of [[5, "Primeiros endere\xE7os"], [12, "Caminhos de New Harmony"], [24, "Cidade de portas abertas"]]) this.add("visits-" + target, title, "Visite " + target + " mapas ou interiores diferentes.", "city", () => countUnique(V.Life.ensure().visits), target, { index: 10, unit: "lugares" });
        this.rules.set("first", { get: () => V.state.evidence.length, target: 1, unit: "registro" });
        this.rules.set("vocab", { get: () => V.PixVocabulary.discovered(), target: 8, unit: "descobertas" });
        this.rules.set("hidden", { get: () => V.state.bonus.length, target: 3, unit: "registros opcionais" });
        this.rules.set("listener", { get: () => V.state.talked.length, target: 12, unit: "conversas de investiga\xE7\xE3o" });
        this.rules.set("reader", { get: () => countUnique(V.state.readings), target: 4, unit: "leituras" });
        this.rules.set("neighbor", { get: completedMissions, target: 4, unit: "miss\xF5es" });
        this.rules.set("historian", { get: () => countUnique(V.state.knowledge), target: 6, unit: "quest\xF5es interpretadas" });
        this.rules.set("naturalist", { get: () => countUnique(V.state.observations), target: 4, unit: "esp\xE9cies" });
        for (const g of V.CultureChallenges.games) this.rules.set("culture-" + g.id, { get: () => Number(!!V.CultureChallenges.ensure().completed[g.id]), target: 1, unit: "oficina" });
        this.rules.set("culture-all", { get: () => V.CultureChallenges.games.filter((g) => V.CultureChallenges.ensure().completed[g.id]).length, target: 4, unit: "oficinas" });
        return Q.achievements;
      },
      progress(entry) {
        const earned = V.state.achievements.includes(entry.id), rule = this.rules.get(entry.id), target = Math.max(1, rule?.target || 1);
        const value = earned ? target : Math.max(0, Math.min(target, Number(rule?.get()) || 0));
        return { earned, value, target, unit: rule?.unit || "objetivo" };
      },
      check() {
        if (!V.state || this.busy) return [];
        this.busy = true;
        try {
          this.register();
          V.state.achievements = [...new Set(V.state.achievements || [])];
          if (!V.state.achievementInfo || typeof V.state.achievementInfo !== "object" || Array.isArray(V.state.achievementInfo)) V.state.achievementInfo = { version: 1, earned: {} };
          const info = V.state.achievementInfo;
          info.version = 1;
          info.earned ||= {};
          const first = !this.seen.has(V.state);
          this.seen.add(V.state);
          const unlocked = V.Quests.achievements.filter((a) => !V.state.achievements.includes(a.id) && this.rules.has(a.id) && this.progress(a).value >= this.progress(a).target);
          const quiet = first || unlocked.length > 2;
          for (const a of unlocked) {
            if (quiet) {
              V.state.achievements.push(a.id);
              V.Life.award("achievement-" + a.id, 35);
            } else V.Quests.achieve(a.id);
            info.earned[a.id] = { at: (new Date()).toISOString(), fromSavedProgress: first };
          }
          if (unlocked.length) {
            V.Save.log("conquistas", unlocked.map((a) => a.title).join(" \xB7 "));
            if (quiet) V.UI.toast((first ? "Progresso reconhecido: " : "") + unlocked.length + " conquista" + (unlocked.length > 1 ? "s desbloqueadas." : " desbloqueada."));
            V.Life.hud();
          }
          return unlocked;
        } finally {
          this.busy = false;
        }
      },
      open(category = this.category) {
        if (!V.state) return;
        this.check();
        this.category = category;
        const all = this.register(), earned = all.filter((a) => V.state.achievements.includes(a.id)).length;
        V.UI.modal("Conquistas", "CADA INVESTIGA\xC7\xC3O DEIXA UMA MARCA", `<div class="achievements-summary"><div><small>SEU PERCURSO EM NEW HARMONY</small><h3>${earned}<span> / ${all.length} conquistas</span></h3><p>Atos, miss\xF5es, leituras e descobertas ficam registrados nesta aventura.</p></div><div><strong>${Math.round(earned / all.length * 100)}%</strong><progress value="${earned}" max="${all.length}" aria-label="Conquistas desbloqueadas"></progress><span>+35 moedas por conquista \xB7 uma vez por aventura</span></div></div><nav class="achievements-tabs" aria-label="Categorias de conquistas">${[["all", "Todas"], ...Object.entries(categoryNames)].map(([id, label]) => `<button data-achievement-category="${id}" aria-pressed="${id === this.category}">${label}</button>`).join("")}</nav><div class="achievements-filters"><label class="field">Buscar conquista<input id="achievement-search" type="search" value="${esc(this.query)}" placeholder="T\xEDtulo, miss\xE3o ou objetivo"></label><label class="field">Progresso<select id="achievement-status"><option value="all">Todas</option><option value="earned">Desbloqueadas</option><option value="locked">Em progresso</option></select></label><label class="field">Ato<select id="achievement-act"><option value="all">Todos os atos</option><option value="0">Pr\xF3logo</option>${V.content.chapters.map((c) => `<option value="${c.id}">${c.id}. ${esc(c.name)}</option>`).join("")}<option value="7">Campanha completa</option></select></label></div><p id="achievement-count" class="achievements-count" role="status"></p><div id="achievement-results" class="achievements-results"></div>`, '<button id="achievements-archive" class="secondary">Arquivo de descobertas</button><button id="achievements-objectives" class="primary">Ver miss\xF5es e objetivos</button>', true);
        V.$(".modal").classList.add("achievements-modal");
        V.$("#achievement-status").value = this.status;
        V.$("#achievement-act").value = this.act;
        V.$$("[data-achievement-category]").forEach((b) => b.onclick = () => {
          this.category = b.dataset.achievementCategory;
          V.$$("[data-achievement-category]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          this.render();
        });
        V.$("#achievement-search").oninput = (e) => {
          this.query = e.target.value;
          this.render();
        };
        V.$("#achievement-status").onchange = (e) => {
          this.status = e.target.value;
          this.render();
        };
        V.$("#achievement-act").onchange = (e) => {
          this.act = e.target.value;
          this.render();
        };
        V.$("#achievements-archive").onclick = () => V.Game.gallery();
        V.$("#achievements-objectives").onclick = () => V.CityMenus.board();
        this.render();
      },
      render() {
        const root = V.$("#achievement-results");
        if (!root) return;
        const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), query = norm(this.query);
        const rows = this.register().filter((a) => {
          const p = this.progress(a);
          return (this.category === "all" || a.category === this.category) && (this.status === "all" || (this.status === "earned" ? p.earned : !p.earned)) && (this.act === "all" || String(a.act) === this.act) && norm(a.title + " " + a.desc).includes(query);
        });
        V.$("#achievement-count").textContent = rows.length + " conquista" + (rows.length === 1 ? "" : "s") + " nesta sele\xE7\xE3o";
        root.innerHTML = rows.map((a) => {
          const p = this.progress(a), label = a.act === 0 ? "Pr\xF3logo" : a.act === 7 ? "Campanha completa" : a.act ? "Ato " + a.act + " \xB7 " + V.content.chapters[a.act - 1].name : categoryNames[a.category];
          return `<article class="milestone-card ${p.earned ? "earned" : "locked"}"><div class="milestone-top"><span class="badge-art" style="background-position:-${a.index % 8 * 44}px -${Math.floor(a.index / 8) * 44}px" aria-hidden="true"></span><span class="milestone-state">${p.earned ? "\u2713 DESBLOQUEADA" : "EM PROGRESSO"}</span></div><small class="milestone-category">${esc(label)}</small><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p><div class="milestone-meter"><progress value="${p.value}" max="${p.target}" aria-label="${esc(a.title)}: ${p.value} de ${p.target}"></progress><span>${p.value} / ${p.target} ${esc(p.unit)}</span></div>${a.mission && !p.earned ? `<button class="secondary" data-achievement-mission="${esc(a.mission)}" ${V.Living.missionUnlocked(V.Living.missions.find((q) => q.id === a.mission)) ? "" : "disabled"}>Ver miss\xE3o</button>` : ""}</article>`;
        }).join("") || '<p class="achievements-empty">Nenhuma conquista com esses filtros. Experimente outra categoria ou outro termo.</p>';
        V.$$("[data-achievement-mission]").forEach((b) => b.onclick = () => V.Living.showMission(b.dataset.achievementMission));
      }
    };
    const init = V.Living.initContent.bind(V.Living);
    V.Living.initContent = function(...args) {
      const result = init(...args);
      M.register();
      return result;
    };
    V.Hooks.around(V.Save, "save", "achievement-progress:save:1", (save) => function(...args) {
      if (V.state) M.check();
      return save(...args);
    });
    const achieve = V.Quests.achieve.bind(V.Quests);
    V.Quests.achieve = function(id) {
      const before = V.state?.achievements.includes(id), result = achieve(id);
      if (!before && V.state?.achievements.includes(id)) {
        V.state.achievementInfo ||= { version: 1, earned: {} };
        V.state.achievementInfo.earned ||= {};
        V.state.achievementInfo.earned[id] ||= { at: (new Date()).toISOString(), fromSavedProgress: false };
      }
      return result;
    };
    V.Quests.badges = () => M.open();
    V.Hooks.around(V.Game, "pause", "achievement-progress:pause:1", (pause) => function(...args) {
      const result = pause(...args);
      const body = V.$(".modal-body .stack") || V.$(".modal-body");
      if (body && !V.$("#pause-achievements")) {
        const button = document.createElement("button");
        button.id = "pause-achievements";
        button.className = "secondary";
        button.textContent = "Conquistas e progresso";
        button.onclick = () => M.open();
        body.append(button);
      }
      return result;
    });
  })();
});
