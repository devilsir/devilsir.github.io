/* Registered module: playground-overhaul */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("playground-overhaul", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function voicesChallengeOverhaul() {
    "use strict";
    const V = window.V, P = V.Playground, D = V.PlaygroundData, esc = V.escape;
    const additions = [
      { id: "memory", title: "Mensageiro de Mem\xF3rias", tag: "FURTIVIDADE \xB7 RESGATE \xB7 ROTAS", color: "#e9b977", description: "Recupere caixas do arquivo, desvie dos vigilantes e entregue cada registro ao espa\xE7o certo.", goal: "Seis rotas com obst\xE1culos e patrulhas.", keys: "WASD / setas \xB7 toque no mapa \xB7 E para recolher e entregar", icon: "letter", stages: 6 },
      { id: "museum", title: "Museu Vivo", tag: "EMPURRE \xB7 RESTAURE \xB7 PLANEJE", color: "#a6bddf", description: "Empurre vitrines e pe\xE7as at\xE9 os expositores sem bloquear o caminho de volta.", goal: "Seis salas de movimenta\xE7\xE3o estrat\xE9gica.", keys: "WASD / setas \xB7 toque nos direcionais \xB7 R reinicia a sala", icon: "homes", stages: 6 },
      { id: "platform", title: "Palavras em Movimento", tag: "SALTE \xB7 COLETE \xB7 ABRA", color: "#a5d0a4", description: "Aventure-se por plataformas, recolha palavras e abra port\xF5es com movimento e precis\xE3o.", goal: "Seis percursos com saltos e atalhos.", keys: "\u2190 \u2192 / A D \xB7 espa\xE7o para saltar \xB7 bot\xF5es na tela", icon: "runner", stages: 6 },
      { id: "radio", title: "R\xE1dio Comunit\xE1ria", tag: "SINTONIZE \xB7 EQUILIBRE \xB7 TRANSMITA", color: "#daa6c3", description: "Controle tr\xEAs frequ\xEAncias, enfrente interfer\xEAncias e mantenha a transmiss\xE3o no ar.", goal: "Seis transmiss\xF5es com padr\xF5es de sinal.", keys: "1\u20133 escolhem canal \xB7 \u2190 \u2192 ajustam \xB7 E transmite", icon: "music", stages: 6 }
    ];
    D.games.push(...additions);
    for (const g of D.games) {
      const id = "play-all-" + g.id;
      if (!V.Quests.achievements.some((a) => a.id === id)) V.Quests.achievements.push({ id, title: "Emblema \xB7 " + g.title, desc: "Concluiu todas as fases de " + g.title + ".", index: 8 });
    }
    D.guides.memory = [
      { title: "A rua se move com voc\xEA", text: "Conduza a personagem pelas passagens livres; as paredes seguram o caminho.", instruction: "Mova-se em qualquer dire\xE7\xE3o.", event: "memory-walk", focus: "game" },
      { title: "Pegue o registro", text: "A caixa dourada guarda um registro fict\xEDcio do bairro.", instruction: "Chegue \xE0 caixa e use E.", event: "memory-pick", focus: "action" },
      { title: "Entregue com cuidado", text: "A placa da biblioteca indica o destino deste registro.", instruction: "Leve a caixa at\xE9 a placa e use E.", event: "memory-deliver", focus: "action" }
    ];
    D.guides.museum = [
      { title: "Explore a sala", text: "A personagem empurra pe\xE7as, mas n\xE3o consegue pux\xE1-las.", instruction: "D\xEA um passo dentro da sala.", event: "museum-walk", focus: "game" },
      { title: "Encaixe a vitrine", text: "O losango no piso mostra a posi\xE7\xE3o final. Evite encurralar a pe\xE7a.", instruction: "Empurre a vitrine at\xE9 a marca.", event: "museum-push", focus: "game" },
      { title: "A exposi\xE7\xE3o ganhou forma", text: "O encaixe \xE9 confirmado ao ocupar todas as marcas.", instruction: "Conclua a sala.", event: "museum-complete", focus: "game" }
    ];
    D.guides.platform = [
      { title: "Corra pelo cen\xE1rio", text: "O personagem responde \xE0s setas, A e D ou aos bot\xF5es na tela.", instruction: "Caminhe para a direita.", event: "platform-walk", focus: "game" },
      { title: "Um salto abre caminhos", text: "Espa\xE7o ou o bot\xE3o saltar elevam o personagem. Segurar a dire\xE7\xE3o permite pousar mais longe.", instruction: "Salte sobre o caminho.", event: "platform-jump", focus: "game" },
      { title: "A palavra abre o portal", text: "Colete a palavra brilhante enquanto corre. Alcance a sa\xEDda para concluir.", instruction: "Recolha a palavra.", event: "platform-word", focus: "game" }
    ];
    D.guides.radio = [
      { title: "Escolha uma mesa de som", text: "Cada canal tem a sua frequ\xEAncia e uma marca-alvo. As cores s\xE3o acompanhadas de n\xFAmeros.", instruction: "Selecione outro canal.", event: "radio-select", focus: "game" },
      { title: "Ajuste o dial", text: "Use esquerda/direita para aproximar a frequ\xEAncia da faixa indicada.", instruction: "Mude uma frequ\xEAncia.", event: "radio-tune", focus: "game" },
      { title: "Coloque a esta\xE7\xE3o no ar", text: "Quando todos os sinais alcan\xE7am suas marcas, transmita.", instruction: "Sintonize todos os canais e transmita.", event: "radio-send", focus: "action" }
    ];
    const oldEnsure = P.ensure.bind(P);
    P.ensure = function() {
      const s = oldEnsure();
      if (s) {
        s.stageRecords ||= {};
        s.badges ||= [];
        s.preferences ||= { difficulty: Number.isInteger(V.settings.difficulty) ? V.settings.difficulty : 1 };
      }
      return s;
    };
    const oldMake = P.make.bind(P);
    P.make = function(id, key, context) {
      const r = oldMake(id, key, context);
      r.difficulty = this.ensure().preferences.difficulty;
      r.startStage = Math.max(0, Math.min((this.game(id).stages || 1) - 1, Number(context.stage) || 0));
      const n = r.startStage;
      if (additions.some((g) => g.id === id) || id === "bridges") r.data = this.controllers[id].create(false, n);
      else if (id === "runner") {
        r.data.round = n * 4;
        r.data.stage = n;
      } else if (id === "courier") r.data.stage = n;
      else if (id === "room") {
        r.data.round = n;
        r.data.pos = [...D.roomRounds[n].start];
      } else if (id === "garden") r.data.cycle = n;
      else if (id === "rhythm") {
        r.data.resolved = n * 8;
        r.data.notes.slice(0, n * 8).forEach((x) => x.done = true);
        r.data.time = 1.4 + n * 8 * 0.78;
      }
      return r;
    };
    const oldAttach = P.attach.bind(P);
    P.attach = function(r) {
      if (!Number.isInteger(r.difficulty)) r.difficulty = this.ensure().preferences.difficulty;
      if (!r.training && r.game === "runner") {
        const d = r.data;
        d.stage ??= Math.min(5, Math.floor(d.round / 4));
        d.coins ??= 0;
        d.barrier ??= false;
        d.bonus ??= false;
      }
      if (!r.training && r.game === "garden") {
        r.data.cycle ??= 0;
        r.data.care ??= Array.from({ length: 3 }, () => ({ watered: 0, clean: false }));
      }
      if (!r.training && r.game === "rhythm" && r.data.notes?.length === 24) {
        const d = r.data, start = d.notes.at(-1)?.at || 23;
        for (let i = 24; i < 48; i++) d.notes.push({ lane: (i + Math.floor(i / 3) + Math.floor(i / 8)) % 4, at: start + (i - 23) * 0.78, done: false });
      }
      oldAttach(r);
    };
    P.stageClear = function(r, stage) {
      if (r.training) return;
      const s = this.ensure(), list = s.stageRecords[r.game] ||= {}, old = list[stage], mistakes = Math.max(0, r.mistakes - (r.stageMistakes || 0)), hints = Math.max(0, r.hints - (r.stageHints || 0)), stars = mistakes === 0 && hints === 0 ? 3 : mistakes <= 3 ? 2 : 1;
      r.stageMistakes = r.mistakes;
      r.stageHints = r.hints;
      list[stage] = { stars: Math.max(stars, old?.stars || 0), score: Math.max(r.score, old?.score || 0), completed: true };
      if (!V.ProfessorStudio?.freePlay) {
        V.Life.award("play-stage-" + r.id + "-" + (r.arcade?.leg || 0) + "-" + stage, 12);
        if (!old) V.Progress.reward("play-stage-" + r.game + "-" + stage, 10);
      }
      const max = this.game(r.game).stages || 0;
      if (max && Array.from({ length: max }, (_, i) => list[i]?.completed).every(Boolean) && !s.badges.includes(r.game)) {
        s.badges.push(r.game);
        V.Quests.achieve("play-all-" + r.game);
      }
      this.save();
    };
    P.difficultyName = ["Explorador", "Aventureiro", "Mestre"];
    P.difficulty = function(r = this.active) {
      return r?.calm ? 0 : Math.max(0, Math.min(2, Number(r?.difficulty ?? this.ensure().preferences.difficulty) || 0));
    };
    P.selectDifficulty = function(n) {
      const s = this.ensure();
      s.preferences.difficulty = n;
      if (this.active) this.active.difficulty = n;
      V.Save.save();
    };
    P.stageMenu = function(id) {
      const g = this.game(id), s = this.ensure(), records = s.stageRecords[id] || {}, max = g.stages || 1;
      const list = Array.from({ length: max }, (_, i) => {
        const unlocked = i === 0 || !!records[i - 1]?.completed || !!s.records[id] || !!V.settings.unlockAll;
        const record = records[i];
        return `<button data-pg-stage="${i}" ${unlocked ? "" : "disabled"} class="${unlocked ? "secondary" : ""}"> ${record ? "\u2605".repeat(record.stars) : unlocked ? "\u25B7" : "\u{1F512}"} \xB7 Fase ${i + 1}</button>`;
      }).join("");
      V.UI.modal(g.title, "SELE\xC7\xC3O DE FASES", `<p>${esc(g.description)}</p><div class="pg-stage-grid">${list}</div><p>As fases conclu\xEDdas podem ser repetidas; cada recompensa de conclus\xE3o \xE9 concedida uma \xFAnica vez.</p>`, `<button id="pg-stage-back" class="secondary">Voltar aos desafios</button>`, true);
      V.$$("[data-pg-stage]").forEach((b) => b.onclick = () => this.launch(id, null, { kind: "stage", id: id + "-" + b.dataset.pgStage, stage: +b.dataset.pgStage }));
      V.$("#pg-stage-back").onclick = () => this.menu();
    };
    P.menu = function() {
      if (!V.state) return;
      const s = this.ensure();
      V.UI.modal("Desafios da cidade", "JOGOS \xB7 FASES \xB7 OFICINAS", `<div class="pg-menu-intro"><p>Escolha um jogo; o PIX guia a primeira partida dentro do cen\xE1rio. O treino pode ser revisto.</p><label>Dificuldade <select id="pg-difficulty"><option value="0" ${s.preferences.difficulty === 0 ? "selected" : ""}>Explorador</option><option value="1" ${s.preferences.difficulty === 1 ? "selected" : ""}>Aventureiro</option><option value="2" ${s.preferences.difficulty === 2 ? "selected" : ""}>Mestre</option></select></label></div><div class="pg-menu-grid">${D.games.map((g) => {
        const r = Object.values(s.runs).find((r2) => r2.game === g.id && !r2.finished), best = s.records[g.id], stages = s.stageRecords[g.id] || {}, count = Object.keys(stages).filter((k) => stages[k].completed).length;
        return `<article class="pg-game-card" style="--pg-color:${g.color}"><div class="pg-cover"><canvas data-pg-cover="${g.id}" width="360" height="156" aria-hidden="true"></canvas><small>${esc(g.tag)}</small></div><div class="pg-card-body"><h3>${esc(g.title)}</h3><p>${esc(g.description)}</p><p class="pg-goal">${esc(g.goal)}</p><small>${g.stages ? count + "/" + g.stages + " fases \xB7 " : ""}${best ? "\u2605".repeat(best.stars) + " \xB7 " + best.score + " pontos" : r ? "\u25C9 Jogo guardado" : "Novo"}</small><div class="row"><button class="primary" data-pg-play="${g.id}">${r ? "Continuar" : "Jogar"}</button><button class="secondary" data-pg-train="${g.id}">Treinar</button>${g.stages ? `<button class="secondary" data-pg-levels="${g.id}">Fases</button>` : ""}</div></div></article>`;
      }).join("")}</div><h3>Oficinas culturais</h3><div class="pg-workshop-grid">${V.CultureChallenges.games.map((g) => `<button data-pg-culture="${g.id}" class="secondary"><strong>${esc(g.title)}</strong><small>${V.CultureChallenges.ensure().completed[g.id] ? " \u2713" : " \xB7 " + g.stages.length + " etapas"}</small></button>`).join("")}</div>`, `<button id="pg-quests" class="secondary">Miss\xF5es da investiga\xE7\xE3o</button>`, true);
      V.$("#pg-difficulty").onchange = (e) => this.selectDifficulty(+e.target.value);
      V.$$("[data-pg-play]").forEach((b) => b.onclick = () => {
        const r = Object.values(s.runs).find((r2) => r2.game === b.dataset.pgPlay && !r2.finished);
        r ? this.attach(r) : this.launch(b.dataset.pgPlay);
      });
      V.$$("[data-pg-train]").forEach((b) => b.onclick = () => this.train(b.dataset.pgTrain));
      V.$$("[data-pg-levels]").forEach((b) => b.onclick = () => this.stageMenu(b.dataset.pgLevels));
      V.$$("[data-pg-culture]").forEach((b) => b.onclick = () => V.CultureChallenges.open(b.dataset.pgCulture));
      V.$("#pg-quests").onclick = () => V.CityMenus.board("challenges");
      this.covers();
    };
    const oldCovers = P.covers.bind(P);
    P.covers = function() {
      oldCovers();
      for (const id of ["memory", "museum", "platform", "radio"]) {
        const el = V.$(`[data-pg-cover="${id}"]`);
        if (!el) continue;
        const c = el.getContext("2d");
        c.fillStyle = "#1b463e";
        c.fillRect(0, 0, 360, 156);
        c.fillStyle = this.game(id).color;
        if (id === "memory") {
          for (let i = 0; i < 3; i++) this.house(c, 25 + i * 115, 60, 86, 64, ["Arquivo", "Museu", "Casa"][i], "#8aa796");
          this.box(c, 167, 103, 28, 25, "#e9bd73", "#f7e5ba");
        }
        if (id === "museum") {
          this.box(c, 37, 35, 285, 108, "#c3b38f", "#eedbbb");
          [0, 1, 2].forEach((i) => this.box(c, 75 + i * 75, 72, 42, 45, i % 2 ? "#8db7ac" : "#d7a07c", "#f7db9c"));
        }
        if (id === "platform") {
          [0, 1, 2, 3].forEach((i) => this.box(c, i * 95, 123 - i % 2 * 25, 90, 35, "#6b9877"));
          this.box(c, 181, 53, 44, 38, "#e8c078", "#f4ebc8");
        }
        if (id === "radio") {
          for (let i = 0; i < 3; i++) {
            this.box(c, 52 + i * 89, 50, 74, 84, "#385b5f", "#f1d8b2");
            this.box(c, 65 + i * 89, 65, 48, 9, "#82c29b");
            this.text(c, String(i + 1), 90 + i * 89, 109, 20);
          }
        }
      }
    };
    const oldControls = P.controls.bind(P);
    P.controls = function() {
      if (this.active && this.controllers[this.active.game].controls) {
        const host = V.$("#pg-controls");
        host.replaceChildren();
        this.controllers[this.active.game].controls(this.active, host);
        return;
      }
      return oldControls();
    };
    const oldKey = P.key.bind(P);
    P.key = function(k, e) {
      if (this.active && this.controllers[this.active.game].key && !V.modal) {
        if (k === "escape" || k === "p") return oldKey(k, e);
        if (this.active.training && this.active.ack) return;
        const handled = this.controllers[this.active.game].key(this.active, k, e);
        if (handled) {
          e?.preventDefault?.();
          return;
        }
      }
      return oldKey(k, e);
    };
    const oldPause = P.pause.bind(P);
    P.pause = function() {
      const r = this.active;
      if (!r) return;
      oldPause();
      const calm = V.$("#pg-calm");
      if (!calm) return;
      const label = document.createElement("label");
      label.className = "field";
      label.innerHTML = '<span>Dificuldade desta partida</span><select id="pg-pause-difficulty"><option value="0">Explorador</option><option value="1">Aventureiro</option><option value="2">Mestre</option></select>';
      calm.closest("label")?.after(label);
      const pick = V.$("#pg-pause-difficulty");
      pick.value = String(r.difficulty);
      pick.onchange = () => {
        r.difficulty = +pick.value;
        this.selectDifficulty(+pick.value);
        this.save();
      };
    };
    const oldUpdate = P.update.bind(P);
    P.update = function(dt) {
      const r = this.active;
      oldUpdate(dt);
      if (!r || r !== this.active || r.training || r.finished) return;
      if (r.mistakes >= 3 && !r.adaptiveHelp) {
        r.adaptiveHelp = true;
        r.feedback = "PIX: tente usar Dica para visualizar a pr\xF3xima a\xE7\xE3o. Voc\xEA n\xE3o perde o progresso salvo.";
        this.save();
      }
      if (r.mistakes >= 7 && !r.adaptiveCalm) {
        r.adaptiveCalm = true;
        r.calm = true;
        r.feedback = "PIX ativou o ritmo tranquilo ap\xF3s v\xE1rias tentativas. \xC9 poss\xEDvel desativ\xE1-lo na pausa.";
        this.save();
      }
    };
  })();
});
