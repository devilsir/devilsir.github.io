'use strict';
/**
 * detective.js — Dossiê 46: Divisão de Perícia Hereditária
 * 10 casos progressivos auditados matematicamente cobrindo 5 mecanismos de herança,
 * com investigação fragmentada por etapas, Rascunho de Punnett manual em branco,
 * dicas socráticas sem entrega de resposta e avaliação final com carimbo pericial.
 */
const Dossie46 = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // =========================================================================
  // 10 CASOS INÉDITOS E AUDITADOS MATEMATICAMENTE
  // =========================================================================
  const CASES = [
    // -----------------------------------------------------------------------
    // CASO 1 — INICIAL (3 etapas: Dominância Completa + Incompleta)
    // -----------------------------------------------------------------------
    {
      id: 1,
      code: 'ARQ-46/01',
      level: 'Nível Inicial',
      title: 'O Relojoeiro da Rua das Flores',
      location: 'Oficina Horológica Central · 22h15',
      suspectSex: 'M',
      summary: 'Um cronômetro de latão foi retirado da vitrine trancada sem arrombamento. A chave reserva pertence a um único núcleo familiar. Analise os registros genealógicos separados em 3 etapas para reconstruir o retrato falado do responsável.',
      steps: [
        {
          trait: 'earlobe',
          requireGenotype: false,
          expectedPheno: 'preso',
          expectedGenotype: 'ff',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Preso', fatherState: 'rec', motherRole: 'Mãe', motherTag: 'Preso', motherState: 'rec' },
          clues: [
            { tag: 'Registro Fotográfico', text: 'As fotografias de identificação arquivadas no cartório confirmam que tanto o pai quanto a mãe do investigado possuem <b>lóbulos auriculares presos</b>.' },
            { tag: 'Nota Pericial', text: 'Neste traço, o lóbulo solto é determinado por alelo dominante (<span class="mono">F</span>) e o lóbulo preso manifesta-se apenas em homozigose recessiva (<span class="mono">ff</span>).' },
          ],
          labHint: 'Se um traço só aparece quando ambos os alelos são recessivos (ff), quais alelos cada um dos pais pode transmitir nos gametas?',
          wrongClueHint: 'Releia o registro fotográfico dos pais: ambos expressam o traço recessivo (ff) — verifique se algum deles poderia carregar o alelo dominante F.',
          explanation: 'Tanto o pai quanto a mãe possuem lóbulo preso (ff × ff). Como ambos só produzem gametas portando o alelo f, todo descendente recebe ff e expressa lóbulo preso.',
          logic: (g, { canProduce }) => canProduce('ff', 'ff', g),
        },
        {
          trait: 'hairTexture',
          requireGenotype: false,
          expectedPheno: 'ondulado',
          expectedGenotype: 'Tt',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Liso', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Cach.', motherState: 'affected' },
          clues: [
            { tag: 'Arquivo Civil', text: 'A mãe do investigado apresenta cabelo fortemente <b>cacheado</b>; já o pai possui cabelo completamente <b>liso</b>.' },
            { tag: 'Nota Pericial', text: 'A textura capilar segue padrão de <b>dominância incompleta</b>, no qual o heterozigoto assume um fenótipo intermediário entre os dois homozigotos.' },
          ],
          labHint: 'Monte no Rascunho de Punnett o cruzamento entre um genitor homozigoto para cacheado e outro homozigoto para liso. Que combinação aparece em todas as casas?',
          wrongClueHint: 'Revise a nota sobre dominância incompleta: um alelo de cabelo cacheado combinado com um alelo de cabelo liso gera qual textura?',
          explanation: 'Mãe cacheada (TT) transmite apenas gametas T; pai liso (tt) transmite apenas gametas t. Todo filho nasce Tt, apresentando cabelo ondulado.',
          logic: (g, { canProduce }) => canProduce('TT', 'tt', g),
        },
        {
          trait: 'hairline',
          requireGenotype: false,
          expectedPheno: 'pico',
          expectedGenotype: 'indeterminado',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: '?', motherRole: 'Mãe', motherTag: '?', spouseRole: 'Esposa', spouseTag: 'Reta', spouseState: 'plain', childRole: 'Filha', childTag: 'Pico', childState: 'affected' },
          clues: [
            { tag: 'Depoimento Familiar', text: 'A esposa do investigado apresenta linha frontal do cabelo completamente <b>reta</b>.' },
            { tag: 'Registro Escolar', text: 'A filha do casal, contudo, exibe nítido <b>pico de viúva</b> no centro da testa.' },
          ],
          labHint: 'A esposa tem o traço recessivo (linha reta), portanto só passa o alelo recessivo. De quem a filha precisou herdar o alelo dominante do pico de viúva?',
          wrongClueHint: 'Compare o traço da esposa com o da filha: se a esposa não possui o alelo dominante do pico de viúva, qual é a única origem possível desse alelo na filha?',
          explanation: 'A esposa (pp) só doa gametas p. Como a filha exibe pico de viúva (Pp), o alelo P veio obrigatoriamente do investigado — que portanto também apresenta pico de viúva (PP ou Pp).',
          logic: (g, { canProduce }) => canProduce(g, 'pp', 'PP') || canProduce(g, 'pp', 'Pp'),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 2 — INICIAL (4 etapas: Pais, Avós e Descendentes)
    // -----------------------------------------------------------------------
    {
      id: 2,
      code: 'ARQ-46/02',
      level: 'Nível Inicial',
      title: 'As Páginas da Biblioteca Municipal',
      location: 'Sala de Obras Raras · 18h40',
      suspectSex: 'M',
      summary: 'Pranchas botânicas históricas foram removidas de um volume trancado. A lista de acesso restringiu a perícia a uma linhagem familiar registrada nos arquivos da cidade. Deduza 4 traços faciais.',
      steps: [
        {
          trait: 'dimples',
          requireGenotype: false,
          expectedPheno: 'ausentes',
          expectedGenotype: 'cc',
          pedigree: { layout: 'threeGen', suspectSex: 'M', gp1Role: 'Avô P.', gp1Tag: 'Sem', gp1State: 'rec', gp2Role: 'Avó P.', gp2Tag: 'Sem', gp2State: 'rec', gp3Role: 'Avô M.', gp3Tag: 'Sem', gp3State: 'rec', gp4Role: 'Avó M.', gp4Tag: 'Sem', gp4State: 'rec', fatherRole: 'Pai', fatherTag: 'Sem', fatherState: 'rec', motherRole: 'Mãe', motherTag: 'Sem', motherState: 'rec' },
          clues: [
            { tag: 'Fichário Genealógico', text: 'Nenhum dos dois genitores do investigado apresenta covinhas faciais; os quatro avós também nunca exibiram esse traço.' },
          ],
          labHint: 'A ausência de covinhas é recessiva. Quando dois genitores expressam o fenótipo recessivo, existe possibilidade de surgir um alelo dominante na prole?',
          wrongClueHint: 'Releia o fichário genealógico: pais sem covinhas (cc × cc) não carregam o alelo dominante C.',
          explanation: 'Ambos os pais são homozigotos recessivos (cc × cc), transmitindo exclusivamente o alelo c. O investigado é cc e não possui covinhas.',
          logic: (g, { canProduce }) => canProduce('cc', 'cc', g),
        },
        {
          trait: 'freckles',
          requireGenotype: false,
          expectedPheno: 'presentes',
          expectedGenotype: 'indeterminado',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: '?', motherRole: 'Mãe', motherTag: '?', spouseRole: 'Esposa', spouseTag: 'Sem', spouseState: 'plain', childRole: 'Filho', childTag: 'Sardas', childState: 'affected', childShape: 'sq' },
          clues: [
            { tag: 'Relato de Vizinhos', text: 'A esposa do investigado tem pele uniforme, completamente <b>sem sardas</b>.' },
            { tag: 'Registro Pediátrico', text: 'O filho do casal apresenta <b>sardas acentuadas</b> sobre o nariz e as maçãs do rosto.' },
          ],
          labHint: 'Sardas seguem dominância completa. Se a mãe da criança não tem sardas, ela possui algum alelo dominante para passar ao filho?',
          wrongClueHint: 'Verifique a pista do cônjuge e do filho: a ausência de sardas na esposa impede que ela tenha doado o alelo dominante S.',
          explanation: 'A esposa sem sardas é ss e só fornece gametas s. O filho com sardas (Ss) herdou o alelo S do investigado, logo o investigado possui sardas.',
          logic: (g, { canProduce }) => canProduce(g, 'ss', 'SS') || canProduce(g, 'ss', 'Ss'),
        },
        {
          trait: 'lipWidth',
          requireGenotype: false,
          expectedPheno: 'finos',
          expectedGenotype: 'mm',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Finos', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Finos', motherState: 'plain' },
          clues: [
            { tag: 'Prontuário Antropométrico', text: 'Tanto o pai quanto a mãe do investigado apresentam <b>lábios finos</b> — fenótipo correspondente à homozigose recessiva na escala de espessura labial.' },
          ],
          labHint: 'Na dominância incompleta, lábios finos (mm) só ocorrem com dois alelos recessivos. O que resulta do cruzamento mm × mm?',
          wrongClueHint: 'Considere que ambos os pais são homozigotos mm: que único tipo de gameta cada um deles produz?',
          explanation: 'Pais mm × mm produzem somente gametas m, originando 100% de descendentes mm (lábios finos).',
          logic: (g, { canProduce }) => canProduce('mm', 'mm', g),
        },
        {
          trait: 'cleftChin',
          requireGenotype: false,
          expectedPheno: 'presente',
          expectedGenotype: 'Qq',
          pedigree: { layout: 'threeGen', suspectSex: 'M', gp1Role: 'Avô P.', gp1Tag: 'Liso', gp1State: 'rec', gp2Role: 'Avó P.', gp2Tag: 'Liso', gp2State: 'rec', gp3Role: 'Avô M.', gp3Tag: 'QQ', gp3State: 'dom', gp3Alleles: 'QQ', gp4Role: 'Avó M.', gp4Tag: 'QQ', gp4State: 'dom', gp4Alleles: 'QQ', fatherRole: 'Pai', fatherTag: 'Liso', fatherState: 'rec', motherRole: 'Mãe', motherTag: 'Fenda', motherState: 'dom' },
          clues: [
            { tag: 'Arquivo Materno', text: 'O estudo genealógico da família materna confirmou que ambos os avós maternos possuíam fenda no queixo em homozigose dominante (<span class="mono">QQ × QQ</span>).' },
            { tag: 'Arquivo Paterno', text: 'O pai do investigado possui queixo completamente <b>liso</b> (sem fenda).' },
          ],
          labHint: 'Primeiro deduza o genótipo da mãe a partir dos avós maternos (QQ × QQ). Depois cruze o genótipo da mãe com o do pai no Rascunho de Punnett.',
          wrongClueHint: 'Retome o heredograma materno: uma mãe filha de QQ × QQ pode transmitir o alelo recessivo q?',
          explanation: 'Filha de QQ × QQ, a mãe é obrigatoriamente QQ e transmite apenas Q. Cruzada com o pai qq, 100% dos filhos são Qq e apresentam fenda no queixo.',
          logic: (g, { canProduce }) => canProduce('QQ', 'qq', g),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 3 — INICIAL (4 etapas: Triangulação de Gerações)
    // -----------------------------------------------------------------------
    {
      id: 3,
      code: 'ARQ-46/03',
      level: 'Nível Inicial',
      title: 'A Maleta sem Remetente',
      location: 'Portaria do Museu de História Natural · 07h10',
      suspectSex: 'M',
      summary: 'Uma maleta lacrada com sementes raras foi deixada na recepção por um portador de chapéu abaixado. Os arquivos dos pais e descendentes da família suspeita permitem determinar 4 características.',
      steps: [
        {
          trait: 'hairTexture',
          requireGenotype: false,
          expectedPheno: 'ondulado',
          expectedGenotype: 'Tt',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: '?', motherRole: 'Mãe', motherTag: 'Cach.', motherState: 'affected', spouseRole: 'Esposa', spouseTag: 'Ond.', spouseState: 'carrier', childRole: 'Filha', childTag: 'Liso', childState: 'plain' },
          clues: [
            { tag: 'Registro Materno', text: 'A mãe do investigado tem cabelo <b>cacheado</b> (homozigoto <span class="mono">TT</span>).' },
            { tag: 'Registro da Descendência', text: 'O investigado casou-se com uma mulher de cabelo <b>ondulado</b> e tiveram uma filha de cabelo <b>liso</b>.' },
          ],
          labHint: 'Verifique separadamente o que o investigado recebeu da mãe (TT) e o que precisou doar para que a filha nascesse lisa (tt).',
          wrongClueHint: 'Cruze as duas pistas juntas: a mãe TT impede que o investigado seja liso, e a filha tt impede que ele seja cacheado puro!',
          explanation: 'Recebeu obrigatoriamente o alelo T da mãe (TT) e precisou doar o alelo t para a filha lisa (tt). Portanto, o investigado é Tt (cabelo ondulado).',
          logic: (g, { canProduce }) => g.includes('T') && canProduce(g, 'Tt', 'tt'),
        },
        {
          trait: 'earlobe',
          requireGenotype: false,
          expectedPheno: 'preso',
          expectedGenotype: 'ff',
          pedigree: { layout: 'offspring', suspectSex: 'M', suspectNote: 'Laudo: Homozigoto (alelos iguais)', fatherRole: 'Pai', fatherTag: '?', fatherState: 'unknown', motherRole: 'Mãe', motherTag: '?', motherState: 'unknown', spouseRole: 'Esposa', spouseTag: 'Preso', spouseState: 'rec', childRole: 'Filha', childTag: 'Preso', childState: 'rec' },
          clues: [
            { tag: 'Ficha da Filha', text: 'A filha do investigado nasceu com <b>lóbulo auricular preso</b>.' },
            { tag: 'Laudo de Zigose', text: 'Um exame prévio do banco familiar indicou que, nesse locus específico, o investigado é <b>homozigoto</b> (possui dois alelos idênticos).' },
          ],
          labHint: 'Para gerar uma filha com o traço recessivo (ff), qual alelo o investigado precisou passar? E o que significa ser homozigoto?',
          wrongClueHint: 'Reúna os dois fatos: a filha ff exige ao menos um alelo f no investigado, e a homozigose exige que ambos os alelos sejam iguais.',
          explanation: 'A filha ff herdou um alelo f do investigado. Como o laudo atesta que o investigado é homozigoto, seus dois alelos são iguais: ff (lóbulo preso).',
          logic: (g, { canProduce }) => (g === 'FF' || g === 'ff') && canProduce(g, 'ff', 'ff'),
        },
        {
          trait: 'lipWidth',
          requireGenotype: false,
          expectedPheno: 'largos',
          expectedGenotype: 'MM',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Largos', fatherState: 'affected', motherRole: 'Mãe', motherTag: 'Largos', motherState: 'affected' },
          clues: [
            { tag: 'Registro Parental', text: 'Tanto o pai quanto a mãe do investigado possuem <b>lábios largos</b> (extremo homozigoto da dominância incompleta).' },
          ],
          labHint: 'Na dominância incompleta, lábios largos só correspondem a um único genótipo (MM). Cruze MM × MM no rascunho.',
          wrongClueHint: 'Lembre-se de que lábios largos correspondem a MM — nenhum dos pais possui o alelo m.',
          explanation: 'Pais MM × MM produzem apenas gametas M, resultando em 100% de filhos MM (lábios largos).',
          logic: (g, { canProduce }) => canProduce('MM', 'MM', g),
        },
        {
          trait: 'freckles',
          requireGenotype: false,
          expectedPheno: 'presentes',
          expectedGenotype: 'Ss',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'SS', fatherState: 'dom', fatherAlleles: 'SS', motherRole: 'Mãe', motherTag: 'Sem', motherState: 'rec' },
          clues: [
            { tag: 'Prontuário Paterno', text: 'A análise de linhagem confirmou que o pai do investigado possui sardas e produz <b>exclusivamente gametas com o alelo dominante</b>.' },
            { tag: 'Prontuário Materno', text: 'A mãe do investigado não possui nenhuma sarda.' },
          ],
          labHint: 'Se o pai só produz gametas dominantes (S) e a mãe é recessiva (ss), qual é a única combinação possível na prole?',
          wrongClueHint: 'Revise o prontuário paterno: todo gameta do pai carrega S, o que garante o alelo dominante em qualquer filho.',
          explanation: 'Pai homozigoto dominante (SS) × mãe recessiva (ss) resulta em 100% de descendentes Ss, com sardas presentes.',
          logic: (g, { canProduce }) => canProduce('SS', 'ss', g),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 4 — INTERMEDIÁRIO (4 etapas: Sistema ABO + Rh + Genótipo Indeterminado)
    // -----------------------------------------------------------------------
    {
      id: 4,
      code: 'ARQ-46/04',
      level: 'Nível Intermediário',
      title: 'O Frasco da Ala Norte',
      location: 'Laboratório de Análises · 01h25',
      suspectSex: 'M',
      summary: 'Um frasco de vidro quebrou durante a entrada não autorizada na Ala Norte, deixando gotas de sangue na bancada. A partir desta perícia, além do fenótipo, registre o <b>genótipo deduzido</b> (ou indique quando for geneticamente indeterminado).',
      steps: [
        {
          trait: 'abo',
          requireGenotype: true,
          expectedPheno: 'B',
          expectedGenotype: 'IBi',
          pedigree: { layout: 'parents', suspectSex: 'M', suspectNote: 'Soro da cena: só aglutina Anti-B (+)', fatherRole: 'Pai', fatherTag: 'Tipo O', fatherState: 'typeO', motherRole: 'Mãe', motherTag: 'Tipo AB', motherState: 'typeAB' },
          clues: [
            { tag: 'Tipagem Familiar', text: 'O pai do investigado tem sangue <b>tipo O</b> e a mãe tem sangue <b>tipo AB</b>.' },
            { tag: 'Laudo Sorológico da Cena', text: 'A amostra de sangue recolhida na bancada apresentou aglutinação <b>apenas com o soro anti-B</b> (sem reação ao soro anti-A).' },
          ],
          labHint: 'Cruze ii × IᴬIᴮ no Rascunho de Punnett (modo ABO). A reação exclusiva ao soro anti-B descarta qual dos dois resultados possíveis?',
          wrongClueHint: 'Confira ambos os detalhes: aglutinação apenas com anti-B indica fenótipo B; e lembre-se do único alelo que o pai tipo O (ii) pode doar.',
          explanation: 'O pai (ii) doa obrigatoriamente i; a mãe (IᴬIᴮ) doa Iᴬ ou Iᴮ. Como a amostra reagiu apenas ao anti-B, o antígeno presente é o B — portanto, tipo B com genótipo Iᴮi.',
          logic: (g, { canProduce, phenoOf }) => canProduce('ii', 'IAIB', g) && phenoOf(g) === 'B',
        },
        {
          trait: 'rh',
          requireGenotype: true,
          expectedPheno: 'pos',
          expectedGenotype: 'Rr',
          pedigree: { layout: 'offspring', suspectSex: 'M', suspectNote: 'Soro da cena: Anti-Rh (+)', fatherRole: 'Pai', fatherTag: 'Rh+', fatherState: 'dom', motherRole: 'Mãe', motherTag: 'Rh+', motherState: 'dom', spouseRole: 'Esposa', spouseTag: 'Rh−', spouseState: 'rec', childRole: 'Filho', childTag: 'Rh−', childState: 'rec', childShape: 'sq' },
          clues: [
            { tag: 'Laudo Sorológico da Cena', text: 'A mesma amostra de sangue recolhida na bancada apresentou aglutinação nítida ao reagente <b>anti-Rh</b>.' },
            { tag: 'Registro da Prole', text: 'A esposa do investigado é <b>Rh negativo</b>, e o filho do casal também nasceu <b>Rh negativo</b>.' },
          ],
          labHint: 'A aglutinação com anti-Rh define o fenótipo. Para ter um filho Rh negativo (rr), qual segundo alelo o investigado precisa carregar?',
          wrongClueHint: 'Releia os dois laudos: o anti-Rh indica presença do fator dominante R, mas o filho rr exige que o investigado também possua r.',
          explanation: 'A reação ao anti-Rh confirma fenótipo Rh+ (possui R). Como gerou um filho rr com esposa rr, obrigatoriamente transmitiu r — logo seu genótipo é heterozigoto Rr.',
          logic: (g, { canProduce, phenoOf }) => phenoOf(g) === 'pos' && canProduce(g, 'rr', 'rr'),
        },
        {
          trait: 'earlobe',
          requireGenotype: true,
          expectedPheno: 'solto',
          expectedGenotype: 'indeterminado',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Solto', fatherState: 'dom', motherRole: 'Mãe', motherTag: 'Solto', motherState: 'dom', sibRole: 'Irmã', sibTag: 'Preso', sibState: 'rec', spouseRole: 'Esposa', spouseTag: 'Preso', spouseState: 'rec', childRole: 'Filho', childTag: 'Solto', childState: 'dom', childShape: 'sq' },
          clues: [
            { tag: 'Heredograma Parental', text: 'O pai e a mãe do investigado têm lóbulo <b>solto</b>, mas a irmã caçula do investigado nasceu com lóbulo <b>preso</b>.' },
            { tag: 'Registro do Filho', text: 'A esposa do investigado tem lóbulo <b>preso</b>, e o único filho do casal nasceu com lóbulo <b>solto</b>.' },
          ],
          labHint: 'A irmã presa (ff) prova que os pais são Ff × Ff. Agora pergunte: com esposa ff, um filho Ff pode nascer tanto de um pai FF quanto de um pai Ff?',
          wrongClueHint: 'Atenção ao genótipo: o filho Ff garante que o investigado tem ao menos um F (fenótipo solto), mas verifique no Punnett se há pista suficiente para distinguir FF de Ff!',
          explanation: 'Pais Ff × Ff podem gerar filhos FF ou Ff. A esposa ff só doa f, então o filho solto (Ff) prova que o investigado doou F (fenótipo solto). Porém, tanto FF quanto Ff podem gerar um filho Ff — logo o genótipo é indeterminado (F_).',
          logic: (g, { canProduce }) => canProduce('Ff', 'Ff', g) && (canProduce(g, 'ff', 'FF') || canProduce(g, 'ff', 'Ff')),
        },
        {
          trait: 'hairTexture',
          requireGenotype: true,
          expectedPheno: 'ondulado',
          expectedGenotype: 'Tt',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Liso', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Cach.', motherState: 'affected' },
          clues: [
            { tag: 'Prontuário Parental', text: 'O pai do investigado possui cabelo <b>liso</b> e a mãe possui cabelo <b>cacheado</b>.' },
          ],
          labHint: 'Na dominância incompleta, cada fenótipo corresponde a um único genótipo. Cruze tt × TT no rascunho.',
          wrongClueHint: 'Verifique a correspondência direta entre fenótipo e genótipo na dominância incompleta: liso = tt, cacheado = TT.',
          explanation: 'Cruzamento tt × TT produz 100% de descendentes heterozigotos Tt, com textura ondulada.',
          logic: (g, { canProduce }) => canProduce('tt', 'TT', g),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 5 — INTERMEDIÁRIO (5 etapas: ABO Receptor Universal + Cruzamento-Teste + Indeterminado)
    // -----------------------------------------------------------------------
    {
      id: 5,
      code: 'ARQ-46/05',
      level: 'Nível Intermediário',
      title: 'O Envelope Lacrado',
      location: 'Cofre da Diretoria de Pesquisa · 19h50',
      suspectSex: 'M',
      summary: 'Um dossiê de patentes foi fotografado dentro do cofre da diretoria. A equipe reuniu registros hemáticos de doação voluntária e o histórico de duas gerações do investigado.',
      steps: [
        {
          trait: 'abo',
          requireGenotype: true,
          expectedPheno: 'AB',
          expectedGenotype: 'IAIB',
          pedigree: { layout: 'siblings', suspectSex: 'M', suspectNote: 'Hemocentro: Receptor universal (sem anti-A/B)', fatherRole: 'Pai', fatherTag: 'Tipo B', fatherState: 'typeB', motherRole: 'Mãe', motherTag: 'Tipo A', motherState: 'typeA', sibRole: 'Irmão', sibTag: 'Tipo O', sibState: 'typeO', sibShape: 'sq' },
          clues: [
            { tag: 'Tipagem Familiar', text: 'A mãe tem sangue <b>tipo A</b>, o pai tem sangue <b>tipo B</b> e o irmão mais novo nasceu com sangue <b>tipo O</b>.' },
            { tag: 'Cartão de Hemocentro', text: 'Na campanha hospitalar do ano anterior, o sangue do investigado foi classificado como <b>receptor universal de hemácias</b> (sem anticorpos anti-A nem anti-B no plasma).' },
          ],
          labHint: 'O irmão tipo O indica que os pais são Iᴬi × Iᴮi. Qual único grupo sanguíneo do sistema ABO não possui anticorpos anti-A nem anti-B (receptor universal)?',
          wrongClueHint: 'Revise a pista do hemocentro: qual tipo sanguíneo expressa simultaneamente os antígenos A e B por codominância?',
          explanation: 'Os pais Iᴬi × Iᴮi podem gerar todos os 4 tipos ABO. Ser receptor universal (sem anti-A nem anti-B) identifica exclusivamente o tipo AB, genótipo IᴬIᴮ.',
          logic: (g, { canProduce, phenoOf }) => canProduce('IBi', 'IAi', g) && phenoOf(g) === 'AB',
        },
        {
          trait: 'rh',
          requireGenotype: true,
          expectedPheno: 'neg',
          expectedGenotype: 'rr',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Rh−', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Rh−', motherState: 'plain' },
          clues: [
            { tag: 'Prontuário Hemático', text: 'Tanto o pai quanto a mãe do investigado possuem fator <b>Rh negativo</b>.' },
          ],
          labHint: 'Rh negativo é condição recessiva (rr). O que nasce de dois genitores rr × rr?',
          wrongClueHint: 'Pais Rh negativo não possuem o alelo R — revise o cruzamento rr × rr.',
          explanation: 'Pais rr × rr transmitem exclusivamente o alelo r, logo 100% da prole é rr (Rh negativo).',
          logic: (g, { canProduce }) => canProduce('rr', 'rr', g),
        },
        {
          trait: 'dimples',
          requireGenotype: true,
          expectedPheno: 'presentes',
          expectedGenotype: 'Cc',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: '?', motherRole: 'Mãe', motherTag: 'Sem', motherState: 'plain', spouseRole: 'Esposa', spouseTag: 'Sem', spouseState: 'plain', childRole: 'Filha', childTag: 'Covinhas', childState: 'affected' },
          clues: [
            { tag: 'Registro Materno', text: 'A mãe do investigado não possui covinhas faciais.' },
            { tag: 'Registro da Filha', text: 'A esposa do investigado também não possui covinhas, mas a filha do casal nasceu <b>com covinhas marcantes</b>.' },
          ],
          labHint: 'Una duas evidências: o único alelo que a mãe (cc) pôde dar ao investigado e o alelo que o investigado precisou passar à filha.',
          wrongClueHint: 'A mãe cc impede o investigado de ser CC, e a filha com covinhas (com esposa cc) exige que o investigado possua C!',
          explanation: 'Recebeu c da mãe (cc) e doou C à filha (já que a esposa cc só doa c). Genótipo exatamente determinado: Cc (covinhas presentes).',
          logic: (g, { canProduce }) => g.includes('c') && (canProduce(g, 'cc', 'CC') || canProduce(g, 'cc', 'Cc')),
        },
        {
          trait: 'hairline',
          requireGenotype: true,
          expectedPheno: 'pico',
          expectedGenotype: 'indeterminado',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Pico', fatherState: 'affected', motherRole: 'Mãe', motherTag: 'Pico', motherState: 'affected', sibRole: 'Irmã', sibTag: 'Reta', sibState: 'plain', spouseRole: 'Esposa', spouseTag: 'Reta', spouseState: 'plain', childRole: 'Filho', childTag: 'Pico', childState: 'affected', childShape: 'sq' },
          clues: [
            { tag: 'Heredograma Parental', text: 'Pai e mãe exibem <b>pico de viúva</b>, mas a irmã do investigado nasceu com <b>linha reta</b>.' },
            { tag: 'Registro da Prole', text: 'Com esposa de <b>linha reta</b>, o investigado teve um único filho, que nasceu com <b>pico de viúva</b>.' },
          ],
          labHint: 'Teste no Rascunho de Punnett tanto PP × pp quanto Pp × pp: ambos conseguem produzir um único filho com pico de viúva?',
          wrongClueHint: 'O filho confirma a presença de ao menos um P, mas com pais Pp × Pp verifique se as pistas conseguem eliminar PP ou Pp.',
          explanation: 'Pais Pp × Pp geram filhos PP ou Pp. Um único filho Pp com esposa pp confirma fenótipo pico de viúva, mas não descarta PP nem Pp — logo genótipo indeterminado (P_).',
          logic: (g, { canProduce }) => canProduce('Pp', 'Pp', g) && (canProduce(g, 'pp', 'PP') || canProduce(g, 'pp', 'Pp')),
        },
        {
          trait: 'lipWidth',
          requireGenotype: true,
          expectedPheno: 'medios',
          expectedGenotype: 'Mm',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Largos', fatherState: 'affected', motherRole: 'Mãe', motherTag: '?', spouseRole: 'Esposa', spouseTag: 'Médios', spouseState: 'carrier', childRole: 'Filho', childTag: 'Finos', childState: 'plain', childShape: 'sq' },
          clues: [
            { tag: 'Registro Paterno', text: 'O pai do investigado possui <b>lábios largos</b> (<span class="mono">MM</span>).' },
            { tag: 'Registro Familiar', text: 'Com uma esposa de <b>lábios médios</b>, o investigado teve um filho de <b>lábios finos</b>.' },
          ],
          labHint: 'Do pai MM o investigado recebeu qual alelo? E para gerar um filho mm, qual segundo alelo ele obrigatoriamente possui?',
          wrongClueHint: 'Combine pai MM (doa M) com filho mm (recebeu m do investigado): qual genótipo reúne M e m?',
          explanation: 'Recebeu M do pai (MM) e transmitiu m ao filho de lábios finos (mm). Logo é Mm, expressando lábios médios.',
          logic: (g, { canProduce }) => g.includes('M') && canProduce(g, 'Mm', 'mm'),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 6 — INTERMEDIÁRIO (5 etapas: ABO por Descendência + Cruzamento-Teste + Gametas)
    // -----------------------------------------------------------------------
    {
      id: 6,
      code: 'ARQ-46/06',
      level: 'Nível Intermediário',
      title: 'Troca no Banco de Amostras',
      location: 'Câmara Fria de Sorologia · 14h05',
      suspectSex: 'M',
      summary: 'Dois tubos de sangue tiveram os códigos invertidos antes de uma auditoria. Recorra aos registros de pais, cônjuge e filhos para determinar fenótipo e genótipo em 5 etapas.',
      steps: [
        {
          trait: 'abo',
          requireGenotype: true,
          expectedPheno: 'A',
          expectedGenotype: 'IAi',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Tipo O', fatherState: 'plain', motherRole: 'Mãe', motherTag: '?', spouseRole: 'Esposa', spouseTag: 'Tipo O', spouseState: 'plain', childRole: 'Filha', childTag: 'Tipo A', childState: 'affected' },
          clues: [
            { tag: 'Registro Paterno', text: 'O pai do investigado possui sangue <b>tipo O</b>.' },
            { tag: 'Registro da Descendência', text: 'A esposa do investigado também tem sangue <b>tipo O</b>, mas a filha do casal nasceu com sangue <b>tipo A</b>.' },
          ],
          labHint: 'Use o pai (ii) para descobrir um dos alelos do investigado e a filha tipo A (com esposa ii) para descobrir o outro alelo.',
          wrongClueHint: 'A esposa tipo O só doa i; logo o alelo Iᴬ da filha veio do investigado, enquanto o pai tipo O transmitiu i ao investigado.',
          explanation: 'Recebeu i do pai (ii) e doou Iᴬ à filha tipo A (pois a esposa ii só doa i). Logo, o investigado é tipo A com genótipo heterozigoto Iᴬi.',
          logic: (g, { canProduce }) => g.includes('i') && (canProduce(g, 'ii', 'IAIA') || canProduce(g, 'ii', 'IAi')),
        },
        {
          trait: 'rh',
          requireGenotype: true,
          expectedPheno: 'pos',
          expectedGenotype: 'indeterminado',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Rh+', fatherState: 'affected', motherRole: 'Mãe', motherTag: 'Rh+', motherState: 'affected', sibRole: 'Irmão', sibTag: 'Rh−', sibState: 'plain', sibShape: 'sq', spouseRole: 'Esposa', spouseTag: 'Rh−', spouseState: 'plain', childRole: 'Filha', childTag: 'Rh+', childState: 'affected' },
          clues: [
            { tag: 'Heredograma Familiar', text: 'Pai e mãe são <b>Rh positivo</b>, mas o irmão do investigado nasceu <b>Rh negativo</b>.' },
            { tag: 'Registro da Filha', text: 'Com esposa <b>Rh negativo</b>, o investigado teve uma única filha, nascida <b>Rh positivo</b>.' },
          ],
          labHint: 'Os pais são Rr × Rr. Uma única filha Rh+ com esposa rr permite afirmar com certeza se o investigado é RR ou Rr?',
          wrongClueHint: 'Teste RR × rr e Rr × rr no Rascunho de Punnett: ambos podem gerar uma filha Rr! Verifique a opção de genótipo indeterminado.',
          explanation: 'A filha Rh+ (Rr) com esposa rr garante que o investigado possui R (Rh+). Como os pais são Rr × Rr, o investigado pode ser RR ou Rr — genótipo indeterminado (R_).',
          logic: (g, { canProduce }) => canProduce('Rr', 'Rr', g) && (canProduce(g, 'rr', 'RR') || canProduce(g, 'rr', 'Rr')),
        },
        {
          trait: 'cleftChin',
          requireGenotype: true,
          expectedPheno: 'presente',
          expectedGenotype: 'Qq',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: '?', motherRole: 'Mãe', motherTag: 'Liso', motherState: 'plain', spouseRole: 'Esposa', spouseTag: 'Liso', spouseState: 'plain', childRole: 'Filho', childTag: 'Fenda', childState: 'affected', childShape: 'sq' },
          clues: [
            { tag: 'Arquivo Materno', text: 'A mãe do investigado tem queixo <b>liso</b> (sem fenda).' },
            { tag: 'Arquivo da Prole', text: 'A esposa também tem queixo <b>liso</b>, porém o filho do casal apresenta nítida <b>fenda no queixo</b>.' },
          ],
          labHint: 'Combine o alelo obrigatoriamente herdado da mãe (qq) com o alelo que precisou ser doado ao filho.',
          wrongClueHint: 'A mãe qq garante um alelo q no investigado; já o filho com fenda (esposa qq) exige um alelo Q no investigado.',
          explanation: 'Herdou q da mãe (qq) e transmitiu Q ao filho (esposa qq só doa q). Portanto é heterozigoto Qq, com fenda no queixo presente.',
          logic: (g, { canProduce }) => g.includes('q') && (canProduce(g, 'qq', 'QQ') || canProduce(g, 'qq', 'Qq')),
        },
        {
          trait: 'freckles',
          requireGenotype: true,
          expectedPheno: 'ausentes',
          expectedGenotype: 'ss',
          pedigree: { layout: 'threeGen', suspectSex: 'M', gp1Role: 'Avô P.', gp1Tag: 'Sem', gp1State: 'rec', gp2Role: 'Avó P.', gp2Tag: 'Sem', gp2State: 'rec', gp3Role: 'Avô M.', gp3Tag: 'Sem', gp3State: 'rec', gp4Role: 'Avó M.', gp4Tag: 'Sem', gp4State: 'rec', fatherRole: 'Pai', fatherTag: 'Sem', fatherState: 'rec', motherRole: 'Mãe', motherTag: 'Sem', motherState: 'rec' },
          clues: [
            { tag: 'Fichário Parental', text: 'Nenhum dos dois genitores do investigado apresenta sardas.' },
          ],
          labHint: 'Pais sem sardas são ss × ss. Qual é o único genótipo possível para os filhos?',
          wrongClueHint: 'Revise o fichário parental: dois genitores ss × ss não carregam o alelo S.',
          explanation: 'Cruzamento ss × ss produz 100% de filhos ss (sardas ausentes).',
          logic: (g, { canProduce }) => canProduce('ss', 'ss', g),
        },
        {
          trait: 'hairTexture',
          requireGenotype: true,
          expectedPheno: 'cacheado',
          expectedGenotype: 'TT',
          pedigree: { layout: 'offspring', suspectSex: 'M', suspectNote: 'Laudo: produz 1 único tipo de gameta', fatherRole: 'Pai', fatherTag: '?', fatherState: 'unknown', motherRole: 'Mãe', motherTag: '?', motherState: 'unknown', spouseRole: 'Esposa', spouseTag: 'Liso', spouseState: 'rec', childRole: 'Filha', childTag: 'Ond.', childState: 'inter' },
          clues: [
            { tag: 'Registro Familiar', text: 'Com esposa de cabelo <b>liso</b>, o investigado teve uma filha de cabelo <b>ondulado</b>.' },
            { tag: 'Laudo Gamético', text: 'O laboratório constatou que, para o gene da textura capilar, o investigado produz <b>apenas um único tipo de alelo em seus gametas</b>.' },
          ],
          labHint: 'Se a esposa lisa (tt) só passa t e a filha é ondulada (Tt), qual alelo veio do investigado? E se ele só produz esse único tipo de alelo nos gametas, qual é seu genótipo?',
          wrongClueHint: 'Produzir apenas um tipo de alelo nos gametas significa ser homozigoto; e a filha Tt exige que esse alelo seja T!',
          explanation: 'A filha Tt recebeu t da mãe (tt) e T do investigado. Como o investigado produz somente um tipo de gameta, é homozigoto TT (cabelo cacheado).',
          logic: (g, { canProduce }) => (g === 'TT' || g === 'tt') && canProduce(g, 'tt', 'Tt'),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 7 — AVANÇADO (5 etapas: Herança Ligada ao X — Suspeito Masculino + ABO)
    // -----------------------------------------------------------------------
    {
      id: 7,
      code: 'ARQ-46/07',
      level: 'Nível Avançado',
      title: 'O Painel da Subestação',
      location: 'Subestação Elétrica do Arquivo · 03h10',
      suspectSex: 'M',
      summary: 'O alarme do subsolo foi desligado por um invasor do <b>sexo masculino</b>. O vigia noturno observou um comportamento incomum diante dos indicadores coloridos do painel. Analise herança ligada ao cromossomo X, ABO e traços faciais.',
      steps: [
        {
          trait: 'colorVision',
          requireGenotype: true,
          expectedPheno: 'daltonico',
          expectedGenotype: 'XdY',
          pedigree: { layout: 'threeGen', suspectSex: 'M', suspectNote: 'Vigia: confundiu fios vermelho e verde', gp1Role: 'Avô P.', gp1Tag: 'Norm.', gp1State: 'rec', gp2Role: 'Avó P.', gp2Tag: 'Norm.', gp2State: 'rec', gp3Role: 'Avô M.', gp3Tag: 'Dalt.', gp3State: 'clinical', gp4Role: 'Avó M.', gp4Tag: 'Norm.', gp4State: 'rec', fatherRole: 'Pai', fatherTag: 'Norm.', fatherState: 'rec', motherRole: 'Mãe', motherTag: 'Port.', motherState: 'carrier' },
          clues: [
            { tag: 'Heredograma Materno', text: 'O <b>avô materno</b> do investigado tinha daltonismo vermelho-verde. A mãe do investigado tem visão cromática normal.' },
            { tag: 'Depoimento do Vigia', text: 'Pelo circuito interno, o invasor hesitou repetidamente diante dos LEDs do painel, <b>confundindo os fios vermelho e verde</b> até testar pela posição numérica.' },
          ],
          labHint: 'Homens herdam o cromossomo Y do pai e um X da mãe. A mãe (filha de pai XᵈY) é portadora XᴰXᵈ. O que o relato do vigia confirma sobre o X herdado pelo investigado?',
          wrongClueHint: 'Revise a herança ligada ao X em homens (XY) e o depoimento do vigia sobre os fios vermelho e verde.',
          explanation: 'A mãe herdou Xᵈ do avô materno (portadora XᴰXᵈ). Como o investigado masculino confundiu sinais vermelho e verde, herdou Xᵈ da mãe e Y do pai — genótipo XᵈY (daltônico).',
          logic: (g, { canProduce, phenoOf }) => canProduce('XDY', 'XDXd', g) && phenoOf(g) === 'daltonico',
        },
        {
          trait: 'abo',
          requireGenotype: true,
          expectedPheno: 'B',
          expectedGenotype: 'IBIB',
          pedigree: { layout: 'offspring', suspectSex: 'M', suspectNote: 'Laudo: Homozigoto no sistema ABO', fatherRole: 'Pai', fatherTag: 'AB', fatherState: 'typeAB', motherRole: 'Mãe', motherTag: 'AB', motherState: 'typeAB', spouseRole: 'Esposa', spouseTag: 'Tipo O', spouseState: 'typeO', childRole: 'Filho', childTag: 'Tipo B', childState: 'typeB', childShape: 'sq' },
          clues: [
            { tag: 'Tipagem Parental', text: 'Tanto o pai quanto a mãe do investigado possuem sangue <b>tipo AB</b>.' },
            { tag: 'Laudo da Descendência', text: 'O investigado casou-se com uma mulher <b>tipo O</b> e tiveram um filho <b>tipo B</b>. Além disso, o registro sorológico indica que o investigado é <b>homozigoto</b> no sistema ABO.' },
          ],
          labHint: 'Cruze IᴬIᴮ × IᴬIᴮ no Rascunho de Punnett (modo ABO). Quais genótipos resultantes são homozigotos? Qual deles pode gerar um filho tipo B com esposa ii?',
          wrongClueHint: 'Atente às duas pistas: pais AB × AB não transmitem o alelo i, e o filho tipo B exige o alelo Iᴮ.',
          explanation: 'Filho de IᴬIᴮ × IᴬIᴮ nunca possui o alelo i (só pode ser IᴬIᴬ, IᴬIᴮ ou IᴮIᴮ). Como é homozigoto e gerou filho tipo B (Iᴮi) com esposa ii, é obrigatoriamente IᴮIᴮ (tipo B).',
          logic: (g, { canProduce }) => canProduce('IAIB', 'IAIB', g) && (g === 'IAIA' || g === 'IBIB' || g === 'ii') && (canProduce(g, 'ii', 'IBIB') || canProduce(g, 'ii', 'IBi')),
        },
        {
          trait: 'earlobe',
          requireGenotype: true,
          expectedPheno: 'solto',
          expectedGenotype: 'Ff',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Preso', fatherState: 'rec', motherRole: 'Mãe', motherTag: '?', motherState: 'unknown', spouseRole: 'Esposa', spouseTag: 'Preso', spouseState: 'rec', childRole: 'Filho', childTag: 'Solto', childState: 'dom', childShape: 'sq' },
          clues: [
            { tag: 'Registro Paterno', text: 'O pai do investigado possui lóbulo auricular <b>preso</b>.' },
            { tag: 'Registro da Prole', text: 'A esposa também tem lóbulo <b>preso</b>, mas o filho do casal nasceu com lóbulo <b>solto</b>.' },
          ],
          labHint: 'Qual alelo o pai (ff) necessariamente passou ao investigado? E qual alelo o investigado precisou passar ao filho solto?',
          wrongClueHint: 'Junte o pai ff (doa f) com o filho solto de esposa ff (exige F do investigado).',
          explanation: 'Recebeu f do pai (ff) e transmitiu F ao filho (esposa ff só doa f). Logo o investigado é Ff (lóbulo solto).',
          logic: (g, { canProduce }) => g.includes('f') && (canProduce(g, 'ff', 'FF') || canProduce(g, 'ff', 'Ff')),
        },
        {
          trait: 'dimples',
          requireGenotype: true,
          expectedPheno: 'ausentes',
          expectedGenotype: 'cc',
          pedigree: { layout: 'siblings', suspectSex: 'M', suspectNote: 'Laudo: 100% gametas recessivos (c)', fatherRole: 'Pai', fatherTag: 'Cov.', fatherState: 'dom', motherRole: 'Mãe', motherTag: 'Cov.', motherState: 'dom', sibRole: 'Irmão', sibTag: 'Sem', sibState: 'rec', sibShape: 'sq' },
          clues: [
            { tag: 'Heredograma Parental', text: 'Ambos os pais têm covinhas, mas o irmão caçula nasceu sem covinhas.' },
            { tag: 'Laudo Gamético', text: 'A análise de gametas do investigado registrou <b>100% de alelos recessivos</b> para esse gene.' },
          ],
          labHint: 'Se 100% dos gametas de um indivíduo carregam o alelo recessivo c, qual é o único genótipo possível?',
          wrongClueHint: 'Revise o laudo gamético: um heterozigoto (Cc) produziria 50% de gametas C, o que foi descartado.',
          explanation: 'Produzindo exclusivamente gametas c, o investigado é homozigoto recessivo cc (covinhas ausentes), resultado compatível com pais Cc × Cc.',
          logic: (g, { canProduce }) => canProduce('Cc', 'Cc', g) && g === 'cc',
        },
        {
          trait: 'hairTexture',
          requireGenotype: true,
          expectedPheno: 'liso',
          expectedGenotype: 'tt',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Liso', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Liso', motherState: 'plain' },
          clues: [
            { tag: 'Registro Parental', text: 'Tanto o pai quanto a mãe do investigado têm cabelo <b>liso</b>.' },
          ],
          labHint: 'Cruze tt × tt no rascunho. Há algum alelo T presente nos pais?',
          wrongClueHint: 'Pais lisos são tt × tt e só transmitem gametas t.',
          explanation: 'Pais tt × tt só geram filhos tt (cabelo liso).',
          logic: (g, { canProduce }) => canProduce('tt', 'tt', g),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 8 — AVANÇADO (5 etapas: Herança Ligada ao X — Suspeita Feminina Portadora!)
    // -----------------------------------------------------------------------
    {
      id: 8,
      code: 'ARQ-46/08',
      level: 'Nível Avançado',
      title: 'A Perita Desaparecida',
      location: 'Setor de Hematologia Forense · 20h00',
      suspectSex: 'F',
      summary: 'Uma analista do <b>sexo feminino</b> deixou pistas codificadas sobre sua linhagem antes de se ausentar do posto sob sigilo. Atenção redobrada à herança ligada ao cromossomo X em mulheres (dois cromossomos X)!',
      steps: [
        {
          trait: 'colorVision',
          requireGenotype: true,
          expectedPheno: 'normal',
          expectedGenotype: 'XDXd',
          pedigree: { layout: 'offspring', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Dalt.', fatherState: 'affected', motherRole: 'Mãe', motherTag: 'Norm.', motherState: 'carrier', sibRole: 'Irmão', sibTag: 'Dalt.', sibState: 'affected', sibShape: 'sq', spouseRole: 'Cônjuge', spouseTag: '?', childRole: 'Filho', childTag: 'Norm.', childState: 'plain', childShape: 'sq' },
          clues: [
            { tag: 'Registro Paterno', text: 'O <b>pai</b> da investigada apresenta daltonismo vermelho-verde (<span class="mono">XᵈY</span>).' },
            { tag: 'Registro da Prole', text: 'A investigada teve um <b>filho do sexo masculino com visão cromática normal</b>.' },
          ],
          labHint: 'Faça em duas etapas: 1) Toda filha mulher herda qual cromossomo do pai XᵈY? 2) Um filho homem herda seu único cromossomo X de quem? Junte os dois cromossomos X da investigada!',
          wrongClueHint: 'Lembre-se: do pai daltônico (XᵈY), a filha recebe obrigatoriamente Xᵈ; e para gerar um filho homem normal (XᴰY), ela precisou doar Xᴰ!',
          explanation: 'Recebeu Xᵈ do pai (XᵈY) e transmitiu Xᴰ ao filho masculino (XᴰY, que recebe Y do pai e X da mãe). Logo a investigada é XᴰXᵈ: visão normal, porém portadora.',
          logic: (g, { canProduce }) => g.includes('Xd') && canProduce(g, 'XDY', 'XDY') && canProduce(g, 'XdY', 'XDY'),
        },
        {
          trait: 'abo',
          requireGenotype: true,
          expectedPheno: 'O',
          expectedGenotype: 'ii',
          pedigree: { layout: 'siblings', suspectSex: 'F', suspectNote: 'Prontuário: sem reação Anti-A nem Anti-B', fatherRole: 'Pai', fatherTag: 'Tipo A', fatherState: 'typeA', motherRole: 'Mãe', motherTag: 'Tipo B', motherState: 'typeB', sibRole: 'Irmão', sibTag: 'Tipo O', sibState: 'typeO', sibShape: 'sq' },
          clues: [
            { tag: 'Tipagem Familiar', text: 'O pai é <b>tipo A</b>, a mãe é <b>tipo B</b> e o irmão nasceu <b>tipo O</b>.' },
            { tag: 'Ficha Hospitalar', text: 'O prontuário de emergência registra que as hemácias da investigada <b>não reagiram nem ao soro anti-A nem ao soro anti-B</b> (doadora universal de hemácias).' },
          ],
          labHint: 'Qual tipo sanguíneo não apresenta antígenos A nem B na membrana das hemácias?',
          wrongClueHint: 'Ausência de reação tanto ao anti-A quanto ao anti-B descarta os alelos Iᴬ e Iᴮ.',
          explanation: 'Sem antígenos A nem B na superfície das hemácias, o sangue é tipo O, de genótipo exclusivamente recessivo ii (possível dos pais Iᴬi × Iᴮi).',
          logic: (g, { canProduce, phenoOf }) => canProduce('IAi', 'IBi', g) && phenoOf(g) === 'O',
        },
        {
          trait: 'rh',
          requireGenotype: true,
          expectedPheno: 'pos',
          expectedGenotype: 'Rr',
          pedigree: { layout: 'offspring', suspectSex: 'F', fatherRole: 'Pai', fatherTag: '?', motherRole: 'Mãe', motherTag: 'Rh−', motherState: 'plain', spouseRole: 'Cônjuge', spouseTag: 'Rh−', spouseState: 'plain', childRole: 'Filho', childTag: 'Rh+', childState: 'affected', childShape: 'sq' },
          clues: [
            { tag: 'Prontuário Materno', text: 'A mãe da investigada é <b>Rh negativo</b>.' },
            { tag: 'Prontuário da Prole', text: 'O cônjuge da investigada também é <b>Rh negativo</b>, mas o filho do casal nasceu <b>Rh positivo</b>.' },
          ],
          labHint: 'Da mãe rr a investigada recebeu qual alelo? E para o filho nascer Rh+ sendo o pai rr, qual alelo veio da investigada?',
          wrongClueHint: 'Combine mãe rr (doa r) com filho Rh+ de cônjuge rr (exige R da investigada).',
          explanation: 'Recebeu r da mãe (rr) e transmitiu R ao filho (pois o cônjuge rr só transmite r). Genótipo Rr (Rh positivo).',
          logic: (g, { canProduce }) => g.includes('r') && (canProduce(g, 'rr', 'RR') || canProduce(g, 'rr', 'Rr')),
        },
        {
          trait: 'hairline',
          requireGenotype: true,
          expectedPheno: 'reta',
          expectedGenotype: 'pp',
          pedigree: { layout: 'parents', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Reta', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Reta', motherState: 'plain' },
          clues: [
            { tag: 'Registro Parental', text: 'Tanto o pai quanto a mãe da investigada apresentam linha frontal do cabelo <b>reta</b>.' },
          ],
          labHint: 'Linha reta é recessiva (pp). O que resulta de pp × pp?',
          wrongClueHint: 'Dois genitores de linha reta (pp × pp) só produzem gametas p.',
          explanation: 'Pais pp × pp originam exclusivamente filhas pp (linha frontal reta).',
          logic: (g, { canProduce }) => canProduce('pp', 'pp', g),
        },
        {
          trait: 'freckles',
          requireGenotype: true,
          expectedPheno: 'presentes',
          expectedGenotype: 'indeterminado',
          pedigree: { layout: 'offspring', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Sardas', fatherState: 'affected', motherRole: 'Mãe', motherTag: 'Sardas', motherState: 'affected', sibRole: 'Irmã', sibTag: 'Sem', sibState: 'plain', spouseRole: 'Cônjuge', spouseTag: 'Sem', spouseState: 'plain', childRole: 'Filha', childTag: 'Sardas', childState: 'affected' },
          clues: [
            { tag: 'Heredograma Familiar', text: 'Pai e mãe têm sardas, mas a irmã da investigada não apresenta sardas.' },
            { tag: 'Registro da Filha', text: 'O cônjuge da investigada não tem sardas, mas a única filha do casal nasceu <b>com sardas</b>.' },
          ],
          labHint: 'Os pais são Ss × Ss. Uma única filha com sardas (pai ss) permite descartar SS ou descartar Ss?',
          wrongClueHint: 'A filha confirma o alelo S na investigada, mas verifique se SS e Ss não explicam igualmente o mesmo resultado!',
          explanation: 'A filha Ss (de pai ss) comprova que a investigada possui S (sardas presentes). Como seus pais são Ss × Ss, ela pode ser SS ou Ss — genótipo indeterminado (S_).',
          logic: (g, { canProduce }) => canProduce('Ss', 'Ss', g) && (canProduce(g, 'ss', 'SS') || canProduce(g, 'ss', 'Ss')),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 9 — PERITO SÊNIOR (6 etapas: 3 Gerações + Cor dos Olhos em 2 Genes + Ligado ao X + ABO)
    // -----------------------------------------------------------------------
    {
      id: 9,
      code: 'ARQ-46/09',
      level: 'Perito Sênior',
      title: 'O Herdeiro dos Olhos de Esmeralda',
      location: 'Cartório de Sucessões · 16h30',
      suspectSex: 'M',
      summary: 'A autenticidade de um herdeiro do <b>sexo masculino</b> está sob contestação judicial. Este dossiê exige dominar o modelo de <b>dois pares gênicos para a cor dos olhos</b> (<span class="mono">E/e</span> e <span class="mono">G/g</span>), além de herança ligada ao X e ABO em 3 gerações.',
      steps: [
        {
          trait: 'eyeColor',
          requireGenotype: true,
          expectedPheno: 'verde',
          expectedGenotype: 'eeGg',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Verde', fatherState: 'eyeGreen', motherRole: 'Mãe', motherTag: 'Azul', motherState: 'eyeBlue', spouseRole: 'Esposa', spouseTag: 'Azul', spouseState: 'eyeBlue', childRole: 'Filho', childTag: 'Verde', childState: 'eyeGreen', childShape: 'sq' },
          clues: [
            { tag: 'Nota de Interação Gênica', text: 'Modelo de dois pares: ao menos um alelo <span class="mono">E</span> produz olhos <b>castanhos</b>; em <span class="mono">ee</span>, ao menos um <span class="mono">G</span> produz olhos <b>verdes</b>; já <span class="mono">ee gg</span> gera olhos <b>azuis</b>.' },
            { tag: 'Registro Parental', text: 'A mãe do investigado tem olhos <b>azuis</b> (<span class="mono">ee gg</span>). O pai tem olhos <b>verdes</b> (<span class="mono">ee G_</span>).' },
            { tag: 'Registro da Prole', text: 'A esposa do investigado tem olhos <b>azuis</b> (<span class="mono">ee gg</span>), e o filho do casal nasceu com olhos <b>verdes</b>.' },
          ],
          labHint: 'Separe os dois pares! 1) Nem o pai (ee) nem a mãe (ee) possuem E — logo qual é o par E/e do investigado? 2) A mãe ee gg passou qual alelo de G/g? E o filho verde (com esposa ee gg) exige qual alelo de G/g vindo do investigado?',
          wrongClueHint: 'Analise cada par separadamente: pais ee × ee fixam ee no investigado; mãe gg doa g, e filho verde com esposa gg exige que o investigado doe G!',
          explanation: 'Como ambos os pais são ee, o investigado é obrigatoriamente ee. Da mãe (ee gg) recebeu g; para gerar um filho verde (ee Gg) com esposa azul (ee gg), precisou doar G. Portanto é ee Gg (olhos verdes).',
          logic: (g, { canProduce }) => (canProduce('eeGG', 'eegg', g) || canProduce('eeGg', 'eegg', g)) && canProduce(g, 'eegg', 'eeGg'),
        },
        {
          trait: 'colorVision',
          requireGenotype: true,
          expectedPheno: 'daltonico',
          expectedGenotype: 'XdY',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Norm.', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Dalt.', motherState: 'affected' },
          clues: [
            { tag: 'Prontuário Oftalmológico', text: 'A mãe do investigado possui <b>daltonismo vermelho-verde</b>, enquanto o pai apresenta visão cromática normal.' },
          ],
          labHint: 'Para uma mulher ser daltônica, qual é o único genótipo possível (XᵈXᵈ)? E qual cromossomo sexual o filho homem recebe do pai e qual recebe da mãe?',
          wrongClueHint: 'Lembre-se de que o pai normal (XᴰY) transmite o cromossomo Y ao filho homem, enquanto a mãe daltônica (XᵈXᵈ) só tem Xᵈ para transmitir.',
          explanation: 'A mãe daltônica (XᵈXᵈ) doa obrigatoriamente Xᵈ; o pai (XᴰY) doa Y ao filho masculino. Assim, 100% dos filhos homens são XᵈY (daltônicos).',
          logic: (g, { canProduce }) => canProduce('XDY', 'XdXd', g),
        },
        {
          trait: 'abo',
          requireGenotype: true,
          expectedPheno: 'A',
          expectedGenotype: 'IAi',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'AB', fatherState: 'affected', motherRole: 'Mãe', motherTag: 'Tipo O', motherState: 'plain', spouseRole: 'Esposa', spouseTag: 'IᴮIᴮ', spouseState: 'affected', childRole: 'Filho', childTag: 'AB', childState: 'affected', childShape: 'sq' },
          clues: [
            { tag: 'Tipagem Parental', text: 'A mãe do investigado tem sangue <b>tipo O</b> e o pai tem sangue <b>tipo AB</b>.' },
            { tag: 'Tipagem da Descendência', text: 'A esposa do investigado é tipo B homozigota (<span class="mono">IᴮIᴮ</span>), e o filho do casal nasceu com sangue <b>tipo AB</b>.' },
          ],
          labHint: 'Da mãe tipo O (ii) o investigado herdou i. Da esposa IᴮIᴮ o filho herdou Iᴮ. Que alelo o investigado precisou doar para o filho ser AB?',
          wrongClueHint: 'Revise a pista do filho AB: como a esposa só possui Iᴮ, o alelo Iᴬ do filho veio necessariamente do investigado.',
          explanation: 'Recebeu i da mãe (ii) e doou Iᴬ ao filho IᴬIᴮ (a esposa IᴮIᴮ doou Iᴮ). Logo o investigado é tipo A, genótipo Iᴬi.',
          logic: (g, { canProduce }) => canProduce('IAIB', 'ii', g) && canProduce(g, 'IBIB', 'IAIB'),
        },
        {
          trait: 'cleftChin',
          requireGenotype: true,
          expectedPheno: 'ausente',
          expectedGenotype: 'qq',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Liso', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Liso', motherState: 'plain' },
          clues: [
            { tag: 'Registro Parental', text: 'Tanto o pai quanto a mãe do investigado têm queixo liso (sem fenda).' },
          ],
          labHint: 'Queixo liso é recessivo (qq). Qual é o resultado de qq × qq?',
          wrongClueHint: 'Pais qq × qq só transmitem gametas q.',
          explanation: 'Pais qq × qq geram 100% de descendentes qq (queixo liso).',
          logic: (g, { canProduce }) => canProduce('qq', 'qq', g),
        },
        {
          trait: 'lipWidth',
          requireGenotype: true,
          expectedPheno: 'medios',
          expectedGenotype: 'Mm',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Finos', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Largos', motherState: 'affected' },
          clues: [
            { tag: 'Prontuário Facial', text: 'A mãe apresenta <b>lábios largos</b> e o pai apresenta <b>lábios finos</b>.' },
          ],
          labHint: 'Cruze MM × mm na dominância incompleta.',
          wrongClueHint: 'Lábios largos (MM) × lábios finos (mm) resultam sempre no heterozigoto intermediário.',
          explanation: 'Mãe MM × pai mm produz 100% de filhos Mm (lábios médios).',
          logic: (g, { canProduce }) => canProduce('mm', 'MM', g),
        },
        {
          trait: 'hairline',
          requireGenotype: true,
          expectedPheno: 'pico',
          expectedGenotype: 'Pp',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Reta', fatherState: 'plain', motherRole: 'Mãe', motherTag: '?', spouseRole: 'Esposa', spouseTag: 'Reta', spouseState: 'plain', childRole: 'Filha', childTag: 'Pico', childState: 'affected' },
          clues: [
            { tag: 'Registro Paterno', text: 'O pai do investigado possui linha frontal do cabelo <b>reta</b>.' },
            { tag: 'Registro da Filha', text: 'A esposa também possui linha <b>reta</b>, porém a filha nasceu com <b>pico de viúva</b>.' },
          ],
          labHint: 'Do pai pp veio p; para a filha ter pico de viúva com mãe pp, qual alelo veio do investigado?',
          wrongClueHint: 'Combine pai pp (garante p) com filha Pp de esposa pp (garante P).',
          explanation: 'Recebeu p do pai (pp) e doou P à filha (esposa pp só doa p). Genótipo Pp, com pico de viúva.',
          logic: (g, { canProduce }) => g.includes('p') && (canProduce(g, 'pp', 'PP') || canProduce(g, 'pp', 'Pp')),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 10 — PERITO SÊNIOR (6 etapas: EPISTASIA RECESSIVA / ALBINISMO aa MASCARANDO O RETRATO!)
    // -----------------------------------------------------------------------
    {
      id: 10,
      code: 'ARQ-46/10',
      level: 'Perito Sênior',
      title: 'O Fantasma do Laboratório Central',
      location: 'Câmara de Arquivo Restrito · 04h05',
      suspectSex: 'M',
      summary: 'Um invasor do <b>sexo masculino</b> foi avistado fugindo do laboratório central. A investigação encontrou indícios de <b>epistasia recessiva (albinismo)</b> na família — um mecanismo capaz de bloquear a produção de melanina e <b>mascarar visualmente</b> sardas, cor do cabelo e cor dos olhos, mesmo quando o suspeito carrega alelos para esses traços!',
      steps: [
        {
          trait: 'albinism',
          requireGenotype: true,
          expectedPheno: 'albino',
          expectedGenotype: 'aa',
          pedigree: { layout: 'siblings', suspectSex: 'M', suspectNote: 'Laudo: 100% gametas recessivos (a)', fatherRole: 'Pai', fatherTag: 'Típico', fatherState: 'carrier', motherRole: 'Mãe', motherTag: 'Típica', motherState: 'carrier', sibRole: 'Irmã', sibTag: 'Albina', sibState: 'clinical' },
          clues: [
            { tag: 'Heredograma Familiar', text: 'Pai e mãe têm pigmentação típica, mas a irmã do investigado nasceu com <b>albinismo</b> (<span class="mono">aa</span>), provando que ambos os pais são portadores.' },
            { tag: 'Laudo Gamético', text: 'A análise molecular confirmou que o investigado produz <b>exclusivamente gametas com o alelo recessivo <span class="mono">a</span></b>.' },
          ],
          labHint: 'Se um indivíduo produz apenas gametas com o alelo a, qual é seu genótipo e qual efeito isso causa na produção de melanina?',
          wrongClueHint: 'Revise o laudo gamético: ausência de gametas A indica homozigose recessiva aa (albinismo).',
          explanation: 'Produzindo 100% de gametas a, o investigado é homozigoto recessivo aa (albinismo). A ausência de melanina ativa epistasia recessiva sobre a pigmentação da pele, dos fios, das sardas e da íris.',
          logic: (g, { canProduce }) => canProduce('Aa', 'Aa', g) && g === 'aa',
        },
        {
          trait: 'freckles',
          requireGenotype: true,
          epistaticMask: true,
          expectedPheno: 'ausentes',
          expectedGenotype: 'Ss',
          pedigree: { layout: 'parents', suspectSex: 'M', suspectNote: 'Epistasia (Etapa 1): aa bloqueia melanina!', fatherRole: 'Pai', fatherTag: 'SS', fatherState: 'dom', fatherAlleles: 'SS', motherRole: 'Mãe', motherTag: 'Sem', motherState: 'rec' },
          clues: [
            { tag: 'Prontuário Parental', text: 'O pai do investigado tinha sardas e produzia <b>apenas gametas <span class="mono">S</span></b> (<span class="mono">SS</span>). A mãe não tinha sardas (<span class="mono">ss</span>).' },
            { tag: 'Nota de Epistasia', text: '<b>Atenção ao efeito epistático da Etapa 1:</b> a formação de sardas depende da produção de melanina! Deduza a <b>expressão visível na pele</b> do investigado e o <b>genótipo <span class="mono">S/s</span></b> que ele carrega e pode transmitir aos filhos.' },
          ],
          labHint: 'Separe duas perguntas: 1) Cruzando SS × ss, qual genótipo S/s o investigado carrega? 2) Sem síntese de melanina (aa), as sardas conseguem aparecer na pele dele?',
          wrongClueHint: 'Atenção à epistasia recessiva: o cruzamento SS × ss define o genótipo Ss, mas o par epistático aa impede que as sardas se manifestem visualmente na pele!',
          explanation: 'Pelo cruzamento SS × ss, o investigado carrega o genótipo Ss. Contudo, por ser aa (epistasia recessiva), a falta de melanina mascara completamente o alelo S — deixando as sardas ausentes na pele!',
          logic: (g, { canProduce }) => canProduce('SS', 'ss', g),
        },
        {
          trait: 'eyeColor',
          requireGenotype: true,
          expectedPheno: 'azul',
          expectedGenotype: 'eegg',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Azul', fatherState: 'eyeBlue', motherRole: 'Mãe', motherTag: 'Azul', motherState: 'eyeBlue' },
          clues: [
            { tag: 'Registro dos Genes E/G', text: 'Tanto o pai quanto a mãe do investigado possuem olhos <b>azuis</b> (<span class="mono">ee gg × ee gg</span>). Indique o fenótipo de referência desses loci e o genótipo herdado.' },
          ],
          labHint: 'Pais ee gg × ee gg só transmitem gametas e g. Qual é o único genótipo possível nesses dois loci?',
          wrongClueHint: 'Sem nenhum alelo E ou G nos genitores, o descendente herda exclusivamente ee gg (base azul; no retrato, desbotado pela epistasia aa).',
          explanation: 'Cruzamento ee gg × ee gg resulta em 100% de descendentes ee gg (base para íris azul, que no retrato falado aparece ainda mais pálida devido ao albinismo aa).',
          logic: (g, { canProduce }) => canProduce('eegg', 'eegg', g),
        },
        {
          trait: 'hairTexture',
          requireGenotype: true,
          expectedPheno: 'ondulado',
          expectedGenotype: 'Tt',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Liso', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Cach.', motherState: 'affected' },
          clues: [
            { tag: 'Registro Parental', text: 'A mãe possui cabelo <b>cacheado</b> (<span class="mono">TT</span>) e o pai possui cabelo <b>liso</b> (<span class="mono">tt</span>).' },
            { tag: 'Nota Pericial', text: 'A epistasia do albinismo bloqueia a síntese de melanina (cor), mas <b>não altera a forma estrutural dos fios</b>.' },
          ],
          labHint: 'Cruze TT × tt normalmente. A estrutura do fio continua seguindo a dominância incompleta!',
          wrongClueHint: 'A melanina altera a cor dos fios para branco-platinado, mas TT × tt mantém a estrutura ondulada (Tt).',
          explanation: 'Mãe TT × pai tt gera 100% de descendentes Tt (cabelo ondulado, independentemente da despigmentação causada por aa).',
          logic: (g, { canProduce }) => canProduce('TT', 'tt', g),
        },
        {
          trait: 'colorVision',
          requireGenotype: true,
          expectedPheno: 'normal',
          expectedGenotype: 'XDY',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Dalt.', fatherState: 'affected', motherRole: 'Mãe', motherTag: 'XᴰXᴰ', motherState: 'plain' },
          clues: [
            { tag: 'Registro Oftalmológico', text: 'O <b>pai</b> do investigado é <b>daltônico</b> (<span class="mono">XᵈY</span>). Já a <b>mãe</b> possui visão normal e o estudo de linhagem comprovou que ela é homozigota dominante (<span class="mono">XᴰXᴰ</span>).' },
          ],
          labHint: 'Cuidado com a armadilha clássica: um pai daltônico (XᵈY) transmite qual cromossomo sexual para um filho do sexo masculino?',
          wrongClueHint: 'Um pai transmite o cromossomo Y (e nunca o X!) para filhos do sexo masculino. O cromossomo X do investigado veio inteiramente da mãe XᴰXᴰ!',
          explanation: 'O investigado masculino recebeu Y do pai (jamais herda o daltonismo paterno) e recebeu Xᴰ da mãe homozigota (XᴰXᴰ). Logo é XᴰY, com visão cromática normal.',
          logic: (g, { canProduce }) => canProduce('XdY', 'XDXD', g),
        },
        {
          trait: 'abo',
          requireGenotype: true,
          expectedPheno: 'AB',
          expectedGenotype: 'IAIB',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Tipo B', fatherState: 'typeB', fatherAlleles: 'Iᴮi', motherRole: 'Mãe', motherTag: 'Tipo A', motherState: 'typeA', motherAlleles: 'Iᴬi', spouseRole: 'Esposa', spouseTag: 'Tipo O', spouseState: 'typeO', childRole: 'Filho 1', childTag: 'Tipo A', childState: 'typeA', childShape: 'sq', child2Role: 'Filha 2', child2Tag: 'Tipo B', child2State: 'typeB', child2Shape: 'ci' },
          clues: [
            { tag: 'Tipagem Parental', text: 'A mãe tem sangue <b>tipo A</b> (<span class="mono">Iᴬi</span>) e o pai tem sangue <b>tipo B</b> (<span class="mono">Iᴮi</span>).' },
            { tag: 'Tipagem dos Filhos', text: 'O investigado casou-se com uma mulher <b>tipo O</b> (<span class="mono">ii</span>) e o casal teve dois filhos: um de sangue <b>tipo A</b> e outro de sangue <b>tipo B</b>.' },
          ],
          labHint: 'A esposa ii só passa o alelo i. Para o investigado conseguir gerar tanto um filho tipo A (Iᴬi) quanto um filho tipo B (Iᴮi), quais dois alelos ele precisa carregar?',
          wrongClueHint: 'Verifique a prole com a esposa ii: o filho tipo A exige Iᴬ no investigado, e o filho tipo B exige Iᴮ no investigado!',
          explanation: 'Como a esposa ii só fornece gametas i, gerar filhos tipo A (Iᴬi) e tipo B (Iᴮi) exige que o investigado possua simultaneamente Iᴬ e Iᴮ — ou seja, tipo AB (IᴬIᴮ).',
          logic: (g, { canProduce }) => canProduce('IBi', 'IAi', g) && canProduce(g, 'ii', 'IAi') && canProduce(g, 'ii', 'IBi'),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 11 — INTERMEDIÁRIO (5 etapas: Pele Poligênica + Íris + Cabelo Ruivo + Sobrancelhas + Rh)
    // -----------------------------------------------------------------------
    {
      id: 11,
      code: 'ARQ-46/11',
      level: 'Nível Intermediário',
      title: 'A Colecionadora da Galeria Sul',
      location: 'Galeria de Arte Sul · 21h10',
      suspectSex: 'F',
      summary: 'Uma colecionadora do <b>sexo feminino</b> é investigada pela troca de uma gravura rara no acervo sul. O dossiê inaugura a análise de <b>herança poligênica do tom de pele</b> (2 pares aditivos: <span class="mono">K/k</span> e <span class="mono">N/n</span>) combinada com <b>cor do cabelo</b>, <b>pigmentação da íris</b>, <b>sobrancelhas</b> e <b>fator Rh</b>.',
      steps: [
        {
          trait: 'skinTone',
          requireGenotype: true,
          expectedPheno: 'morena_media',
          expectedGenotype: 'KkNn',
          pedigree: { layout: 'parents', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Retinta', fatherState: 'skin4', fatherAlleles: 'KK NN', motherRole: 'Mãe', motherTag: 'Clara', motherState: 'skin0', motherAlleles: 'kk nn' },
          clues: [
            { tag: 'Registro Familiar de Melanina', text: 'O pai da investigada tem pele <b>retinta</b> (4 alelos dominantes: <span class="mono">KK NN</span>) e a mãe tem pele <b>clara</b> (0 alelos dominantes: <span class="mono">kk nn</span>).' },
            { tag: 'Nota de Herança Poligênica', text: 'Cada alelo dominante (<span class="mono">K</span> ou <span class="mono">N</span>) soma uma unidade de pigmentação: 0 = Clara, 1 = Morena clara, 2 = Morena média, 3 = Morena escura e 4 = Retinta.' },
          ],
          labHint: 'Quais gametas um genitor KK NN produz? E quais gametas kk nn produz? Some quantos alelos dominantes ficam na filha.',
          wrongClueHint: 'O pai KK NN doa apenas gametas KN e a mãe kk nn doa apenas kn, resultando sempre em 2 alelos dominantes (Kk Nn).',
          explanation: 'O cruzamento KK NN × kk nn produz 100% de descendentes Kk Nn (2 alelos dominantes), correspondendo ao fenótipo de pele morena média.',
          logic: (g, { canProduce }) => canProduce('KKNN', 'kknn', g),
        },
        {
          trait: 'eyeColor',
          requireGenotype: true,
          expectedPheno: 'verde',
          expectedGenotype: 'eeGg',
          pedigree: { layout: 'parents', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Verde', fatherState: 'eyeGreen', fatherAlleles: 'ee GG', motherRole: 'Mãe', motherTag: 'Azul', motherState: 'eyeBlue', motherAlleles: 'ee gg' },
          clues: [
            { tag: 'Exame Oftalmológico Parental', text: 'O pai possui olhos <b>verdes homozigotos</b> (<span class="mono">ee GG</span>) e a mãe possui olhos <b>azuis</b> (<span class="mono">ee gg</span>).' },
          ],
          labHint: 'Cruze ee GG × ee gg: o pai só transmite eG e a mãe só transmite eg. Qual cor resulta na presença de ee G_?',
          wrongClueHint: 'Sem o alelo E (castanho), a presença de G sobre g define olhos verdes (ee Gg).',
          explanation: 'Pai ee GG doa eG e mãe ee gg doa eg, gerando 100% de descendentes ee Gg — olhos verdes.',
          logic: (g, { canProduce }) => canProduce('eeGG', 'eegg', g),
        },
        {
          trait: 'hairColor',
          requireGenotype: true,
          expectedPheno: 'ruivo',
          expectedGenotype: 'hhuu',
          pedigree: { layout: 'parents', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Ruivo', fatherState: 'hairRed', fatherAlleles: 'hh uu', motherRole: 'Mãe', motherTag: 'Ruivo', motherState: 'hairRed', motherAlleles: 'hh uu' },
          clues: [
            { tag: 'Registro Capilar Familiar', text: 'Tanto o pai quanto a mãe da investigada possuem cabelos <b>ruivos</b> (<span class="mono">hh uu</span>).' },
            { tag: 'Regra de Interação Gênica', text: 'Na cor do cabelo, <span class="mono">H_ __</span> produz fios escuros; na ausência de <span class="mono">H</span> (<span class="mono">hh</span>), o par <span class="mono">U_</span> gera fios loiros e <span class="mono">hh uu</span> gera fios ruivos.' },
          ],
          labHint: 'Se ambos os pais são duplos homozigotos recessivos (hh uu × hh uu), existe algum alelo H ou U para transmitir?',
          wrongClueHint: 'Pais hh uu × hh uu só formam gametas hu, mantendo 100% de descendentes hh uu (ruivos).',
          explanation: 'Cruzamento hh uu × hh uu gera exclusivamente gametas hu de ambos os pais, resultando em hh uu (cabelo ruivo).',
          logic: (g, { canProduce }) => canProduce('hhuu', 'hhuu', g),
        },
        {
          trait: 'eyebrowShape',
          requireGenotype: true,
          expectedPheno: 'espessas',
          expectedGenotype: 'Ww',
          pedigree: { layout: 'parents', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'WW', fatherState: 'affected', fatherAlleles: 'WW', motherRole: 'Mãe', motherTag: 'Finas', motherState: 'plain' },
          clues: [
            { tag: 'Laudo Morfológico', text: 'O pai possui sobrancelhas <b>espessas homozigotas</b> (<span class="mono">WW</span>), enquanto a mãe apresenta sobrancelhas <b>finas</b> (<span class="mono">ww</span>).' },
          ],
          labHint: 'Na dominância completa (W > w), cruze WW × ww.',
          wrongClueHint: 'WW × ww gera 100% de descendentes heterozigotos Ww com sobrancelhas espessas.',
          explanation: 'Pai WW doa W e mãe ww doa w, produzindo obrigatoriamente Ww (sobrancelhas espessas).',
          logic: (g, { canProduce }) => canProduce('WW', 'ww', g),
        },
        {
          trait: 'rh',
          requireGenotype: true,
          expectedPheno: 'pos',
          expectedGenotype: 'Rr',
          pedigree: { layout: 'offspring', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Rh −', fatherState: 'plain', motherRole: 'Mãe', motherTag: '?', spouseRole: 'Marido', spouseTag: 'Rh −', spouseState: 'plain', childRole: 'Filho', childTag: 'Rh +', childState: 'affected', childShape: 'sq' },
          clues: [
            { tag: 'Exame Paterno', text: 'O pai da investigada tem fator <b>Rh negativo</b> (<span class="mono">rr</span>). Não há registro hemático da mãe.' },
            { tag: 'Exame Familiar', text: 'O marido da investigada também é <b>Rh negativo</b> (<span class="mono">rr</span>), mas o filho do casal nasceu <b>Rh positivo</b>.' },
          ],
          labHint: 'O pai rr garantiu o alelo r à investigada. Como o marido rr só doa r, de onde veio o alelo R do filho?',
          wrongClueHint: 'Combine pai rr (fornece r) com filho Rh+ de marido rr (exige que a investigada possua R).',
          explanation: 'Recebeu r do pai (rr) e transmitiu R ao filho (o marido rr só doa r). Portanto a investigada é Rr (Rh positivo).',
          logic: (g, { canProduce }) => g.includes('r') && canProduce(g, 'rr', 'Rr'),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 12 — INTERMEDIÁRIO (5 etapas: Cabelo Loiro + Pele Clara + Olhos Azuis 3-Gen + ABO + Queixo Indeterminado)
    // -----------------------------------------------------------------------
    {
      id: 12,
      code: 'ARQ-46/12',
      level: 'Nível Intermediário',
      title: 'O Cartógrafo do Porto Antigo',
      location: 'Arquivo Náutico · Cais Leste · 18h40',
      suspectSex: 'M',
      summary: 'Mapas hidrográficos históricos desapareceram do cais leste. O suspeito é do <b>sexo masculino</b> e o prontuário traz um heredograma de <b>três gerações para cor dos olhos</b>, além de registros de <b>cor do cabelo</b>, <b>tom de pele</b>, <b>sistema ABO</b> e um caso de <b>genótipo indeterminado</b> no queixo.',
      steps: [
        {
          trait: 'hairColor',
          requireGenotype: true,
          expectedPheno: 'loiro',
          expectedGenotype: 'hhUu',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Loiro', fatherState: 'hairBlonde', fatherAlleles: 'hh UU', motherRole: 'Mãe', motherTag: 'Ruivo', motherState: 'hairRed', motherAlleles: 'hh uu' },
          clues: [
            { tag: 'Registro Capilar', text: 'O pai do investigado possui cabelo <b>loiro homozigoto</b> (<span class="mono">hh UU</span>) e a mãe possui cabelo <b>ruivo</b> (<span class="mono">hh uu</span>).' },
          ],
          labHint: 'O pai hh UU só envia gametas hU e a mãe hh uu só envia hu. Qual genótipo e qual cor de cabelo se formam?',
          wrongClueHint: 'Cruze hh UU × hh uu: o par hh bloqueia o cabelo escuro, e a presença de U sobre u (Uu) determina cabelo loiro.',
          explanation: 'Pai hh UU doa hU e mãe hh uu doa hu, gerando 100% de descendentes hh Uu — cabelo loiro portador do alelo ruivo.',
          logic: (g, { canProduce }) => canProduce('hhUU', 'hhuu', g),
        },
        {
          trait: 'skinTone',
          requireGenotype: true,
          expectedPheno: 'clara',
          expectedGenotype: 'kknn',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Clara', fatherState: 'skin0', fatherAlleles: 'kk nn', motherRole: 'Mãe', motherTag: 'Clara', motherState: 'skin0', motherAlleles: 'kk nn' },
          clues: [
            { tag: 'Registro de Melanina', text: 'Tanto o pai quanto a mãe do investigado têm pele <b>clara</b> (0 alelos dominantes: <span class="mono">kk nn × kk nn</span>).' },
          ],
          labHint: 'Sem alelos dominantes K ou N em nenhum dos pais, quantos alelos dominantes o filho pode herdar?',
          wrongClueHint: 'O cruzamento kk nn × kk nn gera 100% de descendentes kk nn (pele clara).',
          explanation: 'Pais kk nn × kk nn transmitem exclusivamente gametas kn, produzindo 100% de filhos kk nn (pele clara).',
          logic: (g, { canProduce }) => canProduce('kknn', 'kknn', g),
        },
        {
          trait: 'eyeColor',
          requireGenotype: true,
          expectedPheno: 'azul',
          expectedGenotype: 'eegg',
          pedigree: { layout: 'threeGen', suspectSex: 'M', gp1Role: 'Avô P.', gp1Tag: 'Azul', gp1State: 'eyeBlue', gp2Role: 'Avó P.', gp2Tag: 'Azul', gp2State: 'eyeBlue', gp3Role: 'Avô M.', gp3Tag: 'Cast.', gp3State: 'eyeBrown', gp4Role: 'Avó M.', gp4Tag: 'Verde', gp4State: 'eyeGreen', fatherRole: 'Pai', fatherTag: 'Azul', fatherState: 'eyeBlue', motherRole: 'Mãe', motherTag: 'Azul', motherState: 'eyeBlue' },
          clues: [
            { tag: 'Linhagem de Três Gerações', text: 'Apesar de o avô materno ter olhos <b>castanhos</b> e a avó materna ter olhos <b>verdes</b>, a <b>mãe</b> do investigado nasceu com olhos <b>azuis</b> (<span class="mono">ee gg</span>).' },
            { tag: 'Registro Paterno', text: 'O <b>pai</b> do investigado e os avós paternos também possuem olhos <b>azuis</b> (<span class="mono">ee gg</span>).' },
          ],
          labHint: 'Os alelos dominantes dos avós maternos (E e G) passaram para a mãe? Olhe o genótipo real da geração II (Pai e Mãe)!',
          wrongClueHint: 'Como tanto o pai quanto a mãe têm olhos azuis (ee gg), nenhum deles herdou E ou G dos avós — logo o filho só pode ser ee gg.',
          explanation: 'Os alelos E e G dos avós maternos não foram transmitidos à mãe (ee gg). Cruzando pai ee gg × mãe ee gg, o investigado é 100% ee gg (olhos azuis).',
          logic: (g, { canProduce }) => canProduce('eegg', 'eegg', g),
        },
        {
          trait: 'abo',
          requireGenotype: true,
          expectedPheno: 'A',
          expectedGenotype: 'IAi',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Tipo O', fatherState: 'typeO', motherRole: 'Mãe', motherTag: 'AB', motherState: 'typeAB', spouseRole: 'Esposa', spouseTag: 'Tipo O', spouseState: 'typeO', childRole: 'Filho', childTag: 'Tipo A', childState: 'typeA', childShape: 'sq' },
          clues: [
            { tag: 'Tipagem Parental', text: 'O pai do investigado é sangue <b>tipo O</b> (<span class="mono">ii</span>) e a mãe é sangue <b>tipo AB</b> (<span class="mono">IᴬIᴮ</span>).' },
            { tag: 'Tipagem do Filho', text: 'A esposa do investigado é <b>tipo O</b> (<span class="mono">ii</span>) e o filho do casal nasceu com sangue <b>tipo A</b>.' },
          ],
          labHint: 'Do pai ii o investigado recebeu i; da mãe AB recebeu Iᴬ ou Iᴮ. Como a esposa é ii, qual alelo ele precisou doar para o filho ser tipo A?',
          wrongClueHint: 'Com esposa ii, apenas um investigado portador de Iᴬ gera filho tipo A (Iᴬi). Combinado com i do pai, o genótipo é Iᴬi.',
          explanation: 'Herdou i do pai (ii) e doou Iᴬ ao filho tipo A (a esposa ii só transmite i). Logo o investigado é tipo A, genótipo Iᴬi.',
          logic: (g, { canProduce }) => canProduce('ii', 'IAIB', g) && canProduce(g, 'ii', 'IAi'),
        },
        {
          trait: 'cleftChin',
          requireGenotype: true,
          expectedPheno: 'presente',
          expectedGenotype: 'indeterminado',
          pedigree: { layout: 'threeGen', suspectSex: 'M', gp1Role: 'Avô P.', gp1Tag: 'QQ', gp1State: 'affected', gp1Alleles: 'QQ', gp2Role: 'Avó P.', gp2Tag: 'QQ', gp2State: 'affected', gp2Alleles: 'QQ', gp3Role: 'Avô M.', gp3Tag: 'Liso', gp3State: 'plain', gp4Role: 'Avó M.', gp4Tag: 'Fend.', gp4State: 'affected', fatherRole: 'Pai', fatherTag: 'QQ', fatherState: 'affected', fatherAlleles: 'QQ', motherRole: 'Mãe', motherTag: 'Fend.', motherState: 'carrier', motherAlleles: 'Qq' },
          clues: [
            { tag: 'Linhagem Paterna', text: 'A linhagem paterna é pura para queixo fendido: o pai tem genótipo comprovado <span class="mono">QQ</span>.' },
            { tag: 'Linhagem Materna', text: 'A mãe possui queixo fendido, mas o avô materno tinha queixo <b>liso</b> (<span class="mono">qq</span>), provando que a mãe é heterozigota (<span class="mono">Qq</span>).' },
          ],
          labHint: 'Cruze QQ × Qq no Rascunho de Punnett: o fenótipo é 100% certo, mas quantos genótipos diferentes continuam possíveis?',
          wrongClueHint: 'QQ × Qq gera 50% QQ e 50% Qq: ambos produzem queixo fendido, mas sem novos dados o genótipo exato é indeterminado (Q_).',
          explanation: 'O cruzamento QQ × Qq assegura queixo fendido (100% recebem Q do pai), porém deixa em aberto QQ ou Qq — genótipo indeterminado.',
          logic: (g, { canProduce }) => canProduce('QQ', 'Qq', g),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 13 — INTERMEDIÁRIO (5 etapas: Pele Retinta + Olhos Castanhos 3-Gen + Cacheado + Sobrancelhas Finas + Daltonismo Feminino)
    // -----------------------------------------------------------------------
    {
      id: 13,
      code: 'ARQ-46/13',
      level: 'Nível Intermediário',
      title: 'A Curadora do Jardim Botânico',
      location: 'Estufa Histórica · Ala Norte · 16h25',
      suspectSex: 'F',
      summary: 'Amostras raras de orquídeas foram removidas da ala norte por uma especialista do <b>sexo feminino</b>. O dossiê exige integrar <b>tom de pele poligênico</b>, <b>interação gênica da íris em 3 gerações</b>, <b>textura capilar</b>, <b>sobrancelhas</b> e <b>daltonismo ligado ao X em mulheres</b>.',
      steps: [
        {
          trait: 'skinTone',
          requireGenotype: true,
          expectedPheno: 'retinta',
          expectedGenotype: 'KKNN',
          pedigree: { layout: 'parents', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Retinta', fatherState: 'skin4', fatherAlleles: 'KK NN', motherRole: 'Mãe', motherTag: 'Retinta', motherState: 'skin4', motherAlleles: 'KK NN' },
          clues: [
            { tag: 'Registro de Melanina', text: 'Tanto o pai quanto a mãe da investigada apresentam pele <b>retinta</b> (4 alelos dominantes cada: <span class="mono">KK NN × KK NN</span>).' },
          ],
          labHint: 'Pais KK NN × KK NN só produzem qual tipo de gameta (KN)? Quantos alelos dominantes a filha herda?',
          wrongClueHint: 'Sem alelos recessivos k ou n nos pais, a filha recebe obrigatoriamente KN + KN = KK NN (pele retinta).',
          explanation: 'O cruzamento KK NN × KK NN produz exclusivamente descendentes KK NN (4 alelos dominantes — pele retinta).',
          logic: (g, { canProduce }) => canProduce('KKNN', 'KKNN', g),
        },
        {
          trait: 'eyeColor',
          requireGenotype: true,
          expectedPheno: 'castanho',
          expectedGenotype: 'EeGg',
          pedigree: { layout: 'threeGen', suspectSex: 'F', gp1Role: 'Avô P.', gp1Tag: 'Cast.', gp1State: 'eyeBrown', gp1Alleles: 'EE GG', gp2Role: 'Avó P.', gp2Tag: 'Cast.', gp2State: 'eyeBrown', gp2Alleles: 'EE GG', gp3Role: 'Avô M.', gp3Tag: 'Azul', gp3State: 'eyeBlue', gp4Role: 'Avó M.', gp4Tag: 'Azul', gp4State: 'eyeBlue', fatherRole: 'Pai', fatherTag: 'Cast.', fatherState: 'eyeBrown', fatherAlleles: 'EE GG', motherRole: 'Mãe', motherTag: 'Azul', motherState: 'eyeBlue' },
          clues: [
            { tag: 'Linhagem Paterna', text: 'Os avós paternos e o pai pertencem a uma linhagem homozigota de olhos <b>castanhos</b> (<span class="mono">EE GG</span>).' },
            { tag: 'Linhagem Materna', text: 'Os avós maternos e a mãe possuem olhos <b>azuis</b> (<span class="mono">ee gg</span>).' },
          ],
          labHint: 'O pai EE GG só forma gametas EG e a mãe ee gg só forma gametas eg. Qual di-híbrido se forma na geração III?',
          wrongClueHint: 'EG + eg forma Ee Gg: a presença do alelo dominante E garante olhos castanhos, mesmo carregando e e g.',
          explanation: 'Cruzamento EE GG × ee gg resulta em 100% de descendentes di-híbridos Ee Gg, com fenótipo de olhos castanhos.',
          logic: (g, { canProduce }) => canProduce('EEGG', 'eegg', g),
        },
        {
          trait: 'hairTexture',
          requireGenotype: true,
          expectedPheno: 'cacheado',
          expectedGenotype: 'TT',
          pedigree: { layout: 'parents', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Cach.', fatherState: 'affected', motherRole: 'Mãe', motherTag: 'Cach.', motherState: 'affected' },
          clues: [
            { tag: 'Prontuário Capilar', text: 'Ambos os pais da investigada possuem cabelo <b>cacheado</b> (dominância incompleta: <span class="mono">TT × TT</span>).' },
          ],
          labHint: 'Na dominância incompleta da textura capilar, cacheado é sempre homozigoto TT. O que sai de TT × TT?',
          wrongClueHint: 'Como TT × TT só gera gametas T, a filha é obrigatoriamente TT (cabelo cacheado).',
          explanation: 'Pais TT × TT produzem 100% de filhos TT (cabelo cacheado).',
          logic: (g, { canProduce }) => canProduce('TT', 'TT', g),
        },
        {
          trait: 'eyebrowShape',
          requireGenotype: true,
          expectedPheno: 'finas',
          expectedGenotype: 'ww',
          pedigree: { layout: 'parents', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Finas', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Finas', motherState: 'plain' },
          clues: [
            { tag: 'Registro Morfológico', text: 'Tanto o pai quanto a mãe da investigada apresentam sobrancelhas <b>finas</b> (<span class="mono">ww</span>).' },
          ],
          labHint: 'Sobrancelhas finas são recessivas (ww). Qual é o único resultado possível de ww × ww?',
          wrongClueHint: 'Pais ww × ww só transmitem o alelo w, gerando 100% de descendentes ww (finas).',
          explanation: 'O cruzamento ww × ww resulta exclusivamente em ww (sobrancelhas finas).',
          logic: (g, { canProduce }) => canProduce('ww', 'ww', g),
        },
        {
          trait: 'colorVision',
          requireGenotype: true,
          expectedPheno: 'daltonico',
          expectedGenotype: 'XdXd',
          pedigree: { layout: 'parents', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Dalt.', fatherState: 'affected', motherRole: 'Mãe', motherTag: 'Dalt.', motherState: 'affected' },
          clues: [
            { tag: 'Laudo Oftalmológico Parental', text: 'Tanto o pai (<span class="mono">XᵈY</span>) quanto a mãe (<span class="mono">XᵈXᵈ</span>) da investigada têm <b>daltonismo vermelho-verde</b>.' },
          ],
          labHint: 'Para a filha do sexo feminino (XX), o pai doa seu único X (Xᵈ) e a mãe daltônica só possui Xᵈ. Qual genótipo resulta?',
          wrongClueHint: 'Uma mulher recebe um cromossomo X do pai (Xᵈ) e um da mãe (Xᵈ), resultando em XᵈXᵈ (daltônica).',
          explanation: 'Pai XᵈY doa Xᵈ às filhas e mãe XᵈXᵈ só produz gametas Xᵈ. Assim, 100% das filhas nascem XᵈXᵈ (daltônicas).',
          logic: (g, { canProduce }) => canProduce('XdY', 'XdXd', g),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 14 — INTERMEDIÁRIO (5 etapas: CALVÍCIE INFLUENCIADA PELO SEXO ♂ Bb + Cabelo Escuro + Pele Morena Clara + Lábios + ABO)
    // -----------------------------------------------------------------------
    {
      id: 14,
      code: 'ARQ-46/14',
      level: 'Nível Intermediário',
      title: 'O Restaurador de Vitrais',
      location: 'Ateliê da Catedral · 11h50',
      suspectSex: 'M',
      summary: 'Um artesão do <b>sexo masculino</b> deixou fragmentos de vidro pigmentado no ateliê fechado. Este caso apresenta a <b>herança influenciada pelo sexo</b> na calvície hereditária — em que o mesmo genótipo heterozigoto <span class="mono">Bb</span> age como dominante em homens e recessivo em mulheres — além de <b>cor do cabelo</b>, <b>tom de pele</b>, <b>lábios</b> e <b>ABO</b>.',
      steps: [
        {
          trait: 'baldness',
          requireGenotype: true,
          expectedPheno: 'calvo',
          expectedGenotype: 'Bb',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Denso', fatherState: 'plain', fatherAlleles: 'bb', motherRole: 'Mãe', motherTag: 'Calva', motherState: 'affected', motherAlleles: 'BB' },
          clues: [
            { tag: 'Prontuário Capilar Parental', text: 'O <b>pai</b> do investigado possui <b>cabelo denso</b> (em homens, o único genótipo não calvo é <span class="mono">bb</span>), enquanto a <b>mãe</b> apresenta <b>calvície / rarefação hereditária</b> (em mulheres, exige <span class="mono">BB</span>).' },
            { tag: 'Nota de Herança Influenciada pelo Sexo', text: 'O gene <span class="mono">B/b</span> é autossômico, mas sua dominância depende dos hormônios sexuais: em <b>homens</b>, <span class="mono">BB</span> e <span class="mono">Bb</span> expressam calvície; em <b>mulheres</b>, apenas <span class="mono">BB</span>.' },
          ],
          labHint: 'Cruze pai bb × mãe BB para achar o genótipo (Bb). Em seguida, verifique como Bb se manifesta no sexo masculino!',
          wrongClueHint: 'bb × BB gera 100% Bb. Como o investigado é do sexo masculino, o alelo B domina em Bb — resultando em calvície!',
          explanation: 'O cruzamento bb × BB gera 100% de filhos Bb. No sexo masculino, Bb expressa calvície hereditária (enquanto em mulheres seria cabelo denso).',
          logic: (g, { canProduce }) => canProduce('bb', 'BB', g),
        },
        {
          trait: 'hairColor',
          requireGenotype: true,
          expectedPheno: 'escuro',
          expectedGenotype: 'HhUu',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Escuro', fatherState: 'hairDark', fatherAlleles: 'HH UU', motherRole: 'Mãe', motherTag: 'Ruivo', motherState: 'hairRed', motherAlleles: 'hh uu' },
          clues: [
            { tag: 'Registro Capilar Lateral', text: 'O pai possuía cabelo <b>escuro homozigoto</b> (<span class="mono">HH UU</span>) e a mãe possuía cabelo <b>ruivo</b> (<span class="mono">hh uu</span>). Deduza a cor dos fios remanescentes do investigado.' },
          ],
          labHint: 'Cruze HH UU × hh uu: qual genótipo di-híbrido resulta e qual cor o alelo H impõe?',
          wrongClueHint: 'HH UU × hh uu gera 100% Hh Uu. A presença de H garante pigmentação escura nos fios.',
          explanation: 'Pai HH UU doa HU e mãe hh uu doa hu, gerando 100% Hh Uu — cabelo escuro (di-híbrido).',
          logic: (g, { canProduce }) => canProduce('HHUU', 'hhuu', g),
        },
        {
          trait: 'skinTone',
          requireGenotype: true,
          expectedPheno: 'morena_clara',
          expectedGenotype: 'Kknn',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Morena méd.', fatherState: 'skin2', fatherAlleles: 'KK nn', motherRole: 'Mãe', motherTag: 'Clara', motherState: 'skin0', motherAlleles: 'kk nn' },
          clues: [
            { tag: 'Registro de Melanina', text: 'O pai tem pele <b>morena média</b> com genótipo confirmado <span class="mono">KK nn</span> (2 alelos dominantes) e a mãe tem pele <b>clara</b> (<span class="mono">kk nn</span>, 0 dominantes).' },
          ],
          labHint: 'Pai KK nn produz apenas gametas Kn e mãe kk nn produz apenas kn. Quantos alelos dominantes ficam no filho?',
          wrongClueHint: 'Kn + kn forma Kk nn (apenas 1 alelo dominante), o que corresponde à pele morena clara.',
          explanation: 'O cruzamento KK nn × kk nn gera 100% de descendentes Kk nn (1 alelo dominante — pele morena clara).',
          logic: (g, { canProduce }) => canProduce('KKnn', 'kknn', g),
        },
        {
          trait: 'lipWidth',
          requireGenotype: true,
          expectedPheno: 'medios',
          expectedGenotype: 'Mm',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Largos', fatherState: 'affected', motherRole: 'Mãe', motherTag: 'Finos', motherState: 'plain' },
          clues: [
            { tag: 'Registro Morfológico', text: 'O pai possui <b>lábios largos</b> (<span class="mono">MM</span>) e a mãe possui <b>lábios finos</b> (<span class="mono">mm</span>).' },
          ],
          labHint: 'Na dominância incompleta da espessura labial, o que resulta de MM × mm?',
          wrongClueHint: 'MM × mm produz 100% de heterozigotos intermediários Mm (lábios médios).',
          explanation: 'Pai MM × mãe mm gera exclusivamente descendentes Mm (lábios médios).',
          logic: (g, { canProduce }) => canProduce('MM', 'mm', g),
        },
        {
          trait: 'abo',
          requireGenotype: true,
          expectedPheno: 'B',
          expectedGenotype: 'IBi',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'AB', fatherState: 'typeAB', motherRole: 'Mãe', motherTag: 'Tipo O', motherState: 'typeO', spouseRole: 'Esposa', spouseTag: 'IᴬIᴬ', spouseState: 'typeA', spouseAlleles: 'IᴬIᴬ', childRole: 'Filha', childTag: 'AB', childState: 'typeAB', childShape: 'ci' },
          clues: [
            { tag: 'Tipagem Parental', text: 'O pai tem sangue <b>tipo AB</b> (<span class="mono">IᴬIᴮ</span>) e a mãe tem sangue <b>tipo O</b> (<span class="mono">ii</span>).' },
            { tag: 'Tipagem da Descendência', text: 'A esposa é <b>tipo A homozigota</b> (<span class="mono">IᴬIᴬ</span>) e a filha do casal nasceu com sangue <b>tipo AB</b>.' },
          ],
          labHint: 'Da mãe ii veio o alelo i. Como a esposa IᴬIᴬ só doa Iᴬ, qual alelo o investigado precisou doar para a filha ser AB?',
          wrongClueHint: 'Para gerar uma filha IᴬIᴮ com esposa IᴬIᴬ, o investigado precisa possuir Iᴮ — combinado com i da mãe, resulta em Iᴮi.',
          explanation: 'Recebeu i da mãe (ii) e doou Iᴮ à filha tipo AB (a esposa IᴬIᴬ doou Iᴬ). Logo é tipo B, genótipo Iᴮi.',
          logic: (g, { canProduce }) => canProduce('IAIB', 'ii', g) && canProduce(g, 'IAIA', 'IAIB'),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 15 — PERITO SÊNIOR (6 etapas: Calvície ♀ Bb = DENSO + Pele Morena Escura + Olhos EeGg por 2 filhos + Cabelo Hhuu + Portadora X + ABO AB)
    // -----------------------------------------------------------------------
    {
      id: 15,
      code: 'ARQ-46/15',
      level: 'Perito Sênior',
      title: 'A Criptógrafa do Observatório',
      location: 'Observatório Astronômico · Cúpula Oeste · 01h35',
      suspectSex: 'F',
      summary: 'Chaves de telemetria foram decifradas na cúpula oeste por uma especialista do <b>sexo feminino</b>. Este dossiê de alta complexidade reúne <b>6 deduções simultâneas</b>: contraste sexual na <b>calvície hereditária em mulheres (<span class="mono">Bb</span>)</b>, <b>tom de pele poligênico</b>, <b>dedução di-híbrida da íris por prole dupla</b>, <b>cor do cabelo</b>, <b>portadora ligada ao X</b> e <b>codominância ABO</b>.',
      steps: [
        {
          trait: 'baldness',
          requireGenotype: true,
          expectedPheno: 'denso',
          expectedGenotype: 'Bb',
          pedigree: { layout: 'parents', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Denso', fatherState: 'plain', fatherAlleles: 'bb', motherRole: 'Mãe', motherTag: 'Calva', motherState: 'affected', motherAlleles: 'BB' },
          clues: [
            { tag: 'Prontuário Parental', text: 'O <b>pai</b> da investigada apresenta <b>cabelo denso</b> (<span class="mono">bb</span>) e a <b>mãe</b> apresenta <b>calvície hereditária</b> (<span class="mono">BB</span>).' },
            { tag: 'Atenção ao Sexo Biológico', text: 'A investigada é do <b>sexo feminino</b>. Na herança influenciada pelo sexo, mulheres só manifestam calvície em homozigose <span class="mono">BB</span> — heterozigotas <span class="mono">Bb</span> mantêm <b>cabelo denso</b>!' },
          ],
          labHint: 'Cruze bb × BB para obter o genótipo (Bb). Agora aplique a regra feminina da herança influenciada pelo sexo!',
          wrongClueHint: 'Diferente de um homem Bb (que fica calvo), uma mulher Bb mantém cabelo denso, mesmo carregando o alelo B.',
          explanation: 'Pai bb × mãe BB gera 100% Bb. Como a investigada é mulher, o alelo B se comporta como recessivo em Bb — preservando o cabelo denso.',
          logic: (g, { canProduce }) => canProduce('bb', 'BB', g),
        },
        {
          trait: 'skinTone',
          requireGenotype: true,
          expectedPheno: 'morena_escura',
          expectedGenotype: 'KKNn',
          pedigree: { layout: 'parents', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Retinta', fatherState: 'skin4', fatherAlleles: 'KK NN', motherRole: 'Mãe', motherTag: 'Morena méd.', motherState: 'skin2', motherAlleles: 'KK nn' },
          clues: [
            { tag: 'Registro Poligênico', text: 'O pai tem pele <b>retinta</b> (<span class="mono">KK NN</span>, 4 dom.) e a mãe tem pele <b>morena média</b> de linhagem confirmada <span class="mono">KK nn</span> (2 dom.).' },
          ],
          labHint: 'Pai KK NN só forma gametas KN e mãe KK nn só forma gametas Kn. Combine os gametas e conte os alelos dominantes!',
          wrongClueHint: 'KN + Kn resulta em KK Nn: 3 alelos dominantes (K, K e N), correspondendo à pele morena escura.',
          explanation: 'O cruzamento KK NN × KK nn produz 100% de descendentes KK Nn (3 alelos dominantes — pele morena escura).',
          logic: (g, { canProduce }) => canProduce('KKNN', 'KKnn', g),
        },
        {
          trait: 'eyeColor',
          requireGenotype: true,
          expectedPheno: 'castanho',
          expectedGenotype: 'EeGg',
          pedigree: { layout: 'offspring', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Cast.', fatherState: 'eyeBrown', motherRole: 'Mãe', motherTag: 'Azul', motherState: 'eyeBlue', spouseRole: 'Marido', spouseTag: 'Azul', spouseState: 'eyeBlue', childRole: 'Filho 1', childTag: 'Cast.', childState: 'eyeBrown', childShape: 'sq', child2Role: 'Filha 2', child2Tag: 'Verde', child2State: 'eyeGreen', child2Shape: 'ci' },
          clues: [
            { tag: 'Geração Parental', text: 'O pai da investigada tem olhos <b>castanhos</b> (genótipo completo desconhecido) e a mãe tem olhos <b>azuis</b> (<span class="mono">ee gg</span>).' },
            { tag: 'Prole com Marido de Olhos Azuis', text: 'O marido da investigada também possui olhos <b>azuis</b> (<span class="mono">ee gg</span>). O casal teve dois filhos: <b>Filho 1 de olhos castanhos</b> e <b>Filha 2 de olhos verdes</b>!' },
          ],
          labHint: 'Passo 1: a mãe ee gg garantiu os alelos e e g na investigada. Passo 2: com marido ee gg, o filho castanho prova que ela tem E, e a filha verde prova que ela tem G!',
          wrongClueHint: 'Junte as 3 evidências: e + g vieram da mãe azul; E é provado pelo filho castanho; G é provado pela filha verde (marido ee gg não tem E nem G). Logo, Ee Gg!',
          explanation: 'Herdou e e g da mãe (ee gg). Como o marido ee gg só doa eg, gerar um filho castanho (exige E) e uma filha verde (exige G) prova univocamente o genótipo di-híbrido Ee Gg (olhos castanhos).',
          logic: (g, { canProduce }) => {
            const browns = ['EEGG', 'EEGg', 'EEgg', 'EeGG', 'EeGg', 'Eegg'];
            const greens = ['eeGG', 'eeGg'];
            return browns.some(f => canProduce(f, 'eegg', g))
              && browns.some(c1 => canProduce(g, 'eegg', c1))
              && greens.some(c2 => canProduce(g, 'eegg', c2));
          },
        },
        {
          trait: 'hairColor',
          requireGenotype: true,
          expectedPheno: 'escuro',
          expectedGenotype: 'Hhuu',
          pedigree: { layout: 'offspring', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Escuro', fatherState: 'hairDark', fatherAlleles: 'HH uu', motherRole: 'Mãe', motherTag: 'Ruivo', motherState: 'hairRed', spouseRole: 'Marido', spouseTag: 'Ruivo', spouseState: 'hairRed', childRole: 'Filha', childTag: 'Ruivo', childState: 'hairRed', childShape: 'ci' },
          clues: [
            { tag: 'Registro Capilar Parental', text: 'O pai tem cabelo <b>escuro</b> com genótipo de linhagem <span class="mono">HH uu</span> e a mãe tem cabelo <b>ruivo</b> (<span class="mono">hh uu</span>).' },
            { tag: 'Registro da Filha', text: 'Casada com um homem <b>ruivo</b> (<span class="mono">hh uu</span>), a investigada teve uma filha <b>ruiva</b> (<span class="mono">hh uu</span>), confirmando que transmite gametas <span class="mono">hu</span>.' },
          ],
          labHint: 'Cruze pai HH uu × mãe hh uu: o pai só doa Hu e a mãe só doa hu. Qual genótipo se forma e qual cor aparece?',
          wrongClueHint: 'Hu + hu gera Hh uu: a presença do alelo H garante cabelo escuro, embora ela carregue h e uu (permitindo ter filha ruiva!).',
          explanation: 'Pai HH uu × mãe hh uu gera 100% Hh uu (cabelo escuro portador de ruivo), perfeitamente compatível com a filha hh uu.',
          logic: (g, { canProduce }) => canProduce('HHuu', 'hhuu', g) && canProduce(g, 'hhuu', 'hhuu'),
        },
        {
          trait: 'colorVision',
          requireGenotype: true,
          expectedPheno: 'normal',
          expectedGenotype: 'XDXd',
          pedigree: { layout: 'offspring', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Norm.', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Norm.', motherState: 'plain', spouseRole: 'Marido', spouseTag: 'Norm.', spouseState: 'plain', childRole: 'Filho', childTag: 'Dalt.', childState: 'affected', childShape: 'sq' },
          clues: [
            { tag: 'Exame dos Genitores', text: 'Tanto o pai (<span class="mono">XᴰY</span>) quanto a mãe da investigada apresentam <b>visão cromática normal</b>.' },
            { tag: 'Exame do Filho', text: 'O marido tem visão <b>normal</b> (<span class="mono">XᴰY</span>), mas o filho homem do casal nasceu <b>daltônico</b> (<span class="mono">XᵈY</span>).' },
          ],
          labHint: 'Do pai normal (XᴰY), a filha recebeu obrigatoriamente Xᴰ. Do marido (XᴰY), o filho recebeu Y. De onde veio o Xᵈ do filho?',
          wrongClueHint: 'A investigada recebeu Xᴰ do pai (logo tem visão normal) e doou Xᵈ ao filho daltônico (logo é portadora XᴰXᵈ).',
          explanation: 'Herdou Xᴰ do pai normal (XᴰY), garantindo visão normal, mas doou Xᵈ ao filho XᵈY (o marido XᴰY transmitiu apenas Y). Genótipo XᴰXᵈ (portadora).',
          logic: (g, { canProduce }) => ['XDXD', 'XDXd'].some(m => canProduce('XDY', m, g)) && canProduce(g, 'XDY', 'XdY'),
        },
        {
          trait: 'abo',
          requireGenotype: true,
          expectedPheno: 'AB',
          expectedGenotype: 'IAIB',
          pedigree: { layout: 'offspring', suspectSex: 'F', fatherRole: 'Pai', fatherTag: 'Tipo A', fatherState: 'typeA', motherRole: 'Mãe', motherTag: 'Tipo B', motherState: 'typeB', spouseRole: 'Marido', spouseTag: 'Tipo O', spouseState: 'typeO', childRole: 'Filho 1', childTag: 'Tipo A', childState: 'typeA', childShape: 'sq', child2Role: 'Filha 2', child2Tag: 'Tipo B', child2State: 'typeB', child2Shape: 'ci' },
          clues: [
            { tag: 'Tipagem Parental', text: 'O pai tem sangue <b>tipo A</b> e a mãe tem sangue <b>tipo B</b> (genótipos parentais não detalhados).' },
            { tag: 'Prole com Marido Tipo O', text: 'O marido tem sangue <b>tipo O</b> (<span class="mono">ii</span>), e o casal teve um filho <b>tipo A</b> e uma filha <b>tipo B</b>.' },
          ],
          labHint: 'O marido ii só doa o alelo i. Para que a mesma mulher gere um filho tipo A e uma filha tipo B com ele, quais dois alelos ela precisa ter?',
          wrongClueHint: 'Com marido ii, gerar um filho Iᴬi exige Iᴬ na investigada e gerar uma filha Iᴮi exige Iᴮ na investigada — portanto IᴬIᴮ (tipo AB).',
          explanation: 'Como o marido ii fornece apenas i, gerar filhos tipo A (Iᴬi) e tipo B (Iᴮi) comprova que a investigada possui ambos Iᴬ e Iᴮ (tipo AB, genótipo IᴬIᴮ).',
          logic: (g, { canProduce }) => canProduce(g, 'ii', 'IAi') && canProduce(g, 'ii', 'IBi'),
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CASO 16 — PERITO SÊNIOR (6 etapas: Pele KkNN + Íris Verde 3-Gen + Cabelo Loiro por Prole + Calvície ♂ por Prole + Daltonismo 3-Gen + ABO 3-Gen c/ Irmã)
    // -----------------------------------------------------------------------
    {
      id: 16,
      code: 'ARQ-46/16',
      level: 'Perito Sênior',
      title: 'O Relatório do Subsolo Zero',
      location: 'Cofre Subterrâneo · Setor 0 · 03h15',
      suspectSex: 'M',
      summary: 'O encerramento da operação aponta um agente do <b>sexo masculino</b> ligado ao cofre do Subsolo Zero. Todas as <b>6 etapas</b> combinam inferência multi-geracional e análise de descendência: <b>pele morena escura poligênica</b>, <b>olhos verdes em 3 gerações</b>, <b>cabelo loiro por teste de prole</b>, <b>calvície influenciada pelo sexo em 3 gerações</b>, <b>daltonismo ligado ao X</b> e <b>sistema ABO com linhagem fraterna</b>.',
      steps: [
        {
          trait: 'skinTone',
          requireGenotype: true,
          expectedPheno: 'morena_escura',
          expectedGenotype: 'KkNN',
          pedigree: { layout: 'parents', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Retinta', fatherState: 'skin4', fatherAlleles: 'KK NN', motherRole: 'Mãe', motherTag: 'Morena méd.', motherState: 'skin2', motherAlleles: 'kk NN' },
          clues: [
            { tag: 'Registro Poligênico', text: 'O pai tem pele <b>retinta</b> (<span class="mono">KK NN</span>, 4 dom.) e a mãe tem pele <b>morena média</b> com genótipo confirmado <span class="mono">kk NN</span> (2 dom.).' },
          ],
          labHint: 'Cruze pai KK NN (gameta KN) × mãe kk NN (gameta kN). Qual genótipo e quantos alelos dominantes se formam?',
          wrongClueHint: 'KN + kN forma Kk NN (3 alelos dominantes: K, N e N), correspondente à pele morena escura.',
          explanation: 'Pai KK NN doa KN e mãe kk NN doa kN, produzindo 100% de descendentes Kk NN (3 alelos dominantes — pele morena escura).',
          logic: (g, { canProduce }) => canProduce('KKNN', 'kkNN', g),
        },
        {
          trait: 'eyeColor',
          requireGenotype: true,
          expectedPheno: 'verde',
          expectedGenotype: 'eeGg',
          pedigree: { layout: 'threeGen', suspectSex: 'M', gp1Role: 'Avô P.', gp1Tag: 'Verde', gp1State: 'eyeGreen', gp1Alleles: 'ee GG', gp2Role: 'Avó P.', gp2Tag: 'Verde', gp2State: 'eyeGreen', gp2Alleles: 'ee GG', gp3Role: 'Avô M.', gp3Tag: 'Azul', gp3State: 'eyeBlue', gp4Role: 'Avó M.', gp4Tag: 'Azul', gp4State: 'eyeBlue', fatherRole: 'Pai', fatherTag: 'Verde', fatherState: 'eyeGreen', fatherAlleles: 'ee GG', motherRole: 'Mãe', motherTag: 'Azul', motherState: 'eyeBlue' },
          clues: [
            { tag: 'Linhagem Paterna', text: 'Os avós paternos e o pai pertencem a uma linhagem pura de olhos <b>verdes homozigotos</b> (<span class="mono">ee GG</span>).' },
            { tag: 'Linhagem Materna', text: 'Os avós maternos e a mãe possuem olhos <b>azuis</b> (<span class="mono">ee gg</span>).' },
          ],
          labHint: 'Pai ee GG só envia gametas eG e mãe ee gg só envia eg. Qual cor e qual genótipo surgem na geração III?',
          wrongClueHint: 'eG + eg forma ee Gg: sem E e com um alelo G dominante, os olhos são verdes.',
          explanation: 'O cruzamento ee GG × ee gg gera 100% de descendentes ee Gg — olhos verdes heterozigotos no locus G.',
          logic: (g, { canProduce }) => canProduce('eeGG', 'eegg', g),
        },
        {
          trait: 'hairColor',
          requireGenotype: true,
          expectedPheno: 'loiro',
          expectedGenotype: 'hhUu',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Loiro', fatherState: 'hairBlonde', motherRole: 'Mãe', motherTag: 'Ruivo', motherState: 'hairRed', spouseRole: 'Esposa', spouseTag: 'Ruivo', spouseState: 'hairRed', childRole: 'Filho', childTag: 'Loiro', childState: 'hairBlonde', childShape: 'sq' },
          clues: [
            { tag: 'Registro Parental', text: 'O pai do investigado possui cabelo <b>loiro</b> (<span class="mono">hh U_</span>, segundo alelo desconhecido) e a mãe possui cabelo <b>ruivo</b> (<span class="mono">hh uu</span>).' },
            { tag: 'Registro da Descendência', text: 'A esposa do investigado é <b>ruiva</b> (<span class="mono">hh uu</span>), mas o filho do casal nasceu <b>loiro</b> (<span class="mono">hh U_</span>)!' },
          ],
          labHint: 'Pai loiro (hh) × mãe ruiva (hh uu) garante hh e pelo menos um u no investigado. Como a esposa hh uu não tem U, de onde veio o U do filho loiro?',
          wrongClueHint: 'Se o investigado fosse ruivo (hh uu), casado com esposa ruiva (hh uu), jamais teria filho loiro! Ele precisa carregar U (hh Uu).',
          explanation: 'Recebeu hh de ambos os pais e u da mãe (hh uu). Como a esposa hh uu só transmite hu, o filho loiro (hh Uu) prova que o investigado carrega U — logo é hh Uu (loiro).',
          logic: (g, { canProduce }) => ['hhUU', 'hhUu'].some(f => canProduce(f, 'hhuu', g)) && ['hhUU', 'hhUu'].some(ch => canProduce(g, 'hhuu', ch)),
        },
        {
          trait: 'baldness',
          requireGenotype: true,
          expectedPheno: 'calvo',
          expectedGenotype: 'Bb',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Denso', fatherState: 'plain', fatherAlleles: 'bb', motherRole: 'Mãe', motherTag: 'Denso', motherState: 'carrier', motherAlleles: 'Bb', spouseRole: 'Esposa', spouseTag: 'Denso', spouseState: 'plain', spouseAlleles: 'bb', childRole: 'Filho', childTag: 'Calvo', childState: 'affected', childShape: 'sq' },
          clues: [
            { tag: 'Geração Parental', text: 'O <b>pai</b> do investigado tem <b>cabelo denso</b> (<span class="mono">bb</span>). A <b>mãe</b> também tem cabelo denso, mas o heredograma indica que é portadora heterozigota (<span class="mono">Bb</span>).' },
            { tag: 'Descendência', text: 'A esposa tem cabelo denso sem alelo de calvície na família (<span class="mono">bb</span>), porém o <b>filho homem</b> do casal desenvolveu <b>calvície hereditária</b>!' },
          ],
          labHint: 'O pai bb garantiu um alelo b ao investigado. Com a esposa bb, para o filho homem ficar calvo (precisa de B!), qual alelo o investigado doou?',
          wrongClueHint: 'O investigado herdou b do pai (bb) e transmitiu B ao filho calvo (esposa é bb). Logo é Bb — e, sendo homem, manifesta calvície!',
          explanation: 'Recebeu b do pai (bb) e doou B ao filho calvo (a esposa bb só doa b), provando o genótipo Bb. Em homens, Bb expressa calvície hereditária.',
          logic: (g, { canProduce }) => ['Bb', 'bb'].some(m => canProduce('bb', m, g)) && (canProduce(g, 'bb', 'BB') || canProduce(g, 'bb', 'Bb')),
        },
        {
          trait: 'colorVision',
          requireGenotype: true,
          expectedPheno: 'daltonico',
          expectedGenotype: 'XdY',
          pedigree: { layout: 'threeGen', suspectSex: 'M', gp1Role: 'Avô P.', gp1Tag: 'Norm.', gp1State: 'plain', gp2Role: 'Avó P.', gp2Tag: 'XᴰXᴰ', gp2State: 'plain', gp3Role: 'Avô M.', gp3Tag: 'Dalt.', gp3State: 'affected', gp4Role: 'Avó M.', gp4Tag: 'Dalt.', gp4State: 'affected', fatherRole: 'Pai', fatherTag: 'Norm.', fatherState: 'plain', motherRole: 'Mãe', motherTag: 'Dalt.', motherState: 'affected' },
          clues: [
            { tag: 'Linhagem Materna', text: 'Tanto o avô materno (<span class="mono">XᵈY</span>) quanto a avó materna (<span class="mono">XᵈXᵈ</span>) eram daltônicos, resultando na <b>mãe daltônica</b> (<span class="mono">XᵈXᵈ</span>).' },
            { tag: 'Linhagem Paterna', text: 'O <b>pai</b> e os avós paternos possuem <b>visão cromática normal</b> (<span class="mono">XᴰY</span>).' },
          ],
          labHint: 'Um filho homem recebe Y do pai e seu único X da mãe. Como a mãe é daltônica (XᵈXᵈ), qual é o único cromossomo X disponível?',
          wrongClueHint: 'O pai XᴰY só doa Y ao filho masculino; a mãe XᵈXᵈ doa obrigatoriamente Xᵈ, formando XᵈY (daltônico).',
          explanation: 'O investigado masculino recebeu Y do pai normal e Xᵈ da mãe daltônica (XᵈXᵈ), resultando obrigatoriamente em XᵈY (daltonismo).',
          logic: (g, { canProduce }) => canProduce('XDY', 'XdXd', g),
        },
        {
          trait: 'abo',
          requireGenotype: true,
          expectedPheno: 'B',
          expectedGenotype: 'IBi',
          pedigree: { layout: 'offspring', suspectSex: 'M', fatherRole: 'Pai', fatherTag: 'Tipo B', fatherState: 'typeB', motherRole: 'Mãe', motherTag: 'Tipo O', motherState: 'typeO', sibRole: 'Irmã', sibTag: 'Tipo O', sibState: 'typeO', sibShape: 'ci', spouseRole: 'Esposa', spouseTag: 'Tipo O', spouseState: 'typeO', childRole: 'Filho', childTag: 'Tipo B', childState: 'typeB', childShape: 'sq' },
          clues: [
            { tag: 'Geração Parental e Irmã', text: 'O pai tem sangue <b>tipo B</b>, a mãe tem sangue <b>tipo O</b> (<span class="mono">ii</span>) e a <b>irmã</b> do investigado nasceu com sangue <b>tipo O</b> (<span class="mono">ii</span>).' },
            { tag: 'Tipagem do Filho', text: 'A esposa do investigado é <b>tipo O</b> (<span class="mono">ii</span>), porém o <b>filho</b> do casal nasceu com sangue <b>tipo B</b>.' },
          ],
          labHint: 'Da mãe ii o investigado recebeu i. Como a esposa também é ii, qual alelo ele precisou transmitir para que o filho fosse tipo B?',
          wrongClueHint: 'A esposa ii só doa i; logo, o filho tipo B (Iᴮi) prova que o investigado possui Iᴮ. Combinado com i da mãe, seu genótipo é Iᴮi.',
          explanation: 'Herdou i da mãe (ii) e doou Iᴮ ao filho tipo B (a esposa ii só doa i). Logo o investigado é tipo B, genótipo Iᴮi (e a irmã ii confirma que o pai também era Iᴮi).',
          logic: (g, { canProduce }) => ['IBIB', 'IBi'].some(f => canProduce(f, 'ii', g)) && ['IBIB', 'IBi'].some(ch => canProduce(g, 'ii', ch)),
        },
      ],
    },
  ];

  // =========================================================================
  // ESTADO LOCAL DA PERÍCIA ATUAL
  // =========================================================================
  const session = {
    caseIndex: 0,
    phase: 'cover',       // 'cover' | 'investigating' | 'reviewed'
    stepIndex: 0,
    answers: {},          // stepIndex -> { pheno, geno, sealed }
    draftPheno: null,
    draftGeno: null,
    hintsUsed: new Set(), // stepIndex onde pediu ajuda
    attempts: 0,
    review: null,         // resultado da avaliação final
    showOfficialKey: false,
    pulsePortrait: false,
    // Rascunho de Punnett manual (começa sempre em branco!)
    scratchOpen: false,
    scratchMode: 'auto',  // 'auto' | 'abo' | 'xlinked'
    scratchRows: ['', ''],
    scratchCols: ['', ''],
  };

  let containerEl = null;

  const currentCase = () => CASES[session.caseIndex];
  const currentStep = () => currentCase().steps[session.stepIndex];

  function openCase(index, skipCover = false) {
    session.caseIndex = index;
    session.phase = skipCover ? 'investigating' : 'cover';
    session.stepIndex = 0;
    session.answers = {};
    session.draftPheno = null;
    session.draftGeno = null;
    session.hintsUsed = new Set();
    session.attempts = 0;
    session.review = null;
    session.showOfficialKey = false;
    session.pulsePortrait = false;
    resetScratchpad(CASES[index].steps[0]);
    if (typeof AudioEngine !== 'undefined') AudioEngine.flipClue();
    render();
  }

  function resetScratchpad(step) {
    const trait = step ? Genetics.FORENSIC_TRAITS[step.trait] : null;
    session.scratchMode = (trait && trait.scratchpadMode) || 'auto';
    session.scratchRows = ['', ''];
    session.scratchCols = ['', ''];
  }

  function goToStep(idx) {
    const c = currentCase();
    if (idx < 0 || idx >= c.steps.length) return;
    session.stepIndex = idx;
    const saved = session.answers[idx];
    session.draftPheno = saved ? saved.pheno : null;
    session.draftGeno = saved ? saved.geno : null;
    resetScratchpad(c.steps[idx]);
    if (typeof AudioEngine !== 'undefined') AudioEngine.flipClue();
    render();
  }

  /** Monta o estado atual do retrato combinando etapas seladas + seleção ao vivo da etapa atual */
  function collectLiveTraits() {
    const c = currentCase();
    const traits = {};
    c.steps.forEach((step, idx) => {
      if (idx === session.stepIndex && session.phase === 'investigating' && session.draftPheno) {
        traits[step.trait] = session.draftPheno;
      } else if (session.answers[idx] && session.answers[idx].pheno) {
        traits[step.trait] = session.answers[idx].pheno;
      }
    });
    return traits;
  }

  function allStepsSealed() {
    const c = currentCase();
    return c.steps.every((_, idx) => session.answers[idx] && session.answers[idx].sealed);
  }

  // =========================================================================
  // RENDERIZAÇÃO: TRILHO DE CASOS
  // =========================================================================
  function renderCaseRail() {
    const det = GameState.get().detective;
    const tierCls = lv => lv.includes('Inicial') ? 't-init' : lv.includes('Interm') ? 't-mid' : lv.includes('Avanç') ? 't-adv' : 't-sen';
    return `<div class="case-nav-bar">
      <button class="btn btn-desk btn-small case-index-btn" id="d46-open-index" title="Abrir índice completo dos ${CASES.length} casos por nível">
        ${UIArt.icon('list', 15)} <span>Índice (${CASES.length})</span>
      </button>
      <div class="case-rail" aria-label="Arquivo de Casos do Dossiê 46">
        ${CASES.map((c, idx) => {
          const stars = det.stars[c.id] || 0;
          const active = idx === session.caseIndex;
          return `<button class="case-tab ${active ? 'active' : ''} ${stars ? 'solved' : ''} ${tierCls(c.level)}"
            data-pick-case="${idx}" title="${c.code} — ${c.title} (${c.level})">
            <span class="ct-code mono">${String(c.id).padStart(2, '0')}</span>
            <span class="ct-title">${c.title}</span>
            <span class="ct-stars">${[1, 2, 3].map(s => `<i class="${s <= stars ? 'on' : ''}">★</i>`).join('')}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
  }

  function showCaseIndexModal() {
    const det = GameState.get().detective;
    const groups = ['Nível Inicial', 'Nível Intermediário', 'Nível Avançado', 'Perito Sênior'];
    const html = groups.map(grp => {
      const items = CASES.map((c, idx) => ({ c, idx })).filter(x => x.c.level === grp);
      return `<div class="idx-group">
        <h4 class="mono">${grp.toUpperCase()}</h4>
        <div class="idx-grid">
          ${items.map(({ c, idx }) => {
            const st = det.stars[c.id] || 0;
            const mechs = [...new Set(c.steps.map(s => Genetics.FORENSIC_TRAITS[s.trait].shortName))].join(' · ');
            return `<button class="idx-card ${idx === session.caseIndex ? 'current' : ''} ${st ? 'done' : ''}" data-idx-open="${idx}">
              <div class="ic-top">
                <span class="stamp-tag mono">${c.code}</span>
                <span class="ct-stars">${[1, 2, 3].map(s => `<i class="${s <= st ? 'on' : ''}">★</i>`).join('')}</span>
              </div>
              <strong>${c.title}</strong>
              <small class="muted">${c.steps.length} etapas: ${mechs}</small>
            </button>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');
    const modal = UI.openModal({
      title: `Índice Geral de Dossiês (${CASES.length} Casos)`,
      cls: 'modal-index',
      body: html,
      actions: [{ label: 'Fechar', cls: 'btn-slate' }],
    });
    if (modal) {
      $$('[data-idx-open]', modal).forEach(b => {
        b.addEventListener('click', () => {
          UI.closeModal();
          openCase(Number(b.dataset.idxOpen));
        });
      });
    }
  }

  // =========================================================================
  // RENDERIZAÇÃO: CAPA DE ABERTURA DO DOSSIÊ
  // =========================================================================
  function renderCover(c, animCls = '') {
    const mechanisms = [...new Set(c.steps.map(s => Genetics.FORENSIC_TRAITS[s.trait].mechanism))];
    return `<section class="dossier-cover paper-panel${animCls}">
      <div class="dc-header">
        <div>
          <span class="stamp-tag mono">${c.code}</span>
          <span class="level-tag">${c.level}</span>
        </div>
        <span class="mono small muted">${c.location}</span>
      </div>

      <div class="dc-body">
        <div class="dc-art-col">
          <div class="dc-folder-art">${UIArt.art('arquivo', 'dc-folder-svg')}</div>
          <div class="dc-meta-box mono small">
            <div><span>ETAPAS:</span><b>${c.steps.length} características</b></div>
            <div><span>SEXO:</span><b>${c.suspectSex === 'F' ? 'Feminino (XX)' : 'Masculino (XY)'}</b></div>
            <div><span>GENÓTIPO:</span><b>${c.steps.some(s => s.requireGenotype) ? 'Exigido no laudo' : 'Fenótipo apenas'}</b></div>
          </div>
        </div>

        <div class="dc-text-col">
          <div class="dc-kicker mono">DIVISÃO DE PERÍCIA HEREDITÁRIA · ABERTURA DE DOSSIÊ</div>
          <h2>${c.title}</h2>
          <p class="dc-summary">${c.summary}</p>

          <div class="dc-checklist">
            <h4>Escopo da Perícia (${c.steps.length} etapas sequenciais):</h4>
            <ol>
              ${c.steps.map(s => {
                const tr = Genetics.FORENSIC_TRAITS[s.trait];
                return `<li><b>${tr.name}</b> <span class="muted small">(${tr.mechanism}${s.requireGenotype ? ' · exige genótipo' : ''})</span></li>`;
              }).join('')}
            </ol>
          </div>

          <div class="dc-rules-note small muted">
            <b>Procedimento de Perícia:</b> cada etapa apresenta apenas as pistas da característica em foco. Ao selar uma etapa, o registro fica arquivado sem confirmação imediata; o mandado só é avaliado quando todas as etapas forem concluídas.
          </div>

          <div class="dc-actions">
            <button class="btn btn-crimson btn-big" id="d46-start-case">Abrir Perícia — Etapa 1 ▶</button>
          </div>
        </div>
      </div>
    </section>`;
  }

  // =========================================================================
  // RENDERIZAÇÃO: RASCUNHO DE PUNNETT MANUAL (COMEÇA EM BRANCO!)
  // =========================================================================
  function renderManualScratchpad() {
    const step = currentStep();
    const stepTrait = step ? Genetics.FORENSIC_TRAITS[step.trait] : null;
    const stepAutoAlleles = (() => {
      if (!stepTrait || stepTrait.scratchpadMode !== 'auto') return [];
      if (stepTrait.key === 'skinTone') return ['K', 'k', 'N', 'n'];
      if (stepTrait.key === 'hairColor') return ['H', 'h', 'U', 'u'];
      if (stepTrait.key === 'eyeColor') return ['E', 'e', 'G', 'g'];
      return stepTrait.alleles || [];
    })();
    const autoGametes = [...new Set([...stepAutoAlleles, 'A', 'a', 'B', 'b', 'E', 'e', 'G', 'g'])];
    const modeOpts = {
      auto: {
        label: 'Autossômico (A / a)',
        gametes: autoGametes,
      },
      abo: {
        label: 'Sistema ABO (Iᴬ / Iᴮ / i)',
        gametes: ['IA', 'IB', 'i'],
      },
      xlinked: {
        label: 'Ligado ao X (Xᴰ / Xᵈ / Y)',
        gametes: ['XD', 'Xd', 'Y'],
      },
    };
    const cfg = modeOpts[session.scratchMode] || modeOpts.auto;

    const gamSelect = (axis, idx, val) => `
      <select class="sp-select mono" data-sp-axis="${axis}" data-sp-idx="${idx}" aria-label="Gameta ${idx + 1} do ${axis === 'col' ? 'Pai' : 'Mãe'}">
        <option value="">—</option>
        ${cfg.gametes.map(gm => `<option value="${gm}" ${val === gm ? 'selected' : ''}>${Genetics.formatGamete(gm)}</option>`).join('')}
      </select>`;

    const tally = {};
    let filledCount = 0;
    const rowsHTML = [0, 1].map(ri => {
      const rVal = session.scratchRows[ri];
      const cells = [0, 1].map(ci => {
        const cVal = session.scratchCols[ci];
        const res = Genetics.combineManualGametes(session.scratchMode, rVal, cVal);
        if (res) {
          filledCount += 1;
          tally[res.formatted] = (tally[res.formatted] || 0) + 1;
          return `<td class="sp-cell filled"><b class="mono">${res.formatted}</b><span>${res.pheno}</span></td>`;
        }
        return `<td class="sp-cell empty"><span class="muted">—</span></td>`;
      }).join('');
      return `<tr><th>${gamSelect('row', ri, rVal)}</th>${cells}</tr>`;
    }).join('');

    const summaryHTML = filledCount > 0
      ? Object.entries(tally).map(([k, n]) =>
          `<span class="sp-tally-chip mono"><b>${k}</b>: ${n}/${filledCount} (${Math.round((n / filledCount) * 100)}%)</span>`
        ).join('')
      : '<span class="small muted">Escolha os gametas nos cabeçalhos acima e à esquerda para testar sua hipótese.</span>';

    return `<div class="scratchpad ${session.scratchOpen ? 'open' : ''}">
      <button class="sp-toggle" id="d46-toggle-scratch" aria-expanded="${session.scratchOpen}">
        <span class="sp-toggle-left">
          <span class="sp-ico-box">${UIArt.icon('grid', 18)}</span>
          <span><b>Rascunho de Punnett</b> <small class="muted">(em branco · teste manual de gametas)</small></span>
        </span>
        <span class="mono small">${session.scratchOpen ? '▲ Recolher' : '▼ Abrir Rascunho'}</span>
      </button>
      ${session.scratchOpen ? `<div class="sp-body">
        <div class="sp-top">
          <div class="sp-modes">
            ${Object.entries(modeOpts).map(([k, v]) =>
              `<button class="sp-mode-btn ${session.scratchMode === k ? 'active' : ''}" data-sp-mode="${k}">${v.label}</button>`
            ).join('')}
          </div>
          <button class="btn btn-small btn-ghost" id="d46-clear-scratch">Limpar rascunho</button>
        </div>
        <div class="sp-grid-area">
          <table class="sp-table">
            <thead>
              <tr>
                <th class="sp-corner mono">Mãe ╲ Pai</th>
                <th>${gamSelect('col', 0, session.scratchCols[0])}</th>
                <th>${gamSelect('col', 1, session.scratchCols[1])}</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
          <div class="sp-tally">${summaryHTML}</div>
        </div>
      </div>` : ''}
    </div>`;
  }

  // =========================================================================
  // RENDERIZAÇÃO: FICHA HEMÁTICA & SENSORIAL (LATERAL DO RETRATO)
  // =========================================================================
  function renderForensicSlip(c, liveTraits) {
    const items = [];
    const hasStep = key => c.steps.some(s => s.trait === key);
    if (hasStep('abo')) {
      items.push({ k: 'ABO', v: liveTraits.abo ? `Tipo ${liveTraits.abo}` : 'Pendente' });
    }
    if (hasStep('rh')) {
      items.push({ k: 'Rh', v: liveTraits.rh ? (liveTraits.rh === 'pos' ? 'Positivo (+)' : 'Negativo (−)') : 'Pendente' });
    }
    if (hasStep('colorVision')) {
      items.push({ k: 'Visão', v: liveTraits.colorVision ? (liveTraits.colorVision === 'daltonico' ? 'Daltonismo' : 'Normal') : 'Pendente' });
    }
    if (hasStep('eyeColor')) {
      items.push({ k: 'Íris', v: liveTraits.eyeColor ? Genetics.forensicPhenoLabel('eyeColor', liveTraits.eyeColor) : 'Pendente' });
    }
    if (hasStep('skinTone')) {
      items.push({ k: 'Pele', v: liveTraits.skinTone ? Genetics.forensicPhenoLabel('skinTone', liveTraits.skinTone) : 'Pendente' });
    }
    if (hasStep('hairColor')) {
      items.push({ k: 'Cabelo', v: liveTraits.hairColor ? Genetics.forensicPhenoLabel('hairColor', liveTraits.hairColor) : 'Pendente' });
    }
    if (hasStep('baldness')) {
      items.push({ k: 'Calvície', v: liveTraits.baldness ? (liveTraits.baldness === 'calvo' ? 'Calvície' : 'Cabelo denso') : 'Pendente' });
    }
    if (hasStep('albinism')) {
      items.push({ k: 'Melanina', v: liveTraits.albinism ? (liveTraits.albinism === 'albino' ? 'Albinismo (aa)' : 'Típica') : 'Pendente' });
    }
    if (items.length === 0) return '';
    return `<div class="lab-slip">
      <div class="ls-head mono">
        ${UIArt.icon('flask', 14)}
        <span>FICHA LABORATORIAL DO INVESTIGADO</span>
      </div>
      <div class="ls-rows">
        ${items.map(it => `<div class="ls-row"><span>${it.k}</span><b class="mono ${it.v === 'Pendente' ? 'muted' : ''}">${it.v}</b></div>`).join('')}
      </div>
    </div>`;
  }

  // =========================================================================
  // RENDERIZAÇÃO: ETAPA ATUAL DE INVESTIGAÇÃO
  // =========================================================================
  function renderInvestigation(c, animCls = '') {
    const step = currentStep();
    const trait = Genetics.FORENSIC_TRAITS[step.trait];
    const liveTraits = collectLiveTraits();
    const sealedCount = c.steps.filter((_, i) => session.answers[i] && session.answers[i].sealed).length;
    const isSealed = !!(session.answers[session.stepIndex] && session.answers[session.stepIndex].sealed);
    const readyToSeal = !!session.draftPheno && (!step.requireGenotype || !!session.draftGeno);
    const allDone = allStepsSealed();

    const genoChoices = step.trait === 'colorVision'
      ? trait.genotypeChoicesBySex[c.suspectSex || 'M']
      : trait.genotypeChoices;

    const stepRibbon = `<div class="step-ribbon" role="tablist" aria-label="Etapas da perícia">
      ${c.steps.map((s, idx) => {
        const tr = Genetics.FORENSIC_TRAITS[s.trait];
        const ans = session.answers[idx];
        const active = idx === session.stepIndex;
        return `<button class="step-tab ${active ? 'active' : ''} ${ans && ans.sealed ? 'sealed' : ''}"
          role="tab" aria-selected="${active}" data-goto-step="${idx}">
          <span class="st-idx mono">${idx + 1}/${c.steps.length}</span>
          <span class="st-name">${tr.shortName}</span>
          <span class="st-dot" title="${ans && ans.sealed ? 'Etapa selada no dossiê' : 'Etapa pendente'}">${ans && ans.sealed ? '●' : '○'}</span>
        </button>`;
      }).join('')}
    </div>`;

    return `
      ${stepRibbon}
      <div class="pericia-grid${animCls}">
        <!-- ESQUERDA: Fichário da Etapa Atual -->
        <section class="paper-panel dossier-sheet" aria-labelledby="step-title">
          <div class="ds-top">
            <div>
              <span class="stamp-tag mono">${c.code} · ETAPA ${session.stepIndex + 1} DE ${c.steps.length}</span>
              <span class="mech-tag">${trait.mechanism}</span>
            </div>
            <button class="btn btn-small btn-ghost" id="d46-open-cover">Capa do Dossiê</button>
          </div>

          <h2 id="step-title">${trait.name}</h2>
          <p class="small muted ds-sub">Analise exclusivamente os registros abaixo para deduzir esta característica do investigado (${c.suspectSex === 'F' ? 'sexo feminino' : 'sexo masculino'}).</p>

          <div class="pedigree-frame">
            <div class="pf-head mono small">HEREDOGRAMA FAMILIAR · GERAÇÕES E REGISTROS DA ETAPA</div>
            ${PortraitBoard.renderPedigree(step.pedigree, step.trait)}
          </div>

          <div class="evidence-stack">
            ${step.clues.map((cl, i) => `
              <article class="evidence-slip">
                <div class="es-tag mono">REGISTRO 0${i + 1} · ${cl.tag.toUpperCase()}</div>
                <p>${cl.text}</p>
              </article>
            `).join('')}
          </div>

          <div class="lab-help-row">
            <button class="btn btn-small" id="d46-lab-hint">
              ${UIArt.icon('magnifier', 14)} Pedir Ajuda do Laboratório ${session.hintsUsed.has(session.stepIndex) ? '(orientação aberta)' : '(-15 pts)'}
            </button>
            <span class="mono small muted">Etapas seladas: ${sealedCount}/${c.steps.length}</span>
          </div>

          ${session.hintsUsed.has(session.stepIndex)
            ? `<div class="socratic-hint"><b>Orientação do Laboratório:</b> ${step.labHint}</div>`
            : ''}
        </section>

        <!-- DIREITA: Prancheta do Retrato Falado + Controles da Etapa + Rascunho -->
        <section class="paper-panel board-sheet" aria-labelledby="board-title">
          <div class="bs-head">
            <div class="bs-title-row">
              <span class="bs-ico-box">${UIArt.icon('folder', 18)}</span>
              <div>
                <h3 id="board-title">Prancheta de Identificação</h3>
                <span class="small muted">Atualiza conforme suas deduções</span>
              </div>
            </div>
            <span class="mono small muted">${c.title}</span>
          </div>

          <div class="board-workspace">
            <div class="portrait-col">
              <div class="portrait-box">
                ${PortraitBoard.render(liveTraits, { code: c.code, sex: c.suspectSex, pulse: session.pulsePortrait, uid: `case${c.id}` })}
              </div>
              ${renderForensicSlip(c, liveTraits)}
            </div>

            <div class="decision-col">
              <div class="decision-block">
                <label class="db-label">1. Fenótipo deduzido — ${trait.name}</label>
                <div class="choice-list" role="radiogroup" aria-label="Fenótipo de ${trait.name}">
                  ${trait.options.map(opt => `
                    <button class="choice-btn ${session.draftPheno === opt.value ? 'active' : ''}"
                      role="radio" aria-checked="${session.draftPheno === opt.value}"
                      data-pick-pheno="${opt.value}">
                      <strong>${opt.label}</strong>
                      <span class="mono small">${opt.alleles}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              ${step.requireGenotype ? `<div class="decision-block">
                <label class="db-label">2. Genótipo deduzido <span class="muted small">(ou Indeterminado, se houver mais de um válido)</span></label>
                <div class="geno-choice-grid" role="radiogroup" aria-label="Genótipo de ${trait.name}">
                  ${genoChoices.map(opt => `
                    <button class="geno-btn mono ${session.draftGeno === opt.value ? 'active' : ''}"
                      role="radio" aria-checked="${session.draftGeno === opt.value}"
                      data-pick-geno="${opt.value}">
                      ${opt.label}
                    </button>
                  `).join('')}
                </div>
              </div>` : ''}

              <div class="step-actions">
                <button class="btn btn-slate btn-big" id="d46-seal-step" ${readyToSeal ? '' : 'disabled'}>
                  ${isSealed ? `${UIArt.icon('check', 16)} Atualizar Selo da Etapa` : `${UIArt.icon('pin', 16)} Selar Etapa no Dossiê`}
                </button>

                ${allDone ? `<button class="btn btn-crimson btn-big" id="d46-submit-case">
                  ${UIArt.icon('stamp', 16)} Emitir Mandado / Finalizar Perícia
                </button>` : `<p class="small muted center" style="margin:4px 0 0">Sele todas as ${c.steps.length} etapas para liberar a emissão do mandado.</p>`}
              </div>
            </div>
          </div>

          ${renderManualScratchpad()}
        </section>
      </div>`;
  }

  // =========================================================================
  // RENDERIZAÇÃO: LAUDO FINAL & REVISÃO POR ETAPA
  // =========================================================================
  function renderReview(c, animCls = '') {
    const rev = session.review;
    const liveTraits = collectLiveTraits();
    const hasNext = session.caseIndex + 1 < CASES.length;

    const rowsHTML = rev.items.map((item, idx) => {
      const tr = Genetics.FORENSIC_TRAITS[item.step.trait];
      const userPhenoLbl = Genetics.forensicPhenoLabel(item.step.trait, item.user.pheno);
      const userGenoLbl = item.step.requireGenotype ? ` · Genótipo: ${Genetics.formatGenotype(item.user.geno)}` : '';

      if (item.ok) {
        return `<article class="rev-item is-ok">
          <div class="ri-head">
            <span class="mono">ETAPA ${idx + 1} · ${tr.name.toUpperCase()}</span>
            <span class="ri-badge ok">✔ CONFIRMADA</span>
          </div>
          <p class="small"><b>Seu registro:</b> ${userPhenoLbl}${userGenoLbl}</p>
          <p class="small ri-exp">${item.step.explanation}</p>
        </article>`;
      }

      const expPhenoLbl = Genetics.forensicPhenoLabel(item.step.trait, item.step.expectedPheno);
      const expGenoLbl = item.step.requireGenotype ? ` (${Genetics.formatGenotype(item.step.expectedGenotype)})` : '';
      return `<article class="rev-item is-err">
        <div class="ri-head">
          <span class="mono">ETAPA ${idx + 1} · ${tr.name.toUpperCase()}</span>
          <span class="ri-badge err">✕ INCONSISTENTE</span>
        </div>
        <p class="small"><b>Seu registro:</b> ${userPhenoLbl}${userGenoLbl} ${!item.phenoOk && item.step.requireGenotype ? '(fenótipo divergente)' : !item.genoOk ? '(fenótipo certo, mas o genótipo precisa de revisão)' : ''}</p>
        <p class="small ri-nudge"><b>Pista a revisar:</b> ${item.step.wrongClueHint}</p>
        ${session.showOfficialKey ? `<p class="small ri-official"><b>Laudo Oficial:</b> ${expPhenoLbl}${expGenoLbl} — ${item.step.explanation}</p>` : ''}
      </article>`;
    }).join('');

    return `<section class="review-layout${animCls}">
      <div class="paper-panel review-main">
        <div class="rev-banner">
          <div class="rev-portrait-wrap">
            <div class="forensic-stamp ${rev.stampClass}">${rev.stampText}</div>
            ${PortraitBoard.render(liveTraits, { code: c.code, sex: c.suspectSex, uid: `rev${c.id}` })}
          </div>
          <div class="rev-summary">
            <span class="stamp-tag mono">${c.code} · LAUDO DE ENCERRAMENTO</span>
            <h2>${c.title}</h2>
            <p class="rev-score">Precisão pericial: <b class="mono">${rev.correctCount}/${rev.total} etapas confirmadas</b></p>
            ${rev.allCorrect ? `
              <div class="stars-row left">${[1, 2, 3].map(i => `<span class="${i <= rev.stars ? 'on' : ''}" style="--i:${i}">★</span>`).join('')}</div>
              <div class="xp-chip mono">+${rev.xpEarned} XP ${rev.streak >= 2 ? `· Sequência ×${rev.streak}` : ''} ${rev.leveledUp ? `· Nova patente: ${rev.rank.title}` : ''}</div>
            ` : `<p class="muted">Revise as pistas indicadas abaixo e refaça a perícia para obter a confirmação completa e melhorar sua nota.</p>`}

            <div class="rev-actions">
              ${!rev.allCorrect ? `<button class="btn btn-crimson btn-big" id="d46-retry-edit">↺ Revisar e Corrigir Etapas</button>` : ''}
              ${!rev.allCorrect && !session.showOfficialKey ? `<button class="btn btn-small" id="d46-show-key">Abrir Laudo Oficial (Gabarito)</button>` : ''}
              ${rev.allCorrect && hasNext ? `<button class="btn btn-crimson btn-big" id="d46-next-case">Próximo Dossiê (${CASES[session.caseIndex + 1].code}) ▶</button>` : ''}
              <button class="btn" id="d46-back-hub">Voltar à Mesa Principal</button>
            </div>
          </div>
        </div>

        <h3 class="rev-list-title">Revisão Etapa por Etapa</h3>
        <div class="rev-list">${rowsHTML}</div>
      </div>
    </section>`;
  }

  // =========================================================================
  // RENDER PRINCIPAL & EVENTOS
  // =========================================================================
  let lastAnimKey = '';

  function render(targetEl) {
    if (targetEl) {
      containerEl = targetEl;
      lastAnimKey = '';
    }
    if (!containerEl) return;

    const c = currentCase();
    const animKey = `${session.caseIndex}:${session.phase}:${session.stepIndex}`;
    const animCls = animKey !== lastAnimKey ? ' sheet-anim' : '';
    lastAnimKey = animKey;

    const oldRail = $('.case-rail', containerEl);
    const savedRailScroll = oldRail ? oldRail.scrollLeft : 0;

    let content = '';
    if (session.phase === 'cover') content = renderCover(c, animCls);
    else if (session.phase === 'investigating') content = renderInvestigation(c, animCls);
    else content = renderReview(c, animCls);

    containerEl.innerHTML = `
      ${renderCaseRail()}
      ${content}
    `;
    const newRail = $('.case-rail', containerEl);
    if (newRail && savedRailScroll) newRail.scrollLeft = savedRailScroll;
    session.pulsePortrait = false;
    bindEvents();
  }

  function bindEvents() {
    if (!containerEl) return;

    $$('[data-pick-case]', containerEl).forEach(btn => {
      btn.addEventListener('click', () => openCase(Number(btn.dataset.pickCase)));
    });

    const idxBtn = $('#d46-open-index', containerEl);
    if (idxBtn) idxBtn.addEventListener('click', showCaseIndexModal);

    const startBtn = $('#d46-start-case', containerEl);
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        session.phase = 'investigating';
        goToStep(0);
      });
    }

    const coverBtn = $('#d46-open-cover', containerEl);
    if (coverBtn) {
      coverBtn.addEventListener('click', () => {
        session.phase = 'cover';
        AudioEngine.flipClue();
        render();
      });
    }

    $$('[data-goto-step]', containerEl).forEach(btn => {
      btn.addEventListener('click', () => goToStep(Number(btn.dataset.gotoStep)));
    });

    $$('[data-pick-pheno]', containerEl).forEach(btn => {
      btn.addEventListener('click', () => {
        session.draftPheno = btn.dataset.pickPheno;
        session.pulsePortrait = true;
        AudioEngine.click();
        render();
      });
    });

    $$('[data-pick-geno]', containerEl).forEach(btn => {
      btn.addEventListener('click', () => {
        session.draftGeno = btn.dataset.pickGeno;
        AudioEngine.click();
        render();
      });
    });

    const hintBtn = $('#d46-lab-hint', containerEl);
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        if (!session.hintsUsed.has(session.stepIndex)) {
          session.hintsUsed.add(session.stepIndex);
          AudioEngine.flipClue();
          UI.toast('Orientação do laboratório anexada à etapa.');
          render();
        }
      });
    }

    const sealBtn = $('#d46-seal-step', containerEl);
    if (sealBtn) sealBtn.addEventListener('click', sealCurrentStep);

    const submitBtn = $('#d46-submit-case', containerEl);
    if (submitBtn) submitBtn.addEventListener('click', finalizeCase);

    // Rascunho de Punnett manual
    const spToggle = $('#d46-toggle-scratch', containerEl);
    if (spToggle) {
      spToggle.addEventListener('click', () => {
        session.scratchOpen = !session.scratchOpen;
        AudioEngine.toggle(session.scratchOpen);
        render();
      });
    }
    $$('[data-sp-mode]', containerEl).forEach(btn => {
      btn.addEventListener('click', () => {
        session.scratchMode = btn.dataset.spMode;
        session.scratchRows = ['', ''];
        session.scratchCols = ['', ''];
        AudioEngine.click();
        render();
      });
    });
    $$('.sp-select', containerEl).forEach(sel => {
      sel.addEventListener('change', () => {
        const idx = Number(sel.dataset.spIdx);
        if (sel.dataset.spAxis === 'row') session.scratchRows[idx] = sel.value;
        else session.scratchCols[idx] = sel.value;
        AudioEngine.click();
        render();
      });
    });
    const spClear = $('#d46-clear-scratch', containerEl);
    if (spClear) {
      spClear.addEventListener('click', () => {
        session.scratchRows = ['', ''];
        session.scratchCols = ['', ''];
        AudioEngine.discard();
        render();
      });
    }

    // Tela de revisão
    const retryBtn = $('#d46-retry-edit', containerEl);
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const firstWrong = session.review.items.findIndex(it => !it.ok);
        session.phase = 'investigating';
        session.showOfficialKey = false;
        goToStep(firstWrong >= 0 ? firstWrong : 0);
      });
    }
    const showKeyBtn = $('#d46-show-key', containerEl);
    if (showKeyBtn) {
      showKeyBtn.addEventListener('click', () => {
        session.showOfficialKey = true;
        AudioEngine.flipClue();
        render();
      });
    }
    const nextBtn = $('#d46-next-case', containerEl);
    if (nextBtn) nextBtn.addEventListener('click', () => openCase(session.caseIndex + 1));

    const hubBtn = $('#d46-back-hub', containerEl);
    if (hubBtn) hubBtn.addEventListener('click', () => App.navigate('hub'));
  }

  function sealCurrentStep() {
    const c = currentCase();
    const step = currentStep();
    if (!session.draftPheno || (step.requireGenotype && !session.draftGeno)) return;

    session.answers[session.stepIndex] = {
      pheno: session.draftPheno,
      geno: step.requireGenotype ? session.draftGeno : null,
      sealed: true,
    };
    AudioEngine.flipClue();

    // Avança para a próxima etapa ainda não selada (sem revelar certo/errado!)
    const nextPending = c.steps.findIndex((_, idx) => idx > session.stepIndex && !(session.answers[idx] && session.answers[idx].sealed));
    if (nextPending >= 0) {
      UI.toast(`Etapa ${session.stepIndex + 1} selada no dossiê. Avançando para Etapa ${nextPending + 1}.`);
      goToStep(nextPending);
    } else {
      const anyPending = c.steps.findIndex((_, idx) => !(session.answers[idx] && session.answers[idx].sealed));
      if (anyPending >= 0) {
        goToStep(anyPending);
      } else {
        UI.toast('Todas as etapas foram seladas! Revise se desejar ou emita o mandado.', 'good');
        render();
      }
    }
  }

  function finalizeCase() {
    if (!allStepsSealed()) return;
    const c = currentCase();
    session.attempts += 1;

    const items = c.steps.map((step, idx) => {
      const user = session.answers[idx];
      const phenoOk = user.pheno === step.expectedPheno;
      const genoOk = !step.requireGenotype || user.geno === step.expectedGenotype;
      return { step, user, phenoOk, genoOk, ok: phenoOk && genoOk };
    });

    const correctCount = items.filter(it => it.ok).length;
    const total = items.length;
    const allCorrect = correctCount === total;
    const ratio = correctCount / total;

    const stampClass = allCorrect ? 'confirmed' : ratio >= 0.5 ? 'partial' : 'inconsistent';
    const stampText = allCorrect
      ? 'IDENTIFICAÇÃO CONFIRMADA'
      : ratio >= 0.5
        ? 'IDENTIFICAÇÃO PARCIAL'
        : 'LAUDO INCONSISTENTE';

    const res = GameState.recordForensicAttempt(c.id, allCorrect, session.attempts, session.hintsUsed.size);

    session.review = {
      items,
      correctCount,
      total,
      allCorrect,
      stampClass,
      stampText,
      ...res,
    };
    session.phase = 'reviewed';

    AudioEngine.stamp(allCorrect);
    if (allCorrect) UI.confetti();
    render();
  }

  return {
    CASES,
    session,
    openCase,
    render,
    goToStep,
    sealCurrentStep,
    finalizeCase,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dossie46;
}
