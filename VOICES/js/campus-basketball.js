window.VoicesModules.define("campus-basketball", function() {
  "use strict";
  const V = window.V, W = V.World, M = V.BasketballMatch, A = V.BasketballArt;
  const mapId = "university-sports";
  const state = new WeakMap(), viewers = new WeakMap();
  const project = (m, x, y) => {
    const scale = m.court.w / M.court.w;
    return { x: m.court.x + (x - M.court.x) * scale, y: m.court.y + (y - M.court.y) * scale };
  };
  const info = V.CampusBasketball = {
    match(m) {
      return state.get(m);
    },
    build(m) {
      const s = M.create();
      state.set(m, s);
      for (const p of s.players) {
        const [id, name, role, number] = M.roster[p.id], point = project(m, p.x, p.y);
        m.objects.push({ id: "gym-" + id, type: "gym-athlete", ...point, gymIndex: p.id, name, role, number, label: name, collectionOnly: true });
      }
      for (const [i, row] of M.community.entries()) {
        const [id, name, role, gymX, gymY, job, talk] = row;
        m.objects.push({
          id: "gym-" + id,
          type: "gym-community",
          ...project(m, gymX, gymY),
          gymX,
          gymY,
          gymIndex: i,
          name,
          role,
          job,
          talk,
          label: name + " \xB7 " + role,
          interactionRange: job === "coach" || job === "table" ? 108 : 84,
          collectionOnly: job === "ref"
        });
      }
      const desk = project(m, 525, 486);
      m.objects.push({ id: "gym-match-desk", type: "gym-score-desk", ...desk, label: "Partida do gin\xE1sio", interactionRange: 105 });
    },
    update(m, dt) {
      let s = this.match(m);
      if (!s) return;
      if (s.status === "final" && s.wait <= 0) {
        s = M.create({ seed: s.seed });
        state.set(m, s);
      }
      M.tick(s, dt);
      A.whistle(s);
      for (const o of m.objects) {
        if (o.type === "gym-athlete") {
          const p = s.players[o.gymIndex];
          Object.assign(o, project(m, p.x, p.y));
        } else if (o.type === "gym-community") {
          const p = o.job === "ref" ? s.official : s.crew?.[o.gymIndex];
          if (!p) continue;
          const home = m.design?.positions?.[o.id], point = project(m, p.x, p.y);
          if (home && o.job !== "ref") {
            const base = project(m, o.gymX, o.gymY);
            point.x += (home[0] + 0.5) * 48 - base.x;
            point.y += (home[1] + 0.5) * 48 - base.y;
          }
          Object.assign(o, point);
        }
      }
    },
    draw(c, o, cam, m = W.current) {
      const s = this.match(m);
      if (o.type === "gym-athlete") {
        const p = s?.players[o.gymIndex];
        if (p) A.athlete(c, s, p, o.x - cam.x, o.y - cam.y, 83, false);
        return true;
      }
      if (o.type === "gym-community") {
        A.sideline(c, s, o.gymIndex, o.x - cam.x, o.y - cam.y, o.job === "fan" ? 69 : 76);
        return true;
      }
      if (o.type === "gym-score-desk") {
        A.desk(c, o.x - cam.x, o.y - cam.y, 75);
        return true;
      }
      return false;
    },
    fixtures(c, m, cam) {
      const s = this.match(m);
      if (!s) return;
      const relative = (x, y) => {
        const p = project(m, x, y);
        return { x: p.x - cam.x, y: p.y - cam.y };
      };
      for (const [i, rim] of M.baskets.entries()) A.rim(c, relative(rim.x, rim.y), i === 0 ? 1 : -1, 2.25);
      const ball = relative(s.ball.x, s.ball.y);
      A.ball(c, { ...ball, z: s.ball.z }, 2.25);
      const board = relative(480, 48);
      A.scoreboard(c, s, board.x, board.y, 580);
    },
    watch(o) {
      const m = W.current;
      V.UI.modal(
        "Partida ao vivo",
        "Aurora \xD7 Tambor",
        '<canvas id="gym-live" class="gym-live-court" width="960" height="540" aria-label="Quadra completa, com os dois times em jogo"></canvas><p id="gym-live-score" role="status"></p>',
        '<button id="gym-watch-back" class="secondary">Voltar ao placar</button><button id="gym-live-join" class="primary">Jogar a virada</button>',
        true
      );
      V.$("#gym-watch-back").onclick = () => this.open(o);
      V.$("#gym-live-join").onclick = () => V.ChallengeCatalog.detail("play:basketball-virada");
      const canvas = V.$("#gym-live"), context = canvas.getContext("2d"), status = V.$("#gym-live-score");
      viewers.set(m, canvas);
      let previous = null, last = "";
      const draw = (now) => {
        if (!canvas.isConnected || W.current !== m) return;
        if (viewers.get(m) === canvas || !viewers.get(m)?.isConnected) {
          viewers.set(m, canvas);
          this.update(m, previous === null ? 0 : (now - previous) / 1e3);
        }
        previous = now;
        const match = this.match(m);
        A.scene(context, match);
        const play = match.status === "play" ? M.tactic(match) + " \xB7 " : "";
        const summary = "Aurora " + match.score[0] + " \xD7 " + match.score[1] + " Tambor \xB7 " + play + match.last;
        if (summary !== last) {
          status.textContent = summary;
          last = summary;
        }
        requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
    },
    open(o) {
      if (o.job && o.job !== "coach" && o.job !== "table") {
        V.UI.modal(o.name, o.role, "<p>" + V.escape(o.talk) + "</p>");
        return;
      }
      const s = this.match(W.current);
      if (!s) return;
      const current = M.teams.map((team, i) => team.name + " " + s.score[i]).join(" \xD7 ");
      const rosters = M.teams.map((team, i) => '<section class="card"><h3>' + team.name + "</h3><ul>" + M.roster.slice(i * 5, i * 5 + 5).map((row, j) => "<li>" + row[3] + " \xB7 " + row[1] + " \xB7 " + row[2] + " \xB7 " + s.points[i * 5 + j] + " pts</li>").join("") + "</ul><small>Arremessos " + (s.stats.made?.[i] || 0) + "/" + s.stats.shots[i] + " \xB7 Assist\xEAncias " + (s.stats.assists?.[i] || 0) + " \xB7 Faltas " + (s.stats.fouls?.[i] || 0) + "</small></section>").join("");
      V.UI.modal(
        o.job === "coach" ? "Joana \xB7 Treinadora" : "Partida do gin\xE1sio",
        current,
        "<p>" + V.escape(o.talk || "O coletivo negro da Universidade das Vozes organizou a primeira Copa do Campus na quadra aberta. Hoje Aurora e Tambor se encontram no gin\xE1sio.") + '</p><div class="two-cols">' + rosters + "</div><p>Rebotes " + s.stats.rebounds.join(" \xD7 ") + " \xB7 Arremessos " + s.stats.shots.join(" \xD7 ") + " \xB7 Perdas de posse " + s.stats.turnovers.join(" \xD7 ") + "</p>",
        '<button id="gym-watch" class="secondary">Assistir \xE0 partida</button><button id="gym-cup" class="secondary">Jogar a Copa</button><button id="gym-challenge" class="primary">Jogar a virada</button>',
        true
      );
      V.$("#gym-watch").onclick = () => this.watch(o);
      V.$("#gym-cup").onclick = () => V.ChallengeCatalog.detail("play:basketball");
      V.$("#gym-challenge").onclick = () => V.ChallengeCatalog.detail("play:basketball-virada");
    }
  };
  V.MapAssets.addGroupRule("campus-basketball:groups:1", function(m, list) {
    if (m?.id === mapId) list.push("basketball");
  });
  const interactables = W.interactables.bind(W);
  W.interactables = function(...args) {
    const list = interactables(...args);
    if (this.current?.id !== mapId) return list;
    return [...new Set([...list.filter((o) => o.type !== "gym-athlete" && o.job !== "ref"), ...this.current.objects.filter((o) => o.type === "gym-score-desk" || o.type === "gym-community" && o.job !== "ref")])];
  };
  V.Hooks.around(V.Game, "interact", "campus-basketball:desk", (next) => function(o) {
    if (W.current?.id === mapId && !V.modal && !V.Dialogue.active && this.mode === "explore" && (o?.type === "gym-score-desk" || o?.type === "gym-community")) return info.open(o);
    return next(o);
  });
  V.Hooks.around(V.Game, "update", "campus-basketball:match", (next) => function(dt) {
    const result = next(dt);
    if (this.screen === "game" && this.mode === "explore" && W.current?.id === mapId && !viewers.get(W.current)?.isConnected && !V.modal && !V.Dialogue.active && !V.MapAssets.busy && !V.SceneEditor?.active) info.update(W.current, dt);
    return result;
  });
});
