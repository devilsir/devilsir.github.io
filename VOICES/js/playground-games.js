/* Registered module: playground-games */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("playground-games", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function playgroundGames() {
    "use strict";
    const V = window.V, P = V.Playground, D = V.PlaygroundData, C = P.controllers, clamp = V.clamp;
    const roomPoint = ([x, y]) => ({ x: 345 + x * 76, y: 232 + y * 57 });
    const tilePoint = ({ x, y }) => ({ x: 90 + x * 60, y: 197 + y * 38 });
    function prop(c, id, x, y, size = 64) {
      const item = V.Homestead.catalog.find((i) => i.id === id);
      if (item) V.Cozy.prop(c, item.family, item.prop, x - size / 2, y - size + 12, size);
    }
    function line(c, points, color, width = 3) {
      c.strokeStyle = color;
      c.lineWidth = width;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.beginPath();
      points.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y));
      c.stroke();
    }
    function marker(c, x, y, label, color = "#f5cf78") {
      P.box(c, x - 20, y - 15, 40, 30, "#203f38", color);
      P.text(c, label, x, y, 15, color);
    }
    function rng(n) {
      let t = n * 1664525 + 1013904223 >>> 0;
      return t / 4294967296;
    }
    function currentWord(r) {
      return D.words[(r.training ? 0 : r.data.round) % D.words.length];
    }
    function runnerChoices(r) {
      const w = currentWord(r), right = r.training ? 2 : (r.data.round * 2 + Math.floor(r.data.round / 3)) % 3, a = [...w.wrong];
      a.splice(right, 0, w.en);
      return { words: a, right };
    }
    C.runner = {
      create() {
        return { lane: 1, x: 480, round: 0, z: 0, wait: 0, shield: 3 };
      },
      model(r) {
        return { request: "Encontre: " + currentWord(r).pt, support: "Corra at\xE9 a palavra em ingl\xEAs. A coleta acontece ao atravessar o portal.", progress: r.data.round, total: r.training ? 1 : 12, hint: "\u2190 \u2192 / A D para trocar de faixa. N\xE3o precisa confirmar." };
      },
      hud(r) {
        const host = V.$("#pg-lanes");
        host.hidden = false;
        if (!host.childElementCount) host.innerHTML = "<span></span><span></span><span></span>";
        const choices = runnerChoices(r);
        [...host.children].forEach((el, i) => {
          el.textContent = i + 1 + " \xB7 " + choices.words[i];
          el.classList.toggle("selected", r.data.lane === i);
        });
      },
      action(r, name) {
        const d = r.data;
        if (name === "left") d.lane = clamp(d.lane - 1, 0, 2);
        else if (name === "right") d.lane = clamp(d.lane + 1, 0, 2);
        else return;
        r.moves++;
        if (d.lane === 0) P.event("lane-left");
        if (d.lane === 1) P.event("lane-middle");
      },
      update(r, dt) {
        const d = r.data, target = [260, 480, 700][d.lane];
        d.x += (target - d.x) * Math.min(1, dt * 16);
        if (r.training && r.step < 2) return;
        if (d.wait > 0) {
          d.wait -= dt;
          return;
        }
        d.z += dt / (r.calm ? 5.5 : 3.7);
        const pick = runnerChoices(r);
        if ((r.training || r.calm) && d.z > 0.93 && d.lane !== pick.right) d.z = 0.93;
        if (d.z >= 1) {
          if (d.lane === pick.right) {
            P.hit();
            P.feedback("\u2713 " + currentWord(r).en + " = " + currentWord(r).pt);
            if (!r.training) V.PixCollection.collect(currentWord(r).en, "Corrida das Palavras");
            d.round++;
            d.z = 0;
            d.wait = 0.65;
            if (r.training) P.event("runner-hit");
            else if (d.round >= 12) P.finish();
          } else {
            d.shield = Math.max(0, d.shield - 1);
            P.feedback("O portal levou a outra palavra. " + currentWord(r).en + " significa " + currentWord(r).pt + ". Tente esta passagem de novo.", true);
            d.z = 0;
            d.wait = 1.4;
          }
        }
      },
      hint(r) {
        const p = runnerChoices(r);
        P.feedback("Para " + currentWord(r).pt + ", corra at\xE9 " + currentWord(r).en + " na faixa " + (p.right + 1) + ".");
      },
      spot(r) {
        return r.step === 2 ? { x: 700, y: 310, w: 190, h: 260 } : { x: r.step === 0 ? 260 : 480, y: 415, w: 150, h: 120 };
      },
      draw(c, r) {
        const d = r.data;
        P.box(c, 0, 0, 960, 540, "#7daba3");
        P.box(c, 0, 145, 960, 395, "#8ca477");
        P.box(c, 0, 145, 960, 22, "#e4c58f");
        for (let i = 0; i < 6; i++) {
          const x = 20 + i * 180;
          P.house(c, x, 134, 92, 56, "", i % 2 ? "#d6b489" : "#a5bfaf");
        }
        const horizon = 180, bottom = 494;
        c.fillStyle = "#4b645a";
        c.beginPath();
        c.moveTo(386, horizon);
        c.lineTo(574, horizon);
        c.lineTo(890, bottom);
        c.lineTo(70, bottom);
        c.closePath();
        c.fill();
        for (let i = 0; i < 4; i++) {
          const x = 386 + i * 188 / 3, bx = 70 + i * 820 / 3;
          line(c, [{ x, y: horizon }, { x: bx, y: bottom }], "#bfc7a4", i === 0 || i === 3 ? 5 : 2);
        }
        for (let n = 0; n < 12; n++) {
          const t = ((n / 12 + (V.settings.reducedMotion ? 0 : r.elapsed * 0.3)) % 1) ** 2, y2 = horizon + t * (bottom - horizon), width = 130 + t * 570;
          line(c, [{ x: 480 - width / 2, y: y2 }, { x: 480 + width / 2, y: y2 }], "#e2d8b039", 2);
        }
        const z = 0.1 + d.z * 0.9, y = horizon + z * z * 235, spread = 75 + z * 145, scale = 0.32 + z * 0.68, choice = runnerChoices(r);
        choice.words.forEach((word, i) => {
          const x = 480 + (i - 1) * spread, w = 196 * scale, h = 60 * scale;
          P.box(c, x - w / 2, y - h, w, h, i === choice.right && r.training ? "#eec97e" : "#e5dfc3", "#38574b");
          P.text(c, word, x, y - h / 2, Math.max(14, 23 * scale), "#183d33");
          line(c, [{ x: x - w / 2, y }, { x: x - w / 2, y: y + 28 * scale }, { x: x + w / 2, y: y + 28 * scale }, { x: x + w / 2, y }], "#cba972", 4);
        });
        line(c, [{ x: 135, y: 441 }, { x: 825, y: 441 }], "#f2d18e", 3);
        P.person(c, d.x, 459, true, 3, 76);
        for (let i = 0; i < 3; i++) {
          c.fillStyle = i < d.shield ? "#efd087" : "#5b7666";
          c.beginPath();
          c.arc(852 + i * 23, 192, 7, 0, Math.PI * 2);
          c.fill();
        }
        P.text(c, "FAIXA 1", 260, 486, 12);
        P.text(c, "FAIXA 2", 480, 486, 12);
        P.text(c, "FAIXA 3", 700, 486, 12);
      }
    };
    // Small walkable neighbourhood shared by the delivery and gardening games.
    const blocked = (x, y) => x === 5 && y >= 2 && y <= 4 || x === 9 && y >= 2 && y <= 3;
    function path(from, to) {
      const start = { x: Math.round(from.x), y: Math.round(from.y) }, goal = { x: clamp(Math.round(to.x), 0, 13), y: clamp(Math.round(to.y), 0, 6) }, key = (p) => p.x + "," + p.y, q = [start], seen = new Map([[key(start), null]]);
      for (let i = 0; i < q.length; i++) {
        const p = q[i];
        if (key(p) === key(goal)) {
          const out = [];
          let n = p;
          while (n && key(n) !== key(start)) {
            out.unshift(n);
            n = seen.get(key(n));
          }
          return out;
        }
        for (const [x, y] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const n = { x: p.x + x, y: p.y + y };
          if (n.x < 0 || n.x > 13 || n.y < 0 || n.y > 6 || blocked(n.x, n.y) || seen.has(key(n))) continue;
          seen.set(key(n), p);
          q.push(n);
        }
      }
      return [];
    }
    function route(r, p) {
      const d = r.data;
      d.route = path(d.player, p);
      d.walked = true;
    }
    function move(r, dt) {
      const d = r.data, p = d.player, axis = V.Input.axis(), dx = axis.x + P.held.x, dy = axis.y + P.held.y;
      let vx = dx, vy = dy;
      if (Math.abs(dx) + Math.abs(dy) > 0.05) d.route = [];
      else if (d.route?.length) {
        const t = d.route[0], dist = Math.hypot(t.x - p.x, t.y - p.y);
        if (dist < 0.06) {
          p.x = t.x;
          p.y = t.y;
          d.route.shift();
        } else {
          vx = (t.x - p.x) / dist;
          vy = (t.y - p.y) / dist;
        }
      }
      const len = Math.hypot(vx, vy);
      d.walking = len > 0.05;
      if (d.walking) {
        vx /= Math.max(1, len);
        vy /= Math.max(1, len);
        const speed = 3.3, xx = clamp(p.x + vx * speed * dt, 0, 13), yy = clamp(p.y + vy * speed * dt, 0, 6);
        if (!blocked(Math.round(xx), Math.round(p.y))) p.x = xx;
        if (!blocked(Math.round(p.x), Math.round(yy))) p.y = yy;
        p.dir = Math.abs(vx) > Math.abs(vy) ? vx > 0 ? 2 : 1 : vy > 0 ? 0 : 3;
        d.distance = (d.distance || 0) + speed * dt;
        if (r.game === "courier" && d.distance > 0.3) P.event("courier-walk");
      }
      return d.walking;
    }
    function nearby(r, places) {
      return Object.entries(places).map(([id, p]) => ({ id, ...p, dist: Math.hypot(r.data.player.x - p.x, r.data.player.y - p.y) })).sort((a, b) => a.dist - b.dist)[0];
    }
    function mapPointer(r, type, p) {
      if (type !== "down") return;
      route(r, { x: (p.x - 90) / 60, y: (p.y - 197) / 38 });
      r.moves++;
    }
    function mapBase(c, r, places, drawPlayer = true) {
      P.box(c, 0, 0, 960, 540, "#a2b98d");
      P.box(c, 55, 167, 850, 300, "#c9c5a2");
      for (let y = 0; y < 7; y++) for (let x = 0; x < 14; x++) {
        const p = tilePoint({ x, y });
        P.box(c, p.x - 28, p.y - 17, 56, 34, (x + y) % 2 ? "#d5ccad" : "#dacfaf");
        if (blocked(x, y)) {
          P.box(c, p.x - 29, p.y - 18, 58, 36, "#90a477");
          prop(c, "plant", p.x, p.y + 7, 42);
        }
      }
      for (const p of Object.values(places)) {
        const t2 = tilePoint(p);
        P.house(c, t2.x - 42, t2.y - 40, 84, 48, p.pt, p.color || "#a3b3a0");
        marker(c, t2.x, t2.y + 22, p.name === "library" ? "E" : "\u2193", "#e9ce8d");
      }
      if (r.data.route?.length) {
        const points = [tilePoint(r.data.player), ...r.data.route.map(tilePoint)];
        line(c, points, "#b2894f", 3);
        for (const p of points.slice(1)) {
          c.fillStyle = "#aa854d";
          c.beginPath();
          c.arc(p.x, p.y + 5, 3, 0, Math.PI * 2);
          c.fill();
        }
      }
      const t = tilePoint(r.data.player);
      if (drawPlayer) P.person(c, t.x, t.y + 10, r.data.walking, r.data.player.dir, 54);
    }
    function waypoints(r, places) {
      const host = V.$("#pg-waypoints");
      host.hidden = false;
      if (host.childElementCount) return;
      for (const [id, p] of Object.entries(places)) {
        const b = P.button("pg-route-" + id, p.pt, () => {
          route(r, p);
          P.feedback("Rota marcada at\xE9 " + p.pt + ". Use a a\xE7\xE3o ao chegar.");
        });
        b.title = "Caminhar at\xE9 " + p.pt;
        host.append(b);
      }
    }
    const delivery = (r) => D.deliveries[r.data.stage % D.deliveries.length];
    C.courier = {
      create() {
        return { stage: 0, player: { x: 3, y: 5, dir: 1 }, route: [], cargo: null, cargoOpen: false, distance: 0 };
      },
      model(r) {
        const d = r.data, t = delivery(r), near = nearby(r, D.places);
        return { request: "Take the " + t.item + " to the " + D.places[t.to].name + ".", support: t.pt + (d.cargo ? " \xB7 Mochila: " + d.cargo : " \xB7 Retire na livraria"), progress: d.stage, total: r.training ? 1 : 5, action: near.dist < 1.35 ? near.id === "library" ? "Retirar encomenda \xB7 E" : "Entregar encomenda \xB7 E" : "Chegue perto de uma entrada", disabled: near.dist >= 1.35, hint: d.cargo ? "Leve a encomenda at\xE9 " + D.places[t.to].pt + "." : "A livraria \xE9 o ponto de partida de cada entrega." };
      },
      hud(r) {
        waypoints(r, D.places);
        const host = V.$("#pg-cargo");
        host.hidden = !r.data.cargoOpen;
        if (!r.data.cargoOpen) {
          host.replaceChildren();
          return;
        }
        if (host.childElementCount) return;
        for (const word of ["book", "letter", "parcel"]) host.append(P.button("pg-cargo-" + word, word, () => this.action(r, "cargo", word), word === "book" ? "primary" : "secondary"));
      },
      action(r, name, arg) {
        const d = r.data;
        if (name === "cargo") {
          d.cargo = arg;
          d.cargoOpen = false;
          r.moves++;
          P.feedback("Voc\xEA est\xE1 levando " + arg + ". V\xE1 ao destino do pedido.");
          if (arg === "book") P.event("cargo-book");
          return;
        }
        if (name !== "use") return;
        const near = nearby(r, D.places);
        if (near.dist >= 1.35) return;
        r.moves++;
        if (near.id === "library") {
          d.cargoOpen = true;
          P.event("cargo-open");
          P.hud();
          return;
        }
        const t = delivery(r);
        if (!d.cargo) return P.feedback("Retire uma encomenda na livraria antes de entregar.");
        if (near.id !== t.to) return P.feedback("Este \xE9 " + near.pt + ". O pedido vai para " + D.places[t.to].pt + ".", true);
        if (d.cargo !== t.item) return P.feedback("O destino est\xE1 certo, mas ele espera " + t.item + ". Troque sua caixa na livraria.", true);
        d.cargo = null;
        d.stage++;
        P.hit(180);
        P.feedback("\u2713 Entrega conclu\xEDda em " + near.pt + "!" + (d.stage < 5 ? " Retire o pr\xF3ximo pedido na livraria." : ""));
        if (r.training) P.event("delivery");
        else if (d.stage >= 5) P.finish();
      },
      update: move,
      pointer: mapPointer,
      guideStep(r) {
        if (r.step === 1) {
          r.data.route = [];
          route(r, D.places.library);
        }
      },
      hint(r) {
        const t = r.data.cargo ? D.places[delivery(r).to] : D.places.library;
        route(r, t);
        P.feedback("Pegadas at\xE9 " + t.pt + ". Caminhe at\xE9 l\xE1 e use o bot\xE3o de a\xE7\xE3o.");
      },
      spot(r) {
        const t = tilePoint(r.data.cargo ? D.places[delivery(r).to] : D.places.library);
        return { x: t.x, y: t.y, w: 140, h: 115 };
      },
      draw(c, r) {
        mapBase(c, r, D.places);
        const t = tilePoint(r.data.cargo ? D.places[delivery(r).to] : D.places.library);
        marker(c, t.x, t.y - 78, "\u2605");
        if (r.data.cargo) {
          const p = tilePoint(r.data.player);
          P.box(c, p.x + 15, p.y - 34, 21, 19, "#d6b279", "#5b4c3a");
          P.text(c, r.data.cargo === "book" ? "B" : r.data.cargo === "letter" ? "L" : "P", p.x + 26, p.y - 24, 12, "#283e32");
        }
        P.text(c, "LIVRARIA \u2192 BAIRRO \u2192 LIVRARIA", 480, 474, 13, "#35513c");
      }
    };
    // Labels are placed after the furniture, outside occupied sprite areas.
    let roomLabels = [], roomObstacles = [];
    function roomLabel(c, text, p, obstacle) {
      roomLabels.push({ text, x: p.x, y: p.y });
      roomObstacles.push(obstacle || { x: p.x - 36, y: p.y - 66, w: 72, h: 78 });
    }
    function drawRoomLabels(c) {
      const overlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      const placed = [];
      c.save();
      c.font = "600 13px system-ui,sans-serif";
      for (const label of roomLabels) {
        const w = Math.ceil(c.measureText(label.text).width) + 12, h = 22;
        const candidates = [[0, 28], [64, 22], [-64, 22], [72, -24], [-72, -24], [0, -82], [0, 51], [105, 12], [-105, 12]].map(([dx, dy]) => ({ x: clamp(label.x + dx - w / 2, 280, 768 - w), y: clamp(label.y + dy - h / 2, 186, 446 - h), w, h }));
        const score = (box2) => roomObstacles.reduce((n, o) => n + overlap(box2, o), 0) + placed.reduce((n, o) => n + overlap(box2, o) * 3, 0);
        candidates.sort((a, b) => score(a) - score(b));
        const box = candidates[0];
        placed.push(box);
        P.box(c, box.x, box.y, w, h, "#f6e6c6", "#69806a");
        P.text(c, label.text, box.x + w / 2, box.y + h / 2, 13, "#28463b");
      }
      c.restore();
    }
    function roomRound(r) {
      return D.roomRounds[r.data.round % D.roomRounds.length];
    }
    function reference(c, round, p, second = false) {
      if (round.ref === "window") {
        P.box(c, p.x - 30, 166, 60, 48, "#486f73", "#f1d7a8");
        line(c, [{ x: p.x, y: 166 }, { x: p.x, y: 214 }], "#f1d7a8", 4);
        line(c, [{ x: p.x - 30, y: 190 }, { x: p.x + 30, y: 190 }], "#f1d7a8", 4);
      } else prop(c, round.ref.startsWith("sofa") ? "sofa-clay" : "table-round", p.x, p.y, 80);
      roomLabel(c, round.ref, p, round.ref === "window" ? { x: p.x - 32, y: 164, w: 64, h: 52 } : null);
    }
    function roomItem(c, r) {
      const d = r.data, s = roomRound(r), p = roomPoint(d.pos);
      if (s.item === "book") {
        const yy = s.relation === "on" && d.pos[0] === s.at[0] && d.pos[1] === s.at[1] ? p.y - 30 : p.y - 10;
        P.box(c, p.x - 16, yy - 12, 32, 19, "#a34f42", "#efe2c0");
        line(c, [{ x: p.x - 13, y: yy - 8 }, { x: p.x + 10, y: yy - 8 }], "#ead8af", 2);
      } else if (s.item === "picture") {
        P.box(c, p.x - 25, p.y - 43, 50, 32, "#75523d", "#e6c685");
        P.box(c, p.x - 18, p.y - 36, 36, 18, "#9ab098");
        c.fillStyle = "#e5c784";
        c.beginPath();
        c.arc(p.x + 9, p.y - 31, 4, 0, Math.PI * 2);
        c.fill();
      } else prop(c, s.item === "chair" ? "chair" : s.item, p.x, p.y, 70);
      if (d.picked) {
        c.strokeStyle = "#3b7764";
        c.lineWidth = 3;
        c.strokeRect(p.x - 34, p.y - 47, 68, 64);
      }
      roomLabel(c, s.name, p);
    }
    C.room = {
      create() {
        return { round: 0, pos: [0, 3], picked: false, hint: false };
      },
      model(r) {
        const s = roomRound(r);
        return { request: "Put the " + s.name + " " + s.relation + " the " + s.ref + ".", support: s.name + " = " + s.pt + " \xB7 " + s.relation + " = " + s.meaning + " \xB7 " + s.ref + " = " + s.refPt, progress: r.data.round, total: r.training ? 1 : 8, action: r.data.picked ? "Colocar objeto \xB7 E" : "Pegar objeto \xB7 E", hint: "Voc\xEA olha a sala a partir da entrada: o fundo fica na parte de cima." };
      },
      action(r, name, arg) {
        const d = r.data;
        if (name === "move" && d.picked) {
          d.pos = [clamp(d.pos[0] + arg[0], 0, 5), clamp(d.pos[1] + arg[1], 0, 3)];
          r.moves++;
          if (roomRound(r).goals.some((g) => g[0] === d.pos[0] && g[1] === d.pos[1])) P.event("room-move");
        } else if (name === "use") {
          if (!d.picked) {
            d.picked = true;
            r.moves++;
            P.event("room-pick");
          } else this.place(r);
        }
      },
      place(r) {
        const d = r.data, s = roomRound(r);
        if (!s.goals.some((g) => g[0] === d.pos[0] && g[1] === d.pos[1])) return P.feedback("Mova mais um pouco: " + s.relation + " quer dizer " + s.meaning + ". O pedido usa " + s.refPt + " como refer\xEAncia.", true);
        P.hit(140);
        P.feedback("\u2713 " + s.relation + " \u2014 " + s.meaning);
        d.picked = false;
        d.round++;
        if (r.training) {
          d.round = 0;
          P.event("room-place");
          return;
        }
        if (d.round >= 8) {
          P.finish();
          return;
        }
        d.pos = [...roomRound(r).start];
        d.hint = false;
        r.feedback = "\u2713 Pe\xE7a colocada. Veja o novo pedido na parte de cima.";
      },
      pointer(r, type, p) {
        const d = r.data, t = [clamp(Math.round((p.x - 345) / 76), 0, 5), clamp(Math.round((p.y - 232) / 57), 0, 3)];
        if (type === "down") {
          const at = roomPoint(d.pos);
          if (Math.hypot(p.x - at.x, p.y - at.y) < 65 || d.picked) {
            if (!d.picked) this.action(r, "use");
            d.dragging = true;
          }
        }
        if (type === "move" && d.dragging) {
          if (t[0] !== d.pos[0] || t[1] !== d.pos[1]) {
            d.pos = t;
            r.moves++;
            if (roomRound(r).goals.some((g) => g[0] === d.pos[0] && g[1] === d.pos[1])) P.event("room-move");
          }
        }
        if (type === "up") {
          d.dragging = false;
          if (d.picked && (!r.training || r.step === 2) && !r.ack) this.place(r);
        }
      },
      hint(r) {
        r.data.hint = true;
        P.feedback("Os espa\xE7os verdes satisfazem " + roomRound(r).relation + ". Posicione o objeto num deles.");
      },
      spot(r) {
        const s = roomRound(r), p = roomPoint(r.step === 0 ? r.data.pos : s.goals[0]);
        return { x: p.x, y: p.y - 10, w: 150, h: 140 };
      },
      draw(c, r) {
        roomLabels = [];
        roomObstacles = [{ x: 287, y: 420, w: 52, h: 31 }];
        const d = r.data, s = roomRound(r);
        P.box(c, 0, 0, 960, 540, "#b7c5aa");
        P.box(c, 277, 161, 493, 61, "#e4ccb0");
        P.box(c, 277, 222, 493, 220, "#c49e77");
        P.box(c, 270, 155, 8, 294, "#64745c");
        P.box(c, 770, 155, 8, 294, "#64745c");
        for (let y = 0; y < 4; y++) for (let x = 0; x < 6; x++) {
          const p = roomPoint([x, y]);
          P.box(c, p.x - 36, p.y - 25, 72, 53, (x + y) % 2 ? "#d9bc95" : "#dfc59f", "#b69a73");
          if (d.hint && s.goals.some((g) => g[0] === x && g[1] === y)) {
            P.box(c, p.x - 34, p.y - 23, 68, 49, "#a6c89b", "#41735c");
          }
        }
        P.text(c, "FUNDO DA SALA", 524, 173, 12, "#526349");
        P.text(c, "\u2191 OLHANDO A PARTIR DA ENTRADA", 526, 468, 12, "#35513c");
        const a = roomPoint(s.at);
        if (s.relation === "above") {
          // Separate wall diagram: above is vertical height, not depth in the floor plan.
          P.box(c, 505, 179, 110, 207, "#dfd0b7");
          P.text(c, "PAREDE", 560, 195, 11, "#4f6251");
          prop(c, "table-round", a.x, 388, 87);
          roomLabel(c, "table", { x: a.x, y: 388 });
          if (d.hint) P.box(c, a.x - 34, roomPoint(s.goals[0]).y - 45, 68, 51, "#a6c89b", "#41735c");
          roomItem(c, r);
        } else if (s.relation === "behind" && d.pos[1] < s.at[1]) {
          roomItem(c, r);
          reference(c, s, a);
        } else {
          reference(c, s, a);
          if (s.other) reference(c, s, roomPoint(s.other), true);
          roomItem(c, r);
        }
        P.box(c, 290, 422, 47, 27, "#ad7d50", "#5b4a39");
        P.text(c, "CAIXA", 313, 435, 10, "#fff0cb");
        drawRoomLabels(c);
      }
    };
    C.rhythm = {
      create(training) {
        return { stage: 0, time: 0, hit: 0, resolved: 0, current: 0, flash: [0, 0, 0, 0], notes: training ? [] : Array.from({ length: 24 }, (_, i) => ({ lane: (i * 3 + Math.floor(i / 4)) % 4, at: 2 + i * 0.9, done: false })) };
      },
      model(r) {
        const d = r.data;
        return { request: r.training && r.step === 0 ? "Toque D para experimentar" : "Toque quando o sinal chegar \xE0 linha dourada", support: "D \xB7 F \xB7 J \xB7 K correspondem \xE0s quatro faixas. A m\xFAsica \xE9 original do jogo; o som \xE9 opcional.", progress: r.training ? d.hit : Math.floor(d.resolved / 8), total: r.training ? r.step === 2 ? 4 : 1 : 3, hint: "Precis\xE3o e sequ\xEAncia acendem o palco." };
      },
      guideStep(r) {
        const d = r.data;
        d.time = 0;
        d.hit = 0;
        d.current = 0;
        d.resolved = 0;
        d.notes = Array.from({ length: r.step === 1 ? 1 : 4 }, (_, i) => ({ lane: r.step === 1 ? 0 : i, at: 1.5 + i * 0.85, done: false }));
      },
      action(r, name, n) {
        if (name !== "drum") return;
        const d = r.data;
        r.moves++;
        d.flash[n] = 0.2;
        V.Audio.drum(n % 2 ? "hat" : "kick");
        if (r.training && r.step === 0) {
          if (n === 0) P.event("drum");
          return;
        }
        const note = d.notes.find((a) => !a.done);
        if (note && note.lane === n && Math.abs(note.at - d.time) < 0.22) {
          note.done = true;
          d.hit++;
          d.resolved++;
          P.hit(70);
          P.feedback("\u2713 No tempo!");
          if (r.training) {
            if (r.step === 1) P.event("rhythm-hit");
            else if (d.hit >= 4) P.event("rhythm-sequence");
          } else if (d.resolved >= 24) P.finish();
        } else P.feedback("Observe a faixa e espere a linha dourada.", true);
      },
      update(r, dt) {
        const d = r.data;
        d.flash = d.flash.map((t) => Math.max(0, t - dt));
        if (r.training && r.step === 0) return;
        d.time += dt;
        const note = d.notes.find((n) => !n.done);
        if (!note) return;
        if (r.calm && d.time >= note.at) d.time = note.at;
        if (!r.calm && d.time > note.at + 0.24) {
          note.done = true;
          d.resolved++;
          r.mistakes++;
          r.combo = 0;
          r.feedback = "O sinal passou. O pr\xF3ximo j\xE1 vem: D \xB7 F \xB7 J \xB7 K.";
          if (d.resolved >= 24) P.finish();
        }
      },
      hint() {
        P.feedback("Os sinais esperam na linha se voc\xEA ativar Modo tranquilo na pausa.");
      },
      spot() {
        return { x: 480, y: 332, w: 360, h: 260 };
      },
      draw(c, r) {
        const d = r.data;
        P.box(c, 0, 0, 960, 540, "#243e40");
        P.box(c, 36, 167, 888, 307, "#3e5350");
        const colors = ["#d5ad66", "#b99cc8", "#83bdb3", "#de9b86"];
        for (let i = 0; i < 4; i++) {
          const x = 330 + i * 100;
          P.box(c, x - 44, 168, 88, 272, d.flash[i] > 0 ? colors[i] : "#2a4542", "#6e8978");
          P.text(c, ["D", "F", "J", "K"][i], x, 457, 24, colors[i]);
        }
        line(c, [{ x: 280, y: 416 }, { x: 680, y: 416 }], "#edce8b", 5);
        for (const n of d.notes) {
          if (n.done) continue;
          const y = 416 - (n.at - d.time) * 125;
          if (y < 174 || y > 444) continue;
          P.box(c, 294 + n.lane * 100, y - 11, 72, 22, colors[n.lane], "#f6e7bd");
        }
        for (let i = 0; i < 2; i++) {
          const x = 132 + i * 700;
          prop(c, "plant", x - 42, 436, 90);
          V.Assets.sprite(c, i ? "percussionist" : "musician", x, 386, 0, V.settings.reducedMotion ? 0 : Math.floor(r.elapsed * (r.combo ? 8 : 3)) % 4, 90);
          for (let n = 0; n < 5; n++) P.box(c, x - 39 + n * 16, 409, 11, 15 + Math.min(35, r.combo * 3) * ((n + 1) % 3 + 1) / 3, colors[(n + i) % 4]);
        }
      }
    };
    const gardenPlaces = { seeds: { x: 1, y: 5, name: "seeds", pt: "Carrinho de sementes", color: "#bf9c68" }, water: { x: 11, y: 5, name: "water", pt: "Fonte de \xE1gua", color: "#85aeb5" }, botica: { x: 11, y: 1, name: "herb shop", pt: "Casa de ervas", color: "#92a87c" } };
    const beds = [{ x: 3, y: 2 }, { x: 7, y: 3 }, { x: 9, y: 4 }];
    function gardenPoints(r) {
      return { ...gardenPlaces, ...Object.fromEntries(beds.slice(0, r.training ? 1 : 3).map((p, i) => ["bed" + i, { ...p, name: "garden bed", pt: "Canteiro " + (i + 1) }])) };
    }
    function gardenAction(r, p) {
      const d = r.data;
      if (!p || p.dist >= 1.35) return "Chegue perto de um ponto";
      if (p.id === "seeds") return "Pegar sementes \xB7 E";
      if (p.id === "water") return "Encher regador \xB7 E";
      if (p.id === "botica") return "Entregar colheita \xB7 E";
      const b = d.beds[Number(p.id.slice(3))];
      return b.status === "empty" ? "Plantar \xB7 E" : b.status === "planted" ? "Regar \xB7 E" : b.status === "growing" ? "Crescendo\u2026" : "Colher \xB7 E";
    }
    C.garden = {
      hud(r) {
        waypoints(r, gardenPoints(r));
      },
      create() {
        return { player: { x: 2, y: 5, dir: 1 }, route: [], beds: beds.map(() => ({ status: "empty", growth: 0 })), seeds: 0, water: 0, harvest: 0, delivered: 0 };
      },
      model(r) {
        const d = r.data, near = nearby(r, gardenPoints(r));
        return { request: "Plante \u2192 regue \u2192 colha \u2192 entregue na casa de ervas", support: `seeds = sementes (${d.seeds}) \xB7 water = \xE1gua (${d.water}) \xB7 harvest = colheita (${d.harvest})`, progress: d.delivered, total: r.training ? 1 : 3, action: gardenAction(r, near), disabled: near.dist >= 1.35, hint: "O crescimento \xE9 acelerado nesta atividade. N\xE3o \xE9 uma orienta\xE7\xE3o de cultivo ou uso medicinal." };
      },
      action(r, name) {
        if (name !== "use") return;
        const d = r.data, p = nearby(r, gardenPoints(r));
        if (p.dist >= 1.35) return;
        r.moves++;
        if (p.id === "seeds") {
          d.seeds = 3;
          P.feedback("Sementes na mochila. Procure um canteiro vazio.");
          P.event("seeds");
        } else if (p.id === "water") {
          d.water = 3;
          P.feedback("Regador cheio. Volte ao canteiro plantado.");
          P.event("water-pick");
        } else if (p.id === "botica") {
          if (!d.harvest) return P.feedback("Traga uma colheita pronta para a entrega.");
          d.delivered += d.harvest;
          d.harvest = 0;
          P.hit(200);
          P.feedback("\u2713 Colheita entregue \xE0 casa de ervas!");
          if (r.training) P.event("harvest-delivery");
          else if (d.delivered >= 3) P.finish();
        } else {
          const b = d.beds[Number(p.id.slice(3))];
          if (b.status === "empty") {
            if (!d.seeds) return P.feedback("Retire sementes no carrinho antes de plantar.");
            d.seeds--;
            b.status = "planted";
            P.feedback("Semente plantada. Agora leve \xE1gua at\xE9 aqui.");
            P.event("plant");
          } else if (b.status === "planted") {
            if (!d.water) return P.feedback("Encha o regador na fonte.");
            d.water--;
            b.status = "growing";
            b.growth = 0;
            P.feedback("Canteiro regado. Em alguns segundos, voc\xEA poder\xE1 colher.");
            P.event("water");
          } else if (b.status === "growing") P.feedback("As folhas ainda est\xE3o crescendo. Observe a barra do canteiro.");
          else if (b.status === "ready") {
            b.status = "harvested";
            d.harvest++;
            P.hit(80);
            P.feedback("Colheita na mochila. Leve-a ao balc\xE3o da casa de ervas.");
          } else P.feedback("Este canteiro j\xE1 completou o ciclo. Cuide dos demais.");
        }
      },
      update(r, dt) {
        move(r, dt);
        r.data.beds.forEach((b) => {
          if (b.status === "growing") {
            b.growth += dt;
            if (b.growth >= 3.5) b.status = "ready";
          }
        });
      },
      pointer: mapPointer,
      hint(r) {
        const d = r.data;
        let p;
        if (d.harvest) p = gardenPlaces.botica;
        else {
          const i = d.beds.slice(0, r.training ? 1 : 3).findIndex((b2) => !["harvested"].includes(b2.status)), b = d.beds[i];
          p = b?.status === "empty" && !d.seeds ? gardenPlaces.seeds : b?.status === "planted" && !d.water ? gardenPlaces.water : beds[Math.max(0, i)];
        }
        route(r, p);
        P.feedback("Siga as pegadas. O bot\xE3o de a\xE7\xE3o explica o pr\xF3ximo cuidado.");
      },
      spot(r) {
        const targets = [gardenPlaces.seeds, beds[0], gardenPlaces.water, beds[0], r.data.harvest ? gardenPlaces.botica : beds[0]], t = tilePoint(targets[r.step] || beds[0]);
        return { x: t.x, y: t.y - 15, w: 150, h: 120 };
      },
      draw(c, r) {
        mapBase(c, r, gardenPlaces, false);
        for (let i = 0; i < (r.training ? 1 : 3); i++) {
          const t2 = tilePoint(beds[i]), b = r.data.beds[i];
          P.box(c, t2.x - 26, t2.y - 19, 52, 35, "#77563d", "#b39160");
          for (let j = 0; j < 3; j++) {
            const x = t2.x - 16 + j * 16;
            line(c, [{ x, y: t2.y - 16 }, { x, y: t2.y + 11 }], "#533f30", 2);
          }
          if (["growing", "ready"].includes(b.status)) prop(c, "plant", t2.x, t2.y + 2, b.status === "ready" ? 56 : 36);
          else if (b.status === "planted") {
            c.fillStyle = "#dbb86f";
            c.fillRect(t2.x - 4, t2.y - 7, 8, 5);
          }
          P.text(c, b.status === "empty" ? "vazio" : b.status === "planted" ? "regar" : b.status === "growing" ? "crescendo" : b.status === "ready" ? "colher" : "\u2713", t2.x, t2.y + 30, 12, "#254535");
          if (b.status === "growing") {
            P.box(c, t2.x - 23, t2.y + 17, 46, 5, "#bdc6a4");
            P.box(c, t2.x - 23, t2.y + 17, 46 * Math.min(1, b.growth / 3.5), 5, "#4f8260");
          }
        }
        const t = tilePoint(r.data.player);
        P.person(c, t.x, t.y + 10, r.data.walking, r.data.player.dir, 54);
      }
    };
    const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]], bridgePaths = [[[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]], [[0, 2], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [4, 2]], [[0, 2], [0, 3], [1, 3], [2, 3], [2, 2], [2, 1], [3, 1], [4, 1], [4, 2]], [[0, 2], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [4, 1], [4, 2]], [[0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2]], [[0, 2], [1, 2], [1, 1], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2], [3, 3], [4, 3], [4, 2]]];
    function direction(a, b) {
      return directions.findIndex(([x, y]) => b[0] - a[0] === x && b[1] - a[1] === y);
    }
    function bridgeBoard(stage, training = false) {
      const path2 = bridgePaths[training ? 0 : stage % bridgePaths.length], cells = Array.from({ length: 25 }, (_, i) => ({ base: i % 2 ? [0, 1] : [0, 2], rot: (i * 3 + stage) % 4 }));
      path2.forEach((p, i) => {
        const prev = i ? path2[i - 1] : [-1, 2], next = i < path2.length - 1 ? path2[i + 1] : [5, 2];
        cells[p[1] * 5 + p[0]] = { base: [direction(p, prev), direction(p, next)], rot: 0 };
      });
      const scrambled = training ? [2] : path2.map((p, i) => i % 2 === stage % 2 ? i : -1).filter((i) => i >= 0);
      scrambled.forEach((index, i) => {
        const p = path2[index];
        cells[p[1] * 5 + p[0]].rot = training ? 3 : 1 + i % 3;
      });
      return { cells, cursor: [2, 2], crossing: null };
    }
    function ports(cell) {
      return cell.base.map((n) => (n + cell.rot) % 4);
    }
    function connected(d) {
      const start = 10;
      if (!ports(d.cells[start]).includes(3)) return { seen: [], path: null };
      const q = [start], prev = new Map([[start, null]]);
      for (let i = 0; i < q.length; i++) {
        const idx = q[i], x = idx % 5, y = Math.floor(idx / 5), p = ports(d.cells[idx]);
        if (idx === 14 && p.includes(1)) {
          const path2 = [];
          let n = idx;
          while (n !== null) {
            path2.unshift(n);
            n = prev.get(n);
          }
          return { seen: [...prev.keys()], path: path2 };
        }
        for (const n of p) {
          const [dx, dy] = directions[n], xx = x + dx, yy = y + dy, next = yy * 5 + xx;
          if (xx < 0 || xx > 4 || yy < 0 || yy > 4 || prev.has(next) || !ports(d.cells[next]).includes((n + 2) % 4)) continue;
          prev.set(next, idx);
          q.push(next);
        }
      }
      return { seen: [...prev.keys()], path: null };
    }
    const bridgePoint = (i) => ({ x: 430 + i % 5 * 68, y: 207 + Math.floor(i / 5) * 47 });
    C.bridges = {
      create(training, start = 0) {
        return { stage: start, ...bridgeBoard(start, training), hint: null };
      },
      model(r) {
        const d = r.data, ok = connected(d).path;
        return { request: ok ? "Conex\xE3o pronta! Atravesse at\xE9 a outra margem." : "Gire as pe\xE7as e una a entrada \xE0 sa\xEDda.", support: "As sa\xEDdas precisam se encontrar dos dois lados. A luz mostra o caminho conectado \xE0 entrada.", progress: r.training ? 0 : d.stage, total: r.training ? 1 : 6, action: d.crossing ? "Atravessando\u2026" : "Atravessar \xB7 C", disabled: !ok || !!d.crossing, hint: "Clique nas pe\xE7as para girar. No teclado, setas escolhem; E gira." };
      },
      action(r, name, arg) {
        const d = r.data;
        if (d.crossing) return;
        if (name === "move") {
          d.cursor = [clamp(d.cursor[0] + arg[0], 0, 4), clamp(d.cursor[1] + arg[1], 0, 4)];
          return;
        }
        if (name === "rotate") {
          const idx = d.cursor[1] * 5 + d.cursor[0];
          d.cells[idx].rot = (d.cells[idx].rot + 1) % 4;
          r.moves++;
          P.event("bridge-rotate");
          if (connected(d).path) {
            P.feedback("A luz chegou \xE0 sa\xEDda. Agora atravesse.");
            P.event("bridge-connect");
          }
        } else if (name === "cross" && connected(d).path) {
          d.crossing = { path: connected(d).path, t: 0 };
          r.moves++;
        }
      },
      guideStep(r) {
        if (r.step === 1 && connected(r.data).path) P.event("bridge-connect");
      },
      pointer(r, type, p) {
        if (type !== "down") return;
        const x = Math.round((p.x - 430) / 68), y = Math.round((p.y - 207) / 47);
        if (x < 0 || x > 4 || y < 0 || y > 4) return;
        r.data.cursor = [x, y];
        this.action(r, "rotate");
      },
      update(r, dt) {
        const d = r.data;
        if (!d.crossing) return;
        d.crossing.t += dt * 2.2;
        if (d.crossing.t >= d.crossing.path.length + 1) {
          d.crossing = null;
          P.hit(250);
          d.stage++;
          P.feedback("\u2713 A equipe atravessou a passarela!");
          if (r.training) {
            d.stage = 0;
            P.event("bridge-cross");
          } else if (d.stage >= 6) P.finish();
          else Object.assign(d, bridgeBoard(d.stage));
        }
      },
      hint(r) {
        const d = r.data, path2 = bridgePaths[r.training ? 0 : d.stage % bridgePaths.length], wrong = path2.find((p) => {
          const idx = p[1] * 5 + p[0], i = path2.indexOf(p), prev = i ? path2[i - 1] : [-1, 2], next = i < path2.length - 1 ? path2[i + 1] : [5, 2], desired = [direction(p, prev), direction(p, next)].sort().join();
          return ports(d.cells[idx]).sort().join() !== desired;
        });
        d.hint = wrong ? wrong[1] * 5 + wrong[0] : null;
        P.feedback(wrong ? "A pe\xE7a marcada ainda interrompe a rota. Gire at\xE9 suas sa\xEDdas encontrarem as vizinhas." : "A conex\xE3o est\xE1 pronta. Use Atravessar.");
      },
      spot() {
        return { x: 566, y: 301, w: 100, h: 95 };
      },
      draw(c, r) {
        const d = r.data, link = connected(d);
        P.box(c, 0, 0, 960, 540, "#a9bd97");
        P.box(c, 366, 169, 402, 294, "#659a9b");
        for (let n = 0; n < 9; n++) {
          const y = 183 + n * 31, x = 381 + n % 3 * 10;
          line(c, [{ x, y }, { x: x + 350, y }], "#a4d0bb55", 2);
        }
        d.cells.forEach((cell, i) => {
          const p = bridgePoint(i), lit = link.seen.includes(i);
          P.box(c, p.x - 29, p.y - 20, 58, 40, lit ? "#e7cb97" : "#a7a782", "#3f6960");
          const pts = ports(cell);
          c.strokeStyle = lit ? "#6b714f" : "#4f6755";
          c.lineWidth = 13;
          c.lineCap = "square";
          c.beginPath();
          for (const n of pts) {
            const [dx, dy] = directions[n];
            c.moveTo(p.x, p.y);
            c.lineTo(p.x + dx * 29, p.y + dy * 20);
          }
          c.stroke();
          if (i === d.cursor[1] * 5 + d.cursor[0] || d.hint === i) {
            c.strokeStyle = d.hint === i ? "#f4e07e" : "#fff3d0";
            c.lineWidth = 3;
            c.strokeRect(p.x - 31, p.y - 22, 62, 44);
          }
        });
        marker(c, 350, 301, "\u2192");
        marker(c, 781, 301, "\u2192");
        P.text(c, "ENTRADA", 339, 343, 12, "#294e3d");
        P.text(c, "SA\xCDDA", 794, 343, 12, "#294e3d");
        let pos = { x: 348, y: 301 };
        if (d.crossing) {
          const a = [{ x: 348, y: 301 }, ...d.crossing.path.map(bridgePoint), { x: 790, y: 301 }], index = Math.min(a.length - 2, Math.floor(d.crossing.t)), f = d.crossing.t - index;
          pos = { x: a[index].x + (a[index + 1].x - a[index].x) * f, y: a[index].y + (a[index + 1].y - a[index].y) * f };
        }
        P.person(c, pos.x, pos.y + 9, !!d.crossing, 2, 58);
        prop(c, "plant", 293, 441, 76);
        prop(c, "plant", 840, 441, 76);
      }
    };
  })();
});
