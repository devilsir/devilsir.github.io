/* Registered module: play-culture-upgrade */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("play-culture-upgrade", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, P = V.Playground, A = V.AfricanPlayArt, AP = V.AfricanPlay;
    const settings = V.Game.settings.bind(V.Game);
    V.Game.settings = function(...args) {
      const out = settings(...args), translation = V.$("#s-translation")?.closest("label");
      if (!translation) return out;
      const row = document.createElement("label");
      row.className = "toggle";
      row.innerHTML = '<input id="s-phrase-translation" type="checkbox" ' + (V.settings.phraseTranslation !== false ? "checked" : "") + "> PIX traduz a frase completa nos di\xE1logos";
      translation.after(row);
      const note = document.createElement("small");
      note.textContent = "Ativo por padr\xE3o. As tradu\xE7\xF5es das palavras individuais continuam aparecendo.";
      row.after(note);
      const apply = V.$("#settings-apply"), save = apply.onclick;
      apply.onclick = () => {
        V.settings.phraseTranslation = V.$("#s-phrase-translation").checked;
        save();
      };
      return out;
    };
    // The feet are a choice made before the other person's reveal, not a sprite quiz.
    const ampe = P.controllers.ampe;
    V.PlaygroundData.games.find((g) => g.id === "ampe").description = "Bata palmas, salte e escolha um dos SEUS p\xE9s. A colega revela a escolha depois: n\xE3o \xE9 preciso adivinhar o p\xE9 dela.";
    V.PlaygroundData.guides.ampe[1].text = "Voc\xEA est\xE1 de costas para a c\xE2mera. A = seu p\xE9 esquerdo; D = seu p\xE9 direito. Escolha livremente. A colega s\xF3 revela o p\xE9 depois, ent\xE3o n\xE3o h\xE1 uma resposta secreta para descobrir na sprite.";
    const action = ampe.action.bind(ampe), update = ampe.update.bind(ampe);
    ampe.action = function(r, name, foot) {
      const before = r.data.phase;
      action(r, name, foot);
      if (before === "choice" && r.data.phase === "reveal") r.data.reveal = 2.4;
    };
    ampe.update = function(r, dt) {
      const before = r.data.phase;
      update(r, dt);
      if (before === "reveal" && r.data.phase === "feedback") r.data.delay = 2.1;
    };
    ampe.model = function(r) {
      const d = r.data;
      return { request: d.phase === "clap" ? "1 \xB7 BATA PALMAS E SALTE" : d.phase === "choice" ? "2 \xB7 ESCOLHA LIVREMENTE UM DOS SEUS P\xC9S" : d.playerFoot === d.peerFoot ? "3 \xB7 MESMO P\xC9 ANAT\xD4MICO" : "3 \xB7 P\xC9S DIFERENTES", support: "Voc\xEA " + d.points[0] + " \xD7 " + d.points[1] + " Colega \xB7 " + (d.leader === 0 ? "Voc\xEA lidera" : "Voc\xEA desafia") + " \xB7 " + AP.hearts(r), progress: d.hits, total: d.goal, hint: d.phase === "choice" ? "Voc\xEA escolhe antes da revela\xE7\xE3o. A colega n\xE3o mostra a resposta." : "P\xE9s iguais: ponto ao desafiante. P\xE9s diferentes: a l\xEDder continua." };
    };
    function footprint(c, x, y, left, active, label) {
      c.save();
      c.translate(x, y);
      c.rotate(left ? -0.14 : 0.14);
      c.fillStyle = active ? "#58d29f" : "#415f4f44";
      c.strokeStyle = active ? "#184b46" : "#36584777";
      c.lineWidth = active ? 4 : 2;
      c.beginPath();
      c.ellipse(0, -7, 13, 23, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.beginPath();
      c.ellipse(left ? -2 : 2, 16, 9, 7, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.restore();
      P.text(c, label, x, y + 43, 13, active ? "#264e3c" : "#47634c");
    }
    ampe.draw = function(c, r) {
      const d = r.data, revealed = d.playerFoot !== null, jump = d.phase === "choice" && !V.settings.reducedMotion ? Math.sin(Math.PI * Math.max(0, (d.jump || 0) / 0.5)) * 28 : 0;
      A.background(c, "ampe");
      AP.cue(c, d.phase === "clap" ? "1 \xB7 PALMAS + SALTO" : d.phase === "choice" ? "2 \xB7 ESCOLHA SEU P\xC9" : "3 \xB7 COMPARE OS NOMES DOS P\xC9S", d.phase === "choice" ? "Sua escolha \xE9 livre. A colega revela depois." : "Variante Lunetas \xB7 p\xE9s iguais d\xE3o ponto ao desafiante");
      for (let i = 0; i < 4; i++) A.person(c, i, 0, 145 + i * 220, 223, 63);
      A.person(c, d.peer, revealed ? 2 + d.peerFoot : 0, 480, 326, 122, jump);
      A.player(c, r, 480, 445, revealed ? d.playerFoot === 0 ? "back-left" : "back-right" : "back", 122, jump);
      P.text(c, "COLEGA \xB7 DE FRENTE", 480, 184, 15, "#254938");
      P.text(c, "VOC\xCA \xB7 DE COSTAS", 480, 470, 16, "#254938");
      const rightViewer = V.DuoChallenges?.isChild && new URLSearchParams(location.search).get("player") === "1";
      footprint(c, 394, 411, true, revealed && d.playerFoot === 0, "SEU ESQUERDO \xB7 " + (rightViewer ? "\u2190" : "A"));
      footprint(c, 566, 411, false, revealed && d.playerFoot === 1, "SEU DIREITO \xB7 " + (rightViewer ? "\u2192" : "D"));
      if (revealed) {
        footprint(c, 553, 294, false, d.peerFoot === 0, "ESQUERDO");
        footprint(c, 407, 294, true, d.peerFoot === 1, "DIREITO");
        const same = d.playerFoot === d.peerFoot;
        c.fillStyle = same ? "#2f6956" : "#735b37";
        c.fillRect(665, 316, 223, 104);
        P.text(c, same ? "MESMO P\xC9" : "P\xC9S DIFERENTES", 777, 342, 18, "#fff1c8");
        P.text(c, "Voc\xEA: " + (d.playerFoot ? "direito" : "esquerdo"), 777, 369, 15, "#fff1c8");
        P.text(c, "Colega: " + (d.peerFoot ? "direito" : "esquerdo"), 777, 394, 15, "#fff1c8");
      } else {
        P.text(c, "A escolha dela est\xE1 oculta", 738, 327, 16, "#264f3e");
        P.text(c, "at\xE9 voc\xEA escolher seu p\xE9.", 738, 351, 16, "#264f3e");
      }
      AP.bar(c, d.phase === "choice" ? 1 - d.t / d.duration : 1, d.phase === "choice" ? "Escolha o p\xE9 do SEU corpo" : "Frente a frente: o mesmo p\xE9 fica espelhado na tela");
    };
    ampe.hint = function(r) {
      P.feedback(r.data.phase === "clap" ? "Primeiro, espa\xE7o para bater palmas e saltar. Depois A ou D para escolher." : "N\xE3o \xE9 um teste para adivinhar a sprite. Voc\xEA escolhe A (seu esquerdo) ou D (seu direito) e s\xF3 depois compara com a colega.");
    };
    // Reward a deliberate jump for each call, including repeated calls.
    const terra = P.controllers["terra-mar"];
    terra.update = function(r, dt) {
      const d = r.data;
      d.jump = Math.max(0, d.jump - dt);
      d.x += ((d.side ? 675 : 285) - d.x) * Math.min(1, dt * 10);
      if (AP.update(r, dt, () => this.next(r))) return;
      d.t += dt;
      if (r.training || r.calm) d.t = Math.min(d.t, d.duration * 0.55);
      else if (d.t >= d.duration) AP.resolve(r, false, "A chamada era " + (d.want ? "MAR" : "TERRA") + ". Salte a cada chamada, mesmo quando o lado se repete.");
    };
    // Keep the response visible long enough to understand movement and direction.
    const fire = P.controllers["fogo-montanha"], fireAction = fire.action.bind(fire);
    fire.action = function(r, ...args) {
      const before = r.data.phase;
      fireAction(r, ...args);
      if (before === "answer" && r.data.phase === "feedback") r.data.delay = 1.2;
    };
    const fireDraw = fire.draw.bind(fire);
    fire.draw = function(c, r) {
      const delay = r.data.delay;
      try {
        if (r.data.phase === "feedback" && r.data.response !== null) r.data.delay = V.clamp(delay / 1.2 * 0.85, 0, 0.85);
        fireDraw(c, r);
      } finally {
        r.data.delay = delay;
      }
    };
    // The airborne stone leaves and returns to the hand. The green interval matches
    // the actual catch input, and calm mode waits at that height.
    const stones = P.controllers.matacuzana, stoneAction = stones.action.bind(stones), stoneGuide = stones.guideStep.bind(stones);
    stones.guideStep = function(r) {
      stoneGuide(r);
      if (r.step === 2) r.data.air = r.data.duration * 0.94;
    };
    stones.update = function(r, dt) {
      const d = r.data;
      d.flight = Math.max(0, d.flight - dt);
      if (AP.update(r, dt, () => this.next(r))) return;
      if (d.phase !== "air") return;
      d.air += dt;
      if (r.training || r.calm) d.air = Math.min(d.air, d.duration * 0.95);
      else if (d.air >= d.duration) AP.resolve(r, false, "A pedra caiu. Lance, recolha uma e apanhe quando o anel ficar verde.");
    };
    stones.action = function(r, name, ...args) {
      const d = r.data;
      if (name === "stone-main" && d.phase === "air" && d.picked && d.air / d.duration < 0.9) {
        P.feedback("Espere a pedra voltar \xE0 m\xE3o. O anel fica verde na altura de apanhar.");
        return;
      }
      return stoneAction(r, name, ...args);
    };
    stones.draw = function(c, r) {
      const d = r.data, ratio = d.phase === "air" ? d.air / d.duration : 0, catchable = d.phase === "air" && ratio >= 0.9;
      A.background(c, "matacuzana");
      AP.cue(c, d.phase === "ready" ? "1 \xB7 LAN\xC7AR" : d.phase === "air" ? d.picked ? "3 \xB7 APANHAR NA DESCIDA" : "2 \xB7 RECOLHER UMA PEDRA" : "UMA PEDRA POR LAN\xC7AMENTO", AP.hearts(r));
      A.person(c, 1, d.phase === "air" && d.picked ? 7 : 0, 322, 417, 125);
      A.player(c, r, 650, 417, d.phase === "air" ? "clap" : "front", 116);
      A.prop(c, 4, 795, 444, 115, 85);
      for (let i = 0; i < Math.min(8, d.goal - d.hits); i++) {
        if (d.picked && i === 0) continue;
        const angle = i * 2.4;
        A.prop(c, 1, 470 + Math.cos(angle) * (25 + i * 4), 359 + Math.sin(angle) * 20, 23, 18);
      }
      if (d.phase === "air") {
        const sy = 350 - Math.sin(Math.PI * Math.min(1, ratio / 0.9)) * 185;
        V.SceneShadows.contact(c, 650, 420, 10 + Math.sin(Math.PI * ratio) * 6, 4, 0.2);
        A.prop(c, 1, 650, sy, 27, 24, false);
        c.strokeStyle = catchable ? "#4bd898" : "#efda9b";
        c.lineWidth = 4;
        c.beginPath();
        c.arc(650, sy - 12, 22, 0, Math.PI * 2);
        c.stroke();
        if (catchable) P.text(c, "APANHE AGORA", 650, sy - 47, 18, "#214f3b");
      }
      if (d.flight > 0) {
        const t = 1 - d.flight / 0.7;
        A.prop(c, 1, 470 + 180 * t, 355 - 5 * t - Math.sin(Math.PI * t) * 60, 23, 19, false);
      }
      AP.bar(c, d.phase === "air" ? ratio : 0, catchable ? "ANEL VERDE \xB7 PEDRA NA ALTURA DA M\xC3O" : d.phase === "air" ? "Retire uma pedra enquanto a outra est\xE1 no ar" : "Lan\xE7ar \u2192 recolher uma \u2192 apanhar");
    };
  })();
});
