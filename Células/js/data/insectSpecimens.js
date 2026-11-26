const ccBy = 'https://creativecommons.org/licenses/by/4.0/';

function figure(file, title, credit, source) {
  return { image: './assets/micro/' + file, title, credit, source, license: ccBy };
}

const flyFigure = figure(
  'drosophila_bellymount_fig2.png', 'Abdômen, intestino médio e rede traqueal · microscopia confocal',
  'Koyama et al. (2020), figura 2', 'https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3000567#pbio-3000567-g002'
);
const coprisAnatomy = figure(
  'copris_anatomia_fig1.jpg', 'Intestino anterior e médio · estereomicroscopia',
  'Özyurt Koçakoğlu et al. (2025), figura 1', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12018526/figure/Fig1/'
);
const coprisGut = figure(
  'copris_intestino_fig2.jpg', 'Parede do intestino médio · microscopia óptica',
  'Özyurt Koçakoğlu et al. (2025), figura 2', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12018526/figure/Fig2/'
);
const coprisTubules = figure(
  'copris_tubulos_fig8.jpg', 'Túbulos de Malpighi e traqueias · microscopia óptica e eletrônica',
  'Özyurt Koçakoğlu et al. (2025), figura 8', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12018526/figure/Fig8/'
);
const tenebrioAnatomy = figure(
  'tenebrio_anatomia_fig3.jpg', 'Sistemas digestório e nervoso da pupa · reconstrução por micro-CT',
  'Vommaro et al. (2024), figura 3', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10997553/figure/Fig3/'
);
const tenebrioSections = figure(
  'tenebrio_cortes_fig1.jpg', 'Cortes virtuais da pupa · micro-CT de contraste de fase',
  'Vommaro et al. (2024), figura 1', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10997553/figure/Fig1/'
);

export const insectAnimals = {
  bee: {
    name: 'Abelha operária',
    samples: ['bee', 'beeTubules']
  },
  drosophila: {
    name: 'Mosca-da-fruta adulta',
    scientific: 'Drosophila melanogaster',
    figure: flyFigure,
    samples: ['flyMidgut', 'flyTrachea'],
  },
  copris: {
    name: 'Besouro rola-bosta adulto',
    scientific: 'Copris felschei',
    figure: coprisAnatomy,
    samples: ['coprisMidgut', 'coprisTubules'],
  },
  tenebrio: {
    name: 'Pupa de tenébrio',
    scientific: 'Tenebrio molitor',
    figure: tenebrioAnatomy,
    samples: ['tenebrioMidgut'],
  },
};

export const insectTissues = {
  beeTubules: {
    name: 'Abelha · Túbulos de Malpighi', short: 'Abelha · Túbulos de Malpighi',
    animal: 'bee', region: 'tubules', color: '#e6e4ac', radius: 29,
    structure: 'Túbulos finos do sistema excretor, ligados ao tubo digestivo. No modelo aberto, formam feixes claros junto ao ventrículo.',
    recognition: 'Procure perfis tubulares estreitos, cada um com um lúmen cercado por células epiteliais.'
  },
  flyMidgut: {
    name: 'Mosca-da-fruta · Intestino médio', short: 'Mosca · Intestino',
    animal: 'drosophila', region: 'gut', color: '#dba77e', radius: 66,
    structure: 'Veja o intestino médio no painel A da figura e os núcleos do epitélio intestinal no painel B.',
    recognition: 'No corte simulado, localize o lúmen e a fileira de núcleos no epitélio.',
    figure: flyFigure,
  },
  flyTrachea: {
    name: 'Mosca-da-fruta · Traqueias abdominais', short: 'Mosca · Traqueias',
    animal: 'drosophila', region: 'trachea', color: '#b7c6bc', radius: 25,
    structure: 'Nos painéis C–E, observe a rede traqueal e suas ramificações junto ao intestino.',
    recognition: 'No corte simulado, compare o calibre dos lúmens das traqueias.',
    figure: flyFigure,
  },
  coprisMidgut: {
    name: 'Besouro rola-bosta · Intestino médio', short: 'Besouro · Intestino',
    animal: 'copris', region: 'gut', color: '#c89173', radius: 137,
    structure: 'A micrografia mostra epitélio cilíndrico, criptas regenerativas e musculatura ao redor do intestino médio.',
    recognition: 'Compare as dobras do epitélio e o lúmen com a micrografia.',
    figure: coprisGut,
  },
  coprisTubules: {
    name: 'Besouro rola-bosta · Túbulos de Malpighi', short: 'Besouro · Túbulos de Malpighi',
    animal: 'copris', region: 'tubules', color: '#dab86b', radius: 31,
    structure: 'O painel 27 mostra cortes dos túbulos de Malpighi e de uma traqueia em microscopia óptica.',
    recognition: 'No corte simulado, procure os lúmens arredondados e os núcleos do epitélio dos túbulos.',
    figure: coprisTubules,
  },
  tenebrioMidgut: {
    name: 'Pupa de tenébrio · Intestino médio', short: 'Tenébrio · Intestino',
    animal: 'tenebrio', region: 'gut', color: '#dbbb82', radius: 107,
    structure: 'A micro-CT mostra a posição do tubo digestivo em cortes virtuais de pupas em diferentes estágios.',
    recognition: 'Compare o corte simulado com a posição do intestino nas seções da figura.',
    figure: tenebrioSections,
  },
};
