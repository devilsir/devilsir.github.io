/* Dados estáveis do Campus Periodicum.
   Arquivo sem módulos para continuar compatível com file:// e GitHub Pages. */

window.GAME_DATA = (() => {
  const NEUTRAL_PM = {
    1:53, 2:31, 3:167, 4:112, 5:87, 6:67, 7:56, 8:48, 9:42,
    10:38, 11:190, 12:145, 13:118, 14:111, 15:98, 16:88, 17:79, 18:71
  };

  const ELEMENTS = [
    {z:1,symbol:'H',name:'Hidrogênio',shells:[1,0,0],fact:'É o elemento mais leve e abundante do universo.',location:'Laboratório Central'},
    {z:2,symbol:'He',name:'Hélio',shells:[2,0,0],fact:'É um gás nobre com a primeira camada completa.',location:'Observatório dos Gases Nobres'},
    {z:3,symbol:'Li',name:'Lítio',shells:[2,1,0],fact:'Metal alcalino que tende a formar Li⁺.',location:'Jardim Iônico'},
    {z:4,symbol:'Be',name:'Berílio',shells:[2,2,0],fact:'No período 2, é menor que o lítio.',location:'Crista Periódica'},
    {z:5,symbol:'B',name:'Boro',shells:[2,3,0],fact:'É um metaloide do grupo 13.',location:'Floresta da Blindagem'},
    {z:6,symbol:'C',name:'Carbono',shells:[2,4,0],fact:'Forma uma enorme variedade de compostos.',location:'Laboratório Central'},
    {z:7,symbol:'N',name:'Nitrogênio',shells:[2,5,0],fact:'Compõe a maior parte da atmosfera terrestre.',location:'Floresta da Blindagem'},
    {z:8,symbol:'O',name:'Oxigênio',shells:[2,6,0],fact:'Ao ganhar dois elétrons, pode formar O²⁻.',location:'Pátio Central'},
    {z:9,symbol:'F',name:'Flúor',shells:[2,7,0],fact:'Tem forte atração por elétrons em ligações.',location:'Jardim Iônico'},
    {z:10,symbol:'Ne',name:'Neônio',shells:[2,8,0],fact:'Sua camada de valência está completa.',location:'Observatório dos Gases Nobres'},
    {z:11,symbol:'Na',name:'Sódio',shells:[2,8,1],fact:'Ao perder um elétron, forma Na⁺ com menor raio.',location:'Jardim Iônico'},
    {z:12,symbol:'Mg',name:'Magnésio',shells:[2,8,2],fact:'Mg²⁺ tem 10 elétrons, como o neônio.',location:'Crista Periódica'},
    {z:13,symbol:'Al',name:'Alumínio',shells:[2,8,3],fact:'Al³⁺ pertence à série isoeletrônica de 10 e⁻.',location:'Crista Periódica'},
    {z:14,symbol:'Si',name:'Silício',shells:[2,8,4],fact:'É um metaloide essencial para semicondutores.',location:'Crista Periódica'},
    {z:15,symbol:'P',name:'Fósforo',shells:[2,8,5],fact:'Possui cinco elétrons na camada de valência.',location:'Floresta da Blindagem'},
    {z:16,symbol:'S',name:'Enxofre',shells:[2,8,6],fact:'S²⁻ tem 18 elétrons, como o argônio.',location:'Pântano Isoeletrônico'},
    {z:17,symbol:'Cl',name:'Cloro',shells:[2,8,7],fact:'Cl⁻ é maior que o átomo neutro de cloro.',location:'Pântano Isoeletrônico'},
    {z:18,symbol:'Ar',name:'Argônio',shells:[2,8,8],fact:'É um gás nobre estável no modelo 2–8–8.',location:'Observatório dos Gases Nobres'}
  ].map(element => ({...element, radius:NEUTRAL_PM[element.z]}));

  const ITEMS = [
    {id:'atomic_sample',name:'Cápsula de amostra atômica',description:'Recipiente protegido para amostras H–Ar.',kind:'Amostra',color:'#6cf'},
    {id:'positive_ion_sample',name:'Amostra de íon positivo',description:'Cápsula marcada com carga positiva.',kind:'Amostra',color:'#ff9b70'},
    {id:'negative_ion_sample',name:'Amostra de íon negativo',description:'Cápsula marcada com carga negativa.',kind:'Amostra',color:'#78bfff'},
    {id:'electron_scanner',name:'Scanner de Elétrons',description:'Revela dados didáticos de objetos próximos com Q.',kind:'Ferramenta-chave',color:'#6cf',key:true},
    {id:'charge_manipulator',name:'Manipulador de Cargas',description:'Alterna nós autorais entre positivo, neutro e negativo.',kind:'Ferramenta-chave',color:'#ffd66b',key:true},
    {id:'spectroscopy_lens',name:'Lente de espectroscopia',description:'Lente de reposição para o telescópio do observatório.',kind:'Peça de missão',color:'#bd8cff'},
    {id:'lab_keycard',name:'Cartão do laboratório',description:'Acesso às áreas de pesquisa sincronizada.',kind:'Item-chave',color:'#76e39f',key:true},
    {id:'maintenance_keycard',name:'Cartão de manutenção perdido',description:'Pertence ao técnico Bento.',kind:'Item de missão',color:'#7fdbb0',key:true},
    {id:'replacement_fuse',name:'Fusível de reposição',description:'Protege o relé contra sobrecarga.',kind:'Peça de missão',color:'#ffdb78'},
    {id:'conductive_wire',name:'Fio condutor',description:'Fecha circuitos e restaura placas danificadas.',kind:'Ferramenta',color:'#e28b62'},
    {id:'charge_stabilizer',name:'Estabilizador de carga',description:'Consumível de segurança para sistemas iônicos.',kind:'Consumível',color:'#f3b8ff'},
    {id:'research_notebook',name:'Caderno de Pesquisa',description:'Registra elementos, íons, logs e comparações.',kind:'Ferramenta-chave',color:'#9eb7ff',key:true},
    {id:'research_notes',name:'Notas de blindagem',description:'Dados recuperados na Floresta da Blindagem.',kind:'Item de missão',color:'#d8cf9b',key:true},
    {id:'shielding_sensor',name:'Sensor de blindagem',description:'Detecta camadas internas e sinais eletrônicos.',kind:'Ferramenta-chave',color:'#83e4c0',key:true},
    {id:'portable_battery',name:'Bateria portátil',description:'Ativa temporariamente pontes e terminais avariados.',kind:'Ferramenta-chave',color:'#ffe56f',key:true},
    {id:'periodic_fragment',name:'Fragmento periódico',description:'Parte de um diagrama quebrado do campus.',kind:'Colecionável',color:'#82cfff'},
    {id:'stable_core_piece',name:'Peça de núcleo estável',description:'Componente raro de estabilização.',kind:'Colecionável',color:'#79f4ba'},
    {id:'noble_gas_core',name:'Núcleo de gás nobre',description:'Chave estável da câmara final.',kind:'Item-chave',color:'#b8a4ff',key:true},
    {id:'research_log',name:'Registro de pesquisa',description:'Relato opcional salvo no Caderno de Pesquisa.',kind:'Descoberta',color:'#b7c0d8'},
    {id:'campus_emblem',name:'Emblema secreto',description:'Marca escondida dos primeiros pesquisadores.',kind:'Segredo',color:'#ffd66b'}
  ];

  const RANKS = [
    {id:'visitor',name:'Visitante do Laboratório',min:0},
    {id:'assistant',name:'Assistente de Pesquisa',min:80},
    {id:'ionic',name:'Explorador Iônico',min:180},
    {id:'investigator',name:'Investigador Periódico',min:340},
    {id:'specialist',name:'Especialista Atômico',min:540},
    {id:'guardian',name:'Guardião do Campus Periodicum',min:800}
  ];

  const REGIONS = [
    {id:'central',name:'Laboratório Central',x:5,y:4,w:35,h:34,color:'#353b61'},
    {id:'garden',name:'Jardim Iônico',x:41,y:6,w:33,h:30,color:'#174733'},
    {id:'forest',name:'Floresta da Blindagem',x:75,y:5,w:38,h:34,color:'#102b25'},
    {id:'marsh',name:'Pântano Isoeletrônico',x:35,y:40,w:44,h:33,color:'#10324a'},
    {id:'ridge',name:'Crista Periódica',x:80,y:40,w:46,h:37,color:'#3c4059'},
    {id:'observatory',name:'Observatório dos Gases Nobres',x:128,y:12,w:27,h:39,color:'#323653'},
    {id:'archive',name:'Arquivo Sul',x:9,y:43,w:25,h:24,color:'#27334a'}
  ];

  const NPCS = [
    {
      id:'prof_dalton',name:'Prof. Dalton',role:'Mentor do Campus',tx:16,ty:11,
      skin:'#ffd7b3',coat:'#e7f0f7',accent:'#6cf',style:'professor',
      intro:'O Campus Periodicum perdeu a sincronização. Precisamos restaurar cada estação sem apagar o que já aprendemos.',
      comments:[
        'O raio atômico é uma tendência, não uma esfera rígida com borda perfeita.',
        'Quando comparar íons isoeletrônicos, observe primeiro o número de prótons.',
        'Os modelos daqui são simplificados e servem para raciocinar.'
      ]
    },
    {
      id:'lina',name:'Lina',role:'Assistente de laboratório',tx:24,ty:14,
      skin:'#d9a47d',coat:'#75d6c6',accent:'#f4d27b',style:'assistant',patrol:{axis:'x',range:2,speed:.45},
      intro:'Estou catalogando tudo que ainda responde ao terminal. Se encontrar dados soltos, traga para mim.',
      comments:[
        'Uma boa comparação sempre declara se o átomo é neutro ou ionizado.',
        'As cápsulas usam raios aproximados para fins didáticos.'
      ]
    },
    {
      id:'bento',name:'Bento',role:'Técnico de manutenção',tx:14,ty:18,
      skin:'#8f6049',coat:'#d6a95f',accent:'#ff8d6b',style:'technician',
      intro:'Relés, cabos, portas... tudo resolveu falhar na mesma noite. Ainda bem que trouxe ferramentas.',
      comments:[
        'Primeiro isole a energia; depois instale fusível e condutor.',
        'Uma ponte energizada precisa de alimentação estável, não de sorte.'
      ]
    },
    {
      id:'icaro',name:'Ícaro',role:'Estudante de íons',tx:49,ty:14,
      skin:'#bf805c',coat:'#8097ef',accent:'#ff8bc1',style:'student',patrol:{axis:'y',range:2,speed:.55},
      intro:'Estou tentando fazer o jardim responder às cargas. Ele é lindo quando não tenta me prender do lado errado.',
      comments:[
        'Cátions ficam menores; ânions, maiores — mas compare sempre espécies coerentes.',
        'Carga total é soma: sinais opostos podem se equilibrar.'
      ]
    },
    {
      id:'maya',name:'Maya',role:'Pesquisadora de campo',tx:79,ty:20,
      skin:'#8b5a40',coat:'#5b9b72',accent:'#8fe9ba',style:'researcher',patrol:{axis:'x',range:1.5,speed:.35},
      intro:'A floresta organiza tudo em camadas. Os sinais internos chegam primeiro; os externos, depois.',
      comments:[
        'Blindagem reduz a atração sentida pelos elétrons mais externos.',
        'As luzes parecem vaga-lumes, mas respondem como marcadores eletrônicos.'
      ]
    },
    {
      id:'dra_nobre',name:'Dra. Nobre',role:'Cientista do observatório',tx:139,ty:25,
      skin:'#e0b79a',coat:'#aa8ee3',accent:'#b8f1ff',style:'scientist',
      intro:'O núcleo do observatório só aceita uma configuração estável. Cada descoberta do campus alimenta o mapa celeste.',
      comments:[
        'Gases nobres têm camadas de valência completas no modelo simplificado.',
        'Estabilidade química não significa ausência total de reatividade em qualquer condição.'
      ]
    },
    {
      id:'celia',name:'Dona Célia',role:'Cuidadora do campus',tx:23,ty:51,
      skin:'#a96d4e',coat:'#79a976',accent:'#ffd66b',style:'caretaker',patrol:{axis:'y',range:1.5,speed:.3},
      intro:'Conheço cada placa e atalho daqui. O campus conta sua história para quem repara nos detalhes.',
      comments:[
        'As placas antigas seguem a direção do aumento do raio: para baixo e para a esquerda.',
        'O Arquivo Sul guarda rastros dos primeiros experimentos.'
      ]
    }
  ];

  const MAIN_MISSIONS = [
    {
      id:'main_01',type:'main',order:1,title:'Um campus fora de fase',giver:'prof_dalton',
      description:'Entenda por que as estações perderam sincronização.',
      stages:[{text:'Fale com o Prof. Dalton no Laboratório Central.',target:'prof_dalton',req:{type:'flag',id:'spoke_dalton'}}],
      rewards:{rp:20}
    },
    {
      id:'main_02',type:'main',order:2,title:'Diagnóstico inicial',giver:'prof_dalton',
      description:'Consulte a leitura de falhas do terminal principal.',
      stages:[{text:'Inspecione o terminal LAB ao norte do professor.',target:'lab_terminal',req:{type:'flag',id:'terminal_inspected'}}],
      rewards:{rp:25,items:{research_notebook:1}}
    },
    {
      id:'main_03',type:'main',order:3,title:'Amostras desaparecidas',giver:'lina',
      description:'Recupere as cápsulas essenciais para recalibrar os sensores.',
      stages:[{text:'Encontre as amostras de H, C e O na área central.',target:'sample_H',req:{type:'samples',ids:['H','C','O']}}],
      rewards:{rp:40,items:{electron_scanner:1}}
    },
    {
      id:'main_04',type:'main',order:4,title:'Relé sem pulso',giver:'bento',
      description:'Repare a alimentação do laboratório seguindo uma sequência segura.',
      stages:[
        {text:'Obtenha um fusível e um fio condutor no armário ou com Bento.',target:'supply_cabinet',req:{type:'items',items:{replacement_fuse:1,conductive_wire:1}}},
        {text:'Use o painel do relé e reconecte os componentes.',target:'power_relay',req:{type:'puzzle',id:'lab_repair'}}
      ],
      rewards:{rp:45,items:{shielding_sensor:1}}
    },
    {
      id:'main_05',type:'main',order:5,title:'Primeiro selo: tendências',giver:'prof_dalton',
      description:'Valide as tendências periódicas no santuário original.',
      stages:[{text:'Complete o Santuário Tendências do Raio.',target:'shrine_trend',req:{type:'shrine',id:'trend'}}],
      rewards:{rp:50,items:{lab_keycard:1}}
    },
    {
      id:'main_06',type:'main',order:6,title:'Portão do Jardim Iônico',giver:'icaro',
      description:'Use o cartão recuperado para abrir a ala de cargas.',
      stages:[{text:'Ative o painel do portão oeste do Jardim Iônico.',target:'garden_gate_panel',req:{type:'flag',id:'garden_gate_open'}}],
      rewards:{rp:35,items:{charge_manipulator:1}}
    },
    {
      id:'main_07',type:'main',order:7,title:'Equilíbrio de cargas',giver:'icaro',
      description:'Ajuste os nós do jardim até atingir a carga solicitada.',
      stages:[{text:'Resolva o painel de equilíbrio no centro do jardim.',target:'charge_console',req:{type:'puzzle',id:'charge_balance'}}],
      rewards:{rp:55,items:{charge_stabilizer:2}}
    },
    {
      id:'main_08',type:'main',order:8,title:'Notas sob as camadas',giver:'maya',
      description:'Investigue a Floresta da Blindagem e recupere os dados perdidos.',
      stages:[{text:'Encontre as notas de pesquisa na Floresta da Blindagem.',target:'forest_notes',req:{type:'item',id:'research_notes',count:1}}],
      rewards:{rp:40}
    },
    {
      id:'main_09',type:'main',order:9,title:'Do núcleo para fora',giver:'maya',
      description:'Restaure os sinalizadores na ordem das camadas internas para as externas.',
      stages:[{text:'Ative os três sinalizadores: interno, médio e externo.',target:'beacon_inner',req:{type:'set',set:'beacons',ids:['beacon_inner','beacon_middle','beacon_outer']}}],
      rewards:{rp:60,items:{portable_battery:1}}
    },
    {
      id:'main_10',type:'main',order:10,title:'Travessia isoeletrônica',giver:'maya',
      description:'Religue a ponte e alcance o outro lado do pântano.',
      stages:[
        {text:'Use a bateria portátil no terminal da ponte.',target:'bridge_console',req:{type:'flag',id:'bridge_open'}},
        {text:'Atravesse até a ilha oriental do Pântano Isoeletrônico.',target:'marsh_east_marker',req:{type:'flag',id:'marsh_crossed'}}
      ],
      rewards:{rp:50}
    },
    {
      id:'main_11',type:'main',order:11,title:'A mesma contagem',giver:'icaro',
      description:'Reconstrua um conjunto de espécies com o mesmo número de elétrons.',
      stages:[{text:'Resolva o Portão Isoeletrônico no leste do pântano.',target:'iso_console',req:{type:'puzzle',id:'isoelectronic_gate'}}],
      rewards:{rp:60}
    },
    {
      id:'main_12',type:'main',order:12,title:'Rotas da periodicidade',giver:'celia',
      description:'Ative as estações da crista seguindo as tendências de raio.',
      stages:[{text:'Ative as três estações da Crista Periódica.',target:'ridge_station_1',req:{type:'set',set:'stations',ids:['ridge_station_1','ridge_station_2','ridge_station_3']}}],
      rewards:{rp:70}
    },
    {
      id:'main_13',type:'main',order:13,title:'Os seis selos originais',giver:'prof_dalton',
      description:'Reúna todos os selos que iniciaram a pesquisa do campus.',
      stages:[{text:'Complete os seis santuários originais.',target:'shrine_mix',req:{type:'all_shrines'}}],
      rewards:{rp:85}
    },
    {
      id:'main_14',type:'main',order:14,title:'A câmara dos nobres',giver:'dra_nobre',
      description:'Abra o observatório e encontre a cientista responsável pelo núcleo.',
      stages:[
        {text:'Destrave o portão do Observatório dos Gases Nobres.',target:'observatory_gate',req:{type:'flag',id:'observatory_gate_open'}},
        {text:'Entre no Observatório dos Gases Nobres.',target:'dra_nobre',req:{type:'region',id:'observatory'}}
      ],
      rewards:{rp:55}
    },
    {
      id:'main_15',type:'main',order:15,title:'O núcleo do Campus',giver:'dra_nobre',
      description:'Combine carga, camadas e estabilidade para sincronizar todas as estações.',
      stages:[{text:'Estabilize o núcleo na câmara final.',target:'campus_core',req:{type:'puzzle',id:'campus_core'}}],
      rewards:{rp:110,items:{noble_gas_core:1}}
    },
    {
      id:'main_16',type:'main',order:16,title:'Certificação expandida',giver:'prof_dalton',
      description:'Registre a conclusão da pesquisa com o Prof. Dalton.',
      stages:[{text:'Volte ao Prof. Dalton para receber a certificação.',target:'prof_dalton',req:{type:'flag',id:'final_certificate'}}],
      rewards:{rp:150}
    }
  ];

  const SIDE_MISSIONS = [
    {
      id:'side_01',type:'side',title:'Páginas ao vento',giver:'lina',prereq:[],
      description:'Três páginas do catálogo foram espalhadas perto do laboratório.',
      stages:[
        {text:'Recupere 3 páginas de catálogo.',req:{type:'set',set:'collectedObjects',ids:['side_note_1','side_note_2','side_note_3']}},
        {text:'Entregue as páginas para Lina.',req:{type:'turnin',npc:'lina'}}
      ],
      rewards:{rp:35,items:{research_log:1}}
    },
    {
      id:'side_02',type:'side',title:'Catálogo de campo',giver:'maya',prereq:['main_08'],
      description:'Amplie o catálogo com amostras encontradas em regiões diferentes.',
      stages:[
        {text:'Descubra pelo menos 8 elementos.',req:{type:'sample_count',count:8}},
        {text:'Mostre o catálogo para Maya.',req:{type:'turnin',npc:'maya'}}
      ],
      rewards:{rp:55,items:{stable_core_piece:1}}
    },
    {
      id:'side_03',type:'side',title:'Olho para o espectro',giver:'dra_nobre',prereq:['main_14'],
      description:'Repare o telescópio auxiliar com uma lente de espectroscopia.',
      stages:[
        {text:'Encontre a lente e repare o telescópio auxiliar.',req:{type:'flag',id:'telescope_repaired'}},
        {text:'Informe a Dra. Nobre.',req:{type:'turnin',npc:'dra_nobre'}}
      ],
      rewards:{rp:65,items:{stable_core_piece:1}}
    },
    {
      id:'side_04',type:'side',title:'Fila dos raios',giver:'icaro',prereq:['main_06'],
      description:'Organize cápsulas do maior para o menor raio aproximado.',
      stages:[
        {text:'Resolva o organizador de raios do Jardim Iônico.',req:{type:'puzzle',id:'radius_order'}},
        {text:'Conte o resultado para Ícaro.',req:{type:'turnin',npc:'icaro'}}
      ],
      rewards:{rp:45,items:{positive_ion_sample:1,negative_ion_sample:1}}
    },
    {
      id:'side_05',type:'side',title:'Carga sem desvio',giver:'icaro',prereq:['main_07'],
      description:'Leve uma cápsula Na⁺ selada até Lina sem alterar sua carga.',
      acceptItems:{positive_ion_sample:1},
      stages:[
        {text:'Entregue a amostra Na⁺ selada para Lina.',req:{type:'flag',id:'ion_delivered'}},
        {text:'Volte para Ícaro.',req:{type:'turnin',npc:'icaro'}}
      ],
      rewards:{rp:40,items:{charge_stabilizer:1}}
    },
    {
      id:'side_06',type:'side',title:'Luzes entre camadas',giver:'maya',prereq:['main_09'],
      description:'Use o scanner em três sinais eletrônicos escondidos na floresta.',
      stages:[
        {text:'Escaneie os 3 sinais eletrônicos ocultos.',req:{type:'set',set:'scanned',ids:['scan_firefly_a','scan_firefly_b','scan_firefly_c']}},
        {text:'Relate as leituras a Maya.',req:{type:'turnin',npc:'maya'}}
      ],
      rewards:{rp:50,items:{stable_core_piece:1}}
    },
    {
      id:'side_07',type:'side',title:'Cristais com sinal',giver:'icaro',prereq:['main_06'],
      description:'Cataloge cristais positivos e negativos sem removê-los do jardim.',
      stages:[
        {text:'Escaneie 4 cristais carregados.',req:{type:'set',set:'scanned',ids:['crystal_pos_1','crystal_neg_1','crystal_pos_2','crystal_neg_2']}},
        {text:'Mostre as leituras para Ícaro.',req:{type:'turnin',npc:'icaro'}}
      ],
      rewards:{rp:45,items:{periodic_fragment:1}}
    },
    {
      id:'side_08',type:'side',title:'Sinalização antiga',giver:'celia',prereq:['main_02'],
      description:'Restaure quatro placas que orientavam pesquisadores pelo campus.',
      stages:[
        {text:'Examine e restaure 4 placas danificadas.',req:{type:'set',set:'repairedSigns',ids:['broken_sign_1','broken_sign_2','broken_sign_3','broken_sign_4']}},
        {text:'Avise Dona Célia.',req:{type:'turnin',npc:'celia'}}
      ],
      rewards:{rp:45,items:{campus_emblem:1}}
    },
    {
      id:'side_09',type:'side',title:'Cartão fora do bolso',giver:'bento',prereq:['main_02'],
      description:'O cartão pessoal de manutenção caiu perto do Arquivo Sul.',
      stages:[
        {text:'Encontre o cartão de manutenção perdido.',req:{type:'item',id:'maintenance_keycard',count:1}},
        {text:'Devolva o cartão para Bento.',req:{type:'turnin',npc:'bento'}}
      ],
      rewards:{rp:35,items:{conductive_wire:2}}
    },
    {
      id:'side_10',type:'side',title:'Diagrama partido',giver:'celia',prereq:['main_02'],
      description:'Reúna os seis fragmentos de um antigo diagrama periódico.',
      stages:[
        {text:'Encontre 6 fragmentos periódicos.',req:{type:'fragment_count',count:6}},
        {text:'Leve os fragmentos para Dona Célia.',req:{type:'turnin',npc:'celia'}}
      ],
      rewards:{rp:70,items:{campus_emblem:1}}
    },
    {
      id:'side_11',type:'side',title:'Camadas em ordem',giver:'lina',prereq:['main_03'],
      description:'Calibre um visualizador distribuindo elétrons no modelo 2–8–8.',
      stages:[
        {text:'Resolva o treino de distribuição eletrônica no laboratório.',req:{type:'puzzle',id:'shell_distribution'}},
        {text:'Mostre a calibração para Lina.',req:{type:'turnin',npc:'lina'}}
      ],
      rewards:{rp:45,items:{negative_ion_sample:1}}
    }
  ];

  const QUIZZES = {
    trend:{title:'Santuário 1 — Tendências do Raio',items:[
      {q:'No período 3 (Na → Ar), a tendência geral do raio atômico é:',choices:['Aumentar da esquerda para a direita','Diminuir da esquerda para a direita','Permanecer constante'],correct:1,why:'Z efetiva aumenta à direita: a nuvem é puxada e o raio diminui.'},
      {q:'Ao descer um grupo (ex.: Li → Cs), o raio atômico:',choices:['Diminui','Aumenta','Permanece igual'],correct:1,why:'Cada passo adiciona uma camada eletrônica: a distância média aumenta.'},
      {q:'Qual seta melhor representa o aumento do raio na Tabela?',choices:['↑ e →','↓ e ←','↑ e ←'],correct:1,why:'Aumenta para baixo (↓) e para a esquerda (←).'}
    ]},
    ions:{title:'Santuário 2 — Cátions vs Ânions',items:[
      {q:'Compare Cl e Cl⁻. Quem tem raio maior?',choices:['Cl (neutro)','Cl⁻ (ânion)'],correct:1,why:'Ânions ganham elétrons; a repulsão eletrônica cresce e o raio aumenta.'},
      {q:'Compare Na e Na⁺. Quem tem raio maior?',choices:['Na (neutro)','Na⁺ (cátion)'],correct:0,why:'Cátions perdem elétrons: há menor repulsão e, muitas vezes, menos uma camada.'},
      {q:'Mg²⁺ vs Al³⁺, ambos com 10 elétrons: quem é menor?',choices:['Mg²⁺','Al³⁺'],correct:1,why:'Na série isoeletrônica, o maior Z atrai mais: Al³⁺ é menor.'}
    ]},
    iso:{title:'Santuário 3 — Série Isoeletrônica',items:[
      {q:'Ordem correta (maior → menor) para O²⁻, F⁻, Na⁺, Mg²⁺, Al³⁺?',choices:['Al³⁺ > Mg²⁺ > Na⁺ > F⁻ > O²⁻','O²⁻ > F⁻ > Na⁺ > Mg²⁺ > Al³⁺','Na⁺ > F⁻ > O²⁻ > Mg²⁺ > Al³⁺'],correct:1,why:'Todos têm 10 elétrons. Quanto maior Z, menor o raio dentro da série.'},
      {q:'Em séries isoeletrônicas, o que domina a comparação de tamanho?',choices:['Número de nêutrons','Carga nuclear, com a mesma contagem de elétrons','Número quântico magnético'],correct:1,why:'Mantendo o número de elétrons, varia principalmente a atração do núcleo.'}
    ]},
    zeff:{title:'Santuário 4 — Blindagem & Z (conceito)',items:[
      {q:'Por que o raio cresce ao descer no grupo?',choices:['Porque Z diminui','Porque há mais camadas e blindagem','Porque o núcleo perde prótons'],correct:1,why:'Adicionar camadas aumenta a distância e a blindagem.'},
      {q:'O que acontece com o raio ao aumentar a carga positiva do mesmo elemento?',choices:['Aumenta','Diminui','Fica igual'],correct:1,why:'A nuvem restante é atraída com mais força e o raio diminui.'},
      {q:'Qual afirmação é mais correta?',choices:['Z por si só decide o raio','Blindagem modula a atração nuclear','Elétrons não se repelem'],correct:1,why:'Repulsão e blindagem reduzem a atração sentida pelos elétrons de valência.'}
    ]},
    period2:{title:'Santuário 5 — Desafios por Grupo/Período',items:[
      {q:'Quem é maior: P ou S, no mesmo período?',choices:['P','S'],correct:0,why:'No período, o raio diminui à direita: P é maior que S.'},
      {q:'Quem é maior: K ou Na, no mesmo grupo?',choices:['K','Na'],correct:0,why:'Descendo o grupo, cresce o número de camadas: K é maior.'},
      {q:'Quem é maior: Mg²⁺ ou Na⁺, ambos com 10 elétrons?',choices:['Mg²⁺','Na⁺'],correct:1,why:'Mg tem maior Z e puxa mais; portanto Mg²⁺ é menor e Na⁺ é maior.'}
    ]},
    mix:{title:'Santuário 6 — Ordem Mista de Raios',items:[
      {q:'Ordene (maior → menor): S²⁻, Cl⁻, Ar, K⁺.',choices:['S²⁻ > Cl⁻ > Ar > K⁺','Cl⁻ > S²⁻ > Ar > K⁺','Ar > Cl⁻ > S²⁻ > K⁺'],correct:0,why:'Todos têm 18 elétrons; dentro da série, o menor Z produz o maior raio.'},
      {q:'Qual é maior: Si ou Si⁴⁺?',choices:['Si','Si⁴⁺'],correct:0,why:'O cátion Si⁴⁺ é muito menor que o átomo neutro.'},
      {q:'Entre F⁻ e O²⁻, ambos com 10 elétrons, quem é maior?',choices:['F⁻','O²⁻'],correct:1,why:'O oxigênio tem menor Z e atrai menos a mesma quantidade de elétrons.'}
    ]}
  };

  return {
    NEUTRAL_PM,
    ELEMENTS,
    ITEMS,
    RANKS,
    REGIONS,
    NPCS,
    MAIN_MISSIONS,
    SIDE_MISSIONS,
    QUIZZES
  };
})();
