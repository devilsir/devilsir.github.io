/* Registered module: community-stories */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("community-stories", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, D = V.CommunityStoriesData, W = V.World, C = V.Cozy, L = V.Living, esc = V.escape;
    const originalInteract = V.Game.interact.bind(V.Game);
    const special = new Set(["market-merchant", "cooking-npc", "food-museum-curator", "animal-museum-curator", "sea-person", "cape-person", "nature-ranger", "story-person"]);
    L.missions.push(...D.missions.filter((q) => !L.missions.some((old) => old.id === q.id)));
    const S = V.CommunityStories = {
      data: D,
      owner() {
        return V.PixWorldVocabulary.owner();
      },
      owned(i, fn) {
        return V.PixWorldVocabulary.owned(i, fn);
      },
      state(id) {
        L.ensure();
        return V.state.sideQuests[id];
      },
      mission(id) {
        return D.missions.find((q) => q.id === id);
      },
      step(q) {
        const s = this.state(q.id);
        return s?.started && !s.done ? q.steps[s.step] : null;
      },
      located(id) {
        return V.CityMenus.locate((o) => o.id === id);
      },
      quests(o) {
        return D.missions.filter((q) => q.owner === o.id);
      },
      tasks(o) {
        return D.missions.filter((q) => this.step(q)?.targets.includes(o.id));
      },
      available(o) {
        return this.quests(o).filter((q) => !this.state(q.id)?.done);
      },
      sources(q) {
        return (q.sources || []).map((id) => D.sources[id]).filter(Boolean).map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} \u2197</a>`).join("");
      },
      describe(o) {
        const merchant = o.marketVendor && V.Markets.vendor(o.marketVendor), sea = o.person && (o.type === "sea-person" ? V.MaritimeData.people : V.CapeRegionData.people).find((p) => p.id === o.person), staff = o.sanctuaryStaff && V.SanctuaryNeighbors.staff.find((s) => s.id === o.sanctuaryStaff);
        const roles = {
          "kitchen-chef": ["Dandara", "Chef e educadora", "Each recipe has a place and people behind it. Let us prepare the kitchen and learn together.", "Cada receita tem um lugar e pessoas por tr\xE1s dela. Vamos preparar a cozinha e aprender juntos."],
          "restaurant-chef": ["Bento", "Chef do restaurante", "I check the utensils and prepare the next service. Ask me about the recipe you want to try.", "Confiro os utens\xEDlios e preparo o pr\xF3ximo servi\xE7o. Pode perguntar sobre a receita que voc\xEA quer experimentar."],
          "restaurant-lia": ["Lia", "Atendimento e cozinha", "The tables are ready. I can help you choose a dish or find the teaching kitchen.", "As mesas est\xE3o prontas. Posso ajudar a escolher um prato ou encontrar a cozinha de ensino."],
          "university-professor": ["Professora Jamila", "Educa\xE7\xE3o e patrim\xF4nio alimentar", "We compare sources and listen to the people who share their knowledge. Research begins with a good question.", "Comparamos fontes e escutamos quem compartilha seus saberes. A pesquisa come\xE7a com uma boa pergunta."],
          "university-researcher": ["In\xEAs", "Pesquisa e documenta\xE7\xE3o", "I am comparing the history of each dish with the history of its name. Our notes keep the sources together.", "Estou comparando a hist\xF3ria de cada prato com a hist\xF3ria do nome dele. Nossas notas mant\xEAm as fontes por perto."],
          "university-guide": ["Aline", "Media\xE7\xE3o da universidade", "There is an open lesson and a kitchen workshop here. We make room for questions and different experiences.", "Aqui h\xE1 uma aula aberta e uma oficina de cozinha. Damos espa\xE7o para perguntas e experi\xEAncias diferentes."],
          "food-museum-curator": ["Curadora Celina", "Museu da Comida", "A display case holds a dish. A good label also introduces the people, techniques and places connected to it.", "Uma vitrine guarda um prato. Uma boa legenda tamb\xE9m apresenta as pessoas, t\xE9cnicas e lugares ligados a ele."],
          "story-mediator-ivo": ["Ivo", "Mediador da roda", "We are preparing the next circle. Listen to the music before joining the game.", "Estamos preparando a pr\xF3xima roda. Escute a m\xFAsica antes de entrar no jogo."],
          "story-mediator-ines": ["In\xEAs", "Media\xE7\xE3o do Museu das Palavras", "Words travel between people and places. We look for the language, the context and the source of each record.", "Palavras viajam entre pessoas e lugares. Procuramos a l\xEDngua, o contexto e a fonte de cada registro."]
        };
        const r = roles[o.id], base = V.content.characters[o.character] || {};
        return { name: r?.[0] || merchant?.name || sea?.name || staff?.name || o.name || o.resident?.name || base.name || "Morador da comunidade", role: r?.[1] || sea?.role || staff?.role || (merchant ? "Com\xE9rcio e saberes da feira" : base.role || "Vizinhan\xE7a"), en: r?.[2] || sea?.en || staff?.line?.[0] || "I am getting things ready for the next visitors. We can share what we know about this place.", pt: r?.[3] || merchant?.text || sea?.pt || staff?.line?.[1] || "Estou preparando as coisas para as pr\xF3ximas visitas. Podemos compartilhar o que sabemos deste lugar." };
      },
      speaker(o, person2) {
        const id = "community-speaker-" + o.id, base = o.uniformSprite || o.character || "jamila";
        V.content.characters[id] = { ...V.content.characters[base], name: person2.name, role: person2.role };
        for (const suffix of ["", "-portrait"]) if (V.Assets.images[base + suffix]) V.Assets.images[id + suffix] = V.Assets.images[base + suffix];
        return id;
      },
      talk(o) {
        const i = this.owner();
        if (V.DuoPanels?.enabled() && V.DuoPanels.context !== i) return this.owned(i, () => this.talk(o));
        const owner = this.owner(), person2 = this.describe(o), task = this.tasks(o).map((q) => ({ q, step: this.step(q) })).find((x) => x.step.kind === "story-talk"), line = task?.step || person2;
        if (o.group) {
          const g = W.current.chats.find((g2) => g2.id === o.group);
          if (g) C.endChat(W.current, g);
        }
        o.responding = 4;
        o.greeting = 12;
        V.Dialogue.start([{ speaker: this.speaker(o, person2), en: line.en, pt: line.pt }], () => this.owned(owner, () => {
          L.event("story-talk", o.id);
          V.PixWorldVocabulary.learn(task?.q.words || ["listen", "share"], "Conversa \xB7 " + person2.name);
          V.Save.log("conversa da comunidade", person2.name);
          V.Save.save();
        }));
      },
      offer(o) {
        const i = this.owner();
        if (V.DuoPanels?.enabled() && V.DuoPanels.context !== i) return this.owned(i, () => this.offer(o));
        o.responding = 12;
        const owner = this.owner(), person2 = this.describe(o), quests = this.quests(o), tasks = this.tasks(o), business = !o.storyPerson;
        V.UI.modal(person2.name, person2.role, `<p>${esc(person2.pt)}</p>${tasks.filter((q) => q.owner !== o.id).map((q) => `<p class="story-current">${esc(q.title)} \xB7 ${esc(this.step(q).label)}</p>`).join("")}<div class="story-offers">${quests.map((q) => {
          const s = this.state(q.id), step = this.step(q);
          return `<article><span class="story-blue-icon" aria-hidden="true">${s?.done ? "\u2713" : "!"}</span><div><small>${s?.done ? "HIST\xD3RIA REGISTRADA" : s?.started ? "MISS\xC3O EM ANDAMENTO" : "MISS\xC3O SECUND\xC1RIA"}</small><h3>${esc(q.title)}</h3><p>${esc(q.brief)}</p>${step ? `<p class="story-current">${esc(step.label)}</p>` : ""}<button class="${step?.kind === "story-report" ? "primary" : "secondary"}" data-story-open="${q.id}">${s?.done ? "Ler registro" : step?.kind === "story-report" ? "Contar o que descobri" : s?.started ? "Acompanhar miss\xE3o" : "Ouvir a proposta"}</button></div></article>`;
        }).join("")}</div>`, `<button class="primary" id="story-talk">Conversar</button>${business ? '<button class="secondary" id="story-service">' + (o.marketVendor ? "Visitar a banca" : o.type === "sea-person" ? "Atendimento do porto" : o.type.includes("curator") ? "Consultar o museu" : "Ver atividades") + "</button>" : ""}`);
        V.$$("[data-story-open]").forEach((b) => b.onclick = () => this.owned(owner, () => this.step(this.mission(b.dataset.storyOpen))?.kind === "story-report" ? this.report(b.dataset.storyOpen) : this.show(b.dataset.storyOpen)));
        V.$("#story-talk").onclick = () => this.owned(owner, () => this.talk(o));
        V.$("#story-service")?.addEventListener("click", () => this.owned(owner, () => {
          V.UI.close();
          originalInteract(o);
        }));
        this.bind(owner);
        if (o.pixContext) V.PixWorldVocabulary.strip(o.pixContext.words, "Conversa \xB7 " + person2.name);
      },
      bind(owner) {
        if (V.DuoPanels?.enabled()) V.DuoPanels.bind(V.DuoPanels.root(owner), owner);
      },
      show(id) {
        const i = this.owner();
        if (V.DuoPanels?.enabled() && V.DuoPanels.context !== i) return this.owned(i, () => this.show(id));
        const q = this.mission(id);
        if (!q) return;
        const owner = this.owner(), s = this.state(id), step = this.step(q);
        V.UI.modal(q.title, "HIST\xD3RIAS DA COMUNIDADE \xB7 " + V.Living.location(q.map), `<p class="story-brief">${esc(q.brief)}</p><aside class="story-context"><strong>Cultura e contexto</strong><p>${esc(q.context)}</p></aside><ol class="mission-steps">${q.steps.map((item, i2) => `<li class="${s && i2 < s.step ? "checked" : ""}">${s && i2 < s.step ? "\u2713 " : ""}${esc(item.label)}${s && i2 === s.step && s.progress.length ? ` <small>(${s.progress.length}/${item.targets.length})</small>` : ""}</li>`).join("")}</ol><p class="note">${esc(q.reward)}. Progresso salvo no caderno.</p>${s?.done ? `<p class="story-resolution">${esc(q.steps.at(-1).explanation)}</p>` : ""}${q.sources.length ? `<details class="story-sources"><summary>Fontes desta hist\xF3ria</summary>${this.sources(q)}<small>Personagens e enredo s\xE3o ficcionais.</small></details>` : ""}`, `<button id="story-journal" class="secondary">Caderno</button>${s?.done ? "" : `<button id="story-accept" class="primary">${step?.kind === "story-report" ? "Contar o que descobri" : s?.started ? "Rastrear pr\xF3xima etapa" : "Aceitar miss\xE3o"}</button>`}`);
        V.$("#story-journal").onclick = () => this.owned(owner, () => V.CityMenus.board("community"));
        V.$("#story-accept")?.addEventListener("click", () => this.owned(owner, () => {
          if (step?.kind === "story-report") return this.report(id);
          V.CityMenus.track("community", id);
        }));
        this.bind(owner);
        V.PixWorldVocabulary.strip(q.words, "Miss\xE3o \xB7 " + q.title);
      },
      canReport(q) {
        const found = this.located(q.owner);
        return this.step(q)?.kind === "story-report" && found?.map === W.current.id && V.dist(V.Player.data, found.object) < (found.object.interactionRange || 100) + 35;
      },
      report(id) {
        const i = this.owner();
        if (V.DuoPanels?.enabled() && V.DuoPanels.context !== i) return this.owned(i, () => this.report(id));
        const q = this.mission(id), owner = this.owner();
        if (!q || !this.canReport(q)) {
          if (q) {
            V.CityMenus.track("community", id);
            V.UI.toast("Converse com a pessoa que prop\xF4s a miss\xE3o para entregar suas descobertas.");
          }
          return;
        }
        const step = this.step(q);
        V.UI.modal(q.title, "COMPARTILHAR DESCOBERTAS", `<p>${esc(step.prompt)}</p><div class="story-answers">${step.answers.map((answer, i2) => `<button class="secondary" data-story-answer="${i2}">${esc(answer)}</button>`).join("")}</div><p class="story-answer-feedback" id="story-answer-feedback" role="status"></p>`, '<button id="story-report-back" class="quiet">Pensar mais um pouco</button>');
        V.$$("[data-story-answer]").forEach((b) => b.onclick = () => this.owned(owner, () => {
          if (!this.canReport(q)) return;
          if (+b.dataset.storyAnswer !== step.correct) {
            V.$("#story-answer-feedback").textContent = "Releia suas descobertas: " + q.context;
            return;
          }
          L.event("story-report", q.owner);
          V.Audio.sfx("collect");
          this.show(id);
        }));
        V.$("#story-report-back").onclick = () => this.owned(owner, () => this.show(id));
        this.bind(owner);
      },
      inspect(o) {
        if (!o || V.Game.mode !== "explore") return;
        // Food fiches advance when registered, rather than merely opened.
        if (o.foodEntry) {
          if (V.FoodMuseum.ensure().readers[this.owner()].includes(o.foodEntry)) L.event("story-inspect", "food-panel-" + o.foodEntry);
          return;
        }
        L.event("story-inspect", o.id);
        const clue = o.id === "market-stall-zola" ? "Shweshwe \xB7 confira a proced\xEAncia do tecido e os cr\xE9ditos de quem produziu e costurou. A produ\xE7\xE3o registrada pela Da Gama tem liga\xE7\xE3o com o Cabo Oriental, na \xC1frica do Sul." : o.id === "market-stall-solange" ? "Ficha da banca coletiva: nome de quem criou, material, uso indicado pela pessoa e forma de contato escolhida por ela. Solange combina o texto com cada participante." : "";
        if (clue && V.modal) {
          const p = document.createElement("p");
          p.className = "story-context";
          p.textContent = clue;
          V.$(".modal-body")?.prepend(p);
        }
      },
      seed() {
        const add = (map, id, name, character, at, plaque, title, text) => {
          const m = W.maps[map];
          if (!m || m.objects.some((o2) => o2.id === id)) return;
          const p = C.safe(m, at[0], at[1], m.objects.filter((o2) => C.person(o2))), o = { id, type: "story-person", storyPerson: true, name, character, x: p.x * 48 + 24, y: p.y * 48 + 24, label: "Conversar com " + name, interactionRange: 100 };
          C.preparePerson(m, o);
          m.objects.push(o);
          const a = C.safe(m, p.x + 2, p.y, m.objects.filter((o2) => C.person(o2)));
          m.objects.push({ id: plaque, type: "story-plaque", x: a.x * 48 + 24, y: a.y * 48 + 24, label: "Ler: " + title, title, text, interactionRange: 110 });
        };
        add("capoeira-courtyard", "story-mediator-ivo", "Ivo", "percussionist", [11, 12], "story-roda-plaque", "A roda e seus saberes", D.missions.find((q) => q.id === "story-roda").context);
        add("african-words", "story-mediator-ines", "In\xEAs", "ines", [20, 32], "story-language-plaque", "L\xEDngua, contexto e fonte", D.missions.find((q) => q.id === "story-museum-voices").context);
        V.ObjectiveGuide.invalidate();
        V.Atlas.cache.clear();
      },
      markers(c, m, cam) {
        if (V.SceneEditor.active || !V.state) return;
        for (const o of m.objects) {
          const offers = this.available(o);
          if (!offers.length) continue;
          const x = Math.round(o.x - cam.x), y = Math.round(o.y - cam.y - 91);
          if (x < -25 || x > c.canvas.width + 25 || y < -25 || y > c.canvas.height + 25) continue;
          const ready = offers.some((q) => this.step(q)?.kind === "story-report"), active = offers.every((q) => this.state(q.id)?.started);
          c.save();
          c.shadowColor = "#102f42";
          c.shadowBlur = 4;
          c.fillStyle = active && !ready ? "#d8eff9" : "#2084d6";
          c.strokeStyle = "#e1f5ff";
          c.lineWidth = 2;
          c.beginPath();
          c.arc(x, y, 13, 0, Math.PI * 2);
          c.fill();
          c.stroke();
          c.shadowBlur = 0;
          c.fillStyle = active && !ready ? "#1765a5" : "#ffffff";
          c.font = '900 19px "VOICES Sans",sans-serif';
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(ready ? "\u2713" : "!", x, y + 1);
          c.restore();
        }
      }
    };
    const person = C.person.bind(C);
    C.person = (o) => o?.storyPerson || person(o);
    V.Hooks.around(V.World, "init", "community-stories:init:1", (init) => function(...args) {
      const out = init(...args);
      S.seed();
      return out;
    });
    const show = L.showMission.bind(L);
    L.showMission = (id) => S.mission(id) ? S.show(id) : show(id);
    const event = L.event.bind(L);
    L.event = function(...args) {
      const out = event(...args);
      for (const q of D.missions) if (S.state(q.id)?.done) {
        V.Life.award("side-" + q.id, 40);
        V.Progress.reward("story-xp:" + q.id, 20);
      }
      V.Game.updateHUD();
      V.ObjectiveGuide.invalidate();
      return out;
    };
    const resolve = V.CityMenus.resolve.bind(V.CityMenus);
    V.CityMenus.resolve = function(t) {
      const q = t?.kind === "community" && S.mission(t.id), step = q && S.step(q);
      if (step?.guideTarget) {
        const found = S.located(step.guideTarget);
        if (found) return { ...found, key: "task-community-" + q.id + "-" + S.state(q.id).step, label: step.label, title: q.title, task: t, progress: S.state(q.id).step, total: q.steps.length };
      }
      return resolve(t);
    };
    const register = V.FoodMuseum.register.bind(V.FoodMuseum);
    V.FoodMuseum.register = function(id) {
      const out = register(id);
      L.event("story-inspect", "food-panel-" + id);
      return out;
    };
    const deliver = V.Cooking.deliver.bind(V.Cooking);
    V.Cooking.deliver = function(...args) {
      const out = deliver(...args);
      if (out) L.event("story-cook", "kitchen-welcome");
      return out;
    };
    V.Hooks.around(V.Game, "interact", "community-stories:interact:1", (nextHook) => function(o) {
      if (!o || V.modal || V.Dialogue.active || this.mode !== "explore") return nextHook(o);
      if (o.type === "story-plaque") {
        V.UI.modal(o.title, "SABERES DA COMUNIDADE", `<p>${esc(o.text)}</p>`);
        S.inspect(o);
        return;
      }
      if (special.has(o.type) || o.sanctuaryStaff || S.quests(o).length) return S.offer(o);
      const out = nextHook(o);
      S.inspect(o);
      return out;
    });
    V.Hooks.around(V.Cozy, "drawObject", "community-stories:drawObject:1", (draw) => function(c, o, cam, ...args) {
      if (o.type === "story-plaque") {
        const x = o.x - cam.x, y = o.y - cam.y;
        c.fillStyle = "#796246";
        c.fillRect(x - 3, y - 43, 6, 45);
        c.fillStyle = "#b69b64";
        c.fillRect(x - 30, y - 76, 60, 38);
        c.fillStyle = "#efe4c6";
        c.fillRect(x - 26, y - 72, 52, 30);
        V.Engine.text(c, "i", x, y - 50, "#247aab", 20, "center");
        return;
      }
      return draw(c, o, cam, ...args);
    });
    const render = C.render.bind(C);
    C.render = function(c) {
      const out = render(c);
      if (W.current) S.markers(c, W.current, W.camera);
      return out;
    };
  })();
});
