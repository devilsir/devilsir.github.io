/* Registered module: teacher */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("teacher", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V;
    const clone = (o) => JSON.parse(JSON.stringify(o));
    V.Teacher = {
      custom: { questions: [], glossary: [] },
      tab: "config",
      init() {
        const custom = V.Save.read("custom", { questions: [], glossary: [] });
        try {
          this.validate(custom);
          this.custom = custom;
        } catch (e) {
          this.custom = { questions: [], glossary: [] };
        }
        this.apply();
      },
      apply() {
        this.questions = clone(V.content.questions);
        this.glossary = clone(V.content.glossary);
        this.custom.questions.forEach((q) => {
          const i = this.questions.findIndex((x) => x.id === q.id);
          if (i >= 0) this.questions[i] = q;
          else this.questions.push(q);
        });
        this.questions.forEach((q) => q.grade = 7);
        this.custom.glossary.forEach((w) => {
          const i = this.glossary.findIndex((x) => x.en.toLowerCase() === w.en.toLowerCase());
          if (i >= 0) this.glossary[i] = w;
          else this.glossary.push(w);
        });
      },
      save() {
        V.Save.write("custom", this.custom);
        this.apply();
        V.UI.toast("Conte\xFAdo salvo neste navegador.");
      },
      validate(data) {
        if (!data || !Array.isArray(data.questions) || !Array.isArray(data.glossary) || data.questions.length > 300 || data.glossary.length > 1200) throw Error("Estrutura de conte\xFAdo inv\xE1lida (m\xE1ximo: 300 quest\xF5es e 1200 palavras).");
        const ids = new Set();
        data.questions.forEach((q) => {
          if (typeof q.id !== "string" || !q.id.trim() || ids.has(q.id) || q.id.length > 100 || typeof q.prompt !== "string" || !q.prompt.trim() || q.prompt.length > 1500 || !Array.isArray(q.options) || q.options.length < 2 || q.options.length > 5 || q.options.some((s) => typeof s !== "string" || !s.trim() || s.length > 400) || !Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length || ![6, 7, 8].includes(q.grade) || !Number.isInteger(q.chapter) || q.chapter < 1 || q.chapter > 6 || typeof q.explanation !== "string" || q.explanation.length > 1500) throw Error("Quest\xE3o inv\xE1lida: " + (q.id || "sem ID"));
          ids.add(q.id);
        });
        data.glossary.forEach((w) => {
          if (!w || typeof w.en !== "string" || !w.en.trim() || w.en.length > 100 || typeof w.pt !== "string" || !w.pt.trim() || w.pt.length > 200 || typeof w.example !== "string" || typeof w.examplePt !== "string" || w.example.length > 600 || w.examplePt.length > 600) throw Error("Entrada de vocabul\xE1rio inv\xE1lida.");
        });
        return true;
      },
      open() {
        return V.Access.run(() => this.show());
      },
      show(tab = this.tab) {
        this.tab = tab;
        const tabs = [["config", "Turma e acesso"], ["chapters", "Cap\xEDtulos"], ["questions", "Quest\xF5es"], ["glossary", "Vocabul\xE1rio"], ["progress", "Progresso"], ["guide", "Guia e respostas"]];
        V.UI.modal("Sala do professor", "Conte\xFAdo, prefer\xEAncias e registros locais. Uma turma pode usar um \xFAnico computador.", `<nav class="tabs">${tabs.map(([id, t]) => `<button data-tab="${id}" class="${tab === id ? "active" : ""}">${t}</button>`).join("")}</nav><div id="teacher-content"></div>`, "", true);
        V.$$("[data-tab]").forEach((b) => b.onclick = () => this.show(b.dataset.tab));
        this[{ questions: "questionsPanel", glossary: "glossaryPanel" }[tab] || tab]();
      },
      config() {
        const s = V.settings;
        V.$("#teacher-content").innerHTML = `<div class="two-cols"><div class="stack"><label class="field">Modo de sala<select id="teacher-mode"><option value="solo">Aventura individual</option><option value="projector">Equipes / projetor</option><option value="teams">Desafio local com pap\xE9is rotativos</option></select></label><label class="field">Equipes (uma por linha, at\xE9 4)<textarea id="teacher-teams">${V.escape(s.teamNames.join("\n"))}</textarea></label><label class="field">Dificuldade dos desafios<select id="teacher-difficulty"><option value="0">Tranquila \xB7 sem perda por reflexo</option><option value="1">Padr\xE3o \xB7 assist\xEAncia opcional</option><option value="2">Investiga\xE7\xE3o \xB7 datas ocultas por padr\xE3o</option></select></label></div><div class="stack"><label class="toggle"><input id="teacher-translation" type="checkbox" ${s.translation ? "checked" : ""}> Mostrar tradu\xE7\xF5es</label><label class="toggle"><input id="teacher-timing" type="checkbox" ${s.timeLimits ? "checked" : ""}> Ritmo e movimento com tempo correndo</label><label class="toggle"><input id="teacher-projector" type="checkbox" ${s.presentation ? "checked" : ""}> Interface para proje\xE7\xE3o</label><label class="toggle"><input id="teacher-assist" type="checkbox" ${s.assist ? "checked" : ""}> Modo tranquilo nos desafios de reflexo</label></div></div><div class="row" style="margin-top:20px"><button id="teacher-save-config" class="primary">Aplicar prefer\xEAncias</button><button id="teacher-discuss" class="secondary">Pausa para conversa</button><button id="teacher-accessibility" class="secondary">Acessibilidade e \xE1udio</button></div><div class="note" style="margin-top:18px">No modo rotativo: Navega\xE7\xE3o, Investiga\xE7\xE3o, Ingl\xEAs e Registro. Ap\xF3s um cap\xEDtulo, a pr\xF3xima equipe e os pap\xE9is assumem o controle. Os registros n\xE3o sincronizam entre computadores.</div>`;
        V.$("#teacher-mode").value = s.mode;
        V.$("#teacher-difficulty").value = s.difficulty;
        V.$("#teacher-save-config").onclick = () => {
          s.grade = 7;
          if (V.state) V.state.grade = s.grade;
          s.mode = V.$("#teacher-mode").value;
          s.teamNames = V.$("#teacher-teams").value.split("\n").map((x) => x.trim().slice(0, 40)).filter(Boolean).slice(0, 4);
          if (!s.teamNames.length) s.teamNames = ["Equipe Aurora", "Equipe Horizonte"];
          s.difficulty = +V.$("#teacher-difficulty").value;
          s.translation = V.$("#teacher-translation").checked;
          s.timeLimits = V.$("#teacher-timing").checked;
          s.presentation = V.$("#teacher-projector").checked || s.mode === "projector";
          s.assist = V.$("#teacher-assist").checked || s.difficulty === 0;
          V.Save.applySettings();
          V.Save.save();
          V.Game.updateHUD();
          V.UI.toast("Prefer\xEAncias aplicadas \xE0 aventura.");
        };
        V.$("#teacher-discuss").onclick = () => this.discussion();
        V.$("#teacher-accessibility").onclick = () => V.Game.settings();
      },
      chapters() {
        V.$("#teacher-content").innerHTML = `<label class="toggle"><input id="teacher-unlock" type="checkbox" ${V.settings.unlockAll ? "checked" : ""}> Liberar todos os portais para uma atividade de sala</label><div class="note" style="margin:15px 0">Entrar em um cap\xEDtulo n\xE3o marca atividades como conclu\xEDdas. Os registros e confrontos continuam funcionais. A conclus\xE3o normal desbloqueia cada regi\xE3o.</div><div class="three-cols">${V.content.chapters.map((c) => `<article class="map-card" style="--region:${c.color}"><span class="chip">${c.id} \xB7 ${V.state?.completed.includes(c.id) ? "CONCLU\xCDDO" : "MISS\xC3O"}</span><b>${V.escape(c.name)}</b><small>${V.escape(c.objective)}</small><button class="secondary" data-enter="${c.id}">Entrar neste cap\xEDtulo</button></article>`).join("")}</div>`;
        V.$("#teacher-unlock").onchange = (e) => {
          V.settings.unlockAll = e.target.checked;
          V.Save.applySettings();
        };
        V.$$("[data-enter]").forEach((b) => b.onclick = () => {
          const id = +b.dataset.enter;
          if (!V.state) V.Game.newState({ grade: 7, character: "nia", name: "Equipe VOICES" });
          V.state.flags.prologueDone = true;
          V.state.unlocked = Math.max(V.state.unlocked, id);
          V.UI.close();
          V.Game.enterChapter(id);
        });
      },
      questionsPanel() {
        V.$("#teacher-content").innerHTML = `<div class="row between"><p class="muted" style="font-size:.8rem">Quest\xF5es de Ingl\xEAs aparecem nos terminais EN. Quest\xF5es de Hist\xF3ria aparecem nas leituras e nas rodas H?.</p><button id="question-add" class="primary">+ Criar quest\xE3o</button></div><div class="stack">${this.questions.map((q) => `<article class="question-editor"><div class="row between"><span class="chip">AVENTURA \xB7 CAP. ${q.chapter} \xB7 ${q.subject === "history" ? "HIST\xD3RIA" : "INGL\xCAS"}</span><button class="quiet" data-edit-question="${V.escape(q.id)}">Editar</button></div><strong style="font-size:.83rem">${V.escape(q.prompt)}</strong><small style="display:block;margin-top:10px">Resposta: ${V.escape(q.options[q.correct])}</small></article>`).join("")}</div><div class="row" style="margin-top:18px"><button id="content-export" class="secondary">Exportar conte\xFAdo JSON</button><label class="secondary" style="cursor:pointer">Importar JSON<input id="content-import" type="file" accept="application/json,.json" hidden></label></div>`;
        V.$("#question-add").onclick = () => this.editQuestion();
        V.$$("[data-edit-question]").forEach((b) => b.onclick = () => this.editQuestion(b.dataset.editQuestion));
        V.$("#content-export").onclick = () => this.export();
        V.$("#content-import").onchange = (e) => this.import(e.target.files[0]);
      },
      editQuestion(id = null) {
        const q = this.questions.find((x) => x.id === id) || { id: "custom-" + Date.now(), chapter: 1, grade: 7, prompt: "", options: ["", "", "", ""], correct: 0, explanation: "" };
        V.UI.modal(id ? "Editar quest\xE3o" : "Criar quest\xE3o", "Cada quest\xE3o precisa de resposta e explica\xE7\xE3o.", `<div class="two-cols"><label class="field">Cap\xEDtulo<select id="q-chapter">${V.content.chapters.map((c) => `<option value="${c.id}" ${q.chapter === c.id ? "selected" : ""}>${c.id} \xB7 ${V.escape(c.name)}</option>`).join("")}</select></label></div><label class="field" style="margin-top:15px">\xC1rea<select id="q-subject"><option value="language" ${q.subject !== "history" ? "selected" : ""}>Ingl\xEAs</option><option value="history" ${q.subject === "history" ? "selected" : ""}>Hist\xF3ria e contexto</option></select></label><label class="field" style="margin-top:15px">Enunciado<textarea id="q-prompt" maxlength="1500">${V.escape(q.prompt)}</textarea></label><div class="two-cols" style="margin-top:15px">${q.options.map((o, i) => `<label class="field">Alternativa ${i + 1}<input id="q-option-${i}" maxlength="400" value="${V.escape(o)}"></label>`).join("")}</div><label class="field" style="margin-top:15px">Resposta correta<select id="q-correct">${q.options.map((o, i) => `<option value="${i}" ${q.correct === i ? "selected" : ""}>Alternativa ${i + 1}</option>`).join("")}</select></label><label class="field" style="margin-top:15px">Explica\xE7\xE3o<textarea id="q-explanation" maxlength="1500">${V.escape(q.explanation)}</textarea></label><div id="q-error" class="form-feedback"></div>`, `<button id="q-back" class="secondary">Voltar</button><button id="q-save" class="primary">Salvar quest\xE3o</button>`);
        V.$("#q-back").onclick = () => this.show("questions");
        V.$("#q-save").onclick = () => {
          const edited = { ...q, id: q.id, subject: V.$("#q-subject").value, chapter: +V.$("#q-chapter").value, grade: 7, prompt: V.$("#q-prompt").value.trim(), options: q.options.map((x, i) => V.$("#q-option-" + i).value.trim()), correct: +V.$("#q-correct").value, explanation: V.$("#q-explanation").value.trim() };
          try {
            this.validate({ questions: [edited], glossary: [] });
            this.custom.questions = this.custom.questions.filter((x) => x.id !== q.id);
            this.custom.questions.push(edited);
            this.save();
            this.show("questions");
          } catch (e) {
            V.$("#q-error").textContent = e.message;
          }
        };
      },
      glossaryPanel() {
        V.$("#teacher-content").innerHTML = `<div class="row between"><p class="muted">Tradu\xE7\xF5es offline e exemplos curtos.</p><button id="word-add" class="primary">+ Nova palavra</button></div><div class="three-cols">${this.glossary.map((w) => `<button class="card" data-edit-word="${V.escape(w.en)}" style="text-align:left"><h3 style="color:var(--cyan)">${V.escape(w.en)}</h3><small>${V.escape(w.pt)}</small></button>`).join("")}</div><div class="row" style="margin-top:18px"><button id="word-export" class="secondary">Exportar conte\xFAdo JSON</button><label class="secondary" style="cursor:pointer">Importar JSON<input id="word-import" type="file" accept=".json" hidden></label></div>`;
        V.$("#word-add").onclick = () => this.editWord();
        V.$$("[data-edit-word]").forEach((b) => b.onclick = () => this.editWord(b.dataset.editWord));
        V.$("#word-export").onclick = () => this.export();
        V.$("#word-import").onchange = (e) => this.import(e.target.files[0]);
      },
      editWord(en = null) {
        const w = this.glossary.find((x) => x.en === en) || { en: "", pt: "", example: "", examplePt: "" };
        V.UI.modal(en ? "Editar vocabul\xE1rio" : "Nova palavra", "O gloss\xE1rio funciona sem internet.", `<div class="stack">${[["en", "Palavra em ingl\xEAs"], ["pt", "Tradu\xE7\xE3o"], ["example", "Exemplo em ingl\xEAs"], ["examplePt", "Exemplo em portugu\xEAs"]].map(([id, label]) => `<label class="field">${label}<input id="word-${id}" value="${V.escape(w[id])}" maxlength="${id === "en" ? 100 : id === "pt" ? 200 : 600}" ${id === "en" && en ? "readonly" : ""}></label>`).join("")}</div><div id="word-error" class="form-feedback"></div>`, `<button id="word-back" class="secondary">Voltar</button><button id="word-save" class="primary">Salvar palavra</button>`);
        V.$("#word-back").onclick = () => this.show("glossary");
        V.$("#word-save").onclick = () => {
          const edited = {};
          ["en", "pt", "example", "examplePt"].forEach((id) => edited[id] = V.$("#word-" + id).value.trim());
          try {
            this.validate({ questions: [], glossary: [edited] });
            this.custom.glossary = this.custom.glossary.filter((x) => x.en.toLowerCase() !== edited.en.toLowerCase());
            this.custom.glossary.push(edited);
            this.save();
            this.show("glossary");
          } catch (e) {
            V.$("#word-error").textContent = e.message;
          }
        };
      },
      export() {
        V.Save.download("voices-conteudo.json", { format: "voices-content", version: 1, questions: this.questions, glossary: this.glossary });
      },
      import(file) {
        if (!file) return;
        if (file.size > 1e6) {
          V.UI.toast("O JSON deve ter at\xE9 1 MB.");
          return;
        }
        file.text().then((t) => {
          const d = JSON.parse(t);
          if (d.format !== "voices-content" || d.version !== 1) throw Error("Formato desconhecido. Use voices-content, vers\xE3o 1.");
          this.validate(d);
          this.custom = { questions: clone(d.questions), glossary: clone(d.glossary) };
          this.save();
          this.show(this.tab);
        }).catch((e) => V.UI.toast("Importa\xE7\xE3o cancelada: " + e.message));
      },
      progress() {
        const s = V.state || V.Save.load(), logs = V.Save.read("log", []);
        V.$("#teacher-content").innerHTML = `<div class="teacher-stats"><div class="card"><strong>${s?.completed.length || 0}/6</strong><small>Cap\xEDtulos resolvidos</small></div><div class="card"><strong>${s?.evidence.length || 0}/18</strong><small>Registros coletados</small></div><div class="card"><strong>${s?.words.length || 0}</strong><small>Palavras colecionadas</small></div></div><div class="teacher-stats" style="margin-top:12px"><div class="card"><strong>${s?.readings?.length || 0}/24</strong><small>Leituras conclu\xEDdas</small></div><div class="card"><strong>${s?.knowledge?.length || 0}/30</strong><small>Quest\xF5es de Hist\xF3ria interpretadas</small></div><div class="card"><strong>${Object.values(s?.sideQuests || {}).filter((q) => q.done).length}/12</strong><small>Miss\xF5es da comunidade</small></div></div><p class="muted" style="font-size:.78rem;margin-top:16px">${s ? "Aventura: " + V.escape(s.name) + " \xB7 " + Math.round((s.playSeconds || 0) / 60) + " min" : "Nenhuma aventura salva."} \xB7 Dados deste navegador.</p><div class="progress-log">${logs.slice(-80).reverse().map((l) => `<p><small>${new Date(l.at).toLocaleString("pt-BR")} \xB7 ${V.escape(l.type)}</small><br>${V.escape(l.detail)}</p>`).join("") || '<p class="muted">As a\xE7\xF5es da aventura ser\xE3o registradas aqui.</p>'}</div><div class="row" style="margin-top:18px"><button id="progress-export" class="secondary">Exportar registro local</button><button id="progress-reset" class="danger">Reiniciar aventura</button></div><div class="note" style="margin-top:16px">O registro mostra atividades e escolhas. N\xE3o mede car\xE1ter, identidade racial ou valor pessoal. Sem painel remoto e sem sincroniza\xE7\xE3o.</div>`;
        V.$("#progress-export").onclick = () => V.Save.download("voices-registro-local.json", { format: "voices-log", state: s, log: logs });
        V.$("#progress-reset").onclick = () => V.UI.confirm("Reiniciar aventura?", "Isso remove o progresso desta aventura e seus registros locais. Suas quest\xF5es, vocabul\xE1rio e prefer\xEAncias permanecem.", () => {
          V.Save.remove("save");
          V.Save.remove("log");
          V.state = null;
          V.Game.toTitle();
          V.UI.toast("Aventura reiniciada.");
        });
      },
      guide() {
        V.$("#teacher-content").innerHTML = `<div class="note">Recurso complementar: aproxima\xE7\xE3o tem\xE1tica \xE0 BNCC, ao CRMG e \xE0 Lei 11.645/2008. O professor faz a articula\xE7\xE3o com a turma e seu planejamento. N\xE3o h\xE1 promessa de cobertura integral nem c\xF3digos inventados.</div><div class="stack" style="margin-top:18px">${V.content.chapters.map((c) => `<article class="card"><h3>${c.id}. ${V.escape(c.name)}</h3><p style="font-size:.82rem">${V.escape(c.objective)}</p><p style="font-size:.8rem;color:var(--cyan)">${V.escape(c.takeaway)}</p></article>`).join("")}</div><div class="separator"></div><h3>Respostas de Ingl\xEAs e Hist\xF3ria</h3>${this.questions.map((q) => `<div class="source-row"><strong style="font-size:.8rem">${V.escape(q.prompt)}</strong><p>\u2713 ${V.escape(q.options[q.correct])}<br>${V.escape(q.explanation)}</p></div>`).join("")}<div class="separator"></div><h3>Desafios</h3><p style="font-size:.8rem">Cronologia: 1324, 1464, 1483, 1888, 1960, 1962. Autoria: matem\xE1tica orbital \u2192 Katherine Johnson; Quarto de despejo \u2192 Carolina Maria de Jesus; engenharia e abolicionismo \u2192 Andr\xE9 Rebou\xE7as. Na rede, consulte o contexto antes da a\xE7\xE3o. No bairro, combine acesso, participa\xE7\xE3o e representa\xE7\xE3o com 8 unidades e revis\xE3o posterior.</p><div class="row"><button id="guide-sources" class="secondary">Consultar fontes offline</button><button id="guide-discuss" class="primary">Pausa para discuss\xE3o</button></div>`;
        V.$("#guide-sources").onclick = () => V.Game.credits();
        V.$("#guide-discuss").onclick = () => this.discussion();
      },
      discussion() {
        V.UI.modal("Pausa para conversa", "O mundo, os minigames e os confrontos est\xE3o pausados.", `<div class="note">Ningu\xE9m precisa contar experi\xEAncias pessoais nem representar situa\xE7\xF5es de opress\xE3o. Trabalhem com os registros e personagens ficcionais.</div><div class="stack" style="margin-top:20px"><div class="card"><h3>O que o registro mostra?</h3><p>Que evid\xEAncia sustenta nossa conclus\xE3o? Que fonte ainda precisamos consultar?</p></div><div class="card"><h3>Quem participou das decis\xF5es?</h3><p>Quais hist\xF3rias aparecem e quais continuam ausentes? Como revisar o sistema?</p></div><div class="card"><h3>Como agir em conjunto?</h3><p>Que apoio e mudan\xE7as concretas ajudam a ampliar direitos e participa\xE7\xE3o?</p></div></div>`, `<button id="discussion-back" class="primary">Retomar a aventura</button>`);
        V.$("#discussion-back").onclick = () => V.UI.close();
      }
    };
  })();
});
