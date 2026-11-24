'use strict';
/**
 * shop.js — Floricultura 2D de Mendel
 * Experiência 2D lúdica, sem piscar de tela (atualizações pontuais de DOM):
 *  - Balcão 2D persistente com cliente ilustrado, balão de fala e fila
 *  - Alelos exibidos diretamente ao lado de cada característica (ex.: Amarela (cc))
 *  - Mesa de cruzamento 2D com Rascunho de Mendel em branco para o próprio jogador preencher
 *  - Venda direta de pedidos e venda de plantas extras por moedas
 *  - Modais leves de Sementes e Catálogo atualizados no lugar (sem piscar)
 */
const Floricultura = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const genLabel = g => (g === 0 ? 'Matriz' : `F${g}`);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const CUSTOMERS = [
    { name: 'Clarice Moura', role: 'Decoradora & Florista', sprite: 'assets/floricultura/cust-clarice.png', prefs: ['flor_mendel', 'tulipa', 'orquidea', 'rosa', 'girassol'] },
    { name: 'Marcos Vilela', role: 'Agrônomo Local', sprite: 'assets/floricultura/cust-marcos.png', prefs: ['milho', 'soja', 'ervilha', 'tomate', 'girassol'] },
    { name: 'Chef Helena Prado', role: 'Chef Botânica', sprite: 'assets/floricultura/cust-helena.png', prefs: ['tomate', 'morango', 'pimenta', 'macieira', 'laranjeira', 'pitaia'] },
    { name: 'Sr. Takeshi Sato', role: 'Mestre de Bonsai', sprite: 'assets/floricultura/cust-takeshi.png', prefs: ['cerejeira', 'macieira', 'cacto', 'suculenta', 'laranjeira'] },
    { name: 'Dona Rosa', role: 'Colecionadora de Jardins', sprite: 'assets/floricultura/cust-dona-rosa.png', prefs: ['rosa', 'girassol', 'flor_mendel', 'tulipa', 'morango'] },
    { name: 'Léo Freitas', role: 'Estudante de Biologia', sprite: 'assets/floricultura/cust-leo.png', prefs: ['dioneia', 'ervilha', 'flor_mendel', 'cacto', 'milho'] },
    { name: 'Dra. Amara Silva', role: 'Botânica Pesquisadora', sprite: 'assets/floricultura/cust-amara.png', prefs: ['orquidea', 'dioneia', 'pitaia', 'soja', 'suculenta'] },
    { name: 'Caio Mendes', role: 'Chef de Pimentas', sprite: 'assets/floricultura/cust-caio.png', prefs: ['pimenta', 'tomate', 'milho', 'morango', 'laranjeira'] },
    { name: 'Luna Vasconcelos', role: 'Artista de Terrários', sprite: 'assets/floricultura/cust-luna.png', prefs: ['suculenta', 'cacto', 'dioneia', 'cerejeira', 'orquidea'] },
    { name: 'Seu Antônio', role: 'Dono do Pomar', sprite: 'assets/floricultura/cust-antonio.png', prefs: ['macieira', 'laranjeira', 'morango', 'milho', 'soja', 'tomate'] },
  ];

  const ui = {
    activeSpecies: 'flor_mendel',
    activeOrderId: null,
    selected: [],          // [idA, idB] na mesa de cruzamento
    nursery: null,         // { speciesId, parents, gen, seedlings, settled }
    showHint: false,       // Dica genética no balão do cliente
    draft: {               // Rascunho manual de Mendel preenchido pelo jogador
      pairKey: '',
      geneKey: '',
      genes: {},
    },
    // Estado dos modais leves
    herbCat: 'todas',
    seedTab: 'especies',   // 'especies' | 'livre'
    customSpecies: 'milho',
    customGeno: null,
  };

  let containerEl = null;
  // Cache de seções para evitar recriação de DOM/imagens e eliminar qualquer piscar
  let cache = {};
  function resetCache() {
    cache = {
      custKey: '',
      bubbleHTML: '',
      queueHTML: '',
      ledgeHTML: '',
      shelfHTML: '',
      restockHTML: '',
      slotsHTML: '',
      benchHTML: '',
    };
  }

  // =========================================================================
  // GARANTIA DE ESTOQUE, ALELOS VISÍVEIS POR PADRÃO E FILA DE CLIENTES
  // =========================================================================
  function ensureShopData() {
    const state = GameState.get();
    const shop = state.shop;
    let dirty = false;

    if (shop.initAllelesDone !== true) {
      shop.initAllelesDone = true;
      state.settings.xray = true;
      dirty = true;
    }

    if (!Array.isArray(shop.unlockedSpecies) || shop.unlockedSpecies.length === 0) {
      shop.unlockedSpecies = ['flor_mendel', 'tulipa', 'cerejeira', 'macieira', 'cacto', 'milho', 'soja', 'tomate'];
      dirty = true;
    } else {
      Genetics.SPECIES.filter(s => s.unlockedByDefault).forEach(s => {
        if (!shop.unlockedSpecies.includes(s.id)) {
          shop.unlockedSpecies.push(s.id);
          dirty = true;
        }
      });
    }

    if (!shop.inventory || typeof shop.inventory !== 'object') {
      shop.inventory = {};
      dirty = true;
    }

    shop.unlockedSpecies.forEach(spId => {
      const sp = Genetics.getSpecies(spId);
      const list = shop.inventory[spId];
      const invalidSaved = !Array.isArray(list) || list.some(p => !p || !p.genotype || !sp.genes.every(g => typeof p.genotype[g.key] === 'string'));
      if (invalidSaved) {
        shop.inventory[spId] = sp.starterStock.map(str => {
          const g = Genetics.parseFor(spId, str);
          GameState.discoverSpecies(g, spId);
          return { id: shop.nextPlantId++, speciesId: spId, genotype: g, gen: 0, parents: null };
        });
        dirty = true;
      }
    });

    if (!Array.isArray(shop.orders) || shop.orders.length === 0) {
      shop.orders = [];
      dirty = true;
    }
    // Remove pedidos salvos antigos cujos códigos fenotípicos foram atualizados
    shop.orders = shop.orders.filter(o => {
      const sp = Genetics.getSpecies(o.speciesId);
      return sp && sp.genes.every(g => {
        const want = o.target && o.target[g.trait];
        return !want || Object.values(g.values).some(v => v.code === want);
      });
    });
    shop.orders.forEach(o => {
      if (!o.sprite) {
        const c = CUSTOMERS.find(x => x.name === o.customerName) || CUSTOMERS[o.id % CUSTOMERS.length];
        o.sprite = c.sprite;
        dirty = true;
      }
    });
    while (shop.orders.length < 3) {
      shop.orders.push(createOrder(shop));
      dirty = true;
    }

    if (!ui.activeOrderId || !shop.orders.some(o => o.id === ui.activeOrderId)) {
      ui.activeOrderId = shop.orders[0].id;
      ui.activeSpecies = shop.orders[0].speciesId;
    }
    if (!shop.unlockedSpecies.includes(ui.activeSpecies)) {
      ui.activeSpecies = shop.unlockedSpecies[0];
    }

    if (dirty) GameState.updateShop(() => {});
  }

  function createOrder(shop) {
    const unlocked = shop.unlockedSpecies;
    const usedSp = new Set((shop.orders || []).map(o => o.speciesId));
    const freshSp = unlocked.filter(id => !usedSp.has(id));
    const speciesId = freshSp.length ? pick(freshSp) : pick(unlocked);
    const sp = Genetics.getSpecies(speciesId);

    const usedCust = new Set((shop.orders || []).map(o => o.customerName));
    const freshCusts = CUSTOMERS.filter(c => !usedCust.has(c.name));
    const pool = freshCusts.length ? freshCusts : CUSTOMERS;
    const matchingCust = pool.filter(c => c.prefs.includes(speciesId));
    const cust = matchingCust.length ? pick(matchingCust) : pick(pool);

    const wantThree = shop.ordersCompleted >= 3 && Math.random() < 0.42;
    const starterKeys = new Set(sp.starterStock.map(s =>
      Genetics.phenoKeyFor(speciesId, Genetics.phenotypeFor(speciesId, Genetics.parseFor(speciesId, s)))
    ));

    const catalog = Genetics.catalogForSpecies(speciesId);
    const candidates = catalog.filter(e => !starterKeys.has(e.key));
    const chosenEntry = pick(candidates.length ? candidates : catalog);

    const target = {};
    if (wantThree) {
      sp.genes.forEach(g => { target[g.trait] = chosenEntry.pheno[g.trait]; });
    } else {
      const secondGene = pick([sp.genes[1], sp.genes[2]]);
      target[sp.genes[0].trait] = chosenEntry.pheno[sp.genes[0].trait];
      target[secondGene.trait] = chosenEntry.pheno[secondGene.trait];
    }

    const reqLabels = sp.genes
      .filter(g => target[g.trait])
      .map(g => Genetics.traitInfoFor(speciesId, g.trait, target[g.trait]).label);

    const isVip = wantThree;
    const reward = Math.round((sp.baseValue * (isVip ? 1.55 : 1.05)) / 5) * 5;

    const greetings = [
      `Oi! Estou procurando uma muda de <b>${sp.name}</b> com`,
      `Bom dia! Você consegue cultivar <b>${sp.name}</b> com`,
      `Olá! Quero encomendar uma <b>${sp.name}</b> que tenha`,
      `Tudo bem? Preciso de uma <b>${sp.name}</b> reunindo`,
    ];
    const reqText = reqLabels.length === 3
      ? `<b>${reqLabels[0]}</b>, <b>${reqLabels[1]}</b> e <b>${reqLabels[2]}</b>!`
      : `<b>${reqLabels[0]}</b> e <b>${reqLabels[1]}</b>!`;

    return {
      id: shop.nextOrderId++,
      customerName: cust.name,
      customerRole: cust.role,
      sprite: cust.sprite,
      speciesId,
      target,
      tier: isVip ? 'Pedido Especial' : 'Pedido',
      reward,
      dialogue: `${pick(greetings)} ${reqText}`,
    };
  }

  function buildGeneticTip(order) {
    const sp = Genetics.getSpecies(order.speciesId);
    const lines = sp.genes.filter(g => order.target[g.trait]).map(g => {
      const want = order.target[g.trait];
      const info = Genetics.traitInfoFor(order.speciesId, g.trait, want);
      if (g.mode === 'incomplete' || g.mode === 'codominant') {
        if (want === g.values.het.code) {
          const kind = g.mode === 'codominant' ? 'é codominante (mostra as duas cores juntas)' : 'é intermediária (mistura das duas cores)';
          return `<b>${info.label} (${g.dom}${g.rec})</b> ${kind}: cruze <b>${g.values.dom.label} (${g.dom}${g.dom})</b> × <b>${g.values.rec.label} (${g.rec}${g.rec})</b>!`;
        }
        const pair = want === g.values.dom.code ? `${g.dom}${g.dom}` : `${g.rec}${g.rec}`;
        return `<b>${info.label} (${pair})</b> precisa de dois alelos iguais — cruze plantas que carreguem esse alelo.`;
      }
      if (want === g.values.rec.code) {
        return `<b>${info.label} (${g.rec}${g.rec})</b> é recessiva: precisa receber <b>${g.rec}</b> dos dois pais.`;
      }
      return `<b>${info.label} (${g.dom}_)</b> é dominante: basta herdar um alelo <b>${g.dom}</b>.`;
    });
    return lines.join(' ');
  }

  function findMatchingPlant(speciesId, target) {
    const inv = GameState.get().shop.inventory[speciesId] || [];
    return inv.find(p => Genetics.matchesFor(speciesId, Genetics.phenotypeFor(speciesId, p.genotype), target)) || null;
  }

  function getActiveOrder() {
    const shop = GameState.get().shop;
    return (shop.orders || []).find(o => o.id === ui.activeOrderId) || (shop.orders && shop.orders[0]) || null;
  }

  const isXrayOn = () => !!GameState.get().settings.xray;

  function formatAllele(ch) {
    if (ch === '_') return `<b class="al-unk">_</b>`;
    return `<b class="${ch === ch.toUpperCase() ? 'al-dom' : 'al-rec'}">${ch}</b>`;
  }

  function formatAllelePair(str) {
    return [...str].map(formatAllele).join('');
  }

  function targetNotationFor(g, code) {
    if (g.mode === 'incomplete' || g.mode === 'codominant') {
      if (code === g.values.dom.code) return g.dom + g.dom;
      if (code === g.values.het.code) return g.dom + g.rec;
      return g.rec + g.rec;
    }
    return code === g.values.rec.code ? (g.rec + g.rec) : (g.dom + '_');
  }

  // Chips de características com os alelos exibidos diretamente ao lado (ex.: Amarela (cc))
  function traitChipsFor(speciesId, pheno, opts = {}) {
    const { compact = false, targetMask = null, genotype = null, targetNotation = false } = opts;
    const sp = Genetics.getSpecies(speciesId);
    return `<div class="chips ${compact ? 'compact' : ''}">
      ${sp.genes.map(g => {
        const val = pheno[g.trait];
        if (!val) return '';
        const info = Genetics.traitInfoFor(speciesId, g.trait, val);
        const isMatched = targetMask && targetMask[g.trait] && targetMask[g.trait] === val;
        const dot = info.dot ? `<i class="dot" style="background:${info.dot}"></i>` : '';
        let alHTML = '';
        if (genotype && genotype[g.key]) {
          alHTML = `<span class="chip-al mono">(${formatAllelePair(genotype[g.key])})</span>`;
        } else if (targetNotation) {
          alHTML = `<span class="chip-al mono">(${formatAllelePair(targetNotationFor(g, val))})</span>`;
        }
        return `<span class="chip ${info.highlight ? 'chip-bio' : ''} ${isMatched ? 'chip-req-ok' : ''}">${dot}${info.label}${alHTML}</span>`;
      }).join('')}
    </div>`;
  }

  // =========================================================================
  // RASCUNHO MANUAL DE MENDEL (EM BRANCO PARA O JOGADOR PREENCHER)
  // =========================================================================
  function canonicalPair(g, a1, a2) {
    if (!a1 || !a2) return '';
    if (a1 === g.dom && a2 === g.dom) return g.dom + g.dom;
    if (a1 === g.rec && a2 === g.rec) return g.rec + g.rec;
    return g.dom + g.rec;
  }

  function sameAlleleMultiset(arr, pairStr) {
    if (!arr[0] || !arr[1] || !pairStr || pairStr.length !== 2) return false;
    const s1 = [...arr].sort().join('');
    const s2 = [...pairStr].sort().join('');
    return s1 === s2;
  }

  function ensureDraftFor(speciesId, a, b, activeOrder) {
    const pairKey = `${speciesId}:${a.id}:${b.id}`;
    const sp = Genetics.getSpecies(speciesId);
    if (ui.draft.pairKey === pairKey && ui.draft.genes[sp.genes[0].key]) return;

    const genes = {};
    sp.genes.forEach(g => {
      genes[g.key] = {
        rowA: ['', ''],
        colB: ['', ''],
        cells: [['', ''], ['', '']],
        checked: false,
      };
    });

    // Abre direto na primeira característica pedida pelo cliente (se houver)
    const wantedGene = activeOrder && activeOrder.speciesId === speciesId
      ? sp.genes.find(g => activeOrder.target[g.trait])
      : null;

    ui.draft = {
      pairKey,
      geneKey: wantedGene ? wantedGene.key : sp.genes[0].key,
      genes,
    };
  }

  function evaluateGeneDraft(g, gd, genoA, genoB) {
    const aOk = sameAlleleMultiset(gd.rowA, genoA);
    const bOk = sameAlleleMultiset(gd.colB, genoB);
    const cellStatus = [[null, null], [null, null]];
    let cellsOk = 0;
    let filledCells = 0;

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const val = gd.cells[r][c];
        if (val) filledCells++;
        const exp = canonicalPair(g, gd.rowA[r], gd.colB[c]);
        if (exp && val === exp) {
          cellStatus[r][c] = 'ok';
          cellsOk++;
        } else {
          cellStatus[r][c] = 'err';
        }
      }
    }

    const allPerfect = aOk && bOk && cellsOk === 4;
    return { aOk, bOk, cellStatus, cellsOk, filledCells, allPerfect };
  }

  // =========================================================================
  // MONTAGEM PERSISTENTE (SEM PISCAR!) + ATUALIZAÇÕES PONTUAIS
  // =========================================================================
  function mountShell() {
    resetCache();
    containerEl.innerHTML = `<section class="flor-app sheet-anim">
      <div class="flor-hud glass-panel">
        <div class="fh-title">
          <span class="fh-leaf">${UIArt.icon('leaf', 18)}</span>
          <div>
            <h1>Floricultura</h1>
            <span class="mono fh-day" id="fh-day"></span>
          </div>
        </div>

        <div class="fh-stats mono">
          <span class="kpi-pill kpi-credits" title="Moedas da Floricultura">${UIArt.icon('coin', 15)} <b id="fh-credits"></b></span>
          <span class="kpi-pill kpi-rep" title="Vendas concluídas">${UIArt.icon('star', 14)} <b id="fh-sales"></b> <small>vendas</small></span>
        </div>

        <div class="fh-actions">
          <button class="btn btn-glass btn-small btn-toggle" id="flor-btn-xray" title="Mostrar ou ocultar os alelos ao lado das características">
            ${UIArt.icon('dna', 14)} Alelos <span class="pill" id="fh-xray-pill"></span>
          </button>
          <button class="btn btn-glass btn-small" id="flor-open-seeds">
            ${UIArt.icon('seed', 14)} Sementes <span class="mono small" id="fh-seeds-cnt"></span>
          </button>
          <button class="btn btn-glass btn-small" id="flor-open-catalog">
            ${UIArt.icon('book', 14)} Catálogo <span class="mono small" id="fh-cat-cnt"></span>
          </button>
        </div>
      </div>

      <!-- CENA 2D PERSISTENTE DO BALCÃO -->
      <div class="flor-stage">
        <div class="flor-stage-bg" style="background-image:url('assets/floricultura/bg-floricultura.jpg')"></div>
        <div class="flor-stage-vignette"></div>
        <div class="flor-stage-content">
          <div id="flor-customer-slot"></div>
          <div id="flor-bubble-slot"></div>
          <div class="flor-queue" id="flor-queue-slot"></div>
        </div>
        <div class="flor-counter-ledge"></div>
      </div>

      <!-- FAIXA DE ESPÉCIES DA ESTUFA -->
      <div class="flor-ledge glass-panel">
        <div class="fl-pills" id="flor-ledge-pills"></div>
        <button class="btn btn-glass btn-small fl-more" id="flor-more-species">
          ${UIArt.icon('plus', 13)} Mais Espécies
        </button>
      </div>

      <!-- ÁREA INTEGRADA: ESTOQUE (ESQ) + MESA DE CRUZAMENTO 2D (DIR) -->
      <div class="flor-workspace">
        <section class="glass-panel flor-shelf" aria-labelledby="flor-shelf-head">
          <div class="panel-head">
            <div>
              <h2 id="flor-shelf-head"></h2>
              <span class="small muted" id="flor-shelf-sub"></span>
            </div>
            <span class="counter mono" id="flor-shelf-count"></span>
          </div>
          <div id="flor-restock-slot"></div>
          <div class="plant-grid" id="flor-inv-grid"></div>
        </section>

        <section class="flor-bench-panel glass-panel" aria-labelledby="flor-bench-head">
          <div class="flor-bench-tabletop" style="background-image:url('assets/floricultura/counter-bench.jpg')">
            <div class="fbt-scrim"></div>
            <div class="fbt-inner">
              <div class="fbt-head">
                <h2 id="flor-bench-head">Mesa de Cruzamento</h2>
                <span class="mono small fbt-sub">Clique em 2 vasos (ou 2× no mesmo para autofecundar)</span>
              </div>
              <div id="flor-bench-slots-wrap"></div>
            </div>
          </div>
          <div class="flor-bench-body" id="flor-bench-body"></div>
        </section>
      </div>
    </section>`;

    bindDelegatedEvents();
  }

  function render(targetEl) {
    if (targetEl) containerEl = targetEl;
    if (!containerEl) return;
    ensureShopData();
    document.body.classList.toggle('xray', isXrayOn());

    if (!$('.flor-app', containerEl)) {
      mountShell();
    }
    patchView();
  }

  function patchHUD() {
    const shop = GameState.get().shop;
    const sum = GameState.getSummary();
    const xray = isXrayOn();

    const dayEl = $('#fh-day', containerEl);
    if (dayEl) dayEl.textContent = `DIA ${shop.day} · ESTUFA & BALCÃO DE GENÉTICA`;
    const crEl = $('#fh-credits', containerEl);
    if (crEl) crEl.textContent = `¤ ${shop.credits}`;
    const slEl = $('#fh-sales', containerEl);
    if (slEl) slEl.textContent = String(shop.ordersCompleted);
    const scEl = $('#fh-seeds-cnt', containerEl);
    if (scEl) scEl.textContent = `(${shop.unlockedSpecies.length}/${Genetics.SPECIES.length})`;
    const ccEl = $('#fh-cat-cnt', containerEl);
    if (ccEl) ccEl.textContent = `(${sum.multiSpeciesCount}/${sum.totalCatalog})`;

    const xBtn = $('#flor-btn-xray', containerEl);
    const xPill = $('#fh-xray-pill', containerEl);
    if (xBtn) {
      xBtn.classList.toggle('on', xray);
      xBtn.setAttribute('aria-pressed', String(xray));
    }
    if (xPill) xPill.textContent = xray ? 'ON' : 'OFF';
  }

  function patchView() {
    if (!containerEl || !$('.flor-app', containerEl)) return;
    const shop = GameState.get().shop;
    const order = getActiveOrder();
    const sp = Genetics.getSpecies(ui.activeSpecies);
    const inv = shop.inventory[ui.activeSpecies] || [];
    const cap = shop.potCapacity || 8;
    const orderMatch = order ? findMatchingPlant(order.speciesId, order.target) : null;
    const orderApplies = !!(order && order.speciesId === ui.activeSpecies);

    patchHUD();

    // 1. Cliente 2D no balcão (SÓ recria quando entra um novo cliente!)
    const custKey = order ? `${order.id}:${order.sprite}` : '';
    if (custKey !== cache.custKey) {
      cache.custKey = custKey;
      const custSlot = $('#flor-customer-slot', containerEl);
      if (custSlot) {
        custSlot.innerHTML = order ? `<div class="flor-customer-wrap enter">
          <img class="flor-char-sprite" src="${order.sprite}" alt="${order.customerName}">
          <div class="flor-nameplate">
            <strong>${order.customerName}</strong>
            <span>${order.customerRole}</span>
          </div>
        </div>` : '';
      }
    }

    // 2. Balão de fala do cliente
    const previewGeno = order ? Genetics.exemplarFor(order.speciesId, order.target) : null;
    const orderSp = order ? Genetics.getSpecies(order.speciesId) : null;
    const bubbleHTML = order ? `<div class="flor-bubble">
      <div class="fb-top">
        <span class="fb-sp mono">${orderSp.categoryLabel} · <b>${orderSp.name}</b></span>
        <span class="fb-reward mono">+¤ ${order.reward}</span>
      </div>

      <div class="fb-main">
        <div class="fb-sketch" title="Planta desejada pelo cliente">
          ${PlantArt.renderSpecies(order.speciesId, previewGeno)}
        </div>
        <div class="fb-copy">
          <p class="fb-quote">"${order.dialogue}"</p>
          ${traitChipsFor(order.speciesId, order.target, { targetNotation: true })}
          ${ui.showHint ? `<div class="fb-tip">${UIArt.icon('hint', 14)} <span>${buildGeneticTip(order)}</span></div>` : ''}
        </div>
      </div>

      <div class="fb-actions">
        ${orderMatch
          ? `<button class="btn btn-glow-emerald btn-big" data-deliver-order="${order.id}" data-deliver-plant="${orderMatch.id}">
              ${UIArt.icon('check', 16)} Vender Planta #${orderMatch.id} (+¤ ${order.reward})
            </button>`
          : (order.speciesId !== ui.activeSpecies
              ? `<button class="btn btn-glow-prism btn-small" data-pick-species="${order.speciesId}">
                  Ir para prateleira de ${orderSp.name} ${UIArt.icon('arrowRight', 14)}
                </button>`
              : `<span class="fb-hint-status">Cruze dois vasos abaixo para produzir este pedido!</span>`)}
        <div class="fb-util-btns">
          <button class="btn btn-bubble-soft btn-small" id="flor-toggle-hint" title="Ver dica de genética">
            ${UIArt.icon('hint', 14)} ${ui.showHint ? 'Ocultar dica' : 'Como fazer?'}
          </button>
          <button class="btn btn-bubble-soft btn-small" data-skip-order="${order.id}" title="Chamar outro cliente">
            ${UIArt.icon('refresh', 13)} Outro
          </button>
        </div>
      </div>
    </div>` : '';

    if (bubbleHTML !== cache.bubbleHTML) {
      cache.bubbleHTML = bubbleHTML;
      const bSlot = $('#flor-bubble-slot', containerEl);
      if (bSlot) bSlot.innerHTML = bubbleHTML;
    }

    // 3. Fila de clientes esperando
    const waitingOrders = shop.orders.filter(o => !order || o.id !== order.id);
    const queueHTML = `<span class="fq-label mono">NA FILA</span>` + waitingOrders.map(wo => {
      const wMatch = findMatchingPlant(wo.speciesId, wo.target);
      const wsp = Genetics.getSpecies(wo.speciesId);
      const shortName = wo.customerName.replace(/^(Prof\.|Sr\.|Sra\.|Dra\.|Dr\.|Chef|Dona|Seu)\s+/i, '').split(' ')[0];
      return `<button class="flor-queue-item ${wMatch ? 'ready' : ''}" data-attend-order="${wo.id}" title="Atender ${wo.customerName} (${wsp.name})">
        <img src="${wo.sprite}" alt="${wo.customerName}">
        <span><b>${shortName}</b><small>${wsp.name.split('-')[0]}</small></span>
      </button>`;
    }).join('');

    if (queueHTML !== cache.queueHTML) {
      cache.queueHTML = queueHTML;
      const qSlot = $('#flor-queue-slot', containerEl);
      if (qSlot) qSlot.innerHTML = queueHTML;
    }

    // 4. Faixa de espécies (preservando rolagem horizontal!)
    const ledgeHTML = shop.unlockedSpecies.map(spId => {
      const s = Genetics.getSpecies(spId);
      const count = (shop.inventory[spId] || []).length;
      const wantedHere = order && order.speciesId === spId;
      const otherOrder = shop.orders.some(o => o.speciesId === spId && (!order || o.id !== order.id));
      const cat = Genetics.CATEGORIES.find(c => c.id === s.category) || { accent: '#2FA37C' };
      return `<button class="sp-pill ${spId === ui.activeSpecies ? 'active' : ''} ${wantedHere ? 'wanted' : ''}"
        style="--sp-acc:${cat.accent}" data-pick-species="${spId}">
        <span class="sp-dot" style="background:${cat.accent}"></span>
        <span class="sp-name">${s.name}</span>
        <span class="sp-cnt mono">${count}</span>
        ${wantedHere ? '<span class="sp-req-ping" title="Espécie pedida no balcão"></span>' : (otherOrder ? '<span class="sp-req-dot" title="Cliente na fila pediu esta espécie"></span>' : '')}
      </button>`;
    }).join('');

    if (ledgeHTML !== cache.ledgeHTML) {
      cache.ledgeHTML = ledgeHTML;
      const pillsEl = $('#flor-ledge-pills', containerEl);
      if (pillsEl) {
        const savedScroll = pillsEl.scrollLeft;
        pillsEl.innerHTML = ledgeHTML;
        pillsEl.scrollLeft = savedScroll;
      }
    }

    // 5. Cabeçalho e estoque da prateleira
    const shHead = $('#flor-shelf-head', containerEl);
    if (shHead) shHead.textContent = `Estoque — ${sp.name}`;
    const shSub = $('#flor-shelf-sub', containerEl);
    if (shSub) shSub.textContent = sp.tagline;
    const shCnt = $('#flor-shelf-count', containerEl);
    if (shCnt) shCnt.textContent = `${inv.length}/${cap} vasos`;

    const restockHTML = inv.length < 2 ? `<div class="restock-alert">
      <span>Faltam matrizes para cruzar esta espécie.</span>
      <button class="btn btn-glow-emerald btn-small" id="flor-free-restock">${UIArt.icon('plus', 13)} Repor Matriz (Grátis)</button>
    </div>` : '';
    if (restockHTML !== cache.restockHTML) {
      cache.restockHTML = restockHTML;
      const rSlot = $('#flor-restock-slot', containerEl);
      if (rSlot) rSlot.innerHTML = restockHTML;
    }

    const shelfCards = inv.map(p => {
      const ph = Genetics.phenotypeFor(ui.activeSpecies, p.genotype);
      const delay = -((p.id * 1.37) % 5).toFixed(2);
      const matchesCurrent = orderApplies && Genetics.matchesFor(ui.activeSpecies, ph, order.target);
      const canSellExtra = inv.length > 2;
      return `<div class="plant-card flor-pot-card ${matchesCurrent ? 'is-target' : ''}"
        data-inv-plant="${p.id}" role="button" tabindex="0" style="--d:${delay}s">
        <span class="sel-badge"></span>
        ${canSellExtra ? `<button class="sell-extra-btn mono" data-sell-extra="${p.id}" title="Vender planta avulsa no balcão por ¤ 25">+¤25</button>` : ''}
        <div class="art">${PlantArt.renderSpecies(ui.activeSpecies, p.genotype)}</div>
        ${matchesCurrent ? `<span class="flor-ready-pill mono">PEDIDO PRONTO</span>` : ''}
        <div class="meta">
          <div class="tag">#${p.id} · <span class="gen mono">${genLabel(p.gen)}</span></div>
          ${traitChipsFor(ui.activeSpecies, ph, { compact: true, targetMask: orderApplies ? order.target : null, genotype: p.genotype })}
          ${matchesCurrent ? `<button class="btn btn-glow-emerald btn-xs plant-deliver-btn" data-deliver-order="${order.id}" data-deliver-plant="${p.id}">Entregar +¤${order.reward}</button>` : ''}
        </div>
      </div>`;
    }).join('');
    const emptyPots = Array.from({ length: Math.max(0, cap - inv.length) }, () =>
      '<div class="empty-slot flor-empty"><span>Vaso livre</span></div>'
    ).join('');
    const shelfHTML = shelfCards + emptyPots;

    const invGrid = $('#flor-inv-grid', containerEl);
    if (invGrid) {
      invGrid.classList.toggle('locked', !!ui.nursery);
      if (shelfHTML !== cache.shelfHTML) {
        cache.shelfHTML = shelfHTML;
        invGrid.innerHTML = shelfHTML;
      }
      // Atualiza seleção A/B in-place nas classes sem recriar os SVGs (zero piscar!)
      $$('[data-inv-plant]', invGrid).forEach(card => {
        const pid = Number(card.dataset.invPlant);
        const selIdx = ui.selected.indexOf(pid);
        const selBoth = ui.selected.length === 2 && ui.selected[0] === pid && ui.selected[1] === pid;
        card.classList.toggle('sel', selIdx >= 0);
        card.classList.toggle('sel-0', !selBoth && selIdx === 0);
        card.classList.toggle('sel-1', !selBoth && selIdx === 1);
        card.classList.toggle('sel-both', selBoth);
        const badge = $('.sel-badge', card);
        if (badge) badge.textContent = selBoth ? 'A·B' : (selIdx >= 0 ? 'AB'[selIdx] : '');
      });
    }

    // 6. Vaso A × Vaso B sobre o tampo de madeira persistente
    const slotsHTML = renderBenchSlots(inv);
    if (slotsHTML !== cache.slotsHTML) {
      cache.slotsHTML = slotsHTML;
      const sw = $('#flor-bench-slots-wrap', containerEl);
      if (sw) sw.innerHTML = slotsHTML;
    }

    // 7. Corpo da mesa: Rascunho de Mendel (em branco) ou 4 Mudas brotadas
    patchBenchBody(order);
  }

  function patchBenchBody(orderArg) {
    if (!containerEl) return;
    const order = orderArg !== undefined ? orderArg : getActiveOrder();
    const orderApplies = !!(order && order.speciesId === ui.activeSpecies);
    const benchHTML = ui.nursery && ui.nursery.speciesId === ui.activeSpecies
      ? renderNursery(order)
      : renderMendelDraft(orderApplies ? order : null);

    if (benchHTML !== cache.benchHTML) {
      cache.benchHTML = benchHTML;
      const bodyEl = $('#flor-bench-body', containerEl);
      if (bodyEl) bodyEl.innerHTML = benchHTML;
    }
  }

  function renderBenchSlots(inv) {
    const locked = !!(ui.nursery && ui.nursery.speciesId === ui.activeSpecies);
    const activeIds = locked ? ui.nursery.parents : ui.selected;

    const slot = idx => {
      const id = activeIds[idx];
      const p = id != null ? inv.find(x => x.id === id) : null;
      const letter = 'AB'[idx];
      if (!p) {
        const canSelf = !locked && idx === 1 && activeIds[0] != null;
        return `<div class="parent-slot flor-slot slot-${idx}" data-shop-slot="${idx}">
          <div class="slot-empty">
            <span class="slot-letter">${letter}</span>
            <span>Vaso ${letter}</span>
            ${canSelf ? `<button class="btn btn-glass btn-xs flor-self-btn" data-self-cross="${activeIds[0]}" title="Cruzar #${activeIds[0]} com ela mesma (autofecundação)">Autofecundar #${activeIds[0]}</button>` : ''}
          </div>
        </div>`;
      }
      const ph = Genetics.phenotypeFor(ui.activeSpecies, p.genotype);
      return `<div class="parent-slot flor-slot slot-${idx} filled ${locked ? 'locked' : ''}" data-shop-slot="${idx}" title="${locked ? 'Planta parental deste cruzamento' : 'Clique para tirar da mesa'}">
        <span class="slot-letter">${letter}</span>
        <div class="slot-art">${PlantArt.renderSpecies(ui.activeSpecies, p.genotype)}</div>
        <div class="slot-meta">
          <div class="tag">#${p.id}</div>
          ${traitChipsFor(ui.activeSpecies, ph, { compact: true, genotype: p.genotype })}
        </div>
      </div>`;
    };
    return `<div class="bench flor-bench-slots" id="flor-bench">${slot(0)}<div class="cross-x" aria-hidden="true">×</div>${slot(1)}</div>`;
  }

  // =========================================================================
  // PREVISÃO DE MENDEL — RASCUNHO INTERATIVO EM BRANCO
  // =========================================================================
  function renderMendelDraft(activeOrder) {
    const sp = Genetics.getSpecies(ui.activeSpecies);
    const inv = GameState.get().shop.inventory[ui.activeSpecies] || [];

    if (ui.selected.length < 2) {
      return `<div class="flor-guide">
        <h3>Regras genéticas de ${sp.name}:</h3>
        <div class="gene-rules-mini">
          ${sp.genes.map(g => {
            const isInc = g.mode === 'incomplete';
            const isCod = g.mode === 'codominant';
            const modeTag = isCod ? 'Codominância' : (isInc ? 'Dom. incompleta' : `${g.dom} domina ${g.rec}`);
            const modeCls = isCod ? 'codom' : (isInc ? 'inc' : 'dom');
            const vals = (isInc || isCod)
              ? `${g.values.dom.label} (${g.dom}${g.dom}) · ${g.values.het.label} (${g.dom}${g.rec} ${isCod ? 'codom.' : 'interm.'}) · ${g.values.rec.label} (${g.rec}${g.rec})`
              : `${g.values.dom.label} (${g.dom}${g.dom}/${g.dom}${g.rec} dom.) · ${g.values.rec.label} (${g.rec}${g.rec} rec.)`;
            return `<div class="grm-item">
              <div class="grm-head"><b>${g.name}</b><span class="grm-mode mono ${modeCls}">${modeTag}</span></div>
              <div class="mono small">${vals}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }

    const a = inv.find(x => x.id === ui.selected[0]);
    const b = inv.find(x => x.id === ui.selected[1]);
    if (!a || !b) return '';

    ensureDraftFor(ui.activeSpecies, a, b, activeOrder);
    const activeGene = sp.genes.find(g => g.key === ui.draft.geneKey) || sp.genes[0];
    const gd = ui.draft.genes[activeGene.key];
    const target = activeOrder ? activeOrder.target : null;

    // Abas para escolher qual dos 3 genes rascunhar
    const geneTabs = sp.genes.map(g => {
      const d = ui.draft.genes[g.key];
      const filledCount = d ? d.cells.flat().filter(Boolean).length : 0;
      const isWanted = !!(target && target[g.trait]);
      return `<button class="fd-gene-tab ${g.key === activeGene.key ? 'active' : ''}" data-draft-gene="${g.key}">
        <span>${g.name}</span>
        <span class="mono fd-locus">(${g.dom}/${g.rec})</span>
        ${isWanted ? '<i class="fd-want-dot" title="Característica pedida pelo cliente"></i>' : ''}
        ${filledCount === 4 ? '<i class="fd-done-dot" title="Rascunho preenchido"></i>' : ''}
      </button>`;
    }).join('');

    // Legenda de fenótipos apenas do gene ativo (sem dar a resposta do cruzamento)
    const ruleLegend = activeGene.mode === 'codominant'
      ? `Codominância · ${activeGene.values.dom.label} (${activeGene.dom}${activeGene.dom}) · ${activeGene.values.het.label} (${activeGene.dom}${activeGene.rec} os dois juntos) · ${activeGene.values.rec.label} (${activeGene.rec}${activeGene.rec})`
      : activeGene.mode === 'incomplete'
        ? `Dom. incompleta · ${activeGene.values.dom.label} (${activeGene.dom}${activeGene.dom}) · ${activeGene.values.het.label} (${activeGene.dom}${activeGene.rec} mistura) · ${activeGene.values.rec.label} (${activeGene.rec}${activeGene.rec})`
        : `Dom. completa (${activeGene.dom} domina ${activeGene.rec}) · ${activeGene.values.dom.label} (${activeGene.dom}${activeGene.dom}/${activeGene.dom}${activeGene.rec} dom.) · ${activeGene.values.rec.label} (${activeGene.rec}${activeGene.rec} rec.)`;

    const evalRes = gd.checked
      ? evaluateGeneDraft(activeGene, gd, a.genotype[activeGene.key], b.genotype[activeGene.key])
      : null;

    // Monta o quadro 2x2 em branco interativo
    const gamBtn = (side, idx) => {
      const val = side === 'A' ? gd.rowA[idx] : gd.colB[idx];
      const clsState = evalRes ? (side === 'A' ? (evalRes.aOk ? 'ok' : 'err') : (evalRes.bOk ? 'ok' : 'err')) : '';
      return `<button class="fd-gam-btn mono ${val ? 'filled' : 'empty'} ${side === 'A' ? 'side-a' : 'side-b'} ${clsState}"
        data-draft-gam="${side}" data-idx="${idx}" title="Clique para alternar o alelo do Vaso ${side} (${activeGene.dom} / ${activeGene.rec})">
        ${val ? formatAllele(val) : '?'}
      </button>`;
    };

    const cellBtn = (r, c) => {
      const val = gd.cells[r][c];
      const clsState = evalRes ? evalRes.cellStatus[r][c] : '';
      let sub = '<span class="fd-cell-hint">?</span>';
      if (val) {
        const lbl = Genetics.pairLabelFor(ui.activeSpecies, activeGene.key, val);
        const phenoCode = (activeGene.mode === 'incomplete' || activeGene.mode === 'codominant')
          ? (val === activeGene.dom + activeGene.dom ? activeGene.values.dom.code : val === activeGene.rec + activeGene.rec ? activeGene.values.rec.code : activeGene.values.het.code)
          : (val === activeGene.rec + activeGene.rec ? activeGene.values.rec.code : activeGene.values.dom.code);
        const info = Genetics.traitInfoFor(ui.activeSpecies, activeGene.trait, phenoCode);
        const dot = info && info.dot ? `<i class="dot" style="background:${info.dot}"></i>` : '';
        sub = `<strong class="mono">${formatAllelePair(val)}</strong><span class="fd-cell-lbl">${dot}${lbl}</span>`;
      }
      return `<td>
        <button class="fd-cell-btn ${val ? 'filled' : 'empty'} ${clsState}" data-draft-cell="${r},${c}"
          title="Clique para alternar combinação (${activeGene.dom}${activeGene.dom} / ${activeGene.dom}${activeGene.rec} / ${activeGene.rec}${activeGene.rec})">
          ${sub}
        </button>
      </td>`;
    };

    // Contagem viva baseada APENAS no que o jogador preencheu
    const filledList = gd.cells.flat().filter(Boolean);
    let tallyHTML = '';
    if (filledList.length === 0) {
      tallyHTML = `<p class="fd-empty-msg">Clique nos espaços <b>?</b> para colocar os alelos dos vasos <b>A</b> e <b>B</b> e preencher as 4 combinações possíveis.</p>`;
    } else {
      const counts = {};
      filledList.forEach(pair => {
        const lbl = Genetics.pairLabelFor(ui.activeSpecies, activeGene.key, pair);
        counts[lbl] = (counts[lbl] || 0) + 1;
      });
      const rows = Object.entries(counts)
        .sort((x, y) => y[1] - x[1])
        .map(([lbl, cnt]) => {
          const pct = Math.round((cnt / filledList.length) * 100);
          return `<div class="fd-tally-row"><span>${lbl}</span><b class="mono">${cnt}/${filledList.length} (${pct}%)</b></div>`;
        }).join('');
      tallyHTML = `<div class="fd-tally-head mono small">SEU RASCUNHO (${filledList.length}/4 preenchidos)</div>${rows}`;
    }

    const wantedCode = target && target[activeGene.trait];
    const wantedInfo = wantedCode ? Genetics.traitInfoFor(ui.activeSpecies, activeGene.trait, wantedCode) : null;
    const wantedNote = wantedInfo
      ? `<div class="fd-want-note">Pedido do cliente: <b>${wantedInfo.label}</b> <span class="chip-al mono">(${formatAllelePair(targetNotationFor(activeGene, wantedCode))})</span></div>`
      : '';

    let checkFeedback = '';
    if (evalRes) {
      if (evalRes.allPerfect) {
        checkFeedback = `<div class="fd-feedback ok">${UIArt.icon('check', 14)} Perfeito! Gametas e todas as 4 combinações estão corretas.</div>`;
      } else if (!evalRes.aOk || !evalRes.bOk) {
        checkFeedback = `<div class="fd-feedback err">Revise os gametas destacados em coral — observe os alelos de <b>${activeGene.name}</b> nos vasos A e B acima.</div>`;
      } else {
        checkFeedback = `<div class="fd-feedback err">Gametas corretos! Revise ${4 - evalRes.cellsOk === 1 ? 'a célula destacada' : 'as células destacadas'} em coral no quadro.</div>`;
      }
    }

    return `<div class="flor-forecast">
      <div class="ff-head">
        <div>
          <h3>${UIArt.icon('grid', 15)} Previsão de Mendel <span class="fd-tag mono">RASCUNHO</span></h3>
          <span class="small muted">Preencha o quadro para deduzir as chances antes de cruzar</span>
        </div>
        <div class="fd-head-btns">
          <button class="btn btn-glass btn-xs" id="flor-draft-clear">Limpar</button>
          <button class="btn btn-glow-emerald btn-xs" id="flor-draft-check">${UIArt.icon('check', 13)} Conferir</button>
        </div>
      </div>

      <div class="fd-gene-tabs">${geneTabs}</div>
      <div class="fd-rule-strip mono small">${ruleLegend}</div>

      <div class="fd-board">
        <table class="fd-table" aria-label="Rascunho do Quadro de Punnett">
          <thead>
            <tr>
              <th class="fd-corner mono"><span class="ca">A</span>╲<span class="cb">B</span></th>
              <th>${gamBtn('B', 0)}</th>
              <th>${gamBtn('B', 1)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>${gamBtn('A', 0)}</th>
              ${cellBtn(0, 0)}
              ${cellBtn(0, 1)}
            </tr>
            <tr>
              <th>${gamBtn('A', 1)}</th>
              ${cellBtn(1, 0)}
              ${cellBtn(1, 1)}
            </tr>
          </tbody>
        </table>

        <div class="fd-summary">
          ${wantedNote}
          ${tallyHTML}
          ${checkFeedback}
        </div>
      </div>

      <div class="lab-actions">
        <button class="btn btn-glass" id="flor-btn-clear">Limpar Mesa</button>
        <button class="btn btn-glow-prism btn-big" id="flor-btn-cross">${UIArt.icon('spark', 16)} Cruzar Plantas! <small>(gerar 4 mudas)</small></button>
      </div>
    </div>`;
  }

  function renderNursery(activeOrder) {
    const n = ui.nursery;
    const shop = GameState.get().shop;
    const inv = shop.inventory[n.speciesId] || [];
    const cap = shop.potCapacity || 8;
    const free = Math.max(0, cap - inv.length);
    const kept = n.seedlings.filter(s => s.keep && !s.delivered).length;
    const unkept = n.seedlings.filter(s => !s.keep && !s.delivered).length;
    const extraCoins = unkept * 12;

    const cards = n.seedlings.map((s, i) => {
      if (s.delivered) {
        return `<div class="plant-card seedling settled delivered-slot">
          <div class="ds-check">${UIArt.icon('check', 24)}</div>
          <strong>Entregue!</strong>
          <small class="muted">Vendida no balcão</small>
        </div>`;
      }
      const ph = Genetics.phenotypeFor(n.speciesId, s.genotype);
      const matchOrder = activeOrder && activeOrder.speciesId === n.speciesId && Genetics.matchesFor(n.speciesId, ph, activeOrder.target);
      return `<div class="plant-card seedling ${s.keep ? 'keep' : ''} ${matchOrder ? 'is-target' : ''} ${n.settled ? 'settled' : ''}"
        data-flor-seed="${i}" role="button" tabindex="0" style="--delay:${(i * 0.1).toFixed(2)}s">
        ${matchOrder
          ? '<span class="target-badge mono">ATENDE AO PEDIDO!</span>'
          : (s.isNew ? '<span class="new-var-badge mono">NOVA VARIAÇÃO</span>' : '')}
        <div class="seedling-stage">
          <div class="capsule-shell" aria-hidden="true"></div>
          <div class="art seedling-art-reveal">${PlantArt.renderSpecies(n.speciesId, s.genotype)}</div>
        </div>
        <div class="meta">
          <div class="tag">Muda ${i + 1} · <span class="gen mono">${genLabel(n.gen)}</span></div>
          ${traitChipsFor(n.speciesId, ph, { compact: true, targetMask: activeOrder && activeOrder.speciesId === n.speciesId ? activeOrder.target : null, genotype: s.genotype })}
          ${matchOrder
            ? `<button class="btn btn-glow-emerald btn-xs plant-deliver-btn" data-deliver-seedling="${i}" data-deliver-order="${activeOrder.id}">Entregar +¤${activeOrder.reward}</button>`
            : `<span class="keep-toggle">${s.keep ? '✓ Guardar no Estoque' : 'Vender sobra (+¤12)'}</span>`}
        </div>
      </div>`;
    }).join('');

    const subHint = free > 0
      ? 'Novas variações já vêm marcadas para o estoque — clique em qualquer muda para alternar.'
      : `Estoque cheio (${inv.length}/${cap}): venda uma planta extra (+¤25) ou amplie vasos em Sementes para guardar novas variações.`;

    const confirmLabel = kept > 0
      ? `Guardar ${kept} Muda${kept > 1 ? 's' : ''} no Estoque${extraCoins ? ` &amp; Vender Sobras (+¤ ${extraCoins})` : ''}`
      : (extraCoins ? `Vender Sobras (+¤ ${extraCoins})` : 'Concluir');

    return `<div class="nursery flor-nursery">
      <div class="nursery-head">
        <h3>4 Mudas Brotaram na Mesa!</h3>
        <span class="mono small muted">Guardar: <b>${kept}</b> (livres: ${free}) · Sobras: <b>+¤ ${extraCoins}</b></span>
      </div>
      <p class="small muted nursery-sub">${subHint}</p>
      <div class="seedling-row">${cards}</div>
      <div class="lab-actions">
        <button class="btn btn-glow-emerald btn-big" id="flor-nursery-confirm">
          ${confirmLabel}
        </button>
      </div>
    </div>`;
  }

  // =========================================================================
  // MODAIS LEVES (ATUALIZAM NO LUGAR, SEM PISCAR OVERLAY!)
  // =========================================================================
  function openSeedsModal() {
    const shop = GameState.get().shop;
    const cap = shop.potCapacity || 8;

    let body = '';
    if (ui.seedTab === 'especies') {
      const cards = Genetics.SPECIES.map(sp => {
        const unlocked = shop.unlockedSpecies.includes(sp.id);
        const invCount = (shop.inventory[sp.id] || []).length;
        const cat = Genetics.CATEGORIES.find(c => c.id === sp.category) || { accent: '#D8B16A' };
        const previewG = Genetics.parseFor(sp.id, sp.starterStock[0]);
        const triHet = sp.genes.map(g => g.dom + g.rec).join(' ');
        const triRec = sp.genes.map(g => g.rec + g.rec).join(' ');
        return `<article class="supplier-card glass-card" style="--sp-acc:${cat.accent}">
          <div class="sup-top">
            <span class="mono" style="color:${cat.accent}">${sp.categoryLabel}</span>
            ${unlocked ? `<span class="sup-owned mono">${invCount}/${cap} vasos</span>` : `<span class="sup-price mono">¤ ${sp.unlockCost}</span>`}
          </div>
          <div class="sup-mid">
            <div class="sup-art">${PlantArt.renderSpecies(sp.id, previewG)}</div>
            <div class="sup-info">
              <h3>${sp.name}</h3>
              <p class="small">${sp.tagline}</p>
            </div>
          </div>
          <div class="sup-actions">
            ${!unlocked
              ? `<button class="btn btn-glow-prism btn-small" data-m-unlock="${sp.id}" ${shop.credits < sp.unlockCost ? 'disabled' : ''}>Desbloquear (+2 matrizes · ¤ ${sp.unlockCost})</button>`
              : `<button class="btn btn-glass btn-xs" data-m-buy="${sp.id}" data-geno="${triHet}" data-cost="60" ${shop.credits < 60 || invCount >= cap ? 'disabled' : ''}>Tri-Híbrida (${triHet}) · ¤60</button>
                 <button class="btn btn-glass btn-xs" data-m-buy="${sp.id}" data-geno="${triRec}" data-cost="80" ${shop.credits < 80 || invCount >= cap ? 'disabled' : ''}>Recessiva (${triRec}) · ¤80</button>`}
          </div>
        </article>`;
      }).join('');

      body = `<div class="sm-bar">
          <div class="sm-tabs">
            <button class="btn btn-small btn-glow-prism" data-sm-tab="especies">Espécies &amp; Matrizes</button>
            <button class="btn btn-small btn-glass" data-sm-tab="livre">Plantar Muda Customizada</button>
          </div>
          <div class="sm-right mono small">
            Caixa: <b>¤ ${shop.credits}</b>
            ${cap < 12 ? `<button class="btn btn-glow-emerald btn-xs" id="m-expand-cap" ${shop.credits < 140 ? 'disabled' : ''}>+2 Vasos (¤ 140)</button>` : ''}
          </div>
        </div>
        <div class="supplier-grid modal-sup-grid">${cards}</div>`;
    } else {
      const sp = Genetics.getSpecies(ui.customSpecies);
      if (!ui.customGeno || !ui.customGeno[sp.genes[0].key]) {
        ui.customGeno = {};
        sp.genes.forEach(g => { ui.customGeno[g.key] = g.dom + g.rec; });
      }
      const spBtns = shop.unlockedSpecies.map(id => {
        const s = Genetics.getSpecies(id);
        return `<button class="filter-pill ${id === sp.id ? 'active' : ''}" data-c-sp="${id}">${s.name}</button>`;
      }).join('');
      const pickers = sp.genes.map(g => {
        const isInc = g.mode === 'incomplete';
        const isCod = g.mode === 'codominant';
        const modeCls = isCod ? 'codom' : (isInc ? 'inc' : 'dom');
        const modeExplain = isCod
          ? `Codominância · expressa os dois juntos no ${g.dom}${g.rec}`
          : isInc
            ? `Dominância incompleta · mistura no ${g.dom}${g.rec}`
            : `Dominância completa · ${g.dom} domina ${g.rec}`;
        const opts = (isInc || isCod)
          ? [
              { pair: g.dom + g.dom, role: 'Puro' },
              { pair: g.dom + g.rec, role: isCod ? 'Os dois juntos' : 'Mistura intermediária' },
              { pair: g.rec + g.rec, role: 'Puro' },
            ]
          : [
              { pair: g.dom + g.dom, role: 'Dominante puro' },
              { pair: g.dom + g.rec, role: `Dominante (porta ${g.rec})` },
              { pair: g.rec + g.rec, role: 'Recessivo' },
            ];
        return `<div class="allele-picker">
          <div class="ap-head">
            <span class="ap-label">${g.name}</span>
            <span class="ap-mode mono ${modeCls}">${modeExplain}</span>
          </div>
          <div class="ap-btns">
            ${opts.map(o => `<button class="ap-btn ap-didactic ${ui.customGeno[g.key] === o.pair ? 'active' : ''}"
              data-c-gene="${g.key}" data-c-pair="${o.pair}">
              <strong>${Genetics.pairLabelFor(sp.id, g.key, o.pair)}</strong>
              <small class="mono">${o.pair} · ${o.role}</small>
            </button>`).join('')}
          </div>
        </div>`;
      }).join('');
      const invCount = (shop.inventory[sp.id] || []).length;

      body = `<div class="sm-bar">
          <div class="sm-tabs">
            <button class="btn btn-small btn-glass" data-sm-tab="especies">Espécies &amp; Matrizes</button>
            <button class="btn btn-small btn-glow-prism" data-sm-tab="livre">Plantar Muda Customizada</button>
          </div>
          <span class="mono small muted">Estude qualquer combinação de alelos direto na prateleira!</span>
        </div>
        <div class="hf-row" style="margin-bottom:12px">${spBtns}</div>
        <div class="sandbox-creator">
          <div class="sc-preview">
            <div class="sc-art">${PlantArt.renderSpecies(sp.id, ui.customGeno)}</div>
            <div class="sc-geno mono">${Genetics.toStringFor(sp.id, ui.customGeno)}</div>
          </div>
          <div class="sc-controls">
            <div class="sc-pickers">${pickers}</div>
            <div class="sc-footer">
              <span class="small muted">${Genetics.phenoLabelFor(sp.id, Genetics.phenotypeFor(sp.id, ui.customGeno))}</span>
              <button class="btn btn-glow-emerald btn-small" id="m-plant-custom" ${invCount >= cap ? 'disabled' : ''}>
                ${UIArt.icon('plus', 14)} Colocar no Estoque (${invCount}/${cap})
              </button>
            </div>
          </div>
        </div>`;
    }

    const oldGrid = $('#modal-root .modal-sup-grid');
    const savedScroll = oldGrid ? oldGrid.scrollTop : 0;

    const modal = UI.openModal({
      id: 'flor-seeds',
      title: 'Sementes, Espécies & Plantio Livre',
      cls: 'modal-index',
      body,
      actions: [{ label: 'Voltar à Floricultura', cls: 'btn-glass' }],
    });
    if (!modal) return;

    const newGrid = $('.modal-sup-grid', modal);
    if (newGrid && savedScroll) newGrid.scrollTop = savedScroll;

    $$('[data-sm-tab]', modal).forEach(b => b.addEventListener('click', () => {
      ui.seedTab = b.dataset.smTab;
      openSeedsModal();
    }));

    $$('[data-m-unlock]', modal).forEach(b => b.addEventListener('click', () => {
      const spId = b.dataset.mUnlock;
      const sp = Genetics.getSpecies(spId);
      const sNow = GameState.get().shop;
      if (sNow.credits < sp.unlockCost || sNow.unlockedSpecies.includes(spId)) return;
      GameState.updateShop(s => {
        s.credits -= sp.unlockCost;
        s.unlockedSpecies.push(spId);
        s.inventory[spId] = sp.starterStock.map(str => {
          const g = Genetics.parseFor(spId, str);
          GameState.discoverSpecies(g, spId);
          return { id: s.nextPlantId++, speciesId: spId, genotype: g, gen: 0, parents: null };
        });
      });
      ui.activeSpecies = spId;
      AudioEngine.fanfare();
      UI.toast(`Nova espécie na Floricultura: <b>${sp.name}</b>!`, 'good');
      patchView();
      openSeedsModal();
    }));

    $$('[data-m-buy]', modal).forEach(b => b.addEventListener('click', () => {
      const spId = b.dataset.mBuy;
      const genoStr = b.dataset.geno;
      const cost = Number(b.dataset.cost);
      const sNow = GameState.get().shop;
      if (sNow.credits < cost || (sNow.inventory[spId] || []).length >= (sNow.potCapacity || 8)) return;
      const g = Genetics.parseFor(spId, genoStr);
      GameState.updateShop(s => {
        s.credits -= cost;
        s.inventory[spId].push({ id: s.nextPlantId++, speciesId: spId, genotype: g, gen: 0, parents: null });
      });
      GameState.discoverSpecies(g, spId);
      if (!ui.nursery) { ui.activeSpecies = spId; ui.selected = []; }
      AudioEngine.plant();
      UI.toast(`Matriz <b>${genoStr}</b> colocada na prateleira!`, 'good');
      patchView();
      openSeedsModal();
    }));

    const exp = $('#m-expand-cap', modal);
    if (exp) exp.addEventListener('click', () => {
      GameState.updateShop(s => {
        if (s.credits >= 140 && (s.potCapacity || 8) < 12) { s.credits -= 140; s.potCapacity = (s.potCapacity || 8) + 2; }
      });
      AudioEngine.fanfare();
      UI.toast('Prateleiras ampliadas em +2 vasos por espécie!', 'good');
      patchView();
      openSeedsModal();
    });

    $$('[data-c-sp]', modal).forEach(b => b.addEventListener('click', () => {
      ui.customSpecies = b.dataset.cSp;
      ui.customGeno = null;
      openSeedsModal();
    }));
    $$('[data-c-gene]', modal).forEach(b => b.addEventListener('click', () => {
      ui.customGeno[b.dataset.cGene] = b.dataset.cPair;
      openSeedsModal();
    }));
    const plantC = $('#m-plant-custom', modal);
    if (plantC) plantC.addEventListener('click', () => {
      const spId = ui.customSpecies;
      const g = { ...ui.customGeno };
      GameState.updateShop(s => {
        if ((s.inventory[spId] || []).length < (s.potCapacity || 8)) {
          s.inventory[spId].push({ id: s.nextPlantId++, speciesId: spId, genotype: g, gen: 0, parents: null });
        }
      });
      GameState.discoverSpecies(g, spId);
      ui.activeSpecies = spId;
      AudioEngine.plant();
      UI.closeModal();
      UI.toast(`Muda customizada plantada na prateleira de ${Genetics.getSpecies(spId).name}!`, 'good');
      patchView();
    });
  }

  function openCatalogModal() {
    const discMulti = GameState.get().herbarium.multiDiscovered || {};
    const discLegacy = GameState.get().herbarium.discovered || {};
    const isFound = e => discMulti[e.key] || (e.speciesId === 'flor_mendel' ? discLegacy[e.key.split('::')[1]] : null);

    const total = Genetics.ALL_HERBARIUM.length;
    const found = Genetics.ALL_HERBARIUM.filter(e => !!isFound(e)).length;
    const pct = Math.round((found / total) * 100);

    const catBtns = Genetics.CATEGORIES.map(c =>
      `<button class="filter-pill ${ui.herbCat === c.id ? 'active' : ''}" data-m-hcat="${c.id}">${c.label}</button>`
    ).join('');

    const items = Genetics.ALL_HERBARIUM.filter(e => ui.herbCat === 'todas' || e.category === ui.herbCat);
    const cards = items.map(e => {
      const info = isFound(e);
      const ok = !!info;
      const rarSlug = e.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return `<article class="herb-card glass-card ${ok ? 'unlocked' : 'locked'}">
        <div class="hc-top">
          <span class="hc-num mono">${e.speciesName} #${String(e.id).padStart(2, '0')}</span>
          <span class="rar-badge rar-${rarSlug}">${e.rarity}</span>
        </div>
        <div class="hc-art">${PlantArt.renderSpecies(e.speciesId, e.exemplar, { silhouette: !ok })}</div>
        <div class="hc-body">
          <div class="hc-pheno">${ok ? e.label : 'Ainda não cultivada'}</div>
          <div class="hc-foot mono small">${ok ? Genetics.toStringFor(e.speciesId, e.exemplar) : '???'}</div>
        </div>
      </article>`;
    }).join('');

    const modal = UI.openModal({
      id: 'flor-catalog',
      title: `Catálogo Botânico (${found}/${total} · ${pct}%)`,
      cls: 'modal-index',
      body: `<div class="progress-bar" style="margin-bottom:12px"><i style="width:${pct}%"></i></div>
        <div class="hf-row" style="margin-bottom:12px">${catBtns}</div>
        <div class="herb-grid modal-herb-grid">${cards}</div>`,
      actions: [{ label: 'Fechar Catálogo', cls: 'btn-glass' }],
    });
    if (!modal) return;
    $$('[data-m-hcat]', modal).forEach(b => b.addEventListener('click', () => {
      ui.herbCat = b.dataset.mHcat;
      openCatalogModal();
    }));
  }

  // =========================================================================
  // EVENTOS DELEGADOS (VINCULADOS 1 ÚNICA VEZ NA MONTAGEM)
  // =========================================================================
  function bindDelegatedEvents() {
    const app = $('.flor-app', containerEl);
    if (!app) return;

    app.addEventListener('click', e => {
      const target = e.target;

      // 1. Alelos ON/OFF (zero recriação de DOM — só alterna classe CSS!)
      if (target.closest('#flor-btn-xray')) {
        if (window.App && App.toggleXray) App.toggleXray();
        patchHUD();
        return;
      }
      if (target.closest('#flor-open-seeds') || target.closest('#flor-more-species')) {
        ui.seedTab = 'especies';
        openSeedsModal();
        return;
      }
      if (target.closest('#flor-open-catalog')) {
        openCatalogModal();
        return;
      }

      // 2. Dica genética no balão
      if (target.closest('#flor-toggle-hint')) {
        ui.showHint = !ui.showHint;
        patchView();
        return;
      }

      // 3. Trocar cliente da fila
      const attendBtn = target.closest('[data-attend-order]');
      if (attendBtn) {
        const oid = Number(attendBtn.dataset.attendOrder);
        const ord = GameState.get().shop.orders.find(o => o.id === oid);
        if (!ord) return;
        ui.activeOrderId = oid;
        ui.showHint = false;
        if (!ui.nursery && ui.activeSpecies !== ord.speciesId) {
          ui.activeSpecies = ord.speciesId;
          ui.selected = [];
        }
        AudioEngine.select(false);
        patchView();
        return;
      }

      // 4. Pular cliente
      const skipBtn = target.closest('[data-skip-order]');
      if (skipBtn) {
        const oid = Number(skipBtn.dataset.skipOrder);
        let newOrd = null;
        GameState.updateShop(s => {
          const idx = s.orders.findIndex(o => o.id === oid);
          if (idx >= 0) {
            newOrd = createOrder(s);
            s.orders[idx] = newOrd;
          }
        });
        if (newOrd) {
          ui.activeOrderId = newOrd.id;
          ui.showHint = false;
          if (!ui.nursery) { ui.activeSpecies = newOrd.speciesId; ui.selected = []; }
        }
        AudioEngine.click();
        patchView();
        return;
      }

      // 5. Trocar espécie na faixa ou pelo balão
      const spBtn = target.closest('[data-pick-species]');
      if (spBtn) {
        if (ui.nursery) { AudioEngine.error(); UI.toast('Confirme as 4 mudas na mesa antes de trocar de prateleira.', 'warn'); return; }
        ui.activeSpecies = spBtn.dataset.pickSpecies;
        ui.selected = [];
        patchView();
        return;
      }

      // 6. Repor matriz grátis
      if (target.closest('#flor-free-restock')) {
        const sp = Genetics.getSpecies(ui.activeSpecies);
        GameState.updateShop(s => {
          const inv = s.inventory[ui.activeSpecies] || [];
          const g = Genetics.parseFor(ui.activeSpecies, sp.starterStock[inv.length % sp.starterStock.length]);
          inv.push({ id: s.nextPlantId++, speciesId: ui.activeSpecies, genotype: g, gen: 0, parents: null });
          s.inventory[ui.activeSpecies] = inv;
        });
        AudioEngine.plant();
        UI.toast('Matriz básica reposta gratuitamente no estoque!', 'good');
        patchView();
        return;
      }

      // 7. Entregar muda brotada direto ao cliente
      const delSeed = target.closest('[data-deliver-seedling]');
      if (delSeed) {
        deliverSeedlingDirect(Number(delSeed.dataset.deliverSeedling), Number(delSeed.dataset.deliverOrder));
        return;
      }

      // 8. Entregar planta do estoque ao cliente
      const delOrd = target.closest('[data-deliver-order][data-deliver-plant]');
      if (delOrd) {
        deliverOrder(Number(delOrd.dataset.deliverOrder), Number(delOrd.dataset.deliverPlant));
        return;
      }

      // 9. Vender planta avulsa extra (+¤25)
      const sellBtn = target.closest('[data-sell-extra]');
      if (sellBtn) {
        sellExtraPlant(Number(sellBtn.dataset.sellExtra));
        return;
      }

      // 10. Selecionar planta da prateleira para a mesa
      const plantCard = target.closest('[data-inv-plant]');
      if (plantCard) {
        selectPlant(Number(plantCard.dataset.invPlant));
        return;
      }

      // 11. Autofecundar (mesma planta nos Vasos A e B) ou tirar vaso da mesa
      const selfBtn = target.closest('[data-self-cross]');
      if (selfBtn) {
        if (ui.nursery) return;
        const pid = Number(selfBtn.dataset.selfCross);
        ui.selected = [pid, pid];
        AudioEngine.select(true);
        patchView();
        return;
      }

      const slotEl = target.closest('[data-shop-slot]');
      if (slotEl) {
        if (ui.nursery) return;
        const idx = Number(slotEl.dataset.shopSlot);
        if (ui.selected[idx] != null) {
          ui.selected.splice(idx, 1);
          AudioEngine.deselect();
          patchView();
        }
        return;
      }

      // 12. RASCUNHO MANUAL DE MENDEL (atualiza SOMENTE #flor-bench-body!)
      const geneTab = target.closest('[data-draft-gene]');
      if (geneTab) {
        ui.draft.geneKey = geneTab.dataset.draftGene;
        patchBenchBody();
        return;
      }

      const gamBtn = target.closest('[data-draft-gam]');
      if (gamBtn) {
        const sp = Genetics.getSpecies(ui.activeSpecies);
        const g = sp.genes.find(x => x.key === ui.draft.geneKey);
        const gd = g && ui.draft.genes[g.key];
        if (!g || !gd) return;
        const side = gamBtn.dataset.draftGam;
        const idx = Number(gamBtn.dataset.idx);
        const arr = side === 'A' ? gd.rowA : gd.colB;
        const cycle = ['', g.dom, g.rec];
        const nextIdx = (cycle.indexOf(arr[idx]) + 1) % cycle.length;
        arr[idx] = cycle[nextIdx];
        gd.checked = false;
        AudioEngine.select(false);
        patchBenchBody();
        return;
      }

      const cellBtn = target.closest('[data-draft-cell]');
      if (cellBtn) {
        const sp = Genetics.getSpecies(ui.activeSpecies);
        const g = sp.genes.find(x => x.key === ui.draft.geneKey);
        const gd = g && ui.draft.genes[g.key];
        if (!g || !gd) return;
        const [r, c] = cellBtn.dataset.draftCell.split(',').map(Number);
        const cycle = ['', g.dom + g.dom, g.dom + g.rec, g.rec + g.rec];
        const nextIdx = (cycle.indexOf(gd.cells[r][c]) + 1) % cycle.length;
        gd.cells[r][c] = cycle[nextIdx];
        gd.checked = false;
        AudioEngine.select(false);
        patchBenchBody();
        return;
      }

      if (target.closest('#flor-draft-clear')) {
        const gd = ui.draft.genes[ui.draft.geneKey];
        if (gd) {
          gd.rowA = ['', ''];
          gd.colB = ['', ''];
          gd.cells = [['', ''], ['', '']];
          gd.checked = false;
          AudioEngine.deselect();
          patchBenchBody();
        }
        return;
      }

      if (target.closest('#flor-draft-check')) {
        const sp = Genetics.getSpecies(ui.activeSpecies);
        const g = sp.genes.find(x => x.key === ui.draft.geneKey);
        const gd = g && ui.draft.genes[g.key];
        const inv = GameState.get().shop.inventory[ui.activeSpecies] || [];
        const a = inv.find(x => x.id === ui.selected[0]);
        const b = inv.find(x => x.id === ui.selected[1]);
        if (!g || !gd || !a || !b) return;
        gd.checked = true;
        const res = evaluateGeneDraft(g, gd, a.genotype[g.key], b.genotype[g.key]);
        if (res.allPerfect) AudioEngine.select(true);
        else AudioEngine.error();
        patchBenchBody();
        return;
      }

      // 13. Ações da mesa: limpar, cruzar, escolher mudas, confirmar
      if (target.closest('#flor-btn-clear')) {
        ui.selected = [];
        AudioEngine.deselect();
        patchView();
        return;
      }
      if (target.closest('#flor-btn-cross')) {
        doCross();
        return;
      }
      const seedCard = target.closest('[data-flor-seed]');
      if (seedCard) {
        toggleSeedling(Number(seedCard.dataset.florSeed));
        return;
      }
      if (target.closest('#flor-nursery-confirm')) {
        confirmNursery();
        return;
      }
    });
  }

  function selectPlant(id) {
    if (ui.nursery) { AudioEngine.error(); UI.toast('Guarde ou venda as mudas da mesa primeiro.', 'warn'); return; }
    // Permite autofecundação (clicar 2x na mesma planta coloca em A e B; 3º clique remove)
    if (ui.selected.length === 1 && ui.selected[0] === id) {
      ui.selected = [id, id];
      AudioEngine.select(true);
    } else if (ui.selected.length === 2 && ui.selected[0] === id && ui.selected[1] === id) {
      ui.selected = [];
      AudioEngine.deselect();
    } else {
      const idx = ui.selected.indexOf(id);
      if (idx >= 0) {
        ui.selected.splice(idx, 1);
        AudioEngine.deselect();
      } else {
        if (ui.selected.length >= 2) ui.selected[1] = id;
        else ui.selected.push(id);
        AudioEngine.select(ui.selected.length === 2);
      }
    }
    patchView();
  }

  function sellExtraPlant(id) {
    const inv = GameState.get().shop.inventory[ui.activeSpecies] || [];
    if (inv.length <= 2) { AudioEngine.error(); UI.toast('Mantenha pelo menos 2 vasos no estoque para cruzar.', 'warn'); return; }
    GameState.updateShop(s => {
      s.inventory[ui.activeSpecies] = s.inventory[ui.activeSpecies].filter(p => p.id !== id);
      s.credits += 25;
    });
    ui.selected = ui.selected.filter(x => x !== id);
    AudioEngine.select(true);
    UI.toast('Planta vendida no balcão! <b>+¤ 25</b>', 'good');
    patchView();
  }

  function doCross() {
    const shop = GameState.get().shop;
    const inv = shop.inventory[ui.activeSpecies] || [];
    if (ui.selected.length < 2 || ui.nursery) return;
    const a = inv.find(x => x.id === ui.selected[0]);
    const b = inv.find(x => x.id === ui.selected[1]);
    if (!a || !b) return;

    const free = Math.max(0, (shop.potCapacity || 8) - inv.length);
    const activeOrd = getActiveOrder();
    const existingPhenos = new Set(inv.map(p => Genetics.phenoKeyFor(ui.activeSpecies, Genetics.phenotypeFor(ui.activeSpecies, p.genotype))));
    const existingGenos = new Set(inv.map(p => Genetics.toStringFor(ui.activeSpecies, p.genotype, '')));

    const seedlings = Array.from({ length: 4 }, () => ({
      genotype: Genetics.sampleChildFor(ui.activeSpecies, a.genotype, b.genotype),
      keep: false,
      isNew: false,
      delivered: false,
    }));

    let budget = free;
    const discovered = [];
    // 1) Registra catálogo e prioriza mudas que atendem ao pedido ativo
    seedlings.forEach(s => {
      const ph = Genetics.phenotypeFor(ui.activeSpecies, s.genotype);
      const pk = Genetics.phenoKeyFor(ui.activeSpecies, ph);
      const gk = Genetics.toStringFor(ui.activeSpecies, s.genotype, '');
      if (GameState.discoverSpecies(s.genotype, ui.activeSpecies)) {
        discovered.push(Genetics.phenoLabelFor(ui.activeSpecies, ph));
      }
      if (!existingPhenos.has(pk) || !existingGenos.has(gk)) {
        s.isNew = true;
      }
      const matchesOrd = activeOrd && activeOrd.speciesId === ui.activeSpecies && Genetics.matchesFor(ui.activeSpecies, ph, activeOrd.target);
      if (budget > 0 && matchesOrd) {
        s.keep = true;
        budget -= 1;
        existingPhenos.add(pk);
        existingGenos.add(gk);
      }
    });
    // 2) Marca automaticamente novas variações fenotípicas ainda ausentes no estoque
    seedlings.forEach(s => {
      if (s.keep || budget <= 0) return;
      const pk = Genetics.phenoKeyFor(ui.activeSpecies, Genetics.phenotypeFor(ui.activeSpecies, s.genotype));
      const gk = Genetics.toStringFor(ui.activeSpecies, s.genotype, '');
      if (!existingPhenos.has(pk)) {
        s.keep = true;
        budget -= 1;
        existingPhenos.add(pk);
        existingGenos.add(gk);
      }
    });
    // 3) Marca automaticamente novos genótipos (ex.: heterozigotos úteis para F2) ainda ausentes no estoque
    seedlings.forEach(s => {
      if (s.keep || budget <= 0) return;
      const gk = Genetics.toStringFor(ui.activeSpecies, s.genotype, '');
      if (!existingGenos.has(gk)) {
        s.keep = true;
        budget -= 1;
        existingGenos.add(gk);
      }
    });

    GameState.updateShop(s => { s.totalCrosses = (s.totalCrosses || 0) + 1; });
    GameState.unlockAchievement('primeiro_broto');

    ui.nursery = {
      speciesId: ui.activeSpecies,
      parents: [a.id, b.id],
      gen: Math.max(a.gen, b.gen) + 1,
      seedlings,
      settled: false,
    };
    ui.selected = [];

    AudioEngine.pollinate();
    [0, 1, 2, 3].forEach(i => setTimeout(() => AudioEngine.sprout(i), 180 + i * 120));
    UI.sparkle($('#flor-bench', containerEl));
    patchView();

    if (discovered.length > 0) {
      setTimeout(() => UI.toast(`Nova variedade no Catálogo: <b>${discovered[0]}</b>!`, 'good'), 450);
    }
  }

  function toggleSeedling(idx) {
    const n = ui.nursery;
    if (!n || !n.seedlings[idx] || n.seedlings[idx].delivered) return;
    const shop = GameState.get().shop;
    const free = Math.max(0, (shop.potCapacity || 8) - (shop.inventory[n.speciesId] || []).length);
    const s = n.seedlings[idx];
    const kept = n.seedlings.filter(x => x.keep && !x.delivered).length;
    if (!s.keep && kept >= free) {
      AudioEngine.error();
      UI.toast('Prateleira cheia! Venda uma planta extra (+¤25) ou amplie vasos em Sementes.', 'warn');
      return;
    }
    s.keep = !s.keep;
    n.settled = true;
    s.keep ? AudioEngine.select() : AudioEngine.deselect();
    patchBenchBody();
  }

  function confirmNursery() {
    const n = ui.nursery;
    if (!n) return;
    const kept = n.seedlings.filter(s => s.keep && !s.delivered);
    const sold = n.seedlings.filter(s => !s.keep && !s.delivered);
    const coins = sold.length * 12;

    GameState.updateShop(s => {
      const inv = s.inventory[n.speciesId] || [];
      const cap = s.potCapacity || 8;
      kept.forEach(item => {
        if (inv.length < cap) {
          inv.push({ id: s.nextPlantId++, speciesId: n.speciesId, genotype: item.genotype, gen: n.gen, parents: n.parents });
        }
      });
      s.inventory[n.speciesId] = inv;
      s.credits += coins;
    });
    ui.nursery = null;
    AudioEngine.plant();
    if (kept.length > 0 && coins > 0) {
      UI.toast(`<b>${kept.length}</b> muda${kept.length > 1 ? 's' : ''} guardada${kept.length > 1 ? 's' : ''} no estoque e sobras vendidas (+¤ ${coins})!`, 'good');
    } else if (kept.length > 0) {
      UI.toast(`<b>${kept.length}</b> muda${kept.length > 1 ? 's' : ''} adicionada${kept.length > 1 ? 's' : ''} ao estoque!`, 'good');
    } else if (coins > 0) {
      UI.toast(`Sobras vendidas por <b>+¤ ${coins}</b> (nenhuma muda marcada para guardar).`);
    }
    patchView();
  }

  function deliverSeedlingDirect(seedIdx, orderId) {
    const n = ui.nursery;
    if (!n || !n.seedlings[seedIdx] || n.seedlings[seedIdx].delivered) return;
    const order = GameState.get().shop.orders.find(o => o.id === orderId);
    if (!order) return;

    n.seedlings[seedIdx].delivered = true;
    n.seedlings[seedIdx].keep = false;
    n.settled = true;

    completeOrderTransaction(order, null);
  }

  function deliverOrder(orderId, plantId) {
    const order = GameState.get().shop.orders.find(o => o.id === orderId);
    if (!order) return;
    completeOrderTransaction(order, plantId);
  }

  function completeOrderTransaction(order, removePlantId) {
    const reward = order.reward;
    const custName = order.customerName;
    const spName = Genetics.getSpecies(order.speciesId).name;
    let nextOrd = null;

    GameState.updateShop(s => {
      s.credits += reward;
      s.ordersCompleted += 1;
      s.reputation = Math.min(5.0, +(s.reputation + 0.08).toFixed(2));
      if (s.ordersCompleted % 3 === 0) s.day += 1;
      if (removePlantId != null) {
        s.inventory[order.speciesId] = (s.inventory[order.speciesId] || []).filter(p => p.id !== removePlantId);
      }
      const idx = s.orders.findIndex(o => o.id === order.id);
      nextOrd = createOrder(s);
      if (idx >= 0) s.orders[idx] = nextOrd;
    });

    GameState.addXP(75);
    if (removePlantId != null) ui.selected = ui.selected.filter(id => id !== removePlantId);
    if (nextOrd) {
      ui.activeOrderId = nextOrd.id;
      ui.showHint = false;
      if (!ui.nursery) {
        ui.activeSpecies = nextOrd.speciesId;
        ui.selected = [];
      }
    }

    AudioEngine.fanfare();
    UI.confetti();
    UI.toast(`Pedido de <b>${spName}</b> entregue para ${custName}! <b>+¤ ${reward}</b>`, 'good');
    patchView();
  }

  function openTab(tabName) {
    if (tabName === 'herbario') setTimeout(openCatalogModal, 30);
    else if (tabName === 'fornecedor') { ui.seedTab = 'especies'; setTimeout(openSeedsModal, 30); }
    else if (tabName === 'bancada') { ui.seedTab = 'livre'; setTimeout(openSeedsModal, 30); }
  }

  return { render, openTab, openSeedsModal, openCatalogModal, ui };
})();

window.Floricultura = Floricultura;
window.GeneticShop = Floricultura;
