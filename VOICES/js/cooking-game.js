/* Registered module: cooking-game */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("cooking-game", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, P = V.Playground, D = V.CookingData, A = V.CookingArt, ID = D.id, clamp = V.clamp;
    const heatKinds = new Set(["fry", "simmer", "steam", "bake"]);
    const instructions = {
      scale: "Arraste da cauda (esquerda) para a cabe\xE7a (direita) sobre cada faixa marcada. Teclado: D ou \u2192 limpa a faixa indicada.",
      cut: "Arraste a faca de cima para baixo na linha dourada. Teclado: S ou \u2193 executa um corte.",
      grate: "Fa\xE7a movimentos verticais alternados. Teclado: alterne W/S ou \u2191/\u2193.",
      wash: "Esfregue em c\xEDrculos na bacia. Teclado: repita W, D, S, A ou \u2191, \u2192, \u2193, \u2190.",
      grind: "Fa\xE7a voltas com o pil\xE3o sobre o c\xEDrculo. Teclado: repita W, D, S, A ou \u2191, \u2192, \u2193, \u2190.",
      stir: "Mexa ao redor da tigela seguindo o c\xEDrculo. Teclado: repita W, D, S, A ou \u2191, \u2192, \u2193, \u2190.",
      knead: "Empurre a massa e puxe de volta alternadamente. Teclado: alterne W/S ou \u2191/\u2193.",
      fold: "Arraste cada canto dourado da folha at\xE9 o centro. Teclado: W, D, S, A na ordem indicada.",
      layer: "Arraste os ingredientes da bandeja para a panela. Teclado: A/D ou \u2190/\u2192 escolhe e E coloca.",
      shape: "Leve cada por\xE7\xE3o ao lugar marcado na bandeja. Teclado: A/D ou \u2190/\u2192 escolhe e E modela.",
      season: "Distribua o tempero nas tr\xEAs marcas. Toque na marca, ou use A/D e E.",
      plate: "Arraste cada por\xE7\xE3o para o prato. Teclado: A/D ou \u2190/\u2192 escolhe e E serve.",
      pour: "Segure sobre a tigela para despejar e solte na faixa verde. Teclado: E inicia e E para o fluxo.",
      fry: "Mantenha o fogo na faixa verde com A/D ou \u2190/\u2192. Quando aparecer VIRAR, use E ou toque na panela.",
      simmer: "Mantenha o fogo na faixa verde com A/D ou \u2190/\u2192 enquanto a panela cozinha.",
      steam: "Mantenha o vapor na faixa verde com A/D ou \u2190/\u2192 at\xE9 o alimento cozinhar.",
      bake: "Regule o forno com A/D ou \u2190/\u2192. A cobertura muda conforme assa."
    };
    const tutorial = [D.step("Cortar a cebola", "cut", "prep", 1, 1, 3), D.step("Mexer a massa", "stir", "batter", 0, 1, 3), D.step("Regular o fogo", "simmer", "heat", 3, 1, 3)];
    function instruction(kind) {
      if (!V.DuoChallenges.isChild) return instructions[kind];
      const right = +new URLSearchParams(location.search).get("player") === 1, up = right ? "\u2191" : "W", down = right ? "\u2193" : "S", left = right ? "\u2190" : "A", east = right ? "\u2192" : "D", confirm = right ? "Enter" : "E";
      const keys = { scale: east + " raspa a faixa indicada.", cut: down + " executa um corte.", grate: "Alterne " + up + " e " + down + ".", knead: "Alterne " + up + " e " + down + ".", wash: "Repita " + up + ", " + east + ", " + down + ", " + left + ".", grind: "Repita " + up + ", " + east + ", " + down + ", " + left + ".", stir: "Repita " + up + ", " + east + ", " + down + ", " + left + ".", fold: up + ", " + east + ", " + down + ", " + left + " na ordem indicada.", layer: left + "/" + east + " escolhe e " + confirm + " coloca.", shape: left + "/" + east + " escolhe e " + confirm + " modela.", season: left + "/" + east + " escolhe e " + confirm + " tempera.", plate: left + "/" + east + " escolhe e " + confirm + " serve.", pour: confirm + " inicia e " + confirm + " para o fluxo." };
      if (heatKinds.has(kind)) return "Mantenha o marcador na faixa verde com " + left + "/" + east + ". " + (kind === "fry" ? "Quando aparecer VIRAR, use " + confirm + " ou toque na panela." : "A comida muda conforme cozinha.");
      const pointer = instructions[kind].split("Teclado:")[0].replace(/Toque na marca, ou use A\/D e E\./, "Toque na marca.");
      return pointer + " Teclado: " + keys[kind];
    }
    const K = V.Cooking = {
      recipe(r) {
        return D.recipes[clamp(r.data.stage || 0, 0, D.recipes.length - 1)];
      },
      steps(r) {
        return r.training ? tutorial : this.recipe(r).steps;
      },
      step(r) {
        return this.steps(r)[r.training ? r.step : r.data.step] || this.steps(r).at(-1);
      },
      reset(r) {
        const d = r.data;
        Object.assign(d, { progress: 0, phase: "work", transitionLeft: 0.8, t: 0, fill: 0, pouring: false, heat: 0.51, cooked: 0, flipped: false, overheat: 0, scorch: 0, burnHold: 0, angle: null, turns: 0, pattern: 0, lastDirection: -1, strokes: 0, selected: 0, placed: [], zones: [false, false, false, false, false, false], tool: { x: 480, y: 260 }, animation: 0, stroke: null, particles: [], warningUntil: 0, stepMistakes: r.mistakes || 0 });
      },
      point(r) {
        const d = r.data, s = this.step(r);
        if (s.kind === "scale") {
          const n = Math.max(0, d.zones.indexOf(false));
          return { x: 335 + n % 3 * 105, y: 240 + Math.floor(n / 3) * 62 };
        }
        if (s.kind === "cut") return { x: 345 + Math.floor(d.progress * 5) * 57, y: 255 };
        if (s.kind === "fold") return V.CookingWorkshop?.foldPoint(r) || [{ x: 285, y: 180 }, { x: 675, y: 180 }, { x: 675, y: 370 }, { x: 285, y: 370 }][d.placed.length % 4];
        if (s.kind === "season") return [{ x: 365, y: 260 }, { x: 480, y: 225 }, { x: 595, y: 280 }][d.placed.length % 3];
        return { x: 480, y: 270 };
      },
      advance(r) {
        const d = r.data;
        if (d.phase !== "done" || d.done || r.finished) return;
        if (r.training) return;
        V.Input.clear();
        P.held = { x: 0, y: 0 };
        P.drag = null;
        d.results.push({ step: d.step, points: Math.max(30, 100 - (r.mistakes - d.stepMistakes) * 15) });
        if (d.step + 1 >= this.steps(r).length) {
          d.done = true;
          P.stageClear(r, d.stage);
          P.finish();
          return;
        }
        d.step++;
        this.reset(r);
        r.feedback = instruction(this.step(r).kind);
        P.controls();
        P.hud();
        P.save();
      },
      complete(r) {
        const d = r.data;
        if (d.phase !== "work") return;
        d.progress = 1;
        d.phase = "done";
        d.transitionLeft = 0.8;
        d.pouring = false;
        d.stroke = null;
        P.hit(Math.max(40, 140 - (r.mistakes - d.stepMistakes) * 20));
        P.feedback("\u2713 " + this.step(r).title + " conclu\xEDdo." + (r.training ? "" : " " + (d.step + 1 >= this.steps(r).length ? "Servindo a receita\u2026" : "Preparando a pr\xF3xima etapa\u2026")));
        if (r.training) P.event(["cook-cut", "cook-stir", "cook-heat"][r.step]);
        else P.controls();
        P.save();
      },
      gain(r, n, origin = r.data.tool) {
        const d = r.data;
        if (d.phase !== "work") return;
        V.CookingWorkshop?.effect(r, origin);
        d.progress = clamp(d.progress + n, 0, 1);
        d.animation = 0.35;
        r.moves++;
        if (d.progress >= 0.999) this.complete(r);
      },
      mistake(r, text) {
        const d = r.data;
        if (d.warningUntil > d.t) return;
        d.warningUntil = d.t + 1.2;
        P.feedback(text, true);
      },
      spark(r, x, y, color = "#f6e5b8") {
        if (V.settings.reducedMotion) return;
        for (let i = 0; i < 6; i++) r.data.particles.push({ x, y, vx: (i - 2.5) * 24, vy: -35 - i * 10, life: 0.65, color });
        r.data.particles = r.data.particles.slice(-48);
      },
      direction(r, k) {
        const d = r.data, s = this.step(r), n = { w: 0, arrowup: 0, d: 1, arrowright: 1, s: 2, arrowdown: 2, a: 3, arrowleft: 3 }[k];
        if (n === void 0) return false;
        if (heatKinds.has(s.kind)) {
          if (n === 1 || n === 3) {
            d.heat = clamp(d.heat + (n === 1 ? 0.07 : -0.07), 0, 1);
            r.moves++;
          }
          return true;
        }
        if (s.kind === "scale") {
          if (n === 1) {
            const i = d.zones.indexOf(false);
            if (i >= 0) {
              const p = this.point(r);
              d.zones[i] = true;
              d.tool = { x: p.x + 30, y: p.y };
              this.gain(r, 1 / 6, p);
            }
          }
          return true;
        }
        if (s.kind === "cut") {
          if (n === 2) {
            d.tool = { x: this.point(r).x, y: 320 };
            this.gain(r, 1 / 5);
          }
          return true;
        }
        if (["grate", "knead"].includes(s.kind)) {
          if ((n === 0 || n === 2) && n !== d.lastDirection) {
            d.lastDirection = n;
            d.tool = { x: 480, y: n === 0 ? 200 : 340 };
            this.gain(r, 1 / 8);
          }
          return true;
        }
        if (["stir", "grind", "wash"].includes(s.kind)) {
          if (n === d.pattern % 4) {
            d.pattern++;
            d.tool = { x: 480 + Math.sin(n * Math.PI / 2) * 115, y: 270 - Math.cos(n * Math.PI / 2) * 90 };
            this.gain(r, 1 / 12);
          }
          return true;
        }
        if (s.kind === "fold") {
          if (n === d.placed.length % 4) {
            const p = this.point(r);
            d.placed.push(n);
            this.gain(r, 1 / 4, p);
          }
          return true;
        }
        if (["shape", "layer", "season", "plate"].includes(s.kind)) {
          d.selected = (d.selected + (n === 1 || n === 2 ? 1 : 2)) % 3;
          return true;
        }
        return true;
      },
      place(r, index) {
        const d = r.data, s = this.step(r);
        if (d.placed.includes(index)) return;
        if (s.kind === "season" && index !== d.placed.length) {
          this.mistake(r, "Siga a marca dourada para temperar por igual.");
          return;
        }
        const target = s.kind === "season" ? this.point(r) : { x: 480 + (index - 1) * 60, y: 280 };
        d.placed.push(index);
        d.tool = target;
        this.gain(r, 1 / 3, target);
        d.selected = [0, 1, 2].find((i) => !d.placed.includes(i)) ?? 0;
      },
      pour(r, value) {
        const d = r.data;
        if (d.phase !== "work") return;
        if (value) {
          d.pouring = true;
          return;
        }
        if (!d.pouring) return;
        d.pouring = false;
        if (d.fill >= 0.55 && d.fill <= 0.76) this.complete(r);
        else {
          this.mistake(r, d.fill < 0.55 ? "Ainda falta l\xEDquido. Pode continuar at\xE9 a faixa verde." : "Passou da medida. Esvaziamos a tigela para voc\xEA tentar de novo.");
          if (d.fill > 0.76) d.fill = 0;
        }
      },
      entry(index = 0) {
        V.ChallengeCatalog.detail("play:" + ID);
        const level = V.$("#challenge-level");
        if (level) {
          const normal = V.$('input[name="challenge-mode"][value="normal"]');
          if (normal) {
            normal.checked = true;
            normal.dispatchEvent(new Event("change"));
          }
          level.value = String(index);
          level.dispatchEvent(new Event("change"));
        }
        return true;
      }
    };
    const ctrl = P.controllers[ID] = {
      create(training, stage = 0) {
        const r = { data: { version: 1, stage: clamp(stage, 0, D.recipes.length - 1), step: 0, results: [] }, mistakes: 0 };
        K.reset(r);
        return r.data;
      },
      guideStep(r) {
        K.reset(r);
        if (r.training && r.step === 2) r.data.heat = 0.18;
        r.feedback = instruction(K.step(r).kind);
        P.controls();
      },
      model(r) {
        const d = r.data, recipe = K.recipe(r), s = K.step(r);
        return { request: (r.training ? "Treino" : recipe.name) + " \xB7 " + s.title, support: (r.training ? "Gestos de cozinha" : recipe.region) + " \xB7 etapa " + ((r.training ? r.step : d.step) + 1) + "/" + K.steps(r).length, progress: r.training ? r.step : d.step, total: K.steps(r).length, hint: instruction(s.kind) };
      },
      controls(r, h) {
        const s = K.step(r), d = r.data, right = V.DuoChallenges.isChild && +new URLSearchParams(location.search).get("player") === 1, confirm = right ? "Enter" : "E", leftKey = right ? "\u2190" : "A", rightKey = right ? "\u2192" : "D";
        const button = (id, label, action, arg) => h.append(P.button(id, label, () => P.action(action, arg)));
        if (d.phase === "done") {
          const status = document.createElement("p");
          status.className = "cook-transition";
          status.setAttribute("role", "status");
          status.textContent = d.step + 1 >= K.steps(r).length ? "\u2713 Servindo sua receita\u2026" : "\u2713 Pr\xF3xima etapa em instantes\u2026";
          h.append(status);
          return;
        }
        if (heatKinds.has(s.kind)) {
          button("cook-less", "\u2212 Fogo \xB7 " + leftKey, "heat", -0.07);
          if (s.kind === "fry") button("cook-flip", "Virar \xB7 " + confirm, "flip");
          button("cook-more", "+ Fogo \xB7 " + rightKey, "heat", 0.07);
        } else if (s.kind === "pour") button("cook-pour", "Iniciar / parar fluxo \xB7 " + confirm, "pour");
        else if (s.kind === "scale") button("cook-scrape", right ? "Raspar faixa \xB7 \u2192" : "Raspar faixa \u2192 \xB7 D", "dir", "d");
        else if (s.kind === "cut") button("cook-cut", right ? "Cortar \xB7 \u2193" : "Cortar \u2193 \xB7 S", "dir", "s");
        else if (["grate", "knead"].includes(s.kind)) {
          button("cook-up", right ? "\u2191" : "\u2191 \xB7 W", "dir", "w");
          button("cook-down", right ? "\u2193" : "\u2193 \xB7 S", "dir", "s");
        } else if (["stir", "grind", "wash", "fold"].includes(s.kind)) {
          for (const [k, t] of [["w", "\u2191"], ["d", "\u2192"], ["s", "\u2193"], ["a", "\u2190"]]) button("cook-dir-" + k, right ? t : t + " " + k.toUpperCase(), "dir", k);
        } else {
          button("cook-select-prev", "Escolher \xB7 " + leftKey, "dir", "a");
          button("cook-place", "Colocar \xB7 " + confirm, "place");
          button("cook-select-next", "Escolher \xB7 " + rightKey, "dir", "d");
        }
      },
      action(r, name, arg) {
        const d = r.data, s = K.step(r);
        if (d.done) return;
        if (name === "next") return K.advance(r);
        if (d.phase !== "work") return;
        if (name === "dir") K.direction(r, arg);
        else if (name === "heat") d.heat = clamp(d.heat + arg, 0, 1);
        else if (name === "pour") K.pour(r, !d.pouring);
        else if (name === "place") K.place(r, d.selected);
        else if (name === "flip") {
          if (s.kind === "fry" && d.cooked >= 0.43 && !d.flipped && !(d.scorch >= 1)) {
            d.flipped = true;
            d.animation = 0.65;
            P.feedback("\u2713 Virou no ponto. Termine a fritura na faixa verde.");
            r.moves++;
          } else if (!d.flipped) K.mistake(r, "Espere aparecer VIRAR na panela.");
        }
      },
      key(r, k, e = {}) {
        if (e.repeat) return true;
        if (k === "escape" || k === "p") return false;
        const d = r.data;
        if (d.phase === "done") {
          if (["e", " ", "enter"].includes(k)) K.advance(r);
          return true;
        }
        if (K.direction(r, k)) {
          P.hud();
          return true;
        }
        if (["e", " ", "enter"].includes(k)) {
          const kind = K.step(r).kind;
          if (kind === "pour") this.action(r, "pour");
          else if (kind === "fry") this.action(r, "flip");
          else if (["shape", "layer", "season", "plate"].includes(kind)) this.action(r, "place");
          return true;
        }
        return false;
      },
      pointer(r, type, p) {
        const d = r.data, s = K.step(r);
        d.tool = { x: p.x, y: p.y };
        if (d.phase !== "work") return;
        if (type === "down") {
          d.stroke = { x: p.x, y: p.y };
          d.angle = null;
          if (s.kind === "pour") K.pour(r, true);
          if (s.kind === "fry" && p.y > 130 && p.y < 400) this.action(r, "flip");
          if (s.kind === "season") {
            const i = [{ x: 365, y: 260 }, { x: 480, y: 225 }, { x: 595, y: 280 }].findIndex((a) => Math.hypot(a.x - p.x, a.y - p.y) < 45);
            if (i >= 0) K.place(r, i);
          }
          return;
        }
        if (type === "cancel") {
          d.stroke = null;
          d.angle = null;
          if (s.kind === "pour") d.pouring = false;
          return;
        }
        if (!d.stroke) return;
        if (type === "move") {
          if (["stir", "grind", "wash"].includes(s.kind)) {
            const radius = Math.hypot(p.x - 480, p.y - 270);
            if (radius < 60 || radius > 190) {
              d.angle = null;
              return;
            }
            const angle = Math.atan2(p.y - 270, p.x - 480);
            if (d.angle !== null) {
              let delta = angle - d.angle;
              while (delta > Math.PI) delta -= Math.PI * 2;
              while (delta < -Math.PI) delta += Math.PI * 2;
              if (Math.abs(delta) < 0.9 && Math.abs(delta) > 0.012) {
                d.turns += Math.abs(delta);
                K.gain(r, Math.abs(delta) / (Math.PI * 4));
              }
            }
            d.angle = angle;
          }
          if (["grate", "knead"].includes(s.kind) && Math.abs(p.y - d.stroke.y) > 48 && Math.abs(p.x - 480) < 200) {
            const dir = p.y > d.stroke.y ? 2 : 0;
            if (dir !== d.lastDirection) {
              d.lastDirection = dir;
              K.gain(r, 1 / 8);
            }
            d.stroke = { ...p };
          }
        }
        if (type !== "up") return;
        const start = d.stroke;
        d.stroke = null;
        d.angle = null;
        if (s.kind === "pour") return K.pour(r, false);
        if (s.kind === "scale") {
          const dx = p.x - start.x, dy = p.y - start.y, col = Math.floor((start.x - 285) / 105), row = Math.floor((start.y - 209) / 62), i = row * 3 + col;
          if (dx >= 44 && Math.abs(dy) < 52 && col >= 0 && col < 3 && row >= 0 && row < 2 && !d.zones[i]) {
            d.zones[i] = true;
            K.spark(r, p.x, p.y);
            K.gain(r, 1 / 6);
          } else if (dx < 0) K.mistake(r, "Raspe da cauda \xE0 cabe\xE7a: da esquerda para a direita.");
        }
        if (s.kind === "cut") {
          const x = K.point(r).x;
          if (Math.abs(start.x - x) < 30 && Math.abs(p.x - x) < 45 && start.y < 275 && p.y - start.y > 65) {
            K.gain(r, 1 / 5, { x, y: 280 });
          } else K.mistake(r, "Siga a linha dourada de cima para baixo.");
        }
        if (s.kind === "fold") {
          const target = K.point(r);
          if (Math.hypot(start.x - target.x, start.y - target.y) < 70 && Math.hypot(p.x - 480, p.y - 275) < 90) {
            d.placed.push(d.placed.length);
            K.gain(r, 1 / 4, target);
          }
        }
        if (["shape", "layer", "plate"].includes(s.kind)) {
          const i = Math.round((start.x - 340) / 140);
          if (i >= 0 && i < 3 && start.y > 365 && Math.hypot(p.x - 480, p.y - 270) < 170) K.place(r, i);
        }
      },
      update(r, dt) {
        const d = r.data;
        if (d.done || r.training && r.ack) return;
        d.t += dt;
        d.animation = Math.max(0, d.animation - dt);
        for (const p of d.particles) {
          p.life -= dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += (p.gravity ?? 130) * dt;
          p.rotation = (p.rotation || 0) + (p.spin || 0) * dt;
        }
        d.particles = d.particles.filter((p) => p.life > 0);
        if (d.phase === "done") {
          if (!r.training) {
            d.transitionLeft = Math.max(0, (d.transitionLeft ?? 0.8) - dt);
            if (d.transitionLeft <= 0) K.advance(r);
          }
          return;
        }
        if (d.phase !== "work") return;
        const s = K.step(r);
        if (s.kind === "pour" && d.pouring) {
          d.fill += dt * 0.22;
          if (d.fill > 0.96) {
            d.pouring = false;
            d.fill = 0;
            K.mistake(r, "A tigela transbordou. Tente parar dentro da faixa verde.");
          }
        }
        if (!heatKinds.has(s.kind)) return;
        const level = P.difficulty(r), drift = r.calm ? 0 : [0.05, 0.075, 0.1][level] + Math.sin(d.t * 0.85) * 0.035;
        d.heat = clamp(d.heat + drift * dt, 0, 1);
        const good = d.heat >= 0.37 && d.heat <= 0.68, hot = d.heat > 0.79, canScorch = s.kind === "fry" || s.kind === "bake";
        if (canScorch) {
          d.scorch ??= 0;
          if (d.scorch >= 1) {
            d.burnHold = Math.max(0, (d.burnHold || 0) - dt);
            if (d.burnHold || !good) return;
            Object.assign(d, { scorch: 0, cooked: 0, progress: 0, flipped: false, animation: 0, overheat: 0 });
            P.feedback("Nova por\xE7\xE3o na " + (s.kind === "bake" ? "assadeira" : "panela") + ". Mantenha o calor na faixa verde.");
            return;
          }
          if (hot) {
            d.overheat += dt;
            d.scorch = Math.min(1, d.scorch + dt * (0.16 + (d.heat - 0.79) * 1.5));
            if (d.scorch >= 1) {
              d.burnHold = 0.85;
              d.warningUntil = 0;
              K.mistake(r, "A por\xE7\xE3o queimou. Volte \xE0 faixa verde para come\xE7ar uma nova.");
              return;
            }
            if (d.overheat - dt < 0.65 && d.overheat >= 0.65) K.mistake(r, "Est\xE1 escurecendo r\xE1pido. Abaixe o calor.");
          } else {
            d.overheat = 0;
            d.scorch = Math.max(0, d.scorch - dt * (good ? 0.16 : 0.055));
          }
        } else {
          d.overheat = d.heat > 0.85 ? d.overheat + dt : 0;
          if (d.overheat > 1.5) {
            d.overheat = 0;
            d.cooked = Math.max(0, d.cooked - 0.15);
            K.mistake(r, "Fogo alto demais. Abaixe para a faixa verde e continue.");
          }
        }
        if (good) d.cooked += dt / (r.training ? 3.5 : r.calm ? 6 : 7 + level);
        if (s.kind === "fry" && !d.flipped) d.cooked = Math.min(d.cooked, 0.6);
        if (canScorch && d.scorch > 0.28) d.cooked = Math.min(d.cooked, 0.99);
        d.progress = clamp(d.cooked, 0, 1);
        if (d.cooked >= 1) K.complete(r);
      },
      hint(r) {
        P.feedback(instruction(K.step(r).kind));
      },
      spot(r) {
        if (heatKinds.has(K.step(r).kind)) return { x: 480, y: 428, w: 410, h: 78 };
        const p = K.point(r);
        return { x: p.x, y: p.y, w: K.step(r).kind === "scale" ? 130 : K.step(r).kind === "cut" ? 78 : 330, h: K.step(r).kind === "cut" ? 240 : 190 };
      },
      draw(c, r) {
        const d = r.data, s = K.step(r), recipe = K.recipe(r), time = V.settings.reducedMotion ? 0 : d.t;
        c.fillStyle = "#294a3d";
        c.fillRect(0, 0, 960, 540);
        const cover = A.images.cover;
        if (cover?.naturalWidth) {
          c.globalAlpha = 0.2;
          c.drawImage(cover, 0, 0, 960, 540);
          c.globalAlpha = 1;
        }
        P.box(c, 190, 82, 580, 386, "#be9864", "#f2dbad");
        for (let y = 98; y < 460; y += 42) {
          P.box(c, 202, y, 556, 2, "#a67d4b");
        }
        P.box(c, 224, 122, 512, 282, "#e0bb82", "#745634");
        P.text(c, r.training ? "OFICINA COM PIX" : recipe.name.toUpperCase(), 480, 37, 25, "#fff0c8");
        P.text(c, "ETAPA " + ((r.training ? r.step : d.step) + 1) + " \xB7 " + s.title, 480, 67, 15, "#d9e4c4");
        A.stage(c, s, d.progress, 280, 148, 400, 234);
        if (["stir", "grind", "wash"].includes(s.kind) && d.phase === "work") {
          c.strokeStyle = "#f6d98bb8";
          c.lineWidth = 3;
          c.setLineDash([8, 8]);
          c.beginPath();
          c.ellipse(480, 270, 135, 95, 0, 0, Math.PI * 2);
          c.stroke();
          c.setLineDash([]);
          P.text(c, "\u21BB", 480, 150, 30, "#214a3b");
        }
        if (s.kind === "scale" && d.phase === "work" && V.CookingWorkshop) V.CookingWorkshop.drawFishMarks(c, r);
        if (s.kind === "scale" && d.phase === "work" && !V.CookingWorkshop) {
          for (let i = 0; i < 6; i++) {
            c.strokeStyle = d.zones[i] ? "#92d8ad" : "#f2d18d";
            c.lineWidth = d.zones[i] ? 1 : 3;
            c.strokeRect(285 + i % 3 * 105, 209 + Math.floor(i / 3) * 62, 100, 58);
          }
          const point = K.point(r);
          P.text(c, "\u2192", point.x + 16, point.y, 29, "#20493c");
          P.text(c, "CAUDA \u2192 CABE\xC7A", 480, 381, 14, "#234a3a");
        }
        if (s.kind === "cut" && d.phase === "work") {
          const x = K.point(r).x;
          c.strokeStyle = "#fff2ac";
          c.lineWidth = 5;
          c.setLineDash([8, 6]);
          c.beginPath();
          c.moveTo(x, 175);
          c.lineTo(x, 354);
          c.stroke();
          c.setLineDash([]);
          P.text(c, "\u2193", x, 165, 27, "#254a3a");
        }
        if (s.kind === "fold" && d.phase === "work") {
          const p = K.point(r);
          c.strokeStyle = "#edcf84";
          c.lineWidth = 4;
          c.beginPath();
          c.arc(p.x, p.y, 29, 0, Math.PI * 2);
          c.stroke();
          c.beginPath();
          c.moveTo(p.x, p.y);
          c.lineTo(480, 275);
          c.stroke();
          for (let i = 0; i < d.placed.length && !V.CookingWorkshop; i++) {
            c.fillStyle = "#305b36b8";
            c.beginPath();
            c.moveTo(480, 275);
            c.lineTo(280 + i % 2 * 400, 175);
            c.lineTo(280 + i % 2 * 400, 370);
            c.closePath();
            c.fill();
          }
        }
        if (s.kind === "season" && d.phase === "work") {
          for (const [i, p] of [{ x: 365, y: 260 }, { x: 480, y: 225 }, { x: 595, y: 280 }].entries()) {
            c.strokeStyle = d.placed.includes(i) ? "#94daa5" : "#f9e198";
            c.lineWidth = 4;
            c.beginPath();
            c.arc(p.x, p.y, 25, 0, Math.PI * 2);
            c.stroke();
            P.text(c, String(i + 1), p.x, p.y, 15, "#204e3d");
          }
        }
        if (["shape", "layer"].includes(s.kind) && d.phase === "work" && V.CookingWorkshop) V.CookingWorkshop.drawMaterials(c, r);
        if (["shape", "layer", "plate"].includes(s.kind) && d.phase === "work" && !V.CookingWorkshop) {
          for (let i = 0; i < 3; i++) {
            P.box(c, 302 + i * 140, 383, 76, 52, d.placed.includes(i) ? "#678869" : i === d.selected ? "#f3d692" : "#d7ba85", "#3d6045");
            if (!d.placed.includes(i)) {
              A.stage(c, s, 0, 310 + i * 140, 383, 60, 46);
              P.text(c, String(i + 1), 340 + i * 140, 449, 13, "#254936");
            }
          }
        }
        if (s.kind === "pour") {
          P.box(c, 300, 415, 360, 31, "#254e42", "#d5d9ab");
          P.box(c, 300 + 360 * 0.55, 416, 360 * 0.21, 29, "#88b998");
          P.box(c, 300, 435, 360 * clamp(d.fill, 0, 1), 10, "#83ccd6");
          P.text(c, "PARE NA FAIXA VERDE", 480, 464, 13, "#234c3c");
          if (d.pouring && !V.CookingWorkshop) {
            c.strokeStyle = "#acdce4";
            c.lineWidth = 8;
            c.beginPath();
            c.moveTo(555, 130);
            c.lineTo(505, 215);
            c.stroke();
          }
        }
        if (heatKinds.has(s.kind)) {
          P.box(c, 293, 415, 374, 30, "#213e36", "#efd9a1");
          P.box(c, 293 + 374 * 0.37, 416, 374 * 0.31, 28, "#89b18a");
          P.box(c, 293 + 374 * d.heat - 3, 409, 6, 41, "#fff0ad");
          P.text(c, s.kind === "bake" ? "\u2212 CALOR                       CALOR +" : s.kind === "steam" ? "\u2212 VAPOR                       VAPOR +" : "\u2212 FOGO                         FOGO +", 480, 464, 13, "#284b39");
          if (!V.CookingWorkshop && !V.settings.reducedMotion && d.phase === "work") {
            for (let i = 0; i < 5; i++) {
              const x = 400 + i * 42 + Math.sin(time * 2 + i) * 8, y = 170 - (time * 25 + i * 15) % 70;
              c.strokeStyle = "#f6edce88";
              c.lineWidth = 5;
              c.beginPath();
              c.moveTo(x, y + 22);
              c.quadraticCurveTo(x - 10, y + 9, x, y);
              c.stroke();
            }
            for (let i = 0; i < 7; i++) {
              c.strokeStyle = "#f7deb0";
              c.lineWidth = 2;
              c.beginPath();
              c.arc(395 + i * 27, 265 + Math.sin(time * 5 + i) * 20, 3 + Math.sin(time * 3 + i) * 2, 0, Math.PI * 2);
              c.stroke();
            }
          }
          if (s.kind === "fry" && d.cooked >= 0.43 && !d.flipped && !(d.scorch >= 1)) {
            P.box(c, 365, 371, 230, 29, "#245441", "#f3d187");
            P.text(c, "VIRAR \xB7 " + (V.DuoChallenges.isChild && +new URLSearchParams(location.search).get("player") === 1 ? "ENTER" : "E") + " / TOQUE", 480, 385, 15, "#fff0be");
          }
        }
        const tool = d.tool;
        if (d.phase === "work" && (d.stroke || d.animation > 0) && !heatKinds.has(s.kind)) {
          c.save();
          c.translate(tool.x, tool.y);
          const rotate = ["stir", "grind", "wash"].includes(s.kind) ? Math.atan2(tool.y - 270, tool.x - 480) : -0.3;
          c.rotate(rotate);
          P.box(c, -6, -12, 12, 65, "#875d32", "#2c3e30");
          if (s.kind === "cut" || s.kind === "scale") {
            P.box(c, -6, -44, 36, 35, "#d5ddd0", "#324e43");
            P.box(c, 20, -43, 8, 33, "#f8ead0");
          } else {
            c.fillStyle = s.kind === "wash" ? "#99ccdc" : "#cfab6c";
            c.beginPath();
            c.ellipse(0, -20, 16, 24, 0, 0, Math.PI * 2);
            c.fill();
          }
          c.restore();
        }
        if (V.CookingWorkshop) V.CookingWorkshop.drawEffects(c, r);
        else {
          for (const p of d.particles) {
            c.fillStyle = p.color;
            c.globalAlpha = p.life / 0.65;
            c.fillRect(p.x, p.y, 5, 3);
          }
          c.globalAlpha = 1;
        }
        const progress = s.kind === "pour" ? d.fill : d.progress;
        P.box(c, 240, 486, 480, 13, "#2c4b3e");
        P.box(c, 240, 486, 480 * clamp(progress, 0, 1), 13, d.phase === "done" ? "#a6d3a7" : "#e4bf72");
        P.text(c, d.phase === "done" ? "\u2713 ETAPA PRONTA \xB7 PREPARANDO A PR\xD3XIMA" : d.scorch >= 1 ? "QUEIMOU \xB7 VOLTE \xC0 FAIXA VERDE" : Math.round(progress * 100) + "% \xB7 " + (s.kind === "pour" ? d.pouring ? "despejando" : "medindo" : s.kind === "fry" ? d.flipped ? "outro lado" : "primeiro lado" : "preparando"), 480, 518, 14, "#f9e5ba");
      }
    };
    const result = P.result.bind(P);
    P.result = function(r) {
      const out = result(r);
      if (r.game === ID) {
        const recipe = K.recipe(r), box = V.$(".pg-result");
        V.$(".modal h2").textContent = "Prato pronto \xB7 " + recipe.name;
        if (box) {
          box.insertAdjacentHTML("afterbegin", A.dish(recipe.output, 150));
          const line = document.createElement("p");
          line.textContent = recipe.region + " \xB7 " + r.data.results.length + " etapas preparadas.";
          box.append(line);
        }
      }
      return out;
    };
    const make = P.make.bind(P);
    P.make = function(id, key, context = {}) {
      const r = make(id, key, context);
      if (id === ID) r.data = ctrl.create(false, context.stage || 0);
      return r;
    };
    const attach = P.attach.bind(P);
    P.attach = function(r) {
      if (r.game === ID) {
        if (/antes.*depois/i.test(r.feedback || "")) r.feedback = "Etapa conclu\xEDda. Continue para a pr\xF3xima etapa.";
        if (r.arcade) {
          const stage = (r.arcade.start + r.arcade.leg) % D.recipes.length;
          if (r.data.stage !== stage || r.data.done) r.data = ctrl.create(false, stage);
        }
        A.ensure();
      }
      const result2 = attach(r);
      if (r.game === ID) {
        const root = V.$("#playground-root");
        root?.classList.add("cooking-playing");
        const badge = root?.querySelector(".pg-top>img");
        if (badge) badge.src = "assets/ui/interface/care-meat.svg";
        if (r.training && r.data.phase !== "work" && !r.ack) K.reset(r);
      }
      return result2;
    };
    const detail = V.ChallengeCatalog.detail.bind(V.ChallengeCatalog);
    V.ChallengeCatalog.detail = function(key) {
      const out = detail(key);
      if (key !== "play:" + ID) return out;
      const select = V.$("#challenge-level"), rename = () => {
        for (const option of select?.options || []) option.textContent = +option.value + 1 + " \xB7 " + D.recipes[+option.value].name;
      };
      rename();
      V.$("details.challenge-options")?.setAttribute("open", "");
      V.$("label#challenge-level-field")?.firstChild?.replaceWith("Receita ");
      V.$$('input[name="challenge-mode"]').forEach((input) => {
        input.addEventListener("change", rename);
        if (["free", "circuit"].includes(input.value)) input.closest("label").hidden = true;
      });
      const art2 = V.$(".challenge-detail-art");
      if (art2) art2.innerHTML = '<img class="challenge-cover" src="assets/cooking/cover.webp" alt="Bancada da Cozinha dos Saberes">';
      const note = V.$("#challenge-mode-note");
      if (note) note.textContent = "A oficina fornece os ingredientes. Conclua todas as etapas para ganhar o prato. No treino n\xE3o h\xE1 recompensas.";
      return out;
    };
    const art = V.ChallengeCatalog.art.bind(V.ChallengeCatalog);
    V.ChallengeCatalog.art = function(g, large) {
      return g.id === ID ? '<img class="challenge-cover" src="assets/cooking/cover.webp" alt="" loading="lazy">' : art(g, large);
    };
    const items = V.ChallengeCatalog.items.bind(V.ChallengeCatalog);
    V.ChallengeCatalog.items = function() {
      return items().map((g) => g.id === ID ? { ...g, group: "workshops" } : g);
    };
    const controls = V.DuoChallenges.controls.bind(V.DuoChallenges);
    V.DuoChallenges.controls = function(game, i) {
      if (game === ID) return (i ? "Setas" : "WASD") + " para os gestos e o fogo \xB7 " + (i ? "Enter" : "E") + " confirma / vira / despeja \xB7 mouse ou toque segue os gestos na sua bancada.";
      return controls(game, i);
    };
  })();
});
