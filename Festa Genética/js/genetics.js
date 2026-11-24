'use strict';
/**
 * genetics.js — Motor de Genética Mendeliana e Forense
 *  1) Genética Botânica (Estufa de Mendel): 3 genes independentes + Meiose + Herbário (12 espécimes).
 *  2) Genética Forense (Dossiê 46): 5 mecanismos de herança (Dominância Completa, Dominância Incompleta,
 *     Codominância/Alelos Múltiplos ABO + Rh, Herança Ligada ao X, Interação Gênica em 2 pares e Epistasia Recessiva)
 *     + Rascunho de Punnett manual + Auditor matemático de casos.
 */
const Genetics = (() => {
  // =========================================================================
  // 1. MOTOR BOTÂNICO (ESTUFA DE MENDEL)
  // =========================================================================
  const GENES = [
    { key: 'R', dom: 'R', rec: 'r', trait: 'color', name: 'Cor da Flor', mode: 'Dominância incompleta' },
    { key: 'A', dom: 'A', rec: 'a', trait: 'height', name: 'Altura do Caule', mode: 'Dominância completa' },
    { key: 'B', dom: 'B', rec: 'b', trait: 'glow', name: 'Luminescência', mode: 'Dominância completa' },
  ];

  const LABELS = {
    color: { vermelha: 'Vermelha', rosa: 'Rosa', branca: 'Branca' },
    height: { alta: 'Alta', ana: 'Anã' },
    glow: { normal: 'Sem brilho', bio: 'Bioluminescente' },
  };

  const GENE_TRAIT_LABEL = {
    R: { RR: 'Vermelha', Rr: 'Rosa', rr: 'Branca' },
    A: { AA: 'Alta', Aa: 'Alta', aa: 'Anã' },
    B: { BB: 'Sem brilho', Bb: 'Sem brilho', bb: 'Bioluminescente' },
  };

  const HERBARIUM_CATALOG = [
    { color: 'vermelha', height: 'alta', glow: 'normal', latin: 'Flora rubra altissima', rarity: 'Comum', desc: 'Variedade clássica de pétalas rubras e porte elevado.' },
    { color: 'branca', height: 'alta', glow: 'normal', latin: 'Flora alba altissima', rarity: 'Comum', desc: 'Pétalas marfim puras (rr), linhagem-base de cruzamento.' },
    { color: 'rosa', height: 'alta', glow: 'normal', latin: 'Flora rosea intermedia', rarity: 'Comum', desc: 'Expressão intermediária da dominância incompleta (Rr).' },
    { color: 'vermelha', height: 'ana', glow: 'normal', latin: 'Flora rubra nana', rarity: 'Incomum', desc: 'Manifesta o par recessivo de caule anão (aa) sob pétalas rubras.' },
    { color: 'branca', height: 'ana', glow: 'normal', latin: 'Flora alba nana', rarity: 'Incomum', desc: 'Dupla homozigose recessiva para pigmentação (rr) e porte (aa).' },
    { color: 'rosa', height: 'ana', glow: 'normal', latin: 'Flora rosea pumila', rarity: 'Incomum', desc: 'Híbrida de pequeno porte: heterozigota na cor (Rr) e anã (aa).' },
    { color: 'vermelha', height: 'alta', glow: 'bio', latin: 'Flora rubra lucens', rarity: 'Raro', desc: 'Pétalas rubras com fulgor característico do par recessivo bb.' },
    { color: 'branca', height: 'alta', glow: 'bio', latin: 'Flora alba noctiluca', rarity: 'Raro', desc: 'Espécime de pétalas alvas com bioluminescência ativa (rr A_ bb).' },
    { color: 'rosa', height: 'alta', glow: 'bio', latin: 'Flora rosea aurora', rarity: 'Raro', desc: 'Combinação de dominância incompleta (Rr) e bioluminescência (bb).' },
    { color: 'vermelha', height: 'ana', glow: 'bio', latin: 'Flora rubra ignis-nana', rarity: 'Lendário', desc: 'Duplo recessivo (aa bb) sobre cor homozigota RR.' },
    { color: 'branca', height: 'ana', glow: 'bio', latin: 'Flora alba stellula', rarity: 'Lendário', desc: 'Triplo homozigoto recessivo (rr aa bb) usado em cruzamento-teste.' },
    { color: 'rosa', height: 'ana', glow: 'bio', latin: 'Flora mendeliana mirabilis', rarity: 'Lendário', desc: 'Espécime singular: flor rosa (Rr), porte anão (aa) e bioluminescente (bb).' },
  ].map((item, idx) => ({
    ...item,
    id: idx + 1,
    key: `${item.color}|${item.height}|${item.glow}`,
    exemplar: {
      R: { vermelha: 'RR', rosa: 'Rr', branca: 'rr' }[item.color],
      A: item.height === 'ana' ? 'aa' : 'AA',
      B: item.glow === 'bio' ? 'bb' : 'BB',
    },
  }));

  function normPair(gene, a, b) {
    const d = (a === gene.dom ? 1 : 0) + (b === gene.dom ? 1 : 0);
    return gene.dom.repeat(d) + gene.rec.repeat(2 - d);
  }

  function parse(str) {
    const s = str.replace(/\s+/g, '');
    const g = {};
    GENES.forEach((gene, i) => { g[gene.key] = normPair(gene, s[i * 2], s[i * 2 + 1]); });
    return g;
  }

  function toString(g, sep = ' ') {
    return GENES.map(x => g[x.key]).join(sep);
  }

  const domCount = pair => [...pair].filter(c => c === c.toUpperCase()).length;

  function phenotype(g) {
    const r = domCount(g.R);
    return {
      color: r === 2 ? 'vermelha' : r === 1 ? 'rosa' : 'branca',
      height: domCount(g.A) > 0 ? 'alta' : 'ana',
      glow: domCount(g.B) > 0 ? 'normal' : 'bio',
    };
  }

  const phenoKey = p => `${p.color}|${p.height}|${p.glow}`;

  function phenoLabel(p, sep = ' · ') {
    return [LABELS.color[p.color], LABELS.height[p.height], LABELS.glow[p.glow]].join(sep);
  }

  function catalogEntry(pheno) {
    const k = typeof pheno === 'string' ? pheno : phenoKey(pheno);
    return HERBARIUM_CATALOG.find(e => e.key === k) || null;
  }

  function gametes(g) {
    let list = [{ alleles: {}, p: 1 }];
    GENES.forEach(gene => {
      const pair = g[gene.key];
      const opts = {};
      [pair[0], pair[1]].forEach(a => { opts[a] = (opts[a] || 0) + 0.5; });
      const next = [];
      list.forEach(gm => {
        Object.entries(opts).forEach(([al, p]) => {
          next.push({ alleles: { ...gm.alleles, [gene.key]: al }, p: gm.p * p });
        });
      });
      list = next;
    });
    list.forEach(gm => { gm.str = GENES.map(x => gm.alleles[x.key]).join(''); });
    return list;
  }

  function meiosisSummary(g) {
    const gms = gametes(g);
    const hetCount = GENES.filter(gene => g[gene.key][0] !== g[gene.key][1]).length;
    return { gametes: gms, hetCount };
  }

  function fuse(ga, gb) {
    const g = {};
    GENES.forEach(gene => { g[gene.key] = normPair(gene, ga.alleles[gene.key], gb.alleles[gene.key]); });
    return g;
  }

  function punnett(g1, g2) {
    const rows = gametes(g1);
    const cols = gametes(g2);
    const cells = rows.map((r, ri) => cols.map((c, ci) => {
      const genotype = fuse(r, c);
      return { ri, ci, gameteA: r.str, gameteB: c.str, genotype, p: r.p * c.p, pheno: phenotype(genotype) };
    }));
    return { rows, cols, cells };
  }

  function geneSquare(g1, g2, key) {
    const gene = GENES.find(x => x.key === key);
    const rows = [g1[key][0], g1[key][1]];
    const cols = [g2[key][0], g2[key][1]];
    const cells = rows.map(a => cols.map(b => ({ pair: normPair(gene, a, b), p: 0.25 })));
    const dist = {};
    cells.flat().forEach(c => { dist[c.pair] = (dist[c.pair] || 0) + c.p; });
    return { gene, rows, cols, cells, dist };
  }

  function distribution(g1, g2) {
    const sq = punnett(g1, g2);
    const genos = new Map();
    const phenos = new Map();
    sq.cells.flat().forEach(c => {
      const gk = toString(c.genotype, '');
      const ge = genos.get(gk) || { genotype: c.genotype, p: 0 };
      ge.p += c.p; genos.set(gk, ge);
      const pk = phenoKey(c.pheno);
      const pe = phenos.get(pk) || { pheno: c.pheno, p: 0 };
      pe.p += c.p; phenos.set(pk, pe);
    });
    const sort = m => [...m.values()].sort((a, b) => b.p - a.p);
    return { genotypes: sort(genos), phenotypes: sort(phenos) };
  }

  function rand() {
    if (typeof window !== 'undefined' && window.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296;
    }
    return Math.random();
  }

  function sampleChild(g1, g2) {
    const g = {};
    GENES.forEach(gene => {
      const a = g1[gene.key][rand() < 0.5 ? 0 : 1];
      const b = g2[gene.key][rand() < 0.5 ? 0 : 1];
      g[gene.key] = normPair(gene, a, b);
    });
    return g;
  }

  function matches(pheno, target) {
    return ['color', 'height', 'glow'].every(k => !target[k] || target[k] === pheno[k]);
  }

  function exemplar(target) {
    return {
      R: { vermelha: 'RR', rosa: 'Rr', branca: 'rr' }[target.color] || 'Rr',
      A: target.height === 'ana' ? 'aa' : 'AA',
      B: target.glow === 'bio' ? 'bb' : 'BB',
    };
  }

  // =========================================================================
  // 1B. MOTOR BOTÂNICO MULTI-ESPÉCIES (FLORICULTURA — 18 ESPÉCIES / 216 VARIEDADES)
  // =========================================================================
  const CATEGORIES = [
    { id: 'todas', label: 'Todas as Espécies', accent: '#D8B16A' },
    { id: 'flores', label: 'Flores', accent: '#D96B58' },
    { id: 'arvores', label: 'Árvores & Frutíferas', accent: '#2FA37C' },
    { id: 'cactos', label: 'Cactos & Exóticas', accent: '#C6923A' },
    { id: 'alimenticias', label: 'Alimentícias & Horta', accent: '#5A8FA8' },
  ];

  const SPECIES_DEFS = [
    {
      id: 'flor_mendel',
      name: 'Flor-de-Mendel',
      latin: 'Mirabilis lucens',
      category: 'flores',
      categoryLabel: 'Flor Ornamental',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 95,
      tagline: 'Pétalas com dominância incompleta, porte regulável e bioluminescência recessiva.',
      starterStock: ['RR Aa bb', 'rr aa Bb'],
      genes: [
        {
          key: 'R', dom: 'R', rec: 'r', trait: 'color', name: 'Cor da Flor', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'vermelha', label: 'Vermelha', dot: '#E11D48' },
            het: { code: 'rosa', label: 'Rosa', dot: '#F472B6' },
            rec: { code: 'branca', label: 'Branca', dot: '#F8FAFC' },
          },
        },
        {
          key: 'A', dom: 'A', rec: 'a', trait: 'height', name: 'Altura do Caule', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'alta', label: 'Alta' },
            rec: { code: 'ana', label: 'Anã' },
          },
        },
        {
          key: 'B', dom: 'B', rec: 'b', trait: 'glow', name: 'Luminescência', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'normal', label: 'Comum' },
            rec: { code: 'bio', label: 'Bioluminescente', highlight: true },
          },
        },
      ],
    },
    {
      id: 'orquidea',
      name: 'Orquídea-Prisma',
      latin: 'Orchis prismatica',
      category: 'flores',
      categoryLabel: 'Flor Exótica',
      unlockedByDefault: false,
      unlockCost: 120,
      baseValue: 135,
      tagline: 'Pétalas em degradê violeta, lavanda e branca-pérola, máculas pintalgadas e néctar luminescente.',
      starterStock: ['VV Pp nn', 'vv pp Nn'],
      genes: [
        {
          key: 'V', dom: 'V', rec: 'v', trait: 'color', name: 'Cor da Pétala', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'violeta', label: 'Violeta', dot: '#9333EA' },
            het: { code: 'lavanda', label: 'Lavanda', dot: '#C084FC' },
            rec: { code: 'perola', label: 'Branca-Pérola', dot: '#F8FAFC' },
          },
        },
        {
          key: 'P', dom: 'P', rec: 'p', trait: 'pattern', name: 'Padrão', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'pintalgada', label: 'Pintalgada' },
            rec: { code: 'lisa', label: 'Lisa' },
          },
        },
        {
          key: 'N', dom: 'N', rec: 'n', trait: 'glow', name: 'Néctar', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'normal', label: 'Comum' },
            rec: { code: 'bio', label: 'Luminescente', highlight: true },
          },
        },
      ],
    },
    {
      id: 'tulipa',
      name: 'Tulipa-Holandesa',
      latin: 'Tulipa gesneriana',
      category: 'flores',
      categoryLabel: 'Flor Ornamental · Bulbo',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 105,
      tagline: 'Cálice em tons de rubro, laranja-chama ou amarelo-ouro, com pétalas rajadas ou lisas e haste longa ou compacta.',
      starterStock: ['CC Rr hh', 'cc rr Hh'],
      genes: [
        {
          key: 'C', dom: 'C', rec: 'c', trait: 'color', name: 'Cor do Cálice', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'rubra', label: 'Rubro', dot: '#C92A2A' },
            het: { code: 'chama', label: 'Laranja-Chama', dot: '#E86F2D' },
            rec: { code: 'amarela', label: 'Amarela', dot: '#E5B82E' },
          },
        },
        {
          key: 'R', dom: 'R', rec: 'r', trait: 'pattern', name: 'Padrão', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'rajada', label: 'Rajada', highlight: true },
            rec: { code: 'lisa', label: 'Lisa' },
          },
        },
        {
          key: 'H', dom: 'H', rec: 'h', trait: 'height', name: 'Tamanho da Haste', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'longa', label: 'Haste Longa' },
            rec: { code: 'compacta', label: 'Compacta' },
          },
        },
      ],
    },
    {
      id: 'cerejeira',
      name: 'Cerejeira Bonsai',
      latin: 'Prunus serrulata',
      category: 'arvores',
      categoryLabel: 'Árvore Ornamental',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 115,
      tagline: 'Árvore de florada carmim, rosada ou neve, em porte alto ou bonsai anão com folhas jade ou ouro.',
      starterStock: ['FF Cc jj', 'ff cc Jj'],
      genes: [
        {
          key: 'F', dom: 'F', rec: 'f', trait: 'color', name: 'Florada', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'carmim', label: 'Carmim', dot: '#BE123C' },
            het: { code: 'rosada', label: 'Rosada', dot: '#FDA4AF' },
            rec: { code: 'neve', label: 'Neve', dot: '#F1F5F9' },
          },
        },
        {
          key: 'C', dom: 'C', rec: 'c', trait: 'height', name: 'Porte da Copa', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'alta', label: 'Copa Alta' },
            rec: { code: 'bonsai', label: 'Bonsai Anão' },
          },
        },
        {
          key: 'J', dom: 'J', rec: 'j', trait: 'foliage', name: 'Folhagem', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'jade', label: 'Folha Jade' },
            rec: { code: 'dourada', label: 'Folha Dourada', highlight: true },
          },
        },
      ],
    },
    {
      id: 'macieira',
      name: 'Macieira Imperial',
      latin: 'Malus domestica',
      category: 'arvores',
      categoryLabel: 'Árvore Frutífera',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 130,
      tagline: 'Frutos rubros, rajados bicolores (codominância) ou maçã verde, com porte de pomar ou vaso e calibre gigante ou mini.',
      starterStock: ['MM Tt dd', 'mm tt Dd'],
      genes: [
        {
          key: 'M', dom: 'M', rec: 'm', trait: 'color', name: 'Cor da Maçã', mode: 'codominant', modeLabel: 'Codominância',
          values: {
            dom: { code: 'rubra', label: 'Maçã Rubra', dot: '#C92A2A' },
            het: { code: 'rajada', label: 'Maçã Rajada', dot: '#D97706' },
            rec: { code: 'verde', label: 'Maçã Verde', dot: '#4D9E3F' },
          },
        },
        {
          key: 'T', dom: 'T', rec: 't', trait: 'height', name: 'Porte da Árvore', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'alta', label: 'Pomar Alto' },
            rec: { code: 'ana', label: 'Anã de Vaso' },
          },
        },
        {
          key: 'D', dom: 'D', rec: 'd', trait: 'fruitSize', name: 'Calibre do Fruto', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'gigante', label: 'Fruto Gigante' },
            rec: { code: 'mini', label: 'Fruto Mini', highlight: true },
          },
        },
      ],
    },
    {
      id: 'laranjeira',
      name: 'Laranjeira-Cítrica',
      latin: 'Citrus sinensis',
      category: 'arvores',
      categoryLabel: 'Árvore Frutífera · Cítrico',
      unlockedByDefault: false,
      unlockCost: 145,
      baseValue: 150,
      tagline: 'Frutos de casca laranja-sangue, âmbar ou ouro-limão, com variação de copa alta/anã e frutificação farta ou compacta.',
      starterStock: ['CC Pp ss', 'cc pp Ss'],
      genes: [
        {
          key: 'C', dom: 'C', rec: 'c', trait: 'color', name: 'Cor do Cítrico', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'sangue', label: 'Laranja-Sangue', dot: '#C23828' },
            het: { code: 'ambar', label: 'Laranja Âmbar', dot: '#E07A22' },
            rec: { code: 'ouro', label: 'Cítrico Ouro', dot: '#E6C235' },
          },
        },
        {
          key: 'P', dom: 'P', rec: 'p', trait: 'height', name: 'Porte', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'alta', label: 'Copa Alta' },
            rec: { code: 'ana', label: 'Anã de Vaso' },
          },
        },
        {
          key: 'S', dom: 'S', rec: 's', trait: 'seeds', name: 'Sementes', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'com_semente', label: 'Com Sementes' },
            rec: { code: 'sem_semente', label: 'Sem Sementes', highlight: true },
          },
        },
      ],
    },
    {
      id: 'cacto',
      name: 'Cacto-Estrela',
      latin: 'Echinopsis stellata',
      category: 'cactos',
      categoryLabel: 'Cacto Ornamental',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 110,
      tagline: 'Suculenta desértica com floração vibrante no topo, controle genético de espinhos e corpo colunar ou globoso.',
      starterStock: ['KK Ee gg', 'kk ee Gg'],
      genes: [
        {
          key: 'K', dom: 'K', rec: 'k', trait: 'color', name: 'Flor no Topo', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'magenta', label: 'Magenta', dot: '#EC4899' },
            het: { code: 'coral', label: 'Coral', dot: '#FB7185' },
            rec: { code: 'amarela', label: 'Amarela', dot: '#FACC15' },
          },
        },
        {
          key: 'E', dom: 'E', rec: 'e', trait: 'spines', name: 'Espinhos', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'espinhoso', label: 'Com Espinhos' },
            rec: { code: 'liso', label: 'Sem Espinhos', highlight: true },
          },
        },
        {
          key: 'G', dom: 'G', rec: 'g', trait: 'shape', name: 'Estrutura', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'colunar', label: 'Colunar' },
            rec: { code: 'globoso', label: 'Globoso' },
          },
        },
      ],
    },
    {
      id: 'pitaia',
      name: 'Pitaia-do-Deserto',
      latin: 'Hylocereus undatus',
      category: 'cactos',
      categoryLabel: 'Cacto Frutífero',
      unlockedByDefault: false,
      unlockCost: 135,
      baseValue: 145,
      tagline: 'Cacto produtor de pitaias em casca rubra, laranja-coral ou amarela-dourada, com variação de espinhos e porte.',
      starterStock: ['FF Ee pp', 'ff ee Pp'],
      genes: [
        {
          key: 'F', dom: 'F', rec: 'f', trait: 'color', name: 'Cor da Pitaia', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'rubra', label: 'Pitaia Rubra', dot: '#C92A54' },
            het: { code: 'coral', label: 'Pitaia Laranja-Coral', dot: '#F97316' },
            rec: { code: 'amarela', label: 'Pitaia Amarela', dot: '#E5B82E' },
          },
        },
        {
          key: 'E', dom: 'E', rec: 'e', trait: 'spines', name: 'Espinhos', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'espinhoso', label: 'Com Espinhos' },
            rec: { code: 'liso', label: 'Sem Espinhos', highlight: true },
          },
        },
        {
          key: 'P', dom: 'P', rec: 'p', trait: 'height', name: 'Porte', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'alto', label: 'Trepador Alto' },
            rec: { code: 'compacto', label: 'Compacto' },
          },
        },
      ],
    },
    {
      id: 'milho',
      name: 'Milho-do-Campo',
      latin: 'Zea mays',
      category: 'alimenticias',
      categoryLabel: 'Alimentícia · Cereal',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 125,
      tagline: 'Clássico da genética vegetal: grãos roxos, mesclados (codominância) ou amarelos, alelo doce enrugado e porte anão.',
      starterStock: ['CC Ss hh', 'cc ss Hh'],
      genes: [
        {
          key: 'C', dom: 'C', rec: 'c', trait: 'color', name: 'Cor dos Grãos', mode: 'codominant', modeLabel: 'Codominância',
          values: {
            dom: { code: 'roxo', label: 'Roxo', dot: '#7E22CE' },
            het: { code: 'mesclado', label: 'Mesclado', dot: '#C084FC' },
            rec: { code: 'amarelo', label: 'Amarelo', dot: '#EAB308' },
          },
        },
        {
          key: 'S', dom: 'S', rec: 's', trait: 'starch', name: 'Textura do Grão', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'liso', label: 'Grão Liso' },
            rec: { code: 'doce', label: 'Doce Enrugado', highlight: true },
          },
        },
        {
          key: 'H', dom: 'H', rec: 'h', trait: 'height', name: 'Porte da Haste', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'alto', label: 'Porte Alto' },
            rec: { code: 'anao', label: 'Porte Anão' },
          },
        },
      ],
    },
    {
      id: 'soja',
      name: 'Soja-de-Cultivo',
      latin: 'Glycine max',
      category: 'alimenticias',
      categoryLabel: 'Alimentícia · Oleaginosa',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 120,
      tagline: 'Variedades agronômicas com flor roxa/lilás/branca, grão amarelo ou verde e vagem pubescente ou lisa.',
      starterStock: ['HH Yy pp', 'hh yy Pp'],
      genes: [
        {
          key: 'H', dom: 'H', rec: 'h', trait: 'color', name: 'Flor / Hilo', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'roxa', label: 'Flor Roxa', dot: '#7C3AED' },
            het: { code: 'lilas', label: 'Flor Lilás', dot: '#C4B5FD' },
            rec: { code: 'branca', label: 'Flor Branca', dot: '#F8FAFC' },
          },
        },
        {
          key: 'Y', dom: 'Y', rec: 'y', trait: 'seedColor', name: 'Cor do Grão', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'amarela', label: 'Grão Amarelo' },
            rec: { code: 'verde', label: 'Grão Verde', highlight: true },
          },
        },
        {
          key: 'P', dom: 'P', rec: 'p', trait: 'pod', name: 'Vagem', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'peluda', label: 'Vagem Peluda' },
            rec: { code: 'lisa', label: 'Vagem Lisa' },
          },
        },
      ],
    },
    {
      id: 'ervilha',
      name: 'Ervilha-de-Mendel',
      latin: 'Pisum sativum',
      category: 'alimenticias',
      categoryLabel: 'Alimentícia · Leguminosa',
      unlockedByDefault: false,
      unlockCost: 140,
      baseValue: 140,
      tagline: 'A leguminosa histórica de Mendel: flores púrpura/lilás/branca e sementes amarelas ou verdes, lisas ou rugosas.',
      starterStock: ['FF Vv rr', 'ff vv Rr'],
      genes: [
        {
          key: 'F', dom: 'F', rec: 'f', trait: 'color', name: 'Cor da Flor', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'purpura', label: 'Púrpura', dot: '#9333EA' },
            het: { code: 'lilas', label: 'Lilás', dot: '#D8B4FE' },
            rec: { code: 'branca', label: 'Branca', dot: '#F8FAFC' },
          },
        },
        {
          key: 'V', dom: 'V', rec: 'v', trait: 'seedColor', name: 'Cor da Semente', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'amarela', label: 'Semente Amarela' },
            rec: { code: 'verde', label: 'Semente Verde', highlight: true },
          },
        },
        {
          key: 'R', dom: 'R', rec: 'r', trait: 'texture', name: 'Textura', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'lisa', label: 'Semente Lisa' },
            rec: { code: 'rugosa', label: 'Semente Rugosa', highlight: true },
          },
        },
      ],
    },
    {
      id: 'tomate',
      name: 'Tomateiro-Cereja',
      latin: 'Solanum lycopersicum',
      category: 'alimenticias',
      categoryLabel: 'Alimentícia · Fruto',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 120,
      tagline: 'Frutos em vermelho, laranja ou amarelo-ouro, alternando calibre grande ou cacho cereja e porte alto ou anão.',
      starterStock: ['RR Gg hh', 'rr gg Hh'],
      genes: [
        {
          key: 'R', dom: 'R', rec: 'r', trait: 'color', name: 'Cor do Tomate', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'vermelho', label: 'Vermelho', dot: '#D1342F' },
            het: { code: 'laranja', label: 'Laranja', dot: '#E57A25' },
            rec: { code: 'amarelo', label: 'Amarelo', dot: '#E8C434' },
          },
        },
        {
          key: 'G', dom: 'G', rec: 'g', trait: 'fruitSize', name: 'Tamanho do Fruto', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'grande', label: 'Tomate Grande' },
            rec: { code: 'cereja', label: 'Cacho Cereja', highlight: true },
          },
        },
        {
          key: 'H', dom: 'H', rec: 'h', trait: 'height', name: 'Porte da Planta', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'alto', label: 'Estaca Alta' },
            rec: { code: 'anao', label: 'Anão de Vaso' },
          },
        },
      ],
    },
    {
      id: 'girassol',
      name: 'Girassol-Real',
      latin: 'Helianthus regalis',
      category: 'flores',
      categoryLabel: 'Flor Solar',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 105,
      tagline: 'Coroa radiante em âmbar-fogo, ouro-sol ou creme, com miolo escuro ou esmeralda e porte gigante ou anão.',
      starterStock: ['GG Mm tt', 'gg mm Tt'],
      genes: [
        {
          key: 'G', dom: 'G', rec: 'g', trait: 'color', name: 'Cor das Pétalas', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'ambar', label: 'Âmbar-Fogo', dot: '#EA580C' },
            het: { code: 'ouro', label: 'Ouro-Sol', dot: '#FACC15' },
            rec: { code: 'creme', label: 'Creme', dot: '#FEF3C7' },
          },
        },
        {
          key: 'M', dom: 'M', rec: 'm', trait: 'center', name: 'Disco Central', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'escuro', label: 'Miolo Escuro' },
            rec: { code: 'esmeralda', label: 'Miolo Esmeralda', highlight: true },
          },
        },
        {
          key: 'T', dom: 'T', rec: 't', trait: 'height', name: 'Porte do Caule', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'gigante', label: 'Gigante' },
            rec: { code: 'anao', label: 'Anão de Vaso' },
          },
        },
      ],
    },
    {
      id: 'rosa',
      name: 'Rosa-do-Jardim',
      latin: 'Rosa nobilis',
      category: 'flores',
      categoryLabel: 'Flor Clássica',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 115,
      tagline: 'Botões em escarlate, salmão ou marfim, alternando caule com ou sem espinhos e flor dobrada ou simples.',
      starterStock: ['RR Ee dd', 'rr ee Dd'],
      genes: [
        {
          key: 'R', dom: 'R', rec: 'r', trait: 'color', name: 'Cor da Rosa', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'escarlate', label: 'Escarlate', dot: '#DC2626' },
            het: { code: 'salmao', label: 'Salmão', dot: '#FB7185' },
            rec: { code: 'marfim', label: 'Marfim', dot: '#FFF7ED' },
          },
        },
        {
          key: 'E', dom: 'E', rec: 'e', trait: 'thorns', name: 'Espinhos', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'espinhos', label: 'Com Espinhos' },
            rec: { code: 'liso', label: 'Sem Espinhos', highlight: true },
          },
        },
        {
          key: 'D', dom: 'D', rec: 'd', trait: 'petals', name: 'Camadas', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'dobrada', label: 'Dobrada' },
            rec: { code: 'simples', label: 'Simples' },
          },
        },
      ],
    },
    {
      id: 'morango',
      name: 'Morangueiro-Doce',
      latin: 'Fragaria dulcis',
      category: 'alimenticias',
      categoryLabel: 'Frutífera · Horta',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 120,
      tagline: 'Morangos em rubro, rosado ou branco-abacaxi, com calibre graúdo ou silvestre e folhagem verde ou variegada.',
      starterStock: ['MM Gg ff', 'mm gg Ff'],
      genes: [
        {
          key: 'M', dom: 'M', rec: 'm', trait: 'color', name: 'Cor do Morango', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'rubro', label: 'Rubro', dot: '#E11D48' },
            het: { code: 'rosado', label: 'Rosado', dot: '#FDA4AF' },
            rec: { code: 'branco', label: 'Branco-Abacaxi', dot: '#FEF9C3' },
          },
        },
        {
          key: 'G', dom: 'G', rec: 'g', trait: 'fruitSize', name: 'Tamanho do Fruto', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'graudo', label: 'Graúdo' },
            rec: { code: 'silvestre', label: 'Silvestre' },
          },
        },
        {
          key: 'F', dom: 'F', rec: 'f', trait: 'foliage', name: 'Folhagem', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'verde', label: 'Folha Verde' },
            rec: { code: 'variegada', label: 'Variegada', highlight: true },
          },
        },
      ],
    },
    {
      id: 'dioneia',
      name: 'Dioneia-Carnívora',
      latin: 'Dionaea muscipula',
      category: 'cactos',
      categoryLabel: 'Planta Carnívora',
      unlockedByDefault: true,
      unlockCost: 0,
      baseValue: 135,
      tagline: 'Armadilhas com interior rubi-sangue, coral-rosado ou marfim, dentes longos ou borda lisa e néctar luminescente.',
      starterStock: ['BB Dd nn', 'bb dd Nn'],
      genes: [
        {
          key: 'B', dom: 'B', rec: 'b', trait: 'color', name: 'Interior da Boca', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'rubi', label: 'Rubi-Sangue', dot: '#BE123C' },
            het: { code: 'coral', label: 'Coral-Rosado', dot: '#FB7185' },
            rec: { code: 'marfim', label: 'Marfim-Claro', dot: '#FEF3C7' },
          },
        },
        {
          key: 'D', dom: 'D', rec: 'd', trait: 'teeth', name: 'Dentes da Borda', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'longos', label: 'Dentes Longos' },
            rec: { code: 'lisa', label: 'Borda Lisa' },
          },
        },
        {
          key: 'N', dom: 'N', rec: 'n', trait: 'glow', name: 'Néctar', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'comum', label: 'Comum' },
            rec: { code: 'luminescente', label: 'Luminescente', highlight: true },
          },
        },
      ],
    },
    {
      id: 'suculenta',
      name: 'Suculenta-Lótus',
      latin: 'Echeveria crystalis',
      category: 'cactos',
      categoryLabel: 'Suculenta Ornamental',
      unlockedByDefault: false,
      unlockCost: 155,
      baseValue: 130,
      tagline: 'Roseta geométrica em ametista, azul-safira ou jade-turquesa, formato aberto ou fechado e orvalho cristalino.',
      starterStock: ['PP Ff bb', 'pp ff Bb'],
      genes: [
        {
          key: 'P', dom: 'P', rec: 'p', trait: 'color', name: 'Tom das Folhas', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'ametista', label: 'Ametista', dot: '#9333EA' },
            het: { code: 'safira', label: 'Azul-Safira', dot: '#3B82F6' },
            rec: { code: 'jade', label: 'Jade-Turquesa', dot: '#14B8A6' },
          },
        },
        {
          key: 'F', dom: 'F', rec: 'f', trait: 'rosette', name: 'Formato', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'aberta', label: 'Roseta Aberta' },
            rec: { code: 'fechada', label: 'Roseta Fechada' },
          },
        },
        {
          key: 'B', dom: 'B', rec: 'b', trait: 'dew', name: 'Orvalho', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'fosca', label: 'Fosca' },
            rec: { code: 'cristal', label: 'Cristalino', highlight: true },
          },
        },
      ],
    },
    {
      id: 'pimenta',
      name: 'Pimenteira-Ornamental',
      latin: 'Capsicum gemma',
      category: 'alimenticias',
      categoryLabel: 'Alimentícia · Tempero',
      unlockedByDefault: false,
      unlockCost: 175,
      baseValue: 140,
      tagline: 'Pimentas vibrantes em vermelho-fogo, laranja-solar ou amarelo-ouro, formato alongado ou biquinho e folha variegada.',
      starterStock: ['PP Ff vv', 'pp ff Vv'],
      genes: [
        {
          key: 'P', dom: 'P', rec: 'p', trait: 'color', name: 'Cor da Pimenta', mode: 'incomplete', modeLabel: 'Dominância incompleta',
          values: {
            dom: { code: 'vermelha', label: 'Vermelha-Fogo', dot: '#DC2626' },
            het: { code: 'laranja', label: 'Laranja-Solar', dot: '#F97316' },
            rec: { code: 'amarela', label: 'Amarela-Ouro', dot: '#FACC15' },
          },
        },
        {
          key: 'F', dom: 'F', rec: 'f', trait: 'shape', name: 'Formato', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'alongada', label: 'Alongada' },
            rec: { code: 'biquinho', label: 'Biquinho' },
          },
        },
        {
          key: 'V', dom: 'V', rec: 'v', trait: 'foliage', name: 'Folhagem', mode: 'complete', modeLabel: 'Dominância completa',
          values: {
            dom: { code: 'verde', label: 'Folha Verde' },
            rec: { code: 'variegada', label: 'Variegada', highlight: true },
          },
        },
      ],
    },
  ];

  const SPECIES_MAP = Object.fromEntries(SPECIES_DEFS.map(sp => [sp.id, sp]));
  const getSpecies = id => SPECIES_MAP[id] || SPECIES_MAP.flor_mendel;

  function parseFor(speciesId, str) {
    const sp = getSpecies(speciesId);
    const s = str.replace(/\s+/g, '');
    const g = {};
    sp.genes.forEach((gene, i) => { g[gene.key] = normPair(gene, s[i * 2], s[i * 2 + 1]); });
    return g;
  }

  function toStringFor(speciesId, g, sep = ' ') {
    const sp = getSpecies(speciesId);
    return sp.genes.map(x => g[x.key]).join(sep);
  }

  function phenotypeFor(speciesId, g) {
    const sp = getSpecies(speciesId);
    const ph = {};
    sp.genes.forEach(gene => {
      const d = domCount(g[gene.key]);
      if (gene.mode === 'incomplete' || gene.mode === 'codominant') {
        ph[gene.trait] = d === 2 ? gene.values.dom.code : d === 1 ? gene.values.het.code : gene.values.rec.code;
      } else {
        ph[gene.trait] = d > 0 ? gene.values.dom.code : gene.values.rec.code;
      }
    });
    return ph;
  }

  function phenoKeyFor(speciesId, ph) {
    const sp = getSpecies(speciesId);
    return `${sp.id}::${sp.genes.map(g => ph[g.trait]).join('|')}`;
  }

  function traitInfoFor(speciesId, traitName, code) {
    const sp = getSpecies(speciesId);
    const gene = sp.genes.find(g => g.trait === traitName);
    if (!gene) return { code, label: code };
    return Object.values(gene.values).find(v => v.code === code) || { code, label: code };
  }

  function phenoLabelFor(speciesId, ph, sep = ' · ') {
    const sp = getSpecies(speciesId);
    return sp.genes.map(g => traitInfoFor(speciesId, g.trait, ph[g.trait]).label).join(sep);
  }

  function gametesFor(speciesId, g) {
    const sp = getSpecies(speciesId);
    let list = [{ alleles: {}, p: 1 }];
    sp.genes.forEach(gene => {
      const pair = g[gene.key];
      const opts = {};
      [pair[0], pair[1]].forEach(a => { opts[a] = (opts[a] || 0) + 0.5; });
      const next = [];
      list.forEach(gm => {
        Object.entries(opts).forEach(([al, p]) => {
          next.push({ alleles: { ...gm.alleles, [gene.key]: al }, p: gm.p * p });
        });
      });
      list = next;
    });
    list.forEach(gm => { gm.str = sp.genes.map(x => gm.alleles[x.key]).join(''); });
    return list;
  }

  function meiosisSummaryFor(speciesId, g) {
    const sp = getSpecies(speciesId);
    const gms = gametesFor(speciesId, g);
    const hetCount = sp.genes.filter(gene => g[gene.key][0] !== g[gene.key][1]).length;
    return { gametes: gms, hetCount };
  }

  function fuseFor(speciesId, ga, gb) {
    const sp = getSpecies(speciesId);
    const g = {};
    sp.genes.forEach(gene => { g[gene.key] = normPair(gene, ga.alleles[gene.key], gb.alleles[gene.key]); });
    return g;
  }

  function punnettFor(speciesId, g1, g2) {
    const rows = gametesFor(speciesId, g1);
    const cols = gametesFor(speciesId, g2);
    const cells = rows.map((r, ri) => cols.map((c, ci) => {
      const genotype = fuseFor(speciesId, r, c);
      return { ri, ci, gameteA: r.str, gameteB: c.str, genotype, p: r.p * c.p, pheno: phenotypeFor(speciesId, genotype) };
    }));
    return { rows, cols, cells };
  }

  function geneSquareFor(speciesId, g1, g2, key) {
    const sp = getSpecies(speciesId);
    const gene = sp.genes.find(x => x.key === key);
    const rows = [g1[key][0], g1[key][1]];
    const cols = [g2[key][0], g2[key][1]];
    const cells = rows.map(a => cols.map(b => ({ pair: normPair(gene, a, b), p: 0.25 })));
    const dist = {};
    cells.flat().forEach(c => { dist[c.pair] = (dist[c.pair] || 0) + c.p; });
    return { gene, rows, cols, cells, dist };
  }

  function distributionFor(speciesId, g1, g2) {
    const sq = punnettFor(speciesId, g1, g2);
    const genos = new Map();
    const phenos = new Map();
    sq.cells.flat().forEach(c => {
      const gk = toStringFor(speciesId, c.genotype, '');
      const ge = genos.get(gk) || { genotype: c.genotype, p: 0 };
      ge.p += c.p; genos.set(gk, ge);
      const pk = phenoKeyFor(speciesId, c.pheno);
      const pe = phenos.get(pk) || { pheno: c.pheno, key: pk, p: 0 };
      pe.p += c.p; phenos.set(pk, pe);
    });
    const sort = m => [...m.values()].sort((a, b) => b.p - a.p);
    return { genotypes: sort(genos), phenotypes: sort(phenos) };
  }

  function sampleChildFor(speciesId, g1, g2) {
    const sp = getSpecies(speciesId);
    const g = {};
    sp.genes.forEach(gene => {
      const a = g1[gene.key][rand() < 0.5 ? 0 : 1];
      const b = g2[gene.key][rand() < 0.5 ? 0 : 1];
      g[gene.key] = normPair(gene, a, b);
    });
    return g;
  }

  function matchesFor(speciesId, pheno, target) {
    const sp = getSpecies(speciesId);
    return sp.genes.every(g => !target[g.trait] || target[g.trait] === pheno[g.trait]);
  }

  function exemplarFor(speciesId, target) {
    const sp = getSpecies(speciesId);
    const out = {};
    sp.genes.forEach(gene => {
      const want = target[gene.trait];
      if (gene.mode === 'incomplete' || gene.mode === 'codominant') {
        if (want === gene.values.dom.code) out[gene.key] = gene.dom + gene.dom;
        else if (want === gene.values.het.code) out[gene.key] = gene.dom + gene.rec;
        else out[gene.key] = gene.rec + gene.rec;
      } else {
        out[gene.key] = want === gene.values.rec.code ? (gene.rec + gene.rec) : (gene.dom + gene.dom);
      }
    });
    return out;
  }

  function buildSpeciesCatalog(sp) {
    const [g1, g2, g3] = sp.genes;
    const g1Opts = [
      { code: g1.values.dom.code, pair: g1.dom + g1.dom, score: 0 },
      { code: g1.values.het.code, pair: g1.dom + g1.rec, score: 1 },
      { code: g1.values.rec.code, pair: g1.rec + g1.rec, score: 0 },
    ];
    const g2Opts = [
      { code: g2.values.dom.code, pair: g2.dom + g2.dom, score: 0 },
      { code: g2.values.rec.code, pair: g2.rec + g2.rec, score: 1 },
    ];
    const g3Opts = [
      { code: g3.values.dom.code, pair: g3.dom + g3.dom, score: 0 },
      { code: g3.values.rec.code, pair: g3.rec + g3.rec, score: 2 },
    ];
    const entries = [];
    let idx = 1;
    g3Opts.forEach(o3 => {
      g2Opts.forEach(o2 => {
        g1Opts.forEach(o1 => {
          const pheno = { [g1.trait]: o1.code, [g2.trait]: o2.code, [g3.trait]: o3.code };
          const score = o1.score + o2.score + o3.score;
          const rarity = score >= 3 ? 'Lendário' : score === 2 ? 'Raro' : score === 1 ? 'Incomum' : 'Comum';
          const exemplarGeno = { [g1.key]: o1.pair, [g2.key]: o2.pair, [g3.key]: o3.pair };
          entries.push({
            id: idx++,
            speciesId: sp.id,
            speciesName: sp.name,
            category: sp.category,
            latin: sp.latin,
            pheno,
            key: phenoKeyFor(sp.id, pheno),
            rarity,
            exemplar: exemplarGeno,
            label: phenoLabelFor(sp.id, pheno),
          });
        });
      });
    });
    return entries;
  }

  const ALL_HERBARIUM = SPECIES_DEFS.flatMap(buildSpeciesCatalog);

  function catalogForSpecies(speciesId) {
    return ALL_HERBARIUM.filter(e => e.speciesId === speciesId);
  }

  function pairLabelFor(speciesId, geneKey, pair) {
    const sp = getSpecies(speciesId);
    const gene = sp.genes.find(g => g.key === geneKey);
    if (!gene) return pair;
    const d = domCount(pair);
    if (gene.mode === 'incomplete' || gene.mode === 'codominant') {
      return d === 2 ? gene.values.dom.label : d === 1 ? gene.values.het.label : gene.values.rec.label;
    }
    return d > 0 ? gene.values.dom.label : gene.values.rec.label;
  }

  // =========================================================================
  // 2. MOTOR FORENSE (DOSSIÊ 46 — 5 MECANISMOS DE HERANÇA)
  // =========================================================================
  const EYE_GENOTYPES = ['EEGG', 'EEGg', 'EEgg', 'EeGG', 'EeGg', 'Eegg', 'eeGG', 'eeGg', 'eegg'];
  const SKIN_GENOTYPES = ['KKNN', 'KKNn', 'KKnn', 'KkNN', 'KkNn', 'Kknn', 'kkNN', 'kkNn', 'kknn'];
  const HAIR_COLOR_GENOTYPES = ['HHUU', 'HHUu', 'HHuu', 'HhUU', 'HhUu', 'Hhuu', 'hhUU', 'hhUu', 'hhuu'];

  const FORENSIC_TRAITS = {
    earlobe: {
      key: 'earlobe', gene: 'F', mechanism: 'Dominância Completa',
      name: 'Lóbulo Auricular', shortName: 'Lóbulo',
      scratchpadMode: 'auto', alleles: ['F', 'f'],
      genotypes: ['FF', 'Ff', 'ff'],
      genotypeChoices: [
        { value: 'FF', label: 'FF (Homozigoto dom.)' },
        { value: 'Ff', label: 'Ff (Heterozigoto)' },
        { value: 'ff', label: 'ff (Homozigoto rec.)' },
        { value: 'indeterminado', label: 'F_ (Indeterminado: FF ou Ff)' },
      ],
      options: [
        { value: 'solto', label: 'Lóbulo solto', alleles: 'FF / Ff' },
        { value: 'preso', label: 'Lóbulo preso', alleles: 'ff' },
      ],
      phenoOf: g => (g.includes('F') ? 'solto' : 'preso'),
    },
    hairline: {
      key: 'hairline', gene: 'P', mechanism: 'Dominância Completa',
      name: 'Linha Frontal do Cabelo', shortName: 'Linha Frontal',
      scratchpadMode: 'auto', alleles: ['P', 'p'],
      genotypes: ['PP', 'Pp', 'pp'],
      genotypeChoices: [
        { value: 'PP', label: 'PP (Homozigoto dom.)' },
        { value: 'Pp', label: 'Pp (Heterozigoto)' },
        { value: 'pp', label: 'pp (Homozigoto rec.)' },
        { value: 'indeterminado', label: 'P_ (Indeterminado: PP ou Pp)' },
      ],
      options: [
        { value: 'pico', label: 'Pico de viúva', alleles: 'PP / Pp' },
        { value: 'reta', label: 'Linha reta', alleles: 'pp' },
      ],
      phenoOf: g => (g.includes('P') ? 'pico' : 'reta'),
    },
    dimples: {
      key: 'dimples', gene: 'C', mechanism: 'Dominância Completa',
      name: 'Covinhas Faciais', shortName: 'Covinhas',
      scratchpadMode: 'auto', alleles: ['C', 'c'],
      genotypes: ['CC', 'Cc', 'cc'],
      genotypeChoices: [
        { value: 'CC', label: 'CC (Homozigoto dom.)' },
        { value: 'Cc', label: 'Cc (Heterozigoto)' },
        { value: 'cc', label: 'cc (Homozigoto rec.)' },
        { value: 'indeterminado', label: 'C_ (Indeterminado: CC ou Cc)' },
      ],
      options: [
        { value: 'presentes', label: 'Presentes', alleles: 'CC / Cc' },
        { value: 'ausentes', label: 'Ausentes', alleles: 'cc' },
      ],
      phenoOf: g => (g.includes('C') ? 'presentes' : 'ausentes'),
    },
    cleftChin: {
      key: 'cleftChin', gene: 'Q', mechanism: 'Dominância Completa',
      name: 'Queixo Fendido', shortName: 'Queixo',
      scratchpadMode: 'auto', alleles: ['Q', 'q'],
      genotypes: ['QQ', 'Qq', 'qq'],
      genotypeChoices: [
        { value: 'QQ', label: 'QQ (Homozigoto dom.)' },
        { value: 'Qq', label: 'Qq (Heterozigoto)' },
        { value: 'qq', label: 'qq (Homozigoto rec.)' },
        { value: 'indeterminado', label: 'Q_ (Indeterminado: QQ ou Qq)' },
      ],
      options: [
        { value: 'presente', label: 'Fenda presente', alleles: 'QQ / Qq' },
        { value: 'ausente', label: 'Queixo liso', alleles: 'qq' },
      ],
      phenoOf: g => (g.includes('Q') ? 'presente' : 'ausente'),
    },
    freckles: {
      key: 'freckles', gene: 'S', mechanism: 'Dominância Completa',
      name: 'Sardas', shortName: 'Sardas',
      scratchpadMode: 'auto', alleles: ['S', 's'],
      genotypes: ['SS', 'Ss', 'ss'],
      genotypeChoices: [
        { value: 'SS', label: 'SS (Homozigoto dom.)' },
        { value: 'Ss', label: 'Ss (Heterozigoto)' },
        { value: 'ss', label: 'ss (Homozigoto rec.)' },
        { value: 'indeterminado', label: 'S_ (Indeterminado: SS ou Ss)' },
      ],
      options: [
        { value: 'presentes', label: 'Presentes', alleles: 'SS / Ss' },
        { value: 'ausentes', label: 'Ausentes na pele', alleles: 'ss (ou mascaradas por aa)' },
      ],
      phenoOf: (g, ctx) => {
        if (ctx && ctx.epistaticMask) return 'ausentes';
        return g.includes('S') ? 'presentes' : 'ausentes';
      },
    },
    hairTexture: {
      key: 'hairTexture', gene: 'T', mechanism: 'Dominância Incompleta',
      name: 'Textura Capilar', shortName: 'Cabelo',
      scratchpadMode: 'auto', alleles: ['T', 't'],
      genotypes: ['TT', 'Tt', 'tt'],
      genotypeChoices: [
        { value: 'TT', label: 'TT (Cacheado)' },
        { value: 'Tt', label: 'Tt (Ondulado)' },
        { value: 'tt', label: 'tt (Liso)' },
      ],
      options: [
        { value: 'cacheado', label: 'Cacheado', alleles: 'TT' },
        { value: 'ondulado', label: 'Ondulado', alleles: 'Tt' },
        { value: 'liso', label: 'Liso', alleles: 'tt' },
      ],
      phenoOf: g => (g === 'TT' ? 'cacheado' : g === 'Tt' ? 'ondulado' : 'liso'),
    },
    lipWidth: {
      key: 'lipWidth', gene: 'M', mechanism: 'Dominância Incompleta',
      name: 'Espessura Labial', shortName: 'Lábios',
      scratchpadMode: 'auto', alleles: ['M', 'm'],
      genotypes: ['MM', 'Mm', 'mm'],
      genotypeChoices: [
        { value: 'MM', label: 'MM (Largos)' },
        { value: 'Mm', label: 'Mm (Médios)' },
        { value: 'mm', label: 'mm (Finos)' },
      ],
      options: [
        { value: 'largos', label: 'Lábios largos', alleles: 'MM' },
        { value: 'medios', label: 'Lábios médios', alleles: 'Mm' },
        { value: 'finos', label: 'Lábios finos', alleles: 'mm' },
      ],
      phenoOf: g => (g === 'MM' ? 'largos' : g === 'Mm' ? 'medios' : 'finos'),
    },
    abo: {
      key: 'abo', gene: 'ABO', mechanism: 'Codominância e Alelos Múltiplos',
      name: 'Sistema Sanguíneo ABO', shortName: 'Tipo ABO',
      scratchpadMode: 'abo', alleles: ['IA', 'IB', 'i'],
      genotypes: ['IAIA', 'IAi', 'IBIB', 'IBi', 'IAIB', 'ii'],
      genotypeChoices: [
        { value: 'IAIA', label: 'IᴬIᴬ' },
        { value: 'IAi', label: 'Iᴬi' },
        { value: 'IBIB', label: 'IᴮIᴮ' },
        { value: 'IBi', label: 'Iᴮi' },
        { value: 'IAIB', label: 'IᴬIᴮ' },
        { value: 'ii', label: 'ii' },
        { value: 'indeterminado', label: 'Indeterminado (Iᴬ_ ou Iᴮ_)' },
      ],
      options: [
        { value: 'A', label: 'Tipo A', alleles: 'IᴬIᴬ / Iᴬi' },
        { value: 'B', label: 'Tipo B', alleles: 'IᴮIᴮ / Iᴮi' },
        { value: 'AB', label: 'Tipo AB', alleles: 'IᴬIᴮ' },
        { value: 'O', label: 'Tipo O', alleles: 'ii' },
      ],
      phenoOf: g => {
        if (g === 'IAIB') return 'AB';
        if (g === 'ii') return 'O';
        return g.includes('IA') ? 'A' : 'B';
      },
    },
    rh: {
      key: 'rh', gene: 'R', mechanism: 'Dominância Completa (Hemático)',
      name: 'Fator Rh', shortName: 'Fator Rh',
      scratchpadMode: 'auto', alleles: ['R', 'r'],
      genotypes: ['RR', 'Rr', 'rr'],
      genotypeChoices: [
        { value: 'RR', label: 'RR (Homozigoto +)' },
        { value: 'Rr', label: 'Rr (Heterozigoto +)' },
        { value: 'rr', label: 'rr (Negativo −)' },
        { value: 'indeterminado', label: 'R_ (Indeterminado: RR ou Rr)' },
      ],
      options: [
        { value: 'pos', label: 'Rh Positivo (+)', alleles: 'RR / Rr' },
        { value: 'neg', label: 'Rh Negativo (−)', alleles: 'rr' },
      ],
      phenoOf: g => (g.includes('R') ? 'pos' : 'neg'),
    },
    colorVision: {
      key: 'colorVision', gene: 'X', mechanism: 'Herança Ligada ao Cromossomo X',
      name: 'Visão Cromática (Daltonismo)', shortName: 'Visão',
      scratchpadMode: 'xlinked', alleles: ['XD', 'Xd', 'Y'],
      genotypesBySex: {
        M: ['XDY', 'XdY'],
        F: ['XDXD', 'XDXd', 'XdXd'],
      },
      genotypeChoicesBySex: {
        M: [
          { value: 'XDY', label: 'XᴰY (Visão normal)' },
          { value: 'XdY', label: 'XᵈY (Daltônico)' },
        ],
        F: [
          { value: 'XDXD', label: 'XᴰXᴰ (Normal homozigota)' },
          { value: 'XDXd', label: 'XᴰXᵈ (Normal portadora)' },
          { value: 'XdXd', label: 'XᵈXᵈ (Daltônica)' },
          { value: 'indeterminado', label: 'XᴰX_ (Indeterminado)' },
        ],
      },
      options: [
        { value: 'normal', label: 'Visão cromática normal', alleles: 'XᴰY / XᴰXᴰ / XᴰXᵈ' },
        { value: 'daltonico', label: 'Daltonismo (vermelho-verde)', alleles: 'XᵈY / XᵈXᵈ' },
      ],
      phenoOf: g => (g === 'XdY' || g === 'XdXd' ? 'daltonico' : 'normal'),
    },
    eyeColor: {
      key: 'eyeColor', gene: 'EG', mechanism: 'Interação Gênica (2 pares: E/e e G/g)',
      name: 'Pigmentação da Íris', shortName: 'Olhos',
      scratchpadMode: 'auto', alleles: ['E', 'e'],
      genotypes: EYE_GENOTYPES,
      genotypeChoices: [
        { value: 'EEGG', label: 'EE GG' },
        { value: 'EeGg', label: 'Ee Gg' },
        { value: 'eeGG', label: 'ee GG (Verde hom.)' },
        { value: 'eeGg', label: 'ee Gg (Verde het.)' },
        { value: 'eegg', label: 'ee gg (Azul)' },
        { value: 'indeterminado', label: 'Indeterminado' },
      ],
      options: [
        { value: 'castanho', label: 'Olhos castanhos', alleles: 'E_ __' },
        { value: 'verde', label: 'Olhos verdes', alleles: 'ee G_' },
        { value: 'azul', label: 'Olhos azuis', alleles: 'ee gg' },
      ],
      phenoOf: g => {
        if (g.startsWith('EE') || g.startsWith('Ee')) return 'castanho';
        if (g.endsWith('GG') || g.endsWith('Gg')) return 'verde';
        return 'azul';
      },
    },
    albinism: {
      key: 'albinism', gene: 'A', mechanism: 'Epistasia Recessiva (Melanina)',
      name: 'Síntese de Melanina', shortName: 'Melanina',
      scratchpadMode: 'auto', alleles: ['A', 'a'],
      genotypes: ['AA', 'Aa', 'aa'],
      genotypeChoices: [
        { value: 'AA', label: 'AA (Pigmentação típica)' },
        { value: 'Aa', label: 'Aa (Típica portadora)' },
        { value: 'aa', label: 'aa (Albinismo — Epistasia)' },
        { value: 'indeterminado', label: 'A_ (Indeterminado)' },
      ],
      options: [
        { value: 'tipica', label: 'Pigmentação típica', alleles: 'AA / Aa' },
        { value: 'albino', label: 'Albinismo (Epistasia aa)', alleles: 'aa' },
      ],
      phenoOf: g => (g === 'aa' ? 'albino' : 'tipica'),
    },
    skinTone: {
      key: 'skinTone', gene: 'KN', mechanism: 'Herança Poligênica (2 pares: K/k e N/n)',
      name: 'Tom de Pele (Melanina)', shortName: 'Pele',
      scratchpadMode: 'auto', alleles: ['K', 'k'],
      genotypes: SKIN_GENOTYPES,
      genotypeChoices: [
        { value: 'KKNN', label: 'KK NN (4 dom. · Retinta)' },
        { value: 'KKNn', label: 'KK Nn (3 dom. · Morena esc.)' },
        { value: 'KkNN', label: 'Kk NN (3 dom. · Morena esc.)' },
        { value: 'KkNn', label: 'Kk Nn (2 dom. · Morena méd.)' },
        { value: 'Kknn', label: 'Kk nn (1 dom. · Morena clara)' },
        { value: 'kknn', label: 'kk nn (0 dom. · Clara)' },
        { value: 'indeterminado', label: 'Indeterminado' },
      ],
      options: [
        { value: 'retinta', label: 'Pele Retinta', alleles: '4 dom. (KK NN)' },
        { value: 'morena_escura', label: 'Morena Escura', alleles: '3 dom. (KK Nn / Kk NN)' },
        { value: 'morena_media', label: 'Morena Média', alleles: '2 dom. (Kk Nn / KK nn / kk NN)' },
        { value: 'morena_clara', label: 'Morena Clara', alleles: '1 dom. (Kk nn / kk Nn)' },
        { value: 'clara', label: 'Pele Clara', alleles: '0 dom. (kk nn)' },
      ],
      phenoOf: g => {
        const d = [...g].filter(ch => ch === 'K' || ch === 'N').length;
        return ['clara', 'morena_clara', 'morena_media', 'morena_escura', 'retinta'][d] || 'morena_media';
      },
    },
    hairColor: {
      key: 'hairColor', gene: 'HU', mechanism: 'Interação Gênica (2 pares: H/h e U/u)',
      name: 'Cor do Cabelo', shortName: 'Cor Cabelo',
      scratchpadMode: 'auto', alleles: ['H', 'h'],
      genotypes: HAIR_COLOR_GENOTYPES,
      genotypeChoices: [
        { value: 'HHUU', label: 'HH UU (Escuro hom.)' },
        { value: 'HhUu', label: 'Hh Uu (Escuro di-híbrido)' },
        { value: 'Hhuu', label: 'Hh uu (Escuro port. ruivo)' },
        { value: 'hhUU', label: 'hh UU (Loiro hom.)' },
        { value: 'hhUu', label: 'hh Uu (Loiro port. ruivo)' },
        { value: 'hhuu', label: 'hh uu (Ruivo)' },
        { value: 'indeterminado', label: 'Indeterminado' },
      ],
      options: [
        { value: 'escuro', label: 'Cabelo Escuro', alleles: 'H_ __' },
        { value: 'loiro', label: 'Cabelo Loiro', alleles: 'hh U_' },
        { value: 'ruivo', label: 'Cabelo Ruivo', alleles: 'hh uu' },
      ],
      phenoOf: g => {
        if (g.startsWith('HH') || g.startsWith('Hh')) return 'escuro';
        if (g.endsWith('UU') || g.endsWith('Uu')) return 'loiro';
        return 'ruivo';
      },
    },
    eyebrowShape: {
      key: 'eyebrowShape', gene: 'W', mechanism: 'Dominância Completa',
      name: 'Sobrancelhas', shortName: 'Sobrancelhas',
      scratchpadMode: 'auto', alleles: ['W', 'w'],
      genotypes: ['WW', 'Ww', 'ww'],
      genotypeChoices: [
        { value: 'WW', label: 'WW (Homozigoto dom.)' },
        { value: 'Ww', label: 'Ww (Heterozigoto)' },
        { value: 'ww', label: 'ww (Homozigoto rec.)' },
        { value: 'indeterminado', label: 'W_ (Indeterminado: WW ou Ww)' },
      ],
      options: [
        { value: 'espessas', label: 'Sobrancelhas espessas', alleles: 'WW / Ww' },
        { value: 'finas', label: 'Sobrancelhas finas', alleles: 'ww' },
      ],
      phenoOf: g => (g.includes('W') ? 'espessas' : 'finas'),
    },
    baldness: {
      key: 'baldness', gene: 'B', mechanism: 'Herança Influenciada pelo Sexo',
      name: 'Calvície Hereditária', shortName: 'Calvície',
      scratchpadMode: 'auto', alleles: ['B', 'b'],
      genotypes: ['BB', 'Bb', 'bb'],
      genotypeChoices: [
        { value: 'BB', label: 'BB (Calvície em ♂ e ♀)' },
        { value: 'Bb', label: 'Bb (Calvo em ♂ · Denso em ♀)' },
        { value: 'bb', label: 'bb (Cabelo denso em ♂ e ♀)' },
        { value: 'indeterminado', label: 'Indeterminado' },
      ],
      options: [
        { value: 'calvo', label: 'Calvície / Rarefação', alleles: '♂ BB, Bb · ♀ apenas BB' },
        { value: 'denso', label: 'Cabelo denso', alleles: '♂ bb · ♀ Bb, bb' },
      ],
      phenoOf: (g, ctx) => {
        const sex = (ctx && ctx.sex) || 'M';
        if (sex === 'F') return g === 'BB' ? 'calvo' : 'denso';
        return g.includes('B') ? 'calvo' : 'denso';
      },
    },
  };

  function formatGenotype(code) {
    if (!code) return '—';
    if (code === 'indeterminado') return 'Indeterminado';
    const map = {
      IAIA: 'IᴬIᴬ', IAi: 'Iᴬi', IBIB: 'IᴮIᴮ', IBi: 'Iᴮi', IAIB: 'IᴬIᴮ', ii: 'ii',
      XDY: 'XᴰY', XdY: 'XᵈY', XDXD: 'XᴰXᴰ', XDXd: 'XᴰXᵈ', XdXd: 'XᵈXᵈ',
      EEGG: 'EE GG', EEGg: 'EE Gg', EEgg: 'EE gg', EeGG: 'Ee GG', EeGg: 'Ee Gg', Eegg: 'Ee gg',
      eeGG: 'ee GG', eeGg: 'ee Gg', eegg: 'ee gg',
      KKNN: 'KK NN', KKNn: 'KK Nn', KKnn: 'KK nn', KkNN: 'Kk NN', KkNn: 'Kk Nn', Kknn: 'Kk nn',
      kkNN: 'kk NN', kkNn: 'kk Nn', kknn: 'kk nn',
      HHUU: 'HH UU', HHUu: 'HH Uu', HHuu: 'HH uu', HhUU: 'Hh UU', HhUu: 'Hh Uu', Hhuu: 'Hh uu',
      hhUU: 'hh UU', hhUu: 'hh Uu', hhuu: 'hh uu',
    };
    return map[code] || code;
  }

  function formatGamete(code) {
    const map = { IA: 'Iᴬ', IB: 'Iᴮ', i: 'i', XD: 'Xᴰ', Xd: 'Xᵈ', Y: 'Y' };
    return map[code] || code;
  }

  function forensicPhenoLabel(traitKey, val) {
    const t = FORENSIC_TRAITS[traitKey];
    const opt = t && t.options.find(o => o.value === val);
    return opt ? opt.label : (val || '—');
  }

  /** Extrai os 2 alelos de um genótipo humano (autossômico, ABO ou ligado ao X) */
  function splitHumanAlleles(traitKey, g) {
    if (traitKey === 'abo') {
      const res = [];
      let i = 0;
      while (i < g.length) {
        if (g[i] === 'I') { res.push(g.slice(i, i + 2)); i += 2; }
        else { res.push(g[i]); i += 1; }
      }
      return res;
    }
    if (traitKey === 'colorVision') {
      const res = [];
      let i = 0;
      while (i < g.length) {
        if (g[i] === 'X') { res.push(g.slice(i, i + 2)); i += 2; }
        else { res.push(g[i]); i += 1; }
      }
      return res;
    }
    if (traitKey === 'eyeColor' || traitKey === 'skinTone' || traitKey === 'hairColor') {
      const p1 = [g[0], g[1]];
      const p2 = [g[2], g[3]];
      const out = [];
      p1.forEach(a1 => p2.forEach(a2 => out.push(a1 + a2)));
      return out;
    }
    return [g[0], g[1]];
  }

  function normForensicPair(traitKey, a, b) {
    if (traitKey === 'abo') {
      const order = { IA: 0, IB: 1, i: 2 };
      const pair = [a, b].sort((x, y) => order[x] - order[y]);
      return pair.join('');
    }
    if (traitKey === 'colorVision') {
      const order = { XD: 0, Xd: 1, Y: 2 };
      const pair = [a, b].sort((x, y) => order[x] - order[y]);
      return pair.join('');
    }
    if (traitKey === 'eyeColor' || traitKey === 'skinTone' || traitKey === 'hairColor') {
      const dom1 = a[0].toUpperCase();
      const dom2 = a[1].toUpperCase();
      const first = [a[0], b[0]].sort((x, y) => (x === dom1 ? -1 : 1) - (y === dom1 ? -1 : 1)).join('');
      const second = [a[1], b[1]].sort((x, y) => (x === dom2 ? -1 : 1) - (y === dom2 ? -1 : 1)).join('');
      return first + second;
    }
    const dom = a.toUpperCase();
    const d = (a === dom ? 1 : 0) + (b === dom ? 1 : 0);
    return dom.repeat(d) + dom.toLowerCase().repeat(2 - d);
  }

  /** Verifica se o cruzamento parentA × parentB pode gerar o genótipo filho */
  function canProduceForensic(traitKey, parentA, parentB, child) {
    const gA = splitHumanAlleles(traitKey, parentA);
    const gB = splitHumanAlleles(traitKey, parentB);
    for (const a of gA) {
      for (const b of gB) {
        if (normForensicPair(traitKey, a, b) === child) return true;
      }
    }
    return false;
  }

  /** Combina dois gametas digitados/escolhidos manualmente no Rascunho de Punnett */
  function combineManualGametes(mode, ga, gb) {
    if (!ga || !gb) return null;
    if (mode === 'abo') {
      const code = normForensicPair('abo', ga, gb);
      return { code, formatted: formatGenotype(code), pheno: `Tipo ${FORENSIC_TRAITS.abo.phenoOf(code)}` };
    }
    if (mode === 'xlinked') {
      if (ga === 'Y' && gb === 'Y') return { code: 'YY', formatted: 'Inviável', pheno: 'Combinação impossível' };
      const code = normForensicPair('colorVision', ga, gb);
      const sex = code.includes('Y') ? 'Masc.' : 'Fem.';
      const ph = FORENSIC_TRAITS.colorVision.phenoOf(code) === 'daltonico' ? 'Daltônico(a)' : 'Normal';
      return { code, formatted: formatGenotype(code), pheno: `${sex} · ${ph}` };
    }
    // autossômico genérico (A/a ou qualquer letra)
    const dom = ga.toUpperCase();
    const isSameGene = ga.toLowerCase() === gb.toLowerCase();
    const code = isSameGene
      ? (ga === dom ? ga + gb : gb + ga)
      : (ga + gb);
    const status = !isSameGene ? ''
      : (code[0] === code[1] ? (code[0] === dom ? 'Hom. dom.' : 'Hom. rec.') : 'Heterozigoto');
    return { code, formatted: code, pheno: status };
  }

  /**
   * Auditor matemático de um caso do Dossiê 46.
   * Valida cada etapa contra o espaço completo de genótipos possíveis.
   */
  function auditDossieCase(caseDef) {
    const report = { id: caseDef.id, code: caseDef.code, title: caseDef.title, valid: true, steps: [] };
    for (const step of caseDef.steps) {
      const trait = FORENSIC_TRAITS[step.trait];
      if (!trait || !step.logic) {
        report.valid = false;
        report.steps.push({ trait: step.trait, ok: false, error: 'Traço ou lógica ausente' });
        continue;
      }
      const space = step.trait === 'colorVision'
        ? trait.genotypesBySex[caseDef.suspectSex || 'M']
        : trait.genotypes;

      const phenoCtx = { epistaticMask: !!step.epistaticMask, sex: caseDef.suspectSex || 'M' };
      const validGenotypes = space.filter(g => step.logic(g, {
        canProduce: (p1, p2, ch) => canProduceForensic(step.trait, p1, p2, ch),
        phenoOf: x => trait.phenoOf(x, phenoCtx),
      }));
      const validPhenotypes = [...new Set(validGenotypes.map(g => trait.phenoOf(g, phenoCtx)))];

      const phenoOk = validGenotypes.length > 0
        && validPhenotypes.length === 1
        && validPhenotypes[0] === step.expectedPheno;

      let genoOk = true;
      if (step.requireGenotype) {
        if (step.expectedGenotype === 'indeterminado') {
          genoOk = validGenotypes.length >= 2;
        } else {
          genoOk = validGenotypes.length === 1 && validGenotypes[0] === step.expectedGenotype;
        }
      }

      const ok = phenoOk && genoOk;
      if (!ok) report.valid = false;
      report.steps.push({
        trait: step.trait,
        ok,
        validGenotypes,
        validPhenotypes,
        expectedPheno: step.expectedPheno,
        expectedGenotype: step.requireGenotype ? step.expectedGenotype : '(fenótipo apenas)',
      });
    }
    return report;
  }

  return {
    // Botânica (clássica Flor-de-Mendel)
    GENES, LABELS, GENE_TRAIT_LABEL, HERBARIUM_CATALOG,
    parse, toString, phenotype, phenoKey, phenoLabel, catalogEntry,
    gametes, meiosisSummary, punnett, geneSquare, distribution, sampleChild, matches, exemplar,
    // Botânica Multi-Espécies (Mudança Genética: 8 espécies / 96 variedades)
    CATEGORIES, SPECIES: SPECIES_DEFS, SPECIES_MAP, ALL_HERBARIUM,
    getSpecies, parseFor, toStringFor, phenotypeFor, phenoKeyFor, phenoLabelFor,
    traitInfoFor, pairLabelFor, gametesFor, meiosisSummaryFor, punnettFor,
    geneSquareFor, distributionFor, sampleChildFor, matchesFor, exemplarFor, catalogForSpecies,
    // Forense (Dossiê 46)
    FORENSIC_TRAITS,
    formatGenotype,
    formatGamete,
    forensicPhenoLabel,
    canProduceForensic,
    combineManualGametes,
    auditDossieCase,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Genetics;
}
