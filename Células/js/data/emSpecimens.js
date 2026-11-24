export const emSpecimens = {
  mitochondria: {
    name: 'Mitocôndrias · Pulmão de mamífero (TEM · 3,7k–600k×)',
    short: 'Mitocôndrias (TEM)',
    mode: 'TEM',
    nanoMode: 'cristae',
    file: './assets/em/mitochondria.jpg',
    defaultKv: 100,
    baseWidthUm: 1.05,
    minMag: 3700,
    maxMag: 600000,
    defaultMag: 100000,
    focusCenter: [0.24, 0.60],
    credit: 'Domínio Público · Dartmouth Electron Microscope Facility (Louisa Howard)',
    structure: 'Pirâmide real em 3 escalas TEM do pulmão de mamífero: alvéolo com pneumócitos e capilares (3.700×) → macrófago alveolar com núcleo e citoplasma (16.000×) → duas mitocôndrias em corte ultrafino (~70 nm) com cristas transversais (100.000×–600.000×).',
    prep: 'Fixação dupla em glutaraldeído + tetróxido de ósmio (OsO₄), inclusão em resina epóxi, corte em ultramicrótomo (~70 nm) sobre grade de cobre e contrastação com acetato de uranila e citrato de chumbo.',
    annotations: [
      [0.24, 0.62, 'Cristas mitocondriais'],
      [0.78, 0.34, 'Dupla membrana'],
      [0.64, 0.42, 'Matriz mitocondrial'],
      [0.48, 0.24, 'Ribossomos citosólicos']
    ],
    tiers: [
      {
        file: './assets/em/tem_lung_low.jpg',
        widthUm: 27.0,
        focusCenter: [0.34, 0.44],
        annotations: [
          [0.29, 0.39, 'Núcleo do pneumócito'],
          [0.46, 0.11, 'Hemácia no lúmen alveolar'],
          [0.74, 0.35, 'Citoplasma com mitocôndrias'],
          [0.12, 0.56, 'Capilar sanguíneo']
        ]
      },
      {
        file: './assets/em/tem_macrophage_low.jpg',
        widthUm: 6.2,
        focusCenter: [0.22, 0.44],
        annotations: [
          [0.62, 0.46, 'Núcleo (heterocromatina)'],
          [0.20, 0.34, 'Mitocôndrias (~1 μm)'],
          [0.28, 0.52, 'Complexo de Golgi'],
          [0.14, 0.62, 'Citoplasma / RER']
        ]
      }
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 54.2, channel: 'bright', role: 'Matriz orgânica, lipídios e resina epóxi' },
      { symbol: 'O', name: 'Oxigênio', line: 'Kα', kev: 0.525, color: '#22c55e', wt: 21.8, channel: 'mid', role: 'Carboidratos, proteínas e grupos carboxila' },
      { symbol: 'P', name: 'Fósforo', line: 'Kα', kev: 2.013, color: '#d946ef', wt: 6.4, channel: 'edge', role: 'Fosfolipídios das cristas e síntese de ATP' },
      { symbol: 'Fe', name: 'Ferro', line: 'Kα', kev: 6.404, color: '#f97316', wt: 4.1, channel: 'dark', role: 'Centros Fe–S e citocromos da cadeia respiratória' },
      { symbol: 'Os', name: 'Ósmio', line: 'Mα', kev: 1.910, color: '#3b82f6', wt: 13.5, channel: 'dark', role: 'Pós-fixador OsO₄ ligado às bicamadas lipídicas' }
    ]
  },
  au_hrtem: {
    name: 'Ouro (Au) · Nanopartículas e rede cristalina (HRTEM · 100k–600k×)',
    short: 'Ouro · Rede Au(111) (HRTEM)',
    mode: 'TEM',
    nanoMode: 'lattice_au',
    screenMm: 20,
    file: './assets/em/au_hrtem.jpg',
    defaultKv: 120,
    baseWidthUm: 0.033,
    minMag: 100000,
    maxMag: 600000,
    defaultMag: 450000,
    focusCenter: [0.56, 0.62],
    credit: 'CC BY-SA 4.0 · Wikimedia Commons (HRTEM real de nanopartículas e nanobastões de ouro)',
    structure: 'Micrografia real de alta resolução (HRTEM a 600.000× em sensor CMOS de 20 mm) revelando franjas cristalinas de planos atômicos Au(111) com espaçamento interplanar de 0,235 nm em nanopartícula decaédrica geminada e nanobastão de ouro sobre filme de carbono amorfo.',
    prep: 'Suspensão coloidal de nanopartículas de ouro gotejada sobre grade de cobre recoberta por filme ultrafino de carbono amorfo (~5 nm) e seca a vácuo antes da inserção no goniômetro TEM.',
    annotations: [
      [0.64, 0.68, 'Planos cristalinos Au(111) · 0,235 nm'],
      [0.24, 0.42, 'Nanobastão de ouro (~12 nm)'],
      [0.52, 0.34, 'Nanofio cristalino de Au'],
      [0.80, 0.18, 'Filme de carbono amorfo']
    ],
    elements: [
      { symbol: 'Au', name: 'Ouro (Cristal)', line: 'Mα', kev: 2.120, color: '#fbbf24', wt: 72.4, channel: 'dark', role: 'Nanopartículas e nanobastões cristalinos de ouro metálico' },
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 19.6, channel: 'bright', role: 'Filme ultrafino de suporte em carbono amorfo' },
      { symbol: 'Cu', name: 'Cobre (Grade)', line: 'Lα', kev: 0.930, color: '#f97316', wt: 4.8, channel: 'edge', role: 'Sinal residual da grade de suporte de cobre (300 mesh)' },
      { symbol: 'O', name: 'Oxigênio', line: 'Kα', kev: 0.525, color: '#22c55e', wt: 3.2, channel: 'mid', role: 'Ligantes citrato / surfactante na superfície das partículas' }
    ]
  },
  mg_hrtem: {
    name: 'Cristal de Magnésio · Colunas atômicas (HRTEM · 200k–600k×)',
    short: 'Colunas Atômicas Mg (HRTEM)',
    mode: 'TEM',
    nanoMode: 'lattice_mg',
    screenMm: 14,
    file: './assets/em/mg_hrtem.jpg',
    defaultKv: 120,
    baseWidthUm: 0.023,
    minMag: 200000,
    maxMag: 600000,
    defaultMag: 450000,
    focusCenter: [0.58, 0.42],
    credit: 'CC BY-SA 4.0 · Wikimedia Commons (Micrografia HRTEM de resolução atômica)',
    structure: 'Micrografia HRTEM real de contraste de fase em resolução sub-nanométrica (~0,20 nm) evidenciando colunas atômicas periódicas em rede hexagonal compacta (hcp) do cristal metálico e borda superficial amorfa de óxido nativo.',
    prep: 'Lâmina metálica ultrafina (< 30 nm) afinada por feixe de íons (FIB / polimento iônico) para permitir transmissão coerente dos elétrons a 120 kV.',
    annotations: [
      [0.64, 0.36, 'Colunas atômicas ordenadas (~0,26 nm)'],
      [0.44, 0.62, 'Interface cristal / óxido'],
      [0.24, 0.52, 'Borda amorfa de MgO (~3 nm)'],
      [0.12, 0.72, 'Vácuo (borda da amostra)']
    ],
    elements: [
      { symbol: 'Mg', name: 'Magnésio', line: 'Kα', kev: 1.254, color: '#a3e635', wt: 78.5, channel: 'dark', role: 'Rede cristalina metálica hcp de magnésio' },
      { symbol: 'O', name: 'Oxigênio', line: 'Kα', kev: 0.525, color: '#22c55e', wt: 15.2, channel: 'edge', role: 'Camada nanométrica de óxido nativo (MgO) na borda' },
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 6.3, channel: 'bright', role: 'Traço residual de carbono superficial' }
    ]
  },
  phage_tem: {
    name: 'Bacteriófago T2 · Vírus bacteriano (TEM · 100k–600k×)',
    short: 'Bacteriófago T2 (TEM)',
    mode: 'TEM',
    nanoMode: 'phage',
    file: './assets/em/phage_tem.jpg',
    defaultKv: 100,
    baseWidthUm: 0.31,
    minMag: 100000,
    maxMag: 600000,
    defaultMag: 320000,
    focusCenter: [0.52, 0.44],
    credit: 'CC BY-SA 4.0 · Wikimedia Commons (Micrografia TEM real do bacteriófago T2)',
    structure: 'Micrografia eletrônica real em contraste negativo de um bacteriófago T2 (parente direto do T4): cabeça icosaédrica prolata (~95 × 65 nm) contendo dsDNA nu, colarinho, bainha helicoidal contrátil estriada (~100 nm) e placa basal.',
    prep: 'Suspensão purificada de fagos adsorvida sobre filme de carbono/Formvar em grade de cobre e contrastada negativamente com acetato de uranila / fosfotungstato (PTA).',
    annotations: [
      [0.60, 0.30, 'Capsídeo icosaédrico (dsDNA)'],
      [0.52, 0.48, 'Colarinho / pescoço'],
      [0.44, 0.65, 'Bainha contrátil helicoidal'],
      [0.37, 0.83, 'Placa basal e fibras']
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 44.8, channel: 'bright', role: 'Proteínas do capsídeo (gp23) e bainha contrátil' },
      { symbol: 'N', name: 'Nitrogênio', line: 'Kα', kev: 0.392, color: '#06b6d4', wt: 15.6, channel: 'mid', role: 'Cadeias polipeptídicas virais e bases do dsDNA' },
      { symbol: 'P', name: 'Fósforo', line: 'Kα', kev: 2.013, color: '#d946ef', wt: 11.2, channel: 'mid', role: 'DNA dupla-fita (dsDNA) densamente empacotado na cabeça' },
      { symbol: 'W', name: 'Tungstênio (PTA)', line: 'Mα', kev: 1.775, color: '#3b82f6', wt: 28.4, channel: 'dark', role: 'Metal pesado em contraste negativo delineando o vírion' }
    ]
  },
  muscle: {
    name: 'Músculo esquelético · Sarcômeros (TEM · 7,5k–600k×)',
    short: 'Sarcômeros (TEM)',
    mode: 'TEM',
    nanoMode: 'sarcomere',
    file: './assets/em/muscle.jpg',
    defaultKv: 100,
    baseWidthUm: 13.8,
    minMag: 7500,
    maxMag: 600000,
    defaultMag: 10000,
    focusCenter: [0.46, 0.36],
    credit: 'Domínio Público · Dartmouth Electron Microscope Facility (Louisa Howard)',
    structure: 'Corte longitudinal ultrafino revelando miofibrilas perfeitamente alinhadas: linhas Z eletrodensas delimitando cada sarcômero, bandas A escuras (miosina + actina), bandas I claras e gotículas/mitocôndrias interfibrilares.',
    prep: 'Fixação por perfusão em glutaraldeído 2,5%, pós-fixação em OsO₄ 1%, inclusão em resina plástica rígida e corte ultrafino longitudinal para TEM.',
    annotations: [
      [0.57, 0.35, 'Linha Z (limite do sarcômero)'],
      [0.37, 0.27, 'Banda A (filamentos espessos)'],
      [0.48, 0.29, 'Inclusão lipídica / mitocôndria'],
      [0.44, 0.68, 'Endomísio / colágeno']
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 51.4, channel: 'bright', role: 'Colágeno do endomísio e miofilamentos' },
      { symbol: 'N', name: 'Nitrogênio', line: 'Kα', kev: 0.392, color: '#06b6d4', wt: 17.6, channel: 'mid', role: 'Proteínas contráteis (miosina e actina)' },
      { symbol: 'Ca', name: 'Cálcio', line: 'Kα', kev: 3.691, color: '#eab308', wt: 5.8, channel: 'edge', role: 'Íons Ca²⁺ nas tríades / retículo sarcoplasmático' },
      { symbol: 'Fe', name: 'Ferro', line: 'Kα', kev: 6.404, color: '#f97316', wt: 4.9, channel: 'dark', role: 'Mioglobina muscular e citocromos' },
      { symbol: 'Os', name: 'Ósmio', line: 'Mα', kev: 1.910, color: '#3b82f6', wt: 20.3, channel: 'dark', role: 'Linhas Z e membranas contrastadas com OsO₄' }
    ]
  },
  chloroplast: {
    name: 'Cloroplasto · Célula e tilacoides (TEM · 13k–600k×)',
    short: 'Cloroplasto (TEM)',
    mode: 'TEM',
    nanoMode: 'thylakoid',
    file: './assets/em/chloroplast.jpg',
    defaultKv: 80,
    baseWidthUm: 2.74,
    minMag: 13000,
    maxMag: 600000,
    defaultMag: 40000,
    focusCenter: [0.38, 0.36],
    credit: 'Domínio Público (Dartmouth EM) + CC BY-SA 3.0 Wikimedia Commons',
    structure: 'Transição real em TEM: visão da célula fotossintetizante inteira com cloroplasto em taça e pirenoide (13.000×) avançando para as pilhas compactas de tilacoides (grana), lamelas do estroma e plastoglóbulos (40.000×–360.000×).',
    prep: 'Tecido fotossintético fixado a vácuo em glutaraldeído + OsO₄, desidratado em acetona/etanol e incluído em resina Spurr para cortes de 60–80 nm.',
    annotations: [
      [0.30, 0.30, 'Grana (pilhas de tilacoides)'],
      [0.44, 0.14, 'Plastoglóbulos lipídicos'],
      [0.46, 0.45, 'Lamelas do estroma'],
      [0.72, 0.56, 'Estroma cloroplástico']
    ],
    tiers: [
      {
        file: './assets/em/tem_plant_low.jpg',
        widthUm: 7.6,
        focusCenter: [0.64, 0.38],
        annotations: [
          [0.31, 0.25, 'Pirenoide + grãos de amido'],
          [0.46, 0.64, 'Núcleo celular'],
          [0.68, 0.38, 'Cloroplasto (tilacoides)'],
          [0.18, 0.72, 'Parede celular']
        ]
      }
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 52.8, channel: 'bright', role: 'Carboidratos e enzimas do ciclo de Calvin no estroma' },
      { symbol: 'O', name: 'Oxigênio', line: 'Kα', kev: 0.525, color: '#22c55e', wt: 24.5, channel: 'mid', role: 'Grânulos de amido e matriz do estroma' },
      { symbol: 'Mg', name: 'Magnésio', line: 'Kα', kev: 1.254, color: '#a3e635', wt: 5.2, channel: 'edge', role: 'Átomo central da molécula de clorofila nos grana' },
      { symbol: 'P', name: 'Fósforo', line: 'Kα', kev: 2.013, color: '#d946ef', wt: 4.8, channel: 'edge', role: 'Membranas tilacoides e fotofosforilação (ATP)' },
      { symbol: 'Os', name: 'Ósmio', line: 'Mα', kev: 1.910, color: '#3b82f6', wt: 12.7, channel: 'dark', role: 'Plastoglóbulos osmiofílicos e pilhas de tilacoides' }
    ]
  },
  golgi: {
    name: 'Complexo de Golgi · Macrófago (TEM · 3,7k–600k×)',
    short: 'Complexo de Golgi (TEM)',
    mode: 'TEM',
    nanoMode: 'golgi',
    file: './assets/em/golgi.jpg',
    defaultKv: 100,
    baseWidthUm: 2.37,
    minMag: 3700,
    maxMag: 600000,
    defaultMag: 50000,
    focusCenter: [0.46, 0.52],
    credit: 'Domínio Público · Dartmouth Electron Microscope Facility (Louisa Howard)',
    structure: 'Navegação real do tecido alveolar (3.700×) → macrófago inteiro (16.000×) → pilha curvada de cisternas achatadas do aparelho de Golgi (faces cis e trans) com vesículas secretoras (50.000×–420.000×).',
    prep: 'Fixação em aldeído e ósmio preservando bicamadas lipídicas de ~7 nm de espessura, permitindo distinguir o lúmen de cada cisterna em alta ampliação.',
    annotations: [
      [0.44, 0.55, 'Cisternas do Golgi'],
      [0.34, 0.34, 'Vesículas secretoras'],
      [0.74, 0.12, 'Mitocôndria adjacente'],
      [0.24, 0.72, 'Retículo endoplasmático']
    ],
    tiers: [
      {
        file: './assets/em/tem_lung_low.jpg',
        widthUm: 27.0,
        focusCenter: [0.34, 0.44],
        annotations: [
          [0.29, 0.39, 'Pneumócito / Núcleo'],
          [0.46, 0.11, 'Hemácia no alvéolo'],
          [0.74, 0.35, 'Célula alveolar secretora']
        ]
      },
      {
        file: './assets/em/tem_macrophage_low.jpg',
        widthUm: 6.2,
        focusCenter: [0.28, 0.50],
        annotations: [
          [0.62, 0.46, 'Núcleo lobulado'],
          [0.28, 0.52, 'Região do Golgi'],
          [0.20, 0.34, 'Mitocôndrias vizinhas']
        ]
      }
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 53.0, channel: 'bright', role: 'Glicoproteínas em maturação e citosol' },
      { symbol: 'O', name: 'Oxigênio', line: 'Kα', kev: 0.525, color: '#22c55e', wt: 22.4, channel: 'mid', role: 'Oligossacarídeos adicionados na glicosilação' },
      { symbol: 'P', name: 'Fósforo', line: 'Kα', kev: 2.013, color: '#d946ef', wt: 7.2, channel: 'edge', role: 'Bicamadas das cisternas e vesículas secretoras' },
      { symbol: 'S', name: 'Enxofre', line: 'Kα', kev: 2.307, color: '#eab308', wt: 4.1, channel: 'mid', role: 'Sulfatação de proteoglicanos na rede trans-Golgi' },
      { symbol: 'Os', name: 'Ósmio', line: 'Mα', kev: 1.910, color: '#3b82f6', wt: 13.3, channel: 'dark', role: 'Contrastação densa de membranas cisternais (OsO₄)' }
    ]
  },
  nucleus: {
    name: 'Núcleo e célula secretora (TEM · 3,7k–600k×)',
    short: 'Núcleo & RER (TEM)',
    mode: 'TEM',
    nanoMode: 'chromatin',
    file: './assets/em/nucleus.jpg',
    defaultKv: 100,
    baseWidthUm: 4.12,
    minMag: 3700,
    maxMag: 600000,
    defaultMag: 25000,
    focusCenter: [0.34, 0.56],
    credit: 'Domínio Público · Dartmouth Electron Microscope Facility (Louisa Howard)',
    structure: 'Visão tecidual ampla (3.700×) aproximando-se ao núcleo com heterocromatina periférica densa junto ao envelope nuclear, eucromatina clara central e cisternas do retículo/Golgi (25.000×–240.000×).',
    prep: 'Corte ultrafino contrastado com metais pesados (uranila/chumbo), que se ligam preferencialmente aos ácidos nucleicos e ribossomos.',
    annotations: [
      [0.28, 0.70, 'Núcleo (heterocromatina / eucromatina)'],
      [0.31, 0.36, 'Cisternas do Golgi / RER'],
      [0.68, 0.48, 'Espaço intercelular'],
      [0.50, 0.22, 'Mitocôndria']
    ],
    tiers: [
      {
        file: './assets/em/tem_lung_low.jpg',
        widthUm: 27.0,
        focusCenter: [0.32, 0.42],
        annotations: [
          [0.29, 0.39, 'Núcleo inteiro (~6 μm)'],
          [0.74, 0.35, 'Citoplasma perinuclear'],
          [0.12, 0.56, 'Capilar adjacente']
        ]
      }
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 49.5, channel: 'bright', role: 'Nucleoplasma e matriz citoplasmática' },
      { symbol: 'N', name: 'Nitrogênio', line: 'Kα', kev: 0.392, color: '#06b6d4', wt: 16.8, channel: 'mid', role: 'Bases nitrogenadas do DNA/RNA e histonas' },
      { symbol: 'P', name: 'Fósforo', line: 'Kα', kev: 2.013, color: '#d946ef', wt: 12.4, channel: 'dark', role: 'Alta densidade de fosfato na heterocromatina e ribossomos' },
      { symbol: 'Os', name: 'Ósmio', line: 'Mα', kev: 1.910, color: '#3b82f6', wt: 11.9, channel: 'edge', role: 'Envelope nuclear e cisternas do RER' },
      { symbol: 'U', name: 'Urânio (Contraste)', line: 'Mα', kev: 3.171, color: '#a3e635', wt: 9.4, channel: 'dark', role: 'Acetato de uranila ligado aos ácidos nucleicos' }
    ]
  },
  virus: {
    name: 'Vírus · Coronavírus (TEM · 240k–600k×)',
    short: 'Coronavírus (TEM)',
    mode: 'TEM',
    nanoMode: 'virus',
    file: './assets/em/virus.jpg',
    defaultKv: 120,
    baseWidthUm: 0.42,
    minMag: 240000,
    maxMag: 600000,
    defaultMag: 250000,
    focusCenter: [0.44, 0.34],
    credit: 'Domínio Público · CDC / Public Health Image Library (PHIL)',
    structure: 'Partículas virais (~100–120 nm) com envelope lipídico rodeado por projeções glicoproteicas (espículas S) que conferem o característico aspecto de coroa solar invisível ao microscópio óptico.',
    prep: 'Adsorção direta da suspensão viral sobre grade de cobre recoberta por filme de carbono/Formvar seguida de contrastação negativa com ácido fosfotúngstico (PTA).',
    annotations: [
      [0.45, 0.27, 'Envelope lipídico viral'],
      [0.36, 0.13, 'Espículas glicoproteicas (coroa)'],
      [0.20, 0.58, 'Vírion (~110 nm)'],
      [0.82, 0.65, 'Fundo em contraste negativo']
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 46.2, channel: 'bright', role: 'Envelope lipídico viral e filme de suporte' },
      { symbol: 'N', name: 'Nitrogênio', line: 'Kα', kev: 0.392, color: '#06b6d4', wt: 14.1, channel: 'bright', role: 'Nucleocapsídeo proteico e RNA viral' },
      { symbol: 'S', name: 'Enxofre', line: 'Kα', kev: 2.307, color: '#eab308', wt: 5.4, channel: 'edge', role: 'Pontes dissulfeto nas espículas glicoproteicas (Spike)' },
      { symbol: 'P', name: 'Fósforo', line: 'Kα', kev: 2.013, color: '#d946ef', wt: 8.8, channel: 'edge', role: 'RNA viral e ácido fosfotúngstico' },
      { symbol: 'W', name: 'Tungstênio (PTA)', line: 'Mα', kev: 1.775, color: '#3b82f6', wt: 25.5, channel: 'dark', role: 'Metal pesado do contraste negativo ao redor do vírion' }
    ]
  },
  bacteria: {
    name: 'Bactéria · Escherichia coli (MEV · 10k–600k×)',
    short: 'E. coli (SEM)',
    mode: 'SEM',
    nanoMode: 'sem_bio',
    file: './assets/em/bacteria.jpg',
    defaultKv: 20,
    baseWidthUm: 9.52,
    minMag: 10500,
    maxMag: 600000,
    defaultMag: 12000,
    focusCenter: [0.56, 0.50],
    credit: 'Domínio Público · CDC / Public Health Image Library (PHIL)',
    structure: 'Bacilo gram-negativo (~2 μm) capturado em microscopia eletrônica de varredura (MEV/SEM) sobre membrana filtrante de policarbonato perfurada, destacando topografia tridimensional da parede celular.',
    prep: 'Fixação química, desidratação em etanol, secagem ao ponto crítico em CO₂ e metalização (sputtering) com fina camada condutora de ouro/paládio.',
    annotations: [
      [0.57, 0.51, 'Bacilo (Escherichia coli)'],
      [0.43, 0.49, 'Parede celular (superfície 3D)'],
      [0.63, 0.27, 'Poros da membrana filtro']
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 44.5, channel: 'mid', role: 'Peptidoglicano da parede celular e membrana filtro' },
      { symbol: 'O', name: 'Oxigênio', line: 'Kα', kev: 0.525, color: '#22c55e', wt: 18.2, channel: 'mid', role: 'Polissacarídeos da membrana externa (LPS)' },
      { symbol: 'Au', name: 'Ouro (Metalização)', line: 'Mα', kev: 2.120, color: '#fbbf24', wt: 26.8, channel: 'bright', role: 'Película condutora de Au (~15 nm) depositada p/ MEV' },
      { symbol: 'P', name: 'Fósforo', line: 'Kα', kev: 2.013, color: '#d946ef', wt: 5.1, channel: 'edge', role: 'Fosfolipídios da membrana externa bacteriana' },
      { symbol: 'Fe', name: 'Ferro', line: 'Kα', kev: 6.404, color: '#f97316', wt: 5.4, channel: 'dark', role: 'Traços metálicos / citocromos bacterianos' }
    ]
  },
  bee_sem: {
    name: 'Abelha · Pólen nos pelos plumosos (MEV · 250–600k×)',
    short: 'Abelha & Pólen (SEM)',
    mode: 'SEM',
    nanoMode: 'sem_wax',
    file: './assets/em/bee_sem.jpg',
    defaultKv: 20,
    baseWidthUm: 425,
    minMag: 250,
    maxMag: 600000,
    defaultMag: 500,
    focusCenter: [0.34, 0.42],
    credit: 'CC BY-SA 4.0 · Wikimedia Commons (Micrografia MEV de pelos de abelha)',
    structure: 'Superfície do corpo de uma abelha operária revelando os pelos ramificados (plumosos) especializados na captura eletrostática de grãos de pólen espinhosos durante a polinização.',
    prep: 'Amostra entomológica desidratada, montada em stub metálico com fita de carbono e metalizada a vácuo com ouro para emissão de elétrons secundários (SE).',
    annotations: [
      [0.21, 0.31, 'Grão de pólen espinhoso'],
      [0.46, 0.44, 'Pelos plumosos da abelha'],
      [0.61, 0.49, 'Pólen preso nas cerdas'],
      [0.72, 0.74, 'Cutícula quitinosa']
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 47.0, channel: 'mid', role: 'Quitina do exoesqueleto e esporopolenina do pólen' },
      { symbol: 'O', name: 'Oxigênio', line: 'Kα', kev: 0.525, color: '#22c55e', wt: 19.8, channel: 'mid', role: 'Polímeros polissacarídicos da cutícula' },
      { symbol: 'Au', name: 'Ouro (Sputtering)', line: 'Mα', kev: 2.120, color: '#fbbf24', wt: 22.4, channel: 'bright', role: 'Recobrimento metálico de ouro nas cerdas e espinhos' },
      { symbol: 'S', name: 'Enxofre', line: 'Kα', kev: 2.307, color: '#eab308', wt: 4.9, channel: 'edge', role: 'Esclerotina proteica das cerdas plumosas' },
      { symbol: 'Ca', name: 'Cálcio', line: 'Kα', kev: 3.691, color: '#06b6d4', wt: 5.9, channel: 'edge', role: 'Minerais associados à exina dos grãos de pólen' }
    ]
  },
  pollen_low: {
    name: 'Pólens diversos · Visão panorâmica (MEV · 200–600k×)',
    short: 'Pólens diversos (SEM)',
    mode: 'SEM',
    nanoMode: 'sem_wax',
    file: './assets/em/pollen_low_sem.jpg',
    defaultKv: 20,
    baseWidthUm: 500,
    minMag: 200,
    maxMag: 600000,
    defaultMag: 200,
    focusCenter: [0.50, 0.44],
    credit: 'Domínio Público · Dartmouth Electron Microscope Facility (Louisa Howard)',
    structure: 'Campo panorâmico real em baixo aumento (200×, FOV = 500 μm) reunindo grãos de pólen de múltiplas famílias botânicas: grãos equinados/espinhosos (~90–100 μm), pólens triangulares (Onagraceae) e grãos reticulados (~25–45 μm).',
    prep: 'Secagem ao ar de pólen botânico disperso sobre fita dupla-face de carbono em stub de alumínio, seguida de metalização (sputtering) com película condutora de ouro/paládio.',
    annotations: [
      [0.50, 0.30, 'Pólen espinhoso (~95 μm)'],
      [0.82, 0.35, 'Pólen triangular'],
      [0.22, 0.49, 'Exina reticulada'],
      [0.59, 0.50, 'Grãos menores (~25 μm)']
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 48.2, channel: 'mid', role: 'Esporopolenina resistente da exina polínica' },
      { symbol: 'O', name: 'Oxigênio', line: 'Kα', kev: 0.525, color: '#22c55e', wt: 20.4, channel: 'mid', role: 'Celulose e pectina da parede interna (intina)' },
      { symbol: 'Au', name: 'Ouro (Metalização)', line: 'Mα', kev: 2.120, color: '#fbbf24', wt: 21.5, channel: 'bright', role: 'Recobrimento condutor Au/Pd nos espinhos da exina' },
      { symbol: 'K', name: 'Potássio', line: 'Kα', kev: 3.314, color: '#a855f7', wt: 5.2, channel: 'edge', role: 'Íons K⁺ osmóticos para germinação do tubo polínico' },
      { symbol: 'Ca', name: 'Cálcio', line: 'Kα', kev: 3.691, color: '#06b6d4', wt: 4.7, channel: 'edge', role: 'Pectatos de cálcio estruturais na parede externa' }
    ]
  },
  stomata_sem: {
    name: 'Epiderme foliar · Tricomas e estômatos (MEV · 200–600k×)',
    short: 'Epiderme & Estômato (SEM)',
    mode: 'SEM',
    nanoMode: 'sem_wax',
    file: './assets/em/stomata_sem.jpg',
    defaultKv: 15,
    baseWidthUm: 54,
    minMag: 200,
    maxMag: 600000,
    defaultMag: 200,
    focusCenter: [0.56, 0.46],
    credit: 'Domínio Público · Dartmouth Electron Microscope Facility (Louisa Howard)',
    structure: 'Zoom contínuo entre 2 micrografias MEV reais da Dartmouth: epiderme foliar panorâmica a 200× repleta de tricomas glandulares e dezenas de estômatos → aproximação a 2.000×–18.000× sobre um único estômato e suas células-guarda (~15 μm).',
    prep: 'Fixação em glutaraldeído, desidratação seriada em etanol, secagem ao ponto crítico em CO₂ líquido para evitar colapso das células-guarda e metalização com ouro.',
    annotations: [
      [0.64, 0.47, 'Ostíolo (~15 μm)'],
      [0.63, 0.36, 'Células-guarda'],
      [0.29, 0.27, 'Epiderme foliar'],
      [0.42, 0.68, 'Bactéria (~2 μm)']
    ],
    tiers: [
      {
        file: './assets/em/sem_leaf_low.jpg',
        widthUm: 500,
        focusCenter: [0.52, 0.48],
        annotations: [
          [0.42, 0.20, 'Tricoma glandular (~220 μm)'],
          [0.50, 0.46, 'Estômatos dispersos (~20 μm)'],
          [0.70, 0.66, 'Epiderme foliar (200×)'],
          [0.32, 0.72, 'Base do tricoma']
        ]
      }
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 46.8, channel: 'mid', role: 'Cutina cerosa da cutícula e celulose epidérmica' },
      { symbol: 'O', name: 'Oxigênio', line: 'Kα', kev: 0.525, color: '#22c55e', wt: 22.6, channel: 'mid', role: 'Polissacarídeos das paredes celulares vegetais' },
      { symbol: 'Au', name: 'Ouro (Sputtering)', line: 'Mα', kev: 2.120, color: '#fbbf24', wt: 19.4, channel: 'bright', role: 'Camada metálica condutora para emissão de SE' },
      { symbol: 'K', name: 'Potássio', line: 'Kα', kev: 3.314, color: '#a855f7', wt: 6.8, channel: 'edge', role: 'Influxo de K⁺ que controla a turgescência das células-guarda' },
      { symbol: 'Si', name: 'Silício', line: 'Kα', kev: 1.740, color: '#06b6d4', wt: 4.4, channel: 'dark', role: 'Depósitos de sílica amorfa (fitólitos) na epiderme' }
    ]
  },
  blood_sem: {
    name: 'Sangue humano · Hemácias e leucócito (MEV · 3,5k–600k×)',
    short: 'Sangue humano (SEM)',
    mode: 'SEM',
    nanoMode: 'sem_blood',
    file: './assets/em/blood_sem.jpg',
    defaultKv: 20,
    baseWidthUm: 29,
    minMag: 3500,
    maxMag: 600000,
    defaultMag: 3500,
    focusCenter: [0.54, 0.54],
    credit: 'Domínio Público · National Cancer Institute (NCI) · EM Facility',
    structure: 'Elementos figurados do sangue humano sobre filtro de policarbonato perfurado: hemácias (eritrócitos) em disco bicôncavo liso (~7,5 μm), leucócito esférico (~10 μm) coberto por microvilosidades de superfície e plaquetas ativadas (~2–3 μm).',
    prep: 'Coleta anticoagulada, filtração suave em membrana de policarbonato, fixação em glutaraldeído tamponado, secagem ao ponto crítico e recobrimento com ouro.',
    annotations: [
      [0.70, 0.40, 'Hemácia bicôncava (~7,5 μm)'],
      [0.55, 0.56, 'Leucócito (microvilos)'],
      [0.38, 0.69, 'Plaquetas (~2–3 μm)'],
      [0.50, 0.78, 'Filtro policarbonato']
    ],
    elements: [
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 44.0, channel: 'mid', role: 'Cadeias proteicas e bicamada lipídica eritrocitária' },
      { symbol: 'O', name: 'Oxigênio', line: 'Kα', kev: 0.525, color: '#22c55e', wt: 19.5, channel: 'mid', role: 'Hemoglobina e glicoproteínas de superfície' },
      { symbol: 'Fe', name: 'Ferro (Heme)', line: 'Kα', kev: 6.404, color: '#f97316', wt: 8.6, channel: 'bright', role: 'Átomos de Fe²⁺ no grupo heme da hemoglobina' },
      { symbol: 'Au', name: 'Ouro (Sputtering)', line: 'Mα', kev: 2.120, color: '#fbbf24', wt: 22.1, channel: 'bright', role: 'Metalização condutora sobre hemácias e microvilos' },
      { symbol: 'P', name: 'Fósforo', line: 'Kα', kev: 2.013, color: '#d946ef', wt: 5.8, channel: 'edge', role: 'Fosfolipídios de membrana e grânulos plaquetários' }
    ]
  },
  diatom_sem: {
    name: 'Diatomáceas · Frústula de sílica (MEV · 1,8k–600k×)',
    short: 'Diatomáceas · Sílica (SEM)',
    mode: 'SEM',
    nanoMode: 'diatom',
    file: './assets/em/diatom_sem.jpg',
    defaultKv: 25,
    baseWidthUm: 64,
    minMag: 1800,
    maxMag: 600000,
    defaultMag: 1800,
    focusCenter: [0.58, 0.36],
    credit: 'CC BY-SA 4.0 · Wikimedia Commons (Micrografia MEV real de diatomáceas Bacillariophyta)',
    structure: 'Frústulas biomineralizadas de sílica opalina (SiO₂·nH₂O) de algas diatomáceas penadas, exibindo rafes longitudinais e fileiras geométricas precisas de poros nanométricos (aréolas e cribras) que funcionam como cristais fotônicos naturais.',
    prep: 'Limpeza ácida da matéria orgânica para expor as valvas de sílica pura, secagem sobre stub de alumínio e recobrimento condutor de ouro.',
    annotations: [
      [0.54, 0.28, 'Frústula de sílica (SiO₂)'],
      [0.74, 0.19, 'Aréolas / poros periódicos'],
      [0.68, 0.78, 'Valva estriada (cribra)'],
      [0.24, 0.62, 'Rafe longitudinal']
    ],
    elements: [
      { symbol: 'Si', name: 'Silício (Sílica)', line: 'Kα', kev: 1.740, color: '#06b6d4', wt: 36.8, channel: 'bright', role: 'Biossílica opalina (SiO₂·nH₂O) da frústula rígida' },
      { symbol: 'O', name: 'Oxigênio', line: 'Kα', kev: 0.525, color: '#22c55e', wt: 38.4, channel: 'mid', role: 'Ligações siloxano (Si–O–Si) da parede mineral' },
      { symbol: 'Au', name: 'Ouro (Sputtering)', line: 'Mα', kev: 2.120, color: '#fbbf24', wt: 14.2, channel: 'edge', role: 'Película condutora de ouro para emissão de elétrons secundários' },
      { symbol: 'C', name: 'Carbono', line: 'Kα', kev: 0.277, color: '#ef4444', wt: 10.6, channel: 'dark', role: 'Fita de carbono do porta-amostras e traços orgânicos' }
    ]
  }
};

export const emSpecimenOptions = Object.fromEntries(
  Object.entries(emSpecimens).map(([k, v]) => [k, v.name])
);
