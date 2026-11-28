/* Registered module: playground-integration */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("playground-integration", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function playgroundIntegration() {
    "use strict";
    const V = window.V, P = V.Playground, D = V.PlaygroundData, G = V.Onboarding, T = V.Tutorials, M = V.Minigames, A = V.LearningArcade, K = V.CultureChallenges, R = V.AncestralActivities, W = V.NeighborhoodWorkshops;
    const classic = { beat: "rhythm", timeline: "courier", evidence: "courier", bias: "runner", city: "bridges", runner: "runner", wires: "bridges" }, culture = { loom: "bridges", press: "courier", stage: "rhythm", oware: "bridges" }, arcade = { furniture: "room", courier: "courier", restoration: "courier", timeline: "courier" };
    function campaignDone(chapter) {
      if (!V.state.minis.includes(chapter)) {
        V.state.minis.push(chapter);
        V.UI.toast("Sistema restaurado. O confronto est\xE1 liberado!");
      }
      V.Game.updateHUD();
      V.Save.save();
    }
    P.completeContext = function(r) {
      const c = r.context || {}, a = A.ensure();
      if (!a.completed.some((x) => x.id === r.id)) a.completed.push({ id: r.id, game: r.game, coins: this.ensure().ledger[r.id]?.coins || 0, moves: r.moves });
      if (c.kind === "culture") {
        const state = K.ensure(), old = state.completed[c.id];
        state.completed[c.id] = { count: (old?.count || 0) + 1, bestMoves: Math.min(old?.bestMoves ?? Infinity, r.moves), lastRun: r.id };
        if (state.runs[c.id]) state.runs[c.id].finished = true;
      }
      if (c.kind === "ancestral") {
        const state = V.Ancestral.ensure(), old = state.activities[c.id];
        state.activities[c.id] = { count: (old?.count || 0) + 1, moves: r.moves };
        R.syncMissions();
        V.Companions.check();
      }
      if (c.kind === "workbench") {
        const key = "workbench:" + c.id;
        const record = T.ensure().sessions[key];
        if (record) record.finished = true;
      }
      if (c.kind === "campaign" && c.finalPart === void 0 && !c.wire) campaignDone(c.chapter);
      V.Life.hud();
    };
    P.returnContext = function(r) {
      const c = r.context || {};
      if (c.kind === "campaign") {
        if (c.wire) {
          V.state.flags.mixerRepaired = true;
          V.Quests.challenge(1);
        } else if (c.finalPart !== void 0) {
          const f = T.ensure().sessions["final:6"] ||= { step: 0, finished: false };
          f.step = Math.max(f.step, c.finalPart + 1);
          M.finalSequence(() => campaignDone(6));
        } else campaignDone(c.chapter);
      } else if (c.kind === "workbench" && c.mission) {
        V.Living.event("puzzle", c.mission);
      }
    };
    P.brief = function(game, done, context, why) {
      const g = this.game(game);
      V.UI.modal(g.title, context.chapter ? "INVESTIGA\xC7\xC3O \xB7 CAP\xCDTULO " + context.chapter : "OFICINA DO BAIRRO", `<p>${V.escape(why || g.description)}</p><div class="note"><strong>Sua meta</strong><p>${V.escape(g.goal)}</p></div><p>${V.escape(g.keys)}</p><p>Na primeira vez, PIX apresenta cada a\xE7\xE3o no cen\xE1rio. Voc\xEA pode pedir dicas ou pausar a qualquer momento.</p>`, '<button id="pg-brief-start" class="primary">Entrar no desafio</button>');
      V.$("#pg-brief-start").onclick = () => this.launch(game, done, context);
      return true;
    };
    M.launch = function(type, done, opts = {}) {
      if (type === "final") {
        this.done = done;
        this.opts = opts;
        return this.finalSequence(done);
      }
      return P.brief(classic[type] || "runner", done, { kind: opts.chapter ? "campaign" : "free", chapter: opts.chapter, classic: type, wire: !!opts.wire, ...opts.finalPart !== void 0 ? { finalPart: opts.finalPart } : {} }, opts.chapter ? "Depois de reunir os registros e escutar os moradores, a equipe prepara uma a\xE7\xE3o pr\xE1tica neste distrito. Complete a meta para liberar o pr\xF3ximo passo da investiga\xE7\xE3o." : null);
    };
    M.startArcade = function(type) {
      return P.launch(classic[type] || "runner", this.done, { kind: this.opts?.chapter ? "campaign" : "free", chapter: this.opts?.chapter, classic: type });
    };
    M.wires = (done) => P.brief("bridges", done, { kind: "campaign", chapter: 1, wire: true, classic: "wires" }, "Antes de abrir o ensaio, restabele\xE7a o caminho da equipe at\xE9 o palco. Gire as passarelas e atravesse as quatro rotas. Depois voc\xEA volta ao terminal para tocar com a banda.");
    // Keep the specialised loom, printing, theatre and Abapa controllers: redirecting
    // them to the generic arcade discarded four already-implemented game systems.
    const cultureOpen = K.open.bind(K);
    const openCulture = (id) => cultureOpen(id);
    K.open = openCulture;
    const rootsOriginal = R.open.bind(R), rootsShow = R.show.bind(R), rootsTutorial = R.tutorial.bind(R);
    const rootsArcade = { memory: "memory", routes: "courier", captions: "museum", plants: "garden", labels: "room", tools: "bridges", water: "garden", evidence: "museum", winds: "platform", forest: "memory" };
    const openRoots = (id) => {
      const g = R.game(id);
      if (!g) return false;
      R.active = id;
      if (!rootsArcade[id]) return rootsOriginal(id);
      const game = rootsArcade[id];
      return P.brief(game, null, { kind: "ancestral", id }, g.brief + " A nova cena \xE9 uma aventura fict\xEDcia; os registros de contexto continuam no caderno da regi\xE3o.");
    };
    R.open = openRoots;
    R.show = (id) => rootsArcade[id || R.active] ? openRoots(id || R.active) : rootsShow(id || R.active);
    R.tutorial = (id) => rootsArcade[id] ? P.train(rootsArcade[id]) : rootsTutorial(id);
    // The original portrait mosaic, document timeline and mail route have real
    // mechanics and authored historical dossiers. Keep them playable alongside
    // the new action arcade instead of substituting a generic delivery minigame.
    const legacyArcadeMenu = A.menu.bind(A), legacyArcadeStart = A.start.bind(A), legacyArcadeResume = A.resume.bind(A);
    A.legacyMenu = legacyArcadeMenu;
    const legacyCatalog = A.games.slice();
    A.games = [...legacyCatalog, ...D.games.filter((g) => !legacyCatalog.some((old) => old.id === g.id)).map((g) => ({ id: g.id, title: g.title, tag: g.tag, text: g.goal, subject: "language" }))];
    A.menu = () => P.menu();
    A.start = (id) => ["restoration", "timeline", "furniture", "courier"].includes(id) ? legacyArcadeStart(id) : P.launch(P.game(id) ? id : arcade[id] || "courier", null, { kind: "arcade", id });
    A.resume = legacyArcadeResume;
    V.Living.games = () => P.menu();
    V.Game.practice = () => P.launch("runner");
    if (W) {
      W.open = function(id, done) {
        this.active = id;
        const map = { sequence: "rhythm", catalogue: "courier", experiment: "bridges", newsroom: "courier", interview: "room", "field-notes": "garden", "community-mail": "courier", "human-review": "bridges", labels: "runner", exhibition: "courier" };
        const object = V.World.nearest;
        return P.brief(map[id] || "courier", done, { kind: "workbench", id, objectId: object?.id, mission: P.pendingMission || null }, V.Living.missions.find((q) => q.id === P.pendingMission)?.brief);
      };
    }
    const workshop = V.Living.workshop.bind(V.Living);
    V.Living.workshop = function(id) {
      P.pendingMission = id;
      try {
        return workshop(id);
      } finally {
        P.pendingMission = null;
      }
    };
    const tasks = V.CityMenus.tasks.bind(V.CityMenus);
    V.CityMenus.tasks = function() {
      const state = P.ensure();
      return tasks().filter((t) => t.kind !== "culture").map((t) => {
        if (t.kind !== "arcade") return t;
        const run = Object.values(state.runs).find((r) => r.game === t.id && !r.finished), done = !!state.records[t.id] && !run, g = P.game(t.id);
        if (!g || ["courier", "furniture", "restoration", "timeline"].includes(t.id)) return t;
        return { ...t, done, started: !!run || done, description: g.description, total: 1, progress: done ? 1 : 0, steps: [{ label: g.goal, done }] };
      });
    };
    V.CityMenus.challenges = function() {
      const result = P.menu();
      G.ack("challenges");
      return result;
    };
    const action = G.action.bind(G);
    G.action = function(id) {
      if (id !== "challenge") return action(id);
      const r = this.record();
      r.waitingLesson = "playground:runner";
      this.suspended = true;
      V.GuideOverlay.hide("main");
      P.train("runner", { onboarding: true, restart: true });
    };
    const missionGames = { interview: ["room", "Ouvir e preparar o encontro", "Escute Joana e Celina no parque. Depois, organize o espa\xE7o de leitura no jogo Casa em Movimento. As duas conversas continuam registradas; o desafio pede posi\xE7\xF5es dos m\xF3veis."], labels: ["runner", "Palavras pela feira", "Recupere os tr\xEAs pap\xE9is da feira e ajude Rosa a preparar as palavras das placas do bairro na Corrida das Palavras."], "rhythm-workshop": ["rhythm", "A roda precisa de todos", "Consulte uma leitura do distrito e participe do Palco do Ritmo com Ivo. Os quatro bot\xF5es respondem aos sinais que descem; o arranjo \xE9 original do jogo."], exhibition: ["courier", "Uma exposi\xE7\xE3o em circula\xE7\xE3o", "Consulte uma leitura do museu para conhecer o contexto dos registros. Depois ajude a circula\xE7\xE3o dos materiais da comunidade na Rota da Livraria."], experiment: ["bridges", "Caminho at\xE9 a oficina", "Converse com Caio sobre o teste de Luma. A equipe tamb\xE9m precisa alcan\xE7ar a oficina: restabele\xE7a as quatro passarelas em Pontes do Bairro. O desafio de acesso \xE9 uma a\xE7\xE3o separada da conversa sobre o experimento."], newsroom: ["courier", "A edi\xE7\xE3o de amanh\xE3", "Leia uma nota sobre fontes e contexto. Depois ajude a circula\xE7\xE3o dos materiais da reda\xE7\xE3o na Rota da Livraria; entregar um documento n\xE3o substitui conferir seu conte\xFAdo."], backup: ["courier", "Um arquivo em circula\xE7\xE3o", "Leia um registro e observe sua autoria e origem. Depois fa\xE7a a rota de entregas da biblioteca. Os documentos continuam dispon\xEDveis no caderno para consulta."], "field-notes": ["garden", "Jardim de observa\xE7\xE3o", "Observe tr\xEAs tipos de animais sem persegui-los e consulte as fichas de campo. Depois prepare o Jardim em A\xE7\xE3o: plante, regue, colha e entregue os materiais da oficina."], "community-mail": ["courier", "Correspond\xEAncia com cuidado", "Converse com Rosa sobre registros da mem\xF3ria do bairro e o direito de concordar ou recusar. Depois ajude nas entregas da comunidade na Rota da Livraria."], "human-review": ["bridges", "O arquivo precisa de acesso", "Consulte uma leitura do Arquivo Central. Depois restabele\xE7a as passarelas de acesso em Pontes do Bairro para a equipe continuar cuidando dos registros."] };
    for (const q of V.Living.missions) {
      const item = missionGames[q.id];
      if (!item) continue;
      const [game, title2, brief] = item;
      q.title = title2;
      q.brief = brief;
      q.steps.filter((s) => s.kind === "puzzle").forEach((s) => s.label = "Na oficina, complete " + P.game(game).title + ": " + P.game(game).goal);
    }
    const objectives = V.Quests.objectives.bind(V.Quests);
    V.Quests.objectives = function(id) {
      const out = objectives(id), game = classic[V.content.chapters[id - 1].minigame];
      if (out[2]) out[2].label = id === 6 ? "Complete as tr\xEAs etapas do reboot no terminal." : "No terminal, complete " + (P.game(game)?.title || "o desafio do distrito") + ".";
      return out;
    };
    const objective = V.ObjectiveGuide.main.bind(V.ObjectiveGuide);
    V.ObjectiveGuide.main = function(id) {
      const o = objective(id);
      if (o?.key === "station-" + id) o.label = "Ir ao terminal: " + (id === 6 ? "tr\xEAs etapas do reboot" : P.game(classic[V.content.chapters[id - 1]?.minigame])?.title || "desafio do distrito");
      return o;
    };
    K.objective = function(id) {
      const g = this.game(id), r = this.run(id);
      return !g ? "" : r && !r.finished ? g.title + " \xB7 " + g.stages[r.stage].title : "Conhecer " + g.title;
    };
    V.Hooks.around(V.World, "init", "playground-integration:init:1", (world) => function(...args) {
      const result = world(...args);
      for (const m of Object.values(this.maps)) for (const o of m.objects) {
        if (o.type === "culture-kiosk") o.label = o.game === "community" ? "Desafios da cidade" : "Esta\xE7\xE3o \xB7 " + (K.game(o.game)?.title || P.game(culture[o.game] || "bridges").title);
      }
      return result;
    });
    V.Life.games = () => P.menu();
    V.Life.startQuiz = (subject) => P.launch(subject === "history" ? "courier" : "runner");
    const title = V.Game.toTitle.bind(V.Game);
    V.Hooks.around(V.Game, "toTitle", "playground-integration:toTitle:1", () => function(...args) {
      P.detach();
      return title(...args);
    });
    // Old tutorial links in scenery open the corresponding new hands-on training.
    const tutorial = T.open.bind(T);
    T.open = function(key, replay) {
      const [family, id] = key.split(":");
      if (["culture", "arcade", "roots"].includes(family) && T.definitions[key]) return tutorial(key, replay);
      let game = family === "classic" ? classic[id] : family === "culture" ? culture[id] : family === "arcade" ? arcade[id] || id : family === "workbench" ? id === "sequence" ? "rhythm" : id === "experiment" ? "garden" : "courier" : null;
      if (game && P.game(game)) {
        P.train(game, { restart: !!replay, returnHelp: true });
        return true;
      }
      if (family === "roots") {
        P.train("courier", { restart: !!replay, returnHelp: true });
        return true;
      }
      return tutorial(key, replay);
    };
  })();
});
