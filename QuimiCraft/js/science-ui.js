(function (global) {
  "use strict";

  const NOTEBOOK_TABS = Object.freeze([
    ["overview", "Visão geral"],
    ["elements", "Elementos"],
    ["minerals", "Minerais"],
    ["animals", "Animais"],
    ["plants", "Plantas"],
    ["microorganisms", "Microrganismos"],
    ["substances", "Substâncias"],
    ["reactions", "Reações"],
    ["experiments", "Experimentos"],
    ["recipes", "Receitas"],
    ["hazards", "Riscos"],
    ["samples", "Amostras"],
    ["water", "Águas"],
    ["missions", "Missões"],
    ["observations", "Observações"]
  ]);
  const ANALYSIS_STATIONS = new Set([
    "microscope",
    "spectrometer",
    "precision_balance",
    "centrifuge",
    "water_purification",
    "bunsen_burner",
    "laboratory_furnace",
    "electrolysis",
    "distillation"
  ]);

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(timestamp) {
    if (!timestamp) return "ainda não registrado";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(timestamp));
    } catch (error) {
      return "data indisponível";
    }
  }

  function propertyLabel(key) {
    return {
      pH: "pH",
      mass: "Massa",
      density: "Densidade",
      electricalConductivity: "Condutividade elétrica",
      thermalConductivity: "Condutividade térmica",
      solubility: "Solubilidade",
      flammability: "Inflamabilidade",
      radioactivity: "Radioatividade",
      magneticBehavior: "Comportamento magnético",
      meltingPoint: "Ponto de fusão",
      boilingPoint: "Ponto de ebulição",
      biologicalContamination: "Contaminação biológica",
      microorganisms: "Microrganismos",
      composition: "Composição",
      purity: "Pureza",
      contamination: "Contaminação",
      suspendedMaterial: "Material em suspensão",
      phaseCount: "Número de fases",
      appearance: "Aparência"
    }[key] || key;
  }

  function createScienceUI(config) {
    const options = config || {};
    const system = options.system;
    const bridge = options.bridge || {};
    const elements = Array.isArray(options.elements) ? options.elements : [];
    const itemName = typeof bridge.itemName === "function" ? bridge.itemName : value => String(value);
    const getEquippedIds = typeof bridge.getEquippedIds === "function" ? bridge.getEquippedIds : () => [];
    const toast = typeof bridge.toast === "function" ? bridge.toast : function () {};
    const openModal = typeof bridge.openModal === "function" ? bridge.openModal : function () {};
    const closeModal = typeof bridge.closeModal === "function" ? bridge.closeModal : function () {};
    const playFeedback = typeof bridge.playFeedback === "function" ? bridge.playFeedback : function () {};
    const refreshInventory = typeof bridge.refreshInventory === "function" ? bridge.refreshInventory : function () {};
    const recordReaction = typeof bridge.recordReaction === "function" ? bridge.recordReaction : function () {};
    const openLegacyChemistry = typeof bridge.openLegacyChemistry === "function" ? bridge.openLegacyChemistry : function () {};

    if (!system) throw new Error("ScienceUI: núcleo científico ausente.");

    const notebookModal = document.getElementById("scientificNotebook");
    const notebookTabs = document.getElementById("notebookTabs");
    const notebookContent = document.getElementById("notebookContent");
    const notebookStats = document.getElementById("notebookStats");
    const researchModal = document.getElementById("researchTree");
    const researchPoints = document.getElementById("researchPoints");
    const researchContent = document.getElementById("researchContent");
    const stationModal = document.getElementById("scienceStation");
    const stationTitle = document.getElementById("scienceStationTitle");
    const stationSubtitle = document.getElementById("scienceStationSubtitle");
    const stationNav = document.getElementById("scienceStationNav");
    const stationContent = document.getElementById("scienceStationContent");
    const temperaturePanel = document.getElementById("temperatureHud");
    const temperatureLabel = document.getElementById("temperatureLabel");
    const temperatureValue = document.getElementById("temperatureValue");
    const temperatureFill = document.getElementById("temperatureFill");
    const hazardPanel = document.getElementById("hazardHud");
    const statusPanel = document.getElementById("statusEffects");
    const climateOverlay = document.getElementById("climateOverlay");
    let activeNotebookTab = "overview";
    let activeStationId = "";
    let activeStationIds = [];
    let lastHudSignature = "";
    let reactionRunning = false;

    function discoveryFor(category, id) {
      return system.getNotebook().discoveries?.[category]?.[id] || null;
    }

    function renderNotebookTabs() {
      if (!notebookTabs) return;
      notebookTabs.innerHTML = NOTEBOOK_TABS.map(([id, label]) =>
        `<button type="button" data-notebook-tab="${id}" class="${id === activeNotebookTab ? "active" : ""}">${label}</button>`
      ).join("");
      notebookTabs.querySelectorAll("[data-notebook-tab]").forEach(button => {
        button.addEventListener("click", () => {
          activeNotebookTab = button.dataset.notebookTab;
          renderNotebook();
        });
      });
    }

    function renderNotebookOverview(notebook, samples, research) {
      const discoveryCount = Object.values(notebook.discoveries || {}).reduce(
        (total, category) => total + Object.keys(category || {}).length,
        0
      );
      const identifiedSamples = samples.filter(sample => sample.identified).length;
      return `
        <div class="science-hero">
          <div>
            <span class="science-kicker">ARQUIVO PERSISTENTE</span>
            <h3>Seu mundo agora guarda método, não só loot.</h3>
            <p>Cada coleta, leitura e reação completa propriedades diferentes. Uma única estação nunca revela tudo.</p>
          </div>
          <div class="science-orbit" aria-hidden="true"><i></i><i></i><i></i><b>Qc</b></div>
        </div>
        <div class="science-stat-grid">
          <article><span>Descobertas</span><b>${discoveryCount}</b><small>entradas conhecidas</small></article>
          <article><span>Amostras</span><b>${samples.length}</b><small>${identifiedSamples} identificadas</small></article>
          <article><span>Pesquisa</span><b>${research.points}</b><small>${research.unlocked.length} tecnologias</small></article>
          <article><span>Reações</span><b>${system.reactions.filter(reaction => discoveryFor("reactions", reaction.id)).length}</b><small>${system.reactions.length} catalogadas</small></article>
        </div>
        <div class="science-callout">
          <b>Fluxo científico</b>
          <span>Colete com <kbd>G</kbd> → analise em estações diferentes → ganhe pesquisa → desbloqueie novos processos.</span>
        </div>
      `;
    }

    function renderCatalog(category, entries) {
      const notebook = system.getNotebook();
      const known = notebook.discoveries?.[category] || {};
      const mergedEntries = entries.slice();
      for (const [id, entry] of Object.entries(known)) {
        if (!mergedEntries.some(([catalogId]) => catalogId === id)) mergedEntries.push([id, entry.name || id]);
      }
      if (!mergedEntries.length) return '<p class="science-empty">Nenhuma entrada catalogada nesta seção.</p>';
      return `<div class="notebook-entry-grid">${mergedEntries.map(([id, fallbackName]) => {
        const entry = known[id];
        const title = entry?.name || fallbackName;
        const details = entry
          ? Object.entries(entry.testedProperties || {})
              .slice(0, 4)
              .map(([key, value]) => `<span><b>${escapeHTML(propertyLabel(key))}</b>${escapeHTML(value)}</span>`)
              .join("")
          : "";
        return `
          <article class="notebook-entry ${entry ? "known" : "unknown"}">
            <div class="notebook-entry-top"><span>${entry ? "REGISTRADO" : "NÃO IDENTIFICADO"}</span><i>${entry ? Math.round(entry.researchProgress || 20) : 0}%</i></div>
            <h3>${entry ? escapeHTML(title) : "???"}</h3>
            <p>${entry ? escapeHTML(entry.source || entry.equation || entry.knownRisks || "Dados de campo registrados.") : "Colete ou analise uma amostra relacionada para revelar esta entrada."}</p>
            ${details ? `<div class="notebook-properties">${details}</div>` : ""}
          </article>
        `;
      }).join("")}</div>`;
    }

    function renderElementCatalog() {
      if (!elements.length) return '<p class="science-empty">Tabela periódica indisponível.</p>';
      const known = system.getNotebook().discoveries?.elements || {};
      return `<div class="element-notebook-grid">${elements.map(element => {
        const entry = known[String(element.atomicNumber)] || known[element.symbol.toLowerCase()];
        return `
          <article class="${entry ? "known" : "unknown"}">
            <span>${element.atomicNumber}</span>
            <b>${entry ? escapeHTML(element.symbol) : "?"}</b>
            <small>${entry ? escapeHTML(element.name) : "Não identificado"}</small>
          </article>
        `;
      }).join("")}</div>`;
    }

    function renderSamples(samples) {
      if (!samples.length) {
        return `
          <div class="science-empty-panel">
            <b>Nenhuma amostra selada</b>
            <p>Tenha o recipiente correto na mochila e use <kbd>G</kbd> perto de água, solo, plantas, minerais ou ar.</p>
          </div>
        `;
      }
      return `<div class="sample-card-list">${samples.slice().reverse().map(sample => {
        const properties = Object.entries(sample.revealedProperties || {});
        return `
          <article class="sample-card ${sample.identified ? "identified" : ""}">
            <header><div><span>${escapeHTML(sample.kind)}</span><h3>${escapeHTML(sample.name)}</h3></div><b>${sample.identified ? "IDENTIFICADA" : `${properties.length} LEITURAS`}</b></header>
            <div class="sample-meta">
              <span><b>Origem</b>${escapeHTML(sample.source)}</span>
              <span><b>Bioma</b>${escapeHTML(sample.biome)}</span>
              <span><b>Local</b>${sample.location.x}, ${sample.location.y}, ${sample.location.z}</span>
              <span><b>Coleta</b>${formatDate(sample.collectedAt)}</span>
              <span><b>Conservação</b>${sample.refrigerated ? "Refrigerada" : "Ambiente"}</span>
            </div>
            ${properties.length ? `<div class="sample-readings">${properties.map(([key, value]) => `<span><b>${escapeHTML(propertyLabel(key))}</b>${escapeHTML(value)}</span>`).join("")}</div>` : '<p class="sample-pending">Leve esta amostra a uma estação de análise.</p>'}
          </article>
        `;
      }).join("")}</div>`;
    }

    function renderWaterCatalog() {
      const known = system.getNotebook().discoveries?.water || {};
      const entries = Object.values(system.waterProfiles);
      return `<div class="water-profile-grid">${entries.map(profile => {
        const entry = known[profile.id];
        return `
          <article class="${entry ? "known" : "unknown"}">
            <div class="water-drop" aria-hidden="true"></div>
            <span>${entry ? `pH ${profile.pH}` : "pH ?"}</span>
            <h3>${entry ? escapeHTML(profile.label) : "Água desconhecida"}</h3>
            <p>${entry ? escapeHTML(profile.description) : "Colete, beba ou analise esta categoria para liberar os dados."}</p>
            <div><b>PUREZA</b><i style="--value:${entry ? profile.purity : 0}%"></i><strong>${entry ? `${profile.purity}%` : "?"}</strong></div>
          </article>
        `;
      }).join("")}</div>`;
    }

    function renderObservations(notebook) {
      const observations = notebook.observations || [];
      if (!observations.length) return '<p class="science-empty">Nenhuma observação registrada ainda.</p>';
      return `<div class="observation-list">${observations.slice().reverse().map(observation => `
        <article><span>${escapeHTML(observation.category)} · ${formatDate(observation.createdAt)}</span><p>${escapeHTML(observation.text)}</p></article>
      `).join("")}</div>`;
    }

    function renderNotebook() {
      if (!notebookContent) return;
      const notebook = system.getNotebook();
      const samples = system.getSamples();
      const research = system.getResearch();
      renderNotebookTabs();
      if (notebookStats) {
        notebookStats.textContent = `${samples.length} amostras · ${research.points} pontos disponíveis`;
      }
      if (activeNotebookTab === "overview") notebookContent.innerHTML = renderNotebookOverview(notebook, samples, research);
      else if (activeNotebookTab === "elements") notebookContent.innerHTML = renderElementCatalog();
      else if (activeNotebookTab === "samples") notebookContent.innerHTML = renderSamples(samples);
      else if (activeNotebookTab === "water") notebookContent.innerHTML = renderWaterCatalog();
      else if (activeNotebookTab === "observations") notebookContent.innerHTML = renderObservations(notebook);
      else notebookContent.innerHTML = renderCatalog(activeNotebookTab, system.catalog[activeNotebookTab] || []);
    }

    function renderResearch() {
      if (!researchContent) return;
      const research = system.getResearch();
      if (researchPoints) researchPoints.textContent = `${research.points} pontos disponíveis · ${research.earned} obtidos`;
      const categories = [...new Set(research.nodes.map(node => node.category))];
      researchContent.innerHTML = categories.map(category => `
        <section class="research-category">
          <header><span>${escapeHTML(category)}</span></header>
          <div>${research.nodes.filter(node => node.category === category).map(node => {
            const stateClass = node.unlocked ? "unlocked" : node.available ? "available" : "locked";
            return `
              <article class="research-node ${stateClass}">
                <div class="research-node-icon">${node.unlocked ? "✓" : node.cost}</div>
                <div><h3>${escapeHTML(node.name)}</h3><p>${escapeHTML(node.unlocks)}</p><small>${node.requires.length ? `Requer: ${node.requires.map(id => system.researchNodes.find(entry => entry.id === id)?.name || id).join(" + ")}` : "Pesquisa inicial"}</small></div>
                ${node.unlocked ? '<b>ATIVA</b>' : `<button type="button" data-unlock-research="${node.id}" ${node.available && node.affordable ? "" : "disabled"}>${node.cost} PT</button>`}
              </article>
            `;
          }).join("")}</div>
        </section>
      `).join("");
      researchContent.querySelectorAll("[data-unlock-research]").forEach(button => {
        button.addEventListener("click", () => {
          const result = system.unlockResearch(button.dataset.unlockResearch);
          toast(result.message);
          renderResearch();
        });
      });
    }

    function ingredientList(reaction) {
      const reactants = reaction.need.map(([id, quantity]) => `${quantity}× ${itemName(id)}`);
      if (reaction.catalyst) reactants.push(`${reaction.catalyst[1]}× ${itemName(reaction.catalyst[0])} (catalisador reutilizável)`);
      if (reaction.fuel) reactants.push(`${reaction.fuel[1]}× ${itemName(reaction.fuel[0])} (combustível)`);
      return reactants.join(" + ");
    }

    function renderReactionCard(reaction, stationId) {
      const availability = system.reactionAvailability(reaction.id, stationId, getEquippedIds());
      const explanationLevel = system.getSettings().explanationLevel;
      const equation = explanationLevel === "simple" ? "" : `<code>${escapeHTML(reaction.equation)}</code>`;
      const extended = explanationLevel === "extended"
        ? `<div class="reaction-details"><span>Temperatura-alvo: ${reaction.temperature ?? "ambiente"} °C</span><span>Pressão: ${reaction.pressure ?? 1} atm</span><span>Duração: ${(reaction.duration / 1000).toFixed(1)} s</span><span>Risco dominante: ${escapeHTML(reaction.risk?.type || "baixo")}</span>${reaction.producedGases?.length ? `<span>Gases: ${escapeHTML(reaction.producedGases.map(([id, quantity]) => `${quantity}× ${itemName(id)}`).join(" + "))}</span>` : ""}${reaction.failureConditions?.length ? `<span>Falhas: ${escapeHTML(reaction.failureConditions.join("; "))}</span>` : ""}</div>`
        : "";
      return `
        <article class="station-reaction ${availability.ok ? "ready" : "blocked"}">
          <header><div><span>${escapeHTML(reaction.feedback)}</span><h3>${escapeHTML(reaction.name)}</h3></div><b>${Math.ceil(reaction.duration / 1000)} s</b></header>
          ${equation}
          <p>${escapeHTML(reaction.description)}</p>
          ${extended}
          <small>${escapeHTML(ingredientList(reaction))}${reaction.container ? ` · recipiente: ${escapeHTML(itemName(reaction.container))}` : ""}</small>
          ${availability.warning ? `<div class="station-warning">⚠ ${escapeHTML(availability.warning)}</div>` : ""}
          <button type="button" data-run-reaction="${reaction.id}" ${availability.ok && !reactionRunning ? "" : "disabled"}>${availability.ok ? "Executar experimento" : escapeHTML(availability.message)}</button>
        </article>
      `;
    }

    function renderAnalysis(stationId) {
      const samples = system.getSamples();
      if (!samples.length) {
        return '<div class="science-empty-panel"><b>Sem amostras disponíveis</b><p>Colete uma amostra em campo antes de usar esta estação.</p></div>';
      }
      return `<div class="station-sample-list">${samples.map(sample => `
        <article>
          <div><span>${escapeHTML(sample.kind)}</span><b>${escapeHTML(sample.name)}</b><small>${Object.keys(sample.revealedProperties || {}).length} propriedades conhecidas</small></div>
          <button type="button" data-analyze-sample="${escapeHTML(sample.id)}">Analisar</button>
        </article>
      `).join("")}</div>`;
    }

    function renderMaintenance() {
      const ids = [...new Set(getEquippedIds())];
      const conditions = system.getEquipmentConditions(ids);
      if (!conditions.length) {
        return '<div class="science-empty-panel"><b>Nenhum equipamento científico equipado</b><p>Equipe um EPI, cilindro, filtro ou ferramenta antes de realizar manutenção.</p></div>';
      }
      return `<div class="maintenance-list">${conditions.map(condition => {
        const ratio = Math.round(condition.ratio * 100);
        return `
          <article class="${condition.broken ? "broken" : ""}">
            <div class="maintenance-heading"><div><span>${condition.broken ? "QUEBRADO" : "CONDIÇÃO"}</span><b>${escapeHTML(itemName(condition.id))}</b></div><strong>${ratio}%</strong></div>
            <div class="condition-track"><i style="--condition:${ratio}%"></i></div>
            ${condition.filter !== null ? `<small>Filtro: ${Math.ceil(condition.filter)} / ${condition.filterMaximum}</small>` : ""}
            ${condition.oxygen !== null ? `<small>Oxigênio: ${Math.ceil(condition.oxygen)} / ${condition.oxygenMaximum}</small>` : ""}
            <div class="maintenance-actions">
              <button type="button" data-repair-equipment="${condition.id}" ${ratio >= 100 ? "disabled" : ""}>Reparar</button>
              ${condition.filter !== null ? `<button type="button" data-refill-filter="${condition.id}" ${condition.filter >= condition.filterMaximum ? "disabled" : ""}>Trocar filtro</button>` : ""}
              ${condition.oxygen !== null ? `<button type="button" data-refill-oxygen="${condition.id}" ${condition.oxygen >= condition.oxygenMaximum ? "disabled" : ""}>Reabastecer O₂</button>` : ""}
            </div>
          </article>
        `;
      }).join("")}</div>`;
    }

    function renderSampleStorage() {
      const samples = system.getSamples();
      if (!samples.length) return '<div class="science-empty-panel"><b>Armário vazio</b><p>As amostras seladas aparecerão aqui.</p></div>';
      return `<div class="storage-list">${samples.map(sample => `
        <article><div><span>${escapeHTML(sample.kind)} · ${escapeHTML(sample.biome)}</span><b>${escapeHTML(sample.name)}</b><small>${escapeHTML(sample.source)} · ${formatDate(sample.collectedAt)}</small></div><button type="button" data-release-sample="${escapeHTML(sample.id)}">Descartar e recuperar recipiente</button></article>
      `).join("")}</div>`;
    }

    function renderRefrigeration() {
      const samples = system.getSamples();
      if (!samples.length) return '<div class="science-empty-panel"><b>Nenhuma amostra para conservar</b><p>Colete materiais biológicos, vegetais ou água antes de usar a unidade.</p></div>';
      return `<div class="storage-list">${samples.map(sample => `
        <article>
          <div><span>${escapeHTML(sample.kind)} · contaminação ${Math.round(sample.contamination || 0)}%</span><b>${escapeHTML(sample.name)}</b><small>${sample.refrigerated ? "Temperatura controlada ativa" : "Envelhecimento natural ativo"}</small></div>
          <button type="button" data-refrigerate-sample="${escapeHTML(sample.id)}" data-preserved="${sample.refrigerated ? "true" : "false"}">${sample.refrigerated ? "Retirar" : "Refrigerar"}</button>
        </article>
      `).join("")}</div>`;
    }

    function renderStation() {
      if (!stationContent || !activeStationId) return;
      const station = system.stations[activeStationId];
      if (!station) return;
      if (stationTitle) stationTitle.textContent = station.name;
      if (stationSubtitle) stationSubtitle.textContent = station.purpose;
      if (stationNav) {
        stationNav.innerHTML = activeStationIds.map(id => {
          const entry = system.stations[id];
          return `<button type="button" data-station-id="${id}" class="${id === activeStationId ? "active" : ""}"><i>${entry.icon}</i><span>${escapeHTML(entry.name)}</span></button>`;
        }).join("");
        stationNav.querySelectorAll("[data-station-id]").forEach(button => {
          button.addEventListener("click", () => {
            activeStationId = button.dataset.stationId;
            renderStation();
          });
        });
      }

      const reactions = system.reactions.filter(reaction => reaction.stations.includes(activeStationId));
      const sections = [];
      if (activeStationId === "chemistry_workbench") {
        sections.push(`
          <section class="station-section station-classic">
            <header><div><span>SISTEMA EXISTENTE</span><h3>Bancada clássica do QuimiCraft</h3></div><button type="button" data-open-legacy-chemistry>Abrir receitas já descobertas</button></header>
            <p>As reações da campanha original continuam disponíveis e conectadas às missões do Prof. Carbono.</p>
          </section>
        `);
      }
      if (reactions.length) {
        sections.push(`
          <section class="station-section">
            <header><div><span>PROCESSOS DISPONÍVEIS</span><h3>Reações desta estação</h3></div></header>
            <div class="station-reaction-grid">${reactions.map(reaction => renderReactionCard(reaction, activeStationId)).join("")}</div>
          </section>
        `);
      }
      if (ANALYSIS_STATIONS.has(activeStationId)) {
        sections.push(`
          <section class="station-section">
            <header><div><span>ANÁLISE DE MATERIAL</span><h3>Amostras compatíveis</h3></div></header>
            ${renderAnalysis(activeStationId)}
          </section>
        `);
      }
      if (["chemistry_workbench", "electrolysis", "sample_storage"].includes(activeStationId)) {
        sections.push(`
          <section class="station-section">
            <header><div><span>SEM DESCARTE AUTOMÁTICO</span><h3>Manutenção de equipamentos</h3></div></header>
            ${renderMaintenance()}
          </section>
        `);
      }
      if (activeStationId === "sample_storage") {
        sections.push(`
          <section class="station-section">
            <header><div><span>ARQUIVO FÍSICO</span><h3>Amostras armazenadas</h3></div></header>
            ${renderSampleStorage()}
          </section>
        `);
      }
      if (activeStationId === "refrigeration") {
        sections.push(`
          <section class="station-section">
            <header><div><span>CONSERVAÇÃO ATIVA</span><h3>Temperatura controlada</h3></div></header>
            <div class="science-callout"><b>Refrigeração funcional</b><span>Amostras de água, plantas, fungos e animais acumulam contaminação lentamente fora desta unidade.</span></div>
            ${renderRefrigeration()}
          </section>
        `);
      }
      stationContent.innerHTML = sections.join("") || '<p class="science-empty">Nenhuma operação disponível nesta estação.</p>';
      bindStationActions();
    }

    function bindStationActions() {
      stationContent.querySelector("[data-open-legacy-chemistry]")?.addEventListener("click", () => openLegacyChemistry());
      stationContent.querySelectorAll("[data-run-reaction]").forEach(button => {
        button.addEventListener("click", () => runReaction(button.dataset.runReaction));
      });
      stationContent.querySelectorAll("[data-analyze-sample]").forEach(button => {
        button.addEventListener("click", () => {
          const result = system.analyzeSample(button.dataset.analyzeSample, activeStationId);
          toast(result.message);
          renderStation();
          renderNotebook();
        });
      });
      stationContent.querySelectorAll("[data-repair-equipment]").forEach(button => {
        button.addEventListener("click", () => {
          const result = system.repairEquipment(button.dataset.repairEquipment);
          toast(result.message);
          refreshInventory();
          renderStation();
        });
      });
      stationContent.querySelectorAll("[data-refill-filter]").forEach(button => {
        button.addEventListener("click", () => {
          const result = system.refillEquipment(button.dataset.refillFilter, "filter");
          toast(result.message);
          refreshInventory();
          renderStation();
        });
      });
      stationContent.querySelectorAll("[data-refill-oxygen]").forEach(button => {
        button.addEventListener("click", () => {
          const result = system.refillEquipment(button.dataset.refillOxygen, "oxygen");
          toast(result.message);
          refreshInventory();
          renderStation();
        });
      });
      stationContent.querySelectorAll("[data-release-sample]").forEach(button => {
        button.addEventListener("click", () => {
          const result = system.releaseSample(button.dataset.releaseSample);
          toast(result.message);
          refreshInventory();
          renderStation();
          renderNotebook();
        });
      });
      stationContent.querySelectorAll("[data-refrigerate-sample]").forEach(button => {
        button.addEventListener("click", () => {
          const result = system.setSampleRefrigerated(button.dataset.refrigerateSample, button.dataset.preserved !== "true");
          toast(result.message);
          renderStation();
          renderNotebook();
        });
      });
    }

    function runReaction(reactionId) {
      if (reactionRunning) return;
      const availability = system.reactionAvailability(reactionId, activeStationId, getEquippedIds());
      if (!availability.ok) {
        toast(availability.message);
        renderStation();
        return;
      }
      reactionRunning = true;
      stationContent.classList.add("reaction-running");
      const reaction = availability.reaction;
      playFeedback("reaction-start", reaction.feedback);
      const progress = document.createElement("div");
      progress.className = `reaction-progress feedback-${reaction.feedback}`;
      progress.innerHTML = `<div><span></span><i></i></div><b>${escapeHTML(reaction.name)}</b><small>Controlando temperatura, tempo e contenção…</small>`;
      stationContent.prepend(progress);
      const reduceMotion = system.getSettings().reducedMotion;
      const duration = reduceMotion ? Math.min(700, reaction.duration) : reaction.duration;
      progress.style.setProperty("--reaction-duration", `${duration}ms`);
      global.setTimeout(() => {
        const result = system.performReaction(reactionId, activeStationId, getEquippedIds());
        playFeedback(result.ok ? "reaction-complete" : "reaction-failed", reaction.feedback);
        reactionRunning = false;
        stationContent.classList.remove("reaction-running");
        toast(result.message);
        if (result.ok) recordReaction(reactionId);
        refreshInventory();
        renderStation();
        renderNotebook();
        renderResearch();
      }, duration);
    }

    function openNotebook(tab = activeNotebookTab) {
      activeNotebookTab = NOTEBOOK_TABS.some(([id]) => id === tab) ? tab : "overview";
      renderNotebook();
      openModal("scientificNotebook");
    }

    function openResearch() {
      renderResearch();
      openModal("researchTree");
    }

    function openStation(ids) {
      activeStationIds = [...new Set((ids || []).filter(id => system.stations[id]))];
      if (!activeStationIds.length) return false;
      activeStationId = activeStationIds[0];
      renderStation();
      openModal("scienceStation");
      return true;
    }

    function updateHUD(snapshot) {
      const data = snapshot || system.getSnapshot();
      const signature = JSON.stringify({
        temperature: data.bodyTemperature,
        state: data.temperatureState?.id,
        hazards: data.hazards?.map(hazard => [hazard.id, hazard.value]),
        effects: data.statusEffects?.map(effect => [effect.id, effect.severity])
      });
      if (signature === lastHudSignature) return;
      lastHudSignature = signature;

      if (temperaturePanel) {
        const temperature = Number(data.bodyTemperature || 37);
        const state = data.temperatureState || { id: "comfortable", label: "Confortável" };
        temperaturePanel.dataset.state = state.id;
        temperaturePanel.classList.toggle("show", state.id !== "comfortable" || data.wetness >= 30);
        if (temperatureLabel) temperatureLabel.textContent = state.label;
        if (temperatureValue) temperatureValue.textContent = `${temperature.toFixed(1)} °C`;
        if (temperatureFill) {
          const normalized = Math.max(0, Math.min(100, (temperature - 32) / 9 * 100));
          temperatureFill.style.width = `${normalized}%`;
        }
      }

      if (hazardPanel) {
        const hazards = data.hazards || [];
        hazardPanel.classList.toggle("show", hazards.length > 0);
        hazardPanel.innerHTML = hazards.map(hazard => `
          <article data-hazard="${hazard.id}" data-level="${hazard.value >= 65 ? "critical" : hazard.value >= 32 ? "warning" : "notice"}">
            <i aria-hidden="true">${escapeHTML(hazard.icon)}</i>
            <div><b>${escapeHTML(hazard.label)}</b><span>${hazard.value}% exposição · ${hazard.protection}% protegido</span></div>
          </article>
        `).join("");
      }

      if (statusPanel) {
        const effects = data.statusEffects || [];
        statusPanel.classList.toggle("show", effects.length > 0);
        statusPanel.innerHTML = effects.map(effect => `<span data-severity="${effect.severity}">${escapeHTML(effect.label)}</span>`).join("");
      }

      if (climateOverlay) {
        const stateId = data.temperatureState?.id || "comfortable";
        climateOverlay.classList.toggle("heat", ["warm", "very-hot", "overheating"].includes(stateId));
        climateOverlay.classList.toggle("cold", ["cold", "very-cold", "freezing"].includes(stateId));
        climateOverlay.classList.toggle("severe", ["freezing", "overheating"].includes(stateId));
      }
    }

    function applySettings() {
      const settings = system.getSettings();
      const root = document.documentElement;
      root.classList.toggle("reduced-motion", settings.reducedMotion);
      root.classList.toggle("reduced-underwater", settings.reducedUnderwaterDistortion);
      root.classList.toggle("reduced-flashing", settings.reducedFlashing);
      root.classList.toggle("large-interface", settings.largeText);
      root.classList.toggle("high-contrast-ui", settings.highContrast);
      root.classList.toggle("colorblind-hazards", settings.colorblindHazards);
      root.classList.toggle("disable-screen-shake", settings.disableShake);
      const fields = {
        reducedMotion: "reducedMotion",
        reducedUnderwaterDistortion: "reducedUnderwater",
        reducedFlashing: "reducedFlashing",
        largeText: "largeInterfaceText",
        highContrast: "highContrast",
        colorblindHazards: "colorblindHazards",
        foodSpoilage: "foodSpoilage",
        disableShake: "disableShake",
        survivalDifficulty: "survivalDifficulty",
        eventFrequency: "eventFrequency",
        explanationLevel: "scienceExplanation"
      };
      for (const [key, id] of Object.entries(fields)) {
        const field = document.getElementById(id);
        if (!field) continue;
        if (field.type === "checkbox") field.checked = !!settings[key];
        else field.value = settings[key];
      }
    }

    function bindSettings() {
      const fields = {
        reducedMotion: "reducedMotion",
        reducedUnderwaterDistortion: "reducedUnderwater",
        reducedFlashing: "reducedFlashing",
        largeText: "largeInterfaceText",
        highContrast: "highContrast",
        colorblindHazards: "colorblindHazards",
        foodSpoilage: "foodSpoilage",
        disableShake: "disableShake",
        survivalDifficulty: "survivalDifficulty",
        eventFrequency: "eventFrequency",
        explanationLevel: "scienceExplanation"
      };
      for (const [key, id] of Object.entries(fields)) {
        const field = document.getElementById(id);
        if (!field) continue;
        field.addEventListener("change", () => {
          const value = field.type === "checkbox" ? field.checked : field.value;
          system.updateSettings({ [key]: value });
          applySettings();
          if (activeStationId) renderStation();
        });
      }
    }

    function bind() {
      document.getElementById("notebookHudBtn")?.addEventListener("click", () => openNotebook());
      document.getElementById("researchHudBtn")?.addEventListener("click", () => openResearch());
      document.querySelectorAll("[data-close-science]").forEach(button => {
        button.addEventListener("click", () => closeModal(button.dataset.closeScience));
      });
      bindSettings();
      applySettings();
      renderNotebookTabs();
      updateHUD(system.getSnapshot());
    }

    bind();

    return Object.freeze({
      openNotebook,
      openResearch,
      openStation,
      renderNotebook,
      renderResearch,
      renderStation,
      updateHUD,
      applySettings,
      getActiveStation: () => activeStationId
    });
  }

  global.QuimiCraftScienceUI = Object.freeze({ createScienceUI });
})(window);
