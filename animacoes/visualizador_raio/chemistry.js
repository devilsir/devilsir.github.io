radiusLab.chemistry = (() => {
  const neon = [2, 8];
  const argon = [2, 8, 8];
  const krypton = [2, 8, 18, 8];
  const xenon = [2, 8, 18, 18, 8];

  function ionShells(charge, shells, { spin = '', coordination = 'VI' } = {}) {
    return { charge, shells, coordination, spin };
  }

  const electronModels = [
    { symbol: 'H', shells: [1], ionShells: [ionShells(-1, [2], { coordination: null })] },
    { symbol: 'Li', shells: [2, 1], ionShells: [ionShells(1, [2])] },
    { symbol: 'B', shells: [2, 3] },
    { symbol: 'C', shells: [2, 4], context: 'sp³' },
    { symbol: 'N', shells: [2, 5], ionShells: [ionShells(-3, neon, { coordination: 'IV' })] },
    { symbol: 'O', shells: [2, 6], ionShells: [ionShells(-2, neon)] },
    { symbol: 'F', shells: [2, 7], ionShells: [ionShells(-1, neon)] },
    { symbol: 'Na', shells: [2, 8, 1], ionShells: [ionShells(1, neon), ionShells(-1, [2, 8, 2], { coordination: null })] },
    { symbol: 'Mg', shells: [2, 8, 2], ionShells: [ionShells(2, neon)] },
    { symbol: 'Al', shells: [2, 8, 3], ionShells: [ionShells(3, neon)] },
    { symbol: 'Si', shells: [2, 8, 4] },
    { symbol: 'P', shells: [2, 8, 5] },
    { symbol: 'S', shells: [2, 8, 6], ionShells: [ionShells(-2, argon)] },
    { symbol: 'Cl', shells: [2, 8, 7], ionShells: [ionShells(-1, argon), ionShells(1, [2, 8, 6], { coordination: null })] },
    { symbol: 'K', shells: [2, 8, 8, 1], ionShells: [ionShells(1, argon)] },
    { symbol: 'Ca', shells: [2, 8, 8, 2], ionShells: [ionShells(2, argon)] },
    { symbol: 'Mn', context: 'spin alto', shells: [2, 8, 13, 2], ionShells: [ionShells(2, [2, 8, 13], { spin: 'HS' }), ionShells(3, [2, 8, 12], { spin: 'HS' })] },
    { symbol: 'Fe', context: 'spin alto', shells: [2, 8, 14, 2], ionShells: [ionShells(2, [2, 8, 14], { spin: 'HS' }), ionShells(3, [2, 8, 13], { spin: 'HS' })] },
    { symbol: 'Co', context: 'spin alto', shells: [2, 8, 15, 2], ionShells: [ionShells(2, [2, 8, 15], { spin: 'HS' }), ionShells(3, [2, 8, 14], { spin: 'HS' })] },
    { symbol: 'Ni', shells: [2, 8, 16, 2], ionShells: [ionShells(2, [2, 8, 16])] },
    { symbol: 'Cu', shells: [2, 8, 18, 1], ionShells: [ionShells(2, [2, 8, 17]), ionShells(1, [2, 8, 18])] },
    { symbol: 'Zn', shells: [2, 8, 18, 2], ionShells: [ionShells(2, [2, 8, 18])] },
    { symbol: 'Br', shells: [2, 8, 18, 7], ionShells: [ionShells(-1, krypton)] },
    { symbol: 'Rb', shells: [2, 8, 18, 8, 1], ionShells: [ionShells(1, krypton)] },
    { symbol: 'Sr', shells: [2, 8, 18, 8, 2], ionShells: [ionShells(2, krypton)] },
    { symbol: 'Ag', shells: [2, 8, 18, 18, 1], ionShells: [ionShells(1, [2, 8, 18, 18])] },
    { symbol: 'I', shells: [2, 8, 18, 18, 7], ionShells: [ionShells(-1, xenon)] },
    { symbol: 'Cs', shells: [2, 8, 18, 18, 8, 1], ionShells: [ionShells(1, xenon)] },
    { symbol: 'Ba', shells: [2, 8, 18, 18, 8, 2], ionShells: [ionShells(2, xenon)] },
    { symbol: 'Pb', shells: [2, 8, 18, 32, 18, 4], ionShells: [ionShells(2, [2, 8, 18, 32, 18, 2]), ionShells(4, [2, 8, 18, 32, 18])] },
  ];

  const sources = {
    shannon: {
      label: 'Shannon (1976)', url: 'https://doi.org/10.1107/S0567739476001551',
      method: 'Raio iônico efetivo',
    },
    cordero: {
      label: 'Cordero et al. (2008)', url: 'https://doi.org/10.1039/B801115J',
      method: 'Raio covalente',
    },
    pyykko: {
      label: 'Pyykkö e Atsumi (2009)', url: 'https://doi.org/10.1002/chem.200800987',
      method: 'Raio covalente · ligação simples', note: 'Obtido por ajuste molecular',
    },
    hawthorne: {
      label: 'Hawthorne e Gagné (2024)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11301896/',
      method: 'Raio iônico · distâncias em cristais',
    },
    pauling: {
      label: 'Pauling (1927)', url: 'https://doi.org/10.1021/ja01402a019',
      method: 'Raio iônico · modelo de Pauling', note: 'Calculado na fonte',
    },
    lang: {
      label: 'Lang e Smith (2010)', url: 'https://doi.org/10.1039/C0DT00401D',
      method: 'Raio iônico · modelo de esferas deformáveis', note: 'Calculado na fonte',
    },
    dawes: {
      label: 'Dawes et al. (1989)', url: 'https://doi.org/10.1021/ic00310a023',
      method: 'Raio iônico · contatos no cristal', note: 'Raio mínimo no modelo de esfera rígida',
    },
    rahm: {
      label: 'Rahm et al. (2016)', url: 'https://rahmlab.com/radii-of-the-elements/',
      method: 'Raio de íon isolado', note: 'Calculado por densidade eletrônica',
      isolated: true,
    },
    alSharaa: {
      label: 'Al-Sharaa et al. (2026)', url: 'https://doi.org/10.62476/apr.8130',
      method: 'Distância mais provável · orbital 2s', note: 'Máximo externo calculado',
      isolated: true, orbital: true,
    },
    alKazrajy: {
      label: 'Al-Kazrajy e Al-Khafaji (2023)', url: 'https://www.multiresearchjournal.com/admin/uploads/archives/archive-1686050129.pdf',
      method: 'Distância média · orbital 2p', note: 'Calculada por Hartree–Fock',
      isolated: true, orbital: true,
    },
    alsalman: {
      label: 'Alsalman et al. (2023)', url: 'https://cmd-ml.github.io/',
      method: 'Raio iônico em cristais · previsão', note: 'Estimado por aprendizado de máquina',
    },
    alsalmanAnions: {
      label: 'Alsalman et al. (2025)', url: 'https://cmd-ml.github.io/',
      method: 'Raio iônico em cristais · calibração', note: 'Derivado de distâncias cristalinas',
    },
    dirac: {
      label: 'Haug (2026)', url: 'https://doi.org/10.3390/atoms14070059',
      method: 'Distância mais provável · orbital 1s', note: 'Modelo de Dirac com núcleo pontual',
      isolated: true, orbital: true,
    },
    metastable: {
      label: 'Andersen et al. (1999)', url: 'https://doi.org/10.1063/1.556047',
      method: 'Ânion atômico metaestável', note: 'Tempo de vida experimental na Tabela 5',
      isolated: true,
    },
    sommerfeld: {
      label: 'Sommerfeld et al. (1996)', url: 'https://doi.org/10.1103/PhysRevLett.77.470',
      method: 'Ressonância atômica proposta', note: 'Resultado discutido por Morishita et al. (1998)',
      isolated: true,
    },
    kaygorodov: {
      label: 'Kaygorodov et al. (2021)', url: 'https://doi.org/10.1103/PhysRevA.104.012819',
      method: 'Ânion atômico previsto', note: 'Afinidade eletrônica teórica',
      isolated: true,
    },
    nist: {
      label: 'NIST ASD (v5.12)', url: 'https://doi.org/10.18434/T4W30F',
      method: 'Estado atômico tabulado',
      isolated: true,
    },
    stuckey: {
      label: 'Stuckey e Kiser (1966)', url: 'https://doi.org/10.1038/211963c0',
      method: 'Diânion monoatômico proposto', note: 'Atribuição contestada por Fremlin (1966)',
      isolated: true,
    },
    david: {
      label: 'David (1986)', url: 'https://doi.org/10.1016/0022-5088(86)90511-4',
      method: 'Raio iônico cristalográfico', note: 'Estimado na fonte',
    },
    bilewicz: {
      label: 'Bilewicz (2000)', url: 'https://doi.org/10.1524/ract.2000.88.12.833',
      method: 'Raio iônico · cálculo relativístico', note: 'Calculado na fonte',
    },
    ionova: {
      label: 'Ionova (2002)', url: 'https://doi.org/10.1070/RC2002v071n05ABEH000712',
      method: 'Raio iônico · estimativa cristalográfica', note: 'Estimado na fonte',
    },
    pershina: {
      label: 'Pershina (2014)', url: 'https://doi.org/10.1007/978-3-642-37466-1_3',
      method: 'Raio iônico · estimativa cristalográfica', note: 'Estimado na fonte',
    },
    fricke: {
      label: 'Fricke (1975)', url: 'https://doi.org/10.1007/BFb0116498',
      method: 'Raio iônico · previsão teórica', note: 'Estimado na fonte',
    },
    keller: {
      label: 'Keller et al. (1974)', url: 'https://doi.org/10.1021/j100612a015',
      method: 'Raio iônico · previsão teórica', note: 'Estimado na fonte',
    },
  };
  const { cordero, pyykko, ions: supplementalIons } = radiusLab.literatureRadii;
  const { groundShells: spectraShells, radii: extendedRadii } = radiusLab.atomicIons;
  const covalentRadii = [...cordero, ...pyykko];
  const estimatedCovalent = new Set(['He', 'Ne', 'Pm', 'At', 'Rn', 'Fr']);
  const coordinationNumbers = {
    I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8,
    IX: 9, X: 10, XI: 11, XII: 12, XIV: 14,
  };
  const spinLabels = { HS: 'alto', LS: 'baixo' };

  const gridRows = [
    'H - - - - - - - - - - - - - - - - He',
    'Li Be - - - - - - - - - - B C N O F Ne',
    'Na Mg - - - - - - - - - - Al Si P S Cl Ar',
    'K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr',
    'Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe',
    'Cs Ba - Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn',
    'Fr Ra - Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og',
    '- - La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu -',
    '- - Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr -',
  ];
  const positions = new Map();
  gridRows.forEach((row, index) => {
    row.split(' ').forEach((symbol, column) => {
      if (symbol !== '-') positions.set(symbol, { row: index + 1, column: column + 1 });
    });
  });

  const modelsBySymbol = new Map(electronModels.map(model => [model.symbol, model]));

  function makeRecord([charge, coordination, spinCode, radius, flags, context], index, source = sources.shannon) {
    const roman = typeof coordination === 'string' ? coordination : '';
    return {
      index,
      charge,
      coordination,
      number: roman ? coordinationNumbers[roman.replace(/(?:SQ|PY)$/, '')] : coordination,
      geometry: roman.endsWith('SQ') ? 'quadrado-planar' : roman.endsWith('PY') ? 'piramidal' : '',
      spin: spinLabels[spinCode] ?? '',
      spinCode,
      radius,
      flags,
      context,
      source,
    };
  }

  function chooseDefaultReferences(ions, models) {
    const byCharge = new Map();
    for (const ion of ions) {
      const current = byCharge.get(ion.charge);
      if (!current || (ion.source === current.source && ion.number === 6 && current.number !== 6)) {
        byCharge.set(ion.charge, ion);
      }
    }
    for (const { charge, coordination, spin } of models) {
      const reference = ions.find(ion => ion.charge === charge && ion.coordination === coordination && ion.spinCode === spin);
      if (reference) byCharge.set(charge, reference);
    }
    return byCharge;
  }

  function hydrogenicRadius(z) {
    const bohrRadiusPm = 52.9177210544;
    const fineStructure = 0.0072973525643;
    return (bohrRadiusPm / z) * Math.sqrt(1 - (z * fineStructure) ** 2);
  }

  const elements = radiusLab.periodicData.map(([symbol, name, records], index) => {
    const z = index + 1;
    const model = modelsBySymbol.get(symbol);
    const ions = records.map((record, recordIndex) => makeRecord(record, recordIndex));
    const additions = [...(supplementalIons[symbol] ?? []), ...(extendedRadii[symbol] ?? [])];
    for (const [charge, coordination, radius, source, context] of additions) {
      ions.push(makeRecord([charge, coordination, '', radius, '', context], ions.length, sources[source]));
    }
    if (z > 1) {
      ions.push(makeRecord([z - 1, null, '', hydrogenicRadius(z), '', 'Íon com um elétron'], ions.length, sources.dirac));
    }
    const groundShells = spectraShells[symbol] ?? [];
    const isolatedCharges = new Set(ions.filter(ion => ion.source.isolated).map(ion => ion.charge));
    groundShells.forEach((shells, charge) => {
      if (!charge || shells === null || isolatedCharges.has(charge)) return;
      const context = shells.length ? undefined : 'Núcleo sem elétrons';
      ions.push(makeRecord([charge, null, '', null, '', context], ions.length, sources.nist));
    });
    const covalentSource = index < cordero.length ? sources.cordero : sources.pyykko;
    const ionShells = model?.ionShells ?? [];
    const defaultReferences = chooseDefaultReferences(ions, ionShells);
    const references = [...defaultReferences.values()].filter(ion => ion.radius !== null && ion.source !== sources.dirac);
    const nonIsolated = references.filter(({ source }) => !source.isolated);
    const preferredReferences = nonIsolated.length ? nonIsolated : references;
    const closestCharge = preferredReferences.reduce((closest, { charge }) =>
      Math.abs(charge) < Math.abs(closest) ? charge : closest, Infinity
    );
    return {
      symbol,
      name,
      z,
      ...positions.get(symbol),
      radius: covalentRadii[index],
      covalentSource,
      covalentNote: estimatedCovalent.has(symbol) ? 'Estimado na fonte' : covalentSource.note,
      shells: model?.shells ?? groundShells[0] ?? null,
      context: model?.context,
      ions,
      ionShells,
      groundShells,
      defaultReferences,
      preferredIon: defaultReferences.get(ionShells[0]?.charge ?? closestCharge) ?? null,
    };
  });

  const elementBySymbol = new Map(elements.map(element => [element.symbol, element]));
  const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const formatNumber = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format;
  const formatRadius = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format;
  const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();

  function findIonQuery(value) {
    const query = value.normalize('NFKC').trim().replaceAll('−', '-');
    const match = query.match(/^([a-z]{1,2})\s*([1-9]\d*)?\s*([+-])$/i);
    if (!match) return null;

    const [, symbol, magnitude = '1', sign] = match;
    const element = elementBySymbol.get(symbol[0].toUpperCase() + symbol.slice(1).toLowerCase());
    const charge = Number(magnitude) * (sign === '+' ? 1 : -1);
    return element && Number.isSafeInteger(charge) ? { element, charge } : null;
  }

  function searchElements(value, { neutralOnly = false } = {}) {
    const ion = findIonQuery(value);
    if (ion) return neutralOnly || ion.element.defaultReferences.has(ion.charge) ? [ion.element] : [];

    const query = normalize(value);
    return elements.filter(({ name, symbol, z }) => {
      return normalize(name).includes(query) || symbol.toLowerCase().includes(query) || String(z).startsWith(query);
    });
  }

  function exactElement(matches, value) {
    const query = normalize(value);
    return matches.find(({ symbol, z }) => symbol.toLowerCase() === query || String(z) === query)
      ?? (matches.length === 1 ? matches[0] : null);
  }

  function formatSpecies(symbol, charge) {
    if (charge === 0) return symbol;
    const magnitude = Math.abs(charge);
    const exponent = magnitude === 1 ? '' : String(magnitude).replace(/\d/g, digit => superscripts[digit]);
    return symbol + exponent + (charge > 0 ? '⁺' : '⁻');
  }

  function formatSigned(value) {
    if (value === 0) return '0';
    return (value > 0 ? '+' : '−') + formatNumber(Math.abs(value));
  }

  function formatIonContext(ion) {
    if (ion.source.isolated) return ion.context ?? '';
    const coordination = ion.number === null ? 'NC não atribuído' : 'NC ' + ion.number;
    return [coordination, ion.geometry, ion.spin && 'spin ' + ion.spin, ion.context].filter(Boolean).join(' · ');
  }

  function resolveIon({ symbol, charge, reference }) {
    return reference ?? elementBySymbol.get(symbol).defaultReferences.get(charge) ?? null;
  }

  function describeSpecies(selection) {
    const { symbol, charge } = selection;
    const element = elementBySymbol.get(symbol);
    const reference = resolveIon(selection);
    const radius = charge === 0 ? element.radius : reference?.radius ?? null;
    const electrons = element.z - charge;
    const ionModel = element.ionShells.find(model => model.charge === charge);
    const source = charge === 0 ? element.covalentSource : reference?.source ?? null;
    const isolatedShells = source === sources.dirac ? [1]
      : source?.isolated && charge > 0 ? element.groundShells[charge] : undefined;
    const shells = charge === 0 ? element.shells : ionModel?.shells ?? isolatedShells ?? (electrons === 0 ? [] : null);
    const context = charge === 0 ? element.context : reference && formatIonContext(reference);
    const basis = source ? [source.method, context].filter(Boolean).join(' · ') : 'Sem dado de referência';
    const note = charge === 0 ? element.covalentNote
      : reference?.flags.includes('E') ? 'Estimado na fonte' : source?.note;

    return {
      element,
      charge,
      electrons,
      label: formatSpecies(symbol, charge),
      kind: charge === 0 ? 'neutral' : charge > 0 ? 'cation' : 'anion',
      radius,
      reference,
      source,
      note,
      shells,
      basis,
    };
  }

  function matchesIonFilter(ion, filter) {
    switch (filter) {
      case 'all': return true;
      case 'with-radius': return ion.radius !== null;
      case 'without-radius': return ion.radius === null;
      case 'cation': return ion.charge > 0;
      case 'anion': return ion.charge < 0;
      default: return ion.charge === Number(filter);
    }
  }

  function compareRadii(a, b) {
    if (a.radius === null || b.radius === null) return null;
    const delta = b.radius - a.radius;
    return { delta, percent: a.radius > 0 && b.radius > 0 ? delta / a.radius * 100 : null };
  }

  return {
    elements, elementBySymbol, searchElements, exactElement, findIonQuery, formatRadius, formatSpecies,
    formatSigned, formatIonContext, resolveIon, describeSpecies, compareRadii, matchesIonFilter,
  };
})();
