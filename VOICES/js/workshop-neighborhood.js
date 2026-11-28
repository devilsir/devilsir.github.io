/* Registered module: workshop-neighborhood */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("workshop-neighborhood", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function workshopNeighborhood() {
    "use strict";
    const V = window.V, U = V.WorkshopUI, T = V.Tutorials, L = V.Living, esc = V.escape, on = (id, fn) => {
      const e = V.$("#" + id);
      if (e) e.onclick = fn;
    };
    const exercises = {
      labels: { title: "Etiquetas da feira", intro: "Organize estas tr\xEAs partes do cat\xE1logo fict\xEDcio. Proced\xEAncia informa origem; descri\xE7\xE3o registra caracter\xEDsticas; interpreta\xE7\xE3o prop\xF5e um sentido.", labels: ["Proced\xEAncia", "Descri\xE7\xE3o", "Interpreta\xE7\xE3o"], items: [{ text: "Ficha assinada pela oficina do bairro, guardada no arquivo.", answer: 0 }, { text: "Cartaz de papel azul, com t\xEDtulo e tr\xEAs desenhos.", answer: 1 }, { text: "A composi\xE7\xE3o pode sugerir encontro e colabora\xE7\xE3o.", answer: 2 }] },
      exhibition: { title: "Uma legenda que abre perguntas", intro: "Uma boa legenda n\xE3o mistura o registro observado com uma conclus\xE3o sem apoio.", labels: ["O que o registro mostra", "De onde vem a informa\xE7\xE3o", "Pergunta para investigar"], items: [{ text: "H\xE1 uma data e uma assinatura no documento exposto.", answer: 0 }, { text: "A ficha de consulta registra o arquivo que guarda o original.", answer: 1 }, { text: "Que outras pessoas participaram e n\xE3o aparecem neste registro?", answer: 2 }] },
      interview: { title: "Mesa de escuta do parque", intro: "Conserve as duas propostas e construa uma decis\xE3o que possa ser revisada.", labels: ["Fala de Joana", "Fala de Celina", "Decis\xE3o compartilhada"], items: [{ text: "Quero livros e tradu\xE7\xF5es para a roda de leitura.", answer: 0 }, { text: "Precisamos de sombra, bancos e uma passagem livre.", answer: 1 }, { text: "Vamos reunir as duas propostas e testar o espa\xE7o com o grupo.", answer: 2 }] },
      "field-notes": { title: "Observar e levantar hip\xF3teses", intro: "Voc\xEA viu comportamentos dos animais do jogo. N\xE3o transforme uma explica\xE7\xE3o poss\xEDvel em certeza.", labels: ["Observa\xE7\xE3o", "Hip\xF3tese", "Pergunta de investiga\xE7\xE3o"], items: [{ text: "O gato permaneceu sentado perto de uma mesa.", answer: 0 }, { text: "Talvez tenha escolhido o lugar porque estava tranquilo.", answer: 1 }, { text: "Em outro momento, ele escolhe o mesmo lugar?", answer: 2 }] },
      "community-mail": { title: "Roteiro de mem\xF3ria oral", intro: "A hist\xF3ria do bairro pode ser documentada com autoriza\xE7\xE3o, contexto e respeito ao direito de n\xE3o responder.", labels: ["Consentimento", "Pergunta aberta", "Contexto do registro"], items: [{ text: "Voc\xEA concorda com o registro? Pode recusar ou pedir revis\xE3o.", answer: 0 }, { text: "Que lembran\xE7as voc\xEA gostaria de compartilhar sobre a feira?", answer: 1 }, { text: "Anote a data, quem entrevistou e as condi\xE7\xF5es de consulta.", answer: 2 }] },
      "human-review": { title: "Protocolo do arquivo", intro: "Organize um processo que permita conferir registros, incluir perspectivas e corrigir decis\xF5es.", labels: ["Conferir documenta\xE7\xE3o", "Ouvir e revisar", "Explicar e corrigir"], items: [{ text: "Verificar autoria, origem, data e limites dos documentos.", answer: 0 }, { text: "Convidar pessoas envolvidas para avaliar o cat\xE1logo.", answer: 1 }, { text: "Registrar as altera\xE7\xF5es e abrir um canal para novas corre\xE7\xF5es.", answer: 2 }] }
    };
    const W = V.NeighborhoodWorkshops = {
      active: null,
      callbacks: {},
      create(id, practice = false) {
        return { id: "workbench-" + id, kind: id, finished: false, moves: 0, feedback: "", selected: [], matches: [], input: [], choice: null, phase: 0, checks: [], headline: "-1", chosen: Array(exercises[id]?.items.length || 0).fill(-1), practice };
      },
      run(id = this.active) {
        return T.practice("workbench", id) || T.ensure().sessions["workbench:" + id];
      },
      open(id, done) {
        this.active = id;
        if (done) this.callbacks[id] = done;
        const state = T.ensure();
        if (!state.sessions["workbench:" + id] || state.sessions["workbench:" + id].finished) state.sessions["workbench:" + id] = this.create(id);
        V.Save.save();
        return T.gate("workbench:" + id, () => this.show(id));
      },
      frame(id, title, objective, body, actions) {
        const r = this.run(id);
        U.render("workbench:" + id, () => {
          V.UI.modal(title, "OFICINA \xB7 ESCOLHAS GUARDADAS", `<p class="classic-status">${esc(objective)}</p><p id="workbench-feedback" class="classic-status" role="status">${esc(r.feedback || "Observe, compare e experimente. Voc\xEA pode corrigir suas escolhas.")}</p>${body}`, actions + '<button id="workbench-pause" class="secondary">Guardar e sair</button>', true);
          on("workbench-pause", () => {
            V.Save.save();
            V.UI.close();
          });
          U.bind("workbench:" + id);
        });
      },
      message(text, wrong = false) {
        const r = this.run();
        r.feedback = text;
        const p = V.$("#workbench-feedback");
        if (p) p.textContent = text;
        U.sound(wrong ? "wrong" : "correct");
        V.Save.save();
      },
      finish() {
        const r = this.run();
        if (T.practice("workbench", this.active)) {
          T.event("finish");
          return true;
        }
        if (!r || r.finished) return false;
        r.finished = true;
        V.Save.save();
        const cb = this.callbacks[this.active];
        V.UI.close();
        cb?.();
        return true;
      },
      show(id = this.active) {
        this.active = id;
        if (exercises[id]) return this.classify(id);
        return this[id]();
      },
      classify(id) {
        const e = exercises[id], r = this.run(id), items = r.practice ? e.items.slice(0, 1) : e.items;
        this.frame(id, e.title, e.intro, `<div class="stack">${items.map((item, i) => `<article class="classic-card" data-key="sort-${i}"><p>${esc(item.text)}</p><label class="field">A fun\xE7\xE3o desta informa\xE7\xE3o<select data-sort-item="${i}"><option value="-1">Escolha uma categoria</option>${e.labels.map((label, j) => `<option value="${j}" ${r.chosen[i] === j ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></label></article>`).join("")}</div>`, '<button id="workbench-hint" class="quiet">Pedir uma dica</button><button id="sort-check" class="primary">Conferir associa\xE7\xE3o</button>');
        V.$$("[data-sort-item]").forEach((s) => s.onchange = () => {
          r.chosen[+s.dataset.sortItem] = +s.value;
          r.moves++;
          V.Save.save();
          T.event("sort-select");
        });
        on("workbench-hint", () => U.hint("workbench:" + id, ["Leia o que a frase faz: informa algo observado, identifica uma origem ou prop\xF5e uma a\xE7\xE3o/pergunta?", "As categorias indicam fun\xE7\xF5es diferentes. Compare o verbo e a origem da informa\xE7\xE3o antes de pensar no assunto.", () => {
          const i = items.findIndex((item, i2) => r.chosen[i2] !== item.answer);
          return i < 0 ? "As associa\xE7\xF5es est\xE3o prontas para conferir." : "A informa\xE7\xE3o " + (i + 1) + " corresponde a \u201C" + e.labels[items[i].answer] + "\u201D.";
        }], "#workbench-feedback"));
        on("sort-check", () => {
          const wrong = items.findIndex((item, i) => r.chosen[i] !== item.answer);
          if (wrong >= 0) return this.message("Revise a informa\xE7\xE3o " + (wrong + 1) + ". A categoria escolhida ainda n\xE3o descreve a fun\xE7\xE3o dessa frase no registro.", true);
          this.message("\u2713 Cada frase ficou associada \xE0 fun\xE7\xE3o que cumpre. O registro conserva contexto e permite novas perguntas.");
          this.finish();
        });
      },
      sequence() {
        const r = this.run(), target = r.practice ? [0, 2, 1] : [0, 2, 1, 2, 3], labels = ["Luz azul", "Luz dourada", "Luz coral", "Luz violeta"];
        this.frame("sequence", "Oficina de sequ\xEAncia", "Reproduza o padr\xE3o original do jogo. As cores t\xEAm n\xFAmeros e nomes; voc\xEA pode comparar o modelo enquanto escolhe.", `<div class="classic-sequence" aria-label="Modelo">${target.map((n) => `<span>${n + 1} \xB7 ${labels[n]}</span>`).join("")}</div><p class="classic-status">Sua sequ\xEAncia: ${r.input.length ? r.input.map((n) => n + 1).join(" \u2192 ") : "nenhum sinal ainda"}</p><div class="classic-actions">${labels.map((name, i) => `<button data-sequence-key="${i}" class="secondary">${i + 1} \xB7 ${name}</button>`).join("")}</div>`, '<button id="sequence-undo" class="secondary">Desfazer \xFAltimo</button><button id="sequence-check" class="primary">Conferir sequ\xEAncia</button>');
        V.$$("[data-sequence-key]").forEach((b) => b.onclick = () => {
          if (r.input.length >= target.length) return this.message("A sequ\xEAncia j\xE1 tem " + target.length + " sinais. Confira ou desfa\xE7a apenas o \xFAltimo.");
          r.input.push(+b.dataset.sequenceKey);
          r.moves++;
          V.Audio.note(60 + r.input.at(-1) * 3, 0.12, "sine", 0.12);
          V.Save.save();
          this.sequence();
          T.event("sequence-key");
        });
        on("sequence-undo", () => {
          r.input.pop();
          V.Save.save();
          this.sequence();
        });
        on("sequence-check", () => {
          const wrong = target.findIndex((n, i) => r.input[i] !== n);
          if (wrong >= 0) return this.message("O sinal " + (wrong + 1) + " do modelo \xE9 " + labels[target[wrong]] + ". Compare essa posi\xE7\xE3o; voc\xEA pode desfazer at\xE9 ela e continuar.", true);
          this.finish();
        });
      },
      catalogue() {
        const r = this.run(), pairs = [["Assinatura", "Autoria"], ["Ficha de arquivo", "Origem"], ["Ano registrado", "Data"], ["Condi\xE7\xF5es de produ\xE7\xE3o", "Contexto"]], cards = (r.practice ? [0, 1] : [0, 5, 3, 6, 4, 1, 7, 2]).map((i) => ({ label: pairs[Math.floor(i / 2)][i % 2], pair: Math.floor(i / 2) }));
        this.frame("catalogue", "Cataloga\xE7\xE3o em pares", "Relacione o registro ao tipo de informa\xE7\xE3o que ele permite conferir. Os termos ficam vis\xEDveis para permitir compara\xE7\xE3o.", `<div class="project-grid">${cards.map((card, i) => `<button data-match-card="${i}" class="classic-answer ${r.matches.includes(i) ? "matched" : r.selected.includes(i) ? "selected" : ""}" aria-pressed="${r.selected.includes(i)}" ${r.matches.includes(i) ? "disabled" : ""}>${r.matches.includes(i) ? "\u2713 " : ""}${esc(card.label)}</button>`).join("")}</div><p>${r.matches.length / 2}/${cards.length / 2} rela\xE7\xF5es registradas</p>`, '<button id="workbench-hint" class="quiet">Pedir uma dica</button><button id="match-finish" class="primary" ' + (r.matches.length === cards.length ? "" : "disabled") + ">Concluir cat\xE1logo</button>");
        V.$$("[data-match-card]").forEach((b) => b.onclick = () => {
          const i = +b.dataset.matchCard;
          if (r.selected.includes(i)) return;
          r.selected.push(i);
          r.moves++;
          if (r.selected.length === 2) {
            const [a, c] = r.selected;
            if (cards[a].pair === cards[c].pair) {
              r.matches.push(a, c);
              r.feedback = "\u2713 " + cards[a].label + " e " + cards[c].label + " ajudam a conferir a mesma rela\xE7\xE3o.";
              U.sound("correct");
              T.event("catalogue-pair");
            } else r.feedback = "Esses dois termos conferem aspectos diferentes. A primeira sele\xE7\xE3o pode ser refeita sem apagar os pares corretos.";
            r.selected = [];
          } else T.event("catalogue-select");
          V.Save.save();
          this.catalogue();
        });
        on("workbench-hint", () => U.hint("catalogue", ["Procure o que pode responder \u201Cquem?\u201D, \u201Cquando?\u201D, \u201Conde est\xE1 guardado?\u201D ou \u201Cem quais condi\xE7\xF5es?\u201D.", "Uma assinatura ajuda a atribuir autoria; a data e as condi\xE7\xF5es de produ\xE7\xE3o s\xE3o perguntas diferentes.", "Uma rela\xE7\xE3o poss\xEDvel \xE9 Assinatura \u2194 Autoria."], "#workbench-feedback"));
        on("match-finish", () => this.finish());
      },
      experiment() {
        const r = this.run();
        if (r.phase === 0) {
          this.frame("experiment", "Luz para a oficina", "Caio quer comparar o consumo de duas l\xE2mpadas. Escolha um teste que mantenha iguais as outras condi\xE7\xF5es.", `<div>${["Usar o mesmo tempo e a mesma alimenta\xE7\xE3o el\xE9trica para as duas l\xE2mpadas.", "Mudar a l\xE2mpada, o tempo e a alimenta\xE7\xE3o ao mesmo tempo.", "Escolher a embalagem mais bonita."].map((text, i) => `<button data-experiment="${i}" class="classic-answer" aria-pressed="${r.choice === i}">${esc(text)}</button>`).join("")}</div>`, '<button id="experiment-run" class="primary" ' + (r.choice === null ? "disabled" : "") + ">Executar teste</button>");
          V.$$("[data-experiment]").forEach((b) => b.onclick = () => {
            r.choice = +b.dataset.experiment;
            V.Save.save();
            this.experiment();
            T.event("test-choice");
          });
          on("experiment-run", () => {
            if (r.choice !== 0) return this.message("Mudar v\xE1rias condi\xE7\xF5es impede relacionar a diferen\xE7a observada ao modelo de l\xE2mpada. Revise apenas o planejamento e teste novamente.", true);
            r.phase = 1;
            r.feedback = "As duas l\xE2mpadas iluminaram o mesmo espa\xE7o durante o mesmo tempo.";
            V.Save.save();
            this.experiment();
            T.event("test-run");
          });
          return;
        }
        this.frame("experiment", "Resultado do teste", "Estes n\xFAmeros pertencem ao experimento fict\xEDcio da oficina. Compare o consumo e respeite os limites do teste.", `<div class="two-cols"><article class="classic-card"><h3>L\xE2mpada A</h3><strong>8 unidades</strong></article><article class="classic-card"><h3>L\xE2mpada B</h3><strong>5 unidades</strong></article></div>${["B consumiu menos neste teste; durabilidade e acessibilidade ainda precisam ser avaliadas.", "B \xE9 a melhor l\xE2mpada para qualquer lugar e qualquer pessoa.", "Os n\xFAmeros provam que a embalagem mudou o resultado."].map((text, i) => `<button data-test-result="${i}" class="classic-answer">${text}</button>`).join("")}`, "");
        V.$$("[data-test-result]").forEach((b) => b.onclick = () => {
          if (+b.dataset.testResult !== 0) return this.message("O teste compara consumo em condi\xE7\xF5es controladas. Ele n\xE3o avaliou todos os lugares, custos ou necessidades de uso.", true);
          this.finish();
        });
      },
      newsroom() {
        const r = this.run(), checks = [["author", "Autoria", "A equipe da feira assina o aviso; a reda\xE7\xE3o tem o contato para confer\xEAncia."], ["date", "Data", "O aviso \xE9 desta semana; o hor\xE1rio do s\xE1bado ainda est\xE1 em confirma\xE7\xE3o."], ["context", "Contexto", "A programa\xE7\xE3o foi planejada com moradores; o acesso ser\xE1 testado antes da abertura."]];
        this.frame("newsroom", "Bancada do jornal", "Revise o rascunho ficcional da Feira das Hist\xF3rias. A manchete deve distinguir informa\xE7\xE3o confirmada de previs\xE3o.", `<div class="classic-grid"><section><article class="classic-card"><small>RASCUNHO \xB7 FIC\xC7\xC3O</small><h3>Feira ter\xE1 uma roda de leitura no s\xE1bado</h3><p>A atividade est\xE1 em prepara\xE7\xE3o. A reda\xE7\xE3o precisa conferir o que pode afirmar.</p></article>${checks.map(([id, label, text]) => `<article class="classic-card"><button data-news-check="${id}" class="secondary">${r.checks.includes(id) ? "\u2713 Rever" : "Conferir"} ${label}</button>${r.checks.includes(id) ? "<p>" + esc(text) + "</p>" : ""}</article>`).join("")}</section><aside class="culture-controls"><h3>Manchete da edi\xE7\xE3o</h3><label class="field">Escolha depois de conferir<select id="news-headline"><option value="-1">Selecione uma manchete</option>${["Feira prepara roda de leitura; hor\xE1rio ser\xE1 confirmado pela equipe.", "Todos os problemas da cidade acabaram gra\xE7as \xE0 feira.", "Uma pessoa criou sozinha toda a programa\xE7\xE3o."].map((text, i) => `<option value="${i}" ${r.headline === String(i) ? "selected" : ""}>${esc(text)}</option>`).join("")}</select></label><button id="news-publish" class="primary">Revisar publica\xE7\xE3o</button><button id="workbench-hint" class="quiet">Pedir uma dica</button></aside></div>`, "");
        V.$$("[data-news-check]").forEach((b) => b.onclick = () => {
          if (!r.checks.includes(b.dataset.newsCheck)) r.checks.push(b.dataset.newsCheck);
          V.Save.save();
          this.newsroom();
          T.event("news-source");
        });
        V.$("#news-headline").onchange = (e) => {
          r.headline = e.target.value;
          V.Save.save();
          T.event("news-headline");
        };
        on("workbench-hint", () => U.hint("newsroom", ["Confira autoria, data e contexto antes de escolher a manchete.", "O registro ainda n\xE3o confirma o hor\xE1rio. Uma manchete precisa deixar esse limite vis\xEDvel.", "A primeira manchete conserva a prepara\xE7\xE3o do evento e o hor\xE1rio ainda em confirma\xE7\xE3o."], "#workbench-feedback"));
        on("news-publish", () => {
          if (r.checks.length < 3) return this.message("Ainda faltam fichas para conferir. As que voc\xEA abriu continuam registradas.");
          if (r.headline !== "0") return this.message("Essa manchete acrescenta uma certeza ou apaga contribui\xE7\xF5es que o rascunho n\xE3o sustenta. Revise a reda\xE7\xE3o sem perder as fichas.", true);
          this.finish();
        });
      }
    };
    L.classify = (id, done) => W.open(id, done);
    L.sequencePuzzle = (done) => W.open("sequence", done);
    L.matchPuzzle = (done) => W.open("catalogue", done);
    L.experiment = (done) => W.open("experiment", done);
    L.newsroom = (done) => W.open("newsroom", done);
    const common = (id) => ({ family: "workbench", id, create: () => W.create(id, true), render() {
      W.active = id;
      W.show(id);
    }, resume() {
      W.active = id;
      W.show(id);
    } });
    for (const [id, e] of Object.entries(exercises)) T.define("workbench:" + id, { ...common(id), steps: [{ title: "Observe a fun\xE7\xE3o da informa\xE7\xE3o", text: "No treino, h\xE1 uma \xFAnica ficha. Leia a frase e escolha uma categoria no campo de associa\xE7\xE3o.", target: '[data-sort-item="0"]', allow: '[data-sort-item="0"]', event: "sort-select" }, { title: "Confira a associa\xE7\xE3o", text: "Toque em Conferir associa\xE7\xE3o. A categoria precisa indicar a fun\xE7\xE3o da frase no registro, e voc\xEA pode revisar se necess\xE1rio.", target: "#sort-check", allow: '[data-sort-item="0"],#sort-check,#workbench-hint', event: "finish", after: "O exemplo foi conferido. Na oficina, voc\xEA vai organizar o conjunto de fichas." }] });
    T.define("workbench:sequence", { ...common("sequence"), steps: [{ title: "Compare o modelo", text: "Reproduza o primeiro sinal, Luz azul. O padr\xE3o usa nomes e n\xFAmeros al\xE9m das cores.", target: '[data-sequence-key="0"]', allow: '[data-sequence-key="0"]', event: "sequence-key" }, { title: "Pratique a sequ\xEAncia", text: "Complete os dois sinais restantes e confira. Desfazer \xFAltimo permite corrigir somente a parte que precisa mudar.", allow: "[data-sequence-key],#sequence-undo,#sequence-check", event: "finish" }] });
    T.define("workbench:catalogue", { ...common("catalogue"), steps: [{ title: "Selecione um termo", text: "Selecione Assinatura. A primeira escolha fica marcada enquanto voc\xEA compara a outra informa\xE7\xE3o.", target: '[data-match-card="0"]', allow: '[data-match-card="0"]', event: "catalogue-select" }, { title: "Ligue ao tipo de informa\xE7\xE3o", text: "Selecione Autoria e conclua o cat\xE1logo de treino. Uma assinatura ajuda a identificar quem assina o registro.", allow: '[data-match-card="1"],#match-finish', event: "finish" }] });
    T.define("workbench:experiment", { ...common("experiment"), steps: [{ title: "Planeje uma compara\xE7\xE3o justa", text: "Escolha uma condi\xE7\xE3o de teste. Para investigar o modelo de l\xE2mpada, outras condi\xE7\xF5es precisam permanecer iguais.", target: "[data-experiment]", allow: "[data-experiment]", event: "test-choice" }, { title: "Execute e observe", text: "Execute o teste quando o planejamento estiver adequado. Um erro permite rever a condi\xE7\xE3o escolhida.", target: "#experiment-run", allow: "[data-experiment],#experiment-run", event: "test-run" }, { title: "Respeite o limite dos dados", text: "Escolha a conclus\xE3o sustentada pelos n\xFAmeros. O teste mede consumo, e n\xE3o todas as qualidades de uma l\xE2mpada.", target: "[data-test-result]", allow: "[data-test-result]", event: "finish" }] });
    T.define("workbench:newsroom", { ...common("newsroom"), steps: [{ title: "Abra uma ficha de confer\xEAncia", text: "Abra a ficha de autoria do rascunho. Ela fica junto da not\xEDcia, sem substituir o texto que voc\xEA est\xE1 revisando.", target: '[data-news-check="author"]', allow: '[data-news-check="author"]', event: "news-source" }, { title: "Confronte as tr\xEAs partes", text: "Confira data e contexto e escolha uma manchete. O hor\xE1rio ainda n\xE3o foi confirmado pela equipe.", target: "[data-news-check],#news-headline", allow: "[data-news-check],#news-headline,#workbench-hint", event: "news-headline" }, { title: "Revise antes de publicar", text: "Toque em Revisar publica\xE7\xE3o. A manchete deve respeitar o que est\xE1 confirmado e o que ainda falta conferir.", target: "#news-publish", allow: "[data-news-check],#news-headline,#news-publish,#workbench-hint", event: "finish" }] });
    const Life = V.Life, ensure = Life.ensure.bind(Life), start = Life.startQuiz.bind(Life), quiz = Life.quiz.bind(Life), finish = Life.finishQuiz.bind(Life);
    Life.ensure = function() {
      const l = ensure(), d = T.definitions[T.active];
      return d?.family === "quiz" ? { ...l, quiz: T.record(T.active).practice } : l;
    };
    Life.startQuiz = function(subject) {
      this.creatingTutorial = true;
      try {
        start(subject);
      } finally {
        this.creatingTutorial = false;
      }
      return T.gate("quiz:" + subject, () => this.quiz(), !!ensure().quiz?.index);
    };
    Life.quiz = function() {
      if (this.creatingTutorial) return;
      const qz = this.ensure().quiz;
      if (!qz) return;
      const key = "quiz:" + qz.subject;
      return U.render(key, () => {
        quiz();
        V.$$("[data-life-answer]").forEach((b) => {
          const fn = b.onclick;
          b.onclick = (e) => {
            fn(e);
            if (qz.cleared[qz.index]) T.event("quiz-answer");
          };
        });
        U.bind(key);
      });
    };
    Life.finishQuiz = function() {
      if (T.definitions[T.active]?.family === "quiz") {
        T.event("finish");
        return true;
      }
      return finish();
    };
    for (const subject of ["language", "history"]) T.define("quiz:" + subject, { family: "quiz", id: subject, create() {
      const q = V.Teacher.questions.find((q2) => q2.subject === "history" === (subject === "history"));
      return { id: "practice-quiz", subject, deck: [q.id], index: 0, score: 0, attempts: {}, cleared: {} };
    }, render() {
      Life.quiz();
    }, resume() {
      Life.quiz();
    }, steps: [{ title: "Leia antes de responder", text: "Escolha uma resposta. A explica\xE7\xE3o aparece na pr\xF3pria quest\xE3o; uma tentativa incorreta pode ser revista.", target: "[data-life-answer]", allow: "[data-life-answer]", event: "quiz-answer", after: "A explica\xE7\xE3o ficou vis\xEDvel. A pr\xF3xima pergunta s\xF3 aparece quando voc\xEA continuar." }, { title: "Avance depois da revis\xE3o", text: "Toque em Continuar. O exemplo de treino n\xE3o concede moedas nem altera sua pontua\xE7\xE3o.", target: "#life-quiz-next", allow: "#life-quiz-next", event: "finish" }] });
  })();
});
