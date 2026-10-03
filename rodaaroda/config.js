window.SILVIO_CONFIG = {
  modelPath: './assets/model/silvioburstoanimado.glb',
  characters: [
    { id: 'silvio_bursto_animado', label: 'Silvio Busto Animado', path: './assets/model/silvioburstoanimado.glb' },
    { id: 'silvio_corpo_animado', label: 'Silvio Corpo Animado', path: './assets/model/silviocorpoanimado.glb' },
    { id: 'silvio_corpo_animado_2', label: 'Silvio Corpo Animado 2', path: './assets/model/SILVIOCORPOANIMADO2.glb' }
  ],
  finalAudio: './assets/audio/parabens-final.wav',
  audioFiles: [
    './assets/audio/silvio_santos_e_o_bambu_mp3cut.mp3',
    './assets/audio/e-ta-bom.mp3',
    './assets/audio/silvio_santos_diz_que_pena_1_.mp3',
    './assets/audio/nao-consegue-ne-moises-meme_04Iqgj4.mp3',
    './assets/audio/silvio-santos-sera-que-e-bom.mp3',
    './assets/audio/silvio-santos-que-eu-faco.mp3',
    './assets/audio/e-mesmo-e-verdade-silvio-santos.mp3',
    './assets/audio/silvio-santos-o-seu-tempo-acabou.mp3',
    './assets/audio/tmp9ynyqwxm.mp3',
    './assets/audio/como_ZQTTFwJ.mp3',
    './assets/audio/silvio-santos-nao-naaaaao.mp3',
    './assets/audio/silvio-santos-cala-a-boca.mp3',
    './assets/audio/silvio-santos-erotismo.mp3'
  ],
  autoBlink: false,
  blinkMinSeconds: 2.8,
  blinkMaxSeconds: 5.8,
  breastDragStrength: 0.0,
  breastMaxOffset: 0.0,
  breastHitRadiusPx: 0,
  jellyStiffness: 48,
  jellyDamping: 6.4,

  defaultRules: {
    solveBonus: 1000,
    wrongSolvePenalty: 200,
    hintPenalties: [150, 250, 400],
    difficultyMultipliers: { easy: 1, medium: 1.15, hard: 1.35 },
    difficultyBonusEnabled: false,
    comboEnabled: false,
    comboStep: 0.1,
    maxComboMultiplier: 1.5,
    bankruptBehavior: 'match',
    wrongSolveLosesTurn: true
  },

  defaultPuzzles: [
    { category: 'NATUREZA', phrase: 'CACHOEIRA GELADA' },
    { category: 'NATUREZA', phrase: 'TRILHA NA MATA' },
    { category: 'NATUREZA', phrase: 'PRAIA AO AMANHECER' },
    { category: 'NATUREZA', phrase: 'JARDIM FLORIDO' },
    { category: 'NATUREZA', phrase: 'CHUVA DE VERAO' },
    { category: 'COTIDIANO', phrase: 'MERCADO DO BAIRRO' },
    { category: 'COTIDIANO', phrase: 'CAFE DA MANHA' },
    { category: 'COTIDIANO', phrase: 'PONTO DE ONIBUS' },
    { category: 'COTIDIANO', phrase: 'ROUPA NO VARAL' },
    { category: 'COTIDIANO', phrase: 'ALMOCO EM FAMILIA' },
    { category: 'CASA', phrase: 'SOFA DA SALA' },
    { category: 'CASA', phrase: 'QUARTO ARRUMADO' },
    { category: 'CASA', phrase: 'CHEIRO DE BOLO' },
    { category: 'CASA', phrase: 'MESA DA COZINHA' },
    { category: 'CASA', phrase: 'JANELA ABERTA' },
    { category: 'LAZER', phrase: 'PASSEIO NO PARQUE' },
    { category: 'LAZER', phrase: 'FILME NO DOMINGO' },
    { category: 'LAZER', phrase: 'PIQUENIQUE NO GRAMADO' },
    { category: 'LAZER', phrase: 'BICICLETA NA CICLOVIA' },
    { category: 'LAZER', phrase: 'FOTO DO POR DO SOL' }
  ],

  sampleQuestions: [
    {
      id: 'sample_cinema_jurassic_park',
      theme: 'CINEMA',
      question: 'Qual filme mostra um parque habitado por dinossauros clonados?',
      answer: 'JURASSIC PARK',
      hints: ['Foi lançado nos anos 1990.', 'Foi dirigido por Steven Spielberg.', 'A vida encontra um jeito.'],
      difficulty: 'medium',
      tags: ['filmes', 'dinossauros']
    },
    {
      id: 'sample_musica_garota_ipanema',
      theme: 'MÚSICA',
      question: 'Qual canção brasileira começa descrevendo uma garota que passa cheia de graça?',
      answer: 'GAROTA DE IPANEMA',
      hints: ['É um clássico da bossa nova.', 'Tom Jobim e Vinicius de Moraes estão ligados à composição.'],
      difficulty: 'easy',
      tags: ['brasil', 'bossa nova']
    },
    {
      id: 'sample_ciencia_planeta_vermelho',
      theme: 'CIÊNCIA',
      question: 'Qual planeta é conhecido como Planeta Vermelho?',
      answer: 'MARTE',
      hints: ['É um planeta rochoso.', 'Fica depois da Terra na ordem a partir do Sol.'],
      difficulty: 'easy',
      tags: ['espaço', 'astronomia']
    },
    {
      id: 'sample_brasil_pao_queijo',
      theme: 'BRASIL',
      question: 'Qual quitute mineiro é feito tradicionalmente com polvilho e queijo?',
      answer: 'PAO DE QUEIJO',
      hints: ['É muito comum no café da manhã.', 'É fortemente associado a Minas Gerais.'],
      difficulty: 'easy',
      tags: ['comida', 'minas gerais']
    }
  ],
  wheelSegments: [
    { label: '100', value: 100, color: '#ef404a' },
    { label: '500', value: 500, color: '#ffd234' },
    { label: '200', value: 200, color: '#34c96f' },
    { label: '800', value: 800, color: '#f16932' },
    { label: '300', value: 300, color: '#efdf46' },
    { label: 'PASSA', type: 'loseTurn', color: '#ececec' },
    { label: '400', value: 400, color: '#ef404a' },
    { label: '1000', value: 1000, color: '#37c66a' },
    { label: '600', value: 600, color: '#f9ce36' },
    { label: 'PERDE TUDO', type: 'bankrupt', color: '#171717' },
    { label: '250', value: 250, color: '#f56a34' },
    { label: '700', value: 700, color: '#34bf65' },
    { label: '150', value: 150, color: '#f0d63f' },
    { label: '900', value: 900, color: '#ef3f48' },
    { label: '350', value: 350, color: '#f56a34' },
    { label: 'PASSA', type: 'loseTurn', color: '#ececec' },
    { label: '450', value: 450, color: '#37c66a' },
    { label: '750', value: 750, color: '#ffd234' }
  ]
};
