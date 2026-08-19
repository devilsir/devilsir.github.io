(function(){
  window.EQ = window.EQ || {};
  EQ.CURRICULUM = {
    appName:'English Quest: The Lost Signal',
    tagline:'Learn English. Decode the mystery. Restore the signal.',
    grades:{
      6:{
        name:'Home Base', chapter:'The Missing House', icon:'⌂',
        colors:{world:'#ff8a73',soft:'rgba(255,138,115,.16)'},
        description:'Investigue uma casa impossível, recupere memórias familiares e reorganize pistas perdidas.',
        topics:['Family members','Plurals','Genitive case','Possessive adjectives','House and furniture','There is / There are','Prepositions','WH-words','Simple Present','Verb to be','Daily routines'],
        skills:[
          {code:'CRMG/BNCC — conferir documento local',objective:'Compreender e usar vocabulário familiar e doméstico em situações comunicativas.',evidence:'Identifica relações, descreve espaços e reconstrói rotinas.'}
        ]
      },
      7:{
        name:'Social District', chapter:'The Silent Students', icon:'✦',
        colors:{world:'#a778ff',soft:'rgba(167,120,255,.16)'},
        description:'Reconstrua conversas quebradas, investigue opiniões e devolva a comunicação ao distrito.',
        topics:['WH-questions','Simple Present review','Questions and short answers','Opinion expressions','Agreement and disagreement','Linking words','Preferences','Everyday communication'],
        skills:[
          {code:'CRMG/BNCC — conferir documento local',objective:'Interagir, perguntar, responder e articular opiniões com justificativas.',evidence:'Constrói perguntas, conecta ideias e sustenta posicionamentos.'}
        ]
      },
      8:{
        name:'Future Lab', chapter:'The Future Glitch', icon:'⌁',
        colors:{world:'#4ee6a8',soft:'rgba(78,230,168,.15)'},
        description:'Conserte linhas do tempo, diferencie planos e previsões e impeça o colapso do laboratório.',
        topics:['Will','Going to','About to','Present Continuous for future','Future Continuous','Future Perfect','Plans','Predictions','Technology','Future society'],
        skills:[
          {code:'CRMG/BNCC — conferir documento local',objective:'Expressar planos, previsões, intenções e ações futuras em contextos diversos.',evidence:'Seleciona formas de futuro segundo intenção, evidência e sequência temporal.'}
        ]
      },
      9:{
        name:'Logic Core', chapter:'The Final Choice', icon:'◇',
        colors:{world:'#ff5eab',soft:'rgba(255,94,171,.14)'},
        description:'Analise consequências, detecte sinais manipulados e decida o destino final de Echo.',
        topics:['First Conditional','Second Conditional','Prefixes','Word formation','Fact and opinion','Argumentation','Cause and consequence','Reliable information','Persuasive language'],
        skills:[
          {code:'CRMG/BNCC — conferir documento local',objective:'Analisar criticamente mensagens e expressar consequências reais e hipotéticas.',evidence:'Avalia evidências, transforma palavras e constrói relações condicionais.'}
        ]
      }
    },
    supportLevels:{
      0:{name:'Padrão',description:'Experiência completa da turma.'},
      1:{name:'Suporte 1',description:'Pouco texto, duas alternativas, imagens e sem cronômetro.'},
      2:{name:'Suporte 2',description:'Frases curtas, três alternativas, pistas visuais e tradução opcional.'},
      3:{name:'Suporte 3',description:'Atividade padrão com mais tempo, áudio e menos distrações.'}
    },
    statusLabels:[
      {min:0,label:'Precisa de mais prática'},
      {min:45,label:'Em desenvolvimento'},
      {min:65,label:'Progredindo'},
      {min:80,label:'Seguro'},
      {min:93,label:'Pronto para extensão'}
    ]
  };
})();
