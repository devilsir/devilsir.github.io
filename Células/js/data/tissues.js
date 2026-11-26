import { insectTissues } from './insectSpecimens.js?v=2';

export const tissues = {
  bee: {
    name: 'Abelha · Ventrículo e trato digestivo (Resultado real · Minicurso)',
    short: 'Abelha (Minicurso)',
    color: '#d8cf4a',
    structure: 'Registro microscópico real obtido ao final do minicurso após preparo completo em lâmina com lamínula: evidencia o papo/inglúvio (bulbo superior), o ventrículo muscular anelado (estômago), delicados túbulos de Malpighi excretores e ramificações traqueais.',
    function: 'Modelo prático completo de histotécnica entomológica — desde a captura, crioeutanásia e dissecção na lupa sobre cera vermelha até a montagem final da lamínula e observação em microscopia óptica.',
    recognition: 'Em 4× (40× total) observe todo o trato digestivo; amplie para 10×–1000× e ative "Identificar" para localizar papo/inglúvio, anéis musculares do ventrículo, túbulos de Malpighi e traqueias.',
    suggested: 'historesin'
  },
  epithelial: { name: 'Epitélio prismático simples', short: 'Epitélio', color: '#db97b6',
    structure: 'Uma camada de células altas apoiada em membrana basal. No modelo intestinal há enterócitos com borda em escova e células caliciformes intercaladas.',
    function: 'A borda em escova amplia a área de absorção. Células caliciformes secretam mucinas que ajudam a proteger a superfície.',
    recognition: 'Procure fileiras de núcleos voltados para a base e a borda em escova no lado do lúmen. PAS ressalta mucinas e membrana basal.',
    suggested: 'pas' },
  connective: { name: 'Tecido conjuntivo frouxo', short: 'Conjuntivo', color: '#bf84a4',
    structure: 'Fibras colágenas onduladas, fibroblastos fusiformes, matriz extracelular e pequenos vasos entre as fibras.',
    function: 'Sustenta e conecta estruturas, oferece vias para vasos e participa da nutrição e reparação dos tecidos.',
    recognition: 'O tricrômico de Masson facilita distinguir fibras colágenas azuis de citoplasma vermelho. Observe núcleos alongados entre as fibras.',
    suggested: 'masson' },
  muscle: { name: 'Músculo estriado esquelético', short: 'Muscular', color: '#d0798f',
    structure: 'Fibras longas em corte longitudinal, com vários núcleos periféricos e estriações transversais. Fibras ficam agrupadas em fascículos.',
    function: 'A contração de sarcômeros produz força e movimento. O tecido conjuntivo distribui forças entre as fibras.',
    recognition: 'Busque fibras paralelas, núcleos periféricos e bandas regulares. Aumente a objetiva para separar faixas individuais.',
    suggested: 'he' },
  nervous: { name: 'Tecido nervoso', short: 'Nervoso', color: '#ae8cbe',
    structure: 'Neurônios multipolares com soma, dendritos e axônio. A glia ocupa espaços entre os corpos celulares e prolongamentos.',
    function: 'Neurônios recebem e transmitem sinais. Células da glia ajudam a manter o meio, ofertam suporte e exercem funções especializadas.',
    recognition: 'Localize corpos neuronais maiores e núcleos menores de células gliais. Parte dos prolongamentos sai do plano do corte.',
    suggested: 'he' },
  bacteria: { name: 'Esfregaço bacteriano misto', short: 'Bactérias', color: '#b28be0',
    structure: 'Mistura didática de cocos e bacilos. Há exemplos Gram-positivos e Gram-negativos, representados por cor após a técnica completa.',
    function: 'A reação de Gram reflete diferenças nas envoltórias celulares. A forma, a reação de Gram e o arranjo ajudam na descrição microscópica.',
    recognition: 'Use as lentes 100× ou 1000× com óleo de imersão. Observe cocos arredondados e bacilos alongados separando cor e forma.',
    suggested: 'gram' },
  blood: { name: 'Sangue periférico humano (Esfregaço)', short: 'Sangue (Hematologia)', color: '#e07a94',
    structure: 'Hemácias (eritrócitos anucleados bicôncavos ~7,5 μm com palidez central) intercaladas por leucócitos nucleados (neutrófilos multilobulados, linfócitos, monócitos) e agrupamentos de plaquetas (~2 μm).',
    function: 'Hemácias transportam O₂ via hemoglobina; neutrófilos e linfócitos coordenam a defesa imune; plaquetas atuam na coagulação.',
    recognition: 'Use 40×, 100× ou 1000× com óleo de imersão: identifique neutrófilos com 3–5 lóbulos nucleares conectados por filamentos finos entre as hemácias rosadas.',
    suggested: 'giemsa' },
  leaf: { name: 'Folha vegetal · Epiderme e estômatos', short: 'Folha & Estômatos', color: '#6ec47e',
    structure: 'Células epidérmicas sinuosas em quebra-cabeça sem espaços intercelulares, pares de células-guarda reniformes ricas em cloroplastos delimitando o ostíolo e vasos xilemáticos espiralados em plano profundo.',
    function: 'Os estômatos regulam as trocas gasosas (CO₂ / O₂) e a transpiração foliar por variação de turgor (K⁺ e H₂O).',
    recognition: 'Localize os pares de células-guarda em formato de feijão com cloroplastos esverdeados e a fenda estomática (ostíolo) central.',
    suggested: 'botany' },
  cartilage: { name: 'Cartilagem hialina (Traqueia)', short: 'Cartilagem hialina', color: '#9c8fd6',
    structure: 'Matriz extracelular homogênea basófila rica em colágeno tipo II e proteoglicanos, contendo condrócitos alojados em lacunas frequentemente reunidos em grupos isógenos (pares/quartetos) cercados por matriz territorial mais intensa.',
    function: 'Suporte estrutural flexível e absorção de impacto nas vias aéreas (anéis traqueais) e superfícies articulares.',
    recognition: 'Procure pares e quartetos de condrócitos (grupos isógenos) dentro de lacunas claras rodeadas por halo basófilo (matriz territorial).',
    suggested: 'he' },
  liver: { name: 'Fígado · Lóbulo hepático', short: 'Fígado (Hepatócitos)', color: '#c87296',
    structure: 'Cordões radiais de hepatócitos poliédricos (muitos binucleados e ricos em grânulos de glicogênio PAS+) convergindo para a veia centrolobular, separados por capilares sinusoides com hemácias e células de Kupffer.',
    function: 'Metabolismo de carboidratos/lipídios, desintoxicação xenobiótica, produção de bile e síntese de proteínas plasmáticas.',
    recognition: 'Identifique a veia centrolobular ampla e os cordões de hepatócitos poliédricos com um ou dois núcleos arredondados de nucléolo evidente.',
    suggested: 'he' },
  ...Object.fromEntries(Object.entries(insectTissues).map(([id, tissue]) => [id, { ...tissue, suggested: 'he' }]))
};

export const stains = {
  historesin: {
    name: 'Historesina (Leica) · Azul de Toluidina / Bromofenol',
    short: 'Historesina · Azul',
    info: 'Protocolo entomológico completo em resina plástica (HEMA) com corte em navalha de vidro triangular (2–3 μm) e coloração em cuba com Azul de Toluidina 1% / Bromofenol, evidenciando núcleos, proteínas e fibras em gradientes de azul.'
  },
  he: { name: 'H&E · Hematoxilina e eosina', short: 'H&E', info: 'A hemateína associada a um mordente cora estruturas basófilas, ricas em ácidos nucleicos, de azul-arroxeado. A eosina aniônica cora proteínas acidófilas do citoplasma e da matriz em rosa.' },
  pas: { name: 'PAS · Ácido periódico–Schiff', short: 'PAS', info: 'O ácido periódico oxida certos grupos de carboidratos e gera aldeídos. O reagente de Schiff evidencia grupos reativos em magenta. Destacam-se mucinas neutras, glicogênio e membranas basais.' },
  masson: { name: 'Tricrômico de Masson', short: 'Masson', info: 'Neste protocolo, o colágeno aparece azul. Citoplasma e fibras musculares ficam avermelhados. Os núcleos são escuros.' },
  gram: { name: 'Gram', short: 'Gram', info: 'Após cristal violeta e Lugol, a diferenciação pelo álcool-acetona remove o complexo de muitas bactérias Gram-negativas. A contracoloração com safranina torna essas bactérias rosadas.' },
  giemsa: { name: 'Panótico / Giemsa (Hematologia)', short: 'Giemsa', info: 'Coloração hematológica Romanowsky (eosina + azul de metileno/azures): hemácias coram em rosa-salmão, núcleos leucocitários em violeta intenso e plaquetas em lilás granular.' },
  botany: { name: 'Botânica · Clorofila & Safranina', short: 'Botânica', info: 'Evidencia paredes celulares celulósicas, cloroplastos naturais verdes nas células-guarda e lignina dos vasos xilemáticos espiralados.' },
  fresh: { name: 'Sem coloração · A fresco', short: 'A fresco', info: 'A preparação úmida preserva o aspecto translúcido. Reduzir moderadamente a abertura da íris melhora o contraste em campo claro, com perda de resolução se a abertura ficar muito pequena.' }
};

export const tissueOptions = Object.fromEntries(Object.entries(tissues).map(([key, value]) => [key, value.name]));
export const stainOptions = Object.fromEntries(Object.entries(stains).map(([key, value]) => [key, value.name]));
export const readySlides = {
  bee: { tissue: 'bee', stain: 'historesin', thickness: 3 },
  blood: { tissue: 'blood', stain: 'giemsa', thickness: 2 },
  leaf: { tissue: 'leaf', stain: 'botany', thickness: 6 },
  cartilage: { tissue: 'cartilage', stain: 'he', thickness: 5 },
  liver: { tissue: 'liver', stain: 'he', thickness: 5 },
  epithelial: { tissue: 'epithelial', stain: 'pas', thickness: 5 },
  connective: { tissue: 'connective', stain: 'masson', thickness: 5 },
  muscle: { tissue: 'muscle', stain: 'he', thickness: 5 },
  nervous: { tissue: 'nervous', stain: 'he', thickness: 5 },
  bacteria: { tissue: 'bacteria', stain: 'gram', thickness: 1 },
  fresh: { tissue: 'epithelial', stain: 'fresh', thickness: 8 },
  ...Object.fromEntries(Object.keys(insectTissues).map(tissue => [tissue, { tissue, stain: 'he', thickness: 5 }]))
};

export function compatibleStains(tissue) {
  const ids = tissue === 'bacteria' ? ['gram', 'fresh']
    : tissue === 'blood' ? ['giemsa', 'he', 'fresh']
    : tissue === 'leaf' ? ['botany', 'historesin', 'fresh']
    : tissue === 'bee' ? ['historesin', 'he', 'pas', 'fresh']
    : Object.hasOwn(insectTissues, tissue) ? ['he', 'pas', 'fresh']
    : ['he', 'pas', 'masson', 'fresh'];
  return Object.fromEntries(ids.map(key => [key, stains[key].name]));
}
