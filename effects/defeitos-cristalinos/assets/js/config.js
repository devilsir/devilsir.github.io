export const SPACING = 2;
export const SIZE = 4;

export const latticeOptions = [
  { value: 'sc', label: 'Cúbica Simples (SC)' },
  { value: 'bcc', label: 'Cúbica de Corpo Centrado (BCC)' },
  { value: 'fcc', label: 'Cúbica de Face Centrada (FCC)' }
];

export const clipOptions = [
  { value: 'none', label: 'Desativado' },
  { value: 'x', label: 'Plano YZ (Cortar X)' },
  { value: 'y', label: 'Plano XZ (Cortar Y)' },
  { value: 'z', label: 'Plano XY (Cortar Z)' }
];

export const modeConfig = {
  view: {
    title: 'Visualizar Rede',
    icon: '◎',
    description: 'Navegue livremente pela rede cristalina (SC, BCC ou FCC). Arraste para girar e use o scroll para aproximar.',
    instructions: '',
    implications: 'A rede cristalina perfeita é um modelo teórico. Seus parâmetros, como parâmetro de rede e fator de empacotamento, determinam propriedades fundamentais como densidade teórica e padrão de difração de raios-X.',
    energyLevel: 0,
    energyText: 'Estado fundamental: menor estado de energia da rede sem perturbações térmicas.'
  },
  vacancy: {
    title: 'Lacuna (Vacância)',
    icon: '□',
    description: 'Defeito pontual em que um átomo está faltando em seu sítio regular na rede cristalina.',
    instructions: 'Clique em um átomo azul para removê-lo. Clique na marca da lacuna para restaurá-lo.',
    implications: 'Lacunas governam a difusão atômica no estado sólido. Elas aumentam a entropia do cristal e reduzem a densidade real em comparação à rede perfeita.',
    energyLevel: 30,
    energyText: 'Energia moderada, associada à quebra de ligações cristalinas e à elevação local da energia elástica.'
  },
  substitutional: {
    title: 'Impureza Substitucional',
    icon: '↻',
    description: 'Um átomo diferente ocupa o lugar de um átomo da matriz hospedeira na rede cristalina.',
    instructions: 'Clique em um átomo para substituí-lo por um átomo de soluto em vermelho.',
    implications: 'Causa distorção na rede dependendo da diferença de raios atômicos. É fundamental para ligas metálicas, como latão e bronze, e para endurecimento por solução sólida.',
    energyLevel: 20,
    energyText: 'Energia variável de baixa a moderada, limitada pela compatibilidade de raios atômicos e eletronegatividade.'
  },
  interstitial: {
    title: 'Impureza Intersticial',
    icon: '+',
    description: 'Um átomo extra ocupa pequenos espaços vazios entre os átomos da rede.',
    instructions: 'Clique nos sítios intersticiais demarcados em amarelo claro para adicionar ou remover a impureza.',
    implications: 'Introduz tensões de compressão na rede vizinha. É crucial no aço, em que átomos de carbono intersticiais distorcem a rede do ferro e aumentam sua dureza.',
    energyLevel: 85,
    energyText: 'Energia alta, pois a inserção intersticial desloca fortemente os átomos hospedeiros adjacentes.'
  },
  frenkel: {
    title: 'Defeito de Frenkel',
    icon: '⇄',
    description: 'Par formado por uma lacuna e um átomo intersticial, originado quando um íon salta de sua posição para um interstício.',
    instructions: 'Clique em um átomo hospedeiro. Ele será deslocado para um interstício próximo, formando o par de Frenkel.',
    implications: 'É comum em cerâmicas com grande diferença de tamanho entre cátions e ânions. Afeta a condutividade iônica mantendo neutralidade elétrica e estequiometria.',
    energyLevel: 70,
    energyText: 'Energia significativa, pois combina a formação de uma lacuna e de um átomo deslocado para um interstício.'
  },
  schottky: {
    title: 'Defeito de Schottky',
    icon: '✂',
    description: 'Par de lacunas criadas simultaneamente para manter neutralidade e estequiometria em cristais iônicos.',
    instructions: 'Clique em um átomo. Dois sítios serão removidos para simular o par de lacunas.',
    implications: 'Promove diminuição na densidade de cerâmicas iônicas sem alterar a estequiometria. É importante para prever difusão e mobilidade em cristais salinos.',
    energyLevel: 50,
    energyText: 'Energia moderada a alta, com estabilização parcial pela compensação eletrostática do par.'
  }
};

export const atomTypesWithMass = ['host', 'substitutional', 'interstitial', 'frenkel_interstitial'];
export const vacancyTypes = ['vacancy', 'frenkel_vacancy', 'schottky_cation', 'schottky_anion'];
export const impurityTypes = ['substitutional', 'interstitial'];
