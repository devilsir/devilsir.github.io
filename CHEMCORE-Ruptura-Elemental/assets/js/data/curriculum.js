(function(){
  const C=window.ChemCore=window.ChemCore||{};
  C.Data=C.Data||{};
  C.Data.curriculum={
    version:'2026.1',
    note:'A BNCC organiza as habilidades de Ciências da Natureza para toda a etapa do Ensino Médio, sem impor uma seriação anual rígida. A distribuição por 1º, 2º e 3º ano em CHEMCORE é uma progressão pedagógica coerente, articulada ao CRMG e aos Planos de Curso da SEE/MG.',
    sources:[
      {name:'BNCC — Ensino Médio, Ciências da Natureza e suas Tecnologias',issuer:'MEC',year:2018,scope:'Competências específicas 1, 2 e 3 e habilidades EM13CNT.'},
      {name:'Currículo Referência de Minas Gerais — Ensino Médio',issuer:'SEE/MG e CEE/MG',year:2021,scope:'Organização curricular e contextualização territorial.'},
      {name:'Planos de Curso CRMG — Ensino Médio',issuer:'SEE/MG',year:2025,scope:'Referência de planejamento anual por área e ano de escolaridade.'},
      {name:'Resolução SEE nº 5.212/2025',issuer:'SEE/MG',year:2025,scope:'Matrizes curriculares da rede estadual para o ano letivo de 2026.'}
    ],
    competencies:{
      1:'Analisar fenômenos naturais e processos tecnológicos com base nas relações entre matéria e energia, propondo ações que aperfeiçoem processos e reduzam impactos socioambientais.',
      2:'Construir e utilizar interpretações sobre a dinâmica da Vida, da Terra e do Cosmos para elaborar argumentos, previsões e decisões éticas e responsáveis.',
      3:'Analisar situações-problema e aplicações científico-tecnológicas, usando procedimentos e linguagens das Ciências da Natureza para propor e comunicar soluções.'
    },
    skills:{
      EM13CNT101:'Analisar e representar transformações e conservações em sistemas que envolvam quantidade de matéria, energia e movimento para realizar previsões em situações cotidianas e processos produtivos.',
      EM13CNT102:'Realizar previsões e avaliar intervenções em sistemas térmicos sustentáveis com base em variáveis termodinâmicas e na composição dos sistemas.',
      EM13CNT103:'Avaliar potencialidades e riscos das radiações e de suas aplicações na saúde, na indústria, no cotidiano e na geração de energia.',
      EM13CNT104:'Avaliar prejuízos de materiais e produtos à saúde e ao ambiente, considerando composição, toxicidade, reatividade e exposição.',
      EM13CNT105:'Analisar a ciclagem de elementos químicos e efeitos de fenômenos naturais e interferências humanas sobre esses ciclos.',
      EM13CNT106:'Avaliar tecnologias e soluções ligadas à geração, transporte, distribuição e consumo de energia elétrica e seus impactos.',
      EM13CNT201:'Analisar e utilizar modelos científicos propostos em diferentes épocas e culturas, reconhecendo sua construção histórica.',
      EM13CNT202:'Interpretar formas de manifestação da vida desde a composição molecular até a biosfera e suas condições ambientais.',
      EM13CNT203:'Avaliar efeitos de intervenções em ecossistemas, seres vivos e corpo humano com base nos ciclos da matéria e nas transferências de energia.',
      EM13CNT205:'Utilizar noções de probabilidade e incerteza ao interpretar atividades experimentais, fenômenos naturais e processos tecnológicos.',
      EM13CNT206:'Avaliar efeitos da ação humana e de políticas ambientais para a conservação da biodiversidade e a sustentabilidade.',
      EM13CNT207:'Analisar vulnerabilidades contemporâneas que afetam as juventudes e desenvolver ações de prevenção e promoção da saúde.',
      EM13CNT301:'Construir questões, hipóteses, previsões e estimativas, empregar instrumentos e interpretar modelos, dados e resultados experimentais.',
      EM13CNT302:'Comunicar resultados científicos interpretando gráficos, tabelas, símbolos, classificações e equações em diferentes mídias.',
      EM13CNT303:'Interpretar divulgação científica, avaliando dados, argumentos, conclusões e confiabilidade das fontes.',
      EM13CNT304:'Analisar situações controversas de aplicação das Ciências da Natureza com argumentos éticos e responsáveis.',
      EM13CNT306:'Avaliar riscos em atividades cotidianas e justificar equipamentos e comportamentos de segurança individual, coletiva e socioambiental.',
      EM13CNT307:'Analisar propriedades específicas de materiais para avaliar usos industriais, cotidianos, arquitetônicos e tecnológicos seguros e sustentáveis.',
      EM13CNT308:'Analisar equipamentos elétricos, eletrônicos e sistemas de automação para compreender tecnologias e impactos contemporâneos.',
      EM13CNT309:'Analisar a dependência de recursos fósseis e discutir alternativas energéticas e novos materiais.',
      EM13CNT310:'Investigar infraestrutura e serviços básicos, como saneamento e energia, identificando necessidades locais e regionais.'
    },
    crmgReferences:{
      year1:{label:'CRMG / SEE-MG — Ciências da Natureza, 1º ano',focus:'Matéria e energia; propriedades e transformações; modelos da matéria; linguagem química; investigação e segurança.',territory:'Materiais, mineração e água em contextos mineiros, sempre com tratamento responsável e não trivializador.'},
      year2:{label:'CRMG / SEE-MG — Ciências da Natureza, 2º ano',focus:'Quantificação química; soluções; gases; energia; cinética; equilíbrio; interpretação de dados e processos produtivos.',territory:'Eficiência energética, processos industriais e qualidade da água.'},
      year3:{label:'CRMG / SEE-MG — Ciências da Natureza, 3º ano',focus:'Eletroquímica; química orgânica; polímeros; radioatividade; química ambiental; tecnologias e sustentabilidade.',territory:'Mineração, metalurgia, saneamento, matrizes energéticas e impactos socioambientais em Minas Gerais.'}
    }
  };
})();
