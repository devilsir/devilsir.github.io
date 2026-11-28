/* Registered module: maritime-fishing */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("maritime-fishing", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, D = V.MaritimeData, M = V.Maritime, A = V.MaritimeArt, N = V.SeaNavigation, esc = V.escape;
    const F = V.SeaFishing = {
      run: null,
      bound: null,
      start() {
        if (!N.available() || this.run) return false;
        const d = D.maps[V.World.current.id], b = N.boat;
        if (b && Math.hypot(b.vx, b.vy) > 25) {
          V.UI.toast("Diminua a velocidade e ancore antes de lan\xE7ar a linha.");
          return false;
        }
        if (!b && V.dist(V.Player.data, M.point(d.fishing)) > 145) {
          V.UI.toast("Aproxime-se do ponto Fishing no cais, ou embarque e pare o barco.");
          return false;
        }
        V.UI.close();
        V.MinigamePraise.clear();
        if (b) N.anchor(true);
        else V.Activities.perform("fish", { duration: 3600, close: false, collect: false });
        this.bound = V.state;
        const s = M.ensure(), fish = D.fish[V.World.current.id === "cape-town" ? s.catchSerial % 3 : 0];
        this.run = { id: "sea-fishing-" + Date.now(), fish: fish.id, phase: "ready", clock: 0, phaseTime: 0, progress: 0, tension: 0.34, cooldown: 0, hits: 0, calm: V.settings.assist === true || V.settings.timeLimits === false || V.settings.reducedMotion === true, message: "Lance a linha e observe a boia." };
        this.panel();
        return true;
      },
      panel() {
        const r = this.run;
        if (!r) return;
        V.UI.onClose = null;
        V.UI.modal("Pesca na ba\xEDa", "CAST \xB7 WATCH \xB7 REEL", `<div class="sea-fishing-layout"><canvas id="sea-fish-scene" width="800" height="250" aria-label="Embarca\xE7\xE3o, linha e boia no mar"></canvas><div class="sea-fishing-tools"><p id="sea-fish-message" role="status"></p><div class="sea-fish-meters"><label>Tens\xE3o da linha<canvas id="sea-fish-meter" width="600" height="70" aria-label="Mantenha a tens\xE3o na faixa verde"></canvas></label><label>Captura<progress id="sea-fish-progress" max="1" value="0"></progress></label></div><label class="toggle"><input id="sea-fish-calm" type="checkbox" ${r.calm ? "checked" : ""}>Modo tranquilo \xB7 sem janela de reflexo</label><div class="sea-fishing-buttons"><button id="sea-fish-action" class="primary"></button><button id="sea-fish-rest" class="secondary">Afrouxar linha</button></div><p class="sea-small">Lance a linha. Quando a boia afundar, fisgue. Depois recolha na faixa verde; afrouxe se a tens\xE3o subir. Espa\xE7o tamb\xE9m aciona o bot\xE3o principal.</p></div></div>`, `<button id="sea-fish-leave" class="secondary">Guardar vara</button>`, true);
        V.UI.onClose = () => this.cancel();
        V.$("#sea-fish-action").onclick = () => this.action();
        V.$("#sea-fish-rest").onclick = () => this.rest();
        V.$("#sea-fish-leave").onclick = () => {
          this.cancel();
          V.UI.close();
        };
        V.$("#sea-fish-calm").onchange = (e) => {
          r.calm = e.target.checked;
          if (r.calm) r.tension = 0.46;
          this.hud();
        };
        this.hud();
        this.paint();
      },
      action() {
        const r = this.run;
        if (!r || performance.now() < (r.readyAt || 0) || r.phase === "caught") return false;
        r.readyAt = performance.now() + 220;
        r.cooldown = 0.22;
        if (r.phase === "ready" || r.phase === "escaped") {
          Object.assign(r, { phase: "waiting", phaseTime: 0, progress: 0, tension: 0.34, hits: 0, message: "Linha lan\xE7ada. Espere a boia afundar." });
          V.Audio.sfx("menu");
          this.hud();
          return true;
        }
        if (r.phase === "waiting") {
          r.message = "A boia ainda est\xE1 flutuando. Observe o sinal antes de fisgar.";
          this.hud();
          return false;
        }
        if (r.phase === "bite") {
          r.phase = "reeling";
          r.phaseTime = 0;
          r.message = "Fisgou! Recolha na faixa verde e controle a tens\xE3o.";
          V.Audio.sfx("correct");
          V.MinigamePraise.emit("hit", { key: r.id + ":hook", detail: "Boa fisgada!" });
          this.hud();
          return true;
        }
        if (r.phase === "reeling") {
          const good = r.calm || r.tension >= 0.18 && r.tension <= 0.82;
          if (!good) {
            r.message = r.tension > 0.82 ? "Tens\xE3o alta! Afrouxe a linha antes de recolher." : "Linha muito frouxa. Espere o marcador voltar \xE0 faixa verde.";
            V.MinigamePraise.wrong();
            this.hud();
            return false;
          }
          const fish = D.fish.find((f) => f.id === r.fish);
          r.hits++;
          r.progress = Math.min(1, r.progress + 0.27);
          r.tension = r.calm ? 0.46 : Math.min(1, r.tension + 0.17 * fish.difficulty);
          r.message = "Boa puxada! " + Math.round(r.progress * 100) + "% da captura.";
          V.Audio.sfx("collect");
          V.MinigamePraise.emit(r.hits >= 3 ? "combo" : "hit", { key: r.id + ":reel:" + r.hits, combo: r.hits, detail: "Linha sob controle!" });
          if (r.progress >= 1) this.complete();
          else this.hud();
          return true;
        }
        return false;
      },
      rest() {
        const r = this.run;
        if (!r || r.phase !== "reeling") return;
        r.tension = Math.max(0.14, r.tension - 0.22);
        r.message = "Linha afrouxada. Espere a faixa verde para recolher de novo.";
        this.hud();
      },
      update(dt) {
        const r = this.run;
        if (!r || r.phase === "caught") return;
        if (this.bound !== V.state || !V.$("#sea-fish-scene")) {
          this.cancel();
          return;
        }
        dt = Math.min(0.08, Math.max(0, dt));
        r.clock += dt;
        r.phaseTime += dt;
        r.cooldown = Math.max(0, ((r.readyAt || 0) - performance.now()) / 1e3);
        if (r.phase === "waiting" && r.phaseTime >= 2.4) {
          r.phase = "bite";
          r.phaseTime = 0;
          r.message = "A BOIA AFUNDOU! Fisgue agora.";
          V.Audio.sfx("correct");
          this.hud();
        } else if (r.phase === "bite" && !r.calm && r.phaseTime > 3.2) {
          r.phase = "escaped";
          r.message = "O peixe soltou a isca. Lance a linha para tentar novamente.";
          V.MinigamePraise.wrong();
          this.hud();
        } else if (r.phase === "reeling") {
          const fish = D.fish.find((f) => f.id === r.fish);
          if (r.calm) r.tension = 0.46;
          else r.tension = V.clamp(r.tension + dt * (0.035 * fish.difficulty * Math.sin(r.clock * 2) - 0.055), 0.08, 1);
          if (r.tension >= 0.98) {
            r.phase = "escaped";
            r.message = "A linha ficou muito tensa e o peixe escapou. Afrouxe nas pr\xF3ximas puxadas.";
            V.MinigamePraise.wrong();
            this.hud();
          }
        }
        this.paint();
      },
      hud() {
        const r = this.run;
        if (!r || !V.$("#sea-fish-action")) return;
        V.$("#sea-fish-message").textContent = r.message;
        const b = V.$("#sea-fish-action");
        b.textContent = { ready: "Lan\xE7ar linha", waiting: "Esperar a boia", bite: "Fisgar! \xB7 Espa\xE7o", reeling: "Recolher \xB7 Espa\xE7o", escaped: "Tentar novamente" }[r.phase] || "Conclu\xEDdo";
        b.disabled = r.phase === "waiting";
        V.$("#sea-fish-rest").disabled = r.phase !== "reeling";
        V.$("#sea-fish-progress").value = r.progress;
      },
      paint() {
        const r = this.run, scene = V.$("#sea-fish-scene"), meter = V.$("#sea-fish-meter");
        if (!r || !scene || !meter) return;
        const c = scene.getContext("2d");
        c.imageSmoothingEnabled = false;
        c.fillStyle = "#215c70";
        c.fillRect(0, 0, 800, 250);
        const water = A.images.get("coastal-water");
        if (water) {
          c.fillStyle = c.createPattern(water, "repeat");
          c.fillRect(0, 0, 800, 250);
        }
        A.boat(c, N.boat?.type || "row", 160, 155, Math.PI * 0.5, 180, true);
        const bob = V.settings.reducedMotion ? 0 : Math.sin(r.clock * 3) * 3, y = r.phase === "bite" ? 188 : 164 + bob;
        c.strokeStyle = "#f6e9c6";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(195, 133);
        c.quadraticCurveTo(360, 40, 520, y - 8);
        c.stroke();
        c.fillStyle = r.phase === "bite" ? "#ffd070" : "#f3e5bf";
        c.fillRect(515, y - 16, 10, 15);
        c.fillStyle = "#d86f58";
        c.fillRect(515, y - 6, 10, 13);
        if (["bite", "reeling"].includes(r.phase)) {
          c.strokeStyle = "#e7e9ae";
          c.beginPath();
          c.ellipse(520, y + 9, 22, 7, 0, 0, Math.PI * 2);
          c.stroke();
        }
        if (r.phase === "reeling") {
          c.globalAlpha = 0.32;
          A.image(c, "fish-" + r.fish, 570, 155, 110, 70);
          c.globalAlpha = 1;
        }
        A.text(c, { ready: "CAST \xB7 LANCE A LINHA", waiting: "WATCH \xB7 OBSERVE A BOIA", bite: "HOOK \xB7 FISGUE!", reeling: "REEL \xB7 CONTROLE A LINHA", escaped: "TENTE OUTRA VEZ" }[r.phase] || "", 400, 27, 19);
        const m = meter.getContext("2d");
        m.clearRect(0, 0, 600, 70);
        m.fillStyle = "#183f48";
        m.fillRect(12, 18, 576, 28);
        m.fillStyle = "#82bf96";
        m.fillRect(12 + 576 * 0.18, 18, 576 * 0.64, 28);
        m.fillStyle = "#df8e70";
        m.fillRect(12 + 576 * 0.84, 18, 576 * 0.16, 28);
        m.fillStyle = "#fff1bc";
        m.fillRect(9 + 576 * r.tension, 10, 6, 44);
        if (V.$("#sea-fish-progress")) V.$("#sea-fish-progress").value = r.progress;
      },
      complete() {
        const r = this.run;
        if (!r || r.phase === "caught" || r.progress < 1) return false;
        r.phase = "caught";
        const s = M.ensure(), f = D.fish.find((f2) => f2.id === r.fish), old = s.catches[f.id], size = Math.round([18, 70, 85][D.fish.indexOf(f)] + s.catchSerial * 13 % 23);
        s.catchSerial++;
        s.catches[f.id] = { count: (old?.count || 0) + 1, best: Math.max(old?.best || 0, size), lastMap: V.World.current.id };
        if (!old) V.Progress.reward("sea-fish-" + f.id, 8);
        V.Quests.achieve("sea-first-catch");
        V.UI.onClose = null;
        V.Save.save();
        V.UI.modal("Captura registrada!", f.en + " \xB7 " + size + " cm no jogo", `<article class="sea-entry"><img src="${D.asset(f.art)}" alt="${esc(f.name)}"><div><h3>${esc(f.name)}</h3><p><i>${esc(f.scientific)}</i></p><p>${esc(f.note)}</p><p>O registro fica no caderno nas duas escolhas. Guardar acrescenta um peixe fresco \xE0 mochila.</p>${M.source(f.source)}</div></article>`, '<button id="sea-fish-keep" class="primary">Guardar peixe</button><button id="sea-fish-release" class="secondary">Soltar peixe</button>');
        V.UI.onClose = () => this.decide(false, false);
        V.$("#sea-fish-keep").onclick = () => this.decide(true);
        V.$("#sea-fish-release").onclick = () => this.decide(false);
        V.Audio.sfx("victory");
        V.MinigamePraise.emit("win", { key: r.id + ":caught", detail: f.name + " registrado no caderno!" });
        return true;
      },
      decide(keep, close = true) {
        const r = this.run;
        if (!r || r.phase !== "caught" || r.claimed) return false;
        r.claimed = true;
        if (keep) V.Progress.add("freshFish");
        V.UI.onClose = null;
        this.cancel();
        V.Save.save();
        if (close) V.UI.close();
        return true;
      },
      cancel() {
        if (this.bound === V.state && V.Player.data) V.Player.data.poseUntil = 0;
        this.run = null;
        this.bound = null;
      }
    };
    V.Hooks.around(V.Game, "update", "maritime-fishing:update:1", (nextHook) => function(dt) {
      if (F.run) F.update(dt);
      return nextHook(dt);
    });
    V.Hooks.around(V.Game, "onKey", "maritime-fishing:onKey:1", (key) => function(k, e = {}) {
      if (F.run && [" ", "enter"].includes(k)) {
        e.preventDefault?.();
        if (!e.repeat) F.action();
        return;
      }
      return key(k, e);
    });
    V.Hooks.around(V.Game, "startGame", "maritime-fishing:startGame:1", (start) => function(...a) {
      F.cancel();
      return start(...a);
    });
    const fishing = V.Activities.startFishing.bind(V.Activities);
    V.Activities.startFishing = function(...a) {
      return V.World.current?.maritime ? F.start() : fishing(...a);
    };
    V.AchievementProgress.add("sea-first-catch", "Primeira captura", "Registre uma captura no caderno de bordo.", "challenges", () => Number((M.ensure()?.catchSerial || 0) > 0), 1, { unit: "captura", index: 1 });
  })();
});
