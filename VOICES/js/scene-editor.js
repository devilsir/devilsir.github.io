/* Registered module: scene-editor */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("scene-editor", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, D = V.SceneDesign, C = V.Cozy, W = V.World, L = V.Living, T = 48, esc = V.escape, copy = (x) => JSON.parse(JSON.stringify(x));
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const editorBases = new WeakMap();
    // Copy map data with shared references intact, including NPCs and their anchors.
    function cloneScene(value, seen = new WeakMap()) {
      if (!value || typeof value !== "object" || value instanceof Node) return value;
      if (seen.has(value)) return seen.get(value);
      const out = Array.isArray(value) ? [] : value instanceof Map ? new Map() : value instanceof Set ? new Set() : {};
      seen.set(value, out);
      if (value instanceof Map) for (const [key, item] of value) out.set(key, cloneScene(item, seen));
      else if (value instanceof Set) for (const item of value) out.add(cloneScene(item, seen));
      else for (const [key, item] of Object.entries(value)) out[key] = cloneScene(item, seen);
      return out;
    }
    function addLiveEntries(target, built, live, key, keep = () => true) {
      const known = new Set([...target, ...built].map(key));
      for (const entry of live) {
        const id = key(entry);
        if (!known.has(id) && keep(entry)) {
          target.push(entry);
          known.add(id);
        }
      }
    }
    D.editorPreview = function(id, design, baseline) {
      const live = W.maps[id];
      if (!live || !baseline) return this.preview(id, copy(design));
      const snapshot = cloneScene({ ...live, cache: null });
      if (same(design, baseline)) return snapshot;
      // Use the builders for structural edits, then retain content the game seeded later.
      let built = editorBases.get(baseline);
      if (!built) {
        built = this.preview(id, copy(baseline));
        editorBases.set(baseline, built);
      }
      const edited = this.preview(id, copy(design));
      const m = { ...snapshot, ...edited };
      const removed = new Set(design.removedObjects || []);
      const hasId = (entry) => entry.id;
      const kept = new Set(m.objects.map(hasId));
      addLiveEntries(
        m.objects,
        built.objects,
        snapshot.objects,
        hasId,
        (o) => !V.BuildingSigns.isSign(o) && !removed.has(o.id) && (!o.scene || !baseline.scenes?.some((s) => s.id === o.scene.id))
      );
      for (const o of m.objects) {
        if (kept.has(o.id)) continue;
        const pos = design.positions?.[o.id];
        const offset = V.ObjectEditing.special(m) ? V.ObjectEditing.offset(m) : 0.5;
        const dx = pos ? (pos[0] + offset) * T - o.x : 0, dy = pos ? (pos[1] + offset) * T - o.y : 0;
        o.x += dx;
        o.y += dy;
        for (const a of snapshot.anchors.values()) if (a.object === o || a.id === "home-" + o.id) {
          a.x += dx;
          a.y += dy;
        }
        if (o.home) {
          o.home.x += dx;
          o.home.y += dy;
        }
        for (const f of snapshot.solids) if (f.owner === o.id || f.owner === "host-" + o.id) {
          f.x += dx;
          f.y += dy;
        }
        for (const prop of snapshot.decor) if (prop.linked === o.id) {
          prop.x += dx;
          prop.y += dy;
        }
      }
      const present = new Set(m.objects.map(hasId));
      const propKey = (p) => p.id ?? [p.family, p.prop, p.x, p.y, p.size].join("|");
      addLiveEntries(m.decor, built.decor, snapshot.decor, propKey, (p) => !p.linked || present.has(p.linked));
      const solidKey = (f) => [f.owner, f.x, f.y, f.w, f.h].join("|");
      addLiveEntries(
        m.solids,
        built.solids,
        snapshot.solids,
        solidKey,
        (f) => !f.exteriorFacade && !removed.has(f.owner) && !removed.has(f.owner?.replace(/^host-/, ""))
      );
      for (const [key, a] of snapshot.anchors) if (!m.anchors.has(key) && !built.anchors.has(key) && (!a.object || present.has(a.object.id))) m.anchors.set(key, a);
      if (!m.roomBuilder) {
        for (const o of m.objects) if (o.tasks) o.waypoints = o.tasks.map((key) => m.anchors.get(key)).filter(Boolean);
      }
      V.BuildingSigns.install(m);
      return m;
    };
    D.validateEditorMap = function(id, design, baseline) {
      const result = this.validate(this.editorPreview(id, design, baseline));
      if (result.ok || !baseline) return result;
      const issueKey = (i) => JSON.stringify([i.id, i.message, Math.round(i.x), Math.round(i.y)]);
      const previous = new Set(this.validate(this.editorPreview(id, baseline, baseline)).issues.map(issueKey));
      const issues = result.issues.filter((i) => !previous.has(issueKey(i)));
      return { ...result, issues, ok: issues.length === 0 };
    };
    const order = ["hub", "library", "park", "market", "garden", "beach", "school", "museum", ...Array.from({ length: 6 }, (_, i) => ["chapter-" + (i + 1), "room-" + (i + 1)]).flat()];
    const original = { bind: V.Game.bind.bind(V.Game), key: V.Game.onKey.bind(V.Game), update: V.Game.update.bind(V.Game), save: V.Save.save.bind(V.Save), pause: V.Game.pause.bind(V.Game) };
    V.SceneEditor = {
      active: false,
      walk: false,
      tool: "select",
      snap: 0.5,
      grid: true,
      collisions: false,
      routes: false,
      zoom: 1,
      pan: { x: 0, y: 0 },
      selection: null,
      asset: V.sceneAssets.findIndex((a) => a.family === "scene" && a.index === 0),
      category: "scene",
      history: [],
      future: [],
      uid: 0,
      open() {
        if (this.active || !W.maps.hub || !V.Assets.images["scene-props"]) return;
        window.VoicesApp?.loadFeature("scene-editor").catch(() => {});
        if (V.Game.screen === "game" && V.Game.mode !== "explore") {
          V.UI.toast("Conclua ou saia do desafio antes de editar o cen\xE1rio.");
          return;
        }
        if (V.Dialogue.active) {
          V.UI.toast("Termine a conversa antes de abrir o ateli\xEA.");
          return;
        }
        V.UI.close();
        C.playerStand();
        this.returnScreen = V.Game.screen;
        this.returnMap = V.Game.screen === "game" ? W.current?.id : null;
        this.returnFocus = document.activeElement;
        this.baseline = copy(C.layouts);
        this.drafts = copy(this.baseline);
        this.previousDraft = V.Save.read("scene-draft", null);
        this.wroteDraft = false;
        this.mapId = this.returnMap || "hub";
        this.active = true;
        V.modal = true;
        this.walk = false;
        this.selection = null;
        this.history = [];
        this.future = [];
        V.Input.clear();
        this.mount();
        this.refresh(true);
      },
      mount() {
        const root = V.$("#editor-root");
        root.hidden = false;
        root.innerHTML = `<section class="scene-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title"><header class="editor-header"><div class="editor-brand"><img src="assets/ui/interface/scene.svg" alt="" width="32" height="32"><div><small>VOICES \xB7 ATELI\xCA DO BAIRRO</small><h2 id="editor-title">Cuidar do cen\xE1rio</h2></div></div><label class="editor-map-field"><span>Cen\xE1rio</span><select id="editor-map">${order.map((id) => `<option value="${id}">${esc(W.maps[id].name.split(" \xB7 ")[0])}</option>`).join("")}</select></label><div class="editor-file-actions"><button id="editor-resume" class="secondary" ${this.previousDraft ? "" : "hidden"}>Retomar rascunho</button><button id="editor-import" class="secondary">Importar</button><button id="editor-export" class="secondary">Exportar JSON</button><button id="editor-apply" class="primary">Aplicar ao jogo</button><button id="editor-close" class="quiet" aria-label="Fechar editor e manter rascunho">Fechar editor</button></div><input id="editor-file" type="file" accept=".json,application/json" hidden></header><nav class="editor-tools" aria-label="Ferramentas do editor"><div class="editor-tool-group">${[["select", "Selecionar", "V"], ["add", "Colocar", "B"], ["interaction", "Intera\xE7\xE3o", "N"], ["path", "Caminho", "P"], ["pan", "Mover vista", "H"]].map(([id, name, key]) => `<button data-editor-tool="${id}" aria-pressed="${id === this.tool}">${name}<kbd>${key}</kbd></button>`).join("")}</div><div class="editor-tool-group"><button id="editor-undo" title="Desfazer (Ctrl+Z)">\u21B6 Desfazer</button><button id="editor-redo" title="Refazer (Ctrl+Shift+Z)">\u21B7 Refazer</button><button id="editor-walk">Testar caminhada</button></div><div class="editor-tool-group editor-view-options"><label><input id="editor-grid" type="checkbox" ${this.grid ? "checked" : ""}>Grade</label><label><input id="editor-collisions" type="checkbox" ${this.collisions ? "checked" : ""}>Colis\xF5es</label><label><input id="editor-floors" type="checkbox" ${this.floors ? "checked" : ""}>Selecionar pisos</label><label><input id="editor-routes" type="checkbox" ${this.routes ? "checked" : ""}>Atividades</label><label>Encaixe<select id="editor-snap"><option value="1">1 bloco</option><option value="0.5">\xBD bloco</option><option value="0.25">\xBC bloco</option><option value="0">Livre</option></select></label><button id="editor-fit">Enquadrar</button><button id="editor-help-open" aria-label="Ajuda do editor">?</button></div></nav><div class="editor-workspace"><aside class="editor-palette"><div class="editor-panel-title"><h3>Objetos do bairro</h3><button id="editor-palette-toggle" class="quiet" aria-label="Recolher cat\xE1logo">\u2212</button></div><div id="editor-catalog-body"><label class="editor-search"><span class="sr-only">Buscar objetos</span><input id="editor-search" type="search" placeholder="Banco, livro, tabuleiro\u2026" autocomplete="off"></label><label class="editor-category"><span class="sr-only">Filtrar cat\xE1logo</span><select id="editor-category"><option value="scene">Novos m\xF3veis</option><option value="all">Todos os objetos</option>${[...new Set(V.sceneAssets.map((a) => a.category))].map((x) => `<option value="${x}">${x[0].toUpperCase() + x.slice(1)}</option>`).join("")}</select></label><p id="editor-catalog-count" class="editor-muted"></p><div id="editor-palette-list" class="editor-palette-list"></div><p class="editor-muted">Escolha um objeto e toque no cen\xE1rio. Arraste para organizar.</p></div></aside><main class="editor-view"><canvas id="editor-canvas" width="960" height="700" tabindex="0" aria-label="Editor de cen\xE1rio. Arraste objetos; use Tab para acessar as propriedades. F2 abre o editor, Ctrl Z desfaz."></canvas><div id="editor-walk-help" class="editor-walk-help" hidden><strong>Visita de teste</strong><span>WASD ou setas \xB7 E examina uma intera\xE7\xE3o \xB7 Esc volta \xE0 edi\xE7\xE3o</span><button id="editor-walk-stop">Voltar \xE0 edi\xE7\xE3o</button></div><div class="editor-zoom"><button id="editor-zoom-out" aria-label="Diminuir zoom">\u2212</button><output id="editor-zoom-value">100%</output><button id="editor-zoom-in" aria-label="Aumentar zoom">+</button></div></main><aside class="editor-inspector"><div class="editor-panel-title"><h3>Organizar este lugar</h3></div><div id="editor-inspector-content"></div><section class="editor-validation"><h4>Circula\xE7\xE3o e acesso</h4><div id="editor-check" aria-live="polite"></div><button id="editor-check-button" class="secondary">Revisar caminhos</button></section><section class="editor-map-actions"><button id="editor-reset" class="quiet">Restaurar este cen\xE1rio</button><p class="editor-muted">O ateli\xEA guarda o cen\xE1rio em separado da aventura. Exportar permite compartilhar ou manter outra vers\xE3o.</p></section></aside></div><footer class="editor-status"><span id="editor-status-text" role="status">Arraste um objeto ou escolha um no cat\xE1logo.</span><span id="editor-coordinates">0, 0</span><span id="editor-dirty">Mapa atual do jogo</span></footer><div id="editor-help" class="editor-sheet" hidden><div role="dialog" aria-modal="true" aria-labelledby="editor-help-title"><h3 id="editor-help-title">Uma composi\xE7\xE3o com inten\xE7\xE3o</h3><p>Mantenha uma entrada vis\xEDvel, caminhos livres e m\xF3veis ligados a uma atividade. Um banco pode olhar para a fonte; uma bancada fica junto \xE0s ferramentas de quem trabalha nela.</p><ul><li>Selecione e arraste objetos, NPCs ou intera\xE7\xF5es. Use as setas para ajustes pequenos.</li><li><b>Colocar:</b> escolha no cat\xE1logo e clique para inserir. <b>Intera\xE7\xE3o:</b> acrescente um banco us\xE1vel, aviso, livro de consulta ou instrumento.</li><li><b>Caminho:</b> arraste um ret\xE2ngulo para pavimentar. Ajuste tamanho e posi\xE7\xE3o nas propriedades.</li><li>Segure Espa\xE7o ou use Mover vista para deslocar a c\xE2mera. A roda do mouse amplia perto do cursor.</li><li>Ctrl+Z desfaz; Ctrl+Shift+Z ou Ctrl+Y refaz; Ctrl+D duplica m\xF3veis e intera\xE7\xF5es opcionais; R gira 90\xB0 (Shift+R gira ao contr\xE1rio); Delete apaga o selecionado. Esc cancela o gesto, solta a sele\xE7\xE3o ou sai do teste de caminhada; o editor continua aberto.</li><li>Objetos originais tamb\xE9m podem ser apagados. Entradas, personagens e intera\xE7\xF5es essenciais para a hist\xF3ria ou quests t\xEAm remo\xE7\xE3o protegida. Clique no vazio ou em Desselecionar para soltar; marque Selecionar pisos para editar pavimenta\xE7\xE3o.</li><li>Aplicar verifica as mudan\xE7as e as entradas conectadas. Se um caminho ficar bloqueado, o ateli\xEA indica onde corrigir.</li></ul><button id="editor-help-close" class="primary">Voltar ao ateli\xEA</button></div></div></section>`;
        V.$("#editor-map").value = this.mapId;
        V.$("#editor-snap").value = String(this.snap);
        V.$("#editor-category").value = this.category;
        V.$("#editor-map").onchange = (e) => {
          this.walk = false;
          this.mapId = e.target.value;
          this.selection = null;
          this.refresh(true);
        };
        V.$("#editor-resume").onclick = () => this.resumeDraft();
        V.$("#editor-close").onclick = () => this.close();
        V.$("#editor-apply").onclick = () => this.apply();
        V.$("#editor-export").onclick = () => {
          V.Save.download("voices-cenarios-v1.6.json", D.document(this.drafts));
          this.message("Cen\xE1rios exportados. O progresso da aventura n\xE3o entra neste arquivo.");
        };
        V.$("#editor-import").onclick = () => V.$("#editor-file").click();
        V.$("#editor-file").onchange = async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            if (file.size > 8e6) throw Error("O limite \xE9 8 MB.");
            this.import(JSON.parse(await file.text()));
          } catch (err) {
            this.message("N\xE3o foi poss\xEDvel importar: " + err.message);
          }
          e.target.value = "";
        };
        V.$$("[data-editor-tool]").forEach((button) => button.onclick = () => this.setTool(button.dataset.editorTool));
        V.$("#editor-undo").onclick = () => this.undo();
        V.$("#editor-redo").onclick = () => this.redo();
        V.$("#editor-walk").onclick = () => this.toggleWalk();
        V.$("#editor-walk-stop").onclick = () => this.toggleWalk(false);
        V.$("#editor-search").oninput = () => this.palette();
        V.$("#editor-category").onchange = (e) => {
          this.category = e.target.value;
          this.palette();
        };
        for (const name of ["grid", "collisions", "routes", "floors"]) V.$("#editor-" + name).onchange = (e) => {
          this[name] = e.target.checked;
          this.paint();
        };
        V.$("#editor-snap").onchange = (e) => this.snap = +e.target.value;
        V.$("#editor-fit").onclick = () => this.fit();
        V.$("#editor-zoom-out").onclick = () => this.zoomAt(this.zoom / 1.25);
        V.$("#editor-zoom-in").onclick = () => this.zoomAt(this.zoom * 1.25);
        V.$("#editor-check-button").onclick = () => {
          this.check();
          this.collisions = !this.result.ok;
          V.$("#editor-collisions").checked = this.collisions;
          this.paint();
        };
        V.$("#editor-help-open").onclick = () => {
          V.$("#editor-help").hidden = false;
          V.$("#editor-help-close").focus();
        };
        V.$("#editor-help-close").onclick = () => {
          V.$("#editor-help").hidden = true;
          V.$("#editor-help-open").focus();
        };
        V.$("#editor-palette-toggle").onclick = () => {
          const body = V.$("#editor-catalog-body");
          body.hidden = !body.hidden;
          V.$("#editor-palette-toggle").textContent = body.hidden ? "+" : "\u2212";
        };
        V.$("#editor-reset").onclick = () => this.reset();
        const canvas = V.$("#editor-canvas");
        canvas.onpointerdown = (e) => this.pointerDown(e);
        canvas.onpointermove = (e) => this.pointerMove(e);
        canvas.onpointerup = (e) => this.pointerUp(e);
        canvas.onpointercancel = (e) => this.pointerCancel(e);
        canvas.oncontextmenu = (e) => {
          e.preventDefault();
          this.deselect();
        };
        canvas.onwheel = (e) => {
          e.preventDefault();
          const point = this.canvasPoint(e);
          this.zoomAt(this.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15), point);
        };
        this.resize();
        this.palette();
        this.setTool(this.tool);
        canvas.focus();
      },
      resize() {
        if (!this.active) return;
        const canvas = V.$("#editor-canvas"), box = canvas.parentElement;
        canvas.width = Math.max(280, Math.round(box.clientWidth || 960));
        canvas.height = Math.max(300, Math.round(box.clientHeight || 650));
        if (this.image) this.fit();
      },
      palette() {
        const q = (V.$("#editor-search")?.value || "").trim().toLocaleLowerCase("pt-BR"), assets = V.sceneAssets.map((a, i) => ({ ...a, position: i })).filter((a) => (this.category === "all" || this.category === "scene" && ["scene", "expanded", "neighborhood", "beach", "neighbors", "atelier", "furnishings", "regional", "fountain", "campus", "portrait-display"].includes(a.family) || a.category === this.category) && (!q || a.name.toLocaleLowerCase("pt-BR").includes(q)));
        V.$("#editor-catalog-count").textContent = assets.length + " objetos \xB7 artes locais";
        V.$("#editor-palette-list").innerHTML = assets.length ? assets.map((a) => `<button class="editor-asset ${a.position === this.asset ? "selected" : ""}" data-editor-asset="${a.position}" aria-pressed="${a.position === this.asset}"><canvas width="64" height="64" aria-hidden="true"></canvas><span>${esc(a.name)}</span></button>`).join("") : '<p class="editor-muted">Nenhum objeto com esse nome. Tente outra busca.</p>';
        V.$$("[data-editor-asset]").forEach((button) => {
          const i = +button.dataset.editorAsset, a = V.sceneAssets[i], canvas = button.querySelector("canvas"), ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = false;
          C.prop(ctx, a.family, a.index, 4, 4, 56);
          button.onclick = () => {
            this.asset = i;
            this.setTool(a.family === "floor" ? "floor" : this.tool === "interaction" ? "interaction" : "add");
            this.inspector();
            this.palette();
            this.message(a.name + " selecionado. Toque no cen\xE1rio para colocar.");
          };
        });
      },
      design() {
        return this.drafts[this.mapId];
      },
      capture() {
        return copy(this.design());
      },
      record(before, label) {
        const after = this.capture();
        if (JSON.stringify(before) === JSON.stringify(after)) return false;
        this.history.push({ map: this.mapId, before, after, label });
        if (this.history.length > 80) this.history.shift();
        this.future = [];
        this.saveDraft();
        this.updateHistory();
        this.message(label);
        return true;
      },
      change(label, fn) {
        const before = this.capture();
        fn(this.design());
        this.record(before, label);
        this.refresh();
      },
      resumeDraft() {
        if (!this.previousDraft || this.wroteDraft) return;
        try {
          this.import(this.previousDraft);
          V.$("#editor-resume").hidden = true;
          this.message("Rascunho recuperado. Revise os cen\xE1rios antes de aplicar.");
        } catch (err) {
          this.message("N\xE3o foi poss\xEDvel recuperar o rascunho. " + err.message);
        }
      },
      saveDraft() {
        const status = V.$("#editor-dirty");
        if (JSON.stringify(this.drafts) === JSON.stringify(this.baseline)) {
          if (this.wroteDraft) {
            if (this.previousDraft) V.Save.write("scene-draft", this.previousDraft);
            else V.Save.remove("scene-draft");
            this.wroteDraft = false;
            V.$("#editor-resume").hidden = !this.previousDraft;
          }
          status.textContent = "Mapa atual do jogo";
          return;
        }
        const ok = V.Save.write("scene-draft", D.document(this.drafts));
        this.wroteDraft = true;
        V.$("#editor-resume").hidden = true;
        status.textContent = ok ? "Rascunho guardado neste navegador" : "Exporte para guardar o rascunho";
      },
      updateHistory() {
        V.$("#editor-undo").disabled = !this.history.length;
        V.$("#editor-redo").disabled = !this.future.length;
      },
      undo() {
        const item = this.history.pop();
        if (!item) return;
        this.future.push(item);
        this.drafts[item.map] = copy(item.before);
        this.mapId = item.map;
        this.selection = null;
        V.$("#editor-map").value = this.mapId;
        this.saveDraft();
        this.refresh();
        this.message("Desfeito: " + item.label);
      },
      redo() {
        const item = this.future.pop();
        if (!item) return;
        this.history.push(item);
        this.drafts[item.map] = copy(item.after);
        this.mapId = item.map;
        this.selection = null;
        V.$("#editor-map").value = this.mapId;
        this.saveDraft();
        this.refresh();
        this.message("Refeito: " + item.label);
      },
      import(doc) {
        const maps = D.normalise(doc);
        for (const [id, d] of Object.entries(maps)) {
          const before = copy(this.drafts[id]);
          this.drafts[id] = d;
          this.history.push({ map: id, before, after: copy(d), label: "Importar cen\xE1rio" });
        }
        this.future = [];
        this.selection = null;
        this.saveDraft();
        this.refresh();
        this.message(Object.keys(maps).length + " cen\xE1rios importados como rascunho. Revise antes de aplicar.");
      },
      reset() {
        this.change("Restaurar a composi\xE7\xE3o original", (d) => {
          this.drafts[this.mapId] = copy(D.defaults[this.mapId]);
          this.selection = null;
        });
      },
      mapChanged(id) {
        return !same(this.drafts[id], this.baseline?.[id]);
      },
      buildPreview(design = this.design()) {
        return D.editorPreview(this.mapId, design, this.baseline?.[this.mapId]);
      },
      refresh(fit = false) {
        this.preview = this.buildPreview();
        this.image = this.renderWorld();
        this.check();
        if (fit) this.fit();
        else this.paint();
        this.inspector();
        this.updateHistory();
        V.$("#editor-walk-help").hidden = !this.walk;
        V.$("#editor-walk").textContent = this.walk ? "Voltar \xE0 edi\xE7\xE3o" : "Testar caminhada";
      },
      renderWorld() {
        const canvas = document.createElement("canvas"), m = this.preview;
        canvas.width = m.width * T;
        canvas.height = m.height * T;
        const ctx = canvas.getContext("2d"), old = { map: W.current, camera: W.camera, transition: W.transition, canvas: V.Engine.canvas, state: V.state, player: V.Player.data, playerRender: V.Player.render, mini: W.drawMiniMap, particles: V.Engine.particles, scan: V.Game.scanTarget };
        W.current = m;
        W.camera = { x: 0, y: 0 };
        W.transition = 0;
        V.Engine.canvas = canvas;
        V.state = old.state ? copy(old.state) : D.previewState();
        V.state.flags.prologueStarted = false;
        V.Player.data = { x: m.width * T / 2, y: (m.height - 4) * T, dir: 0 };
        V.Player.render = () => {
        };
        W.drawMiniMap = () => {
        };
        V.Engine.particles = [];
        V.Game.scanTarget = null;
        try {
          C.render(ctx);
        } finally {
          W.current = old.map;
          W.camera = old.camera;
          W.transition = old.transition;
          V.Engine.canvas = old.canvas;
          V.state = old.state;
          V.Player.data = old.player;
          V.Player.render = old.playerRender;
          W.drawMiniMap = old.mini;
          V.Engine.particles = old.particles;
          V.Game.scanTarget = old.scan;
        }
        return canvas;
      },
      fit() {
        const canvas = V.$("#editor-canvas");
        this.zoom = Math.min((canvas.width - 40) / this.image.width, (canvas.height - 40) / this.image.height);
        this.zoom = V.clamp(this.zoom, 0.15, 2.5);
        this.pan = { x: (canvas.width - this.image.width * this.zoom) / 2, y: (canvas.height - this.image.height * this.zoom) / 2 };
        this.paint();
      },
      zoomAt(next, point = null) {
        const canvas = V.$("#editor-canvas"), at = point || { x: canvas.width / 2, y: canvas.height / 2 }, world = { x: (at.x - this.pan.x) / this.zoom, y: (at.y - this.pan.y) / this.zoom }, zoom = V.clamp(next, 0.15, 2.5);
        this.pan = { x: at.x - world.x * zoom, y: at.y - world.y * zoom };
        this.zoom = zoom;
        this.paint();
      },
      refs() {
        const d = this.design(), m = this.preview;
        return d.decor.map((row, i) => ({ kind: "decor", id: row[6]?.id, index: i, x: row[2], y: row[3], w: row[4], h: row[4], name: D.asset(row[0], row[1])?.name || "Adere\xE7o" })).concat(m.objects.filter((o) => o.scene?.kind !== "conversation" && (!o.collectionOnly || V.BuildingSigns.isSign(o)) && !(o.hub && o.character === "pix" && !o.tasks) && o.type !== "door").map((o) => {
          const scene = o.type === "cozy" && d.scenes.find((s) => s.id === o.scene?.id), size = scene?.size || 1;
          return { kind: scene ? "scene" : "object", id: scene?.id || o.id, x: scene ? scene.x : d.positions?.[o.id]?.[0] ?? o.x / T - 0.5, y: scene ? scene.y : d.positions?.[o.id]?.[1] ?? o.y / T - 0.5, w: size, h: size, name: o.label || o.id, object: o, scene };
        }), (d.paths || []).map((row, index) => ({ kind: "path", id: "path-" + index, index, x: row[0], y: row[1], w: row[2], h: row[3], name: "Caminho pavimentado" })), d.meeting ? [{ kind: "meeting", id: "meeting", x: d.meeting[0], y: d.meeting[1], w: 1, h: 1, name: "Ponto de conversa" }] : []);
      },
      find(ref = this.selection) {
        return ref ? this.refs().find((r) => r.kind === ref.kind && r.id === ref.id) : null;
      },
      bounds(ref) {
        if (["decor", "path"].includes(ref.kind)) return { x: ref.x * T, y: ref.y * T, w: ref.w * T, h: ref.h * T };
        if (ref.kind === "meeting") return { x: ref.x * T, y: ref.y * T, w: T, h: T };
        return { x: ref.x * T + 24 - ref.w * T / 2, y: ref.y * T + 24 - ref.h * T * 0.79, w: ref.w * T, h: ref.h * T };
      },
      hit(point) {
        const refs = this.refs().filter((r) => r.kind !== "path" && (r.kind !== "meeting" || this.routes));
        for (let i = refs.length - 1; i >= 0; i--) {
          const r = refs[i], a = this.bounds(r);
          if (point.x >= a.x && point.x <= a.x + a.w && point.y >= a.y && point.y <= a.y + a.h) return r;
        }
        return this.refs().filter((r) => r.kind === "path").reverse().find((r) => {
          const a = this.bounds(r);
          return point.x >= a.x && point.x <= a.x + a.w && point.y >= a.y && point.y <= a.y + a.h;
        }) || null;
      },
      canvasPoint(e) {
        const canvas = V.$("#editor-canvas"), r = canvas.getBoundingClientRect();
        return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height };
      },
      worldPoint(e) {
        const at = this.canvasPoint(e);
        return { x: (at.x - this.pan.x) / this.zoom, y: (at.y - this.pan.y) / this.zoom };
      },
      rounded(n) {
        return this.snap ? Math.round(n / this.snap) * this.snap : Math.round(n * 100) / 100;
      },
      inside(x, y) {
        const m = this.preview;
        return x >= T && y >= T * 2 && x < (m.width - 1) * T && y < (m.height - 1) * T;
      },
      pointerDown(e) {
        if (this.drag || e.button !== void 0 && ![0, 1].includes(e.button)) return;
        const canvas = V.$("#editor-canvas");
        canvas.focus();
        canvas.setPointerCapture?.(e.pointerId);
        const point = this.worldPoint(e), screen = this.canvasPoint(e);
        if (this.walk) {
          this.message("Use WASD ou setas para testar o caminho.");
          return;
        }
        if (this.tool === "pan" || V.Input.keys.has(" ") || e.button === 1) {
          this.drag = { kind: "pan", pointerId: e.pointerId, start: screen, pan: { ...this.pan } };
          return;
        }
        if (!this.inside(point.x, point.y)) {
          if (this.tool === "select") this.deselect();
          return;
        }
        if (this.tool === "add" || this.tool === "interaction") {
          this.place(point.x / T, point.y / T);
          return;
        }
        if (this.tool === "path") {
          this.drag = { kind: "path", pointerId: e.pointerId, start: point, current: point, before: this.capture() };
          this.paint();
          return;
        }
        const ref = this.hit(point);
        this.selection = ref ? { kind: ref.kind, id: ref.id } : null;
        if (ref) this.drag = { kind: "move", pointerId: e.pointerId, ref, start: point, before: this.capture(), x: ref.x, y: ref.y, dx: 0, dy: 0 };
        this.inspector();
        this.paint();
      },
      pointerMove(e) {
        if (this.drag && this.drag.pointerId !== e.pointerId) return;
        const point = this.worldPoint(e);
        V.$("#editor-coordinates").textContent = (point.x / T).toFixed(1) + " \xB7 " + (point.y / T).toFixed(1);
        if (!this.drag) return;
        if (this.drag.kind === "pan") {
          const at = this.canvasPoint(e);
          this.pan = { x: this.drag.pan.x + at.x - this.drag.start.x, y: this.drag.pan.y + at.y - this.drag.start.y };
          this.paint();
          return;
        }
        if (this.drag.kind === "path") {
          this.drag.current = point;
          this.paint();
          return;
        }
        const ref = this.drag.ref, m = this.preview, dx = this.rounded((point.x - this.drag.start.x) / T), dy = this.rounded((point.y - this.drag.start.y) / T), x = V.clamp(this.drag.x + dx, 1, m.width - 1 - (["decor", "path"].includes(ref.kind) ? ref.w : 0)), y = V.clamp(this.drag.y + dy, 2, m.height - 1 - (["decor", "path"].includes(ref.kind) ? ref.h : 0));
        this.move(ref, x, y, false);
        this.drag.dx = x - this.drag.x;
        this.drag.dy = y - this.drag.y;
        const now = Date.now();
        if (!this.dragFrame || now - this.dragFrame > 45) {
          const ground = this.preview.cache;
          this.preview = this.buildPreview();
          if (ref.kind !== "path") this.preview.cache = ground;
          this.image = this.renderWorld();
          this.dragFrame = now;
        }
        this.paint();
      },
      pointerUp(e) {
        if (!this.drag || this.drag.pointerId !== e.pointerId) return;
        const drag = this.drag;
        this.drag = null;
        if (drag.kind === "move") {
          this.record(drag.before, "Mover " + drag.ref.name);
          this.refresh();
        } else if (drag.kind === "path") {
          const end = this.worldPoint(e), m = this.preview, x = this.rounded(Math.min(drag.start.x, end.x) / T), y = this.rounded(Math.min(drag.start.y, end.y) / T), width = Math.max(0.5, this.rounded(Math.abs(end.x - drag.start.x) / T)), height = Math.max(0.5, this.rounded(Math.abs(end.y - drag.start.y) / T));
          if (x >= 1 && y >= 2 && x + width <= m.width - 1 && y + height <= m.height - 1) {
            const d = this.design();
            d.paths = d.paths || [];
            d.paths.push([x, y, width, height]);
            this.selection = { kind: "path", id: "path-" + (d.paths.length - 1) };
            this.record(drag.before, "Pavimentar um caminho");
            this.refresh();
          } else {
            this.paint();
            this.message("O caminho precisa ficar dentro da \xE1rea do cen\xE1rio.");
          }
        }
        V.$("#editor-canvas").releasePointerCapture?.(e.pointerId);
      },
      pointerCancel(e) {
        if (this.drag && this.drag.pointerId !== e.pointerId) return;
        if (this.drag?.before) this.drafts[this.mapId] = this.drag.before;
        this.drag = null;
        this.refresh();
      },
      move(ref, x, y, record = true) {
        const d = this.design(), before = record ? this.capture() : null, current = this.find(ref) || ref;
        let dx = x - current.x, dy = y - current.y;
        if (ref.kind === "decor") {
          const row = d.decor[ref.index], linked = (d.anchors || []).filter((a) => (row[6]?.anchorIds || []).includes(a[0])).map((a) => [a[1], a[2]]).concat((row[6]?.objectIds || []).map((id) => d.positions[id]).filter(Boolean), (d.scenes || []).filter((s) => (row[6]?.sceneIds || []).includes(s.id)).map((s) => [s.x, s.y]));
          let shiftX = dx, shiftY = dy;
          for (const point of linked) {
            shiftX = V.clamp(shiftX, 1 - point[0], this.preview.width - 1 - point[0]);
            shiftY = V.clamp(shiftY, 2 - point[1], this.preview.height - 1 - point[1]);
          }
          dx = shiftX;
          dy = shiftY;
          x = current.x + dx;
          y = current.y + dy;
          row[2] = x;
          row[3] = y;
          for (const key of row[6]?.anchorIds || []) for (const a of d.anchors || []) if (a[0] === key) {
            a[1] += dx;
            a[2] += dy;
          }
          for (const key of row[6]?.sceneIds || []) {
            const linked2 = d.scenes.find((s) => s.id === key);
            if (linked2) {
              linked2.x += dx;
              linked2.y += dy;
            }
          }
          for (const key of row[6]?.objectIds || []) {
            const object = this.preview.objects.find((o) => o.id === key), pos = d.positions[key] || [object.x / T - 0.5, object.y / T - 0.5];
            d.positions[key] = [pos[0] + dx, pos[1] + dy];
          }
        } else if (ref.kind === "scene") {
          const a = d.scenes.find((s) => s.id === ref.id);
          if (a.hostDecor) {
            const host = d.decor.find((r) => r[6]?.id === a.hostDecor);
            if (host) {
              const hostRef = this.refs().find((r) => r.kind === "decor" && r.id === a.hostDecor);
              this.move(hostRef, host[2] + dx, host[3] + dy, false);
            }
          } else {
            a.x = x;
            a.y = y;
          }
        } else if (ref.kind === "path") {
          d.paths[ref.index][0] = x;
          d.paths[ref.index][1] = y;
        } else if (ref.kind === "meeting") d.meeting = [x, y];
        else {
          d.positions = d.positions || {};
          d.positions[ref.id] = [x, y];
        }
        if (record) {
          this.record(before, "Mover " + ref.name);
          this.refresh();
        }
      },
      place(x, y) {
        const a = V.sceneAssets[this.asset];
        if (!a) return;
        const m = this.preview, before = this.capture(), d = this.design(), id = "custom-" + Date.now().toString(36) + "-" + ++this.uid, size = ["community-details", "apartment-details"].includes(a.family) || a.family.startsWith("collection-") ? a.size : a.family === "scene" ? 1.5 : 1.25;
        x = V.clamp(this.rounded(x - (this.tool === "interaction" ? 0.5 : size / 2)), 1, m.width - size - 1);
        y = V.clamp(this.rounded(y - (this.tool === "interaction" ? 0.5 : size / 2)), 2, m.height - size - 1);
        if (this.tool === "interaction") {
          const kind = this.interactionKind || (a.interaction === "sit" || /banco|cadeira|poltrona|sofá|pufe|almofadas|banqueta/i.test(a.name) ? "seat" : /livro|leitura|estante/i.test(a.name) ? "shelf" : /violão|musical|instrumento|berimbau|atabaque|agogô|reco.reco|xequerê|cuíca|djembe|ilú/i.test(a.name) ? "instrument" : "notice"), item = { id, kind, x, y, family: a.family, prop: a.index, size, title: kind === "seat" ? "Descansar aqui" : a.name, text: kind === "instrument" ? "Experimento musical original do jogo." : kind === "shelf" ? "Escolha uma leitura do acervo e consulte as fontes." : a.description || a.name, dir: a.index === 2 ? 2 : a.index === 3 ? 1 : a.index === 1 ? 3 : 0 };
          d.scenes.push(item);
          this.selection = { kind: "scene", id };
        } else {
          d.decor.push([a.family, a.index, x, y, size, a.solid, { id, layer: a.layer || "object" }]);
          this.selection = { kind: "decor", id };
        }
        this.record(before, "Colocar " + a.name);
        this.refresh();
      },
      remove() {
        const ref = this.find();
        if (!ref) return;
        if (!["decor", "path"].includes(ref.kind) && !(ref.kind === "scene" && !D.protectedRef(this.mapId, ref))) {
          this.message("Esta intera\xE7\xE3o pertence \xE0 aventura. Voc\xEA pode mudar sua posi\xE7\xE3o.");
          return;
        }
        this.change("Remover " + ref.name, (d) => {
          if (ref.kind === "decor") d.decor.splice(ref.index, 1);
          else if (ref.kind === "path") d.paths.splice(ref.index, 1);
          else d.scenes = d.scenes.filter((s) => s.id !== ref.id);
          this.selection = null;
        });
      },
      duplicate() {
        const ref = this.find();
        if (!ref || !["decor", "path"].includes(ref.kind) && !(ref.kind === "scene" && !D.protectedRef(this.mapId, ref))) {
          this.message("Selecione um adere\xE7o, caminho ou intera\xE7\xE3o criada no ateli\xEA.");
          return;
        }
        this.change("Duplicar " + ref.name, (d) => {
          const id = "custom-" + Date.now().toString(36) + "-" + ++this.uid, m = this.preview;
          if (ref.kind === "decor") {
            const row = copy(d.decor[ref.index]);
            row[2] = Math.min(row[2] + 1, m.width - row[4] - 1);
            row[3] = Math.min(row[3] + 1, m.height - row[4] - 1);
            row[6] = { id, rotation: row[6]?.rotation || 0, flip: !!row[6]?.flip, layer: row[6]?.layer || "object" };
            d.decor.push(row);
            this.selection = { kind: "decor", id };
          } else if (ref.kind === "path") {
            const row = copy(d.paths[ref.index]);
            row[0] = Math.min(row[0] + 1, m.width - row[2] - 1);
            row[1] = Math.min(row[1] + 1, m.height - row[3] - 1);
            d.paths.push(row);
            this.selection = { kind: "path", id: "path-" + (d.paths.length - 1) };
          } else {
            const a = copy(d.scenes.find((s) => s.id === ref.id));
            a.id = id;
            delete a.hostDecor;
            delete a.cultureMissions;
            delete a.cultureTopic;
            delete a.essential;
            a.x = Math.min(a.x + 1, m.width - 2);
            a.y = Math.min(a.y + 1, m.height - 2);
            d.scenes.push(a);
            this.selection = { kind: "scene", id };
          }
        });
      },
      inspector() {
        const root = V.$("#editor-inspector-content"), ref = this.find();
        if (!ref) {
          root.innerHTML = `<div class="editor-purpose"><small>INTEN\xC7\xC3O DO LUGAR</small><p>${esc(this.design().purpose)}</p></div><p class="editor-muted">Selecione um objeto no cen\xE1rio. As propriedades aparecem aqui.</p><label class="field">Nova intera\xE7\xE3o<select id="editor-new-kind"><option value="notice">Aviso ou nota</option><option value="seat">Banco para sentar</option><option value="shelf">Consulta de livros</option><option value="instrument">Instrumento musical</option><option value="catalog">Cat\xE1logo do acervo</option></select></label><p class="editor-muted">Escolha Intera\xE7\xE3o, um visual no cat\xE1logo e um lugar para coloc\xE1-la.</p><div class="editor-object-list"><h4>Pessoas e intera\xE7\xF5es</h4>${this.refs().filter((r) => !["decor", "path"].includes(r.kind)).map((r) => `<button class="quiet" data-editor-select="${esc(r.kind + "|" + r.id)}">${esc(r.name)}</button>`).join("")}</div>`;
          V.$("#editor-new-kind").value = this.interactionKind || "notice";
          V.$("#editor-new-kind").onchange = (e) => {
            this.interactionKind = e.target.value;
            this.setTool("interaction");
          };
          V.$$("[data-editor-select]").forEach((button) => button.onclick = () => {
            const [kind, id] = button.dataset.editorSelect.split("|");
            this.selection = { kind, id };
            this.setTool("select");
            this.inspector();
            this.paint();
          });
          return;
        }
        const d = this.design(), row = ref.kind === "decor" ? d.decor[ref.index] : null, scene = ref.kind === "scene" ? d.scenes.find((s) => s.id === ref.id) : null, host = scene && D.hostDecor(d, scene), decor = row || host, style = decor?.[6] || scene || d.objectEdits?.[ref.id] || {}, editable = !!(row || scene || ref.kind === "object"), collision = !!(decor || scene?.family), protectedItem = ref.kind === "object" || scene && !scene.id.startsWith("custom-"), person = ref.object && C.person(ref.object);
        root.innerHTML = `<strong class="editor-selection-title">${esc(ref.name)}</strong><small class="editor-muted">${person ? "Pessoa do bairro" : ref.kind === "scene" ? "Intera\xE7\xE3o" : ref.kind === "path" ? "Pavimenta\xE7\xE3o" : ref.kind === "meeting" ? "Conversa entre moradores" : "Adere\xE7o"}</small>${protectedItem ? '<p class="editor-protected">Ligado \xE0 aventura: a fun\xE7\xE3o ser\xE1 preservada.</p>' : ""}<div class="editor-two-fields"><label class="field">Horizontal<input id="editor-x" type="number" min="1" step="0.25" value="${ref.x}"></label><label class="field">Vertical<input id="editor-y" type="number" min="2" step="0.25" value="${ref.y}"></label></div>${row || scene ? `<label class="field">Tamanho <span class="editor-muted">em blocos</span><input id="editor-size" type="number" min="0.5" max="12" step="0.25" value="${row ? row[4] : scene.size || 1}"></label>` : ""}${row ? `<label class="field">Rota\xE7\xE3o<select id="editor-rotation">${[0, 90, 180, 270].map((n) => `<option value="${n}">${n}\xB0</option>`).join("")}</select></label>` : ""}${editable ? `<label class="editor-checkbox"><input id="editor-flip" type="checkbox" ${style.flip ? "checked" : ""}>Espelhar desenho</label><label class="field">Camada<select id="editor-layer">${Object.entries(D.layers).map(([id, label]) => '<option value="' + id + '">' + label + "</option>").join("")}</select></label>` : ""}${collision ? `<label class="editor-checkbox"><input id="editor-solid" type="checkbox" ${(decor ? decor[5] : this.preview.solids.some((f) => f.owner === ref.object.id || f.owner === scene.hostDecor && scene.hostDecor)) ? "checked" : ""}>Bloqueia a passagem</label>` : ""}${ref.kind === "path" ? `<div class="editor-two-fields"><label class="field">Largura<input id="editor-width" type="number" min="0.5" step="0.5" value="${ref.w}"></label><label class="field">Altura<input id="editor-height" type="number" min="0.5" step="0.5" value="${ref.h}"></label></div>` : ""}${scene ? `<label class="field">Nome da intera\xE7\xE3o<input id="editor-label" value="${esc(scene.title)}" maxlength="90"></label><label class="field">Texto de consulta<textarea id="editor-text" rows="4" maxlength="1600">${esc(scene.text || "")}</textarea></label>${scene.kind === "seat" ? '<label class="field">Dire\xE7\xE3o do assento<select id="editor-facing"><option value="0">Sul</option><option value="1">Oeste</option><option value="2">Leste</option><option value="3">Norte</option></select></label>' : ""}` : ""}${person ? `<p class="editor-muted">${esc(ref.object.resident?.role || V.content.characters[ref.object.character]?.role || "Morador")}<br>Atividades: ${esc((ref.object.tasks || []).filter((x) => !x.startsWith("home-")).map((id) => this.preview.anchors.get(id)?.object?.scene?.title || id.replace(/-/g, " ")).join(" \xB7 "))}</p>` : ""}<div class="editor-selection-actions">${row || scene ? '<button id="editor-replace" class="secondary">Usar visual do cat\xE1logo</button>' : ""}${["decor", "path"].includes(ref.kind) || scene?.id.startsWith("custom-") ? '<button id="editor-duplicate" class="secondary">Duplicar</button><button id="editor-delete" class="secondary">Remover</button>' : ""}<button id="editor-deselect" class="quiet">Soltar sele\xE7\xE3o</button></div>`;
        const updatePosition = () => {
          const x = +V.$("#editor-x").value, y = +V.$("#editor-y").value, m = this.preview;
          if (!Number.isFinite(x) || !Number.isFinite(y) || x < 1 || y < 2 || x > m.width - 1 - ref.w * (row || ref.kind === "path" ? 1 : 0) || y > m.height - 1 - ref.h * (row || ref.kind === "path" ? 1 : 0)) {
            this.message("Escolha uma posi\xE7\xE3o dentro do cen\xE1rio.");
            this.inspector();
            return;
          }
          this.move(ref, x, y);
        };
        V.$("#editor-x").onchange = updatePosition;
        V.$("#editor-y").onchange = updatePosition;
        if (row) {
          const rotation = V.$("#editor-rotation");
          rotation.onchange = (e) => this.rotate(+e.target.value, true);
          rotation.value = String(this.rotation(ref));
        }
        if (editable) {
          const layer = V.$("#editor-layer");
          layer.value = style.layer || (decor ? D.asset(decor[0], decor[1])?.layer : ref.object?.editorLayer || ref.object?.layer) || "object";
          for (const key of ["flip", "layer"]) V.$("#editor-" + key).onchange = (e) => {
            const value = key === "flip" ? e.target.checked : e.target.value;
            this.change("Ajustar " + ref.name, (draft) => {
              if (decor) {
                (decor[6] ||= {})[key] = value;
                for (const linked of D.linkedScenes(draft, decor)) linked[key] = value;
              } else if (scene) scene[key] = value;
              else {
                draft.objectEdits ||= {};
                draft.objectEdits[ref.id] = { rotation: 0, ...draft.objectEdits[ref.id], [key]: value };
              }
            });
          };
        }
        if (collision) V.$("#editor-solid").onchange = (e) => this.change("Ajustar colis\xE3o", () => {
          if (decor) decor[5] = e.target.checked;
          else scene.solid = e.target.checked;
        });
        if (scene) {
          V.$("#editor-label").onchange = (e) => this.change("Nomear intera\xE7\xE3o", () => scene.title = e.target.value.trim().slice(0, 90) || "Intera\xE7\xE3o do bairro");
          V.$("#editor-text").onchange = (e) => this.change("Editar texto", () => scene.text = e.target.value.slice(0, 1600));
          if (scene.kind === "seat") {
            V.$("#editor-facing").value = String(scene.dir || 0);
            V.$("#editor-facing").onchange = (e) => this.change("Virar assento", () => {
              scene.dir = +e.target.value;
              if (scene.family === "scene") scene.prop = { 0: 0, 1: 3, 2: 2, 3: 1 }[scene.dir];
            });
          }
        }
        if (V.$("#editor-replace")) V.$("#editor-replace").onclick = () => this.change("Trocar visual", () => {
          const asset = V.sceneAssets[this.asset];
          if (row) {
            row[0] = asset.family;
            row[1] = asset.index;
          } else {
            scene.family = asset.family;
            scene.prop = asset.index;
            if (host) {
              host[0] = asset.family;
              host[1] = asset.index;
            }
          }
        });
        if (V.$("#editor-delete")) V.$("#editor-delete").onclick = () => this.remove();
        if (V.$("#editor-duplicate")) V.$("#editor-duplicate").onclick = () => this.duplicate();
        V.$("#editor-deselect").onclick = () => {
          this.selection = null;
          this.inspector();
          this.paint();
        };
      },
      check() {
        this.result = D.validate(this.preview);
        V.$("#editor-check").innerHTML = this.result.ok ? `<p class="editor-check-good">\u2713 Entradas e intera\xE7\xF5es alcan\xE7\xE1veis.</p><small>${this.result.cells} pontos de passagem conferidos.</small>` : `<p class="editor-check-bad">${this.result.issues.length} pontos precisam de ajuste.</p><div class="editor-issues">${this.result.issues.slice(0, 8).map((x, i) => `<button data-editor-issue="${i}">${esc(x.message)}</button>`).join("")}</div>`;
        V.$$("[data-editor-issue]").forEach((button) => button.onclick = () => {
          const issue = this.result.issues[+button.dataset.editorIssue], canvas = V.$("#editor-canvas");
          this.zoom = Math.max(0.65, this.zoom);
          this.pan = { x: canvas.width / 2 - issue.x * this.zoom, y: canvas.height / 2 - issue.y * this.zoom };
          this.paint();
        });
        return this.result;
      },
      paint() {
        if (!this.active || !this.image) return;
        const canvas = V.$("#editor-canvas"), ctx = canvas.getContext("2d"), m = this.preview;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#26372f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(this.pan.x, this.pan.y);
        ctx.scale(this.zoom, this.zoom);
        ctx.drawImage(this.image, 0, 0);
        if (this.grid && !this.walk) {
          ctx.strokeStyle = "#ece1bd24";
          ctx.lineWidth = 1 / this.zoom;
          ctx.beginPath();
          for (let x = 0; x <= m.width; x++) {
            ctx.moveTo(x * T, 0);
            ctx.lineTo(x * T, m.height * T);
          }
          for (let y = 0; y <= m.height; y++) {
            ctx.moveTo(0, y * T);
            ctx.lineTo(m.width * T, y * T);
          }
          ctx.stroke();
        }
        if (this.collisions && !this.walk) {
          ctx.fillStyle = "#e77e6242";
          ctx.strokeStyle = "#ffd0a7";
          ctx.lineWidth = 1 / this.zoom;
          for (const f of m.solids) {
            ctx.fillRect(f.x, f.y, f.w, f.h);
            ctx.strokeRect(f.x, f.y, f.w, f.h);
          }
        }
        if (this.routes && !this.walk) {
          ctx.strokeStyle = "#8fdbd388";
          ctx.fillStyle = "#bbe9d9";
          ctx.lineWidth = 2 / this.zoom;
          for (const o of m.objects.filter((o2) => C.person(o2))) {
            const points = (o.tasks || []).map((id) => m.anchors.get(id)).filter(Boolean);
            ctx.beginPath();
            ctx.moveTo(o.x, o.y);
            for (const a of points) {
              ctx.lineTo(a.x, a.y);
              ctx.fillRect(a.x - 4 / this.zoom, a.y - 4 / this.zoom, 8 / this.zoom, 8 / this.zoom);
            }
            ctx.stroke();
          }
          if (m.design.meeting) {
            ctx.strokeStyle = "#eac685";
            ctx.strokeRect(m.design.meeting[0] * T, m.design.meeting[1] * T, T, T);
          }
        }
        for (const issue of this.result?.issues || []) {
          ctx.strokeStyle = "#f5a47c";
          ctx.lineWidth = 3 / this.zoom;
          ctx.strokeRect(issue.x - 25, issue.y - 40, 50, 50);
        }
        const selected = this.find();
        if (selected && !this.walk) {
          const a = this.bounds(selected);
          ctx.strokeStyle = "#ffdc92";
          ctx.lineWidth = 3 / this.zoom;
          ctx.strokeRect(a.x - 3, a.y - 3, a.w + 6, a.h + 6);
        }
        if (this.drag?.kind === "path") {
          const a = this.drag.start, z = this.drag.current;
          ctx.fillStyle = "#eacf8866";
          ctx.fillRect(Math.min(a.x, z.x), Math.min(a.y, z.y), Math.abs(a.x - z.x), Math.abs(a.y - z.y));
        }
        if (this.walk && this.visitor) {
          const p = this.visitor;
          V.Assets.sprite(ctx, V.state?.character || "nia", p.x, p.y, p.dir, p.moving ? Math.floor(p.clock * 6) % 4 : 0, 56);
          if (this.walkNear) {
            ctx.strokeStyle = "#ffe0a1";
            ctx.lineWidth = 2 / this.zoom;
            ctx.strokeRect(this.walkNear.x - 22, this.walkNear.y - 37, 44, 42);
          }
        }
        ctx.restore();
        V.$("#editor-zoom-value").textContent = Math.round(this.zoom * 100) + "%";
      },
      setTool(tool) {
        this.tool = tool;
        V.$$("[data-editor-tool]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.editorTool === tool)));
        V.$("#editor-canvas").style.cursor = tool === "pan" ? "grab" : ["add", "interaction", "path"].includes(tool) ? "crosshair" : "default";
      },
      toggleWalk(on = !this.walk) {
        this.walk = on;
        if (on) {
          this.selection = null;
          const cells = D.flood(this.preview), target = { x: this.preview.width * T / 2 + 24, y: (this.preview.height - 4) * T + 24 };
          const nearest = cells.sort((a, b) => V.dist(a, target) - V.dist(b, target))[0];
          if (!nearest) {
            this.walk = false;
            this.message("Abra um caminho no cen\xE1rio antes de testar.");
            return;
          }
          this.visitor = { ...nearest, dir: 0, clock: 0, moving: false };
          this.walkView = { zoom: this.zoom, pan: { ...this.pan } };
          this.zoom = Math.max(0.75, this.zoom);
          const canvas = V.$("#editor-canvas");
          this.pan = { x: canvas.width / 2 - nearest.x * this.zoom, y: canvas.height / 2 - nearest.y * this.zoom };
          this.message("Visita de teste ativa. A aventura permanece pausada.");
        } else if (this.walkView) {
          this.zoom = this.walkView.zoom;
          this.pan = this.walkView.pan;
          this.message("De volta \xE0 edi\xE7\xE3o.");
        }
        V.Input.clear();
        V.$("#editor-walk-help").hidden = !this.walk;
        V.$("#editor-walk").textContent = this.walk ? "Voltar \xE0 edi\xE7\xE3o" : "Testar caminhada";
        this.inspector();
        this.paint();
      },
      tick(dt) {
        if (!this.active || !this.walk || !this.visitor) return;
        const p = this.visitor, k = V.Input.keys, dx = (k.has("d") || k.has("arrowright") ? 1 : 0) - (k.has("a") || k.has("arrowleft") ? 1 : 0), dy = (k.has("s") || k.has("arrowdown") ? 1 : 0) - (k.has("w") || k.has("arrowup") ? 1 : 0), n = Math.hypot(dx, dy) || 1, speed = 140 * dt, blocked = (x2, y2) => L.blocked(this.preview, x2, y2, 11) || this.preview.objects.some((o) => C.person(o) && V.dist(o, { x: x2, y: y2 }) < 12 + 12 * (o.visualScale || 1));
        p.moving = !!(dx || dy);
        if (p.moving) {
          if (!blocked(p.x + dx / n * speed, p.y)) p.x += dx / n * speed;
          if (!blocked(p.x, p.y + dy / n * speed)) p.y += dy / n * speed;
          p.dir = Math.abs(dx) > Math.abs(dy) ? dx < 0 ? 1 : 2 : dy < 0 ? 3 : 0;
          p.clock += dt;
        }
        this.walkNear = this.preview.objects.filter((o) => o.scene?.kind !== "conversation" && !o.collectionOnly).sort((a, b) => V.dist(a, p) - V.dist(b, p)).find((o) => V.dist(o, p) < (o.interactionRange || 80));
        const canvas = V.$("#editor-canvas"), x = p.x * this.zoom + this.pan.x, y = p.y * this.zoom + this.pan.y;
        if (x < 100) this.pan.x += 100 - x;
        if (x > canvas.width - 100) this.pan.x -= x - canvas.width + 100;
        if (y < 100) this.pan.y += 100 - y;
        if (y > canvas.height - 100) this.pan.y -= y - canvas.height + 100;
        this.paint();
      },
      key(k, e) {
        if (!this.active) return;
        if (k === "tab") {
          this.trapFocus(e);
          return;
        }
        if (k === "escape") {
          e.preventDefault?.();
          if (!V.$("#editor-help").hidden) {
            V.$("#editor-help").hidden = true;
            V.$("#editor-help-open").focus();
          } else if (this.walk) this.toggleWalk(false);
          else {
            this.deselect();
            this.message("Sele\xE7\xE3o solta. Use Fechar editor para sair do ateli\xEA.");
          }
          return;
        }
        if (k === " " && e.target?.id === "editor-canvas") e.preventDefault?.();
        if (this.walk) {
          if (k.startsWith("arrow")) e.preventDefault?.();
          if (k === "e" && this.walkNear) {
            this.message((this.walkNear.label || "Intera\xE7\xE3o") + " \xB7 " + (this.walkNear.scene?.text || "Ponto da aventura alcan\xE7ado."));
          }
          return;
        }
        if (e.ctrlKey || e.metaKey) {
          if (k === "z") {
            e.preventDefault?.();
            e.shiftKey ? this.redo() : this.undo();
          } else if (k === "y") {
            e.preventDefault?.();
            this.redo();
          } else if (k === "d") {
            e.preventDefault?.();
            this.duplicate();
          } else if (k === "s") {
            e.preventDefault?.();
            this.saveDraft();
          }
          return;
        }
        if (["delete", "backspace"].includes(k)) {
          e.preventDefault?.();
          this.remove();
          return;
        }
        const directions = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] };
        if (directions[k] && this.find()) {
          e.preventDefault?.();
          const ref = this.find(), [x, y] = directions[k], step = this.snap || 0.25, m = this.preview;
          this.move(ref, V.clamp(ref.x + x * step, 1, m.width - 1 - (["decor", "path"].includes(ref.kind) ? ref.w : 0)), V.clamp(ref.y + y * step, 2, m.height - 1 - (["decor", "path"].includes(ref.kind) ? ref.h : 0)));
          return;
        }
        if (k === "enter" && e.target?.id === "editor-canvas" && ["add", "interaction"].includes(this.tool)) {
          e.preventDefault?.();
          const canvas = V.$("#editor-canvas");
          this.place((canvas.width / 2 - this.pan.x) / this.zoom / T, (canvas.height / 2 - this.pan.y) / this.zoom / T);
          return;
        }
        const tools = { v: "select", b: "add", n: "interaction", p: "path", h: "pan" };
        if (tools[k]) this.setTool(tools[k]);
      },
      trapFocus(e) {
        const sheet = V.$("#editor-help"), root = sheet.hidden ? V.$("#editor-root") : sheet, items = Array.from(root.querySelectorAll("button,input,select,textarea,canvas")).filter((x) => !x.disabled && !x.hidden && !x.closest?.("[hidden]"));
        const current = items.indexOf(document.activeElement);
        if (!items.length) return;
        if (e.shiftKey && current <= 0) {
          e.preventDefault?.();
          items.at(-1).focus();
        } else if (!e.shiftKey && current === items.length - 1) {
          e.preventDefault?.();
          items[0].focus();
        }
      },
      message(text) {
        const output = V.$("#editor-status-text");
        if (output) output.textContent = text;
      },
      apply() {
        const result = D.apply(this.drafts, true, this.baseline);
        if (!result.ok) {
          const id = Object.keys(result.checks).find((k) => !result.checks[k].ok);
          if (id) {
            this.mapId = id;
            V.$("#editor-map").value = id;
            this.selection = null;
            this.refresh(true);
          }
          this.collisions = true;
          V.$("#editor-collisions").checked = true;
          this.paint();
          this.message("Ajuste antes de aplicar: " + result.message);
          return false;
        }
        if (this.wroteDraft) V.Save.remove("scene-draft");
        this.applied = true;
        this.close(false);
        D.rebuild();
        V.UI.toast(result.persisted ? "Cen\xE1rios aplicados. Miss\xF5es e progresso preservados." : "Cen\xE1rios aplicados nesta sess\xE3o. Exporte JSON para guardar.");
        return true;
      },
      close(store = true) {
        if (!this.active) return;
        if (store && !this.applied) this.saveDraft();
        this.walk = false;
        this.active = false;
        this.applied = false;
        this.drag = null;
        V.$("#editor-root").hidden = true;
        V.$("#editor-root").innerHTML = "";
        V.modal = false;
        V.Input.clear();
        if (this.returnFocus?.isConnected) this.returnFocus.focus();
        else if (V.Game.screen === "game") V.$("#world-canvas").focus();
      }
    };
    const E = V.SceneEditor;
    V.Game.bind = function() {
      original.bind();
      V.$("#title-editor-button").onclick = () => E.open();
    };
    V.Hooks.around(V.Game, "onKey", "scene-editor:onKey:1", () => function(k, e) {
      if (E.active) {
        E.key(k, e);
        return;
      }
      if (k === "f2" && (this.screen === "title" || V.modal)) {
        e.preventDefault?.();
        E.open();
        return;
      }
      return original.key(k, e);
    });
    V.Hooks.around(V.Game, "update", "scene-editor:update:1", (nextHook) => function(dt) {
      if (E.active) {
        E.tick(dt);
        return;
      }
      return nextHook(dt);
    });
    V.Hooks.around(V.Save, "save", "scene-editor:save:1", () => function() {
      if (E.active) return false;
      return original.save();
    });
    V.Hooks.around(V.Game, "pause", "scene-editor:pause:1", () => function(...args) {
      original.pause(...args);
      if (this.mode === "explore") {
        const footer = V.$(".modal-footer"), button = document.createElement("button");
        button.id = "pause-scene-editor";
        button.className = "secondary";
        button.textContent = "Editar cen\xE1rio";
        button.onclick = () => E.open();
        footer?.appendChild(button);
      }
    });
    window.addEventListener("resize", () => E.resize());
  })();
});
