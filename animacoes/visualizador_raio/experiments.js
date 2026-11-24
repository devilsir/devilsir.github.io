radiusLab.experiments = (() => {
  const { elementBySymbol } = radiusLab.chemistry;

  function tabulatedIon(symbol, charge, coordination, spinCode = '') {
    const reference = elementBySymbol.get(symbol).ions.find(ion =>
      ion.charge === charge && ion.coordination === coordination && ion.spinCode === spinCode
    );
    return { symbol, charge, reference };
  }

  const examples = [
    {
      id: 'sodium', title: 'Sódio', a: { symbol: 'Na', charge: 0 }, b: { symbol: 'Na', charge: 1 },
      mode: 'linked', explanation: 'O sódio perde o elétron da terceira camada ao formar Na⁺. A segunda camada passa a ser a mais externa.',
    },
    {
      id: 'chlorine', title: 'Cloro', a: { symbol: 'Cl', charge: 0 }, b: { symbol: 'Cl', charge: -1 },
      mode: 'linked', explanation: 'O cloro ganha um elétron na terceira camada. Com o mesmo número de prótons, a repulsão entre os elétrons aumenta e o cloreto tem raio de referência maior.',
    },
    {
      id: 'magnesium', title: 'Magnésio', a: { symbol: 'Mg', charge: 0 }, b: { symbol: 'Mg', charge: 2 },
      mode: 'linked', explanation: 'O magnésio perde os dois elétrons que ocupam a terceira camada. No Mg²⁺, a segunda camada passa a ser a mais externa.',
    },
    {
      id: 'oxygen', title: 'Oxigênio', a: { symbol: 'O', charge: 0 }, b: { symbol: 'O', charge: -2 },
      mode: 'linked', explanation: 'O oxigênio recebe dois elétrons na segunda camada. O aumento da repulsão entre os elétrons ajuda a explicar o maior raio de referência do óxido.',
    },
    {
      id: 'potassium', title: 'Potássio', a: { symbol: 'K', charge: 0 }, b: { symbol: 'K', charge: 1 },
      mode: 'linked', explanation: 'O potássio perde o único elétron da quarta camada ao formar K⁺. O cátion fica com três camadas ocupadas.',
    },
    {
      id: 'fluorine', title: 'Flúor', a: { symbol: 'F', charge: 0 }, b: { symbol: 'F', charge: -1 },
      mode: 'linked', explanation: 'O flúor recebe um elétron na segunda camada. O raio iônico efetivo do F⁻ em coordenação 6 é 133 pm na tabela de Shannon.',
    },
    {
      id: 'group', title: 'Descendo um grupo', a: { symbol: 'Na', charge: 0 }, b: { symbol: 'K', charge: 0 },
      mode: 'free', explanation: 'Sódio e potássio estão no grupo 1. O potássio ocupa uma camada a mais, o que ajuda a explicar seu raio covalente maior.',
    },
    {
      id: 'period', title: 'Ao longo de um período', a: { symbol: 'Na', charge: 0 }, b: { symbol: 'Cl', charge: 0 },
      mode: 'free', explanation: 'Sódio e cloro têm três camadas ocupadas. Ao longo desse período, o aumento da atração nuclear efetiva ajuda a explicar a redução do raio covalente.',
    },
    {
      id: 'isoelectronic-first', title: 'Íons isoeletrônicos', a: { symbol: 'Na', charge: 1 }, b: { symbol: 'Mg', charge: 2 },
      mode: 'free', explanation: 'Os dois íons têm dez elétrons. O magnésio tem um próton a mais, exerce maior atração sobre os elétrons e tem raio iônico menor nessas condições.',
    },
    {
      id: 'isoelectronic-next', title: 'Série de dez elétrons', a: { symbol: 'Mg', charge: 2 }, b: { symbol: 'Al', charge: 3 },
      mode: 'free', explanation: 'Mg²⁺ e Al³⁺ também têm dez elétrons. O alumínio tem um próton a mais e um raio iônico efetivo menor para a mesma coordenação.',
    },
    {
      id: 'iron', title: 'Ferro em duas cargas', a: { symbol: 'Fe', charge: 2 }, b: { symbol: 'Fe', charge: 3 },
      mode: 'free', extra: true, explanation: 'Em coordenação 6 e spin alto, Shannon registra 78 pm para Fe²⁺ e 64,5 pm para Fe³⁺. Os íons têm o mesmo número de prótons e o Fe³⁺ tem um elétron a menos.',
    },
    {
      id: 'halides', title: 'Cloreto e brometo', a: { symbol: 'Cl', charge: -1 }, b: { symbol: 'Br', charge: -1 },
      mode: 'free', extra: true, explanation: 'Em coordenação 6, os raios efetivos são 181 pm para Cl⁻ e 196 pm para Br⁻. O brometo tem uma camada eletrônica ocupada a mais.',
    },
    {
      id: 'anion-series', title: 'Ânions com dez elétrons', a: { symbol: 'O', charge: -2 }, b: { symbol: 'F', charge: -1 },
      mode: 'free', extra: true, explanation: 'O²⁻ e F⁻ têm dez elétrons. Em coordenação 6, o raio efetivo do F⁻ é menor. Seu núcleo tem um próton a mais.',
    },
    {
      id: 'argon-series', title: 'Íons com dezoito elétrons', a: { symbol: 'Cl', charge: -1 }, b: { symbol: 'K', charge: 1 },
      mode: 'free', extra: true, explanation: 'Cl⁻ e K⁺ têm 18 elétrons. Em coordenação 6, Shannon indica 181 pm para Cl⁻ e 138 pm para K⁺, que tem dois prótons a mais.',
    },
    {
      id: 'alkaline-earth-ions', title: 'Cálcio e estrôncio', a: { symbol: 'Ca', charge: 2 }, b: { symbol: 'Sr', charge: 2 },
      mode: 'free', extra: true, explanation: 'Em coordenação 6, os raios efetivos são 100 pm para Ca²⁺ e 118 pm para Sr²⁺. São dois cátions do grupo 2 com a mesma carga.',
    },
    {
      id: 'coordination', title: 'Mg²⁺ em duas coordenações',
      a: tabulatedIon('Mg', 2, 'IV'), b: tabulatedIon('Mg', 2, 'VI'),
      mode: 'free', extra: true,
      explanation: 'NC conta quantos vizinhos imediatos rodeiam o íon no cristal. Os dois Mg²⁺ têm dez elétrons. Shannon registra 57 pm com quatro vizinhos e 72 pm com seis.',
    },
    {
      id: 'spin', title: 'Fe³⁺ em dois estados de spin',
      a: tabulatedIon('Fe', 3, 'VI', 'LS'), b: tabulatedIon('Fe', 3, 'VI', 'HS'),
      mode: 'free', extra: true,
      explanation: 'Para Fe³⁺ com coordenação 6, Shannon registra 55 pm em spin baixo e 64,5 pm em spin alto. A espécie e o número de vizinhos são os mesmos.',
    },
  ];

  const activities = [
    {
      id: 'chlorine', title: 'Quando o cloro ganha um elétron',
      description: 'Compare o cloro neutro com o íon cloreto que se forma ao adicionar um elétron.',
      question: 'Em relação ao cloro neutro, qual será o raio do cloreto?',
      options: ['Menor', 'O mesmo', 'Maior'],
      answer: 2,
    },
    {
      id: 'group', title: 'Sódio e potássio no grupo 1',
      description: 'Sódio e potássio têm um elétron na camada mais externa e ocupam linhas diferentes na tabela periódica.',
      question: 'Qual dos dois tem o maior raio covalente?',
      options: ['Sódio', 'Potássio', 'Os dois têm o mesmo raio'],
      answer: 1,
    },
    {
      id: 'isoelectronic-next', title: 'Dez elétrons, raios diferentes',
      description: 'Mg²⁺ e Al³⁺ são isoeletrônicos. Cada um tem dez elétrons distribuídos em duas camadas.',
      question: 'Qual íon você espera que tenha o menor raio?',
      options: ['Mg²⁺', 'Al³⁺', 'Os dois têm o mesmo raio'],
      answer: 1,
    },
    {
      id: 'iron', title: 'Duas cargas para o ferro',
      description: 'Compare Fe²⁺ e Fe³⁺ com o mesmo número de coordenação (6) e no estado de spin alto.',
      question: 'Qual dos dois apresenta o menor raio iônico efetivo?',
      options: ['Fe²⁺', 'Fe³⁺', 'Os dois têm o mesmo raio'],
      answer: 1,
    },
    {
      id: 'halides', title: 'Cloreto ou brometo?',
      description: 'Os dois ânions têm carga −1. Compare os valores citados para coordenação 6.',
      question: 'Qual dos dois apresenta o maior raio iônico efetivo?',
      options: ['Cl⁻', 'Br⁻', 'Os dois têm o mesmo raio'],
      answer: 1,
    },
    {
      id: 'coordination', title: 'Mesmo íon, outra coordenação',
      description: 'NC é o número de vizinhos imediatos ao redor do íon no cristal. Compare dois ambientes para Mg²⁺, um com quatro vizinhos e outro com seis. A carga e a quantidade de elétrons são iguais nos dois casos.',
      question: 'Qual ambiente tem o maior raio iônico efetivo de Mg²⁺ na tabela de Shannon?',
      options: ['NC 4', 'NC 6', 'Os dois têm o mesmo raio'],
      answer: 1,
    },
  ];

  const sources = {
    covalent: { label: 'Raio covalente · RSC', url: 'https://periodic-table.rsc.org/Help/AtomicData' },
    atomicRadii: { label: 'Cordero et al. (2008)', url: 'https://doi.org/10.1039/B801115J' },
    ionicRadii: { label: 'Shannon (1976)', url: 'https://doi.org/10.1107/S0567739476001551' },
    coordination: { label: 'Sawada et al. (2022)', url: 'https://doi.org/10.1107/S1600576722006884' },
  };

  const tutorialSteps = [
    {
      example: 'group', title: 'O que é raio atômico?',
      paragraphs: [
        'A nuvem eletrônica se espalha no espaço. O raio atômico é uma medida do tamanho do átomo e depende de como esse tamanho é definido.',
        'Aqui, os átomos neutros usam o raio covalente. Em uma ligação simples entre dois átomos iguais, ele corresponde à metade da distância entre os núcleos. A bancada usa picômetros (pm).',
      ],
      task: 'Compare Na e K. O potássio tem uma camada eletrônica ocupada a mais e o maior raio covalente dos dois.',
      sources: [sources.covalent, sources.atomicRadii],
    },
    {
      example: 'sodium', title: 'Perder elétrons forma um cátion',
      paragraphs: [
        'A carga é o número de prótons menos o número de elétrons. O sódio neutro tem 11 de cada. Ao perder um elétron, fica com carga +1 e se torna Na⁺.',
        'O Na⁺ perde a ocupação da terceira camada. A nuvem eletrônica fica mais compacta, um caso em que o cátion tem menor raio de referência.',
      ],
      task: 'Use Animar formação ou neutralize o lado B e retire um elétron. Observe a saída do elétron e a mudança de tamanho.',
      sources: [sources.atomicRadii, sources.ionicRadii],
    },
    {
      example: 'chlorine', title: 'Ganhar elétrons forma um ânion',
      paragraphs: [
        'O cloro ganha um elétron e se torna Cl⁻. O núcleo continua com 17 prótons e a nuvem passa a ter 18 elétrons.',
        'O aumento da repulsão entre os elétrons ajuda a explicar por que a nuvem tende a se expandir. No exemplo, o cloreto tem um raio de referência maior que o cloro neutro.',
      ],
      task: 'Use Animar formação ou neutralize o lado B e adicione um elétron. Observe a terceira camada.',
      sources: [sources.atomicRadii, sources.ionicRadii],
    },
    {
      example: 'coordination', title: 'O que o NC muda?',
      paragraphs: [
        'NC significa número de coordenação. Em um cristal, ele conta quantos vizinhos imediatos rodeiam o íon. Um mesmo íon pode ocupar ambientes diferentes.',
        'Shannon registra 57 pm para Mg²⁺ em NC 4 e 72 pm em NC 6. O raio efetivo costuma crescer com a coordenação, com valores que dependem do íon e do ambiente cristalino.',
      ],
      task: 'Compare os raios e conte os vizinhos no esquema. A carga e os dez elétrons do Mg²⁺ são os mesmos nos dois lados.',
      sources: [sources.ionicRadii, sources.coordination],
      showNeighbors: true,
    },
    {
      example: 'spin', title: 'Como fazer uma comparação justa?',
      paragraphs: [
        'Comece pela definição do raio. O raio covalente vem de distâncias de ligação. O raio iônico efetivo descreve a contribuição de um íon às distâncias em um cristal.',
        'Para comparar o efeito da carga entre íons, use a mesma coordenação e, quando indicado, o mesmo estado de spin. Para estudar o efeito da coordenação, compare registros do mesmo íon.',
      ],
      task: 'Compare Fe³⁺ em NC 6 nos dois cartões. Só o spin é diferente nos registros mostrados.',
      sources: [sources.atomicRadii, sources.ionicRadii],
    },
  ];

  return { examples, activities, tutorialSteps };
})();
