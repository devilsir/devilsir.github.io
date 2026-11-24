'use strict';
/**
 * greenhouse.js — Modo A: Estufa de Mendel (Campanha 8 Missões + Herbário 12 Espécies + Sandbox).
 * Inclui visualização didática de Meiose/Gametas, Quadro de Punnett com destaque interativo no hover,
 * missão especial de Cruzamento-Teste (diagnóstico AA vs Aa), sistema de eficiência/estrelas sem Raio-X
 * e estatísticas acumuladas Esperado × Observado no Sandbox.
 */
const Greenhouse = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const fmtPct = p => `${(p * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  function frac(p) {
    if (p <= 0) return '0';
    if (p >= 1) return '1';
    const d = 4096, n = Math.round(p * d), g = gcd(n, d);
    return `${n / g}/${d / g}`;
  }
  const genLabel = g => (g === 0 ? 'P' : `F${g}`);

  // =========================================================================
  // 8 MISSÕES PROGRESSIVAS DA ALA BOTÂNICA
  // =========================================================================
  const MISSIONS = [
    {
      id: 1,
      type: 'breed',
      title: 'O Primeiro Rubor',
      concept: '1ª Lei · Dominância Incompleta',
      story: 'A estufa recebeu duas linhagens puras: uma flor <b>vermelha</b> e outra <b>branca</b>. Para a exposição de abertura, o curador pediu uma flor <b>rosa</b>.',
      lesson: 'Na <b>dominância incompleta</b>, o heterozigoto <b>Rr</b> expressa um fenótipo intermediário entre RR (vermelha) e rr (branca). Cada parental homozigoto produz apenas um tipo de gameta.',
      hint: 'Cruze a planta vermelha (RR) com a branca (rr). Todos os gametas se combinam formando 100% de descendentes Rr (rosa)!',
      target: { color: 'rosa', height: 'alta', glow: 'normal' },
      start: ['RR AA BB', 'rr AA BB'],
      maxGens: 2,
      par: 1,
    },
    {
      id: 2,
      type: 'breed',
      title: 'O Segredo do Anão',
      concept: '1ª Lei · Proporção 3 : 1',
      story: 'Duas plantas vermelhas e altas parecem idênticas… mas os registros de Mendel indicam que ambas carregam um alelo oculto. Produza uma planta <b>vermelha e anã</b>.',
      lesson: 'Na <b>dominância completa</b>, um heterozigoto <b>Aa</b> tem o mesmo fenótipo alto de AA, escondendo o alelo recessivo <b>a</b>. Cruzando Aa × Aa, 25% da prole é <b>aa</b> (anã) — a proporção clássica <b>3 : 1</b>.',
      hint: 'As duas plantas são portadoras (Aa). Observe a Meiose: metade dos gametas leva "a". No Punnett, 25% de cada muda nasce aa (anã).',
      target: { color: 'vermelha', height: 'ana', glow: 'normal' },
      start: ['RR Aa BB', 'RR Aa BB'],
      maxGens: 3,
      par: 1,
    },
    {
      id: 3,
      type: 'breed',
      title: 'Portadores na Sombra',
      concept: 'Fenótipo × Genótipo',
      story: 'Três plantas brancas e altas chegaram à bancada, todas sem brilho. Apenas duas delas carregam o alelo recessivo da <b>bioluminescência</b>. Descubra o par certo e gere uma planta <b>branca, alta e bioluminescente</b>.',
      lesson: 'Indivíduos de <b>mesmo fenótipo</b> podem ter <b>genótipos distintos</b> (BB ou Bb). Apenas o cruzamento de dois portadores (Bb × Bb) pode unir dois gametas <b>b</b> e revelar o fenótipo <b>bb</b>.',
      hint: 'Teste os pares na bancada antes de cruzar: se o Quadro de Punnett indicar 0% de bioluminescência, um dos parentais é BB. Escolha o par que dá 25%!',
      target: { color: 'branca', height: 'alta', glow: 'bio' },
      start: ['rr AA BB', 'rr AA Bb', 'rr Aa Bb'],
      maxGens: 3,
      par: 1,
    },
    {
      id: 4,
      type: 'breed',
      title: 'Rosa de Bolso',
      concept: '2ª Lei · Diibridismo e Retrocruzamento',
      story: 'Um botânico encomendou uma flor <b>rosa e anã</b>. Você dispõe apenas de uma vermelha alta e uma branca anã — planeje <b>duas gerações</b> para combinar as características.',
      lesson: 'Pela <b>2ª Lei de Mendel</b> (segregação independente), genes de cor e altura se distribuem separadamente nos gametas. Cruzar a F1 (Rr Aa) com o parental recessivo (rr aa) — <b>retrocruzamento</b> — gera 1/2 × 1/2 = <b>25%</b> de rosas anãs.',
      hint: 'Geração 1: cruze vermelha alta × branca anã para criar a F1 (Rr Aa). Geração 2: cruze a F1 com a planta branca anã (rr aa) para obter 25% por muda!',
      target: { color: 'rosa', height: 'ana', glow: 'normal' },
      start: ['RR AA BB', 'rr aa BB'],
      maxGens: 5,
      par: 2,
    },
    {
      id: 5,
      type: 'breed',
      title: 'Aurora Bioluminescente',
      concept: '2ª Lei · Combinando Cor e Brilho',
      story: 'Nosso acervo possui uma planta vermelha bioluminescente e uma branca anã comum. Combine as duas linhagens para cultivar uma flor <b>rosa, alta e bioluminescente</b>.',
      lesson: 'Para recuperar um traço recessivo (<b>bb</b>) mantendo um traço intermediário (<b>Rr</b>), cruze os parentais puros para gerar a F1 di-híbrida e faça o retrocruzamento com o genitor que já é <b>bb</b>.',
      hint: 'Geração 1: cruze #1 (vermelha bio) × #2 (branca anã) para obter a F1 (Rr Aa Bb). Geração 2: cruze a F1 com #1 (RR AA bb) → 50% Rr × 100% Alta × 50% bb = 25% por muda!',
      target: { color: 'rosa', height: 'alta', glow: 'bio' },
      start: ['RR AA bb', 'rr aa BB'],
      maxGens: 5,
      par: 2,
    },
    {
      id: 6,
      type: 'testcross',
      title: 'O Cruzamento-Teste',
      concept: 'Cruzamento-Teste (AA × aa vs Aa × aa)',
      story: 'O <b>Espécime Misterioso #1</b> tem caule alto e flor vermelha, mas seu fichário de altura foi perdido (até o Raio-X está bloqueado nele!). Use a <b>Planta-Teste recessiva anã (#2)</b> para descobrir se #1 é <b>Homozigoto (AA)</b> ou <b>Heterozigoto (Aa)</b>.',
      lesson: 'O <b>Cruzamento-Teste</b> cruza um indivíduo de fenótipo dominante e genótipo desconhecido (A_) com um homozigoto recessivo (<b>aa</b>). Se surgir <b>qualquer descendente anão (aa)</b>, o genitor só pode ser heterozigoto (<b>Aa</b>)! Se 100% forem altos em várias proles, há forte evidência de <b>AA</b>.',
      hint: 'Cruze o Espécime #1 com a Planta-Teste #2 (aa). Como a Planta-Teste só doa gametas "a", se nascer pelo menos uma muda anã (aa), o Espécime #1 obrigatoriamente doou um "a" — logo é Heterozigoto (Aa)!',
      target: null,
      testGene: 'A',
      mysteryIndex: 0,
      expectedDiagnosis: 'het', // 'hom' (AA) ou 'het' (Aa)
      start: ['RR Aa BB', 'RR aa BB'],
      maxGens: 3,
      par: 1,
    },
    {
      id: 7,
      type: 'breed',
      title: 'Estrela Polar',
      concept: 'União de Duplo Recessivo (aa bb)',
      story: 'Você recebeu três linhagens brancas distintas: uma alta comum, uma alta bioluminescente e uma anã comum. Una os dois alelos recessivos para criar uma raríssima flor <b>branca, anã e bioluminescente</b>.',
      lesson: 'Quando dois traços recessivos estão em plantas separadas (AA bb e aa Bb), primeiro produza um descendente que carregue <b>bb</b> e o alelo oculto <b>a</b> (Aa bb) e depois cruze-o com o genitor anão portador (aa Bb) para chegar a <b>25% de aa bb</b>!',
      hint: 'Cruze #2 (branca alta bio: rr AA bb) × #3 (branca anã: rr aa Bb). Guarde uma muda bioluminescente (rr Aa bb) e cruze-a com #3 (rr aa Bb) para 25% de chance de branca anã bioluminescente!',
      target: { color: 'branca', height: 'ana', glow: 'bio' },
      start: ['rr Aa BB', 'rr AA bb', 'rr aa Bb'],
      maxGens: 5,
      par: 2,
    },
    {
      id: 8,
      type: 'breed',
      title: 'A Obra-Prima de Mendel',
      concept: 'Tri-hibridismo Completo (3 Genes)',
      story: 'O desafio supremo do laboratório: obter a lendária <i>Flora mendeliana mirabilis</i> — <b>rosa, anã e bioluminescente</b> — partindo de uma planta dominante pura e uma recessiva pura.',
      lesson: 'Em um tri-híbrido, as probabilidades se multiplicam: F1 × F1 (RrAaBb × RrAaBb) dá apenas 1/2 × 1/4 × 1/4 = <b>3,125%</b>. Já o retrocruzamento F1 × rr aa bb dá 1/2 × 1/2 × 1/2 = <b>12,5%</b> por muda (41,4% de chance de sair em 4 mudas)!',
      hint: 'Geração 1: cruze #1 (RR AA BB) × #2 (rr aa bb) para obter a F1 tri-híbrida (Rr Aa Bb). Depois cruze a F1 sempre com a planta #2 (rr aa bb) — 4 vezes mais chances do que F1 × F1!',
      target: { color: 'rosa', height: 'ana', glow: 'bio' },
      start: ['RR AA BB', 'rr aa bb'],
      maxGens: 6,
      par: 2,
    },
  ];

  // =========================================================================
  // ESTADO LOCAL DA SESSÃO (CAMPANHA OU SANDBOX)
  // =========================================================================
  const session = {
    mode: 'campaign', // 'campaign' | 'sandbox'
    missionIndex: 0,
    plants: [],
    selected: [],
    gensUsed: 0,
    usedXrayInMission: false,
    nursery: null,
    nextId: 1,
    finished: false,
    capacity: 8,
    punnettTab: 'full',
    testCrossHistory: [], // { gen, tall, dwarf }
    customGenotype: { R: 'Rr', A: 'Aa', B: 'Bb' },
  };

  let containerEl = null;

  const currentMission = () => (session.mode === 'campaign' ? MISSIONS[session.missionIndex] : null);
  const getPlant = id => session.plants.find(p => p.id === id);
  const freeSlots = () => session.capacity - session.plants.length;
  const isXrayOn = () => !!GameState.get().settings.xray;

  function isTargetPlant(genotype) {
    const m = currentMission();
    return !!(m && m.type === 'breed' && m.target && Genetics.matches(Genetics.phenotype(genotype), m.target));
  }

  function makePlant(genotype, gen = 0, parents = null, mystery = false) {
    return { id: session.nextId++, genotype, gen, parents, mystery, fresh: true };
  }

  // =========================================================================
  // INICIALIZAÇÃO DE MODOS
  // =========================================================================
  function startMission(index, showBrief = true) {
    const m = MISSIONS[index] || MISSIONS[0];
    session.mode = 'campaign';
    session.missionIndex = index;
    session.selected = [];
    session.gensUsed = 0;
    session.usedXrayInMission = isXrayOn();
    session.nursery = null;
    session.nextId = 1;
    session.finished = false;
    session.capacity = 8;
    session.punnettTab = 'full';
    session.testCrossHistory = [];
    session.plants = m.start.map((str, idx) => {
      const g = Genetics.parse(str);
      const isMyst = m.type === 'testcross' && idx === m.mysteryIndex;
      if (!isMyst) GameState.discoverSpecies(g);
      return makePlant(g, 0, null, isMyst);
    });
    render();
    AudioEngine.plant();
    if (showBrief) showMissionBriefing(index, true);
  }

  function startSandbox() {
    session.mode = 'sandbox';
    session.selected = [];
    session.gensUsed = 0;
    session.nursery = null;
    session.nextId = 1;
    session.finished = false;
    session.capacity = 12;
    session.punnettTab = 'full';
    const starters = ['RR AA BB', 'rr aa bb', 'Rr Aa Bb', 'RR aa Bb'];
    session.plants = starters.map(s => {
      const g = Genetics.parse(s);
      GameState.discoverSpecies(g);
      return makePlant(g, 0, null, false);
    });
    render();
    AudioEngine.plant();
  }

  function onXrayChanged(isOn) {
    if (session.mode === 'campaign' && isOn && !session.finished) {
      session.usedXrayInMission = true;
    }
    if (containerEl) render();
  }

  // =========================================================================
  // HTML HELPERS
  // =========================================================================
  function formatAllele(ch) {
    return `<b class="${ch === ch.toUpperCase() ? 'al-dom' : 'al-rec'}">${ch}</b>`;
  }

  function genoBadgeHTML(p) {
    const m = currentMission();
    if (p.mystery) {
      const g = p.genotype;
      return `<div class="geno-mystery mono" title="Genótipo da altura oculto — descubra com Cruzamento-Teste!">
        <span>${g.R}</span> <span class="mystery-q">A?</span> <span>${g.B}</span>
      </div>`;
    }
    const pairs = Genetics.GENES.map(gene =>
      `<span class="gpair">${[...p.genotype[gene.key]].map(formatAllele).join('')}</span>`
    ).join('');
    return `<div class="geno mono" title="Genótipo">${pairs}</div>
            <div class="geno-hidden mono" title="Ative o Raio-X Genético para revelar (zera o bônus Sem Raio-X)">?? ?? ??</div>`;
  }

  function traitChipsHTML(ph, compact = false) {
    const L = Genetics.LABELS;
    return `<div class="chips ${compact ? 'compact' : ''}">
      <span class="chip"><i class="dot c-${ph.color}"></i>${L.color[ph.color]}</span>
      <span class="chip">${ph.height === 'alta' ? '▲' : '▼'} ${L.height[ph.height]}</span>
      <span class="chip ${ph.glow === 'bio' ? 'chip-bio' : ''}">${ph.glow === 'bio' ? '✦ Bio' : '○ Comum'}</span>
    </div>`;
  }

  function gameteHTML(str) {
    return `<span class="gamete mono">${[...str].map(formatAllele).join('')}</span>`;
  }

  function plantCardHTML(p) {
    const ph = Genetics.phenotype(p.genotype);
    const selIdx = session.selected.indexOf(p.id);
    const delay = -((p.id * 1.37) % 5).toFixed(2);
    const target = isTargetPlant(p.genotype);
    const title = p.mystery
      ? 'Espécime Misterioso — descubra se é AA ou Aa via Cruzamento-Teste'
      : (p.parents ? `Descendente de #${p.parents[0]} × #${p.parents[1]}` : 'Planta da geração parental (P)');
    const canDiscard = !p.mystery && session.plants.length > 2;

    return `<div class="plant-card ${p.fresh ? 'fresh' : ''} ${selIdx === 0 ? 'sel sel-0' : selIdx === 1 ? 'sel sel-1' : ''} ${target ? 'is-target' : ''} ${p.mystery ? 'is-mystery' : ''}"
      data-plant-id="${p.id}" role="button" tabindex="0" aria-pressed="${selIdx >= 0}"
      aria-label="Planta ${p.id}, ${Genetics.phenoLabel(ph, ', ')}"
      style="--d:${delay}s" title="${title}">
      <span class="sel-badge">${selIdx >= 0 ? 'AB'[selIdx] : ''}</span>
      ${p.mystery ? '<span class="mystery-tag">MISTÉRIO</span>' : ''}
      ${canDiscard ? `<button class="discard-btn" data-discard="${p.id}" title="Descartar planta" aria-label="Descartar planta #${p.id}">✕</button>` : ''}
      <div class="art">${PlantArt.render(p.genotype)}</div>
      <div class="meta">
        <div class="tag">#${p.id} · <span class="gen mono">${genLabel(p.gen)}</span>${target ? ' · ALVO' : ''}</div>
        ${traitChipsHTML(ph, true)}
        ${genoBadgeHTML(p)}
      </div>
    </div>`;
  }

  // =========================================================================
  // RENDER: ESTUFA / CAMPANHA / SANDBOX
  // =========================================================================
  function renderMissionSelectorBar() {
    const prog = GameState.get().greenhouse;
    const btns = MISSIONS.map((m, idx) => {
      const locked = m.id > prog.unlocked;
      const stars = prog.stars[m.id] || 0;
      const active = idx === session.missionIndex;
      return `<button class="mission-pill ${active ? 'active' : ''} ${locked ? 'locked' : ''} ${stars ? 'done' : ''}"
        data-pick-mission="${idx}" ${locked ? 'disabled' : ''} title="Missão ${m.id}: ${m.title} (${m.concept})">
        <span class="mp-num">${locked ? UIArt.icon('lock', 12) : m.id}</span>
        <span class="mp-name">${m.title}</span>
        <span class="mp-stars">${[1, 2, 3].map(s => `<i class="${s <= stars ? 'on' : ''}">★</i>`).join('')}</span>
      </button>`;
    }).join('');
    return `<div class="mission-rail" aria-label="Missões da Campanha">${btns}</div>`;
  }

  function renderMissionHeader() {
    const m = currentMission();
    if (!m) return renderSandboxCreator();
    const left = Math.max(0, m.maxGens - session.gensUsed);
    const noXrayBadge = session.usedXrayInMission
      ? `<span class="bonus-pill off" title="Raio-X foi usado nesta missão">${UIArt.icon('xray', 12)} Raio-X usado (máx. 2★)</span>`
      : `<span class="bonus-pill on" title="Complete dentro das gerações ideais sem Raio-X para 3 estrelas!">${UIArt.icon('spark', 12)} Bônus Sem Raio-X ativo</span>`;

    if (m.type === 'testcross') {
      return `<div class="mission-card testcross-card">
        <div class="mc-art mystery-art">${PlantArt.render(Genetics.parse('RR AA BB'), { cls: 'ghost', title: 'Espécime Misterioso' })}<span class="q-overlay">?</span></div>
        <div class="mc-info">
          <div class="mc-kicker">Missão ${m.id}/8 · ${m.concept}</div>
          <div class="mc-title">Descubra o genótipo da altura do Espécime Misterioso #1</div>
          <p class="small muted" style="margin:2px 0 4px">Cruze #1 com a planta recessiva anã (#2) e emita o laudo abaixo.</p>
          <div class="mc-meta-row">
            <span class="mc-gens ${left <= 1 ? 'low' : ''}">Cruzamentos restantes: <b class="mono">${left}/${m.maxGens}</b></span>
            ${noXrayBadge}
          </div>
        </div>
        <div class="mc-actions">
          <button class="btn btn-small" id="gh-btn-hint">${UIArt.icon('hint', 13)} Dica</button>
          <button class="btn btn-small" id="gh-btn-brief">${UIArt.icon('folder', 13)} Briefing</button>
          <button class="btn btn-small" id="gh-btn-restart">${UIArt.icon('refresh', 13)} Reiniciar</button>
        </div>
      </div>`;
    }

    return `<div class="mission-card">
      <div class="mc-art">${PlantArt.render(Genetics.exemplar(m.target), { cls: 'ghost', title: 'Planta-alvo' })}</div>
      <div class="mc-info">
        <div class="mc-kicker">Missão ${m.id}/8 · ${m.concept}</div>
        <div class="mc-title">Cultive uma planta com este fenótipo:</div>
        ${traitChipsHTML(m.target)}
        <div class="mc-meta-row">
          <span class="mc-gens ${left <= 1 ? 'low' : ''}">Gerações restantes: <b class="mono">${left}/${m.maxGens}</b> <span class="muted">(ideal 3★: ${m.par})</span></span>
          ${noXrayBadge}
        </div>
      </div>
      <div class="mc-actions">
        <button class="btn btn-small" id="gh-btn-hint">Dica</button>
        <button class="btn btn-small" id="gh-btn-brief">Briefing</button>
        <button class="btn btn-small" id="gh-btn-restart">↺ Reiniciar</button>
      </div>
    </div>`;
  }

  function renderSandboxCreator() {
    const cg = session.customGenotype;
    const ph = Genetics.phenotype(cg);
    const picker = (key, title, opts) => `<div class="allele-picker">
      <span class="ap-label">${title}</span>
      <div class="ap-btns">${opts.map(pair =>
        `<button class="ap-btn mono ${cg[key] === pair ? 'active' : ''}" data-custom-gene="${key}" data-custom-pair="${pair}">${pair}</button>`
      ).join('')}</div>
    </div>`;

    return `<div class="sandbox-creator">
      <div class="sc-preview">
        <div class="sc-art">${PlantArt.render(cg)}</div>
        <div class="mono sc-geno">${Genetics.toString(cg)}</div>
      </div>
      <div class="sc-controls">
        <div class="mc-kicker">Bancada Livre · Criador de Genótipo Customizado</div>
        <div class="sc-pickers">
          ${picker('R', 'Cor (Incompleta)', ['RR', 'Rr', 'rr'])}
          ${picker('A', 'Altura (Completa)', ['AA', 'Aa', 'aa'])}
          ${picker('B', 'Brilho (Completa)', ['BB', 'Bb', 'bb'])}
        </div>
        <div class="sc-footer">
          ${traitChipsHTML(ph, true)}
          <button class="btn btn-crimson btn-small" id="sb-add-plant" ${freeSlots() <= 0 ? 'disabled' : ''}>${UIArt.icon('plus', 14)} Adicionar à Estufa</button>
        </div>
      </div>
    </div>`;
  }

  function renderBench() {
    const ids = session.nursery ? session.nursery.parents : session.selected;
    const slotHTML = i => {
      const p = ids[i] != null ? (getPlant(ids[i]) || (session.nursery && session.nursery.parentSnap[i])) : null;
      if (!p) {
        return `<div class="parent-slot slot-${i}" data-slot="${i}">
          <div class="slot-empty"><span class="slot-letter">${'AB'[i]}</span><span>Parental ${'AB'[i]}</span><small>clique numa planta da estufa</small></div>
        </div>`;
      }
      const ph = Genetics.phenotype(p.genotype);
      return `<div class="parent-slot slot-${i} filled" data-slot="${i}" title="Clique para remover da bancada">
        <span class="slot-letter">${'AB'[i]}</span>
        <div class="slot-art">${PlantArt.render(p.genotype)}</div>
        <div class="slot-meta">
          <div class="tag">#${p.id} · <span class="mono">${genLabel(p.gen)}</span>${p.mystery ? ' · ?' : ''}</div>
          ${traitChipsHTML(ph, true)}
          ${genoBadgeHTML(p)}
        </div>
      </div>`;
    };
    return `<div class="bench" id="gh-bench">
      ${slotHTML(0)}
      <div class="cross-x" aria-hidden="true">×</div>
      ${slotHTML(1)}
    </div>`;
  }

  function renderMeiosisStrip(a, b) {
    const xr = isXrayOn();
    const hasMyst = a.mystery || b.mystery;

    const parentBox = (p, letter, cls) => {
      const m = Genetics.meiosisSummary(p.genotype);
      const showAlleles = xr && !p.mystery;
      const pills = m.gametes.map(gm =>
        `<span class="gamete-pill ${cls}">
          ${showAlleles ? gameteHTML(gm.str) : `<span class="mono muted">${p.mystery ? 'R?B' : '???'}</span>`}
          <small class="mono">${fmtPct(gm.p)}</small>
        </span>`
      ).join('');
      return `<div class="meiosis-parent">
        <div class="mp-head">
          <span class="slot-letter mini ${cls}">${letter}</span>
          <span>Planta #${p.id}</span>
          <span class="mono muted small">${showAlleles ? Genetics.toString(p.genotype) : (p.mystery ? 'RR A? BB' : 'genótipo oculto')}</span>
        </div>
        <div class="mp-arrow">↓ Meiose (1 alelo de cada gene por gameta)</div>
        <div class="gamete-list">${p.mystery ? '<span class="gamete-pill muted">Hipótese AA → 100% RAB</span><span class="gamete-pill muted">Hipótese Aa → 50% RAB · 50% RaB</span>' : pills}</div>
      </div>`;
    };

    return `<div class="meiosis-panel">
      <div class="meiosis-title">Formação de Gametas (Meiose — 1ª e 2ª Leis de Mendel)</div>
      <div class="meiosis-grid">
        ${parentBox(a, 'A', 'cls-a')}
        ${parentBox(b, 'B', 'cls-b')}
      </div>
      ${hasMyst ? '<p class="small muted" style="margin:6px 0 0">Como #1 é um <b>Espécime Misterioso</b>, o Quadro de Punnett exato fica oculto — realize o Cruzamento-Teste e observe a prole real!</p>' : ''}
    </div>`;
  }

  function renderPunnettSection() {
    const [a, b] = session.selected.map(getPlant);
    if (!a || !b) return '';
    const m = currentMission();
    const noGens = m && session.gensUsed >= m.maxGens;

    // Caso especial: envolve o Espécime Misterioso no Cruzamento-Teste
    if (a.mystery || b.mystery) {
      return `<div class="punnett-wrap">
        ${renderMeiosisStrip(a, b)}
        <div class="testcross-hypotheses">
          <h4>Compare as duas hipóteses antes de cruzar:</h4>
          <div class="tc-hyp-grid">
            <div class="tc-hyp">
              <b>Hipótese 1: Espécime é AA (Homozigoto)</b>
              <p class="small">Cruzamento <span class="mono">AA × aa</span> → <b>100% Aa (Altas)</b> e <b>0% Anãs</b>.</p>
            </div>
            <div class="tc-hyp">
              <b>Hipótese 2: Espécime é Aa (Heterozigoto)</b>
              <p class="small">Cruzamento <span class="mono">Aa × aa</span> → <b>50% Aa (Altas)</b> e <b>50% aa (Anãs)</b>.</p>
            </div>
          </div>
        </div>
        ${renderTestCrossDiagnosisPanel()}
        <div class="lab-actions">
          <button class="btn" id="gh-btn-clear">Limpar seleção</button>
          <button class="btn btn-primary btn-big" id="gh-btn-cross" ${noGens || session.finished ? 'disabled' : ''}>
            Executar Cruzamento-Teste <small>gera 4 mudas</small>
          </button>
        </div>
      </div>`;
    }

    const sq = Genetics.punnett(a.genotype, b.genotype);
    const dist = Genetics.distribution(a.genotype, b.genotype);
    const xr = isXrayOn();

    let tableHTML = '';
    if (session.punnettTab === 'full') {
      const head = sq.cols.map((c, ci) =>
        `<th class="gam gam-b" data-col="${ci}">${xr ? gameteHTML(c.str) : '<span class="q">?</span>'}<small class="mono">${fmtPct(c.p)}</small></th>`
      ).join('');
      const rows = sq.rows.map((r, ri) => {
        const cells = sq.cells[ri].map((c, ci) => {
          const match = m && m.target && Genetics.matches(c.pheno, m.target);
          const gs = Genetics.toString(c.genotype, ' ');
          const label = Genetics.phenoLabel(c.pheno);
          return `<td class="pc c-${c.pheno.color} ${c.pheno.glow === 'bio' ? 'bio' : ''} ${match ? 'match' : ''}"
            tabindex="0"
            data-ri="${ri}" data-ci="${ci}"
            data-ga="${xr ? c.gameteA : '?'}" data-gb="${xr ? c.gameteB : '?'}"
            data-geno="${xr ? gs : '?? ?? ??'}" data-pheno="${label}"
            data-pct="${fmtPct(c.p)}" data-frac="${frac(c.p)}"
            title="${xr ? gs + ' — ' : ''}${label} — ${fmtPct(c.p)}">
            ${xr ? `<span class="pc-g mono">${Genetics.toString(c.genotype, '')}</span>` : ''}
            <span class="pc-glyph">${c.pheno.height === 'alta' ? '▲' : '▼'}${c.pheno.glow === 'bio' ? '<em>✦</em>' : ''}</span>
            <span class="pc-p mono">${fmtPct(c.p)}</span>
          </td>`;
        }).join('');
        return `<tr><th class="gam gam-a" data-row="${ri}">${xr ? gameteHTML(r.str) : '<span class="q">?</span>'}<small class="mono">${fmtPct(r.p)}</small></th>${cells}</tr>`;
      }).join('');

      tableHTML = `
        <div class="punnett-inspector" id="punnett-inspector">
          <span class="pi-hint">Passe o mouse (ou foque) em uma célula do quadro para rastrear os gametas de origem e o fenótipo resultante.</span>
        </div>
        <div class="table-scroll">
          <table class="punnett size-${Math.max(sq.rows.length, sq.cols.length)}" id="punnett-table">
            <thead><tr><th class="corner"><span class="ca">A</span>╲<span class="cb">B</span></th>${head}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="legend">
          <span><i class="sw c-vermelha"></i>Vermelha</span>
          <span><i class="sw c-rosa"></i>Rosa</span>
          <span><i class="sw c-branca"></i>Branca</span>
          <span>▲ Alta</span>
          <span>▼ Anã</span>
          <span class="lg-bio">✦ Bioluminescente</span>
          ${m && m.target ? '<span class="lg-target">Alvo</span>' : ''}
        </div>`;
    } else {
      tableHTML = `<div class="gene-squares">${Genetics.GENES.map(gene => {
        const gs = Genetics.geneSquare(a.genotype, b.genotype, gene.key);
        const cells = gs.rows.map((ra, i) => `<tr>
          <th class="gam gam-a">${xr ? formatAllele(ra) : '?'}</th>
          ${gs.cells[i].map(c => `<td class="gcell gc-${gene.key}-${c.pair}">
            ${xr ? `<b class="mono">${c.pair}</b>` : ''}
            <span>${Genetics.GENE_TRAIT_LABEL[gene.key][c.pair]}</span>
          </td>`).join('')}
        </tr>`).join('');
        const sum = {};
        Object.entries(gs.dist).forEach(([pair, p]) => {
          const lbl = Genetics.GENE_TRAIT_LABEL[gene.key][pair];
          sum[lbl] = (sum[lbl] || 0) + p;
        });
        return `<div class="gsq">
          <h4>${gene.name}</h4><small class="muted">${gene.mode}</small>
          <table><thead><tr><th class="corner"></th>${gs.cols.map(cb => `<th class="gam gam-b">${xr ? formatAllele(cb) : '?'}</th>`).join('')}</tr></thead>
          <tbody>${cells}</tbody></table>
          <div class="gsq-sum">${Object.entries(sum).map(([l, p]) => `<div><span>${l}</span><b class="mono">${fmtPct(p)}</b></div>`).join('')}</div>
        </div>`;
      }).join('')}</div>`;
    }

    const pdRows = dist.phenotypes.map(e => {
      const match = m && m.target && Genetics.matches(e.pheno, m.target);
      return `<div class="pd-row ${match ? 'match' : ''}">
        <span class="swatch c-${e.pheno.color} ${e.pheno.glow === 'bio' ? 'bio' : ''}">${e.pheno.height === 'alta' ? '▲' : '▼'}</span>
        <span class="pd-label">${Genetics.phenoLabel(e.pheno)}${match ? ' · ALVO' : ''}</span>
        <span class="pd-bar"><i style="width:${(e.p * 100).toFixed(2)}%"></i></span>
        <span class="pd-pct mono">${fmtPct(e.p)}<small>${frac(e.p)}</small></span>
      </div>`;
    }).join('');

    let oddsHTML = '';
    if (m && m.target) {
      const per = dist.phenotypes.filter(e => Genetics.matches(e.pheno, m.target)).reduce((s, e) => s + e.p, 0);
      const atLeast = 1 - Math.pow(1 - per, 4);
      oddsHTML = per > 0
        ? `<div class="odds ok">Chance por muda: <b class="mono">${fmtPct(per)}</b> (<span class="mono">${frac(per)}</span>) · Pelo menos 1 alvo em 4 mudas: <b class="mono">${fmtPct(atLeast)}</b></div>`
        : `<div class="odds no">Este cruzamento dá <b>0%</b> para o alvo diretamente — mas pode gerar uma F1 intermediária estratégica!</div>`;
    }

    const sandboxStatsHTML = session.mode === 'sandbox' ? renderSandboxStatsForPair(a.genotype, b.genotype, dist) : '';

    return `<div class="punnett-wrap">
      ${renderMeiosisStrip(a, b)}
      <div class="tabs" role="tablist">
        <button class="tab ${session.punnettTab === 'full' ? 'active' : ''}" data-ptab="full" role="tab">Quadro de Punnett <small class="mono">${sq.rows.length}×${sq.cols.length}</small></button>
        <button class="tab ${session.punnettTab === 'genes' ? 'active' : ''}" data-ptab="genes" role="tab">Por Característica <small class="mono">3×(2×2)</small></button>
      </div>
      <div class="punnett-view">${tableHTML}</div>
      <div class="pheno-dist"><h3>Probabilidades Fenotípicas da Prole</h3>${pdRows}</div>
      ${oddsHTML}
      ${sandboxStatsHTML}
      <div class="lab-actions">
        <button class="btn" id="gh-btn-clear">Limpar seleção</button>
        ${session.mode === 'sandbox' ? `<button class="btn" id="sb-btn-batch" title="Simula 5 cruzamentos (20 mudas) para estatística acumulada">${UIArt.icon('spark', 14)} Simular +20 mudas</button>` : ''}
        <button class="btn btn-crimson btn-big" id="gh-btn-cross" ${noGens || session.finished ? 'disabled' : ''}>
          ${UIArt.icon('dna', 16)} Confirmar Cruzamento <small>gera 4 mudas</small>
        </button>
      </div>
    </div>`;
  }

  function renderSandboxStatsForPair(g1, g2, dist) {
    const sb = GameState.get().sandbox;
    const pairKey = [Genetics.toString(g1, ''), Genetics.toString(g2, '')].sort().join('×');
    const bucket = sb.byPair[pairKey];
    if (!bucket || !bucket.total) {
      return `<div class="sb-stats empty">
        <h4>Estatística Acumulada (Mendel Esperado × Observado)</h4>
        <p class="small muted">Cruze este par ou clique em <b>Simular +20 mudas</b> para comparar as frequências observadas com a previsão teórica de Mendel.</p>
      </div>`;
    }
    const rows = dist.phenotypes.map(e => {
      const k = Genetics.phenoKey(e.pheno);
      const count = bucket.observed[k] || 0;
      const obsP = count / bucket.total;
      const diff = (obsP - e.p) * 100;
      return `<tr>
        <td><span class="swatch c-${e.pheno.color} ${e.pheno.glow === 'bio' ? 'bio' : ''}">${e.pheno.height === 'alta' ? '▲' : '▼'}</span> ${Genetics.phenoLabel(e.pheno)}</td>
        <td class="mono">${fmtPct(e.p)}</td>
        <td class="mono"><b>${count}/${bucket.total}</b> (${fmtPct(obsP)})</td>
        <td class="mono small ${Math.abs(diff) <= 5 ? 'good' : 'muted'}">${diff >= 0 ? '+' : ''}${diff.toFixed(1)} pp</td>
      </tr>`;
    }).join('');

    return `<div class="sb-stats">
      <div class="sb-stats-head">
        <h4>Estatística Acumulada deste Par <span class="mono muted">(N = ${bucket.total} mudas em ${bucket.crosses} cruzamento(s))</span></h4>
        <button class="btn btn-ghost btn-small" id="sb-clear-stats">Zerar estatísticas</button>
      </div>
      <table class="obs-table">
        <thead><tr><th>Fenótipo</th><th>Esperado (Mendel)</th><th>Observado</th><th>Desvio</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="small muted" style="margin:6px 0 0">Total geral no Sandbox: <b class="mono">${sb.totalSeedlings}</b> mudas em <b class="mono">${sb.totalCrosses}</b> cruzamentos. Quanto maior o N, mais o observado converge para Mendel!</p>
    </div>`;
  }

  function renderTestCrossDiagnosisPanel() {
    const m = currentMission();
    if (!m || m.type !== 'testcross') return '';
    const totalTall = session.testCrossHistory.reduce((s, h) => s + h.tall, 0);
    const totalDwarf = session.testCrossHistory.reduce((s, h) => s + h.dwarf, 0);
    const total = totalTall + totalDwarf;

    return `<div class="diagnosis-panel">
      <h4>Laudo do Cruzamento-Teste (Espécime Misterioso #1)</h4>
      <div class="diag-tally">
        <span>Total de descendentes observados: <b class="mono">${total}</b></span>
        <span>▲ Altas: <b class="mono">${totalTall}</b></span>
        <span>▼ Anãs (<span class="mono">aa</span>): <b class="mono ${totalDwarf > 0 ? 'good' : ''}">${totalDwarf}</b></span>
      </div>
      ${total === 0
        ? '<p class="small muted">Realize pelo menos 1 cruzamento entre o Espécime #1 e a Planta-Teste #2 antes de emitir o laudo.</p>'
        : `<p class="small">${totalDwarf > 0
            ? 'Nasceram descendentes <b>anões (aa)</b>! O que isso prova sobre os alelos do Espécime #1?'
            : 'Até agora todas nasceram altas. Você pode arriscar o laudo ou cruzar mais uma vez para aumentar a confiança estatística!'}</p>
          <div class="diag-actions">
            <button class="btn" data-diagnose="hom" ${session.finished ? 'disabled' : ''}>Emitir Laudo: Homozigoto (AA)</button>
            <button class="btn btn-primary" data-diagnose="het" ${session.finished ? 'disabled' : ''}>Emitir Laudo: Heterozigoto (Aa)</button>
          </div>`}
    </div>`;
  }

  function renderNursery() {
    const n = session.nursery;
    const keepCount = n.seedlings.filter(s => s.keep).length;
    const free = freeSlots();
    const cards = n.seedlings.map((s, i) => {
      const ph = Genetics.phenotype(s.genotype);
      const match = isTargetPlant(s.genotype);
      const delay = (0.12 + i * 0.14).toFixed(2);
      return `<div class="plant-card seedling ${s.keep ? 'keep' : ''} ${match ? 'is-target' : ''} ${n.settled ? 'settled' : ''}"
        data-seed="${i}" role="button" tabindex="0" aria-pressed="${s.keep}"
        style="--delay:${delay}s;--d:-${(i * 1.1).toFixed(1)}s">
        ${match ? '<span class="target-badge">ALVO</span>' : ''}
        <div class="seedling-stage">
          <div class="capsule-shell" aria-hidden="true"></div>
          <div class="art seedling-art-reveal">${PlantArt.render(s.genotype)}</div>
        </div>
        <div class="meta">
          ${traitChipsHTML(ph, true)}
          ${genoBadgeHTML({ genotype: s.genotype, mystery: false })}
        </div>
        <div class="keep-toggle">${s.keep ? '✔ Manter na Estufa' : 'Descartar'}</div>
      </div>`;
    }).join('');

    const counts = new Map();
    n.seedlings.forEach(s => {
      const k = Genetics.phenoKey(Genetics.phenotype(s.genotype));
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    const obsRows = n.expected.phenotypes.map(e => {
      const c = counts.get(Genetics.phenoKey(e.pheno)) || 0;
      return `<tr class="${c ? '' : 'dim'}">
        <td><span class="swatch c-${e.pheno.color} ${e.pheno.glow === 'bio' ? 'bio' : ''}">${e.pheno.height === 'alta' ? '▲' : '▼'}</span> ${Genetics.phenoLabel(e.pheno)}</td>
        <td class="mono">${fmtPct(e.p)}</td>
        <td class="mono"><b>${c}/4</b> (${fmtPct(c / 4)})</td>
      </tr>`;
    }).join('');

    const tooFew = session.plants.length + keepCount < 2;
    const m = currentMission();
    const hideExp = m && m.type === 'testcross';

    return `<div class="nursery ${n.settled ? 'settled' : ''}">
      <div class="nursery-head">
        <h3>Cápsulas Abertas — Geração ${genLabel(n.gen)}</h3>
        <span class="muted small">Parentais #${n.parents[0]} × #${n.parents[1]}</span>
      </div>
      <p class="hint">Clique nas mudas para decidir quais <b>manter</b>. Vasos livres: <b class="mono ${keepCount > free ? 'warn' : ''}">${free}</b> · Selecionadas: <b class="mono">${keepCount}</b></p>
      <div class="seedling-row">${cards}</div>
      ${!hideExp ? `<details class="observed">
        <summary>Comparar Esperado × Observado nesta geração</summary>
        <table class="obs-table"><thead><tr><th>Fenótipo</th><th>Esperado</th><th>Observado</th></tr></thead><tbody>${obsRows}</tbody></table>
      </details>` : ''}
      <div class="lab-actions">
        <button class="btn" id="gh-btn-keep-none">Descartar todas</button>
        <button class="btn btn-crimson btn-big" id="gh-btn-plant" ${keepCount > free || tooFew ? 'disabled' : ''}>
          ${UIArt.icon('leaf', 16)} ${keepCount ? `Plantar ${keepCount} muda${keepCount > 1 ? 's' : ''}` : 'Continuar sem plantar'}
        </button>
      </div>
      ${keepCount > free ? '<p class="warn small">Estufa sem espaço suficiente: descarte plantas (✕) ou selecione menos mudas.</p>' : ''}
    </div>`;
  }

  function renderIntroCard() {
    const m = currentMission();
    return `<div class="intro-card">
      <h3>Como conduzir um cruzamento</h3>
      <ol>
        <li><b>Selecione 2 parentais</b> clicando nos vasos da estufa à esquerda.</li>
        <li><b>Observe a Meiose e os Gametas</b>: veja como cada par de alelos se separa na formação dos gametas.</li>
        <li><b>Explore o Quadro de Punnett interativo</b>: passe o mouse sobre qualquer célula para rastrear os gametas de origem e as probabilidades.</li>
        <li><b>Cruze e colha 4 mudas</b>: cada espécie inédita desbloqueia automaticamente uma entrada no <b>Herbário</b>!</li>
      </ol>
      ${m && m.type === 'testcross' ? renderTestCrossDiagnosisPanel() : ''}
    </div>`;
  }

  function render(targetEl) {
    if (targetEl) containerEl = targetEl;
    if (!containerEl) return;

    const empties = Math.max(0, freeSlots());
    const labBody = session.nursery
      ? renderNursery()
      : (session.selected.length === 2 ? renderPunnettSection() : renderIntroCard());

    containerEl.innerHTML = `
      ${session.mode === 'campaign' ? renderMissionSelectorBar() : ''}
      <div class="layout">
        <section class="paper-panel greenhouse" aria-labelledby="gh-heading">
          <div class="panel-head">
            <h2 id="gh-heading">${session.mode === 'sandbox' ? 'Bancada Livre (Sandbox)' : 'Ala Botânica — Estufa de Mendel'}</h2>
            <span class="counter mono">${session.plants.length}/${session.capacity} vasos</span>
          </div>
          <p class="hint">${session.nursery
            ? 'Escolha as mudas na bancada. Você pode descartar plantas (✕) para abrir espaço.'
            : 'Clique em duas plantas para posicioná-las como parentais na bancada.'}</p>
          <div class="plant-grid ${session.nursery ? 'locked' : ''}" id="gh-grid">
            ${session.plants.map(plantCardHTML).join('')}
            ${Array.from({ length: empties }, () => '<div class="empty-slot"><span>Vaso vazio</span></div>').join('')}
          </div>
        </section>

        <section class="paper-panel lab" aria-labelledby="lab-heading">
          ${renderMissionHeader()}
          <div class="panel-head">
            <h2 id="lab-heading">Bancada de Cruzamento</h2>
            <button class="btn btn-small btn-toggle ${isXrayOn() ? 'on' : ''}" id="gh-btn-xray" aria-pressed="${isXrayOn()}">
              Raio-X <span class="pill">${isXrayOn() ? 'ON' : 'OFF'}</span>
            </button>
          </div>
          ${renderBench()}
          <div id="gh-lab-body">${labBody}</div>
        </section>
      </div>`;

    session.plants.forEach(p => { p.fresh = false; });
    bindGreenhouseEvents();
  }

  // =========================================================================
  // INTERAÇÃO & EVENTOS DA ESTUFA
  // =========================================================================
  function bindGreenhouseEvents() {
    if (!containerEl) return;

    // Seletor de missões
    $$('[data-pick-mission]', containerEl).forEach(btn => {
      btn.addEventListener('click', () => startMission(Number(btn.dataset.pickMission), true));
    });

    // Raio-X inline
    const xrayBtn = $('#gh-btn-xray', containerEl);
    if (xrayBtn) {
      xrayBtn.addEventListener('click', () => {
        if (window.App && App.toggleXray) App.toggleXray();
      });
    }

    // Dica / Briefing / Reiniciar
    const m = currentMission();
    const hintBtn = $('#gh-btn-hint', containerEl);
    if (hintBtn && m) {
      hintBtn.addEventListener('click', () => UI.openModal({
        title: `Dica — ${m.title}`,
        body: `<p>${m.hint}</p>`,
        actions: [{ label: 'Entendi', cls: 'btn-primary' }],
      }));
    }
    const briefBtn = $('#gh-btn-brief', containerEl);
    if (briefBtn) briefBtn.addEventListener('click', () => showMissionBriefing(session.missionIndex, false));
    const restartBtn = $('#gh-btn-restart', containerEl);
    if (restartBtn) restartBtn.addEventListener('click', () => startMission(session.missionIndex, false));

    // Sandbox: seletor de genótipo customizado
    $$('[data-custom-gene]', containerEl).forEach(btn => {
      btn.addEventListener('click', () => {
        session.customGenotype[btn.dataset.customGene] = btn.dataset.customPair;
        AudioEngine.click();
        render();
      });
    });
    const addPlantBtn = $('#sb-add-plant', containerEl);
    if (addPlantBtn) {
      addPlantBtn.addEventListener('click', () => {
        if (freeSlots() <= 0) { AudioEngine.error(); UI.toast('Estufa cheia! Descarte alguma planta primeiro.', 'warn'); return; }
        const g = { ...session.customGenotype };
        session.plants.push(makePlant(g, 0, null, false));
        const isNew = GameState.discoverSpecies(g);
        AudioEngine.plant();
        if (isNew) UI.toast(`Nova espécie registrada no Herbário: ${Genetics.phenoLabel(Genetics.phenotype(g))}!`, 'good');
        render();
      });
    }
    const clearStatsBtn = $('#sb-clear-stats', containerEl);
    if (clearStatsBtn) {
      clearStatsBtn.addEventListener('click', () => {
        GameState.clearSandboxStats();
        UI.toast('Estatísticas do Sandbox zeradas.');
        render();
      });
    }
    const batchBtn = $('#sb-btn-batch', containerEl);
    if (batchBtn) {
      batchBtn.addEventListener('click', runSandboxBatch);
    }

    // Grade da estufa
    const grid = $('#gh-grid', containerEl);
    if (grid) {
      grid.addEventListener('click', e => {
        const disc = e.target.closest('[data-discard]');
        if (disc) { e.stopPropagation(); discardPlant(Number(disc.dataset.discard)); return; }
        const card = e.target.closest('[data-plant-id]');
        if (card) selectPlant(Number(card.dataset.plantId));
      });
      grid.addEventListener('keydown', e => {
        const card = e.target.closest('[data-plant-id]');
        if (card && e.target === card && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          selectPlant(Number(card.dataset.plantId));
        }
      });
    }

    // Slots da bancada (clicar remove)
    $$('.parent-slot.filled', containerEl).forEach(slot => {
      slot.addEventListener('click', () => {
        if (session.nursery) return;
        const idx = Number(slot.dataset.slot);
        if (session.selected[idx] != null) {
          session.selected.splice(idx, 1);
          AudioEngine.deselect();
          render();
        }
      });
    });

    // Abas Punnett
    $$('[data-ptab]', containerEl).forEach(tab => {
      tab.addEventListener('click', () => {
        session.punnettTab = tab.dataset.ptab;
        render();
      });
    });

    // Hover & Focus interativo no Quadro de Punnett (destaca gametas de origem + inspetor)
    const pTable = $('#punnett-table', containerEl);
    const inspector = $('#punnett-inspector', containerEl);
    if (pTable && inspector) {
      const highlightCell = cell => {
        $$('.hl-gamete, .hl-cell', pTable).forEach(el => el.classList.remove('hl-gamete', 'hl-cell'));
        if (!cell) return;
        const ri = cell.dataset.ri;
        const ci = cell.dataset.ci;
        cell.classList.add('hl-cell');
        const rTh = $(`th.gam-a[data-row="${ri}"]`, pTable);
        const cTh = $(`th.gam-b[data-col="${ci}"]`, pTable);
        if (rTh) rTh.classList.add('hl-gamete');
        if (cTh) cTh.classList.add('hl-gamete');
        inspector.innerHTML = `<div class="pi-live">
          <span class="pi-gam a mono">Gameta A: <b>${cell.dataset.ga}</b></span>
          <span class="muted">+</span>
          <span class="pi-gam b mono">Gameta B: <b>${cell.dataset.gb}</b></span>
          <span class="muted">→</span>
          <span class="pi-geno mono">${cell.dataset.geno}</span>
          <span class="pi-pheno">${cell.dataset.pheno}</span>
          <span class="pi-prob mono">${cell.dataset.pct} (${cell.dataset.frac})</span>
        </div>`;
      };
      pTable.addEventListener('mouseover', e => {
        const cell = e.target.closest('td.pc');
        if (cell) highlightCell(cell);
      });
      pTable.addEventListener('focusin', e => {
        const cell = e.target.closest('td.pc');
        if (cell) highlightCell(cell);
      });
      pTable.addEventListener('mouseleave', () => {
        $$('.hl-gamete, .hl-cell', pTable).forEach(el => el.classList.remove('hl-gamete', 'hl-cell'));
      });
    }

    // Botões de ação da bancada
    const clearBtn = $('#gh-btn-clear', containerEl);
    if (clearBtn) clearBtn.addEventListener('click', () => { session.selected = []; AudioEngine.deselect(); render(); });

    const crossBtn = $('#gh-btn-cross', containerEl);
    if (crossBtn) crossBtn.addEventListener('click', doCross);

    const plantBtn = $('#gh-btn-plant', containerEl);
    if (plantBtn) plantBtn.addEventListener('click', plantSeedlings);

    const keepNoneBtn = $('#gh-btn-keep-none', containerEl);
    if (keepNoneBtn) {
      keepNoneBtn.addEventListener('click', () => {
        session.nursery.seedlings.forEach(s => { s.keep = false; });
        if (session.plants.length >= 2) plantSeedlings(); else render();
      });
    }

    $$('[data-seed]', containerEl).forEach(el => {
      el.addEventListener('click', () => toggleSeedling(Number(el.dataset.seed)));
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSeedling(Number(el.dataset.seed)); }
      });
    });

    // Botões de diagnóstico do Cruzamento-Teste
    $$('[data-diagnose]', containerEl).forEach(btn => {
      btn.addEventListener('click', () => submitTestCrossDiagnosis(btn.dataset.diagnose));
    });
  }

  function selectPlant(id) {
    if (session.nursery) { AudioEngine.error(); UI.toast('Escolha quais mudas manter antes de iniciar outro cruzamento.', 'warn'); return; }
    if (session.finished) return;
    const idx = session.selected.indexOf(id);
    if (idx >= 0) {
      session.selected.splice(idx, 1);
      AudioEngine.deselect();
    } else {
      if (session.selected.length >= 2) session.selected[1] = id;
      else session.selected.push(id);
      AudioEngine.select(session.selected.length === 2);
    }
    render();
  }

  function discardPlant(id) {
    if (session.plants.length <= 2) { AudioEngine.error(); UI.toast('Mantenha pelo menos 2 plantas na estufa.', 'warn'); return; }
    const p = getPlant(id);
    if (p && p.mystery) { AudioEngine.error(); return; }
    const card = $(`[data-plant-id="${id}"]`, containerEl);
    const finish = () => {
      session.plants = session.plants.filter(x => x.id !== id);
      session.selected = session.selected.filter(x => x !== id);
      render();
    };
    AudioEngine.discard();
    if (card) { card.classList.add('leaving'); setTimeout(finish, 240); } else finish();
  }

  function doCross() {
    const m = currentMission();
    if (session.selected.length < 2 || session.nursery || session.finished) return;
    if (m && session.gensUsed >= m.maxGens) { AudioEngine.error(); return; }

    const [a, b] = session.selected.map(getPlant);
    session.gensUsed += 1;

    const free = freeSlots();
    const seedlings = Array.from({ length: 4 }, () => ({
      genotype: Genetics.sampleChild(a.genotype, b.genotype),
      keep: false,
    }));

    // Pré-seleciona mudas-alvo se couberem
    let budget = free;
    seedlings.forEach(s => {
      if (budget > 0 && isTargetPlant(s.genotype)) { s.keep = true; budget -= 1; }
    });

    // Registra histórico do Cruzamento-Teste
    if (m && m.type === 'testcross' && (a.mystery || b.mystery)) {
      const tall = seedlings.filter(s => Genetics.phenotype(s.genotype).height === 'alta').length;
      const dwarf = 4 - tall;
      session.testCrossHistory.push({ gen: session.gensUsed, tall, dwarf });
    }

    // Registra descobertas no Herbário & estatísticas
    const childGenos = seedlings.map(s => s.genotype);
    let newlyDiscovered = [];
    if (session.mode === 'sandbox') {
      const res = GameState.recordSandboxCross(a.genotype, b.genotype, childGenos);
      newlyDiscovered = res.newlyDiscovered;
    } else {
      newlyDiscovered = GameState.recordGreenhouseCross(childGenos);
    }

    session.nursery = {
      parents: [a.id, b.id],
      parentSnap: [a, b],
      gen: Math.max(a.gen, b.gen) + 1,
      seedlings,
      expected: Genetics.distribution(a.genotype, b.genotype),
      settled: false,
    };
    session.selected = [];

    AudioEngine.pollinate();
    [0, 1, 2, 3].forEach(i => setTimeout(() => AudioEngine.sprout(i), 220 + i * 140));
    UI.sparkle($('#gh-bench', containerEl));
    render();

    if (newlyDiscovered.length > 0) {
      const names = newlyDiscovered.map(ph => Genetics.phenoLabel(ph, ' ')).join(', ');
      setTimeout(() => UI.toast(`Herbário atualizado! Nova espécie: ${names}`, 'good'), 550);
    } else if (seedlings.some(s => isTargetPlant(s.genotype))) {
      setTimeout(() => UI.toast('Planta-alvo obtida! Mantenha-a na estufa para concluir a missão.', 'good'), 550);
    }
  }

  function runSandboxBatch() {
    if (session.mode !== 'sandbox' || session.selected.length < 2) return;
    const [a, b] = session.selected.map(getPlant);
    const children = Array.from({ length: 20 }, () => Genetics.sampleChild(a.genotype, b.genotype));
    const res = GameState.recordSandboxCross(a.genotype, b.genotype, children);
    AudioEngine.pollinate();
    UI.sparkle($('#gh-bench', containerEl));
    UI.toast(`+20 mudas simuladas! Total deste par: ${res.bucket.total} mudas.`, 'good');
    render();
  }

  function toggleSeedling(i) {
    const n = session.nursery;
    if (!n) return;
    const s = n.seedlings[i];
    const keepCount = n.seedlings.filter(x => x.keep).length;
    if (!s.keep && keepCount >= freeSlots()) {
      AudioEngine.error();
      UI.toast('Estufa cheia! Descarte uma planta (✕) para liberar um vaso.', 'warn');
      return;
    }
    s.keep = !s.keep;
    n.settled = true;
    s.keep ? AudioEngine.select() : AudioEngine.deselect();
    render();
  }

  function plantSeedlings() {
    const n = session.nursery;
    if (!n) return;
    const kept = n.seedlings.filter(s => s.keep);
    if (kept.length > freeSlots() || session.plants.length + kept.length < 2) { AudioEngine.error(); return; }
    kept.forEach(s => session.plants.push(makePlant(s.genotype, n.gen, n.parents, false)));
    session.nursery = null;
    kept.length ? AudioEngine.plant() : AudioEngine.discard();
    render();
    checkCampaignOutcome();
  }

  function checkCampaignOutcome() {
    const m = currentMission();
    if (!m || m.type !== 'breed' || session.finished) return;
    const winner = session.plants.find(p => isTargetPlant(p.genotype));
    if (winner) {
      session.finished = true;
      setTimeout(() => showMissionVictory(winner), 420);
    } else if (session.gensUsed >= m.maxGens) {
      session.finished = true;
      setTimeout(showMissionFailed, 420);
    }
  }

  function submitTestCrossDiagnosis(choice) {
    const m = currentMission();
    if (!m || m.type !== 'testcross' || session.finished) return;
    if (choice === m.expectedDiagnosis) {
      session.finished = true;
      const myst = session.plants.find(p => p.mystery);
      if (myst) myst.mystery = false;
      render();
      showMissionVictory(myst || session.plants[0], true);
    } else {
      AudioEngine.stamp(false);
      UI.toast('Laudo incorreto! Analise os descendentes anões (aa) obtidos no Cruzamento-Teste e tente novamente.', 'warn');
    }
  }

  function computeStars(m) {
    const withinPar = session.gensUsed <= m.par;
    const noXray = !session.usedXrayInMission;
    if (withinPar && noXray) return 3;
    if (withinPar || noXray) return 2;
    return 1;
  }

  function showMissionVictory(plant, isTestCross = false) {
    const m = currentMission();
    const stars = computeStars(m);
    const res = GameState.completeMission(m.id, stars, session.gensUsed, session.usedXrayInMission, isTestCross);
    AudioEngine.fanfare();
    UI.confetti();

    const hasNext = session.missionIndex + 1 < MISSIONS.length;
    const starReasons = [
      `✔ Missão concluída (+1★)`,
      `${session.gensUsed <= m.par ? '✔' : '✕'} Dentro do limite ideal de ${m.par} geração(ões) (${session.gensUsed <= m.par ? '+1★' : 'sem bônus'})`,
      `${!session.usedXrayInMission ? '✔' : '✕'} Sem ativar o Raio-X Genético (${!session.usedXrayInMission ? '+1★ · +40 XP' : 'usado'})`,
    ];

    UI.openModal({
      title: isTestCross ? 'Laudo Confirmado! Cruzamento-Teste Concluído!' : 'Missão Concluída!',
      cls: 'modal-win',
      closable: false,
      body: `<div class="win-art">${PlantArt.render(plant.genotype)}</div>
        <div class="stars-row">${[1, 2, 3].map(i => `<span class="${i <= stars ? 'on' : ''}" style="--i:${i}">★</span>`).join('')}</div>
        <div class="xp-gain-pill">+${res.xpEarned} XP ${res.leveledUp ? `· Nova Patente: ${res.rank.title}!` : ''}</div>
        <p class="center">Espécime: <b>${Genetics.phenoLabel(Genetics.phenotype(plant.genotype))}</b> · Genótipo: <b class="mono good">${Genetics.toString(plant.genotype)}</b></p>
        <ul class="star-breakdown">${starReasons.map(r => `<li>${r}</li>`).join('')}</ul>
        <div class="lesson-box"><h4>Princípio Genético — ${m.concept}</h4><p>${m.lesson}</p></div>`,
      actions: [
        { label: 'Mesa Principal', onClick: () => { UI.closeModal(); App.navigate('hub'); } },
        { label: 'Ver Herbário', onClick: () => { UI.closeModal(); App.navigate('herbarium'); } },
        hasNext
          ? { label: 'Próxima Missão ▶', cls: 'btn-crimson', onClick: () => { UI.closeModal(); startMission(session.missionIndex + 1, true); } }
          : { label: 'Abrir Dossiê 46 ▶', cls: 'btn-crimson', onClick: () => { UI.closeModal(); App.navigate('dossie'); } },
      ],
    });
  }

  function showMissionFailed() {
    const m = currentMission();
    AudioEngine.fail();
    UI.openModal({
      title: 'Limite de Gerações Atingido',
      closable: false,
      body: `<p>As <b>${m.maxGens}</b> gerações acabaram sem obter o espécime desejado. Na genética real, planejar os parentais maximiza as chances estatísticas!</p>
        <div class="lesson-box"><h4>Dica Estratégica</h4><p>${m.hint}</p></div>`,
      actions: [
        { label: 'Início', onClick: () => { UI.closeModal(); App.navigate('hub'); } },
        { label: '↺ Tentar Novamente', cls: 'btn-primary', onClick: () => { UI.closeModal(); startMission(session.missionIndex, false); } },
      ],
    });
  }

  function showMissionBriefing(idx, starting) {
    const m = MISSIONS[idx];
    const art = m.type === 'testcross'
      ? PlantArt.render(Genetics.parse('RR AA BB'), { cls: 'ghost' })
      : PlantArt.render(Genetics.exemplar(m.target), { cls: 'ghost' });

    UI.openModal({
      title: `Missão ${m.id}/8 — ${m.title}`,
      cls: 'modal-brief',
      body: `<div class="brief-grid">
          <div class="brief-art">${art}<span>${m.type === 'testcross' ? 'Espécime Misterioso' : 'Planta-Alvo'}</span></div>
          <div>
            <span class="concept-tag">${m.concept}</span>
            <p>${m.story}</p>
            ${m.target ? traitChipsHTML(m.target) : ''}
            <p class="small muted">Limite: <b class="mono">${m.maxGens}</b> geração(ões) · Ideal para 3★: <b class="mono">${m.par}</b> (sem Raio-X)</p>
          </div>
        </div>
        <div class="lesson-box"><h4>Fundamento Genético</h4><p>${m.lesson}</p></div>`,
      actions: [{ label: starting ? 'Iniciar Experimento ▶' : 'Voltar à Bancada', cls: 'btn-primary' }],
    });
  }

  // =========================================================================
  // RENDER: HERBÁRIO / ALMANAQUE COLECIONÁVEL (12 ESPÉCIES)
  // =========================================================================
  function renderHerbarium(el) {
    const disc = GameState.get().herbarium.discovered;
    const count = Object.keys(disc).length;
    const pct = Math.round((count / 12) * 100);

    const cards = Genetics.HERBARIUM_CATALOG.map(spec => {
      const info = disc[spec.key];
      const unlocked = !!info;
      const rarSlug = spec.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return `<article class="herb-card ${unlocked ? 'unlocked' : 'locked'} rar-${rarSlug}">
        <div class="hc-top">
          <span class="hc-num mono">#${String(spec.id).padStart(2, '0')}</span>
          <span class="rar-badge rar-${rarSlug}">${spec.rarity}</span>
        </div>
        <div class="hc-art">${PlantArt.render(spec.exemplar, { silhouette: !unlocked })}</div>
        <div class="hc-body">
          <h3 class="hc-latin">${unlocked ? spec.latin : 'Espécime Não Catalogado'}</h3>
          <div class="hc-pheno">${unlocked ? Genetics.phenoLabel(spec) : '??? · ??? · ???'}</div>
          <p class="small muted">${unlocked ? spec.desc : 'Produza esta combinação genética na Estufa ou no Sandbox para registrá-la no almanaque.'}</p>
          ${unlocked ? `<div class="hc-foot mono small">Exemplar: ${Genetics.toString(spec.exemplar)} · Cultivadas: ${info.count}</div>` : '<div class="hc-foot mono small dim">Bloqueado</div>'}
        </div>
      </article>`;
    }).join('');

    el.innerHTML = `<section class="herbarium-view sheet-anim">
      <div class="paper-panel herb-header">
        <div>
          <span class="stamp-tag mono">ACERVO BOTÂNICO · CATÁLOGO DE ESPÉCIMES</span>
          <h2>Herbário de Mendel</h2>
          <p class="muted">Catalogue todas as <b>12 combinações fenotípicas</b> possíveis (3 cores × 2 alturas × 2 níveis de brilho).</p>
        </div>
        <div class="herb-progress">
          <div class="hp-nums"><b class="mono">${count}/12</b> variedades (<span class="mono">${pct}%</span>)</div>
          <div class="progress-bar"><i style="width:${pct}%"></i></div>
          <div class="hp-actions">
            <button class="btn btn-small" id="herb-go-gh">Voltar à Estufa</button>
            <button class="btn btn-slate btn-small" id="herb-go-sb">Criar na Bancada Livre</button>
          </div>
        </div>
      </div>
      <div class="herb-grid">${cards}</div>
    </section>`;

    $('#herb-go-gh', el).onclick = () => App.navigate('greenhouse');
    $('#herb-go-sb', el).onclick = () => App.navigate('sandbox');
  }

  return {
    MISSIONS,
    session,
    startMission,
    startSandbox,
    render,
    renderHerbarium,
    onXrayChanged,
    selectPlant,
    doCross,
    plantSeedlings,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Greenhouse;
}
