import * as T from 'three';
import { v } from '../core/geometry.js';
import { tissues, stains, tissueOptions, compatibleStains } from '../data/tissues.js?v=22';
import { paintPreview, onBeePhotoLoad } from '../core/histofield.js?v=22';
import { buildHistologyBench } from './histologyBench3d.js?v=19';
import { node, button, select, range, heading, card, note, row, showTooltip, hideTooltip } from '../core/ui.js?v=9';

// Detailed laboratory step catalog with authentic reagents, concentrations, immersion times and drying requirements
const steps = {
  // === TUTORIAL COMPLETO DA ABELHA EM HISTORESINA (LEICA) — 20 ETAPAS ===
  bee_capture: {
    title: 'Capturar a abelha no favo (placa de Petri)',
    desc: 'Selecione uma abelha operária íntegra diretamente do favo acomodado em placa de Petri de vidro. Evite esmagar o abdome para preservar o ventrículo, o vaso dorsal (coração) e a musculatura torácica.',
    view: 'lupa', color: '#e6b85c',
    reagent: 'Abelha operária (Apis / Meliponini)', conc: 'Coleta viva íntegra', time: 'Imediato', dry: 'Não · Manter em Petri tampada', needsDry: false
  },
  bee_freeze: {
    title: 'Congelar a abelha (crioeutanásia em gelo)',
    desc: 'Resfrie a abelha em freezer (−20 °C) ou câmara de gelo por 3 a 5 minutos até completa imobilização. O frio anestesia e reduz a atividade enzimática autolítica antes da abertura do exoesqueleto.',
    view: 'lupa', color: '#8ee8ff',
    reagent: 'Bandeja de gelo / Freezer', conc: '−20 °C (crioeutanásia)', time: '3 a 5 min', dry: 'Não · Manter resfriada (sem congelar demais)', needsDry: false
  },
  bee_dissect: {
    title: 'Dissecar na lupa sobre cera vermelha com pinça',
    desc: 'Acomode a abelha sobre a placa de cera vermelha sob o estereomicroscópio (Lupa 01) em gota de solução salina 0,9%. Com duas pinças entomológicas finas, puxe suavemente o último tergito abdominal para expor o ventrículo, túbulos de Malpighi, vaso dorsal (coração) e musculatura.',
    view: 'lupa', color: '#d8cf4a',
    reagent: 'Solução salina fisiológica (NaCl / PBS)', conc: '0,9% isotônica sobre cera vermelha', time: '5 a 10 min', dry: 'Não · Manter o órgão sempre submerso', needsDry: false
  },
  bee_fix: {
    title: 'Fixar o órgão em Paraformaldeído / Formol 4%',
    desc: 'Transfira imediatamente o órgão dissecado com a pinça para frasco âmbar contendo paraformaldeído (PFA) tamponado 4%. A fixação forma pontes cruzadas nas proteínas e bloqueia a degradação tecidual.',
    view: 'baths', color: '#6fd6c4',
    reagent: 'Paraformaldeído (PFA) em tampão PBS', conc: '4% (pH 7,2 · 0,1 M)', time: '24 horas (4 °C)', dry: 'Não · Frasco âmbar bem vedado', needsDry: false
  },
  bee_wash: {
    title: 'Lavar o excesso de fixador em tampão PBS',
    desc: 'Realize três trocas sucessivas em tampão fosfato salino (PBS 0,1 M) para remover resíduos de aldeído livre que interfeririam na polimerização da resina e nas etapas de coloração.',
    view: 'baths', color: '#8be0df',
    reagent: 'Tampão Fosfato Salino (PBS)', conc: '0,1 M (pH 7,2 · 3 banhos)', time: '3 × 15 min (45 min)', dry: 'Não · Escorrer suavemente entre trocas', needsDry: false
  },
  bee_eth70: {
    title: 'Desidratar em Álcool 70%',
    desc: 'Inicie a desidratação gradual em etanol 70%. A entrada progressiva de álcool evita retração abrupta das células epiteliais e enrugamento das fibras musculares.',
    view: 'baths', color: '#62b2eb',
    reagent: 'Etanol (álcool etílico P.A.)', conc: '70% (v/v em H₂O dest.)', time: '20 a 30 min', dry: 'Não · Manter submerso', needsDry: false
  },
  bee_eth8090: {
    title: 'Desidratar em Álcool 80% → 90%',
    desc: 'Avance a bateria crescente passando o tecido pelo etanol 80% e, em seguida, pelo etanol 90%, removendo a maior fração da água intracelular com máxima preservação morfológica.',
    view: 'baths', color: '#4d9ee8',
    reagent: 'Etanol graduado', conc: '80% → 90% (v/v)', time: '2 × 20 min (40 min)', dry: 'Não · Trocar frasco sem ressecar', needsDry: false
  },
  bee_eth100: {
    title: 'Desidratação final em Álcool 95% → 100%',
    desc: 'Complete a retirada de água em etanol 95% e duas passagens em álcool absoluto (100%). Diferente da parafina, a Historesina dispensa xilol porque o monômero HEMA é miscível diretamente em etanol.',
    view: 'baths', color: '#3b88f2',
    reagent: 'Etanol 95% → Etanol absoluto', conc: '95% (1×) → 100% (2×)', time: '3 × 20 min (60 min)', dry: 'Não · Ambiente anidro tampado', needsDry: false
  },
  bee_preinfil: {
    title: 'Pré-infiltração (Álcool 95% + Historesina 1:1)',
    desc: 'Mergulhe o tecido na mistura em partes iguais (1:1) de etanol 95% com solução de infiltração Leica Historesin®. Essa transição reduz a viscosidade inicial e facilita a penetração na cutícula.',
    view: 'baths', color: '#b492e0',
    reagent: 'Etanol 95% + Leica Historesin® base', conc: 'Proporção 1 : 1 (50% / 50%)', time: '2 a 4 horas', dry: 'Não · Agitação suave à temp. ambiente', needsDry: false
  },
  bee_infil: {
    title: 'Infiltração em Historesina pura (Leica)',
    desc: 'Transfira a peça para solução de infiltração Leica Historesin® pura (resina básica + ativador em pó). O monômero acrílico preenche cada cavidade celular e espaços intercelulares.',
    view: 'baths', color: '#e6b85c',
    reagent: 'Leica Historesin® (infiltração)', conc: '100% pura (ativada)', time: '12 a 24 h (4 °C)', dry: 'Não · Proteger da luz (frasco âmbar)', needsDry: false
  },
  bee_mold: {
    title: 'Incluir no molde de 9 poços + Hardener (15:1)',
    desc: 'Prepare a mistura de inclusão (15 partes de resina de infiltração : 1 parte de Leica HISTORESIN™ Hardener). Posicione o órgão orientado no fundo do molde branco de 9 poços e aguarde polimerização rígida.',
    view: 'baths', color: '#f0c975',
    reagent: 'Historesin® + Hardener (Leica)', conc: '15 : 1 (ex.: 15 mL : 1 mL)', time: '24 h polimerização', dry: 'SIM · Curar em estufa/ambiente seco até endurecer', needsDry: true
  },
  bee_wood: {
    title: 'Colar bloco de resina no suporte de madeira + ID',
    desc: 'Desenforme o bloco translúcido de resina, apare o excesso em formato trapezoidal e cole-o sobre um cubo de madeira identificado com fita de papel e código do experimento (ex.: ID 92).',
    view: 'baths', color: '#d99e62',
    reagent: 'Cubo de madeira + cola cianoacrilato', conc: 'Orientação axial · Etiqueta ID', time: '15 a 30 min', dry: 'SIM · Aguardar secagem completa da cola', needsDry: true
  },
  bee_section: {
    title: 'Cortar no micrótomo com navalha de vidro triangular',
    desc: 'Prenda o suporte de madeira no cabeçote do micrótomo e instale a navalha de vidro triangular (Ralph/vidro lapidado). Gire a manivela para gerar películas ultrafinas translúcidas de 2 a 3 μm na borda da navalha!',
    view: 'micro', color: '#8ee8ff',
    reagent: 'Navalha de vidro triangular (45°)', conc: 'Corte ultrafino · 2 a 3 μm', time: 'Cortes seriados (manual)', dry: 'Arraste a manivela 3D ou clique no botão', needsDry: false
  },
  bee_pickup_cup: {
    title: 'Pegar a película do corte com pinça e colocar na água (copo preto)',
    desc: 'Com a pinça fina de aço inox, retire delicadamente a película translúcida de Historesina recém-cortada da borda da navalha de vidro triangular e deposite-a sobre a água destilada no copo preto de alto contraste. A tensão superficial da água desfaz dobras e estica o corte.',
    view: 'micro', color: '#7ee3f5',
    reagent: 'Pinça fina + Água destilada (copo preto)', conc: 'Distensão por tensão superficial', time: '15 a 30 s por corte', dry: 'Não · Flutuar delicadamente sem dobrar', needsDry: false
  },
  bee_fish_slide: {
    title: 'Pescar a película distendida da água (copo preto) para a lâmina',
    desc: 'Com as películas já perfeitamente lisas e visíveis contra o fundo preto da água, mergulhe a lâmina de vidro limpa em ângulo (~30°) no copo preto e guie os cortes com a pinça para depositá-los na lâmina identificada a lápis.',
    view: 'micro', color: '#a4dce6',
    reagent: 'Lâmina de vidro limpa + Pinça fina', conc: 'Pesca no copo preto · 3 cortes/lâmina', time: '1 a 2 min', dry: 'Escorrer excesso e levar à placa aquecedora', needsDry: false
  },
  bee_stretch: {
    title: 'Secar e aderir a lâmina na placa aquecedora (45–50 °C)',
    desc: 'Posicione a lâmina com os cortes pescados do copo preto sobre a placa aquecedora (45–50 °C) até evaporar toda a água residual, garantindo aderência firme dos cortes de Historesina ao vidro.',
    view: 'water', color: '#ff9c63',
    reagent: 'Placa aquecedora digital', conc: '45 a 50 °C (adesão térmica)', time: '15 a 30 min', dry: 'SIM · Secar totalmente na placa para aderir', needsDry: true
  },
  bee_filter: {
    title: 'Filtrar o corante no funil (frascos em papel alumínio)',
    desc: 'Antes de corar, filtre o corante armazenado em frasco revestido com papel alumínio (protegido da fotodegradação) usando funil de vidro com papel de filtro pregueado sobre Erlenmeyer, evitando precipitados sobre o corte.',
    view: 'stain', color: '#a87ce8',
    reagent: 'Corante estoque + papel de filtro', conc: 'Filtração 100% livre de cristais', time: '5 min preparo', dry: 'Não · Guardar frascos em papel alumínio', needsDry: false
  },
  bee_stain: {
    title: 'Corar na cuba de vidro (Azul de Toluidina / Bromofenol)',
    desc: 'Mergulhe a lâmina verticalmente na cuba de vidro ranhurada contendo Azul de Toluidina 1% (pH 4,0) ou Azul de Bromofenol mercúrico. Enxágue rapidamente em água destilada para diferenciar os tons de azul nas fibras e núcleos.',
    view: 'stain', color: '#3d82d6',
    reagent: 'Azul de Toluidina / Mercúrio de Bromofenol', conc: '1% aquoso (pH 4,0) + enxágue H₂O', time: '5 a 10 min + lavagem', dry: 'Escorrer excesso na borda da cuba', needsDry: false
  },
  bee_dry: {
    title: 'Secar a lâmina sobre papel toalha absorvente',
    desc: 'Apoie a lâmina corada horizontalmente sobre papel toalha branco absorvente (ou estufa a 37 °C). Observe os 3 cortes azulados nítidos: a lâmina precisa atingir 0% de umidade antes da resina de montagem para não turvar!',
    view: 'stain', color: '#a8d6f0',
    reagent: 'Papel toalha branco absorvente', conc: 'Ambiente ou estufa 37 °C', time: '15 a 20 min', dry: 'SIM · Secagem obrigatória (0% água!)', needsDry: true
  },
  bee_cover: {
    title: 'Montar a lamínula (Entellan® + descida a 45° + cura)',
    desc: 'Pingue 1 gota de resina de montagem (Entellan® / Bálsamo do Canadá) sobre os cortes secos. Apoie a borda esquerda da lamínula de vidro (0,17 mm) a 45° e abaixe-a lentamente com agulha histológica para expulsar qualquer bolha de ar.',
    view: 'stain', color: '#e5d49c',
    reagent: 'Entellan® / Bálsamo + lamínula 0,17 mm', conc: '1 gota · Descida em ângulo 45°', time: '24 h cura horizontal', dry: 'SIM · Secar horizontal sem deslocar', needsDry: true
  },

  // === ETAPAS CLÁSSICAS EM PARAFINA (EXPANDIDAS COM CONCENTRAÇÕES & LAMÍNULA) ===
  fix: {
    title: 'Fixar em formol tamponado a 10%',
    desc: 'Imersão imediata do fragmento de tecido em formaldeído tamponado 10% (pH 7,2) para estabilizar proteínas e interromper a autólise mantendo a citoarquitetura intacta.',
    view: 'baths', color: '#78c9c2',
    reagent: 'Formol neutro tamponado', conc: '10% (pH 7,2)', time: '12 a 24 horas', dry: 'Não · Frasco âmbar tampado', needsDry: false
  },
  eth70: {
    title: 'Desidratar em Álcool 70% → 80%',
    desc: 'Banhos graduais de etanol removem lentamente a água do tecido sem provocar retração osmótica brusca das células e fibras.',
    view: 'baths', color: '#62b2eb',
    reagent: 'Etanol graduado', conc: '70% → 80% (v/v)', time: '2 × 45 min', dry: 'Não · Trocar com pinça', needsDry: false
  },
  eth100: {
    title: 'Desidratar em Álcool 95% → 100%',
    desc: 'Finaliza a desidratação com etanol 95% seguido por duas passagens em álcool absoluto (100%), garantindo tecido totalmente anidro para aceitar o clarificante.',
    view: 'baths', color: '#4298f5',
    reagent: 'Etanol 95% → Absoluto', conc: '95% (1×) → 100% (2×)', time: '3 × 45 min', dry: 'Não · Manter vedado', needsDry: false
  },
  clear: {
    title: 'Diafanizar / clarificar em Xilol 100%',
    desc: 'O xilol (xileno) substitui o álcool absoluto e torna o fragmento translúcido (diafanizado), atuando como solvente intermediário totalmente miscível com a parafina líquida.',
    view: 'baths', color: '#b49cd9',
    reagent: 'Xilol (Xileno P.A.)', conc: '100% (2 banhos)', time: '2 × 30 min', dry: 'Não · Trabalhar na capela', needsDry: false
  },
  embed: {
    title: 'Infiltrar e incluir em Parafina a 58 °C',
    desc: 'A parafina fundida (58–60 °C) infiltra o tecido clarificado. Em seguida o fragmento é orientado no cassete e resfriado sobre placa fria formando um bloco sólido para microtomia.',
    view: 'micro', color: '#e6c88a',
    reagent: 'Parafina histológica purificada', conc: '100% fundida a 58–60 °C', time: '2 h infiltração + resfriamento', dry: 'SIM · Solidificar a 4 °C antes do corte', needsDry: true
  },
  section: {
    title: 'Girar a manivela e fatiar (navalha de aço)',
    desc: 'Com o bloco de parafina fixado no micrótomo rotativo, gire a manivela para avançar o bloco contra a navalha descartável de aço inoxidável, gerando uma fita contínua de 5 μm.',
    view: 'micro', color: '#eedcb0',
    reagent: 'Navalha de aço descartável', conc: 'Corte seriado · 5 μm', time: 'Cortes contínuos', dry: 'Arraste a manivela 3D ou clique no botão', needsDry: false
  },
  bath: {
    title: 'Estender a fita no banho-maria (45 °C)',
    desc: 'Flutue a fita translúcida de parafina sobre o banho-maria aquecido (~45 °C, abaixo do ponto de fusão da parafina). O calor relaxa e alisa dobras e pregas do corte.',
    view: 'water', color: '#6ac3d4',
    reagent: 'Banho-maria com água destilada', conc: '42 a 45 °C', time: '1 a 2 min (até estender)', dry: 'Não · Evitar bolhas sob o corte', needsDry: false
  },
  collect: {
    title: 'Pescar o corte na lâmina de vidro',
    desc: 'Mergulhe a lâmina silanizada em ângulo sob a fita estendida no banho-maria e pesque delicadamente os cortes seriados, deixando escorrer o excesso de água.',
    view: 'water', color: '#a4dce6',
    reagent: 'Lâmina de vidro com ponta fosca', conc: 'Pesca a 30° no banho-maria', time: '1 min', dry: 'Escorrer verticalmente antes da placa', needsDry: false
  },
  hotplateDry: {
    title: 'Secar e aderir na placa aquecedora (58 °C)',
    desc: 'Posicione a lâmina sobre a placa aquecedora ou em estufa a 58 °C para evaporar toda a água residual e promover firme aderência do corte ao vidro antes da coloração.',
    view: 'water', color: '#ff9c63',
    reagent: 'Placa aquecedora / Estufa', conc: '56 a 58 °C', time: '30 a 60 min', dry: 'SIM · Secagem térmica obrigatória', needsDry: true
  },
  dewax: {
    title: 'Desparafinizar (Xilol) e reidratar (Álcoois)',
    desc: 'Remova a parafina em 2 banhos de xilol (100%) e reidrate o corte em bateria decrescente de etanol (100% → 95% → 70% → H₂O) para que os corantes aquosos penetrem no tecido.',
    view: 'stain', color: '#94c9d4',
    reagent: 'Xilol (2×) → Etanol 100→70% → H₂O', conc: 'Gradiente decrescente', time: '25 min total', dry: 'Não · Nunca deixar secar entre banhos!', needsDry: false
  },
  filterStain: {
    title: 'Filtrar corantes no funil (protegidos em alumínio)',
    desc: 'Filtre a solução corante (retirada do frasco envolvido em papel alumínio contra luz) por papel de filtro em funil de vidro antes de abastecer a cuba de coloração, eliminando grumos oxidados.',
    view: 'stain', color: '#a87ce8',
    reagent: 'Corante estoque + papel de filtro', conc: 'Filtração pré-coloração', time: '3 a 5 min', dry: 'Não · Manter frascos longe da luz', needsDry: false
  },
  hematox: {
    title: 'Corar núcleos na cuba (Hematoxilina de Harris)',
    desc: 'Mergulhe a lâmina na cuba de vidro com Hematoxilina de Harris (corante catiônico com mordente metálico) e lave em água corrente (azulejamento) para evidenciar núcleos basófilos em roxo-azulado.',
    view: 'stain', color: '#623a8a',
    reagent: 'Hematoxilina de Harris + lavagem H₂O', conc: '0,5% + água corrente 5 min', time: '3 a 5 min na cuba', dry: 'Não · Lavar até azulejar', needsDry: false
  },
  eosin: {
    title: 'Contracorar citoplasma na cuba (Eosina Y)',
    desc: 'Imersão na cuba com Eosina Y alcoólica/aquosa (armazenada em frasco com papel alumínio). O corante aniônico liga-se a proteínas citoplasmáticas e colágeno em tons de rosa.',
    view: 'stain', color: '#e3779b',
    reagent: 'Eosina Y (acidófila)', conc: '0,5% a 1% (pH ~5,0)', time: '1 a 3 min na cuba', dry: 'Não · Seguir para desidratação rápida', needsDry: false
  },
  oxidize: {
    title: 'Oxidar carboidratos (Ácido Periódico 0,5%)',
    desc: 'A solução de ácido periódico oxida ligações glicol (1,2-glicóis) de polissacarídeos, mucinas e membranas basais, convertendo-as em grupos aldeído reativos.',
    view: 'stain', color: '#d2c2e0',
    reagent: 'Ácido Periódico (HIO₄)', conc: '0,5% a 1% aquoso', time: '5 a 10 min + lavagem H₂O', dry: 'Não · Enxaguar bem em água dest.', needsDry: false
  },
  schiff: {
    title: 'Aplicar Reagente de Schiff (frasco em alumínio)',
    desc: 'O Reagente de Schiff (fotossensível — mantido sob papel alumínio e geladeira) reage com os aldeídos gerados e produz coloração magenta intensa em mucinas e glicogênio.',
    view: 'stain', color: '#cf2b84',
    reagent: 'Reagente de Schiff (fucsina sulfurosa)', conc: 'Solução pronta (4 °C, escuro)', time: '15 min + lavagem 5 min', dry: 'Não · Proteger da luz durante reação', needsDry: false
  },
  pasCounter: {
    title: 'Contracorar núcleos com Hematoxilina',
    desc: 'Breve passagem em hematoxilina de Mayer/Harris destaca os núcleos em azul-arroxeado sem mascarar os depósitos PAS-positivos em magenta.',
    view: 'stain', color: '#63438f',
    reagent: 'Hematoxilina de Mayer', conc: '0,1% + lavagem H₂O', time: '1 a 2 min', dry: 'Não · Enxaguar em água corrente', needsDry: false
  },
  massNuc: {
    title: 'Corar núcleos com Hematoxilina Férrica de Weigert',
    desc: 'A hematoxilina férrica é resistente aos corantes ácidos subsequentes do tricrômico e marca os núcleos celulares em castanho-enegrecido muito estável.',
    view: 'stain', color: '#4a3559',
    reagent: 'Hematoxilina Férrica de Weigert', conc: 'Solução A + B (1:1 fresca)', time: '10 min + lavagem H₂O', dry: 'Não · Lavar em água corrente', needsDry: false
  },
  massRed: {
    title: 'Corar citoplasma e músculo (Ponceau-Fucsina)',
    desc: 'A mistura ácida de Escarlate de Biebrich e Fucsina Ácida marca citoplasma, fibras musculares e queratina em vermelho-vivo.',
    view: 'stain', color: '#d14b6a',
    reagent: 'Escarlate de Biebrich + Fucsina Ácida', conc: '1% em ácido acético 1%', time: '5 a 10 min', dry: 'Não · Diferenciar em ác. fosfomolíbdico', needsDry: false
  },
  massBlue: {
    title: 'Diferenciar e corar colágeno (Azul de Anilina)',
    desc: 'Após ácido fosfomolíbdico/fosfotúngstico 5%, o Azul de Anilina liga-se seletivamente às fibras colágenas em azul intenso, contrastando com o músculo vermelho.',
    view: 'stain', color: '#4776c4',
    reagent: 'Ác. fosfomolíbdico 5% → Azul de Anilina', conc: '2,5% em ác. acético 2%', time: '5 min + lavagem ác. acético 1%', dry: 'Não · Seguir direto à desidratação', needsDry: false
  },

  // === CRIAÇÃO / MONTAGEM MULTI-ETAPAS DA LAMÍNULA (CLÁSSICO) ===
  mountDehyd: {
    title: 'Desidratar pós-coloração, xilol e secar bordas',
    desc: 'Passe a lâmina corada por etanol crescente (70% → 95% → 100%) e dois banhos de xilol (100%) para diafanizar. Apoie sobre papel toalha absorvente para secar o verso e as bordas sem ressecar o corte.',
    view: 'stain', color: '#b4d8e8',
    reagent: 'Etanol 70→100% + Xilol + Papel toalha', conc: '100% anidro antes da resina', time: '6 a 8 min total', dry: 'SIM · Limpar verso no papel (sem secar corte!)', needsDry: true
  },
  mountResin: {
    title: 'Aplicar gota de meio de montagem (Entellan®/Bálsamo)',
    desc: 'Com pipeta ou bastão de vidro, deposite 1 a 2 gotas calibradas de resina sintética (Entellan® ou Bálsamo do Canadá, índice de refração n = 1,52 igual ao vidro) exatamente no centro do corte.',
    view: 'stain', color: '#f2dd96',
    reagent: 'Entellan® / Bálsamo do Canadá', conc: '1 a 2 gotas (nD = 1,52)', time: 'Imediato (antes de evaporar xilol)', dry: 'Não · Evitar excesso nas bordas', needsDry: false
  },
  mountCover: {
    title: 'Baixar a lamínula a 45° (sem bolhas) e curar',
    desc: 'Encoste a borda esquerda da lamínula limpa (0,17 mm) na gota de resina formando 45° e abaixe-a suavemente até selar o corte sem bolhas de ar. Deixe secar na horizontal.',
    view: 'stain', color: '#e5d49c',
    reagent: 'Lamínula borossilicato 24×50 mm (0,17 mm)', conc: 'Ângulo 45° → 0° (selagem permanente)', time: '24 h cura horizontal', dry: 'SIM · Secar horizontal para fixar lamínula', needsDry: true
  },

  // === GRAM ===
  smear: {
    title: 'Distribuir o esfregaço bacteriano e secar ao ar',
    desc: 'Espalhe uma película fina e homogênea da suspensão bacteriana sobre a lâmina desengordurada e deixe secar completamente ao ar antes de fixar.',
    view: 'water', color: '#c8c4b8',
    reagent: 'Suspensão bacteriana + Salina 0,9%', conc: 'Película fina (~1 μm)', time: '5 a 10 min', dry: 'SIM · Secar totalmente ao ar ambiente', needsDry: true
  },
  smearFix: {
    title: 'Fixar o esfregaço (calor suave / metanol)',
    desc: 'Passe a lâmina seca rapidamente sobre calor suave (ou placa a 55 °C / metanol 100%) para aderir as bactérias ao vidro sem romper suas paredes celulares.',
    view: 'water', color: '#ff9c63',
    reagent: 'Calor brando (placa) ou Metanol', conc: '55 °C (ou Metanol 100% 1 min)', time: '1 min', dry: 'SIM · Esfriar antes de corar', needsDry: true
  },
  violet: {
    title: 'Aplicar Cristal Violeta 1% (corante primário)',
    desc: 'Cubra o esfregaço fixado com Cristal Violeta. Tanto bactérias Gram-positivas quanto Gram-negativas absorvem o corante e tornam-se roxas nesta etapa.',
    view: 'stain', color: '#6a339c',
    reagent: 'Cristal Violeta (Hucker)', conc: '1% aquoso/alcoólico', time: '1 min + enxágue suave H₂O', dry: 'Não · Escorrer excesso', needsDry: false
  },
  iodine: {
    title: 'Aplicar Lugol 1% (mordente de iodo)',
    desc: 'O iodo do Lugol forma um complexo macromolecular insolúvel Cristal Violeta–Iodo (CV–I) retido na espessa malha de peptidoglicano das Gram-positivas.',
    view: 'stain', color: '#b88337',
    reagent: 'Solução de Lugol (I₂ + KI)', conc: '1% (mordente)', time: '1 min + enxágue H₂O', dry: 'Não', needsDry: false
  },
  decolor: {
    title: 'Diferenciar com Álcool-Acetona (etapa crítica)',
    desc: 'Goteje álcool-acetona rapidamente (10–15 s) e lave imediatamente em água! A membrana lipídica externa das Gram-negativas se dissolve e perde o roxo; Gram-positivas retêm o complexo.',
    view: 'stain', color: '#a0c8d9',
    reagent: 'Álcool Etílico + Acetona', conc: '1 : 1 (ou Etanol 95%)', time: '10 a 15 segundos! + H₂O', dry: 'Não · Parar imediatamente com água', needsDry: false
  },
  safranin: {
    title: 'Contracorar com Safranina 0,5% (ou Fucsina)',
    desc: 'A safranina cora em rosa-avermelhado as bactérias Gram-negativas descoradas, enquanto as Gram-positivas mantêm o roxo intenso.',
    view: 'stain', color: '#de5b88',
    reagent: 'Safranina O', conc: '0,5% aquosa', time: '30 a 45 s + enxágue H₂O', dry: 'Não · Seguir para secagem no papel', needsDry: false
  },
  gramFinish: {
    title: 'Secar sobre papel absorvente (pronto p/ óleo 100×/1000×)',
    desc: 'Encoste delicadamente a lâmina em papel toalha branco absorvente (sem esfregar!) e aguarde secar ao ar. Esfregaços de Gram são observados sem lamínula, direto sob gota de óleo de imersão em 100× ou 1000×.',
    view: 'stain', color: '#9462bd',
    reagent: 'Papel absorvente branco (secagem)', conc: '0% umidade (pronto p/ óleo)', time: '3 a 5 min', dry: 'SIM · Secar sem esfregar antes do óleo', needsDry: true
  },

  // === A FRESCO (COM ETAPAS DETALHADAS DA LAMÍNULA) ===
  freshSection: {
    title: 'Depositar o fragmento fino na lâmina limpa',
    desc: 'Coloque a amostra fina (corte à mão livre ou raspado celular) no centro de uma lâmina de vidro previamente limpa com álcool 70% e livre de poeira.',
    view: 'water', color: '#c5d3bb',
    reagent: 'Lâmina limpa (Álcool 70%)', conc: 'Amostra viva/fresca (3–12 μm)', time: 'Imediato', dry: 'Não · Evitar ressecamento da amostra', needsDry: false
  },
  waterDrop: {
    title: 'Pingar gota de solução salina 0,9% / água',
    desc: 'Adicione 1 gota calibrada de salina isotônica (ou água destilada para tecidos vegetais) para manter a turgescência e igualar o índice de refração ao vidro.',
    view: 'stain', color: '#8bd4e0',
    reagent: 'Solução salina fisiológica (NaCl)', conc: '0,9% (1 gota ~30 μL)', time: 'Imediato', dry: 'Não · Meio úmido', needsDry: false
  },
  wetCover: {
    title: 'Baixar a lamínula a 45° para expulsar bolhas',
    desc: 'Encoste uma borda da lamínula de vidro (0,17 mm) na margem da gota em ângulo de 45° e abaixe lentamente com pinça/agulha para evitar bolhas de ar presas no campo.',
    view: 'stain', color: '#b8e0e6',
    reagent: 'Lamínula de vidro 0,17 mm', conc: 'Descida controlada 45° → 0°', time: 'Imediato', dry: 'Não · Sem bolhas', needsDry: false
  },
  wetBlot: {
    title: 'Enxugar excesso lateral com papel absorvente',
    desc: 'Encoste suavemente a ponta de um papel absorvente na borda externa da lamínula para drenar qualquer líquido excedente e estabilizar a lamínula sobre a platina do microscópio.',
    view: 'stain', color: '#9ee0e8',
    reagent: 'Papel toalha absorvente (bordas)', conc: 'Capilaridade lateral', time: '10 segundos', dry: 'SIM · Secar apenas o excesso fora da lamínula', needsDry: true
  }
};

const classical = ['fix', 'eth70', 'eth100', 'clear', 'embed', 'section', 'bath', 'collect', 'hotplateDry', 'dewax'];
const programs = {
  historesin: [
    'bee_capture', 'bee_freeze', 'bee_dissect', 'bee_fix', 'bee_wash',
    'bee_eth70', 'bee_eth8090', 'bee_eth100', 'bee_preinfil', 'bee_infil',
    'bee_mold', 'bee_wood', 'bee_section', 'bee_pickup_cup', 'bee_fish_slide',
    'bee_stretch', 'bee_filter', 'bee_stain', 'bee_dry', 'bee_cover'
  ],
  he: [...classical, 'filterStain', 'hematox', 'eosin', 'mountDehyd', 'mountResin', 'mountCover'],
  pas: [...classical, 'filterStain', 'oxidize', 'schiff', 'pasCounter', 'mountDehyd', 'mountResin', 'mountCover'],
  masson: [...classical, 'filterStain', 'massNuc', 'massRed', 'massBlue', 'mountDehyd', 'mountResin', 'mountCover'],
  gram: ['smear', 'smearFix', 'violet', 'iodine', 'decolor', 'safranin', 'gramFinish'],
  fresh: ['freshSection', 'waterDrop', 'wetCover', 'wetBlot']
};

const guideColors = {
  historesin: '#4b8fe0', he: '#d984a8', pas: '#df6eb0', masson: '#6f8ac7',
  gram: '#8152b0', fresh: '#c1ceb5', paraffin: '#e6d6b0'
};

const views = {
  general: ['Bancada inteira', [0.4, 7.1, 22.8], [-0.45, 1.05, 0.3]],
  lupa: ['Lupa 01 · Monitor & Abelha', [-5.15, 3.52, 6.28], [-6.78, 1.18, 0.32]],
  lupaMonitor: ['Monitor da Lupa (CCD)', [-5.42, 1.96, 1.88], [-5.84, 1.56, -0.88]],
  baths: ['Banhos & Historesina', [-2.85, 4.3, 7.65], [-3.55, 0.72, 1.05]],
  micro: ['Micrótomo RM2255 & Copo Preto', [2.12, 3.22, 6.08], [0.22, 1.12, 1.18]],
  water: ['Banho-maria & Placa', [3.75, 4.2, 6.85], [3.15, 0.56, 0.05]],
  stain: ['Coloração & Lamínula', [6.75, 4.15, 6.75], [6.28, 0.62, 0.52]]
};

export function histologyLab({ scene, lights, engine, toolbar, guide, label, overlay, viewport, tooltip, state, navigate, signal, audio, help }) {
  lights.rim.color.set('#7cd8eb');
  lights.rim.intensity = 1.68;
  lights.key.shadow.mapSize.set(2048, 2048);
  lights.key.shadow.camera.left = -11;
  lights.key.shadow.camera.right = 11;
  lights.key.shadow.camera.top = 7;
  lights.key.shadow.camera.bottom = -6;
  lights.key.shadow.camera.updateProjectionMatrix();
  scene.fog.density = 0.0072;

  const b = buildHistologyBench(scene);
  const draft = state.draft || { tissue: 'bee', stain: 'historesin', thickness: 3, cursor: 0, quick: false };
  if (!programs[draft.stain]) draft.stain = tissues[draft.tissue]?.suggested || 'historesin';
  state.draft = draft;

  const viewLabels = {
    lupa: label('Lupa 01 · Dissecção', b.lupaStation, v(0, 3.65, 0.2)),
    baths: label('Banhos & Historesina', b.rack, v(0, 2.08, 0.25)),
    micro: label('Micrótomo', b.micro, v(0.28, 2.94, 0.35)),
    water: label('Banho-maria & Placa', b.water, v(0, 0.95, 0.42)),
    stain: label('Coloração & Lamínula', b.stain, v(0, 2.05, 0.25))
  };

  const progress = node('progress', { 'aria-label': 'Etapas da preparação' });
  const protocolList = node('ol', { className: 'steps' });
  const reagentCard = node('div', { className: 'reagent-card' });
  const intro = node('div');
  const stateLine = node('p', { className: 'pill', role: 'status' });
  const prevBtn = button('◀ Anterior', stepBack, { className: 'quiet' });
  const action = button('', advance, { className: 'primary' });
  const send = button('Levar esta lâmina ao microscópio 3D', () => {
    if (draft.cursor !== program().length) return;
    state.saveSlide({ tissue: draft.tissue, stain: draft.stain, thickness: draft.thickness });
    audio.play('glass');
    navigate('microscopio');
  }, { className: 'primary' });

  const thickness = range('Espessura', 2, 12, 1, draft.thickness, value => {
    draft.thickness = value;
    updateUI();
  }, x => x + ' μm', { wheel: true });

  const tissueControl = select('Amostra', tissueOptions, draft.tissue, value => {
    draft.tissue = value;
    draft.stain = tissues[value].suggested;
    audio.play('click');
    reset();
  });
  const stainHost = node('div', { className: 'field' });
  const visual = node('canvas', { width: 390, height: 256 });
  const previewLabel = node('span');
  const preview = node('div', { className: 'bench-preview' }, visual, previewLabel);
  overlay.append(preview);

  let animation = null, time = 0, rotation = 0, crankDrag = null, activeView = 'general', hoveredKey = null;
  let patchTargetColor = new T.Color('#6ea8dc');
  let waveProgress = 1, cutCount = 98;

  const program = () => programs[draft.stain];
  const current = () => program()[draft.cursor];
  const done = key => program().indexOf(key) >= 0 && program().indexOf(key) < draft.cursor;
  const isMicrotomeStep = k => k === 'section' || k === 'bee_section';
  const isResinProtocol = () => draft.stain === 'historesin';

  function camera(id, instant = false) {
    if (!views[id]) return;
    activeView = id;
    const [, eye, center] = views[id];
    engine.view(eye, center, instant);
    for (const [key, entry] of Object.entries(viewLabels)) entry.enabled = id === 'general' || id === key;
  }

  function rebuildStains() {
    stainHost.replaceChildren(select('Protocolo', compatibleStains(draft.tissue), draft.stain, value => {
      draft.stain = value;
      audio.play('click');
      reset(false);
    }).element);
  }

  function defaultThickness() {
    if (draft.tissue === 'bacteria') return 1;
    if (draft.stain === 'historesin') return 3;
    if (draft.stain === 'fresh') return 8;
    return 5;
  }

  function reset(refresh = true) {
    draft.cursor = 0;
    draft.thickness = defaultThickness();
    rotation = 0;
    animation = null;
    waveProgress = 1;
    if (refresh) rebuildStains();
    if (draft.tissue !== 'bacteria') thickness.set(draft.thickness);
    camera(isResinProtocol() ? 'lupa' : 'general');
    updateUI();
  }

  function jumpTo(index) {
    draft.cursor = Math.max(0, Math.min(program().length, index));
    animation = null;
    waveProgress = 1;
    const key = current();
    camera(key ? steps[key].view : 'stain');
    audio.play('click');
    updateUI();
  }

  function stepBack() {
    if (draft.cursor <= 0) return;
    jumpTo(draft.cursor - 1);
  }

  function slideState() {
    if (draft.stain === 'historesin') {
      if (done('bee_stain')) return { stain: 'historesin', phase: 4 };
      if (done('bee_section')) return { stain: 'fresh', phase: 2 };
      return { stain: 'fresh', phase: 1 };
    }
    if (draft.stain === 'gram') {
      const phase = done('safranin') ? 4 : done('decolor') ? 3 : done('iodine') ? 2 : done('violet') ? 1 : 0;
      return { stain: phase ? 'gram' : 'fresh', phase };
    }
    if (draft.stain === 'he' && done('hematox')) return { stain: 'he', phase: done('eosin') ? 4 : 1 };
    if (draft.stain === 'pas' && done('schiff')) return { stain: 'pas', phase: done('pasCounter') ? 4 : 2 };
    if (draft.stain === 'masson' && done('massNuc')) return { stain: 'masson', phase: done('massBlue') ? 4 : done('massRed') ? 2 : 1 };
    return { stain: done('embed') && !done('dewax') ? 'paraffin' : 'fresh', phase: 4 };
  }

  function renderReagentCard(key, complete) {
    if (complete) {
      reagentCard.replaceChildren(
        node('div', { className: 'reagent-head' },
          node('span', { className: 'eyebrow' }, 'LÂMINA FINALIZADA'),
          node('span', { className: 'reagent-dry ok' }, 'Pronta para microscopia')),
        node('div', { className: 'reagent-grid' },
          node('div', {}, node('span', {}, 'Protocolo'), node('strong', {}, stains[draft.stain].short)),
          node('div', {}, node('span', {}, 'Espessura'), node('strong', {}, draft.thickness + ' μm')),
          node('div', {}, node('span', {}, 'Lamínula'), node('strong', {}, draft.stain === 'gram' ? 'Sem lamínula (óleo)' : 'Vidro 0,17 mm · 45°')),
          node('div', {}, node('span', {}, 'Próximo passo'), node('strong', {}, 'Abrir no Microscópio 3D')))
      );
      return;
    }
    const s = steps[key];
    reagentCard.replaceChildren(
      node('div', { className: 'reagent-head' },
        node('span', { className: 'eyebrow' }, 'FICHA DA ETAPA ' + (draft.cursor + 1)),
        node('span', { className: 'reagent-dry' + (s.needsDry ? ' dry-warn' : '') }, s.needsDry ? 'SECAGEM / CURA' : 'ETAPA ÚMIDA')),
      node('div', { className: 'reagent-grid' },
        node('div', {}, node('span', {}, 'Reagente / Material'), node('strong', {}, s.reagent)),
        node('div', {}, node('span', {}, 'Concentração / Ajuste'), node('strong', {}, s.conc)),
        node('div', {}, node('span', {}, 'Tempo da etapa'), node('strong', {}, s.time)),
        node('div', {}, node('span', {}, 'Secar / Cuidado'), node('strong', { className: s.needsDry ? 'warn-text' : '' }, s.dry)))
    );
  }

  function updateUI() {
    const key = current();
    const tissue = tissues[draft.tissue];
    const complete = !key;
    const prog = program();
    const resinMode = isResinProtocol();

    progress.max = prog.length;
    progress.value = draft.cursor;
    stateLine.textContent = complete
      ? 'LÂMINA PRONTA · ' + draft.thickness + ' μm'
      : 'ETAPA ' + (draft.cursor + 1) + ' DE ' + prog.length;

    prevBtn.disabled = draft.cursor === 0;
    action.hidden = complete;
    action.textContent = draft.quick ? 'Preparar em modo rápido' : key ? steps[key].title : '';
    send.hidden = !complete;
    thickness.element.hidden = draft.tissue === 'bacteria';

    protocolList.replaceChildren(...prog.map((id, index) => {
      const li = node('li', {
        className: (index < draft.cursor ? 'done' : index === draft.cursor ? 'current' : '') + ' clickable',
        title: 'Clique para ir direto à etapa ' + (index + 1)
      }, node('b', {}, index < draft.cursor ? '✓' : String(index + 1)), steps[id].title);
      li.addEventListener('click', () => jumpTo(index));
      return li;
    }));

    renderReagentCard(key, complete);

    intro.replaceChildren(
      heading(tissue.name),
      key ? note(steps[key].desc) : note('Preparação concluída com sucesso! Clique em "Levar esta lâmina ao microscópio 3D" para observar o corte até 1000×.'),
      card(stains[draft.stain].short, stains[draft.stain].info),
      card('Estrutura', tissue.structure),
      card('Como reconhecer na ocular', tissue.recognition)
    );
    if (draft.tissue === 'bacteria') {
      intro.append(note('A espessura de 1 μm representa a película fina do esfregaço bacteriano, que não passa por micrótomo.'));
    }

    const { stain, phase } = slideState();
    const inLupaSteps = resinMode && ['bee_capture', 'bee_freeze', 'bee_dissect'].includes(key);
    const showRealCourseResult = resinMode && (complete || key === 'bee_cover' || done('bee_cover'));
    preview.hidden = draft.cursor === 0 || inLupaSteps;
    previewLabel.textContent = showRealCourseResult
      ? 'Resultado real do minicurso · pronto p/ Microscópio 3D'
      : stain === 'paraffin' ? 'Corte em parafina · prévia'
      : stain === 'gram' && phase < 4 ? ['', 'Cristal violeta', 'Violeta + Lugol', 'Após diferenciação'][phase]
      : (resinMode && !done('bee_stain')) ? 'Corte em Historesina (2–3 μm) · prévia'
      : (stains[stain]?.short || 'Amostra') + ' · prévia do corte';
    if (!preview.hidden) {
      const previewFov = showRealCourseResult ? 4500 : (draft.tissue === 'bacteria' ? 94 : 281);
      const previewPhase = showRealCourseResult ? 4 : (resinMode ? Math.min(phase, 3) : phase);
      paintPreview(visual, { tissue: draft.tissue, stain }, { fov: previewFov, gramPhase: phase, stainPhase: previewPhase });
    }

    // Update 3D station configurations according to active protocol & stage!
    b.specimen.material.color.set(tissue.color);
    b.paraffin.visible = !resinMode && (done('embed') || key === 'embed' || done('section'));
    b.resinHolder.visible = resinMode && (done('bee_wood') || key === 'bee_wood' || done('bee_section') || key === 'bee_section');
    b.steelBlade.visible = !resinMode;
    b.glassKnife.visible = resinMode;
    b.resinMold.visible = resinMode;
    b.woodBlockPreview.visible = resinMode;
    b.blackCup.visible = resinMode;
    b.updateMicrotomeLED(draft.thickness, cutCount);

    // Keep staining dish & filtered flask liquid synchronized with current protocol/step (even on direct jumpTo clicks!)
    const activeDye = (key && ['bee_stain', 'hematox', 'eosin', 'schiff', 'pasCounter', 'massNuc', 'massRed', 'massBlue'].includes(key))
      ? steps[key].color
      : (resinMode ? '#3d82d6' : draft.stain === 'pas' ? '#cf2b84' : draft.stain === 'masson' ? '#4776c4' : '#c9507a');
    b.dishLiqMat.color.set(activeDye);
    b.dishLiqMat.emissive.set(activeDye);
    b.dishLiqMat.emissiveIntensity = 0.24;
    b.filteredLiqMat.color.set(resinMode ? '#3574cc' : '#5e358f');
    b.filteredLiqMat.emissive.set(resinMode ? '#1b3d75' : '#3a1a62');

    // 9-well Historesin mold fills up once we reach bee_mold!
    const moldFilled = resinMode && (done('bee_mold') || key === 'bee_mold');
    for (let i = 0; i < b.moldWells.length; i++) {
      b.moldWells[i].visible = moldFilled;
    }

    // Slide sections appear once fished from the black cup / stretched / collected / smeared
    b.patch.visible = done('bee_fish_slide') || key === 'bee_stretch' || done('bee_stretch')
      || done('collect') || done('freshSection') || done('smear');

    // Coverslip visibility (poised at 45° when ready to lower, animating down, & sealed when complete, except Gram)
    const coveringNow = key === 'bee_cover' || key === 'mountCover' || key === 'wetCover' || key === 'wetBlot';
    b.coverslipPivot.visible = (complete && draft.stain !== 'gram')
      || coveringNow
      || done('bee_cover') || done('mountCover') || done('wetCover')
      || Boolean(animation && ['bee_cover', 'mountCover', 'wetCover'].includes(animation.key));

    // Mounting resin droplet visible right before & during coverslip lowering
    b.mountDrop.visible = done('mountResin') && !done('mountCover')
      || (animation && ['mountResin', 'mountCover', 'bee_cover'].includes(animation.key))
      || (key === 'bee_cover' && !complete) || (key === 'mountCover' && !complete);

    patchTargetColor.set(guideColors[stain] || tissue.color);
    if (!animation) b.patchMat.color.copy(patchTargetColor);
  }

  function advance() {
    const key = current();
    if (!key) return;
    const fast = draft.quick;
    if (fast) draft.cursor = program().length;
    else draft.cursor++;
    const section = isMicrotomeStep(key) || (fast && program().some(isMicrotomeStep));
    if (section) cutCount += (fast ? 3 : 1);
    const animKey = fast ? (section ? (isResinProtocol() ? 'bee_section' : 'section') : program().at(-1)) : key;
    const reagentColor = steps[animKey]?.color || '#6ea8dc';
    animation = { key: animKey, start: time, color: reagentColor };

    if (steps[animKey]?.view === 'stain' || animKey === 'waterDrop') {
      waveProgress = 0;
      b.stainWaveMat.color.set(reagentColor);
      b.stainWaveMat.emissive.set(reagentColor);
      b.dropMat.color.set(reagentColor);
      b.dropMat.emissive.set(reagentColor);
    }
    if (['bee_filter', 'filterStain'].includes(animKey)) {
      b.filteredLiqMat.color.set(isResinProtocol() ? '#3574cc' : '#5e358f');
      b.filteredLiqMat.emissive.set(isResinProtocol() ? '#1b3d75' : '#3a1a62');
    }
    if (['bee_stain', 'hematox', 'eosin', 'schiff', 'pasCounter', 'massNuc', 'massRed', 'massBlue'].includes(animKey)) {
      b.dishLiqMat.color.set(reagentColor);
      b.dishLiqMat.emissive.set(reagentColor);
      b.dishLiqMat.emissiveIntensity = 0.26;
    }

    if (!fast) camera(steps[key].view);
    else camera(section ? 'micro' : 'stain');
    audio.play(section ? 'slice' : !current() ? 'glass' : 'click');
    updateUI();
  }

  const mode = select('Modo', { guided: 'Guiado · passo a passo', fast: 'Rápido · completo' },
    draft.quick ? 'fast' : 'guided', value => { draft.quick = value === 'fast'; audio.play('click'); updateUI(); });
  const cameraControl = select('Bancada', Object.fromEntries(Object.entries(views).map(([id, [name]]) => [id, name])), 'general', id => {
    audio.play('click');
    camera(id);
  });

  toolbar.append(
    tissueControl.element, stainHost, mode.element, thickness.element, cameraControl.element,
    row(prevBtn, action, button('Reiniciar', () => { audio.play('click'); reset(); }), send)
  );
  guide.append(stateLine, progress, reagentCard, intro, heading('Protocolo completo (clique em qualquer etapa)'), protocolList,
    note('Todas as etapas de histotécnica, concentrações, tempos e secagem seguem a rotina real de laboratório em escala didática 3D.'));
  help.textContent = 'Arraste para orbitar · Clique nas estações 3D · Na microtomia, arraste a manivela para fatiar';

  const offBeePreview = onBeePhotoLoad(() => updateUI());
  signal.addEventListener('abort', offBeePreview, { once: true });
  rebuildStains();
  if (draft.tissue !== 'bacteria') thickness.set(draft.thickness);
  camera(isResinProtocol() ? 'lupa' : 'general', true);
  updateUI();

  // Tactile crank dragging + 3D station hover tooltips & click-to-focus
  const ray = new T.Raycaster(), pointer = new T.Vector2();
  const canvas = engine.renderer.domElement;
  const stationRoots = [b.crank, b.lupaMonitor, b.lupaStation, b.rack, b.micro, b.hotplate, b.water, b.stain, b.slide];

  function pickStation(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2);
    ray.setFromCamera(pointer, engine.camera);
    for (const hit of ray.intersectObjects(stationRoots, true)) {
      let obj = hit.object;
      while (obj && !obj.userData.pickKey) obj = obj.parent;
      if (obj?.userData.pickKey) return obj.userData.pickKey;
    }
    return null;
  }

  let downAt = null;
  canvas.addEventListener('pointerdown', event => {
    downAt = [event.clientX, event.clientY];
    if (!isMicrotomeStep(current()) || draft.quick || event.button !== 0) return;
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2);
    ray.setFromCamera(pointer, engine.camera);
    if (!ray.intersectObject(b.crank, true).length) return;
    event.stopImmediatePropagation();
    crankDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, angle: 0 };
    viewport.classList.add('is-dragging');
    canvas.setPointerCapture(event.pointerId);
  }, { signal, capture: true });

  canvas.addEventListener('pointermove', event => {
    if (crankDrag?.id === event.pointerId) {
      const change = (event.clientX - crankDrag.x + (event.clientY - crankDrag.y) * 0.62) * 0.028;
      rotation += change;
      crankDrag.angle += Math.abs(change);
      crankDrag.x = event.clientX;
      crankDrag.y = event.clientY;
      if (Math.abs(change) > 0.03) audio.play('dial');
      if (crankDrag.angle > 1.65) {
        crankDrag = null;
        viewport.classList.remove('is-dragging');
        advance();
      }
      return;
    }
    if (event.buttons) { hideTooltip(tooltip, viewport); return; }
    const key = pickStation(event);
    hoveredKey = key;
    if (key) {
      const info = b.interactives.get(key);
      const sub = key === 'crank' && isMicrotomeStep(current())
        ? (isResinProtocol() ? 'Arraste agora para fatiar a Historesina na navalha de vidro triangular!' : 'Arraste agora para girar e cortar o bloco de parafina!')
        : info.subtitle;
      showTooltip(tooltip, viewport, event.clientX, event.clientY, info.title, sub, info.color);
    } else {
      hideTooltip(tooltip, viewport);
    }
  }, { signal });

  canvas.addEventListener('pointerleave', () => { hoveredKey = null; hideTooltip(tooltip, viewport); }, { signal });

  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(type, event => {
      if (crankDrag) {
        crankDrag = null;
        viewport.classList.remove('is-dragging');
        return;
      }
      if (type === 'pointerup' && downAt && Math.hypot(downAt[0] - event.clientX, downAt[1] - event.clientY) < 7) {
        const key = pickStation(event);
        if (key) {
          const info = b.interactives.get(key);
          if (key === 'crank' && isMicrotomeStep(current())) {
            advance();
          } else if (info?.view) {
            audio.play('click');
            camera(info.view);
          }
        }
      }
      downAt = null;
    }, { signal });
  }

  // Mapping every processing bath step to bottle index (0..4)
  const bathMap = {
    bee_fix: 0, bee_wash: 0, fix: 0,
    bee_eth70: 1, bee_eth8090: 1, eth70: 1,
    bee_eth100: 2, eth100: 2,
    bee_preinfil: 3, clear: 3,
    bee_infil: 4, embed: 4
  };
  const dipInDishSteps = new Set(['bee_stain', 'hematox', 'eosin', 'schiff', 'pasCounter', 'massNuc', 'massRed', 'massBlue', 'dewax']);
  const hotplateSteps = new Set(['bee_stretch', 'hotplateDry', 'smearFix']);
  const coverSteps = new Set(['bee_cover', 'mountCover', 'wetCover']);

  return {
    update(dt) {
      time += dt;

      // 1) Continuous warm water bath ripples + rising gentle steam wisps + glowing hotplate ring
      for (let i = 0; i < b.ripples.length; i++) {
        const rp = (time * 0.42 + i / b.ripples.length) % 1;
        b.ripples[i].scale.setScalar(0.28 + rp * 1.65);
        b.ripples[i].material.opacity = Math.sin(rp * Math.PI) * 0.42;
      }
      for (let i = 0; i < b.steamPuffs.length; i++) {
        const sp = (time * 0.32 + i / b.steamPuffs.length) % 1;
        b.steamPuffs[i].position.y = 0.56 + sp * 0.92;
        b.steamPuffs[i].position.x = Math.cos(i * 1.3 + time * 0.6) * (0.28 + sp * 0.14);
        b.steamPuffs[i].scale.setScalar(0.7 + sp * 0.95);
        b.steamPuffs[i].material.opacity = Math.sin(sp * Math.PI) * 0.16;
      }
      const p = animation ? Math.min(1, (time - animation.start) / 1.15) : 1;
      const key = animation?.key;
      const active = Boolean(key && p < 1);
      const cur = current();
      const stageKey = active ? key : cur;

      const hotActive = hotplateSteps.has(stageKey);
      b.heatGlowMat.opacity = hotActive ? 0.55 + Math.sin(time * 6) * 0.25 : 0.22;

      // 2) STATION 0 — BEE CAPTURE, CRYO-FREEZING, LUPA RED-WAX DISSECTION & LIVE CCD MONITOR!
      const resinMode = isResinProtocol();
      const inFreeze = stageKey === 'bee_freeze';
      const inDissect = stageKey === 'bee_dissect';
      const afterDissect = done('bee_dissect') && !inDissect;
      b.updateLupaMonitor(stageKey || (resinMode ? 'bee_cover' : 'macro'), time, resinMode, tissues[draft.tissue]?.name || 'Amostra', afterDissect);

      b.iceChamber.visible = resinMode && (inFreeze || (active && key === 'bee_freeze'));
      if (b.iceChamber.visible) {
        for (let i = 0; i < b.iceCrystals.length; i++) {
          b.iceCrystals[i].rotation.y = time * 1.4 + i;
          b.iceCrystals[i].position.y = 0.34 + Math.sin(time * 3 + i) * 0.05;
        }
      }

      if (resinMode) {
        b.bee.visible = true;
        if (stageKey === 'bee_capture' || (draft.cursor === 0 && !active)) {
          // Worker bee cleanly perched ON TOP of the hexagonal brood comb inside the Petri dish (legs at y = 0.148!)
          b.bee.setDissectionState?.('intact');
          b.bee.position.set(-1.45 + Math.sin(time * 2.2) * 0.03, 0.258 + Math.abs(Math.sin(time * 4)) * 0.01, 2.32);
          b.bee.rotation.set(0, 0.55 + Math.sin(time * 1.4) * 0.12, 0);
        } else if (inFreeze) {
          // Chilling inside translucent cryo-ice chamber
          b.bee.setDissectionState?.('intact');
          const f = active ? p : 1;
          b.bee.position.set(-1.45 + 0.67 * f, 0.258 + Math.sin(f * Math.PI) * 0.34 + 0.022 * f, 2.32 - 0.47 * f);
          b.bee.rotation.set(0, 0.55 + f * 0.5, 0);
        } else {
          // Seated cleanly ON TOP of the red-wax dish & 0.9% saline meniscus (y = 0.478 -> belly/legs flush on wax top 0.368!)
          // Oriented with head to -X and open dorsal abdomen centered at x = 0.00 under Lupa 01 objective!
          const d = active && key === 'bee_dissect' ? p : 1;
          b.bee.setDissectionState?.(inDissect ? 'active' : 'empty');
          b.bee.position.set(-0.78 + (0.63) * d, 0.28 + 0.198 * d + (active && key === 'bee_dissect' ? Math.sin(d * Math.PI) * 0.28 : 0), 1.85 - 1.30 * d);
          b.bee.rotation.set(0, 1.05 + (Math.PI - 1.17) * d, 0);
        }
        // Dissected midgut/ventriculus + Malpighian tubules ONLY visible during dissection, emerging cleanly out of the open abdomen!
        b.beeOrgan.visible = inDissect;
        b.forceps.visible = inDissect;
        if (inDissect) {
          const lift = Math.sin(time * 2.4) * 0.5 + 0.5;
          b.beeOrgan.position.set(0.11, 0.50 + lift * 0.11, 0.55);
          b.forceps.position.set(0.20, 0.52 + lift * 0.13, 0.55);
          b.forceps.rotation.set(0.18, -0.35, 0.52 + lift * 0.10);
          b.forceps.setPinch(0.06 + (1 - lift) * 0.42);
        }
      } else {
        b.bee.visible = false;
        b.beeOrgan.visible = false;
        b.forceps.visible = false;
        b.iceChamber.visible = false;
      }

      // 3) STATION 1 — REAGENT BOTTLES, SPECIMEN DIPPING, 9-WELL MOLD & WOOD BLOCK PULSE
      const bathIndex = bathMap[stageKey] ?? -1;
      for (const [i, bottle] of b.bottles.entries()) {
        bottle.liquid.emissiveIntensity = bathIndex === i ? 0.42 + 0.16 * Math.sin(time * 5.2) : 0.14;
      }

      b.specimen.visible = (!resinMode && draft.cursor === 0 && !active) || (bathIndex >= 0 && active);
      if (b.specimen.visible) {
        b.specimen.position.set(
          bathIndex >= 0 && active ? b.bottles[bathIndex].x : -4.25,
          bathIndex >= 0 && active ? 1.78 - Math.sin(p * Math.PI) * 0.94 : 0.22,
          bathIndex >= 0 && active ? 0.52 : 2.18
        );
      }

      if (stageKey === 'bee_mold') {
        const pulse = 0.22 + Math.sin(time * 5) * 0.14;
        for (let i = 0; i < b.moldWells.length; i++) {
          b.moldWells[i].material.emissive.set('#f0c975');
          b.moldWells[i].material.emissiveIntensity = pulse;
        }
      }
      if (stageKey === 'bee_wood') {
        b.woodBlockPreview.position.y = 0.02 + Math.abs(Math.sin(time * 4)) * 0.08;
      } else {
        b.woodBlockPreview.position.y = 0.02;
      }

      // 4) STATION 2 — SCULPTED LEICA RM2255 (SOLID FLYWHEEL + GREEN GLASS KNIFE + BLACK WATER CUP!)
      const dragProgress = crankDrag ? Math.min(1, crankDrag.angle / 1.65) : 0;
      const slicingNow = active && isMicrotomeStep(key);
      if (slicingNow) rotation += dt * 7.4;
      b.crank.rotation.x = rotation;

      const cutStroke = slicingNow ? Math.sin(p * Math.PI)
        : dragProgress > 0 ? Math.sin(dragProgress * Math.PI * 0.85) : 0;
      b.feeder.position.y = 2.18 - cutStroke * 0.56;

      // Gently drift translucent Historesin cuts floating on the black contrast water cup +
      // Full 3-Stage Microtome Film Transfer: Knife Edge -> Tweezers -> Black Water Cup -> Glass Slide!
      const inPickupCup = resinMode && stageKey === 'bee_pickup_cup';
      const inFishSlide = resinMode && stageKey === 'bee_fish_slide';
      const hasWaterCuts = resinMode && (done('bee_pickup_cup') || inFishSlide);
      const justSliced = resinMode && (done('bee_section') && !done('bee_pickup_cup') && !inPickupCup);

      b.cupRipple.visible = false;
      b.microForceps.visible = false;
      b.transferFilm.visible = false;
      b.cupPickSlide.visible = false;

      if (inPickupCup) {
        // Continuous smooth cycle: pick up film from triangular glass knife -> carry in pinched tweezers -> release onto black water cup!
        const u = active ? p : (time * 0.34) % 1;
        b.microForceps.visible = true;
        b.transferFilm.visible = u < 0.78;
        let fx, fy, fz, pinchOpen;
        if (u < 0.20) {
          // Approach knife edge & close tweezers onto freshly cut translucent film
          const k = u / 0.20;
          fx = -0.18 + (1 - k) * 0.18;
          fy = 1.84 + (1 - k) * 0.22;
          fz = 1.18 + (1 - k) * 0.14;
          pinchOpen = (1 - k) * 0.72;
          b.transferFilm.position.set(-0.18, 1.82, 1.18);
          b.transferFilm.rotation.set(0.35, 0, 0);
        } else if (u < 0.72) {
          // Lift translucent film cleanly off the glass knife and carry in high arc over the black contrast water cup!
          const k = (u - 0.20) / 0.52;
          const ease = k * k * (3 - 2 * k);
          fx = -0.18 + ease * (0.88 - (-0.18));
          fz = 1.18 + ease * (2.38 - 1.18);
          fy = 1.84 * (1 - ease) + 0.65 * ease + Math.sin(ease * Math.PI) * 0.58;
          pinchOpen = 0.04;
          b.transferFilm.position.set(fx, fy - 0.02, fz);
          b.transferFilm.rotation.set(0.2 * (1 - ease), ease * 0.5, 0);
        } else {
          // Open tweezers over dark water meniscus — film stretches flat onto the water with expanding cyan ripple!
          const k = (u - 0.72) / 0.28;
          fx = 0.88 + k * 0.14;
          fy = 0.65 + k * 0.36;
          fz = 2.38 + k * 0.08;
          pinchOpen = 0.08 + k * 0.75;
          b.transferFilm.position.set(0.88, 0.612, 2.38);
          b.transferFilm.rotation.set(0, 0.5, 0);
          b.cupRipple.visible = true;
          b.cupRipple.scale.setScalar(0.5 + k * 2.1);
          b.cupRippleMat.opacity = Math.sin(k * Math.PI) * 0.72;
        }
        b.microForceps.position.set(fx, fy, fz);
        b.microForceps.rotation.set(0.16, -0.52, 0.56);
        b.microForceps.setPinch(pinchOpen);

        for (let i = 0; i < b.cupSlices.length; i++) {
          b.cupSlices[i].visible = u >= 0.72 || i < 2;
        }
      } else if (inFishSlide) {
        // Glass slide dips at ~30° into the black contrast water cup while tweezers guides the stretched film onto the glass!
        const u = active ? p : (time * 0.32) % 1;
        b.cupPickSlide.visible = true;
        b.microForceps.visible = true;
        const dip = u < 0.45 ? u / 0.45 : u < 0.65 ? 1 : 1 - (u - 0.65) / 0.35;
        const ease = dip * dip * (3 - 2 * dip);
        // Slide tilts smoothly down to touch the dark water meniscus and lifts out carrying the 3 stretched films!
        b.cupPickSlide.position.set(0.95 + (1 - ease) * 0.42, 1.06 - ease * 0.34, 2.38);
        b.cupPickSlide.rotation.set(0.08, -0.22, -0.52 * ease - 0.12);
        b.cupSlideSections.visible = u >= 0.52;

        // Precision tweezers gently guides the floating cut from the dark water onto the dipped glass slide
        b.microForceps.position.set(0.84 + Math.sin(u * Math.PI) * 0.08, 0.68 + (1 - ease) * 0.25, 2.40);
        b.microForceps.rotation.set(0.14, -0.62, 0.50);
        b.microForceps.setPinch(0.12 + Math.abs(Math.cos(u * Math.PI)) * 0.35);

        b.cupRipple.visible = ease > 0.35;
        b.cupRipple.scale.setScalar(0.65 + (u % 0.5) * 2.4);
        b.cupRippleMat.opacity = ease * 0.55;

        for (let i = 0; i < b.cupSlices.length; i++) {
          b.cupSlices[i].visible = u < 0.56;
        }
      } else {
        // Film sitting freshly cut on glass knife waiting to be picked up, OR slices already resting in black cup
        b.transferFilm.visible = justSliced;
        if (justSliced) {
          b.transferFilm.position.set(-0.18, 1.82, 1.18);
          b.transferFilm.rotation.set(0.35, 0, 0);
        }
        for (let i = 0; i < b.cupSlices.length; i++) {
          b.cupSlices[i].visible = hasWaterCuts && !done('bee_fish_slide');
        }
      }

      if (b.blackCup.visible) {
        for (let i = 0; i < b.cupSlices.length; i++) {
          const cs = b.cupSlices[i];
          if (!cs.visible) continue;
          cs.rotation.y = time * 0.28 * (i % 2 ? 1 : -1) + i;
          cs.position.y = 0.606 + Math.sin(time * 2.2 + i * 1.7) * 0.004;
        }
      }

      const waterRibbon = key === 'bath' && active;
      const cutting = slicingNow || dragProgress > 0.15;
      const cutFrac = slicingNow ? p : dragProgress;
      b.ribbon.visible = (!resinMode && (cutting || waterRibbon || (done('section') && !done('collect') && !done('bath'))))
        || (resinMode && cutting);
      if (b.ribbon.visible) {
        b.ribbon.position.set(
          waterRibbon ? -0.23 + 3.35 * p : -0.23,
          waterRibbon ? Math.sin(p * Math.PI) * 0.78 + 0.48 : 1.54 - (cutting ? cutFrac * 0.42 : 0.20),
          waterRibbon ? 0.76 + 0.16 * p : 0.68 + (cutting ? cutFrac * 0.54 : 0.48)
        );
        b.ribbon.rotation.y = waterRibbon ? p * 0.68 : 0;
        b.ribbon.scale.setScalar(cutting ? 0.34 + cutFrac * 0.66 : waterRibbon ? 0.88 : 0.96);
        for (let i = 0; i < b.ribbonSlices.length; i++) {
          const flat = waterRibbon ? 1 - p * 0.75 : 1;
          b.ribbonSlices[i].position.y = Math.sin(i * 1.05 + time * 2.4) * 0.026 * flat;
        }
      }

      // 5) STATION 4 — FILTRATION FUNNEL DRIP, STAINING DISH DIP & FOIL BOTTLES HIGHLIGHT
      const stainBottleIdx =
        ['hematox', 'pasCounter', 'massNuc'].includes(stageKey) ? 0 :
        ['eosin'].includes(stageKey) ? 1 :
        ['oxidize', 'schiff'].includes(stageKey) ? 2 :
        ['bee_stain', 'bee_filter'].includes(stageKey) ? 3 :
        ['violet', 'iodine', 'decolor', 'safranin', 'massRed', 'massBlue', 'filterStain'].includes(stageKey) ? 4 : -1;
      for (const [i, sb] of b.stainBottles.entries()) {
        sb.liquid.emissiveIntensity = stainBottleIdx === i ? 0.45 + 0.18 * Math.sin(time * 5.2) : 0.14;
      }

      // Animated dripping through glass funnel + pleated filter paper into Erlenmeyer!
      const filtering = stageKey === 'bee_filter' || stageKey === 'filterStain';
      b.filterDrop.visible = filtering;
      if (filtering) {
        const fp = (time * 1.35) % 1;
        b.filterDrop.position.y = 0.56 - fp * 0.34;
        b.filterDrop.scale.set(0.85, 1.35, 0.85);
      }

      // Vertical glass slide dipping into grooved borosilicate staining dish ("Cuba de vidro")!
      const dippingDish = dipInDishSteps.has(stageKey);
      b.dipSlide.visible = dippingDish;
      if (dippingDish) {
        const dipWave = active ? Math.sin(p * Math.PI) : 0.5 + 0.5 * Math.sin(time * 2.2);
        b.dipSlide.position.y = 0.52 - dipWave * 0.22;
      }

      // 6) HERO SLIDE POSITION (moves onto glowing 48–58°C Hotplate when drying, else on Paper Towel!)
      if (active && key === 'collect') {
        b.slide.position.set(3.12 + 3.16 * p, 0.34 + Math.sin(p * Math.PI) * 0.72, 0.94);
      } else if (hotActive) {
        // Resting directly on top of the warm glowing digital drying hotplate!
        b.slide.position.set(3.15, 0.375, -1.72);
      } else {
        // Resting neatly atop the textured white absorbent paper towel!
        b.slide.position.set(6.28, 0.285, 0.96);
      }

      // 7) REALISTIC 45° COVERSLIP LOWERING & MOUNTING RESIN SPREADING! (base drop radii: 0.12, 0.045, 0.12)
      const loweringCover = active && coverSteps.has(key);
      if (loweringCover) {
        const ease = 1 - Math.pow(1 - p, 2.4);
        b.coverslipPivot.rotation.z = (1 - ease) * (Math.PI * 0.26); // smooth 47° -> 0° bubble-free sweep!
        b.mountDrop.scale.set(0.12 * (1 + ease * 1.45), 0.045 * Math.max(0.22, 1 - ease * 0.78), 0.12 * (1 + ease * 1.35));
      } else if (coverSteps.has(cur) && !active && !done(cur)) {
        // Poised at 45° ready to lower!
        b.coverslipPivot.rotation.z = Math.PI * 0.25;
        b.mountDrop.scale.set(0.12, 0.045, 0.12);
      } else {
        b.coverslipPivot.rotation.z = 0;
        b.mountDrop.scale.set(0.12 * 2.2, 0.045 * 0.22, 0.12 * 2.0);
      }

      // 8) GLASS PASTEUR PIPETTE DROPPER & RADIAL STAIN WAVE
      const isDropping = active && (
        ['waterDrop', 'mountResin', 'violet', 'iodine', 'decolor', 'safranin', 'oxidize'].includes(key)
        || (steps[key]?.view === 'stain' && !dipInDishSteps.has(key) && !coverSteps.has(key)
          && !['bee_filter', 'filterStain', 'bee_dry', 'mountDehyd', 'gramFinish', 'wetBlot'].includes(key))
      );
      b.dropper.visible = isDropping;
      b.drop.visible = isDropping && p < 0.56;
      if (isDropping) {
        const dip = Math.sin(Math.min(1, p / 0.55) * Math.PI) * 0.22;
        b.dropper.position.set(6.42, 1.74 - dip, 0.96);
        const dp = Math.min(1, p / 0.56);
        b.drop.position.set(6.42, 1.34 - dp * dp * 0.98, 0.96);
        b.drop.scale.set(1 - dp * 0.14, 1.48 + dp * 0.34, 1 - dp * 0.14);
      }

      if (waveProgress < 1) {
        waveProgress = Math.min(1, waveProgress + dt * 1.15);
        const w = Math.max(0, (waveProgress - 0.28) / 0.72);
        b.stainWave.visible = w > 0 && w < 1;
        if (b.stainWave.visible) {
          b.stainWave.scale.set(0.2 + w * 1.45, 0.2 + w * 1.05, 1);
          b.stainWaveMat.opacity = Math.sin(w * Math.PI) * 0.82;
        }
        b.patchMat.color.lerp(patchTargetColor, 1 - Math.exp(-dt * 4.5));
      } else {
        b.stainWave.visible = false;
      }

      // 9) Subtle hover / active prompt pulse on microtome crank
      const crankPulse = isMicrotomeStep(cur) && !draft.quick ? 0.15 + Math.sin(time * 4.5) * 0.11 : 0;
      const hoverBoost = hoveredKey === 'crank' ? 0.32 : crankPulse;
      b.crank.traverse(child => {
        const mat = child.material;
        if (!mat || !mat.isMeshStandardMaterial) return;
        if (mat.userData.baseEmInt === undefined) mat.userData.baseEmInt = mat.emissiveIntensity;
        mat.emissive.set('#4bc7d8');
        mat.emissiveIntensity += ((mat.userData.baseEmInt + hoverBoost) - mat.emissiveIntensity) * (1 - Math.exp(-dt * 9));
      });

      if (cameraControl.input.value !== activeView) cameraControl.input.value = activeView;
    }
  };
}
