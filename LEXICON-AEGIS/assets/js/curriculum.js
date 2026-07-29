(function () {
  'use strict';

  const sharedCRMG = 'Currículo Referência de Minas Gerais — Língua Inglesa, Ensino Fundamental — Anos Finais';

  const years = {
    6: {
      id: 6,
      label: '6º ano',
      sector: 'HOME NETWORK',
      title: 'Rede Doméstica',
      subtitle: 'Família, casa e rotina em uma cidade de memórias neon.',
      colors: { primary: '#20e6ff', secondary: '#ffd34e', glow: 'rgba(32,230,255,.42)' },
      boss: 'THE HOUSE GLITCH',
      bncc: ['EF06LI02','EF06LI05','EF06LI06','EF06LI09','EF06LI11','EF06LI15','EF06LI17','EF06LI19','EF06LI22','EF06LI23'],
      topics: [
        { id: 'family', label: 'Family & Personal Information', objective: 'Identificar relações familiares e trocar informações pessoais simples.' },
        { id: 'plurals', label: 'Plural Nouns', objective: 'Reconhecer e produzir plurais regulares e irregulares.' },
        { id: 'possession', label: 'Possession', objective: 'Usar genitive case e possessive adjectives em descrições.' },
        { id: 'house', label: 'House & Furniture', objective: 'Nomear cômodos, móveis e objetos domésticos.' },
        { id: 'location', label: 'There is/are & Prepositions', objective: 'Descrever existência e localização de objetos.' },
        { id: 'routine', label: 'WH-questions & Simple Present', objective: 'Perguntar e descrever rotinas, escola e comunidade.' }
      ],
      missions: [
        { id: '6-family-signal', name: 'Family Signal', topic: 'family', intro: 'Rebuild the family archive before NULL-VERB erases every connection.' },
        { id: '6-plural-factory', name: 'The Plural Factory', topic: 'plurals', intro: 'Repair the machines that duplicate words without corrupting their endings.' },
        { id: '6-whose-object', name: 'Whose Object Is It?', topic: 'possession', intro: 'Trace each object to its owner through a maze of broken apostrophes.' },
        { id: '6-house-scanner', name: 'House Scanner', topic: 'house', intro: 'Scan rooms and recover the vocabulary hidden inside the city blocks.' },
        { id: '6-where-core', name: 'Where Is the Core?', topic: 'location', intro: 'Use place signals to locate the missing Language Core.' },
        { id: '6-routine-protocol', name: 'Daily Routine Protocol', topic: 'routine', intro: 'Synchronize daily routines and confront THE HOUSE GLITCH.' }
      ]
    },
    7: {
      id: 7,
      label: '7º ano',
      sector: 'OPINION CIRCUIT',
      title: 'Circuito de Opiniões',
      subtitle: 'Fóruns, entrevistas e torres de comunicação sob interferência.',
      colors: { primary: '#a96cff', secondary: '#ff4fc7', glow: 'rgba(169,108,255,.42)' },
      boss: 'THE ECHO CHAMBER',
      bncc: ['EF07LI01','EF07LI03','EF07LI06','EF07LI07','EF07LI11','EF07LI12','EF07LI13','EF07LI15','EF06LI19'],
      topics: [
        { id: 'questions', label: 'WH-questions', objective: 'Pedir e localizar informações em interações curtas.' },
        { id: 'present-review', label: 'Simple Present Review', objective: 'Recompor estruturas afirmativas, negativas e interrogativas.' },
        { id: 'opinions', label: 'Opinions', objective: 'Expressar, justificar, concordar e discordar com respeito.' },
        { id: 'linkers', label: 'Linking Words', objective: 'Conectar ideias e organizar sequências de eventos.' },
        { id: 'communication', label: 'Communication', objective: 'Ler mensagens curtas e participar de trocas de informação e opinião.' }
      ],
      missions: [
        { id: '7-question-grid', name: 'Question Grid', topic: 'questions', intro: 'Open the interview gates by restoring complete questions.' },
        { id: '7-present-signal', name: 'Present Signal', topic: 'present-review', intro: 'Recompose the Simple Present signal before the network loses its rhythm.' },
        { id: '7-opinion-arena', name: 'Opinion Arena', topic: 'opinions', intro: 'Defend your ideas without turning disagreement into damage.' },
        { id: '7-connector-highway', name: 'Connector Highway', topic: 'linkers', intro: 'Reconnect separated messages across the media district.' },
        { id: '7-communication-tower', name: 'The Communication Tower', topic: 'communication', intro: 'Climb the tower and silence THE ECHO CHAMBER.' }
      ]
    },
    8: {
      id: 8,
      label: '8º ano',
      sector: 'FUTURE PROTOCOL',
      title: 'Protocolo do Futuro',
      subtitle: 'Linhas do tempo, laboratórios de previsão e portais instáveis.',
      colors: { primary: '#3d8bff', secondary: '#7dff72', glow: 'rgba(61,139,255,.42)' },
      boss: 'CHRONO-NULL',
      bncc: ['EF08LI04','EF08LI09','EF08LI10','EF08LI11','EF08LI12','EF08LI14'],
      topics: [
        { id: 'will', label: 'Will', objective: 'Expressar previsões e decisões espontâneas.' },
        { id: 'going-to', label: 'Be Going To', objective: 'Expressar planos, intenções e previsões com evidência.' },
        { id: 'about-to', label: 'Be About To', objective: 'Descrever eventos prestes a acontecer.' },
        { id: 'future-continuous', label: 'Future Continuous', objective: 'Descrever ações em progresso em um momento futuro.' },
        { id: 'future-perfect', label: 'Future Perfect', objective: 'Descrever ações concluídas antes de um momento futuro.' }
      ],
      missions: [
        { id: '8-prediction-zone', name: 'Prediction Zone', topic: 'will', intro: 'Read the unstable forecast and choose what will happen next.' },
        { id: '8-planned-route', name: 'Planned Route', topic: 'going-to', intro: 'Lock the team plan into the correct timeline.' },
        { id: '8-about-collapse', name: 'About to Collapse', topic: 'about-to', intro: 'React to events seconds before they become irreversible.' },
        { id: '8-future-progress', name: 'Future in Progress', topic: 'future-continuous', intro: 'Cross a city that is still moving in tomorrow’s time.' },
        { id: '8-completed-timeline', name: 'Completed Timeline', topic: 'future-perfect', intro: 'Finish the timeline before CHRONO-NULL rewrites the future.' }
      ]
    },
    9: {
      id: 9,
      label: '9º ano',
      sector: 'CONDITIONAL REALITY',
      title: 'Realidade Condicional',
      subtitle: 'Simulações paralelas, câmaras de causa e laboratórios de prefixos.',
      colors: { primary: '#ff873d', secondary: '#dc4fff', glow: 'rgba(255,135,61,.42)' },
      boss: 'THE PARADOX ENGINE',
      bncc: ['EF09LI10','EF09LI12','EF09LI14','EF09LI15','EF08LI13'],
      topics: [
        { id: 'first-conditional', label: 'First Conditional', objective: 'Relacionar condições reais ou possíveis a resultados futuros.' },
        { id: 'condition-links', label: 'Cause & Effect', objective: 'Construir cadeias de condição, consequência e conexão.' },
        { id: 'second-conditional', label: 'Second Conditional', objective: 'Expressar situações hipotéticas ou imaginárias.' },
        { id: 'prefixes', label: 'Prefixes', objective: 'Alterar sentidos com prefixos negativos e formadores de palavras.' },
        { id: 'word-formation', label: 'Meaning Reconstruction', objective: 'Inferir significado e aplicar regras de formação em contexto.' }
      ],
      missions: [
        { id: '9-possible-future', name: 'Possible Future', topic: 'first-conditional', intro: 'Predict real consequences before the simulation commits them.' },
        { id: '9-if-happens', name: 'If This Happens', topic: 'condition-links', intro: 'Reconnect causes and effects across a fractured chamber.' },
        { id: '9-alternate-reality', name: 'Alternate Reality', topic: 'second-conditional', intro: 'Navigate choices that exist only in imagined worlds.' },
        { id: '9-prefix-lab', name: 'Prefix Laboratory', topic: 'prefixes', intro: 'Stabilize word meanings inside a corrupted formation lab.' },
        { id: '9-meaning-reconstruction', name: 'Meaning Reconstruction', topic: 'word-formation', intro: 'Decode the final language pattern and stop THE PARADOX ENGINE.' }
      ]
    }
  };

  window.LexiconCurriculum = {
    trimester: 2,
    schoolYear: 2026,
    crmgReference: sharedCRMG,
    years,
    getYear(year) { return years[Number(year)] || years[6]; },
    getMission(year, missionId) {
      return this.getYear(year).missions.find(m => m.id === missionId) || this.getYear(year).missions[0];
    },
    getTopic(year, topicId) {
      return this.getYear(year).topics.find(t => t.id === topicId) || this.getYear(year).topics[0];
    }
  };
})();
